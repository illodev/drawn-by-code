// dev: «fade» on its own (the film's 253.125–264 s as 0–10.875 s): add 253.125 (6075 frames) to a time here for the film's.
// The camera starts in at 4.5833; the tape runs out at 7.0417 (bar 184); the signature is typed from 7.875.
Motion.scene({
    fps: 24, duration: 10.875, logical: [1000, 1000],
    uses: ['styles/cereal-ad/cereal.js', 'sandbox/2026-11-11-runnin-down-a-dream/song.js', 'sandbox/2026-11-11-runnin-down-a-dream/cast.js', 'sandbox/2026-11-11-runnin-down-a-dream/devil.js',
        'sandbox/2026-11-11-runnin-down-a-dream/fx.js', 'sandbox/2026-11-11-runnin-down-a-dream/band-strings.js', 'sandbox/2026-11-11-runnin-down-a-dream/band-rhythm.js',
        'sandbox/2026-11-11-runnin-down-a-dream/rides.js', 'sandbox/2026-11-11-runnin-down-a-dream/rig.js', 'sandbox/2026-11-11-runnin-down-a-dream/world.js',
        'sandbox/2026-11-11-runnin-down-a-dream/inferno.js', 'sandbox/2026-11-11-runnin-down-a-dream/skyward.js',
        'sandbox/2026-11-11-runnin-down-a-dream/segments/fade-props.js', 'sandbox/2026-11-11-runnin-down-a-dream/segments/fade.js'],
    fonts: [{ family: 'Anton', src: 'fonts/Anton-latin.woff2' }, { family: 'Hand', src: 'fonts/PatrickHand-Regular.ttf' }],
    bpm: 169.97, beatOffset: 0.356 - 6075 / 24 + 716 * (60 / 169.97),
    shots: [[0, 1.375, 'Home'], [1.375, 4.5833, 'The frame'], [4.5833, 7.0417, 'To my #1 fan'], [7.0417, 10.875, 'STOP']],
    draw(g, t, env) { Seg.fade.draw(g, t + 6075 / 24, env); },
    post(ctx, t, env) { Cereal.post(ctx, t, env, Seg.fade.post(t + 6075 / 24)); },
});
