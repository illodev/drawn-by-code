// Dev scene of the opening section (sections/opening.js): 0:00–0:24.6 of the song (bars 0–12).
// Not part of the film.
const DIR = 'sandbox/2026-11-24-run-away-with-me/';
Motion.scene({
    fps: 24,
    duration: 24.616,
    logical: [1920, 1080],
    uses: ['styles/retro-neon/neon.js', 'styles/retro-neon/ink.js', DIR + 'song.js', DIR + 'set/causeway.js', DIR + 'set/skyline.js', DIR + 'props/car.js', DIR + 'cast/couple.js', DIR + 'set/drawn.js', DIR + 'film.js', DIR + 'sections/registry.js',
        DIR + 'props/opening-figures.js', DIR + 'set/opening-street.js', DIR + 'set/opening-party.js', DIR + 'sections/opening.js'],
    bpm: 119, beatOffset: 0.415,
    shots: [[0, 4.4484, 'tubes strike'], [4.4484, 8.4818, 'down the Drive'], [8.4818, 12.5153, 'up the tower'], [12.5153, 16.5487, 'the mirror ball'], [16.5487, 18.5654, 'the bass: the room'], [18.5654, 20.5822, 'through the crowd'], [20.5822, 24.616, 'she: the room presses in']],
    audio: { mix: '../../private/song.wav' },

    async setup(env) {
        const N = Neon.make(env);
        await Couple.load();
        env.state = { N, sec: {} };
        env.state.sec.opening = await Sections.opening.setup(env);
        return env.state;
    },

    draw(g, t, env) {
        const tq = Math.floor(t * 12 + 1e-6) / 12;
        Sections.opening.draw(g, env, tq, Ink.boil(t));
    },

    post(ctx, t, env) { env.state.N.grain(ctx, Math.floor(t * 12) / 12, { amount: 0.05, vignette: 0.3 }); },
});
