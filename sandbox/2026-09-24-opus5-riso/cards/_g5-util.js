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
    // a painted brush stroke: a filled outline along a smooth path whose half-width runs
    // w(s) (s 0..1 along the path; a number = constant, [w0, w1] = taper, or a function),
    // swelling a little by hand. Never a stroked line.
    const brush = (g, pts, w, style, seed = 0, o = {}) => {
        const n = o.n ?? 48, r = Motion.rng('g5br' + seed), ph = r() * 6.28, wob = o.wob ?? 0.18;
        const P = pts.length, Q = (i) => pts[Math.max(0, Math.min(P - 1, i))];
        const cr = (s) => { // Catmull-Rom point at s
            const f = s * (P - 1), i = Math.min(P - 2, Math.floor(f)), u = f - i, p0 = Q(i - 1), p1 = Q(i), p2 = Q(i + 1), p3 = Q(i + 2);
            const k = (a, b, c, d) => 0.5 * (2 * b + (-a + c) * u + (2 * a - 5 * b + 4 * c - d) * u * u + (-a + 3 * b - 3 * c + d) * u * u * u);
            return [k(p0[0], p1[0], p2[0], p3[0]), k(p0[1], p1[1], p2[1], p3[1])];
        };
        const wf = typeof w === 'function' ? w : Array.isArray(w) ? (s) => w[0] + (w[1] - w[0]) * s : () => w;
        const cap = o.taper ?? 0.12, L = [], R = [];
        for (let i = 0; i <= n; i++) {
            const s = i / n, [x, y] = cr(s), [xa, ya] = cr(Math.max(0, s - 0.01)), [xb, yb] = cr(Math.min(1, s + 0.01));
            let dx = xb - xa, dy = yb - ya; const l = Math.hypot(dx, dy) || 1; dx /= l; dy /= l;
            const end = Math.min(1, Math.min(s, 1 - s) / cap);
            const hw = (wf(s) / 2) * (1 + wob * Math.sin(s * 9 + ph)) * (cap > 0 ? Math.sqrt(end) : 1);
            L.push([x - dy * hw, y + dx * hw]); R.push([x + dy * hw, y - dx * hw]);
        }
        g.fillStyle = style; g.beginPath(); trace(g, L.concat(R.reverse())); g.fill();
    };
    // run fn(g) with a canvas blur filter (soft tone edges: shading, glows)
    const soft = (g, px, fn) => { g.save(); g.filter = `blur(${px}px)`; fn(g); g.restore(); };
    // parallel hand lines (wood grain, rain, hatching) across a box, direction (dx, dy)
    const hatch = (g, seed, box, dir, gap, w, style, o = {}) => {
        const r = Motion.rng('g5h' + seed), [x0, y0, x1, y1] = box, [dx, dy] = dir, l = Math.hypot(dx, dy), ux = dx / l, uy = dy / l;
        const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, R2 = Math.hypot(x1 - x0, y1 - y0) / 2;
        for (let s = -R2; s < R2; s += gap * (0.7 + 0.6 * r())) {
            const ox = cx - uy * s, oy = cy + ux * s, len = R2 * (o.len ?? 1) * (0.6 + 0.4 * r()), off = (r() - 0.5) * R2 * 0.6, bend = (r() - 0.5) * (o.bend ?? 6);
            const pts = [];
            for (let k = 0; k <= 4; k++) { const u = -len + (2 * len * k) / 4 + off; pts.push([ox + ux * u - uy * bend * Math.sin(k * 0.8), oy + uy * u + ux * bend * Math.sin(k * 0.8)]); }
            brush(g, pts, w * (0.6 + 0.8 * r()), style, seed + ':' + s, { n: 16, wob: 0.3, taper: 0.3 });
        }
    };
    // soft blotches of tone (uneven ground, clouds of shade): n blobs in a box
    const blotch = (g, seed, box, n, r0, r1, t0, t1) => {
        const r = Motion.rng('g5m' + seed), [x0, y0, x1, y1] = box;
        for (let i = 0; i < n; i++) {
            const x = x0 + r() * (x1 - x0), y = y0 + r() * (y1 - y0), rad = r0 + r() * (r1 - r0), v = t0 + r() * (t1 - t0);
            const gr = g.createRadialGradient(x, y, 0, x, y, rad);
            gr.addColorStop(0, Riso.tone(v)); gr.addColorStop(1, Riso.tone(0));
            g.fillStyle = gr; g.beginPath(); g.arc(x, y, rad, 0, 7); g.fill();
        }
    };
    // knock a shape out of the given plates only (a partial knockout)
    const cut = (plates, fn) => { for (const g of plates) { g.save(); g.globalCompositeOperation = 'destination-out'; g.fillStyle = '#000'; g.strokeStyle = '#000'; fn(g); g.restore(); } };
    // paint fn(g) on several plates, each with its own tone: [[plate, tone], …]
    const inks = (list, fn) => { for (const [g, v] of list) { g.save(); g.fillStyle = Riso.tone(v); g.strokeStyle = Riso.tone(v); fn(g, v); g.restore(); } };
    return { trace, smooth, fill, stroke, clipped, glow, speckle, blob, px, band, erase, brush, soft, hatch, blotch, cut, inks };
})();
