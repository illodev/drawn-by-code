// dev: «solo5» on its own (the film's 236.1667–253.125 s as 0–16.96 s): the concert on the moon and the poster
(() => {
    const E = 'sandbox/2026-11-11-runnin-down-a-dream/', T0 = 236.1667;
    Motion.scene({
        fps: 24, duration: 16.9583, logical: [1000, 1000],
        uses: ['styles/cereal-ad/cereal.js', ...['song.js', 'cast.js', 'devil.js', 'band-strings.js', 'band-rhythm.js', 'rides.js', 'fx.js', 'world.js', 'rig.js', 'weather.js',
            'segments/chorus1-props.js', 'segments/verse2a-props.js', 'segments/verse2c-props.js', 'segments/verse3b-props.js', 'inferno.js', 'skyward.js', 'finale.js',
            'segments/solo2-props.js', 'segments/solo3-props.js'].map((f) => E + f),
            { src: E + 'segments/solo4-props.js', optional: true }, E + 'segments/solo5-props.js', E + 'segments/solo5.js'],
        fonts: [{ family: 'Anton', src: 'fonts/Anton-latin.woff2' }, { family: 'Hand', src: 'fonts/PatrickHand-Regular.ttf' }],
        bpm: 169.97, beatOffset: 0.356 + 668 * (60 / 169.97) - T0,
        shots: [[0, 1.4167, 'Two crowds'], [1.4167, 2.8333, 'The swap'], [2.8333, 4.25, 'Together'], [4.25, 7.0417, 'The trade'], [7.0417, 8.4583, 'One line'], [8.4583, 12.7083, 'Everybody'], [12.7083, 16.9583, 'The poster']],
        draw(g, t, env) { Seg.solo5.draw(g, t + T0, env); },
        post(ctx, t, env) { Cereal.post(ctx, t, env, Seg.solo5.post(t + T0)); },
    });
})();
