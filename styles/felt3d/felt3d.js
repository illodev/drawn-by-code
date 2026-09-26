// Felt 3D style kit: needle-felted puppets, raymarched in a WebGL2 fragment shader (the
// raymarcher of Clay3D, retuned for wool). What makes it felt and not clay or CG:
//   - a halo of stray fibres round every silhouette (the ray's closest approach to a felt
//     piece, turned into wisps by a fibre noise): the edge is never clean
//   - a matte, heathered surface: fibres of two or three shades mixed in the albedo, a fine
//     fibre relief and needle pits in the normal, light wrapping deep into the form
//   - a fabric sheen at grazing angles (felt catches light on its outline)
//   - glass bead eyes and wire, the only glossy things
// The puppets render over a TRANSPARENT background (premultiplied RGBA): the scene paints any
// backdrop first (a drawn set, a photo, a video frame) and the puppets land on it. An
// invisible floor catches their shadows (contact darkening and the key's soft shadow) and
// adds them as translucent black, so they stand on whatever floor the backdrop shows.
// Global: Felt3D.
//
//   const R = Felt3D.renderer(env, { scene: GLSL, scale: 0.75, params: 320 })
//   R.render(g, key, { cam, target, fov, light, keyCol, fillCol, key, fill, soft,
//                     floorY, shadow, p: [floats…], boil })
//     p:      scene data (PF(i) in the shader, i < params): joint positions, poses
//     zoom:   [scale, u, v]: a 2D zoom about the point (u, v) of the frame (fractions, y down)
//     boil:   the drawing's variant (fibres move a little per drawing, like stop motion)
//     keyCol / fillCol: key and ambient colours, taken from the backdrop so the wool sits
//             in its light; shadow: opacity of the caught floor shadow (0 = none)
//
// The scene GLSL defines:
//   vec2  map(vec3 p)                      distance, material id (≥ 1; 0 = a bounding
//                                          volume: shadows step over it)
//   vec3  albedo(float m, vec3 p, vec3 n)  colour (sRGB) of material m at p
//   vec4  material(float m)                (specular, shininess, wrap, fuzz): fuzz > 0 is
//                                          felt (the halo's reach in units, e.g. 0.012);
//                                          fuzz = 0 is a hard material (beads, wire)
// Prelude: sdSphere, sdEllipsoid, sdCapsule, sdRoundCone, sdRoundBox, sdTorus, sdCylinder,
// sdCappedCylinder, smin, smax, opU, opSU, rot, hash, noise, fbm, lumps, and local(p, o, i)
// (p in the frame stored at PF(o) (origin) and PF(o+3..o+11) (a column-major rotation)).
const Felt3D = (() => {
    const PRELUDE = (n) => `#version 300 es
precision highp float;
uniform vec2 uRes;
// scene data in a uniform block: SwiftShader indexes a plain uniform array dynamically
// through a chain of selects (a pose fit spent ~20 µs a pixel on it); a block is memory
layout(std140) uniform Data { vec4 uP4[${Math.ceil(n / 4)}]; };
float PF(int i) { return uP4[i >> 2][i & 3]; }
uniform float uBoil;
uniform vec3 uCamPos, uCamTarget, uLight, uKeyCol, uFillCol, uZoom;
uniform float uSoft, uFill, uKey, uFov, uFloorY, uShadow, uDebug;
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
// hand-felted unevenness: add to a piece's distance (amp ≈ 0.004 for a head 0.3 across)
float gLumps = 1.0; // 0 while tracing shadows: they fall from the smooth forms (lumps made them noisy)
float lumps(vec3 p, float amp) { if (gLumps == 0.0) return 0.0; return gLumps * amp * (noise(p * 9.0) + 0.5 * noise(p * 23.0) - 0.75) * 1.6; }
vec3 P3(int i) { return vec3(PF(i), PF(i + 1), PF(i + 2)); }
mat3 M3(int i) { return mat3(PF(i), PF(i + 1), PF(i + 2), PF(i + 3), PF(i + 4), PF(i + 5), PF(i + 6), PF(i + 7), PF(i + 8)); }
// p in the frame stored at PF(o): origin, then a column-major rotation (local → world)
vec3 local(vec3 p, int o) { return transpose(M3(o + 3)) * (p - P3(o)); }
`;
    const MAIN = `
// felt relief: a fine fibre mat (streaks in random directions). Keep it fine and faint:
// broad bumps (pits, fbm) on a white felt read as marbled plastic
float feltRelief(vec3 p) {
    p += uBoil * vec3(0.013, 0.007, 0.011);
    return noise(p * vec3(300.0, 100.0, 300.0)) * 0.5 + noise(p.zxy * vec3(280.0, 95.0, 280.0)) * 0.5;
}
vec3 calcNormal(vec3 p) {
    const vec2 e = vec2(1.0, -1.0) * 0.0006;
    return normalize(e.xyy * map(p + e.xyy).x + e.yyx * map(p + e.yyx).x + e.yxy * map(p + e.yxy).x + e.xxx * map(p + e.xxx).x);
}
float softShadow(vec3 ro, vec3 rd) {
    // the plain estimate (h / t): the «improved» one misreads the inexact distances of
    // smooth unions and squashed pieces as full shadow (marbling on white felt)
    gLumps = 0.0;
    float res = 1.0, t = 0.02;
    for (int i = 0; i < 96; i++) {
        vec2 hm = map(ro + rd * t);
        float h = hm.x;
        if (hm.y > 0.5) res = min(res, uSoft * h / t); // material 0 = a bound: casts nothing
        t += clamp(h, 0.006, 0.08);
        if (res < 0.003 || t > 4.0) break;
    }
    gLumps = 1.0;
    res = clamp(res, 0.0, 1.0);
    return res * res * (3.0 - 2.0 * res);
}
float calcAO(vec3 p, vec3 n) {
    float o = 0.0, s = 1.0;
    for (int i = 0; i < 5; i++) { float h = 0.01 + 0.035 * float(i); vec2 mh = map(p + n * h); if (mh.y > 0.5) o += (h - mh.x) * s; s *= 0.7; }
    return clamp(1.0 - 3.0 * o, 0.0, 1.0);
}
// light a felt point (linear colour)
vec3 shade(vec3 p, vec3 n, vec3 rd, float m, bool shadows) {
    vec4 mat = material(m);
    if (mat.w > 0.0) {
        const float e = 0.0015;
        vec3 gr = vec3(feltRelief(p + vec3(e, 0, 0)) - feltRelief(p - vec3(e, 0, 0)), feltRelief(p + vec3(0, e, 0)) - feltRelief(p - vec3(0, e, 0)), feltRelief(p + vec3(0, 0, e)) - feltRelief(p - vec3(0, 0, e))) / (2.0 * e);
        n = normalize(n - 0.00025 * (gr - n * dot(gr, n)));
    }
    vec3 alb = pow(albedo(m, p, n), vec3(2.2));
    vec3 L = normalize(uLight);
    float sh = shadows ? softShadow(p + n * 0.03, L) : 1.0; // well off the surface: lumps make the distance inexact (acne)
    float occ = shadows ? calcAO(p, n) : 0.8;
    float ndl = dot(n, L);
    float wrap = max((ndl + mat.z) / (1.0 + mat.z), 0.0);
    vec3 H = normalize(L - rd);
    float spe = pow(max(dot(n, H), 0.0), mat.y) * mat.x * (0.25 + 0.75 * sh);
    float sky = 0.55 + 0.45 * n.y;
    float bounce = clamp(0.5 - 0.5 * n.y, 0.0, 1.0);
    float rim = pow(1.0 - max(dot(n, -rd), 0.0), 2.5);
    // debug views (f.debug): 1 albedo, 2 normal, 3 key shadow, 4 occlusion
    if (uDebug == 1.0) return alb; if (uDebug == 2.0) return pow(n * 0.5 + 0.5, vec3(2.2));
    if (uDebug == 3.0) return vec3(sh); if (uDebug == 4.0) return vec3(occ);
    vec3 col = alb * uKeyCol * uKey * wrap * mix(sh, 1.0, 0.18);
    col += alb * uFillCol * uFill * sky * occ;
    col += alb * uFillCol * 0.18 * bounce * occ;
    if (mat.w > 0.0) col += (alb * 0.6 + 0.02) * uKeyCol * rim * 0.35 * occ * (0.4 + 0.6 * sh); // fabric sheen
    col += uKeyCol * spe;
    return col;
}
// stray fibres: 0..1 density of wisps at a point near (not on) a felt surface
float strays(vec3 p, float d, float reach) {
    vec3 q = p + uBoil * vec3(0.021, 0.013, 0.017);
    // curly fibres: a noise stretched along two random directions, thresholded to thin lines
    float a = abs(noise(q * vec3(420.0, 140.0, 420.0)) - 0.5);
    float b = abs(noise(q.yzx * vec3(380.0, 130.0, 380.0) + 5.0) - 0.5);
    float lines = max(smoothstep(0.06, 0.0, a), smoothstep(0.05, 0.0, b));
    float haze = noise(q * 160.0);
    float fall = 1.0 - smoothstep(0.0, reach, d);
    return clamp(lines * fall * fall * 0.95 + haze * fall * fall * fall * 0.55, 0.0, 1.0);
}
void main() {
    // a 2D zoom about a fixed point of the frame (a lens zoom, or a zoom made in the edit):
    // exact, at full resolution, and the backdrop gets the same transform
    if (uDebug == 1.0) gLumps = 0.0; // the albedo view (pose fitting) needs the forms, not the lumps
    vec2 fixp = vec2(uZoom.y, 1.0 - uZoom.z) * uRes;
    vec2 fc = fixp + (gl_FragCoord.xy - fixp) / uZoom.x;
    vec2 uv = (fc - 0.5 * uRes) / uRes.y;
    vec3 ww = normalize(uCamTarget - uCamPos), uu = normalize(cross(ww, vec3(0, 1, 0))), vv = cross(uu, ww);
    vec3 rd = normalize(uv.x * uu + uv.y * vv + (0.5 / tan(uFov * 0.5)) * ww);
    vec3 ro = uCamPos;
    float t = 0.05, m = -1.0;
    float dmin = 1e9, tmin = 0.0, mmin = -1.0; // closest approach to felt, for the halo
    bool passed = false;
    for (int i = 0; i < 200; i++) {
        vec2 h = map(ro + rd * t);
        // a near miss counts only once the ray has moved away from it again: a ray closing in
        // on the surface it will hit is not passing a silhouette (that drew fibres all over faces)
        if (h.y > 0.5 && h.x < dmin && material(h.y).w > 0.0) { dmin = h.x; tmin = t; mmin = h.y; passed = false; }
        if (h.x > dmin * 1.6 + 0.004) passed = true;
        if (h.x < (uDebug == 1.0 ? 0.002 : 0.0003) * t) { m = h.y; break; }
        t += h.x * (h.x < 0.03 && uDebug != 1.0 ? 0.6 : 0.9); // small steps near the surface: the halo needs them
        if (t > 20.0) break;
    }
    // albedo view, fast (pose fitting reads it): no lighting, no floor, no stray fibres
    if (uDebug == 1.0) {
        fragColor = m > 0.0 ? vec4(albedo(m, ro + rd * t, vec3(0.0, 0.0, 1.0)), 1.0) : vec4(0.0);
        return;
    }
    vec4 outc = vec4(0.0); // premultiplied
    if (m > 0.0) {
        vec3 p = ro + rd * t;
        outc = vec4(shade(p, calcNormal(p), rd, m, true), 1.0);
    } else {
        // the invisible floor: shadows only
        float tf = rd.y < -1e-4 ? (uFloorY - ro.y) / rd.y : -1.0;
        if (tf > 0.0) {
            vec3 pf = ro + rd * tf;
            // a decal on the floor (a puddle, a rug): the scene defines FLOOR_DECAL and
            // vec4 floorDecal(p, rd, L) → premultiplied linear colour
#ifdef FLOOR_DECAL
            outc = floorDecal(pf, rd, normalize(uLight));
#endif
            // far from every puppet (the bounds' distance), the floor is lit: skip the traces
            float far = map(pf).x;
            if (uShadow > 0.0 && far < 1.2) {
                float sh = softShadow(pf + vec3(0.0, 0.01, 0.0), normalize(uLight));
                float occ = far < 0.3 ? calcAO(pf, vec3(0.0, 1.0, 0.0)) : 1.0;
                float a = clamp(uShadow * (1.0 - sh) * 0.7 + uShadow * (1.0 - occ) * 0.8, 0.0, 0.85);
                outc = vec4(outc.rgb * (1.0 - a), a + outc.a * (1.0 - a));
            }
        }
    }
    // the halo of stray fibres in front of whatever is behind
    if (mmin > 0.0) {
        float reach = material(mmin).w;
        vec3 pm = ro + rd * tmin;
        bool behind = m < 0.0 || passed;
        if (behind && dmin > 0.0003 * tmin && dmin < reach) {
            float a = strays(pm, dmin, reach);
            if (a > 0.0) {
                vec3 n = calcNormal(pm);
                vec3 c = shade(pm, n, rd, mmin, false) * 0.92;
                outc = vec4(c * a, a) + outc * (1.0 - a);
            }
        }
    }
    vec3 col = outc.a > 0.0 ? outc.rgb / outc.a : vec3(0.0);
    if (uDebug == 0.0) col = col / (1.0 + col * 0.3);
    col = pow(col, vec3(1.0 / 2.2));
    float dn = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - 0.5;
    fragColor = vec4((col + dn * 1.5 / 255.0) * outc.a, outc.a);
}
`;
    const VS = `#version 300 es
in vec2 p;
void main() { gl_Position = vec4(p, 0.0, 1.0); }
`;
    function renderer(env, o) {
        const scale = o.scale ?? 0.75, N = o.params ?? 320;
        const W = Math.round(env.px[0] * scale), H = Math.round(env.px[1] * scale);
        const cv = document.createElement('canvas');
        cv.width = W;
        cv.height = H;
        const gl = cv.getContext('webgl2', { preserveDrawingBuffer: true, antialias: false, premultipliedAlpha: true, alpha: true });
        if (!gl) throw new Error('Felt3D: no WebGL2');
        const compile = (type, src) => {
            const s = gl.createShader(type);
            gl.shaderSource(s, src);
            gl.compileShader(s);
            if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error('Felt3D shader: ' + gl.getShaderInfoLog(s));
            return s;
        };
        const P = gl.createProgram();
        gl.attachShader(P, compile(gl.VERTEX_SHADER, VS));
        gl.attachShader(P, compile(gl.FRAGMENT_SHADER, PRELUDE(N) + o.scene + MAIN));
        gl.bindAttribLocation(P, 0, 'p');
        gl.linkProgram(P);
        if (!gl.getProgramParameter(P, gl.LINK_STATUS)) throw new Error('Felt3D link: ' + gl.getProgramInfoLog(P));
        const buf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
        const U = (n) => gl.getUniformLocation(P, n);
        const N4 = Math.ceil(N / 4) * 4;
        const ubo = gl.createBuffer();
        gl.bindBuffer(gl.UNIFORM_BUFFER, ubo);
        gl.bufferData(gl.UNIFORM_BUFFER, N4 * 4, gl.DYNAMIC_DRAW);
        gl.uniformBlockBinding(P, gl.getUniformBlockIndex(P, 'Data'), 0);
        gl.bindBufferBase(gl.UNIFORM_BUFFER, 0, ubo);
        const memo = document.createElement('canvas');
        memo.width = W;
        memo.height = H;
        let memoKey = null;
        return {
            W, H, canvas: memo,
            // renders (memoised per key) and returns the puppets' layer; draw() pastes it
            layer(key, f) {
                if (key !== memoKey) {
                    gl.viewport(0, 0, W, H);
                    gl.clearColor(0, 0, 0, 0);
                    gl.clear(gl.COLOR_BUFFER_BIT);
                    gl.useProgram(P);
                    gl.uniform2f(U('uRes'), W, H);
                    const a = new Float32Array(N4);
                    (f.p ?? []).forEach((v, i) => (a[i] = v));
                    gl.bindBuffer(gl.UNIFORM_BUFFER, ubo);
                    gl.bufferSubData(gl.UNIFORM_BUFFER, 0, a);
                    gl.uniform1f(U('uBoil'), f.boil ?? 0);
                    gl.uniform3fv(U('uCamPos'), f.cam);
                    gl.uniform3fv(U('uCamTarget'), f.target);
                    gl.uniform3fv(U('uLight'), f.light ?? [-0.5, 0.8, 0.6]);
                    gl.uniform3fv(U('uKeyCol'), f.keyCol ?? [1.0, 0.94, 0.84]);
                    gl.uniform3fv(U('uFillCol'), f.fillCol ?? [0.66, 0.7, 0.78]);
                    gl.uniform3fv(U('uZoom'), f.zoom ?? [1, 0.5, 0.5]);
                    gl.uniform1f(U('uFov'), f.fov ?? 0.6);
                    gl.uniform1f(U('uSoft'), f.soft ?? 12);
                    gl.uniform1f(U('uFill'), f.fill ?? 0.75);
                    gl.uniform1f(U('uKey'), f.key ?? 2.1);
                    gl.uniform1f(U('uFloorY'), f.floorY ?? 0);
                    gl.uniform1f(U('uShadow'), f.shadow ?? 0.6);
                    gl.uniform1f(U('uDebug'), f.debug ?? 0);
                    gl.drawArrays(gl.TRIANGLES, 0, 3);
                    const m = memo.getContext('2d');
                    m.clearRect(0, 0, W, H);
                    m.drawImage(cv, 0, 0);
                    memoKey = key;
                }
                return memo;
            },
            render(g, key, f) {
                const img = this.layer(key, f);
                g.save();
                g.setTransform(1, 0, 0, 1, 0, 0);
                g.imageSmoothingQuality = 'high';
                g.drawImage(img, 0, 0, env.px[0], env.px[1]);
                g.restore();
            },
        };
    }
    // small linear algebra for rigs (column-major 3×3, as the shader reads them)
    const V = {
        add: (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]],
        sub: (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]],
        mul: (a, s) => [a[0] * s, a[1] * s, a[2] * s],
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
    return { renderer, V };
})();
