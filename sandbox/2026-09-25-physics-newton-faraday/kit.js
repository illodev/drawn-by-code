// Shared drawing helpers for physics-newton-faraday: shapes are painted as separations on
// the riso press (styles/risograph). Global: Ph.
//
//   Ph.put(press, path, spec)     knock the shape out of every plate, then ink it: spec maps
//                                 'ink' (solid) or 'ink.s' (screen) to a tone or a
//                                 fillStyle factory (g) => style
//   Ph.line(press, pts, w, spec)  a tapered brush line through pts (w: number or u => width)
//   Ph.smooth(g, pts, closed)     a Catmull-Rom path through pts (begins the path)
//   Ph.cam(press, x, y, z, fn)    draw fn with every plate translated and scaled
const Ph = (() => {
    const T = (v) => Riso.tone(v);

    // points along a Catmull-Rom spline through pts (n per segment)
    function sample(pts, closed = false, n = 8) {
        const out = [], m = pts.length, P = (i) => (closed ? pts[(i + m) % m] : pts[Math.max(0, Math.min(m - 1, i))]);
        const segs = closed ? m : m - 1;
        for (let i = 0; i < segs; i++) {
            const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2);
            for (let k = 0; k < n; k++) {
                const t = k / n, t2 = t * t, t3 = t2 * t;
                const f = (a, b, c, d) => 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
                out.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])]);
            }
        }
        if (!closed) out.push(pts[m - 1]);
        return out;
    }
    function smooth(g, pts, closed = true) {
        const s = sample(pts, closed, 10);
        g.beginPath();
        s.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
        if (closed) g.closePath();
    }
    function poly(g, pts) {
        g.beginPath();
        pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
        g.closePath();
    }
    function ink(press, path, spec) {
        for (const [key, v] of Object.entries(spec)) {
            if (v == null || v === 0) continue;
            const [name, kind] = key.split('.');
            const g = press.plate(name, kind === 's' ? 'screen' : 'solid');
            g.fillStyle = typeof v === 'function' ? v(g) : T(v);
            g.beginPath();
            path(g);
            g.fill();
        }
    }
    function put(press, path, spec, o = {}) {
        if (o.knock !== false) press.knockout((g) => { g.beginPath(); path(g); g.fill(); });
        ink(press, path, spec);
    }
    // a brush stroke: a filled outline around a centre line with a varying width
    function outline(pts, w) {
        const s = pts.length > 2 ? sample(pts, false, 8) : pts, L = [], R = [];
        for (let i = 0; i < s.length; i++) {
            const a = s[Math.max(0, i - 1)], b = s[Math.min(s.length - 1, i + 1)];
            let dx = b[0] - a[0], dy = b[1] - a[1];
            const l = Math.hypot(dx, dy) || 1;
            dx /= l; dy /= l;
            const u = i / (s.length - 1), hw = (typeof w === 'function' ? w(u) : w) / 2;
            L.push([s[i][0] - dy * hw, s[i][1] + dx * hw]);
            R.push([s[i][0] + dy * hw, s[i][1] - dx * hw]);
        }
        return L.concat(R.reverse());
    }
    // taper: thin ends, full in the middle (a painted line, not a stroke)
    const taper = (w, a = 0.15, b = 0.15) => (u) => w * Math.min(1, 0.25 + 0.75 * Math.min(u / a, (1 - u) / b, 1));
    function line(press, pts, w, spec, o = {}) {
        const ol = outline(pts, w);
        put(press, (g) => poly(g, ol), spec, o);
    }
    function cam(press, x, y, z, fn) {
        press.save();
        press.each((g) => { g.translate(x, y); g.scale(z, z); });
        fn();
        press.restore();
    }
    function circle(cx, cy, r) {
        return (g) => { g.beginPath(); g.arc(cx, cy, Math.max(0.01, r), 0, Math.PI * 2); };
    }
    function ellipse(cx, cy, rx, ry, rot = 0) {
        return (g) => { g.beginPath(); g.ellipse(cx, cy, Math.max(0.01, rx), Math.max(0.01, ry), rot, 0, Math.PI * 2); };
    }
    return { T, sample, smooth, poly, ink, put, outline, taper, line, cam, circle, ellipse };
})();
