// dev (temporary): the world behind the work site on the block's last frames, with a ruler
Motion.scene({
    fps: 24, duration: 2, logical: [1000, 1000],
    uses: ['styles/cereal-ad/cereal.js', 'sandbox/2026-11-11-runnin-down-a-dream/song.js', 'sandbox/2026-11-11-runnin-down-a-dream/cast.js', 'sandbox/2026-11-11-runnin-down-a-dream/devil.js',
        'sandbox/2026-11-11-runnin-down-a-dream/band-strings.js', 'sandbox/2026-11-11-runnin-down-a-dream/band-rhythm.js', 'sandbox/2026-11-11-runnin-down-a-dream/rides.js',
        'sandbox/2026-11-11-runnin-down-a-dream/fx.js', 'sandbox/2026-11-11-runnin-down-a-dream/world.js', 'sandbox/2026-11-11-runnin-down-a-dream/rig.js',
        'sandbox/2026-11-11-runnin-down-a-dream/segments/chorus1-props.js',
        'sandbox/2026-11-11-runnin-down-a-dream/segments/verse3a-props.js', 'sandbox/2026-11-11-runnin-down-a-dream/segments/verse3a.js'],
    fonts: [{ family: 'Anton', src: 'fonts/Anton-latin.woff2' }],
    draw(g, t, env) {
        const ft = t < 1 ? Song.b(337) - 2 / 24 : Song.B(85) - 1 / 24;
        World.back(g, ft, Seg.verse3a.cam3(ft), 'night', { stars: 1 });
        g.font = '22px Anton'; g.fillStyle = '#fff';
        for (let x = 0; x <= 1000; x += 50) { g.fillRect(x, x % 100 ? 600 : 560, 2, x % 100 ? 240 : 280); if (x % 100 === 0) g.fillText(String(x), x + 4, 580); }
    },
});
