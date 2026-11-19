// Dev sheet for things/heirlooms.js: the six relics on the emblem's indigo ground. One page
// every 1/12 s (2 frames at 24 fps), raw paint unless said:
//   0  all six at film size (s = 1)
//   1  eagle, votive crown, Byzantine cross at 2×
//   2  astrolabe, fawn, tile panel at 2×
//   3  4× crops: ten garnet cells · four chain links and a sapphire · the gold tesserae
//   4  4× crops: the rete's star pointers and the degree scale · three engraved circles of
//      the fawn · one star rosette of the tilework
//   5  all six turned (the light must stay at the top left), other seeds
//   6  all six at film size on a transparent sheet (as a rig layer is), with tooth and the lens finish
//   7… one thing alone at 2× (eagle, votive, byzantine, astrolabe, fawn, alicatado), for work
const HL = 'sandbox/2026-11-19-souvenir-test/';
Motion.scene({
    fps: 24, duration: 1.2, logical: [1600, 900],
    uses: ['styles/souvenir/souvenir.js', HL + 'things/heirlooms.js'],
    draw(g, t, env) {
        const S = Souvenir, H = Heirlooms, page = Math.floor(t * 12 + 1e-6);
        g.fillStyle = '#232749';
        g.fillRect(0, 0, 1600, 900);
        const has = (n) => typeof H[n] === 'function';
        const NAMES = ['eagle', 'votive', 'byzantine', 'astrolabe', 'fawn', 'alicatado'];
        const row = (q) => {
            const xs = [105, 300, 505, 730, 980, 1300];
            NAMES.forEach((n, i) => has(n) && H[n](q, { x: xs[i], y: 450 }));
        };
        // a window on a thing at 4×: the thing's own point (px, py) in the middle of it
        const crop = (n, bx, by, bw, bh, px, py, o = {}) => {
            if (!has(n)) return;
            g.save();
            g.beginPath();
            g.rect(bx, by, bw, bh);
            g.clip();
            H[n](g, { x: bx + bw / 2 - px * 4, y: by + bh / 2 - py * 4, s: 4, ...o });
            g.restore();
            g.strokeStyle = 'rgba(255,255,255,0.25)';
            g.lineWidth = 1;
            g.strokeRect(bx, by, bw, bh);
        };
        if (page === 0) row(g);
        else if (page === 1) {
            has('eagle') && H.eagle(g, { x: 230, y: 450, s: 2 });
            has('votive') && H.votive(g, { x: 700, y: 450, s: 2 });
            has('byzantine') && H.byzantine(g, { x: 1250, y: 450, s: 2 });
        } else if (page === 2) {
            has('astrolabe') && H.astrolabe(g, { x: 260, y: 450, s: 2 });
            has('fawn') && H.fawn(g, { x: 760, y: 450, s: 2 });
            has('alicatado') && H.alicatado(g, { x: 1270, y: 450, s: 2 });
        } else if (page === 3) {
            crop('eagle', 20, 20, 500, 860, 44, 6);
            crop('votive', 540, 20, 520, 860, -46, -38);
            crop('byzantine', 1080, 20, 500, 860, -38, 52);
        } else if (page === 4) {
            crop('astrolabe', 20, 20, 520, 860, 58, 6);
            crop('fawn', 560, 20, 500, 860, 18, -12);
            crop('alicatado', 1080, 20, 500, 860, 0, 0);
        } else if (page === 5) {
            has('eagle') && H.eagle(g, { x: 150, y: 250, rot: 0.5, seed: 'b', flip: true });
            has('eagle') && H.eagle(g, { x: 150, y: 660, rot: -2.4, seed: 'c' });
            has('votive') && H.votive(g, { x: 420, y: 450, rot: 0.3, seed: 'b' });
            has('byzantine') && H.byzantine(g, { x: 660, y: 250, rot: -0.6, seed: 'b' });
            has('byzantine') && H.byzantine(g, { x: 660, y: 680, rot: 2.2, s: 0.8, seed: 'c' });
            has('astrolabe') && H.astrolabe(g, { x: 930, y: 450, rot: 0.4, seed: 'b', turn: 1.1, rule: -0.5 });
            has('fawn') && H.fawn(g, { x: 1200, y: 250, rot: -0.3, seed: 'b' });
            has('fawn') && H.fawn(g, { x: 1200, y: 680, rot: 1.2, s: 0.8, seed: 'c' });
            has('alicatado') && H.alicatado(g, { x: 1450, y: 250, rot: 0.5, s: 0.7, seed: 'b' });
            has('alicatado') && H.alicatado(g, { x: 1440, y: 670, w: 240, h: 380, rot: -0.2, s: 0.8, seed: 'c' });
        } else if (page === 6) {
            const sheet = Motion.layer(env, 'heirlooms-sheet', (q) => row(q));
            Motion.drawLayer(g, env, sheet);
            S.tooth(g, { x: 0, y: 0, w: 1600, h: 900 });
        } else {
            const n = NAMES[page - 7];
            if (n && has(n)) H[n](g, { x: 800, y: 450, s: n === 'eagle' ? 4 : n === 'alicatado' ? 2.6 : 3 });
        }
    },
    post(ctx, t, env) {
        if (Math.floor(t * 12 + 1e-6) === 6) Souvenir.finish(ctx, env, 0);
    },
});
