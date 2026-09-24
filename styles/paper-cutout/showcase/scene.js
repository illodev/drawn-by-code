// Showcase of the paper-cutout detail pieces (styles/paper-cutout/detail.js): hands in every
// pose, fabric/paper/wood textures, creases and paper in perspective. A visual test: run
// `node engine/review.mjs styles/paper-cutout/showcase/scene.js` after touching detail.js.
Motion.scene({
    fps: 24,
    duration: 3,
    logical: [1600, 900],
    uses: ['styles/paper-cutout/paper.js', 'styles/paper-cutout/kit.js', 'styles/paper-cutout/detail.js'],
    fonts: [{ family: 'Hand', src: 'fonts/PatrickHand-Regular.ttf' }],
    shots: [[0, 3, 'Showcase']],

    setup(env) {
        return { kit: PaperKit.make(env, { font: 'Hand' }) };
    },

    draw(g, t, env) {
        const { kit } = env.state, P = Paper, D = PaperDetail;
        kit.paperBg(g, 'showcase', '#3a2146');
        // hands: open, wave, pinch, fist (with sweater cuffs), and a mirrored one
        ['open', 'wave', 'pinch', 'fist'].forEach((pose, i) => {
            D.hand(g, 140 + i * 170, 330, 110, Math.sin(t * 2 + i) * 0.1, pose, { cuff: '#389486' });
            kit.hand(g, pose, 140 + i * 170, 400, 30, '#f4ecda', { align: 'center' });
        });
        D.hand(g, 820, 330, 110, -0.2, 'open', { cuff: '#d9473b', mirror: true, skin: '#c98e6a' });
        // textures on cut pieces
        const swatch = (x, y, color, seed, inner, label) => {
            kit.sprite('sw' + seed, { x: x - 10, y: y - 10, w: 250, h: 190 }, (c) => P.cutout(c, P.roundRect(x, y, 230, 170, 10), color, seed, { border: 3, inner }), 1.2).draw(g);
            kit.hand(g, label, x + 115, y + 205, 28, '#f4ecda', { align: 'center' });
        };
        swatch(80, 520, '#389486', 'knit', (c, b) => D.knit(c, b, '#389486'), 'knit');
        swatch(340, 520, '#389486', 'rib', (c, b) => D.rib(c, b, '#389486'), 'rib');
        swatch(600, 520, '#ebe6da', 'news', (c, b) => D.newsprint(c, b), 'newsprint');
        swatch(860, 520, '#b8895b', 'wood', (c, b) => D.woodGrain(c, b, '#b8895b'), 'wood grain');
        swatch(1120, 520, '#2b211f', 'hairs', (c, b) => D.strands(c, b, '#2b211f'), 'hair strands');
        // paper in perspective: a lined sheet that bends up and flips
        const sheet = kit.sprite('persp-sheet', { x: 0, y: 0, w: 300, h: 220 }, (c) => {
            P.cutout(c, P.roundRect(10, 10, 280, 200, 3), '#f7f3e7', 'persp', { border: 2, shadow: 0, inner: (cc) => { cc.strokeStyle = '#b7c3de'; for (let y = 50; y < 210; y += 28) (cc.beginPath(), cc.moveTo(10, y), cc.lineTo(290, y), cc.stroke()); } });
            D.crease(c, [150, 12], [150, 208]);
        }, 1.4);
        const lift = 0.5 + 0.5 * Math.sin(t * 2.5);
        Motion.quad(g, sheet.canvas, [[1100, 150], [1480, 170 - 60 * lift], [1460, 420], [1090, 400]], 10, null, { bend: (u, v) => [0, -Math.sin(u * Math.PI) * 30 * lift * (1 - v)] });
        kit.hand(g, 'Motion.quad (perspective, bend)', 1280, 470, 28, '#f4ecda', { align: 'center' });
    },

    post(ctx, t, env) {
        env.state.kit.grainPost(ctx);
    },
});
