// Card «whale» (reference 11.0–11.25 s, frames 264–269; re-shown mirrored in the pink run):
// a whale gliding through blue water, shafts of light from above, arcs of light round its
// head. Authored in reference px (the 1080 frame), measured on frame 266: outlines from
// colour-run scans, inks solved from 30 px means, screens fitted with a DFT (pitch 12.05 px:
// blue 14.9°, navy 75.05°, yellow 45.1°). Needs _g4-util.js (G4).
var CARDS = CARDS || {};
CARDS.whale = (press, t) => {
    const U = G4, T = U.T;
    const d = Math.floor(t * 12 + 1e-6);
    const pink = press.plate('pink'), blue = press.plate('blue'), navy = press.plate('navy'), yellow = press.plate('yellow');
    const off = (g, fn) => { g.save(); g.globalCompositeOperation = 'destination-out'; g.fillStyle = '#000'; g.strokeStyle = '#000'; fn(g); g.restore(); };
    U.refpx(press);
    // the print drifts a little per drawing (whole-frame shift measured on 264/266/268)
    const PAN = [[0, 0], [1.5, 0.5], [2.5, 2]][Math.min(2, d)];
    press.each((g) => g.translate(PAN[0], PAN[1]));

    // ── water: blue ink with paper holes (white dots on blue), deeper to the bottom; navy
    // dots from 620 px down. Tones from row means (blue 0.38 at the top → solid by 660)
    const LB = { p: 12.05, a: 14.9, x: 542.2, y: 229.5 }, LN = { p: 12.05, a: 75.05, x: 860.2, y: 996.8 }, LY = { p: 12.05, a: 45.15, x: 79.7, y: 238.6 };
    const ramp = (g, stops) => { g.fillStyle = U.lin(g, 0, 0, 0, 1080, stops); g.fillRect(-20, -20, 1120, 1120); };
    // [top-left, top-right, a left point, a right point, yellow tone stops (by y / y1), y1];
    // tones solved from 30 px means along each shaft (yellow + blue, the blue thinned inside)
    const SHAFTS = [
        [[0, 0], [90, 0], [118, 450], [205, 450], [[0, 0.5], [0.5, 0.52], [0.68, 0.31], [0.87, 0.24], [1, 0]], 620],
        [[126, 0], [216, 0], [300, 600], [372, 600], [[0, 0.8], [0.43, 0.65], [0.6, 0.63], [0.77, 0.48], [1, 0]], 700],
        [[643, 0], [740, 0], [790, 450], [865, 450], [[0, 0.42], [0.48, 0.38], [0.68, 0.33], [0.87, 0.25], [1, 0]], 620],
        [[830, 0], [912, 0], [990, 560], [1075, 560], [[0, 0.48], [0.47, 0.39], [0.66, 0.34], [0.84, 0.45], [1, 0]], 640],
    ];
    const shaftPath = (g, [a, b, c, e, , y1]) => {
        g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]);
        g.lineTo(e[0] + (e[0] - b[0]) * ((y1 - e[1]) / e[1]), y1); g.lineTo(c[0] + (c[0] - a[0]) * ((y1 - c[1]) / c[1]), y1);
        g.closePath();
    };
    U.screen(press, 'blue', LB, (g) => {
        ramp(g, [[0, 0.39], [0.11, 0.44], [0.22, 0.5], [0.28, 0.54], [0.33, 0.58], [0.39, 0.62], [0.44, 0.67], [0.5, 0.74], [0.56, 0.8], [0.61, 0.85], [0.7, 0.92], [0.8, 1]]);
        // the light thins the blue inside the shafts
        g.globalCompositeOperation = 'destination-out';
        for (const sh of SHAFTS) { g.fillStyle = U.lin(g, 0, 0, 0, sh[5], [[0, 0.48], [0.65, 0.35], [0.85, 0.12], [1, 0]]); shaftPath(g, sh); g.fill(); }
        g.globalCompositeOperation = 'source-over';
    }, { mode: 'holes', jit: 0.2, pj: 0.03, edge: 0.7, also: [{ ink: 'navy', mask: (g) => ramp(g, [[0.3, 0], [0.54, 0.1], [0.65, 0.13], [1, 0.12]]) }] });
    // the ink's grain: stray pink specks and paper pinholes in the water (seen at 4×)
    U.specks(pink, 'wh-w', 1400, [0, 300, 1080, 1080], 0.7, 1.6, 0.9);
    U.speckle(press, 'wh-w', 700, [0, 0, 1080, 1080], 0.6, 1.3);
    U.screen(press, 'navy', LN, (g) => ramp(g, [[0.57, 0], [0.65, 0.2], [1, 0.27]]), { box: [0, 600, 1080, 1080], jit: 0.3, pj: 0.08, edge: 0.7 });
    pink.fillStyle = U.lin(pink, 0, 850, 0, 1080, [[0, 0], [1, 0.1]]); pink.fillRect(0, 850, 1080, 230);

    // ── shafts of light: yellow dots on their own screen, fading downwards; fine paper
    // streaks along them. Edges from row scans: [top-left, top-right, bottom-left, bottom-right]
    U.screen(press, 'yellow', LY, (g) => {
        for (const sh of SHAFTS) { g.fillStyle = U.lin(g, 0, 0, 0, sh[5], sh[4]); shaftPath(g, sh); g.fill(); }
    });
    const rs = Motion.rng('wh-streak');
    press.knockout((g) => {
        g.lineCap = 'round';
        for (const [a, b, c, e, , y1] of SHAFTS) for (let i = 0; i < 16; i++) {
            const u = rs(), v0 = 0.35 + rs() * 0.5, len = 0.05 + rs() * 0.12;
            const L = (v) => [a[0] + (b[0] - a[0]) * u + ((c[0] + (e[0] - c[0]) * u) - (a[0] + (b[0] - a[0]) * u)) * v * (y1 / c[1]), v * y1];
            const [x0, y0] = L(v0), [x2, y2] = L(v0 + len);
            g.lineWidth = 1.3 + rs() * 0.8; g.globalAlpha = 0.7;
            g.beginPath(); g.moveTo(x0, y0); g.lineTo(x2, y2); g.stroke();
        }
    });
    // sparkles: short yellow dashes left of the dot (measured on 266)
    const FLECKS = [[355, 212, 11], [392, 258, 12], [372, 291, 8], [399, 320, 12], [318, 337, 7], [366, 372, 8], [375, 390, 7], [95, 296, 22], [128, 322, 9], [300, 262, 6], [330, 300, 6], [268, 382, 8]];
    const rf = Motion.rng('wh-fleck');
    for (const sh of SHAFTS) for (let i = 0; i < 26; i++) {
        const v = 0.15 + rf() * 0.75, y = v * sh[5], xl = sh[0][0] + (sh[2][0] - sh[0][0]) * (y / sh[2][1]), xr = sh[1][0] + (sh[3][0] - sh[1][0]) * (y / sh[3][1]);
        FLECKS.push([xl + rf() * (xr - xl), y, 3 + rf() * 7]);
    }
    for (const [x, y, w] of FLECKS) {
        off(blue, (g) => { g.beginPath(); g.ellipse(x, y, w + 2, 5, -0.3, 0, 7); g.fill(); });
        U.ell(yellow, x, y, w, 4, -0.3, 1);
    }

    // ── arcs of light round the head: yellow brush arcs (thicker near the head), each with
    // a paper line just outside it. [left end, right edge y at x = 1080, width]
    // polar brush arcs round (1130, 700): each from its measured left end to past the right
    // edge (its crossing of x = 1080 measured), radius eased between the two; a paper line
    // just outside each. [left end x, y, right-edge y, width]
    const AC = [1130, 700];
    const ARCS = [[807, 213, 152, 4.5], [820, 263, 207, 4.5], [843, 320, 267, 5], [873, 378, 330, 5.5], [900, 418, 392, 6], [920, 470, 446, 6.5], [950, 515, 503, 7.5], [977, 563, 557, 10], [1003, 600, 610, 15]];
    for (const [x0, y0, y1, w] of ARCS) {
        const a0 = Math.atan2(y0 - AC[1], x0 - AC[0]) + Math.PI * 2, a1 = Math.atan2(y1 - AC[1], 1080 - AC[0]) + Math.PI * 2;
        const r0 = Math.hypot(x0 - AC[0], y0 - AC[1]), r1 = Math.hypot(1080 - AC[0], y1 - AC[1]), a2 = a1 + 0.2;
        const band = (g, o0, o1) => {
            const N = 40, pt = (k, o) => { const s = k / N, a = a0 + (a2 - a0) * s, u = Math.min(1, (a - a0) / (a1 - a0)), r = r0 + (r1 - r0) * u, hw = Math.pow(Math.sin((Math.PI / 2) * Math.min(1, s / 0.25)), 0.6); return [AC[0] + Math.cos(a) * (r + o * hw), AC[1] + Math.sin(a) * (r + o * hw)]; };
            g.beginPath();
            for (let k = 0; k <= N; k++) { const [x, y] = pt(k, o1); k ? g.lineTo(x, y) : g.moveTo(x, y); }
            for (let k = N; k >= 0; k--) { const [x, y] = pt(k, o0); g.lineTo(x, y); }
            g.fill();
        };
        press.knockout((g) => band(g, -w / 2 - 0.5, w / 2 + 5));
        yellow.fillStyle = T(1);
        band(yellow, -w / 2, w / 2);
        blue.fillStyle = T(0.55); band(blue, w / 2 + 0.5, w / 2 + 2);
    }

    // ── the whale (outlines measured by colour-run scans on frame 266, ref px)
    const BODY = [[125, 946], [180, 925], [240, 906], [300, 886], [330, 871], [360, 853], [390, 831], [420, 800], [450, 766], [480, 741], [510, 719], [540, 698], [570, 679], [600, 661], [630, 645], [660, 630], [690, 618], [720, 605], [750, 594], [780, 587], [810, 581], [840, 577], [870, 575], [900, 576], [930, 583], [960, 595], [985, 613], [1001, 636], [1008, 662], [1007, 686], [999, 705], [986, 725], [972, 745], [955, 762], [934, 780], [900, 797], [870, 809], [840, 821], [810, 833], [780, 843], [750, 850], [720, 858], [690, 866], [660, 872], [620, 880], [580, 886], [540, 893], [480, 898], [420, 907], [360, 914], [300, 924], [240, 935], [180, 948], [125, 961]];
    const FLUKE = [[-4, 853], [24, 869], [45, 886], [65, 902], [84, 924], [102, 940], [128, 944], [130, 962], [112, 968], [106, 985], [105, 1010], [102, 1035], [96, 1055], [94, 1090], [54, 1090], [53, 1050], [56, 1020], [57, 990], [51, 966], [41, 947], [27, 929], [13, 912], [2, 900], [-4, 896]];
    const FIN = [[690, 862], [650, 866], [612, 866], [600, 872], [593, 885], [589, 901], [581, 916], [566, 931], [553, 946], [543, 961], [530, 976], [510, 991], [495, 1006], [479, 1021], [462, 1036], [453, 1047], [465, 1045], [484, 1035], [505, 1019], [530, 1004], [547, 989], [568, 974], [590, 959], [598, 944], [608, 929], [631, 914], [644, 899], [652, 884], [676, 872]];
    const shape = (g) => { U.smooth(g, BODY, true, true); U.smooth(g, FLUKE, true, false); U.smooth(g, FIN, true, false); };
    press.knockout((g) => { shape(g); g.fill(); });
    // navy + pink (deep purple), a little blue; the head and the fluke more pink
    navy.fillStyle = T(0.97); shape(navy); navy.fill();
    U.clip(navy, (g) => shape(g), (g) => {
        off(g, (h) => { h.fillStyle = U.rad(h, 60, 990, 0, 140, [[0, 0.95], [1, 0]]); h.fillRect(-20, 820, 240, 280); });
        off(g, (h) => { h.fillStyle = U.rad(h, 930, 630, 0, 120, [[0, 0.22], [1, 0]]); h.fillRect(800, 500, 260, 280); });
    });
    pink.fillStyle = T(0.26); shape(pink); pink.fill();
    U.clip(pink, (g) => shape(g), (g) => {
        g.fillStyle = U.rad(g, 930, 630, 0, 140, [[0, 0.45], [1, 0]]); g.fillRect(780, 480, 300, 320);
        g.fillStyle = U.rad(g, 60, 990, 0, 140, [[0, 0.5], [1, 0]]); g.fillRect(-20, 820, 240, 280);
    });
    blue.fillStyle = T(0.15); shape(blue); blue.fill();
    U.clip(blue, (g) => shape(g), (g) => { g.fillStyle = U.rad(g, 60, 990, 0, 140, [[0, 0.85], [1, 0]]); g.fillRect(-20, 820, 240, 280); });
    // mottle: darker navy dots in the body (its own navy screen shows through)
    U.screen(press, 'navy', LN, (g) => { shape(g); g.fillStyle = T(0.2); g.fill(); }, { box: [0, 560, 1080, 1080], op: 'source-over' });

    // the body's grain: dense pink specks, navy thinned in small blotches (mottled print)
    U.clip(pink, (g) => shape(g), (g) => U.specks(g, 'wh-b', 2600, [0, 560, 1010, 1080], 0.8, 1.9, 0.85));
    U.clip(navy, (g) => shape(g), (g) => off(g, (h) => U.specks(h, 'wh-nb', 1800, [0, 560, 1010, 1080], 1, 2.6, 0.45)));
    U.clip(blue, (g) => shape(g), (g) => U.specks(g, 'wh-bb', 900, [0, 560, 1010, 1080], 0.8, 2, 0.8));

    // the stripe along the flank: navy thinned, blue shows (tapered brush)
    const STRIPE = [[236, 895], [300, 868], [360, 842], [420, 810], [450, 792], [480, 774], [510, 757], [540, 740], [570, 724], [600, 708], [630, 692], [660, 677], [690, 662], [720, 650], [750, 640], [780, 631], [810, 623], [840, 617], [870, 612], [888, 611]];
    const stripe = (g, w) => {
        const n = STRIPE.length;
        g.beginPath();
        const side = (k, sgn) => { const [x, y] = STRIPE[k], [xa, ya] = STRIPE[Math.max(0, k - 1)], [xb, yb] = STRIPE[Math.min(n - 1, k + 1)]; const L = Math.hypot(xb - xa, yb - ya), s = k / (n - 1), hw = (w / 2) * Math.pow(Math.sin(Math.PI * (0.06 + 0.9 * s)), 0.7) * (1 - 0.35 * s); return [x - ((yb - ya) / L) * hw * sgn, y + ((xb - xa) / L) * hw * sgn]; };
        for (let k = 0; k < n; k++) { const [x, y] = side(k, 1); k ? g.lineTo(x, y) : g.moveTo(x, y); }
        for (let k = n - 1; k >= 0; k--) { const [x, y] = side(k, -1); g.lineTo(x, y); }
        g.fill();
    };
    off(navy, (g) => stripe(g, 17)); off(pink, (g) => stripe(g, 17));
    blue.fillStyle = T(1); stripe(blue, 17);
    navy.fillStyle = T(0.38); stripe(navy, 17);

    // spots: pink and blue (barnacles), measured on 266
    const PINKS = [[757, 702, 4.5], [770, 714, 4], [747, 720, 4], [802, 702, 4.5], [822, 679, 3.5], [649, 729, 4], [607, 739, 4.5], [659, 747, 3.5], [625, 769, 4], [857, 787, 3.5], [560, 780, 4], [517, 797, 3.5], [467, 812, 4], [440, 775, 3], [585, 800, 3]];
    const BLUES = [[720, 704, 4], [790, 699, 4], [714, 727, 3.5], [772, 674, 3.5], [672, 700, 3.5], [647, 757, 3.5], [545, 760, 3], [595, 775, 3], [500, 790, 3]];
    for (const [x, y, r] of PINKS) { off(navy, (g) => { g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); }); U.disc(pink, x, y, r, 1); }
    for (const [x, y, r] of BLUES) { off(navy, (g) => { g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); }); off(pink, (g) => { g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); }); U.disc(blue, x, y, r, 0.9); U.disc(navy, x, y, r, 0.25); }

    // throat grooves: seven paper lines with a pink tint, fanning from the flipper to the jaw
    for (let i = 0; i < 7; i++) {
        const x0 = 632 - 4.5 * i, y0 = 785 + 11 * i, x2 = 985, y2 = 665 + 2 * i, cx = 800 + 10, cy = 722 + 9.7 * i + 6;
        const ln = (g, w) => { g.lineWidth = w; g.lineCap = 'round'; g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo(2 * cx - (x0 + x2) / 2, 2 * cy - (y0 + y2) / 2, x2, y2); g.stroke(); };
        press.knockout((g) => ln(g, 3.4));
        pink.save(); pink.strokeStyle = T(0.3); ln(pink, 3.4); pink.restore();
    }
    // the eye (paper ring, dark pupil) and the blowhole (a pink ring)
    press.knockout((g) => { g.beginPath(); g.arc(937, 642, 9, 0, 7); g.fill(); });
    U.disc(navy, 938, 642, 4.2, 1); U.disc(blue, 936, 642, 6, 0.35);
    off(navy, (g) => { g.lineWidth = 4; g.beginPath(); g.arc(943, 585, 11, 0, 7); g.stroke(); });
    pink.save(); pink.strokeStyle = T(1); pink.lineWidth = 3; pink.beginPath(); pink.arc(943, 585, 11, 0, 7); pink.stroke(); pink.restore();
    // the flipper's leading edge: a paper line
    press.knockout((g) => { g.lineWidth = 2; g.lineCap = 'round'; g.beginPath(); g.moveTo(605, 870); g.quadraticCurveTo(560, 950, 468, 1040); g.stroke(); });
    press.restore();
};
