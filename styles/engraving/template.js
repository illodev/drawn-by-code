// Engraving style template: a small stepped temple of cut stones on the desert, a gold ring
// turning above it round a blue live core; the camera drifts. Ink on laid paper.
Motion.scene({
    fps: 24,
    duration: 3,
    logical: [1600, 900],
    uses: ['styles/engraving/engrave.js'],
    shots: [[0, 3, 'Template']],
    setup(env) {
        const R = Engrave.renderer(env);
        R.mesh('ring', Engrave.torus(0.08));
        const r = Motion.rng('template-stones'), stones = [];
        for (let c = 0; c < 6; c++) {
            const w = 0.6 - c * 0.09, y = 0.05 + c * 0.1;
            for (const [ax, sg] of [[0, 1], [0, -1], [2, 1], [2, -1]]) {
                for (let u = -w; u < w - 0.01; ) {
                    const l = Math.min(0.12 + r() * 0.08, w - u), m = u + l / 2;
                    const c3 = ax === 0 ? [sg * (w - 0.04), y, m] : [m, y, sg * (w - 0.04)];
                    const h = ax === 0 ? [0.04, 0.048, l / 2 - 0.003] : [l / 2 - 0.003, 0.048, 0.04];
                    stones.push([c3, r() < 0.15 ? 1 : 0, h, r()]);
                    u += l;
                }
            }
        }
        return { R, stones };
    },
    draw(g, t, env) {
        const { R, stones } = env.state;
        const box = [], ring = [], core = [];
        Engrave.inst(box, [0, -0.5, 0], 5, [40, 0.5, 40], 0.5);
        for (const [c, m, h, s] of stones) Engrave.inst(box, c, m, h, s);
        Engrave.inst(core, [0, 0.35, 0], 4, [0.06, 0.3, 0.06], 0.5, [0, 0, 0, 1], 0.6);
        Engrave.inst(ring, [0, 0.95, 0], 3, [0.45, 0.45, 0.45], 0.4, Engrave.qmul(Engrave.quat([0, 1, 0], t * 0.8), Engrave.quat([1, 0, 0], 0.5)));
        const a = 0.7 + t * 0.08;
        R.render(g, 'f' + Math.round(t * 24), {
            cam: [Math.sin(a) * 2.6, 1.3, Math.cos(a) * 2.6], target: [0, 0.45, 0], fov: 0.7,
            sun: [-0.45, 0.42, 0.8], fill: 0.3, shadow: { center: [0, 0.4, 0], radius: 1.6 },
            draws: [
                { mesh: 'box', inst: new Float32Array(box), box: true },
                { mesh: 'box', inst: new Float32Array(core), box: true, cast: false },
                { mesh: 'ring', inst: new Float32Array(ring) },
            ],
            lights: [[0, 0.4, 0, 0, 0.6]],
        });
    },
});
