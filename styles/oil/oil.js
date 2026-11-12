// Oil style kit: a picture is painted twice. First as a flat «study» (ordinary canvas
// shapes, plus the direction the brush takes in every area); then the kit lays brush
// strokes over it, coarse to fine, each kept inside its own colour area, and stamps them
// as thick paint: a stroke is a set of bristle tracks with its own relief (rails at the
// borders, a ridge where the brush lifts, dry gaps at the end), lit from the top left like
// a canvas by a window.
//
//   const st = Oil.study(box);                       // box: { x, y, w, h } in logical units
//   st.paint({ dir: 0 }, (g) => { g.fillStyle = '#89a'; g.fillRect(...); });
//   const strokes = Oil.lay(st, Oil.LOOSE, { seed: 'now' });
//   const pic = Oil.painting(env, box);
//   pic.base(strokes);                               // once
//   pic.frame(d, (s) => s.stamp(more, Oil.focus(more, d, gazeAt)));   // per drawing
//   (Oil.lay(st, levels, { blur: 13, lines: false }) paints the study out of focus)
//   pic.draw(g);
const Oil = (() => {
    const STRIDE = 15; // x y ang hl hw r g b r2 g2 b2 seed level bend kind (1 = a piece of a line)
    const clamp = (x, a, b) => (x < a ? a : x > b ? b : x);
    const hex = (c) => {
        const s = c.replace('#', '');
        const n = parseInt(s.length === 3 ? s.replace(/./g, '$&$&') : s, 16);
        return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    };

    // Brush sets, coarse to fine. w: brush width (logical units), len: stroke length in
    // widths, gap: grid spacing in widths, tol: how far the picture so far may be from
    // the study before a stroke is spent there (0 = cover everything), edge: how far the
    // colour may drift along a stroke before it stops, jit: colour broken per stroke
    // [lightness, temperature, hue (rad), share of accents], load: how much paint the
    // brush carries, any: share of strokes laid whatever the error (they blur edges).
    const LOOSE = [
        { w: 84, len: 2.6, gap: 0.5, tol: 0, edge: 80, jit: [0.08, 7, 0.2, 0.1], load: 1.25 },
        { w: 44, len: 2.8, gap: 0.55, tol: 13, edge: 46, jit: [0.08, 7, 0.2, 0.1], load: 1.1 },
        { w: 24, len: 3, gap: 0.6, tol: 24, edge: 34, jit: [0.07, 6, 0.2, 0.1], load: 1 },
    ];
    const FINE = [
        { w: 40, len: 3, gap: 0.5, tol: 0, edge: 40, jit: [0.06, 6, 0.3, 0.04], load: 1.05 },
        { w: 20, len: 3.2, gap: 0.55, tol: 9, edge: 26, jit: [0.06, 6, 0.3, 0.08], load: 1 },
        { w: 10, len: 3.4, gap: 0.6, tol: 11, edge: 20, jit: [0.05, 5, 0.26, 0.18], load: 0.95 },
        { w: 5, len: 3.6, gap: 0.62, tol: 13, edge: 16, jit: [0.04, 4, 0.15, 0.08], load: 0.9, wet: 0.3 },
        { w: 2.6, len: 4, gap: 0.66, tol: 17, edge: 14, jit: [0.03, 3, 0.1, 0.04], load: 0.85, wet: 0.2 },
        { w: 1.5, len: 3.6, gap: 0.7, tol: 19, edge: 13, jit: [0.02, 2, 0.06, 0], load: 0.8, wet: 0.15 },
    ];

    // --- study: the flat picture and the brush directions -----------------------------
    function study(box, o = {}) {
        const s = o.res ?? 0.8;
        const cw = Math.ceil(box.w * s), ch = Math.ceil(box.h * s);
        const mk = () => {
            const c = document.createElement('canvas');
            c.width = cw;
            c.height = ch;
            const g = c.getContext('2d', { willReadFrequently: true });
            g.setTransform(s, 0, 0, s, -box.x * s, -box.y * s);
            return g;
        };
        const cg = mk(), dg = mk();
        // the direction canvas takes the same drawing calls with every colour replaced
        const forced = new Proxy(dg, {
            set(t, p, v) {
                if (p !== 'fillStyle' && p !== 'strokeStyle' && p !== 'shadowColor' && p !== 'shadowBlur' && p !== 'filter') t[p] = v;
                return true;
            },
            get(t, p) {
                const v = t[p];
                return typeof v === 'function' ? v.bind(t) : v;
            },
        });
        const lines = [];
        const api = {
            box, s, cw, ch, g: cg, lines,
            // dir: brush angle in radians (0 = horizontal); dab: 0 = long parallel strokes,
            // 1 = short dabs in every direction (foliage, flowers)
            paint(d, fn) {
                const a = d.dir ?? 0, dab = d.dab ?? 0;
                const col = `rgb(${Math.round(128 + 127 * Math.cos(2 * a))},${Math.round(128 + 127 * Math.sin(2 * a))},${Math.round(255 * dab)})`;
                cg.save();
                fn(cg);
                cg.restore();
                dg.save();
                dg.fillStyle = col;
                dg.strokeStyle = col;
                fn(forced);
                dg.restore();
            },
            // A line painted in one go (a branch, a rail, a spoke): drawn into the study and
            // laid as strokes along the path at `level`, whatever the grid finds there.
            line(pts, color, width, lo = {}) {
                cg.save();
                cg.strokeStyle = color;
                cg.lineWidth = width;
                cg.lineCap = 'round';
                cg.lineJoin = 'round';
                cg.beginPath();
                pts.forEach(([x, y], i) => (i ? cg.lineTo(x, y) : cg.moveTo(x, y)));
                cg.stroke();
                cg.restore();
                lines.push({ pts, color: hex(color), width, level: lo.level ?? 2, taper: lo.taper ?? 0, seed: lo.seed ?? 'ln' + lines.length });
            },
            // blur (logical units): the study seen out of focus, for a picture that is
            // painted soft: edges melt, small things are lost, masses stay
            data(blur = 0) {
                if (!api._d) api._d = { col: cg.getImageData(0, 0, cw, ch).data, dir: dg.getImageData(0, 0, cw, ch).data };
                if (!blur) return api._d;
                const c = document.createElement('canvas');
                c.width = cw;
                c.height = ch;
                const g = c.getContext('2d', { willReadFrequently: true });
                g.drawImage(cg.canvas, 0, 0);
                g.filter = `blur(${(blur * s).toFixed(2)}px)`;
                g.drawImage(cg.canvas, 0, 0);
                return { col: g.getImageData(0, 0, cw, ch).data, dir: api._d.dir };
            },
        };
        // a neutral start: horizontal strokes everywhere
        api.paint({ dir: 0 }, (g) => { g.fillStyle = o.ground ?? '#b3a188'; g.fillRect(box.x, box.y, box.w, box.h); });
        return api;
    }

    // --- lay: decide every stroke from the study --------------------------------------
    // Returns { n, a: Float32Array, levels } with the strokes in painting order.
    function lay(st, levels, o = {}) {
        const { col, dir } = st.data(o.blur ?? 0), { cw, ch, s, box } = st, raw = st.data().col;
        const rnd = Motion.rng(o.seed ?? 'oil');
        const cur = new Float32Array(cw * ch * 3);
        const gr = hex(o.ground ?? '#b3a188');
        for (let i = 0; i < cw * ch; i++) { cur[i * 3] = gr[0]; cur[i * 3 + 1] = gr[1]; cur[i * 3 + 2] = gr[2]; }
        const out = [];
        const keep = o.keep;
        const flat = (cx, cy, ang, hl, hw, r, g, b) => {
            const dx = Math.cos(ang), dy = Math.sin(ang);
            const ex = Math.abs(dx) * hl + Math.abs(dy) * hw + 1, ey = Math.abs(dy) * hl + Math.abs(dx) * hw + 1;
            const x0 = Math.max(0, Math.floor(cx - ex)), x1 = Math.min(cw - 1, Math.ceil(cx + ex));
            const y0 = Math.max(0, Math.floor(cy - ey)), y1 = Math.min(ch - 1, Math.ceil(cy + ey));
            for (let y = y0; y <= y1; y++) {
                for (let x = x0; x <= x1; x++) {
                    const X = x - cx, Y = y - cy, a = X * dx + Y * dy, bb = -X * dy + Y * dx;
                    if (a < -hl || a > hl || bb < -hw || bb > hw) continue;
                    const i = (y * cw + x) * 3;
                    cur[i] = r; cur[i + 1] = g; cur[i + 2] = b;
                }
            }
        };
        const push = (x, y, ang, hl, hw, c, c2, level, bend) => {
            out.push(x, y, ang, hl, hw, c[0], c[1], c[2], c2[0], c2[1], c2[2], Math.floor(rnd() * 1e6), level, bend, 0);
        };
        // Broken colour: no two strokes of one area carry the same paint. Each varies in
        // lightness, temperature, hue and strength, and a share of them are accents of
        // another hue at the same value (blue and violet in the darks, yellow and rose in
        // the lights), as on a palette that is never mixed through.
        const broken = (c, jit, k = 1) => {
            const l = 1 + (rnd() - 0.5) * 2 * jit[0] * k, tmp = (rnd() - 0.5) * 2 * jit[1] * k;
            const Y = (c[0] * 0.299 + c[1] * 0.587 + c[2] * 0.114) * l;
            let cr = c[0] * l - Y, cb = c[2] * l - Y;
            const ph = (rnd() - 0.5) * 2 * (jit[2] ?? 0.25) * k, cs = Math.cos(ph), sn = Math.sin(ph), gain = 0.8 + rnd() * 0.5;
            [cr, cb] = [(cr * cs - cb * sn) * gain, (cr * sn + cb * cs) * gain];
            if (rnd() < (jit[3] ?? 0.16) * k) {
                const dark = Y < 105, m = (10 + rnd() * 16) * (dark ? 0.9 : 1), a = dark ? 1.2 + rnd() * 1.3 : rnd() < 0.6 ? -1.2 + rnd() * 0.9 : 0.2 + rnd() * 0.8;
                cr += Math.cos(a) * m;
                cb += Math.sin(a) * m;
            }
            const R = Y + cr + tmp, B = Y + cb - tmp;
            return [clamp(R, 0, 255), clamp((Y - 0.299 * (Y + cr) - 0.114 * (Y + cb)) / 0.587, 0, 255), clamp(B, 0, 255)];
        };
        levels.forEach((L, li) => {
            const batch = [];
            const step = L.w * L.gap, hwA = (L.w / 2) * s;
            const nx = Math.ceil(box.w / step), ny = Math.ceil(box.h / step);
            for (let j = 0; j < ny; j++) {
                for (let i = 0; i < nx; i++) {
                    // best of three candidates in the cell: where the picture is furthest off
                    let best = -1, bx = 0, by = 0;
                    for (let c = 0; c < 3; c++) {
                        const lx = (i + rnd()) * step, ly = (j + rnd()) * step;
                        const px = clamp(Math.floor(lx * s), 0, cw - 1), py = clamp(Math.floor(ly * s), 0, ch - 1);
                        const q = py * cw + px;
                        const e = (Math.abs(col[q * 4] - cur[q * 3]) + Math.abs(col[q * 4 + 1] - cur[q * 3 + 1]) + Math.abs(col[q * 4 + 2] - cur[q * 3 + 2])) / 3;
                        if (e > best) { best = e; bx = lx; by = ly; }
                    }
                    // `any`: a share of strokes laid whatever the error, to drag paint across edges
                    if (L.tol > 0 && best < L.tol && !(L.any && rnd() < L.any)) continue;
                    if (keep && rnd() > keep(box.x + bx, box.y + by, li)) continue;
                    const px = clamp(Math.floor(bx * s), 0, cw - 1), py = clamp(Math.floor(by * s), 0, ch - 1), q = py * cw + px;
                    const c0 = [col[q * 4], col[q * 4 + 1], col[q * 4 + 2]];
                    const dab = dir[q * 4 + 2] / 255;
                    let ang = 0.5 * Math.atan2(dir[q * 4 + 1] - 128, dir[q * 4] - 128) + (rnd() - 0.5) * (0.3 + Math.PI * dab);
                    const dx = Math.cos(ang), dy = Math.sin(ang);
                    // walk both ways until the study's colour leaves this stroke's colour
                    const want = (L.w * L.len * (0.65 + rnd() * 0.7) * (1 - 0.55 * dab)) / 2 * s;
                    const run = (sg) => {
                        let d = 0;
                        while (d < want) {
                            const x = Math.round(px + dx * sg * (d + 1)), y = Math.round(py + dy * sg * (d + 1));
                            if (x < 0 || y < 0 || x >= cw || y >= ch) break;
                            const k = (y * cw + x) * 4;
                            if ((Math.abs(col[k] - c0[0]) + Math.abs(col[k + 1] - c0[1]) + Math.abs(col[k + 2] - c0[2])) / 3 > L.edge) break;
                            d++;
                        }
                        return d;
                    };
                    const fw = run(1), bk = run(-1);
                    const hl = Math.max((fw + bk) / 2, hwA * 0.7), mid = (fw - bk) / 2;
                    const cxA = bx * s + dx * mid, cyA = by * s + dy * mid;
                    // a second colour picked up from next to the stroke, for unmixed streaks
                    const side = rnd() < 0.5 ? 1 : -1;
                    const sx = clamp(Math.round(px - dy * side * hwA * 1.6), 0, cw - 1), sy = clamp(Math.round(py + dx * side * hwA * 1.6), 0, ch - 1), k2 = (sy * cw + sx) * 4;
                    const c1 = broken(c0, L.jit);
                    const nb = [col[k2], col[k2 + 1], col[k2 + 2]];
                    const far = (Math.abs(nb[0] - c0[0]) + Math.abs(nb[1] - c0[1]) + Math.abs(nb[2] - c0[2])) / 3;
                    const mixN = far < 60 ? 0.5 : 0.12;
                    const c2 = broken([c0[0] + (nb[0] - c0[0]) * mixN, c0[1] + (nb[1] - c0[1]) * mixN, c0[2] + (nb[2] - c0[2]) * mixN], L.jit, 1.8);
                    flat(cxA, cyA, ang, hl, hwA, c0[0], c0[1], c0[2]);
                    const lum = c0[0] * 0.3 + c0[1] * 0.59 + c0[2] * 0.11;
                    batch.push([rnd() + (lum / 255) * (o.darkFirst ?? 0.5), box.x + cxA / s, box.y + cyA / s, ang, hl / s, L.w / 2 * (0.82 + rnd() * 0.36), c1, c2, (rnd() - 0.5) * 0.9]);
                }
            }
            batch.sort((a, b) => a[0] - b[0]);
            for (const b of batch) push(b[1], b[2], b[3], b[4], b[5], b[6], b[7], li, b[8]);
            // the lines authored for this level, each in a few strokes along its path
            for (const ln of o.lines === false ? [] : st.lines) {
                if (Math.min(ln.level, levels.length - 1) !== li) continue;
                const r2 = Motion.rng(ln.seed);
                let total = 0;
                const seg = [];
                for (let i = 1; i < ln.pts.length; i++) {
                    const l = Math.hypot(ln.pts[i][0] - ln.pts[i - 1][0], ln.pts[i][1] - ln.pts[i - 1][1]);
                    seg.push(l);
                    total += l;
                }
                const piece = Math.max(ln.width * 3.5, 10), n = Math.max(1, Math.round(total / piece));
                const at = (d) => {
                    let i = 0;
                    while (i < seg.length - 1 && d > seg[i]) d -= seg[i++];
                    const u = seg[i] ? d / seg[i] : 0;
                    return [ln.pts[i][0] + (ln.pts[i + 1][0] - ln.pts[i][0]) * u, ln.pts[i][1] + (ln.pts[i + 1][1] - ln.pts[i][1]) * u];
                };
                for (let k = 0; k < n; k++) {
                    const a = at((total * k) / n), b = at((total * (k + 1)) / n), u = (k + 0.5) / n;
                    // a piece the study no longer shows (a later shape was painted over the
                    // line there) is not laid: what is in front stays in front
                    const mx = Math.round(((a[0] + b[0]) / 2 - box.x) * s), my = Math.round(((a[1] + b[1]) / 2 - box.y) * s);
                    let seen = 1e9;
                    for (let oy = -1; oy <= 1; oy++) for (let ox = -1; ox <= 1; ox++) {
                        const q = (clamp(my + oy, 0, ch - 1) * cw + clamp(mx + ox, 0, cw - 1)) * 4;
                        seen = Math.min(seen, (Math.abs(raw[q] - ln.color[0]) + Math.abs(raw[q + 1] - ln.color[1]) + Math.abs(raw[q + 2] - ln.color[2])) / 3);
                    }
                    if (seen > 40) continue;
                    const w = ln.width * (1 - ln.taper * u) * (0.9 + r2() * 0.2);
                    const cc = [ln.color[0] * (0.92 + r2() * 0.16), ln.color[1] * (0.92 + r2() * 0.16), ln.color[2] * (0.92 + r2() * 0.16)];
                    out.push((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, Math.atan2(b[1] - a[1], b[0] - a[0]), Math.hypot(b[0] - a[0], b[1] - a[1]) / 2 + w * 0.7, w / 2,
                        cc[0], cc[1], cc[2], cc[0] * 1.12, cc[1] * 1.1, cc[2] * 1.05, Math.floor(r2() * 1e6), li, 0, 1);
                }
            }
        });
        return { n: out.length / STRIDE, a: new Float32Array(out), levels };
    }

    // --- surface: paint as colour + relief at output resolution -----------------------
    const bp = new Float32Array(72), bh = new Float32Array(72), b0 = new Float32Array(72), b1 = new Float32Array(72), bt = new Float32Array(72), bm = new Float32Array(72), bd = new Float32Array(72);
    // ss: the paint is stamped at ss × the output size and scaled down when drawn, so
    // bristles and stroke edges are smooth at any size
    function surface(env, box, ss = 1.5) {
        const k = env.k * ss, pw = Math.ceil(box.w * k), ph = Math.ceil(box.h * k);
        const canvas = document.createElement('canvas');
        canvas.width = pw;
        canvas.height = ph;
        const ctx = canvas.getContext('2d');
        const img = ctx.createImageData(pw, ph), lit = img.data;
        const col = new Uint8ClampedArray(pw * ph * 3), hgt = new Float32Array(pw * ph);
        let colB = null, hgtB = null, litB = null;
        let dirty = null, last = null;
        const grow = (x0, y0, x1, y1) => {
            if (!dirty) dirty = [x0, y0, x1, y1];
            else { dirty[0] = Math.min(dirty[0], x0); dirty[1] = Math.min(dirty[1], y0); dirty[2] = Math.max(dirty[2], x1); dirty[3] = Math.max(dirty[3], y1); }
        };
        const bristle = Math.max(1.7, 1.9 * k); // width of one bristle track, px

        // toned linen. Its weave shows wherever paint is thin or missing, and dry paint
        // only catches the tops of its threads (wx, wy: 1 on a thread, 0 between two)
        const wp = Math.max(3, 3.4 * k), wx = new Float32Array(pw), wy = new Float32Array(ph);
        {
            const rn = Motion.rng('weave');
            let fat = 1;
            for (let x = 0; x < pw; x++) { if (x % Math.round(wp) === 0) fat = 0.8 + 0.2 * rn(); wx[x] = (0.5 + 0.5 * Math.cos((x / wp) * 6.2832 + Math.sin(x * 0.011) * 2)) * fat; }
            for (let y = 0; y < ph; y++) { if (y % Math.round(wp) === 0) fat = 0.8 + 0.2 * rn(); wy[y] = (0.5 + 0.5 * Math.cos((y / wp) * 6.2832 + Math.sin(y * 0.013) * 2)) * fat; }
        }
        function ground(color = '#b3a188') {
            const c = hex(color);
            for (let y = 0; y < ph; y++) {
                for (let x = 0; x < pw; x++) {
                    const i = y * pw + x, wv = wx[x] > wy[y] ? wx[x] : wy[y];
                    const wash = 1 + 0.05 * Math.sin(x * 0.006 / k + y * 0.004 / k) + 0.04 * Math.sin(y * 0.013 / k - x * 0.002 / k + 1.3);
                    hgt[i] = wv * 0.55 * Math.sqrt(k);
                    const m = (0.93 + 0.07 * wv) * wash;
                    col[i * 3] = c[0] * m; col[i * 3 + 1] = c[1] * m; col[i * 3 + 2] = c[2] * m;
                }
            }
            grow(0, 0, pw - 1, ph - 1);
        }

        // sel: null = every stroke whole; or { idx: Int32Array, grow: Float32Array, n }
        function stamp(S, sel) {
            const A = S.a, n = sel ? sel.n : S.n;
            for (let q = 0; q < n; q++) {
                const o = (sel ? sel.idx[q] : q) * STRIDE, uMax = sel ? sel.grow[q] : 1;
                const cx = (A[o] - box.x) * k, cy = (A[o + 1] - box.y) * k, ang = A[o + 2];
                const Wd = Math.max(0.8, A[o + 4] * k), L = Math.max(A[o + 3] * k, Wd);
                const lev = S.levels[A[o + 12]], load = lev.load ?? 1;
                const dx = Math.cos(ang), dy = Math.sin(ang), bend = A[o + 13] * Wd, line = A[o + 14] === 1;
                const ex = Math.abs(dx) * L + Math.abs(dy) * (Wd + Math.abs(bend)) + 2, ey = Math.abs(dy) * L + Math.abs(dx) * (Wd + Math.abs(bend)) + 2;
                const x0 = Math.max(0, Math.floor(cx - ex)), x1 = Math.min(pw - 1, Math.ceil(cx + ex));
                const y0 = Math.max(0, Math.floor(cy - ey)), y1 = Math.min(ph - 1, Math.ceil(cy + ey));
                if (x1 < x0 || y1 < y0) continue;
                grow(x0, y0, x1, y1);
                // this stroke's bristles: how much paint each carries, where it starts and
                // runs dry, its tone and how much of the second colour it drags along
                let h = (A[o + 11] * 2654435761) >>> 0;
                const r = () => { h ^= h << 13; h >>>= 0; h ^= h >>> 17; h ^= h << 5; h >>>= 0; return h / 4294967296; };
                const nB = clamp(Math.round((2 * Wd) / bristle), 1, 70);
                const dryS = line ? 0 : r() < 0.3 ? 0.5 + r() * 0.5 : r() * 0.35; // how dry the whole brush is
                let mix = r(), tone = 0;
                const streak = r() < 0.6 ? 1 : 0.35;
                for (let b = 0; b < nB; b++) {
                    bh[b] = 0.35 + 0.65 * r();
                    b0[b] = r() * 0.05;
                    const e = Math.abs((b + 0.5) / nB * 2 - 1);
                    b1[b] = line ? 1 : (r() < 0.12 + dryS * 0.35 ? 0.72 + r() * 0.2 : 0.9 + r() * 0.1) - e * e * 0.06; // long teeth read as a comb
                    bd[b] = line ? 0 : 0.3 + dryS * (0.5 + r()); // every end breaks up a little: solid teeth read as a comb
                    tone = tone * 0.5 + (r() - 0.5);
                    bt[b] = tone;
                    mix = clamp(mix + (r() - 0.5) * 0.7, 0, 1);
                    bm[b] = mix > 0.62 ? (mix - 0.62) / 0.38 * streak : 0;
                    bp[b] = r();
                }
                // fat over lean: lights go on thick, darks thin (and a thin dark lets the
                // weave through); wet paint drags what is under it along the stroke
                const lum = (A[o + 5] * 0.3 + A[o + 6] * 0.59 + A[o + 7] * 0.11) / 255;
                const T = Math.pow(Wd, 0.55) * load * (0.62 + 0.66 * lum);
                const thin = line || Wd < 4 ? 0 : (1 - lum) * 0.07, wet = line ? 0 : r() * (lev.wet ?? 0.55);
                const rc = line ? Wd : Wd * (0.3 + r() * 0.5), body = 0.25 + r() * 0.75; // corner radius; how much the bristles show
                const wob = nB > 2 ? (0.4 + r()) * 0.6 / nB : 0, wf = 3 + r() * 5, wp = r() * 6.28;
                const r1 = A[o + 5], g1 = A[o + 6], bl1 = A[o + 7], r2 = A[o + 8], g2 = A[o + 9], bl2 = A[o + 10];
                const sd = A[o + 11] | 0;
                for (let y = y0; y <= y1; y++) {
                    const Y = y - cy;
                    for (let x = x0; x <= x1; x++) {
                        const X = x - cx, a = X * dx + Y * dy, an = a / L;
                        if (an < -1 || an > 1) continue;
                        const bb = -X * dy + Y * dx - bend * (an * an - 0.33), v = bb / Wd;
                        if (v <= -1 || v >= 1) continue;
                        const ds = a + L;
                        let cap = 1;
                        if (ds < rc) {
                            // a flat brush sets down squarish: only its corners are round
                            const qa = rc - ds, qb = Math.abs(bb) - (Wd - rc);
                            if (qb > 0) { cap = rc - Math.sqrt(qa * qa + qb * qb) + 0.5; if (cap <= 0) continue; }
                        }
                        const u = an * 0.5 + 0.5;
                        // bristles wander along the stroke and are not evenly spaced
                        let tv = v * 0.5 + 0.5 + wob * Math.sin(u * wf + wp);
                        tv += (0.3 / nB) * Math.sin(tv * nB * 2.3 + wp);
                        const fb = (tv < 0 ? 0 : tv > 0.9999 ? 0.9999 : tv) * nB, bi = fb | 0, ff = fb - bi;
                        if (u < b0[bi]) continue;
                        const ue = b1[bi] * uMax;
                        if (u > ue) continue;
                        const uu = u / ue;
                        // dry brush: toward the end, and all along a thin dark stroke, the
                        // paint only catches the tops of the canvas threads
                        const dq = (uu > 0.62 ? (uu - 0.62) * 2.6 * bd[bi] : 0) + thin;
                        if (dq > 0) {
                            let hh = Math.imul(x, 374761393) ^ Math.imul(y, 668265263) ^ sd;
                            hh = Math.imul(hh ^ (hh >>> 13), 1274126177);
                            if ((wx[x] > wy[y] ? wx[x] : wy[y]) * 0.42 + (((hh >>> 8) & 0xffff) / 65536) * 0.58 < dq) continue; // threads, but not a grid of dots
                        }
                        const av = Math.abs(v);
                        const al = Math.min(1, cap, (1 - av) * Wd + 0.35, (ue - u) * 2 * L + 0.35) * (1 - bp[bi] * wet * u);
                        const ridge = bh[bi] * (0.3 + 2.8 * ff * (1 - ff));
                        const rail = av > 0.7 ? (av - 0.7) / 0.3 : 0;
                        const blob = uu > 0.84 && b1[bi] > 0.86 && !line ? (uu - 0.84) / 0.16 : 0; // only where the whole brush lifts
                        const hNew = T * (0.25 + 0.5 * body * ridge * (1 - 0.45 * u) + 0.6 * rail * rail * (1 - rail * rail * 0.5) + 0.55 * blob * blob);
                        const i = y * pw + x, m = bm[bi], tn = 1 + bt[bi] * 0.055 + (ridge - 0.4) * 0.05;
                        hgt[i] = hgt[i] * (1 - 0.72 * al) + hNew * al;
                        const i3 = i * 3;
                        col[i3] += ((r1 + (r2 - r1) * m) * tn - col[i3]) * al;
                        col[i3 + 1] += ((g1 + (g2 - g1) * m) * tn - col[i3 + 1]) * al;
                        col[i3 + 2] += ((bl1 + (bl2 - bl1) * m) * tn - col[i3 + 2]) * al;
                    }
                }
            }
        }

        // light the relief: window light from the top left, a little gloss on the ridges
        function light(rect) {
            const [X0, Y0, X1, Y1] = rect;
            const rel = 0.142 * Math.pow(k, 0.45); // the same relief at any size
            for (let y = Math.max(1, Y0); y <= Math.min(ph - 2, Y1); y++) {
                for (let x = Math.max(1, X0); x <= Math.min(pw - 2, X1); x++) {
                    const i = y * pw + x;
                    const e = ((hgt[i + 1] - hgt[i - 1]) * 0.62 + (hgt[i + pw] - hgt[i - pw]) * 0.78) * rel;
                    const sh = 1 + (e > 0.13 ? 0.13 : e < -0.42 ? -0.42 : e);
                    const sp = e > 0.2 ? Math.min(20, (e - 0.2) * (e - 0.2) * 380) : 0;
                    const i3 = i * 3, i4 = i * 4;
                    lit[i4] = col[i3] * sh + sp;
                    lit[i4 + 1] = col[i3 + 1] * sh + sp;
                    lit[i4 + 2] = col[i3 + 2] * sh + sp * 0.92;
                    lit[i4 + 3] = 255;
                }
            }
        }
        const copyRect = (src, dst, ch, r) => {
            for (let y = r[1]; y <= r[3]; y++) {
                const a = (y * pw + r[0]) * ch, b = (y * pw + r[2] + 1) * ch;
                dst.set(src.subarray(a, b), a);
            }
        };
        return {
            canvas, pw, ph, ground, stamp,
            // freeze what is painted so far as the picture every drawing starts from
            save() {
                light([0, 0, pw - 1, ph - 1]);
                // the outer pixel has no neighbours to light it from: copy the next one in
                for (let x = 0; x < pw; x++) for (let c = 0; c < 4; c++) { lit[x * 4 + c] = lit[(pw + x) * 4 + c]; lit[((ph - 1) * pw + x) * 4 + c] = lit[((ph - 2) * pw + x) * 4 + c]; }
                for (let y = 0; y < ph; y++) for (let c = 0; c < 4; c++) { lit[y * pw * 4 + c] = lit[(y * pw + 1) * 4 + c]; lit[(y * pw + pw - 1) * 4 + c] = lit[(y * pw + pw - 2) * 4 + c]; }
                colB = col.slice();
                hgtB = hgt.slice();
                litB = lit.slice();
                dirty = null;
                last = null;
                ctx.putImageData(img, 0, 0);
            },
            // back to the saved picture, paint this drawing's strokes, light what changed
            redo(fn) {
                const prev = last;
                if (last) { copyRect(colB, col, 3, last); copyRect(hgtB, hgt, 1, last); copyRect(litB, lit, 4, last); }
                dirty = null;
                fn(this);
                if (dirty) {
                    const r = [Math.max(1, dirty[0] - 2), Math.max(1, dirty[1] - 2), Math.min(pw - 2, dirty[2] + 2), Math.min(ph - 2, dirty[3] + 2)];
                    light(r);
                    last = [Math.max(0, r[0] - 1), Math.max(0, r[1] - 1), Math.min(pw - 1, r[2] + 1), Math.min(ph - 1, r[3] + 1)];
                } else last = null;
                const u = prev && last ? [Math.min(prev[0], last[0]), Math.min(prev[1], last[1]), Math.max(prev[2], last[2]), Math.max(prev[3], last[3])] : prev ?? last;
                if (u) ctx.putImageData(img, 0, 0, u[0], u[1], u[2] - u[0] + 1, u[3] - u[1] + 1);
            },
        };
    }

    // --- painting: a surface with a base picture and one repaint per drawing -----------
    function painting(env, box, o = {}) {
        const sf = surface(env, box, o.ss);
        let at = null;
        return {
            box, surface: sf,
            base(...sets) {
                sf.ground(o.ground);
                for (const S of sets) sf.stamp(S, null);
                sf.save();
                at = null;
            },
            // d identifies the drawing: the same d is never painted twice in a row
            frame(d, fn) {
                if (at === d) return;
                sf.redo(fn);
                at = d;
            },
            draw(g) {
                g.imageSmoothingQuality = 'high';
                g.drawImage(sf.canvas, box.x, box.y, box.w, box.h);
            },
        };
    }

    // --- marks: a set of strokes placed by hand (what moves: a bird, a leaf turning) ----
    // list: [{ x, y, ang, len, w, color, color2?, kind? }], all at `level` of `levels`.
    function marks(list, levels, level, seed = 'marks') {
        const a = new Float32Array(list.length * STRIDE), rn = Motion.rng(seed);
        list.forEach((m, i) => {
            const c = typeof m.color === 'string' ? hex(m.color) : m.color, c2 = m.color2 ? (typeof m.color2 === 'string' ? hex(m.color2) : m.color2) : c;
            a.set([m.x, m.y, m.ang ?? 0, (m.len ?? m.w * 3) / 2, m.w / 2, c[0], c[1], c[2], c2[0], c2[1], c2[2], Math.floor(rn() * 1e6), level, m.bend ?? 0, m.kind ?? 0], i * STRIDE);
        });
        return { n: list.length, a, levels };
    }

    // --- focus: which strokes of a set exist in drawing d ------------------------------
    // gaze(d) → { x, y, r } for any drawing index. A stroke exists while its place is
    // inside its level's share of the radius (coarse levels reach further out, so the
    // picture is blocked in at the rim and finished at the centre), lingers a few
    // drawings after the gaze leaves (the finest go first), and is laid in over three
    // drawings when it appears.
    function focus(S, d, gaze, o = {}) {
        const A = S.a, nL = S.levels.length;
        const reach = o.reach ?? S.levels.map((_, i) => 1.06 - (0.18 * i) / Math.max(1, nL - 1));
        const linger = o.linger ?? S.levels.map((_, i) => Math.round(5 - (4 * i) / Math.max(1, nL - 1)));
        const wide = o.wide ?? 1.25;
        const back = 8, gz = [];
        for (let j = 0; j <= back; j++) gz.push(gaze(d - j));
        if (!S._idx) { S._idx = new Int32Array(S.n); S._grow = new Float32Array(S.n); }
        let n = 0;
        const rMax = Math.max(...gz.map((q) => q.r)) * 1.5 * wide;
        for (let i = 0; i < S.n; i++) {
            const o2 = i * STRIDE, x = A[o2], y = A[o2 + 1];
            if (Math.abs(x - gz[0].x) > rMax + 400 && Math.abs(x - gz[back].x) > rMax + 400) continue;
            const lv = A[o2 + 12], sd = A[o2 + 11];
            const jit = 0.86 + ((sd * 7919) % 1000) / 1000 * 0.28, hold = Math.round(linger[lv] * (0.4 + ((sd * 104729) % 1000) / 1000 * 0.9));
            // the patch is no ellipse: its rim wanders (q.ph turns the lobes over time)
            const inside = (q) => {
                const R = q.r * reach[lv] * jit, ux = (x - q.x) / wide, uy = y - q.y, d2 = ux * ux + uy * uy, R2 = R * R;
                if (d2 > R2 * 1.7) return false;
                if (d2 < R2 * 0.45) return true;
                const a = Math.atan2(uy, ux), ph = q.ph ?? 0;
                const m = 1 + 0.13 * Math.sin(2 * a + ph) + 0.09 * Math.sin(3 * a - 1.7 * ph + 1) + 0.05 * Math.sin(5 * a + 2.3 * ph + 2);
                return d2 < R2 * m * m;
            };
            let run = 0;
            while (run < 3 && inside(gz[run])) run++;
            let g = 0;
            if (run > 0) g = run === 1 ? 0.5 : run === 2 ? 0.8 : 1;
            else for (let j = 1; j <= hold && j <= back; j++) if (inside(gz[j])) { g = 1; break; }
            if (g > 0) { S._idx[n] = i; S._grow[n] = g; n++; }
        }
        return { idx: S._idx, grow: S._grow, n };
    }

    return { STRIDE, LOOSE, FINE, hex, study, lay, surface, painting, focus, marks };
})();
