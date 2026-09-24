// Helpers for the group-5 cards (volcano, shell, dish, train, campfire, chimes, field).
// Global: G5. Plain canvas path helpers used on the riso plates (logical 1000 × 1000 units).
var G5 = G5 || (() => {
    // trace a polyline (closed by default) into the current path
    const trace = (g, pts, close = true) => {
        pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
        if (close) g.closePath();
    };
    // a smooth closed (or open) curve through the points (Catmull-Rom → Bezier)
    const smooth = (g, pts, close = true) => {
        const n = pts.length, P = (i) => pts[close ? (i + n) % n : Math.max(0, Math.min(n - 1, i))];
        g.moveTo(pts[0][0], pts[0][1]);
        const last = close ? n : n - 1;
        for (let i = 0; i < last; i++) {
            const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2);
            g.bezierCurveTo(p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6, p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6, p2[0], p2[1]);
        }
        if (close) g.closePath();
    };
    // fill a polygon / smooth shape on a plate with a fill style
    const fill = (g, pts, style, sm = false) => { g.fillStyle = style; g.beginPath(); (sm ? smooth : trace)(g, pts); g.fill(); };
    const stroke = (g, pts, w, style, sm = false, close = false) => {
        g.save(); g.lineWidth = w; g.lineCap = 'round'; g.lineJoin = 'round'; g.strokeStyle = style;
        g.beginPath(); (sm ? smooth : trace)(g, pts, close); g.stroke(); g.restore();
    };
    // run fn(g) with g clipped to a shape (pts, smooth?)
    const clipped = (g, pts, sm, fn) => { g.save(); g.beginPath(); (sm ? smooth : trace)(g, pts); g.clip(); fn(g); g.restore(); };
    // a soft-edged radial blob of tone (for glows on screen plates)
    const glow = (g, x, y, r, t0, t1 = 0, sx = 1, sy = 1) => {
        g.save(); g.translate(x, y); g.scale(sx, sy);
        const gr = g.createRadialGradient(0, 0, 0, 0, 0, r);
        gr.addColorStop(0, Riso.tone(t0)); gr.addColorStop(1, Riso.tone(t1));
        g.fillStyle = gr; g.beginPath(); g.arc(0, 0, r, 0, 7); g.fill(); g.restore();
    };
    // speckles: n small dots scattered in a box (deterministic), for stars, sparks, sand
    const speckle = (g, seed, n, x0, y0, x1, y1, r0, r1, style) => {
        const r = Motion.rng('g5s' + seed);
        g.fillStyle = style;
        for (let i = 0; i < n; i++) {
            const x = x0 + r() * (x1 - x0), y = y0 + r() * (y1 - y0), rad = r0 + r() * (r1 - r0);
            g.beginPath(); g.arc(x, y, rad, 0, 7); g.fill();
        }
    };
    // a closed wobbly blob round a centre (radius function with a few harmonics)
    const blob = (cx, cy, rx, ry, seed, wob = 0.08, n = 40, rot = 0) => {
        const r = Motion.rng('g5b' + seed), ph = [r() * 6.28, r() * 6.28, r() * 6.28];
        const pts = [];
        for (let i = 0; i < n; i++) {
            const a = (i / n) * Math.PI * 2;
            const k = 1 + wob * (Math.sin(a * 2 + ph[0]) * 0.5 + Math.sin(a * 3 + ph[1]) * 0.35 + Math.sin(a * 5 + ph[2]) * 0.2);
            const x = Math.cos(a) * rx * k, y = Math.sin(a) * ry * k;
            pts.push([cx + x * Math.cos(rot) - y * Math.sin(rot), cy + x * Math.sin(rot) + y * Math.cos(rot)]);
        }
        return pts;
    };
    // draw fn() in reference pixels (the 1080 px frame the cards were measured on) on every plate
    const px = (press, fn) => { press.save(); press.each((g) => g.scale(1000 / 1080, 1000 / 1080)); fn(); press.restore(); };
    // a stroke that is a wide ink band with a narrower core on other plates: a lava river, a
    // lit edge. layers: [[plate, width, tone], …] drawn in order, all along the same path
    const band = (pts, layers, sm = true) => { for (const [g, w, v] of layers) stroke(g, pts, w, Riso.tone(v), sm); };
    // remove ink along a path on the given plates (a narrower core)
    const erase = (plates, pts, w, sm = true) => { for (const g of plates) { g.save(); g.globalCompositeOperation = 'destination-out'; stroke(g, pts, w, '#000', sm); g.restore(); } };
    return { trace, smooth, fill, stroke, clipped, glow, speckle, blob, px, band, erase };
})();
