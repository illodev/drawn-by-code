// Calibration against plate 11 of the «Description de l'Égypte»: one smooth pyramid seen from
// afar, its faces drawn as courses of small stones, the sun from the left. Not part of the film.
Motion.scene({
    fps: 24, duration: 1, logical: [1920, 1080],
    uses: ['styles/engraving/engrave.js'],
    setup: (env) => ({ R: Engrave.renderer(env, { scale: 2 }), A: Engrave.ager(env) }),
    draw(g, t, env) {
        const ground = [], pyr = [], small = [];
        Engrave.inst(ground, [0, -0.5, 0], 5, [80, 0.5, 80], 0.5);
        Engrave.inst(pyr, [0, 1.27 / 2, 0], 0, [1, 1.27 / 2, 1], 0.4);
        Engrave.inst(small, [2.1, 0.45, -1.2], 0, [0.6, 0.45, 0.6], 0.6);
        const f = {
            cam: [2.6, 0.55, 5.2], target: [0.25, 0.62, 0], fov: 0.42,
            sun: [-0.35, 0.5, 0.8], sunK: 0.8, fill: 0.2, ink: '#2e261d', paper: '#ebe1cb',
            draws: [
                { mesh: 'box', inst: new Float32Array(ground), box: true },
                { mesh: 'pyramid', inst: new Float32Array(pyr), masonry: true },
                { mesh: 'pyramid', inst: new Float32Array(small), masonry: true },
            ],
            shadow: { center: [0, 0.5, 0], radius: 3 },
            sky: { zenith: 0.32, horizon: 0.2 }, fog: [5, 22], spacing: 2.0, edge: 0.25, course: 0.014, charcoal: true,
        };
        env.state.A.apply(g, env.state.R.layer('p', f), { ink: f.ink, paper: f.paper, charcoal: true });
    },
});
