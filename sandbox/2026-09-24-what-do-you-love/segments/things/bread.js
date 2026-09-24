// Montage object «bread» (see ../things.js for the contract).
(() => {
    const P = Paper, E = Ease, C = WL.COL;
    const { place, cut, circleU } = Things.kit;
    Things.bread = (g, x, y, s, t) => {
        place(g, 'th-bread', { x: -230, y: -120, w: 460, h: 240 }, (c) => {
            cut(c, P.roundRect(-210, -80, 360, 160, 75), '#c98d4e', 'loaf', { inner: (cc) => WL.scribbleFill(cc, { x: -200, y: -80, w: 340, h: 160 }, '#8a5a33', 'loaft', { lineH: 18, width: 1, scale: 0.8 }) });
            for (let k = 0; k < 4; k++) cut(c, [[-150 + k * 70, -60], [-120 + k * 70, -65], [-150 + k * 70, 30], [-170 + k * 70, 25]], '#e8c48c', 'score' + k, { border: 0, shadow: 0 });
            cut(c, P.roundRect(120, -60, 90, 140, 35), '#f1dcae', 'slice', { paper: '#fff' });
        }, x, y, s);
    };
})();
