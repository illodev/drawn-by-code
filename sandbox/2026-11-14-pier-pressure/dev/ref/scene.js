// pier-pressure · dev: Kit's six key poses for the drop (cast/kit-drop-drawn.js), on one ground
// line at the scale the shot uses, to calibrate the two sheets against each other and to check
// each pose's anchor (KitDrop in cast/kit-act.js).
const DIR = 'sandbox/2026-11-14-pier-pressure/cast/';
Motion.scene({
    fps: 24, duration: 1, logical: [1600, 900],
    uses: ['styles/skate-toon/toon.js', DIR + 'drawn.js', DIR + 'kit-drawn.js', DIR + 'kit-details.js', DIR + 'kit-drop-drawn.js', DIR + 'kit-act.js'],
    shots: [[0, 1, 'Kit, key poses']],
    draw(g, t, env) {
        g.fillStyle = SkateToon.COL.sky;
        g.fillRect(0, 0, env.W, env.H);
        g.fillStyle = SkateToon.COL.concrete;
        g.fillRect(0, 820, 1600, 80);
        ['tuck', 'reach', 'contact', 'crouch', 'rise', 'proud'].forEach((p, i) => KitAct.pose(g, p, 140 + i * 264, 820 - (i < 2 ? 60 : 0), 0.78));
    },
});
