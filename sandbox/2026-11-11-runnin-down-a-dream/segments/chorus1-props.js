// Props and effects of chorus 1 (segments/chorus1.js): the bass drum's shock wave, dust and
// smoke, the cactus that takes the wheel, the mound the hearse burrows under and the slabs it
// throws, the Devil's hair in the wind, and the title's solid words.
// Units: figure units (as rides.js and cast.js) placed with (x, y, s) unless said otherwise.
// Global: Chorus1Props. Depends on Cereal, Song, Cast, Devil, World.
const Chorus1Props = (() => {
    const C = Cereal, K = C.COL, E = Ease, S = Song, TAU = Math.PI * 2;
    const D = Cast.D, Dd = Cast.Dd;
    const lerp = (a, b, u) => a + (b - a) * u;
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
    const dot = (g, x, y, r, fill, lw, ink = K.ink) => {
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

    // Rides and Devil always paint a contact shadow under their figure. In the air, or on a
    // perch narrower than the shadow, there is no ground for it: the call's first ellipse
    // (that shadow) is skipped.
    function noShadow(g, fn) {
        const own = Object.prototype.hasOwnProperty.call(g, 'ellipse') ? g.ellipse : null, e = g.ellipse;
        let n = 0;
        g.ellipse = function (...a) {
            if (n++ === 0) return;
            e.apply(this, a);
        };
        try {
            fn();
        } finally {
            if (own) g.ellipse = own;
            else delete g.ellipse;
        }
    }

    // --- puffs -----------------------------------------------------------------------------
    // Scalloped blobs of dust or smoke, as in rides.js: [[x, y, r, bumps, a0], …]; the outlines
    // of the whole group go first and the fills on top, so touching puffs merge.
    function puffs(g, list, fill, lw, ink = K.ink) {
        const parts = [];
        for (const [x, y, r, n, a0] of list) {
            if (!(r > 0.5 * lw)) continue;
            parts.push([x, y, r * 0.74]);
            for (let i = 0; i < n; i++) {
                const a = a0 + (i / n) * TAU;
                parts.push([x + Math.cos(a) * r * 0.62, y + Math.sin(a) * r * 0.62, r * 0.4]);
            }
        }
        g.strokeStyle = ink;
        g.lineWidth = lw * 2;
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
    const DUST = { back: '#e2c08a', fore: '#fff1c4', stone: '#c49a5c' }, SMOKE = { back: '#8d86b8', fore: '#c9c3e6' };

    /**
     * The dust a car raises when it lands: a jagged flash under it on the first two drawings,
     * then two rolls of puffs that leave the wheels along the ground, low and wide, and are
     * left behind by the car (everything drifts to the left as it thins), with pebbles.
     *   x, y  the ground under the middle of the car;  s  units per figure unit
     *   age   seconds since the landing;  half  the half distance between the axles
     *   part  'flash' (before the car is drawn) or 'dust' (after it)
     */
    function landing(g, x, y, s, age, part = 'dust', half = 3.55) {
        if (age < -1e-6 || age > 0.8) return;
        const L = 3.2 / s, d = Math.floor(age * 12 + 1e-6), k = age / 0.8, r = Motion.rng('chorus1-landing');
        g.save();
        g.translate(x, y);
        g.scale(s, s);
        g.lineJoin = 'round';
        if (part === 'flash') {
            // the flash: a flat star on the road under the car, drawn before it
            if (d < 2) {
                const f = d === 0 ? 1 : 1.18;
                C.burst(g, 0, -0.1, { r0: 2.7 * f, r1: 3.8 * f, n: 13, seed: 'chorus1-land', jitter: 0.2, rot: d * 0.12, fill: K.white, ink: K.ink, lw: L, sx: 1.42, sy: 0.3 });
                C.burst(g, 0, -0.1, { r0: 1.7 * f, r1: 2.5 * f, n: 11, seed: 'chorus1-land2', jitter: 0.2, rot: 0.3 + d * 0.12, fill: K.yellow, ink: K.ink, lw: L * 0.8, sx: 1.42, sy: 0.24 });
            }
            g.restore();
            return;
        }
        const grow = 1 - Math.pow(1 - k, 2.4), back = [], fore = [];
        for (const side of [-1, 1]) {
            for (let i = 0; i < 7; i++) {
                const out = 0.5 + 2.6 * r(), size = 0.34 + 0.3 * r(), end = 0.55 + 0.45 * r(), n = 5 + Math.floor(r() * 3), a0 = r() * TAU, up = r();
                const life = Math.max(0, 1 - k / end), rad = size * Math.min(1, 0.45 + k * 4) * Math.pow(life, 0.6) * (1 + 0.05 * (((d + i) % 2) * 2 - 1));
                // out from the wheel, and left behind: the road runs to the left under the car
                const px = side * (half + out * grow) - 5.2 * k * k - 1.6 * k, py = -rad * 0.6 - up * 0.5 * grow;
                (i < 4 ? back : fore).push([px, py, rad * (i < 4 ? 1.1 : 0.78), n, a0 + 0.4 * (((d + i * 2) % 3) - 1)]);
            }
        }
        for (let i = 0; i < 8; i++) {
            const side = i % 2 ? 1 : -1, vx = side * (2 + 3 * r()) - 3, vy = -(2.6 + 2.4 * r()), sz = 0.035 + 0.03 * r();
            const px = side * half + vx * age, py = Math.min(0, vy * age + 6 * age * age) - 0.03;
            if (py < -0.031) dot(g, px, py, sz, DUST.stone, L * 0.8);
        }
        puffs(g, back, DUST.back, L);
        puffs(g, fore, DUST.fore, L);
        g.restore();
    }

    /**
     * A train of puffs that leaves a point and is carried back (to the left) and up by the
     * wind, one step per drawing: smoke off the hearse, off the Devil's hair.
     *   k  0..1 how much of it there is;  o: { n, len, rise, size, cols, seed }
     */
    function smoke(g, x, y, s, k, t, o = {}) {
        if (k <= 0.02) return;
        const { n = 4, len = 2.2, rise = 0.9, size = 0.3, cols = SMOKE, seed = 0 } = o;
        const L = 3.2 / s, d = C.drawing(t) + seed, list = [];
        for (let i = 0; i < n; i++) {
            const u = (i + (((d % 3) + 3) % 3) / 3) / n;
            if (u > k * 1.05) continue;
            const fade = u > 0.75 ? (1 - u) / 0.25 * 0.6 + 0.4 : 1;
            list.push([-u * len - 0.05, -u * rise - u * u * 0.4, (0.09 + size * u) * (0.55 + 0.45 * k) * fade, 6, i * 1.3 + d * 0.7]);
        }
        g.save();
        g.translate(x, y);
        g.scale(s, s);
        puffs(g, list, cols.fore, L * 0.9);
        g.restore();
    }

    // --- the shock wave ----------------------------------------------------------------------
    // What the bass drum throws back along the road on every kick: a ring that pops off its
    // head, then three thick crescents that leave the head's rim and travel to the left,
    // growing, their feet on the road. Distances in figure units, times in seconds.
    const WAVE = { r0: 0.44, grow: 0.34, flat: 0.62, gap: 0.06, n: 3 };
    // how far to the left of the drum's middle the leading crescent's edge is, `age` after the kick
    const waveReach = (age, v) => Math.max(0, age) * v * (1 + WAVE.flat * WAVE.grow) + WAVE.flat * WAVE.r0;
    // …and when it gets to a thing `dist` to the left of the drum's middle
    const waveTime = (dist, v) => Math.max(0, (dist - WAVE.flat * WAVE.r0) / (v * (1 + WAVE.flat * WAVE.grow)));
    // a crescent: the left part of an ellipse (radii rx, ry round cx, cy), `w` thick in the
    // middle and tapering to its two ends; `inset` moves both edges in (for a band inside it)
    const crescent = (cx, cy, rx, ry, w, half, inset = 0, n = 24) => {
        const out = [], inn = [];
        for (let i = 0; i <= n; i++) {
            const u = i / n, a = Math.PI - half + u * 2 * half, th = w * Math.pow(Math.sin(u * Math.PI), 0.6), c = Math.cos(a), sn = Math.sin(a);
            const t0 = Math.min(inset, th / 2), t1 = Math.max(th - inset, th / 2);
            out.push([cx + c * (rx - t0), cy + sn * (ry - t0 * 0.3)]);
            inn.push([cx + c * (rx - t1), cy + sn * (ry - t1 * 0.3)]);
        }
        return [...out, ...inn.reverse()];
    };
    /**
     * wave(g, ox, oy, s, age, o)
     *   ox, oy  the middle of the drum's head;  s  units per figure unit;  age  seconds since the kick
     *   o: { v (figure units a second, 14), k (strength: 1, the last one about 1.7), ground (y of
     *        the road under the drum, so the crescents stand on it), ring (false to leave the
     *        ring at the drum out) }
     */
    function wave(g, ox, oy, s, age, o = {}) {
        if (age < -1e-6) return;
        const { v = 14, k = 1, ground = oy + 1.2 * s, ring = true } = o;
        const L = 3.2 / s, d = Math.floor(age * 12 + 1e-6), W = WAVE, big = k > 1.3, n = big ? W.n + 1 : W.n;
        g.save();
        g.translate(ox, oy);
        g.scale(s, s);
        g.lineJoin = 'round';
        const gy = (ground - oy) / s + 0.04;
        // the crescents, the last one out first so the leader is on top
        for (let i = n - 1; i >= 0; i--) {
            const a = age - i * W.gap;
            if (a < -1e-6) continue;
            const dist = a * v, life = 1 - E.seg(dist, 5 * k, 8.5 * k);
            if (life <= 0 || dist < 0.25) continue; // it shows once it is clear of the heart
            const R = (W.r0 + W.grow * dist) * (1 - 0.14 * i) * (big ? 1 + 0.55 * Math.min(1, dist / 2) : 1);
            const cy = Math.min(0, gy - R), wob = 1 + 0.07 * (((d + i) % 2) * 2 - 1);
            const w = R * 0.33 * life * wob * (big ? 1.1 : 1);
            if (w < L * 2.4) continue;
            const half = 1.28 - 0.05 * i;
            C.poly(g, crescent(-dist, cy, R * W.flat, R, w, half), { fill: K.white, ink: K.ink, lw: L });
            // a band of colour inside it
            if (w > L * 6) C.poly(g, crescent(-dist, cy, R * W.flat, R, w, half * 0.8, w * 0.32), { fill: i % 2 ? K.pink : K.yellow, lw: 0 });
        }
        // the ring off the head: three drawings
        if (ring && d < 2) {
            const r1 = 0.44 + [0.03, 0.13][d] * k, th = [0.11, 0.075][d] * k;
            g.beginPath();
            g.arc(0, 0, r1, 0, TAU);
            g.strokeStyle = K.ink;
            g.lineWidth = th + 2 * L;
            g.stroke();
            g.strokeStyle = d === 0 ? K.yellow : K.white;
            g.lineWidth = th;
            g.stroke();
            // short ticks round it, like a struck thing in a comic
            {
                for (let i = 0; i < 8; i++) {
                    const a = (i + 0.5) / 8 * TAU + 0.2, ra = r1 + th + 0.07 + d * 0.06, rb = ra + (0.12 + 0.05 * (i % 2)) * k;
                    if (Math.cos(a) < -0.5) continue; // not where the crescents leave
                    line(g, [[Math.cos(a) * ra, Math.sin(a) * ra], [Math.cos(a) * rb, Math.sin(a) * rb]], L * 1.15);
                }
            }
        }
        g.restore();
    }

    // --- the cactus that takes the wheel ---------------------------------------------------------
    // A young saguaro off the verge, drawn like the road's own (world.js), with a flower. In the
    // driver's seat it wears shades like everybody cool in this film and keeps one arm on the wheel.
    const CAC = { body: K.teal, top: K.aqua, side: K.tealDeep, petal: K.pink, petalD: K.magenta, heart: K.yellow, lens: '#1d1626', glint: '#ffffff', mouth: K.ink, dirt: '#e09a12' };
    const CAC_H = 1.95, CAC_W = 0.42;
    /**
     * cactus(g, x, y, s, pose)   (x, y) is its foot; it stands 1.95 tall, 0.42 wide
     *   pose: { squash, lean, shades (null: two slot eyes; 0..1: the shades come down onto the face),
     *           mouth ('smile' | 'oh'), wave (-1..1 swings the raised arm),
     *           wheel ([x, y] in its units: the other arm reaches out and rests there; null: it turns up too),
     *           crumbs (0..1: earth still falling off its foot) }
     */
    function cactus(g, x, y, s, pose = {}) {
        const L = 3.2 / s, P = CAC, q = pose.squash ?? 0, hw = CAC_W / 2, H = CAC_H, dd = Dd(0.2);
        g.save();
        g.translate(x, y);
        g.scale(s, s);
        g.rotate(pose.lean ?? 0);
        g.scale(1 + q, 1 - q);
        g.lineJoin = 'round';
        // a column with a round top: its side first (the same shape, a little back), then its
        // front, a lit rib and a dark one
        const col = (px, py, pw, ph, rib = true) => {
            g.lineWidth = L;
            g.strokeStyle = K.ink;
            g.beginPath();
            g.roundRect(px + dd[0], py + dd[1], pw, ph, [pw / 2, pw / 2, 0, 0]);
            g.fillStyle = P.side;
            g.fill();
            g.stroke();
            g.beginPath();
            g.roundRect(px, py, pw, ph, [pw / 2, pw / 2, 0, 0]);
            g.fillStyle = P.body;
            g.fill();
            g.stroke();
            if (rib) {
                line(g, [[px + pw * 0.3, py + pw * 0.42], [px + pw * 0.3, py + ph - 0.03]], L * 0.75, P.top);
                line(g, [[px + pw * 0.72, py + pw * 0.46], [px + pw * 0.72, py + ph - 0.03]], L * 0.75, P.side);
            }
        };
        // the raised arm (screen left): out from the trunk, then up; it swings from its elbow
        const aw = 0.22, ey = -1.0, ex = -hw - 0.3, sw = (pose.wave ?? 0) * 0.22;
        g.save();
        g.translate(ex, ey);
        g.rotate(sw);
        col(-aw / 2, -0.56, aw, 0.56);
        g.restore();
        C.poly(g, [[ex - aw / 2, ey - 0.02], [-hw + 0.02, ey - 0.1], [-hw + 0.02, ey + 0.1], [ex + aw * 0.1, ey + 0.12], [ex - aw / 2, ey + 0.06]], { fill: P.body, ink: K.ink, lw: L });
        line(g, [[ex - aw * 0.2, ey + 0.035], [-hw, ey + 0.02]], L * 0.75, P.side);
        // the other arm: to the wheel, or up
        if (pose.wheel) {
            const [wx, wy] = pose.wheel, a = [hw - 0.02, wy];
            g.beginPath();
            g.roundRect(a[0] + dd[0], wy - 0.09 + dd[1], wx - a[0] + 0.09, 0.18, [0, 0.09, 0.09, 0]);
            g.fillStyle = P.side;
            g.fill();
            g.strokeStyle = K.ink;
            g.lineWidth = L;
            g.stroke();
            g.beginPath();
            g.roundRect(a[0], wy - 0.09, wx - a[0] + 0.09, 0.18, [0, 0.09, 0.09, 0]);
            g.fillStyle = P.body;
            g.fill();
            g.strokeStyle = K.ink;
            g.lineWidth = L;
            g.stroke();
            line(g, [[a[0] + 0.03, wy - 0.035], [wx + 0.02, wy - 0.035]], L * 0.75, P.top);
        } else {
            const rx = hw + 0.28, ry = -1.2;
            col(rx - aw / 2, ry - 0.5, aw, 0.5);
            C.poly(g, [[rx + aw / 2, ry - 0.02], [hw - 0.02, ry - 0.1], [hw - 0.02, ry + 0.1], [rx - aw * 0.1, ry + 0.12], [rx + aw / 2, ry + 0.06]], { fill: P.body, ink: K.ink, lw: L });
            line(g, [[rx + aw * 0.2, ry + 0.035], [hw, ry + 0.02]], L * 0.75, P.side);
        }
        col(-hw, -H, CAC_W, H);
        // spines: pairs of ticks down the trunk's edges
        for (let i = 0; i < 5; i++) {
            const sy = -0.2 - i * 0.22;
            line(g, [[-hw, sy], [-hw - 0.045, sy - 0.03]], L * 0.6);
            line(g, [[hw + dd[0], sy + dd[1] - 0.06], [hw + dd[0] + 0.045, sy + dd[1] - 0.09]], L * 0.6);
        }
        // the flower on its crown
        const fx = 0.03, fy = -H - 0.01;
        for (let i = 0; i < 5; i++) {
            const a = -Math.PI / 2 + (i / 5) * TAU;
            dot(g, fx + Math.cos(a) * 0.085, fy + Math.sin(a) * 0.07 - 0.035, 0.066, i % 2 ? P.petalD : P.petal, L * 0.75);
        }
        dot(g, fx, fy - 0.035, 0.046, P.heart, L * 0.7);
        // the face
        const fyy = -1.52, sh = pose.shades;
        if (sh == null || sh < 1) {
            g.fillStyle = K.ink;
            for (const sx of [-1, 1]) {
                g.beginPath();
                g.roundRect(sx * 0.09 - 0.024, fyy - 0.055, 0.048, 0.11, 0.018);
                g.fill();
            }
        }
        if (sh != null && sh > 0) {
            const dy = -(1 - sh) * 0.36;
            for (const sx of [-1, 1]) {
                const cx = sx * 0.094;
                C.poly(g, [[cx - 0.082, fyy - 0.07 + dy], [cx + 0.082, fyy - 0.07 + dy], [cx + 0.068, fyy + 0.03 + dy], [cx + 0.035, fyy + 0.058 + dy], [cx - 0.035, fyy + 0.058 + dy], [cx - 0.068, fyy + 0.03 + dy]], { fill: P.lens, ink: K.ink, lw: L * 0.8 });
                line(g, [[cx - 0.04, fyy + 0.014 + dy], [cx - 0.006, fyy - 0.036 + dy]], L * 0.7, P.glint);
            }
            line(g, [[-0.02, fyy - 0.052 + dy], [0.02, fyy - 0.052 + dy]], L * 1.2);
            line(g, [[-0.176, fyy - 0.058 + dy], [-hw, fyy - 0.075 + dy]], L);
            line(g, [[0.176, fyy - 0.058 + dy], [hw, fyy - 0.075 + dy]], L);
        }
        if (pose.mouth === 'oh') dot(g, 0, fyy + 0.2, 0.045, '#0a5a55', L * 0.8);
        else line(g, C.curve([[-0.09, fyy + 0.16], [-0.035, fyy + 0.215], [0.04, fyy + 0.215], [0.095, fyy + 0.15]], false, 5), L * 0.95, P.mouth);
        // earth off its foot
        const cr = pose.crumbs ?? 0;
        if (cr > 0) {
            const r = Motion.rng('chorus1-crumbs');
            for (let i = 0; i < 6; i++) {
                const px = (r() - 0.5) * 0.5, fall = (1 - cr) * (0.5 + r() * 0.9), sz = 0.03 + r() * 0.03;
                dot(g, px, 0.03 + fall, sz * Math.min(1, cr * 2.5), P.dirt, L * 0.7);
            }
        }
        g.restore();
    }

    // --- the mound ---------------------------------------------------------------------------
    // The hearse coming back under the road: a ridge of heaved-up slabs of asphalt on a heap of
    // sand that keeps pace with the cars, the trident's fork cutting through its crest.
    const ROADC = { front: '#2f2a6b', top: '#4d47a6', side: '#211c57', line: K.yellow, sand: '#ffc21f', sandD: '#e09a12' };
    // a slab of road: a tilted plank of asphalt (a, b: the ends of its upper edge; th: thickness)
    function slab(g, L, a, b, th, mark = false) {
        const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l;
        const pts = cw([a, b, [b[0] + nx * th, b[1] + ny * th], [a[0] + nx * th, a[1] + ny * th]]);
        C.prism(g, pts, Dd(0.8), { front: ROADC.front, top: ROADC.top, side: ROADC.side }, { lw: L, ink: K.ink });
        if (mark) {
            // a piece of the road's yellow line on its top face
            const m = (u, z) => [a[0] + dx * u + D[0] * z, a[1] + dy * u + D[1] * z];
            if (dx * D[1] - dy * D[0] < 0) C.poly(g, [m(0.25, 0.32), m(0.7, 0.32), m(0.7, 0.5), m(0.25, 0.5)], { fill: ROADC.line, lw: 0 });
        }
    }
    const SLABS = [
        // [ax, ay, bx, by, thickness, has the yellow line, what it does when the hearse comes out: vx, vy, spin]
        [-1.5, -0.04, -0.62, -0.5, 0.13, false, -5.5, -7, -5],
        [-0.72, -0.5, -0.06, -0.86, 0.13, true, -2.5, -12, -7],
        [0.08, -0.88, 0.7, -0.52, 0.13, false, 3.5, -12.5, 6],
        [0.6, -0.5, 1.5, -0.05, 0.13, true, 6.5, -8, 5],
    ];
    /**
     * mound(g, x, y, s, o)   (x, y): the road under its middle; about 4.3 wide and 1.25 high at k = 1
     *   o: { k (0..1 its size as it rises), d (the drawing), fork (0..1 how far the trident's fork is out),
     *        out (seconds since the hearse burst out of it, or null: the slabs fly and what is left stays behind),
     *        speed (figure units a second the road runs to the left: the trail and the leftovers) }
     */
    function mound(g, x, y, s, o = {}) {
        const { d = 0, fork = 1, out = null, speed = 13 } = o, k = (o.k ?? 1) * 1.42;
        const L = 3.2 / s, burst = out != null && out >= 0;
        g.save();
        g.translate(x, y);
        g.scale(s, s);
        g.lineJoin = 'round';
        // the furrow it leaves: clods and small slabs that run off to the left
        if (!burst) {
            const r = Motion.rng('chorus1-furrow'), ph = (d * speed) / 12;
            for (let i = 0; i < 9; i++) {
                const span = 5.4, px = -1.3 * k - ((i * 0.6 + ph + r() * 0.3) % span), sz = 0.07 + r() * 0.07, up = r() * 0.06;
                if (i % 3 === 0) C.prism(g, cw([[px - sz * 1.6, -up - sz * 0.9], [px + sz * 1.6, -up - sz * 0.5], [px + sz * 1.6, -up + 0.02], [px - sz * 1.6, -up + 0.02]]), Dd(0.3), { front: ROADC.front, top: ROADC.top, side: ROADC.side }, { lw: L * 0.85, ink: K.ink });
                else dot(g, px, -up - sz * 0.6, sz, i % 3 === 1 ? ROADC.sand : ROADC.sandD, L * 0.8);
            }
        }
        g.save();
        if (burst) g.translate(-speed * out, 0); // what stays of it is left behind
        g.scale(k, k);
        // the heap of sand under the slabs
        const heap = C.curve([[-1.62, 0.02], [-1.1, -0.2], [-0.5, -0.5], [0, -0.66], [0.5, -0.52], [1.1, -0.22], [1.62, 0.02]], false, 6);
        C.prism(g, cw([...heap, [1.62, 0.06], [-1.62, 0.06]]), Dd(0.8), { front: ROADC.sand, top: '#ffd75e', side: ROADC.sandD }, { lw: L / k, ink: K.ink, sweepInk: null });
        C.prismOutline(g, cw([...heap, [1.62, 0.06], [-1.62, 0.06]]), Dd(0.8), { lw: L / k, ink: K.ink });
        for (const [px, py, w] of [[-0.9, -0.12, 0.3], [-0.2, -0.3, 0.36], [0.55, -0.2, 0.3], [1.0, -0.06, 0.2]]) line(g, [[px, py], [px + w, py]], (L * 0.8) / k, ROADC.sandD);
        if (burst) {
            // the hole it came out of: a dark mouth in the heap, with a broken lip
            C.poly(g, [[-0.78, -0.3], [-0.5, -0.5], [-0.22, -0.42], [0.02, -0.64], [0.3, -0.46], [0.52, -0.5], [0.8, -0.26], [0.5, -0.1], [-0.5, -0.1]], { fill: ROADC.side, ink: K.ink, lw: L / k });
        }
        g.restore();
        // the trident's fork through the crest, before the slabs that hide its foot
        if (!burst && fork > 0) {
            const bob = [0, 0.035, -0.02][((d % 3) + 3) % 3];
            g.save();
            g.beginPath();
            g.rect(-2, -3, 4, 3 - 0.6 * k);
            g.clip();
            Devil.trident(g, 0.02, -0.62 * k - 1.0 * fork + 1.6 + bob, L, { ang: 0.1 });
            g.restore();
        }
        // the slabs: on the heap, or flying
        g.save();
        g.scale(k, k);
        SLABS.forEach(([ax, ay, bx, by, th, mark, vx, vy, sp], i) => {
            const jig = burst ? 0 : 0.025 * (((d + i) % 2) * 2 - 1);
            if (!burst) return slab(g, L / k, [ax, ay + jig], [bx, by - jig], th, mark);
            const mx = (ax + bx) / 2, my = (ay + by) / 2, tq = Math.floor(out * 12 + 1e-6) / 12 + 1 / 24;
            const px = mx + (vx - speed * 0.45) * tq, py = my + vy * tq + 24 * tq * tq;
            if (py > 0.6) return;
            const a = rot([ax - mx, ay - my], sp * tq), b2 = rot([bx - mx, by - my], sp * tq);
            slab(g, L / k, [px + a[0], py + a[1]], [px + b2[0], py + b2[1]], th, mark);
        });
        g.restore();
        g.restore();
    }

    /**
     * What a thing throws up when it bursts out of the ground: a jagged star of sand for three
     * drawings, clods on their arcs, a roll of dust. age: seconds since.
     */
    function eruption(g, x, y, s, age, speed = 13) {
        if (age < -1e-6 || age > 0.75) return;
        const L = 3.2 / s, d = Math.floor(age * 12 + 1e-6), tq = d / 12 + 1 / 24, r = Motion.rng('chorus1-erupt');
        g.save();
        g.translate(x, y);
        g.scale(s, s);
        g.lineJoin = 'round';
        if (d < 3) {
            const f = [0.75, 1, 1.12][d];
            C.burst(g, 0, -0.5, { r0: 1.15 * f, r1: 1.95 * f, n: 11, seed: 'chorus1-erupt', jitter: 0.26, rot: d * 0.1, fill: ROADC.sand, ink: K.ink, lw: L, sx: 1.15, sy: 0.95 });
            C.burst(g, 0, -0.5, { r0: 0.6 * f, r1: 1.15 * f, n: 9, seed: 'chorus1-erupt2', jitter: 0.26, rot: 0.3 - d * 0.1, fill: K.white, ink: K.ink, lw: L * 0.8, sx: 1.15, sy: 0.95 });
        }
        const list = [];
        for (let i = 0; i < 8; i++) {
            const a = Math.PI * (1.05 + 0.9 * r()), dist = 0.6 + 1.2 * r(), size = 0.3 + 0.28 * r(), end = 0.6 + 0.4 * r(), k = age / 0.75;
            const life = Math.max(0, 1 - k / end), rad = size * Math.min(1, 0.4 + k * 4) * Math.pow(life, 0.6);
            list.push([Math.cos(a) * dist * Math.min(1, k * 2.4) - speed * 0.5 * age, Math.min(-rad * 0.5, Math.sin(a) * dist * Math.min(1, k * 2.4) * 0.7), rad, 6, r() * TAU + 0.4 * ((d + i) % 3)]);
        }
        puffs(g, list, DUST.fore, L);
        for (let i = 0; i < 9; i++) {
            const vx = (r() - 0.5) * 11 - speed * 0.3, vy = -(7 + 6 * r()), sz = 0.05 + 0.05 * r();
            const px = vx * tq, py = -0.4 + vy * tq + 22 * tq * tq;
            if (py < 0) dot(g, px, py, sz, i % 2 ? ROADC.sandD : ROADC.front, L * 0.8);
        }
        g.restore();
    }

    // --- the Devil's hair in the wind ----------------------------------------------------------
    // Drawn over his head, in his own units (after Devil.draw, under the same transform): the
    // pompadour's quiff peeled back into three locks that stream to the left and flick on twos.
    function blownHair(g, L, d, k = 1) {
        const P = Devil.P, T = Devil.HEAD.top, f = ((d % 2) + 2) % 2;
        // a lock: from its root it sweeps back, dips and flicks up at its tip
        const lock = (x0, y0, len, w, rise, wave) => {
            const cl = [];
            for (let i = 0; i <= 9; i++) {
                const u = i / 9;
                cl.push([x0 - len * u, y0 - rise * u * u + wave * Math.sin(u * Math.PI * 1.5 + (f ? 0.5 : 0)) * (0.3 + 0.7 * u), w * Math.pow(1 - u, 0.7) + 0.004]);
            }
            const Lp = [], Rp = [];
            cl.forEach(([x, y, hw], i) => {
                const a = cl[Math.max(0, i - 1)], b = cl[Math.min(cl.length - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1;
                Lp.push([x - (dy / l) * hw, y + (dx / l) * hw]);
                Rp.push([x + (dy / l) * hw, y - (dx / l) * hw]);
            });
            C.poly(g, [...Lp, ...Rp.reverse()], { fill: P.hair, ink: P.ink, lw: L });
            line(g, cl.slice(1, 6).map(([x, y]) => [x, y - 0.01]), L * 0.9, P.sheen);
        };
        // three of them off the quiff's crest, the longest on top
        lock(0.3, T - 0.2, 0.95 * k, 0.07, 0.26 + 0.08 * f, 0.07);
        lock(0.12, T - 0.24, 0.72 * k, 0.06, 0.1 - 0.05 * f, -0.06);
        lock(-0.12, T - 0.2, 0.5 * k, 0.05, 0.2 + 0.06 * f, 0.05);
    }

    // --- the title's words, as in the opening ------------------------------------------------------
    /**
     * title(g, t, x, y, o)   the two lines round (x, y = the first line's baseline)
     *   o: { at: [t1, t2, t3] when RUNNIN', DOWN A and DREAM pop, out: when they start to leave
     *        (one word every two frames, each gone in three drawings), k: size (1 = 104 and 196) }
     * Draw it before the cars: it is part of the sky.
     */
    function title(g, t, x, y, o) {
        const [t1, t2, t3] = o.at, k = o.k ?? 1, P = S.pulseAt(t), ph = P.k + P.since, d = C.drawing(t);
        if (t < t1 - 1e-6) return;
        const leave = (i) => {
            const at = o.out + (i * 2) / 24;
            if (t < at - 1e-6) return 1;
            return [1.12, 0.7, 0.3, 0][Math.min(3, Math.floor((t - at) * 12 + 1e-6))];
        };
        // a star behind the words, so the sky's clouds never touch a letter: a flat one under
        // RUNNIN', which stretches under DOWN A and opens downwards when DREAM lands; it breathes
        // on the beat and goes with the last word
        const st = t < t2 - 1e-6 ? [t1, -168, -36, 222, 0.5] : t < t3 - 1e-6 ? [t2, 0, -36, 392, 0.3] : [t3, 0, 72, 398, 0.53];
        const bp = (t < t2 - 1e-6 ? S.pop(t, t1, 0.2) : 0.9 + 0.1 * S.pop(t, st[0], 0.2) / 1) * leave(2) * (1 + 0.02 * P.pulse);
        if (bp > 0) C.burst(g, x + st[1] * k, y + st[2] * k, { r0: st[3] * 0.8 * bp * k, r1: st[3] * bp * k, n: 17, seed: 'chorus1-title', jitter: 0.16, rot: d % 4 < 2 ? 0 : 0.03, fill: K.pink, ink: K.ink, lw: 5, sy: st[4] });
        const word = (text, wx, wy, size, when, wi, opt) =>
            C.text3d(g, text, wx, wy, {
                size, dir: [0.72, 0.7], ...opt,
                letter: (i) => {
                    const w = when(i), p = S.pop(t, w, 0.25) * leave(wi(i));
                    if (p <= 0) return { hide: true };
                    const settled = t > w + 0.3;
                    return { s: p, rot: (i % 2 ? 1 : -1) * 0.035, dy: settled ? -8 * k * P.pulse * ((i + Math.floor(ph + 1e-6)) % 2 ? 1 : 0.35) : 0 };
                },
            });
        word("RUNNIN' DOWN A", x, y, 104 * k, (i) => (i < 7 ? t1 : t2), (i) => (i < 7 ? 0 : 1), { face: K.white, side: K.ink, side2: K.white, bands: 4, depth: 14 * k, ow: 3.2, track: 1 });
        word('DREAM', x, y + 196 * k, 196 * k, () => t3, () => 2, { face: K.yellow, side: K.red, side2: K.orange, bands: 3, depth: 27 * k, ow: 4.6, track: 4 });
    }

    return { noShadow, puffs, DUST, SMOKE, landing, smoke, wave, waveReach, waveTime, WAVE, cactus, CAC_H, mound, slab, eruption, blownHair, title, ROADC };
})();
