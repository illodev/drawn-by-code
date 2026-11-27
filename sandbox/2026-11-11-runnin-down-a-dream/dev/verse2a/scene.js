// dev: «verse2a» on its own (the film's 55.4167–63.9167 s as 0–8.5 s): bars 39–40 «Feeling
// good», bars 41–43 «Cruise control», bar 44 «What is behind them».
Motion.scene({
    fps: 24, duration: 8.5, logical: [1000, 1000],
    uses: [
        'styles/cereal-ad/cereal.js', 'sandbox/2026-11-11-runnin-down-a-dream/song.js', 'sandbox/2026-11-11-runnin-down-a-dream/cast.js', 'sandbox/2026-11-11-runnin-down-a-dream/devil.js',
        'sandbox/2026-11-11-runnin-down-a-dream/band-strings.js', 'sandbox/2026-11-11-runnin-down-a-dream/band-rhythm.js', 'sandbox/2026-11-11-runnin-down-a-dream/rides.js',
        'sandbox/2026-11-11-runnin-down-a-dream/fx.js', 'sandbox/2026-11-11-runnin-down-a-dream/world.js', 'sandbox/2026-11-11-runnin-down-a-dream/rig.js',
        'sandbox/2026-11-11-runnin-down-a-dream/weather.js',
        'sandbox/2026-11-11-runnin-down-a-dream/segments/chorus1-props.js',
        'sandbox/2026-11-11-runnin-down-a-dream/segments/verse2a-props.js', 'sandbox/2026-11-11-runnin-down-a-dream/segments/verse2a.js',
    ],
    fonts: [{ family: 'Anton', src: 'fonts/Anton-latin.woff2' }],
    bpm: 169.97, beatOffset: 0.356 + 156 * (60 / 169.97) - 55.4167,
    shots: [[0, 2.8333, 'Feeling good'], [2.8333, 7.0833, 'Cruise control'], [7.0833, 8.5, 'Behind them']],
    draw(g, t, env) { Seg.verse2a.draw(g, t + 55.4167, env); },
    post(ctx, t, env) { Cereal.post(ctx, t, env, Seg.verse2a.post(t + 55.4167)); },
});
