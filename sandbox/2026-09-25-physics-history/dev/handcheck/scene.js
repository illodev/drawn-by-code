// Dev: the hands at full size on their props, to check handedness and detail before any render.
// Left: Galileo's right hand on the tube rising right · right: Faraday's right hand on the magnet
// pointing right. Both GalHands.over: the round-14 fist with the thumb under, towards him.
const DIR = 'sandbox/2026-09-25-physics-history/';
Motion.scene({
    fps: 24, duration: 1, logical: [1600, 900],
    uses: ['styles/risograph/riso.js', DIR + 'kit.js', DIR + 'cast.js', DIR + 'scope3d.js', DIR + 'hands-galileo.js', DIR + 'coil3d.js'],
    setup(env) { return { press: Riso.press(env) }; },
    draw(g, t, env) {
        const { press } = env.state;
        press.begin(0);
        Ph.ink(press, (g2) => g2.rect(0, 0, 1600, 900), { blue: 0.9, 'navy.s': 0.7 });
        const rAt = (s) => 19 + 11 * (s - 46) / 1424;
        const panel = (cx, cy, roll, fa) => {
            const v = Scope3D.orbit(0.12, { dist: 6000 / 4.2, flen: 6000, c: [cx, cy], roll, aim: 110 });
            const C = Scope3D.camera(v);
            Scope3D.draw(press, v, { turn: 0.3, t });
            const s = 110, r = rAt(s), o = C.proj([s, 0, r]), a = C.proj([s + 1, 0, r]), b = C.proj([s, -1, r]);
            press.save(); press.each((g2) => g2.transform(a[0] - o[0], a[1] - o[1], b[0] - o[0], b[1] - o[1], o[0], o[1]));
            GalHands.over(press, r, { fa });
            press.restore();
        };
        // Galileo: tube rising right, right forearm up from below
        panel(420, 520, -0.6, [0.15, 1]);
        // Faraday: magnet pointing right, right forearm from behind and below
        panel(1180, 520, 0, [0.75, 0.66]);
        press.print(g, { key: 0 });
    },
});
