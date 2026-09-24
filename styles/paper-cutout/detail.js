// Detail pieces for the paper-cutout style: the things that separate a finished film from an
// animatic. Textures that carry information (knit, rib, newsprint, wood grain, hair strands),
// creases, organic shapes, and hands with thumbs. Global: PaperDetail.
// Depends on engine/core.js and paper.js. Everything is deterministic (seeded).
//
// Shapes: spline (Catmull-Rom), cspline (centripetal: no overshoot at corners), taper (a
// strip with widths per control point: tentacles, stems, tails), curl (pose variation of a
// centreline). Printed papers: knit, rib, newsprint, wordBars, cursive, sheetMusic, mapPaper
// (rings + wobblyLine), woodGrain, strands. Marks: markerPath (a marker line as a chain of
// strokes, revealable by arc length), crease, punch (a hole with a torn rim). Hands: hand.
//
// Rule of thumb (see .claude/skills/style-paper-cutout/SKILL.md → Detail):
// every body part is its own piece of paper; hands are never circles; fabric, paper and wood
// show what they are made of; paper that moves bends and folds in perspective.
const PaperDetail = (() => {
    const P = Paper;

    // --- colour helpers -------------------------------------------------------------------
    // Returns hex (not hsla) so the result can be a cutout colour: Paper.marker parses hex.
    function shade(hex, dl, ds = 0) {
        const [h, s0, l0] = P.hexToHsl(hex);
        const s = Math.max(0, Math.min(100, s0 + ds)) / 100, l = Math.max(0, Math.min(100, l0 + dl)) / 100;
        const k = (n) => (n + h / 30) % 12, a = s * Math.min(l, 1 - l);
        const f = (n) => Math.round(255 * (l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1))));
        return '#' + [f(0), f(8), f(4)].map((v) => v.toString(16).padStart(2, '0')).join('');
    }

    // --- organic shapes ---------------------------------------------------------------------
    // Closed Catmull-Rom spline through control points: faces, hair, clothes, anything soft.
    function spline(pts, n = 10, closed = true) {
        const out = [], m = pts.length;
        const get = (i) => (closed ? pts[((i % m) + m) % m] : pts[Math.max(0, Math.min(m - 1, i))]);
        const last = closed ? m : m - 1;
        for (let i = 0; i < last; i++) {
            const p0 = get(i - 1), p1 = get(i), p2 = get(i + 1), p3 = get(i + 2);
            for (let k = 0; k < n; k++) {
                const t = k / n, t2 = t * t, t3 = t2 * t;
                out.push([0, 1].map((a) => 0.5 * (2 * p1[a] + (-p0[a] + p2[a]) * t + (2 * p0[a] - 5 * p1[a] + 4 * p2[a] - p3[a]) * t2 + (-p0[a] + 3 * p1[a] - 3 * p2[a] + p3[a]) * t3)));
            }
        }
        if (!closed) out.push(pts[m - 1]);
        return out;
    }

    // --- textures (draw inside a cutout's `inner(c, box)`) -------------------------------
    // Knitted fabric: rows of small V stitches, a touch darker and lighter than the base.
    function knit(c, box, color, o = {}) {
        const s = o.size ?? 9, r = Motion.rng((o.seed ?? 'knit') + color);
        const dark = shade(color, -11), light = shade(color, 7);
        c.lineWidth = s * 0.28;
        c.lineCap = 'round';
        for (let y = box.y; y < box.y + box.h + s; y += s * 0.9) {
            for (let x = box.x + ((y / s) % 2 ? s / 2 : 0); x < box.x + box.w + s; x += s) {
                c.strokeStyle = r() < 0.5 ? dark : light;
                c.globalAlpha = (o.alpha ?? 0.45) + r() * 0.25;
                c.beginPath();
                c.moveTo(x - s * 0.35, y - s * 0.3);
                c.lineTo(x, y + s * 0.2);
                c.lineTo(x + s * 0.35, y - s * 0.3);
                c.stroke();
            }
        }
        c.globalAlpha = 1;
    }
    // Ribbed band (cuffs, collars, hems): parallel darker lines along `angle`.
    function rib(c, box, color, o = {}) {
        const step = o.step ?? 6, a = o.angle ?? Math.PI / 2;
        c.save();
        c.strokeStyle = shade(color, -9);
        c.globalAlpha = 0.55;
        c.lineWidth = o.width ?? 2;
        const cx = box.x + box.w / 2, cy = box.y + box.h / 2, R = Math.hypot(box.w, box.h);
        c.translate(cx, cy);
        c.rotate(a);
        for (let x = -R; x < R; x += step) (c.beginPath(), c.moveTo(x, -R), c.lineTo(x, R), c.stroke());
        c.restore();
    }
    // Newsprint: columns of grey text lines, bold headlines and a hatched photo block. For
    // collage props (boats, clouds, book pages, bouquets): paper that says it is newspaper.
    function newsprint(c, box, o = {}) {
        const r = Motion.rng(o.seed ?? 'news');
        const ink = o.ink ?? '#5d5953', cols = o.cols ?? Math.max(1, Math.round(box.w / 70));
        const cw = box.w / cols, lh = o.lineH ?? 5.5;
        c.save();
        for (let k = 0; k < cols; k++) {
            const x0 = box.x + k * cw + 3, w = cw - 6;
            let y = box.y + 4;
            while (y < box.y + box.h) {
                const roll = r();
                if (roll < 0.08) {
                    // headline: two thick bars
                    c.fillStyle = ink;
                    c.globalAlpha = 0.75;
                    c.fillRect(x0, y, w * (0.6 + r() * 0.4), lh * 1.3);
                    y += lh * 2.2;
                } else if (roll < 0.12) {
                    // photo: hatched grey block
                    const h = lh * (5 + r() * 5);
                    c.globalAlpha = 0.28;
                    c.fillStyle = ink;
                    c.fillRect(x0, y, w, h);
                    c.save();
                    c.beginPath();
                    c.rect(x0, y, w, h);
                    c.clip();
                    c.globalAlpha = 0.35;
                    c.strokeStyle = ink;
                    c.lineWidth = 0.8;
                    for (let hx = -h; hx < w; hx += 3) (c.beginPath(), c.moveTo(x0 + hx, y + h), c.lineTo(x0 + hx + h, y), c.stroke());
                    c.restore();
                    y += h + lh;
                } else {
                    c.fillStyle = ink;
                    c.globalAlpha = 0.33;
                    c.fillRect(x0, y, w * (r() < 0.15 ? 0.3 + r() * 0.5 : 0.92 + r() * 0.08), lh * 0.45);
                    y += lh;
                }
            }
        }
        c.restore();
    }
    // Handwriting that reads as writing at a glance: rows of cursive "words" made of arches
    // (m, n), taller loops (h, l), cups (u, v) and the odd descender. For letters, notebooks,
    // book pages, wrapping paper and the backgrounds of collage cards.
    // o: seed, lineH (row spacing), xh (x-height), hw (arch width), width, alpha, gap
    function cursive(c, box, color, o = {}) {
        const r = Motion.rng(o.seed ?? 'cursive'), lh = o.lineH ?? 30, xh = o.xh ?? 11, hw = o.hw ?? 5.5;
        c.save();
        c.strokeStyle = color;
        c.lineWidth = o.width ?? 1.4;
        c.lineCap = 'round';
        c.lineJoin = 'round';
        c.globalAlpha = o.alpha ?? 0.8;
        for (let y = box.y + lh * 0.8; y < box.y + box.h + xh; y += lh) {
            let x = box.x - r() * lh;
            while (x < box.x + box.w) {
                const n = 2 + Math.floor(r() * 6), by = y + (r() - 0.5) * 2;
                c.beginPath();
                c.moveTo(x, by);
                for (let k = 0; k < n; k++) {
                    const roll = r();
                    // arch, tall loop, cup or descender
                    const h = roll < 0.12 ? xh * (1.5 + r() * 0.35) : roll < 0.2 ? -xh * 0.8 : roll < 0.22 ? -xh * 1.3 : xh * (0.85 + r() * 0.25);
                    const w = hw * (0.8 + r() * 0.5);
                    c.bezierCurveTo(x, by - h * 1.33, x + w, by - h * 1.33, x + w, by);
                    x += w;
                }
                c.stroke();
                x += (o.gap ?? 10) + r() * 14;
            }
        }
        c.restore();
    }
    // Wood grain: long wavy darker lines with the odd knot.
    function woodGrain(c, box, color, o = {}) {
        const r = Motion.rng(o.seed ?? 'wood'), a = o.angle ?? 0;
        c.save();
        c.strokeStyle = shade(color, -9);
        c.lineCap = 'round';
        const cx = box.x + box.w / 2, cy = box.y + box.h / 2, R = Math.hypot(box.w, box.h) / 2;
        c.translate(cx, cy);
        c.rotate(a);
        for (let y = -R; y < R; y += 9 + r() * 14) {
            c.globalAlpha = 0.18 + r() * 0.22;
            c.lineWidth = 1 + r() * 2;
            const ph = r() * 6, amp = 2 + r() * 5;
            c.beginPath();
            for (let x = -R; x <= R; x += 12) c.lineTo(x, y + Math.sin(x * 0.012 + ph) * amp);
            c.stroke();
            if (r() < 0.12) {
                const kx = -R + r() * 2 * R;
                c.globalAlpha = 0.3;
                c.beginPath();
                c.ellipse(kx, y, 14 + r() * 10, 5 + r() * 3, 0, 0, Math.PI * 2);
                c.stroke();
            }
        }
        c.restore();
    }
    // Hair: directional brush strokes, darker and lighter, following `angle` (radians).
    function strands(c, box, color, o = {}) {
        const r = Motion.rng(o.seed ?? 'hair');
        const n = Math.round((box.w * box.h) / (o.density ?? 90));
        c.save();
        c.lineCap = 'round';
        for (let i = 0; i < n; i++) {
            const x = box.x + r() * box.w, y = box.y + r() * box.h, a = (o.angle ?? Math.PI / 2) + (r() - 0.5) * 0.3, l = 14 + r() * 30;
            c.strokeStyle = r() < 0.55 ? shade(color, 8) : shade(color, -4);
            c.globalAlpha = 0.25 + r() * 0.3;
            c.lineWidth = 1 + r() * 1.6;
            c.beginPath();
            c.moveTo(x, y);
            c.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l);
            c.stroke();
        }
        c.restore();
    }

    // --- creases and folds ------------------------------------------------------------------
    // A fold line: a thin shadow line with a highlight beside it.
    function crease(g, a, b, o = {}) {
        const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l;
        g.save();
        g.lineCap = 'round';
        g.strokeStyle = o.dark ?? 'rgba(80,70,60,0.45)';
        g.lineWidth = o.width ?? 1.6;
        g.beginPath();
        g.moveTo(a[0], a[1]);
        g.lineTo(b[0], b[1]);
        g.stroke();
        g.strokeStyle = o.light ?? 'rgba(255,255,255,0.7)';
        g.beginPath();
        g.moveTo(a[0] + nx * 1.8, a[1] + ny * 1.8);
        g.lineTo(b[0] + nx * 1.8, b[1] + ny * 1.8);
        g.stroke();
        g.restore();
    }

    // --- helpers promoted from the what-do-you-love replica (one object per file there) ---
    // Centripetal Catmull-Rom through control points: like PaperDetail.spline but it never
    // overshoots at a corner between a long and a short segment (cup rims, bands, tags).
    function cspline(pts, n = 8, closed = true) {
        const out = [], m = pts.length;
        const get = (i) => (closed ? pts[((i % m) + m) % m] : pts[Math.max(0, Math.min(m - 1, i))]);
        const last = closed ? m : m - 1;
        const lerp = (a, b, ta, tb, t) => { const k = tb - ta < 1e-6 ? 0 : (t - ta) / (tb - ta); return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k]; };
        for (let i = 0; i < last; i++) {
            let p0 = get(i - 1), p1 = get(i), p2 = get(i + 1), p3 = get(i + 2);
            if (!closed && i === 0) p0 = [2 * p1[0] - p2[0], 2 * p1[1] - p2[1]];
            if (!closed && i === last - 1) p3 = [2 * p2[0] - p1[0], 2 * p2[1] - p1[1]];
            const t0 = 0, t1 = t0 + Math.sqrt(Math.hypot(p1[0] - p0[0], p1[1] - p0[1])) + 1e-4;
            const t2 = t1 + Math.sqrt(Math.hypot(p2[0] - p1[0], p2[1] - p1[1])) + 1e-4, t3 = t2 + Math.sqrt(Math.hypot(p3[0] - p2[0], p3[1] - p2[1])) + 1e-4;
            for (let k = 0; k < n; k++) {
                const t = t1 + ((t2 - t1) * k) / n;
                const a1 = lerp(p0, p1, t0, t1, t), a2 = lerp(p1, p2, t1, t2, t), a3 = lerp(p2, p3, t2, t3, t);
                const b1 = lerp(a1, a2, t0, t2, t), b2 = lerp(a2, a3, t1, t3, t);
                out.push(lerp(b1, b2, t1, t2, t));
            }
        }
        if (!closed) out.push(pts[m - 1]);
        return out;
    }
    // Centreline (Catmull-Rom through ctrl) → evenly spaced points with a width per point
    // (widths given per control point, interpolated along the curve).
    function centre(ctrl, widths, n = 8) {
        const pts = spline(ctrl, n, false);
        const ws = pts.map((_, i) => {
            const u = Math.min(ctrl.length - 1, i / n), k = Math.floor(u), f = u - k;
            return widths[k] + ((widths[Math.min(k + 1, widths.length - 1)] ?? widths[k]) - widths[k]) * f;
        });
        return { pts, ws };
    }
    // Tapered strip along a centreline with round caps: tentacles, stems, tails.
    function taper(ctrl, widths, n = 8) {
        const { pts, ws } = centre(ctrl, widths, n);
        const m = pts.length, L = [], R = [], T = [];
        for (let i = 0; i < m; i++) {
            const a = pts[Math.max(0, i - 1)], b = pts[Math.min(m - 1, i + 1)];
            const d = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1, tx = (b[0] - a[0]) / d, ty = (b[1] - a[1]) / d;
            T.push([tx, ty]);
            L.push([pts[i][0] - ty * ws[i] / 2, pts[i][1] + tx * ws[i] / 2]);
            R.push([pts[i][0] + ty * ws[i] / 2, pts[i][1] - tx * ws[i] / 2]);
        }
        const cap = (p, t, w, dir) => Array.from({ length: 11 }, (_, k) => {
            const th = ((k + 1) / 12) * Math.PI, nx = -t[1] * dir, ny = t[0] * dir;
            return [p[0] + w * (Math.cos(th) * nx + Math.sin(th) * t[0] * dir), p[1] + w * (Math.cos(th) * ny + Math.sin(th) * t[1] * dir)];
        });
        return [...L, ...cap(pts[m - 1], T[m - 1], ws[m - 1] / 2, 1), ...R.reverse(), ...cap(pts[0], T[0], ws[0] / 2, -1)];
    }
    // Pose variation of a centreline: bends the turning angles after control point `from`
    // by factor k (k < 1 uncurls, k > 1 curls tighter), keeping segment lengths.
    function curl(ctrl, k, from = 1) {
        if (k === 1) return ctrl;
        const out = ctrl.slice(0, from + 1).map((p) => [...p]);
        let ang = Math.atan2(ctrl[from][1] - ctrl[from - 1][1], ctrl[from][0] - ctrl[from - 1][0]);
        for (let i = from + 1; i < ctrl.length; i++) {
            const a0 = Math.atan2(ctrl[i - 1][1] - ctrl[i - 2][1], ctrl[i - 1][0] - ctrl[i - 2][0]);
            const a1 = Math.atan2(ctrl[i][1] - ctrl[i - 1][1], ctrl[i][0] - ctrl[i - 1][0]);
            let da = a1 - a0;
            while (da > Math.PI) da -= 2 * Math.PI;
            while (da < -Math.PI) da += 2 * Math.PI;
            ang += da * k;
            const l = Math.hypot(ctrl[i][0] - ctrl[i - 1][0], ctrl[i][1] - ctrl[i - 1][1]), q = out[i - 1];
            out.push([q[0] + Math.cos(ang) * l, q[1] + Math.sin(ang) * l]);
        }
        return out;
    }
    // Topographic contour rings: wobbly closed loops around (cx, cy), radii [[rx, ry], …].
    function rings(c, cx, cy, radii, color, seed, o = {}) {
        const r = P.rng(seed);
        c.save();
        c.strokeStyle = color;
        c.lineWidth = o.width ?? 2;
        c.globalAlpha = o.alpha ?? 0.8;
        c.lineJoin = 'round';
        for (const [rx, ry] of radii) {
            const ph = r() * 6, amp = o.wobble ?? 0.12, ox = (r() - 0.5) * rx * 0.2, oy = (r() - 0.5) * ry * 0.2;
            const k1 = 2 + Math.floor(r() * 2), k2 = 4 + Math.floor(r() * 3), ph2 = r() * 6;
            const pts = Array.from({ length: 64 }, (_, i) => {
                const a = (i / 64) * Math.PI * 2, f = 1 + amp * Math.sin(a * k1 + ph) + amp * 0.5 * Math.sin(a * k2 + ph2);
                return [cx + ox + Math.cos(a) * rx * f, cy + oy + Math.sin(a) * ry * f];
            });
            P.tracePath(c, spline(pts, 3));
            c.stroke();
        }
        c.restore();
    }
    // Open wobbly line (rivers, stripes of scribble) through control points.
    function wobblyLine(c, pts, color, width, alpha = 1, dash = null) {
        c.save();
        c.strokeStyle = color;
        c.lineWidth = width;
        c.globalAlpha = alpha;
        c.lineCap = dash ? 'butt' : 'round';
        c.lineJoin = 'round';
        if (dash) c.setLineDash(dash);
        const s = pts.length > 2 ? spline(pts, 8, false) : pts;
        c.beginPath();
        s.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
        c.stroke();
        c.restore();
    }
    // A thick marker line drawn as a chain of overlapping strokes (the reference's spiral and
    // galaxy arms): each stroke is a translucent-edged band with a denser core, slightly off
    // centre, with squarish ends that leave small notches where two strokes meet. `upto`
    // reveals the path up to that arc length (the drawing grows along it). Deterministic.
    // o: w (total width), core (core/total), edge, color, seg [min, max] stroke length, seed,
    // upto, edgeAlpha, capStart/capEnd (round ends of the whole line).
    function markerPath(c, pts, o) {
        const r = P.rng(o.seed ?? 'mpath');
        // resample the polyline every 1.5 units with cumulative length
        const Q = [pts[0]], S = [0];
        for (let i = 1; i < pts.length; i++) {
            const [ax, ay] = pts[i - 1], [bx, by] = pts[i];
            const d = Math.hypot(bx - ax, by - ay), n = Math.max(1, Math.ceil(d / 1.5));
            for (let k = 1; k <= n; k++) {
                Q.push([ax + ((bx - ax) * k) / n, ay + ((by - ay) * k) / n]);
                S.push(S[S.length - 1] + d / n);
            }
        }
        const total = S[S.length - 1], upto = Math.min(total, o.upto ?? total);
        const at = (s) => {
            let lo = 0, hi = S.length - 1;
            while (hi - lo > 1) {
                const m = (lo + hi) >> 1;
                if (S[m] < s) lo = m;
                else hi = m;
            }
            const f = S[hi] > S[lo] ? (s - S[lo]) / (S[hi] - S[lo]) : 0;
            const p = [Q[lo][0] + (Q[hi][0] - Q[lo][0]) * f, Q[lo][1] + (Q[hi][1] - Q[lo][1]) * f];
            const dx = Q[hi][0] - Q[lo][0], dy = Q[hi][1] - Q[lo][1], dl = Math.hypot(dx, dy) || 1;
            return { p, t: [dx / dl, dy / dl] };
        };
        // one band from arc length a to b, half width hw, offset off along the normal
        const band = (a, b, hw, off, capA, capB) => {
            const L = [], R = [], n = Math.max(2, Math.ceil((b - a) / 2));
            for (let k = 0; k <= n; k++) {
                const { p, t } = at(a + ((b - a) * k) / n);
                const nx = -t[1], ny = t[0];
                L.push([p[0] + nx * (off + hw), p[1] + ny * (off + hw)]);
                R.push([p[0] + nx * (off - hw), p[1] + ny * (off - hw)]);
            }
            const cap = (s, dir, k) => {
                const { p, t } = at(s);
                const nx = -t[1], ny = t[0], out = [];
                for (let j = 1; j < 8; j++) {
                    const th = (j / 8) * Math.PI;
                    const cx = Math.cos(th), cy = Math.sin(th) * k * dir;
                    out.push([p[0] + nx * (off + hw * cx) + t[0] * hw * cy, p[1] + ny * (off + hw * cx) + t[1] * hw * cy]);
                }
                return out;
            };
            const endCap = cap(b, 1, capB), startCap = cap(a, -1, capA).reverse();
            return [...L, ...endCap, ...R.reverse(), ...startCap];
        };
        const fill = (poly, col, alpha) => {
            c.globalAlpha = alpha;
            c.fillStyle = col;
            c.beginPath();
            poly.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
            c.closePath();
            c.fill();
        };
        const w = o.w, seg = o.seg ?? [34, 56];
        // the strokes (all their random numbers drawn up front, so a partial reveal draws
        // exactly the same strokes as the finished line)
        const strokes = [];
        for (let s = 0, first = true; s < total - 0.5; first = false) {
            const len = seg[0] + r() * (seg[1] - seg[0]);
            strokes.push({ a: s, b: Math.min(total, s + len), first, off: (r() - 0.5) * w * 0.12, coreOff: (r() - 0.5) * w * 0.2, jw: 1 + (r() - 0.5) * 0.1, st0: 0.1 + r() * 0.2, st1: 0.55 + r() * 0.35, stOff: (r() - 0.5) * w * 0.25 });
            s += len;
        }
        const shown = strokes.filter((k) => k.a < upto - 0.5).map((k) => {
            const b = Math.min(k.b, upto), last = b >= upto - 1e-6;
            return { ...k, b, ca: k.first ? (o.capStart ?? 1) : 0.3, cb: last && upto >= total ? (o.capEnd ?? 1) : last ? 1 : 0.3 };
        });
        c.save();
        // translucent edges first, then the dense cores: overlaps darken, as marker ink does
        for (const k of shown) fill(band(Math.max(0, k.a - 1.2), k.b, (w / 2) * k.jw, k.off, k.ca, k.cb), o.edge, o.edgeAlpha ?? 0.9);
        for (const k of shown) fill(band(Math.max(0, k.a - 0.6), k.b, (w / 2) * (o.core ?? 0.62), k.off + k.coreOff, k.ca, k.cb), o.color, 0.9);
        // a lighter streak inside each core, like marker ink drying unevenly
        for (const k of shown) {
            const e = k.a + (k.b - k.a) * k.st1;
            if (e > k.a + (k.b - k.a) * k.st0 + 2) fill(band(k.a + (k.b - k.a) * k.st0, e, w * 0.06, k.off + k.coreOff + k.stOff, 1, 1), o.streak ?? o.edge, 0.3);
        }
        c.restore();
        return total;
    }
    // Cut a hole with a torn white paper rim (letter counters, rings, handles): the rim is
    // painted, then the hole is punched out with destination-out. Never fake a hole by filling
    // a ring polygon.
    function punch(c, pts, seed, rim = 2.6) {
        const res = P.resample(pts, 2);
        c.save();
        c.fillStyle = P.PAPER;
        P.tracePath(c, P.torn(res, seed + ':rim', rim, 0.5, 0.8));
        c.fill();
        c.globalCompositeOperation = 'destination-out';
        P.tracePath(c, P.torn(res, seed + ':hole', 0, 0, 0.6));
        c.fill();
        c.restore();
    }
    // Newspaper as it reads at a glance in collage: columns of word bars (not thin lines),
    // a few darker headline/photo blocks. o: cols (column width), rowH, barH, gap, ink,
    // light (second bar tone), blocks [[x0, y0, x1, y1]] in box coordinates, seed.
    function wordBars(c, box, o = {}) {
        const r = Motion.rng(o.seed ?? 'bars'), cw = o.cols ?? 80, rowH = o.rowH ?? 11, barH = o.barH ?? rowH * 0.42;
        const ink = o.ink ?? '#8b8780', light = o.light ?? shade(ink, 14), gap = o.gap ?? cw * 0.1;
        c.save();
        for (let x0 = box.x; x0 < box.x + box.w; x0 += cw) {
            for (let y = box.y + r() * rowH * 0.5; y < box.y + box.h; y += rowH) {
                let x = x0 + gap / 2;
                while (x < x0 + cw - gap / 2 - 3) {
                    const w = Math.min(x0 + cw - gap / 2 - x, cw * (0.1 + r() * 0.35));
                    c.fillStyle = r() < 0.35 ? light : ink;
                    c.globalAlpha = 0.85 + r() * 0.15;
                    if (w > 2) c.fillRect(x, y, w, barH);
                    x += w + rowH * 0.3 + r() * rowH * 0.3;
                }
            }
        }
        c.globalAlpha = 0.9;
        c.fillStyle = shade(ink, -18);
        for (const [a, b, e, f] of o.blocks ?? []) c.fillRect(box.x + a, box.y + b, e - a, f - b);
        c.restore();
    }
    // Sheet music printed on paper: five-line staves with note heads and stems.
    // o: ink, sp (line spacing), period (staff to staff), lineA, noteA, seed.
    function sheetMusic(c, box, o = {}) {
        const r = Motion.rng(o.seed ?? 'music'), sp = o.sp ?? 8.1, period = o.period ?? 74, k = sp / 8.1;
        c.save();
        c.lineCap = 'round';
        for (let y = box.y - period + r() * period; y < box.y + box.h + 30 * k; y += period) {
            c.strokeStyle = o.ink ?? '#3b3640';
            c.globalAlpha = o.lineA ?? 0.45;
            c.lineWidth = 0.85 * k;
            for (let i = 0; i < 5; i++) (c.beginPath(), c.moveTo(box.x - 4, y + i * sp), c.lineTo(box.x + box.w + 4, y + i * sp), c.stroke());
            for (let x = box.x + r() * 18 * k; x < box.x + box.w + 6; x += (17 + r() * 20) * k) {
                const hy = y + 4 * sp - Math.floor(r() * 8) * (sp / 2);
                c.globalAlpha = o.noteA ?? 0.7;
                c.fillStyle = o.ink ?? '#3b3640';
                c.beginPath();
                c.ellipse(x, hy, 5.3 * k, 3.7 * k, -0.38, 0, Math.PI * 2);
                c.fill();
                c.lineWidth = 0.9 * k;
                c.beginPath();
                c.moveTo(x + 4.7 * k, hy - 1.2 * k);
                c.lineTo(x + 4.7 * k, hy - (26 + r() * 4) * k);
                c.stroke();
            }
        }
        c.restore();
    }
    // A map printed on paper: contour rings round a couple of summits, a river and a red
    // dashed route. o: ink, river, route, seed, summits [[x, y, r]] in box coordinates.
    function mapPaper(c, box, o = {}) {
        const r = Motion.rng(o.seed ?? 'map');
        const summits = o.summits ?? [[box.w * (0.25 + r() * 0.2), box.h * (0.3 + r() * 0.3), Math.min(box.w, box.h) * 0.3], [box.w * (0.6 + r() * 0.2), box.h * (0.5 + r() * 0.3), Math.min(box.w, box.h) * 0.22]];
        for (const [i, [x, y, rad]] of summits.entries()) rings(c, box.x + x, box.y + y, [1, 0.78, 0.56, 0.34, 0.16].map((f) => [rad * f, rad * f * 0.8]), o.ink ?? 'rgba(255,255,255,0.35)', (o.seed ?? 'map') + i, { width: o.width ?? 1.6, alpha: 0.9 });
        const across = (y0) => Array.from({ length: 6 }, (_, i) => [box.x + (i / 5) * box.w, box.y + y0 + Math.sin(i * 1.7 + r() * 2) * box.h * 0.08]);
        wobblyLine(c, across(box.h * (0.3 + r() * 0.4)), o.river ?? '#5d8fc6', o.width ? o.width * 1.6 : 2.6, 0.8);
        wobblyLine(c, across(box.h * (0.2 + r() * 0.6)), o.route ?? '#c9454a', o.width ?? 1.6, 0.9, [6, 5]);
    }

    // --- hands --------------------------------------------------------------------------------
    // Mitten-style paper hands with a separate thumb (a piece of its own, like a real cutout).
    // Local coordinates: wrist at (0, 0), fingers pointing up (-y), size ≈ 1 palm = 60 units.
    // pose: 'open' (flat, thumb out), 'fist' (closed, thumb over the knuckles; holds a pencil),
    // 'pinch' (thumb pressed to the fingers; holds a paper edge), 'wave' (open, fingers apart).
    // o.skin, o.cuff (sleeve colour; draws a ribbed cuff at the wrist), o.mirror (left hand).
    function handShape(pose) {
        if (pose === 'fist') {
            return {
                palm: spline([[-24, 2], [-30, -26], [-26, -52], [-4, -62], [20, -58], [30, -34], [26, -4], [4, 6]], 8),
                thumb: spline([[-28, -26], [-12, -40], [10, -44], [16, -36], [0, -30], [-18, -18]], 6),
                knuckles: [[[-18, -54], [-14, -60]], [[-4, -58], [0, -63]], [[10, -56], [14, -60]]],
            };
        }
        if (pose === 'pinch') {
            return {
                palm: spline([[-24, 2], [-28, -30], [-22, -64], [0, -76], [20, -68], [28, -38], [24, -4], [2, 6]], 8),
                thumb: spline([[-24, -26], [-34, -44], [-30, -62], [-20, -64], [-14, -46], [-14, -28]], 6),
                knuckles: [],
            };
        }
        if (pose === 'wave') {
            return {
                palm: spline([[-24, 2], [-30, -36], [-26, -72], [-10, -84], [8, -84], [24, -74], [30, -38], [24, -4], [2, 6]], 8),
                thumb: spline([[-24, -20], [-48, -38], [-56, -54], [-44, -58], [-28, -44], [-16, -30]], 6),
                knuckles: [[[-6, -80], [-6, -64]], [[10, -80], [10, -64]]],
            };
        }
        return {
            palm: spline([[-24, 2], [-30, -36], [-24, -72], [0, -82], [22, -72], [30, -36], [24, -4], [2, 6]], 8),
            thumb: spline([[-24, -18], [-44, -36], [-50, -52], [-38, -56], [-24, -42], [-14, -28]], 6),
            knuckles: [],
        };
    }
    function hand(g, x, y, size, rot, pose = 'open', o = {}) {
        const skin = o.skin ?? '#edc4a7', key = 'dhand:' + pose + skin + (o.cuff ?? '');
        const sp = Motion.sprite(key, { x: -70, y: -100, w: 140, h: 160 }, (o.res ?? 3), (c) => {
            const sh = handShape(pose);
            if (o.cuff) {
                P.cutout(c, P.roundRect(-30, -4, 60, 48, 10), o.cuff, key + 'cuff', { border: 2, shadow: 0.15, inner: (cc, box) => rib(cc, box, o.cuff, { step: 5 }) });
            }
            const thumbFront = pose === 'fist';
            if (!thumbFront) P.cutout(c, sh.thumb, skin, key + 'thumb', { border: 2, shadow: 0.12, tex: { alpha: [0.12, 0.25] } });
            P.cutout(c, sh.palm, skin, key + 'palm', { border: 2.2, shadow: 0.15, tex: { alpha: [0.12, 0.25] } });
            if (thumbFront) P.cutout(c, sh.thumb, shade(skin, -4), key + 'thumb', { border: 1.4, shadow: 0.1, tex: { alpha: [0.12, 0.25] } });
            for (const [a, b] of sh.knuckles) P.markerStroke(c, [a, b], shade(skin, -12), 1.8, key + a[0], 0.55);
        });
        g.save();
        g.translate(x, y);
        g.rotate(rot);
        const k = size / 60;
        g.scale(o.mirror ? -k : k, k);
        sp.draw(g);
        g.restore();
    }

    return { shade, spline, cspline, centre, taper, curl, knit, rib, newsprint, wordBars, sheetMusic, mapPaper, rings, wobblyLine, woodGrain, cursive, strands, crease, markerPath, punch, hand, handShape };
})();
