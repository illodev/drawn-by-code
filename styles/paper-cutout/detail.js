// Detail pieces for the paper-cutout style: the things that separate a finished film from an
// animatic. Textures that carry information (knit, rib, newsprint, wood grain, hair strands),
// creases, organic shapes, and hands with thumbs. Global: PaperDetail.
// Depends on engine/core.js and paper.js. Everything is deterministic (seeded).
//
// Rule of thumb (see .claude/skills/style-paper-cutout/SKILL.md → Detail):
// every body part is its own piece of paper; hands are never circles; fabric, paper and wood
// show what they are made of; paper that moves bends and folds in perspective.
const PaperDetail = (() => {
    const P = Paper;

    // --- colour helpers -------------------------------------------------------------------
    function shade(hex, dl, ds = 0) {
        const [h, s, l] = P.hexToHsl(hex);
        return P.hsla(h, s + ds, l + dl, 1);
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

    return { shade, spline, knit, rib, newsprint, woodGrain, strands, crease, hand, handShape };
})();
