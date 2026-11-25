// Dev scene of the escape section (sections/escape.js): 0:24.6–0:46.8 of the song (bars 12–22).
const DIR = 'sandbox/2026-11-24-run-away-with-me/';
const FROM = 24.6162, LEN = 22.1839;
Motion.scene({
    fps: 24,
    duration: LEN,
    logical: [1920, 1080],
    uses: ['styles/retro-neon/neon.js', 'styles/retro-neon/ink.js', DIR + 'song.js', DIR + 'set/causeway.js', DIR + 'set/skyline.js', DIR + 'props/car.js', DIR + 'cast/couple.js', DIR + 'set/drawn.js', DIR + 'film.js', DIR + 'sections/registry.js', DIR + 'props/opening-figures.js', DIR + 'set/opening-party.js', DIR + 'set/opening-street.js', DIR + 'set/escape-sets.js', DIR + 'sections/escape.js'],
    fonts: [{ family: 'Shrikhand', src: 'fonts/Shrikhand-latin.woff2' }],
    bpm: 119, beatOffset: 0,
    audio: { mix: 'private/escape.wav' },

    async setup(env) {
        const N = Neon.make(env);
        await Couple.load();
        env.state = { N, sec: {} };
        env.state.sec.escape = await Sections.escape.setup(env);
        return env.state;
    },

    draw(g, t, env) {
        const tq = Math.floor((FROM + t) * 12 + 1e-6) / 12;
        Sections.escape.draw(g, env, tq, Ink.boil(FROM + t));
    },

    post(ctx, t, env) { env.state.N.grain(ctx, Math.floor(t * 12) / 12, { amount: 0.05, vignette: 0.3 }); },
});
