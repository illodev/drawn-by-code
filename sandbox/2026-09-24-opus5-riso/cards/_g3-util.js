// Helpers for the group-3 cards (fireworks, hummingbird, kettle, ferris, waterfall, bicycle,
// whale): paths, organic shapes and clipped fills on riso plates. Global: G3.
var G3 = (() => {
    const T = (v) => Riso.tone(v);
    // a polygon path (no fill)
    const path = (g, pts, close = true) => {
        g.beginPath();
        pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
        if (close) g.closePath();
    };
    // a smooth closed (or open) curve through points: Catmull-Rom as Béziers
    const smooth = (g, pts, close = true, begin = true) => {
        const n = pts.length, P = (i) => (close ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))]);
        if (begin) g.beginPath();
        g.moveTo(pts[0][0], pts[0][1]);
        const m = close ? n : n - 1;
        for (let i = 0; i < m; i++) {
            const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2);
            g.bezierCurveTo(p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6, p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6, p2[0], p2[1]);
        }
        if (close) g.closePath();
    };
    // fill a polygon / smooth shape with a tone (or a gradient)
    const poly = (g, pts, v = 1) => { g.fillStyle = typeof v === 'number' ? T(v) : v; path(g, pts); g.fill(); };
    const blobFill = (g, pts, v = 1) => { g.fillStyle = typeof v === 'number' ? T(v) : v; smooth(g, pts); g.fill(); };
    // run fn(g) with g clipped to a shape built by shape(g)
    const inside = (g, shape, fn) => { g.save(); g.beginPath(); shape(g); g.clip(); fn(g); g.restore(); };
    // an organic closed outline round an ellipse: n points with a seeded wobble
    const blob = (cx, cy, rx, ry, seed, wob = 0.12, n = 12, rot = 0) => {
        const r = Motion.rng('g3b' + seed), out = [];
        for (let i = 0; i < n; i++) {
            const a = (i / n) * Math.PI * 2, k = 1 + (r() - 0.5) * 2 * wob;
            const x = Math.cos(a) * rx * k, y = Math.sin(a) * ry * k;
            out.push([cx + x * Math.cos(rot) - y * Math.sin(rot), cy + x * Math.sin(rot) + y * Math.cos(rot)]);
        }
        return out;
    };
    // a leaf: a pointed almond from base (x, y) along angle a, length len, half-width w, bend
    const leaf = (g, x, y, a, len, w, bend = 0) => {
        const c = Math.cos(a), s = Math.sin(a), P = (u, v) => [x + c * u - s * v, y + s * u + c * v];
        const tip = P(len, bend * len), l1 = P(len * 0.35, -w), l2 = P(len * 0.75, -w * 0.7 + bend * len * 0.5), r1 = P(len * 0.35, w), r2 = P(len * 0.75, w * 0.7 + bend * len * 0.5);
        g.moveTo(x, y);
        g.bezierCurveTo(l1[0], l1[1], l2[0], l2[1], tip[0], tip[1]);
        g.bezierCurveTo(r2[0], r2[1], r1[0], r1[1], x, y);
    };
    // a tapered stroke from p0 to p1: width w0 at the start, w1 at the end (a filled quad + caps)
    const taper = (g, x0, y0, x1, y1, w0, w1, caps = true) => {
        const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
        g.beginPath();
        g.moveTo(x0 + nx * w0 / 2, y0 + ny * w0 / 2);
        g.lineTo(x1 + nx * w1 / 2, y1 + ny * w1 / 2);
        g.lineTo(x1 - nx * w1 / 2, y1 - ny * w1 / 2);
        g.lineTo(x0 - nx * w0 / 2, y0 - ny * w0 / 2);
        g.closePath();
        g.fill();
        if (caps) { g.beginPath(); g.arc(x1, y1, w1 / 2, 0, 7); g.fill(); }
    };
    const stroke = (g, pts, w, v = 1, smoothIt = false) => {
        g.save();
        g.lineWidth = w; g.lineCap = 'round'; g.lineJoin = 'round'; g.strokeStyle = T(v);
        if (smoothIt) smooth(g, pts, false); else path(g, pts, false);
        g.stroke();
        g.restore();
    };
    const disc = (g, x, y, r, v = 1) => { g.fillStyle = T(v); g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); };
    const ell = (g, x, y, rx, ry, rot = 0, v = 1) => { g.fillStyle = T(v); g.beginPath(); g.ellipse(x, y, rx, ry, rot, 0, 7); g.fill(); };
    // a fern / jungle frond: a curved rib with paired leaflets. Calls leafFn(g) per plate.
    const frond = (g, pts, n, len, w, seed, side = 1) => {
        const r = Motion.rng('fr' + seed);
        g.beginPath();
        for (let i = 1; i <= n; i++) {
            const u = i / (n + 1), k = u * (pts.length - 1), j = Math.min(pts.length - 2, Math.floor(k)), f = k - j;
            const x = pts[j][0] + (pts[j + 1][0] - pts[j][0]) * f, y = pts[j][1] + (pts[j + 1][1] - pts[j][1]) * f;
            const a = Math.atan2(pts[j + 1][1] - pts[j][1], pts[j + 1][0] - pts[j][0]);
            const L = len * (1 - 0.55 * u) * (0.85 + 0.3 * r());
            leaf(g, x, y, a - 0.9 * side, L, w * (1 - 0.4 * u), 0.08);
            leaf(g, x, y, a + 0.9 * side, L, w * (1 - 0.4 * u), -0.08);
        }
        g.fill();
    };
    // a crescent: the disc (x1, y1, r1) minus the disc (x2, y2, r2), as one path (no fill)
    const crescent = (g, x1, y1, r1, x2, y2, r2) => {
        const dx = x2 - x1, dy = y2 - y1, d = Math.hypot(dx, dy), base = Math.atan2(dy, dx);
        const a = (r1 * r1 - r2 * r2 + d * d) / (2 * d), al = Math.acos(Math.max(-1, Math.min(1, a / r1))), be = Math.acos(Math.max(-1, Math.min(1, (d - a) / r2)));
        g.beginPath();
        g.arc(x1, y1, r1, base + al, base + Math.PI * 2 - al, false);
        g.arc(x2, y2, r2, base + Math.PI + be, base + Math.PI - be, true);
        g.closePath();
    };
    // ---------------------------------------------------------------- the detail pass
    // A card authored in reference pixels (the 1080 frame) with the film's camera push: every
    // plate scaled by 1/1.08 and zoomed by z about the frame centre (measured per drawing)
    const ref = (press, z, fn, cx = 540, cy = 540) => {
        press.save();
        press.each((g) => { g.scale(1 / 1.08, 1 / 1.08); g.translate(cx, cy); g.scale(z, z); g.translate(-cx, -cy); });
        fn();
        press.restore();
    };
    // the push as a table: scale per drawing (the mid frame of each drawing, measured with a
    // correlation of four corner patches against the base frame the card is authored on)
    // lf (the frame inside the shot, from the scene) when given, else the drawing's mid frame;
    // f0 = the frame (inside the shot) the card was measured on
    const push = (rate, t, lf, f0) => 1 + rate * ((lf ?? Math.floor(t * 12 + 1e-6) * 2 + 0.5) - f0);
    // hand-set halftone dots on a MEASURED lattice (the film's screens are not all at the
    // press's pitch/angle: each layer of the collage has its own, very regular, lattice).
    // L = [ax, ay, bx, by, ox, oy]: the two lattice vectors and one dot centre, in ref px.
    // tone(x, y) → 0..1 (dot area); o.jit: size jitter per dot; o.clear: draw on a
    // destination-out context too (the same dots cleared from another plate)
    const lat = (g, L, tone, x0, y0, x1, y1, o = {}) => {
        const [ax, ay, bx, by, ox, oy] = L, det = ax * by - ay * bx, A = Math.abs(det);
        const ij = (x, y) => [((x - ox) * by - (y - oy) * bx) / det, (ax * (y - oy) - ay * (x - ox)) / det];
        const cs = [ij(x0, y0), ij(x1, y0), ij(x0, y1), ij(x1, y1)];
        const i0 = Math.floor(Math.min(...cs.map((c) => c[0]))) - 1, i1 = Math.ceil(Math.max(...cs.map((c) => c[0]))) + 1;
        const j0 = Math.floor(Math.min(...cs.map((c) => c[1]))) - 1, j1 = Math.ceil(Math.max(...cs.map((c) => c[1]))) + 1;
        const jit = o.jit ?? 0.12, p = Math.sqrt(A);
        g.save();
        if (o.clear) g.globalCompositeOperation = 'destination-out';
        g.fillStyle = T(o.v ?? 1);
        g.beginPath();
        for (let i = i0; i <= i1; i++) for (let j = j0; j <= j1; j++) {
            const x = ox + i * ax + j * bx, y = oy + i * ay + j * by;
            if (x < x0 - p || x > x1 + p || y < y0 - p || y > y1 + p) continue;
            let tv = tone(x, y);
            if (!(tv > 0.01)) continue;
            const h = Math.sin(i * 127.1 + j * 311.7) * 43758.5453, hj = h - Math.floor(h);
            tv = Math.min(1, tv * (1 + (hj - 0.5) * 2 * jit));
            // area = tone while the dots stay apart; past ~0.7 they merge (a larger radius
            // so the last holes close like a real screen)
            const r = tv < 0.7 ? Math.sqrt((tv * A) / Math.PI) : Math.sqrt((0.7 * A) / Math.PI) + (tv - 0.7) / 0.3 * (p * 0.71 - Math.sqrt((0.7 * A) / Math.PI));
            const rr = r * (o.rk ?? 1);
            g.moveTo(x + rr, y);
            g.arc(x, y, rr, 0, 6.2832);
        }
        g.fill();
        g.restore();
    };
    // a painted ribbon: a centreline (smoothed), width by a profile along it, tapered ends
    // pts: [[x, y, w?], …] (w per point, else o.w); returns the outline as a closed polygon
    const ribbon = (pts, o = {}) => {
        const n = o.n ?? 40, P = pts.length;
        const at = (u) => {
            const k = u * (P - 1), i = Math.min(P - 2, Math.floor(k)), f = k - i;
            const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(P - 1, i + 2)];
            const c = (a, b, c2, d) => 0.5 * (2 * b + (-a + c2) * f + (2 * a - 5 * b + 4 * c2 - d) * f * f + (-a + 3 * b - 3 * c2 + d) * f * f * f);
            const w1 = p1[2] ?? o.w ?? 10, w2 = p2[2] ?? o.w ?? 10;
            return [c(p0[0], p1[0], p2[0], p3[0]), c(p0[1], p1[1], p2[1], p3[1]), w1 + (w2 - w1) * f];
        };
        const S = [];
        for (let i = 0; i <= n; i++) S.push(at(i / n));
        const L = [], R = [], t0 = o.taper ?? 0.18, sh = o.shift ?? 0;
        for (let i = 0; i <= n; i++) {
            const a = S[Math.max(0, i - 1)], b = S[Math.min(n, i + 1)];
            let dx = b[0] - a[0], dy = b[1] - a[1]; const l = Math.hypot(dx, dy) || 1; dx /= l; dy /= l;
            const u = i / n, tap = Math.min(1, u / t0, (1 - u) / t0);
            const hw = (S[i][2] / 2) * Math.pow(Math.max(0, tap), 0.6);
            const c = sh * S[i][2];
            L.push([S[i][0] - dy * (hw + c), S[i][1] + dx * (hw + c)]);
            R.push([S[i][0] + dy * (hw - c), S[i][1] - dx * (hw - c)]);
        }
        return L.concat(R.reverse());
    };
    return { crescent, T, path, smooth, poly, blobFill, inside, blob, leaf, taper, stroke, disc, ell, frond, ref, push, lat, ribbon };
})();
