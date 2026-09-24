// 2026-09-24-pixel-building · style paper-cutout
Motion.scene({
    fps: 24,
    duration: 5,
    logical: [1000, 1000],
    uses: ['styles/paper-cutout/paper.js', 'styles/paper-cutout/kit.js'],
    fonts: [{ family: 'Hand', src: 'fonts/PatrickHand-Regular.ttf' }],
    bpm: 120,
    shots: [[0, 4, 'Template']],

    setup(env) {
        return { kit: PaperKit.make(env, { font: 'Hand' }) };
    },

    draw(g, t, env) {
        const { kit } = env.state, P = Paper, E = Ease, C = kit.COL;
        kit.paperBg(g, 'pared', C.wall);
        kit.glow(g, 800, 380, 260);

        // the piece drops with a bounce on the first beat and breathes afterwards
        const drop = E.back(E.seg(t, 0.2, 0.8));
        const breathe = 1 + Math.sin(t * 2.6) * 0.012;
        g.save();
        g.translate(800, E.lerp(-300, 380, drop));
        g.scale(breathe, 1 / breathe);
        kit.sprite('estrella', { x: -200, y: -200, w: 400, h: 400 }, (c) => {
            P.cutout(c, P.circleUnion([[0, -60, 110], [-90, 20, 90], [90, 20, 90], [0, 60, 120]]), C.orange, 'nube', { border: 3.2 });
        }).draw(g);
        g.restore();

        kit.title(g, t, 1.5, 'An idea, on paper.', 800, 760, 72, C.cream, C.orange, { align: 'center', dur: 0.8 });
    },

    post(ctx, t, env) {
        env.state.kit.grainPost(ctx);
    },
});
