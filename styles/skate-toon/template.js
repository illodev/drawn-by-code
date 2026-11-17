// Skate toon style template: Kit rides in along a sea wall on her board, stops pointing the way and
// is off again, under a yellow sky; a palm sways and a hand-lettered sign jostles on the beat.
// engine/new.mjs copies it as the scene.js of every new experiment.
//
// The set is drawn with the kit (toon.js). The character is not: in this style a character is a
// set of drawings written as code from an approved sheet (drawn.js runs them; cast/ holds two of
// Kit's sheets from sandbox/2026-11-14-pier-pressure, where the tools that write them live), and
// she moves by changing drawing, on twos. The frame ends in the broadcast finish (tv.js).
Motion.scene({
    fps: 24,
    duration: 4,
    logical: [1600, 900],
    uses: ['styles/skate-toon/toon.js', 'styles/skate-toon/tv.js', 'styles/skate-toon/drawn.js', 'styles/skate-toon/cast/kit-skate-drawn.js', 'styles/skate-toon/cast/kit-ride-drawn.js'],
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

        // Kit (1.4 m, 380 frame units to the metre): in from the left on her pushing cycle, losing
        // speed; low on the board; up and pointing the way; low again, and off. One drawing a step.
        const n = d % 48, PPM = 380, Y = 836;
        const kit = (pose, x) => { const m = Drawn.meta('kit', pose), k = PPM / m.m; Drawn.draw(g, 'kit', pose, x - m.at[0] * k, Y - m.at[1] * k, k); };
        const CYCLE = ['s1', 's2', 's3', 's4'];
        if (n < 20) kit(CYCLE[n % 4], -250 + 1010 * (1 - (1 - n / 20) ** 2));
        else if (n < 25) kit('glide', 770 + (n - 20) * 9);
        else if (n < 39) kit('point', 815);
        else if (n < 41) kit('glide', 815);
        else kit(CYCLE[(n - 41) % 4], 815 + (n - 40) ** 2 * 24);
    },
    // the broadcast finish: paint, film, standard-definition video
    post(ctx, t, env) { SkateToonTV.post(ctx, t, env); },
});
