// Dev sheet for things/garland.js (olive branch, carnations, bud, spray), painted on a
// transparent layer over the night as the emblem's tableau does.
//   t = 0     the plants at the size they have in the film, with the finish
//   t = 0.5   the same, raw paint (no finish)
//   t = 1     2× close-ups: a stretch of branch with olives, a carnation head (finish)
//   t = 1.5   the close-ups, raw paint
//   t = 1.9   checks: the tableau's own calls, flowers turned every way, other scales (raw)
// node engine/render.mjs sandbox/2026-11-19-souvenir-test/dev/garland/scene.js --at 0,0.5,1,1.5
Motion.scene({
    fps: 24, duration: 2, logical: [1600, 900],
    uses: ['styles/souvenir/souvenir.js', 'sandbox/2026-11-19-souvenir-test/things/garland.js'],
    draw(g, t, env) {
        const S = Souvenir;
        g.fillStyle = '#232749';
        g.fillRect(0, 0, 1600, 900);
        const left = [[300, 860], [170, 600], [200, 330], [330, 120]];
        const right = left.map(([x, y]) => [1600 - x, y]);
        const layer = Motion.layer(env, 'plants', (q) => {
            if (t > 1.8) {
                // checks: the tableau's own calls at their own size (a stand-in for the guitar
                // over them), and in the corners flowers turned every way and other scales
                q.save();
                q.translate(800, 450);
                Garland.olive(q, { path: [[-150, 470], [-420, 380], [-560, 160], [-520, -110]], seed: 'left' });
                Garland.olive(q, { path: [[150, 470], [420, 380], [560, 160], [520, -110]], seed: 'right' });
                Garland.spray(q, { x: -250, y: 120, s: 1, rot: -0.5, seed: 'L' });
                Garland.spray(q, { x: 250, y: 120, s: 1, rot: 0.5, seed: 'R' });
                const half = [[0, -225], [150, -215], [210, -82], [176, 60], [274, 300], [200, 460], [0, 495]];
                S.piece(q, S.curve([...half, ...half.slice(1, -1).reverse().map(([x, y]) => [-x, y])], true, 12), { fill: '#e2b469', line: 3, shade: { color: '#a8742f', alpha: 0.8, w: 60 } });
                q.restore();
                for (let i = 0; i < 6; i++) Garland.carnation(q, { x: 90 + (i % 3) * 150 + (i > 2 ? 1150 : 0), y: 110 + (i % 2) * 40, r: 45, rot: (i * Math.PI) / 3, seed: 'r' + i, stem: 1.6, color: i === 4 ? 'white' : 'red' });
                Garland.bud(q, { x: 1500, y: 420, s: 1.5, rot: -0.8, seed: 'e' });
                Garland.bud(q, { x: 1540, y: 560, s: 0.7, rot: 2.4, seed: 'f' });
                Garland.olive(q, { path: [[40, 760], [80, 600], [60, 440]], seed: 'small', s: 0.7 });
                Garland.olive(q, { path: [[1480, 860], [1560, 760], [1560, 640]], seed: 'big', s: 1.3, shoots: 0 });
            } else if (t < 0.99) {
                Garland.olive(q, { path: left, seed: 'arm' });
                Garland.olive(q, { path: right, seed: 'arm', flip: true });
                Garland.carnation(q, { x: 520, y: 130, r: 70, seed: 'a' });
                Garland.carnation(q, { x: 700, y: 120, r: 55, rot: -0.3, seed: 'b' });
                Garland.carnation(q, { x: 850, y: 110, r: 45, rot: 0.35, seed: 'c' });
                Garland.carnation(q, { x: 1010, y: 130, r: 62, rot: 0.1, seed: 'w', color: 'white' });
                Garland.bud(q, { x: 1140, y: 150, s: 1, rot: 0.15, seed: 'd' });
                Garland.spray(q, { x: 800, y: 600, s: 1, seed: 'ramo' });
            } else {
                // a stretch of the left arm, twice the size
                q.save();
                q.beginPath();
                q.rect(0, 0, 790, 900);
                q.clip();
                q.translate(395, 450);
                q.scale(2, 2);
                q.translate(-190, -470);
                Garland.olive(q, { path: left, seed: 'arm' });
                q.restore();
                q.save();
                q.beginPath();
                q.rect(810, 0, 790, 900);
                q.clip();
                q.translate(1205, 300);
                q.scale(2, 2);
                Garland.carnation(q, { x: 0, y: 0, r: 70, seed: 'a' });
                q.restore();
            }
            S.tooth(q, { x: 0, y: 0, w: 1600, h: 900 });
        });
        Motion.drawLayer(g, env, layer);
    },
    post(ctx, t, env) {
        if (t < 1.8 && Math.round(t * 2) % 2 === 0) Souvenir.finish(ctx, env, 0);
    },
});
