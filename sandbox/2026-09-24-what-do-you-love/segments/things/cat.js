// Montage object «cat» (see ../things.js for the contract).
// An orange cat curled up asleep, measured on the reference at 15.92 s in full-resolution
// pixels (2160² frame), origin O = (1080, 1512) = logical (500, 700); CARDS s = 1/2.16.
// The flower rests on its back (drawn over it by the montage). On the card: "Z z" drift over
// its head and the body breathes; the heart's miniature is the cat alone.
(() => {
    const P = Paper;
    const { place } = Things.kit;
    const K = () => Things.kitD;
    const OX = 1080, OY = 1512;
    const o = (pts) => pts.map(([x, y]) => [x - OX, y - OY]);
    const COL = { body: '#cd8851', tail: '#b87339', stripe: '#a35f34', cream: '#f1e3c6', pink: '#e2868f', ink: '#231d1f', whisker: '#3a3336', paper: '#fbf6ee', z: '#f3eee6' };
    const cut = (c, pts, col, seed, x = {}) => P.cutout(c, pts, col, seed, { border: 7, borderVar: 0.45, jag: 1.5, step: 3, shadow: 0.1, paper: COL.paper, tex: { lVar: 1.5, sVar: 1.5, alpha: [0.1, 0.22], len: [30, 90], h: [8, 16] }, ...x });
    const sp = (pts, n = 6) => o(K().cspline(pts, n));
    const stroke = (c, pts, col, w, seed, alpha = 0.95) => P.markerStroke(c, o(K().cspline(pts, 6, false)), col, w, seed, alpha);

    function body(c) {
        // body: one big rounded piece (its top rests under the flower), dark stripes on the back
        cut(c, sp([[700, 1267], [733, 1208], [783, 1167], [830, 1130], [900, 1098], [1000, 1075], [1100, 1062], [1200, 1060], [1300, 1068], [1380, 1085], [1433, 1104], [1500, 1125], [1558, 1167], [1608, 1225], [1650, 1283], [1675, 1350], [1683, 1430], [1680, 1500], [1660, 1560], [1600, 1640], [1520, 1690], [1440, 1720], [1360, 1737], [1225, 1742], [1100, 1745], [1000, 1740], [900, 1700], [800, 1640], [720, 1560], [690, 1450], [690, 1330]]), COL.body, 'cat-body', { inner: (cc) => {
            stroke(cc, [[1373, 1157], [1340, 1195], [1307, 1237]], COL.stripe, 16, 'cst1', 0.85);
            stroke(cc, [[1493, 1213], [1440, 1245], [1387, 1277]], COL.stripe, 16, 'cst2', 0.85);
            stroke(cc, [[1107, 1216], [1116, 1228], [1124, 1240]], COL.stripe, 15, 'cst3', 0.85);
        } });
    }
    function front(c) {
        // tail: wraps from the right side round the front, over the body
        cut(c, K().strip(o([[1665, 1535], [1668, 1600], [1625, 1680], [1545, 1740], [1430, 1785], [1300, 1800], [1150, 1802], [1000, 1792], [890, 1758], [835, 1715]]), [70, 76, 80, 86, 95, 100, 102, 100, 92, 82]), COL.tail, 'cat-tail', { tex: { angle: 0, alpha: [0.18, 0.35], lVar: 3, len: [40, 110], h: [8, 16] } });
        // ears behind the head, pink insides
        cut(c, sp([[551, 1198], [610, 1238], [664, 1280], [622, 1322], [560, 1346], [553, 1270]], 4), COL.body, 'cat-earL', { inner: (cc) => cut(cc, sp([[590, 1260], [636, 1292], [606, 1312]], 3), COL.pink, 'cat-pinkL', { border: 0, shadow: 0, jag: 0.8 }) });
        cut(c, sp([[848, 1282], [930, 1185], [1000, 1104], [1012, 1200], [1026, 1350], [950, 1330]], 4), COL.body, 'cat-earR', { inner: (cc) => cut(cc, sp([[887, 1279], [975, 1179], [975, 1312]], 3), COL.pink, 'cat-pinkR', { border: 0, shadow: 0, jag: 0.8 }) });
        // head, muzzle, nose, mouth, closed eyes, whiskers
        cut(c, sp([[565, 1360], [552, 1400], [555, 1470], [580, 1545], [630, 1610], [690, 1650], [760, 1665], [830, 1660], [900, 1635], [950, 1600], [990, 1540], [1002, 1480], [995, 1420], [975, 1360], [930, 1315], [880, 1285], [820, 1270], [760, 1267], [695, 1275], [640, 1295], [595, 1325]]), COL.body, 'cat-head');
        cut(c, sp([[668, 1540], [690, 1490], [730, 1465], [770, 1460], [815, 1470], [850, 1500], [866, 1550], [858, 1605], [825, 1645], [770, 1662], [715, 1650], [680, 1615]]), COL.cream, 'cat-muzzle', { border: 5.5 });
        cut(c, sp([[737, 1500], [765, 1499], [792, 1500], [778, 1516], [765, 1531], [751, 1516]], 3), COL.pink, 'cat-nose', { border: 0, shadow: 0, jag: 0.7 });
        P.markerStroke(c, o([[727, 1561], [765, 1590], [801, 1563]]), COL.ink, 6.5, 'cmouth', 0.95);
        stroke(c, [[613, 1443], [632, 1463], [660, 1471], [688, 1464], [706, 1442]], COL.ink, 11, 'ceyeL');
        stroke(c, [[820, 1428], [840, 1448], [866, 1456], [892, 1449], [911, 1428]], COL.ink, 11, 'ceyeR');
        for (const [a, b] of [[[520, 1522], [672, 1547]], [[525, 1595], [670, 1579]], [[857, 1547], [1002, 1517]], [[860, 1574], [1000, 1587]]]) P.markerStroke(c, o([a, b]), COL.whisker, 3.6, 'cwh' + a[0] + a[1], 0.85);
        // paws: the far one tucked in, the near one over the tail
        cut(c, sp([[826, 1668], [850, 1652], [885, 1654], [905, 1676], [895, 1705], [860, 1716], [832, 1702]], 4), COL.cream, 'cat-paw1', { border: 5.5 });
        cut(c, sp([[878, 1690], [905, 1658], [960, 1646], [1030, 1650], [1072, 1672], [1075, 1712], [1040, 1748], [975, 1762], [912, 1752], [880, 1725]], 5), COL.cream, 'cat-paw2', { border: 5.5 });
    }
    // Z z: cream paper strips, re-cut on each drawing (they drift a little)
    const ZS = [
        [[431, 392, 124, 113, 0], [595, 588, 88, 89, 0]],
        [[419, 390, 126, 118, 0], [592, 585, 92, 95, 0]],
        [[407, 386, 130, 122, 0], [590, 582, 98, 99, 0]],
    ];
    function zz(c, d) {
        ZS[d].forEach(([x, y, w, h], k) => {
            const bw = k ? 12 : 15;
            [[[x, y + 4], [x + w, y]], [[x + w - 4, y + 5], [x + 5, y + h - 4]], [[x + 1, y + h], [x + w + 3, y + h - 3]]].forEach((bar, j) => {
                cut(c, P.noodle(o(bar), bw, bw), COL.z, 'catz' + d + k + j, { border: 2, borderVar: 0.3, jag: 0.8, step: 2.5, shadow: 0, tex: { alpha: [0.08, 0.16] } });
            });
        });
    }
    Things.cat = (g, x, y, s, t) => {
        const onCard = t >= 15.75 && t < 16;
        const d = onCard ? Math.min(2, K().drawing(t, 15.75)) : 2;
        // breathing: the body swells a hair on the middle drawing
        const br = onCard ? [1, 1.006, 1][d] : 1 + 0.006 * (Math.floor(t * 12) % 4 === 1 ? 1 : 0);
        const by = (1742 - OY) * s * (1 - br);
        place(g, 'th-cat-body', { x: 670 - OX, y: 1040 - OY, w: 1040, h: 720 }, body, x, y + by, s * br, 0, 0.54);
        place(g, 'th-cat-front', { x: 500 - OX, y: 1090 - OY, w: 1200, h: 780 }, front, x, y, s, 0, 0.54);
        if (onCard) place(g, 'th-cat-z' + d, { x: 390 - OX, y: 370 - OY, w: 330, h: 330 }, (c) => zz(c, d), x, y, s, 0, 0.54);
    };
})();
