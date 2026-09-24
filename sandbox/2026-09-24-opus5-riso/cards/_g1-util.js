// Helpers for group 1's cards (koi, grasshopper, jellyfish, owl, bell, wolf, phone).
// Cards are authored in reference pixels (the 1080 px frame) and scaled into the 1000-unit
// frame with G1.frame, so every coordinate is a number read off a reference crop.
var G1 = (() => {
    const T = (v) => Riso.tone(v);
    // run fn with every plate in reference-pixel coordinates (1080 → 1000 units)
    function frame(press, fn) {
        press.save();
        press.each((g) => g.scale(1000 / 1080, 1000 / 1080));
        try { fn(); } finally { press.restore(); }
    }
    // path helpers: a polygon, or a closed/open smooth curve through points (Catmull-Rom)
    function polyPath(g, pts) {
        g.beginPath();
        pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
        g.closePath();
    }
    function smoothPath(g, pts, closed = true, k = 1 / 6) {
        const n = pts.length, P = (i) => (closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))]);
        g.beginPath();
        g.moveTo(pts[0][0], pts[0][1]);
        const last = closed ? n : n - 1;
        for (let i = 0; i < last; i++) {
            const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2);
            g.bezierCurveTo(p1[0] + (p2[0] - p0[0]) * k, p1[1] + (p2[1] - p0[1]) * k, p2[0] - (p3[0] - p1[0]) * k, p2[1] - (p3[1] - p1[1]) * k, p2[0], p2[1]);
        }
        if (closed) g.closePath();
    }
    function fill(g, pts, v = 1, smooth = false) {
        g.fillStyle = typeof v === 'number' ? T(v) : v;
        (smooth ? smoothPath : polyPath)(g, pts);
        g.fill();
    }
    function stroke(g, pts, w, v = 1, smooth = true) {
        g.save();
        g.strokeStyle = T(v);
        g.lineWidth = w;
        g.lineCap = 'round';
        g.lineJoin = 'round';
        (smooth ? smoothPath : polyPath)(g, pts, false);
        g.stroke();
        g.restore();
    }
    // a tapered brush stroke along a smooth curve: width w0 → w1 (a filled outline)
    function taper(g, pts, w0, w1, v = 1) {
        // sample the Catmull-Rom curve
        const S = [];
        const n = pts.length, P = (i) => pts[Math.max(0, Math.min(n - 1, i))];
        for (let i = 0; i < n - 1; i++) {
            const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2);
            for (let s = 0; s < 8; s++) {
                const u = s / 8, u2 = u * u, u3 = u2 * u;
                const f = (a, b, c, d) => 0.5 * (2 * b + (-a + c) * u + (2 * a - 5 * b + 4 * c - d) * u2 + (-a + 3 * b - 3 * c + d) * u3);
                S.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])]);
            }
        }
        S.push(pts[n - 1]);
        const L = [], R = [];
        for (let i = 0; i < S.length; i++) {
            const a = S[Math.max(0, i - 1)], b = S[Math.min(S.length - 1, i + 1)];
            let dx = b[0] - a[0], dy = b[1] - a[1];
            const d = Math.hypot(dx, dy) || 1;
            dx /= d; dy /= d;
            const w = (w0 + (w1 - w0) * (i / (S.length - 1))) / 2;
            L.push([S[i][0] - dy * w, S[i][1] + dx * w]);
            R.push([S[i][0] + dy * w, S[i][1] - dx * w]);
        }
        g.fillStyle = T(v);
        polyPath(g, L.concat(R.reverse()));
        g.fill();
    }
    // draw inside a clip on one plate
    function clipped(g, pathFn, fn) {
        g.save();
        g.beginPath();
        pathFn(g);
        g.clip();
        fn(g);
        g.restore();
    }
    // specks: tiny ink dots scattered in a box (dust and pinholes the reference shows on
    // dark fields and skies); deterministic per seed
    function specks(g, seed, x0, y0, x1, y1, n, r0 = 1, r1 = 2.5, v = 1) {
        const r = Motion.rng('g1sp' + seed);
        g.fillStyle = T(v);
        for (let i = 0; i < n; i++) {
            const x = x0 + (x1 - x0) * r(), y = y0 + (y1 - y0) * r(), rad = r0 + (r1 - r0) * r() * r();
            g.beginPath();
            g.arc(x, y, rad, 0, 7);
            g.fill();
        }
    }
    // a wobbling closed outline for an organic blob round (cx, cy)
    function blob(cx, cy, rx, ry, seed, wob = 0.05, n = 18, rot = 0) {
        const r = Motion.rng('g1b' + seed), pts = [];
        for (let i = 0; i < n; i++) {
            const a = (i / n) * Math.PI * 2, k = 1 + wob * (r() * 2 - 1);
            const x = Math.cos(a) * rx * k, y = Math.sin(a) * ry * k;
            pts.push([cx + x * Math.cos(rot) - y * Math.sin(rot), cy + x * Math.sin(rot) + y * Math.cos(rot)]);
        }
        return pts;
    }
    // a body along a spine: the outline polygon of a ribbon whose width is w(u), u 0..1
    // (a fish, a tentacle, a stem); samples the smooth spine
    function ribbon(pts, w) {
        const S = [], n = pts.length, P = (i) => pts[Math.max(0, Math.min(n - 1, i))];
        for (let i = 0; i < n - 1; i++) {
            const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2);
            for (let s = 0; s < 10; s++) {
                const u = s / 10, u2 = u * u, u3 = u2 * u;
                const f = (a, b, c, d) => 0.5 * (2 * b + (-a + c) * u + (2 * a - 5 * b + 4 * c - d) * u2 + (-a + 3 * b - 3 * c + d) * u3);
                S.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])]);
            }
        }
        S.push(pts[n - 1]);
        const L = [], R = [];
        for (let i = 0; i < S.length; i++) {
            const a = S[Math.max(0, i - 1)], b = S[Math.min(S.length - 1, i + 1)];
            let dx = b[0] - a[0], dy = b[1] - a[1];
            const dd = Math.hypot(dx, dy) || 1;
            dx /= dd; dy /= dd;
            const hw = w(i / (S.length - 1)) / 2;
            L.push([S[i][0] - dy * hw, S[i][1] + dx * hw]);
            R.push([S[i][0] + dy * hw, S[i][1] - dx * hw]);
        }
        return { outline: L.concat(R.reverse()), spine: S, left: L };
    }
    return { T, frame, polyPath, smoothPath, fill, stroke, taper, clipped, specks, blob, ribbon };
})();
