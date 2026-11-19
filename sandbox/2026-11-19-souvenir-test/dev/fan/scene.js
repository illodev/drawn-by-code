// Dev sheet for things/fan.js: the emblem's two fans on the indigo ground, placed as in
// the film (frame centre = (800, 450)), then close-ups. Every page is painted on a
// transparent sheet first, as a rig layer is (the fan casts with `source-atop`), and laid on
// the night. One page every 1/8 s (3 frames):
//   0      both fans at film size, raw paint
//   0.125  Granada: the Alhambra at 2×        0.25   at 4×
//   0.375  Seville: the Giralda and the Torre del Oro at 2×   0.5  the Giralda at 4×
//   0.625  the Torre del Oro at 4×
//   0.75   a stretch of lace at 2×            0.875  at 4×
//   1      three sticks at 2×                 1.125  at 4×
//   1.25   the front guard at 2×              1.375  at 4×
//   1.5    the rivet and tassel at 2×         1.625  at 4×
//   1.75   the cartouches at 4× (left, then 1.875 right)
//   2      both fans with tooth and the lens finish, as the film shows them
//   2.125  Granada: the Albaicín and the far guard at 2×   2.25  Seville: the river at 2×
const SV = 'sandbox/2026-11-19-souvenir-test/';
Motion.scene({
    fps: 24, duration: 2.5, logical: [1600, 900],
    uses: ['styles/souvenir/souvenir.js', SV + 'things/fan.js'],
    fonts: [{ family: 'IM Fell DW Pica SC', src: 'fonts/IMFellDWPicaSC-Regular.ttf' }],
    draw(g, t, env) {
        const S = Souvenir, page = Math.floor(t * 8 + 1e-6);
        const L = { x: 660, y: 640, r: 600, a0: Math.PI * 0.97, a1: Math.PI * 1.47, n: 14, seed: 'fanL' };
        const R = { x: 940, y: 640, r: 600, a0: Math.PI * 0.03, a1: -Math.PI * 0.47, n: 14, seed: 'fanR' };
        const stickAt = (o, i, u) => {
            const a = o.a0 + ((o.a1 - o.a0) * i) / o.n;
            return [o.x + Math.cos(a) * u, o.y + Math.sin(a) * u];
        };
        // [zoom, centre, which fans]
        const VIEWS = [
            [1, [800, 450], 'LR'],
            [2, Fan.at(L, 0.27, 0.56), 'L'], [4, Fan.at(L, 0.3, 0.52), 'L'],
            [2, Fan.at(R, 0.78, 0.5), 'R'], [4, Fan.at(R, 0.705, 0.6), 'R'], [4, Fan.at(R, 0.86, 0.36), 'R'],
            [2, Fan.at(L, 0.3, 1.02), 'L'], [4, Fan.at(L, 0.36, 1.08), 'L'],
            [2, stickAt(L, 5, 190), 'L'], [4, stickAt(L, 5, 205), 'L'],
            [2, stickAt(R, 14, 400), 'R'], [4, stickAt(R, 14, 330), 'R'],
            [2, [660, 700], 'L'], [4, [660, 690], 'L'],
            [4, Fan.at(L, 0.27, 0.93), 'L'], [4, Fan.at(R, 0.73, 0.93), 'R'],
            [1, [800, 450], 'LR'],
            [2, Fan.at(L, 0.16, 0.22), 'L'], [2, Fan.at(R, 0.7, 0.2), 'R'],
        ];
        const [z, c, which] = VIEWS[Math.min(page, VIEWS.length - 1)];
        g.fillStyle = '#232749';
        g.fillRect(0, 0, 1600, 900);
        const t0 = performance.now();
        const sheet = Motion.layer(env, 'fan-sheet', (q) => {
            q.translate(800, 450);
            q.scale(z, z);
            q.translate(-c[0], -c[1]);
            if (which.includes('L')) Fan.draw(q, L);
            if (which.includes('R')) Fan.draw(q, R);
            if (page === 16) S.tooth(q, { x: 0, y: 0, w: 1600, h: 900 });
        });
        if (!window.__fanTimed) window.__fanTimed = {};
        if (!window.__fanTimed[page]) {
            window.__fanTimed[page] = true;
            console.log(`fan page ${page}: ${(performance.now() - t0).toFixed(0)} ms`);
        }
        Motion.drawLayer(g, env, sheet);
    },
    post(ctx, t, env) {
        if (Math.floor(t * 8 + 1e-6) === 16) Souvenir.finish(ctx, env, 0);
    },
});
