// 2026-09-24-clay3d-test · first test of the clay3d style (styles/clay3d): a table-top set
// in the manner of classic claymation, with our own cast: Laura at a table with a cloth,
// holding a mug with both hands, the brand's cloud as a clay figurine on the table. She
// looks at the figurine, turns to the camera, raises the mug with a grin, sets it down.
// Stop motion on twos: one 3D render per drawing (Clay3D memoises it for the frame pair).
Motion.scene({
    fps: 24,
    duration: 4,
    logical: [1600, 900],
    uses: ['styles/clay3d/clay3d.js', 'sandbox/2026-09-24-clay3d-test/set.js'],
    bpm: 120,
    shots: [[0, 4, 'Table']],

    setup(env) {
        try { return { R: Clay3D.renderer(env, { scene: SET_GLSL, scale: 0.6 }) }; } catch (e) { return { err: String(e) }; }
    },
    draw(g, t, env) {
        if (env.state.err) { g.fillStyle = '#fff'; g.font = '16px monospace'; env.state.err.split('\n').slice(0, 30).forEach((l, i) => g.fillText(l.slice(0, 180), 20, 30 + i * 20)); return; }
        const E = Ease, d = Math.floor(t * 12 + 1e-6), tq = d / 12;
        const K = (frames) => Motion.keys(frames, tq);
        // look: at the figurine (her left, down), then at the camera
        const look = tq < 1.0 ? [0.9, -0.35] : tq < 1.17 ? [0.4, -0.1] : [0, 0];
        const yaw = K([[0, 0.28], [1.0, 0.28], [1.25, 0], [4, 0]]);
        const blink = (tq >= 1.0 && tq < 1.09) || (tq >= 3.25 && tq < 3.34) ? 1 : 0;
        const grin = K([[0, 0], [1.5, 0], [1.75, 1], [3.25, 1], [3.5, 0.2], [4, 0.2]]);
        const tilt = K([[0, -0.03], [1.5, -0.03], [1.83, 0.07], [3.25, 0.07], [3.6, 0], [4, 0]]);
        // the mug: on the table, raised in a toast (1.5–1.92), set down (3.0–3.42), a clink
        const lift = K([[0, 0], [1.5, 0], [1.92, 1], [3.0, 1], [3.42, 0], [4, 0]]);
        const mug = [0, 1.12 + 0.2 * lift + (tq >= 1.92 && tq < 2.0 ? 0.015 : 0), 0.3 + 0.06 * lift];
        const elR = [-0.6, 1.08 + 0.12 * lift, 0.05], elL = [0.6, 1.08 + 0.12 * lift, 0.05];
        const breath = Math.sin(tq * 2.2) * 0.006;
        const a = [...look, blink, grin, tilt, yaw, ...mug, ...elR, ...elL, breath];
        a[95] = d % 3; // the boil
        try { env.state.R.render(g, d, {
            t: tq, a,
            cam: [0.05, 1.45, 4.9], target: [0.05, 1.68, 0], fov: 0.5,
            focus: 5.0, aperture: 0.22, light: [-0.65, 0.72, 0.7],
        }); } catch (e) { g.fillStyle = '#f66'; g.font = '20px monospace'; String(e.stack || e).split('\n').forEach((l, i) => g.fillText(l.slice(0, 150), 20, 40 + i * 24)); }
    },
    post(ctx, t, env) {
        // a warm vignette: the set under its lamp
        const [w, h] = env.px, gr = ctx.createRadialGradient(w * 0.5, h * 0.42, h * 0.35, w * 0.5, h * 0.5, h * 1.05);
        gr.addColorStop(0, 'rgba(0,0,0,0)');
        gr.addColorStop(1, 'rgba(30,16,8,0.4)');
        ctx.fillStyle = gr;
        ctx.fillRect(0, 0, w, h);
        // film grain, fixed per drawing (stop motion: a new frame of film every drawing)
        const d = Math.floor(t * 12 + 1e-6), r = Motion.rng('grain' + (d % 6));
        ctx.save();
        for (let i = 0; i < 9000; i++) {
            ctx.fillStyle = r() < 0.5 ? 'rgba(255,240,220,0.05)' : 'rgba(20,10,0,0.06)';
            ctx.fillRect(r() * w, r() * h, 1.5, 1.5);
        }
        ctx.restore();
    },
});
