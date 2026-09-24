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

    // the reference's own screens, measured per drawing (reference px): blue and navy share a
    // 7.56 px screen at 78°, pink 8.63 px at 18°, yellow 8.64 px at 48°; the inks move a few
    // px independently from one drawing to the next (per-ink misregistration)
    const k = Math.min(1, d);
    const LN = [{ o: [-2.22, 0.92], a: [-7.3960, 1.5703], b: [1.5695, 7.3964] }, { o: [-1.28, -2.55], a: [1.5705, 7.3958], b: [-7.3952, 1.5690] }][k];
    const LPk = [{ o: [-4.11, 0.33], a: [8.2172, 2.6505], b: [-2.6543, 8.2194] }, { o: [1.07, -4.21], a: [8.2196, 2.6648], b: [-2.6557, 8.2102] }][k];
    const LY = [{ o: [4.78, -0.39], a: [-6.4360, 5.7684], b: [5.7616, 6.4307] }, { o: [-4.88, 2.99], a: [5.7613, 6.4301], b: [-6.4354, 5.7682] }][k];
    // a soft tone blob (px): an elliptical radial ramp, v at the centre → 0 at the rim
    const blob = (m, x, y, rx, ry, v, rot = 0, op = 'source-over') => {
        m.save(); m.globalCompositeOperation = op; m.translate(px(x), px(y)); m.rotate(rot); m.scale(1, ry / rx);
        const gr = m.createRadialGradient(0, 0, 0, 0, 0, px(rx)); gr.addColorStop(0, T(v)); gr.addColorStop(0.5, T(v * 0.75)); gr.addColorStop(1, T(0));
        m.fillStyle = gr; m.beginPath(); m.arc(0, 0, px(rx), 0, 7); m.fill(); m.restore();
    };
    // the glow's centre-line (from the yellow coverage per 90 px column): (1035, 250) → (45, 900)
    const glow = (m, v0, v1, w, op) => {
        for (let i = 0; i <= 24; i++) { const f = i / 24, x = 1035 + (45 - 1035) * f, y = 250 + (900 - 250) * f + 30 * Math.sin(f * 3.1); blob(m, x, y, w * (1 + 0.3 * f), w * 0.8, v0 + (v1 - v0) * f, -0.58, op); }
    };
    // blue: a medium screen over all the ice, denser in the darker pools, lifted in the glow
    U.lattice(blue, LN, (m) => {
        m.fillStyle = T(0.76); m.fillRect(-20, -20, 1040, 1040);
        for (const [x, y, rx, ry, v] of [[330, 150, 260, 120, 0.3], [260, 330, 160, 120, 0.25], [60, 560, 200, 260, 0.3], [700, 900, 500, 220, 0.3], [150, 1000, 250, 100, 0.3]]) blob(m, x, y, rx, ry, v);
        glow(m, 0.3, 0.05, 150, 'destination-out');
    }, { gain: 1 });
    // navy: dark pools (left, top right, the whole bottom), light ice between; the deepest
    // pools print nearly flat (a solid under the dots, so they don't read as a busy screen)
    for (const [x, y, rx, ry, v] of [[60, 470, 190, 330, 0.7], [860, 60, 190, 140, 0.7], [760, 950, 520, 230, 0.45], [330, 1030, 330, 120, 0.5], [30, 860, 120, 110, 0.5]]) blob(navy, x, y, rx, ry, v);
    U.lattice(navy, LN, (m) => {
        m.fillStyle = T(0.24); m.fillRect(-20, -20, 1040, 1040);
        for (const [x, y, rx, ry, v] of [[60, 470, 190, 330, 1.6], [860, 60, 190, 140, 1.5], [760, 950, 520, 230, 0.55], [330, 1030, 330, 120, 0.7], [30, 860, 120, 110, 0.9], [300, 700, 200, 110, 0.35], [400, 180, 240, 110, 0.55], [230, 240, 150, 90, 0.4], [560, 760, 170, 90, 0.7]]) blob(m, x, y, rx, ry, v);
        glow(m, 0.35, 0.05, 150, 'destination-out');
    });
    // pink: specks everywhere, strong in the lower half and the lower-left warm edge of the glow
    U.lattice(pink, LPk, (m) => {
        m.fillStyle = T(0.14); m.fillRect(-20, -20, 1040, 1040);
        for (const [x, y, rx, ry, v] of [[540, 930, 620, 250, 0.55], [120, 700, 260, 240, 0.65], [820, 50, 150, 110, 0.6], [30, 400, 120, 100, 0.5], [880, 780, 180, 120, 0.4]]) blob(m, x, y, rx, ry, v);
        for (let i = 0; i <= 12; i++) { const f = 0.6 + i / 30, x = 1035 + (45 - 1035) * f, y = 250 + (900 - 250) * f; blob(m, x - 30, y + 70, 130, 90, 0.45, -0.58); }
    });
    // yellow: the glow, 0.8 at the upper right thinning to 0.35 at the lower left
    // (yellow coverage per 90 px column, fitted on the reference: the band's centre and peak)
    U.lattice(yellow, LY, (m) => {
        for (const [x, y, v] of [[1040, 215, 0.9], [990, 240, 0.85], [900, 300, 0.8], [810, 320, 0.68], [720, 390, 0.72], [630, 470, 0.72], [540, 555, 0.6], [450, 590, 0.55], [360, 655, 0.58], [270, 720, 0.4], [180, 760, 0.36], [90, 820, 0.32], [0, 880, 0.3]]) blob(m, x, y, 120, 85, v * 1.7, -0.6);
    });

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
    // the trails: the navy lifted through a mask of coarse dots, pink dots peeking in
    const tboxes = bubbles.map(([x, y, rx, ry]) => [px(x - rx), px(y), px(x + rx), px(y + ry * 6.2)]);
    // coarse dots on the ice's own 7.56 px screen, only inside the trail boxes; one Path2D per
    // dot size, filled through a clip of the trails (no scratch canvas: this runs every drawing)
    const tdots = (r) => {
        const [ax, ay] = LN.a, [bx, by] = LN.b, det = ax * by - ay * bx, p = new Path2D();
        for (const [x0, y0, x1, y1] of tboxes) {
            const cs = [[x0, y0], [x1, y0], [x0, y1], [x1, y1]].map(([x, y]) => { const X = x * 1.08 - LN.o[0], Y = y * 1.08 - LN.o[1]; return [(X * by - Y * bx) / det, (ax * Y - ay * X) / det]; });
            const i0 = Math.floor(Math.min(...cs.map((c) => c[0]))), i1 = Math.ceil(Math.max(...cs.map((c) => c[0]))), j0 = Math.floor(Math.min(...cs.map((c) => c[1]))), j1 = Math.ceil(Math.max(...cs.map((c) => c[1])));
            for (let i = i0; i <= i1; i++) for (let j = j0; j <= j1; j++) { const x = (LN.o[0] + i * ax + j * bx) / 1.08, y = (LN.o[1] + i * ay + j * by) / 1.08; if (x < x0 || x > x1 || y < y0 || y > y1) continue; p.moveTo(x + r, y); p.arc(x, y, r, 0, 6.2832); }
        }
        return p;
    };
    const trailPath = new Path2D();
    for (const [x, y, rx, ry] of bubbles) for (let k = 1; k <= 3; k++) { const cx = px(x), cy = px(y + k * ry * 1.7), ex = px(rx) * (1 - k * 0.08), ey = px(ry) * 0.9; trailPath.moveTo(cx + ex, cy); trailPath.ellipse(cx, cy, ex, ey, 0, 0, 7); }
    const big = tdots(2.6), small = tdots(1.3);
    for (const [g, p, op] of [[navy, big, 'destination-out'], [blue, big, 'destination-out'], [yellow, big, 'destination-out'], [pink, small, 'source-over']]) { g.save(); g.clip(trailPath); g.globalCompositeOperation = op; g.fillStyle = T(1); g.fill(p); g.restore(); }
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
    // (each crack jagged once; the white of all of them knocked out in one pass)
    const jags = cracks.map(([pts, w]) => {
        const q = P(pts), rj = Motion.rng('crk' + pts[0][0] + pts[0][1]);
        const jag = []; q.forEach(([x, y], i) => { jag.push([x, y]); if (i < q.length - 1) { const [x2, y2] = q[i + 1]; jag.push([(x + x2) / 2 + (rj() - 0.5) * 6, (y + y2) / 2 + (rj() - 0.5) * 6]); } });
        U.stroke(blue, jag.map(([x, y]) => [x + 2, y + 2]), w * 2.8 + 1.4, T(0.9));
        return [jag, w];
    });
    press.knockout((g) => { for (const [jag, w] of jags) U.stroke(g, jag, w * 2.8); });
    for (const [jag, w] of jags) U.stroke(blue, jag, w * 0.35, T(0.6));

    // the bank: top-left corner, paper with a ragged stippled edge and a blue line along it
    // (the snow's lower edge measured bottom-up per 30 px column: (0, 312) … (150, 186); the solid
    // bank stops ~20 px short of it, a stippled fringe covers the rest)
    const bank = P([[0, 0], [410, 0], [350, 32], [300, 64], [250, 95], [200, 130], [150, 166], [120, 184], [60, 252], [0, 292]]);
    press.knockout((g) => { U.path(g, bank); g.fill(); });
    press.knockout((g) => { const rsn = Motion.rng('icesn'); for (let i = 0; i < 1400; i++) { const f = rsn(), x = px(420) * (1 - f), y = px(300) * f, o = rsn() * rsn() * 34; g.beginPath(); g.arc(x + o * 0.6, y + o * 0.8, 1.2 + rsn() * 2.2 * (1 - o / 40), 0, 7); g.fill(); } });
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
