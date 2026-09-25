// Segment «Curie and the radium» of physics-history (script v2), after Faraday's spark. The
// spark's blue-green light fills the frame; the camera pulls back out of it and the light is
// the glow of a small glass tube of radium salt (it really glowed, faintly, blue-green in the
// dark). Marie Curie holds it up at eye level in the dark shed on rue Lhomond, her face lit by
// it; the camera drifts round her (the shed's layers slide past at their depths). Particles
// leave the tube towards us in slow motion, and one of them stretches into a ray of light
// across the frame: the ray young Einstein runs beside in the next scene.
//
//   Seg.curieRadium.draw(press, tq, st)   local time 0–T.end (on twos)
//
// Join in: the frame filled with Faraday's rings of blue-green light (Seg.faradayCoil's end).
// Join out: one amber ray across the whole width at y = 450, 10 wide, on the dark shed.
var Seg = globalThis.Seg ?? (globalThis.Seg = {});
(() => {
    const { put, ink, line, smooth, poly, taper, circle, ellipse } = Ph;
    const L = Ease.lerp, S = Ease.seg, IO = Ease.inOut;
    const P = () => Seg.curie.parts;

    // 0–2.6 out of the light to the medium close-up; 2.6–6.2 the camera drifts round her; she
    // turns the tube a little, a blink; 3.4–6.4 particles fly at us; 6.2–7.4 one of them becomes
    // the ray, which spans the frame by 7.2 and holds
    const T = { pull: [0, 2.6], drift: [2.0, 6.6], parts: [3.4, 6.0], ray: [6.2, 7.2], end: 7.6 };

    // ── colours ──────────────────────────────────────────────────────────────────────────
    const DARK = { blue: 0.9, 'navy.s': 0.92, 'pink.s': 0.2 };
    const PLANK = { navy: 1, 'blue.s': 0.35, 'pink.s': 0.3 };
    const PLANK_LT = { navy: 0.85, 'blue.s': 0.5, 'yellow.s': 0.2 };
    const GLOW = { 'blue.s': 0.55, 'yellow.s': 0.35 };            // blue-green
    const GLOW_HOT = { 'blue.s': 0.25, 'yellow.s': 0.55 };
    const GLASS = { 'blue.s': 0.2, 'yellow.s': 0.12 };
    const SKIN = Cast.SKIN, SKIN_SH = Cast.SKIN_SH;
    const AMBER = { yellow: 1, 'pink.s': 0.55 };

    // ── the world (screen units at the medium close-up, Z = 1) ────────────────────────────
    const HD = [520, 410], NS2 = 2.25;              // her head, and its scale (cast units)
    const TB = [930, 300], TL = 190, TR = 15;       // the tube: centre, length, radius
    const EYE = [HD[0] + 37 * NS2, HD[1] - 13 * NS2];

    // the camera: from inside the glow (the tube's centre fills the frame) out to Z = 1; then
    // a slow drift (the layers slide by their depth, as if the camera went round her)
    function cam(t) {
        const u = S(t, T.pull[0], T.pull[1]), k = IO(u);
        const Z = Math.exp(L(Math.log(14), 0, 1 - Math.pow(1 - u, 2.2)));
        const F = [L(TB[0], 800, k), L(TB[1], 450, k)];              // the point held at S
        const Sx = [800, 450];
        const d = IO(S(t, T.drift[0], T.drift[1]));
        return { Z, F: [L(TB[0], F[0], k), L(TB[1], F[1], k)], S: Sx, drift: d };
    }
    // a layer at depth factor p (1 = her plane; < 1 farther, > 1 nearer): scale and slide
    function layer(press, c, p, fn) {
        const z = 1 + (c.Z - 1) * p, dx = (c.drift - 0.5) * -140 * (p - 1) * 2 + (c.drift - 0.5) * -60 * p;
        press.save();
        press.each((g) => { g.translate(c.S[0] + dx, c.S[1]); g.scale(z, z); g.translate(-c.F[0], -c.F[1]); });
        fn();
        press.restore();
    }

    // ── the shed at night: a plank wall, a window with the night, a shelf of jars, a sack ──
    function shed(press, t) {
        put(press, (g) => g.rect(-800, -600, 3200, 2200), DARK);
        for (let x = -800; x < 2400; x += 92) {
            put(press, (g) => g.rect(x, -600, 88, 2200), PLANK);
            line(press, [[x + 88, -600], [x + 88, 1600]], 4, { navy: 1, 'pink.s': 0.5 });
            for (let k = 0; k < 5; k++) { const y = -500 + ((x * 7 + k * 331) % 1900); line(press, [[x + 20 + k * 10, y], [x + 26 + k * 10, y + 90]], 2, PLANK_LT, { knock: false }); }
        }
        // the window, high on the left: the night, a few stars, the frame
        put(press, (g) => g.rect(60, 40, 300, 360), { blue: 1, 'navy.s': 0.6 });
        for (const [x, y] of [[110, 90], [240, 140], [300, 70], [180, 260], [320, 300]]) put(press, circle(x, y, 3), { 'yellow.s': 0.4 });
        for (const x of [60, 205, 350]) put(press, (g) => g.rect(x, 40, 12, 360), PLANK);
        for (const y of [40, 215, 392]) put(press, (g) => g.rect(60, y, 302, 12), PLANK);
        // a shelf on the right with jars and flasks, catching the glow at their rims
        put(press, (g) => g.rect(1080, 250, 700, 18), PLANK_LT);
        for (const [x, w, h, c] of [[1110, 60, 90, { 'blue.s': 0.3, navy: 0.6 }], [1200, 44, 130, { 'yellow.s': 0.3, navy: 0.7 }], [1270, 70, 70, { 'blue.s': 0.4, navy: 0.5 }], [1370, 50, 110, { 'pink.s': 0.3, navy: 0.6 }], [1450, 80, 80, { 'blue.s': 0.35, navy: 0.55 }]]) {
            put(press, (g) => g.rect(x, 250 - h, w, h), c);
            press.knockout((g) => { g.globalAlpha = 0.35; g.fillRect(x + 6, 256 - h, 5, h * 0.6); g.globalAlpha = 1; });
        }
        // sacks of pitchblende on the floor, lower right
        put(press, (g) => smooth(g, [[1150, 900], [1170, 700], [1260, 660], [1360, 690], [1390, 900]]), { navy: 1, 'yellow.s': 0.4, 'pink.s': 0.3 });
        put(press, (g) => smooth(g, [[1340, 900], [1370, 740], [1460, 710], [1550, 740], [1580, 900]]), { navy: 1, 'yellow.s': 0.5, 'pink.s': 0.2 });
    }

    // ── her right hand holding the tube up, the back of the hand to us (fist round the tube's
    // lower half, the tube standing out of the top between the thumb and the index; a right
    // hand seen from its back with the fingers pointing forward has its thumb on top). Local
    // units: the tube's axis at x = 0, y down; screen px at Z = 1.
    function hand(press, o) {
        const G = [TB[0], TB[1] + TL * 0.36], K = 0.53, ca = Math.cos(-0.35), sa = Math.sin(-0.35);
        const X = (x, y) => [G[0] + (x * ca - y * sa) * K, G[1] + (x * sa + y * ca) * K];
        const EDGE = { 'pink.s': 0.6, 'navy.s': 0.45 };
        // the fingers curling round the tube, beyond the knuckles (index at top)
        const F = [[-44, 36], [-8, 38], [30, 36], [64, 30]];
        for (const [y, w] of F) {
            const Q = [X(22, y), X(48, y + 2), X(58, y + 10)];
            line(press, Q, w * K, SKIN); put(press, circle(...Q[2], w * K / 2), SKIN);
        }
        // the back of the hand, from the wrist to the knuckles' row
        const BACK = [X(-125, -52), X(-50, -64), X(26, -62), X(34, 0), X(30, 76), X(-50, 80), X(-125, 66)]; // the back of the hand, short (a woman's hand)
        put(press, (g) => smooth(g, BACK), SKIN);
        press.save(); press.clip((g) => smooth(g, BACK));
        { const a = X(0, 20), b = X(0, 80); ink(press, (g) => g.rect(TB[0] - 260, TB[1], 360, 360), { 'pink.s': (g) => Riso.ramp(g, a[0], a[1], b[0], b[1], 0, 0.26) }); }
        for (const [y] of F) line(press, [X(-100, y * 0.3), X(10, y)], taper(4, 0.3, 0.3), { 'pink.s': 0.12 }, { knock: false });
        press.restore();
        // the knuckles: light bumps along the row, a crease beside each; gaps between fingers
        for (const [y, w] of F) { const k = X(24, y); press.knockout(ellipse(k[0], k[1], 7 * K, w * 0.3 * K)); line(press, [X(40, y - w * 0.3), X(42, y), X(40, y + w * 0.3)], taper(2), EDGE, { knock: false }); }
        for (let i = 0; i < 3; i++) { const y = (F[i][0] + F[i + 1][0]) / 2; line(press, [X(36, y), X(62, y + 4)], taper(2.4, 0.2, 0.3), EDGE, { knock: false }); }
        // the thumb along the top, from the wrist side, its tip over the index by the tube
        const TH = [X(-90, -58), X(-30, -78), X(14, -74)];
        line(press, TH, 30 * K, SKIN); put(press, circle(...TH[2], 15 * K), SKIN);
        put(press, ellipse(TH[2][0] + 1, TH[2][1] - 3, 7, 5, -0.5), { 'pink.s': 0.2, 'yellow.s': 0.05 });
        line(press, [X(-40, -64), X(-30, -90)], taper(2.2), EDGE, { knock: false });
        // the glow on the hand: the side towards the tube lit blue-green
        ink(press, (g) => smooth(g, [X(-20, -90), X(40, -90), X(70, 90), X(-20, 90)]), { 'blue.s': (g) => Riso.ramp(g, TB[0] + 60, 0, TB[0] - 60, 0, 0.3, 0) });
        // the white cuff at the wrist and the black sleeve going down to her elbow
        return X(-125, 7);
    }

    // the tube: glass, a cork, the salt glowing at its bottom; its light round it
    function tube(press, t, bright) {
        const x0 = TB[0] - TR, y0 = TB[1] - TL / 2;
        const R = 160 + 30 * Math.sin(t * 2.3);
        press.knockout((g) => { g.fillStyle = Riso.radial(g, TB[0], TB[1] + 20, 10, R * 2.2, 0.55 * bright, 0); g.beginPath(); g.arc(TB[0], TB[1] + 20, R * 2.2, 0, 6.2832); g.fill(); });
        ink(press, circle(TB[0], TB[1] + 20, R * 2.2), { 'blue.s': (g) => Riso.radial(g, TB[0], TB[1] + 20, 10, R * 2.2, 0.45 * bright, 0), 'yellow.s': (g) => Riso.radial(g, TB[0], TB[1] + 20, 10, R, 0.3 * bright, 0) });
        put(press, (g) => { g.beginPath(); g.roundRect(x0, y0, TR * 2, TL, [2, 2, TR, TR]); }, GLASS);
        put(press, (g) => { g.beginPath(); g.roundRect(x0 + 2, y0 + TL * 0.2, TR * 2 - 4, TL * 0.8 - 2, [0, 0, TR, TR]); }, GLOW);
        put(press, (g) => { g.beginPath(); g.roundRect(x0 + 3, y0 + TL * 0.45, TR * 2 - 6, TL * 0.55 - 3, [0, 0, TR, TR]); }, GLOW_HOT);
        press.knockout((g) => { g.beginPath(); g.roundRect(x0 + 5, y0 + TL * 0.25, 7, TL * 0.35, 3); g.fill(); });
        press.knockout((g) => { g.globalAlpha = 0.6; g.fillRect(x0 + 5, y0 + 8, 4, TL * 0.35); g.globalAlpha = 1; });
        put(press, (g) => { g.beginPath(); g.roundRect(x0 - 2, y0 - 18, TR * 2 + 4, 22, 4); }, { 'yellow.s': 0.6, 'pink.s': 0.45, 'navy.s': 0.4 });
    }

    // Marie: the bust in profile, her face lit blue-green from the tube, the arm raised
    function marie(press, t, elbow, wrist) {
        const blink = Math.abs(t - 4.3) < 0.08;
        // the raised arm's sleeve behind the hand, from the shoulder to the wrist
        const sh = [HD[0] + 30 * NS2, HD[1] + 150 * NS2];
        Ph.cam(press, HD[0], HD[1], NS2, () => P().marie(press, { t, bust: true, look: [1, -0.15], blink }));
        line(press, [sh, elbow, wrist], (u) => L(92, 64, u), P().DRESS);
        line(press, [[sh[0] + 20, sh[1] - 30], [elbow[0] + 20, elbow[1] - 20], [wrist[0], wrist[1] - 26]], taper(10, 0.2, 0.3), P().DRESS_LIT);
        put(press, (g) => { g.beginPath(); g.ellipse(wrist[0] + 6, wrist[1], 26, 50, 0.2, 0, 6.2832); }, Cast.LINEN);
        // the tube's light on her face and front: a blue-green wash, strongest at the right
        const fx = HD[0] + 40 * NS2;
        ink(press, (g) => g.rect(HD[0] - 200, HD[1] - 300, 500, 700), { 'blue.s': (g) => Riso.ramp(g, fx + 60, 0, fx - 140, 0, 0.4, 0) });
        ink(press, (g) => g.rect(HD[0] - 300, HD[1] - 300, 300, 800), { 'navy.s': (g) => Riso.ramp(g, HD[0] - 300, 0, HD[0] - 20, 0, 0.5, 0) });
    }

    // particles leaving the tube towards us: each a point that grows as it comes, with a short
    // streak behind, the four inks' light (knocked out, then tinted)
    function particles(press, t) {
        const r = Motion.rng('radium-parts');
        for (let i = 0; i < 26; i++) {
            const t0 = L(T.parts[0], T.parts[1] - 1.2, r()), a = r() * 6.2832, sp = 0.4 + r() * 0.6;
            const u = (t - t0) / 1.6;
            if (u <= 0 || u > 1) continue;
            const z = 1 / (1 - 0.92 * u), p = [TB[0] + Math.cos(a) * 260 * sp * u * z * 0.4, TB[1] + 30 + Math.sin(a) * 180 * sp * u * z * 0.4];
            const rr = 3 * z;
            const q = [TB[0] + (p[0] - TB[0]) * 0.9, TB[1] + 30 + (p[1] - TB[1] - 30) * 0.9];
            press.knockout((g) => { g.globalAlpha = 0.35; g.lineCap = 'round'; g.lineWidth = rr * 0.9; g.beginPath(); g.moveTo(q[0], q[1]); g.lineTo(p[0], p[1]); g.stroke(); g.globalAlpha = 1; });
            put(press, circle(p[0], p[1], rr), i % 3 ? GLOW_HOT : { yellow: 0.6, 'pink.s': 0.2 });
            press.knockout(circle(p[0] - rr * 0.3, p[1] - rr * 0.3, rr * 0.35));
        }
    }
    // the chosen particle: out of the tube to the frame's centre, then stretched into the ray
    function ray(press, t) {
        const u = S(t, T.ray[0] - 0.5, T.ray[0]), k = IO(S(t, T.ray[0], T.ray[1]));
        if (u <= 0) return;
        const p = [L(TB[0], 800, IO(u)), L(TB[1] + 30, 450, IO(u))];
        const half = L(0, 900, k), w = L(12, 10, k);
        press.knockout((g) => { g.fillStyle = Riso.radial(g, p[0], p[1], 2, 140, 0.8, 0); g.beginPath(); g.arc(p[0], p[1], 140, 0, 6.2832); g.fill(); });
        if (half > 2) {
            press.knockout((g) => { g.beginPath(); g.rect(p[0] - half, 450 - w * 2, half * 2, w * 4); g.globalAlpha = 0.5; g.fill(); g.globalAlpha = 1; });
            put(press, (g) => g.rect(p[0] - half, 450 - w / 2, half * 2, w), AMBER);
        }
        put(press, circle(p[0], p[1], L(7, 9, k)), { yellow: 1, 'pink.s': 0.3 });
    }

    Seg.curieRadium = {
        T,
        init() { return {}; },
        draw(press, tq) {
            const t = tq, c = cam(t);
            layer(press, c, 0.7, () => shed(press, t));
            layer(press, c, 1, () => {
                const wr = [TB[0] - 125 * 0.53 * Math.cos(-0.35) + 7 * 0.53 * Math.sin(-0.35), TB[1] + TL * 0.36 - 125 * 0.53 * Math.sin(-0.35) + 7 * 0.53 * Math.cos(-0.35)];
                marie(press, t, [wr[0] - 60, wr[1] + 330], wr);
                tube(press, t, 1);
                hand(press, { t });
            });
            // the ray's moment: the shed goes dark round it (inks only darken: a veil of the
            // night's navy thickening over everything but the ray)
            const dk = IO(S(t, T.ray[0] - 0.35, T.ray[0] + 0.3));
            if (dk > 0) ink(press, (g) => g.rect(0, 0, 1600, 900), { navy: 0.92 * dk, 'blue.s': 0.5 * dk });
            // the frame full of light at the start (the join with Faraday's spark): rings of
            // blue-green that shrink back into the tube's glow as the camera pulls out
            const f = 1 - S(t, 0, 1.2);
            if (f > 0) {
                const RING = [{ 'blue.s': 0.75, 'navy.s': 0.2 }, { 'blue.s': 0.6, 'yellow.s': 0.25 }, { 'blue.s': 0.5, 'yellow.s': 0.45 }, { 'blue.s': 0.4, yellow: 0.55 }, { 'blue.s': 0.3, yellow: 0.75 }];
                // centred on the tube's glow wherever the camera has it
                const zz = c.Z, q = [c.S[0] + (TB[0] - c.F[0]) * zz, c.S[1] + (TB[1] - 20 - c.F[1]) * zz];
                RING.forEach((spec, i) => { const r = Math.exp(L(Math.log(8), Math.log(2600), Math.min(1, f * 1.15 - i * 0.07))); if (f * 1.15 - i * 0.07 > 0) put(press, circle(q[0], q[1], r * (1 - i * 0.16)), spec); });
            }
            particles(press, t);
            ray(press, t);
        },
    };
})();
