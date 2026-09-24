// Card «savanna» (reference 13.75–13.875 s, full frame). An umbrella pine and two cypresses
// in silhouette against a sunset over a striped field: yellow printed flat over the whole card,
// the reference's own pink screen (12.96 px, 78°) turning the sky red at the top and thinning
// to bare yellow round the glow low on the right, a murmuration cloud (three linked loops of
// olive specks), red streaks, birds, a dark hedge line, and a field of blue screen (9.72 px,
// 18°) with yellow furrow crests converging on a vanishing point. Everything measured on the
// 13.75 s frame in reference px (1080 = 1000 units): colour-run scans for the silhouettes,
// ink coverages fitted on 90 × 54 px blocks, lattices fitted per drawing.
// Needs cards/_g6-util.js.
var CARDS = CARDS || {};
CARDS.savanna = (press, t) => {
    const T = Riso.tone, U = G6;
    const pink = press.plate('pink'), blue = press.plate('blue'), navy = press.plate('navy'), yellow = press.plate('yellow');
    const d = Math.min(1, Math.floor(t * 12 + 1e-6));
    const px = (v) => v / 1.08, P = (pts) => pts.map(([x, y]) => [x / 1.08, y / 1.08]);
    const vramp = (g, y0, y1, stops) => { const gr = g.createLinearGradient(0, y0, 0, y1); stops.forEach(([f, v]) => gr.addColorStop(f, T(v))); return gr; };
    // the second drawing is the same print moved (-4, 1.5) px (both screens' phases shift by it)
    press.save();
    if (d === 1) press.each((g) => g.translate(px(-4.1), px(1.5)));

    // yellow flat over everything
    yellow.fillStyle = T(1); yellow.fillRect(-20, -20, 1040, 1040);

    // the sky's pink screen: coverage 0.95 at the top, 0.6 at a third, 0.44 low down; bare in
    // a flattened glow round (745, 690) px
    const LP = { o: [0.52, -6.15], a: [2.6984, 12.6783], b: [-12.6751, 2.6956] };
    U.lattice(pink, LP, (m) => {
        m.fillStyle = vramp(m, 0, px(880), [[0, 0.97], [0.12, 0.9], [0.26, 0.74], [0.37, 0.64], [0.49, 0.49], [0.7, 0.46], [0.88, 0.44], [1, 0.44]]);
        m.fillRect(-20, -20, 1040, px(900));
        m.globalCompositeOperation = 'destination-out'; m.fillStyle = T(0.8); m.fillRect(-20, px(845), 1040, 400); m.globalCompositeOperation = 'source-over';
        m.globalCompositeOperation = 'destination-out';
        const gl = m.createRadialGradient(px(745), px(690), 0, px(745), px(690), px(330));
        gl.addColorStop(0, T(1)); gl.addColorStop(0.3, T(0.92)); gl.addColorStop(0.65, T(0.45)); gl.addColorStop(1, T(0));
        m.fillStyle = gl; m.save(); m.translate(0, px(690)); m.scale(1, 0.75); m.translate(0, -px(690)); m.fillRect(-20, -200, 1040, 1600); m.restore();
    });

    // the murmuration: three linked loops of specks (dense rims ~45 px wide, sparse insides);
    // each speck a tiny tapered dash (a bird at that distance), navy with a little blue: olive
    // on the red sky. Rim centre-lines measured on a speck-density map (15 × 20 px cells).
    const loops = [
        [[20, 200], [10, 130], [45, 70], [110, 42], [200, 40], [270, 70], [300, 120], [270, 175], [200, 205], [100, 212]],
        [[390, 190], [480, 168], [580, 180], [640, 230], [690, 300], [690, 370], [620, 400], [520, 405], [440, 395], [405, 320]],
        [[795, 200], [880, 160], [980, 135], [1075, 125], [1085, 260], [1060, 360], [980, 395], [860, 395], [795, 360], [785, 280]],
    ];
    const fills = [0.004, 0.009, 0.008];
    const bridges = [[[270, 110], [320, 140], [380, 165], [440, 175]], [[600, 395], [700, 393], [800, 392], [900, 390], [975, 385]]];
    const rs = Motion.rng('svmur');
    const smoothPts = (pts, closed) => {
        const out = [], n = pts.length;
        for (let i = 0; i < (closed ? n : n - 1); i++) {
            const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
            for (let k = 0; k < 8; k++) {
                const s = k / 8, s2 = s * s, s3 = s2 * s;
                out.push([0, 1].map((c) => 0.5 * (2 * p1[c] + (-p0[c] + p2[c]) * s + (2 * p0[c] - 5 * p1[c] + 4 * p2[c] - p3[c]) * s2 + (-p0[c] + 3 * p1[c] - 3 * p2[c] + p3[c]) * s3)));
            }
        }
        return out;
    };
    const specks = [];
    const along = (pts, closed, per, spread) => {
        const sp = smoothPts(pts, closed);
        for (let i = 0; i < sp.length - (closed ? 0 : 1); i++) {
            const [x0, y0] = sp[i], [x1, y1] = sp[(i + 1) % sp.length], L = Math.hypot(x1 - x0, y1 - y0) || 1, nx = -(y1 - y0) / L, ny = (x1 - x0) / L;
            const n = Math.round(L * per);
            for (let k = 0; k < n; k++) { const f = rs(), o = (rs() + rs() + rs() + rs() - 2) * spread; specks.push([x0 + (x1 - x0) * f + nx * o, y0 + (y1 - y0) * f + ny * o]); }
        }
        return sp;
    };
    const rims = loops.map((l) => along(l, true, 2.2, 26));
    bridges.forEach((br) => along(br, false, 2.2, 20));
    // the insides: sparse
    rims.forEach((sp, li) => {
        const xs = sp.map((p) => p[0]), ys = sp.map((p) => p[1]), x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
        const n = Math.round((x1 - x0) * (y1 - y0) * fills[li]);
        for (let k = 0; k < n; k++) specks.push([x0 + rs() * (x1 - x0), y0 + rs() * (y1 - y0), sp]);
    });
    const inside = (p, poly) => { let c = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const [xi, yi] = poly[i], [xj, yj] = poly[j]; if ((yi > p[1]) !== (yj > p[1]) && p[0] < ((xj - xi) * (p[1] - yi)) / (yj - yi) + xi) c = !c; } return c; };
    for (const [g, v, share] of [[navy, 0.72, 1], [blue, 0.5, 0.55]]) {
        const r2 = Motion.rng('svmur2');
        g.fillStyle = T(v); g.beginPath();
        for (const s of specks) {
            const a = r2() * 6.28, len = 2.2 + r2() * 3.4, w = 0.9 + r2() * 0.9, pick = r2();
            if (s[2] && !inside(s, s[2])) continue;
            if (pick > share) continue;
            const x = s[0], y = s[1], ca = Math.cos(a), sa = Math.sin(a);
            // a tapered dash: a thin diamond
            g.moveTo(px(x - ca * len), px(y - sa * len)); g.lineTo(px(x - sa * w), px(y + ca * w)); g.lineTo(px(x + ca * len), px(y + sa * len)); g.lineTo(px(x + sa * w), px(y - ca * w)); g.closePath();
        }
        g.fill();
    }

    // red streak clouds low on the right: pink brush lines over the yellow (739–771, 793–809 px)
    const streak = (x0, x1, y0, y1, w, seed) => {
        const r = Motion.rng('svst' + seed), top = [], bot = [];
        for (let i = 0; i <= 24; i++) { const f = i / 24, x = x0 + (x1 - x0) * f, y = y0 + (y1 - y0) * f + Math.sin(f * 9 + seed) * 1.2, hw = w * Math.sin(Math.PI * Math.min(1, f * 1.15)) ** 0.6 * (0.8 + 0.4 * r()); top.push([x, y - hw]); bot.unshift([x, y + hw]); }
        U.poly(pink, P([...top, ...bot]), T(0.95));
    };
    streak(410, 965, 740, 770, 3.2, 1); streak(470, 720, 752, 760, 1.6, 2); streak(595, 945, 795, 808, 2.8, 3);
    // birds on the right, flapping on twos
    const bird = (x, y, s, up) => { const w = up ? -7 : 3; U.poly(navy, P([[x - 13 * s, y + w * s], [x - 3 * s, y - 2 * s], [x, y + 4 * s], [x + 3 * s, y - 2 * s], [x + 13 * s, y + w * s], [x + 2 * s, y + 2 * s], [x - 2 * s, y + 2 * s]]), T(1)); };
    [[977, 548, 1.1], [934, 620, 1.2], [1069, 600, 1.3], [1060, 425, 1.0], [1105, 640, 1]].forEach(([x, y, s], i) => bird(x, y, s, (d + i) % 2 === 0));

    // silhouettes: one flat dark olive-brown (fitted: navy 0.66, blue 0.75, pink 0.35 over the
    // yellow); nearer layers are one piece, so they print as one colour
    const sil = (fn) => {
        pink.save(); pink.globalCompositeOperation = 'destination-out'; pink.fillStyle = T(1); pink.strokeStyle = T(1); fn(pink); pink.restore();
        for (const [g, v] of [[navy, 0.68], [blue, 0.76], [pink, 0.36]]) { g.save(); g.fillStyle = T(v); g.strokeStyle = T(v); fn(g); g.restore(); }
    };
    // (the sky's pink dots under the silhouettes: cleared so the silhouette pink is flat)
    const shapes = [];
    // hedge: top and bottom edges measured every 30 px
    const hedgeTop = [[-10, 780], [30, 785], [90, 796], [180, 797], [210, 810], [240, 806], [270, 814], [300, 818], [330, 808], [360, 805], [420, 809], [480, 816], [510, 823], [540, 816], [570, 812], [630, 819], [690, 832], [750, 825], [810, 831], [870, 832], [930, 838], [945, 806], [960, 790], [980, 772], [1010, 764], [1040, 759], [1090, 758]];
    const hedgeBot = [[1090, 886], [1000, 884], [900, 876], [780, 872], [640, 868], [600, 861], [540, 859], [480, 854], [390, 851], [300, 846], [210, 842], [120, 839], [30, 832], [-10, 831]];
    const rh = Motion.rng('svhedge');
    const bumpy = (pts, amp) => { const out = []; for (let i = 0; i < pts.length - 1; i++) { const [x0, y0] = pts[i], [x1, y1] = pts[i + 1], n = Math.max(1, Math.round(Math.abs(x1 - x0) / 9)); for (let k = 0; k < n; k++) { const f = k / n; out.push([x0 + (x1 - x0) * f, y0 + (y1 - y0) * f + (rh() - 0.5) * amp - Math.abs(Math.sin((x0 + (x1 - x0) * f) / 17)) * amp * 0.8]); } } out.push(pts[pts.length - 1]); return out; };
    const hedge = P([...bumpy(hedgeTop, 5), ...hedgeBot]);
    // cypresses: flames (centre, top, half-width at the base, base) measured from the scans
    const cyp = (cx, top, hw, bot, seed) => {
        const r = Motion.rng('svcy' + seed), L = [], R = [];
        for (let i = 0; i <= 16; i++) {
            const f = i / 16, y = top + (bot - top) * f, w = hw * Math.pow(Math.sin(Math.min(1, f * 1.45) * Math.PI / 2), 0.8) * (1 - 0.1 * f);
            R.push([cx + w * (1 + 0.06 * (r() - 0.5)), y]); L.unshift([cx - w * (1 + 0.06 * (r() - 0.5)), y]);
        }
        return P([...R, ...L]);
    };
    // the umbrella pine's canopy: one lobed outline (top from the scans, the dot's bump removed)
    const canopy = P([[192, 690], [186, 655], [196, 628], [218, 612], [236, 600], [246, 585], [262, 570], [286, 559], [310, 541], [332, 546], [352, 546], [373, 534], [395, 526], [412, 520], [432, 527], [456, 542], [480, 561], [500, 578], [520, 592], [548, 600], [572, 614], [588, 640], [594, 670], [586, 700], [566, 716], [540, 719], [515, 712], [498, 698], [472, 683], [442, 670], [420, 686], [398, 676], [372, 678], [346, 667], [330, 660], [314, 682], [292, 692], [262, 699], [232, 696], [210, 683]]);
    const trunk = P([[368, 830], [372, 760], [374, 700], [390, 700], [394, 760], [398, 830]]);
    const branches = [[[[380, 735], [340, 708], [300, 682]], 10], [[[384, 738], [440, 712], [500, 698]], 9], [[[379, 722], [364, 690], [355, 668]], 9], [[[385, 722], [404, 692], [420, 670]], 8]];
    sil((g) => {
        U.path(g, hedge); g.fill();
        U.path(g, cyp(84, 512, 44, 836, 1)); g.fill();
        U.path(g, cyp(148, 588, 28, 840, 2)); g.fill();
        U.smooth(g, canopy); g.fill();
        U.path(g, trunk); g.fill();
        g.lineCap = 'round'; g.lineJoin = 'round';
        for (const [pts, w] of branches) { g.lineWidth = px(w); g.beginPath(); P(pts).forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke(); }
    });
    // grass sprigs by the bush
    for (let i = 0; i < 6; i++) U.stroke(blue, P([[955 + i * 8, 800], [945 + i * 11, 745 + (i % 3) * 10]]), 1.6, T(0.9));

    // the field: the blue screen (9.72 px, 18°) over the yellow; a light far band on the left
    // (a diagonal from (0, 925) to (560, 866) px), dark near the horizon, then furrows whose
    // crests are yellow (blue lifted) converging on (778, 874) px
    const field = P([[-20, 830], [1100, 830], [1100, 1100], [-20, 1100]]);
    const VP = [778, 874];
    const LB = { o: [-2.28, 0.60], a: [-2.9741, 9.2597], b: [9.2517, 2.9840] };
    const crests = (m, wmul) => {
        for (let i = -34; i <= 34; i++) {
            // crests start ~40 px below the horizon (the far rows merge into dark green)
            const bx = VP[0] + i * 60 + 30, w = (5 + Math.abs(i) * 0.25) * wmul, f0 = 0.16;
            const sx = VP[0] + (bx - VP[0]) * f0, sy = VP[1] + (1090 - VP[1]) * f0;
            m.beginPath(); m.moveTo(px(sx), px(sy)); m.lineTo(px(bx - w), px(1090)); m.lineTo(px(bx + w), px(1090)); m.closePath(); m.fill();
        }
    };
    U.lattice(blue, LB, (m) => {
        U.clipped(m, field, (h) => {
            h.fillStyle = vramp(h, px(840), px(1080), [[0, 1.1], [0.45, 1.1], [0.6, 0.95], [1, 0.9]]);
            h.fillRect(-20, 0, 1040, 1100);
            h.globalCompositeOperation = 'destination-out';
            // the far band: light (bare yellow with sparse dots)
            h.fillStyle = T(0.75); U.path(h, P([[-20, 830], [560, 830], [560, 866], [-20, 927]])); h.fill();
        });
    }, { min: 0.05 });
    // furrows: solid blue lines (dark green) and yellow crests cut through the screen, crisp
    // (a screen can't carry lines finer than its pitch)
    U.clipped(blue, field, (h) => {
        h.fillStyle = T(0.9);
        for (let i = -34; i <= 34; i++) {
            const bx = VP[0] + i * 60, w = 4 + Math.abs(i) * 0.3, f0 = 0.05, sx = VP[0] + (bx - VP[0]) * f0, sy = VP[1] + (1090 - VP[1]) * f0;
            h.beginPath(); h.moveTo(px(sx), px(sy)); h.lineTo(px(bx - w), px(1090)); h.lineTo(px(bx + w), px(1090)); h.closePath(); h.fill();
        }
        h.globalCompositeOperation = 'destination-out'; h.fillStyle = T(1); crests(h, 1.05);
    });
    // the far band's navy tint (olive)
    U.clipped(press.plate('navy', 'screen'), P([[-20, 830], [560, 830], [560, 866], [-20, 927]]), (h) => { h.fillStyle = T(0.22); h.fillRect(-20, 0, 1040, 1100); });
    press.restore();
};
