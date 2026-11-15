// pier-pressure · dev: Kit's parts. Left: her standing drawing as it is; middle: crouched (the
// upper body down over the legs, bunches and arm lagging); right: her jump drawing, bunches up.
const DIR = 'sandbox/2026-11-14-pier-pressure/cast/';
Motion.scene({
    fps: 24, duration: 1, logical: [1600, 900],
    uses: ['styles/skate-toon/toon.js', DIR + 'drawn.js', DIR + 'kit-drawn.js', DIR + 'kit-details.js', DIR + 'kit-act.js'],
    shots: [[0, 1, 'Kit, in parts']],
    draw(g, t, env) {
        g.fillStyle = SkateToon.COL.sky;
        g.fillRect(0, 0, env.W, env.H);
        KitAct.stand(g, 290, 860, 1.1, {});
        KitAct.stand(g, 800, 860, 1.1, { crouch: 34, droop: 0.45, arm: -0.5, nod: 0.06 });
        KitAct.air(g, 1290, 860, 1.0, { lift: 0.4, tilt: -0.1 });
        KitAct.board(g, 560, 300, 1.4, -0.2);
        KitAct.stand(g, 1000, 420, 0.8, { hide: ['board', 'wheels'], arm: -0.95, droop: -0.5 });
    },
});
