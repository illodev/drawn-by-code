// Card «city» (reference 11.75–12.0 s, full frame): two apartment blocks at night with lit
// windows (yellow, pink, red, blinds), balconies, a water tower on the low roof between them,
// a cat in an orange window, a full moon in a halo of yellow dots. Measured on the 11.8 s
// frame in 1000 × 1000 units. Needs cards/_g4-util.js.
var CARDS = CARDS || {};
CARDS.city = (press, t) => {
    const U = G4, T = U.T, d = Math.floor(t * 12 + 1e-6);
    const Y = press.plate('yellow'), P = press.plate('pink'), B = press.plate('blue'), N = press.plate('navy');
    const YS = press.plate('yellow', 'screen'), PS = press.plate('pink', 'screen'), BS = press.plate('blue', 'screen'), NS = press.plate('navy', 'screen');
    const rect = (g, x, y, w, h, v = 1) => U.poly(g, [[x, y], [x + w, y], [x + w, y + h], [x, y + h]], v);
    const knock = (x, y, w, h) => press.knockout((g) => g.fillRect(x, y, w, h));

    // sky: blue screen with a light navy screen; the moon's halo lightens it and adds yellow
    BS.fillStyle = T(0.85); BS.fillRect(0, 0, 1000, 1000);
    NS.fillStyle = T(0.05); NS.fillRect(0, 0, 1000, 1000);
    U.erase([BS, NS], (g) => { g.fillStyle = U.rad(g, 545, 265, 80, 330, [[0, 0.75], [0.5, 0.45], [1, 0]]); g.fillRect(0, 0, 1000, 1000); });
    YS.fillStyle = U.rad(YS, 545, 265, 85, 280, [[0, 0.7], [0.45, 0.4], [1, 0]]); YS.fillRect(150, 0, 800, 600);
    U.speckle(press, 'citysky', 120, [0, 0, 1000, 700], 1, 2.6);
    // the moon: paper, a blue rim, faint yellow craters
    press.knockout((g) => { g.beginPath(); g.arc(545, 265, 90, 0, 7); g.fill(); });
    B.lineWidth = 2.5; B.strokeStyle = T(0.8); B.beginPath(); B.arc(545, 265, 90, 0, 7); B.stroke();
    for (const [x, y, r] of [[515, 240, 18], [590, 255, 14], [565, 310, 16], [600, 215, 9]]) U.disc(YS, x, y, r, 0.22);

    // the low roofs between the blocks: navy with blue, a water tower, a lit box
    rect(NS, 400, 720, 310, 290, 0.72); rect(PS, 400, 720, 310, 290, 0.4); rect(BS, 400, 720, 310, 290, 0.35);
    const darkInk = [N, Y];
    for (const g of darkInk) {
        U.poly(g, [[460, 592], [492, 566], [526, 592], [526, 646], [460, 646]], 1);
        U.seg(g, [[472, 646], [470, 690]], 4, 1); U.seg(g, [[514, 646], [516, 690]], 4, 1);
        U.seg(g, [[470, 668], [516, 668]], 3, 1);
        rect(g, 456, 688, 94, 34);
        rect(g, 568, 662, 88, 60);
    }
    rect(B, 456, 688, 94, 34, 0.5);
    knock(590, 677, 47, 29); rect(Y, 590, 677, 47, 29); rect(P, 590, 677, 47, 4);
    U.seg(B, [[400, 721], [710, 721]], 3, 1);

    // a lit window: pane + balcony rails below it, in one colour set
    const INK = { y: [Y], r: [Y, P], p: [P], w: [], g: [] };
    const pane = (x, y, w, h, c, o = {}) => {
        knock(x, y, w, h);
        if (c === 'd') { for (const g of darkInk) rect(g, x, y, w, h); if (o.band) rect(Y, x, y + h - 9, w, 9); return; }
        for (const g of INK[c[0]]) rect(g, x, y, w, h);
        if (c.length > 1) { knock(x + w / 2, y, w / 2, h); for (const g of INK[c[1]]) rect(g, x + w / 2, y, w / 2, h); }
        if (c === 'w') { for (let yy = y + 4; yy < y + h - 2; yy += 8) rect(B, x, yy, w, 3.5); } // blinds
        if (c === 'g') { knock(x, y, w, h); for (let xx = x + 3; xx < x + w; xx += 7) rect(B, xx, y, 2, h); for (let yy = y + 3; yy < y + h; yy += 7) rect(B, x, yy, w, 2); rect(BS, x, y + h * 0.55, w, h * 0.45, 0.8); }
        if (o.mull) { for (const g of darkInk) { rect(g, x + w / 2 - 1.5, y, 3, h - 8); rect(g, x, y + h * 0.55, w, 3); } }
        if (o.lamp) U.disc(Y, x + w / 2, y + 15, 5, 1);
    };
    const rails = (x, y, w, c) => {
        if (c === 'd' || c === 'g' || c === 'w') c = 'y';
        for (let xx = x + 2; xx < x + w - 2; xx += 8) { knock(xx, y, 4.5, 16); for (const g of INK[c[c.length - 1]] ?? [Y]) rect(g, xx, y, 4.5, 16); }
    };

    // the left block: navy, a blue screen, olive dots (yellow screen on navy), pink specks
    const L = [[0, 190], [0, 150], [30, 150], [30, 70], [45, 48], [150, 48], [165, 70], [165, 150], [190, 150], [190, 190], [383, 190], [398, 1010], [0, 1010]];
    U.poly(NS, L, 0.72); U.poly(PS, L, 0.6); U.poly(BS, L, 0.45); U.poly(YS, L, 0.2);
    U.clip(P, (g) => U.path(g, L), (c) => U.specks(c, 'cityL', 140, [0, 40, 400, 1000], 0.8, 2));
    for (const y of [95, 125]) U.seg(B, [[42, y], [152, y]], 2, 0.8);
    U.seg(Y, [[380, 196], [395, 1010]], 6, 1); U.seg(P, [[376, 196], [391, 1010]], 2, 0.6);
    for (const g of darkInk) { U.seg(g, [[288, 45], [288, 190]], 4, 1); U.seg(g, [[265, 82], [310, 78]], 3, 1); U.seg(g, [[273, 116], [302, 114]], 3, 1); }
    // upper floors: five rows of paired windows with balconies
    const rows = [
        ['r', 'y', 'd', 'r', 'y', 'y', 'p'],
        ['y', 'y', 'y', 'y', 'y', 'd', 'y'],
        [null, 'ry', 'y', 'y', null, null, 'p'],
        ['ry', 'd', 'y', 'd', null, null, 'r'],
        ['r', 'ry', 'y', 'y', null, null, 'w'],
    ];
    const cols = [[-14, 32], [48, 31], [82, 33], [186, 32], [222, 32], [285, 33], [322, 31]];
    rows.forEach((row, ri) => {
        const y = 222 + ri * 66;
        row.forEach((c, ci) => {
            if (!c) return;
            const [x, w] = cols[ci];
            pane(x, y, w, 40, c, { band: c === 'd', mull: (ri + ci) % 3 === 0 && c === 'y', lamp: c === 'p' });
            rails(x, y + 42, w, c);
        });
        U.seg(B, [[0, y + 58], [375, y + 58]], 3.5, 1);
        if (ri % 2 === 0) { knock(146, y + 40, 15, 18); rect(Y, 146, y + 40, 15, 18); }
    });
    // lower floors
    for (const y of [612, 680, 745, 812, 877, 942]) U.seg(B, [[0, y], [385, y]], 3, 1);
    knock(215, 622, 146, 114); rect(Y, 215, 622, 146, 114);
    U.clip(BS, (g) => g.rect(215, 700, 146, 36), (c) => { c.fillStyle = T(0.75); c.fillRect(215, 700, 146, 36); });
    for (const g of darkInk) { U.seg(g, [[265, 622], [265, 655]], 2, 1); U.poly(g, [[252, 668], [278, 668], [272, 656], [258, 656]], 1); rect(g, 300, 664, 58, 3); }
    press.knockout((g) => { g.beginPath(); g.arc(265, 672, 6, 0, Math.PI); g.fill(); });
    for (const [x, c] of [[308, 'r'], [322, 'p'], [340, 'r']]) { for (const g of INK[c]) rect(g, x, 648, 9, 16); }
    for (const [x, y, w, h, c] of [[231, 757, 34, 48, 'r'], [196, 822, 34, 46, 'y'], [331, 825, 34, 46, 'p'], [55, 820, 32, 50, 'g'], [92, 820, 34, 50, 'w'], [0, 625, 20, 36, 'g'], [0, 690, 20, 44, 'p'], [0, 752, 20, 40, 'p'], [0, 825, 20, 46, 'w'], [380, 890, 14, 26, 'p'], [55, 958, 36, 50, 'p'], [0, 955, 20, 45, 'w']]) pane(x, y, w, h, c);
    for (const y of [660, 728, 793, 925]) { knock(150, y, 12, 20); rect(Y, 150, y, 12, 20); }

    // the right block: navy with a pink screen (purple), a yellow edge, narrow windows
    const R = [[700, 1010], [700, 440], [878, 440], [878, 408], [1010, 408], [1010, 1010]];
    U.poly(NS, R, 0.78); U.poly(PS, R, 0.55); U.poly(BS, R, 0.2); U.poly(YS, R, 0.12);
    U.clip(P, (g) => U.path(g, R), (c) => U.specks(c, 'cityR', 90, [700, 400, 1000, 1000], 0.8, 2));
    U.seg(Y, [[709, 452], [707, 830]], 4, 1); U.seg(P, [[712, 452], [710, 830]], 1.5, 0.7);
    for (const g of darkInk) { U.seg(g, [[955, 300], [955, 410]], 4, 1); U.seg(g, [[933, 350], [978, 348]], 3, 1); }
    for (const y of [520, 587, 655, 720, 788, 855, 922]) U.seg(B, [[716, y], [1000, y]], 3, 1);
    const RX = [745, 787, 830, 870, 912, 955, 995];
    const rrows = [
        [467, [null, null, 'g', 'p']],
        [532, [null, 'p', 'p']],
        [597, ['p', 'w', 'g']],
        [662, ['p', 'w', 'w', 'w', 'r', 'p']],
        [730, ['p', 'w', null, null, 'p', 'r']],
        [868, ['r', 'y', 'y', 'g', 'p', 'p', 'w']],
        [935, ['ry', 'y', 'g', 'y', 'p', 'g', 'r']],
    ];
    for (const [y, row] of rrows) row.forEach((c, i) => { if (c) pane(RX[i] - 2, y, 24, 50, c, { lamp: c === 'p' && i % 2 === 0 }); });
    // the orange window with the cat
    knock(890, 537, 115, 113); rect(Y, 890, 537, 115, 113); rect(P, 890, 537, 115, 113);
    knock(890, 598, 115, 3); rect(Y, 890, 598, 115, 3);
    const tail = Math.floor(d / 2) % 2 ? 6 : 0;
    for (const g of darkInk) {
        U.seg(g, [[963, 537], [963, 568]], 2, 1);
        U.disc(g, 958, 622, 30); U.ell(g, 958, 583, 20, 18, 0);
        U.poly(g, [[940, 578], [943, 552], [955, 570]], 1); U.poly(g, [[962, 570], [974, 552], [976, 578]], 1);
        U.sline(g, [[985, 640], [1000, 628 - tail], [1004, 610 - tail]], 6, 1);
        rect(g, 890, 645, 115, 5);
    }
};
