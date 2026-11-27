// One loose piece of the dome per frame, flat and sharp, at its painted size (1 unit = 1
// logical unit) about the middle of the frame, on the night: for crops at 1:1 and 2×.
// Frame i shows the i-th piece of Tableau.dome.loose(0) (or of BOARD_IDS, if set).
const DIR = 'sandbox/2026-11-19-souvenir-test/';
const BOARD_IDS = null;
Motion.scene({
    fps: 24, duration: 90 / 24, logical: [1600, 900],
    uses: ['styles/souvenir/souvenir.js', DIR + 'things/dome.js', DIR + 'tableaux/dome.js'],
    draw(g, t, env) {
        const all = Tableau.dome.loose(0), list = BOARD_IDS ? all.filter((l) => BOARD_IDS.includes(l.id)) : all;
        const ly = list[Math.min(list.length - 1, Math.round(t * 24))];
        g.fillStyle = '#1b1e3d';
        g.fillRect(0, 0, 1600, 900);
        const res = env.k * 1.12, c = document.createElement('canvas');
        c.width = Math.ceil(ly.box.w * res);
        c.height = Math.ceil(ly.box.h * res);
        const q = c.getContext('2d');
        q.setTransform(res, 0, 0, res, -ly.box.x * res, -ly.box.y * res);
        ly.paint(q, res);
        Souvenir.brushwork(c, { seed: Souvenir.seedOf(ly.id), k: env.k, ...(typeof ly.brush === 'object' ? ly.brush : {}) });
        const cx = ly.box.x + ly.box.w / 2, cy = ly.box.y + ly.box.h / 2;
        g.drawImage(c, 800 - ly.box.w / 2, 450 - ly.box.h / 2, ly.box.w, ly.box.h);
        g.fillStyle = '#fff';
        g.font = '14px monospace';
        g.fillText(ly.id + '  z ' + ly.z + '  at ' + Math.round(cx) + ',' + Math.round(cy), 12, 22);
    },
});
