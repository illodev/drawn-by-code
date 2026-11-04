Motion.scene({ fps: 24, duration: 1, logical: [1600, 900], uses: ['styles/sumi-e/sumi.js'],
    draw(g, t, env) {
        Sumi.paper(g, env, { x: 0, y: 0, w: 1600, h: 900 });
        [0, 0.15, 0.3, 0.45, 0.6, 0.75].forEach((f, i) => Sumi.crane(g, 160 + (i % 3) * 500, 250 + Math.floor(i / 3) * 400, 90, f, { seed: 'c' + i }));
    } });
