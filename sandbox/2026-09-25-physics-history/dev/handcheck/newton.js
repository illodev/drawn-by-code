// Dev: Newton's right hand holding the apple (Fig.holdApple), large, on paper
const DIR = 'sandbox/2026-09-25-physics-history/';
Motion.scene({
    fps: 24, duration: 1, logical: [1600, 900],
    uses: ['styles/risograph/riso.js', DIR + 'kit.js', DIR + 'cast.js', DIR + 'figure.js', DIR + 'segments/newton-apple.js'],
    setup(env) { return { press: Riso.press(env) }; },
    draw(g, t, env) {
        const { press } = env.state;
        press.begin(0);
        Ph.ink(press, (g2) => g2.rect(0, 0, 1600, 900), { 'blue.s': 0.35 });
        const SK = { 'yellow.s': 0.12, 'pink.s': 0.07 }, SH = { 'yellow.s': 0.3, 'pink.s': 0.36, 'navy.s': 0.06 };
        Fig.holdApple(press, [520, 300], 120, 1, SK, SH, (p, c) => Seg.newtonApple.drawApple(p, c[0], c[1], 120, 0.1));
        Fig.holdApple(press, [1280, 420], 30, 1, SK, SH, (p, c) => Seg.newtonApple.drawApple(p, c[0], c[1], 30, 0.1));
        press.print(g, { key: 0 });
    },
});
