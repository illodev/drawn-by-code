// «Run Away With Me» · the whole film: plays every registered section by song second, a
// placeholder card where a section is not built yet, the signature at the end.
const DIR = 'sandbox/2026-11-24-run-away-with-me/';
const NAMES = ['opening', 'escape', 'drive', 'clouds', 'night', 'boat', 'sunrise'];
// each section's own files (its first line, «// uses: …»), loaded before the sections
const EXTRA = ['props/opening-figures.js', 'set/opening-street.js', 'set/opening-party.js', 'set/sunrise-beach.js', 'props/boat-speedboat.js', 'set/clouds-city.js', 'set/escape-sets.js'];
Motion.scene({
    fps: 24,
    duration: 253.5,
    logical: [1920, 1080],
    uses: ['styles/retro-neon/neon.js', 'styles/retro-neon/ink.js', DIR + 'song.js', DIR + 'set/causeway.js', DIR + 'set/skyline.js', DIR + 'props/car.js', DIR + 'cast/couple.js', DIR + 'set/drawn.js', DIR + 'film.js', DIR + 'sections/registry.js']
        .concat(EXTRA.map((f) => ({ src: DIR + f, optional: true })))
        .concat(NAMES.map((n) => ({ src: DIR + 'sections/' + n + '.js', optional: true }))),
    fonts: [{ family: 'Shrikhand', src: 'fonts/Shrikhand-latin.woff2' }],
    bpm: 119, beatOffset: 0.415,
    audio: { mix: 'private/song.wav' },

    async setup(env) {
        const N = Neon.make(env);
        await Couple.load();
        env.state = { N, sec: {} };
        for (const [name, s] of Object.entries(Sections)) if (s.setup) env.state.sec[name] = await s.setup(env);
        return env.state;
    },

    draw(g, t, env) {
        const tq = Math.floor(t * 12 + 1e-6) / 12, d = Ink.boil(t), T = tq;
        const s = Object.values(Sections).find((x) => T >= x.from && T < x.to);
        if (s) return s.draw(g, env, T, d);
        // a section not built yet: a card in the film's inks with its time
        g.fillStyle = Ink.PAL.night; g.fillRect(0, 0, env.W, env.H);
        g.fillStyle = Ink.PAL.magenta; g.font = '64px Shrikhand'; g.textAlign = 'center';
        g.fillText(T < 251.4 ? 'section to come · ' + T.toFixed(1) + ' s' : 'illodev x Claude', env.W / 2, env.H / 2);
    },

    post(ctx, t, env) { env.state.N.grain(ctx, Math.floor(t * 12) / 12, { amount: 0.05, vignette: 0.3 }); },
});
