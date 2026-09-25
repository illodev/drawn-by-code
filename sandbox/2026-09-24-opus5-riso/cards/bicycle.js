// Card «bicycle» (reference ≈ 10.7–10.95 s, full frame at 10.8): a blue bicycle with a basket
// leaning on a yellow wall covered in pink bougainvillea, its shadow on the wall and the
// pavement. 1000 × 1000 units, measured on the 10.8 s frame. Needs _g3-util.js (G3).
var CARDS = CARDS || {};
const DRAW_BICYCLE = (press, t) => {
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
    // (measured at 4×: the wall is thick with small brown-red specks, ~25 per 120 px square,
    // pink with a touch of navy, and the yellow is mottled lighter in soft patches)
    {
        const specks = [];
        for (let i = 0; i < 1700; i++) specks.push([rs() * 1000, rs() * WALL, 0.9 + rs() * 1.1]);
        for (const [g, v] of [[pink, 0.95], [navy, 0.45]]) { g.fillStyle = T(v); g.beginPath(); for (const [x, y, r] of specks) { g.moveTo(x + r, y); g.arc(x, y, r, 0, 7); } g.fill(); }
        // pinholes: the wall's ink is pocked with tiny paper specks (seen at 3× in both inkings)
        off(yellow, (g) => { g.beginPath(); for (let i = 0; i < 4200; i++) { const x = rs() * 1000, y = rs() * WALL, r = 0.5 + rs() * 0.7; g.moveTo(x + r, y); g.arc(x, y, r, 0, 7); } g.fill(); });
        off(yellow, (g) => { g.globalAlpha = 0.1; for (let i = 0; i < 160; i++) { const x = rs() * 1000, y = rs() * WALL, r = 6 + rs() * 16; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); } });
    }
    off(yellow, (g) => { g.beginPath(); for (let i = 0; i < 120; i++) { const x = rs() * 1000, y = rs() * WALL, r = 0.8 + rs(); g.moveTo(x + r, y); g.arc(x, y, r, 0, 7); } g.fill(); });
    pinkS.fillStyle = T(0.62); pinkS.fillRect(0, 842, 1000, WALL - 842);
    U.stroke(blue, [[0, WALL - 1], [1000, WALL - 1]], 3, 0.8);
    // the pavement: paper with a light yellow screen, blue joints
    yellowS.fillStyle = T(0.2); yellowS.fillRect(0, WALL, 1000, 132);
    for (const l of [[[0, 945], [1000, 942]], [[85, 1000], [100, WALL]], [[440, 1000], [445, WALL]], [[815, 1000], [812, WALL]]]) U.stroke(blue, l, 2.2, 0.85);
    for (const l of [[[160, 900], [210, 945], [300, 1000]], [[150, 930], [230, 985]]]) U.stroke(blue, l, 2, 0.85, true);

    // ── the bike's geometry (reference units)
    const RW = [259, 720], FW = [751, 718], WR = 158, BB = [497, 765];
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
    for (const [g, v] of [[navyS, 0.42], [pinkS, 0.25]]) { g.fillStyle = T(v); U.smooth(g, gsh); g.fill(); }

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
        // (at 3×: every bract is pocked with paper pinholes, one or two per lobe)
        press.knockout((g) => { g.beginPath(); for (let k = 0; k < 3; k++) { const b = a + k * 2.094 + 0.4; const px = x + Math.cos(b) * s * 0.62, py = y + Math.sin(b) * s * 0.62; g.moveTo(px + 1.6, py); g.arc(px, py, 1.6, 0, 7); } g.fill(); });
    };
    // the bracts, laid out from measured density: the share of pink and of red pixels per
    // 60 px block of the reference (f259, tenths; the basket excluded, drawn on its own).
    // Each block gets bracts in proportion (one bract ≈ 300 px² of ink), placed at random.
    const PINK = ['110000031343013000', '131000000544432000', '031001513332012200', '132000000032423400', '123000000000222000', '121300000000011000', '001310000000000000', '100000000000000002', '011000000000001200', '003200000000002210', '000000000001002100', '000000000000000100', '100000000000000000', '201000000000000000'];
    const RED = ['110000022111011000', '131000103311110000', '220001113211032100', '011000000022111100', '142000000000111000', '231200000000100000', '511200000000000000', '510000000000000242', '121000000000000000', '001100000000000000', '000100000000000000', '001300000000000000', '100100000000000000', '011000000000000000'];
    const rb = Motion.rng('bc-bracts');
    for (let j = 0; j < PINK.length; j++) for (let i = 0; i < 18; i++) {
        for (const [tab, onPaper] of [[PINK, true], [RED, false]]) {
            const n = Math.round((+tab[j][i] / 10) * (3600 / 300) * (onPaper ? 1.5 : 1.25) / 1.7);
            for (let k = 0; k < n; k++) bract(((i + rb()) * 60) / 1.08, ((j + rb()) * 60) / 1.08, 12 + rb() * 6, rb() * 6.28, onPaper);
        }
    }
    // the bell's ring (measured at 2×): four blue brush arcs round the bell (720, 390 ref px),
    // radii 92–185 px, from -109° to -49°, thick at the left end and tapering to the right;
    // blue + a little navy with the yellow cleared under them
    for (let i = 0; i < 4; i++) {
        const r = [85, 109, 139, 171][i], pts = [];
        for (let k = 0; k <= 8; k++) { const a = -1.9 + (1.05 * k) / 8; pts.push([667 + Math.cos(a) * r, 361 + Math.sin(a) * r, (8 - i * 0.8) * (1 - 0.7 * k / 8)]); }
        const band = U.ribbon(pts, { taper: 0.08 });
        off(yellow, (g) => { U.path(g, band); g.fill(); });
        U.poly(blue, band, 1); U.poly(navy, band, 0.35);
    }

    // ── the wheels: blue-violet tyres (navy + blue + a little pink), paper glint, blue spokes
    const wheel = ([cx, cy]) => {
        press.knockout((g) => { g.lineWidth = 16; g.beginPath(); g.arc(cx, cy, WR, 0, 7); g.stroke(); });
        for (const [g, v] of [[navy, 0.62], [blue, 0.8], [pink, 0.35]]) { g.save(); g.strokeStyle = T(v); g.lineWidth = 12; g.beginPath(); g.arc(cx, cy, WR, 0, 7); g.stroke(); g.restore(); }
        press.knockout((g) => { g.lineWidth = 2.6; g.beginPath(); g.arc(cx, cy, WR - 10, 0, 7); g.stroke(); });
        for (const [g, v] of [[blue, 0.9]]) { g.save(); g.strokeStyle = T(v); g.lineWidth = 3; g.beginPath(); g.arc(cx, cy, WR - 13, 0, 7); g.stroke(); g.restore(); }
        // spokes (measured at 2×): 36 light-blue wires, each with a paper edge
        const spoke = (g, i) => { const a = (i / 36) * Math.PI * 2 + (i % 2) * 0.06; const h = (i % 2 ? 1 : -1) * 0.2; g.beginPath(); g.moveTo(cx + Math.cos(a + h) * 12, cy + Math.sin(a + h) * 12); g.lineTo(cx + Math.cos(a) * (WR - 12), cy + Math.sin(a) * (WR - 12)); g.stroke(); };
        press.knockout((g) => { g.lineWidth = 4.2; for (let i = 0; i < 36; i++) spoke(g, i); });
        blue.save(); blue.strokeStyle = T(0.85); blue.lineWidth = 2.2;
        for (let i = 0; i < 36; i++) spoke(blue, i);
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
// the film pushes in on this card: 1.13 % a frame about the centre (four corner
// patches correlated frame to frame against f259 (10.792 s), the frame it was measured on); one scale
// per frame
CARDS.bicycle = (press, t, lf) => {
    const z = G3.push(0.0113, t, lf, 1);
    press.save();
    press.each((g) => { g.translate(500, 500); g.scale(z, z); g.translate(-500, -500); });
    DRAW_BICYCLE(press, t);
    press.restore();
};
