// Montage object «rain» (see ../things.js for the contract).
(() => {
    const P = Paper, E = Ease, C = WL.COL;
    const { place, cut, circleU } = Things.kit;
    Things.rain = (g, x, y, s, t) => {
        place(g, 'th-cloud', { x: -200, y: -110, w: 400, h: 200 }, (c) => {
            cut(c, circleU([[-100, 10, 60], [-20, -30, 80], [80, 0, 65], [140, 30, 40], [-150, 40, 40]]), '#dcdad5', 'cloud', { inner: (cc) => WL.scribbleFill(cc, { x: -200, y: -110, w: 400, h: 180 }, '#8d8a84', 'cloudt', { lineH: 14, width: 1, scale: 0.7 }) });
        }, x, y - 250 * s, s);
        for (let i = 0; i < 10; i++) {
            const dx = -150 + (i % 5) * 75 + (i > 4 ? 35 : 0), fall = ((t * 1.8 + i * 0.37) % 1);
            place(g, 'th-drop', { x: -12, y: -18, w: 24, h: 36 }, (c) => cut(c, [[0, -14], [9, 4], [0, 12], [-9, 4]], '#6aa7d8', 'drop', { border: 1.2, shadow: 0 }), x + dx * s, y + (-170 + fall * 260) * s, s);
        }
        place(g, 'th-umbrella', { x: -150, y: -100, w: 300, h: 230 }, (c) => {
            cut(c, [...P.ellipse(0, 0, 130, 80, 30, Math.PI, Math.PI * 2), [130, 0], [90, -10], [45, 5], [0, -10], [-45, 5], [-90, -10]], '#5aa34f', 'umbrella');
            cut(c, [[-4, -5], [4, -5], [4, 110], [-4, 110]], '#8a5a3a', 'handle', { border: 1 });
        }, x, y - 30 * s, s);
    };
})();
