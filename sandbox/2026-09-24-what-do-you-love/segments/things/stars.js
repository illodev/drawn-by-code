// Montage object «stars» (see ../things.js for the contract).
(() => {
    const P = Paper, E = Ease, C = WL.COL;
    const { place, cut, circleU } = Things.kit;
    Things.stars = (g, x, y, s, t) => {
        place(g, 'th-space', { x: -330, y: -330, w: 660, h: 660 }, (c) => {
            cut(c, P.ellipse(0, 0, 300, 300), '#262a66', 'space', { paper: '#e8e6f0', border: 7 });
            cut(c, P.ellipse(0, 60, 100, 100), '#e8b85a', 'saturn');
            P.markerStroke(c, P.ellipse(0, 60, 190, 45, 64).map(([a, b]) => [a, b + (a > 0 ? -10 : 10)]), '#e98b87', 14, 'ring', 0.95);
            cut(c, P.ellipse(-210, -120, 30, 30), '#e98b87', 'planet1');
            cut(c, P.ellipse(210, -80, 34, 34), '#d6d4e6', 'planet2', { inner: (cc) => WL.scribbleFill(cc, { x: 175, y: -115, w: 70, h: 70 }, '#8d8a9a', 'pl2t', { lineH: 10, width: 0.8, scale: 0.5 }) });
            P.markerStroke(c, Array.from({ length: 28 }, (_, i) => [150 + Math.cos(i * 0.45) * i * 1.6, 190 + Math.sin(i * 0.45) * i * 1.6]), '#e98b87', 4, 'galaxy', 0.9);
        }, x, y, s);
        const r = Motion.rng('spacestars');
        for (let i = 0; i < 9; i++) WL.star(g, x + (-250 + r() * 500) * s, y + (-250 + r() * 500) * s, 10 * s * (0.8 + 0.2 * Math.sin(t * 8 + i)), r());
    };
})();
