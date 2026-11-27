// Flat sheets for «En una noche oscura»: each layer of tableaux/darknight.js painted at
// scale 1, without the lens, framed as the camera reads it (1000 away): one page every 0.1 s,
// in the tableau's order. Set ONLY to a list of ids to paint fewer.
const SV = 'sandbox/2026-11-19-souvenir-test/';
const ONLY = null;
Motion.scene({
    fps: 10, duration: 1.2, logical: [1600, 900],
    uses: ['styles/souvenir/souvenir.js', SV + 'things/devotion.js', SV + 'things/darknight.js', SV + 'tableaux/darknight.js'],
    draw(g, t, env) {
        const page = Math.round(t * 10);
        const layers = Tableau.darknight(0).filter((l) => !ONLY || ONLY.includes(l.id));
        g.fillStyle = '#07060a';
        g.fillRect(0, 0, 1600, 900);
        const ly = layers[page % layers.length];
        const res = env.k * 1.12 * (ly.res ?? 1);
        const c = document.createElement('canvas');
        c.width = Math.ceil(ly.box.w * res);
        c.height = Math.ceil(ly.box.h * res);
        const q = c.getContext('2d');
        q.setTransform(res, 0, 0, res, -ly.box.x * res, -ly.box.y * res);
        const t0 = performance.now();
        ly.paint(q, res);
        console.log(ly.id, 'painted in', ((performance.now() - t0) / 1000).toFixed(1), 's');
        g.drawImage(c, ly.box.x + 800, ly.box.y + 450, ly.box.w, ly.box.h);
    },
    post(ctx, t, env) {
        Souvenir.finish(ctx, env, Math.round(t * env.fps));
    },
});
