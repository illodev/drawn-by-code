// Montage object «math» (see ../things.js for the contract).
(() => {
    const P = Paper, E = Ease, C = WL.COL;
    const { place, cut, circleU } = Things.kit;
    Things.math = (g, x, y, s, t) => {
        place(g, 'th-grid', { x: -200, y: -140, w: 400, h: 280 }, (c) => {
            cut(c, [[-180, -120], [180, -110], [175, 120], [-185, 115]], '#dbeee0', 'grid', {
                inner: (cc) => {
                    cc.strokeStyle = '#9cc6a9';
                    cc.lineWidth = 1.2;
                    for (let i = -180; i < 180; i += 20) (cc.beginPath(), cc.moveTo(i, -120), cc.lineTo(i, 120), cc.stroke(), cc.beginPath(), cc.moveTo(-180, i * 0.66), cc.lineTo(180, i * 0.66), cc.stroke());
                },
            });
        }, x + 40 * s, y, s);
        const N = [['1', '#5aa34f', -120, -150], ['2', '#f0cc51', -40, -180], ['8', '#3862b1', 180, -120], ['3', '#d9473b', 170, 150]];
        for (const [n, col, dx, dy] of N) WL.write(g, n, x + dx * s, y + dy * s, 90 * s, col, { align: 'center' });
        P.markerStroke(g, Array.from({ length: 30 }, (_, i) => [x + (-40 + Math.cos(i * 0.4) * i * 2.2) * s, y + (20 + Math.sin(i * 0.4) * i * 2.2) * s]), '#d9473b', 5 * s, 'spiralmath', 0.9);
    };
})();
