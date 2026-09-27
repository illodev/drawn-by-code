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

    // a field stone: a sphere pushed in and out by a few smooth bumps (seeded)
    function rock(seed = 1) {
        const m = sphere(9, 6), r = Motion.rng('rock-' + seed);
        const bumps = Array.from({ length: 7 }, () => [norm([r() - 0.5, r() - 0.5, r() - 0.5]), (r() - 0.5) * 0.5]);
        for (let i = 0; i < m.P.length; i += 6) {
            const n = [m.P[i], m.P[i + 1], m.P[i + 2]];
            let k = 1;
            for (const [d, a] of bumps) k += a * Math.max(0, dot(n, d)) ** 3;
            k *= n[1] < -0.3 ? 0.6 + 0.4 * (1 + n[1]) : 1;     // flat underneath, it sits
            m.P[i] *= k; m.P[i + 1] *= k; m.P[i + 2] *= k;
        }
        // flat shading: the normals of the facets, for a cut, chipped stone
        const P = [], I = [];
        for (let t = 0; t < m.I.length; t += 3) {
            const v = [0, 1, 2].map((j) => m.I[t + j] * 6).map((o) => [m.P[o], m.P[o + 1], m.P[o + 2]]);
            const n = norm(cross(sub(v[1], v[0]), sub(v[2], v[0])));
            for (const p of v) P.push(...p, ...n);
            I.push(t, t + 1, t + 2);
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
float sdBox2(vec2 q, vec2 c, vec2 h) { vec2 d = abs(q - c) - h; return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0); }
// the blocky little creature (the Claude Code mascot) as a sign: body, two slot eyes, arm
// stubs, four legs. Returns the outline distance in .x and the filled eyes' distance in .y
vec2 sdCritter(vec2 q) {
    float d = sdBox2(q, vec2(0.0, 0.04), vec2(0.28, 0.17));
    d = min(d, sdBox2(q, vec2(-0.36, 0.04), vec2(0.08, 0.055)));
    d = min(d, sdBox2(q, vec2(0.36, 0.04), vec2(0.08, 0.055)));
    for (int i = 0; i < 4; i++) d = min(d, sdBox2(q, vec2(-0.21 + 0.14 * float(i) + (i > 1 ? 0.0 : 0.0), -0.2), vec2(0.035, 0.07)));
    float e = min(sdBox2(q, vec2(-0.12, 0.07), vec2(0.028, 0.06)), sdBox2(q, vec2(0.12, 0.07), vec2(0.028, 0.06)));
    return vec2(abs(d), e);
}
float sdSeg(vec2 p, vec2 a, vec2 b) { vec2 pa = p - a, ba = b - a; return length(pa - ba * clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0)); }
// a library of invented signs (outline distance, sign about 0.6 across): fictional, in the
// spirit of a carved script, never real hieroglyphs
float glyphSign(int k, vec2 q) {
    if (k == 0) return abs(length(q) - 0.26);                                                   // ring
    if (k == 1) { vec2 a = abs(q); float d = abs(max(q.y * 0.5 + a.x * 0.87 - 0.2, -q.y - 0.26)); return (q.y < -0.2 && a.x < 0.06) ? 1.0 : d; }   // notched triangle
    if (k == 2) return min(sdSeg(q, vec2(0.0, -0.34), vec2(0.0, 0.3)), abs(length(q - vec2(0.0, 0.3)) - 0.07));   // staff with a knob
    if (k == 3) { float d = 1.0; for (int i = 0; i < 3; i++) d = min(d, abs(q.y - 0.16 * float(i - 1) - 0.05 * sin(q.x * 20.0)) + max(0.0, abs(q.x) - 0.32)); return d; }   // water
    if (k == 4) return min(abs(length(q * vec2(0.62, 1.3)) - 0.2), max(length(q) - 0.05, 0.0));  // eye
    if (k == 5) return min(sdSeg(q, vec2(-0.3, 0.2), vec2(0.3, 0.2)), abs(fract(q.x * 3.3 + 0.5) - 0.5) / 3.3 + max(0.0, abs(q.y + 0.04) - 0.22));   // comb
    if (k == 6) { float d = 1.0; for (int i = 0; i < 3; i++) { float w = 0.32 - 0.1 * float(i), y0 = -0.3 + 0.18 * float(i); d = min(d, min(sdSeg(q, vec2(-w, y0), vec2(w, y0)), min(sdSeg(q, vec2(-w, y0), vec2(-w, y0 + 0.18)), sdSeg(q, vec2(w, y0), vec2(w, y0 + 0.18))))); } return d; }   // stepped mound
    if (k == 7) return abs(q.x - 0.12 * sin(q.y * 11.0)) + max(0.0, abs(q.y) - 0.34) + (length(q - vec2(0.05, 0.34)) < 0.07 ? -0.02 : 0.0);   // serpent
    if (k == 8) return min(min(sdSeg(q, vec2(0.0, -0.34), vec2(0.0, 0.0)), abs(length(q - vec2(0.0, 0.26)) - 0.26) + max(0.0, q.y - 0.12)), min(sdSeg(q, vec2(0.0, 0.0), vec2(-0.18, 0.2)), sdSeg(q, vec2(0.0, 0.0), vec2(0.18, 0.2))));   // lotus
    if (k == 9) { float d = abs(length((q - vec2(-0.02, 0.02)) * vec2(1.0, 1.7)) - 0.22); d = min(d, sdSeg(q, vec2(0.18, 0.08), vec2(0.34, 0.02))); d = min(d, min(sdSeg(q, vec2(-0.05, -0.1), vec2(-0.08, -0.32)), sdSeg(q, vec2(0.05, -0.1), vec2(0.06, -0.32)))); return d; }   // bird
    if (k == 10) { float d = abs(length(q) - 0.12); for (int i = 0; i < 8; i++) { float a = float(i) * 0.785; vec2 v = vec2(cos(a), sin(a)); d = min(d, sdSeg(q, v * 0.18, v * 0.32)); } return d; }   // rayed disc
    if (k == 11) return max(abs(length(q) - 0.26), q.x - 0.06) ;                                   // crescent
    if (k == 12) { float d = abs(length(q - vec2(0.0, 0.22)) - 0.09); d = min(d, min(sdSeg(q, vec2(0.0, 0.12), vec2(0.0, -0.08)), sdSeg(q, vec2(0.0, -0.08), vec2(0.24, -0.08)))); d = min(d, min(sdSeg(q, vec2(0.24, -0.08), vec2(0.24, -0.32)), sdSeg(q, vec2(0.0, 0.02), vec2(0.2, 0.1)))); return d; }   // seated figure
    if (k == 13) { float d = 1.0; for (int i = 0; i < 4; i++) d = min(d, sdSeg(q, vec2(-0.3 + 0.2 * float(i), (i % 2 == 0) ? -0.2 : 0.2), vec2(-0.1 + 0.2 * float(i), (i % 2 == 0) ? 0.2 : -0.2))); return d; }   // zigzag
    if (k == 14) return min(abs(max(abs(q.x) - 0.22, abs(q.y) - 0.3)), min(sdSeg(q, vec2(-0.22, 0.1), vec2(0.22, 0.1)), sdSeg(q, vec2(0.0, 0.1), vec2(0.0, -0.3))));   // shrine
    return min(abs(length(q * vec2(1.0, 1.4)) - 0.2), min(min(sdSeg(q, vec2(-0.2, 0.0), vec2(-0.32, 0.12)), sdSeg(q, vec2(0.2, 0.0), vec2(0.32, 0.12))), min(sdSeg(q, vec2(-0.16, -0.1), vec2(-0.3, -0.24)), sdSeg(q, vec2(0.16, -0.1), vec2(0.3, -0.24)))));   // beetle
}
// ---- temple decoration, after the plates of Dendera (Description de l'Égypte, A. Vol. IV):
// a wall is a dado, three registers of offering scenes (a standing figure facing a seated
// one, a small altar between, short columns of signs above, a column of signs between
// panels), a frieze of uprights, a torus moulding and a fluted cavetto cornice. All of it in
// low relief: raised areas a shade lighter, a thin darker edge. Fictional signs, invented
// figures; in the spirit of the plates, never copies of real inscriptions.
float sminF(float a, float b, float k) { float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0); return mix(b, a, h) - k * h * (1.0 - h); }
// an Egyptian figure in profile, facing +x, feet at y = 0, about 1.7 tall: wig or crown,
// head with nose, broad shoulders narrowing to the waist, a flared kilt, striding legs, one
// arm raised holding an offering, the other down
// ---- figures, drawn to the Egyptian canon (feet at y 0, hairline ~1.42, facing +x) --------
// Head in profile with its wig, shoulders shown frontally, narrow waist, legs with thigh, knee,
// calf and ankle, feet in a stride; arms with elbow, wrist and hand. Men wear the kilt with its
// apron, goddesses the sheath dress. Inner lines (figureInner) cut the eye, collar, armlets,
// belt, pleats, anklets.
float sdTaper(vec2 p, vec2 a, vec2 b, float ra, float rb) {
    vec2 pa = p - a, ba = b - a;
    float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
    return length(pa - ba * h) - mix(ra, rb, h);
}
float sdTrap(vec2 p, float r1, float r2, float he) {     // r1 bottom, r2 top half widths
    vec2 k1 = vec2(r2, he), k2 = vec2(r2 - r1, 2.0 * he);
    p.x = abs(p.x);
    vec2 ca = vec2(p.x - min(p.x, (p.y < 0.0) ? r1 : r2), abs(p.y) - he);
    vec2 cb = p - k1 + k2 * clamp(dot(k1 - p, k2) / dot(k2, k2), 0.0, 1.0);
    float sg = (cb.x < 0.0 && ca.y < 0.0) ? -1.0 : 1.0;
    return sg * sqrt(min(dot(ca, ca), dot(cb, cb)));
}
float sdHead(vec2 q) {                // q relative to the centre of the skull; faces +x
    float d = length(q * vec2(1.0, 0.88)) - 0.085;
    d = min(d, sdTaper(q, vec2(0.04, 0.02), vec2(0.105, -0.035), 0.03, 0.012));        // nose
    d = min(d, sdTaper(q, vec2(0.05, -0.05), vec2(0.085, -0.075), 0.028, 0.014));      // lips
    d = min(d, length((q - vec2(0.05, -0.085)) * vec2(1.0, 1.3)) - 0.03);              // chin
    // the wig: to the nape and over the ear, its front edge a curve over the brow
    float wig = sdTaper(q, vec2(-0.02, 0.03), vec2(-0.04, -0.1), 0.095, 0.07);
    wig = max(wig, -(length(q - vec2(0.09, -0.04)) - 0.09));
    return min(d, wig);
}
float sdLegs(vec2 q, float stride) {
    // front leg: hip, knee, calf, ankle; the back leg the same, stepped back
    float d = sdTaper(q, vec2(0.08, 0.74), vec2(0.13 + stride * 0.35, 0.4), 0.072, 0.045);
    d = min(d, sdTaper(q, vec2(0.13 + stride * 0.35, 0.4), vec2(0.15 + stride * 0.6, 0.07), 0.05, 0.028));
    d = min(d, length((q - vec2(0.125 + stride * 0.45, 0.27)) * vec2(1.6, 1.0)) - 0.075);  // calf
    d = min(d, sdTaper(q, vec2(-0.01, 0.74), vec2(-0.02 - stride * 0.25, 0.4), 0.07, 0.045));
    d = min(d, sdTaper(q, vec2(-0.02 - stride * 0.25, 0.4), vec2(-0.03 - stride * 0.45, 0.07), 0.05, 0.028));
    d = min(d, length((q - vec2(-0.05 - stride * 0.33, 0.27)) * vec2(1.6, 1.0)) - 0.072);
    // feet: long, flat, the toes forward
    d = min(d, sdTaper(q, vec2(0.13 + stride * 0.6, 0.035), vec2(0.34 + stride * 0.6, 0.02), 0.035, 0.02));
    d = min(d, sdTaper(q, vec2(-0.06 - stride * 0.45, 0.035), vec2(0.15 - stride * 0.45, 0.02), 0.035, 0.02));
    return d;
}
float sdTorso(vec2 q) {
    float d = sdTrap(q - vec2(0.03, 1.03), 0.085, 0.19, 0.19);                           // shoulders to waist
    d = sminF(d, length((q - vec2(0.03, 1.2)) * vec2(0.6, 1.8)) - 0.12, 0.03);          // shoulder caps
    d = min(d, sdTaper(q, vec2(0.05, 1.2), vec2(0.06, 1.3), 0.04, 0.036));             // neck
    return d;
}
float sdStanding(vec2 q) {            // a king or god in a kilt, offering with the front hand
    float d = sdHead(q - vec2(0.06, 1.39));
    d = min(d, sdTorso(q));
    d = sminF(d, sdTrap(vec2(q.x - 0.06 - (0.84 - q.y) * 0.18, q.y - 0.7), 0.15, 0.1, 0.15), 0.02);   // kilt, flaring forward
    d = min(d, sdLegs(q, 0.35));
    // back arm hanging, a fist; front arm raised holding a jar
    d = min(d, sdTaper(q, vec2(-0.13, 1.17), vec2(-0.16, 0.93), 0.042, 0.033));
    d = min(d, sdTaper(q, vec2(-0.16, 0.93), vec2(-0.14, 0.7), 0.033, 0.025));
    d = min(d, length((q - vec2(-0.135, 0.66)) * vec2(1.0, 0.8)) - 0.033);
    d = min(d, sdTaper(q, vec2(0.19, 1.16), vec2(0.33, 1.0), 0.042, 0.032));
    d = min(d, sdTaper(q, vec2(0.33, 1.0), vec2(0.45, 1.15), 0.032, 0.024));
    d = min(d, length((q - vec2(0.48, 1.18)) * vec2(1.0, 1.3)) - 0.03);
    d = min(d, sdTrap(q - vec2(0.5, 1.27), 0.035, 0.05, 0.06) - 0.008);                // the jar
    return d;
}
float sdGoddess(vec2 q) {             // in a sheath dress, a sceptre and the sign of life
    float d = sdHead(q - vec2(0.06, 1.39));
    d = min(d, length((q - vec2(0.02, 1.36)) * vec2(1.2, 0.7)) - 0.1);               // long wig
    d = min(d, sdTorso(q));
    d = min(d, length(q - vec2(0.15, 1.08)) - 0.045);                                 // breast
    d = sminF(d, sdTrap(vec2(q.x - 0.04 - (0.9 - q.y) * 0.05, q.y - 0.5), 0.1, 0.09, 0.42), 0.04);   // the dress to the ankles
    d = min(d, sdLegs(q, 0.12));
    d = min(d, sdTaper(q, vec2(-0.13, 1.17), vec2(-0.15, 0.93), 0.04, 0.032));
    d = min(d, sdTaper(q, vec2(-0.15, 0.93), vec2(-0.13, 0.72), 0.032, 0.024));
    d = min(d, abs(length((q - vec2(-0.13, 0.64)) * vec2(1.0, 0.8)) - 0.04) - 0.012);   // ankh loop
    d = min(d, sdSeg(q, vec2(-0.13, 0.6), vec2(-0.13, 0.48)) - 0.012);
    d = min(d, sdSeg(q, vec2(-0.17, 0.57), vec2(-0.09, 0.57)) - 0.011);
    d = min(d, sdTaper(q, vec2(0.19, 1.16), vec2(0.3, 0.98), 0.04, 0.032));
    d = min(d, sdTaper(q, vec2(0.3, 0.98), vec2(0.36, 1.14), 0.032, 0.024));
    d = min(d, sdSeg(q, vec2(0.37, 0.03), vec2(0.37, 1.5)) - 0.013);                    // papyrus sceptre
    d = min(d, sdTrap(q - vec2(0.37, 1.55), 0.015, 0.06, 0.05));
    return d;
}
float sdSeated(vec2 q) {              // enthroned, faces −x (as the old convention)
    q.x = -q.x;
    float d = sdTrap(q - vec2(-0.12, 0.3), 0.17, 0.16, 0.3) - 0.01;                     // throne block
    d = min(d, sdBox2(q, vec2(-0.26, 0.66), vec2(0.03, 0.09)));                         // its low back
    d = min(d, sdBox2(q, vec2(-0.02, 0.02), vec2(0.36, 0.02)));                         // the dais
    d = min(d, sdHead(q - vec2(0.02, 1.33)));
    d = min(d, sdTorso((q - vec2(-0.04, -0.07) - vec2(0.03, 1.03)) * vec2(1.25, 1.0) + vec2(0.03, 1.03)) / 1.25);   // (slimmer: the torso seen seated)
    d = min(d, sdTaper(q, vec2(-0.02, 0.72), vec2(0.23, 0.66), 0.08, 0.06));           // thigh
    d = min(d, sdTaper(q, vec2(0.23, 0.66), vec2(0.25, 0.08), 0.052, 0.03));          // shin
    d = min(d, length((q - vec2(0.22, 0.38)) * vec2(1.7, 1.0)) - 0.07);
    d = min(d, sdTaper(q, vec2(0.25, 0.04), vec2(0.43, 0.025), 0.034, 0.02));          // foot
    d = min(d, sdTaper(q, vec2(0.15, 1.1), vec2(0.28, 0.9), 0.04, 0.032));             // arm to the staff
    d = min(d, sdTaper(q, vec2(0.28, 0.9), vec2(0.34, 1.02), 0.032, 0.025));
    d = min(d, sdSeg(q, vec2(0.36, 0.05), vec2(0.36, 1.5)) - 0.014);                    // was-sceptre
    d = min(d, sdSeg(q, vec2(0.36, 1.5), vec2(0.42, 1.56)) - 0.014);
    d = min(d, sdSeg(q, vec2(0.36, 0.05), vec2(0.32, 0.0)) - 0.012);
    d = min(d, abs(length(q - vec2(0.1, 0.84)) - 0.04) - 0.012);                         // sign of life on the knee
    d = min(d, sdSeg(q, vec2(0.1, 0.8), vec2(0.1, 0.72)) - 0.012);
    return d;
}
float sdKneeling(vec2 q) {                                                               // faces +x
    float d = sdHead(q - vec2(0.03, 0.99));
    d = min(d, sdTorso((q - vec2(0.0, -0.43)) * vec2(1.0, 1.0)));
    d = min(d, sdTaper(q, vec2(-0.02, 0.36), vec2(0.2, 0.06), 0.07, 0.05));             // thigh to knee
    d = min(d, sdTaper(q, vec2(0.2, 0.04), vec2(-0.18, 0.04), 0.045, 0.03));            // shin on the ground
    d = min(d, sdTaper(q, vec2(0.05, 0.75), vec2(0.28, 0.7), 0.04, 0.03));
    d = min(d, sdTaper(q, vec2(0.28, 0.7), vec2(0.36, 0.84), 0.03, 0.022));
    d = min(d, abs(length((q - vec2(0.4, 0.92)) * vec2(1.0, 2.2)) - 0.07) - 0.014);    // bowl
    return d;
}
// the lines cut inside a figure. Upper: the eye and its cosmetic line, the ear, the wig's
// strands, the broad collar in rows, armlets. Lower (standing only): the belt, the kilt's
// pleats and apron edge, bracelets, anklets. r: figure coordinates (standing head at 0.06, 1.39)
float figureInnerUpper(vec2 r) {
    vec2 h = r - vec2(0.06, 1.39);
    float d = abs(length((h - vec2(0.045, 0.012)) * vec2(1.0, 2.4)) - 0.022);           // eye
    d = min(d, sdSeg(h, vec2(0.065, 0.014), vec2(0.1, 0.02)));                           // cosmetic line
    d = min(d, abs(length((h - vec2(-0.01, -0.005)) * vec2(1.3, 1.0)) - 0.025));        // ear
    float wr = abs(fract((h.x + h.y * 0.3) / 0.022) - 0.5) * 0.022;
    d = min(d, wr + step(-0.04, h.x) * 9.0 + step(0.1, abs(h.y + 0.02)) * 9.0);          // wig strands
    vec2 c = r - vec2(0.04, 1.28);
    float cr = length(c * vec2(0.75, 1.0));
    d = min(d, abs(fract(cr / 0.03) - 0.5) * 0.03 + step(0.12, cr) * 9.0 + step(-0.02, c.y) * 9.0 + step(cr, 0.05) * 9.0);   // collar rows
    d = min(d, abs(r.y - 1.06) + max(0.0, abs(r.x + 0.15) - 0.04));                     // armlet
    return d;
}
float figureInner(vec2 q, float top) {
    vec2 r = vec2(q.x, q.y * 1.42 / top);
    float d = figureInnerUpper(r);
    d = min(d, abs(r.y - 0.86) + max(0.0, abs(r.x - 0.04) - 0.1));                      // belt
    d = min(d, abs(r.y - 0.89) + max(0.0, abs(r.x - 0.04) - 0.1));
    float kl = abs(fract((r.x - r.y * 0.45) / 0.04) - 0.5) * 0.04 + max(0.0, abs(r.y - 0.71) - 0.14);
    d = min(d, kl + 0.004);                                                              // pleats
    d = min(d, sdSeg(r, vec2(0.08, 0.85), vec2(0.18, 0.58)));                            // apron edge
    d = min(d, abs(r.y - 0.75) + max(0.0, abs(r.x + 0.145) - 0.035));                   // bracelet
    d = min(d, abs(r.y - 0.1) + max(0.0, abs(r.x - 0.28) - 0.04));                      // anklets
    d = min(d, abs(r.y - 0.1) + max(0.0, abs(r.x + 0.09) - 0.04));
    return d;
}
// the seated figure's lines (q as sdSeated takes it): upper lines, the belt, the throne's
// panel with its feathered frame
float seatedInner(vec2 q) {
    vec2 m = vec2(-q.x, q.y);
    float d = figureInnerUpper(m + vec2(0.04, 0.06));
    d = min(d, abs(m.y - 0.8) + max(0.0, abs(m.x + 0.01) - 0.08));
    float pan = sdBox2(m, vec2(-0.12, 0.3), vec2(0.1, 0.2));
    d = min(d, abs(pan));
    d = min(d, abs(fract(m.y / 0.035) - 0.5) * 0.035 + step(0.0, pan) * 9.0 + step(abs(m.x + 0.12), 0.06) * 9.0);
    return d;
}
// ---- temple walls v2, worked against a crop of Dendera Pl. 30 at the same size -------------
// What the plate shows and v1 lacked: no empty stone anywhere; figures fill each register's
// height; every gap between and above them is filled with columns of signs between ruled
// verticals; columns are stacks of thin bands of signs over one scene register; the relief
// reads by its bevel (the edge towards the light pale, the far edge dark), not by a line.
float crown(vec2 q, float k) {        // q: at the top of the head
    if (k < 1.0) return min(sdBox2(q, vec2(-0.02, 0.2), vec2(0.03, 0.2)) - 0.01, sdBox2(q, vec2(0.05, 0.2), vec2(0.03, 0.2)) - 0.01);     // two plumes
    if (k < 2.0) return min(abs(length(q - vec2(0.0, 0.14)) - 0.1) - 0.018, sdSeg(q, vec2(-0.14, 0.02), vec2(-0.09, 0.2)) - 0.015);   // disc and horns
    if (k < 3.0) return length((q - vec2(0.0, 0.14)) * vec2(1.6, 0.75)) - 0.12;                                                           // tall white crown
    return min(sdBox2(q, vec2(0.0, 0.06), vec2(0.09, 0.07)), sdSeg(q, vec2(0.06, 0.1), vec2(0.13, 0.28)) - 0.02);                          // red crown
}
float sdGod(vec2 q, float kind) {     // standing, facing +x, crowned; kind picks crown, dress and hands
    bool fem = fract(kind * 13.0) > 0.55;
    float d = fem ? sdGoddess(q) : sdStanding(q);
    d = min(d, crown(q - vec2(0.04, 1.46), floor(kind * 4.0)));
    if (!fem && fract(kind * 7.0) < 0.5) d = min(d, sdSeg(q, vec2(-0.2, 0.02), vec2(-0.2, 1.46)) - 0.014);      // a tall staff
    return d;
}
float sdThroned(vec2 q, float kind) {
    float d = sdSeated(q);
    return min(d, crown(q - vec2(-0.02, 1.41), floor(kind * 4.0)));
}
// signs in a column of text: cell size 1, one sign or two stacked
float textColumn(vec2 q, vec2 id, float seed) {
    float hg = hash(id + seed), hg2 = hash(id * 1.7 + seed + 3.1);
    vec2 lq = fract(q) - 0.5;
    return hg2 < 0.45 ? min(glyphSign(int(hg * 16.0), (lq - vec2(0.0, 0.23)) * 2.1) / 2.1, glyphSign(int(hg2 * 35.0) % 16, (lq + vec2(0.0, 0.23)) * 2.1) / 2.1)
                      : glyphSign(int(hg * 16.0), lq * 1.2) / 1.2;
}
// one scene register, height 2.4 (units), x along the wall; returns (edge, raised, sdf)
vec3 register(float x, float ry, vec2 hid, float pu, float lw, float vis) {
    float edge = 0.0, raised = 0.0;
    // the frame: a double rule at the foot, a single at the head
    edge = max(1.0 - smoothstep(lw, lw + pu, abs(ry - 0.03)), 1.0 - smoothstep(lw, lw + pu, abs(ry - 0.1)));
    edge = max(edge, 1.0 - smoothstep(lw, lw + pu, abs(ry - 2.37)));
    // scenes: groups of 2–4 figures, panel widths vary; a vertical rule closes each panel
    float xs = x + hid.y * 17.3;
    float cell = floor(xs / 3.4), px0 = xs - cell * 3.4;
    vec2 cid = vec2(cell, hid.y);
    float kind = hash(cid + 1.3), n = 2.0 + floor(hash(cid + 2.7) * 2.99);
    float mir = hash(cid + 5.5) < 0.5 ? 1.0 : -1.0;
    edge = max(edge, (1.0 - smoothstep(lw, lw + pu, abs(px0 - 0.02))) * step(0.1, ry) * step(ry, 2.37));
    vec2 q = vec2(px0 - 0.1, ry - 0.12);
    float fig = 9.0;
    float sc = 1.06;
    // the offering king at one end, the gods in a row facing him
    float xk = mir > 0.0 ? 0.35 : 3.0, xg0 = mir > 0.0 ? 1.15 : 0.35;
    vec2 qk = vec2(mir * (q.x - xk), q.y) / sc;
    float fk = sdGod(qk, hash(cid + 7.1)) * sc;
    fig = min(fig, fk);
    // (each figure's inner lines only inside its own body)
    float inner = figureInner(qk, 1.42) * sc + step(0.0, fk) * 9.0;
    for (int i = 0; i < 3; i++) {
        if (float(i) >= n - 1.0) break;
        float gx = xg0 + float(i) * 0.72;
        vec2 qg = vec2(-mir * (q.x - gx), q.y) / sc;
        float hk = hash(cid + float(i) * 3.3 + 9.0);
        float fg = hk < 0.3 ? sdThroned(qg + vec2(0.1, 0.0), hk * 3.0) * sc : sdGod(qg, hk) * sc;
        fig = min(fig, fg);
        inner = min(inner, (hk >= 0.3 ? figureInner(qg, 1.42) : seatedInner(qg + vec2(0.1, 0.0))) * sc + step(0.0, fg) * 9.0);
    }
    // an altar with offerings between the king and the gods
    float xa = mir > 0.0 ? 0.82 : 2.55;
    fig = min(fig, sdBox2(q, vec2(xa, 0.3), vec2(0.05, 0.3)));
    fig = min(fig, sdBox2(q, vec2(xa, 0.62), vec2(0.13, 0.03)));
    fig = min(fig, length(q - vec2(xa - 0.06, 0.7)) - 0.045);
    fig = min(fig, length(q - vec2(xa + 0.06, 0.7)) - 0.04);
    fig = min(fig, sdSeg(q, vec2(xa, 0.66), vec2(xa + 0.02, 0.92)) - 0.012);
    fig = min(fig, abs(length(q - vec2(xa + 0.02, 0.96)) - 0.04) - 0.01);
    raised = (1.0 - smoothstep(-pu, 0.0, fig)) * vis;
    edge = max(edge, (1.0 - smoothstep(lw * 0.8, lw * 0.8 + pu, abs(fig))) * 0.6 * vis);      // the contour
    // inside a figure: its collar, belt, pleats and wig as fine lines, the same tone as the wall
    edge = max(edge, (1.0 - smoothstep(lw * 0.6, lw * 0.6 + pu, inner)) * raised * 0.45);
    // text: columns of signs fill everything that is not a figure, between ruled verticals
    float cw = 0.2;
    float colx = floor(px0 / cw), cx = px0 - colx * cw;
    bool free = fig > 0.05 && ry > 0.16 && ry < 2.33 && px0 > 0.06;
    if (free) {
        edge = max(edge, (1.0 - smoothstep(lw * 0.7, lw * 0.7 + pu, abs(cx - 0.01))) * 0.6 * vis);
        float g = textColumn(vec2(cx / cw, (ry - 0.16) / cw), vec2(colx + cell * 31.0, floor((ry - 0.16) / cw) + hid.y * 7.0), hid.y);
        edge = max(edge, (1.0 - smoothstep(0.045, 0.045 + pu / cw, g)) * 0.5 * vis);
        raised = max(raised, (1.0 - smoothstep(-pu / cw, 0.0, g - 0.03)) * vis * 0.4);
    }
    return vec3(edge, raised, fig);
}
// ---- the Hathor capital, after the Dendera plates: one face per side of the block --------
// g: face coordinates in units of the block's half width (x ±1, y ±H/W). From the top: a
// shrine (naos) with its cornice and a row of uraei; the band of the wig over the brow; the
// broad face with almond eyes, arched brows, nose, full lips, cow's ears; the wig falling in
// two heavy lappets (vertical strands, bands across) that curl outwards at the foot; the
// broad collar under the chin; text columns in what is left at the corners.
// returns (lines, raised, carved, relief sdf)
// the creature, proportioned after its pixel drawing (body 8 × 6 cells, arms, four legs in
// two pairs, square eyes); q centred on the body, body half width 0.3. Returns (body, eyes)
vec2 sdClawd(vec2 q) {
    float d = sdBox2(q, vec2(0.0), vec2(0.3, 0.217));
    d = min(d, sdBox2(vec2(abs(q.x), q.y), vec2(0.373, 0.0), vec2(0.075, 0.075)));
    d = min(d, sdBox2(vec2(abs(q.x), q.y), vec2(0.235, -0.29), vec2(0.037, 0.08)));
    d = min(d, sdBox2(vec2(abs(q.x), q.y), vec2(0.125, -0.29), vec2(0.037, 0.08)));
    float e = sdBox2(vec2(abs(q.x), q.y), vec2(0.18, 0.1), vec2(0.037, 0.037));
    return vec2(d, e);
}
const vec2 CLAWD_C = vec2(0.0, 0.05);
const float CLAWD_S = 0.85;
float hathorRelief(vec2 g) {
    float face = sdClawd((g - CLAWD_C) / CLAWD_S).x * CLAWD_S;
    vec2 ga = vec2(abs(g.x), g.y);
    float lap = sdBox2(ga, vec2(0.44, -0.12), vec2(0.12, 0.44)) - 0.02;
    lap = min(lap, length(ga - vec2(0.5, -0.58)) - 0.11);                   // the curl
    float top = sdBox2(g, vec2(0.0, 0.36), vec2(0.56, 0.07)) - 0.01;        // wig over the brow
    float naos = min(sdBox2(g, vec2(0.0, 0.53), vec2(0.3, 0.1)), sdBox2(g, vec2(0.0, 0.67), vec2(0.37, 0.05)));
    float coll = max(length(g - vec2(0.0, -0.22)) - 0.52, -(g.y + 0.36));
    coll = max(coll, abs(g.x) - 0.32);
    return min(min(min(face, lap), top), min(naos, coll));
}
vec4 hathorFace(vec2 g, float pu, float seed) {
    float lw = max(0.006, pu * 0.9);
    vec2 ga = vec2(abs(g.x), g.y);
    float rel = hathorRelief(g);
    float L = 9.0;                                   // the drawn lines (sdf, width lw)
    // in the place of the goddess's face, the creature: its outline, its square eyes sunk
    // deep, the body worked with a fine hatch (its colour, as the plates give colour)
    vec2 cl = sdClawd((g - CLAWD_C) / CLAWD_S) * CLAWD_S;
    float face = cl.x;
    L = min(L, abs(face));
    L = min(L, abs(face + 0.018) + step(0.0, face) * 9.0);              // a second, inner cut
    L = min(L, abs(cl.y));
    float hatch = abs(fract((g.x + g.y) / 0.022) - 0.5) * 0.022 + step(-0.03, face) * 9.0 + step(cl.y, 0.01) * 9.0;
    // the wig over the brow: vertical strands between two rules
    float top = sdBox2(g, vec2(0.0, 0.36), vec2(0.56, 0.07)) - 0.01;
    float inTop = 1.0 - step(0.0, top);
    L = min(L, abs(top));
    L = min(L, max(abs(fract(g.x / 0.028) - 0.5) * 0.028, 0.0) + (1.0 - inTop) * 9.0 + step(0.0, face) * 0.0 - (1.0 - step(0.0, -face)) * 0.0);
    // lappets: strands and bands, the curl as a spiral
    float lap = sdBox2(ga, vec2(0.44, -0.12), vec2(0.12, 0.44)) - 0.02;
    float inLap = (1.0 - step(0.0, lap)) * step(0.0, face);
    L = min(L, abs(lap));
    L = min(L, abs(fract(ga.x / 0.024) - 0.5) * 0.024 + (1.0 - inLap) * 9.0);
    float bd = abs(fract((g.y + 0.1) / 0.1) - 0.5) * 0.1;
    L = min(L, max(bd - 0.004, 0.0) + (1.0 - inLap) * 9.0);
    vec2 cu = ga - vec2(0.5, -0.58);
    float cr = length(cu), ca = atan(cu.y, cu.x);
    float spiral = abs(fract((cr - ca / 6.2832 * 0.035) / 0.035) - 0.5) * 0.035;
    L = min(L, spiral + step(0.11, cr) * 9.0);
    L = min(L, abs(cr - 0.11) + step(0.0, -lap - 0.0) * 0.0);
    // the naos: posts, door, cornice with its cavetto flutes, uraei on top
    float naos = sdBox2(g, vec2(0.0, 0.53), vec2(0.3, 0.1));
    L = min(L, abs(naos));
    float door = sdBox2(g, vec2(0.0, 0.52), vec2(0.08, 0.08));
    L = min(L, abs(door));
    L = min(L, abs(door + 0.02));
    L = min(L, abs(g.x) + step(0.0, door) * 9.0);
    L = min(L, abs(fract(g.x / 0.03) - 0.5) * 0.03 + step(0.0, naos) * 9.0 + step(door, 0.0) * 9.0);
    // the winged disc over the door
    L = min(L, abs(length(g - vec2(0.0, 0.67)) - 0.028));
    L = min(L, abs(fract(g.x / 0.018) - 0.5) * 0.018 + step(0.05, abs(g.y - 0.665)) * 9.0 + step(0.2, abs(g.x)) * 9.0 + step(abs(g.x), 0.035) * 9.0);
    L = min(L, abs(sdBox2(g, vec2(0.0, 0.67), vec2(0.37, 0.05))));
    L = min(L, abs(fract(g.x / 0.035) - 0.5) * 0.035 + step(0.05, abs(g.y - 0.67)) * 9.0 + step(0.37, abs(g.x)) * 9.0);
    float ur = length(vec2(fract(g.x / 0.07) - 0.5, (g.y - 0.75) / 0.07 * 0.7)) * 0.07 - 0.02;
    L = min(L, abs(ur) + step(0.37, abs(g.x)) * 9.0);
    // the collar: rows of beads in arcs
    float cd = length(g - vec2(0.0, -0.22));
    float inColl = step(g.y, -0.36) * step(cd, 0.52) * step(abs(g.x), 0.32);
    L = min(L, abs(fract(cd / 0.045) - 0.5) * 0.045 + (1.0 - inColl) * 9.0);
    float bead = length(vec2(fract(atan(g.x, -(g.y + 0.22)) * cd / 0.03) - 0.5, fract(cd / 0.045) - 0.5)) - 0.28;
    // (beads: small rings along each row)
    // relief lightness, and text columns in the corners
    float raised = 1.0 - smoothstep(-pu, 0.0, rel);
    float lines = 1.0 - smoothstep(lw, lw + pu, L);
    lines = max(lines, (1.0 - smoothstep(lw * 0.5, lw * 0.5 + pu, hatch)) * 0.22);
    lines = max(lines, (1.0 - smoothstep(0.08, 0.08 + pu * 6.0, bead + 0.3)) * inColl * 0.4);
    if (rel > 0.02) {
        float cw = 0.09, cx = floor(g.x / cw), gx = g.x - cx * cw;
        lines = max(lines, (1.0 - smoothstep(lw * 0.8, lw * 0.8 + pu, abs(gx - 0.005))) * 0.6);
        float gg = textColumn(vec2(gx / cw, g.y / cw), vec2(cx, floor(g.y / cw) + seed * 11.0), seed);
        lines = max(lines, (1.0 - smoothstep(0.05, 0.05 + pu / cw, gg)) * 0.5);
    }
    // the face is modelled: darker towards its lower right, lighter at the brow and cheekbones
    float model = smoothstep(0.0, 1.0, dot(g - vec2(0.0, -0.02), vec2(0.6, -0.8)) / 0.35) * step(face, 0.0);
    float onFace = 1.0 - step(0.0, face);
    float eye = 1.0 - smoothstep(-pu, 0.0, cl.y);
    // the creature stands in a sunk niche, darker, ruled across, so its relief reads
    float niche = sdBox2(g, vec2(0.0, -0.035), vec2(0.315, 0.32));
    float inNiche = (1.0 - smoothstep(-pu, 0.0, niche)) * step(0.0, face) * step(0.0, lap);
    lines = max(lines, (1.0 - smoothstep(lw * 0.5, lw * 0.5 + pu, abs(fract(g.y / 0.02) - 0.5) * 0.02)) * 0.3 * inNiche);
    lines = max(lines, (1.0 - smoothstep(lw, lw + pu, abs(niche))) * 0.8);
    model += inNiche * 1.2;
    return vec4(lines, raised * (1.0 - 0.5 * onFace), model * 0.1 + onFace * 0.03 + 0.04 * (1.0 - step(0.0, top)) + 0.45 * eye, rel);
}
// ---- temple ceilings, after Dendera: bands between beams, each band one subject --------
// q: (across the band, along it) in world units; bw: band width. Kinds: a procession of
// vultures with spread wings holding shen rings; a field of five-pointed stars on a sunk,
// darker ground; boats of the hours, a seated god in each, stars over them. Text lines run
// along both edges of every band. Returns (lines, raised, carved, relief sdf).
float sdVulture(vec2 q) {          // q: x across the band (wing span ±1), y along (head +)
    vec2 qa = vec2(abs(q.x), q.y);
    float body = length((q - vec2(0.0, -0.05)) / vec2(0.11, 0.3)) - 1.0;
    body *= 0.1;
    // broad wings: the leading edge nearly straight, the trailing edge of long flight feathers
    float wing = max(max(qa.y - 0.22 - 0.06 * qa.x, -0.24 + 0.12 * qa.x - qa.y), max(qa.x - 0.97, 0.06 - qa.x));
    float tail = max(sdBox2(q, vec2(0.0, -0.42), vec2(0.13, 0.12)), -q.y - 0.55 + abs(q.x) * 0.4);
    float head = length(q - vec2(0.0, 0.32)) - 0.07;
    float beak = sdSeg(q, vec2(0.0, 0.36), vec2(0.07, 0.42)) - 0.02;
    return min(min(body, wing), min(min(tail, head), beak));
}
vec4 templeCeiling(vec2 q, float bw, float band, float pu) {
    float lw = max(0.005, pu * 0.9);
    float u = q.x / (bw * 0.5), U = bw * 0.5;       // u: −1..1 across
    float L = 9.0, rel = 9.0, carved = 0.0;
    // text lines along both edges, between rules
    float edgeB = abs(u) - 0.82;
    L = min(L, abs(abs(u) - 0.82) * U);
    L = min(L, abs(abs(u) - 0.97) * U);
    if (edgeB > 0.0 && abs(u) < 0.97) {
        float cw = 0.15 * U, cy = floor(q.y / cw), gy = q.y - cy * cw;
        float gg = glyphSign(int(hash(vec2(cy, band + sign(u) * 3.0)) * 16.0), vec2((abs(u) - 0.895) * U / cw, gy / cw - 0.5) * 1.3) / 1.3 * cw;
        L = min(L, abs(gg));
        L = min(L, abs(gy - 0.004));
        return vec4(1.0 - smoothstep(lw, lw + pu, L), 0.0, 0.0, 9.0);
    }
    float kind = mod(band, 3.0);
    vec2 w = vec2(u / 0.8, q.y / (U * 0.8));        // band-interior units (±1 across)
    if (kind < 1.0) {
        // vultures, one every 1.6 band-widths, text columns between
        float cell = floor(w.y / 1.3 + 0.5), vy = w.y - cell * 1.3;
        vec2 vq = vec2(w.x, vy);
        float v = sdVulture(vq);
        rel = v * U * 0.8;
        vec2 vqa = vec2(abs(vq.x), vq.y);
        // feathers: lines across the wing, the flight feathers longer at the trailing edge
        // coverts: rows of small scallops near the leading edge; flight feathers: long quills
        float lead = 0.22 + 0.06 * vqa.x - vqa.y;
        float fea = abs(fract(vqa.x / 0.055) - 0.5) * 0.055 + max(v, 0.0) * 9.0 + step(vqa.x, 0.12) * 9.0 + step(lead, 0.16) * 9.0;
        float sc2 = abs(length(vec2(fract(vqa.x / 0.06) - 0.5, fract(lead / 0.05) - 0.2) * vec2(0.06, 0.05)) - 0.025) + max(v, 0.0) * 9.0 + step(0.16, lead) * 9.0 + step(vqa.x, 0.12) * 9.0;
        float cov2 = min(abs(lead - 0.16) + max(v, 0.0) * 9.0 + step(vqa.x, 0.1) * 9.0, sc2);
        float bf = abs(fract(vq.y / 0.05) - 0.5) * 0.05 + max(v, 0.0) * 9.0 + step(0.11, abs(vq.x)) * 9.0;
        L = min(L, abs(rel));
        L = min(L, min(min(fea, cov2), bf) * U * 0.8);
        L = min(L, (length(vq - vec2(0.03, 0.33)) - 0.012) * U * 0.8);     // the eye
        // shen rings in the talons
        L = min(L, abs(length(vec2(abs(vq.x) - 0.18, vq.y + 0.35)) - 0.06) * U * 0.8);
        if (v > 0.03 && (abs(vy) > 0.46 || abs(w.x) > 0.99)) {
            float cw = 0.2, cx = floor(w.x / cw), gx = w.x - cx * cw;
            float gg = textColumn(vec2(gx / cw, vy / cw), vec2(cx, floor(vy / cw) + cell * 7.0 + band), band);
            L = min(L, max(gg - 0.045, 0.0) * cw * U * 0.8);
            L = min(L, abs(gx - 0.005) * U * 0.8);
        }
    } else if (kind < 2.0) {
        // stars: a sunk, darker field; stars in relief, in staggered rows
        vec2 c2 = w / 0.34;
        c2.x += 0.5 * mod(floor(c2.y), 2.0);
        vec2 id2 = floor(c2), f2 = fract(c2) - 0.5;
        float a5 = atan(f2.x, f2.y), r5 = length(f2);
        float star = (r5 - 0.3 * (0.55 + 0.45 * cos(5.0 * a5))) * 0.34 * U * 0.8;
        rel = star;
        L = min(L, abs(star));
        carved = 0.1;
    } else {
        // boats of the hours: a crescent hull, a cabin, a seated god; stars over them
        float cell = floor(w.y / 1.5 + 0.5), by = w.y - cell * 1.5;
        vec2 bq = vec2(by, -w.x);                   // along the band, "up" across it
        float hull = max(length(bq - vec2(0.0, 0.55)) - 0.75, -(length(bq - vec2(0.0, 0.8)) - 0.85));
        hull = max(hull, bq.y + 0.35);
        float god = sdSeated((bq - vec2(0.05, -0.28)) / 0.38 * vec2(-1.0, 1.0)) * 0.38;
        float cab = sdBox2(bq, vec2(-0.35, -0.18), vec2(0.1, 0.1));
        rel = min(min(hull, god), cab) * U * 0.8;
        L = min(L, abs(rel));
        L = min(L, (abs(fract(bq.x / 0.06) - 0.5) * 0.06 + max(hull, 0.0) * 9.0) * U * 0.8);
        L = min(L, figureInner((bq - vec2(0.05, -0.28)) / 0.38 * vec2(-1.0, 1.0), 1.2) * 0.38 * U * 0.8 + max(god, 0.0) * 9.0);
        vec2 sq = vec2(fract(bq.x / 0.3) - 0.5, (bq.y - 0.55) / 0.3);
        float st = (length(sq) - 0.22 * (0.55 + 0.45 * cos(5.0 * atan(sq.x, sq.y)))) * 0.3 * U * 0.8;
        if (bq.y > 0.3) { rel = min(rel, st); L = min(L, abs(st)); }
    }
    float raised = 1.0 - smoothstep(-pu, 0.0, rel);
    return vec4(1.0 - smoothstep(lw, lw + pu, L), raised, carved * (1.0 - raised), rel);
}
// returns (edge dark, raised light, carved dark, bevel sdf) — see the application for the bevel
vec4 templeWall(float h, float y, float H, float px, float seed, float isCol) {
    float U = clamp(H / 10.0, 0.12, 3.0), v = y / U, x = h / U, pu = px / U;
    float edge = 0.0, raised = 0.0, carved = 0.0, sdf = 9.0;
    float lw = max(0.012, pu * 0.9);
    float vis = smoothstep(0.02, 0.006, pu);            // details under ~1 px fade to tone
    if (isCol > 0.5) {
        // a column: a base band, one scene register, then a stack of thin bands of signs
        if (v < 0.5) {
            edge = (1.0 - smoothstep(lw, lw + pu, abs(v - 0.46))) * 0.8;
            float fl = abs(fract(x / 0.3) - 0.5) * 0.3;
            edge = max(edge, (1.0 - smoothstep(lw, lw + pu, fl)) * 0.35);
        } else if (v < 2.9) {
            vec3 r = register(x, v - 0.5, vec2(3.0, seed * 5.0 + 1.0), pu, lw, vis);
            edge = r.x; raised = r.y; sdf = r.z;
        } else {
            float bv = v - 2.9, band = floor(bv / 0.42), by = bv - band * 0.42;
            edge = max(1.0 - smoothstep(lw, lw + pu, abs(by - 0.01)), 1.0 - smoothstep(lw, lw + pu, abs(by - 0.05)));
            // alternate: a row of signs, a row of cartouches, a row of uprights
            float kindB = mod(band + floor(seed * 3.0), 3.0);
            float cw = 0.3;
            float cx = floor(x / cw), gx = x - cx * cw;
            vec2 lq = vec2(gx / cw - 0.5, (by - 0.24) / cw);
            float g;
            if (kindB < 1.0) g = textColumn(vec2(gx / cw, (by - 0.09) / cw + 0.0), vec2(cx, band * 13.0 + seed), seed) * cw;
            else if (kindB < 2.0) g = min(abs(length(lq * vec2(1.0, 0.55)) - 0.32) * cw, glyphSign(int(hash(vec2(cx, band)) * 16.0), lq * 1.8) / 1.8 * cw);
            else g = min(sdBox2(vec2(gx - cw * 0.5, by), vec2(0.0, 0.2), vec2(0.035, 0.15)), length(vec2(gx - cw * 0.5, by - 0.36)) - 0.045);
            edge = max(edge, (1.0 - smoothstep(0.012, 0.012 + pu, abs(g))) * 0.55 * vis);
            raised = max(raised, (1.0 - smoothstep(-pu, 0.0, g)) * 0.4 * vis);
            sdf = g;
        }
        return vec4(edge, raised, carved, sdf);
    }
    if (v < 1.2) {
        // dado: a band of tall stems (lotus and papyrus) under a double rule
        edge = max(1.0 - smoothstep(lw, lw + pu, abs(v - 1.16)), 1.0 - smoothstep(lw, lw + pu, abs(v - 1.1))) * 0.9;
        float fx = fract(x / 0.34) - 0.5;
        float stem = sdSeg(vec2(fx * 0.34, v), vec2(0.0, 0.08), vec2(0.0, 0.75)) - 0.012;
        stem = min(stem, length((vec2(fx * 0.34, v) - vec2(0.0, 0.86)) * vec2(1.0, 0.7)) - 0.08);
        edge = max(edge, (1.0 - smoothstep(lw, lw + pu, abs(stem))) * 0.7 * vis);
        raised = (1.0 - smoothstep(-pu, 0.0, stem)) * 0.6 * vis;
        sdf = stem;
    } else if (v < 8.4) {
        float rv = v - 1.2, reg = floor(rv / 2.4), ry = rv - reg * 2.4;
        vec3 r = register(x, ry, vec2(0.0, reg + seed * 7.0), pu, lw, vis);
        edge = r.x; raised = r.y; sdf = r.z;
    } else if (v < 9.2) {
        // frieze: a line of text between rules, then uprights with knobs
        float fy = v - 8.4;
        edge = max(1.0 - smoothstep(lw, lw + pu, abs(fy - 0.02)), 1.0 - smoothstep(lw, lw + pu, abs(fy - 0.3))) * 0.9;
        if (fy < 0.3) {
            float cw = 0.24, cx = floor(x / cw), gx = x - cx * cw;
            float g = glyphSign(int(hash(vec2(cx, 3.0 + seed)) * 16.0), vec2(gx / cw - 0.5, (fy - 0.16) / cw) * 1.25) / 1.25 * cw;
            edge = max(edge, (1.0 - smoothstep(0.012, 0.012 + pu, abs(g))) * 0.75 * vis);
            sdf = g;
        } else {
            float fx = fract(x / 0.22) - 0.5, uy = fy - 0.3;
            float up = min(sdBox2(vec2(fx * 0.22, uy), vec2(0.0, 0.26), vec2(0.045, 0.22)), length(vec2(fx * 0.22, uy - 0.52)) - 0.045);
            raised = (1.0 - smoothstep(-pu, 0.0, up)) * vis;
            edge = max(edge, (1.0 - smoothstep(lw, lw + pu, abs(up))) * 0.8 * vis);
            sdf = up;
        }
    } else if (v < 9.5) {
        float fy = (v - 9.2) / 0.3;
        carved = 0.25 * (1.0 - sin(fy * 3.1416));
        edge = (1.0 - smoothstep(lw * 1.5, lw * 1.5 + pu, abs(fract((x + (v - 9.2) * 1.5) / 0.18) - 0.5) * 0.18)) * 0.6 * vis;
    } else {
        float fy = (v - 9.5) / 0.5;
        carved = 0.35 * (1.0 - fy) * (1.0 - fy);
        edge = (1.0 - smoothstep(lw, lw + pu, abs(fract(x / 0.2) - 0.5) * 0.2)) * 0.6 * vis * (0.4 + 0.6 * fy);
    }
    return vec4(edge, raised, carved, sdf);
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
out vec3 vW; out vec3 vN; out vec3 vT; out vec3 vL; out vec3 vH; out vec3 vQ; out vec3 vNL; out vec3 vTL;
flat out float vMat; flat out float vSeed; flat out vec4 vX;
vec3 qrot(vec4 q, vec3 v) { return v + 2.0 * cross(q.xyz, cross(q.xyz, v) + q.w * v); }
uniform float uVH;    // viewport height, px
void main() {
    vec3 w = iA.xyz + qrot(iQ, aPos * iB.xyz);
    // a grain of dust passing by the lens stays a grain: never over ~16 px across
    if (iA.w > 4.5 && iA.w < 5.5 && (iB.x < 0.02 || iX.y < 0.0) && uVH > 0.0) {   // (and stars: bare-paper motes of any size)
        vec4 c0 = uVP * vec4(iA.xyz, 1.0), c1 = uVP * vec4(iA.xyz + vec3(0.0, iB.x, 0.0), 1.0);
        float rpx = c0.w > 1e-4 && c1.w > 1e-4 ? length(c1.xy / c1.w - c0.xy / c0.w) * 0.5 * uVH : 0.0;
        if (rpx > 8.0) w = iA.xyz + (w - iA.xyz) * (8.0 / rpx);
    }
    vW = w; vL = aPos; vH = iB.xyz; vMat = iA.w; vSeed = iB.w; vX = iX;
    // the texture's own space: the piece's unrotated local position (world units), offset per
    // piece, so lines and stones stay printed on a piece that moves or turns
    // (no per-piece offset here: on a curved piece an offset times the turning line direction
    // makes the ruling race; per-piece variety comes from the seed in each pattern instead)
    vQ = aPos * iB.xyz;
    vNL = normalize(aNor / iB.xyz);
    vN = qrot(iQ, normalize(aNor / iB.xyz));
    // hatch direction on a box face: horizontal courses on the sides, along x on top
    vec3 t = abs(aNor.x) > 0.5 ? vec3(0, 0, 1) : vec3(1, 0, 0);
    if (uTan > 0.5 && uTan < 1.5) t = vec3(0, 1, 0);
    if (uTan > 1.5) { vec3 c = cross(aNor, vec3(0, 1, 0)); t = dot(c, c) > 1e-4 ? normalize(c) : vec3(1, 0, 0); }
    vT = qrot(iQ, t);
    vTL = t;
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
in vec3 vW; in vec3 vN; in vec3 vT; in vec3 vL; in vec3 vH; in vec3 vQ; in vec3 vNL; in vec3 vTL;
flat in float vMat; flat in float vSeed; flat in vec4 vX;
uniform vec3 uEye, uSun, uRight;
uniform float uSunK, uFill, uSpacing, uBox, uFogNear, uFogFar, uEdge, uCourse, uMason, uTan, uChar, uInterior, uHathor, uFlag, uRock;
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
    vec3 Nsmooth = N;
    // loose stones (flag rock): split stone, each facet flat and its own tone, not a soft blob
    if (uRock > 0.5) {
        vec3 fn = normalize(cross(dFdx(vW), dFdy(vW)));
        N = dot(fn, N) < 0.0 ? -fn : fn;
    }
    vec3 T = normalize(vT - N * dot(vT, N));
    if (m == 5 && N.y > 0.9 && uBox > 0.5) {
        // the desert: long dunes and wind ripples tilt the ground's normal
        vec2 q = vW.xz;
        float h0 = vnoise(q * 0.45 + 3.0), hx = vnoise(q * 0.45 + vec2(3.05, 3.0)), hz = vnoise(q * 0.45 + vec2(3.0, 3.05));
        N = normalize(N + vec3(h0 - hx, 0.0, h0 - hz) * 3.5 + vec3(sin(dot(q, vec2(9.0, 3.0)) + vnoise(q * 2.0) * 4.0) * 0.05, 0.0, 0.0));
        T = uRight;
    }
    vec3 B = cross(N, T);
    // texture frame: the piece's own (the ground keeps the world's, turned to the camera)
    vec3 P = vQ, Nl = normalize(vNL), Tl = normalize(vTL - Nl * dot(vTL, Nl));
    if (!gl_FrontFacing) Nl = -Nl;
    if (m == 5) { P = vW; Nl = N; Tl = T; }
    vec3 Bl = cross(Nl, Tl);
    // a decorated temple wall or column indoors: one smooth dressed surface (no stone joints,
    // no per-stone tone), carrying the carved registers
    bool deco = uInterior > 0.5 && m < 2 && abs(N.y) < 0.35 && ((uBox > 0.5 && vH.y > 0.6) || (uBox < 0.5 && uTan > 0.5 && uTan < 1.5));
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
    float stone = deco ? (fbm3(vW * 3.0) - 0.5) * 0.06 : (fbm3(P * 14.0 + vSeed * 7.0) - 0.5) * 0.18 + (vSeed - 0.5) * 0.12;
    float lum = M.x * (lam + sky) * (1.0 + stone * (m < 2 || m == 5 ? 1.0 : 0.2)) + spec + glow * 0.6;
    float D = clamp(1.0 - lum + vX.y, 0.0, 1.0);
    // the plates' tone: long greys and few blacks (ink never quite closes)
    D = 0.12 + 0.8 * smoothstep(0.05, 0.92, D);
    // cut stone always carries some line work, heavier where it is weathered
    if (m < 2 && !deco) D = max(D, 0.12 + 0.05 * vSeed + 0.14 * smoothstep(0.4, 0.8, fbm3(P * 9.0 + vSeed * 5.0)));
    if (m < 2 && uInterior > 0.5) D = max(D, deco ? 0.36 : 0.34 + 0.08 * vSeed);     // indoors even sunlit stone is drawn, never bare paper
    if (m == 3 || m == 6) D = max(D, 0.45);          // metal is engraved too: its form in lines under the wash
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
    dirs[0] = Bl;
    dirs[1] = normalize(Bl * cos(0.95) + Tl * sin(0.95));
    dirs[2] = normalize(Bl * cos(-0.8) + Tl * sin(-0.8));
    float cs[3];
    // the first set carries the form; crossings come in thinner, only where it is dark
    // (deep shadow is heavy parallel lines with thin continuous light between them, not a
    // mesh of crossings: at video size a dense mesh reads as perforated metal)
    cs[0] = clamp(D, 0.0, 0.86);
    cs[1] = clamp((D - 0.6) * 0.6, 0.0, 0.16);
    cs[2] = 0.0;
    if (uBox < 0.5 && uTan > 0.5) { cs[1] = 0.0; cs[2] = 0.0; }   // one ruling on round things
    // charcoal: no ruled lines, the tone itself (the print filter lays it down as graphite on
    // the paper's tooth, in strokes); drawn marks (joints, edges) stay as pencil lines
    if (uChar > 0.5) { cs[0] = 0.0; cs[1] = 0.0; cs[2] = 0.0; }
    // (charcoal: the tone itself; metal is drawn lighter, its form carried by its ruled lines)
    float cov = uChar > 0.5 ? D * 0.92 : 0.0;
    if (uChar > 0.5 && M.w > 0.5 && M.w < 1.5) {
        // metal in charcoal: a tube's volume, dark at its turning edges and along the side away
        // from the light, a bright band where it faces the eye and the light
        float fv = abs(dot(N, V));
        float lit2 = max(dot(N, normalize(uSun + V)), 0.0);
        cov = clamp(0.3 + 0.6 * (1.0 - fv) * (1.0 - fv) - 0.3 * pow(lit2, 5.0) + 0.2 * (D - 0.5) + 0.08 * (vnoise(gl_FragCoord.xy / uPx * 0.08) - 0.5), 0.03, 0.92);
    }
    // metal rods and posts (round, along y): collars of double rules at intervals, spiral
    // fluting between them, so a rod is never a smooth white tube
    if (uBox < 0.5 && uTan > 0.5 && uTan < 1.5 && (m == 3 || m == 6)) {
        float r = length(P.xz), ang = atan(P.z, P.x);
        float fadeC = smoothstep(2.0, 6.0, r / max(ps, 1e-6));
        float per = r * 7.0, yy = P.y / per, fy2 = (fract(yy) - 0.5) * per;
        float L = min(abs(abs(fy2) - r * 0.35), abs(abs(fy2) - r * 0.6));
        float fl = (fract((ang * r + P.y * 0.6) / (r * 0.7)) - 0.5) * r * 0.7;
        L = min(L, abs(fl) + step(abs(fy2), r * 0.75) * 9.0);
        float lwC = max(ps * 0.7, r * 0.04);
        cov = max(cov, (1.0 - smoothstep(lwC, lwC + ps * 1.1, L)) * 0.6 * fadeC);
    }
    // rings are instruments, engraved as an armillary sphere's: a double rule along each rim,
    // on one half of the outer face a graduated scale (a tick every 2°, long every 10°), on the
    // other a line of signs every 15°; worn and pitted a little. Fades when the tube is small.
    if (uBox < 0.5 && uTan > 1.5 && (m == 3 || m == 6)) {
        vec2 rel = vec2(length(P.xz) - vH.x, P.y);
        float tr = length(rel), th = atan(rel.y, rel.x), ph = atan(P.z, P.x);
        float fadeR = smoothstep(3.0, 10.0, tr / max(ps, 1e-6));
        float aa = ps * 1.1, lwR = max(ps * 0.7, tr * 0.025);
        float c = th * tr;                                    // across the tube, world units
        float degU = vH.x * 6.2832 / 360.0;                    // one degree along the ring
        float deg = ph / 6.2832 * 360.0;
        // the tube read as a band: its outer edge (|th| < 0.4) carries the middle line; one
        // face (th ≈ +π/2) the scale between rules, the other (th ≈ −π/2) the signs
        float L = min(abs(abs(th) - 0.42) * tr, abs(abs(th) - 2.5) * tr);
        L = min(L, abs(abs(th) - 0.55) * tr);
        L = min(L, abs(th) * tr + step(0.08, abs(th)) * 9.0);
        float tick = abs(fract(deg / 2.0 + 0.5) - 0.5) * 2.0 * degU;
        float tick10 = abs(fract(deg / 10.0 + 0.5) - 0.5) * 10.0 * degU;
        if (th > 0.55 && th < 2.5) {
            L = min(L, tick + step(1.15, th) * 9.0);
            L = min(L, tick10 + step(1.75, th) * 9.0);
        }
        if (th < -0.55 && th > -2.5) {
            float cell = floor(deg / 15.0), gx = (fract(deg / 15.0) - 0.5) * 15.0 * degU;
            float gsz = tr * 1.1;
            float gg = glyphSign(int(hash(vec2(cell, vSeed * 7.0)) * 16.0), vec2(gx, c + tr * 1.52) / gsz) * gsz;
            L = min(L, gg);
            L = min(L, abs(fract(deg / 15.0 + 0.5) - 0.5) * 15.0 * degU + step(abs(th + 1.52), 0.9) * 0.0);
        }
        // a slim tube (under ~7 px across) can't hold the scale: bands every 10° across it,
        // a double band every 30°, and its middle line
        float tpx = tr / max(ps, 1e-6);
        if (tpx < 7.0) {
            float t30 = abs(fract(deg / 30.0 + 0.5) - 0.5) * 30.0 * degU;
            L = min(min(tick10, abs(t30 - degU * 1.2)), min(abs(th) * tr + step(0.15, abs(th)) * 9.0, abs(abs(th) - 1.57) * tr + step(0.15, abs(abs(th) - 1.57)) * 9.0));
            fadeR = smoothstep(1.2, 2.5, tpx);
            lwR = ps * 0.8;
        }
        float lines = (1.0 - smoothstep(lwR, lwR + aa, L)) * step(abs(th), 2.55);
        float wearR = smoothstep(0.3, 0.7, vnoise(vec2(ph * 20.0, th * 3.0) + vSeed * 5.0));
        cov = max(cov, lines * (0.55 + 0.25 * wearR) * fadeR);
        vec2 pq = vec2(ph * vH.x, c) / (tr * 0.12);
        cov = max(cov, step(hash(floor(pq) + vSeed), 0.05) * (1.0 - smoothstep(0.15, 0.35, length(fract(pq) - 0.5))) * 0.4 * fadeR);
    }
    for (int k = 0; k < 3; k++) {
        if (cs[k] < 0.035) continue;
        float along = dot(P, k == 0 ? Tl : cross(Nl, dirs[k])) / sp;
        float lin = dot(P, dirs[k]);
        // round meshes: measure along the surface (arc length), since a line direction that
        // turns with the surface makes a dot product with the position race
        if (uBox < 0.5 && uTan > 1.5) {          // ring (unit radius): lines run round the axis
            vec2 rel = vec2(length(P.xz) - vH.x, P.y);
            lin = atan(rel.y, rel.x) * length(rel);
            along = atan(P.z, P.x) * vH.x / sp;
        } else if (uBox < 0.5 && uTan > 0.5) {   // cylinder: lines run along the axis
            lin = atan(P.z, P.x) * length(P.xz);
            along = P.y / sp;
        }
        float s0 = lin + ((vnoise(vec2(along * 0.06, float(k) * 7.0 + vSeed * 13.0)) - 0.5) * 0.2 + bend) * sp;
        // two octaves of the same ruling (spacing a and 2a, the second's lines on the first's
        // even ones), each drawn at the full tone and cross-faded: no alternating thick/thin
        // lines (a barcode on small faces), the dropped lines just grow paler as they recede
        float flick = smoothstep(0.1, 0.4, vnoise(vec2(along * 0.15, floor(s0 / a + 0.5) * 5.7)) + D * 3.0);
        float s1 = s0 / a, s2 = s0 / (2.0 * a);
        float sw = 1.0 + (0.2 * vnoise(vec2(along * 0.12, floor(s1 + 0.5) * 3.1 + float(k))) - 0.1) * (1.0 - D);
        float c1 = lines(s1, cs[k] * sw, fwidth(s1) * 0.8);
        float c2 = lines(s2, cs[k] * sw, fwidth(s2) * 0.8);
        cov = max(cov, mix(c1, c2, fr) * flick);
    }
    float edgePx = 99.0;
    // masonry, drawn as in the plates: every face is a mosaic of small hand-cut stones in
    // courses, each outlined by a broken, wobbling burin line (heavier in shade), the darker
    // stones carrying a few short dashes; over it, in shade, a continuous etched tone
    if (m < 2 && (uBox > 0.5 || uMason > 0.5)) {
        cov *= uChar > 0.5 ? 0.8 : 0.45;
        float ch = uCourse;
        vec2 fp = (abs(Nl.y) > 0.7 ? vec2(dot(P, Tl), dot(P, Bl)) : vec2(dot(P, Tl), P.y)) + vSeed * vec2(3.71, 1.13);
        fp += (vec2(vnoise(fp / ch * 1.7), vnoise(fp.yx / ch * 1.7 + 5.0)) - 0.5) * ch * (uInterior > 0.5 ? 0.07 : 0.22);   // dressed stone indoors: straighter joints
        float row = floor(fp.y / ch), fy = fp.y / ch - row;
        float w = ch * (1.6 + 1.4 * hash(vec2(row, 3.0)));
        float ux = fp.x / w + hash(vec2(row, 7.0)) * 3.0;
        float col = floor(ux), fx = ux - col;
        float dx = min(fx, 1.0 - fx) * w, dy = min(fy, 1.0 - fy) * ch;
        float cpx = ch / ps / uPx;                     // course height on screen, px
        // joints measured in screen px along each axis (a foreshortened face keeps thin joints)
        float pyx = max(fwidth(fp.y), 1e-6) * uPx, pxx = max(fwidth(fp.x), 1e-6) * uPx;
        // far: the mosaic fades into tone; very near: one block is one stone, its own edges
        float cpx2 = ch / max(fwidth(fp.y), 1e-6) / uPx;   // along the slope (foreshortened faces too)
        float vis = smoothstep(1.2, 3.0, min(cpx, cpx2)) * (uInterior > 0.5 ? 1.0 : 1.0 - smoothstep(uChar > 0.5 ? 110.0 : 30.0, uChar > 0.5 ? 220.0 : 70.0, cpx));
        float st = hash(vec2(row, col) + vSeed * 17.0);   // this stone's own shade
        float lw = mix(0.3, 1.1, D) + 0.35 * st;
        float brk = step(0.3 + 0.45 * (1.0 - D), vnoise(fp / ch * vec2(2.5, 1.2) + 11.0) + 0.35 * D);
        if (uInterior > 0.5) brk = max(brk, step(0.12, vnoise(fp / ch * vec2(1.2, 0.6) + 23.0)));   // indoors: joints mostly continuous (dressed masonry)
        float jy = 1.0 - smoothstep(lw, lw + 0.9, dy / pyx);
        float jx = (1.0 - smoothstep(lw * 0.9, lw * 0.9 + 0.9, dx / pxx)) * step(0.15, fy) * step(fy, 0.85);
        float marks = max(jy * max(brk, D), jx * brk) * vis;
        // dark stones: two or three short dashes along the course
        float dash = lines(fy * 3.0, 0.35 * smoothstep(0.35, 0.9, D + st * 0.35), fwidth(fy * 3.0) * 0.8)
                   * step(0.5, vnoise(fp / ch * vec2(1.3, 4.0) + st * 9.0)) * vis
                   * (1.0 - (uInterior > 0.5 ? 0.0 : smoothstep(22.0, 70.0, cpx)));   // close up the stone's surface takes over
        float lit = max(cov, max(marks, dash));
        // in shade the stones themselves are dark (each its own depth), the joints lighter
        float joint = max(1.0 - smoothstep(0.5, 1.4, dy / pyx), (1.0 - smoothstep(0.5, 1.4, dx / pxx)) * step(0.1, fy) * step(fy, 0.9));
        // (up close, shade is burin lines over a light etched tone, never a flat grey)
        float stoneT = clamp(D * (0.9 + 0.3 * st), 0.0, 0.97);
        // outside, as the plate's shadow face: dark stones, lighter joints. Inside (interior),
        // joints are dark cracks between lit stones, never a negative
        float jointed = (1.0 - 0.45 * joint) * stoneT;
        if (uInterior > 0.5) {
            // a big dressed block seen close: never a flat grey. Weathered tone across its face,
            // edges worn darker, chisel marks in short parallel strokes (each block its own angle)
            float wtex = fbm3(vec3(fp * 7.0, st * 11.0)) - 0.5;
            float edgeDk = 1.0 - smoothstep(0.0, 0.04, min(dx, dy));
            float ang = (st - 0.5) * 1.2 + 0.6;
            vec2 cd = vec2(cos(ang), sin(ang));
            float cs1 = dot(fp, cd) / 0.009;
            float chis = lines(cs1, 0.35, fwidth(cs1) * 0.8) * step(0.45, vnoise(vec2(dot(fp, vec2(-cd.y, cd.x)) / 0.03, floor(cs1) * 0.37)));
            // (one dressed surface: stones differ only a little, the plates show smooth walls)
            float tI = clamp(stoneT * (0.9 + 0.1 * st) + wtex * 0.18 + edgeDk * 0.1 + chis * 0.06, 0.0, 0.97);
            jointed = max(tI, joint * 0.5 * (0.6 + 0.4 * st));
            if (deco) jointed = clamp(stoneT * 0.95 + (fbm3(vW * 6.0) - 0.5) * 0.08, 0.0, 0.97);
        }
        float shade = mix(max(min(cov / 0.45 * 1.15, 1.0), D * 0.3), jointed, vis);
        cov = mix(max(lit * 0.75, 0.06 + 0.2 * smoothstep(0.3, 0.6, D)), shade, smoothstep(0.42, 0.72, D));
        // up close the stone's own grain: stippled pits and short scratches, denser in shade
        // and where it is weathered (cells fixed to the surface, fading when under 1.5 px)
        vec2 gq = fp / 0.0016;
        vec2 gc = floor(gq), gf = fract(gq) - 0.5 - (vec2(hash(gc + 1.3), hash(gc + 7.9)) - 0.5) * 0.6;
        float gpx = 0.0016 / ps / uPx;
        float weather = smoothstep(0.35, 0.8, fbm3(P * 22.0 + vSeed * 3.0));
        float gd = step(hash(gc + vSeed * 5.0), 0.05 + 0.3 * D + 0.35 * weather);
        float grain = gd * (1.0 - smoothstep(0.18, 0.3, length(gf * vec2(1.0, 1.0 + 2.0 * hash(gc))))) * smoothstep(1.5, 3.0, gpx);
        cov = max(cov, grain * (1.0 - vis) * (uChar > 0.5 ? 0.3 : 1.0) * (deco ? 0.0 : 1.0));   // charcoal: pits are soft grey, not ink
        // outside, close up (a course over ~40 px): the limestone itself. Weathered hollows
        // (vugs) dark inside with a lit lip, pits, the coin-shaped fossils of Giza's limestone,
        // cracks through some blocks, arrises broken back irregularly, sand lodged in the
        // joints; a slow mottle so no block is one flat tone
        float nearS = uInterior > 0.5 ? 0.0 : smoothstep(22.0, 70.0, cpx);
        if (nearS > 0.0) {
            vec2 sq = fp / ch;
            float apx = 1.0 / cpx;                                   // one pixel, in course units
            vec2 vc = floor(sq / 0.22), vf = fract(sq / 0.22) - 0.5;
            vec2 vo = (vec2(hash(vc + 1.1), hash(vc + 2.2)) - 0.5) * 0.45;
            float vr = 0.07 + 0.17 * hash(vc + 3.3);
            float vd = (length((vf - vo) * vec2(1.0, 1.7)) - vr * (0.75 + 0.5 * vnoise(sq * 30.0 + st * 4.0))) * 0.22;
            float isV = step(hash(vc + st * 13.0), 0.16 + 0.2 * weather);
            float vug = isV * (1.0 - smoothstep(-apx, 0.0, vd));
            float lip = isV * (1.0 - smoothstep(apx * 0.6, apx * 1.8, abs(vd)));
            float sideV = dot(normalize(vf - vo + 1e-5), normalize(vec2(-0.6, 0.8)));
            vec2 pq = sq / 0.028, pc = floor(pq), pf = fract(pq) - 0.5;
            float pit = step(hash(pc + st), 0.07 + 0.18 * weather) * (1.0 - smoothstep(0.12, 0.32, length(pf))) * smoothstep(1.5, 3.0, 0.028 * cpx);
            vec2 nq = sq / 0.1, nc = floor(nq), nf = fract(nq) - 0.5 - (vec2(hash(nc + 5.0), hash(nc + 6.0)) - 0.5) * 0.4;
            float nr = length(nf * vec2(1.0, 1.5));
            float numm = step(hash(nc + 9.1), 0.05 + 0.08 * step(0.6, st)) * max(1.0 - smoothstep(0.0, apx * 10.0 + 0.02, abs(nr - 0.17)), 1.0 - smoothstep(0.03, 0.05, nr));
            float cn = vnoise((sq + st * 7.0) * 2.4) + 0.5 * vnoise(sq * 8.0 + st * 3.0);
            float crack = (1.0 - smoothstep(0.0, 0.003 + apx, abs(cn - 0.75) * 0.1)) * step(0.55, st) * smoothstep(0.35, 0.55, vnoise(sq * 1.2 + st * 9.0));
            float edgeD = min(dx, dy) / ch;
            float chipW = 0.025 + 0.08 * smoothstep(0.45, 0.85, vnoise(sq * 5.0 + st * 5.0));
            float chipped = 1.0 - smoothstep(chipW - apx, chipW, edgeD);
            float chipLine = (1.0 - smoothstep(apx * 0.5, apx * 1.5, abs(edgeD - chipW))) * step(0.04, chipW);
            float sandS = step(hash(floor(sq / 0.012) + st), 0.3) * (1.0 - smoothstep(0.0, 0.09, min(fy, 1.0 - fy))) * smoothstep(1.5, 3.0, 0.012 * cpx);
            float c0 = cov;
            cov += 0.18 * (fbm3(vec3(sq * 2.5, st * 7.0)) - 0.5) + 0.06 * (st - 0.5);
            cov = mix(cov, max(cov, 0.42 + 0.35 * smoothstep(-0.4, 0.6, sideV)), vug);
            cov = mix(cov, sideV > 0.0 ? cov * 0.6 : max(cov, 0.6), lip * 0.8);
            cov = max(cov, pit * 0.5);
            cov = max(cov, numm * 0.45);
            cov = max(cov, crack * 0.7);
            cov = mix(cov, cov + 0.14, chipped * 0.8);
            cov = max(cov, chipLine * 0.55);
            cov = max(cov, sandS * 0.4);
            cov = mix(c0, clamp(cov, 0.0, 1.0), nearS);
        }
        if (uInterior > 0.5) {
            vec3 gw = vW;
            if (abs(N.y) < 0.35) {
                // carved registers on the walls: bands of invented signs cut into the stone
                // (a ring, the notched triangle, a staff, a wave, an eye, a comb); fictional,
                // not hieroglyphs. Only on some stretches (panels), between ruled bands
                float hcoord = dot(gw, normalize(vec3(N.z, 0.0, -N.x)));
                float panel = step(0.2, hash(vec2(floor(hcoord / 1.6), floor(gw.x * 0.3) + 7.0)));
                if (N.z > 0.5 && gw.z < -9.3) panel = 0.0;          // the end wall carries only the cartouche
                // the cartouche: one large carved sign in an oval, on the wall facing the camera
                // above the exit ring at the end of the corridor
                if (N.z > 0.5 && gw.z < -9.3 && abs(gw.x - 0.05) < 0.5 && abs(gw.y - 1.3) < 0.34) {
                    vec2 q = vec2(gw.x - 0.05, gw.y - 1.3) / 0.6;
                    vec2 cr = sdCritter(q);
                    float oval = abs(length(q * vec2(0.88, 1.45)) - 0.5);
                    float aaC = 1.4 / max(0.6 / ps / uPx, 1.0);
                    float cut = max(max(1.0 - smoothstep(0.022, 0.022 + aaC, cr.x), 1.0 - smoothstep(0.0, aaC, cr.y)), 1.0 - smoothstep(0.018, 0.018 + aaC, oval));
                    float lip = max(1.0 - smoothstep(0.012, 0.012 + aaC, abs(cr.x - 0.04)), 1.0 - smoothstep(0.012, 0.012 + aaC, abs(oval - 0.035)));
                    // a smoothed field inside the oval (the carver dressed it flat and light)
                    float field = 1.0 - smoothstep(0.48, 0.5, length(q * vec2(0.88, 1.45)));
                    float wearC = 0.3 + 0.5 * smoothstep(0.3, 0.7, vnoise(q * 9.0 + 3.0));
                    cov = mix(cov, cov * 0.9, field);
                    cov = mix(cov, min(max(cov + 0.2, 0.55), 0.8), cut * wearC);
                    cov *= 1.0 - 0.25 * lip * (1.0 - cut) * wearC;
                }
            } else if (N.y > 0.7) {
                // the floor: dust and sand drifted against the walls and pillars, scuffed grit,
                // darker stains, stipple of pebbles and chips
                float wallNear = smoothstep(0.75, 1.25, abs(gw.x));
                float drift = smoothstep(0.35, 0.75, vnoise(gw.xz * 1.8) + wallNear * 0.5);
                float stain = smoothstep(0.55, 0.85, vnoise(gw.xz * 0.9 + 4.0)) * 0.25;
                vec2 pc = floor(gw.xz * 70.0), pf = fract(gw.xz * 70.0) - 0.5 - (vec2(hash(pc + 1.7), hash(pc + 8.1)) - 0.5) * 0.7;
                float peb = step(hash(pc), 0.05 + 0.25 * drift) * (1.0 - smoothstep(0.1, 0.25, length(pf))) * smoothstep(0.6, 1.5, 0.25 / 70.0 / ps / uPx);
                cov = mix(cov, max(cov * 0.6, 0.35 + 0.25 * vnoise(gw.xz * 6.0)), drift * 0.8);
                cov = max(max(cov, stain + cov * 0.8), peb * 0.8);
            }
        }
    }
    // temple decoration on interior walls (large blocks) and columns
    if (deco) {
        float hh, yy = P.y + vH.y;
        if (uBox > 0.5) hh = abs(Nl.x) > 0.5 ? P.z * sign(Nl.x) : -P.x * sign(Nl.z);
        else hh = atan(P.z, P.x) * vH.x;
        float isCol = uBox > 0.5 ? 0.0 : 1.0;
        float wseed = vSeed + floor(vW.x * 0.37) * 0.13 + floor(vW.z * 0.29) * 0.31;
        vec4 tw = templeWall(hh, yy, 2.0 * vH.y, ps, wseed, isCol);
        // the bevel: the relief's edge lit on the side towards the light, dark on the other
        // (the light comes from the upper left of every wall, as in the plate)
        float eB = max(ps * 1.5, 0.004);
        float sx = templeWall(hh + eB, yy, 2.0 * vH.y, ps, wseed, isCol).w - tw.w;
        float sy = templeWall(hh, yy + eB, 2.0 * vH.y, ps, wseed, isCol).w - tw.w;
        vec2 gr = normalize(vec2(sx, sy) + 1e-6);
        float rim = (1.0 - smoothstep(0.0, eB * 2.5, abs(tw.w))) * smoothstep(0.02, 0.006, ps / max(2.0 * vH.y / 10.0, 0.12));
        float facing = dot(gr, normalize(vec2(-0.6, 0.8)));
        float wear = 0.65 + 0.35 * smoothstep(0.25, 0.65, vnoise(vec2(hh, yy) * 2.3 + vSeed * 9.0));
        // the dressed surface: one tone, a faint mottle; relief lighter; lines; bevel
        // (a relief is the same stone as its ground: only a shade lighter, drawn by its bevel)
        cov = clamp(D * 0.9 + 0.06 + 0.06 * (fbm3(vW * 3.0) - 0.5), 0.0, 1.0);
        cov = mix(cov, cov * 0.88, tw.y * wear);
        cov = clamp(cov + 0.3 * tw.x * wear + tw.z + 0.28 * rim * max(-facing, 0.0) * wear - 0.2 * rim * max(facing, 0.0) * wear, 0.0, 1.0);
    }
    // Hathor capital (draw flag hathor): on each side of the block, the goddess's face in relief:
    // a broad face, almond eyes under brows, nose, mouth, cow's ears, the heavy wig falling in
    // two banded lappets, a small shrine on her head
    if (uHathor > 0.5 && abs(N.y) < 0.35) {
        float hh = abs(Nl.x) > 0.5 ? P.z * sign(Nl.x) : -P.x * sign(Nl.z);
        float wdt = abs(Nl.x) > 0.5 ? vH.z : vH.x;
        vec2 g = vec2(hh, P.y) / wdt;
        float pu2 = ps / wdt;
        vec4 hf = hathorFace(g, pu2, vSeed);
        float eB = max(pu2 * 1.5, 0.004);
        vec2 gr = normalize(vec2(hathorRelief(g + vec2(eB, 0.0)), hathorRelief(g + vec2(0.0, eB))) - hf.w + 1e-6);
        float rim = 1.0 - smoothstep(0.0, eB * 2.5, abs(hf.w));
        float facing = dot(gr, normalize(vec2(-0.6, 0.8)));
        float wear = 0.7 + 0.3 * smoothstep(0.25, 0.65, vnoise(g * 5.0 + vSeed * 9.0));
        // dressed stone, no courses: the capital is one carved block
        cov = clamp(D * 0.9 + 0.06 + 0.06 * (fbm3(vW * 3.0) - 0.5), 0.0, 1.0);
        cov = mix(cov, cov * 0.86, hf.y * wear);
        cov = clamp(cov + hf.z + 0.34 * hf.x * wear + 0.3 * rim * max(-facing, 0.0) - 0.2 * rim * max(facing, 0.0), 0.0, 1.0);
    }
    // the bell under a Hathor block (round mesh, flag hathor): two rows of lotus petals over a
    // double rule, the petals ribbed
    if (uHathor > 0.5 && uBox < 0.5 && abs(N.y) < 0.6) {
        float a = atan(P.z, P.x) / 6.2832 * 20.0, y = clamp(P.y / vH.y * 0.5 + 0.5, 0.0, 1.0);
        float pa = fract(a) - 0.5, pb = fract(a + 0.5) - 0.5, fa = max(fwidth(a), 1e-4);
        float L = abs(abs(pa) - 0.47 * sqrt(max(1.0 - y, 0.0)));
        L = min(L, abs(pa) + step(0.85, y) * 9.0);
        L = min(L, abs(abs(pb) - 0.4 * sqrt(max(0.62 - y, 0.0) / 0.62)) + step(abs(pa), 0.47 * sqrt(max(1.0 - y, 0.0))) * 0.0 + step(0.62, y) * 9.0);
        L = min(L, abs(abs(pa) - 0.2 * sqrt(max(1.0 - y, 0.0))) * 1.0 + step(0.7, y) * 9.0 + step(y, 0.12) * 9.0);
        float rule = min(abs(y - 0.06), abs(y - 0.1)) * 20.0;
        cov = clamp(D * 0.9 + 0.08 + 0.05 * (fbm3(vW * 3.0) - 0.5), 0.0, 1.0);
        cov = clamp(cov + 0.34 * (1.0 - smoothstep(0.03, 0.03 + fa * 1.5, min(L, rule))) + 0.08 * smoothstep(0.1, 0.45, abs(pa)), 0.0, 1.0);
    }
    // temple floors: large flagstones in rows (not the mosaic), each its own slight tone,
    // worn lighter where walked; broken joints, cracks in some, chipped corners, pits, sand
    // in the joints and drifted in patches, pebbles with their small shadow
    if (uInterior > 0.5 && m < 2 && N.y > 0.7 && uBox > 0.5 && vH.x > 1.0) {
        float kF = uFlag / 0.8;                     // every feature scales with the flagstones
        vec2 fq = vW.xz / kF;
        float psF = ps / kF;
        fq += (vec2(vnoise(fq * 1.3), vnoise(fq.yx * 1.3 + 5.0)) - 0.5) * 0.04;
        float rw = 0.8, row = floor(fq.y / rw), fy = fq.y / rw - row;
        float len = 1.0 + 0.6 * hash(vec2(row, 2.0));
        float ux = fq.x / len + hash(vec2(row, 9.0)), col = floor(ux), fx = ux - col;
        vec2 sid = vec2(row, col);
        vec2 cc = vec2(min(fx, 1.0 - fx) * len, min(fy, 1.0 - fy) * rw);
        float dj = min(cc.x, cc.y);
        float st = hash(sid + vSeed * 3.0);
        float px = psF * uPx;
        cov = clamp(D * 0.8 + 0.22 + (st - 0.5) * 0.07 + 0.06 * (fbm3(vW * 4.0) - 0.5), 0.0, 1.0);
        cov -= 0.05 * smoothstep(0.08, 0.35, dj) * smoothstep(0.3, 0.7, vnoise(fq * 0.7 + 2.0));   // worn
        // the joint: a dark line with broken edges; sand lighter beside it
        float jw = 0.006 + 0.012 * smoothstep(0.55, 0.85, vnoise(fq * 11.0 + st));
        float joint = 1.0 - smoothstep(jw, jw + psF * 1.2, dj);
        float sandJ = (1.0 - smoothstep(jw, jw + 0.03, dj)) * (1.0 - joint) * smoothstep(0.4, 0.7, vnoise(fq * 5.0));
        // cracks: a thin wandering line across some stones, with a branch
        float cn = vnoise((fq + st * 7.0) * 2.2) + 0.5 * vnoise((fq + st * 3.0) * 7.0);
        float crack = (1.0 - smoothstep(0.0, 0.0025 + ps, abs(cn - 0.75) * 0.08)) * step(0.65, st) * smoothstep(0.4, 0.6, vnoise(fq * 1.5 + st * 9.0));
        // a chipped corner (darker, broken outline)
        float chipd = cc.x + cc.y - 0.07 - 0.03 * vnoise(fq * 35.0);
        float chip = step(0.6, hash(sid + 3.0)) * step(cc.x, 0.2) * step(cc.y, 0.2) * (1.0 - smoothstep(0.0, psF, chipd));
        float chipL = step(0.6, hash(sid + 3.0)) * step(cc.x, 0.2) * step(cc.y, 0.2) * (1.0 - smoothstep(0.002, 0.002 + psF, abs(chipd)));
        // pits
        vec2 pq = fq / 0.02, pc2 = floor(pq), pf2 = fract(pq) - 0.5;
        float pit = step(hash(pc2 + st), 0.06) * (1.0 - smoothstep(0.12, 0.3, length(pf2))) * smoothstep(1.2, 3.0, 0.02 / px);
        // sand drifts: stipple, denser in the patches
        float drift = smoothstep(0.5, 0.8, vnoise(fq * 0.9 + 7.0) + 0.3 * vnoise(fq * 3.0));
        vec2 sq = fq / 0.008, sc3 = floor(sq);
        float sand = step(hash(sc3 + 0.3), 0.1 * drift) * smoothstep(1.0, 2.5, 0.008 / px);
        // pebbles: lit on the sun's side, a shadow on the other
        vec2 bq = fq / 0.07, bc = floor(bq), bf = fract(bq) - 0.5 - (vec2(hash(bc + 1.7), hash(bc + 8.1)) - 0.5) * 0.5;
        float hasP = step(hash(bc + 4.4), 0.03 + 0.08 * drift);
        float pr = 0.1 + 0.12 * hash(bc + 2.2);
        vec2 sd = normalize(uSun.xz + 1e-4);
        float peb = hasP * (1.0 - smoothstep(pr - 0.03, pr, length(bf)));
        float pebDark = peb * smoothstep(-0.2, 0.6, dot(bf, -sd) / pr);
        float pebSh = hasP * (1.0 - smoothstep(pr - 0.02, pr + 0.02, length(bf + sd * pr * 0.8))) * (1.0 - peb);
        float pv = smoothstep(1.5, 4.0, 0.07 / px);
        cov = clamp(cov - 0.08 * sandJ + 0.18 * sand, 0.0, 1.0);
        cov = max(clamp(cov + joint * 0.3, 0.0, 1.0), joint * 0.8);        // joints read in shade too
        cov = max(clamp(cov + crack * 0.2, 0.0, 1.0), crack * 0.65);
        cov = mix(cov, cov + 0.18, chip);
        cov = max(cov, chipL * 0.6);
        cov = max(cov, pit * 0.5);
        cov = mix(cov, mix(cov * 0.6, 0.75, pebDark), peb * pv);
        cov = max(cov, pebSh * 0.55 * pv);
        cov = clamp(cov, 0.0, 1.0);
    }
    // ceilings: the sky of the temple, in bands between beams (templeCeiling)
    if (uInterior > 0.5 && m < 2 && N.y < -0.7 && uBox > 0.5 && vH.x > 1.0) {
        float period = 1.3, bw = 1.1;
        float bx = vW.x / period, band = floor(bx), fx = (bx - band) * period;
        float pc = 0.02 / ps / uPx;
        cov = clamp(D * 0.9 + 0.1 + 0.06 * (fbm3(vW * 3.0) - 0.5), 0.0, 1.0);
        if (fx > bw) {
            // the beam: its underside dressed, darker, two rules and a line of signs
            float by = (fx - bw - (period - bw) * 0.5) / ((period - bw) * 0.5);
            cov = clamp(cov + 0.12, 0.0, 1.0);
            float Lb = abs(abs(by) - 0.75) * (period - bw) * 0.5;
            float cw = 0.09, cz = floor(vW.z / cw), gz = vW.z - cz * cw;
            float gg = glyphSign(int(hash(vec2(cz, band)) * 16.0), vec2(by * (period - bw) * 0.5 / cw, gz / cw - 0.5) * 1.3) / 1.3 * cw;
            if (abs(by) < 0.7) Lb = min(Lb, abs(gg));
            cov = clamp(cov + 0.3 * (1.0 - smoothstep(0.005, 0.005 + ps, Lb)) * smoothstep(1.0, 3.0, pc), 0.0, 1.0);
        } else {
            vec2 q = vec2(fx - bw * 0.5, vW.z);
            vec4 tc = templeCeiling(q, bw, band + floor(vSeed * 5.0), ps);
            float eB = max(ps * 1.5, 0.003);
            vec2 gr = normalize(vec2(templeCeiling(q + vec2(eB, 0.0), bw, band + floor(vSeed * 5.0), ps).w, templeCeiling(q + vec2(0.0, eB), bw, band + floor(vSeed * 5.0), ps).w) - tc.w + 1e-6);
            float rim = 1.0 - smoothstep(0.0, eB * 2.5, abs(tc.w));
            float facing = dot(gr, normalize(vec2(-0.6, 0.8)));
            float fade = smoothstep(1.0, 3.0, pc);
            cov = mix(cov, cov * 0.86, tc.y * fade);
            cov = clamp(cov + (tc.z + 0.32 * tc.x + 0.25 * rim * max(-facing, 0.0) - 0.18 * rim * max(facing, 0.0)) * fade, 0.0, 1.0);
        }
    }
    // contours: every stone's edges are cut, worn and broken a little; far stones lose them
    if (uBox > 0.5) {
        vec3 e = (1.0 - abs(vL)) * vH;
        vec3 ax = abs(vL);
        float face = ax.x > ax.y ? (ax.x > ax.z ? 0.0 : 2.0) : (ax.y > ax.z ? 1.0 : 2.0);
        float ed = face == 0.0 ? min(e.y, e.z) : face == 1.0 ? min(e.x, e.z) : min(e.x, e.y);
        // chips: the edge bites into the face here and there
        float chip = 0.0014 * smoothstep(0.62, 0.9, vnoise(vec2(dot(P, vec3(260.0, 280.0, 240.0)), vSeed * 31.0)));
        float epx = max(ed - chip, 0.0) / ps / uPx;
        float blockPx = 2.0 * min(vH.x, min(vH.y, vH.z)) / ps / uPx;
        float wear = vnoise(P.xz * 90.0 + P.y * 60.0);
        // edges are cut thin: in the plates form is carried by tone, not by outlines
        float w = uEdge * mix(0.5, 1.0, D) * (0.7 + 0.6 * wear);
        float edge = 1.0 - smoothstep(w, w + 1.0, epx);
        // (full ink: a cut line is never grey; far stones lose theirs by thinning, not fading)
        edgePx = epx;
        float we = w * smoothstep(3.0, 9.0, blockPx);
        cov = max(cov, (1.0 - smoothstep(we, we + 1.0, epx)) * clamp(we / 0.6, 0.0, 1.0));
    }
    // cut stone up close: pores (a jittered dot here and there, once a dot is bigger than a
    // pixel) and faces turned edge-on (joints) cut solid, not as a zebra of lines
    if (uBox > 0.5 && m < 3) {
        vec3 pw = P * 55.0, cell = floor(pw), f = fract(pw) - 0.5;
        vec3 off = vec3(hash3(cell + 1.7), hash3(cell + 4.1), hash3(cell + 8.3)) - 0.5;
        vec3 dv = f - off * 0.6;
        float rr = length(dv - N * dot(dv, N));
        float pr = 0.02 + 0.03 * hash3(cell + 2.2);
        float prPx = pr / 55.0 / ps / uPx;
        float pore = 0.0 * step(hash3(cell + vSeed * 3.0), 0.14) * (1.0 - smoothstep(pr - 0.7 * pr / prPx, pr, rr)) * smoothstep(0.5, 1.2, prPx);
        cov = max(cov, pore);
        cov = max(cov, 1.0 - smoothstep(0.1, 0.22, abs(dot(N, V))));
    }
    if (m == 5 && vH.x < 0.02) cov = vX.y < 0.0 ? 0.0 : (uChar > 0.5 ? 0.45 + 0.4 * vSeed : 1.0);   // light motes (bias < 0) print as bare paper   // dust: stipple (soft grey specks in charcoal)
    // ground (the terrain instance): shade and dirt. Charcoal pushes the dune's turned-away
    // slopes into real shadow; then what a desert floor carries: pebbles (stipple, denser in
    // hollows), darker drifts and wind streaks, grit scuffed into the lee sides, ripples
    if (m == 5 && vH.x > 0.5 && uChar > 0.5) {
        vec2 g = vW.xz;
        float slope = 1.0 - N.y;
        float turn = clamp(-dot(N, uSun) * 2.0 + 0.3, 0.0, 1.0) * (1.0 - sh * 0.5);   // lee, unlit
        float dd = 1.0 - sh;                                                            // cast shadow
        float patches = smoothstep(0.4, 0.75, vnoise(g * 1.3 + 7.0)) * 0.3 + smoothstep(0.45, 0.8, vnoise(g * vec2(0.6, 3.5) + 2.0)) * 0.18 + (vnoise(g * 5.0) - 0.5) * 0.12;
        float tone = max(D, 0.2) + 0.45 * turn + 0.35 * dd + patches + 0.25 * slope;
        // ripples: fine wavy bands across the wind, stronger on the lit windward side
        // wind ripples in patches: their direction wanders, they break off, their lee side
        // (the steep side) is the dark stroke, the windward side is left bare
        float ra = 0.35 + 0.9 * (vnoise(g * 0.35 + 11.0) - 0.5);
        vec2 rd = vec2(cos(ra), sin(ra));
        float ph = dot(g, rd) * 30.0 + vnoise(g * 2.5) * 5.0;
        float saw = fract(ph / 6.2832);
        float lee = smoothstep(0.78, 0.9, saw) * (1.0 - smoothstep(0.9, 1.0, saw));
        float patchR = smoothstep(0.35, 0.65, vnoise(g * 0.8 + 3.0));
        tone += 0.16 * lee * patchR * (1.0 - turn) * smoothstep(0.004, 0.015, 0.033 / max(ps * uPx * 30.0, 1e-4) * 0.01);
        // large-scale mottling: darker drifts of coarse sand and grit, lighter wind-scoured
        // bands, so a lit slope is never one flat tone
        tone += 0.14 * (fbm3(vec3(g * 1.6, 2.0)) - 0.5) + 0.1 * smoothstep(0.55, 0.8, vnoise(g * vec2(0.5, 2.8) + 8.0));
        // pebbles: jittered dots fixed to the ground, fading when smaller than a pixel
        vec2 pc = floor(g * 90.0), pf = fract(g * 90.0) - 0.5 - (vec2(hash(pc + 1.7), hash(pc + 8.1)) - 0.5) * 0.7;
        float pr = 0.09 + 0.2 * hash(pc + 3.3);
        float dens = (uInterior > 0.5 ? 0.18 : 0.08) + 0.2 * smoothstep(0.4, 0.8, vnoise(g * 0.9 + 1.0)) + 0.1 * turn;
        float peb = step(hash(pc), dens) * (1.0 - smoothstep(pr * 0.7, pr, length(pf))) * smoothstep(0.6, 1.5, pr / 90.0 / ps / uPx);
        // (indoors the sand only gets the room's fill: keep it in the mid greys so ripples,
        // drifts and pebbles still read instead of closing into a flat dark)
        if (uInterior > 0.5) {
            // indoors the sand has no sun to model it: draw what is on it. Wind ripples in
            // sweeping bands, drag marks, darker damp patches, a scatter of grit
            float rp = sin(dot(g, vec2(150.0, 45.0)) + vnoise(g * 5.0) * 9.0);
            float ripple = smoothstep(0.8, 0.98, rp) * 0.13;
            float drag = (1.0 - smoothstep(0.0, 0.006, abs(fract(g.x * 6.0 + vnoise(g * 2.0) * 1.5) - 0.5) - 0.485)) * smoothstep(0.55, 0.75, vnoise(g * 1.3 + 9.0)) * 0.15;
            float damp = smoothstep(0.5, 0.85, vnoise(g * 2.2 + 5.0)) * 0.22;
            float grit = step(0.9, hash(floor(g * 260.0))) * 0.35;
            tone = 0.42 + 0.2 * (sh - 0.5) + ripple + drag + damp + grit + 0.12 * (vnoise(g * 14.0) - 0.5);
        }
        cov = max(clamp(tone, 0.0, 0.95) * 0.92, peb * 0.85);
    }
    // loose stones: pits and grit in the facets, heavier in shade
    if (uRock > 0.5 && m < 2) {
        vec3 rq = vQ / max(vH.x, 1e-4) * 9.0;
        vec3 rc = floor(rq);
        float pitR = step(hash(rc.xy + rc.z * 7.1 + vSeed), 0.12 + 0.2 * D) * (1.0 - smoothstep(0.15, 0.35, length(fract(rq) - 0.5)));
        cov = max(cov, pitR * 0.5 * smoothstep(1.5, 3.0, vH.x / 9.0 / max(ps, 1e-6)));
        cov = clamp(cov + 0.08 * (fbm3(rq * 0.6) - 0.5), 0.0, 1.0);
        // the arrises between facets, drawn as the plates draw a broken stone's edges
        vec3 fnE = normalize(cross(dFdx(vW), dFdy(vW)));
        cov = max(cov, smoothstep(0.08, 0.3, length(fwidth(fnE))) * 0.55);
    }
    // round things have no edges to cut: their outline is drawn where they turn away
    // (not on ground: seen low, a whole desert is at a grazing angle)
    if (uBox < 0.5 && m != 5 && uMason < 0.5) {
        float rim = abs(dot(uRock > 0.5 ? Nsmooth : N, V));
        // (metal: a thin rim, or a slim ring is all outline)
        cov = max(cov, M.w > 0.5 && M.w < 1.5 ? 1.0 - smoothstep(0.04, 0.1, rim) : 1.0 - smoothstep(0.12, 0.3, rim));
    }
    // second inks: live blue (emissive surfaces print solid blue with a paper core), gold
    vec4 ink2 = vec4(0.0);
    vec3 ink = uInk;
    if (M.w > 1.5) {
        ink2 = vec4(uInkBlue, edgePx < 1.4 ? 1.0 : 0.72);
        cov *= 0.0;
    } else if (M.w > 0.5) {
        // metal: a gold wash under the dark line work, as a hand-coloured plate
        ink2 = vec4(uInkGold, 0.42);
    }
    // the blue light tints the lines it touches
    // (not obsidian: the seed and the core stay dark, the light shows on stone round them)
    if (M.w < 0.5 && m != 2) ink = mix(ink, uInkBlue * 0.8, clamp(glow * 1.6, 0.0, 0.85));
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
uniform float uZenith, uHorizon, uSpacing, uChar, uDusk;
uniform vec3 uDuskCol;
out vec4 o;
void main() {
    vec2 ndc = gl_FragCoord.xy / uRes * 2.0 - 1.0;
    vec4 w = uInvVP * vec4(ndc, 1.0, 1.0);
    vec3 d = normalize(w.xyz / w.w - uEye);
    float el = d.y;
    // a band of bare paper at the horizon, then the ruling darkens quickly to the zenith tone
    float D = mix(uHorizon, uZenith, smoothstep(0.005, 0.3, el));
    D = max(D, 0.2 * smoothstep(0.01, 0.05, el));
    if (uChar > 0.5) D = mix(uHorizon, uZenith, smoothstep(-0.02, 0.35, el));   // charcoal: a rubbed sky, no bare band
    // (isotropic in charcoal: a streaky noise read as scan lines across the sky)
    D *= 0.85 + 0.15 * vnoise(gl_FragCoord.xy / uPx * (uChar > 0.5 ? vec2(0.004) : vec2(0.002, 0.02)));
    // ruled sky: straight horizontal lines, thicker as the sky darkens
    float s = gl_FragCoord.y / (uSpacing * 0.8 * uPx);
    float cov = lines(s, clamp(D * 1.1, 0.0, 0.7), fwidth(s) * 0.8);
    if (uChar > 0.5) cov = D * 0.8;
    if (D < 0.03) cov = 0.0;
    // dusk: a thin warm wash along the horizon (a second ink)
    vec4 dusk = vec4(uDuskCol, uDusk * exp(-max(el, 0.0) * 28.0) * step(-0.01, el));
    o = vec4(print(gl_FragCoord.xy, cov, dusk, uInk), 1.0);
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
            gl.uniform1f(skyP.u('uChar'), f.charcoal ? 1 : 0);
            gl.uniform1f(skyP.u('uDusk'), f.sky?.dusk ?? 0);
            gl.uniform3fv(skyP.u('uDuskCol'), hex(f.duskCol ?? '#d9a066'));
            gl.bindVertexArray(tri);
            gl.drawArrays(gl.TRIANGLES, 0, 3);
            gl.depthMask(true);
            // 3. the scene
            gl.useProgram(main.p);
            common(main);
            gl.uniformMatrix4fv(main.u('uVP'), false, VP);
            gl.uniformMatrix4fv(main.u('uLVP'), false, LVP);
            gl.uniform1f(main.u('uVH'), H);
            gl.uniform3fv(main.u('uSun'), sun);
            gl.uniform3fv(main.u('uRight'), [view[0], view[4], view[8]]);
            gl.uniform1f(main.u('uSunK'), f.sunK ?? 0.95);
            gl.uniform1f(main.u('uFill'), f.fill ?? 0.3);
            gl.uniform1f(main.u('uEdge'), f.edge ?? 0.35);
            gl.uniform1f(main.u('uCourse'), f.course ?? 0.012);
            gl.uniform1f(main.u('uFlag'), f.flag ?? 0.8);          // flagstone width (interior floors)
            gl.uniform1f(main.u('uChar'), f.charcoal ? 1 : 0);
            gl.uniform1f(main.u('uInterior'), f.interior ? 1 : 0);
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
                gl.uniform1f(main.u('uMason'), d.masonry ? 1 : 0);
                gl.uniform1f(main.u('uHathor'), d.hathor ? 1 : 0);
                gl.uniform1f(main.u('uRock'), d.mesh === 'rock' ? 1 : 0);
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

    // ---------- the aged print: a filter over the finished frame ----------
    // Measured on plates of the «Description de l'Égypte» (Vol. V, Pl. 9 and 11, image areas):
    // their paper is a greyish warm white, not cream, and their ink a warm black; a tone
    // curve and a gradient map (luminance → the plates' own colour at that luminance) move our
    // print onto theirs. Second inks (blue, gold) ride on top as the difference from our
    // neutral palette. Then what age does to a sheet: softer, slightly spread lines, paper
    // grain, uneven toning in large soft patches, a darker rim, faint offset and wear.
    // The sheet is the same in every frame (no boil): it is one print that moves.
    const AGE_FS = `#version 300 es
precision highp float;
uniform sampler2D uSrc;
uniform vec2 uRes, uSrcRes;
uniform float uPx, uAmt, uChar, uGrain;
uniform vec3 uInk0, uPaper0;
uniform float uCurve[17];
uniform vec3 uGrad[17];
out vec4 o;
float hash(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float vnoise(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y); }
float fbm(vec2 p) { return 0.5 * vnoise(p) + 0.3 * vnoise(p * 2.03 + 7.1) + 0.2 * vnoise(p * 4.1 + 3.3); }
float lut(float x) { float t = clamp(x, 0.0, 1.0) * 16.0; int i = int(min(floor(t), 15.0)); return mix(uCurve[i], uCurve[i + 1], t - float(i)); }
vec3 grad(float x) { float t = clamp(x, 0.0, 1.0) * 16.0; int i = int(min(floor(t), 15.0)); return mix(uGrad[i], uGrad[i + 1], t - float(i)); }
vec3 src(vec2 uv) { return texture(uSrc, uv).rgb; }
void main() {
    vec2 uv = gl_FragCoord.xy / uRes;
    vec2 q = gl_FragCoord.xy / uPx;                      // px at 1920 wide
    vec2 d = 1.0 / uSrcRes;
    // a 4×4 box down to the output (the source is supersampled), then a soft spread: the
    // lines of a worn plate print a little fatter and softer
    vec3 c = vec3(0.0);
    for (int j = 0; j < 4; j++) for (int i = 0; i < 4; i++) c += src(uv + (vec2(i, j) - 1.5) * d * 0.5);
    c /= 16.0;
    vec3 blur = (src(uv + vec2(d.x, 0.0) * 1.6) + src(uv - vec2(d.x, 0.0) * 1.6) + src(uv + vec2(0.0, d.y) * 1.6) + src(uv - vec2(0.0, d.y) * 1.6)) * 0.25;
    c = mix(c, min(c, blur), 0.35 * uAmt);                // ink spreads (darkens into light)
    c = mix(c, blur, 0.25 * uAmt);
    float L = dot(c, vec3(0.299, 0.587, 0.114));
    vec3 c0 = c;
    if (uChar > 0.5) {
        // charcoal / graphite on toothed paper: the tone is smudged a little, then laid in
        // short parallel strokes on a diagonal (each patch of strokes its own angle and
        // pressure), and it only catches on the tooth's peaks in the half-tones, so light
        // areas speckle and darks fill in; dark contours stay crisp pencil lines
        vec3 sm = vec3(0.0);
        for (int j = -2; j <= 2; j++) for (int i = -2; i <= 2; i++) sm += src(uv + vec2(i, j) * d * 3.0);
        sm /= 25.0;
        float T = 1.0 - dot(mix(c, sm, 0.55 * uGrain), vec3(0.299, 0.587, 0.114));      // darkness (less smudge: finer detail survives)
        float line = clamp((1.0 - L) - T, 0.0, 1.0);                            // crisp marks
        vec2 cell = floor(q / 90.0);
        float ang = -1.0 + (hash(cell) - 0.5) * 0.35;
        vec2 dir = vec2(cos(ang), sin(ang)), nrm = vec2(-dir.y, dir.x);
        float along = dot(q, dir), across = dot(q, nrm) / 2.6;
        float row = floor(across);
        float stroke = smoothstep(0.5, 0.1, abs(fract(across) - 0.5)) * (0.55 + 0.45 * vnoise(vec2(along / 28.0, row * 3.7)));
        float tooth = 0.35 * hash(floor(q * 0.9)) + 0.65 * vnoise(q * vec2(0.55, 0.3));
        float g = pow(T, 1.25) * (0.8 + 0.45 * uGrain * stroke * (1.0 - T));
        float grit = smoothstep(tooth - 0.45, tooth + 0.35, g * 1.1);
        // the tooth shows in the half-tones only: light paper stays clean, darks fill in
        float dark = mix(g, grit, 0.35 * uGrain * smoothstep(0.05, 0.3, g) * (1.0 - smoothstep(0.6, 0.9, g))) + line * (0.9 + 0.3 * (1.0 - uGrain));
        L = 1.0 - clamp(dark, 0.0, 1.0);
        c = vec3(L);
    }
    // second inks: what differs from our neutral ink-to-paper ramp
    float f = clamp((L - dot(uInk0, vec3(0.299, 0.587, 0.114))) / max(dot(uPaper0 - uInk0, vec3(0.299, 0.587, 0.114)), 1e-3), 0.0, 1.0);
    float f0 = clamp((dot(c0, vec3(0.299, 0.587, 0.114)) - dot(uInk0, vec3(0.299, 0.587, 0.114))) / max(dot(uPaper0 - uInk0, vec3(0.299, 0.587, 0.114)), 1e-3), 0.0, 1.0);
    vec3 extra = c0 - mix(uInk0, uPaper0, f0);
    float L2 = lut(L);
    // (only real second inks carry over: the small cast of our own paper does not)
    vec3 col = grad(L2) + extra * smoothstep(0.04, 0.12, length(extra));
    // the sheet: grain, toning patches, a darker rim, offset from the facing page, wear
    float grain = (hash(floor(q * 1.3)) - 0.5) * 0.035 + (vnoise(q * vec2(0.7, 0.25)) - 0.5) * 0.03;
    float patches = fbm(q * 0.0022 + 4.0) - 0.5;
    vec2 e = abs(uv - 0.5) * 2.0;
    float rim = smoothstep(0.55, 1.05, max(e.x, e.y * 1.1)) + 0.4 * smoothstep(0.6, 1.2, length(e));
    vec3 tone = vec3(1.0) - vec3(0.02, 0.04, 0.08) * (patches * 1.4 + rim * 0.9) * uAmt;
    col *= tone * (1.0 + grain * uAmt) * (1.0 - 0.06 * rim * uAmt);
    // wear: faint pale scuffs where the ink rubbed off, only on inked areas
    float scuff = smoothstep(0.72, 0.9, fbm(q * vec2(0.012, 0.05) + 9.0)) * (1.0 - L2) * 0.25 * uAmt;
    col = mix(col, grad(0.9), scuff);
    o = vec4(col, 1.0);
}
`;
    // the plates' measured curves (see above): our luminance quantiles → theirs, and their
    // colour per luminance
    const AGE_CURVE = (() => {
        const src = [15.1, 66.8, 89.9, 110.8, 130.0, 148.5, 164.4, 176.5, 182.3, 186.5, 191.5, 195.5, 201.5, 206.5, 213.5, 215.5, 240.5];
        const dst = [0.3, 47.9, 76.7, 106.1, 134.6, 159.9, 170.6, 175.6, 178.9, 181.6, 183.8, 186.6, 189.1, 192.6, 196.8, 203.2, 252.5];
        // resample as y(x) at x = 0, 1/16, … 1 (piecewise linear, soft: half way to identity)
        const out = [];
        for (let i = 0; i <= 16; i++) {
            const x = (i / 16) * 255;
            let k = 0;
            while (k < 15 && src[k + 1] < x) k++;
            const u = Math.min(Math.max((x - src[k]) / (src[k + 1] - src[k]), 0), 1);
            const y = x < src[0] ? (x / src[0]) * dst[0] : x > src[16] ? dst[16] + ((x - src[16]) / (255 - src[16])) * (255 - dst[16]) : dst[k] + u * (dst[k + 1] - dst[k]);
            out.push((0.5 * y + 0.5 * x) / 255);
        }
        return out;
    })();
    const AGE_GRAD = [[9, 5, 1], [22, 17, 9], [37, 32, 24], [54, 47, 38], [70, 63, 53], [87, 78, 68], [103, 94, 83], [120, 110, 99], [136, 126, 114], [152, 142, 130], [170, 160, 148], [186, 176, 165], [197, 188, 177], [211, 202, 192], [229, 220, 210], [242, 235, 228], [253, 246, 236]].flat().map((v) => v / 255);
    // ager(env): { apply(g, canvas, { amount, ink, paper }) } paints the aged frame at output size
    function ager(env) {
        const W = env.px[0], H = env.px[1];
        const cv = document.createElement('canvas');
        cv.width = W;
        cv.height = H;
        const gl = cv.getContext('webgl2', { preserveDrawingBuffer: true, antialias: false });
        const sh = (t, src) => { const x = gl.createShader(t); gl.shaderSource(x, src); gl.compileShader(x); if (!gl.getShaderParameter(x, gl.COMPILE_STATUS)) throw new Error('Engrave age: ' + gl.getShaderInfoLog(x)); return x; };
        const P = gl.createProgram();
        gl.attachShader(P, sh(gl.VERTEX_SHADER, '#version 300 es\nin vec2 p; void main() { gl_Position = vec4(p, 0.0, 1.0); }'));
        gl.attachShader(P, sh(gl.FRAGMENT_SHADER, AGE_FS));
        gl.bindAttribLocation(P, 0, 'p');
        gl.linkProgram(P);
        const b = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, b);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
        const tex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        const U = (n) => gl.getUniformLocation(P, n);
        const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
        return {
            apply(g, source, o = {}) {
                gl.viewport(0, 0, W, H);
                gl.useProgram(P);
                gl.bindTexture(gl.TEXTURE_2D, tex);
                gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
                gl.uniform1i(U('uSrc'), 0);
                gl.uniform2f(U('uRes'), W, H);
                gl.uniform2f(U('uSrcRes'), source.width, source.height);
                gl.uniform1f(U('uPx'), W / 1920);
                gl.uniform1f(U('uAmt'), o.amount ?? 1);
                gl.uniform1f(U('uChar'), o.charcoal ? 1 : 0);
                gl.uniform1f(U('uGrain'), o.grain ?? 1);
                gl.uniform3fv(U('uInk0'), hex(o.ink ?? '#2e261d'));
                gl.uniform3fv(U('uPaper0'), hex(o.paper ?? '#ebe1cb'));
                gl.uniform1fv(U('uCurve'), AGE_CURVE);
                gl.uniform3fv(U('uGrad'), AGE_GRAD);
                gl.drawArrays(gl.TRIANGLES, 0, 3);
                g.save();
                g.setTransform(1, 0, 0, 1, 0, 0);
                g.drawImage(cv, 0, 0, W, H);
                g.restore();
            },
        };
    }

    // instance packing: push one instance into an array
    function inst(arr, c, mat, half, seed, q = [0, 0, 0, 1], glow = 0, bias = 0) {
        arr.push(c[0], c[1], c[2], mat, half[0], half[1], half[2], seed, q[0], q[1], q[2], q[3], glow, bias, 0, 0);
    }
    return { renderer, ager, inst, rock, box, pyramid, torus, cylinder, sphere, quat, qmul, M4 };
})();
