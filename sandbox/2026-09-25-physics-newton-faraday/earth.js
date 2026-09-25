// The Earth of physics-newton-faraday: a globe with the real continents (coarse outlines in
// longitude/latitude, orthographic projection, turning), ice caps, a few cloud bands, the
// night side and a thin atmosphere. Global: Globe.
//
//   Globe.draw(press, C, r, { lon0, lat0, f, cloudLon })   f fades it in (screens only when f < 1)
const Globe = (() => {
    // coarse coastlines, [lon, lat] (degrees), traced from a world map by hand
    const LAND = {
        africa: [[-17, 21], [-16, 12], [-13, 8], [-8, 4.5], [5, 4], [9, 4], [10, -2], [13, -12], [12, -18], [15, -27], [18, -34], [20, -35], [26, -34], [33, -28], [35, -22], [40, -15], [40, -5], [44, 2], [51, 11], [44, 11], [43, 12], [38, 18], [33, 28], [32, 31], [25, 32], [20, 31], [11, 33], [10, 37], [0, 36], [-6, 36], [-10, 30], [-13, 27]],
        madagascar: [[44, -25], [47, -25], [50, -15], [49, -12], [44, -17]],
        europe: [[-9, 43], [-9, 39], [-6, 36], [-2, 37], [3, 43], [6, 43], [9, 44], [12, 44], [16, 40], [18, 40], [13, 45], [20, 40], [24, 38], [26, 41], [29, 41], [40, 42], [40, 48], [30, 50], [28, 56], [30, 60], [28, 70], [20, 70], [15, 68], [5, 62], [8, 58], [12, 56], [10, 54], [8, 54], [4, 52], [2, 50], [-4, 48], [-2, 44]],
        britain: [[-5, 50], [1, 51], [2, 53], [-2, 56], [-3, 58.5], [-6, 58], [-5, 55], [-3, 54]],
        asia: [[35, 33], [36, 37], [40, 42], [40, 48], [30, 50], [28, 56], [30, 60], [28, 70], [60, 72], [80, 73], [100, 78], [140, 72], [180, 68], [170, 60], [160, 60], [155, 50], [140, 46], [130, 42], [122, 38], [122, 30], [118, 23], [108, 21], [106, 10], [100, 13], [98, 8], [100, 3], [104, 1], [98, 16], [92, 22], [88, 22], [80, 15], [77, 8], [72, 20], [67, 24], [58, 25], [56, 26], [52, 17], [43, 13], [39, 21], [35, 28]],
        japan: [[130, 31], [135, 34], [140, 36], [142, 40], [141, 45], [138, 38], [132, 34]],
        australia: [[114, -22], [114, -34], [117, -35], [123, -34], [131, -31], [138, -35], [141, -38], [150, -38], [153, -28], [145, -15], [142, -11], [136, -12], [131, -11], [125, -14], [122, -18]],
        southAmerica: [[-80, 9], [-77, 8], [-72, 12], [-62, 11], [-52, 5], [-50, 0], [-35, -5], [-39, -13], [-41, -22], [-48, -26], [-53, -34], [-58, -38], [-65, -42], [-68, -50], [-70, -55], [-75, -50], [-73, -37], [-71, -30], [-70, -18], [-76, -14], [-81, -6], [-80, 0], [-77, 3]],
        northAmerica: [[-168, 66], [-162, 60], [-152, 58], [-140, 60], [-133, 55], [-125, 49], [-124, 40], [-117, 32], [-110, 24], [-105, 20], [-97, 16], [-92, 15], [-87, 14], [-83, 9], [-80, 9], [-82, 14], [-87, 21], [-90, 21], [-97, 22], [-97, 28], [-90, 30], [-83, 29], [-81, 25], [-80, 32], [-76, 35], [-70, 42], [-66, 45], [-60, 47], [-55, 52], [-60, 55], [-64, 60], [-78, 62], [-78, 72], [-95, 72], [-120, 70], [-140, 70], [-156, 71]],
        greenland: [[-73, 78], [-60, 82], [-30, 83], [-20, 76], [-22, 70], [-42, 60], [-50, 64], [-55, 70]],
    };
    // deserts get a warmer ochre (more yellow, a little pink)
    const DESERT = {
        sahara: [[-14, 24], [-5, 17], [10, 16], [25, 17], [35, 22], [33, 30], [20, 31], [10, 32], [-8, 29]],
        arabia: [[38, 28], [45, 18], [55, 18], [57, 23], [50, 27], [44, 29]],
        gobi: [[90, 40], [110, 40], [115, 45], [95, 47]],
        outback: [[120, -22], [138, -22], [140, -30], [125, -30]],
    };
    const RAD = Math.PI / 180;
    // densify an outline in lon/lat so its projection stays round near the limb
    function dense(pts, step = 3) {
        const out = [];
        for (let i = 0; i < pts.length; i++) {
            const a = pts[i], b = pts[(i + 1) % pts.length], n = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / step));
            for (let k = 0; k < n; k++) out.push([a[0] + (b[0] - a[0]) * k / n, a[1] + (b[1] - a[1]) * k / n]);
        }
        return out;
    }
    // orthographic projection; points on the far side are pushed onto the limb
    function project(C, r, lon0, lat0) {
        const s0 = Math.sin(lat0 * RAD), c0 = Math.cos(lat0 * RAD);
        return ([lon, lat]) => {
            const l = (lon - lon0) * RAD, p = lat * RAD;
            const x = Math.cos(p) * Math.sin(l), y = c0 * Math.sin(p) - s0 * Math.cos(p) * Math.cos(l);
            const z = s0 * Math.sin(p) + c0 * Math.cos(p) * Math.cos(l);
            if (z >= 0) return [C[0] + x * r, C[1] - y * r, true];
            const n = Math.hypot(x, y) || 1;
            return [C[0] + (x / n) * r, C[1] - (y / n) * r, false];
        };
    }
    function shape(proj, pts) {
        const q = dense(pts).map(proj);
        if (!q.some((p) => p[2])) return null;
        return (g) => { g.beginPath(); q.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); };
    }

    function draw(press, C, r, o = {}) {
        const f = o.f ?? 1, S = (spec) => (f < 1 ? Object.fromEntries(Object.entries(spec).map(([k, v]) => [k.endsWith('.s') ? k : k + '.s', v * f])) : spec);
        const K = { knock: f >= 1 };
        const proj = project(C, r, o.lon0 ?? 10, o.lat0 ?? 18);
        // atmosphere: a pale ring just outside the disc
        if (f >= 1) Ph.put(press, Ph.circle(C[0], C[1], r + 7), { 'blue.s': 0.3 });
        // ocean: a light blue sea, deeper towards the rim
        Ph.put(press, Ph.circle(C[0], C[1], r), S({ 'blue.s': 0.6, 'yellow.s': 0.04 }), K);
        press.save();
        press.clip(Ph.circle(C[0], C[1], r));
        Ph.ink(press, Ph.circle(C[0], C[1], r), { 'blue.s': (g) => Riso.radial(g, C[0] + r * 0.25, C[1] - r * 0.25, r * 0.3, r * 1.05, 0, 0.35 * f) });
        // lands: green (yellow over blue), deserts ochre, coast in a darker green line
        for (const pts of Object.values(LAND)) {
            const sh = shape(proj, pts);
            if (!sh) continue;
            Ph.put(press, sh, S({ 'yellow.s': 0.8, 'blue.s': 0.45, 'navy.s': 0.08 }), K);
        }
        for (const pts of Object.values(DESERT)) {
            const sh = shape(proj, pts);
            if (sh) Ph.ink(press, sh, S({ 'pink.s': 0.28, 'yellow.s': 0.3 }));
        }
        // ice: the Arctic cap and Antarctica, paper white with a cold tint
        const cap = (lat, sign) => {
            const ring = [];
            for (let lon = -180; lon < 180; lon += 6) ring.push([lon, lat + 2.5 * Math.sin(lon * RAD * 5)]);
            return ring.map((p) => [p[0], p[1]]).concat(sign > 0 ? [] : []);
        };
        for (const [lat, sign] of [[79, 1], [-70, -1]]) {
            // fill between the ring and the pole: draw the ring's projection; the pole side is inside
            const ring = cap(lat, sign).map(proj);
            if (!ring.some((p) => p[2])) continue;
            Ph.put(press, (g) => { g.beginPath(); ring.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); }, S({ 'blue.s': 0.12 }), K);
        }
        // clouds: knocked-out wisps along latitudes, turning a little faster than the ground
        const cl = project(C, r, (o.lon0 ?? 10) - (o.cloudLon ?? 0), o.lat0 ?? 18);
        const rr = Motion.rng('clouds');
        for (let i = 0; i < 9; i++) {
            const lat = -50 + rr() * 110, lon = rr() * 360 - 180, len = 25 + rr() * 45;
            const pts = [];
            for (let k = 0; k <= 12; k++) pts.push(cl([lon + (len * k) / 12, lat + 3 * Math.sin(k * 0.7 + i)]));
            const vis = pts.filter((p) => p[2]);
            if (vis.length > 3 && f >= 1) press.knockout((g) => { Ph.poly(g, Ph.outline(vis.map(([x, y]) => [x, y]), Ph.taper(5 + rr() * 5, 0.3, 0.3))); g.fill(); });
        }
        // night side: navy screen ramp away from the light (upper right)
        Ph.ink(press, Ph.circle(C[0], C[1], r), { 'navy.s': (g) => Riso.radial(g, C[0] + r * 0.45, C[1] - r * 0.45, r * 0.55, r * 2.0, 0, 0.8 * f) });
        press.restore();
        // a thin paper rim on the lit side
        const rim = [];
        for (let a = -2.4; a <= 0.4; a += 0.05) rim.push([C[0] + Math.cos(a) * (r - 7), C[1] + Math.sin(a) * (r - 7)]);
        if (f >= 1) press.knockout((g) => { Ph.poly(g, Ph.outline(rim, Ph.taper(5, 0.3, 0.3))); g.fill(); });
    }
    return { draw, LAND };
})();
