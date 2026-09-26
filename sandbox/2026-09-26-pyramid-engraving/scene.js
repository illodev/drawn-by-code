// «The pyramid that makes skies», engraved: style test on the decisive shot (PIR-03, the
// impossible exploded view held at 14–15.5 s). A plate of the «Description de l'Égypte»
// that moves: burin lines, ruled sky, blue as the only live ink.
Motion.scene({
    fps: 24,
    duration: 17,
    logical: [1920, 1080],
    uses: ['styles/engraving/engrave.js', 'sandbox/2026-09-26-pyramid-engraving/pyramid.js', 'sandbox/2026-09-26-pyramid-engraving/film.js'],
    fonts: [{ family: 'Fell', src: 'fonts/IMFellDWPicaSC-Regular.ttf' }],
    shots: [[5, 10, 'PIR-02 first breath'], [10, 17, 'PIR-03 impossible opening']],
    setup: (env) => PyramidFilm.setup(env),
    draw: (g, t, env) => PyramidFilm.frame(g, t, env),
});
