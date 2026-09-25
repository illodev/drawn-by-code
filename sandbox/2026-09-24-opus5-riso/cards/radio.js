// Card «radio» (reference 9.0–9.25 s, full frame; re-inked at 15.625): a cathedral radio
// on a table, sound waves round it as yellow ribbons braided with red ones. Authored in
// reference pixels on the 9.083 s frame (f218) and measured there: runs along rows and
// columns for every edge, a polar scan round the hub for the grille's bars, ink coverages
// unmixed from 40 px means, the screens' lattices (pitch, angle, phase) from their spectra.
// The film pushes in 0.77 % a frame (four corner patches correlated frame to frame): the
// card zooms per drawing.
// Separations:
//   wall   navy flat; clean pink dots (10.25 px at 14.8°) where the navy is cleared, densest
//          round the radio; blue dots in the corners and at the top
//   table  pink flat with navy dots (9.17 px), yellow under the radio (a red glow), a paper
//          line along its front edge
//   ribbons yellow flat with a paper edge on one side; red (pink + yellow) twins braided
//   cabinet yellow flat; a fine pink screen (orange) and fine navy dots (brown shading);
//          the side face dense navy; a lit green bevel (yellow + blue) on the left
//   darks  black-green: navy + yellow + blue, every other plate cleared under them
// Needs cards/_g3-util.js.
var CARDS = CARDS || {};
CARDS.radio = (press, t, lf) => {
    const { T, lat, ribbon, path, smooth } = G3;
    const P = (ink) => press.plate(ink);
    const Y = P('yellow'), K = P('pink'), B = P('blue'), N = P('navy');
    const d = Math.min(2, Math.floor(t * 12 + 1e-6));
    const clr = (g) => { g.save(); g.globalCompositeOperation = 'destination-out'; return g; };
    const fillP = (g, pts, v = 1, sm = true) => { g.fillStyle = T(v); if (sm) smooth(g, pts); else path(g, pts); g.fill(); };
    // screens measured on f218 (ref px): [ax, ay, bx, by, x0, y0]
    const L_WALL = [9.908, 2.624, -2.603, 9.887, 118.6, 704.5];
    const L_WALLB = [9.865, -2.649, 2.649, 10.188, 466.1, 79.7];
    const L_TABLE = [8.867, 2.377, -2.327, 8.866, 467.8, 1028.3];
    const L_CABN = [7.942, 2.064, -2.051, 7.731, 392.0, 932.8];
    const L_CABP = [7.021, -1.742, 1.742, 7.021, 326.5 + 4.38, 749.6 + 2.64];
    const cl = (v) => Math.max(0, Math.min(1, v));
    G3.ref(press, G3.push(0.0077, t, lf, 2), () => {
        // ------------------------------------------------------------ the wall
        const WALL_B = 988;
        N.fillStyle = T(1); N.fillRect(-60, -60, 1200, WALL_B + 60);
        // pink coverage (unmixed on a 60 px grid): 0.6 beside the radio, 0.1 in the corners;
        // it falls off slower on the left than on the right
        const pk = (x, y) => {
            const dx = x < 500 ? (x - 500) / 1.25 : (x - 500) / 0.95, dy = y < 640 ? (y - 640) / 0.85 : (y - 640) * 0.9;
            const r = Math.hypot(dx, dy), e = Math.max(0, r - 250);
            return cl(0.8 * Math.exp(-Math.pow(e / 260, 1.3)));
        };
        const bl = (x, y) => cl(0.55 - 0.95 * pk(x, y) + (y > 930 && (x < 230 || x > 770) ? 0.1 : 0));
        lat(N, L_WALL, pk, -40, -40, 1120, WALL_B, { clear: true, rk: 0.75 });
        lat(K, L_WALL, pk, -40, -40, 1120, WALL_B);
        lat(N, L_WALLB, bl, -40, -40, 1120, WALL_B, { clear: true, rk: 0.75 });
        lat(B, L_WALLB, bl, -40, -40, 1120, WALL_B);
        // ------------------------------------------------------------ the table
        K.fillStyle = T(1); K.fillRect(-60, WALL_B, 1200, 200);
        const glow = (x, y) => cl(1 - Math.pow(Math.abs(x - 490) / 300, 2.2));
        lat(Y, [5.1, 1.3, -1.3, 5.1, 0, 0], (x, y) => glow(x, y) * 0.62, -40, WALL_B, 1120, 1120, { jit: 0.05 });
        lat(N, L_TABLE, (x, y) => 0.45 + 0.3 * (1 - glow(x, y)), -40, WALL_B, 1120, 1120);
        // the front edge: a paper line, the wall above it bluer
        press.knockout((g) => { g.fillStyle = '#000'; g.fillRect(-60, WALL_B - 2, 1200, 3.5); });
        // ------------------------------------------------------------ the ribbons
        // centrelines [x, y, width] from yellow / red runs along every 20th row and 30th column
        const YR = [
            // [points, paper side (+1 left of travel, -1 right, 0 none)]
            [[[0, 183, 10], [30, 160, 16], [60, 137, 18], [80, 118, 13], [118, 98, 8], [135, 90, 3]], 1],
            [[[335, -10, 12], [300, 5, 12], [270, 16, 10], [245, 28, 4]], -1],
            [[[208, 198, 4], [176, 220, 10], [153, 240, 14], [136, 260, 16], [122, 280, 16], [109, 300, 15], [99, 320, 13], [90, 340, 10], [80, 360, 8], [69, 380, 10], [60, 400, 12], [52, 420, 8], [46, 438, 3]], 1],
            [[[27, 474, 4], [22, 490, 12], [19, 510, 13], [15, 530, 12], [11, 550, 12], [8, 570, 12], [7, 590, 12], [7, 610, 11], [8, 630, 9], [11, 650, 7], [15, 666, 3]], 1],
            [[[230, 346, 4], [213, 360, 9], [195, 380, 11], [183, 400, 11], [173, 420, 11], [163, 440, 12], [156, 460, 13], [150, 480, 14], [147, 500, 16], [144, 520, 20], [142, 540, 19], [141, 560, 21], [142, 580, 18], [143, 600, 15], [145, 620, 13], [147, 640, 13], [150, 660, 11], [150, 680, 6], [150, 692, 2]], -1],
            [[[282, 307, 5], [300, 296, 10], [330, 282, 13], [360, 270, 17], [390, 259, 15], [420, 252, 12], [450, 245, 10], [480, 238, 10], [510, 240, 10], [540, 246, 6], [570, 252, 8], [600, 263, 14], [630, 280, 16], [660, 300, 12], [690, 316, 8], [706, 336, 4]], 1],
            [[[808, 532, 4], [810, 547, 12], [816, 560, 16], [818, 580, 18], [818, 600, 18], [817, 620, 16], [813, 640, 15], [806, 660, 12], [796, 680, 6], [787, 700, 4], [782, 714, 2]], -1],
            [[[911, 652, 4], [917, 665, 12], [914, 680, 12], [910, 700, 11], [905, 720, 12], [900, 740, 13], [894, 760, 12], [886, 776, 4]], -1],
            [[[728, 196, 4], [754, 220, 9], [783, 240, 14], [805, 260, 14], [823, 280, 12], [838, 300, 11], [852, 320, 11], [863, 340, 8], [878, 360, 7], [894, 380, 9], [905, 400, 12], [912, 420, 14], [920, 440, 11], [927, 460, 8], [931, 480, 10], [936, 500, 14], [939, 520, 13], [940, 540, 6], [940, 550, 2]], -1],
            [[[838, 96, 4], [852, 101, 10], [879, 120, 14], [904, 140, 12], [925, 160, 6], [941, 180, 5], [953, 200, 6], [964, 220, 6], [978, 240, 5], [985, 260, 7], [995, 280, 8], [1002, 300, 8], [1008, 320, 7], [1014, 340, 5], [1021, 360, 5], [1030, 380, 8], [1040, 400, 14], [1047, 420, 17], [1054, 440, 13], [1062, 460, 7], [1071, 480, 6], [1082, 498, 4]], -1],
            [[[1080, 672, 4], [1071, 700, 10], [1063, 720, 10], [1052, 740, 12], [1045, 760, 12], [1035, 780, 8], [1026, 800, 6], [1017, 820, 5], [1012, 834, 2]], -1],
            [[[268, 162, 4], [300, 152, 16], [330, 146, 22], [360, 140, 13], [390, 132, 7], [420, 128, 5], [450, 122, 8], [480, 119, 18], [510, 120, 21], [540, 120, 13], [570, 124, 8], [600, 133, 11], [630, 143, 12], [650, 152, 8], [668, 162, 3]], -1],
            [[[598, -6, 8], [630, 2, 10], [660, 9, 10], [690, 20, 8], [712, 29, 3]], -1],
            [[[700, -4, 5], [728, 8, 6], [750, 20, 5], [772, 34, 2]], -1],
        ];
        const RR = [
            [[0, 254, 8], [30, 222, 12], [60, 181, 13], [90, 121, 14], [120, 76, 14], [150, 43, 13], [180, 25, 12], [210, 13, 10], [250, 3, 9], [292, -6, 6]],
            [[150, 494, 4], [160, 470, 12], [172, 448, 16], [186, 428, 15], [200, 405, 13], [214, 382, 8], [230, 360, 6], [247, 338, 8], [262, 318, 12], [280, 298, 14], [300, 278, 16], [325, 258, 12], [360, 246, 9], [420, 238, 10], [450, 243, 11], [480, 247, 9], [510, 253, 7], [545, 261, 5], [578, 269, 2]],
            [[688, 316, 3], [705, 332, 9], [720, 342, 12], [736, 362, 14], [746, 380, 14], [760, 400, 14], [773, 420, 13], [781, 440, 9], [786, 456, 3]],
            [[860, 156, 4], [884, 180, 10], [906, 200, 12], [934, 220, 16], [965, 240, 12], [1000, 260, 7], [1027, 280, 15], [1046, 300, 14], [1062, 314, 4]],
            [[656, -8, 6], [685, 0, 10], [733, 20, 9], [768, 40, 8], [788, 54, 3]],
        ];
        // each drawing re-paints the ribbons (a slight wobble, measured corr 0.96–0.99)
        const wob = (pts, k) => pts.map(([x, y, w], i) => [x + Math.sin(i * 1.7 + d * 2.1 + k) * 1.5, y + Math.cos(i * 1.3 + d * 1.7 + k) * 1.5, w * 1.35]);
        YR.forEach(([pts0, side], k) => {
            const pts = wob(pts0, k);
            if (side) press.knockout((g) => { path(g, ribbon(pts, { shift: 0.28 * side })); g.fill(); path(g, ribbon(pts.map(([x, y, w]) => [x, y, w + 5]), { shift: 0.2 * side })); g.fill(); });
            else press.knockout((g) => { path(g, ribbon(pts)); g.fill(); });
            fillP(Y, ribbon(pts), 1, false);
        });
        RR.forEach((pts0, k) => {
            const pts = wob(pts0, k + 20);
            press.knockout((g) => { path(g, ribbon(pts)); g.fill(); });
            fillP(K, ribbon(pts), 1, false); fillP(Y, ribbon(pts), 1, false);
        });
        // ------------------------------------------------------------ the radio
        // silhouette (outer edge of the outline), measured along rows and columns
        const SIL = [[247, 953], [249, 830], [250, 700], [252, 590], [258, 520], [268, 474], [282, 437], [305, 398], [335, 362], [370, 333], [410, 310], [450, 292], [490, 278], [522, 270], [556, 272], [590, 284], [628, 305], [662, 334], [695, 372], [720, 420], [735, 470], [742, 520], [744, 600], [743, 700], [742, 800], [742, 953]];
        // the front/side divide: a dark line from the crown down the right
        const DIV = [[470, 286], [520, 306], [580, 336], [625, 372], [652, 410], [670, 450], [680, 500], [688, 560], [692, 640], [694, 720], [693, 800], [693, 880], [695, 953]];
        const sil = (g) => { smooth(g, SIL, false); g.closePath(); };
        press.knockout((g) => { sil(g); g.fill(); });
        // the cabinet's paint: yellow flat, the pink screen and the navy dots by region
        Y.save(); Y.beginPath(); sil(Y); Y.clip(); Y.fillStyle = T(1); Y.fillRect(0, 0, 1080, 1080); Y.restore();
        // tone maps from the unmix: pink ~0.8 on the crown and the base, ~0.4 in the grille,
        // ~0.1 in the lit centre; navy ~0.15–0.4 on the front, 0.7 on the side and edges
        const inGr = (x, y) => y > 385 && y < 700 && Math.abs(x - 473) < 130 && (y > 536 || Math.hypot(x - 473, y - 536) < 130);
        const lit = (x, y) => Math.exp(-Math.pow(Math.hypot((x - 482) / 175, (y - 772) / 68), 2.2));
        const pkT = (x, y) => cl((inGr(x, y) ? 0.1 + 0.4 * Math.min(1, Math.max(0, (490 - y) / 90)) : y < 460 ? 0.88 : y < 700 ? 0.55 : y < 860 ? 0.55 : 0.9) * (1 - 0.9 * lit(x, y)) + (x < 300 ? 0.05 : 0));
        const nvT = (x, y) => {
            if (inGr(x, y)) return 0;
            let v = 0.18 + 0.25 * Math.max(0, (x - 600) / 90) + 0.25 * Math.max(0, (330 - x) / 60) + (y < 360 ? 0.1 : 0);
            if (y > 860) v = 0.25 + 0.3 * Math.max(0, (x - 620) / 70);
            return cl(0.75 * v * (1 - 0.75 * lit(x, y)));
        };
        const inSil = (g, fn) => { g.save(); g.beginPath(); sil(g); g.clip(); fn(g); g.restore(); };
        inSil(K, (g) => lat(g, L_CABP, pkT, 240, 260, 750, 960, { jit: 0.2 }));
        inSil(N, (g) => lat(g, L_CABN, nvT, 240, 260, 750, 960, { jit: 0.2 }));
        // the side face: dense navy dots on red
        const side = (g) => { g.beginPath(); g.moveTo(...DIV[0]); for (const p of DIV) g.lineTo(...p); for (const p of SIL.slice(12).reverse()) g.lineTo(...p); g.closePath(); };
        for (const [g, L, f] of [[N, L_CABN, () => 0.5], [K, L_CABP, () => 0.85]]) { g.save(); side(g); g.clip(); lat(g, L, f, 470, 260, 750, 960, { jit: 0.2 }); g.restore(); }
        // darks: black-green = navy + yellow + blue, the other plates cleared
        const dark = (draw) => {
            for (const g of [K]) { clr(g); draw(g); g.restore(); }
            for (const [g, v] of [[N, 1], [Y, 1], [B, 0.8]]) { g.save(); g.fillStyle = T(v); g.strokeStyle = T(v); draw(g); g.restore(); }
        };
        // the outline: a band inside the silhouette, thicker on the right, blue on the lit left
        const OUT_IN = SIL.map(([x, y]) => [x + (x < 400 ? 9 : x > 600 ? -11 : 0), y + (y < 440 ? 10 : 0)]);
        dark((g) => { g.beginPath(); smooth(g, SIL.slice(8), false); for (const p of OUT_IN.slice(8).reverse()) g.lineTo(...p); g.closePath(); g.fill(); });
        // the lit left edge: a navy-blue rim, then the green bevel (yellow + blue dots)
        const rim = (off, w) => SIL.slice(0, 13).map(([x, y], i) => [x + off * (i < 8 ? 1 : 0.8), y + off * (i >= 6 ? 0.8 : 0), w]);
        { const pts = rim(5, 10); clr(K); K.fillStyle = '#000'; path(K, ribbon(pts, { taper: 0.05 })); K.fill(); K.restore(); fillP(N, ribbon(pts, { taper: 0.05 }), 0.85, false); fillP(B, ribbon(pts, { taper: 0.05 }), 0.9, false); }
        { const pts = rim(30, 17).slice(0, 11), rb = ribbon(pts, { taper: 0.1 }); for (const g of [K, N]) { clr(g); g.fillStyle = '#000'; path(g, rb); g.fill(); g.restore(); } B.save(); path(B, rb); B.clip(); lat(B, L_CABN, () => 0.55, 240, 300, 360, 960, { jit: 0.2 }); B.restore(); N.save(); path(N, rb); N.clip(); lat(N, L_CABN, () => 0.2, 240, 300, 360, 960, { jit: 0.3 }); N.restore(); }
        // the divide and the front's inner arch line
        dark((g) => { g.lineCap = 'round'; g.lineJoin = 'round'; g.lineWidth = 12; smooth(g, DIV, false); g.stroke(); });
        const ARCH = [[300, 950], [299, 800], [298, 660], [302, 540], [315, 460], [340, 405], [380, 366], [430, 340], [476, 330], [520, 333], [565, 347], [610, 375], [640, 410], [662, 455], [675, 500]];
        dark((g) => { g.lineCap = 'round'; g.lineWidth = 4.5; g.globalAlpha = 0.85; smooth(g, ARCH, false); g.stroke(); });
        // ------------------------------------------------------------ the grille
        const GC = 473, GS = 536, GRX = 150, GRY = 151, GB = 700;
        const gout = (g, k = 0) => { g.moveTo(GC - GRX + k, GB); g.lineTo(GC - GRX + k, GS); g.ellipse(GC, GS, GRX - k, GRY - k, 0, Math.PI, 0); g.lineTo(GC + GRX - k, GB); g.closePath(); };
        dark((g) => { g.beginPath(); gout(g); gout(g, 17); g.fill('evenodd'); });
        // the mesh inside: a pink crosshatch (two families of fine lines) over the screen
        K.save(); K.beginPath(); gout(K, 17); K.clip();
        // (measured at 3×: two families of fine red lines at ±45°, ~12 px apart, clean yellow
        // between them with a few red specks)
        K.strokeStyle = T(1); K.lineWidth = 1.7;
        for (let k = -70; k < 70; k++) { const x = GC + k * 12.5; K.beginPath(); K.moveTo(x - 420, 300); K.lineTo(x, 720); K.stroke(); K.beginPath(); K.moveTo(x + 420, 300); K.lineTo(x, 720); K.stroke(); }
        K.restore();
        // eight bars fanning from the hub (polar scan at r 80/110/150: -170, -148.5, -126,
        // -104, -79.5, -57, -34.3, -9.6°), widening outward 9 → 17 px
        const HX = 478, HY = 692;
        dark((g) => {
            g.save(); g.beginPath(); gout(g, 12); g.clip();
            for (const deg of [-170, -148.5, -126, -104, -79.5, -57, -34.3, -9.6]) {
                const a = (deg * Math.PI) / 180, c = Math.cos(a), s = Math.sin(a), w0 = 4.5, w1 = 9.5;
                g.beginPath(); g.moveTo(HX + c * 30 - s * w0, HY + s * 30 + c * w0); g.lineTo(HX + c * 330 - s * w1, HY + s * 330 + c * w1); g.lineTo(HX + c * 330 + s * w1, HY + s * 330 - c * w1); g.lineTo(HX + c * 30 + s * w0, HY + s * 30 - c * w0); g.closePath(); g.fill();
            }
            g.restore();
            // the bottom band and the hub dome
            g.beginPath(); g.moveTo(GC - GRX + 2, 687); g.lineTo(GC + GRX - 2, 687); g.lineTo(GC + GRX - 2, 702); g.lineTo(GC - GRX + 2, 702); g.closePath(); g.fill();
            g.beginPath(); g.ellipse(477, 697, 56, 52, 0, Math.PI, 0); g.fill();
        });
        // the red highlight on the dome (pink + yellow, the darks cleared)
        const hl = ribbon([[432, 683, 3], [445, 670, 5], [458, 663, 5], [472, 660, 3]], { taper: 0.3 });
        for (const g of [N, B]) { clr(g); path(g, hl); g.fill(); g.restore(); }
        fillP(K, hl, 1, false);
        // ------------------------------------------------------------ the dial
        const DL = [[338, 782], [360, 766], [400, 759], [476, 757], [550, 759], [592, 766], [612, 782], [592, 798], [550, 804], [476, 806], [400, 804], [360, 798]];
        const dialIn = DL.map(([x, y]) => [476 + (x - 476) * 0.955, 782 + (y - 782) * 0.72]);
        dark((g) => { g.beginPath(); smooth(g, DL, true, false); smooth(g, dialIn, true, false); g.fill('evenodd'); });
        for (const g of [K, N]) { clr(g); g.beginPath(); smooth(g, dialIn); g.fill(); g.restore(); }
        K.save(); K.beginPath(); smooth(K, dialIn); K.clip(); lat(K, L_CABP, (x) => cl(0.45 * Math.pow(Math.abs(x - 480) / 130, 3)), 330, 750, 620, 810); K.restore();
        // ticks: green (yellow + blue), long every fourth; the red needle
        const TX = [400, 410, 420, 432, 443, 453, 463, 473, 485, 497, 507, 528, 540, 550, 572];
        B.save(); B.fillStyle = T(0.95);
        TX.forEach((x, i) => { const long = [0, 4, 8, 11, 14].includes(i); B.fillRect(x - 1.3, 763, 2.6, long ? 16 : 9); });
        B.restore();
        fillP(K, [[511.5, 762], [515, 762], [515.5, 801], [512, 801]], 1, false);
        // ------------------------------------------------------------ the knobs
        for (const [kx, ky] of [[376, 887], [477, 887], [579, 887]]) {
            dark((g) => { g.beginPath(); g.ellipse(kx, ky, 21.5, 20.5, 0, 0, 7); g.fill(); });
            // the lit rim top left: paper with a pink and blue fringe
            const arc = [];
            for (let k = 0; k <= 8; k++) { const a = -2.75 + k * 0.17; arc.push([kx + Math.cos(a) * 14.5, ky + Math.sin(a) * 13, 3.6 * Math.sin((k / 8) * Math.PI) + 0.6]); }
            press.knockout((g) => { path(g, ribbon(arc, { taper: 0.3 })); g.fill(); });
            fillP(K, ribbon(arc.map(([x, y, w]) => [x - 1.5, y - 1.5, w * 0.6]), { taper: 0.3 }), 0.55, false);
        }
        // ------------------------------------------------------------ the plinth
        const TIER = [[220, 942], [770, 940], [781, 950], [776, 961], [220, 962]];
        const SLAB = [[218, 961], [746, 961], [748, 995], [220, 996]];
        press.knockout((g) => { path(g, TIER); g.fill(); path(g, SLAB); g.fill(); });
        dark((g) => { path(g, TIER); g.fill(); path(g, SLAB); g.fill(); });
        const PF = [[224, 969], [741, 969], [742, 990], [226, 991]];
        for (const g of [N, B]) { clr(g); path(g, PF); g.fill(); g.restore(); }
        fillP(K, PF, 0.95, false);
        N.save(); path(N, PF); N.clip(); lat(N, L_CABN, () => 0.42, 220, 960, 750, 995); N.restore();
        const PT = ribbon([[226, 966, 2.4], [480, 965.5, 3], [740, 966, 2.4]], { taper: 0.02 });
        for (const g of [N, B, K]) { clr(g); path(g, PT); g.fill(); g.restore(); }
        fillP(K, PT, 0.25, false);
    });
};
