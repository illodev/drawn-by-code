// dev: «hellplug» on its own (the film's 144.375–155.6667 s as 0–11.29 s): add 144.375 to a time here for the film's.
// The cuts are at 3.5417 (beat 418), 8.4583 (bar 108) and 9.875 (bar 109); the lights go out at 2.8333 (bar 104)
// and come back at 5.6667 (bar 106).
Motion.scene({
    fps: 24, duration: 11.2917, logical: [1000, 1000],
    uses: ['styles/cereal-ad/cereal.js', 'sandbox/2026-11-11-runnin-down-a-dream/song.js', 'sandbox/2026-11-11-runnin-down-a-dream/cast.js', 'sandbox/2026-11-11-runnin-down-a-dream/devil.js',
        'sandbox/2026-11-11-runnin-down-a-dream/band-strings.js', 'sandbox/2026-11-11-runnin-down-a-dream/band-rhythm.js', 'sandbox/2026-11-11-runnin-down-a-dream/rides.js',
        'sandbox/2026-11-11-runnin-down-a-dream/fx.js', 'sandbox/2026-11-11-runnin-down-a-dream/world.js', 'sandbox/2026-11-11-runnin-down-a-dream/rig.js',
        'sandbox/2026-11-11-runnin-down-a-dream/inferno.js', 'sandbox/2026-11-11-runnin-down-a-dream/segments/chorus1-props.js',
        'sandbox/2026-11-11-runnin-down-a-dream/segments/verse3b-props.js', 'sandbox/2026-11-11-runnin-down-a-dream/segments/chorus3-props.js', // what chorus 3 left in the house
        'sandbox/2026-11-11-runnin-down-a-dream/segments/hellplug-props.js', 'sandbox/2026-11-11-runnin-down-a-dream/segments/hellplug.js'],
    fonts: [{ family: 'Anton', src: 'fonts/Anton-latin.woff2' }],
    bpm: 169.97, beatOffset: 0.356 - 144.375 + 408 * (60 / 169.97),
    shots: [[0, 3.5417, 'The plug'], [3.5417, 5.6667, 'Lighters'], [5.6667, 8.4583, 'Chorus 4'], [8.4583, 9.875, 'Sing along'], [9.875, 11.2917, 'Full tilt']],
    draw(g, t, env) { Seg.hellplug.draw(g, t + 144.375, env); },
    post(ctx, t, env) { Cereal.post(ctx, t, env, Seg.hellplug.post(t + 144.375)); },
});
