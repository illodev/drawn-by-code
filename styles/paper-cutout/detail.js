// Detail pieces for the paper-cutout style: the things that separate a finished film from an
// animatic. Textures that carry information (knit, rib, newsprint, wood grain, hair strands),
// creases, organic shapes, and hands with real fingers. Global: PaperDetail.
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
    // Paper hands with real fingers: every finger, the thumb and the back of the hand (or the
    // palm) is its own piece with its own torn white border, layered on purpose (the fingers
    // under others a touch darker), with knuckle creases, subtle fingernails, and a ribbed cuff.
    // Traced from the what-do-you-love reference fist (WL.writingHand): separate curled fingers
    // each overlapping the next, the thumb across them.
    //
    // PaperDetail.hand(g, x, y, size, rot, pose, o)
    //   local frame: wrist at (x, y), fingers pointing up (-y) before `rot`; size ≈ palm width
    //   (60 = canonical). The thumb is on the -x side (o.mirror puts it on +x: the other hand).
    // poses: 'open' (back of the hand, fingers together, slightly spread), 'wave' (spread),
    //   'point' (index out of a fist, palm side), 'fist' (four curled fingers from the front,
    //   thumb across), 'pinch' / 'hold' (holding a paper edge: thumb in front, fingers behind),
    //   'rest' (lying on a desk, fingers curled towards the camera), 'grip' (curled fingers
    //   round a mug handle or a pen, thumb up), 'palm' (the open palm facing the camera: palm
    //   lines, finger pads, no nails: stop, whoa, fending off), 'wrap' (round a mug's body: the
    //   backs of the four fingers across its front, thumb behind (part 'back'); draw the mug
    //   between the parts, rot ≈ ±π/2 so the fingers run across it), 'edge' (fingers hooked over
    //   an edge from behind: only the curled fingers, knuckles on the edge, tips hanging towards
    //   the camera; rot ≈ π so they hang down; the anchor is the point on the edge),
    //   'pointBack' (pointing seen from the back of the hand: a POV finger pressing a button,
    //   or a hand pointing away; 'point' is the palm side, for a hand pointing at the camera).
    // o.side: 'right' | 'left', the character's hand. Use it instead of o.mirror: every pose is
    //   drawn as one of the two hands (VIEW below: back views of a right hand, palm-side views
    //   of a left hand) and the kit mirrors when needed. Mirroring «the hand on the left of the
    //   image» by habit puts the thumb on the wrong side of every back view: a hand on
    //   backwards. A character facing the camera: her right hand is on the left of the image.
    // o.skin, o.cuff (colour: a ribbed cuff at the wrist), o.sleeve (colour: a knitted sleeve end
    //   under the cuff), o.mirror, o.res (sprite resolution; default: picked from the current
    //   transform so the hand is crisp and never re-cut per frame), o.part: 'back' | 'front' to
    //   draw only the pieces behind / in front of a held object (paper, pen, mug handle).
    // PaperDetail.handAnchor(pose) → [x, y] in the same frame: where the held object goes.
    //
    // Authoring units: coordinates below are in "palm = 60" units; pieces are cut at HU× that
    // scale, so the paper edge, grain and fibres keep the proportions of the reference cutouts.
    const HU = 10 / 3;
    // A finger's centreline: base b (the knuckle), angle a (0 = up, + = clockwise), phalanges
    // L = [proximal, middle, distal], bends at each joint, width w. Starts `back` units inside
    // the hand so the base hides under the palm. Returns control points [start, knuckle, PIP, DIP, tip].
    function fingerLine(b, a, L, w, bend = [0, 0, 0], back = 10) {
        const dir = (t) => [Math.sin(t), -Math.cos(t)];
        const d0 = dir(a), pts = [[b[0] - d0[0] * back, b[1] - d0[1] * back], b];
        let p = b, ang = a;
        for (let i = 0; i < 3; i++) {
            ang += bend[i];
            const d = dir(ang), l = i === 2 ? Math.max(1, L[2] - w * 0.43) : L[i];
            p = [p[0] + d[0] * l, p[1] + d[1] * l];
            pts.push(p);
        }
        return pts;
    }
    // A finger piece (spec) → outline, nail and creases, all in 60-units.
    // f: { b, a, L, w, bend, nail, crease, shade, part, back }
    function fingerPiece(f) {
        const ctrl = fingerLine(f.b, f.a, f.L, f.w, f.bend, f.back);
        const w = f.w, ws = f.ws ?? [w, w, w * 0.97, w * 0.92, w * 0.86];
        const outline = taper(ctrl, ws, 6);
        const tip = ctrl[4], dip = ctrl[3], pip = ctrl[2];
        const along = (p, q) => { const dx = q[0] - p[0], dy = q[1] - p[1], l = Math.hypot(dx, dy) || 1; return [dx / l, dy / l]; };
        const td = along(dip, tip), tn = [-td[1], td[0]];
        const at = (o, u, v) => [o[0] + td[0] * u + tn[0] * v, o[1] + td[1] * u + tn[1] * v];
        let nail = null;
        if (f.nail) {
            const r = ws[4] / 2, nl = Math.min(f.L[2] * 0.62, r * 1.7);
            nail = spline([at(tip, -nl + r * 0.35, 0), at(tip, -nl + r * 0.55, r * 0.6), at(tip, r * 0.45, r * 0.62), at(tip, r * 0.82, 0), at(tip, r * 0.45, -r * 0.62), at(tip, -nl + r * 0.55, -r * 0.6)], 6);
        }
        // creases: two short arcs across the PIP joint, one across the DIP joint
        const creases = [];
        if (f.crease !== false) {
            const arc = (o, d, half, bow, du) => {
                const n = [-d[1], d[0]], c = [o[0] + d[0] * du, o[1] + d[1] * du];
                return [[c[0] - n[0] * half, c[1] - n[1] * half], [c[0] + d[0] * bow, c[1] + d[1] * bow], [c[0] + n[0] * half, c[1] + n[1] * half]];
            };
            const pd = along(ctrl[1], pip), dd = along(pip, dip);
            creases.push(arc(pip, pd, w * 0.24, -1.2, -1.2), arc(pip, pd, w * 0.17, -1, 1.6), arc(dip, dd, w * 0.18, -0.8, 0));
        }
        return { outline, nail, creases, ctrl };
    }

    // The fingers of each view, in 60-units. Base knuckles, lengths and widths are shared:
    // index, middle, ring, pinky (the middle longest, the pinky shortest and thinnest).
    const FINGERS = [
        { b: [-19, -60], L: [24, 16.5, 13.5], w: 14.5 },
        { b: [-5, -64], L: [26.5, 18.5, 14.5], w: 15.2 },
        { b: [9, -62], L: [25, 17.5, 13.5], w: 14.2 },
        { b: [22, -55], L: [19, 13, 11.5], w: 12.2 },
    ];
    const fingerSet = (angles, bends, extra = {}) => FINGERS.map((f, i) => ({ ...f, a: angles[i], bend: bends[i], shade: [-1.5, -3, -4.5, -6][i], ...(extra[i] ?? {}), ...(extra.all ?? {}) }));
    // Curled fingers of a fist seen from the front: each a vertical bar (the middle phalanx),
    // side by side, each overlapping the next; x, top, bottom, width.
    const bars = (spec, part = 'b') => spec.map(([x, y0, y1, w, tilt], i) => ({
        kind: 'bar', part, shade: [0, -1.5, -3, -4.5][i] ?? -4,
        ctrl: [[x + (tilt ?? 0), y0], [x + (tilt ?? 0) * 0.4, (y0 + y1) / 2], [x, y1]], w,
    }));

    function handPieces(pose) {
        if (pose === 'hold') pose = 'pinch';
        const P60 = [];
        const palm = (pts, o = {}) => P60.push({ kind: 'palm', pts: spline(pts, 7), shade: o.shade ?? -4, part: o.part ?? 'b', knuckles: o.knuckles ?? [], lines: o.lines });
        const fingers = (list, part = 'b', order = [3, 2, 1, 0]) => order.forEach((i) => P60.push({ kind: 'finger', part, ...list[i] }));
        const thumb = (f, part = 'b') => P60.push({ kind: 'finger', part, w: 16.5, shade: f.shade ?? 1, ...f });
        if (pose === 'open' || pose === 'wave') {
            // the back of the hand: fingers and thumb under the back piece, which hides their
            // bases and draws the knuckle line; nails and knuckle wrinkles on the backs
            const wave = pose === 'wave';
            const fs = fingerSet(wave ? [-0.36, -0.11, 0.13, 0.4] : [-0.1, -0.03, 0.05, 0.15], wave ? [[0.02, 0.04, 0.02], [0, 0.02, 0.01], [0, -0.02, -0.02], [-0.02, -0.05, -0.04]] : [[0.02, 0.04, 0.03], [0, 0.01, 0.01], [-0.01, -0.02, -0.02], [-0.03, -0.05, -0.04]], { all: { nail: true } });
            thumb({ b: [-23, -24], a: wave ? -1.1 : -0.78, L: [15, 17, 14], bend: wave ? [0.1, 0.12, 0.08] : [0.12, 0.16, 0.1], nail: true, shade: -2 });
            fingers(fs);
            const web = wave ? [[-31, -30], [-35, -36], [-29, -46]] : [[-31, -30], [-34, -40], [-28, -50]];
            palm([[0, 5], [-19, 3], [-25, -12], ...web, [-25, -59], [-19, -63], [-12, -63.5], [-5, -67], [2, -65.5], [9, -65.5], [16, -62], [22, -58.5], [27, -53], [30, -34], [26, -8], [15, 3]], { knuckles: [[-19, -58], [-5, -62], [9, -60], [21, -53]] });
        } else if (pose === 'fist' || pose === 'point' || pose === 'grip') {
            // seen from the front: the back piece, four (or three) curled fingers as bars side
            // by side, the thumb across (fist, point) or up the side (grip)
            const grip = pose === 'grip', point = pose === 'point';
            palm([[0, 6], [-22, 2], [-29, -22], [-31, -50], [-28, -70], [-12, -78], [6, -79], [23, -73], [32, -56], [33, -30], [27, -6], [14, 4]], { shade: -7 });
            if (point) P60.push({ kind: 'finger', part: 'f', b: [-18, -70], a: -0.05, L: [24, 16, 12.5], w: 14.8, bend: [0, 0.02, 0.03], back: 18, nail: false, shade: 0.5 });
            // short, stubby bars (about 2.6 widths long, like the reference), stepping down
            // from the index to the pinky
            const y1 = grip ? -62 : -58;
            const spec = [[-18.5, -77, y1, 17, -1.5], [-3.5, -80, y1 - 2, 17.4, 0], [11.5, -78, y1, 16.6, 1.5], [25, -70, y1 + 4, 14.4, 3]];
            bars(point ? spec.slice(1) : spec, grip ? 'f' : 'f').forEach((b) => P60.push(b));
            if (grip) thumb({ b: [-24, -34], a: 0.3, L: [13, 16, 13], bend: [0.1, 0.15, 0.1], nail: true, part: 'f', back: 12 }, 'f');
            else thumb({ b: [-29, -40], a: 1.35, L: [13, 18, 15], bend: [-0.06, 0.06, 0.1], nail: true, back: 8, w: 18 }, 'f');
        } else if (pose === 'pinch') {
            // holding a paper edge, seen from the front: palm and fingers behind the paper
            // (part 'back'), the thumb over it (part 'front'), lying towards the -x side
            const fs = fingerSet([-0.12, -0.03, 0.06, 0.17], [[0.02, 0.06, 0.06], [0, 0.04, 0.04], [-0.02, 0.0, -0.02], [-0.04, -0.05, -0.04]], { all: { nail: false }, 0: { L: [20, 13, 11] }, 1: { L: [22, 15, 12] }, 2: { L: [21, 14, 11] }, 3: { L: [16, 11, 9.5] } });
            fingers(fs);
            palm([[0, 5], [-21, 2], [-27, -16], [-29, -40], [-25, -60], [-12, -66], [2, -68], [16, -65], [27, -56], [31, -34], [27, -8], [15, 3]], { shade: -3 });
            thumb({ b: [-4, -40], a: -1.25, L: [12, 17, 14], bend: [0.04, 0.1, 0.08], nail: true, back: 8, w: 17 }, 'f');
        } else if (pose === 'rest') {
            // lying on a desk, seen from the front: a short (foreshortened) back of the hand,
            // fingers relaxed and curled towards the camera, nails at the tips
            const fs = fingerSet([-0.12, -0.03, 0.07, 0.22], [[0.05, 0.1, 0.1], [0, 0.03, 0.03], [-0.04, -0.06, -0.06], [-0.06, -0.1, -0.1]], {
                all: { nail: true, back: 8 },
                0: { b: [-19, -38], L: [13, 8, 7.5], ws: [14.5, 14.5, 14.8, 14.8, 14] },
                1: { b: [-5, -41], L: [14, 9, 8], ws: [15.2, 15.2, 15.6, 15.6, 14.6] },
                2: { b: [9, -40], L: [13, 8, 7.5], ws: [14.2, 14.2, 14.6, 14.4, 13.6] },
                3: { b: [22, -35], L: [10, 6.5, 6.5], ws: [12.2, 12.2, 12.6, 12.4, 11.8] },
            });
            thumb({ b: [-24, -14], a: -0.5, L: [12, 11, 10], bend: [0.1, 0.12, 0.1], nail: true, shade: -2 });
            fingers(fs);
            palm([[0, 5], [-22, 2], [-28, -10], [-31, -22], [-26, -34], [-12, -42], [2, -44], [16, -42], [27, -35], [31, -20], [28, -6], [15, 3]], { knuckles: [[-19, -36], [-5, -39], [9, -38], [21, -33]] });
        } else if (pose === 'palm') {
            // the palm facing the camera: the same bones as 'open', seen from the other side:
            // finger pads instead of nails, the thumb out from a fleshy base, palm lines
            const fs = fingerSet([-0.2, -0.06, 0.08, 0.26], [[0.02, 0.03, 0.02], [0, 0.01, 0.01], [-0.01, -0.02, -0.02], [-0.03, -0.05, -0.04]], { all: { nail: false } });
            thumb({ b: [-25, -28], a: -0.58, L: [13, 15, 13], bend: [0.08, 0.1, 0.06], nail: false, shade: -1 });
            fingers(fs);
            palm([[0, 5], [-19, 3], [-27, -10], [-32, -26], [-33, -36], [-27, -50], [-25, -59], [-19, -63], [-12, -63.5], [-5, -67], [2, -65.5], [9, -65.5], [16, -62], [22, -58.5], [27, -53], [30, -34], [26, -8], [15, 3]], { shade: 1, lines: [
                [[27, -44], [10, -46], [-6, -50], [-18, -54]], // heart line
                [[-26, -40], [-8, -36], [10, -30], [20, -24]], // head line
                [[-24, -42], [-14, -30], [-12, -14], [-10, 0]], // life line round the thumb's base
            ] });
        } else if (pose === 'pointBack') {
            // pointing, seen from the back of the hand (a POV finger, or a hand pointing away):
            // the index out with its nail, the other three folded under (only their first
            // joints show, foreshortened), the thumb tucked along the side
            const fs = fingerSet([-0.08, 0.02, 0.1, 0.2], [[0.02, 0.03, 0.02], [0.05, 0.1, 0.1], [0.02, 0.08, 0.08], [0, 0.06, 0.06]], {
                0: { nail: true }, 1: { L: [6, 2, 1.5], nail: false, crease: false }, 2: { L: [5.5, 2, 1.5], nail: false, crease: false }, 3: { L: [4.5, 2, 1.5], nail: false, crease: false },
            });
            thumb({ b: [-24, -26], a: -0.42, L: [13, 13, 11], bend: [0.1, 0.12, 0.1], nail: true, shade: -2 });
            fingers(fs, 'b', [3, 2, 1, 0]);
            palm([[0, 5], [-19, 3], [-25, -12], [-31, -30], [-33, -40], [-28, -50], [-25, -59], [-19, -63], [-12, -63.5], [-5, -66], [2, -64.5], [9, -64.5], [16, -61], [22, -57.5], [27, -52], [30, -34], [26, -8], [15, 3]], { knuckles: [[-19, -58], [-5, -61], [9, -59], [21, -52]] });
        } else if (pose === 'wrap') {
            // round a mug's body, seen from the front with the forearm coming from the side:
            // the back of the hand is edge-on (short), the four fingers run across the mug's
            // front (their backs: nails at the tips, the far joints foreshortened by the
            // curve), the thumb behind the mug (part 'back', its tip peeking over the index)
            thumb({ b: [-22, -18], a: -0.2, L: [12, 13, 11], bend: [0.1, 0.12, 0.1], nail: true, shade: -4 }, 'b');
            const fs = fingerSet([-0.06, -0.01, 0.03, 0.08], [[0.02, 0.04, 0.05], [0, 0.03, 0.04], [-0.01, 0.01, 0.02], [-0.03, -0.02, -0.01]], {
                all: { nail: true, part: 'f', back: 3 },
                0: { b: [-19, -26], L: [16, 12, 8] }, 1: { b: [-5, -28], L: [17, 13, 8.5] },
                2: { b: [9, -27], L: [16, 12, 8] }, 3: { b: [22, -23], L: [13, 10, 7] },
            });
            // the back of the hand first, narrow at the wrist and widening to the knuckles, then
            // the fingers over its top edge: one continuous hand, not a patch pasted on top
            palm([[0, 6], [-17, 4], [-23, -6], [-27, -18], [-26, -26], [-19, -30], [-12, -31], [-5, -32], [2, -31], [9, -31], [16, -29], [22, -26], [28, -20], [27, -9], [20, 2], [10, 6]], { part: 'f', knuckles: [] });
            fingers(fs, 'f');
        } else if (pose === 'edge') {
            // fingers hooked over an edge from behind, seen from the front: only the curled
            // fingers, knuckles on the edge (y = -50), short and foreshortened, nails at the tips
            const fs = fingerSet([-0.1, -0.03, 0.05, 0.14], [[0.05, 0.08, 0.08], [0, 0.03, 0.03], [-0.03, -0.04, -0.05], [-0.05, -0.08, -0.08]], {
                all: { nail: true, back: 2 },
                0: { b: [-19, -50], L: [10, 8, 8], ws: [14.5, 14.8, 14.8, 14.6, 14] },
                1: { b: [-5, -52], L: [11, 9, 8.5], ws: [15.2, 15.6, 15.6, 15.2, 14.6] },
                2: { b: [9, -51], L: [10, 8, 8], ws: [14.2, 14.6, 14.4, 14.2, 13.6] },
                3: { b: [22, -48], L: [8, 6.5, 6.5], ws: [12.2, 12.6, 12.4, 12, 11.8] },
            });
            fingers(fs);
        } else throw new Error('PaperDetail.hand: unknown pose ' + pose);
        return P60;
    }
    const ANCHORS = { pinch: [-10, -52], hold: [-10, -52], grip: [-2, -54], fist: [-2, -60], point: [-19, -128], open: [0, -60], wave: [0, -60], rest: [0, -30], palm: [0, -60], wrap: [-2, -58], edge: [0, -50], pointBack: [-22, -128] };
    // which hand each pose is drawn as (before o.mirror): back views of a right hand, palm-side
    // views of a left hand, both with the thumb on -x
    const VIEW = { pointBack: 'right', open: 'right', wave: 'right', wrap: 'right', edge: 'right', palm: 'left', rest: 'left', fist: 'left', point: 'left', grip: 'left', pinch: 'left', hold: 'left' };
    const handAnchor = (pose) => ANCHORS[pose] ?? [0, -60];

    const mix = (a, b, k) => {
        const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
        const A = p(a), B = p(b);
        return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * k).toString(16).padStart(2, '0')).join('');
    };
    const RES = [0.2, 0.28, 0.4, 0.55, 0.75, 1, 1.4, 2];
    function hand(g, x, y, size, rot, pose = 'open', o = {}) {
        const skin = o.skin ?? '#edc4a7', part = o.part ?? 'all';
        const mirror = o.side ? o.side !== VIEW[pose] : o.mirror;
        const m = g.getTransform(), px = (Math.hypot(m.a, m.b) * size) / 60 / HU; // output px per sprite unit
        const res = o.res ?? RES.find((r) => r >= px) ?? RES[RES.length - 1];
        // chunkier cut for miniatures: the white border never thinner than ~1.3 output px
        const edge = Math.max(2.3, 1.3 / res), chunky = res < 0.3;
        const key = ['dhand2', pose, skin, o.cuff ?? '', o.sleeve ?? '', part, edge.toFixed(2)].join(':');
        const sp = Motion.sprite(key, { x: -95 * HU, y: -150 * HU, w: 190 * HU, h: 260 * HU }, res, (c) => {
            const S = (pts) => pts.map(([a, b]) => [a * HU, b * HU]);
            const cut = (pts, col, seed, oo = {}) => P.cutout(c, S(pts), col, key + seed, { border: edge, borderVar: 0.4, jag: 0.8, step: 2, shadow: 0.14, tex: { alpha: [0.12, 0.26], len: [20, 60], h: [6, 12], angle: -Math.PI / 2 }, ...oo });
            const want = (pp) => part === 'all' || (part === 'back' ? pp === 'b' : pp === 'f');
            const crease = (pts, col, wdt, seed, alpha) => P.markerStroke(c, S(spline(pts, 4, false)), col, Math.max(wdt * HU, 1.4 / res), key + seed, alpha);
            // sleeve end and ribbed cuff behind the hand (part 'back')
            if (want('b') && o.sleeve) cut([[-34, 14], [34, 14], [36, 90], [-36, 90]], o.sleeve, 'sleeve', { inner: (cc, box) => knit(cc, box, o.sleeve, { seed: key + 'knit', size: 30, alpha: 0.18 }) });
            if (want('b') && o.cuff) cut(P.roundRect(-30, -6, 60, 34, 6), o.cuff, 'cuff', { shadow: 0.18, tex: { alpha: [0.15, 0.3] }, inner: (cc, box) => rib(cc, box, o.cuff, { step: 15, width: 5.5, angle: 0 }) });
            handPieces(pose).forEach((pc, i) => {
                if (!want(pc.part)) return;
                const col = shade(skin, pc.shade ?? 0);
                if (pc.kind === 'palm') {
                    cut(pc.pts, col, 'palm' + i, { shadow: 0.16 });
                    // knuckle dimples on the back of the hand
                    if (!chunky) pc.knuckles.forEach(([kx, ky], j) => crease([[kx - 3.2, ky + 4], [kx, ky + 5.2], [kx + 3.2, ky + 4]], shade(skin, -14), 0.55, 'kn' + i + j, 0.45));
                    // palm lines (the palm-side view)
                    if (pc.lines) pc.lines.forEach((ln, j) => crease(ln, shade(skin, -16), chunky ? 0.9 : 0.6, 'pl' + i + j, 0.5));
                } else if (pc.kind === 'bar') {
                    const out = taper(pc.ctrl, [pc.w * 0.97, pc.w, pc.w * 0.96], 6);
                    cut(out, col, 'bar' + i);
                    // the joint of the curled finger: a short crease across the bar, low down
                    // the bent knuckle near the top: two short wrinkles across the bar
                    const [bx, by] = pc.ctrl[2], [tx, top] = pc.ctrl[0];
                    for (const [k, a] of [[0.3, 0.5], [0.42, 0.35]]) {
                        const jy = top + (by - top) * k, jx = tx + (bx - tx) * k;
                        crease([[jx - pc.w * 0.22, jy + 0.7], [jx, jy - 0.5], [jx + pc.w * 0.22, jy + 0.7]], shade(skin, -15), 0.55, 'bj' + i + k, a);
                    }
                } else {
                    const f = fingerPiece(pc);
                    cut(f.outline, col, 'f' + i);
                    if (f.nail && !chunky) cut(f.nail, mix(shade(skin, 3), '#f4d3cf', 0.32), 'nail' + i, { border: 0, shadow: 0, jag: 0.3, tex: { alpha: [0.1, 0.2] } });
                    if (!chunky) f.creases.forEach((cr, j) => crease(cr, shade(skin, -15), j < 2 ? 0.55 : 0.45, 'cr' + i + j, j < 2 ? 0.5 : 0.35));
                    else if (f.creases[0]) crease(f.creases[0], shade(skin, -15), 0.8, 'cr' + i, 0.5);
                }
            });
        });
        g.save();
        g.translate(x, y);
        g.rotate(rot);
        const k = size / 60 / HU;
        g.scale(mirror ? -k : k, k);
        sp.draw(g);
        g.restore();
    }

    return { shade, spline, cspline, centre, taper, curl, knit, rib, newsprint, wordBars, sheetMusic, mapPaper, rings, wobblyLine, woodGrain, cursive, strands, crease, markerPath, punch, hand, handPieces, handAnchor, HAND_VIEW: VIEW };
})();
