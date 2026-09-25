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
    // (the sky's screens are the reference's own: pink 9.72 px at 78°, yellow 9.72 px at 48°,
    // phases measured per drawing)
    const k = Math.min(1, d), pinkL = press.plate('pink');
    const LPk = [{ o: [4.43, -4.15], a: [-9.5102, 2.0127], b: [2.0108, 9.5100] }, { o: [-2.57, -4.14], a: [-9.5090, 2.0126], b: [2.0147, 9.5096] }][k];
    const LYk = [{ o: [1.37, -5.35], a: [6.4871, 7.2418], b: [-7.2360, 6.4914] }, { o: [-0.54, -5.12], a: [6.4881, 7.2430], b: [-7.2386, 6.4927] }][k];
    U.lattice(pinkL, LPk, (m) => {
        // (coverages fitted on 90 px blocks: 0.62 at the top, 0.5, 0.37, 0.2 every 90 px down)
        m.fillStyle = vramp(m, 0, 400, [[0, 0.72], [0.31, 0.55], [0.52, 0.39], [0.73, 0.21], [1, 0.1]]); m.fillRect(-20, -20, 1040, 580);
        m.globalCompositeOperation = 'destination-out';
        m.fillStyle = R.radial(m, SUN[0], SUN[1], 60, 190, 0.9, 0); m.beginPath(); m.arc(SUN[0], SUN[1], 190, 0, 7); m.fill();
    });
    U.lattice(yellow, LYk, (m) => {
        // (0.22 everywhere, plus a glow round the sun: 0.78 at 100 px, 0.4 at 360 px)
        m.fillStyle = T(0.27); m.fillRect(-20, -20, 1040, 580);
        m.fillStyle = R.radial(m, SUN[0], SUN[1], 40, 390, 0.85, 0); m.beginPath(); m.arc(SUN[0], SUN[1], 380, 0, 7); m.fill();
    });
    // the sun rings: thin yellow lines, a little wobbly, the upper part only
    for (const [rr, w] of [[100, 3], [160, 3], [230, 2.8], [322, 2.6]]) {
        pinkL.save(); pinkL.globalCompositeOperation = 'destination-out';
        R.ring(pinkL, SUN[0], SUN[1], rr, w * 1.8, 'sr' + rr, { a0: Math.PI * 1.02, p: 0.5, wobble: 0.006 });
        pinkL.restore();
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
    // a pale rim of light along the ridge (paper showing: the reference's ranges are edged)
    press.knockout((g) => { g.globalAlpha = 0.8; U.stroke(g, r1, 3); });
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
    press.knockout((g) => { g.globalAlpha = 0.85; U.stroke(g, r2, 3); });
    U.clipped(pinkS, r2b, (g) => { g.fillStyle = vramp(g, 490, 680, [[0, 0.38], [1, 0.08]]); g.fillRect(0, 0, 1000, 1000); });
    U.clipped(navyS, r2b, (g) => { g.fillStyle = vramp(g, 490, 680, [[0, 0.36], [0.6, 0.16], [1, 0.02]]); g.fillRect(0, 0, 1000, 1000); });
    U.clipped(yellowS, r2b, (g) => { g.fillStyle = vramp(g, 560, 700, [[0, 0], [1, 0.35]]); g.fillRect(0, 0, 1000, 1000); });
    // the yellow haze in the valleys: under range 2's left hump (centre (310, 690) px, measured)
    // and in the V below the sun
    for (const [hx, hy, hr, hv] of [[287, 640, 170, 0.9], [540, 600, 150, 0.7]]) {
        U.clipped(yellowS, r2b, (g) => { g.fillStyle = R.radial(g, hx, hy, 10, hr, hv, 0); g.fillRect(0, 0, 1000, 1000); });
        for (const g of [pinkS, navyS]) U.clipped(g, r2b, (h) => { h.globalCompositeOperation = 'destination-out'; h.fillStyle = R.radial(h, hx, hy, 10, hr * 0.9, hv, 0); h.fillRect(0, 0, 1000, 1000); });
    }

    // range 3: blue-violet (navy + blue + pink), a V round the valley
    const r3 = edge(u([[0, 598], [60, 612], [130, 640], [200, 672], [245, 700], [300, 697], [350, 682], [420, 650], [480, 622], [530, 606], [575, 600], [630, 612], [700, 640], [770, 670], [830, 700], [900, 718], [960, 710], [1080, 690]]), 'r3', 5);
    const r3b = band(r3, 1000);
    press.knockout((g) => { U.path(g, r3b); g.fill(); });
    press.knockout((g) => { g.globalAlpha = 0.8; U.stroke(g, r3, 2.8); });
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
    // (the front's dark base, read off a 60 px grid of the 13.5 s frame: a dip of mist at
    // 500–640 px, lower on the right)
    const FB = [[-10, 905], [200, 910], [300, 915], [420, 900], [480, 905], [500, 930], [540, 965], [600, 985], [640, 960], [700, 955], [800, 950], [900, 955], [960, 965], [1020, 990], [1090, 1000]];
    const fbY = (X) => { for (let i = 0; i < FB.length - 1; i++) if (X <= FB[i + 1][0]) { const f = (X - FB[i][0]) / (FB[i + 1][0] - FB[i][0]); return FB[i][1] + (FB[i + 1][1] - FB[i][1]) * f; } return FB[FB.length - 1][1]; };
    const front = [...row(0, 1000, 12, (x) => fbY(x * 1.08) / 1.08 + 8, 45, 105, 'f')];
    const frontBase = u(FB).concat([[1000, 1000], [0, 1000]]);
    // the front forest mass is flat ink, not a screen: navy with a purple mottle (soft pink
    // blotches) and a grainy, uneven inking (pinholes and pink specks), measured at 2×
    // (fitted: navy 0.95, blue 0.45, pink 0.2 on the left, more pink on the right)
    // the front mass is opaque: the range behind is knocked out first (no screen under it)
    press.knockout((g) => { U.path(g, frontBase); g.fill(); for (const [x, y, h] of front) U.pine(g, x, y, h, h * 0.34, 'fr' + x); });
    U.poly(navy, frontBase, T(0.95));
    U.poly(blue, frontBase, T(0.45));
    U.clipped(press.plate('pink', 'screen'), frontBase, (g) => { g.fillStyle = R.ramp(g, 0, 0, 1000, 0, 0.15, 0.5); g.fillRect(0, 0, 1000, 1000); });
    U.clipped(press.plate('pink'), frontBase, (g) => { const rb = Motion.rng('mtmot'); for (let i = 0; i < 22; i++) { const x = rb() * 1000, y = 880 + rb() * 130, r = 30 + rb() * 70; g.fillStyle = R.radial(g, x, y, 0, r, 0.25, 0); g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); } });
    // the specks in the dark ink: magenta (navy knocked out, pink in) and pale blue (navy out)
    {
        const rb = Motion.rng('mtgr'), pk = new Path2D(), bl = new Path2D();
        for (let i = 0; i < 3200; i++) { const x = rb() * 1000, y = 830 + rb() * 180, r = 0.35 + rb() * rb() * 1.4, q = rb() < 0.65 ? pk : bl; q.moveTo(x + r, y); q.arc(x, y, r, 0, 7); }
        const fp = new Path2D(); frontBase.forEach(([x, y], i) => (i ? fp.lineTo(x, y) : fp.moveTo(x, y)));
        navy.save(); navy.clip(fp); navy.globalCompositeOperation = 'destination-out'; navy.fillStyle = T(0.9); navy.fill(pk); navy.fill(bl); navy.restore();
        const pl = press.plate('pink'); pl.save(); pl.clip(fp); pl.fillStyle = T(1); pl.fill(pk); pl.restore();
    }
    // (the front pines print like the mass: navy with blue and a touch of pink, flat)
    navy.fillStyle = T(0.95); blue.fillStyle = T(0.45); const pk = press.plate('pink'); pk.fillStyle = T(0.25);
    for (const [x, y, h] of front) { U.pine(navy, x, y, h, h * 0.34, 'fr' + x); U.pine(blue, x, y, h, h * 0.34, 'fr' + x); U.pine(pk, x, y, h, h * 0.34, 'fr' + x); }
    // soft purple mottling and pink specks in the dark forest
    U.speckle(press.plate('pink'), [0, 850, 1000, 1000], 60, 0.8, 2.2, 'mtp');
    press.knockout((g) => U.speckle(g, [0, 820, 1000, 1000], 20, 0.6, 1.4, 'mtw'));
};
// regional tone maps, if the private fitted data is loaded
G6.tones('mountains');
