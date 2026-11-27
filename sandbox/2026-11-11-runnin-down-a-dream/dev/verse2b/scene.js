// dev: «verse2b» on its own (the film's 63.9167–70.9583 s as 0–7.04 s): bar 45 «The cloud grows»,
// bars 46–48 «Three days of rain», bar 49 «Unstoppable».
Motion.scene({
    fps: 24, duration: 7.0417, logical: [1000, 1000],
    uses: [
        'styles/cereal-ad/cereal.js', 'sandbox/2026-11-11-runnin-down-a-dream/song.js', 'sandbox/2026-11-11-runnin-down-a-dream/cast.js', 'sandbox/2026-11-11-runnin-down-a-dream/devil.js',
        'sandbox/2026-11-11-runnin-down-a-dream/band-strings.js', 'sandbox/2026-11-11-runnin-down-a-dream/band-rhythm.js', 'sandbox/2026-11-11-runnin-down-a-dream/rides.js',
        'sandbox/2026-11-11-runnin-down-a-dream/fx.js', 'sandbox/2026-11-11-runnin-down-a-dream/world.js', 'sandbox/2026-11-11-runnin-down-a-dream/rig.js',
        'sandbox/2026-11-11-runnin-down-a-dream/weather.js', 'sandbox/2026-11-11-runnin-down-a-dream/segments/chorus1-props.js', 'sandbox/2026-11-11-runnin-down-a-dream/segments/verse2a-props.js',
        'sandbox/2026-11-11-runnin-down-a-dream/segments/verse2b-props.js', 'sandbox/2026-11-11-runnin-down-a-dream/segments/verse2b.js',
    ],
    fonts: [{ family: 'Anton', src: 'fonts/Anton-latin.woff2' }],
    bpm: 169.97, beatOffset: 0.3329,
    shots: [[0, 1.375, 'The cloud grows'], [1.375, 5.625, 'Three days of rain'], [5.625, 7.0417, 'Unstoppable']],
    draw(g, t, env) { Seg.verse2b.draw(g, t + 63.9167, env); },
    post(ctx, t, env) { Cereal.post(ctx, t, env, Seg.verse2b.post(t + 63.9167)); },
});
