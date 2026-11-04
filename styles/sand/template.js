// Sand style template: a dune and the sea in sand, a finger draws a gull, a fist pours the
// sun, then a palm sweeps the table and leaves its striations.
Motion.scene({
    fps: 24,
    duration: 4,
    logical: [1600, 900],
    uses: ['styles/sand/sand.js'],
    bpm: 60,
    shots: [[0, 4, 'Template']],

    setup(env) {
        return { table: Sand.table(env) };
    },

    draw(g, t, env) {
        const S = Sand, E = Ease;
        const d = env.state.table.begin();
        const picture = (d) => {
            // the sea: a thin layer, with finger-drawn wave lines
            S.mass(d, [[-50, 560], [400, 540], [800, 555], [1200, 535], [1650, 550], [1650, 950], [-50, 950]], { a: 0.42, soft: 6 });
            // the dune: thick sand
            S.mass(d, [[-50, 700], [300, 640], [620, 660], [900, 720], [1200, 760], [1650, 740], [1650, 950], [-50, 950]], { a: 0.95, soft: 4 });
            for (let i = 0; i < 3; i++) {
                const y = 585 + i * 30;
                const pts = [];
                for (let x = -40; x <= 1640; x += 40) pts.push([x, y + 8 * Math.sin(x * 0.012 + i * 1.7)]);
                S.finger(d, pts, { w: 4, rim: 0.35, prog: E.inOut(E.seg(t, 0.2 + i * 0.15, 1.2 + i * 0.15)) });
            }
            // the sun: poured from the fist
            S.heap(d, 1150, 300, 90, { u: E.out(E.seg(t, 0.1, 1.3)), a: 0.9, seed: 'sun' });
            S.press(d, 1150, 300, 26 * E.out(E.seg(t, 1.2, 1.6)), { rim: 0.3 });
            // a gull, one stroke of the finger through a thin layer
            S.mass(d, [[420, 220], [760, 200], [780, 400], [430, 420]], { a: 0.5, soft: 30 });
            S.finger(d, [[480, 330], [540, 290], [590, 300], [610, 320], [630, 300], [680, 285], [740, 320]], { w: 6, rim: 0.55, prog: E.inOut(E.seg(t, 0.9, 1.8)) });
        };
        const u = E.inOut(E.seg(t, 2.4, 3.6));
        if (u <= 0) picture(d);
        else S.sweep(d, env, u, { dir: Math.PI, old: picture, new: () => {}, front: (s) => 60 * Math.sin(s * Math.PI * 1.5), seed: 'tpl' });
    },

    post(ctx, t, env) {
        env.state.table.show(ctx, { light: Sand.LIGHT.morning });
    },
});
