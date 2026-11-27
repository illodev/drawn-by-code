// Specimen sheet: every painted thing alone, big, to judge the paint at full size.
const SPEC = 'sandbox/2026-11-19-souvenir-test/';
Motion.scene({
    fps: 24, duration: 1, logical: [1600, 900],
    uses: ['styles/souvenir/souvenir.js', SPEC + 'things/citrus.js', SPEC + 'things/fan.js'],
    draw(g, t, env) {
        const S = Souvenir;
        g.fillStyle = '#232749';
        g.fillRect(0, 0, 1600, 900);
        Fan.draw(g, { x: 1450, y: 800, r: 780, a0: Math.PI * 1.02, a1: Math.PI * 1.52, n: 14 });
        S.tooth(g, { x: 0, y: 0, w: 1600, h: 900 });
    },
    post(ctx, t, env) {
        Souvenir.finish(ctx, env, 0);
    },
});
