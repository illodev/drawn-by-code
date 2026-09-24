// Clay (plasticine) style kit: soft 3D pieces lit from the top left, with fingerprints, tool
// marks, a waxy sheen and soft contact shadows, animated like stop motion (on twos, with a
// surface that «boils» a little between drawings). Global: Clay.
//
// Every piece is a flat silhouette turned into clay once and cached per resolution:
//   base colour → texture (speckle, fingerprints, tool marks) → volume (a broad gradient) →
//   bevel (the inverse silhouette blurred and offset: dark on the edges away from the light,
//   light on the edges facing it) → sheen (a soft highlight) → trimmed to the silhouette.
//
//   Clay.draw(g, key, shape, color, o)   draws a piece at the current transform (local units)
//     shape: points [[x, y], …] (closed outline), or { box: {x, y, w, h}, fn(ctx) } where fn
//     fills the silhouette with ctx.fillStyle (text, several blobs, holes with evenodd)
//     o: bevel (edge size, default 7), soft (blur of the bevel), shine (0–1), prints (number
//     of fingerprints), marks (tool marks), speckle (0–1), light ([x, y] direction), shadow
//     (contact shadow: 0–1 or false), variant (boil drawing: changes the lumps and texture)
//   Clay.lumpy(pts, seed, amt, n)        a closed Catmull-Rom outline with hand-made lumps
//   Clay.ellipse, Clay.roundRect, Clay.capsule (a sausage between two points), Clay.bean
//   Clay.shadow(g, x, y, rx, ry, a)      a soft contact shadow on the set (under a piece)
//   Clay.text(g, key, str, x, y, size, color, o)   clay letters (o.font, o.align, o.tilt)
//   Clay.boil(t, n)                      the boil variant for time t (on twos, cycles n)
//   Clay.shade(hex, amt)                 lighter (+) / darker (-) version of a colour
const Clay = (() => {
    const rng = (s) => Motion.rng(s);
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

    function shade(hex, amt) {
        const n = parseInt(hex.slice(1), 16), f = amt / 100;
        const ch = (v) => Math.round(clamp(f >= 0 ? v + (255 - v) * f : v * (1 + f), 0, 255));
        return '#' + [ch((n >> 16) & 255), ch((n >> 8) & 255), ch(n & 255)].map((v) => v.toString(16).padStart(2, '0')).join('');
    }
    const rgba = (hex, a) => { const n = parseInt(hex.slice(1), 16); return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`; };

    // --- outlines -------------------------------------------------------------------------
    function catmull(pts, n = 8, closed = true) {
        const out = [], L = pts.length, P = (i) => pts[closed ? (i + L) % L : clamp(i, 0, L - 1)];
        for (let i = 0; i < (closed ? L : L - 1); i++) {
            const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2);
            for (let k = 0; k < n; k++) {
                const t = k / n, t2 = t * t, t3 = t2 * t;
                out.push([0, 1].map((j) => 0.5 * (2 * p1[j] + (-p0[j] + p2[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t2 + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t3)));
            }
        }
        if (!closed) out.push(pts[L - 1]);
        return out;
    }
    // hand-made lumps: every control point pushed along its normal by a seeded amount
    function lumpy(pts, seed, amt = 2, n = 8) {
        const r = rng('lump' + seed), L = pts.length;
        const moved = pts.map((p, i) => {
            const a = pts[(i - 1 + L) % L], b = pts[(i + 1) % L];
            const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1;
            const k = (r() * 2 - 1) * amt;
            return [p[0] + (dy / l) * k, p[1] - (dx / l) * k];
        });
        return catmull(moved, n);
    }
    const ellipse = (cx, cy, rx, ry, n = 14) => [...Array(n)].map((_, i) => { const a = (i / n) * Math.PI * 2; return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]; });
    function roundRect(x, y, w, h, r) {
        r = Math.min(r, w / 2, h / 2);
        const pts = [], arc = (cx, cy, a0) => { for (let i = 0; i <= 4; i++) { const a = a0 + (i / 4) * Math.PI / 2; pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } };
        arc(x + w - r, y + r, -Math.PI / 2); arc(x + w - r, y + h - r, 0); arc(x + r, y + h - r, Math.PI / 2); arc(x + r, y + r, Math.PI);
        return pts;
    }
    // a sausage of radius r (or [r0, r1]) along a polyline
    function capsule(line, r) {
        const [r0, r1] = Array.isArray(r) ? r : [r, r], L = line.length, left = [], right = [];
        line.forEach((p, i) => {
            const a = line[Math.max(0, i - 1)], b = line[Math.min(L - 1, i + 1)];
            const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, rr = r0 + (r1 - r0) * (i / Math.max(1, L - 1));
            left.push([p[0] - (dy / l) * rr, p[1] + (dx / l) * rr]);
            right.push([p[0] + (dy / l) * rr, p[1] - (dx / l) * rr]);
        });
        // round caps swept outwards: from the left edge round the tip to the right edge
        const cap = (c, rr, a0) => [...Array(9)].map((_, i) => { const a = a0 - (i / 8) * Math.PI; return [c[0] + Math.cos(a) * rr, c[1] + Math.sin(a) * rr]; });
        const d0 = Math.atan2(line[1][1] - line[0][1], line[1][0] - line[0][0]), d1 = Math.atan2(line[L - 1][1] - line[L - 2][1], line[L - 1][0] - line[L - 2][0]);
        return [...left, ...cap(line[L - 1], r1, d1 + Math.PI / 2).slice(1, -1), ...right.reverse(), ...cap(line[0], r0, d0 - Math.PI / 2).slice(1, -1)];
    }
    const bean = (cx, cy, w, h, seed, amt = 1.5) => lumpy(ellipse(cx, cy, w / 2, h / 2, 12), seed, amt);

    const bounds = (pts) => pts.reduce((b, [x, y]) => ({ x0: Math.min(b.x0, x), y0: Math.min(b.y0, y), x1: Math.max(b.x1, x), y1: Math.max(b.y1, y) }), { x0: 1e9, y0: 1e9, x1: -1e9, y1: -1e9 });

    // --- the clay piece -------------------------------------------------------------------
    const RES = [0.35, 0.5, 0.7, 1, 1.4, 2, 2.8];
    function canvasLike(W, H) {
        const c = document.createElement('canvas');
        c.width = W;
        c.height = H;
        return c;
    }
    function piece(key, shape, color, o, res) {
        const pts = Array.isArray(shape) ? shape : null;
        const bx = pts ? (({ x0, y0, x1, y1 }) => ({ x: x0, y: y0, w: x1 - x0, h: y1 - y0 }))(bounds(pts)) : shape.box;
        const pad = 4, box = { x: bx.x - pad, y: bx.y - pad, w: bx.w + pad * 2, h: bx.h + pad * 2 };
        return Motion.sprite('clay:' + key + ':' + (o.variant ?? 0), box, res, (g) => {
            const T = g.getTransform(), W = g.canvas.width, H = g.canvas.height, k = T.a;
            const mk = () => { const c = canvasLike(W, H), x = c.getContext('2d'); x.setTransform(T); return [c, x]; };
            const fill = (x, col) => {
                x.fillStyle = col;
                if (pts) { x.beginPath(); pts.forEach(([px, py], i) => (i ? x.lineTo(px, py) : x.moveTo(px, py))); x.closePath(); x.fill(); }
                else shape.fn(x);
            };
            const [M, mx] = mk();
            fill(mx, '#000');
            const [S, sx] = mk();
            fill(sx, color);
            const r = rng('tex' + key + (o.variant ?? 0));
            const { x: X, y: Y, w: BW, h: BH } = bx, area = BW * BH;
            // speckle: tiny darker and lighter crumbs of pigment
            const nSp = Math.round((area / 180) * (o.speckle ?? 0.6));
            for (let i = 0; i < nSp; i++) {
                sx.fillStyle = r() < 0.5 ? rgba(shade(color, -25), 0.25) : rgba(shade(color, 25), 0.22);
                sx.beginPath();
                sx.ellipse(X + r() * BW, Y + r() * BH, 0.4 + r() * 0.9, 0.4 + r() * 0.7, r() * 3, 0, 7);
                sx.fill();
            }
            // tool marks: short curved smears
            const nMk = o.marks ?? Math.round(area / 6000);
            sx.lineCap = 'round';
            for (let i = 0; i < nMk; i++) {
                const cx = X + r() * BW, cy = Y + r() * BH, a = r() * Math.PI, l = 6 + r() * 16;
                sx.strokeStyle = rgba(shade(color, r() < 0.6 ? -18 : 18), 0.35);
                sx.lineWidth = 0.8 + r() * 1.2;
                sx.beginPath();
                sx.moveTo(cx - Math.cos(a) * l, cy - Math.sin(a) * l);
                sx.quadraticCurveTo(cx + Math.sin(a) * 3, cy - Math.cos(a) * 3, cx + Math.cos(a) * l, cy + Math.sin(a) * l);
                sx.stroke();
            }
            // fingerprints: groups of concentric arcs, very faint
            const nFp = o.prints ?? Math.round(area / 9000);
            for (let i = 0; i < nFp; i++) {
                const cx = X + BW * (0.15 + r() * 0.7), cy = Y + BH * (0.15 + r() * 0.7), a = r() * Math.PI * 2, rr = 5 + r() * 6;
                sx.strokeStyle = rgba(shade(color, -22), 0.22);
                sx.lineWidth = 0.55;
                for (let j = 0; j < 5; j++) {
                    sx.beginPath();
                    sx.ellipse(cx, cy, rr + j * 1.6, (rr + j * 1.6) * 0.7, a, 0.3, 2.6);
                    sx.stroke();
                }
            }
            // volume: a broad gradient from the light
            const [lx, ly] = o.light ?? [-0.6, -0.8];
            const cxm = X + BW / 2, cym = Y + BH / 2, R = Math.max(BW, BH) * 0.75;
            const gr = sx.createRadialGradient(cxm + lx * R * 0.45, cym + ly * R * 0.45, R * 0.05, cxm, cym, R * 1.05);
            gr.addColorStop(0, rgba('#fff4e0', 0.2 * (o.volume ?? 1)));
            gr.addColorStop(0.55, 'rgba(0,0,0,0)');
            gr.addColorStop(1, rgba('#2a1410', 0.28 * (o.volume ?? 1)));
            sx.fillStyle = gr;
            sx.fillRect(X - 10, Y - 10, BW + 20, BH + 20);
            // bevel: the inverse silhouette blurred and offset
            // the bevel never takes more than a slice of a small piece (or it washes it out)
            const bev = Math.min(o.bevel ?? 7, Math.min(BW, BH) * 0.14), soft = Math.min(o.soft ?? bev * 0.9, bev);
            const inv = (col) => {
                const [I, ix] = mk();
                ix.setTransform(1, 0, 0, 1, 0, 0);
                ix.fillStyle = col;
                ix.fillRect(0, 0, W, H);
                ix.globalCompositeOperation = 'destination-out';
                ix.drawImage(M, 0, 0);
                return I;
            };
            sx.save();
            sx.setTransform(1, 0, 0, 1, 0, 0);
            sx.filter = `blur(${Math.max(0.5, soft * k)}px)`;
            sx.drawImage(inv(rgba('#2a1208', 0.6)), (lx * bev * 0.9) * k, (ly * bev * 0.9) * k);
            sx.drawImage(inv(rgba('#fff6e6', 0.55)), (-lx * bev * 0.6) * k, (-ly * bev * 0.6) * k);
            sx.restore();
            // sheen: a soft waxy highlight
            if ((o.shine ?? 0.5) > 0) {
                sx.save();
                sx.filter = `blur(${Math.max(1, Math.min(BW, BH) * 0.08 * k)}px)`;
                sx.fillStyle = `rgba(255,252,240,${0.35 * (o.shine ?? 0.5)})`;
                sx.beginPath();
                sx.ellipse(cxm + lx * BW * 0.22, cym + ly * BH * 0.24, BW * 0.18, BH * 0.1, -0.5, 0, 7);
                sx.fill();
                sx.restore();
            }
            // trim to the silhouette
            sx.save();
            sx.setTransform(1, 0, 0, 1, 0, 0);
            sx.globalCompositeOperation = 'destination-in';
            sx.drawImage(M, 0, 0);
            sx.restore();
            g.save();
            g.setTransform(1, 0, 0, 1, 0, 0);
            g.drawImage(S, 0, 0);
            g.restore();
        });
    }
    // the soft shadow a piece casts on what is behind it (its blurred silhouette, offset)
    function castShadow(key, shape, o, res) {
        const pts = Array.isArray(shape) ? shape : null;
        const bx = pts ? (({ x0, y0, x1, y1 }) => ({ x: x0, y: y0, w: x1 - x0, h: y1 - y0 }))(bounds(pts)) : shape.box;
        const blur = o.shadowBlur ?? 9, pad = blur * 2.5 + 4;
        const box = { x: bx.x - pad, y: bx.y - pad, w: bx.w + pad * 2, h: bx.h + pad * 2 };
        return Motion.sprite('clayshadow:' + key + ':' + (o.variant ?? 0), box, res, (g) => {
            g.save();
            g.filter = `blur(${blur * g.getTransform().a}px)`;
            g.fillStyle = 'rgba(52,26,18,0.42)';
            if (pts) { g.beginPath(); pts.forEach(([px, py], i) => (i ? g.lineTo(px, py) : g.moveTo(px, py))); g.closePath(); g.fill(); }
            else shape.fn(g);
            g.restore();
        });
    }
    function draw(g, key, shape, color, o = {}) {
        const m = g.getTransform(), px = Math.hypot(m.a, m.b);
        const res = o.res ?? RES.find((v) => v >= px) ?? RES[RES.length - 1];
        if (o.shadow !== false && o.shadow !== 0) {
            const [dx, dy] = o.shadowOffset ?? [5, 9];
            g.save();
            g.globalAlpha *= o.shadow ?? 0.8;
            g.translate(dx, dy);
            castShadow(key, shape, o, res).draw(g);
            g.restore();
        }
        piece(key, shape, color, o, res).draw(g);
    }
    // a soft contact shadow on the set (under a piece resting on it)
    function shadow(g, x, y, rx, ry, a = 0.35) {
        const gr = g.createRadialGradient(x, y, 0, x, y, rx);
        gr.addColorStop(0, `rgba(52,26,18,${a})`);
        gr.addColorStop(0.6, `rgba(52,26,18,${a * 0.5})`);
        gr.addColorStop(1, 'rgba(52,26,18,0)');
        g.save();
        g.translate(x, y);
        g.scale(1, ry / rx);
        g.translate(-x, -y);
        g.fillStyle = gr;
        g.beginPath();
        g.arc(x, y, rx, 0, 7);
        g.fill();
        g.restore();
    }
    // clay letters: the text is the silhouette; a thick bevel so each letter is a rolled piece
    function text(g, key, str, x, y, size, color, o = {}) {
        const font = `${o.weight ?? 700} ${size}px "${o.font ?? 'sans-serif'}"`;
        const meas = document.createElement('canvas').getContext('2d');
        meas.font = font;
        const w = meas.measureText(str).width, ax = o.align === 'center' ? -w / 2 : o.align === 'right' ? -w : 0;
        const shape = { box: { x: ax - size * 0.1, y: -size * 0.95, w: w + size * 0.2, h: size * 1.3 }, fn: (c) => { c.font = font; c.textBaseline = 'alphabetic'; c.fillText(str, ax, 0); } };
        g.save();
        g.translate(x, y);
        if (o.tilt) g.rotate(o.tilt);
        draw(g, 'txt:' + key + ':' + str + ':' + size, shape, color, { bevel: size * 0.07, soft: size * 0.05, shine: 0.7, prints: 0, marks: 0, speckle: 0.4, shadowBlur: size * 0.06, shadowOffset: [size * 0.04, size * 0.07], ...o });
        g.restore();
    }
    const boil = (t, n = 3) => Math.floor(t * 12 + 1e-6) % n;

    return { shade, rgba, catmull, lumpy, ellipse, roundRect, capsule, bean, draw, shadow, text, boil };
})();
