// Montage object «cat» (see ../things.js for the contract).
(() => {
    const P = Paper, E = Ease, C = WL.COL;
    const { place, cut, circleU } = Things.kit;
    Things.cat = (g, x, y, s, t) => {
        const br = 1 + Math.sin(t * 3) * 0.02;
        place(g, 'th-cat', { x: -230, y: -170, w: 460, h: 320 }, (c) => {
            cut(c, P.ellipse(40, 30, 190, 115), '#e39b54', 'catbody');
            cut(c, P.noodle(P.bezier([200, 60], [230, 140], [60, 160], [-60, 130], 16), 30, 20), '#e39b54', 'cattail', { border: 2 });
            cut(c, [...P.ellipse(-120, 20, 85, 75), [-190, -40], [-175, -110], [-140, -60], [-100, -60], [-70, -110], [-60, -40]], '#e39b54', 'cathead');
            cut(c, P.ellipse(-120, 50, 45, 26), '#fbf6ec', 'catmuzzle', { border: 0, shadow: 0 });
        }, x, y, s * br);
        g.save();
        g.strokeStyle = '#231a1f';
        g.lineWidth = 4 * s;
        for (const dx of [-150, -90]) (g.beginPath(), g.arc(x + dx * s, y + 18 * s, 12 * s, Math.PI * 0.1, Math.PI * 0.9), g.stroke());
        g.restore();
    };
})();
