// dev scene: the galileo segment alone (0–8 s), then its atlas vignette (8–10 s)
const DIR = 'sandbox/2026-09-25-physics-history/';
const DUR = 8;
Motion.scene({
    fps: 24, duration: DUR + 2, logical: [1600, 900], bpm: 120,
    uses: ['styles/risograph/riso.js', DIR + 'kit.js', DIR + 'cast.js', DIR + 'sets.js', DIR + 'earth.js', DIR + 'segments/newton-faraday.js', DIR + 'segments/galileo.js'],
    shots: [[0, 2, 'FIS-01'], [2, DUR, 'FIS-02'], [DUR, DUR + 2, 'atlas']],
    setup(env) { return { press: Riso.press(env), st: { newtonFaraday: Seg.newtonFaraday.init(env), galileo: Seg.galileo.init?.(env) ?? {} } }; },
    draw(g, t, env) {
        const { press, st } = env.state, d = Math.floor(t * 12 + 1e-6), tq = d / 12;
        press.begin(d);
        Ph.ink(press, (g2) => g2.rect(0, 0, 1600, 900), { blue: 0.9 });
        Ph.ink(press, (g2) => g2.rect(0, 0, 1600, 900), { 'navy.s': (g2) => Riso.radial(g2, 820, 420, 120, 1000, 0.5, 0.95) });
        if (tq < DUR) Seg.galileo.draw(press, tq, st.galileo, { st });
        else Seg.galileo.atlas(press, tq, st.galileo, { st });
        press.print(g, { key: d });
    },
});
