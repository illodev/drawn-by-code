// Card «cello» (reference 12.375–12.5 s, full frame): a cello close up, tilted, warm wood
// (yellow flat, a pink screen that thins into a yellow highlight along the strings, navy dots
// in the shade), dark f-holes with round ends, a yellow bridge with its shadow, four yellow
// strings, the tailpiece and the end of the fingerboard; an olive dark ground on the left and
// a purple (pink + navy) shape on the top right. Measured on the 12.43 s frame in 1000 × 1000
// units. The strings shiver on twos. Needs cards/_g4-util.js.
var CARDS = CARDS || {};
CARDS.cello = (press, t) => {
    const U = G4, T = U.T, d = Math.floor(t * 12 + 1e-6);
    const Y = press.plate('yellow'), P = press.plate('pink'), B = press.plate('blue'), N = press.plate('navy');
    const YS = press.plate('yellow', 'screen'), PS = press.plate('pink', 'screen'), BS = press.plate('blue', 'screen'), NS = press.plate('navy', 'screen');
    const dark = [N, Y];
    // the instrument's axis (along the strings) and its perpendicular
    const ax = [0.394, 0.919], nx = [0.919, -0.394];
    const along = (g, x0, y0) => { g.setTransform(g.getTransform().multiply(new DOMMatrix([nx[0], nx[1], ax[0], ax[1], x0, y0]))); };

    // the ground: olive black on the left and bottom
    for (const g of dark) { g.fillStyle = T(1); g.fillRect(0, 0, 1000, 1000); }
    BS.fillStyle = T(0.25); BS.fillRect(0, 0, 1000, 1000);
    U.specks(P, 'celloground', 40, [0, 0, 300, 1000], 1, 2.2);

    // the body: everything right of the left edge
    const edge = [[-10, 150], [0, 160], [40, 230], [100, 285], [160, 300], [210, 340], [250, 400], [290, 480], [300, 560], [280, 640], [235, 700], [220, 760], [225, 850], [240, 930], [250, 1010]];
    const body = edge.concat([[1010, 1010], [1010, -10], [-10, -10]]);
    const bodyShape = (g) => U.smooth(g, body, true, false);
    press.knockout((g) => { U.smooth(g, body, true); g.fill(); });
    U.clip(Y, bodyShape, (c) => { c.fillStyle = T(1); c.fillRect(0, 0, 1000, 1000); });
    // pink: a screen, light in the highlight band along the strings, full towards the edges
    U.clip(PS, bodyShape, (c) => { c.save(); along(c, 470, 500); c.fillStyle = U.lin(c, -520, 0, 520, 0, [[0, 1], [0.25, 0.9], [0.38, 0.4], [0.47, 0.15], [0.55, 0.3], [0.66, 0.85], [1, 1]]); c.fillRect(-600, -900, 1200, 1800); c.restore(); });
    U.clip(NS, bodyShape, (c) => { c.save(); along(c, 470, 500); c.fillStyle = U.lin(c, -520, 0, 520, 0, [[0, 0.5], [0.22, 0.15], [0.35, 0], [0.66, 0], [0.82, 0.18], [1, 0.35]]); c.fillRect(-600, -900, 1200, 1800); c.restore(); });
    // wood grain: thin dark lines along the axis
    U.clip(N, bodyShape, (c) => { c.save(); along(c, 470, 500); c.strokeStyle = T(0.8); const r = Motion.rng('grain'); for (let i = 0; i < 34; i++) { const s = -500 + i * 30 + r() * 12; c.lineWidth = 0.8 + r() * 0.8; c.beginPath(); c.moveTo(s, -900); c.lineTo(s + (r() - 0.5) * 20, 900); c.stroke(); } c.restore(); });
    // the red purfling along the edge, and the red curves of the lower bout in the dark
    const redLine = (pts, w) => { press.knockout((g) => { g.lineWidth = w; g.lineCap = 'round'; g.lineJoin = 'round'; U.smooth(g, pts, false); g.stroke(); }); U.sline(Y, pts, w, 1); U.sline(P, pts, w, 1); };
    redLine(edge.slice(1).map(([x, y]) => [x - 12, y + 4]), 5);
    redLine([[0, 560], [40, 610], [90, 700], [150, 800]], 4);
    redLine([[0, 720], [50, 790], [100, 860]], 3.5);

    // the purple shape on the top right (the next instrument's lower bout), pink rimmed
    const purple = [[650, -10], [630, 80], [625, 150], [650, 230], [700, 300], [740, 360], [785, 408], [830, 418], [880, 420], [920, 440], [960, 470], [1010, 500], [1010, -10]];
    press.knockout((g) => { U.smooth(g, purple, true); g.fill(); });
    U.blob(P, purple, 1); U.blob(NS, purple, 0.36); U.blob(BS, purple, 0.15);
    U.clip(NS, (g) => U.smooth(g, purple, true, false), (c) => { c.fillStyle = U.lin(c, 1000, 0, 700, 300, [[0, 0.1], [1, 0]]); c.fillRect(600, 0, 400, 500); });
    press.knockout((g) => { g.lineWidth = 7; U.smooth(g, purple.slice(0, 12), false); g.stroke(); });
    U.sline(P, purple.slice(0, 12), 7, 1);
    U.sline(N, purple.slice(1, 12).map(([x, y]) => [x + 10, y - 6]), 3, 0.7);

    // the end of the fingerboard: dark, with its end cut square to the axis
    const fb = [[268, -10], [420, -10], [470, 150], [430, 167], [400, 178]];
    for (const g of dark) U.poly(g, [[300, -10], [415, -10], [440, 150], [380, 176]], 1);
    press.knockout((g) => { g.lineWidth = 3; g.beginPath(); g.moveTo(388, 176); g.lineTo(448, 150); g.stroke(); });

    // f-holes: dark strokes with round ends, a yellow highlight beside the right one
    const fhole = (pts, r0, r1, w) => { for (const g of dark) { U.sline(g, pts, w, 1); U.disc(g, pts[0][0], pts[0][1], r0); const e = pts[pts.length - 1]; U.disc(g, e[0], e[1], r1); } };
    U.sline(Y, [[545, 215], [575, 290], [620, 360], [680, 430], [735, 500], [775, 570], [795, 630]], 5, 1);
    U.erase([PS, N, NS], (g) => { g.lineWidth = 5; U.smooth(g, [[545, 215], [575, 290], [620, 360], [680, 430], [735, 500], [775, 570], [795, 630]], false); g.stroke(); });
    fhole([[295, 267], [330, 305], [360, 380], [380, 450], [393, 540], [400, 620], [415, 700], [440, 752], [465, 776]], 21, 26, 12);
    fhole([[510, 176], [522, 205], [538, 265], [568, 332], [612, 396], [662, 452], [710, 512], [745, 572], [763, 620], [770, 643]], 20, 25, 12);
    for (const g of dark) { U.seg(g, [[375, 470], [395, 466]], 4, 1); U.seg(g, [[650, 460], [670, 440]], 4, 1); }

    // the tailpiece: dark, with a yellow fret line at its top and the gut below
    const tail = [[560, 772], [705, 706], [745, 700], [832, 1010], [680, 1010]];
    for (const g of dark) U.poly(g, tail, 1);
    press.knockout((g) => { g.lineWidth = 4; g.beginPath(); g.moveTo(640, 775); g.lineTo(760, 718); g.stroke(); });
    U.seg(Y, [[640, 775], [760, 718]], 4, 1);
    press.knockout((g) => { g.lineWidth = 5; g.beginPath(); g.moveTo(625, 790); g.lineTo(705, 1010); g.stroke(); });
    U.seg(Y, [[625, 790], [705, 1010]], 5, 1);

    // the bridge's shadow, then the bridge: a yellow rounded bar, red dots low on it
    const bridge = (dx, dy) => { const pts = [[420, 530], [470, 500], [560, 468], [630, 452], [642, 470], [630, 492], [560, 510], [470, 540], [430, 562], [412, 552]]; return pts.map(([x, y]) => [x + dx, y + dy]); };
    for (const g of dark) U.blob(g, bridge(18, 38), 1);
    press.knockout((g) => { U.smooth(g, bridge(0, 0), true); g.fill(); });
    U.blob(Y, bridge(0, 0), 1);
    U.clip(PS, (g) => U.smooth(g, bridge(0, 0), true, false), (c) => { c.fillStyle = U.lin(c, 532, 478, 516, 540, [[0, 0], [0.5, 0], [1, 0.6]]); c.fillRect(400, 440, 260, 140); });
    U.sline(N, bridge(0, 0).concat([bridge(0, 0)[0]]), 2.2, 0.7);

    // strings: yellow, a dark line on their right, shivering a unit on twos
    const sh = [0, 0.8, -0.6, 0.4][d % 4];
    for (let i = 0; i < 4; i++) {
        const top = [255 + 38 * i + sh, -10], br = [458 + 48 * i, 522 - 18 * i], end = [585 + 30 * i, 772 - 13 * i];
        press.knockout((g) => { g.lineWidth = 7; g.lineCap = 'round'; g.beginPath(); g.moveTo(...top); g.lineTo(...br); g.lineTo(...end); g.stroke(); });
        U.seg(Y, [top, br, end], 7, 1);
        U.seg(N, [[top[0] + 4, top[1]], [br[0] + 4, br[1]], [end[0] + 4, end[1]]], 1.4, 0.8);
        U.disc(B, end[0], end[1], 4, 1);
    }
    U.speckle(press, 'cello', 70, [0, 0, 1000, 1000], 0.6, 1.5);
};
