// What each layer of the dome costs to paint at the render's resolution (as the rig paints
// it: env.k × 1.12 × res), logged to the console. Timing only: nothing here is drawn.
const DIR = 'sandbox/2026-11-19-souvenir-test/';
Motion.scene({
    fps: 24, duration: 1 / 24, logical: [1600, 900],
    uses: ['styles/souvenir/souvenir.js', DIR + 'things/dome.js', DIR + 'tableaux/dome.js'],
    draw(g, t, env) {
        let total = 0;
        for (const ly of Tableau.dome(0)) {
            const res = env.k * 1.12 * (ly.res ?? 1), c = document.createElement('canvas');
            c.width = Math.ceil(ly.box.w * res);
            c.height = Math.ceil(ly.box.h * res);
            const q = c.getContext('2d');
            q.setTransform(res, 0, 0, res, -ly.box.x * res, -ly.box.y * res);
            const t0 = performance.now();
            ly.paint(q, res);
            if (ly.brush !== false) Souvenir.brushwork(c, { seed: Souvenir.seedOf(ly.id), k: env.k, ...(typeof ly.brush === 'object' ? ly.brush : {}) });
            const dt = (performance.now() - t0) / 1000;
            total += dt;
            console.log(`cost ${ly.id} ${c.width}x${c.height} ${dt.toFixed(2)} s`);
        }
        console.log(`cost total ${total.toFixed(2)} s`);
        g.fillStyle = '#000';
        g.fillRect(0, 0, 1600, 900);
    },
});
