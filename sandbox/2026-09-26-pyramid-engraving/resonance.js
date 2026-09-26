// PIR-06 (script 31–38 s): «The inside no longer fits outside». Through a triangular membrane
// into the resonance chamber: a corridor ending in a portal (two pillars, a lintel, the notched
// triangle above). Three large rings nest round the axis without touching and turn; when they
// line up (32.9) the doors of the next portal slide open and the space beyond is the same room
// three times larger; the rings of that room line up (35.0) and the third, nine times larger,
// opens, while its far wall keeps receding (the corridor that unfolds into a nave). The
// structure rides just ahead of the camera and never changes size: the space does. At 36.4
// the inner ring of the middle room tilts and shows a side opening; the camera turns to it and
// the light drops (the way to the core).
// Level k has scale S = 3^k: width 2S, height 2.5S; its portal stands at Zk. Symmetric at first,
// broken by the tilt. Near stone is drawn close; far rooms fade to silhouette and light.
const Resonance = (() => {
    const E = (u, a, b) => Ease.inOut(Ease.seg(u, a, b));
    const Z = [-4, -12, -36];
    const nlerp = (a, b, k) => {
        const sg = a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3] < 0 ? -1 : 1;
        const q = a.map((x, i) => x * (1 - k) + b[i] * sg * k), l = Math.hypot(...q);
        return q.map((x) => x / l);
    };
    const face = Engrave.quat([1, 0, 0], Math.PI / 2);     // a ring facing down the corridor
    // the far wall of the last room recedes from 33.5
    const zOf = (k, u) => (k < 2 ? Z[k] : Z[2] - 26 * E(u, 33.4, 37.6));
    function room(k, u, stone, worn, obs, blue, rings, gold, cols, caps) {
        const S = Math.pow(3, k), W = S, Hh = 2.5 * S;
        const z0 = k === 0 ? 2.2 : zOf(k - 1, u), z1 = zOf(k, u), zm = (z0 + z1) / 2, hl = (z0 - z1) / 2;
        // floor, ceiling, walls
        Engrave.inst(worn, [0, -0.1 * S, zm], 1, [W + 0.2 * S, 0.1 * S, hl], 0.2 + k * 0.1);
        Engrave.inst(stone, [0, Hh + 0.1 * S, zm], 1, [W + 0.2 * S, 0.1 * S, hl], 0.3 + k * 0.1);
        for (const sx of [-1, 1]) {
            if (k === 1 && sx < 0) {
                // the side opening (revealed by the tilt): the left wall of the middle room
                // has a doorway, lit blue from inside
                const dz = -9.8, dw = 0.9;
                const a0 = z0, a1 = dz + dw, b0 = dz - dw, b1 = z1;
                Engrave.inst(stone, [-W - 0.1 * S, Hh / 2, (a0 + a1) / 2], 0, [0.1 * S, Hh / 2, (a0 - a1) / 2], 0.51);
                Engrave.inst(stone, [-W - 0.1 * S, Hh / 2, (b0 + b1) / 2], 0, [0.1 * S, Hh / 2, (b0 - b1) / 2], 0.52);
                Engrave.inst(stone, [-W - 0.1 * S, (Hh + 3.2) / 2, dz], 0, [0.1 * S, (Hh - 3.2) / 2, dw], 0.53);
                Engrave.inst(obs, [-W - 1.6, 1.6, dz], 2, [0.05, 1.6, dw], 0.4);
                continue;
            }
            Engrave.inst(stone, [sx * (W + 0.1 * S), Hh / 2, zm], 0, [0.1 * S, Hh / 2, hl], 0.4 + k * 0.1 + sx * 0.03);
        }
        // columns along both sides (a hypostyle that grows with the room): round shafts on
        // plinths, a flared capital, an abacus, beams across to the walls
        const nCol = k === 2 ? 7 : 4, rC = 0.16 * S;
        for (let i = 0; i < nCol; i++) {
            const z = z0 - ((z0 - z1) * (i + 0.6)) / (nCol + 0.2);
            for (const sx of [-1, 1]) {
                const x = sx * (W - 0.42 * S);
                Engrave.inst(cols, [x, Hh * 0.42, z], 0, [rC, Hh * 0.42, rC], 0.2 + i * 0.07 + sx * 0.02);
                Engrave.inst(stone, [x, 0.04 * S, z], 1, [rC * 1.25, 0.04 * S, rC * 1.25], 0.31);
                Engrave.inst(caps, [x, Hh * 0.87, z], 0, [rC * 1.45, Hh * 0.05, rC * 1.45], 0.4 + i * 0.05);
                Engrave.inst(stone, [x, Hh * 0.94, z], 0, [rC * 1.2, Hh * 0.02, rC * 1.2], 0.5);
                Engrave.inst(stone, [x + sx * 0.21 * S, Hh * 0.98, z], 0, [0.24 * S, Hh * 0.02, 0.1 * S], 0.55);
            }
        }
        // a long beam down each colonnade
        for (const sx of [-1, 1]) Engrave.inst(stone, [sx * (W - 0.42 * S), Hh * 0.975, zm], 0, [0.12 * S, Hh * 0.025, hl], 0.6);
        // offering tables and a statue base on the axis of the big rooms (things to pass)
        if (k > 0) {
            Engrave.inst(stone, [0.6 * S, 0.12 * S, z1 + 0.35 * (z0 - z1)], 0, [0.14 * S, 0.12 * S, 0.1 * S], 0.72);
            Engrave.inst(stone, [-0.6 * S, 0.12 * S, z1 + 0.6 * (z0 - z1)], 0, [0.14 * S, 0.12 * S, 0.1 * S], 0.73);
        }
        // the portal at the end: a wall with a door-sized opening, two pillars, a lintel, the
        // notched triangle above in live blue, and two stone doors that slide apart
        const pw = 0.62 * S, ph = 1.9 * S, zp = z1;
        Engrave.inst(stone, [0, (Hh + ph) / 2, zp], 0, [W, (Hh - ph) / 2, 0.1 * S], 0.71);
        for (const sx of [-1, 1]) {
            Engrave.inst(stone, [sx * (W + pw) / 2, ph / 2, zp], 0, [(W - pw) / 2, ph / 2, 0.1 * S], 0.72 + sx * 0.01);
            Engrave.inst(stone, [sx * (pw + 0.1 * S), ph / 2, zp + 0.15 * S], 0, [0.1 * S, ph / 2 + 0.05 * S, 0.1 * S], 0.8);
        }
        Engrave.inst(stone, [0, ph + 0.08 * S, zp + 0.15 * S], 0, [pw + 0.25 * S, 0.08 * S, 0.12 * S], 0.85);
        const tri = [[0, 0.5], [-0.42, -0.2], [0.42, -0.2]];
        for (let i = 0; i < 3; i++) {
            const a = tri[i], b = tri[(i + 1) % 3], d = [b[0] - a[0], b[1] - a[1]];
            if (i === 2) continue;                              // incomplete, as the mark always is
            Engrave.inst(blue, [((a[0] + b[0]) / 2) * S, ph + 0.55 * S + ((a[1] + b[1]) / 2) * S, zp + 0.105 * S], 4, [0.014 * S, (Math.hypot(...d) / 2) * S, 0.006 * S], 0.5, Engrave.quat([0, 0, 1], Math.atan2(-d[0], d[1])), 0.6);
        }
        Engrave.inst(blue, [-0.24 * S, ph + 0.35 * S, zp + 0.105 * S], 4, [0.17 * S, 0.014 * S, 0.006 * S], 0.5, [0, 0, 0, 1], 0.6);
        Engrave.inst(blue, [0.24 * S, ph + 0.35 * S, zp + 0.105 * S], 4, [0.17 * S, 0.014 * S, 0.006 * S], 0.5, [0, 0, 0, 1], 0.6);
        if (k < 2) {
            const open = E(u, [32.8, 34.9][k], [33.9, 36.0][k]);
            for (const sx of [-1, 1]) Engrave.inst(stone, [sx * (pw / 2 + open * pw * 0.95), ph / 2, zp - 0.02 * S], 1, [pw / 2, ph / 2, 0.06 * S], 0.9 + sx * 0.01);
        }
        // the three rings of the room, nested round the axis; they spin, then line up
        const al = [32.9, 35.0, 99][k];
        const line = E(u, al - 0.7, al) * (1 - E(u, al + 0.9, al + 1.9));
        [[0.62, [1, 0.3, 0], 0.9], [0.5, [0.2, 1, 0.4], -1.2], [0.38, [0.5, 0.2, 1], 1.5]].forEach(([r, ax, sp], i) => {
            let q = nlerp(Engrave.quat(ax, u * sp + i * 2 + k), face, line);
            if (k === 1 && i === 2) q = Engrave.qmul(Engrave.quat([0, 1, 0], -1.1 * E(u, 36.3, 37.0)), q);   // the tilt
            Engrave.inst(rings, [0, (k === 1 ? 2.05 : 0.95) * S, zp + (k === 1 ? 0.75 : 1.6) * S], 3, [r * S, r * S, r * S], 0.3 + i * 0.2 + k * 0.1, q);
        });
    }
    function build(u) {
        const stone = [], worn = [], obs = [], blue = [], rings = [], gold = [], dust = [], motes = [], cols = [], caps = [];
        for (let k = 0; k < 3; k++) room(k, u, stone, worn, obs, blue, rings, gold, cols, caps);
        // the membrane behind: a triangular frame in the entrance wall, glowing as it is crossed
        const glowM = 0.9 * (1 - E(u, 31.2, 32.2));
        const tri = [[0, 1.75], [-0.75, 0.25], [0.75, 0.25]];
        for (let i = 0; i < 3; i++) {
            const a = tri[i], b = tri[(i + 1) % 3], d = [b[0] - a[0], b[1] - a[1]];
            Engrave.inst(blue, [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, 2.2], 4, [0.012, Math.hypot(...d) / 2, 0.01], 0.5, Engrave.quat([0, 0, 1], Math.atan2(-d[0], d[1])), glowM);
        }
        // the structure rides just ahead of the camera
        const c = structureAt(u);
        Shaft.structure(c, u, dust, blue);
        // motes in the air of the near room
        const rm = Motion.rng('reso-motes');
        for (let i = 0; i < 500; i++) {
            const x = (rm() - 0.5) * 1.8, y = rm() * 2.3, z = 2 - rm() * 13 + ((u * 0.1 * (0.5 + rm())) % 1), sz = 0.0012 + rm() * 0.002;
            Engrave.inst(motes, [x, y, z], 5, [sz, sz, sz], rm(), [0, 0, 0, 1], 0, -1);
        }
        const draws = [
            { mesh: 'box', inst: new Float32Array(stone), box: true, masonry: true },
            { mesh: 'box', inst: new Float32Array(worn), box: true, masonry: true },
            { mesh: 'cylinder', inst: new Float32Array(cols), tan: 'y' },
            { mesh: 'capital', inst: new Float32Array(caps), tan: 'y' },
            { mesh: 'box', inst: new Float32Array(obs), box: true },
            { mesh: 'box', inst: new Float32Array(blue), box: true, cast: false },
            { mesh: 'ring', inst: new Float32Array(rings) },
            { mesh: 'sphere', inst: new Float32Array(dust), cast: false },
            { mesh: 'sphere', inst: new Float32Array(motes), cast: false },
        ];
        const side = E(u, 36.3, 37.2);
        const lights = [[c[0], c[1], c[2], 0, 0.3], [0, 3.8, -8.4, 0, 0.3], [-3.6, 1.5, -9.8, 0, 0.9 * side], [0, 12, -30, 0, 0.3]];
        return { draws, lights, centre: c };
    }
    // the camera moves on down the axis; the structure keeps 0.55 ahead of it
    function camAt(u) {
        const z = 2.05 - 10.9 * (Ease.seg(u, 31, 37.2) * 0.35 + Ease.inOut(Ease.seg(u, 31, 37.2)) * 0.65);
        const y = 0.9 + 2.2 * E(u, 33.2, 36.0);
        return [0.04 * Math.sin(u * 0.7), y, z];
    }
    function structureAt(u) {
        const p = camAt(u), side = E(u, 36.6, 37.9);
        return [p[0] - 0.02 - 0.5 * side, p[1] - 0.12, p[2] - 0.6 + 0.25 * side];
    }
    function camera(u) {
        const cam = camAt(u), side = E(u, 36.5, 37.8);
        const ahead = [0, 0.9 * Math.pow(3, E(u, 33.2, 36)) * 0.5, cam[2] - 6];
        const toSide = [-3.6, 1.6, -9.8];
        const target = ahead.map((v, i) => v + (toSide[i] - v) * side);
        return { cam, target, up: [0, 1, 0], fov: 0.86 };
    }
    // at the end the light drops for a few tenths (the sound dims with it)
    const dim = (u) => 0.8 * E(u, 37.6, 37.95);
    const frameParams = {
        sun: [0.12, 0.55, -0.83], sunK: 1.6, fill: 0.42, interior: true,
        sky: { zenith: 0.9, horizon: 0.9, dusk: 0 },
        fog: [6, 70], course: 0.26,
    };
    return { build, camera, frameParams, dim, T0: 31, T1: 38 };
})();
