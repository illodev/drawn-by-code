// Inspection bench for the loose dark night: the pieces painted flat in place (no camera, no
// float), one view per second of --at: 0 the whole stratum at half size, then single pieces at 1:1.
const DIR = 'sandbox/2026-11-19-souvenir-test/';
const VIEWS = [
    { x: 0, y: 0, k: 0.5 },
    { id: 'paloma', k: 1.5 },
    { id: 'terciopelo', k: 1.4 },
    { id: 'velo', k: 1.4 },
    { id: 'cirio', k: 1.6 },
    { id: 'cirio-apagado', k: 1.6 },
    { id: 'vihuela', k: 1.2 },
    { id: 'farol', k: 1.6 },
    { id: 'turibulo', k: 1.4 },
    { id: 'pluma-paloma', k: 3 },
    { id: 'escala', k: 1.2 },
    { id: 'azucenas', k: 1.4 },
];
// (a view with `id` shows that piece alone at k, centred on it, with the pieces round it in the dark)
Motion.scene({
    fps: 1,
    duration: VIEWS.length,
    logical: [1600, 900],
    uses: ['styles/souvenir/souvenir.js', DIR + 'things/devotion.js', DIR + 'things/darknight.js', DIR + 'tableaux/darknight.js'],
    setup() {
        return { layers: Tableau.darknight.loose(0) };
    },
    draw(g, t, env) {
        const v = VIEWS[Math.min(VIEWS.length - 1, Math.floor(t))];
        g.fillStyle = '#1b1e3d';
        g.fillRect(0, 0, 1600, 900);
        let ls = env.state.layers, cx = v.x, cy = v.y;
        if (v.id) {
            const me = ls.find((l) => l.id === 'darknight-l-' + v.id);
            cx = me.box.x + me.box.w / 2;
            cy = me.box.y + me.box.h / 2;
            ls = [me];
        }
        const t0 = performance.now();
        const c = document.createElement('canvas');
        c.width = g.canvas.width;
        c.height = g.canvas.height;
        const q = c.getContext('2d'), m = g.getTransform();
        for (const l of ls.slice().sort((a, b) => b.z - a.z)) {
            const s0 = performance.now();
            q.setTransform(1, 0, 0, 1, 0, 0);
            q.clearRect(0, 0, c.width, c.height);
            q.setTransform(m);
            q.translate(800, 450);
            q.scale(v.k, v.k);
            q.translate(-cx, -cy);
            l.paint(q, v.k);
            g.save();
            g.setTransform(1, 0, 0, 1, 0, 0);
            g.drawImage(c, 0, 0);
            g.restore();
            console.log(`paint ${l.id} ${(performance.now() - s0).toFixed(0)} ms`);
        }
        console.log(`view ${Math.floor(t)}: ${(performance.now() - t0).toFixed(0)} ms`);
    },
});
