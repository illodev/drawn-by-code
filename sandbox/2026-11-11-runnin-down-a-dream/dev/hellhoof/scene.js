// dev: «hellhoof» on its own (the film's 155.6667–168.375 s as 0–12.71 s): add 155.6667 to a time here for the film's.
// The cuts are at 1.4167 (bar 111), 2.8333 (bar 112), 7.0833 (bar 115) and 11.2917 (bar 118).
Motion.scene({
    fps: 24, duration: 12.7083, logical: [1000, 1000],
    uses: ['styles/cereal-ad/cereal.js', 'sandbox/2026-11-11-runnin-down-a-dream/song.js', 'sandbox/2026-11-11-runnin-down-a-dream/cast.js', 'sandbox/2026-11-11-runnin-down-a-dream/devil.js',
        'sandbox/2026-11-11-runnin-down-a-dream/band-strings.js', 'sandbox/2026-11-11-runnin-down-a-dream/band-rhythm.js', 'sandbox/2026-11-11-runnin-down-a-dream/rides.js',
        'sandbox/2026-11-11-runnin-down-a-dream/fx.js', 'sandbox/2026-11-11-runnin-down-a-dream/world.js', 'sandbox/2026-11-11-runnin-down-a-dream/rig.js',
        'sandbox/2026-11-11-runnin-down-a-dream/inferno.js', 'sandbox/2026-11-11-runnin-down-a-dream/segments/chorus1-props.js',
        'sandbox/2026-11-11-runnin-down-a-dream/segments/hellhoof-props.js', 'sandbox/2026-11-11-runnin-down-a-dream/segments/hellhoof.js'],
    fonts: [{ family: 'Anton', src: 'fonts/Anton-latin.woff2' }],
    bpm: 169.97, beatOffset: 0.356 - 3736 / 24 + 440 * (60 / 169.97),
    shots: [[0, 1.4167, 'Arms crossed'], [1.4167, 2.8333, 'The hoof'], [2.8333, 7.0833, 'One part at a time'], [7.0833, 11.2917, 'Nobody is watching'], [11.2917, 12.7083, 'The contract']],
    draw(g, t, env) { Seg.hellhoof.draw(g, t + 3736 / 24, env); },
    post(ctx, t, env) { Cereal.post(ctx, t, env, Seg.hellhoof.post(t + 3736 / 24)); },
});
