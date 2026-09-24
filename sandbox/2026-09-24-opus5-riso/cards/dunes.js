// Card «dunes» (reference 13.875–14.0 s, full frame). Desert dunes under a starry dusk: the sky
// runs blue → purple → pink → red (blue screen fading down, pink rising, yellow at the
// horizon), a milky way of yellow and pink specks with a dark dust lane, a comet, and dunes
// with orange lit faces (pink + yellow flat, ripple lines) and purple shadow faces (pink +
// blue), crests edged in yellow. Measured on the 13.88 s frame (px / 1.08 = units).
// Needs cards/_g6-util.js.
var CARDS = CARDS || {};
CARDS.dunes = (press, t) => {
    const R = Riso, T = R.tone, U = G6;
    const pinkS = press.plate('pink', 'screen'), pink = press.plate('pink');
    const blueS = press.plate('blue', 'screen'), blue = press.plate('blue');
    const navyS = press.plate('navy', 'screen'), navy = press.plate('navy');
    const yellowS = press.plate('yellow', 'screen'), yellow = press.plate('yellow');
    const d = Math.floor(t * 12 + 1e-6);
    const px = (v) => v / 1.08, P = (pts) => pts.map(([x, y]) => [x / 1.08, y / 1.08]);
    const vramp = (g, y0, y1, stops) => { const gr = g.createLinearGradient(0, y0, 0, y1); stops.forEach(([f, v]) => gr.addColorStop(f, T(v))); return gr; };

    // the sky
    blueS.fillStyle = vramp(blueS, 0, 520, [[0, 0.95], [0.3, 0.8], [0.6, 0.35], [1, 0]]); blueS.fillRect(0, 0, 1000, 700);
    blue.fillStyle = vramp(blue, 0, 300, [[0, 0.35], [1, 0]]); blue.fillRect(0, 0, 1000, 300);
    pinkS.fillStyle = vramp(pinkS, 0, 650, [[0, 0.15], [0.35, 0.55], [0.6, 0.85], [1, 0.9]]); pinkS.fillRect(0, 0, 1000, 700);
    navyS.fillStyle = vramp(navyS, 0, 450, [[0, 0.12], [0.5, 0.2], [1, 0]]); navyS.fillRect(0, 0, 1000, 450);
    yellowS.fillStyle = vramp(yellowS, 380, 660, [[0, 0], [0.5, 0.3], [1, 0.75]]); yellowS.fillRect(0, 380, 1000, 320);
    // stars
    press.knockout((g) => U.speckle(g, [0, 0, 1000, 560], 140, 0.6, 2.2, 'dust'));

    // the milky way: a diagonal band of specks (yellow, pink, white) round a dark dust lane
    const A = [px(830), px(-10)], B = [px(160), px(640)];
    const dx = B[0] - A[0], dy = B[1] - A[1], L = Math.hypot(dx, dy), nx = -dy / L, ny = dx / L;
    const rm = Motion.rng('dumw');
    const lane = (f) => { const x = A[0] + dx * f, y = A[1] + dy * f, o = Math.sin(f * 17) * 10 + Math.sin(f * 41) * 5; return [x + nx * o, y + ny * o]; };
    // a soft glow first: the blue lifted and yellow screened along the band
    for (let i = 0; i <= 40; i++) {
        const f = i / 40, [x, y] = lane(f), w = px(150) * (1 - 0.6 * f);
        for (const g of [blueS, blue, navyS]) { g.save(); g.globalCompositeOperation = 'destination-out'; g.fillStyle = R.radial(g, x, y, 0, w, 0.35, 0); g.beginPath(); g.arc(x, y, w, 0, 7); g.fill(); g.restore(); }
        pinkS.save(); pinkS.globalCompositeOperation = 'destination-out'; pinkS.fillStyle = R.radial(pinkS, x, y, 0, w * 0.6, 0.35, 0); pinkS.beginPath(); pinkS.arc(x, y, w * 0.6, 0, 7); pinkS.fill(); pinkS.restore();
        yellowS.fillStyle = R.radial(yellowS, x, y, 0, w * 0.7, 0.22 * (1 - f * 0.5), 0); yellowS.beginPath(); yellowS.arc(x, y, w * 0.8, 0, 7); yellowS.fill();
    }
    const whites = [];
    for (let i = 0; i < 2600; i++) {
        const f = rm(), w = px(120) * (1 - 0.6 * f), o = (rm() + rm() + rm() - 1.5) * w * 0.9, [x, y] = lane(f), X = x + nx * o, Y = y + ny * o, s = 1.8 + rm() * 2.6, k = rm();
        // a speck is a light colour over the sky: lift the blue under it, then ink it
        if (k < 0.5) { for (const g of [blueS, navyS]) { g.save(); g.globalCompositeOperation = 'destination-out'; g.fillRect(X - 1, Y - 1, s + 2, s + 2); g.restore(); } yellow.fillStyle = T(0.95); yellow.fillRect(X, Y, s, s); }
        else if (k < 0.62) { navy.fillStyle = T(0.8); navy.fillRect(X, Y, s * 0.8, s * 0.8); }
        else whites.push([X, Y, s * 0.8]);
    }
    press.knockout((g) => { for (const [X, Y, s] of whites) g.fillRect(X, Y, s, s); });
    // the dust lane: a dark wiggling line, broken
    for (let i = 0; i < 30; i++) {
        const f0 = 0.08 + i * 0.03, f1 = f0 + 0.022;
        if (i % 7 === 3) continue;
        const pts = []; for (let k = 0; k <= 4; k++) { const [x, y] = lane(f0 + ((f1 - f0) * k) / 4); pts.push([x + nx * 12, y + ny * 12]); }
        U.stroke(navy, pts, 2 + 3 * Math.sin(i * 1.3) ** 2, T(0.85));
    }
    // the comet: a tapered white streak with a yellow rim, the head low left
    const H = [px(848), px(268)], Tl = [px(1075), px(60)];
    const cdx = Tl[0] - H[0], cdy = Tl[1] - H[1], cl = Math.hypot(cdx, cdy), cnx = -cdy / cl, cny = cdx / cl;
    const comet = (w) => [[H[0] - cnx * w * 0.6, H[1] - cny * w * 0.6], [H[0] + cnx * w, H[1] + cny * w], [Tl[0] + cnx * 1, Tl[1] + cny * 1], [Tl[0] - cnx * 0.5, Tl[1] - cny * 0.5]];
    press.knockout((g) => { U.path(g, comet(9)); g.fill(); g.beginPath(); g.arc(H[0] + cnx * 1.5, H[1] + cny * 1.5, 6, 0, 7); g.fill(); });
    U.poly(yellow, comet(9), T(0.9));
    press.knockout((g) => { U.path(g, comet(5)); g.fill(); });

    // the dunes (px tables)
    const slipL = [[285, 663], [292, 690], [305, 730], [330, 775], [370, 815], [430, 850], [455, 862]];
    const slipB = [[575, 828], [598, 850], [615, 880], [635, 925], [665, 975], [710, 1030], [760, 1080]];
    const slipR = [[855, 650], [870, 680], [900, 715], [950, 750], [1010, 775], [1080, 792]];
    const Ld = P([[0, 735], ...slipL, [0, 1000]]);
    const S1 = P([[285, 663], [560, 722], [760, 790], [700, 842], [1080, 962], [1080, 1080], ...slipB.slice().reverse(), ...slipL.slice().reverse()]);
    const Rd = P([[540, 722], ...slipR, [1080, 962], [700, 842], [760, 790]]);
    const S2 = P([[855, 650], [1080, 690], ...slipR.slice().reverse()]);
    const Bd = P([[0, 988], ...slipB, [0, 1080]]);
    // a face: knocked out, then its inks
    const face = (pts, inks) => { press.knockout((g) => { U.path(g, pts); g.fill(); }); for (const [g, v] of inks) { g.fillStyle = typeof v === 'number' ? T(v) : v; U.path(g, pts); g.fill(); } };
    face(Ld, [[pink, 0.95], [yellow, 0.85], [navyS, 0.17]]);
    face(S1, [[pink, 0.9], [blueS, 0.8], [blue, 0.35], [navyS, 0.2]]);
    face(Rd, [[pink, 0.9], [yellow, 0.8], [navyS, 0.22]]);
    face(S2, [[pink, 0.9], [blueS, 0.8], [blue, 0.4]]);
    face(Bd, [[pink, 0.95], [yellow, 0.9], [yellowS, 0.3]]);
    // a warm glow on the front dune (lighter to the left)
    U.clipped(pinkS, Bd, (g) => { g.fillStyle = R.radial(g, px(200), px(1000), 10, 400, 0.4, 0); g.fillRect(0, 0, 1000, 1000); });

    // ripples: wavy strokes on the lit faces, yellow with a dark underside
    const ripples = (pts, seed, n, len, ang) => {
        const rr = Motion.rng('rip' + seed);
        const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
        const box = [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
        // the bright yellow line is the pink (and navy) lifted: yellow alone shows
        for (const [g, dy, w, v, op] of [[navy, 2, 1.5, 0.75], [pink, 0, 2.3, 1, 1], [navyS, 0, 2.8, 1, 1]]) {
            U.clipped(g, pts, (h) => {
                if (op) h.globalCompositeOperation = 'destination-out';
                const r2 = Motion.rng('rip' + seed);
                for (let i = 0; i < n; i++) {
                    const x = box[0] + r2() * (box[2] - box[0]), y = box[1] + r2() * (box[3] - box[1]), l = len * (0.5 + r2());
                    const q = []; for (let k = 0; k <= 6; k++) { const f = k / 6; q.push([x + Math.cos(ang) * l * f, y + Math.sin(ang) * l * f + Math.sin(f * 6.28 + x) * 2.2 + dy]); }
                    U.stroke(h, q, w, T(v));
                }
            });
        }
    };
    ripples(Ld, 'L', 120, 48, -0.2);
    ripples(Rd, 'R', 70, 42, 0.15);
    ripples(Bd, 'B', 130, 60, -0.28);
    // the crest lines: yellow highlight with a pale core on the lit edge
    const crest = (pts, w) => { for (const g of [pink, pinkS, blueS, blue, navyS]) { g.save(); g.globalCompositeOperation = 'destination-out'; U.stroke(g, P(pts), w + 1.5); g.restore(); } U.stroke(yellow, P(pts), w + 1.5, T(1)); press.knockout((g) => { g.globalAlpha = 0.5; U.stroke(g, P(pts), w * 0.45); }); };
    crest([[0, 735], [285, 663]], 2.4);
    crest(slipL, 2.2);
    crest([[0, 988], [575, 828]], 2.6);
    crest(slipB, 2.4);
    crest([[540, 722], [855, 650]], 1.8);
    crest(slipR, 2);
    // a comet twinkle on twos
    if (d % 2) press.knockout((g) => { g.beginPath(); g.arc(H[0], H[1], 8, 0, 7); g.fill(); });
};
