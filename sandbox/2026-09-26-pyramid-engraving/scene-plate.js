// The same film inside a printed plate (margins, neat line, caption): for the opening and
// closing frames, and to compare with the plates of the «Description de l'Égypte».
Motion.scene({
    fps: 24,
    duration: 63.6,
    logical: [1920, 1080],
    uses: ['styles/engraving/engrave.js', 'sandbox/2026-09-26-pyramid-engraving/pyramid.js', 'sandbox/2026-09-26-pyramid-engraving/terrain.js', 'sandbox/2026-09-26-pyramid-engraving/props.js', 'sandbox/2026-09-26-pyramid-engraving/gallery.js', 'sandbox/2026-09-26-pyramid-engraving/shaft.js', 'sandbox/2026-09-26-pyramid-engraving/resonance.js', 'sandbox/2026-09-26-pyramid-engraving/nursery.js', 'sandbox/2026-09-26-pyramid-engraving/seed.js', 'sandbox/2026-09-26-pyramid-engraving/apex.js', 'sandbox/2026-09-26-pyramid-engraving/star.js', 'sandbox/2026-09-26-pyramid-engraving/film.js'],
    fonts: [{ family: 'Fell', src: 'fonts/IMFellDWPicaSC-Regular.ttf' }],
    shots: [[0, 6.6, 'PIR-01 the plate, something inside is awake'], [6.6, 11.6, 'PIR-02 first breath'], [11.6, 18.6, 'PIR-03 impossible opening'], [18.6, 25.6, 'PIR-04 what comes in takes shape'], [25.6, 32.6, 'PIR-05 gravity has architecture'], [32.6, 39.6, 'PIR-06 the inside no longer fits'], [39.6, 46.6, 'PIR-07 the nursery'], [46.6, 53.6, 'PIR-08 a sky inside another'], [53.6, 58.6, 'PIR-09 the stone goes back'], [58.6, 63.6, 'PIR-10 one more star, the plate']],
    setup: (env) => PyramidFilm.setup(env),
    draw: (g, t, env) => PyramidFilm.frame(g, t, env, { plate: true }),
});
