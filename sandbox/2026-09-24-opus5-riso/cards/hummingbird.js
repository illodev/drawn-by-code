// Card «hummingbird» (reference 9.5–9.75 s, full frame, static; re-inked at 15.75): a hummingbird hovering by
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
    // (measured: yellow flat, clean blue dots on an 11.7 px lattice at 15°; coverage unmixed
    // on a 90 px grid: 0.6 top left, ~0.2 round the bird, 0.45–0.65 along the bottom)
    yellow.fillStyle = T(1); yellow.fillRect(0, 0, 1000, 1000);
    U.ref(press, 1, () => {
        const sm = (a, b, v) => { const k = Math.max(0, Math.min(1, (v - a) / (b - a))); return k * k * (3 - 2 * k); };
        const gb = (x, y) => 0.24 + 0.42 * sm(560, 1080, y) + 0.4 * Math.max(0, 1 - Math.hypot(x, y) / 260) + 0.15 * sm(850, 1080, x) - 0.08 * Math.max(0, 1 - Math.hypot(x - 420, y - 280) / 260);
        U.lat(blue, [11.6285, 2.8233, -2.8916, 11.2415, 491.8, 698.7], gb, -20, -20, 1100, 1100, { jit: 0.15 });
    });

    // ── leaves: dark ones (dense blue + red dots over yellow), pale ones (outlined, fewer dots)
    const darkLeaf = (pts, veins) => {
        press.knockout((g) => { U.smooth(g, pts); g.fill(); });
        fillS(yellow, pts, 1);
        fillS(blueS, pts, 0.62);
        fillS(pinkS, pts, 0.24);
        fillS(navyS, pts, 0.05);
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

    // ── the hummingbird, in reference pixels (measured on 2× and 4× grid crops of f230)
    const wob = [0, 3, -2][d % 3]; // the blurred wings flutter on twos
    U.ref(press, 1, () => {
        const sm = (pts) => (g) => U.smooth(g, pts);
        const clear = (gs, shape) => { for (const g of gs) { g.save(); g.globalCompositeOperation = 'destination-out'; g.fillStyle = '#000'; shape(g); g.fill(); g.restore(); } };
        const inside = (g, shape, fn) => { g.save(); g.beginPath(); shape(g); g.clip(); fn(g); g.restore(); };
        const L8 = [7.94, 2.06, -2.05, 7.73, 600, 300]; // a fine screen for the plumage
        const LF = [5.6, 1.5, -1.5, 5.6, 0, 0]; // the specks' grid (motion blur)

        // the far wing, a motion blur: a paper wedge (yellow and the ground dots thinned)
        // speckled with blue and pink, fanning left from the shoulder; a second beat upward
        const ghost = [[495, 330], [460, 300 + wob], [400, 260 + wob], [320, 225 + wob], [230, 205 + wob], [150, 200], [120, 260], [140, 360], [150, 470], [250, 440], [350, 400], [430, 370]];
        const ghost2 = [[520, 262], [470, 200], [440, 120], [425, 40], [420, -5], [515, -5], [520, 60], [528, 150], [540, 240]];
        for (const [gh, k] of [[ghost, 0.62], [ghost2, 0.45]]) {
            for (const g of [yellow, blue, blueS]) { g.save(); g.globalCompositeOperation = 'destination-out'; g.fillStyle = T(g === yellow ? k : 0.6); U.smooth(g, gh); g.fill(); g.restore(); }
            const rs = Motion.rng('hbg' + k + (d % 3));
            inside(blue, sm(gh), (g) => U.lat(g, LF, () => 0.22 * (0.5 + rs()), 200, -10, 560, 380, { jit: 0.9 }));
            inside(pink, sm(gh), (g) => U.lat(g, [LF[0], LF[1], LF[2], LF[3], 2.8, 2.8], () => (rs() < 0.35 ? 0.2 : 0), 200, -10, 560, 380, { jit: 0.5 }));
        }

        // the tail: a dark fan (navy + yellow + blue) with a red rim on top and left, feather
        // splits and white-pink crescents on the stepped tips
        const TAIL = [[257, 494], [345, 490], [388, 528], [318, 614], [300, 612], [263, 602], [243, 582], [236, 550], [248, 522]];
        press.knockout((g) => { U.path(g, TAIL); g.fill(); });
        // the red rim (misregistered under the fan)
        const rim = TAIL.map(([x, y]) => [x - 4, y - 4]);
        U.poly(pink, rim, 1); U.poly(yellow, rim, 1);
        clear([pink], (g) => U.path(g, TAIL));
        for (const [g, v] of [[yellow, 1], [navy, 0.92], [blue, 0.6]]) U.poly(g, TAIL, v);
        // streaks along the feathers (fine yellow-green lines fanning from the rump)
        for (let i = 0; i < 9; i++) {
            const a = 2.2 + i * 0.12, x0 = 372, y0 = 528;
            for (const g of [navy]) { g.save(); g.globalCompositeOperation = 'destination-out'; U.stroke(g, [[x0 - 12, y0 - 4], [x0 + Math.cos(a) * 150, y0 + Math.sin(a) * 110]], 1.6, 0.6); g.restore(); }
        }
        for (const [x, y, a] of [[272, 515, 3.5], [262, 545, 3.3], [264, 572, 2.9], [282, 590, 2.5], [303, 603, 2.2]]) {
            const arc = [];
            for (let k = 0; k <= 6; k++) { const b = a - 0.8 + k * 0.27; arc.push([x + 10 + Math.cos(b) * 12, y + Math.sin(b) * 12, 4.2 * Math.sin((k / 6) * Math.PI) + 0.5]); }
            press.knockout((g) => { U.path(g, U.ribbon(arc, { taper: 0.25 })); g.fill(); });
            U.poly(pink, U.ribbon(arc.map(([px, py, w]) => [px + 2, py + 1, w * 0.55]), { taper: 0.3 }), 0.7);
        }

        // the body: green (yellow + blue flat), a fine navy screen shading its back
        const BODY = [[560, 296], [522, 296], [470, 318], [420, 358], [378, 410], [354, 462], [350, 505], [362, 532], [395, 532], [440, 506], [520, 452], [600, 400], [640, 372], [600, 330]];
        press.knockout((g) => { U.smooth(g, BODY); g.fill(); });
        fillS(yellow, BODY, 1);
        inside(blue, sm(BODY), (g) => U.lat(g, [8.7, 2.3, -2.3, 8.7, 500, 400], () => 0.72, 340, 290, 650, 540, { jit: 0.25 }));
        inside(navy, sm(BODY), (g) => U.lat(g, L8, (x, y) => Math.max(0, Math.min(0.12, (520 - x) * 0.0006)), 340, 290, 650, 540, { jit: 0.2 }));
        // feather scales: small yellow arcs (the blue and navy cleared)
        for (const [x, y] of [[410, 395], [445, 360], [482, 335], [520, 318], [395, 440], [430, 420], [468, 392], [505, 370], [380, 480], [415, 462], [455, 440], [540, 350]]) {
            for (const g of [blue, navy]) { g.save(); g.globalCompositeOperation = 'destination-out'; g.lineWidth = 2.4; g.lineCap = 'round'; g.beginPath(); g.arc(x, y - 7, 9, 0.5, 2.5); g.stroke(); g.restore(); }
        }
        // the belly: paper with pink and a few blue dots, a lens under the body
        const BELLY = [[398, 532], [402, 506], [470, 462], [548, 412], [612, 378], [640, 374], [636, 398], [575, 446], [495, 500], [430, 530]];
        press.knockout((g) => { U.smooth(g, BELLY); g.fill(); });
        inside(pink, sm(BELLY), (g) => U.lat(g, [6.3, 1.7, -1.7, 6.3, 500, 460], () => 0.13, 390, 360, 650, 540, { jit: 0.4 }));
        inside(blue, sm(BELLY), (g) => U.lat(g, [9.1, 2.4, -2.4, 9.1, 503, 463], (x, y) => (y > 480 ? 0.1 : 0.05), 390, 360, 650, 540, { jit: 0.6 }));
        // the feet: a thin green line under the belly
        U.stroke(blue, [[392, 532], [420, 536], [446, 534]], 2.4, 0.9); U.stroke(yellow, [[392, 532], [446, 534]], 2.4, 1);

        // the near wing: a long blade, blue flat with a navy screen, a dark top edge, pink
        // feather lines and two paper streaks along it; paler to the tip
        const WING = [[150, 28], [200, 60], [250, 75], [300, 84], [350, 97], [400, 118], [450, 152], [495, 200], [532, 246], [536, 262], [480, 316], [430, 280], [350, 206], [300, 165], [250, 122], [200, 84], [165, 52]];
        press.knockout((g) => { U.smooth(g, WING); g.fill(); });
        fillS(blue, WING, 0.92);
        inside(navy, sm(WING), (g) => U.lat(g, L8, (x) => Math.max(0, 0.08 + (x - 230) * 0.0011), 210, 50, 550, 330, { jit: 0.25 }));
        inside(pink, sm(WING), (g) => U.lat(g, [6.3, 1.7, -1.7, 6.3, 300, 100], (x) => 0.12 + 0.1 * Math.max(0, (330 - x) / 110), 210, 50, 550, 330, { jit: 0.4 }));
        // feather lines: fanning from the base toward the tip
        inside(pink, sm(WING), (g) => {
            for (let i = 0; i < 7; i++) { const k = i / 6; U.stroke(g, [[160 + k * 20, 36 + k * 20], [330 + k * 10, 110 + k * 70], [500 - k * 10, 230 + k * 70]], 1.5, 0.75, true); }
        });
        press.save(); press.clip(sm(WING));
        press.knockout((g) => { g.lineWidth = 2.2; g.lineCap = 'round'; g.beginPath(); g.moveTo(165, 40); g.quadraticCurveTo(340, 130, 500, 262); g.stroke(); g.lineWidth = 1.6; g.beginPath(); g.moveTo(190, 62); g.quadraticCurveTo(320, 160, 440, 262); g.stroke(); });
        press.restore();
        U.stroke(navy, [[152, 30], [250, 76], [350, 97], [450, 152], [495, 200], [532, 246]], 3.2, 0.9, true);

        // the head: a green ball, solid on the crown, a fine screen (yellow showing) on the
        // cheek lower right
        const HEAD = U.blob(636, 234, 91, 86, 'hb-head2', 0.015, 16);
        press.knockout((g) => { U.smooth(g, HEAD); g.fill(); });
        fillS(yellow, HEAD, 1);
        inside(blue, sm(HEAD), (g) => { g.save(); g.beginPath(); g.ellipse(612, 212, 86, 78, -0.5, 0, 7); g.clip(); U.lat(g, [6.4, 1.7, -1.7, 6.4, 612, 212], () => 0.9, 520, 130, 720, 300, { jit: 0.2 }); g.restore(); U.lat(g, [7.2, 1.9, -1.9, 7.2, 640, 240], (x, y) => 0.62, 540, 140, 740, 330, { jit: 0.2 }); });
        inside(navy, sm(HEAD), (g) => U.lat(g, L8, (x, y) => Math.max(0, Math.min(0.08, (x + y - 900) * 0.001)), 540, 140, 740, 330, { jit: 0.2 }));
        // the crown's highlight: a tapered yellow crescent (blue and navy cleared)
        const cres = U.ribbon([[564, 250, 3], [565, 214, 8], [582, 188, 9], [607, 173, 8], [634, 168, 3]], { taper: 0.3 });
        clear([blue, navy], (g) => U.path(g, cres));
        // the eye: dark red-brown (navy + pink + yellow), a pink-white glint; a paper dot on
        // the cheek
        for (const [g, v] of [[navy, 0.95], [pink, 0.75], [blue, 0]]) { if (v) U.disc(g, 646, 206, 14, v); else clear([g], (c) => { c.beginPath(); c.arc(646, 206, 14, 0, 7); }); }
        press.knockout((g) => { g.beginPath(); g.arc(655, 203, 4.2, 0, 7); g.fill(); g.beginPath(); g.arc(607, 239, 6.5, 0, 7); g.fill(); });
        U.disc(pink, 653, 201, 2.2, 0.8);
        // the beak: a long dark line (navy + yellow + blue) to the flower, red along its top
        const BEAK = [[690, 180, 10], [760, 130, 8], [860, 58, 6], [955, 5, 4]];
        const bk = U.ribbon(BEAK, { taper: 0.04 });
        press.knockout((g) => { U.path(g, bk); g.fill(); });
        for (const [g, v] of [[navy, 0.95], [yellow, 1], [blue, 0.6]]) U.poly(g, bk, v);
        const bkr = U.ribbon(BEAK.map(([x, y, w]) => [x - 2.5, y - 3.5, w * 0.4]), { taper: 0.04 });
        clear([navy, blue], (g) => U.path(g, bkr)); U.poly(pink, bkr, 1);
        // the gorget: iridescent red-orange (pink + yellow), three curved yellow bars, a dark
        // edge under the chin
        const GOR = [[602, 350], [620, 320], [660, 290], [700, 265], [740, 252], [752, 272], [745, 302], [715, 332], [670, 357], [640, 372], [612, 373]];
        press.knockout((g) => { U.smooth(g, GOR); g.fill(); });
        fillS(yellow, GOR, 1); fillS(pink, GOR, 0.96);
        inside(pink, sm(GOR), (g) => {
            g.globalCompositeOperation = 'destination-out';
            for (let i = 0; i < 3; i++) { const o = i * 13; U.stroke(g, [[626 + o * 0.6, 356 - o * 0.2], [680 + o * 0.3, 320 - o * 0.7], [742 - o * 0.2, 272 - o * 0.4]], 3.2 - i * 0.5, 1, true); }
        });
                U.stroke(navy, [[606, 344], [625, 318], [662, 290], [705, 264], [740, 250]], 2.5, 0.55, true);
    });
};
