// pier-pressure · dev: a sheet's poses drawn from their code at the sheet's own place and size, to
// compare with the sheet itself (tools/fidelity.py). One second per sheet on white, then
// the same again on the film's sky: there a white that should be page, or page that should
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
    ['milo-keys', ['milo', 'crouch', 14, 151], ['milo', 'smug', 444, 4], ['milo', 'run', 758, 84]],
    ['captain-keys', ['captain', 'ready', 12, 270], ['captain', 'launch', 440, 25], ['captain', 'down', 818, 250]],
    ['kit-ride', ['kit', 'push', 10, 99], ['kit', 'glide', 463, 130], ['kit', 'point', 818, 25]],
    ['hoagie-keys', ['hoagie', 'run', 5, 112], ['hoagie', 'skid', 463, 120], ['hoagie', 'proud', 924, 112]],
    ['pip-keys', ['pip', 'push', 18, 101], ['pip', 'lolly', 479, 84], ['pip', 'wink', 912, 89]],
    ['dot-keys', ['dot', 'basket', 10, 48], ['dot', 'salt', 441, 69], ['dot', 'yell', 816, 28]],
    ['hoagie-seq-turn', ['hoagie', 't1', 4, 119], ['hoagie', 't2', 357, 120], ['hoagie', 't3', 672, 136], ['hoagie', 't4', 984, 136]],
    ['hoagie-seq-thumb', ['hoagie', 'a1', 17, 182], ['hoagie', 'a2', 329, 88], ['hoagie', 'a3', 655, 145], ['hoagie', 'a4', 975, 151]],
];
const N = SHEETS.length;
Motion.scene({
    fps: 24, duration: 3 * N, logical: [1280, 720],
    uses: ['styles/skate-toon/toon.js', DIR + 'drawn.js', DIR + 'kit-drawn.js', DIR + 'kit-details.js', DIR + 'kit-drop-drawn.js', DIR + 'kit-drop-details.js',
        DIR + 'hoagie-drawn.js', DIR + 'milo-drawn.js', DIR + 'pip-drawn.js', DIR + 'dot-drawn.js', DIR + 'captain-drawn.js',
        DIR + 'milo-keys-drawn.js', DIR + 'captain-keys-drawn.js', DIR + 'kit-ride-drawn.js',
        DIR + 'hoagie-keys-drawn.js', DIR + 'hoagie-turn-drawn.js', DIR + 'hoagie-thumb-drawn.js', DIR + 'pip-keys-drawn.js', DIR + 'dot-keys-drawn.js'],
    shots: SHEETS.map((s, i) => [i, i + 1, s[0]]),
    draw(g, t, env) {
        const i = Math.min(3 * N - 1, Math.floor(t));
        g.fillStyle = i < N ? '#ffffff' : i < 2 * N ? '#ffdf5e' : '#00ff00'; // (the third: a sheet on green, to test `bg`)
        g.fillRect(0, 0, env.W, env.H);
        for (const [who, pose, x, y] of SHEETS[i % N].slice(1)) Drawn.draw(g, who, pose, x, y, 1);
    },
});
