// Montage object «rain» (see ../things.js for the contract).
(() => {
    const P = Paper;
    const { place, cut } = Things.kit;
    // Rain: measured on the reference at 13.29 s. Authored in frame pixels of the 2160² reference,
    // origin (1100, 1100) → logical (509.3, 509.3); 1 logical = 2.16 px, so the card draws it at s = 1.
    // A newspaper cloud, ruled-blue drops falling on their own drawings, a green umbrella whose
    // handle the flower holds, a puddle, and splash ticks where drops land.
    const AX = 1100, AY = 1100, K = 1 / 2.16;
    const RAIN = {
        cloud: '#d8d9de', circle: '#eaebf0', bar: '#9c9ca4', barLight: '#b2b2b9', block: '#8c8f98',
        drop: '#63a1d5', dropLine: '#d4e6f6', puddleLine: '#b4d6f5', canopy: '#5fa34f', rib: '#3a7338',
        wood: '#6f5e34', splash: '#62a0d5', splashDark: '#3c6da5',
    };
    const map = (pts) => pts.map(([a, b]) => [(a - AX) * K, (b - AY) * K]);
    const sp = (pts, n = 8) => PaperDetail.spline(map(pts), n);
    const L = (px) => px * K;

    // newsprint as the reference prints it: columns of grey word-bars (rows every 22 px, bars
    // 9 px tall) with a gutter, the odd dark headline block (all frame px, drawn in local units)
    function news(c, box, seed, o = {}) {
        const r = P.rng(seed + ':news');
        const cols = o.cols ?? [520, 598, 768, 938, 1103, 1273, 1438, 1603, 1680];
        for (let k = 0; k < cols.length - 1; k++) {
            const x0 = cols[k], x1 = cols[k + 1];
            // each column a touch lighter or darker, like strips of different pages
            c.fillStyle = PaperDetail.shade(o.base ?? RAIN.cloud, (r() - 0.5) * 3);
            c.fillRect(L(x0 - AX), box.y, L(x1 - x0), box.h);
            for (let y = (o.row0 ?? 102) + r() * 6; y < 700; y += 22) {
                let x = x0 + 9 + r() * 4;
                while (x < x1 - 22) {
                    const w = Math.min(x1 - 20 - x, 12 + r() * 36);
                    if (w > 6) {
                        c.fillStyle = r() < 0.35 ? (o.light ?? RAIN.barLight) : (o.bar ?? RAIN.bar);
                        c.globalAlpha = 0.92 + r() * 0.08;
                        c.fillRect(L(x - AX), L(y - AY), L(w), L(9));
                    }
                    x += w + 5 + r() * 4;
                }
            }
            c.globalAlpha = 1;
        }
        c.fillStyle = RAIN.block;
        for (const [x0, y0, x1, y1] of o.blocks ?? []) c.fillRect(L(x0 - AX), L(y0 - AY), L(x1 - x0), L(y1 - y0));
    }

    // drops: [x, y at drawing 0, fall per drawing, first/last drawing it exists in]
    // measured frame by frame: drawings change at 13.083, 13.208, 13.333, 13.417 s
    const DROPS = [
        [447, 1131, 122, -1, 9], [531, 619, 118, -1, 9], [798, 661, 38, -1, 9], [968, 746, 32, -1, 9],
        [1166, 758, 25, -1, 9], [1349, 694, 40, -1, 9], [1474, 929, 34, -1, 1], [1472, 587, 38, 2, 9],
        [1675, 1322, 118, -1, 1], [1675, 374, 120, 2, 9],
    ];
    const T0 = [314, 317, 320, 322].map((f) => f / 24);
    // splash ticks per drawing: [centre, angle, length, width, colour]
    const d45 = Math.PI / 4;
    const SPLASH = {
        0: [[1426, 1009, d45, 57, 9, 'splash'], [1517, 1011, -d45, 57, 9, 'splash']],
        1: [[1428, 1009, d45, 57, 9, 'splash'], [1517, 1011, -d45, 57, 9, 'splash'], [715, 1515, d45, 60, 15, 'splashDark'], [755, 1502, Math.PI / 2, 54, 15, 'splashDark'], [792, 1516, -d45, 60, 15, 'splashDark']],
        2: [[1118, 869, d45, 55, 9, 'splash'], [1206, 869, -d45, 57, 9, 'splash'], [1387, 1515, d45, 60, 15, 'splashDark'], [1426, 1502, Math.PI / 2, 52, 15, 'splashDark'], [1465, 1516, -d45, 60, 15, 'splashDark']],
        3: [[1117, 869, d45, 55, 9, 'splash'], [922, 897, d45, 55, 9, 'splash'], [1014, 897, -d45, 57, 9, 'splash']],
    };
    const dropShape = [[0, -76], [17, -70], [32, -47], [42, -12], [48, 18], [44, 43], [27, 63], [0, 68], [-28, 63], [-43, 46], [-48, 18], [-43, -17], [-30, -47], [-16, -70]];

    Things.rain = (g, x, y, s, t) => {
        // drawing index: 3 frames per drawing on the card; in the heart the drops loop
        const heart = t >= 16;
        let n = T0.reduce((a, tt, i) => (t >= tt - 1e-3 ? i : a), -1);
        if (heart) n = Math.floor((t - 16) * 12);
        const at = (px, py) => [x + (px - AX) * K * s, y + (py - AY) * K * s];
        // drops first: they come out from behind the cloud and go behind the umbrella
        for (const [i, [dx, dy0, v, from, to]] of DROPS.entries()) {
            if (!heart && (n < from || n > to)) continue;
            // the heart's miniature keeps three drops looping between the cloud and the umbrella
            if (heart && ![1, 3, 5].includes(i)) continue;
            let dy = dy0 + v * n;
            if (heart) dy = 560 + ((((dy - 560) % 600) + 600) % 600);
            const [px, py] = at(dx, dy);
            place(g, 'th-rain-drop' + (i % 2), { x: -36, y: -46, w: 72, h: 82 }, (c) => {
                cut(c, PaperDetail.spline(dropShape.map(([a, b]) => [a * K, b * K]), 6), RAIN.drop, 'rdrop' + (i % 2), { border: 4.4, borderVar: 0.6, shadow: 0.1, tex: { lVar: 3, alpha: [0.2, 0.4] }, inner: (cc) => {
                    cc.strokeStyle = RAIN.dropLine;
                    cc.lineWidth = L(3.2);
                    cc.globalAlpha = 0.9;
                    for (const ly of [-59, -33, -9, 17, 44]) (cc.beginPath(), cc.moveTo(L(-60), L(ly)), cc.lineTo(L(27), L(ly)), cc.stroke());
                    cc.globalAlpha = 1;
                } });
            }, px, py, s, 0, 1.3);
        }
        // the newspaper cloud, with its pasted photo circle
        place(g, 'th-rain-cloud', { x: -300, y: -470, w: 580, h: 270 }, (c) => {
            cut(c, sp([[520, 600], [518, 503], [540, 416], [566, 336], [610, 305], [672, 290], [742, 262], [751, 226], [766, 192], [808, 152], [863, 128], [915, 110], [969, 102], [1025, 112], [1071, 136], [1110, 168], [1147, 178], [1200, 158], [1265, 149], [1328, 158], [1381, 190], [1424, 236], [1448, 295], [1500, 318], [1575, 336], [1631, 416], [1657, 508], [1652, 580], [1644, 605], [1560, 612], [1468, 618], [1357, 624], [1283, 627], [1184, 632], [1071, 622], [965, 622], [850, 622], [769, 620], [676, 614], [590, 606]], 6),
                RAIN.cloud, 'rcloud', { border: 4.6, borderVar: 0.6, shadow: 0.1, step: 2, tex: false, inner: (cc, box) => news(cc, box, 'rcloud', { blocks: [[787, 247, 927, 280], [947, 240, 1091, 273], [784, 540, 927, 573], [1277, 160, 1413, 200], [727, 247, 760, 282]] }) });
            cut(c, sp(Array.from({ length: 10 }, (_, j) => {
                const a = (j / 10) * Math.PI * 2, rr = 124 * (1 + 0.025 * Math.sin(j * 2.3));
                return [925 + Math.cos(a) * rr, 382 + Math.sin(a) * rr];
            }), 6), RAIN.circle, 'rphoto', { border: 2.6, shadow: 0.08, tex: false, inner: (cc, box) => news(cc, box, 'rphoto', { base: RAIN.circle, bar: RAIN.barLight, light: '#c8c9ce', cols: [790, 860, 940, 1000, 1070], row0: 265 }) });
        }, x, y, s, 0, 1.2);
        // the puddle under the flower: ruled blue paper
        place(g, 'th-rain-puddle', { x: -200, y: 205, w: 400, h: 64 }, (c) => {
            cut(c, sp([[688, 1603], [720, 1590], [780, 1576], [860, 1568], [960, 1563], [1060, 1561], [1160, 1562], [1260, 1566], [1350, 1574], [1420, 1586], [1472, 1604], [1430, 1622], [1350, 1640], [1250, 1652], [1150, 1657], [1050, 1658], [950, 1655], [850, 1648], [770, 1636], [715, 1620]], 6),
                RAIN.drop, 'rpuddle', { border: 4.2, shadow: 0.08, step: 2, tex: { angle: 0, angleVar: 0.05, lVar: 3, alpha: [0.2, 0.4] }, inner: (cc) => {
                    cc.strokeStyle = RAIN.puddleLine;
                    cc.lineWidth = L(3.4);
                    cc.globalAlpha = 0.85;
                    for (const ly of [1585, 1609, 1633]) (cc.beginPath(), cc.moveTo(L(690 - AX), L(ly - AY)), cc.lineTo(L(1440 - AX), L(ly - AY)), cc.stroke());
                    cc.globalAlpha = 1;
                } });
        }, x, y, s, 0, 1.2);
        // the umbrella: wooden tip and handle behind the canopy, dark ribs on it
        place(g, 'th-rain-umbrella', { x: -225, y: -135, w: 440, h: 360 }, (c) => {
            cut(c, sp([[1105, 834], [1122, 845], [1130, 868], [1128, 892], [1084, 892], [1083, 866], [1090, 845]], 4), RAIN.wood, 'rtip', { border: 2, shadow: 0.1 });
            cut(c, P.noodle(PaperDetail.spline(map([[1106, 1060], [1085, 1250], [1060, 1400], [1040, 1500], [1042, 1540], [1030, 1562], [1008, 1556], [998, 1532]]), 6, false), L(17)), RAIN.wood, 'rhandle', { border: 2, shadow: 0.12, tex: { angle: Math.PI / 2, lVar: 4 } });
            cut(c, sp([[668, 1160], [672, 1122], [696, 1075], [735, 1021], [790, 970], [853, 936], [903, 913], [952, 902], [1024, 894], [1094, 885], [1162, 880], [1241, 896], [1321, 917], [1375, 937], [1431, 971], [1486, 1021], [1520, 1070], [1538, 1120], [1548, 1168], [1512, 1142], [1478, 1114], [1450, 1104], [1400, 1112], [1356, 1136], [1325, 1152], [1290, 1134], [1250, 1120], [1200, 1106], [1160, 1112], [1105, 1098], [1050, 1096], [985, 1118], [936, 1112], [870, 1100], [822, 1102], [789, 1113], [744, 1113], [711, 1136]], 4),
                RAIN.canopy, 'rcanopy', { border: 3.8, borderVar: 0.6, shadow: 0.12, step: 2, tex: { angle: -0.08, angleVar: 0.1, len: [30, 90], h: [4, 9], lVar: 7, alpha: [0.35, 0.7] }, inner: (cc) => {
                    for (const [k, rib] of [
                        [[742, 1102], [878, 1030], [1000, 980], [1106, 941]],
                        [[944, 1119], [1022, 1047], [1067, 991], [1106, 941]],
                        [[1106, 886], [1107, 990], [1108, 1097]],
                        [[1106, 947], [1156, 991], [1200, 1036], [1280, 1133]],
                        [[1106, 947], [1222, 997], [1311, 1036], [1472, 1102]],
                    ].entries()) P.markerStroke(cc, PaperDetail.spline(map(rib), 5, false), RAIN.rib, L(12), 'rrib' + k, 0.75);
                } });
        }, x, y, s, 0, 1.2);
        // splash ticks where the drops land (umbrella top and puddle rims), per drawing
        for (const [px, py, ang, len, wid, col] of (!heart && SPLASH[n]) || []) {
            const [cx, cy] = [px - AX, py - AY], ex = (Math.cos(ang) * len) / 2, ey = (Math.sin(ang) * len) / 2;
            P.markerStroke(g, [[cx - ex, cy - ey], [cx + ex, cy + ey]].map(([a, b]) => [x + a * K * s, y + b * K * s]), RAIN[col], L(wid) * s, 'rsplash' + px, 0.95);
        }
    };
})();
