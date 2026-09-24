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

    // the curtain: between a top edge and a sagging bottom edge (px tables)
    const BOT = lerpTab([[0, 392], [100, 402], [200, 428], [300, 440], [400, 446], [470, 462], [540, 462], [640, 432], [720, 410], [800, 386], [880, 330], [950, 282], [1010, 246], [1080, 205]]);
    const TOP = lerpTab([[0, 90], [200, 100], [400, 140], [600, 150], [800, 110], [1080, 60]]);
    const r = Motion.rng('aucur' + (d % 2));
    // the green glow: yellow screen densest at the bottom edge, fading upwards
    for (let x = 0; x < 1000; x += 5) {
        const b = BOT(x), tp = TOP(x);
        yellowS.fillStyle = vramp(yellowS, tp, b, [[0, 0.1], [0.3, 0.45], [0.8, 0.75], [1, 0.8]]);
        yellowS.fillRect(x, tp, 5.4, b - tp);
    }
    // the rays: tapered vertical streaks, wide and bright at the foot, thin at the top;
    // yellow flat (bright), yellow screen (green) and navy (dark gaps between rays)
    const ray = (g, x, y1, len, w, stops) => { g.fillStyle = vramp(g, y1 - len, y1, stops); g.beginPath(); g.moveTo(x - w / 2, y1); g.quadraticCurveTo(x - w * 0.2, y1 - len * 0.5, x, y1 - len); g.quadraticCurveTo(x + w * 0.2, y1 - len * 0.5, x + w / 2, y1); g.fill(); };
    // a bright ray is pure yellow: the blue under it is lifted first (a light colour over a
    // dark one needs the dark plates knocked out, never just more ink)
    const bright = (x, y1, len, w, stops) => {
        for (const g of [blue, blueS, navyS]) { g.save(); g.globalCompositeOperation = 'destination-out'; ray(g, x, y1, len, w * 1.2, stops); g.restore(); }
        ray(yellow, x, y1, len, w, stops);
    };
    for (let i = 0; i < 240; i++) {
        const x = r() * 1000, b = BOT(x), tp = TOP(x), k = r();
        if (k < 0.25) ray(navyS, x, b - r() * 30, (b - tp) * (0.4 + 0.6 * r()), 2 + r() * 5, [[0, 0], [1, 0.3]]);
        else if (k < 0.75) ray(yellowS, x, b - r() * 20, (b - tp) * (0.5 + 0.5 * r()), 3 + r() * 8, [[0, 0], [0.7, 0.7], [1, 1]]);
        else bright(x, b - r() * 25, (b - tp) * (0.2 + 0.5 * r()), 1.5 + r() * 4, [[0, 0], [0.7, 0.45], [1, 1]]);
    }
    // bright yellow tips hanging at the lower edge
    for (let i = 0; i < 90; i++) { const x = r() * 1000, b = BOT(x); bright(x, b + r() * 16, 20 + r() * 60, 2 + r() * 3.5, [[0, 0.2], [1, 1]]); }
    // pink rays dripping from the top band into the curtain
    for (let i = 0; i < 80; i++) { const x = r() * 1000; ray(pink, x, 60 + r() * 170, 60 + r() * 120, 1.5 + r() * 4, [[0, 0.6], [1, 0]]); }
    // stars
    press.knockout((g) => U.speckle(g, [60, 300, 900, 600], 90, 0.7, 2, 'aust', T(1), (x, y) => y > BOT(x) + 10));
    U.speckle(pink, [100, 300, 900, 600], 10, 1, 2, 'aups', T(1), (x, y) => y > BOT(x) + 10);

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
    for (const [g, v] of [[navy, 0.66], [pinkS, 0.45], [blueS, 0.35]]) { g.fillStyle = T(v); for (const f of firs) tree(g, f); U.poly(g, massL, T(v)); U.poly(g, massR, T(v)); }

    // the lake: everything below the shore
    const lake = [];
    for (let x = 0; x <= 1000; x += 20) lake.push([x, SHORE(x) + 3]);
    lake.push([1000, 1000], [0, 1000]);
    press.knockout((g) => { U.path(g, lake); g.fill(); });
    U.poly(blue, lake, T(1));
    // the lake's navy is the reference's own screen (10.8 px at 72°, phase per drawing)
    const LL = [{ o: [1.01, 4.08], a: [3.3227, 10.2934], b: [-10.2768, 3.3143] }, { o: [1.50, -1.11], a: [3.3226, 10.2927], b: [-10.2773, 3.3143] }][Math.min(1, d)];
    U.lattice(navy, LL, (m) => U.clipped(m, lake, (g) => { g.fillStyle = vramp(g, 620, 1000, [[0, 0.3], [0.5, 0.3], [1, 0.45]]); g.fillRect(0, 0, 1000, 1000); }));
    // green light on the water: soft yellow bands
    U.clipped(yellowS, lake, (g) => {
        for (const [y, h, x0, x1, v] of [[705, 30, 160, 900, 0.55], [735, 22, 200, 960, 0.5], [770, 26, 120, 1000, 0.45], [805, 20, 260, 880, 0.35], [840, 18, 300, 800, 0.25]]) {
            g.fillStyle = T(v); g.beginPath(); g.ellipse((x0 + x1) / 2, y, (x1 - x0) / 2, h / 2, 0, 0, 7); g.fill();
        }
    });
    // reflections of the firs, broken into slices by ripples
    U.clipped(navyS, lake, (g) => { g.fillStyle = T(0.5); for (const f of firs) tree(g, f, true); });
    U.clipped(pinkS, lake, (g) => { g.fillStyle = T(0.35); for (const f of firs) tree(g, f, true); });
    // ripples: thin horizontal knock-outs across the reflections, a few white glints
    press.knockout((g) => {
        const rr = Motion.rng('aurip');
        for (let i = 0; i < 70; i++) {
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
