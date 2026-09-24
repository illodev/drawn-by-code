// 2026-09-24-clay3d-test · test of the clay3d style (styles/clay3d). Round 2: Laura as a
// plasticine puppet on a seamless studio backdrop, in the manner of the user's references
// (matte clay, pressed-on features, soft studio light). She blinks, waves hello with her
// right hand, then gives a thumbs up with her left with a grin and a wink.
// Stop motion on twos: one 3D render per drawing (Clay3D memoises it for the frame pair).
Motion.scene({
    fps: 24,
    duration: 4,
    logical: [1600, 900],
    uses: ['styles/clay3d/clay3d.js', 'sandbox/2026-09-24-clay3d-test/set.js'],
    bpm: 120,
    shots: [[0, 4, 'Studio']],

    setup(env) {
        return { R: Clay3D.renderer(env, { scene: SET_GLSL, scale: 0.6 }) };
    },
    draw(g, t, env) {
        const d = Math.floor(t * 12 + 1e-6), tq = d / 12;
        const K = (frames) => Motion.keys(frames, tq);
        const KV = (frames) => Motion.keys(frames, tq); // arrays interpolate too
        const blink = (tq >= 0.5 && tq < 0.59) || (tq >= 2.25 && tq < 2.34) ? 1 : 0;
        const wink = tq >= 3.0 && tq < 3.5 ? 1 : 0;
        const grin = tq >= 1.25 && tq < 2.25 ? 1 : tq >= 2.75 ? 1 : 0;
        const look = tq < 1.0 ? [-0.3, 0.1] : [0, 0];
        const tilt = K([[0, 0], [1.0, 0], [1.25, 0.06], [2.25, 0.06], [2.5, -0.05], [4, -0.05]]);
        const brow = K([[0, 0], [1.0, 0], [1.17, 1], [2.25, 1], [2.5, 0.3], [4, 0.3]]);
        // right arm (image left): down, up to a wave (1.0–1.25), waving on twos, down (2.25–2.6)
        const up = K([[0, 0], [1.0, 0], [1.25, 1], [2.25, 1], [2.6, 0], [4, 0]]);
        const wave = up * Math.sin((tq - 1.25) * Math.PI * 4) * 0.35;
        const elR = [-0.5 + 0.02 * up, 0.78 + 0.28 * up, 0.05 + 0.05 * up];
        const wrR = [-0.55 - 0.05 * up, 0.5 + 0.8 * up, 0.12 + 0.08 * up];
        const rotR = [0, 0, Math.PI * (1 - up) + wave * up];
        // left arm (image right): down, then a thumbs up in front of the chest (2.5–2.85)
        const th = K([[0, 0], [2.5, 0], [2.85, 1], [4, 1]]);
        const bump = tq >= 2.85 && tq < 2.94 ? 0.02 : 0;
        const elL = [0.5, 0.78 + 0.05 * th, 0.05 + 0.1 * th];
        const wrL = [0.55 - 0.3 * th, 0.5 + 0.35 * th + bump, 0.12 + 0.22 * th];
        const rotL = [0, 0.4 * th, Math.PI * (1 - th) - 0.2 * th];
        const breath = Math.sin(tq * 2.2) * 0.004;
        const a = [...look, blink, grin, tilt, brow, ...elR, ...wrR, ...rotR, 0, ...elL, ...wrL, ...rotL, th > 0.5 ? 1 : 0, breath, wink];
        a[95] = d % 3;
        env.state.R.render(g, d, {
            t: tq, a,
            cam: [0.0, 1.3, 5.4], target: [0.0, 1.3, 0], fov: 0.36,
            focus: 5.4, aperture: 0.06, light: [-0.6, 0.7, 0.75], soft: 8, fill: 0.55, key: 1.9,
        });
    },
    post(ctx, t, env) {
        const [w, h] = env.px, gr = ctx.createRadialGradient(w * 0.5, h * 0.45, h * 0.4, w * 0.5, h * 0.5, h * 1.1);
        gr.addColorStop(0, 'rgba(0,0,0,0)');
        gr.addColorStop(1, 'rgba(60,20,20,0.25)');
        ctx.fillStyle = gr;
        ctx.fillRect(0, 0, w, h);
        const d = Math.floor(t * 12 + 1e-6), r = Motion.rng('grain' + (d % 6));
        for (let i = 0; i < 9000; i++) {
            ctx.fillStyle = r() < 0.5 ? 'rgba(255,240,220,0.05)' : 'rgba(20,10,0,0.06)';
            ctx.fillRect(r() * w, r() * h, 1.5, 1.5);
        }
    },
});
