// Card «shell» (reference 12.625–12.75 s, full frame). A conch shell lying on sand by the
// water's edge: yellow sand with a fine pink dot and pink hairs, wet sand with white swash
// lines, a white foam band with blue bubbles, a green sea (yellow + blue dots); the shell
// pale (pink and yellow dots on paper, a finer screen than the sand's) with three orange
// zigzag bands (pink + yellow flat), a teal outline (navy + blue) with its whorl lines, a
// magenta aperture that turns red on its outer side, with navy dots and cracks and a white
// highlight, and a hatched navy shadow along its lower side.
// Measured in reference pixels (1080 frame, the 12.667 s frame; the first frame of the cut
// is the same print 3 px to the right) with colour-run scans along and across the shell's
// axis, grid crops and lattice fits of the four screens. Uses G5 (cards/_g5-util.js).
var CARDS = CARDS || {};
CARDS.shell = (press, t, lf = Math.round(t * 24)) => {
    const U = G5, T = Riso.tone, d = Math.floor(t * 12 + 1e-6);
    const Y = press.plate('yellow'), P = press.plate('pink'), B = press.plate('blue'), N = press.plate('navy');
    // the screens (lattice fits, px at 1080): sand pink 8.64 px at 72°, sea blue 9.72 px at
    // 12°, the shell's own pink 7.6 px at 72° and yellow 7.55 px at 43°
    const LP = { o: [41.63, 46.93], a: [-8.2207, 2.6585], b: [2.659, 8.2202] };
    const LB = { o: [679.0, 42.48], a: [-2.0072, 9.5118], b: [9.509, 2.0057] };
    const LSP = { o: [315.88, 402.94], a: [-7.3326, 2.3611], b: [2.3287, 7.1881] };
    const LSY = { o: [314.38, 401.84], a: [-5.097, 5.558], b: [5.5731, 5.0754] };
    // the film weaves: the cut's first frame is the same print moved (−3, 0)
    const [dx, dy] = [[-3, 0], [0, 0], [0, 0]][Math.min(2, lf)];
    U.px(press, () => {
        press.save(); press.each((g) => g.translate(dx, dy));
        // ------------------------------------------------------------ sand
        Y.fillStyle = T(0.92); Y.fillRect(0, 0, 1080, 1080);
        U.screen(P, 'pink', LP, (m) => { m.fillStyle = T(0.12); m.fillRect(0, 0, 1080, 1080); });
        // pink hairs in the sand
        const rs = Motion.rng('shell-hair');
        for (let k = 0; k < 30; k++) {
            const x = rs() * 1080, y = rs() * 1080, l = 50 + rs() * 90, a = 0.9 + rs() * 0.5, b = (rs() - 0.5) * 20;
            U.brush(P, [[x, y], [x + Math.cos(a) * l * 0.5 + b, y + Math.sin(a) * l * 0.5], [x + Math.cos(a) * l, y + Math.sin(a) * l]], 2.4, T(1), 'sh' + k, { taper: 0.3 });
        }
        // pink seeds
        for (const [x, y, r, a] of [[97, 742, 20, 0], [38, 340, 9, 0.8], [384, 1020, 10, 1.2], [656, 1052, 20, 0]]) {
            P.save(); P.translate(x, y); P.rotate(a); P.fillStyle = T(1); P.beginPath(); P.ellipse(0, 0, r, r * 0.4, 0, 0, 7); P.fill(); P.restore();
        }
        // ------------------------------------------------------------ the water's edge
        // measured: the sea's edge, the foam band's inner edge (colour runs every 50 px)
        const seaEdge = [[600, -20], [610, 0], [705, 40], [790, 80], [800, 120], [830, 160], [863, 200], [891, 240], [914, 280], [936, 320], [962, 360], [974, 400], [979, 440], [977, 480], [972, 520], [960, 560], [954, 600], [946, 640], [944, 680], [942, 720], [952, 760], [961, 800], [982, 840], [1006, 880], [1034, 920], [1070, 960], [1100, 995]];
        const foamIn = [[520, -20], [530, 0], [582, 40], [653, 80], [705, 120], [732, 160], [777, 200], [817, 240], [865, 280], [891, 320], [901, 360], [914, 400], [930, 440], [918, 480], [898, 520], [909, 560], [918, 600], [906, 640], [884, 680], [900, 720], [905, 760], [907, 800], [928, 840], [964, 880], [978, 920], [1012, 960], [1059, 1000], [1100, 1035]];
        const sea = seaEdge.concat([[1100, 1100], [1100, -20]]);
        const foam = foamIn.concat(seaEdge.slice().reverse().concat([[1100, 1100]]).slice(0, -1).reverse().reverse());
        // wet sand: a deeper band with navy dots before the foam
        U.screen(N, 'navy', LP, (m) => U.soft(m, 20, (c) => U.brush(c, foamIn.map(([x, y]) => [x - 80, y]), 150, T(0.18), 'swet', { taper: 0 })));
        // the sea: yellow and blue dots, bluer to the upper right
        U.cut([P, N], (g) => { g.beginPath(); U.smooth(g, sea); g.fill(); });
        U.clipped(Y, sea, true, (g) => { g.globalCompositeOperation = 'destination-out'; const gr = g.createLinearGradient(1080, 0, 850, 700); gr.addColorStop(0, T(0.85)); gr.addColorStop(0.5, T(0.55)); gr.addColorStop(1, T(0.45)); g.fillStyle = gr; g.fillRect(0, 0, 1080, 1080); });
        U.screen(B, 'blue', LB, (m) => U.clipped(m, sea, true, (c) => { const gr = c.createLinearGradient(1080, 0, 850, 800); gr.addColorStop(0, T(0.62)); gr.addColorStop(1, T(0.42)); c.fillStyle = gr; c.fillRect(0, 0, 1080, 1080); }));
        // foam: white between its inner edge and the sea, bubbles (blue dots) on the sea side
        const foamPoly = foamIn.concat(seaEdge.slice().reverse());
        press.knockout((g) => { g.beginPath(); U.smooth(g, foamPoly); g.fill(); });
        const rb = Motion.rng('shell-bub');
        for (let k = 0; k < 90; k++) {
            const i = Math.floor(rb() * (seaEdge.length - 2)) + 1, [x, y] = seaEdge[i], r = 2 + rb() * 5;
            B.fillStyle = T(0.9); B.beginPath(); B.arc(x - rb() * 60, y + (rb() - 0.5) * 50, r, 0, 7); B.fill();
        }
        // swash lines: thin white lines parallel to the foam on the wet sand
        for (const [dx, w, s0, s1] of [[-35, 9, 0.35, 0.95], [-85, 7, 0.1, 0.95], [-125, 6, 0.3, 0.75], [-160, 5, 0.05, 0.4]]) {
            const n = foamIn.length, pts = foamIn.slice(Math.floor(n * s0), Math.ceil(n * s1)).map(([x, y]) => [x + dx, y]);
            press.knockout((g) => U.brush(g, pts, w, '#000', 'ssw' + dx, { taper: 0.2 }));
        }
        // the white streak above the shell
        press.knockout((g) => U.brush(g, [[385, 238], [430, 250], [480, 262], [520, 268], [566, 272], [610, 290]], 16, '#000', 'sst', { taper: 0.25 }));
        // ------------------------------------------------------------ the shell
        const shell = [[172, 155], [207, 176], [244, 198], [282, 219], [320, 244], [360, 259], [400, 278], [424, 302], [482, 315], [524, 333], [551, 360], [600, 366], [650, 385], [686, 408], [717, 434], [747, 462], [772, 492], [796, 525], [820, 560], [840, 610], [852, 660], [855, 700], [840, 740], [816, 766], [798, 782], [786, 828], [778, 881], [772, 918], [740, 912], [671, 901], [586, 897], [494, 889], [417, 866], [355, 812], [322, 751], [301, 717], [287, 676], [284, 633], [283, 592], [270, 550], [262, 505], [260, 460], [263, 424], [249, 392], [236, 350], [223, 318], [210, 277], [195, 237], [183, 197]];
        // its shadow: navy hatching along the lower-left side
        U.clipped(N, [[140, 150], [260, 420], [300, 760], [440, 900], [760, 950], [780, 990], [400, 960], [220, 800], [150, 450], [120, 180]], false, (g) => U.hatch(g, 'ssd', [120, 150, 800, 1000], [0.75, 1], 5, 2.4, T(0.8), { bend: 3, len: 0.2 }));
        U.soft(N, 6, (g) => U.brush(g, shell.slice(28).concat([shell[0]]).map(([x, y]) => [x - 10, y + 12]), 18, T(0.5), 'ssh', { taper: 0.1 }));
        press.knockout((g) => { g.beginPath(); U.smooth(g, shell); g.fill(); });
        // the pale body: the shell's own fine screens
        U.screen(P, 'pink', LSP, (m) => U.clipped(m, shell, true, (c) => { c.fillStyle = T(0.2); c.fillRect(0, 0, 1080, 1080); }));
        U.screen(Y, 'yellow', LSY, (m) => U.clipped(m, shell, true, (c) => { c.fillStyle = T(0.2); c.fillRect(0, 0, 1080, 1080); }));
        // three orange zigzag bands (centres from scans across the axis), flat pink + yellow
        const zig = (pts, w, amp, seed) => {
            const out = [], r = Motion.rng(seed);
            for (let i = 0; i < pts.length - 1; i++) {
                const [x0, y0] = pts[i], [x1, y1] = pts[i + 1], l = Math.hypot(x1 - x0, y1 - y0), nx = -(y1 - y0) / l, ny = (x1 - x0) / l, n = Math.max(1, Math.round(l / 22));
                for (let k = 0; k < n; k++) { const s = k / n, z = (k % 2 ? 1 : -1) * amp * (0.7 + 0.5 * r()); out.push([x0 + (x1 - x0) * s + nx * z, y0 + (y1 - y0) * s + ny * z]); }
            }
            out.push(pts[pts.length - 1]);
            return out;
        };
        const bands = [
            [[[205, 215], [240, 290], [281, 374], [302, 408], [304, 458], [329, 489], [342, 530], [348, 576], [370, 608], [367, 664], [392, 695], [411, 731], [423, 773], [474, 834], [517, 851], [545, 879]], 26],
            [[[250, 225], [300, 290], [328, 336], [353, 367], [370, 405], [404, 429], [419, 468], [440, 502], [476, 577], [505, 605], [522, 642], [537, 681], [587, 743], [609, 777], [647, 798], [690, 830]], 30],
            [[[400, 300], [439, 350], [520, 372], [577, 393], [604, 422], [641, 444], [672, 470], [702, 497], [727, 528], [751, 560], [783, 588], [800, 625], [818, 665], [822, 709]], 30],
        ];
        U.clipped(P, shell, true, (g) => bands.forEach(([pts, w], i) => U.brush(g, zig(pts, w, 9, 'sz' + i), w, T(1), 'szb' + i, { taper: 0.1, wob: 0.25 })));
        U.clipped(Y, shell, true, (g) => bands.forEach(([pts, w], i) => U.brush(g, zig(pts, w, 9, 'sz' + i), w, T(1), 'szb' + i, { taper: 0.1, wob: 0.25 })));
        // fine light hatching across the bands
        U.clipped(P, shell, true, (g) => { g.globalCompositeOperation = 'destination-out'; U.hatch(g, 'shb', [150, 150, 860, 920], [0.62, 0.78], 7, 1.6, T(0.5), { bend: 1, len: 0.15 }); });
        // ------------------------------------------------------------ the aperture
        const ap = [[537, 373], [580, 380], [623, 394], [670, 422], [716, 459], [755, 510], [787, 566], [812, 616], [830, 666], [838, 705], [837, 730], [830, 752], [816, 766], [790, 768], [751, 751], [705, 712], [659, 666], [620, 625], [587, 587], [560, 550], [537, 509], [518, 470], [509, 437], [506, 405], [515, 385]];
        U.cut([P, Y, N, B], (g) => { g.beginPath(); U.smooth(g, ap); g.fill(); });
        U.fill(P, ap, T(1), true);
        // red on the outer side: yellow from the highlight to the right edge
        U.clipped(Y, ap, true, (g) => U.soft(g, 14, (c) => { c.fillStyle = T(0.9); c.beginPath(); U.trace(c, [[600, 380], [700, 440], [830, 620], [850, 770], [760, 700], [690, 560], [630, 470]]); c.fill(); }));
        // navy dots on the inner side, densest centre-left
        U.screen(N, 'navy', LSY, (m) => U.clipped(m, ap, true, (c) => { c.save(); c.translate(610, 560); c.rotate(0.9); c.scale(1, 0.45); U.glow(c, 0, 0, 170, 0.55, 0); c.restore(); }));
        // cracks
        for (const pts of [[[585, 560], [620, 575], [660, 590], [700, 600]], [[620, 600], [650, 610], [690, 640]], [[560, 530], [590, 545]]]) U.brush(N, pts, 2.2, T(0.9), 'scr' + pts[0][0], { taper: 0.3 });
        // the white highlight streak
        press.knockout((g) => U.brush(g, [[620, 452], [660, 495], [700, 540], [740, 595], [772, 645]], (s) => 16 * Math.sin(Math.PI * Math.min(1, s * 1.1)), '#000', 'shl', { taper: 0.1 }));
        // ------------------------------------------------------------ outlines
        const teal = (pts, w, seed, close) => { for (const [g, v] of [[N, 0.85], [B, 0.8]]) U.brush(g, close ? pts.concat([pts[0]]) : pts, w, T(v), seed, { taper: close ? 0 : 0.2, wob: 0.15 }); };
        teal(shell, 5, 'sol', true);
        teal(ap, 4.5, 'sao', true);
        // whorl lines across the spire, the growth lines on the body
        for (const pts of [[[205, 182], [196, 200], [185, 214]], [[248, 205], [238, 228], [205, 245]], [[322, 246], [300, 290], [260, 320], [236, 330]], [[424, 302], [405, 360], [360, 400], [300, 420], [262, 424]], [[540, 380], [520, 450], [470, 520], [400, 565], [330, 585], [284, 592]]]) teal(pts, 3.2, 'sw' + pts[0][0], false);
        for (let k = 0; k < 9; k++) {
            const y0 = 610 + k * 34, x0 = 320 + k * 18;
            teal([[x0, y0 + 20], [x0 + 110, y0 - 10], [x0 + 230, y0 - 50 + k * 3]], 2, 'sg' + k, false);
        }
        press.restore();
    });
};
