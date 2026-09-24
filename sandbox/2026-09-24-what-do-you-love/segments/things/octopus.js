// Montage object «octopus» (see ../things.js for the contract).
// Also defines Things.kitD: small helpers shared by octopus, tea, flowers and cat (tapered
// strips for tentacles/stems/tails, a pose "curl", topographic rings, dashed lines).
(() => {
    const P = Paper, D = PaperDetail;
    const { place } = Things.kit;

    // ------------------------------------------------------------------ shared helpers
    // Centripetal Catmull-Rom through control points: like PaperDetail.spline but it never
    // overshoots at a corner between a long and a short segment (cup rims, bands, tags).
    function cspline(pts, n = 8, closed = true) {
        const out = [], m = pts.length;
        const get = (i) => (closed ? pts[((i % m) + m) % m] : pts[Math.max(0, Math.min(m - 1, i))]);
        const last = closed ? m : m - 1;
        const lerp = (a, b, ta, tb, t) => { const k = tb - ta < 1e-6 ? 0 : (t - ta) / (tb - ta); return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k]; };
        for (let i = 0; i < last; i++) {
            let p0 = get(i - 1), p1 = get(i), p2 = get(i + 1), p3 = get(i + 2);
            if (!closed && i === 0) p0 = [2 * p1[0] - p2[0], 2 * p1[1] - p2[1]];
            if (!closed && i === last - 1) p3 = [2 * p2[0] - p1[0], 2 * p2[1] - p1[1]];
            const t0 = 0, t1 = t0 + Math.sqrt(Math.hypot(p1[0] - p0[0], p1[1] - p0[1])) + 1e-4;
            const t2 = t1 + Math.sqrt(Math.hypot(p2[0] - p1[0], p2[1] - p1[1])) + 1e-4, t3 = t2 + Math.sqrt(Math.hypot(p3[0] - p2[0], p3[1] - p2[1])) + 1e-4;
            for (let k = 0; k < n; k++) {
                const t = t1 + ((t2 - t1) * k) / n;
                const a1 = lerp(p0, p1, t0, t1, t), a2 = lerp(p1, p2, t1, t2, t), a3 = lerp(p2, p3, t2, t3, t);
                const b1 = lerp(a1, a2, t0, t2, t), b2 = lerp(a2, a3, t1, t3, t);
                out.push(lerp(b1, b2, t1, t2, t));
            }
        }
        if (!closed) out.push(pts[m - 1]);
        return out;
    }
    // Centreline (Catmull-Rom through ctrl) → evenly spaced points with a width per point
    // (widths given per control point, interpolated along the curve).
    function centre(ctrl, widths, n = 8) {
        const pts = D.spline(ctrl, n, false);
        const ws = pts.map((_, i) => {
            const u = Math.min(ctrl.length - 1, i / n), k = Math.floor(u), f = u - k;
            return widths[k] + ((widths[Math.min(k + 1, widths.length - 1)] ?? widths[k]) - widths[k]) * f;
        });
        return { pts, ws };
    }
    // Tapered strip along a centreline with round caps: tentacles, stems, tails.
    function strip(ctrl, widths, n = 8) {
        const { pts, ws } = centre(ctrl, widths, n);
        const m = pts.length, L = [], R = [], T = [];
        for (let i = 0; i < m; i++) {
            const a = pts[Math.max(0, i - 1)], b = pts[Math.min(m - 1, i + 1)];
            const d = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1, tx = (b[0] - a[0]) / d, ty = (b[1] - a[1]) / d;
            T.push([tx, ty]);
            L.push([pts[i][0] - ty * ws[i] / 2, pts[i][1] + tx * ws[i] / 2]);
            R.push([pts[i][0] + ty * ws[i] / 2, pts[i][1] - tx * ws[i] / 2]);
        }
        const cap = (p, t, w, dir) => Array.from({ length: 11 }, (_, k) => {
            const th = ((k + 1) / 12) * Math.PI, nx = -t[1] * dir, ny = t[0] * dir;
            return [p[0] + w * (Math.cos(th) * nx + Math.sin(th) * t[0] * dir), p[1] + w * (Math.cos(th) * ny + Math.sin(th) * t[1] * dir)];
        });
        return [...L, ...cap(pts[m - 1], T[m - 1], ws[m - 1] / 2, 1), ...R.reverse(), ...cap(pts[0], T[0], ws[0] / 2, -1)];
    }
    // Pose variation of a centreline: bends the turning angles after control point `from`
    // by factor k (k < 1 uncurls, k > 1 curls tighter), keeping segment lengths.
    function curl(ctrl, k, from = 1) {
        if (k === 1) return ctrl;
        const out = ctrl.slice(0, from + 1).map((p) => [...p]);
        let ang = Math.atan2(ctrl[from][1] - ctrl[from - 1][1], ctrl[from][0] - ctrl[from - 1][0]);
        for (let i = from + 1; i < ctrl.length; i++) {
            const a0 = Math.atan2(ctrl[i - 1][1] - ctrl[i - 2][1], ctrl[i - 1][0] - ctrl[i - 2][0]);
            const a1 = Math.atan2(ctrl[i][1] - ctrl[i - 1][1], ctrl[i][0] - ctrl[i - 1][0]);
            let da = a1 - a0;
            while (da > Math.PI) da -= 2 * Math.PI;
            while (da < -Math.PI) da += 2 * Math.PI;
            ang += da * k;
            const l = Math.hypot(ctrl[i][0] - ctrl[i - 1][0], ctrl[i][1] - ctrl[i - 1][1]), q = out[i - 1];
            out.push([q[0] + Math.cos(ang) * l, q[1] + Math.sin(ang) * l]);
        }
        return out;
    }
    // Topographic contour rings: wobbly closed loops around (cx, cy), radii [[rx, ry], …].
    function rings(c, cx, cy, radii, color, seed, o = {}) {
        const r = P.rng(seed);
        c.save();
        c.strokeStyle = color;
        c.lineWidth = o.width ?? 2;
        c.globalAlpha = o.alpha ?? 0.8;
        c.lineJoin = 'round';
        for (const [rx, ry] of radii) {
            const ph = r() * 6, amp = o.wobble ?? 0.12, ox = (r() - 0.5) * rx * 0.2, oy = (r() - 0.5) * ry * 0.2;
            const k1 = 2 + Math.floor(r() * 2), k2 = 4 + Math.floor(r() * 3), ph2 = r() * 6;
            const pts = Array.from({ length: 64 }, (_, i) => {
                const a = (i / 64) * Math.PI * 2, f = 1 + amp * Math.sin(a * k1 + ph) + amp * 0.5 * Math.sin(a * k2 + ph2);
                return [cx + ox + Math.cos(a) * rx * f, cy + oy + Math.sin(a) * ry * f];
            });
            P.tracePath(c, D.spline(pts, 3));
            c.stroke();
        }
        c.restore();
    }
    // Open wobbly line (rivers, stripes of scribble) through control points.
    function line(c, pts, color, width, alpha = 1, dash = null) {
        c.save();
        c.strokeStyle = color;
        c.lineWidth = width;
        c.globalAlpha = alpha;
        c.lineCap = dash ? 'butt' : 'round';
        c.lineJoin = 'round';
        if (dash) c.setLineDash(dash);
        const s = pts.length > 2 ? D.spline(pts, 8, false) : pts;
        c.beginPath();
        s.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
        c.stroke();
        c.restore();
    }
    // Cursive handwriting texture: rows of words made of little arches (m, n), the odd tall
    // loop (h, l) and descender (j, y). box in local units; o.lineH row spacing, o.size arch
    // height, o.width stroke, o.first baseline of the first row.
    function hand(c, box, color, seed, o = {}) {
        const r = P.rng(seed), lh = o.lineH ?? 50, sz = o.size ?? 11, aw = sz * 0.85;
        c.save();
        c.strokeStyle = color;
        c.lineWidth = o.width ?? 2.6;
        c.globalAlpha = o.alpha ?? 0.9;
        c.lineCap = 'round';
        c.lineJoin = 'round';
        for (let y = box.y + (o.first ?? lh * 0.6); y < box.y + box.h + sz; y += lh) {
            let x = box.x - r() * 30;
            while (x < box.x + box.w) {
                const n = 2 + Math.floor(r() * 4);
                c.beginPath();
                c.moveTo(x, y);
                for (let k = 0; k < n; k++) {
                    const roll = r(), w = aw * (0.85 + r() * 0.35);
                    const h = roll < 0.12 ? sz * (2.1 + r() * 0.5) : roll < 0.2 ? -sz * (1.5 + r() * 0.4) : sz * (0.9 + r() * 0.25);
                    c.bezierCurveTo(x - w * 0.05, y - h * 1.33, x + w * 1.05, y - h * 1.33, x + w, y);
                    x += w;
                }
                c.stroke();
                x += sz * (0.9 + r() * 1.3);
            }
        }
        c.restore();
    }
    // Stepped time of the drawing on twos inside a card: 0, 1, 2… (12 drawings per second)
    const drawing = (t, t0) => Math.max(0, Math.floor((t - t0) * 12 + 1e-6));
    Things.kitD = { cspline, centre, strip, curl, rings, line, hand, drawing };

    // ------------------------------------------------------------------ the octopus
    // Measured on the reference at 15.17 s (drawing 3 of the card) in full-resolution pixels
    // (2160² frame), origin O = (1296, 1296) = logical (600, 600); CARDS s = 1/2.16.
    // Cut from a map painted lilac: contour rings, red dashed borders, blue rivers.
    const O = 1296;
    const COL = { light: '#b08ecf', dark: '#9c78bd', sucker: '#ecdcf5', paper: '#fbf6ee', cheek: '#e4898a', eye: '#f9f8ec', pupil: '#1f1a22', topo: '#8866a8', dash: '#c44c62', river: '#5b87b3' };
    const o = (pts) => pts.map(([x, y]) => [x - O, y - O]);
    // tentacles: [name, colour, centreline, widths, suckers, pose per drawing, curl from].
    // A pose is a curl factor on the measured centreline (drawing 3), or its own
    // { c: centreline, w: widths } when the reference redraws the tentacle differently.
    const T1D1 = { c: [[1000, 1330], [945, 1270], [895, 1190], [850, 1110], [815, 1050], [795, 1000], [805, 968], [830, 962], [838, 985], [830, 1015], [824, 1035]], w: [85, 75, 66, 60, 56, 50, 42, 34, 28, 22, 16] };
    const T5D1 = { c: [[1450, 1350], [1470, 1420], [1500, 1500], [1525, 1580], [1538, 1660], [1535, 1740], [1505, 1792], [1455, 1808], [1410, 1795], [1392, 1775]], w: [95, 90, 80, 70, 62, 56, 46, 40, 34, 26] };
    // in the heart (no flower to reach for) the raised tentacle hangs down and curls
    const T1H = { c: [[1000, 1320], [920, 1330], [840, 1370], [780, 1430], [755, 1500], [770, 1550], [805, 1560], [820, 1530]], w: [85, 78, 70, 62, 52, 40, 30, 20] };
    const T4BD = { c: [[1490, 1380], [1515, 1480], [1535, 1580], [1550, 1660], [1575, 1712], [1610, 1705], [1625, 1670], [1622, 1645]], w: [80, 75, 65, 55, 50, 44, 36, 26] };
    const TENT = [
        ['t1', 'light', [[1010, 1330], [928, 1272], [876, 1187], [830, 1097], [793, 1048], [773, 1000], [792, 958], [845, 938], [895, 960], [908, 1000], [893, 1040], [860, 1054], [832, 1044], [814, 1020]],
            [90, 80, 78, 68, 64, 62, 56, 52, 47, 42, 32, 26, 20, 14], [[900, 1180], [973, 1280]], [T1D1, 0.95, 1, T1H], 3],
        ['t3', 'dark', [[1120, 1340], [1110, 1420], [1095, 1500], [1082, 1580], [1068, 1650], [1055, 1720], [1068, 1785], [1100, 1814], [1140, 1815], [1175, 1798], [1198, 1776]],
            [110, 110, 106, 100, 86, 60, 48, 42, 38, 30, 22], [[1165, 1387], [1130, 1458], [1108, 1527]], [1.3, 1, 1, 1], 4],
        ['t4', 'dark', [[1350, 1370], [1365, 1440], [1395, 1530], [1430, 1610], [1465, 1670], [1495, 1715], [1510, 1728]],
            [100, 97, 88, 74, 50, 30, 16], [[1375, 1395], [1395, 1460], [1420, 1520]], [1, 1, 1, 1], 3],
        ['t4b', 'dark', [[1490, 1380], [1520, 1480], [1550, 1570], [1580, 1630], [1590, 1670], [1580, 1700]],
            [80, 75, 65, 52, 40, 26], [], [T4BD, T4BD, 1, 1], 3],
        ['t6', 'dark', [[1560, 1320], [1637, 1390], [1695, 1449], [1743, 1510], [1767, 1558], [1752, 1610], [1720, 1632], [1690, 1625], [1672, 1605], [1668, 1585]],
            [90, 85, 80, 70, 55, 44, 40, 34, 28, 20], [[1533, 1337], [1587, 1378], [1635, 1423]], [1, 1.35, 1, 1], 3],
        ['t2', 'light', [[1080, 1300], [992, 1355], [894, 1451], [845, 1517], [830, 1570], [840, 1610], [866, 1627], [895, 1630], [916, 1614], [925, 1590]],
            [95, 85, 70, 62, 50, 42, 38, 34, 28, 20], [[1065, 1335], [1013, 1378], [962, 1422]], [1, 1.4, 1, 1], 3],
        ['t3b', 'light', [[1250, 1360], [1239, 1420], [1215, 1500], [1175, 1580], [1148, 1640], [1110, 1690], [1060, 1715], [1018, 1714], [988, 1695], [973, 1665], [975, 1640]],
            [100, 96, 86, 72, 62, 52, 44, 40, 34, 26, 18], [[1220, 1395], [1200, 1460], [1177, 1520]], [1.4, 1, 1, 1], 3],
        ['t5', 'light', [[1450, 1350], [1470, 1420], [1500, 1500], [1525, 1580], [1540, 1650], [1545, 1710], [1520, 1752], [1480, 1762], [1445, 1745], [1438, 1712], [1455, 1692], [1475, 1695], [1478, 1710]],
            [95, 90, 80, 70, 62, 56, 46, 40, 36, 30, 24, 18, 12], [[1433, 1388], [1465, 1457], [1487, 1528]], [T5D1, 0.85, 1, 1], 4],
    ];
    // the map printed on the paper (world coordinates), piece by piece: contour rings, red
    // dashed borders, blue rivers
    function map(c, piece) {
        const ring = (x, y, radii, seed) => rings(c, x - O, y - O, radii, COL.topo, seed, { width: 2.2, alpha: 0.75, wobble: 0.1 });
        const dash = (pts) => line(c, o(pts), COL.dash, 4.2, 0.9, [15, 10]);
        const river = (pts) => line(c, o(pts), COL.river, 3.6, 0.85);
        ({
            head: () => {
                ring(1450, 828, [[30, 21], [62, 40], [96, 58], [124, 74]], 'om1');
                ring(1077, 1267, [[27, 22], [55, 42], [78, 62]], 'om2');
                dash([[1036, 882], [1120, 802], [1200, 822], [1282, 841], [1330, 802], [1415, 740], [1470, 747], [1510, 764]]);
            },
            t1: () => {
                ring(900, 965, [[40, 32], [66, 56]], 'om8');
                dash([[735, 992], [810, 980], [874, 966], [930, 961]]);
                river([[828, 1176], [846, 1184], [874, 1208], [902, 1244], [922, 1268], [942, 1282], [958, 1282], [976, 1262]]);
            },
            t2: () => {
                dash([[965, 1310], [1062, 1296], [1110, 1298]]);
                river([[822, 1482], [860, 1497], [890, 1520]]);
            },
            t3: () => {
                ring(1150, 1380, [[45, 30], [80, 60], [112, 92]], 'om5');
                river([[1020, 1610], [1055, 1592], [1080, 1600], [1110, 1630]]);
            },
            t3b: () => {
                ring(1235, 1470, [[24, 26], [44, 54], [66, 82]], 'om3');
                dash([[1215, 1392], [1280, 1437], [1300, 1440]]);
                river([[1110, 1622], [1150, 1630], [1172, 1642], [1195, 1646]]);
            },
            t4: () => {
                ring(1410, 1640, [[40, 30], [70, 58], [100, 86]], 'om6');
                dash([[1300, 1440], [1315, 1435], [1400, 1387], [1450, 1375]]);
                river([[1320, 1492], [1370, 1485], [1425, 1482]]);
            },
            t4b: () => river([[1560, 1624], [1610, 1622]]),
            t5: () => {
                ring(1488, 1445, [[22, 30], [46, 58], [72, 90]], 'om4');
                river([[1488, 1592], [1505, 1620], [1530, 1652], [1580, 1655]]);
            },
            t6: () => {
                ring(1655, 1430, [[50, 40], [85, 70], [120, 100]], 'om7');
                dash([[1545, 1296], [1600, 1297], [1640, 1305]]);
                river([[1745, 1455], [1720, 1490], [1698, 1518]]);
            },
        })[piece]();
    }
    const cut = (c, pts, col, seed, x = {}) => P.cutout(c, pts, col, seed, { border: 8.5, borderVar: 0.4, jag: 1.5, step: 3, shadow: 0.1, paper: COL.paper, tex: { lVar: 1.2, sVar: 1.2, alpha: [0.08, 0.18], len: [30, 80], h: [8, 16] }, ...x });
    function drawOcto(c, d) {
        for (const [name, tone, ctrl, widths, dots, poses, from] of TENT) {
            const pose = poses[d];
            const pts = typeof pose === 'number' ? strip(o(curl(ctrl, pose, from)), widths) : strip(o(pose.c), pose.w);
            cut(c, pts, COL[tone], 'oct-' + name, { inner: (cc) => {
                map(cc, name);
                for (const [x, y] of dots) P.cutout(cc, P.ellipse(x - O, y - O, 12.5, 12.5, 28), COL.sucker, 'sk' + x + y, { border: 0, shadow: 0, jag: 0.5, tex: false });
            } });
        }
        // head: an egg, on top of every tentacle
        cut(c, o(D.spline([[1267, 698], [1321, 704], [1375, 704], [1420, 717], [1467, 745], [1505, 779], [1540, 825], [1566, 866], [1587, 915], [1599, 983], [1602, 1062], [1597, 1130], [1588, 1187], [1563, 1260], [1509, 1335], [1440, 1370], [1360, 1384], [1280, 1388], [1206, 1378], [1152, 1361], [1105, 1333], [1070, 1300], [1044, 1262], [1024, 1200], [1010, 1145], [1004, 1080], [1004, 1010], [1015, 930], [1040, 870], [1080, 805], [1140, 750], [1200, 714]], 6)), COL.light, 'oct-head', { inner: (cc) => map(cc, 'head') });
        // eyes: cream paper, pupils looking up at the flower, a catch-light each
        for (const [ex, ey, rx, ry, px, py] of [[1196, 1019, 54, 63, 1201, 1011], [1405, 1021, 55, 61, 1414, 1009]]) {
            P.cutout(c, o(P.ellipse(ex, ey, rx, ry, 40)), COL.eye, 'oeye' + ex, { border: 2.5, borderVar: 0.8, paper: COL.eye, shadow: 0.08, jag: 1.8, step: 3, tex: false });
            P.cutout(c, o(P.ellipse(px, py, 22, 21, 30)), COL.pupil, 'opup' + ex, { border: 0, shadow: 0, jag: 0.6, step: 2, tex: false });
            c.fillStyle = '#fff';
            c.beginPath();
            c.arc(px + 11 - O, py - 12 - O, 6, 0, Math.PI * 2);
            c.fill();
        }
        // cheeks
        for (const [cx, cy] of [[1107, 1125], [1490, 1130]]) cut(c, o(P.ellipse(cx, cy, 31, 31, 40)), COL.cheek, 'ocheek' + cx, { border: 4, tex: { alpha: [0.15, 0.3], lVar: 3 } });
    }
    Things.octopus = (g, x, y, s, t) => {
        // replacement animation on twos: three poses of the tentacles (the card lasts 3 drawings)
        const d = t < 15.25 ? Math.min(2, drawing(t, 15)) : 3;
        place(g, 'th-octo-' + d, { x: 700 - O, y: 660 - O, w: 1180, h: 1240 }, (c) => drawOcto(c, d), x, y, s, 0, 0.54);
    };
})();
