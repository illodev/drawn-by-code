// Showcase of the paper-cutout detail pieces (styles/paper-cutout/detail.js): hands in every
// pose, fabric/paper/wood textures, printed papers, marker lines, tapered strips, punched
// holes, creases and paper in perspective. A visual test: run
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
            D.hand(g, 140 + i * 170, 360, 110, Math.sin(t * 2 + i) * 0.1, pose, { cuff: '#389486' });
            kit.hand(g, pose, 140 + i * 170, 425, 30, '#f4ecda', { align: 'center' });
        });
        D.hand(g, 820, 360, 110, -0.2, 'open', { cuff: '#d9473b', mirror: true, skin: '#c98e6a' });
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
        // printed papers for collage props (second row, smaller)
        const small = (x, y, color, seed, inner, label) => {
            kit.sprite('sm' + seed, { x: x - 8, y: y - 8, w: 186, h: 116 }, (c) => P.cutout(c, P.roundRect(x, y, 170, 100, 8), color, seed, { border: 2.6, inner }), 1.2).draw(g);
            kit.hand(g, label, x + 85, y + 128, 22, '#f4ecda', { align: 'center' });
        };
        small(80, 20, '#e6e2d8', 'bars', (c, b) => D.wordBars(c, b, { cols: 56, blocks: [[10, 10, 60, 30]] }), 'wordBars');
        small(270, 20, '#f3eee2', 'cursive', (c, b) => D.cursive(c, b, '#8d8578', { lineH: 18, xh: 6, hw: 4, width: 1.1 }), 'cursive');
        small(460, 20, '#d9473b', 'sheet', (c, b) => D.sheetMusic(c, b, { ink: '#f7efe8', sp: 5, period: 40 }), 'sheetMusic');
        small(650, 20, '#b58ad6', 'map', (c, b) => D.mapPaper(c, b, { seed: 'map1' }), 'mapPaper');
        // a marker line revealed along its length, a tapered strip curling, a punched hole
        const spiral = Array.from({ length: 80 }, (_, i) => [1000 + Math.cos(i * 0.18) * i * 0.9, 80 + Math.sin(i * 0.18) * i * 0.9]);
        D.markerPath(g, spiral, { w: 9, core: 0.62, color: '#d9735e', edge: '#e9a58f', seg: [20, 34], seed: 'showspiral', upto: 40 + ((t * 120) % 400) });
        kit.hand(g, 'markerPath', 1000, 170, 22, '#f4ecda', { align: 'center' });
        const ctrl = D.curl([[1180, 160], [1200, 110], [1240, 80], [1280, 80], [1300, 110]], 1 + 0.4 * Math.sin(t * 3));
        P.cutout(g, D.taper(ctrl, [22, 18, 14, 10, 8]), '#b08ecf', 'showtaper', { border: 2.4, shadow: 0.1 });
        kit.hand(g, 'taper + curl', 1240, 190, 22, '#f4ecda', { align: 'center' });
        kit.sprite('showpunch', { x: 1370, y: 40, w: 140, h: 130 }, (c) => {
            P.cutout(c, D.spline([[1380, 100], [1400, 55], [1450, 45], [1495, 70], [1500, 120], [1460, 160], [1405, 150]], 6), '#f0cc51', 'punchb', { border: 3 });
            D.punch(c, D.spline([[1430, 100], [1445, 80], [1465, 85], [1470, 110], [1450, 125], [1432, 118]], 6), 'punchh');
        }, 1.4).draw(g);
        kit.hand(g, 'punch', 1440, 190, 22, '#f4ecda', { align: 'center' });
        // paper in perspective: a lined sheet that bends up and flips
        const sheet = kit.sprite('persp-sheet', { x: 0, y: 0, w: 300, h: 220 }, (c) => {
            P.cutout(c, P.roundRect(10, 10, 280, 200, 3), '#f7f3e7', 'persp', { border: 2, shadow: 0, inner: (cc) => { cc.strokeStyle = '#b7c3de'; for (let y = 50; y < 210; y += 28) (cc.beginPath(), cc.moveTo(10, y), cc.lineTo(290, y), cc.stroke()); } });
            D.crease(c, [150, 12], [150, 208]);
        }, 1.4);
        const lift = 0.5 + 0.5 * Math.sin(t * 2.5);
        Motion.quad(g, sheet.canvas, [[1100, 250], [1480, 270 - 60 * lift], [1460, 460], [1090, 440]], 10, null, { bend: (u, v) => [0, -Math.sin(u * Math.PI) * 30 * lift * (1 - v)] });
        kit.hand(g, 'Motion.quad (perspective, bend)', 1280, 500, 28, '#f4ecda', { align: 'center' });
    },

    post(ctx, t, env) {
        env.state.kit.grainPost(ctx);
    },
});
