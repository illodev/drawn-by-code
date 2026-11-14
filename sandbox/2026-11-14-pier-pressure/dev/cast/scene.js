// pier-pressure · the cast, each drawn from its code (cast/<who>-drawn.js): first every
// character's standing pose in a line-up at their relative heights, then the action poses.
const DIR = 'sandbox/2026-11-14-pier-pressure/cast/';
const WHO = ['pip', 'kit', 'hoagie', 'milo', 'dot', 'captain'];
Motion.scene({
    fps: 24, duration: 2, logical: [1600, 900],
    uses: ['styles/skate-toon/toon.js', DIR + 'drawn.js', ...WHO.map((w) => DIR + w + '-drawn.js'), DIR + 'kit-details.js'],
    fonts: [{ family: 'Bangers', src: 'fonts/Bangers-Regular.ttf' }],
    shots: [[0, 1, 'Line-up'], [1, 2, 'In action']],
    draw(g, t, env) {
        const T = SkateToon, C = T.COL;
        g.fillStyle = C.sky;
        g.fillRect(0, 0, env.W, env.H);
        // [who, pose, height in units, centre x]; feet on the ground line in the line-up
        const rows = t < 1
            ? [['pip', 'stand', 330, 150], ['kit', 'stand', 410, 400], ['hoagie', 'film', 380, 660], ['milo', 'stand', 520, 900], ['dot', 'stand', 640, 1150], ['captain', 'perch', 330, 1440]]
            : [['pip', 'ride', 330, 190], ['kit', 'jump', 370, 480], ['hoagie', 'jump', 380, 800], ['milo', 'fall', 380, 1120], ['dot', 'serve', 470, 1100], ['captain', 'fly', 300, 1380]];
        if (t < 1) {
            T.slab(g, [[-20, 800], [1620, 792], [1620, 920], [-20, 920]], { fill: C.concrete, seed: 'quay' });
            for (const [who, pose, hh, cx] of rows) {
                const [w, h] = Drawn.size(who, pose), s = hh / h;
                Drawn.draw(g, who, pose, cx - (w * s) / 2, 806 - hh, s);
                T.sign(g, who === 'dot' ? 'AUNT DOT' : who.toUpperCase(), cx, 868, { size: 40, fill: C.white, seed: 'n' + who, tilt: 0.04, drop: C.navy });
            }
        } else {
            // two rows, so nobody covers anybody
            const spots = { pip: [190, 660], kit: [330, 230], hoagie: [640, 650], milo: [1300, 230], dot: [1250, 640], captain: [800, 200] };
            for (const [who, pose, hh] of rows) {
                const [w, h] = Drawn.size(who, pose), s = hh / h, [cx, cy] = spots[who];
                Drawn.draw(g, who, pose, cx - (w * s) / 2, cy - hh / 2, s);
            }
        }
    },
});
