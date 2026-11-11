// dev: «solo1» on its own (the film's 182.5–193.7917 s as 0–11.2917 s): add Song.B(129) = 182.5 to a time here for the film's.
// The cuts are at 2.8333 (bar 131), 3.875, 4.5833, 5.6667 (bar 133), 7.0833 (bar 134), 8.4583 (bar 135) and 9.875 (bar 136);
// a whip pan at 6.375. dev/solo1/sheet.js lays the block's props out at size (render it with --at 0,1.1667,2,3).
Motion.scene({
    fps: 24, duration: 11.2917, logical: [1000, 1000],
    uses: ['styles/cereal-ad/cereal.js', 'sandbox/2026-11-11-runnin-down-a-dream/song.js', 'sandbox/2026-11-11-runnin-down-a-dream/cast.js', 'sandbox/2026-11-11-runnin-down-a-dream/devil.js',
        'sandbox/2026-11-11-runnin-down-a-dream/band-strings.js', 'sandbox/2026-11-11-runnin-down-a-dream/band-rhythm.js', 'sandbox/2026-11-11-runnin-down-a-dream/rides.js',
        'sandbox/2026-11-11-runnin-down-a-dream/fx.js', 'sandbox/2026-11-11-runnin-down-a-dream/world.js', 'sandbox/2026-11-11-runnin-down-a-dream/rig.js',
        'sandbox/2026-11-11-runnin-down-a-dream/inferno.js', 'sandbox/2026-11-11-runnin-down-a-dream/segments/chorus1-props.js',
        'sandbox/2026-11-11-runnin-down-a-dream/segments/verse3b-props.js', 'sandbox/2026-11-11-runnin-down-a-dream/segments/chorus3-props.js',
        'sandbox/2026-11-11-runnin-down-a-dream/segments/hellhoof-props.js', 'sandbox/2026-11-11-runnin-down-a-dream/segments/hellhoof.js',
        'sandbox/2026-11-11-runnin-down-a-dream/segments/bridge-props.js', 'sandbox/2026-11-11-runnin-down-a-dream/segments/bridge.js',
        'sandbox/2026-11-11-runnin-down-a-dream/segments/solo1-props.js', 'sandbox/2026-11-11-runnin-down-a-dream/segments/solo1.js'],
    fonts: [{ family: 'Anton', src: 'fonts/Anton-latin.woff2' }],
    bpm: 169.97,
    beatOffset: 0.356 + 516 * (60 / 169.97) - 182.5,
    shots: [[0, 2.8333, 'First phrase'], [2.8333, 3.875, 'The answer'], [3.875, 4.5833, 'The eyebrow'], [4.5833, 5.6667, 'Tennis'], [5.6667, 7.0833, 'Trading'], [7.0833, 8.4583, 'The clash'], [8.4583, 9.875, 'Back to back'], [9.875, 11.2917, 'The floor']],
    draw(g, t, env) { Seg.solo1.draw(g, t + Song.B(129), env); },
    post(ctx, t, env) { Cereal.post(ctx, t, env, Seg.solo1.post(t + Song.B(129))); },
});
