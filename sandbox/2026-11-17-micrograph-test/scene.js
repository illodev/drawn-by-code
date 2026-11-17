// micrograph-test: the style test of `micrograph`. Three specimens, one per palette of the
// user's reference stills, each shot matched to its still at one instant (MATCH).
const DIR = 'sandbox/2026-11-17-micrograph-test/';
Motion.scene({
    fps: 24,
    duration: 16.5,
    logical: [1600, 900],
    uses: ['styles/micrograph/micrograph.js', DIR + 'section.js', DIR + 'stain.js', DIR + 'dark.js'],
    fonts: [{ family: 'Poppins', src: 'fonts/Poppins-Bold-latin.woff2', descriptors: { weight: '700' } },
            { family: 'Lora', src: 'fonts/Lora-Medium-latin.woff2', descriptors: { weight: '500' } },
            { family: 'VT323', src: 'fonts/VT323-latin.woff2' }],
    shots: [[0, 5.5, 'Section'], [5.5, 10.5, 'Stain'], [10.5, 16.5, 'Dark']],
    setup(env) {
        const M = Micrograph.make(env);
        for (const [, , name] of this.shots) M.scene(name.toLowerCase(), MGT[name.toLowerCase()].glsl, MGT[name.toLowerCase()].data);
        return { M };
    },
    draw(g, t, env) {
        const { name, local, t0: start, t1: end } = Motion.shotAt(this.shots, t);
        const key = name.toLowerCase(), S = MGT[key];
        // a cut is a change of magnification: the outgoing image rushes in or out and loses
        // focus while the beam dips; the incoming one arrives the same way and settles
        const edge = { inn: 1 - Ease.out(Ease.seg(local, 0, 0.5)), out: Ease.in(Ease.seg(local, end - start - 0.36, end - start)), first: start === 0, last: end >= this.duration };
        env.state.M.render(g, key, { t: local, frame: Math.round(t * env.fps), ...S.frame(local, edge), plate: S.plate ? (pg) => S.plate(pg, env) : null, plateKey: key });
        if (S.overlay) S.overlay(g, local, env);
    },
});
