// Card «radio» (reference 9.0–9.5 s, full frame): a vintage cathedral radio on a table,
// sound waves round it as yellow ribbons twisted with red ones. Authored in reference
// pixels (G2.px), measured on the 9.1 s frame. Separations: the wall = navy + blue dots at
// the top into pink dots (violet) lower down; the table = pink + navy dots (maroon); the
// cabinet = pink + yellow (orange) with navy dots shading the sides, the lit centre yellow;
// the grille bars and knobs = navy + yellow + blue (black-green); the waves = yellow
// ribbons with a paper edge and red (pink + yellow) twins, wobbling per drawing. Needs
// cards/_group2-util.js.
var CARDS = CARDS || {};
CARDS.radio = (press, t) => {
    const { T, px, poly, disc, ell, fillWith, inside, curve, taper, spline, speckle } = G2;
    const P = (ink, k) => press.plate(ink, k);
    const yellow = P('yellow'), yellowS = P('yellow', 'screen'), pink = P('pink'), pinkS = P('pink', 'screen');
    const blue = P('blue'), blueS = P('blue', 'screen'), navy = P('navy'), navyS = P('navy', 'screen');
    const d = Math.floor(t * 12 + 1e-6);
    const grad = (g, x0, y0, x1, y1, stops) => { const gr = g.createLinearGradient(x0, y0, x1, y1); for (const [p, v] of stops) gr.addColorStop(p, T(v)); return gr; };
    // black-green (navy + yellow + blue): the other plates are cleared under it first, so no
    // pink or dots show through the dark parts
    const dark = (fn) => {
        for (const g of [pink, pinkS, navyS, yellowS, blueS]) { g.save(); g.globalCompositeOperation = 'destination-out'; fn(g, 1); g.restore(); }
        for (const [g, v] of [[navy, 1], [yellow, 1], [blue, 0.75]]) fn(g, v);
    };
    const CX = 503, TOP = 268, RW = 245; // the cabinet: centre line, top, half width
    const cab = (g, inset = 0) => { const r = RW - inset; g.moveTo(CX - r, 945); g.lineTo(CX - r, TOP + RW); g.arc(CX, TOP + RW, r, Math.PI, 0); g.lineTo(CX + r, 945); g.closePath(); };
    px(press, () => {
        // the wall: navy flat + blue dots at the top, pink dots taking over lower down
        // (measured at 2x: a solid navy ground; clean blue dots in it at the top, clean pink
        // dots round the radio: the navy is cleared under every dot so the dots print pure)
        navy.fillStyle = T(0.95); navy.fillRect(0, 0, 1080, 1000);
        blue.fillStyle = T(0.5); blue.fillRect(0, 0, 1080, 1000);
        const pk = (x, y) => Math.max(0, Math.min(0.62, 1.0 - Math.hypot(x - CX, (y - 640) * 0.85) / 620));
        const bl = (x, y) => Math.max(0, 0.5 - pk(x, y) * 1.2) * (1 - y / 1400);
        blue.save(); blue.globalCompositeOperation = 'destination-out'; G2.dots(blue, 0, 0, 1080, 1000, pk); blue.restore();
        G2.dots(pink, 0, 0, 1080, 1000, pk);
        G2.dots(blue, 0, 0, 1080, 1000, bl, { angle: 1.31 });
        navy.save(); navy.globalCompositeOperation = 'destination-out';
        G2.dots(navy, 0, 0, 1080, 1000, pk); G2.dots(navy, 0, 0, 1080, 1000, bl, { angle: 1.31 });
        navy.restore();
        speckle(pink, 'wall', 0, 0, 1080, 1000, 300, 0.8, 1.8, 0.9);
        // the table: maroon (pink + navy dots), a dark line at its back edge
        const table = [[0, 995], [1080, 995], [1080, 1080], [0, 1080]];
        press.knockout((g) => { G2.path(g, table); g.fill(); });
        poly(pink, table, 0.85); poly(navyS, table, 0.6); poly(blue, table, 0.2);
        curve(navy, [[0, 996], [1080, 996]], 4, 0.9);
        // the waves: ribbons in arcs round the radio; each yellow ribbon has a paper edge on
        // its outer side; red ribbons twist across some of them
        const wob = d % 3;
        const ribbon = (cx, cy, r, a0, a1, w, seed) => {
            const pts = []; const rr = Motion.rng('rb' + seed + wob);
            const ph = seed * 1.7 + wob * 0.9;
            for (let i = 0; i <= 6; i++) { const a = a0 + (a1 - a0) * i / 6; const k = r + Math.sin(i * 1.1 + ph) * 10; pts.push([cx + Math.cos(a) * k, cy + Math.sin(a) * k]); }
            return spline(pts, 36);
        };
        const yRib = (pts, w) => {
            press.knockout((g) => taper(g, pts.map(([x, y]) => [x, y - 3]), w + 7, 1));
            taper(yellow, pts, w, 1);
        };
        const rRib = (pts, w) => { press.knockout((g) => taper(g, pts, w + 2, 1)); taper(pink, pts, w, 1); taper(yellow, pts, w, 0.95); };
        // three rings of ribbons round (480, 580), measured on the 9.1 s frame: [r, a0, a1]
        // for the yellow ones, the red twins on top
        const C = [480, 580];
        const Y = [[335, -3.45, -3.0], [335, -2.85, -1.6], [335, -1.4, -0.2], [335, 0.0, 0.45],
            [470, -3.35, -2.95], [455, -2.85, -2.15], [455, -2.0, -1.15], [460, -1.0, -0.1], [460, 0.15, 0.5],
            [620, -2.6, -1.95], [600, -1.4, -1.05], [620, -0.95, -0.2], [620, 0.14, 0.43]];
        const Rd = [[325, -2.9, -1.95], [330, -1.2, -0.35], [615, -2.55, -2.0], [600, -1.35, -1.1], [615, -0.85, -0.45]];
        Y.forEach(([r, a0, a1], i) => yRib(ribbon(C[0], C[1], r, a0, a1, 0, i + 1), 24));
        Rd.forEach(([r, a0, a1], i) => rRib(ribbon(C[0], C[1], r, a0, a1, 0, i + 40), 13));
        // the cabinet: a dark outline, orange body, navy dots shading, a lit yellow centre
        press.knockout((g) => { g.beginPath(); cab(g, -6); g.fill(); });
        dark((g, v) => { g.fillStyle = T(v); g.beginPath(); cab(g, -6); g.fill(); });
        const body = (g) => cab(g, 0);
        press.knockout((g) => { g.beginPath(); body(g); g.fill(); });
        fillWith(yellow, body, T(1)); inside(pinkS, body, (g) => { g.fillStyle = T(0.7); g.fillRect(0, 0, 1080, 1080); }); fillWith(pink, body, T(0.12));
        inside(navyS, body, (g) => { g.fillStyle = grad(g, CX - RW, 0, CX + RW, 0, [[0, 0.2], [0.15, 0], [0.6, 0], [0.78, 0.3], [1, 0.55]]); g.fillRect(0, 0, 1080, 1080); });
        inside(navyS, body, (g) => { g.fillStyle = grad(g, 0, TOP, 0, TOP + 160, [[0, 0.25], [1, 0]]); g.fillRect(0, 0, 1080, 1080); });
        // the side wall on the right: darker (brown), split from the front by a line
        const side = (g) => { g.moveTo(CX + RW - 60, 945); g.lineTo(CX + RW - 60, TOP + RW); g.arc(CX, TOP + RW, RW, -0.25, 0); g.lineTo(CX + RW, 945); g.closePath(); };
        inside(navyS, side, (g) => { g.fillStyle = T(0.55); g.fillRect(0, 0, 1080, 1080); });
        inside(navy, body, (g) => { g.strokeStyle = T(0.8); g.lineWidth = 4; g.beginPath(); g.moveTo(CX + RW - 60, 945); g.lineTo(CX + RW - 60, TOP + RW); g.arc(CX, TOP + RW, RW - 60, 0, -1.2, true); g.stroke(); });
        // the front's own arch line, and the glow: pink cleared, yellow dots bright
        inside(navy, body, (g) => { g.strokeStyle = T(0.8); g.lineWidth = 4; g.beginPath(); g.moveTo(CX - RW + 24, 945); g.lineTo(CX - RW + 24, TOP + RW); g.arc(CX, TOP + RW, RW - 24, Math.PI, -0.2); g.stroke(); });
        inside(pink, body, (g) => { g.globalCompositeOperation = 'destination-out'; g.fillStyle = Riso.radial(g, 480, 760, 20, 190, 0.85, 0); g.fillRect(0, 0, 1080, 1080); });
        inside(navyS, body, (g) => { g.globalCompositeOperation = 'destination-out'; g.fillStyle = Riso.radial(g, 480, 760, 20, 200, 1, 0); g.fillRect(0, 0, 1080, 1080); });
        inside(pinkS, body, (g) => { g.globalCompositeOperation = 'destination-out'; g.fillStyle = Riso.radial(g, 480, 760, 40, 210, 0.8, 0); g.fillRect(0, 0, 1080, 1080); });
        // the lit left edge: a green line (yellow + blue) and a yellow one
        const band = (g, off, w) => { g.lineWidth = w; g.lineCap = 'round'; g.beginPath(); g.moveTo(CX - RW + off, 935); g.lineTo(CX - RW + off, TOP + RW); g.arc(CX, TOP + RW, RW - off, Math.PI, -1.9); g.stroke(); };
        for (const g of [pink, navyS]) { g.save(); g.globalCompositeOperation = 'destination-out'; g.strokeStyle = T(1); band(g, 14, 16); g.restore(); }
        blue.save(); blue.strokeStyle = T(0.7); band(blue, 10, 6); blue.restore();
        blueS.save(); blueS.strokeStyle = T(0.45); band(blueS, 17, 8); blueS.restore();
        // the grille: an arch window, orange with a fine red mesh, black-green sunburst bars
        const GX = 476, GY = 540, GR = 155, GB = 700;
        const grille = (g) => { g.moveTo(GX - GR, GB); g.lineTo(GX - GR, GY); g.arc(GX, GY, GR, Math.PI, 0); g.lineTo(GX + GR, GB); g.closePath(); };
        dark((g, v) => { g.save(); g.strokeStyle = T(v); g.lineWidth = 22; g.lineJoin = 'round'; g.beginPath(); grille(g); g.stroke(); g.restore(); });
        inside(pink, grille, (g) => { g.globalCompositeOperation = 'destination-out'; g.fillStyle = T(0.4); g.fillRect(0, 0, 1080, 1080); });
        inside(pinkS, grille, (g) => { g.globalCompositeOperation = 'destination-out'; g.fillRect(0, 0, 1080, 1080); g.globalCompositeOperation = 'source-over'; g.fillStyle = Riso.radial(g, GX, GB, 40, 260, 0.12, 0.42); g.fillRect(0, 0, 1080, 1080); });
        inside(navyS, grille, (g) => { g.globalCompositeOperation = 'destination-out'; g.fillStyle = T(0.7); g.fillRect(0, 0, 1080, 1080); });
        inside(pink, grille, (g) => { g.strokeStyle = T(0.8); g.lineWidth = 1; for (let k = -40; k < 40; k++) { g.beginPath(); g.moveTo(GX - 300 + k * 9, 300); g.lineTo(GX + k * 9, 760); g.stroke(); g.beginPath(); g.moveTo(GX + 300 + k * 9, 300); g.lineTo(GX + k * 9, 760); g.stroke(); } });
        // sunburst bars from the hub
        const HX = GX, HY = 672;
        inside(navy, grille, () => {});
        dark((g, v) => {
            g.save(); g.beginPath(); grille(g); g.clip();
            for (const a of [-2.95, -2.62, -2.2, -1.82, -1.4, -1.0, -0.6, -0.2]) {
                const w0 = 16, w1 = 7, c = Math.cos(a), s = Math.sin(a);
                const q = [[HX + c * 40 - s * w0, HY + s * 40 + c * w0], [HX + c * 420 - s * w1, HY + s * 420 + c * w1], [HX + c * 420 + s * w1, HY + s * 420 - c * w1], [HX + c * 40 + s * w0, HY + s * 40 - c * w0]];
                g.fillStyle = T(v); G2.path(g, q); g.fill();
            }
            g.fillStyle = T(v); g.beginPath(); g.arc(HX, HY + 8, 66, Math.PI, 0); g.lineTo(HX + 66, HY + 30); g.lineTo(HX - 66, HY + 30); g.fill();
            g.restore();
        });
        // a red highlight on the hub
        for (const g of [navy, blue]) { g.save(); g.globalCompositeOperation = 'destination-out'; g.lineWidth = 6; g.lineCap = 'round'; g.beginPath(); g.arc(HX, HY + 20, 40, -2.3, -1.3); g.stroke(); g.restore(); }
        pink.save(); pink.strokeStyle = T(1); pink.lineWidth = 5; pink.lineCap = 'round'; pink.beginPath(); pink.arc(HX, HY + 20, 40, -2.3, -1.3); pink.stroke(); pink.restore();
        // the dial: a yellow pill, a dark rim, green ticks, a red needle
        const dial = (g) => { g.moveTo(360, 760); g.lineTo(590, 760); g.quadraticCurveTo(615, 782, 590, 805); g.lineTo(360, 805); g.quadraticCurveTo(335, 782, 360, 760); g.closePath(); };
        dark((g, v) => { g.save(); g.strokeStyle = T(v); g.lineWidth = 8; g.beginPath(); dial(g); g.stroke(); g.restore(); });
        inside(pink, dial, (g) => { g.globalCompositeOperation = 'destination-out'; g.fillRect(0, 0, 1080, 1080); });
        inside(pinkS, dial, (g) => { g.globalCompositeOperation = 'destination-out'; g.fillRect(0, 0, 1080, 1080); });
        inside(blue, dial, (g) => { g.strokeStyle = T(0.9); g.lineWidth = 2; for (let x = 372; x < 590; x += 11) { g.beginPath(); g.moveTo(x, 766); g.lineTo(x, 766 + (x % 22 < 11 ? 14 : 8)); g.stroke(); } });
        curve(pink, [[512, 764], [512, 802]], 4, 1);
        // the knobs: black-green with a lit rim
        for (const x of [375, 478, 580]) {
            dark((g, v) => disc(g, x, 885, 25, v));
            for (const g of [navy]) { g.save(); g.globalCompositeOperation = 'destination-out'; g.lineWidth = 3; g.beginPath(); g.arc(x, 885, 18, -2.6, -1.4); g.stroke(); g.restore(); }
        }
        // the plinth: a dark slab with a brown top face
        const pl = [[220, 945], [785, 945], [785, 998], [220, 998]];
        press.knockout((g) => { G2.path(g, pl); g.fill(); });
        dark((g, v) => poly(g, pl, v));
        const plTop = [[248, 948], [760, 948], [778, 968], [232, 968]];
        for (const g of [navy]) { g.save(); g.globalCompositeOperation = 'destination-out'; G2.path(g, plTop); g.fillStyle = T(0.6); g.fill(); g.restore(); }
        poly(pink, plTop, 0.9); for (const g of [blue]) { g.save(); g.globalCompositeOperation = 'destination-out'; G2.path(g, plTop); g.fill(); g.restore(); }
    });
};
