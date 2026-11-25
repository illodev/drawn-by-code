// Dev scene of the clouds section (sections/clouds.js): 1:39–2:11 of the song (bars 49–65).
const DIR = 'sandbox/2026-11-24-run-away-with-me/';
const B49 = 0.415 + 49 * 2.01672, LEN = 16 * 2.01672;
Motion.scene({
    fps: 24,
    duration: LEN,
    logical: [1920, 1080],
    uses: ['styles/retro-neon/neon.js', 'styles/retro-neon/ink.js', DIR + 'song.js', DIR + 'set/causeway.js', DIR + 'set/skyline.js', DIR + 'props/car.js', DIR + 'cast/couple.js', DIR + 'set/drawn.js', DIR + 'film.js', DIR + 'sections/registry.js', DIR + 'set/clouds-life.js', DIR + 'set/clouds-city.js', DIR + 'sections/clouds.js'],
    fonts: [{ family: 'Shrikhand', src: 'fonts/Shrikhand-latin.woff2' }],
    bpm: 119, beatOffset: 0,
    audio: { mix: '../../private/clouds.wav' },

    async setup(env) {
        const N = Neon.make(env);
        await Couple.load();
        env.state = { N, sec: {} };
        env.state.sec.clouds = await Sections.clouds.setup(env);
        return env.state;
    },

    draw(g, t, env) {
        // the song second on the film's own 12-a-second grid (as full.js does)
        const T = Math.floor((B49 + t) * 12 + 1e-6) / 12;
        Sections.clouds.draw(g, env, Math.max(B49, T), Ink.boil(B49 + t));
    },

    post(ctx, t, env) { env.state.N.grain(ctx, Math.floor(t * 12) / 12, { amount: 0.05, vignette: 0.3 }); },
});
