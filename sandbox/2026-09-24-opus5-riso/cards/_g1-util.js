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
    // a halftone screen measured on the reference (the film's screens are not the press's
    // 9.5 px: 10.4 px, 17.3 px, 23 px … each at its own angle and phase): a dot centre
    // (ox, oy) and the two lattice vectors, in reference px (engine: scratch lattice probe)
    function lattice(ox, oy, ax, ay, bx, by) { return { ox, oy, ax, ay, bx, by, area: Math.abs(ax * by - ay * bx) }; }
    const REG = { yellow: [2, -1], pink: [-1, 1], blue: [1, 2], navy: [0, 0] }; // riso.js's default register
    const hash = (i, j, s) => { const h = Math.sin(i * 127.1 + j * 311.7 + s * 74.7) * 43758.5453; return h - Math.floor(h); };
    // hand-set dots on a solid plate, one per lattice cell inside box [x0, y0, x1, y1]: dot
    // area = tone (a number or fn(x, y) → 0..1), each dot a little off in size and roundness
    function dots(g, L, box, tone, o = {}) {
        const [x0, y0, x1, y1] = box, det = L.ax * L.by - L.ay * L.bx;
        const ij = (x, y) => { const dx = x - L.ox, dy = y - L.oy; return [(dx * L.by - dy * L.bx) / det, (L.ax * dy - L.ay * dx) / det]; };
        const cs = [ij(x0, y0), ij(x1, y0), ij(x0, y1), ij(x1, y1)];
        const i0 = Math.floor(Math.min(...cs.map((c) => c[0]))) - 1, i1 = Math.ceil(Math.max(...cs.map((c) => c[0]))) + 1;
        const j0 = Math.floor(Math.min(...cs.map((c) => c[1]))) - 1, j1 = Math.ceil(Math.max(...cs.map((c) => c[1]))) + 1;
        const jit = o.jit ?? 0.14, seed = o.seed ?? 1, fn = typeof tone === 'function';
        // the press prints each plate a little out of register: set the dots back by it so
        // they land on the measured lattice (o.ink: the plate's ink)
        const [rx, ry] = REG[o.ink] ?? [0, 0];
        g.fillStyle = T(o.v ?? 1);
        g.beginPath();
        for (let i = i0; i <= i1; i++) for (let j = j0; j <= j1; j++) {
            const x = L.ox + i * L.ax + j * L.bx - rx, y = L.oy + i * L.ay + j * L.by - ry;
            if (x < x0 - 12 || x > x1 + 12 || y < y0 - 12 || y > y1 + 12) continue;
            const tv = fn ? tone(x, y) : tone;
            if (tv <= 0.004) continue;
            const h = hash(i, j, seed), h2 = hash(j, i, seed + 3);
            const r = Math.sqrt((Math.min(tv, 1) * L.area) / Math.PI) * (1 + jit * (h - 0.5) * 2) * (tv > 0.7 ? 1 + (tv - 0.7) * 0.5 : 1);
            const e = 1 + 0.16 * (h2 - 0.5);
            g.moveTo(x + r * e, y);
            g.ellipse(x, y, r * e, r / e, 0, 0, Math.PI * 2);
        }
        g.fill();
    }
    // tiny marks (specks, flecks, streaks) scattered in a region: n marks of size s0..s1 px,
    // elongated by `stretch` along angle `ang` (radians, ± spread)
    function marks(g, seed, pathFn, box, n, s0, s1, o = {}) {
        const r = Motion.rng('g1mk' + seed), [x0, y0, x1, y1] = box;
        g.save();
        if (pathFn) { g.beginPath(); pathFn(g); g.clip(); }
        for (let k = 0; k < n; k++) {
            const x = x0 + (x1 - x0) * r(), y = y0 + (y1 - y0) * r(), s = s0 + (s1 - s0) * r() * r(), a = (o.ang ?? 0) + (r() - 0.5) * (o.spread ?? 6.28), st = o.stretch ?? 1;
            g.fillStyle = T((o.v0 ?? 1) - ((o.v0 ?? 1) - (o.v1 ?? o.v0 ?? 1)) * r());
            g.beginPath();
            g.ellipse(x, y, s * st / 2, s / 2, a, 0, Math.PI * 2);
            g.fill();
        }
        g.restore();
    }
    // a tone field: a grid of ink coverages measured cell by cell on the reference (mean
    // colour of each cell solved for the inks' area coverage), read back bilinearly between
    // the cell centres → fn(x, y) for dots()
    function field(grid, x0 = 0, y0 = 0, x1 = 1080, y1 = 1080) {
        const ny = grid.length, nx = grid[0].length, cw = (x1 - x0) / nx, ch = (y1 - y0) / ny;
        return (x, y) => {
            const fx = Math.max(0, Math.min(nx - 1, (x - x0) / cw - 0.5)), fy = Math.max(0, Math.min(ny - 1, (y - y0) / ch - 0.5));
            const i = Math.min(nx - 2, Math.floor(fx)), j = Math.min(ny - 2, Math.floor(fy)), u = fx - i, v = fy - j;
            return (grid[j][i] * (1 - u) + grid[j][i + 1] * u) * (1 - v) + (grid[j + 1][i] * (1 - u) + grid[j + 1][i + 1] * u) * v;
        };
    }
    // regional tone: how much ink each 45 px of the frame gets, measured against the reference
    // and our own render (a calibration loop, scratch tool calib2.py): per plate an n × n grid
    // of changes, + adds flat ink, − thins what is there; read back smoothly (bilinear) over
    // the frame, in frame pixels (call it inside G1.frame, outside any view transform)
    const toneCanvas = {};
    function tones(press, TN) {
        if (!TN) return;
        const n = TN.n;
        for (const ink of ['yellow', 'pink', 'blue', 'navy']) {
            const grid = TN[ink];
            if (!grid) continue;
            for (const sign of [1, -1]) {
                const key = n + ink + sign;
                const c = toneCanvas[key] ?? (toneCanvas[key] = Object.assign(document.createElement('canvas'), { width: n, height: n }));
                const cg = c.getContext('2d'), img = cg.createImageData(n, n);
                let any = false;
                for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
                    const v = Math.max(0, sign * grid[j][i]);
                    img.data[(j * n + i) * 4 + 3] = Math.round(Math.min(1, v) * 255);
                    if (v > 0.005) any = true;
                }
                if (!any) continue;
                cg.putImageData(img, 0, 0);
                // more light ink goes on as a screen (dots keep the print's texture); more dark
                // ink flat (a coarse dark screen would ripple through the gate's 12 px blur);
                // less thins both
                for (const kind of sign > 0 ? (ink === 'navy' || ink === 'blue' ? ['solid'] : ['screen']) : ['solid', 'screen']) {
                    const g = press.plate(ink, kind);
                    g.save();
                    if (sign < 0) g.globalCompositeOperation = 'destination-out';
                    g.imageSmoothingEnabled = true;
                    g.imageSmoothingQuality = 'high';
                    g.drawImage(c, 0, 0, n, n, 0, 0, 1080, 1080);
                    g.restore();
                }
            }
        }
    }
    return { T, frame, polyPath, smoothPath, fill, stroke, taper, clipped, specks, blob, ribbon, lattice, dots, marks, hash, field, tones };
})();
