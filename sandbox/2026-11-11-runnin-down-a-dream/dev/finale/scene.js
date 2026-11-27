// dev: the finale's ride on the climb. One second of dev time = 2 s of film from bar 141.
Motion.scene({
    fps: 24, duration: 20, logical: [1000, 1000],
    uses: ['styles/cereal-ad/cereal.js', 'sandbox/2026-11-11-runnin-down-a-dream/song.js', 'sandbox/2026-11-11-runnin-down-a-dream/cast.js', 'sandbox/2026-11-11-runnin-down-a-dream/devil.js',
        'sandbox/2026-11-11-runnin-down-a-dream/band-strings.js', 'sandbox/2026-11-11-runnin-down-a-dream/band-rhythm.js', 'sandbox/2026-11-11-runnin-down-a-dream/rides.js', 'sandbox/2026-11-11-runnin-down-a-dream/fx.js',
        'sandbox/2026-11-11-runnin-down-a-dream/world.js', 'sandbox/2026-11-11-runnin-down-a-dream/rig.js', 'sandbox/2026-11-11-runnin-down-a-dream/segments/chorus1-props.js',
        'sandbox/2026-11-11-runnin-down-a-dream/inferno.js', 'sandbox/2026-11-11-runnin-down-a-dream/skyward.js', 'sandbox/2026-11-11-runnin-down-a-dream/finale.js'],
    fonts: [{ family: 'Anton', src: 'fonts/Anton-latin.woff2' }, { family: 'Hand', src: 'fonts/PatrickHand-Regular.ttf' }],
    draw(g, t, env) {
        const ft = Song.B(141) + t * 2, Y = Finale.Y(ft), c = Finale.CAR;
        Skyward.ascent(g, ft, Y, { speedLines: 0.4 });
        Finale.ride(g, ft, c.x, c.y, c.s, { spin: ft * 12 });
        Skyward.ascentFront(g, ft, Y, { speedLines: 0.4 });
    },
    post(ctx, t, env) { Cereal.post(ctx, t, env); },
});
