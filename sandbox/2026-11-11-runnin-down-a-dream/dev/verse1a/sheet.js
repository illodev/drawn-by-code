// dev: the props of «verse1a» at size, one sheet a second:
//   0  the disguise on the Devil at s = 300      1  hat, glasses, both faces of the sign, a star, loose
//   2  the whirl's three drawings at s = 250     3  the sign on his horns, the cactus dressed
Motion.scene({
    fps: 24, duration: 4, logical: [1000, 1000],
    uses: [
        'styles/cereal-ad/cereal.js', 'sandbox/2026-11-11-runnin-down-a-dream/song.js', 'sandbox/2026-11-11-runnin-down-a-dream/cast.js', 'sandbox/2026-11-11-runnin-down-a-dream/devil.js',
        'sandbox/2026-11-11-runnin-down-a-dream/world.js', 'sandbox/2026-11-11-runnin-down-a-dream/segments/verse1a-props.js',
    ],
    fonts: [{ family: 'Anton', src: 'fonts/Anton-latin.woff2' }],
    draw(g, t, env) {
        const C = Cereal, K = C.COL, sheet = Math.floor(t + 1e-6), V = V1A;
        C.sunburst(g, 500, 600, { n: 12, rot: 0.2, a: K.sky, b: '#8fe6f0' });
        g.fillStyle = '#ffc21f';
        g.fillRect(0, 900, 1000, 100);
        if (sheet === 0) {
            const pose = { mood: 'laugh', tail: 0.03, handR: [-0.5, -0.56], handL: [0.5, -0.56], headTilt: 0.04 };
            Devil.draw(g, 500, 900, 300, pose);
            V.onHead(g, 500, 900, 300, pose, (L) => {
                V.glassesOn(g, L);
                V.hatOn(g, L);
            });
            V.units(g, 500, 900, 300, 0, (L) => {
                g.save();
                g.translate(0, -0.56);
                g.rotate(-0.03);
                V.sign(g, L, 'front');
                g.restore();
                V.mitt(g, L, -0.5, -0.86);
                V.mitt(g, L, 0.5, -0.87);
            });
        } else if (sheet === 1) {
            V.units(g, 270, 300, 300, -0.2, (L) => V.hat(g, L));
            V.units(g, 730, 260, 300, 0.25, (L) => V.glasses(g, L, { arms: 'open' }));
            V.units(g, 270, 560, 300, 0.05, (L) => V.sign(g, L, 'front'));
            V.units(g, 730, 560, 300, -0.06, (L) => V.sign(g, L, 'back'));
            V.star(g, 200, 800, 50, 0.2);
            V.star(g, 330, 800, 30, -0.3);
            V.streaks(g, 'a', [450, 720, 500, 160], { n: 8 });
            V.puffs(g, [[120, 880, 40, 6, 0.3], [170, 860, 30, 5, 1]], '#fff1c4');
        } else if (sheet === 2) {
            for (let i = 0; i < 3; i++) V.units(g, 180 + i * 320, 900, 250, [0.05, -0.04, 0.02][i], (L) => V.whirl(g, L, i, i === 2 ? 0.4 : 1));
        } else {
            const pose = { mood: 'angry', tail: -0.03, handR: [-0.62, -0.42], handL: [0.62, -0.42] };
            Devil.draw(g, 330, 900, 250, pose);
            V.onHead(g, 330, 900, 250, pose, (L) => {
                g.save();
                g.translate(0.02, -2.48);
                g.rotate(0.04);
                V.sign(g, L, 'back');
                g.restore();
                V.hornsAbove(g, L, -2.2);
            });
            V.cactus(g, 780, 900, 560, { flower: false });
            V.units(g, 780, 900 - 560 + 120, 200, 0, (L) => V.glasses(g, L, { arms: 'worn' }));
            V.units(g, 780, 900 - 560 + 22, 200, 0.08, (L) => V.hat(g, L));
            V.bush(g, 560, 900, 110, { seed: 1 });
        }
    },
});
