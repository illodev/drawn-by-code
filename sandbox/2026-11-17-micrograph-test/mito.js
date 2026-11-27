// micrograph-test · Mito (ours, the section palette): serial sections through one
// mitochondrion. No reference still: built from what a mitochondrion is in thin section (two
// membranes with a pale gap, a dense grainy matrix, cristae: folds of the inner membrane,
// pale inside, that start at one side and stop short of the other, never evenly spaced)
// and from how serial sections look when played in order: the image holds, then jumps to
// the next slice, never quite registered or evenly lit, with the knife's chatter across it.
// The whole thing is one function of (x, y, z); the shot only moves z, a slice at a time.
window.MGT = window.MGT ?? {};
MGT.mito = {
    SLICES: 40,
    glsl: `
#define T uA[0]
#define STAGE vec2(uA[1], uA[2])
#define ZOOM uA[4]
#define Z uA[5]          // depth of the slice, −1 … 1 through the organelle
#define TILT uA[6]       // each slice lands a little turned
#define CHAT uA[7]       // the phase of the knife's chatter on this slice
const vec3 ORANGE = vec3(0.78, 0.49, 0.315), UMBER = vec3(0.31, 0.25, 0.21), ROSE = vec3(0.58, 0.36, 0.40);
const vec3 BLUSH = vec3(0.84, 0.75, 0.74), SKY = vec3(0.735, 0.815, 0.985), MAUVE = vec3(0.72, 0.47, 0.44);
float n3(vec3 x) { return noise(x) * 2.0 - 1.0; }
// vesicles near it: x, y, radius, the depth at which each is widest (a sphere shows as a
// circle that grows and shrinks from slice to slice)
const vec4 VES[6] = vec4[6](vec4(-0.66, 0.20, 0.050, -0.3), vec4(0.70, -0.22, 0.060, 0.2), vec4(0.62, 0.27, 0.040, -0.6),
                            vec4(-0.74, -0.25, 0.045, 0.5), vec4(-0.30, -0.36, 0.035, 0.0), vec4(0.28, 0.37, 0.038, 0.7));
void specimen(vec2 p, out float s, out vec3 ink) {
    vec2 q = rot(TILT) * (p / ZOOM) - STAGE;
    float zi = floor(Z * 40.0);
    float g1 = grainy(q, 0.0105, 3.0 + zi, 0.6), g2 = grainy(q, 0.0052, 5.0 + zi, 0.8);
    // ---- the cytoplasm round it: ribosomes everywhere, in clusters
    float poly = speckle(vec3(q / 0.035, Z * 4.0), 0.4, 0.4);
    s = 0.60 + 0.05 * n3(vec3(q * 3.0, Z * 2.0)) - 0.07 * smoothstep(0.1, 0.9, poly);
    ink = mix(BLUSH, ORANGE, 0.30);
    grit = 0.30 * g2 + 0.12 * g1;
    // two sheets of rough reticulum: never of one width, broken here and there, pale inside,
    // studded outside
    for (int i = 0; i < 2; i++) {
        float fi = float(i);
        float y0 = mix(0.385, -0.335, fi) + 0.05 * sin(q.x * 3.0 + fi * 2.0 + Z * 2.0) + 0.045 * n3(vec3(q.x * 3.0, fi * 9.0, Z * 3.0));
        float w = 0.011 + 0.010 * n3(vec3(q.x * 7.0, fi, Z * 4.0)) + 0.003 * g1;
        float there = smoothstep(-0.35, -0.05, n3(vec3(q.x * 2.3 + fi * 5.0, 3.0, Z * 2.0)));
        float de = abs(q.y - y0) - w;
        float lumen = inside(de, 0.005) * there, wall = shell(de, 0.0050) * there;
        float studs = shell(de - 0.008, 0.005) * smoothstep(0.1, 0.7, g2) * there;
        s = mix(s, 0.76, 0.7 * lumen);
        ink = mix(ink, SKY, 0.8 * lumen);
        s = mix(s, 0.24, 0.7 * wall * (0.6 + 0.6 * g1));
        s = mix(s, 0.22, 0.6 * studs);
        ink = mix(ink, UMBER, 0.7 * max(wall, studs));
    }
    for (int i = 0; i < 6; i++) {
        float r = VES[i].z * sqrt(max(1.0 - pow((Z - VES[i].w) / 0.55, 2.0), 0.0));
        float dv = length(q - VES[i].xy) - r + 0.004 * g1;
        float on = step(0.006, r), inv = inside(dv, 0.005) * on, wv = shell(dv, 0.0045) * on;
        s = mix(s, 0.78, 0.75 * inv);
        ink = mix(ink, SKY, 0.8 * inv);
        s = mix(s, 0.24, 0.7 * wv);
        ink = mix(ink, UMBER, 0.6 * wv);
    }
    // ---- the mitochondrion: a bean, thinner towards the ends of its depth
    vec2 l = rot(-0.2) * (q - vec2(0.0, -0.01));
    float zs = sqrt(max(1.0 - 0.55 * Z * Z, 0.05));
    float bend = 0.10 * l.x * l.x / 0.36;                                  // the bean's curve
    vec2 lb = vec2(l.x, l.y + bend - 0.03);
    float d = body(lb, vec2(0.60, 0.285) * zs, 4.0, 0.045, 0.0) + 0.030 * n3(vec3(lb * 3.0, Z * 2.5)) + 0.008 * n3(vec3(lb * 11.0, Z * 4.0));
    // cristae: sheets across the short axis, many, thin, warped, of uneven spacing; in each
    // gap between two phases one sheet hangs from one wall and stops where it likes
    float warp = 1.3 * n3(vec3(lb * 2.0, Z * 1.6)) + 0.5 * n3(vec3(lb * 5.0 + 7.0, Z * 2.5));
    float ph = lb.x * 12.0 + 1.6 * lb.y + warp;
    float idx = floor(ph), f = fract(ph) - 0.5 + 0.07 * g1;
    vec3 h = hash3(vec2(idx, 31.0));
    float from = h.x < 0.5 ? 1.0 : -1.0;                                    // the wall it hangs from
    float reach = mix(-0.1, 0.8, h.y) + 0.4 * n3(vec3(idx * 3.1, 2.0, Z * 2.2));     // how far across it gets (−1 none … 1 all the way)
    float v = lb.y / (0.285 * zs) * from;                                   // 1 at its own wall, −1 at the far one
    float lenm = smoothstep(-reach - 0.15, -reach + 0.15, v + 0.1 * g1);
    float halfw = 0.15 + 0.09 * h.z + 0.10 * n3(vec3(lb * 14.0, Z * 3.0));
    float lam = smoothstep(halfw + 0.11, halfw - 0.11, abs(f)) * lenm * step(0.12, hash(vec2(idx, 77.0)) + 0.4 * n3(vec3(idx, 5.0, Z * 1.5)));
    float inner_d = d + 0.022 + 0.006 * n3(vec3(lb * 8.0 + 3.0, Z * 3.0));   // the inner membrane wanders off the outer
    float matrix = inside(inner_d + 0.004, 0.005);
    // matrix: dense, grainy, mottled, with a few very dense granules that come and go with depth
    float mott = speckle(vec3(lb / 0.03, Z * 5.0), 0.3, 0.4);
    float dots = smoothstep(0.85, 1.15, speckle(vec3(lb / 0.016 + 5.0, Z * 7.0), 0.5, 0.3));
    float ms = (0.40 + 0.045 * mott) * (1.0 - 0.6 * dots);
    // a crista has dark walls and a thin pale core, like the membrane it is a fold of
    float cl = smoothstep(0.6, 0.95, lam), cw = shell(lam - 0.5, 0.30);
    ms = mix(ms, 0.60, cl);
    ms = mix(ms, 0.19, 0.7 * cw * (0.7 + 0.5 * g1));
    // the two membranes with the pale gap between them
    float outer = shell(d + 0.005, 0.0042 * (1.0 + 0.5 * g1)), inner = shell(inner_d, 0.0042 * (1.0 + 0.5 * g1));
    float gap = inside(d + 0.010, 0.004) * (1.0 - inside(inner_d - 0.004, 0.004));
    float in1 = inside(d, 0.004);
    float halo = smoothstep(0.030, 0.006, d) * (1.0 - in1);
    s = mix(s, 0.70, 0.5 * halo);
    s = mix(s, mix(0.60, ms, matrix), in1);
    s = mix(s, 0.70, 0.7 * gap * in1);
    s = mix(s, 0.14, clamp(outer + inner, 0.0, 1.0) * 0.85);
    ink = mix(ink, BLUSH, 0.5 * halo);
    ink = mix(ink, mix(ORANGE, BLUSH, 0.5 * cl), in1);
    ink = mix(ink, UMBER, 0.85 * clamp(outer + inner + 0.8 * cw * matrix, 0.0, 1.0));
    grit = mix(grit, (0.26 * g2 + 0.12 * g1) * (1.0 - 0.5 * cl), in1);
    // ---- the knife: faint bands across everything, where it chattered
    s *= 1.0 + 0.022 * sin(dot(p, vec2(0.34, 0.94)) * 95.0 + CHAT) + 0.012 * sin(dot(p, vec2(0.34, 0.94)) * 31.0 + CHAT * 1.7);
}
`,
    // which slice is on screen at t: a new one every 3 frames
    slice(t) { return Math.min(this.SLICES - 1, Math.floor(t * 8 + 1e-6)); },
    frame(t, edge) {
        const n = this.slice(t), r = Motion.rng('mito-slice-' + n);
        const a = new Array(10).fill(0);
        a[0] = t;
        // serial sections are never quite registered: each lands a little off and a little turned
        a[1] = 0.006 * (r() - 0.5);
        a[2] = 0.006 * (r() - 0.5);
        a[4] = (1 - 0.3 * edge.inn) * (1 + 0.7 * edge.out);
        a[5] = -0.92 + 1.84 * (n / (this.SLICES - 1));
        a[6] = 0.012 * (r() - 0.5);
        a[7] = 6.283 * r();
        const defocus = 0.15 + 0.4 * r() + 2.6 * edge.inn * edge.inn + 2.6 * edge.out;      // nor equally sharp
        const detector = {
            soft: 1.25, defocus, fringe: 0.3 + 0.3 * defocus, fringeWidth: 2.5,
            noise: { amount: 0.045, power: 0.4, floor: 0.001, size: 4.6, live: 1, hold: 3, sharp: 0.6, fine: 0.3 },
            bleed: 1.8, light: [1, 0.87, 0.68],
            gain: (0.96 + 0.08 * r()) * (1 - 0.7 * edge.inn * edge.inn) * (1 - 0.7 * edge.out),   // nor equally exposed
        };
        return { a, detector, stage: [0, 0] };
    },
    overlay(g, t, env) {
        const n = String(this.slice(t) + 1).padStart(2, '0');
        Micrograph.databar(g, env, { x: env.W - 56 - 180, len: 180, label: '200 nm', caption: `mitochondrion · section ${n}/${this.SLICES}`, font: 'VT323', size: 34, colour: '#141a2c', shadow: 'rgba(255,255,255,0.5)', alpha: Ease.seg(t, 0.3, 0.6) * (1 - Ease.seg(t, 4.55, 4.7)) });
    },
};
