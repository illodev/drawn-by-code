// Montage object «words» (see ../things.js for the contract).
(() => {
    const P = Paper, E = Ease, C = WL.COL;
    const { place, cut, circleU } = Things.kit;
    Things.words = (g, x, y, s, t) => {
        place(g, 'th-book', { x: -250, y: -130, w: 500, h: 260 }, (c) => {
            cut(c, [[-230, -60], [0, -40], [230, -60], [230, 110], [0, 120], [-230, 110]], '#d9473b', 'bookcover');
            for (const sd of [-1, 1]) {
                cut(c, [[0, -70], [sd * 215, -100], [sd * 215, 90], [0, 105]], '#f3eee2', 'bookpage' + sd, { border: 1.6, shadow: 0.05, inner: (cc) => WL.scribbleFill(cc, { x: sd < 0 ? -200 : 20, y: -90, w: 180, h: 180 }, '#8d8578', 'bookt' + sd, { lineH: 16, width: 1, scale: 0.8 }) });
            }
        }, x, y, s);
        const L = [['a', '#d87c65', -150, -170], ['b', '#f0cc51', -40, -230], ['c', '#3862b1', 90, -190], ['e', '#6e3f9e', 200, -120]];
        for (const [ch, col, dx, dy] of L) WL.write(g, ch, x + dx * s, y + (dy + Math.sin(t * 9 + dx) * 8) * s, 90 * s, col, { align: 'center' });
    };
})();
