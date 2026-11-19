// A check of the kit's sprite helpers: a lit volume brought back to the emblem manner
// (sprayIn + stamp), a relief from painted heights (reliefField), a turned and mirrored
// frame (frame), a thing with a hole on its own sheet (sheet).
Motion.scene({
    fps: 24, duration: 1, logical: [1600, 900],
    uses: ['styles/souvenir/souvenir.js'],
    draw(g, t, env) {
        const S = Souvenir, res = env.k * 2;
        g.fillStyle = '#232749';
        g.fillRect(0, 0, 1600, 900);
        // 1 · a volume in the emblem manner
        const ball = S.form({ box: { x: -110, y: -110, w: 220, h: 220 }, res, mask: (q) => { q.beginPath(); q.arc(0, 0, 90, 0, 6.3); q.fill(); }, ramp: [[0, '#5e1626'], [0.5, '#b8352f'], [1, '#f0a070']], soft: 1 });
        S.sprayIn(ball, res, { color: '#3a0a1c', alpha: 0.7, w: 22 });
        S.sprayIn(ball, res, { color: '#ffd9b0', alpha: 0.5, w: 10, dir: [-S.SHADE_DIR[0], -S.SHADE_DIR[1]] });
        g.save();
        g.translate(260, 300);
        S.stamp(g, ball, { lw: 3 });
        g.restore();
        // 2 · a relief: a disc with a star and a beaded rim, lit by the house light
        const box = { x: -110, y: -110, w: 220, h: 220 };
        const hf = S.reliefField(box, res, (q) => {
            q.strokeStyle = '#999';
            q.lineWidth = 8;
            q.beginPath();
            q.arc(0, 0, 84, 0, 6.3);
            q.stroke();
            q.fillStyle = '#fff';
            for (let i = 0; i < 28; i++) { q.beginPath(); q.arc(Math.cos(i * 0.2244) * 70, Math.sin(i * 0.2244) * 70, 3.4, 0, 6.3); q.fill(); }
            q.beginPath();
            for (let i = 0; i < 16; i++) q.lineTo(Math.cos(i * 0.3927) * (i % 2 ? 26 : 56), Math.sin(i * 0.3927) * (i % 2 ? 26 : 56));
            q.fill();
        }, 0.8);
        const coin = S.form({ box, res, inflate: 'none', mask: (q) => { q.beginPath(); q.arc(0, 0, 92, 0, 6.3); q.fill(); }, height: (x, y) => hf(x, y) * 5, ramp: [[0, '#5a3a16'], [0.45, '#b98a2c'], [0.7, '#e6c15a'], [1, '#fff3c0']], soft: 1 });
        S.sprayIn(coin, res, { color: '#3a2440', alpha: 0.5, w: 12 });
        g.save();
        g.translate(620, 300);
        S.stamp(g, coin, { lw: 2.6 });
        g.restore();
        // 3 · a turned, mirrored frame: the same arrow four ways, each piece lit from the top left
        const arrow = [[-70, -16], [20, -16], [20, -40], [80, 0], [20, 40], [20, 16], [-70, 16]];
        [[0, false], [0.9, false], [0, true], [2.2, true]].forEach(([rot, flip], i) => {
            const f = S.frame(960 + (i % 2) * 260, 220 + Math.floor(i / 2) * 200, rot, 1, flip);
            S.piece(g, f.pts(arrow), { fill: '#46a676', shade: { color: '#0b3a2f', alpha: 0.8, w: 20 }, light: { color: '#d8f5c8', alpha: 0.6, w: 8 }, line: 2.6 });
        });
        // 4 · a pierced plate on its own sheet: the hole and the cast stay its own
        const plate = S.sheet({ x: -130, y: -90, w: 260, h: 180 }, res, (q) => {
            S.piece(q, [[-110, -70], [110, -70], [110, 70], [-110, 70]], { fill: '#d9a441', shade: { color: '#7a4d14', alpha: 0.8, w: 30 }, line: 0 });
            q.globalCompositeOperation = 'destination-out';
            q.fillStyle = '#000';
            q.beginPath();
            for (let i = 0; i < 16; i++) q.lineTo(Math.cos(i * 0.3927) * (i % 2 ? 22 : 48), Math.sin(i * 0.3927) * (i % 2 ? 22 : 48));
            q.fill();
        });
        g.save();
        g.translate(440, 660);
        S.stamp(g, plate, { lw: 2.6 });
        g.restore();
    },
});
