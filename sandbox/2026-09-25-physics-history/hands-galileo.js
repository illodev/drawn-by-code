// Galileo's hands on the telescope's tube, drawn in the tube's own frame so they sit on it at
// any camera: a along the tube (towards the objective), b across it on screen (b = -r the top
// edge, b = +r the bottom), both in world units; r the tube's radius there. Global: GalHands.
//
//   GalHands.near(press, r, o)   his right hand (the side facing the camera): palm up under
//                                the tube, the fingers round its far side with their tips over
//                                the top edge, the thumb lying up the near face. o: { fa, press }
//   GalHands.far(press, r, o)    his left hand: palm up under the tube, pointing at the camera,
//                                the four fingers curling up the near face, nails at the top
//   GalHands.WRIST               where each wrist meets the cuff (local), for the arm's IK
//   GalHands.cuff(press, w, dir, width, shade)   a white shirt cuff round a wrist
//
// Sizes from a real hand (1 unit ≈ 1.35 mm): palm 63 wide, fingers 13–17 wide, a finger's
// segments 30/20/16 long, the thumb 20 wide; the tube is 40–45 across.
const GalHands = (() => {
    const { put, ink, line, smooth, poly, taper, circle, ellipse } = Ph;
    const SKIN = Cast.SKIN, SKIN_SH = Cast.SKIN_SH;
    const SKIN_DK = { 'yellow.s': 0.36, 'pink.s': 0.5, 'navy.s': 0.2 };
    const LINE = { 'pink.s': 0.55, 'navy.s': 0.4 };
    const NAIL = { 'pink.s': 0.2, 'yellow.s': 0.06 };
    const CREASE = { 'pink.s': 0.5, 'navy.s': 0.3 };
    const SHADOW = { navy: 0.8, 'pink.s': 0.4 };
    const LINEN = Cast.LINEN, LINEN_SH = Cast.LINEN_SH;
    const add = (p, q, k = 1) => [p[0] + q[0] * k, p[1] + q[1] * k];

    // a finger or thumb: a closed outline round a centre line with a rounded tip
    function digit(pts, w0, w1) {
        const w = (u) => w0 + (w1 - w0) * u;
        const ol = Ph.outline(pts, w), n = ol.length / 2;
        const a = pts[pts.length - 2], b = pts[pts.length - 1], d = Math.atan2(b[1] - a[1], b[0] - a[0]);
        const tip = [];
        for (let i = 1; i < 8; i++) { const an = d - Math.PI / 2 + (i / 8) * Math.PI; tip.push([b[0] + Math.cos(an) * w1 / 2, b[1] + Math.sin(an) * w1 / 2]); }
        return ol.slice(0, n).concat(tip.reverse(), ol.slice(n));
    }
    // a nail on the back of a digit's last segment: its bed, the lunula, the free edge's light
    function nail(press, c, ang, w, l) {
        put(press, ellipse(c[0], c[1], l / 2, w / 2, ang), NAIL);
        line(press, [add(c, [Math.cos(ang), Math.sin(ang)], -l / 2 + 1), add(c, [Math.cos(ang), Math.sin(ang)], -l / 2 + 1.5)], taper(w * 0.8), CREASE);
        press.knockout(ellipse(c[0] + Math.cos(ang) * l * 0.36, c[1] + Math.sin(ang) * l * 0.36, l * 0.12, w * 0.36, ang));
        ink(press, ellipse(c[0] - Math.cos(ang) * l * 0.1, c[1] - Math.sin(ang) * l * 0.1, l * 0.3, w * 0.3, ang), { 'pink.s': 0.12 });
    }
    // short wrinkles across a joint (on the back of a finger)
    function wrinkles(press, c, ang, w, n = 2) {
        const nx = -Math.sin(ang), ny = Math.cos(ang), ax = Math.cos(ang), ay = Math.sin(ang);
        for (let i = 0; i < n; i++) {
            const o = (i - (n - 1) / 2) * 2.4, hw = w * (0.3 - Math.abs(i - (n - 1) / 2) * 0.06);
            line(press, [[c[0] + ax * o - nx * hw, c[1] + ay * o - ny * hw], [c[0] + ax * (o + 1.2), c[1] + ay * (o + 1.2)], [c[0] + ax * o + nx * hw, c[1] + ay * o + ny * hw]], taper(1.1, 0.3, 0.3), CREASE);
        }
    }

    const WRIST = { near: [-8, 1.0, 30], far: [2, 1.0, 34] }; // [a, b in radii + offset below]
    const wristPt = (which, r) => [WRIST[which][0], r + WRIST[which][2]];

    // ── the right hand, near side ────────────────────────────────────────────────────────
    function near(press, r, o = {}) {
        const fa = o.fa ?? [-0.45, 0.89];                       // from the wrist towards the elbow
        const sq = o.squeeze ?? 0;                                // the fingers press a little (0..1)
        // the fingertips over the top edge: little, ring, middle, index (towards the objective)
        const F = [[-25, 14.5, 0.5], [-9, 17, 0.85], [8, 18, 1], [25, 17, 0.75]];
        for (const [ac, w, reach] of F) {
            const tip = -r + 5 + 10 * reach + sq;
            // their shadow on the tube's face below the tips
            ink(press, ellipse(ac + 1, tip + 3, w * 0.5, 3.4), SHADOW);
        }
        for (const [ac, w, reach] of F) {
            const tip = -r + 5 + 10 * reach + sq, top = -r - 9;
            const sh = [[ac - w / 2, tip - 3], [ac - w / 2 - 0.5, -r - 4], [ac - w * 0.34, top], [ac + w * 0.3, top - 0.5], [ac + w / 2, -r - 4], [ac + w / 2, tip - 3], [ac + w * 0.2, tip + 0.5], [ac - w * 0.25, tip + 0.5]];
            put(press, (g) => smooth(g, sh), SKIN);
            press.save(); press.clip((g) => smooth(g, sh));
            // lit along the top (the middle phalanx on the tube), turning into shade at the tip
            ink(press, (g) => g.rect(ac - w, -r - 20, w * 2, 40), { 'pink.s': (g) => Riso.ramp(g, 0, top, 0, tip, 0, 0.28), 'navy.s': (g) => Riso.ramp(g, 0, -r, 0, tip, 0, 0.08) });
            press.restore();
            line(press, sh.concat([sh[0]]), 0.9, LINE, { knock: false });
            // the last joint's wrinkles on top, the nail facing us at the tip
            wrinkles(press, [ac, -r - 6], Math.PI / 2, w, 2);
            nail(press, [ac, tip - 3.4], Math.PI / 2, w * 0.56, 7 + 3 * reach);
        }
        // the gaps between the fingers
        for (let i = 0; i < 3; i++) { const x = (F[i][0] + F[i][1] / 2 + F[i + 1][0] - F[i + 1][1] / 2) / 2; line(press, [[x, -r - 9], [x, -r + 2]], taper(1.6, 0.2, 0.3), SHADOW); }

        // the heel of the hand and the wrist under the tube (its back towards the ground)
        const W = wristPt('near', r), W1 = add(W, fa, 20);
        const HEEL = [[-36, r - 5], [-12, r - 2], [14, r - 2], [34, r - 5], [42, r + 4], [36, r + 16], [20, r + 24], [W[0] + 17, W[1] - 2], add(W1, [fa[1], -fa[0]], 16), add(W1, [-fa[1], fa[0]], 16), [W[0] - 16, W[1] - 6], [-34, r + 12]];
        put(press, (g) => smooth(g, HEEL), SKIN);
        // the index finger's root leaving the palm and curling up round the far side
        put(press, (g) => smooth(g, [[26, r - 2], [40, r - 4], [46, r + 4], [42, r + 14], [30, r + 12]]), SKIN_SH);
        line(press, [[30, r + 12], [40, r + 12], [45, r + 4]], taper(1.2), LINE, { knock: false });
        press.save(); press.clip((g) => smooth(g, HEEL));
        ink(press, (g) => g.rect(-60, r - 10, 120, 80), { 'pink.s': (g) => Riso.ramp(g, 0, r, 0, r + 30, 0.08, 0.36), 'navy.s': (g) => Riso.ramp(g, 0, r + 4, 0, r + 34, 0, 0.14) });
        // the tube's shadow across the top of the hand, the tendons on the back towards the wrist
        ink(press, (g) => g.rect(-60, r - 10, 120, 7), { navy: 0.25, 'pink.s': 0.3 });
        for (const x of [-18, -4, 10]) line(press, [[x, r + 4], [x * 0.6 + W[0] * 0.4, r + 20]], taper(2.4, 0.3, 0.6), { 'pink.s': 0.16 }, { knock: false });
        press.restore();
        line(press, Ph.sample(HEEL, true, 6).slice(8, 40), taper(1.2, 0.2, 0.2), LINE, { knock: false });
        // the thumb: from its fleshy base below the tube up the near face, the nail facing us
        const TH = [[0, r + 12], [13, r + 1], [24, r * 0.35 + sq], [34, r * 0.1 + sq]];
        const thumb = digit(TH, 26, 15);
        put(press, (g) => poly(g, thumb), SKIN);
        press.save(); press.clip((g) => poly(g, thumb));
        ink(press, (g) => g.rect(-10, -30, 70, 80), { 'pink.s': (g) => Riso.ramp(g, 0, -12, 0, r + 12, 0.04, 0.3) });
        press.restore();
        line(press, thumb.concat([thumb[0]]), 0.9, LINE, { knock: false });
        // the thenar crease where the thumb leaves the palm, the knuckle's wrinkles
        line(press, [[-2, r + 6], [8, r - 2], [14, r - 10]], taper(1.5, 0.2, 0.5), CREASE);
        wrinkles(press, [24, r * 0.35 + sq], Math.atan2(-r * 0.25, 10), 16, 3);
        const tn = Math.atan2(TH[3][1] - TH[2][1], TH[3][0] - TH[2][0]);
        nail(press, [TH[3][0] - Math.cos(tn) * 1.5, TH[3][1] - Math.sin(tn) * 1.5], tn, 10, 12);
        cuff(press, W1, fa, 38, 0);
    }

    // ── the left hand, far side, pointing at us: four fingers up the near face ──────────────
    function far(press, r, o = {}) {
        const fa = o.fa ?? [-0.3, 0.95];
        // [centre a, width, tip height (b), lean]
        const F = [[-26, 13.5, -r * 0.1, -2.5], [-9.5, 15.5, -r * 0.55, -1], [7, 16.5, -r * 0.66, 0.5], [24, 16, -r * 0.55, 2.5]];
        const W = wristPt('far', r), W1 = add(W, fa, 20);
        // the back of the hand below, seen end on: the knuckles' row, the wrist going away
        const BACK = [[-38, r - 4], [-20, r + 6], [0, r + 8], [20, r + 6], [38, r - 4], [36, r + 16], [W[0] + 18, W[1]], add(W1, [fa[1], -fa[0]], 17), add(W1, [fa[1], -fa[0]], -17), [W[0] - 18, W[1]], [-36, r + 16]];
        put(press, (g) => smooth(g, BACK), SKIN_SH);
        press.save(); press.clip((g) => smooth(g, BACK));
        ink(press, (g) => g.rect(-60, r - 10, 120, 80), { 'pink.s': (g) => Riso.ramp(g, 0, r + 4, 0, r + 34, 0.05, 0.3), 'navy.s': 0.08 });
        press.restore();
        for (let i = 0; i < 4; i++) {
            const [ac, w] = F[i];
            // the knuckles (the hand's end, at the fingers' roots)
            ink(press, ellipse(ac, r + 7, w * 0.42, 5), { 'pink.s': 0.25, 'navy.s': 0.06 });
            press.knockout(ellipse(ac - 1, r + 4.5, w * 0.24, 2.2));
        }
        // the fingers: from under the tube, up the near face, the last joint curling onto the top
        for (let i = 0; i < 4; i++) {
            const [ac, w, tipB, lean] = F[i], L = r - tipB;
            const pip = [ac + lean * 0.3, r * 0.5], dip = [ac + lean * 0.75, tipB + L * 0.34], tip = [ac + lean, tipB + 3];
            const pts = [[ac, r + 8], pip, dip, tip];
            const fg = digit(pts, w, w * 0.84);
            put(press, (g) => poly(g, fg), SKIN);
            press.save(); press.clip((g) => poly(g, fg));
            // round across (light from above-left), darker as they go under the tube
            ink(press, (g) => g.rect(ac - w, -r - 10, w * 2, 2 * r + 30), { 'pink.s': (g) => Riso.ramp(g, 0, 0, 0, r + 6, 0.04, 0.34), 'navy.s': (g) => Riso.ramp(g, 0, r * 0.4, 0, r + 8, 0, 0.12) });
            ink(press, (g) => g.rect(ac - w, -r - 10, w * 2, r), { 'pink.s': (g) => Riso.ramp(g, 0, -r * 0.1, 0, -r * 0.7, 0, 0.26) });
            ink(press, (g) => g.rect(ac + w * 0.22 + lean * 0.5, -r - 10, w * 0.4, 2 * r + 30), { 'pink.s': 0.14 });
            press.restore();
            line(press, fg.concat([fg[0]]), 0.9, LINE, { knock: false });
            wrinkles(press, pip, Math.atan2(dip[1] - pip[1], dip[0] - pip[0]), w, 3);
            wrinkles(press, dip, Math.atan2(tip[1] - dip[1], tip[0] - dip[0]), w * 0.9, 2);
            // the nail near the top edge, foreshortened as the tip turns over the tube
            nail(press, [tip[0], tip[1] + 2.5], -Math.PI / 2 + lean * 0.03, w * 0.56, 5.5);
        }
        // the gaps between the fingers
        for (let i = 0; i < 3; i++) {
            const x = (F[i][0] + F[i][1] / 2 + F[i + 1][0] - F[i + 1][1] / 2) / 2;
            line(press, [[x, r + 6], [x + 0.5, 0], [x + 1, Math.max(F[i][2], F[i + 1][2]) + 6]], taper(1.6, 0.2, 0.3), SHADOW);
        }
        cuff(press, W1, fa, 40, 1);
    }

    // a white shirt cuff round the wrist: a band across the arm, gathered, with a small frill
    function cuff(press, w, dir, width, shade) {
        const n = [-dir[1], dir[0]], hw = width / 2, depth = 9;
        const A = add(w, n, -hw), B = add(w, n, hw);
        const band = [add(A, dir, -depth * 0.2), add(add(w, dir, -depth * 0.5), n, 0), add(B, dir, -depth * 0.2), add(B, dir, depth), add(add(w, dir, depth * 1.3), n, 0), add(A, dir, depth)];
        put(press, (g) => smooth(g, band), shade ? LINEN_SH : LINEN);
        // the frill's scallops at the hand's end, the gathers
        for (let i = 0; i <= 6; i++) {
            const p = add(add(w, n, -hw + (i / 6) * width), dir, -depth * 0.3 - Math.sin((i / 6) * Math.PI) * depth * 0.3);
            put(press, circle(p[0], p[1], 3.4), shade ? LINEN_SH : LINEN);
        }
        for (let i = 1; i < 6; i++) { const p = add(w, n, -hw + (i / 6) * width); line(press, [add(p, dir, -depth * 0.1), add(p, dir, depth * 0.9)], taper(1.2), LINEN_SH, { knock: false }); }
        ink(press, (g) => smooth(g, [add(A, dir, depth * 0.4), add(B, dir, depth * 0.4), add(B, dir, depth), add(A, dir, depth)]), { 'blue.s': 0.2 });
    }

    return { near, far, cuff, wristPt };
})();
