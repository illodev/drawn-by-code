// pier-pressure · dev: Hoagie drawn by hand in code (cast/hoagie-model.js) beside the drawing of his
// sheet it was measured on, and in the poses of his bar.
const DIR = 'sandbox/2026-11-14-pier-pressure/cast/';
Motion.scene({
    fps: 24, duration: 1, logical: [1600, 900],
    uses: ['styles/skate-toon/toon.js', DIR + 'drawn.js', DIR + 'hoagie-thumb-drawn.js', DIR + 'hoagie-model.js'],
    shots: [[0, 1, 'model']],
    draw(g, t, env) {
        g.fillStyle = '#f07b3a';
        g.fillRect(0, 0, 1600, 900);
        const s = 0.92, Y = 470;
        Drawn.draw(g, 'hoagie', 'a3', 30, Y - 454 * s, s);
        const REST = { arm: { elbow: [246, 186], fist: [276, 160], thumb: -0.05 }, cam: { at: [84, 216] } };
        HoagieModel.draw(g, 480, Y, s, REST);
        HoagieModel.draw(g, 800, Y, s, { crouch: 16, lids: 0.45, squint: true, look: [5, 3], mouth: 0, cam: { at: [86, 220] }, arm: { elbow: [252, 240], fist: [238, 292], thumb: null } });
        HoagieModel.draw(g, 1120, Y, s, { toes: 1, stretch: 1.05, lean: 0.03, mouth: 1, brows: 6, cow: -0.4, cam: { at: [82, 212] }, arm: { elbow: [258, 150], fist: [286, 92], thumb: 0, k: 1.3 } });
        HoagieModel.draw(g, 1420, Y, s, { ...REST, lids: 1 });
        const Y2 = 900;
        HoagieModel.draw(g, 160, Y2, s, { cam: { at: [108, 96], front: true }, mouth: 0.1 });
        HoagieModel.draw(g, 480, Y2, s, { cam: { at: [116, 150], front: true }, mouth: 'o', brows: 7 });
        HoagieModel.draw(g, 800, Y2, s, { cam: { at: [110, 204], front: true }, mouth: 'o', brows: 5 });
        HoagieModel.draw(g, 1120, Y2, s, { ...REST, halo: '#fffdf6', tilt: 0.05 });
    },
});
