// Dev scene: the «Newton's apple» segment alone (script v2, 5–12 s of the piece).
const DIR = 'sandbox/2026-09-25-physics-history/';
Motion.scene({
    fps: 24, duration: 7, logical: [1600, 900], bpm: 120, audio: { mix: 'mix.wav' },
    uses: ['styles/risograph/riso.js', DIR + 'kit.js', DIR + 'cast.js', DIR + 'sets.js', DIR + 'earth.js', DIR + 'figure.js', DIR + 'segments/newton-apple.js'],
    shots: [[0, 1.5, 'Apple'], [1.5, 5, 'Newton'], [5, 7, 'Pull back']],
    setup(env) { return { press: Riso.press(env), st: Seg.newtonApple.init(env) }; },
    draw(g, t, env) {
        const { press, st } = env.state, d = Math.floor(t * 12 + 1e-6), tq = d / 12;
        press.begin(d);
        Seg.newtonApple.draw(press, tq, st);
        press.print(g, { key: d });
    },
});
