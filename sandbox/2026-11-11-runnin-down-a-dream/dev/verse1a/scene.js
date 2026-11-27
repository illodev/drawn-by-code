// dev: «verse1a» on its own (the film's 17.2917–24.375 s as 0–7.08 s): bars 12–13 «Cruising»,
// bars 14–16 «The hitchhiker».
Motion.scene({
    fps: 24, duration: 7.0833, logical: [1000, 1000],
    uses: [
        'styles/cereal-ad/cereal.js', 'sandbox/2026-11-11-runnin-down-a-dream/song.js', 'sandbox/2026-11-11-runnin-down-a-dream/cast.js', 'sandbox/2026-11-11-runnin-down-a-dream/devil.js',
        'sandbox/2026-11-11-runnin-down-a-dream/band-strings.js', 'sandbox/2026-11-11-runnin-down-a-dream/band-rhythm.js', 'sandbox/2026-11-11-runnin-down-a-dream/rides.js',
        'sandbox/2026-11-11-runnin-down-a-dream/fx.js', 'sandbox/2026-11-11-runnin-down-a-dream/world.js', 'sandbox/2026-11-11-runnin-down-a-dream/rig.js',
        'sandbox/2026-11-11-runnin-down-a-dream/segments/verse1a-props.js', 'sandbox/2026-11-11-runnin-down-a-dream/segments/verse1a.js',
    ],
    fonts: [{ family: 'Anton', src: 'fonts/Anton-latin.woff2' }],
    bpm: 169.97, beatOffset: 0.0084,
    shots: [[0, 2.8333, 'Cruising'], [2.8333, 7.0833, 'Hitchhiker']],
    draw(g, t, env) { Seg.verse1a.draw(g, t + 17.2917, env); },
    post(ctx, t, env) { Cereal.post(ctx, t, env, Seg.verse1a.post(t + 17.2917)); },
});
