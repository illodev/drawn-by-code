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
        // the night, measured (30 px means solved into inks): mostly pink + blue overprinted
        // (a blue-violet), with darker navy clouds drifting through it up to the right
        P.fillStyle = T(0.95); P.fillRect(0, 0, 1080, 1080);
        B.fillStyle = T(1); B.fillRect(0, 0, 1080, 1080);
        N.fillStyle = T(0.08); N.fillRect(0, 0, 1080, 1080);
        const clouds = [[200, 300, 170, 1], [330, 150, 120, 0.7], [80, 470, 110, 0.6], [950, 330, 150, 0.9], [560, 250, 90, 0.5], [760, 60, 110, 0.5]];
        const cl = (g, k) => clouds.forEach(([x, y, r, v]) => { g.save(); g.translate(x, y); g.rotate(-0.6); g.scale(1.6, 0.6); const gr = g.createRadialGradient(0, 0, 0, 0, 0, r); gr.addColorStop(0, T(v * k)); gr.addColorStop(0.5, T(v * k * 0.8)); gr.addColorStop(1, T(0)); g.fillStyle = gr; g.beginPath(); g.arc(0, 0, r, 0, 7); g.fill(); g.restore(); });
        cl(N, 1);
        U.cut([P], (g) => cl(g, 0.5));
        U.cut([B], (g) => cl(g, 0.4));
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
        U.fill(P, ground, T(0.4), true);
        U.screen(N, 'navy', LG, (m) => U.clipped(m, ground, true, (c) => { c.fillStyle = T(0.3); c.fillRect(0, 800, 1080, 300); }));
        // the wavy pink line on the ground
        const wave = []; for (let x = -10; x <= 1090; x += 20) wave.push([x, 995 + 9 * Math.sin(x / 55) + 4 * Math.sin(x / 23)]);
        U.cut([N, B], (g) => U.brush(g, wave, 5, '#000', 'dwv', { taper: 0 }));
        U.brush(P, wave, 5, T(1), 'dwv', { taper: 0 });
        // below the line and in the dish's shadow between its legs the ground is purple
        const low = wave.concat([[1090, 1100], [-10, 1100]]), shade = [[150, 812], [330, 800], [470, 845], [490, 990], [190, 1000]];
        for (const sh of [low, shade]) { U.cut([N], (g) => { g.beginPath(); U.trace(g, sh); g.fill(); }); U.fill(P, sh, T(0.92)); U.fill(B, sh, T(1)); U.screen(N, 'navy', LG, (m) => U.fill(m, sh, T(0.12))); }
        // stars: white with a pink or blue fringe
        const rs = Motion.rng('dish-stars');
        for (let k = 0; k < 260; k++) {
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
        // ellipse fit on 39 edge points (longest light run per column): centre (375, 643),
        // 338 × 125, 26.8°; the back shows as a dark crescent at the left end and a thin band under
        const rot = 26.8 * Math.PI / 180;
        const face = E(375, 643, 338, 125, rot), rim = E(362, 650, 348, 133, rot);
        // legs behind the dish: pale sticks and a pink cross
        for (const pts of [[[272, 760], [196, 1000]], [[440, 815], [478, 1000]]]) { press.knockout((g) => U.brush(g, pts, 7, '#000', 'dl' + pts[0][0], { taper: 0 })); U.brush(B, pts, 3, T(0.6), 'dlb' + pts[0][0], { taper: 0 }); }
        for (const pts of [[[250, 820], [440, 970]], [[420, 810], [240, 955]]]) { U.cut([N, B], (g) => U.brush(g, pts, 5, '#000', 'dx' + pts[0][0], { taper: 0.1 })); U.brush(P, pts, 5, T(1), 'dx' + pts[0][0], { taper: 0.1 }); }
        // the rim: a dark band under the face, a pink lip
        U.cut([P], (g) => { g.beginPath(); U.smooth(g, rim); g.fill(); });
        for (const [g, v] of [[N, 1], [B, 0.5], [P, 0.3]]) U.fill(g, rim, T(v), true);
        U.brush(P, E(362, 651, 349, 134, rot).slice(14, 40), 4, T(0.9), 'drl', { taper: 0.2 });
        // the face: paper, blue dots thickening to the lower right, a pink blush upper left
        press.knockout((g) => { g.beginPath(); U.smooth(g, face); g.fill(); });
        U.screen(B, 'blue', LF, (m) => U.clipped(m, face, true, (c) => { const gr = c.createLinearGradient(150, 520, 650, 780); gr.addColorStop(0, T(0.3)); gr.addColorStop(0.45, T(0.18)); gr.addColorStop(0.7, T(0.12)); gr.addColorStop(1, T(0.35)); c.fillStyle = gr; c.fillRect(0, 400, 1080, 500); }));
        U.screen(P, 'pink', LF, (m) => U.clipped(m, face, true, (c) => { c.save(); c.translate(240, 590); c.rotate(rot); c.scale(1, 0.5); U.glow(c, 0, 0, 260, 0.45, 0); c.restore(); }));
        // its grid: concentric ellipses and radial ribs (teal: blue + a little navy)
        const teal = (pts, w, seed, close) => { for (const [g, v] of [[B, 0.9], [N, 0.35]]) U.brush(g, close ? pts.concat([pts[0]]) : pts, w, T(v), seed, { taper: close ? 0 : 0.1, wob: 0.2 }); };
        U.clipped(B, face, true, () => {});
        press.save(); press.clip((g) => U.smooth(g, face));
        for (const k of [0.28, 0.52, 0.76]) teal(E(430 - 60 * k, 675 - 30 * k, 338 * k, 125 * k, rot, 48), 2.6, 'dge' + k, true);
        for (let i = 0; i < 16; i++) { const a = (i / 16) * Math.PI * 2, [x0, y0] = [430, 675]; const x = Math.cos(a) * 360, y = Math.sin(a) * 150; teal([[x0, y0], [x0 + x * Math.cos(rot) - y * Math.sin(rot), y0 + x * Math.sin(rot) + y * Math.cos(rot)]], 2.2, 'dgr' + i, false); }
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
        // the core: yellow dots on the dark night (the dots clear the navy under them), an
        // ellipse ~110 × 60 px round (820, 205), measured on a 1.2× grid crop
        const core = (m, v) => { m.save(); m.translate(820, 205); m.rotate(-0.2); m.scale(1, 0.55); U.glow(m, 0, 0, 115, v, v * 0.4); m.restore(); };
        for (const [g, ink] of [[N, 'navy'], [P, 'pink'], [B, 'blue']]) { g.save(); g.globalCompositeOperation = 'destination-out'; U.screen(g, ink, LP, (m) => core(m, 0.32)); g.restore(); }
        U.screen(Y, 'yellow', LP, (m) => core(m, 0.32));
        U.screen(B, 'blue', LP, (m) => core(m, 0.15));
        const arm = (pts, w, seed, core) => {
            press.knockout((g) => U.brush(g, pts, w, '#000', seed, { taper: 0.3 }));
            U.brush(P, pts, w, T(1), seed, { taper: 0.3 });
            if (core) { U.cut([P], (g) => U.brush(g, pts, w * 0.55, '#000', seed + 'c', { taper: 0.3 })); U.brush(Y, pts, w * 0.8, T(1), seed + 'y', { taper: 0.3 }); }
        };
        arm([[762, 232], [766, 196], [786, 162], [822, 142], [862, 136]], 20, 'dg1', true);
        arm([[884, 176], [884, 210], [866, 238], [830, 256], [792, 262]], 20, 'dg2', true);
        arm([[634, 244], [660, 282], [700, 306], [750, 312], [810, 300], [862, 270], [890, 230]], 16, 'dg3', false);
        arm([[862, 136], [920, 118], [990, 116], [1040, 140], [1062, 190], [1050, 250], [1030, 280]], 14, 'dg4', false);
        // pink dust around the rim arm
        // the arms' edges break into pink specks (dust knocked out of the dark round them)
        const rd = Motion.rng('dish-dust');
        for (const pts of [[[634, 244], [660, 282], [700, 306], [750, 312], [810, 300], [862, 270], [890, 230]], [[862, 136], [920, 118], [990, 116], [1040, 140], [1062, 190], [1050, 250], [1030, 280]]]) {
            for (let k = 0; k < 90; k++) {
                const i = Math.floor(rd() * (pts.length - 1)), u = rd(), [x0, y0] = pts[i], [x1, y1] = pts[i + 1];
                const x = x0 + (x1 - x0) * u + (rd() - 0.5) * 34, y = y0 + (y1 - y0) * u + (rd() - 0.5) * 34, r = 1.5 + rd() * 2.5;
                U.cut([N, B], (g) => { g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); });
                P.fillStyle = T(1); P.beginPath(); P.arc(x, y, r, 0, 7); P.fill();
            }
        }
        // the print's grit (balanced voids and specks)
        U.grit(N, [0, 0, 1080, 1080], { out: true, p: 0.1, a: 0.7, seed: 41 });
        U.grit(N, [0, 0, 1080, 1080], { p: 0.08, a: 0.7, seed: 42 });
        U.grit(B, [0, 0, 1080, 1080], { out: true, p: 0.04, a: 0.6, seed: 43 });
        U.grit(P, [0, 0, 1080, 1080], { out: true, p: 0.06, a: 0.6, seed: 44 });
        U.grit(P, [0, 0, 1080, 1080], { p: 0.05, a: 0.8, seed: 45 });
        press.restore();
    });
};
