// pier-pressure · key art for «Pier Pressure», the opening of a cartoon that never existed:
// Captain makes off with a chip over the quay of Gull Harbor and the whole gang goes after
// him. One held drawing that breathes on twos (the style's poster and its first test).
const DIR = 'sandbox/2026-11-14-pier-pressure/';
Motion.scene({
    fps: 24,
    duration: 4,
    logical: [1600, 900],
    uses: [
        'styles/skate-toon/toon.js', 'styles/skate-toon/kid.js',
        ...['common', 'props', 'kit', 'hoagie', 'milo', 'pip', 'dot', 'captain'].map((f) => DIR + 'cast/' + f + '.js'),
        { src: DIR + 'set.js', optional: true },
    ],
    fonts: [{ family: 'Bangers', src: 'fonts/Bangers-Regular.ttf' }],
    bpm: 120,
    shots: [[0, 4, 'Key art']],

    draw(g, t, env) {
        const T = SkateToon, C = T.COL, { W, H } = env;
        const tt = T.onTwos(t), d = T.drawing(t);
        // everything hangs in the air and drifts a little, each on its own phase
        const bob = (ph, amp = 1) => Math.sin(tt * Math.PI + ph) * amp;
        const blink = (k) => d % 48 === k;
        const GY = 770;

        if (window.Harbor) Harbor.back(g, env, t);
        else {
            g.fillStyle = C.sky;
            g.fillRect(0, 0, W, H);
            T.slab(g, [[-20, 620], [1620, 606], [1620, 920], [-20, 920]], { fill: C.concrete, seed: 'quay' });
        }

        // Aunt Dot, back by her hut, has seen it all before
        Cast.draw(g, 'dot', {
            turn: 0.45, hip: [1, 0], lean: 0.02, tilt: -0.04, arms: [[1.05, -2.0], [1.05, -2.0]], armFront: ['fore', 'fore'], hands: ['fist', 'fist'], handBack: [true, true],
            head: { tilt: 0.05 + bob(1, 0.01), turn: 0.7 }, face: { mouth: 'smirk', look: [0.6, -0.5], lid: 0.3, brow: -0.2, blink: blink(40) },
        }, 196, 742, 2.5);

        // Captain, away with the first chip of the day
        Cast.gullFly(g, 1392, 132 + bob(0.4, 5), 3.5, { flap: 0.5 + bob(0, 0.5), look: [-0.6, 0.5], lid: blink(26) ? 0.95 : 0.36 });
        // Hoagie jumps, his camcorder a beat behind him on its strap
        Cast.draw(g, 'hoagie', {
            turn: 0.3, hip: [0, -17 + bob(0.6, 1.4)], lean: 0.1, tilt: 0.1, cam: [19, 3 + bob(1.8, 2)],
            feet: [[-15, 15, 0.4], [13, 25, -0.35]],
            arms: [[2.25, 0.3], [2.0, 0.55]], hands: ['open', 'open'], handScale: [1.1, 1],
            head: { tilt: -0.1, turn: 0.55 }, face: { mouth: 'yell', look: [0.5, -0.5], brow: 0.9, blink: blink(33) },
        }, 590, GY - 40, 4.25);

        // Milo has worked out the angle and is falling anyway; his board leaves without him
        Cast.board(g, 1490, 640 + bob(2.2, 3), 4.1, -0.55, { deck: C.navy, wheel: C.orange });
        Cast.draw(g, 'milo', {
            turn: 0.2, hip: [-5, -4 + bob(1.2, 1.2)], lean: -0.36, tilt: -0.1, knee: [-1, 1],
            feet: [[-13, 3, 0.45, { flip: true }], [17, 30, -1.0, { view: 'sole', scale: 1.5 }]],
            arms: [[2.2, 0.7], [1.75, -0.75]], hands: ['open', 'open'], handScale: [1, 1.2],
            head: { tilt: -0.34, turn: 0.35 }, face: { mouth: 'ooh', look: [0.2, -0.7], brow: 1, wide: 1.08, blink: blink(14) },
        }, 1236, GY + 16, 4.15);

        // Kit, off the sea wall and over everybody, one hand out for the gull
        const kx = 900, ky = 596 + bob(0, 6), ks = 4.2;
        Cast.board(g, kx + 20, ky - 31 * ks, ks, 0.2);
        Cast.draw(g, 'kit', {
            turn: 0.5, hip: [-2, -26], lean: 0.2, tilt: 0.18, knee: [-1, 1],
            feet: [[-15, 30, -0.2, { view: 'sole', scale: 1.4, flip: true }], [15, 36, 0.25, { flip: false }]],
            arms: [[1.55, 0.7], [2.2, 0.35]], hands: ['open', 'open'], handScale: [1, 1.25],
            head: { tilt: 0.2, turn: 0.85, dx: 2 }, face: { mouth: 'yell', look: [0.5, -0.4], brow: 0.9, blink: blink(21) },
        }, kx, ky, ks);

        // the cone he took it from, spilling the rest
        Cast.cone(g, 1178, 116 + bob(2.4, 5), 3.6, 2.2, 3);
        const chips = [[1196, 30, 0.7, 9], [1246, 96, -0.5, 8], [1232, 190, 1.9, 7], [1276, 34, 2.6, 8], [1150, 44, 0.2, 7]];
        chips.forEach(([cx, cy, a, l], i) => Cast.chip(g, cx, cy + bob(i * 1.3, 4), 3.6, a + bob(i, 0.12), l));

        // Pip, nearest us, points out where he went
        Cast.scooter(g, 78, 934, 5.6);
        Cast.draw(g, 'pip', {
            turn: 0.45, hip: [1, 0.4 + bob(2.6, 0.8)], lean: 0.05, tilt: -0.12,
            arms: [[1.0, -1.9], [1.85, 0.6]], armFront: ['fore', false], hands: ['fist', 'point'], handBack: [true, false], handScale: [1, 1.15],
            head: { tilt: -0.2, turn: 0.8 }, face: { mouth: 'open', look: [0.5, -0.6], brow: 0.5, blink: blink(7) },
        }, 330, 950, 6);

        if (window.Harbor) Harbor.fore(g, env, t);

        // the title, lettered by hand on a board
        g.save();
        g.translate(826, 806);
        g.rotate(-0.04);
        T.slab(g, [[-250, -66], [246, -78], [258, 66], [-244, 74]], { fill: C.navy, seed: 'title-board', over: 2.6, w: T.LINE });
        T.slab(g, [[-236, -54], [232, -65], [243, 54], [-231, 61]], { fill: null, seed: 'title-rule', over: 0.6, w: T.LINE_FINE, color: C.roadLine });
        T.sign(g, 'PIER PRESSURE', 4, 34, { size: 104, fill: [C.roadLine, C.white, C.magenta], drop: '#04628a', seed: 'title' + (d % 24 < 12 ? 0 : 1), w: T.LINE, track: 0.02 });
        g.restore();
    },
});
