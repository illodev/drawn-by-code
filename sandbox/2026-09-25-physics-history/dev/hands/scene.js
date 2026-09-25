// Dev: GalHands on the 3D tube at two zooms
const DIR = 'sandbox/2026-09-25-physics-history/';
Motion.scene({
    fps: 24, duration: 1, logical: [1600, 900],
    uses: ['styles/risograph/riso.js', DIR + 'kit.js', DIR + 'cast.js', DIR + 'scope3d.js', DIR + 'hands-galileo.js'],
    setup(env) { return { press: Riso.press(env) }; },
    draw(g, t, env) {
        const { press } = env.state;
        press.begin(0);
        Ph.ink(press, (g2) => g2.rect(0, 0, 1600, 900), { blue: 0.9, 'navy.s': 0.7 });
        const Z = 3.6, v = Scope3D.orbit(0.12, { dist: 6000 / Z, flen: 6000, c: [-150, 700], roll: -0.35 });
        Scope3D.draw(press, v, { turn: 0.3, t });
        const C = Scope3D.camera(v);
        const frame = (s, r) => {
            const o = C.proj([s, 0, r]), a = C.proj([s + 1, 0, r]), b = C.proj([s, -1, r]);
            press.save(); press.each((g2) => g2.transform(a[0] - o[0], a[1] - o[1], b[0] - o[0], b[1] - o[1], o[0], o[1]));
        };
        const rAt = (s) => 19 + 11 * (s - 46) / 1424;
        frame(175, rAt(175)); GalHands.near(press, rAt(175), {}); press.restore();
        frame(320, rAt(320)); GalHands.far(press, rAt(320), {}); press.restore();
        press.print(g, { key: 0 });
    },
});
