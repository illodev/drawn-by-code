// micrograph-test: the style test of `micrograph`, grown into a piece. Seven specimens from
// the largest to the smallest: three are the user's reference stills, each matched at one
// instant (MATCH, in the shot's own time), and four are ours (Naegleria, Mito, Phage, Budding).
const DIR = 'sandbox/2026-11-17-micrograph-test/';
Motion.scene({
    fps: 24,
    duration: 37.5,
    logical: [1600, 900],
    // the score is at 120 BPM: every cut is on a beat, and the serial sections' eight slices a
    // second are its sixteenth notes
    bpm: 120, beatOffset: 0,
    audio: { mix: 'mix.wav' },
    uses: ['styles/micrograph/micrograph.js', DIR + 'virion.js', DIR + 'section.js', DIR + 'stain.js', DIR + 'budding.js', DIR + 'phage.js', DIR + 'mito.js', DIR + 'naegleria.js', DIR + 'dark.js'],
    fonts: [{ family: 'Poppins', src: 'fonts/Poppins-Bold-latin.woff2', descriptors: { weight: '700' } },
            { family: 'Lora', src: 'fonts/Lora-Medium-latin.woff2', descriptors: { weight: '500' } },
            { family: 'VT323', src: 'fonts/VT323-latin.woff2' }],
    // (start, end, shot, seconds of its own time skipped at its start)
    shots: [[0, 6.5, 'Naegleria'], [6.5, 11.5, 'Mito'], [11.5, 15.5, 'Section', 1.5], [15.5, 21.5, 'Phage'], [21.5, 25.5, 'Stain', 1], [25.5, 31.5, 'Budding'], [31.5, 37.5, 'Dark']],
    setup(env) {
        const M = Micrograph.make(env);
        for (const [, , name] of this.shots) M.scene(name.toLowerCase(), MGT[name.toLowerCase()].glsl, MGT[name.toLowerCase()].data);
        return { M };
    },
    draw(g, t, env) {
        const { name, local: since, shot, t0: start, t1: end } = Motion.shotAt(this.shots, t);
        const skip = shot[3] ?? 0, local = since + skip;
        const key = name.toLowerCase(), S = MGT[key];
        // a cut is a change of magnification: the outgoing image rushes in or out and loses
        // focus while the beam dips; the incoming one arrives the same way and settles
        const edge = { inn: 1 - Ease.out(Ease.seg(since, 0, 0.5)), out: Ease.in(Ease.seg(since, end - start - 0.36, end - start)), first: start === 0, last: end >= this.duration, skip };
        env.state.M.render(g, key, { t: local, frame: Math.round(t * env.fps), ...S.frame(local, edge), plate: S.plate ? (pg) => S.plate(pg, env) : null, plateKey: key });
        if (S.overlay) S.overlay(g, local, env);
    },
});
