// 2026-09-25-felt-cats · the «dancing cowboy cats» in needle felt: the cats and the dance
// are film.js; this file only picks the set. Copy it with another name for another set.
const SET = 'desert';
const DIR = 'sandbox/2026-09-25-felt-cats/';
Motion.scene({
    fps: 30,
    duration: 15.84,
    logical: [900, 1600],
    uses: [
        'styles/felt3d/felt3d.js', DIR + 'cats.js',
        DIR + 'keys/segA.js', DIR + 'keys/segB.js', DIR + 'keys/segC.js',
        // the tracked dance (measured on the reference: private); without it the hand keys dance
        { src: DIR + 'private/solved-poses.js', optional: true }, { src: DIR + 'private/tracked-poses.js', optional: true },
        DIR + 'dance.js', DIR + 'backdrops.js', DIR + 'film.js',
    ],
    bpm: 123,
    beatOffset: 0.197,
    shots: [[0, 15.84, 'Dance']],
    audio: { mix: 'private/audio/music.wav' }, // relative to this folder; private, skipped if absent
    setup: (env) => FeltFilm(SET).setup(env),
    draw: (g, t, env) => env.state.film.draw(g, t, env),
});
