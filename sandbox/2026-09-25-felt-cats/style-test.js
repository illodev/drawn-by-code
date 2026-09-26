// Style test: the three felt kittens in one pose of the dance (arms out, 3.2 s of the
// reference) on three different sets, 2 s each, swaying on twos.
Motion.scene({
    fps: 30,
    duration: 6,
    logical: [900, 1600],
    uses: ['styles/felt3d/felt3d.js', 'sandbox/2026-09-25-felt-cats/cats.js', 'sandbox/2026-09-25-felt-cats/backdrops.js'],
    shots: [[0, 2, 'Desert'], [2, 4, 'Kitchen'], [4, 6, 'Disco']],

    setup(env) {
        return { R: Felt3D.renderer(env, { scene: Cats.GLSL, scale: 0.6, params: Cats.PARAMS }) };
    },
    draw(g, t, env) {
        const d = Math.floor(t * 15 + 1e-6), tq = d / 15;
        const set = Backdrops.get(['desert', 'kitchen', 'disco'][Math.min(2, Math.floor(t / 2))]);
        set.paint(g, t, env);
        const s = Math.sin(tq * Math.PI * 2 * 123 / 120);
        const arms = (k) => [0.5 + 0.1 * k, 1.15 + 0.1 * k, 0.35, 0.1];
        const poses = [
            { x: -0.45, roll: 0.06 * s, head: [0.15, -0.05, 0.1 * s], armL: arms(s), armR: arms(-s), tail: [0.8, 0, 0.5] },
            { x: 0.0, z: 0.05, roll: -0.05 * s, head: [0, -0.1, -0.08 * s], armL: arms(-s), armR: arms(s), mouth: 0.7 },
            { x: 0.45, roll: 0.06 * s, head: [-0.1, -0.05, 0.12 * s], armL: arms(s), armR: arms(-s), tail: [-0.8, 0, 0.5] },
        ];
        env.state.R.render(g, d + 1000 * Math.floor(t / 2), { p: Cats.pack(poses, [[0.47, 0.1, 0.16], [0.63, 0.02, 0.08], [0.33, 0.22, 0.05]]), boil: d % 3, ...Stage.CAM, ...set.light });
    },
});
