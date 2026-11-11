// temp: solo4's moon scene from its last frame on, to match against
(() => {
    const E = 'sandbox/2026-11-11-runnin-down-a-dream/', T0 = 236.1667;
    Motion.scene({
        fps: 24, duration: 4, logical: [1000, 1000],
        uses: ['styles/cereal-ad/cereal.js', ...['song.js', 'cast.js', 'devil.js', 'band-strings.js', 'band-rhythm.js', 'rides.js', 'fx.js', 'world.js', 'rig.js', 'weather.js',
            'segments/chorus1-props.js', 'inferno.js', 'skyward.js', 'finale.js', 'segments/solo2-props.js', 'segments/solo3-props.js', 'segments/solo4-props.js'].map((f) => E + f)],
        fonts: [{ family: 'Anton', src: 'fonts/Anton-latin.woff2' }],
        draw(g, t, env) { Solo4Props.moonScene(g, t + T0); },
        post(ctx, t, env) { Cereal.post(ctx, t, env); },
    });
})();
