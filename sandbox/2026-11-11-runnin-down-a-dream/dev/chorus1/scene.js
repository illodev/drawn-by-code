// dev: chorus 1 on its own (the film's 35.667–48.375 s as 0–12.71 s)
Motion.scene({
    fps: 24, duration: 12.7083, logical: [1000, 1000],
    uses: ['styles/cereal-ad/cereal.js', 'sandbox/2026-11-11-runnin-down-a-dream/song.js', 'sandbox/2026-11-11-runnin-down-a-dream/cast.js', 'sandbox/2026-11-11-runnin-down-a-dream/devil.js',
        'sandbox/2026-11-11-runnin-down-a-dream/band-strings.js', 'sandbox/2026-11-11-runnin-down-a-dream/band-rhythm.js', 'sandbox/2026-11-11-runnin-down-a-dream/rides.js',
        'sandbox/2026-11-11-runnin-down-a-dream/fx.js', 'sandbox/2026-11-11-runnin-down-a-dream/world.js', 'sandbox/2026-11-11-runnin-down-a-dream/rig.js',
        'sandbox/2026-11-11-runnin-down-a-dream/segments/chorus1-props.js', 'sandbox/2026-11-11-runnin-down-a-dream/segments/chorus1.js'],
    fonts: [{ family: 'Anton', src: 'fonts/Anton-latin.woff2' }],
    bpm: 169.97, beatOffset: 0.356 - 35.6667 + 100 * (60 / 169.97),
    shots: [[0, 2.8333, 'Landing'], [2.8333, 4.2083, 'Kick'], [4.2083, 8.4583, 'Chase'], [8.4583, 9.875, 'Band'], [9.875, 12.7083, 'Blast']],
    draw(g, t, env) { Seg.chorus1.draw(g, t + 35.6667, env); },
    post(ctx, t, env) { Cereal.post(ctx, t, env, Seg.chorus1.post(t + 35.6667)); },
});
