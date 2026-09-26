// PIR-04 (script 17–24 s): «What comes in begins to take shape». Inside the pyramid, the gallery
// of matter: a stone corridor between pillars; low sunlight comes in through slits in the left
// wall and lays grazing beams across the floor onto small obsidian cups; the energy runs from
// the cups along a blue channel to a patch of sand; grains rise and assemble into small hollow
// structures (a tetrahedron of grains, the triangle mark on its front face). The first one is
// incomplete: it falls apart back onto the sand. The second completes, its mark lights, and it
// drifts to a vertical ring at the end of the corridor; the camera follows at grain height.
// Units: the corridor is 2.5 wide and 2 high (its own space, not the pyramid's).
// Everything is a function of the story time u (17 … 24).
const Gallery = (() => {
    const E = (u, a, b) => Ease.inOut(Ease.seg(u, a, b));
    const GAPS = [-0.4, -1.5, -2.6];            // slits in the left wall (z)
    const SUN = [-0.9, 0.35, 0.1];              // towards the sun: low, from the left
    const SAND = [0, -5.2];                     // centre of the sand patch (x, z)
    const L = 0.12, GR = 0.0055, PER = 9;       // structure edge, grain radius, grains per edge
    const r3 = L / Math.sqrt(3);
    const V = [[r3, 0, 0], [-r3 / 2, 0, (r3 * Math.sqrt(3)) / 2], [-r3 / 2, 0, (-r3 * Math.sqrt(3)) / 2], [0, L * Math.sqrt(2 / 3), 0]];
    const EDGES = [[0, 1], [1, 2], [2, 0], [0, 3], [1, 3], [2, 3]];
    const FACE = [[0, 1], [1, 3], [3, 0]];     // the front face: the mark
    // quaternion turning +y onto direction d
    const qTo = (d) => {
        const l = Math.hypot(...d), n = d.map((v) => v / l);
        const c = n[1], ax = [n[2], 0, -n[0]], s = Math.hypot(ax[0], ax[2]);
        if (s < 1e-6) return c > 0 ? [0, 0, 0, 1] : [1, 0, 0, 0];
        return Engrave.quat(ax, Math.atan2(s, c));
    };
    const lerp3 = (a, b, k) => a.map((v, i) => v + (b[i] - v) * k);
    // the structure's grains: target offsets on the edges, floor spots on the sand
    function grains(seed, missing) {
        const r = Motion.rng(seed), G = [];
        EDGES.forEach(([a, b], e) => {
            for (let k = 0; k < PER; k++) {
                const off = lerp3(V[a], V[b], (k + 0.5) / PER);
                const fl = [SAND[0] + (r() - 0.5) * 0.7, GR, SAND[1] + (r() - 0.5) * 0.6];
                G.push({ e, off, fl, d: r(), s: r(), gone: e === missing });
            }
        });
        return G;
    }
    const A = grains('gallery-first', 4), B = grains('gallery-second', -1);
    const C0 = [SAND[0] - 0.05, 0.1, SAND[1]];
    // where the second structure is: forms at C0, drifts to the ring from 22.6
    const centre = (u) => {
        const k = E(u, 22.6, 24.2);
        return [C0[0] + 0.05 * k, C0[1] + 0.35 * k + 0.008 * Math.sin(u * 5), C0[2] - 2.1 * k];
    };
    // one grain: lift (with a small arc) from the floor to its place, hold, maybe fall
    function grainAt(g, u, c, t0, dur, tFall) {
        const target = [c[0] + g.off[0], c[1] + g.off[1], c[2] + g.off[2]];
        if (u < t0) return g.fl;
        const k = E(u, t0, t0 + dur);
        const p = lerp3(g.fl, target, k);
        p[1] += 0.05 * Math.sin(Math.PI * k);
        if (tFall !== undefined && u > tFall) {
            const s = u - tFall - g.d * 0.15;
            if (s > 0) {
                const y = target[1] - 0.5 * 1.4 * s * s;
                if (y <= GR) return [target[0] + (g.fl[0] - target[0]) * 0.3, GR, target[2] + (g.fl[2] - target[2]) * 0.3];
                return [target[0] + (g.s - 0.5) * 0.08 * s, y, target[2] + (g.d - 0.5) * 0.08 * s];
            }
        }
        // hovering grains tremble a little
        if (k >= 1) p[1] += 0.0015 * Math.sin(u * 13 + g.s * 20);
        return p;
    }
    function build(u) {
        const stone = [], worn = [], obs = [], cyl = [], blue = [], dust = [], rings = [], sand = [];
        // the room
        Engrave.inst(worn, [0, -0.05, -3.5], 1, [1.3, 0.05, 6], 0.21);
        Engrave.inst(stone, [0, 2.05, -3.5], 1, [1.3, 0.05, 6], 0.33);
        Engrave.inst(stone, [1.35, 1, -3.5], 0, [0.1, 1, 6], 0.44);
        // the left wall, with slits at mid-height
        let z = 2.5;
        for (const gz of [...GAPS, -9.5].sort((a, b) => b - a)) {
            const z1 = gz + 0.13;
            if (z > z1) Engrave.inst(stone, [-1.35, 1, (z + z1) / 2], 0, [0.1, 1, (z - z1) / 2], 0.5 + gz);
            if (gz > -9) {
                Engrave.inst(stone, [-1.35, 0.15, gz], 0, [0.1, 0.15, 0.13], 0.61);
                Engrave.inst(stone, [-1.35, 1.7, gz], 0, [0.1, 0.3, 0.13], 0.72);
            }
            z = gz - 0.13;
        }
        Engrave.inst(stone, [0, 1, -9.6], 1, [1.3, 1, 0.1], 0.8);
        // pillars
        for (let i = 0; i < 8; i++) for (const sx of [-1, 1]) Engrave.inst(stone, [sx * 0.95, 1, 0.6 - i * 1.25], 0, [0.1, 1, 0.1], 0.1 + i * 0.07 + (sx > 0 ? 0.03 : 0));
        // the sand patch, sunk into the floor
        Engrave.inst(sand, [SAND[0], 0.004, SAND[1]], 5, [0.55, 0.004, 0.45], 0.6);
        // the cups where the beams land, on low plinths, and the channel from them to the sand
        const cups = GAPS.map((gz) => [0.35, gz - 0.12]);
        for (const [cx, cz] of cups) {
            Engrave.inst(stone, [cx, 0.05, cz], 0, [0.07, 0.05, 0.07], 0.9);
            Engrave.inst(cyl, [cx, 0.115, cz], 2, [0.05, 0.015, 0.05], 0.4);
            Engrave.inst(obs, [cx + 0.1, 0.002, cz], 2, [0.1, 0.003, 0.012], 0.3);        // groove to the spine
        }
        Engrave.inst(obs, [0.45, 0.002, -2.95], 2, [0.012, 0.003, 2.3], 0.3);               // the spine
        Engrave.inst(obs, [0.22, 0.002, -5.2], 2, [0.23, 0.003, 0.012], 0.3);              // to the sand
        // the pulse: short live segments running cups → spine → sand, from 17.6, then again
        for (let n = 0; n < 3; n++) {
            const k = ((u - 17.6 - n * 1.1) / 1.4);
            if (k < 0 || k > 1) continue;
            // path: along the spine from z = -0.6 to -5.2, then across to the sand
            const zz = -0.6 - k * 4.6, xx = k < 0.92 ? 0.45 : 0.45 - (k - 0.92) / 0.08 * 0.35;
            Engrave.inst(blue, [xx, 0.004, k < 0.92 ? zz : -5.2], 4, [0.01, 0.003, 0.06], 0.5, [0, 0, 0, 1], 0.7);
        }
        // the rings: the entrance (passed at the start) and the exit at the end of the corridor
        const up = Engrave.quat([1, 0, 0], Math.PI / 2);
        Engrave.inst(rings, [0, 0.85, 1.9], 3, [0.82, 0.82, 0.82], 0.4, up);
        Engrave.inst(rings, [0.05, 0.5, -7.6], 3, [0.42, 0.42, 0.42], 0.6, up);
        // the structures. First: a lone grain (18.6), then a group, assembled by 20.2 with one
        // edge missing, it trembles and falls (20.6)
        A.forEach((g, i) => {
            if (g.gone) { Engrave.inst(dust, g.fl, 5, [GR, GR, GR], g.s, [0, 0, 0, 1], 0, 0.75); return; }
            const t0 = i === 0 ? 18.6 : 19.1 + g.d * 0.5;
            const shake = u > 20.25 && u < 20.6 ? 0.004 * Math.sin(u * 60 + i) : 0;
            const p = grainAt(g, u, [C0[0] + shake, C0[1], C0[2]], t0, 0.8, 20.6);
            Engrave.inst(dust, p, 5, [GR, GR, GR], g.s, [0, 0, 0, 1], 0, 0.75);
        });
        // Second: complete by 22.2; its mark lights; it drifts to the exit ring
        const c = centre(u);
        B.forEach((g) => {
            const p = grainAt(g, u, c, 21.0 + g.d * 0.8, 0.8);
            Engrave.inst(dust, p, 5, [GR, GR, GR], g.s, [0, 0, 0, 1], 0, 0.75);
        });
        const mark = E(u, 22.1, 22.4);
        if (mark > 0) for (const [a, b] of FACE) {
            const pa = V[a].map((v, i) => v + c[i]), pb = V[b].map((v, i) => v + c[i]);
            const d = pb.map((v, i) => v - pa[i]);
            Engrave.inst(blue, lerp3(pa, pb, 0.5), 4, [0.0022, (Math.hypot(...d) / 2) * mark, 0.0022], 0.5, qTo(d), 0.8);
        }
        const draws = [
            { mesh: 'box', inst: new Float32Array(stone), box: true, masonry: true },
            { mesh: 'box', inst: new Float32Array(worn), box: true },
            { mesh: 'box', inst: new Float32Array(obs), box: true },
            { mesh: 'box', inst: new Float32Array(sand), box: true },
            { mesh: 'cylinder', inst: new Float32Array(cyl), tan: 'y' },
            { mesh: 'box', inst: new Float32Array(blue), box: true, cast: false },
            { mesh: 'ring', inst: new Float32Array(rings) },
            { mesh: 'sphere', inst: new Float32Array(dust), cast: false },
        ];
        const lights = [[c[0], c[1] + 0.05, c[2], 0, 0.25 * mark], [0.45, 0.05, -3, 0, 0.12]];
        return { draws, lights, centre: c };
    }
    // the camera: [u, cam, target, [fov]]
    const KEYS = [
        [17.0, [0, 0.75, 3.1], [0, 0.55, -2], [0.8]],
        [17.9, [0.05, 0.5, 1.3], [0.15, 0.2, -2.5], [0.8]],
        [19.0, [-0.25, 0.22, -3.1], [0, 0.07, -5.2], [0.72]],
        [20.8, [-0.4, 0.15, -4.25], [-0.03, 0.08, -5.2], [0.62]],
        [22.4, [-0.35, 0.14, -4.45], [0, 0.1, -5.3], [0.62]],
        [24.0, [-0.2, 0.26, -5.9], [0.05, 0.45, -7.4], [0.66]],
    ];
    const frameParams = {
        sun: SUN, sunK: 3.0, fill: 0.5,
        shadow: { center: [0, 1, -3.5], radius: 6.5 },
        sky: { zenith: 0.9, horizon: 0.9, dusk: 0 },
        fog: [9, 30], course: 0.075,
    };
    return { build, KEYS, frameParams, T0: 17, T1: 24 };
})();
