// dev: verse 3's last block on its own (the film's 120.375–131.667 s as 0–11.29 s)
Motion.scene({
    fps: 24, duration: 11.2917, logical: [1000, 1000],
    uses: ['styles/cereal-ad/cereal.js', 'sandbox/2026-11-11-runnin-down-a-dream/song.js', 'sandbox/2026-11-11-runnin-down-a-dream/cast.js', 'sandbox/2026-11-11-runnin-down-a-dream/devil.js',
        'sandbox/2026-11-11-runnin-down-a-dream/band-strings.js', 'sandbox/2026-11-11-runnin-down-a-dream/band-rhythm.js', 'sandbox/2026-11-11-runnin-down-a-dream/rides.js',
        'sandbox/2026-11-11-runnin-down-a-dream/fx.js', 'sandbox/2026-11-11-runnin-down-a-dream/world.js', 'sandbox/2026-11-11-runnin-down-a-dream/rig.js',
        'sandbox/2026-11-11-runnin-down-a-dream/segments/chorus1-props.js',
        'sandbox/2026-11-11-runnin-down-a-dream/segments/verse3b-props.js', 'sandbox/2026-11-11-runnin-down-a-dream/segments/verse3b.js'],
    fonts: [{ family: 'Anton', src: 'fonts/Anton-latin.woff2' }],
    bpm: 169.97,
    beatOffset: 0.356 + 340 * (60 / 169.97) - 120.375,
    shots: [[0, 2.8333, 'Billboards'], [2.8333, 5.6667, 'The trap'], [5.6667, 8.4583, 'Pickin up'], [8.4583, 11.2917, 'Down the hatch']],
    draw(g, t, env) { Seg.verse3b.draw(g, t + 120.375, env); },
    post(ctx, t, env) { Cereal.post(ctx, t, env, Seg.verse3b.post(t + 120.375)); },
});
