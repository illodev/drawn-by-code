// PIR-08 (script 45–52 s): «A sky inside another». The camera closes on the sphere (45–46.2)
// and passes through its skin into its sky: a vast spiral of stars, drawn as the plates draw a
// night sky (bare-paper points on a rubbed dark ground). The landmark by the way in: two close
// stars and a slightly lopsided spiral. The camera flies to one cluster; in its heart a small
// blue triangle holds a tiny machine, three turning rings round a point: one repetition, no
// more. At 49 it backs out the same way, past the two stars, and out through the skin
// (50.7); outside, the sphere, complete, rises towards the shaft in the ceiling.
const Seed = (() => {
    const E = (u, a, b) => Ease.inOut(Ease.seg(u, a, b));
    const IN = 46.2, OUT = 50.7;
    // the galaxy: two arms, a bulge, dust lanes; fixed per seed; its plane tilted
    const GAL = (() => {
        const r = Motion.rng('seed-galaxy'), S = [];
        for (let i = 0; i < 14000; i++) {
            const k = r(), arm = r() < 0.5 ? 0 : Math.PI;
            let x, y, z, s;
            if (k < 0.18) {        // bulge
                const rr = Math.pow(r(), 2) * 1.6, a = r() * 6.283, b = (r() - 0.5) * 3.14;
                x = Math.cos(a) * Math.cos(b) * rr; y = Math.sin(b) * rr * 0.6; z = Math.sin(a) * Math.cos(b) * rr; s = 0.006 + r() * 0.012;
            } else {               // arms, the second a little wider (lopsided)
                const rr = 1.2 + Math.pow(r(), 0.7) * 9, a = arm + rr * 0.55 * (arm ? 1.12 : 1) + (r() - 0.5) * (0.35 + rr * 0.03);
                // (a haze of faint stars between the arms, so they read as a disc, not two dotted lines)
                const loose = r() < 0.35 ? (r() - 0.5) * 2.2 : 0;
                x = Math.cos(a + loose) * rr; z = Math.sin(a + loose) * rr; y = (r() - 0.5) * 0.25 * (1 + rr * 0.05); s = 0.005 + Math.pow(r(), 6) * 0.05;
            }
            S.push([x, y, z, s]);
        }
        return S;
    })();
    const TILT = Engrave.quat([1, 0, 0.3], 0.5);
    const qrot = (q, v) => {
        const [x, y, z, w] = q, c1 = [y * v[2] - z * v[1] + w * v[0], z * v[0] - x * v[2] + w * v[1], x * v[1] - y * v[0] + w * v[2]];
        return [v[0] + 2 * (y * c1[2] - z * c1[1]), v[1] + 2 * (z * c1[0] - x * c1[2]), v[2] + 2 * (x * c1[1] - y * c1[0])];
    };
    const PAIR = [[-1.1, 3.4, 17.5], [-0.7, 3.55, 17.2]];            // the two close stars (landmark)
    const CL = qrot(TILT, [6.2, 0.05, -2.1]);                        // the chosen cluster
    const add = (a, b) => a.map((v, i) => v + b[i]), mul = (a, k) => a.map((v) => v * k);
    function inside(u) {
        const stars = [], big = [], blue = [], rings = [], haze = [];
        for (const [x, y, z, s] of GAL) Engrave.inst(s > 0.05 ? big : stars, qrot(TILT, [x, y, z]), 5, [s, s, s], 0.5, [0, 0, 0, 1], 0, -1);
        // far stars all round (the sky has no walls)
        const rf = Motion.rng('seed-far');
        for (let i = 0; i < 2500; i++) {
            const a = rf() * 6.283, b = Math.acos(2 * rf() - 1), R = 40 + rf() * 20, s = 0.03 + Math.pow(rf(), 6) * 0.12;
            Engrave.inst(stars, [R * Math.sin(b) * Math.cos(a), R * Math.cos(b), R * Math.sin(b) * Math.sin(a)], 5, [s, s, s], 0.5, [0, 0, 0, 1], 0, -1);
        }
        for (const p of PAIR) Engrave.inst(big, p, 5, [0.018, 0.018, 0.018], 0.5, [0, 0, 0, 1], 0, -1);
        // the cluster: a dense ball of stars, and at its heart the small machine
        const rc = Motion.rng('seed-cluster');
        for (let i = 0; i < 700; i++) {
            const a = rc() * 6.283, b = Math.acos(2 * rc() - 1), rr = 0.03 + Math.pow(rc(), 1.6) * 0.55, s = 0.0012 + rc() * 0.0022;
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
    // the path inside: in past the two stars, to the cluster, then back out the same way
    function pathIn(k) {
        const P0 = [-0.9, 3.6, 19], P1 = [-0.9, 3.5, 16.6], P2 = add(CL, [0.35, 0.12, 1.4]), P3 = add(CL, [0.03, 0.01, 0.2]);
        if (k < 0.35) return { cam: P0.map((v, i) => v + (P1[i] - v) * (k / 0.35)), target: [0, 0, 0] };
        if (k < 0.8) { const t = Ease.inOut((k - 0.35) / 0.45); return { cam: P1.map((v, i) => v + (P2[i] - v) * t), target: [0, 0, 0].map((v, i) => v + (CL[i] - v) * t) }; }
        const t = Ease.inOut((k - 0.8) / 0.2);
        return { cam: P2.map((v, i) => v + (P3[i] - v) * t), target: CL };
    }
    function camera(u) {
        if (u < IN) {
            const c = [0, 3.1 + 0.45, 0], k = E(u, 45, IN), from = [2.6, 3.2, 2.8], to = add(c, [0.1, 0, 0.35]);
            return { cam: from.map((v, i) => v + (to[i] - v) * k), target: c, up: [0, 1, 0], fov: 0.95 - 0.3 * k };
        }
        if (u > OUT) {
            const k = E(u, OUT, 52), c = [0, 3.55 + 3.5 * k, 0];
            return { cam: add([0, 3.55, 0], [0.4 + 2.4 * k, 0.1 - 0.9 * k, 0.9 + 2.2 * k]), target: c, up: [0, 1, 0], fov: 0.8 };
        }
        // in 46.2–48.8, hold at the machine 48.8–49.2, back out 49.2–50.7 along the same path
        const k = u < 48.8 ? (u - IN) / (48.8 - IN) : u < 49.2 ? 1 : 1 - (u - 49.2) / (OUT - 49.2);
        const p = pathIn(Math.max(0, Math.min(1, k)));
        return { cam: p.cam, target: p.target, up: [0, 1, 0], fov: 0.9 };
    }
    function build(u) {
        if (u >= IN && u <= OUT) return inside(u);
        // outside: the nursery as it is at the end, the sphere lifted; after OUT it rises
        const P = Nursery.build(Math.min(u, 44.99), u > OUT ? 3.5 * E(u, OUT, 52) : 0);
        return P;
    }
    const inSky = (u) => u >= IN && u <= OUT;
    const frameParams = (u) => inSky(u)
        ? { sun: [0, 1, 0], sunK: 0.2, fill: 0.1, interior: true, sky: { zenith: 1.2, horizon: 1.15, dusk: 0 }, fog: [60, 120], shadow: { center: [0, 0, 0], radius: 20 } }
        : Nursery.frameParams;
    // the skin: a dark flash as the camera crosses it
    const dim = (u) => Math.max(0, 1 - Math.abs(u - IN) / 0.18, 1 - Math.abs(u - OUT) / 0.18);
    return { build, camera, frameParams, dim, T0: 45, T1: 52 };
})();
