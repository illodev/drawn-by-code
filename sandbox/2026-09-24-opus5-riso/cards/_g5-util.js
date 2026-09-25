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
    // The reference's own screen. Each card was printed through screens at its own pitch and
    // angle (8.6–11 px here, not the press's 9.5), fixed for the card; a dot a few px off the
    // reference's costs as much as a wrong colour (a 3 px shift of the same print = 12 on the
    // gate). A screen is measured per ink per card with a lattice fit (FFT peaks, then the
    // phase per block): one regular lattice fits the whole frame to < 0.6 px, so
    // L = { o: [x, y], a: [x, y], b: [x, y] } in reference px at 1080 (dot centres at
    // o + i·a + j·b); a per-block form { a, b, s, o: rows of [x, y] | null } also works.
    // screen(g, ink, L, tonesFn): tonesFn(m) paints tones (alpha = ink) in reference px on a
    // scratch canvas; every lattice cell gets one soft round dot of area = tone × cell, drawn
    // on the solid plate g (inside G5.px). The press's register offset for the ink is taken
    // out, so the dots land where they were measured.
    const REG = { yellow: [2, -1], pink: [-1, 1], blue: [1, 2], navy: [0, 0] };
    let scr = null;
    const screen = (g, ink, L, tonesFn, o = {}) => {
        const W = g.canvas.width, H = g.canvas.height, q = 0.5, sw = Math.round(W * q), sh = Math.round(H * q), k = sw / 1080;
        if (!scr || scr.width !== sw) { scr = document.createElement('canvas'); scr.width = sw; scr.height = sh; }
        const m = scr.getContext('2d', { willReadFrequently: true });
        m.setTransform(1, 0, 0, 1, 0, 0); m.globalCompositeOperation = 'source-over'; m.globalAlpha = 1; m.filter = 'none'; m.clearRect(0, 0, sw, sh);
        m.setTransform(k, 0, 0, k, 0, 0);
        m.fillStyle = Riso.tone(1); m.strokeStyle = Riso.tone(1);
        tonesFn(m);
        const D = m.getImageData(0, 0, sw, sh).data;
        // one regular lattice (o: [x, y]) is one block over the whole frame
        if (typeof L.o[0] === 'number') L = { a: L.a, b: L.b, s: 1080, o: [[L.o]] };
        const [ax, ay] = L.a, [bx, by] = L.b, det = ax * by - ay * bx, cell = Math.abs(det), S = L.s, n = L.o.length;
        const gain = o.gain ?? 1, jit = o.jit ?? 0.1, [rx, ry] = REG[ink] ?? [0, 0]; // press offsets, in px at 1080
        // fill the blocks without dots from the nearest measured one
        const O = L.o.map((row, j) => row.map((v, i) => {
            if (v) return v;
            let best = null, bd = 1e9;
            L.o.forEach((r2, j2) => r2.forEach((v2, i2) => { if (v2) { const dd = (i - i2) ** 2 + (j - j2) ** 2; if (dd < bd) { bd = dd; best = v2; } } }));
            return best;
        }));
        g.save();
        g.fillStyle = Riso.tone(1);
        g.beginPath();
        for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
            const oo = O[j][i]; if (!oo) continue;
            const x0 = i * S, y0 = j * S, x1 = x0 + S + (i === n - 1 ? 40 : 0), y1 = y0 + S + (j === n - 1 ? 40 : 0), xa = i ? x0 : -40, ya = j ? y0 : -40;
            // lattice indices covering the block
            const idx = (x, y) => [((x - oo[0]) * by - (y - oo[1]) * bx) / det, (ax * (y - oo[1]) - ay * (x - oo[0])) / det];
            const cs = [idx(xa, ya), idx(x1, ya), idx(xa, y1), idx(x1, y1)];
            const i0 = Math.floor(Math.min(...cs.map((c) => c[0]))), i1 = Math.ceil(Math.max(...cs.map((c) => c[0])));
            const j0 = Math.floor(Math.min(...cs.map((c) => c[1]))), j1 = Math.ceil(Math.max(...cs.map((c) => c[1])));
            for (let u = i0; u <= i1; u++) for (let v = j0; v <= j1; v++) {
                const x = oo[0] + u * ax + v * bx, y = oo[1] + u * ay + v * by;
                if (x < xa || x >= x1 || y < ya || y >= y1) continue;
                const qx = Math.min(sw - 1, Math.max(0, Math.round(x * k))), qy = Math.min(sh - 1, Math.max(0, Math.round(y * k)));
                const tv = (D[(qy * sw + qx) * 4 + 3] / 255) * gain;
                if (tv < 0.02) continue;
                const hh = Math.sin(u * 12.9898 + v * 78.233) * 43758.5453, hj = hh - Math.floor(hh);
                const r = Math.sqrt(Math.min(1.35, tv) * cell / Math.PI) * (1 + jit * (hj - 0.5) * 2);
                const px = x - rx, py = y - ry;
                g.moveTo(px + r, py); g.arc(px, py, r, 0, 6.2832);
            }
        }
        g.fill();
        g.restore();
    };
    // Grit: the print's fine noise. Measured at 3× the reference's flat inks are never flat:
    // they mottle at 2–4 px with pinholes and specks (the gate reads «too clean» at a texture
    // ratio of 0.3–0.5 without it). grit(g, box, o) paints a fixed noise of specks (cells of
    // o.cell px, a fraction o.p of them, alpha o.a) over the box in the current transform:
    // o.out = true punches voids (destination-out) instead of adding ink. Clip beforehand.
    const gritCache = {};
    const gritPat = (g, cell, p, seed) => {
        const key = cell + ':' + p + ':' + seed;
        if (!gritCache[key]) {
            const n = 96, c = document.createElement('canvas'); c.width = n * cell; c.height = n * cell;
            const x = c.getContext('2d'), r = Motion.rng('grit' + key);
            for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
                if (r() > p) continue;
                x.fillStyle = `rgba(0,0,0,${0.35 + 0.65 * r()})`;
                const w = cell * (0.6 + r() * 0.9), h = cell * (0.6 + r() * 0.9);
                x.fillRect(i * cell + r() * cell * 0.5, j * cell + r() * cell * 0.5, w, h);
            }
            gritCache[key] = c;
        }
        return g.createPattern(gritCache[key], 'repeat');
    };
    const grit = (g, box, o = {}) => {
        const [x0, y0, x1, y1] = box ?? [0, 0, 1080, 1080];
        g.save();
        if (o.out) g.globalCompositeOperation = 'destination-out';
        g.globalAlpha = o.a ?? 0.5;
        g.fillStyle = gritPat(g, o.cell ?? 2.2, o.p ?? 0.25, o.seed ?? 0);
        g.translate((o.seed ?? 0) * 37 % 211, (o.seed ?? 0) * 53 % 197);
        g.fillRect(x0 - 250, y0 - 250, x1 - x0 + 250, y1 - y0 + 250);
        g.restore();
    };
    // Tone maps: the regional ink each area of the reference gets, 90 px at a time. Once a
    // card's pieces are in place most of the gate's colour error is regional tone (G6: a
    // smooth 44 px colour offset takes the medians to 6–8). A tone map is a table per ink of
    // coverage corrections in percent on an n × n grid of the 1080 frame, measured by solving
    // each block's mean colour into inks on the reference and on our own render and moving by
    // the difference (2–3 passes). It is drawn smoothly (bilinear) on the solid plates:
    // positive cells add ink, negative ones take ink away (every mark of that plate).
    // toneMap(press, { n, yellow: [...], pink: [...], blue: [...], navy: [...] }), inside px().
    const toneMap = (press, map) => {
        if (!map || !map.n) return;
        const n = map.n;
        for (const ink of ['yellow', 'pink', 'blue', 'navy']) {
            const d = map[ink]; if (!d) continue;
            const g = press.plate(ink);
            for (const sign of [1, -1]) {
                const c = document.createElement('canvas'); c.width = n; c.height = n;
                const x = c.getContext('2d'), img = x.createImageData(n, n);
                let any = false;
                for (let i = 0; i < n * n; i++) { const v = Math.max(0, sign * d[i]) / 100; img.data[i * 4 + 3] = Math.round(Math.min(1, v) * 255); if (v > 0) any = true; }
                if (!any) continue;
                x.putImageData(img, 0, 0);
                g.save();
                if (sign < 0) g.globalCompositeOperation = 'destination-out';
                g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high';
                // cell centres at (i + 0.5) S: the n-pixel image stretched over the frame
                g.drawImage(c, 0, 0, n, n, 0, 0, 1080, 1080);
                g.restore();
            }
        }
    };
    return { trace, smooth, fill, stroke, clipped, glow, speckle, blob, px, band, erase, brush, soft, hatch, blotch, cut, inks, screen, grit, toneMap };
})();
