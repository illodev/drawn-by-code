// The patio's loose stratum laid flat, as a map (no camera, no blur): every piece at its place
// in stratum units at half size (the frame covers x ±1600, y ±900), far pieces first; rings at
// 260 (nothing inside), 450 and 918 (the frame's half-height and half-diagonal at 1000 away).
const DIR = 'sandbox/2026-11-19-souvenir-test/';
const ONLY = null; // a filter on ids while working (null: all)
const VIEW = { x: 0, y: 0, s: 1 }; // what the frame shows: its centre and scale (1: painted size)
Motion.scene({
    fps: 24, duration: 1 / 24, logical: [1600, 900],
    uses: ['styles/souvenir/souvenir.js', DIR + 'things/fauna.js', DIR + 'things/citrus.js', DIR + 'things/patio.js', DIR + 'tableaux/patio.js'],
    setup() {
        return { layers: Tableau.patio.loose(0).filter((l) => !ONLY || ONLY.test(l.id)).sort((a, b) => b.z - a.z) };
    },
    draw(g, t, env) {
        g.fillStyle = '#1b1e3d';
        g.fillRect(0, 0, 1600, 900);
        g.save();
        g.translate(800, 450);
        g.scale(VIEW.s, VIEW.s);
        g.translate(-VIEW.x, -VIEW.y);
        for (const ly of env.state.layers) {
            const res = env.k * VIEW.s * 1.12, c = document.createElement('canvas');
            c.width = Math.ceil(ly.box.w * res);
            c.height = Math.ceil(ly.box.h * res);
            const q = c.getContext('2d');
            q.setTransform(res, 0, 0, res, -ly.box.x * res, -ly.box.y * res);
            const t0 = performance.now();
            ly.paint(q, res);
            const ms = performance.now() - t0;
            env.total = (env.total ?? 0) + ms;
            env.worst = Math.max(env.worst ?? 0, ms);
            if (ms > 300) console.log(`paint ${ly.id} ${ms.toFixed(0)} ms`);
            g.drawImage(c, ly.box.x, ly.box.y, ly.box.w, ly.box.h);
            g.strokeStyle = 'rgba(255,255,255,0.12)';
            g.lineWidth = 2;
            g.strokeRect(ly.box.x, ly.box.y, ly.box.w, ly.box.h);
        }
        console.log(`${env.state.layers.length} pieces, paint ${(env.total / 1000).toFixed(1)} s in all, the slowest ${(env.worst / 1000).toFixed(2)} s`);
        for (const R of [260, 450, 918]) {
            g.strokeStyle = 'rgba(255,220,120,0.6)';
            g.lineWidth = 3;
            g.beginPath();
            g.arc(0, 0, R, 0, Math.PI * 2);
            g.stroke();
        }
        g.restore();
    },
});
