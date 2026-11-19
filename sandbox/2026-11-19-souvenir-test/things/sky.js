// What flies and shines over the emblem, in the emblem manner (dark contour + airbrush):
// barn swallows as old tattoo flash draws them, a crescent moon, the eight-pointed star of
// the Alhambra's tilework and the far sky's twinkles. Global: Sky.
//
//   Sky.swallow(g, { x, y, s = 1, rot = 0, flip = false, pose = 0, seed })
//       (x, y) is the middle of the body. At s = 1 and rot = 0 the bird heads right and takes
//       x −163 … 83 (streamer tips to bill), y −134 … 168 (wing tip to wing tip: a span of 300).
//       rot turns it clockwise; flip mirrors the turned bird left to right, so two birds with
//       the same rot face each other. pose 0: the glide, wings spread wide; pose 1: the turn,
//       wings half folded back (span 214), tail fanned. seed: small differences between birds.
//   Sky.swallowBox(g, same options)   → { x, y, w, h } it covers
//   Sky.moon(g, { x, y, r = 90, rot = -0.5, phase = 0.28 })
//       (x, y) the centre of the disc, r its radius. phase is the lit fraction, 0.15 … 1; at
//       rot = 0 the lit limb is on the right (a waxing moon) and the face turns with rot.
//       The dark of the disc shows as earthshine with a soft edge. No halo: the lens adds it.
//   Sky.star(g, { x, y, r = 18, rot = 0, kind = 'gold' | 'silver' })   eight points, r to the tips
//   Sky.spark(g, { x, y, r = 6, rot = 0, tone = 1 })   a four-ray twinkle, r its upright ray;
//       under r = 2.4 a point of light; tone < 1 dims it towards the night
//   Sky.field(g, { box: { x, y, w, h }, seed, n = 60 })   small stars and sparks, thinner
//       towards the centre of the box
//
// The light stays at the top left however a piece is turned or mirrored: the swallow is
// turned and mirrored point by point and then painted, never by turning the canvas. The
// swallow and the moon are painted once into sprites (cached by their options and by the
// output resolution); stars and sparks are painted straight onto g.
const Sky = (() => {
    const S = Souvenir;
    const { clamp, smooth, lerp } = S;
    const DEG = Math.PI / 180;
    const LIT = [-S.SHADE_DIR[0], -S.SHADE_DIR[1]]; // towards the light, on the picture plane

    const cache = new Map();
    const memo = (key, fn) => {
        if (!cache.has(key)) {
            if (cache.size >= 48) cache.delete(cache.keys().next().value);
            cache.set(key, fn());
        }
        return cache.get(key);
    };
    // pixels per unit for a sprite pasted at scale s, rounded up to half steps
    const resOf = (g, s = 1) => Math.max(0.5, Math.ceil(S.pxScale(g) * s * 2 - 1e-6) / 2);
    const norm = (v) => {
        const l = Math.hypot(v[0], v[1]) || 1;
        return [v[0] / l, v[1] / l];
    };
    const mixP = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];

    // An airbrushed mark: a line (or a filled shape) whose edge is `blur` units soft. Use it
    // inside a clip (a piece's `detail`).
    function mist(g, pts, { color, alpha = 0.5, w = 4, blur = 4, fill = false, close = false } = {}) {
        const m = g.getTransform(), k = Math.hypot(m.a, m.b), BIG = 20000;
        g.save();
        g.setTransform(m.a, m.b, m.c, m.d, m.e - BIG, m.f);
        g.shadowColor = S.rgba(color, alpha);
        g.shadowBlur = blur * k;
        g.shadowOffsetX = BIG;
        g.shadowOffsetY = 0;
        g.beginPath();
        S.trace(g, pts, fill || close);
        if (fill) {
            g.fillStyle = '#000';
            g.fill();
        } else {
            g.lineWidth = w;
            g.lineCap = 'round';
            g.lineJoin = 'round';
            g.strokeStyle = '#000';
            g.stroke();
        }
        g.restore();
    }

    // ================================================================== swallow
    // Hirundo rustica in the old flash pose: banking, its belly towards us, the head level
    // and in profile, both wings open and swept back, the tail's fork behind.
    // Local frame: the bird heads along +x, y down, origin at the middle of the body.
    const BIRD = {
        ink: '#0b0d24',
        blue: '#1d2a55', sheen: '#4f6fb8', gleam: '#a9bdec', deep: '#0f1330',
        rust: '#b5482c', rustDeep: '#6e2418', rustLight: '#e08a58',
        cream: '#efe3c6', creamShade: '#8f8db0', creamDeep: '#6d6896', creamLight: '#fffaf0',
        spot: '#f1ead8',
    };
    // feather paints: flight feathers, then the rows of coverts, each a little bluer and lighter
    const FLIGHT = { base: '#131943', mid: '#1d2a55', tip: '#18214d', sheen: BIRD.sheen, gleam: BIRD.gleam, deep: BIRD.deep, light: 0.82, line: 1.15, ink: BIRD.ink, barb: 0.16, shaft: 1 };
    const GREAT = { ...FLIGHT, base: '#18214f', mid: '#22326a', tip: '#1c295c', sheen: '#587ac4', light: 0.86, line: 1.05 };
    const MEDIAN = { ...FLIGHT, base: '#1c2759', mid: '#273b7a', tip: '#213069', sheen: '#5f82cc', light: 0.88, line: 0.95, barb: 0 };
    const LESSER = { ...FLIGHT, base: '#202d64', mid: '#2b4186', tip: '#253873', sheen: '#6a8dd6', light: 0.9, line: 0.85, barb: 0, shaft: 0 };
    const TAILF = { ...FLIGHT, base: '#131943', mid: '#1c2852', tip: '#161d47', light: 0.8 };
    const DOWN = { base: '#dccdae', mid: BIRD.cream, tip: '#f5ecd6', sheen: BIRD.creamLight, gleam: '#fffdf2', deep: BIRD.creamShade, light: 0.6, line: 1.25, ink: S.INK, barb: 0.3, shaft: 0.6, pale: true };

    const POSES = [
        // 0 · the glide: wings spread wide
        { wings: [{ sweep: 0.4, fold: 0.04, len: 0.86 }, { sweep: 0.23, fold: 0, len: 0.95 }], tail: { spread: [27, 31], turn: 8 }, head: { tilt: 0.07, gape: 7 } },
        // 1 · the turn: wings half folded back, the tail fanned and twisted into it
        { wings: [{ sweep: 0.3, fold: 0.66, len: 0.86 }, { sweep: 0.16, fold: 0.5, len: 0.95 }], tail: { spread: [28, 34], turn: -1 }, head: { tilt: -0.12, gape: 0 } },
    ];

    // A feather's outline: the shaft leaves `b` along the unit vector `d` for `len` and bends
    // back, away from `n` (the unit normal on its leading side); `wl` and `wt` are the widths
    // of the leading and trailing vanes.
    function quill(b, d, n, len, wl, wt, o = {}) {
        const bend = o.bend ?? 0.05, tipN = o.tipN ?? 3, tipM = o.tipM ?? 0.7, base = o.base ?? 0.45, N = o.N ?? 16;
        const shaft = [], lead = [], trail = [];
        for (let i = 0; i <= N; i++) {
            const u = 1 - Math.pow(1 - i / N, 1.5);
            const px = b[0] + d[0] * len * u - n[0] * bend * len * u * u, py = b[1] + d[1] * len * u - n[1] * bend * len * u * u;
            const t = norm([d[0] - n[0] * bend * 2 * u, d[1] - n[1] * bend * 2 * u]);
            let nx = -t[1], ny = t[0];
            if (nx * n[0] + ny * n[1] < 0) {
                nx = -nx;
                ny = -ny;
            }
            const p = o.prof ? o.prof(u) : (base + (1 - base) * smooth(0, 0.3, u)) * Math.pow(Math.max(0, 1 - Math.pow(u, tipN)), tipM);
            shaft.push([px, py]);
            lead.push([px + nx * wl * p, py + ny * wl * p]);
            trail.push([px - nx * wt * p, py - ny * wt * p]);
        }
        return { poly: [...lead, ...trail.slice().reverse().slice(1)], shaft, lead, trail, n, d, wl, wt, len };
    }
    // a point of a feather's line at u (0 base … 1 tip)
    const along = (line, u) => {
        const N = line.length - 1, f = (1 - Math.pow(1 - clamp(u), 1 / 1.5)) * N, i = Math.min(N - 1, Math.floor(f));
        return mixP(line[i], line[i + 1], f - i);
    };

    function swallowSprite(o, res) {
        const { rot, flip, pose, seed } = o;
        const P = POSES[pose] ?? POSES[0];
        const rnd = Motion.rng('swallow/' + seed + '/' + pose);
        const rho = flip ? -rot : rot, cr = Math.cos(rho), sr = Math.sin(rho), fx = flip ? -1 : 1;
        // local → the sprite's frame (already mirrored and turned; the light never moves)
        const K = 1.1; // the drawing is laid out a little small: this brings the wingspan to 300
        const pt = (p) => [(p[0] * fx * cr - p[1] * sr) * K, (p[0] * fx * sr + p[1] * cr) * K];
        const vec = (p) => [p[0] * fx * cr - p[1] * sr, p[0] * fx * sr + p[1] * cr];
        const T = (pts) => pts.map(pt);
        const ops = [], all = [];
        const add = (pts, paint) => {
            for (const p of pts) all.push(p);
            ops.push(paint);
        };
        const piece = (local, opts) => {
            const pts = T(local);
            const o = group ? { ink: BIRD.ink, heavy: 0, ...opts } : opts;
            if (group) group.push(pts);
            add(pts, (g) => S.piece(g, pts, o));
            return pts;
        };
        const facing = (v) => v[0] * LIT[0] + v[1] * LIT[1]; // does this direction look at the light?
        // A group of feathers shares one heavy contour: every outline is first stroked wide
        // in ink under the whole group, so the lines between feathers can stay thin.
        let group = null;
        const outlined = (w, build) => {
            const polys = (group = []), slot = ops.length;
            ops.push(null);
            build();
            group = null;
            ops[slot] = (g) => {
                g.save();
                g.lineJoin = 'round';
                g.strokeStyle = g.fillStyle = BIRD.ink;
                for (const [dx, dy, lw] of [[S.SHADE_DIR[0] * w * 0.22, S.SHADE_DIR[1] * w * 0.22, w], [0, 0, w]]) {
                    g.lineWidth = lw;
                    g.beginPath();
                    for (const p of polys) S.trace(g, p.map(([x, y]) => [x + dx, y + dy]));
                    g.fill();
                    g.stroke();
                }
                g.restore();
            };
        };

        // One feather, painted. `side` +1: it lies over the feather on its leading side (the
        // wing as flash paints it: inner feather over outer); −1: over the one on its trailing
        // side (the tail from below: outer over inner). `extra(q, f)`: more detail.
        function plume(F, c, side = 1, extra = null) {
            const pts = T(F.poly), shaft = T(F.shaft), n = vec(F.n), w = (F.wl + F.wt) * K;
            const free = T(side > 0 ? F.lead : F.trail);
            const a = shaft[0], z = shaft[shaft.length - 1];
            const fn = [n[0] * side, n[1] * side]; // towards the free edge
            const lit = Math.max(0, facing(fn)), grouped = !!group;
            if (group) group.push(pts);
            add(pts, (g) => S.piece(g, pts, {
                fill: { from: a, to: z, stops: [[0, c.base], [0.45, c.mid], [1, c.tip]] },
                line: c.line, ink: c.ink, heavy: grouped ? 0 : 0.3,
                // its shadow on the feather it lies on
                cast: { blur: w * 0.5, dx: fn[0] * w * 0.2 + S.SHADE_DIR[0] * 1.2, dy: fn[1] * w * 0.2 + S.SHADE_DIR[1] * 1.2, color: c.pale ? 'rgba(74,66,120,0.55)' : 'rgba(4,6,24,0.78)' },
                // the shade under the feather that lies on it
                shade: { color: c.deep, alpha: c.pale ? 0.55 : 0.9, w: w * 0.45, dir: [-fn[0], -fn[1]] },
                // the light along its free edge
                light: { color: c.sheen, alpha: clamp(c.light + 0.3 * lit), w: w * 0.8, push: w * 0.36, dir: fn },
                detail: (q) => {
                    // barbs: fine lines from the shaft out and towards the tip
                    if (c.barb) {
                        const nb = Math.max(4, Math.round(F.len / 3.2));
                        q.lineWidth = 0.5;
                        q.lineCap = 'round';
                        for (const [sg, wv, col] of [[1, F.wl * K, S.rgba(c.pale ? c.deep : '#0a0d2c', c.barb)], [-1, F.wt * K, S.rgba(c.pale ? c.deep : '#070920', c.barb * 1.3)]]) {
                            q.strokeStyle = col;
                            q.beginPath();
                            for (let i = 1; i < nb; i++) {
                                const u = i / nb, p = along(shaft, u), p2 = along(shaft, Math.min(1, u + 0.03));
                                const t = norm([p2[0] - p[0], p2[1] - p[1]]);
                                q.moveTo(p[0], p[1]);
                                q.lineTo(p[0] + (t[0] * 0.8 + sg * n[0] * 0.6) * wv * 1.8, p[1] + (t[1] * 0.8 + sg * n[1] * 0.6) * wv * 1.8);
                            }
                            q.stroke();
                        }
                    }
                    if (extra) extra(q, { pts, shaft, n });
                    // a clean thread of light just inside the free edge, where it looks at the light
                    if (lit > 0.15 || c.pale) {
                        const edge = [];
                        for (let i = 0; i <= 12; i++) {
                            const p = along(free, 0.12 + 0.8 * (i / 12));
                            edge.push([p[0] - fn[0] * (c.line * 0.5 + 0.7), p[1] - fn[1] * (c.line * 0.5 + 0.7)]);
                        }
                        S.ink(q, edge, { w: 0.8, color: c.gleam, alpha: c.pale ? 0.7 : 0.75 * smooth(0.15, 0.7, lit), taper: [1, 1] });
                    }
                    // the shaft: an ink line with a thread of light on its lit side
                    if (c.shaft) {
                        S.ink(q, shaft, { w: Math.min(1.3, w * 0.11), color: c.pale ? '#a89a7c' : '#080a20', taper: [0.1, 1], alpha: c.shaft });
                        S.ink(q, shaft.map((p) => [p[0] + LIT[0] * 0.7, p[1] + LIT[1] * 0.7]), { w: 0.5, color: c.pale ? '#fffdf2' : c.gleam, taper: [0.6, 1], alpha: (c.pale ? 0.8 : 0.5) * c.shaft });
                    }
                },
            }));
        }

        // ---------------------------------------------------------------- tail
        // Twelve feathers from under the vent, six a side: the middle pair short, the outer
        // pair drawn out into streamers. Seen from below the outer ones lie over the inner
        // ones, and every feather but the middle pair shows the white spot on its inner web.
        const TB = [-32, 2.6];
        outlined(2.3, () => {
            const lens = [43, 46, 50, 55, 63, 118];
            const feathers = [];
            for (let k = 1; k <= 6; k++) {
                for (const tau of [-1, 1]) {
                    const spread = P.tail.spread[tau < 0 ? 0 : 1];
                    const ang = (P.tail.turn + tau * (2.4 + (spread - 2.4) * Math.pow((k - 1) / 5, 1.05))) * DEG;
                    const d = [-Math.cos(ang), Math.sin(ang)], n = [Math.sin(ang) * tau, Math.cos(ang) * tau]; // n: the outer side
                    const L = lens[k - 1] * (1 + (rnd() - 0.5) * 0.03);
                    const streamer = k === 6;
                    const F = quill(TB, d, n, L, streamer ? 3.1 : 3.1, streamer ? 6.6 : 7.2, streamer
                        ? { bend: 0.09, N: 30, prof: (u) => (0.5 + 0.5 * smooth(0, 0.14, u)) * lerp(1, 0.44, smooth(0.22, 0.7, u)) * Math.pow(Math.max(0, 1 - Math.pow(u, 9)), 0.62) }
                        : { bend: 0.012 * (k - 1), tipN: 6, tipM: 0.5 });
                    feathers.push({ F, k, L, streamer });
                }
            }
            for (const { F, k, L, streamer } of feathers) {
                plume(F, streamer ? { ...TAILF, line: 1.25 } : TAILF, -1, k === 1 ? null : (q, f) => {
                    // the white spot on the inner web, in a row across the spread tail
                    const u = streamer ? 0.42 : 1 - 15.5 / L, len = streamer ? 12 : 8.4;
                    const c0 = along(f.shaft, u - (len / L) * 0.5), c1 = along(f.shaft, u + (len / L) * 0.5);
                    const wv = F.wt * K * (streamer ? 0.62 : 0.93), w0 = F.wt * K * (streamer ? 0.12 : 0.3);
                    const at = (k0, kw) => [c0[0] + (c1[0] - c0[0]) * k0 - f.n[0] * kw, c0[1] + (c1[1] - c0[1]) * k0 - f.n[1] * kw];
                    const spot = S.curve([at(0, w0), at(-0.08, (w0 + wv) / 2), at(0.1, wv), at(0.62, wv), at(1.08, (w0 + wv) / 2 + 0.6), at(0.9, w0)], true, 6);
                    q.save();
                    q.beginPath();
                    S.trace(q, spot);
                    q.fillStyle = BIRD.spot;
                    q.fill();
                    q.clip();
                    S.spray(q, spot, { color: BIRD.creamShade, alpha: 0.75, w: 2.4 });
                    q.restore();
                    q.lineWidth = 0.6;
                    q.strokeStyle = S.rgba('#070920', 0.6);
                    q.beginPath();
                    S.trace(q, spot);
                    q.stroke();
                });
            }
        });

        // ---------------------------------------------------------------- wings
        // Wing frame: u out along the span from the shoulder, v back towards the tail.
        // The arm is short and the hand long: nine primaries fan from the hand, six
        // secondaries and three tertials stand on the forearm, and rows of coverts tile the
        // arm like a roof from the leading edge back. The alula sits on the wrist.
        function wing(sg, wp) {
            const f = wp.fold, k = wp.len, cs = Math.cos(wp.sweep), sn = Math.sin(wp.sweep);
            const SX = 25, SY = 11 * sg;
            const wm = (u, v) => [SX - (u * sn + v * cs) * k, SY + sg * (u * cs - v * sn) * k];
            const wv = (du, dv) => norm([-(du * sn + dv * cs), sg * (du * cs - dv * sn)]);
            const E = [15 - 3 * f, 7 - f], W = [50 - 16 * f, -12 - 3 * f];
            const a9 = 25 + 42 * f, a1 = 74 + 14 * f;
            const Hd = [W[0] + Math.cos((a9 - 10) * DEG) * 20, W[1] + Math.sin((a9 - 10) * DEG) * 20];
            const jit = () => 1 + (rnd() - 0.5) * 0.03;
            const mk = (b, deg, L, wl, wt, o) => {
                const d = [Math.cos(deg * DEG), Math.sin(deg * DEG)];
                return quill(wm(b[0], b[1]), wv(d[0], d[1]), wv(d[1], -d[0]), L * k * jit(), wl * k, wt * k, o);
            };
            const pAng = (t) => lerp(a1, a9, Math.pow(t, 0.8));
            const sAng = (t) => lerp(82, 95, t) + 10 * f;
            // flight feathers, the outermost primary first (it lies under all the others)
            for (let i = 9; i >= 1; i--) {
                const t = (i - 1) / 8;
                plume(mk(mixP(W, Hd, t), pAng(t), lerp(52, 112, Math.pow(t, 1.25)), lerp(4, 3.2, t), lerp(10.8, 8.6, t), { bend: lerp(0.04, 0.115, t * t), tipN: 3.6, tipM: 0.62 }), FLIGHT);
            }
            for (let j = 1; j <= 6; j++) {
                const t = (j - 0.5) / 6;
                plume(mk(mixP(W, E, t), sAng(t), lerp(49, 43, t), 3.8, 9.8, { bend: 0.025, tipN: 6, tipM: 0.5 }), FLIGHT);
            }
            for (let m = 1; m <= 3; m++) plume(mk(mixP(E, [3, 6], m / 3.3), 96 + 5 * m + 10 * f, 41 - 5.5 * m, 3.6, 8, { bend: 0.02, tipN: 4.5, tipM: 0.55 }), FLIGHT);
            // the innermost feathers lie back along the body and close the wing onto it
            for (let m = 0; m < 2; m++) plume(mk([4 - 3 * m, 7 + 2 * m], 114 + 13 * m + 8 * f - wp.sweep / DEG * 0.5, 32 - 5 * m, 3.2, 6.4, { bend: 0.02, tipN: 3.6, tipM: 0.6 }), GREAT);
            // the arm itself, under the coverts
            piece(S.curve([wm(-5, -5), wm(20, -10), wm(W[0], W[1] - 3.5), wm(Hd[0] + 2, Hd[1] - 3), wm(Hd[0] + 3, Hd[1] + 4), wm(W[0], W[1] + 10), wm(E[0], E[1] + 10), wm(-5, 14)], true, 6), { fill: BIRD.deep, line: 0 });
            // greater coverts: one over the base of every flight feather
            for (let i = 9; i >= 1; i--) {
                const t = (i - 1) / 8;
                plume(mk(mixP(W, Hd, t), pAng(t) - 2, lerp(19, 40, Math.pow(t, 1.1)), 2.8, 6.6, { bend: lerp(0.04, 0.09, t * t), tipN: 3.4, tipM: 0.68 }), GREAT);
            }
            for (let j = 1; j <= 8; j++) {
                const t = (j - 0.5) / 8;
                plume(mk(mixP(W, [3, 6], t), lerp(84, 103, t) + 10 * f, lerp(24, 19, t), 3.4, 7.4, { bend: 0.03, tipN: 5, tipM: 0.5 }), GREAT);
            }
            // median coverts
            for (let i = 4; i >= 1; i--) {
                const t = i / 4.6;
                plume(mk(mixP([W[0] + 1, W[1] - 1], [Hd[0], Hd[1] - 1], t), pAng(t) - 5, lerp(12, 17, t), 2.4, 4.6, { bend: 0.03, tipN: 3.6, tipM: 0.62 }), MEDIAN);
            }
            for (let j = 0; j <= 8; j++) {
                const t = j / 8;
                plume(mk(mixP([W[0] - 2, W[1] - 2.5], [E[0] - 9, E[1] - 3], t), 86 + 12 * t + 10 * f, 13.5, 3.2, 5.6, { bend: 0.02, tipN: 5, tipM: 0.5 }), MEDIAN);
            }
            // lesser coverts: rows of small scales over the fold of skin ahead of the forearm
            const LE = (t) => {
                const p = mixP([-5, -5.4], [W[0] + 1.5, W[1] - 3.6], t);
                return [p[0], p[1] - Math.sin(Math.pow(t, 1.3) * Math.PI) * 3];
            };
            const boneV = (u) => lerp(E[1], W[1], clamp((u - E[0]) / (W[0] - E[0])));
            for (const [back, L, n, off] of [[9.5, 8.6, 9, 0], [5.5, 8, 10, 0.5], [1.7, 7, 11, 0]]) {
                for (let j = 0; j <= n; j++) {
                    const t = (j + off) / (n + 0.5), b = LE(1 - t);
                    if (b[1] + back > boneV(b[0]) - 1.5) continue;
                    plume(mk([b[0], b[1] + back], 84 + 12 * t + 10 * f, L, 3, 4.3, { bend: 0, tipN: 5, tipM: 0.5, base: 0.62, N: 9 }), LESSER);
                }
            }
            // the alula: three stiff little feathers on the wrist, along the hand's leading edge
            for (let m = 0; m < 3; m++) plume(mk([W[0] + 1.5 + m * 0.6, W[1] - 2.2 - m * 0.5], a9 - 6 + 5 * (2 - m), 15 + 4.5 * m, 1.7, 3.3, { bend: 0.03, tipN: 3, tipM: 0.7 }), MEDIAN);
            // the leading edge: the fold of skin from shoulder to wrist, lit where it looks at the light
            const lead = [], back = [];
            for (let i = 0; i <= 14; i++) {
                const t = i / 14, b = LE(t), wd = 0.9 + 1.5 * Math.sin(Math.pow(t, 0.8) * Math.PI);
                lead.push(wm(b[0], b[1] - 0.4));
                back.push(wm(b[0], b[1] + wd));
            }
            const glaze = [T([wm(34, 6), wm(66, 14), wm(98, 30)]), T([wm(120, 52), wm(150, 60)]), T([wm(0, 20), wm(8, 44)])];
            add([], (g) => {
                g.save();
                g.globalCompositeOperation = 'source-atop';
                mist(g, glaze[0], { color: '#6f93dc', alpha: 0.2 + 0.14 * Math.max(0, facing(vec(wv(0, -1)))), w: 9 * k, blur: 20 * k });
                mist(g, glaze[1], { color: '#080a22', alpha: 0.26, w: 12 * k, blur: 18 * k });
                mist(g, glaze[2], { color: '#080a22', alpha: 0.4, w: 8 * k, blur: 14 * k });
                g.restore();
            });
            const fwd = vec(wv(0, -1));
            piece([...lead, ...back.reverse()], {
                fill: '#2c4288', line: 1.1, ink: BIRD.ink, heavy: 0.3,
                cast: { blur: 2.5, dx: -fwd[0] * 1.2 + 0.8, dy: -fwd[1] * 1.2 + 1, color: 'rgba(5,7,26,0.6)' },
                shade: { color: BIRD.deep, alpha: 0.7, w: 2, dir: [-fwd[0], -fwd[1]] },
                light: { color: BIRD.gleam, alpha: 0.3 + 0.55 * Math.max(0, facing(fwd)), w: 1.5, dir: fwd },
            });
        }
        outlined(2.7, () => wing(-1, P.wings[0]));
        outlined(2.7, () => wing(1, P.wings[1]));

        // ---------------------------------------------------------------- body
        const rear = vec([-1, 0]);
        const bodyCast = { blur: 7, dx: 3, dy: 4, color: 'rgba(4,6,24,0.66)' };
        outlined(3, () => {
            // under-tail coverts: long cream feathers over the tail's root
            for (const [deg, L, w] of [[-13, 25, 4.6], [12, 26, 4.6], [-1, 31, 5]]) {
                const a = (deg + P.tail.turn * 0.6) * DEG, d = [-Math.cos(a), Math.sin(a)];
                plume(quill([-30, 2.6], d, [d[1], -d[0]], L, w, w, { bend: 0, tipN: 3, tipM: 0.7, base: 0.8 }), DOWN, deg > 0 ? -1 : 1);
            }
            const belly = S.curve([[36, -15.2], [22, -16.6], [8, -16.4], [-10, -13.8], [-26, -8.6], [-40, -2.4], [-45, 2.6], [-37, 9.2], [-22, 15.2], [-4, 18.8], [14, 19.6], [28, 17.8], [37.5, 13.4], [38.5, -2]], true, 8);
            const ticks = [];
            for (let ix = -40; ix < 24; ix += 5.4) {
                for (let iy = -17; iy <= 17; iy += 4.8) {
                    if (rnd() < 0.3) continue;
                    const cx = ix + (rnd() - 0.5) * 2.6 + (Math.round(iy / 4.8) % 2 ? 2.7 : 0), cy = iy + (rnd() - 0.5) * 2, r = 2.4 + rnd() * 1.2;
                    const arc = [];
                    for (let j = 0; j <= 6; j++) {
                        const a = (122 + j * 19.4) * DEG;
                        arc.push([cx + Math.cos(a) * r * 0.75, cy + Math.sin(a) * r]);
                    }
                    ticks.push({ arc: T(arc), c: pt([cx, cy]) });
                }
            }
            piece(belly, {
                fill: BIRD.cream, line: 1.3, cast: bodyCast,
                shade: [{ color: BIRD.creamShade, alpha: 0.9, w: 13, push: 7 }, { color: BIRD.creamDeep, alpha: 0.5, w: 4.5 }],
                light: { color: BIRD.creamLight, alpha: 0.85, w: 10, push: 4.5 },
                detail: (q) => {
                    // a warm buff towards the vent
                    mist(q, T([[-47, 2.4], [-35, 2]]), { color: '#d9a574', alpha: 0.5, w: 12, blur: 15 });
                    // breast feathers: loose soft scallops, clearer where the form turns from the light
                    for (const tk of ticks) {
                        const sh = clamp(0.42 + (tk.c[0] * S.SHADE_DIR[0] + tk.c[1] * S.SHADE_DIR[1]) / 26);
                        S.ink(q, tk.arc, { w: 0.8, color: BIRD.creamDeep, alpha: 0.05 + 0.4 * sh * sh, taper: [1, 1] });
                    }
                },
            });

            // the head turns on the neck
            const tilt = P.head.tilt, piv = [36, -2], ct = Math.cos(tilt), st = Math.sin(tilt);
            const hp = (p) => [piv[0] + (p[0] - piv[0]) * ct - (p[1] - piv[1]) * st, piv[1] + (p[0] - piv[0]) * st + (p[1] - piv[1]) * ct];
            const H = (pts) => pts.map(hp);
            // a run of feather tips along an edge: scallops pushed out by `amp`
            const scallop = (line, n, amp, centre) => line.map((p, i) => {
                const a = line[Math.max(0, i - 1)], b = line[Math.min(line.length - 1, i + 1)];
                let nx = -(b[1] - a[1]), ny = b[0] - a[0];
                const l = Math.hypot(nx, ny) || 1;
                if (nx * (p[0] - centre[0]) + ny * (p[1] - centre[1]) < 0) {
                    nx = -nx;
                    ny = -ny;
                }
                const kk = amp * Math.abs(Math.sin((i / (line.length - 1)) * Math.PI * n));
                return [p[0] + (nx / l) * kk, p[1] + (ny / l) * kk];
            });

            // the breast band: a blue-black crescent round the bib, its feather tips over the cream
            const bandOut = scallop(S.curve([[37.6, -16.4], [31.4, -13.6], [27.4, -7], [26.2, 1.2], [27.6, 9.6], [32, 15], [38.6, 16.6]], false, 10), 6, 1, [44, 0]);
            const bandIn = S.curve([[41, 13.4], [35, 9], [32.5, 0.8], [34, -7], [40, -13.4]], false, 8);
            piece([...bandOut, ...bandIn], {
                fill: '#18224e', line: 1.2,
                cast: { blur: 4, dx: rear[0] * 1.6 + 1.2, dy: rear[1] * 1.6 + 1.6, color: 'rgba(60,52,110,0.55)' },
                shade: { color: BIRD.deep, alpha: 0.9, w: 5.5 },
                light: { color: BIRD.sheen, alpha: 0.9, w: 4.5 },
                detail: (q) => {
                    mist(q, T(S.curve([[31.5, -12.4], [27.4, -6], [26, 0.6]], false, 6)), { color: BIRD.gleam, alpha: 0.6, w: 0.8, blur: 1.5 });
                },
            });
            // the throat: rust from the chin back to the bib on the breast
            const bibRear = scallop(S.curve(H([[40, -13.4], [34, -7], [32.5, 0.8], [35, 9], [41, 13.6]]), false, 9), 5, 0.9, [46, 0]);
            piece([...bibRear, ...S.curve(H([[41, 13.6], [46.5, 11.6], [52.5, 8.2], [58, 3.6], [62, -0.9]]), false, 8).slice(1), ...S.curve(H([[62, -0.9], [56, -3.2], [49.5, -4.2], [44, -7], [40, -13.4]]), false, 8).slice(1, -1)], {
                fill: BIRD.rust, line: 1.2,
                cast: { blur: 3.5, dx: rear[0] * 1.4 + 1, dy: rear[1] * 1.4 + 1.4, color: 'rgba(5,7,26,0.6)' },
                shade: [{ color: BIRD.rustDeep, alpha: 1, w: 10, push: 6.5 }, { color: '#4a1420', alpha: 0.6, w: 3.4 }, { color: BIRD.rustDeep, alpha: 0.7, w: 5, dir: rear }],
                light: { color: BIRD.rustLight, alpha: 0.85, w: 6, push: 2.6 },
                detail: (q) => {
                    const r2 = Motion.rng('bib' + seed);
                    for (let i = 0; i < 22; i++) {
                        const p = hp([35 + r2() * 24, -5 + r2() * 15]), dd = 1.4 + r2() * 1.4;
                        S.ink(q, T([[p[0] + dd, p[1] - dd * 0.5], [p[0], p[1]], [p[0] + dd * 0.8, p[1] + dd * 0.6]]), { w: 0.7, color: BIRD.rustDeep, alpha: 0.5, taper: [1, 1] });
                    }
                    // the swell of the throat takes the light; under the chin and by the band it deepens
                    mist(q, T(H([[42, -2], [49, 0.4], [55, -0.6]])), { color: '#ee9a62', alpha: 0.6, w: 2.2, blur: 4.5 });
                    mist(q, T(H([[45, 0.4], [50, 1]])), { color: '#ffc796', alpha: 0.5, w: 0.8, blur: 1.6 });
                    mist(q, T(H([[44, 12.5], [54, 8.4], [61, 2.4]])), { color: '#56161c', alpha: 0.6, w: 2.4, blur: 4 });
                },
            });
            // the cap: crown, nape and the mask through the eye, glossy blue-black
            const cap = S.curve(H([[62.7, -5.6], [60.2, -11.6], [53.4, -16.4], [45, -17.9], [37.6, -17.9], [33.8, -15], [39.6, -13.2], [44, -7], [49.5, -4.1], [56, -3], [62.4, -2]]), true, 8);
            piece(cap, {
                fill: BIRD.blue, line: 1.3,
                cast: { blur: 3.5, dx: 1.2, dy: 2.2, color: 'rgba(40,10,14,0.55)' },
                shade: [{ color: BIRD.deep, alpha: 0.95, w: 8, push: 4.5 }, { color: '#070920', alpha: 0.6, w: 2.6 }],
                light: { color: BIRD.sheen, alpha: 0.95, w: 7, push: 3.5 },
                detail: (q) => {
                    mist(q, T(H(S.curve([[39, -15.4], [45.5, -15.8], [52, -14.4], [56.6, -11.4]], false, 6))), { color: BIRD.gleam, alpha: 0.75, w: 0.9, blur: 1.8 });
                    // the black of the lores, from the bill to behind the eye
                    mist(q, T(H([[62, -4], [54, -6.4], [46.5, -6.6]])), { color: '#060716', alpha: 0.75, w: 3, blur: 2.6 });
                },
            });
            // the forehead: rust above the bill
            piece(S.curve(H([[62.9, -5.9], [61.3, -10.8], [57.7, -14.3], [54.4, -13.6], [54.9, -10.2], [58, -7.5]]), true, 7), {
                fill: BIRD.rust, line: 1,
                shade: { color: BIRD.rustDeep, alpha: 0.9, w: 3.6 },
                light: { color: BIRD.rustLight, alpha: 0.85, w: 3 },
            });
            // the bill: short, broad at the gape; the lower mandible drops when it calls
            const gape = P.head.gape * DEG, gp = [61.8, -2.3];
            const jaw = (p) => [gp[0] + (p[0] - gp[0]) * Math.cos(gape) - (p[1] - gp[1]) * Math.sin(gape), gp[1] + (p[0] - gp[0]) * Math.sin(gape) + (p[1] - gp[1]) * Math.cos(gape)];
            if (gape > 0.01) piece(H([[62, -2.8], [70.4, -2.1], jaw([70.4, -0.6]), [62, -1.4]]), { fill: '#4a1418', line: 0 });
            piece(S.curve(H([[61.6, -2], [66, -1.8], [72.2, -0.6], [68.2, 0.9], [64.4, 1.3], [61.2, 0.5]].map(jaw)), true, 6), {
                fill: '#2a2836', line: 1,
                shade: { color: '#0a0a16', alpha: 0.9, w: 1.8 },
            });
            piece(S.curve(H([[61.6, -6.3], [66, -5.7], [71, -4], [75.4, -1.9], [74.8, -1.1], [70.4, -2.1], [66, -2.5], [61.7, -2.6]]), true, 6), {
                fill: '#2f2d3d', line: 1,
                shade: { color: '#0a0a16', alpha: 0.9, w: 2.2 },
                light: { color: '#8e97bd', alpha: 0.9, w: 1.5 },
                detail: (q) => {
                    mist(q, T(H([[63.6, -5.2], [68.6, -4.5]])), { color: '#c9d0ea', alpha: 0.7, w: 0.5, blur: 0.8 });
                    // the nostril
                    S.ink(q, T(H([[63.6, -4.1], [65.2, -3.8]])), { w: 0.75, color: '#07070f', taper: [0.5, 0.5] });
                },
            });
            // the eye: dark and wet, in a thin pale ring
            const eye = hp([51.6, -9]), eyeR = 3.2, ec = pt(eye);
            add(T(S.ellipse(eye[0], eye[1], eyeR + 1.2, eyeR + 1.2, 12)), (g) => {
                const disc = (dx, dy, r, col) => {
                    g.fillStyle = col;
                    g.beginPath();
                    g.arc(ec[0] + dx, ec[1] + dy, r, 0, 6.3);
                    g.fill();
                };
                disc(0.2, 0.25, eyeR + 1, '#05060f');
                disc(0, 0, eyeR + 0.5, '#7189c4');
                const gr = g.createRadialGradient(ec[0] + 0.8, ec[1] + 1, 0.3, ec[0], ec[1], eyeR);
                gr.addColorStop(0, '#6b3d1c');
                gr.addColorStop(0.45, '#2a1710');
                gr.addColorStop(1, '#07060c');
                disc(0, 0, eyeR, gr);
                disc(0, 0, eyeR * 0.52, '#04040a');
                disc(-eyeR * 0.36, -eyeR * 0.4, eyeR * 0.3, '#fbf6e6');
                disc(eyeR * 0.42, eyeR * 0.46, eyeR * 0.13, 'rgba(200,214,255,0.7)');
            });
        });

        const box = S.bbox(all, 9);
        const c = document.createElement('canvas');
        c.width = Math.ceil(box.w * res);
        c.height = Math.ceil(box.h * res);
        const g = c.getContext('2d');
        g.setTransform(res, 0, 0, res, -box.x * res, -box.y * res);
        for (const op of ops) op(g);
        return { canvas: c, box };
    }

    const swallowOf = (g, { s = 1, rot = 0, flip = false, pose = 0, seed = 'golondrina' }) => {
        const res = resOf(g, s);
        return memo(`swallow/${pose}/${flip ? 1 : 0}/${rot.toFixed(4)}/${seed}@${res}`, () => swallowSprite({ rot, flip, pose, seed }, res));
    };
    function swallow(g, o = {}) {
        const { x = 0, y = 0, s = 1 } = o, sp = swallowOf(g, o);
        g.drawImage(sp.canvas, x + sp.box.x * s, y + sp.box.y * s, sp.box.w * s, sp.box.h * s);
    }
    // What a swallow covers, in the caller's units (with a margin of 9 × s for its contour).
    function swallowBox(g, o = {}) {
        const { x = 0, y = 0, s = 1 } = o, b = swallowOf(g, o).box;
        return { x: x + b.x * s, y: y + b.y * s, w: b.w * s, h: b.h * s };
    }

    // ================================================================== moon
    // The near side as it is: the seas by their longitude and latitude (east, Crisium's
    // side, on the right), so a waxing crescent shows Crisium and Fecunditatis and the full
    // moon its whole face. [lon°, lat°, radius°, strength]
    const sph = (lon, lat) => [Math.cos(lat * DEG) * Math.sin(lon * DEG), -Math.sin(lat * DEG), Math.cos(lat * DEG) * Math.cos(lon * DEG)];
    const SEAS = [
        [59, 17, 8.5, 1], [51, -6, 10, 0.9], [35, -15, 6.5, 0.85], [31, 8, 13, 1], [18, 28, 11, 1], [4, 13, 4.5, 0.7],
        [-16, 33, 19, 1], [-57, 18, 20, 0.9], [-45, 0, 14, 0.8], [-62, 36, 9, 0.7], [-28, 6, 8, 0.6], [-23, -10, 7.5, 0.7],
        [-17, -21, 11, 0.9], [-39, -24, 7, 0.9], [-30, 57, 6, 0.6], [-12, 58, 6, 0.6], [6, 56, 6, 0.6], [24, 55, 6, 0.55],
        [86, 14, 5, 0.7], [87, -2, 5.5, 0.7], [80, 57, 4.5, 0.6], [-68, -5, 3.6, 0.9], [-9, 51, 2.6, 0.9], [57, 54, 3, 0.7], [70, -18, 4, 0.5],
    ].map(([lon, lat, rad, k]) => ({ v: sph(lon, lat), rad: rad * DEG, k }));
    // craters: [lon, lat, radius°, kind] kind 1 a bright young one, 0 a walled plain
    const CRATERS = [
        [-11, -43, 2.6, 1], [-20, 10, 2.6, 1], [-38, 8, 1.7, 1], [-47, 24, 1.6, 1], [47, 16, 1.4, 1],
        [61, -9, 3.6, 0], [60, -25, 4, 0], [56, 28, 3.4, 0], [26, -11, 3, 0], [64, 42, 3, 0], [39, 47, 2.6, 0], [72, 5, 2.6, 0], [47, -33, 3.2, 0], [66, -38, 3, 0], [14, -40, 3.4, 0], [-3, -9, 3.4, 0], [-2, 30, 2, 0],
    ].map(([lon, lat, rad, kind]) => ({ v: sph(lon, lat), rad: rad * DEG, kind }));
    const MOON = [[0, '#5b5889'], [0.2, '#77749f'], [0.4, '#8f8db0'], [0.6, '#b7b7d0'], [0.8, '#d9dcea'], [1, '#eef0f5']];
    const WARM = [243, 236, 210]; // the light on the lit limb

    function moonSprite(r, rot, phase, res) {
        const lw = clamp(r * 0.027, 1.5, 2.8);
        const pad = Math.ceil(lw * 2.4 + 2);
        const box = { x: -r - pad, y: -r - pad, w: 2 * (r + pad), h: 2 * (r + pad) };
        const w = Math.ceil(box.w * res), h = Math.ceil(box.h * res);
        const mk = () => {
            const c = document.createElement('canvas');
            c.width = w;
            c.height = h;
            return c;
        };
        const litC = mk(), earthC = mk(), out = mk();
        const lg = litC.getContext('2d'), eg = earthC.getContext('2d');
        const li = lg.createImageData(w, h), ei = eg.createImageData(w, h), lp = li.data, ep = ei.data;
        const f = clamp(phase, 0.03, 1), c = 1 - 2 * f, cr = Math.cos(rot), sr = Math.sin(rot);
        const ramp = S.rampFn(MOON, 1), rgb = [0, 0, 0];
        const house = S.smooth(0.55, 1, f); // a full moon is modelled by the emblem's own light
        const Lh = [-0.5, -0.6, 0.62];
        const k = r * res;
        for (let j = 0, i = 0; j < h; j++) {
            for (let ii = 0; ii < w; ii++, i++) {
                const X = (box.x + (ii + 0.5) / res) / r, Y = (box.y + (j + 0.5) / res) / r;
                const rho2 = X * X + Y * Y;
                if (rho2 > 1.03) continue;
                const rho = Math.sqrt(rho2), edge = clamp((1 - rho) * k + 0.5);
                if (edge <= 0) continue;
                // the moon's own frame: the lit limb towards +x
                const q = rho > 1 ? 1 / rho : 1;
                const mx = (X * cr + Y * sr) * q, my = (-X * sr + Y * cr) * q, mz = Math.sqrt(Math.max(0, 1 - Math.min(1, rho2)));
                const hh = Math.sqrt(Math.max(1e-6, 1 - my * my));
                const lit = clamp((mx - c * hh) * k + 0.5);
                // seas and craters, laid on the sphere; the shore of every sea wanders
                const wob = 1 + 0.3 * S.noise3(mx * 4.2, my * 4.2, mz * 4.2, 31) + 0.16 * S.noise3(mx * 11, my * 11, mz * 11, 32);
                let sea = 0;
                for (const b of SEAS) {
                    const d = mx * b.v[0] + my * b.v[1] + mz * b.v[2];
                    if (d < 0.6) continue;
                    const a = Math.acos(Math.min(1, d)) * wob, s = smooth(b.rad * lerp(1.38, 1.24, house), b.rad * lerp(0.22, 0.46, house), a) * b.k;
                    sea += s - sea * s;
                }
                sea *= 0.82 + 0.3 * S.noise3(mx * 8 + 2, my * 8, mz * 8, 33);
                let pit = 0;
                for (const b of CRATERS) {
                    const d = mx * b.v[0] + my * b.v[1] + mz * b.v[2];
                    if (d < 0.9) continue;
                    const a = Math.acos(Math.min(1, d));
                    if (a > b.rad * 2.4) continue;
                    if (b.kind) pit += 0.1 * smooth(b.rad * 1.7, b.rad * 0.15, a);
                    else {
                        // a ring: the wall that looks at the sun is light, the other in shade
                        const ring = Math.exp(-Math.pow((a - b.rad) / (b.rad * 0.42), 2)), side = (mx - b.v[0]) / (Math.sin(a) + 1e-4);
                        pit += ring * (-0.085 * side) - 0.035 * smooth(b.rad, b.rad * 0.4, a);
                    }
                }
                const grain = 0.026 * S.noise2(mx * 7 + 3, my * 7, 41) + 0.02 * S.noise2(mx * 19, my * 19 + 5, 42);
                if (lit > 0) {
                    const tn = clamp((mx - c * hh) / (hh * (1 - c) + 1e-6)); // 0 on the terminator, 1 on the lit limb
                    // shade towards the inner edge, a clean warm light inside the limb
                    const belly = Math.pow(Math.max(0, 1 - my * my), 0.8);
                    let tone = 0.2 + 0.5 * Math.pow(tn, 0.6) + 0.26 * smooth(0.6, 0.95, tn) * belly;
                    tone += 0.05 * (X * LIT[0] + Y * LIT[1]);
                    const sphere = 0.5 + 0.44 * (X * Lh[0] + Y * Lh[1] + mz * Lh[2]);
                    tone = lerp(tone, sphere, house);
                    // the warm light is laid smoothly over the form, whatever the seas do under it
                    const warm = lerp(smooth(0.5, 0.98, tn) * belly, smooth(0.6, 0.93, sphere), house) * (1 - lerp(0.45, 0.85, house) * sea) * 0.9;
                    // towards the terminator the low sun picks out the relief
                    const rough = (1 - house) * Math.pow(1 - tn, 2.2);
                    tone += rough * (0.11 * S.noise3(mx * 20, my * 20, mz * 20, 43) + 0.06 * S.noise3(mx * 46, my * 46, mz * 46, 44));
                    tone += pit * (1 + 1.2 * rough) - sea * lerp(0.19, 0.3, house) + grain;
                    ramp(clamp(tone), rgb);
                    // the seas are cooler as well as darker
                    const sc = sea * 0.28;
                    rgb[0] += (132 - rgb[0]) * sc;
                    rgb[1] += (130 - rgb[1]) * sc;
                    rgb[2] += (176 - rgb[2]) * sc;
                    rgb[0] += (WARM[0] - rgb[0]) * warm;
                    rgb[1] += (WARM[1] - rgb[1]) * warm;
                    rgb[2] += (WARM[2] - rgb[2]) * warm;
                    lp[i * 4] = rgb[0];
                    lp[i * 4 + 1] = rgb[1];
                    lp[i * 4 + 2] = rgb[2];
                    lp[i * 4 + 3] = 255 * lit * edge;
                }
                if (lit < 1) {
                    // earthshine: the dark of the disc, a little lighter than the night, no edge
                    const v = 1 - sea * 0.07 + grain * 0.5;
                    ep[i * 4] = 42 * v;
                    ep[i * 4 + 1] = 47 * v;
                    ep[i * 4 + 2] = 89 * v;
                    ep[i * 4 + 3] = 255 * 0.9 * smooth(1.0, 0.82, rho);
                }
            }
        }
        lg.putImageData(li, 0, 0);
        eg.putImageData(ei, 0, 0);
        // the lit shape: the limb from horn to horn, and back along the terminator's ellipse
        const limb = [], term = [], n = 72;
        for (let i = 0; i <= n; i++) {
            const a = -Math.PI / 2 + (i / n) * Math.PI;
            limb.push([Math.cos(a) * r, Math.sin(a) * r]);
            term.push([c * Math.cos(a) * r, Math.sin(a) * r]);
        }
        const L1 = S.xf(limb, { rot }), L2 = S.xf(term, { rot });
        const g = out.getContext('2d');
        g.drawImage(earthC, 0, 0);
        g.setTransform(res, 0, 0, res, -box.x * res, -box.y * res);
        // the contour is brushed: it thins out into the horns (a full moon's keeps its weight)
        const tp = 0.92 * S.smooth(0.9, 0.6, f);
        const contour = (dx, dy, wd) => {
            for (const line of [L1, L2]) S.ink(g, line.map(([x, y]) => [x + dx, y + dy]), { w: wd, taper: [tp, tp] });
        };
        contour(S.SHADE_DIR[0] * lw * 0.55, S.SHADE_DIR[1] * lw * 0.55, lw * 1.25);
        g.drawImage(litC, box.x, box.y, box.w, box.h);
        contour(0, 0, lw * 1.15);
        return { canvas: out, box };
    }

    function moon(g, { x = 0, y = 0, r = 90, rot = -0.5, phase = 0.28 } = {}) {
        const res = resOf(g);
        const sp = memo(`moon/${r}/${rot.toFixed(4)}/${phase.toFixed(4)}@${res}`, () => moonSprite(r, rot, phase, res));
        g.drawImage(sp.canvas, x + sp.box.x, y + sp.box.y, sp.box.w, sp.box.h);
    }

    // ================================================================== stars
    const METAL = {
        gold: ['#7a4c12', '#a8741f', '#d9a441', '#ecc25c', '#f6dc8a', '#fff3c2'],
        silver: ['#55547e', '#8f8db0', '#b6b8d0', '#d9dcea', '#eceef4', '#fbf8ee'],
    };
    const toneOf = (ramp, t) => {
        t = clamp(t) * (ramp.length - 1);
        const i = Math.min(ramp.length - 2, Math.floor(t));
        return S.mix(ramp[i], ramp[i + 1], t - i);
    };

    // The eight-pointed star: two squares, one turned 45°, cut as a bevelled boss: a ridge
    // runs out to every point and a valley in to every notch, so each point has a facet in
    // the light and one in shade.
    function star(g, { x = 0, y = 0, r = 18, rot = 0, kind = 'gold' } = {}) {
        const M = METAL[kind] ?? METAL.gold, K = 0.7654;
        const v = [];
        for (let i = 0; i < 16; i++) {
            const a = rot - Math.PI / 2 + (i * Math.PI) / 8, rr = i % 2 ? r * K : r;
            v.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr]);
        }
        const lw = clamp(r * 0.085, 0.9, 2.6);
        S.piece(g, v, {
            fill: M[2], line: lw, heavy: 0.6,
            detail: (q) => {
                q.lineJoin = 'round';
                for (let i = 0; i < 16; i++) {
                    const a = v[i], b = v[(i + 1) % 16], tip = i % 2 ? b : a, notch = i % 2 ? a : b;
                    // the facet's slope: away from its ridge, and a little out through its edge
                    const rd = norm([tip[0] - x, tip[1] - y]);
                    const side = (notch[0] - x) * -rd[1] + (notch[1] - y) * rd[0] > 0 ? 1 : -1;
                    const en = norm([(a[0] + b[0]) / 2 - x, (a[1] + b[1]) / 2 - y]);
                    const across = (-rd[1] * LIT[0] + rd[0] * LIT[1]) * side, out = en[0] * LIT[0] + en[1] * LIT[1];
                    const t = 0.5 + 0.14 * out + (across < 0 ? -1 : 1) * Math.max(0.13, 0.36 * Math.abs(across));
                    // airbrushed across the facet: from its ridge down into the valley
                    const rm = [x + (tip[0] - x) * 0.62, y + (tip[1] - y) * 0.62];
                    const gr = q.createLinearGradient(rm[0], rm[1], notch[0], notch[1]);
                    const lo = 0.04 + t * 0.9;
                    gr.addColorStop(0, toneOf(M, lo + 0.1));
                    gr.addColorStop(0.5, toneOf(M, lo));
                    gr.addColorStop(1, toneOf(M, lo - 0.16));
                    q.fillStyle = q.strokeStyle = gr;
                    q.lineWidth = 0.35;
                    q.beginPath();
                    q.moveTo(x, y);
                    q.lineTo(a[0], a[1]);
                    q.lineTo(b[0], b[1]);
                    q.closePath();
                    q.fill();
                    q.stroke();
                }
                // the cut edges: a thread of light on every ridge, a dark one in every valley
                for (let i = 0; i < 16; i++) {
                    const p = v[i];
                    q.strokeStyle = i % 2 ? S.rgba(M[0], 0.75) : S.rgba(M[5], 0.8);
                    q.lineWidth = Math.max(0.4, r * (i % 2 ? 0.03 : 0.036));
                    q.beginPath();
                    q.moveTo(x + (p[0] - x) * 0.2, y + (p[1] - y) * 0.2);
                    q.lineTo(p[0], p[1]);
                    q.stroke();
                }
                // the boss at the centre: a small bright dome
                const br = r * 0.2;
                q.fillStyle = S.rgba(M[0], 0.85);
                q.beginPath();
                q.arc(x + S.SHADE_DIR[0] * br * 0.22, y + S.SHADE_DIR[1] * br * 0.22, br * 1.16, 0, 6.3);
                q.fill();
                const dg = q.createRadialGradient(x + LIT[0] * br * 0.4, y + LIT[1] * br * 0.4, br * 0.05, x, y, br);
                dg.addColorStop(0, '#fffdf0');
                dg.addColorStop(0.3, M[5]);
                dg.addColorStop(0.75, M[3]);
                dg.addColorStop(1, M[1]);
                q.fillStyle = dg;
                q.beginPath();
                q.arc(x, y, br, 0, 6.3);
                q.fill();
            },
        });
    }

    // A far star: four thin rays, the upright pair longer, and a bright core.
    function spark(g, { x = 0, y = 0, r = 6, rot = 0, tone = 1 } = {}) {
        const dim = (c) => S.mix(c, '#7f80ac', (1 - tone) * 0.7);
        if (r < 2.4) {
            g.fillStyle = S.rgba(S.INK, 0.6);
            g.beginPath();
            g.arc(x + 0.25, y + 0.3, r * 0.5 + 0.35, 0, 6.3);
            g.fill();
            g.fillStyle = dim('#f6e7b4');
            g.beginPath();
            g.arc(x, y, r * 0.5, 0, 6.3);
            g.fill();
            return;
        }
        const pts = [], n = 48, cr = Math.cos(rot), sr = Math.sin(rot);
        for (let i = 0; i < n; i++) {
            const a = (i / n) * Math.PI * 2, c = Math.cos(a), s = Math.sin(a);
            const px = Math.sign(c) * Math.pow(Math.abs(c), 4.4) * r * 0.7, py = Math.sign(s) * Math.pow(Math.abs(s), 4.4) * r;
            pts.push([x + px * cr - py * sr, y + px * sr + py * cr]);
        }
        S.piece(g, pts, {
            fill: dim('#f6dc8a'), line: clamp(r * 0.07, 0.5, 1.1), heavy: 0.5,
            detail: (q) => {
                const gr = q.createRadialGradient(x, y, 0, x, y, r);
                gr.addColorStop(0, dim('#fffdf0'));
                gr.addColorStop(0.22, dim('#fbeeb8'));
                gr.addColorStop(0.6, dim('#e9bf5c'));
                gr.addColorStop(1, dim('#b98a2e'));
                q.fillStyle = gr;
                q.fillRect(x - r, y - r, r * 2, r * 2);
            },
        });
        g.fillStyle = dim('#fffdf0');
        g.beginPath();
        g.arc(x, y, Math.max(0.5, r * 0.11), 0, 6.3);
        g.fill();
    }

    // Small stars and sparks over a box, thinner towards its centre (where the emblem is).
    function field(g, { box, seed = 'sky', n = 60 } = {}) {
        const rnd = Motion.rng('field/' + seed);
        const placed = [];
        let tries = 0;
        while (placed.length < n && tries++ < n * 60) {
            const u = rnd(), v = rnd(), size = rnd(), kind = rnd(), turn = rnd();
            const d = Math.hypot((u - 0.5) * 2, (v - 0.5) * 2) / 1.2;
            if (rnd() > 0.12 + 0.88 * smooth(0.2, 0.85, d)) continue;
            const x = box.x + u * box.w, y = box.y + v * box.h;
            const r = kind < 0.16 ? 4.5 + size * 5 : kind < 0.5 ? 4 + size * size * 7 : 1.2 + size * 1.6;
            if (placed.some((p) => Math.hypot(p.x - x, p.y - y) < (p.r + r) * 2.2 + 14)) continue;
            placed.push({ x, y, r, kind, turn });
        }
        for (const p of placed) {
            if (p.kind < 0.16) star(g, { x: p.x, y: p.y, r: p.r, rot: (p.turn - 0.5) * 0.5, kind: p.turn < 0.36 ? 'silver' : 'gold' });
            else spark(g, { x: p.x, y: p.y, r: p.r, rot: (p.turn - 0.5) * 0.3, tone: 0.55 + 0.45 * p.turn });
        }
    }

    return { swallow, swallowBox, moon, star, spark, field, BIRD, METAL };
})();
