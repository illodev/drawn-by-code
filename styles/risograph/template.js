// Risograph style template: a sun and hills printed in four riso inks (flat and halftone
// plates, overprints, misregistration, uneven inking), a ring drawn on by hand on twos.
Motion.scene({
    fps: 24,
    duration: 3,
    logical: [1000, 1000],
    uses: ['styles/risograph/riso.js'],
    shots: [[0, 3, 'Template']],
    setup(env) {
        return { press: Riso.press(env) };
    },
    draw(g, t, env) {
        const { press } = env.state, R = Riso, T = R.tone, d = Math.floor(t * 12 + 1e-6);
        press.begin(d);
        const pinkS = press.plate('pink', 'screen'), yellow = press.plate('yellow'), blueS = press.plate('blue', 'screen'), navy = press.plate('navy');
        pinkS.fillStyle = R.ramp(pinkS, 0, 0, 0, 700, 0.1, 0.6);
        pinkS.fillRect(0, 0, 1000, 700);
        const sy = 520 - d * 6;
        yellow.fillStyle = T(1);
        yellow.beginPath(); yellow.arc(500, sy, 150, 0, 7); yellow.fill();
        blueS.fillStyle = R.ramp(blueS, 0, 600, 0, 1000, 0.4, 0.9);
        blueS.beginPath(); blueS.moveTo(0, 700); blueS.quadraticCurveTo(300, 560, 600, 690); blueS.quadraticCurveTo(800, 760, 1000, 650); blueS.lineTo(1000, 1000); blueS.lineTo(0, 1000); blueS.fill();
        navy.fillStyle = T(0.9);
        navy.beginPath(); navy.moveTo(0, 840); navy.quadraticCurveTo(500, 730, 1000, 860); navy.lineTo(1000, 1000); navy.lineTo(0, 1000); navy.fill();
        R.ring(navy, 500, 500, 380, 7, 'tplring', { p: Math.min(1, d / 24) });
        press.print(g, { key: d });
    },
});
