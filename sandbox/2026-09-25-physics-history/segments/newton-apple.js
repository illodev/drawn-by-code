// Segment «Newton's apple» of physics-history (script v2, 5–12 s of the piece; local 0–7):
// an apple hangs among the leaves; it falls, the camera follows it down and it lands on
// Newton's head (bonk, little stars going round). He gets up, picks it up, looks at it,
// glances at the daytime Moon and throws it up hard. The camera pulls away, Powers of Ten
// style: the field, the rolling land, the coast, the curve of the Earth, and the apple rises
// and bends into an orbit round the globe.
//
//   Seg.newtonApple.init() → state · draw(press, tq, st) · APPLE(t) (the apple's screen
//   position and radius, for the next join)
//
// World units at the start: 1 head (u) = 95 units ≈ 23 cm, so 1 unit ≈ 2.4 mm and the Earth's
// radius is 2.65e9 units. The pull-back is a zoom z from 1 to 8.7e-8 (the globe 230 units
// across the screen), eased on log z.
var Seg = globalThis.Seg ?? (globalThis.Seg = {});
(() => {
    const { put, ink, line, smooth, poly, taper, circle, ellipse } = Ph;
    const L = Ease.lerp, S = Ease.seg, IO = Ease.inOut;
    const u = 95, G = 820;
    const RW = 2.65e9;
    const T = { snap: 0.6, bonk: 1.5, land: 2.0, rest: 2.35, grab: 3.4, release: 4.5, pull: [4.55, 6.9] }; // the hits on the beat (120 BPM)
    const APPLE_R = 30;
    const HANG = [425, -300];

    // ── colours ──────────────────────────────────────────────────────────────────────────
    const LEAF = [{ yellow: 1, 'blue.s': 0.62, 'navy.s': 0.25 }, { yellow: 1, 'blue.s': 0.5, 'navy.s': 0.1 }, { yellow: 1, 'blue.s': 0.72, 'navy.s': 0.42 }];
    const LEAF_LT = { yellow: 1, 'blue.s': 0.35 };
    const BARK = { 'yellow.s': 0.7, 'pink.s': 0.55, 'navy.s': 0.6 };
    const BARK_LT = { 'yellow.s': 0.6, 'pink.s': 0.4, 'navy.s': 0.3 };
    const GRASS = { yellow: 1, 'blue.s': 0.55, 'navy.s': 0.05 };
    const GRASS_DK = { yellow: 1, 'blue.s': 0.75, 'navy.s': 0.35 };
    const APPLE = { pink: 1, yellow: 1, 'navy.s': 0.05 };
    const APPLE_SH = { pink: 1, yellow: 1, 'navy.s': 0.45 };
    const AMBER = { yellow: 1, 'pink.s': 0.55 };

    // ── choreography ────────────────────────────────────────────────────────────────────
    // Newton's key poses (world units), eased between keys
    const P = (Px, Py, Cx, Cy, Hx, Hy, hN, hF, fN, fF, extra = {}) => ({ u, P: [Px, Py], C: [Cx, Cy], H: [Hx, Hy], hN, hF, fN, fF, tilt: 0, look: [1, 0.2], gripN: 0.4, gripF: 0.4, brow: 0, ...extra });
    const READ = P(420, 775, 405, 560, 428, 478, [520, 690], [538, 676], [690, 812], [655, 812], { look: [0.7, 1], tilt: 0.12 });
    const KEYS = [
        [0, READ],
        [1.44, { ...READ, H: [430, 482] }],
        [1.58, { ...READ, H: [436, 500], C: [412, 575], tilt: 0.3, shut: true, hN: [540, 720], hF: [560, 700] }],
        [2.0, { ...READ, H: [432, 486], tilt: 0.08, shut: true, brow: 1, hN: [540, 715], hF: [560, 700] }],
        [2.3, { ...READ, H: [436, 482], tilt: -0.05, brow: 1, look: [1, 0.6], hN: [560, 720], hF: [520, 760] }],
        [2.5, P(480, 700, 510, 480, 532, 396, [600, 660], [470, 600], [590, 812], [440, 800], { look: [1, 0.5], brow: 0.6 })],
        [2.85, P(545, 445, 555, 215, 572, 130, [565, 470], [525, 470], [585, 815], [520, 815], { look: [1, 0.6] })],
        [3.1, P(612, 445, 622, 215, 640, 132, [630, 470], [590, 460], [668, 815], [575, 806], { look: [1, 0.8], toeF: 0.25 })],
        [3.38, P(640, 520, 715, 385, 760, 335, [736, 776], [700, 600], [700, 815], [605, 815], { tilt: 0.45, look: [0.8, 1], gripN: 0.2 })],
        [3.75, P(650, 445, 660, 215, 676, 130, [780, 235], [620, 470], [700, 815], [610, 815], { look: [1, 0.2], gripN: 'apple', brow: 0.3, elbowN: 'down' })],
        [4.05, P(650, 445, 658, 215, 672, 128, [775, 245], [620, 470], [700, 815], [610, 815], { look: [0.7, -1], tilt: -0.3, gripN: 'apple', brow: 0.9, elbowN: 'down' })],
        [4.3, P(636, 452, 612, 226, 620, 142, [500, 470], [720, 330], [745, 815], [600, 815], { look: [0.7, -0.8], tilt: -0.2, gripN: 'apple', brow: 0.5 })],
        [4.42, P(660, 448, 650, 222, 668, 140, [560, 70], [740, 360], [745, 815], [600, 815], { look: [0.7, -0.8], tilt: -0.3, gripN: 'apple', brow: 0.5, elbowN: 'up' })],
        [4.5, P(682, 445, 716, 220, 738, 140, [870, 30], [600, 420], [745, 815], [630, 792], { look: [0.6, -1], tilt: -0.4, gripN: 0.1, elbowN: 'down', toeF: 0.55 })],
        [5.1, P(684, 446, 712, 220, 732, 140, [850, 60], [600, 430], [745, 815], [640, 808], { look: [0.4, -1], tilt: -0.5, gripN: 0.1, elbowN: 'down', brow: 1 })],
        [7, P(684, 446, 712, 220, 732, 140, [850, 60], [600, 430], [745, 815], [640, 808], { look: [0.4, -1], tilt: -0.5, gripN: 0.1, elbowN: 'down', brow: 1 })],
    ];
    // the apple before the throw: hangs, falls, bonks, bounces, rests, is carried
    const HEAD_TOP = [436, 408];
    function appleWorld(t, hand) {
        if (t < T.snap) return { p: [HANG[0] + Math.sin(t * 7) * 3, HANG[1] + Math.cos(t * 5) * 1.5], rot: Math.sin(t * 7) * 0.08 };
        if (t < T.bonk) { const k = (t - T.snap) / (T.bonk - T.snap); return { p: [L(HANG[0], HEAD_TOP[0], k), L(HANG[1], HEAD_TOP[1] - APPLE_R, k * k)], rot: k * 0.6 }; }
        if (t < T.land) { const k = (t - T.bonk) / (T.land - T.bonk); return { p: [L(HEAD_TOP[0], 736, k), L(HEAD_TOP[1] - APPLE_R, G - APPLE_R + 8, k) - Math.sin(k * Math.PI) * 170], rot: 0.6 + k * 4, squash: t < T.bonk + 0.09 ? 0.75 : 1 };}
        if (t < T.grab) { const k = S(t, T.land, T.rest); return { p: [736 + Math.sin(k * Math.PI) * 18 * (1 - k), G - APPLE_R + 8 - Math.sin(k * Math.PI) * 26 * (1 - k)], rot: 4.6 + k * 0.8 }; }
        return { p: [hand[0] + 16, hand[1] - 14], rot: 5.4 };
    }

    // the camera for shots A and B: centre in world units and zoom
    function camAB(t, apple) {
        if (t < T.bonk) {
            const k = IO(S(t, T.snap, T.bonk));
            return { c: [L(HANG[0], 520, k), Math.max(L(HANG[1], 520, k), Math.min(apple[1] + 160, 520))], z: L(2.4, 1.7, k) };
        }
        const shake = t < T.bonk + 0.2 ? Math.sin((t - T.bonk) * 90) * 10 * (1 - (t - T.bonk) / 0.2) : 0;
        const keys = [[T.bonk, [520, 520], 1.7], [2.3, [570, 430], 1.45], [2.8, [630, 340], 1.35], [3.35, [700, 500], 1.5], [4.0, [700, 320], 1.4], [4.5, [680, 330], 1.25]];
        let i = 0;
        while (i < keys.length - 2 && t >= keys[i + 1][0]) i++;
        const [t0, c0, z0] = keys[i], [t1, c1, z1] = keys[i + 1], k = IO(S(t, t0, t1));
        return { c: [L(c0[0], c1[0], k), L(c0[1], c1[1], k) + shake], z: L(z0, z1, k) };
    }

    // ── the pull-back (shot C) ──────────────────────────────────────────────────────────
    const ZEND = 230 / RW;
    const Z0 = 1.25; // the last key of shot B's camera: the pull-back starts from it, no jump
    const zoomAt = (t) => Z0 * Math.exp(Math.log(ZEND / Z0) * IO(S(t, T.pull[0], T.pull[1])));
    // the anchor (Newton's feet) on screen: from where shot B leaves it to the globe's top
    const FEET = [650, G];
    function anchorAt(t, camB) {
        const k = IO(S(t, T.pull[0], T.pull[1]));
        const a0 = [(FEET[0] - camB.c[0]) * camB.z + 800, (FEET[1] - camB.c[1]) * camB.z + 450];
        return [L(a0[0], 800, k), L(a0[1], 250, k)];
    }
    // terrain height along the ground (world units) as a sum of octaves: fields, hills, downs;
    // flat near Newton; the land ends at the coast (s > 1.1e8, the North Sea)
    function terrain(s) {
        // zero-mean octaves, each fading in over its own wavelength from Newton's spot, so the
        // field is flat where he stands and the land rolls further out (no walls, no valley)
        const as = Math.abs(s);
        let h = 0;
        for (const [wl, amp] of [[9e3, 160], [5e4, 900], [3e5, 3000], [2e6, 7000], [1.2e7, 16000]]) h += amp * Math.sin(s / wl * 6.2832 + wl) * Math.min(1, as / wl);
        return s > 1.1e8 ? 0 : h;
    }

    // ── drawing ─────────────────────────────────────────────────────────────────────────
    function sky(press, t, dark) {
        // day sky: paper with a blue screen, deeper at the top; it turns into space as we rise
        ink(press, (g) => g.rect(0, 0, 1600, 900), { 'blue.s': (g) => Riso.ramp(g, 0, 0, 0, 900, 0.42 * (1 - dark), 0.14 * (1 - dark)) });
        if (dark > 0) ink(press, (g) => g.rect(0, 0, 1600, 900), { blue: 0.9 * dark, 'navy.s': (g) => Riso.radial(g, 820, 420, 120, 1000, 0.5 * dark, 0.95 * dark) });
    }
    function sun(press, x, y, t) {
        for (let i = 0; i < 12; i++) {
            const a = i / 12 * 6.2832 + t * 0.15;
            line(press, [[x + Math.cos(a) * 70, y + Math.sin(a) * 70], [x + Math.cos(a) * 110, y + Math.sin(a) * 110]], taper(9), { yellow: 1, 'pink.s': 0.15 });
        }
        put(press, circle(x, y, 56), { yellow: 1, 'pink.s': 0.2 });
        press.knockout(ellipse(x - 16, y - 18, 14, 10));
    }
    function cloud(press, x, y, s, spec = { 'blue.s': 0.08 }) {
        const bumps = [[-60, 10, 38], [-20, -14, 48], [30, -6, 44], [70, 12, 32], [0, 18, 40]];
        put(press, (g) => { g.beginPath(); for (const [bx, by, r] of bumps) { g.moveTo(x + (bx + r) * s, y + by * s); g.arc(x + bx * s, y + by * s, r * s, 0, 6.2832); } }, spec);
        ink(press, (g) => g.rect(x - 110 * s, y + 18 * s, 220 * s, 30 * s), { 'blue.s': 0.2 });
    }
    function moon(press, x, y) {
        put(press, circle(x, y, 30), { 'blue.s': 0.12 });
        ink(press, (g) => { g.arc(x + 12, y - 4, 26, 0, 6.2832); }, { 'blue.s': 0.28 });
        for (const [dx, dy, r] of [[-10, -8, 5], [6, 10, 4], [-4, 12, 3]]) ink(press, circle(x + dx, y + dy, r), { 'blue.s': 0.3 });
    }
    // ── the orchard at Woolsthorpe, in layers from the far downs to the grass at our feet ──
    const fadeSpec = (f) => (spec) => (f < 1 ? Object.fromEntries(Object.entries(spec).map(([k, v]) => [k.endsWith('.s') ? k : k + '.s', v * f])) : spec);
    const STONE = [{ 'yellow.s': 0.42, 'pink.s': 0.22, 'navy.s': 0.12 }, { 'yellow.s': 0.5, 'pink.s': 0.3, 'navy.s': 0.2 }, { 'yellow.s': 0.36, 'pink.s': 0.16, 'navy.s': 0.06 }];
    function backdrop(press, t, f) {
        const Sf = fadeSpec(f), K = { knock: f >= 1 };
        const r = Motion.rng('downs');
        // far downs: a patchwork of fields in soft screens, hedges between them, copses
        put(press, (g) => smooth(g, [[-1400, 600], [-700, 520], [0, 560], [700, 500], [1400, 540], [2400, 490], [3200, 560], [3200, 900], [-1400, 900]], false), Sf({ 'blue.s': 0.4, 'yellow.s': 0.3 }), K);
        for (let i = 0; i < 16; i++) {
            const x0 = -1400 + i * 290, y0 = 560 + Math.sin(i * 0.9) * 26, w = 290, h = 60 + r() * 30;
            const tone = [{ 'yellow.s': 0.55, 'blue.s': 0.3 }, { 'yellow.s': 0.7, 'pink.s': 0.18, 'blue.s': 0.1 }, { 'yellow.s': 0.4, 'blue.s': 0.45 }][i % 3];
            put(press, (g) => poly(g, [[x0, y0], [x0 + w, y0 - 8], [x0 + w + 20, y0 + h], [x0 + 10, y0 + h + 6]]), Sf(tone), K);
            line(press, [[x0, y0], [x0 + 10, y0 + h + 6]], 3, Sf({ yellow: 1, 'blue.s': 0.7, 'navy.s': 0.3 }), K);
            for (let k = 0; k < 3; k++) put(press, circle(x0 + r() * w, y0 + 4 + r() * 6, 6 + r() * 5), Sf({ yellow: 1, 'blue.s': 0.7, 'navy.s': 0.35 }), K);
            // ploughed furrows in the yellow fields
            if (i % 3 === 1) for (let k = 1; k < 5; k++) line(press, [[x0 + 8, y0 + k * h / 5], [x0 + w + 8, y0 + k * h / 5 - 6]], 1.2, Sf({ 'pink.s': 0.3, 'navy.s': 0.2 }), K);
        }
        // a post mill on the skyline with sails turning
        const wm = [1660, 505];
        put(press, (g) => poly(g, [[wm[0] - 6, wm[1] + 30], [wm[0] + 6, wm[1] + 30], [wm[0] + 3, wm[1]], [wm[0] - 3, wm[1]]]), Sf({ 'navy.s': 0.5, 'yellow.s': 0.3 }), K);
        put(press, (g) => g.rect(wm[0] - 12, wm[1] - 30, 24, 32), Sf({ 'yellow.s': 0.5, 'pink.s': 0.3, 'navy.s': 0.35 }), K);
        for (let k = 0; k < 4; k++) {
            const a = t * 1.6 + k * 1.5708, e = [wm[0] + Math.cos(a) * 46, wm[1] - 18 + Math.sin(a) * 46];
            line(press, [[wm[0], wm[1] - 18], e], 3, Sf({ 'navy.s': 0.5 }), K);
            put(press, (g) => poly(g, [[wm[0] + Math.cos(a) * 12 - Math.sin(a) * 2, wm[1] - 18 + Math.sin(a) * 12 + Math.cos(a) * 2], [e[0] - Math.sin(a) * 2, e[1] + Math.cos(a) * 2], [e[0] - Math.sin(a) * 10, e[1] + Math.cos(a) * 10], [wm[0] + Math.cos(a) * 12 - Math.sin(a) * 10, wm[1] - 18 + Math.sin(a) * 12 + Math.cos(a) * 10]]), Sf({ 'yellow.s': 0.2, 'blue.s': 0.1 }), K);
        }
        // the near meadow's rise
        put(press, (g) => smooth(g, [[-1400, 690], [-600, 640], [200, 668], [900, 630], [1600, 655], [3200, 630], [3200, 900], [-1400, 900]], false), Sf({ yellow: 1, 'blue.s': 0.45 }), K);
        // Woolsthorpe Manor: a limestone house, T-shaped, stone-slate roof, mullioned windows
        const mx = 1330, my = 648;
        const HOUSE = { 'yellow.s': 0.36, 'pink.s': 0.16, 'navy.s': 0.05 }, HOUSE_SH = { 'yellow.s': 0.45, 'pink.s': 0.28, 'navy.s': 0.25 };
        const ROOF = { 'blue.s': 0.45, 'navy.s': 0.45, 'yellow.s': 0.2 };
        put(press, (g) => g.rect(mx - 120, my - 70, 170, 70), Sf(HOUSE), K);
        put(press, (g) => g.rect(mx + 50, my - 86, 70, 86), Sf(HOUSE_SH), K);
        put(press, (g) => poly(g, [[mx - 130, my - 70], [mx - 60, my - 118], [mx + 10, my - 118], [mx + 60, my - 70]]), Sf(ROOF), K);
        put(press, (g) => poly(g, [[mx + 42, my - 86], [mx + 85, my - 128], [mx + 128, my - 86]]), Sf(ROOF), K);
        for (let k = 1; k < 5; k++) line(press, [[mx - 130 + k * 14, my - 70 - k * 10], [mx + 60 - k * 12, my - 70 - k * 10]], 1.3, Sf({ navy: 0.8 }), K);
        for (let k = 1; k < 6; k++) line(press, [[mx - 120, my - 70 + k * 12], [mx + 50, my - 70 + k * 12]], 1, Sf({ 'pink.s': 0.35, 'navy.s': 0.25 }), K);
        for (const [cx, cy] of [[mx - 90, my - 128], [mx + 2, my - 128]]) {
            put(press, (g) => g.rect(cx - 8, cy, 16, 26), Sf(HOUSE_SH), K);
            // smoke from the chimney, drifting right in puffs
            for (let k = 0; k < 5; k++) {
                const ph = (t * 0.5 + k / 5) % 1;
                put(press, circle(cx + ph * 60 + Math.sin(ph * 6 + k) * 5, cy - 8 - ph * 70, 5 + ph * 10), Sf({ 'blue.s': 0.1 + 0.15 * (1 - ph) }), K);
            }
        }
        for (const [wx, wy] of [[-100, -52], [-60, -52], [-20, -52], [20, -52], [-100, -26], [-20, -26], [20, -26], [66, -60], [66, -30]]) {
            put(press, (g) => g.rect(mx + wx, my + wy, 22, 16), Sf({ navy: 1, 'blue.s': 0.3 }), K);
            line(press, [[mx + wx + 11, my + wy], [mx + wx + 11, my + wy + 16]], 2, Sf(HOUSE), K);
            line(press, [[mx + wx - 2, my + wy - 2], [mx + wx + 24, my + wy - 2]], 3, Sf(HOUSE_SH), K);
        }
        put(press, (g) => poly(g, [[mx - 62, my], [mx - 62, my - 22], [mx - 54, my - 28], [mx - 46, my - 22], [mx - 46, my]]), Sf({ 'yellow.s': 0.7, 'pink.s': 0.55, 'navy.s': 0.55 }), K);
        // the orchard round the house: small apple trees with red dots
        for (let i = 0; i < 9; i++) {
            const x = 1050 + i * 70 + Math.sin(i * 3) * 20, y = 662 + (i % 2) * 8;
            line(press, [[x, y], [x, y - 18]], 4, Sf({ 'yellow.s': 0.6, 'pink.s': 0.5, 'navy.s': 0.6 }), K);
            put(press, circle(x, y - 30, 22), Sf(LEAF[i % 3]), K);
            for (let k = 0; k < 3; k++) put(press, circle(x - 12 + k * 11, y - 30 + ((k * 7) % 12) - 5, 3), Sf(APPLE), K);
        }
        // sheep grazing on the rise: body, legs, a black face that dips to the grass
        const rs = Motion.rng('sheep');
        for (let i = 0; i < 8; i++) {
            const x = 760 + rs() * 1000, y = 690 + rs() * 26, graze = Math.max(0, Math.sin(t * 1.2 + i * 2)), dir = rs() < 0.5 ? 1 : -1;
            for (const lx of [-8, -3, 5, 10]) line(press, [[x + lx, y + 4], [x + lx, y + 14]], 2.2, Sf({ navy: 1 }), K);
            put(press, (g) => smooth(g, [[x - 16, y], [x - 10, y - 9], [x + 2, y - 11], [x + 14, y - 8], [x + 17, y + 2], [x + 6, y + 8], [x - 12, y + 7]]), Sf({ 'blue.s': 0.05, 'yellow.s': 0.05 }), K);
            put(press, ellipse(x + dir * 18, y - 4 + graze * 8, 5, 4, dir * 0.6), Sf({ navy: 1, yellow: 0.8 }), K);
        }
        // a dry-stone wall across the middle distance, with a wooden stile
        const wy = 745;
        for (let row = 0; row < 3; row++) {
            for (let k = 0; k < 44; k++) {
                const j = Math.sin(k * 7.3 + row * 3.1) * 0.5 + 0.5, w = 34 + j * 20, x = -700 + k * 54 + (row % 2) * 24, y = wy - row * 14;
                if (x > 1080 && x < 1200) continue;
                put(press, (g) => smooth(g, [[x, y], [x + w * 0.2, y - 12], [x + w * 0.8, y - 13], [x + w, y - 2], [x + w * 0.8, y + 2], [x + w * 0.2, y + 2]]), Sf(STONE[(k + row) % 3]), K);
                line(press, [[x + 3, y + 1], [x + w - 3, y + 1]], 2, Sf({ 'navy.s': 0.55, 'pink.s': 0.3 }), K);
            }
        }
        for (let k = 0; k < 40; k++) { const x = -690 + k * 58; put(press, (g) => poly(g, [[x, wy - 42], [x + 28, wy - 48], [x + 50, wy - 42], [x + 26, wy - 36]]), Sf(STONE[k % 3]), K); }
        for (const sx of [1100, 1180]) put(press, (g) => g.rect(sx, wy - 70, 10, 72), Sf({ 'yellow.s': 0.7, 'pink.s': 0.55, 'navy.s': 0.5 }), K);
        for (const sy of [wy - 58, wy - 30]) put(press, (g) => g.rect(1094, sy, 100, 8), Sf({ 'yellow.s': 0.65, 'pink.s': 0.45, 'navy.s': 0.35 }), K);
        // swallows flicking across the sky
        for (let i = 0; i < 4; i++) {
            const ph = (t * 0.12 + i * 0.27) % 1, x = -300 + ph * 2200, y = 150 + i * 70 + Math.sin(ph * 12 + i) * 30, fl = Math.sin(t * 16 + i * 2);
            line(press, [[x - 14, y - 6 * fl], [x, y], [x + 14, y - 6 * fl]], 3, Sf({ navy: 1 }), K);
        }
    }
    function tree(press, t, apples) {
        const sway = Math.sin(t * 1.3) * 5;
        // roots flaring into the ground, then the trunk: an old apple tree, leaning a little
        for (const [x0, x1, w] of [[300, 220, 50], [350, 330, 36], [420, 520, 44]]) line(press, [[x0 + 40, G - 60], [(x0 + x1) / 2 + 40, G - 10], [x1 + 40, G + 12]], taper(w, 0.05, 0.9), BARK);
        const trunk = [[290, G + 8], [316, G - 70], [334, 420], [326, 180], [304, 60], [362, 30], [396, 140], [412, 420], [424, G - 80], [456, G + 10]];
        put(press, (g) => smooth(g, trunk), BARK);
        press.save();
        press.clip((g) => smooth(g, trunk));
        // bark: long ridges, darker furrows, cracks, moss on the shady side
        const rb = Motion.rng('bark');
        for (let i = 0; i < 16; i++) {
            const x = 300 + i * 8 + rb() * 6;
            line(press, [[x, G + 10], [x + 6 + rb() * 6, 560], [x - 4 + rb() * 8, 300], [x + 4, 60]], taper(2 + rb() * 3, 0.1, 0.1), i % 3 ? BARK_LT : { 'yellow.s': 0.8, 'pink.s': 0.65, 'navy.s': 0.85 });
        }
        for (let i = 0; i < 22; i++) { const x = 320 + rb() * 90, y = 120 + rb() * 680; line(press, [[x, y], [x + 4, y + 10 + rb() * 18]], 2, { navy: 1, 'pink.s': 0.5 }); }
        put(press, (g) => smooth(g, [[300, 700], [330, 620], [340, 520], [322, 450], [300, 520]]), { yellow: 1, 'blue.s': 0.6, 'navy.s': 0.3 }, { knock: false });
        put(press, ellipse(378, 470, 14, 22), { navy: 1, yellow: 1, pink: 0.6 });
        line(press, Ph.sample([[364, 470], [378, 446], [392, 470], [378, 494]], true, 6), 4, BARK_LT);
        press.restore();
        // branches with twigs
        const BR = [[[340, 180], [180, -60], [60, -250]], [[370, 150], [520, -80], [700, -220]], [[350, 120], [380, -150], [420, -330]], [[330, 200], [120, 60], [-80, 20]], [[395, 250], [620, 150], [880, 110]]];
        for (const pts of BR) {
            line(press, pts, taper(34, 0.05, 0.6), BARK);
            line(press, pts.map(([x, y]) => [x + 4, y - 8]), taper(8, 0.1, 0.6), BARK_LT);
            const e = pts[2], m = pts[1];
            for (const [dx, dy] of [[-50, -60], [60, -50], [20, -90]]) line(press, [LPt(m, e, 0.6), [e[0] + dx, e[1] + dy]], taper(8, 0.05, 0.8), BARK);
        }
        // canopy: clusters (dark underneath, lit at the top right), each rimmed with leaves
        const r = Motion.rng('canopy');
        const cl = [];
        for (let i = 0; i < 95; i++) { const x = -350 + r() * 1500, y = -820 + r() * 900; cl.push([x, Math.min(y, x > 560 ? -40 : 100), 70 + r() * 90, r()]); }
        cl.sort((a, b) => a[1] - b[1]);
        for (const [x, y, rad, k] of cl) {
            if (Math.hypot(x - HANG[0], y - HANG[1]) < 120) continue; // a gap of sky round the apple
            const xs = x + sway * (1 - (y + 800) / 900);
            put(press, circle(xs, y, rad), LEAF[Math.floor(k * 3)]);
            ink(press, circle(xs - rad * 0.1, y + rad * 0.4, rad * 0.78), { 'navy.s': 0.32 });
            put(press, circle(xs + rad * 0.3, y - rad * 0.35, rad * 0.45), LEAF_LT, { knock: false });
            // leaves: pointed ovals with a midrib, round the rim and scattered inside
            for (let j = 0; j < 12; j++) {
                const a = -3 + j * 0.5 + k * 2, rr = j < 8 ? rad : rad * (0.3 + ((j * 0.37 + k) % 0.6)), lx = xs + Math.cos(a) * rr, ly = y + Math.sin(a) * rr, rot = a + 0.4 + Math.sin(t * 2 + j) * 0.08;
                put(press, (g) => { g.beginPath(); g.ellipse(lx, ly, 24, 9, rot, 0, 6.2832); }, j % 3 === 0 ? LEAF_LT : LEAF[(j + Math.floor(k * 3)) % 3]);
                line(press, [[lx - Math.cos(rot) * 18, ly - Math.sin(rot) * 18], [lx + Math.cos(rot) * 18, ly + Math.sin(rot) * 18]], 1.4, { yellow: 1, 'blue.s': 0.3 });
            }
        }
        for (const [x, y] of apples) {
            line(press, [[x + sway * 0.5, y - APPLE_R * 1.4], [x + sway * 0.5, y - APPLE_R * 0.7]], 3, BARK);
            drawApple(press, x + sway * 0.5, y, APPLE_R * 0.9, Math.sin(t + x) * 0.1);
        }
    }
    const LPt = (p, q, k) => [p[0] + (q[0] - p[0]) * k, p[1] + (q[1] - p[1]) * k];
    function grass(press, t, front) {
        const r = Motion.rng(front ? 'grass-front' : 'grass');
        if (!front) {
            put(press, (g) => g.rect(-2e5, G, 4e5, 2e5), GRASS);
            // mown stripes and shade under the tree
            for (let k = 0; k < 6; k++) ink(press, (g) => g.rect(-2000 + k * 900, G, 450, 400), { 'blue.s': 0.12 });
            ink(press, ellipse(380, G + 20, 420, 40), { 'navy.s': 0.35 });
            // windfalls and fallen leaves round the trunk, a few mushrooms at its foot
            for (const [x, y, rr] of [[180, G + 30, 18], [520, G + 44, 16], [860, G + 26, 15], [-60, G + 38, 17]]) drawApple(press, x, y, rr, x * 0.01);
            for (let i = 0; i < 18; i++) { const x = 100 + r() * 700, y = G + 10 + r() * 60, a = r() * 6; put(press, (g) => { g.beginPath(); g.ellipse(x, y, 14, 6, a, 0, 6.2832); }, i % 2 ? { yellow: 1, 'pink.s': 0.45, 'navy.s': 0.2 } : LEAF[2]); }
            for (const [x, h] of [[268, 22], [286, 16], [476, 20]]) {
                line(press, [[x, G + 8], [x, G + 8 - h]], 5, { 'yellow.s': 0.2 });
                put(press, (g) => { g.beginPath(); g.ellipse(x, G + 8 - h, 14, 8, 0, Math.PI, 0); g.closePath(); }, { 'yellow.s': 0.6, 'pink.s': 0.5, 'navy.s': 0.25 });
            }
        }
        // blades in tufts, bending with the wind
        const n = front ? 70 : 220;
        for (let i = 0; i < n; i++) {
            const x = -900 + r() * 3000, y = G + (front ? 70 + r() * 60 : r() * 70), h = (front ? 70 : 24) + r() * (front ? 70 : 26);
            for (let b = 0; b < 3; b++) {
                const lean = (b - 1) * 0.35 + (r() - 0.5) * 0.3 + Math.sin(t * 2 + x * 0.01) * 0.1, hh = h * (0.7 + 0.3 * r());
                line(press, [[x + b * 3, y], [x + b * 3 + Math.sin(lean) * hh * 0.5, y - hh * 0.5], [x + b * 3 + Math.sin(lean) * hh, y - hh]], taper(front ? 7 : 4, 0.05, 0.9), r() < 0.5 ? GRASS_DK : { yellow: 1, 'blue.s': 0.4 });
            }
        }
        if (front) return;
        // daisies, buttercups, clover, dandelion clocks
        for (let i = 0; i < 60; i++) {
            const x = -600 + r() * 2600, y = G + 6 + r() * 60, kind = i % 4;
            line(press, [[x, y + 8], [x, y]], 1.6, GRASS_DK);
            if (kind === 0) { for (let j = 0; j < 8; j++) put(press, ellipse(x + Math.cos(j * 0.785) * 6, y + Math.sin(j * 0.785) * 3, 4, 1.8, j * 0.785), { 'blue.s': 0.04 }); put(press, circle(x, y, 2.6), { yellow: 1 }); }
            else if (kind === 1) { for (let j = 0; j < 5; j++) put(press, circle(x + Math.cos(j * 1.256) * 3.5, y + Math.sin(j * 1.256) * 2, 3), { yellow: 1, 'pink.s': 0.1 }); }
            else if (kind === 2) { for (let j = 0; j < 3; j++) put(press, circle(x + Math.cos(j * 2.09) * 4, y - 3 + Math.sin(j * 2.09) * 3, 3.5), { yellow: 1, 'blue.s': 0.65 }); put(press, circle(x, y - 12, 4), { pink: 0.8, 'yellow.s': 0.2 }); }
            else { put(press, circle(x, y - 14, 8), { 'blue.s': 0.08 }); for (let j = 0; j < 8; j++) line(press, [[x, y - 14], [x + Math.cos(j * 0.785) * 8, y - 14 + Math.sin(j * 0.785) * 8]], 1, { 'navy.s': 0.3 }); line(press, [[x, y], [x, y - 14]], 1.6, GRASS_DK); }
        }
        // a cabbage white butterfly fluttering past the tree
        const bx = 600 + Math.sin(t * 0.9) * 260, by = 620 + Math.sin(t * 2.3) * 60, fl = Math.abs(Math.sin(t * 18));
        for (const sg of [-1, 1]) put(press, (g) => { g.beginPath(); g.ellipse(bx + sg * 8 * fl, by - 4, 9 * fl + 2, 7, sg * 0.3, 0, 6.2832); }, { 'blue.s': 0.06 });
        line(press, [[bx, by - 8], [bx, by + 2]], 2, { navy: 1 });
    }
    function drawApple(press, x, y, r, rot, squash = 1) {
        press.save();
        press.each((g) => { g.translate(x, y); g.rotate(rot); g.scale(1 / squash ** 0.5, squash); });
        put(press, (g) => smooth(g, [[-r, -r * 0.15], [-r * 0.72, -r * 0.82], [-r * 0.2, -r * 0.86], [0, -r * 0.72], [r * 0.2, -r * 0.86], [r * 0.72, -r * 0.82], [r, -r * 0.15], [r * 0.8, r * 0.7], [r * 0.2, r * 0.98], [-r * 0.2, r * 0.98], [-r * 0.8, r * 0.7]]), APPLE);
        put(press, (g) => smooth(g, [[-r * 0.2, r * 0.1], [r * 0.9, -r * 0.1], [r * 0.6, r * 0.8], [0, r * 0.95]]), APPLE_SH, { knock: false });
        // streaks of yellow in the skin, a highlight, the stalk and a leaf
        for (const dx of [-0.5, -0.2, 0.15]) line(press, [[dx * r, -r * 0.6], [dx * r * 1.2, 0], [dx * r, r * 0.6]], taper(r * 0.08), { yellow: 1, 'pink.s': 0.4 });
        press.knockout(ellipse(-r * 0.4, -r * 0.35, r * 0.18, r * 0.12, -0.5));
        line(press, [[0, -r * 0.7], [3, -r * 1.2]], r * 0.1, BARK);
        put(press, (g) => { g.beginPath(); g.ellipse(r * 0.35, -r * 1.1, r * 0.4, r * 0.16, -0.4, 0, 6.2832); }, LEAF[0]);
        press.restore();
    }
    function book(press, hN, hF) {
        const c = [(hN[0] + hF[0]) / 2 + 6, (hN[1] + hF[1]) / 2 - 6];
        put(press, (g) => poly(g, [[c[0] - 44, c[1] + 6], [c[0], c[1] - 10], [c[0] + 46, c[1] + 4], [c[0] + 44, c[1] + 16], [c[0], c[1] + 4], [c[0] - 46, c[1] + 18]]), { 'yellow.s': 0.15, 'pink.s': 0.05 });
        put(press, (g) => poly(g, [[c[0] - 46, c[1] + 18], [c[0], c[1] + 4], [c[0] + 44, c[1] + 16], [c[0] + 46, c[1] + 24], [c[0], c[1] + 12], [c[0] - 48, c[1] + 26]]), { pink: 1, 'navy.s': 0.6 });
        for (let i = 0; i < 4; i++) for (const sg of [-1, 1]) line(press, [[c[0] + sg * 8, c[1] - 2 + i * 4 - (sg < 0 ? 0 : 2)], [c[0] + sg * 38, c[1] + 4 + i * 4]], 1.4, { 'navy.s': 0.6 });
    }
    // little stars circling a stunned head (drawn as flat 5-point stars)
    function stunStars(press, h, t) {
        const k = S(t, T.bonk, T.bonk + 0.1) * (1 - S(t, 2.2, 2.45));
        if (k <= 0) return;
        for (let i = 0; i < 3; i++) {
            const a = t * 7 + i * 2.094, x = h[0] + Math.cos(a) * 70, y = h[1] - 70 + Math.sin(a) * 18, s = 14 * k;
            const pts = [];
            for (let j = 0; j < 10; j++) { const rr = j % 2 ? s * 0.45 : s; pts.push([x + Math.cos(j * 0.628 - 1.57) * rr, y + Math.sin(j * 0.628 - 1.57) * rr]); }
            put(press, (g) => poly(g, pts), { yellow: 1, 'pink.s': 0.2 });
        }
    }

    // the whole near world (shots A and B, and the start of C) in world units
    function nearWorld(press, t, pose, apple, detail) {
        if (detail > 0) backdrop(press, t, detail);
        tree(press, t, [[120, -520], [640, -560], [780, -300], [60, -140], [240, -680], [560, -60]]);
        grass(press, t, false);
        if (t < T.bonk + 0.5) book(press, pose.hN, pose.hF);
        else if (t < 7) put(press, (g) => poly(g, [[560, G + 2], [620, G - 10], [660, G + 4], [600, G + 14]]), { pink: 1, 'navy.s': 0.6 });
        const fig = Fig.newton(press, pose);
        stunStars(press, pose.H, t);
        return fig;
    }

    // precomputed apple flight after the release: screen altitude above the limb a(t) and
    // angle θ(t) round the globe's centre (clockwise from straight up), integrated at 1 ms
    function flight() {
        const dt = 0.001, n = Math.ceil((7.1 - T.release) / dt), th = new Float64Array(n);
        // it leaves the hand 220 units ahead of the feet (float64: on a globe 2.65e9 units
        // wide an angle of 1e-7 rad is still hundreds of pixels)
        let a = -Math.PI / 2 + 220 / RW;
        for (let i = 0; i < n; i++) {
            const t = T.release + i * dt, z = zoomAt(t), Rs = RW * z, as = altScreen(t);
            const v = L(80, 900, IO(S(t, T.release, 5.8)));
            a += (v * dt) / (Rs + as);
            th[i] = a;
        }
        return (t) => th[Math.min(n - 1, Math.max(0, Math.round((t - T.release) / dt)))];
    }
    // the apple's height above the ground, on screen: up fast, then settling to an orbit
    function altScreen(t) {
        // the apple climbs to near the top of the frame and stays there while the world falls
        // away under it (the anchor goes from the bottom to y 250), ending 110 above the limb
        const anchorY = L((FEET[1] - 330) * Z0 + 450, 250, IO(S(t, T.pull[0], T.pull[1])));
        return anchorY - L(74, 140, Ease.out(S(t, T.release, 5.2)));
    }

    Seg.newtonApple = {
        T,
        init() { return { theta: flight() }; },
        draw(press, tq, st) {
            const t = tq;
            const pose = Fig.pose(KEYS, t);
            // where the near hand is, for carrying the apple (a dry run of the rig, not drawn)
            const handGuess = pose.hN;
            const ap = appleWorld(t, handGuess);
            const cam = camAB(Math.min(t, T.pull[0]), ap.p);
            const z = t < T.pull[0] ? cam.z : zoomAt(t);
            const anchor = t < T.pull[0] ? [(FEET[0] - cam.c[0]) * cam.z + 800, (FEET[1] - cam.c[1]) * cam.z + 450] : anchorAt(t, cam);
            const dark = S(Math.log10(z), Math.log10(3e-4), Math.log10(3e-6));
            sky(press, t, dark);
            if (dark > 0.4) Sets.stars(press, 0, 1600, S(dark, 0.4, 1), t);
            // world → screen: the anchor (Newton's feet) is fixed at `anchor`, scale z
            const toS = (p) => [anchor[0] + (p[0] - FEET[0]) * z, anchor[1] + (p[1] - FEET[1]) * z];
            if (z > 0.02) {
                const sp = toS([1330, -140]);
                sun(press, sp[0], sp[1], t);
                const mp = toS([1180, 60]);
                moon(press, mp[0], mp[1]);
                for (const [x, y, s, v] of [[200, -900, 1.2, 12], [900, -780, 0.9, 8], [1700, -600, 1.1, 10], [-400, -500, 1, 9], [1150, 160, 1.3, 14], [1520, 330, 0.9, 10], [1000, 420, 0.7, 7]]) {
                    const cp = toS([x + t * v, y]);
                    cloud(press, cp[0], cp[1], s * z);
                }
            }
            // the globe and the land's silhouette: when the curve is visible
            const Rs = RW * z, C = [anchor[0], anchor[1] + Rs];
            if (Rs < 4e5) {
                const gf = 1;
                Globe.draw(press, C, Rs, { f: gf, lon0: -1, lat0: -38, cloudLon: t * 4 });
                // atmosphere: a pale ring a little outside the limb
                const atm = Math.max(3, 4e7 * z);
                press.knockout((g) => { g.beginPath(); g.arc(C[0], C[1], Rs + atm, 0, 6.2832); g.arc(C[0], C[1], Rs, 0, 6.2832, true); g.fill('evenodd'); });
                ink(press, (g) => { g.beginPath(); g.arc(C[0], C[1], Rs + atm, 0, 6.2832); g.arc(C[0], C[1], Rs, 0, 6.2832, true); }, { 'blue.s': 0.35 * (1 - dark * 0.3) });
            }
            // the ground line with its terrain (drawn round the limb, in screen space)
            if (z < 0.6) {
                const pts = [], n = 260;
                const span = Math.min(Math.PI, 2400 / Math.max(Rs, 1)); // visible half-angle
                for (let i = 0; i <= n; i++) {
                    const phi = -span + (2 * span * i) / n, s = phi * RW, h = terrain(s) * z;
                    // relative to the anchor, never through the far centre (a canvas path loses precision
                // with coordinates of 1e7 and silently drops the fill)
                const sh = Math.sin(phi / 2);
                pts.push([C[0] + Math.sin(phi) * (Rs + h), anchor[1] + 2 * Rs * sh * sh - h * Math.cos(phi)]);
                }
                const inner = [[C[0] + Math.sin(span) * Rs * 0.9, C[1] - Math.cos(span) * Rs * 0.9], [C[0], C[1] - Rs * 0.8], [C[0] - Math.sin(span) * Rs * 0.9, C[1] - Math.cos(span) * Rs * 0.9]];
                const band = (g) => { g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.lineTo(pts[n][0], 3000); g.lineTo(pts[0][0], 3000); g.closePath(); };
                const bf = S(Math.log(Rs), Math.log(3e4), Math.log(2e5)); // the band gives way to the globe
                if (bf > 0) put(press, band, bf < 1 ? Object.fromEntries(Object.entries(GRASS).map(([k, v]) => [k.endsWith('.s') ? k : k + '.s', v * bf])) : GRASS, { knock: bf >= 1 });
                // the sea beyond the coast (east of Newton), a blue band along the limb
                const seaPts = pts.filter((q, i) => (-span + (2 * span * i) / n) * RW > 1.1e8);
                if (seaPts.length > 1 && Rs > 3000 && Rs < 2e5) line(press, seaPts, Math.max(3, 3e5 * z), { blue: 0.9, 'navy.s': 0.2 });
                line(press, pts, Rs > 3000 ? 4 : 2.5, { yellow: 1, 'blue.s': 0.8, 'navy.s': 0.4 });
                // trees and copses on the ground, and villages: visible while they are a few px
                const onGround = (s2, lift) => { const phi = s2 / RW, hh = (terrain(s2) + lift) * z, sh = Math.sin(phi / 2); return [C[0] + Math.sin(phi) * (Rs + hh), anchor[1] + 2 * Rs * sh * sh - hh * Math.cos(phi)]; };
                for (const [step, size, spec, seed] of [[2600, 1700, { yellow: 1, 'blue.s': 0.75, 'navy.s': 0.4 }, 'trees'], [4.2e4, 9000, { yellow: 1, 'blue.s': 0.75, 'navy.s': 0.4 }, 'copses']]) {
                    const px = size * z;
                    if (px < 2 || px > 90) continue;
                    const s0 = Math.floor((-span * RW) / step), s1 = Math.ceil((span * RW) / step), rr = Motion.rng(seed);
                    for (let k = Math.max(s0, -400); k <= Math.min(s1, 400); k++) {
                        if (Math.abs(k * step) < 3000) continue;
                        const j = Math.sin(k * 12.9898) * 43758.5453, fr = j - Math.floor(j);
                        const q = onGround(k * step + fr * step * 0.6, size * 0.45);
                        put(press, circle(q[0], q[1], px * (0.4 + fr * 0.3)), spec);
                    }
                }
                // a layer of cumulus clouds 1.2e6 units up (≈ 3 km): the apple goes through it
                const cpx = 2.6e6 * z;
                if (cpx > 12 && cpx < 1400) {
                    for (let k = -30; k <= 30; k++) {
                        const s2 = k * 5.5e6 + 1.3e6, phi = s2 / RW;
                        if (Math.abs(phi) > span) continue;
                        const q = onGround(s2, 1.2e6 - terrain(s2));
                        cloud(press, q[0], q[1], cpx / 190, { 'blue.s': 0.06 });
                    }
                }
            }
            // the near world, fading out as it gets small
            let fig = null;
            if (z > 0.004) {
                Ph.cam(press, anchor[0], anchor[1], z, () => {
                    press.each((g) => g.translate(-FEET[0], -FEET[1]));
                    fig = nearWorld(press, t, pose, ap.p, S(z, 0.35, 0.8));
                    // the apple (before the throw), in the world
                    if (t < T.release) {
                        const a = t >= T.grab ? [fig.wrN[0] + 18, fig.wrN[1] - 12] : ap.p;
                        drawApple(press, a[0], a[1], APPLE_R, ap.rot, ap.squash ?? 1);
                    }
                    grass(press, t, true);
                });
            }
            // the apple after the throw: screen space, with its amber trail
            if (t >= T.release) {
                const th = st.theta, as = altScreen(t), rS = Rs + as;
                // a trail point keeps its height in world units: seen now, at the current zoom
                const pos = (tt) => { const a2 = th(tt), r2 = Rs + (altScreen(tt) / zoomAt(tt)) * z; return [C[0] + Math.cos(a2) * r2, C[1] + Math.sin(a2) * r2]; };
                const trail = [];
                for (let tt = Math.max(T.release, t - 1.1); tt <= t + 1e-6; tt += 0.02) trail.push(pos(tt));
                if (trail.length > 2) line(press, trail, taper(8, 0.9, 0.02), AMBER);
                const p = [C[0] + Math.cos(th(t)) * rS, C[1] + Math.sin(th(t)) * rS];
                const r = L(APPLE_R * Math.max(z, 0.55), 17, S(t, T.release, 5.4));
                drawApple(press, p[0], p[1], r, t * 6);
            }
        },
    };
})();
