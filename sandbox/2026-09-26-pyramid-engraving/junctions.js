// The doorways between the film's spaces. Each room is built in its own coordinates, with its
// own light and scale; what joins them is a portal (Engrave.portal): an opening in one space
// through which the next is seen, rendered from the matching camera, and which the camera
// flies through without a cut. The user: «las transiciones dan saltos, creía que serían
// transiciones naturales». So every change of space happens through something in the shot
// (a ring, a tunnel, a door, the seed's skin, a shaft) and the camera keeps its speed across
// it; what leads (the structure, the seed) goes through first, at the speed it has.
//
// A junction { A, B, ux, wa, wb, live, oA(u), oB(u), shape } joins space A to space B:
//   ux       story time at which the camera crosses the opening
//   wa, wb   the camera is bridged from A's own path at ux − wa to B's own path at ux + wb
//            (a Hermite curve through the opening, matched speeds; the view blends from A's
//            own camera to B's)
//   live     while the opening is a portal (outside it, each space draws what it has there)
//   oA, oB   the opening as a frame in each space: { c, q, s } (+z the way through, A → B,
//            +y its up; the map between the spaces is the one that takes oA onto oB)
//   shape    'disc' (inside a ring), 'rect' ([w, h] in units of s) or 'sphere' (sphere(u) =
//            [centre, radius] of the hole in A)
//   oneWay   seen only from A;  noView  never seen (the camera only passes it)
const Junctions = (() => {
    const E = (u, a, b) => Ease.inOut(Ease.seg(u, a, b));
    const add = (a, b) => a.map((v, i) => v + b[i]), sub = (a, b) => a.map((v, i) => v - b[i]);
    const mul = (a, k) => a.map((v) => v * k), len = (a) => Math.hypot(...a);
    const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    const norm = (a) => mul(a, 1 / (len(a) || 1)), lerp = (a, b, k) => a.map((v, i) => v + (b[i] - v) * k);
    const norm4 = (q) => { const l = Math.hypot(...q); return q.map((x) => x / l); };
    const nlerp = (a, b, k) => {
        const sg = a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3] < 0 ? -1 : 1;
        return norm4(a.map((x, i) => x * (1 - k) + b[i] * sg * k));
    };
    // unit vectors: the great-circle blend
    const slerpV = (a, b, k) => {
        const c = Math.max(-1, Math.min(1, dot(a, b))), w = Math.acos(c);
        if (w < 1e-4) return norm(lerp(a, b, k));
        const s = Math.sin(w);
        return norm(add(mul(a, Math.sin((1 - k) * w) / s), mul(b, Math.sin(k * w) / s)));
    };
    const X90 = Engrave.quat([1, 0, 0], Math.PI / 2);          // a ring's axis (y) onto +z
    const flip = Engrave.quat([0, 1, 0], Math.PI);             // the same opening, walked the other way
    const F = Engrave.frameQ;

    // ---- 1 · the heart of the pyramid → the gallery ----
    // As the camera leans into the V gap, the middle ring of the machine leaves the axis, rises
    // and turns to stand across the camera's way: a gate. Through it the gallery is already
    // there; its entrance ring is the same ring on the other side.
    const GATE = { c: [0.34, 0.56, 0.4], d: norm([-1, -0.2, -1.12]) };
    const qGate = Engrave.qmul(F(GATE.d), X90);
    // the gate ring at t: from its place on the machine (still turning) to the gate
    function gate(t, e = 1) {
        const r0 = Pyramid.ringPose(t, 1, e), k = E(t, 15.5, 16.5);
        return { c: lerp(r0.c, GATE.c, k), rad: r0.rad, q: nlerp(r0.q, qGate, k) };
    }
    // ---- 5, 6 · the nursery's sphere ⇄ the seed's sky: its centre is the sky's origin ----
    const sphereOut = (u, sgn) => ({ c: add(Seed.centre(u), mul(Seed.D, Nursery.R)), q: F(mul(Seed.D, sgn)), s: Nursery.R });
    const sphereIn = (sgn) => ({ c: Seed.P0, q: F(mul(Seed.D, sgn)), s: Nursery.R * Seed.K });
    // ---- 8 · the seed outside, up the pyramid and into the star: its sky still inside ----
    const seedAt = (u) => (u < Star.T0 ? Apex.seedAt(u) : Star.at(u));
    const seedR = (u) => (u < Star.T0 ? Apex.SEED_R : Star.radius(u));
    const LIST = [
        {
            A: 'out', B: 'gal', ux: 17.3, wa: 1.8, wb: 0.6, live: [15.4, 18.3], shape: 'disc',
            oA: (u) => { const g = gate(u); return { c: g.c, q: Engrave.qmul(g.q, Engrave.qconj(X90)), s: g.rad }; },
            oB: () => ({ c: [0, 0.85, 1.9], q: F([0, 0, -1]), s: 0.82 }),
        },
        // 2 · the gallery's exit ring is the shaft's floor ring: the gallery's forward is the
        // shaft's up (gravity turns: the theme of PIR-05)
        {
            A: 'gal', B: 'shaft', ux: 24.1, wa: 0.6, wb: 0.6, live: [17.3, 25.0], shape: 'disc',
            oA: () => ({ c: Gallery.EXIT, q: F([0, 0, -1]), s: Gallery.EXIT_R }),
            oB: () => ({ c: Shaft.RING, q: F([0, 1, 0], [0, 0, 1]), s: Shaft.RING_R }),
        },
        // 3 · the shaft's tunnel ends in a membrane (a blue triangle); beyond it, the resonance
        // chamber, whose «up» is the shaft's +x: the camera has rolled 90° to meet it
        {
            A: 'shaft', B: 'reso', ux: 31.0, wa: 0.6, wb: 0.6, live: [24.5, 31.8], shape: 'rect', rect: [2, 2],
            oA: () => ({ c: [0, Shaft.TY, Shaft.ZP], q: F([0, 0, -1], [1, 0, 0]), s: Shaft.TUN }),
            oB: () => ({ c: [0, 0.78, 2.2], q: F([0, 0, -1], [0, 1, 0]), s: Shaft.TUN }),
        },
        // 4 · the middle room's side doorway opens into the nursery's +z wall, over a channel
        {
            A: 'reso', B: 'nurse', ux: 38.6, wa: 1.7, wb: 1.4, live: [33.5, 40.3], shape: 'rect', rect: [Resonance.DOOR.w / 1.6, 2],
            oA: () => ({ c: Resonance.DOOR.c, q: F([-1, 0, 0]), s: 1.6 }),
            oB: () => ({ c: Nursery.DOOR.c, q: F([0, 0, -1]), s: 1.6 }),
        },
        // 5 · into the sphere: its skin is the sky's edge (a dark sky grows inside the leaves
        // from the first light)
        {
            A: 'nurse', B: 'seed', ux: Seed.IN, wa: 1.9, wb: 0.6, live: [40.9, 52.9], shape: 'sphere', oneWay: true,
            sphere: (u) => [Seed.centre(u), Nursery.R * 0.95 * E(u, 40.9, 42.6)],
            oA: (u) => sphereOut(u, -1), oB: () => sphereIn(-1),
        },
        // 6 · and back out, backwards, looking in (the sphere is then seen through junction 5)
        { A: 'seed', B: 'nurse', ux: Seed.OUT, wa: 0.9, wb: 0.6, noView: true, oA: () => sphereIn(1), oB: (u) => sphereOut(u, 1) },
        // 7 · the sphere rises into the ceiling's shaft; the shaft opens onto the heart of the
        // pyramid, just above its rings, and the seed (the same sphere, K7 smaller) climbs on
        {
            A: 'nurse', B: 'out', ux: 52.6, wa: 1.2, wb: 0.7, live: [50.6, 53.5], shape: 'rect', rect: [2, 2],
            oA: () => ({ c: [0, Nursery.HH + 0.1, 0], q: F([0, 1, 0], [0, 0, 1]), s: Nursery.SH }),
            oB: () => ({ c: [0, Apex.Y0, 0], q: F([0, 1, 0], [0.6, 0, 0.8]), s: Nursery.SH * Apex.K7 }),
        },
        {
            A: 'out', B: 'seed', noCross: true, live: [51.0, 58.4], shape: 'sphere', oneWay: true,
            sphere: (u) => [seedAt(u), seedR(u) * 0.95],
            oA: (u) => ({ c: add(seedAt(u), mul(Seed.D, seedR(u))), q: F(mul(Seed.D, -1)), s: seedR(u) }), oB: () => sphereIn(-1),
        },
    ];
    // the exterior's own gate: the machine's middle ring, taken over while it is a gate
    const pyramidRing = (t) => (i, r) => (i === 1 && t > 15.5 && t < 18.5 ? { ...gate(t), rad: r.rad } : r);

    // the map through a junction at u, from its A side (or from its B side, walked back)
    function portalOf(J, u, fromB = false) {
        const a = J.oA(u), b = J.oB(u);
        if (!fromB) return Engrave.portal(a, b);
        return Engrave.portal({ ...b, q: Engrave.qmul(b.q, flip) }, { ...a, q: Engrave.qmul(a.q, flip) });
    }
    // what leads through a doorway comes out turned by the doorway's turn
    const turn = (i) => portalOf(LIST[i], LIST[i].ux).r;
    Shaft.setIn(turn(1));
    Resonance.setIn(turn(2));

    // where the camera is at u: { space, cam, target, up, fov }; camIn(space, u) is each
    // space's own camera
    function where(u, camIn) {
        let last = LIST[0];
        for (const J of LIST) {
            if (J.noCross) continue;
            last = J;
            if (u < J.ux - J.wa) return { space: J.A, ...camIn(J.A, u) };
            if (u < J.ux + J.wb) return bridge(J, u, camIn);
        }
        return { space: last.B, ...camIn(last.B, u) };
    }
    // a cubic Bézier and its arc length table
    const bez = (p0, p1, p2, p3, k) => { const m = 1 - k; return p0.map((_, i) => m * m * m * p0[i] + 3 * m * m * k * p1[i] + 3 * m * k * k * p2[i] + k * k * k * p3[i]); };
    function arc(p0, p1, p2, p3, n = 120) {
        const P = [p0], S = [0];
        for (let i = 1; i <= n; i++) { const q = bez(p0, p1, p2, p3, i / n); S.push(S[i - 1] + len(sub(q, P[i - 1]))); P.push(q); }
        const at = (s) => {
            let i = 1;
            while (i < n && S[i] < s) i++;
            return lerp(P[i - 1], P[i], Math.max(0, Math.min(1, (s - S[i - 1]) / (S[i] - S[i - 1] || 1))));
        };
        return { L: S[n], at };
    }
    // the camera across a junction, worked out in A's coordinates. Its path: from A's own
    // camera at ux − wa to B's own (mapped back) at ux + wb along two Béziers joined at the
    // opening's centre, tangent to the way through there and to each side's own motion at
    // its end (G1: no corner). Its speed along that path goes from A's to B's without a jolt
    // (a smooth ramp plus a bump that makes the distance come out right). It is in B once it
    // has crossed the opening. Its view: A's own camera's direction, up and lens, blended into
    // B's over the bridge (each still moving as its own).
    const BR = new Map();
    function bridgeGeom(J, camIn) {
        if (BR.has(J)) return BR.get(J);
        const t0 = J.ux - J.wa, t1 = J.ux + J.wb, T = t1 - t0, eps = 1 / 48;
        const P = portalOf(J, J.ux), o = J.oA(J.ux), z = Engrave.qrot(o.q, [0, 0, 1]);
        const back = (c) => P.ip(c.cam);
        const a0 = camIn(J.A, t0).cam, aM = camIn(J.A, t0 - eps).cam;
        const b1 = back(camIn(J.B, t1)), bP = back(camIn(J.B, t1 + eps));
        const vA = mul(sub(a0, aM), 1 / eps), vB = mul(sub(bP, b1), 1 / eps);
        const l1 = len(sub(o.c, a0)), l2 = len(sub(b1, o.c));
        const dA = len(vA) > 1e-4 ? norm(vA) : norm(sub(o.c, a0)), dB = len(vB) > 1e-4 ? norm(vB) : norm(sub(b1, o.c));
        const s1 = arc(a0, add(a0, mul(dA, l1 / 3)), sub(o.c, mul(z, l1 / 3)), o.c);
        const s2 = arc(o.c, add(o.c, mul(z, l2 / 3)), sub(b1, mul(dB, l2 / 3)), b1);
        const L = s1.L + s2.L, N = 240, va = len(vA), vb = len(vB);
        // (a floor keeps it moving in the middle; it vanishes at the ends, so both ends keep
        // their own speed exactly)
        const c = L / T - (va + vb) / 2, vMin = 0.08 * L / T;
        const S = [0];
        let vLow = Infinity;
        for (let i = 1; i <= N; i++) {
            const k = (i - 0.5) / N, v = Math.max(vMin * 4 * k * (1 - k), va + (vb - va) * (3 * k * k - 2 * k ** 3) + c * 30 * k * k * (1 - k) ** 2);
            vLow = Math.min(vLow, v);
            S.push(S[i - 1] + (v * T) / N);
        }
        const scale = L / S[N];
        const g = { t0, T, P, s1, s2, stats: { L, T, va, vb, c, vLow, scale }, sAt: (u) => { const x = Math.max(0, Math.min(1, (u - t0) / T)) * N, i = Math.min(N - 1, Math.floor(x)); return (S[i] + (S[i + 1] - S[i]) * (x - i)) * scale; } };
        BR.set(J, g);
        return g;
    }
    function bridge(J, u, camIn) {
        const g = bridgeGeom(J, camIn), P = g.P, s = g.sAt(u);
        const cam = s < g.s1.L ? g.s1.at(s) : g.s2.at(s - g.s1.L);
        const aU = camIn(J.A, u), bB = camIn(J.B, u);
        const bU = { cam: P.ip(bB.cam), target: P.ip(bB.target), up: P.id(bB.up ?? [0, 1, 0]), fov: bB.fov };
        const k = Ease.inOut((u - g.t0) / g.T);
        const f = slerpV(norm(sub(aU.target, aU.cam)), norm(sub(bU.target, bU.cam)), k);
        let up = slerpV(norm(aU.up ?? [0, 1, 0]), norm(bU.up), k);
        const fov = aU.fov + (bU.fov - aU.fov) * k;
        const target = add(cam, f);
        if (s < g.s1.L) return { space: J.A, cam, target, up, fov };
        return { space: J.B, cam: P.p(cam), target: P.p(target), up: P.d(up), fov };
    }

    // the portals open in a space at u: [{ id, J, H, to, P, clip }] (P maps this space → the
    // other; H is the hole: { c, r } for a sphere, else the opening's frame)
    function from(space, u) {
        const out = [];
        LIST.forEach((J, i) => {
            if (J.noView || u < J.live[0] || u > J.live[1]) return;
            if (J.A === space) {
                const P = portalOf(J, u);
                if (J.shape === 'sphere') {
                    const [c, r] = J.sphere(u);
                    if (r > 1e-3) out.push({ id: i + 'a', J, H: { c, r, sphere: true }, to: J.B, P, clip: null });
                } else out.push({ id: i + 'a', J, H: J.oA(u), to: J.B, P, clip: P.clip });
            }
            if (J.B === space && !J.oneWay) {
                const P = portalOf(J, u, true), o = J.oB(u);
                out.push({ id: i + 'b', J, H: { ...o, q: Engrave.qmul(o.q, flip) }, to: J.A, P, clip: P.clip });
            }
        });
        return out;
    }
    // the opening itself, printed as a hole in its own space's layer (material 7)
    function hole(po) {
        const { H, J } = po, arr = [];
        if (H.sphere) { Engrave.inst(arr, H.c, 7, [H.r, H.r, H.r], 0.5); return { mesh: 'sphere', inst: new Float32Array(arr), cast: false }; }
        if (J.shape === 'rect') {
            const [w, h] = J.rect;
            Engrave.inst(arr, H.c, 7, [(w / 2) * H.s, (h / 2) * H.s, 0.0005 * H.s], 0.5, H.q);
            return { mesh: 'box', inst: new Float32Array(arr), box: true, cast: false };
        }
        // a disc filling the ring up to under its tube (the ring mesh: tube 0.085 of its radius)
        Engrave.inst(arr, H.c, 7, [0.94 * H.s, 0.0005 * H.s, 0.94 * H.s], 0.5, Engrave.qmul(H.q, X90));
        return { mesh: 'cylinder', inst: new Float32Array(arr), cast: false };
    }
    // is the hole (a ball round its centre) in the camera's view, and facing it?
    function inView(po, c) {
        const H = po.H, R = H.sphere ? H.r : H.s * 1.5 * Math.max(1, ...(po.J.rect ?? [1]));
        const f = norm(sub(c.target, c.cam)), v = sub(H.c, c.cam), zf = dot(v, f);
        if (zf < -R) return false;
        if (!H.sphere && dot(sub(c.cam, H.c), Engrave.qrot(H.q, [0, 0, 1])) > 0) return false;   // seen from behind: not a way through
        const lat = len(sub(v, mul(f, zf))), tanD = Math.tan(c.fov / 2) * 2.05;
        return lat < Math.max(zf, 0) * tanD + R * 1.3;
    }
    const stats = (camIn) => LIST.filter((J) => !J.noCross).map((J) => ({ ux: J.ux, A: J.A, B: J.B, ...bridgeGeom(J, camIn).stats }));
    return { LIST, GATE, where, from, hole, inView, gate, pyramidRing, stats };
})();
