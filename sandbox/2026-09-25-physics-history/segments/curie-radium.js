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
    const T = { pull: [0, 2.6], drift: [2.0, 6.6], parts: [2.6, 6.0], ray: [6.2, 7.2], end: 7.6 };

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
        const Z = Math.exp(L(Math.log(7), 0, 1 - Math.pow(1 - u, 2.2)));
        const F = [L(TB[0], 800, k), L(TB[1], 450, k)];              // the point held at S
        const Sx = [800, 450];
        const d = IO(S(t, T.drift[0], T.drift[1]));
        return { Z, F: [L(TB[0], F[0], k), L(TB[1], F[1], k)], S: Sx, drift: d };
    }
    // a layer at depth factor p (1 = her plane; < 1 farther, > 1 nearer): scale and slide
    function layer(press, c, p, fn) {
        // (a drift wide enough that the depths visibly slide past each other)
        const z = 1 + (c.Z - 1) * p, dx = (c.drift - 0.5) * -380 * (p - 1) * 2 + (c.drift - 0.5) * -150 * p;
        press.save();
        press.each((g) => { g.translate(c.S[0] + dx + (c.px ?? 0) * Math.min(1, p), c.S[1] + (c.py ?? 0) * Math.min(1, p)); g.scale(z, z); g.translate(-c.F[0], -c.F[1]); });
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
        // her glowing samples on the shelf: small tubes in a rack, each with a faint blue-green
        // glow that breathes (she kept radium by her bed as a night light)
        put(press, (g) => g.rect(1560, 226, 170, 24), PLANK_LT);
        for (let i = 0; i < 6; i++) {
            const x = 1580 + i * 26, gl = 0.35 + 0.15 * Math.sin(t * 2.2 + i * 1.7);
            press.knockout((g) => { g.fillStyle = Riso.radial(g, x, 196, 2, 40, gl, 0); g.beginPath(); g.arc(x, 196, 40, 0, 6.2832); g.fill(); });
            put(press, (g) => { g.beginPath(); g.roundRect(x - 6, 160, 12, 64, [2, 2, 6, 6]); }, { 'blue.s': 0.2, 'yellow.s': 0.15 });
            put(press, (g) => { g.beginPath(); g.roundRect(x - 4, 196, 8, 26, [0, 0, 5, 5]); }, GLOW_HOT);
        }
        // a notebook open on a crate, lower left, catching the glow: her columns of figures
        put(press, (g) => g.rect(120, 700, 320, 260), { navy: 1, 'yellow.s': 0.45, 'pink.s': 0.35 });
        put(press, (g) => poly(g, [[140, 690], [280, 676], [290, 700], [150, 716]]), { 'yellow.s': 0.15, 'blue.s': 0.12 });
        put(press, (g) => poly(g, [[282, 676], [420, 688], [410, 714], [292, 700]]), { 'yellow.s': 0.12, 'blue.s': 0.15 });
        for (let k = 0; k < 4; k++) { line(press, [[160, 688 - k * 3 + 5], [270, 678 - k * 3 + 5]].map(([x, y]) => [x, y + k * 5]), 1.6, { navy: 0.7 }); line(press, [[300, 684 + k * 5], [400, 694 + k * 5]], 1.6, { navy: 0.7 }); }
        // dust in the air, drifting through the glow
        { const rd = Motion.rng('shed-dust'); for (let i = 0; i < 30; i++) { const x = 500 + rd() * 900 + Math.sin(t * 0.7 + i) * 20, y = ((rd() * 900 + t * (8 + rd() * 14)) % 900); press.knockout((g) => { g.globalAlpha = 0.5; g.beginPath(); g.arc(x, y, 1.6 + rd() * 1.8, 0, 6.2832); g.fill(); g.globalAlpha = 1; }); } }
        // sacks of pitchblende on the floor, lower right
        put(press, (g) => smooth(g, [[1150, 900], [1170, 700], [1260, 660], [1360, 690], [1390, 900]]), { navy: 1, 'yellow.s': 0.4, 'pink.s': 0.3 });
        put(press, (g) => smooth(g, [[1340, 900], [1370, 740], [1460, 710], [1550, 740], [1580, 900]]), { navy: 1, 'yellow.s': 0.5, 'pink.s': 0.2 });
        // the film's cat on the sacks, lost in the dark: only its silhouette against the plank
        // wall's glow and its eyes, lit green by the radium, turned to the tube; it blinks
        const cx = 1440, cy = 712, bl = Math.abs(t - 5.1) < 0.06;
        // (a rim of the radium's blue-green light on its ears and back, so it reads as a cat)
        const CATB = [[cx - 60, cy], [cx - 58, cy - 50], [cx - 30, cy - 80], [cx + 10, cy - 84], [cx + 34, cy - 60], [cx + 40, cy]];
        put(press, (g) => smooth(g, CATB.map(([x, y]) => [x - 4, y - 4])), GLOW_HOT);
        put(press, (g) => poly(g, [[cx - 26, cy - 76], [cx - 24, cy - 104], [cx - 10, cy - 82]]), GLOW_HOT);
        put(press, (g) => poly(g, [[cx - 2, cy - 84], [cx + 8, cy - 108], [cx + 18, cy - 78]]), GLOW_HOT);
        put(press, (g) => smooth(g, CATB), { navy: 1, 'yellow.s': 0.6, 'pink.s': 0.3 });
        // its tail over the sack with the white tip, a white paw
        line(press, Ph.sample([[cx + 36, cy - 6], [cx + 76, cy + 4], [cx + 96, cy - 24], [cx + 90, cy - 50]], false, 6), taper(12, 0.1, 0.5), { navy: 1, 'yellow.s': 0.6, 'pink.s': 0.3 });
        line(press, [[cx + 96, cy - 30], [cx + 90, cy - 50]], taper(9, 0.2, 0.6), { 'blue.s': 0.12, 'yellow.s': 0.1 });
        put(press, ellipse(cx - 30, cy - 2, 12, 6), { 'blue.s': 0.12, 'yellow.s': 0.1 });
        put(press, (g) => poly(g, [[cx - 22, cy - 74], [cx - 20, cy - 100], [cx - 6, cy - 80]]), { navy: 1, 'yellow.s': 0.6, 'pink.s': 0.3 });
        put(press, (g) => poly(g, [[cx + 2, cy - 82], [cx + 12, cy - 104], [cx + 22, cy - 76]]), { navy: 1, 'yellow.s': 0.6, 'pink.s': 0.3 });
        for (const ex of [-18, 8]) {
            const x = cx + ex, y = cy - 62;
            if (bl) { line(press, [[x - 7, y], [x + 7, y]], 2, GLOW_HOT); continue; }
            press.knockout((g) => { g.fillStyle = Riso.radial(g, x, y, 1, 22, 0.5, 0); g.beginPath(); g.arc(x, y, 22, 0, 6.2832); g.fill(); });
            put(press, ellipse(x, y, 7, 5), GLOW_HOT);
            put(press, ellipse(x - 1.5, y, 1.6, 4.4), { navy: 1 });
        }
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
        const sh = [HD[0] + 36 * NS2, HD[1] + 150 * NS2];
        Ph.cam(press, HD[0], HD[1], NS2, () => P().marie(press, { t, bust: true, slim: 0.72, look: [1, -0.15], blink }));
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
    // the ray: born at the tube's mouth, it shoots out to the right (in her plane's units,
    // drawn inside its layer, so it stays on the tube whatever the camera does); the camera
    // swings after its head, dropping it to the frame's middle, and the tail runs back off the
    // left edge once the shed is dark: the full-width ray Einstein's scene opens on
    const TIP = [TB[0], TB[1] - TL / 2 - 4];
    const headX = (t) => TIP[0] + 3600 * Math.pow(S(t, T.ray[0], T.end + 0.4), 1.6);
    const tailX = (t) => TIP[0] - 3000 * IO(S(t, T.ray[1] - 0.3, T.end));
    function ray(press, t, z) {
        if (t < T.ray[0]) return;
        const x1 = headX(t), x0 = tailX(t), y = TIP[1], w = 10 / z;
        press.knockout((g) => { g.fillStyle = Riso.radial(g, TIP[0], y, 2, 120 / z, 0.8 * (1 - S(t, T.ray[0], T.ray[0] + 0.5)), 0); g.beginPath(); g.arc(TIP[0], y, 120 / z, 0, 6.2832); g.fill(); });
        press.knockout((g) => { g.beginPath(); g.rect(x0, y - w * 2, x1 - x0, w * 4); g.globalAlpha = 0.5; g.fill(); g.globalAlpha = 1; });
        put(press, (g) => g.rect(x0, y - w / 2, x1 - x0, w), AMBER);
        put(press, circle(x1, y, 9 / z), { yellow: 1, 'pink.s': 0.3 });
    }

    // the spark's (the radium's) light as a glow, not a target: paper knocked out through a soft
    // radial falloff, a warm yellow core, a blue-green edge; R its radius on screen
    function lightGlow(press, q, R, performanceT = 0) {
        const R2 = R * 1.6;
        press.knockout((g) => { g.fillStyle = Riso.radial(g, q[0], q[1], R * 0.15, R2, 1, 0); g.beginPath(); g.arc(q[0], q[1], R2, 0, 6.2832); g.fill(); });
        ink(press, circle(q[0], q[1], R2), { 'yellow.s': (g) => Riso.radial(g, q[0], q[1], 0, R, 0.85, 0), 'blue.s': (g) => Riso.radial(g, q[0], q[1], R * 0.6, R2, 0.45, 0) });
        // inside the light it keeps beating: rings of brighter paper running out from its heart
        // and streaks of light rush past us, out from its heart (we are flying through it)
        if (R > 900) { const rd = Motion.rng('rush'); for (let i = 0; i < 46; i++) { const a = rd() * 6.2832, sp = 0.6 + rd(), ph = (performanceT * sp * 1.4 + rd()) % 1, d0 = 40 + ph * ph * 1300, d1 = d0 * (1.3 + 0.5 * ph); const P2 = [[q[0] + Math.cos(a) * d0, q[1] + Math.sin(a) * d0], [q[0] + Math.cos(a) * d1, q[1] + Math.sin(a) * d1]], w = 8 + 22 * ph; if (i % 3) { press.knockout((g) => { poly(g, Ph.outline(P2, taper(w, 0.2, 0.3))); g.globalAlpha = 0.9; g.fill(); g.globalAlpha = 1; }); } else line(press, P2, taper(w, 0.2, 0.3), { blue: 0.8, 'navy.s': 0.2 }); } }
        if (R > 900) for (let k = 0; k < 3; k++) { const ph = ((performanceT * 4.5 + k / 3) % 1), rr = 60 + ph * 1500; press.knockout((g) => { g.beginPath(); g.arc(q[0], q[1], rr, 0, 6.2832); g.arc(q[0], q[1], rr * 0.9, 0, 6.2832, true); g.globalAlpha = 0.55 * (1 - ph); g.fill('evenodd'); g.globalAlpha = 1; }); ink(press, (g) => { g.beginPath(); g.arc(q[0], q[1], rr, 0, 6.2832); g.arc(q[0], q[1], rr * 0.9, 0, 6.2832, true); }, { 'yellow.s': 0.25 * (1 - ph) }); }
    }
    Seg.curieRadium = {
        T,
        init() { return {}; },
        draw(press, tq) {
            const t = tq, c = cam(t);
            // the camera following the ray: pan so its head never runs past a line that itself
            // slides to the right edge, and tilt so the ray settles at the frame's middle
            if (t > T.ray[0]) {
                const z = c.Z, dx = (c.drift - 0.5) * -150, sx = (x) => c.S[0] + dx + (x - c.F[0]) * z, sy = c.S[1] + (TIP[1] - c.F[1]) * z;
                const lim = L(1150, 1700, IO(S(t, T.ray[1] - 0.2, T.end)));
                c.px = Math.min(0, lim - sx(headX(t)));
                c.py = (450 - sy) * IO(S(t, T.ray[0] + 0.1, T.ray[1]));
            }
            layer(press, c, 0.7, () => shed(press, t));
            layer(press, c, 1, () => {
                const wr = [TB[0] - 125 * 0.53 * Math.cos(-0.35) + 7 * 0.53 * Math.sin(-0.35), TB[1] + TL * 0.36 - 125 * 0.53 * Math.sin(-0.35) + 7 * 0.53 * Math.cos(-0.35)];
                marie(press, t, [wr[0] - 60, wr[1] + 330], wr);
                tube(press, t, 1);
                hand(press, { t });
                particles(press, t);
            });
            // the ray's moment: the shed goes dark round it (inks only darken: a veil of the
            // night's navy thickening over everything but the ray)
            // (it ends opaque, in Einstein's ground: she is gone whole, never seen through)
            const dk = IO(S(t, T.ray[0] + 0.1, T.ray[1] + 0.1));
            if (dk >= 1) put(press, (g) => g.rect(0, 0, 1600, 900), { blue: 0.9, 'navy.s': 0.92, 'pink.s': 0.2 });
            else if (dk > 0) ink(press, (g) => g.rect(0, 0, 1600, 900), { navy: 0.92 * dk, 'blue.s': 0.5 * dk });
            // the frame full of light at the start (the join with Faraday's spark): its glow
            // shrinks back into the tube's glow as the camera pulls out (drawn in her plane, so
            // it sits on the tube)
            const f = (1 - S(t, 0, 0.85)) * (1 + 0.1 * Math.sin(t * 16) * (1 - S(t, 0, 0.85)));
            layer(press, c, 1, () => {
                if (f > 0) lightGlow(press, [TB[0], TB[1] + 20], Math.exp(L(Math.log(40), Math.log(2400), Math.min(1, f * 1.08))) / c.Z, t + 11.2);
                ray(press, t, c.Z);
            });
        },
    };
})();
