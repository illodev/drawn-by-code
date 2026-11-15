// pier-pressure · dev: the background of Hoagie's bar alone (his card of colour, the floor, his name
// card), 2 s, for a figure rendered elsewhere to be laid over (blender/hoagie.py).
const DIR = 'sandbox/2026-11-14-pier-pressure/';
Motion.scene({
    fps: 24, duration: 2, logical: [1600, 900],
    uses: ['styles/skate-toon/toon.js', DIR + 'cast/drawn.js', DIR + 'cast/kit-drawn.js', DIR + 'cast/hoagie-drawn.js', DIR + 'cast/milo-drawn.js', DIR + 'cast/pip-drawn.js', DIR + 'cast/dot-drawn.js', DIR + 'cast/captain-drawn.js', DIR + 'cast/kit-act.js', DIR + 'cam.js', DIR + 'set.js', DIR + 'cast/hoagie-model.js', DIR + 'film.js'],
    fonts: [{ family: 'Bangers', src: 'fonts/Bangers-Regular.ttf' }],
    bpm: 120,
    shots: [[0, 2, 'stage']],
    draw(g, t, env) {
        const C = SkateToon.COL;
        Film.stage(g, Film.nth(t), 640, 838, C.orange, '#e0661f', { floor: C.maroon });
        Film.card(g, t, 1, 'HOAGIE', 'STILL ROLLING', 1215, 560, { fill: C.maroon, drop: C.ink, second: C.roadLine, k: 1.05, tilt: -0.05 });
    },
});
