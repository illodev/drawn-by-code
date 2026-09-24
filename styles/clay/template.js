// Clay style template: a plasticine set (wall and table), a ball that drops, squashes and
// settles on twos with a surface that boils, and a title in clay letters.
Motion.scene({
    fps: 24,
    duration: 4,
    logical: [1600, 900],
    uses: ['styles/clay/clay.js'],
    fonts: [{ family: 'Shrikhand', src: 'fonts/Shrikhand-latin.woff2' }],
    bpm: 120,
    shots: [[0, 4, 'Template']],

    draw(g, t, env) {
        const C = Clay, E = Ease, tq = Math.floor(t * 12 + 1e-6) / 12, v = C.boil(t);
        g.fillStyle = '#cfe0d6';
        g.fillRect(0, 0, 1600, 900);
        C.draw(g, 'tpl-wall', C.lumpy(C.roundRect(-40, -40, 1680, 700, 30), 'wall', 3, 4), '#cfe0d6', { bevel: 14, shine: 0.2, shadow: false, prints: 6, marks: 30 });
        C.draw(g, 'tpl-table', C.lumpy(C.roundRect(-40, 600, 1680, 340, 40), 'table', 4, 4), '#d9a36c', { bevel: 16, shine: 0.3, shadowOffset: [0, -6], prints: 5, marks: 40 });
        // the ball: falls (0–0.75), squashes on the beat (0.75), bounces, settles
        const y = Motion.keys([[0, -120], [0.75, 560], [1.1, 420], [1.5, 560], [1.75, 520], [2.0, 560]], tq);
        const squash = tq >= 0.75 && tq < 0.84 ? [1.3, 0.72] : tq >= 1.5 && tq < 1.59 ? [1.15, 0.86] : tq >= 2 && tq < 2.09 ? [1.08, 0.93] : [1, 1];
        C.shadow(g, 800, 650, 110 * (0.5 + y / 1120), 22, 0.4);
        g.save();
        g.translate(800, y + 70 * (1 - squash[1]));
        g.scale(squash[0], squash[1]);
        C.draw(g, 'tpl-ball', C.lumpy(C.ellipse(0, 0, 80, 80, 12), 'ball' + v, 2.2), '#d2563f', { variant: v, bevel: 12, shine: 0.8 });
        g.restore();
        if (t > 2.2) C.text(g, 'tpl', 'clay', 800, 420, 150, '#1f3a8a', { font: 'Shrikhand', align: 'center', variant: v });
    },
});
