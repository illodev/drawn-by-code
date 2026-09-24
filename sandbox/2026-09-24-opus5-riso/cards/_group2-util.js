// Helpers for the group-2 cards (turntable, frogs, bats, wave, cat, sunflower, radio).
// Cards are authored in reference pixels (the 1080 frame): G2.px(press, fn) scales every
// plate by 1/1.08 so the numbers read off the reference crops land 1:1. Global: G2.
var G2 = (() => {
    const T = (v) => Riso.tone(v);
    // run fn with every plate scaled to reference pixels (1080 → 1000 units)
    const px = (press, fn) => { press.save(); press.each((g) => g.scale(1 / 1.08, 1 / 1.08)); fn(); press.restore(); };
    const path = (g, pts) => { g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); };
    const poly = (g, pts, v = 1) => { g.fillStyle = T(v); path(g, pts); g.fill(); };
    const disc = (g, x, y, r, v = 1) => { g.fillStyle = T(v); g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); };
    const ell = (g, x, y, rx, ry, rot, v = 1) => { g.fillStyle = T(v); g.beginPath(); g.ellipse(x, y, rx, ry, rot, 0, 7); g.fill(); };
    const ringS = (g, x, y, r, w, v = 1, a0 = 0, a1 = 7) => { g.strokeStyle = T(v); g.lineWidth = w; g.beginPath(); g.arc(x, y, r, a0, a1); g.stroke(); };
    // fill a shape (built by shapeFn(g)) with a style made by styleFn(g)
    const fillWith = (g, shapeFn, style) => { g.save(); g.beginPath(); shapeFn(g); g.clip(); g.fillStyle = typeof style === 'function' ? style(g) : style; g.fillRect(-2000, -2000, 5000, 5000); g.restore(); };
    // clip g to a shape and draw inside it
    const inside = (g, shapeFn, draw) => { g.save(); g.beginPath(); shapeFn(g); g.clip(); draw(g); g.restore(); };
    // a smooth closed blob through points (quadratic midpoints)
    const blobPath = (g, pts) => {
        const n = pts.length, m = (i) => [(pts[i % n][0] + pts[(i + 1) % n][0]) / 2, (pts[i % n][1] + pts[(i + 1) % n][1]) / 2];
        g.moveTo(...m(0));
        for (let i = 1; i <= n; i++) g.quadraticCurveTo(pts[i % n][0], pts[i % n][1], ...m(i));
        g.closePath();
    };
    const blob = (g, pts, v = 1) => { g.fillStyle = T(v); g.beginPath(); blobPath(g, pts); g.fill(); };
    // a smooth open curve through points (stroke)
    const curve = (g, pts, w, v = 1) => {
        g.save(); g.strokeStyle = T(v); g.lineWidth = w; g.lineCap = 'round'; g.lineJoin = 'round';
        g.beginPath(); g.moveTo(...pts[0]);
        for (let i = 1; i < pts.length - 1; i++) g.quadraticCurveTo(pts[i][0], pts[i][1], (pts[i][0] + pts[i + 1][0]) / 2, (pts[i][1] + pts[i + 1][1]) / 2);
        g.lineTo(...pts[pts.length - 1]); g.stroke(); g.restore();
    };
    // a tapered brush stroke: thick in the middle, pointed at both ends
    const taper = (g, pts, w, v = 1) => {
        const L = [], R = [], n = pts.length;
        for (let i = 0; i < n; i++) {
            const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)];
            let dx = b[0] - a[0], dy = b[1] - a[1]; const l = Math.hypot(dx, dy) || 1; dx /= l; dy /= l;
            const k = Math.sin((i / (n - 1)) * Math.PI) * w / 2 + 0.3;
            L.push([pts[i][0] - dy * k, pts[i][1] + dx * k]); R.push([pts[i][0] + dy * k, pts[i][1] - dx * k]);
        }
        poly(g, L.concat(R.reverse()), v);
    };
    // resample a quadratic-through-points curve into n points (for tapers)
    const spline = (pts, n = 24) => {
        const out = [];
        for (let i = 0; i <= n; i++) {
            const u = (i / n) * (pts.length - 1), k = Math.min(pts.length - 2, Math.floor(u)), f = u - k;
            const p0 = pts[Math.max(0, k - 1)], p1 = pts[k], p2 = pts[k + 1], p3 = pts[Math.min(pts.length - 1, k + 2)];
            const c = (a, b, c2, d) => 0.5 * (2 * b + (-a + c2) * f + (2 * a - 5 * b + 4 * c2 - d) * f * f + (-a + 3 * b - 3 * c2 + d) * f * f * f);
            out.push([c(p0[0], p1[0], p2[0], p3[0]), c(p0[1], p1[1], p2[1], p3[1])]);
        }
        return out;
    };
    // speckles: small dots of ink scattered in a box (the print's dirt and texture)
    const speckle = (g, seed, x0, y0, x1, y1, n, r0, r1, v = 1) => {
        const r = Motion.rng('g2sp' + seed); g.fillStyle = T(v);
        for (let i = 0; i < n; i++) { g.beginPath(); g.arc(x0 + r() * (x1 - x0), y0 + r() * (y1 - y0), r0 + r() * (r1 - r0), 0, 7); g.fill(); }
    };
    // a wobbling circle path (hand-cut)
    const wob = (g, x, y, r, amt, seed, sq = 1) => {
        const rr = Motion.rng('g2w' + seed), p1 = rr() * 6.28, p2 = rr() * 6.28, n = 64;
        for (let i = 0; i <= n; i++) {
            const a = (i / n) * Math.PI * 2, k = r * (1 + amt * Math.sin(a * 3 + p1) + amt * 0.5 * Math.sin(a * 7 + p2));
            i ? g.lineTo(x + Math.cos(a) * k, y + Math.sin(a) * k * sq) : g.moveTo(x + Math.cos(a) * k, y + Math.sin(a) * k * sq);
        }
        g.closePath();
    };
    // sound arcs: n concentric arc strokes (knocked out or inked)
    const arcs = (g, x, y, r0, dr, n, a0, a1, w) => {
        g.save(); g.lineCap = 'round';
        for (let i = 0; i < n; i++) { g.lineWidth = w; g.beginPath(); g.arc(x, y, r0 + i * dr, a0, a1); g.stroke(); }
        g.restore();
    };
    // a tone that varies with the angle round (x, y): stops [[angle rad, tone], …] (any order)
    const conic = (g, x, y, stops) => {
        const TAU = Math.PI * 2, s = stops.map(([a, v]) => [((a % TAU) + TAU) % TAU / TAU, v]).sort((p, q) => p[0] - q[0]);
        const gr = g.createConicGradient(0, x, y);
        const first = s[0], last = s[s.length - 1], f = (1 - last[0]) / (1 - last[0] + first[0] || 1), v0 = last[1] + (first[1] - last[1]) * f;
        gr.addColorStop(0, T(v0));
        for (const [p, v] of s) gr.addColorStop(p, T(v));
        gr.addColorStop(1, T(v0));
        return gr;
    };
    // a hand-made halftone on a SOLID plate: dots on a grid (pitch in reference px, angle),
    // radius from tone(x, y) (area = tone). Draw the same dots with destination-out on the
    // ink underneath and they print clean (pink dots in navy stay pink, not maroon).
    const dots = (g, x0, y0, x1, y1, tone, o = {}) => {
        const p = o.pitch ?? 9.5, a = o.angle ?? 0.26, ca = Math.cos(a), sa = Math.sin(a);
        const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, R = Math.hypot(x1 - x0, y1 - y0) / 2 + p;
        g.fillStyle = '#000';
        g.beginPath();
        for (let v = -R; v <= R; v += p) for (let u = -R; u <= R; u += p) {
            const x = cx + u * ca - v * sa, y = cy + u * sa + v * ca;
            if (x < x0 - p || x > x1 + p || y < y0 - p || y > y1 + p) continue;
            const tv = tone(x, y);
            if (tv <= 0.01) continue;
            const r = Math.sqrt(Math.min(1, tv) / Math.PI) * p * 1.02;
            g.moveTo(x + r, y); g.arc(x, y, r, 0, 6.2832);
        }
        g.fill();
    };
    return { T, px, conic, dots, path, poly, disc, ell, ringS, fillWith, inside, blobPath, blob, curve, taper, spline, speckle, wob, arcs };
})();
