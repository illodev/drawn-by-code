// dev: poses cut into parts, apart: each pose whole, then each of its parts alone (pier-pressure)
const DIR = 'sandbox/2026-11-14-pier-pressure/cast/';
const POSES = [['captain', 'perch', 1, 0.9], ['milo', 'smug', 2, 1.15], ['dot', 'basket', 3, 1.2], ['dot', 'salt', 4, 1.2], ['dot', 'serve', 5, 1.2], ['dot', 'yell', 6, 1.2]];
Motion.scene({
    fps: 24, duration: POSES.length, logical: [1600, 900],
    uses: ['styles/skate-toon/toon.js', DIR + 'drawn.js', ...['captain-sheet', 'milo-keys', 'dot-keys', 'dot-sheet'].map((f) => DIR + f + '-drawn.js')],
    shots: POSES.map((p, i) => [i, i + 1, p[0] + ' ' + p[1]]),
    draw(g, t) {
        g.fillStyle = '#b8add0';
        g.fillRect(0, 0, 1600, 900);
        const [who, pose, , s] = POSES[Math.min(POSES.length - 1, Math.floor(t))], mt = Drawn.meta(who, pose), names = Drawn.parts(who, pose);
        const y = 880 - mt.h * s;
        Drawn.draw(g, who, pose, 20, y, s);
        names.forEach((n, i) => Drawn.draw(g, who, pose, 20 + (i + 1) * 520, y, s, { only: [n] }));
    },
});
