// Card «hummingbird» (reference ≈ 9.45–9.7 s, full frame at 9.55): a hummingbird hovering by
// pink trumpet flowers among dark leaves, on a yellow ground with a green (blue-on-yellow)
// screen. 1000 × 1000 units, measured on the 9.55 s frame. Needs _g3-util.js (G3).
var CARDS = CARDS || {};
CARDS.hummingbird = (press, t) => {
    const R = Riso, T = R.tone, U = G3;
    const d = Math.floor(t * 12 + 1e-6);
    const pink = press.plate('pink'), pinkS = press.plate('pink', 'screen');
    const blue = press.plate('blue'), blueS = press.plate('blue', 'screen');
    const navy = press.plate('navy'), navyS = press.plate('navy', 'screen');
    const yellow = press.plate('yellow'), yellowS = press.plate('yellow', 'screen');
    const shape = (g, pts) => U.smooth(g, pts);
    const fillS = (g, pts, v) => { g.fillStyle = typeof v === 'number' ? T(v) : v; U.smooth(g, pts); g.fill(); };
    const knockS = (pts, v = 1) => press.knockout((g) => { g.globalAlpha = v; U.smooth(g, pts); g.fill(); });

    // ── ground: flat yellow, a green screen (blue dots) lighter round the bird
    yellow.fillStyle = T(1); yellow.fillRect(0, 0, 1000, 1000);
    blueS.fillStyle = R.radial(blueS, 560, 540, 60, 760, 0.12, 0.58);
    blueS.fillRect(0, 0, 1000, 1000);

    // ── leaves: dark ones (dense blue + red dots over yellow), pale ones (outlined, fewer dots)
    const darkLeaf = (pts, veins) => {
        press.knockout((g) => { U.smooth(g, pts); g.fill(); });
        fillS(yellow, pts, 1);
        fillS(blueS, pts, 0.72);
        fillS(pinkS, pts, 0.36);
        fillS(navyS, pts, 0.12);
        // veins: red-orange lines (pink + yellow, the blue knocked)
        for (const v of veins) {
            blueS.save(); blueS.globalCompositeOperation = 'destination-out'; U.stroke(blueS, v, 3.2, 1, true); blueS.restore();
            U.stroke(pink, v, 2.2, 0.9, true);
        }
    };
    const paleLeaf = (pts, veins) => {
        blueS.save(); blueS.globalCompositeOperation = 'destination-out'; fillS(blueS, pts, 0.55); blueS.restore();
        blue.save(); blue.lineWidth = 3.2; blue.strokeStyle = T(0.9); U.smooth(blue, pts); blue.stroke(); blue.restore();
        for (const v of veins) U.stroke(blue, v, 2.2, 0.8, true);
    };
    // pale leaves (behind)
    paleLeaf([[18, 628], [90, 612], [165, 622], [140, 668], [70, 702], [10, 700]], [[[20, 680], [80, 650], [150, 628]]]);
    paleLeaf([[765, 738], [840, 704], [930, 700], [990, 722], [930, 765], [840, 775]], [[[770, 740], [870, 728], [985, 722]]]);
    paleLeaf([[100, 865], [170, 830], [230, 860], [220, 960], [150, 1000], [90, 960]], [[[140, 1000], [160, 920], [200, 850]]]);
    // stems: thin green lines
    U.stroke(blue, [[80, 40], [40, 160], [18, 300], [25, 440], [60, 560]], 3, 0.9, true);
    U.stroke(blue, [[130, 0], [110, 70]], 3, 0.9, true);
    U.stroke(blue, [[960, 390], [945, 470], [950, 560], [990, 640]], 3, 0.9, true);
    U.stroke(blue, [[850, 20], [900, 0]], 2.5, 0.9, true);
    // dark leaves
    darkLeaf([[0, 70], [60, 100], [130, 120], [110, 175], [50, 205], [0, 200]], [[[0, 140], [60, 140], [120, 125]], [[40, 140], [70, 180]]]);
    darkLeaf([[850, 330], [870, 270], [930, 225], [1000, 205], [1000, 370], [930, 380], [870, 372]], [[[860, 360], [930, 300], [1000, 250]], [[920, 305], [950, 370]]]);
    darkLeaf([[0, 710], [60, 740], [150, 790], [230, 850], [180, 880], [150, 960], [170, 1000], [0, 1000]], [[[0, 880], [80, 840], [200, 830]], [[60, 860], [40, 960]], [[120, 840], [160, 780]]]);
    darkLeaf([[690, 870], [740, 830], [820, 800], [900, 790], [1000, 780], [1000, 1000], [700, 1000], [680, 940]], [[[700, 1000], [780, 900], [880, 830]], [[780, 900], [900, 930]], [[830, 860], [760, 820]]]);

    // ── flowers: trumpets in pink (a dense pink screen on paper), navy lines, a yellow-red heart
    const lobed = (cx, cy, rx, ry, rot, n = 5, seed = 0) => {
        const out = [], r = Motion.rng('hbl' + seed);
        for (let i = 0; i < n * 4; i++) {
            const a = (i / (n * 4)) * Math.PI * 2, k = [1, 0.97, 0.86, 0.97][i % 4] * (0.95 + r() * 0.1);
            const x = Math.cos(a) * rx * k, y = Math.sin(a) * ry * k;
            out.push([cx + x * Math.cos(rot) - y * Math.sin(rot), cy + x * Math.sin(rot) + y * Math.cos(rot)]);
        }
        return out;
    };
    const trumpet = (mouth, tube, heart, lines) => {
        press.knockout((g) => { U.smooth(g, mouth); g.fill(); U.path(g, tube); g.fill(); });
        fillS(pinkS, mouth, 0.72);
        pink.fillStyle = T(0.95); U.path(pink, tube); pink.fill();
        // a pale streak down the tube
        press.knockout((g) => { g.lineWidth = 2.2; g.beginPath(); g.moveTo(tube[0][0] * 0.5 + tube[1][0] * 0.5, tube[0][1] * 0.5 + tube[1][1] * 0.5); g.lineTo(tube[2][0] * 0.4 + tube[3][0] * 0.6, tube[2][1] * 0.4 + tube[3][1] * 0.6); g.stroke(); });
        // the heart: a small yellow + red star
        const [hx, hy, hr] = heart;
        yellow.fillStyle = T(1);
        pink.save(); pink.globalCompositeOperation = 'destination-out'; U.ell(pink, hx, hy, hr, hr * 0.45, -0.1); pinkS.save(); pinkS.globalCompositeOperation = 'destination-out'; U.ell(pinkS, hx, hy, hr, hr * 0.45, -0.1); pinkS.restore(); pink.restore();
        pinkS.fillStyle = T(0.5); pinkS.beginPath(); pinkS.ellipse(hx, hy, hr * 0.8, hr * 0.35, -0.1, 0, 7); pinkS.fill();
        for (let i = 0; i < 5; i++) { const a = i * 1.26; U.stroke(navy, [[hx, hy], [hx + Math.cos(a) * hr * 2.2, hy + Math.sin(a) * hr * 0.8]], 1.6, 0.75); }
        navy.save(); navy.lineWidth = 3; navy.strokeStyle = T(0.9); U.smooth(navy, mouth); navy.stroke(); navy.restore();
        for (const l of lines) U.stroke(navy, l, 2.2, 0.85, true);
    };
    trumpet(lobed(905, 797, 92, 30, -0.06, 5, 1),
        [[850, 822], [945, 812], [990, 1000], [945, 1000]], [900, 796, 34], [[[868, 824], [940, 1000]]]);
    trumpet(lobed(908, 465, 64, 26, 1.12, 5, 2),
        [[925, 445], [1000, 400], [1000, 520], [930, 505]], [905, 462, 20], [[[925, 470], [1000, 450]], [[912, 420], [960, 440]]]);
    trumpet([[860, 12], [880, 0], [945, 0], [935, 40], [910, 64], [870, 45]],
        [[905, 0], [950, 0], [950, 30], [915, 40]], [900, 30, 16], [[[882, 10], [905, 50]]]);
    trumpet([[0, 666], [25, 660], [45, 690], [50, 740], [35, 780], [10, 785], [0, 760]],
        [[0, 700], [10, 700], [10, 760], [0, 760]], [24, 726, 20], [[[28, 670], [36, 775]]]);

    // ── the hummingbird
    const wob = [0, 4, -3][d % 3]; // the blurred wings flutter on twos
    // the far wing, a blur: fanned streaks where the yellow thins to paper and blue specks fly
    const fan = [];
    for (let i = 0; i < 7; i++) {
        const a0 = Math.PI - 0.06 - i * 0.07 + wob * 0.004, L = 400 - i * 12;
        fan.push([470 + Math.cos(a0) * L, 285 + Math.sin(a0) * L * 1.1]);
    }
    const streak = (g, i, w) => { g.lineWidth = w; g.lineCap = 'round'; g.beginPath(); g.moveTo(460, 285); g.lineTo(fan[i][0], fan[i][1]); g.stroke(); };
    for (const g of [yellow, blueS]) {
        g.save(); g.globalCompositeOperation = 'destination-out';
        for (let i = 0; i < 7; i++) { g.strokeStyle = T(g === yellow ? 0.24 : 0.45); streak(g, i, 30 - i * 2); }
        g.restore();
    }
    const blur2 = [[398, 0], [468, 0], [478, 120], [455, 205], [415, 170]];
    for (const g of [yellow, blueS]) { g.save(); g.globalCompositeOperation = 'destination-out'; g.fillStyle = R.ramp(g, 0, 0, 0, 220, g === yellow ? 0.3 : 0.4, 0.05); U.smooth(g, blur2); g.fill(); g.restore(); }
    const rs = Motion.rng('hb-speck' + (d % 3));
    for (let i = 0; i < 520; i++) {
        const k = Math.floor(rs() * 7), u = Math.pow(rs(), 0.7), sp = (rs() - 0.5) * (30 - k * 2) * u;
        const x = 460 + (fan[k][0] - 460) * u, y = 285 + (fan[k][1] - 285) * u + sp;
        U.disc(blue, x, y, 0.8 + rs() * 1.1, 0.75);
    }
    for (let i = 0; i < 110; i++) { const x = 400 + rs() * 75, y = rs() * 200; U.disc(blue, x, y, 0.8 + rs(), 0.6); }

    // tail: a dark fan (navy + yellow) with pale scalloped tips
    const tail = [[360, 490], [305, 458], [242, 454], [226, 470], [230, 520], [248, 556], [290, 580], [300, 574], [348, 512]];
    press.knockout((g) => { U.path(g, tail); g.fill(); });
    for (const [g, v] of [[yellow, 1], [navy, 0.85], [blue, 0.5]]) U.poly(g, tail, v);
    // feather splits: thin yellow lines fanning from the rump
    for (const [x, y] of [[235, 490], [236, 520], [250, 546], [272, 562]]) { for (const g of [navy, blue]) { g.save(); g.globalCompositeOperation = 'destination-out'; U.stroke(g, [[350, 500], [x, y]], 2, 1); g.restore(); } }
    for (const [x, y, a] of [[240, 478, 3.6], [232, 505, 3.2], [240, 532, 2.8], [258, 553, 2.4], [282, 562, 2]]) {
        press.knockout((g) => { g.lineWidth = 3.5; g.beginPath(); g.arc(x + 8, y, 10, a - 0.9, a + 0.9); g.stroke(); });
        pink.save(); pink.lineWidth = 2.5; pink.strokeStyle = T(0.8); pink.beginPath(); pink.arc(x + 5, y, 12, a - 0.9, a + 0.9); pink.stroke(); pink.restore();
    }
    // body: a green ellipse (dense blue screen on yellow), navy screen shading below
    const body = U.blob(448, 380, 156, 70, 'hb-body', 0.02, 16, -0.74);
    press.knockout((g) => { U.smooth(g, body); g.fill(); });
    fillS(yellow, body, 1);
    fillS(blueS, body, 0.86);
    blueS.save(); U.smooth(blueS, body); blueS.clip(); blueS.fillStyle = T(0.4); blueS.fillRect(0, 0, 1000, 1000); blueS.restore();
    navyS.save(); U.smooth(navyS, body); navyS.clip(); navyS.fillStyle = R.ramp(navyS, 470, 300, 380, 470, 0, 0.25); navyS.fillRect(0, 0, 1000, 1000); navyS.restore();
    // feather scales: little yellow arcs
    for (const [x, y] of [[380, 360], [420, 330], [455, 305], [400, 405], [360, 420], [440, 360], [500, 320], [350, 455]]) {
        blueS.save(); blueS.globalCompositeOperation = 'destination-out'; blueS.lineWidth = 2.6; blueS.beginPath(); blueS.arc(x, y - 8, 11, 0.6, 2.4); blueS.stroke(); blueS.restore();
        blue.save(); blue.globalCompositeOperation = 'destination-out'; blue.lineWidth = 2.6; blue.beginPath(); blue.arc(x, y - 8, 11, 0.6, 2.4); blue.stroke(); blue.restore();
    }
    // the pale belly
    // (the body below a line from the rump to the throat, running on under the gorget)
    const belly = [[352, 470], [470, 398], [612, 306], [660, 350], [600, 420], [520, 480], [430, 525], [370, 530]];
    press.save(); press.clip((g) => { U.smooth(g, body, true, false); U.smooth(g, [[560, 330], [612, 318], [615, 345], [575, 380]], true, false); });
    press.knockout((g) => { U.path(g, belly); g.fill(); });
    pinkS.fillStyle = T(0.14); U.path(pinkS, belly); pinkS.fill();
    press.restore();
    fillS(blueS, [[520, 395], [590, 342], [575, 375], [530, 410]], 0.2);
    // the near wing: blue-violet (flat blue + navy screen), pink feather lines
    const wing = [[100, 10], [170, 36], [236, 66], [252, 70], [330, 96], [420, 150], [482, 212], [500, 250], [478, 276], [440, 282], [380, 232], [320, 176], [266, 120], [246, 96], [228, 88], [160, 52], [102, 28]];
    press.knockout((g) => { U.smooth(g, wing); g.fill(); });
    fillS(blueS, wing, 0.9);
    fillS(blue, wing, 0.5);
    fillS(navyS, wing, 0.2);
    fillS(pinkS, wing, 0.28);
    for (let i = 0; i < 6; i++) {
        const k = i / 6;
        U.stroke(pink, [[130 + k * 20, 22 + k * 10], [300 + k * 20, 130 + k * 25], [440 + k * 30, 215 + k * 25]], 1.3, 0.55, true);
    }
    press.knockout((g) => { g.lineWidth = 2; g.beginPath(); g.moveTo(140, 25); g.quadraticCurveTo(300, 110, 470, 230); g.stroke(); });
    // head: a green ball, darker at the back
    const head = U.blob(592, 222, 84, 80, 'hb-head', 0.03, 14);
    press.knockout((g) => { U.smooth(g, head); g.fill(); });
    fillS(yellow, head, 1);
    fillS(blueS, head, 0.7);
    blue.save(); U.smooth(blue, head); blue.clip(); blue.fillStyle = R.radial(blue, 560, 190, 20, 120, 0.1, 0.6); blue.fillRect(400, 100, 400, 250); blue.restore();
    navyS.save(); U.smooth(navyS, head); navyS.clip(); navyS.fillStyle = R.ramp(navyS, 600, 190, 660, 300, 0, 0.4); navyS.fillRect(500, 130, 200, 200); navyS.restore();
    // head highlight: a yellow crescent (blue knocked)
    for (const g of [blue, blueS, navyS]) { g.save(); g.globalCompositeOperation = 'destination-out'; g.lineWidth = 7; g.lineCap = 'round'; g.beginPath(); g.arc(578, 222, 60, 3.35, 4.3); g.stroke(); g.restore(); }
    // the eye: dark brown (navy + pink + yellow), a paper glint below-left
    U.disc(navy, 598, 188, 12, 0.95); U.disc(pink, 598, 188, 12, 0.7);
    press.knockout((g) => { g.beginPath(); g.arc(562, 221, 5.5, 0, 7); g.fill(); });
    press.knockout((g) => { g.beginPath(); g.arc(594, 184, 3, 0, 7); g.fill(); });
    // the beak: a long dark line to the top-right flower
    for (const [g, v] of [[navy, 0.75], [pink, 0.9], [yellow, 1]]) U.stroke(g, [[652, 166], [860, 14]], 7, v);
    press.knockout((g) => { g.lineWidth = 1.4; g.beginPath(); g.moveTo(665, 154); g.lineTo(850, 20); g.stroke(); });
    // the gorget: red-orange (pink + yellow), yellow striations, a dark rim
    const gorget = [[560, 330], [585, 300], [630, 268], [680, 238], [697, 262], [688, 300], [650, 330], [600, 345]];
    press.knockout((g) => { U.smooth(g, gorget); g.fill(); });
    fillS(yellow, gorget, 1); fillS(pink, gorget, 0.95);
    for (let i = 0; i < 4; i++) {
        const o = i * 11;
        pink.save(); pink.globalCompositeOperation = 'destination-out'; U.stroke(pink, [[590 + o * 0.3, 330 - o], [640, 300 - o * 0.9], [684, 262 - o * 0.4]], 1.8, 1, true); pink.restore();
    }
    navy.save(); navy.lineWidth = 2.5; navy.strokeStyle = T(0.6); U.smooth(navy, gorget); navy.stroke(); navy.restore();
};
