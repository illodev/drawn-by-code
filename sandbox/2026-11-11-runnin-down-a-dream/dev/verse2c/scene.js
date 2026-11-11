// dev: «verse2c» on its own (the film's 70.9583–76.625 s as 0–5.67 s): bar 50 «Cold»,
// bars 51–52 «Hell freezes over», bar 53 «On ice».
Motion.scene({
    fps: 24, duration: 5.6667, logical: [1000, 1000],
    uses: [
        'styles/cereal-ad/cereal.js', 'sandbox/2026-11-11-runnin-down-a-dream/song.js', 'sandbox/2026-11-11-runnin-down-a-dream/cast.js', 'sandbox/2026-11-11-runnin-down-a-dream/devil.js',
        'sandbox/2026-11-11-runnin-down-a-dream/band-strings.js', 'sandbox/2026-11-11-runnin-down-a-dream/band-rhythm.js', 'sandbox/2026-11-11-runnin-down-a-dream/rides.js',
        'sandbox/2026-11-11-runnin-down-a-dream/fx.js', 'sandbox/2026-11-11-runnin-down-a-dream/world.js', 'sandbox/2026-11-11-runnin-down-a-dream/rig.js',
        'sandbox/2026-11-11-runnin-down-a-dream/weather.js', 'sandbox/2026-11-11-runnin-down-a-dream/segments/planb.js',
        'sandbox/2026-11-11-runnin-down-a-dream/segments/verse2b-props.js',
        'sandbox/2026-11-11-runnin-down-a-dream/segments/verse2c-props.js', 'sandbox/2026-11-11-runnin-down-a-dream/segments/verse2c.js',
    ],
    fonts: [{ family: 'Anton', src: 'fonts/Anton-latin.woff2' }],
    bpm: 169.97, beatOffset: 0.356 - 1703 / 24 + 200 * (60 / 169.97),
    shots: [[0, 1.4167, 'Cold'], [1.4167, 4.25, 'Hell freezes over'], [4.25, 5.6667, 'On ice']],
    draw(g, t, env) { Seg.verse2c.draw(g, t + 1703 / 24, env); },
    post(ctx, t, env) { Cereal.post(ctx, t, env, Seg.verse2c.post(t + 1703 / 24)); },
});
