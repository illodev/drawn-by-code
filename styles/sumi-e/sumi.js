// Sumi-e style kit: Japanese ink painting on washi. Global: Sumi.
// Depends on engine/core.js.
//
// What makes it sumi-e (see .claude/skills/style-sumi-e/SKILL.md):
//   - one ink, many greys: tone comes from how much water, not from other colours;
//   - the brush shows: tapered starts and ends, dry-brush streaks (kasure) where the
//     brush runs out, bristle lines along every stroke;
//   - wet washes with soft, bleeding edges and a darker rim where they dry;
//   - vermilion is the only colour, kept for what matters (a sun, a blossom, a thread);
//   - textured paper you can feel (fibres, tooth), lots of empty space (ma).
//
// Everything is deterministic: seeds name the piece, never the frame.
const Sumi = (() => {
    const INK = '#17130f';
    const PAPER = '#f6f4ef';
    const RED = '#c62a1f';
    const RED_DEEP = '#9e1b16';

    const R = (s) => Motion.rng(s);
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
    const sstep = (a, b, x) => {
        const u = clamp((x - a) / (b - a), 0, 1);
        return u * u * (3 - 2 * u);
    };
    const n1 = (s, x) => Motion.noise1(s, x);

    // ink tone 0..1 (0 = paper, 1 = black) → rgba string
    function tone(v, color = INK) {
        const c = hex(color);
        return `rgba(${c[0]},${c[1]},${c[2]},${clamp(v, 0, 1).toFixed(3)})`;
    }
    function hex(h) {
        const n = parseInt(h.slice(1), 16);
        return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    }
    function mix(a, b, u) {
        const A = hex(a), B = hex(b);
        const c = A.map((v, i) => Math.round(v + (B[i] - v) * u));
        return '#' + c.map((v) => v.toString(16).padStart(2, '0')).join('');
    }

    // --- paths ------------------------------------------------------------------------
    // Catmull-Rom through the points, resampled every `step` units.
    function smooth(pts, step = 3) {
        if (pts.length < 2) return pts.slice();
        const P = [pts[0], ...pts, pts[pts.length - 1]];
        const out = [];
        for (let i = 1; i < P.length - 2; i++) {
            const [p0, p1, p2, p3] = [P[i - 1], P[i], P[i + 1], P[i + 2]];
            const d = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]);
            const m = Math.max(1, Math.ceil(d / step));
            for (let k = 0; k < m; k++) {
                const t = k / m, t2 = t * t, t3 = t2 * t;
                const f = (a, b, c, e) => 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - e) * t2 + (-a + 3 * b - 3 * c + e) * t3);
                out.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])]);
            }
        }
        out.push(pts[pts.length - 1]);
        return out;
    }

    function measure(P) {
        const L = [0];
        for (let i = 1; i < P.length; i++) L.push(L[i - 1] + Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]));
        const N = P.map((_, i) => {
            const a = P[Math.max(0, i - 1)], b = P[Math.min(P.length - 1, i + 1)];
            const dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy) || 1;
            return [-dy / d, dx / d];
        });
        return { L, N, total: L[L.length - 1] || 1 };
    }

    // --- the brush ----------------------------------------------------------------------
    /**
     * A brush stroke along `pts`.
     *   w        width at full pressure (units)
     *   ink      darkness 0..1 (1 = sumi black, 0.3 = a grey wash)
     *   dry      0..1: how much the brush runs out (kasure streaks), stronger towards the end
     *   prog     0..1: draw-on progress (the brush is at prog along the path)
     *   taper    [in, out] fraction of the length that tapers at each end
     *   blunt    width at the very start (0..1 of w): brushes land blunt, leave sharp
     *   press    optional fn(u) → pressure multiplier
     *   color    ink colour (RED for vermilion)
     *   seed     names the stroke (its bristles and streaks)
     */
    function stroke(g, pts, o = {}) {
        const w = o.w ?? 8, ink = o.ink ?? 1, dry = o.dry ?? 0.25, prog = o.prog ?? 1;
        const [ti, to] = o.taper ?? [0.12, 0.3];
        const blunt = o.blunt ?? 0.55, seed = o.seed ?? 's', color = o.color ?? INK;
        if (prog <= 0) return;
        const P = o.raw ? pts : smooth(pts, clamp(w * 0.3, 1, 4));
        if (P.length < 2) return;
        const { L, N, total } = measure(P);
        const r = R(seed);
        const end = total * clamp(prog, 0, 1);
        const wAt = (s) => {
            const u = s / total;
            const a = ti > 0 ? blunt + (1 - blunt) * Math.sqrt(clamp(u / ti, 0, 1)) : 1;
            const b = to > 0 ? Math.pow(clamp((1 - u) / to, 0, 1), 0.65) : 1;
            const p = o.press ? o.press(u) : 1;
            return w * a * Math.max(0.04, b) * p * (1 + 0.18 * n1(seed + 'w', s / (w * 4 + 10)) + 0.06 * n1(seed + 'v', s / (w * 0.8 + 3)));
        };
        const n = clamp(Math.round(w * 1.1), 3, 64);
        const rgb = hex(color);
        const col = (a) => `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${clamp(a, 0, 1).toFixed(3)})`;
        g.save();
        g.lineCap = 'round';
        g.lineJoin = 'round';
        // a faint bleed around the wet part of the stroke (ink feathering into the fibres)
        if (o.bleed !== false && dry < 0.85) {
            g.strokeStyle = col(0.07 * ink * (1 - dry));
            g.beginPath();
            for (let i = 0; i < P.length && L[i] <= end; i++) {
                if (i === 0) g.moveTo(P[i][0], P[i][1]);
                else g.lineTo(P[i][0], P[i][1]);
            }
            g.lineWidth = w * 1.2;
            g.stroke();
        }
        // wet core: while the brush is loaded the body is solid ink; it narrows and ends
        // where the brush starts to run dry, and the bristles carry on alone (kasure)
        const uWet = clamp(1.15 - dry * 1.1, 0.08, 1.05);
        if (o.core !== false && w > 3) {
            const left = [], right = [];
            for (let i = 0; i < P.length && L[i] <= end; i++) {
                const u = L[i] / total;
                const k = 1 - sstep(uWet - 0.18, uWet + 0.08, u);
                if (k <= 0.01) break;
                const hw = wAt(L[i]) * 0.5 * 0.8 * k;
                left.push([P[i][0] + N[i][0] * hw, P[i][1] + N[i][1] * hw]);
                right.push([P[i][0] - N[i][0] * hw, P[i][1] - N[i][1] * hw]);
            }
            if (left.length > 1) {
                g.fillStyle = col(ink * 0.88);
                g.beginPath();
                g.moveTo(left[0][0], left[0][1]);
                for (const p of left) g.lineTo(p[0], p[1]);
                for (let i = right.length - 1; i >= 0; i--) g.lineTo(right[i][0], right[i][1]);
                g.closePath();
                g.fill();
            }
        }
        // bristles: wide and overlapping, so a loaded brush paints a solid body; where a
        // bristle runs dry it leaves a white streak (kasure); edge bristles are thinner and
        // break first, which gives the ragged edge.
        const fq = 1 / (w * 1.6 + 10);
        for (let j = 0; j < n; j++) {
            const off = -1 + (2 * (j + 0.5 + (r() - 0.5) * 0.7)) / n;
            const edge = Math.abs(off);
            const load = (0.5 + 0.5 * r()) * (1 - 0.35 * edge * edge);
            const bs = seed + 'b' + j;
            g.strokeStyle = col(ink * (0.62 + 0.38 * load));
            let run = [], sumW = 0, cnt = 0;
            const flush = () => {
                if (run.length > 1) {
                    g.beginPath();
                    g.moveTo(run[0][0], run[0][1]);
                    for (const p of run) g.lineTo(p[0], p[1]);
                    g.lineWidth = Math.max(0.4, (sumW / cnt) * (2 / n) * (edge > 0.85 ? 1.3 : 2.3));
                    g.stroke();
                }
                run = []; sumW = 0; cnt = 0;
            };
            for (let i = 0; i < P.length && L[i] <= end; i++) {
                const s = L[i], u = s / total;
                const hw = wAt(s) * 0.5;
                // dryness: grows along the stroke and towards the edges, in streaks
                const d = dry * (0.2 + 1.35 * Math.pow(u, 1.2)) * (0.5 + 1.0 * edge)
                    + 0.7 * dry * n1(bs, s * fq) + 0.25 * dry * n1(bs + 'h', s * fq * 4);
                // edge bristles wander: the outline is ragged, never a clean curve
                const of = off + (0.6 / n) * n1(bs + 'o', s * fq * 0.7) + (edge > 0.7 ? 0.05 * n1(bs + 'e', s * 0.35) : 0);
                if (d < load) {
                    run.push([P[i][0] + N[i][0] * of * hw, P[i][1] + N[i][1] * of * hw]);
                    sumW += hw; cnt++;
                } else flush();
            }
            flush();
        }
        g.restore();
    }

    // A stroke cached as a sprite at the origin of its bounding box (for static strokes
    // that move: ripples, rain, distant figures). Returns { draw(g, dx, dy) }.
    function cachedStroke(key, pts, o, k) {
        let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
        for (const [x, y] of pts) {
            x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y);
        }
        const pad = (o.w ?? 8) * 1.2 + 4;
        const box = { x: x0 - pad, y: y0 - pad, w: x1 - x0 + pad * 2, h: y1 - y0 + pad * 2 };
        const sp = Motion.sprite('sumi-stroke:' + key, box, k, (c) => stroke(c, pts, o));
        return { draw: (g, dx = 0, dy = 0) => g.drawImage(sp.canvas, box.x + dx, box.y + dy, box.w, box.h) };
    }

    // --- dabs and washes ------------------------------------------------------------------
    // Irregular closed outline around (x, y): radius rx/ry wobbling with noise.
    function blobPts(x, y, rx, ry, rot = 0, seed = 'b', rough = 0.18, n = 28) {
        const pts = [];
        for (let i = 0; i < n; i++) {
            const a = (i / n) * Math.PI * 2;
            const k = 1 + rough * n1(seed, i * 0.9) + rough * 0.5 * n1(seed + 'f', i * 2.7);
            const px = Math.cos(a) * rx * k, py = Math.sin(a) * ry * k;
            pts.push([x + px * Math.cos(rot) - py * Math.sin(rot), y + px * Math.sin(rot) + py * Math.cos(rot)]);
        }
        return pts;
    }

    function fillPoly(g, pts, style) {
        g.fillStyle = style;
        g.beginPath();
        g.moveTo(pts[0][0], pts[0][1]);
        for (const p of pts) g.lineTo(p[0], p[1]);
        g.closePath();
        g.fill();
    }

    // An ink dab: a wet blob with a darker drying rim (a head, a bud, a petal, a hand).
    function dab(g, x, y, rx, ry, o = {}) {
        const seed = o.seed ?? 'dab', ink = o.ink ?? 1, color = o.color ?? INK, rot = o.rot ?? 0;
        const pts = blobPts(x, y, rx, ry, rot, seed, o.rough ?? 0.14);
        const c = hex(color);
        fillPoly(g, pts, `rgba(${c[0]},${c[1]},${c[2]},${(ink * 0.82).toFixed(3)})`);
        g.save();
        g.strokeStyle = `rgba(${c[0]},${c[1]},${c[2]},${(ink * 0.5).toFixed(3)})`;
        g.lineWidth = Math.max(0.6, Math.min(rx, ry) * 0.16);
        g.lineJoin = 'round';
        g.beginPath();
        g.moveTo(pts[0][0], pts[0][1]);
        for (const p of pts) g.lineTo(p[0], p[1]);
        g.closePath();
        g.stroke();
        g.restore();
    }

    /**
     * A wash (bokashi): a wet area of diluted ink, soft at the edges, cached. `shape(c)`
     * builds a path on the context; `fade` = [y0, y1] fades it out downwards (mist).
     * blur in units. Returns the sprite; call .draw(g).
     */
    function wash(key, box, k, shape, o = {}) {
        return Motion.sprite('sumi-wash:' + key, box, k, (c) => {
            const color = o.color ?? INK, ink = o.ink ?? 0.4;
            const tmp = document.createElement('canvas');
            tmp.width = Math.ceil(box.w * k);
            tmp.height = Math.ceil(box.h * k);
            const t = tmp.getContext('2d');
            t.scale(k, k);
            t.translate(-box.x, -box.y);
            t.fillStyle = color;
            t.beginPath();
            shape(t);
            t.fill();
            // drying rim: the edge collects pigment
            if (o.rim) {
                t.globalCompositeOperation = 'source-atop';
                t.strokeStyle = tone(o.rim, '#000000');
                t.lineWidth = o.rimW ?? 6;
                t.filter = `blur(${((o.rimW ?? 6) * 0.35 * k).toFixed(2)}px)`;
                t.beginPath();
                shape(t);
                t.stroke();
                t.filter = 'none';
                t.globalCompositeOperation = 'source-over';
            }
            // granulation: pigment settles in the paper's tooth
            if (o.grain !== 0) {
                t.globalCompositeOperation = 'destination-out';
                const r = R(key + 'g');
                const area = box.w * box.h;
                const count = Math.min(9000, area / 90) * (o.grain ?? 1);
                for (let i = 0; i < count; i++) {
                    t.fillStyle = `rgba(0,0,0,${(0.08 + r() * 0.25).toFixed(2)})`;
                    const s = 0.8 + r() * 2.6;
                    t.fillRect(box.x + r() * box.w, box.y + r() * box.h, s, s * (0.5 + r()));
                }
                t.globalCompositeOperation = 'source-over';
            }
            if (o.fade) {
                t.globalCompositeOperation = 'destination-in';
                const gr = t.createLinearGradient(0, o.fade[0], 0, o.fade[1]);
                gr.addColorStop(0, 'rgba(0,0,0,1)');
                gr.addColorStop(1, 'rgba(0,0,0,0)');
                t.fillStyle = gr;
                t.fillRect(box.x, box.y, box.w, box.h);
                t.globalCompositeOperation = 'source-over';
            }
            c.save();
            c.setTransform(1, 0, 0, 1, 0, 0);
            c.globalAlpha = ink;
            c.filter = `blur(${((o.blur ?? 2) * k).toFixed(2)}px)`;
            c.drawImage(tmp, 0, 0);
            c.filter = 'none';
            c.restore();
        });
    }

    // --- paper ---------------------------------------------------------------------------
    // Seamless relief tile (cold-press tooth): periodic value noise shaded by a light from
    // the top left, as in a scan of textured watercolour paper.
    function toothTile(size, seed) {
        const c = document.createElement('canvas');
        c.width = c.height = size;
        const x = c.getContext('2d');
        const img = x.createImageData(size, size);
        const H = new Float32Array(size * size);
        const octaves = [[size / 40, 0.5], [size / 17, 0.32], [size / 7, 0.18]];
        for (const [cells, amp] of octaves) {
            const nc = Math.max(2, Math.round(cells));
            const r = R(seed + ':' + nc);
            const lat = Float32Array.from({ length: nc * nc }, () => r());
            for (let py = 0; py < size; py++) {
                const fy = (py / size) * nc, iy = Math.floor(fy), ty = fy - iy, sy = ty * ty * (3 - 2 * ty);
                for (let px = 0; px < size; px++) {
                    const fx = (px / size) * nc, ix = Math.floor(fx), tx = fx - ix, sx = tx * tx * (3 - 2 * tx);
                    const a = lat[(iy % nc) * nc + (ix % nc)], b = lat[(iy % nc) * nc + ((ix + 1) % nc)];
                    const cc = lat[((iy + 1) % nc) * nc + (ix % nc)], d = lat[((iy + 1) % nc) * nc + ((ix + 1) % nc)];
                    H[py * size + px] += amp * (a + (b - a) * sx + (cc - a) * sy + (a - b - cc + d) * sx * sy);
                }
            }
        }
        for (let py = 0; py < size; py++) {
            for (let px = 0; px < size; px++) {
                const h = (dx, dy) => H[((py + dy + size) % size) * size + ((px + dx + size) % size)];
                const sh = (h(-1, -1) - h(1, 1)) * 9;   // lit from the top left
                const i = (py * size + px) * 4;
                if (sh > 0) {
                    img.data[i] = img.data[i + 1] = img.data[i + 2] = 255;
                    img.data[i + 3] = Math.min(255, sh * 150);
                } else {
                    img.data[i] = 70; img.data[i + 1] = 58; img.data[i + 2] = 44;
                    img.data[i + 3] = Math.min(255, -sh * 120);
                }
            }
        }
        x.putImageData(img, 0, 0);
        return c;
    }

    let tile = null;
    /**
     * Washi paper covering box (world units), cached. Painted in pixels so the tooth keeps
     * its grain at any zoom. Opts: color, tooth (0..1), seed.
     */
    function paper(g, env, box, o = {}) {
        const seed = o.seed ?? 'washi', k = env.k * (o.res ?? 1);
        const sp = Motion.sprite('sumi-paper:' + seed + ':' + [box.x, box.y, box.w, box.h].join(','), box, k, (c) => {
            c.fillStyle = o.color ?? PAPER;
            c.fillRect(box.x, box.y, box.w, box.h);
            const r = R(seed);
            // large soft mottling (sizing, uneven absorption)
            for (let i = 0; i < 40; i++) {
                const x = box.x + r() * box.w, y = box.y + r() * box.h, rad = 120 + r() * 380;
                const gr = c.createRadialGradient(x, y, 0, x, y, rad);
                const dark = r() < 0.5;
                gr.addColorStop(0, 'rgba(0,0,0,0)');
                gr.addColorStop(1, 'rgba(0,0,0,0)');
                c.fillStyle = gr;
                c.fillRect(x - rad, y - rad, rad * 2, rad * 2);
            }
            // kozo fibres: long, thin, curly, slightly lighter or darker than the sheet
            c.lineCap = 'round';
            const nf = Math.round((box.w * box.h) / 2600);
            for (let i = 0; i < nf; i++) {
                let x = box.x + r() * box.w, y = box.y + r() * box.h, a = r() * Math.PI * 2;
                const len = 8 + r() * 40;
                c.strokeStyle = r() < 0.6 ? `rgba(255,253,245,${0.25 + r() * 0.3})` : `rgba(140,118,84,${0.07 + r() * 0.1})`;
                c.lineWidth = 0.3 + r() * 0.6;
                c.beginPath();
                c.moveTo(x, y);
                for (let s = 0; s < len; s += 3) {
                    a += (r() - 0.5) * 0.7;
                    x += Math.cos(a) * 3;
                    y += Math.sin(a) * 3;
                    c.lineTo(x, y);
                }
                c.stroke();
            }
            // inclusions: tiny bits of bark in the pulp
            for (let i = 0; i < nf / 12; i++) {
                c.fillStyle = `rgba(90,70,45,${0.12 + r() * 0.2})`;
                const x = box.x + r() * box.w, y = box.y + r() * box.h;
                c.beginPath();
                c.ellipse(x, y, 0.5 + r() * 1.4, 0.3 + r() * 0.6, r() * 3, 0, Math.PI * 2);
                c.fill();
            }
        });
        sp.draw(g);
    }

    // Tooth relief over everything (ink included), in PIXELS, from `post`: the paper's
    // texture shows through the ink, as in a scan. Fixed to the sheet's position `ox, oy`
    // in pixels so it pans with the paper.
    function tooth(ctx, env, o = {}) {
        if (!tile) tile = toothTile(512, 'tooth');
        const pat = ctx.createPattern(tile, 'repeat');
        const s = (o.scale ?? 1.3) * (env.px[0] / 1920);
        pat.setTransform(new DOMMatrix([s, 0, 0, s, (o.ox ?? 0), (o.oy ?? 0)]));
        ctx.save();
        ctx.globalAlpha = o.amount ?? 0.17;
        ctx.fillStyle = pat;
        ctx.fillRect(0, 0, env.px[0], env.px[1]);
        ctx.restore();
    }

    // --- landscape ------------------------------------------------------------------------
    // Ridge line from noise: peaks between x0 and x1, base at y, heights up to h.
    function ridge(seed, x0, x1, y, h, o = {}) {
        const pts = [];
        const step = o.step ?? 14, peaks = o.peaks ?? 3;
        for (let x = x0; x <= x1 + 0.1; x += step) {
            const u = (x - x0) / (x1 - x0);
            const env = Math.sin(Math.PI * u) ** (o.sharp ?? 0.9);
            const v = 0.55 + 0.45 * n1(seed, u * peaks) + 0.12 * n1(seed + 'd', u * peaks * 5);
            pts.push([x, y - h * env * clamp(v, 0.05, 1.2)]);
        }
        return pts;
    }

    /**
     * A misty mountain range (cached): a wash darkest at the ridge fading into mist below,
     * a dry-brush contour along the ridge and a few texture strokes (cun) down the slopes.
     */
    function mountains(g, env, key, o) {
        const { x0, x1, y, h } = o;
        const pts = ridge(key, x0, x1, y, h, o);
        const top = Math.min(...pts.map((p) => p[1]));
        const box = { x: x0 - 40, y: top - 40, w: x1 - x0 + 80, h: y - top + 120 };
        const sp = Motion.sprite('sumi-mtn:' + key, box, env.k, (c) => {
            const w = wash(key + 'w', box, env.k, (t) => {
                t.moveTo(pts[0][0], y + 60);
                for (const p of pts) t.lineTo(p[0], p[1]);
                t.lineTo(pts[pts.length - 1][0], y + 60);
                t.closePath();
            }, { ink: o.ink ?? 0.5, blur: o.blur ?? 2.5, fade: [top + (y - top) * 0.15, y + 30], rim: 0.5, rimW: 8, grain: 1 });
            c.drawImage(w.canvas, box.x, box.y, box.w, box.h);
            // boneless (mokkotsu) ridge: a second, darker wash in a band under the ridge,
            // so the peaks are dense and the slopes dissolve into mist
            const band = o.band ?? h * 0.22;
            const w2 = wash(key + 'r', box, env.k, (t) => {
                t.moveTo(pts[0][0], pts[0][1] + band * 0.3);
                for (const p of pts) t.lineTo(p[0], p[1]);
                for (let i = pts.length - 1; i >= 0; i--) {
                    const v = 0.5 + 0.5 * n1(key + 'band', i * 0.15);
                    t.lineTo(pts[i][0], pts[i][1] + band * (0.4 + 0.9 * v));
                }
                t.closePath();
            }, { ink: (o.ink ?? 0.5) * 0.9, blur: (o.blur ?? 2.5) * 2.2, grain: 1.4 });
            c.drawImage(w2.canvas, box.x, box.y, box.w, box.h);
            // optional broken contour in dry brush, only on part of the ridge
            const segs = o.contour ?? 0;
            const n = pts.length;
            for (let s = 0; s < segs; s++) {
                const a = Math.floor(((s + 0.15) / segs) * n), b = Math.min(n - 1, Math.floor(((s + 0.75) / segs) * n));
                stroke(c, pts.slice(a, b), { w: o.cw ?? 12, ink: Math.min(1, (o.ink ?? 0.5) * 1.2), dry: 0.92, seed: key + 'c' + s, taper: [0.2, 0.5], blunt: 0.4, core: false });
            }
            // optional texture strokes down the slopes (cun): broad, pale, dry
            const r = R(key + 'cun');
            for (let i = 0; i < (o.cun ?? 0); i++) {
                const p = pts[Math.floor(r() * n)];
                const len = (y - p[1]) * (0.2 + r() * 0.3);
                if (len < 20) continue;
                const lean = (r() - 0.5) * 0.6;
                stroke(c, [[p[0], p[1] + 8], [p[0] + lean * len * 0.5, p[1] + len * 0.5], [p[0] + lean * len, p[1] + len]],
                    { w: 14 + r() * 14, ink: (o.ink ?? 0.5) * 0.45, dry: 0.95, seed: key + 'cu' + i, taper: [0.1, 0.7], blunt: 0.8, core: false });
            }
        });
        sp.draw(g);
    }

    /**
     * The sun: a disc painted with horizontal dry-brush strokes (ragged edge, white streaks),
     * as in a sumi-e red sun. `color` RED or a grey. Cached by radius and colour.
     */
    function sun(g, env, x, y, r, o = {}) {
        const color = o.color ?? RED, key = 'sun:' + r + ':' + color + ':' + (o.seed ?? '');
        const box = { x: -r * 1.3, y: -r * 1.3, w: r * 2.6, h: r * 2.6 };
        const sp = Motion.sprite(key, box, env.k, (c) => {
            const rr = R(key);
            const tmp = document.createElement('canvas');
            tmp.width = Math.ceil(box.w * env.k);
            tmp.height = Math.ceil(box.h * env.k);
            const t = tmp.getContext('2d');
            t.scale(env.k, env.k);
            t.translate(-box.x, -box.y);
            // the disc: painted in a few round passes, so its edge is ragged, not a circle
            t.fillStyle = color;
            t.beginPath();
            for (let i = 0; i <= 90; i++) {
                const a = (i / 90) * Math.PI * 2;
                const k = r * (0.985 + 0.02 * n1(key, i * 0.55) + 0.01 * n1(key + 'f', i * 3.1));
                t.lineTo(Math.cos(a) * k, Math.sin(a) * k);
            }
            t.fill();
            // dry streaks where the brush ran out: horizontal, mostly on one side
            t.globalCompositeOperation = 'destination-out';
            t.lineCap = 'round';
            for (let i = 0; i < r * 0.45; i++) {
                const yy = -r + rr() * 2 * r;
                const half = Math.sqrt(Math.max(0, r * r - yy * yy));
                const side = rr() < 0.7 ? 1 : -1;
                const x1 = side * half * (1.02 + rr() * 0.05);
                const len = half * (0.15 + rr() * rr() * 0.9);
                t.strokeStyle = `rgba(0,0,0,${(0.25 + rr() * 0.7).toFixed(2)})`;
                t.lineWidth = 0.6 + rr() * 2.2;
                t.beginPath();
                t.moveTo(x1, yy);
                t.lineTo(x1 - side * len, yy + (rr() - 0.5) * 2);
                t.stroke();
            }
            // the pigment thins towards one side: solid at the top left, washing out to pink
            // and paper at the bottom right (as in the references' red suns)
            if ((o.fade ?? 0.8) > 0) {
                t.globalCompositeOperation = 'destination-out';
                const gr = t.createLinearGradient(-r * 0.6, -r * 0.6, r * 0.9, r * 0.9);
                gr.addColorStop(0, 'rgba(0,0,0,0)');
                gr.addColorStop(0.45, `rgba(0,0,0,${(0.25 * (o.fade ?? 0.8)).toFixed(3)})`);
                gr.addColorStop(1, `rgba(0,0,0,${(0.92 * (o.fade ?? 0.8)).toFixed(3)})`);
                t.fillStyle = gr;
                t.fillRect(-r * 1.3, -r * 1.3, r * 2.6, r * 2.6);
            }
            // denser pigment in some strokes
            t.globalCompositeOperation = 'source-atop';
            for (let i = 0; i < r / 18; i++) {
                const yy = -r + rr() * 2 * r, half = Math.sqrt(Math.max(0, r * r - yy * yy));
                t.strokeStyle = tone(0.12 + rr() * 0.12, '#300000');
                t.lineWidth = 3 + rr() * 9;
                t.beginPath();
                t.moveTo(-half, yy);
                t.lineTo(half * (rr() * 2 - 1), yy + (rr() - 0.5) * 3);
                t.stroke();
            }
            t.globalCompositeOperation = 'source-over';
            c.save();
            c.setTransform(1, 0, 0, 1, 0, 0);
            c.filter = `blur(${(0.6 * env.k).toFixed(2)}px)`;
            c.drawImage(tmp, 0, 0);
            c.filter = 'none';
            c.restore();
        });
        g.save();
        g.translate(x, y);
        g.globalAlpha *= o.alpha ?? 1;
        sp.draw(g);
        g.restore();
    }

    // --- hanko (seal) -------------------------------------------------------------------
    function seal(g, env, x, y, size, text, o = {}) {
        const key = 'seal:' + text + size + (o.cols ?? '');
        const box = { x: -size * 0.6, y: -size * 0.6, w: size * 1.2, h: size * 1.2 };
        const sp = Motion.sprite(key, box, env.k, (c) => {
            const r = R(key);
            c.fillStyle = o.color ?? RED;
            const s = size / 2;
            c.beginPath();
            c.moveTo(-s + r() * 2, -s + r() * 2);
            c.lineTo(s - r() * 2, -s + r() * 2);
            c.lineTo(s - r() * 2, s - r() * 2);
            c.lineTo(-s + r() * 2, s - r() * 2);
            c.closePath();
            c.fill();
            c.globalCompositeOperation = 'destination-out';
            c.fillStyle = '#000';
            c.font = `${o.weight ?? 400} ${size * (o.fs ?? 0.4)}px ${o.font ?? 'serif'}`;
            c.textAlign = 'center';
            c.textBaseline = 'middle';
            const chars = [...text];
            // characters read in columns, top to bottom, right to left
            const cols = o.cols ?? (chars.length > 2 ? 2 : 1), rows = Math.ceil(chars.length / cols), step = o.step ?? 0.42;
            chars.forEach((ch, i) => {
                const col = cols - 1 - Math.floor(i / rows), row = i % rows;
                c.fillText(ch, (col - (cols - 1) / 2) * size * step, (row - (rows - 1) / 2) * size * step);
            });
            // worn stamp: speckles of missing ink
            for (let i = 0; i < size * 3; i++) {
                c.globalAlpha = 0.3 + r() * 0.7;
                c.fillRect(-s + r() * size, -s + r() * size, 0.5 + r() * 1.5, 0.5 + r() * 1.5);
            }
        });
        g.save();
        g.translate(x, y);
        g.globalAlpha *= o.alpha ?? 0.92;
        sp.draw(g);
        g.restore();
    }

    // --- dry-brush grain over the ink -------------------------------------------------------
    // A tile of paper-white flecks and short streaks, composited with `screen` from `post`:
    // on white paper it changes nothing, on ink the paper shows through in the grain, as in
    // a dry brush on rough paper (the chalky texture of every stroke in the references).
    let grainTile = null;
    function grainTileMake(size, seed) {
        const c = document.createElement('canvas');
        c.width = c.height = size;
        const x = c.getContext('2d');
        const r = R(seed);
        x.fillStyle = '#000';
        x.fillRect(0, 0, size, size);
        const put = (fn) => { for (const dx of [-size, 0, size]) for (const dy of [-size, 0, size]) { x.save(); x.translate(dx, dy); fn(); x.restore(); } };
        for (let i = 0; i < size * size / 9; i++) {
            const px = r() * size, py = r() * size, a = 0.15 + r() * r() * 0.85;
            const w = 0.6 + r() * 1.4;
            put(() => {
                x.fillStyle = `rgba(255,255,255,${a.toFixed(2)})`;
                x.fillRect(px, py, w, w * (0.6 + r() * 0.8));
            });
        }
        // short streaks: the paper's tooth catching the side of the brush
        for (let i = 0; i < size * 2.2; i++) {
            const px = r() * size, py = r() * size, len = 3 + r() * 14, ang = (r() < 0.5 ? 0 : Math.PI / 2) + (r() - 0.5) * 0.5;
            const a = 0.1 + r() * 0.35;
            put(() => {
                x.strokeStyle = `rgba(255,255,255,${a.toFixed(2)})`;
                x.lineWidth = 0.5 + r() * 0.9;
                x.beginPath();
                x.moveTo(px, py);
                x.lineTo(px + Math.cos(ang) * len, py + Math.sin(ang) * len);
                x.stroke();
            });
        }
        return c;
    }
    function grain(ctx, env, o = {}) {
        if (!grainTile) grainTile = grainTileMake(384, 'grain');
        const pat = ctx.createPattern(grainTile, 'repeat');
        const s = (o.scale ?? 1) * (env.px[0] / 1920);
        pat.setTransform(new DOMMatrix([s, 0, 0, s, o.ox ?? 0, o.oy ?? 0]));
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        ctx.globalAlpha = o.amount ?? 0.55;
        ctx.fillStyle = pat;
        ctx.fillRect(0, 0, env.px[0], env.px[1]);
        ctx.restore();
    }

    // --- trees ---------------------------------------------------------------------------
    /**
     * An old plum/cherry tree, grown from a seed: a gnarled trunk (dark edges, a lighter
     * hatched inside, knots), angular branches that zigzag and fork alternately, and thin
     * twigs with sharp tips. Paints on `c` (use inside a sprite) and returns where blossoms
     * can go: { tips: [{p, a}], twigs: [[x, y], ...] }.
     *   base [x, y], ang (rad, -PI/2 is up), len, w, depth, gnarl, seed, ink, trunk (pts)
     */
    function tree(c, o) {
        const r = R(o.seed ?? 'tree');
        const tips = [], twigs = [], segs = [];
        const gnarl = o.gnarl ?? 0.55, ink = o.ink ?? 0.95;
        const at = (pts, u) => {
            const f = u * (pts.length - 1), i = Math.min(pts.length - 2, Math.floor(f));
            return Ease.lerpPt(pts[i], pts[i + 1], f - i);
        };
        // A limb is ONE stroke from its root to a fine tip: its leader zigzags on through
        // `d` levels while side limbs (each its own stroke) fork off alternately.
        function branch(p, ang, len, w, d) {
            const pts = [p];
            let a = ang, q = p, seg = (len * 1.7) / (1 + 0.7 * d);    // the whole limb is about `len` long
            const forks = [];
            for (let lv = d; lv >= 0; lv--) {
                const n = 2 + Math.floor(r() * 2);
                const gn = lv <= 1 ? gnarl * 0.45 : gnarl;      // young shoots grow straight
                for (let i = 0; i < n; i++) {
                    a += (r() - 0.5) * gn;
                    q = [q[0] + Math.cos(a) * seg / n, q[1] + Math.sin(a) * seg / n];
                    pts.push(q);
                    if (lv > 0 && i === n - 1) twigs.push(q);
                }
                if (lv > 0) {
                    const kids = lv >= 2 ? 2 + (r() < 0.4 ? 1 : 0) : r() < 0.35 ? 1 : 2;
                    for (let j = 0; j < kids; j++) forks.push({ i: Math.max(1, pts.length - 1 - Math.floor(r() * n)), lv, side: (j + forks.length) % 2 ? 1 : -1, a });
                }
                seg *= 0.66 + r() * 0.1;
            }
            tips.push({ p: q, a });
            segs.push({ pts, w, d, limb: true });
            // width along the limb: from w at the root to a hair at the tip
            const total = pts.length - 1;
            for (const f of forks) {
                const u = f.i / total, wu = w * (1 - 0.85 * u);
                const fa = f.a + f.side * (0.45 + r() * 0.6);
                const root = [pts[f.i][0] - Math.cos(fa) * wu * 0.3, pts[f.i][1] - Math.sin(fa) * wu * 0.3];
                const sub = f.lv - 1;
                if (sub < 0 || wu * 0.55 < 1.2) {
                    const l = len * 0.25 * (0.6 + r() * 0.6);
                    const tip = [root[0] + Math.cos(fa) * l, root[1] + Math.sin(fa) * l];
                    segs.push({ pts: [root, Ease.lerpPt(root, tip, 0.5), tip], w: Math.max(1.6, wu * 0.5), d: 0 });
                    tips.push({ p: tip, a: fa });
                } else branch(root, fa, len * (0.4 + r() * 0.25) * (1 - u * 0.4), wu * (0.55 + r() * 0.15), sub);
            }
        }
        for (const sb of o.limbs ?? []) branch(sb.p, sb.a, sb.len, sb.w, sb.d);
        // thick first, thin on top
        segs.sort((a, b) => b.w - a.w);
        for (const s of segs) {
            stroke(c, s.pts, { w: s.w, ink, dry: s.w > 10 ? 0.55 : 0.4, seed: (o.seed ?? 't') + 'b' + segs.indexOf(s), raw: false,
                taper: [0.03, s.limb ? 0.35 : 0.9], blunt: 0.8, press: s.limb ? (u) => 1 - 0.75 * u : null });
        }
        // trunk, painted over the limbs' roots so every limb grows out of it
        if (o.trunk) {
            const T = o.trunk, tw = o.w;
            // body: a grey dry-brush wash with streaks along the grain
            stroke(c, T, { w: tw, ink: ink * 0.62, dry: 0.75, seed: o.seed + 'tb', taper: [0, 0.35], blunt: 1, press: (u) => 1.25 - 0.55 * u, core: true });
            // hatching across the bark, the way the references texture a trunk
            const { L, N, total } = measure(smooth(T, 4));
            const P = smooth(T, 4);
            for (let s = 0; s < total; s += 8 + r() * 10) {
                const i = Math.min(P.length - 1, Math.round((s / total) * (P.length - 1)));
                const uu = s / total;
                const hw = tw * 0.5 * (1.25 - 0.55 * uu) * 0.75 * Math.pow(clamp((1 - uu) / 0.35, 0, 1), 0.65);
                if (hw < 3) continue;
                const p = P[i], nn = N[i];
                const k0 = -hw * (0.3 + r() * 0.7), k1 = hw * (0.3 + r() * 0.7), sl = (r() - 0.5) * 8;
                stroke(c, [[p[0] + nn[0] * k0, p[1] + nn[1] * k0], [p[0] + nn[0] * k1 + sl, p[1] + nn[1] * k1 - Math.abs(sl)]],
                    { w: 1.5 + r() * 2.5, ink: ink * (0.25 + r() * 0.35), dry: 0.7, seed: o.seed + 'h' + s.toFixed(0), taper: [0.2, 0.3], core: false, bleed: false });
            }
            // the dark edges that give the trunk its roundness
            for (const side of [-1, 1]) {
                const edge = P.map((p, i) => {
                    const hw = tw * 0.5 * (1.25 - 0.55 * (L[i] / total)) * (0.85 + 0.12 * n1(o.seed + 'e' + side, i * 0.05));
                    return [p[0] + N[i][0] * hw * side, p[1] + N[i][1] * hw * side];
                });
                stroke(c, edge, { w: tw * (side < 0 ? 0.28 : 0.18), ink, dry: 0.55, seed: o.seed + 'edge' + side, taper: [0, 0.45], blunt: 1, raw: true });
            }
            // knots and cracks
            for (let i = 0; i < 5; i++) {
                const u = 0.15 + r() * 0.6, p = at(P, u);
                dab(c, p[0] + (r() - 0.5) * tw * 0.3, p[1], tw * 0.08, tw * 0.05, { seed: o.seed + 'k' + i, ink, rot: r() * 3 });
            }
        }
        return { tips, twigs, segs };
    }

    /**
     * A blossom (ume/sakura) seen from the front or in profile: red petals with a deeper
     * centre and pale vein lines, an ink heart with stamens. `open` 0..1 (bud → flower).
     */
    function blossom(g, x, y, rad, o = {}) {
        const r = R(o.seed ?? 'bl'), rot = o.rot ?? r() * 6, open = o.open ?? 1, color = o.color ?? RED;
        if (open < 0.35 || o.bud) {
            dab(g, x, y, rad * 0.45, rad * 0.55, { seed: o.seed + 'bud', color, ink: 0.95, rot });
            stroke(g, [[x, y + rad * 0.4], [x - rad * 0.1, y + rad * 0.85]], { w: rad * 0.22, ink: 0.9, dry: 0.2, seed: o.seed + 'sep', taper: [0, 0.6], core: false });
            return;
        }
        const prof = o.profile ?? false;
        const n = prof ? 3 : 5;
        for (let i = 0; i < n; i++) {
            const a = prof ? rot - 0.9 + i * 0.9 : rot + (i / n) * Math.PI * 2;
            const d = rad * (prof ? 0.45 : 0.52) * open;
            const px = x + Math.cos(a) * d, py = y + Math.sin(a) * d * (prof ? 0.6 : 1);
            dab(g, px, py, rad * 0.5 * open, rad * 0.42 * open, { seed: o.seed + 'p' + i, color, ink: 0.88, rot: a, rough: 0.2 });
            // pale vein down the petal, deeper red at its root
            g.strokeStyle = 'rgba(255,240,236,0.55)';
            g.lineWidth = Math.max(0.5, rad * 0.06);
            g.beginPath();
            g.moveTo(x + Math.cos(a) * rad * 0.25, y + Math.sin(a) * rad * 0.25);
            g.lineTo(px + Math.cos(a) * rad * 0.25, py + Math.sin(a) * rad * 0.25);
            g.stroke();
        }
        dab(g, x, y, rad * 0.32, rad * 0.3, { seed: o.seed + 'c', color: RED_DEEP, ink: 0.9 });
        // stamens: fine ink lines with dots
        for (let i = 0; i < 6; i++) {
            const a = rot + i * 1.05 + r() * 0.3, l = rad * (0.35 + r() * 0.25);
            g.strokeStyle = tone(0.75);
            g.lineWidth = Math.max(0.4, rad * 0.04);
            g.beginPath();
            g.moveTo(x, y);
            g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l);
            g.stroke();
            g.fillStyle = INK;
            g.beginPath();
            g.arc(x + Math.cos(a) * l, y + Math.sin(a) * l, Math.max(0.5, rad * 0.06), 0, Math.PI * 2);
            g.fill();
        }
    }

    // Blossoms along a tree: clusters at the tips and on the young twigs, buds, little red
    // rings and dots in the air around them (as in the references). density 0..1.
    function bloom(g, grown, o = {}) {
        const r = R(o.seed ?? 'bloom'), dens = o.density ?? 1, size = o.size ?? 9;
        const out = [];
        for (const t of grown.tips) {
            if (r() > dens) continue;
            const k = r() < 0.6 ? 1 : 2;
            for (let j = 0; j < k; j++) {
                const p = [t.p[0] + (r() - 0.5) * size * 2.2, t.p[1] + (r() - 0.5) * size * 2.2];
                const kind = r();
                if (kind < 0.25) blossom(g, p[0], p[1], size * 0.6, { seed: 'bb' + out.length, bud: true, rot: t.a + Math.PI / 2 });
                else blossom(g, p[0], p[1], size * (0.8 + r() * 0.5), { seed: 'bf' + out.length, profile: kind > 0.75, rot: t.a - Math.PI / 2 + (r() - 0.5) });
                out.push(p);
            }
        }
        for (const p of grown.twigs) {
            if (r() > dens * 0.12) continue;
            blossom(g, p[0] + (r() - 0.5) * 6, p[1] + (r() - 0.5) * 6, size * (0.7 + r() * 0.4), { seed: 'bt' + out.length, profile: r() < 0.3 });
            out.push(p);
        }
        // rings and dots in the air
        const all = out.length ? out : grown.tips.map((t) => t.p);
        for (let i = 0; i < all.length * 0.8 * dens; i++) {
            const p = all[Math.floor(r() * all.length)];
            const x = p[0] + (r() - 0.5) * size * 6, y = p[1] + (r() - 0.5) * size * 6;
            if (r() < 0.5) {
                g.strokeStyle = tone(0.8, RED);
                g.lineWidth = Math.max(0.6, size * 0.1);
                g.beginPath();
                g.arc(x, y, size * (0.15 + r() * 0.2), 0, Math.PI * 2);
                g.stroke();
            } else {
                g.fillStyle = tone(0.85, RED);
                g.beginPath();
                g.arc(x, y, size * (0.08 + r() * 0.14), 0, Math.PI * 2);
                g.fill();
            }
        }
        return out;
    }

    // A loose petal (falling or floating): a small curled red dab with a darker edge.
    function petal(g, x, y, s, rot, o = {}) {
        g.save();
        g.translate(x, y);
        g.rotate(rot);
        g.scale(1, o.flip ?? 1);
        g.fillStyle = tone(o.ink ?? 0.9, o.color ?? RED);
        g.beginPath();
        g.moveTo(-s, 0);
        g.quadraticCurveTo(-s * 0.2, -s * 0.75, s, -s * 0.1);
        g.quadraticCurveTo(s * 0.1, s * 0.5, -s, 0);
        g.fill();
        g.strokeStyle = tone(0.5, RED_DEEP);
        g.lineWidth = Math.max(0.4, s * 0.12);
        g.stroke();
        g.restore();
    }

    // --- birds -------------------------------------------------------------------------------
    /**
     * A crane in flight, in ink silhouette: long neck and beak ahead, legs trailing, wings of
     * separate primary feathers. `flap` is the wing phase (0..1 per beat), dir 1 = right.
     */
    function crane(g, x, y, s, flap, o = {}) {
        const dir = o.dir ?? 1, ink = o.ink ?? 0.95, seed = o.seed ?? 'crane';
        const w = Math.sin(flap * Math.PI * 2);          // +1 wings up, -1 down
        g.save();
        g.translate(x, y);
        g.scale(dir, 1);
        g.rotate(o.tilt ?? -0.15);
        // body
        stroke(g, [[-s * 0.5, s * 0.06], [-s * 0.1, s * 0.02], [s * 0.35, -s * 0.06]], { w: s * 0.3, ink, dry: 0.25, seed: seed + 'b', taper: [0.35, 0.45], blunt: 0.4, press: (u) => 0.7 + 0.5 * Math.sin(Math.PI * u) });
        // neck and head, beak
        stroke(g, [[s * 0.3, -s * 0.04], [s * 0.7, -s * 0.12], [s * 1.0, -s * 0.18]], { w: s * 0.1, ink, dry: 0.3, seed: seed + 'n', taper: [0, 0.2], blunt: 1 });
        dab(g, s * 1.02, -s * 0.19, s * 0.07, s * 0.055, { seed: seed + 'h', ink });
        stroke(g, [[s * 1.06, -s * 0.19], [s * 1.28, -s * 0.16]], { w: s * 0.035, ink, dry: 0.2, seed: seed + 'k', taper: [0, 0.9], blunt: 1, core: false });
        // legs trailing
        stroke(g, [[-s * 0.3, s * 0.05], [-s * 0.8, s * 0.12], [-s * 1.15, s * 0.16]], { w: s * 0.04, ink, dry: 0.3, seed: seed + 'l', taper: [0, 0.4], core: false });
        // tail tuft
        stroke(g, [[-s * 0.25, 0], [-s * 0.5, s * 0.08]], { w: s * 0.14, ink, dry: 0.6, seed: seed + 't', taper: [0, 0.8], blunt: 1 });
        // wings: near one over the body, far one fainter; feathers fan out from the shoulder
        for (const [k, far] of [[1, true], [0, false]]) {
            const sh = [s * 0.08 + k * s * 0.05, -s * 0.06];
            const base = -Math.PI / 2 + 0.2 - w * 1.05 + (far ? 0.25 : 0);   // up or down
            const reach = s * (1.55 + 0.2 * Math.abs(w)) * (far ? 0.8 : 1);
            g.save();
            g.globalAlpha *= far ? 0.75 : 1;
            // the arm of the wing (a broad stroke), then the primaries fanning from its end
            const elbow = [sh[0] + Math.cos(base + 0.45) * reach * 0.42, sh[1] + Math.sin(base + 0.45) * reach * 0.42];
            stroke(g, [sh, Ease.lerpPt(sh, elbow, 0.5), elbow], { w: s * 0.36, ink, dry: 0.35, seed: seed + 'arm' + k, taper: [0.25, 0.1], blunt: 0.35, press: (u) => 1 - 0.3 * u });
            for (let i = 0; i < 7; i++) {
                const a = base - 0.35 + i * 0.13;
                const l = reach * (0.62 - i * 0.045);
                const tip = [elbow[0] + Math.cos(a) * l - i * s * 0.06, elbow[1] + Math.sin(a) * l];
                const mid = Ease.lerpPt(elbow, tip, 0.5);
                stroke(g, [[elbow[0] - i * s * 0.04, elbow[1] + i * s * 0.02], [mid[0] + Math.cos(a + 1.57) * s * 0.03, mid[1] + Math.sin(a + 1.57) * s * 0.03], tip],
                    { w: s * (0.2 - i * 0.008), ink, dry: 0.5, seed: seed + 'w' + k + i, taper: [0, 0.75], blunt: 1 });
            }
            g.restore();
        }
        g.restore();
    }

    // --- landscape pieces -------------------------------------------------------------------
    // A reed sprig in the water: a thin stem with a few leaves angled down, its reflection.
    function reed(c, x, y, h, o = {}) {
        const r = R(o.seed ?? 'reed'), ink = o.ink ?? 0.85;
        const stems = 2 + Math.floor(r() * 3);
        for (let i = 0; i < stems; i++) {
            const sx = x + (i - stems / 2) * h * 0.12, hh = h * (0.6 + r() * 0.4), lean = (r() - 0.5) * 0.25;
            const top = [sx + lean * hh, y - hh];
            stroke(c, [[sx, y], top], { w: Math.max(1.2, h * 0.035), ink, dry: 0.3, seed: (o.seed ?? 'r') + 's' + i, taper: [0, 0.4], core: false });
            const nl = 1 + Math.floor(r() * 3), lean2 = r() < 0.5 ? 1 : -1;
            for (let j = 0; j < nl; j++) {
                const u = 0.45 + r() * 0.5, p = Ease.lerpPt([sx, y], top, u);
                const side = r() < 0.75 ? lean2 : -lean2, l = h * (0.25 + r() * 0.18), drop = 0.15 + r() * 0.5;
                stroke(c, [p, [p[0] + side * l * 0.55, p[1] - l * 0.05], [p[0] + side * l, p[1] + l * drop]],
                    { w: h * 0.07, ink, dry: 0.35, seed: (o.seed ?? 'r') + 'l' + i + j, taper: [0.05, 0.9], blunt: 1 });
            }
            // reflection: a broken, paler copy of the stem
            stroke(c, [[sx, y + 3], [sx - lean * hh * 0.4, y + hh * 0.45]], { w: Math.max(1.2, h * 0.04), ink: ink * 0.3, dry: 0.8, seed: (o.seed ?? 'r') + 'rf' + i, taper: [0, 0.7], core: false });
        }
    }

    // Halo rings around a sun: thin, broken circles in dry brush.
    function halo(g, env, x, y, r, o = {}) {
        const key = 'halo:' + r + (o.color ?? '') + (o.seed ?? '');
        const box = { x: -r * 1.5, y: -r * 1.5, w: r * 3, h: r * 3 };
        const sp = Motion.sprite(key, box, env.k, (c) => {
            const rr = R(key);
            for (let i = 0; i < (o.rings ?? 3); i++) {
                const rad = r * (1.12 + i * 0.1 + rr() * 0.03), a0 = rr() * 6, span = 1.4 + rr() * 2.2;
                const pts = [];
                for (let k = 0; k <= 40; k++) {
                    const a = a0 + (span * k) / 40;
                    pts.push([Math.cos(a) * rad, Math.sin(a) * rad]);
                }
                stroke(c, pts, { w: 1.5 + rr() * 2, ink: 0.22 - i * 0.05, color: o.color ?? INK, dry: 0.85, seed: key + i, taper: [0.4, 0.4], core: false });
            }
        });
        g.save();
        g.translate(x, y);
        sp.draw(g);
        g.restore();
    }

    // --- opaque landscape (round 3) ---------------------------------------------------------
    // Ink landscapes are ONE sheet: what is in front hides what is behind, and mist is the
    // paper showing, not transparency. Every piece below first knocks out its silhouette in
    // paper colour, then inks it, then fades its foot back to paper (opaque).
    const PAPER_RGB = hex(PAPER);
    const paperA = (a) => `rgba(${PAPER_RGB[0]},${PAPER_RGB[1]},${PAPER_RGB[2]},${a})`;
    function pathOf(c, pts, close = true) {
        c.beginPath();
        c.moveTo(pts[0][0], pts[0][1]);
        for (const p of pts) c.lineTo(p[0], p[1]);
        if (close) c.closePath();
    }
    // fade the lower part of whatever is clipped back to paper: [y0 → y1] = ink → paper
    function mistFoot(c, x0, x1, y0, y1) {
        const gr = c.createLinearGradient(0, y0, 0, y1);
        gr.addColorStop(0, paperA(0));
        gr.addColorStop(0.6, paperA(0.75));
        gr.addColorStop(1, paperA(1));
        c.fillStyle = gr;
        c.fillRect(x0, y0, x1 - x0, y1 - y0 + 400);
    }

    /**
     * A hill in dry brush (as in the references' middle ground): an opaque silhouette, a dark
     * broken ridge line, dense strokes running down the slopes, the foot lost in mist.
     *   { x0, x1, base, h, peaks, ink, seed, mist (0..1 of the height left white at the foot) }
     */
    function hill(c, o) {
        const r = R(o.seed ?? 'hill'), ink = o.ink ?? 0.85;
        const pts = ridge(o.seed ?? 'hill', o.x0, o.x1, o.base, o.h, { peaks: o.peaks ?? 2, sharp: o.sharp ?? 0.8, step: 8 });
        const top = Math.min(...pts.map((p) => p[1]));
        const shape = [[o.x0, o.base + 30], ...pts, [o.x1, o.base + 30]];
        c.save();
        pathOf(c, shape);
        c.fillStyle = PAPER;
        c.fill();
        c.clip();
        // tone under the ridge
        const gr = c.createLinearGradient(0, top, 0, o.base);
        gr.addColorStop(0, tone(ink * 0.6));
        gr.addColorStop(0.5, tone(ink * 0.3));
        gr.addColorStop(1, tone(0));
        c.fillStyle = gr;
        c.fillRect(o.x0, top, o.x1 - o.x0, o.base - top + 10);
        // strokes down the slopes, following the local slope direction
        const n = Math.round((o.x1 - o.x0) / 3);
        for (let i = 0; i < n; i++) {
            const k = Math.floor(r() * (pts.length - 2)) + 1;
            const p = pts[k], q = pts[k + 1];
            const slope = Math.atan2(q[1] - p[1], q[0] - p[0]);
            const down = slope + (Math.cos(slope) > 0 ? Math.PI / 2 : -Math.PI / 2);
            // strokes run down the slope (along the fall line), broad and overlapping
            const fall = slope + (Math.cos(slope) > 0 ? 1 : -1) * Math.PI * 0.5 * 0.0 + (Math.sin(slope) >= 0 ? 0 : 0);
            const along = Math.abs(Math.sin(slope)) > 0.08 ? (Math.sin(slope) > 0 ? slope : slope + Math.PI) : Math.PI / 2;
            const dir = along * 0.8 + (Math.PI / 2) * 0.2 + (r() - 0.5) * 0.2;   // down the slope; flat tops get flat strokes
            const depth = r() * r();
            const s0 = [p[0] + (r() - 0.5) * 10, p[1] + depth * (o.base - p[1]) * 0.5];
            const len = (o.base - p[1]) * (0.15 + r() * 0.45);
            if (len < 6) continue;
            const s1 = [s0[0] + Math.cos(dir) * len, s0[1] + Math.sin(dir) * len];
            stroke(c, [s0, Ease.lerpPt(s0, s1, 0.5), s1], { w: 10 + r() * 16, ink: ink * (0.22 + r() * 0.4) * (1 - depth * 0.5), dry: 0.92, seed: (o.seed ?? 'h') + 'h' + i, taper: [0.15, 0.6], blunt: 0.5, core: false, bleed: false });
        }
        // the foot dissolves into mist (paper)
        mistFoot(c, o.x0, o.x1, o.base - (o.base - top) * (o.mist ?? 0.45), o.base);
        c.restore();
        // broken ridge line in dark dry brush
        const segs = 3 + Math.floor(r() * 2);
        for (let sgi = 0; sgi < segs; sgi++) {
            const a = Math.floor((sgi / segs) * pts.length), b = Math.min(pts.length, Math.floor(((sgi + 0.85) / segs) * pts.length));
            stroke(c, pts.slice(a, b), { w: 5 + r() * 4, ink, dry: 0.7, seed: (o.seed ?? 'h') + 'r' + sgi, taper: [0.2, 0.4], blunt: 0.6, raw: true, bleed: false });
        }
        return pts;
    }

    /**
     * A karst peak (rewritten round 3): an opaque, lopsided column (steep left side, a
     * slanted uneven top, a shoulder stepping down on the right), its top half dense black
     * built from vertical strokes, the lower half running down in streaks into white mist.
     *   x = left foot, base, w, h; o: { ink, seed, shoulder (0..1), slant }
     */
    function peak(g, env, key, x, base, w, h, o = {}) {
        const box = { x: x - 40, y: base - h - 40, w: w + 80, h: h + 80 };
        Motion.sprite('sumi-peak3:' + key, box, env.k, (c) => {
            const r = R(key);
            const sh = o.shoulder ?? 0.7, sl = o.slant ?? 0.08;
            const J = (v, a) => v + (r() - 0.5) * a;
            // silhouette, clockwise from the left foot
            const S = [
                [x, base],
                [J(x + w * 0.03, 4), base - h * 0.45],
                [J(x + w * 0.08, 4), base - h * 0.82],
                [x + w * 0.16, base - h * (0.97 + sl * 0.3)],
                [x + w * 0.3, base - h * 1.0],
                [x + w * 0.45, base - h * (0.97 - sl)],
                [x + w * 0.56, base - h * (0.9 - sl)],
                [J(x + w * 0.62, 4), base - h * sh],
                [x + w * 0.78, base - h * (sh - 0.06)],
                [J(x + w * 0.86, 4), base - h * (sh - 0.25)],
                [J(x + w * 0.95, 4), base - h * 0.2],
                [x + w, base],
            ];
            // roughen the outline: resample, wobble
            const out = smooth(S, 6).map(([px, py], i) => [px + 2.5 * n1(key + 'ox', i * 0.4), py + 2 * n1(key + 'oy', i * 0.4)]);
            c.save();
            pathOf(c, [...out, [x + w, base + 30], [x, base + 30]]);
            c.fillStyle = PAPER;
            c.fill();
            c.clip();
            // the body: dark at the top, greying downwards, under the strokes
            const ink = o.ink ?? 0.95;
            const bg = c.createLinearGradient(0, base - h, 0, base);
            bg.addColorStop(0, tone(ink * 0.92));
            bg.addColorStop(0.4, tone(ink * 0.7));
            bg.addColorStop(0.75, tone(ink * 0.25));
            bg.addColorStop(1, tone(0));
            c.fillStyle = bg;
            c.fillRect(x - 10, base - h * 1.1, w + 20, h * 1.1);
            // dense black top from vertical strokes, then streaks running down
            for (let i = 0; i < Math.round(w / 2.2); i++) {
                const px = x + r() * w;
                const topY = base - h * 1.05;
                const len = h * (0.35 + r() * 0.35);
                stroke(c, [[px, topY], [px + (r() - 0.5) * 3, topY + len * 0.5], [px + (r() - 0.5) * 4, topY + len]],
                    { w: 5 + r() * 7, ink: ink * (0.75 + r() * 0.25), dry: 0.55, seed: key + 'v' + i, taper: [0, 0.55], blunt: 1, core: true, bleed: false });
            }
            for (let i = 0; i < Math.round(w / 3); i++) {
                const px = x + r() * w;
                const y0 = base - h * (0.5 + r() * 0.35), len = h * (0.25 + r() * 0.45);
                stroke(c, [[px, y0], [px + (r() - 0.5) * 3, y0 + len * 0.5], [px + (r() - 0.5) * 4, y0 + len]],
                    { w: 3 + r() * 8, ink: ink * (0.3 + r() * 0.45), dry: 0.9, seed: key + 's' + i, taper: [0.3, 0.9], blunt: 0.5, core: false, bleed: false });
            }
            mistFoot(c, x - 10, x + w + 10, base - h * 0.5, base - h * 0.05);
            c.restore();
            // rough dark edges on both sides, stronger on the shadow (left) side
            const left = out.filter((p) => p[0] < x + w * 0.35 && p[1] < base - h * 0.35);
            const right = out.filter((p) => p[0] > x + w * 0.55 && p[1] < base - h * 0.3);
            if (left.length > 2) stroke(c, left, { w: 7, ink, dry: 0.65, seed: key + 'el', taper: [0.4, 0.1], raw: true, bleed: false });
            if (right.length > 2) stroke(c, right, { w: 5, ink: ink * 0.9, dry: 0.75, seed: key + 'er', taper: [0.1, 0.5], raw: true, bleed: false });
        }).draw(g);
    }

    /**
     * Trees in the distance (rewritten round 3): dark irregular masses of foliage made of
     * clumped dabs, lighter and broken at the top, with a few trunks showing below.
     */
    function foliage(c, x, y, w, h, o = {}) {
        const r = R(o.seed ?? 'fol'), ink = o.ink ?? 0.9;
        const clumps = Math.max(1, Math.round(w / (h * 0.9)));
        for (let k = 0; k < clumps; k++) {
            const cx = x - w / 2 + (w * (k + 0.5)) / clumps + (r() - 0.5) * h * 0.3;
            const ch = h * (0.65 + r() * 0.45), cw = (w / clumps) * (0.7 + r() * 0.5);
            // trunk(s)
            stroke(c, [[cx, y + 2], [cx + (r() - 0.5) * 6, y - ch * 0.4]], { w: Math.max(2, h * 0.07), ink, dry: 0.4, seed: (o.seed ?? 'f') + 't' + k, taper: [0, 0.6], core: false, bleed: false });
            // the crown: flat pads of short horizontal strokes, stacked and offset, darker
            // underneath, broken at the edges (as distant trees are painted)
            const pads = 2 + Math.floor(r() * 3);
            for (let pdi = 0; pdi < pads; pdi++) {
                const py = y - ch * (0.25 + (pdi / pads) * 0.75), pw = cw * (1 - pdi / (pads + 1) * 0.5) * (0.7 + r() * 0.4);
                const px = cx + (r() - 0.5) * cw * 0.35;
                const rows = 3 + Math.floor(r() * 3);
                for (let rw = 0; rw < rows; rw++) {
                    const yy = py - rw * h * 0.06, span = pw * (0.5 + 0.5 * Math.sin(Math.PI * (rw + 0.5) / rows));
                    for (let q = 0; q < 3; q++) {
                        const x0 = px - span / 2 + r() * span * 0.3, len = span * (0.25 + r() * 0.45);
                        stroke(c, [[x0, yy + (r() - 0.5) * 3], [x0 + len, yy + (r() - 0.5) * 3]],
                            { w: h * (0.07 + r() * 0.05), ink: ink * (0.75 + 0.25 * (1 - rw / rows)), dry: 0.55, seed: (o.seed ?? 'f') + k + 'p' + pdi + rw + q, taper: [0.2, 0.4], blunt: 0.6, bleed: false });
                    }
                }
                for (let q = 0; q < 6; q++) dab(c, px + (r() - 0.5) * pw, py - r() * h * 0.2, 1.5 + r() * 2.5, 1.2 + r() * 2, { seed: (o.seed ?? 'f') + k + 'dot' + pdi + q, ink });
            }
        }
    }

    // A roof with eaves that sweep up into points (the shape of every temple roof in the
    // references), filled in ink; `rw` half width at the eaves, `rh` height.
    function roof(c, x, y, rw, rh, o = {}) {
        const ink = o.ink ?? 0.95, lift = o.lift ?? 0.55;
        c.fillStyle = tone(ink);
        c.beginPath();
        c.moveTo(x - rw, y - rh * lift);                                 // left eave tip
        c.quadraticCurveTo(x - rw * 0.75, y + rh * 0.08, x - rw * 0.45, y + rh * 0.08);
        c.lineTo(x + rw * 0.45, y + rh * 0.08);
        c.quadraticCurveTo(x + rw * 0.75, y + rh * 0.08, x + rw, y - rh * lift);  // right eave tip
        c.quadraticCurveTo(x + rw * 0.55, y - rh * 0.25, x + rw * 0.2, y - rh);
        c.lineTo(x - rw * 0.2, y - rh);
        c.quadraticCurveTo(x - rw * 0.55, y - rh * 0.25, x - rw, y - rh * lift);
        c.fill();
        // the eave's lower edge in dry brush, so the roof keeps the brush texture
        stroke(c, [[x - rw, y - rh * lift], [x - rw * 0.55, y + rh * 0.08], [x + rw * 0.55, y + rh * 0.08], [x + rw, y - rh * lift]],
            { w: rh * 0.22, ink, dry: 0.5, seed: (o.seed ?? 'roof') + x.toFixed(0) + y.toFixed(0), taper: [0.3, 0.3], blunt: 0.6, bleed: false });
    }

    /**
     * A pagoda (rewritten round 3): a base, then `tiers` storeys each with a dark body, a
     * paper-white railing line and a roof with up-swept eaves, smaller as it rises; a spire
     * with rings and a finial. `s` = total height.
     */
    function pagoda(c, x, y, s, o = {}) {
        const ink = o.ink ?? 0.95, tiers = o.tiers ?? 5, seed = o.seed ?? 'pag';
        const unit = s / (tiers * 1.0 + 1.6);
        let yy = y;
        fillPoly(c, [[x - unit * 0.9, yy], [x + unit * 0.9, yy], [x + unit * 0.8, yy - unit * 0.18], [x - unit * 0.8, yy - unit * 0.18]], tone(ink));
        yy -= unit * 0.18;
        for (let i = 0; i < tiers; i++) {
            const k = 1 - i * 0.11;
            const bw = unit * 0.55 * k, bh = unit * 0.45;
            fillPoly(c, [[x - bw, yy], [x + bw, yy], [x + bw, yy - bh], [x - bw, yy - bh]], tone(ink));
            // railing / window band: paper showing through
            c.strokeStyle = paperA(0.8);
            c.lineWidth = Math.max(0.6, unit * 0.05);
            c.beginPath();
            c.moveTo(x - bw * 0.85, yy - bh * 0.55);
            c.lineTo(x + bw * 0.85, yy - bh * 0.55);
            c.stroke();
            for (let j = -2; j <= 2; j++) {
                c.beginPath();
                c.moveTo(x + j * bw * 0.35, yy - bh * 0.55);
                c.lineTo(x + j * bw * 0.35, yy - bh * 0.15);
                c.stroke();
            }
            yy -= bh;
            roof(c, x, yy, unit * 1.05 * k, unit * 0.42, { ink, seed: seed + i, lift: 0.7 });
            yy -= unit * 0.42;
        }
        // spire with rings and a finial
        stroke(c, [[x, yy + 2], [x, yy - unit * 1.1]], { w: Math.max(1.2, unit * 0.08), ink, dry: 0.2, seed: seed + 'sp', taper: [0, 0.3], core: false, bleed: false });
        for (let i = 0; i < 5; i++) fillPoly(c, [[x - unit * 0.1, yy - unit * (0.25 + i * 0.13)], [x + unit * 0.1, yy - unit * (0.25 + i * 0.13)], [x + unit * 0.1, yy - unit * (0.29 + i * 0.13)], [x - unit * 0.1, yy - unit * (0.29 + i * 0.13)]], tone(ink));
        dab(c, x, yy - unit * 1.12, unit * 0.06, unit * 0.09, { seed: seed + 'fin', ink });
    }

    /**
     * A temple pavilion (as on the reference's right hill): a stone base, pillars, a
     * paper-white frieze with balusters, a big roof with sharply up-swept eaves, and a small
     * upper roof under a spire. `s` = total height.
     */
    function pavilion(c, x, y, s, o = {}) {
        const ink = o.ink ?? 0.95, seed = o.seed ?? 'pav';
        const u = s / 4;
        fillPoly(c, [[x - u * 1.5, y], [x + u * 1.5, y], [x + u * 1.4, y - u * 0.2], [x - u * 1.4, y - u * 0.2]], tone(ink));
        // pillars, the dark interior between them
        fillPoly(c, [[x - u * 0.9, y - u * 0.2], [x + u * 0.9, y - u * 0.2], [x + u * 0.9, y - u * 1.3], [x - u * 0.9, y - u * 1.3]], tone(ink * 0.8));
        for (const k of [-1, -0.35, 0.35, 1]) fillPoly(c, [[x + k * u * 0.95 - u * 0.07, y - u * 0.2], [x + k * u * 0.95 + u * 0.07, y - u * 0.2], [x + k * u * 0.95 + u * 0.07, y - u * 1.35], [x + k * u * 0.95 - u * 0.07, y - u * 1.35]], tone(ink));
        // frieze: a white band with balusters
        fillPoly(c, [[x - u * 1.0, y - u * 1.35], [x + u * 1.0, y - u * 1.35], [x + u * 1.0, y - u * 1.6], [x - u * 1.0, y - u * 1.6]], paperA(0.95));
        c.strokeStyle = tone(ink);
        c.lineWidth = Math.max(0.6, u * 0.04);
        for (let i = 0; i <= 10; i++) {
            const xx = x - u + (2 * u * i) / 10;
            c.beginPath();
            c.moveTo(xx, y - u * 1.35);
            c.lineTo(xx, y - u * 1.6);
            c.stroke();
        }
        c.beginPath();
        c.moveTo(x - u, y - u * 1.35);
        c.lineTo(x + u, y - u * 1.35);
        c.stroke();
        roof(c, x, y - u * 1.62, u * 2.0, u * 0.75, { ink, seed: seed + 'r1', lift: 0.9 });
        fillPoly(c, [[x - u * 0.55, y - u * 2.35], [x + u * 0.55, y - u * 2.35], [x + u * 0.55, y - u * 2.7], [x - u * 0.55, y - u * 2.7]], tone(ink));
        roof(c, x, y - u * 2.7, u * 1.1, u * 0.55, { ink, seed: seed + 'r2', lift: 0.85 });
        stroke(c, [[x, y - u * 3.2], [x, y - u * 4]], { w: Math.max(1.2, u * 0.08), ink, dry: 0.2, seed: seed + 'sp', taper: [0, 0.3], core: false, bleed: false });
        dab(c, x, y - u * 4, u * 0.06, u * 0.09, { seed: seed + 'fin', ink });
    }

    // A torii standing in the water: two pillars, the tie beam (nuki), the top beam
    // (kasagi) with up-swept ends, and its broken reflection.
    function torii(c, x, y, s, o = {}) {
        const ink = o.ink ?? 0.95, seed = o.seed ?? 'torii', w = s * 0.75;
        for (const k of [-1, 1]) {
            stroke(c, [[x + k * w * 0.32, y], [x + k * w * 0.3, y - s * 0.82]], { w: s * 0.075, ink, dry: 0.35, seed: seed + 'p' + k, taper: [0, 0], blunt: 1, bleed: false });
            // reflection
            stroke(c, [[x + k * w * 0.32, y + 4], [x + k * w * 0.33, y + s * 0.35]], { w: s * 0.07, ink: ink * 0.35, dry: 0.85, seed: seed + 'rp' + k, taper: [0, 0.7], core: false, bleed: false });
        }
        stroke(c, [[x - w * 0.48, y - s * 0.66], [x + w * 0.48, y - s * 0.66]], { w: s * 0.05, ink, dry: 0.3, seed: seed + 'n', taper: [0.05, 0.05], blunt: 1, bleed: false });
        roof(c, x, y - s * 0.8, w * 0.68, s * 0.12, { ink, seed: seed + 'k', lift: 1.3 });
    }

    return {
        INK, PAPER, RED, RED_DEEP, tone, mix, hex, clamp, sstep,
        smooth, measure, stroke, cachedStroke, blobPts, fillPoly, dab, wash,
        paper, tooth, ridge, mountains, sun, seal,
        grain, tree, blossom, bloom, petal, crane, peak, foliage, pagoda, reed, halo,
        hill, roof, pavilion, torii, mistFoot,
    };
})();
