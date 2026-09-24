// Helpers for the group-4 cards (piano, rocket, city, planet, lightning, balloons, cello).
// Global: G4. Everything draws on riso plates in the 1000 × 1000 card units.
var G4 = (() => {
    const T = (v) => Riso.tone(v);
    const fillOf = (v) => (typeof v === 'number' ? T(v) : v);
    // a closed polygon path (no fill)
    function path(g, pts) {
        g.beginPath();
        pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
        g.closePath();
    }
    // a smooth path through points (Catmull-Rom as béziers); closed or open
    function smooth(g, pts, closed = true, begin = true) {
        const n = pts.length;
        if (begin) g.beginPath();
        const P = (i) => (closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))]);
        g.moveTo(pts[0][0], pts[0][1]);
        const last = closed ? n : n - 1;
        for (let i = 0; i < last; i++) {
            const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2);
            g.bezierCurveTo(p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6, p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6, p2[0], p2[1]);
        }
        if (closed) g.closePath();
    }
    function poly(g, pts, v) { g.fillStyle = fillOf(v); path(g, pts); g.fill(); }
    function blob(g, pts, v) { g.fillStyle = fillOf(v); smooth(g, pts, true); g.fill(); }
    function sline(g, pts, w, v = 1, cap = 'round') {
        g.save();
        g.strokeStyle = fillOf(v); g.lineWidth = w; g.lineCap = cap; g.lineJoin = 'round';
        smooth(g, pts, false); g.stroke();
        g.restore();
    }
    function seg(g, pts, w, v = 1, cap = 'round') {
        g.save();
        g.strokeStyle = fillOf(v); g.lineWidth = w; g.lineCap = cap; g.lineJoin = 'round';
        g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke();
        g.restore();
    }
    function disc(g, x, y, r, v = 1) { g.fillStyle = fillOf(v); g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); }
    function ell(g, x, y, rx, ry, rot, v = 1) { g.fillStyle = fillOf(v); g.beginPath(); g.ellipse(x, y, rx, ry, rot, 0, 7); g.fill(); }
    // draw fn(g) clipped to a shape built by shape(g) (no beginPath needed)
    function clip(g, shape, fn) { g.save(); g.beginPath(); shape(g); g.clip(); fn(g); g.restore(); }
    // run fn(g) on several plates
    const on = (plates, fn) => plates.forEach((g) => fn(g));
    // a soft knock-out on some plates: a gradient of erasing (fn gets g, sets its own fill)
    function erase(plates, fn) { for (const g of plates) { g.save(); g.globalCompositeOperation = 'destination-out'; fn(g); g.restore(); } }
    // paper speckles (dust knocked out of every plate): n tiny dots in a box
    function speckle(press, seed, n, box = [0, 0, 1000, 1000], r0 = 0.9, r1 = 2.2) {
        const r = Motion.rng('g4sp' + seed);
        const pts = [];
        for (let i = 0; i < n; i++) pts.push([box[0] + r() * (box[2] - box[0]), box[1] + r() * (box[3] - box[1]), r0 + r() * (r1 - r0)]);
        press.knockout((g) => { g.beginPath(); for (const [x, y, rr] of pts) { g.moveTo(x + rr, y); g.arc(x, y, rr, 0, 7); } g.fill(); });
    }
    // coloured specks on one plate (stray ink)
    function specks(g, seed, n, box = [0, 0, 1000, 1000], r0 = 1, r1 = 2.4, v = 1) {
        const r = Motion.rng('g4sk' + seed);
        g.fillStyle = fillOf(v);
        g.beginPath();
        for (let i = 0; i < n; i++) { const x = box[0] + r() * (box[2] - box[0]), y = box[1] + r() * (box[3] - box[1]), rr = r0 + r() * (r1 - r0); g.moveTo(x + rr, y); g.arc(x, y, rr, 0, 7); }
        g.fill();
    }
    // a coarse hand-made halftone (a bigger screen than the press's): dots on a rotated grid,
    // radius from tone(x, y) 0..1, drawn flat on a solid plate
    function dots(g, box, pitch, angle, tone, v = 1) {
        const ca = Math.cos(angle), sa = Math.sin(angle);
        const [x0, y0, x1, y1] = box, cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, R = Math.hypot(x1 - x0, y1 - y0) / 2 + pitch;
        g.fillStyle = fillOf(v);
        g.beginPath();
        for (let u = -R; u <= R; u += pitch) for (let w = -R; w <= R; w += pitch) {
            const x = cx + u * ca - w * sa, y = cy + u * sa + w * ca;
            if (x < x0 - pitch || x > x1 + pitch || y < y0 - pitch || y > y1 + pitch) continue;
            const tv = tone(x, y);
            if (tv <= 0.01) continue;
            const r = pitch * Math.sqrt(Math.min(1, tv) / Math.PI);
            g.moveTo(x + r, y);
            g.arc(x, y, r, 0, 7);
        }
        g.fill();
    }
    // a gradient fill between stops [[offset, tone], …] along a line
    function lin(g, x0, y0, x1, y1, stops) { const gr = g.createLinearGradient(x0, y0, x1, y1); for (const [o, v] of stops) gr.addColorStop(o, T(v)); return gr; }
    function rad(g, x, y, r0, r1, stops) { const gr = g.createRadialGradient(x, y, r0, x, y, r1); for (const [o, v] of stops) gr.addColorStop(o, T(v)); return gr; }
    // a jagged polyline (lightning, cracks): deterministic jitter along a path
    function jag(pts, seed, amp, step) {
        const r = Motion.rng('g4jag' + seed), out = [pts[0]];
        for (let i = 1; i < pts.length; i++) {
            const [ax, ay] = pts[i - 1], [bx, by] = pts[i], L = Math.hypot(bx - ax, by - ay), n = Math.max(1, Math.round(L / step));
            const nx = -(by - ay) / L, ny = (bx - ax) / L;
            for (let k = 1; k <= n; k++) { const f = k / n, o = k === n ? 0 : (r() - 0.5) * 2 * amp; out.push([ax + (bx - ax) * f + nx * o, ay + (by - ay) * f + ny * o]); }
        }
        return out;
    }
    return { T, path, smooth, poly, blob, sline, seg, disc, ell, clip, on, erase, speckle, specks, dots, lin, rad, jag };
})();
