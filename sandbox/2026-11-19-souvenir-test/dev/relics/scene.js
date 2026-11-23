// Dev sheet for things/relics.js: the relics of the ancient peoples on the emblem's indigo
// ground. One page every 1/8 s (3 frames), raw paint except the last:
//   0      all six at film size (s = 1)
//   0.125  the gold and the murex at 2×      0.25   the helmet and the stele at 2×
//   0.375  the amphora at 2.4×               0.5    the mosaic at 2.6×
//   0.625  4× crops: three bosses and a rosette, the cuff · the murex's spines and lip · the helmet's eye and patina
//   0.75   4× crops: the amphora's stamp and painted inscription · the bird's head, twenty tesserae and the section · the stele
//   0.875  turned (the light must stay at the top left)
//   1      on a transparent sheet (as a rig layer is), with tooth and the lens finish
// The 4× pages are slow (the mosaic is laid stone by stone and lit per pixel at 5 px a unit).
const SV = 'sandbox/2026-11-19-souvenir-test/';
Motion.scene({
    fps: 24, duration: 1.25, logical: [1600, 900],
    uses: ['styles/souvenir/souvenir.js', SV + 'things/relics.js'],
    draw(g, t, env) {
        const S = Souvenir, R = Relics, page = Math.floor(t * 8 + 1e-6);
        g.fillStyle = '#232749';
        g.fillRect(0, 0, 1600, 900);
        const has = (k) => typeof R[k] === 'function';
        const put = (k, o) => has(k) && R[k](g, o);
        // a window on a relic at 4×: (fx, fy) is the point of the relic shown at its middle
        const win = (k, x, y, w, h, fx, fy, s = 4) => {
            if (!has(k)) return;
            g.save();
            g.beginPath();
            g.rect(x, y, w, h);
            g.clip();
            R[k](g, { x: x + w / 2 - fx * s, y: y + h / 2 - fy * s, s });
            g.restore();
            g.strokeStyle = 'rgba(255,255,255,0.25)';
            g.lineWidth = 1;
            g.strokeRect(x, y, w, h);
        };
        const row = (q) => {
            const d = (k, o) => has(k) && R[k](q, o);
            d('carambolo', { x: 190, y: 190 });
            d('murex', { x: 480, y: 170 });
            d('helmet', { x: 740, y: 200 });
            d('stele', { x: 1000, y: 200 });
            d('amphora', { x: 1300, y: 220 });
            d('mosaic', { x: 300, y: 620 });
        };
        if (page === 0) row(g);
        else if (page === 1) {
            put('carambolo', { x: 420, y: 450, s: 2 });
            put('murex', { x: 1150, y: 450, s: 2 });
        } else if (page === 2) {
            put('helmet', { x: 450, y: 450, s: 2 });
            put('stele', { x: 1150, y: 450, s: 2 });
        } else if (page === 3) put('amphora', { x: 800, y: 450, s: 2.4 });
        else if (page === 4) put('mosaic', { x: 800, y: 450, s: 2.6 });
        else if (page === 5) {
            win('carambolo', 20, 20, 500, 420, -60, -34);
            win('carambolo', 20, 460, 500, 420, 62, 40);
            win('murex', 540, 20, 520, 860, 26, -8);
            win('helmet', 1080, 20, 500, 860, 14, 8);
        } else if (page === 6) {
            win('amphora', 20, 20, 500, 420, -8, -112);
            win('amphora', 20, 460, 500, 420, 22, -36);
            win('mosaic', 540, 20, 520, 420, -40, -22);
            win('mosaic', 540, 460, 520, 420, 62, 62);
            win('stele', 1080, 20, 500, 860, 0, 0);
        } else if (page === 7) {
            put('carambolo', { x: 200, y: 200, rot: 0.7 });
            put('murex', { x: 520, y: 200, rot: -1.2 });
            put('helmet', { x: 820, y: 220, rot: 2.4 });
            put('stele', { x: 1120, y: 220, rot: -0.5 });
            put('amphora', { x: 1380, y: 500, rot: 1.6 });
            put('mosaic', { x: 320, y: 620, rot: -2.6 });
            put('carambolo', { x: 760, y: 660, rot: Math.PI });
            put('murex', { x: 1060, y: 700, rot: 1.9 });
        } else {
            const sheet = Motion.layer(env, 'relics-sheet', (q) => row(q));
            Motion.drawLayer(g, env, sheet);
            S.tooth(g, { x: 0, y: 0, w: 1600, h: 900 });
        }
    },
    post(ctx, t, env) {
        if (Math.floor(t * 8 + 1e-6) === 8) Souvenir.finish(ctx, env, 0);
    },
});
