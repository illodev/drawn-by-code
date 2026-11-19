// Throwaway: edge cases of things/garland.js (short paths, no stems, flips, small scales).
Motion.scene({
    fps: 24, duration: 1, logical: [1600, 900],
    uses: ['styles/souvenir/souvenir.js', 'sandbox/2026-11-19-souvenir-test/things/garland.js'],
    draw(g, t, env) {
        g.fillStyle = '#232749';
        g.fillRect(0, 0, 1600, 900);
        const layer = Motion.layer(env, 'plants', (q) => {
            Garland.olive(q, { path: [[60, 200], [120, 160]], seed: 'tiny' });
            Garland.olive(q, { path: [[60, 400], [200, 330], [330, 340]], seed: 'short', olives: false });
            Garland.olive(q, { path: [[60, 800], [300, 560], [560, 500], [800, 560]], seed: 'x', shoots: 3 });
            Garland.olive(q, { path: [[1540, 800], [1300, 560], [1040, 500], [800, 560]], seed: 'x', shoots: 3, flip: true });
            Garland.carnation(q, { x: 500, y: 120, r: 70, stem: 0, seed: 1 });
            Garland.carnation(q, { x: 700, y: 120, r: 30, stem: 1, seed: 2, leaves: 0 });
            Garland.carnation(q, { x: 860, y: 120, r: 20, seed: 3 });
            Garland.carnation(q, { x: 1040, y: 150, r: 110, seed: 4, color: 'white', leaves: 2, stem: 3 });
            Garland.bud(q, { x: 1250, y: 120, stem: 0 });
            Garland.bud(q, { x: 1320, y: 120, s: 0.5 });
            Garland.bud(q, { x: 1420, y: 120, s: 2, leaves: 0, rot: 0.5 });
            Garland.spray(q, { x: 400, y: 620, s: 0.6, seed: 'a', flip: true, rot: 0.3 });
            Garland.spray(q, { x: 1250, y: 640, s: 1.2, seed: 'b', tie: false });
            Souvenir.tooth(q, { x: 0, y: 0, w: 1600, h: 900 });
        });
        Motion.drawLayer(g, env, layer);
    },
});
