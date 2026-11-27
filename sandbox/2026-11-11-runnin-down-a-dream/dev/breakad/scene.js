// dev: «breakad» on its own (the film's 89.3333–103.4167 s as 0–14.08 s): bars 63–64 the
// bumper, bars 65–72 the Devil's spot.
Motion.scene({
    fps: 24, duration: 14.0833, logical: [1000, 1000],
    uses: [
        'styles/cereal-ad/cereal.js', 'sandbox/2026-11-11-runnin-down-a-dream/song.js', 'sandbox/2026-11-11-runnin-down-a-dream/cast.js', 'sandbox/2026-11-11-runnin-down-a-dream/devil.js',
        'sandbox/2026-11-11-runnin-down-a-dream/fx.js', 'sandbox/2026-11-11-runnin-down-a-dream/segments/breakad-props.js', 'sandbox/2026-11-11-runnin-down-a-dream/segments/breakad.js',
    ],
    fonts: [{ family: 'Anton', src: 'fonts/Anton-latin.woff2' }, { family: 'Titan One', src: 'fonts/TitanOne-latin.woff2' }],
    bpm: 169.97, beatOffset: 0.356 + 252 * (60 / 169.97) - 2144 / 24,
    shots: [[0, 2.7917, 'Bumper'], [2.7917, 4.2083, 'Empty'], [4.2083, 5.625, 'Burst'], [5.625, 7.0417, 'Souls wanted'], [7.0417, 8.4583, 'Cash paid'], [8.4583, 11.2917, 'Phone'], [11.2917, 14.0833, 'End card']],
    draw(g, t, env) { Seg.breakad.draw(g, t + 2144 / 24, env); },
    post(ctx, t, env) { Cereal.post(ctx, t, env, Seg.breakad.post(t + 2144 / 24)); },
});
