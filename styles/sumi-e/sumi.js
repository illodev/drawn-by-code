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
    const PAPER = '#eee8da';
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
                gr.addColorStop(0, dark ? 'rgba(120,96,60,0.045)' : 'rgba(255,252,240,0.07)');
                gr.addColorStop(1, 'rgba(0,0,0,0)');
                c.fillStyle = gr;
                c.fillRect(x - rad, y - rad, rad * 2, rad * 2);
            }
            // kozo fibres: long, thin, curly, slightly lighter or darker than the sheet
            c.lineCap = 'round';
            const nf = Math.round((box.w * box.h) / 900);
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
        const key = 'seal:' + text + size;
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
            const cols = chars.length > 2 ? 2 : 1, rows = Math.ceil(chars.length / cols);
            chars.forEach((ch, i) => {
                const col = cols - 1 - Math.floor(i / rows), row = i % rows;
                c.fillText(ch, (col - (cols - 1) / 2) * size * 0.42, (row - (rows - 1) / 2) * size * 0.42);
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

    return {
        INK, PAPER, RED, RED_DEEP, tone, mix, hex, clamp, sstep,
        smooth, measure, stroke, cachedStroke, blobPts, fillPoly, dab, wash,
        paper, tooth, ridge, mountains, sun, seal,
    };
})();
