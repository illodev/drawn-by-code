// Woodcut style kit: a scene is cut into a plank and printed on paper. You work the block
// with two gestures: ink (the uncut face of the wood, which prints black) and cuts (wood
// carved away: the paper shows). A second block, ochre by default, prints only where you
// paint it, under the key block and a little out of register. Global: Woodcut.
//
//   const blk = Woodcut.block(env)        once, in setup
//   blk.begin()                           a fresh block for this drawing
//   blk.base(key, fn)                     a cached part of the block: fn(blk) runs once, then
//                                         its result is pasted (static sets, cut once)
//   blk.ink(fn) / blk.cut(fn)             fn(g) fills or strokes in logical units: ink adds
//                                         printing surface, cut carves it away
//   blk.hatch(o)                          gouge marks over a region (cuts by default): the
//                                         white share follows o.tone, the marks follow o.dir
//   blk.ochre(fn)                         paint on the second block (any colour, alpha counts)
//   blk.print(g, { key, seed })           presses paper, ochre and ink onto g; key = memo
//                                         (the drawing), seed = this print's inking
//
// Every number is measured on the references at 1280 px wide (one logical unit = one
// reference pixel when the scene is authored at 1280 × 720): cuts 1.5–2.4 px wide (p90
// 3–7), 12–20 px long (p90 30–100), 17–22 % of a dark area carved, paper specks in the
// black 12–20 per 10 000 px, ink (19, 20, 20), paper (216, 191, 159), ochre printed on the
// paper (214, 162, 79). The wood grain in the solid black is faint (coherence 0.07).
const Woodcut = (() => {
    const PAPER = [226, 202, 170];   // the sheet itself (the mean of carved areas, 216 191 159, is the paper darkened at the cuts' edges)
    const INK = [11, 12, 12];          // the ink film; a solid prints 12–28 with its density
    const OCHRE = [242, 204, 120];     // a multiplier: paper × OCHRE / 255 = the printed ochre (214, 162, 79)
    const TAU = Math.PI * 2;
    const clamp = (v, a = 0, b = 1) => (v < a ? a : v > b ? b : v);

    // --- the gouge: one cut (or one line left standing), a lens from a to b ------------
    // w = the widest point, in logical units. The V gouge goes in at a point, swells and
    // lifts out a little blunter (asym > 1 moves the swell towards the exit). rag roughens
    // the walls, bend bows the cut (a fraction of its length, signed).
    function gouge(g, ax, ay, bx, by, w, r, o = {}) {
        const dx = bx - ax, dy = by - ay, L = Math.hypot(dx, dy);
        if (L < 0.3 || w <= 0) return;
        const ux = dx / L, uy = dy / L, nx = -uy, ny = ux;
        const n = Math.max(6, Math.min(40, Math.round(L / 1.8)));
        const asym = o.asym ?? 1.35, rag = o.rag ?? 0.5, bend = (o.bend ?? 0) * L, pw = o.pow ?? 0.75;
        const left = [], right = [];
        for (let i = 0; i <= n; i++) {
            const s = i / n, sa = Math.pow(s, 1 / asym);
            const h = (w / 2) * Math.pow(Math.sin(Math.PI * sa), pw) * (1 + rag * (r() - 0.5));
            const off = bend * 4 * s * (1 - s);
            const cx = ax + dx * s + nx * off, cy = ay + dy * s + ny * off;
            left.push(cx + nx * h, cy + ny * h);
            right.push(cx - nx * h, cy - ny * h);
        }
        g.beginPath();
        g.moveTo(left[0], left[1]);
        for (let i = 2; i < left.length; i += 2) g.lineTo(left[i], left[i + 1]);
        for (let i = right.length - 2; i >= 0; i -= 2) g.lineTo(right[i], right[i + 1]);
        g.closePath();
        g.fill();
    }

    // a groove along a polyline: a long cut of almost even width, tapered at both ends
    // (wires, outlines, the edge of a roof). taper = the length of each end, in units.
    function groove(g, pts, w, r, o = {}) {
        if (pts.length < 2) return;
        const seg = [0];
        for (let i = 1; i < pts.length; i++) seg.push(seg[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
        const total = seg[seg.length - 1];
        if (total < 0.5) return;
        const taper = Math.min(o.taper ?? Math.max(3, w * 3), total / 2), rag = o.rag ?? 0.3, step = o.step ?? 2.5;
        const left = [], right = [];
        let j = 0;
        for (let s = 0; s <= total + 1e-6; s += step) {
            while (j < pts.length - 2 && seg[j + 1] < s) j++;
            const a = pts[j], b = pts[j + 1], sl = seg[j + 1] - seg[j] || 1, f = clamp((s - seg[j]) / sl);
            const x = a[0] + (b[0] - a[0]) * f, y = a[1] + (b[1] - a[1]) * f;
            const ux = (b[0] - a[0]) / sl, uy = (b[1] - a[1]) / sl;
            const e = Math.min(s, total - s) / taper, h = (w / 2) * Math.pow(clamp(e), 0.6) * (1 + rag * (r() - 0.5));
            left.push(x - uy * h, y + ux * h);
            right.push(x + uy * h, y - ux * h);
        }
        g.beginPath();
        g.moveTo(left[0], left[1]);
        for (let i = 2; i < left.length; i += 2) g.lineTo(left[i], left[i + 1]);
        for (let i = right.length - 2; i >= 0; i -= 2) g.lineTo(right[i], right[i + 1]);
        g.closePath();
        g.fill();
    }

    // smooth 2D value noise in logical units, 0..1 (for clumping tone in vector work)
    function hash2(ix, iy, s) {
        let h = Math.imul(ix, 374761393) ^ Math.imul(iy, 668265263) ^ Math.imul(s, 2246822519);
        h = Math.imul(h ^ (h >>> 13), 1274126177);
        return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
    }
    function noise2(seed, x, y) {
        const s = typeof seed === 'number' ? seed : Motion.hashStr(seed);
        const ix = Math.floor(x), iy = Math.floor(y);
        let u = x - ix, v = y - iy;
        u = u * u * (3 - 2 * u); v = v * v * (3 - 2 * v);
        const a = hash2(ix, iy, s), b = hash2(ix + 1, iy, s), c = hash2(ix, iy + 1, s), d = hash2(ix + 1, iy + 1, s);
        return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
    }

    // --- hatching: gouge marks over a region ----------------------------------------
    // o.box [x0, y0, x1, y1] where to lay marks; o.clip(g) builds the region's path (no
    // beginPath needed) or is omitted; o.dir an angle or (x, y) → angle (the way the cut
    // runs: along a slope, along a course of stones); o.tone 0..1 or (x, y) → the share
    // of the area carved white; o.sp the distance between rows; o.len [a, b] and o.gap [a,
    // b] along a row; o.wMin the thinnest cut a gouge makes (below it marks thin out
    // instead: the sparse flicks of a dark slope); o.wMax; o.seed; o.ink: lay ink marks
    // (black left standing on white) instead of cuts.
    function hatch(g, o) {
        const r = Motion.rng('hatch:' + (o.seed ?? 0));
        const tone0 = typeof o.tone === 'function' ? o.tone : () => o.tone ?? 0.2;
        // clump: the carver works in patches, so the tone breaks into clusters of cuts and
        // stretches of solid black (o.clump 0..1, o.clumpScale in units)
        const cl = o.clump ?? 0, cs = o.clumpScale ?? 60, cseed = Motion.hashStr('clump:' + (o.seed ?? 0));
        const toneF = cl > 0
            ? (x, y) => tone0(x, y) * Math.max(0, 1 + cl * (2 * (0.65 * noise2(cseed, x / cs, y / cs) + 0.35 * noise2(cseed + 7, x / (cs * 0.4), y / (cs * 0.4))) - 1) * 1.6)
            : tone0;
        const sp = o.sp ?? 6, [l0, l1] = o.len ?? [10, 22], [g0, g1] = o.gap ?? [4, 12];
        const [k0, k1] = o.run ?? [1, 1], km = (k0 + k1) / 2;
        const lm = (l0 + l1) / 2, gm = (g0 + g1) / 2, fill = lm / (lm + gm);
        const wMin = o.wMin ?? 1.3, wMax = o.wMax ?? sp * 1.6, shape = { asym: o.asym, rag: o.rag, pow: o.pow };
        const [x0, y0, x1, y1] = o.box;
        // o.fit (a cell size in units): marks are proposed generously and each is kept only
        // if it brings the carved share of the cells it crosses closer to the tone, so the
        // tone lands where it is asked for, at the scale of the cell, with natural marks
        const fit = o.fit ?? 0, over = fit ? (o.over ?? 2.2) : 1;
        let FX, FY, FT, FC, fcell;
        if (fit) {
            fcell = fit; FX = Math.ceil((x1 - x0) / fcell) + 1; FY = Math.ceil((y1 - y0) / fcell) + 1;
            FT = new Float32Array(FX * FY); FC = new Float32Array(FX * FY);
            for (let j = 0; j < FY; j++) for (let i = 0; i < FX; i++) FT[j * FX + i] = clamp(toneF(x0 + (i + 0.5) * fcell, y0 + (j + 0.5) * fcell));
        }
        const cand = [];
        // a run: k parallel gouges side by side, the way a carver repeats a stroke
        const mark = (cx, cy, a, L, bend) => {
            if (cx < x0 - L || cx > x1 + L || cy < y0 - L || cy > y1 + L) return;
            const k = k0 + Math.floor(r() * (k1 - k0 + 1)), ca = Math.cos(a), sa = Math.sin(a);
            for (let j = 0; j < k; j++) {
                const off = (j - (k - 1) / 2) * sp * (0.85 + 0.3 * r()), sh = (r() - 0.5) * L * 0.35;
                const mx = cx - sa * off + ca * sh, my = cy + ca * off + sa * sh, Lj = L * (k > 1 ? 0.6 + 0.6 * r() : 1);
                const tau = clamp(toneF(mx, my));
                if (tau <= 0.001) continue;
                let w = (tau * sp) / (fill * 0.62);
                if (w < wMin) { if (!fit && r() > w / wMin) continue; w = wMin; }
                w = Math.min(w, wMax) * (0.65 + 0.7 * r());
                cand.push([mx, my, ca, sa, Lj, w, bend + (r() - 0.5) * 0.05]);
            }
        };
        if (typeof o.dir === 'function') {
            // a field: one run per jittered cell, each following the field where it lies
            const cell = Math.sqrt(sp * km * (lm + gm) / over);
            for (let y = y0 - cell; y < y1 + cell; y += cell) {
                for (let x = x0 - cell; x < x1 + cell; x += cell) {
                    const cx = x + r() * cell, cy = y + r() * cell, L = l0 + (l1 - l0) * r();
                    const a = o.dir(cx, cy), a2 = o.dir(cx + Math.cos(a) * L / 2, cy + Math.sin(a) * L / 2);
                    let da = a2 - a; da = Math.atan2(Math.sin(da), Math.cos(da));
                    mark(cx, cy, a + da / 2, L, (o.bend ?? 0) + da * 0.5 + (r() - 0.5) * 0.08);
                }
            }
        } else {
            // rows across the region in the cut's own direction, staggered like brickwork
            const a = o.dir ?? 0, ca = Math.cos(a), sa = Math.sin(a);
            const cs2 = [[x0, y0], [x1, y0], [x1, y1], [x0, y1]].map(([x, y]) => [x * ca + y * sa, -x * sa + y * ca]);
            const umin = Math.min(...cs2.map((c) => c[0])), umax = Math.max(...cs2.map((c) => c[0]));
            const vmin = Math.min(...cs2.map((c) => c[1])), vmax = Math.max(...cs2.map((c) => c[1]));
            const vs = (sp * km) / over;
            for (let v = vmin + r() * vs; v < vmax + vs; v += vs * (0.8 + 0.4 * r())) {
                let u = umin - r() * (l1 + g1);
                while (u < umax) {
                    const L = l0 + (l1 - l0) * r(), gap = g0 + (g1 - g0) * r();
                    const um = u + L / 2, vj = v + (r() - 0.5) * sp * (o.jitter ?? 0.3);
                    mark(um * ca - vj * sa, um * sa + vj * ca, a + (r() - 0.5) * (o.wobble ?? 0.04), L, (o.bend ?? 0) + (r() - 0.5) * 0.06);
                    u += L + gap;
                }
            }
        }
        if (fit) {
            // shuffle, then keep a mark only if it lowers the squared error of the cells it covers
            for (let i = cand.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); const t = cand[i]; cand[i] = cand[j]; cand[j] = t; }
            // o.fitTol: no cell a mark crosses may end up carved more than this over its tone
            const st = fcell * 0.5, keep = [], tol = o.fitTol ?? Infinity;
            for (const m of cand) {
                const [mx, my, ca, sa, L, w] = m, n = Math.max(2, Math.round(L / st));
                let gain = 0, cost = 0, over = false;
                const cells = [], adds = [];
                for (let q = 0; q < n; q++) {
                    const s = (q + 0.5) / n, x = mx + ca * L * (s - 0.5), y = my + sa * L * (s - 0.5);
                    const i = Math.floor((x - x0) / fcell), j = Math.floor((y - y0) / fcell);
                    if (i < 0 || j < 0 || i >= FX || j >= FY) continue;
                    const add = (w * 0.86 * (L / n)) / (fcell * fcell), c = j * FX + i;   // 0.86: a printed lens covers this share of its box (measured)
                    gain += add * (FT[c] - FC[c]); cost += add * add / 2;
                    if (FC[c] + add > FT[c] + tol) over = true;
                    cells.push(c); adds.push(add);
                }
                if (cells.length && gain > cost && !over) { for (let q = 0; q < cells.length; q++) FC[cells[q]] += adds[q]; keep.push(m); }
            }
            cand.length = 0; cand.push(...keep);
        }
        g.save();
        if (o.clip) { g.beginPath(); o.clip(g); g.clip(); }
        for (const [mx, my, ca, sa, L, w, bend] of cand) {
            const hx = ca * L / 2, hy = sa * L / 2;
            gouge(g, mx - hx, my - hy, mx + hx, my + hy, w, r, { ...shape, bend });
        }
        g.restore();
    }

    // radial cuts from a point (a lamp's rays): n gouges between angles a0..a1 and radii
    // r0..r1, each a little shorter or longer
    function rays(g, cx, cy, a0, a1, r0, r1, n, w, seed, o = {}) {
        const r = Motion.rng('rays:' + seed);
        for (let i = 0; i < n; i++) {
            const a = a0 + (a1 - a0) * ((i + 0.5 + (r() - 0.5) * 0.6) / n);
            const ra = r0 + (r1 - r0) * r() * (o.inner ?? 0.25), rb = r1 * (0.7 + 0.3 * r()) * (o.reach ?? 1);
            gouge(g, cx + Math.cos(a) * ra, cy + Math.sin(a) * ra, cx + Math.cos(a) * rb, cy + Math.sin(a) * rb, w * (0.6 + 0.8 * r()), r, { asym: 0.8, rag: 0.4 });
        }
    }

    // a stone wall seen in perspective: the quad [tl, tr, br, bl] in courses of stones. Each
    // stone is carved as a block: its lit top edge as a sliver (a band with straight, chipped
    // sides, never a lens), its left end as a nick, and when the light is strong the whole
    // face inside dark joints. o.courses, o.stone [a, b] (length along the course, units),
    // o.w (the sliver's least width), o.lit 0..1, or o.tone (x, y) → the share to carve
    function masonry(g, quad, o = {}) {
        const r = Motion.rng('wall:' + (o.seed ?? 0));
        const [tl, tr, br, bl] = quad, n = o.courses ?? 10, [s0, s1] = o.stone ?? [14, 30], w = o.w ?? 2, lit0 = o.lit ?? 0.5;
        const lerp = (p, q, f) => [p[0] + (q[0] - p[0]) * f, p[1] + (q[1] - p[1]) * f];
        const j = (v) => v + (r() - 0.5) * 1.1;
        const band = (P) => { g.beginPath(); g.moveTo(j(P[0][0]), j(P[0][1])); for (let i = 1; i < P.length; i++) g.lineTo(j(P[i][0]), j(P[i][1])); g.closePath(); g.fill(); };
        // courses of uneven height (rubble stone, not brick), each joint wobbling a little
        const cuts = [0];
        for (let i = 1; i < n; i++) cuts.push((i + (r() - 0.5) * 0.55) / n);
        cuts.push(1);
        for (let i = 0; i < n; i++) {
            const fa = cuts[i], fb = cuts[i + 1];
            const A = lerp(tl, bl, fa), B = lerp(tr, br, fa), C = lerp(tl, bl, fb), D = lerp(tr, br, fb);
            const len = Math.hypot(B[0] - A[0], B[1] - A[1]);
            let s = -r() * s1;
            while (s < len) {
                const L = (s0 + (s1 - s0) * r()) * (r() < 0.15 ? 1.7 : 1), a = Math.max(0, s), b = Math.min(len, s + L);
                s += L;
                if (b - a < 2.5) continue;
                // the stone's corners (top-left, top-right, bottom-right, bottom-left)
                const P0 = lerp(A, B, a / len), P1 = lerp(A, B, b / len), P3 = lerp(C, D, a / len), P2 = lerp(C, D, b / len);
                const vx = (P3[0] - P0[0]), vy = (P3[1] - P0[1]), ch = Math.hypot(vx, vy), ux = (P1[0] - P0[0]) / (b - a), uy = (P1[1] - P0[1]) / (b - a);
                const jw = Math.min(1.6, ch * 0.18);             // the dark joint around each stone
                const at = (fu, fv) => [P0[0] + ux * (b - a) * fu + vx * fv, P0[1] + uy * (b - a) * fu + vy * fv];
                const tau = o.tone ? clamp(o.tone((P0[0] + P2[0]) / 2, (P0[1] + P2[1]) / 2)) : lit0 * 0.45;
                if (tau < 0.015 || r() > 0.35 + tau * 4) continue;
                const ju = jw / (b - a), jv = jw / ch;
                if (tau > 0.5 + 0.15 * (r() - 0.5)) {
                    // a stone in full light: the face carved inside its joints, a shadow left low right
                    const sh = 0.25 + 0.25 * (1 - tau);
                    band([at(ju, jv), at(1 - ju, jv), at(1 - ju, 1 - sh), at(0.55 + 0.3 * r(), 1 - jv), at(ju, 1 - jv)]);
                } else {
                    // the lit top edge: a sliver as deep as the tone asks; the left end nicked
                    const depth = clamp((tau * 1.25) / 0.9, Math.max(w / ch, 0.12), 0.75);
                    const u0 = ju + r() * 0.15, u1 = 1 - ju - r() * 0.35 * (1 - tau), um = u0 + (u1 - u0) * (0.3 + 0.4 * r());
                    if (r() < 0.35) {
                        // a broken edge: two chips of the lit top
                        band([at(u0, jv), at(um - 0.05, jv + 0.02), at(um - 0.08, jv + depth * (0.4 + 0.6 * r())), at(u0 + 0.05, jv + depth)]);
                        band([at(um + 0.04, jv), at(u1, jv + 0.03), at(u1 - 0.05, jv + depth * (0.3 + 0.5 * r())), at(um + 0.08, jv + depth * (0.5 + 0.5 * r()))]);
                    } else band([at(u0, jv), at(u1, jv + (r() - 0.5) * 0.1), at(u1 - 0.04, jv + depth * (0.5 + 0.5 * r())), at(um, jv + depth * (0.7 + 0.5 * r())), at(u0 + 0.06, jv + depth)]);
                    if (tau > 0.12 && r() < 0.7) band([at(ju, jv), at(ju + Math.min(0.2, 3 / (b - a)), jv), at(ju + 0.03, 1 - jv - 0.2 * r()), at(ju, 1 - jv)]);
                }
            }
        }
    }

    // --- value noise for the press (fixed textures, output pixels) ----------------------
    function vnoise(W, H, seed, sx, sy = sx, smooth = true) {
        const rr = Motion.rng(seed), gw = Math.ceil(W / sx) + 2, gh = Math.ceil(H / sy) + 2, v = new Float32Array(gw * gh), f = new Float32Array(W * H);
        for (let i = 0; i < v.length; i++) v[i] = rr();
        for (let y = 0; y < H; y++) {
            const fy = y / sy, iy = Math.floor(fy);
            let w2 = fy - iy;
            if (smooth) w2 = w2 * w2 * (3 - 2 * w2);
            for (let x = 0; x < W; x++) {
                const fx = x / sx, ix = Math.floor(fx);
                let u = fx - ix;
                if (smooth) u = u * u * (3 - 2 * u);
                const a = v[iy * gw + ix], b = v[iy * gw + ix + 1], c = v[(iy + 1) * gw + ix], d = v[(iy + 1) * gw + ix + 1];
                f[y * W + x] = a + (b - a) * u + (c - a) * w2 + (a - b - c + d) * u * w2;
            }
        }
        return f;
    }

    function block(env, o = {}) {
        const [W, H] = env.px, k = env.k;
        const S1 = W / 1280;                     // output px per reference px
        const mk = () => { const c = document.createElement('canvas'); c.width = W; c.height = H; return c; };
        const keyC = mk(), ochC = mk(), out = mk();
        const kg = keyC.getContext('2d', { willReadFrequently: true }), og = ochC.getContext('2d', { willReadFrequently: true }), pg = out.getContext('2d');
        const reset = (g) => { g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, W, H); g.setTransform(k, 0, 0, k, 0, 0); g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1; };
        const bases = new Map();

        // fixed textures. The paper: a warm laid stock, a faint cloud, laid lines and a few
        // fibres. The ink: the roller's uneven film (low), its mottle (mid), the wood grain
        // (streaks along the plank), specks where the paper shows through, the chips that
        // make a cut's wall ragged.
        const sc = S1;
        const cloud = vnoise(W, H, 'wc-cloud' + W, 46 * sc);
        const grainP = vnoise(W, H, 'wc-pgrain' + W, 1.1 * sc, 1.1 * sc, false);
        const roller = vnoise(W, H, 'wc-roller' + W, 90 * sc, 140 * sc);
        const mottle = vnoise(W, H, 'wc-mottle' + W, 7 * sc);
        const wood = vnoise(W, H, 'wc-wood' + W, 70 * sc, 1.6 * sc);
        const speck = vnoise(W, H, 'wc-speck' + W, 1.4 * sc, 1.4 * sc, false);
        const chip = vnoise(W, H, 'wc-chip' + W, 1.3 * sc, 1.3 * sc, false);
        const mottleO = vnoise(W, H, 'wc-ochre' + W, 5 * sc);
        const starve = vnoise(W, H, 'wc-starve' + W, 42 * sc);
        const blotO = vnoise(W, H, 'wc-ochreblot' + W, 40 * sc);
        const fibre = new Float32Array(W * H);
        {
            const fc = mk(), fg = fc.getContext('2d'), fr = Motion.rng('wc-fibres' + W), n = Math.round(260 * (W * H) / (1280 * 720));
            fg.lineCap = 'round';
            for (let i = 0; i < n; i++) {
                let x = fr() * W, y = fr() * H, a = fr() * TAU;
                const len = (6 + fr() * 24) * sc, bend = (fr() - 0.5) * 0.3;
                fg.strokeStyle = `rgba(0,0,0,${0.15 + fr() * 0.25})`;
                fg.lineWidth = (0.5 + fr() * 0.4) * sc;
                fg.beginPath();
                fg.moveTo(x, y);
                for (let s = 0; s < len; s += 2 * sc) { a += bend; x += Math.cos(a) * 2 * sc; y += Math.sin(a) * 2 * sc; fg.lineTo(x, y); }
                fg.stroke();
            }
            const fd = fg.getImageData(0, 0, W, H).data;
            for (let i = 0; i < W * H; i++) fibre[i] = fd[i * 4 + 3] / 255;
        }
        const paperRow = new Float32Array(W * H);
        for (let y = 0; y < H; y++) {
            const laid = 1 - 0.012 * Math.max(0, Math.cos((y / (3.6 * sc)) * TAU));
            for (let x = 0; x < W; x++) {
                const i = y * W + x, chain = 1 - 0.01 * Math.max(0, Math.cos((x / (95 * sc)) * TAU)) ** 8;
                paperRow[i] = (1.0 + 0.07 * (cloud[i] - 0.5) + 0.05 * (grainP[i] - 0.5)) * laid * chain * (1 - 0.12 * fibre[i]);
            }
        }
        let memo = null;
        const P = o.paper ?? PAPER, I = o.inkRGB ?? INK, OC = o.ochreRGB ?? OCHRE;

        const blk = {
            W, H, k, key: kg, och: og,
            begin() { reset(kg); reset(og); },
            // a cached piece of the block: the first call runs fn(blk) on an empty block and
            // keeps the result; every call pastes it (source-over) into the current block
            base(key, fn) {
                if (!bases.has(key)) {
                    const saveK = mk(), sg = saveK.getContext('2d');
                    sg.drawImage(keyC, 0, 0);
                    reset(kg);
                    fn(blk);
                    const c = mk();
                    c.getContext('2d').drawImage(keyC, 0, 0);
                    bases.set(key, c);
                    reset(kg);
                    kg.setTransform(1, 0, 0, 1, 0, 0);
                    kg.drawImage(saveK, 0, 0);
                    kg.setTransform(k, 0, 0, k, 0, 0);
                }
                kg.save();
                kg.setTransform(1, 0, 0, 1, 0, 0);
                kg.drawImage(bases.get(key), 0, 0);
                kg.restore();
            },
            ink(fn) { kg.save(); kg.globalCompositeOperation = 'source-over'; kg.fillStyle = '#000'; kg.strokeStyle = '#000'; fn(kg); kg.restore(); },
            cut(fn) { kg.save(); kg.globalCompositeOperation = 'destination-out'; kg.fillStyle = '#000'; kg.strokeStyle = '#000'; fn(kg); kg.restore(); },
            hatch(ho) { (ho.ink ? blk.ink : blk.cut)((g) => hatch(g, ho)); },
            ochre(fn) { og.save(); og.globalCompositeOperation = 'source-over'; og.fillStyle = '#000'; og.strokeStyle = '#000'; fn(og); og.restore(); },
            print(g, po = {}) {
                if (po.key == null || po.key !== memo) {
                    const KD = kg.getImageData(0, 0, W, H).data, OD = og.getImageData(0, 0, W, H).data;
                    const img = pg.createImageData(W, H), D = img.data;
                    // this print's inking: the same block pressed again moves the roller's film
                    // and the specks, and the ochre block lands a pixel or two off
                    const sr = Motion.rng('wc-print:' + (po.seed ?? 0));
                    const ox = Math.floor(sr() * W), oy = Math.floor(sr() * H), ox2 = Math.floor(sr() * W), oy2 = Math.floor(sr() * H);
                    const reg = po.register ?? [2.2, -1.4];
                    const rx = Math.round((reg[0] + (sr() - 0.5) * 1.2) * S1), ry = Math.round((reg[1] + (sr() - 0.5) * 1.2) * S1);
                    const inkGain = po.inkGain ?? 1;
                    for (let y = 0; y < H; y++) {
                        const yR = ((y + oy) % H) * W, yS = ((y + oy2) % H) * W, yo = y - ry;
                        for (let x = 0; x < W; x++) {
                            const i = y * W + x, q = i * 4;
                            const pt = paperRow[i];
                            let r = P[0] * pt, gg = P[1] * pt, b = P[2] * pt;
                            // the ochre block, printed first
                            const xo = x - rx;
                            if (yo >= 0 && yo < H && xo >= 0 && xo < W) {
                                const ao = OD[(yo * W + xo) * 4 + 3];
                                if (ao > 0) {
                                    let d = (ao / 255);
                                    d = clamp((d - 0.5 + 0.5 * (chip[(yo * W + xo)] - 0.5)) * 2.4 + 0.5);
                                    d *= 0.8 + 0.2 * mottleO[i] - 0.12 * Math.max(0, blotO[i] - 0.6);
                                    if (d > 0) { r *= 1 - d + d * OC[0] / 255; gg *= 1 - d + d * OC[1] / 255; b *= 1 - d + d * OC[2] / 255; }
                                }
                            }
                            // the key block: coverage, its walls chipped, then the ink film
                            let c = KD[q + 3] / 255;
                            if (c > 0.002) {
                                const xs = (x + ox2) % W;
                                c = clamp((c - 0.5 + 0.55 * (chip[i] - 0.5)) * 3 + 0.5);
                                if (c > 0) {
                                    const xr = (x + ox) % W;
                                    // the film: full where the roller pressed, thinner in its lighter passes, starved in
                                    // patches (the dark greys of a hand-inked block), streaked by the grain
                                    let d = 0.99 - 0.16 * Math.max(0, roller[yR + xr] - 0.5) - 0.05 * (mottle[yS + xs] - 0.5) - 0.3 * Math.max(0, starve[yS + xs] - 0.62) - 0.05 * Math.max(0, wood[i] - 0.55);
                                    const sp = speck[yS + xs];
                                    if (sp > 0.996) d *= 0.1; else if (sp > 0.986) d *= 0.55;   // specks of paper in the black: 12-20 per 10 000 px (measured)
                                    d = clamp(d * inkGain) * c;
                                    r = r * (1 - d) + I[0] * d; gg = gg * (1 - d) + I[1] * d; b = b * (1 - d) + I[2] * d;
                                }
                            }
                            D[q] = r; D[q + 1] = gg; D[q + 2] = b; D[q + 3] = 255;
                        }
                    }
                    pg.putImageData(img, 0, 0);
                    // the ink sits in the paper's fibres: a slight softening of every edge
                    const sp = (po.spread ?? 0.6) * S1;
                    if (sp > 0.05) {
                        const t2 = mk(), tg = t2.getContext('2d');
                        tg.filter = `blur(${sp}px)`;
                        tg.drawImage(out, 0, 0);
                        pg.clearRect(0, 0, W, H);
                        pg.drawImage(t2, 0, 0);
                    }
                    memo = po.key;
                }
                g.save();
                g.setTransform(1, 0, 0, 1, 0, 0);
                g.drawImage(out, 0, 0);
                g.restore();
            },
        };
        return blk;
    }

    return { PAPER, INK, OCHRE, gouge, groove, hatch, rays, masonry, block, clamp, vnoise, noise2 };
})();
