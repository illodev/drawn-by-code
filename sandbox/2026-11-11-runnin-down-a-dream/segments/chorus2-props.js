// Props and effects of chorus 2 (segments/chorus2.js): the edge of sunbeams that brings the
// day back, water shaken off, what the thaw leaves on the Devil (limp wet hair, blue lips and
// chattering teeth, drips, shiver marks), the ice cube he sneezes, the chauffeur's towel, the
// title's letters as solids that fall and pile up, thud stars and dust, the puddle, the tail
// that sticks out of the pile.
// Units: figure units placed with (x, y, s) unless said otherwise; the letters are in logical
// units (they are scenery, like the title). Global: Chorus2Props.
// Depends on Cereal, Song, Cast, Devil, Weather, Chorus1Props.
const Chorus2Props = (() => {
    const C = Cereal, K = C.COL, W = Weather, ICE = W.ICE, DP = Devil.P, P1 = Chorus1Props, TAU = Math.PI * 2;
    const D = Cast.D, Dd = Cast.Dd;
    const lerp = (a, b, u) => a + (b - a) * u;
    const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
    const smooth = (u) => {
        const v = clamp(u);
        return v * v * (3 - 2 * v);
    };
    const rot = ([x, y], a) => [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)];
    const cw = (pts) => {
        let a = 0;
        for (let i = 0; i < pts.length; i++) {
            const p = pts[i], q = pts[(i + 1) % pts.length];
            a += p[0] * q[1] - q[0] * p[1];
        }
        return a > 0 ? pts : pts.slice().reverse();
    };
    const line = (g, pts, lw, ink = K.ink) => C.poly(g, pts, { ink, lw, close: false });
    const circ = (g, x, y, r, fill, lw, ink = K.ink) => {
        g.beginPath();
        g.arc(x, y, r, 0, TAU);
        g.fillStyle = fill;
        g.fill();
        if (lw > 0) {
            g.strokeStyle = ink;
            g.lineWidth = lw;
            g.stroke();
        }
    };
    // A band of varying width along a centreline: [[x, y, halfWidth], …] → an outline (as devil.js).
    const ribbon = (cl) => {
        const L = [], R = [];
        cl.forEach(([x, y, w], i) => {
            const a = cl[Math.max(0, i - 1)], b = cl[Math.min(cl.length - 1, i + 1)];
            const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1;
            L.push([x - (dy / l) * w, y + (dx / l) * w]);
            R.push([x + (dy / l) * w, y - (dx / l) * w]);
        });
        return [...L, ...R.reverse()];
    };

    // =========================================================================================
    // The edge of sunbeams
    // =========================================================================================
    /**
     * The day's leading edge, drawn over Weather.split(g, k, rain, day) with the same k (here k
     * runs 1 → 0: the edge crosses the frame from right to left). A row of beams, long and
     * short, that point into the rain and flicker on twos; a yellow and a gold stripe behind
     * them; three shafts of light further back in the day; twinkles ahead of it.
     */
    function sunEdge(g, t, k) {
        if (k <= 0 || k >= 1) return;
        const d = C.drawing(t), xs = (y) => W.frontX(k, y), y0 = -90, y1 = 1090;
        const band = (a, b, fill, alpha = 1) => {
            g.globalAlpha = alpha;
            C.poly(g, [[xs(y0) + a, y0], [xs(y0) + b, y0], [xs(y1) + b, y1], [xs(y1) + a, y1]], { fill, lw: 0 });
            g.globalAlpha = 1;
        };
        band(150, 214, '#fff6a8', 0.5);
        band(262, 292, '#fff6a8', 0.42);
        band(340, 354, '#fffbe0', 0.36);
        // the beams: a zigzag whose teeth point into the rain
        const step = 52, ph = ((d % 2) + 2) % 2, pts = [[xs(y0) + 26, y0]];
        for (let i = 0, y = y0; y < y1; y += step, i++) {
            const long = (i + ph) % 2 === 0, len = long ? 84 + 26 * ((i * 7) % 3) : 34;
            pts.push([xs(y) - 4, y], [xs(y + step * 0.5) - len, y + step * 0.5 + len * 0.16]);
        }
        pts.push([xs(y1) - 4, y1], [xs(y1) + 26, y1]);
        band(58, 78, K.gold);
        line(g, [[xs(y0) + 78, y0], [xs(y1) + 78, y1]], 3.2);
        band(24, 58, K.yellow);
        line(g, [[xs(y0) + 58, y0], [xs(y1) + 58, y1]], 3.2);
        C.poly(g, pts, { fill: K.white, ink: K.ink, lw: 3.6 });
        const r = Motion.rng('chorus2-edge');
        for (let i = 0; i < 7; i++) {
            const y = 60 + r() * 800, off = 130 + r() * 150, sz = 15 + r() * 16, f = (((d + i * 3) % 6) + 6) % 6;
            if (f > 2) continue;
            C.sparkle(g, xs(y) - off, y, sz * [0.6, 1, 0.7][f], { color: K.white, ink: K.ink, lw: 2.6, rot: i * 0.4 });
        }
    }

    /**
     * The road set's sun in shades, exactly as World.back draws it (x, y, r in the frame, without
     * its parallax): to paint it again OVER the edge of sunbeams, which would otherwise cross it.
     */
    function sun(g, x, y, r, t) {
        const d = C.drawing(t), bob = d % 4 < 2 ? 0 : 3;
        C.burst(g, x, y, { r0: r * 1.18, r1: r * 1.5, n: 14, seed: 'sun', jitter: 0.08, rot: d % 2 ? 0.06 : 0, fill: K.gold, ink: K.ink, lw: 4 });
        g.save();
        g.translate(x, y + bob);
        g.beginPath();
        g.arc(0, 0, r, 0, TAU);
        g.fillStyle = K.yellow;
        g.fill();
        g.strokeStyle = K.ink;
        g.lineWidth = 4;
        g.stroke();
        for (const sx of [-1, 1]) {
            const cx = sx * r * 0.36;
            C.poly(g, [[cx - r * 0.3, -r * 0.22], [cx + r * 0.3, -r * 0.22], [cx + r * 0.25, r * 0.08], [cx + r * 0.12, r * 0.16], [cx - r * 0.12, r * 0.16], [cx - r * 0.25, r * 0.08]], { fill: '#1d1626', ink: K.ink, lw: 3 });
            C.poly(g, [[cx - r * 0.16, r * 0.04], [cx - r * 0.02, -r * 0.12]], { ink: '#ffffff', lw: 3, close: false });
        }
        C.poly(g, [[-r * 0.1, -r * 0.18], [r * 0.1, -r * 0.18]], { ink: K.ink, lw: 5, close: false });
        C.poly(g, [[-r * 0.3, r * 0.42], [-r * 0.08, r * 0.52], [r * 0.14, r * 0.5], [r * 0.34, r * 0.36]], { ink: K.ink, lw: 4, close: false });
        g.restore();
    }

    // =========================================================================================
    // Water
    // =========================================================================================
    // A drop that points back along its path. r: its radius; ang: the way it travels.
    function drop(g, x, y, r, ang, L) {
        if (r < 0.006) return;
        g.save();
        g.translate(x, y);
        g.rotate(ang);
        g.beginPath();
        g.moveTo(-r * 2.7, 0);
        g.quadraticCurveTo(-r * 0.9, -r, 0, -r);
        g.arc(0, 0, r, -Math.PI / 2, Math.PI / 2);
        g.quadraticCurveTo(-r * 0.9, r, -r * 2.7, 0);
        g.closePath();
        g.fillStyle = ICE.light;
        g.fill();
        g.strokeStyle = ICE.line;
        g.lineWidth = L * 0.7;
        g.lineJoin = 'round';
        g.stroke();
        g.restore();
    }
    /**
     * Water flung off somebody who shakes: drops that leave the box (x ± w / 2, y − h … y) up and
     * out, on their arcs, on twos. age: seconds since the shake; o: { n, w, h, v (speed), life }
     */
    function spray(g, x, y, s, age, seed, o = {}) {
        const { n = 7, w = 0.6, h = 0.7, v = 3.4, life = 0.46 } = o;
        if (age < -1e-6 || age > life) return;
        const L = 3.2 / s, tq = Math.floor(age * 12 + 1e-6) / 12 + 1 / 24, r = Motion.rng('chorus2-spray:' + seed), G = 10.7;
        g.save();
        g.translate(x, y);
        g.scale(s, s);
        for (let i = 0; i < n; i++) {
            const side = i % 2 ? 1 : -1, a = -Math.PI / 2 + side * (0.25 + 1.0 * r()), sp = v * (0.6 + 0.6 * r()), sz = 0.034 + 0.026 * r();
            const vx = Math.cos(a) * sp, vy = Math.sin(a) * sp, px = side * w * 0.5 * r() + vx * tq, py = -h * r() + vy * tq + 0.5 * G * tq * tq;
            drop(g, px, py, sz * (tq > life - 0.13 ? 0.6 : 1), Math.atan2(vy + G * tq, vx), L);
        }
        g.restore();
    }
    /**
     * The puddle Weather.iceBlock leaves (the same outline, from the same seed), for when the
     * block is gone. x, y, s as given to iceBlock; melt as given to it; k: 1 → 0 dries it up
     * towards its middle; w: the block's width.
     */
    function puddle(g, x, y, s, melt, k = 1, w = 2.4, cx = 0.1) {
        if (k <= 0.04 || melt <= 0.02) return;
        const L = 3.2 / s, r = Motion.rng('weather-puddle'), rx = w / 2 + 0.25 + 1.0 * melt, ry = 0.12 + 0.22 * melt, pts = [];
        const sm = smooth(melt * 3 + 0.25);
        for (let i = 0; i < 12; i++) {
            const a = (i / 12) * TAU, q = 0.86 + 0.24 * r();
            pts.push([cx + 0.12 + Math.cos(a) * rx * q * sm * k, -0.06 + Math.sin(a) * ry * q * k]);
        }
        g.save();
        g.translate(x, y);
        g.scale(s, s);
        C.poly(g, C.curve(pts, true, 6), { fill: ICE.puddle, ink: ICE.line, lw: L * 0.85 });
        if (k > 0.5) {
            line(g, C.curve([[cx - rx * 0.5 * k, -0.06 - ry * 0.3 * k], [cx - rx * 0.2 * k, -0.06 - ry * 0.5 * k], [cx + rx * 0.12 * k, -0.06 - ry * 0.52 * k]], false, 5), L * 0.8, ICE.white);
            line(g, [[cx + rx * 0.4 * k, -0.06 + ry * 0.45 * k], [cx + rx * 0.62 * k, -0.06 + ry * 0.3 * k]], L * 0.7, ICE.white);
        }
        g.restore();
    }
    /**
     * The cloud in a block of ice, behind whoever is frozen in it (draw it first in
     * Weather.iceBlock's `inside`): the block's own solid, by weather.js's numbers, in a pale
     * blue at `alpha`, so that what stands behind the block is only a ghost. x, y, s and o as
     * given to iceBlock (o: melt, w, h, d, cx).
     */
    function milk(g, x, y, s, o = {}, alpha = 0.9) {
        const melt = clamp(o.melt ?? 0), Wd = (o.w ?? 2.4) * (1 - 0.1 * melt), H = (o.h ?? 2.75) * (1 - 0.88 * melt), Z = o.d ?? 1.0, cx = o.cx ?? 0.1, f = Dd(-0.3);
        if (H < 0.04 || alpha <= 0.01) return;
        const x0 = cx - Wd / 2 + f[0], x1 = cx + Wd / 2 + f[0], yB = f[1], yT = yB - H;
        const c1 = Math.min(H * 0.45, 0.16 + 0.4 * melt), c2 = Math.min(H * 0.45, 0.12 + 0.3 * melt), c3 = Math.min(H * 0.3, 0.07), c4 = Math.min(H * 0.3, 0.1);
        const chip = H > 1 ? [[x0, yT + H * 0.52], [x0 + 0.07, yT + H * 0.47], [x0, yT + H * 0.4]] : [];
        const face = [[x0 + c1, yT], [x1 - c2, yT], [x1, yT + c2], [x1, yB - c4], [x1 - c4, yB], [x0 + c3, yB], [x0, yB - c3], ...chip, [x0, yT + c1]];
        g.save();
        g.translate(x, y);
        g.scale(s, s);
        g.globalAlpha = alpha;
        C.prism(g, face, Dd(Z), { front: '#cfeaff', top: '#e2f3ff', side: '#b4dafa' }, { lw: 0 });
        g.restore();
    }
    /**
     * Wisps of steam off something the sun is drying, on twos: small puffs that rise from the
     * line (x ± w / 2, y), thin out and go. k: 0..1 how much.
     */
    function steam(g, x, y, s, t, k = 1, w = 2, seed = 0, n = 5) {
        if (k <= 0.03) return;
        const L = 3.2 / s, d = C.drawing(t), r = Motion.rng('chorus2-steam:' + seed), list = [];
        for (let i = 0; i < n; i++) {
            const px = (r() - 0.5) * w, ph = Math.floor(r() * 9), f = (((d + ph) % 9) + 9) % 9, u = f / 9;
            if (u > 0.8 * k + 0.1) continue;
            list.push([px + 0.1 * Math.sin(u * 5 + i), -0.05 - u * 0.75, (0.06 + 0.11 * u) * (u > 0.6 ? 1 - (u - 0.6) * 1.9 : 1) * (0.6 + 0.4 * k), 5 + (i % 2), i * 1.1 + f * 0.5]);
        }
        g.save();
        g.translate(x, y);
        g.scale(s, s);
        P1.puffs(g, list, '#f4fbff', L * 0.8, ICE.line);
        g.restore();
    }

    // =========================================================================================
    // The Devil, thawed: overlays in his own frame
    // =========================================================================================
    /**
     * Runs fn(g, L) under the transform Devil.draw gives his body (lean, squash) or, with
     * head = true, his head (headDy, headTilt on top of it), for what is drawn on him.
     */
    function onDevil(g, x, y, s, pose, fn, head = false) {
        const q = pose.squash ?? 0;
        g.save();
        g.translate(x, y);
        g.scale(s, s);
        g.rotate(pose.lean ?? 0);
        g.scale(1 + q, 1 - q);
        if (head) {
            g.translate(0, pose.headDy ?? 0);
            g.rotate(pose.headTilt ?? 0);
        }
        g.lineJoin = 'round';
        g.lineCap = 'round';
        fn(g, 3.2 / s);
        g.restore();
    }
    const HT = Devil.HEAD.top, HB = HT + Devil.HEAD.h;
    // His moustache and goatee, as devil.js draws them (for what is painted over his mouth).
    function whiskers(g, L, droop = 0) {
        const mu = HT + 0.625;
        for (const sx of [-1, 1]) {
            const cl = C.curve([[sx * 0.012, mu], [sx * 0.11, mu + 0.02], [sx * 0.24, mu + 0.0 + droop], [sx * 0.34, mu - 0.06 + droop * 1.6], [sx * 0.335, mu - 0.115 + droop * 1.8]], false, 8);
            const n = cl.length;
            C.poly(g, ribbon(cl.map(([x, y], i) => [x, y, 0.022 * (1 - (i / (n - 1)) * 0.82)])), { fill: DP.hair, ink: DP.ink, lw: L * 0.5 });
        }
        C.poly(g, [[-0.08, HB - 0.06], [0.08, HB - 0.06], [0.045, HB + 0.06], [0, HB + 0.13], [-0.045, HB + 0.06]], { fill: DP.hair, ink: DP.ink, lw: L });
        line(g, [[-0.03, HB - 0.03], [-0.012, HB + 0.055]], L * 0.9, DP.sheen);
    }
    /**
     * Blue lips round chattering teeth, over the mouth of his 'shock' mood (call it in his
     * head's frame: onDevil(…, true)). d: the drawing, the jaw shifts on every one.
     */
    function chatter(g, L, d) {
        const my = HT + 0.7, f = ((d % 2) + 2) % 2, j = f ? 0.014 : -0.006;
        const lips = C.curve([[-0.25, my + 0.03], [-0.17, my - 0.08], [0, my - 0.095], [0.17, my - 0.08], [0.25, my + 0.03], [0.18, my + 0.13 + j], [0, my + 0.15 + j], [-0.18, my + 0.13 + j]], true, 5);
        C.poly(g, lips, { fill: ICE.deep, ink: DP.ink, lw: L });
        const teeth = [[-0.19, my + 0.025], [-0.13, my - 0.04], [0.13, my - 0.04], [0.19, my + 0.025], [0.13, my + 0.085 + j], [-0.13, my + 0.085 + j]];
        C.poly(g, teeth, { fill: DP.tooth, ink: DP.ink, lw: L * 0.8 });
        g.save();
        C.trace(g, teeth);
        g.clip();
        g.strokeStyle = DP.ink;
        g.lineWidth = L * 0.7;
        g.beginPath();
        const zy = my + 0.022 + j * 0.5;
        g.moveTo(-0.2, zy);
        for (let i = -5; i <= 5; i++) g.lineTo(i * 0.04 + (f ? 0.012 : 0), zy + ((i + f) % 2 ? 0.02 : -0.02));
        g.stroke();
        g.restore();
        whiskers(g, L, 0.08);
    }
    /**
     * His pompadour, soaked: limp locks that hang over his forehead, a bead on the tip of
     * each (head frame). k: 0..1 how far they have come down; d: the drawing.
     */
    function wetHair(g, L, k = 1, d = 0) {
        if (k <= 0.05) return;
        const lock = (x0, len, w, bend, i) => {
            const cl = [], n = 10, l = len * k, sw = 0.014 * ((((d + i) % 2) + 2) % 2 ? 1 : -1);
            for (let j = 0; j <= n; j++) {
                const u = j / n;
                // limp: it hangs in a slack S and thins to a point
                cl.push([x0 + bend * u + 0.03 * Math.sin(u * 4.4 + i * 1.7) * u + sw * u * u, HT - 0.1 + l * u, w * Math.pow(1 - u, 0.8) + 0.005]);
            }
            C.poly(g, ribbon(cl), { fill: DP.hair, ink: DP.ink, lw: L * 0.8 });
            line(g, cl.slice(1, 5).map(([x, y]) => [x - w * 0.3, y]), L * 0.7, DP.sheen);
            const e = cl[n], f = (((d + i * 2) % 6) + 6) % 6;
            if (k > 0.7 && f < 4) circ(g, e[0], e[1] + 0.022 + 0.008 * f, 0.016 + 0.004 * f, ICE.light, L * 0.6, ICE.line);
        };
        lock(-0.36, 0.38, 0.044, -0.03, 0);
        lock(-0.17, 0.27, 0.036, 0.02, 3);
        lock(0.0, 0.5, 0.042, 0.015, 1);
        lock(0.17, 0.25, 0.034, -0.02, 4);
        lock(0.33, 0.34, 0.044, 0.04, 2);
    }
    /**
     * Water running off him, on twos: beads and drops from his elbows, coat tails, mitts and
     * tail (body frame). pose: the one given to Devil.draw; t: seconds; k: 0..1 how much.
     */
    function dripping(g, L, pose, t, k = 1) {
        const hR = pose.handR ?? [-0.5, -0.5], hL = pose.handL ?? [0.5, -0.5];
        const pts = [[hR[0], hR[1] + 0.09], [hL[0], hL[1] + 0.09], [-0.3, -0.36], [0.33, -0.36], [0.9, -0.42], [0, HB + 0.14]].slice(0, Math.round(6 * k));
        if (pts.length) W.drips(g, 0, 0, 1, t, 0, { pts, len: 0.36, slant: 0, color: ICE.light });
    }
    /**
     * Shiver marks either side of somebody, on twos (frame coordinates). w: half the distance
     * between the two groups; h: their height.
     */
    function shivers(g, x, y, s, t, w = 0.82, h = 1.5) {
        const d = C.drawing(t), L = 3.2 / s, f = ((d % 2) + 2) % 2;
        g.save();
        g.translate(x, y);
        g.scale(s, s);
        for (const sx of [-1, 1]) {
            for (let i = 0; i < 3; i++) {
                const yy = -h + i * 0.42 + (f ? 0.07 : 0), xx = sx * (w + (i === 1 ? 0.12 : 0) + (f ? 0.05 : 0)), a = 0.15;
                const z = [[xx, yy], [xx + sx * a * 0.5, yy + a * 0.42], [xx, yy + a * 0.84], [xx + sx * a * 0.5, yy + a * 1.26]];
                line(g, z, L * 2.6, K.ink);
                line(g, z, L * 1.1, ICE.light);
            }
        }
        g.restore();
    }
    /**
     * A sneeze: a jagged puff at (x, y) that opens for three drawings, with spit. age: seconds
     * since; dir: the way it goes (radians).
     */
    function sneeze(g, x, y, s, age, dir = Math.PI * 0.82) {
        const d = Math.floor(age * 12 + 1e-6);
        if (age < -1e-6 || d > 2) return;
        const L = 3.2 / s, f = [0.6, 1, 1.2][d], ux = Math.cos(dir), uy = Math.sin(dir);
        g.save();
        g.translate(x, y);
        g.scale(s, s);
        C.burst(g, ux * 0.42 * f, uy * 0.42 * f, { r0: 0.15 * f, r1: 0.28 * f, n: 9, seed: 'chorus2-sneeze', jitter: 0.25, rot: d * 0.3, fill: d < 2 ? K.white : ICE.light, ink: K.ink, lw: L });
        for (let i = 0; i < 5; i++) {
            const a = dir + (i - 2) * 0.3, r0 = 0.62 * f + 0.1, r1 = r0 + 0.16 + 0.05 * (i % 2);
            line(g, [[Math.cos(a) * r0, Math.sin(a) * r0], [Math.cos(a) * r1, Math.sin(a) * r1]], L, K.ink);
        }
        g.restore();
    }
    /**
     * An ice cube (x, y: its middle; size: its edge; a: how it is turned).
     */
    function cube(g, x, y, s, a = 0, size = 0.2) {
        const L = 3.2 / s, h = size / 2, pts = cw([[-h, -h], [h, -h], [h, h], [-h, h]].map((p) => rot(p, a)));
        g.save();
        g.translate(x, y);
        g.scale(s, s);
        g.lineJoin = 'round';
        C.prism(g, pts, Dd(size * 0.7), { front: ICE.fill, top: ICE.light, side: ICE.dark }, { lw: L * 0.9, ink: ICE.line });
        const p0 = rot([-h * 0.5, -h * 0.55], a), p1 = rot([-h * 0.5, h * 0.2], a);
        line(g, [p0, p1], L * 0.9, ICE.white);
        g.restore();
    }

    // =========================================================================================
    // The towel
    // =========================================================================================
    const TOWEL = { body: '#fffdf4', side: '#d9d4e6', stripe: K.teal, fold: '#c9c3dc' };
    // A flat piece of towel: the quad a, b, c, d (a → b its top edge, d → c its hem) with two
    // stripes near the hem and a fringe.
    function towelPiece(g, L, a, b, c, d, fringe = true) {
        const at = (u, v) => [lerp(lerp(a[0], b[0], u), lerp(d[0], c[0], u), v), lerp(lerp(a[1], b[1], u), lerp(d[1], c[1], u), v)];
        if (fringe) {
            for (let i = 0; i <= 6; i++) {
                const p = at(i / 6, 1), q = at(i / 6, 1.09);
                line(g, [p, q], L * 0.8);
            }
        }
        C.poly(g, [a, b, c, d], { fill: TOWEL.body, ink: K.ink, lw: L });
        for (const [v0, v1] of [[0.62, 0.72], [0.8, 0.9]]) C.poly(g, [at(0, v0), at(1, v0), at(1, v1), at(0, v1)], { fill: TOWEL.stripe, lw: 0 });
        C.poly(g, [a, b, c, d], { ink: K.ink, lw: L });
    }
    /**
     * The towel folded over a mitt (x, y: the mitt), hanging: two flaps, the near one longer.
     */
    function towelHang(g, x, y, s, sw = 0) {
        const L = 3.2 / s;
        g.save();
        g.translate(x, y);
        g.scale(s, s);
        g.lineJoin = 'round';
        towelPiece(g, L, [-0.1, -0.06], [0.3, -0.1], [0.3 + sw, 0.42], [-0.1 + sw, 0.46]);
        towelPiece(g, L, [-0.22, -0.02], [0.2, -0.06], [0.2 + sw * 1.3, 0.62], [-0.22 + sw * 1.3, 0.66]);
        g.restore();
    }
    /**
     * The towel in the air, thrown: a sheet that turns and ripples (x, y: its middle; a: its
     * angle; f: 0 | 1, the drawing's ripple).
     */
    function towelFly(g, x, y, s, a, f = 0) {
        const L = 3.2 / s, w = 0.36, h = 0.3, bow = f ? 0.07 : -0.05;
        g.save();
        g.translate(x, y);
        g.scale(s, s);
        g.rotate(a);
        g.lineJoin = 'round';
        const top = C.curve([[-w, -h], [-w * 0.3, -h + bow], [w * 0.4, -h - bow], [w, -h]], false, 5), bot = C.curve([[w, h], [w * 0.3, h - bow], [-w * 0.4, h + bow], [-w, h]], false, 5);
        C.poly(g, [...top, ...bot], { fill: TOWEL.body, ink: K.ink, lw: L });
        g.save();
        C.trace(g, [...top, ...bot]);
        g.clip();
        for (const sx of [-1, 1]) for (const [u0, u1] of [[0.55, 0.67], [0.76, 0.88]]) C.poly(g, [[sx * w * u0, -h - 0.2], [sx * w * u1, -h - 0.2], [sx * w * u1, h + 0.2], [sx * w * u0, h + 0.2]], { fill: TOWEL.stripe, lw: 0 });
        g.restore();
        C.poly(g, [...top, ...bot], { ink: K.ink, lw: L });
        for (const sx of [-1, 1]) for (let i = 0; i <= 4; i++) line(g, [[sx * w, -h + (i / 4) * 2 * h], [sx * (w + 0.045), -h + (i / 4) * 2 * h]], L * 0.8);
        g.restore();
    }
    /**
     * The towel over his head, hung from his two horns like a tent: it hides his eyes (head
     * frame). jx: it slides that much to one side (for the rub); sq: 0..1 it is pressed down.
     */
    function towelHead(g, L, jx = 0, sq = 0) {
        const T = HT, tip = T - 0.5 + 0.1 * sq, sag = T - 0.34 + 0.1 * sq;
        const out = [[-0.7 + jx, T + 0.6], [-0.72 + jx, T + 0.05], [-0.64 + jx * 0.6, T - 0.36], [-0.5 + jx * 0.4, tip], [-0.36 + jx * 0.5, T - 0.44 + 0.1 * sq], [-0.2 + jx * 0.6, sag], [0.2 + jx * 0.6, sag], [0.36 + jx * 0.5, T - 0.44 + 0.1 * sq], [0.5 + jx * 0.4, tip], [0.64 + jx * 0.6, T - 0.36], [0.72 + jx, T + 0.05], [0.7 + jx, T + 0.6]];
        const hem = [[0.5 + jx, T + 0.56], [0.24 + jx, T + 0.5], [-0.24 + jx, T + 0.5], [-0.5 + jx, T + 0.56]];
        const shape = [...C.curve(out, false, 5), ...C.curve(hem, false, 5)];
        // the fringe along the two hanging ends
        for (const sx of [-1, 1]) for (let i = 0; i <= 3; i++) line(g, [[sx * (0.52 + i * 0.06) + jx, T + 0.565 + i * 0.012], [sx * (0.52 + i * 0.06) + jx, T + 0.63 + i * 0.012]], L * 0.8);
        C.poly(g, shape, { fill: TOWEL.body, ink: K.ink, lw: L });
        g.save();
        C.trace(g, shape);
        g.clip();
        for (const dy of [0.1, 0.22]) line(g, C.curve([[-0.76 + jx, T + 0.58 - dy], [-0.5 + jx, T + 0.54 - dy], [-0.24 + jx, T + 0.48 - dy], [0.24 + jx, T + 0.48 - dy], [0.5 + jx, T + 0.54 - dy], [0.76 + jx, T + 0.58 - dy]], false, 5), 0.062, TOWEL.stripe);
        g.restore();
        C.poly(g, shape, { ink: K.ink, lw: L });
        // folds that fall from the horns
        for (const sx of [-1, 1]) {
            line(g, [[sx * 0.5 + jx * 0.4, tip + 0.08], [sx * 0.56 + jx * 0.7, T + 0.06]], L * 0.8, TOWEL.fold);
            line(g, [[sx * 0.4 + jx * 0.4, T - 0.34], [sx * 0.36 + jx * 0.7, T - 0.04]], L * 0.8, TOWEL.fold);
        }
    }
    /**
     * The towel round his neck: its two ends on his chest (body frame, after Devil.draw).
     */
    function towelNeck(g, L, sw = 0) {
        const y0 = HB - 0.005;
        towelPiece(g, L, [-0.3, y0], [-0.13, y0], [-0.11 + sw, -0.5], [-0.29 + sw, -0.47]);
        towelPiece(g, L, [0.13, y0], [0.3, y0], [0.29 + sw, -0.5], [0.11 + sw, -0.53]);
    }

    // =========================================================================================
    // The title's letters as solids
    // =========================================================================================
    // Anton's capitals, per unit of font size: the face's width and how far its middle is from
    // the middle of the letter's advance (measured in the browser at 1000 px).
    const GLYPH = { R: [0.438, 0.0115], U: [0.437, -0.0025], N: [0.438, 0.001], I: [0.187, -0.004], D: [0.438, 0.0035], O: [0.438, 0.007], W: [0.703, -0.0045], A: [0.484, 0], E: [0.375, 0.0125], M: [0.688, 0.002], "'": [0.187, -0.004] };
    const CAP = 0.859, APOS = [0.312, 0.547]; // a capital's height; the apostrophe's height and how far its foot is above the baseline
    // the two kinds, as Chorus1Props.title draws them (per unit of size)
    const KIND = {
        big: { face: K.yellow, side: K.red, side2: K.orange, bands: 3, depth: 27 / 196, ow: 4.6 / 196 },
        small: { face: K.white, side: K.ink, side2: K.white, bands: 4, depth: 14 / 104, ow: 3.2 / 104 },
    };
    // On the ground the solids are swept like every other solid of the set: up and to the right.
    const SWEEP = [D[0], D[1]];
    // the face of a letter at size S: [width, height]
    const faceOf = (ch, S) => [GLYPH[ch][0] * S, (ch === "'" ? APOS[0] : CAP) * S];
    /**
     * One letter as a solid. (cx, cy): the middle of its face; S: the font size.
     *   o: { rot (about the face's middle), sx, sy (a squash that keeps its foot where it is), dir (the sweep) }
     */
    function solid(g, ch, kind, S, cx, cy, o = {}) {
        const { rot: a = 0, sx = 1, sy = 1, dir = SWEEP } = o, k = KIND[kind], [, off] = GLYPH[ch], [, h] = faceOf(ch, S);
        // Cereal.text3d turns and scales a letter about a point 0.36 S above its baseline, in the
        // middle of its advance: place that point so that the face's middle is where we want it
        const base = h / 2 + (ch === "'" ? APOS[1] * S : 0); // the baseline, below the face's middle
        const v = [off * S * sx, (0.36 * S - base) * sy]; // from that point to the face's middle, once scaled
        const foot = rot([0, (1 - sy) * h * 0.5], a), q = rot(v, a);
        const px = cx + foot[0] - q[0], py = cy + foot[1] - q[1];
        C.text3d(g, ch, px, py + 0.36 * S, { size: S, face: k.face, side: k.side, side2: k.side2, bands: k.bands, depth: k.depth * S, ow: k.ow * S, dir, letter: () => ({ rot: a, sx, sy }) });
    }

    /**
     * What a heavy thing raises when it lands. x, y: the ground under its middle; w: its width
     * (logical units); age: seconds since.
     *   part 'star' (draw it before the thing): a flat jagged star, two drawings
     *   part 'dust' (after it): puffs that roll out from its two ends, pebbles, ticks
     */
    function thud(g, x, y, w, age, part = 'dust', o = {}) {
        if (age < -1e-6 || age > 0.5) return;
        const d = Math.floor(age * 12 + 1e-6), seed = o.seed ?? 0, k = age / 0.5, tq = d / 12 + 1 / 24;
        if (part === 'star') {
            if (d > 1) return;
            const f = d === 0 ? 1 : 1.2;
            C.burst(g, x, y - 3, { r0: w * 0.82 * f, r1: w * 1.3 * f, n: 13, seed: 'chorus2-thud:' + seed, jitter: 0.22, rot: d * 0.14, fill: K.white, ink: K.ink, lw: 3.2, sx: 1, sy: o.flat ?? 0.3 });
            C.burst(g, x, y - 3, { r0: w * 0.5 * f, r1: w * 0.86 * f, n: 11, seed: 'chorus2-thud2:' + seed, jitter: 0.22, rot: 0.3 + d * 0.14, fill: K.yellow, ink: K.ink, lw: 2.6, sx: 1, sy: (o.flat ?? 0.3) * 0.8 });
            return;
        }
        if (o.dust !== false) {
            const r = Motion.rng('chorus2-dust:' + seed), back = [], fore = [], grow = 1 - Math.pow(1 - k, 2.4);
            for (const side of [-1, 1]) {
                for (let i = 0; i < 4; i++) {
                    const out = 8 + 60 * r(), size = (0.2 + 0.16 * r()) * w, end = 0.55 + 0.45 * r(), n = 5 + Math.floor(r() * 3), a0 = r() * TAU, up = r();
                    const life = Math.max(0, 1 - k / end), rad = size * Math.min(1, 0.45 + k * 4) * Math.pow(life, 0.6) * (1 + 0.05 * (((d + i) % 2) * 2 - 1));
                    (i < 2 ? back : fore).push([x + side * (w / 2 + out * grow), y - rad * 0.6 - up * 16 * grow, rad * (i < 2 ? 1.1 : 0.78), n, a0 + 0.4 * (((d + i * 2) % 3) - 1)]);
                }
            }
            P1.puffs(g, back, P1.DUST.back, 3.2);
            P1.puffs(g, fore, P1.DUST.fore, 3.2);
            for (let i = 0; i < 6; i++) {
                const side = i % 2 ? 1 : -1, vx = side * (120 + 260 * r()), vy = -(240 + 260 * r()), sz = 3.4 + 3 * r();
                const px = x + side * w * 0.5 + vx * tq, py = y + vy * tq + 800 * tq * tq;
                if (py < y - 2) circ(g, px, py, sz, P1.DUST.stone, 2.4);
            }
        }
    }
    /**
     * A small knock: ticks round (x, y) for two drawings, r away from it. o: { n, a0, a1 (the fan
     * they fill), sides (true: two fans of n, to the left and to the right, low: for a thing
     * that has landed, so that none crosses it), lw, ink }
     */
    function tick(g, x, y, r, age, o = {}) {
        const d = Math.floor(age * 12 + 1e-6);
        if (age < -1e-6 || d > 1) return;
        if (o.sides) {
            tick(g, x, y, r, age, { ...o, sides: false, a0: -Math.PI * 1.02, a1: -Math.PI * 0.8 });
            tick(g, x, y, r, age, { ...o, sides: false, a0: -Math.PI * 0.2, a1: Math.PI * 0.02 });
            return;
        }
        const n = o.n ?? 7, a0 = o.a0 ?? -Math.PI, a1 = o.a1 ?? 0, f = d ? 1.3 : 1;
        for (let i = 0; i < n; i++) {
            const a = a0 + ((a1 - a0) * (i + 0.5)) / n, ra = r * f, rb = ra + r * (0.5 + 0.25 * (i % 2));
            line(g, [[x + Math.cos(a) * ra, y + Math.sin(a) * ra], [x + Math.cos(a) * rb, y + Math.sin(a) * rb]], o.lw ?? 3, o.ink ?? K.ink);
        }
    }

    // =========================================================================================
    // His tail, on its own (what sticks out of the pile)
    // =========================================================================================
    /**
     * A tail drawn like his (devil.js): a red band that thins out along `pts` (figure units from
     * x, y) and ends in the spade.
     */
    function tail(g, x, y, s, pts) {
        const L = 3.2 / s, cl = C.curve(pts, false, 8), n = cl.length;
        g.save();
        g.translate(x, y);
        g.scale(s, s);
        g.lineJoin = 'round';
        C.poly(g, ribbon(cl.map(([px, py], i) => [px, py, 0.05 - 0.028 * (i / (n - 1))])), { fill: DP.skin, ink: DP.ink, lw: L });
        line(g, cl.slice(4, Math.floor(n * 0.55)).map(([px, py]) => [px + 0.012, py + 0.014]), L * 1.1, DP.skinSide);
        const e = cl[n - 1], f = cl[n - 3], a = Math.atan2(e[1] - f[1], e[0] - f[0]);
        const spade = [[-0.02, -0.03], [-0.07, -0.13], [0.06, -0.075], [0.2, 0], [0.06, 0.075], [-0.07, 0.13], [-0.02, 0.03]].map((p) => {
            const q = rot(p, a);
            return [e[0] + q[0], e[1] + q[1]];
        });
        C.prism(g, cw(spade), Dd(0.04), { front: DP.skin, top: DP.skinTop, side: DP.skinSide }, { lw: L, ink: DP.ink });
        g.restore();
    }

    return { sunEdge, sun, drop, spray, puddle, milk, steam, onDevil, chatter, whiskers, wetHair, dripping, shivers, sneeze, cube, TOWEL, towelHang, towelFly, towelHead, towelNeck, GLYPH, CAP, KIND, faceOf, solid, thud, tick, tail };
})();
