// Dev scene of the night section (sections/night.js): 2:11–2:43 of the song (bars 65–81).
const DIR = 'sandbox/2026-11-24-run-away-with-me/';
const FROM = 131.5024, LEN = 32.2675;
Motion.scene({
    fps: 24,
    duration: LEN,
    logical: [1920, 1080],
    uses: ['styles/retro-neon/neon.js', 'styles/retro-neon/ink.js', DIR + 'song.js', DIR + 'set/causeway.js', DIR + 'set/skyline.js', DIR + 'props/car.js', DIR + 'cast/couple.js', DIR + 'set/drawn.js', DIR + 'film.js', DIR + 'sections/registry.js', DIR + 'sections/night.js'],
    bpm: 119, beatOffset: 0,

    async setup(env) {
        const N = Neon.make(env);
        await Couple.load();
        env.state = { N, sec: {} };
        env.state.sec.night = await Sections.night.setup(env);
        return env.state;
    },

    draw(g, t, env) {
        const tq = Math.floor(t * 12 + 1e-6) / 12;
        Sections.night.draw(g, env, FROM + tq, Ink.boil(t));
    },

    post(ctx, t, env) { env.state.N.grain(ctx, Math.floor(t * 12) / 12, { amount: 0.05, vignette: 0.3 }); },
});
