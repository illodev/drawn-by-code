// dev: chorus 3 on its own (the film's 131.667–144.375 s as 0–12.71 s)
Motion.scene({
    fps: 24, duration: 12.7083, logical: [1000, 1000],
    uses: ['styles/cereal-ad/cereal.js', 'sandbox/2026-11-11-runnin-down-a-dream/song.js', 'sandbox/2026-11-11-runnin-down-a-dream/cast.js', 'sandbox/2026-11-11-runnin-down-a-dream/devil.js',
        'sandbox/2026-11-11-runnin-down-a-dream/band-strings.js', 'sandbox/2026-11-11-runnin-down-a-dream/band-rhythm.js', 'sandbox/2026-11-11-runnin-down-a-dream/rides.js',
        'sandbox/2026-11-11-runnin-down-a-dream/fx.js', 'sandbox/2026-11-11-runnin-down-a-dream/world.js', 'sandbox/2026-11-11-runnin-down-a-dream/rig.js', 'sandbox/2026-11-11-runnin-down-a-dream/inferno.js',
        'sandbox/2026-11-11-runnin-down-a-dream/segments/chorus1-props.js', 'sandbox/2026-11-11-runnin-down-a-dream/segments/verse3b-props.js',
        'sandbox/2026-11-11-runnin-down-a-dream/segments/chorus3-props.js', 'sandbox/2026-11-11-runnin-down-a-dream/segments/chorus3.js'],
    fonts: [{ family: 'Anton', src: 'fonts/Anton-latin.woff2' }],
    bpm: 169.97, beatOffset: 0.356 + 372 * (60 / 169.97) - 131.6667,
    shots: [[0, 2.8333, 'The entrance'], [2.8333, 4.25, 'Lights'], [4.25, 5.6667, 'A foot taps'], [5.6667, 7.0833, 'Won over'], [7.0833, 8.4583, 'Mitts up'], [8.4583, 9.875, 'The box'], [9.875, 12.7083, 'Full heat']],
    draw(g, t, env) { Seg.chorus3.draw(g, t + 131.6667, env); },
    post(ctx, t, env) { Cereal.post(ctx, t, env, Seg.chorus3.post(t + 131.6667)); },
});
