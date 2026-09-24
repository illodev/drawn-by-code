// Montage object «tree» (see ../things.js for the contract).
(() => {
    const P = Paper, E = Ease, C = WL.COL;
    const { place, cut, circleU } = Things.kit;
    Things.tree = (g, x, y, s, t) => {
        place(g, 'th-tree', { x: -170, y: -260, w: 340, h: 420 }, (c) => {
            cut(c, [[-18, 150], [18, 150], [14, 0], [-14, 0]], '#8a5a3a', 'trunk');
            cut(c, circleU([[0, -120, 90], [-80, -60, 70], [80, -60, 70], [-40, -10, 70], [50, -10, 70]]), '#4f9a4a', 'crown');
            const r = P.rng('apples');
            for (let i = 0; i < 9; i++) cut(c, P.ellipse(-100 + r() * 200, -150 + r() * 170, 11, 11), '#d9473b', 'apple' + i, { border: 1.4, shadow: 0 });
        }, x, y, s, Math.sin(t * 4) * 0.02);
    };
})();
