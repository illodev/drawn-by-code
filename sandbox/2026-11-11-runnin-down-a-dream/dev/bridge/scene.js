// dev: the bridge on its own (the film's 168.375–182.5 s as 0–14.125 s): add 168.375 to a time here for the film's.
// The cuts are at 2.8333 (bar 121), 7.0833 (bar 124), 8.5 (bar 125), 10.9583 (the insert, bar 126's last beat) and 11.2917 (bar 127).
Motion.scene({
    fps: 24, duration: 14.125, logical: [1000, 1000],
    uses: ['styles/cereal-ad/cereal.js', 'sandbox/2026-11-11-runnin-down-a-dream/song.js', 'sandbox/2026-11-11-runnin-down-a-dream/cast.js', 'sandbox/2026-11-11-runnin-down-a-dream/devil.js',
        'sandbox/2026-11-11-runnin-down-a-dream/band-strings.js', 'sandbox/2026-11-11-runnin-down-a-dream/band-rhythm.js', 'sandbox/2026-11-11-runnin-down-a-dream/rides.js',
        'sandbox/2026-11-11-runnin-down-a-dream/fx.js', 'sandbox/2026-11-11-runnin-down-a-dream/world.js', 'sandbox/2026-11-11-runnin-down-a-dream/rig.js',
        'sandbox/2026-11-11-runnin-down-a-dream/inferno.js', 'sandbox/2026-11-11-runnin-down-a-dream/segments/chorus1-props.js',
        'sandbox/2026-11-11-runnin-down-a-dream/segments/verse3b-props.js', 'sandbox/2026-11-11-runnin-down-a-dream/segments/chorus3-props.js',
        'sandbox/2026-11-11-runnin-down-a-dream/segments/hellhoof-props.js', 'sandbox/2026-11-11-runnin-down-a-dream/segments/hellhoof.js',
        'sandbox/2026-11-11-runnin-down-a-dream/segments/bridge-props.js', 'sandbox/2026-11-11-runnin-down-a-dream/segments/bridge.js'],
    fonts: [{ family: 'Anton', src: 'fonts/Anton-latin.woff2' }],
    bpm: 169.97,
    beatOffset: 0.356 + 476 * (60 / 169.97) - 168.375,
    shots: [[0, 2.8333, 'The contract'], [2.8333, 7.0833, 'The fire'], [7.0833, 8.5, 'The house'], [8.5, 10.9583, 'The nod'], [10.9583, 11.2917, 'The peg'], [11.2917, 14.125, 'Face to face']],
    draw(g, t, env) { Seg.bridge.draw(g, t + 168.375, env); },
    post(ctx, t, env) { Cereal.post(ctx, t, env, Seg.bridge.post(t + 168.375)); },
});
