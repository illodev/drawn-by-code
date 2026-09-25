// Dev scene for FIS-06 (Einstein): plays only segments/einstein.js, then its atlas vignette.
const DIR = 'sandbox/2026-09-25-physics-history/';
const DUR = 6;
Motion.scene({
    fps: 24, duration: DUR + 2, logical: [1600, 900], bpm: 120,
    uses: ['styles/risograph/riso.js', DIR + 'kit.js', DIR + 'cast.js', DIR + 'sets.js', DIR + 'earth.js', DIR + 'segments/newton-faraday.js', DIR + 'segments/einstein.js'],
    shots: [[0, DUR, 'einstein'], [DUR, DUR + 2, 'atlas']],
    setup(env) { return { press: Riso.press(env), st: { newtonFaraday: Seg.newtonFaraday.init(env), einstein: Seg.einstein.init?.(env) ?? {} } }; },
    draw(g, t, env) {
        const { press, st } = env.state, d = Math.floor(t * 12 + 1e-6), tq = d / 12;
        press.begin(d);
        Ph.ink(press, (g2) => g2.rect(0, 0, 1600, 900), { blue: 0.9 });
        Ph.ink(press, (g2) => g2.rect(0, 0, 1600, 900), { 'navy.s': (g2) => Riso.radial(g2, 820, 420, 120, 1000, 0.5, 0.95) });
        if (tq < DUR) Seg.einstein.draw(press, tq, st.einstein, { st });
        else Seg.einstein.atlas(press, tq, st.einstein, { st });
        press.print(g, { key: d });
    },
});
