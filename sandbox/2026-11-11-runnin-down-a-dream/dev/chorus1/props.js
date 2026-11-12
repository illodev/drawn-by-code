// dev: the props of chorus 1 at size (one sheet a second; add 0.5 for the next drawing):
//   0  the cactus: on the verge, in the air, at the wheel with the shades coming down   1  the mound, and the hearse coming out of it
//   2  the wave's stages   3  the Devil on the hearse: hunting, hit   4  the same at s = 84 through the tape
Motion.scene({
    fps: 24, duration: 6, logical: [1000, 1000],
    uses: ['styles/cereal-ad/cereal.js', 'sandbox/2026-11-11-runnin-down-a-dream/song.js', 'sandbox/2026-11-11-runnin-down-a-dream/cast.js', 'sandbox/2026-11-11-runnin-down-a-dream/devil.js',
        'sandbox/2026-11-11-runnin-down-a-dream/band-strings.js', 'sandbox/2026-11-11-runnin-down-a-dream/band-rhythm.js', 'sandbox/2026-11-11-runnin-down-a-dream/rides.js',
        'sandbox/2026-11-11-runnin-down-a-dream/fx.js', 'sandbox/2026-11-11-runnin-down-a-dream/world.js', 'sandbox/2026-11-11-runnin-down-a-dream/rig.js',
        'sandbox/2026-11-11-runnin-down-a-dream/segments/chorus1-props.js', 'sandbox/2026-11-11-runnin-down-a-dream/segments/chorus1.js'],
    fonts: [{ family: 'Anton', src: 'fonts/Anton-latin.woff2' }],
    draw(g, t, env) {
        const C = Cereal, K = C.COL, P = Chorus1Props, sheet = Math.floor(t + 1e-6), half = t - sheet > 0.25, d = half ? 1 : 0;
        C.sunburst(g, 500, 500, { n: 14, rot: 0.2, a: K.sky, b: K.aqua });
        const road = (y) => {
            g.fillStyle = '#2f2a6b';
            g.fillRect(0, y - 60, 1000, 100);
            g.fillStyle = '#ffc21f';
            g.fillRect(0, y + 40, 1000, 30);
        };
        if (sheet === 0) {
            P.cactus(g, 130, 480, 200, {});
            P.cactus(g, 400, 480, 200, { lean: -0.3, mouth: 'oh', crumbs: half ? 0.4 : 0.9, wave: half ? 1 : -1 });
            P.cactus(g, 650, 480, 200, { shades: half ? 1 : 0.5, wheel: [0.49, -0.84], wave: half ? 1 : -0.6, squash: half ? 0.05 : 0 });
            P.cactus(g, 880, 480, 200, { shades: 1, squash: 0.2, mouth: 'oh' });
            [100, 250, 400, 550].forEach((x, i) => P.cactus(g, x, 900, 84, [{}, { mouth: 'oh', lean: -0.3, crumbs: 0.6 }, { shades: 1, wheel: [0.49, -0.84] }, { shades: 0.5 }][i]));
            P.cactus(g, 800, 950, 145, { shades: 1, wheel: [0.49, -0.84], wave: half ? 1 : -0.6 });
        } else if (sheet === 1) {
            road(300);
            P.mound(g, 300, 300, 150, { k: 1, d, fork: 1 });
            P.mound(g, 760, 300, 150, { k: 0.75, d, fork: 0.4 });
            road(620);
            P.mound(g, 300, 620, 150, { k: 1, d, out: half ? 0.125 : 0.04, speed: 2 });
            P.eruption(g, 760, 620, 150, half ? 0.2 : 0.04, 2);
            road(900);
            P.mound(g, 200, 900, 84, { k: 0.94, d: 53, fork: 1, out: null, speed: 13.1 });
            P.mound(g, 520, 900, 84, { k: 1, d, out: half ? 0.125 : 0.04, speed: 2 });
            P.eruption(g, 830, 900, 84, half ? 0.3 : 0.1, 2);
        } else if (sheet === 2) {
            [0, 0.042, 0.083, 0.125, 0.17, 0.25].forEach((age, i) => {
                const y = 170 + Math.floor(i / 2) * 300, x = 880 - (i % 2) * 0;
                if (i % 2 === 0) road(y + 150);
                BandRhythm.bassDrum && 0;
                P.wave(g, i % 2 ? 900 : 400, y, 120, age, { ground: y + 140, k: i > 3 ? 1.7 : 1 });
            });
        } else {
            const s = sheet === 3 ? 190 : 84, tt = 40;
            if (sheet === 4) { road(420); road(880); }
            const sc = Seg.chorus1.dev;
            sc.hearse(g, tt, sheet === 3 ? -150 : 100, sheet === 3 ? 480 : 420, s, { devil: sc.hunting(tt + (half ? 1 / 12 : 0), 0, { reach: 0.6 }), smoke: 0.8 });
            sc.hearse(g, tt, sheet === 3 ? -150 : 600, sheet === 3 ? 990 : 420, s, { lean: sheet === 3 ? 0 : 0.15, devil: sc.hunting(tt + (half ? 1 / 12 : 0), 1, {}), skel: { jaw: 1, headTilt: -0.2 } });
            if (sheet === 4) {
                sc.hearse(g, tt, 100, 880, s, { devil: sc.hunting(tt, 0, { reach: 1, mood: 'laugh' }) });
                sc.hearse(g, tt, 600, 880, s, { rot: -0.4, air: true, devil: sc.hunting(tt, 0.2, {}) });
            }
        }
    },
    post(ctx, t, env) { if (Math.floor(t + 1e-6) === 4) Cereal.post(ctx, t, env, { bezel: false }); },
});
