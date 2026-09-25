// Dev: FarHead expressions (and GalHead) at several scales
const DIR = 'sandbox/2026-09-25-physics-history/';
Motion.scene({
    fps: 24, duration: 1, logical: [1600, 900],
    uses: ['styles/risograph/riso.js', DIR + 'kit.js', DIR + 'cast.js', DIR + 'sets.js', DIR + 'earth.js', DIR + 'segments/newton-faraday.js', DIR + 'segments/galileo.js', DIR + 'head-galileo.js', DIR + 'head-faraday.js'],
    setup(env) { return { press: Riso.press(env) }; },
    draw(g, t, env) {
        const { press } = env.state;
        press.begin(0);
        Ph.ink(press, (g2) => g2.rect(0, 0, 1600, 900), { blue: 0.9, 'navy.s': 0.7 });
        const E = [{ look: [0.6, 0.3] }, { look: [0.5, 0.4], brow: -1 }, { look: [0.2, -0.1], brow: 1, wide: 1, mouth: 0.8 }, { look: [0.7, 0.3], smile: 1, lid: 0.3 }];
        Ph.cam(press, 400, 300, 2.2, () => Cast.faraday(press, { look: [1, 0.55] }));
        Ph.cam(press, 1150, 300, 2.2, () => Cast.newton(press, {}));
        press.print(g, { key: 0 });
    },
});
