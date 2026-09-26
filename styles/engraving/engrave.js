// Engraving style kit: 3D scenes printed as a 19th-century copperplate engraving (the
// plates of the «Description de l'Égypte»). A WebGL2 rasteriser draws instanced meshes
// (thousands of blocks are cheap), and the fragment shader turns light into burin lines:
//   - tone is line WIDTH, never grey: one set of parallel lines, a second crossing set in
//     the half-tones, a third in the deep shadows; highlights are bare paper
//   - lines are fixed to the surface (world space) and follow its faces: stone courses run
//     horizontal on walls; their spacing stays the same on screen at any distance (octave
//     levels, the odd lines of a level fade out as it recedes)
//   - every block's edges are cut as a contour line; far blocks drop their contours
//   - the sky is ruled: perfectly straight horizontal lines, as the ruling machine made them
//   - the print: warm laid paper, ink that breaks up a little, foxing spots, a plate tone
//   - colour only as a second ink where something is alive or precious: live blue prints solid
//     and its light tints the stone lines around it; gold is a wash under the dark lines
// Global: Engrave.
//
//   const R = Engrave.renderer(env, { scale: 1 })
//   R.mesh('ring', Engrave.torus(0.06))          // unit-size meshes; box, pyramid, cylinder
//   R.render(g, key, {
//       cam, target, fov, up,                    // camera (fov: vertical, radians)
//       sun: [x, y, z], sunK, fill,              // key direction (towards the sun), strengths
//       draws: [{ mesh: 'box', inst: Float32Array, box: true }],   // box: cut edges; tan: 'y' hatches
//              // round meshes along their axis (cylinders), otherwise round it (rings); 16 floats an instance:
//              // centre xyz, material · half size xyz, seed · quaternion xyzw · glow, bias, 0, 0
//       lights: [[x, y, z, reach, strength]],    // second-ink lights (glow of live parts)
//       shadow: { center, radius },              // the sun's shadow map covers this sphere
//       sky: { zenith, horizon },                // tone (0 = paper, 1 = solid ink) of the sky
//       spacing,                                 // line spacing in px at 1920 wide
//       frame: [x0, y0, x1, y1],                 // the plate's image area (fractions); outside
//                                                // it, bare paper (for a plate with margins)
//   })
// Materials (the instance's material index): 0 limestone, 1 worn limestone (darker), 2
// obsidian (polished black), 3 old gold, 4 live blue (emissive), 5 sand, 6 bronze.
const Engrave = (() => {
    // ---------- mat4, column-major ----------
    const M4 = {
        mul(a, b) {
            const o = new Float32Array(16);
            for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) {
                let s = 0;
                for (let k = 0; k < 4; k++) s += a[k * 4 + r] * b[c * 4 + k];
                o[c * 4 + r] = s;
            }
            return o;
        },
        persp(fovy, asp, n, f) {
            const t = 1 / Math.tan(fovy / 2);
            return new Float32Array([t / asp, 0, 0, 0, 0, t, 0, 0, 0, 0, (f + n) / (n - f), -1, 0, 0, (2 * f * n) / (n - f), 0]);
        },
        ortho(l, r, b, t, n, f) {
            return new Float32Array([2 / (r - l), 0, 0, 0, 0, 2 / (t - b), 0, 0, 0, 0, -2 / (f - n), 0, -(r + l) / (r - l), -(t + b) / (t - b), -(f + n) / (f - n), 1]);
        },
        lookAt(e, a, up) {
            const z = norm(sub(e, a)), x = norm(cross(up, z)), y = cross(z, x);
            return new Float32Array([x[0], y[0], z[0], 0, x[1], y[1], z[1], 0, x[2], y[2], z[2], 0, -dot(x, e), -dot(y, e), -dot(z, e), 1]);
        },
        inv(m) {
            const a = m, o = new Float32Array(16);
            const b00 = a[0] * a[5] - a[1] * a[4], b01 = a[0] * a[6] - a[2] * a[4], b02 = a[0] * a[7] - a[3] * a[4];
            const b03 = a[1] * a[6] - a[2] * a[5], b04 = a[1] * a[7] - a[3] * a[5], b05 = a[2] * a[7] - a[3] * a[6];
            const b06 = a[8] * a[13] - a[9] * a[12], b07 = a[8] * a[14] - a[10] * a[12], b08 = a[8] * a[15] - a[11] * a[12];
            const b09 = a[9] * a[14] - a[10] * a[13], b10 = a[9] * a[15] - a[11] * a[13], b11 = a[10] * a[15] - a[11] * a[14];
            const d = 1 / (b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06);
            o[0] = (a[5] * b11 - a[6] * b10 + a[7] * b09) * d; o[1] = (a[2] * b10 - a[1] * b11 - a[3] * b09) * d;
            o[2] = (a[13] * b05 - a[14] * b04 + a[15] * b03) * d; o[3] = (a[10] * b04 - a[9] * b05 - a[11] * b03) * d;
            o[4] = (a[6] * b08 - a[4] * b11 - a[7] * b07) * d; o[5] = (a[0] * b11 - a[2] * b08 + a[3] * b07) * d;
            o[6] = (a[14] * b02 - a[12] * b05 - a[15] * b01) * d; o[7] = (a[8] * b05 - a[10] * b02 + a[11] * b01) * d;
            o[8] = (a[4] * b10 - a[5] * b08 + a[7] * b06) * d; o[9] = (a[1] * b08 - a[0] * b10 - a[3] * b06) * d;
            o[10] = (a[12] * b04 - a[13] * b02 + a[15] * b00) * d; o[11] = (a[9] * b02 - a[8] * b04 - a[11] * b00) * d;
            o[12] = (a[5] * b07 - a[4] * b09 - a[6] * b06) * d; o[13] = (a[0] * b09 - a[1] * b07 + a[2] * b06) * d;
            o[14] = (a[13] * b01 - a[12] * b03 - a[14] * b00) * d; o[15] = (a[8] * b03 - a[9] * b01 + a[10] * b00) * d;
            return o;
        },
    };
    const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
    const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
    const norm = (a) => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
    // quaternion from axis-angle
    const quat = (axis, ang) => { const n = norm(axis), s = Math.sin(ang / 2); return [n[0] * s, n[1] * s, n[2] * s, Math.cos(ang / 2)]; };
    const qmul = (a, b) => [
        a[3] * b[0] + a[0] * b[3] + a[1] * b[2] - a[2] * b[1],
        a[3] * b[1] - a[0] * b[2] + a[1] * b[3] + a[2] * b[0],
        a[3] * b[2] + a[0] * b[1] - a[1] * b[0] + a[2] * b[3],
        a[3] * b[3] - a[0] * b[0] - a[1] * b[1] - a[2] * b[2],
    ];

    // ---------- meshes (unit size: the instance's half size scales them) ----------
    function box() {
        const P = [], I = [];
        const faces = [[0, 1], [0, -1], [1, 1], [1, -1], [2, 1], [2, -1]];
        for (const [ax, s] of faces) {
            const u = (ax + 1) % 3, v = (ax + 2) % 3, b = P.length / 6;
            for (const [a, c] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
                const p = [0, 0, 0], n = [0, 0, 0];
                p[ax] = s; p[u] = a; p[v] = c; n[ax] = s;
                P.push(...p, ...n);
            }
            if (s > 0) I.push(b, b + 1, b + 2, b, b + 2, b + 3);
            else I.push(b, b + 2, b + 1, b, b + 3, b + 2);
        }
        return { P, I };
    }
    // square base at y = -1, apex at y = +1
    function pyramid() {
        const P = [], I = [];
        const c = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
        for (let i = 0; i < 4; i++) {
            const a = c[i], b = c[(i + 1) % 4];
            const e1 = [b[0] - a[0], 0, b[1] - a[1]], e2 = [-a[0], 2, -a[1]];
            let n = norm(cross(e2, e1));
            if (dot(n, [a[0] + b[0], 0, a[1] + b[1]]) < 0) n = n.map((x) => -x);
            const k = P.length / 6;
            P.push(a[0], -1, a[1], ...n, b[0], -1, b[1], ...n, 0, 1, 0, ...n);
            I.push(k, k + 2, k + 1);
        }
        const k = P.length / 6;
        for (const q of c) P.push(q[0], -1, q[1], 0, -1, 0);
        I.push(k, k + 1, k + 2, k, k + 2, k + 3);
        return { P, I };
    }
    // ring in the xz plane, radius 1, tube radius r
    function torus(r, nu = 96, nv = 16) {
        const P = [], I = [];
        for (let i = 0; i <= nu; i++) for (let j = 0; j <= nv; j++) {
            const u = (i / nu) * Math.PI * 2, v = (j / nv) * Math.PI * 2;
            const cx = Math.cos(u), cz = Math.sin(u);
            const n = [Math.cos(v) * cx, Math.sin(v), Math.cos(v) * cz];
            P.push(cx + r * n[0], r * n[1], cz + r * n[2], ...n);
        }
        for (let i = 0; i < nu; i++) for (let j = 0; j < nv; j++) {
            const a = i * (nv + 1) + j, b = a + nv + 1;
            I.push(a, a + 1, b, b, a + 1, b + 1);
        }
        return { P, I };
    }
    // cylinder along y, radius 1, y in [-1, 1], capped
    function cylinder(n = 48) {
        const P = [], I = [];
        for (let i = 0; i <= n; i++) {
            const a = (i / n) * Math.PI * 2, x = Math.cos(a), z = Math.sin(a);
            P.push(x, -1, z, x, 0, z, x, 1, z, x, 0, z);
        }
        for (let i = 0; i < n; i++) { const a = i * 2, b = a + 2; I.push(a, a + 1, b, b, a + 1, b + 1); }
        for (const y of [-1, 1]) {
            const c = P.length / 6;
            P.push(0, y, 0, 0, y, 0);
            for (let i = 0; i <= n; i++) { const a = (i / n) * Math.PI * 2; P.push(Math.cos(a), y, Math.sin(a), 0, y, 0); }
            for (let i = 0; i < n; i++) y > 0 ? I.push(c, c + 2 + i, c + 1 + i) : I.push(c, c + 1 + i, c + 2 + i);
        }
        return { P, I };
    }
    function sphere(nu = 48, nv = 24) {
        const P = [], I = [];
        for (let j = 0; j <= nv; j++) for (let i = 0; i <= nu; i++) {
            const t = (j / nv) * Math.PI, p = (i / nu) * Math.PI * 2;
            const n = [Math.sin(t) * Math.cos(p), Math.cos(t), Math.sin(t) * Math.sin(p)];
            P.push(...n, ...n);
        }
        for (let j = 0; j < nv; j++) for (let i = 0; i < nu; i++) {
            const a = j * (nu + 1) + i, b = a + nu + 1;
            I.push(a, b, a + 1, a + 1, b, b + 1);
        }
        return { P, I };
    }

    // ---------- shaders ----------
    const COMMON = `
float hash(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float hash3(vec3 p) { return hash(p.xy + p.z * 17.13); }
float vnoise(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y); }
float vnoise3(vec3 p) { vec3 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
    float a = mix(mix(hash3(i), hash3(i + vec3(1, 0, 0)), f.x), mix(hash3(i + vec3(0, 1, 0)), hash3(i + vec3(1, 1, 0)), f.x), f.y);
    float b = mix(mix(hash3(i + vec3(0, 0, 1)), hash3(i + vec3(1, 0, 1)), f.x), mix(hash3(i + vec3(0, 1, 1)), hash3(i + vec3(1, 1, 1)), f.x), f.y);
    return mix(a, b, f.z); }
float fbm3(vec3 p) { return 0.55 * vnoise3(p) + 0.3 * vnoise3(p * 2.1 + 3.1) + 0.15 * vnoise3(p * 4.3 + 7.7); }
uniform vec2 uRes;
uniform float uPx;          // output px per 1920-wide px
uniform vec3 uPaper;
uniform vec4 uFrame;
// the print: paper fibre, foxing, ink breaking up; cov = dark ink, col2 = second ink (rgb, coverage)
vec3 print(vec2 fc, float cov, vec4 ink2, vec3 ink) {
    vec2 q = fc / uPx;
    float fib = vnoise(q * vec2(0.9, 0.12)) * 0.5 + vnoise(q * vec2(0.13, 0.8)) * 0.5;
    vec3 paper = uPaper * (0.975 + 0.035 * fib) - vec3(0.0, 0.006, 0.014) * vnoise(q * 0.004);
    // foxing: a few rust spots, soft edged
    vec2 cell = floor(q / 260.0), fq = q / 260.0 - cell;
    float fox = 0.0;
    if (hash(cell + 0.37) > 0.72) {
        vec2 c0 = vec2(hash(cell + 1.3), hash(cell + 2.9)) * 0.6 + 0.2;
        float r0 = 0.03 + 0.09 * hash(cell + 5.1);
        float d0 = length(fq - c0) / r0 + (vnoise(q * 0.08) - 0.5) * 0.6;
        fox = (1.0 - smoothstep(0.6, 1.0, d0)) * (0.5 + 0.5 * smoothstep(0.7, 1.0, d0));
    }
    paper = mix(paper, paper * vec3(0.9, 0.8, 0.66), fox * 0.45);
    vec2 u = fc / uRes; u.y = 1.0 - u.y;
    bool inPlate = u.x > uFrame.x && u.x < uFrame.z && u.y > uFrame.y && u.y < uFrame.w;
    if (!inPlate) return paper;
    paper *= 0.985;                      // plate tone: the wiped plate leaves a film of ink
    float brk = 0.9 + 0.1 * smoothstep(0.2, 0.7, vnoise(q * 1.7));   // ink skips on the fibre
    vec3 c = mix(paper, ink2.rgb, clamp(ink2.a * brk, 0.0, 1.0));
    return mix(c, ink, clamp(cov * brk, 0.0, 1.0));
}
// a set of engraved lines across coordinate s (in line spacings): coverage for tone c
// (fraction of the spacing that is ink, 0..0.9); w is the width scale of this line
float lines(float s, float c, float aa) {
    float d = abs(fract(s + 0.5) - 0.5);
    float hw = 0.5 * c;
    // a line thinner than a pixel prints lighter, never as a half-tone smear of fixed width
    return (1.0 - smoothstep(hw - aa, hw + aa, d)) * clamp(hw / max(aa, 1e-5), 0.0, 1.0);
}
`;
    const VS = `#version 300 es
layout(location = 0) in vec3 aPos;
layout(location = 1) in vec3 aNor;
layout(location = 2) in vec4 iA;   // centre, material
layout(location = 3) in vec4 iB;   // half size, seed
layout(location = 4) in vec4 iQ;   // rotation
layout(location = 5) in vec4 iX;   // glow, tone bias
uniform mat4 uVP;
uniform float uTan;   // hatch direction: 0 box faces, 1 along the local y axis, 2 round the local y axis
out vec3 vW; out vec3 vN; out vec3 vT; out vec3 vL; out vec3 vH;
flat out float vMat; flat out float vSeed; flat out vec4 vX;
vec3 qrot(vec4 q, vec3 v) { return v + 2.0 * cross(q.xyz, cross(q.xyz, v) + q.w * v); }
void main() {
    vec3 w = iA.xyz + qrot(iQ, aPos * iB.xyz);
    vW = w; vL = aPos; vH = iB.xyz; vMat = iA.w; vSeed = iB.w; vX = iX;
    vN = qrot(iQ, normalize(aNor / iB.xyz));
    // hatch direction on a box face: horizontal courses on the sides, along x on top
    vec3 t = abs(aNor.x) > 0.5 ? vec3(0, 0, 1) : vec3(1, 0, 0);
    if (uTan > 0.5 && uTan < 1.5) t = vec3(0, 1, 0);
    if (uTan > 1.5) { vec3 c = cross(aNor, vec3(0, 1, 0)); t = dot(c, c) > 1e-4 ? normalize(c) : vec3(1, 0, 0); }
    vT = qrot(iQ, t);
    gl_Position = uVP * vec4(w, 1.0);
}
`;
    const SHADOW_VS = `#version 300 es
layout(location = 0) in vec3 aPos;
layout(location = 2) in vec4 iA;
layout(location = 3) in vec4 iB;
layout(location = 4) in vec4 iQ;
uniform mat4 uVP;
vec3 qrot(vec4 q, vec3 v) { return v + 2.0 * cross(q.xyz, cross(q.xyz, v) + q.w * v); }
void main() { gl_Position = uVP * vec4(iA.xyz + qrot(iQ, aPos * iB.xyz), 1.0); }
`;
    const SHADOW_FS = `#version 300 es
precision highp float;
out vec4 o;
void main() { o = vec4(1.0); }
`;
    const FS = `#version 300 es
precision highp float;
precision highp sampler2DShadow;
${COMMON}
in vec3 vW; in vec3 vN; in vec3 vT; in vec3 vL; in vec3 vH;
flat in float vMat; flat in float vSeed; flat in vec4 vX;
uniform vec3 uEye, uSun, uRight;
uniform float uSunK, uFill, uSpacing, uBox, uFogNear, uFogFar;
uniform mat4 uLVP;
uniform sampler2DShadow uShadowMap;
uniform vec4 uLights[8];
uniform int uNL;
uniform vec3 uInk, uInkBlue, uInkGold;
out vec4 o;
// material: albedo, specular, shininess, ink (0 dark, 1 gold, 2 blue)
vec4 mat(int m) {
    if (m == 0) return vec4(0.86, 0.0, 1.0, 0.0);
    if (m == 1) return vec4(0.7, 0.0, 1.0, 0.0);
    if (m == 2) return vec4(0.14, 0.9, 40.0, 0.0);
    if (m == 3) return vec4(0.8, 0.8, 18.0, 1.0);
    if (m == 4) return vec4(1.0, 0.0, 1.0, 2.0);
    if (m == 5) return vec4(1.08, 0.0, 1.0, 0.0);
    return vec4(0.45, 0.6, 12.0, 1.0);
}
float shadow(vec3 p, vec3 n) {
    vec4 l = uLVP * vec4(p + n * 0.004, 1.0);
    vec3 s = l.xyz / l.w * 0.5 + 0.5;
    if (s.x < 0.0 || s.x > 1.0 || s.y < 0.0 || s.y > 1.0 || s.z > 1.0) return 1.0;
    vec2 ts = 1.0 / vec2(textureSize(uShadowMap, 0));
    float a = 0.0;
    for (int i = -1; i <= 1; i++) for (int j = -1; j <= 1; j++)
        a += texture(uShadowMap, vec3(s.xy + vec2(i, j) * ts * 1.2, s.z - 0.0015));
    return a / 9.0;
}
void main() {
    int m = int(vMat + 0.5);
    vec4 M = mat(m);
    vec3 N = normalize(vN);
    if (!gl_FrontFacing) N = -N;
    vec3 V = normalize(uEye - vW);
    vec3 T = normalize(vT - N * dot(vT, N));
    if (m == 5 && N.y > 0.9 && uBox > 0.5) {
        // the desert: long dunes and wind ripples tilt the ground's normal
        vec2 q = vW.xz;
        float h0 = vnoise(q * 0.45 + 3.0), hx = vnoise(q * 0.45 + vec2(3.05, 3.0)), hz = vnoise(q * 0.45 + vec2(3.0, 3.05));
        N = normalize(N + vec3(h0 - hx, 0.0, h0 - hz) * 3.5 + vec3(sin(dot(q, vec2(9.0, 3.0)) + vnoise(q * 2.0) * 4.0) * 0.05, 0.0, 0.0));
        T = uRight;
    }
    vec3 B = cross(N, T);
    // light
    float sh = shadow(vW, N);
    float lam = max(dot(N, uSun), 0.0) * sh * uSunK;
    float sky = uFill * (0.55 + 0.45 * N.y);
    float glow = 0.0;
    for (int i = 0; i < 8; i++) {
        if (i >= uNL) break;
        vec3 d = uLights[i].xyz - vW; float r = length(d);
        glow += uLights[i].w * max(dot(N, d / r) * 0.7 + 0.3, 0.0) / (1.0 + r * r * 18.0);
    }
    glow += vX.x;
    float spec = M.y * pow(max(dot(reflect(-uSun, N), V), 0.0), M.z) * sh;
    // stone: weathering, pores, a few darker stones
    float stone = (fbm3(vW * 14.0 + vSeed * 7.0) - 0.5) * 0.18 + (vSeed - 0.5) * 0.12;
    float lum = M.x * (lam + sky) * (1.0 + stone * (m < 2 || m == 5 ? 1.0 : 0.2)) + spec + glow * 0.6;
    float D = clamp(1.0 - lum + vX.y, 0.0, 1.0);
    D = smoothstep(0.14, 0.95, D);
    // cut stone always carries some line work, heavier where it is weathered
    if (m < 2) D = max(D, 0.1 + 0.06 * vSeed + 0.22 * smoothstep(0.45, 0.8, fbm3(vW * 7.0 + vSeed * 5.0)));
    float bend = 0.0;
    if (m == 5) { D = max(D, 0.13); bend = (vnoise(vW.xz * 0.45 + 3.0) * 7.0 + vnoise(vW.xz * 1.7) * 1.5) / (1.0 + 0.25 * length(uEye - vW)); }  // sand: thin lines everywhere, bending with the dunes
    // aerial perspective: the far plane is engraved lighter
    float dist = length(uEye - vW);
    D *= 1.0 - 0.65 * smoothstep(uFogNear, uFogFar, dist);
    // lines fixed to the surface at a constant spacing on screen
    float ps = max(length(dFdx(vW)), length(dFdy(vW)));
    float sp = uSpacing * uPx * ps;
    float lvl = log2(sp), l0 = floor(lvl), fr = lvl - l0, a = exp2(l0);
    float grow = exp2(fr);
    vec3 dirs[3];
    dirs[0] = B;
    dirs[1] = normalize(B * cos(0.95) + T * sin(0.95));
    dirs[2] = normalize(B * cos(-0.8) + T * sin(-0.8));
    float cs[3];
    // the first set carries the form; crossings come in thinner, only where it is dark
    // (deep shadow is heavy parallel lines with thin continuous light between them, not a
    // mesh of crossings: at video size a dense mesh reads as perforated metal)
    cs[0] = clamp(D * 0.95, 0.0, 0.72) + 0.16 * smoothstep(0.8, 1.0, D);
    cs[1] = clamp((D - 0.55) * 0.9, 0.0, 0.26) * (1.0 - smoothstep(0.82, 0.95, D));
    cs[2] = 0.0;
    float cov = 0.0;
    for (int k = 0; k < 3; k++) {
        if (cs[k] < 0.035) continue;
        float along = dot(vW, k == 0 ? T : cross(N, dirs[k])) / sp;
        float s = dot(vW, dirs[k]) / a + (vnoise(vec2(along * 0.06, float(k) * 7.0 + vSeed * 13.0)) - 0.5) * 0.5 + bend * sp / a;
        float idx = floor(s + 0.5);
        float odd = mod(idx, 2.0);
        // burin lines swell and thin along their length; light lines break into flicks
        float sw = 1.0 + (0.4 * vnoise(vec2(along * 0.12, idx * 3.1 + float(k))) - 0.2) * (1.0 - D);
        float c = cs[k] * grow * sw;
        c *= odd > 0.5 ? (1.0 - fr) : 1.0;
        float flick = smoothstep(0.1, 0.4, vnoise(vec2(along * 0.15, idx * 5.7)) + D * 3.0);
        float aa = fwidth(s) * 0.8;
        cov = max(cov, lines(s, c, aa) * flick);
    }
    float edgePx = 99.0;
    // contours: every stone's edges are cut, worn and broken a little; far stones lose them
    if (uBox > 0.5) {
        vec3 e = (1.0 - abs(vL)) * vH;
        vec3 ax = abs(vL);
        float face = ax.x > ax.y ? (ax.x > ax.z ? 0.0 : 2.0) : (ax.y > ax.z ? 1.0 : 2.0);
        float ed = face == 0.0 ? min(e.y, e.z) : face == 1.0 ? min(e.x, e.z) : min(e.x, e.y);
        // chips: the edge bites into the face here and there
        float chip = 0.0014 * smoothstep(0.62, 0.9, vnoise(vec2(dot(vW, vec3(260.0, 280.0, 240.0)), vSeed * 31.0)));
        float epx = max(ed - chip, 0.0) / ps / uPx;
        float blockPx = 2.0 * min(vH.x, min(vH.y, vH.z)) / ps / uPx;
        float wear = vnoise(vW.xz * 90.0 + vW.y * 60.0);
        float w = mix(0.7, 1.5, D) * (0.7 + 0.6 * wear);
        float edge = 1.0 - smoothstep(w, w + 1.0, epx);
        // (full ink: a cut line is never grey; far stones lose theirs by thinning, not fading)
        edgePx = epx;
        cov = max(cov, (1.0 - smoothstep(w * smoothstep(3.0, 9.0, blockPx), w * smoothstep(3.0, 9.0, blockPx) + 1.0, epx)) * step(3.0, blockPx));
    }
    // cut stone up close: pores (a jittered dot here and there, once a dot is bigger than a
    // pixel) and faces turned edge-on (joints) cut solid, not as a zebra of lines
    if (uBox > 0.5 && m < 3) {
        vec3 pw = vW * 55.0, cell = floor(pw), f = fract(pw) - 0.5;
        vec3 off = vec3(hash3(cell + 1.7), hash3(cell + 4.1), hash3(cell + 8.3)) - 0.5;
        vec3 dv = f - off * 0.6;
        float rr = length(dv - N * dot(dv, N));
        float pr = 0.035 + 0.05 * hash3(cell + 2.2);
        float prPx = pr / 55.0 / ps / uPx;
        float pore = step(hash3(cell + vSeed * 3.0), 0.22) * (1.0 - smoothstep(pr - 0.7 * pr / prPx, pr, rr)) * smoothstep(0.5, 1.2, prPx);
        cov = max(cov, pore);
        cov = max(cov, 1.0 - smoothstep(0.1, 0.22, abs(dot(N, V))));
    }
    if (m == 5 && vH.x < 0.02) cov = 1.0;          // dust prints as stipple
    // round things have no edges to cut: their outline is drawn where they turn away
    if (uBox < 0.5) {
        float rim = abs(dot(N, V));
        cov = max(cov, 1.0 - smoothstep(0.12, 0.3, rim));
    }
    // second inks: live blue (emissive surfaces print solid blue with a paper core), gold
    vec4 ink2 = vec4(0.0);
    vec3 ink = uInk;
    if (M.w > 1.5) {
        ink2 = vec4(uInkBlue, edgePx < 1.4 ? 1.0 : 0.72);
        cov *= 0.0;
    } else if (M.w > 0.5) {
        // metal: a gold wash under the dark line work, as a hand-coloured plate
        ink2 = vec4(uInkGold, 0.62 - 0.25 * smoothstep(0.3, 0.9, D));
    }
    // the blue light tints the lines it touches
    ink = mix(ink, uInkBlue * 0.8, clamp(glow * 1.6, 0.0, 0.85));
    o = vec4(print(gl_FragCoord.xy, cov, ink2, ink), 1.0);
}
`;
    const SKY_VS = `#version 300 es
layout(location = 0) in vec2 p;
void main() { gl_Position = vec4(p, 0.9999, 1.0); }
`;
    const SKY_FS = `#version 300 es
precision highp float;
${COMMON}
uniform mat4 uInvVP;
uniform vec3 uEye, uInk;
uniform float uZenith, uHorizon, uSpacing;
out vec4 o;
void main() {
    vec2 ndc = gl_FragCoord.xy / uRes * 2.0 - 1.0;
    vec4 w = uInvVP * vec4(ndc, 1.0, 1.0);
    vec3 d = normalize(w.xyz / w.w - uEye);
    float el = d.y;
    float D = mix(uHorizon, uZenith, smoothstep(0.0, 0.5, el));
    D *= 0.85 + 0.15 * vnoise(gl_FragCoord.xy / uPx * vec2(0.002, 0.02));
    // ruled sky: straight horizontal lines, thicker as the sky darkens
    float s = gl_FragCoord.y / (uSpacing * 0.8 * uPx);
    float cov = lines(s, clamp(D * 1.1, 0.0, 0.7), fwidth(s) * 0.8);
    if (D < 0.03) cov = 0.0;
    o = vec4(print(gl_FragCoord.xy, cov, vec4(0.0), uInk), 1.0);
}
`;

    function renderer(env, opt = {}) {
        const scale = opt.scale ?? 1;
        const W = Math.round(env.px[0] * scale), H = Math.round(env.px[1] * scale);
        const cv = document.createElement('canvas');
        cv.width = W;
        cv.height = H;
        const gl = cv.getContext('webgl2', { preserveDrawingBuffer: true, antialias: false });
        if (!gl) throw new Error('Engrave: no WebGL2');
        gl.getExtension('OES_standard_derivatives');
        const compile = (type, src) => {
            const s = gl.createShader(type);
            gl.shaderSource(s, src);
            gl.compileShader(s);
            if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error('Engrave shader: ' + gl.getShaderInfoLog(s));
            return s;
        };
        const program = (vs, fs) => {
            const p = gl.createProgram();
            gl.attachShader(p, compile(gl.VERTEX_SHADER, vs));
            gl.attachShader(p, compile(gl.FRAGMENT_SHADER, fs));
            gl.linkProgram(p);
            if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error('Engrave link: ' + gl.getProgramInfoLog(p));
            const u = {};
            return { p, u: (n) => (n in u ? u[n] : (u[n] = gl.getUniformLocation(p, n))) };
        };
        const main = program(VS, FS), shadowP = program(SHADOW_VS, SHADOW_FS), skyP = program(SKY_VS, SKY_FS);

        // shadow map
        const SM = opt.shadowSize ?? 2048;
        const depth = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, depth);
        gl.texStorage2D(gl.TEXTURE_2D, 1, gl.DEPTH_COMPONENT24, SM, SM);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_COMPARE_MODE, gl.COMPARE_REF_TO_TEXTURE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_COMPARE_FUNC, gl.LEQUAL);
        const sfb = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, sfb);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, depth, 0);
        gl.drawBuffers([gl.NONE]);
        gl.readBuffer(gl.NONE);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        // meshes
        const meshes = {};
        const instBuf = gl.createBuffer();
        function mesh(name, m) {
            const vao = gl.createVertexArray();
            gl.bindVertexArray(vao);
            const vb = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, vb);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(m.P), gl.STATIC_DRAW);
            gl.enableVertexAttribArray(0);
            gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 24, 0);
            gl.enableVertexAttribArray(1);
            gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 24, 12);
            const ib = gl.createBuffer();
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ib);
            const idx = m.P.length / 6 > 65535 ? new Uint32Array(m.I) : new Uint16Array(m.I);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, idx, gl.STATIC_DRAW);
            gl.bindBuffer(gl.ARRAY_BUFFER, instBuf);
            for (let k = 0; k < 4; k++) {
                gl.enableVertexAttribArray(2 + k);
                gl.vertexAttribPointer(2 + k, 4, gl.FLOAT, false, 64, k * 16);
                gl.vertexAttribDivisor(2 + k, 1);
            }
            gl.bindVertexArray(null);
            meshes[name] = { vao, n: m.I.length, type: idx instanceof Uint32Array ? gl.UNSIGNED_INT : gl.UNSIGNED_SHORT };
        }
        mesh('box', box());
        mesh('pyramid', pyramid());
        mesh('cylinder', cylinder());
        mesh('sphere', sphere());

        const tri = gl.createVertexArray();
        gl.bindVertexArray(tri);
        const tb = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, tb);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
        gl.bindVertexArray(null);

        const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
        const memo = document.createElement('canvas');
        memo.width = W;
        memo.height = H;
        let memoKey = null;

        function drawAll(prog, draws, onDraw) {
            for (const d of draws) {
                const me = meshes[d.mesh];
                if (!me || !d.inst.length) continue;
                gl.bindBuffer(gl.ARRAY_BUFFER, instBuf);
                gl.bufferData(gl.ARRAY_BUFFER, d.inst, gl.DYNAMIC_DRAW);
                if (onDraw) onDraw(d);
                gl.bindVertexArray(me.vao);
                gl.drawElementsInstanced(gl.TRIANGLES, me.n, me.type, 0, d.inst.length / 16);
            }
            gl.bindVertexArray(null);
        }

        function layer(key, f) {
            if (key === memoKey) return memo;
            const up = f.up ?? [0, 1, 0];
            const view = M4.lookAt(f.cam, f.target, up);
            const proj = M4.persp(f.fov ?? 0.8, W / H, f.near ?? 0.05, f.far ?? 200);
            const VP = M4.mul(proj, view);
            const sun = norm(f.sun ?? [-0.5, 0.5, 0.6]);
            const sc = f.shadow?.center ?? f.target, sr = f.shadow?.radius ?? 4;
            // the map follows the camera's subject (a small radius for close-ups keeps shadows
            // sharp); its depth range stays long so far casters still shade the close-up
            const sd = Math.max(sr * 2, 5);
            const lview = M4.lookAt([sc[0] + sun[0] * sd, sc[1] + sun[1] * sd, sc[2] + sun[2] * sd], sc, Math.abs(sun[1]) > 0.95 ? [0, 0, 1] : [0, 1, 0]);
            const LVP = M4.mul(M4.ortho(-sr, sr, -sr, sr, 0.01, sd * 2), lview);
            const draws = f.draws ?? [];
            const px = W / 1920;
            gl.enable(gl.DEPTH_TEST);
            // 1. shadow map
            gl.bindFramebuffer(gl.FRAMEBUFFER, sfb);
            gl.viewport(0, 0, SM, SM);
            gl.clear(gl.DEPTH_BUFFER_BIT);
            gl.useProgram(shadowP.p);
            gl.uniformMatrix4fv(shadowP.u('uVP'), false, LVP);
            gl.enable(gl.POLYGON_OFFSET_FILL);
            gl.polygonOffset(2, 4);
            drawAll(shadowP, draws.filter((d) => d.cast !== false));
            gl.disable(gl.POLYGON_OFFSET_FILL);
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            gl.viewport(0, 0, W, H);
            gl.clearColor(0, 0, 0, 1);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            const paper = hex(f.paper ?? '#efe6d2'), ink = hex(f.ink ?? '#2a2520');
            const frame = f.frame ?? [0, 0, 1, 1];
            const common = (P) => {
                gl.uniform2f(P.u('uRes'), W, H);
                gl.uniform1f(P.u('uPx'), px);
                gl.uniform3fv(P.u('uPaper'), paper);
                gl.uniform4fv(P.u('uFrame'), frame);
                gl.uniform3fv(P.u('uEye'), f.cam);
                gl.uniform3fv(P.u('uInk'), ink);
                gl.uniform1f(P.u('uSpacing'), f.spacing ?? 5);
            };
            // 2. sky
            gl.depthMask(false);
            gl.useProgram(skyP.p);
            common(skyP);
            gl.uniformMatrix4fv(skyP.u('uInvVP'), false, M4.inv(VP));
            gl.uniform1f(skyP.u('uZenith'), f.sky?.zenith ?? 0.45);
            gl.uniform1f(skyP.u('uHorizon'), f.sky?.horizon ?? 0.05);
            gl.bindVertexArray(tri);
            gl.drawArrays(gl.TRIANGLES, 0, 3);
            gl.depthMask(true);
            // 3. the scene
            gl.useProgram(main.p);
            common(main);
            gl.uniformMatrix4fv(main.u('uVP'), false, VP);
            gl.uniformMatrix4fv(main.u('uLVP'), false, LVP);
            gl.uniform3fv(main.u('uSun'), sun);
            gl.uniform3fv(main.u('uRight'), [view[0], view[4], view[8]]);
            gl.uniform1f(main.u('uSunK'), f.sunK ?? 0.95);
            gl.uniform1f(main.u('uFill'), f.fill ?? 0.3);
            gl.uniform1f(main.u('uFogNear'), f.fog?.[0] ?? 8);
            gl.uniform1f(main.u('uFogFar'), f.fog?.[1] ?? 40);
            gl.uniform3fv(main.u('uInkBlue'), hex(f.blue ?? '#2fb3cf'));
            gl.uniform3fv(main.u('uInkGold'), hex(f.gold ?? '#a8793a'));
            const L = (f.lights ?? []).slice(0, 8);
            const la = new Float32Array(32);
            L.forEach((l, i) => la.set([l[0], l[1], l[2], l[4] ?? 1], i * 4));
            gl.uniform4fv(main.u('uLights'), la);
            gl.uniform1i(main.u('uNL'), L.length);
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, depth);
            gl.uniform1i(main.u('uShadowMap'), 0);
            drawAll(main, draws, (d) => {
                gl.uniform1f(main.u('uBox'), d.box ? 1 : 0);
                gl.uniform1f(main.u('uTan'), d.box ? 0 : d.tan === 'y' ? 1 : 2);
            });
            const m = memo.getContext('2d');
            m.drawImage(cv, 0, 0);
            memoKey = key;
            return memo;
        }
        return {
            W, H, mesh: (n, m) => mesh(n, m), layer,
            render(g, key, f) {
                const img = layer(key, f);
                g.save();
                g.setTransform(1, 0, 0, 1, 0, 0);
                g.imageSmoothingQuality = 'high';
                g.drawImage(img, 0, 0, env.px[0], env.px[1]);
                g.restore();
            },
        };
    }

    // instance packing: push one instance into an array
    function inst(arr, c, mat, half, seed, q = [0, 0, 0, 1], glow = 0, bias = 0) {
        arr.push(c[0], c[1], c[2], mat, half[0], half[1], half[2], seed, q[0], q[1], q[2], q[3], glow, bias, 0, 0);
    }
    return { renderer, inst, box, pyramid, torus, cylinder, sphere, quat, qmul, M4 };
})();
