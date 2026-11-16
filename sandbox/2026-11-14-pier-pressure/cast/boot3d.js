// pier-pressure · a boot in real perspective. The genre's chunky sneaker as a small 3D model
// (a sole slab from its top-view outline, an upper lofted from arches along the foot) turned
// any way and projected, so a boot kicked at the camera, seen from under, from behind or from
// its side is the same boot. Its silhouettes are the hulls of the projected parts, inked by
// hand like everything else.
//   Cast.boot3d(g, ankle, size, toe, up, o)
// ankle: where the leg goes into the collar, [x, y]; size: the boot's length; toe, up: the
// directions of its toe and of its top as [x, y, z] (x right, y down, z towards the viewer);
// o: { upper, sole, stripe, cap, high, mirror, w, fine, seed, D (camera distance, in boots) }.
(() => {
    const T = SkateToon, C = T.COL;
    const norm = (v) => {
        const l = Math.hypot(v[0], v[1], v[2]) || 1;
        return [v[0] / l, v[1] / l, v[2] / l];
    };
    const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
    const dot3 = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    // convex hull (monotone chain), counter-clockwise in y-down screen space
    function hull(pts) {
        const p = pts.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
        const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
        const lo = [], up = [];
        for (const q of p) {
            while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop();
            lo.push(q);
        }
        for (const q of p.slice().reverse()) {
            while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop();
            up.push(q);
        }
        return lo.slice(0, -1).concat(up.slice(0, -1));
    }
    // half the sole's width along the foot (heel −0.5 … toe 0.5)
    const HALF = [[-0.5, 0], [-0.485, 0.07], [-0.45, 0.125], [-0.38, 0.16], [-0.25, 0.175], [-0.08, 0.18], [0.1, 0.2], [0.25, 0.215], [0.36, 0.2], [0.43, 0.165], [0.475, 0.11], [0.497, 0.05], [0.5, 0]];
    const halfAt = (X) => {
        for (let i = 1; i < HALF.length; i++) if (X <= HALF[i][0]) {
            const [x0, h0] = HALF[i - 1], [x1, h1] = HALF[i];
            return h0 + ((h1 - h0) * (X - x0)) / (x1 - x0);
        }
        return 0;
    };
    const OUT = [...HALF, ...HALF.slice(1, -1).reverse().map(([X, h]) => [X, -h])];
    const ST = 0.14; // the sole's thickness
    // arches of the upper along the foot: [X, half width, height]
    const ARCH = [[-0.495, 0.05, 0.5], [-0.47, 0.115, 0.6], [-0.4, 0.15, 0.68], [-0.28, 0.16, 0.7], [-0.14, 0.16, 0.64], [-0.02, 0.165, 0.48], [0.12, 0.185, 0.38], [0.26, 0.2, 0.32], [0.38, 0.185, 0.28], [0.455, 0.12, 0.21], [0.49, 0.04, 0.16]];

    function boot3d(g, ankle, size, toe, up, o = {}) {
        const { upper = C.shoe, sole = C.white, stripe = C.red, cap = C.white, high = true, mirror = false, w = T.LINE, fine = T.LINE_FINE, seed = 'boot', D = 3.2, tread = C.grey, face = '#eef0ea' } = o;
        const ex = norm(toe);
        const ez = norm(up.map((v, i) => v - dot3(up, ex) * ex[i]));
        let ey = cross(ez, ex);
        if (mirror) ey = ey.map((v) => -v);
        const cam = (X, Y, Z) => [X * ex[0] + Y * ey[0] + Z * ez[0], X * ex[1] + Y * ey[1] + Z * ez[1], X * ex[2] + Y * ey[2] + Z * ez[2]];
        const Hh = (X, h) => (X < 0.05 && !high ? ST + (h - ST) * 0.62 : h);
        const c0 = cam(-0.29, 0, Hh(-0.29, 0.62));
        const pr = ([X, Y, Z]) => {
            const p = cam(X, Y, Z), k = D / (D - (p[2] - c0[2]));
            return [ankle[0] + (p[0] - c0[0]) * k * size, ankle[1] + (p[1] - c0[1]) * k * size];
        };
        const arch = ([X, wd, h], n = 8, a0 = 0, a1 = Math.PI) => Array.from({ length: n + 1 }, (_, i) => {
            const th = a0 + ((a1 - a0) * i) / n;
            return [X, wd * Math.cos(th), ST * 0.85 + (Hh(X, h) - ST * 0.85) * Math.pow(Math.sin(th), 0.8)];
        });
        // a part's silhouette: the hull of its projected points, corners where it turns sharply
        const outline = (pts3) => {
            let h = hull(pts3.map(pr));
            h = h.filter((q, i) => i === 0 || Math.hypot(q[0] - h[i - 1][0], q[1] - h[i - 1][1]) > size * 0.02);
            const n = h.length;
            return h.map((q, i) => {
                const a = h[(i + n - 1) % n], b = h[(i + 1) % n];
                const t = Math.abs(Math.atan2((q[0] - a[0]) * (b[1] - q[1]) - (q[1] - a[1]) * (b[0] - q[0]), (q[0] - a[0]) * (b[0] - q[0]) + (q[1] - a[1]) * (b[1] - q[1])));
                return [q[0], q[1], t > 0.85 ? 1 : 0];
            });
        };
        const part = (pts3, fill, key, lw = w) => {
            let h = hull(pts3.map(pr));
            h = h.filter((q, i) => i === 0 || Math.hypot(q[0] - h[i - 1][0], q[1] - h[i - 1][1]) > size * 0.02);
            const n = h.length;
            const spec = h.map((q, i) => {
                const a = h[(i + n - 1) % n], b = h[(i + 1) % n];
                const t = Math.abs(Math.atan2((q[0] - a[0]) * (b[1] - q[1]) - (q[1] - a[1]) * (b[0] - q[0]), (q[0] - a[0]) * (b[0] - q[0]) + (q[1] - a[1]) * (b[1] - q[1])));
                return [q[0], q[1], t > 0.85 ? 1 : 0];
            });
            return T.shape(g, spec, { fill, w: lw, seed: seed + key, hand: true, amp: 0.22 });
        };
        const ln = (pts3, key, oo = {}) => pts3.length > 1 && T.line(g, pts3.map(pr), { w: fine, seed: seed + key, hand: true, ...oo });
        const seeBottom = -ez[2] > 0.1, seeTop = ez[2] > 0.15;
        const solePts = [...OUT.map(([X, Y]) => [X, Y, 0]), ...OUT.map(([X, Y]) => [X * 0.985, Y * 0.96, ST])];
        // the upper is two forms in one skin: the shaft round the ankle and the vamp over the
        // foot, so the boot keeps its bend at the instep from every side
        const shaftPts = ARCH.filter((a) => a[0] <= -0.02).flatMap((a) => arch(a));
        const vampPts = [...arch([-0.3, 0.165, 0.4]), ...ARCH.filter((a) => a[0] >= -0.02).flatMap((a) => arch(a)), ...arch([-0.47, 0.12, 0.3])];
        const capPts = [...ARCH.filter((a) => a[0] >= 0.3).flatMap((a) => arch(a)), ...arch([0.3, 0.197, 0.305]), ...OUT.filter(([X]) => X >= 0.3).map(([X, Y]) => [X * 0.985, Y * 0.96, ST])];
        const drawUpper = () => {
            T.skin(g, [T.path(outline(vampPts), true), T.path(outline(shaftPts), true)], { fill: upper, w, seed: seed + 'u' });
            if (cap) part(capPts, cap, 'c', fine);
            // laces over the instep, seen from above; the patch on the side that faces us
            if (seeTop) for (const [i, X] of [-0.08, 0.04, 0.16].entries()) {
                const k = ARCH.findIndex((a) => a[0] > X), a = ARCH[k - 1], b = ARCH[k], u = (X - a[0]) / (b[0] - a[0]);
                ln(arch([X, a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u], 5, Math.PI * 0.28, Math.PI * 0.72), 'l' + i);
            }
            const sd = ey[2] > 0.25 ? 1 : ey[2] < -0.25 ? -1 : 0;
            if (sd && high) {
                const cz = 0.43, cx = -0.3, r = 0.085, ring = (rr, n, f = () => 1) => Array.from({ length: n }, (_, i) => {
                    const t = (i / n) * Math.PI * 2 - Math.PI / 2;
                    return [cx + Math.cos(t) * rr * f(i), sd * 0.17, cz - Math.sin(t) * rr * f(i)];
                });
                T.shape(g, ring(r, 12).map(pr), { fill: C.white, w: fine, seed: seed + 'pt', hand: true, amp: 0.15 });
                g.fillStyle = stripe;
                g.beginPath();
                for (const q of ring(r * 0.72, 10, (i) => (i % 2 ? 0.45 : 1)).map(pr)) g.lineTo(q[0], q[1]);
                g.fill();
            }
        };
        const drawSole = () => {
            part(solePts, sole, 's');
            // the welt: a line of colour round the wall, where the wall faces us
            const welt = OUT.map(([X, Y], i) => {
                const a = OUT[(i + OUT.length - 1) % OUT.length], b = OUT[(i + 1) % OUT.length];
                const nrm = cam(-(b[1] - a[1]), b[0] - a[0], 0);
                return { p: [X, Y, ST * 0.5], vis: nrm[2] > 0.05 };
            });
            let run = [];
            const flush = (k) => {
                if (run.length > 2) ln(run, 'w' + k, { color: stripe, w: fine * 1.25, taper: false });
                run = [];
            };
            // start at an edge the camera does not see, so a visible run is never cut in two
            const st = Math.max(0, welt.findIndex((q) => !q.vis));
            for (let i = 0; i < welt.length; i++) {
                const q = welt[(st + i) % welt.length];
                if (q.vis) run.push(q.p);
                else flush(i);
            }
            flush('z');
            if (seeBottom) {
                T.shape(g, OUT.map(([X, Y]) => [...pr([X, Y, 0]), Math.abs(X) > 0.499 ? 0 : 0]), { fill: face, w, seed: seed + 'f', hand: true, amp: 0.2 });
                ln(OUT.map(([X, Y]) => [X * 0.86, Y * 0.8, 0]).concat([[OUT[0][0] * 0.86, 0, 0]]), 'rim', { w: fine * 0.9 });
                for (const [i, X] of [0.08, 0.16, 0.24, 0.32, 0.39].entries()) ln([[X, -halfAt(X) * 0.74, 0], [X + 0.012, 0, 0], [X, halfAt(X) * 0.74, 0]], 'tb' + i);
                T.shape(g, [[-0.42, -0.09], [-0.36, -0.125], [-0.2, -0.13], [-0.2, 0.13], [-0.36, 0.125], [-0.42, 0.09]].map(([X, Y], i) => [...pr([X, Y, 0]), i === 2 || i === 3 ? 1 : 0]), { fill: tread, w: fine, seed: seed + 'hb', hand: true });
                for (const [i, X] of [-0.35, -0.27].entries()) ln([[X, -0.1, 0], [X, 0.1, 0]], 'hl' + i, { w: fine * 0.9 });
                T.shape(g, Array.from({ length: 10 }, (_, i) => pr([-0.06 + Math.cos(i * 0.628) * 0.075, Math.sin(i * 0.628) * 0.085, 0])), { fill: stripe, w: fine * 0.9, seed: seed + 'ar', hand: true, amp: 0.15 });
            }
        };
        if (seeBottom) (drawUpper(), drawSole());
        else (drawSole(), drawUpper());
        return { pr };
    }
    Cast.boot3d = boot3d;
})();
