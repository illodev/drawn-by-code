// Dev scene of the bridge section (sections/boat.js): 2:43–3:18 of the song (bars 81–98).
const DIR = 'sandbox/2026-11-24-run-away-with-me/';
const FROM = 163.769, LEN = 198.054 - 163.769;
Motion.scene({
    fps: 24,
    duration: LEN,
    logical: [1920, 1080],
    uses: ['styles/retro-neon/neon.js', 'styles/retro-neon/ink.js', DIR + 'song.js', DIR + 'set/causeway.js', DIR + 'set/skyline.js', DIR + 'props/car.js', DIR + 'cast/couple.js', DIR + 'set/drawn.js', DIR + 'film.js', DIR + 'sections/registry.js', DIR + 'props/boat-speedboat.js', DIR + 'sections/boat.js'],
    bpm: 119, beatOffset: 0.415 - FROM,
    audio: { mix: 'private/boat.wav' },

    async setup(env) {
        const N = Neon.make(env);
        await Couple.load();
        env.state = { N, sec: {} };
        env.state.sec.boat = await Sections.boat.setup(env);
        return env.state;
    },

    draw(g, t, env) {
        const tq = Math.floor(t * 12 + 1e-6) / 12;
        Sections.boat.draw(g, env, FROM + tq, Ink.boil(t));
    },

    post(ctx, t, env) { env.state.N.grain(ctx, Math.floor(t * 12) / 12, { amount: 0.05, vignette: 0.3 }); },
});
