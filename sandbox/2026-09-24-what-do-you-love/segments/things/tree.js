// Montage object «tree» (see ../things.js for the contract).
// Also defines Things.scrawl, the handwriting texture shared with bread.js (looked up at draw time).
(() => {
    const P = Paper;
    const { place, cut } = Things.kit;

    // Handwriting texture (the «mm lh nn» rows printed on the reference's papers): words of
    // round arches (n/m), tall loops (h/l) and dips under the baseline (u/y), in rows.
    // Units are logical; o.k scales the whole script. Measured on the tree crown: baseline
    // every 18.5, x-height 4.6, arch 3.5 wide, ascender 11.5, dip 8, stroke 1.3; o.tall / o.dip =
    // share of tall loops and dips, o.gap / o.gapVar = space between words.
    function scrawl(c, box, color, seed, o = {}) {
        const k = o.k ?? 1, lh = (o.lineH ?? 18.5) * k, xh = (o.xh ?? 4.6) * k, aw = (o.aw ?? 3.5) * k;
        const r = P.rng(seed + ':scrawl');
        c.save();
        c.strokeStyle = color;
        c.lineWidth = (o.width ?? 1.3) * k;
        c.lineCap = 'round';
        c.lineJoin = 'round';
        c.globalAlpha = o.alpha ?? 0.9;
        // o.y0: first baseline (to sit the rows on ruled lines), o.rowVar: spacing jitter
        const rv = o.rowVar ?? 0.12, pt = o.tall ?? 0.12, pd = o.dip ?? 0.08;
        for (let y = o.y0 ?? box.y + lh * (0.55 + r() * 0.3); y < box.y + box.h + xh; y += lh * (1 - rv / 2 + r() * rv)) {
            let x = box.x - r() * 12 * k;
            while (x < box.x + box.w) {
                const n = 2 + Math.floor(r() * 5);
                const base = y + (r() - 0.5) * 1.2 * k;
                c.beginPath();
                c.moveTo(x, base);
                for (let i = 0; i < n; i++) {
                    const roll = r(), w = aw * (0.85 + r() * 0.35);
                    // arch height: x-height, ascender (tall loop) or a dip under the line
                    const tall = roll < pt, dip = !tall && roll < pt + pd;
                    const h = tall ? -(10 + r() * 3.5) * k : dip ? (6 + r() * 3) * k : -xh * (0.85 + r() * 0.3);
                    const ww = tall ? w * 0.9 : dip ? w * 1.2 : w;
                    c.bezierCurveTo(x, base + h * 1.3, x + ww, base + h * 1.3, x + ww, base);
                    x += ww;
                }
                c.stroke();
                x += ((o.gap ?? 4) + r() * (o.gapVar ?? 5)) * k;
            }
        }
        c.restore();
    }
    Things.scrawl = scrawl;

    // Tree: measured on the reference at 11.8 s. Authored in frame pixels of the 2160² reference,
    // origin at the foot of the trunk (1085, 1690) → logical (502.3, 782.4); 1 logical = 2.16 px,
    // so on the card it is drawn at s = 1.
    const AX = 1085, AY = 1690, K = 1 / 2.16;
    const TREE = {
        back: '#3e6e43', backInk: '#26532b', left: '#60a44f', leftInk: '#3b7437', right: '#6fb35d', rightInk: '#41743b',
        top: '#87bf61', topInk: '#578b40', trunk: '#9a6c48', trunkLine: '#6b4329', grass: '#3f7345', apple: '#c73e42',
        leafLight: '#86bb62', leafMid: '#62a054',
    };
    const map = (pts) => pts.map(([a, b]) => [(a - AX) * K, (b - AY) * K]);
    const sp = (pts, n = 8) => PaperDetail.spline(map(pts), n);
    const hand = (col, seed) => ({ tex: { lVar: 2.5, alpha: [0.2, 0.45] }, inner: (cc, box) => scrawl(cc, box, col, seed) });

    // leaves flying off the crown, card only: { first drawing, per drawing [centre x, y (px), length,
    // width (px), angle] }, measured per drawing (they pop in on odd frames: 11.708, 11.792, 11.875)
    const LEAVES = [
        { from: 11.7, key: 1, at: [[690, 745, 118, 52, 0.56]], col: 'leafLight' },
        { from: 11.7, key: 2, at: [[931, 583, 84, 50, -0.25]], col: 'leafMid' },
        { from: 11.785, key: 3, at: [[1551, 774, 150, 64, -0.52], [1535, 780, 130, 52, -0.58]], col: 'leafMid' },
        { from: 11.785, key: 4, at: [[1295, 560, 80, 36, -0.1], [1290, 577, 80, 32, -0.22]], col: 'leafLight' },
        { from: 11.87, key: 5, at: [[1608, 1070, 118, 52, -0.06]], col: 'leafLight' },
    ];
    // a leaf: a torn lens with one flatter side, marker streaks across it
    const leafShape = [[-52, -4], [-40, -19], [-12, -23], [16, -15], [40, -13], [53, 4], [40, 20], [6, 21], [-26, 14]];

    Things.tree = (g, x, y, s, t) => {
        // the whole drawing breathes a little on twos, like the reference (±1 %)
        const step = Math.floor(t * 12);
        const br = 1 + 0.008 * Math.sin(step * 2.1);
        place(g, 'th-tree', { x: -225, y: -520, w: 450, h: 545 }, (c) => {
            const tcut = (pts, col, seed, o = {}) => cut(c, sp(pts), col, seed, { border: 3, shadow: 0.12, step: 2, ...o });
            // grass patch: a torn lens, horizontal marker streaks
            tcut([[716, 1684], [760, 1667], [830, 1650], [910, 1635], [1000, 1626], [1100, 1622], [1200, 1624], [1300, 1632], [1390, 1648], [1440, 1666], [1458, 1690], [1410, 1702], [1320, 1708], [1200, 1713], [1080, 1715], [960, 1713], [850, 1708], [770, 1700]],
                TREE.grass, 'tgrass', { border: 3.2, tex: { angle: 0, angleVar: 0.05, len: [30, 70], h: [3, 6], lVar: 7, alpha: [0.35, 0.7] } });
            // dark crown behind: shows at the top corners and under the blobs, round the trunk
            tcut([[762, 948], [790, 870], [840, 815], [900, 786], [1000, 772], [1100, 768], [1200, 772], [1300, 786], [1350, 820], [1385, 890], [1400, 1000], [1390, 1150], [1330, 1290], [1235, 1364], [1170, 1377], [1080, 1378], [990, 1370], [930, 1320], [850, 1200], [790, 1060]],
                TREE.back, 'tback', hand(TREE.backInk, 'tbackh'));
            // trunk, behind both lower blobs: only the wedge between them and the foot show
            tcut([[1072, 1120], [1112, 1120], [1132, 1230], [1143, 1300], [1147, 1400], [1150, 1500], [1156, 1585], [1154, 1640], [1142, 1668], [1100, 1678], [1064, 1683], [1036, 1664], [1012, 1634], [1016, 1590], [1022, 1530], [1030, 1450], [1036, 1370], [1040, 1290], [1052, 1200]],
                TREE.trunk, 'ttrunk', { border: 2.6, tex: { angle: Math.PI / 2, angleVar: 0.08, len: [30, 80], h: [4, 8], lVar: 4 } });
            P.markerStroke(c, map([[1088, 1372], [1080, 1450], [1073, 1540], [1068, 1610], [1066, 1662]]), TREE.trunkLine, 3.2, 'ttrunkline', 0.9);
            // left blob, over the trunk (its round edge cuts the trunk's top)
            tcut([[640, 1164], [650, 1105], [680, 1030], [735, 972], [800, 943], [860, 934], [920, 945], [990, 985], [1050, 1040], [1085, 1105], [1100, 1172], [1086, 1226], [1063, 1268], [1036, 1300], [1000, 1328], [950, 1350], [890, 1360], [830, 1356], [770, 1346], [720, 1325], [684, 1292], [656, 1240]],
                TREE.left, 'tleft', hand(TREE.leftInk, 'tlefth'));
            // right blob, over the left blob and the trunk
            tcut([[1060, 1082], [1150, 1040], [1225, 975], [1270, 905], [1310, 850], [1380, 870], [1440, 948], [1490, 1028], [1512, 1080], [1508, 1132], [1486, 1182], [1462, 1224], [1438, 1264], [1402, 1298], [1362, 1330], [1309, 1343], [1253, 1341], [1200, 1320], [1156, 1294], [1130, 1260], [1108, 1215], [1092, 1165], [1077, 1120]],
                TREE.right, 'tright', hand(TREE.rightInk, 'trighth'));
            // light blob in front, crowned by the flower
            tcut([[904, 850], [912, 760], [945, 690], [1000, 648], [1080, 630], [1160, 640], [1230, 680], [1275, 750], [1295, 830], [1290, 905], [1268, 955], [1248, 994], [1220, 1028], [1181, 1050], [1141, 1064], [1099, 1076], [1050, 1070], [995, 1040], [953, 993], [926, 950], [911, 906]],
                TREE.top, 'ttop', hand(TREE.topInk, 'ttoph'));
            // apples: slightly squashed torn circles with a thick white edge
            [[1168, 870, 0.3], [1409, 1000, 1.1], [927, 1023, 2.2], [1292, 1197, 0.7], [771, 1228, 1.7]].forEach(([ax, ay, rot], i) => {
                const pts = Array.from({ length: 9 }, (_, j) => {
                    const a = rot + (j / 9) * Math.PI * 2, rr = 32 * (1 + 0.05 * Math.sin(j * 2.7 + i));
                    return [ax + Math.cos(a) * rr * 1.04, ay + Math.sin(a) * rr * 0.95];
                });
                tcut(pts, TREE.apple, 'tapple' + i, { border: 3.8, borderVar: 0.7, shadow: 0.1, tex: { alpha: [0.2, 0.45] } });
            });
        }, x, y, s * br, 0, 1.2);
        // leaves flying off the crown: each cut once, only moved per drawing (on twos)
        const lt = Math.floor((t - 1 / 24) * 12) / 12 + 1 / 24;
        for (const L of LEAVES) {
            if (lt < L.from || t >= 16) continue;
            const d = Math.min(L.at.length - 1, Math.floor((lt - L.from) * 12 + 1e-6));
            const [px, py, len, wid, ang] = L.at[d];
            const col = TREE[L.col];
            g.save();
            g.translate(x + (px - AX) * K * s, y + (py - AY) * K * s);
            g.rotate(ang);
            g.scale((len / 100) * K * s, (wid / 48) * K * s); // leafShape is 100 × 48 units
            place(g, 'th-tree-leaf' + L.key, { x: -62, y: -34, w: 124, h: 68 }, (c) => {
                cut(c, PaperDetail.spline(leafShape, 3), col, 'tleaf' + L.key, { border: 5, borderVar: 0.6, shadow: 0.1, tex: { angle: 1.25, angleVar: 0.3, len: [20, 44], h: [3, 6], lVar: 8, alpha: [0.35, 0.7] } });
            }, 0, 0, 1, 0, 0.8);
            g.restore();
        }
    };
})();
