// Line style kit: black strokes on white paper that jitter on purpose (line boil),
// like hand-drawn animation at 12 drawings per second. Global: LineArt.
// Depends on engine/core.js.
//
// Here the jitter IS the style, but it is deterministic: the drawing changes every 1/12 s
// (animating "on twos"), using the stroke seed + the drawing number. Never Math.random.
const LineArt = (() => {
    const INK = '#15131a', PAPER = '#f7f4ec';

    // Drawing number: changes `fps` times per second (12 = animating on twos).
    const drawing = (t, fps = 12) => Math.floor(t * fps + 1e-6);

    function resample(pts, step) {
        const out = [pts[0]];
        for (let i = 1; i < pts.length; i++) {
            const [ax, ay] = pts[i - 1], [bx, by] = pts[i];
            const d = Math.hypot(bx - ax, by - ay), m = Math.max(1, Math.round(d / step));
            for (let k = 1; k <= m; k++) out.push([ax + ((bx - ax) * k) / m, ay + ((by - ay) * k) / m]);
        }
        return out;
    }

    /**
     * Jittering stroke. pts: polyline (or polygon if closed). jitter: jitter amplitude
     * in units; width: average width (varies a little along the stroke, like a brush).
     */
    function stroke(g, pts, { t = 0, seed = 's', width = 5, jitter = 2, color = INK, closed = false, fps = 12 } = {}) {
        const src = resample(closed ? [...pts, pts[0]] : pts, 10);
        const r = Motion.rng(seed + ':' + drawing(t, fps));
        // low-frequency noise: shifts in chunks, not point by point
        const knots = Array.from({ length: Math.ceil(src.length / 6) + 2 }, () => [(r() - 0.5) * 2 * jitter, (r() - 0.5) * 2 * jitter]);
        const p = src.map(([x, y], i) => {
            const k = i / 6, a = Math.floor(k), f = k - a, s = f * f * (3 - 2 * f);
            return [x + knots[a][0] + (knots[a + 1][0] - knots[a][0]) * s, y + knots[a][1] + (knots[a + 1][1] - knots[a][1]) * s];
        });
        g.strokeStyle = color;
        g.lineCap = 'round';
        g.lineJoin = 'round';
        // segments with varying width
        for (let i = 1; i < p.length; i++) {
            g.lineWidth = width * (0.8 + 0.4 * Math.sin(i * 0.35 + r() * 0.5));
            g.beginPath();
            g.moveTo(p[i - 1][0], p[i - 1][1]);
            g.lineTo(p[i][0], p[i][1]);
            g.stroke();
        }
    }

    const circle = (cx, cy, r, n = 48, a0 = 0, a1 = Math.PI * 2) =>
        Array.from({ length: n + 1 }, (_, i) => {
            const a = a0 + ((a1 - a0) * i) / n;
            return [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
        });

    // White paper with a very subtle fiber texture (cached).
    function paper(g, env, key = 'papel') {
        Motion.sprite('linea:' + key, { x: -300, y: -300, w: env.W + 600, h: env.H + 600 }, env.k, (c) => {
            c.fillStyle = PAPER;
            c.fillRect(-300, -300, env.W + 600, env.H + 600);
            const r = Motion.rng(key);
            c.strokeStyle = 'rgba(120,100,80,0.06)';
            c.lineWidth = 1;
            for (let i = 0; i < 900; i++) {
                const x = -300 + r() * (env.W + 600), y = -300 + r() * (env.H + 600), a = r() * Math.PI;
                c.beginPath();
                c.moveTo(x, y);
                c.lineTo(x + Math.cos(a) * 14, y + Math.sin(a) * 14);
                c.stroke();
            }
        }).draw(g);
    }

    return { INK, PAPER, drawing, stroke, circle, paper, resample };
})();
