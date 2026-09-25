// Dev scene: Galileo on the roof alone (one continuous shot).
const DIR = 'sandbox/2026-09-25-physics-history/';
Motion.scene({
    fps: 24, duration: 12.8, logical: [1600, 900],
    uses: ['styles/risograph/riso.js', DIR + 'kit.js', DIR + 'cast.js', DIR + 'sets.js', DIR + 'earth.js', DIR + 'figure.js', DIR + 'scope3d.js', DIR + 'head-galileo.js', DIR + 'hands-galileo.js',
        DIR + 'segments/newton-faraday.js', DIR + 'segments/galileo.js', DIR + 'segments/newton-apple.js', DIR + 'segments/galileo-roof.js'],
    setup(env) { return { press: Riso.press(env), st: Seg.galileoRoof.init() }; },
    draw(g, t, env) {
        const { press, st } = env.state, d = Math.floor(t * 12 + 1e-6), tq = d / 12;
        press.begin(d);
        Seg.galileoRoof.draw(press, tq, st);
        press.print(g, { key: d });
    },
});
