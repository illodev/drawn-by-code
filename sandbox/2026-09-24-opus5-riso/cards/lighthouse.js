// Card «lighthouse» (reference 5.58–6.0 s, full frame; opens in a circle at 5.08). Drawn on
// the riso plates in the reference's 1000 × 1000 units (1 unit = 1.08 px), measured on the
// 5.8 s frame. Global registry: CARDS.lighthouse(press, t) — t = seconds since it opened.
var CARDS = CARDS || {};
CARDS.lighthouse = (press, t, lf, o = {}) => {
    // the camera, measured on the sky's blue screen frame by frame (11.90 px on 133 → 12.05 on
    // 143): a push of 0.123 %/frame drifting right and up; the repeat is the print 6.24 %
    // bigger and turned +3° (12.72 px at 78° against 11.97 px at 75°), 2 px right, 10 down
    const d0 = Math.floor(t * 12 + 1e-6), f = lf != null ? 132 + lf : 132.5 + 2 * d0;
    const cam = o.ring ? [1.0624, 0.0524, 2, 10] : [1 + 0.00123 * (f - 138), 0, 0.4 * (f - 138), -0.55 * (f - 138)];
    press.save();
    press.each((g) => { g.translate(500 + cam[2] / 1.08, 500 + cam[3] / 1.08); g.rotate(cam[1]); g.scale(cam[0], cam[0]); g.translate(-500, -500); });
    const R = Riso, T = R.tone;
    const pink = press.plate('pink'), pinkS = press.plate('pink', 'screen');
    const blueS = press.plate('blue', 'screen'), blue = press.plate('blue');
    const navy = press.plate('navy'), navyS = press.plate('navy', 'screen');
    const yellow = press.plate('yellow'), yellowS = press.plate('yellow', 'screen');
    const poly = (g, pts, fill) => { g.fillStyle = fill; g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.fill(); };

    // sky: blue dots all over, pink rising towards the horizon, navy dots light
    blueS.fillStyle = R.ramp(blueS, 0, 0, 0, 850, 0.55, 0.4);
    blueS.fillRect(0, 0, 1000, 850);
    pinkS.fillStyle = R.ramp(pinkS, 0, 150, 0, 850, 0.08, 0.5);
    pinkS.fillRect(0, 0, 1000, 850);
    navyS.fillStyle = T(0.14);
    navyS.fillRect(0, 0, 1000, 850);
    // the white haze band on the left (a soft knock-out of the screens)
    for (const g of [blueS, pinkS, navyS]) {
        g.save();
        g.globalCompositeOperation = 'destination-out';
        const gr = g.createLinearGradient(0, 420, 0, 640);
        gr.addColorStop(0, 'rgba(0,0,0,0)');
        gr.addColorStop(0.45, 'rgba(0,0,0,0.85)');
        gr.addColorStop(1, 'rgba(0,0,0,0)');
        g.fillStyle = gr;
        g.beginPath();
        g.ellipse(160, 530, 470, 110, -0.03, 0, 7);
        g.fill();
        g.restore();
    }
    // the sound arcs: white ones round (500, 287) (a centre search over their pixels on the
    // 138 frame: radii 336, 431, 513, 687 px), and a blue one hugging the lantern
    press.knockout((g) => {
        for (const rr of [311, 399, 475, 636]) { g.lineWidth = 7.5; g.beginPath(); g.arc(500, 287, rr, -1.45, 1.55); g.stroke(); }
    });
    for (const [pl, v] of [[blue, 1], [navy, 0.45]]) { pl.save(); pl.strokeStyle = T(v); pl.lineWidth = 6.5; pl.beginPath(); pl.arc(486, 278, 159, -1.4, 1.9); pl.stroke(); pl.restore(); }
    // the haze: a streaky white band across the left (paper through the sky's screens)
    press.knockout((g) => {
        g.save(); g.filter = 'blur(10px)'; g.globalAlpha = 0.8; g.beginPath(); g.ellipse(170, 468, 330, 58, -0.02, 0, 7); g.fill(); g.restore();
        G1.marks(g, 'lhhaze', (c) => c.ellipse(210, 468, 420, 95, -0.02, 0, 7), [-220, 360, 640, 580], 2600, 2, 6, { stretch: 2.2, ang: 0.05, spread: 0.6, v0: 0.9, v1: 0.4 });
    });
    // the beams: yellow dots on paper (the sky knocked out under them), bright near the lamp
    const beams = [[[421, 155], [-12, 8], [-12, 155]], [[421, 211], [-12, 322], [-12, 416]], [[530, 165], [1012, 15], [1012, 104]]];
    for (const bm of beams) {
        press.knockout((g) => { g.beginPath(); bm.forEach(([x, y], k) => (k ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.fill(); });
        poly(yellowS, bm, T(0.85));
        poly(yellow, bm, T(0.35));
        press.knockout((g) => G1.marks(g, 'lhbeam' + bm[0][1], (c) => { bm.forEach(([x, y], k) => (k ? c.lineTo(x, y) : c.moveTo(x, y))); c.closePath(); }, [-20, 0, 1020, 430], 500, 1.5, 4, { stretch: 3, ang: Math.atan2(bm[1][1] - bm[0][1], bm[1][0] - bm[0][0]), spread: 0.2, v0: 0.8, v1: 0.3 }));
    }
    // sea: navy with blue from 833 (900 px), white wave squiggles, foam at the rock
    // (the sea is screened, not flat: navy dots on the sky's 11.97 px lattice, blue dots)
    navy.save(); navy.scale(1 / 1.08, 1 / 1.08);
    G1.dots(navy, G1.lattice(-4.69, 4.61, 11.5668, 3.0767, -3.0758, 11.5625), [-40, 895, 1120, 1120], 0.7, { ink: 'navy', seed: 51 });
    navy.restore();
    poly(blueS, [[-20, 833], [1020, 833], [1020, 1020], [-20, 1020]], T(0.75));
    press.knockout((g) => {
        const r = Motion.rng('lhwave');
        for (let i = 0; i < 40; i++) {
            const y = 842 + (i % 20) * 8.5 + r() * 5, x0 = i < 20 ? -20 + r() * 80 : 560 + r() * 100, len = 300 + r() * 160, pts = [];
            for (let k = 0; k <= 12; k++) pts.push([x0 + (k / 12) * len, y + Math.sin(k * 1.6 + i) * 3.5]);
            R.line(g, pts, 2.8, 'lhw' + i);
        }
        // foam: white flicks thrown up against the rock
        for (const [x, y, n, dir] of [[230, 900, 9, -1], [880, 900, 12, 1], [960, 960, 9, 1]]) {
            for (let k = 0; k < n; k++) { const a = -Math.PI / 2 + dir * (0.2 + k * 0.12), l = 30 + r() * 50; G1.taper(g, [[x + k * 5 * dir, y + 40], [x + Math.cos(a) * l * 0.5 + k * 5 * dir, y + 40 + Math.sin(a) * l * 0.5], [x + Math.cos(a) * l + k * 5 * dir, y + 40 + Math.sin(a) * l]], 5, 1); }
        }
    });
    // the rock: stepped, a dark overprint (navy, pink, yellow) with its top faces lit yellow
    const rock = [[195, 1010], [260, 960], [308, 910], [370, 895], [372, 854], [592, 852], [658, 885], [720, 893], [761, 931], [813, 942], [854, 1010]];
    press.knockout((g) => { g.beginPath(); rock.forEach(([x, y], k) => (k ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.fill(); });
    poly(navy, rock, T(0.85));
    poly(pinkS, rock, T(0.6));
    poly(yellow, rock, T(0.55));
    for (const edge of [[[372, 854], [592, 852], [594, 860], [374, 862]], [[308, 910], [370, 895], [372, 902], [310, 917]], [[658, 885], [720, 893], [720, 900], [658, 892]], [[761, 931], [813, 942], [813, 949], [761, 938]]]) {
        press.knockout((g) => { g.beginPath(); edge.forEach(([x, y], k) => (k ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.fill(); });
        poly(yellow, edge, T(1));
    }

    // the tower: a trapezoid, pink bands, white bands shaded blue on the right
    const X = (y) => [430 - (y - 275) * 0.1, 545 + (y - 275) * 0.075]; // left/right edge at y
    const band = (y0, y1) => [[X(y0)[0], y0], [X(y0)[1], y0], [X(y1)[1], y1], [X(y1)[0], y1]];
    press.knockout((g) => { g.beginPath(); band(275, 850).forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.fill(); });
    // band edges measured on a column at 520 px (138 frame): 439, 563, 691, 812 px
    for (const [y0, y1] of [[275, 406], [521, 640], [752, 850]]) {
        poly(pink, band(y0, y1), T(1));
        // shade on the right: navy screen ramping in
        const b = band(y0, y1);
        navyS.save();
        navyS.beginPath();
        b.forEach(([x, y], i) => (i ? navyS.lineTo(x, y) : navyS.moveTo(x, y)));
        navyS.closePath();
        navyS.clip();
        navyS.fillStyle = R.ramp(navyS, X(y0)[0] + 40, 0, X(y0)[1], 0, 0, 0.75);
        navyS.fillRect(300, y0, 400, y1 - y0);
        navyS.restore();
        // the highlight: a white sliver on the left of each pink band
        press.knockout((g) => { g.beginPath(); g.ellipse(X(y0)[0] + 22, (y0 + y1) / 2, 7, (y1 - y0) * 0.42, 0.02, 0, 7); g.fill(); });
    }
    for (const [y0, y1] of [[406, 521], [640, 752]]) {
        const b = band(y0, y1);
        blueS.save();
        blueS.beginPath();
        b.forEach(([x, y], i) => (i ? blueS.lineTo(x, y) : blueS.moveTo(x, y)));
        blueS.closePath();
        blueS.clip();
        blueS.fillStyle = R.ramp(blueS, X(y0)[0] + 30, 0, X(y0)[1], 0, 0, 0.8);
        blueS.fillRect(300, y0, 400, y1 - y0);
        blueS.restore();
        poly(yellowS, [b[0], [(b[0][0] + b[1][0]) / 2, b[1][1]], [(b[3][0] + b[2][0]) / 2, b[2][1]], b[3]], T(0.18));
    }
    // windows and the door: navy
    poly(navy, [[490, 425], [500, 412], [510, 425], [510, 445], [490, 445]], T(1));
    navy.fillStyle = T(1);
    navy.beginPath(); navy.arc(503, 498, 15, 0, 7); navy.fill();
    blue.lineWidth = 4; blue.strokeStyle = T(1); blue.beginPath(); blue.arc(500, 500, 17, 0, 7); blue.stroke();
    poly(navy, [[490, 602], [500, 592], [510, 602], [510, 618], [490, 618]], T(1));
    navy.beginPath(); navy.moveTo(456, 850); navy.lineTo(456, 815); navy.arc(476, 815, 20, Math.PI, 0); navy.lineTo(496, 850); navy.fill();
    // the gallery, the lantern and the dome
    poly(navy, [[378, 250], [578, 250], [572, 278], [384, 278]], T(1));
    press.knockout((g) => g.fillRect(422, 140, 108, 80));
    poly(yellow, [[422, 140], [530, 140], [530, 220], [422, 220]], T(1));
    poly(navy, [[422, 140], [530, 140], [530, 220], [422, 220]], T(0));
    navy.fillStyle = T(1);
    for (const x of [450, 500]) navy.fillRect(x - 2, 142, 4, 76);
    press.knockout((g) => { g.beginPath(); g.ellipse(476, 180, 17, 20, 0, 0, 7); g.fill(); });
    navy.beginPath(); navy.moveTo(412, 140); navy.bezierCurveTo(412, 70, 540, 70, 540, 140); navy.fill();
    navy.fillRect(472, 45, 6, 30);
    navy.beginPath(); navy.arc(475, 60, 7, 0, 7); navy.fill();
    blueS.fillStyle = T(0.35);
    blueS.beginPath(); blueS.moveTo(412, 140); blueS.bezierCurveTo(412, 70, 540, 70, 540, 140); blueS.fill();
    press.restore();
    // regional tone: calibrated against the reference as a grid (private/lighthouse-data.js,
    // gitignored: read off the video, never committed); absent, the drawing's own tones stand
    G1.frame(press, () => G1.tones(press, (typeof G1DATA !== 'undefined' && G1DATA.lighthouse || {})[o.ring ? 'again' : 'first']));
};
