// Liquid light style template: oil blobs that drift, merge and shift hue.
Motion.scene({
    fps: 24,
    duration: 4,
    logical: [1600, 900],
    uses: ['styles/liquid-light/kit.js'],
    bpm: 120,
    shots: [[0, 4, 'Template']],

    draw(g, t, env) {
        const blobs = Liquid.drift('plantilla', 9, t, env, { rMin: 70, rMax: 150, speed: 0.35 });
        Liquid.field(g, env, blobs, { hueShift: t * 25 });
    },
});
