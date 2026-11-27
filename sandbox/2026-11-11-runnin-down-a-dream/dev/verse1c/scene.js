// dev: verse 1c («the pit» and the flight) on its own (the film's 28.583–35.667 s as 0–7.08 s)
Motion.scene({
    fps: 24, duration: 7.0833, logical: [1000, 1000],
    uses: ['styles/cereal-ad/cereal.js', 'sandbox/2026-11-11-runnin-down-a-dream/song.js', 'sandbox/2026-11-11-runnin-down-a-dream/cast.js', 'sandbox/2026-11-11-runnin-down-a-dream/devil.js',
        'sandbox/2026-11-11-runnin-down-a-dream/band-strings.js', 'sandbox/2026-11-11-runnin-down-a-dream/band-rhythm.js', 'sandbox/2026-11-11-runnin-down-a-dream/rides.js',
        'sandbox/2026-11-11-runnin-down-a-dream/fx.js', 'sandbox/2026-11-11-runnin-down-a-dream/world.js', 'sandbox/2026-11-11-runnin-down-a-dream/rig.js',
        'sandbox/2026-11-11-runnin-down-a-dream/segments/verse1c-props.js', 'sandbox/2026-11-11-runnin-down-a-dream/segments/verse1c.js'],
    fonts: [{ family: 'Anton', src: 'fonts/Anton-latin.woff2' }],
    bpm: 169.97, beatOffset: 0.356 - 28.5833 + 80 * (60 / 169.97),
    shots: [[0, 2.8333, 'Digging'], [2.8333, 4.25, 'The hop'], [4.25, 7.0833, 'Flying']],
    draw(g, t, env) { Seg.verse1c.draw(g, t + 686 / 24, env); },
    post(ctx, t, env) { Cereal.post(ctx, t, env, Seg.verse1c.post(t + 686 / 24)); },
});
