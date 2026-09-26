// 2026-09-25-felt-cats · style felt3d (new). Three needle-felted kittens dancing the
// «cowboy cats» meme dance, measured from a green-screen reference, over interchangeable
// backdrops. Stop motion on twos: one 3D render per drawing (15 drawings/s at 30 fps).
Motion.scene({
    fps: 30,
    duration: 15.84,
    logical: [900, 1600],
    uses: ['styles/felt3d/felt3d.js', 'sandbox/2026-09-25-felt-cats/cats.js'],
    shots: [[0, 15.84, 'Dance']],

    setup(env) {
        return { R: Felt3D.renderer(env, { scene: Cats.GLSL, scale: 0.6, params: 3 * Cats.STRIDE }) };
    },
    draw(g, t, env) {
        const d = Math.floor(t * 15 + 1e-6);
        const gr = g.createLinearGradient(0, 0, 0, 1600);
        gr.addColorStop(0, '#cfe3e8');
        gr.addColorStop(0.62, '#e9ddc9');
        gr.addColorStop(1, '#d8c3a5');
        g.fillStyle = gr;
        g.fillRect(0, 0, 900, 1600);
        const poses = [
            { x: -0.46, head: [0.1, 0.2, 0.05] },
            { x: 0.0, mouth: 0.6 },
            { x: 0.46, head: [-0.1, 0.1, -0.05] },
        ];
        env.state.R.render(g, d, {
            p: Cats.pack(poses), boil: d % 3,
            cam: [0, 0.75, 4.2], target: [0, 0.5, 0], fov: 0.62,
            light: [-0.5, 0.8, 0.7], shadow: 0.55, debug: t >= 10 && t < 15 ? Math.floor(t) - 9 : 0, // stills at 10–14 s: debug views
        });
    },
});
