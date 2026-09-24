// Montage object «sea» (see ../things.js for the contract).
(() => {
    const P = Paper, E = Ease, C = WL.COL;
    const { place, cut, circleU } = Things.kit;
    Things.sea = (g, x, y, s, t) => {
        place(g, 'th-boat', { x: -150, y: -210, w: 300, h: 260 }, (c) => {
            cut(c, [[-130, -20], [130, -20], [90, 40], [-90, 40]], '#e6e2d8', 'hull', { inner: (cc) => WL.scribbleFill(cc, { x: -130, y: -25, w: 260, h: 70 }, '#8d8578', 'hullt', { lineH: 12, width: 1, scale: 0.7 }) });
            cut(c, [[0, -190], [0, -30], [-110, -30]], '#ece8de', 'sail', { inner: (cc) => WL.scribbleFill(cc, { x: -110, y: -190, w: 110, h: 160 }, '#8d8578', 'sailt', { lineH: 12, width: 1, scale: 0.7 }) });
            cut(c, [[4, -200], [50, -185], [4, -170]], '#d9473b', 'flag', { border: 1.4 });
        }, x, y - 20 * s + Math.sin(t * 6) * 6 * s, s, Math.sin(t * 5) * 0.05);
        place(g, 'th-waves', { x: -270, y: -60, w: 540, h: 170 }, (c) => {
            const top = [];
            for (let i = 0; i <= 12; i++) top.push([-250 + i * 42, -20 + (i % 2 ? -26 : 8)]);
            cut(c, [...top, [250, 90], [-250, 90]], '#2f64a8', 'waves', { paper: '#dff0fb' });
            cut(c, [[-200, 30], [-120, 10], [-60, 35]], '#7fb6e0', 'foam1', { border: 0, shadow: 0 });
        }, x, y + 40 * s, s);
    };
})();
