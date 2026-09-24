// Card «planet» (reference 12.0–12.125 s, full frame): a striped ringed planet close up, red
// (pink + yellow) and pink bands curving round the sphere, a navy shadow to the lower left,
// yellow rings with paper grooves passing behind and in front, a blue sky with big navy dots.
// Measured on the 12.0 s frame in 1000 × 1000 units (ring ellipses fitted to scans). Needs
// cards/_g4-util.js.
var CARDS = CARDS || {};
CARDS.planet = (press, t) => {
    const U = G4, T = U.T;
    const Y = press.plate('yellow'), P = press.plate('pink'), B = press.plate('blue'), N = press.plate('navy');
    const YS = press.plate('yellow', 'screen'), PS = press.plate('pink', 'screen'), BS = press.plate('blue', 'screen'), NS = press.plate('navy', 'screen');
    const PX = 395, PY = 622, PR = 428;

    // sky: blue flat, a coarse navy dot screen, pink specks, white stars
    B.fillStyle = T(1); B.fillRect(0, 0, 1000, 1000);
    U.dots(N, [0, 0, 1000, 1000], 17, 0.45, (x, y) => 0.26 + 0.08 * Math.sin(x * 0.01 + y * 0.013), 1);
    U.specks(P, 'planetsky', 160, [0, 0, 1000, 1000], 1.4, 2.8);
    U.speckle(press, 'planetsky', 160, [0, 0, 1000, 1000], 0.8, 1.8);

    // the rings: bands between the inner and outer fitted ellipses (f = 0 inner … 1 outer)
    const IN = [380, 650, 608, 162, -0.28], OUT = [380, 650, 1098, 298, -0.28];
    const E = (f) => IN.map((v, i) => v + (OUT[i] - v) * f);
    const annulus = (g, f0, f1) => { const a = E(f0), b = E(f1); g.beginPath(); g.ellipse(b[0], b[1], b[2], b[3], b[4], 0, 7); g.ellipse(a[0], a[1], a[2], a[3], a[4], 7, 0, true); };
    const BANDS = [[0, 0.055], [0.12, 0.2], [0.25, 0.48], [0.53, 0.56], [0.59, 0.63], [0.77, 0.83], [0.86, 1]];
    const ring = () => {
        press.knockout((g) => { annulus(g, 0, 1); g.fill(); });
        for (const [f0, f1] of BANDS) { Y.fillStyle = T(1); annulus(Y, f0, f1); Y.fill(); }
        // fine lines in the grooves: navy and pink hairlines, a blue shadow at the inner edge
        for (const [f, g, w] of [[0.09, N, 1.4], [0.69, P, 3], [0.72, B, 1.4]]) {
            const e = E(f); g.lineWidth = w; g.strokeStyle = T(1); g.beginPath(); g.ellipse(e[0], e[1], e[2], e[3], e[4], 0, 7); g.stroke();
        }
        // grooves inside the bands (paper hairlines)
        press.knockout((g) => { for (const f of [0.34, 0.93]) { const e = E(f); g.lineWidth = 1.8; g.beginPath(); g.ellipse(e[0], e[1], e[2], e[3], e[4], 0, 7); g.stroke(); } });
    };
    ring();

    // the planet: knock the ring out behind it, pink all over, yellow bands (red) with soft
    // screened edges, a navy shadow to the lower left
    const disc = (g) => g.arc(PX, PY, PR, 0, 7);
    press.knockout((g) => { g.beginPath(); disc(g); g.fill(); });
    U.clip(P, disc, (c) => { c.fillStyle = T(1); c.fillRect(0, 0, 1000, 1000); });
    const lat = (x, y0) => y0 - 0.3 * (x - 400) - 0.0004 * (x - 400) * (x - 400);
    const band = (g, y0, y1) => { g.beginPath(); for (let x = -40; x <= 840; x += 40) g.lineTo(x, lat(x, y0)); for (let x = 840; x >= -40; x -= 40) g.lineTo(x, lat(x, y1)); g.closePath(); };
    U.clip(YS, disc, (c) => {
        c.filter = 'blur(9px)';
        c.fillStyle = T(1);
        for (const [y0, y1] of [[0, 335], [565, 680], [770, 1300]]) { band(c, y0, y1); c.fill(); }
        c.filter = 'none';
    });
    U.clip(NS, disc, (c) => { c.fillStyle = U.lin(c, 620, 280, 60, 900, [[0, 0], [0.5, 0], [0.75, 0.45], [1, 0.85]]); c.fillRect(0, 0, 1000, 1000); });
    U.clip(BS, disc, (c) => { c.fillStyle = U.lin(c, 620, 280, 60, 900, [[0, 0], [0.7, 0], [1, 0.6]]); c.fillRect(0, 0, 1000, 1000); });
    // dust on the planet
    press.save(); press.clip((g) => disc(g));
    U.speckle(press, 'planetdisc', 90, [0, 190, 830, 1000], 0.7, 1.6);
    press.restore();
    U.specks(Y, 'planetdisc', 25, [150, 250, 750, 700], 1.5, 3);

    // the front of the rings, over the planet: clipped below the rings' long axis
    const th = -0.28, cx = 380, cy = 650, ca = Math.cos(th), sa = Math.sin(th);
    press.save();
    press.clip((g) => { g.moveTo(cx - ca * 2000, cy - sa * 2000); g.lineTo(cx + ca * 2000, cy + sa * 2000); g.lineTo(cx + ca * 2000 - sa * 2000, cy + sa * 2000 + ca * 2000); g.lineTo(cx - ca * 2000 - sa * 2000, cy - sa * 2000 + ca * 2000); g.closePath(); });
    ring();
    press.restore();
};
