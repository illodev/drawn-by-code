// Dev: Scope3D at several orbit positions (one per 0.5 s)
const DIR = 'sandbox/2026-09-25-physics-history/';
Motion.scene({
    fps: 24, duration: 3, logical: [1600, 900],
    uses: ['styles/risograph/riso.js', DIR + 'kit.js', DIR + 'scope3d.js'],
    setup(env) { return { press: Riso.press(env) }; },
    draw(g, t, env) {
        const { press } = env.state, d = Math.floor(t * 12);
        press.begin(d);
        Ph.ink(press, (g2) => g2.rect(0, 0, 1600, 900), { blue: 0.9, 'navy.s': 0.7 });
        const k = Math.min(1, t / 2.5);
        Scope3D.draw(press, Scope3D.orbit(k, { dist: 70, flen: 1300, c: [800, 450], aim: 30 }), { turn: t, sweep: t - 1.5, glow: 0 });
        press.print(g, { key: d });
    },
});
