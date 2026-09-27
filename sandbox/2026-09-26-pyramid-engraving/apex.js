// PIR-09 (script 52–57 s): «Putting the stone back». The seed climbs the axis of the opened
// pyramid to its apex; the camera follows it up, slips out to one side and sees, behind it,
// the outer layers coming home: each stone replays its opening backwards, the courses closing
// from the base upwards and leaving the way up free. The seed is released at 55; the capstone
// settles last, at 56; a puff of dust runs down the face. The machine slows and folds away.
// The camera ends near where the film began (PIR-01's view), ready for the new star.
const Apex = (() => {
    const E = (u, a, b) => Ease.inOut(Ease.seg(u, a, b));
    const HP = Pyramid.HP;
    // each stone closes in its own second, the lowest first (52.6 … 55.6)
    const stoneT = (u) => (s) => {
        const k = E(u, 52.6 + (s.c[1] / HP) * 2.6, 53.5 + (s.c[1] / HP) * 2.6);
        return 5.9 + (16 - 5.9) * (1 - k);
    };
    // the seed: it comes up out of the nursery's ceiling shaft (junctions.js: the shaft opens
    // onto the heart, just above the rings, at Y0) at the speed it rose there, climbs the axis,
    // out through the gap at the top, and on. The nursery's sphere is K7 times this one.
    const Y0 = 0.85, SEED_R = 0.055, K7 = SEED_R / Nursery.R, Y1 = HP * 1.45 + 0.1;
    const V0 = (2 * (Nursery.HH + 0.1 - Nursery.centre(45)[1]) / (Seed.UP - Seed.OUT)) * K7;
    const herm1 = (p0, v0, p1, v1, T, k) => (2 * k ** 3 - 3 * k * k + 1) * p0 + (k ** 3 - 2 * k * k + k) * T * v0 + (-2 * k ** 3 + 3 * k * k) * p1 + (k ** 3 - k * k) * T * v1;
    const seedAt = (u) => {
        if (u < Seed.UP) return [0, Y0 + V0 * (u - Seed.UP), 0];
        if (u < 55) return [0, herm1(Y0, V0, Y1, 0.225, 55 - Seed.UP, Ease.seg(u, Seed.UP, 55)), 0];
        return [0, Y1 + 0.45 * Ease.seg(u, 55, 57), 0];
    };
    function build(u) {
        const e = 1 - E(u, 55.4, 56.0);                      // the capstone comes down last
        // (the axis is folded down under the shaft's mouth: the seed climbs where it stood)
        const P = Pyramid.build(u - 38, { stoneT: stoneT(u), e: Math.max(e, 0), axis: 0 });
        // the machine slows and dims as the stone closes over it
        P.lights = P.lights.map((l, i) => (i < 5 ? [l[0], l[1], l[2], l[3], l[4] * 0.5 * (1 - E(u, 52.2, 54.5))] : l));
        // the seed: the nursery's sphere, K7 smaller: its skin of leaves, and inside it its sky
        // (a portal onto the seed's space: junctions.js)
        const c = seedAt(u), leaves = [], dust = [];
        Nursery.skin(leaves, c, SEED_R);
        // the dust the capstone shakes down its faces
        const rd = Motion.rng('apex-dust');
        for (let i = 0; i < 400; i++) {
            const t0 = 56.0 + rd() * 0.3, face = Math.floor(rd() * 4), along = (rd() - 0.5), du = u - t0;
            const sz = 0.002 + rd() * 0.003;
            if (du < 0 || du > 1.2) continue;
            const d = 0.02 + du * (0.25 + rd() * 0.2), y = HP - d * 1.27 - 0.5 * 0.3 * du * du, w = (d * 0.8 + 0.02) * along * 2;
            const n = [[1, 0], [-1, 0], [0, 1], [0, -1]][face];
            const off = d * 0.8 + 0.01;
            Engrave.inst(dust, [n[0] * off + (n[1] !== 0 ? w : 0), Math.max(y, 0.01), n[1] * off + (n[0] !== 0 ? w : 0)], 5, [sz, sz, sz], rd(), [0, 0, 0, 1], 0, 0.75);
        }
        P.draws.push(
            { mesh: 'box', inst: new Float32Array(leaves), box: true, cast: false },
            { mesh: 'sphere', inst: new Float32Array(dust), cast: false },
        );
        P.lights.push([c[0], c[1], c[2] + 0.02, 0, 0.1]);
        return P;
    }
    // the camera: up the axis under the seed (it came up the shaft after it), out to the side,
    // back to the opening view
    const KEYS = [
        [52.6, [0, Y0, 0], [0, 1.5, 0], [0.9]],                 // (the shaft's mouth: so it is moving at 53.3)
        [53.3, [0.06, 0.97, 0.08], [0, 1.4, 0], [0.9]],
        [53.9, [0.4, 1.3, 0.55], [0, 1.6, 0], [0.86]],
        [54.6, [1.55, 1.85, 2.45], [0, 1.45, 0], [0.8]],
        [55.6, [-0.4, 1.0, 4.4], [-0.3, 1.2, 0], [0.7]],
        [57.0, [-1.2, 1.0, 4.9], [-0.45, 0.82, 0], [0.7]],
    ];
    return { build, KEYS, seedAt, Y0, K7, SEED_R, T0: 52, T1: 57 };
})();
