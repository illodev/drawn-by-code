// Dev: GalHead at several scales and tilts
const DIR = 'sandbox/2026-09-25-physics-history/';
Motion.scene({
    fps: 24, duration: 1, logical: [1600, 900],
    uses: ['styles/risograph/riso.js', DIR + 'kit.js', DIR + 'cast.js', DIR + 'sets.js', DIR + 'earth.js', DIR + 'segments/newton-faraday.js', DIR + 'segments/galileo.js', DIR + 'head-galileo.js'],
    setup(env) { return { press: Riso.press(env), st: Seg.newtonFaraday.init() }; },
    draw(g, t, env) {
        const { press } = env.state;
        press.begin(0);
        Ph.ink(press, (g2) => g2.rect(0, 0, 1600, 900), { blue: 0.9, 'navy.s': 0.7 });
        for (const [x, y, s, r] of [[330, 470, 0.25, 0], [1000, 460, 0.2, -0.6], [1420, 520, 0.06, -0.6]]) {
            Ph.cam(press, x, y, s, () => { press.each((g2) => g2.rotate(r)); GalHead.draw(press, {}); });
        }
        press.print(g, { key: 0 });
    },
});
