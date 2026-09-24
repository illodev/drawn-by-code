// Card «sunflower» (reference 8.75–9.0 s, full frame): a sunflower close-up with a bee on
// its petals, on a blue sky. Authored in reference pixels (G2.px), measured on the 8.8 s
// frame. Separations: sky = blue dots on paper; petals = yellow with pink dots (warm) and
// green outlines (navy + yellow), red veins (pink lines), back petals hatched in green;
// the disc = navy + yellow + blue (black-green) with the seeds knocked out of navy and blue
// and printed pink + yellow (red-orange) in a spiral; the bee = yellow + pink dots, navy
// stripes, paper wings with blue dots. Per drawing the wings buzz. Needs _group2-util.js.
var CARDS = CARDS || {};
CARDS.sunflower = (press, t) => {
    const { T, px, poly, disc, ell, fillWith, inside, blob, blobPath, curve, taper, spline, speckle } = G2;
    const P = (ink, k) => press.plate(ink, k);
    const yellow = P('yellow'), yellowS = P('yellow', 'screen'), pink = P('pink'), pinkS = P('pink', 'screen');
    const blue = P('blue'), blueS = P('blue', 'screen'), navy = P('navy'), navyS = P('navy', 'screen');
    const d = Math.floor(t * 12 + 1e-6);
    const CX = 430, CY = 662, R = 305; // the disc
    // a petal: a pointed leaf shape from its base (bx, by) along angle a, length L, width W
    const petalPts = (bx, by, a, L, W, bend = 0, tipK = 0.8) => {
        const c = Math.cos(a), s = Math.sin(a), Q = (u, v) => [bx + u * c - v * s, by + u * s + v * c], pts = [];
        const sh = (u) => Math.pow(Math.sin(Math.pow(u, tipK) * Math.PI), 0.75) * W / 2;
        for (let i = 0; i <= 16; i++) { const u = i / 16; pts.push(Q(u * L, sh(u) + bend * u * u * L)); }
        for (let i = 16; i >= 0; i--) { const u = i / 16; pts.push(Q(u * L, -sh(u) + bend * u * u * L)); }
        return { pts, Q };
    };
    const outline = (pts, w = 4) => { for (const [g, v] of [[navy, 0.6], [yellow, 1], [blue, 0.6]]) { g.save(); g.strokeStyle = T(v); g.lineWidth = w; g.lineJoin = 'round'; G2.path(g, pts); g.stroke(); g.restore(); } };
    px(press, () => {
        // the sky: blue dots on paper, a couple of navy scratches
        blueS.fillStyle = T(0.55); blueS.fillRect(0, 0, 1080, 1080);
        pinkS.fillStyle = T(0.04); pinkS.fillRect(0, 0, 1080, 1080);
        curve(navy, [[640, 30], [720, 55], [800, 100]], 2, 0.5);
        // back petals: longer, hatched with green lines, a darker pink-dot shade at the base
        const back = [[-2.05, 360], [-1.7, 380], [-1.35, 370], [-1.0, 350], [-2.45, 330], [-2.85, 320], [0.2, 420], [0.5, 400], [0.85, 380], [3.1, 300], [2.7, 300], [1.2, 350]];
        for (const [a, L] of back) {
            const bx = CX + Math.cos(a) * R * 0.8, by = CY + Math.sin(a) * R * 0.8, { pts } = petalPts(bx, by, a, L, 120);
            press.knockout((g) => { G2.path(g, pts); g.fill(); });
            poly(yellow, pts, 1); poly(pinkS, pts, 0.06);
            inside(navy, (g) => G2.path(g, pts), (g) => {
                g.strokeStyle = T(0.5); g.lineWidth = 2;
                for (let k = -14; k <= 14; k++) { const u = k * 9; g.beginPath(); g.moveTo(bx + Math.cos(a + 1.2) * u - 200 * Math.cos(a), by + Math.sin(a + 1.2) * u - 200 * Math.sin(a)); g.lineTo(bx + Math.cos(a + 1.2) * u + 500 * Math.cos(a), by + Math.sin(a + 1.2) * u + 500 * Math.sin(a)); g.stroke(); }
            });
            inside(blue, (g) => G2.path(g, pts), (g) => { g.strokeStyle = T(0.6); g.lineWidth = 2; for (let k = -14; k <= 14; k++) { const u = k * 9; g.beginPath(); g.moveTo(bx + Math.cos(a + 1.2) * u - 200 * Math.cos(a), by + Math.sin(a + 1.2) * u - 200 * Math.sin(a)); g.lineTo(bx + Math.cos(a + 1.2) * u + 500 * Math.cos(a), by + Math.sin(a + 1.2) * u + 500 * Math.sin(a)); g.stroke(); } });
            outline(pts, 3.5);
        }
        // front petals: yellow, pink dots (denser at the base), green outline, red veins
        const front = [];
        for (let i = 0; i < 17; i++) front.push([-2.9 + i * (Math.PI * 2 / 17) + (i % 2) * 0.05, 262 + ((i * 37) % 5) * 12, 180 + ((i * 53) % 3) * 14]);
        for (const [a, L, W] of front) {
            const bx = CX + Math.cos(a) * R * 0.85, by = CY + Math.sin(a) * R * 0.85, { pts, Q } = petalPts(bx, by, a, L, W, 0.03, 0.62);
            press.knockout((g) => { G2.path(g, pts); g.fill(); });
            poly(yellow, pts, 1);
            inside(pinkS, (g) => G2.path(g, pts), (g) => { g.fillStyle = Riso.radial(g, bx, by, 10, L * 0.8, 0.2, 0); g.fillRect(0, 0, 1080, 1080); });
            // veins
            for (const k of [-0.18, 0.02, 0.2]) curve(pink, [Q(L * 0.15, W * k * 0.6), Q(L * 0.5, W * k), Q(L * 0.8, W * k * 0.7)], 2, 0.9);
            // a lit sliver along one edge: pink cleared
            inside(pinkS, (g) => G2.path(g, pts), (g) => { g.globalCompositeOperation = 'destination-out'; g.fillStyle = T(1); G2.path(g, [Q(L * 0.2, -W * 0.5), Q(L * 0.9, -W * 0.15), Q(L * 0.9, -W * 0.05), Q(L * 0.2, -W * 0.3)]); g.fill(); });
            outline(pts, 4);
        }
        // the disc: black-green, the seeds knocked out and printed red-orange in a spiral
        const dk = (g) => g.arc(CX, CY, R, 0, 7);
        press.knockout((g) => { g.beginPath(); dk(g); g.fill(); });
        fillWith(navy, dk, T(0.85)); fillWith(yellow, dk, T(1)); fillWith(blue, dk, T(0.7));
        const seeds = [];
        for (let i = 20; i < 1300; i++) {
            const rr = 9.6 * Math.sqrt(i), a = i * 2.39996;
            if (rr > R - 8) break;
            seeds.push([CX + Math.cos(a) * rr, CY + Math.sin(a) * rr, 2.6 + 2.8 * (rr / R), a, rr]);
        }
        for (const g of [navy, blue]) inside(g, dk, (c) => { c.globalCompositeOperation = 'destination-out'; c.fillStyle = T(0.9); for (const [x, y, r, a] of seeds) { c.beginPath(); c.ellipse(x, y, r * 1.3, r * 0.9, a, 0, 7); c.fill(); } });
        inside(pink, dk, (c) => { c.fillStyle = T(1); for (const [x, y, r, a, rr] of seeds) { c.globalAlpha = rr > R * 0.9 ? 0.3 : rr > R * 0.75 ? 0.75 : 1; if (rr > R - 30 && (a % 6.283) > 2.6) continue; c.beginPath(); c.ellipse(x, y, r * 1.3, r * 0.9, a, 0, 7); c.fill(); } });
        // the centre is darker (fewer seeds show): navy back over the middle
        inside(navy, dk, (g) => { g.fillStyle = Riso.radial(g, CX + 30, CY + 20, 30, 200, 0.9, 0); g.fillRect(0, 0, 1080, 1080); });
        // the yellow rim crescents, top left
        for (const [r, w, a0, a1] of [[R - 8, 13, 3.25, 4.95], [R - 30, 4, 3.6, 4.6]]) {
            for (const g of [navy, blue]) inside(g, dk, (c) => { c.globalCompositeOperation = 'destination-out'; c.strokeStyle = T(1); c.lineWidth = w + 2; c.beginPath(); c.arc(CX, CY, r, a0, a1); c.stroke(); });
            inside(pink, dk, (c) => { c.globalCompositeOperation = 'destination-out'; c.strokeStyle = T(1); c.lineWidth = w + 2; c.beginPath(); c.arc(CX, CY, r, a0, a1); c.stroke(); });
        }
        // the bee (on the petals, top right)
        const BX = 690, BY = 378, ba = -0.62; // thorax centre, body axis (towards the abdomen)
        const c = Math.cos(ba), s = Math.sin(ba), B = (u, v) => [BX + u * c - v * s, BY + u * s + v * c];
        // legs: dark green strokes
        for (const pts of [[B(-10, 20), B(-60, 90), B(-150, 120)], [B(20, 30), B(0, 120), B(-40, 190)], [B(40, 20), B(90, 110), B(80, 200)], [B(-20, -30), B(-80, -90), B(-150, -80)]]) for (const [g, v] of [[navy, 0.9], [yellow, 1]]) taper(g, spline(pts, 12), 9, v);
        // abdomen: yellow + pink dots, navy stripes, a dark tip
        const abd = [B(50, -75), B(140, -95), B(240, -88), B(300, -40), B(305, 25), B(255, 80), B(150, 90), B(60, 65), B(40, 0)];
        press.knockout((g) => { g.beginPath(); blobPath(g, abd); g.fill(); });
        blob(yellow, abd, 1); blob(pinkS, abd, 0.3);
        inside(navy, (g) => blobPath(g, abd), (g) => { g.fillStyle = T(0.9); for (const u of [105, 175, 245]) { G2.path(g, [B(u - 18, -120), B(u + 18, -120), B(u + 26, 120), B(u - 10, 120)]); g.fill(); } g.fillRect(0, 0, 0, 0); g.beginPath(); g.fillStyle = T(0.7); g.moveTo(...B(285, -80)); g.lineTo(...B(330, -40)); g.lineTo(...B(330, 60)); g.lineTo(...B(285, 70)); g.fill(); });
        inside(navy, (g) => blobPath(g, abd), (g) => { g.globalCompositeOperation = 'destination-out'; speckle(g, 'bee', BX - 100, BY - 250, BX + 300, BY + 100, 90, 1, 3, 0.9); });
        // thorax: fuzzy orange (yellow + pink dots), darker underside
        press.knockout((g) => { g.beginPath(); g.arc(BX, BY, 72, 0, 7); g.fill(); });
        disc(yellow, BX, BY, 72, 1); disc(pinkS, BX, BY, 72, 0.42);
        inside(navyS, (g) => g.arc(BX, BY, 72, 0, 7), (g) => { g.fillStyle = Riso.radial(g, BX - 30, BY + 30, 10, 90, 0.45, 0); g.fillRect(0, 0, 1080, 1080); });
        for (let k = 0; k < 40; k++) { const a = k * 0.157, r0 = 64; taper(pink, [[BX + Math.cos(a) * r0, BY + Math.sin(a) * r0], [BX + Math.cos(a) * (r0 + 10), BY + Math.sin(a) * (r0 + 10)]], 3, 0.6); }
        // head: dark with a red eye
        const HX = BX - 45, HY = BY + 72;
        press.knockout((g) => { g.beginPath(); g.ellipse(HX, HY, 50, 44, ba, 0, 7); g.fill(); });
        for (const [g, v] of [[navy, 0.9], [yellow, 1], [blue, 0.4]]) ell(g, HX, HY, 50, 44, ba, v);
        for (const g of [navy, blue]) { g.save(); g.globalCompositeOperation = 'destination-out'; g.fillStyle = T(1); g.beginPath(); g.ellipse(HX - 18, HY + 8, 20, 30, 0.4, 0, 7); g.fill(); g.restore(); }
        ell(pink, HX - 18, HY + 8, 20, 30, 0.4, 0.9);
        ell(navyS, HX - 18, HY + 8, 20, 30, 0.4, 0.4);
        for (const pts of [[[HX - 30, HY - 20], [HX - 80, HY - 70], [HX - 120, HY - 80]], [[HX - 10, HY - 30], [HX - 40, HY - 90], [HX - 60, HY - 130]]]) for (const [g, v] of [[navy, 0.9], [yellow, 1]]) curve(g, pts, 4, v);
        // wings: paper, a blue outline, blue dots on the inner half; they buzz per drawing
        const buzz = [0, 0.08, -0.04, 0.05][d % 4];
        const wing = (x, y, a, L, W) => {
            const { pts, Q } = petalPts(x, y, a, L, W);
            press.knockout((g) => { G2.path(g, pts); g.fill(); });
            inside(blueS, (g) => G2.path(g, pts), (g) => { g.fillStyle = T(0.4); G2.path(g, [Q(0, 0), Q(L, 0), Q(L, W), Q(0, W)]); g.fill(); });
            outline(pts, 3.5);
            curve(blue, [Q(L * 0.1, 0), Q(L * 0.5, W * 0.05), Q(L * 0.9, W * 0.1)], 2, 0.8);
        };
        wing(BX - 5, BY - 60, -1.42 + buzz, 280, 110);
        wing(BX + 25, BY - 55, -1.22 + buzz, 230, 72);
        wing(BX + 75, BY + 20, -0.1 - buzz, 280, 105);
        wing(BX + 70, BY + 0, -0.3 - buzz, 240, 70);
    });
};
