// dev: the hidden frame of «REW» without the tape, to check its pieces. Each second is a
// view (0 the whole plate, 1 the face, 2 the imp, 3 the fork, 4 the table, 5 the lettering)
// and the fraction of the second runs the plate's clock from the stop (× 3 s).
Motion.scene({
    fps: 24, duration: 6, logical: [1000, 1000],
    uses: ['styles/cereal-ad/cereal.js', 'sandbox/2026-11-11-runnin-down-a-dream/song.js', 'sandbox/2026-11-11-runnin-down-a-dream/cast.js', 'sandbox/2026-11-11-runnin-down-a-dream/devil.js',
        'sandbox/2026-11-11-runnin-down-a-dream/segments/breakrew-props.js'],
    fonts: [{ family: 'Anton', src: 'fonts/Anton-latin.woff2' }, { family: 'Titan One', src: 'fonts/TitanOne-latin.woff2' }],
    draw(g, t, env) {
        const view = Math.floor(t + 1e-6), u = t - view, k = 304;
        const [cx, cy, z] = [[500, 500, 1], [400, 650, 2.6], [770, 790, 3.2], [170, 620, 3], [400, 850, 2.4], [500, 260, 1.9]][view];
        g.save();
        g.translate(500, 500);
        g.scale(z, z);
        g.translate(-cx, -cy);
        BreakrewProps.card(g, Song.b(k) + u * 3, k);
        g.restore();
    },
});
