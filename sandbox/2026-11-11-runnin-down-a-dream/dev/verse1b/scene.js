// dev: «The swapped sign» on its own (the film's 24.375–28.583 s as 0–4.21 s)
Motion.scene({
    fps: 24, duration: 4.2083, logical: [1000, 1000],
    uses: ['styles/cereal-ad/cereal.js', 'sandbox/2026-11-11-runnin-down-a-dream/song.js', 'sandbox/2026-11-11-runnin-down-a-dream/cast.js', 'sandbox/2026-11-11-runnin-down-a-dream/devil.js',
        'sandbox/2026-11-11-runnin-down-a-dream/band-strings.js', 'sandbox/2026-11-11-runnin-down-a-dream/band-rhythm.js', 'sandbox/2026-11-11-runnin-down-a-dream/rides.js',
        'sandbox/2026-11-11-runnin-down-a-dream/fx.js', 'sandbox/2026-11-11-runnin-down-a-dream/world.js', 'sandbox/2026-11-11-runnin-down-a-dream/rig.js',
        'sandbox/2026-11-11-runnin-down-a-dream/segments/verse1b.js'],
    fonts: [{ family: 'Anton', src: 'fonts/Anton-latin.woff2' }],
    bpm: 169.97,
    beatOffset: 0.356 + 68 * (60 / 169.97) - 24.375,
    shots: [[0, 1.4167, 'Swap'], [1.4167, 4.2083, 'Fork']],
    draw(g, t, env) { Seg.verse1b.draw(g, t + 24.375, env); },
    post(ctx, t, env) { Cereal.post(ctx, t, env, Seg.verse1b.post(t + 24.375)); },
});
