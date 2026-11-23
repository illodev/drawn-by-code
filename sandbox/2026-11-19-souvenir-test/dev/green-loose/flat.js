// The flat bench for the loose stratum (round 8): every piece of Tableau.green.loose painted
// flat (no lens, no float), far ones first, so its detail can be cropped at 1:1.
//   t = 0       the whole slab fitted to the frame (scale 0.5)
//   t = 1 …     the 1600 × 900 about each hero at scale 1 (VIEWS below)
const DIR = 'sandbox/2026-11-19-souvenir-test/';
const VIEWS = [[0, 0, 0.5]]; // [x, y, scale]; the heroes' centres are added in setup
Motion.scene({
    fps: 1, duration: 14, logical: [1600, 900],
    uses: ['styles/souvenir/souvenir.js', DIR + 'things/green.js', DIR + 'tableaux/green.js'],
    setup() {
        const layers = Tableau.green.loose(0).sort((a, b) => b.z - a.z);
        const heroes = ['limb', 'ship', 'horse', 'agave', 'opuntia', 'lantern', 'pandero', 'frost', 'fish', 'icicle', 'rail', 'limb2', 'bough'];
        const views = VIEWS.slice();
        for (const h of heroes) {
            const l = layers.find((x) => x.id === 'green-l-' + h);
            if (l) views.push([l.box.x + l.box.w / 2, l.box.y + l.box.h / 2, 1]);
        }
        return { layers, views, cv: new Map() };
    },
    draw(g, t, env) {
        const st = env.state, S = Souvenir, k = S.pxScale(g), [cx, cy, sc] = st.views[Math.min(st.views.length - 1, Math.round(t))];
        g.fillStyle = '#1b1e3d';
        g.fillRect(0, 0, 1600, 900);
        for (const ly of st.layers) {
            const b = ly.box;
            if ((b.x + b.w - cx) * sc < -800 || (b.x - cx) * sc > 800 || (b.y + b.h - cy) * sc < -450 || (b.y - cy) * sc > 450) continue;
            if (!st.cv.has(ly.id)) {
                const res = k * (ly.res ?? 1), c = document.createElement('canvas');
                c.width = Math.ceil(b.w * res);
                c.height = Math.ceil(b.h * res);
                const q = c.getContext('2d');
                q.setTransform(res, 0, 0, res, -b.x * res, -b.y * res);
                const t0 = performance.now();
                ly.paint(q, res);
                console.log(`paint ${ly.id} ${((performance.now() - t0) / 1000).toFixed(2)} s`);
                st.cv.set(ly.id, c);
            }
            g.save();
            g.translate(800, 450);
            g.scale(sc, sc);
            g.translate(-cx, -cy);
            g.drawImage(st.cv.get(ly.id), b.x, b.y, b.w, b.h);
            g.restore();
        }
    },
});
