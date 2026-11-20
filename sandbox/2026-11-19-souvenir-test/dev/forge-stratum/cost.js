// Dev · how long each layer of the forge's stratum takes to paint at the output's resolution (as the
// rig paints it: env.k × 1.12 × the layer's res), logged; the frame shows nothing useful.
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
            let total = 0;
            for (const ly of Tableau.forge.stratum(0)) {
                const res = env.k * 1.12 * (ly.res ?? 1), c = document.createElement('canvas');
                c.width = Math.ceil(ly.box.w * res);
                c.height = Math.ceil(ly.box.h * res);
                const q = c.getContext('2d');
                q.setTransform(res, 0, 0, res, -ly.box.x * res, -ly.box.y * res);
                const t0 = performance.now();
                ly.paint(q, res);
                const dt = (performance.now() - t0) / 1000;
                total += dt;
                console.log(ly.id, 'z', ly.z, 'res', (ly.res ?? 1), dt.toFixed(1) + ' s');
                c.width = c.height = 0;
            }
            console.log('total', total.toFixed(1) + ' s');
        }
        g.fillStyle = '#222';
        g.fillRect(0, 0, env.W, env.H);
    },
});
