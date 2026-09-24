// Card «dish» (reference 12.75–12.875 s, full frame). A radio telescope listening to a
// galaxy: a night of navy and purple (pink + blue) clouds with stars, pink dots rising into
// a pink band at the horizon, blue-dotted ground with a wavy pink line; the dish a pale
// ellipse (paper with blue dots and a pink blush, teal grid) on a dark rim, three struts to
// the feed, yellow signal arcs, a pink spiral galaxy with a yellow, dotted core, and small
// dishes in silhouette on the horizon.
// Measured in reference pixels (1080 frame, the 12.75 s frame; the third frame is the same
// print moved (+1, −2)) with an ellipse fit of the dish, grid crops, colour scans and
// lattice fits of the screens. Uses G5 (cards/_g5-util.js).
var CARDS = CARDS || {};
CARDS.dish = (press, t, lf = Math.round(t * 24)) => {
    const U = G5, T = Riso.tone, d = Math.floor(t * 12 + 1e-6);
    const Y = press.plate('yellow'), P = press.plate('pink'), B = press.plate('blue'), N = press.plate('navy');
    // screens (lattice fits, px at 1080): sky pink 10.8 px at 18°, ground blue 8.6 px at 78°,
    // the dish face's blue 8.8 px (a skewed lattice)
    const LP = { o: [45.09, 495.4], a: [-3.3207, 10.2763], b: [10.2765, 3.3137] };
    const LG = { o: [703.81, 927.93], a: [1.82, 8.418], b: [-8.436, 1.793] };
    const LF = { o: [350.25, 635.99], a: [-8.325, -2.726], b: [1.853, 8.583] };
    // the film weaves: each frame of the cut is the same print moved (measured per frame)
    const [dx, dy] = [[0, 0], [0, 0], [1, -2]][Math.min(2, lf)];
    U.px(press, () => {
        press.save(); press.each((g) => g.translate(dx, dy));
        // ------------------------------------------------------------ night
        N.fillStyle = T(1); N.fillRect(0, 0, 1080, 1080);
        B.fillStyle = T(0.3); B.fillRect(0, 0, 1080, 1080);
        // purple clouds (pink + blue in place of the navy), diagonal streaks
        P.fillStyle = T(0.2); P.fillRect(0, 0, 1080, 520);
        const clouds = [[[-20, 20], [120, 10], [220, 80], [230, 170], [120, 230], [-20, 260]], [[-20, 380], [80, 390], [110, 450], [60, 500], [-20, 500]]];
        U.soft(N, 18, (g) => { g.globalCompositeOperation = 'destination-out'; g.fillStyle = T(0.85); clouds.forEach((c) => { g.beginPath(); U.smooth(g, c); g.fill(); }); });
        for (const g of [P, B]) U.soft(g, 18, (c) => { c.fillStyle = T(0.9); clouds.forEach((cl) => { c.beginPath(); U.smooth(c, cl); c.fill(); }); });
        // the horizon glow: pink dots from y 500 growing into a flat pink band (y 700–840)
        const glowT = (m, stops) => { const gr = m.createLinearGradient(0, 480, 0, 840); for (const [s, v] of stops) gr.addColorStop(s, T(v)); m.fillStyle = gr; m.fillRect(0, 480, 1080, 400); };
        U.screen(P, 'pink', LP, (m) => glowT(m, [[0, 0], [0.15, 0.2], [0.45, 0.65], [0.6, 1], [1, 1]]));
        P.save(); glowT(P, [[0, 0], [0.6, 0], [0.7, 1], [1, 1]]); P.restore();
        U.cut([N], (g) => glowT(g, [[0, 0], [0.3, 0.2], [0.55, 0.8], [0.7, 1], [1, 1]]));
        B.save(); B.globalCompositeOperation = 'destination-out'; glowT(B, [[0, 0], [0.5, 0.5], [0.8, 1], [1, 1]]); B.restore();
        U.screen(N, 'navy', LP, (m) => { const gr = m.createLinearGradient(0, 640, 0, 840); gr.addColorStop(0, T(0)); gr.addColorStop(1, T(0.12)); m.fillStyle = gr; m.fillRect(0, 640, 1080, 220); });
        // ------------------------------------------------------------ ground
        const ground = [[-20, 832], [60, 836], [140, 826], [220, 815], [300, 812], [400, 830], [520, 850], [640, 862], [700, 868], [780, 872], [840, 880], [900, 888], [960, 882], [1020, 870], [1100, 860], [1100, 1100], [-20, 1100]];
        U.cut([P], (g) => { g.beginPath(); U.smooth(g, ground); g.fill(); });
        // teal: blue flat with navy dots, a little pink
        U.cut([N, B], (g) => { g.beginPath(); U.smooth(g, ground); g.fill(); });
        U.fill(B, ground, T(1), true);
        U.fill(P, ground, T(0.35), true);
        U.screen(N, 'navy', LG, (m) => U.clipped(m, ground, true, (c) => { c.fillStyle = T(0.55); c.fillRect(0, 800, 1080, 300); }));
        // the wavy pink line on the ground
        const wave = []; for (let x = -10; x <= 1090; x += 20) wave.push([x, 995 + 9 * Math.sin(x / 55) + 4 * Math.sin(x / 23)]);
        U.cut([N, B], (g) => U.brush(g, wave, 5, '#000', 'dwv', { taper: 0 }));
        U.brush(P, wave, 5, T(1), 'dwv', { taper: 0 });
        // stars: white with a pink or blue fringe
        const rs = Motion.rng('dish-stars');
        for (let k = 0; k < 150; k++) {
            const x = rs() * 1080, y = rs() * 820, r = 1.5 + rs() * 2.8;
            press.knockout((g) => { g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); });
            const g = rs() < 0.5 ? P : B; g.fillStyle = T(0.9); g.beginPath(); g.arc(x + 2, y + 2, r * 0.8, 0, 7); g.fill();
        }
        // ------------------------------------------------------------ small dishes
        // measured: bowls [cx, cy, rx, ry], stems [x0, y0, x1, y1, w]
        for (const [cx, cy, rx, ry, x0, y0, x1, y1, w] of [[765, 784, 60, 28, 757, 800, 747, 895, 24], [891, 830, 48, 21, 881, 845, 875, 918, 18], [1006, 842, 38, 17, 1000, 855, 995, 902, 15]]) {
            const sh = (g) => { g.beginPath(); g.ellipse(cx, cy, rx, ry, 0.42, 0, 7); g.moveTo(x0 - w / 2, y0); g.lineTo(x0 + w / 2, y0); g.lineTo(x1 + w * 0.4, y1); g.lineTo(x1 - w * 0.4, y1); g.closePath(); };
            U.cut([P], (g) => { sh(g); g.fill(); });
            for (const [g, v] of [[N, 1], [B, 0.4], [P, 0.25]]) { g.fillStyle = T(v); sh(g); g.fill(); }
            U.brush(N, [[cx + 2, cy - ry], [cx + 10, cy - ry - 30]], 3, T(1), 'dsa' + cx, { taper: 0.2 });
        }
        // ------------------------------------------------------------ the dish
        const E = (cx, cy, a, b, rot, n = 64) => { const pts = []; for (let i = 0; i < n; i++) { const t2 = (i / n) * Math.PI * 2, x = Math.cos(t2) * a, y = Math.sin(t2) * b; pts.push([cx + x * Math.cos(rot) - y * Math.sin(rot), cy + x * Math.sin(rot) + y * Math.cos(rot)]); } return pts; };
        const rot = 24.1 * Math.PI / 180;
        const face = E(378, 627, 338, 131, rot), rim = E(372, 662, 335, 142, rot);
        // the mount's shadow under the dish: navy over the ground
        const mount = [[180, 800], [300, 830], [420, 860], [400, 960], [230, 960], [170, 880]];
        U.cut([B], (g) => U.soft(g, 20, (c) => { c.fillStyle = T(0.5); c.beginPath(); U.smooth(c, mount); c.fill(); }));
        N.fillStyle = T(0.6); N.beginPath(); U.smooth(N, mount); N.fill();
        // legs behind the dish: pale sticks and a pink cross
        for (const pts of [[[272, 760], [196, 1000]], [[440, 815], [478, 1000]]]) { press.knockout((g) => U.brush(g, pts, 7, '#000', 'dl' + pts[0][0], { taper: 0 })); U.brush(B, pts, 3, T(0.6), 'dlb' + pts[0][0], { taper: 0 }); }
        for (const pts of [[[250, 820], [440, 970]], [[420, 810], [240, 955]]]) { U.cut([N, B], (g) => U.brush(g, pts, 5, '#000', 'dx' + pts[0][0], { taper: 0.1 })); U.brush(P, pts, 5, T(1), 'dx' + pts[0][0], { taper: 0.1 }); }
        // the rim: a dark band under the face, a pink lip
        U.cut([P], (g) => { g.beginPath(); U.smooth(g, rim); g.fill(); });
        for (const [g, v] of [[N, 1], [B, 0.5], [P, 0.3]]) U.fill(g, rim, T(v), true);
        U.brush(P, E(372, 660, 336, 141, rot).slice(8, 40), 4, T(0.9), 'drl', { taper: 0.2 });
        // the face: paper, blue dots thickening to the lower right, a pink blush upper left
        press.knockout((g) => { g.beginPath(); U.smooth(g, face); g.fill(); });
        U.screen(B, 'blue', LF, (m) => U.clipped(m, face, true, (c) => { const gr = c.createLinearGradient(150, 520, 650, 780); gr.addColorStop(0, T(0.3)); gr.addColorStop(0.45, T(0.18)); gr.addColorStop(0.7, T(0.12)); gr.addColorStop(1, T(0.35)); c.fillStyle = gr; c.fillRect(0, 400, 1080, 500); }));
        U.screen(P, 'pink', LF, (m) => U.clipped(m, face, true, (c) => { c.save(); c.translate(230, 580); c.rotate(rot); c.scale(1, 0.5); U.glow(c, 0, 0, 260, 0.45, 0); c.restore(); }));
        // its grid: concentric ellipses and radial ribs (teal: blue + a little navy)
        const teal = (pts, w, seed, close) => { for (const [g, v] of [[B, 0.9], [N, 0.35]]) U.brush(g, close ? pts.concat([pts[0]]) : pts, w, T(v), seed, { taper: close ? 0 : 0.1, wob: 0.2 }); };
        U.clipped(B, face, true, () => {});
        press.save(); press.clip((g) => U.smooth(g, face));
        for (const k of [0.28, 0.52, 0.76]) teal(E(430 - 60 * k, 655 - 25 * k, 338 * k, 131 * k, rot, 48), 2.6, 'dge' + k, true);
        for (let i = 0; i < 16; i++) { const a = (i / 16) * Math.PI * 2, [x0, y0] = [430, 655]; const x = Math.cos(a) * 360, y = Math.sin(a) * 150; teal([[x0, y0], [x0 + x * Math.cos(rot) - y * Math.sin(rot), y0 + x * Math.sin(rot) + y * Math.cos(rot)]], 2.2, 'dgr' + i, false); }
        press.restore();
        teal(face, 3, 'dfo', true);
        // ------------------------------------------------------------ struts and feed
        const strut = (pts, seed) => {
            press.knockout((g) => U.brush(g, pts, 9, '#000', seed, { taper: 0 }));
            U.brush(P, pts.map(([x, y]) => [x - 2.5, y]), 3, T(1), seed + 'p', { taper: 0 });
            U.brush(B, pts.map(([x, y]) => [x + 2.5, y]), 3, T(0.8), seed + 'b', { taper: 0 });
        };
        strut([[112, 448], [300, 408], [488, 362]], 'ds1');
        strut([[378, 792], [440, 580], [500, 370]], 'ds2');
        strut([[676, 762], [600, 570], [522, 378]], 'ds3');
        for (const [g, v] of [[N, 1], [B, 0.5]]) U.fill(g, [[486, 350], [522, 336], [540, 352], [528, 380], [500, 386]], T(v), true);
        // ------------------------------------------------------------ signal arcs
        const arcs = [[[511, 228], [520, 280], [534, 328]], [[568, 244], [582, 285], [600, 325], [638, 398]], [[626, 244], [649, 298], [676, 344]], [[692, 244], [703, 280], [715, 302]], [[542, 359], [572, 405], [607, 448]]];
        arcs.forEach((pts, i) => {
            press.knockout((g) => U.brush(g, pts, 10, '#000', 'da' + i, { taper: 0.35 }));
            U.brush(Y, pts, 10, T(1), 'da' + i, { taper: 0.35 });
            U.brush(P, pts.map(([x, y]) => [x - 3, y + 1]), 3, T(0.8), 'dap' + i, { taper: 0.4 });
        });
        // ------------------------------------------------------------ the galaxy
        press.save(); press.each((g) => { g.translate(835, 210); g.rotate(-0.25); });
        U.cut([N, B, P], (g) => { g.beginPath(); g.ellipse(0, 0, 85, 55, 0, 0, 7); g.fill(); });
        U.fill(N, U.blob(0, 0, 85, 55, 'dgd', 0.05), T(0.5), true);
        press.restore();
        U.screen(Y, 'yellow', LP, (m) => { m.save(); m.translate(835, 210); m.rotate(-0.25); m.scale(1, 0.65); U.glow(m, 0, 0, 90, 0.7, 0.1); m.restore(); });
        U.screen(P, 'pink', LF, (m) => { m.save(); m.translate(835, 210); m.rotate(-0.25); m.scale(1, 0.65); U.glow(m, 0, 0, 95, 0.5, 0.1); m.restore(); });
        const arm = (pts, w, seed, core) => {
            press.knockout((g) => U.brush(g, pts, w, '#000', seed, { taper: 0.3 }));
            U.brush(P, pts, w, T(1), seed, { taper: 0.3 });
            if (core) { U.cut([P], (g) => U.brush(g, pts, w * 0.55, '#000', seed + 'c', { taper: 0.3 })); U.brush(Y, pts, w * 0.8, T(1), seed + 'y', { taper: 0.3 }); }
        };
        arm([[772, 215], [782, 180], [812, 158], [850, 150]], 22, 'dg1', true);
        arm([[895, 205], [890, 240], [860, 262], [815, 272]], 22, 'dg2', true);
        arm([[634, 244], [655, 280], [690, 305], [734, 317], [803, 305], [865, 267], [900, 225]], 14, 'dg3', false);
        arm([[772, 182], [842, 128], [942, 113], [1018, 132], [1053, 175], [1049, 244], [1026, 275]], 13, 'dg4', false);
        // pink dust around the rim arm
        const rd = Motion.rng('dish-dust');
        for (let k = 0; k < 80; k++) { const a = rd() * 3.6 - 1.4, r = 110 + rd() * 30; P.fillStyle = T(1); P.beginPath(); P.arc(915 + Math.cos(a) * r * 1.25, 190 + Math.sin(a) * r * 0.7, 1.5 + rd() * 2, 0, 7); P.fill(); }
        press.restore();
    });
};
