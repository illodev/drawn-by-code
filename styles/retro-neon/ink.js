// Retro-neon, drawn: the manner of the user's reference (a hand-drawn digital illustration):
// flat neon fills, a thick dark brush line that wobbles and tapers, light laid on as loose
// strokes of cyan, red and orange, and drawings that change twelve times a second (the line
// boils on twos). Sets are still built in metres and projected through Neon.camera; this
// file is how they are painted.
// Global: Ink.
//
//   Ink.PAL                         the reference's measured palette (k-means) + its accents
//   Ink.boil(t)                     the drawing index (12 a second): seeds that change on twos
//   Ink.brush(g, pts, o)            a brush stroke along a polyline (screen coords)
//   Ink.shape(g, pts, fill, o)      a flat fill with a brush outline
//   Ink.hatch(g, a, b, o)           loose strokes of light along an edge a→b
//   Ink.strokes(g, x, y, w, h, o)   a patch of parallel strokes (hair, cloth, water)
const Ink = (() => {
    const PAL = {
        ink: '#0b0230', navy: '#0f0138', night: '#04022e', deep: '#0e0558', indigo: '#200887',
        blue: '#0f0ff1', royal: '#3a10c8', violet: '#7407f0', purple: '#ad19b0', plum: '#7a1581',
        grape: '#420859', magenta: '#e106d3', salmon: '#f45a7f', orange: '#f9a03a', gold: '#ffd25a',
        cyan: '#67deef', aqua: '#3ff6e0', red: '#ff3050', pink: '#ff8ad8', cream: '#ffe6f6', mint: '#7dffc8',
    };
    const boil = (t) => Math.floor(t * 12 + 1e-6);
    // occlusion of the light layer: while a light layer is set here, every opaque shape and
    // stroke painted elsewhere also erases that layer where it lies, so a glow behind a palm,
    // a pole or a car is hidden by it (paint near things after far ones). Set it only while the
    // near world is painted in the same logical units as the light layer; null to stop.
    let OCC = null;
    const occlude = (L) => { OCC = L ?? null; };
    function erase(g, path) {
        if (!OCC || g === OCC) return;
        OCC.save(); OCC.globalCompositeOperation = 'destination-out'; OCC.globalAlpha = 1; OCC.fillStyle = '#000';
        path(OCC); OCC.fill(); OCC.restore();
    }
    // a small deterministic noise from integers (seed, i, drawing)
    const hsh = (a, b, c) => { let h = Math.imul(a | 0, 374761393) ^ Math.imul(b | 0, 668265263) ^ Math.imul(c | 0, 2147483647); h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
    const sHash = (s) => { let h = 2166136261; s = String(s); for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619); return h >>> 0; };
    const sm = (a, b, u) => a + (b - a) * (u * u * (3 - 2 * u));
    // smooth noise along a stroke: n(seed, x) in −1..1, continuous in x, a new curve per drawing
    function noise(seed, x, d) { const i = Math.floor(x), f = x - i; return sm(hsh(seed, i, d) * 2 - 1, hsh(seed, i + 1, d) * 2 - 1, f); }

    // resample a polyline every `step` px
    function resample(pts, step, closed) {
        const P = closed ? pts.concat([pts[0]]) : pts, out = [P[0]];
        let carry = 0;
        for (let i = 1; i < P.length; i++) {
            const [x0, y0] = P[i - 1], [x1, y1] = P[i], L = Math.hypot(x1 - x0, y1 - y0);
            let s = step - carry;
            while (s <= L) { const u = s / L; out.push([x0 + (x1 - x0) * u, y0 + (y1 - y0) * u]); s += step; }
            carry = L - (s - step);
        }
        if (!closed) out.push(P[P.length - 1]);
        return out;
    }

    // a brush stroke: width w (px at the canvas's scale), tapering at the ends, pressure
    // varying along it, wobbling sideways by `wob` px, a new wobble every drawing (o.d)
    // o: { w, col, seed, d, wob, taper, closed, alpha, step, over }
    function brush(g, pts, o = {}) {
        if (!pts || pts.length < 2) return;
        const w = o.w ?? 3, seed = typeof o.seed === 'number' ? o.seed : sHash(o.seed ?? 'b'), d = o.d ?? 0;
        let len = 0; for (let i = 1; i < pts.length; i++) len += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
        if (o.closed) len += Math.hypot(pts[0][0] - pts[pts.length - 1][0], pts[0][1] - pts[pts.length - 1][1]);
        if (len < 0.5) return;
        const step = o.step ?? Math.max(2, Math.min(10, len / 12));
        let P = resample(pts, step, !!o.closed);
        if (o.closed) { const over = Math.max(1, Math.round((o.over ?? 0.06) * P.length)); P = P.concat(P.slice(1, over + 1)); }
        const n = P.length; if (n < 2) return;
        const wob = o.wob ?? Math.min(2.2, 0.6 + w * 0.25), taper = o.taper ?? 0.18;
        const L = [], R = [];
        for (let i = 0; i < n; i++) {
            const a = P[Math.max(0, i - 1)], b = P[Math.min(n - 1, i + 1)];
            let tx = b[0] - a[0], ty = b[1] - a[1]; const tl = Math.hypot(tx, ty) || 1; tx /= tl; ty /= tl;
            const nx = -ty, ny = tx, u = i / (n - 1);
            const end = Math.min(1, Math.min(u, 1 - u) / Math.max(0.001, taper));
            const press = 0.75 + 0.35 * noise(seed + 7, u * 6, d);
            const half = Math.max(0.25, w * 0.5 * press * (0.15 + 0.85 * Math.sqrt(end)));
            const off = noise(seed, u * Math.max(2, len / 60), d) * wob;
            const cx = P[i][0] + nx * off, cy = P[i][1] + ny * off;
            L.push([cx + nx * half, cy + ny * half]); R.push([cx - nx * half, cy - ny * half]);
        }
        g.save();
        g.globalAlpha *= o.alpha ?? 1;
        g.fillStyle = o.col ?? PAL.ink;
        const outline = (c) => { c.beginPath(); c.moveTo(L[0][0], L[0][1]); for (let i = 1; i < n; i++) c.lineTo(L[i][0], L[i][1]); for (let i = n - 1; i >= 0; i--) c.lineTo(R[i][0], R[i][1]); c.closePath(); };
        outline(g); g.fill();
        g.restore();
        if (!o.light && (o.alpha ?? 1) >= 0.9) erase(g, outline);
    }

    // a flat fill (its corners nudged a little each drawing) with a brush outline
    // o: { ink, w (0 = none), seed, d, jit, alpha }
    function shape(g, pts, fill, o = {}) {
        if (!pts || pts.length < 3) return;
        const seed = typeof o.seed === 'number' ? o.seed : sHash(o.seed ?? 's'), d = o.d ?? 0, jit = o.jit ?? 0.8;
        const Q = jit ? pts.map((p, i) => [p[0] + (hsh(seed, i, d) - 0.5) * jit, p[1] + (hsh(seed + 1, i, d) - 0.5) * jit]) : pts;
        if (fill) {
            const outline = (c) => { c.beginPath(); Q.forEach((p, i) => (i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]))); c.closePath(); };
            g.save(); g.globalAlpha *= o.alpha ?? 1; g.fillStyle = fill;
            outline(g); g.fill();
            g.restore();
            if (!o.light && (o.alpha ?? 1) >= 0.9) erase(g, outline);
        }
        if ((o.w ?? 3) > 0) brush(g, Q, { w: o.w ?? 3, col: o.ink ?? PAL.ink, seed, d, closed: true, wob: o.wob, alpha: o.inkAlpha ?? 1 });
    }

    // loose strokes of light along an edge a→b, on the side n (a unit normal pointing into
    // the lit surface): o: { n, col, w, len, count, seed, d, ang, alpha }
    function hatch(g, a, b, o = {}) {
        const seed = typeof o.seed === 'number' ? o.seed : sHash(o.seed ?? 'h'), d = o.d ?? 0;
        const count = o.count ?? 5, len = o.len ?? 12, w = o.w ?? 1.6;
        const ex = b[0] - a[0], ey = b[1] - a[1], el = Math.hypot(ex, ey) || 1;
        const n = o.n ?? [-ey / el, ex / el];
        for (let i = 0; i < count; i++) {
            const u = (i + 0.2 + hsh(seed, i, d) * 0.6) / count;
            const x = a[0] + ex * u, y = a[1] + ey * u;
            const l = len * (0.5 + hsh(seed + 3, i, d) * 0.7), inset = len * 0.15 * hsh(seed + 5, i, d);
            const ang = o.ang ?? 0.35;              // strokes lean along the edge a little
            const dx = n[0] * Math.cos(ang) + (ex / el) * Math.sin(ang), dy = n[1] * Math.cos(ang) + (ey / el) * Math.sin(ang);
            const x0 = x + n[0] * inset, y0 = y + n[1] * inset;
            brush(g, [[x0, y0], [x0 + dx * l * 0.5 + n[0] * l * 0.05, y0 + dy * l * 0.5], [x0 + dx * l, y0 + dy * l]], { w, col: o.col ?? PAL.cyan, seed: seed + i * 13, d, taper: 0.45, wob: 0.6, alpha: o.alpha ?? 1 });
        }
    }

    // a patch of roughly parallel strokes inside a box (water, hair, a lit wall)
    // o: { ang, count, len, w, cols, seed, d, alpha, clip(pts) }
    function strokes(g, x, y, w, h, o = {}) {
        const seed = typeof o.seed === 'number' ? o.seed : sHash(o.seed ?? 'p'), d = o.d ?? 0;
        const count = o.count ?? 12, len = o.len ?? 20, ang = o.ang ?? 0, cols = o.cols ?? [PAL.cyan];
        const cx = Math.cos(ang), cy = Math.sin(ang);
        for (let i = 0; i < count; i++) {
            const px = x + hsh(seed, i, d) * w, py = y + hsh(seed + 1, i, d) * h, l = len * (0.5 + hsh(seed + 2, i, d));
            const bend = (hsh(seed + 4, i, d) - 0.5) * l * 0.2;
            brush(g, [[px, py], [px + cx * l * 0.5 - cy * bend, py + cy * l * 0.5 + cx * bend], [px + cx * l, py + cy * l]],
                { w: (o.w ?? 1.6) * (0.7 + hsh(seed + 3, i, d) * 0.6), col: cols[i % cols.length], seed: seed + i * 31, d, taper: 0.4, wob: 0.5, alpha: o.alpha ?? 1 });
        }
    }

    return { PAL, boil, brush, shape, hatch, strokes, noise, hsh, sHash, occlude, erase };
})();
