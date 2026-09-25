// Card «sunflower» (reference 8.75–9.0 s, full frame): a sunflower close-up with a bee on
// its petals, on a blue sky. Authored in reference pixels (G2.px), measured on the 8.8 s
// frame. Separations: sky = blue dots on paper; petals = yellow with pink dots (warm) and
// green outlines (navy + yellow), red veins (pink lines), back petals hatched in green;
// the disc = navy + yellow + blue (black-green) with the seeds knocked out of navy and blue
// and printed pink + yellow (red-orange) in a spiral; the bee = yellow + pink dots, navy
// stripes, paper wings with blue dots. Per drawing the wings buzz. Needs _group2-util.js.
var CARDS = CARDS || {};
CARDS.sunflower = (press, t, lf) => {
    const { T, px, poly, disc, ell, fillWith, inside, blob, blobPath, curve, taper, spline, speckle } = G2;
    const P = (ink, k) => press.plate(ink, k);
    const yellow = P('yellow'), yellowS = P('yellow', 'screen'), pink = P('pink'), pinkS = P('pink', 'screen');
    const blue = P('blue'), blueS = P('blue', 'screen'), navy = P('navy'), navyS = P('navy', 'screen');
    const d = Math.floor(t * 12 + 1e-6);
    const CX = 430, CY = 662, R = 305; // the disc
    const PD = typeof PRIVATE !== 'undefined' ? PRIVATE.sunflower : null; // ray scans (private/, gitignored)
    // a petal: a pointed leaf shape from its base (bx, by) along angle a, length L, width W
    const petalPts = (bx, by, a, L, W, bend = 0, tipK = 0.8) => {
        const c = Math.cos(a), s = Math.sin(a), Q = (u, v) => [bx + u * c - v * s, by + u * s + v * c], pts = [];
        const sh = (u) => Math.pow(Math.sin(Math.pow(u, tipK) * Math.PI), 0.75) * W / 2;
        for (let i = 0; i <= 16; i++) { const u = i / 16; pts.push(Q(u * L, sh(u) + bend * u * u * L)); }
        for (let i = 16; i >= 0; i--) { const u = i / 16; pts.push(Q(u * L, -sh(u) + bend * u * u * L)); }
        return { pts, Q };
    };
    const outline = (pts, w = 4) => { for (const [g, v] of [[navy, 0.6], [yellow, 1], [blue, 0.6]]) { g.save(); g.strokeStyle = T(v); g.lineWidth = w; g.lineJoin = 'round'; G2.path(g, pts); g.stroke(); g.restore(); } };
    // the camera pushes in ≈ 0.8 % a frame about (514, 514) px (frames 210 → 215: × 1.04)
    const f = lf ?? 2 * d + 0.5, zs = 1 + 0.008 * f;
    px(press, () => {
        press.save(); press.each((g) => { g.translate(514, 514); g.scale(zs, zs); g.translate(-514, -514); });
        // the sky: blue dots on paper (10.1 px lattice at 15°, measured), navy scratches
        G2.lat([10.1, 0.2594, 903.09, 625.5], () => 0.68, blue, [-60, -60, 1140, 1140]);
        pinkS.fillStyle = T(0.04); pinkS.fillRect(0, 0, 1080, 1080);
        curve(navy, [[640, 30], [720, 55], [800, 100]], 2, 0.5);
        // back petals: longer, hatched with green lines, a darker pink-dot shade at the base
        // (back petals show past the front ones at 0° (to r 549), 245° (516), 320° (621), 350° (420))
        // back petals: tips where the sky begins on the same rays (L = r − 244)
        const BE = PD?.be ?? [[0, 550], [40, 620], [60, 600], [136, 480], [220, 490], [264, 600], [312, 660], [330, 450], [360, 550]]; // (fallback: back tips, same rays)
        // rays that ran off the frame (60–130°, 140–212°: bottom and left) have no sky: long
        const beAt = (deg) => ((deg > 60 && deg < 130) || (deg > 140 && deg < 212) ? 700 : G2.lerpT(BE, deg));
        const back = [0, 23, 45, 67, 133, 155, 177, 199, 221, 243, 266, 290, 310, 330, 350].map((deg) => [deg * Math.PI / 180, Math.max(120, beAt(deg) - 224)]);
        for (const [a, L] of back) {
            const bx = CX + Math.cos(a) * R * 0.8, by = CY + Math.sin(a) * R * 0.8, { pts } = petalPts(bx, by, a, L, 90, 0, 0.66);
            press.knockout((g) => { G2.path(g, pts); g.fill(); });
            poly(yellow, pts, 1); poly(pinkS, pts, 0.06);
            if (Math.round(a * 57.3) % 5 === 0) poly(pink, pts, 0.5); // (some back petals are orange: pink on the yellow)
            inside(navy, (g) => G2.path(g, pts), (g) => {
                g.strokeStyle = T(0.95); g.lineWidth = 1.5;
                for (let k = -40; k <= 40; k++) { const u = k * 8.5; g.beginPath(); g.moveTo(bx + Math.cos(a + 0.6) * u - 300 * Math.cos(a - 0.97), by + Math.sin(a + 0.6) * u - 300 * Math.sin(a - 0.97)); g.lineTo(bx + Math.cos(a + 0.6) * u + 300 * Math.cos(a - 0.97), by + Math.sin(a + 0.6) * u + 300 * Math.sin(a - 0.97)); g.stroke(); }
            });
            inside(blue, (g) => G2.path(g, pts), (g) => { g.strokeStyle = T(0.6); g.lineWidth = 1.5; for (let k = -40; k <= 40; k++) { const u = k * 8.5; g.beginPath(); g.moveTo(bx + Math.cos(a + 0.6) * u - 300 * Math.cos(a - 0.97), by + Math.sin(a + 0.6) * u - 300 * Math.sin(a - 0.97)); g.lineTo(bx + Math.cos(a + 0.6) * u + 300 * Math.cos(a - 0.97), by + Math.sin(a + 0.6) * u + 300 * Math.sin(a - 0.97)); g.stroke(); } });
            outline(pts, 3.5);
        }
        // front petals: yellow, pink dots (denser at the base), green outline, red veins
        // front petals: tips from a ray scan of frame 210 every 10° (where the bright petal
        // ends, from the disc centre); angles in degrees, spaced ≈ 20–24°, lengths = tip − 259
        // (bright front petal: r > 205; hatched back petal: g ≥ r; sky: b > 115, 9 px blur;
        // 'off frame' rays set long)
        // (the scan lives in private/; fallback: front tips at r ≈ 440 ± 40, longer (≈ 560) at 232°, 256°, 320°)
        const FE = PD?.fe ?? [[0, 440], [60, 520], [130, 520], [180, 470], [232, 560], [244, 420], [256, 560], [280, 460], [320, 590], [340, 430], [360, 440]];
        const fe = (deg) => G2.lerpT(FE, ((deg % 360) + 360) % 360);
        const front = [12, 34, 56, 78, 100, 122, 144, 166, 188, 210, 232, 256, 280, 300, 320, 340].map((deg, i) => [deg * Math.PI / 180, Math.max(90, Math.max(fe(deg), beAt(deg) - 70) - 259), 0]).map(([a, L], i) => [a, L, Math.max(150, 0.58 * L) + ((i * 53) % 3) * 10]);
        // a second, lower layer of front petals between the first (they overlap in two layers,
        // the lower ones a little shorter and more shaded)
        const lower = front.map(([a, L, W]) => [a + 11 * Math.PI / 180, L * 0.88, W, true]);
        for (const [a, L, W, low] of [...lower, ...front]) {
            const bx = CX + Math.cos(a) * R * 0.85, by = CY + Math.sin(a) * R * 0.85, { pts, Q } = petalPts(bx, by, a, L, W, 0.03, 0.66);
            press.knockout((g) => { G2.path(g, pts); g.fill(); });
            poly(yellow, pts, 1);
            // (2× crop of frame 210) one half in red dots, the other lit (clean yellow), split by
            // a single red midrib a little off centre; the dots thin out towards the tip
            inside(pinkS, (g) => { G2.path(g, [Q(0, 0.02 * W), Q(L * 1.1, 0.02 * W), Q(L * 1.1, W), Q(0, W)]); }, (g) => { g.save(); g.beginPath(); G2.path(g, pts); g.clip(); g.fillStyle = Riso.radial(g, bx, by, 10, L, low ? 0.42 : 0.32, 0.04); g.fillRect(0, 0, 1080, 1080); g.restore(); });
            taper(pink, spline([Q(L * 0.12, W * 0.02), Q(L * 0.5, W * 0.05), Q(L * 0.85, W * 0.02)], 16), 4, 1);
            outline(pts, 4);
        }
        // the disc: black-green, the seeds knocked out and printed red-orange in a spiral
        const dk = (g) => g.arc(CX, CY, R, 0, 7);
        press.knockout((g) => { g.beginPath(); dk(g); g.fill(); });
        fillWith(navy, dk, T(0.85)); fillWith(yellow, dk, T(1)); fillWith(blue, dk, T(0.7));
        // seeds (1.1× crop, frame 212): golden-angle spirals ≈ 13 px apart, each an ellipse
        // ≈ 7 × 4.5 px along its spiral; red (pink on the yellow, the dark cleared) inside,
        // yellow and lime in the outer 60 px, a few green ones, dimmer towards the centre
        const seeds = [], rs = Motion.rng('seeds');
        for (let i = 12; i < 2400; i++) {
            const rr = 7.4 * Math.sqrt(i), a = i * 2.39996;
            if (rr > R - 10) break;
            const u = rs(), kind = rr > R - 60 ? (u < 0.55 ? 'y' : u < 0.8 ? 'l' : 'r') : u < 0.04 ? 'g' : u < 0.1 ? 'y' : 'r';
            const vis = rr < 70 ? 0.55 : 1;
            seeds.push([CX + Math.cos(a) * rr, CY + Math.sin(a) * rr, 2.2 + 1.4 * (rr / R), a + 1.2, rr, kind, vis * (0.75 + 0.25 * rs())]);
        }
        const seedPath = (c, want) => { c.beginPath(); for (const [x, y, r, a, rr, k, v] of seeds) if (want(k, v)) { c.moveTo(x + Math.cos(a) * r * 1.6, y + Math.sin(a) * r * 1.6); c.ellipse(x, y, r * 1.6, r, a, 0, 6.283); } };
        for (const g of [navy, blue]) inside(g, dk, (c) => { c.globalCompositeOperation = 'destination-out'; for (const lvl of [0.4, 0.7, 1]) { c.fillStyle = T(lvl); seedPath(c, (k, v) => Math.abs(v - lvl) < 0.16 || (lvl === 1 && v > 0.85)); c.fill(); } });
        inside(blue, dk, (c) => { c.fillStyle = T(0.9); seedPath(c, (k) => k === 'g'); c.fill(); c.fillStyle = T(0.35); seedPath(c, (k) => k === 'l'); c.fill(); });
        inside(pink, dk, (c) => { c.fillStyle = T(1); seedPath(c, (k) => k === 'r'); c.fill(); });
        // maroon clouds in the dark between the seeds (pink over the olive black)
        inside(pink, dk, (c) => { c.filter = 'blur(30px)'; c.fillStyle = T(0.45); for (const [x, y, rx, ry] of [[300, 560, 90, 70], [520, 620, 80, 110], [360, 820, 120, 60], [560, 830, 70, 60], [250, 720, 60, 80]]) { c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, 7); c.fill(); } c.filter = 'none'; });
        // the centre is darker (fewer seeds show): navy back over the middle
        inside(navy, dk, (g) => { g.fillStyle = Riso.radial(g, CX + 30, CY + 20, 30, 200, 0.5, 0); g.fillRect(0, 0, 1080, 1080); });
        // the yellow rim crescents, top left
        for (const [r, w, a0, a1] of [[R - 8, 13, 3.25, 4.95], [R - 30, 4, 3.6, 4.6]]) {
            for (const g of [navy, blue]) inside(g, dk, (c) => { c.globalCompositeOperation = 'destination-out'; c.strokeStyle = T(1); c.lineWidth = w + 2; c.beginPath(); c.arc(CX, CY, r, a0, a1); c.stroke(); });
            inside(pink, dk, (c) => { c.globalCompositeOperation = 'destination-out'; c.strokeStyle = T(1); c.lineWidth = w + 2; c.beginPath(); c.arc(CX, CY, r, a0, a1); c.stroke(); });
        }
        // the bee (on the petals, top right)
        const BX = 693, BY = 335, ba = -0.57; // (1.2× grid crop of frame 210: thorax (693, 335) r ≈ 62, abdomen tip (914, 192)) // thorax centre, body axis (towards the abdomen)
        const c = Math.cos(ba), s = Math.sin(ba), B = (u, v) => [BX + u * c - v * s, BY + u * s + v * c];
        // legs: dark green strokes
        for (const pts of [[B(-10, 20), B(-60, 90), B(-150, 120)], [B(20, 30), B(0, 120), B(-40, 190)], [B(40, 20), B(90, 110), B(80, 200)], [B(-20, -30), B(-80, -90), B(-150, -80)]]) for (const [g, v] of [[navy, 0.9], [yellow, 1]]) taper(g, spline(pts, 12), 9, v);
        // abdomen: yellow + pink dots, navy stripes, a dark tip
        const abd = [B(50, -62), B(130, -75), B(210, -70), B(258, -32), B(265, 18), B(228, 62), B(140, 72), B(60, 55), B(42, 0)];
        press.knockout((g) => { g.beginPath(); blobPath(g, abd); g.fill(); });
        blob(yellow, abd, 1); blob(pinkS, abd, 0.3);
        inside(navy, (g) => blobPath(g, abd), (g) => { g.fillStyle = T(0.9); for (const u of [100, 160, 222]) { G2.path(g, [B(u - 18, -120), B(u + 18, -120), B(u + 26, 120), B(u - 10, 120)]); g.fill(); } g.fillRect(0, 0, 0, 0); g.beginPath(); g.fillStyle = T(0.7); g.moveTo(...B(285, -80)); g.lineTo(...B(330, -40)); g.lineTo(...B(330, 60)); g.lineTo(...B(285, 70)); g.fill(); });
        inside(navy, (g) => blobPath(g, abd), (g) => { g.globalCompositeOperation = 'destination-out'; speckle(g, 'bee', BX - 100, BY - 250, BX + 300, BY + 100, 90, 1, 3, 0.9); });
        // thorax: fuzzy orange (yellow + pink dots), darker underside
        press.knockout((g) => { g.beginPath(); g.arc(BX, BY, 72, 0, 7); g.fill(); });
        disc(yellow, BX, BY, 72, 1); disc(pinkS, BX, BY, 72, 0.42);
        inside(navyS, (g) => g.arc(BX, BY, 72, 0, 7), (g) => { g.fillStyle = Riso.radial(g, BX - 30, BY + 30, 10, 90, 0.45, 0); g.fillRect(0, 0, 1080, 1080); });
        for (let k = 0; k < 40; k++) { const a = k * 0.157, r0 = 64; taper(pink, [[BX + Math.cos(a) * r0, BY + Math.sin(a) * r0], [BX + Math.cos(a) * (r0 + 10), BY + Math.sin(a) * (r0 + 10)]], 3, 0.6); }
        // head: dark with a red eye
        const HX = BX - 50, HY = BY + 100;
        press.knockout((g) => { g.beginPath(); g.ellipse(HX, HY, 50, 44, ba, 0, 7); g.fill(); });
        for (const [g, v] of [[navy, 0.9], [yellow, 1], [blue, 0.4]]) ell(g, HX, HY, 50, 44, ba, v);
        for (const g of [navy, blue]) { g.save(); g.globalCompositeOperation = 'destination-out'; g.fillStyle = T(1); g.beginPath(); g.ellipse(HX - 18, HY + 8, 20, 30, 0.4, 0, 7); g.fill(); g.restore(); }
        ell(pink, HX - 18, HY + 8, 20, 30, 0.4, 0.9);
        ell(navyS, HX - 18, HY + 8, 20, 30, 0.4, 0.4);
        for (const pts of [[[HX - 30, HY - 20], [HX - 80, HY - 70], [HX - 120, HY - 80]], [[HX - 10, HY - 30], [HX - 40, HY - 90], [HX - 60, HY - 130]]]) for (const [g, v] of [[navy, 0.9], [yellow, 1]]) curve(g, pts, 4, v);
        // wings: paper, a blue outline, blue dots on the inner half; they buzz per drawing
        const buzz = 0; // (the wings hold still through the card)
        const wing = (x, y, a, L, W) => {
            const { pts, Q } = petalPts(x, y, a, L, W);
            press.knockout((g) => { G2.path(g, pts); g.fill(); });
            inside(blueS, (g) => G2.path(g, pts), (g) => { g.fillStyle = T(0.4); G2.path(g, [Q(0, -W * 0.05), Q(L, -W * 0.05), Q(L, -W * 0.3), Q(0, -W * 0.3)]); g.fill(); });
            outline(pts, 3.5);
            curve(blue, [Q(L * 0.1, 0), Q(L * 0.5, W * 0.05), Q(L * 0.9, W * 0.1)], 2, 0.8);
        };
        // (bases and tips read off the grid crop: 677,275 → 752,54 · 693,275 → 772,129 ·
        // 756,375 → 1022,321 · 785,367 → 952,300)
        wing(677, 275, -1.243, 233, 82);
        wing(693, 275, -1.075, 166, 46);
        wing(756, 375, -0.2, 271, 104);
        wing(785, 367, -0.382, 180, 62);
        press.restore();
    });
};
