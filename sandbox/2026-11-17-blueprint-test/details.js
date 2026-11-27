// The rest of the sheet: the optic at 1:25, the plan at the gallery, the site plan, the
// scale bar and the title block.
(() => {
    const PI = Math.PI, { Y, H, r, M } = LH;

    // A first-order dioptric apparatus: Ø 1.84 m inside, 2.59 m tall. (x, y) is the top of
    // the crown; k is the scale (1 = 1:25, 56 px to the metre); small leaves out what would
    // close up at 1:100.
    Sheet.optic = (D, cx, y, k = 1, small = false) => {
        const R = 51.5 * k, hTop = 37 * k, hDrum = 81 * k, hLow = 15 * k, hBase = 12 * k;
        const y0 = y, y1 = y0 + hTop, y2 = y1 + hDrum, y3 = y2 + hLow, y4 = y3 + hBase;
        const cone = (yy) => 8 * k + (R - 8 * k) * Math.pow((yy - y0) / hTop, 0.82); // the upper prisms close in to the crown
        const half = (yy) => (yy < y1 ? cone(yy) : yy < y2 ? R : R - 2.5 * k * ((yy - y2) / hLow));
        // outline
        D.bold();
        for (const s of [-1, 1]) {
            const pts = [];
            for (let i = 0; i <= 10; i++) pts.push([cx + s * cone(y0 + (hTop * i) / 10), y0 + (hTop * i) / 10]);
            pts.push([cx + s * R, y2], [cx + s * (R - 2.5 * k), y3]);
            D.poly(pts);
        }
        D.med().line(cx - 8 * k, y0, cx + 8 * k, y0);
        if (small) {
            D.fine();
            for (const yy of [y1, y2, y3]) D.line(cx - half(yy - 0.01), yy, cx + half(yy - 0.01), yy);
            for (let i = 1; i < 4; i++) { const yy = y0 + (hTop * i) / 4; D.pen(0.7, { a: 0.7 }).line(cx - cone(yy), yy, cx + cone(yy), yy); }
            for (const e of [0.35, 0.7, 1]) D.pen(0.7, { a: 0.8 }).ellipse(cx, (y1 + y2) / 2, R * 0.62 * e, hDrum * 0.48 * e);
            for (const a of [-1, 1]) D.fine().line(cx + a * R * 0.383, y1, cx + a * R * 0.383, y3);
            return D;
        }
        // crown and finial
        D.med().rect(cx - 5 * k, y0 - 7 * k, 10 * k, 7 * k); D.line(cx, y0 - 7 * k, cx, y0 - 13 * k); D.circle(cx, y0 - 14.5 * k, 1.6 * k);
        // upper catadioptric prisms: rings, closer together towards the crown
        D.fine();
        for (let i = 1; i <= 9; i++) { const yy = y0 + hTop * Math.pow(i / 9.6, 0.9); D.line(cx - cone(yy), yy, cx + cone(yy), yy); if (i < 9) D.pen(0.7, { a: 0.6 }).line(cx - cone(yy + 1.6) + 1, yy + 1.6, cx + cone(yy + 1.6) - 1, yy + 1.6).fine(); }
        // the bullseye of the panel that faces us, and the edges of its neighbours
        const cy = (y1 + y2) / 2, bx = R * 0.6, by = hDrum * 0.47;
        for (let i = 1; i <= 10; i++) { const e = Math.pow(i / 10, 0.85); D.pen(i === 10 ? 1.2 : 0.85, { a: i === 10 ? 1 : 0.9 }).ellipse(cx, cy, bx * e, by * e); }
        D.dot(cx, cy, 1.4 * k);
        for (const s of [-1, 1]) for (let i = 6; i <= 10; i++) {
            const e = Math.pow(i / 10, 0.85), ex = cx + s * R * 0.707, rx = bx * e * 0.5, ry = by * e, lim = Math.acos(Math.max(-1, Math.min(1, (R * 0.293) / rx)));
            if (rx > R * 0.293) D.pen(0.8, { a: 0.75 }).ellipse(ex, cy, rx, ry, s > 0 ? lim : PI + lim, s > 0 ? 2 * PI - lim : 3 * PI - lim); else D.pen(0.8, { a: 0.75 }).ellipse(ex, cy, rx, ry);
        }
        // the refracting belt outside the bullseyes: rings from edge to edge, broken by them
        D.pen(0.8, { a: 0.85 });
        for (let yy = y1 + 3.2 * k; yy < y2 - 1; yy += 3.25 * k) {
            const t = (yy - cy) / by, w = Math.abs(t) < 1 ? bx * Math.sqrt(1 - t * t) : 0, ts = (yy - cy) / by, ws = Math.abs(ts) < 1 ? bx * 0.5 * Math.sqrt(1 - ts * ts) : 0;
            const a = cx - R * 0.707 + ws, b = cx - w;
            if (b - a > 1.5) { D.line(a, yy, b, yy); D.line(2 * cx - b, yy, 2 * cx - a, yy); }
            if (!ws) D.line(cx - R, yy, cx + R, yy);
        }
        D.med().line(cx - R, y1, cx + R, y1); D.line(cx - R, y2, cx + R, y2);
        // lower prisms and the gunmetal standards between the panels (8 panels: ±22.5°, ±67.5°)
        D.fine();
        for (let i = 1; i <= 3; i++) { const yy = y2 + (hLow * i) / 4; D.line(cx - half(yy), yy, cx + half(yy), yy); }
        for (const a of [-67.5, -22.5, 22.5, 67.5]) {
            const s = Math.sin((a * PI) / 180), w = 1.3 * k * Math.cos((a * PI) / 180) + 0.5;
            for (const o of [-w, w]) { const pts = []; for (let i = 0; i <= 8; i++) { const yy = y0 + (hTop * i) / 8; pts.push([cx + cone(yy) * s + o, yy]); } pts.push([cx + R * s + o, y2], [cx + (R - 2.5 * k) * s + o, y3]); D.med().poly(pts); }
        }
        // the base: two mouldings and the table it turns on
        D.med().rect(cx - R + 1 * k, y3, 2 * R - 2 * k, 3.4 * k); D.rect(cx - R - 1.5 * k, y3 + 3.4 * k, 2 * R + 3 * k, 3 * k); D.rect(cx - R + 2 * k, y3 + 6.4 * k, 2 * R - 4 * k, 5.6 * k);
        for (const a of [-67.5, -22.5, 22.5, 67.5]) { const x = cx + (R - 2) * k * Math.sin((a * PI) / 180); D.fine().line(x, y3 + 6.4 * k, x, y4); }
        D.bold().rect(cx - R + 1.2 * k, y4, 2 * R - 2.4 * k, 11.5 * k);
        D.fine().line(cx - R + 1.2 * k, y4 + 3 * k, cx + R - 1.2 * k, y4 + 3 * k);
        return D;
    };

    Sheet.parts.push('opticSheet');
    Sheet.opticSheet = (D) => {
        const cx = 1176, y0 = 72, yb = y0 + 145;
        D.group('op.axis').centre().line(cx, 48, cx, 246);
        D.group('op.lens', { overlap: 0.06 });
        Sheet.optic(D, cx, y0, 1);
        D.group('op.dims', { overlap: 0.2 }).fine();
        D.line(1088, y0, cx - 12, y0); D.line(1088, yb, cx - 54, yb);
        Blueprint.dimV(D, 1096, y0, yb, { label: '2.590', side: -1, at: 0.52 });
        D.fine().line(cx - 51.5, yb + 14, cx - 51.5, 264); D.line(cx + 51.5, yb + 14, cx + 51.5, 264);
        Blueprint.dimH(D, 257, cx - 51.5, cx + 51.5, { label: 'Ø 1.840' });
        // the focal plane
        D.centre().line(cx - 66, (y0 + 37 + y0 + 118) / 2, cx + 74, (y0 + 37 + y0 + 118) / 2);
        D.text('F.P.', cx + 61, (y0 + 37 + y0 + 118) / 2 - 3.5, 5.6);
        Blueprint.title(D.group('op.title'), 1173, 286, 'OPTIC DETAIL', 'SCALE 1:25');
    };

    Sheet.parts.push('plan');
    Sheet.plan = (D) => {
        const cx = 1176, cy = 399;
        D.group('pl.axis', { overlap: 0.3 }).centre().line(cx - 65, cy, cx + 65, cy).line(cx, cy - 66, cx, cy + 66);
        D.group('pl.circles', { overlap: 0.25 });
        D.bold().circle(cx, cy, 46.55); D.fine().circle(cx, cy, 45); D.med().circle(cx, cy, 33.5); D.circle(cx, cy, 29.5);
        D.hidden().circle(cx, cy, LH.WELL - 4); D.med().circle(cx, cy, 12.9); D.fine().circle(cx, cy, 4.5);
        D.group('pl.detail', { overlap: 0.1 });
        for (let k = 0; k < 24; k++) { const a = (k * PI) / 12; D.dot(cx + 45.2 * Math.cos(a), cy + 45.2 * Math.sin(a), 0.95); }
        for (let k = 0; k < 16; k++) { const a = (k * PI) / 8 + PI / 16; D.fine().line(cx + 29.5 * Math.cos(a), cy + 29.5 * Math.sin(a), cx + 33.5 * Math.cos(a), cy + 33.5 * Math.sin(a)); }
        for (let k = 0; k < 8; k++) { const a = (k * PI) / 4 + PI / 8; D.pen(0.8, { a: 0.75 }).line(cx + 4.5 * Math.cos(a), cy + 4.5 * Math.sin(a), cx + 12.9 * Math.cos(a), cy + 12.9 * Math.sin(a)); }
        for (const a of [PI / 4, (3 * PI) / 4]) D.fine().line(cx - 57 * Math.cos(a), cy - 57 * Math.sin(a), cx + 57 * Math.cos(a), cy + 57 * Math.sin(a));
        // the deck's plates
        for (let k = 0; k < 12; k++) { const a = (k * PI) / 6 + PI / 12; D.pen(0.75, { a: 0.55 }).line(cx + 33.5 * Math.cos(a), cy + 33.5 * Math.sin(a), cx + 45 * Math.cos(a), cy + 45 * Math.sin(a)); }
        D.group('pl.dims', { overlap: 0.3 }).fine();
        const c = Math.SQRT1_2;
        Blueprint.arrow(D, cx - 46.5 * c, cy - 46.5 * c, PI / 4); Blueprint.arrow(D, cx + 46.5 * c, cy + 46.5 * c, PI + PI / 4);
        D.fine().poly([cx - 46.5 * c - 7, cy - 46.5 * c - 7, 1136, 349, 1099, 349]);
        D.text('Ø ' + LH.fig((46.55 * 2) / M), 1099, 345, 7);
        Blueprint.title(D.group('pl.title'), 1177, 479.5, 'PLAN AT GALLERY', 'SCALE 1:100');
    };

    Sheet.parts.push('site');
    Sheet.site = (D) => {
        D.group('si.coast', { overlap: 0.03 });
        const dash = (s) => s.length === 5 && Math.hypot(s[3] - s[1], s[4] - s[2]) < 11 && (Math.abs(s[3] - s[1]) < 1.2 || Math.abs(s[4] - s[2]) < 1.2);
        Sheet.freehand(D, Sheet.TRACE.coast.filter((s) => !dash(s)));
        D.group('si.lines', { overlap: 0.3 }).hidden().rect(116, 91, 129, 96);
        D.centre().line(116, 148, 245, 148);
        D.fine().circle(173, 117, 7.5, 0, PI * 2);
        // north point
        const nx = 81, ny = 73;
        D.group('si.north', { overlap: 0.2 }).med().circle(nx, ny, 15.5);
        for (let k = 0; k < 4; k++) {
            const a = (k * PI) / 2, c = Math.cos(a), s = Math.sin(a), L = k % 2 ? 25 : 27;
            D.fill([nx + c * L, ny + s * L, nx - s * 2.6, ny + c * 2.6, nx + s * 2.6, ny - c * 2.6], 0.9, 6);
            const d = a + PI / 4; D.fine().line(nx + Math.cos(d) * 4, ny + Math.sin(d) * 4, nx + Math.cos(d) * 19.5, ny + Math.sin(d) * 19.5);
        }
        D.text('N', nx, ny - 31, 6.2, { align: 'center' }); D.text('S', nx, ny + 39, 6.2, { align: 'center' });
        D.text('E', nx + 34, ny + 3.1, 6.2); D.text('W', nx - 35, ny + 3.1, 6.2, { align: 'right' });
        D.group('si.title');
        D.text('BLACKRIDGE', 61, 144, 6.6, { align: 'center', track: 0.2 }); D.text('HEADLAND', 60, 156, 6.6, { align: 'center', track: 0.2 });
        Blueprint.title(D, 123, 235, 'SITE PLAN', 'SCALE 1:2500');
    };

    Sheet.parts.push('bar');
    Sheet.bar = (D) => {
        const x0 = 456, y = 681, m = M;
        D.group('sb.bar', { overlap: 0.15 }).med();
        D.line(x0, y, x0 + 25 * m, y); D.line(x0, y + 3.6, x0 + 25 * m, y + 3.6);
        for (let i = 0; i <= 25; i++) if (i <= 5 || i % 5 === 0) D.line(x0 + i * m, i % 5 ? y - 2.5 : y - 6.5, x0 + i * m, y + 3.6);
        for (const [a, b] of [[0, 1], [2, 3], [4, 5], [10, 15], [20, 25]]) D.fill([x0 + a * m, y, x0 + b * m, y, x0 + b * m, y + 3.6, x0 + a * m, y + 3.6], 0.9, 8);
        for (let i = 0; i <= 25; i += 5) D.text(String(i), x0 + i * m, y - 9.5, 6.6, { align: 'center' });
        D.text('SCALE  1:100', x0, y + 16, 6.2); D.text('METRES', x0 + 25 * m, y + 16, 6.2, { align: 'right' });
    };

    Sheet.parts.push('block');
    Sheet.block = (D) => {
        const x0 = 1017, x1 = 1272, xm = 1144.5, ys = [549, 574, 596, 619, 643, 667, 696];
        D.group('tb.frame', { overlap: 0.3 }).bold().rect(x0, ys[0], x1 - x0, ys[6] - ys[0]);
        D.med(); for (const y of ys.slice(1, 6)) D.line(x0, y, x1, y);
        D.line(xm, ys[3], xm, ys[5]);
        D.group('tb.text', { overlap: 0.08 });
        D.text('NORTHPOINT LIGHTHOUSE', xm, 567.5, 10.6, { align: 'center', track: 0.14 });
        D.text('BLACKRIDGE HEADLAND', xm, 589.5, 8.6, { align: 'center', track: 0.14 });
        D.text('GENERAL ARRANGEMENT', xm, 612, 8.6, { align: 'center', track: 0.14 });
        D.text('DRG NO.', 1026, 635, 6.4); D.text('NP-001', 1080, 635, 7); D.text('REV.', 1153, 635, 6.4); D.text('A', 1193, 635, 7);
        D.text('SCALE', 1026, 659, 6.4); D.text('AS SHOWN', 1078, 659, 7); D.text('DATE', 1153, 659, 6.4); D.text('17 NOV 2026', 1192, 659, 7);
        D.text('ILLODEV x CLAUDE', xm, 685.5, 7, { align: 'center', track: 0.2 });
    };
})();
