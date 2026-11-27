// Paint times of the patio stratum's three sheets at the rig's resolution at 1920 (×1.12; the
// near sheet ×0.9), flat, no rig: one page each, the console prints the seconds.
const DIR = 'sandbox/2026-11-19-souvenir-test/';
const PAGES = [['far', 1.12], ['mid', 1.12], ['near', 0.9]];
Motion.scene({
    fps: 24, duration: PAGES.length / 8, logical: [1600, 900],
    uses: ['styles/souvenir/souvenir.js', DIR + 'things/fauna.js', DIR + 'things/citrus.js', DIR + 'things/patio.js', DIR + 'tableaux/patio.js'],
    setup() {
        return { layers: Tableau.patio.stratum(0) };
    },
    draw(g, t, env) {
        const [id, zoom] = PAGES[Math.min(PAGES.length - 1, Math.floor(t * 8 + 1e-6))];
        const ly = env.state.layers.find((l) => l.id === 'patio-s-' + id), res = env.k * zoom;
        const c = document.createElement('canvas');
        c.width = Math.ceil(ly.box.w * res);
        c.height = Math.ceil(ly.box.h * res);
        const q = c.getContext('2d');
        q.setTransform(res, 0, 0, res, -ly.box.x * res, -ly.box.y * res);
        const t0 = performance.now();
        ly.paint(q, res);
        console.log(`paint ${ly.id}: ${((performance.now() - t0) / 1000).toFixed(2)} s`);
        g.fillStyle = '#6d6a78';
        g.fillRect(0, 0, 1600, 900);
        g.drawImage(c, 0, 0, 1600, 900 * (c.height / c.width) * (1600 / 900) * (900 / 1600));
    },
});
