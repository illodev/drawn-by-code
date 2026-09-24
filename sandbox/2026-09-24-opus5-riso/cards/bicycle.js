// Card «bicycle» (reference ≈ 10.7–10.95 s, full frame at 10.8): a blue bicycle with a basket
// leaning on a yellow wall covered in pink bougainvillea, its shadow on the wall and the
// pavement. 1000 × 1000 units, measured on the 10.8 s frame. Needs _g3-util.js (G3).
var CARDS = CARDS || {};
CARDS.bicycle = (press, t) => {
    const R = Riso, T = R.tone, U = G3;
    const d = Math.floor(t * 12 + 1e-6);
    const pink = press.plate('pink'), pinkS = press.plate('pink', 'screen');
    const blue = press.plate('blue'), blueS = press.plate('blue', 'screen');
    const navy = press.plate('navy'), navyS = press.plate('navy', 'screen');
    const yellow = press.plate('yellow'), yellowS = press.plate('yellow', 'screen');
    const off = (g, fn) => { g.save(); g.globalCompositeOperation = 'destination-out'; g.fillStyle = '#000'; g.strokeStyle = '#000'; fn(g); g.restore(); };
    const WALL = 868;

    // ── the wall: flat yellow, red (pink) specks, an orange skirting band of pink dots
    yellow.fillStyle = T(1); yellow.fillRect(0, 0, 1000, WALL);
    const rs = Motion.rng('bc-specks');
    pink.fillStyle = T(0.9); pink.beginPath();
    for (let i = 0; i < 700; i++) { const x = rs() * 1000, y = rs() * WALL, r = 0.9 + rs() * 1.2; pink.moveTo(x + r, y); pink.arc(x, y, r, 0, 7); }
    pink.fill();
    off(yellow, (g) => { g.beginPath(); for (let i = 0; i < 120; i++) { const x = rs() * 1000, y = rs() * WALL, r = 0.8 + rs(); g.moveTo(x + r, y); g.arc(x, y, r, 0, 7); } g.fill(); });
    pinkS.fillStyle = T(0.62); pinkS.fillRect(0, 842, 1000, WALL - 842);
    U.stroke(blue, [[0, WALL - 1], [1000, WALL - 1]], 3, 0.8);
    // the pavement: paper with a light yellow screen, blue joints
    yellowS.fillStyle = T(0.3); yellowS.fillRect(0, WALL, 1000, 132);
    for (const l of [[[0, 945], [1000, 942]], [[85, 1000], [100, WALL]], [[440, 1000], [445, WALL]], [[815, 1000], [812, WALL]]]) U.stroke(blue, l, 2.2, 0.85);
    for (const l of [[[160, 900], [210, 945], [300, 1000]], [[150, 930], [230, 985]]]) U.stroke(blue, l, 2, 0.85, true);

    // ── the bike's geometry (reference units)
    const RW = [262, 720], FW = [755, 718], WR = 158, BB = [497, 765];
    const SEAT = [432, 424], ST = [440, 478], HT = [700, 470], HB = [722, 560], BAR = [690, 392];
    const tubes = [[ST, BB], [ST, HT], [HT, BB], [ST, RW], [BB, RW], [HB, FW], [BAR, HB], [SEAT, ST]];

    // its shadow on the wall: a green screen (blue dots on yellow), thrown up to the right
    const sh = ([x, y]) => [x + 150 + (WALL - y) * 0.02, y - 22 - (WALL - y) * 0.02];
    blueS.save(); blueS.strokeStyle = T(0.72); blueS.lineCap = 'round';
    for (const c of [RW, FW]) { const [x, y] = sh(c); blueS.lineWidth = 20; blueS.beginPath(); blueS.ellipse(x, y, WR * 0.95, WR * 0.92, -0.1, 0, 7); blueS.stroke(); }
    blueS.lineWidth = 13;
    for (const [a, b] of tubes) { blueS.beginPath(); blueS.moveTo(...sh(a)); blueS.lineTo(...sh(b)); blueS.stroke(); }
    blueS.restore();
    // the shadow on the ground: purple dots (navy + pink screens) in a long band
    const gsh = [[190, 900], [300, 888], [600, 886], [880, 890], [985, 902], [960, 928], [700, 932], [400, 930], [200, 925]];
    for (const [g, v] of [[navyS, 0.55], [pinkS, 0.35]]) { g.fillStyle = T(v); U.smooth(g, gsh); g.fill(); }

    // ── bougainvillea: leaves (flat green or screened green) and clusters of bracts
    const leafAt = (x, y, a, L, W, screen) => {
        const g = screen ? blueS : blue;
        g.fillStyle = T(screen ? 0.7 : 0.9); g.beginPath(); U.leaf(g, x, y, a, L, W, 0.05); g.fill();
    };
    const rl = Motion.rng('bc-leaves');
    const leafZones = [[0, 0, 1000, 300, 70], [0, 300, 240, 700, 34], [820, 280, 1000, 520, 22], [220, 150, 440, 330, 12]];
    for (const [x0, y0, x1, y1, n] of leafZones) for (let i = 0; i < n; i++) leafAt(x0 + rl() * (x1 - x0), y0 + rl() * (y1 - y0), rl() * 6.28, 26 + rl() * 16, 13 + rl() * 6, rl() < 0.45);
    // vines: thin green stems hanging down
    for (const v of [[[560, 250], [555, 330], [560, 390]], [[195, 380], [185, 470], [180, 560]], [[840, 330], [870, 390], [920, 470]], [[330, 0], [300, 60], [250, 130]]]) U.stroke(blue, v, 3, 0.9, true);
    // a bract: a three-lobed papery flower; on paper it prints pink, on the yellow wall red
    const bract = (x, y, s, a, onPaper) => {
        const shape = (g) => { for (let k = 0; k < 3; k++) { const b = a + k * 2.094; g.moveTo(x, y); g.ellipse(x + Math.cos(b) * s * 0.55, y + Math.sin(b) * s * 0.55, s * 0.55, s * 0.36, b, 0, 7); } };
        if (onPaper) off(yellow, (g) => { g.beginPath(); shape(g); g.fill(); });
        off(blue, (g) => { g.beginPath(); shape(g); g.fill(); }); off(blueS, (g) => { g.beginPath(); shape(g); g.fill(); });
        pink.fillStyle = T(0.95); pink.beginPath(); shape(pink); pink.fill();
        off(pink, (g) => { g.beginPath(); g.arc(x, y, s * 0.16, 0, 7); g.fill(); });
        U.disc(yellow, x, y, s * 0.12);
    };
    const clusters = [
        [40, 60, 60, 26], [110, 170, 50, 18], [60, 260, 70, 22], [20, 360, 60, 18], [180, 300, 70, 22], [140, 500, 60, 20], [20, 650, 50, 10],
        [330, 120, 50, 14], [470, 110, 70, 22], [530, 30, 80, 26], [640, 60, 70, 24], [760, 40, 70, 24], [700, 190, 80, 28], [820, 140, 70, 22], [620, 230, 60, 18],
        [900, 400, 60, 18], [960, 300, 40, 10], [420, 30, 40, 10], [880, 40, 50, 14], [980, 440, 30, 8], [90, 450, 40, 12], [0, 480, 40, 12],
    ];
    const rb = Motion.rng('bc-bracts');
    for (const [cx, cy, R0, n0] of clusters) for (let i = 0, n = Math.round(n0 * 1.4); i < n; i++) {
        const a = rb() * 6.28, r = Math.sqrt(rb()) * R0;
        bract(cx + Math.cos(a) * r, cy + Math.sin(a) * r * 0.8, 13 + rb() * 7, rb() * 6.28, rb() < 0.55);
    }
    // the bell's ring: blue swooshes to the upper right of the bars
    for (let i = 0; i < 4; i++) {
        const r0 = 90 + i * 22;
        blue.save(); blue.strokeStyle = T(0.95); blue.lineWidth = 7 - i; blue.lineCap = 'round';
        blue.beginPath(); blue.ellipse(700, 330, r0, r0 * 0.55, -0.25, -2.3 + i * 0.05, -1.55 + i * 0.08); blue.stroke();
        blue.restore();
    }

    // ── the wheels: blue-violet tyres (navy + blue + a little pink), paper glint, blue spokes
    const wheel = ([cx, cy]) => {
        press.knockout((g) => { g.lineWidth = 16; g.beginPath(); g.arc(cx, cy, WR, 0, 7); g.stroke(); });
        for (const [g, v] of [[navy, 0.8], [blue, 0.7], [pink, 0.3]]) { g.save(); g.strokeStyle = T(v); g.lineWidth = 14; g.beginPath(); g.arc(cx, cy, WR, 0, 7); g.stroke(); g.restore(); }
        press.knockout((g) => { g.lineWidth = 2.6; g.beginPath(); g.arc(cx, cy, WR - 10, 0, 7); g.stroke(); });
        for (const [g, v] of [[blue, 0.9]]) { g.save(); g.strokeStyle = T(v); g.lineWidth = 3; g.beginPath(); g.arc(cx, cy, WR - 13, 0, 7); g.stroke(); g.restore(); }
        blue.save(); blue.strokeStyle = T(0.9); blue.lineWidth = 1.8;
        for (let i = 0; i < 32; i++) { const a = (i / 32) * Math.PI * 2 + (i % 2) * 0.08; const h = (i % 2 ? 1 : -1) * 0.18; blue.beginPath(); blue.moveTo(cx + Math.cos(a + h) * 12, cy + Math.sin(a + h) * 12); blue.lineTo(cx + Math.cos(a) * (WR - 12), cy + Math.sin(a) * (WR - 12)); blue.stroke(); }
        blue.restore();
        U.disc(blue, cx, cy, 13); press.knockout((g) => { g.beginPath(); g.arc(cx, cy, 4, 0, 7); g.fill(); });
        // spoke glints: a few paper lines
        press.knockout((g) => { g.lineWidth = 1.5; for (const a of [-2.6, -0.4, 1.2, 2.3]) { g.beginPath(); g.moveTo(cx + Math.cos(a) * 20, cy + Math.sin(a) * 20); g.lineTo(cx + Math.cos(a) * (WR - 16), cy + Math.sin(a) * (WR - 16)); g.stroke(); } });
    };
    wheel(RW); wheel(FW);
    // mudguard over the rear wheel: a green arc (blue on the yellow)
    blue.save(); blue.strokeStyle = T(0.95); blue.lineWidth = 7; blue.beginPath(); blue.arc(RW[0], RW[1], WR + 12, -2.7, -0.9); blue.stroke(); blue.restore();

    // ── the frame: flat blue tubes, a paper highlight along each, a chainring
    const tube = (a, b, w) => {
        press.knockout((g) => { g.lineWidth = w + 3; g.lineCap = 'round'; g.beginPath(); g.moveTo(...a); g.lineTo(...b); g.stroke(); });
        blue.save(); blue.strokeStyle = T(0.95); blue.lineWidth = w; blue.lineCap = 'round'; blue.beginPath(); blue.moveTo(...a); blue.lineTo(...b); blue.stroke(); blue.restore();
    };
    for (const [a, b, w] of [[ST, RW, 12], [BB, RW, 12], [ST, BB, 20], [ST, HT, 20], [HT, BB, 21], [HB, FW, 16], [[HT[0] - 6, HT[1] - 90], HB, 22], [SEAT, ST, 10]]) tube(a, b, w);
    // highlights: paper lines
    press.knockout((g) => {
        g.lineWidth = 2.6; g.lineCap = 'round';
        for (const [a, b] of [[[448, 474], [690, 466]], [[436, 492], [488, 740]], [[690, 486], [505, 742]], [[705, 390], [722, 548]]]) { g.beginPath(); g.moveTo(...a); g.lineTo(...b); g.stroke(); }
    });
    // chainring and crank
    press.knockout((g) => { g.lineWidth = 9; g.beginPath(); g.arc(BB[0], BB[1], 44, 0, 7); g.stroke(); });
    blue.save(); blue.strokeStyle = T(0.95); blue.lineWidth = 6; blue.beginPath(); blue.arc(BB[0], BB[1], 44, 0, 7); blue.stroke(); blue.restore();
    tube(BB, [545, 822], 8);
    for (const [g, v] of [[blue, 0.95]]) g.fillStyle = T(v), g.fillRect(530, 818, 36, 10);
    // the saddle: dark brown (navy + pink + yellow), a pink-grey sheen
    for (const [g, v] of [[navy, 0.85], [pink, 0.7]]) U.ell(g, 430, 422, 46, 12, 0, v);
    // handlebars, grip, the bell
    for (const [g, v] of [[blue, 0.95]]) U.stroke(g, [[606, 398], [650, 385], [690, 386], [700, 395]], 8, v, true);
    for (const [g, v] of [[navy, 0.9], [pink, 0.7]]) U.stroke(g, [[586, 400], [612, 398]], 12, v);
    const bell = (g) => { g.beginPath(); g.moveTo(640, 372); g.bezierCurveTo(640, 328, 700, 328, 700, 372); g.closePath(); };
    press.knockout((g) => { bell(g); g.fill(); });
    blueS.fillStyle = R.ramp(blueS, 640, 0, 700, 0, 0.2, 0.8); bell(blueS); blueS.fill();
    blue.save(); blue.strokeStyle = T(0.9); blue.lineWidth = 3; bell(blue); blue.stroke(); blue.fillStyle = T(0.9); blue.fillRect(636, 370, 68, 6); blue.restore();
    U.stroke(blue, [[678, 378], [700, 384]], 4, 0.9);

    // ── the basket: pink over the yellow (red) with a navy lattice, flowers heaped in it
    const bk = [[770, 516], [918, 512], [905, 618], [782, 622]];
    for (const [g, v] of [[pink, 0.9]]) U.poly(g, bk, v);
    pinkS.save(); U.path(pinkS, bk); pinkS.clip(); navyS.save(); U.path(navyS, bk); navyS.clip();
    navyS.fillStyle = R.ramp(navyS, 770, 0, 820, 0, 0.5, 0); navyS.fillRect(770, 510, 60, 115);
    navyS.restore(); pinkS.restore();
    navy.save(); U.path(navy, bk); navy.clip(); navy.strokeStyle = T(0.85); navy.lineWidth = 2.4;
    for (let k = -8; k < 16; k++) { navy.beginPath(); navy.moveTo(760 + k * 14, 510); navy.lineTo(760 + k * 14 + 110, 625); navy.stroke(); navy.beginPath(); navy.moveTo(760 + k * 14 + 110, 510); navy.lineTo(760 + k * 14, 625); navy.stroke(); }
    navy.restore();
    U.stroke(navy, [[770, 516], [918, 512]], 4, 0.9);
    // flowers in the basket: pink bracts on paper
    const rf = Motion.rng('bc-basket');
    for (let i = 0; i < 12; i++) bract(785 + rf() * 120, 492 + rf() * 28, 18 + rf() * 6, rf() * 6.28, true);
};
