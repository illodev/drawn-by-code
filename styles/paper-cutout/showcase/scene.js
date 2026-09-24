// Showcase of the paper-cutout detail pieces (styles/paper-cutout/detail.js): hands in every
// pose, fabric/paper/wood textures, printed papers, marker lines, tapered strips, punched
// holes, creases and paper in perspective. A visual test: run
// `node engine/review.mjs styles/paper-cutout/showcase/scene.js` after touching detail.js.
const POSES = ['open', 'wave', 'point', 'fist', 'pinch', 'hold', 'rest', 'grip'];
// A point in a hand's local frame (PaperDetail.hand: wrist at x, y, fingers up) → world.
function handPoint(x, y, size, rot, mirror, [lx, ly]) {
    const k = size / 60, u = (mirror ? -lx : lx) * k, v = ly * k;
    return [x + u * Math.cos(rot) - v * Math.sin(rot), y + u * Math.sin(rot) + v * Math.cos(rot)];
}
// Second shot: every pose large, a paper held between the parts, a pen in a grip, a hand
// resting on a desk, a mirrored hand and other skin tones.
function drawHands(g, t, kit) {
    const P = Paper, D = PaperDetail, S = 96;
    kit.paperBg(g, 'showcase-hands', '#3a2146');
    const label = (s, x, y) => kit.hand(g, s, x, y, 26, '#f4ecda', { align: 'center' });
    const row1 = [['open', {}], ['wave', { skin: '#c98e6a' }], ['point', {}], ['fist', { skin: '#8d5a3b' }], ['pinch', {}]];
    row1.forEach(([pose, o], i) => {
        const x = 170 + i * 315, y = 370;
        D.hand(g, x, y, S, Math.sin(t * 2 + i) * 0.06, pose, { cuff: '#389486', ...o });
        label(pose + (o.skin ? ' · ' + o.skin : ''), x, y + 90);
    });
    // hold: back part, the paper, front part
    {
        const x = 350, y = 830, rot = -0.3;
        D.hand(g, x, y, S, rot, 'hold', { cuff: '#d9473b', sleeve: '#b83a30', part: 'back' });
        const [ax, ay] = handPoint(x, y, S, rot, false, D.handAnchor('hold'));
        kit.sprite('show-held-paper', { x: -10, y: -10, w: 240, h: 190 }, (c) => P.cutout(c, [[0, 0], [220, 6], [214, 170], [4, 166]], '#f7f3e7', 'heldpaper', { border: 2, shadow: 0.2, inner: (cc) => { cc.strokeStyle = '#b7c3de'; for (let yy = 30; yy < 170; yy += 26) (cc.beginPath(), cc.moveTo(0, yy), cc.lineTo(220, yy), cc.stroke()); } }), 1.4)
            .draw((g.save(), g.translate(ax - 200, ay - 150), g.rotate(-0.04), g));
        g.restore();
        D.hand(g, x, y, S, rot, 'hold', { cuff: '#d9473b', part: 'front' });
        label('hold (paper between parts)', 200, 870);
    }
    // rest: on a desk
    {
        kit.sprite('show-desk', { x: 450, y: 700, w: 380, h: 140 }, (c) => P.cutout(c, P.roundRect(460, 710, 360, 120, 6), '#b8895b', 'showdesk', { border: 2.4, inner: (cc, b) => D.woodGrain(cc, b, '#b8895b') }), 1.2).draw(g);
        D.hand(g, 640, 700, S, Math.PI, 'rest', { cuff: '#389486', sleeve: '#2d7a6e' });
        label('rest (on a desk)', 640, 870);
    }
    // grip: a pen through the fist
    {
        const x = 960, y = 800, rot = 0;
        D.hand(g, x, y, S, rot, 'grip', { cuff: '#389486', part: 'back' });
        const [ax, ay] = handPoint(x, y, S, rot, false, D.handAnchor('grip'));
        kit.sprite('show-pen', { x: -120, y: -20, w: 240, h: 40 }, (c) => {
            P.cutout(c, P.noodle([[-105, 0], [0, 0], [100, 0]], 20, 20), '#375eaf', 'showpen', { border: 2 });
            P.cutout(c, [[-118, 0], [-104, -8], [-104, 8]], '#2b2b33', 'showpentip', { border: 1.4 });
        }, 1.6).draw((g.save(), g.translate(ax, ay), g.rotate(-0.35), g));
        g.restore();
        D.hand(g, x, y, S, rot, 'grip', { cuff: '#389486', part: 'front' });
        label('grip (pen between parts)', x, y + 70);
    }
    // mirrored: the other hand, other skin tone
    D.hand(g, 1300, 800, S, 0.15, 'open', { cuff: '#f0cc51', mirror: true, skin: '#a86f4c' });
    label('open · mirror', 1300, 870);
    D.hand(g, 1480, 800, S * 0.6, -0.2, 'point', { mirror: true, skin: '#f1d0b5' });
    label('point 60 %', 1480, 870);
}

