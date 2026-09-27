// Detail bench: one corner of a temple hall seen as in the Dendera plate (Vol. IV, Pl. 30):
// a decorated wall, a column with its Hathor capital, the ceiling and floor, lit like the
// plate. Not part of the film: each element is worked here, side by side with the plate's
// crop at the same size, before it goes into the rooms.
Motion.scene({
    fps: 24, duration: 1, logical: [1920, 1080],
    uses: ['styles/engraving/engrave.js'],
    setup(env) {
        const R = Engrave.renderer(env, { scale: 2 });
        const cap = { P: [], I: [] }, NS = 40, NR = 12;
        for (let j = 0; j <= NR; j++) {
            const y = j / NR, r = 0.62 + 0.38 * Math.pow(y, 0.7), yy = y * 2 - 1;
            for (let i = 0; i <= NS; i++) { const a = (i / NS) * Math.PI * 2; cap.P.push(Math.cos(a) * r, yy, Math.sin(a) * r, Math.cos(a), -0.13, Math.sin(a)); }
        }
        for (let j = 0; j < NR; j++) for (let i = 0; i < NS; i++) { const a = j * (NS + 1) + i, b = a + NS + 1; cap.I.push(a, b, a + 1, a + 1, b, b + 1); }
        R.mesh('capital', cap);
        return { R, A: Engrave.ager(env) };
    },
    draw(g, t, env) {
        const wall = [], cols = [], caps = [], hathor = [], floor = [], ceil = [];
        const H = 6;
        Engrave.inst(wall, [0, H / 2, -2], 0, [6, H / 2, 0.1], 0.41);                     // the back wall
        Engrave.inst(wall, [4, H / 2, 0], 0, [0.1, H / 2, 6], 0.52);                      // side wall
        Engrave.inst(floor, [0, -0.1, 0], 1, [8, 0.1, 8], 0.21);
        Engrave.inst(ceil, [0, H + 0.1, 0], 1, [8, 0.1, 8], 0.31);
        const x = -1.2, z = 0.2, rC = 0.42;
        Engrave.inst(cols, [x, H * 0.39, z], 0, [rC, H * 0.39, rC], 0.2);
        Engrave.inst(caps, [x, H * 0.79, z], 0, [rC * 1.12, H * 0.02, rC * 1.12], 0.4);
        Engrave.inst(hathor, [x, H * 0.87, z], 0, [rC * 1.25, H * 0.065, rC * 1.25], 0.45);
        Engrave.inst(wall, [x, H * 0.945, z], 0, [rC * 1.3, H * 0.01, rC * 1.3], 0.5);
        const f = {
            // views by time: 0 the corner, 0.25 the capital, 0.5 the ceiling, 0.75 the floor
            ...[{ cam: [-2.4, 2.6, 5.2], target: [0.2, 2.9, -2], fov: 0.72 },
                { cam: [-0.2, 4.6, 2.6], target: [-1.2, 5.2, 0.2], fov: 0.6 },
                { cam: [0.5, 2.2, 3.5], target: [0.8, 6, -0.5], fov: 0.9 },
                { cam: [-0.5, 1.9, 4.2], target: [0.4, 0, 0.5], fov: 0.8 }][Math.min(3, Math.floor(t * 4 + 1e-6))],
            sun: [-0.6, 0.55, 0.6], sunK: 1.2, fill: 0.42, interior: true, charcoal: true,
            ink: '#2e261d', paper: '#ebe1cb', course: 0.26,
            draws: [
                { mesh: 'box', inst: new Float32Array(wall), box: true, masonry: true },
                { mesh: 'box', inst: new Float32Array(floor), box: true, masonry: true },
                { mesh: 'box', inst: new Float32Array(ceil), box: true, masonry: true },
                { mesh: 'cylinder', inst: new Float32Array(cols), tan: 'y' },
                { mesh: 'capital', inst: new Float32Array(caps), tan: 'y', hathor: true },
                { mesh: 'box', inst: new Float32Array(hathor), box: true, hathor: true },
            ],
            shadow: { center: [0, 3, -1], radius: 7 },
            sky: { zenith: 0.9, horizon: 0.9, dusk: 0 }, fog: [20, 60],
        };
        env.state.A.apply(g, env.state.R.layer('b' + Math.floor(t * 4 + 1e-6), f), { ink: f.ink, paper: f.paper, charcoal: true, grain: 0.45 });
    },
});
