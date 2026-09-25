// Galileo's hands on the telescope's tube, drawn in the tube's own frame so they sit on it at
// any camera: a along the tube (towards the objective), b across it on screen (b = -r the top
// edge, b = +r the bottom), both in world units; r the tube's radius there. Global: GalHands.
//
// A natural hold of a tube raised in front of the face, the forearms coming up from below:
//
//   GalHands.near(press, r, o)   his right hand (the side facing the camera) holding the bar
//                                as one holds a torch pointing forward: the back of the hand on
//                                the near face, the fingers curling under, the thumb over the
//                                top pointing forward, the index in front. o: { fa, squeeze }
//   GalHands.over(press, r, o)   his right hand with the forearm coming up from below (Galileo):
//                                fingers over the top, thumb under towards his face (−a)
//   GalHands.far(press, r, o)    his left hand, from the far side: only the fingers show,
//                                curling over the top and down the near face, nails towards us,
//                                the index towards him (−a)
//   GalHands.wristPt(which, r)   where each wrist is (local), for the arm's IK (the far one is
//                                behind the tube)
//   GalHands.cuff(press, w, dir, width, shade)   a white shirt cuff round a wrist
//
// Sizes from a real hand (1 unit ≈ 1.35 mm): palm 63 wide and 52 from wrist to knuckles,
// fingers 13–17 wide, the thumb 19; the tube is 38–45 across. Handedness checked by holding a
// real bar: a right hand seen from its right side, torch grip, has its thumb on top pointing
// forward and its index in front; a left hand reaching over from the far side has its index
// towards the body.
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

    const wristPt = (which, r) => (which === 'near' ? [-40, 0] : which === 'over' ? [4, r + 20] : [4, r - 8]);

    // ── the right hand: a closed grip, the back of the hand towards us ─────────────────────
    function near(press, r, o = {}) {
        const fa = o.fa ?? [-0.8, 0.6], sq = o.squeeze ?? 0;
        const W = wristPt('near', r), W1 = add(W, fa, 16), n = [-fa[1], fa[0]];
        // the right hand holds a bar pointing forward as one holds a torch, the forearm coming
        // from behind along it: the palm against its far side, the fingers curling under it,
        // the thumb over the top pointing forward; seen from his right we get the back of the
        // hand, the knuckles low, the index in front
        const FR = [[27, 17], [11, 17.5], [-5, 16.5], [-20, 14.5]]; // index → little: [a, width]
        const shapes = [];
        // the fingers' middle joints showing under the bottom edge as they curl round it
        for (const [ac, w] of FR) shapes.push([[ac - w / 2, r - 8], [ac - w / 2, r + 1], [ac - w * 0.3, r + 6 + sq * 0.5], [ac + w * 0.3, r + 6.4 + sq * 0.5], [ac + w / 2, r + 1], [ac + w / 2, r - 8]]);
        // the back of the hand, from the knuckles' row back to the wrist
        const HB = [[-26, -r + 6], [-8, -r + 4], [12, -r + 4], [30, -r + 7], [38, -2], [34, r - 6], [18, r - 3], [0, r - 3], [-18, r - 5], [-28, r - 8], add(W, n, -15), add(W1, n, -16), add(W1, n, 16), add(W, n, 15)];
        // the thumb over the top: from its root at the back of the fist, forward along the bar
        const TH = [[-18, -r + 5], [0, -r - 1], [18, -r - 3 - sq * 0.3], [30, -r - 1 - sq * 0.3]];
        const th = digit(TH, 15, 11);
        // one skin, no seams: every piece knocked out and inked the same, then shaded as one
        const paths = [...shapes.map((sh) => (g) => smooth(g, sh)), (g) => smooth(g, HB), (g) => poly(g, th)];
        for (const pth of paths) press.knockout((g) => { g.beginPath(); pth(g); g.fill(); });
        for (const pth of paths) ink(press, pth, SKIN);
        press.save(); press.clip((g) => { g.beginPath(); for (const sh of shapes) { const S = Ph.sample(sh, true, 10); S.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); } const S2 = Ph.sample(HB, true, 10); S2.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); th.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); });
        // round across the back of the hand: lit high, turning away under the bar and towards
        // the little finger's edge; the tube's shadow under the thumb
        ink(press, (g) => g.rect(-60, -r - 20, 120, 2 * r + 70), { 'pink.s': (g) => Riso.ramp(g, 0, -r, 0, r + 10, 0.02, 0.3), 'navy.s': (g) => Riso.ramp(g, 0, r - 4, 0, r + 10, 0, 0.12) });
        ink(press, (g) => g.rect(-60, -r - 20, 120, 2 * r + 70), { 'pink.s': (g) => Riso.ramp(g, -34, 0, -14, 0, 0.2, 0) });
        ink(press, (g) => g.rect(-20, -r - 1, 60, 5), { 'pink.s': 0.2, 'navy.s': 0.12 });
        // tendons fanning from the wrist to the knuckles, a vein
        for (const [ac] of FR) line(press, [[W[0] + 6, W[1] - 4 + ac * 0.12], [ac * 0.5 - 4, r * 0.35], [ac, r - 8]], taper(3, 0.3, 0.3), { 'pink.s': 0.1 }, { knock: false });
        line(press, [[-28, -4], [-12, 4], [0, 0], [12, 8], [22, r - 8]], taper(2.4, 0.2, 0.2), VEIN, { knock: false });
        press.restore();
        // creases only (no outlines between the pieces): the knuckles' bumps and their creases,
        // the gaps between the fingers under the bar, the thumb's joint and its nail
        for (const [ac, w] of FR) {
            press.knockout(ellipse(ac, r - 6, w * 0.28, 3, 0));
            line(press, [[ac - w * 0.25, r - 1], [ac, r + 0.5], [ac + w * 0.25, r - 1]], taper(1, 0.3, 0.3), CREASE);
        }
        for (let i = 0; i < 3; i++) { const x = (FR[i][0] - FR[i][1] / 2 + FR[i + 1][0] + FR[i + 1][1] / 2) / 2; line(press, [[x, r - 1], [x, r + 7]], taper(1.4, 0.3, 0.2), SHADOW); }
        line(press, [[-12, -r + 9], [0, -r + 4], [10, -r + 2]], taper(1.3, 0.2, 0.5), CREASE);
        wrinkles(press, [16, -r - 2.5], 0, 10, 2);
        nail(press, [26.5, -r - 3.8 - sq * 0.3], -0.05, 5, 8);
        // the outer silhouette only, faint
        line(press, Ph.sample(HB, true, 6).slice(0, 30), taper(1, 0.1, 0.1), { 'pink.s': 0.35, 'navy.s': 0.2 }, { knock: false });
        cuff(press, W1, fa, 40, 0);
    }

    // ── the right hand from below: a raised tube held with the forearm coming up under it ──
    // With the forearm nearly upright and the palm against the tube's far side, the right hand's
    // thumb points back towards his face (−a) and wraps under the tube; the fingers go over the
    // top and away, the index next to the thumb (−a). Seen from his right: the back of the hand,
    // the knuckles' row near the top edge, the thumb's round under the bottom edge at the back.
    function over(press, r, o = {}) {
        const sq = o.squeeze ?? 0;
        // drawn in a mirrored frame (a → −a): the layout below has the thumb at +a
        const fa = [-(o.fa ?? [0.35, 0.94])[0], (o.fa ?? [0.35, 0.94])[1]];
        press.save(); press.each((g) => g.scale(-1, 1));
        const FO = [[26, 16], [9.5, 16.5], [-6.5, 15.5], [-22, 13.5]]; // index → little
        const W = [-2, r + 20], W1 = add(W, fa, 16), side = [fa[1], -fa[0]];
        const fingers = FO.map(([ac, w]) => { const top = -r - 12 - sq * 0.6; return [[ac - w / 2, -r + 8], [ac - w / 2, -r - 3], [ac - w * 0.3, top], [ac + w * 0.3, top - 0.5], [ac + w / 2, -r - 3], [ac + w / 2, -r + 8]]; });
        // the thumb: its root on the hand's edge towards his face, curling under the tube (the tip
        // goes out of sight on the far side)
        const th = digit([[26, r - 10], [34, r - 3], [35, r + 4 - sq]], 20, 15);
        const HB = [[-31, -r + 11], [-24, -r + 3], [-8, -r + 1], [10, -r], [28, -r + 1.5], [36, -r + 8], [37, 0], [31, r - 4], [24, r + 6], add(W, side, 17), add(W1, side, 18), add(W1, side, -18), add(W, side, -17), [-28, r + 4], [-33, 2]];
        // one skin: every piece knocked out and inked alike, shaded through one clip
        const traced = [...fingers.map((f) => Ph.sample(f, true, 10)), th, Ph.sample(HB, true, 10)];
        const all = (g) => { g.beginPath(); for (const P of traced) { P.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); } };
        press.knockout((g) => { all(g); g.fill('nonzero'); });
        ink(press, (g) => { for (const P of traced) { P.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); } }, SKIN);
        press.save(); press.clip((g) => all(g));
        ink(press, (g) => g.rect(-60, -r - 20, 130, 2 * r + 70), { 'pink.s': (g) => Riso.ramp(g, 0, -r + 6, 0, r + 30, 0.02, 0.3) });
        ink(press, (g) => g.rect(-60, -r - 20, 130, 2 * r + 70), { 'pink.s': (g) => Riso.ramp(g, -34, 0, -12, 0, 0.24, 0), 'navy.s': (g) => Riso.ramp(g, -34, 0, -16, 0, 0.08, 0) });
        // the fingers turn away over the top; the thumb's round goes under, into shade
        ink(press, (g) => g.rect(-60, -r - 20, 130, 14), { 'pink.s': (g) => Riso.ramp(g, 0, -r + 2, 0, -r - 12, 0, 0.3) });
        ink(press, (g) => g.rect(20, r - 14, 30, 30), { 'pink.s': (g) => Riso.ramp(g, 0, r - 6, 0, r + 12, 0.06, 0.34), 'navy.s': (g) => Riso.ramp(g, 0, r, 0, r + 12, 0, 0.12) });
        for (const [ac] of FO) line(press, [[W[0] + (ac - 2) * 0.25, W[1] - 8], [ac * 0.7, 2], [ac, -r + 9]], taper(3, 0.3, 0.3), { 'pink.s': 0.1 }, { knock: false });
        line(press, [[-26, r - 2], [-10, 4], [4, 0], [14, 6], [20, r - 2]], taper(2.4, 0.2, 0.2), VEIN, { knock: false });
        press.restore();
        // creases only: the knuckles and the finger joints on top, the gaps, the thumb's joint
        for (const [ac, w] of FO) {
            press.knockout(ellipse(ac + 0.5, -r + 5.5, w * 0.3, 3.4, 0));
            line(press, [[ac - w * 0.25, -r + 9.5], [ac, -r + 10.8], [ac + w * 0.25, -r + 9.5]], taper(1, 0.3, 0.3), CREASE);
            wrinkles(press, [ac + 0.5, -r - 6], Math.PI / 2, w, 3);
        }
        for (let i = 0; i < 3; i++) { const x = (FO[i][0] - FO[i][1] / 2 + FO[i + 1][0] + FO[i + 1][1] / 2) / 2; line(press, [[x, -r - 9], [x, -r + 3]], taper(1.4, 0.3, 0.2), SHADOW); }
        line(press, [[22, r - 12], [27, r - 5], [28, r + 1]], taper(1.3, 0.2, 0.5), CREASE);
        wrinkles(press, [34, r + 1], Math.PI / 2 - 0.3, 14, 2);
        line(press, Ph.sample(HB, true, 6).slice(0, 30), taper(1, 0.1, 0.1), { 'pink.s': 0.35, 'navy.s': 0.2 }, { knock: false });
        cuff(press, W1, fa, 40, 0);
        press.restore();
    }

    // ── the left hand: from the far side, its fingers curling over the top towards us ───────
    function far(press, r, o = {}) {
        const sq = o.squeeze ?? 0;
        // his left hand reaching over from the far side: the index towards him (−a), the little
        // finger forward
        const FING = [[22, 13.5], [6.5, 15.5], [-9.5, 16.5], [-26, 16]];
        const TIP = [-r + 13, -r + 18, -r + 20, -r + 17]; // little, ring, middle, index // how far down the near face each reaches
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
            line(press, fg.slice(0, Math.floor(fg.length / 2)), taper(1, 0.2, 0.2), { 'pink.s': 0.35, 'navy.s': 0.15 }, { knock: false });
            wrinkles(press, [ac - lean * 0.6, -r - 1], Math.PI / 2, w, 3);
            nail(press, [ac, tipB - w * 0.4 + 1.5], Math.PI / 2, w * 0.56, 10);
        }
        for (let i = 0; i < 3; i++) { const x = (FING[i][0] - FING[i][1] / 2 + FING[i + 1][0] + FING[i + 1][1] / 2) / 2; line(press, [[x, -r - 8], [x + 0.4, -r + 4], [x + 0.6, Math.min(TIP[i], TIP[i + 1]) - 2]], taper(1.8, 0.3, 0.3), SHADOW); }
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

    return { near, over, far, cuff, wristPt };
})();
