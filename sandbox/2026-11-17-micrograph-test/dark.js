// micrograph-test · shot 3 · Dark: virions leaving the edge of a cell, tinted on black.
// Built on the user's reference still (private/dark169.png, not committed: the still padded
// to 16:9 with the black it already had on its right). Measured on it: the four virions
// (centre, semi-axes, tilt: an ellipse fit of each), their radial profile of signal and ink
// (core, bright shell, rim, the blue-grey fringe of spikes), and the cell as a union of
// sixteen discs.
window.MGT = window.MGT ?? {};
MGT.dark = {
    // the instant that reproduces the reference still (local seconds)
    MATCH: 3.0,
    // x, y, semi-axes a, b (frame heights), tilt, core signal, shell signal, seed, yellow in the shell, mauve in the zone round the core
    VIRIONS: [
        [-0.2983, 0.2684, 0.1026, 0.1017, 2.632, 0.135, 0.36, 1, 0.22, 1],
        [0.008, 0.2078, 0.1162, 0.1023, 2.917, 0.31, 0.70, 2, 0.9, 0],
        [-0.1588, -0.0586, 0.1124, 0.1074, -2.474, 0.46, 0.74, 3, 0.85, 0.15],
        [-0.5232, -0.281, 0.1512, 0.1344, 2.368, 0.44, 0.78, 4, 0.9, 0.1],
    ],
    CELL: [[-0.674, 0.004, 0.129], [-0.793, -0.189, 0.129], [-0.719, -0.1, 0.11], [-0.763, 0.1, 0.109], [-0.341, 0.5, 0.105], [-0.881, 0.085, 0.104],
           [-0.733, 0.307, 0.099], [-0.43, 0.5, 0.076], [-0.63, -0.093, 0.073], [-0.889, -0.144, 0.067], [-0.726, -0.27, 0.067], [-0.57, 0.033, 0.067],
           [-0.889, -0.233, 0.067], [-0.756, 0.189, 0.063], [-0.252, 0.5, 0.06], [-0.519, 0.048, 0.06]],
    get glsl() {
        const v = this.VIRIONS, c = this.CELL, f = (x) => x.toFixed(4);
        return `
#define NV ${v.length}
#define NC ${c.length}
const vec4 VA[NV] = vec4[NV](${v.map((e) => `vec4(${e.slice(0, 4).map(f).join(', ')})`).join(', ')});
const vec4 VB[NV] = vec4[NV](${v.map((e) => `vec4(${e.slice(4, 8).map(f).join(', ')})`).join(', ')});
const vec2 VC[NV] = vec2[NV](${v.map((e) => `vec2(${e.slice(8, 10).map(f).join(', ')})`).join(', ')});
const vec3 CD[NC] = vec3[NC](${c.map((e) => `vec3(${e.map(f).join(', ')})`).join(', ')});
#define T uA[0]
#define STAGE vec2(uA[1], uA[2])
#define TITLE uA[3]
#define ZOOM uA[4]
// the inks (sRGB, each pure at its own luminance)
const vec3 TEAL = vec3(0.09, 0.60, 0.56), GREEN = vec3(0.08, 0.34, 0.20), OLIVE = vec3(0.62, 0.66, 0.20);
${MGT.lib.virion}
void specimen(vec2 p, out float s, out vec3 ink) {
    vec2 q = p / ZOOM - STAGE;
    // ---- the cell: soft lobes, mottled, with hollows; a haze of the same stuff round it
    float dc = 1e3;
    for (int i = 0; i < NC; i++) {
        vec2 w = 0.012 * vec2(sin(T * 0.5 + float(i) * 1.7), cos(T * 0.43 + float(i) * 2.3));   // the edge ruffles
        dc = smin(dc, length(q - CD[i].xy - w) - CD[i].z, 0.045);
    }
    vec2 qc = q + 0.02 * vec2(sin(T * 0.21), cos(T * 0.17));
    float lumps = fbm(qc * 4.2 + 3.0), fine = fbm(qc * 11.0 + 9.0);
    dc += 0.05 * (lumps - 0.5) + 0.018 * (fine - 0.5);
    float cell = inside(dc, 0.03);
    float deep = inside(dc + 0.05, 0.05);                                       // well inside the edge
    float gc = grainy(qc, 0.011, 2.0, 0.55), gf = grainy(qc, 0.0055, 5.0, 0.7);  // what the cell is made of
    float body = 0.07 + 0.30 * smoothstep(0.34, 0.72, lumps) * (0.55 + 0.9 * fine) + 0.06 * deep * fine;
    body *= 1.0 - 0.8 * smoothstep(0.60, 0.36, fbm(qc * 2.6 + 21.0)) * deep;      // the hollows
    grit = cell * (0.22 * gc + 0.14 * gf) + (1.0 - cell) * 0.25 * gf;
    // the haze: thin matter round the cell and between the virions, none far from them
    s = 0.002 + (0.03 * smoothstep(0.16, -0.2, q.x) + 0.07 * exp(-max(dc, 0.0) / 0.08)) * (0.5 + fine);
    ink = GREEN;
    s = mix(s, body, cell);
    ink = mix(ink, TEAL, cell);
    // a seam of something denser along one ridge of the cell, tinted olive
    float seam = shell(fbm(qc * 2.2 + 40.0) - 0.5, 0.035) * deep * smoothstep(-0.9, -0.5, q.x) * smoothstep(0.25, -0.3, q.y + 0.3 * q.x)
               + 0.8 * cell * smoothstep(0.47, 0.40, q.y) * smoothstep(0.34, 0.42, q.y) * smoothstep(-0.5, -0.38, q.x);   // and under the lobe at the top
    s += 0.16 * seam;
    ink = mix(ink, OLIVE, 0.8 * seam);
    // ---- the virions
    // (only the nearest one is shaded: they never overlap, and a renderer that runs every
    // branch would otherwise pay for the grain of all four at every pixel)
    int iv = 0;
    float rbest = 1e3;
    for (int i = 0; i < NV; i++) {
        vec2 c = VA[i].xy + vec2(uA[8 + 4 * i], uA[9 + 4 * i]);
        float r = length((rot(VB[i].x + uA[10 + 4 * i]) * (q - c)) / VA[i].zw);
        if (r < rbest) { rbest = r; iv = i; }
    }
    {
        int i = iv;
        vec2 c = VA[i].xy + vec2(uA[8 + 4 * i], uA[9 + 4 * i]);
        vec2 l = rot(VB[i].x + uA[10 + 4 * i]) * (q - c);
        float v, gr, cover, inkw;
        vec3 k;
        virion(l, VA[i].zw, VB[i].w, vec4(VB[i].y, VB[i].z, VC[i].x, VC[i].y), T, v, k, gr, cover, inkw);
        s = mix(s, v, cover);
        grit = mix(grit, gr, cover);
        ink = mix(ink, k, inkw);
    }
    // ---- the title: stained matter like the rest
    vec4 t = plate(p);
    float w = t.a * TITLE;
    s = mix(s, lum(t.rgb) * 1.12, w);
    grit = mix(grit, 0.2 * grainy(p, 0.004, 3.0, 0.6), w);
    ink = mix(ink, t.rgb, w);
}
`;
    },
    frame(t, edge) {
        const M = this.MATCH, u = t - M;
        // each virion drifts off the cell at its own rate, wanders a little and turns slowly
        const drift = [[0.004, 0.006, 0.05], [0.009, 0.004, -0.04], [0.007, -0.003, 0.06], [0.005, -0.004, -0.03]];
        const a = new Array(24).fill(0);
        a[0] = t;
        a[1] = 0.003 * u;            // the stage creeps
        a[2] = -0.0015 * u;
        a[3] = Ease.inOut(Ease.seg(t, M + 0.5, M + 1.5));
        a[4] = 1 + 0.35 * edge.inn;
        drift.forEach(([vx, vy, w], i) => {
            a[8 + 4 * i] = vx * u + 0.004 * (Math.sin(t * 0.9 + i * 2.1) - Math.sin(M * 0.9 + i * 2.1));
            a[9 + 4 * i] = vy * u + 0.004 * (Math.cos(t * 0.7 + i * 1.3) - Math.cos(M * 0.7 + i * 1.3));
            a[10 + 4 * i] = w * u;
        });
        // the operator finds focus: far out, through it, back, and then it only breathes
        const defocus = Motion.keys([[0, 3.2], [0.7, 0.0], [1.0, 0.9], [1.45, 0.2]], t, Ease.inOut) + 0.06 * Math.sin(t * 1.3);
        const detector = {
            soft: 1.3, defocus, fringe: 0.25 + 0.25 * defocus, fringeWidth: 3,
            noise: { amount: 0.13, power: 0.5, floor: 0.001, size: 4.2, live: 0.6, hold: 2, sharp: 0.6, fine: 0.3 },
            bleed: 2.6, light: [1, 0.94, 0.84],
            // the beam dips at the change of magnification, and goes off at the end of the film
            gain: (1 - 0.7 * edge.inn * edge.inn) * (edge.last ? 1 - edge.out : 1),
        };
        return { a, detector, stage: [a[1], a[2]] };
    },
    plate(g, env) {
        g.textBaseline = 'alphabetic';
        // in the black to the right of the virions, with the frame's margin on its right
        g.font = '500 86px Lora';
        const w1 = g.measureText('micro').width;
        g.font = '700 86px Poppins';
        const w2 = g.measureText('graph').width, x = 1520 - (w1 + w2 + 4), y = 452;
        g.font = '500 86px Lora';
        g.fillStyle = '#f2c14e';
        g.fillText('micro', x, y);
        g.font = '700 86px Poppins';
        g.fillStyle = '#e9efee';
        g.fillText('graph', x + w1 + 4, y);
        g.font = '500 34px Lora';
        g.fillStyle = '#7fb9b4';
        g.textAlign = 'right';
        g.fillText('illodev x Claude', x + w1 + w2 + 4, y + 52);
    },
    overlay(g, t, env) {
        Micrograph.databar(g, env, { x: env.W - 56 - 200, len: 200, label: '100 nm', caption: 'virions leaving a cell', font: 'VT323', size: 34, alpha: Ease.seg(t, 0.3, 0.6) * (1 - Ease.seg(t, 5.55, 5.75)) });
    },
};
