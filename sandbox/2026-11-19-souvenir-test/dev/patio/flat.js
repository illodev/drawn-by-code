// Flat sheets of picture 7 (the patio), without the rig: one layer's `paint` at a zoom about a
// point, on a neutral ground. One page every 1/8 s (3 frames at 24 fps):
//   PAGES[i] = [layer id (without 'patio-'), zoom, cx, cy]  (zoom 1 = film size at the reading distance)
const DIR = 'sandbox/2026-11-19-souvenir-test/';
const PAGES = [
    ['hall', 0.84, 0, 0], ['zaguan', 1.12, 0, 0], ['fountain', 1.12, 0, 0], ['cane', 1.12, 0, 0], ['pots', 1.12, 0, 0],
    ['well', 1.12, 0, 0], ['orange', 1.12, 0, 0], ['gallery', 1.12, 0, 0], ['peacocks', 1.12, 0, 0], ['plate', 0.56, 0, 0],
];
Motion.scene({
    fps: 24, duration: PAGES.length / 8, logical: [1600, 900],
    uses: ['styles/souvenir/souvenir.js', DIR + 'things/fauna.js', DIR + 'things/shawl.js', DIR + 'things/citrus.js', DIR + 'things/patio.js', DIR + 'tableaux/patio.js'],
    setup(env) {
        return { layers: Tableau.patio(0), cache: new Map() };
    },
    draw(g, t, env) {
        const [id, zoom, cx, cy] = PAGES[Math.min(PAGES.length - 1, Math.floor(t * 8 + 1e-6))];
        g.fillStyle = '#6d6a78';
        g.fillRect(0, 0, 1600, 900);
        const ly = env.state.layers.find((l) => l.id === 'patio-' + id);
        if (!ly) return;
        const key = id + '@' + zoom;
        if (!env.state.cache.has(key)) {
            const res = env.k * zoom * (ly.res && zoom < 1 ? 1 : 1);
            const c = document.createElement('canvas');
            c.width = Math.ceil(ly.box.w * res);
            c.height = Math.ceil(ly.box.h * res);
            const q = c.getContext('2d');
            q.setTransform(res, 0, 0, res, -ly.box.x * res, -ly.box.y * res);
            const t0 = performance.now();
            ly.paint(q, res);
            console.log(`paint ${ly.id} @${zoom}: ${((performance.now() - t0) / 1000).toFixed(2)} s`);
            env.state.cache.clear();
            env.state.cache.set(key, c);
        }
        const c = env.state.cache.get(key);
        g.save();
        g.translate(800, 450);
        g.scale(zoom, zoom);
        g.translate(-cx, -cy);
        g.drawImage(c, ly.box.x, ly.box.y, ly.box.w, ly.box.h);
        g.restore();
    },
});
