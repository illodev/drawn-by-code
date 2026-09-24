// Card «jellyfish» (seen in a circle at 3.6 s; full frame, re-inked, at 14.38 s). Pink
// jellyfish in deep water: a big one in the middle with a sun-like glow in its bell, three
// small ones, long trailing tentacles with white highlights. Geometry measured on the
// full-frame 14.38 s view (reference pixels, G1.frame); inks from the circle view at 3.6 s
// (the full-frame view prints the same plates pink↔blue). Separations: water = navy screen
// in the middle, yellow + blue screens towards the edges (green); bells = pink solid +
// pink screen rim, the glow a yellow radial with pink rays, a white highlight; tentacles =
// pink strokes with white (knocked-out) cores.
var CARDS = CARDS || {};
CARDS.jellyfish = (press, t) => {
    const { T, fill, stroke, taper, smoothPath, polyPath, clipped, specks } = G1;
    const P = (ink, k) => press.plate(ink, k);
    const pink = P('pink'), pinkS = P('pink', 'screen'), yellow = P('yellow'), yellowS = P('yellow', 'screen');
    const blue = P('blue'), blueS = P('blue', 'screen'), navy = P('navy'), navyS = P('navy', 'screen');
    const d = Math.floor(t * 12 + 1e-6);
    // the bells pulse on twos: squash a little every other drawing
    const pulse = [1, 0.97, 1.02, 0.98][d % 4];

    G1.frame(press, () => {
        // --- water: navy dots deepening to the middle and bottom, green (yellow + blue) at the edges
        navyS.fillStyle = Riso.radial(navyS, 540, 600, 150, 620, 0.75, 0.12);
        navyS.fillRect(0, 0, 1080, 1080);
        navyS.fillStyle = Riso.ramp(navyS, 0, 700, 0, 1080, 0, 0.3);
        navyS.fillRect(0, 700, 1080, 380);
        yellowS.fillStyle = Riso.radial(yellowS, 540, 540, 280, 700, 0, 0.8);
        yellowS.fillRect(0, 0, 1080, 1080);
        blueS.fillStyle = Riso.radial(blueS, 540, 540, 200, 700, 0.35, 0.6);
        blueS.fillRect(0, 0, 1080, 1080);
        // a shaft of light from the top right (pink dots thinning)
        clipped(pinkS, (g) => polyPath(g, [[640, -10], [800, -10], [900, 500], [780, 520]]), (g) => { g.fillStyle = Riso.ramp(g, 0, 0, 0, 520, 0.25, 0); g.fillRect(600, 0, 400, 520); });
        press.knockout((g) => specks(g, 'jf-st', 0, 0, 1080, 1080, 110, 1, 2.4));
        specks(yellow, 'jf-sy', 0, 0, 1080, 1080, 40, 1, 2.2);

        const jelly = (cx, top, rx, h, rot, nT, tl, seed) => {
            const r = Motion.rng('jf' + seed);
            press.save();
            press.each((g) => { g.translate(cx, top + h); g.rotate(rot); g.scale(1, pulse); });
            // tentacles first (behind the bell): long wavy pink lines, a white core on some
            for (let i = 0; i < nT; i++) {
                const x0 = -rx * 0.8 + (rx * 1.6 * i) / (nT - 1), len = tl * (0.55 + r() * 0.5), ph = r() * 6.28, amp = 10 + r() * rx * 0.3;
                const pts = [];
                for (let k = 0; k <= 8; k++) { const u = k / 8; pts.push([x0 * (1 - u * 0.3) + Math.sin(ph + u * 7 + d * 0.5) * amp * (0.3 + u), 6 + u * len]); }
                const w = Math.max(3.5, (i % 3 === 0 ? 14 : 9) * rx / 210);
                press.knockout((g) => taper(g, pts, w, w * 0.55));
                taper(pink, pts, w, w * 0.55);
                if (i % 2 === 0) press.knockout((g) => taper(g, pts.slice(0, 6), w * 0.3, 0.6));
            }
            // the frilly oral arms under the bell: thick, short, white-veined
            for (let i = 0; i < 5; i++) {
                const x0 = -rx * 0.35 + (rx * 0.7 * i) / 4, len = h * (1.3 + r() * 0.8);
                const pts = [[x0, 0], [x0 + (r() - 0.5) * 20, len * 0.5], [x0 + (r() - 0.5) * 30, len]];
                press.knockout((g) => taper(g, pts, rx * 0.1, 3));
                taper(pink, pts, rx * 0.1, 3);
                press.knockout((g) => taper(g, pts, 2.5, 1));
            }
            // the bell: a dome, a scalloped rim
            const bell = (g) => {
                g.moveTo(-rx, 0);
                g.bezierCurveTo(-rx * 1.02, -h * 1.36, rx * 1.02, -h * 1.36, rx, 0);
                for (let k = 0; k < 9; k++) { const x1 = rx - ((k + 1) * 2 * rx) / 9, xm = (rx - (k * 2 * rx) / 9 + x1) / 2; g.quadraticCurveTo(xm, h * 0.1, x1, 0); }
                g.closePath();
            };
            press.knockout((g) => { g.beginPath(); bell(g); g.fill(); });
            clipped(pinkS, bell, (g) => { g.fillStyle = Riso.radial(g, 0, -h * 0.1, rx * 0.3, rx * 1.05, 0.2, 1); g.fillRect(-rx, -h * 1.2, rx * 2, h * 1.4); });
            clipped(pink, bell, (g) => { g.fillStyle = Riso.radial(g, 0, -h * 0.2, rx * 0.5, rx * 1.1, 0, 1); g.fillRect(-rx, -h * 1.2, rx * 2, h * 1.4); });
            // the glow: yellow sun with pink rays, low in the bell
            clipped(yellowS, bell, (g) => { g.fillStyle = Riso.radial(g, 0, -h * 0.12, 0, rx * 0.65, 1, 0); g.fillRect(-rx, -h * 1.2, rx * 2, h * 1.4); });
            clipped(yellow, bell, (g) => { g.fillStyle = T(1); g.beginPath(); g.ellipse(0, -h * 0.14, rx * 0.32, h * 0.3, 0, 0, 7); g.fill(); });
            clipped(pink, bell, (g) => { for (let k = 0; k < 11; k++) { const a = Math.PI + (k / 10) * Math.PI; taper(g, [[Math.cos(a) * rx * 0.1, -h * 0.12 + Math.sin(a) * h * 0.1], [Math.cos(a) * rx * 0.5, -h * 0.12 + Math.sin(a) * h * 0.55]], rx * 0.015, rx * 0.03, 0.9); } });
            // the white highlight top left, a white rim band
            press.knockout((g) => {
                g.beginPath(); g.ellipse(-rx * 0.45, -h * 0.72, rx * 0.2, h * 0.08, -0.5, 0, 7); g.fill();
                g.lineWidth = Math.max(2, rx * 0.02); g.beginPath(); g.moveTo(-rx * 0.92, -h * 0.06); g.quadraticCurveTo(0, h * 0.02, rx * 0.92, -h * 0.06); g.stroke();
            });
            press.restore();
        };
        jelly(815, 76, 42, 42, 0.05, 7, 150, 'd');
        jelly(930, 570, 68, 58, -0.02, 9, 240, 'c');
        jelly(555, 140, 212, 205, 0, 16, 760, 'a');
        jelly(220, 705, 112, 95, 0.28, 12, 420, 'b');
    });
};
