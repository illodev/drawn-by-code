// PIR-08 (script 45–52 s): «A sky inside another». The sphere made in the nursery holds a sky
// of its own: the seed's space, seen through its skin from the moment the first light wakes
// (40.9) and flown into without a cut (junctions.js: the sphere is a portal, its centre this
// space's origin, 1 : K). Inside, a vast spiral of stars, drawn as the plates draw a night sky
// (bare-paper points on a rubbed dark ground), forms from the first light (41–45): the bulge
// first, then the arms winding into place. The landmark by the way in: two close stars and a
// slightly lopsided spiral. The camera flies to one cluster; in its heart a small blue triangle
// holds a tiny machine, three turning rings round a point: one repetition, no more. At 49.2 it
// backs out the same way, past the two stars, and out through the skin (OUT); outside, the
// sphere, complete, rises into the shaft in the nursery's ceiling (and on up the axis of the
// pyramid: apex.js).
const Seed = (() => {
    const E = (u, a, b) => Ease.inOut(Ease.seg(u, a, b));
    const IN = 46.2, OUT = 50.5, UP = 52.2;          // into the sky, out of it, through the ceiling
    // the galaxy: two arms, a bulge, dust lanes; fixed per seed; its plane tilted. Each star
    // is born at its own time during the forming (the inner first)
    const GAL = (() => {
        const r = Motion.rng('seed-galaxy'), S = [];
        for (let i = 0; i < 14000; i++) {
            const k = r(), arm = r() < 0.5 ? 0 : Math.PI;
            let x, y, z, s, rr;
            if (k < 0.18) {        // bulge
                rr = Math.pow(r(), 2) * 1.6;
                const a = r() * 6.283, b = (r() - 0.5) * 3.14;
                x = Math.cos(a) * Math.cos(b) * rr; y = Math.sin(b) * rr * 0.6; z = Math.sin(a) * Math.cos(b) * rr; s = 0.006 + r() * 0.012;
            } else {               // arms, the second a little wider (lopsided)
                rr = 1.2 + Math.pow(r(), 0.7) * 9;
                const a = arm + rr * 0.55 * (arm ? 1.12 : 1) + (r() - 0.5) * (0.35 + rr * 0.03);
                // (a haze of faint stars between the arms, so they read as a disc, not two dotted lines)
                const loose = r() < 0.35 ? (r() - 0.5) * 2.2 : 0;
                x = Math.cos(a + loose) * rr; z = Math.sin(a + loose) * rr; y = (r() - 0.5) * 0.25 * (1 + rr * 0.05); s = 0.005 + Math.pow(r(), 6) * 0.05;
            }
            S.push([x, y, z, s, 41.3 + (rr / 10.2) * 3.2 + r() * 0.5]);
        }
        return S;
    })();
    const TILT = Engrave.quat([1, 0, 0.3], 0.5);
    const qrot = Engrave.qrot;
    const PAIR = [[-1.1, 3.4, 17.5], [-0.7, 3.55, 17.2]];            // the two close stars (landmark)
    const CL = qrot(TILT, [6.2, 0.05, -2.1]);                        // the chosen cluster
    const add = (a, b) => a.map((v, i) => v + b[i]), mul = (a, k) => a.map((v) => v * k);
    const lerp = (a, b, k) => a.map((v, i) => v + (b[i] - v) * k);
    const norm = (a) => mul(a, 1 / Math.hypot(...a));
    // the way in: P0 is where the camera enters this space, on the sphere's skin
    const P0 = [-0.9, 3.6, 19], D = norm(P0), K = Math.hypot(...P0) / Nursery.R;
    function inside(u) {
        const stars = [], big = [], blue = [], rings = [];
        // forming: stars are born inner first, and the arms wind in as they settle
        const wind = 1.4 * (1 - E(u, 41.3, 46.2)), qW = Engrave.qmul(TILT, Engrave.quat([0, 1, 0], wind));
        for (const [x, y, z, s, t0] of GAL) {
            const b = Math.min(1, Math.max(0, (u - t0) / 0.5));
            if (b <= 0) continue;
            Engrave.inst(s > 0.05 ? big : stars, qrot(qW, [x, y, z]), 5, [s * b, s * b, s * b], 0.5, [0, 0, 0, 1], 0, -1);
        }
        // the first light: a blue point at the heart, waking at 40.9, sinking into the bulge
        const wake = E(u, 40.9, 41.3) * (1 - E(u, 44.5, 45.5));
        if (wake > 0) Engrave.inst(blue, [0, 0, 0], 4, [0.8 * wake, 0.8 * wake, 0.8 * wake], 0.5, [0, 0, 0, 1], 1);
        // far stars all round (the sky has no walls), there from the start: it is a sky
        const rf = Motion.rng('seed-far');
        for (let i = 0; i < 2500; i++) {
            const a = rf() * 6.283, b = Math.acos(2 * rf() - 1), R = 40 + rf() * 20, s = 0.03 + Math.pow(rf(), 6) * 0.12;
            Engrave.inst(stars, [R * Math.sin(b) * Math.cos(a), R * Math.cos(b), R * Math.sin(b) * Math.sin(a)], 5, [s, s, s], 0.5, [0, 0, 0, 1], 0, -1);
        }
        const born = E(u, 43.5, 44.5);
        if (born > 0) for (const p of PAIR) Engrave.inst(big, p, 5, [0.018 * born, 0.018 * born, 0.018 * born], 0.5, [0, 0, 0, 1], 0, -1);
        // the cluster: a dense ball of stars, and at its heart the small machine
        const rc = Motion.rng('seed-cluster');
        if (born > 0) for (let i = 0; i < 700; i++) {
            const a = rc() * 6.283, b = Math.acos(2 * rc() - 1), rr = 0.03 + Math.pow(rc(), 1.6) * 0.55, s = (0.0012 + rc() * 0.0022) * born;
            Engrave.inst(stars, add(CL, [rr * Math.sin(b) * Math.cos(a), rr * Math.cos(b), rr * Math.sin(b) * Math.sin(a)]), 5, [s, s, s], 0.5, [0, 0, 0, 1], 0, -1);
        }
        const T = 0.06, tri = [[0, T], [-T * 0.87, -T / 2], [T * 0.87, -T / 2]];
        for (let i = 0; i < 3; i++) {
            const a = tri[i], b = tri[(i + 1) % 3], d = [b[0] - a[0], b[1] - a[1]];
            Engrave.inst(blue, add(CL, [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, 0]), 4, [0.0022, Math.hypot(...d) / 2, 0.0022], 0.5, Engrave.quat([0, 0, 1], Math.atan2(-d[0], d[1])), 0.9);
        }
        [[0.022, [1, 0.3, 0], 1.3], [0.017, [0.2, 1, 0.4], -1.7], [0.012, [0.4, 0.2, 1], 2.1]].forEach(([r, ax, sp], i) => {
            Engrave.inst(rings, add(CL, [0, -0.005, 0]), 4, [r, r, r], 0.3 + i * 0.2, Engrave.quat(ax, u * sp + i), 0.6);
        });
        Engrave.inst(blue, add(CL, [0, -0.005, 0]), 4, [0.004, 0.004, 0.004], 0.5, [0, 0, 0, 1], 1);
        const draws = [
            { mesh: 'sphere', inst: new Float32Array(stars), cast: false },
            { mesh: 'sphere', inst: new Float32Array(big), cast: false },
            { mesh: 'box', inst: new Float32Array(blue), box: true, cast: false },
            { mesh: 'thin-ring', inst: new Float32Array(rings), cast: false },
        ];
        return { draws, lights: [[CL[0], CL[1], CL[2], 0, 0.6]] };
    }
    // the path inside: in past the two stars, to the cluster, then back out the same way. One
    // smooth curve (centripetal Catmull-Rom through the four points, by arc length) run by one
    // glide each way, so the camera never halts on the way (only at the machine, on purpose)
    const PTS = [P0, [-0.9, 3.5, 16.6], add(CL, [0.35, 0.12, 1.4]), add(CL, [0.03, 0.01, 0.2])];
    const CURVE = (() => {
        const P = [add(PTS[0], sub(PTS[0], PTS[1])), ...PTS, add(PTS[3], sub(PTS[3], PTS[2]))];
        const seg = (p0, p1, p2, p3, t) => {
            const d = (a, b) => Math.pow(Math.hypot(...sub(b, a)), 0.5) || 1e-4;
            const t0 = 0, t1 = t0 + d(p0, p1), t2 = t1 + d(p1, p2), t3 = t2 + d(p2, p3), x = t1 + (t2 - t1) * t;
            const L = (a, b, ta, tb) => lerp(a, b, (x - ta) / (tb - ta));
            const A1 = L(p0, p1, t0, t1), A2 = L(p1, p2, t1, t2), A3 = L(p2, p3, t2, t3);
            return L(L(A1, A2, t0, t2), L(A2, A3, t1, t3), t1, t2);
        };
        const S = [];
        for (let i = 0; i < 3; i++) for (let j = 0; j < 200; j++) S.push(seg(P[i], P[i + 1], P[i + 2], P[i + 3], j / 200));
        S.push(PTS[3]);
        const acc = [0];
        for (let i = 1; i < S.length; i++) acc.push(acc[i - 1] + Math.hypot(...sub(S[i], S[i - 1])));
        const total = acc[acc.length - 1];
        const at = (s) => {
            const x = Math.max(0, Math.min(1, s)) * total;
            let i = 1;
            while (i < acc.length - 1 && acc[i] < x) i++;
            return lerp(S[i - 1], S[i], (x - acc[i - 1]) / (acc[i] - acc[i - 1] || 1));
        };
        const sOf = (k) => acc[k * 200] / total;              // where the k-th point is, by arc
        return { at, s1: sOf(1), s2: sOf(2), total };
    })();
    function sub(a, b) { return a.map((v, i) => v - b[i]); }
    // a glide along the curve: arc fraction over time, from speed v0 to speed v1 (fractions
    // per second), a cubic in time
    const glide = (u, t0, t1, v0, v1 = 0) => {
        const T = t1 - t0, k = Math.max(0, Math.min(1, (u - t0) / T));
        return (k ** 3 - 2 * k * k + k) * T * v0 + (-2 * k ** 3 + 3 * k * k) + (k ** 3 - k * k) * T * v1;
    };
    // the camera inside (this space's own): in from IN (it comes through the skin moving),
    // settling on the machine at 48.7; straight back out, leaving through
    // the skin at OUT still moving outwards (the bridge carries it on). It looks at the
    // galaxy's heart, turns to the cluster on the way in and back to the heart on the way out,
    // by time, gently (a fast pass by the cluster would whip the view round)
    function inCamera(u) {
        const V = 2.6 / CURVE.total, VOUT = 20 / CURVE.total;
        // (one stop at the machine, and straight back: a drift there made two stops)
        const s = u < 48.7 ? glide(u, IN, 48.7, V) : 1 - glide(u, 48.7, OUT, 0, VOUT);
        const cam = CURVE.at(s);
        const look = u < 48.7 ? E(u, 46.8, 48.5) : 1 - E(u, 48.9, 50.2);
        return { cam, target: lerp([0, 0, 0], CL, look), up: [0, 1, 0], fov: 0.9 };
    }
    // the sphere rises after OUT, faster and faster, through the ceiling's shaft at UP
    const rise = (u) => (Nursery.HH + 0.1 - Nursery.centre(45)[1]) * Ease.seg(u, OUT, UP) ** 2 + (u > UP ? 2 * (Nursery.HH + 0.1 - Nursery.centre(45)[1]) / (UP - OUT) * (u - UP) : 0);
    const centre = (u) => Nursery.centre(u, u > OUT ? rise(u) : 0);
    // the camera outside (the nursery's): from the orbit's end it closes on the sphere, to the
    // point of the skin that leads to P0; after OUT it backs away from that point, looking up at
    // the sphere as it rises
    function outCamera(u) {
        if (u < (IN + OUT) / 2) {
            const n = Nursery.camera(u), k = E(u, 44.3, IN), c = centre(u);
            return { cam: lerp(n.cam, add(c, mul(D, Nursery.R * 1.4)), k), target: lerp(n.target, c, k), up: [0, 1, 0], fov: 0.95 - 0.25 * k };
        }
        const k = E(u, OUT, UP + 0.4), c0 = centre(OUT);
        return { cam: add(c0, add(mul(D, Nursery.R * 1.4 + 2.2 * k), [0, -0.7 * k, 0])), target: centre(u), up: [0, 1, 0], fov: 0.7 + 0.2 * k };
    }
    // outside: the nursery as it is at the end (held), the sphere lifted, rising after OUT;
    // its rings run on and slow
    function outside(u) {
        const ur = u < 45 ? u : 45 + 0.6 * (1 - Math.exp(-(u - 45) / 0.6)) + 0.25 * (u - 45);
        const iris = E(u, 45.6, 46.1) * (1 - E(u, 46.5, 47.0)) + E(u, 49.9, 50.4) * (1 - E(u, 50.8, 51.3));
        return Nursery.build(Math.min(u, 44.99), u > OUT ? rise(u) : 0, ur, { d: D, k: iris });
    }
    const skyParams = { sun: [0, 1, 0], sunK: 0.2, fill: 0.1, interior: true, sky: { zenith: 1.2, horizon: 1.15, dusk: 0 }, fog: [60, 120], shadow: { center: [0, 0, 0], radius: 20 } };
    return { inside, outside, inCamera, outCamera, centre, skyParams, P0, D, K, IN, OUT, UP, T0: 45, T1: 52 };
})();
