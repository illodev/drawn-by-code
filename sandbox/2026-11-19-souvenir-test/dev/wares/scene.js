// Dev sheet for things/wares.js: the botijo, the fino and its glass, the peineta, the
// biznaga and the feria lanterns on the emblem's indigo ground. Everything is painted on a
// transparent sheet first (as a rig layer is) and laid on the ground. One page every 1/8 s
// (3 frames), raw paint except the last two:
//   0      all five at film size (s = 1)
//   0.125  botijo and peineta at 2×          0.25   fino and biznaga at 2×
//   0.375  the lanterns at 2×
//   0.5    4×: the botijo's damp patch | the bottle's label
//   0.625  4×: the glass's rim | the peineta's openwork
//   0.75   4×: the jasmine flowers | one lantern
//   0.875  turned (the light must stay at the top left), other seeds
//   1      film size with tooth and the lens finish
//   1.125  on a painted ground (the glass lets it through, its caustic falls on it)
//   1.25   4×: the botijo's crown | the bottle's neck and capsule
//   1.375  4×: the peineta's teeth | the biznaga's bow and stalk
//   1.5    4×: the torn lantern | flags, cord and flex
const WV = 'sandbox/2026-11-19-souvenir-test/';
Motion.scene({
    fps: 24, duration: 1.625, logical: [1600, 900],
    uses: ['styles/souvenir/souvenir.js', WV + 'things/wares.js'],
    fonts: [{ family: 'IM Fell DW Pica SC', src: 'fonts/IMFellDWPicaSC-Regular.ttf' }, { family: 'Lora', src: 'fonts/Lora-Medium-latin.woff2' }],
    draw(g, t, env) {
        const S = Souvenir, page = Math.floor(t * 8 + 1e-6), W = Wares;
        const has = (k) => typeof W[k] === 'function';
        g.fillStyle = '#232749';
        g.fillRect(0, 0, 1600, 900);
        // two 4× crops side by side, each in its own window
        const windows = (left, right) => (q) => {
            [left, right].forEach((fn, i) => {
                q.save();
                q.beginPath();
                q.rect(i * 800 + 6, 6, 788, 888);
                q.clip();
                fn(q, i * 800 + 400, 450);
                q.restore();
            });
        };
        const row = (q) => {
            if (has('botijo')) W.botijo(q, { x: 150, y: 190 });
            if (has('fino')) W.fino(q, { x: 420, y: 200 });
            if (has('peineta')) W.peineta(q, { x: 700, y: 180 });
            if (has('biznaga')) W.biznaga(q, { x: 960, y: 200 });
            if (has('farolillos')) W.farolillos(q, { x: 760, y: 520 });
            if (has('botijo')) W.botijo(q, { x: 1250, y: 200, seed: 'b', s: 0.8 });
            if (has('peineta')) W.peineta(q, { x: 1450, y: 200, seed: 'b', s: 0.8 });
            if (has('biznaga')) W.biznaga(q, { x: 180, y: 640, seed: 'b', s: 0.8 });
            if (has('fino')) W.fino(q, { x: 480, y: 650, seed: 'b', s: 0.8 });
        };
        const pages = [
            row,
            (q) => {
                if (has('botijo')) W.botijo(q, { x: 420, y: 450, s: 2 });
                if (has('peineta')) W.peineta(q, { x: 1150, y: 450, s: 2 });
            },
            (q) => {
                if (has('fino')) W.fino(q, { x: 480, y: 450, s: 2 });
                if (has('biznaga')) W.biznaga(q, { x: 1150, y: 450, s: 2.0 });
            },
            (q) => {
                if (has('farolillos')) W.farolillos(q, { x: 100, y: 190, s: 2 });
            },
            windows(
                (q, cx, cy) => has('botijo') && W.botijo(q, { x: cx + 4 * 12, y: cy - 4 * 68, s: 4 }),
                (q, cx, cy) => has('fino') && W.fino(q, { x: cx + 4 * 30, y: cy - 4 * 68, s: 4 }),
            ),
            windows(
                (q, cx, cy) => has('fino') && W.fino(q, { x: cx - 4 * 30, y: cy - 4 * 44, s: 4 }),
                (q, cx, cy) => has('peineta') && W.peineta(q, { x: cx, y: cy + 4 * 52, s: 4 }),
            ),
            windows(
                (q, cx, cy) => has('biznaga') && W.biznaga(q, { x: cx, y: cy + 4 * 86, s: 4 }),
                (q, cx, cy) => has('farolillos') && W.farolillos(q, { x: cx - 4 * 350, y: cy - 4 * 150, s: 4 }),
            ),
            (q) => {
                if (has('botijo')) W.botijo(q, { x: 170, y: 230, rot: 0.5 });
                if (has('botijo')) W.botijo(q, { x: 170, y: 660, rot: -2.4, seed: 'c' });
                if (has('fino')) W.fino(q, { x: 480, y: 240, rot: -0.35 });
                if (has('fino')) W.fino(q, { x: 520, y: 680, rot: 1.57, s: 0.9, seed: 'c' });
                if (has('peineta')) W.peineta(q, { x: 860, y: 220, rot: 0.6 });
                if (has('peineta')) W.peineta(q, { x: 900, y: 670, rot: 3.0, seed: 'c' });
                if (has('biznaga')) W.biznaga(q, { x: 1180, y: 250, rot: -0.5 });
                if (has('biznaga')) W.biznaga(q, { x: 1200, y: 700, rot: 1.3, seed: 'c' });
                if (has('farolillos')) W.farolillos(q, { x: 1300, y: 420, n: 2, len: 280, sag: 50, seed: 'c' });
            },
            row,
            row,
            windows(
                (q, cx, cy) => has('botijo') && W.botijo(q, { x: cx - 4 * 2, y: cy + 4 * 62, s: 4 }),
                (q, cx, cy) => has('fino') && W.fino(q, { x: cx + 4 * 22, y: cy + 4 * 100, s: 4 }),
            ),
            windows(
                (q, cx, cy) => has('peineta') && W.peineta(q, { x: cx, y: cy - 4 * 62, s: 4 }),
                (q, cx, cy) => has('biznaga') && W.biznaga(q, { x: cx - 4 * 2, y: cy - 4 * 40, s: 4 }),
            ),
            windows(
                (q, cx, cy) => has('farolillos') && W.farolillos(q, { x: cx - 4 * 490, y: cy - 4 * 150, s: 4 }),
                (q, cx, cy) => has('farolillos') && W.farolillos(q, { x: cx - 4 * 140, y: cy - 4 * 40, s: 4 }),
            ),
        ];
        if (page === 9) {
            // a painted ground: a cream card and a red cloth
            const gr = g.createLinearGradient(0, 0, 1600, 900);
            gr.addColorStop(0, '#ecdcb4');
            gr.addColorStop(1, '#b9483c');
            g.fillStyle = gr;
            g.fillRect(0, 0, 1600, 900);
            row(g);
            return;
        }
        const sheet = Motion.layer(env, 'wares-sheet', pages[Math.min(page, pages.length - 1)]);
        Motion.drawLayer(g, env, sheet);
        if (page === 8) S.tooth(g, { x: 0, y: 0, w: 1600, h: 900 });
    },
    post(ctx, t, env) {
        if (Math.floor(t * 8 + 1e-6) === 8) Souvenir.finish(ctx, env, 0);
    },
});
