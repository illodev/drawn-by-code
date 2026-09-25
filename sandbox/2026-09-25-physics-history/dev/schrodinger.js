// Dev scene for segment FIS-07 (schrodinger): the segment, then its atlas vignette.
const DIR = 'sandbox/2026-09-25-physics-history/';
const DUR = 6;
Motion.scene({
    fps: 24, duration: DUR + 2, logical: [1600, 900], bpm: 120,
    uses: ['styles/risograph/riso.js', DIR + 'kit.js', DIR + 'cast.js', DIR + 'sets.js', DIR + 'earth.js', DIR + 'segments/newton-faraday.js', DIR + 'segments/schrodinger.js'],
    shots: [[0, DUR, 'schrodinger'], [DUR, DUR + 2, 'atlas']],
    setup(env) { return { press: Riso.press(env), st: { newtonFaraday: Seg.newtonFaraday.init(env), schrodinger: Seg.schrodinger.init?.(env) ?? {} } }; },
    draw(g, t, env) {
        const { press, st } = env.state, d = Math.floor(t * 12 + 1e-6), tq = d / 12;
        press.begin(d);
        Ph.ink(press, (g2) => g2.rect(0, 0, 1600, 900), { blue: 0.9 });
        Ph.ink(press, (g2) => g2.rect(0, 0, 1600, 900), { 'navy.s': (g2) => Riso.radial(g2, 820, 420, 120, 1000, 0.5, 0.95) });
        if (tq < DUR) Seg.schrodinger.draw(press, tq, st.schrodinger, { st });
        else Seg.schrodinger.atlas(press, tq, st.schrodinger, { st });
        press.print(g, { key: d });
    },
});
