// Kit lab: every new sumi-e piece side by side, to crop against the reference (image 5).
Motion.scene({
    fps: 24, duration: 1, logical: [1600, 900],
    uses: ['styles/sumi-e/sumi.js'],
    draw(g, t, env) {
        const S = Sumi;
        S.paper(g, env, { x: 0, y: 0, w: 1600, h: 900 });
        S.halo(g, env, 420, 300, 190, { color: '#555555' });
        S.sun(g, env, 420, 300, 190);
        Motion.sprite('lab:tree', { x: -300, y: -300, w: 1500, h: 1200 }, env.k, (c) => {
            const grown = S.tree(c, {
                seed: 'lab', w: 80, gnarl: 0.8, trunk: [[60, 900], [110, 700], [180, 520], [300, 380]],
                limbs: [
                    { p: [300, 380], a: -0.45, len: 420, w: 34, d: 4 },
                    { p: [250, 430], a: -1.9, len: 260, w: 20, d: 3 },
                    { p: [200, 500], a: 0.25, len: 300, w: 18, d: 3 },
                ],
            });
            S.bloom(c, grown, { seed: 'labb', density: 0.4, size: 15 });
        }).draw(g);
        S.crane(g, 620, 430, 50, 0.1, { seed: 'c1' });
        S.crane(g, 700, 330, 40, 0.55, { seed: 'c2' });
        S.peak(g, env, 'pk1', 1200, 700, 170, 470);
        S.peak(g, env, 'pk2', 1330, 700, 120, 330, { lean: -0.1 });
        Motion.sprite('lab:bits', { x: 800, y: 600, w: 800, h: 300 }, env.k, (c) => {
            S.mountains(c, env, 'labhill', { x0: 820, x1: 1580, y: 760, h: 110, ink: 0.55, peaks: 2 });
            S.foliage(c, 960, 690, 120, 60, { seed: 'f1' });
            S.foliage(c, 1420, 700, 90, 45, { seed: 'f2' });
            S.pagoda(c, 1080, 700, 120, { seed: 'pg' });
            for (let i = 0; i < 4; i++) S.reed(c, 900 + i * 180, 860, 60, { seed: 'rd' + i });
        }).draw(g);
        for (let i = 0; i < 6; i++) S.petal(g, 700 + i * 60, 600 + (i % 2) * 30, 9, i);
    },
    post(ctx, t, env) { Sumi.grain(ctx, env, {}); },
});
