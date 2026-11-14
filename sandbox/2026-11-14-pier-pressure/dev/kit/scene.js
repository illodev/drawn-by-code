// pier-pressure · dev: Kit alone, at the size she is judged, standing and in the air.
const DIR = 'sandbox/2026-11-14-pier-pressure/cast/';
Motion.scene({
    fps: 24, duration: 1, logical: [1600, 900],
    uses: ['styles/skate-toon/toon.js', 'styles/skate-toon/kid.js', DIR + 'common.js', DIR + 'props.js', DIR + 'kit.js'],
    fonts: [{ family: 'Bangers', src: 'fonts/Bangers-Regular.ttf' }],
    shots: [[0, 1, 'Kit']],
    draw(g, t, env) {
        const T = SkateToon, C = T.COL;
        g.fillStyle = C.sky;
        g.fillRect(0, 0, env.W, env.H);
        T.slab(g, [[-20, 820], [1620, 812], [1620, 920], [-20, 920]], { fill: C.concrete, seed: 'quay' });
        const s = 6.2;
        Cast.draw(g, 'kit', {
            turn: 0.5, hip: [3, 0.6], lean: -0.06, tilt: 0.08, feet: [[-12, 0, 0, { flip: true }], [13, 0, 0]],
            arms: [[1.0, -1.9], [1.3, 1.25]], armFront: ['fore', true], hands: ['fist', 'thumb'], handBack: [true, false],
            head: { tilt: 0.12, turn: 0.75 }, face: { mouth: 'grin', look: [0.4, 0], brow: 0.3 },
        }, 380, 850, s);
        // in the air over her board: knees up, one boot kicked at us
        const x = 1090, y = 850;
        Cast.board(g, x - 22, y - 31 * s, s, -0.2);
        Cast.draw(g, 'kit', {
            turn: -0.5, hip: [2, -26], lean: -0.2, tilt: -0.18, knee: [-1, -1],
            feet: [[-15, 36, -0.25, { flip: true }], [15, 30, 0.2, { view: 'sole', scale: 1.4 }]],
            arms: [[2.2, 0.35], [1.55, 0.7]], hands: ['open', 'open'], handScale: [1.25, 1],
            head: { tilt: -0.2, turn: -0.85, dx: -2 }, face: { mouth: 'yell', look: [-0.5, -0.4], brow: 0.9 },
        }, x, y, s);
    },
});
