// Galileo's hands on the telescope's tube, drawn in the tube's own frame so they sit on it at
// any camera: a along the tube (towards the objective), b across it on screen (b = -r the top
// edge, b = +r the bottom), both in world units; r the tube's radius there. Global: GalHands.
//
// A natural hold of a tube raised in front of the face, the forearms coming up from below:
//
//   GalHands.near(press, r, o)   his right hand (the side facing the camera) closed round the
//                                tube: the back of the hand on the near face, the knuckles'
//                                row near the top, the fingers going over the top and away, the
//                                thumb wrapping round under it. o: { fa, squeeze }
//   GalHands.far(press, r, o)    his left hand, from the far side: only the fingers show,
//                                curling over the top and down the near face, nails towards us
//   GalHands.wristPt(which, r)   where each wrist is (local), for the arm's IK (the far one is
//                                behind the tube)
//   GalHands.cuff(press, w, dir, width, shade)   a white shirt cuff round a wrist
//
// Sizes from a real hand (1 unit ≈ 1.35 mm): palm 63 wide and 52 from wrist to knuckles,
// fingers 13–17 wide, the thumb 19; the tube is 38–45 across. Index towards the objective (the
// thumb's side is the way he faces), little finger towards the eyepiece.
const GalHands = (() => {
    const { put, ink, line, smooth, poly, taper, circle, ellipse } = Ph;
    const SKIN = Cast.SKIN, SKIN_SH = Cast.SKIN_SH;
    const LINE = { 'pink.s': 0.55, 'navy.s': 0.4 };
    const NAIL = { 'pink.s': 0.18, 'yellow.s': 0.05 };
    const CREASE = { 'pink.s': 0.5, 'navy.s': 0.3 };
    const SHADOW = { navy: 0.8, 'pink.s': 0.4 };
    const VEIN = { 'blue.s': 0.22, 'pink.s': 0.1 };
    const LINEN = Cast.LINEN, LINEN_SH = Cast.LINEN_SH;
    const add = (p, q, k = 1) => [p[0] + q[0] * k, p[1] + q[1] * k];
    const FING = [[-22, 13.5], [-6.5, 15.5], [9.5, 16.5], [26, 16]]; // little → index: [a, width]

    // a digit: a closed outline round a centre line with a rounded tip
    function digit(pts, w0, w1) {
        const w = (u) => w0 + (w1 - w0) * u;
        const ol = Ph.outline(pts, w), n = ol.length / 2;
        const a = pts[pts.length - 2], b = pts[pts.length - 1], d = Math.atan2(b[1] - a[1], b[0] - a[0]);
        const tip = [];
        for (let i = 1; i < 10; i++) { const an = d + Math.PI / 2 - (i / 10) * Math.PI; tip.push([b[0] + Math.cos(an) * w1 / 2, b[1] + Math.sin(an) * w1 / 2]); }
        return ol.slice(0, n).concat(tip, ol.slice(n));
    }
    // a nail on the back of a digit's last segment: bed, cuticle, the free edge's light
    function nail(press, c, ang, w, l) {
        const ax = Math.cos(ang), ay = Math.sin(ang);
        put(press, ellipse(c[0], c[1], l / 2, w / 2, ang), NAIL);
        line(press, [[c[0] - ax * l * 0.44 - ay * w * 0.4, c[1] - ay * l * 0.44 + ax * w * 0.4], [c[0] - ax * l * 0.52, c[1] - ay * l * 0.52], [c[0] - ax * l * 0.44 + ay * w * 0.4, c[1] - ay * l * 0.44 - ax * w * 0.4]], taper(1.1, 0.3, 0.3), CREASE);
        press.knockout(ellipse(c[0] + ax * l * 0.38, c[1] + ay * l * 0.38, l * 0.1, w * 0.38, ang));
        ink(press, ellipse(c[0] - ax * l * 0.12, c[1] - ay * l * 0.12, l * 0.28, w * 0.28, ang), { 'pink.s': 0.12 });
    }
    // wrinkles across a joint on the back of a finger
    function wrinkles(press, c, ang, w, n = 2) {
        const nx = -Math.sin(ang), ny = Math.cos(ang), ax = Math.cos(ang), ay = Math.sin(ang);
        for (let i = 0; i < n; i++) {
            const o = (i - (n - 1) / 2) * 2.2, hw = w * (0.3 - Math.abs(i - (n - 1) / 2) * 0.06);
            line(press, [[c[0] + ax * o - nx * hw, c[1] + ay * o - ny * hw], [c[0] + ax * (o - 1), c[1] + ay * (o - 1)], [c[0] + ax * o + nx * hw, c[1] + ay * o + ny * hw]], taper(1.1, 0.3, 0.3), CREASE);
        }
    }
    const shade = (press, clipPath, fn) => { press.save(); press.clip(clipPath); fn(); press.restore(); };

    const wristPt = (which, r) => (which === 'near' ? [-4, r + 20] : [4, r - 8]);

    // ── the right hand: a closed grip, the back of the hand towards us ─────────────────────
    function near(press, r, o = {}) {
        const fa = o.fa ?? [-0.35, 0.94], sq = o.squeeze ?? 0;
        const W = wristPt('near', r), W1 = add(W, fa, 16), side = [fa[1], -fa[0]]; // side: towards +a
        // the fingers going over the top edge and away (their backs; the middle knuckles on top)
        for (const [ac, w] of FING) {
            const top = -r - 12 - sq * 0.6;
            const sh = [[ac - w / 2, -r + 8], [ac - w / 2, -r - 3], [ac - w * 0.3, top], [ac + w * 0.3, top - 0.5], [ac + w / 2, -r - 3], [ac + w / 2, -r + 8]];
            put(press, (g) => smooth(g, sh), SKIN);
            shade(press, (g) => smooth(g, sh), () => ink(press, (g) => g.rect(ac - w, -r - 14, w * 2, 24), { 'pink.s': (g) => Riso.ramp(g, 0, -r + 2, 0, top, 0.04, 0.34), 'navy.s': (g) => Riso.ramp(g, 0, -r - 2, 0, top, 0, 0.1) }));
            line(press, sh, taper(1, 0.2, 0.2), LINE, { knock: false });
            wrinkles(press, [ac + 0.5, -r - 6], Math.PI / 2, w, 3);
        }
        for (let i = 0; i < 3; i++) { const x = (FING[i][0] + FING[i][1] / 2 + FING[i + 1][0] - FING[i + 1][1] / 2) / 2; line(press, [[x, -r - 8], [x, -r + 4]], taper(1.8, 0.3, 0.2), SHADOW); }
        // the thumb wraps round under the tube towards the far side: only its root and the
        // round of its first joint show below the bottom edge, foreshortened as it goes away
        const TH = [[20, r - 6], [32, r + 2], [44, r + 5 - sq], [52, r + 3 - sq]];
        const th = digit(TH, 22, 15);
        put(press, (g) => poly(g, th), SKIN);
        shade(press, (g) => poly(g, th), () => {
            ink(press, (g) => g.rect(10, r - 12, 60, 30), { 'pink.s': (g) => Riso.ramp(g, 30, 0, 58, 0, 0.1, 0.4), 'navy.s': (g) => Riso.ramp(g, 36, 0, 58, 0, 0, 0.16) });
            ink(press, (g) => g.rect(10, r - 12, 60, 12), { navy: 0.3, 'pink.s': 0.3 }); // the tube's shadow on it
        });
        line(press, th.concat([th[0]]), 1, LINE, { knock: false });
        wrinkles(press, [40, r + 5], 0.1, 13, 2);
        // the back of the hand on the near face, down to the wrist
        const HB = [[-31, -r + 11], [-24, -r + 3], [-8, -r + 1], [10, -r], [28, -r + 1.5], [36, -r + 8], [37, 0], [31, r - 4], [24, r + 6], add(W, side, 17), add(W1, side, 18), add(W1, side, -18), add(W, side, -17), [-28, r + 4], [-33, 2]];
        put(press, (g) => smooth(g, HB), SKIN);
        shade(press, (g) => smooth(g, HB), () => {
            // round across the back: lit along the knuckles, turning away towards the little
            // finger's edge and down to the wrist
            ink(press, (g) => g.rect(-40, -r - 4, 90, 2 * r + 60), { 'pink.s': (g) => Riso.ramp(g, 0, -r + 6, 0, r + 30, 0.02, 0.3) });
            ink(press, (g) => g.rect(-40, -r - 4, 90, 2 * r + 60), { 'pink.s': (g) => Riso.ramp(g, -34, 0, -12, 0, 0.26, 0), 'navy.s': (g) => Riso.ramp(g, -34, 0, -16, 0, 0.1, 0) });
            // tendons fanning from the wrist to the knuckles, a vein across them
            for (const [ac] of FING) line(press, [[W[0] + (ac - 2) * 0.25, W[1] - 8], [ac * 0.7, 2], [ac, -r + 9]], taper(3, 0.3, 0.3), { 'pink.s': 0.1 }, { knock: false });
            for (const [ac] of FING) line(press, [[W[0] + (ac - 2) * 0.25 + 3, W[1] - 8], [ac * 0.7 + 3, 2], [ac + 3, -r + 9]], taper(1.2, 0.3, 0.3), { 'pink.s': 0.16 }, { knock: false });
            line(press, [[-26, r - 2], [-10, 4], [4, 0], [14, 6], [20, r - 2]], taper(2.6, 0.2, 0.2), VEIN, { knock: false });
            // the thumb's root muscle on the front edge
            ink(press, ellipse(30, r - 6, 9, 14, 0.4), { 'pink.s': 0.16 });
        });
        line(press, Ph.sample(HB, true, 6).slice(0, 44), taper(1.1, 0.1, 0.1), LINE, { knock: false });
        // the knuckles' row: bony bumps catching the light, their creases
        for (const [ac, w] of FING) {
            press.knockout(ellipse(ac + 0.5, -r + 5.5, w * 0.3, 3.6, 0));
            ink(press, ellipse(ac + 0.5, -r + 9, w * 0.36, 2.6), { 'pink.s': 0.2 });
            line(press, [[ac - w * 0.25, -r + 9.5], [ac, -r + 10.8], [ac + w * 0.25, -r + 9.5]], taper(1, 0.3, 0.3), CREASE);
        }
        cuff(press, W1, fa, 40, 0);
    }

    // ── the left hand: from the far side, its fingers curling over the top towards us ───────
    function far(press, r, o = {}) {
        const sq = o.squeeze ?? 0;
        const TIP = [-r + 13, -r + 18, -r + 20, -r + 17]; // how far down the near face each reaches
        for (let i = 0; i < 4; i++) { const [ac, w] = FING[i]; ink(press, ellipse(ac + 1.5, TIP[i] + 3 + sq, w * 0.46, 3.4), SHADOW); }
        for (let i = 0; i < 4; i++) {
            const [ac, w] = FING[i], tipB = TIP[i] + sq, lean = (i - 1.5) * 0.8;
            // from behind the tube's top edge (the finger's thickness shows above it), over the
            // top, the last joint down the near face
            const pts = [[ac - lean, -r - 7], [ac - lean * 0.5, -r + 1], [ac, tipB - w * 0.4]];
            const fg = digit(pts, w, w * 0.9);
            const cap = [[ac - lean - w / 2, -r - 3], [ac - lean - w * 0.3, -r - 10], [ac - lean + w * 0.3, -r - 10.5], [ac - lean + w / 2, -r - 3]];
            put(press, (g) => { smooth(g, cap); }, SKIN_SH);
            put(press, (g) => poly(g, fg), SKIN);
            shade(press, (g) => poly(g, fg), () => {
                ink(press, (g) => g.rect(ac - w, -r - 14, w * 2, 40), { 'pink.s': (g) => Riso.ramp(g, 0, -r - 8, 0, -r + 2, 0.3, 0.04), 'navy.s': (g) => Riso.ramp(g, 0, -r - 8, 0, -r, 0.1, 0) });
                ink(press, (g) => g.rect(ac - w, -r - 14, w * 2, 40), { 'pink.s': (g) => Riso.ramp(g, 0, -r + 4, 0, tipB, 0, 0.16) });
                ink(press, (g) => g.rect(ac + w * 0.18, -r - 14, w * 0.5, 40), { 'pink.s': 0.12 });
            });
            line(press, fg.concat([fg[0]]), 1, LINE, { knock: false });
            wrinkles(press, [ac - lean * 0.6, -r - 1], Math.PI / 2, w, 3);
            nail(press, [ac, tipB - w * 0.4 + 1.5], Math.PI / 2, w * 0.56, 10);
        }
        for (let i = 0; i < 3; i++) { const x = (FING[i][0] + FING[i][1] / 2 + FING[i + 1][0] - FING[i + 1][1] / 2) / 2; line(press, [[x, -r - 8], [x + 0.4, -r + 4], [x + 0.6, Math.min(TIP[i], TIP[i + 1]) - 2]], taper(1.8, 0.3, 0.3), SHADOW); }
    }

    // a white shirt cuff round the wrist: a band across the arm, gathered, a small frill
    function cuff(press, w, dir, width, shade) {
        const n = [-dir[1], dir[0]], hw = width / 2, depth = 9;
        const A = add(w, n, -hw), B = add(w, n, hw);
        const band = [add(A, dir, -depth * 0.2), add(add(w, dir, -depth * 0.5), n, 0), add(B, dir, -depth * 0.2), add(B, dir, depth), add(add(w, dir, depth * 1.3), n, 0), add(A, dir, depth)];
        put(press, (g) => smooth(g, band), shade ? LINEN_SH : LINEN);
        for (let i = 0; i <= 6; i++) {
            const p = add(add(w, n, -hw + (i / 6) * width), dir, -depth * 0.3 - Math.sin((i / 6) * Math.PI) * depth * 0.3);
            put(press, circle(p[0], p[1], 3.4), shade ? LINEN_SH : LINEN);
        }
        for (let i = 1; i < 6; i++) { const p = add(w, n, -hw + (i / 6) * width); line(press, [add(p, dir, -depth * 0.1), add(p, dir, depth * 0.9)], taper(1.2), LINEN_SH, { knock: false }); }
        ink(press, (g) => smooth(g, [add(A, dir, depth * 0.4), add(B, dir, depth * 0.4), add(B, dir, depth), add(A, dir, depth)]), { 'blue.s': 0.2 });
    }

    return { near, far, cuff, wristPt };
})();
