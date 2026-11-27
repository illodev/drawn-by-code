// dev: «solo2» on its own (the film's 193.7917–205.0833 s as 0–11.2917 s): add Song.B(137) = 193.7917 to a time
// here for the film's. The cuts are at 2.8333 (bar 139), 4.25 (bar 140) and 5.6667 (bar 141); the chord is at
// 1.4167 (bar 138), the roof breaks at 4.9583, the road bursts at 6.0. The props at size: dev/solo2/sheet.js.
Motion.scene({
    fps: 24, duration: 11.2917, logical: [1000, 1000],
    uses: ['styles/cereal-ad/cereal.js', 'sandbox/2026-11-11-runnin-down-a-dream/song.js', 'sandbox/2026-11-11-runnin-down-a-dream/cast.js', 'sandbox/2026-11-11-runnin-down-a-dream/devil.js',
        'sandbox/2026-11-11-runnin-down-a-dream/band-strings.js', 'sandbox/2026-11-11-runnin-down-a-dream/band-rhythm.js', 'sandbox/2026-11-11-runnin-down-a-dream/rides.js',
        'sandbox/2026-11-11-runnin-down-a-dream/fx.js', 'sandbox/2026-11-11-runnin-down-a-dream/world.js', 'sandbox/2026-11-11-runnin-down-a-dream/rig.js',
        'sandbox/2026-11-11-runnin-down-a-dream/inferno.js', 'sandbox/2026-11-11-runnin-down-a-dream/segments/chorus1-props.js',
        'sandbox/2026-11-11-runnin-down-a-dream/segments/verse3b-props.js', 'sandbox/2026-11-11-runnin-down-a-dream/segments/chorus3-props.js',
        'sandbox/2026-11-11-runnin-down-a-dream/segments/hellhoof-props.js', 'sandbox/2026-11-11-runnin-down-a-dream/segments/hellhoof.js',
        'sandbox/2026-11-11-runnin-down-a-dream/segments/bridge-props.js', 'sandbox/2026-11-11-runnin-down-a-dream/segments/bridge.js',
        'sandbox/2026-11-11-runnin-down-a-dream/skyward.js', 'sandbox/2026-11-11-runnin-down-a-dream/finale.js',
        'sandbox/2026-11-11-runnin-down-a-dream/segments/solo2-props.js', 'sandbox/2026-11-11-runnin-down-a-dream/segments/solo2.js'],
    fonts: [{ family: 'Anton', src: 'fonts/Anton-latin.woff2' }, { family: 'Hand', src: 'fonts/PatrickHand-Regular.ttf' }],
    bpm: 169.97, beatOffset: 0.356 - 193.7917 + 548 * (60 / 169.97),
    shots: [[0, 2.8333, 'Rumble'], [2.8333, 4.25, 'The plug pops'], [4.25, 5.6667, 'Through the roof'], [5.6667, 11.2917, 'Out']],
    draw(g, t, env) { Seg.solo2.draw(g, t + Song.B(137), env); },
    post(ctx, t, env) { Cereal.post(ctx, t, env, Seg.solo2.post(t + Song.B(137))); },
});
