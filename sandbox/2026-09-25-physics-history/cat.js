// The film's cat, the running gag of physics-history: the same black cat with white paws and a
// white tail tip turns up in every scene, and in the last one it is Schrödinger's. Global: Cat.
//
//   Cat.sit(press, o)   sitting side-on on a perch, facing o.face (1 right, -1 left)
//     o: { x, y (the perch under its hind paws), s (scale: 1 = 100 units tall), face,
//          paw: [x, y] (world point its near front paw reaches for, or null), look: [x, y]
//          (world point it looks at), blink, tail (0..1 swish phase), ears (0..1 flatten) }
//
// Local units: the hind paws at (0, 0), the head's top at y ≈ -130, facing +x.
//   Cat.curl, Cat.run, Cat.dead (on its back, X eyes): see each below.
const Cat = (() => {
    const { put, ink, line, smooth, poly, taper, circle, ellipse } = Ph;
    const C = { FUR: { navy: 1, yellow: 0.9, 'pink.s': 0.45 }, FUR_LT: { navy: 1, 'yellow.s': 0.5, 'blue.s': 0.45, 'pink.s': 0.3 },
        WHITE: { 'blue.s': 0.06, 'yellow.s': 0.05 }, WHITE_SH: { 'blue.s': 0.3, 'navy.s': 0.12 }, EYE: { yellow: 1, 'blue.s': 0.45 } };

    // o.rim: { d: [dx, dy] (screen offset towards the light), spec }: a lit edge round its
    // silhouette on the light's side (the whole cat printed once in the rim's ink, shifted, under it)
    function sit(press, o) {
        if (o.rim) sit1(press, { ...o, x: o.x + o.rim.d[0], y: o.y + o.rim.d[1], flat: o.rim.spec, rim: null });
        sit1(press, o);
    }
    function sit1(press, o) {
        const fl = o.flat, FUR = fl ?? C.FUR, FUR_LT = fl ?? C.FUR_LT, WHITE = fl ?? C.WHITE, WHITE_SH = fl ?? C.WHITE_SH, EYE = fl ?? C.EYE;
        const f = o.face ?? 1, s = o.s ?? 1;
        const toL = (p) => [(p[0] - o.x) / (s * f), (p[1] - o.y) / s];
        press.save();
        press.each((g) => { g.translate(o.x, o.y); g.scale(s * f, s); });
        const tl = o.tail ?? 0, lk = o.look ? toL(o.look) : [80, -100];
        // the tail: from the rump round along the perch behind, its tip white and flicking
        const T = [[-28, -8], [-62, -4], [-98, -12 - 14 * Math.sin(tl * 6.28)], [-112, -34 - 10 * Math.sin(tl * 6.28 + 1)]];
        line(press, Ph.sample(T, false, 6), taper(13, 0.1, 0.5), FUR);
        const tip = Ph.sample(T, false, 6), n = tip.length;
        line(press, tip.slice(n - 4), taper(9, 0.2, 0.6), WHITE);
        // the far front leg (straight, to the perch)
        line(press, [[18, -48], [20, -20], [22, -2]], taper(12, 0.2, 0.2), FUR_LT);
        put(press, ellipse(24, -3, 9, 5), WHITE_SH);
        // the body: haunch, back, chest
        // (up to the neck, under the head, so the head never floats free of it)
        const BODY = [[-32, 0], [-38, -32], [-30, -68], [-12, -92], [2, -104], [24, -106], [38, -92], [30, -62], [28, -30], [24, 0]];
        if (o.spiky && !fl) { const P = Ph.sample(BODY, true, 6); for (let i = 0; i < P.length; i += 2) { const q = P[i], c = [0, -50], d = Math.hypot(q[0] - c[0], q[1] - c[1]) || 1; line(press, [q, [q[0] + (q[0] - c[0]) / d * 14 * o.spiky, q[1] + (q[1] - c[1]) / d * 14 * o.spiky]], taper(7, 0.1, 0.9), FUR); } }
        put(press, (g) => smooth(g, BODY), FUR);
        // the haunch's round and a sheen along the back
        line(press, [[-34, -30], [-28, -60], [-10, -82], [8, -84]], taper(6, 0.2, 0.3), FUR_LT, { knock: false });
        line(press, Ph.sample([[-30, -8], [-36, -32], [-22, -44], [-6, -30], [-2, -6]], false, 5), taper(3), FUR_LT, { knock: false });
        // hind paw, white
        put(press, ellipse(-4, -3, 13, 5), WHITE);
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
    // curled up asleep on a shelf, side-on: a round loaf of fur, the head tucked on its front
    // paws, the tail wrapped round, eyes shut; it breathes. o: { x, y (the shelf under it),
    // s, face, t, rim }. Local units: 220 long, 90 tall, the shelf at y = 0.
    function curl(press, o) {
        const f = o.face ?? 1, s = o.s ?? 1, al = o.alarm ?? 0, br = (1 + 0.03 * Math.sin((o.t ?? 0) * 2.4) * (1 - al)) * (1 + 0.45 * al);
        press.save();
        press.each((g) => { g.translate(o.x, o.y); g.scale(s * f, s); });
        const FUR = C.FUR, FUR_LT = C.FUR_LT, WHITE = C.WHITE, WHITE_SH = C.WHITE_SH;
        // the tail: wrapped round the front asleep; straight up and bristling when startled
        const TT = al > 0 ? [[-96, -30], [-116, -70], [-120, -120 - 20 * al], [-112, -160 - 20 * al]] : [[-96, -10], [-60, 4], [20, 6], [80, 0], [104, -10]];
        line(press, Ph.sample(TT, false, 6), taper(16 + 8 * al, 0.1, 0.5), FUR);
        const tt = Ph.sample(TT, false, 6);
        line(press, tt.slice(tt.length - 4), taper(11, 0.2, 0.6), WHITE);
        // the body: a loaf rising and falling with its breath; arched high, fur on end, if startled
        const B = [[-104, 0], [-110, -40 * br], [-70, -82 * br], [0, -92 * br], [60, -74 * br], [80, -40], [70, 0]];
        if (al > 0) { const P = Ph.sample(B, true, 6); for (let i = 0; i < P.length; i += 2) { const q = P[i]; if (q[1] > -6) continue; const c = [-10, -20], d = Math.hypot(q[0] - c[0], q[1] - c[1]) || 1; line(press, [q, [q[0] + (q[0] - c[0]) / d * 18 * al, q[1] + (q[1] - c[1]) / d * 18 * al]], taper(8, 0.1, 0.9), i % 4 ? FUR : FUR_LT); } }
        put(press, (g) => smooth(g, B), FUR);
        line(press, [[-96, -52 * br], [-60, -80 * br], [0, -88 * br], [44, -78 * br]], taper(6, 0.2, 0.3), FUR_LT, { knock: false });
        // the head: resting on the front paws asleep, up and staring when startled
        const hy = -30 * al;
        put(press, (g) => poly(g, [[52, -64 + hy], [58 - 6 * al, -94 + hy + 10 * al], [72, -70 + hy]]), FUR);
        put(press, (g) => poly(g, [[74, -70 + hy], [88 + 4 * al, -96 + hy + 12 * al], [94, -64 + hy]]), FUR);
        put(press, (g) => smooth(g, [[46, -30 + hy], [48, -58 + hy], [70, -72 + hy], [96, -64 + hy], [108, -40 + hy], [100, -22 + hy], [74, -16 + hy]]), FUR);
        put(press, (g) => smooth(g, [[92, -38 + hy], [108, -40 + hy], [110, -30 + hy], [98, -24 + hy]]), WHITE);
        if (al > 0) { put(press, circle(86, -46 + hy, 7), C.EYE); put(press, circle(88, -46 + hy, 3), { navy: 1, yellow: 1 }); press.knockout(circle(89, -48 + hy, 1.2)); }
        else line(press, [[78, -46], [86, -44], [94, -47]], 2.4, FUR_LT);
        put(press, ellipse(86, -8, 22, 7), WHITE);
        put(press, ellipse(60, -6, 18, 6), WHITE_SH);
        press.restore();
    }
    // running flat out (a gallop), side-on, facing o.face; o.ph: the stride's phase (0..1),
    // o: { x, y (the ground under it), s, face, ph, pounce (0..1: leaping, front paws up) }
    function run(press, o) {
        const f = o.face ?? 1, s = o.s ?? 1, ph = (o.ph ?? 0) * 6.2832, pc = o.pounce ?? 0;
        press.save();
        press.each((g) => { g.translate(o.x, o.y); g.scale(s * f, s); g.rotate(-0.35 * pc); });
        const FUR = C.FUR, FUR_LT = C.FUR_LT, WHITE = C.WHITE;
        const ext = Math.sin(ph), lift = -30 - 10 * Math.abs(Math.cos(ph)) - 40 * pc;
        const leg = (hip, a, len, far) => {
            const knee = [hip[0] + Math.cos(a) * len * 0.5, hip[1] + Math.sin(a) * len * 0.5 + 6];
            const paw = [hip[0] + Math.cos(a) * len, hip[1] + Math.sin(a) * len];
            line(press, [hip, knee, paw], taper(12, 0.2, 0.2), far ? FUR_LT : FUR);
            put(press, ellipse(paw[0] + 3, paw[1], 8, 5), WHITE);
        };
        // far legs first
        leg([-50, lift + 6], Math.PI / 2 - 0.9 * ext, 50, true);
        leg([34, lift + 4], Math.PI / 2 + 0.9 * ext - 0.3 * pc, 46, true);
        // the tail streaming behind, its tip white
        const T = [[-60, lift - 6], [-96, lift - 16 - 6 * Math.sin(ph)], [-130, lift - 20 - 10 * Math.sin(ph + 1)]];
        line(press, Ph.sample(T, false, 6), taper(12, 0.1, 0.5), FUR);
        line(press, [T[1], T[2]].map(([x, y], i) => i ? [x, y] : [(x + T[2][0]) / 2, (y + T[2][1]) / 2]), taper(9, 0.2, 0.6), WHITE);
        // the body, stretched long, the back flexing with the stride
        const flex = 8 * Math.cos(ph);
        const B = [[-66, lift - 4], [-40, lift - 30 - flex], [10, lift - 34 - flex], [46, lift - 24], [56, lift], [30, lift + 18], [-30, lift + 18]];
        put(press, (g) => smooth(g, B), FUR);
        line(press, [[-56, lift - 16], [-20, lift - 30 - flex], [30, lift - 28 - flex]], taper(5, 0.2, 0.3), FUR_LT, { knock: false });
        // the head forward, ears back a little, the eye on its quarry
        const H = [70, lift - 24];
        put(press, (g) => poly(g, [[H[0] - 10, H[1] - 14], [H[0] - 16, H[1] - 38], [H[0], H[1] - 20]]), FUR);
        put(press, (g) => poly(g, [[H[0] + 2, H[1] - 20], [H[0] + 4, H[1] - 42], [H[0] + 16, H[1] - 18]]), FUR);
        put(press, (g) => smooth(g, [[H[0] - 20, H[1] + 4], [H[0] - 18, H[1] - 18], [H[0], H[1] - 24], [H[0] + 22, H[1] - 14], [H[0] + 28, H[1]], [H[0] + 10, H[1] + 12]]), FUR);
        put(press, (g) => smooth(g, [[H[0] + 16, H[1] - 4], [H[0] + 30, H[1] - 2], [H[0] + 28, H[1] + 6], [H[0] + 16, H[1] + 8]]), WHITE);
        put(press, ellipse(H[0] + 10, H[1] - 10, 5, 4, -0.2), C.EYE);
        put(press, ellipse(H[0] + 12, H[1] - 10, 1.4, 3.6), { navy: 1, yellow: 1 });
        // near legs
        leg([-44, lift + 8], Math.PI / 2 + 0.9 * ext, 52, false);
        leg([40, lift + 6], Math.PI / 2 - 0.9 * ext - 1.1 * pc, 48, false);
        press.restore();
    }
    // «dead» (the cartoon kind): on its back, belly up, the four legs stiff in the air, X eyes,
    // the tongue out, the tail limp along the floor. o: { x, y (the floor), s, face }.
    // Local units: 200 long, the floor at y = 0, the head at +x.
    function dead(press, o) {
        const f = o.face ?? 1, s = o.s ?? 1;
        press.save();
        press.each((g) => { g.translate(o.x, o.y); g.scale(s * f, s); });
        const FUR = C.FUR, FUR_LT = C.FUR_LT, WHITE = C.WHITE, WHITE_SH = C.WHITE_SH;
        // the tail, limp, its white tip
        const T = [[-70, -8], [-104, -4], [-136, -4], [-156, -8]];
        line(press, Ph.sample(T, false, 6), taper(12, 0.1, 0.5), FUR);
        line(press, [T[2], T[3]], taper(9, 0.2, 0.6), WHITE);
        // the far legs up, then the body on its back, the belly's paler fur on top
        for (const [x, a] of [[-42, -1.75], [38, -1.4]]) { const pw = [x + Math.cos(a) * 62, -40 + Math.sin(a) * 62]; line(press, [[x, -40], pw], taper(19, 0.3, 0.15), FUR_LT); put(press, ellipse(pw[0], pw[1] - 2, 9, 7), WHITE_SH); }
        const B = [[-78, 0], [-86, -26], [-56, -52], [0, -58], [52, -48], [72, -20], [64, 0]];
        put(press, (g) => smooth(g, B), FUR);
        put(press, (g) => smooth(g, [[-50, -46], [0, -54], [44, -44], [20, -36], [-30, -38]]), FUR_LT, { knock: false });
        for (const [x, a] of [[-54, -1.9], [30, -1.5]]) { const pw = [x + Math.cos(a) * 70, -44 + Math.sin(a) * 70]; line(press, [[x, -44], pw], taper(21, 0.3, 0.15), FUR); put(press, ellipse(pw[0], pw[1] - 2, 10, 8), WHITE); }
        // the head, upside down on the floor: ears pointing down, X eyes, the tongue out
        const H = [92, -26];
        put(press, (g) => poly(g, [[H[0] - 18, H[1] + 14], [H[0] - 24, H[1] + 34], [H[0] - 4, H[1] + 20]]), FUR);
        put(press, (g) => poly(g, [[H[0] + 4, H[1] + 22], [H[0] + 10, H[1] + 40], [H[0] + 22, H[1] + 16]]), FUR);
        put(press, (g) => smooth(g, [[H[0] - 26, H[1] + 6], [H[0] - 22, H[1] - 18], [H[0] + 2, H[1] - 28], [H[0] + 28, H[1] - 16], [H[0] + 30, H[1] + 8], [H[0] + 6, H[1] + 22]]), FUR);
        put(press, (g) => smooth(g, [[H[0] + 10, H[1] - 26], [H[0] + 30, H[1] - 24], [H[0] + 32, H[1] - 12], [H[0] + 14, H[1] - 12]]), WHITE);
        put(press, (g) => smooth(g, [[H[0] + 22, H[1] - 30], [H[0] + 30, H[1] - 34], [H[0] + 34, H[1] - 26], [H[0] + 26, H[1] - 22]]), { pink: 0.8, 'yellow.s': 0.2 });
        for (const ex of [H[0] - 8, H[0] + 12]) { const ey = H[1] - 4; line(press, [[ex - 5, ey - 5], [ex + 5, ey + 5]], 3, WHITE); line(press, [[ex - 5, ey + 5], [ex + 5, ey - 5]], 3, WHITE); }
        press.restore();
    }
    // the X-ray: the same cat (pose 'sit' as Cat.sit, 'dead' as Cat.dead, same local units)
    // seen through a radiograph: the body a faint glow, the skeleton bright. Drawn by knocking
    // the paper through the dark (so it only reads on a dark ground). o: { x, y, s, face, pose }
    function xray(press, o) {
        const f = o.face ?? 1, s = o.s ?? 1;
        press.save();
        press.each((g) => { g.translate(o.x, o.y); g.scale(s * f, s); });
        const glow = (pts, a) => press.knockout((g) => { smooth(g, pts); g.globalAlpha = a; g.fill(); g.globalAlpha = 1; });
        const bone = (pts, w, a = 0.9) => press.knockout((g) => { poly(g, Ph.outline(pts.length > 2 ? Ph.sample(pts, false, 5) : pts, typeof w === 'number' ? w : w)); g.globalAlpha = a; g.fill(); g.globalAlpha = 1; });
        const blob = (x, y, rx, ry, a = 0.9, r = 0) => press.knockout((g) => { g.beginPath(); g.ellipse(x, y, rx, ry, r, 0, 6.2832); g.globalAlpha = a; g.fill(); g.globalAlpha = 1; });
        const chain = (pts, n, r, a = 0.85) => { const P = Ph.sample(pts, false, 12), m = P.length - 1; for (let i = 0; i <= n; i++) { const k = i / n * m, j = Math.min(m - 1, Math.floor(k)), u = k - j, q = [P[j][0] + (P[j + 1][0] - P[j][0]) * u, P[j][1] + (P[j + 1][1] - P[j][1]) * u]; blob(q[0], q[1], r * (1 - 0.4 * i / n), r * 0.8 * (1 - 0.4 * i / n), a); } };
        if (o.pose === 'dead') {
            glow([[-78, 0], [-86, -26], [-56, -52], [0, -58], [52, -48], [72, -20], [64, 0]], 0.16);
            glow([[66, -20], [70, -44], [94, -54], [120, -42], [122, -18], [98, -4]], 0.16);
            // spine along the back (on the floor), ribs arching up, pelvis, legs straight up
            chain([[-70, -12], [-20, -16], [30, -16], [66, -20]], 14, 4.5);
            for (let i = 0; i < 7; i++) { const x = -6 + i * 9; bone([[x, -16], [x - 6, -34], [x + 2, -48]], 3.2, 0.7); }
            blob(-62, -20, 14, 9, 0.85, 0.3);
            for (const [x, a, len] of [[-54, -1.9, 70], [30, -1.5, 70], [-42, -1.75, 62], [38, -1.4, 62]]) {
                const k = [x + Math.cos(a) * len * 0.5, -40 + Math.sin(a) * len * 0.5], p2 = [x + Math.cos(a) * len, -40 + Math.sin(a) * len];
                bone([[x, -34], k], 7); bone([k, p2], 6); blob(k[0], k[1], 5, 5); blob(p2[0], p2[1] - 3, 7, 5, 0.8);
            }
            chain([[-70, -8], [-96, -6], [-108, -20], [-100, -34]], 12, 3.4, 0.75);
            // skull upside down: cranium, the eye's socket, the jaw
            blob(94, -28, 24, 20, 0.85);
            put(press, ellipse(100, -20, 7, 6), { navy: 0.9, blue: 0.6 });
            bone([[106, -44], [122, -34], [118, -18]], 4);
        } else {
            glow([[-32, 0], [-38, -32], [-30, -68], [-12, -92], [2, -104], [24, -106], [38, -92], [30, -62], [28, -30], [24, 0]], 0.16);
            glow([[0, -104], [4, -122], [24, -130], [44, -120], [54, -104], [50, -92], [34, -84], [12, -86]], 0.16);
            // spine up the back to the skull, the ribcage, pelvis, the legs, the tail
            chain([[-24, -14], [-32, -44], [-22, -76], [-2, -96], [12, -104]], 16, 4.2);
            for (let i = 0; i < 7; i++) { const y = -56 - i * 6; bone([[-26 + i * 2, y], [-6 + i * 2, y + 6], [14 + i, y + 2]], 3, 0.7); }
            blob(-20, -14, 13, 9, 0.85, -0.4);
            bone([[-20, -14], [6, -24]], 6); bone([[6, -24], [-22, -8]], 5); bone([[-22, -8], [-2, -3]], 4); blob(6, -24, 5, 5);
            bone([[20, -84], [22, -40]], 5.5); bone([[22, -40], [24, -4]], 4.5); blob(22, -40, 4.5, 4.5); blob(26, -3, 7, 4, 0.8);
            // (the tail wrapped round the front paws, as a sitting cat keeps it: inside the box)
            chain([[-28, -8], [-40, 4], [-6, 8], [30, 6], [48, -2]], 14, 3.4, 0.75);
            // the skull: a round cranium, the muzzle tapering forward, the jaw under it, the
            // eye's socket dark
            press.knockout((g) => { smooth(g, [[2, -104], [6, -124], [24, -130], [42, -122], [58, -104], [54, -96], [36, -94], [14, -92]]); g.globalAlpha = 0.85; g.fill(); g.globalAlpha = 1; });
            bone([[16, -92], [36, -90], [52, -94]], 4);
            put(press, ellipse(36, -110, 7, 6), { navy: 0.9, blue: 0.6 });
        }
        press.restore();
    }
    // peeking over an edge, face to the camera: the head, two front paws on the rim. The rim
    // at y = 0, the head rising above it by o.up (0..1). o: { x, y, s, up, blink, look: [dx, dy]
    // (−1..1, where the eyes turn; [0, 0] = straight at us) }
    function peek(press, o) {
        const s = o.s ?? 1, up = o.up ?? 1, lk = o.look ?? [0, 0];
        press.save();
        press.each((g) => { g.translate(o.x, o.y); g.scale(s, s); });
        const FUR = C.FUR, FUR_LT = C.FUR_LT, WHITE = C.WHITE, WHITE_SH = C.WHITE_SH;
        const hy = 20 - 92 * up;
        // (o.pawsOnly: just the paws, to lay them over a rim drawn after the head)
        if (o.pawsOnly) { for (const f of [-1, 1]) { put(press, (g) => smooth(g, [[f * 18, 4], [f * 22, -12], [f * 42, -14], [f * 48, 2], [f * 40, 10], [f * 20, 10]]), WHITE); for (const k of [26, 34, 41]) line(press, [[f * k, -10], [f * k, 0]], 1.4, WHITE_SH, { knock: false }); } press.restore(); return; }
        // the chest and neck, from the rim up to the head
        put(press, (g) => smooth(g, [[-40, 10], [-44, hy + 20], [0, hy + 10], [44, hy + 20], [40, 10]]), FUR);
        put(press, (g) => smooth(g, [[-14, 8], [-12, hy + 40], [0, hy + 34], [12, hy + 40], [14, 8]]), WHITE_SH);
        // ears, the head (wider than tall), cheeks' fur
        for (const f of [-1, 1]) {
            put(press, (g) => poly(g, [[f * 18, hy - 40], [f * 44, hy - 78], [f * 50, hy - 26]]), FUR);
            put(press, (g) => poly(g, [[f * 26, hy - 42], [f * 42, hy - 66], [f * 45, hy - 32]]), { pink: 0.5, navy: 0.6 });
        }
        put(press, (g) => smooth(g, [[-56, hy], [-50, hy - 36], [-24, hy - 56], [0, hy - 60], [24, hy - 56], [50, hy - 36], [56, hy], [46, hy + 24], [22, hy + 36], [0, hy + 38], [-22, hy + 36], [-46, hy + 24]]), FUR);
        line(press, [[-36, hy - 44], [0, hy - 54], [36, hy - 44]], taper(5, 0.3, 0.3), FUR_LT, { knock: false });
        // the white muzzle, the pink nose, the mouth, whiskers
        put(press, (g) => smooth(g, [[-20, hy + 6], [0, hy - 2], [20, hy + 6], [16, hy + 26], [0, hy + 30], [-16, hy + 26]]), WHITE);
        put(press, (g) => poly(g, [[-6, hy + 4], [6, hy + 4], [0, hy + 11]]), { pink: 0.9, 'navy.s': 0.2 });
        line(press, [[-8, hy + 18], [0, hy + 14], [8, hy + 18]], 2, WHITE_SH, { knock: false });
        // (whiskers knocked out to the paper so they show on the dark fur and the night)
        for (const f of [-1, 1]) for (const [dy, a] of [[8, -0.12], [13, 0.05], [18, 0.2]]) press.knockout((g) => { poly(g, Ph.outline([[f * 18, hy + dy], [f * (18 + Math.cos(a) * 44), hy + dy + Math.sin(a) * 44]], taper(2, 0.1, 0.8))); g.globalAlpha = 0.8; g.fill(); g.globalAlpha = 1; });
        // the eyes, big, yellow, slit pupils on us (or shut)
        for (const f of [-1, 1]) {
            const ex = f * 22, ey = hy - 16;
            if (o.blink) { line(press, [[ex - 10, ey], [ex, ey + 3], [ex + 10, ey]], 3, { yellow: 0.8, 'pink.s': 0.4 }); continue; }
            put(press, ellipse(ex, ey, 11, 9), C.EYE);
            put(press, ellipse(ex + lk[0] * 3, ey + lk[1] * 2, 2.6, 7.5), { navy: 1, yellow: 1 });
            press.knockout(circle(ex + lk[0] * 3 + 3, ey + lk[1] * 2 - 3, 1.8));
        }
        // the front paws over the rim
        for (const f of [-1, 1]) { put(press, (g) => smooth(g, [[f * 18, 4], [f * 22, -12], [f * 42, -14], [f * 48, 2], [f * 40, 10], [f * 20, 10]]), WHITE); for (const k of [26, 34, 41]) line(press, [[f * k, -10], [f * k, 0]], 1.4, WHITE_SH, { knock: false }); }
        press.restore();
    }
    const L = (a, b, k) => a + (b - a) * k;
    return { sit, curl, run, dead, xray, peek };
})();
