// Tabletop 3D style kit: «an office in miniature». Real desk objects (a paper clip, an eraser,
// a stapler, a folder, a sheet of paper) brought to life as stop motion and photographed like
// a miniature: a raymarcher (WebGL2 fragment shader) with physically-based materials instead
// of clay or felt. What makes it a photograph of small real things and not CG:
//   - materials that say what they are: metal reflects the desk (one traced bounce), rubber
//     and card are matte with their own micro-relief, glossy plastic has a sharp highlight,
//     paper and card carry printed content (a 2D canvas mapped as a texture)
//   - one soft key (a softbox), a warm practical (a desk lamp, a point light) and the table's
//     warm bounce; soft contact shadows and ambient occlusion where things touch the table
//   - a very shallow depth of field (the miniature look): only a slice of the desk is sharp
//   - film grain, a light vignette and the tiny per-drawing unevenness of a real stop-motion
//     shoot (a hair of exposure flicker, sub-millimetre nudges), never a boiling surface
// Units: centimetres (a paper clip is ~3 cm long). The table top is the plane y = 0 by
// convention. Meant to render on the GPU: DBC_GPU=1 (see engine/browser.mjs).
// Global: Tabletop3D.
//
//   const R = Tabletop3D.renderer(env, { scene: GLSL, scale: 0.75, params: 256, band: 240 })
//     scale > 1 supersamples (1.25 smooths thin edges: a sheet of paper, small print);
//     band: the frame is traced in horizontal bands of this many pixels, each finished before
//     the next: one long GPU job per frame makes Chrome reset the GPU (the context is lost
//     and every later frame comes out black)
//   R.render(g, key, { cam, target, fov, focus, aperture, key: [dir, colour, power], … })
//     cam / target / fov: camera (fov in radians, vertical)
//     focus / aperture:   focal distance (cm from the camera) and blur strength: 0.25 is a
//                         miniature, 0.05 an ordinary still life
//     keyDir, keyCol, key, soft: the softbox (direction towards it, colour, power, shadow
//                         sharpness: 6 a big softbox, 20 a small lamp)
//     lampPos, lampCol, lamp, lampReach: the warm practical (a point light; lamp = 0 off)
//     fillCol, fill:      ambient from the room
//     exposure:           a multiplier (the stop-motion flicker goes here: Tabletop3D.flicker)
//     p:                  scene data, read in GLSL with PF(i), P3(i), M3(i), local(p, o)
//     textures:           up to 4 canvases bound as uTex0..uTex3 (re-uploaded only when the
//                         canvas object in a slot changes: swap canvases, don't redraw one)
//     noDof: true         a quicker preview without depth of field
//     debug:              1 albedo, 2 normals, 3 key shadow, 4 occlusion
//     key:                memo key (the drawing index: on twos, pairs of frames share a render)
//   Tabletop3D.post(g, env, d, { grain, vignette })  film grain (per drawing) and vignette,
//                                                     in pixels: call it from the scene's post()
//   Tabletop3D.flicker(d, amount)  the exposure of drawing d (1 ± amount, deterministic)
//   Tabletop3D.nudge(d, seed, amp) a small deterministic offset [x, y, z] per drawing
//   Tabletop3D.V                   column-major 3×3 helpers for rigs (as felt3d)
//
// The scene GLSL defines:
//   vec2  map(vec3 p)                      distance and material id (≥ 1; material 0 marks a
//                                          bounding volume: shadows step over it)
//   vec3  albedo(float m, vec3 p, vec3 n)  colour (sRGB) of material m at p
//   vec4  material(float m)                (roughness, metalness, wrap, bump): wrap lets light
//                                          round the form (rubber, card ≈ 0.2–0.4); bump > 0
//                                          perturbs the normal with relief(m, p) × bump;
//                                          metalness < 0 is a light source (a bulb, a lit
//                                          shade): it glows with −metalness × its albedo
//   float relief(float m, vec3 p)          a height field for the micro-relief (pores, fibres,
//                                          brushing); return 0.0 when a material has none
//   optional: #define HAS_ENVIRONMENT and vec3 environment(vec3 rd) (linear colour) for what
//   metal reflects outside the scene; the default is a dim warm room with the softbox in it.
// Prelude: sdSphere, sdEllipsoid, sdBox, sdRoundBox, sdCapsule, sdRoundCone, sdCappedCylinder,
// sdCylinder, sdTorus, sdExtrude (a 2D distance pushed into a slab with rounded edges),
// smin, smax, opU, opSU, rot, hash, noise, fbm, woodGrain, fibres, P3, M3, local.
const Tabletop3D = (() => {
    const PRELUDE = (n) => `#version 300 es
precision highp float;
uniform vec2 uRes;
layout(std140) uniform Data { vec4 uP4[${Math.ceil(n / 4)}]; };
float PF(int i) { return uP4[i >> 2][i & 3]; }
uniform sampler2D uTex0, uTex1, uTex2, uTex3;
uniform float uBoil;
uniform vec3 uCamPos, uCamTarget, uKeyDir, uKeyCol, uLampPos, uLampCol, uFillCol;
uniform float uKey, uSoft, uLamp, uLampReach, uFill, uFov, uFocus, uAperture, uExposure, uDebug;
out vec4 fragColor;

float sdSphere(vec3 p, float r) { return length(p) - r; }
float sdEllipsoid(vec3 p, vec3 r) { float k0 = length(p / r); float k1 = length(p / (r * r)); return k0 * (k0 - 1.0) / k1; }
float sdBox(vec3 p, vec3 b) { vec3 q = abs(p) - b; return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0); }
float sdRoundBox(vec3 p, vec3 b, float r) { vec3 q = abs(p) - b + r; return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0) - r; }
float sdCapsule(vec3 p, vec3 a, vec3 b, float r) { vec3 pa = p - a, ba = b - a; float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0); return length(pa - ba * h) - r; }
float sdRoundCone(vec3 p, vec3 a, vec3 b, float r1, float r2) {
    vec3 ba = b - a; float l2 = dot(ba, ba); float rr = r1 - r2; float a2 = l2 - rr * rr; float il2 = 1.0 / l2;
    vec3 pa = p - a; float y = dot(pa, ba); float z = y - l2; vec3 xv = pa * l2 - ba * y; float x2 = dot(xv, xv);
    float y2 = y * y * l2; float z2 = z * z * l2; float k = sign(rr) * rr * rr * x2;
    if (sign(z) * a2 * z2 > k) return sqrt(x2 + z2) * il2 - r2;
    if (sign(y) * a2 * y2 < k) return sqrt(x2 + y2) * il2 - r1;
    return (sqrt(x2 * a2 * il2) + y * rr) * il2 - r1;
}
float sdCappedCylinder(vec3 p, vec3 a, vec3 b, float r) {
    vec3 ba = b - a, pa = p - a; float baba = dot(ba, ba), paba = dot(pa, ba);
    float x = length(pa * baba - ba * paba) - r * baba, y = abs(paba - baba * 0.5) - baba * 0.5;
    float x2 = x * x, y2 = y * y * baba;
    float d = (max(x, y) < 0.0) ? -min(x2, y2) : (((x > 0.0) ? x2 : 0.0) + ((y > 0.0) ? y2 : 0.0));
    return sign(d) * sqrt(abs(d)) / baba;
}
// a vertical cylinder of half-height h and radius r, centred at the origin
float sdCylinder(vec3 p, float h, float r) { vec2 d = abs(vec2(length(p.xz), p.y)) - vec2(r, h); return min(max(d.x, d.y), 0.0) + length(max(d, 0.0)); }
float sdTorus(vec3 p, vec2 t) { vec2 q = vec2(length(p.xz) - t.x, p.y); return length(q) - t.y; }
// a 2D shape (its signed distance d2 in the xy plane) pushed into a slab |z| < h, edges
// rounded by r: die-cut erasers, card, a cookie-cutter shape
float sdExtrude(float d2, float z, float h, float r) { vec2 w = vec2(d2 + r, abs(z) - h + r); return min(max(w.x, w.y), 0.0) + length(max(w, 0.0)) - r; }
float smin(float a, float b, float k) { float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0); return mix(b, a, h) - k * h * (1.0 - h); }
float smax(float a, float b, float k) { return -smin(-a, -b, k); }
vec2 opU(vec2 a, vec2 b) { return a.x < b.x ? a : b; }
vec2 opSU(vec2 a, vec2 b, float k) { float h = clamp(0.5 + 0.5 * (b.x - a.x) / k, 0.0, 1.0); return vec2(mix(b.x, a.x, h) - k * h * (1.0 - h), a.x < b.x ? a.y : b.y); }
mat2 rot(float a) { float c = cos(a), s = sin(a); return mat2(c, -s, s, c); }
float hash(vec3 p) { p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float noise(vec3 x) {
    vec3 i = floor(x), f = fract(x); f = f * f * (3.0 - 2.0 * f);
    return mix(mix(mix(hash(i), hash(i + vec3(1, 0, 0)), f.x), mix(hash(i + vec3(0, 1, 0)), hash(i + vec3(1, 1, 0)), f.x), f.y),
               mix(mix(hash(i + vec3(0, 0, 1)), hash(i + vec3(1, 0, 1)), f.x), mix(hash(i + vec3(0, 1, 1)), hash(i + vec3(1, 1, 1)), f.x), f.y), f.z);
}
float fbm(vec3 p) { float s = 0.0, a = 0.5; for (int i = 0; i < 4; i++) { s += a * noise(p); p *= 2.03; a *= 0.5; } return s; }
// wood: growth rings bent by noise along the board (x), 0..1 (latewood near 1)
float woodGrain(vec3 p) {
    float r = p.z * 1.7 + fbm(vec3(p.x * 0.08, p.y * 0.6, p.z * 0.6)) * 3.0 + noise(vec3(p.x * 0.02, 0.0, p.z)) * 2.0;
    float ring = fract(r);
    return smoothstep(0.0, 0.15, ring) * smoothstep(1.0, 0.55, ring) * 0.6 + noise(vec3(p.x * 0.5, p.y * 40.0, p.z * 40.0)) * 0.25;
}
// paper and card: short fibres at random angles, 0..1
float fibres(vec3 p) { return noise(p * vec3(60.0, 18.0, 60.0)) * 0.5 + noise(p.zxy * vec3(55.0, 17.0, 55.0)) * 0.5; }
vec3 P3(int i) { return vec3(PF(i), PF(i + 1), PF(i + 2)); }
mat3 M3(int i) { return mat3(PF(i), PF(i + 1), PF(i + 2), PF(i + 3), PF(i + 4), PF(i + 5), PF(i + 6), PF(i + 7), PF(i + 8)); }
// p in the frame stored at PF(o): origin, then a column-major rotation (local → world)
vec3 local(vec3 p, int o) { return transpose(M3(o + 3)) * (p - P3(o)); }
`;
    const MAIN = `
#ifndef HAS_ENVIRONMENT
// what metal and gloss reflect outside the scene: a dim warm room, the softbox as a bright
// panel in the key's direction and the lamp as a warm spot (linear colour)
vec3 environment(vec3 rd) {
    // a studio room: dark floor, lit walls, a bright ceiling; the softbox a big bright panel
    vec3 c = mix(vec3(0.07, 0.06, 0.05), vec3(0.42, 0.4, 0.37), smoothstep(-0.25, 0.45, rd.y));
    c = mix(c, vec3(0.62, 0.6, 0.58), smoothstep(0.55, 0.95, rd.y));
    vec3 k = normalize(uKeyDir);
    c += uKeyCol * uKey * 1.6 * smoothstep(0.8, 0.9, dot(rd, k));
    if (uLamp > 0.0) c += uLampCol * 0.9 * smoothstep(0.985, 0.998, dot(rd, normalize(uLampPos - uCamTarget)));
    return c;
}
#endif
vec3 calcNormal(vec3 p, float t) {
    vec2 e = vec2(1.0, -1.0) * (0.0012 + 0.00006 * t);
    return normalize(e.xyy * map(p + e.xyy).x + e.yyx * map(p + e.yyx).x + e.yxy * map(p + e.yxy).x + e.xxx * map(p + e.xxx).x);
}
// soft shadow, the plain estimate (h / t): smooth unions and ellipsoids give inexact distances
// and the «improved» estimate reads them as full shadow
float softShadow(vec3 ro, vec3 rd, float soft) {
    float res = 1.0, t = 0.02;
    for (int i = 0; i < 110; i++) {
        vec2 hm = map(ro + rd * t);
        float h = hm.x;
        if (hm.y > 0.5) res = min(res, soft * h / t); // material 0 = a bound: casts nothing
        t += clamp(h, 0.01, 0.8);
        if (res < 0.003 || t > 60.0) break;
    }
    res = clamp(res, 0.0, 1.0);
    return res * res * (3.0 - 2.0 * res);
}
// contact occlusion: where things touch or sit close, a few mm deep
float calcAO(vec3 p, vec3 n) {
    float o = 0.0, s = 1.0;
    for (int i = 0; i < 5; i++) { float h = 0.03 + 0.14 * float(i); vec2 mh = map(p + n * h); if (mh.y > 0.5) o += (h - mh.x) * s; s *= 0.72; }
    return clamp(1.0 - 1.6 * o, 0.0, 1.0);
}
float D_GGX(float nh, float a) { float a2 = a * a; float d = nh * nh * (a2 - 1.0) + 1.0; return a2 / (3.14159 * d * d); }
float V_Smith(float nv, float nl, float a) { float k = a * 0.5; return 0.25 / ((nv * (1.0 - k) + k) * (nl * (1.0 - k) + k)); }
vec3 F_Schlick(vec3 f0, float c) { return f0 + (1.0 - f0) * pow(1.0 - c, 5.0); }
struct Surf { vec3 alb; vec3 n; float rough; float metal; float wrap; };
Surf surface(vec3 p, vec3 n, float m) {
    vec4 mt = material(m);
    if (mt.w > 0.0) {
        const float e = 0.004;
        vec3 gr = vec3(relief(m, p + vec3(e, 0, 0)) - relief(m, p - vec3(e, 0, 0)), relief(m, p + vec3(0, e, 0)) - relief(m, p - vec3(0, e, 0)), relief(m, p + vec3(0, 0, e)) - relief(m, p - vec3(0, 0, e))) / (2.0 * e);
        n = normalize(n - mt.w * (gr - n * dot(gr, n)));
    }
    return Surf(pow(albedo(m, p, n), vec3(2.2)), n, mt.x, mt.y, mt.z);
}
// the direct light of the key and the lamp on a surface (linear colour)
vec3 direct(Surf s, vec3 p, vec3 v, float sh, float occ) {
    vec3 f0 = mix(vec3(0.04), s.alb, max(s.metal, 0.0));
    vec3 dif = s.alb * (1.0 - max(s.metal, 0.0));
    float nv = max(dot(s.n, v), 1e-3);
    // the softbox is big: its highlight is never a pin
    float a = max(s.rough * s.rough, 0.045);
    vec3 L = normalize(uKeyDir);
    float ndl = dot(s.n, L), nl = max(ndl, 0.0);
    float wr = max((ndl + s.wrap) / (1.0 + s.wrap), 0.0);
    vec3 H = normalize(L + v);
    vec3 spec = D_GGX(max(dot(s.n, H), 0.0), a) * V_Smith(nv, nl, a) * F_Schlick(f0, max(dot(v, H), 0.0)) * nl;
    vec3 col = (dif * wr + spec) * uKeyCol * uKey * mix(sh, 1.0, 0.06);
    if (uLamp > 0.0) {
        vec3 lv = uLampPos - p; float ld = length(lv); vec3 Ll = lv / ld;
        float att = uLamp / (1.0 + ld * ld / (uLampReach * uLampReach));
        float nll = max(dot(s.n, Ll), 0.0);
        vec3 H2 = normalize(Ll + v);
        vec3 spec2 = D_GGX(max(dot(s.n, H2), 0.0), max(a, 0.02)) * V_Smith(nv, nll, a) * F_Schlick(f0, max(dot(v, H2), 0.0)) * nll;
        col += (dif * max((dot(s.n, Ll) + s.wrap) / (1.0 + s.wrap), 0.0) + spec2) * uLampCol * att * mix(occ, 1.0, 0.5);
    }
    col += dif * uFillCol * uFill * (0.55 + 0.45 * s.n.y) * occ;
    col += dif * vec3(0.6, 0.42, 0.28) * uFill * 0.3 * clamp(0.5 - 0.5 * s.n.y, 0.0, 1.0) * occ; // the table's warm bounce
    return col;
}
// what a reflected ray sees: the scene lit without shadows, or the room
vec3 reflected(vec3 ro, vec3 rd) {
    float t = 0.03, m = -1.0;
    for (int i = 0; i < 90; i++) {
        vec2 h = map(ro + rd * t);
        if (h.x < 0.001 * t) { m = h.y; break; }
        t += h.x * 0.95;
        if (t > 60.0) break;
    }
    if (m < 0.5) return environment(rd);
    vec3 p = ro + rd * t;
    Surf s = surface(p, calcNormal(p, t), m);
    if (s.metal < 0.0) return s.alb * -s.metal;
    return direct(s, p, -rd, 1.0, 0.8) + environment(reflect(rd, s.n)) * mix(vec3(0.04), s.alb, s.metal) * 0.5;
}
void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
    vec3 ww = normalize(uCamTarget - uCamPos), uu = normalize(cross(ww, vec3(0, 1, 0))), vv = cross(uu, ww);
    vec3 rd = normalize(uv.x * uu + uv.y * vv + (0.5 / tan(abs(uFov) * 0.5)) * ww);
    vec3 ro = uCamPos;
    float t = 0.1, m = -1.0;
    for (int i = 0; i < 240; i++) {
        vec2 h = map(ro + rd * t);
        if (h.x < 0.0002 * t) { m = h.y; break; }
        t += h.x * 0.9;
        if (t > 400.0) break;
    }
    vec3 col;
    if (m < 0.5) { col = environment(rd); t = 400.0; }
    else {
        vec3 p = ro + rd * t;
        vec3 n0 = calcNormal(p, t);
        Surf s = surface(p, n0, m);
        float sh = softShadow(p + n0 * 0.012, normalize(uKeyDir), uSoft);
        float occ = calcAO(p, n0);
        if (s.metal < 0.0) col = s.alb * -s.metal; // a light source
        else if (uDebug == 1.0) col = s.alb;
        else if (uDebug == 2.0) col = pow(s.n * 0.5 + 0.5, vec3(2.2));
        else if (uDebug == 3.0) col = vec3(sh);
        else if (uDebug == 4.0) col = vec3(occ);
        else {
            col = direct(s, p, -rd, sh, occ);
            // reflections: metal and gloss trace one bounce; rough things only catch the room
            vec3 f0 = mix(vec3(0.04), s.alb, s.metal);
            float nv = max(dot(s.n, -rd), 1e-3);
            vec3 fr = f0 + (max(vec3(1.0 - s.rough), f0) - f0) * pow(1.0 - nv, 5.0);
            vec3 R = reflect(rd, s.n);
            vec3 refl = s.rough < 0.5 ? reflected(p + n0 * 0.01, normalize(R + (vec3(hash(p * 91.0), hash(p * 57.0 + 3.0), hash(p * 33.0 + 7.0)) - 0.5) * s.rough * 0.35)) : environment(R);
            // rough reflections fade towards the room's average
            refl = mix(refl, vec3(0.12, 0.11, 0.1) * (0.6 + 0.4 * s.n.y), smoothstep(0.1, 0.6, s.rough));
            col += refl * fr * occ * mix(1.0 - s.rough * 0.7, 1.0, s.metal);
        }
    }
    col *= uExposure;
    // filmic tone (a soft shoulder, rich mid-tones), back to sRGB
    col = (col * (2.51 * col + 0.03)) / (col * (2.43 * col + 0.59) + 0.14);
    col = pow(clamp(col, 0.0, 1.0), vec3(1.0 / 2.2));
    // the blur this pixel needs (signed: < 0 in front of the focus), stored in alpha
    float cs = clamp(uAperture * (1.0 / uFocus - 1.0 / max(t, 0.05)) * uRes.y * 2.0, -20.0, 20.0);
    float dn = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - 0.5;
    fragColor = vec4(col + dn * 1.5 / 255.0, 0.5 + cs / 40.0);
    if (uFov < 0.0) fragColor.a = 1.0; // noDof: straight to the canvas
}
`;
    // depth of field: gather around each pixel, the radius from the circle of confusion. What
    // is in front of the focus spills over what is behind it (the near bokeh covers the edge)
    const DOF = `#version 300 es
precision highp float;
uniform sampler2D uTex;
uniform vec2 uRes;
out vec4 fragColor;
float sc(float a) { return (a - 0.5) * 40.0; } // signed blur radius, px
void main() {
    vec2 uv = gl_FragCoord.xy / uRes;
    vec4 c0 = texture(uTex, uv);
    float s0 = sc(c0.a), r0 = abs(s0);
    vec3 acc = c0.rgb; float w = 1.0;
    const float GA = 2.39996;
    for (int i = 1; i < 72; i++) {
        float fi = float(i), r = sqrt(fi / 72.0) * 20.0;
        vec2 o = vec2(cos(fi * GA), sin(fi * GA)) * r;
        vec4 s = texture(uTex, uv + o / uRes);
        float ss = sc(s.a), rs = abs(ss);
        float k = smoothstep(r - 1.0, r + 1.0, ss < s0 ? rs : min(rs, r0));
        // bright out-of-focus points bloom a little (bokeh)
        float b = 1.0 + 1.5 * smoothstep(0.75, 1.0, dot(s.rgb, vec3(0.33))) * smoothstep(2.0, 8.0, rs);
        acc += s.rgb * k * b; w += k * b;
    }
    float dn = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - 0.5;
    fragColor = vec4(acc / w + dn * 1.5 / 255.0, 1.0);
}
`;
    const VS = `#version 300 es
in vec2 p;
void main() { gl_Position = vec4(p, 0.0, 1.0); }
`;
    function renderer(env, o) {
        const scale = o.scale ?? 0.75, N = o.params ?? 256;
        const W = Math.round(env.px[0] * scale), H = Math.round(env.px[1] * scale);
        const cv = document.createElement('canvas');
        cv.width = W;
        cv.height = H;
        const gl = cv.getContext('webgl2', { preserveDrawingBuffer: true, antialias: false });
        if (!gl) throw new Error('Tabletop3D: no WebGL2');
        let lost = false;
        cv.addEventListener('webglcontextlost', () => (lost = true));
        const band = o.band ?? 240;
        // draws the bound program over the frame, band by band, waiting for each
        const drawBands = () => {
            gl.enable(gl.SCISSOR_TEST);
            for (let y = 0; y < H; y += band) {
                gl.scissor(0, y, W, Math.min(band, H - y));
                gl.drawArrays(gl.TRIANGLES, 0, 3);
                gl.finish();
            }
            gl.disable(gl.SCISSOR_TEST);
        };
        const compile = (type, src) => {
            const s = gl.createShader(type);
            gl.shaderSource(s, src);
            gl.compileShader(s);
            if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error('Tabletop3D shader: ' + gl.getShaderInfoLog(s));
            return s;
        };
        const program = (fs) => {
            const p = gl.createProgram();
            gl.attachShader(p, compile(gl.VERTEX_SHADER, VS));
            gl.attachShader(p, compile(gl.FRAGMENT_SHADER, fs));
            gl.bindAttribLocation(p, 0, 'p');
            gl.linkProgram(p);
            if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error('Tabletop3D link: ' + gl.getProgramInfoLog(p));
            return p;
        };
        const P1 = program(PRELUDE(N) + o.scene + MAIN), P2 = program(DOF);
        const buf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
        const texParams = () => {
            for (const [k, v] of [[gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR], [gl.TEXTURE_MAG_FILTER, gl.LINEAR], [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE]]) gl.texParameteri(gl.TEXTURE_2D, k, v);
        };
        // the frame before depth of field (colour + signed blur in alpha)
        const tex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, W, H, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        for (const [k, v] of [[gl.TEXTURE_MIN_FILTER, gl.LINEAR], [gl.TEXTURE_MAG_FILTER, gl.LINEAR], [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE]]) gl.texParameteri(gl.TEXTURE_2D, k, v);
        const fb = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
        // the scene's textures (printed paper, labels): 4 slots, units 1..4
        const slots = [0, 1, 2, 3].map(() => ({ tex: gl.createTexture(), src: null }));
        for (const s of slots) {
            gl.bindTexture(gl.TEXTURE_2D, s.tex);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255, 255, 255, 255]));
            texParams();
        }
        const U1 = (n) => gl.getUniformLocation(P1, n), U2 = (n) => gl.getUniformLocation(P2, n);
        const N4 = Math.ceil(N / 4) * 4;
        const ubo = gl.createBuffer();
        gl.bindBuffer(gl.UNIFORM_BUFFER, ubo);
        gl.bufferData(gl.UNIFORM_BUFFER, N4 * 4, gl.DYNAMIC_DRAW);
        gl.uniformBlockBinding(P1, gl.getUniformBlockIndex(P1, 'Data'), 0);
        gl.bindBufferBase(gl.UNIFORM_BUFFER, 0, ubo);
        const memo = document.createElement('canvas');
        memo.width = W;
        memo.height = H;
        let memoKey = null;
        return {
            W, H, canvas: memo,
            render(g, key, f) {
                if (key !== memoKey) {
                    // textures: upload only a canvas that is new in its slot
                    (f.textures ?? []).forEach((c, i) => {
                        if (!c || slots[i].src === c) return;
                        gl.activeTexture(gl.TEXTURE1 + i);
                        gl.bindTexture(gl.TEXTURE_2D, slots[i].tex);
                        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
                        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, c);
                        gl.generateMipmap(gl.TEXTURE_2D);
                        slots[i].src = c;
                    });
                    gl.viewport(0, 0, W, H);
                    gl.bindFramebuffer(gl.FRAMEBUFFER, f.noDof ? null : fb);
                    gl.useProgram(P1);
                    for (let i = 0; i < 4; i++) {
                        gl.activeTexture(gl.TEXTURE1 + i);
                        gl.bindTexture(gl.TEXTURE_2D, slots[i].tex);
                        gl.uniform1i(U1('uTex' + i), 1 + i);
                    }
                    gl.uniform2f(U1('uRes'), W, H);
                    const a = new Float32Array(N4);
                    (f.p ?? []).forEach((v, i) => (a[i] = v));
                    gl.bindBuffer(gl.UNIFORM_BUFFER, ubo);
                    gl.bufferSubData(gl.UNIFORM_BUFFER, 0, a);
                    gl.uniform1f(U1('uBoil'), f.boil ?? 0);
                    gl.uniform3fv(U1('uCamPos'), f.cam);
                    gl.uniform3fv(U1('uCamTarget'), f.target);
                    gl.uniform3fv(U1('uKeyDir'), f.keyDir ?? [-0.55, 0.75, 0.5]);
                    gl.uniform3fv(U1('uKeyCol'), f.keyCol ?? [1.0, 0.95, 0.88]);
                    gl.uniform1f(U1('uKey'), f.key ?? 2.2);
                    gl.uniform1f(U1('uSoft'), f.soft ?? 7);
                    gl.uniform3fv(U1('uLampPos'), f.lampPos ?? [20, 30, 0]);
                    gl.uniform3fv(U1('uLampCol'), f.lampCol ?? [1.0, 0.62, 0.3]);
                    gl.uniform1f(U1('uLamp'), f.lamp ?? 0);
                    gl.uniform1f(U1('uLampReach'), f.lampReach ?? 20);
                    gl.uniform3fv(U1('uFillCol'), f.fillCol ?? [0.62, 0.66, 0.74]);
                    gl.uniform1f(U1('uFill'), f.fill ?? 0.45);
                    gl.uniform1f(U1('uFov'), f.noDof ? -(f.fov ?? 0.5) : (f.fov ?? 0.5));
                    gl.uniform1f(U1('uFocus'), f.focus ?? 30);
                    gl.uniform1f(U1('uAperture'), f.aperture ?? 0.25);
                    gl.uniform1f(U1('uExposure'), f.exposure ?? 1);
                    gl.uniform1f(U1('uDebug'), f.debug ?? 0);
                    drawBands();
                    if (!f.noDof) {
                        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
                        gl.useProgram(P2);
                        gl.activeTexture(gl.TEXTURE0);
                        gl.bindTexture(gl.TEXTURE_2D, tex);
                        gl.uniform1i(U2('uTex'), 0);
                        gl.uniform2f(U2('uRes'), W, H);
                        drawBands();
                    }
                    if (lost || gl.isContextLost()) throw new Error('Tabletop3D: the WebGL context was lost (the GPU was reset): lower `scale` or `band`');
                    const m = memo.getContext('2d');
                    m.clearRect(0, 0, W, H);
                    m.drawImage(cv, 0, 0);
                    memoKey = key;
                }
                g.save();
                g.setTransform(1, 0, 0, 1, 0, 0);
                g.imageSmoothingQuality = 'high';
                g.drawImage(memo, 0, 0, env.px[0], env.px[1]);
                g.restore();
            },
        };
    }
    // film grain and vignette, in pixels, per drawing: three grain plates cycled so the grain
    // lives like film without boiling the image under it
    const grainPlates = new Map();
    function grainPlate(w, h, i) {
        const k = w + 'x' + h + ':' + i;
        if (grainPlates.has(k)) return grainPlates.get(k);
        const c = document.createElement('canvas');
        c.width = w;
        c.height = h;
        const x = c.getContext('2d');
        const img = x.createImageData(w, h);
        const r = Motion.rng('tabletop-grain-' + i);
        for (let p = 0; p < w * h; p++) {
            // a soft, roughly gaussian grain around mid grey
            const v = 128 + ((r() + r() + r()) / 3 - 0.5) * 2 * 60;
            img.data[p * 4] = img.data[p * 4 + 1] = img.data[p * 4 + 2] = v;
            img.data[p * 4 + 3] = 255;
        }
        x.putImageData(img, 0, 0);
        grainPlates.set(k, c);
        return c;
    }
    function post(g, env, d, o = {}) {
        const [w, h] = env.px;
        g.save();
        g.setTransform(1, 0, 0, 1, 0, 0);
        const vig = o.vignette ?? 0.28;
        if (vig > 0) {
            const gr = g.createRadialGradient(w / 2, h * 0.48, Math.min(w, h) * 0.35, w / 2, h * 0.48, Math.hypot(w, h) * 0.62);
            gr.addColorStop(0, 'rgba(0,0,0,0)');
            gr.addColorStop(1, `rgba(12,8,4,${vig})`);
            g.fillStyle = gr;
            g.fillRect(0, 0, w, h);
        }
        const amt = o.grain ?? 0.07;
        if (amt > 0) {
            // the plate is half resolution, scaled up: film grain is a little softer than pixels
            const plate = grainPlate(Math.ceil(w / 2), Math.ceil(h / 2), ((d % 3) + 3) % 3);
            g.globalCompositeOperation = 'overlay';
            g.globalAlpha = amt * 2.5;
            g.imageSmoothingEnabled = true;
            g.drawImage(plate, 0, 0, w, h);
        }
        g.restore();
    }
    // stop-motion unevenness: deterministic per drawing, tiny
    const h01 = (d, seed) => Motion.rng(seed + ':' + d)();
    const flicker = (d, amount = 0.006) => 1 + (h01(d, 'flicker') - 0.5) * 2 * amount;
    const nudge = (d, seed, amp = 0.01) => [0, 1, 2].map((i) => (h01(d, seed + i) - 0.5) * 2 * amp);
    // small linear algebra for rigs (column-major 3×3, as the shader reads them)
    const V = {
        add: (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]],
        sub: (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]],
        mul: (a, s) => [a[0] * s, a[1] * s, a[2] * s],
        dot: (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2],
        len: (a) => Math.hypot(a[0], a[1], a[2]),
        norm: (a) => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; },
        cross: (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]],
        lerp: (a, b, u) => [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u],
        // R · v
        app: (R, v) => [R[0] * v[0] + R[3] * v[1] + R[6] * v[2], R[1] * v[0] + R[4] * v[1] + R[7] * v[2], R[2] * v[0] + R[5] * v[1] + R[8] * v[2]],
        mm(A, B) {
            const o = new Array(9);
            for (let c = 0; c < 3; c++) for (let r = 0; r < 3; r++) o[c * 3 + r] = A[r] * B[c * 3] + A[3 + r] * B[c * 3 + 1] + A[6 + r] * B[c * 3 + 2];
            return o;
        },
        rx: (a) => { const c = Math.cos(a), s = Math.sin(a); return [1, 0, 0, 0, c, s, 0, -s, c]; },
        ry: (a) => { const c = Math.cos(a), s = Math.sin(a); return [c, 0, -s, 0, 1, 0, s, 0, c]; },
        rz: (a) => { const c = Math.cos(a), s = Math.sin(a); return [c, s, 0, -s, c, 0, 0, 0, 1]; },
        I: [1, 0, 0, 0, 1, 0, 0, 0, 1],
    };
    // a two-bone limb: shoulder s, target hand h, bone lengths a and b, pole direction
    // (where the elbow points). Returns the elbow; the hand is clamped to the reach.
    function ik(s, h, a, b, pole) {
        let d = V.sub(h, s);
        let L = V.len(d);
        const maxL = (a + b) * 0.999, minL = Math.abs(a - b) * 1.001 + 1e-4;
        if (L > maxL) { d = V.mul(d, maxL / L); L = maxL; }
        if (L < minL) { d = V.mul(V.norm(d), minL); L = minL; }
        const dir = V.norm(d);
        const x = (a * a - b * b + L * L) / (2 * L);
        const y = Math.sqrt(Math.max(a * a - x * x, 0));
        const pp = V.norm(V.sub(pole, V.mul(dir, V.dot(pole, dir))));
        return { elbow: V.add(V.add(s, V.mul(dir, x)), V.mul(pp, y)), hand: V.add(s, d) };
    }
    return { renderer, post, flicker, nudge, V, ik };
})();
