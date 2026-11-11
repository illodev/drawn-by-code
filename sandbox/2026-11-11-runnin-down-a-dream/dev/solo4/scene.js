// dev: «solo4» on its own (the film's 219.2083–236.1667 s as 0–16.9583 s): add Song.B(155) = 219.2083 to a
// time here for the film's. The moon's bars start at 5.6667 (bar 159); the cut to the moon's surface is at
// 11.2917 (bar 163). solo2-props.js (the hangers) and solo3-props.js (the angels) are optional.
Motion.scene({
    fps: 24, duration: 16.9583, logical: [1000, 1000],
    uses: ['styles/cereal-ad/cereal.js', 'sandbox/2026-11-11-runnin-down-a-dream/song.js', 'sandbox/2026-11-11-runnin-down-a-dream/cast.js', 'sandbox/2026-11-11-runnin-down-a-dream/devil.js',
        'sandbox/2026-11-11-runnin-down-a-dream/band-strings.js', 'sandbox/2026-11-11-runnin-down-a-dream/band-rhythm.js', 'sandbox/2026-11-11-runnin-down-a-dream/rides.js',
        'sandbox/2026-11-11-runnin-down-a-dream/fx.js', 'sandbox/2026-11-11-runnin-down-a-dream/world.js', 'sandbox/2026-11-11-runnin-down-a-dream/rig.js',
        'sandbox/2026-11-11-runnin-down-a-dream/segments/chorus1-props.js', 'sandbox/2026-11-11-runnin-down-a-dream/inferno.js', 'sandbox/2026-11-11-runnin-down-a-dream/skyward.js',
        'sandbox/2026-11-11-runnin-down-a-dream/finale.js', { src: 'sandbox/2026-11-11-runnin-down-a-dream/segments/solo2-props.js', optional: true },
        { src: 'sandbox/2026-11-11-runnin-down-a-dream/segments/solo3-props.js', optional: true },
        'sandbox/2026-11-11-runnin-down-a-dream/segments/solo4-props.js', 'sandbox/2026-11-11-runnin-down-a-dream/segments/solo4.js'],
    fonts: [{ family: 'Anton', src: 'fonts/Anton-latin.woff2' }, { family: 'Hand', src: 'fonts/PatrickHand-Regular.ttf' }],
    bpm: 169.97, beatOffset: 0.356 - 219.2083 + 620 * (60 / 169.97),
    shots: [[0, 5.6667, 'Leaving the air'], [5.6667, 11.2917, 'The moon'], [11.2917, 16.9583, 'Landing']],
    draw(g, t, env) { Seg.solo4.draw(g, t + Song.B(155), env); },
    post(ctx, t, env) { Cereal.post(ctx, t, env, Seg.solo4.post(t + Song.B(155))); },
});
