// lightfield-test · shot 3 · Prism: a white beam grazes a dark table into a glass prism,
// the prism turns, and the white opens into a fan of colours running out across the table
// (no screen: the table and the dust in the air are what it lands on). Our own scene, built from how the experiment really looks on a bench (brief.md):
// the beam is seen as the streak it lays on the table and on the dust in the air, the glass
// is seen by its edges, its sheen and the glints where light goes in and out, and the path
// of every colour is Snell's law through the triangle, traced per frame in JS (lab.js)
// for fourteen wavelengths and handed to the shader.
window.LFT = window.LFT ?? {};
LFT.prism = {
    NL: 14,
    C: [-0.30, 0.0],          // the prism's centre on the table
    SIDE: 0.34,
    get glsl() {
        // the colours of the fourteen wavelengths, as constants (their sum is made white)
        const cie = (nm) => {
            const x = 1.065 * Math.exp(-0.5 * ((nm - 595.8) / 33.33) ** 2) + 0.366 * Math.exp(-0.5 * ((nm - 446.8) / 19.44) ** 2);
            const y = 1.014 * Math.exp(-0.5 * ((Math.log(nm) - Math.log(556.3)) / 0.075) ** 2);
            const z = 1.839 * Math.exp(-0.5 * ((Math.log(nm) - Math.log(449.8)) / 0.051) ** 2);
            return [3.2406 * x - 1.5372 * y - 0.4986 * z, -0.9689 * x + 1.8758 * y + 0.0415 * z, 0.0557 * x - 0.2040 * y + 1.0570 * z].map((v) => Math.max(v, 0));
        };
        const cols = Array.from({ length: this.NL }, (_, i) => cie(this.nm(i)));
        const sum = [0, 1, 2].map((k) => cols.reduce((s, c) => s + c[k], 0));
        const spec = cols.map((c) => `vec3(${c.map((v, k) => (v / sum[k]).toFixed(5)).join(', ')})`).join(', ');
        return LFT.lab.glsl + `
#define POWER uA[7]
#define PIN vec2(uA[8], uA[9])
#define DIN vec2(uA[10], uA[11])
#define REFL vec2(uA[60], uA[61])
#define AMB uA[62]
const int NL = ${this.NL};
const vec3 SPEC[${this.NL}] = vec3[${this.NL}](${spec});
const float HP = 0.15;                 // the prism's height
const float HB = 0.05;                 // the beam is a sheet this high
const float BW = 0.010;                // and this wide (half)
vec2 corner(int i) { return vec2(uA[12 + 2 * i], uA[13 + 2 * i]); }
// across a beam: a core, and the little the paper spreads sideways
float across(float d, float w) { return exp(-d * d / (w * w)) + 0.05 * exp(-abs(d) / (5.0 * w)); }
// the angle between a sample's ray and its neighbours' (half the span of the two gaps)
float gap(int i) {
    float a0 = uA[20 + 3 * max(i - 1, 0)], a1 = uA[20 + 3 * min(i + 1, NL - 1)];
    return (a0 > 50.0 || a1 > 50.0) ? 0.03 : abs(a1 - a0) * (i == 0 || i == NL - 1 ? 1.0 : 0.5);
}
// the light skimming the table at T
vec3 beams(vec2 T) {
    vec2 a = T - PIN;
    vec3 c = vec3(1.0, 0.98, 0.94) * across(cross2(a, DIN), BW) * step(dot(a, DIN), 0.0);
    // one twentieth of it bounces off the first face
    float al = dot(a, REFL);
    c += vec3(1.0, 0.98, 0.94) * 0.05 * across(cross2(a, REFL), BW) * step(0.0, al) * exp(-al * 1.4);
    for (int i = 0; i < NL; i++) {
        float ang = uA[20 + 3 * i];
        vec2 e = vec2(uA[18 + 3 * i], uA[19 + 3 * i]), b = T - e, d = vec2(cos(ang), sin(ang));
        float al = dot(b, d);
        // fourteen samples stand for a continuous spectrum: each ray is as wide as its share
        // of the fan at that distance, and as much dimmer (where the colours are pulled
        // further apart, the same light covers more table)
        float w = BW + 0.62 * gap(i) * max(al, 0.0);
        // nothing stands in its way: the fan runs out across the table until it is too thin to see
        c += SPEC[i] * across(cross2(b, d), w) * (BW / w) * step(0.0, al) * step(ang, 50.0);
    }
    return c;
}
// the same colours inside the glass, from the way in to each way out
vec3 inside(vec2 T, float w) {
    vec3 c = vec3(0.0);
    for (int i = 0; i < NL; i++) c += SPEC[i] * exp(-pow(segd(T, PIN, vec2(uA[18 + 3 * i], uA[19 + 3 * i])) / w, 2.0));
    return c;
}
vec3 ambient(vec2 T) { return vec3(0.10, 0.17, 0.28) * AMB * (0.35 + 0.65 * smoothstep(1.4, -1.2, T.x - 0.6 * T.y)); }
vec3 radiance(vec2 p) {
    vec3 rd = viewRay(p);
    float t0, t1, tm;
    vec2 T0 = planeAt(rd, 0.0, t0), T1 = planeAt(rd, HP, t1), Tm = planeAt(rd, HB * 0.6, tm);
    vec3 amb = ambient(T0);
    vec3 B0 = beams(T0) * POWER, Bm = beams(Tm) * POWER;
    // the table under the light, and the sheet of light itself in the dusty air above it
    vec3 c = tableLit(T0, B0 * 9.0 + amb);
    float dustAir = 0.5 + 0.9 * fbm(vec3(Tm * 9.0, uT * 0.12));
    float m = motes(p, 0.045, uT, 3.0, 0.0009, 0.0026, 0.2) + 0.7 * motes(p * 1.1 + 0.4, 0.09, uT * 0.8, 4.0, 0.002, 0.005, 0.6);
    c += Bm * (0.16 * dustAir + 2.6 * m);
    float depth = t0;

    // ---- the prism: a block of glass standing on its triangular end
    {
        vec2 v0 = corner(0), v1 = corner(1), v2 = corner(2), cen = (v0 + v1 + v2) / 3.0;
        // its top: ground glass, glowing where the light crosses underneath
        float e0 = cross2(v1 - v0, T1 - v0), e1 = cross2(v2 - v1, T1 - v1), e2 = cross2(v0 - v2, T1 - v2);
        bool top = (e0 > 0.0 && e1 > 0.0 && e2 > 0.0) || (e0 < 0.0 && e1 < 0.0 && e2 < 0.0);
        if (top && t1 < depth) {
            float de = min(segd(T1, v0, v1), min(segd(T1, v1, v2), segd(T1, v2, v0)));
            float frost = 0.7 + 0.6 * noise(T1 * 330.0);
            // (the sheet of light is low in the block: it is seen where the view ray reaches that height)
            float ft = 0.05 + 0.95 * pow(1.0 + rd.y, 5.0);
            c = tableLit(mix(T1, T0, 0.6), amb) * 0.6 + vec3(0.10, 0.17, 0.28) * AMB * (0.05 + 0.9 * ft) * frost + inside(Tm, BW * 1.3) * POWER * 0.8 + inside(T1, BW * 4.0) * POWER * 0.05 * frost;
            // the bevel round it
            c += vec3(0.16, 0.24, 0.36) * AMB * (0.32 * smoothstep(0.007, 0.001, de) * (0.3 + 1.4 * noise(T1 * 60.0 + 5.0)) + 0.25 * smoothstep(0.03, 0.0, de));
            // glass is seen through: the foot of the block shows, displaced, under its top
            vec2 Tu = mix(T1, T0, 0.62);
            float foot = min(segd(Tu, v0, v1), min(segd(Tu, v1, v2), segd(Tu, v2, v0)));
            c += vec3(0.16, 0.24, 0.36) * AMB * 0.15 * smoothstep(0.006, 0.001, foot) * (0.4 + 1.0 * noise(Tu * 50.0));
            depth = t1;
        } else {
            for (int i = 0; i < 3; i++) {
                vec2 A = corner(i), B = corner(i == 2 ? 0 : i + 1), e = B - A;
                vec2 n = normalize(vec2(e.y, -e.x));
                if (dot(n, A - cen) < 0.0) n = -n;
                float den = dot(rd.xz, n);
                float tf = dot(A - CAM.xz, n) / den;
                vec3 H = CAM + rd * tf;
                float u = dot(H.xz - A, e) / dot(e, e);
                if (den < 0.0 && tf > 0.0 && tf < depth && u > 0.0 && u < 1.0 && H.y > 0.0 && H.y < HP) {
                    float cs = -dot(rd, vec3(n.x, 0.0, n.y));
                    float fres = 0.05 + 0.95 * pow(1.0 - cs, 5.0);
                    // through the face: the table behind, darkened, and the light on its way through the glass
                    vec2 Tb = mix(H.xz, T0, 0.45);
                    vec3 g = tableLit(Tb, amb) * 0.5 + vec3(0.012, 0.020, 0.026) * AMB + inside(Tm, BW * 1.3) * POWER * 0.8 * step(H.y, HP);
                    // through the near face, the far edges of the block and its foot
                    float back = min(segd(Tb, v0, v1), min(segd(Tb, v1, v2), segd(Tb, v2, v0)));
                    g += vec3(0.16, 0.24, 0.36) * AMB * 0.14 * smoothstep(0.007, 0.001, back) * (0.4 + 1.0 * noise(Tb * 50.0));
                    // the room in the polished face: one tall soft window, stronger at a glancing angle
                    float win = smoothstep(0.15, 0.5, u) * smoothstep(1.0, 0.6, u);
                    g += vec3(0.20, 0.30, 0.44) * AMB * (0.015 + 1.1 * fres) * (0.15 + 0.85 * win * win) * (0.25 + 0.75 * smoothstep(0.0, HP, H.y));
                    // its edges: the two verticals and the top are lines of light, the foot a dark seam
                    float ev = min(u, 1.0 - u) * length(e);
                    g += vec3(0.30, 0.42, 0.58) * AMB * (0.55 * smoothstep(0.004, 0.0008, ev) * (0.25 + 1.3 * noise(vec2(H.y * 70.0, float(i) * 9.0))) + 0.35 * smoothstep(0.005, 0.001, HP - H.y) * (0.3 + 1.2 * noise(vec2(u * 30.0, 2.0))));
                    g *= smoothstep(0.0, 0.008, H.y) * 0.75 + 0.25;
                    // where the beam goes in, and where each colour comes out, the surface flares
                    float low = smoothstep(HB + 0.02, HB - 0.01, H.y);
                    g += vec3(1.0, 0.98, 0.94) * POWER * 16.0 * exp(-dot(H.xz - PIN, H.xz - PIN) / (0.013 * 0.013)) * low;
                    for (int k = 0; k < NL; k++) {
                        vec2 q = H.xz - vec2(uA[18 + 3 * k], uA[19 + 3 * k]);
                        g += SPEC[k] * POWER * 30.0 * exp(-dot(q, q) / (0.011 * 0.011)) * low * step(uA[20 + 3 * k], 50.0);
                    }
                    c = g;
                    depth = tf;
                }
            }
        }
    }
    return c;
}
`;
    },
    nm(i) { return 408 + (690 - 408) * i / (this.NL - 1); },
    // the prism turns from just past the face the beam would miss to where the violet end
    // is about to be swallowed (total reflection): the fan opens from 10 to about 25 degrees
    turn(t) { return (-25 + 11.5 * Ease.inOut(Ease.seg(t, 1.2, 4.9)) + 35) * Math.PI / 180; },
    frame(t) {
        const A0 = 35 * Math.PI / 180, din = [Math.cos(A0), Math.sin(A0)], C = this.C, R = this.SIDE / Math.sqrt(3);
        const phi = this.turn(t);
        const V = [0, 1, 2].map((i) => { const a = phi + Math.PI / 2 + i * 2 * Math.PI / 3; return [C[0] + R * Math.cos(a), C[1] + R * Math.sin(a)]; });
        const o = [C[0] - din[0] * 2.2, C[1] - din[1] * 2.2];
        const u = Ease.inOut(Ease.seg(t, 0, 6.5));
        const a = new Array(64).fill(0);
        // the camera: above and in front, pushing in a little and drifting towards the card
        a.splice(0, 7, -0.04 + 0.12 * u, 0.84 - 0.04 * u, -1.58 + 0.10 * u, 0.06 + 0.12 * u, 0, -0.13, 1.72);
        // the shutter opens: not a switch, a slit widening
        a[7] = Ease.inOut(Ease.seg(t, 0.25, 1.0));
        let first = null;
        for (let i = 0; i < this.NL; i++) {
            const r = LFT.lab.trace(V, o, din, LFT.lab.index(this.nm(i)));
            first = first ?? r;
            a[18 + 3 * i] = r ? r.pout[0] : 0;
            a[19 + 3 * i] = r ? r.pout[1] : 0;
            a[20 + 3 * i] = r && r.dout ? Math.atan2(r.dout[1], r.dout[0]) : 99;
        }
        const mid = LFT.lab.trace(V, o, din, LFT.lab.index(550));
        a[8] = mid.pin[0]; a[9] = mid.pin[1];
        a[10] = din[0]; a[11] = din[1];
        V.forEach((v, i) => { a[12 + 2 * i] = v[0]; a[13 + 2 * i] = v[1]; });
        a[60] = mid.reflected[0]; a[61] = mid.reflected[1];
        a[62] = 0.42;
        const optics = {
            // (the cut comes out of the eclipse's burnt-out frame: the camera takes a moment to settle)
            exposure: 1 + 2.2 * Math.pow(1 - Ease.seg(t, 0, 0.5), 2), toe: 0.004, bloom: 0.2, bloomWeights: [1.0, 1.5, 1.8, 1.4, 0.8, 0.35, 0.12], halation: [1, 0.8, 0.6], halationFrom: 5,
            ca: 0.0005, vignette: 0.22, soften: 0.15,
            grain: { amount: 0.034, size: 1.7, chroma: 0.3, floor: 0.3 },
        };
        return { a, optics };
    },
};
