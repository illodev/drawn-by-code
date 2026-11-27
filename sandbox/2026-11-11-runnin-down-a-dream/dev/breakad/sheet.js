// dev: the props of «breakad» at size, one sheet a second:
//   0  the soul jar, banknotes, a fan, coins, the crate      1  the piggy bank (both ways up), moths, the imp with one arm up
//   2  the telephone, the web, the spider, the banner         3  the kitchen and its table
//   4  the Devil's clenched grin and twitching eye, a sweat drop, the cloud, the card
Motion.scene({
    fps: 24, duration: 5, logical: [1000, 1000],
    uses: [
        'styles/cereal-ad/cereal.js', 'sandbox/2026-11-11-runnin-down-a-dream/song.js', 'sandbox/2026-11-11-runnin-down-a-dream/cast.js', 'sandbox/2026-11-11-runnin-down-a-dream/devil.js',
        'sandbox/2026-11-11-runnin-down-a-dream/fx.js', 'sandbox/2026-11-11-runnin-down-a-dream/segments/breakad-props.js',
    ],
    fonts: [{ family: 'Anton', src: 'fonts/Anton-latin.woff2' }, { family: 'Titan One', src: 'fonts/TitanOne-latin.woff2' }],
    draw(g, t, env) {
        const C = Cereal, K = C.COL, sheet = Math.floor(t + 1e-6), A = BreakAd, d = C.drawing(t);
        C.sunburst(g, 500, 600, { n: 12, rot: 0.2, a: K.purple, b: '#9361f0' });
        g.fillStyle = K.navy;
        g.fillRect(0, 900, 1000, 100);
        if (sheet === 0) {
            A.jar(g, 230, 560, 420, { tw: d });
            A.jar(g, 480, 300, 120, { tw: 1, bob: 1 });
            A.jar(g, 600, 300, 70, { ang: 0.3 });
            A.note(g, 720, 180, 240, 0);
            A.fan(g, 700, 520, 190, 1, 5, 0);
            for (let i = 0; i < 4; i++) A.coin(g, 520 + i * 110, 640, 44, i);
            for (let i = 0; i < 4; i++) A.coin(g, 520 + i * 70, 730, 24, i);
            A.crateBack(g, 330, 880, 200, 130);
            A.jar(g, 290, 820, 100);
            A.jar(g, 370, 812, 100, { tw: 1 });
            A.crateFront(g, 330, 880, 200, 130);
            A.drop(g, 880, 800, 30);
        } else if (sheet === 1) {
            A.pig(g, 270, 300, 400);
            A.pig(g, 740, 290, 300, { ang: Math.PI });
            for (let i = 0; i < 3; i++) A.moth(g, 560 + i * 150, 560, 110, i, i * 0.2);
            const pose = { upL: 0, upR: 1, mood: 'grin', wear: 'bow', tilt: 0.05 };
            A.imp(g, 250, 900, 260, pose);
            const m = A.impMitt(250, 900, 260, pose, 1);
            A.jar(g, m[0], m[1], 110);
            const p2 = { upL: 1.6, upR: 1.6, mood: 'oops' };
            A.imp(g, 720, 900, 190, p2);
            const a = A.impMitt(720, 900, 190, p2, -1), b = A.impMitt(720, 900, 190, p2, 1);
            A.disc(g, a[0], a[1], 5, K.yellow, 0);
            A.disc(g, b[0], b[1], 5, K.yellow, 0);
        } else if (sheet === 2) {
            A.banner(g, 500, 160, 560, 110, -0.03);
            const an = A.phone(g, 520, 860, 560, {});
            A.web(g, an.nook[0], an.nook[1], 220, Math.PI, Math.PI * 1.5 + 0.02, 1);
            C.poly(g, [an.cup, [an.cup[0], an.cup[1] + 120]], { ink: K.ink, lw: 5, close: false });
            C.poly(g, [an.cup, [an.cup[0], an.cup[1] + 120]], { ink: K.white, lw: 2.2, close: false });
            A.spider(g, an.cup[0], an.cup[1] + 120, 80, { d, look: -1 });
            A.spider(g, 880, 300, 120, { d, look: 1, wave: 1 });
        } else if (sheet === 3) {
            A.kitchen(g, t);
            A.table(g, 770, 930, 250);
        } else {
            for (const [i, x] of [[0, 260], [1, 740]]) {
                const pose = { mood: 'grin', look: 1 };
                Devil.draw(g, x, 900, 330, pose);
                A.onHead(g, x, 900, 330, pose, (L) => {
                    A.tightGrin(g, L);
                    if (i) A.twitch(g, L, 1);
                    A.drop(g, -0.4, -1.5, 0.05, 0.2, L * 0.8);
                });
            }
            A.cloud(g, 500, 120, 90);
            A.card(g, 500, 300, 200, 130, 0.05);
        }
    },
});
