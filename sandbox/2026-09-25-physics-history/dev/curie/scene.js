// Dev scene: Curie and the radium alone.
const DIR = 'sandbox/2026-09-25-physics-history/';
Motion.scene({
    fps: 24, duration: 7.6, logical: [1600, 900],
    uses: ['styles/risograph/riso.js', DIR + 'kit.js', DIR + 'cast.js', DIR + 'sets.js', DIR + 'figure.js', DIR + 'segments/newton-faraday.js', DIR + 'segments/curie.js', DIR + 'segments/curie-radium.js'],
    setup(env) { return { press: Riso.press(env), st: Seg.curieRadium.init() }; },
    draw(g, t, env) {
        const { press, st } = env.state, d = Math.floor(t * 12 + 1e-6), tq = d / 12;
        press.begin(d);
        Seg.curieRadium.draw(press, tq, st);
        press.print(g, { key: d });
    },
});
