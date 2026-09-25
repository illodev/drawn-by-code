// The film's cat, the running gag of physics-history: the same black cat with white paws and a
// white tail tip turns up in every scene, and in the last one it is Schrödinger's. Global: Cat.
//
//   Cat.sit(press, o)   sitting side-on on a perch, facing o.face (1 right, -1 left)
//     o: { x, y (the perch under its hind paws), s (scale: 1 = 100 units tall), face,
//          paw: [x, y] (world point its near front paw reaches for, or null), look: [x, y]
//          (world point it looks at), blink, tail (0..1 swish phase), ears (0..1 flatten) }
//
// Local units: the hind paws at (0, 0), the head's top at y ≈ -130, facing +x.
const Cat = (() => {
    const { put, ink, line, smooth, poly, taper, circle, ellipse } = Ph;
    const FUR = { navy: 1, yellow: 0.9, 'pink.s': 0.45 };
    const FUR_LT = { navy: 1, 'yellow.s': 0.5, 'blue.s': 0.45, 'pink.s': 0.3 };
    const WHITE = { 'blue.s': 0.06, 'yellow.s': 0.05 };
    const WHITE_SH = { 'blue.s': 0.3, 'navy.s': 0.12 };
    const EYE = { yellow: 1, 'blue.s': 0.45 };

    function sit(press, o) {
        const f = o.face ?? 1, s = o.s ?? 1;
        const toL = (p) => [(p[0] - o.x) / (s * f), (p[1] - o.y) / s];
        press.save();
        press.each((g) => { g.translate(o.x, o.y); g.scale(s * f, s); });
        const tl = o.tail ?? 0, lk = o.look ? toL(o.look) : [80, -100];
        // the tail: from the rump round along the perch behind, its tip white and flicking
        const T = [[-38, -8], [-70, -4], [-98, -12 - 14 * Math.sin(tl * 6.28)], [-112, -34 - 10 * Math.sin(tl * 6.28 + 1)]];
        line(press, Ph.sample(T, false, 6), taper(13, 0.1, 0.5), FUR);
        const tip = Ph.sample(T, false, 6), n = tip.length;
        line(press, tip.slice(n - 4), taper(9, 0.2, 0.6), WHITE);
        // the far front leg (straight, to the perch)
        line(press, [[18, -48], [20, -20], [22, -2]], taper(12, 0.2, 0.2), FUR_LT);
        put(press, ellipse(24, -3, 9, 5), WHITE_SH);
        // the body: haunch, back, chest
        const BODY = [[-44, 0], [-52, -34], [-42, -70], [-18, -88], [10, -84], [30, -62], [36, -30], [32, 0]];
        put(press, (g) => smooth(g, BODY), FUR);
        // the haunch's round and a sheen along the back
        line(press, [[-44, -30], [-36, -60], [-14, -80], [8, -80]], taper(6, 0.2, 0.3), FUR_LT, { knock: false });
        line(press, Ph.sample([[-40, -8], [-48, -34], [-30, -46], [-8, -30], [-4, -6]], false, 5), taper(3), FUR_LT, { knock: false });
        // hind paw, white
        put(press, ellipse(-8, -3, 16, 6), WHITE);
        // the head: round skull, muzzle, ears; turned to what it looks at
        const la = Math.max(-0.5, Math.min(0.6, Math.atan2(lk[1] + 108, lk[0] - 24) * 0.4));
        press.save();
        press.each((g) => { g.translate(22, -104); g.rotate(la); g.translate(-22, 104); });
        const ears = o.ears ?? 0;
        put(press, (g) => poly(g, [[4, -118], [8 - ears * 10, -146 + ears * 16], [22, -124]]), FUR);
        put(press, (g) => poly(g, [[22, -124], [34 - ears * 6, -150 + ears * 18], [42, -120]]), FUR);
        put(press, (g) => poly(g, [[25, -126], [33 - ears * 6, -143 + ears * 16], [38, -123]]), { pink: 0.5, navy: 0.6 });
        put(press, (g) => smooth(g, [[0, -104], [4, -122], [24, -130], [44, -120], [54, -104], [50, -92], [34, -84], [12, -86]]), FUR);
        // the muzzle's white, the nose, whiskers
        put(press, (g) => smooth(g, [[40, -98], [54, -100], [56, -92], [46, -86], [36, -88]]), WHITE);
        put(press, (g) => poly(g, [[52, -101], [57, -101], [55, -97]]), { pink: 0.9, 'navy.s': 0.2 });
        for (const [dy, a] of [[-94, -0.1], [-91, 0.12], [-88, 0.3]]) line(press, [[50, dy], [50 + Math.cos(a) * 26, dy + Math.sin(a) * 26]], 1.2, WHITE_SH, { knock: false });
        // the eye: yellow, a slit pupil turned to its target (or shut)
        if (o.blink) line(press, [[34, -108], [40, -106], [46, -108]], 2.4, { yellow: 0.8, 'pink.s': 0.4 });
        else {
            put(press, ellipse(40, -108, 7, 5.5, -0.2), EYE);
            const px = 40 + Math.max(-2.5, Math.min(2.5, (lk[0] - 40) * 0.02)), py = -108 + Math.max(-1.5, Math.min(1.5, (lk[1] + 108) * 0.02));
            put(press, ellipse(px, py, 1.4, 4.4), { navy: 1, yellow: 1 });
            press.knockout(circle(px + 2, py - 2, 1.2));
        }
        press.restore();
        // the near front leg: down to the perch, or reaching out for o.paw
        let pw = [26, -2];
        if (o.paw) { const q = toL(o.paw); const d = Math.hypot(q[0] - 24, q[1] + 58); pw = d > 84 ? [24 + (q[0] - 24) * 84 / d, -58 + (q[1] + 58) * 84 / d] : q; }
        const elbow = [L(24, pw[0], 0.5) + 4, L(-58, pw[1], 0.5) + (o.paw ? -8 : 0)];
        line(press, [[24, -58], elbow, pw], taper(13, 0.2, 0.2), FUR);
        put(press, ellipse(pw[0] + 3, pw[1] - 1, 9, 6, o.paw ? Math.atan2(pw[1] + 58, pw[0] - 24) : 0), WHITE);
        press.restore();
    }
    const L = (a, b, k) => a + (b - a) * k;
    return { sit };
})();
