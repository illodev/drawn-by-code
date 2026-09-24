// Paper-cutout kit for canvas 2D.
// Everything is deterministic: the same seed gives the same tear and the same texture on
// every frame, so nothing "boils". Depends on engine/core.js (Motion, Ease).
const Paper = (() => {
    const PAPER = '#f7f1e3';

    function hashStr(s) {
        let h = 2166136261 >>> 0;
        for (const c of String(s)) {
            h ^= c.charCodeAt(0);
            h = Math.imul(h, 16777619);
        }
        return h >>> 0;
    }

    function rng(seed) {
        let a = typeof seed === 'number' ? seed >>> 0 : hashStr(seed);
        return () => {
            a |= 0;
            a = (a + 0x6d2b79f5) | 0;
            let t = Math.imul(a ^ (a >>> 15), 1 | a);
            t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
    }

    // Periodic 1D noise on [0,1): used to vary the edge thickness along the outline.
    function loopNoise(seed, knots) {
        const r = rng(seed);
        const v = Array.from({ length: knots }, () => r() * 2 - 1);
        return (u) => {
            const x = (((u % 1) + 1) % 1) * knots;
            const i = Math.floor(x);
            const f = x - i;
            const s = f * f * (3 - 2 * f);
            return v[i % knots] + (v[(i + 1) % knots] - v[i % knots]) * s;
        };
    }

    // --- colors -----------------------------------------------------------------
    function hexToHsl(hex) {
        const n = parseInt(hex.slice(1), 16);
        const r = ((n >> 16) & 255) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255;
        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h = 0, s = 0;
        const l = (max + min) / 2;
        if (max !== min) {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
            else if (max === g) h = (b - r) / d + 2;
            else h = (r - g) / d + 4;
            h *= 60;
        }
        return [h, s * 100, l * 100];
    }
    const hsla = (h, s, l, a) => `hsla(${h.toFixed(1)},${Math.max(0, Math.min(100, s)).toFixed(1)}%,${Math.max(0, Math.min(100, l)).toFixed(1)}%,${a.toFixed(3)})`;

    // --- geometry --------------------------------------------------------------
    function signedArea(p) {
        let a = 0;
        for (let i = 0; i < p.length; i++) {
            const [x1, y1] = p[i], [x2, y2] = p[(i + 1) % p.length];
            a += x1 * y2 - x2 * y1;
        }
        return a / 2;
    }

    function resample(poly, step) {
        const n = poly.length;
        const seg = [];
        let L = 0;
        for (let i = 0; i < n; i++) {
            const a = poly[i], b = poly[(i + 1) % n];
            const d = Math.hypot(b[0] - a[0], b[1] - a[1]);
            seg.push(d);
            L += d;
        }
        const m = Math.max(12, Math.round(L / step));
        const pts = [];
        let si = 0, acc = 0;
        for (let k = 0; k < m; k++) {
            const target = (k * L) / m;
            while (si < n - 1 && acc + seg[si] < target) acc += seg[si++];
            const t = seg[si] ? (target - acc) / seg[si] : 0;
            const a = poly[si], b = poly[(si + 1) % n];
            pts.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]);
        }
        const sign = signedArea(pts) > 0 ? 1 : -1;
        const nrm = pts.map((_, i) => {
            const a = pts[(i - 1 + m) % m], b = pts[(i + 1) % m];
            const dx = b[0] - a[0], dy = b[1] - a[1];
            const d = Math.hypot(dx, dy) || 1;
            return [(sign * dy) / d, (-sign * dx) / d];
        });
        return { pts, nrm, L };
    }

    function ellipse(cx, cy, rx, ry, n = 96) {
        return Array.from({ length: n }, (_, i) => {
            const a = (i / n) * Math.PI * 2;
            return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry];
        });
    }

    function roundRect(x, y, w, h, r, n = 10) {
        const out = [];
        const corner = (cx, cy, a0) => {
            for (let i = 0; i <= n; i++) {
                const a = a0 + (i / n) * (Math.PI / 2);
                out.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
            }
        };
        corner(x + w - r, y + r, -Math.PI / 2);
        corner(x + w - r, y + h - r, 0);
        corner(x + r, y + h - r, Math.PI / 2);
        corner(x + r, y + r, Math.PI);
        return out;
    }

    // Outline of a union of circles as seen from (0,0): works for star-shaped
    // forms like a cloud, and leaves sharp notches like a scissor cut.
    function circleUnion(circles, n = 360) {
        const out = [];
        for (let i = 0; i < n; i++) {
            const a = (i / n) * Math.PI * 2;
            const dx = Math.cos(a), dy = Math.sin(a);
            let best = 0;
            for (const [cx, cy, r] of circles) {
                const b = dx * cx + dy * cy;
                const disc = b * b - (cx * cx + cy * cy) + r * r;
                if (disc >= 0) best = Math.max(best, b + Math.sqrt(disc));
            }
            out.push([dx * best, dy * best]);
        }
        return out;
    }

    // Strip of width w along a polyline, with round caps.
    function noodle(path, w0, w1 = w0) {
        const n = path.length;
        const L = [], R = [], T = [];
        for (let i = 0; i < n; i++) {
            const a = path[Math.max(0, i - 1)], b = path[Math.min(n - 1, i + 1)];
            let tx = b[0] - a[0], ty = b[1] - a[1];
            const d = Math.hypot(tx, ty) || 1;
            tx /= d;
            ty /= d;
            T.push([tx, ty]);
            const w = (w0 + (w1 - w0) * (i / (n - 1))) / 2;
            L.push([path[i][0] - ty * w, path[i][1] + tx * w]);
            R.push([path[i][0] + ty * w, path[i][1] - tx * w]);
        }
        const cap = (p, t, w, dir) => {
            const nx = -t[1] * dir, ny = t[0] * dir, fx = t[0] * dir, fy = t[1] * dir;
            const pts = [];
            for (let k = 1; k < 12; k++) {
                const th = (k / 12) * Math.PI;
                pts.push([p[0] + w * (Math.cos(th) * nx + Math.sin(th) * fx), p[1] + w * (Math.cos(th) * ny + Math.sin(th) * fy)]);
            }
            return pts;
        };
        return [...L, ...cap(path[n - 1], T[n - 1], w1 / 2, 1), ...R.reverse(), ...cap(path[0], T[0], w0 / 2, -1)];
    }

    function bezier(p0, p1, p2, p3, n = 24) {
        return Array.from({ length: n + 1 }, (_, i) => {
            const t = i / n, u = 1 - t;
            return [
                u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
                u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1],
            ];
        });
    }

    function bbox(poly, pad = 0) {
        let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
        for (const [x, y] of poly) {
            x0 = Math.min(x0, x);
            y0 = Math.min(y0, y);
            x1 = Math.max(x1, x);
            y1 = Math.max(y1, y);
        }
        return { x: x0 - pad, y: y0 - pad, w: x1 - x0 + pad * 2, h: y1 - y0 + pad * 2 };
    }

    function tracePath(ctx, pts) {
        ctx.beginPath();
        ctx.moveTo(pts[0][0], pts[0][1]);
        for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
        ctx.closePath();
    }

    // Offsets the outline along its normal: a base `offset` (with slow variation)
    // plus a fine jaggedness, which is what reads as "torn".
    function torn(res, seed, offset, offVar, jag) {
        const r = rng(seed);
        const low = loopNoise(seed + ':low', Math.max(5, Math.round(res.L / 70)));
        const m = res.pts.length;
        return res.pts.map((p, i) => {
            let o = offset * (1 + offVar * low(i / m)) + (r() * 2 - 1) * jag;
            if (r() < 0.05) o -= r() * jag * 2.2; // occasional bite
            return [p[0] + res.nrm[i][0] * o, p[1] + res.nrm[i][1] * o];
        });
    }

    // --- marker texture -------------------------------------------------------------
    // Short, flat, semi-transparent strokes of the same hue with slightly shifted lightness.
    function marker(ctx, box, color, seed, o = {}) {
        const {
            angle = 0, angleVar = 0.12, len = [16, 48], h = [5, 10], density = 1.25,
            lVar = 4.5, sVar = 4, alpha = [0.3, 0.65], path = null,
        } = o;
        const [H, S, Lum] = hexToHsl(color);
        const r = rng(seed + ':mk');
        const avg = ((len[0] + len[1]) / 2) * ((h[0] + h[1]) / 2);
        const count = Math.min(4000, Math.round((density * box.w * box.h) / avg));
        for (let i = 0; i < count; i++) {
            let x, y, a;
            if (path) {
                // spread along a strip: they follow its direction and move with it
                const t = r() * (path.length - 1);
                const k = Math.floor(t), f = t - k;
                const p = path[k], q = path[Math.min(path.length - 1, k + 1)];
                const tx = q[0] - p[0], ty = q[1] - p[1];
                const d = Math.hypot(tx, ty) || 1;
                const side = (r() - 0.5) * (o.width ?? 20);
                x = p[0] + tx * f - (ty / d) * side;
                y = p[1] + ty * f + (tx / d) * side;
                a = Math.atan2(ty, tx) + (r() - 0.5) * angleVar;
            } else {
                x = box.x + r() * box.w;
                y = box.y + r() * box.h;
                a = angle + (r() - 0.5) * angleVar;
            }
            const l = len[0] + r() * (len[1] - len[0]);
            const hh = h[0] + r() * (h[1] - h[0]);
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(a);
            ctx.fillStyle = hsla(H + (r() - 0.5) * 3, S + (r() - 0.5) * 2 * sVar, Lum + (r() - 0.5) * 2 * lVar, alpha[0] + r() * (alpha[1] - alpha[0]));
            ctx.beginPath();
            ctx.roundRect(-l / 2, -hh / 2, l, hh, hh * 0.35);
            ctx.fill();
            ctx.restore();
        }
    }

    // Little fiber hairs poking out of the white edge.
    function fibers(ctx, pts, res, seed, color) {
        const r = rng(seed + ':fib');
        ctx.strokeStyle = color;
        ctx.lineWidth = 0.55;
        ctx.lineCap = 'round';
        ctx.beginPath();
        for (let i = 0; i < pts.length; i++) {
            if (r() > 0.07) continue;
            const [x, y] = pts[i], [nx, ny] = res.nrm[i];
            const l = 0.8 + r() * 2.6, s = (r() - 0.5) * 1.6;
            ctx.moveTo(x, y);
            ctx.lineTo(x + nx * l - ny * s, y + ny * l + nx * s);
        }
        ctx.stroke();
    }

    /**
     * Cutout piece: torn white paper edge + textured color layer.
     * o.border: width of the white edge (0 = no edge); o.tex: marker() options;
     * o.shadow: glued-paper shadow; o.inner(ctx): extra drawing clipped to the piece.
     */
    function cutout(ctx, poly, color, seed, o = {}) {
        const { border = 3.2, borderVar = 0.55, jag = 0.9, step = 2.2, shadow = 0.16, tex = {}, inner = null, paper = PAPER } = o;
        const res = resample(poly, step);
        const colorPts = torn(res, seed + ':c', 0, 0, jag * 0.7);
        const box = bbox(res.pts, 4);
        if (border > 0) {
            const paperPts = torn(res, seed + ':p', border, borderVar, jag);
            if (shadow > 0) {
                ctx.save();
                ctx.translate(1.3, 2.2);
                ctx.fillStyle = `rgba(20,6,26,${shadow})`;
                tracePath(ctx, paperPts);
                ctx.fill();
                ctx.restore();
            }
            ctx.fillStyle = paper;
            tracePath(ctx, paperPts);
            ctx.fill();
            fibers(ctx, paperPts, res, seed, paper);
        } else if (shadow > 0) {
            ctx.save();
            ctx.translate(1, 1.8);
            ctx.fillStyle = `rgba(20,6,26,${shadow})`;
            tracePath(ctx, colorPts);
            ctx.fill();
            ctx.restore();
        }
        ctx.save();
        tracePath(ctx, colorPts);
        ctx.clip();
        ctx.fillStyle = color;
        ctx.fillRect(box.x, box.y, box.w, box.h);
        if (tex !== false) marker(ctx, box, tex.color ?? color, seed, tex);
        if (inner) inner(ctx, box);
        ctx.restore();
        return { res, box };
    }

    // Marker stroke (lines, mouths, underlines): several slightly offset passes.
    function markerStroke(ctx, pts, color, width, seed, alpha = 0.9) {
        const r = rng(seed + ':ms');
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        for (let pass = 0; pass < 3; pass++) {
            ctx.strokeStyle = color;
            ctx.globalAlpha = alpha * (pass === 0 ? 1 : 0.35);
            ctx.lineWidth = width * (pass === 0 ? 1 : 0.6);
            const ox = (r() - 0.5) * width * 0.35, oy = (r() - 0.5) * width * 0.35;
            ctx.beginPath();
            ctx.moveTo(pts[0][0] + ox, pts[0][1] + oy);
            for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0] + ox, pts[i][1] + oy);
            ctx.stroke();
        }
        ctx.globalAlpha = 1;
    }

    // Scribble that imitates handwriting (the "text" on the papers).
    function scribble(ctx, x, y, w, rows, lineH, color, seed, o = {}) {
        const r = rng(seed + ':scr');
        ctx.strokeStyle = color;
        ctx.lineWidth = o.width ?? 1.1;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.globalAlpha = o.alpha ?? 0.55;
        for (let row = 0; row < rows; row++) {
            const yy = y + row * lineH;
            let xx = x;
            const end = x + w * (row === rows - 1 ? 0.35 + r() * 0.4 : 0.85 + r() * 0.15);
            ctx.beginPath();
            while (xx < end) {
                const wl = 8 + r() * 26;
                ctx.moveTo(xx, yy);
                for (let s = 0; s < wl; s += 2.2) {
                    const hgt = (r() < 0.18 ? 5.5 : 2.6) * (o.scale ?? 1);
                    ctx.lineTo(xx + s, yy - Math.abs(Math.sin(s * 1.3 + r())) * hgt);
                }
                xx += wl + 4 + r() * 5;
            }
            ctx.stroke();
        }
        ctx.globalAlpha = 1;
    }

    // Paper grain: a noise tile blended on top of everything.
    function grainTile(px, seed, strength = 26) {
        const c = document.createElement('canvas');
        c.width = c.height = px;
        const g = c.getContext('2d');
        const img = g.createImageData(px, px);
        const r = rng(seed);
        for (let i = 0; i < px * px; i++) {
            const v = 128 + (r() - 0.5) * strength * 2;
            img.data[i * 4] = img.data[i * 4 + 1] = img.data[i * 4 + 2] = v;
            img.data[i * 4 + 3] = 255;
        }
        g.putImageData(img, 0, 0);
        return c;
    }

    // Paints with drawFn on a separate canvas, at output resolution, for reuse.
    function sprite(box, scale, drawFn) {
        const c = document.createElement('canvas');
        c.width = Math.ceil(box.w * scale);
        c.height = Math.ceil(box.h * scale);
        const g = c.getContext('2d');
        g.scale(scale, scale);
        g.translate(-box.x, -box.y);
        drawFn(g);
        return { canvas: c, box, draw: (ctx) => ctx.drawImage(c, box.x, box.y, box.w, box.h) };
    }

    return { PAPER, rng, loopNoise, hexToHsl, hsla, resample, ellipse, roundRect, circleUnion, noodle, bezier, bbox, tracePath, torn, marker, fibers, cutout, markerStroke, scribble, grainTile, sprite };
})();

