// dev: the Devil's sheet (no tape finish at t < 0.5, through the tape after)
Motion.scene({
    fps: 24, duration: 1, logical: [1600, 1000],
    uses: ['styles/cereal-ad/cereal.js', 'sandbox/2026-11-11-runnin-down-a-dream/cast.js', 'sandbox/2026-11-11-runnin-down-a-dream/devil.js'],
    fonts: [{ family: 'Anton', src: 'fonts/Anton-latin.woff2' }],
    draw(g, t, env) {
        const C = Cereal, K = C.COL;
        g.fillStyle = K.aqua; g.fillRect(0, 0, 1600, 1000);
        g.fillStyle = K.navy; g.fillRect(0, 930, 1600, 70);
        Devil.draw(g, 430, 940, 400, { mood: 'grin', trident: true, contract: true, tail: 0.02 });
        Devil.draw(g, 1010, 470, 190, { mood: 'angry', tail: -0.04, handR: [-0.6, -0.9], handL: [0.6, -0.9] });
        Devil.draw(g, 1380, 470, 190, { mood: 'shock', contract: { open: 1 }, handL: [0.62, -0.6] });
        Devil.draw(g, 1010, 940, 190, { mood: 'laugh', trident: { ang: 0.12 }, squash: 0.04 });
        Devil.draw(g, 1300, 940, 190, { mood: 'sly', look: 1, step: 1 });
        Cast.tom(g, 1500, 940, 190, { shades: 1 });
    },
    post(ctx, t, env) { if (t >= 0.5) Cereal.post(ctx, t, env, { bezel: false }); },
});
