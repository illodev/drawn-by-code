// Montage object «tea» (see ../things.js for the contract).
// Measured on the reference at 15.42 s in full-resolution pixels (2160² frame), origin
// O = (1080, 1512) = logical (500, 700); CARDS s = 1/2.16. The flower sits IN the cup, so
// the cup has two layers: Things.tea.back (inside of the cup: back wall and tea) goes under
// the flower and Things.tea.front (saucer, handle, cup wall, red band, gold lip, tea bag,
// steam) over it. Things.tea draws both in the heart, only the front on the card.
(() => {
    const P = Paper, D = PaperDetail;
    const { place } = Things.kit;
    const K = () => Things.kitD;
    const OX = 1080, OY = 1512;
    const o = (pts) => pts.map(([x, y]) => [x - OX, y - OY]);
    const COL = { cream: '#f2e9d6', wall: '#ddd2c0', tea: '#8d5a34', red: '#c4383f', gold: '#b8912f', saucer: '#43ab98', tag: '#f7e59e', heart: '#d23a3c', ink: '#5d4f45', string: '#58545a', paper: '#fbf6ee', steam: '#ede3e0' };
    const cut = (c, pts, col, seed, x = {}) => P.cutout(c, pts, col, seed, { border: 7, borderVar: 0.45, jag: 1.4, step: 3, shadow: 0.1, paper: COL.paper, tex: { lVar: 1.6, sVar: 1.5, alpha: [0.1, 0.24], len: [30, 90], h: [8, 16] }, ...x });
    const sp = (pts, n = 6) => o(K().cspline(pts, n));
    const BOX = { x: 420 - OX, y: 1150 - OY, w: 1320, h: 720 };
    const writing = (cc, box, seed) => K().hand(cc, box, COL.ink, seed, { lineH: 49, size: 12.5, width: 2.9, first: 36 });

    function back(g, x, y, s) {
        place(g, 'th-tea-back', { x: 660 - OX, y: 1170 - OY, w: 850, h: 170 }, (c) => {
            // inside of the cup: the back wall (greyer cream) and the tea surface in it
            cut(c, sp([[686, 1248], [740, 1224], [850, 1208], [1000, 1198], [1150, 1196], [1300, 1200], [1400, 1204], [1452, 1216], [1478, 1245], [1400, 1290], [1083, 1318], [760, 1290]]), COL.wall, 'tea-wall', { border: 6, tex: { alpha: [0.08, 0.16] } });
            cut(c, sp([[742, 1264], [790, 1240], [900, 1226], [1080, 1218], [1250, 1216], [1350, 1220], [1415, 1240], [1426, 1264], [1300, 1292], [1083, 1306], [850, 1292]]), COL.tea, 'tea-tea', { border: 0, shadow: 0.12, tex: { alpha: [0.2, 0.45], lVar: 5, len: [20, 60] } });
        }, x, y, s, 0, 0.54);
    }
    // steam: three cream paper strips rising and bending, redrawn on every drawing (on twos)
    const STEAM = [
        [[[885, 675], [910, 730], [900, 770], [870, 810]], [[1038, 625], [1060, 660], [1100, 710], [1115, 760]], [[1285, 680], [1255, 720], [1248, 760], [1275, 815]]],
        [[[835, 400], [870, 460], [905, 500], [918, 540], [905, 580], [875, 615]], [[1060, 340], [1030, 380], [1020, 430], [1045, 475], [1075, 510], [1095, 560]], [[1310, 400], [1300, 440], [1260, 490], [1230, 540], [1235, 580], [1260, 615]]],
        [[[840, 400], [825, 450], [850, 500], [890, 545], [915, 590], [910, 630], [875, 675]], [[1115, 355], [1080, 400], [1040, 450], [1045, 500], [1080, 550], [1115, 620]], [[1300, 405], [1325, 450], [1320, 500], [1280, 540], [1250, 600], [1255, 650], [1270, 675]]],
    ];
    function front(g, x, y, s, t) {
        // steam and the tea bag belong to the card; the heart's miniature is the bare cup
        const onCard = t >= 15.25 && t < 15.5, d = onCard ? Math.min(2, K().drawing(t, 15.25)) : 2;
        if (onCard) place(g, 'th-tea-steam' + d, { x: 780 - OX, y: 300 - OY, w: 600, h: 560 }, (c) => {
            STEAM[d].forEach((line, k) => cut(c, K().strip(o(line), line.map(() => 11)), COL.steam, 'steam' + d + k, { border: 3.4, borderVar: 0.3, jag: 0.9, step: 2.5, shadow: 0.06, tex: { alpha: [0.08, 0.16] } }));
        }, x, y, s, 0, 0.54);
        place(g, 'th-tea-front', BOX, (c) => {
            // saucer: a torn teal oval, flatter on the left
            cut(c, sp([[466, 1717], [478, 1699], [540, 1672], [598, 1646], [670, 1630], [740, 1624], [800, 1621], [1000, 1614], [1200, 1612], [1413, 1628], [1539, 1637], [1620, 1660], [1667, 1684], [1697, 1716], [1687, 1734], [1632, 1771], [1539, 1794], [1395, 1812], [1324, 1826], [1193, 1826], [1034, 1836], [880, 1831], [695, 1817], [600, 1797], [529, 1777], [476, 1742]]), COL.saucer, 'tea-saucer', { tex: { alpha: [0.25, 0.5], lVar: 4, len: [40, 110], h: [10, 18] } });
            // handle: a thick C of the same written paper, behind the cup
            cut(c, K().strip(o([[1455, 1275], [1532, 1291], [1598, 1333], [1622, 1395], [1616, 1456], [1582, 1505], [1530, 1537]]), [66, 66, 66, 70, 70, 66, 62]), COL.cream, 'tea-handle', { inner: (cc, box) => writing(cc, box, 'hw-handle') });
            // the cup wall, its top edge is the front lip of the opening
            cut(c, sp([[686, 1245], [760, 1277], [860, 1298], [960, 1311], [1060, 1316], [1160, 1312], [1260, 1303], [1360, 1286], [1430, 1265], [1471, 1243], [1468, 1300], [1464, 1370], [1459, 1440], [1447, 1500], [1430, 1550], [1408, 1598], [1375, 1638], [1330, 1664], [1275, 1685], [1200, 1700], [1100, 1708], [1000, 1703], [930, 1692], [870, 1668], [818, 1636], [778, 1600], [750, 1560], [728, 1510], [714, 1450], [700, 1370], [692, 1300]], 5), COL.cream, 'tea-cup', {
                inner: (cc) => writing(cc, { x: 660 - OX, y: 1250 - OY, w: 840, h: 460 }, 'hw-cup'),
            });
            // red band glued round the cup
            cut(c, sp([[690, 1377], [800, 1373], [1000, 1372], [1200, 1375], [1400, 1374], [1463, 1375], [1462, 1420], [1459, 1468], [1400, 1470], [1300, 1471], [1100, 1468], [900, 1470], [705, 1470], [694, 1420]], 4), COL.red, 'tea-band', { border: 4.5, tex: { angle: 0, alpha: [0.25, 0.5], lVar: 5, len: [40, 120], h: [8, 14] } });
            // gold lip along the front edge of the opening
            cut(c, K().strip(o([[684, 1244], [760, 1274], [860, 1296], [960, 1309], [1060, 1313], [1160, 1309], [1260, 1300], [1360, 1283], [1430, 1263], [1478, 1242]]), [10, 11, 12, 12, 12, 12, 12, 12, 11, 10]), COL.gold, 'tea-gold', { border: 0, shadow: 0.08, jag: 0.6, tex: { angle: 0, alpha: [0.3, 0.55], lVar: 7, len: [20, 60], h: [3, 6] } });
        }, x, y, s, 0, 0.54);
        // tea bag: the string from the tea over the lip, the tag with a heart
        if (onCard) place(g, 'th-tea-bag', { x: 1220 - OX, y: 1240 - OY, w: 210, h: 440 }, (c) => {
            K().line(c, o([[1236, 1256], [1270, 1282], [1300, 1306], [1318, 1380], [1334, 1460], [1352, 1552]]), COL.string, 3.4, 0.9);
            cut(c, o([[1313, 1549], [1411, 1557], [1405, 1661], [1304, 1652]]), COL.tag, 'tea-tag', { border: 4, tex: { alpha: [0.15, 0.3] }, inner: (cc) => {
                const hx = 1360 - OX, hy = 1606 - OY;
                cc.save();
                cc.translate(hx, hy);
                cc.rotate(0.06);
                cc.scale(1.22, 1.3);
                cc.beginPath();
                cc.moveTo(0, 26);
                cc.bezierCurveTo(-34, 2, -32, -26, -14, -27);
                cc.bezierCurveTo(-5, -27, -1, -20, 0, -14);
                cc.bezierCurveTo(1, -20, 5, -27, 14, -27);
                cc.bezierCurveTo(32, -26, 34, 2, 0, 26);
                cc.closePath();
                cc.strokeStyle = COL.heart;
                cc.lineWidth = 6.5;
                cc.lineJoin = 'round';
                cc.stroke();
                cc.restore();
            } });
        }, x, y, s, 0, 0.54);
    }
    // On the card the montage draws the cup after the flower ('under'), so Things.tea draws
    // only the front there: the inside of the cup must go under the flower, through
    // Things.tea.back (the montage calls it before the flower when it exists).
    Things.tea = (g, x, y, s, t) => {
        if (!(t >= 15.25 && t < 15.5)) back(g, x, y, s, t);
        front(g, x, y, s, t);
    };
    Things.tea.back = back;
    Things.tea.front = front;
})();
