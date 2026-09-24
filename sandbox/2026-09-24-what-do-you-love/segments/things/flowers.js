// Montage object «flowers» (see ../things.js for the contract).
// A bouquet in a newspaper cone, measured on the reference at 15.67 s in full-resolution
// pixels (2160² frame), origin O = (1080, 1512) = logical (500, 700); CARDS s = 1/2.16.
// The Claude flower (drawn over it by the montage) is the main bloom; behind it a red flower
// peeks between its rays, a yellow and a blue flower bloom petal by petal on twos.
(() => {
    const P = Paper;
    const { place } = Things.kit;
    const K = () => Things.kitD;
    const OX = 1080, OY = 1512;
    const o = (pts) => pts.map(([x, y]) => [x - OX, y - OY]);
    const COL = { back: '#dcd6ca', front: '#ece8db', ink: '#9d998f', dark: '#86827a', bow: '#d9654e', yellow: '#efd13c', blue: '#74aede', centre: '#eeaa2e', dot: '#99661a', stem: '#4e9e44', red: '#d44b4e', paper: '#fbf6ee' };
    const cut = (c, pts, col, seed, x = {}) => P.cutout(c, pts, col, seed, { border: 7, borderVar: 0.45, jag: 1.4, step: 3, shadow: 0.1, paper: COL.paper, tex: { lVar: 2, sVar: 2, alpha: [0.12, 0.28], len: [30, 90], h: [8, 16] }, ...x });
    const sp = (pts, n = 6) => o(K().cspline(pts, n));
    // newspaper: columns of word bars on a pitch of 18.7 px, the odd headline and photo block
    function news(c, cols, seed, ink) {
        const r = P.rng(seed);
        c.save();
        for (const [x0, x1, y0, y1] of cols) {
            for (let y = y0; y < y1; y += 18.7) {
                const roll = r();
                if (roll < 0.05) {
                    c.fillStyle = COL.dark;
                    c.globalAlpha = 0.9;
                    c.fillRect(x0 - OX, y - OY, (x1 - x0) * (0.55 + r() * 0.45), 25);
                    y += 18.7;
                    continue;
                }
                let x = x0 + (r() < 0.2 ? r() * 20 : 0);
                const end = r() < 0.12 ? x0 + (x1 - x0) * (0.3 + r() * 0.4) : x1;
                c.fillStyle = ink;
                while (x < end - 6) {
                    const w = Math.min(end - x, 12 + r() * 30);
                    c.globalAlpha = 0.7 + r() * 0.3;
                    c.fillRect(x - OX, y - OY, w, 7);
                    x += w + 4 + r() * 3;
                }
            }
        }
        c.restore();
    }
    // a petal round the flower's centre (cx, cy): direction deg, outer tip at radius r1,
    // half-width b; a rounded wedge whose narrow end tucks under the flower's heart (r = 45)
    function petal(cx, cy, deg, r1, L, b) {
        const ang = (deg * Math.PI) / 180, r0 = 45, l = r1 - r0;
        const loc = [[r0, 0], [r0 + 0.22 * l, 0.5 * b], [r0 + 0.55 * l, 0.95 * b], [r0 + 0.82 * l, 0.9 * b], [r1 - 2, 0.35 * b], [r1 - 2, -0.35 * b], [r0 + 0.82 * l, -0.9 * b], [r0 + 0.55 * l, -0.95 * b], [r0 + 0.22 * l, -0.5 * b]];
        return K().cspline(loc.map(([x, y]) => [cx + x * Math.cos(ang) - y * Math.sin(ang), cy + x * Math.sin(ang) + y * Math.cos(ang)]), 6);
    }
    // petals in drawing order: [direction deg, outer radius, length, half-width, first drawing]
    const BLUE = { c: [1405, 1120], petals: [[-147, 158, 0, 48, 2], [-86, 202, 0, 56, 1], [-39, 206, 0, 60, 1], [2, 197, 0, 58, 1], [178, 158, 0, 60, 2], [116, 160, 0, 63, 2], [56, 172, 0, 61, 2]] };
    const YELLOW = { c: [758, 1125], petals: [[-10, 168, 0, 58, 0], [-100, 186, 0, 70, 0], [186, 205, 0, 76, 1], [126, 196, 0, 74, 1], [62, 192, 0, 72, 0]] };
    function flowers(c, d) {
        const heart = d === 3;
        // red flower right behind the Claude flower: on the card only slivers show between its
        // rays; in the heart (no Claude flower) it is the main bloom, five petals and a heart
        if (heart) {
            [-90, -18, 54, 126, 198].forEach((deg, k) => cut(c, o(petal(1080, 875, deg, 235, 0, 78)), COL.red, 'fl-redp' + k, { tex: { angle: (deg * Math.PI) / 180, angleVar: 0.35, alpha: [0.2, 0.45], lVar: 5, len: [40, 90], h: [6, 12] } }));
            cut(c, o(P.ellipse(1080, 875, 62, 60, 24)), COL.yellow, 'fl-redc', { border: 5 });
        } else [[-131, 255], [8, 210], [105, 120]].forEach(([deg, len], k) => {
            const a = (deg * Math.PI) / 180, [cx, cy] = [1060, 1000];
            cut(c, o(K().strip([[cx, cy], [cx + Math.cos(a) * len * 0.5, cy + Math.sin(a) * len * 0.5], [cx + Math.cos(a) * len, cy + Math.sin(a) * len]], [30, 40, 44])), COL.red, 'fl-red' + k, { border: 5 });
        });
        // stems (the cone hides their feet)
        cut(c, K().strip(o([[1300, 1345], [1345, 1255], [1395, 1150]]), [30, 30, 28]), COL.stem, 'fl-stemB', { border: 5 });
        cut(c, K().strip(o([[1080, 1350], [1080, 1290], [1082, 1240]]), [42, 40, 38]), COL.stem, 'fl-stemC', { border: 5 });
        cut(c, K().strip(o([[860, 1350], [835, 1300], [800, 1250]]), [40, 42, 36]), COL.stem, 'fl-stemY', { border: 5 });
        for (const [F, col, key] of [[YELLOW, COL.yellow, 'y'], [BLUE, COL.blue, 'b']]) {
            F.petals.forEach(([deg, r1, L, b, from], k) => {
                if (d >= from) cut(c, o(petal(F.c[0], F.c[1], deg, r1, L, b)), col, 'fl-' + key + k, { tex: { angle: (deg * Math.PI) / 180, angleVar: 0.35, alpha: [0.2, 0.45], lVar: 5, len: [40, 90], h: [6, 12] } });
            });
        }
        if (heart) cut(c, o(P.ellipse(758, 1125, 50, 48, 24)), '#d0674a', 'fl-ycentre', { border: 5 });
        // the blue flower's heart: a yellow-orange disc with a brown seed
        cut(c, o(P.ellipse(1406, 1122, 50, 40, 24)), COL.centre, 'fl-centre', { border: 5, tex: { alpha: [0.2, 0.4], lVar: 5 }, inner: (cc) => {
            cc.fillStyle = COL.dot;
            cc.globalAlpha = 0.85;
            cc.beginPath();
            cc.ellipse(1408 - OX, 1119 - OY, 9, 8, 0.3, 0, Math.PI * 2);
            cc.fill();
            cc.globalAlpha = 1;
        } });
    }
    function cone(c) {
        // back sheet (greyer), then the front sheet folded over it
        cut(c, o([[733, 1353], [860, 1346], [990, 1338], [1110, 1338], [1110, 1850], [1060, 1846], [1000, 1826], [970, 1762], [940, 1702], [900, 1645], [850, 1556], [800, 1470], [762, 1405]], 4), COL.back, 'fl-back', { tex: { alpha: [0.08, 0.16] }, inner: (cc) => news(cc, [[742, 827, 1352, 1860], [834, 928, 1352, 1860], [940, 1000, 1352, 1860]], 'np-back', '#9a958b') });
        cut(c, o([[988, 1338], [1167, 1327], [1300, 1320], [1430, 1313], [1407, 1367], [1367, 1447], [1330, 1505], [1280, 1605], [1245, 1690], [1220, 1740], [1200, 1780], [1185, 1825], [1160, 1845], [1105, 1851], [1060, 1846], [1022, 1832], [1020, 1760], [1018, 1700], [1010, 1610], [1003, 1547], [997, 1447]], 4), COL.front, 'fl-front', { tex: { alpha: [0.08, 0.16] }, inner: (cc) => {
            news(cc, [[1000, 1098, 1330, 1860], [1104, 1253, 1330, 1860], [1262, 1410, 1325, 1860]], 'np-front', COL.ink);
            cc.fillStyle = COL.dark;
            cc.fillRect(1022 - OX, 1795 - OY, 88, 28);
        } });
        // red bow: the band behind, then the two loops
        const bowTex = { angle: 0.1, alpha: [0.25, 0.5], lVar: 6, len: [30, 80], h: [4, 9] };
        cut(c, sp([[945, 1635], [1000, 1627], [1050, 1625], [1115, 1624], [1200, 1625], [1215, 1645], [1200, 1670], [1150, 1682], [1100, 1687], [1050, 1690], [1000, 1692], [965, 1692], [947, 1670]]), COL.bow, 'fl-bow', { border: 5.5, tex: bowTex });
        cut(c, o([[957, 1607], [995, 1601], [1022, 1612], [1047, 1630], [1042, 1660], [1015, 1680], [970, 1672], [950, 1650]]), COL.bow, 'fl-loopL', { border: 5.5, tex: bowTex });
        cut(c, o([[1110, 1640], [1150, 1607], [1180, 1599], [1197, 1606], [1215, 1635], [1200, 1665], [1170, 1673], [1120, 1666]]), COL.bow, 'fl-loopR', { border: 5.5, tex: bowTex });
    }
    Things.flowers = (g, x, y, s, t) => {
        // the side flowers bloom petal by petal: 3 drawings on twos, then stay open
        const d = t >= 15.5 && t < 15.75 ? Math.min(2, K().drawing(t, 15.5)) : t >= 15.75 ? 3 : 2;
        place(g, 'th-bouquet-' + d, { x: 540 - OX, y: 620 - OY, w: 1100, h: 1250 }, (c) => {
            flowers(c, d);
            cone(c);
        }, x, y, s, 0, 0.54);
    };
})();
