// Montage object «flowers» (see ../things.js for the contract).
(() => {
    const P = Paper, E = Ease, C = WL.COL;
    const { place, cut, circleU } = Things.kit;
    Things.flowers = (g, x, y, s, t) => {
        place(g, 'th-bouquet', { x: -180, y: -230, w: 360, h: 460 }, (c) => {
            const r = P.rng('bouquet');
            for (let i = 0; i < 6; i++) cut(c, circleU([[0, -12, 12], [11, 4, 12], [-11, 4, 12]], -110 + i * 44, -150 + r() * 60), ['#f0cc51', '#d9473b', '#fbf6ec', '#b58ad6'][i % 4], 'fl' + i, { border: 1.4 });
            cut(c, [[-150, -60], [150, -60], [30, 210], [-30, 210]], '#e6e2d8', 'cone', { inner: (cc) => WL.scribbleFill(cc, { x: -150, y: -60, w: 300, h: 270 }, '#8d8578', 'conet', { lineH: 14, width: 1, scale: 0.7 }) });
            cut(c, P.ellipse(0, 40, 26, 14), '#d9473b', 'bow', { border: 1.4 });
        }, x, y, s);
    };
})();
