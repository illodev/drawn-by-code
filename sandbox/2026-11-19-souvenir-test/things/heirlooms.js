// Heirlooms of the peoples of Andalusia, the later half of the wheel of relics round the
// emblem (Visigoths, Byzantines, al-Andalus), each after a real, documented object or type
// and painted as the plate of an archaeology book would show it, in the emblem manner (dark
// contour + airbrush). Global: Heirlooms. Sizes at s = 1 (paint and contour included), the
// anchor in the middle of each:
//   Heirlooms.eagle(g, { x, y, s, rot, seed, flip })        136 × 216   Visigothic eagle fibula, 6th c.
//                                                           (it looks left; flip: true, right: they were worn in facing pairs)
//   Heirlooms.votive(g, { x, y, s, rot, seed })             186 × 290   Visigothic votive crown and its cross, 7th c.
//   Heirlooms.byzantine(g, { x, y, s, rot, seed })          162 × 212   Byzantine pectoral cross on gold mosaic, 6th–7th c.
//   Heirlooms.astrolabe(g, { x, y, s, rot, seed, turn, rule })  230 × 304   Andalusi astrolabe, 11th c.
//                                                           (turn: the rete's angle, rule: the rule's, in radians)
//   Heirlooms.fawn(g, { x, y, s, rot, seed })               182 × 230   the bronze fawn of Madinat al-Zahra, 10th c.
//   Heirlooms.alicatado(g, { x, y, s, rot, seed, w, h, period })  308 × 308 (w × h + 8; default 300 × 300)
//                                                           Nasrid cut-tile panel, 14th c.; period: the lattice's, 88
//   Heirlooms.SIZE                                          { name: [w, h] } of the above
// `rot` turns the object, never the light: the geometry is turned point by point, every
// spray keeps falling from the top left, and the one per-pixel sprite (the fawn's bronze) is
// baked with Souvenir.lightFor and cached by angle (snapped to 5°), resolution and seed. Each
// drawer paints on a sheet of its own (on the caller's pixel grid) and pastes it, so its
// shadows and cut holes touch nothing else on the caller's layer. Paint them once, on a
// layer: they take 0.1–0.7 s each at film size.
const Heirlooms = (() => {
    const S = Souvenir;
    const INK = S.INK, SD = S.SHADE_DIR, TOL = [-SD[0], -SD[1]]; // TOL: towards the light, on the page
    const TAU = Math.PI * 2;
    const cache = new Map();
    const memo = (key, fn) => {
        if (!cache.has(key)) cache.set(key, fn());
        return cache.get(key);
    };
    const GOLD = { ink: INK, deep: '#4a2c10', shade: '#8a5a17', mid: '#d9a441', light: '#f6dc8a', glint: '#fff6d2', warm: '#b8742c' };

    // ------------------------------------------------------------------ geometry
    // A frame turns (and mirrors) a thing's own coordinates: every point goes through it and
    // the context is never rotated, so the light stays where it is.
    function frame(rot = 0, flip = 1, ox = 0, oy = 0) {
        // (ox, oy): the point of the thing's own drawing that sits on the anchor
        const c = Math.cos(rot), sn = Math.sin(rot);
        const f = (p) => [(p[0] - ox) * flip * c - (p[1] - oy) * sn, (p[0] - ox) * flip * sn + (p[1] - oy) * c];
        f.pts = (a) => a.map(f);
        f.rot = rot;
        f.flip = flip;
        f.ang = (a) => (flip > 0 ? a + rot : Math.PI - a + rot); // a direction of the thing, on the page
        return f;
    }
    const pol = (c, r, a) => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
    const lerp = (a, b, t) => a + (b - a) * t;
    const lerpP = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
    const arc = (c, r, a0, a1, n = 16) => {
        const out = [];
        for (let i = 0; i <= n; i++) out.push(pol(c, r, a0 + ((a1 - a0) * i) / n));
        return out;
    };
    // the box a turned thing needs
    const reach = (b, rot, pad = 6) => {
        const F = frame(rot);
        return S.bbox([[b.x, b.y], [b.x + b.w, b.y], [b.x + b.w, b.y + b.h], [b.x, b.y + b.h]].map(F), pad);
    };
    // points every `step` along a polyline: [[x, y, tx, ty], …]
    function even(pts, step, closed = false) {
        const src = closed ? [...pts, pts[0]] : pts, out = [];
        let acc = 0, next = 0;
        for (let i = 1; i < src.length; i++) {
            const a = src[i - 1], b = src[i], d = Math.hypot(b[0] - a[0], b[1] - a[1]);
            if (d < 1e-9) continue;
            while (next <= acc + d + 1e-9) {
                const u = (next - acc) / d;
                out.push([a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, (b[0] - a[0]) / d, (b[1] - a[1]) / d]);
                next += step;
            }
            acc += d;
        }
        return out;
    }
    const centroid = (pts) => {
        let x = 0, y = 0;
        for (const p of pts) {
            x += p[0];
            y += p[1];
        }
        return [x / pts.length, y / pts.length];
    };
    const inPoly = (p, poly) => {
        let c = false;
        for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
            const a = poly[i], b = poly[j];
            if (a[1] > p[1] !== b[1] > p[1] && p[0] < ((b[0] - a[0]) * (p[1] - a[1])) / (b[1] - a[1]) + a[0]) c = !c;
        }
        return c;
    };
    // a closed polygon moved in by d (out for d < 0), whichever way it winds
    function inset(pts, d) {
        const n = pts.length;
        let area = 0;
        for (let i = 0; i < n; i++) area += pts[i][0] * pts[(i + 1) % n][1] - pts[(i + 1) % n][0] * pts[i][1];
        const sg = area > 0 ? 1 : -1;
        return pts.map((p, i) => {
            const a = pts[(i - 1 + n) % n], b = pts[(i + 1) % n];
            let ax = p[0] - a[0], ay = p[1] - a[1], bx = b[0] - p[0], by = b[1] - p[1];
            const la = Math.hypot(ax, ay) || 1, lb = Math.hypot(bx, by) || 1;
            ax /= la; ay /= la; bx /= lb; by /= lb;
            // inward normals of the two edges, and their mitre
            const n1 = [-ay * sg, ax * sg], n2 = [-by * sg, bx * sg];
            let mx = n1[0] + n2[0], my = n1[1] + n2[1];
            const ml = Math.hypot(mx, my) || 1;
            mx /= ml; my /= ml;
            const k = Math.min(3, 1 / Math.max(0.2, mx * n1[0] + my * n1[1]));
            return [p[0] + mx * d * k, p[1] + my * d * k];
        });
    }

    // ------------------------------------------------------------------ sheets
    // Paints `paint(q)` (in the thing's own units, origin at its anchor) on a canvas of its
    // own, on the pixel grid of the caller's context, and pastes it: `source-atop` shadows,
    // sprays from the thing's own edges and cut holes stay inside the thing.
    function sheet(g, x, y, s, box, paint) {
        const m = g.getTransform();
        const c = document.createElement('canvas');
        const q = c.getContext('2d');
        if (Math.abs(m.b) < 1e-6 && Math.abs(m.c) < 1e-6 && m.a > 0 && m.d > 0) {
            let X0 = Math.floor(m.a * (x + box.x * s) + m.e) - 2, Y0 = Math.floor(m.d * (y + box.y * s) + m.f) - 2;
            let X1 = Math.ceil(m.a * (x + (box.x + box.w) * s) + m.e) + 2, Y1 = Math.ceil(m.d * (y + (box.y + box.h) * s) + m.f) + 2;
            const W = g.canvas.width, H = g.canvas.height;
            if (X1 <= 0 || Y1 <= 0 || X0 >= W || Y0 >= H) return;
            if ((X1 - X0) * (Y1 - Y0) > 2.6e7) {
                // too big to paint whole: only what the caller's canvas shows
                X0 = Math.max(0, X0);
                Y0 = Math.max(0, Y0);
                X1 = Math.min(W, X1);
                Y1 = Math.min(H, Y1);
            }
            c.width = X1 - X0;
            c.height = Y1 - Y0;
            q.setTransform(m.a * s, 0, 0, m.d * s, m.a * x + m.e - X0, m.d * y + m.f - Y0);
            paint(q);
            g.save();
            g.setTransform(1, 0, 0, 1, 0, 0);
            g.drawImage(c, X0, Y0);
            g.restore();
        } else {
            const res = Math.min(8, Math.max(0.25, Math.hypot(m.a, m.b) * s));
            c.width = Math.ceil(box.w * res);
            c.height = Math.ceil(box.h * res);
            q.setTransform(res, 0, 0, res, -box.x * res, -box.y * res);
            paint(q);
            g.save();
            g.translate(x, y);
            g.scale(s, s);
            g.drawImage(c, box.x, box.y, c.width / res, c.height / res);
            g.restore();
        }
    }
    // a blank sheet laid exactly over another: a part that needs an alpha of its own
    const like = (q) => {
        const c = document.createElement('canvas');
        c.width = q.canvas.width;
        c.height = q.canvas.height;
        const g = c.getContext('2d');
        g.setTransform(q.getTransform());
        return g;
    };
    // The airbrush on everything a sheet holds: colour sprayed in from the paint's own edges
    // (holes included), `w` units deep, from the side `dir` points to. What Souvenir.spray
    // does for one polygon (after `sprayIn` in things/ribbon.js).
    function air(g, { color, alpha = 0.5, w = 6, push = null, dir = SD }) {
        const c = g.canvas, k = S.pxScale(g), d = (push ?? w * 0.6) * k, pad = Math.ceil(w * k * 2 + d) + 2, BIG = 20000;
        const inv = document.createElement('canvas');
        inv.width = c.width + pad * 2;
        inv.height = c.height + pad * 2;
        const q = inv.getContext('2d');
        q.fillStyle = '#000';
        q.fillRect(0, 0, inv.width, inv.height);
        q.globalCompositeOperation = 'destination-out';
        q.drawImage(c, pad, pad);
        g.save();
        g.setTransform(1, 0, 0, 1, 0, 0);
        g.globalCompositeOperation = 'source-atop';
        g.shadowColor = S.rgba(color, alpha);
        g.shadowBlur = w * k;
        g.shadowOffsetX = BIG - dir[0] * d;
        g.shadowOffsetY = -dir[1] * d;
        g.drawImage(inv, -pad - BIG, -pad);
        g.restore();
    }
    // Lays a part (a sheet from `like`) on the thing the emblem way: its shadow on what is
    // already there, its silhouette in ink a line's width bigger (heavier towards the shadow
    // side), itself (after `stamp` in things/ribbon.js).
    function stampOn(G, part, { lw = 1.6, heavy = 0.7, cast = null, ink = INK, alpha = 1, depth = 0, side = '#6a4214' } = {}) {
        const c = part.canvas, k = S.pxScale(G), BIG = 20000;
        const tinted = (col) => {
            const t = document.createElement('canvas');
            t.width = c.width;
            t.height = c.height;
            const q = t.getContext('2d');
            q.drawImage(c, 0, 0);
            q.globalCompositeOperation = 'source-in';
            q.fillStyle = col;
            q.fillRect(0, 0, t.width, t.height);
            return t;
        };
        const sil = tinted(ink);
        G.save();
        G.setTransform(1, 0, 0, 1, 0, 0);
        if (cast) {
            G.save();
            G.globalCompositeOperation = 'source-atop';
            G.shadowColor = cast.color ?? 'rgba(20,12,30,0.55)';
            G.shadowBlur = (cast.blur ?? 3) * k;
            G.shadowOffsetX = BIG + (cast.dx ?? 2) * k;
            G.shadowOffsetY = (cast.dy ?? 3) * k;
            G.drawImage(sil, -BIG, 0);
            G.restore();
        }
        // `depth`: the part is a slab; its side shows towards the shadow
        const D = depth * k, steps = depth > 0 ? Math.max(2, Math.ceil(D / 1.5)) : 0;
        if (lw > 0) {
            const d = lw * k;
            for (const f of heavy > 0 ? [1, 0.5, 0] : [0]) {
                const ox = SD[0] * (d * heavy * f + D), oy = SD[1] * (d * heavy * f + D);
                for (let i = 0; i < 12; i++) G.drawImage(sil, ox + Math.cos((i * TAU) / 12) * d, oy + Math.sin((i * TAU) / 12) * d);
            }
            for (let j = 0; j < steps; j++) for (let i = 0; i < 12; i++) G.drawImage(sil, (SD[0] * D * j) / steps + Math.cos((i * TAU) / 12) * d, (SD[1] * D * j) / steps + Math.sin((i * TAU) / 12) * d);
        }
        if (steps) {
            const sd = tinted(side), hi = tinted(S.mix(side, '#fff0c0', 0.35));
            for (let j = steps; j >= 1; j--) G.drawImage(j === 1 ? hi : sd, (SD[0] * D * j) / steps, (SD[1] * D * j) / steps);
        }
        G.globalAlpha = alpha;
        G.drawImage(c, 0, 0);
        G.restore();
    }

    // ------------------------------------------------------------------ small tools
    const fillP = (g, pts, style) => {
        g.beginPath();
        S.trace(g, pts);
        g.fillStyle = style;
        g.fill();
    };
    const strokeP = (g, pts, w, style, closed = false) => {
        g.beginPath();
        S.trace(g, pts, closed);
        g.lineWidth = w;
        g.strokeStyle = style;
        g.stroke();
    };
    const disc = (g, p, r, style) => {
        g.beginPath();
        g.arc(p[0], p[1], r, 0, TAU);
        g.fillStyle = style;
        g.fill();
    };
    const clipTo = (g, pts) => {
        g.beginPath();
        S.trace(g, pts);
        g.clip();
    };
    // a soft round patch of colour (on whatever the clip lets through)
    const glow = (g, p, R, color, a) => {
        const gr = g.createRadialGradient(p[0], p[1], 0, p[0], p[1], R);
        gr.addColorStop(0, S.rgba(color, a));
        gr.addColorStop(0.55, S.rgba(color, a * 0.4));
        gr.addColorStop(1, S.rgba(color, 0));
        g.fillStyle = gr;
        g.fillRect(p[0] - R, p[1] - R, R * 2, R * 2);
    };
    // parallel hairlines through a disc of radius R about (cx, cy)
    const hatch = (g, cx, cy, R, a, pitch) => {
        const c = Math.cos(a), s = Math.sin(a);
        g.beginPath();
        for (let d = -R; d <= R; d += pitch) {
            g.moveTo(cx - s * d - c * R, cy + c * d - s * R);
            g.lineTo(cx - s * d + c * R, cy + c * d + s * R);
        }
        g.stroke();
    };
    // The marks of a handled surface, on whatever the clip lets through: fine scratches, some
    // light and some dark, and pits (a dark dot with a lit lip).
    function scuff(g, box, r, { n = 30, len = [2, 9], w = [0.25, 0.5], light = '#fff4cc', dark = '#3a2210', alpha = [0.14, 0.4], dir = null, pits = 0, pit = [0.25, 0.6] } = {}) {
        g.save();
        g.lineCap = 'round';
        for (let i = 0; i < n; i++) {
            const x = box.x + r() * box.w, y = box.y + r() * box.h, l = len[0] + r() * (len[1] - len[0]), a = dir === null ? r() * Math.PI : dir + (r() - 0.5) * 0.5;
            g.strokeStyle = S.rgba(r() < 0.5 ? light : dark, alpha[0] + r() * (alpha[1] - alpha[0]));
            g.lineWidth = w[0] + r() * (w[1] - w[0]);
            g.beginPath();
            g.moveTo(x, y);
            g.quadraticCurveTo(x + Math.cos(a) * l * 0.5 + (r() - 0.5) * l * 0.2, y + Math.sin(a) * l * 0.5 + (r() - 0.5) * l * 0.2, x + Math.cos(a) * l, y + Math.sin(a) * l);
            g.stroke();
        }
        for (let i = 0; i < pits; i++) {
            const x = box.x + r() * box.w, y = box.y + r() * box.h, rr = pit[0] + r() * (pit[1] - pit[0]);
            disc(g, [x + SD[0] * rr * 0.5, y + SD[1] * rr * 0.5], rr, S.rgba(light, 0.35));
            disc(g, [x, y], rr, S.rgba(dark, 0.5 + r() * 0.3));
        }
        g.restore();
    }
    // A round wire along a path: ink under it, the metal, a shade on the side away from the
    // light and a gleam towards it.
    function wire(g, pts, w, P = GOLD, { closed = false, lw = 0.8, heavy = 0.6, cap = 'round' } = {}) {
        g.save();
        g.lineCap = cap;
        g.lineJoin = 'round';
        const st = (dx, dy, width, col) => {
            g.beginPath();
            g.moveTo(pts[0][0] + dx, pts[0][1] + dy);
            for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0] + dx, pts[i][1] + dy);
            if (closed) g.closePath();
            g.lineWidth = width;
            g.strokeStyle = col;
            g.stroke();
        };
        if (lw > 0) {
            st(SD[0] * lw * heavy, SD[1] * lw * heavy, w + lw * 2, P.ink ?? INK);
            st(0, 0, w + lw * 2, P.ink ?? INK);
        }
        st(0, 0, w, P.shade);
        st(TOL[0] * w * 0.13, TOL[1] * w * 0.13, w * 0.68, P.mid);
        st(TOL[0] * w * 0.24, TOL[1] * w * 0.24, w * 0.26, P.light);
        g.restore();
    }
    // Beaded wire: a row of grains along a path, each a tiny ball with its own light.
    function beads(g, pts, rad, P = GOLD, { closed = false, gap = 1.95, lw = 0.45, r = null } = {}) {
        const st = even(pts, rad * gap, closed);
        for (const [x, y] of st) disc(g, [x + SD[0] * lw * 0.6, y + SD[1] * lw * 0.6], rad + lw, P.under ?? P.deep);
        for (const [x, y] of st) {
            const k = r ? 0.9 + r() * 0.2 : 1;
            disc(g, [x, y], rad * k, P.shade);
            disc(g, [x + TOL[0] * rad * 0.18, y + TOL[1] * rad * 0.18], rad * 0.74 * k, P.mid);
            disc(g, [x + TOL[0] * rad * 0.36, y + TOL[1] * rad * 0.36], rad * 0.34 * k, P.glint);
        }
    }

    // ------------------------------------------------------------------ stones
    const STONE = {
        sapphire: { ink: '#0a0e2c', deep: '#0e1646', mid: '#22398f', glow: '#5a8ce0', spark: '#e6efff' },
        azure: { ink: '#0e1638', deep: '#1c2f70', mid: '#3f66b8', glow: '#94b8f0', spark: '#f0f6ff' },
        emerald: { ink: '#06231a', deep: '#0a3526', mid: '#1c6f4c', glow: '#58c48c', spark: '#e4fff0' },
        garnet: { ink: '#25050f', deep: '#480a1c', mid: '#8a1828', glow: '#e4553c', spark: '#ffdccc' },
        amethyst: { ink: '#190a2c', deep: '#35185a', mid: '#69409c', glow: '#b690dc', spark: '#f6eaff' },
        crystal: { ink: '#1c2040', deep: '#565a86', mid: '#a9aecf', glow: '#eef0fb', spark: '#ffffff' },
    };
    // A cabochon in its collet: a polished pebble, never quite round. The light enters at the
    // top left (a hard glint) and gathers on the far side (a glow inside the stone).
    function cabochon(g, c, rx, ry, rot, pal, r, o = {}) {
        const wob = o.wob ?? 0.06, ph = r() * 20, n = 26, cw = o.collet ?? 1.3, R = Math.min(rx, ry), lift = o.lift ?? 1;
        const ca = Math.cos(rot), sa = Math.sin(rot);
        const at = (th, kx, ky = kx) => {
            const px = Math.cos(th) * rx * kx, py = Math.sin(th) * ry * ky;
            return [c[0] + px * ca - py * sa, c[1] + px * sa + py * ca];
        };
        const pts = [], col = [];
        for (let i = 0; i < n; i++) {
            const th = (i / n) * TAU, k = 1 + wob * S.noise2(Math.cos(th) * 1.4 + ph, Math.sin(th) * 1.4, 5);
            pts.push(at(th, k));
            col.push(at(th, k + cw / rx, k + cw / ry));
        }
        if (cw > 0) {
            S.piece(g, col, {
                fill: GOLD.mid, line: o.line ?? 0.8, heavy: 0.7,
                cast: o.cast === false ? null : { blur: 1.5 * lift, dx: 1 * lift, dy: 1.3 * lift, color: 'rgba(36,14,10,0.62)' },
                shade: { color: GOLD.deep, alpha: 0.85, w: cw * 1.7, push: cw },
                light: { color: GOLD.glint, alpha: 0.95, w: cw * 1.1, push: cw * 0.7 },
            });
        }
        S.piece(g, pts, {
            fill: pal.mid, line: 0.5, ink: pal.ink, heavy: 0.3,
            detail: (d) => {
                const b = S.bbox(pts, 1);
                // the light gathered on the far side
                glow(d, [c[0] + SD[0] * R * 0.42, c[1] + SD[1] * R * 0.42], R * 1.15, pal.glow, 0.95);
                // the body of the stone, deep under the glint
                glow(d, [c[0] + TOL[0] * R * 0.5, c[1] + TOL[1] * R * 0.5], R * 1.25, pal.deep, 0.95);
                // it turns down into the collet all round
                d.lineJoin = 'round';
                strokeP(d, pts, R * 0.34, S.rgba(pal.ink, 0.42), true);
                // what is inside it: a veil, a feather, a needle
                d.lineCap = 'round';
                for (let i = 0, m = 1 + Math.floor(r() * 3); i < m; i++) {
                    const a = r() * TAU, p0 = [c[0] + (r() - 0.5) * R, c[1] + (r() - 0.5) * R], l = R * (0.3 + r() * 0.6);
                    strokeP(d, [p0, [p0[0] + Math.cos(a) * l * 0.5 + (r() - 0.5) * R * 0.2, p0[1] + Math.sin(a) * l * 0.5], [p0[0] + Math.cos(a) * l, p0[1] + Math.sin(a) * l]], 0.22 + r() * 0.25, S.rgba(r() < 0.6 ? pal.spark : pal.ink, 0.25 + r() * 0.3));
                }
                // the far rim catches a thread of light
                const fa = Math.atan2(SD[1], SD[0]);
                S.ink(d, arc(c, R * 0.86, fa - 0.7, fa + 0.7, 10).map((p) => [c[0] + (p[0] - c[0]) * (rx / R), c[1] + (p[1] - c[1]) * (ry / R)]), { w: R * 0.11, color: pal.spark, alpha: 0.5 });
                // gloss: a short fat streak and a dash under it
                const hx = c[0] + TOL[0] * R * 0.46, hy = c[1] + TOL[1] * R * 0.46, ha = Math.atan2(TOL[1], TOL[0]) + Math.PI / 2;
                d.fillStyle = S.rgba(pal.spark, 0.95);
                d.beginPath();
                d.ellipse(hx, hy, R * 0.3, R * 0.14, ha, 0, TAU);
                d.fill();
                d.fillStyle = S.rgba(pal.spark, 0.7);
                d.beginPath();
                d.ellipse(hx + Math.cos(ha) * R * 0.42 + SD[0] * R * 0.1, hy + Math.sin(ha) * R * 0.42 + SD[1] * R * 0.1, R * 0.1, R * 0.07, ha, 0, TAU);
                d.fill();
                if (o.detail) o.detail(d, b);
            },
        });
        return pts;
    }
    // A pearl: a lilac-grey form shadow, warm light thrown back from the gold, a soft bloom
    // and a small hard glint; old ones are yellowed, drilled, sometimes flaked.
    function pearl(g, c, R, r, o = {}) {
        const age = o.age ?? r(), base = S.mix('#f3eee2', '#e2cfa2', age * 0.65);
        const pts = S.ellipse(c[0], c[1], R * (1 + (r() - 0.5) * 0.1), R * (1 + (r() - 0.5) * 0.1), 20, r() * 3);
        S.piece(g, pts, {
            fill: base, line: o.line ?? 0.55, ink: '#342a44', heavy: 0.5,
            cast: o.cast === false ? null : { blur: 1.3, dx: 0.9, dy: 1.2, color: 'rgba(36,14,10,0.6)' },
            shade: [{ color: '#8f8db0', alpha: 0.8, w: R * 1.2, push: R * 0.6 }, { color: '#5b5578', alpha: 0.5, w: R * 0.5, push: R * 0.22 }],
            detail: (d) => {
                // orient: a breath of rose and of green in the half-light
                glow(d, [c[0] + R * 0.3, c[1] - R * 0.25], R * 0.7, '#f2b8c0', 0.3);
                glow(d, [c[0] - R * 0.35, c[1] + R * 0.35], R * 0.7, '#b8e0cc', 0.3);
                // the gold under it, thrown back into the shadow's rim
                const fa = Math.atan2(SD[1], SD[0]);
                S.ink(d, arc(c, R * 0.84, fa - 0.8, fa + 0.8, 10), { w: R * 0.2, color: '#e8b45c', alpha: 0.55 });
                if (age > 0.72) {
                    // a layer of nacre flaked away
                    const a = r() * TAU, f = S.ellipse(c[0] + Math.cos(a) * R * 0.45, c[1] + Math.sin(a) * R * 0.45, R * 0.36, R * 0.22, 9, a + 1.2);
                    fillP(d, f, 'rgba(150,128,96,0.5)');
                    strokeP(d, f, 0.25, 'rgba(60,44,40,0.5)', true);
                }
                glow(d, [c[0] + TOL[0] * R * 0.38, c[1] + TOL[1] * R * 0.38], R * 0.6, '#ffffff', 0.9);
                disc(d, [c[0] + TOL[0] * R * 0.42, c[1] + TOL[1] * R * 0.42], R * 0.13, 'rgba(255,255,255,0.95)');
                if (o.hole ?? r() < 0.4) {
                    // drilled, and pinned with a gold wire
                    const h = [c[0] + (r() - 0.5) * R * 0.3, c[1] + (r() - 0.5) * R * 0.3];
                    disc(d, [h[0] + 0.15, h[1] + 0.2], R * 0.2, 'rgba(255,250,236,0.7)');
                    disc(d, h, R * 0.17, '#4a3020');
                    disc(d, [h[0] - R * 0.03, h[1] - R * 0.04], R * 0.08, GOLD.light);
                }
            },
        });
    }

    // A flat stone, glass or shell set in one cell of a cloisonné: garnets lie on a foil of
    // gold stamped with a waffle, which shows where the plate is thin; every plate sits at
    // its own tilt, so one in five mirrors the lamp.
    const INLAY = {
        garnet: { deep: '#3c0818', mid: '#8c1727', hot: '#b83a2a', foil: '#ff9a5a', glow: '#e04a36', spark: '#ffd8c6' },
        blue: { deep: '#16296a', mid: '#3460b0', hot: '#5f8fd0', foil: '#b8d4ff', glow: '#7aa8ec', spark: '#eaf2ff' },
        green: { deep: '#0e3f2c', mid: '#23825a', hot: '#58a878', foil: '#c4f0c8', glow: '#62c890', spark: '#e8fff0' },
    };
    function inlay(g, pts, kind, r) {
        const b = S.bbox(pts), cx = b.x + b.w / 2, cy = b.y + b.h / 2, R = Math.hypot(b.w, b.h) / 2 + 0.5;
        g.save();
        clipTo(g, pts);
        if (kind === 'shell') {
            // white shell (or meerschaum): matt, crazed, yellowed in its cracks
            g.fillStyle = S.mix('#efe8d6', '#d8cbb0', r() * 0.6);
            g.fillRect(b.x - 1, b.y - 1, b.w + 2, b.h + 2);
            glow(g, [cx + SD[0] * R * 0.6, cy + SD[1] * R * 0.6], R * 1.1, '#8f8db0', 0.5);
            glow(g, [cx + TOL[0] * R * 0.4, cy + TOL[1] * R * 0.4], R * 0.8, '#fffdf4', 0.6);
            g.lineCap = 'round';
            for (let i = 0, n = 2 + Math.floor(r() * 3); i < n; i++) {
                const p0 = [b.x + r() * b.w, b.y + r() * b.h], a = r() * TAU, l = R * (0.5 + r() * 0.8);
                strokeP(g, [p0, [p0[0] + Math.cos(a) * l * 0.5 + (r() - 0.5) * 1.2, p0[1] + Math.sin(a) * l * 0.5 + (r() - 0.5) * 1.2], [p0[0] + Math.cos(a) * l, p0[1] + Math.sin(a) * l]], 0.28, `rgba(120,84,48,${0.35 + r() * 0.3})`);
            }
            for (let i = 0; i < 5; i++) disc(g, [b.x + r() * b.w, b.y + r() * b.h], 0.2 + r() * 0.25, 'rgba(110,80,50,0.4)');
        } else if (kind === 'empty') {
            // the stone is gone: the crumpled foil, the grey paste that bedded it, dirt
            g.fillStyle = '#6a4718';
            g.fillRect(b.x - 1, b.y - 1, b.w + 2, b.h + 2);
            const a = r() * Math.PI;
            g.lineWidth = 0.36;
            g.strokeStyle = 'rgba(244,206,110,0.75)';
            hatch(g, cx, cy, R, a, 1.35);
            hatch(g, cx, cy, R, a + Math.PI / 2, 1.35);
            g.strokeStyle = 'rgba(52,28,10,0.5)';
            hatch(g, cx + 0.4, cy + 0.45, R, a, 1.35);
            for (let i = 0; i < 3; i++) {
                const p = [b.x + r() * b.w, b.y + r() * b.h];
                fillP(g, S.ellipse(p[0], p[1], 0.8 + r() * 1.3, 0.5 + r() * 0.8, 8, r() * 3), `rgba(196,190,172,${0.5 + r() * 0.3})`);
            }
            // the walls stand over the empty floor: a deep shadow under the lit side
            glow(g, [cx + TOL[0] * R * 0.7, cy + TOL[1] * R * 0.7], R * 1.2, '#1c0c06', 0.85);
            glow(g, [cx + SD[0] * R * 0.5, cy + SD[1] * R * 0.5], R * 0.7, '#f6dc8a', 0.3);
        } else {
            const P = INLAY[kind], u = r();
            const base = u > 0.86 && kind === 'garnet' ? S.mix(P.mid, P.hot, 0.6) : S.mix(P.deep, P.mid, u / 0.86);
            g.fillStyle = base;
            g.fillRect(b.x - 1, b.y - 1, b.w + 2, b.h + 2);
            // the foil under it
            const a = r() * Math.PI, p = 1.2 + r() * 0.5, al = (kind === 'garnet' ? 0.2 : 0.1) + r() * 0.3;
            g.lineWidth = 0.34;
            g.strokeStyle = S.rgba(P.foil, al);
            hatch(g, cx, cy, R, a, p);
            hatch(g, cx, cy, R, a + Math.PI / 2, p);
            // deep under the lit wall, glowing on the far side
            glow(g, [cx + SD[0] * R * 0.45, cy + SD[1] * R * 0.45], R * 0.95, P.glow, 0.12 + r() * 0.4);
            glow(g, [cx + TOL[0] * R * 0.7, cy + TOL[1] * R * 0.7], R * 1.1, '#16041a', 0.55);
            if (kind !== 'garnet') {
                // glass: seeds and a cord
                for (let i = 0; i < 4; i++) disc(g, [b.x + r() * b.w, b.y + r() * b.h], 0.18 + r() * 0.22, S.rgba(P.spark, 0.5));
                const p0 = [b.x + r() * b.w, b.y + r() * b.h];
                strokeP(g, [p0, [p0[0] + (r() - 0.5) * R, p0[1] + (r() - 0.5) * R], [p0[0] + (r() - 0.5) * R * 1.6, p0[1] + (r() - 0.5) * R * 1.6]], 0.3, S.rgba(P.deep, 0.5));
            }
            const flaw = r();
            if (flaw < 0.16) {
                // cracked across
                const a2 = r() * TAU, q0 = [cx - Math.cos(a2) * R, cy - Math.sin(a2) * R], q1 = [cx + Math.cos(a2) * R, cy + Math.sin(a2) * R], mid = [cx + (r() - 0.5) * R * 0.5, cy + (r() - 0.5) * R * 0.5];
                strokeP(g, [q0, mid, q1], 0.32, 'rgba(20,4,12,0.75)');
                strokeP(g, [[q0[0] + 0.3, q0[1] + 0.35], [mid[0] + 0.3, mid[1] + 0.35], [q1[0] + 0.3, q1[1] + 0.35]], 0.22, S.rgba(P.spark, 0.5));
            } else if (flaw < 0.26) {
                // a corner chipped: the foil shows
                const i = Math.floor(r() * pts.length), c0 = pts[i], cm = [cx, cy], chip = [c0, lerpP(pts[(i + 1) % pts.length], c0, 0.35), lerpP(c0, cm, 0.3), lerpP(pts[(i - 1 + pts.length) % pts.length], c0, 0.35)];
                fillP(g, chip, '#6a4718');
                strokeP(g, chip, 0.25, 'rgba(244,206,110,0.7)', true);
            }
            const sheen = r();
            if (sheen < 0.13) {
                // this plate faces the lamp: a broad pale reflection with a hard edge
                const a2 = -0.9 + (r() - 0.5) * 0.5, off = (r() - 0.5) * R * 0.5, c = Math.cos(a2), s = Math.sin(a2);
                const q = (u1, v1) => [cx + c * u1 - s * v1, cy + s * u1 + c * v1];
                fillP(g, [q(-R * 1.5, off - R), q(R * 1.5, off - R), q(R * 1.5, off), q(-R * 1.5, off)], S.rgba(P.spark, 0.26 + r() * 0.16));
                fillP(g, [q(-R * 1.5, off + R * 0.16), q(R * 1.5, off + R * 0.16), q(R * 1.5, off + R * 0.28), q(-R * 1.5, off + R * 0.28)], S.rgba(P.spark, 0.2));
            } else if (sheen < 0.86) {
                // a short gleam near the lit corner
                const h = [cx + TOL[0] * R * (0.25 + r() * 0.2) + (r() - 0.5) * R * 0.3, cy + TOL[1] * R * (0.25 + r() * 0.2) + (r() - 0.5) * R * 0.3], ha = Math.atan2(TOL[1], TOL[0]) + Math.PI / 2 + (r() - 0.5) * 0.6;
                g.fillStyle = S.rgba(P.spark, 0.6 + r() * 0.35);
                g.beginPath();
                g.ellipse(h[0], h[1], Math.min(2.6, R * 0.32), Math.min(0.9, R * 0.12), ha, 0, TAU);
                g.fill();
            }
        }
        g.restore();
    }
    // The cell walls of a cloisonné: fine bright gold lines, each with its shadow on the stone
    // to its lower right, and a thread of light on its crest.
    function walls(g, polys, w = 1.1, r = null) {
        g.save();
        g.lineJoin = 'round';
        const all = (dx, dy, width, col) => {
            g.save();
            g.translate(dx, dy);
            g.lineWidth = width;
            g.strokeStyle = col;
            for (const p of polys) {
                g.beginPath();
                S.trace(g, p);
                g.stroke();
            }
            g.restore();
        };
        all(SD[0] * w * 0.62, SD[1] * w * 0.62, w * 1.05, 'rgba(34,12,10,0.72)');
        all(0, 0, w, '#c08c30');
        all(TOL[0] * w * 0.12, TOL[1] * w * 0.12, w * 0.62, '#f0cf78');
        all(TOL[0] * w * 0.26, TOL[1] * w * 0.26, w * 0.22, 'rgba(255,248,214,0.85)');
        if (r) {
            // solder: a grain of gold where walls meet
            for (const p of polys) {
                if (r() < 0.3) {
                    const v = p[Math.floor(r() * p.length)];
                    disc(g, v, w * (0.5 + r() * 0.35), '#e6bc5c');
                    disc(g, [v[0] + TOL[0] * w * 0.2, v[1] + TOL[1] * w * 0.2], w * 0.22, 'rgba(255,248,214,0.8)');
                }
            }
        }
        g.restore();
    }
    // a group of shapes as one silhouette, grown by `grow`
    const union = (g, polys, grow, style, dx = 0, dy = 0) => {
        g.save();
        g.translate(dx, dy);
        g.lineJoin = 'round';
        g.fillStyle = g.strokeStyle = style;
        g.lineWidth = grow * 2;
        for (const p of polys) {
            g.beginPath();
            S.trace(g, p);
            g.fill();
            if (grow > 0) g.stroke();
        }
        g.restore();
    };

    // ================================================================== 1 · the eagle fibula
    // VISIGOTHS, 6th century. An eagle brooch in gold cloisonné, of the type of the pair from
    // Tierra de Barros (Badajoz; Walters Art Museum) and the pair from Alovera (Madrid, MAN):
    // worn in pairs at the shoulders, the two birds facing each other.
    //   Anatomy: a sheet-gold cell work on a bronze back plate. The bird is heraldic: body
    //   frontal, head in profile with a hooked beak and a round eye; a round boss on the breast
    //   with a cabochon at its centre; short wings hanging at the sides and a spread tail, both
    //   laid out as fans of long cells; loops under the tail for pendants.
    //   1 garnets cut as flat plates, each bedded on gold foil stamped with a waffle that
    //   shows through the thin ones  2 every garnet its own depth of red, a few orange, a few
    //   near black  3 one plate in five mirrors the lamp as a pale sheet with a hard edge
    //   4 blue and green glass with seeds, white shell crazed and yellowed  5 two stones lost:
    //   empty cells with the crumpled foil, grey bedding paste and dirt  6 a cracked garnet, a
    //   chipped corner  7 cell walls as bright lines with a shadow to the lower right, grains
    //   of solder where they meet  8 beaded wire round the boss, the cabochons in collets
    //   9 three loops under the tail, one pulled out of shape, a last link of a lost pendant
    //   10 the gold worn through at an edge: the bronze under it gone green; scratches on
    //   the rim.
    function eagle(g, o = {}) {
        const { x = 0, y = 0, s = 1, rot = 0, seed = 1, flip = false } = o;
        const F = frame(rot, flip ? -1 : 1, 0, 3.2);
        sheet(g, x, y, s, reach({ x: -68, y: -106, w: 136, h: 214 }, rot), (q0) => {
            let q = q0;
            const r = Motion.rng('heirloom-eagle/' + seed);
            const RIM = 2, LW = 2;
            // a fan about A: angles from straight down (towards +x), tiers between radii that
            // may depend on the angle; `cap` rounds a cell's far end as a feather's tip
            const fanPt = (A, a, rr, mx = 1) => [A[0] + Math.sin(a) * rr * mx, A[1] + Math.cos(a) * rr];
            const fanCells = (A, a0, a1, tiers, mx = 1) => {
                const out = [];
                tiers.forEach((T, ti) => {
                    const ed = [];
                    for (let i = 0; i <= T.n; i++) ed.push(a0 + ((a1 - a0) * (i + (i > 0 && i < T.n ? (r() - 0.5) * 0.24 : 0))) / T.n);
                    for (let i = 0; i < T.n; i++) {
                        const pts = [], m = T.cap ? 10 : 5;
                        for (let k = 0; k <= 4; k++) {
                            const a = lerp(ed[i], ed[i + 1], k / 4);
                            pts.push(fanPt(A, a, T.r0(a), mx));
                        }
                        for (let k = m; k >= 0; k--) {
                            const t = k / m, a = lerp(ed[i], ed[i + 1], t);
                            const c = T.cap ? T.cap * (1 - Math.sqrt(Math.max(0, 1 - Math.pow(Math.abs(2 * t - 1), 2.6)))) : 0;
                            pts.push(fanPt(A, a, T.r1(a) - c, mx));
                        }
                        out.push({ pts: F.pts(pts), kind: T.kinds[i % T.kinds.length], tier: ti });
                    }
                });
                return out;
            };
            // a ring of cells about a centre
            const ringCells = (C, r0, r1, n, kinds, a00 = 0) => {
                const out = [];
                for (let i = 0; i < n; i++) {
                    const a0 = a00 + (i / n) * TAU, a1 = a00 + ((i + 1) / n) * TAU;
                    out.push({ pts: F.pts([...arc(C, r0, a0, a1, 4), ...arc(C, r1, a1, a0, 6)]), kind: kinds[i % kinds.length] });
                }
                return out;
            };
            const G = 'garnet', B = 'blue', V = 'green', W = 'shell';

            // ---- the plan
            const tail = fanCells([0, -22], -0.335, 0.335, [
                { n: 5, r0: () => 57, r1: () => 74, kinds: [G, G, V, G, G] },
                { n: 6, r0: () => 74, r1: () => 92, kinds: [G, W, G, G, B, G] },
                { n: 7, r0: () => 92, r1: (a) => 115 - 26 * a * a, cap: 5, kinds: [G, G, B, G, G, V, G] },
            ]);
            const wingTiers = [
                { n: 2, r0: () => 7, r1: (a) => 0.27 * wr(a), kinds: [G, W] },
                { n: 5, r0: (a) => 0.27 * wr(a), r1: (a) => 0.54 * wr(a), cap: 2, kinds: [G, V, G, G, B] },
                { n: 7, r0: (a) => 0.54 * wr(a), r1: (a) => wr(a), cap: 4.2, kinds: [G, G, G, B, G, G, V] },
            ];
            const wa0 = 0.06, wa1 = 1.1;
            function wr(a) {
                const t = (a - wa0) / (wa1 - wa0);
                return 83 - 34 * Math.pow(Math.max(0, t), 1.25);
            }
            const wingR = fanCells([18.5, -42], wa0, wa1, wingTiers, 1), wingL = fanCells([-18.5, -42], wa0, wa1, wingTiers, -1);
            const BC = [0, -3];
            const bodyOut = F.pts(S.ellipse(0, -3, 29.5, 44.5, 56));
            const body = [
                ...ringCells(BC, 20.5, 31, 14, [G, G, G, V, G, G, B], 0.13),
                ...ringCells(BC, 31, 47, 20, [G, G, B, G, G, G, W, G, G, V], 0.05),
            ];
            // the neck: three courses of cells, each bowed like a collar
            const neck = [], neckOut = [];
            {
                const row = (y0, y1, hw0, hw1, n, kinds, bow) => {
                    for (let i = 0; i < n; i++) {
                        const u0 = i / n, u1 = (i + 1) / n, pts = [];
                        for (let k = 0; k <= 4; k++) {
                            const u = lerp(u0, u1, k / 4);
                            pts.push([lerp(-hw0, hw0, u) + 1, y0 + bow * (1 - Math.pow(2 * u - 1, 2))]);
                        }
                        for (let k = 4; k >= 0; k--) {
                            const u = lerp(u0, u1, k / 4);
                            pts.push([lerp(-hw1, hw1, u) + 0.5, y1 + bow * (1 - Math.pow(2 * u - 1, 2))]);
                        }
                        neck.push({ pts: F.pts(pts), kind: kinds[i] });
                    }
                };
                row(-44, -54, 13, 11.5, 3, [G, W, G], 2.2);
                row(-54, -62.5, 11.5, 10.2, 2, [G, G], 2);
                row(-62.5, -70, 10.2, 9.4, 3, [G, V, G], 1.6);
            }
            // the head, in profile: crown, brow, the hooked beak, the throat
            const E = [-4.5, -85];
            const headL = S.curve([[10, -66], [11.5, -78], [9.5, -89], [3.5, -97.5], [-5, -100.5], [-13, -98.5], [-19.5, -93.5], [-27, -91.5], [-33, -87], [-36, -80], [-35.4, -73.4], [-34.6, -70.2], [-34.6, -70.2], [-32.2, -73.4], [-29.5, -77], [-25, -79.2], [-21.5, -78.2], [-20, -74.5], [-15.5, -70.6], [-11, -67.5], [-9.5, -64], [-9, -62], [9, -62]], true, 6);
            const headOut = F.pts(headL);
            const head = [];
            {
                // cells about the eye: brow, crown, nape, throat; the beak beyond the cere's wall
                const wed = [[-2.9, -1.95, G, 46], [-1.95, -1.0, G, 46], [-1.0, 0.05, G, 46], [0.05, 1.0, G, 46], [1.0, 1.8, G, 46], [1.8, 2.55, V, 46], [2.55, 3.383, B, 13.2]];
                for (const [a0, a1, kind, r1] of wed) head.push({ pts: F.pts([...arc(E, 7.2, a0, a1, 5), ...arc(E, r1, a1, a0, 5)]), kind });
                head.push({ pts: F.pts([...arc(E, 13.2, 2.55, 3.383, 5), ...arc(E, 46, 3.383, 2.55, 3)]), kind: W });
            }
            const all = [...tail, ...wingL, ...wingR, ...body, ...neck, ...head];
            // two stones are gone
            // made by hand: every wall wanders a little (the same for the two cells that share it)
            const hand = (p) => [p[0] + 0.42 * S.noise2(p[0] * 0.33, p[1] * 0.33, 41), p[1] + 0.42 * S.noise2(p[0] * 0.33, p[1] * 0.33, 42)];
            for (const c of all) c.pts = c.pts.map(hand);
            const garnets = all.filter((c) => c.kind === G && (c.tier ?? 1) > 0);
            for (let i = 0; i < 2; i++) garnets[Math.floor(r() * garnets.length)].kind = 'empty';

            // ---- the loops under the tail (soldered to the back plate, so under it)
            const loops = [[-23, 94.5, 0], [0, 99, 0], [23.5, 94.5, 1]];
            for (const [lx, ly, bent] of loops) {
                const c = [lx, ly + 3.2];
                const ring = bent ? S.curve([[lx - 3, ly], [lx - 4.6, ly + 4], [lx - 1.5, ly + 8.4], [lx + 3.4, ly + 7], [lx + 4.4, ly + 2.6], [lx + 2.6, ly - 0.5]], true, 5) : S.ellipse(c[0], c[1], 3.9, 4.3, 22);
                wire(q, F.pts(ring), 1.7, GOLD, { closed: true, lw: 1.1 });
                if (bent) {
                    // the last link of a lost pendant still hangs in it
                    wire(q, F.pts(S.ellipse(lx + 1.6, ly + 11.6, 2.1, 3.6, 16, 0.25)), 1.05, GOLD, { closed: true, lw: 0.8 });
                }
            }
            // ---- the plate is painted on a sheet of its own, airbrushed whole, then laid down
            // with one contour (heavier towards the shadow)
            const main = q;
            q = like(main);
            const polys = [...tail.map((c) => c.pts), ...wingL.map((c) => c.pts), ...wingR.map((c) => c.pts), bodyOut, ...neck.map((c) => c.pts), headOut];
            // ---- region by region: the gold back plate, the stones, the walls
            const plate = (ps) => {
                union(q, ps, RIM, '#c9922f');
                union(q, ps, RIM * 0.55, GOLD.mid, TOL[0] * 0.35, TOL[1] * 0.35);
            };
            const set = (cells, clip = null) => {
                q.save();
                if (clip) clipTo(q, clip);
                for (const c of cells) inlay(q, c.pts, c.kind, r);
                walls(q, cells.map((c) => c.pts), 1.1, r);
                q.restore();
                if (clip) walls(q, [clip], 1.1);
            };
            plate(tail.map((c) => c.pts));
            set(tail);
            plate([...neck.map((c) => c.pts), headOut]);
            set(neck);
            set(head, headOut);
            plate([bodyOut]);
            set(body, bodyOut);
            for (const wing of [wingL, wingR]) {
                const ps = wing.map((c) => c.pts);
                S.cast(q, (d) => union(d, ps, RIM, '#000'), { blur: 2.4, dx: 1.4, dy: 1.9, color: 'rgba(30,10,14,0.6)' });
                union(q, ps, RIM + 0.7, '#3a2010');
                plate(ps);
                set(wing);
            }
            // the beak: its gape, the nostril, the cere's edge
            q.lineCap = 'round';
            S.ink(q, F.pts(S.curve([[-33.4, -72.6], [-29.6, -76.6], [-25, -78.8], [-20.6, -77.6], [-17, -78.6]], false, 6)), { w: 1.3, color: INK, taper: [0.2, 0.9] });
            disc(q, F([-26.6, -86.4]), 0.9, '#2a1410');
            // ---- the boss on the breast: beaded wire, a ring of cells, a cabochon
            {
                const ringOut = F.pts(S.ellipse(BC[0], BC[1], 19.6, 19.6, 48));
                S.cast(q, (d) => fillP(d, ringOut, '#000'), { blur: 3.2, dx: 2, dy: 2.7, color: 'rgba(30,8,12,0.7)' });
                S.piece(q, ringOut, {
                    fill: GOLD.mid, line: 0.9, heavy: 0.8, ink: '#2a1410',
                    shade: { color: GOLD.shade, alpha: 0.9, w: 5, push: 3 },
                    light: { color: GOLD.glint, alpha: 0.8, w: 3, push: 2 },
                });
                const ring = ringCells(BC, 8.6, 15.6, 10, [G, G, V, G, G, G, B, G, G, W], 0.2);
                set(ring);
                beads(q, F.pts(S.ellipse(BC[0], BC[1], 17.7, 17.7, 64)), 1.02, GOLD, { closed: true, r });
                cabochon(q, F(BC), 6.2, 6.2, 0, STONE.crystal, r, { collet: 1.7, lift: 1.4, wob: 0.04 });
            }
            // the eye
            cabochon(q, F(E), 4.6, 4.6, 0, STONE.amethyst, r, { collet: 1.5, lift: 1.1, wob: 0.04 });
            // ---- the whole brooch as one low dome under the lamp
            air(q, { color: '#30100c', alpha: 0.5, w: 15, push: 8 });
            air(q, { color: '#200a14', alpha: 0.45, w: 4, push: 2 });
            air(q, { color: '#fff0c0', alpha: 0.32, w: 10, push: 6, dir: TOL });
            // ---- wear: the rim scratched, the bronze showing green where the gold is through
            q.save();
            q.globalCompositeOperation = 'source-atop';
            scuff(q, reach({ x: -66, y: -104, w: 132, h: 210 }, rot, 0), r, { n: 120, len: [1.5, 7], w: [0.2, 0.42], alpha: [0.12, 0.38] });
            for (const [px, py, rr] of [[36.5, 92, 3.2], [-63.5, -14, 2.4], [12.2, -76, 1.8]]) {
                const c = F([px, py]);
                for (let i = 0; i < 7; i++) fillP(q, S.ellipse(c[0] + (r() - 0.5) * rr * 1.6, c[1] + (r() - 0.5) * rr * 1.6, rr * (0.2 + r() * 0.35), rr * (0.15 + r() * 0.3), 8, r() * 3), S.rgba(r() < 0.6 ? '#3f8a70' : '#7ab89a', 0.55 + r() * 0.35));
                disc(q, [c[0] + (r() - 0.5) * rr, c[1] + (r() - 0.5) * rr], rr * 0.3, 'rgba(60,34,20,0.7)');
            }
            q.restore();
            stampOn(main, q, { lw: 1.9, heavy: 0.8, cast: { blur: 2, dx: 1.2, dy: 1.6, color: 'rgba(20,10,30,0.6)' } });
        });
    }

    // ================================================================== 6 · the alicatado
    // AL-ANDALUS, Nasrid Granada, 14th century. A panel of cut-tile mosaic as in the dados of
    // the Alhambra (Comares, the Mexuar): every shape is nibbled out of a glazed tile of one
    // colour and the panel is assembled face down and backed with plaster.
    //   Geometry (exact): the eight-fold rosette of the 4.8.8 lattice. In every octagon the
    //   eight chords that join edge midpoints three apart make the eight-pointed star (two
    //   squares, the «sello») with a ring of eight kites round it; each lattice vertex gives a
    //   hexagon, each lattice square a four-pointed star. The chords are the centre lines of
    //   the white «lazo»: two bands cross at every edge midpoint and star point, turn at every
    //   star notch, and pass over and under by turns.
    //   1 five glazes only: tin white, cobalt blue, copper green, honey, manganese purple-black
    //   2 no two pieces of one glaze quite the same tone  3 the glaze ran before it set: it
    //   pools darker towards one edge of a piece and thins on the arris  4 each piece has a
    //   lit and a shaded arris (cut with a bevel, set by hand, never quite level)  5 plaster
    //   in the joints, greyer with dirt low down  6 the lazo is pieced: a strip runs over one
    //   crossing and butts against the next, mitred where it turns  7 crazing, pinholes, a
    //   chipped corner showing the buff biscuit  8 a glint on a few  9 a piece or two gone,
    //   the plaster keeping their print; one replaced in the wrong colour  10 one corner
    //   broken away: the tiles' thickness, the plaster bed with the ridges that stood between
    //   the lost pieces.
    const GLAZE = {
        white: { base: '#dfd8c4', deep: '#a9a089', light: '#f3efe2', edge: '#c9b894' },
        blue: { base: '#1f3d86', deep: '#0d1e54', light: '#4467b4', edge: '#8ea6d6' },
        green: { base: '#1b735a', deep: '#0a3d31', light: '#45a082', edge: '#9cd0b4' },
        honey: { base: '#b87420', deep: '#733b0f', light: '#dca046', edge: '#edcf90' },
        black: { base: '#2c1a30', deep: '#130a19', light: '#573758', edge: '#927486' },
    };
    const BISCUIT = '#c8946c', PLASTER = '#d2c8b2';
    // one cut piece of glazed tile
    function tile(g, pts, kind, r, k = 1) {
        const P = GLAZE[kind], b = S.bbox(pts), c = centroid(pts), R = Math.hypot(b.w, b.h) / 2, u = r();
        g.save();
        clipTo(g, pts);
        g.fillStyle = u < 0.5 ? S.mix(P.base, P.deep, (0.5 - u) * 1.1) : S.mix(P.base, P.light, (u - 0.5) * 0.75);
        g.fillRect(b.x - 1, b.y - 1, b.w + 2, b.h + 2);
        // the glaze ran before it set: thin and pale at one edge, pooled and dark at the other
        const a = r() * TAU, dx = Math.cos(a) * R, dy = Math.sin(a) * R;
        const gd = g.createLinearGradient(c[0] - dx, c[1] - dy, c[0] + dx, c[1] + dy);
        gd.addColorStop(0, S.rgba(P.light, 0.25 + r() * 0.3));
        gd.addColorStop(0.4, S.rgba(P.light, 0));
        gd.addColorStop(0.62, S.rgba(P.deep, 0));
        gd.addColorStop(1, S.rgba(P.deep, 0.5 + r() * 0.4));
        g.fillStyle = gd;
        g.fillRect(b.x - 1, b.y - 1, b.w + 2, b.h + 2);
        for (let i = 0; i < 2; i++) glow(g, [b.x + r() * b.w, b.y + r() * b.h], R * (0.3 + r() * 0.4), r() < 0.5 ? P.deep : P.light, 0.3);
        // the brush that laid the glaze, the specks in it
        g.lineCap = 'round';
        const sa = r() * Math.PI;
        for (let i = 0, n = Math.round(2 + R * 0.5); i < n; i++) {
            const p0 = [b.x + r() * b.w, b.y + r() * b.h], l = R * (0.3 + r() * 0.7);
            strokeP(g, [p0, [p0[0] + Math.cos(sa) * l, p0[1] + Math.sin(sa) * l]], 0.3 + r() * 0.5, S.rgba(r() < 0.5 ? P.light : P.deep, 0.12 + r() * 0.16));
        }
        for (let i = 0, n = Math.round(R * 0.5); i < n; i++) disc(g, [b.x + r() * b.w, b.y + r() * b.h], 0.14 + r() * 0.2, S.rgba(r() < 0.6 ? P.deep : P.edge, 0.5));
        // the arris: glaze thin on the cut edge; lit towards the lamp, shaded away from it
        g.lineJoin = 'round';
        strokeP(g, pts, 0.8, S.rgba(P.edge, 0.38), true);
        g.save();
        g.translate(SD[0] * 0.5, SD[1] * 0.5);
        strokeP(g, pts, 0.55, S.rgba('#fffaea', kind === 'black' || kind === 'blue' ? 0.4 : 0.55), true);
        g.restore();
        g.save();
        g.translate(TOL[0] * 0.55, TOL[1] * 0.55);
        strokeP(g, pts, 0.75, S.rgba(P.deep, 0.75), true);
        g.restore();
        const f = r();
        if (f < 0.22) {
            // crazed
            for (let i = 0, n = 1 + Math.floor(r() * 3); i < n; i++) {
                const p0 = [b.x + r() * b.w, b.y + r() * b.h], a2 = r() * TAU, l = R * (0.5 + r() * 0.8);
                strokeP(g, [p0, [p0[0] + Math.cos(a2) * l * 0.5 + (r() - 0.5) * 1.5, p0[1] + Math.sin(a2) * l * 0.5 + (r() - 0.5) * 1.5], [p0[0] + Math.cos(a2) * l, p0[1] + Math.sin(a2) * l]], 0.22, S.rgba(kind === 'white' ? '#6a5a44' : P.edge, 0.5));
            }
        } else if (f < 0.34 && R > 5) {
            // a corner knocked off: the buff biscuit under the glaze
            const i = Math.floor(r() * pts.length), n = pts.length, c0 = pts[i], d = 1.4 + r() * 2.2;
            const pa = pts[(i - 1 + n) % n], pb = pts[(i + 1) % n], la = Math.hypot(pa[0] - c0[0], pa[1] - c0[1]) || 1, lb = Math.hypot(pb[0] - c0[0], pb[1] - c0[1]) || 1;
            const chip = [c0, [c0[0] + ((pa[0] - c0[0]) / la) * d, c0[1] + ((pa[1] - c0[1]) / la) * d], [c0[0] + (c[0] - c0[0]) * 0.12 + (r() - 0.5) * 0.6, c0[1] + (c[1] - c0[1]) * 0.12 + (r() - 0.5) * 0.6], [c0[0] + ((pb[0] - c0[0]) / lb) * d * 0.8, c0[1] + ((pb[1] - c0[1]) / lb) * d * 0.8]];
            fillP(g, chip, S.mix(BISCUIT, '#8a5c40', r() * 0.5));
            strokeP(g, chip, 0.3, S.rgba(P.deep, 0.7), true);
        }
        const gl = r();
        if (gl < 0.1 && R > 5) {
            // a glint: a short fat streak and a dash, each piece at its own tilt
            const h = [c[0] + TOL[0] * R * 0.25 + (r() - 0.5) * R * 0.5, c[1] + TOL[1] * R * 0.25 + (r() - 0.5) * R * 0.5], ha = Math.atan2(TOL[1], TOL[0]) + Math.PI / 2 + (r() - 0.5) * 1.2, l = Math.min(3, R * (0.14 + r() * 0.16));
            g.fillStyle = `rgba(255,253,244,${0.45 + r() * 0.35})`;
            g.beginPath();
            g.ellipse(h[0], h[1], l, l * 0.28, ha, 0, TAU);
            g.fill();
            g.beginPath();
            g.ellipse(h[0] + Math.cos(ha) * l * 1.6, h[1] + Math.sin(ha) * l * 1.6, l * 0.26, l * 0.18, ha, 0, TAU);
            g.fill();
        } else if (gl < 0.24 && R > 5) {
            // or the sky in it: a pale veil over the half that faces the lamp
            glow(g, [c[0] + TOL[0] * R * 0.5, c[1] + TOL[1] * R * 0.5], R * 0.9, '#f4f0ff', 0.2 + r() * 0.16);
        }
        g.restore();
    }
    // The pattern on a lattice of period T: the coloured pieces (already moved in to leave room
    // for the lazo) and the white strips, pieced as a tiler pieces them.
    function lazo(T, x0, y0, x1, y1, hb, gr) {
        const a = T / 2, rP = a * 0.5412, rQ = a * 0.4142, rS = a * 0.1716, rV = a * 0.5858;
        const i0 = Math.floor(x0 / T) - 1, i1 = Math.ceil(x1 / T) + 1, j0 = Math.floor(y0 / T) - 1, j1 = Math.ceil(y1 / T) + 1;
        const faces = [];
        const D = (k) => [Math.cos((k * Math.PI) / 8), Math.sin((k * Math.PI) / 8)]; // sixteenths of a turn
        const at = (O, rr, k) => [O[0] + D(k)[0] * rr, O[1] + D(k)[1] * rr];
        for (let i = i0; i <= i1; i++) {
            for (let j = j0; j <= j1; j++) {
                const O = [i * T, j * T], par = (((i + j) % 2) + 2) % 2;
                const star = [];
                for (let k = 0; k < 8; k++) star.push(at(O, rQ, 2 * k), at(O, rP, 2 * k + 1));
                faces.push({ pts: star, type: 'star8', kind: par ? 'blue' : 'black', A: true });
                for (let k = 0; k < 8; k++) faces.push({ pts: [at(O, a, 2 * k), at(O, rP, 2 * k + 1), at(O, rQ, 2 * k), at(O, rP, 2 * k - 1)], type: 'kite', kind: (k + par) % 2 ? 'honey' : 'green', A: false });
                const C = [(i + 0.5) * T, (j + 0.5) * T];
                const s4 = [];
                for (let m = 0; m < 4; m++) s4.push(at(C, rS, 4 * m), at(C, rQ, 4 * m + 2));
                faces.push({ pts: s4, type: 'star4', kind: par ? 'honey' : 'green', A: false });
                for (let m = 0; m < 4; m++) {
                    // the hexagon about the lattice vertex C + rV·e
                    const e = D(4 * m), p = D(4 * m + 4);
                    const O1 = [C[0] + a * (e[0] - p[0]), C[1] + a * (e[1] - p[1])], O2 = [C[0] + a * (e[0] + p[0]), C[1] + a * (e[1] + p[1])], V = [C[0] + rV * e[0], C[1] + rV * e[1]];
                    const to = (O) => {
                        const l = Math.hypot(V[0] - O[0], V[1] - O[1]);
                        return [O[0] + ((V[0] - O[0]) / l) * rP, O[1] + ((V[1] - O[1]) / l) * rP];
                    };
                    faces.push({ pts: [to(O1), [C[0] + a * e[0], C[1] + a * e[1]], to(O2), at(C, rQ, 4 * m + 2), at(C, rS, 4 * m), at(C, rQ, 4 * m - 2)], type: 'hex', kind: m % 2 ? 'blue' : 'black', A: true });
                }
            }
        }
        for (const f of faces) f.box = S.bbox(f.pts);
        // nodes and segments of the lazo's centre lines
        // (the same point reached by two formulas differs in its last bits: nodes are matched
        // by nearness, never by rounding, or a crossing splits into two false turns)
        const grid = new Map(), nodes = [];
        const node = (p) => {
            const gx = Math.floor(p[0] / 0.5), gy = Math.floor(p[1] / 0.5);
            for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) {
                const N = grid.get(gx + i + ',' + (gy + j));
                if (N && Math.abs(N.p[0] - p[0]) < 0.05 && Math.abs(N.p[1] - p[1]) < 0.05) return N;
            }
            const N = { p, id: nodes.length, adj: new Set() };
            grid.set(gx + ',' + gy, N);
            nodes.push(N);
            return N;
        };
        for (const f of faces) {
            for (let i = 0; i < f.pts.length; i++) {
                const A = node(f.pts[i]), B = node(f.pts[(i + 1) % f.pts.length]);
                A.adj.add(B);
                B.adj.add(A);
            }
        }
        const classA = (p) => {
            for (const f of faces) if (f.A && p[0] >= f.box.x && p[0] <= f.box.x + f.box.w && p[1] >= f.box.y && p[1] <= f.box.y + f.box.h && inPoly(p, f.pts)) return true;
            return false;
        };
        const unit = (A, B) => {
            const l = Math.hypot(B[0] - A[0], B[1] - A[1]) || 1;
            return [(B[0] - A[0]) / l, (B[1] - A[1]) / l];
        };
        const cross = (u, v) => u[0] * v[1] - u[1] * v[0];
        // at a crossing: which of the two bands goes over
        for (const N of nodes) {
            const nb = [...N.adj];
            if (nb.length !== 4) continue;
            const d0 = unit(N.p, nb[0].p);
            const opp = nb.slice(1).find((M) => {
                const d = unit(N.p, M.p);
                return d[0] * d0[0] + d[1] * d0[1] < -0.99;
            });
            if (!opp) continue;
            const rest = nb.filter((M) => M !== nb[0] && M !== opp);
            // the face just to one side of the band, a step before the crossing (close to the band:
            // the other band may leave at 45°)
            const e = 1.2, q = [N.p[0] - d0[0] * e * 0.966 - d0[1] * e * 0.259, N.p[1] - d0[1] * e * 0.966 + d0[0] * e * 0.259];
            const first = classA(q);
            N.over = first ? [nb[0], opp] : rest;
            N.under = first ? rest : [nb[0], opp];
        }
        // the strips
        const hw = hb - gr / 2, strips = [];
        const meet = (p0, d, c0, dc) => {
            const t = cross([c0[0] - p0[0], c0[1] - p0[1]], dc) / cross(d, dc);
            return [p0[0] + d[0] * t, p0[1] + d[1] * t];
        };
        // where a strip that comes into node N along d (pointing at N) is cut: [point, direction]
        const cut = (N, d) => {
            const nb = [...N.adj];
            if (nb.length === 2) {
                // a turn: mitred with the strip that leaves
                const other = nb.find((M) => {
                    const u = unit(N.p, M.p);
                    return u[0] * -d[0] + u[1] * -d[1] < 0.99;
                });
                const u2 = unit(N.p, other.p), m = [u2[0] - d[0], u2[1] - d[1]], ml = Math.hypot(m[0], m[1]) || 1;
                const dc = [m[0] / ml, m[1] / ml];
                let n = [-dc[1], dc[0]];
                if (n[0] * -d[0] + n[1] * -d[1] < 0) n = [-n[0], -n[1]];
                return [[N.p[0] + n[0] * gr * 0.5, N.p[1] + n[1] * gr * 0.5], dc];
            }
            if (!N.over) return [N.p, [-d[1], d[0]]]; // the lattice's fringe, off the panel
            // a crossing it goes under: it butts against the band that goes over
            const dc = unit(N.over[0].p, N.over[1].p);
            let n = [-dc[1], dc[0]];
            if (n[0] * -d[0] + n[1] * -d[1] < 0) n = [-n[0], -n[1]];
            return [[N.p[0] + n[0] * (hb + gr * 0.5), N.p[1] + n[1] * (hb + gr * 0.5)], dc];
        };
        const strip = (A, B) => {
            const d = unit(A.p, B.p), n = [-d[1], d[0]];
            const cA = cut(A, [-d[0], -d[1]]), cB = cut(B, d);
            const L = [A.p[0] + n[0] * hw, A.p[1] + n[1] * hw], R = [A.p[0] - n[0] * hw, A.p[1] - n[1] * hw];
            const st = [meet(L, d, cA[0], cA[1]), meet(L, d, cB[0], cB[1]), meet(R, d, cB[0], cB[1]), meet(R, d, cA[0], cA[1])];
            // (on the lattice's fringe a crossing lacks its neighbours and the cuts run away: drop those)
            const len = Math.hypot(B.p[0] - A.p[0], B.p[1] - A.p[1]);
            if (!st.every((q) => Math.hypot(q[0] - A.p[0], q[1] - A.p[1]) < len + hb * 6)) return;
            strips.push(st);
        };
        for (const N of nodes) {
            if (N.over) strip(N.over[0], N.over[1]);
            else if (N.adj.size === 2) {
                // from a turn to a crossing it goes under (to one it goes over: that strip is already cut)
                for (const M of N.adj) if (M.under && M.under.includes(N)) strip(M, N);
            }
        }
        const segs = [];
        for (const N of nodes) for (const M of N.adj) if (N.id < M.id) segs.push([N.p, M.p]);
        // nibbled with pliers: no edge is quite straight
        const nib = (pts, amp) => {
            const out = [];
            for (let i = 0; i < pts.length; i++) {
                const A = pts[i], B = pts[(i + 1) % pts.length], l = Math.hypot(B[0] - A[0], B[1] - A[1]), n = Math.max(1, Math.round(l / 7));
                const nx = -(B[1] - A[1]) / (l || 1), ny = (B[0] - A[0]) / (l || 1);
                for (let k = 0; k < n; k++) {
                    const t = k / n, w = k ? amp * S.noise2(A[0] * 0.7 + k * 3.1, A[1] * 0.7 + B[0], 9) : amp * 0.5 * S.noise2(A[0], A[1], 8);
                    out.push([A[0] + (B[0] - A[0]) * t + nx * w, A[1] + (B[1] - A[1]) * t + ny * w]);
                }
            }
            return out;
        };
        for (const f of faces) f.cutPts = nib(inset(f.pts, hb + gr / 2), 0.32);
        return { faces, strips: strips.map((st) => nib(st, 0.22)), segs };
    }
    function alicatado(g, o = {}) {
        const { x = 0, y = 0, s = 1, rot = 0, seed = 1, w = 300, h = 300, period = 88 } = o;
        const F = frame(rot), hw = w / 2, hh = h / 2;
        sheet(g, x, y, s, reach({ x: -hw - 8, y: -hh - 8, w: w + 22, h: h + 22 }, rot), (main) => {
            const r = Motion.rng('heirloom-alicatado/' + seed), q = like(main);
            const hb = period * 0.027, gr = 0.7;
            const L = lazo(period, -hw, -hh, hw, hh, hb, gr);
            // the panel: three cut edges and a break across the lower right corner
            const bx = w * (0.44 + r() * 0.1), by = h * (0.36 + r() * 0.1), brk = [];
            {
                const A = [hw, hh - by], B = [hw - bx, hh], n = 13;
                for (let i = 0; i <= n; i++) {
                    const t = i / n, j = i === 0 || i === n ? 0 : 1;
                    brk.push([lerp(A[0], B[0], t) + j * ((r() - 0.5) * 16 - 5 * Math.sin(t * Math.PI)), lerp(A[1], B[1], t) + j * ((r() - 0.5) * 16 - 5 * Math.sin(t * Math.PI))]);
                }
            }
            // (sawn out of a wall: its three whole edges are not ruled lines either)
            const edge = (A, B, nick) => {
                const out = [], n = Math.max(2, Math.round(Math.hypot(B[0] - A[0], B[1] - A[1]) / 9)), nx = -(B[1] - A[1]), ny = B[0] - A[0], nl = Math.hypot(nx, ny) || 1, at = 1 + Math.floor(r() * (n - 2));
                for (let i = 0; i < n; i++) {
                    const t = i / n, k = i ? 0.55 * S.noise2(A[0] * 0.1 + i * 1.7, A[1] * 0.1 + B[0], 6) + (nick && i === at ? 1.6 + r() * 1.4 : 0) : 0;
                    out.push([lerp(A[0], B[0], t) + (nx / nl) * k, lerp(A[1], B[1], t) + (ny / nl) * k]);
                }
                return out;
            };
            const rim3 = [...edge([-hw, hh], [-hw, -hh], true), ...edge([-hw, -hh], [hw, -hh], true), ...edge([hw, -hh], [hw, hh - by], false)];
            const panel = F.pts([...rim3, ...brk, [hw - bx, hh]]);
            // the plaster bed reaches further, and crumbles
            const bed = [...rim3.slice(0, -Math.max(1, Math.round((hh * 2 - by) / 9)) + 1), [hw, -hh]];
            {
                const A = [hw, hh - by * 0.3], B = [hw - bx * 0.34, hh], n = 9;
                for (let i = 0; i <= n; i++) {
                    const t = i / n, j = i === 0 || i === n ? 0 : 1;
                    bed.push([lerp(A[0], B[0], t) + j * ((r() - 0.5) * 9 - 3), lerp(A[1], B[1], t) + j * ((r() - 0.5) * 9 - 3)]);
                }
            }
            const bedP = F.pts(bed);
            // ---- the slab's thickness on the sides away from the lamp
            const TH = 3.4;
            fillP(q, bedP.map((p) => [p[0] + SD[0] * TH, p[1] + SD[1] * TH]), '#8c7f6a');
            fillP(q, bedP.map((p) => [p[0] + SD[0] * TH * 0.5, p[1] + SD[1] * TH * 0.5]), '#a39680');
            // ---- the bed
            q.save();
            clipTo(q, bedP);
            q.fillStyle = PLASTER;
            const bb = S.bbox(bedP, 4);
            q.fillRect(bb.x, bb.y, bb.w, bb.h);
            // gypsum: trowel drags, pores, a warmer stain
            for (let i = 0; i < 26; i++) glow(q, [bb.x + r() * bb.w, bb.y + r() * bb.h], 8 + r() * 26, r() < 0.5 ? '#a8997e' : '#efe8d8', 0.3);
            scuff(q, bb, r, { n: 420, len: [3, 22], w: [0.25, 0.7], light: '#f6f0e2', dark: '#7e705a', alpha: [0.12, 0.4], dir: 0.5 + rot, pits: 260, pit: [0.2, 0.75] });
            // the ridges that stood between the lost pieces, and the hollows the pieces left
            q.lineCap = 'round';
            for (const f of L.faces) {
                const pts = F.pts(f.cutPts), c = centroid(pts);
                if (c[0] < bb.x || c[0] > bb.x + bb.w || c[1] < bb.y || c[1] > bb.y + bb.h || inPoly(c, panel)) continue;
                q.save();
                clipTo(q, pts);
                q.fillStyle = 'rgba(126,110,88,0.22)';
                q.fillRect(c[0] - 40, c[1] - 40, 80, 80);
                q.translate(SD[0] * 0.9, SD[1] * 0.9);
                strokeP(q, pts, 1.5, 'rgba(84,70,54,0.5)', true);
                q.restore();
            }
            for (const st of L.strips) {
                const pts = F.pts(st), c = centroid(pts);
                if (inPoly(c, panel)) continue;
                strokeP(q, pts, 0.5, 'rgba(246,240,226,0.55)', true);
            }
            q.restore();
            // ---- the tiles
            const lost = new Set(), wrong = new Set();
            {
                const inside = L.faces.map((f, i) => [f, i]).filter(([f]) => f.type !== 'star8' && f.pts.every((p) => inPoly(F(p), panel) && Math.abs(p[0]) < hw - 6 && Math.abs(p[1]) < hh - 6));
                for (let i = 0; i < 2 && inside.length; i++) lost.add(inside[Math.floor(r() * inside.length)][1]);
                if (inside.length) wrong.add(inside[Math.floor(r() * inside.length)][1]);
            }
            // their broken edge, seen from the lamp's side: the biscuit's thickness along the break
            const brkP = F.pts(brk);
            q.save();
            clipTo(q, bedP);
            q.lineJoin = 'round';
            S.cast(q, (d) => fillP(d, panel, '#000'), { blur: 2.2, dx: 2.2, dy: 2.8, color: 'rgba(40,26,20,0.6)' });
            q.translate(SD[0] * 1.5, SD[1] * 1.5);
            strokeP(q, brkP, 2.2, '#7a5238');
            q.translate(-SD[0] * 0.8, -SD[1] * 0.8);
            strokeP(q, brkP, 1.3, BISCUIT);
            q.restore();
            q.save();
            clipTo(q, panel);
            const pb = S.bbox(panel, 2);
            // the joints: plaster, greyer with dirt lower down
            const jg = q.createLinearGradient(pb.x, pb.y, pb.x + pb.w * 0.4, pb.y + pb.h);
            jg.addColorStop(0, '#c9bfa8');
            jg.addColorStop(1, '#8f8370');
            q.fillStyle = jg;
            q.fillRect(pb.x, pb.y, pb.w, pb.h);
            const vis = (pts) => {
                const b = S.bbox(pts);
                return b.x < pb.x + pb.w && b.x + b.w > pb.x && b.y < pb.y + pb.h && b.y + b.h > pb.y;
            };
            L.faces.forEach((f, i) => {
                const pts = F.pts(f.cutPts);
                if (!vis(pts)) return;
                if (lost.has(i)) {
                    // gone: its print in the plaster, the wall of the joint casting into it
                    q.save();
                    clipTo(q, pts);
                    q.fillStyle = '#b9ad94';
                    q.fillRect(pb.x, pb.y, pb.w, pb.h);
                    const c = centroid(pts);
                    scuff(q, S.bbox(pts), r, { n: 26, len: [1, 5], light: '#efe8d6', dark: '#6e604c', pits: 22 });
                    q.translate(SD[0] * 1.3, SD[1] * 1.3);
                    strokeP(q, pts, 2.4, 'rgba(60,46,38,0.6)', true);
                    q.restore();
                    return;
                }
                tile(q, pts, wrong.has(i) ? (f.kind === 'honey' ? 'green' : 'honey') : f.kind, r);
            });
            for (const st of L.strips) {
                const pts = F.pts(st);
                if (vis(pts)) tile(q, pts, 'white', r);
            }
            // dirt in the joints and a wash of age over the whole
            for (let i = 0; i < 14; i++) glow(q, [pb.x + r() * pb.w, pb.y + r() * pb.h], 14 + r() * 40, r() < 0.6 ? '#3a2c26' : '#f4e6c0', 0.16);
            q.restore();
            // ---- the panel as one slab under the lamp
            air(q, { color: '#241828', alpha: 0.42, w: 26, push: 14 });
            air(q, { color: '#1a1020', alpha: 0.4, w: 5, push: 2.5 });
            air(q, { color: '#fff4d6', alpha: 0.22, w: 18, push: 10, dir: TOL });
            // the cut edges: a thread of light on the two that face the lamp
            q.save();
            q.globalCompositeOperation = 'source-atop';
            S.ink(q, F.pts([[-hw + 0.7, hh - 6], [-hw + 0.7, 0], [-hw + 0.7, -hh + 0.7], [0, -hh + 0.7], [hw - 6, -hh + 0.7]]), { w: 1, color: '#fff8e2', alpha: 0.5 });
            q.restore();
            stampOn(main, q, { lw: 2.1, heavy: 0.8 });
        });
    }

    // ================================================================== 4 · the astrolabe
    // AL-ANDALUS, 11th century. A brass planispheric astrolabe of the Andalusi school (the
    // workshops of Córdoba, Toledo and Seville: Ibn al-Saffār, al-Sahlī).
    //   Anatomy: the mater, a disc with a raised rim (the limb) cast in one with the throne
    //   (kursī), which carries the shackle and the ring; in the mater's hollow a plate for one
    //   latitude; over it the rete (the «spider»), a pierced star map that turns; over all the
    //   rule, on a pin held by a wedge, the «horse».
    //   1 the limb graduated in degrees: every degree a tick, every fifth a longer one, and at
    //   every fifth a group of letters for the number  2 the plate is a true stereographic
    //   projection for 38° (Córdoba): tropics and equator, the horizon, almucantars every 6°
    //   closing on the zenith, azimuth arcs every 10° fanning from it  3 under the horizon the
    //   arcs of the unequal hours  4 the rete's ecliptic ring off-centre, touching the tropic
    //   of Capricorn, cut into the twelve signs by lines aimed at the pole, graduated and named
    //   5 the star pointers end where the stars are (eighteen real stars, set back fourteen
    //   degrees along the ecliptic for the year 1000), curved daggers and leaves, each with its
    //   label  6 the equinoctial bar counter-changed about the centre; the knob that turns the
    //   rete  7 the rule with a bevelled edge and its scale; the pin and the horse, with a
    //   horse's head  8 the throne low, lobed, pierced, with a line of engraving; the shackle
    //   riveted through it, the ring through the shackle  9 brass gone brown and olive, lathe
    //   rings on the limb, bright where fingers have worn the edges, green in a few corners
    //   10 arcs scratched on the plate by the turning rete, a dent in the rim, and a knotted
    //   end of red silk cord left in the ring.
    // No word is written anywhere: `script` lays a rhythm of angular strokes that reads as
    // engraved Kufic and says nothing.
    const BRASS = { ink: INK, deep: '#33200f', shade: '#73501d', mid: '#bd8d2e', light: '#e6c466', glint: '#fff2ba' };
    const D2R = Math.PI / 180;
    // Script-like engraving from `o` along the unit vector `u`, `len` long and `h` high (up is
    // to the left of travel): uprights, teeth, square loops, tails, a dot; no letters.
    function script(o, u, len, h, r) {
        const up = [u[1], -u[0]], out = [], P = (a, b) => [o[0] + u[0] * a + up[0] * b, o[1] + u[1] * a + up[1] * b];
        let xx = h * 0.08, start = 0;
        while (xx < len - h * 0.2) {
            const k = r(), wd = h * (0.2 + r() * 0.22);
            if (k < 0.24) {
                // a tall upright with its wedge
                const hh = h * (0.78 + r() * 0.22);
                out.push([P(xx, 0), P(xx, hh), P(xx - h * 0.13, hh - h * 0.09)]);
            } else if (k < 0.32) {
                // two uprights that spring from one foot and lean apart
                out.push([P(xx - h * 0.04, h * 0.86), P(xx + wd * 0.12, h * 0.22), P(xx + wd * 0.5, 0), P(xx + wd * 0.88, h * 0.22), P(xx + wd * 1.04, h * 0.86)]);
                xx += wd * 0.3;
            } else if (k < 0.37) {
                // the line drawn out between two letters
                xx += wd * 1.6;
                continue;
            } else if (k < 0.52) {
                // teeth
                const n = 1 + Math.floor(r() * 3);
                for (let i = 0; i < n; i++) out.push([P(xx + i * h * 0.17, 0), P(xx + i * h * 0.17, h * (0.24 + r() * 0.12))]);
                xx += (n - 1) * h * 0.17;
            } else if (k < 0.66) out.push([P(xx, 0), P(xx + wd * 0.5, h * 0.34), P(xx + wd, 0)]); // a knot on the line
            else if (k < 0.78) out.push([P(xx + wd * 0.5, 0), P(xx + wd * 0.5, h * 0.2), P(xx + wd * 0.12, h * 0.34), P(xx + wd * 0.5, h * 0.5), P(xx + wd * 0.88, h * 0.34), P(xx + wd * 0.5, h * 0.2)]); // a round head on a neck
            else if (k < 0.89) out.push([P(xx + wd, 0), P(xx + wd * 1.05, -h * 0.2), P(xx + wd * 0.5, -h * 0.34), P(xx - wd * 0.5, -h * 0.28)]); // a tail swept back under the line
            else {
                // the space between two words
                if (xx - h * 0.1 - start > h * 0.15) out.push([P(start, 0), P(xx - h * 0.1, 0)]);
                xx += h * 0.32;
                start = xx;
                continue;
            }
            if (r() < 0.18) out.push([P(xx + wd * 0.3, h * 0.6), P(xx + wd * 0.3 + h * 0.07, h * 0.67)]);
            xx += wd + h * 0.1;
        }
        if (Math.min(xx, len) - start > h * 0.2) out.push([P(start, 0), P(Math.min(xx, len), 0)]);
        return out;
    }
    // Engraving: a dark hairline with a lit lip on the side away from the lamp.
    function engrave(g, lines, w = 0.4, a = 0.85, dark = '#2e1a0c', lip = '#ffeaa8') {
        if (!lines.length) return;
        g.save();
        g.lineCap = 'round';
        g.lineJoin = 'round';
        const all = () => {
            g.beginPath();
            for (const l of lines) {
                g.moveTo(l[0][0], l[0][1]);
                for (let i = 1; i < l.length; i++) g.lineTo(l[i][0], l[i][1]);
            }
        };
        g.save();
        g.translate(SD[0] * w * 0.85, SD[1] * w * 0.85);
        all();
        g.lineWidth = w * 0.9;
        g.strokeStyle = S.rgba(lip, a * 0.6);
        g.stroke();
        g.restore();
        all();
        g.lineWidth = w;
        g.strokeStyle = S.rgba(dark, a);
        g.stroke();
        g.restore();
    }
    // a brass surface on whatever a sheet already holds: light to shade across it, tarnish in
    // slow blotches, scratches
    function brassOn(g, box, r, { blotch = 40, n = 200, tone = 0, lift = 0 } = {}) {
        g.save();
        g.globalCompositeOperation = 'source-atop';
        const gd = g.createLinearGradient(box.x + box.w * 0.15, box.y, box.x + box.w * 0.85, box.y + box.h);
        gd.addColorStop(0, S.rgba(BRASS.light, 0.75));
        gd.addColorStop(0.35, S.rgba(BRASS.light, 0.12));
        gd.addColorStop(0.6, S.rgba(BRASS.shade, 0.15));
        gd.addColorStop(1, S.rgba(BRASS.shade, 0.8));
        g.fillStyle = gd;
        g.fillRect(box.x, box.y, box.w, box.h);
        if (tone) {
            g.fillStyle = S.rgba('#4a3418', tone);
            g.fillRect(box.x, box.y, box.w, box.h);
        }
        if (lift) {
            g.fillStyle = S.rgba('#f6dc8a', lift);
            g.fillRect(box.x, box.y, box.w, box.h);
        }
        for (let i = 0; i < blotch; i++) {
            const k = r();
            glow(g, [box.x + r() * box.w, box.y + r() * box.h], (0.04 + r() * 0.13) * Math.max(box.w, box.h), k < 0.45 ? '#5a3c18' : k < 0.75 ? '#6f6426' : k < 0.9 ? '#f0d68a' : '#8a3c1c', 0.14 + r() * 0.2);
        }
        scuff(g, box, r, { n, len: [1.5, 12], w: [0.2, 0.45], light: '#fff0b4', dark: '#2e1c0c', alpha: [0.1, 0.34], pits: Math.round(n * 0.35), pit: [0.15, 0.45] });
        g.restore();
    }
    // real stars [right ascension h, declination °] (J2000), from Aldebaran round to Algol
    const STARS = [[4.599, 16.51], [5.242, -8.2], [5.278, 46.0], [5.919, 7.41], [6.752, -16.72], [7.655, 5.22], [10.139, 11.97], [13.792, 49.31], [13.42, -11.16], [14.261, 19.18], [15.578, 26.71], [17.582, 12.56], [18.616, 38.78], [19.846, 8.87], [20.69, 45.28], [23.079, 15.21], [0.726, -17.99], [3.136, 40.96]];
    const OBL = 23.5 * D2R;
    // a star's place moved along the ecliptic (precession): [ra, dec] in radians
    const precess = ([ra, dec], dLon) => {
        const a = ra * 15 * D2R, d = dec * D2R, ce = Math.cos(OBL), se = Math.sin(OBL);
        const b = Math.asin(Math.sin(d) * ce - Math.cos(d) * se * Math.sin(a));
        const l = Math.atan2(Math.sin(a) * ce + Math.tan(d) * se, Math.cos(a)) + dLon;
        return [Math.atan2(Math.sin(l) * ce - Math.tan(b) * se, Math.cos(l)), Math.asin(Math.sin(b) * ce + Math.cos(b) * se * Math.sin(l))];
    };
    function astrolabe(g, o = {}) {
        const { x = 0, y = 0, s = 1, rot = 0, seed = 1, turn = -0.42, rule = 0.5 } = o;
        const F = frame(rot);
        sheet(g, x, y, s, reach({ x: -116, y: -153, w: 232, h: 304 }, rot), (main) => {
            const r = Motion.rng('heirloom-astrolabe/' + seed);
            const C = [0, 36], PC = F(C), RO = 112, RI = 94, RP = 93.2;
            const box = reach({ x: -116, y: -153, w: 232, h: 304 }, rot, 0);
            const circ = (c, rad, n) => arc(c, rad, 0, TAU, n ?? Math.max(28, Math.round(rad * 1.3)));
            // the stereographic plate: the tropic of Capricorn is its edge
            const RC = 90, REQ = RC / Math.tan((45 + 11.75) * D2R), RCN = REQ * Math.tan((45 - 11.75) * D2R);
            const LAT = 38 * D2R, sl = Math.sin(LAT), cl = Math.cos(LAT);

            // ---- ring and shackle, behind the throne's top
            const ringC = F([0, -131]);
            wire(main, circ(ringC, 16.4, 60), 4, BRASS, { closed: true, lw: 1.5, heavy: 0.8 });
            main.save();
            main.lineCap = 'round';
            for (let i = 0; i < 26; i++) {
                // filed and handled: short marks round the ring
                const a = r() * TAU, rr = 15 + r() * 2.8;
                strokeP(main, arc(ringC, rr, a, a + 0.1 + r() * 0.2, 4), 0.3, S.rgba(r() < 0.5 ? '#fff2ba' : '#33200f', 0.3 + r() * 0.3));
            }
            main.restore();

            // a cord of madder-red silk through the ring: knotted, the ends cut short and frayed
            {
                const RED = { ink: INK, shade: '#5e1420', mid: '#a8322c', light: '#e07a5c' };
                const twist = (pts, w) => {
                    wire(main, pts, w, RED, { lw: 0.8 });
                    // the ply: short slanted marks along it
                    for (const [px, py, tx, ty] of even(pts, 1.5)) strokeP(main, [[px - ty * w * 0.4 - tx * 0.5, py + tx * w * 0.4 - ty * 0.5], [px + ty * w * 0.4 + tx * 0.5, py - tx * w * 0.4 + ty * 0.5]], 0.3, 'rgba(60,10,20,0.55)');
                };
                const K = [12.4, -143.4];
                twist(F.pts(S.curve([[9, -146.6], [13.6, -141.8], [17.6, -136], [19.4, -129.6]], false, 8)), 2);
                twist(F.pts(S.curve([[14.6, -145.4], [18.6, -141.4], [23.4, -138.4], [26.6, -133.6]], false, 8)), 2);
                S.piece(main, F.pts(S.ellipse(K[0], K[1], 3.3, 2.5, 14, 0.7)), {
                    fill: RED.mid, line: 0.8, heavy: 0.7, shade: { color: RED.shade, alpha: 0.9, w: 2.4, push: 1.4 }, light: { color: RED.light, alpha: 0.8, w: 1.6, push: 1 },
                    detail: (d) => {
                        for (const k of [-1, 0, 1]) strokeP(d, F.pts([[K[0] - 2.5 + k * 1.3, K[1] + 2], [K[0] + 0.5 + k * 1.3, K[1] - 2.2]]), 0.3, 'rgba(60,10,20,0.6)');
                    },
                });
                main.lineCap = 'round';
                for (const [ex, ey] of [[19.4, -129.6], [26.6, -133.6]]) for (let k = 0; k < 6; k++) {
                    const a = 1.2 + (k - 2.5) * 0.24 + (r() - 0.5) * 0.2, l = 2.4 + r() * 2.6;
                    strokeP(main, F.pts([[ex, ey], [ex + Math.cos(a) * l * 0.5 + (r() - 0.5), ey + Math.sin(a) * l * 0.5], [ex + Math.cos(a) * l, ey + Math.sin(a) * l]]), 0.35, k % 2 ? RED.mid : RED.light);
                }
            }

            // ---- the mater with its throne, and the plate in its hollow
            const m = like(main);
            const half = [[41, -68], [40.5, -76.5], [36.5, -82], [31.5, -81.5], [31.5, -81.5], [30.5, -88], [25, -92.5], [19.5, -90], [19.5, -90], [17, -96.5], [11.5, -103.5], [5, -107.5], [0, -108.5]];
            const throne = F.pts(S.curve([...half, ...half.slice(0, -1).reverse().map(([px, py]) => [-px, py]), [-30, -60], [30, -60]], true, 5));
            m.fillStyle = BRASS.mid;
            m.beginPath();
            m.arc(PC[0], PC[1], RO, 0, TAU);
            m.fill();
            fillP(m, throne, BRASS.mid);
            // pierced: the rivet's hole, two commas, two round holes
            m.save();
            m.globalCompositeOperation = 'destination-out';
            m.fillStyle = '#000';
            for (const sx of [-1, 1]) {
                fillP(m, F.pts(S.curve([[sx * 12, -84], [sx * 17, -88.5], [sx * 23.5, -86.5], [sx * 25.5, -81], [sx * 21.5, -77.5], [sx * 17.5, -79.5], [sx * 19.5, -83], [sx * 16, -82.5]], true, 6)), '#000');
                disc(m, F([sx * 33.5, -74.5]), 2.3, '#000');
                disc(m, F([sx * 7.5, -90]), 1.6, '#000');
            }
            m.restore();
            brassOn(m, box, r, { blotch: 60, n: 300, tone: 0.14 });
            m.save();
            m.globalCompositeOperation = 'source-atop';
            // lathe rings on the limb
            m.lineCap = 'butt';
            for (let i = 0; i < 46; i++) {
                const rr = RI + r() * (RO - RI), a = r() * TAU;
                strokeP(m, arc(PC, rr, a, a + 0.3 + r() * 1.6, 20), 0.25 + r() * 0.3, S.rgba(r() < 0.55 ? '#fff0b4' : '#3a2410', 0.1 + r() * 0.2));
            }
            // the limb is raised: its top takes the light as a ring
            const lg = m.createRadialGradient(PC[0], PC[1], RI, PC[0], PC[1], RO);
            lg.addColorStop(0, 'rgba(51,32,15,0.3)');
            lg.addColorStop(0.2, 'rgba(255,240,180,0.16)');
            lg.addColorStop(0.75, 'rgba(255,240,180,0)');
            lg.addColorStop(1, 'rgba(51,32,15,0.4)');
            m.fillStyle = lg;
            m.beginPath();
            m.arc(PC[0], PC[1], RO, 0, TAU);
            m.arc(PC[0], PC[1], RI, 0, TAU, true);
            m.fill();
            // the band of numbers holds more dirt; the rim is rubbed bright where it is held
            m.beginPath();
            m.arc(PC[0], PC[1], 110.2, 0, TAU);
            m.arc(PC[0], PC[1], 101.2, 0, TAU, true);
            m.fillStyle = 'rgba(64,40,14,0.16)';
            m.fill();
            for (let i = 0; i < 26; i++) {
                const a = r() * TAU, rr = RI + 2 + r() * (RO - RI - 4);
                glow(m, pol(PC, rr, a), 5 + r() * 12, r() < 0.5 ? '#3c2610' : r() < 0.6 ? '#5a5c26' : '#7c3a1e', 0.2 + r() * 0.22);
            }
            for (const [a0, a1] of [[2.4, 3.5], [4.4, 5.0], [0.6, 1.3]]) S.ink(m, arc(PC, RO - 1.6, a0 + rot, a1 + rot, 30), { w: 2.2, color: '#fff0b4', alpha: 0.4 });
            // a dent in the rim
            {
                const d = pol(PC, RO - 2.5, 2.2 + rot);
                glow(m, d, 4.5, '#2a180a', 0.6);
                glow(m, [d[0] + SD[0] * 2, d[1] + SD[1] * 2], 3, '#fff0b4', 0.5);
            }
            // -- the plate
            const plate = circ(PC, RP, 120);
            m.save();
            clipTo(m, plate);
            m.fillStyle = '#8a682a';
            m.fillRect(box.x, box.y, box.w, box.h);
            const pg = m.createLinearGradient(PC[0] - 70, PC[1] - 80, PC[0] + 70, PC[1] + 80);
            pg.addColorStop(0, 'rgba(206,170,90,0.6)');
            pg.addColorStop(0.5, 'rgba(206,170,90,0)');
            pg.addColorStop(1, 'rgba(44,28,14,0.6)');
            m.fillStyle = pg;
            m.fillRect(box.x, box.y, box.w, box.h);
            for (let i = 0; i < 44; i++) {
                const k = r();
                glow(m, [PC[0] + (r() - 0.5) * 190, PC[1] + (r() - 0.5) * 190], 6 + r() * 26, k < 0.45 ? '#3e2a12' : k < 0.8 ? '#5c6430' : '#7a3a22', 0.16 + r() * 0.24);
            }
            // arcs scratched by the turning rete
            for (let i = 0; i < 60; i++) {
                const rr = 12 + r() * 78, a = r() * TAU;
                strokeP(m, arc(PC, rr, a, a + 0.15 + r() * 0.9, 14), 0.22 + r() * 0.25, S.rgba(r() < 0.6 ? '#f6dc9a' : '#2e1c0c', 0.12 + r() * 0.2));
            }
            // plate coordinates: X to the right, Y up towards the throne (the south)
            const PP = (X, Y) => F([C[0] + X, C[1] - Y]);
            const lines = [], heavy = [];
            for (const rr of [RC, REQ, RCN]) heavy.push(circ(PC, rr));
            heavy.push([PP(-RC, 0), PP(RC, 0)], [PP(0, -RC), PP(0, RC)]);
            // almucantars: circles of equal altitude, every 6°, closing on the zenith
            const hc = PP(0, (REQ * cl) / sl), hr = REQ / sl;
            for (let alt = 0; alt < 90; alt += 6) {
                const sa = Math.sin(alt * D2R), ca = Math.cos(alt * D2R);
                (alt === 0 ? heavy : lines).push(circ(PP(0, (REQ * cl) / (sl + sa)), (REQ * ca) / (sl + sa)));
            }
            engrave(m, heavy, 0.5, 0.85);
            engrave(m, lines, 0.36, 0.8);
            // azimuth arcs: through the zenith, only above the horizon
            m.save();
            clipTo(m, circ(hc, hr, 140));
            const az = [];
            for (let A = -80; A <= 80; A += 10) {
                const xc = (REQ / cl) * Math.tan(A * D2R);
                az.push(circ(PP(xc, -REQ * (sl / cl)), REQ / cl / Math.cos(A * D2R), 200));
            }
            engrave(m, az, 0.34, 0.75);
            m.restore();
            // the unequal hours, under the horizon: the night arcs of the three circles in twelfths
            m.save();
            m.beginPath();
            m.rect(box.x, box.y, box.w, box.h);
            S.trace(m, circ(hc, hr, 140));
            m.clip('evenodd');
            const hrs = [];
            const yh = (REQ * cl) / sl;
            const nightArc = (rho) => {
                const th = Math.asin(Math.max(-1, Math.min(1, (rho * rho + yh * yh - hr * hr) / (2 * yh * rho))));
                return [Math.PI - th, 2 * Math.PI + th]; // from the west point round under to the east point
            };
            for (let i = 1; i < 12; i++) {
                const p3 = [RCN, REQ, RC].map((rho) => {
                    const [a0, a1] = nightArc(rho), a = a0 + ((a1 - a0) * i) / 12;
                    return [rho * Math.cos(a), rho * Math.sin(a)];
                });
                hrs.push(S.curve(p3, false, 10).map(([X, Y]) => PP(X, Y)));
            }
            engrave(m, hrs, 0.36, 0.78);
            // their numbers, and the altitudes up the meridian
            const lab = [];
            for (let i = 0; i < 12; i++) {
                const [a0, a1] = nightArc(REQ + 14), a = a0 + ((a1 - a0) * (i + 0.5)) / 12, p = PP((REQ + 12) * Math.cos(a), (REQ + 12) * Math.sin(a));
                lab.push(...script(p, [Math.cos(rot), Math.sin(rot)], 3.6, 2.4, r));
            }
            m.restore();
            for (let alt = 12; alt < 80; alt += 12) {
                const sa = Math.sin(alt * D2R), ca = Math.cos(alt * D2R), top = (REQ * cl) / (sl + sa) + (REQ * ca) / (sl + sa);
                if (top < RC - 4) lab.push(...script(PP(1.2, top + 0.8), [Math.cos(rot), Math.sin(rot)], 3.2, 2.1, r));
            }
            engrave(m, lab, 0.3, 0.8);
            m.restore();
            // the limb's wall stands over the plate: its shadow under the lit side, light on the far wall
            m.save();
            clipTo(m, plate);
            S.spray(m, plate, { color: '#1a0c06', alpha: 0.75, w: 3.6, push: 2.4, dir: TOL });
            m.restore();
            const fa = Math.atan2(SD[1], SD[0]);
            S.ink(m, arc(PC, RP + 0.5, fa - 1.25, fa + 1.25, 40), { w: 1.1, color: '#fff0b4', alpha: 0.8 });
            S.ink(m, arc(PC, RP + 0.4, fa + Math.PI - 1.3, fa + Math.PI + 1.3, 40), { w: 1.2, color: '#1e1008', alpha: 0.7 });
            // -- the limb's scale
            m.save();
            m.globalCompositeOperation = 'source-atop';
            engrave(m, [circ(PC, 110.2), circ(PC, 101.2), circ(PC, 95.6)], 0.42, 0.85);
            const ticks = [], fives = [], nums = [];
            for (let d = 0; d < 360; d++) {
                const a = d * D2R + rot - Math.PI / 2;
                (d % 5 === 0 ? fives : ticks).push([pol(PC, 95.6, a), pol(PC, d % 5 === 0 ? 101.2 : 99, a)]);
                if (d % 5 === 0) {
                    // the number of every fifth degree: a group of letters between two long ticks
                    const a0 = a + 0.6 * D2R, o0 = pol(PC, 102.8, a0), u = [-Math.sin(a0 + 2.2 * D2R), Math.cos(a0 + 2.2 * D2R)];
                    nums.push(...script(o0, u, 3.4 + r() * 3, 4.3, r));
                    fives.push([pol(PC, 101.2, a), pol(PC, 110.2, a)]);
                }
            }
            engrave(m, ticks, 0.3, 0.8);
            engrave(m, fives, 0.42, 0.85);
            engrave(m, nums, 0.36, 0.85);
            // the throne: a line following its lobes, a band of engraving, the maker's line
            engrave(m, [inset(throne, 2.4).filter((p) => Math.hypot(p[0] - PC[0], p[1] - PC[1]) > RO + 1.5)], 0.42, 0.8);
            const th = [];
            th.push(...script(F([-9, -99.5]), [Math.cos(rot), Math.sin(rot)], 18, 4.6, r));
            for (const sx of [-1, 1]) {
                // a half palmette either side of the commas
                const leaf = S.curve([[sx * 29, -71.5], [sx * 26, -76], [sx * 28.5, -79.5], [sx * 33, -78.5]], false, 6);
                th.push(F.pts(leaf), F.pts([[sx * 27.5, -72.5], [sx * 23, -73.5], [sx * 20.5, -71]]));
                th.push(F.pts(S.curve([[sx * 11.5, -77], [sx * 9, -81], [sx * 10.5, -85.5], [sx * 14.5, -86.5]], false, 6)));
            }
            th.push(F.pts(arc(C, 105.6, -Math.PI / 2 - 0.3, -Math.PI / 2 + 0.3, 16)));
            engrave(m, th, 0.4, 0.82);
            // green in a few corners of the engraving
            for (let i = 0; i < 22; i++) {
                const a = r() * TAU, p = pol(PC, 96 + r() * 14, a);
                fillP(m, S.ellipse(p[0], p[1], 0.5 + r() * 1.1, 0.3 + r() * 0.6, 8, r() * 3), S.rgba('#5c9478', 0.3 + r() * 0.4));
            }
            m.restore();
            // bright where fingers have worn the edges; then the whole thing under the lamp
            air(m, { color: '#ffe9a0', alpha: 0.6, w: 1.5, push: 0 });
            air(m, { color: '#2a160c', alpha: 0.62, w: 9, push: 5.5 });
            air(m, { color: '#1c0e14', alpha: 0.5, w: 2.4, push: 1.4 });
            air(m, { color: '#fff3c0', alpha: 0.5, w: 5, push: 3.2, dir: TOL });
            stampOn(main, m, { lw: 2.2, heavy: 0.8, depth: 1.6, side: '#5e4018', cast: { blur: 2.5, dx: 1.5, dy: 2, color: 'rgba(20,10,20,0.6)' } });

            // ---- the shackle: a loop riveted through the throne's top, the ring through its eye
            {
                const sh = like(main);
                const loop = F.pts(S.curve([[0, -92.5], [4.2, -95], [7, -101], [10.5, -106.5], [11, -113], [7, -118.5], [0, -120.5], [-7, -118.5], [-11, -113], [-10.5, -106.5], [-7, -101], [-4.2, -95]], true, 6));
                fillP(sh, loop, BRASS.mid);
                sh.save();
                sh.globalCompositeOperation = 'destination-out';
                fillP(sh, F.pts(S.ellipse(0, -111.5, 5.6, 5.2, 24)), '#000');
                sh.restore();
                brassOn(sh, S.bbox(loop, 2), r, { blotch: 8, n: 26 });
                air(sh, { color: '#ffe9a0', alpha: 0.6, w: 1.2, push: 0 });
                air(sh, { color: '#2a160c', alpha: 0.75, w: 3.4, push: 2 });
                air(sh, { color: '#fff3c0', alpha: 0.6, w: 2, push: 1.3, dir: TOL });
                stampOn(main, sh, { lw: 1.5, heavy: 0.8, cast: { blur: 1.8, dx: 1.3, dy: 1.8, color: 'rgba(20,10,20,0.7)' } });
                // the ring comes through the eye, in front of the loop's far side
                main.save();
                clipTo(main, F.pts(S.ellipse(0, -111.5, 5.6, 5.2, 24)));
                wire(main, circ(ringC, 16.4, 60), 4, BRASS, { closed: true, lw: 1.1, heavy: 0.8 });
                main.restore();
                // the rivet
                const rv = F([0, -97.5]);
                S.piece(main, S.ellipse(rv[0], rv[1], 2.5, 2.5, 16), { fill: BRASS.mid, line: 0.9, heavy: 0.7, cast: { blur: 1, dx: 0.7, dy: 0.9, color: 'rgba(20,10,10,0.7)' }, shade: { color: BRASS.deep, alpha: 0.85, w: 2, push: 1.2 }, light: { color: BRASS.glint, alpha: 0.95, w: 1.4, push: 0.9 } });
            }

            // ---- the rete
            const ct = Math.cos(turn), st = Math.sin(turn);
            const RL = (p) => [C[0] + p[0] * ct - p[1] * st, C[1] + p[0] * st + p[1] * ct]; // rete → the thing
            const RF = (p) => F(RL(p));
            const RA = (a) => a + turn + rot; // a direction of the rete, on the page
            const ECC = (RC - RCN) / 2, REC = (RC + RCN) / 2, EC = [0, -ECC], BW = 8.2;
            const rt = like(main);
            rt.strokeStyle = rt.fillStyle = BRASS.mid;
            rt.lineCap = 'butt';
            const band = (c, rad, w, a0 = 0, a1 = TAU) => {
                rt.beginPath();
                rt.arc(c[0], c[1], rad, a0, a1);
                rt.lineWidth = w;
                rt.stroke();
            };
            band(PC, 88.2, 6.6); // the tropic of Capricorn: the rete's rim
            band(RF(EC), REC - BW / 2, BW); // the ecliptic
            band(PC, REQ, 4.4, RA(0.16), RA(Math.PI - 0.16)); // the equator, its lower half
            band(PC, 15.6, 4.2); // a ring about the pole
            fillP(rt, [[-54, -5.4], [54, -5.4], [54, 0], [-54, 0]].map(RF), BRASS.mid); // the equinoctial bar, counter-changed
            for (const sx of [-1, 1]) fillP(rt, [[sx * 49, 0], [sx * 86, 0], [sx * 86, 5.4], [sx * 49, 5.4]].map(RF), BRASS.mid);
            fillP(rt, [[-2.7, 12], [2.7, 12], [2.7, 86], [-2.7, 86]].map(RF), BRASS.mid); // the meridian strut
            // a quatrefoil on the strut
            const QF = [0, 44.5];
            for (let k = 0; k < 4; k++) disc(rt, RF([QF[0] + Math.cos(k * 1.5708 + 0.7854) * 4.6, QF[1] + Math.sin(k * 1.5708 + 0.7854) * 4.6]), 5, BRASS.mid);
            // the star pointers
            const pointers = [];
            STARS.forEach((sd, i) => {
                const [ra, dec] = precess(sd, -14 * D2R), rho = REQ * Math.tan(Math.PI / 4 - dec / 2), th = Math.PI - ra;
                const tip = [rho * Math.cos(th), rho * Math.sin(th)], dE = Math.hypot(tip[0] - EC[0], tip[1] - EC[1]), dC = Math.hypot(tip[0], tip[1]);
                // where it can grow from: the ring about the pole, the ecliptic, the equator's arc, the rim
                const cand = [];
                const from = (c, rad, d) => {
                    const l = Math.hypot(tip[0] - c[0], tip[1] - c[1]) || 1;
                    cand.push({ d, base: [c[0] + ((tip[0] - c[0]) / l) * rad, c[1] + ((tip[1] - c[1]) / l) * rad] });
                };
                if (dC > 17.6) from([0, 0], 17.2, dC - 17.6);
                if (dE < REC - BW) from(EC, REC - BW + 0.6, REC - BW - dE);
                if (dE > REC) from(EC, REC - 0.6, dE - REC);
                if (dC < 85) from([0, 0], 85.4, 85 - dC);
                if (tip[1] > 12 && Math.abs(dC - REQ) > 2.2) from([0, 0], dC > REQ ? REQ + 1.8 : REQ - 1.8, Math.abs(dC - REQ) - 2.2);
                const ok = cand.filter((c) => c.d >= 6.5).sort((a, b) => a.d - b.d);
                const pick = ok[0] ?? cand.sort((a, b) => b.d - a.d)[0];
                const B = pick.base, L = Math.hypot(tip[0] - B[0], tip[1] - B[1]) || 1, d = [(tip[0] - B[0]) / L, (tip[1] - B[1]) / L], n = [-d[1], d[0]];
                const bend = (i % 2 ? 1 : -1) * (0.14 + r() * 0.2), leaf = i % 3 === 1, w0 = Math.min(3.6, 2 + L * 0.06);
                const ax = (t) => [B[0] + d[0] * L * t + n[0] * bend * L * Math.sin(Math.PI * Math.min(1, t)), B[1] + d[1] * L * t + n[1] * bend * L * Math.sin(Math.PI * Math.min(1, t))];
                const wd = (t) => (t < 0 ? w0 * 1.7 : leaf ? w0 * (0.5 + 0.95 * Math.sin(Math.PI * Math.pow(t, 0.8))) * (1 - Math.pow(t, 5)) * (t < 0.14 ? 1.7 - t * 5 : 1) : w0 * (1.7 - 0.7 * Math.min(1, t * 5)) * Math.pow(1 - t, 0.9));
                const Lp = [], Rp = [];
                for (let k = -2; k <= 20; k++) {
                    const t = k / 20, c = ax(t), c2 = ax(t + 0.02), tl = Math.hypot(c2[0] - c[0], c2[1] - c[1]) || 1, nn = [-(c2[1] - c[1]) / tl, (c2[0] - c[0]) / tl], hw = Math.max(0.05, wd(t));
                    Lp.push([c[0] + nn[0] * hw, c[1] + nn[1] * hw]);
                    Rp.push([c[0] - nn[0] * hw, c[1] - nn[1] * hw]);
                }
                const poly = [...Lp, ...Rp.reverse()].map(RF);
                fillP(rt, poly, BRASS.mid);
                pointers.push({ ax, L, w0, leaf, tip });
            });
            // pierced: the pin's hole, the quatrefoil's eye and lobes
            rt.save();
            rt.globalCompositeOperation = 'destination-out';
            disc(rt, PC, 3.1, '#000');
            disc(rt, RF(QF), 1.9, '#000');
            for (let k = 0; k < 4; k++) disc(rt, RF([QF[0] + Math.cos(k * 1.5708 + 0.7854) * 5, QF[1] + Math.sin(k * 1.5708 + 0.7854) * 5]), 1.5, '#000');
            rt.restore();
            brassOn(rt, box, r, { blotch: 34, n: 260, lift: 0.3 });
            rt.save();
            rt.globalCompositeOperation = 'source-atop';
            // the ecliptic: twelve signs cut by lines aimed at the pole, graduated on the outer edge, named
            const ecl = (lam) => {
                const al = Math.atan2(Math.cos(OBL) * Math.sin(lam), Math.cos(lam)), de = Math.asin(Math.sin(OBL) * Math.sin(lam)), rho = REQ * Math.tan(Math.PI / 4 - de / 2);
                return [rho * Math.cos(Math.PI - al), rho * Math.sin(Math.PI - al)];
            };
            const el = [], eg = [], en = [];
            el.push(circ(RF(EC), REC - 0.7), circ(RF(EC), REC - 2.6), circ(RF(EC), REC - BW + 0.7));
            for (let dg = 0; dg < 360; dg += 3) {
                const p = ecl(dg * D2R), l = Math.hypot(p[0], p[1]), u = [-p[0] / l, -p[1] / l], len = dg % 30 === 0 ? BW + 1 : dg % 6 === 0 ? 2.6 : 1.5;
                (dg % 30 === 0 ? el : eg).push([RF([p[0] + u[0] * 0.5, p[1] + u[1] * 0.5]), RF([p[0] + u[0] * len, p[1] + u[1] * len])]);
            }
            for (let k = 0; k < 12; k++) {
                const p0 = ecl((k * 30 + 5) * D2R), p1 = ecl((k * 30 + 25) * D2R);
                const q0 = [EC[0] + ((p0[0] - EC[0]) * (REC - BW + 1.6)) / REC, EC[1] + ((p0[1] - EC[1]) * (REC - BW + 1.6)) / REC], q1 = [EC[0] + ((p1[0] - EC[0]) * (REC - BW + 1.6)) / REC, EC[1] + ((p1[1] - EC[1]) * (REC - BW + 1.6)) / REC];
                const a = RF(q1), b = RF(q0), l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
                en.push(...script(a, [(b[0] - a[0]) / l, (b[1] - a[1]) / l], l, 3.3, r));
            }
            engrave(rt, el, 0.4, 0.85);
            engrave(rt, eg, 0.3, 0.8);
            engrave(rt, en, 0.34, 0.85);
            // lines along the rim, the bar and the strut; file strokes across them
            const fr = [circ(PC, 90.6), circ(PC, 86), circ(PC, 17), circ(PC, 14.2)];
            fr.push([RF([-53, -1.1]), RF([53, -1.1])], [RF([-53, -4.3]), RF([53, -4.3])]);
            for (const sx of [-1, 1]) fr.push([RF([sx * 50, 1.1]), RF([sx * 85, 1.1])], [RF([sx * 50, 4.3]), RF([sx * 85, 4.3])], [RF([sx * 1.5, 19]), RF([sx * 1.5, 38])], [RF([sx * 1.5, 51]), RF([sx * 1.5, 84])]);
            fr.push(arc(PC, REQ + 1.1, RA(0.2), RA(Math.PI - 0.2), 60), arc(PC, REQ - 1.1, RA(0.2), RA(Math.PI - 0.2), 60));
            engrave(rt, fr, 0.32, 0.78);
            // every pointer: a spine, and its label along the blade
            const pl = [], pn = [];
            for (const p of pointers) {
                const sp = [];
                for (let k = 2; k <= 17; k++) sp.push(RF(p.ax(k / 20)));
                pl.push(sp);
                const a = RF(p.ax(p.leaf ? 0.22 : 0.06)), b = RF(p.ax(p.leaf ? 0.7 : 0.5)), l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1, u = [(b[0] - a[0]) / l, (b[1] - a[1]) / l];
                const hh = Math.min(2.6, p.w0 * 0.62);
                // set beside the spine, on the side that reads upright
                const up = [u[1], -u[0]], side = up[1] < 0 ? 0.25 : -1.25;
                pn.push(...script([a[0] + up[0] * hh * side, a[1] + up[1] * hh * side], u, Math.min(l, 9), hh, r));
            }
            engrave(rt, pl, 0.3, 0.6);
            engrave(rt, pn, 0.28, 0.85);
            // the rim's own stars sit under its edge: a row of punched dots, and names along it
            const rn = [];
            for (let k = 0; k < 9; k++) {
                const a = RA(0.5 + k * 0.62), o0 = pol(PC, 87, a);
                rn.push(...script(o0, [-Math.sin(a), Math.cos(a)], 7 + r() * 5, 2.6, r));
            }
            engrave(rt, rn, 0.3, 0.8);
            for (let i = 0; i < 30; i++) {
                const p = pol(PC, 60 + r() * 30, r() * TAU);
                fillP(rt, S.ellipse(p[0], p[1], 0.4 + r() * 0.9, 0.3 + r() * 0.5, 8, r() * 3), S.rgba('#5c9478', 0.25 + r() * 0.35));
            }
            rt.restore();
            air(rt, { color: '#ffe9a0', alpha: 0.75, w: 1, push: 0 });
            air(rt, { color: '#2a160c', alpha: 0.7, w: 2.2, push: 1.3 });
            air(rt, { color: '#fff3c0', alpha: 0.55, w: 1.5, push: 1, dir: TOL });
            stampOn(main, rt, { lw: 0.95, heavy: 0.75, ink: '#1c1410', depth: 0.9, side: '#6a4a1a', cast: { blur: 2.2, dx: 2.2, dy: 2.9, color: 'rgba(18,8,6,0.8)' } });
            // the knob that turns the rete
            {
                const k = RF([-61, 61]);
                S.piece(main, S.ellipse(k[0], k[1], 2.6, 2.6, 16), { fill: BRASS.mid, line: 0.85, ink: '#1c1410', heavy: 0.7, cast: { blur: 1.2, dx: 1, dy: 1.3, color: 'rgba(20,10,10,0.7)' }, shade: { color: BRASS.deep, alpha: 0.9, w: 2.2, push: 1.3 }, light: { color: BRASS.glint, alpha: 0.95, w: 1.5, push: 1 } });
            }

            // ---- the rule, the pin and the horse
            {
                const rl = like(main), cr = Math.cos(rule), sr = Math.sin(rule);
                const UF = (p) => F([C[0] + p[0] * cr - p[1] * sr, C[1] + p[0] * sr + p[1] * cr]);
                const bar = [[-88, -0.4], [-82, -3.6], [-9, -3.6], [-7, -6.4], [0, -7.6], [7, -6.4], [9, -3.6], [82, -3.6], [88, 0.4], [82, 3.6], [9, 3.6], [7, 6.4], [0, 7.6], [-7, 6.4], [-9, 3.6], [-82, 3.6]].map(UF);
                fillP(rl, bar, BRASS.mid);
                brassOn(rl, S.bbox(bar, 2), r, { blotch: 12, n: 70, lift: 0.18 });
                rl.save();
                rl.globalCompositeOperation = 'source-atop';
                // the bevelled edge and its scale
                fillP(rl, [[-82, -3.6], [82, -3.6], [82, -1.5], [-82, -1.5]].map(UF), 'rgba(255,238,170,0.3)');
                const sc = [[UF([-81, -1.5]), UF([-10, -1.5])], [UF([10, -1.5]), UF([81, -1.5])], [UF([-81, 2.4]), UF([-10, 2.4])], [UF([10, 2.4]), UF([81, 2.4])]];
                for (let k = 0; k <= 34; k++) for (const sx of [-1, 1]) {
                    const xx = sx * (11 + k * 2.05);
                    sc.push([UF([xx, -3.6]), UF([xx, k % 5 === 0 ? -1.5 : -2.4])]);
                }
                engrave(rl, sc, 0.3, 0.82);
                const sn = [];
                for (const sx of [-1, 1]) for (let k = 0; k < 4; k++) {
                    const a = UF([sx * (16 + k * 17) - 4, 1.9]);
                    sn.push(...script(a, [Math.cos(rule + rot), Math.sin(rule + rot)], 8, 2.6, r));
                }
                engrave(rl, sn, 0.3, 0.82);
                engrave(rl, [circ(PC, 6)], 0.36, 0.8);
                rl.restore();
                air(rl, { color: '#ffe9a0', alpha: 0.7, w: 1, push: 0 });
                air(rl, { color: '#2a160c', alpha: 0.7, w: 2.6, push: 1.5 });
                air(rl, { color: '#fff3c0', alpha: 0.55, w: 1.6, push: 1, dir: TOL });
                stampOn(main, rl, { lw: 1.05, heavy: 0.75, ink: '#1c1410', depth: 1.1, side: '#6a4a1a', cast: { blur: 2.4, dx: 2.4, dy: 3.2, color: 'rgba(18,8,6,0.8)' } });
                // the pin: a slotted post; the horse through it
                const post = (rad, fill, o2 = {}) => S.piece(main, S.ellipse(PC[0], PC[1], rad, rad, 22), { fill, line: 0.8, ink: '#1c1410', heavy: 0.7, shade: { color: BRASS.deep, alpha: 0.9, w: rad, push: rad * 0.55 }, light: { color: BRASS.glint, alpha: 0.9, w: rad * 0.7, push: rad * 0.45 }, ...o2 });
                post(4.4, '#a87c2a', { cast: { blur: 1.2, dx: 0.9, dy: 1.2, color: 'rgba(20,10,10,0.7)' } });
                const ha = rule + 1.95, ch = Math.cos(ha), shh = Math.sin(ha);
                const HF = (p) => F([C[0] + p[0] * ch - p[1] * shh, C[1] + p[0] * shh + p[1] * ch]);
                // a wedge with a horse's head: ears, brow, muzzle, the jaw, then the long taper
                const horse = S.curve([[-15, -0.6], [-12.5, -3.2], [-12.2, -5.6], [-10.6, -3.6], [-9.6, -3.4], [-9.2, -5.4], [-7.6, -3], [-5, -2.6], [0, -2.2], [8, -1.5], [15.5, -0.4], [15.5, 0.4], [8, 1.3], [0, 2], [-5, 2.2], [-8, 3], [-11, 4.4], [-14, 4.6], [-15.6, 3], [-14.4, 1.4]].map(([px, py]) => [px * 1.25, py * 1.2]), true, 4).map(HF);
                S.piece(main, horse, {
                    fill: BRASS.mid, line: 0.85, ink: '#1c1410', heavy: 0.75,
                    cast: { blur: 1.4, dx: 1.3, dy: 1.7, color: 'rgba(20,10,10,0.72)' },
                    shade: { color: BRASS.deep, alpha: 0.85, w: 2.4, push: 1.4 }, light: { color: BRASS.glint, alpha: 0.9, w: 1.6, push: 1 },
                    detail: (d) => {
                        engrave(d, [[HF([-15.8, 0.8]), HF([-14.8, 0.3])], [HF([-17, 4]), HF([-14.4, 3.8])], [HF([-9, -1.2]), HF([-2, 0.2]), HF([8, 0])], [HF([-11.5, -2.6]), HF([-9.5, 1.6])]], 0.3, 0.85);
                        scuff(d, S.bbox(horse), r, { n: 14, len: [1, 4] });
                    },
                });
                // the post's cheeks grip it on both sides
                for (const sy of [-1, 1]) {
                    const ck = [[-2.2, sy * 2.3], [2.2, sy * 2.3], [1.8, sy * 4.3], [-1.8, sy * 4.3]].map(HF);
                    S.piece(main, ck, { fill: '#a87c2a', line: 0.7, ink: '#1c1410', heavy: 0.6, shade: { color: BRASS.deep, alpha: 0.8, w: 1.4, push: 0.8 }, light: { color: BRASS.glint, alpha: 0.9, w: 1, push: 0.6 } });
                }
            }
        });
    }

    // ================================================================== 2 · the votive crown
    // VISIGOTHS, 7th century. A votive crown with its hanging cross, of the type of the
    // treasures of Torredonjimeno (Jaén) and Guarrazar (Toledo): never worn, but hung over an
    // altar as an offering.
    //   Anatomy: a hoop of sheet gold (two halves on a hinge) set with cabochon sapphires and
    //   pearls in collets between two rows of beaded wire; four chains from its upper rim meet
    //   under a knob of rock crystal held between two gold lilies; pendants hang from its lower
    //   rim; a gold cross with flared arms hangs through its centre on a chain of its own.
    //   Seen a little from below, as it hung: the hoop is an ellipse, the far wall's inside
    //   shows through the opening, the far pendants hang lower than the near ones.
    //   1 every chain link drawn: round links seen flat and on edge by turns  2 in each of the
    //   four chains one pierced leaf-shaped link, as at Guarrazar  3 the sapphires are polished
    //   pebbles, none the same blue or the same outline; one is an amethyst, one green
    //   4 pearls yellowed, drilled and pinned, one flaked  5 a collet that has lost its stone
    //   6 collets near the hoop's sides seen from the side, standing proud of the silhouette
    //   7 the hinge with its pin; rivets of the settings showing inside the far wall  8 the
    //   pendants: a link or two, a small set stone, then a drop (a sapphire pear, a pearl or a
    //   gold leaf); one chain has lost its drop  9 the cross: stones in collets, pearls between,
    //   a punched border, drops from its arms and foot  10 the knob: crystal that carries the
    //   image of its gold mounts upside down; a worn suspension hook.
    function votive(g, o = {}) {
        const { x = 0, y = 0, s = 1, rot = 0, seed = 1 } = o;
        const F = frame(rot, 1, 0, 0.5);
        sheet(g, x, y, s, reach({ x: -99, y: -145, w: 198, h: 290 }, rot), (q) => {
            const r = Motion.rng('heirloom-votive/' + seed);
            const RX = 87, RY = 14, BY = 8, TY = -24; // the hoop: rim ellipses (lower, upper)
            const lit = F([-1, 0])[0] * TOL[0] + F([-1, 0])[1] * TOL[1] >= 0 ? -1 : 1; // which side of the hoop faces the lamp
            const near = (th, v) => [RX * Math.sin(th), lerp(TY, BY, v) - RY * Math.cos(th)];
            const far = (th, v) => [RX * Math.sin(th), lerp(TY, BY, v) + RY * Math.cos(th)];
            const step = (fn, a = 0.3, w = 3) => {
                // whatever `fn` paints steps back into the air: a veil of the night on it alone
                const p = like(q);
                fn(p);
                p.save();
                p.globalCompositeOperation = 'source-atop';
                p.setTransform(1, 0, 0, 1, 0, 0);
                p.fillStyle = `rgba(30,22,56,${a})`;
                p.fillRect(0, 0, p.canvas.width, p.canvas.height);
                p.restore();
                q.save();
                q.setTransform(1, 0, 0, 1, 0, 0);
                q.drawImage(p.canvas, 0, 0);
                q.restore();
            };
            // ---- chains: round links, flat and on edge by turns; `leaf` puts a pierced leaf link in the run
            const link = (d, c, a, on, k = 1) => {
                const ca = Math.cos(a), sa = Math.sin(a);
                if (on) wire(d, [[c[0] - ca * 3.1 * k, c[1] - sa * 3.1 * k], [c[0] + ca * 3.1 * k, c[1] + sa * 3.1 * k]], 1.55 * k, GOLD, { lw: 0.6 * k });
                else wire(d, S.ellipse(c[0], c[1], 3.9 * k, 2.3 * k, 18, a), 1.2 * k, GOLD, { closed: true, lw: 0.6 * k });
            };
            const chain = (d, A, B, { leaf = -1, k = 1, sag = 0 } = {}) => {
                const L = Math.hypot(B[0] - A[0], B[1] - A[1]), n = Math.max(2, Math.round(L / (5.3 * k))), a0 = Math.atan2(B[1] - A[1], B[0] - A[0]);
                const at = (t) => [lerp(A[0], B[0], t) + sag * Math.sin(Math.PI * t) * -Math.sin(a0), lerp(A[1], B[1], t) + sag * Math.sin(Math.PI * t) * Math.cos(a0)];
                const cs = [];
                for (let i = 0; i < n; i++) cs.push(at((i + 0.5) / n));
                // (a short chain carries its leaf higher up; one too short carries none)
                const lf = leaf >= 0 && n >= 7 ? Math.min(leaf, n - 5 - ((n - 5) % 2)) : -1;
                const skip = (i) => lf >= 0 && i > lf && i < lf + 3;
                for (let i = 0; i < n; i += 2) if (!skip(i)) link(d, cs[i], a0 + (r() - 0.5) * 0.24, false, k);
                if (lf >= 0) {
                    // a leaf of sheet gold, pierced, with an eye at each end
                    const c = lerpP(cs[lf + 1], cs[lf + 2], 0.5), ca = Math.cos(a0), sa = Math.sin(a0);
                    const M = (u, v) => [c[0] + ca * u - sa * v, c[1] + sa * u + ca * v];
                    const pts = S.curve([M(-8, 0), M(-5.5, -2.2), M(-1, -4.4), M(3.5, -3.6), M(8, 0), M(3.5, 3.6), M(-1, 4.4), M(-5.5, 2.2)], true, 5);
                    const p = like(d);
                    S.piece(p, pts, { fill: GOLD.mid, line: 0, shade: { color: GOLD.shade, alpha: 0.9, w: 3, push: 1.8 }, light: { color: GOLD.glint, alpha: 0.8, w: 2.4, push: 1.5 } });
                    p.save();
                    p.globalCompositeOperation = 'destination-out';
                    for (const [u, v, rr] of [[-0.5, 0, 1.5], [3.4, 0, 1.1], [-4.2, 0, 1], [1.4, -2.2, 0.75], [1.4, 2.2, 0.75], [-6.6, 0, 0.7], [6.6, 0, 0.7]]) disc(p, M(u, v), rr, '#000');
                    p.restore();
                    p.save();
                    p.globalCompositeOperation = 'source-atop';
                    strokeP(p, [M(-6, 0.3), M(6, 0.3)], 0.35, 'rgba(74,44,16,0.6)');
                    p.restore();
                    stampOn(d, p, { lw: 0.6, heavy: 0.7, ink: INK });
                }
                for (let i = 1; i < n; i += 2) if (!skip(i)) link(d, cs[i], a0 + (r() - 0.5) * 0.2, true, k);
            };
            // a pendant: a link or two, a small set stone, a drop
            const pendant = (d, top, len, kind) => {
                const sw = (r() - 0.5) * 0.14, dir = [Math.sin(sw - rot * 0), Math.cos(sw)];
                const P0 = F(top), down = F([top[0] + dir[0], top[1] + dir[1]]), u = [down[0] - P0[0], down[1] - P0[1]];
                const at = (t) => [P0[0] + u[0] * t, P0[1] + u[1] * t];
                chain(d, at(0.5), at(len * 0.42), { k: 0.72 });
                if (kind === 'lost') {
                    // the drop is gone: the last link hangs open
                    wire(d, arc(at(len * 0.42 + 2), 1.9, 0.6, 5.2, 10), 0.9, GOLD, { lw: 0.5 });
                    return;
                }
                const sc = at(len * 0.5), k2 = r();
                cabochon(d, sc, 2.5, 2.5, 0, k2 < 0.4 ? STONE.garnet : k2 < 0.7 ? STONE.emerald : STONE.azure, r, { collet: 1, cast: false, line: 0.6 });
                wire(d, [at(len * 0.5 + 3.2), at(len * 0.5 + 5)], 0.9, GOLD, { lw: 0.5 });
                const c = at(len * 0.78), a = Math.atan2(u[1], u[0]) - Math.PI / 2;
                const M = (px, py) => [c[0] + px * Math.cos(a) - py * Math.sin(a), c[1] + px * Math.sin(a) + py * Math.cos(a)], h = len * 0.2;
                const pear = S.curve([M(0, -h), M(1.5, -h * 0.5), M(3.3, h * 0.3), M(2.3, h * 0.9), M(0, h * 1.08), M(-2.3, h * 0.9), M(-3.3, h * 0.3), M(-1.5, -h * 0.5)], true, 5);
                if (kind === 'pearl') pearl(d, M(0, h * 0.2), 3.3, r, { cast: false });
                else if (kind === 'leaf') {
                    S.piece(d, pear, {
                        fill: GOLD.mid, line: 0.75, heavy: 0.7, shade: { color: GOLD.shade, alpha: 0.9, w: 2.6, push: 1.5 }, light: { color: GOLD.glint, alpha: 0.85, w: 2, push: 1.2 },
                        detail: (e) => {
                            strokeP(e, [M(0, -h * 0.8), M(0.2, h * 0.9)], 0.35, 'rgba(74,44,16,0.7)');
                            for (const t of [-0.3, 0.1, 0.5]) for (const sx of [-1, 1]) strokeP(e, [M(0, h * t), M(sx * 2.2, h * (t + 0.28))], 0.25, 'rgba(74,44,16,0.5)');
                        },
                    });
                } else {
                    const P = kind === 'azure' ? STONE.azure : STONE.sapphire;
                    S.piece(d, pear, {
                        fill: P.mid, line: 0.6, ink: P.ink, heavy: 0.5,
                        detail: (e) => {
                            glow(e, M(1, h * 0.6), 4.5, P.glow, 0.95);
                            glow(e, M(-1.4, -h * 0.3), 4.5, P.deep, 0.9);
                            strokeP(e, pear, 1, S.rgba(P.ink, 0.4), true);
                            fillP(e, S.ellipse(...M(-1.1, h * 0.05), 1.3, 0.6, 10, a + 1.1), S.rgba(P.spark, 0.95));
                            disc(e, M(-0.3, h * 0.55), 0.35, S.rgba(P.spark, 0.7));
                        },
                    });
                    // drilled through its neck, on a gold wire
                    wire(d, arc(M(0, -h), 1.2, 0, TAU, 10), 0.6, GOLD, { closed: true, lw: 0.4 });
                }
            };

            // ---- the knob: hook, a lily, the crystal, a lily, the ring the chains hang from
            const HANG = [0, -94];
            wire(q, F.pts(S.curve([[2.2, -128.5], [3.6, -132], [2.6, -137.6], [-1.4, -139.6], [-4.6, -136.6], [-3.6, -132.4], [-0.6, -130.4]], false, 6)), 2, GOLD, { lw: 0.9 });
            const lily = (yy, dirn) => {
                // a calyx of sheet gold: three petals flaring towards the crystal
                const k = dirn, pts = S.curve([[-2.6, yy], [2.6, yy], [3.4, yy + 4 * k], [7.6, yy + 8.4 * k], [9.6, yy + 11.6 * k], [6.2, yy + 10.2 * k], [3.3, yy + 12.6 * k], [0, yy + 10.6 * k], [-3.3, yy + 12.6 * k], [-6.2, yy + 10.2 * k], [-9.6, yy + 11.6 * k], [-7.6, yy + 8.4 * k], [-3.4, yy + 4 * k]], true, 5);
                S.piece(q, F.pts(pts), {
                    fill: GOLD.mid, line: 1.1, heavy: 0.8, cast: { blur: 1.6, dx: 1, dy: 1.4, color: 'rgba(30,14,10,0.6)' },
                    shade: [{ color: GOLD.shade, alpha: 0.9, w: 5, push: 3 }, { color: GOLD.deep, alpha: 0.6, w: 2, push: 1 }], light: { color: GOLD.glint, alpha: 0.85, w: 3, push: 2 },
                    detail: (d) => {
                        for (const sx of [-1, 0, 1]) strokeP(d, F.pts([[sx * 1.2, yy + 2 * k], [sx * 5.6, yy + 10.5 * k]]), 0.4, 'rgba(74,44,16,0.7)');
                        for (const sx of [-0.5, 0.5]) strokeP(d, F.pts([[sx * 2.4, yy + 3 * k], [sx * 6.2, yy + 9.6 * k]]), 0.3, 'rgba(255,246,210,0.6)');
                        strokeP(d, F.pts([[-3, yy + 1.6 * k], [3, yy + 1.6 * k]]), 0.5, 'rgba(74,44,16,0.7)');
                    },
                });
            };
            const KC = [0, -111.5];
            cabochon(q, F(KC), 9.4, 9, rot, STONE.crystal, r, {
                collet: 0, wob: 0.03, cast: false,
                detail: (d) => {
                    // rock crystal: the gold above and below it seen through it, upside down; a flaw
                    const c = F(KC);
                    fillP(d, F.pts(S.ellipse(0, -105.6, 6.4, 2.2, 14)), 'rgba(217,164,65,0.6)');
                    fillP(d, F.pts(S.ellipse(0.6, -117, 5.6, 1.8, 14)), 'rgba(138,90,23,0.5)');
                    strokeP(d, [[c[0] - 5, c[1] + 2], [c[0] - 1, c[1] - 1.4], [c[0] + 3.6, c[1] - 0.4]], 0.3, 'rgba(255,255,255,0.7)');
                    strokeP(d, [[c[0] - 1, c[1] - 1.4], [c[0] + 0.5, c[1] + 3.6]], 0.25, 'rgba(255,255,255,0.5)');
                    strokeP(d, arc(c, 7.4, 0.3, 2.2, 12), 0.7, 'rgba(46,50,96,0.45)');
                },
            });
            lily(-130, 1);
            lily(-93, -1);
            wire(q, F.pts(S.ellipse(HANG[0], HANG[1] + 2.6, 3, 2.6, 16)), 1.3, GOLD, { closed: true, lw: 0.8 });

            // ---- the far side: two chains, the inside of the far wall, the far pendants
            const ATT = [[-65, 0], [25, 0], [-25, 1], [65, 1]].map(([dg, back]) => ({ p: back ? far(dg * D2R, 0) : near(dg * D2R, 0), back }));
            const hang = F([HANG[0], HANG[1] + 4.6]);
            step((d) => {
                for (const A of ATT) if (A.back) chain(d, lerpP(hang, F(A.p), 0.03), F(A.p), { leaf: 7 });
                // the inside of the far wall, seen through the opening
                const lens = F.pts(S.ellipse(0, BY, RX, RY, 60));
                S.piece(d, lens, {
                    fill: { from: F([lit * RX, BY]), to: F([-lit * RX, BY]), stops: [[0, '#4a2c10'], [0.45, '#8a5a17'], [0.8, '#c08a2c'], [1, '#8a5a17']] },
                    line: 1.2, heavy: 0.4,
                    detail: (e) => {
                        // planished: the hammer's facets; the settings' rivets come through
                        for (let i = 0; i < 46; i++) {
                            const th = (r() - 0.5) * 3, p = F([RX * Math.sin(th) * 0.97, BY + (r() - 0.2) * RY * Math.cos(th)]);
                            fillP(e, S.ellipse(p[0], p[1], 1 + r() * 1.6, 0.8 + r() * 1.2, 8, r() * 3), S.rgba(r() < 0.5 ? '#f6dc8a' : '#3a2210', 0.1 + r() * 0.16));
                        }
                        for (let dg = -70; dg <= 70; dg += 20) {
                            const p = F([RX * Math.sin(dg * D2R), BY + RY * Math.cos(dg * D2R) * 0.25]);
                            disc(e, [p[0] + 0.3, p[1] + 0.4], 0.9, 'rgba(40,20,8,0.7)');
                            disc(e, p, 0.7, '#d9a441');
                        }
                        // the near wall's rim throws its shadow in
                        S.spray(e, lens, { color: '#1c0e08', alpha: 0.8, w: 6, push: 4.5, dir: [0, -1] });
                        strokeP(e, F.pts(arc([0, BY], 1, 0.1, Math.PI - 0.1, 30).map(([px, py]) => [px * RX * 0.985, BY + (py - BY) * RY * 0.86])), 0.6, 'rgba(255,236,170,0.5)');
                    },
                });
                for (const dg of [-72, -48, -24, 24, 48, 72]) {
                    const kinds = ['pearl', 'leaf', 'sapphire', 'azure', 'leaf', 'pearl'];
                    pendant(d, far(dg * D2R, 1), 24 + r() * 4, kinds[Math.floor(r() * kinds.length)]);
                }
            }, 0.34);

            // ---- the cross's own chain, down through the hoop
            const CR = [0, 87];
            chain(q, hang, F([0, CR[1] - 39]), { sag: 0 });

            // ---- the cross: flared arms, stones in collets, pearls, a punched border, drops
            {
                const arm = (len, w0, w1) => [[w0, -w0], [w0 * 1.06, -len * 0.5], [w1, -len + 1], [w1 * 0.5, -len - 0.8], [-w1 * 0.5, -len - 0.8], [-w1, -len + 1], [-w0 * 1.06, -len * 0.5]];
                const turn = (pts, a) => pts.map(([px, py]) => [px * Math.cos(a) - py * Math.sin(a), px * Math.sin(a) + py * Math.cos(a)]);
                const raw = [...arm(30, 4.6, 10.5), ...turn(arm(29, 4.6, 10.5), Math.PI / 2), ...turn(arm(38, 4.6, 11.5), Math.PI), ...turn(arm(29, 4.6, 10.5), -Math.PI / 2)];
                const out = F.pts(S.curve(raw.map(([px, py]) => [CR[0] + px + S.noise2(px * 0.2, py * 0.2, 3) * 0.5, CR[1] + py + S.noise2(px * 0.2, py * 0.2, 4) * 0.5]), true, 4));
                // its drops first: they hang behind the plate's edge
                for (const [px, py, kind] of [[-27, CR[1] + 9.5, 'sapphire'], [27, CR[1] + 9.5, 'pearl'], [-8.5, CR[1] + 37.5, 'pearl'], [0, CR[1] + 38.5, 'azure'], [8.5, CR[1] + 37.5, 'lost']]) pendant(q, [px, py], 15 + r() * 3, kind);
                wire(q, F.pts(S.ellipse(0, CR[1] - 33.5, 2.6, 3.4, 16)), 1.2, GOLD, { closed: true, lw: 0.8 });
                S.piece(q, out, {
                    fill: { from: F([-30, CR[1] - 30]), to: F([30, CR[1] + 38]), stops: [[0, '#f0cf78'], [0.45, GOLD.mid], [1, '#b07c26']] },
                    line: 1.9, heavy: 0.85, cast: { blur: 2.4, dx: 1.6, dy: 2.2, color: 'rgba(24,12,20,0.6)' },
                    shade: [{ color: GOLD.shade, alpha: 0.85, w: 7, push: 4 }, { color: GOLD.deep, alpha: 0.55, w: 2.4, push: 1.2 }],
                    light: { color: GOLD.glint, alpha: 0.7, w: 4, push: 2.6 },
                    detail: (d) => {
                        const b = S.bbox(out);
                        scuff(d, b, r, { n: 110, len: [1.5, 7], pits: 30 });
                        for (let i = 0; i < 12; i++) glow(d, [b.x + r() * b.w, b.y + r() * b.h], 3 + r() * 5, r() < 0.5 ? '#8a5a17' : '#fff0b8', 0.2);
                        // a punched border: a scribed line and a row of dots inside it
                        const inn = inset(out, 1.7);
                        engrave(d, [[...inn, inn[0]]], 0.36, 0.7, '#4a2c10', '#fff6d2');
                        for (const [px, py] of even(inset(out, 3.2), 1.9, true)) {
                            disc(d, [px + SD[0] * 0.25, py + SD[1] * 0.25], 0.4, 'rgba(255,246,210,0.7)');
                            disc(d, [px, py], 0.38, 'rgba(60,34,12,0.75)');
                        }
                    },
                });
                const ST = STONE;
                cabochon(q, F(CR), 6.2, 5.6, 0.3 + rot, ST.sapphire, r, { collet: 1.6, lift: 1.3 });
                for (const [px, py, P, rx, ry] of [[0, -21.5, ST.emerald, 3.6, 4.2], [21.5, 0, ST.garnet, 4.2, 3.5], [-21.5, 0, ST.amethyst, 4, 3.6], [0, 27, ST.azure, 3.8, 4.6]]) cabochon(q, F([CR[0] + px, CR[1] + py]), rx, ry, rot, P, r, { collet: 1.3 });
                for (const [px, py] of [[0, -11.5], [11.5, 0], [-11.5, 0], [0, 12.5], [0, 18.6], [-6.4, -25.6], [6.4, -25.6], [25.6, -6.4], [25.6, 6.4], [-25.6, -6.4], [-25.6, 6.4], [-7, 33.6], [7, 33.6]]) pearl(q, F([CR[0] + px, CR[1] + py]), 1.9 + r() * 0.5, r, { hole: false, line: 0.45 });
            }

            // ---- the near wall of the hoop
            const bandL = [];
            for (let i = 0; i <= 44; i++) bandL.push(near(lerp(-90, 90, i / 44) * D2R, 0));
            for (let i = 44; i >= 0; i--) bandL.push(near(lerp(-90, 90, i / 44) * D2R, 1));
            const band = F.pts(bandL);
            const A0 = F([lit * RX, 0]), A1 = F([-lit * RX, 0]);
            // a cylinder under the lamp: stops placed where the hoop's angle puts them
            const cyl = [[-90, '#9c6a22'], [-62, '#e8c064'], [-38, '#fbe6a2'], [-14, '#e2b04c'], [18, '#c18a2e'], [50, '#8f5c1c'], [76, '#5e3a12'], [90, '#8a5a1c']].map(([dg, c]) => [(Math.sin(dg * D2R) + 1) / 2, c]);
            S.piece(q, band, {
                fill: { from: A0, to: A1, stops: cyl }, line: 2.1, heavy: 0.85,
                cast: { blur: 2.6, dx: 1.6, dy: 2.2, color: 'rgba(24,12,20,0.55)' },
                shade: [{ color: '#6a3f14', alpha: 0.55, w: 9, push: 5 }, { color: GOLD.deep, alpha: 0.5, w: 2.6, push: 1.3 }],
                light: { color: GOLD.glint, alpha: 0.5, w: 5, push: 3 },
                detail: (d) => {
                    const b = S.bbox(band);
                    // planished sheet: soft facets; scratches; the rolled rims
                    for (let i = 0; i < 90; i++) {
                        const th = (r() - 0.5) * 3, p = F(near(th, r()));
                        fillP(d, S.ellipse(p[0], p[1], (1.2 + r() * 2.4) * Math.max(0.3, Math.cos(th)), 1 + r() * 2, 8, 0), S.rgba(r() < 0.5 ? '#fff0b8' : '#5a3712', 0.08 + r() * 0.14));
                    }
                    scuff(d, b, r, { n: 150, len: [1.5, 9], pits: 40 });
                    for (const [v, w, c] of [[0.035, 1.5, 'rgba(255,244,200,0.55)'], [0.075, 0.5, 'rgba(60,34,12,0.7)'], [0.925, 0.5, 'rgba(60,34,12,0.7)'], [0.962, 1.5, 'rgba(255,244,200,0.4)']]) {
                        const l = [];
                        for (let i = 0; i <= 44; i++) l.push(F(near(lerp(-90, 90, i / 44) * D2R, v)));
                        strokeP(d, l, w, c);
                    }
                    // the hinge between the hoop's two halves, with its pin
                    const hd = -47 * D2R, hk = Math.cos(hd);
                    strokeP(d, [F(near(hd, 0)), F(near(hd, 1))], 0.6, 'rgba(40,20,10,0.85)');
                    for (let k = 0; k < 5; k++) {
                        const p0 = near(hd, 0.1 + k * 0.17), p1 = near(hd, 0.1 + k * 0.17 + 0.13);
                        const kn = F.pts([[p0[0] - 1.6 * hk, p0[1]], [p0[0] + 1.6 * hk, p0[1]], [p1[0] + 1.6 * hk, p1[1]], [p1[0] - 1.6 * hk, p1[1]]]);
                        fillP(d, kn, k % 2 ? '#c8922e' : '#eac870');
                        strokeP(d, kn, 0.4, 'rgba(50,28,10,0.85)', true);
                    }
                    // a ring of punched dots round each great setting
                    for (let dg = -80; dg <= 80; dg += 20) {
                        const c = near(dg * D2R, 0.5), kx = Math.max(0.3, Math.cos(dg * D2R));
                        for (let k = 0; k < 16; k++) {
                            const p = F([c[0] + Math.cos(k * 0.3927) * 9.4 * kx, c[1] + Math.sin(k * 0.3927) * 9.4]);
                            disc(d, [p[0] + 0.2, p[1] + 0.25], 0.36, 'rgba(255,246,210,0.65)');
                            disc(d, p, 0.34, 'rgba(60,34,12,0.7)');
                        }
                    }
                },
            });
            // beaded wire along both rims, foreshortened round the hoop
            for (const v of [0.13, 0.87]) {
                const bs = [];
                for (let dg = -87; dg <= 87; dg += 2.5) bs.push([F(near(dg * D2R, v)), Math.max(0.28, Math.cos(dg * D2R))]);
                for (const [p, k] of bs) fillP(q, S.ellipse(p[0] + SD[0] * 0.35, p[1] + SD[1] * 0.35, 1.5 * k, 1.5, 10, rot), GOLD.deep);
                for (const [p, k] of bs) {
                    fillP(q, S.ellipse(p[0], p[1], 1.15 * k, 1.15, 10, rot), GOLD.shade);
                    fillP(q, S.ellipse(p[0] + TOL[0] * 0.2, p[1] + TOL[1] * 0.2, 0.85 * k, 0.85, 10, rot), GOLD.mid);
                    disc(q, [p[0] + TOL[0] * 0.42, p[1] + TOL[1] * 0.42], 0.4 * Math.max(0.5, k), GOLD.glint);
                }
            }
            // the settings: great stones and pearls by turns in the middle, small ones above and below
            const blues = [STONE.sapphire, STONE.azure, STONE.sapphire, STONE.amethyst, STONE.sapphire, STONE.emerald, STONE.azure];
            const setAt = (dg, v, big, i) => {
                const th = dg * D2R, k = Math.max(0.3, Math.cos(th)), c0 = near(th, v), c = F([c0[0] + Math.sin(th) * (big ? 2.6 : 1.4), c0[1]]);
                const rr = big ? 5.6 + r() * 0.8 : 2.5 + r() * 0.4;
                if (big && i === 6) {
                    // this one has lost its stone
                    const col = S.ellipse(c[0], c[1], (rr + 1.5) * k, rr + 1.5, 20, rot);
                    S.piece(q, col, { fill: GOLD.mid, line: 0.8, heavy: 0.7, cast: { blur: 1.5, dx: 1, dy: 1.3, color: 'rgba(36,14,10,0.62)' }, shade: { color: GOLD.deep, alpha: 0.85, w: 2.4, push: 1.4 }, light: { color: GOLD.glint, alpha: 0.95, w: 1.5, push: 1 } });
                    S.piece(q, S.ellipse(c[0], c[1], rr * k, rr, 20, rot), { fill: '#5a3a14', line: 0.5, ink: '#24120a', heavy: 0, shade: { color: '#1c0c06', alpha: 0.9, w: rr * 0.9, push: rr * 0.5, dir: TOL }, detail: (d) => scuff(d, { x: c[0] - rr, y: c[1] - rr, w: rr * 2, h: rr * 2 }, r, { n: 10, len: [1, 3], pits: 6 }) });
                    return;
                }
                if ((big && i % 2) || (!big && v < 0.5)) pearl(q, c, rr * (big ? 0.92 : 1) * (0.55 + 0.45 * k), r, {});
                else cabochon(q, c, rr * k, rr * (0.9 + r() * 0.2), rot + (r() - 0.5) * 0.4, big ? blues[(i + 3) % blues.length] : [STONE.garnet, STONE.emerald, STONE.azure][i % 3], r, { collet: big ? 1.5 : 1, lift: big ? 1.2 : 0.8 });
            };
            for (let i = 0; i < 9; i++) setAt(-80 + i * 20, 0.5, true, i);
            for (let i = 0; i < 8; i++) {
                setAt(-70 + i * 20, 0.29, false, i);
                setAt(-70 + i * 20, 0.71, false, i + 1);
            }

            // ---- the near chains, each from an eye riveted on the upper rim
            for (const A of ATT) {
                if (A.back) continue;
                const p = F(A.p);
                wire(q, S.ellipse(p[0], p[1] - 0.6, 2.4, 2.8, 14, rot), 1.3, GOLD, { closed: true, lw: 0.8 });
                chain(q, lerpP(hang, p, 0.03), [p[0], p[1] - 2.6], { leaf: 8 });
            }
            // ---- the near pendants
            {
                const kinds = ['sapphire', 'pearl', 'leaf', 'azure', 'pearl', 'sapphire', 'lost', 'leaf'], k0 = Math.floor(r() * 8);
                [-80, -58, -36, -13, 13, 36, 58, 80].forEach((dg, i) => {
                    const p = near(dg * D2R, 1);
                    pendant(q, [p[0], p[1] - 0.6], 23 + r() * 5, kinds[(i + k0) % kinds.length]);
                });
            }
        });
    }

    // ================================================================== 3 · the Byzantine cross
    // BYZANTINES, the province of Spania (Cartagena, Málaga), 6th–7th century. A gold pectoral
    // cross of the hollow reliquary kind (two shells of sheet gold on a hinge, worn on the
    // breast), lying on a patch of gold-ground wall mosaic of the kind the same empire set
    // from Ravenna to Constantinople.
    //   Anatomy: a cross with flared arms and a bead at each corner, a medallion at the
    //   crossing, a hinge and a ribbed loop at the top, a loop-in-loop chain through it. The
    //   mosaic: glass tesserae pressed by hand into a lime bed, in rows.
    //   1 gold tesserae are a sandwich (gold leaf under a skin of clear glass) and each was
    //   pressed in at its own tilt: some blaze, some are amber, some go dark  2 a few were set
    //   on their backs and show brown-red glass; one or two have lost the skin  3 rows that
    //   wander, tesserae never square, joints of grey lime  4 a jewelled border: blue, white,
    //   red and green «gems» between gold  5 sockets where tesserae fell out, with the red
    //   underpainting of the bed  6 the patch's broken edge: the fine bed over a coarser one
    //   7 the cross's punched border and ring-and-dot punches, a scribed palmette on each arm
    //   8 a dent in the hollow lower arm, the seam between its two shells  9 the medallion: a
    //   garnet in a collet inside beaded wire  10 the hinge's three knuckles and its pin; the
    //   chain as close-woven chevrons, ending in a hook.
    function byzantine(g, o = {}) {
        const { x = 0, y = 0, s = 1, rot = 0, seed = 1 } = o;
        const F = frame(rot, 1, 2.6, 3.2);
        sheet(g, x, y, s, reach({ x: -82, y: -108, w: 164, h: 216 }, rot), (main) => {
            const r = Motion.rng('heirloom-byzantine/' + seed);
            // ---- the patch: broken along its joints
            const rough = (ctrl, amp, stp) => {
                const out = [];
                for (let i = 0; i < ctrl.length; i++) {
                    const a = ctrl[i], b = ctrl[(i + 1) % ctrl.length], n = Math.max(2, Math.round(Math.hypot(b[0] - a[0], b[1] - a[1]) / stp));
                    for (let k = 0; k < n; k++) out.push([lerp(a[0], b[0], k / n) + (k ? (r() - 0.5) * amp : 0), lerp(a[1], b[1], k / n) + (k ? (r() - 0.5) * amp : 0)]);
                }
                return out;
            };
            const ctrl = [[-64, -90], [-28, -97], [8, -91], [42, -98], [69, -82], [73, -44], [65, -6], [72, 30], [63, 70], [40, 95], [6, 89], [-30, 98], [-61, 85], [-72, 50], [-65, 12], [-73, -28], [-69, -62]];
            const tessL = rough(ctrl, 5, 6), bedL = rough(ctrl.map(([px, py]) => [px * 1.055 + 1.5, py * 1.04 + 1.5]), 3.4, 5);
            const tess = F.pts(tessL), bed = F.pts(bedL);
            const m = like(main), bb = S.bbox(bed, 6);
            // the coarse bed (lime with crushed brick and straw), then the fine setting bed
            fillP(m, bed.map((p) => [p[0] + SD[0] * 3.6, p[1] + SD[1] * 3.6]), '#6f6252');
            fillP(m, bed.map((p) => [p[0] + SD[0] * 1.8, p[1] + SD[1] * 1.8]), '#8d7f6b');
            m.save();
            clipTo(m, bed);
            m.fillStyle = '#b7aa92';
            m.fillRect(bb.x, bb.y, bb.w, bb.h);
            for (let i = 0; i < 40; i++) glow(m, [bb.x + r() * bb.w, bb.y + r() * bb.h], 4 + r() * 14, r() < 0.5 ? '#8a7a62' : '#e2d8c2', 0.3);
            for (let i = 0; i < 260; i++) {
                const p = [bb.x + r() * bb.w, bb.y + r() * bb.h], k = r();
                fillP(m, S.ellipse(p[0], p[1], 0.3 + r() * 1.1, 0.25 + r() * 0.7, 7, r() * 3), k < 0.35 ? 'rgba(168,84,52,0.75)' : k < 0.7 ? 'rgba(84,72,58,0.6)' : 'rgba(240,234,218,0.7)');
            }
            scuff(m, bb, r, { n: 150, len: [1.5, 7], light: '#e8d9a6', dark: '#5a4c3c', alpha: [0.2, 0.5], dir: 0.3 });
            m.restore();
            // ---- the tesserae, row by row
            m.save();
            clipTo(m, tess);
            m.fillStyle = '#857866';
            m.fillRect(bb.x, bb.y, bb.w, bb.h);
            // the bed was painted red under the gold before the tesserae went in
            for (let i = 0; i < 26; i++) glow(m, [bb.x + r() * bb.w, bb.y + r() * bb.h], 5 + r() * 16, r() < 0.6 ? '#9a4a34' : '#5e5244', 0.3);
            const GOLDS = ['#4e3210', '#7a4f16', '#a8782a', '#cf9b3c', '#e6bd5e', '#f6dc8a', '#fff0b8'];
            const GLASS = {
                blue: ['#101f58', '#1c3486', '#2d51a8', '#4a74c4'], green: ['#0b3a2a', '#176048', '#2a8a62', '#52ae82'], red: ['#5e1410', '#8a2218', '#ac3824', '#c85a3a'],
                white: ['#b9b09c', '#d6cdb8', '#e8e1d0', '#f4efe2'], teal: ['#0f3c44', '#1c6068', '#2f8a8c', '#62b4ae'],
            };
            const PITCH = 5.3, tb = S.bbox(tessL);
            // which glass goes where: gold ground, then a jewelled border low down, then blue
            const kindAt = (px, py, i) => {
                const v = py - 0.06 * px; // the border runs a little off the level
                if (v < 36.5) return 'gold';
                if (v < 41.8) return 'blue';
                if (v < 47.1) return 'white';
                if (v < 57.7) {
                    const k = ((Math.floor((px + 200) / 5.6) % 8) + 8) % 8;
                    return k < 3 ? 'red' : k === 3 ? 'gold' : k < 7 ? 'green' : 'gold';
                }
                if (v < 63) return 'white';
                if (v < 68.3) return 'blue';
                return S.noise2(px * 0.08, py * 0.08, 7) > 0.25 ? 'teal' : 'blue';
            };
            for (let j = 0, yy = tb.y - 2; yy < tb.y + tb.h + PITCH; j++, yy += PITCH + (r() - 0.5) * 0.5) {
                const ph = r() * 9;
                for (let xx = tb.x - 3 - r() * 4; xx < tb.x + tb.w + 4;) {
                    const w = 3.7 + r() * 2.4, h = PITCH - 0.42 - r() * 0.4;
                    const wav = (px) => 2.6 * Math.sin(px * 0.03 + yy * 0.022) + 2.2 * S.noise2(px * 0.022, yy * 0.022, 3) + 0.4 * S.noise2(px * 0.09, j * 0.9, 4);
                    const j4 = () => (r() - 0.5) * 0.8;
                    const loc = [[xx + j4(), yy + wav(xx) + j4()], [xx + w + j4(), yy + wav(xx + w) + j4()], [xx + w + j4(), yy + h + wav(xx + w) + j4()], [xx + j4(), yy + h + wav(xx) + j4()]];
                    const cx = xx + w / 2, cy = yy + h / 2 + wav(cx);
                    xx += w + 0.38 + r() * 0.34;
                    if (!inPoly([cx, cy], tessL) && !inPoly(loc[0], tessL) && !inPoly(loc[2], tessL)) continue;
                    const pts = F.pts(loc), c = F([cx, cy]), kind = kindAt(cx, cy, j), fate = r();
                    if (fate < 0.022) {
                        // fallen out: its socket, red at the bottom
                        fillP(m, pts, '#7c4636');
                        m.save();
                        clipTo(m, pts);
                        m.translate(SD[0] * 0.9, SD[1] * 0.9);
                        strokeP(m, pts, 1.5, 'rgba(40,24,20,0.7)', true);
                        m.restore();
                        continue;
                    }
                    // its tilt: where its face looks, measured against the lamp
                    const tx = r() * 2 - 1, ty = r() * 2 - 1, face = (tx * TOL[0] + ty * TOL[1]) * 0.5 + (r() - 0.5) * 0.7;
                    m.save();
                    clipTo(m, pts);
                    let pal, tone;
                    if (kind === 'gold') {
                        pal = GOLDS;
                        tone = S.clamp(0.52 + face * 0.62);
                        if (fate < 0.07) {
                            pal = ['#3a1a14', '#5a2a1c', '#7a3c24', '#94502e']; // set on its back: the brown-red glass
                            tone = r();
                        } else if (fate < 0.1) {
                            pal = ['#56603a', '#7a8448', '#a0a45c', '#c4c47c']; // the skin lost, the leaf gone green
                            tone = r();
                        }
                    } else {
                        pal = GLASS[kind];
                        tone = S.clamp(0.45 + face * 0.55 + (r() - 0.5) * 0.3);
                    }
                    const fi = tone * (pal.length - 1), i0 = Math.floor(fi), base = S.mix(pal[i0], pal[Math.min(pal.length - 1, i0 + 1)], fi - i0);
                    m.fillStyle = base;
                    m.fillRect(c[0] - 6, c[1] - 6, 12, 12);
                    // the face is never flat: lighter towards where it tilts
                    const gd = m.createLinearGradient(c[0] - tx * 3, c[1] - ty * 3, c[0] + tx * 3, c[1] + ty * 3);
                    gd.addColorStop(0, S.rgba(pal[pal.length - 1], 0.5));
                    gd.addColorStop(0.5, S.rgba(pal[pal.length - 1], 0));
                    gd.addColorStop(1, S.rgba(pal[0], 0.6));
                    m.fillStyle = gd;
                    m.fillRect(c[0] - 6, c[1] - 6, 12, 12);
                    // cut edges: one lit, one in shade
                    m.save();
                    m.translate(SD[0] * 0.45, SD[1] * 0.45);
                    strokeP(m, pts, 0.5, S.rgba(kind === 'white' ? '#ffffff' : '#fff6d2', kind === 'gold' ? 0.5 + tone * 0.4 : 0.35), true);
                    m.restore();
                    m.save();
                    m.translate(TOL[0] * 0.5, TOL[1] * 0.5);
                    strokeP(m, pts, 0.7, S.rgba(pal[0], 0.85), true);
                    m.restore();
                    const q2 = r();
                    if (kind !== 'white' && q2 < 0.16) {
                        // it mirrors the lamp: a hard glint
                        fillP(m, S.ellipse(c[0] + (r() - 0.5) * 1.6, c[1] + (r() - 0.5) * 1.4, 0.9 + r() * 0.9, 0.35 + r() * 0.3, 8, -0.8 + (r() - 0.5)), 'rgba(255,253,240,0.92)');
                    } else if (q2 < 0.34) {
                        // a pit, a scratch, a chipped corner
                        const p0 = [c[0] + (r() - 0.5) * 3, c[1] + (r() - 0.5) * 3];
                        strokeP(m, [p0, [p0[0] + (r() - 0.5) * 3, p0[1] + (r() - 0.5) * 3]], 0.25, S.rgba(pal[0], 0.8));
                        disc(m, [c[0] + (r() - 0.5) * 3, c[1] + (r() - 0.5) * 3], 0.25, S.rgba(pal[0], 0.8));
                    } else if (q2 < 0.4) {
                        const k = Math.floor(r() * 4);
                        fillP(m, [pts[k], lerpP(pts[k], pts[(k + 1) % 4], 0.4), lerpP(pts[k], pts[(k + 3) % 4], 0.4)], '#8a7c68');
                    }
                    m.restore();
                }
            }
            // dirt and smoke in the joints, heavier low down
            for (let i = 0; i < 18; i++) glow(m, [bb.x + r() * bb.w, bb.y + r() * bb.h], 8 + r() * 24, r() < 0.7 ? '#2a1c18' : '#fff0c0', 0.14);
            m.restore();
            // the tesserae stand a hair proud of the bed along the break
            m.save();
            m.beginPath();
            m.rect(bb.x - 4, bb.y - 4, bb.w + 8, bb.h + 8);
            S.trace(m, tess);
            m.clip('evenodd');
            clipTo(m, bed);
            S.cast(m, (d) => fillP(d, tess, '#000'), { blur: 1.4, dx: 1.2, dy: 1.6, color: 'rgba(30,20,16,0.7)' });
            m.restore();
            air(m, { color: '#1c1220', alpha: 0.4, w: 14, push: 8 });
            air(m, { color: '#fff4d6', alpha: 0.2, w: 10, push: 6, dir: TOL });
            stampOn(main, m, { lw: 2, heavy: 0.85 });

            // ---- the chain: loop-in-loop, close-woven, lying where it fell
            const KA = 0.13, K = [3, -5], ck = Math.cos(KA), sk = Math.sin(KA);
            const KL = (p) => [K[0] + p[0] * ck - p[1] * sk, K[1] + p[0] * sk + p[1] * ck], KF = (p) => F(KL(p));
            const top = KL([0, -55.5]);
            const weave = (pathL, w = 3.7) => {
                const st = even(F.pts(S.curve(pathL, false, 14)), 1.55);
                const side = (k) => st.map(([px, py, tx, ty]) => [px - ty * k, py + tx * k]);
                S.cast(main, (d) => {
                    d.lineCap = 'round';
                    strokeP(d, st, w + 1, '#000');
                }, { blur: 1.6, dx: 1.3, dy: 1.8, color: 'rgba(24,12,12,0.7)' });
                main.save();
                main.lineCap = 'round';
                main.lineJoin = 'round';
                main.translate(SD[0] * 0.5, SD[1] * 0.5);
                strokeP(main, st, w + 1.5, INK);
                main.restore();
                main.lineCap = 'round';
                strokeP(main, st, w + 1.4, INK);
                strokeP(main, st, w, '#7a4c14');
                // each link: a chevron, its lit limb and its shaded one
                st.forEach(([px, py, tx, ty], i) => {
                    const nx = -ty, ny = tx, h = w * 0.46;
                    const tipx = px + tx * 1.5, tipy = py + ty * 1.5;
                    for (const sg of [-1, 1]) {
                        const bx = px + nx * h * sg - tx * 0.3, by = py + ny * h * sg - ty * 0.3;
                        const litk = (nx * sg * TOL[0] + ny * sg * TOL[1]) * 0.5 + 0.5;
                        main.lineWidth = 1.05;
                        main.strokeStyle = S.mix(GOLD.shade, GOLD.light, litk);
                        main.beginPath();
                        main.moveTo(bx, by);
                        main.lineTo(tipx, tipy);
                        main.stroke();
                    }
                    if (i % 2 === 0) disc(main, [tipx + TOL[0] * 0.2, tipy + TOL[1] * 0.2], 0.3, GOLD.glint);
                });
            };
            weave([[-62, -52], [-52, -70], [-34, -80], [-14, -74], top]);
            weave([top, [22, -70], [42, -66], [56, -50], [57, -28], [48, -10], [51, 6]]);
            {
                // the hook that closed it
                const h = F.pts(S.curve([[51, 6], [53, 12], [50, 17], [45, 16], [44.5, 12]], false, 6));
                wire(main, h, 1.3, GOLD, { lw: 0.8 });
            }

            // ---- the cross
            const c = like(main);
            const A = (len, w0, w1) => [[w0, -w0], [w0, -w0], [w0 * 1.1, -len * 0.55], [w1, -len], [w1, -len], [w1 * 0.4, -len - 1], [-w1 * 0.4, -len - 1], [-w1, -len], [-w1, -len], [-w0 * 1.1, -len * 0.55]];
            const tn = (pts, a) => pts.map(([px, py]) => [px * Math.cos(a) - py * Math.sin(a), px * Math.sin(a) + py * Math.cos(a)]);
            const rawX = [...A(41, 6.6, 12.5), ...tn(A(38, 6.6, 12.5), Math.PI / 2), ...tn(A(60, 6.6, 13.5), Math.PI), ...tn(A(38, 6.6, 12.5), -Math.PI / 2)];
            const out = S.curve(rawX, true, 4).map(KF);
            fillP(c, out, GOLD.mid);
            const corners = [[12.5, -41], [-12.5, -41], [38, -12.5], [38, 12.5], [13.5, 60], [-13.5, 60], [-38, 12.5], [-38, -12.5]];
            for (const p of corners) disc(c, KF([p[0] * 1.02, p[1] * 1.02]), 2.9, GOLD.mid);
            const xb = S.bbox(out, 4);
            c.save();
            c.globalCompositeOperation = 'source-atop';
            // sheet gold over a hollow: light on the upper left of every arm, a soft swell along each
            const xg = c.createLinearGradient(xb.x, xb.y, xb.x + xb.w, xb.y + xb.h);
            xg.addColorStop(0, '#fbe8a8');
            xg.addColorStop(0.4, GOLD.mid);
            xg.addColorStop(1, '#a8741f');
            c.fillStyle = xg;
            c.fillRect(xb.x, xb.y, xb.w, xb.h);
            for (const [ax, ay, bx, by] of [[0, -8, 0, -38], [8, 0, 35, 0], [0, 8, 0, 56], [-8, 0, -35, 0]]) {
                const a = KF([ax, ay]), b = KF([bx, by]);
                c.lineCap = 'round';
                strokeP(c, [[a[0] + TOL[0] * 2, a[1] + TOL[1] * 2], [b[0] + TOL[0] * 2, b[1] + TOL[1] * 2]], 5, 'rgba(255,246,210,0.22)');
                strokeP(c, [[a[0] + SD[0] * 3, a[1] + SD[1] * 3], [b[0] + SD[0] * 3, b[1] + SD[1] * 3]], 4, 'rgba(120,72,20,0.22)');
            }
            for (let i = 0; i < 22; i++) glow(c, [xb.x + r() * xb.w, xb.y + r() * xb.h], 3 + r() * 7, r() < 0.5 ? '#8a5a17' : '#fff0b8', 0.2);
            scuff(c, xb, r, { n: 240, len: [1.5, 9], pits: 60 });
            // a dent in the hollow lower arm
            {
                const d = KF([3, 38]);
                glow(c, d, 6, '#5a3712', 0.6);
                glow(c, [d[0] + SD[0] * 3, d[1] + SD[1] * 3], 4.5, '#fff6d2', 0.6);
                strokeP(c, [KF([-2, 34]), KF([2, 37]), KF([8, 38])], 0.4, 'rgba(74,44,16,0.6)');
            }
            // the punched border: a scribed line, a row of dots; ring-and-dot punches; a palmette on each arm
            const base = S.curve(rawX, true, 4);
            const scr = [];
            const in1 = inset(base, 2).map(KF);
            scr.push([...in1, in1[0]]);
            engrave(c, scr, 0.38, 0.75, '#4a2c10', '#fff6d2');
            for (const [px, py] of even(inset(base, 3.9).map(KF), 2.1, true)) {
                disc(c, [px + SD[0] * 0.28, py + SD[1] * 0.28], 0.46, 'rgba(255,246,210,0.75)');
                disc(c, [px, py], 0.44, 'rgba(58,32,10,0.8)');
            }
            const rings = [], pal2 = [];
            const ring = (p, rad) => rings.push(arc(KF(p), rad, 0, TAU, 14));
            for (const p of [[0, -33], [30.5, 0], [-30.5, 0], [0, 51], [0, 22]]) {
                ring(p, 2.6);
                ring(p, 1.3);
                rings.push([KF([p[0] - 0.15, p[1]]), KF([p[0] + 0.15, p[1]])]);
            }
            const palm = (o0, a) => {
                // a stem and two half palmettes curling back
                const M = (px, py) => KF([o0[0] + px * Math.cos(a) - py * Math.sin(a), o0[1] + px * Math.sin(a) + py * Math.cos(a)]);
                pal2.push([M(0, 0), M(0, -8)]);
                for (const sx of [-1, 1]) {
                    pal2.push(S.curve([M(0, -3.5), M(sx * 2.6, -6.4), M(sx * 4.2, -4.4), M(sx * 3.2, -2.4), M(sx * 2, -3.4)], false, 5));
                    pal2.push(S.curve([M(0, -7), M(sx * 1.8, -9.6), M(sx * 3.4, -8.6)], false, 5));
                }
                pal2.push([M(-0.9, -9.6), M(0, -11.4), M(0.9, -9.6)]);
            };
            palm([0, -12.5], 0);
            palm([12.5, 0], Math.PI / 2);
            palm([-12.5, 0], -Math.PI / 2);
            palm([0, 31], 0);
            palm([0, 47.5], 0);
            engrave(c, rings, 0.34, 0.8, '#4a2c10', '#fff6d2');
            engrave(c, pal2, 0.36, 0.8, '#4a2c10', '#fff6d2');
            c.restore();
            air(c, { color: '#ffefb0', alpha: 0.6, w: 1.2, push: 0 });
            air(c, { color: '#5a3410', alpha: 0.7, w: 7, push: 4 });
            air(c, { color: '#3a1c10', alpha: 0.5, w: 2, push: 1 });
            air(c, { color: '#fff8dc', alpha: 0.55, w: 4, push: 2.6, dir: TOL });
            stampOn(main, c, { lw: 1.5, heavy: 0.8, depth: 2.6, side: '#7a4c14', cast: { blur: 4, dx: 4, dy: 5.4, color: 'rgba(22,10,10,0.72)' } });
            // the medallion: beaded wire, a garnet in its collet
            const MC = KF([0, 0]);
            S.piece(main, S.ellipse(MC[0], MC[1], 10.2, 10.2, 40), {
                fill: GOLD.mid, line: 0.9, ink: '#2a1410', heavy: 0.8, cast: { blur: 1.8, dx: 1.2, dy: 1.6, color: 'rgba(40,18,8,0.65)' },
                shade: { color: GOLD.shade, alpha: 0.9, w: 5, push: 3 }, light: { color: GOLD.glint, alpha: 0.85, w: 3.4, push: 2.2 },
                detail: (d) => engrave(d, [arc(MC, 6.6, 0, TAU, 30)], 0.34, 0.7, '#4a2c10', '#fff6d2'),
            });
            beads(main, S.ellipse(MC[0], MC[1], 8.6, 8.6, 48), 0.95, GOLD, { closed: true, r });
            cabochon(main, MC, 4.6, 4.4, 0.4, STONE.garnet, r, { collet: 1.4, lift: 1.2 });
            // the hinge: three knuckles on a pin; the ribbed loop the chain runs through
            for (let k = 0; k < 3; k++) {
                const kn = [[-7.2 + k * 4.9, -45.8], [-2.7 + k * 4.9, -45.8], [-2.7 + k * 4.9, -41.6], [-7.2 + k * 4.9, -41.6]].map(KF);
                S.piece(main, kn, { fill: k === 1 ? '#e8c468' : GOLD.mid, line: 0.75, ink: '#2a1410', heavy: 0.7, cast: { blur: 0.8, dx: 0.5, dy: 0.7, color: 'rgba(40,18,8,0.6)' }, shade: { color: GOLD.shade, alpha: 0.9, w: 2.2, push: 1.3, dir: [0, 1] }, light: { color: GOLD.glint, alpha: 0.9, w: 1.4, push: 0.9, dir: [0, -1] } });
            }
            for (const sx of [-1, 1]) disc(main, KF([sx * 8.3, -43.7]), 1.05, sx < 0 ? GOLD.light : GOLD.shade);
            const loop = S.ellipse(0, -51, 4.4, 6.2, 26).map(KF);
            wire(main, loop, 2.5, GOLD, { closed: true, lw: 0.9 });
            for (let k = 0; k < 26; k += 2) {
                // its ribs
                const p = loop[k], q2 = KF([0, -51]), n = [(p[0] - q2[0]), (p[1] - q2[1])], l = Math.hypot(n[0], n[1]) || 1;
                strokeP(main, [[p[0] - (n[0] / l) * 1.1, p[1] - (n[1] / l) * 1.1], [p[0] + (n[0] / l) * 1.1, p[1] + (n[1] / l) * 1.1]], 0.3, 'rgba(74,44,16,0.7)');
            }
            // the chain passes over the near side of the loop
            main.save();
            clipTo(main, S.ellipse(0, -56.5, 5.2, 3, 16).map(KF));
            weave([[-14, -74], top, [22, -70]].map((p, i) => (i === 1 ? p : p)));
            main.restore();
        });
    }

    // ================================================================== 5 · the fawn
    // AL-ANDALUS, the Caliphate of Córdoba, 10th century. The bronze fawn of Madinat al-Zahra
    // (Museo Arqueológico de Córdoba; its fellows are in Madrid and Doha): a fountain spout
    // cast by the lost-wax process. The water came up through the base and out of the mouth.
    //   Anatomy: a young deer standing four-square on a rectangular base plate; the body a
    //   barrel, the neck a thick column, four straight legs like pipes with cloven hooves, a
    //   small head with a tube of a muzzle open at the end, almond eyes, small ears, a stub
    //   of a tail. The whole skin is chased with a net of tangent circles, each holding a
    //   split-palmette scroll.
    //   1 the circles are drawn round the barrel, so they close up towards the back and the
    //   belly  2 every circle a double line, in it a stem that splits into two curled half
    //   palmettes, a bud between them  3 a little four-point filler where four circles leave
    //   a gap  4 green patina lying in the engraving  5 remains of gilding in patches, worn
    //   off where hands and water reached  6 the mouth: a round bore with a lit lip  7 the
    //   eye an almond with a double outline and a drilled pupil; a nostril; the ear's hollow
    //   8 the net runs on down the legs; hooves cloven, with two chased rings above them  9 the base plate with
    //   a scribed border and holes at its corners for fixing, one with its rivet  10 casting
    //   pits, the chasing worn shallow in places, lime scale where the water ran from the mouth.
    const BRONZE = [[0, '#0e0a14'], [0.3, '#1e141c'], [0.55, '#30201e'], [0.74, '#46311f'], [0.88, '#664827'], [0.96, '#8e6a3a'], [1, '#d2b684']];
    // a scalar field painted with the canvas and read back per pixel: (x, y) → 0..1
    function fieldOf(box, res, paint, blur = 0) {
        const w = Math.max(2, Math.ceil(box.w * res)), h = Math.max(2, Math.ceil(box.h * res));
        const c = document.createElement('canvas');
        c.width = w;
        c.height = h;
        const q = c.getContext('2d', { willReadFrequently: true });
        q.fillStyle = '#000';
        q.fillRect(0, 0, w, h);
        if (blur) q.filter = `blur(${(blur * res).toFixed(2)}px)`;
        q.setTransform(res, 0, 0, res, -box.x * res, -box.y * res);
        paint(q);
        const d = q.getImageData(0, 0, w, h).data;
        return (x, y) => d[(Math.min(h - 1, Math.max(0, Math.round((y - box.y) * res))) * w + Math.min(w - 1, Math.max(0, Math.round((x - box.x) * res)))) * 4] / 255;
    }
    const FAWN = (() => {
        const body = [[-62, 4], [-58, -13], [-42, -21], [0, -22.5], [40, -21.5], [58, -15], [67, 2], [66, 22], [56, 36], [20, 39.5], [-20, 39.5], [-49, 36], [-60, 22]];
        const neck = [[-62, 10], [-67, -20], [-69.5, -48], [-69.5, -74], [-41, -78], [-37, -52], [-30, -30], [-17, -18], [-34, 16]];
        const head = [[-40.5, -78], [-42, -91], [-48, -99.5], [-58, -102.5], [-69, -99], [-82, -92.5], [-94, -88.5], [-98.5, -83.5], [-97.5, -77], [-90, -74], [-78, -72.5], [-70, -70], [-58, -71], [-46, -73]];
        const ear = [[-51.5, -96.5], [-46, -106.5], [-36, -114], [-32, -111.5], [-34.5, -102.5], [-42, -95.5]];
        const tail = [[60, -12], [67, -20.5], [74, -25], [78, -22], [74.5, -15], [67, -6]];
        const leg = (x0, x1, top) => [[x0 - 1.5, top], [x1 + 1.5, top], [x1 - 0.4, 62], [x1 - 1.4, 88.5], [x1 + 1.4, 91], [x1 + 1.8, 99.5], [x0 - 1.8, 99.5], [x0 - 1.4, 91], [x0 + 1.4, 88.5], [x0 + 0.4, 62]];
        return { body, neck, head, ear, tail, legF: leg(-53, -35, 28), legH: leg(37.5, 56.5, 24), LF: [-53, -35], LH: [37.5, 56.5], box: { x: -106, y: -124, w: 192, h: 230 } };
    })();
    // The chasing: grooves painted white on black. The body's net is laid out on the barrel's
    // skin (u along it, a round it) and seen from the side; the neck's on its own column.
    function fawnChasing(q) {
        q.lineCap = 'round';
        q.lineJoin = 'round';
        q.strokeStyle = '#fff';
        const poly = (pts, w = 0.85) => {
            q.lineWidth = w;
            q.beginPath();
            S.trace(q, pts, false);
            q.stroke();
        };
        // one roundel through a mapping M(u, a) → [x, y]; `id` makes each a little its own
        const roundel = (M, u0, a0, rad, turn, id) => {
            const h = (k) => S.hashI(id, k, 7, 31) - 0.5;
            const c = Math.cos(turn + h(1) * 0.2), s = Math.sin(turn + h(1) * 0.2), kk = rad * (1 + h(2) * 0.06), mir = h(3) > 0 ? 1 : -1;
            const P = (px, py) => M(u0 + (px * mir * c - py * s) * kk, a0 + (px * mir * s + py * c) * kk);
            const ring = (k) => {
                const pts = [];
                for (let i = 0; i <= 44; i++) pts.push(P(Math.cos((i / 44) * TAU) * k, Math.sin((i / 44) * TAU) * k));
                return pts;
            };
            poly(ring(1), 0.95);
            poly(ring(0.855), 0.6);
            // a stem that splits into two half palmettes, each curling back on itself, with leaflets
            poly([P(0, 0.84), P(0.02, 0.56), P(0, 0.28)], 0.85);
            poly([P(-0.14, 0.84), P(0, 0.7), P(0.14, 0.84)], 0.6);
            for (const sx of [-1, 1]) {
                poly(S.curve([[0, 0.3], [0.32, 0.2], [0.6, -0.06], [0.57, -0.42], [0.32, -0.64], [0.12, -0.5], [0.2, -0.3], [0.37, -0.36]].map(([px, py]) => P(px * sx, py)), false, 6), 0.8);
                poly([P(sx * 0.4, 0.17), P(sx * 0.6, 0.34), P(sx * 0.7, 0.2)], 0.6);
                poly([P(sx * 0.6, -0.08), P(sx * 0.79, -0.04)], 0.6);
                poly([P(sx * 0.55, -0.44), P(sx * 0.7, -0.5)], 0.6);
                poly([P(sx * 0.3, 0.02), P(sx * 0.42, -0.16)], 0.55);
            }
            // the bud between them
            poly([P(0, 0.06), P(-0.11, -0.12), P(0, -0.36), P(0.11, -0.12), P(0, 0.06)], 0.65);
            poly([P(0, -0.36), P(0, -0.78)], 0.55);
        };
        const clipP = (pts, fn) => {
            q.save();
            q.beginPath();
            S.trace(q, pts);
            q.clip();
            fn();
            q.restore();
        };
        // ---- the barrel
        const RB = 31.5, BY = 8.5, bodyC = S.curve(FAWN.body, true, 8);
        const MB = (u, a) => [u, BY + RB * Math.sin(Math.max(-1.5, Math.min(1.5, a / RB)))];
        clipP(bodyC, () => {
            const rad = 12.4, px = rad * 2;
            for (let j = -2; j <= 2; j++) {
                for (let i = -4; i <= 4; i++) {
                    const u0 = 3 + i * px + (j % 2 ? px / 2 : 0), a0 = j * rad * 1.74;
                    if (u0 < -52 && a0 < 12) continue; // the neck grows there
                    roundel(MB, u0, a0, rad, 0, i * 9 + j + 40);
                    // the four-point filler in the gap between three circles
                    const f2 = (du, da) => MB(u0 + px / 2 + du, a0 - rad * 0.58 + da);
                    poly([f2(-1.7, 0), f2(0, 0), f2(1.7, 0)], 0.6);
                    poly([f2(0, -1.7), f2(0, 0), f2(0, 1.7)], 0.6);
                }
            }
        });
        // ---- the neck: a column leaning forward
        const N0 = [-48.5, 12], N1 = [-55.5, -78], nl = Math.hypot(N1[0] - N0[0], N1[1] - N0[1]), nd = [(N1[0] - N0[0]) / nl, (N1[1] - N0[1]) / nl], nn = [-nd[1], nd[0]], RN = 15;
        const MN = (u, a) => {
            const k = RN * Math.sin(Math.max(-1.5, Math.min(1.5, a / RN)));
            return [N0[0] + nd[0] * u + nn[0] * k, N0[1] + nd[1] * u + nn[1] * k];
        };
        clipP(S.curve([[-64, -6], [-67, -20], [-69.5, -48], [-69.5, -72.5], [-41, -76.5], [-37, -52], [-31, -31], [-44, -18]], true, 6), () => {
            const rad = 9.2;
            for (let j = -1; j <= 1; j++) for (let i = 0; i <= 5; i++) roundel(MN, 20 + i * rad * 2 + (j ? rad : 0), j * rad * 1.74, rad, -Math.PI / 2, 200 + i * 5 + j);
        });
        // a collar of two lines and a row of dots where the neck meets the head
        for (const u of [86.5, 90]) poly([MN(u, -23), MN(u, -10), MN(u, 0), MN(u, 10), MN(u, 23)], 0.8);
        for (let a = -18; a <= 18; a += 3) poly([MN(88.2, a), MN(88.3, a + 0.2)], 0.9);
        // ---- the legs: the net runs on down them, a roundel at a time; rings above the hoof; the cleft
        for (const [x0, x1, top, id] of [[...FAWN.LF, 28, 300], [...FAWN.LH, 24, 320]]) {
            const cx = (x0 + x1) / 2, RL = (x1 - x0) / 2 + 0.6;
            const ML = (u, a) => [cx + RL * Math.sin(Math.max(-1.5, Math.min(1.5, a / RL))), u];
            clipP([[x0 - 3, 37], [x1 + 3, 37], [x1 + 3, 82], [x0 - 3, 82]], () => {
                const rad = 6.6;
                for (let i = 0; i < 4; i++) for (const j of [-1, 0, 1]) roundel(ML, 43.6 + i * rad * 2 + (j ? rad : 0), j * rad * 1.74, rad, 0, id + i * 3 + j);
            });
            for (const yy of [83, 86]) poly([[x0 - 2, yy], [cx, yy + 1.3], [x1 + 2, yy]], 0.8);
            poly([[cx - 0.4, 91.5], [cx, 99]], 0.85);
        }
        // ---- the head: the cheek's line, bands round the muzzle
        poly(S.curve([[-47, -75], [-53.5, -82], [-52.5, -92], [-46.5, -97.5]], false, 8), 0.75);
        poly(S.curve([[-91.5, -90], [-90, -83], [-91.5, -76]], false, 6), 0.75);
        poly(S.curve([[-88, -91.5], [-86.5, -83.5], [-88, -75.5]], false, 6), 0.6);
        // where the legs join: the haunch's and the shoulder's line
        poly(S.curve([[33, 30], [40, 14], [52, 8], [62, 16]], false, 8), 0.8);
        poly(S.curve([[-57, 31], [-52, 20], [-43, 17], [-33, 25]], false, 8), 0.8);
        // the tail's root, the hairs of its tip
        poly(S.curve([[61, -8], [66, -12], [69, -9]], false, 5), 0.7);
        for (const k of [0, 1, 2]) poly([[68 + k * 2.4, -18 - k * 1.5], [70.5 + k * 2.2, -21.5 - k * 1.2]], 0.5);
    }
    function fawnSprite(rot, res, seed, which) {
        return memo(`fawn/${which}/${rot.toFixed(3)}@${res}/${seed}`, () => {
            const box = FAWN.box, L = S.lightFor(rot), sd = S.seedOf('fawn' + seed);
            const far = which === 'far';
            const shape = (g) => {
                const fp = (pts, sm = 8) => {
                    g.beginPath();
                    S.trace(g, S.curve(pts, true, sm));
                    g.fill();
                };
                if (far) {
                    g.translate(12, -6.5);
                    fp(FAWN.legF, 3);
                    fp(FAWN.legH, 3);
                    g.translate(-12, 6.5);
                    g.translate(-7, -1);
                    fp(FAWN.ear);
                    return;
                }
                fp(FAWN.body);
                fp(FAWN.neck);
                fp(FAWN.head);
                fp(FAWN.ear);
                fp(FAWN.tail);
                fp(FAWN.legF, 3);
                fp(FAWN.legH, 3);
            };
            const raw = far ? () => 0 : fieldOf(box, res, fawnChasing, 0.16);
            // the chasing is worn shallow in slow patches (hands, water, six centuries in the ground)
            const groove = (x, y) => raw(x, y) * (0.35 + 0.65 * S.smooth(-0.35, 0.25, S.noise2(x * 0.035 + 5, y * 0.035, sd + 21)));
            // casting pits and the hammered patch: a slow lumpiness, a few sharp pits
            const sprite = S.form({
                box, res, light: L, ramp: BRONZE, soft: 0.95, mask: shape, relief: 0.78, seed: sd,
                height: (x, y) => -0.62 * groove(x, y) + 0.4 * S.noise2(x * 0.09, y * 0.09, sd + 3) + 0.12 * S.noise2(x * 0.5, y * 0.5, sd + 4),
                mottle: { amp: 0.07, freq: 0.07 },
                spec: { amp: 0.42, power: 22, color: '#ffe9b0', from: 0.45, to: 0.95 },
                tint: (x, y, tone, rgb) => {
                    const gv = groove(x, y), f = 0.42 + 0.85 * tone;
                    // what is left of the gilding: slow patches, rubbed away where the form stands proud to the lamp
                    const n = S.noise2(x * 0.04 + 3, y * 0.04, sd + 11) * 0.6 + S.noise2(x * 0.12, y * 0.12, sd + 12) * 0.4;
                    const k = S.smooth(0.12, 0.42, n) * (1 - S.smooth(0.78, 0.96, tone)) * (1 - gv) * 0.7;
                    rgb[0] += (206 * f - rgb[0]) * k;
                    rgb[1] += (150 * f - rgb[1]) * k;
                    rgb[2] += (52 * f - rgb[2]) * k;
                    // green: lying in the chasing, and creeping up from below in slow patches
                    const lo = S.smooth(0.2, 0.75, S.noise2(x * 0.055 + 9, y * 0.055, sd + 13) * 0.8 + (y - 30) * 0.006);
                    const pg = Math.min(0.9, gv * 0.9 + lo * 0.42), f2 = 0.5 + 0.7 * tone;
                    rgb[0] += (74 * f2 - rgb[0]) * pg;
                    rgb[1] += (148 * f2 - rgb[1]) * pg;
                    rgb[2] += (120 * f2 - rgb[2]) * pg;
                },
            });
            return sprite;
        });
    }
    function fawn(g, o = {}) {
        const { x = 0, y = 0, s = 1, rot = 0, seed = 1 } = o;
        const ra = Math.round(rot / (Math.PI / 36)) * (Math.PI / 36), F = frame(ra);
        const res = Math.min(6, Math.max(1, Math.ceil(S.pxScale(g) * s * 2 - 1e-6) / 2));
        sheet(g, x, y, s, reach({ x: -100, y: -122, w: 198, h: 244 }, ra), (main) => {
            const r = Motion.rng('heirloom-fawn/' + seed);
            const OX = 10.2, OY = 1.8; // the thing's own origin, so that its box is centred on the anchor
            const P = (p) => F([p[0] + OX, p[1] + OY]);
            const PP = (a) => a.map(P);
            const bronze = (pts, fill, o2 = {}) => S.piece(main, PP(pts), {
                fill, line: 1.6, heavy: 0.8,
                shade: { color: '#120c16', alpha: 0.6, w: 6, push: 3.4 }, light: { color: '#c9a468', alpha: 0.45, w: 4, push: 2.6 }, ...o2,
            });
            // ---- the base plate: a slab seen a little from above
            const tl = [-88, 93], tr = [70, 93], br = [58, 105], bl = [-100, 105], TH = 7;
            bronze([bl, br, [br[0], br[1] + TH], [bl[0], bl[1] + TH]], { from: P([0, 105]), to: P([0, 112]), stops: [[0, '#4a3524'], [1, '#221620']] }, {
                detail: (d) => {
                    const b = S.bbox(PP([bl, [br[0], br[1] + TH]]));
                    scuff(d, b, r, { n: 60, len: [2, 12], light: '#c9a468', dark: '#120c16', dir: ra, pits: 30 });
                    for (let i = 0; i < 10; i++) glow(d, [b.x + r() * b.w, b.y + r() * b.h], 3 + r() * 6, '#4a9478', 0.4);
                },
            });
            bronze([br, tr, [tr[0], tr[1] + TH], [br[0], br[1] + TH]], '#1c1220', { shade: { color: '#0c0810', alpha: 0.7, w: 4, push: 2 }, light: null });
            bronze([tl, tr, br, bl], { from: P([-90, 93]), to: P([60, 106]), stops: [[0, '#8c6b3a'], [0.4, '#5e4426'], [1, '#3d2a22']] }, {
                detail: (d) => {
                    const b = S.bbox(PP([tl, tr, br, bl]));
                    for (let i = 0; i < 26; i++) glow(d, [b.x + r() * b.w, b.y + r() * b.h], 3 + r() * 9, r() < 0.55 ? '#4a9478' : r() < 0.5 ? '#c8962e' : '#1c1220', 0.34);
                    scuff(d, b, r, { n: 140, len: [2, 14], light: '#e8cf98', dark: '#120c16', dir: ra, pits: 60 });
                    // a scribed border; a hole at each corner for fixing, one with its rivet still in
                    const inn = [[tl[0] + 5.5, tl[1] + 2], [tr[0] - 3.5, tr[1] + 2], [br[0] - 3.5, br[1] - 2], [bl[0] + 5.5, bl[1] - 2]];
                    engrave(d, [PP([...inn, inn[0]])], 0.45, 0.8, '#120c16', '#c9a468');
                    inn.forEach(([px, py], i) => {
                        const c = P([px + (i === 0 || i === 3 ? 4 : -4), py + (i < 2 ? 2 : -2)]);
                        fillP(d, S.ellipse(c[0] + 0.3, c[1] + 0.4, 1.9, 1.1, 12, ra), 'rgba(201,164,104,0.6)');
                        fillP(d, S.ellipse(c[0], c[1], 1.8, 1, 12, ra), i === 1 ? '#8c6b3a' : '#0c0810');
                        if (i === 1) disc(d, [c[0] - 0.4, c[1] - 0.3], 0.45, '#f2e2b4');
                    });
                },
            });
            // lime scale where the water fell from the mouth and ran
            main.save();
            main.globalCompositeOperation = 'source-atop';
            for (let i = 0; i < 9; i++) {
                const c = P([-98 + r() * 14, 97 + r() * 6]);
                fillP(main, S.ellipse(c[0], c[1], 2 + r() * 4, 0.8 + r() * 1.4, 10, ra), `rgba(214,222,206,${0.2 + r() * 0.25})`);
            }
            main.restore();
            // ---- far legs and far ear, stepped back
            const put = (sp, veil) => {
                const p = like(main), o0 = F([OX, OY]);
                S.put(p, sp, { x: o0[0], y: o0[1], rot: ra });
                return p;
            };
            {
                const p = put(fawnSprite(ra, res, seed, 'far'));
                air(p, { color: '#0e0914', alpha: 0.85, w: 5, push: 3 });
                air(p, { color: '#b8905a', alpha: 0.4, w: 2, push: 1.3, dir: TOL });
                p.save();
                p.globalCompositeOperation = 'source-atop';
                p.setTransform(1, 0, 0, 1, 0, 0);
                p.fillStyle = 'rgba(24,16,40,0.42)';
                p.fillRect(0, 0, p.canvas.width, p.canvas.height);
                p.restore();
                stampOn(main, p, { lw: 1.5, heavy: 0.8, ink: '#100c1c', cast: { blur: 2.4, dx: 2.6, dy: 1.4, color: 'rgba(8,4,10,0.7)' } });
            }
            // ---- the near side: one casting
            const p = put(fawnSprite(ra, res, seed, 'near'));
            p.save();
            p.globalCompositeOperation = 'source-atop';
            // scratches and casting pits
            scuff(p, reach({ x: -100, y: -122, w: 198, h: 244 }, ra, 0), r, { n: 420, len: [1.5, 9], w: [0.2, 0.4], light: '#f2e2b4', dark: '#0c0810', alpha: [0.1, 0.32], pits: 240, pit: [0.15, 0.5] });
            // green runs down from wherever water sat: under the collar, the ears, the muzzle's bands, the belly
            p.lineCap = 'round';
            for (let i = 0; i < 70; i++) {
                const k = r(), o0 = k < 0.2 ? [-92 + r() * 46, -98 + r() * 22] : k < 0.5 ? [-66 + r() * 130, 26 + r() * 12] : k < 0.75 ? [-60 + r() * 126, -22 + r() * 30] : [(r() < 0.5 ? -44 : 47) + (r() - 0.5) * 16, 40 + r() * 46];
                const l = 2 + r() * 9, a = P(o0), b = P([o0[0] + (r() - 0.5) * 1.2, o0[1] + l]);
                strokeP(p, [a, b], 0.3 + r() * 0.7, `rgba(84,160,128,${0.16 + r() * 0.3})`);
            }
            // the head and the back were handled: rubbed to bare metal in strokes that follow the form
            for (let i = 0; i < 40; i++) {
                const k = r(), o0 = k < 0.5 ? [-90 + r() * 44, -98 + r() * 20] : [-50 + r() * 108, -22 + r() * 8], l = 3 + r() * 9, a = (k < 0.5 ? 0.25 : 0) + (r() - 0.5) * 0.4;
                strokeP(p, [P(o0), P([o0[0] + Math.cos(a) * l, o0[1] + Math.sin(a) * l])], 0.25 + r() * 0.5, `rgba(${r() < 0.6 ? '226,196,140' : '20,12,20'},${0.1 + r() * 0.2})`);
            }
            // lime scale under the mouth and down the chin
            for (let i = 0; i < 7; i++) {
                const c = P([-96.5 + r() * 6, -78.5 + r() * 4]);
                fillP(p, S.ellipse(c[0], c[1], 0.8 + r() * 1.6, 0.5 + r(), 8, r() * 3), `rgba(214,222,206,${0.25 + r() * 0.3})`);
            }
            p.restore();
            // the emblem manner over the lit volume: shade and light sprayed in from its edges
            air(p, { color: '#0e0914', alpha: 0.6, w: 9, push: 5 });
            air(p, { color: '#0e0914', alpha: 0.55, w: 2.6, push: 1.4 });
            air(p, { color: '#e8c890', alpha: 0.3, w: 4, push: 2.6, dir: TOL });
            // a warm light thrown back into the shadow's rim keeps the dark bronze off the night
            air(p, { color: '#9a6a3c', alpha: 0.7, w: 1.4, push: 0.5 });
            stampOn(main, p, { lw: 2, heavy: 0.85, ink: '#100c1c', cast: { blur: 3, dx: 3, dy: 3.6, color: 'rgba(8,4,10,0.7)' } });
            // ---- what is cut and drilled into the head
            {
                // the mouth: the bore the water came from, its lip lit on the far side
                const mc = P([-98, -82.6]);
                S.piece(main, S.ellipse(mc[0], mc[1], 2.6, 4.6, 18, ra + 0.14), {
                    fill: '#07050c', line: 0.8, ink: '#07050c', heavy: 0,
                    light: { color: '#c9a468', alpha: 0.9, w: 1.4, push: 1, dir: SD },
                });
                // the eye: an almond, double-lined, the pupil drilled
                const ec = [-66.5, -89];
                const alm = (k) => S.curve([[ec[0] - 5.4 * k, ec[1] + 0.6 * k], [ec[0] - 1.5 * k, ec[1] - 2.5 * k], [ec[0] + 4.6 * k, ec[1] - 0.9 * k], [ec[0] + 5.6 * k, ec[1] + 0.3 * k], [ec[0] + 1 * k, ec[1] + 2.2 * k]], true, 6);
                const eye = PP(alm(1));
                S.piece(main, eye, {
                    fill: '#5e4426', line: 0.8, ink: '#0c0810', heavy: 0.4,
                    shade: { color: '#120c16', alpha: 0.8, w: 2.4, push: 1.4, dir: TOL }, light: { color: '#f2e2b4', alpha: 0.7, w: 1.6, push: 1, dir: SD },
                    detail: (d) => {
                        const c = P(ec);
                        disc(d, [c[0] + 0.3, c[1] + 0.35], 1.25, 'rgba(242,226,180,0.7)');
                        disc(d, c, 1.15, '#07050c');
                    },
                });
                engrave(main, [(() => {
                    const o2 = PP(alm(1.42));
                    return [...o2, o2[0]];
                })()], 0.4, 0.85, '#0c0810', '#c9a468');
                // the nostril, the mouth's line along the muzzle
                engrave(main, [PP(S.curve([[-94.5, -88.6], [-93, -90], [-91.6, -89]], false, 5)), PP(S.curve([[-96, -78.2], [-87, -76.6], [-78, -77]], false, 6))], 0.42, 0.85, '#0c0810', '#c9a468');
                // the ear's hollow
                const hol = PP(S.curve([[-47.5, -98.5], [-43.5, -105.5], [-36.5, -111.5], [-36.5, -104], [-41.5, -98]], true, 6));
                S.piece(main, hol, { fill: '#2a1c22', line: 0, shade: { color: '#07050c', alpha: 0.9, w: 3, push: 1.8, dir: TOL }, light: { color: '#4a9478', alpha: 0.5, w: 2, push: 1.2, dir: SD } });
            }
        });
    }

    const SIZE = { eagle: [136, 216], votive: [186, 290], byzantine: [162, 212], astrolabe: [230, 304], fawn: [182, 230], alicatado: [308, 308] };
    return { eagle, votive, byzantine, astrolabe, fawn, alicatado, SIZE };
})();
