// Dev scene of the causeway section (sections/drive.js): 0:47–1:39 of the song.
const DIR = 'sandbox/2026-11-24-run-away-with-me/';
const B23 = 46.8013, LEN = 52.4347;
Motion.scene({
    fps: 24,
    duration: LEN,
    logical: [1920, 1080],
    uses: ['styles/retro-neon/neon.js', 'styles/retro-neon/ink.js', DIR + 'song.js', DIR + 'set/causeway.js', DIR + 'set/skyline.js', DIR + 'props/car.js', DIR + 'cast/couple.js', DIR + 'set/drawn.js', DIR + 'film.js', DIR + 'sections/registry.js', DIR + 'sections/drive.js'],
    bpm: 119, beatOffset: 0,
    audio: { mix: 'private/drive.wav' },

    async setup(env) {
        const N = Neon.make(env);
        await Couple.load();
        return { N };
    },

    draw(g, t, env) {
        const tq = Math.floor(t * 12 + 1e-6) / 12;
        Sections.drive.draw(g, env, B23 + tq, Ink.boil(t));
    },

    post(ctx, t, env) { env.state.N.grain(ctx, Math.floor(t * 12) / 12, { amount: 0.05, vignette: 0.3 }); },
});

