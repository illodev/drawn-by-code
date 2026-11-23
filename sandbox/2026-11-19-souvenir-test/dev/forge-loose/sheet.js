// Dev · a specimen sheet of the forge's loose pieces: page p (second p) lays out eight of
// them, each painted as the rig paints it at 1920 and drawn at 1:1 (or smaller when it
// does not fit its cell, scale written under it), on the bench's night. For crops at 1:1.
const DIR = 'sandbox/2026-11-19-souvenir-test/';
const PER = 8;
Motion.scene({
    fps: 1, duration: 13, logical: [1600, 900],
    uses: ['styles/souvenir/souvenir.js', DIR + 'things/forge.js', DIR + 'tableaux/forge.js'],
    setup() {
        return { cache: new Map() };
    },
    draw(g, t, env) {
        const all = Tableau.forge.loose(0), page = Math.floor(t), list = all.slice(page * PER, page * PER + PER);
        g.fillStyle = '#1b1e3d';
        g.fillRect(0, 0, env.W, env.H);
        const k = env.k * 1.12;
        list.forEach((ly, i) => {
            if (!env.state.cache.has(ly.id)) {
                const res = k * (ly.res ?? 1), c = document.createElement('canvas');
                c.width = Math.ceil(ly.box.w * res);
                c.height = Math.ceil(ly.box.h * res);
                const q = c.getContext('2d');
                q.setTransform(res, 0, 0, res, -ly.box.x * res, -ly.box.y * res);
                ly.paint(q, res);
                env.state.cache.set(ly.id, { c, res });
            }
            const { c, res } = env.state.cache.get(ly.id);
            const cw = 400, ch = 430, cx = (i % 4) * cw, cy = Math.floor(i / 4) * (ch + 20);
            const sc = Math.min(1, cw / (c.width / res), ch / (c.height / res));
            const w = (c.width / res) * sc, h = (c.height / res) * sc;
            g.drawImage(c, cx + (cw - w) / 2, cy + (ch - h) / 2, w, h);
            g.fillStyle = '#cfc6b0';
            g.font = '13px sans-serif';
            g.fillText(ly.id.replace('forge-l-', '') + ' ×' + sc.toFixed(2), cx + 8, cy + ch + 14);
        });
    },
});
