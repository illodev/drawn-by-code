// The flat bench for picture 3 (green): its things on a flat sheet at scale 1, and each of its
// layers painted flat (no lens), one page a second.
//   t = 0 …   the specimen pages (PAGES below)
//   t = 10 …  the layers, one a second, the 1600 × 900 about their origin at scale 1
//   t = 30 …  the layers whole, fitted to the frame
const DIR = 'sandbox/2026-11-19-souvenir-test/';
const ONLY = null; // a layer id to paint alone (dev: saves painting the others)
const STRATUM = true; // true: the stratum of round 7 instead of the picture
Motion.scene({
    fps: 1, duration: 50, logical: [1600, 900],
    uses: ['styles/souvenir/souvenir.js', DIR + 'things/green.js', { src: DIR + 'tableaux/green.js', optional: true }],
    setup() {
        return { cv: new Map(), log: [] };
    },
    draw(g, t, env) {
        const st = env.state, S = Souvenir, G = Green, sec = Math.round(t);
        g.fillStyle = '#11261f';
        g.fillRect(0, 0, 1600, 900);
        const PAGES = [
            // 0 · fig leaves, every kind, a fig, wood
            () => {
                const res = S.pxScale(g) * 1.0;
                const R = Math.round(res * 4) / 4;
                G.figWood(g, [[40, 840], [300, 700], [600, 640], [900, 560], [1200, 520], [1560, 380]], { w0: 46, w1: 16, seed: 'w1', nodes: [300, 520, 760], wrinkles: [[200, 40]] });
                G.leafScar(g, 640, 616, -0.2, 12);
                G.figBud(g, 1560, 380, -0.4, 30);
                G.latex(g, 1100, 545, 4);
                const kinds = ['moon', 'shade', 'lime', 'under', 'deep'];
                kinds.forEach((k, i) => {
                    const x = 120 + i * 300, y = 200, rot = -1.2 + i * 0.5;
                    const sp = G.figLeaf(i, rot, R, k);
                    G.shadow(g, sp, x, y, 1, { rot });
                    G.put(g, sp, x, y, 1, { rot });
                });
                for (let i = 0; i < 4; i++) {
                    const sp = G.figFruit(i, -0.4 + i * 0.3, R);
                    G.put(g, sp, 300 + i * 120, 420, 1, { rot: -0.4 + i * 0.3 });
                }
            },
            // 1 · the night's things: agave, its pole, a prickly pear, frost, the fish, the ghosts
            () => {
                g.fillStyle = '#0c1d17';
                g.fillRect(0, 0, 1600, 900);
                G.quiote(g, { x: 260, y: 880, h: 700, s: 1, seed: 1 });
                G.agave(g, { x: 260, y: 880, s: 0.7, seed: 1 });
                G.opuntia(g, { x: 1400, y: 900, s: 0.8, seed: 2 });
                for (let i = 0; i < 4; i++) G.frost(g, { x: 560 + i * 150, y: 110, r: 40 + i * 18, seed: i, rot: i * 0.3 });
                G.fish(g, { x: 900, y: 330, s: 0.9, rot: -0.15 });
                g.fillStyle = '#163029';
                g.fillRect(500, 690, 600, 210);
                G.ship(g, { x: 700, y: 700, s: 0.6 });
                G.horse(g, { x: 980, y: 690, s: 0.8 });
            },
            // 2 · the house: railing, lanterns, tambourines, blood, creatures, wind
            () => {
                g.fillStyle = '#7d9a8e';
                g.fillRect(0, 0, 1600, 900);
                G.wind(g, { x: 0, y: 0, w: 1600, h: 400 }, { seed: 1, n: 14, alpha: 0.4 });
                const R = G.railing(g, { x0: 100, x1: 1100, top: 520, bottom: 820, seed: 'r' });
                G.blood(g, [[300, 512], [340, 514], [372, 511], [430, 513], [470, 512], [520, 510]], { seed: 1 });
                G.blood(g, [[595, 600], [596, 640]], { seed: 2, run: true, r: 3.5 });
                G.lantern(g, { x: 300, y: 40, s: 1.1, seed: 1 });
                G.lantern(g, { x: 560, y: 60, s: 0.9, seed: 2, turn: 0.6 });
                G.tambourine(g, { x: 900, y: 200, r: 110, rot: 0.3, seed: 1 });
                G.tambourine(g, { x: 1200, y: 300, r: 80, rot: -0.5, tilt: 0.7, seed: 2 });
                G.frog(g, { x: 1300, y: 620, s: 1.2, rot: -0.4 });
                G.moth(g, { x: 1400, y: 450, s: 1.2, rot: -1.2 });
                G.drop(g, 1300, 760, 6, 0.6);
            },
        ];
        if (sec < PAGES.length) {
            PAGES[sec]();
            return;
        }
        if (sec >= 10 && typeof Tableau !== 'undefined' && Tableau.green) {
            const layers = (STRATUM ? Tableau.green.stratum(1000) : Tableau.green(1000)).filter((l) => !ONLY || l.id === ONLY);
            const idx = sec >= 30 ? sec - 30 : sec - 10, ly = layers[idx];
            if (!ly) return;
            if (!st.rig) st.rig = S.rig(env, layers);
            const q0 = performance.now(), c = st.rig.canvasOf(ly);
            console.log(ly.id, ((performance.now() - q0) / 1000).toFixed(1), 's', JSON.stringify(G.stats()));
            const res = env.k * 1.12 * (ly.res ?? 1);
            g.save();
            if (sec >= 30) {
                const s = Math.min(1600 / ly.box.w, 900 / ly.box.h);
                g.translate(800, 450);
                g.scale(s, s);
            } else g.translate(800, 450);
            g.drawImage(c, ly.box.x, ly.box.y, c.width / res, c.height / res);
            g.restore();
            g.fillStyle = '#e8f2ec';
            g.font = '22px monospace';
            g.fillText(ly.id + '  z+' + (ly.z - 1000), 20, 30);
        }
    },
});
