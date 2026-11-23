// What each loose piece of the dome costs to paint at the render's resolution, and whether
// its paint reaches its box's edge (the rig would cut it), logged.
const DIR = 'sandbox/2026-11-19-souvenir-test/';
Motion.scene({
    fps: 24, duration: 1 / 24, logical: [1600, 900],
    uses: ['styles/souvenir/souvenir.js', DIR + 'things/dome.js', DIR + 'tableaux/dome.js'],
    draw(g, t, env) {
        let all = 0;
        for (const ly of Tableau.dome.loose(0)) {
            const res = env.k * 1.12 * (ly.res ?? 1), c = document.createElement('canvas');
            c.width = Math.ceil(ly.box.w * res);
            c.height = Math.ceil(ly.box.h * res);
            const q = c.getContext('2d', { willReadFrequently: true });
            q.setTransform(res, 0, 0, res, -ly.box.x * res, -ly.box.y * res);
            const t0 = performance.now();
            ly.paint(q, res);
            Souvenir.brushwork(c, { seed: Souvenir.seedOf(ly.id), k: env.k, ...(typeof ly.brush === 'object' ? ly.brush : {}) });
            const dt = (performance.now() - t0) / 1000;
            all += dt;
            const d = q.getImageData(0, 0, c.width, c.height).data, w = c.width, h = c.height;
            let edge = 0;
            for (let x = 0; x < w; x++) edge += d[x * 4 + 3] > 2 || d[((h - 1) * w + x) * 4 + 3] > 2 ? 1 : 0;
            for (let y = 0; y < h; y++) edge += d[y * w * 4 + 3] > 2 || d[(y * w + w - 1) * 4 + 3] > 2 ? 1 : 0;
            console.log(`cost ${ly.id} ${dt.toFixed(2)} s${edge ? ' TOUCHES' : ''}`);
            c.width = c.height = 0;
        }
        console.log(`cost all ${all.toFixed(1)} s`);
        g.fillStyle = '#000';
        g.fillRect(0, 0, 1600, 900);
    },
});
