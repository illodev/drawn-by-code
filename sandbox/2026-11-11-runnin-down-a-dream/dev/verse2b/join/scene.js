// dev: the join verse2a → verse2b. 0–1 s: the film's 63.4167–64.4167 s (the cut is at 0.5 s),
// through the tape. 2 s: verse2a's last shot evaluated ON verse2b's first frame's time, flat;
// 3 s: verse2b's first frame, flat. Sheets 2 and 3 must be the same picture.
const JOIN_T45 = 63.9167;
Motion.scene({
    fps: 24, duration: 4, logical: [1000, 1000],
    uses: [
        'styles/cereal-ad/cereal.js', 'sandbox/2026-11-11-runnin-down-a-dream/song.js', 'sandbox/2026-11-11-runnin-down-a-dream/cast.js', 'sandbox/2026-11-11-runnin-down-a-dream/devil.js',
        'sandbox/2026-11-11-runnin-down-a-dream/band-strings.js', 'sandbox/2026-11-11-runnin-down-a-dream/band-rhythm.js', 'sandbox/2026-11-11-runnin-down-a-dream/rides.js',
        'sandbox/2026-11-11-runnin-down-a-dream/fx.js', 'sandbox/2026-11-11-runnin-down-a-dream/world.js', 'sandbox/2026-11-11-runnin-down-a-dream/rig.js',
        'sandbox/2026-11-11-runnin-down-a-dream/weather.js', 'sandbox/2026-11-11-runnin-down-a-dream/segments/chorus1-props.js',
        'sandbox/2026-11-11-runnin-down-a-dream/segments/verse2a-props.js', 'sandbox/2026-11-11-runnin-down-a-dream/segments/verse2a.js',
        'sandbox/2026-11-11-runnin-down-a-dream/segments/verse2b-props.js', 'sandbox/2026-11-11-runnin-down-a-dream/segments/verse2b.js',
    ],
    fonts: [{ family: 'Anton', src: 'fonts/Anton-latin.woff2' }],
    draw(g, t, env) {
        const T45 = Song.B(45);
        if (t >= 3 - 1e-6) Seg.verse2b.draw(g, T45, env);
        else if (t >= 2 - 1e-6) Seg.verse2a.draw(g, T45, env);
        else {
            const ft = T45 - 0.5 + t;
            (ft < T45 - 1e-6 ? Seg.verse2a : Seg.verse2b).draw(g, ft, env);
        }
    },
    post(ctx, t, env) { if (t < 2 - 1e-6) Cereal.post(ctx, t, env); },
});
