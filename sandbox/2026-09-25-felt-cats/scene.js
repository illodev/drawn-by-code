// 2026-09-25-felt-cats · style felt3d (new). Three needle-felted kittens dancing the
// «cowboy cats» meme dance, measured from a green-screen reference, over interchangeable
// backdrops. Stop motion on twos: one 3D render per drawing (15 drawings/s at 30 fps).
// For now a model sheet: 0–1 s the three cats, 1–2 s cat 2 from above (bald crown and
// puddle), 2–3 s cat 0 close, 3–4 s cat 2 close, 4–5 s the three from behind; stills at
// 10–14 s are the kit's debug views (albedo, normal, shadow, occlusion).
Motion.scene({
    fps: 30,
    duration: 15.84,
    logical: [900, 1600],
    uses: ['styles/felt3d/felt3d.js', 'sandbox/2026-09-25-felt-cats/cats.js'],
    shots: [[0, 15.84, 'Dance']],

    setup(env) {
        return { R: Felt3D.renderer(env, { scene: Cats.GLSL, scale: 0.9, params: Cats.PARAMS }) };
    },
    draw(g, t, env) {
        const d = Math.floor(t * 15 + 1e-6);
        const gr = g.createLinearGradient(0, 0, 0, 1600);
        gr.addColorStop(0, '#cfe3e8');
        gr.addColorStop(0.5, '#e9ddc9');
        gr.addColorStop(1, '#d8c3a5');
        g.fillStyle = gr;
        g.fillRect(0, 0, 900, 1600);
        const poses = [
            { x: -0.46, head: [0.1, 0.1, 0.05] },
            { x: 0.0, mouth: 0.6 },
            { x: 0.46, head: [-0.1, 0.35, -0.05], tail: [-0.7, 0, 0.5] },
        ];
        const views = [
            { cam: [0, 0.8, 6], target: [0, 0.8, 0], fov: 0.62 },
            { cam: [0.9, 2.2, 2.2], target: [0.46, 0.35, 0], fov: 0.5 },
            { cam: [-0.46, 0.8, 2.6], target: [-0.46, 0.6, 0], fov: 0.42 },
            { cam: [0.5, 1.5, 2.4], target: [0.46, 0.55, 0], fov: 0.42 },
            { cam: [0.3, 1.2, -5], target: [0, 0.5, 0], fov: 0.5 },
        ];
        const v = t >= 10 ? views[0] : views[Math.min(4, Math.floor(t))];
        env.state.R.render(g, d, {
            p: Cats.pack(poses, [[0.47, 0.1, 0.16], [0.63, 0.02, 0.08], [0.33, 0.22, 0.05]]), boil: d % 3,
            ...v, light: [-0.5, 0.8, 0.7], shadow: 0.55, debug: t >= 10 && t < 15 ? Math.floor(t) - 9 : 0,
        });
    },
});
