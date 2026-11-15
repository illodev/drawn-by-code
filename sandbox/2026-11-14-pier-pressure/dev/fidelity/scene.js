// pier-pressure · dev: every sheet's poses drawn from their code at the sheet's own place and size
// (cast/sheets.js), to compare with the sheet itself (tools/fidelity.py). One second per sheet on
// the sheets' own green (0…N s: the comparison sees the cut too, the page is part of the image),
// then the same again on the quay's lilac (N…2N s), where a cut that is wrong shows at once.
const DIR = 'sandbox/2026-11-14-pier-pressure/cast/';
const NAMES = ['kit-sheet', 'kit-drop-a', 'kit-drop-b', 'kit-ride', 'hoagie-sheet', 'hoagie-keys', 'hoagie-seq-turn', 'hoagie-seq-thumb', 'milo-sheet', 'milo-keys', 'pip-sheet', 'pip-keys', 'dot-sheet', 'dot-keys', 'captain-sheet', 'captain-keys', 'hoagie-seq-tween', 'hoagie-run', 'milo-run', 'kit-skate', 'pip-scoot', 'captain-flap', 'hoagie-leap', 'milo-leap', 'kit-leap', 'pip-leap'];
const N = NAMES.length;
Motion.scene({
    fps: 24, duration: 2 * N, logical: [1280, 720],
    uses: ['styles/skate-toon/toon.js', DIR + 'drawn.js', ...NAMES.map((n) => DIR + n + '-drawn.js'), DIR + 'sheets.js'],
    shots: NAMES.map((n, i) => [i, i + 1, n]),
    draw(g, t, env) {
        const i = Math.min(2 * N - 1, Math.floor(t));
        g.fillStyle = i < N ? '#00ff00' : '#b8b0ce';
        g.fillRect(0, 0, env.W, env.H);
        for (const [who, pose, x, y] of CastSheets.find((s) => s[0] === NAMES[i % N]).slice(1)) Drawn.draw(g, who, pose, x, y, 1);
    },
});
