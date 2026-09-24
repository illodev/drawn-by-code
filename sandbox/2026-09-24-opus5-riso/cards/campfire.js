// Card «campfire» (reference ≈ 12.96–13.08 s, full frame). A campfire in a dark forest:
// purple trunks (navy + pink flat) with dotted green gaps (blue, yellow, navy screens) and
// a red glow at their feet; a clearing lit yellow round the fire fading into green dots;
// flames in three plates (red-orange outer = pink + yellow, yellow inner, a white core); navy
// logs with pink edges and white embers, navy stones; yellow sparks rising in a column.
// Authored in reference pixels (1080 frame) through G5.px. CARDS.campfire(press, t).
var CARDS = CARDS || {};
CARDS.campfire = (press, t) => {
    const R = Riso, T = R.tone, U = G5;
    const d = Math.floor(t * 12 + 1e-6);
    const P = (ink, k) => press.plate(ink, k);
    const pink = P('pink'), pinkS = P('pink', 'screen'), yel = P('yellow'), yelS = P('yellow', 'screen');
    const blue = P('blue'), blueS = P('blue', 'screen'), navy = P('navy'), navyS = P('navy', 'screen');
    const all = [pink, pinkS, yel, yelS, blue, blueS, navy, navyS];
    const eraseIn = (plates, fn) => { for (const g of plates) { g.save(); g.globalCompositeOperation = 'destination-out'; g.fillStyle = '#000'; g.strokeStyle = '#000'; g.beginPath(); fn(g); g.restore(); } };
    const ellP = (x, y, rx, ry, rot = 0) => { const p = []; for (let i = 0; i < 24; i++) { const a = i / 24 * Math.PI * 2; p.push([x + Math.cos(a) * rx * Math.cos(rot) - Math.sin(a) * ry * Math.sin(rot), y + Math.cos(a) * rx * Math.sin(rot) + Math.sin(a) * ry * Math.cos(rot)]); } return p; };

    U.px(press, () => {
        // the forest behind: dotted green-navy (blue, yellow, navy screens) everywhere
        blueS.fillStyle = T(0.6); blueS.fillRect(0, 0, 1080, 1080);
        yelS.fillStyle = R.ramp(yelS, 0, 250, 0, 760, 0.05, 0.5); yelS.fillRect(0, 0, 1080, 1080);
        navyS.fillStyle = R.ramp(navyS, 0, 0, 0, 760, 0.5, 0.2); navyS.fillRect(0, 0, 1080, 780);
        pinkS.fillStyle = R.ramp(pinkS, 0, 0, 0, 760, 0.3, 0.1); pinkS.fillRect(0, 0, 1080, 780);
        navy.fillStyle = T(0.45); navy.fillRect(0, 0, 1080, 780);
        // trunks: purple columns (navy + pink flat), each a little different
        const trunks = [[-10, 105, 0.9], [165, 245, 0.8], [262, 332, 0.95], [372, 430, 0.85], [612, 690, 0.9], [706, 762, 0.8], [850, 975, 0.9], [995, 1090, 0.85]];
        const rt = Motion.rng('cf-tr');
        for (const [a, b, v] of trunks) {
            const w0 = rt() * 10 - 5, foot = 730 + rt() * 50;
            const ph = rt() * 6, L = [], Rr = [];
            for (let y = -10; y <= foot; y += 40) { const u = (y + 10) / (foot + 10), wob = Math.sin(y / 85 + ph) * 4; L.push([a + w0 * (1 - u) - u * u * 14 + wob, y]); Rr.push([b + w0 * (1 - u) + u * u * 14 + wob * 0.6, y]); }
            const tr = [...L, [a - 16, foot], [b + 16, foot], ...Rr.reverse()];
            eraseIn([blueS, yelS, navyS, pinkS], (g) => U.trace(g, tr) || g.fill());
            const purple = rt() < 0.5;
            U.fill(navy, tr, T(purple ? v * 0.7 : v));
            U.fill(pink, tr, T(purple ? 0.45 : 0.14));
            U.fill(blueS, tr, T(purple ? 0 : 0.3));
            // bark shading: a darker band down one side, a pink-dot glow near the foot
            U.fill(navy, [[a + w0 + (b - a) * 0.55, -10], [b + w0, -10], [b + 6, foot], [a - 6 + (b - a) * 0.6, foot]], T(0.3));
            const side = (a + b) / 2 < 540 ? b : a;
            U.clipped(pinkS, tr, false, (g) => { g.fillStyle = R.ramp(g, 0, foot - 300, 0, foot, 0, 0.8); g.fillRect(side === b ? (a + b) / 2 : a - 20, 0, (b - a) / 2 + 20, 1080); });
            U.clipped(yelS, tr, false, (g) => { g.fillStyle = R.ramp(g, 0, foot - 160, 0, foot, 0, 0.5); g.fillRect(0, 0, 1080, 1080); });
            U.clipped(pink, tr, false, (g) => U.speckle(g, 'cf-bk' + a, 40, a, 0, b, foot, 0.8, 1.8, T(1)));
        }
        // the clearing: yellow round the fire, green dots (blue on yellow) outward, navy dots at the rim
        const gl = [];
        for (let x = -10; x <= 1090; x += 30) gl.push([x, 735 + 25 * (x / 1080) + 6 * Math.sin(x / 60)]);
        const ground = [...gl, [1090, 1090], [-10, 1090]];
        eraseIn(all, (g) => U.trace(g, ground) || g.fill());
        U.fill(yel, ground, T(0.9));
        U.clipped(blueS, ground, false, (g) => { g.save(); g.translate(540, 880); g.scale(1, 0.42); const gr = g.createRadialGradient(0, 0, 0, 0, 0, 620); gr.addColorStop(0, T(0)); gr.addColorStop(0.25, T(0.02)); gr.addColorStop(0.45, T(0.5)); gr.addColorStop(0.7, T(0.7)); gr.addColorStop(1, T(0.75)); g.fillStyle = gr; g.fillRect(-1200, -2400, 2400, 4800); g.restore(); });
        U.clipped(navyS, ground, false, (g) => { g.save(); g.translate(540, 880); g.scale(1, 0.42); const gr = g.createRadialGradient(0, 0, 0, 0, 0, 620); gr.addColorStop(0, T(0)); gr.addColorStop(0.4, T(0)); gr.addColorStop(0.7, T(0.45)); gr.addColorStop(1, T(0.7)); g.fillStyle = gr; g.fillRect(-1200, -2400, 2400, 4800); g.restore(); });
        // grass tufts at the bottom edge: navy strokes
        const rg = Motion.rng('cf-gr');
        for (let k = 0; k < 60; k++) { const x = rg() * 1080, y = 1040 + rg() * 45; U.stroke(navyS, [[x, y], [x + rg() * 10 - 5, y - 20 - rg() * 20]], 3, T(0.8)); }

        // the flames: outer red-orange, inner yellow, a white core; they flicker on twos
        const f = d % 3;
        const sway = [0, 8, -6][f], tip = [0, -18, 10][f];
        const outer = [[330, 800], [320, 720], [335, 650], [360, 690], [370, 640], [405, 525 + tip * 0.4], [430, 600], [470, 500], [510, 420 + tip], [525, 480], [560, 400], [598, 318 + tip], [640, 420], [640, 505], [690, 555 + tip * 0.5], [700, 620], [740, 675], [735, 740], [760, 800]].map(([x, y]) => [x + sway * (800 - y) / 480, y]);
        eraseIn(all, (g) => U.smooth(g, outer) || g.fill());
        U.fill(pink, outer, T(0.9), true);
        U.fill(yel, outer, T(1), true);
        const inner = [[380, 800], [378, 700], [395, 610], [420, 660], [450, 560], [470, 600], [492, 530 + tip * 0.6], [530, 590], [560, 470 + tip], [590, 560], [600, 620], [640, 585 + tip * 0.4], [660, 660], [650, 740], [700, 800]].map(([x, y]) => [x + sway * (800 - y) / 480, y]);
        eraseIn([pink], (g) => U.smooth(g, inner) || g.fill());
        // the orange tongues licking inside the yellow (pink strokes back in)
        U.stroke(pink, [[455, 780], [450, 700], [470, 640]].map(([x, y]) => [x + sway * (800 - y) / 480, y]), 12, T(0.9), true);
        U.stroke(pink, [[610, 780], [615, 700], [600, 650]].map(([x, y]) => [x + sway * (800 - y) / 480, y]), 12, T(0.9), true);
        const core = [[505, 790], [500, 720], [510, 660], [528, 610 + tip * 0.3], [530, 690], [525, 790]].map(([x, y]) => [x + sway * (800 - y) / 480, y]);
        eraseIn(all, (g) => U.smooth(g, core) || g.fill());

        // logs: thick navy rods crossing in a pile, a pink lit edge on top, ends as ovals
        const log = (x0, y0, x1, y1, w, endL, endR) => {
            const L = Math.hypot(x1 - x0, y1 - y0), nx = (y1 - y0) / L, ny = -(x1 - x0) / L; // normal pointing up
            const q = [[x0 + nx * w / 2, y0 + ny * w / 2], [x1 + nx * w / 2, y1 + ny * w / 2], [x1 - nx * w / 2, y1 - ny * w / 2], [x0 - nx * w / 2, y0 - ny * w / 2]];
            eraseIn(all, (g) => U.trace(g, q) || g.fill());
            U.fill(navy, q, T(1));
            // the lit top edge and a crack line along the log
            const edge = [[x0 + nx * (w / 2 - 5), y0 + ny * (w / 2 - 5)], [x1 + nx * (w / 2 - 5), y1 + ny * (w / 2 - 5)]];
            U.erase([navy], edge, 5, false); U.stroke(pink, edge, 5, T(1));
            U.stroke(pink, [[x0 + (x1 - x0) * 0.2 - nx * 4, y0 + (y1 - y0) * 0.2 - ny * 4], [x0 + (x1 - x0) * 0.6 - nx * 2, y0 + (y1 - y0) * 0.6 - ny * 2]], 2, T(0.8));
            for (const [on, x, y] of [[endL, x0, y0], [endR, x1, y1]]) {
                if (!on) continue;
                const e = ellP(x, y, w * 0.34, w * 0.52, Math.atan2(y1 - y0, x1 - x0));
                eraseIn(all, (g) => U.trace(g, e) || g.fill());
                U.fill(navy, e, T(1));
                U.stroke(pink, e.slice(10, 22), 3, T(1));
            }
        };
        log(238, 842, 560, 772, 46, true, false);
        log(505, 776, 792, 856, 46, false, true);
        log(262, 878, 548, 818, 44, true, false);
        log(470, 835, 800, 893, 44, false, true);
        log(300, 890, 520, 858, 40, true, false);
        // the end grain on the right log end: yellow rings
        yel.strokeStyle = T(0.8); yel.lineWidth = 1.5;
        for (const r of [6, 12, 17]) { yel.beginPath(); yel.ellipse(800, 893, r * 0.7, r, -0.5, 0, 7); yel.stroke(); }
        // embers: small white knockouts on the logs, pink hot points
        const re = Motion.rng('cf-emb' + (d % 2));
        eraseIn(all, (g) => { for (let k = 0; k < 26; k++) { const x = 330 + re() * 320, y = 805 + re() * 60, r = 2 + re() * 3; g.moveTo(x + r, y); g.arc(x, y, r, 0, 7); } g.fill(); });
        U.speckle(pink, 'cf-hot', 14, 340, 800, 650, 870, 2, 3, T(1));
        // stones round the fire
        for (const [x, y, rx, ry] of [[392, 924, 40, 24], [508, 944, 42, 22], [632, 940, 40, 24], [735, 920, 34, 20]]) {
            const e = ellP(x, y, rx, ry);
            eraseIn(all, (g) => U.trace(g, e) || g.fill());
            U.fill(navy, e, T(0.95));
            U.stroke(pink, e.slice(12, 22), 2.5, T(0.8));
        }

        // sparks: short yellow-orange dashes rising in a column above the fire (rise on twos)
        const rs = Motion.rng('cf-sp');
        for (let k = 0; k < 95; k++) {
            const h = rs(), y0 = 460 - h * 450 - d * 14, y = ((y0 % 470) + 470) % 470 + 10;
            const x = 520 + (rs() - 0.5) * (80 + (470 - y) * 0.45) + Math.sin(y / 70) * 25;
            const a = -1.3 + (rs() - 0.5) * 0.9, l = 5 + rs() * 7;
            const pts = [[x, y], [x + Math.cos(a) * l, y + Math.sin(a) * l]];
            U.erase([navy, navyS, blueS], pts, 5, false);
            U.stroke(yel, pts, 3.2, T(1));
            if (rs() < 0.5) U.stroke(pink, pts, 2.2, T(0.7));
        }
    });
};
