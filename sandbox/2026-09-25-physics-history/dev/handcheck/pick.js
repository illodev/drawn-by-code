// Dev: Newton's hand picking the apple up (Fig.holdApple 'pick'), large
const DIR = 'sandbox/2026-09-25-physics-history/';
Motion.scene({
    fps: 24, duration: 1, logical: [1600, 900],
    uses: ['styles/risograph/riso.js', DIR + 'kit.js', DIR + 'cast.js', DIR + 'figure.js', DIR + 'segments/newton-apple.js'],
    setup(env) { return { press: Riso.press(env) }; },
    draw(g, t, env) {
        const { press } = env.state;
        press.begin(0);
        Ph.ink(press, (g2) => g2.rect(0, 0, 1600, 900), { 'yellow.s': 0.5, 'blue.s': 0.4 });
        const SK = { 'yellow.s': 0.12, 'pink.s': 0.07 }, SH = { 'yellow.s': 0.3, 'pink.s': 0.36, 'navy.s': 0.06 };
        const R = 100, A = [800, 560], w = [800 - 1.4 * R, 560 - 2.6 * R];
        Ph.put(press, Ph.circle(w[0], w[1], 50), { 'blue.s': 0.1 });
        Fig.holdApple(press, w, Math.atan2(A[1] - w[1], A[0] - w[0]), 1, R, SK, SH, (p, c) => Seg.newtonApple.drawApple(p, c[0], c[1], R, 0.15), 'pick', A);
        press.print(g, { key: 0 });
    },
});
