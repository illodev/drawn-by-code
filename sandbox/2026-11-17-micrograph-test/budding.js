// micrograph-test · Budding (ours, the dark palette): the edge of the cell at a higher
// magnification, and virions leaving it. No reference still: built from what budding looks
// like in section (dense matter gathers under the membrane, the membrane domes out with
// spikes on it, the dome closes into a sphere on a neck, the neck pinches, the particle
// drifts off) with the virion measured for the Dark shot (virion.js). Licence taken: a
// fixed specimen does not move; here one bud goes through all the stages in four seconds.
window.MGT = window.MGT ?? {};
MGT.budding = {
    // the cell is a big disc whose edge crosses the frame; the buds sit on it at these
    // angles (degrees from its centre), with their radius and seed
    CELL: [-0.75, -0.95, 1.05],
    SITES: [[47, 0.160, 11], [76, 0.150, 12], [21, 0.165, 13]],
    get glsl() {
        return `
#define T uA[0]
#define STAGE vec2(uA[1], uA[2])
#define ZOOM uA[4]
const vec3 C0 = vec3(${this.CELL.map((v) => v.toFixed(3)).join(', ')});
const vec3 TEAL = vec3(0.09, 0.60, 0.56), GREEN = vec3(0.08, 0.34, 0.20), OLIVE = vec3(0.62, 0.66, 0.20);
${MGT.lib.virion}
// particle i: centre uA[8 + 6 i], uA[9 + 6 i]; radius [10]; turn [11]; how wide its neck
// to the cell is [12] (0 = free); where on the membrane it was born [13] (angle)
void specimen(vec2 p, out float s, out vec3 ink) {
    vec2 q = p / ZOOM - STAGE;
    // ---- the cell's edge, ruffling
    vec2 qc = q + 0.01 * vec2(sin(T * 0.3), cos(T * 0.23));
    float lumps = fbm(qc * 2.2 + 3.0), fine = fbm(qc * 6.0 + 9.0);
    float base = length(q - C0.xy) - C0.z + 0.05 * (lumps - 0.5) + 0.016 * (fine - 0.5) + 0.006 * sin(T * 0.7 + q.x * 9.0);
    // each bud still joined to the cell pulls the membrane out with it
    float dc = base;
    for (int i = 0; i < 3; i++) {
        float k = uA[12 + 6 * i];
        float db = length(q - vec2(uA[8 + 6 * i], uA[9 + 6 * i])) - uA[10 + 6 * i] * 1.02;
        dc = k > 0.0005 ? smin(dc, db, k) : dc;
    }
    float cell = inside(dc, 0.022), deep = inside(dc + 0.06, 0.05);
    float gc = grainy(qc, 0.011, 2.0, 0.55), gf = grainy(qc, 0.0055, 5.0, 0.7);
    float body = 0.09 + 0.26 * smoothstep(0.34, 0.72, lumps) * (0.55 + 0.9 * fine) + 0.05 * deep * fine;
    body *= 1.0 - 0.75 * smoothstep(0.58, 0.36, fbm(qc * 1.5 + 21.0)) * deep;          // hollows, deep inside
    body += 0.13 * shell(dc + 0.010, 0.009) * (0.8 + 0.4 * gc);                         // the membrane, seen edge on
    grit = cell * (0.22 * gc + 0.14 * gf) + (1.0 - cell) * 0.25 * gf;
    s = 0.002 + 0.075 * exp(-max(dc, 0.0) / 0.07) * (0.5 + fine);                       // the haze just off it
    ink = GREEN;
    s = mix(s, body, cell);
    ink = mix(ink, TEAL, cell);
    // dense matter gathers under the membrane where a particle is about to form
    for (int i = 0; i < 3; i++) {
        float ang = uA[13 + 6 * i], k = uA[12 + 6 * i];
        vec2 site = C0.xy + (C0.z - 0.045) * vec2(cos(ang), sin(ang));
        float dense = exp(-dot(q - site, q - site) / (0.075 * 0.075)) * cell * smoothstep(0.0, 0.03, k);
        s += 0.17 * dense * (0.8 + 0.5 * gc);
        ink = mix(ink, OLIVE, 0.75 * dense);
    }
    // ---- the particles: only the nearest is shaded
    int iv = 0;
    float rbest = 1e3;
    for (int i = 0; i < 4; i++) {
        float r = length(q - vec2(uA[8 + 6 * i], uA[9 + 6 * i])) / uA[10 + 6 * i];
        if (r < rbest) { rbest = r; iv = i; }
    }
    {
        int i = iv;
        vec2 c = vec2(uA[8 + 6 * i], uA[9 + 6 * i]);
        float R = uA[10 + 6 * i], k = uA[12 + 6 * i];
        vec2 l = rot(uA[11 + 6 * i]) * (q - c);
        float v, gr, cover, inkw;
        vec3 kk;
        virion(l, vec2(R * 1.04, R * 0.97), 20.0 + float(i), vec4(0.44, 0.76, 0.9, 0.1 + 0.2 * float(i == 1)), T, v, kk, gr, cover, inkw);
        // what is still under the membrane has not formed yet: only the part that has come
        // out shows, and it has no spikes on the side of its neck
        float out_ = k > 0.0005 ? smoothstep(-0.012, 0.022, base) : 1.0;
        cover *= out_;
        inkw *= out_;
        s = mix(s, v, cover);
        grit = mix(grit, gr, cover);
        ink = mix(ink, kk, inkw);
    }
}
`;
    },
    frame(t, edge) {
        const [cx, cy, R0] = this.CELL, a = new Array(40).fill(0), S = this.SITES;
        const place = (deg, h) => { const r = (deg * Math.PI) / 180; return [cx + (R0 + h) * Math.cos(r), cy + (R0 + h) * Math.sin(r), r]; };
        a[0] = t;
        a[1] = 0.002 * t;
        a[2] = 0.001 * t;
        a[4] = 1 + 0.35 * edge.inn - 0.4 * edge.out;      // (the next shot is the same specimen, further away)
        // the bud that goes all the way: it domes out, closes on a neck, pinches off at 4.1 s
        // and drifts away turning; h = how far its centre is above the membrane
        const R = S[0][1], free = t >= 4.1;
        const h0 = Motion.keys([[0, -0.085], [2.7, 0.115], [3.6, R + 0.012], [4.1, R + 0.02]], t, Ease.inOut) + (free ? 0.055 * (t - 4.1) + 0.02 * (1 - Math.exp(-(t - 4.1) * 3)) : 0);
        const [x0, y0, r0] = place(S[0][0] + (free ? 1.2 * (t - 4.1) : 0), h0);
        a.splice(8, 6, x0, y0, R, 0.02 * t + (free ? 0.12 * (t - 4.1) : 0), free ? 0 : Motion.keys([[0, 0.085], [2.7, 0.06], [3.6, 0.022], [4.08, 0.004]], t, Ease.inOut), r0);
        // one that has only begun, and one half way: both grow a little while we watch
        const [x1, y1, r1] = place(S[1][0], -0.125 + 0.02 * t);
        a.splice(14, 6, x1, y1, S[1][1], 0, 0.08, r1);
        const [x2, y2, r2] = place(S[2][0], -0.03 + 0.012 * t);
        a.splice(20, 6, x2, y2, S[2][1], 0.3, 0.075, r2);
        // and one that left a while ago
        a.splice(26, 6, 0.50 + 0.012 * t + 0.004 * Math.sin(t * 0.9), 0.24 + 0.008 * t + 0.004 * Math.cos(t * 0.7), 0.15, 1.0 + 0.05 * t, 0, 0);
        const defocus = Motion.keys([[0, 2.8], [0.6, 0.0], [0.9, 0.7], [1.3, 0.15]], t, Ease.inOut) + 0.06 * Math.sin(t * 1.3) + 2.6 * edge.out;
        const detector = {
            soft: 1.3, defocus, fringe: 0.25 + 0.25 * defocus, fringeWidth: 3,
            noise: { amount: 0.13, power: 0.5, floor: 0.001, size: 4.2, live: 0.6, hold: 2, sharp: 0.6, fine: 0.3 },
            bleed: 2.6, light: [1, 0.94, 0.84],
            gain: (1 - 0.7 * edge.inn * edge.inn) * (1 - 0.7 * edge.out),
        };
        return { a, detector, stage: [a[1], a[2]] };
    },
    overlay(g, t, env) {
        Micrograph.databar(g, env, { x: env.W - 56 - 288, len: 288, label: '100 nm', caption: 'budding', font: 'VT323', size: 34, alpha: Ease.seg(t, 0.3, 0.6) * (1 - Ease.seg(t, 5.55, 5.7)) });
    },
};
