// The film, script v2: Galileo (0–12.8), Newton (12.8–19.8), Faraday (19.8–31), Curie
// (31–38.6), Einstein (38.6–47.8), Schrödinger (47.8–57.8); the cat in every scene.
const DIR = 'sandbox/2026-09-25-physics-history/';
const PLAN = [[0, 12.8, 'galileoRoof'], [12.8, 19.8, 'newtonApple'], [19.8, 31.0, 'faradayCoil'], [31.0, 38.6, 'curieRadium'], [38.6, 47.2, 'einsteinRay'], [47.2, 57.2, 'schrodingerBox']];
Motion.scene({
    fps: 24, duration: 57.2, logical: [1600, 900], bpm: 117.5, audio: { mix: 'mix.wav' },
    uses: ['styles/risograph/riso.js', DIR + 'kit.js', DIR + 'cast.js', DIR + 'sets.js', DIR + 'earth.js', DIR + 'figure.js', DIR + 'cat.js', DIR + 'scope3d.js', DIR + 'head-galileo.js', DIR + 'hands-galileo.js', DIR + 'coil3d.js', DIR + 'lab-faraday.js',
        DIR + 'segments/newton-faraday.js', DIR + 'segments/galileo.js', DIR + 'segments/newton-apple.js', DIR + 'segments/galileo-roof.js', DIR + 'segments/faraday-coil.js',
        DIR + 'segments/curie.js', DIR + 'segments/curie-radium.js', DIR + 'segments/einstein.js', DIR + 'segments/einstein-ray.js', DIR + 'segments/schrodinger.js', DIR + 'segments/schrodinger-box.js'],
    shots: PLAN.map(([a, b, n]) => [a, b, n]),
    setup(env) { const st = {}; for (const [, , n] of PLAN) st[n] = Seg[n].init?.(env) ?? {}; return { press: Riso.press(env), st }; },
    draw(g, t, env) {
        const { press, st } = env.state, d = Math.floor(t * 12 + 1e-6), tq = d / 12;
        press.begin(d);
        const [a, , n] = PLAN.find(([a0, b0]) => tq >= a0 && tq < b0) ?? PLAN[PLAN.length - 1];
        Seg[n].draw(press, tq - a, st[n], { st });
        press.print(g, { key: d });
    },
});
