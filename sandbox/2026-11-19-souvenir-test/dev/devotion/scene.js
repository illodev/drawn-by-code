// Dev sheet for things/devotion.js: the objects of devotion on the emblem's indigo ground.
// One page every 0.1 s, painted on a transparent sheet and laid on the ground, as a rig
// layer is (a cast only falls on paint):
//   0.0  all of them at film size (s = 1)
//   0.1  cirio, incensario, jamsa at 2×      0.2  rosario, lampara, mihrab at 2×
//   0.3  4×: the wax runs and the flame      0.4  4×: the thurible's lid and its chains
//   0.5  4×: six beads; the cross            0.6  4×: the lamp's arcade
//   0.7  4×: the amulet's filigree           0.8  4×: the niche
//   0.9  turned (the light must stay at the top left), other seeds
//   1.0  film size on painted ground, with tooth and the lens finish
//   1.1  4×: the candle's socket; the thurible's bowl
const SV = 'sandbox/2026-11-19-souvenir-test/';
Motion.scene({
    fps: 10, duration: 1.2, logical: [1600, 900],
    uses: ['styles/souvenir/souvenir.js', SV + 'things/devotion.js'],
    draw(g, t, env) {
        const S = Souvenir, D = Devotion, page = Math.round(t * 10);
        g.fillStyle = '#232749';
        g.fillRect(0, 0, 1600, 900);
        let Q = g;
        const put = (name, o) => D[name] && D[name](Q, o);
        const row = () => {
            put('cirio', { x: 130, y: 450 });
            put('incensario', { x: 330, y: 450 });
            put('rosario', { x: 590, y: 450 });
            put('lampara', { x: 880, y: 450 });
            put('jamsa', { x: 1130, y: 450 });
            put('mihrab', { x: 1380, y: 450 });
        };
        const pages = [
            row,
            () => {
                put('cirio', { x: 240, y: 450, s: 2 });
                put('incensario', { x: 700, y: 480, s: 2 });
                put('jamsa', { x: 1250, y: 450, s: 2 });
            },
            () => {
                put('rosario', { x: 290, y: 450, s: 2 });
                put('lampara', { x: 800, y: 450, s: 2 });
                put('mihrab', { x: 1320, y: 450, s: 2 });
            },
            () => {
                put('cirio', { x: 420, y: 1100, s: 4 });
                put('cirio', { x: 1180, y: 660, s: 4 });
            },
            () => {
                put('incensario', { x: 420, y: 160, s: 4 });
                put('incensario', { x: 1200, y: 760, s: 4 });
            },
            () => {
                put('rosario', { x: 760, y: 900, s: 4 });
                put('rosario', { x: 1330, y: 10, s: 4 });
            },
            () => put('lampara', { x: 800, y: 360, s: 4 }),
            () => put('jamsa', { x: 800, y: 420, s: 4 }),
            () => put('mihrab', { x: 800, y: 600, s: 4 }),
            () => {
                put('cirio', { x: 170, y: 450, rot: 0.5, seed: 'b' });
                put('cirio', { x: 430, y: 450, rot: -2.4, s: 0.8, seed: 'c' });
                put('incensario', { x: 650, y: 280, rot: 0.3, s: 0.8 });
                put('incensario', { x: 690, y: 700, rot: Math.PI / 2, s: 0.8, seed: 'b' });
                put('rosario', { x: 960, y: 240, rot: 1.2, s: 0.8, seed: 'b' });
                put('lampara', { x: 980, y: 640, rot: -0.4, s: 0.9 });
                put('jamsa', { x: 1250, y: 230, rot: 0.6 });
                put('jamsa', { x: 1460, y: 300, rot: Math.PI, seed: 'b' });
                put('mihrab', { x: 1330, y: 650, rot: 0.25, s: 0.8 });
            },
            row,
            () => {
                put('cirio', { x: 420, y: -280, s: 4 });
                put('incensario', { x: 1150, y: 20, s: 4 });
            },
        ];
        if (page === 10) {
            // straight on the ground: every cast falls on the night's paint
            Q = g;
            row();
            S.tooth(g, { x: 0, y: 0, w: 1600, h: 900 });
        } else {
            const sheet = Motion.layer(env, 'devotion-' + page, (q) => {
                Q = q;
                pages[page % pages.length]();
            });
            Motion.drawLayer(g, env, sheet);
        }
    },
    post(ctx, t, env) {
        if (Math.round(t * 10) === 10) Souvenir.finish(ctx, env, 0);
    },
});
