// micrograph-test · Naegleria (ours, the section palette): a thin section through an
// amoeba, Naegleria, at low magnification, reaching round a bacterium. No reference still:
// built from what the trophozoite shows (the user's three pictures of it, seen in the chat,
// agree with the textbooks: a clear rim of ectoplasm and clear blunt lobes welling up all
// round, a foamy inside full of vacuoles of every size, one nucleus that reads as a ring:
// a huge dense karyosome in a pale halo, a contractile vacuole that fills and empties, food
// vacuoles with what is left of bacteria, small dark mitochondria, threads trailing from
// the tail) and from how it feeds: two lobes go out round the
// prey and close into a cup. Licence taken: a section is of a dead cell; this one moves.
window.MGT = window.MGT ?? {};
MGT.naegleria = {
    // the body as discs (x, y, radius), at rest; frame() moves them
    DISCS: [[-0.44, 0.02, 0.19], [-0.24, 0.07, 0.235], [-0.02, 0.0, 0.245], [0.17, -0.04, 0.20], [-0.28, -0.11, 0.17], [0.02, 0.15, 0.15],
            [-0.63, -0.02, 0.085], [0.33, 0.09, 0.115], [0.32, -0.17, 0.105], [0.33, 0.09, 0.06], [0.32, -0.17, 0.055],
            // blunt lobes that well up along its sides and sink back (frame() swells them in turn)
            [-0.13, 0.24, 0.07], [0.06, -0.25, 0.07], [-0.43, 0.20, 0.06], [-0.46, -0.20, 0.06]],
    glsl: `
#define T uA[0]
#define STAGE vec2(uA[1], uA[2])
#define WASH uA[3]
#define ZOOM uA[4]
#define B vec2(uA[5], uA[6])        // how far the whole cell has crept
#define CV uA[7]                    // the contractile vacuole's radius
#define ND 15                       // discs from uA[40]: x, y, r
const vec2 ZC = vec2(0.05, -0.105);   // the mitochondrion the next magnification closes in on
const vec3 ORANGE = vec3(0.78, 0.49, 0.315), UMBER = vec3(0.31, 0.25, 0.21), ROSE = vec3(0.58, 0.36, 0.40);
const vec3 BLUSH = vec3(0.84, 0.75, 0.74), SKY = vec3(0.735, 0.815, 0.985), VIOLET = vec3(0.60, 0.61, 0.83), MAUVE = vec3(0.72, 0.47, 0.44);
// mitochondria (x, y, tilt, size), food vacuoles (x, y, r, tilt of what is in them), bacteria outside (x, y, tilt, half length)
const vec4 MT[8] = vec4[8](vec4(0.05, -0.105, 0.5, 1.0), vec4(-0.33, 0.14, -0.4, 0.9), vec4(0.16, 0.05, 1.2, 0.85), vec4(-0.08, 0.17, 0.1, 1.0),
                           vec4(-0.36, -0.14, 0.9, 0.8), vec4(0.22, -0.12, -0.7, 0.9), vec4(-0.02, -0.19, 0.2, 0.85), vec4(-0.52, 0.10, 1.4, 0.8));
const vec4 FV[3] = vec4[3](vec4(0.13, -0.045, 0.052, 0.6), vec4(-0.30, 0.02, 0.043, -0.9), vec4(0.09, 0.16, 0.036, 2.0));
const vec4 BC[4] = vec4[4](vec4(0.72, 0.31, 0.5, 0.055), vec4(0.66, -0.37, -0.3, 0.05), vec4(-0.76, 0.34, 1.1, 0.06), vec4(-0.72, -0.36, 0.2, 0.045));
float segd(vec2 p, vec2 a, vec2 b) { vec2 pa = p - a, ba = b - a; return length(pa - ba * clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0)); }
// a bacterium at this magnification: a dense rod, paler along its middle, with no line round it
void rod(vec2 q, vec2 c, float tilt, float hl, float seed, inout float s, inout vec3 ink) {
    vec2 ax = vec2(cos(tilt), sin(tilt));
    float d = segd(q, c - ax * hl, c + ax * hl) - 0.021 + 0.004 * grainy(q, 0.012, seed, 0.4);
    float in1 = inside(d, 0.007), g = grainy(q - c, 0.0055, seed + 2.0, 0.8);
    s = mix(s, 0.80, smoothstep(0.026, 0.004, d) * (1.0 - in1) * 0.6);
    s = mix(s, mix(0.27, 0.42, smoothstep(0.014, 0.0, d + 0.017)) * (1.0 + 0.25 * g), in1);
    ink = mix(ink, mix(MAUVE, UMBER, 0.45), in1);
}
void specimen(vec2 p, out float s, out vec3 ink) {
    vec2 q = (p - ZC) / ZOOM + ZC - STAGE;
    // ---- the field: pale, with wisps of debris
    float wisp = smoothstep(0.5, 0.8, fbm(q * 4.0 + 2.0)) * smoothstep(0.42, 0.66, fbm(q * 1.3 + 9.0));
    s = 0.805 + 0.02 * (fbm(q * 3.0) - 0.5) - 0.15 * wisp;
    ink = mix(SKY, VIOLET, clamp(1.5 * wisp, 0.0, 1.0));
    grit = 0.035 * grainy(q, 0.0058, 1.0, 0.6) * (1.0 + 3.0 * wisp);
    // ---- bacteria: the nearest of those adrift, and the one being taken
    {
        int ib = 0;
        float best = 1e3;
        for (int i = 0; i < 4; i++) { float d = length(q - BC[i].xy); if (d < best) { best = d; ib = i; } }
        rod(q, BC[ib].xy + 0.006 * vec2(sin(T * 0.8 + float(ib) * 2.0), cos(T * 0.6 + float(ib))), BC[ib].z + 0.1 * sin(T * 0.5 + float(ib)), BC[ib].w, 40.0 + float(ib), s, ink);
    }
    // ---- the amoeba: lobes that flow into each other
    float dB = 1e3;
    for (int i = 0; i < ND; i++) dB = smin(dB, length(q - vec2(uA[40 + 3 * i], uA[41 + 3 * i])) - uA[42 + 3 * i], 0.075);
    vec2 qb = q - B;                                                         // a point fixed to the cell
    float lumps = fbm(qb * 5.0 + vec2(T * 0.03, 0.0)), fine = fbm(qb * 14.0 + 4.0);
    dB += 0.026 * (lumps - 0.5) + 0.008 * (fine - 0.5);
    float cell = inside(dB, 0.005), x = -dB;
    // the clear rim (ectoplasm): no granules reach the edge, least of all in a pseudopod
    float clear = smoothstep(0.085, 0.022, x + 0.03 * (lumps - 0.5));
    // the inside streams: its grain drifts forward along the cell's length
    vec2 qs = qb - vec2(0.012 * T, 0.004 * sin(T * 0.4 + qb.x * 6.0));
    float g0 = grainy(qs, 0.021, 6.0, 0.3), g1 = grainy(qs, 0.0105, 3.0, 0.6), g2 = grainy(qs, 0.0052, 5.0, 0.8);
    float clump = (max(0.35 * g0 + 0.6 * g1 + 0.35 * g2, 0.0) * 1.7 - 0.27) * (1.0 - clear);
    float cs = mix(0.50 + 0.07 * (lumps - 0.5), 0.74, clear) * (1.0 - 0.36 * clump);
    float halo = smoothstep(0.040, 0.010, dB) * (1.0 - cell);
    s = mix(s, 0.80, 0.8 * halo);
    ink = mix(ink, BLUSH, halo);
    s = mix(s, cs, cell);
    ink = mix(ink, mix(ORANGE, BLUSH, 0.8 * clear), cell);
    grit = mix(grit, (0.24 * g2 + 0.10 * g1) * (1.0 - 0.65 * clear), cell);
    // (at this magnification a membrane is far too thin to show: the edge is a denser
    // cortex, uneven, not a line)
    float mem = shell(dB + 0.010, 0.011) * smoothstep(0.35, 0.75, fine) * (0.7 + 0.5 * g1);
    s = mix(s, 0.48, 0.3 * mem);
    ink = mix(ink, ROSE, 0.3 * mem);
    // the bacterium being taken: in the cup, still outside the cell
    {
        float s2 = s;
        vec3 k2 = ink;
        rod(q, vec2(uA[8], uA[9]), uA[10], 0.05, 50.0, s2, k2);
        s = mix(s, s2, 1.0 - cell);
        ink = mix(ink, k2, 1.0 - cell);
    }
    // threads trailing from the tail (the uroid), faint
    {
        vec2 tail = vec2(uA[40 + 18], uA[41 + 18]) - vec2(uA[42 + 18] * 0.8, 0.0);
        float dt = 1e3;
        for (int k = 0; k < 3; k++) {
            float fk = float(k), sw = 0.02 * sin(T * (0.5 + 0.2 * fk) + fk * 2.0);
            vec2 a1 = tail + vec2(-0.02, (fk - 1.0) * 0.022), b1 = a1 + vec2(-0.075, (fk - 1.0) * 0.05 + sw), c1 = b1 + vec2(-0.06, -0.03 + 0.04 * fk - sw);
            dt = min(dt, min(segd(q, a1, b1), segd(q, b1, c1)));
        }
        float th = smoothstep(0.0065, 0.0015, dt + 0.003 * grainy(q, 0.012, 8.0, 0.4)) * (1.0 - cell) * smoothstep(0.17, 0.03, length(q - tail)) * (0.6 + 0.5 * grainy(q, 0.02, 9.0, 0.3));
        s = mix(s, 0.64, 0.4 * th);
        ink = mix(ink, ROSE, 0.4 * th);
    }
    // ---- what is in it (all of it rides the cell)
    // the foam: vacuoles of every size, most of them towards the rear; one at most per cell
    // of a grid, and many cells empty
    {
        vec2 gcell = qb / 0.078, ci = floor(gcell);
        vec3 h = hash3(ci + 300.0), h2 = hash3(ci + 371.0);
        float r = (0.010 + 0.026 * h.x * h.x) / 0.078;
        vec2 c = 0.5 + (0.5 - r - 0.03) * (h2.xy * 2.0 - 1.0) + 0.04 * vec2(sin(T * 0.4 + h.y * 6.283), cos(T * 0.35 + h2.z * 6.283));
        vec2 dv2 = fract(gcell) - c;
        float dv = (length(dv2) - r * wobble(atan(dv2.y, dv2.x), h.z * 50.0, 0.10, 0.0)) * 0.078 + 0.003 * g1;
        float there = step(mix(0.30, 0.78, smoothstep(-0.35, 0.30, qb.x)), h.z) * cell * (1.0 - clear);
        float inv = inside(dv, 0.006) * there;
        s = mix(s, 0.78, 0.85 * inv);
        ink = mix(ink, BLUSH, 0.85 * inv);
        s = mix(s, 0.40, 0.3 * shell(dv, 0.005) * there);
        grit *= 1.0 - 0.6 * inv;
    }
    // food vacuoles: a pale bubble, and in it what is left of a bacterium
    for (int i = 0; i < 3; i++) {
        vec2 c = FV[i].xy + 0.008 * vec2(sin(T * 0.5 + float(i) * 2.1), cos(T * 0.4 + float(i)));
        float dv = length(qb - c) - FV[i].z * wobble(atan(qb.y - c.y, qb.x - c.x), 60.0 + float(i), 0.06, T * 0.4);
        float inv = inside(dv, 0.008) * cell, ax = FV[i].w;
        float dr = segd(qb, c - 0.4 * FV[i].z * vec2(cos(ax), sin(ax)), c + 0.4 * FV[i].z * vec2(cos(ax), sin(ax))) - 0.32 * FV[i].z + 0.005 * g1;
        s = mix(s, 0.80, inv);
        ink = mix(ink, BLUSH, inv);
        s = mix(s, 0.30 * (1.0 + 0.25 * g2), inside(dr, 0.005) * inv);
        ink = mix(ink, UMBER, 0.7 * inside(dr, 0.005) * inv);
        s = mix(s, 0.40, 0.4 * shell(dv, 0.006) * cell * (0.6 + 0.6 * g1));
    }
    // the contractile vacuole: it fills slowly and empties at once
    {
        float dv = length(qb - vec2(-0.47, -0.025)) - CV * wobble(atan(qb.y + 0.025, qb.x + 0.47), 70.0, 0.05, T);
        float inv = inside(dv, 0.008) * cell * step(0.008, CV);
        s = mix(s, 0.86, inv);
        ink = mix(ink, SKY, 0.8 * inv);
        s = mix(s, 0.42, 0.4 * shell(dv, 0.006) * cell * step(0.008, CV));
    }
    // mitochondria: small, dense, with a hint of their cristae; the nearest one only
    {
        int im = 0;
        float best = 1e3;
        for (int i = 0; i < 8; i++) { float d = length(qb - MT[i].xy); if (d < best) { best = d; im = i; } }
        vec2 l = rot(MT[im].z + 0.15 * sin(T * 0.3 + float(im))) * (qb - MT[im].xy - 0.006 * vec2(sin(T * 0.45 + float(im) * 1.7), cos(T * 0.37 + float(im))));
        float dm = body(l, vec2(0.040, 0.021) * MT[im].w, 80.0 + float(im), 0.08, 0.0);
        float inm = inside(dm, 0.007) * cell, stripes = 0.5 + 0.5 * sin(l.x / 0.0075 * 6.2831853 + 2.0 * l.y / 0.02);
        s = mix(s, (0.30 + 0.09 * stripes) * (1.0 + 0.22 * g2), inm);
        ink = mix(ink, mix(UMBER, ORANGE, 0.45), inm);
    }
    // the nucleus: an envelope, pale inside, and the karyosome: one huge dense body in a clear ring
    {
        vec2 l = qb - vec2(-0.17, 0.03) - 0.006 * vec2(sin(T * 0.3), cos(T * 0.25));
        float dn = body(l, vec2(0.102, 0.094), 90.0, 0.04, T * 0.3);
        float dk = body(l - vec2(0.006, -0.004), vec2(0.047, 0.043), 91.0, 0.07, 0.0) + 0.006 * g1;
        float inn = inside(dn, 0.006) * cell, ink_ = inside(dk, 0.007);
        float ns = 0.66 + 0.05 * g1 + 0.07 * smoothstep(0.03, 0.0, dk);       // (the ring round the karyosome is clearer)
        s = mix(s, mix(ns, 0.17 * (1.0 + 0.3 * g2), ink_), inn);
        ink = mix(ink, mix(BLUSH, UMBER, ink_), inn);
        grit = mix(grit, 0.14 * g2, inn);
        // the envelope shows as the chromatin clumped against it, not as a line
        float env = shell(dn + 0.006, 0.007) * cell * smoothstep(-0.3, 0.5, g0 + 0.6 * g1);
        s = mix(s, 0.24, 0.7 * env);
        ink = mix(ink, UMBER, 0.7 * env);
    }
    // ---- the wash: until the colourist reaches a place it is the raw grey image
    float front = smoothstep(0.0, 0.25, WASH * 3.3 - 0.5 - (p.x / uAspect + 0.5) - 0.9 * (fbm(p * 3.0 + 7.0) - 0.5) - 0.25 * (0.5 - p.y));
    ink = mix(vec3(lum(ink)), ink, front);
}
`,
    frame(t, edge) {
        const a = new Array(90).fill(0), D = this.DISCS.map((d) => d.slice());
        const reach = Ease.inOut(Ease.seg(t, 1.4, 5.9)), creep = 0.035 * Ease.inOut(Ease.seg(t, 0.5, 6.5));
        const lerp = (i, to) => { for (let k = 0; k < 3; k++) D[i][k] += (to[k] - D[i][k]) * reach; };
        // two lobes go out to either side of the bacterium and their tips curl in round it;
        // the tail is drawn in behind
        lerp(7, [0.44, 0.135, 0.128]);
        lerp(8, [0.43, -0.15, 0.122]);
        lerp(9, [0.585, 0.128, 0.072]);
        lerp(10, [0.575, -0.122, 0.068]);
        lerp(6, [-0.57, -0.01, 0.09]);
        // the side lobes well up and sink in turn, each pushed out along its own direction
        [11, 12, 13, 14].forEach((i, k) => {
            const up = 0.5 + 0.5 * Math.sin(t * 0.75 + k * 1.7), d = D[i], n = Math.hypot(d[0] + 0.15, d[1]);
            d[0] += (0.05 * up * (d[0] + 0.15)) / n;
            d[1] += (0.05 * up * d[1]) / n;
            d[2] *= 0.75 + 0.55 * up;
        });
        D.forEach(([x, y, r], i) => {
            // every lobe breathes at its own rate
            a[40 + 3 * i] = x + creep + 0.006 * Math.sin(t * 0.7 + i * 1.9);
            a[41 + 3 * i] = y + 0.006 * Math.cos(t * 0.6 + i * 2.3);
            a[42 + 3 * i] = r * (1 + 0.025 * Math.sin(t * 0.9 + i * 1.3));
        });
        const wash = Ease.inOut(Ease.seg(t, 1.3, 2.9));
        a[0] = t;
        a[1] = 0.0015 * t;
        a[2] = 0.0008 * t;
        a[3] = wash;
        a[4] = 1 + 1.4 * edge.out;
        a[5] = creep;
        // the contractile vacuole fills for 3.6 s and empties in 0.3 s
        const ph = ((t + 1.2) % 3.9) / 3.9;
        a[7] = ph < 0.92 ? 0.022 + 0.05 * Math.sqrt(ph / 0.92) : 0.072 * (1 - Ease.inOut((ph - 0.92) / 0.08));
        // the bacterium is jostled, and drawn in a little as the cup closes
        a[8] = 0.60 - 0.025 * reach + creep + 0.004 * Math.sin(t * 1.7);
        a[9] = 0.005 + 0.004 * Math.cos(t * 1.3);
        a[10] = 1.35 + 0.12 * Math.sin(t * 0.9) - 0.2 * reach;
        // the image arrives out of focus; the operator pulls it in, a little too far, and back
        const defocus = Motion.keys([[0, 3.4], [0.9, 0.0], [1.2, 0.7], [1.6, 0.1]], t, Ease.inOut) + 0.05 * Math.sin(t * 1.2) + 2.6 * edge.out;
        const detector = {
            soft: 1.45, defocus, fringe: 0.3 + 0.3 * defocus, fringeWidth: 2.5,
            noise: { amount: 0.045, power: 0.4, floor: 0.001, size: 4.6, live: 0.6, hold: 2, sharp: 0.6, fine: 0.3 },
            bleed: 1.8, light: [1, 1 - 0.13 * wash, 1 - 0.32 * wash],   // (highlights burn to cream only once tinted)
            // the beam comes on at the start of the film and dips at the change of magnification
            gain: (edge.first ? 0.12 + 0.88 * Ease.out(Ease.seg(t, 0, 0.6)) : 1 - 0.7 * edge.inn * edge.inn) * (1 - 0.7 * edge.out),
        };
        return { a, detector, stage: [a[1], a[2]] };
    },
    overlay(g, t, env) {
        Micrograph.databar(g, env, { x: env.W - 56 - 164, len: 164, label: '2 µm', caption: 'Naegleria · trophozoite', font: 'VT323', size: 34, colour: '#141a2c', shadow: 'rgba(255,255,255,0.5)', alpha: Ease.seg(t, 0.5, 0.9) * (1 - Ease.seg(t, 6.05, 6.2)) });
    },
};
