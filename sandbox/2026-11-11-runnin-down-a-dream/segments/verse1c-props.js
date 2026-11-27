// Props and helpers of «The pit» (segments/verse1c.js): the pit and its ragged lip, the heap
// of earth, clods, the shovel, the painted sheet (rolled, unrolling, flat, yanked in), the
// Devil's soot and smoke, birds, dust, a close-up of the road set, and the band's car when
// it leaves the ground. Global: PitProps. Depends on Cereal, Cast, Devil, World, Rides, Rig
// and the band files.
//
// The pit is one place seen at two scales (a close shot and a wide one), so everything on
// the ground is drawn in SITE coordinates: the wide shot's own logical units, before any
// camera. A view M = { k, ox, oy } maps a site point to the frame; `inSite(g, M, fn)` draws
// in site units with fn(u), where u is one frame unit (a line of 3.2 frame units is 3.2 * u).
const PitProps = (() => {
    const C = Cereal, K = C.COL, TAU = Math.PI * 2, D = Cast.D, Dd = Cast.Dd, P = Devil.P;
    const SL = 1.5; // the ground's oblique: a line going away from us runs 1.5 to the right per unit up
    const rot = ([x, y], a) => [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)];
    const cw = (pts) => {
        let a = 0;
        for (let i = 0; i < pts.length; i++) {
            const p = pts[i], q = pts[(i + 1) % pts.length];
            a += p[0] * q[1] - q[0] * p[1];
        }
        return a > 0 ? pts : pts.slice().reverse();
    };
    const line = (g, pts, color, lw) => C.poly(g, pts, { ink: color, lw, close: false });
    const lerp = (a, b, u) => a + (b - a) * u;
    // A band of varying width along a centreline: [[x, y, halfWidth], …] → an outline.
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
    const zx = (M, x) => x * M.k + M.ox, zy = (M, y) => y * M.k + M.oy;
    function inSite(g, M, fn) {
        g.save();
        g.translate(M.ox, M.oy);
        g.scale(M.k, M.k);
        fn(1 / M.k);
        g.restore();
    }

    const EARTH = { front: '#a8541c', top: '#d17c30', side: '#7a3a12', line: '#5e2a0e' };
    const ROAD = { front: '#2f2a6b', top: '#4a45a0', side: '#211c57' };
    const CANVAS = { front: '#f3e6c4', top: '#fff6de', side: '#d3bf8f', line: '#a8905a' };
    const SHEET = { paint: '#3d3999', sag: '#343088', dash: '#ffd23f', edge: '#efe6cf', fold: '#2a2670' };
    const SMOKE = '#f1edf8', SOOT = '#4a2a3a', SOOT_SIDE = '#3a1f2e', DUST = ['#e2c08a', '#fff1c4'];

    // --- the pit ---------------------------------------------------------------------------
    // A ragged edge from p to q: a point every `step`, pushed off the line by up to `amp`.
    const ragged = (p, q, seed, amp, step = 13) => {
        const len = Math.hypot(q[0] - p[0], q[1] - p[1]), n = Math.max(1, Math.round(len / step)), r = Motion.rng(seed);
        const nx = -(q[1] - p[1]) / len, ny = (q[0] - p[0]) / len, out = [p];
        for (let i = 1; i < n; i++) {
            const u = (i + (r() - 0.5) * 0.5) / n, o = (r() - 0.5) * 2 * amp;
            out.push([lerp(p[0], q[0], u) + nx * o, lerp(p[1], q[1], u) + ny * o]);
        }
        return out;
    };
    /**
     * The pit's opening on the road: o { x0, x1 (the near lip), yn, yf (near and far lip), h (how
     * deep it shows), seed }. Returns { A, F, G, B (near-left, far-left, far-right, near-right),
     * lip (the ragged opening, clockwise), near (the near lip from left to right), h }.
     */
    function pitShape(o) {
        const sh = SL * (o.yn - o.yf), A = [o.x0, o.yn], F = [o.x0 + sh, o.yf], G = [o.x1 + sh, o.yf], B = [o.x1, o.yn], s = o.seed ?? 'pit';
        const near = ragged(B, A, s + 'n', 2.4);
        return { A, F, G, B, h: o.h, lip: [...ragged(A, F, s + 'l', 2.2), ...ragged(F, G, s + 'f', 2.4), ...ragged(G, B, s + 'r', 2.2), ...near], near: [...near, A].reverse() };
    }
    // What the hole shows: the far wall and the left wall in strata under the road's slab, the
    // floor, a few stones and a root. Clipped to the opening.
    const STRATA = [[0, 5, '#211c57', '#19154a'], [5, 24, '#8f4d24', '#743a1b'], [24, 50, '#6b3418', '#552812'], [50, 80, '#4a2418', '#3a1b14'], [80, 400, '#2e1620', '#24111b']];
    function pitInside(g, u, sp, o = {}) {
        const { A, F, G, h } = sp, r = Motion.rng('pit-in' + (o.seed ?? ''));
        g.save();
        C.trace(g, sp.lip);
        g.clip();
        g.fillStyle = '#3d1d1c'; // the floor
        g.fillRect(A[0] - 50, F[1] - 10, G[0] - A[0] + 100, A[1] - F[1] + 30);
        for (const [a, b, far, left] of STRATA) {
            if (a >= h) break;
            const c = Math.min(b, h);
            C.poly(g, [[F[0] - 2, F[1] + a], [G[0] + 8, G[1] + a], [G[0] + 8, G[1] + c], [F[0] - 2, F[1] + c]], { fill: far, lw: 0 });
            C.poly(g, [[A[0] - 6, A[1] + a], [F[0], F[1] + a], [F[0], F[1] + c], [A[0] - 6, A[1] + c]], { fill: left, lw: 0 });
        }
        // stones in the far wall, a root hanging from under the slab
        const w = G[0] - F[0];
        for (const [fx, fy, fr] of [[0.22, 17, 5.5], [0.58, 34, 4.2], [0.83, 15, 3.4]]) {
            if (fy + fr > h) continue;
            g.beginPath();
            g.ellipse(F[0] + w * fx, F[1] + fy, fr * 1.25, fr, -0.2, 0, TAU);
            g.fillStyle = '#b388f0';
            g.fill();
            g.strokeStyle = K.ink;
            g.lineWidth = 2.2 * u;
            g.stroke();
        }
        if (h > 26) line(g, C.curve([[F[0] + w * 0.4, F[1] + 4], [F[0] + w * 0.4 + 3, F[1] + 14], [F[0] + w * 0.4 - 3, F[1] + 22], [F[0] + w * 0.4 + 2, F[1] + 29]], false, 5), '#c98d3c', 2.4 * u);
        // a few clod marks on the walls
        for (let i = 0; i < 7; i++) {
            const fx = r(), fy = 8 + r() * 60, l = 5 + r() * 7;
            if (fy > h - 3) continue;
            line(g, [[F[0] + w * fx, F[1] + fy], [F[0] + w * fx + l, F[1] + fy + 1.5]], '#3a1b14', 2 * u);
        }
        // where the walls meet each other and the floor
        line(g, [[A[0], A[1] + h], [F[0], F[1] + h], [G[0], G[1] + h]], K.ink, 2.4 * u);
        line(g, [F, [F[0], F[1] + h]], K.ink, 2.4 * u);
        g.restore();
    }
    // The hole's edge: the broken lip all round, cracks running out of it, chips. It goes down
    // BEFORE whoever stands in the hole (the far lip and the sides are behind him); only the
    // near lip, pitNear(), is drawn again in front of him.
    function pitNear(g, u, sp) {
        C.poly(g, sp.near, { ink: K.ink, lw: 3.2 * u, close: false });
    }
    function pitLip(g, u, sp, o = {}) {
        const r = Motion.rng('pit-lip' + (o.seed ?? '')), n = sp.lip.length, cx = (sp.A[0] + sp.G[0]) / 2, cy = (sp.A[1] + sp.G[1]) / 2;
        const k = o.k ?? 1; // how far the cracks have run
        for (let i = 0; i < n; i += 2) {
            if (r() < 0.45) continue;
            const p = sp.lip[i], dx = p[0] - cx, dy = (p[1] - cy) * 2.2, l = Math.hypot(dx, dy) || 1, len = (9 + r() * 15) * k, j = (r() - 0.5) * 9;
            const ux = dx / l, uy = dy / l / 2.2;
            line(g, [p, [p[0] + ux * len * 0.5 - uy * j, p[1] + uy * len * 0.5 + ux * j * 0.4], [p[0] + ux * len, p[1] + uy * len]], ROAD.side, 2.6 * u);
        }
        for (let i = 0; i < 7 * k; i++) {
            const p = sp.lip[Math.floor(r() * n)], a = r() * TAU, d = 7 + r() * 9, s = 1.6 + r() * 1.8;
            const c = [p[0] + Math.cos(a) * d * 1.6, p[1] + Math.sin(a) * d * 0.5];
            if (c[1] > sp.A[1] + 3) continue;
            C.poly(g, [[c[0] - s, c[1]], [c[0], c[1] - s * 0.7], [c[0] + s, c[1] + s * 0.2], [c[0], c[1] + s * 0.6]], { fill: ROAD.side, lw: 0 });
        }
        C.poly(g, sp.lip, { ink: K.ink, lw: 3.2 * u });
    }
    // Clip to everything above (farther than) a lip, so what stands in the hole is hidden below it.
    function clipAbove(g, near) {
        const a = near[0], b = near[near.length - 1];
        g.beginPath();
        g.moveTo(a[0] - 3000, a[1]);
        for (const p of near) g.lineTo(p[0], p[1]);
        g.lineTo(b[0] + 3000, b[1]);
        g.lineTo(b[0] + 3000, -3000);
        g.lineTo(a[0] - 3000, -3000);
        g.closePath();
        g.clip();
    }

    // --- earth -----------------------------------------------------------------------------
    // A clod: an irregular chunk, a solid in three tones. kind 'road': a piece of the road, with
    // a bit of the centre line on it.
    const CLOD = [[-1, -0.1], [-0.62, -0.74], [0.1, -0.95], [0.82, -0.56], [1, 0.2], [0.42, 0.82], [-0.5, 0.7]];
    function clod(g, u, x, y, r, a = 0, kind = 'earth') {
        const col = kind === 'road' ? ROAD : EARTH, pts = CLOD.map((p) => {
            const q = rot(p, a);
            return [x + q[0] * r, y + q[1] * r * 0.86];
        });
        C.prism(g, pts, [r * 0.34, -r * 0.23], col, { lw: 2.8 * u });
        g.save();
        C.trace(g, pts);
        g.clip();
        if (kind === 'road') {
            const q = rot([1, 0], a), n = rot([0, 1], a);
            line(g, [[x - q[0] * r + n[0] * r * 0.15, y - q[1] * r + n[1] * r * 0.15], [x + q[0] * r * 0.1 + n[0] * r * 0.15, y + q[1] * r * 0.1 + n[1] * r * 0.15]], K.yellow, r * 0.42);
        } else {
            const q = rot([0.25, 0.3], a);
            line(g, [[x + q[0] * r - r * 0.3, y + q[1] * r], [x + q[0] * r + r * 0.25, y + q[1] * r + r * 0.08]], EARTH.line, 2 * u);
        }
        g.restore();
        C.poly(g, pts, { ink: K.ink, lw: 2.8 * u });
    }
    // The heap: a lumpy mound that grows with k (0..1). (x, y) is the middle of its foot.
    const heapSize = (k) => [168 * (0.52 + 0.48 * k), 116 * Math.pow(k, 0.9)];
    function heapPts(x, y, w, h, sx = 1, sy = 1, ax = 0, ay = 0) {
        const r = Motion.rng('heap'), N = 20, top = [];
        for (let i = 0; i <= N; i++) {
            const v = i / N, lump = i > 1 && i < N - 1 ? (r() - 0.5) * 0.12 : 0, prof = Math.pow(Math.sin(Math.PI * Math.pow(v, 1.12)), 0.72) * (1 + lump);
            top.push([x - w / 2 + w * v, y - h * prof]);
        }
        const base = [];
        for (let i = 1; i < 8; i++) base.push([x + (w / 2) * Math.cos((i / 8) * Math.PI), y + 11 * Math.sin((i / 8) * Math.PI)]);
        return C.curve([...top, ...base], true, 3).map(([px, py]) => [ax + (px - ax) * sx, ay + (py - ay) * sy]);
    }
    function heap(g, u, x, y, k, t = 0) {
        const [w, h] = heapSize(k), pts = heapPts(x, y, w, h), r = Motion.rng('heap-in'), d = C.drawing(t);
        g.fillStyle = 'rgba(36,21,49,0.28)';
        g.beginPath();
        g.ellipse(x + 6, y + 6, w * 0.56, 11, 0, 0, TAU);
        g.fill();
        C.poly(g, pts, { fill: EARTH.side, lw: 0 });
        g.save();
        C.trace(g, pts);
        g.clip();
        // the lit body and its crown, each the same mound drawn smaller towards the top left
        C.poly(g, heapPts(x, y, w, h, 0.9, 0.94, x - w / 2, y - h), { fill: EARTH.front, lw: 0 });
        C.poly(g, heapPts(x, y, w, h, 0.5, 0.42, x - w * 0.14, y - h * 1.02), { fill: EARTH.top, lw: 0 });
        // clods bedded in it, pebbles
        for (let i = 0; i < 9; i++) {
            const v = 0.12 + r() * 0.76, depth = 0.14 + r() * 0.62, cx = x - w / 2 + w * v, cy = y - h * Math.sin(Math.PI * v) * (1 - depth), s = (7 + r() * 6) * (0.6 + 0.4 * k), a = r() * 0.8 - 0.4;
            if (i % 3 === 2) {
                g.beginPath();
                g.ellipse(cx, cy, s * 0.5, s * 0.36, a, 0, TAU);
                g.fillStyle = '#b388f0';
                g.fill();
                g.strokeStyle = K.ink;
                g.lineWidth = 2.2 * u;
                g.stroke();
            } else {
                line(g, C.curve([[cx - s, cy + s * 0.3], [cx - s * 0.6, cy - s * 0.45], [cx + s * 0.3, cy - s * 0.6], [cx + s, cy + s * 0.1]].map((p) => {
                    const q = rot([p[0] - cx, p[1] - cy], a);
                    return [cx + q[0], cy + q[1]];
                }), false, 4), EARTH.line, 2.4 * u);
                line(g, [[cx - s * 0.3, cy - s * 0.2], [cx + s * 0.25, cy - s * 0.3]], EARTH.top, 2 * u);
            }
        }
        g.restore();
        C.poly(g, pts, { ink: K.ink, lw: 3.2 * u });
        // a worm that did not ask for any of this
        if (k > 0.5) {
            const wx = x + w * 0.2, wy = y - h * 0.5, wag = Math.floor(d / 3) % 2 ? 1 : -1;
            const cl = C.curve([[wx, wy], [wx + 7, wy - 9], [wx + 5 + wag * 3, wy - 19], [wx + 11 + wag * 5, wy - 26]], false, 5);
            line(g, cl, K.ink, 5.4 + 2.4 * u);
            line(g, cl, K.rose, 5.4 - 1.4 * u);
            line(g, [cl[6], cl[7]], K.pink, 5.4 - 1.4 * u);
        }
    }
    // Scalloped puffs (dust, smoke): outlines first, fills on top, so touching puffs merge.
    function puffs(g, u, list, fill, lw = 3.2) {
        const parts = [];
        for (const [x, y, r, n = 6, a0 = 0] of list) {
            if (r < 1.5) continue;
            parts.push([x, y, r * 0.74]);
            for (let i = 0; i < n; i++) parts.push([x + Math.cos(a0 + (i / n) * TAU) * r * 0.62, y + Math.sin(a0 + (i / n) * TAU) * r * 0.62, r * 0.4]);
        }
        g.strokeStyle = K.ink;
        g.lineWidth = lw * 2 * u;
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
    // A puff of dust that rises and thins: k 0..1, s its size, boiling on twos.
    function dust(g, u, x, y, s, k, seed = 'dust', t = 0) {
        if (!(k > 0 && k < 1)) return;
        const r = Motion.rng('pit-dust:' + seed), d = C.drawing(t), grow = 1 - Math.pow(1 - k, 2.2), back = [], fore = [];
        for (let i = 0; i < 7; i++) {
            const a = -Math.PI * (0.12 + 0.76 * r()), dist = 0.2 + 1.0 * r(), size = 0.28 + 0.28 * r(), end = 0.62 + 0.38 * r(), n = 5 + Math.floor(r() * 3), a0 = r() * TAU;
            const life = Math.max(0, 1 - k / end), rad = size * Math.min(1, 0.4 + k * 3.2) * Math.pow(life, 0.55) * (1 + 0.05 * (((d + i) % 2) * 2 - 1));
            (i < 4 ? back : fore).push([x + Math.cos(a) * dist * grow * s * 1.3, y + Math.min(-rad * 0.5, Math.sin(a) * dist * grow) * s, rad * s * (i < 4 ? 1.1 : 0.8), n, a0 + 0.4 * (((d + i * 2) % 3) - 1)]);
        }
        puffs(g, u, back, DUST[0]);
        puffs(g, u, fore, DUST[1]);
    }

    // --- the shovel, the Devil's soot --------------------------------------------------------
    // Runs fn(L) in the Devil's own units, as Devil.draw places them.
    function inDevil(g, x, y, s, pose, fn) {
        const q = pose.squash ?? 0;
        g.save();
        g.translate(x, y);
        g.scale(s, s);
        g.rotate(pose.lean ?? 0);
        g.scale(1 + q, 1 - q);
        fn(3.2 / s);
        g.restore();
    }
    const SHOVEL = { len: 1.5, hold: 0.56 };
    /**
     * A shovel, in the Devil's units. `at` is the point of the shaft in the mitt, `hold` how
     * far that is from the top of the grip; it points along `ang` (0 = blade straight down,
     * positive swings the blade to screen right). o: { hold, dirt (earth on the blade), load (a clod on it: 'earth' | 'road') }
     */
    function shovel(g, L, at, ang, o = {}) {
        const hold = o.hold ?? SHOVEL.hold;
        const pt = (px, py) => {
            const q = rot([px, py - hold], -ang);
            return [at[0] + q[0], at[1] + q[1]];
        };
        // the blade: a pointed spade with a turned step on each shoulder
        const blade = cw([[-0.05, 1.03], [0.05, 1.03], [0.2, 1.07], [0.21, 1.3], [0.14, 1.43], [0, 1.52], [-0.14, 1.43], [-0.21, 1.3], [-0.2, 1.07]].map(([px, py]) => pt(px, py)));
        C.prism(g, blade, Dd(0.05), { front: P.fork, top: P.forkShine, side: P.forkSide }, { lw: L, ink: P.ink });
        if (o.dirt) {
            g.save();
            C.trace(g, blade);
            g.clip();
            C.poly(g, [pt(-0.24, 1.36), pt(-0.1, 1.3), pt(0.02, 1.37), pt(0.12, 1.29), pt(0.24, 1.36), pt(0.24, 1.6), pt(-0.24, 1.6)], { fill: EARTH.front, ink: P.ink, lw: L * 0.7 });
            g.restore();
            C.poly(g, blade, { ink: P.ink, lw: L });
        }
        line(g, [pt(-0.2, 1.07), pt(-0.09, 1.11)], P.ink, L * 0.8);
        line(g, [pt(0.2, 1.07), pt(0.09, 1.11)], P.ink, L * 0.8);
        line(g, [pt(0, 1.1), pt(0, 1.3)], P.forkSide, L * 0.9);
        line(g, [pt(-0.14, 1.13), pt(-0.145, 1.29)], P.forkShine, L * 1.1);
        // the shaft, the socket that takes it, a rivet
        C.prism(g, cw([pt(-0.03, 0.14), pt(0.03, 0.14), pt(0.03, 0.96), pt(-0.03, 0.96)]), Dd(0.05), { front: P.shaft, top: P.shaftSide, side: P.shaftSide }, { lw: L, ink: P.ink });
        line(g, [pt(-0.008, 0.2), pt(-0.008, 0.94)], '#8a5230', L * 0.7);
        C.prism(g, cw([pt(-0.043, 0.93), pt(0.043, 0.93), pt(0.055, 1.07), pt(-0.055, 1.07)]), Dd(0.06), { front: P.fork, top: P.forkShine, side: P.forkSide }, { lw: L * 0.9, ink: P.ink });
        g.beginPath();
        g.arc(...pt(0, 1.0), 0.013, 0, TAU);
        g.fillStyle = P.ink;
        g.fill();
        // the D grip: a yoke and a crossbar you can see through
        const yoke = [pt(0, 0.17), pt(-0.085, 0.03), pt(0.085, 0.03)];
        C.poly(g, yoke, { ink: P.ink, lw: 0.05 + 2 * L, close: true });
        C.poly(g, yoke, { ink: P.shaft, lw: 0.05, close: true });
        line(g, [pt(-0.07, 0.022), pt(0.07, 0.022)], '#8a5230', L * 0.7);
        if (o.load) {
            const c = pt(0, 1.27);
            clod(g, L / 3.2, c[0] + 0.02, c[1] - 0.1, 0.17, ang * 0.5 + 0.3, o.load);
        }
    }
    // The Devil's block mitt again, over the thing it holds (as Devil.draw draws it).
    function mitt(g, L, side, hand) {
        const T = Devil.TORSO, sh = side === 'R' ? [T.x + 0.03, T.y + 0.14] : [T.x + T.w - 0.03, T.y + 0.14];
        const w = 0.16, dx = hand[0] - sh[0], dy = hand[1] - sh[1], len = Math.hypot(dx, dy) || 1e-6, ux = dx / len, uy = dy / len, nx = -uy * w * 0.5, ny = ux * w * 0.5;
        const a = Math.max(0.06, len - 0.075), b = len + 0.11;
        C.prism(g, cw([[sh[0] + ux * a + nx, sh[1] + uy * a + ny], [sh[0] + ux * b + nx, sh[1] + uy * b + ny], [sh[0] + ux * b - nx, sh[1] + uy * b - ny], [sh[0] + ux * a - nx, sh[1] + uy * a - ny]]), Dd(0.16), { front: P.skin, top: P.skinTop, side: P.skinSide }, { lw: L, ink: P.ink });
    }
    // Fresh out of Hell: soot on a cheek, on the side of the head and on a horn's tip, and one
    // wisp of smoke off the pompadour (three drawings, held on fours).
    function scorch(g, L, pose, t) {
        const H = Devil.HEAD, T = H.top, d = C.drawing(t);
        g.save();
        g.translate(0, pose.headDy ?? 0);
        g.rotate(pose.headTilt ?? 0);
        const blob = (cx, cy, rx, ry, a, col, seed) => {
            const r = Motion.rng('soot' + seed), pts = [];
            for (let i = 0; i < 9; i++) {
                const an = (i / 9) * TAU, k = 0.72 + r() * 0.5, q = rot([Math.cos(an) * rx * k, Math.sin(an) * ry * k], a);
                pts.push([cx + q[0], cy + q[1]]);
            }
            C.poly(g, C.curve(pts, true, 4), { fill: col, lw: 0 });
        };
        // the cheek (screen left), with two specks
        blob(-0.335, T + 0.66, 0.085, 0.06, -0.5, SOOT, 'a');
        blob(-0.4, T + 0.555, 0.022, 0.018, 0, SOOT, 'b');
        blob(-0.25, T + 0.745, 0.02, 0.016, 0, SOOT, 'c');
        // the forehead's corner, under the hair
        blob(0.37, T + 0.3, 0.05, 0.035, 0.5, SOOT, 'd');
        // the side of the head
        blob(0.55, T + 0.52, 0.04, 0.075, 0.25, SOOT_SIDE, 'e');
        // the tip of the horn on screen right, singed
        const sx = 1, z = 0.14;
        const outer = C.curve([[sx * 0.5, T + 0.03], [sx * 0.615, T - 0.13], [sx * 0.62, T - 0.31], [sx * 0.49, T - 0.47]], false, 8);
        const inner = C.curve([[sx * 0.49, T - 0.47], [sx * 0.515, T - 0.31], [sx * 0.46, T - 0.17], [sx * 0.29, T - 0.03]], false, 8);
        const horn = cw([...outer, ...inner.slice(1)].map(([x, y]) => [x + D[0] * z, y + D[1] * z]));
        g.save();
        C.trace(g, horn);
        g.clip();
        const hy = T - 0.27 + D[1] * z;
        C.poly(g, [[0.3, hy + 0.02], [0.52, hy - 0.02], [0.57, hy + 0.035], [0.62, hy - 0.015], [0.68, hy + 0.03], [0.8, hy], [0.8, hy - 0.4], [0.3, hy - 0.4]], { fill: SOOT, lw: 0 });
        g.restore();
        C.poly(g, horn, { ink: P.ink, lw: L });
        // the wisp
        const ph = ((Math.floor(d / 2) % 3) + 3) % 3, sw = [0.05, -0.045, 0.015][ph], up = [0, 0.05, 0.1][ph];
        const x0 = 0.2, y0 = T - 0.3;
        const cl = C.curve([[x0, y0 + 0.06], [x0 + 0.04 + sw, y0 - 0.12], [x0 - 0.05 - sw, y0 - 0.28], [x0 + 0.05 + sw * 0.6, y0 - 0.43], [x0 - 0.01, y0 - 0.56 - up * 0.4]], false, 6);
        const n = cl.length;
        C.poly(g, ribbon(cl.map(([x, y], i) => [x, y, 0.014 + 0.03 * Math.sin((i / (n - 1)) * Math.PI) + 0.012 * (i / (n - 1))])), { fill: SMOKE, ink: P.ink, lw: L * 0.8 });
        g.beginPath();
        g.arc(x0 + 0.03 - sw, y0 - 0.68 - up, 0.034 - ph * 0.007, 0, TAU);
        g.fillStyle = SMOKE;
        g.fill();
        g.strokeStyle = P.ink;
        g.lineWidth = L * 0.8;
        g.stroke();
        g.restore();
    }
    /**
     * The Devil as he is in this block: scorched, and with a shovel.
     *   o.t (seconds: the wisp), o.shovel: { hand: 'L' | 'R' | null (the mitt that holds it: pose.handL / handR is the
     *   point of the shaft it holds), at (when no hand holds it), ang, hold, dirt, load, behind (true: over the shoulder, behind him) }
     */
    function devil(g, x, y, s, pose, o = {}) {
        const sv = o.shovel, at = sv && (sv.hand === 'L' ? pose.handL : sv.hand === 'R' ? pose.handR : sv.at);
        if (sv && sv.behind) inDevil(g, x, y, s, pose, (L) => shovel(g, L, at, sv.ang, sv));
        Devil.draw(g, x, y, s, pose);
        inDevil(g, x, y, s, pose, (L) => {
            scorch(g, L, pose, o.t ?? 0);
            if (sv && !sv.behind) {
                shovel(g, L, at, sv.ang, sv);
                if (sv.hand) mitt(g, L, sv.hand, at);
                if (sv.both) mitt(g, L, sv.hand === 'R' ? 'L' : 'R', sv.hand === 'R' ? pose.handL : pose.handR);
            }
        });
    }

    // --- the painted sheet -----------------------------------------------------------------
    // The roll: a tube of canvas lying along the road, its painted face rolled inside. The end
    // we see (screen right) shows the spiral. o: { ties (0..1: its two ribbons), smear }
    function roll(g, u, xl, xr, y, r, o = {}) {
        if (r < 0.8) return;
        const cap = (cx, k = 1) => Array.from({ length: 22 }, (_, i) => {
            const a = (i / 22) * TAU;
            return [cx + Math.sin(a) * r * 0.34 * k, y - Math.cos(a) * r * k - Math.sin(a) * r * 0.2 * k];
        });
        const body = [[xl, y - r], [xr, y - r], ...cap(xr).slice(0, 12), [xr, y + r], [xl, y + r], ...cap(xl).slice(11).map(([px, py]) => [px, py])];
        g.fillStyle = 'rgba(36,21,49,0.28)';
        g.beginPath();
        g.ellipse((xl + xr) / 2 + 3, y + r + 1, (xr - xl) / 2 + r * 0.5, 3.4, 0, 0, TAU);
        g.fill();
        C.poly(g, body, { fill: CANVAS.front, lw: 0 });
        g.save();
        C.trace(g, body);
        g.clip();
        g.fillStyle = CANVAS.top;
        g.fillRect(xl - r, y - r - 2, xr - xl + 2 * r, r * 0.62);
        g.fillStyle = CANVAS.side;
        g.fillRect(xl - r, y + r * 0.42, xr - xl + 2 * r, r);
        // the weave's seam, paint that came through
        if (o.smear !== false && r > 6) {
            C.poly(g, [[xl + (xr - xl) * 0.9, y - r], [xl + (xr - xl) * 0.9 + 16, y - r], [xl + (xr - xl) * 0.9 + 11, y - r * 0.2], [xl + (xr - xl) * 0.9 + 4, y - r * 0.45]], { fill: SHEET.paint, lw: 0 });
            C.poly(g, [[xl + (xr - xl) * 0.2, y + r], [xl + (xr - xl) * 0.2 + 9, y + r], [xl + (xr - xl) * 0.2 + 6, y + r * 0.3]], { fill: SHEET.dash, lw: 0 });
        }
        g.restore();
        C.poly(g, body, { ink: K.ink, lw: 3.2 * u });
        // the end: the canvas's edge wound round, the dark paint between the turns
        const end = cap(xr);
        C.poly(g, end, { fill: CANVAS.side, ink: K.ink, lw: 2.6 * u });
        if (r > 4) {
            const sp = [];
            for (let i = 0; i <= 30; i++) {
                const a = (i / 30) * TAU * 2.2, k = 0.82 * (1 - i / 34);
                sp.push([xr + Math.sin(a) * r * 0.34 * k, y - Math.cos(a) * r * k - Math.sin(a) * r * 0.2 * k]);
            }
            line(g, sp, SHEET.paint, 2.2 * u);
        }
        // the ribbons that keep it rolled, each with a bow
        if ((o.ties ?? 0) > 0) {
            for (const f of [0.24, 0.74]) {
                const x = lerp(xl, xr, f);
                const band = [[x - 3.2, y - r], [x + 3.2, y - r], [x + 3.2 + r * 0.24, y + r * 0.2], [x + 3.2, y + r], [x - 3.2, y + r], [x - 3.2 + r * 0.24, y + r * 0.2]];
                C.poly(g, band, { fill: K.pink, ink: K.ink, lw: 2.2 * u });
                for (const sx of [-1, 1]) C.poly(g, [[x + r * 0.2, y - r * 0.2], [x + r * 0.2 + sx * 8.5, y - r * 0.2 - 6], [x + r * 0.2 + sx * 9.5, y - r * 0.2 + 3.5]], { fill: K.pink, ink: K.ink, lw: 2.2 * u });
                g.beginPath();
                g.arc(x + r * 0.2, y - r * 0.2, 2.6, 0, TAU);
                g.fillStyle = K.magenta;
                g.fill();
                g.strokeStyle = K.ink;
                g.lineWidth = 2 * u;
                g.stroke();
            }
        }
    }
    /**
     * The sheet, painted like the road and slightly wrong. It is drawn on a quad
     * [near-left, near-right, far-right, far-left] (site points), so the same drawing lies
     * flat, unrolls and is dragged into the hole. o: { v1 (0..1: how much of its depth is
     * unrolled), curl (0..1: the near right corner), folds (0..1: creases towards a pull at `pull`), wave (0..1 a ripple running across) }
     */
    function sheet(g, u, quad, o = {}) {
        const [NL, NR, FR, FL] = quad, v1 = o.v1 ?? 1;
        const at = (a, v) => [lerp(lerp(NL[0], NR[0], a), lerp(FL[0], FR[0], a), v), lerp(lerp(NL[1], NR[1], a), lerp(FL[1], FR[1], a), v)];
        if (v1 <= 0.01) return;
        // the outline: near edge with two slack waves, the hems a little off true
        const edge = [];
        for (let i = 0; i <= 12; i++) {
            const a = i / 12, p = at(a, 0);
            edge.push([p[0], p[1] + (i % 12 ? Math.sin(a * 9.4) * 1.3 : 0)]);
        }
        const outline = [...edge, at(1.004, v1 * 0.5), at(1, v1), at(0.5, v1 + 0.008), at(0, v1), at(-0.004, v1 * 0.5)];
        // what the curled corner uncovers: the road
        g.fillStyle = 'rgba(36,21,49,0.3)';
        C.poly(g, outline.map(([x, y]) => [x + 2.5, y + 3]), { fill: 'rgba(36,21,49,0.3)', lw: 0 });
        C.poly(g, outline, { fill: SHEET.paint, lw: 0 });
        g.save();
        C.trace(g, outline);
        g.clip();
        // it sags where nothing holds it up
        if ((o.sag ?? 0) > 0) {
            const sg = o.sag, ring = [];
            for (let i = 0; i < 16; i++) {
                const a = (i / 16) * TAU;
                ring.push(at(0.48 + Math.cos(a) * 0.33 * sg, 0.5 + Math.sin(a) * 0.3 * sg));
            }
            C.poly(g, ring, { fill: SHEET.sag, lw: 0 });
        }
        // its own edge lines and centre dashes: none of them where the road's are
        line(g, [at(-0.02, 0.085), at(0.5, 0.1), at(1.02, 0.07)], SHEET.edge, 3.4);
        if (v1 > 0.93) line(g, [at(-0.02, 0.93), at(0.45, 0.915), at(1.02, 0.94)], SHEET.edge, 3.4);
        for (const [a0, a1] of [[-0.05, 0.13], [0.36, 0.6], [0.83, 1.05]]) {
            const v = 0.565 + 0.03 * a0;
            if (v < v1 - 0.04) C.poly(g, [at(a0, v - 0.038), at(a1, v - 0.03), at(a1 + 0.006, v + 0.042), at(a0 - 0.004, v + 0.036)], { fill: SHEET.dash, lw: 0 });
        }
        // creases
        const fo = o.folds ?? 0;
        for (const [a0, v0, a1, v1b] of [[0.16, 0.28, 0.27, 0.42], [0.66, 0.2, 0.72, 0.36], [0.44, 0.72, 0.52, 0.86]]) if (v1b < v1) line(g, [at(a0, v0), at(a1, v1b)], SHEET.fold, 2.4 * u);
        if (fo > 0) for (const a of [0.2, 0.45, 0.7]) line(g, [at(a, 0.92), at(lerp(a, 0.95, 0.6), 0.1)], SHEET.fold, 2.6 * u);
        if ((o.wave ?? 0) > 0 && o.wave < 1) {
            const a = 1 - o.wave * 0.8;
            line(g, [at(a, 0.04), at(a - 0.03, 0.5), at(a, 0.96)], SHEET.top ?? '#5a55b8', 3 * u);
            line(g, [at(a + 0.035, 0.04), at(a + 0.005, 0.5), at(a + 0.035, 0.96)], SHEET.fold, 3 * u);
        }
        g.restore();
        C.poly(g, outline, { ink: K.ink, lw: 2.8 * u });
        // the near right corner curls up: the road under it, the canvas's back, its shadow
        const c = o.curl ?? 0;
        if (c > 0.02 && v1 > 0.3) {
            const a = at(1 - 0.12 * c, 0), b = at(1, 0.3 * c), cn = at(1, 0);
            // the corner folded back over the line a–b, and lifted
            const dx = b[0] - a[0], dy = b[1] - a[1], l2 = dx * dx + dy * dy, k = ((cn[0] - a[0]) * dx + (cn[1] - a[1]) * dy) / l2;
            const tip = [2 * (a[0] + dx * k) - cn[0] + 2 * c, 2 * (a[1] + dy * k) - cn[1] - 9 * c];
            C.poly(g, [a, cn, b], { fill: ROAD.front, ink: K.ink, lw: 2.4 * u });
            C.poly(g, [[a[0] - 3, a[1] - 1], [tip[0] - 5, tip[1] + 5], [b[0] - 1, b[1] + 1]], { fill: SHEET.fold, lw: 0 });
            const flap = [a, ...C.curve([a, [lerp(a[0], tip[0], 0.55) - 3 * c, lerp(a[1], tip[1], 0.5) - 3 * c], tip, [lerp(b[0], tip[0], 0.5) + 3 * c, lerp(b[1], tip[1], 0.6) - 2 * c], b], false, 5), b];
            C.poly(g, flap, { fill: CANVAS.front, ink: K.ink, lw: 2.8 * u });
            line(g, [[lerp(a[0], b[0], 0.2), lerp(a[1], b[1], 0.2) - 2 * c], [lerp(a[0], b[0], 0.8), lerp(a[1], b[1], 0.8) - 2.5 * c]], CANVAS.top, 2.2 * u);
            line(g, [[lerp(a[0], tip[0], 0.5), lerp(a[1], tip[1], 0.5)], [lerp(b[0], tip[0], 0.4), lerp(b[1], tip[1], 0.4)]], CANVAS.line, 2 * u);
        }
    }

    // --- the sky's own -------------------------------------------------------------------------
    /**
     * A small bird flying to the right. (x, y) its middle, s its length.
     * o: { flap (0 up, 1 level, 2 down), look (-1 back at the band … 1 ahead), shades, tilt }
     */
    function bird(g, x, y, s, o = {}) {
        const L = 3 / s, col = o.col ?? { front: '#ff8a2b', top: '#ffb565', side: '#d6611a', wing: '#e0258b', wingD: '#a8176a' };
        g.save();
        g.translate(x, y);
        g.rotate(o.tilt ?? 0);
        g.scale(s, s);
        const Db = [0.1, -0.07];
        // the far wing, the tail
        const flap = o.flap ?? 1, wy = [-0.42, -0.08, 0.3][flap], wx = [-0.12, -0.2, -0.14][flap];
        C.poly(g, [[-0.06 + Db[0], -0.12 + Db[1]], [wx + Db[0] + 0.1, wy * 0.9 + Db[1] - 0.1], [0.18 + Db[0], -0.1 + Db[1]]], { fill: col.wingD, ink: K.ink, lw: L });
        C.prism(g, cw([[-0.36, -0.06], [-0.66, -0.2], [-0.6, -0.02], [-0.68, 0.1], [-0.36, 0.08]]), Db, { front: col.side, top: col.front, side: col.side }, { lw: L });
        // the body: a fat drop, the head its round end
        const body = cw(C.curve([[-0.42, 0.0], [-0.2, -0.17], [0.12, -0.2], [0.36, -0.14], [0.46, 0.02], [0.36, 0.17], [0.05, 0.2], [-0.24, 0.13]], true, 6));
        C.prism(g, body, Db, { front: col.front, top: col.top, side: col.side }, { lw: L, sweepInk: null });
        C.prismOutline(g, body, Db, { lw: L });
        g.save();
        C.trace(g, body);
        g.clip();
        g.beginPath();
        g.ellipse(0.02, 0.2, 0.36, 0.13, 0, 0, TAU);
        g.fillStyle = '#fff1c4';
        g.fill();
        g.restore();
        C.poly(g, body, { ink: K.ink, lw: L });
        // beak, eye
        C.prism(g, cw([[0.43, -0.07], [0.66, 0.02], [0.43, 0.08]]), [0.05, -0.035], { front: K.yellow, top: '#fff59a', side: K.gold }, { lw: L });
        if (o.shades) {
            C.poly(g, [[0.12, -0.115], [0.44, -0.115], [0.42, -0.02], [0.32, 0.0], [0.26, -0.05], [0.2, 0.0], [0.13, -0.02]], { fill: '#1d1626', ink: K.ink, lw: L * 0.8 });
            line(g, [[0.17, -0.045], [0.21, -0.09]], '#ffffff', L * 0.8);
        } else {
            g.beginPath();
            g.arc(0.27, -0.06, 0.062, 0, TAU);
            g.fillStyle = '#fffdf4';
            g.fill();
            g.strokeStyle = K.ink;
            g.lineWidth = L * 0.8;
            g.stroke();
            g.beginPath();
            g.arc(0.27 + (o.look ?? 0) * 0.025, -0.06 + (o.lookY ?? 0) * 0.025, 0.03, 0, TAU);
            g.fillStyle = K.ink;
            g.fill();
        }
        // the near wing, over the body
        const tip = [wx, wy];
        C.poly(g, C.curve([[-0.2, -0.04], [lerp(-0.2, tip[0], 0.6) - 0.1, lerp(-0.04, tip[1], 0.6)], tip, [lerp(0.16, tip[0], 0.5) + 0.08, lerp(-0.02, tip[1], 0.55)], [0.16, -0.02], [0, 0.04]], true, 5), { fill: col.wing, ink: K.ink, lw: L });
        line(g, [[lerp(-0.02, tip[0], 0.3), lerp(-0.01, tip[1], 0.3)], [lerp(-0.02, tip[0], 0.75), lerp(-0.01, tip[1], 0.75)]], col.wingD, L * 0.9);
        g.restore();
    }
    // The sun's smile opens into a grin: painted over the sun World.back has just drawn
    // (same place, same bob). k 0..1 its size.
    function sunGrin(g, t, X, sun, k) {
        if (k <= 0) return;
        const r = sun.r, bob = C.drawing(t) % 4 < 2 ? 0 : 3;
        g.save();
        g.translate(World.sunX(sun, X), sun.y + bob);
        g.fillStyle = K.yellow;
        g.fillRect(-r * 0.4, r * 0.28, r * 0.84, r * 0.34);
        const up = C.curve([[-0.42, 0.3], [-0.2, 0.36], [0.04, 0.37], [0.28, 0.33], [0.46, 0.24]].map(([x, y]) => [x * r, y * r]), false, 6);
        const lo = C.curve([[0.46, 0.24], [0.34, 0.3 + 0.36 * k], [0.04, 0.36 + 0.4 * k], [-0.26, 0.32 + 0.36 * k], [-0.42, 0.3]].map(([x, y]) => [x * r, y * r]), false, 6);
        const m = [...up, ...lo.slice(1, -1)];
        C.poly(g, m, { fill: '#fffdf4', lw: 0 });
        g.save();
        C.trace(g, m);
        g.clip();
        for (let i = -3; i <= 4; i++) line(g, [[i * r * 0.115 + r * 0.02, r * 0.2], [i * r * 0.115 + r * 0.02, r * 0.9]], K.ink, 2);
        line(g, [[-r * 0.5, r * (0.34 + 0.19 * k)], [r * 0.5, r * (0.31 + 0.19 * k)]], K.ink, 2);
        g.restore();
        C.poly(g, m, { ink: K.ink, lw: 3.4 });
        g.restore();
    }

    // --- the road, close ---------------------------------------------------------------------
    // World.back's day road at a still X, redrawn through a view M so its outlines keep their
    // width when the camera is close: the same cells, in the same order, with the same seeds.
    function roadClose(g, t, X, M) {
        const W = World.THEMES.day, k = M.k, HOR = World.HOR, R0 = World.ROAD0, R1 = World.ROAD1;
        const x = (v) => zx(M, v), y = (v) => zy(M, v), sx = (v) => (v - M.ox) / k;
        C.sunburst(g, x(500), y(HOR + 40), { n: 12, rot: t * 0.06, a: W.skyA, b: W.skyB });
        World.cells(X, 0.035, 430, 260, 'cloud', (i, cx, r) => {
            const cy = 130 + r() * 230, s = 60 + r() * 50;
            if (y(cy) > -s * k) World.cloud(g, W, x(cx), y(cy), s * k);
        });
        World.cells(X, 0.12, 470, 420, 'mesa', (i, mx, r) => {
            const tall = r() < 0.3, w = tall ? 110 + r() * 50 : 210 + r() * 160, h = tall ? 190 + r() * 70 : 90 + r() * 90, dep = 30 + r() * 20;
            g.save();
            g.translate(0, y(HOR) - HOR);
            World.mesa(g, W, x(mx), w * k, h * k, dep * k);
            g.restore();
        });
        const dune = [[-20, y(R0)]];
        for (let px = -20; px <= 1020; px += 20) {
            const wx = sx(px) + X * 0.25;
            dune.push([px, y(HOR - 16 - 12 * Math.sin(wx / 130) - 7 * Math.sin(wx / 47 + 1))]);
        }
        dune.push([1020, y(R0)]);
        C.poly(g, dune, { fill: W.dune, lw: 0 });
        C.poly(g, dune.slice(1, -1), { ink: K.ink, lw: 4, close: false });
        World.cells(X, 0.25, 210, 80, 'dunemark', (i, dx, r) => {
            const y0 = HOR + 6 + r() * 14, l = 40 + r() * 50, y1 = HOR + 6 + r() * 14;
            line(g, [[x(dx), y(y0)], [x(dx + l), y(y1)]], W.duneLine, 3);
        });
        g.fillStyle = W.sand;
        g.fillRect(-20, y(HOR + 34), 1040, y(R0) - y(HOR + 34) + 2);
        const edge = [];
        for (let px = -20; px <= 1020; px += 20) edge.push([px, y(HOR + 36 + 4 * Math.sin((sx(px) + X * 0.5) / 90))]);
        C.poly(g, edge, { ink: K.ink, lw: 4, close: false });
        World.cells(X, 0.6, 130, 60, 'ripple', (i, rx, r) => {
            const y0 = HOR + 52 + r() * 24, l = 18 + r() * 30, y1 = HOR + 52 + r() * 24;
            line(g, [[x(rx), y(y0)], [x(rx + l), y(y1)]], W.sandD, 3.4);
        });
        // poles and wires
        const SP = 430, PF = 0.86, PH = 250, py = R0 - 26, px = (i) => i * SP - X * PF;
        const col = { front: W.wood, top: W.wood, side: W.woodSide };
        for (let i = Math.floor((X * PF - 400) / SP) - 1; i <= Math.ceil((X * PF + 1400) / SP); i++) {
            for (const dx of [-36, 36]) {
                g.beginPath();
                g.moveTo(x(px(i) + dx), y(py - PH + 8));
                g.quadraticCurveTo(x((px(i) + px(i + 1)) / 2 + dx), y(py - PH + 62), x(px(i + 1) + dx), y(py - PH + 8));
                g.strokeStyle = W.wire;
                g.lineWidth = 2.6;
                g.stroke();
            }
        }
        const pole = (qx) => {
            C.box(g, x(qx - 6), y(py - PH), 12 * k, PH * k, [5 * k, -3.4 * k], col, { lw: 3 });
            C.box(g, x(qx - 46), y(py - PH + 22), 92 * k, 10 * k, [5 * k, -3.4 * k], col, { lw: 3 });
            for (const dx of [-36, 36]) C.box(g, x(qx + dx - 5), y(py - PH + 10), 10 * k, 12 * k, [3 * k, -2 * k], { front: '#8cefe6', top: '#8cefe6', side: '#17b8a6' }, { lw: 2.4 });
        };
        const sign = (qx, qy, kind) => {
            C.box(g, x(qx - 4), y(qy - 96), 8 * k, 96 * k, [4 * k, -2.7 * k], col, { lw: 2.6 });
            const p = (px_, py_) => [x(qx + px_), y(qy + py_)];
            if (kind === 0) {
                C.prism(g, [p(-26, -150), p(26, -150), p(26, -112), p(0, -88), p(-26, -112)], [4 * k, -2.7 * k], { front: '#fffdf4', top: '#fffdf4', side: '#c9cde0' }, { lw: 3 });
                g.fillStyle = K.ink;
                g.font = `${34 * k}px "Anton"`;
                g.textAlign = 'center';
                g.textBaseline = 'alphabetic';
                g.fillText('66', x(qx), y(qy - 108));
            } else {
                C.prism(g, [p(0, -164), p(36, -128), p(0, -92), p(-36, -128)], [4 * k, -2.7 * k], { front: W.sign, top: W.sign, side: '#e0a800' }, { lw: 3 });
                C.poly(g, [p(-10, -110), p(-10, -130), p(8, -144)], { ink: W.signInk, lw: 6 * k, close: false });
                C.poly(g, [p(1, -148), p(14, -148), p(12, -135)], { fill: W.signInk, ink: W.signInk, lw: 2 * k });
            }
        };
        const things = [];
        World.cells(X, 0.8, 250, 160, 'verge', (i, vx, r) => {
            const kd = r(), vy = HOR + 62 + r() * 40;
            things.push([vy, () => {
                if (kd < 0.4) World.cactus(g, W, x(vx), y(vy), (96 + r() * 60) * k, r() < 0.5 ? 1 : -1);
                else if (kd < 0.58) World.rock(g, W, x(vx), y(vy), (50 + r() * 40) * k);
                else if (kd < 0.74) World.bush(g, W, x(vx), y(vy), (34 + r() * 22) * k);
                else if (kd < 0.84) World.skull(g, W, x(vx), y(vy), 44 * k);
            }]);
        });
        for (let i = Math.floor((X * PF - 400) / SP); i <= Math.ceil((X * PF + 1400) / SP); i++) things.push([py, () => pole(px(i))]);
        World.cells(X, 0.92, 760, 80, 'sign', (i, qx) => things.push([R0 - 10, () => sign(qx, R0 - 10, ((i % 2) + 2) % 2)]));
        things.sort((a, b) => a[0] - b[0]).forEach(([, fn]) => fn());
        // the road
        g.fillStyle = W.road;
        g.fillRect(-20, y(R0), 1040, (R1 - R0) * k);
        line(g, [[-20, y(R0)], [1020, y(R0)]], K.ink, 4);
        line(g, [[-20, y(R0 + 12)], [1020, y(R0 + 12)]], W.roadEdge, 3.4 * k * 0.8);
        World.cells(X, 1, 170, 120, 'dash', (i) => {
            const dx = i * 170 - X;
            line(g, [[x(dx), y(866)], [x(dx + 86), y(866)]], W.roadLine, 8 * k);
        });
        World.cells(X, 1, 940, 160, 'crack', (i, cx, r) => {
            const a = R0 + 30 + r() * 20, b = R0 + 46 + r() * 20, c = R0 + 40 + r() * 20, d = R0 + 64 + r() * 20;
            line(g, [[x(cx), y(a)], [x(cx + 26), y(b)], [x(cx + 40), y(c)], [x(cx + 70), y(d)]], W.crack, 3);
        });
        line(g, [[-20, y(R1 - 12)], [1020, y(R1 - 12)]], W.roadEdge, 3.4 * k * 0.8);
        g.fillStyle = W.sand;
        g.fillRect(-20, y(R1), 1040, 400);
        line(g, [[-20, y(R1)], [1020, y(R1)]], K.ink, 4);
        World.cells(X, 1.15, 110, 60, 'pebble', (i, qx, r) => {
            const qy = R1 + 14 + r() * 36;
            if (r() < 0.5) line(g, [[x(qx), y(qy)], [x(qx + 16 + r() * 26), y(qy)]], W.sandD, 3.4);
            else {
                g.beginPath();
                g.ellipse(x(qx), y(qy), (7 + r() * 5) * k, (4 + r() * 3) * k, 0, 0, TAU);
                g.fillStyle = W.sandD;
                g.fill();
            }
        });
    }

    // --- the band's car off the ground -----------------------------------------------------
    // In the air the car's shadow belongs on the road (Rides.bandCar takes shadow: false), and
    // its riders can float off the deck (o.lift, in figure units each).
    const SHADOW = 'rgba(36,21,49,0.28)';
    // Rig.band with Tom at the wheel, plus the lift; and, with o.swap = { tom: [x, y] where Tom is
    // (car units), mike: 0..1 from deck[0] back to deck[1], shadow: 0..1 Tom's on the boards },
    // the change of places in mid-air that ends in Rig.band's `tomDrives: false` layout.
    function riders(g, t, x, y, s, o) {
        const pz = Rig.playing(t, o), ov = o.pose ?? {}, lift = o.lift ?? {};
        const pose = (who) => ({ ...pz[who], ...(ov[who] ?? {}) });
        Rides.bandCar(g, x, y, s, { spin: o.spin ?? 0, bounce: o.bounce ?? 0, lean: o.lean ?? 0, exhaust: o.exhaust ?? 0, shadow: o.shadow, t }, (g2, seats, sc0) => {
            const put = (p, who, fn) => {
                const up = lift[who] ?? 0;
                if (up > 0.01 && who !== 'tom') {
                    // the shadow he leaves on the boards
                    g2.fillStyle = SHADOW;
                    g2.beginPath();
                    g2.ellipse(p[0] + 0.05, p[1], 0.5 / (1 + up * 1.5), 0.05, 0, 0, TAU);
                    g2.fill();
                }
                Rides.at(g2, sc0, [p[0], p[1] - up, p[2]], (px, py, sc) => fn(px, py, sc));
            };
            const dk = seats.deck, sw = o.swap ?? null, back = sw && sw.mike > 0.3; // in the far row he is drawn before Benmont
            const mikeAt = sw ? [lerp(dk[0][0], dk[1][0], sw.mike), lerp(dk[0][1], dk[1][1], sw.mike), 0] : dk[0];
            const mike = () => put(mikeAt, 'mike', (px, py, sc) => BandStrings.mike(g2, px, py, sc, pose('mike')));
            put(seats.kit, 'stan', (px, py, sc) => BandRhythm.stan(g2, px, py, sc, pose('stan')));
            put(dk[3], 'howie', (px, py, sc) => BandStrings.howie(g2, px, py, sc, pose('howie')));
            if (back) mike();
            put(dk[2], 'ben', (px, py, sc) => BandRhythm.benmont(g2, px, py, sc, pose('ben')));
            if (!back) mike();
            if (sw && (sw.shadow ?? 0) > 0) {
                g2.fillStyle = SHADOW;
                g2.beginPath();
                g2.ellipse(dk[0][0] + 0.05, dk[0][1], 0.5 * sw.shadow, 0.05 * sw.shadow, 0, 0, TAU);
                g2.fill();
            }
            Rides.at(g2, sc0, sw ? sw.tom : seats.driver, (px, py, sc) => Cast.tom(g2, px, py - (sw ? 0 : (lift.tom ?? 0)) * sc, sc, { ...pose('tom'), shadow: !(sw || (lift.tom ?? 0) > 0.02) })); // off his feet he casts none here
        });
    }
    /**
     * The band on its car, on the road or over it. (x, y): the point under the middle of the
     * car, where Rig.band takes it; the whole rig turns about that point by o.tilt (radians,
     * clockwise = nose down). o.ground: the road's y under it (the shadow falls there);
     * o.lift: { stan, ben, howie, mike, tom } figure units off the deck; the rest as Rig.band.
     */
    function car(g, t, x, y, s, o = {}) {
        const ground = o.ground ?? y, hgt = Math.max(0, ground - y), air = hgt > 0.5 || Math.abs(o.tilt ?? 0) > 1e-4, kk = 1 / (1 + hgt / 420);
        if (air) {
            g.fillStyle = SHADOW;
            g.beginPath();
            g.ellipse(x + 0.3 * s, ground - 0.1 * s, 4.8 * s * kk, 0.2 * s * kk, 0, 0, TAU);
            g.fill();
        }
        g.save();
        g.translate(x, y);
        g.rotate(o.tilt ?? 0);
        if (o.lift || o.swap) riders(g, t, 0, 0, s, { ...o, shadow: !air });
        else Rig.band(g, t, 0, 0, s, { ...o, shadow: !air });
        g.restore();
    }

    return { SL, EARTH, ROAD, zx, zy, inSite, pitShape, pitInside, pitLip, pitNear, clipAbove, clod, heap, heapSize, puffs, dust, inDevil, shovel, SHOVEL, mitt, devil, roll, sheet, bird, sunGrin, roadClose, car };
})();
