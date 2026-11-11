// dev: character sheet (no tape finish), to judge the drawing at full size
Motion.scene({
    fps: 24, duration: 1, logical: [1800, 1000],
    uses: ['styles/cereal-ad/cereal.js', 'sandbox/2026-11-11-runnin-down-a-dream/cast.js'],
    fonts: [{ family: 'Anton', src: 'fonts/Anton-latin.woff2' }],
    draw(g, t, env) {
        g.fillStyle = '#a888f5'; g.fillRect(0, 0, 1800, 1000);
        Cast.tom(g, 330, 960, 480, { strum: -0.6 });
        Cast.tom(g, 930, 960, 480, { mouth: 'sing', shades: 1, strum: 0.8, sway: 0.03, fret: 0.8 });
        g.fillStyle = '#f9c22e'; g.fillRect(1250, 0, 550, 1000);
        const lay = Motion.layer(env, 'print', (c) => Cast.tom(c, 1530, 960, 480, { strum: 0 }, Cast.print(Cast.TOM)));
        g.globalCompositeOperation = 'multiply'; Motion.drawLayer(g, env, lay); g.globalCompositeOperation = 'source-over';
    },
});
