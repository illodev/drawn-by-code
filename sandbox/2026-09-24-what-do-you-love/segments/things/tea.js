// Montage object «tea» (see ../things.js for the contract).
(() => {
    const P = Paper, E = Ease, C = WL.COL;
    const { place, cut, circleU } = Things.kit;
    Things.tea = (g, x, y, s, t) => {
        place(g, 'th-cup', { x: -220, y: -130, w: 440, h: 260 }, (c) => {
            cut(c, P.ellipse(0, 90, 200, 30), '#8fcfb3', 'saucer');
            cut(c, [...P.ellipse(0, -40, 150, 30, 30, Math.PI, Math.PI * 2), [150, -40], [120, 60], [60, 90], [-60, 90], [-120, 60], [-150, -40]], '#fbf6ec', 'cup', {
                inner: (cc) => {
                    for (let i = -140; i < 140; i += 40) cut(cc, P.ellipse(i, 20, 10, 10), '#d9473b', 'dot' + i, { border: 0, shadow: 0 });
                },
            });
            cut(c, P.noodle(P.bezier([140, -20], [220, -30], [220, 60], [120, 50], 16), 22, 22), '#fbf6ec', 'cuphandle', { border: 2 });
        }, x, y, s);
    };
})();
