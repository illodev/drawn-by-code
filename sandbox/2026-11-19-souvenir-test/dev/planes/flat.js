// Flat bench for «planes»: each layer's paint at scale 1 on a ground, no lens. One view per
// second: [layer id, centre x, centre y, scale] (scale 1 = the size it is painted for, the
// size it has when the camera is 1000 away; 'fit' shows the whole box).
const DIR = 'sandbox/2026-11-19-souvenir-test/';
const VIEWS = [
    ['planes-table-near', 0, 0, 'fit'],
    ['planes-table-papers', 0, 0, 'fit'],
    ['planes-table-wall', 0, 0, 'fit'],
    ['planes-apart-near', 0, 0, 'fit'],
    ['planes-apart-head', 0, 0, 'fit'],
    ['planes-apart-body', 0, 0, 'fit'],
    ['planes-whole-neck', 0, 0, 'fit'],
    ['planes-whole-top', 0, 0, 'fit'],
    ['planes-hole', 0, 0, 'fit'],
];
Motion.scene({
    fps: 24,
    duration: VIEWS.length,
    logical: [1600, 900],
    uses: ['styles/souvenir/souvenir.js', DIR + 'things/guitar.js', DIR + 'things/charms.js', DIR + 'things/planes.js', DIR + 'tableaux/planes.js'],
    fonts: [{ family: 'IM Fell DW Pica SC', src: 'fonts/IMFellDWPicaSC-Regular.ttf' }, { family: 'Anton', src: 'fonts/Anton-latin.woff2' }, { family: 'Lora', src: 'fonts/Lora-Medium-latin.woff2' }],
    setup(env) {
        const layers = [...Tableau.planes(2000), ...(Tableau.planesTest ? Tableau.planesTest() : [])];
        return { layers, rig: Souvenir.rig(env, layers) };
    },
    draw(g, t, env) {
        const [id, cx, cy, sc] = VIEWS[Math.min(VIEWS.length - 1, Math.floor(t))];
        const ly = env.state.layers.find((l) => l.id === id);
        g.fillStyle = '#4a4038';
        g.fillRect(0, 0, env.W, env.H);
        if (!ly) return;
        const c = env.state.rig.canvasOf(ly), s = sc === 'fit' ? Math.min(1600 / ly.box.w, 900 / ly.box.h) : sc;
        g.save();
        g.translate(800, 450);
        g.scale(s, s);
        g.translate(sc === 'fit' ? -(ly.box.x + ly.box.w / 2) : -cx, sc === 'fit' ? -(ly.box.y + ly.box.h / 2) : -cy);
        g.imageSmoothingQuality = 'high';
        g.drawImage(c, ly.box.x, ly.box.y, ly.box.w, ly.box.h);
        g.restore();
    },
});
