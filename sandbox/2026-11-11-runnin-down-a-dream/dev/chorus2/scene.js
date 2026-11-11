// dev: chorus 2 on its own (the film's 76.625–89.3333 s as 0–12.71 s): add 76.625 to a time here for the film's.
// The cuts are at 2.7917 (bar 56) and 9.875 (bar 61).
Motion.scene({
    fps: 24, duration: 12.7083, logical: [1000, 1000],
    uses: ['styles/cereal-ad/cereal.js', 'sandbox/2026-11-11-runnin-down-a-dream/song.js', 'sandbox/2026-11-11-runnin-down-a-dream/cast.js', 'sandbox/2026-11-11-runnin-down-a-dream/devil.js',
        'sandbox/2026-11-11-runnin-down-a-dream/band-strings.js', 'sandbox/2026-11-11-runnin-down-a-dream/band-rhythm.js', 'sandbox/2026-11-11-runnin-down-a-dream/rides.js',
        'sandbox/2026-11-11-runnin-down-a-dream/fx.js', 'sandbox/2026-11-11-runnin-down-a-dream/world.js', 'sandbox/2026-11-11-runnin-down-a-dream/rig.js',
        'sandbox/2026-11-11-runnin-down-a-dream/weather.js', 'sandbox/2026-11-11-runnin-down-a-dream/segments/chorus1-props.js',
        'sandbox/2026-11-11-runnin-down-a-dream/segments/verse2c-props.js', // optional: what verse 2c's last picture leaves on the roadside (scarf, frost, snow)
        'sandbox/2026-11-11-runnin-down-a-dream/segments/chorus2-props.js', 'sandbox/2026-11-11-runnin-down-a-dream/segments/chorus2.js'],
    fonts: [{ family: 'Anton', src: 'fonts/Anton-latin.woff2' }],
    bpm: 169.97, beatOffset: 0.356 - 76.625 + 216 * (60 / 169.97),
    shots: [[0, 2.7917, 'Sunshine'], [2.7917, 9.875, 'The thaw'], [9.875, 12.7083, 'Runnin down a dream']],
    draw(g, t, env) { Seg.chorus2.draw(g, t + 76.625, env); },
    post(ctx, t, env) { Cereal.post(ctx, t, env, Seg.chorus2.post(t + 76.625)); },
});
