// dev: the road in its three weathers. t 0–1 day, 1–2 rain, 2–3 night; the world scrolls.
Motion.scene({
    fps: 24, duration: 3, logical: [1000, 1000],
    uses: ['styles/cereal-ad/cereal.js', 'sandbox/2026-11-11-runnin-down-a-dream/cast.js', 'sandbox/2026-11-11-runnin-down-a-dream/world.js'],
    fonts: [{ family: 'Anton', src: 'fonts/Anton-latin.woff2' }],
    draw(g, t, env) {
        const X = t * 1200, theme = t < 1 ? 'day' : t < 2 ? 'rain' : 'night';
        World.back(g, t, X, theme, theme === 'day' ? { sun: { x: 180, y: 190, r: 74 }, moon: { x: 850, y: 140, r: 40 } } : theme === 'night' ? { moon: { x: 720, y: 270, r: 170 }, stars: 1 } : {});
        Cast.tom(g, 500, World.LANE, 150, { shades: 1 });
        World.front(g, t, X, theme);
        if (theme === 'rain') World.rain(g, t);
    },
    post(ctx, t, env) { Cereal.post(ctx, t, env); },
});
