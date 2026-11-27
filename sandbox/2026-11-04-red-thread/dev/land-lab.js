// Landscape lab (round 3): the reference's middle band rebuilt piece by piece, opaque.
Motion.scene({ fps: 24, duration: 1, logical: [1600, 900], uses: ['styles/sumi-e/sumi.js'],
    draw(g, t, env) {
        const S = Sumi;
        S.paper(g, env, { x: 0, y: 0, w: 1600, h: 900 });
        Motion.sprite('land:all', { x: 0, y: 0, w: 1600, h: 900 }, env.k, (c) => {
            // far hills, then nearer ones that hide them
            S.foliage(c, 230, 520, 90, 140, { seed: 'fa', ink: 0.85 });
            S.pagoda(c, 170, 540, 260, { seed: 'pg' });
            S.hill(c, { x0: 260, x1: 900, base: 640, h: 230, peaks: 1.6, seed: 'hA', ink: 0.9 });
            S.hill(c, { x0: 700, x1: 1150, base: 650, h: 110, peaks: 1.2, seed: 'hB', ink: 0.75 });
            S.pavilion(c, 1010, 520, 190, { seed: 'pv' });
            S.foliage(c, 1120, 540, 160, 80, { seed: 'fb', ink: 0.9 });
            S.hill(c, { x0: 20, x1: 640, base: 690, h: 140, peaks: 1.1, seed: 'hC', ink: 0.85, mist: 0.6 });
            S.foliage(c, 80, 640, 120, 90, { seed: 'fc', ink: 0.9 });
            S.hill(c, { x0: 820, x1: 1550, base: 690, h: 90, peaks: 1.5, seed: 'hD', ink: 0.7, mist: 0.6 });
        }).draw(g);
        S.peak(g, env, 'pkB', 1330, 640, 110, 330, { shoulder: 0.85, slant: -0.05 });
        S.peak(g, env, 'pkA', 1170, 640, 190, 470, { shoulder: 0.62 });
        Motion.sprite('land:fore', { x: 1100, y: 500, w: 500, h: 400 }, env.k, (c) => {
            S.torii(c, 1390, 820, 230, { seed: 'tr' });
            S.reed(c, 1200, 850, 60, { seed: 'r1' });
            S.reed(c, 1520, 840, 50, { seed: 'r2' });
        }).draw(g);
    },
    post(ctx, t, env) { Sumi.grain(ctx, env, { amount: 0.5 }); } });
