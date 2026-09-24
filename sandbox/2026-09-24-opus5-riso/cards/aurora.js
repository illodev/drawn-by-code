// Card «aurora» (reference 13.625–13.75 s, full frame). An aurora curtain over a forest lake:
// a purple top, green curtains (yellow + blue) of vertical streaks with yellow tips along
// their sagging lower edge, a blue starry sky, purple firs with snow banks on the shore,
// their reflections broken by ripples, green light on the water. Measured on the 13.63 s
// frame (px / 1.08 = units). Needs cards/_g6-util.js.
var CARDS = CARDS || {};
CARDS.aurora = (press, t) => {
    const R = Riso, T = R.tone, U = G6;
    const pinkS = press.plate('pink', 'screen'), pink = press.plate('pink');
    const blueS = press.plate('blue', 'screen'), blue = press.plate('blue');
    const navyS = press.plate('navy', 'screen'), navy = press.plate('navy');
    const yellowS = press.plate('yellow', 'screen'), yellow = press.plate('yellow');
    const d = Math.floor(t * 12 + 1e-6);
    const px = (v) => v / 1.08;
    const lerpTab = (tab) => (x) => { // piecewise-linear table in px, x in units → y units
        const X = x * 1.08;
        for (let i = 0; i < tab.length - 1; i++) if (X <= tab[i + 1][0]) { const [x0, y0] = tab[i], [x1, y1] = tab[i + 1]; return px(y0 + ((y1 - y0) * (X - x0)) / (x1 - x0)); }
        return px(tab[tab.length - 1][1]);
    };
    const vramp = (g, y0, y1, stops) => { const gr = g.createLinearGradient(0, y0, 0, y1); stops.forEach(([f, v]) => gr.addColorStop(f, T(v))); return gr; };
    const SHORE = lerpTab([[0, 684], [300, 672], [600, 660], [800, 650], [1080, 636]]);

    // sky: blue everywhere above the shore (a light flat and a dense screen), purple top
    // (inks fitted on 90 px blocks: the blue is a full solid under the curtain and in the
    // lake, 0.65 in the purple top; navy dots darken it)
    blue.fillStyle = vramp(blue, 0, 170, [[0, 0.65], [0.6, 0.7], [1, 1]]); blue.fillRect(0, 0, 1000, 1000);
    navyS.fillStyle = T(0.1); navyS.fillRect(0, 150, 1000, 500);
    pinkS.fillStyle = vramp(pinkS, 0, 200, [[0, 0.95], [0.5, 0.55], [1, 0]]); pinkS.fillRect(0, 0, 1000, 200);
    navyS.fillStyle = vramp(navyS, 0, 150, [[0, 0.25], [1, 0]]); navyS.fillRect(0, 0, 1000, 150);
    // pink drips hanging from the top band (vertical streaks)
    {
        const r = Motion.rng('audrip');
        for (let i = 0; i < 70; i++) { const x = r() * 1000, l = 40 + r() * 150; pinkS.fillStyle = vramp(pinkS, 60, 60 + l, [[0, 0.7], [1, 0]]); pinkS.fillRect(x, 60, 2 + r() * 6, l); }
    }

    // the aurora is two curtains of vertical streaks (read off a 60 px grid of the 13.63 s
    // frame): an upper one from y ≈ 40 to a bottom edge at 200–240 px (rising to 60 at the right
    // edge), pink-red streaks mixed into its green; a lower one hanging from ≈ 230 to a
    // sagging bottom edge (410 → 470 at 640 → 330 at 900), bright yellow at its foot. Each is
    // hundreds of tapered streaks, green (yellow screen over the blue), with gaps of blue sky.
    const CUR = [
        { top: lerpTab([[0, 100], [540, 110], [1080, 40]]), bot: lerpTab([[0, 215], [240, 225], [480, 232], [600, 240], [720, 236], [840, 205], [960, 170], [1020, 120], [1080, 60]]), n: 800, pinkMix: 0.3 },
        { top: lerpTab([[0, 225], [600, 240], [840, 205], [1080, 150]]), bot: lerpTab([[0, 408], [120, 412], [240, 420], [360, 430], [480, 448], [600, 468], [660, 470], [720, 450], [780, 425], [840, 380], [900, 330], [960, 330], [1020, 350], [1080, 340]]), n: 900, pinkMix: 0 },
    ];
    const ray = (g, x, y1, len, w) => { g.moveTo(x - w / 2, y1); g.quadraticCurveTo(x - w * 0.25, y1 - len * 0.5, x, y1 - len); g.quadraticCurveTo(x + w * 0.25, y1 - len * 0.5, x + w / 2, y1); g.closePath(); };
    const r = Motion.rng('aucur' + (d % 2));
    const soft = [new Path2D(), new Path2D(), new Path2D()], brightP = new Path2D(), pinkP = new Path2D();
    for (const c of CUR) for (let i = 0; i < c.n; i++) {
        const x = r() * 1000, b = c.bot(x), tp = c.top(x), H = b - tp, k = r();
        if (H < 8) continue;
        const foot = b - r() * H * 0.15, len = H * (0.45 + 0.55 * r()), w = 5 + r() * 12;
        ray(soft[Math.floor(r() * 3)], x, foot, len, w);
        if (k < c.pinkMix) ray(pinkP, x + (r() - 0.5) * 6, tp + H * (0.05 + 0.25 * r()), 30 + H * 0.5 * r(), 2 + r() * 4);
        else if (k > 0.8) ray(brightP, x, foot + r() * 6, H * (0.08 + 0.3 * r()), 1.4 + r() * 3.2);
    }
    // green: yellow screen in three strengths (the streaks overlap into denser green)
    // (measured at 2×: the streaks are sharp spikes, flat green with crisp edges, not a soft
    // screen; some carry a pale core line where the ink thins)
    soft.forEach((p, i) => { yellow.fillStyle = T([0.5, 0.4, 0.3][i]); yellow.fill(p); });
    { const cr = Motion.rng('aucore'), core = new Path2D(); for (const c of CUR) for (let i = 0; i < 90; i++) { const x = cr() * 1000, b = c.bot(x), tp = c.top(x), H = b - tp; if (H < 8) continue; ray(core, x, b - cr() * H * 0.2, H * (0.3 + 0.6 * cr()), 1.2 + cr() * 1.4); }
      for (const g of [blue, navy, navyS]) { g.save(); g.globalCompositeOperation = 'destination-out'; g.fillStyle = T(0.6); g.fill(core); g.restore(); } }
    // a light green glow along each curtain's foot (where the streaks bunch)
    for (const c of CUR) for (let x = 0; x < 1000; x += 5) { const b = c.bot(x); yellowS.fillStyle = vramp(yellowS, b - 70, b, [[0, 0], [1, 0.45]]); yellowS.fillRect(x, b - 70, 5.4, 70); }
    // bright streaks: pure yellow (blue and navy lifted under them)
    for (const g of [blue, blueS, navyS, navy]) { g.save(); g.globalCompositeOperation = 'destination-out'; g.fillStyle = T(0.9); g.fill(brightP); g.restore(); }
    yellow.fillStyle = T(1); yellow.fill(brightP);
    // pink-red streaks in the upper curtain
    pink.fillStyle = T(0.6); pink.fill(pinkP);
    // stars
    // (stars: small white knockouts in the blue below the curtain, and pink specks)
    press.knockout((g) => U.speckle(g, [0, 300, 1000, 640], 160, 0.6, 1.9, 'aust', T(1), (x, y) => y > CUR[1].bot(x) + 8 && y < SHORE(x) - 10));
    U.speckle(pink, [0, 300, 1000, 640], 20, 0.8, 1.8, 'aups', T(1), (x, y) => y > CUR[1].bot(x) + 8);

    // the firs: [x px, tip y px] (base on the shore)
    const firs = [
        [10, 330], [45, 360], [80, 420], [112, 440], [140, 470], [168, 505], [196, 540], [222, 548], [250, 560], [275, 585], [300, 575], [330, 595],
        [360, 565], [388, 555], [410, 548], [438, 590], [462, 600], [488, 595], [515, 610], [542, 620], [575, 612], [604, 570], [628, 590], [655, 565], [684, 580],
        [712, 540], [730, 500], [752, 560], [778, 575], [800, 560], [820, 540], [848, 520], [872, 490], [896, 470], [920, 500], [944, 450], [968, 470], [996, 420], [1024, 400], [1050, 330], [1072, 360],
    ];
    const tree = (g, [X, Y], mirror) => {
        const x = px(X), tip = px(Y), base = SHORE(x) + 4, h = base - tip, w = Math.min(90, h * 0.36);
        if (!mirror) U.pine(g, x, tip, h, w, 'af' + X);
        else { g.save(); g.translate(0, base * 2.4); g.scale(1, -1.4); U.pine(g, x, tip, h, w, 'af' + X); g.restore(); }
    };
    // dark mass between the trunks on the left and right (the forest floor)
    const massL = [[0, px(420)], [px(60), px(520)], [px(140), px(600)], [px(300), px(650)], [px(300), SHORE(px(300)) + 4], [0, SHORE(0) + 4]];
    const massR = [[1000, px(420)], [px(980), px(520)], [px(900), px(590)], [px(780), px(630)], [px(780), SHORE(px(780)) + 4], [1000, SHORE(1000) + 4]];
    // more firs packed in the clusters (left and right), smaller behind
    { const rr = Motion.rng('aufill'); for (let i = 0; i < 26; i++) { const side = i % 2, X = side ? 820 + rr() * 260 : rr() * 300, Y = side ? 430 + rr() * 150 + (1080 - X) * 0.05 : 400 + X * 0.6 + rr() * 60; firs.push([X, Y]); } }
    press.knockout((g) => { for (const f of firs) tree(g, f); U.path(g, massL); g.fill(); U.path(g, massR); g.fill(); });
    // (flat ink: dark purple-navy, measured navy 0.85, pink 0.45, blue 0.5)
    for (const [g, v] of [[navy, 0.85], [pink, 0.45], [blue, 0.5]]) { g.fillStyle = T(v); for (const f of firs) tree(g, f); U.poly(g, massL, T(v)); U.poly(g, massR, T(v)); }

    // the lake: everything below the shore
    const lake = [];
    for (let x = 0; x <= 1000; x += 20) lake.push([x, SHORE(x) + 3]);
    lake.push([1000, 1000], [0, 1000]);
    press.knockout((g) => { U.path(g, lake); g.fill(); });
    U.poly(blue, lake, T(1));
    // the lake's navy is the reference's own screen (10.8 px at 72°, phase per drawing)
    const LL = [{ o: [1.01, 4.08], a: [3.3227, 10.2934], b: [-10.2768, 3.3143] }, { o: [1.50, -1.11], a: [3.3226, 10.2927], b: [-10.2773, 3.3143] }][Math.min(1, d)];
    U.lattice(navy, LL, (m) => U.clipped(m, lake, (g) => { g.fillStyle = vramp(g, 620, 1000, [[0, 0.3], [0.5, 0.3], [1, 0.45]]); g.fillRect(0, 0, 1000, 1000); }));
    // green light on the water: rows of yellow-green dots (the aurora's reflection), in
    // streaky horizontal bands at y ≈ 700–880 px, the navy lifted under each dot
    {
        const rw = Motion.rng('auwat'), dp = new Path2D();
        for (const [y, x0, x1, n] of [[708, 190, 1000, 200], [722, 150, 980, 180], [742, 160, 1000, 200], [762, 80, 1000, 180], [790, 60, 900, 150], [812, 120, 820, 100], [840, 20, 760, 100], [870, 80, 560, 60]]) {
            for (let i = 0; i < n; i++) { const x = px(x0 + rw() * (x1 - x0)), yy = px(y + (rw() - 0.5) * 10), rr = 1.8 + rw() * 2.4; dp.moveTo(x + rr * 1.6, yy); dp.ellipse(x, yy, rr * 1.6, rr, 0, 0, 7); }
        }
        for (const g of [navy, pink]) { g.save(); g.globalCompositeOperation = 'destination-out'; g.fillStyle = T(1); g.fill(dp); g.restore(); }
        yellow.fillStyle = T(0.9); yellow.fill(dp);
        U.clipped(yellowS, lake, (g) => { for (const [y, h, x0, x1, v] of [[715, 26, 180, 1000, 0.3], [750, 24, 150, 1000, 0.3], [795, 20, 60, 900, 0.22], [845, 18, 40, 760, 0.15]]) { g.fillStyle = T(v); g.beginPath(); g.ellipse(px((x0 + x1) / 2), px(y), px((x1 - x0) / 2), px(h / 2), 0, 0, 7); g.fill(); } });
    }
    // reflections of the firs, broken into slices by ripples
    // (flat like the trees: the reflections are the same inks, a little lighter)
    U.clipped(navy, lake, (g) => { g.fillStyle = T(0.72); for (const f of firs) tree(g, f, true); });
    U.clipped(pink, lake, (g) => { g.fillStyle = T(0.45); for (const f of firs) tree(g, f, true); });
    // ripples: thin horizontal knock-outs across the reflections, a few white glints
    press.knockout((g) => {
        const rr = Motion.rng('aurip');
        for (let i = 0; i < 22; i++) {
            const y = 640 + rr() * 300, x = rr() * 1000, l = 20 + rr() * 120;
            if (y < SHORE(x) + 12) continue;
            g.globalAlpha = 0.35 + rr() * 0.5;
            g.fillRect(x, y, l, 1.4 + rr() * 1.6);
        }
    });
    press.knockout((g) => { for (const [x, y, l] of [[140, 770, 120], [360, 690, 70], [500, 770, 60], [540, 750, 40], [780, 715, 50], [720, 700, 40]]) g.fillRect(x, y, l, 2.4); });
    // the snow banks on the shore: white lumps with a pink underside
    const banks = [[0, 660, 140, 688], [270, 648, 460, 668], [530, 640, 660, 658], [740, 618, 995, 645]];
    for (const [x0, y0, x1, y1] of banks) {
        const r2 = Motion.rng('ausn' + x0), pts = [];
        const X0 = px(x0), X1 = px(x1), top = px(y0), bot = px(y1);
        for (let i = 0; i <= 10; i++) { const f = i / 10, x = X0 + (X1 - X0) * f; pts.push([x, top + (bot - top) * (0.55 + 0.45 * Math.abs(f - 0.3) * 1.2) - Math.sin(f * Math.PI) * 5 * r2() - 2]); }
        pts.push([X1, bot], [X0, bot]);
        press.knockout((g) => { U.path(g, pts); g.fill(); });
        U.poly(pinkS, [[X0, bot - 3], [X1, bot - 3], [X1, bot], [X0, bot]], T(0.6));
    }
    // the shoreline: a thin light line
    press.knockout((g) => { g.globalAlpha = 0.6; U.stroke(g, [[0, SHORE(0) + 3], [1000, SHORE(1000) + 3]], 1.4); });
};
