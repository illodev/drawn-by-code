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
    // the seed: up the axis from inside the core, out through the gap at the top, and on
    const seedAt = (u) => {
        const k1 = Ease.inOut(Ease.seg(u, 52, 55)), k2 = Ease.seg(u, 55, 57);
        const y = 0.75 + (HP * 1.45 + 0.1 - 0.75) * k1 + (0.9 * k2 + 1.6 * k2 * k2);
        return [0, y, 0];
    };
    function build(u) {
        const e = 1 - E(u, 55.4, 56.0);                      // the capstone comes down last
        const P = Pyramid.build(u - 38, { stoneT: stoneT(u), e: Math.max(e, 0) });
        // the machine slows and dims as the stone closes over it
        P.lights = P.lights.map((l, i) => (i < 5 ? [l[0], l[1], l[2], l[3], l[4] * 0.5 * (1 - E(u, 52.2, 54.5))] : l));
        // the seed: a dark sphere with its sky showing through, and a glow
        const c = seedAt(u), dark = [], sparks = [], dust = [];
        Engrave.inst(dark, c, 2, [0.055, 0.055, 0.055], 0.5);
        const rs = Motion.rng('apex-seed');
        for (let i = 0; i < 70; i++) {
            const a = rs() * 6.283 + u * 1.2, rr = 0.012 + 0.04 * Math.sqrt(rs()), h = (rs() - 0.5) * 0.02;
            const p = [c[0] + Math.cos(a) * rr, c[1] + h + Math.sin(a) * rr * 0.5, c[2] + Math.sin(a) * rr * 0.85 + 0.01];
            Engrave.inst(sparks, p, 4, [0.003, 0.003, 0.003], rs(), [0, 0, 0, 1], 1);
        }
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
            { mesh: 'sphere', inst: new Float32Array(dark), cast: false },
            { mesh: 'sphere', inst: new Float32Array(sparks), cast: false },
            { mesh: 'sphere', inst: new Float32Array(dust), cast: false },
        );
        P.lights.push([c[0], c[1], c[2] + 0.02, 0, 0.1]);
        return P;
    }
    // the camera: up beside the seed, out to the side, back to the opening view
    const KEYS = [
        [52.0, [0.35, 0.55, 0.55], [0, 0.95, 0], [0.9]],
        [53.2, [0.55, 1.35, 0.95], [0, 1.6, 0], [0.85]],
        [54.4, [1.6, 1.9, 2.4], [0, 1.4, 0], [0.8]],
        [55.6, [-0.4, 1.0, 4.4], [-0.3, 1.2, 0], [0.7]],
        [57.0, [-1.35, 0.62, 5.2], [-0.55, 0.9, 0], [0.66]],
    ];
    return { build, KEYS, seedAt, T0: 52, T1: 57 };
})();
