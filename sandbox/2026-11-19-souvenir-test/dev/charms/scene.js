// Dev sheet for things/charms.js: the castanets, the cards and the pomegranate on the
// emblem's indigo ground. One page every 1/8 s (3 frames), all raw paint except the last:
//   0     the three at film size (s = 1)
//   0.125 castanets at 2×            0.25  pomegranate at 2×
//   0.375 cards at 2×, left half     0.5   cards at 2×, right half
//   0.625 turned (the light must stay at the top left) and loose arils
//   0.75  the three at film size with tooth and the lens finish
//   0.875 painted on a transparent sheet first (as a rig layer is), small and large, other seeds
const SV = 'sandbox/2026-11-19-souvenir-test/';
Motion.scene({
    fps: 24, duration: 1, logical: [1600, 900],
    uses: ['styles/souvenir/souvenir.js', SV + 'things/charms.js'],
    draw(g, t, env) {
        const S = Souvenir, page = Math.floor(t * 8 + 1e-6);
        g.fillStyle = '#232749';
        g.fillRect(0, 0, 1600, 900);
        const row = () => {
            Charms.castanets(g, { x: 350, y: 450 });
            Charms.cards(g, { x: 800, y: 450 });
            Charms.pomegranate(g, { x: 1250, y: 450 });
        };
        if (page === 0) row();
        else if (page === 1) Charms.castanets(g, { x: 800, y: 450, s: 2 });
        else if (page === 2) Charms.pomegranate(g, { x: 800, y: 450, s: 2 });
        else if (page === 3) Charms.cards(g, { x: 1180, y: 450, s: 2 });
        else if (page === 4) Charms.cards(g, { x: 420, y: 450, s: 2 });
        else if (page === 5) {
            Charms.castanets(g, { x: 300, y: 300, rot: 0.6 });
            Charms.castanets(g, { x: 300, y: 660, rot: -2.2, seed: 'b' });
            Charms.cards(g, { x: 800, y: 300, rot: -0.5, s: 0.8 });
            Charms.cards(g, { x: 800, y: 680, rot: 2.6, s: 0.6, seed: 'b' });
            Charms.pomegranate(g, { x: 1260, y: 300, rot: 0.9 });
            Charms.pomegranate(g, { x: 1180, y: 690, rot: -1.9, s: 0.8, seed: 'b' });
            for (let i = 0; i < 9; i++) Charms.aril(g, { x: 1360 + (i % 3) * 60, y: 600 + Math.floor(i / 3) * 70, s: 1 + i * 0.5, rot: i * 0.9, seed: i });
        } else if (page === 6) {
            row();
            S.tooth(g, { x: 0, y: 0, w: 1600, h: 900 });
        } else {
            const sheet = Motion.layer(env, 'charms-sheet', (q) => {
                Charms.castanets(q, { x: 200, y: 200, s: 0.5, seed: 'x' });
                Charms.cards(q, { x: 520, y: 200, s: 0.5, seed: 'x' });
                Charms.pomegranate(q, { x: 800, y: 200, s: 0.5, seed: 'x' });
                Charms.castanets(q, { x: 330, y: 610, s: 1.5, rot: 0.2, seed: 'y' });
                Charms.pomegranate(q, { x: 1250, y: 520, s: 3.2, rot: -0.35, seed: 'y' });
                for (let i = 0; i < 5; i++) Charms.aril(q, { x: 640 + i * 44, y: 640 + (i % 2) * 30, s: 2.4, rot: i * 1.3 + 0.4, seed: 'l' + i });
            });
            Motion.drawLayer(g, env, sheet);
        }
    },
    post(ctx, t, env) {
        if (Math.floor(t * 8 + 1e-6) === 6) Souvenir.finish(ctx, env, 0);
    },
});
