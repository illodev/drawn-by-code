// Sand style kit: sand animation on a light table. Global: Sand.
// Depends on engine/core.js.
//
// What makes it sand on a light table (see .claude/skills/style-sand/SKILL.md):
//   - the light comes from below: bare glass glows warm, thick sand is near black, and a
//     thin layer is not grey but speckled, single grains with light between them;
//   - light that passes through a few grains turns amber (it loses blue first);
//   - a finger leaves a clean channel of light with the displaced sand piled on its rims;
//   - a palm sweep pushes sand into a dense ridge and leaves striations along its path;
//   - sand poured from a fist lands as a soft heap ringed with loose grains;
//   - the table is never perfectly clean: stray grains everywhere.
//
// How a scene uses it: the scene paints AMOUNT OF SAND (alpha, white) into the table's
// own canvas, in logical units, and the table turns it into light in `post`.
//
//   setup(env) { return { table: Sand.table(env) }; },
//   draw(g, t, env) { const d = env.state.table.begin(); Sand.mass(d, pts, { a: 0.9 }); … },
//   post(ctx, t, env) { env.state.table.show(ctx, { light: Sand.LIGHT.morning }); },
//
// Everything is deterministic: seeds name the piece, never the frame.
const Sand = (() => {
    const R = (s) => Motion.rng(s);
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
    const lerp = (a, b, u) => a + (b - a) * u;

    // The light under the glass, by time of day (RGB 0..255, before the vignette).
    const LIGHT = {
        dawn: [255, 206, 160],
        morning: [255, 228, 158],
        noon: [255, 240, 196],
        afternoon: [255, 206, 118],
        sunset: [255, 156, 78],
        dusk: [214, 136, 132],
        night: [110, 140, 210],
    };
    const mixLight = (a, b, u) => a.map((v, i) => lerp(v, b[i], clamp(u, 0, 1)));

    // --- hashing and value noise at pixel scale (setup only) ----------------------------
    function hash2(x, y, s) {
        let h = Math.imul(x, 374761393) ^ Math.imul(y, 668265263) ^ Math.imul(s, 2246822519);
        h = Math.imul(h ^ (h >>> 13), 1274126177);
        return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
    }
    function vnoise(x, y, cell, s) {
        const fx = x / cell, fy = y / cell;
        const ix = Math.floor(fx), iy = Math.floor(fy);
        const ux = fx - ix, uy = fy - iy;
        const sx = ux * ux * (3 - 2 * ux), sy = uy * uy * (3 - 2 * uy);
        const a = hash2(ix, iy, s), b = hash2(ix + 1, iy, s), c = hash2(ix, iy + 1, s), d = hash2(ix + 1, iy + 1, s);
        return lerp(lerp(a, b, sx), lerp(c, d, sx), sy);
    }

    // --- the table ------------------------------------------------------------------------
    // res: density canvas resolution relative to the output (0.5 = half; the bilinear
    // upsample gives the sand its soft edges, the grain field its sharpness).
    function table(env, opt = {}) {
        const [w, h] = env.px;
        const res = opt.res ?? 0.5;
        const dw = Math.max(2, Math.round(w * res)), dh = Math.max(2, Math.round(h * res));
        const cv = document.createElement('canvas');
        cv.width = dw;
        cv.height = dh;
        const d = cv.getContext('2d', { willReadFrequently: true });
        const kd = env.k * (dw / w);
        const px = w / 1920; // grain sizes are tuned at 1920 wide

        // grain: one value per output pixel. Fine grains (~2 px at 1920), clumps, and an
        // uneven layer, so a thin layer breaks into single grains, never a flat grey.
        const grain = new Float32Array(w * h);
        const stray = new Uint8Array(w * h);
        const vr = new Float32Array(w * h), vg = new Float32Array(w * h), vb = new Float32Array(w * h);
        const cx = w / 2, cy = h * 0.47, rr = Math.hypot(w, h) / 2;
        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                const i = y * w + x;
                const fine = hash2(Math.floor(x / (1.6 * px)), Math.floor(y / (1.6 * px)), 11);
                const g = 0.32 * fine + 0.38 * vnoise(x, y, 4 * px, 23) + 0.3 * vnoise(x, y, 30 * px, 37);
                grain[i] = g;
                // loose grains on the glass: sparse, a few pixels each
                const sc = 3 * px;
                const hs = hash2(Math.floor(x / sc), Math.floor(y / sc), 51);
                stray[i] = hs > 0.9965 ? 1 : 0;
                // the lamp: a broad hot centre, falling off to the frame
                const r = Math.hypot(x - cx, (y - cy) * 1.25) / rr;
                // edges of the glass lose blue first: the falloff turns amber, never grey
                const v = Math.max(0.05, 1.04 - 0.5 * r * r - 0.1 * vnoise(x, y, 260 * px, 71));
                vr[i] = Math.pow(v, 0.55);
                vg[i] = v;
                vb[i] = Math.pow(v, 1.9);
            }
        }
        // transmission lookup per channel: light through `thick` sand loses blue first
        const N = 512, TMAX = 6;
        const lut = [new Float32Array(N), new Float32Array(N), new Float32Array(N)];
        const ab = [0.9, 1.6, 3.1];
        for (let j = 0; j < N; j++) {
            const th = (j / (N - 1)) * TMAX;
            for (let c = 0; c < 3; c++) lut[c][j] = Math.exp(-th * ab[c]);
        }
        const out = new ImageData(w, h);
        const o32 = new Uint32Array(out.data.buffer);
        // bilinear sampling tables (output pixel → density texel)
        const xi = new Int32Array(w), xf = new Float32Array(w);
        for (let x = 0; x < w; x++) {
            const s = clamp((x + 0.5) * (dw / w) - 0.5, 0, dw - 1.001);
            xi[x] = Math.floor(s);
            xf[x] = s - xi[x];
        }

        function begin() {
            d.setTransform(1, 0, 0, 1, 0, 0);
            d.globalAlpha = 1;
            d.globalCompositeOperation = 'source-over';
            d.filter = 'none';
            d.clearRect(0, 0, dw, dh);
            d.setTransform(kd, 0, 0, kd, 0, 0);
            d.lineCap = 'round';
            d.lineJoin = 'round';
            return d;
        }

        // light: RGB under the glass. gain: overall exposure. grainy: 0 smooth .. 1 coarse.
        function show(ctx, o = {}) {
            const L = o.light ?? LIGHT.morning;
            const gain = o.gain ?? 1;
            const Lr = L[0] * gain, Lg = L[1] * gain, Lb = L[2] * gain;
            const src = d.getImageData(0, 0, dw, dh).data;
            const k1 = (N - 1) / TMAX;
            for (let y = 0; y < h; y++) {
                const sy = clamp((y + 0.5) * (dh / h) - 0.5, 0, dh - 1.001);
                const y0 = Math.floor(sy), fy = sy - y0;
                const r0 = y0 * dw, r1 = r0 + dw;
                const row = y * w;
                for (let x = 0; x < w; x++) {
                    const x0 = xi[x], fx = xf[x];
                    const a00 = src[((r0 + x0) << 2) + 3], a10 = src[((r0 + x0 + 1) << 2) + 3];
                    const a01 = src[((r1 + x0) << 2) + 3], a11 = src[((r1 + x0 + 1) << 2) + 3];
                    const dd = ((a00 + (a10 - a00) * fx) * (1 - fy) + (a01 + (a11 - a01) * fx) * fy) / 255;
                    const i = row + x;
                    const gr = grain[i];
                    // coverage: where the layer is thin only some grains are there
                    // coverage: where the layer is thin only some grains are there
                    let c = (dd * 1.2 - gr) * 2.4 + 0.5;
                    c = c < 0 ? 0 : c > 1 ? 1 : c;
                    if (stray[i]) c = c < 0.8 ? 0.8 : c;
                    // a grain in a thin layer glows amber; a thick layer is near black
                    const th = c * (0.35 + 4.2 * dd * dd + 0.5 * gr) + 0.25 * dd;
                    const j = th >= TMAX ? N - 1 : (th * k1) | 0;
                    const r = Lr * vr[i] * lut[0][j] + 5 * c, gg = Lg * vg[i] * lut[1][j] + 2 * c, b = Lb * vb[i] * lut[2][j] + c;
                    o32[i] = (255 << 24) | ((b > 255 ? 255 : b) << 16) | ((gg > 255 ? 255 : gg) << 8) | (r > 255 ? 255 : r);
                }
            }
            ctx.putImageData(out, 0, 0);
        }

        return { canvas: cv, ctx: d, begin, show, res, kd, env };
    }

    // --- paths ------------------------------------------------------------------------
    function smooth(pts, step = 3, closed = false) {
        if (pts.length < 3) return pts.slice();
        const P = closed ? [pts[pts.length - 1], ...pts, pts[0], pts[1]] : [pts[0], ...pts, pts[pts.length - 1]];
        const out = [];
        for (let i = 1; i < P.length - 2; i++) {
            const [p0, p1, p2, p3] = [P[i - 1], P[i], P[i + 1], P[i + 2]];
            const m = Math.max(1, Math.ceil(Math.hypot(p2[0] - p1[0], p2[1] - p1[1]) / step));
            for (let k = 0; k < m; k++) {
                const t = k / m, t2 = t * t, t3 = t2 * t;
                const f = (a, b, c, e) => 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - e) * t2 + (-a + 3 * b - 3 * c + e) * t3);
                out.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])]);
            }
        }
        if (!closed) out.push(pts[pts.length - 1]);
        return out;
    }
    // the first `u` (0..1) of a path, by length
    function part(pts, u) {
        if (u >= 1) return pts;
        if (u <= 0) return [];
        let L = 0;
        const seg = [];
        for (let i = 1; i < pts.length; i++) {
            const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
            seg.push(l);
            L += l;
        }
        let want = L * u;
        const out = [pts[0]];
        for (let i = 1; i < pts.length; i++) {
            if (want <= seg[i - 1]) {
                const v = seg[i - 1] ? want / seg[i - 1] : 0;
                out.push([lerp(pts[i - 1][0], pts[i][0], v), lerp(pts[i - 1][1], pts[i][1], v)]);
                return out;
            }
            want -= seg[i - 1];
            out.push(pts[i]);
        }
        return out;
    }
    // a hand-made wobble on a path (seeded, a few units)
    function wobble(pts, amp, seed, freq = 0.02) {
        return pts.map(([x, y], i) => [x + amp * Motion.noise1(seed + 'x', i * freq * 3 + x * freq), y + amp * Motion.noise1(seed + 'y', i * freq * 3 + y * freq)]);
    }
    function trace(d, pts, closed) {
        d.beginPath();
        pts.forEach(([x, y], i) => (i ? d.lineTo(x, y) : d.moveTo(x, y)));
        if (closed) d.closePath();
    }
    const white = (a) => `rgba(255,255,255,${clamp(a, 0, 1).toFixed(3)})`;

    // --- adding sand ---------------------------------------------------------------------
    // A mass of sand: a filled closed outline. a: how thick (0.35 thin, 0.9 near black).
    // soft: blur of the edge in logical units (sand edges are never cut).
    function mass(d, pts, o = {}) {
        const sm = o.raw ? pts : smooth(pts, 4, true);
        d.save();
        if (o.soft) d.filter = `blur(${(o.soft * d.getTransform().a).toFixed(2)}px)`;
        d.fillStyle = white(o.a ?? 0.9);
        trace(d, sm, true);
        d.fill();
        d.restore();
    }
    // A line of sand laid by a trickle from the fist (dark on light): width w.
    function trickle(d, pts, o = {}) {
        const p = part(o.raw ? pts : smooth(pts, 3), o.prog ?? 1);
        if (p.length < 2) return;
        d.save();
        if (o.soft) d.filter = `blur(${(o.soft * d.getTransform().a).toFixed(2)}px)`;
        d.strokeStyle = white(o.a ?? 0.85);
        d.lineWidth = o.w ?? 8;
        trace(d, p);
        d.stroke();
        d.restore();
    }
    // A soft heap: sand poured in one spot. u grows it (0..1).
    function heap(d, x, y, r, o = {}) {
        const u = o.u ?? 1;
        if (u <= 0) return;
        const rr = r * Math.sqrt(u);
        const gr = d.createRadialGradient(x, y, 0, x, y, rr);
        const a = o.a ?? 0.95;
        gr.addColorStop(0, white(a));
        gr.addColorStop(0.55, white(a * 0.8));
        gr.addColorStop(1, white(0));
        d.save();
        d.fillStyle = gr;
        d.beginPath();
        d.ellipse(x, y, rr, rr * (o.squash ?? 1), o.rot ?? 0, 0, Math.PI * 2);
        d.fill();
        d.restore();
        if (o.grains !== false) grains(d, x, y, rr * 1.5, Math.round(40 * u * (r / 40)), (o.seed ?? 'heap') + x + ',' + y, { inner: rr * 0.7 });
    }
    // Loose grains scattered around a point (ring between inner and r).
    function grains(d, x, y, r, n, seed, o = {}) {
        const rnd = R(seed);
        const inner = o.inner ?? 0;
        d.save();
        d.fillStyle = white(o.a ?? 0.95);
        const s = o.size ?? 1.3;
        for (let i = 0; i < n; i++) {
            const ang = rnd() * Math.PI * 2;
            const rad = inner + (r - inner) * Math.pow(rnd(), 1.6);
            const sz = s * (0.6 + rnd() * 0.9);
            d.fillRect(x + Math.cos(ang) * rad, y + Math.sin(ang) * rad * (o.squash ?? 1), sz, sz);
        }
        d.restore();
    }

    // --- taking sand away ----------------------------------------------------------------
    // A finger drawn through the sand: a channel of light of width w, with the sand it
    // displaced piled along both rims (rim: 0 none .. 1 heavy). prog draws it in.
    function finger(d, pts, o = {}) {
        const p = part(o.raw ? pts : smooth(pts, 2.5), o.prog ?? 1);
        if (p.length < 2) return;
        const w = o.w ?? 7;
        const rim = o.rim ?? 0.5;
        d.save();
        if (rim > 0) {
            d.strokeStyle = white(rim * 0.55);
            d.lineWidth = w * 2.1;
            trace(d, p);
            d.stroke();
        }
        // the channel: a soft outer pass, then a clean core whose width breathes along the
        // path (a finger presses unevenly), drawn in short overlapping pieces
        d.globalCompositeOperation = 'destination-out';
        d.strokeStyle = white(0.55 * (o.clean ?? 1));
        d.lineWidth = w * 1.25;
        trace(d, p);
        d.stroke();
        d.strokeStyle = white(o.clean ?? 1);
        const seed = o.seed ?? 'f' + Math.round(p[0][0]) + ',' + Math.round(p[0][1]);
        const step = 6;
        for (let i = 0; i < p.length - 1; i += step) {
            const q = p.slice(i, Math.min(p.length, i + step + 1));
            d.lineWidth = w * (0.72 + 0.28 * Motion.noise1(seed, i * 0.05));
            trace(d, q);
            d.stroke();
        }
        d.restore();
    }
    // A fingertip pressed into the sand: a light dot with a raised ring.
    function press(d, x, y, r, o = {}) {
        d.save();
        const rim = o.rim ?? 0.45;
        if (rim > 0) {
            d.fillStyle = white(rim * 0.5);
            d.beginPath();
            d.ellipse(x, y, r * 1.45, r * 1.45 * (o.squash ?? 1), o.rot ?? 0, 0, Math.PI * 2);
            d.fill();
        }
        d.globalCompositeOperation = 'destination-out';
        d.fillStyle = white(o.clean ?? 1);
        d.beginPath();
        d.ellipse(x, y, r, r * (o.squash ?? 1), o.rot ?? 0, 0, Math.PI * 2);
        d.fill();
        d.restore();
    }
    // Clear a closed area (a palm wiping it), soft-edged.
    function clear(d, pts, o = {}) {
        const sm = o.raw ? pts : smooth(pts, 4, true);
        d.save();
        d.globalCompositeOperation = 'destination-out';
        if (o.soft) d.filter = `blur(${(o.soft * d.getTransform().a).toFixed(2)}px)`;
        d.fillStyle = white(o.a ?? 1);
        trace(d, sm, true);
        d.fill();
        d.restore();
    }
    // Palm striations: parallel scratches across a band, the direction of the sweep.
    // from/to: the band's centre line ends; width: band width; n lines.
    function striations(d, from, to, width, n, seed, o = {}) {
        const rnd = R(seed);
        const dx = to[0] - from[0], dy = to[1] - from[1];
        const L = Math.hypot(dx, dy) || 1;
        const nx = -dy / L, ny = dx / L;
        d.save();
        for (let i = 0; i < n; i++) {
            const off = (rnd() - 0.5) * width;
            const s0 = rnd() * 0.55, s1 = Math.min(1, s0 + 0.15 + rnd() * 0.45);
            const lw = 0.6 + rnd() * 1.8;
            const out = rnd() < (o.light ?? 0.55);
            d.globalCompositeOperation = out ? 'destination-out' : 'source-over';
            d.strokeStyle = white(out ? 0.5 + rnd() * 0.5 : (o.a ?? 0.35) * (0.4 + rnd()));
            d.lineWidth = lw;
            const wob = (rnd() - 0.5) * width * 0.5;
            d.beginPath();
            d.moveTo(from[0] + dx * s0 + nx * off, from[1] + dy * s0 + ny * off);
            d.quadraticCurveTo(from[0] + dx * 0.5 + nx * (off + wob), from[1] + dy * 0.5 + ny * (off + wob), from[0] + dx * s1 + nx * off, from[1] + dy * s1 + ny * off);
            d.stroke();
        }
        d.restore();
    }

    // --- the sweep: the medium's own transition ------------------------------------------
    // A palm (or a wave) crosses the table along `dir` (radians). Behind the front the new
    // picture, ahead of it the old one; at the front the pushed sand piles into a ridge
    // that drops striations behind it. u: 0..1 progress. front(s): the front's shape, an
    // offset along `dir` for a position s (0..1) across it (a wave crest, a palm's arc).
    function sweep(d, env, u, o) {
        const { W, H } = env;
        const dir = o.dir ?? Math.PI; // default: right to left
        const cx = W / 2, cy = H / 2;
        const ux = Math.cos(dir), uy = Math.sin(dir); // motion direction
        const vx = -uy, vy = ux; // across the front
        const span = Math.abs(W * ux) + Math.abs(H * uy) + 2 * (o.depth ?? 160);
        const across = Math.abs(W * vx) + Math.abs(H * vy) + 200;
        // front position along dir, measured from the centre (o.range: [start, end])
        const [p0, p1] = o.range ?? [-span / 2, span / 2];
        const pos = p0 + (p1 - p0) * u;
        const front = o.front ?? (() => 0);
        const N = 48;
        const F = [];
        for (let i = 0; i <= N; i++) {
            const s = i / N;
            const a = -across / 2 + across * s;
            const p = pos + front(s);
            F.push([cx + ux * p + vx * a, cy + uy * p + vy * a]);
        }
        const far = span; // a long way ahead / behind
        const poly = (side) => [...F, ...F.slice().reverse().map(([x, y]) => [x + ux * far * side, y + uy * far * side])];
        // old picture: ahead of the front
        d.save();
        trace(d, poly(1), true);
        d.clip();
        o.old?.(d);
        d.restore();
        // new picture: behind the front
        d.save();
        trace(d, poly(-1), true);
        d.clip();
        o.new?.(d);
        // striations in the wake, fading behind
        // the wake: the palm leaves a thin streaked film that thins out behind it
        if (o.wake !== false && u > 0 && u < 1) {
            const wk = o.wake ?? 260;
            const back = F.map(([x, y]) => [x - ux * wk, y - uy * wk]);
            const g = d.createLinearGradient(F[24][0], F[24][1], back[24][0], back[24][1]);
            g.addColorStop(0, white(0.4));
            g.addColorStop(1, white(0));
            d.fillStyle = g;
            trace(d, [...F, ...back.reverse()], true);
            d.fill();
            const n = 14;
            for (let i = 0; i < n; i++) {
                const s = (i + 0.5) / n;
                const a = -across / 2 + across * s;
                const p = pos + front(s);
                const p0 = [cx + ux * (p - wk) + vx * a, cy + uy * (p - wk) + vy * a];
                const p1 = [cx + ux * (p - 4) + vx * a, cy + uy * (p - 4) + vy * a];
                striations(d, p0, p1, across / n, 6, (o.seed ?? 'sw') + i, { a: 0.22, light: 0.75 });
            }
        }
        d.restore();
        // the ridge: the sand the palm is pushing
        const rd = (o.ridge ?? 46) * Math.min(1, u * 6, (1 - u) * 6);
        if (rd > 0 && u > 0 && u < 1) {
            // a broad, lumpy mound: thick in the middle, thinning to both sides
            const seed = o.seed ?? 'sw';
            const lump = (k, sh) => F.map(([x, y], i) => {
                const m = 0.55 + 0.45 * Motion.noise1(seed + 'r' + k, i * 0.35 + u * 3);
                return [x + ux * rd * (sh + 0.5 * m), y + uy * rd * (sh + 0.5 * m)];
            });
            d.save();
            d.filter = `blur(${(rd * 0.3 * d.getTransform().a).toFixed(2)}px)`;
            for (const [k, sh, lw, a] of [[0, 0.6, 2.2, 0.3], [1, 0.5, 1.1, 0.35], [2, 0.45, 0.5, 0.35]]) {
                d.strokeStyle = white(a);
                d.lineWidth = rd * lw;
                trace(d, lump(k, sh));
                d.stroke();
            }
            d.restore();
            const rnd = R((o.seed ?? 'sw') + 'g');
            d.save();
            d.fillStyle = white(0.9);
            for (let i = 0; i < 260; i++) {
                const k = Math.floor(rnd() * N);
                const ahead = rd * 0.6 + Math.pow(rnd(), 2) * rd * 2.4;
                const sz = 1 + rnd() * 1.4;
                d.fillRect(F[k][0] + ux * ahead + vx * (rnd() - 0.5) * 30, F[k][1] + uy * ahead + vy * (rnd() - 0.5) * 30, sz, sz);
            }
            d.restore();
        }
        return F;
    }

    return { LIGHT, mixLight, table, smooth, part, wobble, trace, mass, trickle, heap, grains, finger, press, clear, striations, sweep, clamp, lerp };
})();
