// Skate toon style template: a kid on a sea wall waves on the beat under a yellow sky, a palm
// sways and a hand-lettered sign jostles. engine/new.mjs copies it as the scene.js of every
// new experiment.
Motion.scene({
    fps: 24,
    duration: 4,
    logical: [1600, 900],
    uses: ['styles/skate-toon/toon.js', 'styles/skate-toon/kid.js'],
    fonts: [{ family: 'Bangers', src: 'fonts/Bangers-Regular.ttf' }],
    bpm: 120,
    shots: [[0, 4, 'Template']],

    draw(g, t, env) {
        const T = SkateToon, C = T.COL, { W, H } = env;
        const d = T.drawing(t); // drawings change on twos
        const beat = Motion.pulse(T.onTwos(t), 120, 0, 7);

        // the set is drawn once: flat colour, ruled edges that overshoot, loose ticks
        Motion.sprite('skate-toon-template-set', { x: 0, y: 0, w: W, h: H }, env.k, (b) => {
            b.fillStyle = C.sky;
            b.fillRect(0, 0, W, H);
            T.shape(b, [[-20, 520, 1], [300, 505], [700, 512], [1100, 500], [1620, 510, 1], [1620, 640, 1], [-20, 640, 1]], { fill: C.sea, w: T.LINE_BG, seed: 'sea' });
            T.ticks(b, [[0, 525], [1600, 525], [1600, 630], [0, 630]], { n: 16, len: [18, 44], seed: 'sea-t', color: C.foam, w: 2.6, pair: 0.2 });
            T.slab(b, [[-20, 610], [1620, 596], [1620, 668], [-20, 684]], { fill: C.concrete, seed: 'wall' });
            T.slab(b, [[-20, 684], [1620, 668], [1620, 920], [-20, 920]], { fill: C.road, seed: 'road' });
            T.ticks(b, [[0, 700], [1600, 690], [1600, 900], [0, 900]], { n: 26, dir: -0.02, len: [14, 40], seed: 'road-t' });
            T.ticks(b, [[0, 616], [1600, 602], [1600, 660], [0, 676]], { n: 10, dir: 1.4, len: [6, 14], seed: 'wall-t' });
        }).draw(g);

        T.palm(g, 1270, 690, 520, { seed: 'palm-a', lean: 60, sway: Math.sin(d * 0.5) * 0.03 });
        T.palm(g, 1440, 676, 330, { seed: 'palm-b', lean: -30, sway: Math.sin(d * 0.5 + 1) * 0.04, fronds: 6 });

        // a signboard on two posts, its letters jostling on the beat
        T.slab(g, [[150, 250], [158, 660], [172, 660], [166, 250]], { fill: C.greyDeep, seed: 'post-a' });
        T.slab(g, [[560, 236], [556, 650], [570, 650], [576, 236]], { fill: C.greyDeep, seed: 'post-b' });
        T.slab(g, [[96, 168], [636, 140], [650, 318], [108, 344]], { fill: C.teal, seed: 'board', over: 2.4 });
        g.save();
        g.translate(372, 282);
        g.rotate(-0.05);
        T.sign(g, 'SKATE TOON', 0, 0, { size: 104 + beat * 5, fill: [C.magenta, C.roadLine, C.white], drop: C.navy, seed: 'title' + (d % 2) });
        g.restore();

        // the kid: a wave on every beat, a blink now and then
        const wave = Math.sin(T.onTwos(t) * Math.PI * 4);
        const kid = {
            seed: 'template-kid', eye: { brow: true }, mouth: { gap: true },
            top: { color: C.yellow, collarColor: C.orange }, bottom: { color: C.maroon, band: C.white },
            shoes: { upper: C.shoe, sole: C.white, stripe: C.roadLine, cap: C.white },
            // hair is drawn in the head's own frame: a mop with a saw-toothed fringe
            hairFront: (gg, K, H) => {
                const f = H.fx * 0.4;
                T.shape(gg, [[23, -3, 1], [19 + f, -9, 1], [15 + f, -5, 1], [10 + f, -11, 1], [5 + f, -6, 1], [0 + f, -11.4, 1], [-6 + f, -6, 1], [-11 + f, -11, 1], [-16 + f, -6, 1], [-20, -9, 1], [-23, -2, 1], [-22, -13], [-12, -20.6], [6, -21.6], [19, -16], [23.4, -9]], { fill: C.navy, w: K.w, seed: 'template-hair' });
            },
        };
        SkateKid.draw(g, kid, {
            hip: [0, beat * 1.4], lean: 0.03, tilt: -0.06,
            arms: [[0.55, 0.4], [1.8 + wave * 0.12, 0.7 + wave * 0.3]],
            head: { tilt: wave * 0.04, turn: 0.3 },
            face: { mouth: 'grin', blink: d % 30 === 14, look: [0.4, -0.1] },
        }, 900, 806, 4.4);
    },
});
