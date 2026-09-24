// Card «piano» (reference 11.25–11.5 s, full frame): the inside of a grand piano seen from
// above, the curved rim and lid on the right over a blue ground, bass strings crossing the
// treble ones, dampers, the red bar, pins, keys at the bottom, and white sound arcs round the
// hammer. Measured on the 11.3 s frame in 1000 × 1000 units. Needs cards/_g4-util.js.
var CARDS = CARDS || {};
CARDS.piano = (press, t) => {
    const U = G4, T = U.T;
    const Y = press.plate('yellow'), P = press.plate('pink'), B = press.plate('blue'), N = press.plate('navy');
    const PS = press.plate('pink', 'screen'), BS = press.plate('blue', 'screen'), NS = press.plate('navy', 'screen');
    const dark = [N, Y]; // navy + yellow = the print's olive black

    // the rim: inner edge (where the yellow board ends) and outer edge (where the blue begins)
    const inner = [[290, -60], [347, 5], [406, 50], [456, 100], [509, 150], [559, 200], [605, 250], [648, 300], [686, 350], [721, 400], [753, 450], [781, 500], [807, 550], [828, 600], [849, 650], [866, 700], [881, 750], [894, 800], [902, 860]];
    const outer = [[415, -60], [472, 5], [524, 50], [576, 100], [622, 150], [668, 200], [712, 250], [750, 300], [785, 350], [818, 400], [846, 450], [870, 500], [893, 550], [915, 600], [934, 650], [951, 700], [965, 750], [977, 800], [986, 860]];
    const lerpPath = (f) => inner.map(([x, y], i) => [x + (outer[i][0] - x) * f, y + (outer[i][1] - y) * f]);
    const board = (g) => { U.smooth(g, inner, false, false); g.lineTo(42, 860); g.lineTo(42, -10); g.closePath(); };
    const beyond = (g) => { U.smooth(g, outer, false, false); g.lineTo(1010, 860); g.lineTo(1010, -10); g.closePath(); };

    // blue ground beyond the rim: light blue flat, navy dots, green (yellow) diagonal lines
    for (const [g, v] of [[B, 0.85], [NS, 0.44], [PS, 0.07]]) U.clip(g, beyond, (c) => { c.fillStyle = T(v); c.fillRect(0, 0, 1000, 1000); });
    U.clip(Y, beyond, (c) => {
        for (let y0 = 100; y0 < 1400; y0 += 70) U.seg(c, [[450, y0], [1000, y0 - 0.65 * 550]], 2, 1);
    });
    U.clip(P, beyond, (c) => U.specks(c, 'pianoblue', 70, [480, 0, 1000, 860], 0.8, 1.8));

    // the board: yellow flat, a light pink screen; the ribs (arched panels) denser
    U.clip(Y, board, (c) => { c.fillStyle = T(1); c.fillRect(0, 0, 1000, 1000); });
    U.clip(PS, board, (c) => { c.fillStyle = T(0.12); c.fillRect(0, 0, 1000, 1000); });
    const ribs = [
        [[134, 65], [134, -20], [225, -20], [225, 65]],
        [[100, 610], [100, 205], [110, 165], [150, 146], [215, 146], [290, 180], [340, 610]],
        [[518, 628], [518, 395], [533, 342], [588, 316], [642, 340], [656, 395], [656, 628]],
        [[700, 640], [700, 560], [712, 528], [740, 518], [768, 528], [780, 560], [780, 640]],
    ];
    for (const r of ribs) { U.blob(PS, r, T(0.5)); press.knockout((g) => U.blob(g, r, 1)); U.blob(PS, r, T(0.36)); U.blob(Y, r, T(0.6)); U.blob(press.plate('yellow', 'screen'), r, T(0.7)); }
    // their outlines: a navy line on the yellow (olive green), on the left and top
    for (const r of ribs.slice(1)) { const o = r === ribs[1] ? r.slice(0, 5) : r.slice(0, -1); U.sline(B, o, 7, 1); U.sline(N, o, 7, 0.55); }
    U.sline(B, [[134, -20], [134, 50], [150, 66], [225, 66]], 7, 1); U.sline(N, [[134, -20], [134, 50], [150, 66], [225, 66]], 7, 0.55);

    // treble strings: thin, nearly upright, in pairs, from the pins by the rim down to the bar
    const trebleTop = lerpPath(-0.42);
    const topAt = (x) => { // y of the pin curve at x (the curve inset from the rim)
        for (let i = 1; i < trebleTop.length; i++) { const [ax, ay] = trebleTop[i - 1], [bx, by] = trebleTop[i]; if (x >= ax && x <= bx) return ay + ((x - ax) / (bx - ax)) * (by - ay); }
        return 900;
    };
    const tr = Motion.rng('pianotreble');
    for (let x = 330; x < 880; x += 9.5) {
        const y0 = Math.max(topAt(x), 150), slope = -0.1;
        for (const [dx, g, w] of [[0, B, 1.2], [3.2, N, 0.8], [5.4, B, 1.0]]) {
            U.seg(g, [[x + dx, y0], [x + dx + slope * (742 - y0), 742]], w, 0.85 + 0.15 * tr());
            U.seg(g, [[x + dx + slope * (770 - y0), 770], [x + dx + slope * (835 - y0), 835]], w, 0.9);
        }
        
    }
    // the hitch pins along the rim: green (yellow + blue) studs
    for (let i = 0; i < 12; i++) {
        const f = i / 11, idx = f * (inner.length - 2), k = Math.floor(idx), u = idx - k;
        const pa = lerpPath(-0.3);
        const x = pa[k][0] + (pa[k + 1][0] - pa[k][0]) * u, y = pa[k][1] + (pa[k + 1][1] - pa[k][1]) * u;
        U.disc(B, x, y, 8, 1); U.disc(N, x, y, 8, 0.3); press.knockout((g) => { g.beginPath(); g.arc(x - 2.5, y - 2.5, 2.2, 0, 7); g.fill(); });
    }

    // bass strings: thick copper (pink on yellow = red) with a dark edge and a green one
    for (let i = 0; i < 12; i++) {
        const x0 = 222 + 21.5 * i, slope = -0.166;
        const yTop = Math.max(-10, ((x0 - 230) * 0.667) / (1 + 0.166 * 0.667));
        const at = (y) => x0 + slope * y;
        U.seg(N, [[at(yTop) - 3.2, yTop], [at(838) - 3.2, 838]], 3.4, 1);
        U.seg(P, [[at(yTop) + 0.5, yTop], [at(838) + 0.5, 838]], 4.2, 1);
        U.seg(B, [[at(yTop) + 3.6, yTop], [at(838) + 3.6, 838]], 1.3, 1);
        U.disc(N, at(yTop) + 0.5, yTop, 3.5, 1);
    }

    // dampers: a yellow shelf, a red rule, then the dark felts with a light core
    press.knockout((g) => g.fillRect(60, 650, 750, 14));
    U.poly(Y, [[60, 650], [810, 650], [810, 664], [60, 664]], 1);
    U.poly(P, [[70, 662], [805, 662], [805, 667], [70, 667]], 1);
    for (let i = 0; i < 33; i++) {
        const x = 72 + i * 22.2;
        if (x > 545 && x < 585) continue;
        for (const g of dark) U.poly(g, [[x, 667], [x + 19, 667], [x + 19, 731], [x, 731]], 1);
        press.knockout((g) => g.fillRect(x + 7, 674, 2.4, 50));
        U.seg(P, [[x + 8, 674], [x + 8, 724]], 2.2, 1, 'butt');
    }
    // the hammer: a dark shank and a lilac (pink + blue screens) felt
    for (const g of dark) U.poly(g, [[553, 600], [571, 600], [571, 690], [553, 690]], 1);
    press.knockout((g) => { g.beginPath(); g.ellipse(562, 704, 10, 18, 0, 0, 7); g.fill(); });
    U.ell(PS, 562, 704, 10, 18, 0, 0.8); U.ell(BS, 562, 704, 10, 18, 0, 0.35);

    // the red bar (pink + yellow) with a bright top edge and a dark rule under it
    U.poly(P, [[45, 745], [870, 745], [870, 763], [45, 763]], 1);
    press.knockout((g) => g.fillRect(45, 745, 825, 2.5));
    U.poly(N, [[45, 764], [870, 764], [870, 768], [45, 768]], 1);
    // bridge pins below: three staggered rows of green studs
    for (const [row, y] of [[0, 779], [1, 800], [2, 819]]) {
        for (let x = 70 + (row % 2) * 9.7; x < 860; x += 19.4) { U.disc(B, x, y, 3.8, 1); U.disc(N, x - 0.8, y - 0.8, 1.6, 0.4); }
    }
    // the rim itself: near black, two light lid lines inside it, a green line outside
    const rimShape = (g) => { U.smooth(g, inner, false, false); outer.slice().reverse().forEach(([x, y]) => g.lineTo(x, y)); g.closePath(); };
    for (const g of dark) U.clip(g, rimShape, (c) => { c.fillStyle = T(1); c.fillRect(0, 0, 1000, 1000); });
    press.knockout((g) => {
        g.lineWidth = 5; g.lineCap = 'round';
        U.smooth(g, lerpPath(0.42), false); g.stroke();
    });
    press.knockout((g) => { g.lineWidth = 2.4; U.smooth(g, lerpPath(0.72), false); g.stroke(); });
    U.sline(B, lerpPath(0.72), 2.4, 1); U.sline(Y, lerpPath(0.72), 2.4, 1);
    U.sline(B, lerpPath(1.1), 2, 1);
    U.sline(Y, lerpPath(1.1), 2, 1);
    // the left cheek: dark with a white line
    for (const g of dark) { U.poly(g, [[0, -10], [42, -10], [42, 890], [0, 890]], 1); }
    press.knockout((g) => g.fillRect(7, -10, 4, 900));

    // white sound arcs round the hammer (knocked out of every plate)
    press.knockout((g) => {
        g.lineCap = 'round';
        for (const [r, w, a0, a1] of [[69, 7, -2.75, -0.42], [144, 7, -2.98, -0.33], [234, 7.5, -3.05, -0.3], [342, 7.5, -3.08, -0.3], [471, 8, -3.1, -0.3], [621, 8, -3.1, -0.3]]) {
            g.lineWidth = w;
            g.beginPath(); g.arc(560, 650, r, a0, a1); g.stroke();
        }
    });
    press.knockout((g) => { g.fillStyle = '#000'; g.fillRect(549, 590, 26, 14); });
    for (const g of dark) U.poly(g, [[553, 588], [571, 588], [571, 604], [553, 604]], 1);

    // the key slip and the keys
    for (const g of dark) U.poly(g, [[0, 838], [1000, 838], [1000, 886], [0, 886]], 1);
    press.knockout((g) => g.fillRect(0, 845, 1000, 3.5));
    U.poly(Y, [[0, 845], [1000, 845], [1000, 848.5], [0, 848.5]], 1);
    press.knockout((g) => g.fillRect(0, 886, 1000, 120));
    const w = 47.9, C0 = 156 - 2 * 335;
    // blue shade under the slip and a reflection down two keys
    BS.fillStyle = U.lin(BS, 0, 886, 0, 935, [[0, 0.45], [1, 0]]);
    BS.fillRect(0, 886, 1000, 50);
    BS.fillStyle = U.lin(BS, 0, 886, 0, 1000, [[0, 0.4], [1, 0.22]]);
    BS.fillRect(C0 + 670 + 8 * w + 2, 886, w - 4, 114);
    for (let k = 0; k < 30; k++) { const x = C0 + k * w; if (x > -5 && x < 1005) U.seg(B, [[x, 886], [x, 1000]], 2.2, 1, 'butt'); }
    for (let o = 0; o < 5; o++) {
        const c = C0 + o * 335;
        for (const f of [0.6, 1.7, 3.55, 4.65, 5.75]) {
            const x = c + f * w;
            if (x < -30 || x > 1030) continue;
            for (const g of dark) U.poly(g, [[x, 884], [x + 27, 884], [x + 27, 976], [x, 976]], 1);
            press.knockout((g) => g.fillRect(x + 7, 890, 2.4, 78));
            U.seg(P, [[x + 8, 890], [x + 8, 968]], 2.2, 1, 'butt');
        }
    }
    // dust on the dark and the print's specks
    U.speckle(press, 'piano', 90, [0, 0, 1000, 890], 0.6, 1.4);
    U.specks(P, 'pianodark', 40, [0, 830, 1000, 890], 0.8, 1.8);
};
