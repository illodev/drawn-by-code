// Oil style template: a field under a tree, blocked in with a wide brush; wherever the eye
// rests the same picture is finished with small brushes, and it loosens again behind it.
Motion.scene({
    fps: 24,
    duration: 4,
    logical: [1600, 900],
    uses: ['styles/oil/oil.js'],
    shots: [[0, 4, 'Template']],
    setup(env) {
        const box = { x: -40, y: -30, w: 1680, h: 960 };
        const st = Oil.study(box);
        st.paint({ dir: 0.05 }, (g) => {
            const sky = g.createLinearGradient(0, -30, 0, 520);
            sky.addColorStop(0, '#7fa3c9'); sky.addColorStop(0.7, '#c9d6d8'); sky.addColorStop(1, '#ecdcb8');
            g.fillStyle = sky;
            g.fillRect(-40, -30, 1680, 560);
        });
        st.paint({ dab: 0.6 }, (g) => {
            g.fillStyle = '#f3ead6';
            [[300, 170, 190, 50], [420, 210, 150, 40], [1180, 120, 230, 56], [1330, 160, 150, 40]].forEach(([x, y, a, b]) => { g.beginPath(); g.ellipse(x, y, a, b, 0, 0, 7); g.fill(); });
        });
        st.paint({ dir: -0.12 }, (g) => {
            g.fillStyle = '#7b93ad';
            g.beginPath(); g.moveTo(-40, 520); g.quadraticCurveTo(400, 400, 820, 500); g.quadraticCurveTo(1250, 430, 1640, 510); g.lineTo(1640, 560); g.lineTo(-40, 560); g.fill();
        });
        st.paint({ dir: 0.02 }, (g) => {
            const f = g.createLinearGradient(0, 520, 0, 930);
            f.addColorStop(0, '#c9c06a'); f.addColorStop(0.5, '#93a548'); f.addColorStop(1, '#4f6f33');
            g.fillStyle = f;
            g.fillRect(-40, 520, 1680, 410);
        });
        // poppies and their leaves, in dabs
        const rn = Motion.rng('poppies');
        st.paint({ dab: 1 }, (g) => {
            for (let i = 0; i < 150; i++) {
                const y = 580 + rn() * rn() * 330, x = -20 + rn() * 1640, s = (y - 500) / 420;
                g.fillStyle = rn() < 0.75 ? (rn() < 0.5 ? '#d8402a' : '#e8623a') : '#f1e3b0';
                g.beginPath(); g.ellipse(x, y, 5 + 16 * s, 3 + 10 * s, rn() * 3, 0, 7); g.fill();
            }
        });
        // the tree: shadow side, light side, sky holes
        st.paint({ dab: 1 }, (g) => {
            g.fillStyle = '#2f4d33';
            [[1040, 300, 190, 150], [1180, 250, 170, 140], [940, 370, 120, 90], [1250, 360, 130, 100]].forEach(([x, y, a, b]) => { g.beginPath(); g.ellipse(x, y, a, b, 0, 0, 7); g.fill(); });
            g.fillStyle = '#6f9440';
            [[990, 240, 110, 70], [1130, 190, 110, 60], [900, 340, 70, 45], [1220, 300, 80, 45]].forEach(([x, y, a, b]) => { g.beginPath(); g.ellipse(x, y, a, b, -0.2, 0, 7); g.fill(); });
            g.fillStyle = '#b7c765';
            [[960, 215, 55, 26], [1100, 165, 60, 24], [885, 322, 36, 18]].forEach(([x, y, a, b]) => { g.beginPath(); g.ellipse(x, y, a, b, -0.2, 0, 7); g.fill(); });
        });
        st.paint({ dir: 0.03 }, (g) => {
            g.fillStyle = '#3f5a35';
            g.beginPath(); g.ellipse(1190, 640, 300, 34, 0, 0, 7); g.fill();
        });
        st.line([[1090, 640], [1086, 540], [1092, 462]], '#3a2c26', 26, { level: 2, taper: 0.25 });
        const loose = Oil.lay(st, Oil.LOOSE, { seed: 'tpl-loose' });
        const fine = Oil.lay(st, Oil.FINE, { seed: 'tpl-fine' });
        const pic = Oil.painting(env, box);
        pic.base(loose);
        return { pic, fine };
    },
    draw(g, t, env) {
        const { pic, fine } = env.state, d = Math.floor(t * 12 + 1e-6);
        // the eye crosses the field and comes to rest on the tree
        const gaze = (q) => {
            const s = q / 12;
            const p = Motion.keys([[0.2, [330, 600]], [1.7, [760, 470]], [2.9, [1090, 400]]], s);
            return { x: p[0] + Motion.noise1('gx', q * 0.5) * 8, y: p[1] + Motion.noise1('gy', q * 0.5) * 6, r: 250 * Ease.out(Ease.seg(s, 0, 0.7)) + 1 };
        };
        pic.frame(d, (sf) => sf.stamp(fine, Oil.focus(fine, d, gaze)));
        pic.draw(g);
    },
});
