// dev: verse 3a on its own (the film's 110.5–120.375 s as 0–9.875 s)
Motion.scene({
    fps: 24, duration: 9.875, logical: [1000, 1000],
    uses: ['styles/cereal-ad/cereal.js', 'sandbox/2026-11-11-runnin-down-a-dream/song.js', 'sandbox/2026-11-11-runnin-down-a-dream/cast.js', 'sandbox/2026-11-11-runnin-down-a-dream/devil.js',
        'sandbox/2026-11-11-runnin-down-a-dream/band-strings.js', 'sandbox/2026-11-11-runnin-down-a-dream/band-rhythm.js', 'sandbox/2026-11-11-runnin-down-a-dream/rides.js',
        'sandbox/2026-11-11-runnin-down-a-dream/fx.js', 'sandbox/2026-11-11-runnin-down-a-dream/world.js', 'sandbox/2026-11-11-runnin-down-a-dream/rig.js',
        'sandbox/2026-11-11-runnin-down-a-dream/segments/chorus1-props.js',
        'sandbox/2026-11-11-runnin-down-a-dream/segments/verse3a-props.js', 'sandbox/2026-11-11-runnin-down-a-dream/segments/verse3a.js'],
    fonts: [{ family: 'Anton', src: 'fonts/Anton-latin.woff2' }],
    bpm: 169.97, beatOffset: 0.356 - 110.5 + 312 * (60 / 169.97),
    shots: [[0, 4.2083, 'Dusk'], [4.2083, 7.0417, 'Pedal'], [7.0417, 9.875, 'Time']],
    draw(g, t, env) { Seg.verse3a.draw(g, t + 110.5, env); },
    post(ctx, t, env) { Cereal.post(ctx, t, env, Seg.verse3a.post(t + 110.5)); },
});
