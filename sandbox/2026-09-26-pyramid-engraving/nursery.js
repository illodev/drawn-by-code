// PIR-07 (script 38–45 s): «The nursery». A hall much larger than anything before: a ring of
// Hathor columns round a stepped obsidian plinth; on it, a gold cradle of three prongs holds a
// dark volume. Structures of matter arrive along four blue channels, one by one, and each
// breaks into thin obsidian leaves that the three rings sweep round and lay on the volume:
// they close into a sphere with a black, faintly iridescent skin (leaves with gaps between
// them, so what happens inside can be seen). At 41 s a tiny light wakes inside; points
// multiply and wind into a spiral current. At 44 s the prongs open and the sphere lifts off
// its cradle. The camera orbits slowly, about 35°, far enough to see the channels, the rings
// and the sphere at once (the sphere never more than half the frame's height).
const Nursery = (() => {
    const E = (u, a, b) => Ease.inOut(Ease.seg(u, a, b));
    const HW = 7, HH = 9, C = [0, 3.1, 0], R = 0.85;
    const add = (a, b) => a.map((v, i) => v + b[i]);
    const mul = (a, k) => a.map((v) => v * k);
    const lerp3 = (a, b, k) => a.map((v, i) => v + (b[i] - v) * k);
    const norm = (a) => mul(a, 1 / Math.hypot(...a));
    const qTo = (d) => {
        const n = norm(d), c = n[1], ax = [n[2], 0, -n[0]], s = Math.hypot(ax[0], ax[2]);
        if (s < 1e-6) return c > 0 ? [0, 0, 0, 1] : [1, 0, 0, 0];
        return Engrave.quat(ax, Math.atan2(s, c));
    };
    // the skin: leaves on a Fibonacci sphere, each assigned to one of the four structures
    const N = 190, LEAVES = [];
    for (let i = 0; i < N; i++) {
        const y = 1 - (2 * (i + 0.5)) / N, r = Math.sqrt(1 - y * y), a = i * 2.39996;
        LEAVES.push({ n: [Math.cos(a) * r, y, Math.sin(a) * r], src: i % 4, k: (i * 0.618) % 1 });
    }
    const CH = [[1, 0, 0], [0, 0, 1], [-1, 0, 0], [0, 0, -1]].map((d, i) => ({ d, t0: 38.3 + i * 0.45 }));
    // where structure i is: along its channel from the wall to the plinth, rising to the ring
    const structAt = (i, u) => {
        const c = CH[i], k = E(u, c.t0, c.t0 + 1.5);
        const far = add(mul(c.d, HW - 0.6), [0, 0.2, 0]), near = add(mul(c.d, 1.9), [0, 2.4, 0]);
        return lerp3(far, near, k).map((v, j) => v + (j === 1 ? 0.5 * Math.sin(Math.PI * k) : 0));
    };
    const burst = (i) => CH[i].t0 + 1.55;
    function build(u, rise = 0) {
        const stone = [], worn = [], obs = [], blue = [], rings = [], gold = [], dust = [], motes = [], cols = [], hathor = [], caps = [], leaves = [], sparks = [];
        // the hall
        Engrave.inst(worn, [0, -0.1, 0], 1, [HW, 0.1, HW], 0.21);
        Engrave.inst(stone, [0, HH + 0.1, 0], 1, [HW, 0.1, HW], 0.31);
        for (const [x, z, hx, hz] of [[HW + 0.1, 0, 0.1, HW], [-HW - 0.1, 0, 0.1, HW], [0, HW + 0.1, HW, 0.1], [0, -HW - 0.1, HW, 0.1]])
            Engrave.inst(stone, [x, HH / 2, z], 0, [hx, HH / 2, hz], 0.4 + x * 0.01 + z * 0.02);
        // a ring of twelve Hathor columns
        for (let i = 0; i < 12; i++) {
            const a = (i / 12) * Math.PI * 2 + Math.PI / 12, x = Math.cos(a) * 4.8, z = Math.sin(a) * 4.8, rC = 0.42;
            Engrave.inst(cols, [x, HH * 0.39, z], 0, [rC, HH * 0.39, rC], 0.2 + i * 0.05);
            Engrave.inst(stone, [x, 0.08, z], 1, [rC * 1.3, 0.08, rC * 1.3], 0.31);
            Engrave.inst(caps, [x, HH * 0.79, z], 0, [rC * 1.12, HH * 0.02, rC * 1.12], 0.4);
            Engrave.inst(hathor, [x, HH * 0.87, z], 0, [rC * 1.25, HH * 0.065, rC * 1.25], 0.45 + i * 0.03);
            Engrave.inst(stone, [x, HH * 0.945, z], 0, [rC * 1.3, HH * 0.01, rC * 1.3], 0.5);
        }
        // the plinth: steps of obsidian with gold edges; the channels run to it
        for (let i = 0; i < 4; i++) {
            const hw = 1.7 - i * 0.3, y = 0.15 + i * 0.3;
            Engrave.inst(obs, [0, y, 0], 2, [hw, 0.15, hw], 0.3 + i * 0.1);
            for (const [dx, dz, lx, lz] of [[1, 0, 0.012, hw], [-1, 0, 0.012, hw], [0, 1, hw, 0.012], [0, -1, hw, 0.012]])
                Engrave.inst(gold, [dx * (hw + 0.012), y + 0.14, dz * (hw + 0.012)], 3, [lx, 0.012, lz], 0.4);
        }
        for (let i = 0; i < 4; i++) {
            const d = CH[i].d, mid = mul(d, (HW + 1.7) / 2), half = (HW - 1.7) / 2;
            const hx = d[0] !== 0 ? half : 0.03, hz = d[2] !== 0 ? half : 0.03;
            Engrave.inst(obs, [mid[0], 0.005, mid[2]], 2, [hx + 0.02, 0.006, hz + 0.02], 0.3);
            Engrave.inst(blue, [mid[0], 0.013, mid[2]], 4, [d[0] !== 0 ? half : 0.012, 0.004, d[2] !== 0 ? half : 0.012], 0.5, [0, 0, 0, 1], 0.55);
            // the pulse running in as the structure travels
            const k = Ease.seg(u, CH[i].t0, CH[i].t0 + 1.5);
            if (k > 0 && k < 1) Engrave.inst(blue, [d[0] * (HW - k * (HW - 1.7)), 0.02, d[2] * (HW - k * (HW - 1.7))], 4, [0.08, 0.008, 0.08], 0.6, [0, 0, 0, 1], 0.9);
        }
        // the cradle: three gold prongs from the plinth's top, opening at 44 s
        const open = E(u, 43.8, 44.6), lift = E(u, 44.0, 45.0);
        for (let i = 0; i < 3; i++) {
            const a = (i / 3) * Math.PI * 2 + 0.4, out = [Math.cos(a), 0, Math.sin(a)];
            const base = add(mul(out, 0.45), [0, 1.2, 0]), tip = add(mul(out, 0.62 + 0.55 * open), [0, 2.55 - 0.35 * open, 0]);
            const mid = lerp3(base, tip, 0.5), d = tip.map((v, j) => v - base[j]);
            Engrave.inst(gold, mid, 3, [0.05, Math.hypot(...d) / 2, 0.05], 0.5 + i * 0.1, qTo(d));
        }
        // the three rings: turning round the growing sphere, sweeping the leaves in
        const c = [C[0], C[1] + 0.45 * lift + rise, C[2]];
        [[1.55, [1, 0.2, 0.3], 0.5], [1.32, [0.2, 1, 0.5], -0.7], [1.1, [0.4, 0.3, 1], 0.9]].forEach(([r, ax, sp], i) => {
            const q = Engrave.qmul(Engrave.quat(ax, u * sp + i * 1.7), Engrave.quat([1, 0, 0], Math.PI / 2));
            Engrave.inst(rings, c, 3, [r, r, r], 0.3 + i * 0.2, q);
        });
        // the structures arrive (grains, as they were made), and break at the plinth
        const r = Motion.rng('nursery-structures');
        for (let i = 0; i < 4; i++) {
            if (u < CH[i].t0 || u > burst(i)) continue;
            Shaft.structure(structAt(i, u), u + i, dust, blue);
        }
        // the leaves: from the structure's burst point, swept round the sphere to their places
        for (const L of LEAVES) {
            const t0 = burst(L.src) + L.k * 1.2, k = E(u, t0, t0 + 0.9);
            if (u < burst(L.src)) continue;
            const from = structAt(L.src, burst(L.src)), to = add(c, mul(L.n, R));
            const swirl = (1 - k) * 1.6, p = lerp3(from, to, k);
            const rad = [p[0] - c[0], p[2] - c[2]], ang = swirl;
            const pr = [c[0] + rad[0] * Math.cos(ang) - rad[1] * Math.sin(ang), p[1] + 0.4 * Math.sin(Math.PI * k), c[2] + rad[0] * Math.sin(ang) + rad[1] * Math.cos(ang)];
            // flat leaves tangent to the sphere (thin along n), a little apart so the inside shows
            Engrave.inst(leaves, pr, 2, [0.062, 0.006, 0.062], 0.3 + L.k * 0.5, qTo(L.n), 0.0);
        }
        // the light inside: one point at 41, then many, winding into a spiral current
        const wake = E(u, 40.9, 41.3), many = Ease.seg(u, 41.3, 44.2);
        if (wake > 0) {
            Engrave.inst(sparks, c, 4, [0.035 * wake, 0.035 * wake, 0.035 * wake], 0.5, [0, 0, 0, 1], 1);
            const rs = Motion.rng('nursery-sparks'), n = Math.floor(200 * many);
            for (let i = 0; i < n; i++) {
                // a spiral galaxy: two arms winding out from the first light
            const arm = rs() < 0.5 ? 0 : Math.PI, rr = 0.06 + 0.66 * Math.pow(rs(), 0.8), a0 = arm + rr * 5.5 + (rs() - 0.5) * 0.5, h = (rs() - 0.5) * 0.18 * (1 - rr);
                const a = a0 + u * 0.9, sz = 0.008 + rs() * 0.014;
                Engrave.inst(sparks, [c[0] + Math.cos(a) * rr, c[1] + h + Math.sin(a) * rr * 0.55, c[2] + Math.sin(a) * rr * 0.83], 4, [sz, sz, sz], rs(), [0, 0, 0, 1], 1);
            }
        }
        // dust on the plinth's steps and motes in the high light
        const rm = Motion.rng('nursery-motes');
        for (let i = 0; i < 900; i++) {
            const x = (rm() - 0.5) * 6, z = (rm() - 0.5) * 6, y = (rm() * HH + u * 0.04) % HH, sz = 0.003 + rm() * 0.004;
            Engrave.inst(motes, [x, y, z], 5, [sz, sz, sz], rm(), [0, 0, 0, 1], 0, -1);
        }
        const draws = [
            { mesh: 'box', inst: new Float32Array(stone), box: true, masonry: true },
            { mesh: 'box', inst: new Float32Array(worn), box: true, masonry: true },
            { mesh: 'cylinder', inst: new Float32Array(cols), tan: 'y' },
            { mesh: 'capital', inst: new Float32Array(caps), tan: 'y', hathor: true },
            { mesh: 'box', inst: new Float32Array(hathor), box: true, hathor: true },
            { mesh: 'box', inst: new Float32Array(obs), box: true },
            { mesh: 'box', inst: new Float32Array(gold), box: true },
            { mesh: 'box', inst: new Float32Array(blue), box: true, cast: false },
            { mesh: 'thin-ring', inst: new Float32Array(rings) },
            { mesh: 'box', inst: new Float32Array(leaves), box: true },
            { mesh: 'sphere', inst: new Float32Array(sparks), cast: false },
            { mesh: 'sphere', inst: new Float32Array(dust), cast: false },
            { mesh: 'sphere', inst: new Float32Array(motes), cast: false },
        ];
        const glow = 0.2 + 1.4 * wake * (0.3 + 0.7 * many);
        const lights = [[c[0], c[1], c[2], 0, glow], [0, 0.3, 0, 0, 0.35], ...CH.map((ch) => [ch.d[0] * 4, 0.2, ch.d[2] * 4, 0, 0.2])];
        return { draws, lights, centre: c };
    }
    // a slow orbit of about 35°, a little below the sphere's height
    function camera(u) {
        // (inside the ring of columns, so none passes in front of the lens)
        const k = E(u, 38, 45), a = 1.2 + 0.61 * k, rad = 4.3 - 0.2 * k;
        const cam = [Math.cos(a) * rad, 2.0 + 0.5 * k, Math.sin(a) * rad];
        return { cam, target: [0, 2.6 + 0.4 * k, 0], up: [0, 1, 0], fov: 0.95 };
    }
    const frameParams = {
        sun: [0.15, 1, 0.2], sunK: 1.3, fill: 0.4, interior: true,
        shadow: { center: [0, 2.5, 0], radius: 7.5 },
        sky: { zenith: 0.9, horizon: 0.9, dusk: 0 },
        fog: [8, 40], course: 0.26,
    };
    return { build, camera, frameParams, T0: 38, T1: 45 };
})();
