// Card «savanna» (reference 13.75–13.875 s, full frame). An umbrella acacia and two cypresses
// in silhouette against a sunset over a striped field: yellow printed flat over the whole card,
// a pink screen that turns the sky red at the top and thins to bare yellow at the horizon,
// stippled clouds (navy + blue specks), red streaks, birds, a dark hedge line, green furrows
// converging to a vanishing point. Measured on the 13.75 s frame (px / 1.08 = units).
// Needs cards/_g6-util.js.
var CARDS = CARDS || {};
CARDS.savanna = (press, t) => {
    const R = Riso, T = R.tone, U = G6;
    const pinkS = press.plate('pink', 'screen'), pink = press.plate('pink');
    const blueS = press.plate('blue', 'screen'), blue = press.plate('blue');
    const navyS = press.plate('navy', 'screen'), navy = press.plate('navy');
    const yellow = press.plate('yellow');
    const d = Math.floor(t * 12 + 1e-6);
    const px = (v) => v / 1.08, P = (pts) => pts.map(([x, y]) => [x / 1.08, y / 1.08]);
    const vramp = (g, y0, y1, stops) => { const gr = g.createLinearGradient(0, y0, 0, y1); stops.forEach(([f, v]) => gr.addColorStop(f, T(v))); return gr; };

    // yellow flat over everything
    yellow.fillStyle = T(1); yellow.fillRect(0, 0, 1000, 1000);
    // the sky's pink screen: dense at the top, bare over the bright glow low on the right
    pinkS.fillStyle = vramp(pinkS, 0, 780, [[0, 0.85], [0.35, 0.62], [0.65, 0.4], [0.85, 0.22], [1, 0.12]]);
    pinkS.fillRect(0, 0, 1000, 800);
    pinkS.save(); pinkS.globalCompositeOperation = 'destination-out';
    pinkS.fillStyle = R.radial(pinkS, px(760), px(700), 20, 330, 0.85, 0); pinkS.fillRect(0, 0, 1000, 800); pinkS.restore();
    // a hint of blue at the top corners (the red goes brownish)
    blueS.fillStyle = vramp(blueS, 0, 200, [[0, 0.12], [1, 0]]); blueS.fillRect(0, 0, 1000, 200);

    // stippled clouds: one ribbon of specks looping in an S (a murmuration-like cloud), the sky
    // showing through its loops; specks in navy and blue (dark olive and green on the yellow)
    const ribbon = [
        P([[20, 205], [60, 110], [140, 70], [240, 105], [300, 150], [380, 140], [420, 205], [410, 300], [450, 380], [540, 420], [650, 425], [720, 385], [780, 300], [830, 205], [930, 150], [1050, 120], [1085, 170], [1060, 265], [1040, 350], [980, 400], [880, 402], [820, 372]]),
        P([[20, 205], [80, 232], [180, 222], [250, 182], [300, 150]]),
        P([[410, 195], [520, 178], [620, 230], [700, 300], [770, 330]]),
    ];
    const rs = Motion.rng('svcl');
    for (const line of ribbon) for (let i = 0; i < line.length - 1; i++) {
        const [x0, y0] = line[i], [x1, y1] = line[i + 1], L = Math.hypot(x1 - x0, y1 - y0), n = Math.round(L * 5.5);
        const nx = -(y1 - y0) / L, ny = (x1 - x0) / L, wid = px(62);
        for (let k = 0; k < n; k++) {
            const f = rs(), o = (rs() + rs() + rs() - 1.5) * wid;
            const x = x0 + (x1 - x0) * f + nx * o, y = y0 + (y1 - y0) * f + ny * o;
            const g = rs() < 0.5 ? navy : blue, s = 0.9 + rs() * 2.2;
            g.fillStyle = T(0.6 + rs() * 0.4);
            g.beginPath(); g.ellipse(x, y, s, s * 0.55, rs() * 3, 0, 7); g.fill();
        }
        U.stroke(navyS, [[x0, y0], [x1, y1]], px(90), T(0.1));
    }
    // red streak clouds low on the right: pink flat lines over the yellow
    for (const [x0, x1, y, w] of [[440, 985, 742, 5], [600, 940, 800, 4], [480, 700, 752, 2.5]]) U.stroke(pink, [[px(x0), px(y)], [px((x0 + x1) / 2), px(y + 3)], [px(x1), px(y + 8)]], w, T(0.9));
    // birds on the right, flapping on twos
    const bird = (x, y, s, up) => { const w = up ? -7 : 3; U.poly(navy, [[x - 13 * s, y + w * s], [x - 3 * s, y - 2 * s], [x, y + 4 * s], [x + 3 * s, y - 2 * s], [x + 13 * s, y + w * s], [x + 2 * s, y + 2 * s], [x - 2 * s, y + 2 * s]], T(1)); };
    [[1062, 425, 1.2], [1022, 482, 0.9], [985, 548, 1.1], [936, 626, 1.2], [1070, 600, 1.3], [1110, 640, 1]].forEach(([x, y, s], i) => bird(px(x), px(y), s, (d + i) % 2 === 0));

    // silhouettes: navy flat over the yellow (a dark olive), a touch of blue and pink
    const sil = (fn) => { for (const [g, v] of [[navy, 0.92], [blueS, 0.35], [pinkS, 0.3]]) { g.save(); g.fillStyle = T(v); g.strokeStyle = T(v); fn(g); g.restore(); } };
    // the hedge line along the horizon and the bush on the right
    const hedge = [];
    { const rh = Motion.rng('svh'); for (let x = 0; x <= 1000; x += 12) hedge.push([x, px(806) + Math.sin(x / 23) * 4 + (rh() - 0.5) * 6 - (x > 850 ? (x - 850) * 0.05 : 0)]); }
    const hedgePoly = [...hedge, [1000, px(860)], [0, px(860)]];
    const bushPts = P([[940, 870], [932, 820], [950, 785], [990, 762], [1040, 758], [1080, 770], [1080, 875]]);
    sil((g) => {
        U.path(g, hedgePoly); g.fill();
        U.smooth(g, bushPts); g.fill();
        // cypresses: tall flames
        for (const [cx, top, w, bot] of [[85, 512, 44, 805], [142, 588, 30, 805]]) {
            const pts = [];
            for (let i = 0; i <= 12; i++) { const f = i / 12, y = top + (bot - top) * f, ww = w * Math.sin(Math.min(1, f * 1.6) * Math.PI * 0.5) * (1 - 0.15 * f) * (1 + 0.08 * Math.sin(i * 2.3)); pts.push([px(cx + ww), px(y)]); }
            for (let i = 12; i >= 0; i--) { const f = i / 12, y = top + (bot - top) * f, ww = w * Math.sin(Math.min(1, f * 1.6) * Math.PI * 0.5) * (1 - 0.15 * f) * (1 + 0.08 * Math.cos(i * 1.9)); pts.push([px(cx - ww), px(y)]); }
            U.smooth(g, pts); g.fill();
        }
        // the umbrella pine: a canopy of lobes, a trunk forking into branches
        g.lineCap = 'round';
        for (const [pts, w] of [[[[380, 830], [382, 760], [376, 705]], 16], [[[378, 740], [340, 715], [300, 690]], 7], [[[380, 735], [420, 705], [470, 700], [520, 690]], 7], [[[376, 705], [360, 660]], 8], [[[380, 715], [410, 670]], 7]]) {
            g.lineWidth = px(w); g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(px(x), px(y)) : g.moveTo(px(x), px(y)))); g.stroke();
        }
        for (const [x, y, rx, ry] of [[240, 655, 50, 38], [300, 610, 70, 50], [380, 580, 85, 58], [460, 575, 70, 50], [525, 610, 55, 40], [555, 680, 40, 30], [470, 640, 55, 35], [330, 660, 50, 30], [230, 610, 35, 25]]) {
            g.beginPath(); g.ellipse(px(x), px(y), px(rx), px(ry), 0, 0, 7); g.fill();
        }
    });
    // light lifts inside the canopy (the yellow shows through the lobes' gaps)
    for (const g of [navy]) { g.save(); g.globalCompositeOperation = 'destination-out'; g.fillStyle = T(0.7); for (const [x, y, rx, ry] of [[265, 690, 12, 5], [505, 660, 10, 5], [420, 690, 14, 4]]) { g.beginPath(); g.ellipse(px(x), px(y), px(rx), px(ry), 0, 0, 7); g.fill(); } g.restore(); }
    // grass sprigs by the bush
    for (let i = 0; i < 6; i++) U.stroke(blue, [[px(955 + i * 8), px(800)], [px(945 + i * 11), px(745 + (i % 3) * 10)]], 1.6, T(0.9));

    // the field: green (blue screen over the yellow) with furrows converging to (780, 870) px
    const field = [[0, px(855)], [1000, px(855)], [1000, 1000], [0, 1000]];
    U.clipped(blueS, field, (g) => { g.fillStyle = vramp(g, px(850), 1000, [[0, 0.35], [0.2, 0.5], [1, 0.6]]); g.fillRect(0, 0, 1000, 1000); });
    // the far band on the left: lighter dots
    U.clipped(blueS, [[0, px(850)], [px(560), px(862)], [0, px(905)]], (g) => { g.globalCompositeOperation = 'destination-out'; g.fillStyle = T(0.4); g.fillRect(0, 0, 1000, 1000); });
    const VP = [px(780), px(862)];
    U.clipped(blue, field, (g) => {
        for (let i = -40; i <= 40; i++) {
            const bx = VP[0] + i * 56, w0 = 0.2, w1 = 14 + Math.abs(i) * 0.4;
            g.fillStyle = T(0.8);
            g.beginPath(); g.moveTo(VP[0] + i * 0.4, VP[1]); g.lineTo(bx - w1, 1000); g.lineTo(bx + w1, 1000); g.lineTo(VP[0] + i * 0.4 + w0, VP[1]); g.fill();
        }
    });
    // the furrow crests: pale (the blue lifted, yellow shows)
    for (const g of [blueS, blue]) U.clipped(g, field, (h) => {
        h.globalCompositeOperation = 'destination-out';
        for (let i = -40; i <= 40; i++) { const bx = VP[0] + i * 56 + 28; h.fillStyle = T(0.8); h.beginPath(); h.moveTo(VP[0] + i * 0.4 + 0.2, VP[1]); h.lineTo(bx - 11, 1000); h.lineTo(bx + 11, 1000); h.fill(); }
    });
    // a darker dip where the field meets the hedge
    U.poly(navyS, [[0, px(850)], [1000, px(850)], [1000, px(875)], [0, px(875)]], T(0.25));
};
