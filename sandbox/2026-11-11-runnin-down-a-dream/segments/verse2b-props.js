// Props and effects of verse 2, second part (segments/verse2b.js): what the rain does to the
// band's car (splashes, a sheet of water on the speakers, spray off the wheels, puddles, the
// organ's spark), the clamp that holds an umbrella on Stan's cymbal stand, the burst of the cactus's bubble,
// and what the machine does when it is cranked far too fast (the crank's whirl, the valve's
// whistle, rivets that pop).
// Units: figure units (as rides.js, cast.js and weather.js). A prop «in the car's units» is
// called inside a transform that is already scaled (Weather.onBandCar, Rides.at): it takes s
// only for its line widths. The others are placed with (x, y, s).
// Global: V2B. Depends on Cereal, Song, World, Weather.
const V2B = (() => {
    const C = Cereal, K = C.COL, TAU = Math.PI * 2;
    const D = Weather.D;
    // water is a clear blue with the ink round it (ice, in weather.js, is paler and has its own blue line)
    const WATER = { fill: '#8fb4f5', light: '#c2d8ff', deep: '#5b8be6', drop: '#eaf3ff', puddle: '#565d7c', rim: '#c9cde0' };
    const lerp = (a, b, u) => a + (b - a) * u;
    const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
    const rot = ([x, y], a) => [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)];
    const line = (g, pts, lw, ink = K.ink) => C.poly(g, pts, { ink, lw, close: false });
    const dot = (g, x, y, r, fill, lw = 0, ink = K.ink) => {
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
    const mod = (a, n) => ((a % n) + n) % n;
    // a tube: a thick line in a colour with the outline round it (as in weather.js)
    const tube = (g, pts, w, col, L, ink = K.ink) => {
        C.poly(g, pts, { ink, lw: w + 2 * L, close: false });
        C.poly(g, pts, { ink: col, lw: w, close: false });
    };
    // scalloped puffs, as in rides.js and weather.js: [[x, y, r, bumps, a0], …]
    function puffs(g, list, fill, L, ink = K.ink) {
        const parts = [];
        for (const [x, y, r, n, a0] of list) {
            if (r <= 0.02) continue;
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

    // =========================================================================================
    // Rain on things
    // =========================================================================================
    /**
     * Rain hitting a surface, in the caller's units: at each point a small crown that opens
     * over two drawings, every point on its own phase (a loop of five drawings).
     *   pts: [[x, y], …];  o: { size (the crown's half width, default 0.085), seed, every (the loop, default 5) }
     */
    function patter(g, s, t, pts, o = {}) {
        const d = C.drawing(t), r = Motion.rng('v2b-patter:' + (o.seed ?? 0)), z0 = o.size ?? 0.085, n = o.every ?? 5, lw = 2.6 / s;
        pts.forEach(([x, y]) => {
            const f = mod(d + Math.floor(r() * n), n);
            if (f > 1) return;
            const z = z0 * (0.62 + 0.38 * f);
            line(g, [[x - z, y - z * 0.8], [x - z * 0.3, y], [x + z * 0.3, y], [x + z, y - z * 0.8]], lw, WATER.light);
            if (f === 1) dot(g, x + z * 0.1, y - z * 1.5, z * 0.16, WATER.light);
        });
    }

    /**
     * Water running down a surface, in the caller's units: short pale strokes that slide from
     * each point down by `len`, on twos (hair, a shoulder, a lens).
     *   runs: [[x, y, len], …]
     */
    function runs(g, s, t, list, o = {}) {
        const d = C.drawing(t), r = Motion.rng('v2b-runs:' + (o.seed ?? 0)), lw = (o.lw ?? 2.4) / s;
        for (const [x, y, len] of list) {
            const f = mod(d + Math.floor(r() * 4), 4) / 4, a = y + len * f, b = Math.min(y + len, a + len * 0.42);
            line(g, [[x, a], [x, b]], lw, o.color ?? WATER.light);
        }
    }

    /**
     * A sheet of water lying on a flat top (the speakers), in the caller's units: the rain
     * fills it faster than it runs off, so it stands as a slab with a rolling lip that hangs
     * over the front edge in tongues.
     *   a, b   the front edge's ends (left, right);  dv  the vector from the front edge to the back one
     *   k      0..1 how full it is (it grows from nothing)
     */
    function waterHat(g, s, t, a, b, dv, k = 1) {
        if (k <= 0.02) return;
        const L = 3.2 / s, d = C.drawing(t), h = 0.085 * k, n = 9, w = b[0] - a[0];
        // the slab's top edge, rolling on twos
        const topF = [];
        for (let i = 0; i <= n; i++) {
            const u = i / n;
            topF.push([a[0] + w * u, lerp(a[1], b[1], u) - h * (0.8 + 0.3 * Math.sin(u * 9 + (d % 2) * 1.6))]);
        }
        // round tongues over the front edge: every other one long, swapping on twos
        const m = 5, lip = [];
        for (let i = 0; i < m; i++) {
            const x0 = a[0] + (w * i) / m, x1 = a[0] + (w * (i + 1)) / m, xm = (x0 + x1) / 2, tw = w / m * 0.3;
            const len = (0.07 + 0.12 * ((i + d) % 2) + 0.03 * (i % 3)) * k;
            lip.push([x0, a[1] + 0.012], [xm - tw, a[1] + 0.02], [xm - tw * 0.9, a[1] + len * 0.7], [xm, a[1] + len], [xm + tw * 0.9, a[1] + len * 0.7], [xm + tw, a[1] + 0.02]);
        }
        lip.push([b[0], b[1] + 0.012]);
        const back = [[b[0] + dv[0], b[1] + dv[1] - h], [a[0] + dv[0], a[1] + dv[1] - h]];
        // the top face of the slab, then its front with the tongues
        C.poly(g, [...topF, ...back], { fill: '#a9c8fb', ink: K.ink, lw: L * 0.8 });
        C.poly(g, [...topF, ...C.curve(lip, false, 4).reverse()], { fill: WATER.fill, ink: K.ink, lw: L * 0.8 });
        line(g, [[a[0] + w * 0.1, a[1] - h * 0.3], [a[0] + w * 0.3, a[1] - h * 0.3]], L * 0.7, '#ffffff');
        line(g, [[a[0] + w * 0.58, a[1] - h * 0.2], [a[0] + w * 0.68, a[1] - h * 0.2]], L * 0.7, '#ffffff');
        // the rain keeps hitting it
        const pts = [];
        for (let i = 0; i < 5; i++) pts.push([a[0] + w * (0.12 + i * 0.19) + dv[0] * (i % 2 ? 0.7 : 0.3), a[1] + dv[1] * (i % 2 ? 0.7 : 0.3) - h]);
        patter(g, s, t, pts, { size: 0.1, seed: 'hat' });
    }

    /**
     * The spray a wheel throws back off a wet road: two tongues of water that leave the
     * tyre's contact, on twos, and a few drops beyond them. Placed with (x, y, s): the
     * contact point on the road.
     *   k    0..1 how wet the road is;  big  0..1 a puddle's sheet on top (both ways)
     */
    function wheelSpray(g, x, y, s, t, k = 1, big = 0, seed = 0) {
        if (k <= 0.02 && big <= 0.02) return;
        const L = 3.2 / s, d = C.drawing(t) + seed, f = mod(d, 2), e = clamp(k);
        g.save();
        g.translate(x, y);
        g.scale(s, s);
        g.lineJoin = 'round';
        // a rooster tail: narrow at the tyre, opening back and up, its far edge in fingers
        const TAIL = [
            [[0.04, 0], [-0.5, -0.03], [-0.92, -0.12], [-1.1, -0.27], [-0.93, -0.3], [-1.02, -0.52], [-0.8, -0.46], [-0.84, -0.73], [-0.6, -0.58], [-0.4, -0.44], [-0.14, -0.2]],
            [[0.04, 0], [-0.5, -0.04], [-1.0, -0.16], [-1.18, -0.36], [-0.99, -0.37], [-1.07, -0.62], [-0.85, -0.53], [-0.8, -0.82], [-0.62, -0.6], [-0.36, -0.42], [-0.12, -0.18]],
        ];
        const tail = (len, rise, ff, flip = 1) => {
            const pts = C.curve(TAIL[ff].map(([px, py]) => [px * len * flip, py * rise]), true, 3);
            C.poly(g, pts, { fill: WATER.fill, ink: K.ink, lw: L * 0.85 });
            for (const [u0, v0, u1, v1] of [[-0.3, -0.1, -0.72, -0.3], [-0.5, -0.24, -0.72, -0.5]]) line(g, [[u0 * len * flip, v0 * rise], [u1 * len * flip, v1 * rise]], L * 0.8, WATER.light);
        };
        const drops = (list, m) => list.forEach(([dx, dy, r]) => dot(g, dx * m, dy * m, r, WATER.light, L * 0.6));
        if (big > 0.02) {
            // through a puddle: the tail stands up, and a smaller one goes forward
            const bb = clamp(big);
            tail(0.75 * bb, 1.35 * bb, 1 - f, -1);
            tail(1.35 * bb, 1.75 * bb, f);
            drops([[-1.55, -1.25, 0.05], [-1.2, -1.6, 0.04], [-0.75, -1.55, 0.045], [0.85, -0.95, 0.04], [0.5, -1.15, 0.035]], bb);
        } else if (e > 0.02) {
            tail((0.9 + 0.14 * f) * e, (0.8 + 0.2 * (1 - f)) * e, f);
            const r = Motion.rng('v2b-spray:' + seed), list = [];
            for (let i = 0; i < 4; i++) {
                const u = mod(d * 0.34 + r(), 1), ang = Math.PI * (1.1 + 0.16 * r()), v = 1.2 + 0.7 * r();
                list.push([Math.cos(ang) * v * (0.4 + u), Math.sin(ang) * v * (0.4 + u) + 1.2 * u * u, 0.03]);
            }
            drops(list, e);
        }
        g.restore();
    }

    /**
     * Puddles on the wet road, a layer of the world: they scroll with the road (X as in
     * World.back), in the lane the wheels run in.
     *   each(X, fn)     runs fn(x, y, w) for every puddle that can be on screen
     *   draw(g, t, X)   paints them
     *   hit(X, x)       how long ago (in units of road, >= 0) the wheel at screen x drove into
     *                   the puddle it is in, or null when it is on dry road
     */
    const PUD = { sp: 730, y: World.LANE + 3 };
    const puddleAt = (i) => {
        const r = Motion.rng('v2b-puddle:' + i);
        return { c: i * PUD.sp + r() * PUD.sp * 0.5, w: 120 + r() * 70, dy: (r() - 0.5) * 8 };
    };
    const puddles = {
        each(X, fn) {
            for (let i = Math.floor((X - 300) / PUD.sp); i <= Math.ceil((X + 1300) / PUD.sp); i++) {
                const p = puddleAt(i);
                fn(p.c - X, PUD.y + p.dy, p.w, i);
            }
        },
        draw(g, t, X) {
            const d = C.drawing(t);
            puddles.each(X, (x, y, w, i) => {
                g.beginPath();
                g.ellipse(x, y, w / 2, 11, 0, 0, TAU);
                g.fillStyle = WATER.puddle;
                g.fill();
                g.beginPath();
                g.ellipse(x - w * 0.06, y - 2, w * 0.36, 6, 0, Math.PI * 1.05, Math.PI * 1.75);
                g.strokeStyle = WATER.rim;
                g.lineWidth = 2.6;
                g.lineCap = 'round';
                g.stroke();
                // rings where the rain falls in
                const f = mod(d + i, 4);
                if (f < 2) {
                    g.beginPath();
                    g.ellipse(x + w * (0.22 - 0.4 * (mod(i + (d >> 2), 3) / 2)), y + 2, 9 + f * 8, 2.5 + f * 2, 0, 0, TAU);
                    g.stroke();
                }
            });
        },
        hit(X, x) {
            let best = null;
            for (let i = Math.floor((X + x - 400) / PUD.sp); i <= Math.ceil((X + x + 400) / PUD.sp); i++) {
                const p = puddleAt(i), into = x - (p.c - X - p.w / 2);
                if (into >= 0 && into <= p.w + 60 && (best == null || into < best)) best = into;
            }
            return best;
        },
    };

    // =========================================================================================
    // The organ's spark, the umbrella's clamp, the bubble's burst
    // =========================================================================================
    /**
     * A short circuit, in the caller's units: f is the drawing since it struck (0, 1, 2…). A
     * small jagged star, white inside yellow, two forks that jump away and a wisp of smoke.
     */
    function spark(g, s, x, y, f, size = 0.3) {
        if (f < 0 || f > 5) return;
        const L = 3.2 / s;
        g.save();
        g.translate(x, y);
        g.lineJoin = 'round';
        if (f >= 2) {
            const u = (f - 2) / 4;
            puffs(g, [[0.05 + 0.14 * u, -0.1 - 0.5 * u, size * (0.3 + 0.22 * u) * (u > 0.6 ? 1.6 - u : 1), 5, f * 0.8]], '#c9c3e6', L * 0.8);
        }
        if (f <= 2) {
            const k = [0.8, 1, 0.55][f];
            C.burst(g, 0, 0, { r0: size * 0.42 * k, r1: size * k, n: 7, seed: 'v2b-spark', jitter: 0.25, rot: f * 0.5, fill: K.yellow, ink: K.ink, lw: L * 0.9 });
            C.burst(g, 0, 0, { r0: size * 0.2 * k, r1: size * 0.5 * k, n: 6, seed: 'v2b-spark2', jitter: 0.2, rot: f * 0.5 + 0.3, fill: '#ffffff', ink: null, lw: 0 });
        }
        if (f <= 1) {
            // two forks that leave it
            const far = size * (1.15 + 0.5 * f);
            for (const [a, flip] of [[-0.75, 1], [-2.3, -1], [0.5, 1]]) {
                const u = [Math.cos(a), Math.sin(a)], n = [-u[1] * flip, u[0] * flip];
                const pts = [[0.55, 0], [0.75, 0.16], [0.9, -0.1], [1.2, 0.06]].map(([p, q]) => [u[0] * p * far + n[0] * q * far, u[1] * p * far + n[1] * q * far]);
                line(g, pts, L * 2.6, K.ink);
                line(g, pts, L * 1.1, K.yellow);
            }
        }
        g.restore();
    }

    /**
     * The clamp that holds an umbrella on a cymbal stand, in the caller's units: a jaw on the
     * stand's upright with its wing screw, a jointed arm, and a socket the umbrella's handle
     * sits in. Draw it AFTER the umbrella: the socket covers the handle's crook.
     *   p   where the jaw grips the stand;  q  the socket (give the umbrella this point as its grip)
     */
    function brollyClamp(g, s, p, q) {
        const L = 3.2 / s, chrome = '#d5dbea', chromeTop = '#f4f6fc', chromeSide = '#8d95ad', iron = '#4a4470';
        const elbow = [lerp(p[0], q[0], 0.45), Math.min(p[1], q[1]) - 0.06];
        tube(g, [p, elbow, q], 0.045, chrome, L * 0.8);
        line(g, [[p[0] + (elbow[0] - p[0]) * 0.2, p[1] + (elbow[1] - p[1]) * 0.2 - 0.012], [elbow[0], elbow[1] - 0.012]], L * 0.5, chromeTop);
        dot(g, elbow[0], elbow[1], 0.04, K.gold, L * 0.7);
        // the jaw on the stand: a block with a wing screw sticking out towards us
        C.box(g, p[0] - 0.07, p[1] - 0.06, 0.14, 0.12, D, { front: iron, top: '#625c8c', side: '#353055' }, { lw: L * 0.85, ink: K.ink, depth: 0.12 });
        C.poly(g, [[p[0] - 0.05, p[1] - 0.012], [p[0] - 0.1, p[1] - 0.05], [p[0] - 0.075, p[1]], [p[0] - 0.1, p[1] + 0.05]], { fill: K.gold, ink: K.ink, lw: L * 0.6 });
        // the socket: a short sleeve round the handle, with a thumb screw
        C.box(g, q[0] - 0.06, q[1] - 0.02, 0.12, 0.16, D, { front: chrome, top: chromeTop, side: chromeSide }, { lw: L * 0.85, ink: K.ink, depth: 0.1 });
        line(g, [[q[0] - 0.03, q[1] + 0.01], [q[0] - 0.03, q[1] + 0.11]], L * 0.55, chromeTop);
        dot(g, q[0] + 0.085, q[1] + 0.07, 0.03, K.gold, L * 0.6);
    }

    /**
     * A bubble that bursts, in the caller's units: a ring of short marks round where it was
     * (x, y: its middle), opening over two drawings. f: 0 or 1.
     */
    function bubblePop(g, s, x, y, f) {
        const L = 3.2 / s, r = 0.17 + 0.09 * f;
        for (let i = 0; i < 7; i++) {
            const a = -Math.PI / 2 + (i / 7) * TAU + 0.2;
            line(g, [[x + Math.cos(a) * r, y + Math.sin(a) * r], [x + Math.cos(a) * (r + 0.085), y + Math.sin(a) * (r + 0.085)]], L * 0.9, K.ink);
        }
        if (!f) for (const [dx, dy] of [[-0.06, 0.05], [0.08, -0.04], [0.02, 0.1]]) dot(g, x + dx, y + dy, 0.022, WATER.light, L * 0.5);
    }

    // =========================================================================================
    // The machine, cranked far too fast
    // =========================================================================================
    /**
     * The crank's whirl, placed with (x, y, s) on the hub: arcs that trail the handle round
     * its circle (the crank turns clockwise on screen) when it turns too fast to follow.
     *   a  the handle's angle;  r  its radius in units;  k  0..1 how fast
     */
    function whirl(g, x, y, s, a, r, k) {
        if (k <= 0.05) return;
        g.save();
        g.translate(x, y);
        g.scale(s, s);
        g.lineCap = 'round';
        // outside the mitts that hold it, so they show
        const arcs = [[r + 0.2, 0.55, 1.7], [r + 0.31, 1.0, 1.2], [r + 0.42, 1.6, 0.8]];
        for (const [rr, lag, len] of arcs) {
            // white with the ink round it: they cross dark iron and a dark coat
            for (const [col, lw] of [[K.ink, 8.4], ['#fffdf4', 3.4]]) {
                g.beginPath();
                g.arc(0, 0, rr, a - (lag + len * k), a - lag);
                g.strokeStyle = col;
                g.lineWidth = lw / s;
                g.stroke();
            }
        }
        g.restore();
    }

    /**
     * The safety valve blowing its whistle, placed with (x, y, s) on the valve's cap: a jet of
     * steam up and to the right, on twos, and the lines of the whistle beside it.
     *   k  0..1
     */
    function whistle(g, x, y, s, t, k) {
        if (k <= 0.05) return;
        const L = 3.2 / s, d = C.drawing(t), f = mod(d, 3) / 3, list = [], e = clamp(k);
        g.save();
        g.translate(x, y);
        g.scale(s, s);
        g.lineCap = 'round';
        const dir = [0.42, -0.9];
        // the jet's core: a tapering white wedge with the outline, then the puffs it turns into
        const n = [dir[1], -dir[0]], len = 0.55 * e;
        C.poly(g, [[-n[0] * 0.03, -n[1] * 0.03], [dir[0] * len - n[0] * 0.11, dir[1] * len - n[1] * 0.11], [dir[0] * len + n[0] * 0.11, dir[1] * len + n[1] * 0.11], [n[0] * 0.03, n[1] * 0.03]], { fill: '#fffdf4', ink: K.ink, lw: L * 0.85 });
        for (let i = 0; i < 4; i++) {
            const u = (i + f) / 4, far = 0.45 + 1.15 * u;
            list.push([dir[0] * far * e + 0.3 * u * u, dir[1] * far * e, (0.1 + 0.2 * u) * e * (u > 0.7 ? (1 - u) / 0.3 * 0.7 + 0.3 : 1), 6, i * 1.4 + d * 0.6]);
        }
        puffs(g, list, '#fffdf4', L * 0.85);
        // the whistle: three short marks fanning from the cap, the other side of the jet
        for (const [a, r0, r1] of [[-2.5, 0.2, 0.36], [-2.15, 0.24, 0.46], [-1.8, 0.2, 0.36]]) {
            const j = (d % 2 ? 0.04 : 0) * e;
            line(g, [[Math.cos(a) * (r0 + j), Math.sin(a) * (r0 + j)], [Math.cos(a) * (r1 + j), Math.sin(a) * (r1 + j)]], L, K.ink);
        }
        g.restore();
    }

    /**
     * A rivet that pops out of a plate, placed with (x, y, s) on the rivet's own place: a
     * jagged star on the first two drawings, the rivet thrown out on an arc (it spins: a dome
     * and its shank), and the hole it leaves.
     *   age   seconds since it popped (nothing before 0);  dir  [vx, vy] in units a second
     */
    function rivetPop(g, x, y, s, age, dir = [1.6, -2.6]) {
        if (age < -1e-6) return;
        const L = 3.2 / s, f = Math.floor(age * 12 + 1e-6), tq = f / 12, out = Math.hypot(dir[0], dir[1]), u = [dir[0] / out, dir[1] / out];
        g.save();
        g.translate(x, y);
        g.scale(s, s);
        g.lineCap = 'round';
        // the hole: a jagged star on the first two drawings, then it hisses
        if (f < 2) C.burst(g, 0, 0, { r0: 0.07 + 0.03 * f, r1: 0.17 + 0.07 * f, n: 7, seed: 'v2b-rivet', jitter: 0.2, rot: f * 0.4, fill: f ? K.yellow : '#ffffff', ink: K.ink, lw: L * 0.8 });
        else {
            const list = [];
            for (let i = 0; i < 3; i++) {
                const v = (i + mod(f, 3) / 3) / 3;
                list.push([u[0] * (0.06 + 0.34 * v), u[1] * (0.06 + 0.34 * v) - 0.08 * v * v, 0.035 + 0.075 * v * (v > 0.7 ? (1 - v) / 0.3 : 1), 5, i + f * 0.7]);
            }
            puffs(g, list, '#fffdf4', L * 0.7);
        }
        dot(g, 0, 0, 0.03, '#2a2438', L * 0.6);
        // the rivet in the air, spinning, with the line of its flight behind it
        const px = dir[0] * tq, py = dir[1] * tq + 4.2 * tq * tq;
        if (tq < 1.2 && f >= 1) {
            const t0 = Math.max(0, tq - 0.11), qx = dir[0] * t0, qy = dir[1] * t0 + 4.2 * t0 * t0;
            line(g, [[lerp(qx, px, 0.25), lerp(qy, py, 0.25)], [lerp(qx, px, 0.8), lerp(qy, py, 0.8)]], L * 0.8, K.ink);
            g.translate(px, py);
            g.rotate(f * 1.3);
            g.scale(1.7, 1.7);
            C.poly(g, [[-0.014, 0], [0.014, 0], [0.014, 0.06], [-0.014, 0.06]], { fill: '#d98f0f', ink: K.ink, lw: L * 0.4 });
            C.poly(g, C.curve([[-0.045, 0.004], [-0.032, -0.03], [0, -0.042], [0.032, -0.03], [0.045, 0.004]], false, 4).concat([[0.045, 0.004], [-0.045, 0.004]]), { fill: K.gold, ink: K.ink, lw: L * 0.45 });
        }
        g.restore();
    }

    /**
     * A knock where something lands, placed with (x, y, s): a ring of short marks that opens
     * over three drawings. f: the drawing since the hit.
     */
    function knock(g, x, y, s, f, r = 0.3, n = 7) {
        if (f < 0 || f > 2) return;
        const L = 3.2 / s, r0 = r * (0.7 + 0.35 * f), r1 = r0 + r * (0.5 - 0.12 * f);
        g.save();
        g.translate(x, y);
        g.scale(s, s);
        g.lineCap = 'round';
        for (let i = 0; i < n; i++) {
            const a = Math.PI * (1.08 + (0.84 * i) / (n - 1));
            line(g, [[Math.cos(a) * r0, Math.sin(a) * r0 * 0.8], [Math.cos(a) * r1, Math.sin(a) * r1 * 0.8]], L * 1.1, K.ink);
        }
        g.restore();
    }

    return { WATER, puffs, patter, runs, waterHat, wheelSpray, puddles, spark, brollyClamp, bubblePop, whirl, whistle, rivetPop, knock };
})();
