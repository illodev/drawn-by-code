// dev: the join between the Devil's spot and «REW»: the last second of segments/breakad.js,
// then the block (the film's 102.4167–110.5 s as 0–8.08 s), assembled as scene.js does it.
Motion.scene({
    fps: 24, duration: 8.0833, logical: [1000, 1000],
    uses: ['styles/cereal-ad/cereal.js', 'sandbox/2026-11-11-runnin-down-a-dream/song.js', 'sandbox/2026-11-11-runnin-down-a-dream/cast.js', 'sandbox/2026-11-11-runnin-down-a-dream/devil.js',
        'sandbox/2026-11-11-runnin-down-a-dream/fx.js',
        'sandbox/2026-11-11-runnin-down-a-dream/segments/breakad-props.js', 'sandbox/2026-11-11-runnin-down-a-dream/segments/breakad.js',
        'sandbox/2026-11-11-runnin-down-a-dream/segments/breakrew-props.js', 'sandbox/2026-11-11-runnin-down-a-dream/segments/breakrew.js'],
    fonts: [{ family: 'Anton', src: 'fonts/Anton-latin.woff2' }, { family: 'Titan One', src: 'fonts/TitanOne-latin.woff2' }, { family: 'Hand', src: 'fonts/PatrickHand-Regular.ttf' }],
    bpm: 169.97, beatOffset: 0.356 - 102.4167 + 290 * (60 / 169.97),
    shots: [[0, 1, 'End card'], [1, 2.4167, 'REW'], [2.4167, 5.25, 'Slowing'], [5.25, 6.6667, 'The message'], [6.6667, 8.0833, 'PLAY']],
    setup() { return { seg: (t) => (t >= 103.4167 - 1e-6 ? Seg.breakrew : Seg.breakad) }; },
    draw(g, t, env) { env.state.seg(t + 102.4167).draw(g, t + 102.4167, env); },
    post(ctx, t, env) { Cereal.post(ctx, t, env, env.state.seg(t + 102.4167).post(t + 102.4167)); },
});
