// Dev scene: Faraday's coil alone.
const DIR = 'sandbox/2026-09-25-physics-history/';
Motion.scene({
    fps: 24, duration: 11.2, logical: [1600, 900],
    uses: ['styles/risograph/riso.js', DIR + 'kit.js', DIR + 'cast.js', DIR + 'sets.js', DIR + 'earth.js', DIR + 'figure.js', DIR + 'scope3d.js', DIR + 'coil3d.js', DIR + 'cat.js', DIR + 'lab-faraday.js', DIR + 'hands-galileo.js',
        DIR + 'segments/newton-faraday.js', DIR + 'segments/galileo.js', DIR + 'segments/newton-apple.js', DIR + 'segments/faraday-coil.js'],
    setup(env) { return { press: Riso.press(env), st: Seg.faradayCoil.init() }; },
    draw(g, t, env) {
        const { press, st } = env.state, d = Math.floor(t * 12 + 1e-6), tq = d / 12;
        press.begin(d);
        Seg.faradayCoil.draw(press, tq, st);
        press.print(g, { key: d });
    },
});
