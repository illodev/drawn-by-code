// Flat bench for the loose «planes» stratum: no lens, one view per second.
//   ['map', s]           every piece at its place in the stratum (depth ignored), scale s
//   [id, s | 'fit']      one piece as the rig paints it (trimmed, with its brushwork)
//   ['fn', name, s]      a drawer called straight (FN below), scale s
const DIR = 'sandbox/2026-11-19-souvenir-test/';
const VIEWS = [
    ['map', 0.3],
    ['map', 1, 330, -330],
    ['map', 1, -420, 380],
    ['map', 1, 500, 380],
    ['map', 1, -560, -300],
    ['fn', 'wing', 1],
];
const FN = {
    wing: (g) => Planes.wing(g, { x: 20, y: -170, s: 1.55, seed: 'paloma' }),
};
Motion.scene({
    fps: 24,
    duration: VIEWS.length,
    logical: [1600, 900],
    uses: ['styles/souvenir/souvenir.js', DIR + 'things/guitar.js', DIR + 'things/charms.js', DIR + 'things/planes.js', DIR + 'tableaux/planes.js'],
    fonts: [{ family: 'IM Fell DW Pica SC', src: 'fonts/IMFellDWPicaSC-Regular.ttf' }, { family: 'Anton', src: 'fonts/Anton-latin.woff2' }, { family: 'Lora', src: 'fonts/Lora-Medium-latin.woff2' }],
    setup(env) {
        const layers = Tableau.planes.loose ? Tableau.planes.loose(0) : [];
        return { layers, rig: Souvenir.rig(env, layers) };
    },
    draw(g, t, env) {
        const v = VIEWS[Math.min(VIEWS.length - 1, Math.floor(t))];
        g.fillStyle = '#1b1e3d';
        g.fillRect(0, 0, env.W, env.H);
        g.save();
        g.translate(800, 450);
        g.imageSmoothingQuality = 'high';
        if (v[0] === 'fn') {
            g.scale(v[2], v[2]);
            FN[v[1]](g);
        } else if (v[0] === 'map') {
            g.scale(v[1], v[1]);
            g.translate(-(v[2] ?? 0), -(v[3] ?? 0));
            for (const ly of env.state.layers.slice().sort((a, b) => b.z - a.z)) {
                const c = env.state.rig.canvasOf(ly), b = ly.trimmed ?? ly.box;
                g.drawImage(c, b.x, b.y, b.w, b.h);
            }
            g.strokeStyle = 'rgba(255,255,255,0.25)';
            g.lineWidth = 2 / v[1];
            for (const R of [260, 600, 950, 1500]) {
                g.beginPath();
                g.arc(0, 0, R, 0, Math.PI * 2);
                g.stroke();
            }
        } else {
            const ly = env.state.layers.find((l) => l.id === v[0]);
            if (ly) {
                const c = env.state.rig.canvasOf(ly), b = ly.trimmed ?? ly.box, s = v[1] === 'fit' ? Math.min(1500 / b.w, 840 / b.h) : v[1];
                g.scale(s, s);
                g.translate(-(b.x + b.w / 2), -(b.y + b.h / 2));
                g.drawImage(c, b.x, b.y, b.w, b.h);
            }
        }
        g.restore();
    },
});
