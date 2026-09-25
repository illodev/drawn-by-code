// Dev scene: script v2 so far — Galileo on the roof (0–12.8, one continuous shot), Newton's apple (12.8–19.8), Faraday's coil (19.8–31).
const DIR = 'sandbox/2026-09-25-physics-history/';
const PLAN = [[0, 12.8, 'galileoRoof'], [12.8, 19.8, 'newtonApple'], [19.8, 31.0, 'faradayCoil']];
Motion.scene({
    fps: 24, duration: 31.0, logical: [1600, 900], bpm: 120, audio: { mix: 'mix.wav' },
    uses: ['styles/risograph/riso.js', DIR + 'kit.js', DIR + 'cast.js', DIR + 'sets.js', DIR + 'earth.js', DIR + 'figure.js', DIR + 'scope3d.js', DIR + 'head-galileo.js', DIR + 'hands-galileo.js', DIR + 'coil3d.js', DIR + 'lab-faraday.js',
        DIR + 'segments/newton-faraday.js', DIR + 'segments/galileo.js', DIR + 'segments/newton-apple.js', DIR + 'segments/galileo-roof.js', DIR + 'segments/faraday-coil.js'],
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
