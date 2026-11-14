// pier-pressure · dev: the set alone (Gull Harbor), with two grey ovals where the cast would
// stand, to judge the calm zone and the depth of the foreground props.
Motion.scene({
    fps: 24, duration: 2, logical: [1600, 900],
    uses: ['styles/skate-toon/toon.js', 'sandbox/2026-11-14-pier-pressure/set.js'],
    fonts: [{ family: 'Bangers', src: 'fonts/Bangers-Regular.ttf' }],
    shots: [[0, 2, 'Gull Harbor']],
    draw(g, t, env) {
        Harbor.back(g, env, t);
        // stand-ins for the cast: one on the ground, one in the air
        g.fillStyle = 'rgba(120, 120, 128, 0.55)';
        for (const [x, y, rx, ry] of [[560, 590, 110, 185], [1010, 420, 120, 200]]) {
            g.beginPath();
            g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
            g.fill();
        }
        Harbor.fore(g, env, t);
    },
});
