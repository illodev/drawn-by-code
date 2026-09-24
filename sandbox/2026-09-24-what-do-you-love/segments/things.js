// Montage objects: one file per object in things/, each defining Things.<name>(g, x, y, s, t).
// (x, y) = the object's anchor on its card, s = scale (the card uses the scale in CARDS, the
// heart reuses the same drawer in miniature), t = global time (for secondary action).
// This file holds the shared helpers; montage.js assembles the cards and the heart.
const Things = {};
Things.kit = (() => {
    const P = Paper;
    // draws a cached cutout group centred on (x, y), scaled by s.
    // res = sprite resolution per local unit (≥ 1.1 × the largest s it is drawn at)
    function place(g, key, box, draw, x, y, s, rot = 0, res = 1.6) {
        const sp = WL.sprite(key, box, draw, res);
        g.save();
        g.translate(x, y);
        g.rotate(rot);
        g.scale(s, s);
        sp.draw(g);
        g.restore();
    }
    const cut = (c, pts, col, seed, o = {}) => P.cutout(c, pts, col, seed, { border: 2.4, shadow: 0.15, ...o });
    const circleU = (list, dx = 0, dy = 0) => P.circleUnion(list).map(([x, y]) => [x + dx, y + dy]);
    return { place, cut, circleU };
})();
