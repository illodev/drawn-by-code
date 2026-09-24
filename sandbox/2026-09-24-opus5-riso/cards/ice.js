// Card «ice» (reference 14.0–14.125 s, full frame; a circle opens on it at ~14.04). Cracked
// lake ice seen from above: a navy screen with blue patches and darker mottling, a diagonal
// glow of light (yellow screen, pink-orange on its lower edge) where the navy is lifted,
// white cracks with a blue shadow edge, trapped bubbles (white discs, each with a fading
// dotted trail under it), and a snowy bank with grass in the top-left corner. Measured on
// the 14.0 s frame (px / 1.08 = units). Needs cards/_g6-util.js.
var CARDS = CARDS || {};
CARDS.ice = (press, t) => {
    const R = Riso, T = R.tone, U = G6;
    const pinkS = press.plate('pink', 'screen'), pink = press.plate('pink');
    const blueS = press.plate('blue', 'screen'), blue = press.plate('blue');
    const navyS = press.plate('navy', 'screen'), navy = press.plate('navy');
    const yellowS = press.plate('yellow', 'screen'), yellow = press.plate('yellow');
    const d = Math.floor(t * 12 + 1e-6);
    const px = (v) => v / 1.08, P = (pts) => pts.map(([x, y]) => [x / 1.08, y / 1.08]);
    const lift = (gs, fn) => { for (const g of gs) { g.save(); g.globalCompositeOperation = 'destination-out'; fn(g); g.restore(); } };

    // the ice: navy screen all over, darker blotches, blue patches
    navyS.fillStyle = T(0.72); navyS.fillRect(0, 0, 1000, 1000);
    pinkS.fillStyle = T(0.06); pinkS.fillRect(0, 0, 1000, 1000);
    blue.fillStyle = T(0.18); blue.fillRect(0, 0, 1000, 1000);
    const rb = Motion.rng('iceb');
    for (let i = 0; i < 14; i++) { const x = rb() * 1000, y = rb() * 1000, r = 60 + rb() * 140; navyS.fillStyle = R.radial(navyS, x, y, 0, r, 0.35, 0); navyS.beginPath(); navyS.arc(x, y, r, 0, 7); navyS.fill(); }
    for (const [x, y, r, v] of [[px(880), px(600), 170, 0.8], [px(960), px(420), 120, 0.7], [px(300), px(450), 150, 0.35], [px(180), px(860), 120, 0.4], [px(560), px(180), 150, 0.3], [px(900), px(900), 110, 0.3]]) {
        blueS.fillStyle = R.radial(blueS, x, y, 0, r, v, 0); blueS.beginPath(); blueS.arc(x, y, r, 0, 7); blueS.fill();
        lift([navyS], (g) => { g.fillStyle = R.radial(g, x, y, 0, r, v * 0.7, 0); g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); });
    }
    // pale haze patches (the navy thinned, paper between the dots)
    for (const [x, y, rx, ry] of [[px(300), px(450), 150, 60], [px(180), px(850), 90, 60]]) lift([navyS], (g) => { g.fillStyle = T(0.35); g.beginPath(); g.ellipse(x, y, rx, ry, -0.5, 0, 7); g.fill(); });

    // the diagonal glow: along a line from low left to high right, navy lifted, yellow in
    const G0 = [px(0), px(976)], G1 = [px(1080), px(104)];
    for (let i = 0; i <= 30; i++) {
        const f = i / 30, x = G0[0] + (G1[0] - G0[0]) * f, y = G0[1] + (G1[1] - G0[1]) * f;
        const w = 125 - 30 * Math.abs(f - 0.6), core = Math.max(0, 1 - Math.abs(f - 0.62) * 1.8);
        lift([navyS, blueS, blue], (g) => { g.fillStyle = R.radial(g, x, y, 0, w, 0.35 + 0.4 * core, 0); g.beginPath(); g.arc(x, y, w, 0, 7); g.fill(); });
        yellowS.fillStyle = R.radial(yellowS, x, y, 0, w * 0.9, 0.35 + 0.55 * core, 0); yellowS.beginPath(); yellowS.arc(x, y, w * 0.9, 0, 7); yellowS.fill();
        // its lower-left edge warms to orange/red (pink screen), stronger towards the bottom
        const ox = x - 45, oy = y + 55;
        if (f < 0.55) { pinkS.fillStyle = R.radial(pinkS, ox, oy, 0, w * 0.7, 0.35 * (1 - f * 1.5), 0); pinkS.beginPath(); pinkS.arc(ox, oy, w * 0.7, 0, 7); pinkS.fill(); }     }
    // a flat yellow hot spot at the glow's heart
    yellow.fillStyle = R.radial(yellow, px(780), px(330), 0, 120, 0.6, 0); yellow.beginPath(); yellow.arc(px(780), px(330), 120, 0, 7); yellow.fill();

    // bubbles: white discs with dotted trails (paper through coarse dots)
    const bubbles = [
        // top-left cluster
        [200, 240, 26, 12], [240, 258, 30, 13], [295, 262, 34, 15], [430, 280, 25, 11], [355, 225, 12, 6], [390, 220, 13, 6], [270, 172, 16, 7], [440, 330, 18, 8], [420, 312, 10, 5],
        [210, 408, 22, 10], [232, 402, 14, 6], [293, 395, 32, 15], [376, 393, 30, 17], [110, 345, 8, 5],
        // right cluster
        [662, 345, 25, 11], [735, 348, 22, 11], [780, 232, 23, 11], [865, 340, 26, 13], [940, 350, 34, 14], [985, 355, 20, 10], [985, 402, 22, 10], [840, 408, 42, 16], [905, 392, 30, 12], [965, 432, 26, 11], [730, 425, 18, 9], [765, 462, 22, 10], [732, 495, 22, 10],
        // top-right
        [980, 65, 32, 14], [945, 132, 23, 11], [1035, 27, 20, 10], [1020, 132, 14, 7], [1070, 92, 10, 6],
        // bottom-left
        [160, 742, 20, 10], [102, 770, 16, 8], [127, 812, 30, 15], [200, 795, 32, 15], [274, 822, 40, 20], [125, 855, 28, 13], [375, 880, 28, 12], [247, 913, 26, 11], [196, 925, 16, 8], [358, 862, 10, 5],
        // bottom-right
        [775, 753, 30, 13], [690, 797, 20, 10], [698, 862, 30, 14], [728, 890, 20, 9], [755, 912, 22, 10], [722, 935, 30, 12], [720, 957, 34, 14], [885, 832, 28, 12], [912, 850, 18, 9], [936, 880, 26, 12], [920, 910, 26, 12], [884, 940, 18, 9],
    ];
    const trail = (m) => { for (const [x, y, rx, ry] of bubbles) for (let k = 1; k <= 3; k++) { m.beginPath(); m.ellipse(px(x), px(y + k * ry * 1.7), px(rx) * (1 - k * 0.08), px(ry) * 0.9, 0, 0, 7); m.fill(); } };
    // the trails: the navy lifted through a mask of coarse dots, pink dots peeking in
    const tboxes = bubbles.map(([x, y, rx, ry]) => [px(x - rx), px(y), px(x + rx), px(y + ry * 6.2)]);
    U.masked([[navyS, 'destination-out'], [blueS, 'destination-out']], trail, (m) => U.dots(m, tboxes, 8.8, 3.1, 0.5));
    U.masked([[pinkS]], trail, (m) => U.dots(m, tboxes, 8.8, 1.6, 0.5));
    press.knockout((g) => { for (const [x, y, rx, ry] of bubbles) { g.beginPath(); g.ellipse(px(x), px(y), px(rx), px(ry), 0, 0, 7); g.fill(); } });
    // a blue rim under each disc (its lower edge)
    for (const [x, y, rx, ry] of bubbles) { blue.save(); blue.lineWidth = 1.4; blue.strokeStyle = T(0.8); blue.beginPath(); blue.ellipse(px(x), px(y) + 1, px(rx), px(ry), 0, 0.3, Math.PI - 0.3); blue.stroke(); blue.restore(); }

    // cracks: white lines with a blue shadow on one side, and fine branches
    const cracks = [
        [[[440, 0], [470, 90], [520, 180], [555, 260], [590, 350], [605, 430], [625, 520], [640, 600], [650, 700], [635, 780], [615, 870], [605, 960], [600, 1080]], 3.4],
        [[[0, 505], [120, 480], [230, 462], [330, 440], [430, 428], [520, 440], [600, 452], [700, 440], [800, 425], [900, 400], [1000, 375], [1080, 360]], 2.8],
        [[[0, 925], [150, 900], [300, 880], [420, 845], [520, 800], [600, 760], [650, 738], [760, 700], [860, 680], [960, 680], [1080, 695]], 3],
        [[[520, 215], [580, 210], [640, 230], [680, 220]], 1.6], [[[600, 340], [660, 320], [720, 250]], 1.2], [[[640, 660], [700, 600], [720, 560]], 1.3],
        [[[650, 700], [690, 720], [720, 690]], 1.2], [[[560, 800], [580, 820], [560, 880]], 1.1], [[[900, 680], [960, 620], [1040, 640]], 1.2], [[[330, 440], [320, 400], [340, 360]], 1], [[[160, 900], [140, 860]], 1],
        [[[620, 740], [590, 700], [560, 690]], 1], [[[1000, 375], [1040, 330], [1080, 320]], 1.2],
    ];
    for (const [pts, w] of cracks) {
        const q = P(pts), rj = Motion.rng('crk' + pts[0][0] + pts[0][1]);
        const jag = []; q.forEach(([x, y], i) => { jag.push([x, y]); if (i < q.length - 1) { const [x2, y2] = q[i + 1]; jag.push([(x + x2) / 2 + (rj() - 0.5) * 6, (y + y2) / 2 + (rj() - 0.5) * 6]); } });
        U.stroke(blue, jag.map(([x, y]) => [x + 2, y + 2]), w * 2.8 + 1.4, T(0.9));
        press.knockout((g) => U.stroke(g, jag, w * 2.8));
        U.stroke(blue, jag, w * 0.35, T(0.6));
    }

    // the bank: top-left corner, paper with a ragged stippled edge and a blue line along it
    const bank = P([[0, 0], [470, 0], [440, 30], [380, 75], [320, 120], [240, 175], [150, 235], [70, 280], [0, 310]]);
    press.knockout((g) => { U.path(g, bank); g.fill(); });
    const rsn = Motion.rng('icesn');
    press.knockout((g) => { for (let i = 0; i < 1600; i++) { const f = rsn(), x = px(470) * (1 - f), y = px(310) * f, o = rsn() * rsn() * 75; g.beginPath(); g.arc(x + o * 0.55, y + o * 0.83, 1.4 + rsn() * 2.4 * (1 - o / 80), 0, 7); g.fill(); } });
    U.stroke(blue, P([[0, 290], [60, 262], [150, 215], [240, 160], [320, 105], [380, 62], [430, 20], [452, 0]]), 2.2, T(0.9));
    U.stroke(blueS, P([[0, 275], [150, 200], [320, 92], [440, 5]]), 10, T(0.35));
    // grass blades on the bank: dark green (navy + yellow) curves
    const rg = Motion.rng('icegr');
    for (let i = 0; i < 16; i++) {
        const f = 0.12 + rg() * 0.75, bx = px(440) * (1 - f) - 12, by = px(300) * f - 10, h = 60 + rg() * 90, lean = 20 + rg() * 45;
        const pts = []; for (let k = 0; k <= 6; k++) { const q = k / 6; pts.push([bx + lean * q * q, by - h * q]); }
        U.stroke(navy, pts, 3.6, T(0.9)); U.stroke(yellow, pts, 5, T(0.9)); U.stroke(blue, pts.map(([x, y]) => [x + 1.5, y]), 1.4, T(0.8));
    }
    // a small twinkle on twos in the glow
    if (d % 2) press.knockout((g) => { g.beginPath(); g.arc(px(790), px(420), 2.5, 0, 7); g.fill(); });
};
