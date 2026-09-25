// Dev scene for the Curie segment (FIS-05, 20–26 s of the piece): plays the segment in its
// local time, then its atlas vignette for 2 s.
const DIR = 'sandbox/2026-09-25-physics-history/';
const DUR = 6;
Motion.scene({
    fps: 24, duration: DUR + 2, logical: [1600, 900], bpm: 120,
    uses: ['styles/risograph/riso.js', DIR + 'kit.js', DIR + 'cast.js', DIR + 'sets.js', DIR + 'earth.js', DIR + 'segments/newton-faraday.js', DIR + 'segments/curie.js'],
    shots: [[0, DUR, 'curie'], [DUR, DUR + 2, 'atlas']],
    setup(env) { return { press: Riso.press(env), st: { newtonFaraday: Seg.newtonFaraday.init(env), curie: Seg.curie.init?.(env) ?? {} } }; },
    draw(g, t, env) {
        const { press, st } = env.state, d = Math.floor(t * 12 + 1e-6), tq = d / 12;
        press.begin(d);
        Ph.ink(press, (g2) => g2.rect(0, 0, 1600, 900), { blue: 0.9 });
        Ph.ink(press, (g2) => g2.rect(0, 0, 1600, 900), { 'navy.s': (g2) => Riso.radial(g2, 820, 420, 120, 1000, 0.5, 0.95) });
        if (tq < DUR) Seg.curie.draw(press, tq, st.curie, { st });
        else Seg.curie.atlas(press, tq, st.curie, { st });
        press.print(g, { key: d });
    },
});
