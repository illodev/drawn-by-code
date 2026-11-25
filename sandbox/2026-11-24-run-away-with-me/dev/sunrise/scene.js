// Dev scene of the sunrise section (sections/sunrise.js): 3:18–4:13 of the song, to the end.
const DIR = 'sandbox/2026-11-24-run-away-with-me/';
const FROM = 198.0536, LEN = 253.5 - 198.0536;
Motion.scene({
    fps: 24,
    duration: LEN,
    logical: [1920, 1080],
    uses: ['styles/retro-neon/neon.js', 'styles/retro-neon/ink.js', DIR + 'song.js', DIR + 'cast/couple.js', DIR + 'sections/registry.js', DIR + 'set/sunrise-beach.js', DIR + 'sections/sunrise.js'],
    fonts: [{ family: 'Shrikhand', src: 'fonts/Shrikhand-latin.woff2' }],
    bpm: 119, beatOffset: 0,
    audio: { mix: 'private/sunrise.wav' },

    async setup(env) {
        const N = Neon.make(env);
        await Couple.load();
        env.state = { N, sec: {} };
        env.state.sec.sunrise = await Sections.sunrise.setup(env);
        return env.state;
    },

    draw(g, t, env) {
        const tq = Math.floor(t * 12 + 1e-6) / 12;
        Sections.sunrise.draw(g, env, FROM + tq, Ink.boil(t));
    },

    post(ctx, t, env) { env.state.N.grain(ctx, Math.floor(t * 12) / 12, { amount: 0.05, vignette: 0.3 }); },
});
