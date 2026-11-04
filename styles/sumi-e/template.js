// Sumi-e style template: a branch painted stroke by stroke under a red sun, mist drifting.
Motion.scene({
    fps: 24,
    duration: 4,
    logical: [1600, 900],
    uses: ['styles/sumi-e/sumi.js'],
    bpm: 60,
    shots: [[0, 4, 'Template']],

    draw(g, t, env) {
        const S = Sumi, E = Ease;
        S.paper(g, env, { x: -100, y: -100, w: env.W + 200, h: env.H + 200 });
        S.sun(g, env, 1050, 300, 150, { alpha: E.out(E.seg(t, 0, 1.2)) });
        g.save();
        g.translate(-t * 6, 0);
        S.mountains(g, env, 'far', { x0: 500, x1: 1700, y: 720, h: 330, ink: 0.28, peaks: 3 });
        g.restore();
        S.mountains(g, env, 'near', { x0: -100, x1: 900, y: 860, h: 260, ink: 0.55, peaks: 2.5 });
        // the branch paints itself: trunk, then twigs
        const br = [[1700, 120], [1480, 200], [1330, 180], [1180, 250], [1020, 240]];
        S.stroke(g, br, { w: 26, dry: 0.5, seed: 'br', prog: E.inOut(E.seg(t, 0.4, 1.8)) });
        S.stroke(g, [[1330, 185], [1260, 120], [1200, 100]], { w: 10, dry: 0.6, seed: 'tw1', prog: E.out(E.seg(t, 1.6, 2.3)) });
        S.stroke(g, [[1180, 250], [1120, 320], [1060, 340]], { w: 9, dry: 0.6, seed: 'tw2', prog: E.out(E.seg(t, 1.9, 2.6)) });
        // blossoms: vermilion dabs with an ink dot
        [[1200, 100], [1250, 135], [1060, 340], [1110, 315], [1020, 245], [1400, 210]].forEach(([x, y], i) => {
            const u = E.back(E.seg(t, 2.4 + i * 0.12, 2.8 + i * 0.12));
            if (u <= 0) return;
            for (let p = 0; p < 5; p++) {
                const a = (p / 5) * Math.PI * 2 + i;
                S.dab(g, x + Math.cos(a) * 9 * u, y + Math.sin(a) * 9 * u, 8 * u, 6 * u, { rot: a, color: S.RED, ink: 0.85, seed: 'p' + i + p });
            }
            S.dab(g, x, y, 2.5 * u, 2.5 * u, { seed: 'c' + i });
        });
    },

    post(ctx, t, env) {
        Sumi.tooth(ctx, env);
    },
});
