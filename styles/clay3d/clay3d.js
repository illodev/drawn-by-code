// Clay 3D style kit: a small raymarcher (WebGL2 fragment shader) for plasticine in a lit
// table-top set: shapes are signed distance functions pressed together with smooth unions
// (literally how clay characters are built: balls and sausages), a warm key light with soft
// shadows, ambient occlusion, a wax-like translucency on skin, sharp highlights on glossy
// things (eyes, glasses), fingerprints and tool marks as a bump, depth of field.
// Global: Clay3D.
//
//   const R = Clay3D.renderer(env, { scene: GLSL, scale: 0.6 })
//   R.render(g, key, { cam: [x,y,z], target: [x,y,z], fov, focus, aperture, light: [x,y,z],
//                     a: [floats…] })       draws the frame on g (logical units, full frame)
//     soft: shadow edge (12 a lamp, 4 a big softbox), fill: ambient (0.38), key: key light (2.3)
//     noDof: true renders without depth of field (a quicker preview)
//     key: memo key (the drawing index: on twos, frame pairs share one render)
//     a:   up to 95 floats for the scene's animation (uniform float uA[96]); uA[95] is the
//          boil (the drawing's variant: Clay3D moves the fingerprints with it)
//
// The scene GLSL defines (see the style test sandbox/2026-09-24-clay3d-test/):
//   vec2  map(vec3 p)                      distance and material id (≥ 1; material 0 marks
//                                          a bounding volume: skipped by soft shadows)
//   vec3  albedo(float m, vec3 p, vec3 n)  colour (sRGB) of material m at p
//   vec4  material(float m)                (specular, shininess, translucency, bump)
//   vec3  background(vec3 rd)              colour where nothing is hit
// The prelude gives: sdSphere, sdEllipsoid, sdCapsule, sdRoundCone, sdRoundBox, sdTorus,
// sdCylinder, sdCappedCylinder, smin, smax, opU (union with material), opSU (smooth union keeping the nearer
// material), rot (2D rotation), hash/noise/fbm, lumps (hand-made unevenness to add to a
// distance), speckle (pigment dots for albedo), and the uniforms uT, uA[96].
const Clay3D = (() => {
    const PRELUDE = `#version 300 es
precision highp float;
uniform vec2 uRes;
uniform float uT;
uniform float uA[96];
uniform vec3 uCamPos, uCamTarget, uLight;
uniform float uSoft, uFill, uKey;
uniform float uFov, uFocus, uAperture;
out vec4 fragColor;

float sdSphere(vec3 p, float r) { return length(p) - r; }
float sdEllipsoid(vec3 p, vec3 r) { float k0 = length(p / r); float k1 = length(p / (r * r)); return k0 * (k0 - 1.0) / k1; }
float sdCapsule(vec3 p, vec3 a, vec3 b, float r) { vec3 pa = p - a, ba = b - a; float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0); return length(pa - ba * h) - r; }
float sdRoundCone(vec3 p, vec3 a, vec3 b, float r1, float r2) {
    vec3 ba = b - a; float l2 = dot(ba, ba); float rr = r1 - r2; float a2 = l2 - rr * rr; float il2 = 1.0 / l2;
    vec3 pa = p - a; float y = dot(pa, ba); float z = y - l2; vec3 xv = pa * l2 - ba * y; float x2 = dot(xv, xv);
    float y2 = y * y * l2; float z2 = z * z * l2; float k = sign(rr) * rr * rr * x2;
    if (sign(z) * a2 * z2 > k) return sqrt(x2 + z2) * il2 - r2;
    if (sign(y) * a2 * y2 < k) return sqrt(x2 + y2) * il2 - r1;
    return (sqrt(x2 * a2 * il2) + y * rr) * il2 - r1;
}
float sdRoundBox(vec3 p, vec3 b, float r) { vec3 q = abs(p) - b + r; return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0) - r; }
float sdTorus(vec3 p, vec2 t) { vec2 q = vec2(length(p.xz) - t.x, p.y); return length(q) - t.y; }
// a cylinder between two points (a cuff round a forearm, a wheel on an axle)
float sdCappedCylinder(vec3 p, vec3 a, vec3 b, float r) {
    vec3 ba = b - a, pa = p - a; float baba = dot(ba, ba), paba = dot(pa, ba);
    float x = length(pa * baba - ba * paba) - r * baba, y = abs(paba - baba * 0.5) - baba * 0.5;
    float x2 = x * x, y2 = y * y * baba;
    float d = (max(x, y) < 0.0) ? -min(x2, y2) : (((x > 0.0) ? x2 : 0.0) + ((y > 0.0) ? y2 : 0.0));
    return sign(d) * sqrt(abs(d)) / baba;
}
float sdCylinder(vec3 p, float h, float r) { vec2 d = abs(vec2(length(p.xz), p.y)) - vec2(r, h); return min(max(d.x, d.y), 0.0) + length(max(d, 0.0)); }
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
// hand-made unevenness: add to a clay piece's distance (amp ≈ 0.006–0.015 for a head)
float lumps(vec3 p, float amp) { return amp * (noise(p * 4.5) + 0.5 * noise(p * 11.0) - 0.75) * 1.6; }
// fine pigment speckle and dust for albedo (0..1, mostly 0)
float speckle(vec3 p) { return step(0.93, hash(floor(p * 260.0))) * 0.6 + step(0.985, hash(floor(p * 90.0) + 3.1)); }
`;
    const MAIN = `
// fingerprints and tool marks: a fine noise plus sparse ridged whorls
float clayRelief(vec3 p) {
    p += uA[95] * vec3(0.31, 0.17, 0.23); // the boil: a new drawing, a new surface
    // what hands leave on clay: broad thumb smears (stretched noise), fine pits, and
    // fingerprints (concentric ridges ~2 cm across) on about half the cells
    float smear = fbm(vec3(p.x * 9.0, p.y * 3.5, p.z * 9.0)) * 0.9;
    float n = smear + fbm(p * 26.0) * 0.35 + noise(p * 80.0) * 0.12;
    vec3 c = floor(p * 11.0);
    vec3 f = fract(p * 11.0) - 0.5 + (vec3(hash(c), hash(c + 7.1), hash(c + 3.3)) - 0.5) * 0.35;
    float r = length(f.xy * vec2(1.0, 1.35));
    float whorl = smoothstep(0.42, 0.1, r) * (0.5 + 0.5 * sin(r * 95.0 + hash(c) * 6.0));
    return n + whorl * 0.28 * step(0.5, hash(c + 1.7));
}
vec3 calcNormal(vec3 p) {
    const vec2 e = vec2(1.0, -1.0) * 0.0007;
    return normalize(e.xyy * map(p + e.xyy).x + e.yyx * map(p + e.yyx).x + e.yxy * map(p + e.yxy).x + e.xxx * map(p + e.xxx).x);
}
// soft shadows. Smooth unions and ellipsoids give inexact distances: a ray that starts too
// close to the surface finds it again and draws contour lines («acne») on round faces, so it
// starts a little out along the normal and a little along the ray, and the edge is smoothed.
float softShadow(vec3 ro, vec3 rd) {
    // the improved estimate (the closest approach between two steps) and fine steps: coarse
    // steps band into contour lines on round forms. Keep the key light fairly frontal: a
    // high key puts faces in the hair's wide penumbra, where any stepping shows.
    float res = 1.0, ph = 1e10;
    float t = 0.03;
    for (int i = 0; i < 128; i++) {
        vec2 hm = map(ro + rd * t);
        float h = hm.x;
        // material 0 = a bounding volume: step over it, it casts nothing
        if (hm.y > 0.5) {
            float y = h * h / (2.0 * ph);
            float d = sqrt(max(h * h - y * y, 0.0));
            res = min(res, uSoft * d / max(0.001, t - y));
            ph = h;
        } else ph = 1e10; // the next real sample starts a fresh estimate (a stale one reads as full shadow)
        t += clamp(h, 0.004, 0.1); // fine steps: coarse ones band the penumbra into stripes
        if (res < 0.003 || t > 6.0) break;
    }
    res = clamp(res, 0.0, 1.0);
    return res * res * (3.0 - 2.0 * res);
}
float calcAO(vec3 p, vec3 n) {
    float o = 0.0, s = 1.0;
    for (int i = 0; i < 5; i++) { float h = 0.015 + 0.07 * float(i); o += (h - map(p + n * h).x) * s; s *= 0.75; }
    return clamp(1.0 - 2.2 * o, 0.0, 1.0);
}
void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
    vec3 ww = normalize(uCamTarget - uCamPos), uu = normalize(cross(ww, vec3(0, 1, 0))), vv = cross(uu, ww);
    vec3 rd = normalize(uv.x * uu + uv.y * vv + (0.5 / tan(abs(uFov) * 0.5)) * ww);
    vec3 ro = uCamPos;
    float t = 0.05, m = -1.0;
    for (int i = 0; i < 180; i++) {
        vec2 h = map(ro + rd * t);
        if (h.x < 0.0004 * t) { m = h.y; break; }
        t += h.x * 0.9;
        if (t > 30.0) break;
    }
    vec3 col;
    if (m < 0.0) { col = pow(background(rd), vec3(2.2)); t = 30.0; }
    else {
        vec3 p = ro + rd * t;
        vec3 n = calcNormal(p);
        vec4 mat = material(m); // spec, shininess, translucency, bump
        if (mat.w > 0.0) {
            const float e = 0.003;
            vec3 gr = vec3(clayRelief(p + vec3(e, 0, 0)) - clayRelief(p - vec3(e, 0, 0)), clayRelief(p + vec3(0, e, 0)) - clayRelief(p - vec3(0, e, 0)), clayRelief(p + vec3(0, 0, e)) - clayRelief(p - vec3(0, 0, e))) / (2.0 * e);
            n = normalize(n - mat.w * 0.0032 * (gr - n * dot(gr, n)));
        }
        vec3 alb = pow(albedo(m, p, n), vec3(2.2));
        vec3 L = normalize(uLight);
        float sh = softShadow(p + n * 0.02, L);
        float occ = calcAO(p, n);
        float dif = max(dot(n, L), 0.0);
        float wrap = max((dot(n, L) + mat.z) / (1.0 + mat.z), 0.0); // wax: light wraps round the form
        vec3 H = normalize(L - rd);
        float spe = pow(max(dot(n, H), 0.0), mat.y) * mat.x * (0.3 + 0.7 * sh);
        float sky = 0.5 + 0.5 * n.y;
        float bounce = clamp(0.5 - 0.5 * n.y, 0.0, 1.0);
        float fre = pow(1.0 - max(dot(n, -rd), 0.0), 3.0);
        vec3 key = vec3(1.0, 0.92, 0.8) * uKey;
        col = alb * key * mix(dif, wrap, 0.6) * mix(sh, 1.0, 0.12);
        col += alb * mat.z * vec3(0.9, 0.35, 0.25) * 0.25 * (1.0 - dif) * occ; // warm scattering in shadow
        col += alb * vec3(0.62, 0.66, 0.72) * uFill * sky * occ;
        col += alb * vec3(0.7, 0.5, 0.35) * 0.3 * bounce * occ;
        col += alb * fre * 0.18 * occ;
        col += vec3(1.0, 0.95, 0.85) * spe;
    }
    // tone: soft shoulder, back to sRGB
    col = col / (1.0 + col * 0.35);
    col = pow(col, vec3(1.0 / 2.2));
    // the blur this pixel needs (signed: < 0 in front of the focus), stored in alpha: storing
    // the depth in 8 bits made the blur jump in steps and drew contour lines on round faces
    float cs = clamp(uAperture * (1.0 / uFocus - 1.0 / max(t, 0.05)) * uRes.y, -14.0, 14.0);
    float dn = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - 0.5;
    fragColor = vec4(col + dn * 1.5 / 255.0, 0.5 + cs / 28.0);
    if (uFov < 0.0) fragColor.a = 1.0; // noDof: straight to the canvas
}
`;
    // depth of field: gather around each pixel, the radius from the circle of confusion
    const DOF = `#version 300 es
precision highp float;
uniform sampler2D uTex;
uniform vec2 uRes;
out vec4 fragColor;
float sc(float a) { return (a - 0.5) * 28.0; } // signed blur radius, px
void main() {
    vec2 uv = gl_FragCoord.xy / uRes;
    vec4 c0 = texture(uTex, uv);
    float s0 = sc(c0.a), r0 = abs(s0);
    vec3 acc = c0.rgb; float w = 1.0;
    const float GA = 2.39996;
    for (int i = 1; i < 40; i++) {
        float fi = float(i), r = sqrt(fi / 40.0) * 14.0;
        vec2 o = vec2(cos(fi * GA), sin(fi * GA)) * r;
        vec4 s = texture(uTex, uv + o / uRes);
        float ss = sc(s.a), rs = abs(ss);
        // a sample counts if its own blur (or ours) reaches this far; nearer things spill over
        float k = smoothstep(r - 1.0, r + 1.0, ss < s0 ? rs : min(rs, r0));
        acc += s.rgb * k; w += k;
    }
    // dither: soft wide gradients (a penumbra on the backdrop) band into steps in 8 bits
    float dn = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - 0.5;
    fragColor = vec4(acc / w + dn * 1.5 / 255.0, 1.0);
}
`;
    const VS = `#version 300 es
in vec2 p;
void main() { gl_Position = vec4(p, 0.0, 1.0); }
`;
    function renderer(env, o) {
        const scale = o.scale ?? 0.6;
        const W = Math.round(env.px[0] * scale), H = Math.round(env.px[1] * scale);
        const cv = document.createElement('canvas');
        cv.width = W;
        cv.height = H;
        const gl = cv.getContext('webgl2', { preserveDrawingBuffer: true, antialias: false });
        if (!gl) throw new Error('Clay3D: no WebGL2');
        const compile = (type, src) => {
            const s = gl.createShader(type);
            gl.shaderSource(s, src);
            gl.compileShader(s);
            if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error('Clay3D shader: ' + gl.getShaderInfoLog(s));
            return s;
        };
        const program = (fs) => {
            const p = gl.createProgram();
            gl.attachShader(p, compile(gl.VERTEX_SHADER, VS));
            gl.attachShader(p, compile(gl.FRAGMENT_SHADER, fs));
            gl.bindAttribLocation(p, 0, 'p');
            gl.linkProgram(p);
            if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error('Clay3D link: ' + gl.getProgramInfoLog(p));
            return p;
        };
        const P1 = program(PRELUDE + o.scene + MAIN), P2 = program(DOF);
        const buf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
        const tex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, W, H, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        for (const [k, v] of [[gl.TEXTURE_MIN_FILTER, gl.LINEAR], [gl.TEXTURE_MAG_FILTER, gl.LINEAR], [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE]]) gl.texParameteri(gl.TEXTURE_2D, k, v);
        const fb = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
        const U1 = (n) => gl.getUniformLocation(P1, n), U2 = (n) => gl.getUniformLocation(P2, n);
        const memo = document.createElement('canvas');
        memo.width = W;
        memo.height = H;
        let memoKey = null;
        return {
            W, H,
            render(g, key, f) {
                if (key !== memoKey) {
                    gl.viewport(0, 0, W, H);
                    gl.bindFramebuffer(gl.FRAMEBUFFER, f.noDof ? null : fb);
                    gl.useProgram(P1);
                    gl.uniform2f(U1('uRes'), W, H);
                    gl.uniform1f(U1('uT'), f.t ?? 0);
                    const a = new Float32Array(96);
                    (f.a ?? []).forEach((v, i) => (a[i] = v));
                    gl.uniform1fv(U1('uA'), a);
                    gl.uniform3fv(U1('uCamPos'), f.cam);
                    gl.uniform3fv(U1('uCamTarget'), f.target);
                    gl.uniform3fv(U1('uLight'), f.light ?? [-0.6, 0.8, 0.55]);
                    gl.uniform1f(U1('uFov'), f.noDof ? -(f.fov ?? 0.6) : (f.fov ?? 0.6));
                    gl.uniform1f(U1('uFocus'), f.focus ?? 4);
                    gl.uniform1f(U1('uSoft'), f.soft ?? 12);  // shadow edge: 12 a lamp, 4 a big softbox
                    gl.uniform1f(U1('uFill'), f.fill ?? 0.38); // sky/ambient fill
                    gl.uniform1f(U1('uKey'), f.key ?? 2.3);   // key light intensity
                    gl.uniform1f(U1('uAperture'), f.aperture ?? 0.012);
                    gl.drawArrays(gl.TRIANGLES, 0, 3);
                    if (!f.noDof) {
                    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
                    gl.useProgram(P2);
                    gl.activeTexture(gl.TEXTURE0);
                    gl.bindTexture(gl.TEXTURE_2D, tex);
                    gl.uniform1i(U2('uTex'), 0);
                    gl.uniform2f(U2('uRes'), W, H);
                    gl.drawArrays(gl.TRIANGLES, 0, 3);
                    }
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
    return { renderer };
})();