// Third shot: the hand-to-object poses and handedness. o.side picks the hand; the same arm
// from the left of the image is her right hand. palm (both hands), wrap round a mug (both
// hands, mug between the parts), edge (fingers hooked over a board's top from behind).
function drawHands2(g, t, kit) {
    const P = Paper, D = PaperDetail, S = 96;
    kit.paperBg(g, 'showcase-hands2', '#24424a');
    const label = (s, x, y) => kit.hand(g, s, x, y, 26, '#f4ecda', { align: 'center' });
    D.hand(g, 150, 400, S, 0.25, 'palm', { side: 'right', cuff: '#389486' });
    D.hand(g, 360, 400, S, -0.25, 'palm', { side: 'left', cuff: '#389486' });
    label('palm · right, left', 255, 480);
    // wrap: the right hand from the left (rot π/2), the left hand from the right (rot -π/2)
    const mug = kit.sprite('show-mug', { x: -60, y: -70, w: 120, h: 140 }, (c) => {
        P.cutout(c, P.roundRect(-46, -52, 92, 110, 14), '#f6efe2', 'showmug', { border: 2.2, shadow: 0.2 });
        P.cutout(c, [[-46, -22], [46, -22], [46, -12], [-46, -12]], '#d2563f', 'showmugband', { border: 0, shadow: 0 });
    }, 1.6);
    [[640, 'right', Math.PI / 2], [1000, 'left', -Math.PI / 2]].forEach(([mx, side, rot]) => {
        const k = S / 60, [ax, ay] = D.handAnchor('wrap');
        const u = (side === 'left' ? -ax : ax) * k, v = ay * k;
        const x = mx - (u * Math.cos(rot) - v * Math.sin(rot)), y = 400 - (u * Math.sin(rot) + v * Math.cos(rot));
        D.hand(g, x, y, S, rot, 'wrap', { side, cuff: '#d9473b', sleeve: '#b83a30', part: 'back' });
        mug.draw((g.save(), g.translate(mx, 400), g));
        g.restore();
        D.hand(g, x, y, S, rot, 'wrap', { side, part: 'front' });
    });
    label('wrap · right, left (mug between parts)', 820, 520);
    // edge: fingers over the top of a board, the wrist behind it
    kit.sprite('show-board', { x: 1180, y: 300, w: 380, h: 300 }, (c) => P.cutout(c, P.roundRect(1190, 320, 360, 260, 6), '#f7f3e7', 'showboard', { border: 2.4 }), 1.2).draw(g);
    D.hand(g, 1280, 320 - 50 * S / 60, S, Math.PI + 0.1, 'edge', { side: 'left' });
    D.hand(g, 1460, 320 - 50 * S / 60, S, Math.PI - 0.1, 'edge', { side: 'right' });
    label('edge (over the top, from behind)', 1370, 640);
    D.hand(g, 300, 820, S, -0.3, 'pointBack', { side: 'right', cuff: '#389486' });
    D.hand(g, 520, 820, S, 0.3, 'pointBack', { side: 'left', cuff: '#389486' });
    label('pointBack · right, left', 410, 880);
}

Motion.scene({
    fps: 24,
    duration: 9,
    logical: [1600, 900],
    uses: ['styles/paper-cutout/paper.js', 'styles/paper-cutout/kit.js', 'styles/paper-cutout/detail.js'],
    fonts: [{ family: 'Hand', src: 'fonts/PatrickHand-Regular.ttf' }],
    shots: [[0, 3, 'Showcase'], [3, 6, 'Hands'], [6, 9, 'Hands 2']],

    setup(env) {
        return { kit: PaperKit.make(env, { font: 'Hand' }) };
    },

    draw(g, t, env) {
        const { kit } = env.state, P = Paper, D = PaperDetail;
        kit.paperBg(g, 'showcase', '#3a2146');
        if (t >= 6) return drawHands2(g, t, kit);
        if (t >= 3) return drawHands(g, t, kit);
        // hands at miniature size (the fingers must still read): every pose, one with a cuff
        POSES.forEach((pose, i) => {
            D.hand(g, 110 + i * 125, 400, 40, Math.sin(t * 2 + i) * 0.06, pose, { cuff: i % 2 ? '#389486' : undefined });
            kit.hand(g, pose, 110 + i * 125, 450, 24, '#f4ecda', { align: 'center' });
        });
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
