// Card «chimes» (reference ≈ 13.08–13.21 s, full frame). Bamboo wind chimes under the
// eaves: a navy beam with pink lines at the top, a brown disc (pink + yellow + navy dots),
// six yellow tubes shaded with pink dots, white highlights and green caps, a navy clapper, a
// red sail on a thread; a cherry branch with pink blossoms, petals blowing; light-blue dots
// on paper with white rings of sound, a yellow beam of light across, pink-dot bushes below.
// Authored in reference pixels (1080 frame) through G5.px. CARDS.chimes(press, t).
var CARDS = CARDS || {};
CARDS.chimes = (press, t, lf = Math.round(t * 24)) => {
    // measured grids and scans (the tone map per 45 px block, outlines sampled off the
    // reference) live in private/chimes-data.js, never committed; the card falls back to its
    // described shapes without them
    const D = (typeof G5DATA !== 'undefined' && G5DATA.chimes) || {};
    const TONE = D.tone;
    const R = Riso, T = R.tone, U = G5;
    const d = Math.floor(t * 12 + 1e-6);
    const P = (ink, k) => press.plate(ink, k);
    const pink = P('pink'), pinkS = P('pink', 'screen'), yel = P('yellow'), yelS = P('yellow', 'screen');
    const blue = P('blue'), blueS = P('blue', 'screen'), navy = P('navy'), navyS = P('navy', 'screen');
    const all = [pink, pinkS, yel, yelS, blue, blueS, navy, navyS];
    const eraseIn = (plates, fn) => { for (const g of plates) { g.save(); g.globalCompositeOperation = 'destination-out'; g.fillStyle = '#000'; g.strokeStyle = '#000'; g.beginPath(); fn(g); g.restore(); } };
    const dark = (pts, w, close = false) => { U.stroke(blue, pts, w, T(0.9), false); U.stroke(yel, pts, w, T(0.8), false); U.stroke(navy, pts, w, T(0.4), false); if (close) { U.stroke(blue, [pts[pts.length - 1], pts[0]], w, T(0.9)); U.stroke(yel, [pts[pts.length - 1], pts[0]], w, T(0.8)); } };

    // screens (lattice fits, px at 1080): blue 10.8 px at 12°, the beam's yellow 10.8 px at 42°
    const LB = { o: [43.5, 131.31], a: [-2.2372, 10.5561], b: [10.5712, 2.2383] };
    const LY = { o: [940.66, 46.97], a: [7.9765, 7.2898], b: [-7.284, 7.9725] };
    // the film weaves: the cut's first frame is the same print moved (−5, +6)
    const [dx, dy] = [[-5, 6], [0, 0], [0, 0]][Math.min(2, lf)];
    U.px(press, () => {
        press.save(); press.each((g) => g.translate(dx, dy));
        // the sky: light-blue dots on paper, denser at the top (measured: 0.65 → 0.35)
        // the beam's edges measured on row scans: upper x = 866 − 0.92 (y − 150), lower x = 945 − 0.93 (y − 450)
        const beam = [[1004, -10], [1090, -10], [1090, 294], [359, 1090], [10, 1090]];
        U.screen(blue, 'blue', LB, (m) => { const gr = m.createLinearGradient(0, 100, 300, 950); gr.addColorStop(0, T(0.82)); gr.addColorStop(0.5, T(0.56)); gr.addColorStop(1, T(0.42)); m.fillStyle = gr; m.fillRect(0, 0, 1080, 1080); m.globalCompositeOperation = 'destination-out'; m.fillStyle = T(0.6); m.beginPath(); U.trace(m, beam); m.fill(); });
        // the beam of light: yellow dots across, from the upper right down to the lower left
        U.screen(yel, 'yellow', LY, (m) => { const gr = m.createLinearGradient(1000, 150, 250, 950); gr.addColorStop(0, T(0.48)); gr.addColorStop(0.5, T(0.3)); gr.addColorStop(1, T(0.14)); m.fillStyle = gr; m.beginPath(); U.trace(m, beam); m.fill(); });
        // rings of sound: white circles knocked out round the chimes
        const ring = (d % 2) * 8;
        eraseIn(all, (g) => { g.lineWidth = 3.5; for (const r of [230, 330, 440, 560, 690]) { g.moveTo(560 + r + ring, 600); g.arc(560, 600, r + ring, 0, 7); } g.stroke(); });
        // bushes at the bottom: pink-dot scallops
        const bush = D.bush ?? [[-10, 1090], [-10, 980], [200, 1010], [480, 1005], [660, 960], [750, 1010], [840, 965], [1090, 950], [1090, 1090]];
        eraseIn([blueS, yelS], (g) => U.smooth(g, bush) || g.fill());
        U.fill(pinkS, bush, T(0.62), true);
        for (const [x, y] of [[120, 1040], [420, 1030], [700, 1020], [960, 1030]]) U.glow(pinkS, x, y, 90, 0.35, 0);

        // the eaves: a navy beam with two pink lines, the hook
        // (edges and lines measured on column scans: bottom 106 → 76, lines 40 → 10 and 85 → 51)
        const top = [[-10, -10], [1090, -10], [1090, 75], [800, 83], [540, 94], [300, 98], [50, 107], [-10, 109]];
        eraseIn(all, (g) => U.trace(g, top) || g.fill());
        U.fill(navy, top, T(1));
        // purple on the left (pink + blue), navy towards the right
        U.clipped(pink, top, false, (g) => { const gr = g.createLinearGradient(0, 0, 500, 0); gr.addColorStop(0, T(0.95)); gr.addColorStop(1, T(0.2)); g.fillStyle = gr; g.fillRect(0, 0, 1080, 120); });
        U.clipped(navy, top, false, (g) => { g.globalCompositeOperation = 'destination-out'; const gr = g.createLinearGradient(0, 0, 500, 0); gr.addColorStop(0, T(0.9)); gr.addColorStop(1, T(0)); g.fillStyle = gr; g.fillRect(0, 0, 1080, 120); });
        U.fill(blue, top, T(0.8));
        const l1 = [[-10, 41], [300, 32], [540, 25], [800, 15], [1090, 9]], l2 = [[-10, 86], [300, 74], [540, 68], [800, 60], [1090, 50]];
        U.erase([navy, blue], l1, 4); U.erase([navy, blue], l2, 7);
        U.brush(pink, l1, 4, T(0.8), 'chl1', { taper: 0 }); U.brush(pink, l2, 7, T(1), 'chl2', { taper: 0 });
        navy.fillStyle = T(1); navy.beginPath(); navy.ellipse(522, 98, 18, 14, 0, 0, 7); navy.fill();
        U.stroke(navy, [[522, 100], [535, 215]], 2, T(0.8));

        // the disc (wind catcher): brown (pink + yellow + navy dots), a lit rim below
        const disc = []; for (let i = 0; i < 40; i++) { const a = i / 40 * Math.PI * 2; disc.push([537 + Math.cos(a) * 190, 228 + Math.sin(a) * 42 - Math.cos(a) * 12]); }
        eraseIn(all, (g) => U.trace(g, disc) || g.fill());
        U.fill(pink, disc, T(0.9)); U.fill(yel, disc, T(0.9)); U.fill(navyS, disc, T(0.75));
        const under = disc.slice(3, 20);
        U.stroke(navy, under.map(([x, y]) => [x, y + 3]), 8, T(0.95));
        U.stroke(yel, disc.slice(6, 16).map(([x, y]) => [x, y - 4]), 3, T(1));
        eraseIn([navyS, pink], (g) => { g.lineWidth = 2.5; U.trace(g, disc.slice(7, 15).map(([x, y]) => [x, y - 5]), false); g.stroke(); });
        // threads from the disc to the tubes
        for (const x of [370, 430, 510, 610, 680, 740]) U.stroke(navy, [[x + (537 - x) * 0.3, 250], [x, 360]], 1.4, T(0.6));

        // the tubes: back ones first
        const sw = [0, 3, 5, 3, 0, -3][d % 6];
        // measured on row scans: [top centre x, top y, bottom centre x, bottom y, radius], back
        // tubes first
        const tubes = [[371, 380, 405, 668, 27], [502, 350, 519, 695, 27], [678, 335, 725, 700, 25], [431, 400, 441, 835, 33], [603, 383, 616, 893, 36], [733, 347, 758, 815, 29]];
        for (const [xa, y0, xb, y1, r] of tubes) {
            const x0 = xa + sw * 0.3, x1 = xb + sw;
            const body = [[x0 - r, y0], [x0 + r, y0], [x1 + r, y1], [x1 - r, y1]];
            const shape = [...body.slice(0, 2), [x1 + r, y1], ...Array.from({ length: 9 }, (_, i) => { const a = i / 8 * Math.PI; return [x1 + Math.cos(a) * r, y1 + Math.sin(a) * r * 0.3]; }), [x1 - r, y1]];
            eraseIn(all, (g) => U.trace(g, shape) || g.fill());
            U.fill(yel, shape, T(1));
            // shading: pink dots, denser to the right
            U.clipped(pinkS, shape, false, (g) => { g.fillStyle = R.ramp(g, x0 - r, 0, x0 + r, 0, 0.03, 0.32); g.fillRect(0, 0, 1080, 1080); });
            U.clipped(navyS, shape, false, (g) => { g.fillStyle = R.ramp(g, x0 + r * 0.3, 0, x0 + r, 0, 0, 0.2); g.fillRect(0, 0, 1080, 1080); });
            // the highlight: a white stripe left of centre
            eraseIn(all, (g) => { g.lineWidth = r * 0.3; g.lineCap = 'round'; g.moveTo(x0 - r * 0.42, y0 + 22); g.lineTo(x1 - r * 0.42, y1 - 14); g.stroke(); });
            // outline: dark green
            dark([[x0 - r, y0], [x1 - r, y1]], 2.5); dark([[x0 + r, y0], [x1 + r, y1]], 2.5);
            dark(Array.from({ length: 9 }, (_, i) => { const a = i / 8 * Math.PI; return [x1 + Math.cos(a) * r, y1 + Math.sin(a) * r * 0.3]; }), 2.5);
            // the open top: a green-dark ellipse inside a yellow rim
            const cap = Array.from({ length: 24 }, (_, i) => { const a = i / 24 * Math.PI * 2; return [x0 + Math.cos(a) * r, y0 + Math.sin(a) * r * 0.3]; });
            eraseIn(all, (g) => U.trace(g, cap) || g.fill());
            U.fill(yel, cap, T(1));
            const hole = cap.map(([x, y]) => [x0 + (x - x0) * 0.78, y0 + (y - y0) * 0.7 + 1]);
            U.fill(blue, hole, T(0.7)); U.fill(navyS, hole, T(0.5));
            dark([...cap, cap[0]], 2.2);
        }
        // the clapper: a navy disc between the tubes, and the thread to the sail
        const cl = [[640, 615], [712, 612], [716, 632], [642, 640]];
        U.fill(navy, cl, T(1), true);
        U.stroke(navy, [[678, 630], [712 + sw * 2, 885]], 1.5, T(0.7));
        // the sail: red (pink + yellow) with a yellow highlight and a dark rim
        const sail = []; for (let i = 0; i < 30; i++) { const a = i / 30 * Math.PI * 2; const rx = 58 * (Math.sin(a) > 0 ? 0.8 + 0.2 * Math.cos(a) ** 2 : 1), ry = Math.sin(a) > 0 ? 100 : 66; sail.push([Math.cos(a) * rx, Math.sin(a) * ry]); }
        const sa = -0.42 + sw * 0.01, S0 = [720 + sw * 2, 952];
        const sp = sail.map(([x, y]) => [S0[0] + x * Math.cos(sa) - y * Math.sin(sa), S0[1] + x * Math.sin(sa) + y * Math.cos(sa)]);
        eraseIn(all, (g) => U.smooth(g, sp) || g.fill());
        U.fill(pink, sp, T(0.9), true); U.fill(yel, sp, T(1), true);
        U.clipped(navyS, sp, true, (g) => { g.fillStyle = R.ramp(g, S0[0] - 40, 0, S0[0] + 60, 0, 0, 0.25); g.fillRect(0, 0, 1080, 1080); });
        eraseIn([pink], (g) => { g.lineWidth = 6; g.lineCap = 'round'; g.moveTo(S0[0] - 38, S0[1] - 45); g.lineTo(S0[0] - 8, S0[1] + 30); g.stroke(); });
        dark([...sp, sp[0]], 2.5);

        // the cherry branch and blossoms
        const br = [[-10, 205], [80, 222], [170, 240], [260, 252], [360, 278]];
        U.stroke(navy, br, 12, T(0.95), true); U.stroke(yel, br, 12, T(0.7), true);
        U.stroke(navy, [[40, 215], [60, 170]], 4, T(0.9)); U.stroke(navy, [[60, 170], [72, 150]], 3, T(0.9));
        const flower = (x, y, r, rot) => {
            const pts = [];
            for (let i = 0; i < 40; i++) { const a = rot + i / 40 * Math.PI * 2, k = 0.78 + 0.22 * Math.abs(Math.cos(a * 5 / 2 - rot * 5 / 2)); pts.push([x + Math.cos(a) * r * k, y + Math.sin(a) * r * k]); }
            eraseIn(all, (g) => U.trace(g, pts) || g.fill());
            U.fill(pink, pts, T(1));
            U.fill(pinkS, pts, T(0.25));
            // white vein lines on each petal
            eraseIn([pink, pinkS], (g) => { g.lineWidth = 2; for (let k = 0; k < 5; k++) { const a = rot + (k + 0.5) / 5 * Math.PI * 2; g.moveTo(x + Math.cos(a) * r * 0.35, y + Math.sin(a) * r * 0.35); g.lineTo(x + Math.cos(a) * r * 0.75, y + Math.sin(a) * r * 0.75); } g.stroke(); });
            yel.fillStyle = T(1); yel.beginPath(); yel.arc(x, y, r * 0.24, 0, 7); yel.fill();
            navy.fillStyle = T(0.9);
            for (let k = 0; k < 5; k++) { const a = rot + (k + 0.5) / 5 * Math.PI * 2; navy.beginPath(); navy.arc(x + Math.cos(a) * r * 0.38, y + Math.sin(a) * r * 0.38, 2.4, 0, 7); navy.fill(); }
        };
        flower(40, 246, 38, 0.2); flower(122, 200, 34, -0.3); flower(254, 222, 36, 0.5); flower(180, 278, 30, 0.1); flower(330, 302, 30, -0.2);
        // petals blowing: pink ovals, drifting right on twos
        const rp = Motion.rng('ch-pet');
        for (let k = 0; k < 42; k++) {
            // two drifts measured on the frame: left of the tubes (x 170–470, y 300–620) and
            // below right (x 750–1060, y 580–1000); bright pink on paper, 13–21 px long
            const left = k < 20, x = (left ? 170 + rp() * 300 : 750 + rp() * 310) + d * 3, y = left ? 300 + rp() * 320 : 580 + rp() * 420, a = rp() * 3, l = 13 + rp() * 8;
            const pt = [[x - l, y], [x, y - l * 0.45], [x + l, y], [x, y + l * 0.45]].map(([px, py]) => [x + (px - x) * Math.cos(a) - (py - y) * Math.sin(a), y + (px - x) * Math.sin(a) + (py - y) * Math.cos(a)]);
            eraseIn(all, (g) => U.smooth(g, pt) || g.fill());
            U.fill(pink, pt, T(1), true);
        }
        press.restore();
        U.toneMap(press, TONE);
    });
};
