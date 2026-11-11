// dev: «solo3» on its own (the film's 205.0833–219.2083 s as 0–14.125 s): add Song.B(145) = 205.0833 to a time
// here for the film's. The cuts are at 4.25 (bar 148), 7.0833 (bar 150) and 11.2917 (bar 153); the car bursts
// through the cloud floor at 5.6667 (bar 149). solo2-props.js (the hangers) is optional.
Motion.scene({
    fps: 24, duration: 14.125, logical: [1000, 1000],
    uses: ['styles/cereal-ad/cereal.js', 'sandbox/2026-11-11-runnin-down-a-dream/song.js', 'sandbox/2026-11-11-runnin-down-a-dream/cast.js', 'sandbox/2026-11-11-runnin-down-a-dream/devil.js',
        'sandbox/2026-11-11-runnin-down-a-dream/band-strings.js', 'sandbox/2026-11-11-runnin-down-a-dream/band-rhythm.js', 'sandbox/2026-11-11-runnin-down-a-dream/rides.js',
        'sandbox/2026-11-11-runnin-down-a-dream/fx.js', 'sandbox/2026-11-11-runnin-down-a-dream/world.js', 'sandbox/2026-11-11-runnin-down-a-dream/rig.js',
        'sandbox/2026-11-11-runnin-down-a-dream/segments/chorus1-props.js', 'sandbox/2026-11-11-runnin-down-a-dream/inferno.js', 'sandbox/2026-11-11-runnin-down-a-dream/skyward.js',
        'sandbox/2026-11-11-runnin-down-a-dream/finale.js', { src: 'sandbox/2026-11-11-runnin-down-a-dream/segments/solo2-props.js', optional: true },
        'sandbox/2026-11-11-runnin-down-a-dream/segments/solo3-props.js', 'sandbox/2026-11-11-runnin-down-a-dream/segments/solo3.js'],
    fonts: [{ family: 'Anton', src: 'fonts/Anton-latin.woff2' }, { family: 'Hand', src: 'fonts/PatrickHand-Regular.ttf' }],
    bpm: 169.97, beatOffset: 0.356 - 205.0833 + 580 * (60 / 169.97),
    shots: [[0, 4.25, 'Into the cloud'], [4.25, 7.0833, "Heaven's doorstep"], [7.0833, 11.2917, 'They join in'], [11.2917, 14.125, 'Up again']],
    draw(g, t, env) { Seg.solo3.draw(g, t + Song.B(145), env); },
    post(ctx, t, env) { Cereal.post(ctx, t, env, Seg.solo3.post(t + Song.B(145))); },
});
