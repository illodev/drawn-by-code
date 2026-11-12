// dev: «REW» on its own (the film's 103.4167–110.5 s as 0–7.08 s). The spot it rewinds
// (segments/breakad.js) is optional: without it the block runs on a stand-in card.
Motion.scene({
    fps: 24, duration: 7.0833, logical: [1000, 1000],
    uses: ['styles/cereal-ad/cereal.js', 'sandbox/2026-11-11-runnin-down-a-dream/song.js', 'sandbox/2026-11-11-runnin-down-a-dream/cast.js', 'sandbox/2026-11-11-runnin-down-a-dream/devil.js',
        'sandbox/2026-11-11-runnin-down-a-dream/fx.js',
        { src: 'sandbox/2026-11-11-runnin-down-a-dream/segments/breakad-props.js', optional: true },
        { src: 'sandbox/2026-11-11-runnin-down-a-dream/segments/breakad.js', optional: true },
        'sandbox/2026-11-11-runnin-down-a-dream/segments/breakrew-props.js', 'sandbox/2026-11-11-runnin-down-a-dream/segments/breakrew.js'],
    fonts: [{ family: 'Anton', src: 'fonts/Anton-latin.woff2' }, { family: 'Titan One', src: 'fonts/TitanOne-latin.woff2' }, { family: 'Hand', src: 'fonts/PatrickHand-Regular.ttf' }],
    bpm: 169.97, beatOffset: 0.356 - 103.4167 + 292 * (60 / 169.97),
    shots: [[0, 1.4167, 'REW'], [1.4167, 4.25, 'Slowing'], [4.25, 5.6667, 'The message'], [5.6667, 7.0833, 'PLAY']],
    draw(g, t, env) { Seg.breakrew.draw(g, t + 103.4167, env); },
    post(ctx, t, env) { Cereal.post(ctx, t, env, Seg.breakrew.post(t + 103.4167)); },
});
