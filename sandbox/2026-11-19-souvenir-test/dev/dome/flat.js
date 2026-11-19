// Flat sheets for things/dome.js: each layer of the picture without the lens, painted at
// scale `s` about the point (x, y) of its own units (Tableau.dome.views). One page every
// 1/12 s (2 frames at 24 fps); pages 0–10 the views in order, 11… the crops in CROPS.
const DIR = 'sandbox/2026-11-19-souvenir-test/';
// [layer id, x, y, scale]: crops at 2× of what must hold up
const CROPS = [
    ['dome-dado', -700, -200, 2], ['dome-plaster', -330, -330, 2], ['dome-corbels', 300, -360, 2], ['dome-lattice', -330, -200, 2],
    ['dome-muqarnas-0', -260, -300, 2], ['dome-muqarnas-1', 180, -200, 2], ['dome-ribs', -200, -150, 2], ['dome-mosaic', -200, -180, 2],
    ['dome-crown', -150, -120, 2], ['dome-mosaic', -188, -176, 6],
];
Motion.scene({
    fps: 24, duration: 2, logical: [1600, 900],
    uses: ['styles/souvenir/souvenir.js', DIR + 'things/dome.js', DIR + 'tableaux/dome.js'],
    draw(g, t, env) {
        const page = Math.floor(t * 12 + 1e-6);
        g.fillStyle = '#2a2230';
        g.fillRect(0, 0, 1600, 900);
        const views = Tableau.dome.views;
        const v = page < views.length ? views[page] : (() => {
            const c = CROPS[page - views.length];
            return c && { id: c[0], x: c[1], y: c[2], s: c[3] };
        })();
        if (!v) return;
        const ly = Tableau.dome(0).find((l) => l.id === v.id);
        g.save();
        g.translate(800, 450);
        g.scale(v.s, v.s);
        g.translate(-v.x, -v.y);
        ly.paint(g, env.k * v.s);
        g.restore();
    },
});
