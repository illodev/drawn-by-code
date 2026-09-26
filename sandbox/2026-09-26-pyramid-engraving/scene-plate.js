// The same film inside a printed plate (margins, neat line, caption): for the opening and
// closing frames, and to compare with the plates of the «Description de l'Égypte».
Motion.scene({
    fps: 24,
    duration: 17,
    logical: [1920, 1080],
    uses: ['styles/engraving/engrave.js', 'sandbox/2026-09-26-pyramid-engraving/pyramid.js', 'sandbox/2026-09-26-pyramid-engraving/film.js'],
    fonts: [{ family: 'Fell', src: 'fonts/IMFellDWPicaSC-Regular.ttf' }],
    shots: [[5, 10, 'PIR-02 first breath'], [10, 17, 'PIR-03 impossible opening']],
    setup: (env) => PyramidFilm.setup(env),
    draw: (g, t, env) => PyramidFilm.frame(g, t, env, { plate: true }),
});
