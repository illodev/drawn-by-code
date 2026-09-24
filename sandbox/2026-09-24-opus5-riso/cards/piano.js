// Card «piano» (reference 11.25–11.5 s, frames 270–275; re-inked in the pink run): the
// inside of a grand piano from above: the dark rim curving down the right over a blue ground,
// the yellow board with ribs, copper bass strings over thin treble strings, dampers, the red
// bar, bridge pins, the key slip and the keys, white sound arcs round the hammer. Authored in
// reference px on frame 270 (colour-run scans, arc fits, 30 px means solved for inks,
// screens fitted with a DFT: board pink 8.1 px at 75°, blue ground navy 10.1 px at 75°).
// The camera pushes in 1.22 % a frame about (550, 545) (fitted on 270 → 272/274/275).
// Needs _g4-util.js (G4).
var CARDS = CARDS || {};
CARDS.piano = (press, t, lf = 0) => {
    const U = G4, T = U.T;
    const d = Math.floor(t * 12 + 1e-6);
    const Y = press.plate('yellow'), P = press.plate('pink'), B = press.plate('blue'), N = press.plate('navy');
    const dark = [N, Y];
    const off = (g, fn) => { g.save(); g.globalCompositeOperation = 'destination-out'; g.fillStyle = '#000'; g.strokeStyle = '#000'; fn(g); g.restore(); };
    U.refpx(press);
    // the push-in, every frame
    const z = 1 + 0.0122 * lf;
    press.each((g) => { g.translate(550, 545); g.scale(z, z); g.translate(-550, -545); });

    // ── the rim, measured every 40 px: [y, inner edge, inner band end, outer band start, blue]
    const RIM = [[-40, 313, 376, 400, 470], [0, 359, 422, 441, 494], [40, 405, 468, 482, 520], [80, 449, 510, 527, 590], [120, 494, 552, 572, 623], [160, 537, 595, 611, 664], [200, 578, 632, 647, 697], [240, 615, 669, 684, 733], [280, 651, 704, 720, 768], [320, 687, 736, 752, 798], [360, 720, 768, 783, 827], [400, 749, 797, 814, 854], [440, 775, 824, 838, 879], [480, 799, 847, 861, 901], [520, 823, 869, 882, 924], [560, 843, 890, 901, 945], [600, 865, 907, 921, 960], [640, 882, 925, 937, 976], [680, 900, 942, 952, 992], [720, 915, 957, 966, 1008], [760, 927, 969, 979, 1018], [800, 940, 981, 993, 1029], [840, 950, 990, 1002, 1038], [880, 960, 998, 1010, 1047], [920, 968, 1006, 1018, 1056], [980, 978, 1016, 1028, 1066]];
    const col = (k) => RIM.map((r) => [r[k], r[0]]);
    const band = (g, k0, k1) => { const a = col(k0), b = col(k1).reverse(); U.smooth(g, a, false, true); b.forEach(([x, y]) => g.lineTo(x, y)); g.closePath(); };
    const boardShape = (g) => { g.beginPath(); g.moveTo(57, -60); col(1).forEach(([x, y]) => g.lineTo(x, y)); g.lineTo(57, 980); g.closePath(); };
    const beyond = (g) => { g.beginPath(); col(4).forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.lineTo(1200, 980); g.lineTo(1200, -60); g.closePath(); };

    // ── blue ground beyond the rim: solid blue, navy dots (10.1 px, 75°), green lines, pink specks
    const LNb = { p: 10.11, a: 74.95, x: 966.8, y: 221 };
    U.clip(B, beyond, (g) => { g.fillStyle = T(0.97); g.fillRect(0, -60, 1200, 1100); });
    U.screen(press, 'navy', LNb, (g) => { beyond(g); g.fillStyle = T(0.42); g.fill(); }, { box: [350, -60, 1200, 1050], jit: 0.2, edge: 0.8 });
    U.clip(P, beyond, (g) => { g.fillStyle = T(0.12); g.fillRect(0, -60, 1200, 1100); U.specks(g, 'pno-b', 260, [450, -60, 1200, 1000], 0.8, 1.8, 1); });
    U.clip(Y, beyond, (g) => { for (let k = -8; k < 12; k++) { const y0 = 108 + 115 * k; U.seg(g, [[400, y0 + 0.55 * 600], [1200, y0 - 0.55 * 200]], 2.2, 0.9); } });

    // ── the board: yellow, a sparse pink dot screen (red dots), 8.1 px at 75°
    const LP = { p: 8.1, a: 74.9, x: 450.6, y: 619.2 };
    U.clip(Y, boardShape, (g) => { g.fillStyle = T(1); g.fillRect(0, -60, 1100, 1100); });
    // the ribs: denser pink (and a touch of blue) in rounded panels
    const RIBS = [
        [[151, -40], [151, 55], [168, 76], [200, 78], [267, 78], [267, -40]],
        [[123, 690], [120, 420], [118, 230], [128, 188], [150, 168], [216, 162], [300, 420], [365, 657], [250, 660]],
        [[568, 620], [568, 400], [580, 368], [616, 352], [660, 354], [700, 378], [716, 420], [720, 620]],
        [[744, 700], [744, 604], [754, 578], [784, 564], [814, 568], [830, 592], [832, 700]],
    ];
    const ribPath = (g) => { g.beginPath(); for (const r of RIBS) U.smooth(g, r, true, false); };
    U.screen(press, 'pink', LP, (g) => {
        boardShape(g); g.fillStyle = T(0.1); g.fill();
        ribPath(g); g.fillStyle = T(0.26); g.fill();
    }, { box: [57, -60, 1000, 980], jit: 0.15, edge: 0.8 });
    U.clip(B, (g) => ribPath(g), (g) => { g.fillStyle = T(0.12); g.fillRect(0, -60, 1100, 1100); });
    // their outlines: dark green brush (navy + yellow + blue) on the left and top
    const OUT = [
        [[151, -40], [151, 55], [168, 76], [200, 80], [267, 80]],
        [[130, 690], [124, 420], [121, 230], [131, 190], [152, 168], [218, 163]],
        [[568, 620], [568, 400], [580, 368], [616, 352], [660, 354], [700, 378], [716, 420], [720, 520]],
        [[744, 700], [744, 604], [754, 578], [784, 564], [814, 568], [830, 592], [832, 690]],
    ];
    for (const o of OUT) { U.sline(B, o, 7, 1); U.sline(N, o, 7, 0.55); }

    // ── treble strings: thin green lines in pairs from the pin curve down to the dampers,
    // slanting like the bass strings on the left, nearly upright by the rim
    const pinY = (x) => { // the pin curve: the rim's inner edge moved 70 px in
        for (let i = 1; i < RIM.length; i++) { const xa = RIM[i - 1][1] - 70, xb = RIM[i][1] - 70; if (x >= xa && x <= xb) return RIM[i - 1][0] + ((x - xa) / (xb - xa)) * (RIM[i][0] - RIM[i - 1][0]); }
        return x < RIM[0][1] ? -60 : 980;
    };
    for (let x = 250; x < 900; x += 9.6) {
        const y0 = Math.max(-40, pinY(x) + 8), slope = -0.28 + (x - 250) * 0.00027;
        // a pale string (paper) with a green shadow line beside it, in pairs
        const L = (dx, y0b, y1b) => [[x + dx + slope * (y0b - y0), y0b], [x + dx + slope * (y1b - y0), y1b]];
        for (const dx of [0, 4.6]) {
            press.knockout((g) => { U.seg(g, L(dx, y0, 714), 2, 0.85); U.seg(g, L(dx, 785, 895), 2, 0.85); });
            U.seg(B, L(dx + 1.9, y0, 714), 1.3, 0.9); U.seg(B, L(dx + 1.9, 785, 895), 1.3, 0.9);
            U.seg(Y, L(dx + 1.9, y0, 714), 1.3, 1); U.seg(Y, L(dx + 1.9, 785, 895), 1.3, 1);
        }
        if (x > 470) { U.disc(B, x, y0, 2.6, 1); U.disc(N, x, y0, 2.6, 0.4); }
    }
    // the hitch pins along the rim: green studs (measured on 270)
    const STUDS = [[392, 57], [475, 132], [556, 212], [636, 293], [707, 381], [770, 472], [822, 566], [865, 660], [898, 752], [922, 845]];
    for (const [x, y] of STUDS) { U.disc(B, x, y, 7.5, 1); U.disc(N, x, y, 7.5, 0.3); press.knockout((g) => { g.beginPath(); g.arc(x - 2.4, y - 2.4, 2, 0, 7); g.fill(); }); }

    // ── bass strings: thirteen copper strings (pink + yellow = red) with a dark left edge
    // and a thin light core; dark edge x = 266 − 0.2 y + 23.3 k (row scans at 100/300/500)
    for (let k = 0; k < 13; k++) {
        const at = (y) => 266 - 0.2 * y + 23.3 * k, y0 = Math.max(-40, -10 + 17.5 * k - 60), y1 = 896;
        U.seg(N, [[at(y0) + 2, y0], [at(y1) + 2, y1]], 4, 1);
        U.seg(Y, [[at(y0) + 2, y0], [at(y1) + 2, y1]], 4, 1);
        U.seg(P, [[at(y0) + 7, y0], [at(y1) + 7, y1]], 6.5, 1);
        press.knockout((g) => U.seg(g, [[at(y0) + 8, y0], [at(y1) + 8, y1]], 1.3, 0.8));
        U.disc(B, at(y0) + 6, y0, 5.5, 1); U.disc(N, at(y0) + 6, y0, 5.5, 0.35);
    }

    // ── dampers: a dark top rail, dark felts with a pink core, a gap for the hammer
    for (const g of dark) U.poly(g, [[86, 714], [596, 714], [596, 724], [86, 724]], 1);
    for (const g of dark) U.poly(g, [[626, 714], [862, 714], [862, 724], [626, 724]], 1);
    for (let k = 0; k < 34; k++) {
        const x = 88 + 23.3 * k;
        if (x > 590 && x < 624) continue;
        if (x > 850) break;
        for (const g of dark) U.poly(g, [[x, 718], [x + 18, 718], [x + 18, 782], [x, 782]], 1);
        press.knockout((g) => g.fillRect(x + 7.5, 728, 2, 46));
        U.seg(P, [[x + 8.5, 728], [x + 8.5, 774]], 1.4, 1, 'butt');
    }
    // the hammer: a dark shank, a lilac felt
    for (const g of dark) U.poly(g, [[602, 655], [617, 655], [617, 725], [602, 725]], 1);
    press.knockout((g) => { g.beginPath(); g.ellipse(609, 740, 8, 17, 0, 0, 7); g.fill(); });
    U.ell(P, 609, 740, 8, 17, 0, 0.75); U.ell(B, 609, 740, 8, 17, 0, 0.3);

    // ── the red bar (pink + yellow), a dark rule under it, three rows of green bridge pins
    U.poly(P, [[59, 802], [929, 802], [929, 816], [59, 816]], 1);
    U.poly(Y, [[59, 802], [929, 802], [929, 816], [59, 816]], 1);
    U.poly(N, [[59, 817], [929, 817], [929, 821], [59, 821]], 0.8);
    for (const [row, y] of [[0, 840], [1, 860], [2, 880]]) {
        for (let x = 75 + (row % 2) * 8.3; x < 925; x += 16.7) { U.disc(B, x, y, 3.6, 1); U.disc(N, x, y, 3.6, 0.35); }
    }

    // ── the rim: two dark bands (navy + yellow), the white lid line between them, a green
    // line in the outer band
    for (const g of dark) { g.fillStyle = T(1); band(g, 1, 2); g.fill(); band(g, 3, 4); g.fill(); }
    B.fillStyle = T(0.12); band(B, 1, 2); B.fill();
    const mid = (a, b, f) => RIM.map((r) => [r[a] + (r[b] - r[a]) * f, r[0]]);
    press.knockout((g) => { g.lineWidth = 6; g.lineCap = 'round'; U.smooth(g, mid(2, 3, 0.5), false); g.stroke(); });
    off(N, (g) => { g.lineWidth = 2.4; U.smooth(g, mid(3, 4, 0.35), false); g.stroke(); });
    U.sline(B, mid(3, 4, 0.35), 2.4, 1);
    // the left cheek: dark, a white line
    for (const g of dark) U.poly(g, [[-60, -60], [57, -60], [57, 980], [-60, 980]], 1);
    press.knockout((g) => g.fillRect(18, -60, 7, 1040));

    // ── white sound arcs round the hammer: centre (604, 689), radii fitted on 270 (and
    // widths from a column scan through the hammer); they stop at the damper rail
    press.knockout((g) => {
        g.save(); g.beginPath(); g.rect(-100, -100, 1300, 814); g.clip();
        g.lineCap = 'round';
        for (const [r, w] of [[67, 14], [149, 6], [247, 10], [360, 10], [524, 7], [650, 5], [840, 5]]) {
            g.lineWidth = w;
            g.beginPath(); g.arc(604, 689, r, Math.PI - 0.2, 0.2); g.stroke();
        }
        g.restore();
    });
    for (const g of dark) U.poly(g, [[602, 650], [617, 650], [617, 668], [602, 668]], 1);

    // ── the key slip: navy rule, yellow line, the dark slip; the keys
    U.poly(N, [[-60, 896], [1200, 896], [1200, 900], [-60, 900]], 0.9);
    press.knockout((g) => g.fillRect(-60, 900, 1300, 7));
    U.poly(Y, [[-60, 900], [1200, 900], [1200, 907], [-60, 907]], 1);
    for (const g of dark) U.poly(g, [[-60, 907], [1200, 907], [1200, 950], [-60, 950]], 1);
    press.knockout((g) => g.fillRect(-60, 950, 1300, 200));
    // a blue dot shade under the slip, and the white keys' blue boundary lines (47.5 px)
    const LK = { p: 10.11, a: 74.95, x: 966.8, y: 221 };
    U.screen(press, 'blue', LK, (g) => { g.fillStyle = U.lin(g, 0, 950, 0, 990, [[0, 0.5], [1, 0]]); g.fillRect(-60, 950, 1300, 40); }, { box: [-60, 950, 1200, 1000], edge: 0.8 });
    for (let k = -2; k < 23; k++) { const x = 75 + 47.5 * k; U.seg(B, [[x, 950], [x, 1140]], 2, 1, 'butt'); }
    // black keys on the boundaries, groups of three and two (missing at k = 2, 5, 9, 12, 16, 19)
    const MISS = [-3, 2, 5, 9, 12, 16, 19, 23];
    for (let k = -2; k < 23; k++) {
        if (MISS.includes(k)) continue;
        const x = 75 + 47.5 * k + 1;
        for (const g of dark) U.poly(g, [[x - 13.5, 946], [x + 13.5, 946], [x + 13.5, 1043], [x - 13.5, 1043]], 1);
        press.knockout((g) => g.fillRect(x - 7, 956, 2.4, 78));
        U.seg(P, [[x - 5.8, 956], [x - 5.8, 1034]], 2.2, 1, 'butt');
        U.seg(Y, [[x - 13, 950], [x - 13, 1040]], 1.6, 0.9, 'butt');
    }
    // the print's specks on the dark
    U.speckle(press, 'piano', 160, [0, -40, 1100, 1040], 0.6, 1.4);
    U.specks(P, 'pianodark', 90, [0, 900, 1100, 950], 0.8, 1.8);
    press.restore();
};
