// pier-pressure · the cast of «Pier Pressure» lined up on the quay of Gull Harbor: the model
// sheet (render it with --at 0) and a first idle test, everyone keeping the beat on twos.
const DIR = 'sandbox/2026-11-14-pier-pressure/cast/';
Motion.scene({
    fps: 24,
    duration: 4,
    logical: [1600, 900],
    uses: ['styles/skate-toon/toon.js', 'styles/skate-toon/kid.js', ...['common', 'props', 'kit', 'hoagie', 'milo', 'pip', 'dot', 'captain'].map((f) => DIR + f + '.js')],
    fonts: [{ family: 'Bangers', src: 'fonts/Bangers-Regular.ttf' }],
    bpm: 120,
    shots: [[0, 4, 'Model sheet']],

    draw(g, t, env) {
        const T = SkateToon, C = T.COL, { W, H } = env;
        const GY = 772, s = 3.5;
        // the quay is drawn once
        Motion.sprite('pier-pressure-sheet-bg', { x: 0, y: 0, w: W, h: H }, env.k, (b) => {
            b.fillStyle = C.sky;
            b.fillRect(0, 0, W, H);
            T.slab(b, [[-20, GY - 30], [1620, GY - 40], [1620, 920], [-20, 920]], { fill: C.concrete, seed: 'quay' });
            T.ticks(b, [[0, GY - 16], [1600, GY - 26], [1600, 800], [0, 808]], { n: 14, dir: -0.02, len: [12, 34], seed: 'quay-t' });
            const label = (name, role, x) => {
                T.sign(b, name, x, 846, { size: 46, fill: C.white, seed: 'n' + name, tilt: 0.04, drop: C.navy });
                b.font = '22px "Bangers"';
                b.textAlign = 'center';
                b.fillStyle = C.ink;
                b.fillText(role, x, 878);
            };
            label('PIP', 'age 8 · better than all of them', 200);
            label('KIT', 'age 11 · first one down', 480);
            label('HOAGIE', 'age 10 · films everything', 752);
            label('MILO', 'age 12 · does the maths', 996);
            label('AUNT DOT', 'runs the chip hut', 1236);
            label('CAPTAIN', 'takes a cut', 1496);
        }).draw(g);

        // everything moves on twos: a bob on each beat, a wave, a blink each
        const tt = T.onTwos(t), d = T.drawing(t);
        const beat = Motion.pulse(tt, 120, 0, 6), off = Motion.pulse(tt, 120, 0.25, 6);
        const wave = Math.sin(tt * Math.PI * 4);
        const blink = (k) => d % 48 === k;

        Cast.scooter(g, 118, GY + 4, s * 1.0);
        Cast.draw(g, 'pip', {
            hip: [-1, 0.4 + off * 1.2], lean: 0.04, tilt: -0.08, arms: [[0.6, 0.5], [1.7 + wave * 0.12, 0.95 + wave * 0.3]],
            head: { tilt: -0.07 + wave * 0.03, turn: 0.3 }, face: { mouth: 'open', look: [0.3, -0.2], blink: blink(7) },
        }, 246, GY + 4, s);

        Cast.board(g, 470 + 30 * s, GY + 2, s, 0);
        Cast.draw(g, 'kit', {
            hip: [2, 0.6 + beat * 1.2], lean: -0.05, tilt: 0.07, feet: [[-13, 0, 0], [16, 5.6, 0]],
            arms: [[1.0, -1.9], [1.3, 1.25 + beat * 0.22]], armFront: ['fore', true], hands: ['fist', 'thumb'], handBack: [true, false],
            head: { tilt: 0.09 - beat * 0.03, turn: 0.35 }, face: { mouth: 'grin', look: [0.35, 0], brow: 0.3, blink: blink(21) },
        }, 470, GY, s);

        Cast.draw(g, 'hoagie', {
            hip: [-1, off * 1.4], lean: 0.03, tilt: -0.06, arms: [[0.6, 0.35], [1.75 - wave * 0.1, 0.6 - wave * 0.28]],
            head: { tilt: 0.05 - wave * 0.02, turn: -0.25 }, face: { mouth: 'grin', look: [-0.3, 0], brow: 0.4, blink: blink(33) },
        }, 752, GY + 2, s);

        Cast.draw(g, 'milo', {
            hip: [1, beat * 0.9], lean: -0.03, tilt: 0.05, arms: [[0.3, 0.14], [0.5, 2.1 + beat * 0.16]], hands: ['open', 'point'],
            head: { tilt: -0.05, turn: -0.3 }, face: { mouth: 'smile', look: [-0.3, 0.1], brow: 0.6, lid: 0.12, blink: blink(14) },
        }, 996, GY - 2, s);

        Cast.draw(g, 'dot', {
            hip: [2, off * 1.1], lean: -0.02, tilt: 0.04, arms: [[1.05, -2.0], [1.05, -2.0]], armFront: ['fore', 'fore'], hands: ['fist', 'fist'], handBack: [true, true],
            head: { tilt: 0.04 + off * 0.03, turn: -0.3 }, face: { mouth: 'smirk', look: [-0.5, 0.2], lid: 0.3, brow: -0.2, blink: blink(40) },
        }, 1236, GY - 4, s);

        Cast.bollard(g, 1496, GY - 6, s);
        Cast.gull(g, 1506, GY - 6 - 31.6 * s, s * 0.92, { flip: true, look: [d % 24 < 12 ? 0.7 : -0.2, 0.3], lid: d % 48 === 26 ? 0.95 : 0.42, wing: off * 0.12 });
    },
});
