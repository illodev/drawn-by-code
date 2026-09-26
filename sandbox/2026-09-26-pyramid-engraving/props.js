// Temple furniture for the interiors, after the plates: offering tables heaped with loaves
// and a jar, tall jars on stands, seated statues on bases (a block figure: seat, body, head,
// headdress), fallen stones and rubble along the walls. Built from box, vase and rock
// instances in the room's scale S; deterministic per seed.
const Props = (() => {
    function table(P, x, z, S, r) {
        P.stone.push(...inst([x, 0.16 * S, z], 0, [0.05 * S, 0.16 * S, 0.05 * S], r()));
        P.stone.push(...inst([x, 0.33 * S, z], 0, [0.2 * S, 0.018 * S, 0.14 * S], r()));
        for (let i = 0; i < 5; i++) P.small.push(...inst([x + (r() - 0.5) * 0.28 * S, 0.37 * S, z + (r() - 0.5) * 0.18 * S], 0, [0.035 * S, 0.025 * S, 0.035 * S], r(), Engrave.quat([0, 1, 0], r() * 3)));
        P.vases.push(...inst([x + 0.1 * S, 0.43 * S, z], 0, [0.045 * S, 0.08 * S, 0.045 * S], r()));
    }
    function jar(P, x, z, S, r) {
        P.stone.push(...inst([x, 0.08 * S, z], 0, [0.07 * S, 0.08 * S, 0.07 * S], r()));
        P.vases.push(...inst([x, 0.32 * S, z], 0, [0.09 * S, 0.16 * S, 0.09 * S], r()));
    }
    function statue(P, x, z, S, r, facing) {
        const q = Engrave.quat([0, 1, 0], facing);
        P.stone.push(...inst([x, 0.12 * S, z], 0, [0.2 * S, 0.12 * S, 0.24 * S], r(), q));                       // base
        P.stone.push(...inst([x, 0.36 * S, z], 0, [0.15 * S, 0.12 * S, 0.18 * S], r(), q));                      // seat
        P.stone.push(...inst([x, 0.62 * S, z], 0, [0.1 * S, 0.17 * S, 0.08 * S], r(), q));                       // body
        const fwd = [Math.sin(facing), 0, Math.cos(facing)];
        P.stone.push(...inst([x + fwd[0] * 0.1 * S, 0.44 * S, z + fwd[2] * 0.1 * S], 0, [0.09 * S, 0.035 * S, 0.1 * S], r(), q)); // knees
        P.small.push(...inst([x, 0.86 * S, z], 0, [0.06 * S, 0.07 * S, 0.06 * S], r(), q));                      // head
        P.stone.push(...inst([x, 0.96 * S, z], 0, [0.045 * S, 0.08 * S, 0.045 * S], r(), q));                    // crown
    }
    function rubble(P, x, z, S, r) {
        for (let i = 0; i < 7; i++) {
            const s = (0.02 + Math.pow(r(), 2) * 0.1) * S;
            P.small.push(...inst([x + (r() - 0.5) * 0.5 * S, s * 0.5, z + (r() - 0.5) * 0.8 * S], 1, [s * 1.3, s * 0.7, s], r(), Engrave.quat([r() - 0.5, 1, r() - 0.5], r() * 6)));
        }
        P.stone.push(...inst([x, 0.1 * S, z], 1, [0.28 * S, 0.1 * S, 0.16 * S], r(), Engrave.quat([0.3, 1, 0.1], r())));
    }
    const inst = (c, m, h, seed, q = [0, 0, 0, 1]) => { const a = []; Engrave.inst(a, c, m, h, seed, q); return a; };
    function room(P, W, S, z0, z1, seed) {
        const r = Motion.rng('props-' + seed), n = Math.max(3, Math.round((z0 - z1) / (1.6 * S)));
        for (let i = 0; i < n; i++) {
            const z = z0 - ((z0 - z1) * (i + 0.5)) / n;
            for (const sx of [-1, 1]) {
                const x = sx * (W - 0.8 * S), k = r();
                if (k < 0.3) table(P, x, z, S, r);
                else if (k < 0.55) jar(P, x, z, S, r);
                else if (k < 0.78) statue(P, x, z, S, r, sx > 0 ? -Math.PI / 2 : Math.PI / 2);
                else rubble(P, sx * (W - 0.25 * S), z, S, r);
            }
        }
    }
    return { room, table, jar, statue, rubble };
})();
