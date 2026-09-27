// PIR-10 (script 57–60 s): «One more star». Almost PIR-01's view: the pyramid still again. The
// seed rises the last few metres and becomes a point of light above the apex, clearly apart
// from it; a faint blue answer runs once along the first joint and goes out; the mark is gone
// from the stone, the new point stays in the sky. From 58.5 the camera is still. Then the film
// closes as it opened: the engraving draws back into its printed plate (the film's frame does
// that, from 59).
const Star = (() => {
    const E = (u, a, b) => Ease.inOut(Ease.seg(u, a, b));
    const HP = Pyramid.HP;
    const at = (u) => {
        const s = Apex.seedAt(57), k = E(u, 57, 58.4);
        return [s[0] + 0.1 * k, s[1] + 0.3 * k, s[2]];
    };
    // the seed's radius as it shrinks into the star
    const radius = (u) => Apex.SEED_R * (1 - E(u, 57, 58.4)) + 0.002 * (1 - E(u, 58.2, 58.4));
    function build(u) {
        // the stone closed and quiet; a brief answer along the joint (58.0–58.9)
        const pulse = Math.max(0, Math.sin(Math.PI * Ease.seg(u, 58.0, 58.9)));
        const tj = pulse > 0 ? 2.4 + 0.8 * pulse : 1.0;
        const P = Pyramid.build(tj, { quiet: true, e: 0 });
        const c = at(u), k = E(u, 57, 58.4);
        const core = [], rays = [], glow = [];
        // the seed shrinks into a point: its skin and its sky at first (the sky through the skin
        // is a portal: junctions.js), then a star (bare paper)
        const skin = [];
        if (k < 1) Nursery.skin(skin, c, radius(u));
        const sz = 0.004 + 0.012 * k;
        Engrave.inst(core, c, 5, [sz, sz, sz], 0.5, [0, 0, 0, 1], 0, -1);
        // an engraved star: four long rays and four short, as the plates draw stars
        const L = 0.09 * k, tw = 1 + 0.08 * Math.sin(u * 9);
        for (let i = 0; i < 8; i++) {
            const a = (i / 8) * Math.PI, len = (i % 2 ? 0.45 : 1) * L * tw;
            if (len < 0.002) continue;
            Engrave.inst(rays, c, 5, [0.0016, len, 0.0016], 0.5, Engrave.quat([0, 0, 1], a), 0, -1);
        }
        Engrave.inst(glow, c, 4, [0.006 * k, 0.006 * k, 0.006 * k], 0.5, [0, 0, 0, 1], 0.8);
        P.draws.push(
            { mesh: 'box', inst: new Float32Array(skin), box: true, cast: false },
            { mesh: 'sphere', inst: new Float32Array(glow), cast: false },
            { mesh: 'sphere', inst: new Float32Array(core), cast: false },
            { mesh: 'box', inst: new Float32Array(rays), box: true, cast: false },
        );
        P.lights = P.lights.map((l) => [l[0], l[1], l[2], l[3], 0]);
        // the answer along the first joint: a line of live blue that runs the stone's width
        // and goes out, with a small glow on the stone round it
        if (pulse > 0) {
            const S0 = Pyramid.S0(), line = [], run = Ease.seg(u, 58.0, 58.5);
            const x0 = S0.c[0] - S0.half[0], len = 2 * S0.half[0] * run;
            Engrave.inst(line, [x0 + len / 2, S0.c[1] - Pyramid.H / 2, S0.c[2] + S0.half[2] + 0.002], 4, [len / 2 + 0.001, 0.0022, 0.002], 0.5, [0, 0, 0, 1], pulse);
            P.draws.push({ mesh: 'box', inst: new Float32Array(line), box: true, cast: false });
            P.lights.push([S0.c[0], S0.c[1] - Pyramid.H / 2, S0.c[2] + S0.half[2] + 0.03, 0, 0.25 * pulse]);
        }
        return P;
    }
    const KEYS = [
        [57.0, [-1.2, 1.0, 4.9], [-0.45, 0.82, 0], [0.7]],
        [58.5, [-1.25, 1.02, 5.0], [-0.42, 1.05, 0], [0.72]],
        [62.0, [-1.25, 1.02, 5.0], [-0.42, 1.05, 0], [0.72]],
    ];
    return { build, KEYS, at, radius, T0: 57, T1: 60 };
})();
