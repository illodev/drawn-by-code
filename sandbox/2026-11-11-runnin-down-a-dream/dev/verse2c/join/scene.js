// scratch: verse2b's last shot run on past its end (even seconds) against verse2c (odd ones)
Motion.scene({
    fps: 24, duration: 4, logical: [1000, 1000],
    uses: [
        'styles/cereal-ad/cereal.js', 'sandbox/2026-11-11-runnin-down-a-dream/song.js', 'sandbox/2026-11-11-runnin-down-a-dream/cast.js', 'sandbox/2026-11-11-runnin-down-a-dream/devil.js',
        'sandbox/2026-11-11-runnin-down-a-dream/band-strings.js', 'sandbox/2026-11-11-runnin-down-a-dream/band-rhythm.js', 'sandbox/2026-11-11-runnin-down-a-dream/rides.js',
        'sandbox/2026-11-11-runnin-down-a-dream/fx.js', 'sandbox/2026-11-11-runnin-down-a-dream/world.js', 'sandbox/2026-11-11-runnin-down-a-dream/rig.js',
        'sandbox/2026-11-11-runnin-down-a-dream/weather.js', 'sandbox/2026-11-11-runnin-down-a-dream/segments/planb.js', 'sandbox/2026-11-11-runnin-down-a-dream/segments/chorus1-props.js', 'sandbox/2026-11-11-runnin-down-a-dream/segments/verse2a-props.js',
        'sandbox/2026-11-11-runnin-down-a-dream/segments/verse2b-props.js', 'sandbox/2026-11-11-runnin-down-a-dream/segments/verse2b.js',
        'sandbox/2026-11-11-runnin-down-a-dream/segments/verse2c-props.js', 'sandbox/2026-11-11-runnin-down-a-dream/segments/verse2c.js',
    ],
    fonts: [{ family: 'Anton', src: 'fonts/Anton-latin.woff2' }],
    draw(g, t, env) {
        const who = Math.floor(t + 1e-6), f = Math.round((t - who) * 24), tt = (1703 + f - (who >= 2 ? 0 : 0)) / 24;
        if (who === 0) Seg.verse2b.draw(g, tt, env);
        else if (who === 1) Seg.verse2c.draw(g, tt, env);
        else if (who === 2) Seg.verse2b.draw(g, 1702 / 24, env);
    },
});
