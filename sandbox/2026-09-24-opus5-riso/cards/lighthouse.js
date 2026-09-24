// Card «lighthouse» (reference 5.58–6.0 s, full frame; opens in a circle at 5.08). Drawn on
// the riso plates in the reference's 1000 × 1000 units (1 unit = 1.08 px), measured on the
// 5.8 s frame. Global registry: CARDS.lighthouse(press, t) — t = seconds since it opened.
var CARDS = CARDS || {};
CARDS.lighthouse = (press, t) => {
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
    // concentric white arcs round the lantern (knocked out of every plate)
    press.knockout((g) => {
        for (const [rr, w] of [[270, 7], [420, 8], [575, 9]]) {
            g.lineWidth = w;
            g.beginPath();
            g.arc(480, 190, rr, -1.25, 0.95);
            g.stroke();
        }
    });
    // the beams: yellow screens fanning out of the lantern; they sweep round on twos
    const a0 = -0.18 + Math.floor(t * 12) / 12 * 0.9;
    const beam = (a, spread, len) => { const c = [480, 185]; poly(yellowS, [c, [c[0] + Math.cos(a - spread) * len, c[1] + Math.sin(a - spread) * len], [c[0] + Math.cos(a + spread) * len, c[1] + Math.sin(a + spread) * len]], T(0.75)); };
    beam(Math.PI + 0.25 + a0 * 0.3, 0.14, 700);
    beam(Math.PI - 0.55 + a0 * 0.3, 0.1, 800);
    beam(-0.28 + a0 * 0.3, 0.07, 700);
    // sea: navy with blue, white wave lines
    poly(navy, [[0, 845], [1000, 830], [1000, 1000], [0, 1000]], T(0.72));
    poly(blue, [[0, 845], [1000, 830], [1000, 1000], [0, 1000]], T(0.5));
    press.knockout((g) => {
        for (let i = 0; i < 9; i++) {
            const y = 870 + i * 16;
            R.line(g, [[0, y], [120, y - 6], [220, y + 3], [330, y - 4]].map(([x, yy]) => [x + (i % 2) * 40, yy]), 3.2, 'wave' + i);
            R.line(g, [[640, y + 4], [760, y - 5], [880, y + 2], [1000, y - 3]], 3.2, 'wavr' + i);
        }
    });
    // the rock: a dark overprint of navy, pink and yellow (brown), lit edges in yellow
    const rock = [[230, 1000], [300, 930], [380, 905], [420, 850], [600, 846], [640, 880], [700, 890], [780, 940], [830, 1000]];
    poly(navy, rock, T(0.85));
    poly(pinkS, rock, T(0.6));
    poly(yellow, rock, T(0.55));
    poly(yellow, [[420, 850], [600, 846], [606, 856], [424, 860]], T(1));

    // the tower: a trapezoid, pink bands, white bands shaded blue on the right
    const X = (y) => [430 - (y - 275) * 0.1, 545 + (y - 275) * 0.075]; // left/right edge at y
    const band = (y0, y1) => [[X(y0)[0], y0], [X(y0)[1], y0], [X(y1)[1], y1], [X(y1)[0], y1]];
    press.knockout((g) => { g.beginPath(); band(275, 850).forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.fill(); });
    for (const [y0, y1] of [[275, 400], [510, 625], [740, 850]]) {
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
    for (const [y0, y1] of [[400, 510], [625, 740]]) {
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
};
