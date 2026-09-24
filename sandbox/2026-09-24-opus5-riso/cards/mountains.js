// Card «mountains» (reference 13.5–13.625 s, full frame). Layered ranges at sunset: a pink
// sky going yellow round a white sun with thin yellow rings, two birds, four ranges from
// lilac to navy that mist out towards their feet (screens ramping), pine lines, a dark front
// forest. Measured on the 13.5 s frame (px / 1.08 = units). Needs cards/_g6-util.js.
var CARDS = CARDS || {};
CARDS.mountains = (press, t) => {
    const R = Riso, T = R.tone, U = G6;
    const pinkS = press.plate('pink', 'screen');
    const blueS = press.plate('blue', 'screen'), blue = press.plate('blue');
    const navyS = press.plate('navy', 'screen'), navy = press.plate('navy');
    const yellowS = press.plate('yellow', 'screen'), yellow = press.plate('yellow');
    const d = Math.floor(t * 12 + 1e-6);
    const SUN = [602, 369];
    // px → units for measured ridge tables
    const u = (pts) => pts.map(([x, y]) => [x / 1.08, y / 1.08]);
    // a ridge table densified with a little jag (hand-cut edge)
    const edge = (pts, seed, jag = 5) => {
        const r = Motion.rng('mt' + seed), out = [];
        for (let i = 0; i < pts.length - 1; i++) {
            const [x0, y0] = pts[i], [x1, y1] = pts[i + 1], n = Math.max(1, Math.round(Math.hypot(x1 - x0, y1 - y0) / 9));
            for (let k = 0; k < n; k++) { const f = k / n; out.push([x0 + (x1 - x0) * f, y0 + (y1 - y0) * f + (k ? (r() - 0.5) * jag : 0)]); }
        }
        out.push(pts[pts.length - 1]);
        return out;
    };
    const vramp = (g, y0, y1, stops) => { const gr = g.createLinearGradient(0, y0, 0, y1); stops.forEach(([f, v]) => gr.addColorStop(f, T(v))); return gr; };

    // sky: pink screen dense at the top, thinning to nothing round the sun; yellow rising
    // from a pale top to a flat glow round the sun
    pinkS.fillStyle = vramp(pinkS, 0, 560, [[0, 0.7], [0.35, 0.5], [0.7, 0.25], [1, 0.1]]);
    pinkS.fillRect(0, 0, 1000, 560);
    yellowS.fillStyle = vramp(yellowS, 0, 560, [[0, 0.08], [0.35, 0.3], [1, 0.7]]);
    yellowS.fillRect(0, 0, 1000, 560);
    // the glow round the sun lifts the pink and floods yellow
    pinkS.save(); pinkS.globalCompositeOperation = 'destination-out';
    pinkS.fillStyle = R.radial(pinkS, SUN[0], SUN[1], 60, 330, 0.95, 0); pinkS.beginPath(); pinkS.arc(SUN[0], SUN[1], 330, 0, 7); pinkS.fill(); pinkS.restore();
    yellowS.fillStyle = R.radial(yellowS, SUN[0], SUN[1], 70, 380, 1, 0); yellowS.beginPath(); yellowS.arc(SUN[0], SUN[1], 380, 0, 7); yellowS.fill();
    yellow.fillStyle = R.radial(yellow, SUN[0], SUN[1], 70, 200, 0.9, 0); yellow.beginPath(); yellow.arc(SUN[0], SUN[1], 200, 0, 7); yellow.fill();
    // the sun rings: thin yellow lines, a little wobbly, the upper part only
    for (const [rr, w] of [[100, 3], [160, 3], [230, 2.8], [322, 2.6]]) {
        pinkS.save(); pinkS.globalCompositeOperation = 'destination-out';
        R.ring(pinkS, SUN[0], SUN[1], rr, w * 1.8, 'sr' + rr, { a0: Math.PI * 1.02, p: 0.5, wobble: 0.006 });
        pinkS.restore();
        R.ring(yellow, SUN[0], SUN[1], rr, w, 'sr' + rr, { color: T(0.85), a0: Math.PI * 1.02, p: 0.5, wobble: 0.006 });
    }
    // birds (navy, flapping on twos)
    const bird = (x, y, s, up) => U.stroke(navy, [[x - 16 * s, y - (up ? 6 : -2) * s], [x - 6 * s, y - 5 * s], [x, y + 2 * s], [x + 6 * s, y - 5 * s], [x + 18 * s, y - (up ? 9 : -1) * s]], 2.6 * s);
    bird(273, 185, 1.25, d % 2 === 0);
    bird(338, 232, 0.8, d % 2 === 1);
    // the sun: paper, knocked out of every plate
    press.knockout((g) => { g.beginPath(); g.arc(SUN[0], SUN[1], 73, 0, 7); g.fill(); });

    // range 1 (far): lilac (pink + a little navy), rim of light, fading to yellow lower down
    const r1 = edge(u([[0, 395], [45, 378], [95, 402], [170, 392], [250, 418], [330, 402], [392, 392], [440, 414], [500, 430], [570, 446], [615, 432], [648, 424], [668, 438], [700, 442], [765, 437], [835, 428], [905, 443], [985, 426], [1080, 430]]), 'r1', 6);
    const band = (ridge, bottom) => [...ridge, [1000, bottom], [0, bottom]];
    const r1b = band(r1, 1000);
    // each range is opaque: what is behind it is knocked out first, then it mists to paper
    press.knockout((g) => { U.path(g, r1b); g.fill(); });
    U.clipped(pinkS, r1b, (g) => { g.fillStyle = vramp(g, 360, 540, [[0, 0.4], [0.5, 0.28], [1, 0.06]]); g.fillRect(0, 0, 1000, 1000); });
    U.clipped(navyS, r1b, (g) => { g.fillStyle = vramp(g, 360, 540, [[0, 0.16], [1, 0.0]]); g.fillRect(0, 0, 1000, 1000); });
    U.clipped(yellowS, r1b, (g) => { g.fillStyle = vramp(g, 400, 560, [[0, 0.1], [1, 0.4]]); g.fillRect(0, 0, 1000, 1000); });
    // the yellow sky glow shows through the range's lower slopes near the sun
    U.clipped(yellowS, r1b, (g) => { g.fillStyle = R.radial(g, SUN[0] - 40, 560, 20, 280, 0.9, 0); g.fillRect(0, 0, 1000, 1000); });
    U.clipped(pinkS, r1b, (g) => { g.globalCompositeOperation = 'destination-out'; g.fillStyle = R.radial(g, SUN[0] - 60, 560, 20, 260, 0.9, 0); g.fillRect(0, 0, 1000, 1000); });

    // range 2: purple, peak on the left, a valley in the middle full of yellow haze
    const r2 = edge(u([[0, 548], [70, 540], [150, 527], [228, 522], [300, 540], [380, 572], [440, 598], [510, 604], [575, 600], [640, 590], [705, 598], [760, 574], [830, 552], [900, 548], [980, 538], [1080, 528]]), 'r2', 5);
    const r2b = band(r2, 1000);
    press.knockout((g) => { U.path(g, r2b); g.fill(); });
    press.knockout((g) => { g.globalAlpha = 0.7; U.stroke(g, r2, 2.2); });
    U.clipped(pinkS, r2b, (g) => { g.fillStyle = vramp(g, 490, 680, [[0, 0.38], [1, 0.08]]); g.fillRect(0, 0, 1000, 1000); });
    U.clipped(navyS, r2b, (g) => { g.fillStyle = vramp(g, 490, 680, [[0, 0.36], [0.6, 0.16], [1, 0.02]]); g.fillRect(0, 0, 1000, 1000); });
    U.clipped(yellowS, r2b, (g) => { g.fillStyle = vramp(g, 560, 700, [[0, 0], [1, 0.35]]); g.fillRect(0, 0, 1000, 1000); });
    U.clipped(yellowS, r2b, (g) => { g.fillStyle = R.radial(g, 560, 640, 10, 230, 0.85, 0); g.fillRect(0, 0, 1000, 1000); });
    for (const g of [pinkS, navyS]) U.clipped(g, r2b, (h) => { h.globalCompositeOperation = 'destination-out'; h.fillStyle = R.radial(h, 560, 650, 10, 210, 0.85, 0); h.fillRect(0, 0, 1000, 1000); });

    // range 3: blue-violet (navy + blue + pink), a V round the valley
    const r3 = edge(u([[0, 598], [60, 612], [130, 640], [200, 672], [245, 700], [300, 697], [350, 682], [420, 650], [480, 622], [530, 606], [575, 600], [630, 612], [700, 640], [770, 670], [830, 700], [900, 718], [960, 710], [1080, 690]]), 'r3', 5);
    const r3b = band(r3, 1000);
    press.knockout((g) => { U.path(g, r3b); g.fill(); });
    press.knockout((g) => { g.globalAlpha = 0.55; U.stroke(g, r3, 2); });
    U.clipped(navyS, r3b, (g) => { g.fillStyle = vramp(g, 560, 760, [[0, 0.55], [1, 0.25]]); g.fillRect(0, 0, 1000, 1000); });
    U.clipped(pinkS, r3b, (g) => { g.fillStyle = vramp(g, 560, 760, [[0, 0.3], [1, 0.12]]); g.fillRect(0, 0, 1000, 1000); });
    U.clipped(blueS, r3b, (g) => { g.fillStyle = vramp(g, 600, 760, [[0, 0.1], [1, 0.3]]); g.fillRect(0, 0, 1000, 1000); });

    // the first pine line: big firs on the left and right, small ones along the ridge
    const pines = (list, seed, gS, tone, gFlat) => {
        const r = Motion.rng('pl' + seed);
        for (const [x, y, h] of list) { gS.fillStyle = T(tone); U.pine(gS, x, y, h, h * (0.32 + 0.1 * r()), seed + x); if (gFlat) { gFlat.fillStyle = T(0.35); U.pine(gFlat, x, y, h, h * 0.36, seed + x); } }
    };
    const row = (x0, x1, step, ybase, h0, h1, seed) => { const r = Motion.rng('row' + seed), out = []; for (let x = x0; x <= x1; x += step * (0.7 + 0.6 * r())) { const h = h0 + (h1 - h0) * r(); out.push([x, (typeof ybase === 'function' ? ybase(x) : ybase) - h, h + 12]); } return out; };
    const tl1 = [...row(0, 250, 20, (x) => 712 + x * 0.06, 80, 150, 'a'), ...row(250, 800, 26, (x) => 725 + Math.sin(x / 60) * 6, 18, 42, 'b'), ...row(790, 1000, 18, 725, 50, 110, 'c')];
    pines(tl1, 'p1', navyS, 0.85, blue);
    // range 4: blue dots over navy, a paler dotted band (mist) along its middle
    const r4 = edge(u([[0, 780], [120, 770], [260, 758], [400, 742], [520, 752], [640, 772], [760, 790], [880, 780], [1000, 766], [1080, 760]]), 'r4', 4);
    const r4b = band(r4, 1000);
    press.knockout((g) => { U.path(g, r4b); g.fill(); });
    U.clipped(navyS, r4b, (g) => { g.fillStyle = vramp(g, 700, 840, [[0, 0.7], [0.5, 0.35], [1, 0.02]]); g.fillRect(0, 0, 1000, 1000); });
    U.clipped(blueS, r4b, (g) => { g.fillStyle = vramp(g, 700, 840, [[0, 0.6], [0.6, 0.4], [1, 0.04]]); g.fillRect(0, 0, 1000, 1000); });
    U.clipped(pinkS, r4b, (g) => { g.fillStyle = vramp(g, 700, 840, [[0, 0.3], [1, 0.02]]); g.fillRect(0, 0, 1000, 1000); });
    // the front forest: navy solid with pine tips, blue under it
    const front = [...row(0, 1000, 14, (x) => 862 + Math.sin(x / 80) * 14, 30, 100, 'f')];
    const frontBase = u([[0, 900], [200, 880], [420, 905], [600, 935], [800, 905], [1080, 890]]).concat([[1000, 1000], [0, 1000]]);
    U.poly(navy, frontBase, T(0.8));
    U.clipped(press.plate('pink', 'screen'), frontBase, (g) => { g.fillStyle = vramp(g, 820, 1000, [[0, 0.15], [1, 0.45]]); g.fillRect(0, 0, 1000, 1000); });
    U.poly(blue, frontBase, T(0.5));
    navy.fillStyle = T(0.9); blue.fillStyle = T(0.5);
    for (const [x, y, h] of front) { U.pine(navy, x, y, h, h * 0.34, 'fr' + x); U.pine(blue, x, y, h, h * 0.34, 'fr' + x); }
    // soft purple mottling and pink specks in the dark forest
    U.speckle(press.plate('pink'), [0, 850, 1000, 1000], 60, 0.8, 2.2, 'mtp');
    press.knockout((g) => U.speckle(g, [0, 820, 1000, 1000], 20, 0.6, 1.4, 'mtw'));
};
