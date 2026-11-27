// pier-pressure · hand check: every hand of the style's chart at full size, as a right hand,
// a left hand and from the back, on a forearm. References (the user's frames of the genre,
// not committed): open = the raised and outstretched hands of the group shots; thumb = the
// thumbs-up of the street shot; fist = the fists on hips of the family shot.
//
// Handedness: the chart is a RIGHT hand seen from the palm, fingers up, so the thumb is on the
// screen's right (fingers F = up, palm N = towards the camera, thumb at F × N). A left hand is
// its mirror; the back of a hand is the mirror again, with knuckle ticks instead of creases.
Motion.scene({
    fps: 24, duration: 1, logical: [1600, 900],
    uses: ['styles/skate-toon/toon.js'],
    fonts: [{ family: 'Bangers', src: 'fonts/Bangers-Regular.ttf' }],
    shots: [[0, 1, 'Hands']],
    draw(g, t, env) {
        const T = SkateToon, C = T.COL;
        g.fillStyle = '#fff6d8';
        g.fillRect(0, 0, env.W, env.H);
        const SKINS = ['#cf8440', C.skinPale, C.skin, '#e58a45'];
        const poses = [['open', 'raised, waving, hanging'], ['fist', 'on a hip, pumped'], ['thumb', 'thumbs-up'], ['point', 'the index out']];
        const cols = [['R', false, 'right, palm'], ['L', false, 'left, palm'], ['R', true, 'right, back'], ['L', true, 'left, back']];
        g.font = '26px "Bangers"';
        g.fillStyle = C.ink;
        g.textAlign = 'center';
        cols.forEach(([, , name], j) => g.fillText(name.toUpperCase(), 420 + j * 300, 36));
        poses.forEach(([pose, note], i) => {
            const size = 112, y = 178 + i * 214;
            g.textAlign = 'left';
            g.font = '22px "Bangers"';
            g.fillStyle = C.ink;
            g.save();
            g.translate(40, y - 30);
            g.rotate(-Math.PI / 2);
            g.textAlign = 'center';
            g.fillText(pose.toUpperCase(), 0, 0);
            g.restore();
            cols.forEach(([side, back], j) => {
                // 'open' has a back; the fists are the same drawing from both sides of the chart
                g.save();
                g.translate(420 + j * 300, y);
                g.rotate((j % 2 ? -1 : 1) * 0.12);
                const d = size * 0.3;
                const arm = T.ribbon([[0, 62], [0, 0]], d * 1.06, d * 0.96);
                T.hand(g, pose, size, { side, back, fill: SKINS[i], w: T.LINE * 1.25, seed: 'hc' + pose + j, arm: { poly: arm } });
                g.restore();
            });
            g.font = '20px "Bangers"';
            g.textAlign = 'left';
            g.fillStyle = '#7d6a3a';
            g.fillText(note, 70, y - 20);
        });
    },
});
