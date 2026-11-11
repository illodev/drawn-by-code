// Skyward: the sets and props of the film's last minute (the long guitar solo and the fade).
// A volcano in Hell launches the band's car straight up: out of the desert floor next to a
// little town, through the clouds where angels cover their ears and then join in, and on to
// the full moon. At the fade the Devil hangs Tom's autograph on his dressing-room wall.
//
//   Skyward.ascent(g, t, Y, o)        the vertical travelling backdrop (and ascentFront for what
//                                     passes in front of the car); ZONES, at, site, moonAt
//   Skyward.town(g, x, y, s, o)       the main street, seen from the side
//   Skyward.angel(g, x, y, s, pose)   three angels; cloudBank, pearlyBits, harp, trumpet
//   Skyward.moon(g, x, y, r, o)       the film's moon, close; landing, landingSlide
//   Skyward.backstage(g, t, o)        the Devil's dressing room; autograph, frameAt, BACKSTAGE
//
// Units: the frame is 1000 × 1000 logical. People and props are in figure units as in cast.js
// (1 ≈ a head's width, a standing person is about 1.9 tall, `s` = logical units per figure
// unit); y grows downwards; oblique projection with the cast's D. Everything is a pure
// function of its arguments. Every drawer is documented where it is defined.
// Global: Skyward. Depends on Cereal, Cast (arms, feet) and Devil (his palette, his trident).
const Skyward = (() => {
    const C = Cereal, K = C.COL, TAU = Math.PI * 2;
    const D = [0.3, -0.2]; // the same as Cast.D: screen offset per unit of depth
    const Dd = (z) => [D[0] * z, D[1] * z];
    const ob = (x, y, z = 0) => [x + D[0] * z, y + D[1] * z];
    const lerp = (a, b, u) => a + (b - a) * u;
    const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
    const seg = (v, a, b) => clamp((v - a) / (b - a));
    const smooth = (u) => {
        const v = clamp(u);
        return v * v * (3 - 2 * v);
    };
    const back = (u) => {
        const v = clamp(u) - 1;
        return 1 + 2.7 * v * v * v + 1.7 * v * v;
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
    const shift = (pts, d) => pts.map(([x, y]) => [x + d[0], y + d[1]]);
    const circ = (g, x, y, r, fill, lw = 0, ink = K.ink) => {
        g.beginPath();
        g.arc(x, y, r, 0, TAU);
        if (fill) {
            g.fillStyle = fill;
            g.fill();
        }
        if (lw > 0) {
            g.strokeStyle = ink;
            g.lineWidth = lw;
            g.stroke();
        }
    };
    const oval = (g, x, y, rx, ry, fill, lw = 0, ink = K.ink, a = 0) => {
        g.beginPath();
        g.ellipse(x, y, rx, ry, a, 0, TAU);
        if (fill) {
            g.fillStyle = fill;
            g.fill();
        }
        if (lw > 0) {
            g.strokeStyle = ink;
            g.lineWidth = lw;
            g.stroke();
        }
    };
    const line = (g, pts, lw, ink = K.ink) => C.poly(g, pts, { ink, lw, close: false });
    // A tube: a thick line in a colour with the outline round it.
    const tube = (g, pts, w, col, L, close = false, ink = K.ink) => {
        C.poly(g, pts, { ink, lw: w + 2 * L, close });
        C.poly(g, pts, { ink: col, lw: w, close });
    };
    const rrect = (g, x, y, w, h, r, fill, lw = 0, ink = K.ink) => {
        g.beginPath();
        g.roundRect(x, y, w, h, r);
        if (fill) {
            g.fillStyle = fill;
            g.fill();
        }
        if (lw > 0) {
            g.strokeStyle = ink;
            g.lineWidth = lw;
            g.lineJoin = 'round';
            g.stroke();
        }
    };
    const hex = (c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
    const mixMemo = new Map();
    const mix = (a, b, k) => {
        if (k <= 0) return a;
        if (k >= 1) return b;
        const key = a + b + Math.round(k * 64);
        let v = mixMemo.get(key);
        if (!v) {
            const A = hex(a), B = hex(b), q = Math.round(k * 64) / 64;
            v = '#' + A.map((x, i) => Math.round(x + (B[i] - x) * q).toString(16).padStart(2, '0')).join('');
            mixMemo.set(key, v);
        }
        return v;
    };
    const mixAll = (A, B, k) => (k <= 0 ? A : k >= 1 ? B : Object.fromEntries(Object.keys(A).map((n) => [n, mix(A[n], B[n], k)])));
    // Scalloped puffs (smoke, dust), as in rides.js: the outlines of a whole group first and
    // the fills on top, so touching puffs merge. list: [[x, y, r, bumps, a0], …]
    function puffs(g, list, fill, L, ink = K.ink) {
        const parts = [];
        for (const [x, y, r, n, a0] of list) {
            if (!(r > 0)) continue;
            parts.push([x, y, r * 0.74]);
            for (let i = 0; i < n; i++) {
                const a = a0 + (i / n) * TAU;
                parts.push([x + Math.cos(a) * r * 0.62, y + Math.sin(a) * r * 0.62, r * 0.4]);
            }
        }
        g.strokeStyle = ink;
        g.lineWidth = L * 2;
        for (const [x, y, r] of parts) {
            g.beginPath();
            g.arc(x, y, r, 0, TAU);
            g.stroke();
        }
        g.fillStyle = fill;
        for (const [x, y, r] of parts) {
            g.beginPath();
            g.arc(x, y, r, 0, TAU);
            g.fill();
        }
    }
    // A static piece painted once per output scale and pasted (Motion.sprite). The scale is
    // rounded up to a step, so a camera that zooms makes a handful of sprites, not one a frame.
    function cached(g, key, box, draw) {
        const m = g.getTransform();
        if (Math.abs(m.b) > 1e-6 || Math.abs(m.c) > 1e-6 || m.a <= 0) return draw(g);
        const step = Math.pow(2, Math.ceil(Math.log2(m.a) * 4 - 1e-6) / 4);
        if (box.w * step * box.h * step > 3.6e7) return draw(g);
        Motion.sprite('skyward:' + key, box, step, draw).draw(g);
    }

    // =========================================================================================
    // The moon
    // =========================================================================================
    const MOON = { cream: '#fffbe8', shade: '#efe3bd', bright: '#fffffa', floor: '#dcd6f7', deep: '#b6aaee', lit: '#f0ecfd', rille: '#a497e6', dark: '#5f50bd', dust: '#f6f0d8', rock: '#f4edd3', rockTop: '#fffffa', rockSide: '#cbc2ee' };
    const MOON_TILT = -0.3; // the craters' ovals lean like the film's
    // Craters in the moon's own frame (unit disc, before the tilt): [x, y, r, role]. Two big
    // ones, a small one under them and an arc of little ones: they happen to make a face.
    const M_EYE_L = [-0.35, -0.3, 0.215], M_EYE_R = [0.37, -0.27, 0.165];
    const M_CRATERS = [M_EYE_L, M_EYE_R, [0.03, 0.06, 0.085], [0.7, 0.3, 0.14], [-0.72, 0.16, 0.1], [0.02, -0.74, 0.105], [-0.2, 0.83, 0.085]];
    const M_MOUTH = [[-0.36, 0.33], [-0.2, 0.46], [0.02, 0.51], [0.24, 0.45], [0.4, 0.3]];
    const M_LITTLE = [[-0.36, 0.33, 0.045], [-0.19, 0.465, 0.06], [0.03, 0.51, 0.05], [0.25, 0.44, 0.065], [0.4, 0.3, 0.042],
        [0.62, -0.5, 0.05], [-0.68, -0.42, 0.045], [-0.5, 0.62, 0.05], [0.42, 0.74, 0.055], [0.86, -0.02, 0.04], [-0.9, -0.1, 0.035], [0.3, -0.78, 0.04], [-0.3, -0.72, 0.035], [0.66, 0.62, 0.035]];
    const M_ROCKS = [[0.0, -0.42, 0.085], [-0.67, -0.12, 0.06], [0.8, -0.25, 0.07], [-0.15, 0.25, 0.05], [0.52, 0.58, 0.08], [-0.58, 0.44, 0.065], [0.24, -0.57, 0.045], [-0.44, -0.63, 0.055], [0.2, 0.78, 0.05], [-0.06, -0.93, 0.07], [0.33, -0.9, 0.045], [-0.38, -0.88, 0.05]];

    function moonCrater(g, cx, cy, cr, f, L) {
        const ell = (k, dx = 0, dy = 0) => {
            g.beginPath();
            g.ellipse(cx + dx, cy + dy, cr * k, cr * k * 0.84, 0, 0, TAU);
        };
        if (f <= 0.02) {
            ell(1);
            g.fillStyle = MOON.floor;
            g.fill();
            return;
        }
        // the rim's far slope in shade, the rim, the bowl with its shadow and its lit wall
        ell(1 + 0.17 * f, cr * 0.06 * f, cr * 0.08 * f);
        g.fillStyle = MOON.shade;
        g.fill();
        ell(1 + 0.1 * f);
        g.fillStyle = MOON.bright;
        g.fill();
        if (L * f > 0.5) {
            g.strokeStyle = K.ink;
            g.lineWidth = L * 0.8 * f;
            g.stroke();
        }
        const kb = 1 - 0.1 * f;
        g.save();
        ell(kb);
        g.clip();
        g.fillStyle = MOON.deep;
        g.fillRect(cx - cr * 1.2, cy - cr * 1.2, cr * 2.4, cr * 2.4);
        ell(kb, cr * 0.2 * f, cr * 0.17 * f);
        g.fillStyle = MOON.floor;
        g.fill();
        g.beginPath();
        g.ellipse(cx, cy, cr * kb * 1.2, cr * kb * 1.2, 0, 0, TAU);
        g.ellipse(cx - cr * 0.085 * f, cy - cr * 0.075 * f, cr * kb, cr * kb * 0.84, 0, 0, TAU);
        g.fillStyle = MOON.lit;
        g.fill('evenodd');
        g.restore();
        if (L * f > 0.5) {
            ell(kb);
            g.strokeStyle = K.ink;
            g.lineWidth = L * 0.7 * f;
            g.stroke();
        }
    }

    /**
     * The film's moon (a cream disc, lilac craters, an ink outline), drawn to be seen at any
     * size: small it is the flat moon of world.js; from r ≈ 90 its craters gain a rim, a
     * shadow and a lit wall, the disc a shaded limb, then little craters, boulders and pebbles
     * (everything grows in, nothing pops, so it can be scaled continuously up to r = 900).
     *   x, y   its centre;  r  its radius in logical units
     *   o: { face   0..1  the craters happen to make a face: at 1 it is asleep and content
     *                     (lids drawn across the two big craters, a rille through the arc of
     *                     little ones);
     *        wink   0..1  its left eye (screen left, the big crater) opens;  look [-1..1, -1..1]
     *        smile  0..1  the rille opens into a grin
     *        glow   0..1  a hard-edged halo: two flat rings round the disc
     *        phase  0..1  1 = full (default); less puts the left of the disc in flat shadow
     *        flag   false | true | { a (where on the limb, radians clockwise from the top,
     *               default 0.32), s (figure scale, default r / 5.2), k (0..1 pop), t }
     *               a planted whip with the band car's teal pennant, standing out of the limb
     *        rot    turns the whole moon (radians), t (seconds, for the pennant) }
     */
    function moon(g, x, y, r, o = {}) {
        const f1 = smooth((r - 80) / 110), f2 = smooth((r - 150) / 130), f3 = smooth((r - 230) / 170);
        const lw = Math.min(7, Math.max(4, r * 0.03)), L = 3.2;
        const face = clamp(o.face ?? 0), wink = clamp(o.wink ?? 0), grin = clamp(o.smile ?? 0), glow = clamp(o.glow ?? 0);
        g.save();
        g.translate(x, y);
        g.rotate(o.rot ?? 0);
        g.lineJoin = 'round';
        g.lineCap = 'round';
        if (glow > 0) {
            circ(g, 0, 0, r * (1 + 0.26 * glow), 'rgba(255,251,232,0.13)');
            circ(g, 0, 0, r * (1 + 0.13 * glow), 'rgba(255,251,232,0.2)');
        }
        if (o.flag) flagOnMoon(g, r, o.flag === true ? {} : o.flag, o.t ?? 0);
        circ(g, 0, 0, r, MOON.cream);
        g.save();
        g.beginPath();
        g.arc(0, 0, r, 0, TAU);
        g.clip();
        if (f1 > 0) {
            // the limb away from the light: a crescent of shade
            g.fillStyle = MOON.shade;
            g.fillRect(-r, -r, 2 * r, 2 * r);
            circ(g, -r * 0.075 * f1, -r * 0.065 * f1, r, MOON.cream);
        }
        g.save();
        g.rotate(MOON_TILT);
        // pebbles: specks of lilac in loose groups
        if (f3 > 0) {
            const rr = Motion.rng('skyward-moon-pebbles');
            g.fillStyle = MOON.floor;
            for (let i = 0; i < 46; i++) {
                const a = rr() * TAU, d = Math.sqrt(rr()) * 0.93, s = (0.006 + rr() * 0.009) * r * f3;
                g.beginPath();
                g.ellipse(Math.cos(a) * d * r, Math.sin(a) * d * r, s * 1.3, s, 0, 0, TAU);
                g.fill();
            }
        }
        const LF = L * (0.7 + 0.5 * smooth((r - 120) / 300));
        if (face > 0) moonMouth(g, r, face, grin, LF);
        if (f2 > 0) M_LITTLE.forEach(([cx, cy, cr], i) => {
            const shut = i >= 1 && i <= 3 ? 1 - smooth(face) * smooth(grin * 2.5) : 1; // the grin swallows the arc's middle
            if (shut > 0.05) moonCrater(g, cx * r, cy * r, cr * r * (0.25 + 0.75 * f2) * shut, f1 * f2, L);
        });
        for (const [cx, cy, cr] of M_CRATERS) moonCrater(g, cx * r, cy * r, cr * r, f1, L);
        if (face > 0) moonLids(g, r, face, wink, o.look ?? [0.3, 0.3], LF);
        g.restore();
        // boulders stand upright whatever the tilt
        if (f3 > 0) {
            for (const [bx, by, bs] of M_ROCKS) {
                const [px, py] = rot([bx * r, by * r], MOON_TILT), s = bs * r * (0.3 + 0.7 * f3);
                oval(g, px + s * 0.5, py + s * 0.06, s * 0.95, s * 0.26, MOON.floor);
                const pts = [[-0.5, 0], [-0.42, -0.34], [-0.12, -0.56], [0.26, -0.48], [0.5, -0.2], [0.52, 0]].map(([qx, qy]) => [px + qx * s, py + qy * s]);
                C.prism(g, pts, [s * 0.16, -s * 0.1], { front: MOON.rock, top: MOON.rockTop, side: MOON.rockSide }, { lw: Math.min(L * 0.8, s * 0.09) });
                line(g, [[px - 0.2 * s, py - 0.36 * s], [px + 0.06 * s, py - 0.2 * s], [px + 0.02 * s, py - 0.02 * s]], Math.min(L * 0.7, s * 0.07), MOON.rockSide);
            }
        }
        const ph = o.phase ?? 1;
        if (ph < 0.995) {
            g.beginPath();
            g.arc(0, 0, r * 1.01, -Math.PI / 2, Math.PI / 2, true);
            const rx = Math.max(0.001, r * Math.abs(2 * ph - 1));
            if (ph > 0.5) g.ellipse(0, 0, rx, r * 1.01, 0, Math.PI / 2, Math.PI * 1.5, false);
            else g.ellipse(0, 0, rx, r * 1.01, 0, Math.PI / 2, -Math.PI / 2, true);
            g.closePath();
            g.fillStyle = 'rgba(43,33,112,0.66)';
            g.fill();
        }
        g.restore();
        circ(g, 0, 0, r, null, lw);
        if (glow > 0) {
            g.beginPath();
            g.arc(0, 0, r * (1 + 0.26 * glow), 0, TAU);
            g.strokeStyle = 'rgba(255,251,232,0.55)';
            g.lineWidth = Math.max(2, r * 0.012);
            g.stroke();
        }
        g.restore();
    }

    // The face, in the craters' own frame. Lids across the two big craters, a rille through
    // the arc of little ones (drawn under them: they are its dimples); then one eye opens
    // and the rille becomes a grin.
    function moonLids(g, r, face, wink, look, L) {
        const k = smooth(face);
        const lid = (c, open) => {
            const cx = c[0] * r, cy = c[1] * r, cr = c[2] * r * 0.9, w = cr * 0.8 * k;
            if (open > 0.02) {
                // an eye in the bowl: the white, a big pupil that looks, the upper lid
                const h = cr * 0.7 * open, hw = cr * 0.84;
                const top = C.curve([[cx - hw, cy + cr * 0.08], [cx - hw * 0.5, cy - h * 0.82], [cx, cy - h], [cx + hw * 0.5, cy - h * 0.82], [cx + hw, cy + cr * 0.08]], false, 6);
                const bot = C.curve([[cx + hw, cy + cr * 0.08], [cx + hw * 0.46, cy + h * 0.66], [cx, cy + h * 0.78], [cx - hw * 0.46, cy + h * 0.66], [cx - hw, cy + cr * 0.08]], false, 6);
                const eye = [...top, ...bot.slice(1, -1)];
                C.poly(g, eye, { fill: '#fffffa', lw: 0 });
                g.save();
                C.trace(g, eye);
                g.clip();
                const px = cx + look[0] * cr * 0.28, py = cy + cr * 0.06 + look[1] * h * 0.3;
                circ(g, px, py, cr * 0.4, '#1d1626');
                circ(g, px - cr * 0.13, py - cr * 0.14, cr * 0.11, '#ffffff');
                g.restore();
                C.poly(g, bot, { ink: K.ink, lw: L * 0.8, close: false });
                C.poly(g, top, { ink: K.ink, lw: L * 1.6, close: false });
                return;
            }
            // asleep: a lid curved downwards and two lashes at its outer end
            const s = c[0] < 0 ? -1 : 1;
            C.poly(g, C.curve([[cx - w, cy - cr * 0.04], [cx - w * 0.5, cy + cr * 0.2], [cx, cy + cr * 0.27], [cx + w * 0.5, cy + cr * 0.2], [cx + w, cy - cr * 0.04]], false, 6), { ink: K.ink, lw: L * 1.6, close: false });
            if (k > 0.6) {
                const q = (k - 0.6) / 0.4;
                line(g, [[cx + s * w * 0.74, cy + cr * 0.12], [cx + s * (w * 0.74 + cr * 0.17 * q), cy + cr * (0.12 + 0.13 * q)]], L * 1.1);
                line(g, [[cx + s * w * 0.4, cy + cr * 0.22], [cx + s * (w * 0.4 + cr * 0.09 * q), cy + cr * (0.22 + 0.17 * q)]], L * 1.1);
            }
        };
        lid(M_EYE_L, wink * k);
        lid(M_EYE_R, 0);
    }
    function moonMouth(g, r, face, grin, L) {
        const k = smooth(face), up = 0.05 * grin;
        // drawn out from its middle; with `smile` its ends lift and it opens downwards
        const mid = M_MOUTH.map(([mx, my], i) => [mx * r, (my - up * Math.abs(i - 2) * 0.6 + up * 0.5) * r]);
        const full = C.curve(mid, false, 10), n = full.length, c = Math.round((n - 1) / 2), half = Math.max(1, Math.round(((n - 1) / 2) * k));
        const part = full.slice(c - half, c + half + 1);
        if (part.length < 2) return;
        if (grin > 0.03 && k > 0.9) {
            const drop = 0.14 * r * grin;
            const low = part.map(([px, py], i) => [px, py + drop * Math.pow(Math.sin((i / (part.length - 1)) * Math.PI), 0.8)]).reverse();
            const shape = [...part, ...low.slice(1, -1)];
            C.poly(g, shape, { fill: MOON.dark, lw: 0 });
            g.save();
            C.trace(g, shape);
            g.clip();
            oval(g, 0.04 * r, mid[2][1] + drop * 1.1, 0.14 * r, drop * 0.52, '#ff8fa3');
            g.restore();
            C.poly(g, shape, { ink: K.ink, lw: L * 1.4 });
        } else {
            C.poly(g, part.map(([px, py]) => [px + L * 0.5, py + L * 1.1]), { ink: MOON.rille, lw: L * 2.4, close: false });
            C.poly(g, part, { ink: K.ink, lw: L * 1.4, close: false });
        }
    }

    // The pennant: the band car's whip and teal pennant, planted in the limb.
    function flagOnMoon(g, r, f, t) {
        const a = f.a ?? 0.32, s = f.s ?? r / 5.2, k = f.k == null ? 1 : back(f.k);
        if (k <= 0) return;
        const L = 3.2 / s, d = C.drawing(t), sw = [0, 0.05, -0.03][((d % 3) + 3) % 3];
        g.save();
        g.translate(Math.sin(a) * r * 0.985, -Math.cos(a) * r * 0.985);
        g.rotate(a * 0.55);
        g.scale(s * k, s * k);
        const whip = C.curve([[0, 0.1], [0.03, -0.85], [0.2 + sw * 0.4, -1.7], [0.5 + sw, -2.4]], false, 8);
        line(g, whip, L * 1.15);
        const n = whip.length, pa = whip[n - 2], pb = whip[n - 7];
        C.poly(g, [pa, [pa[0] + 0.52, lerp(pa[1], pb[1], 0.6) + sw * 1.4], pb], { fill: '#17b8a6', ink: K.ink, lw: L * 0.8 });
        circ(g, whip[n - 1][0], whip[n - 1][1], 0.045, '#f4f6fc', L * 0.7);
        // the heap of dust it is planted in
        C.poly(g, C.curve([[-0.3, 0.12], [-0.16, -0.05], [0.02, -0.1], [0.2, -0.04], [0.32, 0.12]], false, 5), { fill: MOON.dust, ink: K.ink, lw: L * 0.9, close: false });
        g.restore();
    }

    /**
     * A car touching down on the moon: skid marks behind its wheels and moon dust that bursts
     * from under them and hangs (there is hardly any gravity), as k goes 0 → 1.
     *   x, y   the ground under the middle of the car where it comes to REST (it faces right
     *          and slides in from the left: draw the car at x + Skyward.landingSlide(k) * s)
     *   s      the car's scale (figure units; Rig.CAR on the road);  k  0..1
     *   o: { r (the moon's radius in logical units when the ground is its limb: the marks
     *        follow the curve; default flat), t (seconds: the dust boils on twos),
     *        part ('back' the marks and the far dust, 'front' the near dust; default both) }
     * Draw part 'back', then the car, then part 'front'.
     */
    const SLIDE = 2.6; // how far the car slides, in figure units
    const landingSlide = (k) => -SLIDE * Math.pow(1 - clamp(k / 0.55), 2.2);
    function landing(g, x, y, s, k, o = {}) {
        k = clamp(k);
        if (k <= 0) return;
        const L = 3.2 / s, R = o.r ? o.r / s : Infinity, d = C.drawing(o.t ?? 0), part = o.part ?? 'both';
        const gy = (px) => (R === Infinity ? 0 : R - Math.sqrt(Math.max(0, R * R - px * px))); // the limb's drop at px
        const slide = landingSlide(k);
        g.save();
        g.translate(x, y);
        g.scale(s, s);
        g.lineJoin = 'round';
        g.lineCap = 'round';
        if (part !== 'front') {
            // skid marks: two lines of tread per side (far side first), from where the wheels
            // touched to where they are now
            for (const [z, col, w] of [[1.5, MOON.floor, 0.3], [-0.28, MOON.deep, 0.34]]) {
                const off = Dd(z);
                for (const wx of [-3.55, 3.55]) {
                    const x0 = wx - SLIDE, x1 = wx + slide, n = Math.max(2, Math.ceil((x1 - x0) / 0.2));
                    if (x1 - x0 < 0.05) continue;
                    const top = [], bot = [];
                    for (let i = 0; i <= n; i++) {
                        const px = lerp(x0, x1, i / n);
                        top.push([px + off[0], gy(px) + off[1] - w * 0.2]);
                        bot.push([px + off[0], gy(px) + off[1] + w * 0.2]);
                    }
                    C.poly(g, [...top, ...bot.reverse()], { fill: col, ink: K.ink, lw: L * 0.7 });
                    // the tread: chevrons pressed into the dust
                    for (let cx = x0 + 0.16; cx < x1 - 0.1; cx += 0.26) {
                        const cy = gy(cx) + off[1];
                        line(g, [[cx + off[0] - 0.05, cy - w * 0.13], [cx + off[0] + 0.04, cy], [cx + off[0] - 0.05, cy + w * 0.13]], L * 0.6, z > 0 ? MOON.deep : MOON.rille);
                    }
                }
            }
        }
        // dust: puffs that leave each wheel, grow and thin out slowly; pebbles that float up
        const r = Motion.rng('skyward-landing'), far = [], near = [], stones = [];
        for (const wx of [-3.55, 3.55]) {
            for (let i = 0; i < 6; i++) {
                const dir = r() < 0.72 ? -1 : 1, reach = 0.5 + 1.5 * r(), rise = 0.25 + 0.95 * r(), size = 0.3 + 0.28 * r(), born = r() * 0.3, end = 0.72 + 0.28 * r(), nb = 5 + Math.floor(r() * 3), a0 = r() * TAU;
                const u = seg(k, born, end);
                if (u <= 0 || u >= 1) continue;
                const e = 1 - Math.pow(1 - u, 2.4), rad = size * Math.min(1, 0.4 + u * 2.6) * Math.pow(1 - u, 0.5) * (1 + 0.05 * (((d + i) % 2) * 2 - 1));
                const px = wx + slide * (1 - e) * 0.6 + dir * reach * e, py = gy(px) - rise * e - rad * 0.55;
                (i < 3 ? far : near).push([px + (i < 3 ? 0.3 : -0.1), py - (i < 3 ? 0.2 : 0), rad * (i < 3 ? 1.1 : 0.85), nb, a0 + 0.4 * (((d + i * 2) % 3) - 1)]);
            }
            for (let i = 0; i < 3; i++) {
                const vx = (r() - 0.6) * 2.4, vy = 0.8 + 1.5 * r(), sz = 0.03 + 0.03 * r(), u = seg(k, 0.02, 0.95);
                if (u > 0 && u < 1) stones.push([wx + slide * 0.3 + vx * u, gy(wx) - vy * (1 - Math.pow(1 - u, 1.6)) - 0.05, sz * Math.min(1, (1 - u) * 5)]);
            }
        }
        if (part !== 'front') {
            for (const [px, py, sz] of stones.filter((_, i) => i % 2 === 0)) circ(g, px + 0.3, py - 0.2, sz, MOON.rockSide, L * 0.7);
            puffs(g, far, MOON.floor, L);
        }
        if (part !== 'back') {
            puffs(g, near, MOON.bright, L);
            for (const [px, py, sz] of stones.filter((_, i) => i % 2 === 1)) circ(g, px, py, sz, MOON.rock, L * 0.7);
        }
        g.restore();
    }

    // =========================================================================================
    // The ascent
    // =========================================================================================
    // Y is the height climbed, in logical units. What is level with the camera sits on the
    // eye line (y = EYE); the horizon is there too while there is one.
    const TOP = 12000, EYE = 560;
    const ZONES = { ground: [0, 400], desert: [400, 1800], lowCloud: [1800, 3300], cloudTops: [3300, 6200], high: [6200, 8800], space: [8800, TOP] };
    // cloudBase: the big cloud's underside reaches the top of the frame; inCloud: nothing but cloud;
    // deck: the camera is level with the cloud tops (they are at y = EYE; below this the tops are
    // still coming down the frame, above it the floor of cumulus spreads out and sinks);
    // limbGone: the planet has left the bottom of the frame; moonGrows: the moon comes closer.
    const HEIGHTS = { crater: 0, cloudBase: 1780, inCloud: [3110, 3260], deck: 4000, limbGone: 9800, moonGrows: [8600, TOP], top: TOP };
    const DECK = HEIGHTS.deck, MASS = 1600; // the big cloud's thickness on screen
    // Screen y of something at height h on a layer that takes the share f of the camera's
    // climb (1 = it is at the car's distance): it crosses the eye line when Y = h.
    const at = (h, Y, f = 1) => EYE + (Y - h) * f;
    const horizon = (Y) => 690 - 130 * smooth(Y / 1600) + 560 * smooth((Y - 6500) / 3300);

    const SKY = {
        night: {
            skyA: '#1b1750', skyB: '#231e62', spaceA: '#0e0b2c', spaceB: '#130f3a', star: '#fffbe8', star2: '#ffe62e',
            sand: '#4a3fc0', sandD: '#3b2fa0', dune: '#3f34ad', road: '#15123a', roadLine: '#ffe62e', roadEdge: '#a888f5',
            mesa: '#5a2fb5', mesaTop: '#7d47e1', mesaSide: '#3b1f85', cactus: '#0e8f86', cactusTop: '#17b8a6', cactusSide: '#0a6a64',
            rock: '#7d47e1', rockTop: '#a888f5', rockSide: '#5a2fb5', bush: '#0e8f86', bushD: '#0a6a64',
            cloud: '#3b2fa0', cloudUnder: '#2c2380', cloudLit: '#6a5fd6',
            deck: '#fffbe8', deckShade: '#dcd6f7', deckFar: '#8f84d8', mass: '#3b2fa0', massD: '#2c2380', massL: '#b6aaee',
            cirrus: '#6f64cc', cirrusL: '#a99de6', air: '#4a44e6', streak: '#fffbe8',
        },
        dawn: {
            skyA: '#ee4b93', skyB: '#f0609a', spaceA: '#ee4b93', spaceB: '#f0609a', star: '#fffdf4', star2: '#fff1c4',
            sand: '#e0702e', sandD: '#c4551f', dune: '#cf5f2a', road: '#4a2147', roadLine: '#ffe62e', roadEdge: '#ffd9a0',
            mesa: '#b5306f', mesaTop: '#e0559a', mesaSide: '#8a1f55', cactus: '#17b8a6', cactusTop: '#8cefe6', cactusSide: '#0e8f86',
            rock: '#c9508f', rockTop: '#f08abb', rockSide: '#a03372', bush: '#35c46a', bushD: '#1f9a50',
            cloud: '#ff9ccf', cloudUnder: '#e56aa8', cloudLit: '#ffd0e4',
            deck: '#fff6d8', deckShade: '#ffc9a0', deckFar: '#f58a4f', mass: '#f79ac0', massD: '#e56aa8', massL: '#ffd9b0',
            cirrus: '#ffb3c7', cirrusL: '#ffe6cc', air: '#f8c22c', streak: '#fffdf4',
        },
    };
    const LW = (sc, base = 3.2) => Math.max(1.1, base * Math.min(1, 0.25 + sc * 0.8)); // outlines thin out with distance

    // --- the land: one flat ground seen from higher and higher ---------------------------------
    // Ground coordinates: u across, v away from us, the crater's middle at the origin, in
    // logical units when Y = 0. The whole ground shrinks towards the crater as the camera climbs,
    // and squeezes up against the horizon far away.
    const Q0 = 0.6, TOWN_V = 122, TOWN_S = 40;
    function landCam(Y, ox = 0) {
        const m = 1 / (1 + Y / 900), yH = horizon(Y), ay = 890 - 60 * smooth(Y / 2400);
        return { m, yH, ax: 500 - ox * m, ay, span: ay - yH };
    }
    function onLand(cam, u, v) {
        const q = (v * cam.m) / cam.span;
        if (q <= Q0) return [cam.ax + u * cam.m, cam.ay - v * cam.m, cam.m];
        const e = Math.exp(-(q - Q0) / (1 - Q0));
        return [cam.ax + u * cam.m * e, cam.yH + cam.span * (1 - Q0) * e, cam.m * e];
    }
    /**
     * Where the launch site is on screen at height Y (o.x as in ascent): { crater: [x, y, scale]
     * (the crater's middle; scale 1 at Y = 0), town: [x, y, s] (the ground point and scale to
     * give Skyward.town), horizon (y), m }.
     */
    function site(Y, o = {}) {
        const cam = landCam(Y, o.x ?? 0), tw = onLand(cam, 0, TOWN_V);
        return { crater: [cam.ax, cam.ay, cam.m], town: [tw[0], tw[1], TOWN_S * tw[2]], horizon: cam.yH, m: cam.m };
    }
    // the highway: it runs through the crater, bends away to the right and towards us on the left
    const roadV = (u) => {
        const a = Math.abs(u), w = smooth((a - 560) / 900);
        return w * (170 * Math.sin(u / 520 + 0.6) + (u > 0 ? 0.2 : -0.11) * (a - 560));
    };

    // desert pieces, in logical units at scale 1, the foot at the origin
    function mesa(g, P, L, w, h, dep) {
        const pts = [[-w / 2, 4], [-w * 0.43, -h * 0.5], [-w * 0.35, -h * 0.55], [-w * 0.3, -h], [w * 0.3, -h], [w * 0.35, -h * 0.55], [w * 0.43, -h * 0.5], [w / 2, 4]];
        C.prism(g, pts, [dep, -dep * 0.66], { front: P.mesa, top: P.mesaTop, side: P.mesaSide }, { lw: L });
        if (L < 6) {
            g.save();
            C.trace(g, pts);
            g.clip();
            for (const k of [0.2, 0.36, 0.66, 0.84]) line(g, [[-w / 2, -h + h * k], [w / 2, -h + h * k]], L * 0.75, P.mesaSide);
            line(g, [[-w * 0.43, -h * 0.5], [w * 0.43, -h * 0.5]], L, P.mesaTop);
            g.restore();
            C.poly(g, pts, { ink: K.ink, lw: L });
        }
    }
    function saguaro(g, P, L, h, flip) {
        const w = h * 0.2, Dc = [h * 0.045, -h * 0.03];
        const part = (px, py, pw, ph) => {
            g.lineWidth = L;
            g.strokeStyle = K.ink;
            g.beginPath();
            g.roundRect(px + Dc[0], py + Dc[1], pw, ph, [pw / 2, pw / 2, 0, 0]);
            g.fillStyle = P.cactusSide;
            g.fill();
            g.stroke();
            g.beginPath();
            g.roundRect(px, py, pw, ph, [pw / 2, pw / 2, 0, 0]);
            g.fillStyle = P.cactus;
            g.fill();
            g.stroke();
            line(g, [[px + pw * 0.35, py + pw * 0.4], [px + pw * 0.35, py + ph - 3]], L * 0.7, P.cactusTop);
        };
        const a1 = -flip * w * 1.55, a2 = flip * w * 1.5;
        part(a1 - w * 0.36, -h * 0.72, w * 0.72, h * 0.3);
        C.poly(g, [[a1 - w * 0.36, -h * 0.44], [0, -h * 0.44], [0, -h * 0.3], [a1 + w * 0.1, -h * 0.3], [a1 - w * 0.36, -h * 0.36]], { fill: P.cactus, ink: K.ink, lw: L });
        part(a2 - w * 0.36, -h * 0.86, w * 0.72, h * 0.3);
        C.poly(g, [[a2 + w * 0.36, -h * 0.58], [0, -h * 0.58], [0, -h * 0.44], [a2 - w * 0.1, -h * 0.44], [a2 + w * 0.36, -h * 0.5]], { fill: P.cactus, ink: K.ink, lw: L });
        part(-w / 2, -h, w, h);
    }
    function boulder(g, cols, L, s) {
        const pts = [[-0.5, 0], [-0.42, -0.34], [-0.12, -0.56], [0.26, -0.48], [0.5, -0.2], [0.52, 0]].map(([px, py]) => [px * s, py * s]);
        C.prism(g, pts, [s * 0.14, -s * 0.09], cols, { lw: L });
        line(g, [[-0.2 * s, -0.36 * s], [0.06 * s, -0.2 * s], [0.02 * s, 0]], L * 0.75, cols.side);
    }
    function scrub(g, P, L, s) {
        const body = new Path2D();
        for (const [lx, ly, lr] of [[-0.42, -0.2, 0.3], [0, -0.38, 0.38], [0.42, -0.22, 0.3]]) body.arc(lx * s, ly * s, lr * s, 0, TAU);
        body.rect(-0.7 * s, -0.2 * s, 1.4 * s, 0.2 * s);
        g.save();
        g.strokeStyle = K.ink;
        g.lineWidth = L * 2;
        g.lineJoin = 'round';
        g.stroke(body);
        g.fillStyle = P.bush;
        g.fill(body);
        g.clip(body);
        g.fillStyle = P.bushD;
        g.fillRect(-s, -0.16 * s, 2 * s, 0.2 * s);
        g.restore();
    }

    // --- the crater: a ring of thrown-up ground round a mouth full of lava -----------------------
    let PIT_ = null;
    const pitRing = () => {
        if (PIT_) return PIT_;
        const r = Motion.rng('skyward-pit'), N = 44, B = [], Cr = [], M = [], Lv = [];
        for (let i = 0; i < N; i++) {
            const a = (i / N) * TAU, c = Math.cos(a), s = Math.sin(a), jb = 1 + (r() - 0.5) * 0.09, jc = 1 + (r() - 0.5) * 0.1, jh = 0.62 + r() * 0.76;
            B.push([c * 292 * jb, s * 74 * jb + 8]);
            Cr.push([c * 250 * jc, s * 60 * jc - 30 * jh]);
            M.push([c * 212, s * 49 - 24 * jh]);
            Lv.push([c * 196, s * 43 + 22]);
        }
        return (PIT_ = { N, B, Cr, M, Lv });
    };
    const LAVA = { hot: '#ffe62e', warm: '#ff8a2b', red: '#f0352f', deep: '#a31a26', dark: '#5e0f1f' };
    // part: 'back' everything a thing coming out of the mouth passes in front of, 'front' the
    // near rim, which it passes behind. Local units: logical at Y = 0, the mouth's middle at 0, 0.
    function pit(g, P, L, t, part, sc) {
        const { N, B, Cr, M, Lv } = pitRing(), d = C.drawing(t), far = [], near = [];
        // the near side runs a little past the two ends, so the ring's flanks are covered
        for (let i = 0; i <= N / 2 + 4; i++) near.push((i - 2 + N) % N);
        for (let i = N / 2 - 1; i <= N + 1; i++) far.push(i % N);
        const arc = (ring, idx) => idx.map((i) => ring[i]);
        const rim = mix(P.rock, LAVA.warm, 0.42), rimHot = mix(P.rockTop, LAVA.hot, 0.5);
        if (part !== 'front') {
            // the light on the ground: two flat pools
            oval(g, 0, 10, 440, 118, mix(P.sand, '#e0258b', 0.4));
            oval(g, 0, 10, 366, 96, mix(P.sand, LAVA.warm, 0.62));
            // cracks that run out from the ring, glowing
            if (sc > 0.3) {
                const r = Motion.rng('skyward-pit-cracks');
                for (let i = 0; i < 9; i++) {
                    const a = (i / 9) * TAU + r() * 0.4, c = Math.cos(a), s = Math.sin(a), len = 70 + r() * 90, pts = [];
                    for (let k = 0; k < 4; k++) {
                        const q = 1 + (k / 3) * (len / 292), j = k === 0 ? 0 : (r() - 0.5) * 24;
                        pts.push([c * 292 * q - s * j, s * 74 * q + 8 + c * j * 0.3]);
                    }
                    line(g, pts, L * 2.6);
                    line(g, pts.slice(0, 3), L * 1.1, (d + i) % 4 < 2 ? LAVA.warm : LAVA.hot);
                }
            }
            // the far wall, lit from below, and the far rim's top
            C.poly(g, [...arc(M, far), ...arc(Lv, far).reverse()], { fill: LAVA.red, ink: K.ink, lw: L });
            g.save();
            C.trace(g, [...arc(M, far), ...arc(Lv, far).reverse()]);
            g.clip();
            C.poly(g, arc(Lv, far).map(([x, y]) => [x * 1.02, y - 26]), { ink: LAVA.warm, lw: 26, close: false });
            C.poly(g, arc(M, far).map(([x, y]) => [x, y + 12]), { ink: LAVA.deep, lw: 12, close: false });
            g.restore();
            C.poly(g, [...arc(M, far), ...arc(Lv, far).reverse()], { ink: K.ink, lw: L });
            C.poly(g, [...arc(Cr, far), ...arc(M, far).reverse()], { fill: rimHot, ink: K.ink, lw: L });
            // the lava: a bright pool, darker skin drifting on it, bubbles
            g.save();
            g.beginPath();
            g.ellipse(0, 22, 196, 43, 0, 0, TAU);
            g.fillStyle = LAVA.hot;
            g.fill();
            g.clip();
            const rl = Motion.rng('skyward-lava');
            for (let i = 0; i < 6; i++) {
                const bx = (rl() - 0.5) * 330 + ((d + i * 3) % 6 < 3 ? 8 : -8), by = 22 + (rl() - 0.5) * 60, bw = 34 + rl() * 50;
                oval(g, bx, by, bw, bw * 0.2, LAVA.warm);
            }
            for (let i = 0; i < 4; i++) {
                const bx = (rl() - 0.5) * 300, by = 26 + (rl() - 0.5) * 50, f = (d + i * 2) % 7;
                if (f < 4) oval(g, bx, by, 7 + f * 3.5, (7 + f * 3.5) * 0.5, f < 3 ? '#fffbe8' : LAVA.warm, f < 3 ? L * 0.7 : 0, LAVA.red);
            }
            g.restore();
            g.beginPath();
            g.ellipse(0, 22, 196, 43, 0, 0, TAU);
            g.strokeStyle = K.ink;
            g.lineWidth = L;
            g.stroke();
            // the light it throws up: a flat shaft that flickers on twos
            for (const [x0, x1, tx, th, col] of [[-186, -92, -236, 330, 0], [-104, -6, -96, 470, 1], [-30, 76, 34, 390, 0], [58, 150, 150, 500, 1], [112, 188, 262, 300, 0]]) {
                const fl = [0, 26, -16][(((d + (col ? 1 : 0)) % 3) + 3) % 3];
                C.poly(g, [[x0, 16], [x1, 16], [tx, -th - fl]], { fill: col ? 'rgba(255,230,46,0.24)' : 'rgba(255,138,43,0.26)', lw: 0 });
            }
            // embers
            if (sc > 0.3) {
                const re = Motion.rng('skyward-embers');
                for (let i = 0; i < 12; i++) {
                    const x0 = (re() - 0.5) * 320, sp = 0.5 + re() * 0.7, ph = re(), sw = (re() - 0.5) * 90, u = (((d / 12) * sp + ph) % 1 + 1) % 1;
                    C.sparkle(g, x0 + sw * u, 10 - u * 350, (5 + 6 * re()) * (1 - u * 0.7), { color: i % 3 ? LAVA.hot : '#fffbe8', pinch: 0.34 });
                }
            }
        }
        // the near rim: its top, then the slope that faces us, in facets
        C.poly(g, [...arc(Cr, near), ...arc(M, near).reverse()], { fill: rimHot, ink: K.ink, lw: L });
        const slope = [...arc(B, near), ...arc(Cr, near).reverse()];
        C.poly(g, slope, { fill: P.rock, ink: K.ink, lw: L });
        g.save();
        C.trace(g, slope);
        g.clip();
        // the foot of the slope is darker; every other facet catches the lava's light
        C.poly(g, arc(B, near).map(([x, y]) => [x, y - 4]), { ink: P.rockSide, lw: 34, close: false });
        for (let k = 1; k < near.length - 1; k += 2) {
            const i = near[k], j = near[k + 1];
            if (k % 4 === 1) C.poly(g, [Cr[i], Cr[j], [lerp(Cr[j][0], B[j][0], 0.45), lerp(Cr[j][1], B[j][1], 0.45)], [lerp(Cr[i][0], B[i][0], 0.6), lerp(Cr[i][1], B[i][1], 0.6)]], { fill: rim, lw: 0 });
            if (sc > 0.3) line(g, [Cr[i], [lerp(Cr[i][0], B[i][0], 0.7), lerp(Cr[i][1], B[i][1], 0.7)]], L * 0.75, P.rockSide);
        }
        g.restore();
        C.poly(g, slope, { ink: K.ink, lw: L });
        if (sc > 0.3) {
            // slabs of the road, tipped up where it broke, and thrown rocks
            for (const sx of [-1, 1]) {
                const slab = (x, y, w, h, a) => {
                    const at = (p) => {
                        const q = rot(p, a * sx);
                        return [x * sx + q[0] * sx, y + q[1]];
                    };
                    const dd = [34, -23], A = at([-w / 2, -h]), B2 = at([w / 2, -h]), lo = A[0] < B2[0] ? [A, B2] : [B2, A];
                    C.prism(g, cw([at([-w / 2, 0]), A, B2, at([w / 2, 0])]), dd, { front: mix(P.road, '#000000', 0.25), top: mix(P.road, '#ffffff', 0.2), side: mix(P.road, '#000000', 0.25) }, { lw: L });
                    // the road's line on its top face
                    const m0 = lerp(lo[0][0], lo[1][0], 0.2), m1 = lerp(lo[0][0], lo[1][0], 0.8), yAt = (px) => lerp(lo[0][1], lo[1][1], (px - lo[0][0]) / (lo[1][0] - lo[0][0]));
                    line(g, [[m0 + dd[0] / 2, yAt(m0) + dd[1] / 2], [m1 + dd[0] / 2, yAt(m1) + dd[1] / 2]], L * 1.5, P.roadLine);
                };
                slab(318, 26, 86, 16, -0.5);
                slab(392, 46, 64, 14, 0.16);
            }
            const rr = Motion.rng('skyward-pit-rocks');
            for (let i = 0; i < 7; i++) {
                const a = 0.25 + rr() * (Math.PI - 0.5), q = 1.12 + rr() * 0.32, s = 22 + rr() * 26;
                g.save();
                g.translate(Math.cos(a) * 292 * q, Math.sin(a) * 74 * q + 18);
                boulder(g, { front: P.rock, top: P.rockTop, side: P.rockSide }, L, s);
                g.restore();
            }
        }
    }

    function land(g, t, Y, P, o) {
        const cam = landCam(Y, o.x ?? 0), { m, yH } = cam, d = C.drawing(t);
        // the horizon: a line of dunes, the ground under it
        const dune = [[-20, 1040]];
        for (let x = -20; x <= 1020; x += 20) {
            const wx = x + (o.x ?? 0) * 0.12;
            dune.push([x, yH - 7 - 6 * Math.sin(wx / 130) - 4 * Math.sin(wx / 47 + 1)]);
        }
        dune.push([1020, 1040]);
        // a far range on the horizon: the road's mesas, smaller the higher we are
        const sh = lerp(1, 0.3, smooth(Y / 1500)), SPM = 430 * sh + 90, xm = (o.x ?? 0) * 0.14 * sh;
        for (let i = Math.floor((xm - 300) / SPM); i <= Math.ceil((xm + 1300) / SPM); i++) {
            const r = Motion.rng('skyward-range:' + i), x = i * SPM + r() * SPM * 0.5 - xm, tall = r() < 0.34;
            const w = tall ? 110 + r() * 50 : 210 + r() * 160, h = tall ? 190 + r() * 70 : 90 + r() * 90, dep = 30 + r() * 20;
            if (r() < 0.2) continue;
            g.save();
            g.translate(x, yH + 2);
            g.scale(sh, sh);
            mesa(g, P, LW(sh, 4) / sh, w, h, dep);
            g.restore();
        }
        C.poly(g, dune, { fill: P.sand, lw: 0 });
        // far away the ground is a shade darker, up to the squeeze
        const band = dune.slice(1, -1), lowY = yH + cam.span * (1 - Q0) * 0.55;
        C.poly(g, [...band, ...band.map(([x]) => [x, lowY + 5 * Math.sin(x / 83 + 2)]).reverse()], { fill: P.dune, lw: 0 });
        C.poly(g, band, { ink: K.ink, lw: 4, close: false });
        // --- the highway
        const du = Math.max(34, 30 / m), cross = [];
        for (let u = -(cam.ax + 140) / m - du; cross.length < 420; u += du) {
            const v = roadV(u), c = onLand(cam, u, v), a = onLand(cam, u, v + 46), b = onLand(cam, u, v - 46);
            cross.push([a, b, c, u]);
            if (c[0] > 1140 && u > 0) break;
            if (c[2] < m * 0.1) break;
        }
        for (let i = 0; i + 1 < cross.length; i++) {
            const [a0, b0, c0] = cross[i], [a1, b1] = cross[i + 1], lw = LW(c0[2], 4);
            C.poly(g, [a0, a1, b1, b0], { fill: P.road, ink: P.road, lw: 0.8 });
            line(g, [a0, a1], lw);
            line(g, [b0, b1], lw);
            if (c0[2] > 0.3) {
                const k = 0.26;
                line(g, [[lerp(a0[0], b0[0], k / 2), lerp(a0[1], b0[1], k / 2)], [lerp(a1[0], b1[0], k / 2), lerp(a1[1], b1[1], k / 2)]], lw * 0.8, P.roadEdge);
                line(g, [[lerp(b0[0], a0[0], k / 2), lerp(b0[1], a0[1], k / 2)], [lerp(b1[0], a1[0], k / 2), lerp(b1[1], a1[1], k / 2)]], lw * 0.8, P.roadEdge);
            }
        }
        if (cross.length > 1) {
            const u0 = cross[0][3], u1 = cross[cross.length - 1][3];
            for (let i = Math.floor(u0 / 170); i * 170 < u1; i++) {
                const ua = i * 170, ub = ua + 86, p = onLand(cam, ua, roadV(ua)), q = onLand(cam, ub, roadV(ub));
                if (p[2] > 0.09) line(g, [p, q], Math.max(1, 8 * p[2]), P.roadLine);
            }
        }
        // --- things on the ground, by cells, far rows first; the town and the crater in their turn
        const CU = 440, CV = 250, vMax = ((Q0 + (1 - Q0) * 2.2) * cam.span) / m, vMin = -(1120 - cam.ay) / m;
        const rows = [];
        for (let j = Math.ceil(vMax / CV); j >= Math.floor(vMin / CV) - 1; j--) {
            const e = onLand(cam, 0, (j + 0.5) * CV)[2] / m, half = (700 + 260 * m) / (m * e);
            const uc = (500 - cam.ax) / (m * e);
            for (let i = Math.floor((uc - half) / CU); i <= Math.ceil((uc + half) / CU); i++) {
                const r = Motion.rng('skyward-land:' + i + ':' + j);
                const u = (i + 0.15 + 0.7 * r()) * CU, v = (j + 0.15 + 0.7 * r()) * CV, kind = r(), a = r(), b = r(), c = r();
                if (Math.abs(v - roadV(u)) < 96) continue;
                if (Math.abs(u) < 600 && Math.abs(v) < 190) continue; // the crater's own ground
                if (Math.abs(u) < 620 && v > 0 && v < 330) continue; // the town, and clear sky behind it
                const [sx, sy, sc] = onLand(cam, u, v);
                if (sc < 0.1 || sy > 1150 || sx < -260 * sc - 40 || sx > 1040 + 260 * sc) continue;
                rows.push([v, sx, sy, sc, kind, a, b, c]);
            }
        }
        const piece = ([, sx, sy, sc, kind, a, b, c]) => {
            const L = LW(sc) / sc;
            g.save();
            g.translate(sx, sy);
            g.scale(sc, sc);
            if (kind < 0.2) {
                const tall = a < 0.35;
                mesa(g, P, L, tall ? 120 + b * 50 : 220 + b * 150, tall ? 190 + c * 70 : 100 + c * 90, 30 + c * 18);
            } else if (kind < 0.52) saguaro(g, P, L, 92 + a * 62, b < 0.5 ? 1 : -1);
            else if (kind < 0.66) boulder(g, { front: P.rock, top: P.rock, side: P.rockSide }, L, 46 + a * 40);
            else if (kind < 0.8) scrub(g, P, L, 34 + a * 22);
            if (sc > 0.28) {
                // ripples in the sand next to it
                line(g, [[70 + b * 60, 22 + a * 30], [110 + b * 60 + c * 40, 22 + a * 30]], L * 0.9, P.sandD);
                line(g, [[-150 - c * 60, 40 - a * 50], [-110 - c * 60 + b * 30, 40 - a * 50]], L * 0.9, P.sandD);
            }
            g.restore();
        };
        rows.sort((p, q) => q[0] - p[0]);
        let k = 0;
        for (; k < rows.length && rows[k][0] > TOWN_V; k++) piece(rows[k]);
        if (o.town !== false) {
            const tw = onLand(cam, 0, TOWN_V);
            town(g, tw[0], tw[1], TOWN_S * tw[2], { lights: 1, wake: 0, t, ...(o.town ?? {}) });
        }
        for (; k < rows.length && rows[k][0] > 0; k++) piece(rows[k]);
        g.save();
        g.translate(cam.ax, cam.ay);
        g.scale(m, m);
        pit(g, P, LW(m) / m, t, 'both', m);
        g.restore();
        // the smoke it leaves: a column that grows as we climb (drawn at the screen's scale)
        const pk = smooth((Y - 200) / 600);
        if (pk > 0) {
            const list = [], n = 11, top = Math.max(yH - 90, cam.ay - 420) + 60 * (1 - pk), ph = (((d % 4) + 4) % 4) / 4;
            for (let i = 0; i < n; i++) {
                const u = (i + ph) / n, y = lerp(cam.ay - 20 * m, top, u), x = cam.ax + (34 * Math.sin(u * 4.6 + 0.4 + (d % 4 < 2 ? 0 : 0.3)) * (0.3 + u) + u * u * 120) * pk;
                const fade = u > 0.8 ? (1 - u) / 0.2 * 0.7 + 0.3 : 1;
                list.push([x, y, (11 + 30 * Math.sqrt(u)) * (0.45 + 0.55 * pk) * fade * (0.6 + 0.4 * m), 6, i * 1.3 + (d % 4 < 2 ? 0 : 0.5)]);
            }
            puffs(g, list, mix(P.sand, '#fffbe8', 0.45), 1.6);
        }
        for (; k < rows.length; k++) piece(rows[k]);
    }

    // --- clouds -----------------------------------------------------------------------------------
    // A cloud from the side, as in world.js. cols: { body, under }
    function puffCloud(g, x, y, s, cols, lw) {
        const body = new Path2D();
        for (const [lx, ly, lr] of [[-0.9, 0.05, 0.42], [-0.42, -0.2, 0.52], [0.12, -0.34, 0.6], [0.66, -0.12, 0.46], [1.02, 0.1, 0.34]]) {
            body.moveTo(x + (lx + lr) * s, y + ly * s);
            body.arc(x + lx * s, y + ly * s, lr * s, 0, TAU);
        }
        body.rect(x - 1.1 * s, y, 2.3 * s, 0.32 * s);
        g.save();
        if (lw > 0) {
            g.strokeStyle = K.ink;
            g.lineWidth = lw * 2;
            g.lineJoin = 'round';
            g.stroke(body);
        }
        g.fillStyle = cols.body;
        g.fill(body);
        if (cols.under !== cols.body) {
            g.clip(body);
            g.fillStyle = cols.under;
            g.fillRect(x - 1.4 * s, y + 0.1 * s, 2.8 * s, 0.4 * s);
        }
        g.restore();
    }
    // A row of cumulus across the frame: bumps whose tops are about at y, the body under them
    // `depth` deep. up = -1 hangs the bumps downwards instead (a cloud's underside, its bottoms at y).
    function cloudRow(g, y, R, seed, xoff, cols, lw, o = {}) {
        const { depth = 1400, up = 1, bend = null, ink = K.ink, hang = 0, topOnly = false } = o;
        const sp = R * 1.3, body = new Path2D(), shade = new Path2D(), y0 = y + up * R * 1.3;
        const add = (path, cx, cy, rr) => {
            path.moveTo(cx + rr, cy);
            path.arc(cx, cy, rr, 0, TAU);
        };
        for (let i = Math.floor((xoff - 120 - R * 1.3) / sp); i <= Math.ceil((xoff + 1120 + R * 1.3) / sp); i++) {
            const r = Motion.rng(seed + ':' + i), cx = i * sp - xoff + (r() - 0.5) * sp * 0.5, rr = R * (0.58 + 0.66 * r());
            const bd = bend ? bend(cx) : 0, cy = y + up * (rr * 0.92 + R * 0.1 * r()) + bd;
            add(body, cx, cy, rr);
            // a plug between this bump and the next, lower down, so no valley has a flat floor
            add(body, (i + 0.5) * sp - xoff, y + up * R + bd, R * 0.78);
            if (cols.shade) {
                add(shade, cx + R * 0.14, cy + up * R * 0.56, rr * 0.94);
                add(shade, (i + 0.5) * sp - xoff + R * 0.14, y + up * R * 1.56 + bd, R * 0.74);
            }
            if (hang) add(body, cx + sp * (0.3 + 0.4 * r()), y0 + depth - hang * 0.2, hang * (0.62 + 0.5 * r()));
        }
        body.rect(-60, up > 0 ? y0 : y0 - depth, 1120, depth);
        g.save();
        if (lw > 0) {
            g.save();
            if (topOnly) {
                // only the bumps are outlined: the body's lower edge melts into what is under it
                g.beginPath();
                g.rect(-80, y - 3000, 1160, 3000 + R * 1.3 + (bend ? 300 : 0));
                g.clip();
            }
            g.strokeStyle = ink;
            g.lineWidth = lw * 2;
            g.lineJoin = 'round';
            g.stroke(body);
            g.restore();
        }
        g.fillStyle = cols.body;
        g.fill(body);
        if (cols.shade) {
            g.clip(body);
            shade.rect(-60, up > 0 ? y0 + R * 0.56 : y0 - depth, 1120, depth + hang * 2);
            g.fillStyle = cols.shade;
            g.fill(shade);
        }
        g.restore();
    }
    // A wisp of high cloud: long, thin, pointed at both ends.
    function wisp(g, x, y, w, h, P, lw) {
        const pts = C.curve([[x - w / 2, y], [x - w * 0.22, y - h * 0.5], [x + w * 0.12, y - h * 0.36], [x + w / 2, y - h * 0.08], [x + w * 0.2, y + h * 0.3], [x - w * 0.16, y + h * 0.5]], true, 6);
        C.poly(g, pts, { fill: P.cirrus, ink: K.ink, lw });
        line(g, C.curve([[x - w * 0.3, y - h * 0.12], [x - w * 0.06, y - h * 0.24], [x + w * 0.24, y - h * 0.14]], false, 5), Math.max(1.6, h * 0.14), P.cirrusL);
    }

    // The big cloud the car goes through and the floor of cumulus its top becomes. front: only
    // what passes in front of the car.
    function deck(g, t, Y, P, o, front) {
        const ox = o.x ?? 0, dlt = Y - DECK, hor = horizon(Y), drift = t * 7;
        const y0 = dlt < 0 ? EYE + dlt : hor + dlt; // the nearest row of tops
        const yU = EYE + (Y - DECK) + MASS; // the underside, while it is in the frame
        const cur = 0.52 * smooth((Y - 5600) / 3400), bend = (x) => (cur * (x - 500) * (x - 500)) / 1000;
        if (front) {
            // a bank of the cloud's top, nearer than the car: it crosses the frame as the car bursts out
            const yn = (dlt < 0 ? EYE : hor) + dlt * 1.4 + 330;
            if (yn > -380 && yn < 1100) cloudRow(g, yn, 84, 'skyward-near', ox * 1.4 + drift * 1.4, { body: P.deck, shade: P.deckShade }, 4, { depth: 30, hang: 62 });
            return;
        }
        if (yU < -200 || Y > HEIGHTS.limbGone + 300) return;
        if (dlt > 0) {
            // the far floor: a flat sea of cloud up to the horizon (the planet's limb, later), then
            // rows of tops, the far ones first
            const sea = [];
            for (let x = -20; x <= 1020; x += 40) sea.push([x, hor + bend(x)]);
            const seaCol = mix(P.deckFar, P.air, 0.5 * smooth((Y - 6800) / 2400));
            if (cur > 0.01) C.poly(g, sea.map(([x, y]) => [x, y - 4 - 16 * cur]), { ink: P.air, lw: 6 + 34 * cur, close: false }); // the air: a thin bright band
            C.poly(g, [...sea, [1020, 1100], [-20, 1100]], { fill: seaCol, lw: 0 });
            // long flat streaks on the sea
            const rs = Motion.rng('skyward-sea');
            for (let i = 0; i < 9; i++) {
                const sx = ((rs() * 1400 - ox * 0.04 + drift * 0.2) % 1400 + 1400) % 1400 - 200, f = 0.1 + rs() * 0.9, sy = hor + bend(sx) + 10 + f * f * Math.max(40, 1000 - hor) * 0.8, w = 80 + rs() * 200;
                oval(g, sx, sy, w * (0.4 + f * 0.6), 3 + f * 9, mix(seaCol, P.deck, 0.34));
            }
            C.poly(g, sea, { ink: K.ink, lw: 3.2, close: false });
            for (let j = 8; j >= 1; j--) {
                const dist = 1 + 0.7 * j + 0.06 * j * j, y = hor + dlt / dist + 30 * j * (1 - smooth(dlt / 420)), R = 175 / Math.pow(dist, 0.85);
                if (y > 1060) continue;
                const k = 0.1 + 0.9 * smooth((dist - 1) / 9), body = mix(P.deck, P.deckFar, (j % 2 ? k : k * 0.8) * 0.92), near = dist < 4;
                cloudRow(g, y, R, 'skyward-deck' + j, ox / dist + drift / dist + j * 137, { body, shade: near ? mix(P.deckShade, P.deckFar, k) : null }, near ? Math.max(1.5, 4 / Math.pow(dist, 0.8)) : 0, { bend: (x) => bend(x) * Math.min(1, 2.4 / dist + 0.3) });
            }
        }
        if (y0 > 1100) return;
        if (dlt < 520) {
            // the body of the cloud, from its lit top down to its dark underside
            if (yU > 1320) {
                // its underside is out of the frame: the body is a plain field
                g.fillStyle = P.mass;
                g.fillRect(-60, y0 + 240, 1120, 1100 - (y0 + 240));
            } else {
                cloudRow(g, yU, 120, 'skyward-under', ox + 77, { body: P.massD }, 4, { up: -1, depth: MASS - 400 });
                cloudRow(g, yU - 96, 105, 'skyward-under2', ox + 400, { body: P.mass }, 0, { up: -1, depth: MASS - 500 });
            }
            // lumps inside, so the passage is never a flat field
            const rm = Motion.rng('skyward-mass');
            for (let i = 0; i < 12; i++) {
                const lx = ((rm() * 1300 - ox) % 1300 + 1300) % 1300 - 150, ly = y0 + 640 + (i / 12) * (MASS - 1000) + rm() * 60, ls = 70 + rm() * 80;
                if (ly < -200 || ly > 1200) continue;
                puffCloud(g, lx, ly, ls, { body: i % 3 ? P.massD : P.cloudLit, under: i % 3 ? P.massD : P.mass }, 0);
            }
            // towards its top the cloud takes the moon's light, in two steps
            cloudRow(g, y0 + 540, 120, 'skyward-in2', ox + 210, { body: P.massL }, 0, { up: -1, depth: 130 });
            cloudRow(g, y0 + 390, 110, 'skyward-in1', ox + 31, { body: P.deckShade }, 0, { up: -1, depth: 20 });
        }
        if (dlt < 520) cloudRow(g, y0, 150, 'skyward-deck0', ox + drift, { body: P.deck }, 4, { depth: 60, hang: 84, topOnly: true, bend: dlt > 0 ? bend : null });
        else cloudRow(g, y0, 150, 'skyward-deck0', ox + drift, { body: P.deck, shade: P.deckShade }, 4, { bend });
    }

    // --- the sky ------------------------------------------------------------------------------------
    /** Where the ascent draws the moon at height Y: { x, y, r }. o.moon and o.moonTo as in ascent. */
    function moonAt(Y, o = {}) {
        const a = { x: 770, y: 190, r: 62, ...(o.moon || {}) }, b = { x: 500, y: 385, r: 325, ...(o.moonTo || {}) };
        const k = smooth(seg(Y, HEIGHTS.moonGrows[0], HEIGHTS.moonGrows[1])), r = a.r * Math.pow(b.r / a.r, k), e = b.r === a.r ? k : (r - a.r) / (b.r - a.r);
        return { x: lerp(a.x, b.x, e), y: lerp(a.y, b.y, e), r };
    }
    // Speed lines: long tapered streaks rushing down, most of them towards the frame's sides.
    function streaks(g, t, k, seed, n, col) {
        if (k <= 0) return;
        const r = Motion.rng(seed);
        g.save();
        g.fillStyle = col;
        for (let i = 0; i < n; i++) {
            const side = r() < 0.78, u = r(), x = side ? (r() < 0.5 ? 16 + u * u * 280 : 984 - u * u * 280) : 300 + u * 400;
            const len = (460 + r() * 640) * (0.5 + 0.5 * k), sp = 2800 + r() * 2400, y0 = r() * 2200, w = (i % 3 ? 5 : 11) + r() * 9, show = r();
            if (show > k) continue;
            const y = ((y0 + t * sp) % 2200) - 900;
            g.beginPath();
            g.moveTo(x - w / 2, y + len);
            g.lineTo(x + w / 2, y + len);
            g.lineTo(x, y);
            g.closePath();
            g.fill();
        }
        g.restore();
    }

    /**
     * The backdrop of the climb: a camera that rises with the car, looking level. Y is the
     * height climbed in logical units, 0 … Skyward.ZONES.space[1] (12000); the zones blend:
     *   ground     the desert floor at night; the highway, the crater that has just opened in it
     *              (lava, a shaft of light, embers), the town behind it;
     *   desert     the same ground from higher and higher: it shrinks towards the crater, more of
     *              it shows up to the horizon (mesas, saguaros, the highway as a ribbon, the
     *              town's lights, a column of smoke);
     *   lowCloud   clouds drift down past the car, then one big cloud comes down over the frame
     *              and the car is inside it (HEIGHTS.inCloud);
     *   cloudTops  its moonlit top comes down the frame, reaches the eye line at HEIGHTS.deck and
     *              spreads into a floor of cumulus that sinks away (angels go here);
     *   high       the floor is the planet's curved limb; wisps of high cloud, shooting stars;
     *   space      stars, and the moon growing from o.moon to o.moonTo.
     *   o: { theme     'night' (default) | 'dawn': the sky warms to the cover's pink-to-yellow field
     *                  and everything takes its light;  dawn 0..1 does the same by degrees
     *        speedLines 0..1  vertical streaks rushing down
     *        moon      { x, y, r } where the moon hangs until HEIGHTS.moonGrows[0] (default
     *                  { x: 770, y: 190, r: 62 }), or false to draw none
     *        moonTo    { x, y, r } where it ends up at the top (default { x: 500, y: 385, r: 325 },
     *                  a third of the frame); Skyward.moonAt(Y, o) says where it is
     *        moonLook  options for Skyward.moon (face, wink, smile, glow, phase, flag…)
     *        town      { lights, wake } options for Skyward.town, which the ground draws on its
     *                  street behind the crater; false to draw it yourself at Skyward.site(Y).town
     *        x         the camera's sideways drift, in logical units at the car's distance }
     * Draw the car after it, then Skyward.ascentFront with the same arguments.
     */
    function ascent(g, t, Y, o = {}) {
        const dawn = clamp(o.dawn ?? (o.theme === 'dawn' ? 1 : 0)), P = mixAll(SKY.night, SKY.dawn, dawn), d = C.drawing(t);
        const ox = o.x ?? 0, hor = horizon(Y), sp = smooth(seg(Y, 5000, 9500));
        const mk = smooth(seg(Y, HEIGHTS.moonGrows[0], TOP)), mn = moonAt(Y, o);
        g.save();
        g.lineJoin = 'round';
        g.lineCap = 'round';
        // the sky: the film's slow sunburst, darker with height; in space it turns round the moon
        C.sunburst(g, lerp(500 - ox * 0.02, mn.x, mk), lerp(Math.min(hor + 40, 1200), mn.y, mk), { n: 12, rot: t * 0.06, a: mix(P.skyA, P.spaceA, sp), b: mix(P.skyB, P.spaceB, sp) });
        if (dawn > 0) {
            const gr = g.createLinearGradient(0, 0, 0, Math.min(1000, Math.max(560, hor)));
            gr.addColorStop(0, '#ee4b93');
            gr.addColorStop(0.5, '#f58a4f');
            gr.addColorStop(1, '#f8c22c');
            g.globalAlpha = dawn;
            g.fillStyle = gr;
            g.fillRect(0, 0, 1000, 1000);
            // the burst stays, as lighter rays
            g.globalAlpha = dawn * 0.13;
            g.fillStyle = '#fffdf4';
            const bx = lerp(500 - ox * 0.02, mn.x, mk), by = lerp(Math.min(hor + 40, 1200), mn.y, mk);
            g.beginPath();
            for (let i = 0; i < 12; i++) {
                const a0 = t * 0.06 + (i / 12) * TAU, a1 = a0 + TAU / 24;
                g.moveTo(bx, by);
                g.lineTo(bx + Math.cos(a0) * 1700, by + Math.sin(a0) * 1700);
                g.lineTo(bx + Math.cos(a1) * 1700, by + Math.sin(a1) * 1700);
                g.closePath();
            }
            g.fill();
            g.globalAlpha = 1;
        }
        // stars: more of them, and nearer ones, the higher we are; they twinkle on twos
        const rs = Motion.rng('skyward-stars'), nStar = Math.round(lerp(46, 120, smooth(seg(Y, 3600, 9000)))), dim = 1 - 0.6 * dawn;
        for (let i = 0; i < 120; i++) {
            const x0 = rs() * 1000, y0 = rs() * 1000, s = 5 + rs() * 9, ph = Math.floor(rs() * 12), f = 0.004 + 0.012 * rs(), big = i >= 46 && i % 7 === 0;
            if (i >= nStar) continue;
            const y = ((y0 + Y * (big ? f * 4 : f)) % 1000 + 1000) % 1000, x = ((x0 - ox * f) % 1000 + 1000) % 1000;
            const tw = (d + ph) % 12 < 2 ? 1.5 : 1;
            C.sparkle(g, x, y, s * tw * dim * (big ? 1.7 : 1), { color: i % 5 ? P.star : P.star2 });
        }
        // shooting stars, each on its own clock
        const shoot = smooth(seg(Y, 5600, 6400)) * (1 - smooth(seg(Y, 11000, 11800)));
        if (shoot > 0) {
            for (let n = Math.floor(t / 0.75) - 1; n <= Math.floor(t / 0.75); n++) {
                const r = Motion.rng('skyward-shoot:' + n), at0 = n * 0.75 + Math.round(r() * 6) / 12, u = (Math.floor((t - at0) * 12 + 1e-6) / 12) / 0.42;
                const x0 = 80 + r() * 840, y0 = 40 + r() * 330, dir = r() < 0.5 ? -1 : 1, len = 250 + r() * 200;
                if (r() > shoot * 0.8 || u < 0 || u >= 1) continue;
                const hx = x0 + dir * len * u, hy = y0 + len * 0.62 * u, tl = Math.min(u, 0.36) * len * (1 - u * 0.4);
                C.poly(g, [[hx, hy - 3.2], [hx, hy + 3.2], [hx - dir * tl, hy - tl * 0.62]], { fill: P.star, lw: 0 });
                C.sparkle(g, hx, hy, 15 * (1 - u * 0.5), { color: P.star });
            }
        }
        if (o.moon !== false) moon(g, mn.x, mn.y, mn.r, { t, ...(o.moonLook ?? {}) });
        // wisps of high cloud, in three depths
        if (Y > 4700 && Y < 10200) {
            for (let i = 0; i < 22; i++) {
                const r = Motion.rng('skyward-wisp:' + i), f = [0.3, 0.55, 0.9][i % 3], h = 6100 + r() * 2700, y = at(h, Y, f) - 200;
                const x = ((r() * 1500 - ox * f + t * 9 * f) % 1500 + 1500) % 1500 - 250, w = (240 + r() * 300) * (0.5 + f * 0.6);
                if (y < -60 || y > 1060) continue;
                wisp(g, x, y, w, w * (0.07 + 0.04 * r()), P, LW(f, 3.2));
            }
        }
        // (the big cloud hides the ground from HEIGHTS.inCloud on)
        const hidTop = EYE + (Y - DECK) + 250, hidBot = EYE + (Y - DECK) + MASS - 250; // what the big cloud's body covers
        if (Y < HEIGHTS.inCloud[0]) land(g, t, Y, P, o);
        // low cloud: loose clouds that come down past the car, thicker towards the big one
        if (Y > 700 && Y < 3900) {
            for (let i = 0; i < 16; i++) {
                const r = Motion.rng('skyward-low:' + i), f = [0.45, 0.7, 1][i % 3], yc = 1500 + Math.pow(i / 15, 0.75) * 1700 + r() * 120, y = 440 + (Y - yc) * f;
                const x = ((r() * 1500 - ox * f + t * 12 * f) % 1500 + 1500) % 1500 - 250, s = (58 + r() * 40) * (0.6 + f * 0.75);
                if (y < -140 || y > 1140 || (Y > 1900 && y - s > hidTop && y + s * 0.4 < hidBot)) continue;
                puffCloud(g, x, y, s, { body: P.cloud, under: P.cloudUnder }, LW(f, 4));
            }
        }
        if (Y > 1900) deck(g, t, Y, P, o, false);
        streaks(g, t, o.speedLines ?? 0, 'skyward-streaks', 26, P.streak);
        g.restore();
    }
    /**
     * What passes in front of the car, with the same arguments as ascent: the crater's near
     * rim (the car comes out from behind it), a near cloud or two on the way up, the bank of
     * cloud the car bursts out of at the cloud tops, and a few of the speed lines.
     */
    function ascentFront(g, t, Y, o = {}) {
        const dawn = clamp(o.dawn ?? (o.theme === 'dawn' ? 1 : 0)), P = mixAll(SKY.night, SKY.dawn, dawn), ox = o.x ?? 0;
        g.save();
        g.lineJoin = 'round';
        g.lineCap = 'round';
        if (Y < 1500) {
            const cam = landCam(Y, ox);
            g.save();
            g.translate(cam.ax, cam.ay);
            g.scale(cam.m, cam.m);
            pit(g, P, LW(cam.m) / cam.m, t, 'front', cam.m);
            g.restore();
        }
        if (Y > 1200 && Y < 3900) {
            for (let i = 0; i < 4; i++) {
                const r = Motion.rng('skyward-lowfront:' + i), yc = 2000 + i * 420 + r() * 150, y = 500 + (Y - yc) * 1.7;
                const x = i % 2 ? 760 + r() * 260 - ox * 1.7 : -20 + r() * 260 - ox * 1.7;
                if (y < -260 || y > 1260) continue;
                puffCloud(g, x, y, 150 + r() * 50, { body: P.cloudLit, under: P.cloud }, 4);
            }
        }
        if (Y > 2400) deck(g, t, Y, P, o, true);
        streaks(g, t, (o.speedLines ?? 0) * 0.6, 'skyward-streaks-front', 9, P.streak);
        g.restore();
    }

    // =========================================================================================
    // The town
    // =========================================================================================
    // Night colours: the buildings keep their paint, a step darker; what is lit pops.
    const TOWN = {
        kerb: '#6f64d6', kerbTop: '#9388e6', kerbSide: '#4a3fc0',
        wood: '#6b3a20', woodSide: '#472513', wire: '#0d0b26', insul: '#8cefe6',
        glassOff: '#261e6e', glassGlint: '#5a4fd0', glassOn: '#ffe62e', glassWarm: '#ffb22c', curtain: '#ff8a2b',
        chrome: '#c9cfe2', chromeTop: '#f4f6fc', chromeSide: '#7f879f',
        diner: '#17a3a0', dinerTop: '#58d6c8', dinerSide: '#0e7078', roof: '#d8342c', roofTop: '#ff6f59', roofSide: '#971f22',
        awnA: '#ff4fa5', awnB: '#fffdf4', door: '#e0258b', doorDark: '#3a0f38', step: '#8f84d8',
        board: '#201c57', boardTop: '#3b2fa0', boardSide: '#15123a', neonOff: '#6c66a0', neonPink: '#ff4fa5', neonAqua: '#8cefe6', neonYellow: '#ffe62e', neonCore: '#fffdf4',
        gas: '#d9d4f2', gasTop: '#fffdf4', gasSide: '#9a92d0', gasRed: '#e8392f', gasRedSide: '#a8231f', pump: '#e8392f', pumpTop: '#ff6f59', pumpSide: '#a8231f', hose: '#2a2438', sign: '#ff8a2b', signSide: '#c2560f',
        tank: '#b9b4dc', tankTop: '#e4e0f6', tankSide: '#8580b6', tankBand: '#ff4fa5', leg: '#4a4470', legTop: '#625c8c', legSide: '#353055', lamp: '#f0352f', lampOff: '#7a1f2e',
        motel: '#e070ac', motelTop: '#ff9ccf', motelSide: '#a63d7c', motelRoof: '#3d3470', motelRoofTop: '#565082', motelRoofSide: '#2a2438', motelDoor: '#17b8a6',
        arrow: '#ffc21f', arrowTop: '#ffe62e', arrowSide: '#c98a0e', arrowIn: '#e8392f', bulbOn: '#fffdf4', bulbOff: '#9a7a2e',
        carA: '#4a7fe0', carATop: '#7fa6f0', carASide: '#345fb6', carB: '#ff8a2b', carBTop: '#ffb22c', carBSide: '#c2560f', tyre: '#2a2438', tyreSide: '#1f1a2b', hub: '#c9cfe2',
        dog: '#d9a45e', dogTop: '#f0c486', dogSide: '#a8773a', dogEar: '#7b4526',
    };
    // The townsfolk: [name, door x, mark x, delay, the way the hat flies, palette]
    const FOLK = [
        ['waitress', -6.15, -5.6, 0.0, -1, { skin: '#f7c9a3', hair: '#e8552f', top: '#ff9ccf', leg: '#ff9ccf', shoe: '#fffdf4', hat: 'cap' }],
        ['cook', -6.15, -7.0, 0.1, -1, { skin: '#c98d5e', hair: '#2a2438', top: '#fffdf4', leg: '#565082', shoe: '#2a2438', hat: 'toque' }],
        ['trucker', 1.9, 2.75, 0.05, -1, { skin: '#f2b58c', hair: '#7b4526', top: '#35c46a', leg: '#4a7fe0', shoe: '#55301b', hat: 'bill' }],
        ['attendant', 1.9, 5.3, 0.16, -1, { skin: '#e0a17b', hair: '#f6d34f', top: '#4a7fe0', leg: '#4a7fe0', shoe: '#2a2438', hat: 'bill' }],
        ['cowboy', 8.25, 7.85, 0.08, 1, { skin: '#f7c9a3', hair: '#55301b', top: '#f0352f', leg: '#345fb6', shoe: '#7b4526', hat: 'cowboy' }],
        ['lady', 10.25, 9.7, 0.2, 1, { skin: '#fcdfc6', hair: '#d9d4e6', top: '#a888f5', leg: '#a888f5', shoe: '#ff4fa5', hat: 'curlers' }],
    ];
    const shade3 = (c) => ({ front: c, top: mix(c, '#ffffff', 0.3), side: mix(c, '#241531', 0.34) });

    // A tiny box person (0.8 of a figure): pose { up 0..1 (looks up), arm 0..1 (a mitt goes up to
    // the brow), hop, hat 0..1 (it flies off), dir (which way), mouth open with up }.
    function folk(g, x, y, L0, F, pose, d) {
        const K8 = 0.8, L = L0 / K8, up = pose.up ?? 0, hat = pose.hat ?? 0, dir = pose.dir ?? 1;
        const c = { shirt: shade3(F.top), hair: shade3(F.hair) };
        const P = { ink: K.ink, shoe: F.shoe, shoeTop: mix(F.shoe, '#ffffff', 0.25), shoeSide: mix(F.shoe, '#241531', 0.3), sole: '#fffdf4', jeans: F.leg, jeansSide: mix(F.leg, '#241531', 0.3),
            jacket: F.top, jacketTop: c.shirt.top, jacketSide: c.shirt.side, skin: F.skin, skinTop: mix(F.skin, '#ffffff', 0.35), skinSide: mix(F.skin, '#7a1f2e', 0.28) };
        g.save();
        g.translate(x, y - (pose.hop ?? 0));
        g.scale(K8, K8);
        Cast.legs(g, P, L);
        C.box(g, -0.34, -0.98, 0.68, 0.6, D, c.shirt, { lw: L, depth: 0.38 });
        if (F.hat === 'cap' || F.hat === 'toque') C.poly(g, [[-0.2, -0.78], [0.2, -0.78], [0.24, -0.38], [-0.24, -0.38]], { fill: '#fffdf4', ink: K.ink, lw: L * 0.8 }); // an apron
        else if (F.hat === 'cowboy') for (const sx of [-1, 1]) C.poly(g, [[sx * 0.34, -0.98], [sx * 0.1, -0.98], [sx * 0.16, -0.4], [sx * 0.34, -0.4]], { fill: '#7b4526', ink: K.ink, lw: L * 0.8 }); // a waistcoat
        else if (F.hat === 'curlers') line(g, [[-0.34, -0.62], [0.34, -0.62]], L * 1.6, '#ff4fa5'); // her dressing gown's cord
        else C.poly(g, [[-0.16, -0.98], [0.16, -0.98], [0.16, -0.66], [-0.16, -0.66]], { fill: mix(F.top, '#241531', 0.25), ink: K.ink, lw: L * 0.8 }); // a bib pocket
        // the head tips back to look up; the face slides up its front
        g.save();
        g.translate(0, -1.0);
        g.translate(0, 1.0 - 0.02 * up);
        const T = -1.8, fy = T + 0.2 - 0.09 * up;
        C.box(g, -0.4, T, 0.8, 0.78, D, c.hair, { lw: L, depth: 0.42 });
        C.poly(g, [[-0.29, fy], [0.29, fy], [0.29, fy + 0.5], [0.2, fy + 0.57], [-0.2, fy + 0.57], [-0.29, fy + 0.5]], { fill: F.skin, ink: K.ink, lw: L * 0.9 });
        for (const sx of [-1, 1]) {
            g.fillStyle = '#1d1626';
            g.fillRect(sx * 0.13 - 0.035, fy + 0.13 - 0.05 * up, 0.07, 0.15);
            g.fillStyle = '#ffffff';
            g.fillRect(sx * 0.13 - 0.025, fy + 0.14 - 0.05 * up, 0.026, 0.03);
        }
        line(g, [[0.012, fy + 0.2 - 0.04 * up], [0.012, fy + 0.31 - 0.04 * up], [0.05, fy + 0.31 - 0.04 * up]], L * 0.8);
        if (up > 0.5) oval(g, 0, fy + 0.43 - 0.03 * up, 0.065, 0.075, '#7a1f2e', L * 0.7);
        else line(g, [[-0.08, fy + 0.42], [0, fy + 0.45], [0.08, fy + 0.42]], L * 0.9);
        if (F.hat === 'curlers') for (const cx of [-0.26, 0, 0.26]) rrect(g, cx - 0.11, T - 0.09, 0.22, 0.15, 0.06, '#ff9ccf', L * 0.8);
        g.restore();
        // the hat: on the head, or off it and tumbling away
        if (F.hat !== 'curlers') {
            const fly = hat <= 0 ? 0 : hat, hx = dir * (0.5 * fly + 1.5 * fly * fly), hy = T - (2.9 * fly - 1.3 * fly * fly), hr = dir * (fly > 0 ? 0.25 + 0.75 * Math.sin(fly * 5) * (0.4 + 0.6 * fly) : 0);
            g.save();
            g.translate(hx, hy + (fly > 0 ? 0 : -0.02 * up));
            g.rotate(hr);
            if (F.hat === 'cowboy') {
                C.box(g, -0.62, -0.06, 1.24, 0.07, D, shade3('#b97a3f'), { lw: L, depth: 0.5 });
                const crown = [[-0.3, -0.06], [-0.26, -0.4], [-0.06, -0.33], [0.1, -0.42], [0.3, -0.36], [0.32, -0.06]].map(([px, py]) => [px + D[0] * 0.12, py + D[1] * 0.12]);
                C.prism(g, crown, Dd(0.26), shade3('#b97a3f'), { lw: L });
                line(g, [[-0.28 + D[0] * 0.12, -0.12 + D[1] * 0.12], [0.31 + D[0] * 0.12, -0.12 + D[1] * 0.12]], L * 1.4, '#55301b');
            } else if (F.hat === 'toque') {
                const pts = C.curve([[-0.3, 0], [-0.3, -0.28], [-0.44, -0.46], [-0.22, -0.66], [0.02, -0.6], [0.26, -0.68], [0.46, -0.46], [0.3, -0.28], [0.3, 0]], false, 5).map(([px, py]) => [px + D[0] * 0.1, py + D[1] * 0.1]);
                C.prism(g, cw(pts), Dd(0.2), { front: '#fffdf4', top: '#fffdf4', side: '#cfc8ee' }, { lw: L, sweepInk: null });
                C.prismOutline(g, cw(pts), Dd(0.2), { lw: L });
                line(g, [[-0.3 + D[0] * 0.1, -0.22 + D[1] * 0.1], [0.3 + D[0] * 0.1, -0.22 + D[1] * 0.1]], L * 0.8, '#cfc8ee');
            } else if (F.hat === 'bill') {
                const col = shade3(F.top === '#35c46a' ? '#f0352f' : '#ff8a2b');
                const dome = cw(C.curve([[-0.4, 0], [-0.36, -0.2], [0, -0.3], [0.36, -0.2], [0.4, 0]], false, 5).concat([[0.4, 0]]));
                C.prism(g, dome.map(([px, py]) => [px + D[0] * 0.04, py + D[1] * 0.04]), Dd(0.36), col, { lw: L, sweepInk: null });
                C.prismOutline(g, dome.map(([px, py]) => [px + D[0] * 0.04, py + D[1] * 0.04]), Dd(0.36), { lw: L });
                C.box(g, dir > 0 ? 0.1 : -0.64, -0.05, 0.54, 0.05, D, col, { lw: L, depth: 0.3 });
            } else {
                // the waitress's cap: a little crown of starched cloth
                C.prism(g, [[-0.26, 0], [-0.3, -0.2], [-0.1, -0.13], [0, -0.26], [0.1, -0.13], [0.3, -0.2], [0.26, 0]].map(([px, py]) => [px + D[0] * 0.1, py + D[1] * 0.1]), Dd(0.08), { front: '#fffdf4', top: '#fffdf4', side: '#ff9ccf' }, { lw: L });
            }
            g.restore();
        }
        // arms: one mitt goes up to shade the eyes
        const arm = pose.arm ?? 0, shL = [-0.31, -0.86], shR = [0.31, -0.86];
        const hands = dir > 0 ? [[-0.5, -0.5], [lerp(0.5, 0.36, arm), lerp(-0.5, -1.62, arm)]] : [[lerp(-0.5, -0.36, arm), lerp(-0.5, -1.62, arm)], [0.5, -0.5]];
        Cast.arm(g, P, L, shL, hands[0]);
        Cast.arm(g, P, L, shR, hands[1]);
        g.restore();
    }

    // A neon tube: an outline, the colour and, when it is lit, a bright core.
    const neon = (g, pts, col, L, on, close = false) => {
        C.poly(g, pts, { ink: K.ink, lw: L * 2.9, close });
        C.poly(g, pts, { ink: on ? col : TOWN.neonOff, lw: L * 1.5, close });
        if (on) C.poly(g, pts, { ink: TOWN.neonCore, lw: L * 0.45, close });
    };
    // A window: dark with a glint, or lit (warm at the foot). r: corner radius.
    const pane = (g, x, y, w, h, r, on, L, extra = null) => {
        rrect(g, x, y, w, h, r, on ? TOWN.glassOn : TOWN.glassOff);
        g.save();
        g.beginPath();
        g.roundRect(x, y, w, h, r);
        g.clip();
        if (on) {
            g.fillStyle = TOWN.glassWarm;
            g.fillRect(x, y + h * 0.62, w, h);
            if (extra) extra();
        } else line(g, [[x + w * 0.2, y + h * 0.7], [x + w * 0.55, y + h * 0.18]], L * 1.2, TOWN.glassGlint);
        g.restore();
        rrect(g, x, y, w, h, r, null, L * 0.9);
    };
    function boxCar(g, L, x, y, cols, pickup, flip, lit) {
        const T = TOWN, len = 2.3, r = 0.2, f = flip ? -1 : 1;
        g.save();
        g.translate(x, y);
        g.scale(f, 1);
        const Df = [D[0] * f, D[1]], Ddf = (z) => [Df[0] * z, Df[1] * z];
        for (const wx of [-0.72, 0.74]) C.drum(g, wx + Df[0] * 0.9, -r + Df[1] * 0.9, r, Ddf(0.14), { front: T.tyre, side: T.tyreSide }, { lw: L });
        C.box(g, -len / 2, -0.66, len, 0.44, Df, cols, { lw: L, depth: 1.0 });
        if (pickup) {
            C.box(g, 0.05, -1.08, 0.86, 0.44, Df, cols, { lw: L, depth: 1.0 });
            rrect(g, 0.16, -1.0, 0.62, 0.28, 0.04, T.glassOff, L * 0.8);
            line(g, [[0.26, -0.8], [0.44, -0.95]], L, T.glassGlint);
            line(g, [[-len / 2 + 0.06, -0.58], [-0.02, -0.58]], L * 0.8, cols.side);
        } else {
            C.prism(g, [[-0.62, -0.66], [-0.4, -1.06], [0.42, -1.06], [0.7, -0.66]], Ddf(1.0), cols, { lw: L });
            C.poly(g, [[-0.5, -0.7], [-0.34, -0.99], [0.0, -0.99], [0.0, -0.7]], { fill: T.glassOff, ink: K.ink, lw: L * 0.8 });
            C.poly(g, [[0.08, -0.7], [0.08, -0.99], [0.38, -0.99], [0.58, -0.7]], { fill: T.glassOff, ink: K.ink, lw: L * 0.8 });
            line(g, [[-0.4, -0.76], [-0.26, -0.94]], L, T.glassGlint);
        }
        line(g, [[-len / 2, -0.38], [len / 2, -0.38]], L * 0.8, cols.side);
        C.box(g, len / 2 - 0.02, -0.36, 0.07, 0.1, Df, { front: T.chrome, top: T.chromeTop, side: T.chromeSide }, { lw: L * 0.8, depth: 1.0 });
        C.box(g, -len / 2 - 0.05, -0.36, 0.07, 0.1, Df, { front: T.chrome, top: T.chromeTop, side: T.chromeSide }, { lw: L * 0.8, depth: 1.0 });
        circ(g, len / 2 - 0.1, -0.54, 0.06, lit ? T.glassOn : '#fffdf4', L * 0.7);
        rrect(g, -len / 2 + 0.04, -0.6, 0.08, 0.12, 0.02, '#f0352f', L * 0.7);
        for (const wx of [-0.72, 0.74]) {
            C.drum(g, wx - Df[0] * 0.08, -r - Df[1] * 0.08, r, Ddf(0.16), { front: T.tyre, side: T.tyreSide }, { lw: L });
            circ(g, wx - Df[0] * 0.08, -r - Df[1] * 0.08, r * 0.5, T.hub, L * 0.7);
        }
        g.restore();
    }

    /**
     * The town: a little desert main street seen from the side, for the fly-past. From left to
     * right: a parked car, a water tower, a diner with a neon cup on its roof, a dog, a gas
     * station (office, canopy, two pumps, a round sign on a pole), a parked pick-up, a motel
     * with an arrow sign edged with bulbs, telephone poles behind them. No lettering anywhere.
     *   x, y   the ground at the middle of the street's near kerb;  s  logical units per figure unit
     *          (it is 22.6 wide and 6.1 tall: s = 40 fits it in the frame; the ascent uses that)
     *   o: { lights  0..1  windows, lamps and signs come on one after another (the arrow's bulbs
     *                      last: from 0.8 they chase);  default 1
     *        wake    0..1  the townsfolk come out of their doors (0.05 … 0.5), look up, a mitt to
     *                      the brow (… 0.7), and their hats fly off (0.72 … 1); the dog howls
     *        t       seconds (neon steam, bulbs, the dog's tail tick on twos) }
     * Skyward.TOWN_AT has the places a staging may need (roofs, doors, where people stand).
     */
    const TOWN_AT = { width: 22.6, height: 6.1, tower: [-8.7, -5.9], dinerRoof: [-4.1, -2.35], cup: [-4.1, -3.9], canopy: [2.75, -2.75], gasSign: [1.62, -4.13], arrow: [7.5, -4.2], motelRoof: [9.3, -1.95], dog: [-0.75, -0.12], folk: FOLK.map((f) => [f[2], -0.12]) };
    function town(g, x, y, s, o = {}) {
        const T = TOWN, lights = clamp(o.lights ?? 1), wake = clamp(o.wake ?? 0), t = o.t ?? 0, d = C.drawing(t);
        const L = Math.max(1.1, 3.2 * Math.min(1, 0.3 + s / 40)) / s, det = s >= 20, mid = s >= 9;
        const on = (th) => lights > th;
        const B = -0.2, SH = Dd(0.4); // the buildings' foot: on the pavement, a step back
        const chromeC = { front: T.chrome, top: T.chromeTop, side: T.chromeSide };
        const out = FOLK.map((f) => seg(wake, 0.05 + f[3], 0.3 + f[3]));
        g.save();
        g.translate(x, y);
        g.scale(s, s);
        g.lineJoin = 'round';
        g.lineCap = 'round';
        // --- the pavement
        C.box(g, -11.3, -0.12, 22.6, 0.12, D, { front: T.kerb, top: T.kerbTop, side: T.kerbSide }, { lw: L, depth: 1.5 });
        if (det) for (let px = -10.4; px < 11.2; px += 1.3) line(g, [ob(px, -0.12, 0.05), ob(px, -0.12, 1.45)], L * 0.6, T.kerb);
        // --- telephone poles behind everything, and their wires
        const poles = [-10.55, -0.55, 5.95, 11.0], PH = 5.3, pz = Dd(1.3);
        if (mid) {
            for (let i = 0; i + 1 < poles.length; i++) {
                for (const dx of [-0.42, 0.42]) {
                    g.beginPath();
                    g.moveTo(poles[i] + pz[0] + dx, -PH + 0.2 + pz[1]);
                    g.quadraticCurveTo((poles[i] + poles[i + 1]) / 2 + pz[0] + dx, -PH + 0.95 + pz[1], poles[i + 1] + pz[0] + dx, -PH + 0.2 + pz[1]);
                    g.strokeStyle = T.wire;
                    g.lineWidth = L * 0.8;
                    g.stroke();
                }
            }
            for (const px of poles) {
                C.box(g, px - 0.07 + pz[0], -PH + pz[1], 0.14, PH - 0.1, D, { front: T.wood, top: T.wood, side: T.woodSide }, { lw: L, depth: 0.14 });
                C.box(g, px - 0.55 + pz[0], -PH + 0.28 + pz[1], 1.1, 0.12, D, { front: T.wood, top: T.wood, side: T.woodSide }, { lw: L, depth: 0.14 });
                for (const dx of [-0.42, 0.42]) C.box(g, px + dx - 0.06 + pz[0], -PH + 0.14 + pz[1], 0.12, 0.14, D, { front: T.insul, top: T.insul, side: '#17b8a6' }, { lw: L * 0.75, depth: 0.1 });
            }
        }
        // --- the water tower
        {
            const cx = -8.7, zb = Dd(1.2), legC = { front: T.leg, top: T.legTop, side: T.legSide }, yT = -3.55;
            for (const sx of [-1, 1]) C.box(g, cx + sx * 0.92 - 0.06 + zb[0], yT + zb[1], 0.12, -yT + B, D, legC, { lw: L, depth: 0.12 });
            if (mid) {
                // braces: two crosses and a girdle, the riser pipe
                for (const [y0, y1] of [[yT + 0.1, -1.9], [-1.9, B - 0.1]]) {
                    line(g, [[cx - 0.92 + SH[0], y0 + SH[1]], [cx + 0.92 + SH[0], y1 + SH[1]]], L * 1.5, T.legSide);
                    line(g, [[cx + 0.92 + SH[0], y0 + SH[1]], [cx - 0.92 + SH[0], y1 + SH[1]]], L * 1.5, T.legSide);
                }
                C.box(g, cx - 0.09 + Dd(0.8)[0], yT + Dd(0.8)[1], 0.18, -yT + B, D, { front: T.tankSide, top: T.tank, side: T.leg }, { lw: L, depth: 0.16 });
            }
            for (const sx of [-1, 1]) C.box(g, cx + sx * 0.92 - 0.06 + SH[0], yT + SH[1], 0.12, -yT + B, D, legC, { lw: L, depth: 0.12 });
            C.box(g, cx - 1.02 + SH[0], -1.96 + SH[1], 2.04, 0.1, D, legC, { lw: L, depth: 0.9 });
            // the tank: a drum of staves in hoops under a conical roof
            const tx = cx + 0.2, ty = yT - 0.1, tw = 1.32, th = 1.5;
            const tank = [...C.ellipsePts(tx, ty, tw, 0.17, 20, 0, 0, Math.PI), [tx - tw, ty - th], [tx + tw, ty - th]];
            C.poly(g, tank, { fill: T.tank, ink: K.ink, lw: L });
            g.save();
            C.trace(g, tank);
            g.clip();
            g.fillStyle = T.tankSide;
            g.fillRect(tx + tw * 0.5, ty - th - 0.1, tw, th + 0.5);
            g.fillStyle = T.tankTop;
            g.fillRect(tx - tw * 0.72, ty - th - 0.1, tw * 0.3, th + 0.5);
            if (det) for (let i = -4; i <= 4; i++) line(g, [[tx + i * 0.28, ty - th], [tx + i * 0.28, ty + 0.2]], L * 0.5, T.tankSide);
            // a painted band instead of a name
            C.poly(g, C.ellipsePts(tx, ty - th * 0.5, tw, 0.17, 20, 0, 0, Math.PI), { ink: T.tankBand, lw: 0.3, close: false });
            for (const hy of [0.12, 0.86, 1.3]) C.poly(g, C.ellipsePts(tx, ty - th + hy, tw, 0.17, 20, 0, 0, Math.PI), { ink: K.ink, lw: L * 0.8, close: false });
            g.restore();
            C.poly(g, tank, { ink: K.ink, lw: L });
            const eave = [...C.ellipsePts(tx, ty - th, tw + 0.14, 0.2, 20, 0, 0, Math.PI), [tx - tw - 0.14, ty - th], [tx - 0.08, ty - th - 0.78], [tx + 0.08, ty - th - 0.78], [tx + tw + 0.14, ty - th]];
            C.poly(g, eave, { fill: T.roof, ink: K.ink, lw: L });
            C.poly(g, [[tx + 0.08, ty - th - 0.78], [tx + tw + 0.14, ty - th], ...C.ellipsePts(tx, ty - th, tw + 0.14, 0.2, 10, 0, 0, Math.PI / 2).slice(0, 8), [tx + 0.36, ty - th + 0.19]], { fill: T.roofSide, lw: 0 });
            C.poly(g, eave, { ink: K.ink, lw: L });
            line(g, [[tx, ty - th - 0.78], [tx, ty - th - 1.0]], L * 1.6);
            circ(g, tx, ty - th - 1.06, 0.09, on(0.62) ? T.lamp : T.lampOff, L * 0.8);
            if (on(0.62) && d % 4 < 2) C.sparkle(g, tx, ty - th - 1.06, 0.22, { color: '#ff9c8f', pinch: 0.3 });
            if (det) {
                // the ladder up the near leg
                const lx = cx - 0.92 + SH[0];
                for (const ox of [-0.16, 0.16]) line(g, [[lx + ox, B + SH[1]], [lx + ox, yT + SH[1] - 0.2]], L * 1.2, T.tankTop);
                for (let ry = B - 0.2; ry > yT - 0.2; ry -= 0.26) line(g, [[lx - 0.16, ry + SH[1]], [lx + 0.16, ry + SH[1]]], L, T.tankTop);
            }
        }
        // --- the motel: a low row of three rooms
        {
            const x0 = 7.3 + SH[0], yb = B + SH[1], w = 3.75, h = 1.5;
            C.box(g, x0, yb - h, w, h, D, { front: T.motel, top: T.motelTop, side: T.motelSide }, { lw: L, depth: 1.2 });
            C.box(g, x0 - 0.14, yb - h - 0.17, w + 0.28, 0.17, D, { front: T.motelRoof, top: T.motelRoofTop, side: T.motelRoofSide }, { lw: L, depth: 1.5 });
            if (mid) {
                neon(g, [[x0 - 0.08, yb - h - 0.085], [x0 + w + 0.08, yb - h - 0.085]], T.neonPink, L * 0.8, on(0.56));
                for (let i = 0; i < 3; i++) {
                    const ux = x0 + 0.18 + i * 1.22, lit = on([0.2, 0.5, 0.34][i]), open = i === 0 ? out[4] > 0 : i === 2 ? out[5] > 0 : false;
                    // the door (open once somebody has come out), a lamp over it, a window with curtains
                    rrect(g, ux, yb - 1.12, 0.46, 1.12, 0.02, open ? T.doorDark : T.motelDoor, L * 0.9);
                    if (!open && det) {
                        circ(g, ux + 0.37, yb - 0.56, 0.035, T.arrow, L * 0.5);
                        rrect(g, ux + 0.08, yb - 1.02, 0.3, 0.34, 0.02, null, L * 0.6, mix(T.motelDoor, '#241531', 0.4));
                    } else if (open) C.poly(g, [[ux + 0.46, yb - 1.12], [ux + 0.62, yb - 1.2], [ux + 0.62, yb - 0.06], [ux + 0.46, yb]], { fill: T.motelDoor, ink: K.ink, lw: L * 0.9 });
                    circ(g, ux + 0.23, yb - 1.26, 0.055, on(0.6) ? T.glassOn : T.neonOff, L * 0.6);
                    pane(g, ux + 0.58, yb - 1.0, 0.5, 0.46, 0.03, lit, L, () => {
                        for (const sx of [0, 1]) C.poly(g, C.curve([[ux + 0.58 + sx * 0.5, yb - 1.0], [ux + 0.58 + sx * 0.5 + (sx ? -0.17 : 0.17), yb - 1.0], [ux + 0.58 + sx * 0.5 + (sx ? -0.13 : 0.13), yb - 0.82], [ux + 0.58 + sx * 0.5 + (sx ? -0.05 : 0.05), yb - 0.7], [ux + 0.58 + sx * 0.5 + (sx ? -0.12 : 0.12), yb - 0.54], [ux + 0.58 + sx * 0.5, yb - 0.54]], true, 4), { fill: T.curtain, ink: K.ink, lw: L * 0.5 });
                    });
                    if (det) {
                        // a window box, a doormat
                        C.box(g, ux + 0.56, yb - 0.5, 0.54, 0.1, D, { front: T.diner, top: T.dinerTop, side: T.dinerSide }, { lw: L * 0.7, depth: 0.12 });
                        for (let fz = 0; fz < 4; fz++) circ(g, ux + 0.66 + fz * 0.12, yb - 0.53, 0.035, fz % 2 ? T.neonPink : T.glassOn, L * 0.4);
                        C.poly(g, [ob(ux + 0.02, yb, -0.05), ob(ux + 0.44, yb, -0.05), ob(ux + 0.44, yb, -0.3), ob(ux + 0.02, yb, -0.3)], { fill: T.roof, ink: K.ink, lw: L * 0.6 });
                    } else line(g, [[ux + 0.54, yb - 0.52], [ux + 1.12, yb - 0.52]], L * 1.3, T.motelRoofTop);
                }
            }
            // the arrow sign: a post, an arrow edged with bulbs, a plate with a neon moon under it
            const px = 7.0, ay = -4.2;
            C.box(g, px - 0.08, -3.75, 0.16, 3.75 - 0.12, D, chromeC, { lw: L, depth: 0.16 });
            const arrow = [[-0.6, -0.3], [1.0, -0.3], [1.0, -0.66], [2.0, 0], [1.0, 0.66], [1.0, 0.3], [-0.6, 0.3]].map(([ax, ay2]) => [px + ax, ay + ay2]);
            C.prism(g, arrow, Dd(0.2), { front: T.arrow, top: T.arrowTop, side: T.arrowSide }, { lw: L });
            if (mid) {
                C.poly(g, [[-0.42, -0.14], [1.16, -0.14], [1.16, -0.36], [1.72, 0], [1.16, 0.36], [1.16, 0.14], [-0.42, 0.14]].map(([ax, ay2]) => [px + ax, ay + ay2]), { fill: T.arrowIn, ink: K.ink, lw: L * 0.8 });
                // bulbs along its edge: they chase, two drawings a step
                const edge = [], n = arrow.length, chase = on(0.8), step = Math.floor(d / 2);
                for (let i = 0; i < n; i++) {
                    // along each edge, a little inside it (the arrow is clockwise: inwards is (-dy, dx))
                    const a = arrow[i], b = arrow[(i + 1) % n], len = Math.hypot(b[0] - a[0], b[1] - a[1]), k = Math.max(1, Math.round(len / 0.27)), nx = (-(b[1] - a[1]) / len) * 0.085, ny = ((b[0] - a[0]) / len) * 0.085;
                    for (let j = 0; j < k; j++) edge.push([lerp(a[0], b[0], (j + 0.5) / k) + nx, lerp(a[1], b[1], (j + 0.5) / k) + ny]);
                }
                edge.forEach(([bx, by], i) => {
                    const lit = chase && (((i - step) % 3) + 3) % 3 !== 0;
                    circ(g, bx, by, det ? 0.052 : 0.06, lit ? T.bulbOn : T.bulbOff, det ? L * 0.6 : 0);
                });
                C.box(g, px - 0.1, ay + 0.84, 1.3, 0.62, D, { front: T.board, top: T.boardTop, side: T.boardSide }, { lw: L, depth: 0.14 });
                const mo = on(0.9), mx = px + 0.4, my = ay + 1.15;
                neon(g, C.ellipsePts(mx, my, 0.2, 0.2, 14, 0, 0.9, TAU - 0.9), T.neonYellow, L * 0.75, mo);
                neon(g, C.ellipsePts(mx + 0.11, my, 0.17, 0.17, 10, 0, 1.75, TAU - 1.75), T.neonYellow, L * 0.75, mo);
                C.sparkle(g, px + 0.92, my - 0.04, 0.12, { color: mo ? T.neonAqua : T.neonOff, ink: K.ink, lw: L * 0.6, pinch: 0.4 });
            }
        }
        // --- the gas station: an office, a canopy over an island with two pumps, a sign on a pole
        {
            const x0 = 0.4 + SH[0], yb = B + SH[1], gasC = { front: T.gas, top: T.gasTop, side: T.gasSide };
            // the office
            C.box(g, x0, yb - 1.95, 1.95, 1.95, D, gasC, { lw: L, depth: 1.25 });
            C.poly(g, [[x0, yb - 1.72], [x0 + 1.95, yb - 1.72], [x0 + 1.95, yb - 1.52], [x0, yb - 1.52]], { fill: T.gasRed, ink: K.ink, lw: L * 0.8 });
            if (mid) {
                pane(g, x0 + 0.16, yb - 1.36, 0.86, 0.8, 0.03, on(0.3), L, () => {
                    // shelves of cans
                    for (const sy of [0.3, 0.56]) line(g, [[x0 + 0.16, yb - 1.36 + sy], [x0 + 1.02, yb - 1.36 + sy]], L * 0.8, T.curtain);
                    for (let i = 0; i < 4; i++) rrect(g, x0 + 0.24 + i * 0.19, yb - 1.36 + 0.14, 0.1, 0.15, 0.01, i % 2 ? T.gasRed : T.diner);
                });
                const open = out[2] > 0 || out[3] > 0;
                rrect(g, x0 + 1.2, yb - 1.36, 0.56, 1.36, 0.02, open ? T.doorDark : T.gasRed, L * 0.9);
                if (!open) {
                    pane(g, x0 + 1.28, yb - 1.28, 0.4, 0.6, 0.02, on(0.3), L);
                    if (det) line(g, [[x0 + 1.3, yb - 0.56], [x0 + 1.42, yb - 0.56]], L * 1.4, T.chromeTop);
                } else C.poly(g, [[x0 + 1.2, yb - 1.36], [x0 + 1.04, yb - 1.44], [x0 + 1.04, yb - 0.06], [x0 + 1.2, yb]], { fill: T.gasRed, ink: K.ink, lw: L * 0.9 });
            }
            // the island and its pumps, the far post of the canopy, the canopy, the near post
            C.box(g, 2.75, B - 0.1, 2.5, 0.1, D, { front: T.kerb, top: T.gasTop, side: T.kerbSide }, { lw: L, depth: 0.8 });
            const pump = (px) => {
                const py = B - 0.1, pc = { front: T.pump, top: T.pumpTop, side: T.pumpSide }, z = Dd(0.25);
                const body = [[-0.23, 0], [-0.23, -0.92], [-0.17, -1.05], [0.17, -1.05], [0.23, -0.92], [0.23, 0]].map(([ax, ay]) => [px + ax + z[0], py + ay + z[1]]);
                C.prism(g, body, Dd(0.34), pc, { lw: L });
                const fx = px + z[0], fy = py + z[1];
                if (mid) {
                    circ(g, fx, fy - 0.78, 0.14, '#fff1c4', L * 0.7);
                    line(g, [[fx, fy - 0.78], [fx + 0.07, fy - 0.87]], L * 0.8, T.gasRed);
                    rrect(g, fx - 0.15, fy - 0.56, 0.3, 0.22, 0.02, T.gasTop, L * 0.6);
                    if (det) for (const ly of [-0.49, -0.41]) line(g, [[fx - 0.1, fy + ly], [fx + 0.1, fy + ly]], L * 0.5, T.gasSide);
                    line(g, [[fx - 0.23, fy - 0.26], [fx + 0.23, fy - 0.26]], L * 0.7, T.pumpSide);
                    // the hose: out of the side, down in a loop, up to the nozzle in its holster
                    const hose = C.curve([[fx + 0.24, fy - 0.9], [fx + 0.42, fy - 0.7], [fx + 0.44, fy - 0.3], [fx + 0.36, fy - 0.16], [fx + 0.3, fy - 0.4], [fx + 0.28, fy - 0.6]], false, 6);
                    if (det) {
                        tube(g, hose, 0.045, T.hose, L * 0.6);
                        C.poly(g, [[fx + 0.23, fy - 0.68], [fx + 0.34, fy - 0.7], [fx + 0.4, fy - 0.62], [fx + 0.3, fy - 0.56], [fx + 0.23, fy - 0.56]], { fill: T.chrome, ink: K.ink, lw: L * 0.6 });
                    }
                    // the globe on top
                    line(g, [[fx, fy - 1.05], [fx, fy - 1.14]], L * 2.2);
                    circ(g, fx, fy - 1.27, 0.15, on(0.6) ? '#fffbe8' : T.gasSide, L * 0.8);
                    circ(g, fx, fy - 1.27, 0.07, on(0.6) ? T.gasRed : T.pumpSide);
                }
            };
            const post = (px, z) => C.box(g, px - 0.07 + Dd(z)[0], -2.32 + Dd(z)[1], 0.14, 2.32 + B - 0.1, D, gasC, { lw: L, depth: 0.14 });
            post(3.0, 0.62);
            post(4.95, 0.62);
            pump(3.55);
            pump(4.35);
            C.box(g, 0.15, -2.62, 5.25, 0.3, D, gasC, { lw: L, depth: 1.75 });
            C.poly(g, [[0.15, -2.52], [5.4, -2.52], [5.4, -2.42], [0.15, -2.42]], { fill: T.gasRed, lw: 0 });
            C.poly(g, [[0.15, -2.62], [5.4, -2.62], [5.4, -2.32], [0.15, -2.32]], { ink: K.ink, lw: L });
            if (mid) for (const lx of [3.2, 3.95, 4.7]) rrect(g, lx - 0.16, -2.32, 0.32, 0.07, 0.02, on(0.45) ? T.glassOn : T.gasSide, L * 0.6);
            // the sign on the canopy: a disc with a star
            const GZ = Dd(0.9), GX = 1.35 + GZ[0], GY = -3.95 + GZ[1];
            C.box(g, GX - 0.07, -3.5 + GZ[1], 0.14, 0.9, D, chromeC, { lw: L, depth: 0.14 });
            C.drum(g, GX, GY, 0.64, Dd(0.16), { front: T.gasTop, side: T.chromeSide }, { lw: L });
            circ(g, GX, GY, 0.52, on(0.7) ? T.sign : mix(T.sign, '#241531', 0.45), L * 0.8);
            if (mid) C.poly(g, Array.from({ length: 10 }, (_, i) => {
                const a = -Math.PI / 2 + (i / 10) * TAU, r = i % 2 ? 0.16 : 0.4;
                return [GX + Math.cos(a) * r, GY + Math.sin(a) * r];
            }), { fill: on(0.7) ? T.gasTop : T.gasSide, ink: K.ink, lw: L * 0.7 });
        }
        // --- the diner: a railcar of a building, a strip of windows, a neon cup on the roof
        {
            const x0 = -6.7 + SH[0], yb = B + SH[1], w = 5.2, h = 1.78;
            C.box(g, x0, yb - h, w, h, D, { front: T.diner, top: T.dinerTop, side: T.dinerSide }, { lw: L, depth: 1.3 });
            // a fluted chrome skirt, a chrome band over the windows
            C.poly(g, [[x0, yb - 0.34], [x0 + w, yb - 0.34], [x0 + w, yb], [x0, yb]], { fill: T.chrome, ink: K.ink, lw: L * 0.8 });
            if (det) for (let fx = x0 + 0.13; fx < x0 + w; fx += 0.13) line(g, [[fx, yb - 0.3], [fx, yb - 0.04]], L * 0.5, T.chromeSide);
            C.poly(g, [[x0, yb - h + 0.12], [x0 + w, yb - h + 0.12], [x0 + w, yb - h + 0.24], [x0, yb - h + 0.24]], { fill: T.chromeTop, ink: K.ink, lw: L * 0.7 });
            if (mid) {
                const open = out[0] > 0 || out[1] > 0;
                // the door with its porthole, two steps
                rrect(g, x0 + 0.2, yb - 1.36, 0.6, 1.36, [0.08, 0.08, 0, 0], open ? T.doorDark : T.door, L * 0.9);
                if (!open) {
                    circ(g, x0 + 0.5, yb - 0.98, 0.15, on(0.1) ? T.glassOn : T.glassOff, L * 0.8);
                    if (det) line(g, [[x0 + 0.68, yb - 0.74], [x0 + 0.68, yb - 0.5]], L * 1.5, T.chromeTop);
                } else C.poly(g, [[x0 + 0.8, yb - 1.36], [x0 + 0.98, yb - 1.44], [x0 + 0.98, yb - 0.06], [x0 + 0.8, yb]], { fill: T.door, ink: K.ink, lw: L * 0.9 });
                for (let i = 0; i < 5; i++) {
                    const wx = x0 + 1.12 + i * 0.8, lit = on([0.1, 0.26, 0.18, 0.34, 0.42][i]);
                    pane(g, wx, yb - 1.26, 0.68, 0.72, 0.1, lit, L, () => {
                        // a lamp over each booth
                        line(g, [[wx + 0.34, yb - 1.26], [wx + 0.34, yb - 1.1]], L * 0.6);
                        C.poly(g, [[wx + 0.24, yb - 1.02], [wx + 0.3, yb - 1.12], [wx + 0.38, yb - 1.12], [wx + 0.44, yb - 1.02]], { fill: T.roof, ink: K.ink, lw: L * 0.5 });
                    });
                }
                // the awning: stripes and a scalloped hem
                const ax0 = x0 + 1.02, ax1 = x0 + w - 0.06, n = 12, aw = (ax1 - ax0) / n;
                for (let i = 0; i < n; i++) {
                    const a0 = ax0 + i * aw;
                    g.beginPath();
                    g.moveTo(a0, yb - 1.56);
                    g.lineTo(a0 + aw, yb - 1.56);
                    g.lineTo(a0 + aw, yb - 1.34);
                    g.arc(a0 + aw / 2, yb - 1.34, aw / 2, 0, Math.PI);
                    g.closePath();
                    g.fillStyle = i % 2 ? T.awnB : T.awnA;
                    g.fill();
                    g.strokeStyle = K.ink;
                    g.lineWidth = L * 0.7;
                    g.stroke();
                }
            }
            C.box(g, x0 + 0.1, yb + 0.0 - 0.0 - 0.1, 0.8, 0.1, D, { front: T.step, top: T.kerbTop, side: T.kerbSide }, { lw: L * 0.8, depth: 0.3 });
            // the roof slab and the neon line along it
            C.box(g, x0 - 0.15, yb - h - 0.2, w + 0.3, 0.2, D, { front: T.roof, top: T.roofTop, side: T.roofSide }, { lw: L, depth: 1.5 });
            if (mid) neon(g, [[x0 - 0.08, yb - h - 0.1], [x0 + w + 0.08, yb - h - 0.1]], T.neonAqua, L * 0.8, on(0.55));
            // the sign: a board on two posts, a cup and its saucer in tubes, steam that rises on twos
            const cx = -4.1 + Dd(0.9)[0], ry = yb - h - 0.2 + Dd(0.9)[1], by = ry - 1.95;
            for (const sx of [-0.6, 0.6]) C.box(g, cx + sx - 0.05, ry - 0.5, 0.1, 0.5, D, chromeC, { lw: L * 0.8, depth: 0.1 });
            C.box(g, cx - 0.95, by, 1.9, 1.52, D, { front: T.board, top: T.boardTop, side: T.boardSide }, { lw: L, depth: 0.16 });
            if (mid) {
                const lit = on(0.5), cy = by + 1.0;
                rrect(g, cx - 0.86, by + 0.09, 1.72, 1.34, 0.06, null, L * 0.7, T.boardTop);
                neon(g, [[cx - 0.36, cy - 0.32], [cx - 0.26, cy + 0.14], [cx - 0.14, cy + 0.22], [cx + 0.16, cy + 0.22], [cx + 0.28, cy + 0.14], [cx + 0.38, cy - 0.32]], T.neonPink, L, lit, true);
                neon(g, C.ellipsePts(cx + 0.4, cy - 0.08, 0.15, 0.15, 12, 0, -1.25, 1.75), T.neonPink, L, lit);
                neon(g, [[cx - 0.56, cy + 0.34], [cx + 0.6, cy + 0.34]], T.neonYellow, L, lit);
                const ph = lit && d % 4 >= 2 ? 1 : -1;
                for (const sx of [-0.2, 0.02, 0.24]) neon(g, C.curve([[cx + sx, cy - 0.42], [cx + sx + 0.07 * ph, cy - 0.52], [cx + sx - 0.07 * ph, cy - 0.64], [cx + sx + 0.03 * ph, cy - 0.76]], false, 5), T.neonAqua, L * 0.8, lit);
            }
        }
        // --- parked: a saloon by the tower, a pick-up by the pumps
        boxCar(g, L, -9.85, 0.03, { front: T.carA, top: T.carATop, side: T.carASide }, false, false, false);
        boxCar(g, L, 6.1, 0.03, { front: T.carB, top: T.carBTop, side: T.carBSide }, true, true, false);
        if (det) {
            // --- the dog: asleep on its feet until the noise; then it sits up and howls
            const hw = smooth(seg(wake, 0.12, 0.4)), wag = [0, 0.12, -0.08][(((d % 3) + 3) % 3)] * (0.4 + hw), dc = { front: T.dog, top: T.dogTop, side: T.dogSide };
            g.save();
            g.translate(-0.75, -0.12);
            for (const lx of [-0.2, 0.16]) C.box(g, lx + D[0] * 0.14, -0.16 + D[1] * 0.14, 0.08, 0.16, D, dc, { lw: L * 0.8, depth: 0.06 });
            line(g, [[-0.26, -0.36], [-0.4 - wag, -0.56 - hw * 0.08]], L * 2.6);
            line(g, [[-0.26, -0.36], [-0.4 - wag, -0.56 - hw * 0.08]], L * 1.2, T.dog);
            C.box(g, -0.27, -0.42, 0.5, 0.26, D, dc, { lw: L, depth: 0.2 });
            for (const lx of [-0.24, 0.12]) C.box(g, lx, -0.16, 0.08, 0.16, D, dc, { lw: L * 0.8, depth: 0.06 });
            g.translate(0.24, -0.4);
            g.rotate(-0.75 * hw);
            C.box(g, -0.06, -0.3, 0.3, 0.28, D, dc, { lw: L, depth: 0.2 });
            C.box(g, 0.2, -0.16, 0.15, 0.12, D, dc, { lw: L * 0.8, depth: 0.14 });
            circ(g, 0.345, -0.15, 0.028, '#241531');
            C.poly(g, [[-0.05, -0.3], [-0.08, -0.12], [0.05, -0.28]], { fill: T.dogEar, ink: K.ink, lw: L * 0.7 });
            g.fillStyle = '#1d1626';
            g.fillRect(0.1, -0.22, 0.035, hw > 0.5 ? 0.02 : 0.06);
            if (hw > 0.5) C.poly(g, [[0.2, -0.04], [0.33, -0.04], [0.25, 0.05]], { fill: '#7a1f2e', ink: K.ink, lw: L * 0.6 });
            g.restore();
            // --- the townsfolk
            FOLK.forEach(([, door, mark, delay, dir, F], i) => {
                const a = out[i];
                if (a <= 0) return;
                const up = smooth(seg(wake, 0.3 + delay, 0.48 + delay)), arm = smooth(seg(wake, 0.42 + delay, 0.62 + delay)), hat = seg(wake, 0.72 + delay * 0.4, 1);
                const fx = lerp(door, mark, smooth(a)), hop = a < 1 ? Math.abs(Math.sin(a * Math.PI * 3)) * 0.07 : up > 0.99 && hat > 0 ? ((d + i) % 2) * 0.03 : 0;
                g.save();
                g.translate(fx, -0.12);
                g.scale(0.74 + 0.26 * back(a), 0.74 + 0.26 * back(a));
                folk(g, 0, 0, L, F, { up, arm, hat, dir, hop }, d);
                g.restore();
            });
        }
        g.restore();
    }

    // =========================================================================================
    // The angels
    // =========================================================================================
    // Box people of the cast's family (Cast.tom): a head box that is the hair with the face a
    // panel on its front, a torso under a white robe with a gold hem, stub arms in wide
    // sleeves ending in block mitts, two stubby wings, and a halo held up by a wire, like a
    // costume. Three of them, told apart by `who`: 0 short dark hair and round gold glasses,
    // 1 bald with a white walrus moustache, 2 a mass of ginger curls and round cheeks.
    const ANGEL = {
        ink: K.ink, robe: '#fffdf4', robeTop: '#ffffff', robeSide: '#cfc8ee', fold: '#b9b4dc',
        hem: '#ffc21f', hemTop: '#ffe62e', hemSide: '#c98a0e', wing: '#fffdf4', wingSide: '#cfc8ee', wingLine: '#b9b4dc',
        halo: '#ffe62e', haloLight: '#fffbe8', haloSide: '#e0a800', wire: '#8d95ad',
        eye: '#1d1626', mouth: '#7a1f2e', tongue: '#ff8fa3', glint: '#ffffff', tooth: '#fffdf4', sandal: '#8a5a2e',
        brass: '#ffc21f', brassTop: '#ffe62e', brassSide: '#c98a0e', string: '#fffdf4',
    };
    const WHO = [
        { skin: '#b97a4f', skinTop: '#d39a6c', skinSide: '#8f5a37', hair: '#4a3324', hairTop: '#6b4a34', hairSide: '#2f2018', hairLine: '#2f2018', blush: null },
        { skin: '#f7c9a3', skinTop: '#fcdfc6', skinSide: '#e0a17b', hair: '#e4e0f2', hairTop: '#fffdf4', hairSide: '#a9a3c9', hairLine: '#a9a3c9', blush: null },
        { skin: '#f6c2a0', skinTop: '#fcdfc6', skinSide: '#d9906b', hair: '#ff9d3c', hairTop: '#ffc46e', hairSide: '#d9731f', hairLine: '#c9600f', blush: '#ff9ccf' },
    ];
    const A_TORSO = { x: -0.36, y: -0.98, w: 0.72 }, A_HEAD = { w: 0.84, h: 0.86, top: -1.84, d: 0.46 };
    const bumpsOn = (anchors, k = 0.34, closed = true, m = 7) => {
        const out = [], n = anchors.length, last = closed ? n : n - 1;
        for (let i = 0; i < last; i++) {
            const p = anchors[i], q = anchors[(i + 1) % n], dx = q[0] - p[0], dy = q[1] - p[1], l = Math.hypot(dx, dy) || 1, nx = dy / l, ny = -dx / l;
            for (let j = 0; j < m; j++) {
                const a = (j / m) * Math.PI, u = (1 - Math.cos(a)) / 2, h = Math.sin(a) * k * l;
                out.push([p[0] + dx * u + nx * h, p[1] + dy * u + ny * h]);
            }
        }
        if (!closed) out.push(anchors[n - 1]);
        return out;
    };

    /**
     * A small harp: a soundbox that leans, a straight pillar, a curved neck with a scroll, six
     * strings. (x, y) is its foot, `ang` turns it (0 = upright; clockwise), sc its size (1 = 0.8
     * of a figure unit tall); the caller's units are figure units and L its line width.
     */
    function harp(g, L0, x, y, ang = 0, sc = 1, pluck = 0) {
        const A = ANGEL, L = L0 / sc, at = (p) => {
            const q = rot(p, ang);
            return [x + q[0] * sc, y + q[1] * sc];
        };
        const gold = { front: A.brass, top: A.brassTop, side: A.brassSide }, dd = Dd(0.07 * sc);
        // strings first: they run from the neck down to the soundbox
        const neck = C.curve([[-0.25, -0.6], [-0.15, -0.74], [0.0, -0.7], [0.13, -0.66], [0.26, -0.8]], false, 8);
        const neckAt = (px) => {
            for (let i = 0; i + 1 < neck.length; i++) if (px >= neck[i][0] && px <= neck[i + 1][0]) return lerp(neck[i][1], neck[i + 1][1], (px - neck[i][0]) / (neck[i + 1][0] - neck[i][0]));
            return -0.7;
        };
        for (let i = 0; i < 6; i++) {
            const sx = -0.15 + i * 0.065, wob = pluck ? Math.sin(i * 2.1 + pluck * 7) * 0.008 * Math.abs(pluck) : 0;
            line(g, [at([sx, neckAt(sx) + 0.02]), at([sx + wob, -0.36 + i * 0.03]), at([sx, lerp(-0.56, -0.03, (sx + 0.25) / 0.47) - 0.02])], L0 * 0.55, A.brassSide);
        }
        C.prism(g, cw([at([-0.3, -0.6]), at([-0.22, -0.64]), at([0.24, -0.06]), at([0.24, 0.0]), at([0.12, 0.0])]), dd, gold, { lw: L0, ink: A.ink });
        line(g, [at([-0.2, -0.52]), at([0.08, -0.14])], L0 * 0.7, A.brassSide);
        C.prism(g, cw([at([0.2, 0.0]), at([0.2, -0.82]), at([0.3, -0.82]), at([0.3, 0.0])]), dd, gold, { lw: L0, ink: A.ink });
        tube(g, neck.map(at), 0.075 * sc, A.brass, L0, false, A.ink);
        line(g, neck.slice(1, -2).map(([px, py]) => at([px, py - 0.015])), L0 * 0.7, A.brassTop);
        // the scroll on top of the pillar, the foot
        const sc0 = at([0.25, -0.86]);
        circ(g, sc0[0], sc0[1], 0.07 * sc, A.brassTop, L0);
        circ(g, sc0[0], sc0[1], 0.026 * sc, A.brassSide);
        C.prism(g, cw([at([0.06, 0.0]), at([0.06, -0.05]), at([0.34, -0.05]), at([0.34, 0.0])]), dd, gold, { lw: L0, ink: A.ink });
    }
    /**
     * A long herald's trumpet: a mouthpiece at (x, y), a straight tube along `ang` (0 = to the
     * right; clockwise), three valves, a flared bell 1.3 away. sc scales it.
     */
    function trumpet(g, L0, x, y, ang = 0, sc = 1) {
        const A = ANGEL, at = (p) => {
            const q = rot(p, ang);
            return [x + q[0] * sc, y + q[1] * sc];
        };
        tube(g, [at([0.05, 0]), at([1.0, 0])], 0.05 * sc, A.brass, L0, false, A.ink);
        line(g, [at([0.1, -0.012]), at([0.96, -0.012])], L0 * 0.6, A.brassTop);
        // the bell: a flare and its mouth
        C.poly(g, [at([0.94, -0.03]), at([1.12, -0.07]), at([1.3, -0.19]), at([1.3, 0.19]), at([1.12, 0.07]), at([0.94, 0.03])], { fill: A.brass, ink: A.ink, lw: L0 });
        line(g, [at([1.0, -0.03]), at([1.14, -0.055]), at([1.27, -0.14])], L0 * 0.7, A.brassTop);
        C.poly(g, C.ellipsePts(0, 0, 0.05, 0.19, 18).map(([px, py]) => at([1.3 + px, py])), { fill: A.brassSide, ink: A.ink, lw: L0 });
        C.poly(g, C.ellipsePts(0, 0, 0.022, 0.11, 14).map(([px, py]) => at([1.305 + px, py])), { fill: '#7a4a12', lw: 0 });
        // the mouthpiece, two ferrules, three valves
        C.poly(g, [at([0, -0.045]), at([0.04, -0.045]), at([0.09, -0.02]), at([0.09, 0.02]), at([0.04, 0.045]), at([0, 0.045])], { fill: A.brassTop, ink: A.ink, lw: L0 * 0.8 });
        for (const fx of [0.3, 0.8]) C.poly(g, [at([fx, -0.04]), at([fx + 0.04, -0.04]), at([fx + 0.04, 0.04]), at([fx, 0.04])], { fill: A.brassTop, ink: A.ink, lw: L0 * 0.7 });
        for (const vx of [0.44, 0.53, 0.62]) {
            C.poly(g, [at([vx, -0.025]), at([vx, -0.1]), at([vx + 0.055, -0.1]), at([vx + 0.055, -0.025])], { fill: A.brass, ink: A.ink, lw: L0 * 0.7 });
            C.poly(g, [at([vx - 0.012, -0.1]), at([vx - 0.012, -0.125]), at([vx + 0.067, -0.125]), at([vx + 0.067, -0.1])], { fill: A.brassTop, ink: A.ink, lw: L0 * 0.7 });
        }
    }

    // A wide sleeve that flares to the cuff, and the block mitt at the hand point.
    function sleeve(g, P, L, sh, hand) {
        const A = ANGEL, dx = hand[0] - sh[0], dy = hand[1] - sh[1], len = Math.hypot(dx, dy) || 1e-6, ux = dx / len, uy = dy / len;
        const quad = (a, b, wa, wb) => cw([[sh[0] + ux * a - uy * wa, sh[1] + uy * a + ux * wa], [sh[0] + ux * b - uy * wb, sh[1] + uy * b + ux * wb], [sh[0] + ux * b + uy * wb, sh[1] + uy * b - ux * wb], [sh[0] + ux * a + uy * wa, sh[1] + uy * a - ux * wa]]);
        const cut = Math.max(0.03, len - 0.08);
        C.prism(g, quad(cut - 0.02, len + 0.1, 0.075, 0.075), Dd(0.15), { front: P.skin, top: P.skinTop, side: P.skinSide }, { lw: L, ink: A.ink });
        C.prism(g, quad(-0.05, cut, 0.085, 0.125), Dd(0.17), { front: A.robe, top: A.robeTop, side: A.robeSide }, { lw: L, ink: A.ink });
        // a gold band at the cuff
        const c0 = Math.max(0, cut - 0.06);
        C.poly(g, quad(c0, cut, 0.085 + (0.04 * c0) / Math.max(cut + 0.05, 0.1), 0.125), { fill: A.hem, ink: A.ink, lw: L * 0.7 });
    }

    function wing(g, L, sx, flap) {
        const A = ANGEL, a = lerp(0.55, -0.6, flap), z = Dd(0.44);
        const shape = [[-0.06, -0.13], [0.2, -0.24], [0.44, -0.24], [0.6, -0.14], [0.64, -0.02], [0.52, 0.03], [0.56, 0.14], [0.42, 0.16], [0.43, 0.27], [0.28, 0.25], [0.24, 0.34], [0.08, 0.24], [-0.06, 0.1]];
        const at = (p) => {
            const q = rot(p, a);
            return [sx * (0.27 + q[0] * 1.14) + z[0], -0.86 + q[1] * 1.14 + z[1]];
        };
        const pts = cw(C.curve(shape, true, 4).map(at));
        C.prism(g, pts, Dd(0.07), { front: A.wing, top: A.robeTop, side: A.wingSide }, { lw: L, ink: A.ink, sweepInk: null });
        C.prismOutline(g, pts, Dd(0.07), { lw: L, ink: A.ink });
        // feathers: the upper covert's edge and a line up each notch
        line(g, C.curve([[0.02, 0.02], [0.2, -0.08], [0.4, -0.07], [0.54, -0.03]], false, 5).map(at), L * 0.8, A.wingLine);
        for (const [p, q] of [[[0.5, 0.05], [0.34, 0.0]], [[0.4, 0.17], [0.26, 0.07]], [[0.26, 0.26], [0.16, 0.12]]]) line(g, [at(p), at(q)], L * 0.8, A.wingLine);
    }

    function angelHead(g, P, L, who, mood, o) {
        const A = ANGEL, { w, h, top, d } = A_HEAD, x0 = -w / 2, x1 = w / 2, bot = top + h, fx = 0.31, fy = top + 0.2;
        const panel = [[-fx, fy], [fx, fy], [fx, bot - 0.1], [fx - 0.09, bot - 0.005], [-fx + 0.09, bot - 0.005], [-fx, bot - 0.1]];
        if (who === 2) {
            // a mass of curls wider than the head, the face in a scalloped window
            const cy = top + 0.4, anchors = [];
            for (let i = 0; i < 14; i++) {
                const a = -Math.PI / 2 + ((i + 0.5) / 14) * TAU, ca = Math.cos(a), sa = Math.sin(a), e = 2.6;
                const r = Math.pow(Math.pow(Math.abs(ca) / 0.51, e) + Math.pow(Math.abs(sa) / 0.47, e), -1 / e);
                anchors.push([ca * r, Math.min(cy + sa * r, bot - 0.14)]);
            }
            const blob = bumpsOn(anchors, 0.33, true, 8);
            C.prism(g, blob, Dd(d), { front: P.hair, top: P.hairTop, side: P.hairSide }, { lw: L, ink: A.ink, sweepInk: null });
            C.prismOutline(g, blob, Dd(d), { lw: L, ink: A.ink });
            C.poly(g, panel, { fill: P.skin, ink: A.ink, lw: L });
            const win = bumpsOn([[0.315, top + 0.66], [0.305, top + 0.52], [0.3, top + 0.4], [0.2, top + 0.3], [0.07, top + 0.29], [-0.07, top + 0.29], [-0.2, top + 0.3], [-0.3, top + 0.4], [-0.305, top + 0.52], [-0.315, top + 0.66]], 0.32, false, 7);
            C.poly(g, [[-0.34, top + 0.66], [-0.34, fy - 0.025], [0.34, fy - 0.025], [0.34, top + 0.66], ...win], { fill: P.hair, lw: 0 });
            C.poly(g, win, { ink: A.ink, lw: L, close: false });
            g.save();
            C.trace(g, blob);
            g.clip();
            g.strokeStyle = P.hairLine;
            g.lineWidth = L * 0.75;
            for (const [mx, my, a0] of [[-0.33, 0.0, 2.6], [-0.12, -0.045, 3.4], [0.1, -0.04, 2.2], [0.31, 0.02, 3.9], [-0.22, 0.135, 4.6], [0.0, 0.1, 2.9], [0.21, 0.13, 5.2], [-0.455, 0.2, 3.2], [-0.47, 0.42, 4.4], [-0.44, 0.6, 2.4], [0.45, 0.2, 5.6], [0.47, 0.42, 3.0], [0.44, 0.6, 4.9]]) {
                g.beginPath();
                g.arc(mx, top + my, 0.042, a0, a0 + 4.1);
                g.stroke();
            }
            g.restore();
        } else if (who === 1) {
            // bald on top: the box is skin, with a fringe of white hair round its sides
            C.box(g, x0, top, w, h - 0.06, D, { front: P.skin, top: P.skinTop, side: P.skinSide }, { lw: L, ink: A.ink, depth: d });
            const side = [ob(x1, top + 0.34, 0), ob(x1, top + 0.3, d), ob(x1, bot - 0.06, d), ob(x1, bot - 0.06, 0)];
            C.poly(g, side, { fill: P.hairSide, ink: A.ink, lw: L });
            for (const sx of [-1, 1]) {
                // three tufts down each side of the face
                const ys = [top + 0.34, top + 0.47, top + 0.6, top + 0.73], xo = sx * (w / 2 + 0.005);
                const tuft = bumpsOn((sx > 0 ? ys : ys.slice().reverse()).map((yy) => [xo, yy]), 0.42, false, 6);
                C.poly(g, [...tuft, [sx * (fx + 0.03), sx > 0 ? top + 0.73 : top + 0.34], [sx * (fx + 0.03), sx > 0 ? top + 0.34 : top + 0.73]], { fill: P.hair, ink: A.ink, lw: L });
            }
            // a shine on the pate
            line(g, [[-0.2, top + 0.09], [-0.06, top + 0.07]], L * 1.3, P.skinTop);
        } else {
            // short dark hair: a box with a side parting and a fringe cut straight
            C.box(g, x0, top, w, h - 0.06, D, { front: P.hair, top: P.hairTop, side: P.hairSide }, { lw: L, ink: A.ink, depth: d });
            C.poly(g, panel, { fill: P.skin, ink: A.ink, lw: L });
            const fr = [[-fx - 0.004, fy - 0.012], [fx + 0.004, fy - 0.012], [fx + 0.004, fy + 0.12], [0.16, fy + 0.085], [0.1, fy + 0.02], [-fx - 0.004, fy + 0.1]];
            C.poly(g, fr, { fill: P.hair, lw: 0 });
            C.poly(g, fr.slice(2), { ink: A.ink, lw: L, close: false });
            line(g, [[0.1, fy + 0.02], [0.07, top]], L * 0.7, P.hairLine);
        }
        // --- the face
        const ey = top + 0.5 + (who === 1 ? -0.02 : 0), my = top + 0.74, dip = who === 1 ? -0.06 : 0;
        const eye = (sx, kind) => {
            const ex = sx * 0.155, ew = 0.075;
            if (kind === 'shut') line(g, [[ex - 0.065, ey + 0.02], [ex, ey + 0.055], [ex + 0.065, ey + 0.02]], L * 1.15, A.eye);
            else if (kind === 'happy') line(g, [[ex - 0.065, ey + 0.045], [ex, ey - 0.005], [ex + 0.065, ey + 0.045]], L * 1.25, A.eye);
            else if (kind === 'wince') line(g, [[ex + sx * 0.07, ey - 0.05], [ex - sx * 0.05, ey + 0.01], [ex + sx * 0.07, ey + 0.06]], L * 1.25, A.eye);
            else {
                const eh = kind === 'wide' ? 0.2 : 0.16;
                g.fillStyle = A.eye;
                g.fillRect(ex - ew / 2, ey - eh / 2, ew, eh);
                g.fillStyle = A.glint;
                g.fillRect(ex - ew / 2 + 0.012, ey - eh / 2 + (kind === 'wide' ? 0.022 : 0.03), 0.028, 0.03);
                if (kind === 'wide') line(g, [[ex - 0.07, ey - 0.165], [ex + 0.07, ey - 0.165 - sx * 0.012]], L * 1.1, who === 1 ? P.hairSide : A.ink);
            }
        };
        const kinds = { serene: ['shut', 'shut'], shocked: ['wide', 'wide'], ears: ['wince', 'wince'], peek: ['wince', 'open'], rock: ['happy', 'happy'] }[mood] ?? ['shut', 'shut'];
        eye(-1, kinds[0]);
        eye(1, kinds[1]);
        if (P.blush) for (const sx of [-1, 1]) oval(g, sx * 0.215, ey + 0.17, 0.06, 0.042, P.blush);
        line(g, [[0.012, ey + 0.05], [0.012, ey + 0.145], [0.05, ey + 0.145]], L * 0.85);
        // the mouth
        const mouthBox = (mw, mh, teeth) => {
            const y0 = my - mh / 2 + 0.01 - dip * 0;
            g.save();
            g.beginPath();
            g.roundRect(-mw / 2, y0, mw, mh, [0.02, 0.02, mh * 0.48, mh * 0.48]);
            g.fillStyle = A.mouth;
            g.fill();
            g.clip();
            oval(g, 0.01, y0 + mh + 0.01, mw * 0.36, mh * 0.42, A.tongue);
            if (teeth) {
                g.fillStyle = A.tooth;
                g.fillRect(-mw / 2, y0, mw, 0.038);
            }
            g.restore();
            g.beginPath();
            g.roundRect(-mw / 2, y0, mw, mh, [0.02, 0.02, mh * 0.48, mh * 0.48]);
            g.strokeStyle = A.ink;
            g.lineWidth = L * 0.9;
            g.stroke();
        };
        if (mood === 'shocked') oval(g, 0, my + 0.025, 0.07, 0.085, A.mouth, L * 0.9);
        else if (mood === 'ears') line(g, [[-0.11, my + 0.03], [-0.055, my - 0.005], [0, my + 0.03], [0.055, my - 0.005], [0.11, my + 0.03]], L);
        else if (mood === 'peek') oval(g, 0.02, my + 0.02, 0.036, 0.03, A.mouth, L * 0.8);
        else if (mood === 'rock') mouthBox(0.27, 0.15, true);
        else line(g, [[-0.085, my - 0.005], [-0.03, my + 0.028], [0.03, my + 0.028], [0.085, my - 0.005]], L);
        if (who === 1) {
            // the walrus moustache: two drooping wings under the nose, and brows to match
            for (const sx of [-1, 1]) {
                const mo = C.curve([[0, ey + 0.165], [sx * 0.1, ey + 0.15], [sx * 0.23, ey + 0.2], [sx * 0.27, ey + 0.3], [sx * 0.2, ey + 0.335], [sx * 0.1, ey + 0.27], [0, ey + 0.245]], true, 5);
                C.poly(g, mo, { fill: P.hair, ink: A.ink, lw: L * 0.9 });
                line(g, [[sx * 0.07, ey + 0.2], [sx * 0.17, ey + 0.25]], L * 0.7, P.hairLine);
                if (kinds[sx < 0 ? 0 : 1] !== 'wide') C.poly(g, [[sx * 0.07, ey - 0.13], [sx * 0.24, ey - 0.15 - (mood === 'ears' ? -0.04 : 0)], [sx * 0.24, ey - 0.105 - (mood === 'ears' ? -0.04 : 0)], [sx * 0.07, ey - 0.09]], { fill: P.hair, ink: A.ink, lw: L * 0.7 });
            }
        }
        if (who === 0) {
            // round glasses: gold rims, a bridge, arms to the edge of the face
            for (const sx of [-1, 1]) {
                circ(g, sx * 0.155, ey, 0.118, 'rgba(255,255,255,0.2)');
                circ(g, sx * 0.155, ey, 0.118, null, L * 2.3, A.ink);
                circ(g, sx * 0.155, ey, 0.118, null, L * 1.1, A.hem);
                line(g, [[sx * 0.2, ey - 0.07], [sx * 0.235, ey - 0.03]], L * 0.8, A.glint);
                line(g, [[sx * 0.273, ey - 0.02], [sx * fx, ey - 0.04]], L * 1.2, A.hemSide);
            }
            line(g, [[-0.04, ey - 0.02], [0, ey - 0.04], [0.04, ey - 0.02]], L * 1.2, A.hemSide);
        }
    }

    /**
     * An angel.  x, y: the ground between the feet (with sit: the seat);  s: logical units per
     * figure unit (the same scale as Cast.tom next to it).
     *   pose: { who      0 | 1 | 2
     *           mood     'serene' (eyes shut, mitts together) | 'shocked' (wide eyes, mitts flung out)
     *                    | 'ears' (mitts clapped over the sides of the head, wincing)
     *                    | 'peek' (one mitt lifted, one eye open) | 'rock' (a wide grin, a mitt up)
     *           flap     0..1 the wings, from folded down to raised (change it on twos:
     *                    Skyward.flap(t, rate) gives a value that beats on twos)
     *           harp     true: holds a small harp (plucked when serene; in 'rock' it is slung like
     *                    a guitar and strummed: strum -1..1);  set down beside the angel in 'ears'
     *           trumpet  true: holds a long trumpet (upright at rest; raised to the lips in 'rock')
     *           halo     its tilt in radians (0 = level; about ±0.5);  haloUp 0..1 it jumps up its wire
     *           squash, lean, headDy, headTilt   as in Cast.tom
     *           armUp    0..1 in 'rock': how high the free mitt is (default 1; nod it on the beat)
     *           sit      true: sitting on the edge of a cloud, the shins hanging below the seat
     *           shadow   true draws a contact shadow (default false: they stand on cloud) }
     * Skyward.angelPoints(pose) gives where things are in its own units (halo, mitts, mouth).
     */
    function angelHands(pose) {
        const mood = pose.mood ?? 'serene', up = pose.armUp ?? 1, st = pose.strum ?? 0;
        // [the right mitt (screen left), the left mitt (screen right)], and where the props are
        let R = [-0.08, -0.6], Lh = [0.08, -0.6], prop = null;
        if (mood === 'shocked') [R, Lh] = [[-0.74, -1.22], [0.74, -1.22]];
        else if (mood === 'ears') [R, Lh] = [[-0.47, -1.4], [0.47, -1.4]];
        else if (mood === 'peek') [R, Lh] = [[-0.47, -1.4], [0.7, -1.52]];
        else if (mood === 'rock') [R, Lh] = [[-0.52, -0.52], [0.56, -1.2 - 0.62 * up]];
        if (pose.harp) {
            if (mood === 'ears') prop = { kind: 'harp', x: 0.72, y: 0, ang: 0.1, sc: 0.8 };
            else if (mood === 'rock') {
                prop = { kind: 'harp', x: -0.42, y: -0.5, ang: 1.0, sc: 0.95 };
                R = [-0.07 + 0.05 * st, -0.68 + 0.08 * st];
                Lh = [0.37, -0.76];
            } else {
                // carried in front, a mitt on each side of it; the right one plucks when serene
                prop = { kind: 'harp', x: 0.06, y: -0.1, ang: 0.03, sc: 1.05 };
                Lh = [0.43, -0.5];
                if (mood === 'serene') R = [-0.17 + 0.04 * st, -0.5 + 0.07 * st];
            }
        } else if (pose.trumpet) {
            if (mood === 'ears') prop = { kind: 'trumpet', x: 0.78, y: -1.32, ang: Math.PI / 2, sc: 1 };
            else if (mood === 'rock') {
                prop = { kind: 'trumpet', x: 0.07, y: -1.09 + (pose.headDy ?? 0), ang: -0.52, sc: 1 };
                Lh = [0.07 + Math.cos(-0.52) * 0.4, -1.09 + (pose.headDy ?? 0) + Math.sin(-0.52) * 0.4 + 0.03];
                R = [-0.58, -1.2 - 0.6 * up];
            } else {
                prop = { kind: 'trumpet', x: 0.56, y: -0.1, ang: -Math.PI / 2 + (mood === 'shocked' ? 0.3 : 0.07), sc: 1 };
                const a = prop.ang;
                Lh = [prop.x + Math.cos(a) * 0.62, prop.y + Math.sin(a) * 0.62];
                if (mood === 'serene') R = [-0.5, -0.5];
            }
        }
        return { R: pose.handR ?? R, L: pose.handL ?? Lh, prop };
    }
    const haloAt = (pose) => {
        const up = pose.haloUp ?? 0;
        return [0.02, A_HEAD.top - 0.24 - 0.2 * up + (pose.headDy ?? 0)];
    };
    /** Places in an angel's own units (multiply by s, add x, y): { halo, handR, handL, mouth, head } */
    function angelPoints(pose = {}) {
        const h = angelHands(pose), sit = pose.sit ? 0.36 : 0;
        const dn = ([px, py]) => [px, py + sit];
        return { halo: dn(haloAt(pose)), handR: dn(h.R), handL: dn(h.L), mouth: dn([0, A_HEAD.top + 0.75 + (pose.headDy ?? 0)]), head: dn([0, A_HEAD.top + (pose.headDy ?? 0)]) };
    }
    const flap = (t, rate = 3) => [0.15, 0.6, 1, 0.55][((Math.floor(C.drawing(t) * (rate / 3) * 0.5) % 4) + 4) % 4];

    function angel(g, x, y, s, pose = {}) {
        const A = ANGEL, who = pose.who ?? 0, P = WHO[who] ?? WHO[0], mood = pose.mood ?? 'serene', L = 3.2 / s, q = pose.squash ?? 0, fl = clamp(pose.flap ?? 0.3);
        const robeC = { front: A.robe, top: A.robeTop, side: A.robeSide };
        const skinC = { front: P.skin, top: P.skinTop, side: P.skinSide };
        g.save();
        g.translate(x, y);
        g.scale(s, s);
        g.lineJoin = 'round';
        g.lineCap = 'round';
        if (pose.shadow) oval(g, 0.05, 0, 0.56 * (1 + q), 0.06, 'rgba(36,21,49,0.28)');
        g.rotate(pose.lean ?? 0);
        g.scale(1 + q, 1 - q);
        const hands = angelHands(pose), prop = hands.prop;
        const sitDy = pose.sit ? 0.36 : 0;
        // what stands beside goes first
        if (prop && mood === 'ears') {
            if (prop.kind === 'harp') harp(g, L, prop.x, 0, prop.ang, prop.sc, 0);
            else trumpet(g, L, prop.x, prop.y + sitDy, prop.ang, prop.sc);
        }
        g.save();
        g.translate(0, sitDy);
        wing(g, L, -1, fl);
        wing(g, L, 1, fl);
        g.restore();
        if (pose.sit) {
            // the lap and the shins hanging over the cloud's edge, the feet under the hem
            for (const sx of [-1, 1]) {
                C.box(g, sx * 0.2 - 0.13, 0.4, 0.26, 0.11, D, skinC, { lw: L, ink: A.ink, depth: 0.3 });
                line(g, [[sx * 0.2 - 0.13, 0.44], [sx * 0.2 + 0.13, 0.44]], L * 1.3, A.sandal);
            }
            C.box(g, -0.43, -0.04, 0.86, 0.46, D, robeC, { lw: L, ink: A.ink, depth: 0.55 });
            C.poly(g, [[0.43, 0.3], ob(0.43, 0.3, 0.55), ob(0.43, 0.42, 0.55), [0.43, 0.42]], { fill: A.hemSide, ink: A.ink, lw: L });
            C.poly(g, [[-0.43, 0.3], [0.43, 0.3], [0.43, 0.42], [-0.43, 0.42]], { fill: A.hem, ink: A.ink, lw: L });
            for (const fx of [-0.15, 0.17]) line(g, [[fx, 0.02], [fx - 0.01, 0.28]], L * 0.8, A.fold);
        } else {
            for (const sx of [-1, 1]) {
                C.box(g, sx * 0.2 - 0.13, -0.11, 0.26, 0.11, D, skinC, { lw: L, ink: A.ink, depth: 0.34 });
                line(g, [[sx * 0.2 - 0.13, -0.07], [sx * 0.2 + 0.13, -0.07]], L * 1.3, A.sandal);
            }
        }
        g.save();
        g.translate(0, sitDy);
        // the robe: an A-line from the shoulders, a gold hem, a cord round the middle
        const T = A_TORSO, yH = pose.sit ? -0.38 : -0.1, wH = pose.sit ? 0.42 : 0.47;
        const robe = [[T.x, T.y], [T.x + T.w, T.y], [wH, yH], [-wH, yH]];
        C.prism(g, robe, Dd(0.4), robeC, { lw: L, ink: A.ink });
        if (!pose.sit) {
            // the hem: a gold band round the foot of the robe, on its front and on the side we see
            const k = 0.13 / (yH - T.y), wT = lerp(wH, T.w / 2, k), dd = Dd(0.4);
            C.poly(g, [[wT, yH - 0.13], [wT + dd[0], yH - 0.13 + dd[1]], [wH + dd[0], yH + dd[1]], [wH, yH]], { fill: A.hemSide, ink: A.ink, lw: L });
            C.poly(g, [[-wT, yH - 0.13], [wT, yH - 0.13], [wH, yH], [-wH, yH]], { fill: A.hem, ink: A.ink, lw: L });
            line(g, [[-wT + 0.03, yH - 0.095], [wT - 0.03, yH - 0.095]], L * 0.8, A.hemTop);
            for (const fx of [-0.17, 0.16]) line(g, [[fx, -0.46], [fx * 1.2, yH - 0.16]], L * 0.8, A.fold);
        }
        // the yoke: a gold V at the neck
        C.poly(g, [[-0.17, T.y], [0.17, T.y], [0, T.y + 0.2]], { fill: P.skin, ink: A.ink, lw: L * 0.8 });
        C.poly(g, [[-0.23, T.y], [-0.17, T.y], [0, T.y + 0.2], [0.17, T.y], [0.23, T.y], [0, T.y + 0.28]], { fill: A.hem, ink: A.ink, lw: L * 0.8 });
        tube(g, [[lerp(T.x, -wH, 0.5) + 0.005, -0.52], [lerp(-T.x, wH, 0.5) - 0.005, -0.52]], 0.035, A.hem, L * 0.7, false, A.ink);
        for (const [tx, len] of [[0.2, 0.2], [0.26, 0.15]]) {
            line(g, [[0.22, -0.52], [tx, -0.52 + len]], L * 2.4);
            line(g, [[0.22, -0.52], [tx, -0.52 + len]], L * 1.1, A.hem);
            C.poly(g, [[tx - 0.025, -0.52 + len], [tx + 0.025, -0.52 + len], [tx + 0.035, -0.45 + len], [tx - 0.035, -0.45 + len]], { fill: A.hemTop, ink: A.ink, lw: L * 0.7 });
        }
        circ(g, 0.22, -0.52, 0.035, A.hemTop, L * 0.7);
        // the head, and over it the halo on its wire
        const hp = haloAt(pose), tilt = pose.halo ?? 0;
        g.save();
        g.translate(0, pose.headDy ?? 0);
        g.rotate(pose.headTilt ?? 0);
        angelHead(g, P, L, who, mood, pose);
        g.restore();
        const root = ob(0.0, A_HEAD.top + (pose.headDy ?? 0), 0.34), rim = [hp[0] + D[0] * 0.3 * Math.cos(tilt), hp[1] - 0.06 + Math.sin(tilt) * 0.02];
        const wire = C.curve([root, [root[0] + 0.05, root[1] - 0.09], [root[0] - 0.03, lerp(root[1], rim[1], 0.55)], rim], false, 6);
        line(g, wire, L * 2.2);
        line(g, wire, L * 0.9, A.wire);
        circ(g, root[0], root[1] - 0.005, 0.03, A.wire, L * 0.7);
        g.save();
        g.translate(hp[0], hp[1]);
        g.rotate(tilt);
        const ring = C.ellipsePts(0, 0, 0.36, 0.105, 36);
        C.poly(g, ring, { ink: A.ink, lw: 0.075 + 2 * L });
        C.poly(g, ring, { ink: A.halo, lw: 0.075 });
        C.poly(g, C.ellipsePts(0, 0.012, 0.36, 0.105, 18, 0, 0.25, Math.PI - 0.25), { ink: A.haloSide, lw: 0.03, close: false });
        C.poly(g, C.ellipsePts(0, -0.014, 0.36, 0.105, 12, 0, Math.PI + 0.5, Math.PI + 1.5), { ink: A.haloLight, lw: 0.026, close: false });
        g.restore();
        g.restore();
        // props in the mitts, then the arms
        if (prop && mood !== 'ears') {
            if (prop.kind === 'harp') harp(g, L, prop.x, prop.y + sitDy, prop.ang, prop.sc, pose.strum ?? 0);
            else trumpet(g, L, prop.x, prop.y + sitDy, prop.ang, prop.sc);
        }
        g.save();
        g.translate(0, sitDy);
        const shR = [T.x + 0.03, T.y + 0.13], shL = [T.x + T.w - 0.03, T.y + 0.13];
        sleeve(g, P, L, shL, hands.L);
        sleeve(g, P, L, shR, hands.R);
        g.restore();
        g.restore();
    }

    /**
     * A bank of cumulus to stand or sit on: a moonlit top, a darker underside, wisps trailing.
     *   x, y   the middle of its top, where feet go (a seat for a sitting angel);  s  figure scale
     *   o: { w (its width in figure units, default 3.2), t (seconds), bob (how much it bobs, default
     *        1), seed (a string: its shape and its phase), dawn (0..1 the dawn's colours),
     *        part ('back' the bank, 'front' the low lobes that hide the feet; default both) }
     * It bobs on twos; Skyward.bankBob(t, seed, bob) gives the offset in figure units to add to
     * whoever stands on it (cloudBank already moves itself by it). Draw part 'back', the people,
     * then part 'front'.
     */
    const bankBob = (t, seed = 'bank', bob = 1) => {
        const ph = Motion.rng('skyward-bank:' + seed)() * 24;
        return [0, 0.012, 0.03, 0.042, 0.03, 0.012, 0, -0.012][((Math.floor((C.drawing(t) + ph) / 2) % 8) + 8) % 8] * bob;
    };
    function cloudBank(g, x, y, s, o = {}) {
        const w = o.w ?? 3.2, seed = o.seed ?? 'bank', part = o.part ?? 'both', dawn = clamp(o.dawn ?? 0), L = 3.2 / s;
        const cols = { top: mix('#fffbe8', '#fff6d8', dawn), shade: mix('#dcd6f7', '#ffc9a0', dawn), under: mix('#b6aaee', '#f79ac0', dawn), deep: mix('#8f84d8', '#e56aa8', dawn) };
        const r = Motion.rng('skyward-bankshape:' + seed), n = Math.max(3, Math.round(w / 0.62)), lobes = [], lip = [], low = [];
        for (let i = 0; i < n; i++) {
            const u = n === 1 ? 0.5 : i / (n - 1), lx = (u - 0.5) * (w - 0.7), edge = Math.abs(u - 0.5) * 2, rr = 0.36 + 0.16 * r() - 0.08 * edge;
            lobes.push([lx + (r() - 0.5) * 0.1, 0.34 + 0.1 * edge - rr * 0.25 + 0.08 * r(), rr]);
            low.push([lx + (r() - 0.5) * 0.24, 0.62 + 0.12 * r() - 0.14 * edge, 0.3 + 0.14 * r() - 0.08 * edge]);
            const lr = 0.16 + 0.07 * r(), lo = (r() - 0.5) * 0.2;
            if (i < n - 1 && i % 2 === 0) lip.push([lx + (w - 0.7) / (n - 1) / 2 + lo, 0.2 + 0.04 * r(), lr]);
        }
        g.save();
        g.translate(x, y + bankBob(o.t ?? 0, seed, o.bob ?? 1) * s);
        g.scale(s, s);
        g.lineJoin = 'round';
        const blob = (list, fill, lw) => {
            const path = new Path2D();
            for (const [lx, ly, lr] of list) {
                path.moveTo(lx + lr, ly);
                path.arc(lx, ly, lr, 0, TAU);
            }
            if (lw > 0) {
                g.strokeStyle = K.ink;
                g.lineWidth = lw * 2;
                g.stroke(path);
            }
            g.fillStyle = fill;
            g.fill(path);
            return path;
        };
        if (part !== 'front') {
            // wisps trailing under it
            blob([[-w * 0.3, 1.08, 0.1], [-w * 0.3 + 0.14, 1.1, 0.07], [w * 0.22, 1.14, 0.09], [w * 0.22 - 0.12, 1.16, 0.06]], cols.under, L);
            const all = [...low, ...lobes, [-(w - 0.7) / 2 - 0.2, 0.52, 0.22], [(w - 0.7) / 2 + 0.2, 0.5, 0.24]];
            const path = blob(all, cols.top, L);
            g.save();
            g.clip(path);
            // the underside in two darker steps, each with a scalloped edge
            blob(low.map(([lx, ly, lr]) => [lx + 0.1, ly + 0.24, lr * 1.25]), cols.shade, 0);
            blob(low.map(([lx, ly, lr], i) => [lx + 0.16 + (i % 2) * 0.1, ly + 0.5, lr * 1.2]), cols.under, 0);
            g.restore();
            // a few lines of modelling on top
            for (let i = 0; i < lobes.length; i += 2) {
                const [lx, ly, lr] = lobes[i];
                g.beginPath();
                g.arc(lx, ly, lr * 0.62, Math.PI * 1.15, Math.PI * 1.75);
                g.strokeStyle = cols.shade;
                g.lineWidth = L * 1.1;
                g.stroke();
            }
        }
        if (part !== 'back') {
            // the lip: puffs in front of whoever stands here
            // a few small puffs, each with a smaller one at its shoulder
            blob(lip.flatMap(([lx, ly, lr], i) => [[lx, ly, lr], [lx + (i % 2 ? -1 : 1) * lr * 0.95, ly + lr * 0.3, lr * 0.62]]), cols.top, L);
        }
        g.restore();
    }

    /**
     * Set dressing for the cloud tops: a small gilded gate standing ajar and a lectern with a big
     * open book, a quill and an inkwell (no lettering: the pages are ruled).
     *   x, y   the ground under the gate's middle; the lectern stands 2.3 to its right
     *   o: { gate (default true), lectern (default true), ajar (0..1 how far the near leaf is
     *        open, default 0.6), lecternAt ([dx, dy] from x, y in figure units, default [2.3, 0]) }
     */
    function pearlyBits(g, x, y, s, o = {}) {
        const A = ANGEL, L = 3.2 / s, gold = { front: A.brass, top: A.brassTop, side: A.brassSide }, pearl = { front: '#fffdf4', top: '#ffffff', side: '#cfc8ee' };
        g.save();
        g.translate(x, y);
        g.scale(s, s);
        g.lineJoin = 'round';
        g.lineCap = 'round';
        if (o.gate !== false) {
            const ajar = clamp(o.ajar ?? 0.6), H = 2.2, W = 0.62;
            const pillar = (px) => {
                C.box(g, px - 0.2, -0.16, 0.4, 0.16, D, pearl, { lw: L, depth: 0.4 });
                C.box(g, px - 0.14, -H, 0.28, H - 0.16, D, pearl, { lw: L, depth: 0.28 });
                for (const fx of [-0.05, 0.05]) line(g, [[px + fx, -H + 0.12], [px + fx, -0.26]], L * 0.7, '#cfc8ee');
                C.box(g, px - 0.2, -H - 0.12, 0.4, 0.12, D, gold, { lw: L, depth: 0.4 });
                const c = ob(px, -H - 0.3, 0.2);
                circ(g, c[0], c[1], 0.17, '#fffdf4', L);
                circ(g, c[0] - 0.05, c[1] - 0.06, 0.045, '#ffffff');
                g.beginPath();
                g.arc(c[0], c[1], 0.11, 0.3, 1.5);
                g.strokeStyle = '#cfc8ee';
                g.lineWidth = L;
                g.stroke();
            };
            // a leaf of bars under an arched top rail, hinged at hx; open turns it away from us
            const leaf = (hx, dir, open) => {
                const dx = dir * W * Math.cos(open * 1.25), dz = W * Math.sin(open * 1.25) * 1.5;
                const at = (u, h) => [hx + dx * u + D[0] * dz * u, -h + D[1] * dz * u];
                const topAt = (u) => 1.55 + 0.42 * Math.sin((dir > 0 ? u : 1 - u) * Math.PI * 0.5);
                for (let i = 1; i <= 4; i++) {
                    const u = i / 5;
                    tube(g, [at(u, 0.14), at(u, topAt(u) + 0.12)], 0.035, A.brass, L * 0.7);
                    const tip = at(u, topAt(u) + 0.2);
                    C.poly(g, [[tip[0] - 0.04, tip[1] + 0.08], [tip[0], tip[1] - 0.04], [tip[0] + 0.04, tip[1] + 0.08]], { fill: A.brassTop, ink: K.ink, lw: L * 0.7 });
                }
                const rail = [];
                for (let i = 0; i <= 8; i++) rail.push(at(i / 8, topAt(i / 8)));
                tube(g, rail, 0.05, A.brass, L * 0.8);
                tube(g, [at(0, 0.14), at(1, 0.14)], 0.05, A.brass, L * 0.8);
                tube(g, [at(0, 0.9), at(1, 0.9)], 0.04, A.brass, L * 0.7);
                tube(g, [at(0, 0.08), at(0, topAt(0) + 0.02)], 0.055, A.brassTop, L * 0.8);
                tube(g, [at(1, 0.08), at(1, topAt(1) + 0.02)], 0.055, A.brassTop, L * 0.8);
                // a pearl where the rails cross, a ring for a handle
                for (const u of [0.3, 0.7]) {
                    const p = at(u, 0.9);
                    circ(g, p[0], p[1], 0.05, '#fffdf4', L * 0.7);
                }
                const hd = at(0.86, 1.05);
                circ(g, hd[0], hd[1], 0.06, null, L * 2.2);
                circ(g, hd[0], hd[1], 0.06, null, L, A.brassTop);
            };
            pillar(-W - 0.14);
            leaf(W + 0.0, -1, ajar);
            pillar(W + 0.14);
            leaf(-W, 1, 0);
        }
        if (o.lectern !== false) {
            const [lx, ly] = o.lecternAt ?? [2.3, 0];
            g.translate(lx, ly);
            // a foot, a fluted column, a sloping desk
            C.box(g, -0.34, -0.12, 0.68, 0.12, D, gold, { lw: L, depth: 0.5 });
            C.box(g, -0.14, -0.98, 0.28, 0.86, D, pearl, { lw: L, depth: 0.26 });
            for (const fx of [-0.05, 0.05]) line(g, [[fx, -0.94], [fx, -0.16]], L * 0.7, '#cfc8ee');
            C.box(g, -0.22, -1.06, 0.44, 0.08, D, gold, { lw: L, depth: 0.36 });
            const desk = [[-0.5, -1.06], [-0.5, -1.2], [0.5, -1.2], [0.5, -1.06]];
            C.prism(g, desk, Dd(0.7), gold, { lw: L });
            // the book lies open on it: a thick block of pages, a ribbon, ruled lines
            const z0 = 0.06, z1 = 0.64, pg = (u, z, h = 0) => [...ob(lerp(-0.44, 0.44, u), -1.2 - h, lerp(z0, z1, z))];
            C.prism(g, [[-0.46, -1.2], [-0.46, -1.3], [0.46, -1.3], [0.46, -1.2]], Dd(0.62), { front: '#7a1f2e', top: '#7a1f2e', side: '#55131f' }, { lw: L });
            C.poly(g, [[-0.44, -1.3], [-0.44, -1.36], [0.44, -1.36], [0.44, -1.3]], { fill: '#fff1c4', ink: K.ink, lw: L * 0.8 });
            for (const py of [-1.32, -1.34]) line(g, [[-0.43, py], [0.43, py]], L * 0.4, '#dcc690');
            const pageL = [pg(0, 0, 0.16), pg(0.5, 0, 0.1), pg(0.5, 1, 0.1), pg(0, 1, 0.16)], pageR = [pg(0.5, 0, 0.1), pg(1, 0, 0.16), pg(1, 1, 0.16), pg(0.5, 1, 0.1)];
            C.poly(g, pageL, { fill: '#fffdf4', ink: K.ink, lw: L * 0.9 });
            C.poly(g, pageR, { fill: '#fff6d8', ink: K.ink, lw: L * 0.9 });
            for (let i = 1; i <= 4; i++) {
                const z = i / 5;
                line(g, [pg(0.07, z, 0.152), pg(0.43, z, 0.108)], L * 0.6, '#b9b4dc');
                if (i < 4) line(g, [pg(0.57, z, 0.108), pg(i === 3 ? 0.76 : 0.93, z, 0.152)], L * 0.6, '#b9b4dc');
            }
            const rb = pg(0.5, 0, 0.1);
            C.poly(g, [[rb[0] - 0.03, rb[1]], [rb[0] + 0.03, rb[1]], [rb[0] + 0.03, rb[1] + 0.26], [rb[0], rb[1] + 0.21], [rb[0] - 0.03, rb[1] + 0.26]], { fill: '#f0352f', ink: K.ink, lw: L * 0.7 });
            // the quill in its inkwell, at the desk's far corner
            const iw = ob(0.58, -1.2, 0.5);
            C.box(g, iw[0] - 0.07, iw[1] - 0.12, 0.14, 0.12, D, { front: '#4a4470', top: '#625c8c', side: '#353055' }, { lw: L * 0.8, depth: 0.14 });
            const q0 = [iw[0] + 0.02, iw[1] - 0.12], qa = 0.5;
            const qp = (px, py) => {
                const p = rot([px, py], qa);
                return [q0[0] + p[0], q0[1] + p[1]];
            };
            C.poly(g, C.curve([[0, 0.02], [-0.07, -0.16], [-0.09, -0.38], [-0.03, -0.6], [0.05, -0.4], [0.07, -0.18]].map(([px, py]) => qp(px, py)), true, 5), { fill: '#fffdf4', ink: K.ink, lw: L * 0.8 });
            line(g, [qp(0, 0), qp(-0.01, -0.54)], L * 0.7, '#b9b4dc');
        }
        g.restore();
    }

    // =========================================================================================
    // Backstage: the Devil's dressing room
    // =========================================================================================
    const GILT = { front: '#ffc21f', top: '#ffe62e', side: '#c98a0e', deep: '#9a6408', light: '#fff1a8' };
    const ROOM = {
        wall: '#8a1a2c', wallB: '#7b1627', wallL: '#a82338', wallD: '#6a1221', motif: '#c9952a', rail: '#55301b', railTop: '#7b4526', railSide: '#3a2012', panel: '#6b3a20', panelD: '#472513',
        floor: '#3a0a14', board: '#4a121c', boardLine: '#2a0710', glow: '#ff8a2b',
        wood: '#7b4526', woodTop: '#a8683a', woodSide: '#55301b', iron: '#4a4470', ironTop: '#625c8c', ironSide: '#353055', chrome: '#c9cfe2', chromeTop: '#f4f6fc', chromeSide: '#7f879f',
        glass: '#bfe6f5', glassD: '#93cfe6', bulb: '#ffe62e', bulbCore: '#fffdf4', bulbOff: '#e0a800',
        rug: '#e0258b', rugIn: '#7d47e1', rugLine: '#ffc21f', rugDark: '#a8176a',
    };
    /**
     * Where things are in the dressing room (logical units of its 1000 × 1000 frame):
     *   nail      the empty nail in the middle of the wall of frames
     *   frame     the autograph's scale (Skyward.autograph's s) when it hangs there
     *   devil     a mark for him ([x, y], s = 200): centre stage, under the nail
     *   guitar    { x, y, s }: where the guitar's tail rests in the stand's cradle, and its scale
     *   floor     the y where the wall meets the floor;  tv, mirror, rack, trident: their middles
     */
    const BACKSTAGE = { nail: [500, 206], frame: 236, devil: [500, 940], devilS: 200, guitar: { x: 846, y: 842, s: 150 }, floor: 780, tv: [171, 716], mirror: [210, 378], rack: [832, 520], trident: [372, 610] };
    const A_W = 1.24, A_H = 1.08; // the framed autograph, in units of its s

    /**
     * The framed autograph: the Devil's contract (headed CONTRACT, small print, the line with its
     * cross, the wax seal) with what Tom wrote on it in blue ink, «To my #1 fan! — Tom», laid out
     * as in segments/sign.js, under glass in a gilt frame.
     *   x, y  the frame's middle;  s  logical units per unit (it is 1.24 × 1.08 units: s = 250 on
     *         the dressing-room wall, about 760 to fill the frame)
     *   o: { tilt (radians), wire (true: the hanging wire, up to a nail 0.6 … above the frame's top),
     *        glint (0..1: where the glint on the glass is, from left to right; default 0.3) }
     */
    function autograph(g, x, y, s, o = {}) {
        const L = Math.max(1.4, Math.min(3.6, 3.2 * (0.4 + s / 420))) / s, hw = A_W / 2, hh = A_H / 2, fw = 0.085, mat = 0.05;
        g.save();
        g.translate(x, y);
        g.scale(s, s);
        g.lineJoin = 'round';
        g.lineCap = 'round';
        if (o.wire) {
            const ny = -hh - 0.075;
            line(g, [[-hw * 0.62, -hh + 0.02], [0, ny], [hw * 0.62, -hh + 0.02]], L * 0.8, '#3a2012');
        }
        g.rotate(o.tilt ?? 0);
        // the moulding: a gilt box, an inner step, a line of beads, a leaf on each corner
        C.box(g, -hw, -hh, A_W, A_H, D, { front: GILT.front, top: GILT.top, side: GILT.side }, { lw: L, depth: 0.09 });
        const inner = [[-hw + fw, -hh + fw], [hw - fw, -hh + fw], [hw - fw, hh - fw], [-hw + fw, hh - fw]];
        // the bevel: lit on top and left, in shade below and right
        C.poly(g, [[-hw, -hh], [hw, -hh], inner[1], inner[0]], { fill: GILT.top, lw: 0 });
        C.poly(g, [[-hw, -hh], inner[0], inner[3], [-hw, hh]], { fill: GILT.light, lw: 0 });
        C.poly(g, [[hw, -hh], [hw, hh], inner[2], inner[1]], { fill: GILT.side, lw: 0 });
        C.poly(g, [[-hw, hh], inner[3], inner[2], [hw, hh]], { fill: GILT.deep, lw: 0 });
        const mid = fw * 0.5, ring = [[-hw + mid, -hh + mid], [hw - mid, -hh + mid], [hw - mid, hh - mid], [-hw + mid, hh - mid]];
        C.poly(g, ring, { ink: GILT.front, lw: fw * 0.42 });
        for (const [a, b] of [[[-hw, -hh], inner[0]], [[hw, -hh], inner[1]], [[hw, hh], inner[2]], [[-hw, hh], inner[3]]]) line(g, [a, b], L * 0.7, GILT.deep);
        if (s > 120) {
            const n = 15, m = 13;
            g.fillStyle = GILT.light;
            for (let i = 1; i < n; i++) for (const sy of [-1, 1]) circ(g, lerp(-hw + mid, hw - mid, i / n), sy * (hh - mid), fw * 0.1, sy < 0 ? GILT.light : GILT.side);
            for (let i = 1; i < m; i++) for (const sx of [-1, 1]) circ(g, sx * (hw - mid), lerp(-hh + mid, hh - mid, i / m), fw * 0.1, sx < 0 ? GILT.light : GILT.deep);
        }
        for (const [cx, cy] of ring) C.poly(g, [[cx, cy - fw * 0.42], [cx + fw * 0.42, cy], [cx, cy + fw * 0.42], [cx - fw * 0.42, cy]], { fill: GILT.top, ink: K.ink, lw: L * 0.7 });
        C.poly(g, [[-hw, -hh], [hw, -hh], [hw, hh], [-hw, hh]], { ink: K.ink, lw: L });
        // the mount, the sheet on it
        C.poly(g, inner, { fill: '#47228f', ink: K.ink, lw: L });
        const sx0 = -hw + fw + mat, sy0 = -hh + fw + mat, sw = A_W - 2 * (fw + mat), sh = A_H - 2 * (fw + mat);
        C.poly(g, [[sx0 + 0.012, sy0 + 0.014], [sx0 + sw + 0.012, sy0 + 0.014], [sx0 + sw + 0.012, sy0 + sh + 0.014], [sx0 + 0.012, sy0 + sh + 0.014]], { fill: '#2f1466', lw: 0 });
        C.poly(g, [[sx0, sy0], [sx0 + sw, sy0], [sx0 + sw, sy0 + sh], [sx0, sy0 + sh]], { fill: '#fff3d0', ink: K.ink, lw: L * 0.8 });
        g.save();
        g.beginPath();
        g.rect(sx0, sy0, sw, sh);
        g.clip();
        // the sheet's own drawing, in the units of segments/sign.js (the sheet 808 wide from x = 96, y = 296)
        const k = sw / 808;
        g.translate(sx0 - 96 * k, sy0 - 296 * k);
        g.scale(k, k);
        g.font = '104px "Anton"';
        g.textAlign = 'center';
        g.textBaseline = 'alphabetic';
        g.fillStyle = K.ink;
        [...'CONTRACT'].forEach((ch, i) => g.fillText(ch, 500 + (i - 3.5) * 82, 432));
        line(g, [[170, 454], [830, 454]], 6);
        line(g, [[170, 468], [830, 468]], 2.5);
        // small print: lines of dashes, and a red bar where the one word that mattered stood
        const r = Motion.rng('smallprint');
        let bar = false;
        for (let i = 0; i < 3; i++) {
            const py = 506 + i * 34;
            let px = 170;
            while (px < 820) {
                const w = 18 + r() * 60;
                if (i === 1 && px > 430 && !bar) {
                    bar = true;
                    line(g, [[px + 6, py], [px + 80, py]], 13, K.red);
                    px += 96;
                    continue;
                }
                line(g, [[px, py], [Math.min(830, px + w), py]], 4, '#8a6d3b');
                px += w + 12;
            }
        }
        // the line, its cross, the seal with its ribbons
        line(g, [[250, 812], [700, 812]], 5);
        line(g, [[176, 766], [222, 812]], 7);
        line(g, [[222, 766], [176, 812]], 7);
        C.poly(g, [[756, 800], [728, 930], [770, 904], [800, 940], [812, 800]], { fill: K.magenta, ink: K.ink, lw: 4 });
        C.poly(g, C.ellipsePts(784, 780, 70, 70, 12, 0.2).map(([px, py], i) => (i % 2 ? [784 + (px - 784) * 0.86, 780 + (py - 780) * 0.86] : [px, py])), { fill: '#c9182c', ink: K.ink, lw: 4 });
        circ(g, 784, 780, 40, null, 4, '#8f0f1f');
        for (const sx of [-1, 1]) C.poly(g, C.curve([[784 + sx * 6, 796], [784 + sx * 26, 786], [784 + sx * 22, 760], [784 + sx * 14, 778]], true, 5), { fill: '#8f0f1f', lw: 0 });
        // what Tom wrote, in blue ink
        g.font = '100px "Hand"';
        g.textAlign = 'left';
        g.fillStyle = '#2b3fd1';
        g.fillText('To my', 250, 700);
        g.fillText('#1 fan!', 478, 700);
        g.fillText('— Tom', 455, 800);
        g.restore();
        // the glass: two hard-edged glints across it
        g.save();
        C.trace(g, inner);
        g.clip();
        const gx = lerp(-hw, hw - 0.3, o.glint ?? 0.3);
        g.fillStyle = 'rgba(255,255,255,0.2)';
        for (const [dx, w] of [[0, 0.11], [0.17, 0.04]]) {
            g.beginPath();
            g.moveTo(gx + dx + 0.34, -hh);
            g.lineTo(gx + dx + 0.34 + w, -hh);
            g.lineTo(gx + dx + w - 0.2, hh);
            g.lineTo(gx + dx - 0.2, hh);
            g.closePath();
            g.fill();
        }
        g.restore();
        C.poly(g, inner, { ink: K.ink, lw: L });
        g.restore();
    }

    /**
     * Where the frame is while it goes up: fr = { k, tilt }. k 0 → 0.75 it rises from 190 units
     * under its place to a little above the nail; 0.75 → 1 it drops onto the nail and swings
     * to rest (tilt is added to the swing). Returns { x, y (its middle), tilt, s, hung (it is on
     * the nail), grips: [[x, y], [x, y]] (its lower corners, for the mitts that carry it) }.
     */
    function frameAt(fr = {}) {
        const k = clamp(fr.k ?? 1), s = BACKSTAGE.frame, [nx, ny] = BACKSTAGE.nail, rest = ny + (0.075 + A_H / 2) * s;
        const up = 1 - Math.pow(1 - seg(k, 0, 0.75), 2.4), set = seg(k, 0.75, 1);
        const y = rest + 190 * (1 - up) - 16 * up * (1 - smooth(set * 2.5));
        const tilt = (fr.tilt ?? 0) + (k < 0.75 ? -0.05 * (1 - up) : 0.085 * Math.sin(set * Math.PI * 3) * Math.pow(1 - set, 1.5));
        const c = Math.cos(tilt), sn = Math.sin(tilt), hw = (A_W / 2) * s, hh = (A_H / 2) * s;
        return { x: nx, y, tilt, s, hung: k >= 0.75, grips: [[nx - hw * c - hh * sn, y - hw * sn + hh * c], [nx + hw * c - hh * sn, y + hw * sn + hh * c]] };
    }

    // one of the framed things on the wall: [kind, x, y, w, h, tilt, moulding]
    const FRAMES = [
        ['record', 104, 84, 112, 112, 0.03, 'gilt'], ['imps', 236, 100, 100, 84, -0.04, 'dark'], ['moon', 366, 92, 92, 104, 0.02, 'wood'], ['cactus', 548, 86, 86, 108, -0.03, 'gilt'],
        ['snow', 662, 104, 80, 80, 0.05, 'dark'], ['scroll', 768, 90, 124, 92, -0.02, 'wood'], ['heart', 694, 214, 96, 112, 0.03, 'wood'], ['forks', 812, 204, 118, 96, -0.03, 'gilt'],
    ];
    function wallFrame(g, [kind, x, y, w, h, tilt, mould]) {
        const cols = { gilt: { front: GILT.front, top: GILT.top, side: GILT.side }, dark: { front: ROOM.iron, top: ROOM.ironTop, side: ROOM.ironSide }, wood: { front: ROOM.wood, top: ROOM.woodTop, side: ROOM.woodSide } }[mould];
        const f = 9, cx = x + w / 2, cy = y + h / 2;
        g.save();
        g.translate(cx, cy);
        g.rotate(tilt);
        g.translate(-cx, -cy);
        C.box(g, x, y, w, h, [5, -3.4], cols, { lw: 3 });
        C.poly(g, [[x, y], [x + w, y], [x + w - f, y + f], [x + f, y + f]], { fill: cols.top, lw: 0 });
        C.poly(g, [[x + w, y], [x + w, y + h], [x + w - f, y + h - f], [x + w - f, y + f]], { fill: cols.side, lw: 0 });
        C.poly(g, [[x, y], [x + w, y], [x + w, y + h], [x, y + h]], { ink: K.ink, lw: 3 });
        const ix = x + f, iy = y + f, iw = w - 2 * f, ih = h - 2 * f, mx = ix + iw / 2, my = iy + ih / 2;
        const bg = { record: '#2a2438', imps: '#ffc21f', moon: '#1b1750', cactus: '#48cfe0', snow: '#8fc4f2', scroll: '#fff3d0', heart: '#fff1c4', forks: '#6a37cc' }[kind];
        C.poly(g, [[ix, iy], [ix + iw, iy], [ix + iw, iy + ih], [ix, iy + ih]], { fill: bg, ink: K.ink, lw: 2.4 });
        g.save();
        g.beginPath();
        g.rect(ix, iy, iw, ih);
        g.clip();
        if (kind === 'record') {
            // a gold record
            circ(g, mx, my, 38, GILT.front, 2.4);
            for (const rr of [31, 25, 19]) circ(g, mx, my, rr, null, 1.4, GILT.side);
            circ(g, mx, my, 13, K.red, 2);
            circ(g, mx, my, 3, '#2a2438');
            line(g, [[mx - 26, my - 20], [mx - 14, my - 28]], 3, GILT.light);
        } else if (kind === 'imps') {
            // the staff, in a row
            [-28, 0, 28].forEach((dx, i) => {
                C.box(g, mx + dx - 11, my - 4, 22, 20, [4, -2.7], { front: '#e8392f', top: '#ff6f59', side: '#b0211f' }, { lw: 2 });
                for (const sx of [-1, 1]) {
                    C.poly(g, [[mx + dx + sx * 8 - 3, my - 4], [mx + dx + sx * 9, my - 12], [mx + dx + sx * 8 + 3, my - 4]], { fill: '#fff1c4', ink: K.ink, lw: 1.4 });
                    g.fillStyle = '#ffe62e';
                    g.fillRect(mx + dx + sx * 5 - 3, my + 1, 6, 6);
                    g.fillStyle = '#1d1626';
                    g.fillRect(mx + dx + sx * 5 - 1, my + 2, 2, 4);
                }
                line(g, [[mx + dx - 4, my + 11], [mx + dx, my + 13], [mx + dx + 4, my + 11]], 1.4);
                if (i === 1) C.poly(g, [[mx - 9, my - 5], [mx - 7, my - 13], [mx, my - 16], [mx + 7, my - 13], [mx + 9, my - 5]], { fill: '#ffe62e', ink: K.ink, lw: 1.4 });
            });
            g.fillStyle = '#e0a800';
            g.fillRect(ix, my + 16, iw, ih);
        } else if (kind === 'moon') {
            moon(g, mx, my - 4, 26, {});
            for (const [dx, dy] of [[-28, -30], [26, -34], [30, 20], [-30, 16]]) C.sparkle(g, mx + dx, my + dy, 5, { color: '#fffbe8' });
            g.fillStyle = '#4a3fc0';
            g.fillRect(ix, iy + ih - 14, iw, 14);
        } else if (kind === 'cactus') {
            // the cactus in shades, at the wheel no more
            g.fillStyle = '#ffc21f';
            g.fillRect(ix, iy + ih - 20, iw, 20);
            line(g, [[ix, iy + ih - 20], [ix + iw, iy + ih - 20]], 2);
            g.save();
            g.translate(mx, iy + ih - 12);
            saguaro(g, { cactus: K.teal, cactusTop: K.aqua, cactusSide: K.tealDeep }, 2.2, 62, 1);
            g.restore();
            for (const sx of [-1, 1]) rrect(g, mx + sx * 5 - 4.5, iy + ih - 62, 9, 6, 1.5, '#1d1626', 1.2);
            line(g, [[mx - 1, iy + ih - 60], [mx + 1, iy + ih - 60]], 1.6);
        } else if (kind === 'snow') {
            // a snowflake: the day Hell froze over
            for (let i = 0; i < 6; i++) {
                const a = (i / 6) * TAU, c = Math.cos(a), sn = Math.sin(a);
                line(g, [[mx, my], [mx + c * 24, my + sn * 24]], 3.4, '#fffdf4');
                for (const sd of [-1, 1]) line(g, [[mx + c * 14, my + sn * 14], [mx + c * 14 + Math.cos(a + sd * 0.9) * 8, my + sn * 14 + Math.sin(a + sd * 0.9) * 8]], 2.6, '#fffdf4');
            }
            circ(g, mx, my, 4, '#fffdf4');
        } else if (kind === 'scroll') {
            // a certificate: ruled lines and a seal
            for (let i = 0; i < 5; i++) line(g, [[ix + 12, iy + 14 + i * 11], [ix + iw - (i === 4 ? 50 : 12), iy + 14 + i * 11]], i === 0 ? 3.4 : 2, i === 0 ? K.ink : '#8a6d3b');
            C.poly(g, [[ix + iw - 28, iy + ih - 22], [ix + iw - 32, iy + ih - 2], [ix + iw - 24, iy + ih - 8], [ix + iw - 16, iy + ih - 2], [ix + iw - 20, iy + ih - 22]], { fill: K.magenta, ink: K.ink, lw: 1.6 });
            circ(g, ix + iw - 24, iy + ih - 24, 10, '#c9182c', 2);
        } else if (kind === 'heart') {
            // a sampler: a heart with little horns, in cross-stitch, a border of stitches
            const hp = C.curve([[mx, my + 24], [mx - 26, my - 2], [mx - 22, my - 22], [mx - 8, my - 22], [mx, my - 10], [mx + 8, my - 22], [mx + 22, my - 22], [mx + 26, my - 2]], true, 6);
            for (const sx of [-1, 1]) C.poly(g, [[mx + sx * 12, my - 22], [mx + sx * 22, my - 36], [mx + sx * 21, my - 20]], { fill: '#fff1c4', ink: K.ink, lw: 1.6 });
            C.poly(g, hp, { fill: K.red, ink: K.ink, lw: 2.2 });
            line(g, [[mx - 14, my - 12], [mx - 8, my - 16]], 2.4, '#ff9c8f');
            g.setLineDash([4, 4]);
            g.strokeStyle = K.magenta;
            g.lineWidth = 2;
            g.strokeRect(ix + 7, iy + 7, iw - 14, ih - 14);
            g.setLineDash([]);
        } else {
            // crossed forks on purple, a gold star over them
            for (const sx of [-1, 1]) {
                g.save();
                g.translate(mx, my + 6);
                g.rotate(sx * 0.7);
                line(g, [[0, 30], [0, -18]], 5);
                line(g, [[0, 30], [0, -18]], 2.4, '#c9cfe2');
                C.poly(g, [[-10, -30], [-10, -18], [10, -18], [10, -30], [6, -30], [6, -22], [2, -22], [2, -34], [-2, -34], [-2, -22], [-6, -22], [-6, -30]], { fill: '#c9cfe2', ink: K.ink, lw: 1.6 });
                g.restore();
            }
            C.sparkle(g, mx, iy + 14, 8, { color: '#ffe62e', ink: K.ink, lw: 1.4, pinch: 0.42 });
        }
        g.restore();
        C.poly(g, [[ix, iy], [ix + iw, iy], [ix + iw, iy + ih], [ix, iy + ih]], { ink: K.ink, lw: 2.4 });
        // the glass
        g.save();
        g.beginPath();
        g.rect(ix, iy, iw, ih);
        g.clip();
        C.poly(g, [[ix + iw * 0.55, iy], [ix + iw * 0.75, iy], [ix + iw * 0.35, iy + ih], [ix + iw * 0.15, iy + ih]], { fill: 'rgba(255,255,255,0.16)', lw: 0 });
        g.restore();
        g.restore();
    }
    // one of his tailcoats on its hanger; (x, y) is where the hook sits on the rail
    function tailcoat(g, x, y) {
        const P = Devil.P, w = 31;
        line(g, C.curve([[x, y + 22], [x, y + 8], [x + 7, y + 2], [x + 3, y - 7], [x - 5, y - 4]], false, 5), 2.6, ROOM.chromeSide);
        const body = [[x - 9, y + 22], [x + 9, y + 22], [x + w, y + 38], [x + w - 1, y + 150], [x + w - 5, y + 200], [x + w - 15, y + 268], [x + 6, y + 260], [x, y + 172], [x - 6, y + 260], [x - w + 15, y + 268], [x - w + 5, y + 200], [x - w + 1, y + 150], [x - w, y + 38]];
        C.prism(g, body, [10, -6.7], { front: P.suit, top: P.suitTop, side: P.suitSide }, { lw: 3 });
        // the lining in the opening, the lapels, a button, a pocket square
        C.poly(g, [[x - 9, y + 22], [x + 9, y + 22], [x + 3, y + 104], [x - 3, y + 104]], { fill: P.suitSide, ink: K.ink, lw: 2.2 });
        for (const sx of [-1, 1]) {
            C.poly(g, [[x + sx * 9, y + 22], [x + sx * 19, y + 28], [x + sx * 20, y + 44], [x + sx * 24, y + 53], [x + sx * 15, y + 64], [x + sx * 3, y + 104]], { fill: P.lapel, ink: K.ink, lw: 2.2 });
            line(g, [[x + sx * 13, y + 36], [x + sx * 6, y + 82]], 1.8, P.lapelDark);
        }
        line(g, [[x, y + 104], [x, y + 172]], 2.2);
        circ(g, x, y + 116, 4, P.button, 1.8);
        C.poly(g, [[x + 14, y + 86], [x + 17, y + 79], [x + 20, y + 84], [x + 23, y + 78], [x + 26, y + 86]], { fill: P.shirt, ink: K.ink, lw: 1.5 });
        line(g, [[x + 13, y + 86], [x + 27, y + 86]], 1.8);
    }

    // everything in the room that never moves
    function roomStill(g) {
        const R = ROOM, FL = BACKSTAGE.floor;
        g.lineJoin = 'round';
        g.lineCap = 'round';
        // --- the wall: papered in two reds with a little gold fork repeated on it
        g.fillStyle = R.wall;
        g.fillRect(-60, -60, 1120, FL + 60);
        g.fillStyle = R.wallB;
        for (let x = -60; x < 1060; x += 96) g.fillRect(x, -60, 48, FL + 60);
        for (let j = 0; j < 9; j++) {
            for (let i = 0; i < 12; i++) {
                const mx = -36 + i * 96 + (j % 2) * 48, my = 44 + j * 66;
                line(g, [[mx, my + 9], [mx, my - 5]], 2.2, R.motif);
                line(g, [[mx - 6, my - 10], [mx - 6, my - 4], [mx + 6, my - 4], [mx + 6, my - 10]], 2.2, R.motif);
                line(g, [[mx, my - 4], [mx, my - 12]], 2.2, R.motif);
            }
        }
        // Hell shows through at the top: a row of stalactites, a crack that glows
        const rs = Motion.rng('skyward-stal');
        for (let x = -40; x < 1050; x += 60 + rs() * 44) {
            const w = 24 + rs() * 22, h = 26 + rs() * 40;
            C.prism(g, [[x - w, -8], [x + w, -8], [x, h]], [7, -5], { front: R.wallD, top: R.wallD, side: '#4a0c17' }, { lw: 4 });
        }
        // --- the dado: dark panelling under a rail
        C.box(g, -60, 610, 1120, FL - 610, [0, 0], { front: R.panel }, { lw: 0 });
        for (let x = -20; x < 1040; x += 132) {
            rrect(g, x + 14, 646, 104, FL - 646 - 22, 4, R.panelD, 3);
            line(g, [[x + 22, 656], [x + 108, 656]], 2.4, R.railTop);
        }
        C.box(g, -60, 600, 1120, 20, [10, -7], { front: R.rail, top: R.railTop, side: R.railSide }, { lw: 4 });
        // --- the floor: boards, a skirting line
        g.fillStyle = R.board;
        g.fillRect(-60, FL, 1120, 300);
        for (let j = 0; j < 5; j++) {
            const y = FL + 14 + j * j * 7 + j * 26;
            line(g, [[-60, y], [1060, y]], 2.6, R.boardLine);
            for (let x = -60 + ((j * 170) % 240); x < 1060; x += 240) line(g, [[x, y], [x - 12, y - (j ? 26 + (j - 1) * 14 : 14)]], 2.6, R.boardLine);
        }
        line(g, [[-60, FL], [1060, FL]], 5);
        // --- the rug he stands on
        oval(g, 500, 902, 286, 62, R.rugDark, 4);
        oval(g, 500, 896, 286, 62, R.rug, 4);
        oval(g, 500, 896, 240, 48, null, 5, R.rugLine);
        oval(g, 500, 896, 206, 38, R.rugIn, 3);
        const zig = [];
        for (let i = 0; i <= 40; i++) {
            const a = (i / 40) * TAU, k = i % 2 ? 0.86 : 0.7;
            zig.push([500 + Math.cos(a) * 206 * k, 896 + Math.sin(a) * 38 * k]);
        }
        C.poly(g, zig, { fill: R.rug, ink: K.ink, lw: 2.4 });
        C.sparkle(g, 500, 896, 30, { color: R.rugLine, ink: K.ink, lw: 2.4, pinch: 0.5 });
        for (let i = 0; i <= 24; i++) {
            const a = Math.PI * (0.06 + (0.88 * i) / 24), px = 500 + Math.cos(a) * 286, py = 896 + Math.sin(a) * 62;
            line(g, [[px, py + 6], [px + Math.cos(a) * 5, py + 17]], 2.6, R.rugLine);
        }
        // --- the wall of framed things, an empty nail in the middle
        FRAMES.forEach((f) => wallFrame(g, f));
        // --- the coat rail: a row of identical tailcoats
        const rx0 = 724, rx1 = 946, ry = 372, chromeC = { front: R.chrome, top: R.chromeTop, side: R.chromeSide };
        for (const px of [rx0, rx1]) {
            C.box(g, px - 5 + 12, ry - 8, 10, FL + 26 - ry, [5, -3.4], chromeC, { lw: 3 });
            C.box(g, px - 26 + 12, FL + 20 - 8, 52, 10, [18, -12], chromeC, { lw: 3 });
        }
        for (let i = 4; i >= 0; i--) tailcoat(g, rx0 + 48 + i * 42, ry);
        tube(g, [[rx0 + 12, ry - 2], [rx1 + 12, ry - 2]], 8, R.chrome, 3);
        line(g, [[rx0 + 16, ry - 4], [rx1 + 8, ry - 4]], 2, R.chromeTop);
        for (const px of [rx0, rx1]) {
            C.box(g, px - 5, ry - 2, 10, FL + 26 - ry, [5, -3.4], chromeC, { lw: 3 });
            for (const cx of [px - 18, px + 22]) circ(g, cx, FL + 34, 8, R.iron, 3);
        }
        // --- the dressing table and its mirror
        const woodC = { front: R.wood, top: R.woodTop, side: R.woodSide };
        const mx0 = 104, my0 = 240, mw = 212, mh = 284;
        C.box(g, mx0 - 16, my0 - 16, mw + 32, mh + 32, [8, -5.4], woodC, { lw: 4 });
        rrect(g, mx0, my0, mw, mh, 6, R.glass, 3.2);
        g.save();
        g.beginPath();
        g.roundRect(mx0, my0, mw, mh, 6);
        g.clip();
        // what it shows: the room's other wall, paler towards the floor; two glints
        g.fillStyle = '#9fd3ea';
        g.fillRect(mx0, my0 + mh * 0.62, mw, mh);
        for (const [dx, w] of [[20, 26], [58, 9]]) C.poly(g, [[mx0 + dx + 60, my0], [mx0 + dx + 60 + w, my0], [mx0 + dx + w - 30, my0 + mh], [mx0 + dx - 30, my0 + mh]], { fill: 'rgba(255,255,255,0.5)', lw: 0 });
        g.restore();
        rrect(g, mx0, my0, mw, mh, 6, null, 3.2);
        // the table: a top, a drawer front with two drawers, legs
        for (const lx of [100, 308]) C.box(g, lx, 590, 14, FL + 14 - 590, [5, -3.4], woodC, { lw: 3 });
        C.box(g, 94, 568, 236, 52, [16, -11], woodC, { lw: 4 });
        for (const dx of [104, 216]) {
            rrect(g, dx, 577, 104, 34, 3, R.woodSide, 2.6);
            circ(g, dx + 52, 594, 6, GILT.front, 2.2);
        }
        C.box(g, 84, 552, 256, 16, [22, -15], { front: R.woodTop, top: '#c98852', side: R.wood }, { lw: 4 });
        // on it: a jar of pomade, a comb, a tin of moustache wax, a spotted bow tie
        C.box(g, 108, 520, 40, 30, [8, -5.4], { front: '#2a2438', top: '#4a4470', side: '#1c1727' }, { lw: 3 });
        C.box(g, 105, 512, 46, 10, [9, -6], { front: GILT.front, top: GILT.top, side: GILT.side }, { lw: 2.6 });
        rrect(g, 116, 528, 24, 14, 2, '#e0258b', 1.8);
        C.poly(g, [[166, 541], [226, 541], [226, 548], [166, 548]], { fill: K.yellow, ink: K.ink, lw: 2.2 });
        for (let cx = 170; cx < 226; cx += 6) line(g, [[cx, 548], [cx, 556]], 2.2, K.ink);
        const bt = [286, 540];
        for (const sx of [-1, 1]) {
            C.poly(g, [[bt[0] + sx * 4, bt[1] - 3], [bt[0] + sx * 24, bt[1] - 11], [bt[0] + sx * 25, bt[1] + 10], [bt[0] + sx * 4, bt[1] + 3]], { fill: Devil.P.tie, ink: K.ink, lw: 2.2 });
            for (const [dx, dy] of [[11, -2], [18, 3]]) circ(g, bt[0] + sx * dx, bt[1] + dy, 1.8, Devil.P.lapel);
        }
        rrect(g, bt[0] - 5, bt[1] - 5, 10, 10, 2, Devil.P.tieDark, 2);
        // --- the umbrella stand: his trident in it, and an umbrella
        const ux = 372, uy = FL + 22;
        oval(g, ux, uy - 92, 30, 9, R.ironSide, 3);
        g.save();
        g.translate(ux + 8, uy - 196);
        g.scale(150, 150);
        Devil.trident(g, 0, 0, 3.2 / 150, { ang: 0.1, len: 2.3, grip: 1.26 });
        g.restore();
        // a furled umbrella: a hooked handle, a tight roll of cloth, a tip
        const um = (u) => [ux - 14 - u * 26, uy - 12 - u * 250];
        line(g, C.curve([um(0.86), um(1.0), [um(1.04)[0] - 12, um(1.04)[1] - 2], [um(0.98)[0] - 20, um(0.98)[1] + 10]], false, 6), 8.5);
        line(g, C.curve([um(0.86), um(1.0), [um(1.04)[0] - 12, um(1.04)[1] - 2], [um(0.98)[0] - 20, um(0.98)[1] + 10]], false, 6), 4, '#a8683a');
        C.poly(g, [[um(0.86)[0] - 6, um(0.86)[1]], [um(0.86)[0] + 6, um(0.86)[1] + 1], [um(0.3)[0] + 13, um(0.3)[1]], [um(0)[0] + 3, um(0)[1]], [um(0)[0] - 3, um(0)[1]], [um(0.3)[0] - 11, um(0.3)[1] - 2]], { fill: '#2a2438', ink: K.ink, lw: 3 });
        line(g, [[um(0.8)[0] - 2, um(0.8)[1]], [um(0.34)[0] + 4, um(0.34)[1]]], 2, '#4a4470');
        line(g, [[um(0.58)[0] - 9, um(0.58)[1]], [um(0.58)[0] + 10, um(0.58)[1] + 2]], 3, '#e0258b');
        // the stand in front of what is in it: a drum with two gold bands
        const drumPts = [[ux - 30, uy - 92], ...C.ellipsePts(ux, uy, 30, 9, 16, 0, Math.PI, 0).reverse(), [ux + 30, uy - 92]];
        C.poly(g, [[ux - 30, uy - 92], [ux - 30, uy], ...C.ellipsePts(ux, uy, 30, 9, 16, 0, Math.PI, 0).reverse().slice(1, -1), [ux + 30, uy], [ux + 30, uy - 92], ...C.ellipsePts(ux, uy - 92, 30, 9, 16, 0, 0, Math.PI).slice(1, -1)], { fill: R.iron, ink: K.ink, lw: 3 });
        g.save();
        C.trace(g, [[ux - 30, uy - 92], [ux - 30, uy], ...C.ellipsePts(ux, uy, 30, 9, 16, 0, Math.PI, 0).reverse().slice(1, -1), [ux + 30, uy], [ux + 30, uy - 92], ...C.ellipsePts(ux, uy - 92, 30, 9, 16, 0, 0, Math.PI).slice(1, -1)]);
        g.clip();
        g.fillStyle = R.ironSide;
        g.fillRect(ux + 12, uy - 100, 30, 120);
        g.fillStyle = R.ironTop;
        g.fillRect(ux - 22, uy - 100, 8, 120);
        for (const by of [70, 18]) C.poly(g, C.ellipsePts(ux, uy - by, 30, 9, 16, 0, 0, Math.PI), { ink: K.ink, lw: 9, close: false });
        for (const by of [70, 18]) C.poly(g, C.ellipsePts(ux, uy - by, 30, 9, 16, 0, 0, Math.PI), { ink: GILT.front, lw: 4.6, close: false });
        g.restore();
        void drumPts;
        // --- the TV on its trolley, the VCR under it, tapes on the shelf
        const tx = 84, ty = 838; // the trolley's top, front left
        for (const lx of [tx + 4, tx + 164]) C.box(g, lx, ty + 8, 10, 72, [4, -2.7], chromeC, { lw: 3 });
        C.box(g, tx, ty + 60, 178, 9, [26, -17], woodC, { lw: 3 });
        // three tapes on the lower shelf, their labels blank
        [[tx + 30, 0], [tx + 36, -15], [tx + 100, 0]].forEach(([px, dy], i) => {
            C.box(g, px, ty + 44 + dy, 58, 15, [13, -9], { front: '#2a2438', top: '#4a4470', side: '#1c1727' }, { lw: 2.4 });
            rrect(g, px + 6, ty + 47 + dy, 40, 9, 1.5, i === 1 ? '#fff1c4' : '#fffdf4', 1.4);
            line(g, [[px + 10, ty + 51.5 + dy], [px + 34, ty + 51.5 + dy]], 1.6, i === 1 ? K.red : K.blue);
        });
        for (const cx of [tx + 10, tx + 170]) circ(g, cx, ty + 88, 8, R.iron, 3);
        C.box(g, tx - 6, ty, 190, 10, [28, -19], woodC, { lw: 4 });
        // the VCR: a slot with its flap, buttons, two lights
        const vy = ty - 34;
        C.box(g, tx + 4, vy, 168, 34, [22, -15], { front: '#2a2438', top: '#4a4470', side: '#1c1727' }, { lw: 3.2 });
        rrect(g, tx + 14, vy + 7, 84, 13, 2, '#15101d', 2);
        line(g, [[tx + 18, vy + 11], [tx + 94, vy + 11]], 2, '#4a4470');
        for (let i = 0; i < 4; i++) rrect(g, tx + 108 + i * 14, vy + 20, 10, 6, 1.5, '#8d95ad', 1.4);
        // the TV: a set with a rounded screen, a speaker, two knobs, rabbit ears
        const sy0 = vy - 124;
        line(g, [[tx + 96, sy0 - 4], [tx + 60, sy0 - 62]], 5);
        line(g, [[tx + 96, sy0 - 4], [tx + 60, sy0 - 62]], 2.2, R.chrome);
        line(g, [[tx + 104, sy0 - 4], [tx + 150, sy0 - 54]], 5);
        line(g, [[tx + 104, sy0 - 4], [tx + 150, sy0 - 54]], 2.2, R.chrome);
        circ(g, tx + 60, sy0 - 62, 4.5, R.chromeTop, 2);
        circ(g, tx + 150, sy0 - 54, 4.5, R.chromeTop, 2);
        C.box(g, tx + 8, sy0, 160, 124, [22, -15], { front: R.iron, top: R.ironTop, side: R.ironSide }, { lw: 4 });
        rrect(g, tx + 86, sy0 - 9, 26, 9, 3, R.ironSide, 2.4);
        rrect(g, tx + 16, sy0 + 10, 112, 96, 5, '#1c1727', 2.4);
        for (let i = 0; i < 5; i++) line(g, [[tx + 138, sy0 + 62 + i * 9], [tx + 160, sy0 + 62 + i * 9]], 2.6, R.ironSide);
        for (const ky of [22, 44]) {
            circ(g, tx + 149, sy0 + ky, 8, R.chrome, 2.4);
            line(g, [[tx + 149, sy0 + ky], [tx + 153, sy0 + ky - 5]], 2);
        }
        for (const fx of [tx + 18, tx + 150]) C.box(g, fx, sy0 + 124, 12, 5, [3, -2], { front: R.ironSide }, { lw: 2 });
        // --- the guitar stand: a tripod, a cradle of two padded arms, a yoke for the neck
        const G = BACKSTAGE.guitar, gs = G.s;
        const leg = (pts) => {
            line(g, pts, 9);
            line(g, pts, 4.4, R.chrome);
        };
        leg([[G.x + 6, G.y - 1.3 * gs], [G.x + 46, G.y + 46]]);
        leg([[G.x, G.y - 1.3 * gs], [G.x - 44, G.y + 52]]);
        leg([[G.x + 2, G.y - 1.3 * gs], [G.x + 8, G.y + 60]]);
        leg([[G.x + 3, G.y - 1.86 * gs], [G.x + 3, G.y - 1.25 * gs]]);
        for (const [fx, fy] of [[G.x + 46, G.y + 46], [G.x - 44, G.y + 52], [G.x + 8, G.y + 60]]) rrect(g, fx - 9, fy - 4, 18, 9, 3, '#2a2438', 2.2);
        leg([[G.x - 40, G.y + 4], [G.x - 34, G.y + 12], [G.x + 40, G.y + 12], [G.x + 46, G.y + 4]]);
        for (const fx of [G.x - 40, G.y * 0 + G.x + 46]) rrect(g, fx - 6, G.y - 8, 12, 15, 4, '#2a2438', 2.2);
    }

    /**
     * The Devil's dressing room: a whole 1000 × 1000 set in Hell's reds, but cosy. Papered wall
     * and dado; a mirror with bulbs round it over his dressing table (pomade, comb, bow tie); his
     * trident in the umbrella stand; a wall of framed things (a gold record, the staff, the moon,
     * the cactus in shades, a snowflake, a certificate, a sampler, crossed forks) with one empty
     * nail in the middle; a rail of identical purple tailcoats; his flaming guitar on its stand;
     * a little TV on a trolley with the VCR under it, showing the VCR's blue; a rug to stand on.
     *   o: { frame   { k, tilt }: the framed autograph on its way up to the nail (see
     *                Skyward.frameAt, which says where it is and where to hold it); omit it and
     *                the nail is bare. Draw whoever carries it AFTER the room: pass `frame:
     *                null` here and draw Skyward.autograph yourself between the Devil's body
     *                and his mitts if it must be held properly (frameAt gives x, y, tilt, s).
     *        flames  0..1 the fire on the guitar (default 0.7)
     *        guitar  (g, x, y, s) => …  draws the guitar instead of Inferno.guitar: (x, y) is where
     *                its tail rests in the cradle, s its scale; the neck goes up into the yoke
     *        bulbs   0..1 the mirror's bulbs (default 1; they twinkle on twos)
     *        tv      'blue' (default) | 'off'
     *        cache   false paints the still part every frame instead of once per output scale }
     * Places: Skyward.BACKSTAGE (nail, devil's mark, guitar, floor…).
     */
    function backstage(g, t, o = {}) {
        const R = ROOM, d = C.drawing(t), G = BACKSTAGE.guitar;
        g.save();
        if (o.cache === false) roomStill(g);
        else cached(g, 'backstage', { x: -60, y: -60, w: 1120, h: 1120 }, roomStill);
        g.lineJoin = 'round';
        g.lineCap = 'round';
        // the nail
        const [nx, ny] = BACKSTAGE.nail;
        line(g, [[nx + 2, ny + 3], [nx + 9, ny + 11]], 3, R.wallD);
        circ(g, nx, ny, 5.5, R.chrome, 2.4);
        circ(g, nx - 1.5, ny - 1.5, 1.8, R.chromeTop);
        if (o.frame) {
            const F = frameAt(o.frame);
            if (F.hung) {
                // its wire runs up to the nail
                const c = Math.cos(F.tilt), sn = Math.sin(F.tilt), hh = (A_H / 2) * F.s, hw = (A_W / 2) * 0.62 * F.s;
                line(g, [[F.x - hw * c + hh * sn, F.y - hw * sn - hh * c], [nx, ny], [F.x + hw * c + hh * sn, F.y + hw * sn - hh * c]], 2.6, '#3a2012');
            }
            autograph(g, F.x, F.y, F.s, { tilt: F.tilt });
            if (F.hung) circ(g, nx, ny, 5.5, R.chrome, 2.4);
        }
        // the mirror's bulbs: five along the top, four down each side
        const bk = clamp(o.bulbs ?? 1), mx0 = 104, my0 = 240, mw = 212, mh = 284, bulbs = [];
        for (let i = 0; i < 5; i++) bulbs.push([mx0 + 6 + (i * (mw - 12)) / 4, my0 - 8]);
        for (let i = 1; i <= 4; i++) bulbs.push([mx0 - 8, my0 - 8 + (i * (mh - 20)) / 4], [mx0 + mw + 8, my0 - 8 + (i * (mh - 20)) / 4]);
        bulbs.forEach(([bx, by], i) => {
            const lit = bk > i / 13 - 0.001 && bk > 0, tw = lit && (d + i * 5) % 18 < 2;
            circ(g, bx, by, 12, lit ? (tw ? R.bulbCore : R.bulb) : R.bulbOff, 3);
            if (lit) circ(g, bx - 3, by - 3.5, 4, R.bulbCore);
            else line(g, [[bx - 4, by + 2], [bx, by - 3], [bx + 4, by + 2]], 1.6, '#9a6408');
        });
        // the TV's screen: the VCR's blue, a band of brighter lines that rolls on twos
        const tx = 84, sy0 = 838 - 34 - 124;
        g.save();
        g.beginPath();
        g.roundRect(tx + 20, sy0 + 14, 104, 88, 12);
        g.clip();
        g.fillStyle = o.tv === 'off' ? '#2a2438' : K.vcrBlue;
        g.fillRect(tx + 20, sy0 + 14, 104, 88);
        if (o.tv !== 'off') {
            const by = sy0 + 14 + ((d * 7) % 100);
            g.fillStyle = '#3b40f0';
            g.fillRect(tx + 20, by, 104, 9);
            g.fillRect(tx + 20, by - 100, 104, 9);
        }
        C.poly(g, [[tx + 34, sy0 + 20], [tx + 52, sy0 + 20], [tx + 36, sy0 + 50], [tx + 26, sy0 + 50]], { fill: 'rgba(255,255,255,0.28)', lw: 0 });
        g.restore();
        g.beginPath();
        g.roundRect(tx + 20, sy0 + 14, 104, 88, 12);
        g.strokeStyle = K.ink;
        g.lineWidth = 2.6;
        g.stroke();
        // the VCR's lights: play is on
        circ(g, tx + 110, 838 - 34 + 10, 3, o.tv === 'off' ? '#4a4470' : K.green, 1.2);
        circ(g, tx + 122, 838 - 34 + 10, 3, d % 12 < 6 && o.tv !== 'off' ? K.red : '#7a1f2e', 1.2);
        // the guitar in its stand: fire off its horns, on twos
        const fl = clamp(o.flames ?? 0.7), gs = G.s;
        if (o.guitar) o.guitar(g, G.x, G.y, gs);
        else if (typeof Inferno !== 'undefined' && Inferno.guitar) {
            if (fl > 0.02 && typeof Fx !== 'undefined') {
                Fx.flame(g, G.x - 0.36 * gs, G.y - 0.26 * gs, 0.42 * gs * fl * (1 + 0.1 * (d % 2)), d, 0);
                Fx.flame(g, G.x + 0.36 * gs, G.y - 0.3 * gs, 0.36 * gs * fl * (1 + 0.1 * ((d + 1) % 2)), d, 2);
            }
            g.save();
            g.translate(G.x, G.y);
            g.scale(gs, gs);
            Inferno.guitar(g, 3.2 / gs, [0.02, -0.5], -Math.PI / 2 + 0.02, 1, 1);
            g.restore();
            if (fl > 0.5 && typeof Fx !== 'undefined') Fx.flame(g, G.x + 0.04 * gs, G.y - 1.6 * gs, 0.2 * gs * fl, d, 1);
        }
        // the yoke closes round the neck, the cradle's pads in front of the body
        for (const sx of [-1, 1]) {
            line(g, [[G.x + 3, G.y - 1.24 * gs], [G.x + 3 + sx * 13, G.y - 1.26 * gs], [G.x + 3 + sx * 15, G.y - 1.36 * gs]], 8);
            line(g, [[G.x + 3, G.y - 1.24 * gs], [G.x + 3 + sx * 13, G.y - 1.26 * gs], [G.x + 3 + sx * 15, G.y - 1.36 * gs]], 3.6, '#2a2438');
        }
        for (const fx of [G.x - 40, G.x + 46]) rrect(g, fx - 6, G.y - 8, 12, 15, 4, '#2a2438', 2.2);
        g.restore();
    }

    return { D, Dd, MOON, moon, landing, landingSlide, ZONES, HEIGHTS, EYE, at, horizon, site, moonAt, ascent, ascentFront, town, TOWN_AT,
        angel, angelPoints, flap, harp, trumpet, cloudBank, bankBob, pearlyBits, backstage, autograph, frameAt, BACKSTAGE };
})();
