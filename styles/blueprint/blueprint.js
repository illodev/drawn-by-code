// Blueprint style kit: a drawing office's cyanotype. One sheet of blue paper that has been
// folded and handled, and white line work that is drafted in front of the viewer: ruled
// lines, compass arcs, hatching, dimensions and lettering, each put down in order.
//
// The model is the print itself: ONE scalar (how much light the paper took) through one
// measured ramp from Prussian blue to the bare sheet. The paper's wear and the ink are the
// same thing at different amounts, so the line work is drawn in white on its own layer,
// broken by the paper's tooth and laid over the sheet with a soft bleed.
//
//   const D = Blueprint.drawing();                 // a display list, built once in setup()
//   D.group('tower').bold().poly(outline, true);   // items go to the current group
//   D.group('dims').fine(); Blueprint.dimV(D, 322, 73, 314, { label: '18.600' });
//   Blueprint.frame(g, env, { cam }, (ink) => D.paint(ink, (name) => progress01));
//
// Units are logical (a 1600-wide frame); `drawing({ u })` scales the pen presets when a
// drawing is authored in another space (u = 0.8 for coordinates measured on a 1280 still).
const Blueprint = (() => {
    const FONT = 'RoutedGothic';
    const INK = [236, 240, 237];
    // the print's ramp, measured on the reference sheet: luminance → colour
    const RAMP = [[0, 4, 22, 44], [30, 11, 35, 62], [39, 17, 44, 73], [56, 30, 62, 93], [63, 37, 68, 99], [105, 89, 109, 129],
        [145, 134, 148, 161], [187, 181, 189, 193], [215, 211, 216, 216], [255, 240, 241, 236]];
    const LUT = new Uint8Array(256 * 3);
    for (let v = 0; v < 256; v++) {
        let i = 1;
        while (i < RAMP.length - 1 && RAMP[i][0] < v) i++;
        const a = RAMP[i - 1], b = RAMP[i], f = (v - a[0]) / (b[0] - a[0]);
        for (let c = 0; c < 3; c++) LUT[v * 3 + c] = Math.round(a[c + 1] + (b[c + 1] - a[c + 1]) * f);
    }

    // --- noise (integer lattice hashes: the same on every machine) -------------------
    const h2 = (x, y, s) => {
        let n = (Math.imul(x | 0, 374761393) ^ Math.imul(y | 0, 668265263) ^ Math.imul(s | 0, 2147483647)) | 0;
        n = Math.imul(n ^ (n >>> 13), 1274126177);
        return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
    };
    const vn = (x, y, s) => {
        const xi = Math.floor(x), yi = Math.floor(y), fx = x - xi, fy = y - yi;
        const sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
        const a = h2(xi, yi, s), b = h2(xi + 1, yi, s), c = h2(xi, yi + 1, s), d = h2(xi + 1, yi + 1, s);
        return a + (b - a) * sx + (c - a + (a - b + d - c) * sx) * sy;
    };
    const fbm = (x, y, s, oct = 3) => {
        let v = 0, a = 0.5, n = 0;
        for (let o = 0; o < oct; o++) { v += a * vn(x, y, s + o * 17); n += a; x *= 2.03; y *= 2.03; a *= 0.5; }
        return v / n;
    };
    const sstep = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

    // --- the sheet --------------------------------------------------------------------
    // paper(env, o) → { sheet, tooth, box }: the blue sheet and the mask that breaks the ink,
    // painted once (the last few are kept). o: { w, h, x, y } the sheet in logical units (defaults to the frame),
    // res (pixels per logical unit, defaults to env.k), folds { x: [...], y: [...] } in
    // fractions of the sheet, wear 0..1 (edges and corners), seed.
    const sheets = new Map();
    function paper(env, o = {}) {
        const w = o.w ?? env.W, h = o.h ?? env.H, x0 = o.x ?? 0, y0 = o.y ?? 0, res = o.res ?? env.k;
        const folds = o.folds ?? { x: [0.5], y: [0.375, 0.615] }, wear = o.wear ?? 1, seed = Motion.hashStr(o.seed ?? 'sheet') & 0xffff;
        // o.view [x, y, w, h]: paint only that part of the sheet (a close shot on a big sheet)
        const [vx, vy, vw, vh] = o.view ?? [0, 0, w, h];
        const key = [w, h, x0, y0, res.toFixed(4), JSON.stringify(folds), wear, seed, vx, vy, vw, vh].join('|');
        if (sheets.has(key)) { const hit = sheets.get(key); sheets.delete(key); sheets.set(key, hit); return hit; } // most recent last
        const pw = Math.ceil(vw * res), ph = Math.ceil(vh * res);
        const mk = () => { const c = document.createElement('canvas'); c.width = pw; c.height = ph; return c; };
        const sheet = mk(), tooth = mk();
        const sg = sheet.getContext('2d'), tg = tooth.getContext('2d');
        const si = sg.createImageData(pw, ph), ti = tg.createImageData(pw, ph);
        const fx = folds.x.map((f) => f * w), fy = folds.y.map((f) => f * h);
        const corners = [[0, 0, 46], [w, 0, 34], [0, h, 40], [w, h, 30]].map(([cx, cy, r], i) => [cx, cy, r * (0.7 + 0.6 * h2(i, 7, seed)) * wear]);
        for (let py = 0; py < ph; py++) {
            const y = vy + (py + 0.5) / res, row = py * pw * 4;
            for (let px = 0; px < pw; px++) {
                const x = vx + (px + 0.5) / res;
                // exposure: clouds, brushed mottle (the coating went on with a brush, both ways),
                // grain and the cloth's weave
                const gh = vn(x / 1.15, y / 1.15, seed + 6), gm = fbm(x / 7, y / 7, seed + 7, 3);
                let v = 54.5 + (fbm(x / 300, y / 300, seed, 4) - 0.5) * 30 + (fbm(x / 60, y / 60, seed + 3, 3) - 0.5) * 13
                    + (fbm(x / 21, y / 21, seed + 4, 3) - 0.5) * 9 + (fbm((x * 0.82 + y * 0.57) / 44, (y * 0.82 - x * 0.57) / 11, seed + 5, 2) - 0.5) * 6
                    + (gm - 0.5) * 9 + (gh - 0.5) * 11 + (h2(px, py, seed + 8) - 0.5) * 4;
                const wv = Math.sin((x + y) * 1.82) * Math.sin((x - y) * 1.82);
                v += wv * 2.4 * (0.4 + vn(x / 30, y / 30, seed + 9));
                // W: how worn this spot is (handling, folds, edges, corners); past a threshold the
                // coating is gone, grain by grain, down to the bare sheet
                const st = fbm(x / 150 + 9, y / 26, seed + 11, 3), rub = sstep(0.56, 0.8, st);
                let W = rub * 0.42, crease = 0;
                for (let i = 0; i < fx.length + fy.length; i++) {
                    const vert = i < fx.length, c = vert ? fx[i] : fy[i - fx.length], along = vert ? y : x;
                    const d = (vert ? x : y) - c - (vn(along / 90, i, seed + 20) - 0.5) * 3;
                    const ad = Math.abs(d);
                    if (ad > 40) continue;
                    const n1 = vn(along / 55, i * 3.1, seed + 21), n2 = vn(along / 9, i * 5.3, seed + 22);
                    const core = Math.exp(-(d * d) / (1.5 + 1.8 * n2));
                    v -= core * 34 * (0.4 + n1 * 0.8);
                    const worn = 0.3 + 0.7 * sstep(0.35, 0.7, n1 * 0.65 + n2 * 0.35);
                    W = Math.max(W, worn * 0.8 * Math.exp(-Math.abs(d - 2 - 2 * (n2 - 0.5)) / (2.5 + 6 * n1)));
                    v += (d > 0 ? 1 : -1) * 4 * Math.exp(-ad / 13) * (vert ? 1 : -1);
                    crease = Math.max(crease, core * 0.6);
                }
                for (const cx of fx) for (const cy of fy) {
                    const r = Math.hypot(x - cx, y - cy);
                    W = Math.max(W, 1.1 - r / 9);
                }
                const e = Math.min(x, y, w - x, h - y);
                if (wear > 0 && e < 40) {
                    const bite = sstep(0.58, 0.82, fbm((x + y) / 60, (x - y) / 60, seed + 29, 2)) * 7;
                    W = Math.max(W, (0.8 - (e - bite) / 4.5) * wear, (1.4 - e / 1.4) * wear);
                }
                for (const [cx, cy, r] of corners) {
                    const d = Math.hypot(x - cx, y - cy);
                    if (d < r * 2.6) W = Math.max(W, 1.5 - (d + (fbm(x / 17, y / 17, seed + 33, 3) - 0.5) * r * 1.2) / (r * 1.25));
                }
                let bare = 0;
                if (W > 0.05) {
                    // first a grainy haze as the coating thins, then the bare sheet
                    v += sstep(0.05, 0.9, W) * 30 * (0.25 + 1.5 * gh * gm);
                    bare = sstep(0.72, 1.12, W + (gh - 0.5) * 0.5 + (gm - 0.5) * 0.7);
                    if (bare > 0) v += (172 + (fbm(x / 9, y / 9, seed + 35, 2) - 0.5) * 64 + (gh - 0.5) * 40 - v) * bare;
                }
                // specks: pinholes in the coating, a few spots of dirt
                const cxs = Math.floor(x / 9), cys = Math.floor(y / 9), sp = h2(cxs, cys, seed + 40);
                if (sp < 0.02) {
                    const sx = (cxs + 0.2 + 0.6 * h2(cxs, cys, seed + 41)) * 9, sy = (cys + 0.2 + 0.6 * h2(cxs, cys, seed + 42)) * 9;
                    const rr = 0.45 + 0.75 * h2(cxs, cys, seed + 43), d = Math.hypot(x - sx, y - sy);
                    v += sstep(rr * 1.4, rr * 0.2, d) * (sp < 0.014 ? 20 + 60 * h2(cxs, cys, seed + 44) : -14);
                }
                const q = Math.max(0, Math.min(255, Math.round(v))) * 3, o4 = row + px * 4;
                si.data[o4] = LUT[q]; si.data[o4 + 1] = LUT[q + 1]; si.data[o4 + 2] = LUT[q + 2]; si.data[o4 + 3] = 255;
                // tooth: how much of the ink this spot of paper did not take
                const g2 = fbm(x / 60, y / 60, seed + 51, 2);
                const k = 0.03 + 0.16 * sstep(0.45, 0.85, g2) + 0.5 * sstep(0.62, 0.94, gh) + 0.2 * sstep(0.5, 1, wv * gh * 2)
                    + W * 0.22 + crease * 0.6 + bare * 0.7;
                ti.data[o4 + 3] = Math.max(0, Math.min(255, Math.round(k * 255)));
            }
        }
        sg.putImageData(si, 0, 0);
        tg.putImageData(ti, 0, 0);
        const P = { sheet, tooth, box: { x: x0 + vx, y: y0 + vy, w: vw, h: vh } };
        sheets.set(key, P);
        while (sheets.size > (o.keep ?? 3)) sheets.delete(sheets.keys().next().value); // a film of many shots would fill the memory
        return P;
    }

    // --- lettering ----------------------------------------------------------------------
    let mctx = null;
    const capRatios = new Map();
    function mc() {
        if (!mctx) mctx = document.createElement('canvas').getContext('2d');
        return mctx;
    }
    // the font string for a capital height (fonts differ in how tall their capitals are)
    const fontFor = (cap, font = FONT) => {
        if (!capRatios.has(font)) { const c = mc(); c.font = `100px ${font}`; capRatios.set(font, c.measureText('H').actualBoundingBoxAscent / 100 || 0.7); }
        return `${cap / capRatios.get(font)}px ${font}`;
    };
    function textWidth(str, cap, track = 0.12, font = FONT) {
        const c = mc();
        c.font = fontFor(cap, font);
        c.letterSpacing = `${cap * track}px`;
        return c.measureText(str).width - cap * track;
    }

    // --- a drawing: a display list that can be drafted in order ---------------------------
    function drawing(o = {}) {
        const u = o.u ?? 1;
        const items = [], groups = new Map();
        let cur = null, pen = { w: 1.3 * u, dash: null, a: 1, cap: 'butt' }, ready = false;
        const len = (p) => { let L = 0; for (let i = 2; i < p.length; i += 2) L += Math.hypot(p[i] - p[i - 2], p[i + 1] - p[i - 1]); return L; };
        const flat = (pts) => (typeof pts[0] === 'number' ? pts : pts.flat());
        const add = (it) => { if (!cur) D.group('all'); it.g = cur; it.w ??= pen.w; it.dash ??= pen.dash; it.a ??= pen.a; it.cap ??= pen.cap; items.push(it); cur.items.push(it); ready = false; return D; };
        const D = {
            u, items, groups,
            // items added from here on belong to this group; o.overlap: the share of the
            // group's time the shortest stroke takes (0.05 = one pen, 0.5 = many at once)
            group(name, go = {}) {
                if (!groups.has(name)) groups.set(name, { name, items: [], overlap: go.overlap ?? 0.12 });
                cur = groups.get(name);
                if (go.overlap != null) cur.overlap = go.overlap;
                return D;
            },
            pen(w, po = {}) { pen = { w: w * u, dash: po.dash ? po.dash.map((d) => d * u) : null, a: po.a ?? 1, cap: po.cap ?? 'butt' }; return D; },
            // the office's pens: object lines, thin lines, construction, hidden, centre
            bold: () => D.pen(1.75), med: () => D.pen(1.3), fine: () => D.pen(0.95), faint: () => D.pen(0.8, { a: 0.55 }),
            hidden: () => D.pen(0.95, { dash: [5, 3.5] }), centre: () => D.pen(0.95, { dash: [16, 4, 3, 4] }),
            free: (w = 1.2) => D.pen(w, { cap: 'round' }),
            line: (x0, y0, x1, y1) => add({ k: 's', p: [x0, y0, x1, y1], L: Math.hypot(x1 - x0, y1 - y0) }),
            poly(pts, closed = false) { const p = flat(pts).slice(); if (closed) p.push(p[0], p[1]); return add({ k: 's', p, L: len(p) }); },
            rect: (x, y, w, h) => D.poly([x, y, x + w, y, x + w, y + h, x, y + h], true),
            // an arc of an ellipse, sampled; angles in radians, clockwise on screen from +x
            ellipse(cx, cy, rx, ry, a0 = 0, a1 = Math.PI * 2, rot = 0) {
                const n = Math.max(8, Math.ceil((Math.abs(a1 - a0) * Math.max(rx, ry)) / (2.2 * u))), p = [], c = Math.cos(rot), s = Math.sin(rot);
                for (let i = 0; i <= n; i++) { const a = a0 + ((a1 - a0) * i) / n, x = Math.cos(a) * rx, y = Math.sin(a) * ry; p.push(cx + x * c - y * s, cy + x * s + y * c); }
                return add({ k: 's', p, L: len(p) });
            },
            circle: (cx, cy, r, a0, a1) => D.ellipse(cx, cy, r, r, a0, a1),
            // a freehand line through points (Catmull-Rom): rocks, coastlines, break lines
            curve(pts, closed = false) {
                const q = typeof pts[0] === 'number' ? pts.reduce((a, v, i) => (i % 2 ? a[a.length - 1].push(v) : a.push([v]), a), []) : pts;
                const n = q.length, p = [], at = (i) => (closed ? q[((i % n) + n) % n] : q[Math.max(0, Math.min(n - 1, i))]);
                for (let i = 0; i < (closed ? n : n - 1); i++) {
                    const p0 = at(i - 1), p1 = at(i), p2 = at(i + 1), p3 = at(i + 2), steps = Math.max(2, Math.ceil(Math.hypot(p2[0] - p1[0], p2[1] - p1[1]) / (2.5 * u)));
                    for (let s = 0; s < steps; s++) {
                        const t = s / steps, t2 = t * t, t3 = t2 * t;
                        p.push(0.5 * (2 * p1[0] + (p2[0] - p0[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (3 * p1[0] - p0[0] - 3 * p2[0] + p3[0]) * t3),
                            0.5 * (2 * p1[1] + (p2[1] - p0[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (3 * p1[1] - p0[1] - 3 * p2[1] + p3[1]) * t3));
                    }
                }
                const e = at(closed ? 0 : n - 1);
                p.push(e[0], e[1]);
                return add({ k: 's', p, L: len(p), cap: 'round' });
            },
            // a filled shape (a wash of tone, an arrowhead, a poché): fades in as it is reached
            fill(pts, a = 1, weight = 14) { return add({ k: 'f', p: flat(pts).slice(), a, L: weight * u }); },
            dot: (x, y, r, a = 1) => add({ k: 'd', p: [x, y, r], a, L: 6 * u }),
            // a wash of tone that grades along a line: shade(poly, [x0, y0, x1, y1], [[0, a0], [0.4, a1], …])
            // (the rounding of a tower, a shadow); the paper's tooth turns it to chalk
            shade(pts, axis, stops, weight = 30) { return add({ k: 'g', p: flat(pts).slice(), axis, stops, a: 1, L: weight * u }); },
            // lettering: cap is the capital height; o.align 'left' | 'center' | 'right'; o.track;
            // o.font another family (a pencilled hand); o.bold how much the strokes are thickened;
            // o.clear rubs out the lines under the figure, as a draughtsman breaks them round it
            text(str, x, y, cap, to = {}) {
                const track = to.track ?? 0.12, tw = textWidth(str, cap, track, to.font), al = to.align ?? 'left';
                return add({ k: 't', str, x: al === 'center' ? x - tw / 2 : al === 'right' ? x - tw : x, y, cap, track, tw, rot: to.rot ?? 0, ox: x, oy: y, clear: to.clear ?? false, font: to.font, bold: to.bold ?? 0.02, L: str.length * cap * 1.6 });
            },
            // parallel lines clipped to a polygon (and out of its holes): section hatching
            hatch(poly, ho = {}) {
                const ang = ho.angle ?? -Math.PI / 4, gap = (ho.gap ?? 4) * u, holes = ho.holes ?? [], P = [flat(poly), ...holes.map(flat)];
                const c = Math.cos(ang), s = Math.sin(ang), rp = P.map((p) => { const r = []; for (let i = 0; i < p.length; i += 2) r.push(p[i] * c + p[i + 1] * s, -p[i] * s + p[i + 1] * c); return r; });
                let lo = Infinity, hi = -Infinity;
                for (let i = 1; i < rp[0].length; i += 2) { lo = Math.min(lo, rp[0][i]); hi = Math.max(hi, rp[0][i]); }
                const ph = ho.phase ?? 0.5;
                for (let y = Math.ceil(lo / gap - ph) * gap + ph * gap; y < hi; y += gap) {
                    const xs = [];
                    for (const r of rp) for (let i = 0, n = r.length; i < n; i += 2) {
                        const x0 = r[i], y0 = r[i + 1], x1 = r[(i + 2) % n], y1 = r[(i + 3) % n];
                        if ((y0 <= y && y1 > y) || (y1 <= y && y0 > y)) xs.push(x0 + ((y - y0) / (y1 - y0)) * (x1 - x0));
                    }
                    xs.sort((a, b) => a - b);
                    for (let i = 0; i + 1 < xs.length; i += 2) if (xs[i + 1] - xs[i] > 0.4 * u) D.line(xs[i] * c - y * s, xs[i] * s + y * c, xs[i + 1] * c - y * s, xs[i + 1] * s + y * c);
                }
                return D;
            },
            // stipple inside a polygon (concrete, sand): seeded dots, denser where dens(x, y) says
            stipple(poly, so = {}) {
                const p = flat(poly), rnd = Motion.rng(so.seed ?? 'stipple'), n = so.n ?? 200, r = (so.r ?? 0.5) * u;
                let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
                for (let i = 0; i < p.length; i += 2) { x0 = Math.min(x0, p[i]); x1 = Math.max(x1, p[i]); y0 = Math.min(y0, p[i + 1]); y1 = Math.max(y1, p[i + 1]); }
                const inside = (x, y) => { let c = false; for (let i = 0, j = p.length - 2; i < p.length; j = i, i += 2) if ((p[i + 1] > y) !== (p[j + 1] > y) && x < ((p[j] - p[i]) * (y - p[i + 1])) / (p[j + 1] - p[i + 1]) + p[i]) c = !c; return c; };
                const pts = [];
                for (let i = 0; i < n * 4 && pts.length < n; i++) {
                    const x = x0 + rnd() * (x1 - x0), y = y0 + rnd() * (y1 - y0), keep = rnd();
                    if (inside(x, y) && (!so.dens || keep < so.dens(x, y))) pts.push(x, y, r * (0.6 + 0.8 * rnd()));
                }
                return add({ k: 'm', p: pts, a: so.a ?? pen.a, L: n * 0.6 * u });
            },

            // Paints the list in white. reveal: (groupName) → 0..1 (how much of that group has
            // been drafted), or nothing for the finished drawing. o.tip: the wet end of a line
            // that is being drawn shows as a small dot. o.alpha: (groupName) → 0..1 dims a group
            // (what a revision has superseded). o.weight thickens every line (a drawing painted
            // small through a transform).
            paint(g, reveal, po = {}) {
                if (!ready) {
                    for (const gr of groups.values()) {
                        const T = gr.items.reduce((s, it) => s + it.L, 0) || 1, m = gr.overlap;
                        let c = 0;
                        for (const it of gr.items) { it.t0 = (c / T) * (1 - m); it.t1 = it.t0 + (it.L / T) * (1 - m) + m; c += it.L; }
                    }
                    ready = true;
                }
                const prog = new Map();
                for (const gr of groups.values()) { prog.set(gr, reveal ? Math.max(0, Math.min(1, reveal(gr.name))) : 1); gr.dim = po.alpha ? po.alpha(gr.name) : 1; }
                g.save();
                g.strokeStyle = g.fillStyle = '#fff';
                g.lineJoin = 'miter';
                g.miterLimit = 3;
                let key = '', open = false;
                const flush = () => { if (open) { g.stroke(); open = false; } };
                const tips = [];
                for (const it of items) {
                    const p = prog.get(it.g);
                    if (p <= 0) continue;
                    const q = p >= 1 ? 1 : Math.max(0, Math.min(1, (p - it.t0) / (it.t1 - it.t0)));
                    if (q <= 0) continue;
                    if (it.k === 's') {
                        const k = it.w + '|' + (it.dash ? it.dash.join(',') : '') + '|' + it.a * it.g.dim + '|' + it.cap;
                        if (k !== key || q < 1) {
                            flush();
                            key = k;
                            g.lineWidth = it.w * (po.weight ?? 1); g.globalAlpha = it.a * it.g.dim; g.lineCap = it.cap; g.lineJoin = it.cap === 'round' ? 'round' : 'miter';
                            g.setLineDash(it.dash ?? []);
                        }
                        if (!open) { g.beginPath(); open = true; }
                        const P = it.p;
                        g.moveTo(P[0], P[1]);
                        if (q >= 1) for (let i = 2; i < P.length; i += 2) g.lineTo(P[i], P[i + 1]);
                        else {
                            let left = it.L * q, x = P[0], y = P[1];
                            for (let i = 2; i < P.length && left > 0; i += 2) {
                                const d = Math.hypot(P[i] - x, P[i + 1] - y);
                                if (d <= left) { x = P[i]; y = P[i + 1]; left -= d; } else { x += ((P[i] - x) * left) / d; y += ((P[i + 1] - y) * left) / d; left = 0; }
                                g.lineTo(x, y);
                            }
                            flush();
                            key = '';
                            if (po.tip !== false) tips.push(x, y, it.w);
                        }
                        continue;
                    }
                    flush();
                    key = '';
                    g.setLineDash([]);
                    if (it.k === 'f') {
                        g.globalAlpha = it.a * q * it.g.dim;
                        g.beginPath();
                        g.moveTo(it.p[0], it.p[1]);
                        for (let i = 2; i < it.p.length; i += 2) g.lineTo(it.p[i], it.p[i + 1]);
                        g.closePath();
                        g.fill();
                    } else if (it.k === 'g') {
                        const gr = g.createLinearGradient(it.axis[0], it.axis[1], it.axis[2], it.axis[3]);
                        for (const [o, al] of it.stops) gr.addColorStop(o, `rgba(255,255,255,${al * q})`);
                        g.globalAlpha = 1;
                        g.fillStyle = gr;
                        g.beginPath();
                        g.moveTo(it.p[0], it.p[1]);
                        for (let i = 2; i < it.p.length; i += 2) g.lineTo(it.p[i], it.p[i + 1]);
                        g.closePath();
                        g.fill();
                        g.fillStyle = '#fff';
                    } else if (it.k === 'd') {
                        g.globalAlpha = it.a * it.g.dim;
                        g.beginPath();
                        g.arc(it.p[0], it.p[1], it.p[2] * Math.min(1, q * 1.5), 0, Math.PI * 2);
                        g.fill();
                    } else if (it.k === 'm') {
                        g.globalAlpha = it.a * it.g.dim;
                        g.beginPath();
                        const n = Math.floor((it.p.length / 3) * q) * 3;
                        for (let i = 0; i < n; i += 3) { g.moveTo(it.p[i] + it.p[i + 2], it.p[i + 1]); g.arc(it.p[i], it.p[i + 1], it.p[i + 2], 0, Math.PI * 2); }
                        g.fill();
                    } else if (it.k === 't') {
                        g.globalAlpha = it.a * it.g.dim;
                        g.font = fontFor(it.cap, it.font);
                        g.letterSpacing = `${it.cap * it.track}px`;
                        g.textAlign = 'left';
                        g.textBaseline = 'alphabetic';
                        const n = q >= 1 ? it.str.length : Math.ceil(q * it.str.length), sub = it.str.slice(0, n);
                        g.save();
                        if (it.rot) { g.translate(it.ox, it.oy); g.rotate(it.rot); g.translate(-it.ox, -it.oy); }
                        if (it.clear) {
                            const pad = it.cap * 0.45, wn = n >= it.str.length ? it.tw : g.measureText(sub).width;
                            g.globalCompositeOperation = 'destination-out';
                            g.globalAlpha = 1;
                            g.fillRect(it.x - pad, it.y - it.cap - pad, wn + pad * 2, it.cap + pad * 2);
                            g.globalCompositeOperation = 'source-over';
                            g.globalAlpha = it.a * it.g.dim;
                        }
                        g.fillText(sub, it.x, it.y);
                        if (it.bold > 0) { g.lineWidth = it.cap * it.bold; g.lineJoin = 'round'; g.strokeText(sub, it.x, it.y); }
                        g.restore();
                        g.letterSpacing = '0px';
                    }
                }
                flush();
                g.setLineDash([]);
                g.globalAlpha = 1;
                for (let i = 0; i < tips.length; i += 3) { g.beginPath(); g.arc(tips[i], tips[i + 1], Math.max(1.1 * u, tips[i + 2] * 1.25), 0, Math.PI * 2); g.fill(); }
                g.restore();
            },
        };
        return D;
    }

    // --- drafting conventions ---------------------------------------------------------------
    // A slender filled arrowhead with its point at (x, y), flying along the angle `a`.
    function arrow(D, x, y, a, size = 7) {
        const s = size * D.u, c = Math.cos(a), n = Math.sin(a), hw = s * 0.17;
        return D.fill([x, y, x - c * s + n * hw, y - n * s - c * hw, x - c * s - n * hw, y - n * s + c * hw], 1, 5);
    }
    // A vertical dimension at x between y0 and y1 (y0 above). o.label, o.cap, o.side (-1 puts the
    // figure left of the line, 1 right), o.at (0..1 along the line), o.ext: [[fromX0, fromX1], …]
    // extension lines per end, drawn first.
    function dimV(D, x, y0, y1, o = {}) {
        const cap = o.cap ?? 7 * D.u;
        D.fine();
        D.line(x, y0, x, y1);
        arrow(D, x, y0, -Math.PI / 2, o.arrow); arrow(D, x, y1, Math.PI / 2, o.arrow);
        if (o.label) D.text(o.label, x + (o.side ?? -1) * 5 * D.u, y0 + (y1 - y0) * (o.at ?? 0.5) + cap / 2, cap, { align: (o.side ?? -1) < 0 ? 'right' : 'left', clear: true });
        return D;
    }
    function dimH(D, y, x0, x1, o = {}) {
        const cap = o.cap ?? 7 * D.u;
        D.fine();
        D.line(x0, y, x1, y);
        arrow(D, x0, y, Math.PI, o.arrow); arrow(D, x1, y, 0, o.arrow);
        if (o.label) D.text(o.label, (x0 + x1) / 2, y - 4 * D.u, cap, { align: 'center', clear: true });
        return D;
    }
    // A level mark: the filled triangle standing on the level's line, its note and underline.
    function level(D, x, y, label, o = {}) {
        const cap = o.cap ?? 8 * D.u, s = 5 * D.u, tx = x + 14 * D.u, tw = textWidth(label, cap);
        D.fine();
        if (o.from != null) { D.pen(0.8, { dash: [1.5, 3] }); D.line(o.from, y, x - s * 1.6, y); D.fine(); }
        D.fill([x, y, x - s, y - s * 1.5, x + s, y - s * 1.5], 1, 5);
        D.line(x - s * 1.6, y, tx + tw + 4 * D.u, y);
        D.text(label, tx, y - 4 * D.u, cap);
        return D;
    }
    // A view's title: the name, a rule under it, the scale below.
    function title(D, x, y, name, sub, o = {}) {
        const cap = o.cap ?? 9.5 * D.u, tw = textWidth(name, cap, 0.16);
        D.med().text(name, x, y, cap, { align: 'center', track: 0.16 });
        D.med().line(x - tw / 2 - 2 * D.u, y + cap * 0.55, x + tw / 2 + 2 * D.u, y + cap * 0.55);
        if (sub) D.text(sub, x, y + cap * 0.55 + (o.subCap ?? cap * 0.7) * 1.9, o.subCap ?? cap * 0.7, { align: 'center' });
        return D;
    }

    // --- the print: sheet, then the ink layer with the paper's tooth and a soft bleed -------
    // frame(g, env, o, inkFn, pencilFn): o.cam [cx, cy, zoom, rot] moves the camera over the
    // sheet; o.paper goes to paper(); inkFn(ig) draws the line work in white (Drawing.paint).
    // pencilFn(pg), optional, draws what somebody pencilled over the print afterwards (in
    // white too; it is tinted o.pencil, a red pencil by default): grainier than the print, no
    // bleed, and on top of it.
    let halo = null;
    const PENCIL = [238, 92, 70];
    function frame(g, env, o, inkFn, pencilFn) {
        const zoomMax = o.zoomMax ?? (o.cam ? o.cam[2] : 1);
        const P = paper(env, { res: env.k * Math.max(1, zoomMax), ...(o.paper ?? {}) });
        const camOn = (c) => { if (o.cam) Motion.cam(c, env, o.cam[0], o.cam[1], o.cam[2], o.cam[3] ?? 0); };
        g.save();
        camOn(g);
        g.imageSmoothingQuality = 'high';
        g.drawImage(P.sheet, P.box.x, P.box.y, P.box.w, P.box.h);
        g.restore();
        const ink = Motion.layer(env, 'blueprint-ink', (ig) => {
            ig.save();
            camOn(ig);
            inkFn(ig);
            ig.globalCompositeOperation = 'destination-out';
            ig.imageSmoothingQuality = 'high';
            ig.drawImage(P.tooth, P.box.x, P.box.y, P.box.w, P.box.h);
            ig.restore();
        });
        const ig = ink.getContext('2d');
        ig.save();
        ig.setTransform(1, 0, 0, 1, 0, 0);
        ig.globalCompositeOperation = 'source-in';
        ig.fillStyle = `rgb(${INK})`;
        ig.fillRect(0, 0, ink.width, ink.height);
        ig.restore();
        // the bleed: the line's light spreads a little into the blue round it
        const hw = Math.ceil(ink.width / 3), hh = Math.ceil(ink.height / 3);
        if (!halo || halo.width !== hw || halo.height !== hh) { halo = document.createElement('canvas'); halo.width = hw; halo.height = hh; }
        const hg = halo.getContext('2d');
        hg.clearRect(0, 0, hw, hh);
        hg.imageSmoothingQuality = 'high';
        hg.drawImage(ink, 0, 0, hw, hh);
        g.save();
        g.imageSmoothingQuality = 'high';
        g.globalAlpha = o.bleed ?? 0.2;
        g.drawImage(halo, 0, 0, env.W, env.H);
        g.globalAlpha = o.ink ?? 1;
        g.drawImage(ink, 0, 0, env.W, env.H);
        g.restore();
        if (pencilFn) {
            const pen = Motion.layer(env, 'blueprint-pencil', (pg) => {
                pg.save();
                camOn(pg);
                pencilFn(pg);
                // a pencil rides the cloth's grain: the tooth takes more of it than of the print
                pg.globalCompositeOperation = 'destination-out';
                pg.imageSmoothingQuality = 'high';
                pg.drawImage(P.tooth, P.box.x, P.box.y, P.box.w, P.box.h);
                pg.globalAlpha = 0.7;
                pg.drawImage(P.tooth, P.box.x, P.box.y, P.box.w, P.box.h);
                pg.restore();
            });
            const pg = pen.getContext('2d');
            pg.save();
            pg.setTransform(1, 0, 0, 1, 0, 0);
            pg.globalCompositeOperation = 'source-in';
            pg.fillStyle = `rgb(${o.pencil ?? PENCIL})`;
            pg.fillRect(0, 0, pen.width, pen.height);
            pg.restore();
            g.save();
            g.imageSmoothingQuality = 'high';
            g.globalAlpha = 0.95;
            g.drawImage(pen, 0, 0, env.W, env.H);
            g.restore();
        }
    }

    return { FONT, INK, PENCIL, LUT, fontFor, paper, drawing, frame, arrow, dimV, dimH, level, title, textWidth, noise: { h2, vn, fbm, sstep } };
})();
