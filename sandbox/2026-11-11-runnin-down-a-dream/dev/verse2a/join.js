// dev: the join between «Plan B» and verse 2: the last second of segments/planb.js, then the
// block's first second and a half (the film's 54.4167–56.9167 s as 0–2.5 s), assembled as scene.js does it.
Motion.scene({
    fps: 24, duration: 2.5, logical: [1000, 1000],
    uses: [
        'styles/cereal-ad/cereal.js', 'sandbox/2026-11-11-runnin-down-a-dream/song.js', 'sandbox/2026-11-11-runnin-down-a-dream/cast.js', 'sandbox/2026-11-11-runnin-down-a-dream/devil.js',
        'sandbox/2026-11-11-runnin-down-a-dream/band-strings.js', 'sandbox/2026-11-11-runnin-down-a-dream/band-rhythm.js', 'sandbox/2026-11-11-runnin-down-a-dream/rides.js',
        'sandbox/2026-11-11-runnin-down-a-dream/fx.js', 'sandbox/2026-11-11-runnin-down-a-dream/world.js', 'sandbox/2026-11-11-runnin-down-a-dream/rig.js',
        'sandbox/2026-11-11-runnin-down-a-dream/weather.js', 'sandbox/2026-11-11-runnin-down-a-dream/segments/planb.js',
        'sandbox/2026-11-11-runnin-down-a-dream/segments/chorus1-props.js',
        'sandbox/2026-11-11-runnin-down-a-dream/segments/verse2a-props.js', 'sandbox/2026-11-11-runnin-down-a-dream/segments/verse2a.js',
    ],
    fonts: [{ family: 'Anton', src: 'fonts/Anton-latin.woff2' }],
    bpm: 169.97, beatOffset: 0.356 + 156 * (60 / 169.97) - 54.4167 - 8 * (60 / 169.97),
    shots: [[0, 1, 'Plan B'], [1, 2.5, 'Feeling good']],
    setup() { return { seg: (t) => (t >= 55.4167 - 1e-6 ? Seg.verse2a : Seg.planb) }; },
    draw(g, t, env) { env.state.seg(t + 54.4167).draw(g, t + 54.4167, env); },
    post(ctx, t, env) { Cereal.post(ctx, t, env, env.state.seg(t + 54.4167).post(t + 54.4167)); },
});
