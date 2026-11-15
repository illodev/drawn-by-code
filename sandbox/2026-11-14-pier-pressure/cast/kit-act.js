// pier-pressure · Kit's drawings put on the frame. Global: KitAct. Load after drawn.js and the cast's
// drawings (cast/*-drawn.js, each with its own anchor `at` and pixels per metre `m`).
//
//   KitAct.pose(g, name, x, y, s, { rot, sx, sy })   one of her drawings, the point between its soles
//       on (x, y); s: frame units per 1/429 of a metre (the size her first key poses were drawn at)
//   KitAct.board(g, x, y, s, rot)   her board alone, its wheels on (x, y); s: frame units per 1/500
//       of a metre. It is the skateboard drawn by itself on Milo's model sheet, the only place a
//       whole board is drawn, turned level.
const KitAct = (() => {
    const BOARD_TILT = 0.64; // how far that drawing is from level (radians; measured on the sheet)
    function board(g, x, y, s, rot = 0) {
        const mt = Drawn.meta('milo', 'board'), z = (s * 500) / mt.m;
        g.save();
        g.translate(x, y - 0.075 * s * 500);
        g.rotate(rot - BOARD_TILT);
        Drawn.draw(g, 'milo', 'board', -mt.at[0] * z, -mt.at[1] * z, z);
        g.restore();
    }
    function pose(g, name, x, y, s, o = {}) {
        const mt = Drawn.meta('kit', name), z = (s * 429) / mt.m;
        g.save();
        g.translate(x, y);
        g.rotate(o.rot ?? 0);
        g.scale(o.sx ?? 1, o.sy ?? 1);
        Drawn.draw(g, 'kit', name, -mt.at[0] * z, -mt.at[1] * z, z);
        g.restore();
    }
    return { pose, board };
})();
