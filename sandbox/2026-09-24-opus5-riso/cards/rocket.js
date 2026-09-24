// Card «rocket» (reference 11.5–11.75 s, full frame; re-inked pink and mirrored at 23.5 s):
// a rocket lifting off beside a launch tower, flame, billows of cloud lit orange from below,
// a blue screened sky. Measured on the 11.6 s frame in 1000 × 1000 units. The flame flickers
// on twos. Needs cards/_g4-util.js.
var CARDS = CARDS || {};
CARDS.rocket = (press, t) => {
    const U = G4, T = U.T, d = Math.floor(t * 12 + 1e-6);
    const Y = press.plate('yellow'), P = press.plate('pink'), B = press.plate('blue'), N = press.plate('navy');
    const YS = press.plate('yellow', 'screen'), PS = press.plate('pink', 'screen'), BS = press.plate('blue', 'screen'), NS = press.plate('navy', 'screen');

    // sky: blue screen, lighter in soft diagonal streaks; the exhaust glow turns it orange
    BS.fillStyle = U.lin(BS, 0, 0, 0, 700, [[0, 0.62], [0.5, 0.55], [1, 0.42]]);
    BS.fillRect(0, 0, 1000, 1000);
    U.erase([BS], (g) => {
        g.fillStyle = U.rad(g, 410, 600, 60, 330, [[0, 0.75], [0.55, 0.45], [1, 0]]);
        g.fillRect(0, 250, 1000, 750);
        for (const [x, w] of [[120, 60], [330, 40], [760, 70], [900, 40]]) {
            g.fillStyle = U.lin(g, x - w, 0, x + w, 0, [[0, 0], [0.5, 0.35], [1, 0]]);
            g.save(); g.transform(1, 0, -0.35, 1, 0, 0); g.fillRect(x - w, 0, 2 * w, 500); g.restore();
        }
    });
    YS.fillStyle = U.rad(YS, 410, 620, 30, 320, [[0, 0.6], [0.6, 0.3], [1, 0]]);
    YS.fillRect(0, 250, 1000, 750);
    PS.fillStyle = U.rad(PS, 410, 620, 30, 330, [[0, 0.45], [0.6, 0.22], [1, 0]]);
    PS.fillRect(0, 250, 1000, 750);
    U.speckle(press, 'rocketsky', 260, [0, 0, 1000, 620], 0.8, 2);

    // the launch tower: navy with a pink screen (purple), a lattice of two legs and X braces
    const tw = (pts, w) => { U.seg(N, pts, w, 0.9); U.seg(P, pts, w * 0.7, 0.45); U.seg(PS, pts, w + 2.5, 0.7); };
    tw([[595, 110], [595, 605]], 7.5); tw([[665, 110], [665, 585]], 7);
    for (let y = 125; y < 570; y += 45) {
        tw([[595, y], [665, y]], 3.2);
        tw([[597, y], [663, y + 45]], 2.6); tw([[663, y], [597, y + 45]], 2.6);
    }
    tw([[548, 113], [792, 110]], 7);
    tw([[548, 113], [628, 60], [792, 110]], 2.4); tw([[628, 60], [628, 113]], 3);
    tw([[773, 112], [773, 205]], 2); U.poly(N, [[762, 203], [788, 203], [788, 220], [762, 220]], 1);
    U.poly(N, [[520, 202], [595, 198], [595, 212], [530, 209]], 1); tw([[540, 209], [595, 232]], 2.5);
    for (const [y0, y1] of [[292, 240], [378, 345], [498, 460]]) {
        U.poly(N, [[665, y0 - 6], [765, y1 - 2], [765, y1 + 2], [665, y0 + 7]], 1);
        U.poly(PS, [[665, y0 - 8], [767, y1 - 4], [767, y1 + 4], [665, y0 + 9]], 0.55);
        tw([[668, y0 + 25], [720, (y0 + y1) / 2 + 3]], 2.2);
    }

    // the flame: red (pink + yellow) ragged outer, yellow inner, a white core; flickers on twos
    const fr = Motion.rng('flame' + (d % 4));
    const side = (x0, x1, y0, y1, amp, n) => { const L = [], R = []; for (let i = 0; i <= n; i++) { const y = y0 + ((y1 - y0) * i) / n, taper = 1 - 0.25 * (i / n); L.push([x0 + (1 - taper) * 30 + (fr() - 0.5) * amp, y]); R.push([x1 - (1 - taper) * 30 + (fr() - 0.5) * amp, y]); } return L.concat(R.reverse()); };
    const outerF = side(350, 470, 488, 770, 16, 14), innerF = side(372, 452, 492, 760, 8, 12);
    press.knockout((g) => { U.path(g, outerF); g.fill(); });
    U.poly(P, outerF, 1); U.poly(Y, outerF, 1);
    U.poly(PS, outerF, 0);
    press.knockout((g) => { U.path(g, innerF); g.fill(); });
    U.poly(Y, innerF, 1);
    press.knockout((g) => { g.beginPath(); g.moveTo(400, 492); g.lineTo(421, 492); g.lineTo(416, 745); g.lineTo(408, 748); g.closePath(); g.fill(); g.fillRect(438, 500, 4, 200); });

    // the rocket: paper white body, blue screen shade on the right, pink nose, bands, fins
    const body = [[373, 100], [448, 100], [452, 200], [454, 455], [370, 455], [370, 200]];
    const nose = (g) => { g.moveTo(373, 101); g.bezierCurveTo(376, 60, 395, 36, 410, 27); g.bezierCurveTo(425, 36, 444, 60, 448, 101); g.closePath(); };
    press.knockout((g) => { U.path(g, body); g.fill(); g.beginPath(); nose(g); g.fill(); });
    U.clip(BS, (g) => U.path(g, body), (c) => { c.fillStyle = U.lin(c, 408, 0, 452, 0, [[0, 0], [0.35, 0.25], [1, 0.72]]); c.fillRect(360, 90, 100, 370); });
    P.fillStyle = T(1); P.beginPath(); nose(P); P.fill();
    U.clip(PS, (g) => nose(g), (c) => { c.fillStyle = U.lin(c, 405, 0, 450, 0, [[0, 0], [1, 0.6]]); c.fillRect(360, 20, 100, 90); });
    U.clip(NS, (g) => nose(g), (c) => { c.fillStyle = U.lin(c, 420, 0, 450, 0, [[0, 0], [1, 0.35]]); c.fillRect(360, 20, 100, 90); });
    B.lineWidth = 3.2; B.strokeStyle = T(1); B.beginPath(); B.arc(411, 168, 6.5, 0, 7); B.stroke();
    U.poly(P, [[366, 212], [379, 212], [379, 232], [366, 232]], 1);
    U.poly(P, [[387, 212], [455, 212], [455, 232], [387, 232]], 1);
    U.poly(B, [[368, 284], [381, 284], [381, 300], [368, 300]], 1);
    U.poly(B, [[389, 284], [410, 284], [410, 300], [389, 300]], 1);
    U.poly(B, [[413, 296], [456, 296], [456, 312], [413, 312]], 1);
    U.poly(P, [[366, 318], [379, 318], [379, 345], [366, 345]], 1);
    U.poly(P, [[387, 318], [456, 318], [456, 345], [387, 345]], 1);
    U.poly(N, [[413, 318], [456, 318], [456, 332], [413, 332]], 0.8);
    // fins: navy, pink screen (purple), a lighter pink edge
    for (const f of [[[373, 352], [345, 400], [322, 472], [373, 442]], [[448, 352], [480, 400], [500, 474], [448, 442]]]) {
        U.poly(N, f, 1); U.poly(PS, f, 0.35);
    }
    // the nozzle: black (navy + yellow)
    for (const g of [N, Y]) U.poly(g, [[380, 455], [441, 455], [446, 484], [375, 484]], 1);

    // billows of cloud, back to front: paper, warm screens near the flame, blue shade below,
    // blue outlines
    const billows = [
        [960, 540, 125], [60, 590, 100], [900, 690, 110], [120, 690, 110], [640, 700, 90], [30, 760, 90], [790, 745, 95],
        [310, 760, 90], [520, 765, 72], [200, 790, 80], [310, 900, 120], [450, 890, 110], [650, 870, 100], [830, 920, 110],
        [90, 960, 130], [985, 950, 110], [510, 1035, 130], [740, 1045, 120], [280, 1045, 120],
    ];
    const lob = (cx, cy, r) => { const pts = [], rr = Motion.rng('bl' + cx + cy); for (let i = 0; i < 9; i++) { const a = Math.PI + (i / 8) * Math.PI, k = 0.82 + 0.3 * rr(); pts.push([cx + Math.cos(a) * r * k, cy - 50 + Math.sin(a) * r * 0.85 * k]); } pts.push([cx + r, cy + r * 0.9], [cx - r, cy + r * 0.9]); return pts; };
    for (const [cx, cy, r] of billows) {
        const pts = lob(cx, cy, r), shape = (g) => U.smooth(g, pts, true, false);
        press.knockout((g) => { U.smooth(g, pts, true); g.fill(); });
        const warm = Math.min(1, Math.max(0, 1.15 - Math.hypot(cx - 420, (cy - 850) * 1.1) / 480));
        U.clip(YS, shape, (c) => { c.fillStyle = U.rad(c, cx, cy + r * 0.3, 0, r * 1.1, [[0, 0.12 + 0.8 * warm], [1, 0.03 + 0.45 * warm]]); c.fillRect(cx - r - 20, cy - r - 80, 2 * r + 40, 2 * r + 120); });
        U.clip(PS, shape, (c) => { c.fillStyle = U.rad(c, cx, cy + r * 0.4, 0, r * 1.1, [[0, 0.62 * warm * warm], [1, 0.08 * warm]]); c.fillRect(cx - r - 20, cy - r - 80, 2 * r + 40, 2 * r + 120); });
        U.clip(BS, shape, (c) => { c.fillStyle = U.lin(c, cx + r * 0.3, cy - r * 0.6, cx - r * 0.5, cy + r * 0.5, [[0, 0], [0.5, 0], [1, 0.62 * (1 - warm)]]); c.fillRect(cx - r - 20, cy - r - 80, 2 * r + 40, 2 * r + 120); });
        B.save(); B.strokeStyle = T(1); B.lineWidth = 3; B.lineJoin = 'round'; U.smooth(B, pts.slice(0, 9), false); B.stroke();
        // a fold line inside the billow
        U.sline(B, [[cx - r * 0.55, cy - 50 - r * 0.05], [cx - r * 0.35, cy - 50 + r * 0.25], [cx - r * 0.3, cy - 50 + r * 0.5]], 2.4, 1);
        B.restore();
    }
    // smoke streaks in the upper right
    for (const pts of [[[905, 335], [915, 400], [925, 470]], [[955, 360], [965, 430], [960, 480]], [[870, 330], [880, 380]]]) U.sline(B, pts, 3, 1);
};
