// Dev sheet for things/papers.js: the poster, the tile plaque, the lottery ticket, the
// stamp and the matchbox on the emblem's indigo ground. Everything is painted on a
// transparent sheet first (as a rig layer is) and laid on the ground. One page every 1/8 s:
//   0      the five at film size (s = 1)
//   0.125  poster at 2×, top half          0.25   poster at 2×, bottom half
//   0.375  plaque and ticket at 2×         0.5    stamp and matchbox at 2× (and at 3×)
//   0.625  4× crops: the poster's smallest lettering · the tile glaze
//   0.75   4× crops: the guilloche · the stamp's hatching
//   0.875  turned (the light must stay at the top left), other seeds, one on another
//   1      the five at film size with tooth and the lens finish
const PV = 'sandbox/2026-11-19-souvenir-test/';
Motion.scene({
    fps: 24, duration: 1.25, logical: [1600, 900],
    uses: ['styles/souvenir/souvenir.js', PV + 'things/papers.js'],
    fonts: [
        { family: 'IM Fell DW Pica SC', src: 'fonts/IMFellDWPicaSC-Regular.ttf' },
        { family: 'Shrikhand', src: 'fonts/Shrikhand-latin.woff2' },
        { family: 'Anton', src: 'fonts/Anton-latin.woff2' },
        { family: 'Lora', src: 'fonts/Lora-Medium-latin.woff2' },
        { family: 'Titan One', src: 'fonts/TitanOne-latin.woff2' },
    ],
    draw(g, t, env) {
        const S = Souvenir, page = Math.floor(t * 8 + 1e-6);
        g.fillStyle = '#232749';
        g.fillRect(0, 0, 1600, 900);
        const has = (n) => typeof Papers[n] === 'function';
        const P = (q, n, o) => has(n) && Papers[n](q, o);
        // a window of the page: what is painted inside is clipped to it
        const pane = (q, x, y, w, h, fn) => {
            q.save();
            q.beginPath();
            q.rect(x, y, w, h);
            q.clip();
            fn(q);
            q.restore();
            q.strokeStyle = 'rgba(255,255,255,0.25)';
            q.lineWidth = 1;
            q.strokeRect(x, y, w, h);
        };
        const five = (q) => {
            P(q, 'poster', { x: 260, y: 450 });
            P(q, 'plaque', { x: 720, y: 150 });
            P(q, 'ticket', { x: 720, y: 400 });
            P(q, 'stamp', { x: 590, y: 660 });
            P(q, 'matchbox', { x: 800, y: 670 });
            // …and as they will lie: one on another, turned
            P(q, 'poster', { x: 1260, y: 470, rot: -0.14, s: 0.9, seed: 'b' });
            P(q, 'ticket', { x: 1400, y: 250, rot: 0.3, seed: 'b' });
            P(q, 'stamp', { x: 1130, y: 250, rot: -0.35, seed: 'b' });
            P(q, 'matchbox', { x: 1400, y: 720, rot: 0.5, seed: 'b' });
            P(q, 'plaque', { x: 1180, y: 800, rot: -0.08, s: 0.8, seed: 'b' });
        };
        const sheet = Motion.layer(env, 'papers-sheet', (q) => {
            if (page === 0 || page === 8) five(q);
            else if (page === 1) P(q, 'poster', { x: 800, y: 640, s: 2 });
            else if (page === 2) P(q, 'poster', { x: 800, y: 260, s: 2 });
            else if (page === 3) {
                P(q, 'plaque', { x: 800, y: 210, s: 2 });
                P(q, 'ticket', { x: 800, y: 640, s: 2 });
            } else if (page === 4) {
                P(q, 'stamp', { x: 190, y: 250, s: 2 });
                P(q, 'stamp', { x: 220, y: 650, s: 3, rot: 0.2, seed: 'b' });
                P(q, 'matchbox', { x: 640, y: 240, s: 2 });
                P(q, 'matchbox', { x: 1180, y: 500, s: 3.4, rot: -0.2 });
                P(q, 'matchbox', { x: 600, y: 660, s: 2, rot: 2.6, seed: 'b' });
            } else if (page === 5) {
                pane(q, 0, 0, 800, 900, (p) => P(p, 'poster', { x: 400, y: 450 - 4 * 210, s: 4 }));
                pane(q, 800, 0, 800, 900, (p) => P(p, 'plaque', { x: 1200 + 4 * 96, y: 450 - 4 * 8, s: 4 }));
            } else if (page === 6) {
                pane(q, 0, 0, 1000, 900, (p) => P(p, 'ticket', { x: 500 + 4 * 30, y: 450 - 4 * 14, s: 4 }));
                pane(q, 1000, 0, 600, 900, (p) => P(p, 'stamp', { x: 1300, y: 450, s: 5.6 }));
            } else if (page === 7) {
                P(q, 'poster', { x: 330, y: 450, rot: 2.5, seed: 'c' });
                P(q, 'plaque', { x: 800, y: 170, rot: 0.5, seed: 'c' });
                P(q, 'plaque', { x: 1260, y: 190, rot: 3.3, seed: 'd' });
                P(q, 'ticket', { x: 800, y: 480, rot: -1.2, seed: 'c' });
                P(q, 'ticket', { x: 1050, y: 730, rot: 2.9, seed: 'd' });
                P(q, 'stamp', { x: 1000, y: 420, rot: 1.1, s: 2, seed: 'c' });
                P(q, 'stamp', { x: 1180, y: 420, rot: -2.4, s: 2, seed: 'd' });
                P(q, 'matchbox', { x: 1400, y: 470, rot: 1.6, s: 1.6, seed: 'c' });
                P(q, 'matchbox', { x: 1400, y: 760, rot: -2.7, s: 1.6, seed: 'd' });
                P(q, 'matchbox', { x: 720, y: 780, rot: -0.9, s: 1.6, seed: 'e' });
            } else {
                P(q, 'poster', { x: 400, y: 450 + 4 * 10, s: 4, rot: -0.14 });
            }
            if (page === 8) S.tooth(q, { x: 0, y: 0, w: 1600, h: 900 });
        });
        Motion.drawLayer(g, env, sheet);
    },
    post(ctx, t, env) {
        if (Math.floor(t * 8 + 1e-6) === 8) Souvenir.finish(ctx, env, 0);
    },
});
