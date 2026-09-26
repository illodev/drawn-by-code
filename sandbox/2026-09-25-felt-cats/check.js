// Pose check: the cats alone on a transparent frame, danced by dance.js with the measured
// camera. private/overlay.py lays these stills over the reference (side by side, onion
// skin, silhouette overlap per instant).
Motion.scene({
    fps: 30,
    duration: 15.84,
    logical: [900, 1600],
    uses: [
        'styles/felt3d/felt3d.js', 'sandbox/2026-09-25-felt-cats/cats.js',
        'sandbox/2026-09-25-felt-cats/keys/segA.js', 'sandbox/2026-09-25-felt-cats/keys/segB.js', 'sandbox/2026-09-25-felt-cats/keys/segC.js',
        { src: 'sandbox/2026-09-25-felt-cats/private/solved-poses.js', optional: true }, { src: 'sandbox/2026-09-25-felt-cats/private/tracked-poses.js', optional: true }, 'sandbox/2026-09-25-felt-cats/dance.js',
    ],
    shots: [[0, 15.84, 'Dance']],
    setup(env) {
        return { R: Felt3D.renderer(env, { scene: Cats.GLSL, scale: 1.0, params: Cats.PARAMS }) };
    },
    draw(g, t, env) {
        const D = Dance.at(t);
        env.state.R.render(g, Math.round(D.tq * 15), { p: Cats.pack(D.poses), boil: 0, ...Stage.CAM, zoom: D.zoom, shadow: 0 });
    },
});
