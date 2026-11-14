// pier-pressure · dev: Kit drawn by hand (cast/kit-hero.js), at the size she is judged.
const DIR = 'sandbox/2026-11-14-pier-pressure/cast/';
Motion.scene({
    fps: 24, duration: 1, logical: [1600, 900],
    uses: ['styles/skate-toon/toon.js', 'styles/skate-toon/kid.js', DIR + 'common.js', DIR + 'props.js', DIR + 'kit-hero.js'],
    fonts: [{ family: 'Bangers', src: 'fonts/Bangers-Regular.ttf' }],
    shots: [[0, 1, 'Kit, by hand']],
    draw(g, t, env) {
        g.fillStyle = SkateToon.COL.sky;
        g.fillRect(0, 0, env.W, env.H);
        Hero.kitJump(g, 540, 166, 1.95);
    },
});
