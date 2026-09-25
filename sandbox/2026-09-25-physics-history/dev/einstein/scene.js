// Dev scene: Einstein chasing the light.
const DIR = 'sandbox/2026-09-25-physics-history/';
Motion.scene({
    fps: 24, duration: 9.2, logical: [1600, 900],
    uses: ['styles/risograph/riso.js', DIR + 'kit.js', DIR + 'cast.js', DIR + 'sets.js', DIR + 'figure.js', DIR + 'cat.js', DIR + 'segments/einstein.js', DIR + 'segments/einstein-ray.js'],
    setup(env) { return { press: Riso.press(env), st: Seg.einsteinRay.init() }; },
    draw(g, t, env) {
        const { press, st } = env.state, d = Math.floor(t * 12 + 1e-6), tq = d / 12;
        press.begin(d);
        Seg.einsteinRay.draw(press, tq, st);
        press.print(g, { key: d });
    },
});
