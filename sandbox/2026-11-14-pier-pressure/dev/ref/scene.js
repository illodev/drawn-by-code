// pier-pressure · dev: Kit drawn from her measured sheet, on the sheet's own white and at its
// size (for the comparison), then on the style's sky.
const DIR = 'sandbox/2026-11-14-pier-pressure/cast/';
Motion.scene({
    fps: 24, duration: 2, logical: [1280, 720],
    uses: ['styles/skate-toon/toon.js', DIR + 'ref.js', DIR + 'kit-ref.js'],
    shots: [[0, 1, 'On white, 1:1'], [1, 2, 'On the sky']],
    draw(g, t, env) {
        g.fillStyle = t < 1 ? '#ffffff' : SkateToon.COL.sky;
        g.fillRect(0, 0, env.W, env.H);
        Ref.draw(g, 'kit', 'stand', 60, 0, 1);
        Ref.draw(g, 'kit', 'jump', 540, 0, 1);
    },
});
