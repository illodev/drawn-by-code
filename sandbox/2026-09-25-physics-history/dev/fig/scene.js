// Pose sheet for figure.js: key poses side by side on a day ground, to check proportions.
const DIR = 'sandbox/2026-09-25-physics-history/';
const u = 60;
const at = (x, P, C, H, hN, hF, fN, fF, extra = {}) => ({ u, P: [x + P[0], P[1]], C: [x + C[0], C[1]], H: [x + H[0], H[1]], hN: [x + hN[0], hN[1]], hF: [x + hF[0], hF[1]], fN: [x + fN[0], fN[1]], fF: [x + fF[0], fF[1]], ...extra });
const G = 820;
const POSES = [
    // standing
    (x) => at(x, [0, G - 3.95 * u], [8, G - 6.35 * u], [22, G - 7.2 * u], [5, G - 3.7 * u], [30, G - 3.8 * u], [25, G - 0.1 * u], [-20, G - 0.1 * u]),
    // bending to pick up
    (x) => at(x, [-20, G - 3.2 * u], [60, G - 5.1 * u], [110, G - 5.6 * u], [120, G - 0.5 * u], [90, G - 1.4 * u], [60, G - 0.1 * u], [-20, G - 0.1 * u], { tilt: 0.5 }),
    // wind-up
    (x) => at(x, [0, G - 3.9 * u], [-15, G - 6.3 * u], [-5, G - 7.15 * u], [-110, G - 4.4 * u], [60, G - 4.6 * u], [70, G - 0.1 * u], [-50, G - 0.1 * u], { tilt: -0.15, gripN: 'apple' }),
    // throw
    (x) => at(x, [20, G - 3.95 * u], [45, G - 6.35 * u], [65, G - 7.2 * u], [150, G - 9.2 * u], [-30, G - 4.2 * u], [75, G - 0.1 * u], [-60, G - 0.5 * u], { tilt: -0.35, elbowN: 'down', toeF: 0.5, gripN: 0 }),
    // sitting against a trunk, legs out
    (x) => at(x, [0, G - 0.5 * u], [-15, G - 2.9 * u], [0, G - 3.75 * u], [90, G - 1.2 * u], [100, G - 1.35 * u], [230, G - 0.1 * u], [200, G - 0.1 * u], { gripN: 0.4, gripF: 0.4 }),
];
Motion.scene({
    fps: 24, duration: 1, logical: [1600, 900],
    uses: ['styles/risograph/riso.js', DIR + 'kit.js', DIR + 'cast.js', DIR + 'figure.js'],
    setup(env) { return { press: Riso.press(env) }; },
    draw(g, t, env) {
        const { press } = env.state;
        press.begin(0);
        Ph.ink(press, (g2) => g2.rect(0, 0, 1600, 900), { 'blue.s': 0.3 });
        Ph.put(press, (g2) => g2.rect(0, G, 1600, 100), { yellow: 1, 'blue.s': 0.55 });
        POSES.forEach((fn, i) => Fig.newton(press, fn(160 + i * 300)));
        press.print(g, { key: 0 });
    },
});
