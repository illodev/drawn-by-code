// A demo loose stratum for the bench (dev/loose/scene.js): the candle's things of the first
// passage, each its own floating piece, and its wreath broken into loose flowers and leaves.
window.Tableau = window.Tableau || {};
Tableau.demo = {
    loose(z) {
        const D = Devotion, W = Wares, Sh = Shawl;
        const piece = (id, dz, x, y, half, draw) => ({ id: 'demo-l-' + id, z: z + dz, loose: true, brush: { amp: 0.06 }, box: { x: x - half, y: y - half, w: half * 2, h: half * 2 }, paint: (g) => draw(g) });
        const things = [
            piece('peineta', 220, -420, -380, 420, (g) => W.peineta(g, { x: -420, y: -380, s: 1.5, rot: -0.18 })),
            piece('biznaga', 160, 380, -420, 420, (g) => W.biznaga(g, { x: 380, y: -420, s: 1.3, rot: 0.2 })),
            piece('jamsa', 60, 470, 380, 420, (g) => D.jamsa(g, { x: 470, y: 380, s: 1.4, rot: -0.1 })),
            piece('lampara', -40, -560, 300, 460, (g) => D.lampara(g, { x: -560, y: 300, s: 1.4, rot: 0, servant: true })),
            piece('rosario', -120, 640, -180, 460, (g) => D.rosario(g, { x: 640, y: -180, s: 1.5, rot: 0.25 })),
            piece('incensario', -220, -760, -160, 640, (g) => D.incensario(g, { x: -760, y: -160, s: 1.9, rot: 0 })),
            piece('cirio', -260, 720, 220, 640, (g) => D.cirio(g, { x: 720, y: 220, s: 1.9, rot: 0.03 })),
        ];
        // the wreath, loose: flowers each with its leaves, all round the axis, at many depths
        const r = Motion.rng('demo-flowers');
        for (let i = 0; i < 26; i++) {
            const a = r() * Math.PI * 2, d = 330 + r() * 900, x = Math.cos(a) * d, y = Math.sin(a) * d * 0.8, rad = 40 + r() * 60;
            const kind = ['peony', 'rose', 'mum'][i % 3];
            things.push(piece('flower' + i, -280 + r() * 560, x, y, rad * 3, (g) => {
                for (let k = 0; k < 4; k++) Sh.leaf(g, { x, y, a: k * 1.6 + r() * 0.5, len: rad * 1.7, wid: rad * 0.5, bend: 0.3, seed: 'dl' + i + k });
                Sh[kind](g, { x, y, r: rad, seed: 'df' + i });
            }));
        }
        return things;
    },
};
