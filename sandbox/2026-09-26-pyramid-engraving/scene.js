// «The pyramid that makes skies», engraved: style test on the decisive shot (PIR-03, the
// impossible exploded view held at 14–15.5 s). A plate of the «Description de l'Égypte»
// that moves: burin lines, ruled sky, blue as the only live ink.
Motion.scene({
    fps: 24,
    duration: 39.6,
    logical: [1920, 1080],
    uses: ['styles/engraving/engrave.js', 'sandbox/2026-09-26-pyramid-engraving/pyramid.js', 'sandbox/2026-09-26-pyramid-engraving/terrain.js', 'sandbox/2026-09-26-pyramid-engraving/props.js', 'sandbox/2026-09-26-pyramid-engraving/gallery.js', 'sandbox/2026-09-26-pyramid-engraving/shaft.js', 'sandbox/2026-09-26-pyramid-engraving/resonance.js', 'sandbox/2026-09-26-pyramid-engraving/film.js'],
    fonts: [{ family: 'Fell', src: 'fonts/IMFellDWPicaSC-Regular.ttf' }],
    shots: [[0, 6.6, 'PIR-01 the plate, something inside is awake'], [6.6, 11.6, 'PIR-02 first breath'], [11.6, 18.6, 'PIR-03 impossible opening'], [18.6, 25.6, 'PIR-04 what comes in takes shape'], [25.6, 32.6, 'PIR-05 gravity has architecture'], [32.6, 39.6, 'PIR-06 the inside no longer fits']],
    setup: (env) => PyramidFilm.setup(env),
    draw: (g, t, env) => PyramidFilm.frame(g, t, env),
});
