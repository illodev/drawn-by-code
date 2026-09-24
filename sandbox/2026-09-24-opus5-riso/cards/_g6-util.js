// Helpers for the group-6 cards (snowflake, mountains, aurora, savanna, dunes, ice, flower).
// Global: G6. All coordinates in the card's 1000 × 1000 units; `g` is a riso plate.
var G6 = (() => {
    const T = (v) => Riso.tone(v);
    // a closed polygon path (no fill)
    const path = (g, pts) => { g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); };
    const poly = (g, pts, fill) => { g.fillStyle = fill; path(g, pts); g.fill(); };
    // a smooth closed path through pts (quadratic curves through the midpoints)
    const smooth = (g, pts) => {
        const n = pts.length, mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
        g.beginPath();
        const m0 = mid(pts[n - 1], pts[0]);
        g.moveTo(m0[0], m0[1]);
        for (let i = 0; i < n; i++) { const m = mid(pts[i], pts[(i + 1) % n]); g.quadraticCurveTo(pts[i][0], pts[i][1], m[0], m[1]); }
        g.closePath();
    };
    const blob = (g, pts, fill) => { g.fillStyle = fill; smooth(g, pts); g.fill(); };
    // run fn with g clipped to a polygon (or a smooth outline)
    const clipped = (g, pts, fn, soft) => { g.save(); soft ? smooth(g, pts) : path(g, pts); g.clip(); fn(g); g.restore(); };
    // a stroked open polyline
    const stroke = (g, pts, w, style = T(1), cap = 'round') => {
        g.save(); g.lineWidth = w; g.strokeStyle = style; g.lineCap = cap; g.lineJoin = 'round';
        g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke(); g.restore();
    };
    // a ridge line from x0 to x1: sum of seeded sines + jag, returns [[x, y]…]
    const ridge = (seed, x0, x1, base, amps, step = 6, jag = 0) => {
        const r = Motion.rng('g6r' + seed), ph = amps.map(() => r() * 6.28), out = [];
        for (let x = x0; x <= x1 + 1e-6; x += step) {
            let y = typeof base === 'function' ? base(x) : base;
            amps.forEach(([a, w], i) => { y += a * Math.sin(x / w + ph[i]); });
            y += (r() - 0.5) * jag;
            out.push([x, y]);
        }
        return out;
    };
    // a band under (or over) a ridge closed at y = edge
    const under = (ridgePts, edge = 1000) => [...ridgePts, [ridgePts[ridgePts.length - 1][0], edge], [ridgePts[0][0], edge]];
    // speckles: n small dots in a box (stars, spray), radius r0..r1, optional mask fn(x, y) → bool
    const speckle = (g, box, n, r0, r1, seed, fill = T(1), mask) => {
        const r = Motion.rng('g6s' + seed);
        g.fillStyle = fill;
        g.beginPath();
        for (let i = 0; i < n; i++) {
            const x = box[0] + r() * (box[2] - box[0]), y = box[1] + r() * (box[3] - box[1]), rr = r0 + (r1 - r0) * r() * r();
            if (mask && !mask(x, y)) continue;
            g.moveTo(x + rr, y); g.arc(x, y, rr, 0, 6.2832);
        }
        g.fill();
    };
    // a pine tree silhouette: tip at (x, y), height h, width w, jagged tiers
    const pine = (g, x, y, h, w, seed) => {
        const r = Motion.rng('g6p' + seed), tiers = Math.max(3, Math.round(h / (w * 0.55))), L = [], R = [];
        for (let i = 1; i <= tiers; i++) {
            const f = i / tiers, yy = y + h * f * 0.92, ww = w * 0.5 * (0.25 + 0.75 * f) * (0.85 + 0.3 * r());
            L.push([x - ww, yy + h * 0.02], [x - ww * 0.35, yy - h * 0.03]);
            R.push([x + ww * 0.35, yy - h * 0.03], [x + ww, yy + h * 0.02]);
        }
        // R runs down the right side, then the trunk, then L back up the left side
        path(g, [[x, y], ...R, [x + w * 0.06, y + h], [x - w * 0.06, y + h], ...L.reverse()]);
        g.fill();
    };
    // draw on a plate through a mask: maskFn(m) draws the mask (any shapes, strokes), fillFn(m)
    // then paints inside it (source-in); the result lands on plate g. A scratch canvas at the
    // plate's resolution, in the same units. op: how it lands ('destination-out' erases).
    let scratch = null;
    // g may be a list of plates: [[plate, op], …] to stamp the same mask on several
    const masked = (g, maskFn, fillFn, op = 'source-over') => {
        const list = Array.isArray(g) ? g : [[g, op]];
        g = list[0][0];
        const W = g.canvas.width, H = g.canvas.height, k = W / 1000;
        if (!scratch || scratch.width !== W || scratch.height !== H) { scratch = document.createElement('canvas'); scratch.width = W; scratch.height = H; }
        const m = scratch.getContext('2d');
        m.setTransform(1, 0, 0, 1, 0, 0); m.globalCompositeOperation = 'source-over'; m.globalAlpha = 1; m.clearRect(0, 0, W, H);
        m.setTransform(k, 0, 0, k, 0, 0);
        m.fillStyle = T(1); m.strokeStyle = T(1);
        maskFn(m);
        m.globalCompositeOperation = 'source-in';
        fillFn(m);
        m.globalCompositeOperation = 'source-over';
        for (const [p, o] of list) { p.save(); p.setTransform(1, 0, 0, 1, 0, 0); p.globalCompositeOperation = o ?? 'source-over'; p.drawImage(scratch, 0, 0); p.restore(); }
    };
    // a coarse hand-set halftone (bigger dots than the press screen, e.g. an out-of-focus
    // ghost): round dots of radius r on a grid of pitch p at angle a, over a box
    // (box may be a list of boxes: one path, one fill, so it is safe inside `masked`)
    const dots = (g, box, p, r, a = 0, fill = T(1)) => {
        const boxes = Array.isArray(box[0]) ? box : [box];
        const x0 = Math.min(...boxes.map((b) => b[0])), y0 = Math.min(...boxes.map((b) => b[1])), x1 = Math.max(...boxes.map((b) => b[2])), y1 = Math.max(...boxes.map((b) => b[3]));
        const ca = Math.cos(a), sa = Math.sin(a), cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, R = Math.hypot(x1 - x0, y1 - y0) / 2;
        const rm = typeof r === 'function' ? 20 : r;
        g.fillStyle = fill;
        g.beginPath();
        for (let i = -R; i <= R; i += p) for (let j = -R; j <= R; j += p) {
            const x = cx + i * ca - j * sa, y = cy + i * sa + j * ca;
            if (!boxes.some((b) => x >= b[0] - rm && x <= b[2] + rm && y >= b[1] - rm && y <= b[3] + rm)) continue;
            const rr = typeof r === 'function' ? r(x, y) : r;
            if (rr <= 0.2) continue;
            g.moveTo(x + rr, y); g.arc(x, y, rr, 0, 6.2832);
        }
        g.fill();
    };
    return { T, path, poly, smooth, blob, clipped, stroke, ridge, under, speckle, pine, masked, dots };
})();
