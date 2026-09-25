// Faraday's helix of copper wire, the cylindrical bar magnet and the magnet's field lines as
// real 3D objects, drawn with a perspective camera (the one of scope3d.js), so the coil stays one
// coil from any side, from outside and from inside. Global: Coil3D.
//
//   Coil3D.cam(eye, target, flen, c, roll)       a camera (proj(p) → [x, y, depth])
//   Coil3D.helix(o)                              3D points of a helix round the x axis:
//                                                o: { r, pitch, x0, a0, a1, n } (angles in rad)
//   Coil3D.wire(press, C, pts, wr, o)            the wire through pts, radius wr: back half,
//                                                then o.between(), then the front half; o: {
//                                                spec, lit, dark, near }
//   Coil3D.cylinder(press, C, x0, x1, r, o)      a round bar along x (the magnet): o: { bands:
//                                                [[x0, x1, spec]], lit, dark, end }
//   Coil3D.dipole(press, C, o)                   field lines of a bar magnet along x: loops
//                                                r = L sin²θ in planes round the axis. o: {
//                                                c, Ls, az, spec(i), w, flow, grow }
//
// World: x along the coil's axis, y up, z towards the front.
const Coil3D = (() => {
    const { put, ink, line, circle } = Ph;
    const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
    const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    const COPPER = { 'yellow.s': 0.8, 'pink.s': 0.62, 'navy.s': 0.22 };
    const COPPER_LT = { yellow: 1, 'pink.s': 0.35 };
    const COPPER_DK = { 'yellow.s': 0.85, 'pink.s': 0.75, 'navy.s': 0.62 };

    function cam(eye, target, flen, c, roll = 0) { return { ...Scope3D.camera({ eye, target, flen, c, roll }), flen }; }

    function helix(o) {
        const n = o.n ?? Math.max(8, Math.ceil(Math.abs(o.a1 - o.a0) / 0.12)), out = [];
        for (let i = 0; i <= n; i++) {
            const a = o.a0 + (o.a1 - o.a0) * (i / n);
            out.push([o.x0 + (o.pitch * a) / (2 * Math.PI), (o.ay ?? 0) + o.r * Math.cos(a), o.r * Math.sin(a)]);
        }
        return out;
    }

    // a tube of radius wr along 3D points: split into runs facing the camera or not (the
    // outward normal is the helix's radial direction), each run drawn as a lit copper stroke
    function wire(press, C, pts, wr, o = {}) {
        const near = o.near ?? 4;
        const runs = { back: [], front: [] };
        let cur = null, curSide = null;
        for (const p of pts) {
            const py = p[1] - (o.ay ?? 0), rr = Math.hypot(py, p[2]) || 1, nrm = [0, py / rr, p[2] / rr];
            const side = dot(nrm, sub(C.eye, p)) > 0 ? 'front' : 'back';
            const q = C.proj(p);
            const ok = dot(sub(p, C.eye), C.f) > near;
            if (!ok || side !== curSide) { if (cur && cur.length > 1) runs[curSide].push(cur); cur = null; curSide = side; }
            if (!ok) continue;
            if (!cur) cur = [];
            cur.push([q[0], q[1], q[2]]);
        }
        if (cur && cur.length > 1) runs[curSide].push(cur);
        const stroke = (run, back) => {
            const w = (u) => { const q = run[Math.min(run.length - 1, Math.round(u * (run.length - 1)))]; return Math.max(1.2, (2 * wr * C.flen) / q[2]); };
            const P = run.map((q) => [q[0], q[1]]);
            line(press, P, (u) => w(u) * 1.12, o.dark ?? COPPER_DK);
            line(press, P, w, back ? (o.dark ?? COPPER_DK) : (o.spec ?? COPPER));
            if (!back) line(press, P.map(([x, y], i) => { const k = w(i / (P.length - 1)) * 0.22; return [x - k * 0.6, y - k]; }), (u) => w(u) * 0.28, o.lit ?? COPPER_LT, { knock: false });
        };
        for (const r of runs.back) stroke(r, true);
        o.between?.();
        for (const r of runs.front) stroke(r, false);
    }

    // convex hull of screen points
    function hull(pts) {
        const p = pts.map((q) => [q[0], q[1]]).sort((a, b) => a[0] - b[0] || a[1] - b[1]);
        const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
        const lo = [], hi = [];
        for (const q of p) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); }
        for (let i = p.length - 1; i >= 0; i--) { const q = p[i]; while (hi.length >= 2 && cr(hi[hi.length - 2], hi[hi.length - 1], q) <= 0) hi.pop(); hi.push(q); }
        return lo.slice(0, -1).concat(hi.slice(0, -1));
    }
    const polyPath = (pts) => (g) => { g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); };
    const ring = (C, x, r, n = 40, ay = 0) => Array.from({ length: n }, (_, i) => C.proj([x, ay + r * Math.cos((i / n) * 6.2832), r * Math.sin((i / n) * 6.2832)]));

    // a round bar along x from x0 to x1, radius r (profile(u) scales r along it, for rounded
    // or swelling shapes); bands of colour along it; lit along the top, dark underneath
    function cylinder(press, C, x0, x1, r, o = {}) {
        const prof = o.profile ?? (() => 1), N = 14, ay = o.ay ?? 0;
        const xs = Array.from({ length: N + 1 }, (_, i) => x0 + ((x1 - x0) * i) / N);
        const rings = xs.map((x, i) => ring(C, x, r * prof(i / N), 28, ay));
        const sil = hull(rings.flat());
        put(press, polyPath(sil), o.base ?? { navy: 1, 'pink.s': 0.3 });
        press.save(); press.clip(polyPath(sil));
        for (const [b0, b1, spec] of o.bands ?? []) {
            const s0 = Math.max(x0, b0), s1 = Math.min(x1, b1);
            if (s1 <= s0) continue;
            const pts = hull(ring(C, s0, r * 1.2, 20, ay).concat(ring(C, s1, r * 1.2, 20, ay)));
            ink(press, polyPath(pts), spec);
        }
        // shading bands in the bar's frame: dark under, lit along the top
        const band = (a0, a1, spec) => {
            const pts = [];
            for (let i = 0; i <= 10; i++) { const a = a0 + ((a1 - a0) * i) / 10; pts.push(C.proj([x0, ay + r * 1.01 * prof(0) * Math.cos(a), r * 1.01 * prof(0) * Math.sin(a)])); }
            for (let i = 10; i >= 0; i--) { const a = a0 + ((a1 - a0) * i) / 10; pts.push(C.proj([x1, ay + r * 1.01 * prof(1) * Math.cos(a), r * 1.01 * prof(1) * Math.sin(a)])); }
            ink(press, polyPath(pts), spec);
        };
        band(Math.PI * 0.6, Math.PI * 1.35, o.dark ?? { 'navy.s': 0.45 });
        band(Math.PI * 0.35, Math.PI * 0.6, { 'navy.s': 0.18 });
        press.knockout((g) => { Ph.poly(g, Ph.outline([C.proj([x0 + (x1 - x0) * 0.04, ay + r * 0.96 * prof(0.04), r * 0.28]), C.proj([x1 - (x1 - x0) * 0.04, ay + r * 0.96 * prof(0.96), r * 0.28])], Ph.taper(Math.max(1.5, r * 0.18 * C.flen / Math.max(1, C.proj([0.5 * (x0 + x1), ay, 0])[2])), 0.2, 0.2))); g.globalAlpha = 0.6; g.fill(); g.globalAlpha = 1; });
        press.restore();
        // the end face towards the camera
        for (const [x, nx, k] of [[x0, -1, prof(0)], [x1, 1, prof(1)]]) {
            if (k < 0.05) continue;
            if (dot([nx, 0, 0], sub(C.eye, [x, ay, 0])) <= 0) continue;
            put(press, polyPath(ring(C, x, r * k, 40, ay)), o.end ?? { navy: 1, 'pink.s': 0.5 });
        }
    }

    // a bar magnet's field lines along x, centred at o.c (x), loops r = L sin²θ round the axis
    // at azimuths o.az; each line flows (a dash moving from N to S outside); grow (0..1) blooms
    // them out from the poles
    function dipole(press, C, o) {
        const cx = o.c ?? 0, grow = o.grow ?? 1;
        o.Ls.forEach((L, li) => {
            for (const az of o.az) {
                const pts = [];
                const th0 = 0.12, th1 = Math.PI - 0.12, n = 60;
                for (let i = 0; i <= n; i++) {
                    const u = i / n, th = th0 + (th1 - th0) * Math.min(u, grow), r = L * Math.sin(th) ** 2;
                    const p = [cx + r * Math.cos(th), (o.ay ?? 0) + r * Math.sin(th) * Math.cos(az), r * Math.sin(th) * Math.sin(az)];
                    if (dot(sub(p, C.eye), C.f) < 6) { if (pts.length > 1) break; continue; }
                    const q = C.proj(p); pts.push([q[0], q[1]]);
                    if (u > grow) break;
                }
                if (pts.length < 2) continue;
                const spec = o.spec(li, az);
                line(press, pts, Ph.taper(o.w ?? 3, 0.1, 0.1), spec);
                // the flow: short bright dashes moving along
                if (o.flow != null) {
                    const S = Ph.sample(pts, false, 3), step = Math.max(6, Math.floor(S.length / 6));
                    for (let k = Math.floor((o.flow * step) % step); k < S.length - 2; k += step) line(press, [S[k], S[k + 1], S[k + 2]], (o.w ?? 3) * 1.6, o.dash ?? { yellow: 1 }, { knock: false });
                }
            }
        });
    }

    return { cam, helix, wire, cylinder, dipole, hull, ring, polyPath, COPPER, COPPER_LT, COPPER_DK };
})();
