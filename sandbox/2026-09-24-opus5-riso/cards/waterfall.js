// Card «waterfall» (reference ≈ 10.5–10.7 s, full frame at 10.6; re-shown re-inked in pinks
// at 23 s): a waterfall pouring out of a notch between jungle cliffs into a pool, fronds on
// the rocks. 1000 × 1000 units, measured on the 10.6 s frame. Needs _g3-util.js (G3).
var CARDS = CARDS || {};
const DRAW_WATERFALL = (press, t) => {
    const R = Riso, T = R.tone, U = G3;
    const d = Math.floor(t * 12 + 1e-6);
    const pink = press.plate('pink'), pinkS = press.plate('pink', 'screen');
    const blue = press.plate('blue'), blueS = press.plate('blue', 'screen');
    const navy = press.plate('navy'), navyS = press.plate('navy', 'screen');
    const yellow = press.plate('yellow'), yellowS = press.plate('yellow', 'screen');
    const fillP = (g, pts, v) => { g.fillStyle = typeof v === 'number' ? T(v) : v; U.path(g, pts); g.fill(); };
    const fillS = (g, pts, v) => { g.fillStyle = typeof v === 'number' ? T(v) : v; U.smooth(g, pts); g.fill(); };
    const off = (g, fn) => { g.save(); g.globalCompositeOperation = 'destination-out'; g.fillStyle = '#000'; g.strokeStyle = '#000'; fn(g); g.restore(); };
    const POOL = 752;

    // ── the jungle behind and the cliffs: flat yellow, a dense pink screen (orange), navy dots
    yellow.fillStyle = T(1); yellow.fillRect(0, 0, 1000, POOL + 10);
    pinkS.fillStyle = T(0.5); pinkS.fillRect(0, 0, 1000, POOL + 10);
    // cliffs: navy dots on top of the orange (brown)
    const cliffL = [[0, 72], [60, 62], [150, 70], [250, 80], [330, 92], [360, 140], [345, 300], [320, 520], [300, 700], [290, POOL + 10], [0, POOL + 10]];
    const cliffR = [[650, 150], [660, 92], [720, 55], [800, 40], [900, 45], [1000, 38], [1000, POOL + 10], [740, POOL + 10], [720, 650], [700, 470], [680, 300]];
    const chasm = [[360, 140], [372, 60], [390, 0], [630, 0], [648, 60], [660, 92], [650, 150], [680, 300], [700, 470], [720, 650], [740, POOL + 10], [290, POOL + 10], [300, 700], [320, 520], [345, 300]];
    fillP(navyS, cliffL, 0.26); fillP(navyS, cliffR, 0.26);
    // the gorge behind the fall: darker (a heavier navy screen), deepest at the top
    navyS.save(); U.path(navyS, chasm); navyS.clip();
    navyS.fillStyle = R.ramp(navyS, 0, 0, 0, 700, 0.45, 0.25); navyS.fillRect(280, 0, 470, 780); navyS.restore();
    // (the gorge is olive-brown: blue dots join the orange)
    blueS.save(); U.path(blueS, chasm); blueS.clip(); blueS.fillStyle = T(0.3); blueS.fillRect(280, 0, 470, 780); blueS.restore();
    // green moss running down the gorge walls
    for (const c of [[[352, 150], [338, 300], [318, 500], [300, 700]], [[655, 150], [680, 320], [705, 520], [728, 720]]]) { U.stroke(blue, c, 7, 0.55, true); }
    // the crack/overhang band across the top of the fall: nearly black
    for (const [g, v] of [[navy, 0.8]]) fillS(g, [[392, 140], [420, 100], [540, 94], [630, 104], [628, 145], [560, 152], [460, 152]], v);
    // the rock face: faint vertical cracks and ledges in navy
    const cracks = [
        [[315, 90], [318, 180], [305, 300], [298, 450], [290, 620], [270, 740]],
        [[398, 300], [370, 450], [355, 600], [340, 740]],
        [[640, 100], [648, 250], [690, 400], [720, 560], [735, 740]],
        [[740, 55], [728, 200], [712, 350]],
        [[800, 270], [840, 330], [880, 420]],
        [[0, 440], [60, 470], [130, 520]],
        [[840, 560], [900, 548], [1000, 540]],
        [[0, 590], [80, 600]],
    ];
    for (const c of cracks) { U.stroke(navy, c, 3.2, 0.8, true); U.stroke(yellow, c.map(([x, y]) => [x + 4, y]), 1.8, 1, true); }
    // horizontal ledges: short dark marks on the gorge walls
    for (const [x, y, w] of [[340, 360, 30], [350, 420, 26], [355, 480, 24], [655, 405, 30], [670, 470, 28], [680, 530, 26], [690, 590, 26]]) U.stroke(navy, [[x, y], [x + w, y - 3]], 3, 0.75);

    // ── moss along the cliff tops: green (blue + yellow) wavy bands with yellow lips
    const moss = (pts, th) => {
        const top = pts, bot = pts.slice().reverse().map(([x, y], i) => [x, y + th * (0.7 + 0.5 * Math.sin(i * 1.7))]);
        const shape = top.concat(bot);
        off(pinkS, (g) => { U.smooth(g, shape); g.fill(); });
        off(navyS, (g) => { U.smooth(g, shape); g.fill(); });
        fillS(blue, shape, 0.85);
        // yellow lumps (lit moss) knocked out of the blue along the top
        const r = Motion.rng('moss' + pts[0][0] + pts[0][1]);
        off(blue, (g) => { for (let i = 0; i < pts.length - 1; i++) for (let k = 0; k < 3; k++) { const f = r(), x = pts[i][0] + (pts[i + 1][0] - pts[i][0]) * f, y = pts[i][1] + (pts[i + 1][1] - pts[i][1]) * f + th * 0.3; g.beginPath(); g.ellipse(x, y, 6 + r() * 10, 3 + r() * 4, 0, 0, 7); g.fill(); } });
    };
    moss([[0, 70], [60, 60], [120, 72], [200, 75], [280, 80], [350, 96]], 22);
    moss([[400, 110], [450, 75], [520, 55], [580, 64], [640, 84]], 24);
    moss([[660, 60], [700, 42], [760, 32], [820, 38], [900, 40], [1000, 36]], 22);
    moss([[60, 160], [100, 158], [150, 168]], 10);
    moss([[850, 540], [920, 548], [1000, 535]], 12);
    // the notch at the top centre, a sliver of pink sky behind
    fillP(pink, [[480, 0], [520, 0], [505, 10]], 0.8);

    // ── fronds: yellow leaflets (flat, knocked out of the orange) and green ones (blue added)
    // a hanging frond: leaflets droop off the rib; each leaflet yellow (lit) or green (shade)
    const fr = (pts, n0, len, w, seed, green) => {
        // (at 2×: fern fronds, many narrow leaflets, not broad leaves)
        const n = Math.round(n0 * 2.8), r = Motion.rng('wfr' + seed), lv = [];
        for (let i = 1; i <= n; i++) {
            const u = i / (n + 1), k = u * (pts.length - 1), j = Math.min(pts.length - 2, Math.floor(k)), f = k - j;
            const x = pts[j][0] + (pts[j + 1][0] - pts[j][0]) * f, y = pts[j][1] + (pts[j + 1][1] - pts[j][1]) * f;
            const a = Math.atan2(pts[j + 1][1] - pts[j][1], pts[j + 1][0] - pts[j][0]);
            const L = len * 1.15 * (1 - 0.45 * u) * (0.85 + 0.3 * r()), W = w * 0.75 * (1 - 0.3 * u);
            // droop: both leaflets bend towards straight down
            for (const side of [-1, 1]) {
                let la = a + side * 0.85; la += (Math.PI / 2 - la) * 0.25;
                lv.push([x, y, la, L, W, green ? r() < 0.4 : r() < 0.08]);
            }
        }
        off(pinkS, (g) => { g.beginPath(); for (const [x, y, la, L, W] of lv) U.leaf(g, x, y, la, L + 2, W + 1.5, 0.06); g.fill(); });
        off(navyS, (g) => { g.beginPath(); for (const [x, y, la, L, W] of lv) U.leaf(g, x, y, la, L + 2, W + 1.5, 0.06); g.fill(); });
        blue.fillStyle = T(0.9); blue.beginPath(); for (const [x, y, la, L, W, gr] of lv) if (gr) U.leaf(blue, x, y, la, L, W, 0.06); blue.fill();
        // a midrib in each leaflet: a thin line of the other colour
        for (const [x, y, la, L, W, gr] of lv) { const g = gr ? yellow : blue; if (!gr) U.stroke(blue, [[x, y], [x + Math.cos(la) * L * 0.8, y + Math.sin(la) * L * 0.8]], 1.2, 0.6); }
        U.stroke(blue, pts, 2.6, 0.9, true);
    };
    fr([[0, 250], [40, 300], [70, 360], [85, 430], [70, 520]], 12, 60, 11, 'f1', false);
    fr([[0, 420], [30, 470], [40, 540], [30, 580]], 8, 55, 10, 'f2', true);
    fr([[110, 440], [160, 480], [190, 540], [200, 620]], 10, 50, 9, 'f3', true);
    fr([[160, 470], [220, 500], [260, 560], [270, 620]], 9, 45, 9, 'f4', false);
    fr([[300, 110], [320, 160], [335, 220]], 7, 45, 9, 'f5', true);
    fr([[380, 110], [360, 160], [320, 220]], 7, 40, 8, 'f6', false);
    fr([[650, 60], [660, 110], [690, 170]], 7, 40, 8, 'f7', false);
    fr([[730, 80], [700, 120], [660, 160]], 6, 35, 8, 'f8', true);
    fr([[1000, 110], [960, 160], [940, 240], [950, 320]], 10, 55, 10, 'f9', true);
    fr([[1000, 250], [970, 300], [980, 360]], 7, 45, 9, 'f10', false);
    fr([[800, 600], [850, 620], [900, 680], [920, 740]], 9, 55, 10, 'f11', true);
    fr([[880, 580], [930, 620], [960, 680], [980, 740]], 9, 55, 10, 'f12', false);
    fr([[1000, 600], [960, 650], [950, 720]], 6, 40, 8, 'f13', true);
    fr([[0, 690], [30, 720], [50, 750]], 5, 35, 8, 'f14', true);
    fr([[40, 230], [80, 280], [100, 350], [95, 420]], 10, 55, 10, 'f15', false);
    fr([[0, 330], [20, 390], [15, 460]], 7, 50, 10, 'f16', true);
    fr([[930, 100], [900, 150], [890, 220], [905, 290]], 9, 50, 10, 'f17', false);
    fr([[760, 560], [790, 610], [820, 680], [830, 740]], 8, 50, 10, 'f18', false);
    fr([[250, 440], [230, 500], [240, 560]], 6, 40, 9, 'f19', true);

    // ── the fall: paper, its lip a blue screen band, blue streaks, dark purple gaps below
    const fall = [[418, 152], [598, 152], [602, 260], [615, 420], [630, 560], [645, 690], [612, 720], [390, 720], [375, 690], [390, 560], [398, 420], [410, 260]];
    press.knockout((g) => { U.path(g, fall); g.fill(); });
    // the lip: blue screen, darker at the top edge
    blueS.save(); U.path(blueS, fall); blueS.clip();
    blueS.fillStyle = R.ramp(blueS, 0, 150, 0, 215, 0.95, 0.2); blueS.fillRect(400, 150, 220, 70); blueS.restore();
    U.stroke(blue, [[418, 153], [598, 153]], 3, 1);
    press.knockout((g) => { g.lineWidth = 3; g.beginPath(); g.moveTo(420, 176); g.quadraticCurveTo(510, 170, 598, 176); g.stroke(); });
    // gaps: the dark gorge showing through the curtain (navy + pink)
    // (narrow wedges: a point at the top, ~20 wide at the foot)
    for (const [x, y0, y1, w] of [[433, 505, 655, 18], [487, 530, 668, 16], [534, 498, 682, 22], [586, 520, 694, 22]]) {
        const sh = [[x, y0], [x + w * 0.35, y0 + 30], [x + w * 0.55, y1], [x - w * 0.45, y1], [x - w * 0.2, y0 + 40]];
        for (const [g, v] of [[navy, 0.95], [pink, 0.55]]) fillP(g, sh, v);
    }
    // streaks: thin blue dashes falling, shifted each drawing
    const rs = Motion.rng('wf-streak');
    const sh = (d % 4) * 9;
    blue.save(); U.path(blue, fall); blue.clip(); blue.fillStyle = T(0.9);
    for (let i = 0; i < 240; i++) {
        const u = rs(), y0 = 190 + rs() * 520, L = 14 + rs() * 70, x = 412 + u * 190 + (y0 - 150) * (u - 0.5) * 0.18;
        const yy = 190 + ((y0 - 190 + sh + rs() * 4) % 520);
        blue.fillRect(x, yy, 1.8 + rs() * 1.8, L);
    }
    blue.restore();
    // blue dots under the lip (spray)
    const rd = Motion.rng('wf-lipdots' + (d % 2));
    for (let i = 0; i < 70; i++) U.disc(blue, 420 + rd() * 178, 196 + Math.pow(rd(), 2) * 70, 1.2 + rd() * 1.4, 0.9);

    // ── the pool: blue screen, a band of yellow + blue (green) at the far edge, white ripples
    blueS.fillStyle = R.ramp(blueS, 0, POOL, 0, 1000, 0.62, 0.8); blueS.fillRect(0, POOL, 1000, 260);
    yellowS.fillStyle = R.ramp(yellowS, 0, POOL, 0, POOL + 120, 0.45, 0); yellowS.fillRect(0, POOL, 1000, 120);
    // ripples: long straight white strokes fanning out, crossed
    press.knockout((g) => {
        g.lineCap = 'round';
        for (const [x0, y0, x1, y1, w] of [
            [60, 900, 480, 872, 3], [500, 868, 940, 895, 3], [150, 950, 520, 905, 2.6], [560, 905, 900, 990, 2.6], [20, 985, 420, 925, 2.4],
            [360, 990, 470, 880, 2.6], [610, 1000, 520, 880, 2.6], [700, 960, 1000, 900, 2.2], [0, 860, 300, 845, 2], [700, 845, 1000, 862, 2],
            [240, 1000, 360, 905, 2], [760, 1000, 640, 905, 2], [440, 1000, 470, 930, 2],
            [100, 930, 460, 890, 3.4], [540, 890, 880, 935, 3.4], [300, 975, 560, 940, 3], [480, 945, 800, 985, 3], [180, 870, 420, 855, 2.4], [600, 855, 830, 870, 2.4],
            [520, 1000, 540, 900, 2.2], [330, 960, 380, 880, 2], [680, 960, 620, 880, 2], [0, 960, 160, 980, 2.2], [840, 990, 1000, 950, 2.2],
        ]) { g.lineWidth = w * 1.5; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke(); }
    });

    // ── the foam: a paper cloud at the foot, speckled with blue, its scalloped top
    const foam = [[268, 792], [300, 770], [340, 742], [372, 712], [410, 698], [445, 704], [470, 684], [520, 690], [560, 698], [600, 690], [650, 706], [690, 720], [720, 745], [745, 776], [730, 808], [680, 824], [600, 830], [500, 834], [400, 828], [320, 820], [280, 808]];
    press.knockout((g) => { U.smooth(g, foam); g.fill(); });
    const rf = Motion.rng('wf-foam' + (d % 2));
    blue.save(); U.smooth(blue, foam); blue.clip();
    for (let i = 0; i < 900; i++) {
        const x = 270 + rf() * 480, y = 690 + rf() * 145, dens = (y - 690) / 145;
        if (rf() < 0.25 + dens * 0.55) U.disc(blue, x, y, 1 + rf() * 1.6, 0.85);
    }
    blue.restore();
    // the soft hem: a ring of paper round the foam onto the water (the screen fades)
    off(blueS, (g) => { g.globalAlpha = 0.5; g.lineWidth = 26; U.smooth(g, foam); g.stroke(); });
};
// the film pushes in on this card: 1.05 % a frame about the centre (four corner
// patches correlated frame to frame against f254 (10.583 s), the frame it was measured on); one scale
// per frame
CARDS.waterfall = (press, t, lf) => {
    const z = G3.push(0.0105, t, lf, 2);
    press.save();
    press.each((g) => { g.translate(500, 500); g.scale(z, z); g.translate(-500, -500); });
    DRAW_WATERFALL(press, t);
    press.restore();
};
