// Montage object «bread» (see ../things.js for the contract).
(() => {
    const P = Paper;
    const { place, cut } = Things.kit;
    // Bread: measured on the reference at 12.83 s. Authored in frame pixels of the 2160² reference,
    // origin (1000, 1300) → logical (463, 601.9); 1 logical = 2.16 px, so the card draws it at s = 1.
    // The loaf is ruled notebook paper printed with handwriting; the slice is its own piece.
    const AX = 1000, AY = 1300, K = 1 / 2.16;
    const BREAD = {
        loaf: '#d8a05f', ink: '#4f4c68', rule: '#a89aa0', score: '#f1dca7', crustLine: '#8f5a2c', scoreLine: '#8f5a2c',
        crust: '#b37644', crumb: '#f5e8c2', ring: '#c9a36c', margin: '#d9544f', steam: '#eeefea',
    };
    const map = (pts) => pts.map(([a, b]) => [(a - AX) * K, (b - AY) * K]);
    const sp = (pts, n = 8) => PaperDetail.spline(map(pts), n);
    // a score: a rounded strip along a bent centreline (px), w0 wide at its first point, w1 at its last
    function strip(pts, w0, w1) {
        const n = pts.length, L = [], R = [];
        pts.forEach((p, i) => {
            const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)];
            const dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy), w = (w0 + ((w1 - w0) * i) / (n - 1)) / 2;
            L.push([p[0] - (dy / d) * w, p[1] + (dx / d) * w]);
            R.push([p[0] + (dy / d) * w, p[1] - (dx / d) * w]);
        });
        const cap = (p, q, w) => {
            const dx = p[0] - q[0], dy = p[1] - q[1], d = Math.hypot(dx, dy);
            return [p[0] + (dx / d) * w * 0.45, p[1] + (dy / d) * w * 0.45];
        };
        return [...L, cap(pts[n - 1], pts[n - 2], w1), ...R.reverse(), cap(pts[0], pts[1], w0)];
    }
    // ruled notebook lines every 60 px (frame), tilted by `ang`; handwriting sits on them
    function notebook(cc, box, ang, seed, margin = null, so = {}) {
        // tilted about the piece's centre
        cc.save();
        const cx = box.x + box.w / 2, cy = box.y + box.h / 2;
        cc.translate(cx, cy);
        cc.rotate(ang);
        cc.translate(-cx, -cy);
        const bb = { x: box.x - 60, y: box.y - 60, w: box.w + 120, h: box.h + 120 };
        const step = 60 * K, y0 = (1172 - AY) * K;
        const first = y0 + Math.floor((bb.y - y0) / step) * step;
        cc.strokeStyle = BREAD.rule;
        cc.lineWidth = 1.7;
        cc.globalAlpha = 0.9;
        for (let y = first; y < bb.y + bb.h; y += step) (cc.beginPath(), cc.moveTo(bb.x, y), cc.lineTo(bb.x + bb.w, y), cc.stroke());
        if (margin !== null) {
            cc.strokeStyle = BREAD.margin;
            cc.globalAlpha = 0.7;
            cc.beginPath();
            cc.moveTo(bb.x, (margin - AY) * K);
            cc.lineTo(bb.x + bb.w, (margin - AY) * K);
            cc.stroke();
        }
        cc.globalAlpha = 1;
        Things.scrawl(cc, bb, BREAD.ink, seed, { k: 1.55, lineH: 17.4, xh: 5.2, aw: 4.2, rowVar: 0, y0: first - 5 * K, alpha: 0.78, tall: 0.08, dip: 0.06, gap: 7, gapVar: 11, width: 1.25, ...so });
        cc.restore();
    }
    // steam: three drawings (on twos) of a wavy strip rising at each side of the loaf
    const STEAM = [
        [12.7, [[500, 817], [520, 850], [530, 892], [525, 942], [500, 982], [465, 1017]], [[1520, 877], [1545, 905], [1563, 948], [1573, 985], [1572, 1012]]],
        [12.83, [[525, 632], [500, 662], [476, 722], [485, 792], [520, 852], [530, 892], [520, 942], [500, 982], [475, 997]], [[1435, 707], [1445, 762], [1490, 822], [1540, 882], [1568, 932], [1575, 997]]],
        [12.91, [[530, 607], [500, 632], [475, 712], [485, 772], [520, 832], [530, 882], [512, 942], [470, 982]], [[1455, 607], [1430, 702], [1450, 777], [1500, 832], [1550, 882], [1575, 932], [1570, 982]]],
    ];

    Things.bread = (g, x, y, s, t) => {
        place(g, 'th-bread-loaf', { x: -295, y: -195, w: 630, h: 410 }, (c) => {
            const bcut = (pts, col, seed, o = {}) => cut(c, sp(pts), col, seed, { border: 3, shadow: 0.12, step: 2, ...o });
            // the loaf: ruled paper with handwriting, flower hides behind its top
            bcut([[402, 1300], [410, 1220], [443, 1149], [499, 1072], [560, 1025], [624, 982], [721, 956], [818, 940], [916, 933], [1013, 933], [1110, 936], [1207, 944], [1290, 964], [1388, 1003], [1471, 1051], [1540, 1121], [1582, 1197], [1600, 1260], [1605, 1330], [1580, 1420], [1500, 1470], [1400, 1480], [1277, 1484], [1193, 1494], [1054, 1506], [916, 1511], [777, 1504], [638, 1490], [520, 1472], [450, 1440], [412, 1392]],
                BREAD.loaf, 'bloaf', { border: 3.4, tex: { lVar: 2.5, alpha: [0.2, 0.45] }, inner: (cc, box) => notebook(cc, box, 0, 'bloafh') });
            // scores: pale strips with a torn edge, a brown cut line across each
            // (measured: each is bent, flatter below the cut line and steeper above it)
            const scores = [
                [[[538, 1342], [580, 1305], [612, 1250], [646, 1179], [690, 1098]], 44, 52],
                [[[814, 1278], [859, 1233], [890, 1172], [921, 1105], [964, 1024]], 44, 52],
                [[[1086, 1276], [1131, 1232], [1162, 1172], [1194, 1109], [1238, 1032]], 44, 52],
                [[[1392, 1290], [1428, 1240], [1452, 1195], [1472, 1160], [1500, 1122]], 42, 48],
            ];
            scores.forEach(([pts, w0, w1], i) => bcut(strip(pts, w0, w1), BREAD.score, 'bscore' + i, { border: 2.4, shadow: 0.06, tex: { angle: -1.1, lVar: 3, alpha: [0.2, 0.4] } }));
            for (const [i, pts] of [[[506, 1301], [560, 1276], [638, 1246], [690, 1206], [735, 1169]], [[784, 1222], [840, 1198], [902, 1176], [955, 1140], [1006, 1097]], [[1054, 1225], [1120, 1200], [1179, 1176], [1230, 1140], [1279, 1097]], [[1492, 1225], [1520, 1205], [1548, 1183]]].entries()) {
                P.markerStroke(c, map(pts), BREAD.scoreLine, 4.4, 'bsline' + i, 0.85);
            }
            // crust lines along the top and the bottom of the loaf
            P.markerStroke(c, map([[450, 1149], [505, 1105], [568, 1072], [640, 1040], [707, 1017], [780, 1000], [846, 989], [915, 983], [985, 982], [1055, 988], [1124, 996], [1195, 1008], [1263, 1024], [1335, 1050], [1402, 1079], [1480, 1110], [1554, 1139]]), BREAD.crustLine, 4.2, 'bcrust1', 0.8);
            P.markerStroke(c, map([[520, 1454], [610, 1462], [707, 1468], [846, 1475], [999, 1482], [1138, 1472], [1263, 1461]]), BREAD.crustLine, 4, 'bcrust2', 0.8);
        }, x, y, s, 0, 1.2);
        // the slice in front: crust piece (same ruled paper, tilted), crumb, holes. The heart's
        // miniature (t ≥ 16) is the loaf alone, without slice or steam, as in the reference.
        if (t >= 16) return;
        place(g, 'th-bread-slice', { x: 112, y: -45, w: 212, h: 252 }, (c) => {
            const bcut = (pts, col, seed, o = {}) => cut(c, sp(pts), col, seed, { border: 3, shadow: 0.12, step: 2, ...o });
            bcut([[1332, 1270], [1372, 1245], [1416, 1238], [1454, 1237], [1498, 1237], [1542, 1245], [1584, 1264], [1622, 1291], [1651, 1327], [1664, 1373], [1672, 1416], [1672, 1459], [1671, 1502], [1663, 1546], [1652, 1591], [1639, 1644], [1601, 1679], [1555, 1703], [1504, 1711], [1454, 1703], [1406, 1697], [1359, 1687], [1323, 1657], [1291, 1626], [1275, 1582], [1272, 1534], [1274, 1480], [1282, 1406], [1300, 1325]],
                BREAD.crust, 'bslice', { border: 3.8, borderVar: 0.7, shadow: 0.16, tex: { lVar: 3, alpha: [0.25, 0.5] }, inner: (cc, box) => {
                    notebook(cc, box, 0.144, 'bsliceh', 1504, { gap: 14, gapVar: 22 });
                    P.cutout(cc, sp([[1472, 1282], [1511, 1288], [1547, 1302], [1581, 1320], [1605, 1350], [1621, 1383], [1627, 1418], [1630, 1451], [1628, 1483], [1624, 1513], [1617, 1543], [1611, 1575], [1603, 1613], [1579, 1643], [1547, 1663], [1510, 1672], [1472, 1669], [1436, 1663], [1399, 1660], [1362, 1647], [1338, 1617], [1310, 1591], [1310, 1550], [1314, 1514], [1315, 1483], [1321, 1452], [1328, 1423], [1336, 1391], [1350, 1361], [1368, 1326], [1399, 1306], [1434, 1293]], 4),
                        BREAD.crumb, 'bcrumb', { border: 0, shadow: 0, jag: 0.5, tex: { lVar: 2, alpha: [0.2, 0.4] } });
                    // holes: little tan rings
                    cc.strokeStyle = BREAD.ring;
                    cc.lineWidth = 7 * K;
                    for (const [hx, hy] of [[1488, 1267], [1524, 1339], [1427, 1389], [1547, 1514], [1464, 1539]]) {
                        cc.globalAlpha = 0.95;
                        cc.beginPath();
                        cc.ellipse((hx - AX) * K, (hy - AY) * K, 13.5 * K, 12.5 * K, 0.4, 0, Math.PI * 2);
                        cc.stroke();
                    }
                    cc.globalAlpha = 1;
                } });
        }, x, y, s, 0, 1.2);
        // steam rising at the sides from 12.7 s: each drawing cached once, swapped on twos
        const k = STEAM.reduce((a, st, i) => (t >= st[0] ? i : a), -1);
        if (k >= 0) {
            place(g, 'th-bread-steam' + k, { x: -270, y: -335, w: 580, h: 220 }, (c) => {
                for (const [j, pts] of [STEAM[k][1], STEAM[k][2]].entries()) {
                    const path = PaperDetail.spline(map(pts), 6, false);
                    c.save();
                    c.lineCap = 'round';
                    c.lineJoin = 'round';
                    c.strokeStyle = 'rgba(40,40,80,0.12)';
                    c.lineWidth = 9;
                    c.translate(0.6, 1);
                    c.beginPath();
                    path.forEach(([px, py], i) => (i ? c.lineTo(px, py) : c.moveTo(px, py)));
                    c.stroke();
                    c.restore();
                    P.markerStroke(c, path, BREAD.steam, 8.4, 'bsteam' + k + j, 1);
                }
            }, x, y, s, 0, 1.2);
        }
    };
})();
