// Plantilla del estilo luz líquida: manchas de aceite que derivan, se funden y cambian
// de tono.
Motion.scene({
    fps: 24,
    duration: 4,
    logical: [1600, 900],
    uses: ['styles/luz-liquida/kit.js'],
    bpm: 120,
    shots: [[0, 4, 'Plantilla']],

    draw(g, t, env) {
        const blobs = Liquid.drift('plantilla', 9, t, env, { rMin: 70, rMax: 150, speed: 0.35 });
        Liquid.field(g, env, blobs, { hueShift: t * 25 });
    },
});
