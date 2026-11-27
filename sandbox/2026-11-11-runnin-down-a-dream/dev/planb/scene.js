// dev: «Plan B» on its own (the film's 48.375–55.417 s as 0–7.04 s)
Motion.scene({
    fps: 24, duration: 7.0417, logical: [1000, 1000],
    uses: ['styles/cereal-ad/cereal.js', 'sandbox/2026-11-11-runnin-down-a-dream/song.js', 'sandbox/2026-11-11-runnin-down-a-dream/cast.js', 'sandbox/2026-11-11-runnin-down-a-dream/devil.js', 'sandbox/2026-11-11-runnin-down-a-dream/fx.js', 'sandbox/2026-11-11-runnin-down-a-dream/segments/planb.js'],
    fonts: [{ family: 'Anton', src: 'fonts/Anton-latin.woff2' }],
    draw(g, t, env) { Seg.planb.draw(g, t + 48.375, env); },
    post(ctx, t, env) { Cereal.post(ctx, t, env); },
});
