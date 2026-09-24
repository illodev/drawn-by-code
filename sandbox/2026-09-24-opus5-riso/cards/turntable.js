// Card «turntable» (reference 7.25–7.5 s, full frame): a record player from above, the
// vinyl spinning with two light wedges, the tone arm on the right, on green. Authored in
// reference pixels (G2.px), measured on the 7.3 s frame. Separations: green = yellow solid +
// blue dots; the record = yellow + blue + navy (less navy in the sheen); shadows = pink dots
// on the green (red); whites knocked out. Needs cards/_group2-util.js.
var CARDS = CARDS || {};
CARDS.turntable = (press, t, lf) => {
    const { T, px, conic, poly, disc, ringS, fillWith, inside, curve, speckle } = G2;
    const P = (ink, k) => press.plate(ink, k);
    const yellow = P('yellow'), yellowS = P('yellow', 'screen'), pink = P('pink'), pinkS = P('pink', 'screen');
    const blue = P('blue'), blueS = P('blue', 'screen'), navy = P('navy'), navyS = P('navy', 'screen');
    const d = Math.floor(t * 12 + 1e-6), spin = d * 0.09; // the record turns a little per drawing
    const CX = 450, CY = 588, RP = 468, RR = 444; // rim fitted on frame 176 (outer circle (449, 588) r 472 after the 0.8 % push) // platter centre, platter and record radii
    const LX = 450, LY = 590; // the label (the spindle sits a little left of the platter centre)
    // the camera pushes in ≈ 0.4 % a frame about (560, 560) px (frames 174 → 179: × 1.02)
    const f = lf ?? 2 * d + 0.5, zs = 1 + 0.004 * f;
    px(press, () => {
        press.save(); press.each((g) => { g.translate(560, 560); g.scale(zs, zs); g.translate(-560, -560); });
        // the deck: yellow ink with blue dots over it (green)
        yellow.fillStyle = T(1); yellow.fillRect(0, 0, 1080, 1080);
        G2.lat([9.08, 0.26, 973.47, 573.18], () => 0.55, blue, [-20, -20, 1100, 1100]); // the deck's dots, on the reference's lattice
        // a couple of dark green scratches on the deck
        curve(navy, [[815, 1010], [870, 930], [940, 860]], 2, 0.5);
        curve(navy, [[900, 1040], [960, 985], [1010, 930]], 2, 0.4);
        // shadows (pink dots → red on the green), cast down-right
        const sh = [24, 30];
        pinkS.fillStyle = T(0.72);
        pinkS.beginPath(); pinkS.arc(CX + sh[0], CY + sh[1], RP, 0, 7); pinkS.fill();
        disc(pinkS, 925 + 30, 82 + 26, 50, 0.72);
        disc(pinkS, 910 + 26, 200 + 30, 72, 0.72);
        curve(pinkS, [[908 + 26, 270], [906 + 26, 420 + 30], [880 + 26, 560 + 30], [790 + 26, 715 + 30]], 22, 0.72);
        for (const [x, y] of [[103, 1005], [905, 965], [995, 965]]) disc(pinkS, x + 14, y + 12, 30, 0.72);
        // the platter: clear the deck inks, a white rim with blue dots and a pink inner line
        press.knockout((g) => { g.beginPath(); g.arc(CX, CY, RP, 0, 7); g.fill(); });
        ringS(navy, CX, CY, RP, 3, 0.55);
        inside(blue, (g) => { g.arc(CX, CY, RP - 2, 0, 7); g.arc(CX, CY, RR + 4, 0, 7, true); }, (g) => {
            // the rim's stipple: small irregular blue flecks (triangles and dots), not a screen
            const r = Motion.rng('rim'); g.fillStyle = T(0.85);
            for (let i = 0; i < 1400; i++) {
                const a = r() * 6.2832, rad = RR + 4 + r() * (RP - RR - 6), x = CX + Math.cos(a) * rad, y = CY + Math.sin(a) * rad, s = 1.5 + r() * 2.8, q = r() * 6.28;
                g.beginPath(); g.moveTo(x + Math.cos(q) * s, y + Math.sin(q) * s); g.lineTo(x + Math.cos(q + 2.2) * s, y + Math.sin(q + 2.2) * s); g.lineTo(x + Math.cos(q + 4.1) * s, y + Math.sin(q + 4.1) * s); g.fill();
            }
        });
        ringS(pink, CX, CY, RR + 3, 3, 0.9);
        // the record: yellow + blue + navy (dark green); the sheen = softly less navy
        const rec = (g) => g.arc(CX, CY, RR, 0, 7);
        fillWith(yellow, rec, T(1));
        fillWith(blue, rec, T(0.95));
        fillWith(navy, rec, T(0.66));
        const W1 = -0.91, W2 = W1 + Math.PI; // measured on rings round the label: the light is fixed, it does not spin // the two light wedges (angle of their axis)
        const out = (g, style) => inside(g, rec, (c) => { c.globalCompositeOperation = 'destination-out'; c.fillStyle = style(c); c.fillRect(0, 0, 1080, 1080); });
        // broad sheen: lighter green trailing each wedge, darker between
        const two = (f) => [...f(W1), ...f(W2)];
        out(navy, (c) => conic(c, LX, LY, two((a) => [[a - 0.9, 0], [a - 0.45, 0.25], [a, 0.35], [a + 0.45, 0.25], [a + 0.9, 0]])));
        // the wedge cores: sharp-edged, navy and blue gone, yellow thinned (pale, paper showing)
        // the wedges: a broad olive-yellow sector (less navy and blue) and a pale core (paper
        // showing through a thin yellow) between the rays; straight edges, as a light beam
        const sector = (lo, hi, k) => (c) => conic(c, LX, LY, two((a) => [[a + lo - 0.03, 0], [a + lo, k], [a + hi, k], [a + hi + 0.03, 0]]));
        // the wedge: a broad olive sheen and a pale core, a triangle opening from r ≈ 177 with
        // a lateral half-width 0.47 (r − 177) (20 px at r 220, 72 px at r 330)
        out(navy, sector(-0.22, 0.22, 0.5));
        out(blue, sector(-0.22, 0.22, 0.4));
        const core = (a, k) => { const ux = Math.cos(a), uy = Math.sin(a), R0 = 170, R1 = RR + 10, w = 0.47 * (R1 - 177) * k; return [[LX + ux * R0, LY + uy * R0], [LX + ux * R1 - uy * w, LY + uy * R1 + ux * w], [LX + ux * R1 + uy * w, LY + uy * R1 - ux * w]]; };
        for (const a of [W1, W2]) {
            for (const g of [navy, blue]) inside(g, rec, (c) => { c.globalCompositeOperation = 'destination-out'; c.filter = 'blur(3px)'; poly(c, core(a, 1), 1); c.filter = 'none'; });
            inside(yellow, rec, (c) => { c.globalCompositeOperation = 'destination-out'; poly(c, core(a, 0.8), 0.45); });
        }
        // the grooves: fine lighter rings every 3.6 px (and fine green lines across the wedges)
        inside(navy, rec, (g) => {
            g.globalCompositeOperation = 'destination-out'; g.lineWidth = 1.1; g.strokeStyle = T(0.4);
            for (let r = 166; r < RR - 4; r += 3.6) { g.beginPath(); g.arc(LX, LY, r, 0, 7); g.stroke(); }
        });
        for (const a of [W1, W2]) inside(blue, (g) => G2.path(g, core(a, 1)), (g) => {
            g.lineWidth = 1.1; g.strokeStyle = T(0.7);
            for (let r = 166; r < RR - 4; r += 3.6) { g.beginPath(); g.arc(LX, LY, r, 0, 7); g.stroke(); }
        });
        // the rays: bright yellow tapered strokes converging on the label
        for (const a of [W1, W2]) for (const [da, w, r0, r1] of [[-0.14, 4, 200, 420], [-0.05, 5, 185, 430], [0.04, 5, 185, 410], [0.12, 3, 210, 420]]) {
            const pts = []; for (let i = 0; i <= 10; i++) { const r = r0 + (r1 - r0) * i / 10, u = a + da * (0.35 + 0.65 * i / 10); pts.push([LX + Math.cos(u) * r, LY + Math.sin(u) * r]); }
            press.knockout((g) => G2.taper(g, pts, w + 2, 1));
            G2.taper(yellow, pts, w, 1);
        }
        // the track gaps: thin orange rings (pink on the yellow, the blue and navy cleared)
        for (const [r, a0, a1] of [[182, 0, 7], [262, 0, 7], [340, 0, 7], [412, -2.9, 1.9], [428, 1.2, 2.6]]) {
            for (const g of [navy, blue]) inside(g, rec, (c) => { c.globalCompositeOperation = 'destination-out'; ringS(c, LX, LY, r, 1.8, 0.9, a0 + spin, a1 + spin); });
            ringS(pink, LX, LY, r, 1.6, 0.8, a0 + spin, a1 + spin);
        }
        // specks in the vinyl: orange, pink and green bits of other inks
        inside(pink, rec, (g) => speckle(g, 'rp' + d, 20, 150, 900, 1030, 70, 1.5, 3, 0.9));
        inside(navy, rec, (g) => { g.globalCompositeOperation = 'destination-out'; speckle(g, 'rn' + d, 20, 150, 900, 1030, 60, 1.2, 2.5, 0.8); });
        // the shadow ring round the label (more navy)
        ringS(navy, LX, LY, 158, 14, 0.8);
        // the label: pink; red disc (pink + yellow) inside a white ring; yellow centre
        press.knockout((g) => { g.beginPath(); g.arc(LX, LY, 152, 0, 7); g.fill(); });
        disc(pink, LX, LY, 152, 1);
        // white flecks where the pink ink skipped
        press.knockout((g) => { speckle(g, 'lbw', LX - 150, LY - 150, LX + 150, LY + 150, 110, 0.7, 1.4, 0.6); });
        press.knockout((g) => { g.lineWidth = 6; g.beginPath(); g.arc(LX, LY, 119, 0, 7); g.stroke(); });
        disc(yellow, LX, LY, 116, 1);
        disc(pink, LX, LY, 116, 1);
        press.knockout((g) => { g.beginPath(); g.arc(LX, LY, 62, 0, 7); g.fill(); });
        disc(yellow, LX, LY, 62, 1);
        // three dark crescents (navy) round the yellow, turning with the record
        for (const a of [-1.75, 2.55, 0.35]) {
            const pts = []; for (let i = 0; i <= 12; i++) { const u = a + spin - 0.45 + (i / 12) * 0.9; pts.push([LX + Math.cos(u) * 87, LY + Math.sin(u) * 87]); }
            G2.taper(navy, pts, 16, 1);
        }
        // thin navy arcs on the left of the label
        for (const r of [128, 136, 144]) ringS(navy, LX, LY, r, 2, 0.9, 2.1 + spin * 0.3, 4.1 + spin * 0.3);
        // the spindle hole: white with a navy ring
        press.knockout((g) => { g.beginPath(); g.arc(LX, LY, 17, 0, 7); g.fill(); });
        ringS(navy, LX, LY, 16, 3, 0.9); ringS(blue, LX, LY, 16, 3, 0.9);
        // the blue dot on the label (a white ring round it)
        const bx = LX + Math.cos(-0.72 + spin) * 107, by = LY + Math.sin(-0.72 + spin) * 107;
        press.knockout((g) => { g.beginPath(); g.arc(bx, by, 21, 0, 7); g.fill(); });
        disc(navy, bx, by, 17, 1); disc(blue, bx, by, 17, 0.8);
        // the tone arm: counterweight (brown: navy + pink + yellow) with a lit arc
        press.knockout((g) => { g.beginPath(); g.arc(925, 82, 50, 0, 7); g.fill(); });
        disc(navy, 925, 82, 50, 0.85); disc(pink, 925, 82, 50, 0.55); disc(yellow, 925, 82, 50, 0.8);
        ringS(yellow, 918, 90, 34, 5, 1, 3.4, 4.4);
        ringS(pink, 918, 90, 26, 3, 1, 3.5, 4.3);
        // the arm tube: white, blue dots on its shade side, a blue outline
        const tube = [[908, 262], [906, 420], [882, 560], [790, 715]];
        press.knockout((g) => curve(g, tube, 22, 1));
        curve(navy, tube, 20, 0.5); curve(blue, tube, 20, 0.9);
        press.knockout((g) => curve(g, tube, 15, 1));
        curve(blueS, tube.map(([x, y]) => [x + 3, y + 1]), 7, 0.35);
        // the pivot: a white disc with blue dots, a blue ring and a blue centre
        press.knockout((g) => { g.beginPath(); g.arc(910, 200, 72, 0, 7); g.fill(); });
        ringS(blue, 910, 200, 71, 3, 0.8);
        disc(blueS, 910, 200, 70, 0.32);
        ringS(blue, 910, 200, 40, 3, 1);
        disc(blue, 910, 200, 14, 1);
        disc(pink, 906, 272, 7, 0.9); // the arm's collar
        // the headshell: a blue block, a white-and-pink tip
        headshell: {
            const hx = 752, hy = 748, a = 0.72;
            const q = (x, y) => [hx + x * Math.cos(a) - y * Math.sin(a), hy + x * Math.sin(a) + y * Math.cos(a)];
            press.knockout((g) => { G2.path(g, [q(-20, -32), q(20, -32), q(20, 24), q(-20, 24)]); g.fill(); });
            poly(blue, [q(-18, -30), q(18, -30), q(18, 22), q(-18, 22)], 1);
            poly(navy, [q(4, -30), q(18, -30), q(18, 22), q(4, 22)], 0.3);
            press.knockout((g) => { G2.path(g, [q(-16, 22), q(16, 22), q(16, 38), q(-16, 38)]); g.fill(); });
            poly(pink, [q(-16, 32), q(16, 32), q(16, 42), q(-16, 42)], 0.9);
            poly(yellow, [q(-16, 34), q(16, 34), q(16, 42), q(-16, 42)], 0.9);
        }
        // the buttons: two white and one pink with a navy slash
        for (const [x, y, c] of [[103, 1005, 'w'], [905, 965, 'p'], [995, 965, 'w']]) {
            press.knockout((g) => { g.beginPath(); g.arc(x, y, 30, 0, 7); g.fill(); });
            ringS(navy, x, y, 30, 3, 0.6); ringS(blue, x, y, 30, 3, 0.6);
            if (c === 'p') { disc(pink, x, y, 28, 1); G2.curve(navy, [[x - 18, y + 16], [x + 18, y - 16]], 3, 0.9); }
        }
        press.restore();
    });
};
