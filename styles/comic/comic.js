// Comic book style kit: brush-ink outlines with variable width and tapered ends, flat print
// colours on newsprint, Ben-Day halftone, panels with inked borders, balloons, sound effects
// with bursts, speed lines. Global: Comic. Depends on engine/core.js.
//
// Everything is deterministic: a line's wobble comes from its seed, never from the frame, so
// the ink never boils. Life comes from the drawings changing on twos (Comic.onTwos).
const Comic = (() => {
    // A limited print palette. Ink is a warm near-black, never pure black; the page is
    // newsprint, never pure white.
    const COL = {
        paper: '#f4ecd6', // the page (newsprint)
        paperDeep: '#e7d9b8', // mottling, aged edges
        white: '#fffaf0', // balloons, highlights, gloss
        ink: '#1c1a20',
        red: '#dd3b2d',
        yellow: '#f6c536',
        blue: '#2e67ae',
        sky: '#8fc9e3',
        green: '#4f9d63',
        orange: '#f28a2e',
        pink: '#ee8fa6',
    };
    const FONT_SFX = 'Bangers', FONT_LETTER = 'Comic Neue';

    // Drawings change 12 times a second (animating on twos). onTwos(t) holds t on the drawing.
    const drawing = (t, t0 = 0) => Math.floor((t - t0) * 12 + 1e-6);
    const onTwos = (t, t0 = 0) => t0 + drawing(t, t0) / 12;

    // Output pixels per logical unit under the current transform (for crisp caches).
    const pxScale = (g) => {
        const m = g.getTransform();
        return Math.max(0.05, Math.hypot(m.a, m.b));
    };

    // --- paths ---------------------------------------------------------------------------
    // Catmull-Rom through the points (centripetal-ish, no overshoot at corners), densified.
    function curve(pts, closed = false, seg = 10) {
        const n = pts.length;
        if (n < 3) return pts.slice();
        const at = (i) => (closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))]);
        const out = [];
        const last = closed ? n : n - 1;
        for (let i = 0; i < last; i++) {
            const p0 = at(i - 1), p1 = at(i), p2 = at(i + 1), p3 = at(i + 2);
            const d = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]);
            const m = Math.max(2, Math.min(seg * 3, Math.ceil(d / 6)));
            for (let k = 0; k < m; k++) {
                const u = k / m, u2 = u * u, u3 = u2 * u;
                const b0 = -0.5 * u3 + u2 - 0.5 * u, b1 = 1.5 * u3 - 2.5 * u2 + 1, b2 = -1.5 * u3 + 2 * u2 + 0.5 * u, b3 = 0.5 * u3 - 0.5 * u2;
                out.push([p0[0] * b0 + p1[0] * b1 + p2[0] * b2 + p3[0] * b3, p0[1] * b0 + p1[1] * b1 + p2[1] * b2 + p3[1] * b3]);
            }
        }
        if (!closed) out.push(pts[n - 1]);
        return out;
    }

    function resample(pts, step) {
        const out = [pts[0]];
        let carry = 0;
        for (let i = 1; i < pts.length; i++) {
            const [ax, ay] = pts[i - 1], [bx, by] = pts[i];
            const d = Math.hypot(bx - ax, by - ay);
            if (d < 1e-9) continue;
            let s = step - carry;
            while (s <= d) {
                out.push([ax + ((bx - ax) * s) / d, ay + ((by - ay) * s) / d]);
                s += step;
            }
            carry = d - (s - step);
        }
        const L = pts[pts.length - 1];
        const E = out[out.length - 1];
        if (Math.hypot(L[0] - E[0], L[1] - E[1]) > step * 0.25) out.push(L);
        return out;
    }

    const area = (pts) => {
        let a = 0;
        for (let i = 0; i < pts.length; i++) {
            const [x0, y0] = pts[i], [x1, y1] = pts[(i + 1) % pts.length];
            a += x0 * y1 - x1 * y0;
        }
        return a / 2;
    };

    const pathOf = (pts, closed = true) => {
        const p = new Path2D();
        p.moveTo(pts[0][0], pts[0][1]);
        for (let i = 1; i < pts.length; i++) p.lineTo(pts[i][0], pts[i][1]);
        if (closed) p.closePath();
        return p;
    };

    // Shapes as point lists.
    const ellipse = (cx, cy, rx, ry, n = 48, rot = 0) =>
        Array.from({ length: n }, (_, i) => {
            const a = (i / n) * Math.PI * 2, x = Math.cos(a) * rx, y = Math.sin(a) * ry;
            return [cx + x * Math.cos(rot) - y * Math.sin(rot), cy + x * Math.sin(rot) + y * Math.cos(rot)];
        });
    const rect = (x, y, w, h) => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];

    // The outline of a union of circles [[x, y, r], …] seen from (cx, cy): for each angle, the
    // farthest boundary point along the ray. Right for star-shaped blobs (clouds, bushes).
    function lobes(circles, cx, cy, n = 180) {
        const out = [];
        for (let i = 0; i < n; i++) {
            const a = (i / n) * Math.PI * 2, dx = Math.cos(a), dy = Math.sin(a);
            let best = 0;
            for (const [x, y, r] of circles) {
                const ox = cx - x, oy = cy - y;
                const b = ox * dx + oy * dy, c = ox * ox + oy * oy - r * r, disc = b * b - c;
                if (disc < 0) continue;
                const s = -b + Math.sqrt(disc);
                if (s > best) best = s;
            }
            out.push([cx + dx * best, cy + dy * best]);
        }
        return out;
    }

    // --- ink -------------------------------------------------------------------------------
    /**
     * A brush-ink line: filled, with a width that swells and thins along it and tapers at the
     * ends. pts: the centreline (smoothed unless smooth: false). Options:
     *   w        mean width in logical units
     *   taper    [start, end] fraction of the length that tapers to a point (open lines)
     *   wobble   0..1 width variation along the line (seeded, stable)
     *   light    [dx, dy] direction the light goes to: on closed shapes the side facing away
     *            from the light gets the heavier line (classic inking); lightAmt its strength
     *   closed, smooth, color, seed
     */
    function ink(g, pts, o = {}) {
        const { w = 6, taper = [0.25, 0.25], wobble = 0.22, seed = 'ink', color = COL.ink, closed = false, smooth = true, light = null, lightAmt = 0.5, minW = 0.12 } = o;
        if (!pts || pts.length < 2) return;
        let p = smooth && pts.length > 2 ? curve(pts, closed) : pts.slice();
        if (closed) p = [...p, p[0]];
        const step = Math.max(0.35, Math.min(w * 0.3, 2.5 / pxScale(g) + w * 0.1));
        p = resample(p, step);
        if (p.length < 2) return;
        const s = [0];
        for (let i = 1; i < p.length; i++) s.push(s[i - 1] + Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]));
        const L = s[s.length - 1] || 1;
        const orient = closed ? Math.sign(area(p)) || 1 : 1;
        const [lx, ly] = light ? [light[0] / Math.hypot(light[0], light[1]), light[1] / Math.hypot(light[0], light[1])] : [0, 0];
        const nrm = [], wid = [];
        for (let i = 0; i < p.length; i++) {
            const a = p[Math.max(0, i - 1)], b = p[Math.min(p.length - 1, i + 1)];
            let tx = b[0] - a[0], ty = b[1] - a[1];
            const tl = Math.hypot(tx, ty) || 1;
            tx /= tl;
            ty /= tl;
            nrm.push([-ty, tx]);
            let f = 1;
            if (!closed) {
                const t0 = taper[0] > 0 ? Math.min(1, s[i] / (taper[0] * L)) : 1;
                const t1 = taper[1] > 0 ? Math.min(1, (L - s[i]) / (taper[1] * L)) : 1;
                f = Math.sqrt(Math.max(0, Math.min(t0, t1)));
            }
            let v = 1 + wobble * Motion.noise1(seed, s[i] / Math.max(18, w * 5));
            if (light) {
                // outward normal of the closed outline: the left normal, flipped by winding
                const ox = -ty * -orient, oy = tx * -orient;
                v *= 1 + lightAmt * (ox * lx + oy * ly);
            }
            wid.push(Math.max(minW * w * (closed ? 1 : f > 0.02 ? 1 : 0), w * f * v));
        }
        const path = new Path2D();
        let ccw = null;
        for (let i = 0; i < p.length - 1; i++) {
            const [ax, ay] = p[i], [bx, by] = p[i + 1];
            const ra = wid[i] / 2, rb = wid[i + 1] / 2, na = nrm[i], nb = nrm[i + 1];
            const q = [
                [ax + na[0] * ra, ay + na[1] * ra], [bx + nb[0] * rb, by + nb[1] * rb],
                [bx - nb[0] * rb, by - nb[1] * rb], [ax - na[0] * ra, ay - na[1] * ra],
            ];
            const qa = area(q);
            if (ccw === null && Math.abs(qa) > 1e-6) ccw = qa < 0;
            const qq = (qa < 0) === (ccw ?? false) ? q : q.slice().reverse();
            path.moveTo(qq[0][0], qq[0][1]);
            for (let k = 1; k < 4; k++) path.lineTo(qq[k][0], qq[k][1]);
            path.closePath();
        }
        for (let i = 0; i < p.length; i++) {
            const r = wid[i] / 2;
            if (r < 0.05) continue;
            path.moveTo(p[i][0] + r, p[i][1]);
            path.arc(p[i][0], p[i][1], r, 0, Math.PI * 2, ccw ?? false);
        }
        g.fillStyle = color;
        g.fill(path, 'nonzero');
    }

    /**
     * A filled shape with its inked outline. pts: the outline (smoothed unless smooth: false).
     * o.fill: colour; o.shade(g, path) paints inside the shape (clipped) before the outline,
     * for halftone or cel shading; o.w, o.light, o.seed as in ink(). Returns the fill path.
     */
    function shape(g, pts, o = {}) {
        const { fill = COL.white, smooth = true, w = 5, light = [0.55, 0.85], seed = 'shape', shade = null, inkColor = COL.ink, lightAmt = 0.55 } = o;
        const outline = smooth ? curve(pts, true) : pts;
        const path = pathOf(outline);
        if (fill) {
            g.fillStyle = fill;
            g.fill(path);
        }
        if (shade) {
            g.save();
            g.clip(path);
            shade(g, path);
            g.restore();
        }
        if (w > 0) ink(g, outline, { w, closed: true, smooth: false, light, lightAmt, seed, color: inkColor });
        return path;
    }

    // --- halftone --------------------------------------------------------------------------
    // Ben-Day dots: a staggered (45°) grid of round dots of one colour. The tile is built at
    // output resolution and cached per colour, spacing, radius and scale.
    const tiles = new Map();
    function dotTile(g, color, spacing, r) {
        const k = pxScale(g);
        const key = `${color}|${spacing}|${r}|${k.toFixed(3)}`;
        let tile = tiles.get(key);
        if (!tile) {
            const s = Math.max(2, Math.round(spacing * k));
            const c = document.createElement('canvas');
            c.width = c.height = s;
            const x = c.getContext('2d');
            x.fillStyle = color;
            const rr = (r * s) / spacing;
            for (const [cx, cy] of [[s / 2, s / 2], [0, 0], [s, 0], [0, s], [s, s]]) {
                x.beginPath();
                x.arc(cx, cy, rr, 0, Math.PI * 2);
                x.fill();
            }
            tile = { canvas: c, s };
            tiles.set(key, tile);
        }
        return tile;
    }

    /**
     * Fills `path` (a Path2D) with Ben-Day dots. o: color, spacing (9), r (dot radius), alpha,
     * anchor [x, y]: where the dot grid is pinned in the current coordinates (pin it to a
     * moving piece's origin so its dots travel with it; the default pins it to the page).
     */
    function dots(g, path, o = {}) {
        const { color = COL.ink, spacing = 9, r = 2, alpha = 1, anchor = [0, 0] } = o;
        const tile = dotTile(g, color, spacing, r);
        const pat = g.createPattern(tile.canvas, 'repeat');
        const f = spacing / tile.s;
        pat.setTransform(new DOMMatrix([f, 0, 0, f, anchor[0], anchor[1]]));
        g.save();
        g.globalAlpha *= alpha;
        g.fillStyle = pat;
        g.fill(path);
        g.restore();
    }

    /**
     * Graded halftone: dots whose radius follows a ramp from r0 to r1 along `dir` across the
     * box, clipped to `path`. For shading round forms and for skies. Drawn dot by dot (cache
     * big static areas in a sprite). o: color, spacing, r0, r1, dir [dx, dy], box {x,y,w,h}.
     */
    function halftone(g, path, o = {}) {
        const { color = COL.ink, spacing = 10, r0 = 0.4, r1 = 3.4, dir = [0.6, 0.8], box, ease = (x) => x } = o;
        const b = box;
        const dl = Math.hypot(dir[0], dir[1]) || 1, ux = dir[0] / dl, uy = dir[1] / dl;
        // projection range of the box on dir
        const cs = [[b.x, b.y], [b.x + b.w, b.y], [b.x, b.y + b.h], [b.x + b.w, b.y + b.h]].map(([x, y]) => x * ux + y * uy);
        const pmin = Math.min(...cs), pmax = Math.max(...cs);
        g.save();
        g.clip(path);
        g.fillStyle = color;
        const dots = new Path2D();
        const h = spacing, rowH = h / 2;
        for (let row = 0, y = b.y - h; y <= b.y + b.h + h; row++, y += rowH) {
            const off = row % 2 ? h / 2 : 0;
            for (let x = b.x - h + off; x <= b.x + b.w + h; x += h) {
                const u = Ease.clamp((x * ux + y * uy - pmin) / (pmax - pmin || 1));
                const r = r0 + (r1 - r0) * ease(u);
                if (r < 0.15) continue;
                dots.moveTo(x + r, y);
                dots.arc(x, y, r, 0, Math.PI * 2);
            }
        }
        g.fill(dots);
        g.restore();
    }

    // --- page ------------------------------------------------------------------------------
    /** Newsprint page: warm off-white with soft mottling, fibres and specks (cached). */
    function paper(g, env, o = {}) {
        const { key = 'page', color = COL.paper, bleed = 200 } = o;
        const box = { x: -bleed, y: -bleed, w: env.W + bleed * 2, h: env.H + bleed * 2 };
        Motion.sprite('comic:paper:' + key + color, box, env.k, (c) => {
            c.fillStyle = color;
            c.fillRect(box.x, box.y, box.w, box.h);
            const r = Motion.rng('comic-paper:' + key);
            c.globalAlpha = 0.05;
            c.fillStyle = COL.paperDeep;
            for (let i = 0; i < 70; i++) {
                c.beginPath();
                c.ellipse(box.x + r() * box.w, box.y + r() * box.h, 40 + r() * 160, 30 + r() * 110, r() * 3, 0, Math.PI * 2);
                c.fill();
            }
            c.globalAlpha = 0.22;
            c.strokeStyle = '#b9a67f';
            c.lineWidth = 0.6;
            for (let i = 0; i < (box.w * box.h) / 900; i++) {
                const x = box.x + r() * box.w, y = box.y + r() * box.h, a = r() * Math.PI, l = 2 + r() * 6;
                c.beginPath();
                c.moveTo(x, y);
                c.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l);
                c.stroke();
            }
            c.globalAlpha = 0.18;
            c.fillStyle = '#8f7d5c';
            for (let i = 0; i < (box.w * box.h) / 2500; i++) c.fillRect(box.x + r() * box.w, box.y + r() * box.h, 0.9, 0.9);
            c.globalAlpha = 1;
        }).draw(g);
    }

    // Print grain over everything, in pixels (call from the scene's post).
    let grainTile = null;
    function grainPost(ctx, env, amount = 0.07) {
        if (!grainTile) {
            grainTile = document.createElement('canvas');
            grainTile.width = grainTile.height = 256;
            const x = grainTile.getContext('2d');
            const img = x.createImageData(256, 256);
            const r = Motion.rng('comic-grain');
            for (let i = 0; i < img.data.length; i += 4) {
                const v = 150 + r() * 105;
                img.data[i] = v;
                img.data[i + 1] = v - 4;
                img.data[i + 2] = v - 14;
                img.data[i + 3] = 255;
            }
            x.putImageData(img, 0, 0);
        }
        ctx.save();
        ctx.globalCompositeOperation = 'multiply';
        ctx.globalAlpha = amount;
        ctx.fillStyle = ctx.createPattern(grainTile, 'repeat');
        ctx.fillRect(0, 0, env.px[0], env.px[1]);
        ctx.restore();
    }

    // --- panels ----------------------------------------------------------------------------
    /**
     * A panel: paints `drawFn(g)` clipped to the rectangle r {x, y, w, h}, then the inked
     * border (ruled, with a slight brush swell). o.border: width; o.bg: fill under the art.
     */
    function panel(g, r, drawFn, o = {}) {
        const { border = 7, bg = COL.white } = o;
        const pts = rect(r.x, r.y, r.w, r.h);
        const path = pathOf(pts);
        g.save();
        g.clip(path);
        if (bg) {
            g.fillStyle = bg;
            g.fill(path);
        }
        drawFn(g);
        g.restore();
        // ruled border: a frame of even width (outer minus inner rectangle), square corners
        const e = border / 2;
        const frame = new Path2D();
        frame.rect(r.x - e, r.y - e, r.w + border, r.h + border);
        frame.rect(r.x + e, r.y + e, r.w - border, r.h - border);
        g.fillStyle = COL.ink;
        g.fill(frame, 'evenodd');
        return path;
    }

    /**
     * Pop-in on the beat: 0 before `at`, then an overshoot to 1 over `dur`, on twos.
     * Returns { on, s, u } where s is a scale (from `from` to 1 with overshoot).
     */
    function enter(t, at, dur = 0.34, from = 0.82) {
        if (t < at) return { on: false, u: 0, s: from };
        const u = Ease.back(Ease.seg(onTwos(t, at), at, at + dur));
        return { on: true, u, s: from + (1 - from) * u };
    }

    // --- lettering -------------------------------------------------------------------------
    /** Balloon lettering: upper case, centred, lines split on '\n'. */
    function letter(g, text, x, y, o = {}) {
        const { size = 30, color = COL.ink, font = FONT_LETTER, weight = '700', lead = 1.12, align = 'center' } = o;
        g.save();
        g.fillStyle = color;
        g.font = `${weight} ${size}px "${font}"`;
        g.textAlign = align;
        g.textBaseline = 'middle';
        const lines = String(text).toUpperCase().split('\n');
        lines.forEach((l, i) => g.fillText(l, x, y + (i - (lines.length - 1) / 2) * size * lead));
        g.restore();
    }

    /**
     * A balloon. o: x, y (centre), rx, ry, tail [x, y] (where it points), kind 'speech' |
     * 'thought' | 'shout', text, size, seed, w (ink width). Speech: an oval with a curved
     * tail; thought: a cloud with bubbles trailing to the tail point; shout: a jagged burst.
     */
    function balloon(g, o) {
        const { x, y, rx, ry, tail, kind = 'speech', text = '', size = 30, seed = 'balloon', w = 4.5, fill = COL.white } = o;
        let outline;
        if (kind === 'thought') {
            const r = Motion.rng(seed);
            const n = 9, circles = [];
            for (let i = 0; i < n; i++) {
                const a = (i / n) * Math.PI * 2 + r() * 0.2;
                circles.push([x + Math.cos(a) * rx * 0.72, y + Math.sin(a) * ry * 0.7, Math.min(rx, ry) * (0.42 + r() * 0.1)]);
            }
            circles.push([x, y, Math.min(rx, ry) * 0.8]);
            outline = lobes(circles, x, y, 200);
            if (tail) {
                const [tx, ty] = tail;
                for (let i = 0; i < 3; i++) {
                    const u = 0.35 + i * 0.25, cx = x + (tx - x) * u, cy = y + (ty - y) * u, cr = Math.min(rx, ry) * (0.18 - i * 0.045);
                    shape(g, ellipse(cx, cy, cr, cr * 0.9, 24), { fill, w: w * 0.8, seed: seed + ':b' + i, smooth: false });
                }
            }
        } else if (kind === 'shout') {
            outline = starPts(x, y, rx, ry, 16, 0.78, seed);
        } else {
            const base = ellipse(x, y, rx, ry, 72);
            if (tail) {
                // open a gap in the oval facing the tail and join two curves to the tip
                const [tx, ty] = tail;
                const a = Math.atan2((ty - y) / ry, (tx - x) / rx);
                const gap = 0.22;
                const pts = [];
                const n = 72;
                for (let i = 0; i <= n; i++) {
                    const ang = a + gap + ((Math.PI * 2 - gap * 2) * i) / n;
                    pts.push([x + Math.cos(ang) * rx, y + Math.sin(ang) * ry]);
                }
                const e0 = pts[pts.length - 1], e1 = pts[0];
                const mid = (p, q, u) => [p[0] + (q[0] - p[0]) * u, p[1] + (q[1] - p[1]) * u];
                // slightly curved tail: bend both sides the same way
                const bend = [-(ty - y) * 0.08, (tx - x) * 0.08];
                const c0 = mid(e0, [tx, ty], 0.5), c1 = mid([tx, ty], e1, 0.5);
                pts.push([c0[0] + bend[0], c0[1] + bend[1]], [tx, ty], [c1[0] + bend[0] * 0.6, c1[1] + bend[1] * 0.6]);
                outline = curve(pts, true, 6);
            } else outline = curve(base, true);
        }
        shape(g, outline, { fill, w, seed, smooth: false, lightAmt: 0.35 });
        if (text) letter(g, text, x, y + size * 0.05, { size });
    }

    // --- effects ---------------------------------------------------------------------------
    function starPts(x, y, rx, ry, n, inner, seed) {
        const r = Motion.rng(seed);
        const pts = [];
        for (let i = 0; i < n * 2; i++) {
            const a = (i / (n * 2)) * Math.PI * 2 + (r() - 0.5) * 0.12;
            const k = i % 2 ? inner * (0.85 + r() * 0.25) : 0.9 + r() * 0.22;
            pts.push([x + Math.cos(a) * rx * k, y + Math.sin(a) * ry * k]);
        }
        return pts;
    }

    /** An impact burst: a jagged star, filled and inked. */
    function burst(g, x, y, r, o = {}) {
        const { points = 12, inner = 0.62, fill = COL.yellow, seed = 'burst', w = 5, ry = r, shade = null } = o;
        return shape(g, starPts(x, y, r, ry, points, inner, seed), { fill, w, seed, smooth: false, shade });
    }

    /**
     * Speed (focus) lines: tapered ink wedges pointing at (cx, cy), from radius r0 out to r1.
     * o: n, seed, w (base width), color, gap (fraction of lines skipped), from/to angles.
     */
    function speedLines(g, cx, cy, o = {}) {
        const { r0 = 180, r1 = 900, n = 60, seed = 'speed', w = 7, color = COL.ink, a0 = 0, a1 = Math.PI * 2 } = o;
        const r = Motion.rng(seed);
        g.fillStyle = color;
        const path = new Path2D();
        for (let i = 0; i < n; i++) {
            const a = a0 + ((a1 - a0) * (i + r() * 0.8)) / n;
            const s = r0 * (0.85 + r() * 0.5), e = r1 * (0.9 + r() * 0.2), ww = w * (0.4 + r() * 1.1);
            const px = -Math.sin(a), py = Math.cos(a);
            path.moveTo(cx + Math.cos(a) * s, cy + Math.sin(a) * s);
            path.lineTo(cx + Math.cos(a) * e + px * ww, cy + Math.sin(a) * e + py * ww);
            path.lineTo(cx + Math.cos(a) * e - px * ww, cy + Math.sin(a) * e - py * ww);
            path.closePath();
        }
        g.fill(path);
    }

    /**
     * Motion lines: short parallel tapered strokes trailing behind something moving along
     * (dx, dy), spread across `span` around (x, y).
     */
    function motionLines(g, x, y, dx, dy, o = {}) {
        const { n = 4, span = 80, len = 70, w = 4, seed = 'motion', color = COL.ink } = o;
        const r = Motion.rng(seed);
        const l = Math.hypot(dx, dy) || 1, ux = dx / l, uy = dy / l, px = -uy, py = ux;
        for (let i = 0; i < n; i++) {
            const off = (i / Math.max(1, n - 1) - 0.5) * span + (r() - 0.5) * span * 0.2;
            const ll = len * (0.6 + r() * 0.6), back = r() * len * 0.3;
            const sx = x + px * off - ux * back, sy = y + py * off - uy * back;
            ink(g, [[sx, sy], [sx - ux * ll, sy - uy * ll]], { w: w * (0.7 + r() * 0.5), taper: [0.05, 0.9], seed: seed + i, smooth: false, color });
        }
    }

    /** Sound effect lettering: extruded, outlined, each letter tilted and growing. */
    function sfx(g, text, x, y, o = {}) {
        const { size = 110, rot = -0.12, fill = COL.yellow, shade = COL.red, outline = COL.ink, depth = 0.09, grow = 0.18, font = FONT_SFX, seed = 'sfx', stroke = 0.16 } = o;
        const r = Motion.rng(seed);
        g.save();
        g.translate(x, y);
        g.rotate(rot);
        const chars = [...text];
        const sizes = chars.map((_, i) => size * (1 - grow / 2 + (grow * i) / Math.max(1, chars.length - 1)));
        const widths = chars.map((c, i) => {
            g.font = `${sizes[i]}px "${font}"`;
            return g.measureText(c).width * 0.96;
        });
        const total = widths.reduce((a, b) => a + b, 0);
        let cx = -total / 2;
        const letters = chars.map((c, i) => {
            const L = { c, x: cx + widths[i] / 2, y: (r() - 0.5) * size * 0.1, s: sizes[i], a: (r() - 0.5) * 0.14 };
            cx += widths[i];
            return L;
        });
        const each = (fn) =>
            letters.forEach((L) => {
                g.save();
                g.translate(L.x, L.y);
                g.rotate(L.a);
                g.font = `${L.s}px "${font}"`;
                g.textAlign = 'center';
                g.textBaseline = 'middle';
                fn(L);
                g.restore();
            });
        g.lineJoin = 'round';
        // extrusion down-right, then the outline around letter + extrusion, then the face
        const steps = 8, dx = size * depth, dy = size * depth * 0.9;
        each((L) => {
            g.lineWidth = L.s * stroke;
            g.strokeStyle = outline;
            for (let k = steps; k >= 0; k--) g.strokeText(L.c, (dx * k) / steps, (dy * k) / steps);
            g.fillStyle = shade;
            for (let k = steps; k >= 1; k--) g.fillText(L.c, (dx * k) / steps, (dy * k) / steps);
        });
        each((L) => {
            g.lineWidth = L.s * stroke * 0.55;
            g.strokeStyle = outline;
            g.strokeText(L.c, 0, 0);
            g.fillStyle = fill;
            g.fillText(L.c, 0, 0);
        });
        g.restore();
    }

    // --- cartoon hands ---------------------------------------------------------------------
    /**
     * A cartoon hand (thumb + three fingers), one skin, inked. Drawn in its own frame: the
     * wrist at (0, 0) and the hand pointing up (−y); the caller translates/rotates/scales.
     * size = palm width. Poses (what the camera sees):
     *   'backGrip'  the back of the hand with three fingers bent over an edge that runs
     *               across the frame at y = −size*0.55 (holding a sheet from the far side:
     *               fingers' backs toward the camera, thumb hidden behind the sheet)
     *   'thumbFront' the owner's view of a sheet held at its bottom edge (y = 0): the thumb
     *               on its front, the mound of the hand under the edge, the fingers behind
     *   'open'      open hand, back toward the camera, fingers spread (reaching)
     * side: 'right' | 'left' (the owner's hand). Drawn as a right hand; 'left' mirrors it.
     * Handedness: for a right hand with the palm facing N and the fingers pointing F, the
     * thumb is on F × N (skill hands). Back to the camera, fingers up: thumb on the left.
     */
    function hand(g, pose, size, o = {}) {
        const { side = 'right', fill = COL.orange, w = 6, seed = 'hand', nails = false } = o;
        const S = size;
        // a digit as a capsule from base (x0, y0) to tip (x1, y1), radius r
        const capsule = (x0, y0, x1, y1, r, n = 14) => {
            const a = Math.atan2(y1 - y0, x1 - x0), pts = [];
            for (let i = 0; i <= n; i++) {
                const b = a - Math.PI / 2 + (Math.PI * i) / n;
                pts.push([x1 + Math.cos(b) * r, y1 + Math.sin(b) * r]);
            }
            for (let i = 0; i <= n; i++) {
                const b = a + Math.PI / 2 + (Math.PI * i) / n;
                pts.push([x0 + Math.cos(b) * r, y0 + Math.sin(b) * r]);
            }
            return pts;
        };
        const skin = [], lines = [], nailsAt = [];
        const wrist = [[-S * 0.3, -S * 0.2], [S * 0.3, -S * 0.2], [S * 0.27, S * 0.3], [-S * 0.27, S * 0.3]];
        if (pose === 'backGrip') {
            // back of a right hand below an edge at y = −0.62 S; three fingers bent over it,
            // their backs toward the camera; the thumb is behind the held sheet (hidden)
            skin.push(wrist, capsule(0, -S * 0.3, 0, -S * 0.36, S * 0.47, 20));
            const fr = S * 0.15;
            [[-0.3, -0.98], [0, -1.06], [0.3, -0.96]].forEach(([fx, tip]) => {
                skin.push(capsule(fx * S, -S * 0.5, fx * S * 1.05, tip * S, fr));
                // knuckle crease where the finger bends over the edge
                lines.push([[fx * S - fr * 0.6, -S * 0.7], [fx * S, -S * 0.73], [fx * S + fr * 0.6, -S * 0.7]]);
                nailsAt.push([fx * S * 1.05, tip * S + fr * 0.55, fr * 0.55]);
            });
            // lines between the fingers pressed together
            [-0.15, 0.15].forEach((fx) => lines.push([[fx * S, -S * 0.66], [fx * S, -S * 0.9]]));
        } else if (pose === 'thumbFront') {
            // seen from its owner's eyes: the thumb lies on the front of what is held (its edge
            // at y = 0), rising from the mound of the hand that shows under the edge
            skin.push(ellipse(S * 0.04, S * 0.3, S * 0.56, S * 0.36, 36));
            skin.push(capsule(S * 0.1, S * 0.08, -S * 0.26, -S * 0.3, S * 0.19));
            // the curled fingers under the edge: the lines between them
            [-0.26, 0.02, 0.3].forEach((fx) => lines.push([[fx * S, S * 0.42], [fx * S + S * 0.03, S * 0.6]]));
            nailsAt.push([-S * 0.22, -S * 0.24, S * 0.1]);
        } else {
            // open, back to the camera, fingers up and a little spread; a right hand seen from
            // its back with the fingers up has the thumb on the image's left (F × N = −x)
            skin.push(wrist, capsule(0, -S * 0.34, 0, -S * 0.42, S * 0.46, 20));
            const fr = S * 0.14;
            [[-0.27, -1.12, -0.07], [0, -1.2, 0], [0.27, -1.1, 0.07]].forEach(([fx, tip, sp]) => {
                skin.push(capsule(fx * S, -S * 0.62, (fx + sp) * S, tip * S, fr));
            });
            skin.push(capsule(-S * 0.3, -S * 0.3, -S * 0.72, -S * 0.72, S * 0.15));
        }
        g.save();
        if (side === 'left') g.scale(-1, 1);
        // one skin: every piece inked first, then every fill on top, so only the silhouette
        // of the union keeps its line (half the ink width shows outside)
        for (let i = 0; i < skin.length; i++) ink(g, skin[i], { w: w * 2, closed: true, smooth: false, seed: seed + i, light: [0.5, 0.85], lightAmt: 0.35 });
        g.fillStyle = fill;
        for (const p of skin) g.fill(pathOf(p));
        for (const l of lines) ink(g, l, { w: w * 0.7, taper: [0.35, 0.35], seed: seed + 'l', smooth: l.length > 2 });
        if (nails)
            for (const [nx, ny, nr] of nailsAt) {
                g.fillStyle = 'rgba(255,250,240,0.55)';
                g.beginPath();
                g.ellipse(nx, ny, nr * 0.8, nr, 0, 0, Math.PI * 2);
                g.fill();
            }
        g.restore();
    }

    return {
        COL, FONT_SFX, FONT_LETTER, drawing, onTwos, pxScale,
        curve, resample, area, pathOf, ellipse, rect, lobes, starPts,
        ink, shape, dots, halftone, paper, grainPost, panel, enter, letter, balloon, burst, speedLines, motionLines, sfx, hand,
    };
})();
