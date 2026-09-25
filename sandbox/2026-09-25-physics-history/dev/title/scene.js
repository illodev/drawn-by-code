// Dev scene: the closing title.
const DIR = 'sandbox/2026-09-25-physics-history/';
Motion.scene({
    fps: 24, duration: 6, logical: [1600, 900],
    uses: ['styles/risograph/riso.js', DIR + 'kit.js', DIR + 'cat.js', DIR + 'segments/title.js'],
    fonts: [{ family: 'Shrikhand', src: 'fonts/Shrikhand-latin.woff2' }],
    setup(env) { return { press: Riso.press(env), st: Seg.title.init() }; },
    draw(g, t, env) {
        const { press, st } = env.state, d = Math.floor(t * 12 + 1e-6), tq = d / 12;
        press.begin(d);
        Seg.title.draw(press, tq, st);
        press.print(g, { key: d });
    },
});
