// Montage object «music» (see ../things.js for the contract).
(() => {
    const P = Paper, E = Ease, C = WL.COL;
    const { place, cut, circleU } = Things.kit;
    Things.music = (g, x, y, s, t) => {
        const w = Math.sin(t * 10) * 0.08;
        place(g, 'th-note1', { x: -80, y: -170, w: 170, h: 250 }, (c) => {
            cut(c, P.ellipse(-20, 40, 42, 32), '#d9473b', 'n1head');
            cut(c, [[14, 30], [26, 30], [26, -150], [14, -150]], '#d9473b', 'n1stem', { border: 1.6 });
            cut(c, P.noodle(P.bezier([20, -150], [70, -120], [80, -60], [50, -20], 12), 18, 10), '#d9473b', 'n1flag', { border: 1.6 });
        }, x - 120 * s, y, s, w);
        place(g, 'th-note2', { x: -130, y: -170, w: 270, h: 250 }, (c) => {
            cut(c, P.ellipse(-80, 50, 40, 30), '#3862b1', 'n2a');
            cut(c, P.ellipse(70, 30, 40, 30), '#3862b1', 'n2b');
            cut(c, [[-50, 40], [-38, 40], [-38, -120], [-50, -120]], '#3862b1', 'n2s1', { border: 1.6 });
            cut(c, [[100, 20], [112, 20], [112, -140], [100, -140]], '#3862b1', 'n2s2', { border: 1.6 });
            cut(c, [[-50, -125], [112, -150], [112, -115], [-50, -90]], '#3862b1', 'n2beam', { border: 1.6 });
        }, x + 110 * s, y + 20 * s, s, -w);
    };
})();
