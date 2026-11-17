// The building's own side, in white: the cameras and the guard's beat as they are drafted,
// and what then moves by itself every frame (sectors, the guard, the clock).
(() => {
    const B = Bank, { px, py, sz, S, NORTH } = B, PI = Math.PI, rad = (d) => (d * PI) / 180;
    const m = (v) => v * S;
    Film.defences = (D) => {
        // cameras: a body on its bracket, named
        D.group('def.cams', { overlap: 0.2 });
        for (const c of B.CAMS) {
            const a = rad((c.a0 + c.a1) / 2), ux = Math.sin(a), uy = -Math.cos(a), x = px(c.x), y = py(c.y);
            const q = (f, s) => [x + ux * f - uy * s, y + uy * f + ux * s];
            D.fill([...q(-3.2, -1.9), ...q(1.6, -1.9), ...q(1.6, 1.9), ...q(-3.2, 1.9)], 0.95, 6);
            D.med().poly([...q(1.6, -1.2), ...q(4.2, -2.3), ...q(4.2, 2.3), ...q(1.6, 1.2)], true);
            if (c.name === 'CAM 2') D.fine().text(c.name, x + 8.5, y + 5.2, 3.8, { clear: true });
            else D.fine().text(c.name, x - 7.5, y + (c.y > 10 ? -7.5 : 9), 3.8, { align: 'right', clear: true });
        }
        // the guard's beat (rev. A): a dotted round with its arrows
        D.group('def.beat', { overlap: 0.1 }).pen(1.1, { dash: [0.6, 3.6], cap: 'round' }).poly(B.BEAT.map(([x, y]) => [px(x), py(y)]));
        for (const [x, y, a] of [[14, 6.5, PI], [3, 10.1, PI / 2], [10.5, B.SOUTH, 0], [23, B.SOUTH, 0], [29, 9.4, -PI / 2]]) Blueprint.arrow(D, px(x), py(y), a, 6.5);
        D.fine().text("GUARD'S BEAT", px(22.9), py(B.SOUTH - 0.3), 3.8, { align: 'center', track: 0.18 });
        // rev. B: across the hall and into the store, in its cloud, with its triangle
        D.group('rev.beat', { overlap: 0.1 }).pen(1.1, { dash: [0.6, 3.6], cap: 'round' }).poly(B.BEAT_B.slice(0, 4).map(([x, y]) => [px(x), py(y)]));
        for (const [x, y, a] of [[B.XS, 9.4, -PI / 2], [12.6, 6.5, PI]]) Blueprint.arrow(D, px(x), py(y), a, 6.5);
        D.group('rev.note', { overlap: 0.15 });
        const tx = px(B.XS + 1.5), ty = py(8.25), r = 6.2;
        D.med().poly([tx, ty - r, tx + r * 0.87, ty + r * 0.5, tx - r * 0.87, ty + r * 0.5], true).text('B', tx, ty + 2.9, 4.2, { align: 'center' });
        D.fine().text('BEAT CHANGED', tx + 9.5, ty + 2.4, 4, { track: 0.18 });
        // the clock's box
        D.group('ck.box', { overlap: 0.3 }).med().rect(110, 40, 124, 24).fine().line(142, 40, 142, 64).text('TIME', 126, 54.3, 3.6, { align: 'center', track: 0.2 });
    };

    // --- every frame, on the ink layer --------------------------------------------------------------
    // a camera's sector, as it looks at t; `on` 0..1 is how much of it has been drafted
    Film.sector = (g, c, t, on) => {
        if (on <= 0) return;
        const a = rad(B.camAngle(c, t)) - PI / 2, h = rad(c.half), x = px(c.x), y = py(c.y), R = m(c.reach) * Math.min(1, on * 1.6);
        g.save();
        g.beginPath(); g.rect(px(B.T), py(NORTH + B.P / 2), m(B.W - 2 * B.T), m(B.D - B.T - NORTH - B.P / 2)); g.clip(); // a camera sees the hall, not through its walls
        g.fillStyle = g.strokeStyle = '#fff';
        g.globalAlpha = 0.085 * on;
        g.beginPath(); g.moveTo(x, y); g.arc(x, y, R, a - h, a + h); g.closePath(); g.fill();
        g.globalAlpha = 0.8;
        g.lineWidth = 0.55;
        g.beginPath(); g.moveTo(x + Math.cos(a - h) * R, y + Math.sin(a - h) * R); g.lineTo(x, y); g.lineTo(x + Math.cos(a + h) * R, y + Math.sin(a + h) * R); g.stroke();
        g.setLineDash([2.2, 2.6]);
        g.beginPath(); g.arc(x, y, R, a - h, a + h * (2 * Math.max(0, Math.min(1, on * 2 - 1)) - 1)); g.stroke();
        g.restore();
    };
    // a person on a drawing: a small circle; white with a nose for the guard
    Film.token = (g, x, y, o = {}) => {
        const r = (o.r ?? 0.27) * S * (o.scale ?? 1);
        if (r <= 0.2) return;
        g.save();
        g.strokeStyle = g.fillStyle = '#fff';
        g.lineWidth = o.w ?? 1.05;
        if (o.hidden) g.setLineDash([2, 1.7]);
        g.beginPath(); g.arc(x, y, r, -PI / 2, -PI / 2 + PI * 2 * Math.min(1, o.on ?? 1)); g.stroke();
        g.setLineDash([]);
        if (o.nose != null && !o.hidden) { // which way he faces (an angle from north, clockwise)
            const a = o.nose - PI / 2, c = Math.cos(a), s = Math.sin(a);
            g.beginPath(); g.moveTo(x + c * (r + 4.2), y + s * (r + 4.2)); g.lineTo(x + c * (r + 0.6) - s * 2.3, y + s * (r + 0.6) + c * 2.3); g.lineTo(x + c * (r + 0.6) + s * 2.3, y + s * (r + 0.6) - c * 2.3); g.closePath(); g.fill();
        }
        if (o.label && (o.on ?? 1) >= 1) {
            g.font = Blueprint.fontFor(r * (o.cap ?? 1.05), o.font);
            g.textAlign = 'center';
            g.globalAlpha = o.hidden ? 0.75 : 1;
            g.fillText(o.label, x, y + r * (o.cap ?? 1.05) * 0.5);
        }
        g.restore();
    };
    Film.clock = (g, t, on) => {
        if (on <= 0) return;
        g.save();
        g.fillStyle = '#fff';
        g.globalAlpha = on;
        g.font = Blueprint.fontFor(10.5);
        g.letterSpacing = '1.3px';
        g.textAlign = 'left';
        g.fillText(B.clock(t), 148.5, 57.4);
        g.restore();
    };
})();
