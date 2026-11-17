// The crew's side, in red pencil over the print: rings, dashed routes, notes in a quick hand.
// A second display list (painted on the kit's pencil layer); the three marks themselves are
// drawn every frame by the scene, from Bank.markAt.
(() => {
    const B = Bank, { px, py, sz, S } = B, PI = Math.PI, HAND = 'Hand';
    const m = (v) => v * S;
    // a ring drawn in one go: not quite round, and it overshoots where it closes
    const ring = (R, cx, cy, rx, ry, seed, start = -2.0) => {
        const rnd = Motion.rng(seed), pts = [], n = 14, over = 2 * PI * 1.08;
        const wob = [0, 1, 2, 3].map(() => (rnd() - 0.5) * 0.11);
        for (let i = 0; i <= n; i++) {
            const a = start + (over * i) / n, k = 1 + wob[0] * Math.cos(a) + wob[1] * Math.sin(a) + wob[2] * Math.cos(2 * a) + wob[3] * Math.sin(2 * a) + 0.05 * (i / n);
            pts.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]);
        }
        return R.pen(1.55, { cap: 'round' }).curve(pts);
    };
    // a route: straight runs with the corners eased, as a hand takes them
    const soft = (pts, r = 0.32) => {
        const out = [pts[0]];
        for (let i = 1; i < pts.length - 1; i++) {
            const a = pts[i - 1], b = pts[i], c = pts[i + 1], la = Math.hypot(b[0] - a[0], b[1] - a[1]), lc = Math.hypot(c[0] - b[0], c[1] - b[1]), k = Math.min(r, la / 2, lc / 2);
            const p = [b[0] + ((a[0] - b[0]) / la) * k, b[1] + ((a[1] - b[1]) / la) * k], q = [b[0] + ((c[0] - b[0]) / lc) * k, b[1] + ((c[1] - b[1]) / lc) * k];
            for (let j = 0; j <= 4; j++) { const u = j / 4; out.push([(1 - u) * (1 - u) * p[0] + 2 * u * (1 - u) * b[0] + u * u * q[0], (1 - u) * (1 - u) * p[1] + 2 * u * (1 - u) * b[1] + u * u * q[1]]); }
        }
        out.push(pts[pts.length - 1]);
        return out;
    };
    const route = (R, pts, plan = true) => {
        const P = soft(pts).map(([x, y]) => (plan ? [px(x), py(y)] : [px(x), sz(y)]));
        R.pen(1.5, { dash: [5.2, 3.6], cap: 'round' }).poly(P);
        // an open arrowhead at the end
        const [x1, y1] = P[P.length - 1], [x0, y0] = P[P.length - 3], a = Math.atan2(y1 - y0, x1 - x0);
        R.pen(1.5, { cap: 'round' }).poly([x1 - Math.cos(a - 0.5) * 6.5, y1 - Math.sin(a - 0.5) * 6.5, x1, y1, x1 - Math.cos(a + 0.5) * 6.5, y1 - Math.sin(a + 0.5) * 6.5]);
        return R;
    };
    const note = (R, s, x, y, cap = 7.6, o = {}) => R.text(s, x, y, cap, { font: HAND, bold: 0.045, track: 0.07, align: 'center', ...o });
    Film.ring = ring; Film.route = route; Film.note = note;

    Film.pencil = (R) => {
        // --- the plan (rev. A) ----------------------------------------------------------------
        R.group('r.in', { overlap: 0.3 });
        ring(R, px(0.25), py(12.5), m(0.95), m(0.95), 'in');
        note(R, 'IN', px(-0.5), py(11.22), 8.6);
        route(R.group('r.a', { overlap: 0.25 }), B.ROUTE.a);
        R.group('r.wait');
        note(R, 'WAIT', px(1.1), py(7.75), 7, { rot: -PI / 2 });
        route(R.group('r.b', { overlap: 0.25 }), B.ROUTE.b);
        R.group('r.gap');
        note(R, '5 s', px(5.4), py(5.74), 7.6);
        R.pen(1.3, { cap: 'round' }).line(px(1.75), py(5.6), px(1.75), py(5.85)).line(px(9.15), py(5.6), px(9.15), py(5.85));
        R.group('r.store');
        note(R, 'WAIT 12 s', px(8.85), py(3.42), 7.4);
        R.group('r.c', { overlap: 0.25 });
        note(R, 'NOW', px(11.05), py(6.02), 7.2);
        route(R, B.ROUTE.c);
        ring(R.group('r.stair'), px(26.5), py(2.75), m(2.25), m(2.45), 'stair', -1.2);
        // --- it goes wrong --------------------------------------------------------------------
        R.group('r.strike', { overlap: 0.4 }).pen(1.9, { cap: 'round' });
        R.curve([[px(13.3), py(5.72)], [px(13.95), py(6.3)], [px(14.75), py(6.86)]]).curve([[px(14.05), py(5.7)], [px(14.7), py(6.26)], [px(15.5), py(6.84)]]);
        note(R.group('r.q'), '?', px(11.7), py(8.05), 17, { bold: 0.06 });
        // --- the way out of the plan ------------------------------------------------------------
        R.group('r.duct', { overlap: 0.3 });
        ring(R, px(B.RISER[0]), py(B.RISER[1]), m(0.88), m(0.84), 'duct', -0.6);
        note(R, 'DOWN', px(11.32), py(3.3), 7.4);
        // --- below: the box, and the line they leave by ----------------------------------------
        const DC = B.STRONG, bx = DC.door + Film.BOX[0], bz = DC.cz - Film.BOX[1];
        R.group('r.box', { overlap: 0.3 });
        ring(R, px(bx), sz(bz), m(0.3), m(0.25), 'box', 0.4);
        R.group('r.num', { overlap: 0.3 }).pen(1.3, { cap: 'round' }).line(px(bx + 0.34), sz(bz + 0.1), px(DC.door + 1.52), sz(bz + 0.62));
        note(R, '0412', px(DC.door + 2.25), sz(bz + 0.56), 8.4);
        // the same box, in detail C, where it can be read
        const { x: cx, y: cy, k } = Film.DETAIL, ex = cx + Film.BOX[0] * k, ey = cy + Film.BOX[1] * k;
        R.group('r.boxC', { overlap: 0.3 });
        ring(R, ex, ey, 0.27 * k, 0.2 * k, 'boxC', 0.4);
        R.group('r.numC', { overlap: 0.3 }).pen(1.6, { cap: 'round' }).line(ex + 0.3 * k, ey + 0.05 * k, cx + 1.12 * k, cy + 0.5 * k);
        note(R, '0412', cx + 1.42 * k, cy + 0.56 * k, 12);
        R.group('r.away', { overlap: 0.25 });
        route(R, [[bx - 0.28, bz - 0.22], [16.5, B.Z.base + 0.92], [B.RISER[0], B.Z.base + 0.92], [B.RISER[0], B.Z.cowl + 0.25]], false);
        note(R, 'OUT', px(B.RISER[0] + 1.55), sz(B.Z.cowl - 0.05), 8.4);
        // --- and the last mark, beside the drawing's number ---------------------------------------
        const [tx, ty] = Film.TICK;
        R.group('r.tick').pen(2, { cap: 'round' }).poly([tx, ty - 3.5, tx + 3.6, ty + 1.2, tx + 11, ty - 9.5]);
    };
})();
