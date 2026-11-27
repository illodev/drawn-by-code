// Dev · how long each loose piece of the forge takes to paint at the output's resolution (as the
// rig paints it: env.k × 1.12 × the layer's res), and whether its paint touches its box; logged.
const DIR = 'sandbox/2026-11-19-souvenir-test/';
Motion.scene({
    fps: 24, duration: 1, logical: [1600, 900],
    uses: ['styles/souvenir/souvenir.js', DIR + 'things/forge.js', DIR + 'tableaux/forge.js'],
    setup() {
        return { done: false };
    },
    draw(g, t, env) {
        if (!env.state.done) {
            env.state.done = true;
            let total = 0, worst = [];
            for (const ly of Tableau.forge.loose(0)) {
                const res = env.k * 1.12 * (ly.res ?? 1), c = document.createElement('canvas');
                c.width = Math.ceil(ly.box.w * res);
                c.height = Math.ceil(ly.box.h * res);
                const q = c.getContext('2d', { willReadFrequently: true });
                q.setTransform(res, 0, 0, res, -ly.box.x * res, -ly.box.y * res);
                const t0 = performance.now();
                ly.paint(q, res);
                const dt = (performance.now() - t0) / 1000;
                total += dt;
                // the edge rows and columns: any paint there?
                const d = q.getImageData(0, 0, c.width, c.height).data, w = c.width, h = c.height;
                let edge = false;
                for (let x = 0; x < w && !edge; x++) if (d[x * 4 + 3] > 2 || d[((h - 1) * w + x) * 4 + 3] > 2) edge = true;
                for (let y = 0; y < h && !edge; y++) if (d[y * w * 4 + 3] > 2 || d[(y * w + w - 1) * 4 + 3] > 2) edge = true;
                worst.push([dt, ly.id]);
                console.log(ly.id, 'z', ly.z, dt.toFixed(2) + ' s', edge ? 'TOUCHES' : '');
                c.width = c.height = 0;
            }
            worst.sort((a, b) => b[0] - a[0]);
            console.log('pieces', worst.length, 'total', total.toFixed(1) + ' s', 'slowest', worst.slice(0, 5).map((w) => w[1] + ' ' + w[0].toFixed(2)).join(', '));
        }
        g.fillStyle = '#222';
        g.fillRect(0, 0, env.W, env.H);
    },
});
