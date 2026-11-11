// '90s cereal commercial style kit: a Saturday-morning TV spot taped on VHS and played on a
// CRT. Flat cel colour with an even dark outline, box characters in oblique projection,
// spinning sunbursts, pop-art starbursts, Memphis confetti, chunky extruded lettering, and a
// tape-and-tube finish (the glass shape, chroma smear, line jitter and noise were measured on
// the reference). Global: Cereal. Depends on engine/core.js.
//
// Everything is a pure function of t. The tape noise changes every frame on purpose; it is
// seeded by the frame number, so the same frame always gives the same image.
const Cereal = (() => {
    const COL = {
        ink: '#241531', // outlines: a purple near-black, never pure black
        black: '#15101d',
        white: '#fffdf4',
        cream: '#fff1c4',
        yellow: '#ffe62e',
        gold: '#ffc21f',
        orange: '#ff8a2b',
        red: '#f0352f',
        pink: '#ff4fa5',
        magenta: '#e0258b',
        rose: '#ff9ccf',
        purple: '#7d47e1',
        violet: '#a888f5',
        indigo: '#3b2fa0',
        navy: '#201c57',
        blue: '#4a44e6',
        sky: '#48cfe0',
        aqua: '#8cefe6',
        teal: '#17b8a6',
        tealDeep: '#0e8f86',
        green: '#35c46a',
        vcrBlue: '#1a1edc', // the VCR's blue screen
    };
    const FONT = { block: 'Anton', round: 'Titan One', osd: 'VT323' };
    const TAU = Math.PI * 2;

    // Drawings change 12 times a second (on twos); camera moves and spins stay smooth.
    const drawing = (t, t0 = 0) => Math.floor((t - t0) * 12 + 1e-6);
    const onTwos = (t, t0 = 0) => t0 + drawing(t, t0) / 12;
    const pxScale = (g) => {
        const m = g.getTransform();
        return Math.max(0.05, Math.hypot(m.a, m.b));
    };

    // --- paths -----------------------------------------------------------------------------
    const trace = (g, pts, close = true) => {
        g.beginPath();
        g.moveTo(pts[0][0], pts[0][1]);
        for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]);
        if (close) g.closePath();
    };
    // Fill and outline a polygon. o: { fill, ink, lw, close }
    function poly(g, pts, o = {}) {
        const { fill = null, ink = COL.ink, lw = 3, close = true } = o;
        trace(g, pts, close);
        if (fill) {
            g.fillStyle = fill;
            g.fill();
        }
        if (lw > 0 && ink) {
            g.strokeStyle = ink;
            g.lineWidth = lw;
            g.lineJoin = 'round';
            g.lineCap = 'round';
            g.stroke();
        }
    }
    const ellipsePts = (cx, cy, rx, ry, n = 48, rot = 0, a0 = 0, a1 = TAU) =>
        Array.from({ length: n + (a1 - a0 < TAU - 1e-6 ? 1 : 0) }, (_, i) => {
            const a = a0 + ((a1 - a0) * i) / n, x = Math.cos(a) * rx, y = Math.sin(a) * ry;
            return [cx + x * Math.cos(rot) - y * Math.sin(rot), cy + x * Math.sin(rot) + y * Math.cos(rot)];
        });
    // Catmull-Rom through the points, densified (closed or open).
    function curve(pts, closed = true, seg = 8) {
        const n = pts.length, out = [];
        const at = (i) => (closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))]);
        const last = closed ? n : n - 1;
        for (let i = 0; i < last; i++) {
            const p0 = at(i - 1), p1 = at(i), p2 = at(i + 1), p3 = at(i + 2);
            for (let k = 0; k < seg; k++) {
                const u = k / seg, u2 = u * u, u3 = u2 * u;
                const b0 = -0.5 * u3 + u2 - 0.5 * u, b1 = 1.5 * u3 - 2.5 * u2 + 1, b2 = -1.5 * u3 + 2 * u2 + 0.5 * u, b3 = 0.5 * u3 - 0.5 * u2;
                out.push([p0[0] * b0 + p1[0] * b1 + p2[0] * b2 + p3[0] * b3, p0[1] * b0 + p1[1] * b1 + p2[1] * b2 + p3[1] * b3]);
            }
        }
        if (!closed) out.push(pts[n - 1]);
        return out;
    }

    // --- backdrops -----------------------------------------------------------------------
    // Two-tone rays from a point. o: { n (pairs), rot, a, b, R }
    function sunburst(g, cx, cy, o = {}) {
        const { n = 12, rot = 0, a = COL.yellow, b = COL.gold, R = 1600 } = o;
        g.fillStyle = a;
        g.fillRect(cx - R, cy - R, R * 2, R * 2);
        g.fillStyle = b;
        g.beginPath();
        for (let i = 0; i < n; i++) {
            const a0 = rot + (i / n) * TAU, a1 = a0 + TAU / (2 * n);
            g.moveTo(cx, cy);
            g.lineTo(cx + Math.cos(a0) * R, cy + Math.sin(a0) * R);
            g.lineTo(cx + Math.cos(a1) * R, cy + Math.sin(a1) * R);
            g.closePath();
        }
        g.fill();
    }

    // A pop-art starburst: a jagged star with uneven spikes (seeded, so it never boils).
    // o: { r0 (valleys), r1 (tips), n, rot, jitter, seed, fill, ink, lw, sx, sy }
    function burstPts(cx, cy, o = {}) {
        const { r0 = 200, r1 = 320, n = 14, rot = 0, jitter = 0.22, seed = 'burst', sx = 1, sy = 1 } = o;
        const r = Motion.rng(seed), pts = [];
        for (let i = 0; i < n * 2; i++) {
            const tip = i % 2 === 0;
            const a = rot + (i / (n * 2)) * TAU + (r() - 0.5) * (TAU / (n * 2)) * 0.5;
            const rad = tip ? r1 * (1 + (r() - 0.5) * 2 * jitter) : r0 * (1 + (r() - 0.5) * jitter);
            pts.push([cx + Math.cos(a) * rad * sx, cy + Math.sin(a) * rad * sy]);
        }
        return pts;
    }
    function burst(g, cx, cy, o = {}) {
        const pts = burstPts(cx, cy, o);
        poly(g, pts, { fill: o.fill ?? COL.yellow, ink: o.ink ?? COL.ink, lw: o.lw ?? 0 });
        return pts;
    }

    // --- Memphis shapes ------------------------------------------------------------------
    // Each is drawn round its own centre; `s` is its size.
    const stroke = (g, color, lw) => {
        g.strokeStyle = color;
        g.lineWidth = lw;
        g.lineCap = 'round';
        g.lineJoin = 'round';
        g.stroke();
    };
    const SHAPES = {
        squiggle(g, s, c, lw) {
            g.beginPath();
            for (let i = 0; i <= 40; i++) {
                const u = i / 40, x = (u - 0.5) * s * 2, y = Math.sin(u * TAU * 2) * s * 0.22;
                i ? g.lineTo(x, y) : g.moveTo(x, y);
            }
            stroke(g, c, lw);
        },
        zig(g, s, c, lw) {
            g.beginPath();
            for (let i = 0; i <= 4; i++) {
                const x = (i / 4 - 0.5) * s * 1.7, y = (i % 2 ? -1 : 1) * s * 0.26;
                i ? g.lineTo(x, y) : g.moveTo(x, y);
            }
            g.strokeStyle = c;
            g.lineWidth = lw;
            g.lineCap = 'round';
            g.lineJoin = 'miter';
            g.stroke();
        },
        ring(g, s, c, lw) {
            g.beginPath();
            g.arc(0, 0, s * 0.55, 0, TAU);
            stroke(g, c, lw);
        },
        cross(g, s, c, lw) {
            g.beginPath();
            g.moveTo(-s * 0.5, 0);
            g.lineTo(s * 0.5, 0);
            g.moveTo(0, -s * 0.5);
            g.lineTo(0, s * 0.5);
            stroke(g, c, lw * 1.25);
        },
        bar(g, s, c, lw) {
            g.beginPath();
            g.moveTo(-s * 0.6, 0);
            g.lineTo(s * 0.6, 0);
            stroke(g, c, lw * 1.4);
        },
        tri(g, s, c) {
            g.beginPath();
            for (let i = 0; i < 3; i++) {
                const a = -Math.PI / 2 + (i / 3) * TAU;
                i ? g.lineTo(Math.cos(a) * s * 0.6, Math.sin(a) * s * 0.6) : g.moveTo(Math.cos(a) * s * 0.6, Math.sin(a) * s * 0.6);
            }
            g.closePath();
            g.fillStyle = c;
            g.fill();
        },
        dots(g, s, c) {
            g.fillStyle = c;
            for (let j = 0; j < 3; j++) {
                for (let i = 0; i < 3; i++) {
                    g.beginPath();
                    g.arc((i - 1) * s * 0.42, (j - 1) * s * 0.42, s * 0.09, 0, TAU);
                    g.fill();
                }
            }
        },
    };
    function shape(g, kind, x, y, s, rot, color, lw = 5) {
        g.save();
        g.translate(x, y);
        g.rotate(rot);
        SHAPES[kind](g, s, color, lw);
        g.restore();
    }
    // Scattered Memphis shapes that tick on twos (a small turn and hop), each with its own
    // phase. o: { seed, n, box: [x, y, w, h], palette, kinds, size: [min, max], avoid(x, y) → bool, lw }
    function confetti(g, t, o = {}) {
        const { seed = 'confetti', n = 14, box = [0, 0, 1000, 1000], palette = [COL.pink, COL.teal, COL.white, COL.purple, COL.orange], kinds = Object.keys(SHAPES), size = [26, 50], avoid = null, lw = 5 } = o;
        const r = Motion.rng(seed);
        for (let i = 0; i < n; i++) {
            const x = box[0] + r() * box[2], y = box[1] + r() * box[3], s = size[0] + r() * (size[1] - size[0]);
            const kind = kinds[Math.floor(r() * kinds.length)], color = palette[Math.floor(r() * palette.length)];
            const rot0 = r() * TAU, ph = Math.floor(r() * 6), amp = 0.1 + r() * 0.16;
            if (avoid && avoid(x, y)) continue;
            const d = Math.floor((drawing(t) + ph) / 3); // each shape changes every 3 drawings
            const flip = d % 2 ? 1 : -1;
            shape(g, kind, x, y + flip * 3, s, rot0 + flip * amp, color, lw);
        }
    }

    // Hand-placed Memphis shapes: items [[kind, x, y, size, rot, color], …]. They tick on twos
    // like confetti(); use this when the composition matters (title cards).
    function memphis(g, t, items, o = {}) {
        const { lw = 7, every = 3 } = o;
        items.forEach(([kind, x, y, s, rot0, color], i) => {
            const flip = Math.floor((drawing(t) + i * 2) / every) % 2 ? 1 : -1;
            shape(g, kind, x, y + flip * 3, s, rot0 + flip * 0.13, color, lw);
        });
    }

    // A four-point sparkle. o: { rot, color, ink, lw, pinch }
    function sparkle(g, x, y, r, o = {}) {
        const { rot = 0, color = COL.white, ink = null, lw = 2.5, pinch = 0.2 } = o;
        const pts = [];
        for (let i = 0; i < 8; i++) {
            const a = rot + (i / 8) * TAU, rad = i % 2 ? r * pinch : r;
            pts.push([x + Math.cos(a) * rad, y + Math.sin(a) * rad]);
        }
        poly(g, pts, { fill: color, ink, lw: ink ? lw : 0 });
    }

    // An eighth note (kind 1) or a beamed pair (kind 2), round its head. o: { color, ink, lw }
    function note(g, x, y, s, o = {}) {
        const { color = COL.white, ink = COL.ink, lw = 3, kind = 1, rot = 0 } = o;
        g.save();
        g.translate(x, y);
        g.rotate(rot);
        const heads = kind === 2 ? [[0, 0], [s * 1.25, -s * 0.28]] : [[0, 0]];
        const stemTop = (hx, hy) => [hx + s * 0.4, hy - s * 1.75];
        const body = new Path2D();
        for (const [hx, hy] of heads) {
            body.ellipse(hx, hy, s * 0.5, s * 0.36, -0.4, 0, TAU);
            const [tx, ty] = stemTop(hx, hy);
            body.rect(tx - s * 0.09, ty, s * 0.18, hy - ty - s * 0.05);
        }
        if (kind === 2) {
            const [ax, ay] = stemTop(...heads[0]), [bx, by] = stemTop(...heads[1]);
            body.moveTo(ax - s * 0.09, ay);
            body.lineTo(bx + s * 0.09, by);
            body.lineTo(bx + s * 0.09, by + s * 0.36);
            body.lineTo(ax - s * 0.09, ay + s * 0.36);
            body.closePath();
        } else {
            const [tx, ty] = stemTop(0, 0);
            body.moveTo(tx, ty);
            body.quadraticCurveTo(tx + s * 0.7, ty + s * 0.25, tx + s * 0.62, ty + s * 0.95);
            body.quadraticCurveTo(tx + s * 0.45, ty + s * 0.55, tx, ty + s * 0.42);
            body.closePath();
        }
        if (ink) {
            g.strokeStyle = ink;
            g.lineWidth = lw * 2;
            g.lineJoin = 'round';
            g.stroke(body);
        }
        g.fillStyle = color;
        g.fill(body);
        g.restore();
    }

    // --- oblique solids ------------------------------------------------------------------
    // The style's 3D is an oblique projection, as in the reference: front faces keep their
    // true shape and depth recedes along D = [dx, dy] (screen units per unit of depth).
    // A face swept from an edge is seen when its outward normal points along D.

    // A box: front face (x, y, w, h), receding by D·depth.
    // cols: { front, top, side }   o: { ink, lw, depth }
    function box(g, x, y, w, h, D, cols, o = {}) {
        const { ink = COL.ink, lw = 3, depth = 1 } = o;
        const dx = D[0] * depth, dy = D[1] * depth;
        const f = [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
        const b = f.map(([px, py]) => [px + dx, py + dy]);
        if (dy < 0) poly(g, [f[0], f[1], b[1], b[0]], { fill: cols.top ?? cols.front, ink, lw });
        if (dy > 0) poly(g, [f[3], f[2], b[2], b[3]], { fill: cols.side ?? cols.front, ink, lw });
        if (dx > 0) poly(g, [f[1], f[2], b[2], b[1]], { fill: cols.side ?? cols.front, ink, lw });
        if (dx < 0) poly(g, [f[0], f[3], b[3], b[0]], { fill: cols.side ?? cols.front, ink, lw });
        poly(g, f, { fill: cols.front, ink, lw });
    }

    // Any front shape (clockwise in screen space, y down) swept back by Dd = [dx, dy]:
    // the seen swept faces, then the front. cols: { front, top, side }; a swept face takes
    // top or side by which way it faces. o: { ink, lw, sweepInk }
    function prism(g, pts, Dd, cols, o = {}) {
        const { ink = COL.ink, lw = 3 } = o;
        const n = pts.length;
        for (let i = 0; i < n; i++) {
            const a = pts[i], b = pts[(i + 1) % n];
            const nx = b[1] - a[1], ny = -(b[0] - a[0]); // outward normal of a clockwise polygon (y down)
            if (nx * Dd[0] + ny * Dd[1] <= 1e-9) continue;
            const up = -ny / (Math.hypot(nx, ny) || 1); // 1 = faces up
            poly(g, [a, b, [b[0] + Dd[0], b[1] + Dd[1]], [a[0] + Dd[0], a[1] + Dd[1]]], { fill: up > 0.35 ? cols.top ?? cols.front : cols.side ?? cols.front, ink: o.sweepInk === undefined ? ink : o.sweepInk, lw });
        }
        poly(g, pts, { fill: cols.front, ink, lw });
    }
    // The silhouette of a swept shape (front ∪ back ∪ swept faces) as one outline stroke:
    // call after prism(..., { sweepInk: null }) on rounded shapes, whose facets must not show.
    function prismOutline(g, pts, Dd, o = {}) {
        const { ink = COL.ink, lw = 3 } = o;
        const n = pts.length;
        g.strokeStyle = ink;
        g.lineWidth = lw;
        g.lineJoin = 'round';
        g.lineCap = 'round';
        const seen = pts.map((a, i) => {
            const b = pts[(i + 1) % n];
            return (b[1] - a[1]) * Dd[0] - (b[0] - a[0]) * Dd[1] > 1e-9;
        });
        g.beginPath();
        for (let i = 0; i < n; i++) {
            const a = pts[i], b = pts[(i + 1) % n];
            if (seen[i]) {
                // the back edge of a seen face is part of the silhouette
                g.moveTo(a[0] + Dd[0], a[1] + Dd[1]);
                g.lineTo(b[0] + Dd[0], b[1] + Dd[1]);
                // where the sweep starts or ends, the connecting edge shows
                if (!seen[(i + n - 1) % n]) {
                    g.moveTo(a[0], a[1]);
                    g.lineTo(a[0] + Dd[0], a[1] + Dd[1]);
                }
                if (!seen[(i + 1) % n]) {
                    g.moveTo(b[0], b[1]);
                    g.lineTo(b[0] + Dd[0], b[1] + Dd[1]);
                }
            }
        }
        g.stroke();
        poly(g, pts, { fill: null, ink, lw });
    }

    // A cylinder whose round face looks at the camera (a wheel, a drum): front disc at
    // (x, y) radius r, receding by Dd. cols: { front, side }  o: { ink, lw }
    function drum(g, x, y, r, Dd, cols, o = {}) {
        const { ink = COL.ink, lw = 3 } = o;
        const l = Math.hypot(Dd[0], Dd[1]);
        if (l > 1e-6) {
            const nx = -Dd[1] / l, ny = Dd[0] / l, a = Math.atan2(ny, nx);
            g.beginPath();
            g.arc(x + Dd[0], y + Dd[1], r, a - Math.PI, a, false);
            g.arc(x, y, r, a, a + Math.PI, false);
            g.closePath();
            g.fillStyle = cols.side ?? cols.front;
            g.fill();
            g.strokeStyle = ink;
            g.lineWidth = lw;
            g.lineJoin = 'round';
            g.stroke();
        }
        g.beginPath();
        g.arc(x, y, r, 0, TAU);
        g.fillStyle = cols.front;
        g.fill();
        g.strokeStyle = ink;
        g.lineWidth = lw;
        g.stroke();
    }

    // --- lettering -------------------------------------------------------------------------
    /**
     * Chunky extruded letters, each one its own solid that can tilt, hop and pop.
     *   size, font, face, side, side2 (+ bands: the grooved side of the reference), ink
     *   depth (logical units), dir [dx, dy] the way the solid recedes, ow outline width
     *   align 0..1, track, letter(i, ch, n) → { dx, dy, rot, s, sx, sy, face, side, hide, depth }
     * Returns the laid-out width.
     */
    function text3d(g, str, x, y, o = {}) {
        const { size = 120, font = FONT.block, face = COL.yellow, side = COL.orange, side2 = null, bands = 0, ink = COL.ink, depth = size * 0.16, dir = [0.7, 0.7], ow = size * 0.032, align = 0.5, track = 0, letter = null } = o;
        g.save();
        g.font = `${size}px "${font}"`;
        g.textAlign = 'center';
        g.textBaseline = 'alphabetic';
        g.lineJoin = 'round';
        const chars = [...str];
        const adv = chars.map((c) => g.measureText(c).width);
        const total = adv.reduce((a, b) => a + b, 0) + track * (chars.length - 1);
        const k = pxScale(g), dl = Math.hypot(dir[0], dir[1]) || 1, ux = dir[0] / dl, uy = dir[1] / dl;
        const mid = -size * 0.36;
        let cx = x - total * align;
        chars.forEach((ch, i) => {
            const c = cx + adv[i] / 2;
            cx += adv[i] + track;
            if (ch === ' ') return;
            const L = (letter && letter(i, ch, chars.length)) || {};
            if (L.hide) return;
            const sc = L.s ?? 1, d = depth * (L.depth ?? 1) * sc;
            const at = (off, fn) => {
                g.save();
                g.translate(c + (L.dx ?? 0) + ux * off, y + (L.dy ?? 0) + uy * off + mid);
                g.rotate(L.rot ?? 0);
                g.scale(sc * (L.sx ?? 1), sc * (L.sy ?? 1));
                g.translate(0, -mid);
                fn();
                g.restore();
            };
            // 1 · the swept solid's silhouette in ink
            g.strokeStyle = ink;
            g.lineWidth = ow * 2;
            const nS = Math.max(1, Math.ceil(d / Math.max(ow * 0.7, 0.4)));
            for (let j = nS; j >= 1; j--) at((d * j) / nS, () => g.strokeText(ch, 0, 0));
            // 2 · its side, in steps of about a pixel
            const nF = Math.max(1, Math.ceil(d * k));
            for (let j = nF; j >= 1; j--) {
                g.fillStyle = bands && side2 && Math.floor(((j - 0.5) * bands) / nF) % 2 ? side2 : L.side ?? side;
                at((d * j) / nF, () => g.fillText(ch, 0, 0));
            }
            // 3 · the face
            at(0, () => {
                g.strokeStyle = ink;
                g.lineWidth = ow * 2;
                g.strokeText(ch, 0, 0);
                g.fillStyle = L.face ?? face;
                g.fillText(ch, 0, 0);
            });
        });
        g.restore();
        return total;
    }

    // The VCR's on-screen display ("PLAY ▶", "STOP"): a thin slanted monoline with chamfered
    // corners and a soft glow, drawn as strokes (glyphs on a 1 × 2 box). Size and place were
    // measured on the reference: on the glass the text starts 11.7 % from the left with its
    // baseline at 16.2 %, capitals 6.7 % tall; the numbers below are those, before the tube.
    const OSD = {
        P: [[[0, 2], [0, 0], [0.78, 0], [1, 0.22], [1, 0.8], [0.78, 1.02], [0, 1.02]]],
        L: [[[0, 0], [0, 2], [1, 2]]],
        A: [[[0, 2], [0.5, 0], [1, 2]], [[0.17, 1.34], [0.83, 1.34]]],
        Y: [[[0, 0], [0.5, 1.02], [1, 0]], [[0.5, 1.02], [0.5, 2]]],
        S: [[[1, 0], [0.22, 0], [0, 0.24], [0, 0.72], [1, 1.3], [1, 1.76], [0.78, 2], [0, 2]]],
        T: [[[0, 0], [1, 0]], [[0.5, 0], [0.5, 2]]],
        O: [[[0.26, 0], [0.74, 0], [1, 0.3], [1, 1.7], [0.74, 2], [0.26, 2], [0, 1.7], [0, 0.3], [0.26, 0]]],
        E: [[[1, 0], [0, 0], [0, 2], [1, 2]], [[0, 1], [0.8, 1]]],
        W: [[[0, 0], [0.22, 2], [0.5, 0.9], [0.78, 2], [1, 0]]],
        R: [[[0, 2], [0, 0], [0.78, 0], [1, 0.22], [1, 0.8], [0.78, 1.02], [0, 1.02]], [[0.45, 1.02], [1, 2]]],
        F: [[[1, 0], [0, 0], [0, 2]], [[0, 1], [0.8, 1]]],
        D: [[[0, 0], [0.7, 0], [1, 0.3], [1, 1.7], [0.7, 2], [0, 2], [0, 0]]],
    };
    function osd(g, env, text, o = {}) {
        const { play = false, color = '#ffffff' } = o;
        const u = env.W / 1000, h = 65 * u, w = 36 * u, adv = 50.5 * u, x = 103 * u, y = 149 * u, slant = 0.13;
        g.save();
        g.translate(x, y);
        g.transform(1, 0, -slant, 1, 0, 0);
        g.strokeStyle = color;
        g.fillStyle = color;
        g.lineWidth = 5.4 * u;
        g.lineCap = 'round';
        g.lineJoin = 'round';
        g.shadowColor = 'rgba(255,255,255,0.8)';
        g.shadowBlur = 14 * u * pxScale(g);
        let cx = 0;
        for (const ch of text) {
            for (const st of OSD[ch] ?? []) {
                g.beginPath();
                st.forEach(([px, py], i) => (i ? g.lineTo(cx + px * w, (py / 2 - 1) * h) : g.moveTo(cx + px * w, (py / 2 - 1) * h)));
                g.stroke();
            }
            cx += adv;
        }
        if (play) {
            const tx = cx + 31 * u;
            g.beginPath();
            g.moveTo(tx, -h * 0.98);
            g.lineTo(tx + 55 * u, -h * 0.5);
            g.lineTo(tx, -h * 0.02);
            g.closePath();
            g.fill();
        }
        g.restore();
    }

    // --- tape and tube ---------------------------------------------------------------------
    // One fragment shader does the whole finish; see post() below for the uniforms.
    const VERT = `#version 300 es
in vec2 aPos; out vec2 vUv;
void main() { vUv = vec2(aPos.x * 0.5 + 0.5, 0.5 - aPos.y * 0.5); gl_Position = vec4(aPos, 0.0, 1.0); }`;
    const FRAG = `#version 300 es
precision highp float; precision highp int;
uniform sampler2D uTex; uniform vec2 uRes; uniform float uFrame, uTrack, uRoll, uSnow, uBezel;
in vec2 vUv; out vec4 outCol;
uint hashu(uvec3 v) {
    v = v * 1664525u + 1013904223u; v.x += v.y * v.z; v.y += v.z * v.x; v.z += v.x * v.y;
    v ^= v >> 16u; v.x += v.y * v.z; v.y += v.z * v.x; v.z += v.x * v.y; return v.x ^ v.y ^ v.z;
}
float hash(float x, float y, float z) { return float(hashu(uvec3(ivec3(floor(vec3(x, y, z))) + 40000)) >> 8) / 16777216.0; }
vec3 toYiq(vec3 c) { return vec3(dot(c, vec3(0.299, 0.587, 0.114)), dot(c, vec3(0.596, -0.274, -0.322)), dot(c, vec3(0.211, -0.523, 0.312))); }
vec3 toRgb(vec3 y) { return vec3(y.x + 0.956 * y.y + 0.621 * y.z, y.x - 0.272 * y.y - 0.647 * y.z, y.x - 1.106 * y.y + 1.703 * y.z); }
vec3 pic(vec2 uv) { return toYiq(texture(uTex, clamp(uv, vec2(0.0), vec2(1.0))).rgb); }
void main() {
    vec2 p = vUv * 2.0 - 1.0;
    // the glass: edges that bow out and rounded corners (measured: an inset of 2.2 % at the
    // middle of an edge growing with the 2.5th power to 5.7 % at the corner)
    vec2 a = abs(p);
    vec2 ins = 0.044 + 0.070 * pow(a.yx / 0.956, vec2(2.5));
    vec2 e = a - (1.0 - ins);
    float r = 0.035;
    float d = length(max(e + r, 0.0)) + min(max(e.x, e.y) + r, 0.0) - r;
    float mask = mix(1.0, 1.0 - smoothstep(-0.006, 0.006, d), uBezel);
    // the picture on the tube (barrel), with a little overscan
    vec2 q = p * mix(1.0, (1.0 + 0.075 * dot(p, p)) * 0.9643, uBezel);
    vec2 uv = q * 0.5 + 0.5;
    float S = uRes.x / 1080.0, dx = S / uRes.x;
    float lines = 262.0;
    // vertical roll (a lost lock): the picture slides and the blanking bar crosses it
    float bar = 0.0;
    if (uRoll != 0.0) {
        float y2 = uv.y + uRoll;
        float fy = fract(y2);
        bar = 1.0 - smoothstep(0.0, 0.012, min(fy, 1.0 - fy) - 0.03);
        uv.y = fy;
    }
    float yl = floor(uv.y * lines);
    // line jitter, and the tear and snow of bad tracking
    float jit = (hash(yl, uFrame, 1.0) - 0.5) * (0.0010 + 0.010 * uTrack);
    float b0 = fract(uFrame * 0.071 + 0.23), b1 = fract(0.77 - uFrame * 0.043);
    float n0 = exp(-abs(uv.y - b0) * 26.0), n1 = exp(-abs(uv.y - b1) * 40.0);
    float tear = uTrack * (0.11 * n0 - 0.07 * n1);
    float hs = smoothstep(0.988, 1.0, uv.y) * uBezel; // head switching, bottom lines
    uv.x += jit + tear + hs * (0.012 + 0.03 * hash(yl, uFrame, 3.0));
    // luma keeps most of its detail, chroma smears and lags to the right
    float Y = (pic(uv - vec2(1.3 * dx, 0.0)).x + 2.0 * pic(uv).x + pic(uv + vec2(1.3 * dx, 0.0)).x) * 0.25;
    vec2 C = vec2(0.0); float wsum = 0.0;
    for (int i = -4; i <= 4; i++) {
        float w = 1.0 - abs(float(i)) / 5.0;
        C += pic(uv + vec2((float(i) * 1.9 - 2.4 - 14.0 * uTrack) * dx, 0.0)).yz * w; wsum += w;
    }
    C /= wsum;
    // tape noise: grain in luma, slower speckle in chroma, snow on the tracking bars
    float gx = floor(uv.x * uRes.x / (2.0 * S)), gy = floor(uv.y * uRes.y / (2.0 * S));
    Y += (hash(gx, gy, uFrame) - 0.5) * 0.036;
    C += (vec2(hash(floor(gx / 5.0), gy, uFrame + 11.0), hash(floor(gx / 5.0), gy, uFrame + 23.0)) - 0.5) * 0.030;
    float snow = step(1.0 - (uTrack * (0.55 * n0 + 0.4 * n1) + uSnow), hash(floor(gx / 3.0), yl, uFrame + 5.0));
    Y = mix(Y, 0.55 + 0.45 * hash(gx, yl, uFrame + 9.0), snow);
    C *= 1.0 - snow;
    C *= 1.0 - 0.5 * uTrack;
    vec3 col = toRgb(vec3(Y, C * 1.06));
    col *= 1.0 - bar;
    // scanlines, barely there, and the tube's fall-off
    float sl = 0.5 - 0.5 * cos(6.2831853 * uv.y * lines);
    col *= 1.0 - 0.05 * (1.0 - sl) * (1.0 - 0.5 * Y) * uBezel;
    col *= 1.0 - 0.065 * dot(p, p) * uBezel;
    col = col * 0.945 + 0.028; // the tape never reaches black or white
    outCol = vec4(mix(vec3(0.024), clamp(col, 0.0, 1.0), mask), 1.0);
}`;
    let glState = null;
    function glFor(W, H) {
        if (glState && glState.W === W && glState.H === H) return glState;
        const cv = document.createElement('canvas');
        cv.width = W;
        cv.height = H;
        const gl = cv.getContext('webgl2', { preserveDrawingBuffer: true, antialias: false, alpha: false });
        if (!gl) return (glState = { W, H, gl: null });
        const sh = (type, src) => {
            const s = gl.createShader(type);
            gl.shaderSource(s, src);
            gl.compileShader(s);
            if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error('Cereal.post shader: ' + gl.getShaderInfoLog(s));
            return s;
        };
        const pr = gl.createProgram();
        gl.attachShader(pr, sh(gl.VERTEX_SHADER, VERT));
        gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FRAG));
        gl.linkProgram(pr);
        if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) throw new Error('Cereal.post link: ' + gl.getProgramInfoLog(pr));
        gl.useProgram(pr);
        const buf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
        const loc = gl.getAttribLocation(pr, 'aPos');
        gl.enableVertexAttribArray(loc);
        gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
        const tex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        const u = {};
        for (const n of ['uTex', 'uRes', 'uFrame', 'uTrack', 'uRoll', 'uSnow', 'uBezel']) u[n] = gl.getUniformLocation(pr, n);
        gl.viewport(0, 0, W, H);
        return (glState = { W, H, gl, cv, u, tex });
    }
    /**
     * The finish, for a scene's post(ctx, t, env): the frame goes through the tape (chroma
     * smear, line jitter, grain) and onto the tube (barrel, glass shape, fall-off).
     *   track  0..1  bad tracking: tearing, snow bars, washed colour
     *   roll   the picture's vertical slip, in frames of height (0 = locked)
     *   snow   0..1  extra snow over everything
     *   bezel  false leaves the picture flat and full frame (tape only, no tube)
     */
    function post(ctx, t, env, o = {}) {
        const [W, H] = env.px;
        const st = glFor(W, H);
        if (!st.gl) return;
        const { gl, u } = st;
        gl.bindTexture(gl.TEXTURE_2D, st.tex);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, ctx.canvas);
        gl.uniform1i(u.uTex, 0);
        gl.uniform2f(u.uRes, W, H);
        gl.uniform1f(u.uFrame, Math.round(t * env.fps));
        gl.uniform1f(u.uTrack, o.track ?? 0);
        gl.uniform1f(u.uRoll, o.roll ?? 0);
        gl.uniform1f(u.uSnow, o.snow ?? 0);
        gl.uniform1f(u.uBezel, o.bezel === false ? 0 : 1);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = 'source-over';
        ctx.drawImage(st.cv, 0, 0);
        ctx.restore();
    }

    return { COL, FONT, TAU, drawing, onTwos, pxScale, trace, poly, ellipsePts, curve, sunburst, burst, burstPts, shape, confetti, memphis, sparkle, note, box, prism, prismOutline, drum, text3d, osd, post };
})();
