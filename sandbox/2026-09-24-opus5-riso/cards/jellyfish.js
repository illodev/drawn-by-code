// Card «jellyfish» (in an opening circle 3.25–4.0 s; full frame, re-inked pink ↔ blue, at
// 14.375). Pink jellyfish in deep water: a big one in the middle with a sun-like glow in its
// bell, three small ones, long trailing tentacles with white highlights, a starry sea of
// halftone dots (green-yellow to the upper left, blue-violet in the middle, navy low down).
// Card space = the full-frame view (frame 346, reference px). The sea is three hand-set
// screens on the lattices measured there (yellow 10.8 px at 42°, the blue plate at 12°, navy
// at 72°) with tone fields measured cell by cell (12 × 12, the jellies masked out). The
// circle view is the same print turned 3° and scaled 0.6725 (its screens measure 7.26 px at
// 45°), pushing in 0.35 %/frame; the repeat's first frame sits 4 px left and 6 px up.
var CARDS = CARDS || {};
CARDS.jellyfish = (press, t, lf, o = {}) => {
    const { T, taper, clipped, lattice, dots, field, marks } = G1;
    const erase = (g, fn) => { g.save(); g.globalCompositeOperation = 'destination-out'; g.fillStyle = '#000'; fn(g); g.restore(); };
    const P = (ink, k) => press.plate(ink, k);
    const pink = P('pink'), yellow = P('yellow'), blue = P('blue'), navy = P('navy');
    const d = Math.floor(t * 12 + 1e-6);
    // the bells pulse on twos: squash a little every other drawing
    const pulse = [1, 0.985, 1.01, 0.99][d % 4];
    // tone fields (area coverage per 90 px cell) measured on the 346 frame; the blue plate
    // prints pink there (the repeat swaps them), so its field is the measured pink one
    const F = {
        yellow: [[0.81, 0.91, 0.72, 0.65, 0.42, 0.23, 0.23, 0.44, 0.5, 0.66, 0.8, 0.75], [0.77, 0.76, 0.58, 0.27, 0, 0, 0, 0, 0.24, 0.02, 0.7, 0.67], [0.75, 0.66, 0.43, 0.01, 0, 0.74, 0.83, 0.16, 0.22, 0.23, 0.71, 0.7], [0.66, 0.75, 0.26, 0, 0.35, 0.41, 0.61, 0.19, 0.18, 0.15, 0.58, 0.67], [0.66, 0.67, 0.3, 0, 0, 0, 0, 0, 0.03, 0.23, 0.53, 0.62], [0.63, 0.6, 0.46, 0.13, 0, 0.09, 0.1, 0, 0.15, 0.29, 0.55, 0.56], [0.58, 0.48, 0.2, 0.26, 0.04, 0.05, 0.03, 0, 0.3, 0.17, 0, 0.32], [0.37, 0, 0, 0, 0.22, 0.27, 0.26, 0.28, 0.38, 0, 0, 0.12], [0.21, 0, 0.06, 0, 0.26, 0.46, 0.42, 0.4, 0.46, 0.38, 0.21, 0.37], [0.29, 0, 0.14, 0, 0.2, 0.31, 0.4, 0.38, 0.39, 0.39, 0.41, 0.32], [0.41, 0.25, 0.28, 0.2, 0.37, 0.32, 0.37, 0.31, 0.3, 0.47, 0.35, 0.34], [0.41, 0.43, 0.28, 0.33, 0.29, 0.25, 0.31, 0.35, 0.26, 0.35, 0.34, 0.31]],
        pink: [[0.75, 1, 1, 1, 1, 1, 0.91, 0.47, 1, 1, 1, 1], [0.77, 0.97, 1, 1, 0.88, 0.6, 0.54, 0.37, 0, 0.92, 0.99, 1], [0.72, 0.99, 0.99, 0.82, 0.49, 0, 0, 0, 0, 0.87, 1, 1], [1, 0.93, 1, 0.73, 0, 0, 0, 0, 0, 1, 1, 1], [1, 0.95, 1, 0.72, 0.62, 0.46, 0, 0.29, 0.11, 1, 1, 1], [0.99, 1, 1, 0.73, 0.53, 0, 0, 0.9, 0.39, 0.93, 1, 0.97], [0.95, 1, 0.86, 0.79, 0.89, 0.37, 0.74, 0.76, 0.7, 0.65, 0.94, 0.85], [0.92, 0.37, 0.41, 0.77, 0.85, 0.91, 0.72, 1, 0.93, 0.48, 0, 0.88], [0.85, 0.13, 0, 0.37, 0.82, 0.78, 0.89, 0.59, 0.47, 0.96, 0.44, 0.73], [0.81, 0.27, 0, 0.49, 0.75, 0.99, 0.69, 0.71, 0.54, 0.72, 0.55, 0.58], [0.4, 0.23, 0, 0.67, 0.33, 0.82, 0.22, 0.39, 0.28, 0, 0.21, 0.44], [0, 0, 0.5, 0.37, 0.29, 0.8, 0.31, 0.19, 0.66, 0.08, 0.34, 0.64]],
        navy: [[0, 0, 0, 0.02, 0.24, 0.38, 0.35, 0.28, 0.11, 0, 0, 0], [0, 0, 0.01, 0.36, 0.69, 0.81, 0.87, 0.71, 0.89, 0.4, 0, 0], [0, 0, 0.14, 0.66, 0.95, 0.4, 0.51, 1, 0.9, 0.39, 0, 0], [0, 0.03, 0.28, 0.74, 1, 0, 0, 1, 0.95, 0.44, 0.05, 0.01], [0.08, 0.14, 0.28, 0.69, 0.93, 1, 1, 0.95, 0.86, 0.4, 0.16, 0.08], [0.19, 0.24, 0.24, 0.53, 1, 1, 0.99, 0.73, 0.74, 0.38, 0.23, 0.23], [0.28, 0.34, 0.34, 0.42, 0.65, 0.8, 0.79, 0.6, 0.47, 0.6, 0.7, 0.45], [0.37, 0.78, 0.9, 0.79, 0.51, 0.39, 0.56, 0.46, 0.4, 0.74, 1, 0.6], [0.6, 1, 0.55, 1, 0.68, 0.58, 0.59, 0.66, 0.63, 0.64, 0.84, 0.62], [0.76, 1, 1, 0.97, 0.78, 0.58, 0.68, 0.6, 0.77, 0.84, 0.85, 0.79], [1, 1, 1, 0.84, 1, 0.76, 0.95, 0.87, 0.98, 1, 1, 0.86], [1, 1, 1, 0.97, 1, 0.79, 0.95, 1, 0.94, 1, 1, 0.96]],
    };
    const L = {
        yellow: lattice(-5.35, -0.38, 7.9717, 7.2731, -7.2626, 7.9766),
        blue: lattice(-1.0, -2.55, 10.5702, 2.1103, -2.1951, 10.655),
        navy: lattice(1.49, -1.23, 3.3289, 10.3271, -10.2628, 3.3635),
    };

    G1.frame(press, () => {
        press.save();
        if (o.open) {
            // the circle view: turned 2.97°, 1.113 × the scene's own scaling, pushing in
            const z = 1 + 0.0035 * ((lf ?? 10) - 10);
            press.each((g) => { g.translate(540, 540); g.scale(z, z); g.translate(-540, -540); g.translate(-24.4, -92.2); g.rotate(0.0518); g.scale(1.113, 1.113); });
        } else if (o.ring && (lf ?? 1) === 0) press.each((g) => g.translate(-4, -6));
        const X0 = -120, Y0 = -120, X1 = 1200, Y1 = 1200;

        // --- the sea: three screens with measured tone fields
        // (in the circle view the screens keep their printed size: the reference's scaled print
        // shows crisp 7 px dots, which the press's ink spread would blur to nothing at 0.67 ×)
        const big = (Lx) => (o.open ? lattice(Lx.ox, Lx.oy, Lx.ax / 0.8, Lx.ay / 0.8, Lx.bx / 0.8, Lx.by / 0.8) : Lx);
        dots(yellow, big(L.yellow), [X0, Y0, X1, Y1], field(F.yellow), { ink: 'yellow', seed: 31 });
        dots(blue, big(L.blue), [X0, Y0, X1, Y1], field(F.pink), { ink: 'blue', seed: 32 });
        dots(navy, big(L.navy), [X0, Y0, X1, Y1], field(F.navy), { ink: 'navy', seed: 33 });
        // stars: white specks (knocked out), a few yellow ones; in the circle view the print
        // is a third smaller, so its specks are finer and denser (the dust of the scaled print)
        press.knockout((g) => marks(g, 'jfst', null, [X0, Y0, X1, Y1], 520, 1.2, 3.4, { v0: 1 }));
        marks(yellow, 'jfsy', null, [X0, Y0, X1, Y1], 70, 1.5, 3, { v0: 0.9 });
        if (o.open) press.knockout((g) => marks(g, 'jfdust', null, [X0, Y0, X1, Y1], 2500, 2, 4, { v0: 0.9, v1: 0.5 }));

        const jelly = (cx, top, rx, h, rot, nT, tl, seed) => {
            const r = Motion.rng('jf' + seed);
            press.save();
            press.each((g) => { g.translate(cx, top + h); g.rotate(rot); g.scale(1, pulse); });
            // tentacles first (behind the bell): long wavy pink lines with a white core
            for (let i = 0; i < nT; i++) {
                const x0 = -rx * 0.82 + (rx * 1.64 * i) / (nT - 1), len = tl * (0.55 + r() * 0.5), ph = r() * 6.28, amp = 8 + r() * rx * 0.28;
                const pts = [];
                for (let k = 0; k <= 9; k++) { const u = k / 9; pts.push([x0 * (1 - u * 0.35) + Math.sin(ph + u * 7.5 + d * 0.45) * amp * (0.25 + u), 4 + u * len]); }
                const w = Math.max(3, (i % 3 === 0 ? 11 : 7.5) * rx / 210);
                press.knockout((g) => taper(g, pts, w + 2, w * 0.55 + 2));
                taper(pink, pts, w, w * 0.55);
                if (i % 2 === 0) press.knockout((g) => taper(g, pts.slice(0, 7), w * 0.32, 0.6));
            }
            // the frilly oral arms under the bell: short, ribbon-like, white-veined
            for (let i = 0; i < 7; i++) {
                const x0 = -rx * 0.42 + (rx * 0.84 * i) / 6, len = h * (0.9 + r() * 0.9);
                const pts = [[x0, 0], [x0 + (r() - 0.5) * rx * 0.12, len * 0.5], [x0 + (r() - 0.5) * rx * 0.18, len]];
                press.knockout((g) => taper(g, pts, rx * 0.075 + 2, 4));
                taper(pink, pts, rx * 0.075, 2.5);
                press.knockout((g) => taper(g, pts, 2.2, 0.8));
            }
            // the bell: a flat-topped dome (straight sides rounding over) with a scalloped frill
            const bell = (g) => {
                g.moveTo(-rx, 0);
                g.bezierCurveTo(-rx * 1.03, -h * 0.72, -rx * 0.72, -h * 1.02, 0, -h * 1.02);
                g.bezierCurveTo(rx * 0.72, -h * 1.02, rx * 1.03, -h * 0.72, rx, 0);
                for (let k = 0; k < 13; k++) { const x1 = rx - ((k + 1) * 2 * rx) / 13, xm = (rx - (k * 2 * rx) / 13 + x1) / 2; g.quadraticCurveTo(xm, h * 0.1, x1, 0); }
                g.closePath();
            };
            const inner = (g) => { g.ellipse(0, -h * 0.02, rx * 0.87, h * 0.9, 0, Math.PI, 0); g.lineTo(rx * 0.87, h * 0.12); g.lineTo(-rx * 0.87, h * 0.12); g.closePath(); };
            press.knockout((g) => { g.beginPath(); bell(g); g.fill(); });
            // the dome's shell: solid pink round the outside
            clipped(pink, bell, (g) => { g.fillStyle = T(1); g.fillRect(-rx - 5, -h * 1.1, rx * 2 + 10, h * 1.25); });
            // inside: a screen of pink dots on paper, densest at the edge, a yellow glow low in the middle
            erase(pink, (g) => { g.save(); g.scale(1, pulse); g.beginPath(); inner(g); g.fill(); g.restore(); });
            const sc = Math.max(0.35, rx / 208), pl = lattice(0, 0, 8.6 * sc, 2.3 * sc, -2.3 * sc, 8.6 * sc);
            clipped(pink, (g) => { g.beginPath(); inner(g); }, (g) => dots(g, pl, [-rx, -h * 1.1, rx, h * 0.2], (x, y) => { const q = Math.hypot(x / (rx * 0.87), (y + h * 0.4) / (h * 0.75)); return 0.2 + 0.5 * Math.pow(Math.min(1, q), 1.6); }, { seed: seed.length * 7 }));
            clipped(yellow, bell, (g) => { g.fillStyle = Riso.radial(g, 0, -h * 0.38, rx * 0.05, rx * 0.55, 1, 0); g.fillRect(-rx, -h * 1.1, rx * 2, h * 1.25); });
            // rays: thin dark lines fanning up from the glow
            for (let k = 0; k < 9; k++) {
                const a = Math.PI * (1.18 + 0.64 * (k / 8)), r0 = rx * 0.08, r1 = rx * (0.42 + 0.08 * (k % 2));
                const ray = [[Math.cos(a) * r0, -h * 0.3 + Math.sin(a) * r0 * 0.9], [Math.cos(a) * r1, -h * 0.3 + Math.sin(a) * r1 * 1.0]];
                taper(navy, ray, 1 + sc, 1.6 * sc + 0.6, 0.7);
            }
            // the highlight: a crescent sweeping down the upper left; the frill at the rim
            press.knockout((g) => {
                g.beginPath();
                g.moveTo(-rx * 0.74, -h * 0.34);
                g.quadraticCurveTo(-rx * 0.66, -h * 0.66, -rx * 0.33, -h * 0.72);
                g.quadraticCurveTo(-rx * 0.58, -h * 0.58, -rx * 0.74, -h * 0.34);
                g.fill();
            });
            clipped(pink, bell, (g) => dots(g, pl, [-rx, -h * 0.12, rx, h * 0.12], (x, y) => (y > -h * 0.07 ? 0.45 : 0), { seed: 7 }));
            press.restore();
        };
        // measured on the 346 frame: [bell centre x, top, half width, height, tilt, …]
        jelly(818, 74, 47, 52, 0.04, 7, 150, 'd');
        jelly(930, 567, 69, 78, -0.02, 9, 260, 'c');
        jelly(558, 146, 208, 222, 0, 17, 800, 'a');
        jelly(219, 712, 114, 84, 0.2, 12, 420, 'b');
        press.restore();
    });
};
