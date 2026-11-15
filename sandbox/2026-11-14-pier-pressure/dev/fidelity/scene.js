// pier-pressure · dev: a sheet's poses drawn from their code at the sheet's own place and size, to
// compare with the sheet itself (tools/fidelity.py). One second per sheet on white (0–8 s), then
// the same again on the film's sky (8–16 s): there a white that should be page, or page that should
// be white, shows at once.
const DIR = 'sandbox/2026-11-14-pier-pressure/cast/';
const SHEETS = [
    ['kit-sheet', ['kit', 'stand', 60, 0], ['kit', 'jump', 540, 0]],
    ['kit-drop-a', ['kit', 'tuck', 30, 0], ['kit', 'reach', 390, 30], ['kit', 'contact', 862, 80]],
    ['kit-drop-b', ['kit', 'crouch', 10, 255], ['kit', 'rise', 462, 75], ['kit', 'proud', 888, 10]],
    ['hoagie-sheet', ['hoagie', 'film', 76, 34], ['hoagie', 'jump', 562, 6]],
    ['milo-sheet', ['milo', 'stand', 88, 0], ['milo', 'fall', 531, 4]],
    ['pip-sheet', ['pip', 'stand', 88, 19], ['pip', 'ride', 663, 32]],
    ['dot-sheet', ['dot', 'stand', 66, 0], ['dot', 'serve', 619, 2]],
    ['captain-sheet', ['captain', 'perch', 80, 4], ['captain', 'fly', 496, 36]],
];
const N = SHEETS.length;
Motion.scene({
    fps: 24, duration: 2 * N, logical: [1280, 720],
    uses: ['styles/skate-toon/toon.js', DIR + 'drawn.js', DIR + 'kit-drawn.js', DIR + 'kit-details.js', DIR + 'kit-drop-drawn.js', DIR + 'kit-drop-details.js',
        DIR + 'hoagie-drawn.js', DIR + 'milo-drawn.js', DIR + 'pip-drawn.js', DIR + 'dot-drawn.js', DIR + 'captain-drawn.js'],
    shots: SHEETS.map((s, i) => [i, i + 1, s[0]]),
    draw(g, t, env) {
        const i = Math.min(2 * N - 1, Math.floor(t));
        g.fillStyle = i < N ? '#ffffff' : '#ffdf5e';
        g.fillRect(0, 0, env.W, env.H);
        for (const [who, pose, x, y] of SHEETS[i % N].slice(1)) Drawn.draw(g, who, pose, x, y, 1);
    },
});
