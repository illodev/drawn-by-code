// The same film inside a printed plate (margins, neat line, caption): for the opening and
// closing frames, and to compare with the plates of the «Description de l'Égypte».
Motion.scene({
    fps: 24,
    duration: 25.6,
    logical: [1920, 1080],
    uses: ['styles/engraving/engrave.js', 'sandbox/2026-09-26-pyramid-engraving/pyramid.js', 'sandbox/2026-09-26-pyramid-engraving/terrain.js', 'sandbox/2026-09-26-pyramid-engraving/gallery.js', 'sandbox/2026-09-26-pyramid-engraving/film.js'],
    fonts: [{ family: 'Fell', src: 'fonts/IMFellDWPicaSC-Regular.ttf' }],
    shots: [[0, 6.6, 'PIR-01 the plate, something inside is awake'], [6.6, 11.6, 'PIR-02 first breath'], [11.6, 18.6, 'PIR-03 impossible opening'], [18.6, 25.6, 'PIR-04 what comes in takes shape']],
    setup: (env) => PyramidFilm.setup(env),
    draw: (g, t, env) => PyramidFilm.frame(g, t, env, { plate: true }),
});
