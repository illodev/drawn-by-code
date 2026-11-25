// The city of the clouds section (verse 2 and pre-chorus 2): South Beach at night, built in
// metres (x east, y up, z north; the ground at y 0) and painted in the drawn manner (Ink)
// through any Neon.camera, from 400 m up or from the kerb. Ocean Drive runs north along the
// beach: its Art Deco hotels (theirs, the MOONGLOW, among them) face the park, the sand and
// the sea; west of it the grid of avenues and streets runs to the bay. From above the streets
// are a grid of light (the trip's grid is the real city), cars draw their lights along it,
// traffic lights change on the bar, roofs carry neon tubes and pools glow cyan; on Washington
// Avenue a 24-hour diner and a laundromat are open at 4 am. Clouds float over it all, lit from
// below by the city.
// Global: CloudsCity.
//   CloudsCity.draw(g, L, cam, T, d, fx, env, extra)   ground, streets, buildings and things,
//        sorted far to near with `extra` ([{ x, y, z, draw }], e.g. the car, the two of them)
//   CloudsCity.clouds(g, cam, T, d, fx, env)           the clouds (before the city when the camera
//        is under them, after it when above)
//   CloudsCity.forms(L, cam, T, fx, env)               the form constants, faint on the sky
//   CloudsCity.lampsNear(z), lampLight(x, z), signal(T), LANE, HOTEL, STOP, SHOPS
const CloudsCity = (() => {
    const P = Ink.PAL, css = Neon.css, mix = Neon.mix, H = Ink.hsh;
    const cap = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
    const lw = (s, m = 0.05) => cap(m * s, 1.2, 6);
    const LAND = { x0: -1100, z0: -1250, z1: 1350 }, SHORE = 150;
    const AVES = [[-1030, 12], [-920, 18], [-815, 12], [-710, 12], [-605, 14], [-500, 12], [-395, 12], [-290, 12], [-185, 18], [-75, 16]];
    const ROADX = AVES.map(([c, w]) => [c - w / 2, c + w / 2]).concat([[-6, 6]]);      // Ocean Drive last
    const STREETS = []; for (let k = -12; k <= 13; k++) STREETS.push([k * 100 - 6, k * 100 + 6]);
    const LANE = 1.75;                                    // Ocean Drive's northbound lane
    const HOTEL = { name: 'MOONGLOW', z0: 218, z1: 254, h: 15 };
    const STOP = 188.2;                                   // the car's centre at the red light (stop line 190.5)
    const SHOPS = { x: -197, diner: [109, 131], laundry: [131, 147] };
    const NAMES = ['SEAGLASS', 'VELVET', 'HALCYON', 'CORAL', 'NEPTUNE', 'PARADISO', 'STARDUST', 'LAGUNA'];
    const ROOF = ['#1d0a5a', '#26106e', P.deep, '#2e0f6a', P.grape, '#341078'];
    const WALL = ['#3c0ca8', P.royal, P.plum, P.indigo, '#4a10c8', P.purple];
    const DECO = [P.salmon, P.magenta, P.purple, P.violet, '#ff6fa8', P.plum];
    const TUBE = [P.cyan, P.pink, P.aqua, P.gold, P.magenta];
    const WARM = [P.orange, P.gold, P.salmon, P.orange, P.cyan];
    const dist = (cam, x, y, z) => Math.hypot(x - cam.pos[0], y - cam.pos[1], z - cam.pos[2]);

    // --- the plan (deterministic, built once) ----------------------------------------------------
    let PLAN = null;
    function build() {
        if (PLAN) return PLAN;
        const R = Motion.rng('clouds-city');
        const B = [], palms = [], pools = [], parked = [];
        const xs = [[LAND.x0, ROADX[0][0]]]; for (let i = 0; i + 1 < ROADX.length; i++) xs.push([ROADX[i][1], ROADX[i + 1][0]]);
        const zs = [[LAND.z0, STREETS[0][0]]]; for (let i = 0; i + 1 < STREETS.length; i++) zs.push([STREETS[i][1], STREETS[i + 1][0]]); zs.push([STREETS[STREETS.length - 1][1], LAND.z1]);
        const pads = []; for (const [xa, xb] of xs) for (const [za, zb] of zs) pads.push({ xa, xb, za, zb });
        let ni = 0;
        const add = (b) => {
            b.seed = B.length * 7 + 11; b.lit = 0.25 + 0.3 * H(b.seed, 1, 0);
            b.v = b.seed % 4; b.style = b.kind === 'deco' || H(b.seed, 2, 0) < 0.45 ? 'deco' : 'plain'; b.uOff = (b.seed % 5) * 3.4;
            if (b.kind !== 'diner' && b.kind !== 'laundry' && b.kind !== 'step') { const r = H(b.seed, 3, 0); b.tank = r < 0.22; b.antenna = r > 0.85; b.roofSign = H(b.seed, 8, 0) < (b.kind === 'tower' ? 0.3 : 0.05) ? Math.floor(H(b.seed, 9, 0) * 3) : -1; }
            B.push(b); return b;
        };
        for (const p of pads) {
            if (p.xb === -6) {
                // the Ocean Drive block: one row of hotels fronting the park, pools in the yards
                const cuts = [];
                for (let z = p.za + 3; z < p.zb - 3;) {
                    let w = 18 + R() * 16;
                    if (z < HOTEL.z0 && z + w > HOTEL.z0) w = HOTEL.z0 - z;
                    if (Math.abs(z - HOTEL.z0) < 0.01) w = HOTEL.z1 - HOTEL.z0;
                    if (z + w > p.zb - 3 - 8) w = p.zb - 3 - z;
                    cuts.push([z, z + w]); z += w;
                }
                for (const [za, zb] of cuts) {
                    const ours = Math.abs(za - HOTEL.z0) < 0.01, depth = 26 + R() * 16;
                    const b = add({ x0: -10 - depth, x1: -10, z0: za + 0.4, z1: zb - 0.4, h: ours ? HOTEL.h : 10 + R() * 6, kind: 'deco', wall: DECO[Math.floor(R() * DECO.length)], roof: ROOF[Math.floor(R() * 4)], tube: TUBE[Math.floor(R() * TUBE.length)] });
                    if (Math.abs((za + zb) / 2) < 900) b.name = ours ? HOTEL.name : NAMES[ni++ % NAMES.length];
                    if (ours) { b.wall = P.salmon; b.tube = P.pink; b.ours = true; }
                    if (b.x0 > -58 && R() < 0.6) pools.push({ x0: -62, x1: b.x0 - 2, z0: za + 3, z1: Math.min(zb - 3, za + 3 + 10), seed: b.seed });
                    if (R() < 0.7) palms.push({ x: b.x0 - 3 - R() * 3, z: (za + zb) / 2 + (R() - 0.5) * 6, seed: b.seed });
                }
                for (let z = p.za + 4; z < p.zb - 4; z += 6.5 + R() * 4) if (R() < 0.55) parked.push({ x: -4.75, z, dir: R() < 0.5 ? 1 : -1, col: R() < 0.5 ? P.violet : P.royal });
                continue;
            }
            const w = p.xb - p.xa;
            const rows = w > 40 ? [[p.xa + 3, (p.xa + p.xb) / 2 - 1], [(p.xa + p.xb) / 2 + 1, p.xb - 3]] : [[p.xa + 3, p.xb - 3]];
            const collins = p.xb === -83, shops = p.xb === -194 && p.za === 106;
            for (const [ra, rb] of rows) {
                for (let z = p.za + 3; z < p.zb - 3;) {
                    let lz = 14 + R() * 16; if (z + lz > p.zb - 3 - 8) lz = p.zb - 3 - z;
                    const z0 = z, z1 = z + lz; z += lz;
                    if (shops && rb === p.xb - 3 && z0 < SHOPS.laundry[1]) {
                        if (z0 > p.za + 3 + 0.01) continue;
                        add({ x0: SHOPS.x - 18, x1: SHOPS.x, z0: SHOPS.diner[0], z1: SHOPS.diner[1], h: 5.2, kind: 'diner', wall: P.pink, roof: '#3a1080' });
                        add({ x0: SHOPS.x - 18, x1: SHOPS.x, z0: SHOPS.laundry[0] + 0.3, z1: SHOPS.laundry[1], h: 4.6, kind: 'laundry', wall: P.violet, roof: '#26106e' });
                        z = SHOPS.laundry[1] + 0.3; continue;
                    }
                    const tower = R() < (collins ? 0.16 : 0.035);
                    const yard = !tower && R() < 0.12;
                    const ix = 0.8 + R() * 2, iz = 0.5 + R() * 1.5;
                    const b = add({ x0: ra + ix, x1: rb - ix, z0: z0 + iz, z1: z1 - iz - (yard ? 9 : 0), h: tower ? 28 + R() * 45 : 6 + R() * 8, kind: tower ? 'tower' : 'block', wall: WALL[Math.floor(R() * WALL.length)], roof: ROOF[Math.floor(R() * ROOF.length)] });
                    if (b.z1 - b.z0 < 5) { b.z1 = z1 - iz; }
                    // a stepped top (an Art Deco set-back) on a quarter of the low blocks
                    if (!tower && b.h > 8 && R() < 0.28) { const wx = (b.x1 - b.x0) * 0.25, wz = (b.z1 - b.z0) * 0.25; add({ x0: b.x0 + wx, x1: b.x1 - wx, z0: b.z0 + wz, z1: b.z1 - wz, base: b.h, h: b.h + 2.4 + R() * 2, kind: 'step', wall: b.wall, roof: b.roof }); b.stepped = true; }
                    if (R() < 0.22) b.tube = TUBE[Math.floor(R() * TUBE.length)];
                    if (tower && R() < 0.5) pools.push({ x0: b.x0 + 3, x1: Math.min(b.x1 - 3, b.x0 + 14), z0: b.z0 + 3, z1: Math.min(b.z1 - 3, b.z0 + 9), y: b.h + 0.05, seed: b.seed });
                    if (yard) { pools.push({ x0: b.x0 + 2, x1: Math.min(b.x1 - 2, b.x0 + 12), z0: b.z1 + 2, z1: b.z1 + 7, seed: b.seed }); palms.push({ x: b.x1 - 2, z: b.z1 + 4.5, seed: b.seed }); }
                }
            }
        }
        // palms: the park along Ocean Drive (a row at the kerb, groves behind), Collins' and
        // Washington's sidewalks
        for (let z = LAND.z0 + 20; z < LAND.z1 - 20; z += 13) { palms.push({ x: 11.5 + (R() - 0.5) * 0.8, z: z + (R() - 0.5) * 3, seed: Math.round(z * 3) }); if (R() < 0.7) palms.push({ x: 20 + R() * 40, z: z + R() * 10, seed: Math.round(z * 5) + 1 }); }
        for (const [c, w] of [[-75, 16], [-185, 18]]) for (let z = LAND.z0 + 15; z < LAND.z1; z += 22) for (const sd of [-1, 1]) { const zz = z + (sd > 0 ? 11 : 0); if (STREETS.some(([a, b]) => zz > a - 4 && zz < b + 4)) continue; if (c === -185 && sd < 0 && zz > SHOPS.diner[0] - 6 && zz < SHOPS.laundry[1] + 6) continue; palms.push({ x: c + sd * (w / 2 + 1.6), z: zz, seed: Math.round(zz * 7 + c) }); }
        // the hotel north of theirs stays low (the view from their roof)
        for (const b of B) if (b.kind === 'deco' && b.z0 > HOTEL.z1 - 1 && b.z0 < HOTEL.z1 + 40) b.h = Math.min(b.h, 10.5);
        // cars parked along the park-side kerb, away from where the camera follows theirs
        for (let z = LAND.z0 + 10; z < LAND.z1 - 10; z += 7 + R() * 5) if ((z < 120 || z > 275) && R() < 0.45) parked.push({ x: 4.75, z, dir: 1, col: [P.violet, P.royal, P.plum, P.indigo][Math.floor(R() * 4)] });
        // a car at the kerb outside the laundromat
        parked.push({ x: -192.4, z: 141, dir: 1, col: P.royal }, { x: -192.4, z: 128.6, dir: 1, col: P.plum });
        // people walking: Ocean Drive's two sidewalks, the park's walkway, Washington Avenue
        const walkers = [];
        for (let i = 0; i < 60; i++) {
            const side = R(), x = side < 0.4 ? -8.2 + R() * 1.2 : side < 0.75 ? 6.9 + R() * 1.2 : 36 + R() * 4, z0 = -150 + R() * 650;
            walkers.push({ x, z0, dir: R() < 0.5 ? 1 : -1, v: 1.1 + R() * 0.5, seed: 300 + i * 7, shirt: ['#3a0c70', '#5a1060', '#2a1a80', '#4a0a50', '#1e0a5a'][i % 5], rim: i % 3 ? P.cyan : P.pink, walk: side >= 0.75 });
        }
        for (let i = 0; i < 14; i++) walkers.push({ x: R() < 0.5 ? -195.6 : -174.8, z0: 80 + R() * 90, dir: R() < 0.5 ? 1 : -1, v: 1.0 + R() * 0.4, seed: 900 + i * 7, shirt: ['#3a0c70', '#5a1060', '#2a1a80'][i % 3], rim: i % 2 ? P.pink : P.cyan });
        PLAN = { B, palms, pools, parked, pads, walkers };
        return PLAN;
    }

    // --- the music and the street ----------------------------------------------------------------
    // the traffic lights change on every second bar line (amber for a beat before); Ocean Drive's
    // light at the stop line is the film's own: red from 118.9 to the green on bar 62 (125.45)
    function signal(T, phase = 0) {
        const bars = (T - Song.bar0) / (4 * Song.beat) + phase * 2, k = Math.floor(bars / 2), u = bars / 2 - k;
        const ns = k % 2 === 0;
        return { ns: ns ? (u > 0.875 ? 'amber' : 'green') : 'red', ew: ns ? 'red' : (u > 0.875 ? 'amber' : 'green') };
    }
    const odSignal = (T) => (T < 118.1 ? 'green' : T < 118.9 ? 'amber' : T < 125.452 ? 'red' : 'green');
    const SIG = { red: P.red, amber: P.orange, green: P.mint };
    // street lamps: Ocean Drive's park side every 28 m, the avenues' both sides every 30 m
    const lampZ = (z0) => Math.round(z0 / 28) * 28 + 6;
    function lampsNear(z) { const out = []; for (let k = -2; k <= 3; k++) { const zl = lampZ(z) + k * 28; out.push([5.9, 8.6, zl]); } return out; }
    function lampLight(z) { const zl = Math.round((z - 6) / 28) * 28 + 6; return Math.exp(-(((z - zl) / 7) ** 2)); }

    // moving traffic: fixed flows along every road (positions from the song second only)
    function traffic(T) {
        const out = [];
        AVES.concat([[0, 12]]).forEach(([c, w], i) => {
            const od = c === 0;
            for (const dir of od ? [-1] : [1, -1]) {
                const x = c + dir * (od ? 1.75 : w / 4), gap = od ? 95 : 60 + (i % 3) * 15, v = od ? 8 : 10 + (i % 4);
                const span = LAND.z1 - LAND.z0, n = Math.floor(span / gap);
                for (let k = 0; k < n; k++) {
                    const z = LAND.z0 + ((((k * gap + H(i, k, 0) * gap * 0.6 + dir * v * T) % span) + span) % span);
                    out.push({ x, z, dx: 0, dz: dir, v, seed: i * 1000 + k + (dir > 0 ? 500 : 0), col: [P.violet, P.royal, P.plum, P.indigo][k % 4] });
                }
            }
        });
        STREETS.forEach(([a, b], i) => {
            if (i % 2) return;
            for (const dir of [1, -1]) {
                const z = (a + b) / 2 - dir * 3, v = 9, span = -6 - LAND.x0, n = 6;
                for (let k = 0; k < n; k++) {
                    const x = LAND.x0 + ((((k * span / n + H(i, k, 3) * 60 + dir * v * T) % span) + span) % span);
                    out.push({ x, z, dx: dir, dz: 0, v, seed: 9000 + i * 100 + k + (dir > 0 ? 50 : 0), col: P.royal });
                }
            }
        });
        return out;
    }

    // a small round light on the picture and the light layer (bloom gives it its glow)
    function dot(g, L, x, y, r, col, a = 1) {
        for (const c of [g, L]) { if (!c) continue; c.save(); c.globalAlpha = a * (c === L ? 0.8 : 1); c.fillStyle = col; c.beginPath(); c.arc(x, y, c === L ? r * 1.6 : r, 0, Math.PI * 2); c.fill(); c.restore(); }
    }
    // a world polygon through the camera, clipped to the frame plus a margin: a block or a wall
    // beside the camera projects to tens of thousands of px, and the brush would walk all of it
    function clipRect(q, W, Hh, m = 160) {
        const edges = [[(p) => p[0] >= -m, (a, b) => { const u = (-m - a[0]) / (b[0] - a[0]); return [-m, a[1] + (b[1] - a[1]) * u]; }],
            [(p) => p[0] <= W + m, (a, b) => { const u = (W + m - a[0]) / (b[0] - a[0]); return [W + m, a[1] + (b[1] - a[1]) * u]; }],
            [(p) => p[1] >= -m, (a, b) => { const u = (-m - a[1]) / (b[1] - a[1]); return [a[0] + (b[0] - a[0]) * u, -m]; }],
            [(p) => p[1] <= Hh + m, (a, b) => { const u = (Hh + m - a[1]) / (b[1] - a[1]); return [a[0] + (b[0] - a[0]) * u, Hh + m]; }]];
        let out = q;
        for (const [inside, cut] of edges) {
            const src = out; out = [];
            for (let i = 0; i < src.length; i++) { const a = src[i], b = src[(i + 1) % src.length], ia = inside(a), ib = inside(b); if (ia) out.push(a); if (ia !== ib) out.push(cut(a, b)); }
            if (out.length < 3) return null;
        }
        return out;
    }
    const quad = (cam, pts) => { const q = Neon.poly(cam, pts); return q ? clipRect(q, cam.W, cam.H) : null; };

    // --- the ground --------------------------------------------------------------------------------
    function ground(g, L, cam, T, d, fx, env, pl) {
        const high = cam.pos[1] > 40, c = cam.pos;
        const land = quad(cam, [[LAND.x0, 0, LAND.z0], [SHORE, 0, LAND.z0], [SHORE, 0, LAND.z1], [LAND.x0, 0, LAND.z1]]);
        if (land) Ink.shape(g, land, '#150560', { w: 0, seed: 'land', d, jit: 0 });
        // the park and the sand
        for (const [xa, xb, col] of [[9, 70, '#2c0a5c'], [70, SHORE, '#3a1068']]) { const q = quad(cam, [[xa, 0.01, LAND.z0], [xb, 0.01, LAND.z0], [xb, 0.01, LAND.z1], [xa, 0.01, LAND.z1]]); if (q) Ink.shape(g, q, col, { w: 0, seed: 'park' + xa, d, jit: 0 }); }
        // the sand's ripples and the park's grass: short strokes along the shore, batched into a
        // few paths (thousands of them from above), lighter where the hotels' light falls
        {
            const zA = Math.max(LAND.z0, c[2] - (high ? 1400 : 260)), zB = Math.min(LAND.z1, c[2] + (high ? 1700 : 420)), st = high ? 9 : 4;
            const sm = cam.f / Math.max(30, Math.abs(c[1]) + 40);
            const batch = (col, wpx, fn) => { g.save(); g.strokeStyle = col; g.lineWidth = wpx; g.lineCap = 'round'; g.beginPath(); fn(); g.stroke(); g.restore(); };
            const seg = (x, z, dz, dx = 0) => { const A = cam.p([x, 0.02, z]), Bq = cam.p([x + dx, 0.02, z + dz]); if (A[2] < 2 || Bq[2] < 2) return; if (Math.max(A[0], Bq[0]) < -20 || Math.min(A[0], Bq[0]) > env.W + 20 || Math.max(A[1], Bq[1]) < -20 || Math.min(A[1], Bq[1]) > env.H + 20) return; g.moveTo(A[0], A[1]); g.lineTo(Bq[0], Bq[1]); };
            batch('#5c1c86', cap(0.35 * sm, 1, 3), () => { for (let x = 74; x < SHORE - 2; x += st * 0.9) for (let z = Math.floor(zA / 14) * 14; z < zB; z += 14) if (H(x | 0, z | 0, 1) < 0.7) seg(x + Math.sin(z / 23) * 1.5, z, 8 + 4 * H(x | 0, z | 0, 2), 0.6); });
            batch('#8a3a9a', cap(0.25 * sm, 0.8, 2.5), () => { for (let x = 77; x < SHORE - 2; x += st * 1.7) for (let z = Math.floor(zA / 20) * 20 + 7; z < zB; z += 20) if (H(x | 0, z | 0, 3) < 0.55) seg(x + Math.sin(z / 17) * 1.2, z, 5, 0.4); });
            batch('#45127a', cap(0.3 * sm, 1, 3), () => { for (let x = 12; x < 68; x += st) for (let z = Math.floor(zA / 9) * 9; z < zB; z += 9) if (H(x | 0, z | 0, 4) < 0.5) { const xx = x + H(x | 0, z | 0, 5) * st, zz = z + H(x | 0, z | 0, 6) * 6; seg(xx, zz, 0.3, 0.9); } });
            // the surf: three lines of foam, broken, the far ones thinner
            for (const [xo, col, wm] of [[1.5, P.cream, 0.6], [5.5, P.pink, 0.45], [11, '#b8a2e8', 0.35]]) batch(col, cap(wm * sm, 1, 4), () => { for (let z = Math.floor(zA / 11) * 11; z < zB; z += 11) if (H(z | 0, xo * 10, 7) < 0.72) seg(SHORE + xo + Math.sin(z / 40 + T * 0.6 + xo) * 1.2, z, 6 + 4 * H(z | 0, xo, 8), 0.3); });
        }
        // the surf: broken strokes of foam along the shore
        for (let z = Math.floor((c[2] - 900) / 18) * 18; z < c[2] + 900; z += 18) {
            if (z < LAND.z0 || z > LAND.z1) continue;
            const a = cam.p([SHORE + 2 + 3 * H(z, 1, 0), 0, z]), b = cam.p([SHORE + 2 + 3 * H(z, 2, 0), 0, z + 12]); if (a[2] < 2 || b[2] < 2) continue;
            const s = cam.f / a[2]; if (s < 0.25) continue;
            Ink.brush(g, [[a[0], a[1]], [b[0], b[1]]], { w: cap(0.8 * s, 1, 5), col: H(z, 3, 0) < 0.5 ? P.pink : P.cream, seed: 6100 + z, d, taper: 0.4, alpha: 0.7, light: true });
        }
        // the park's walkway (a serpentine of pale paving with lamps) and lifeguard huts on the sand
        for (let z = Math.floor((c[2] - 1200) / 20) * 20; z < c[2] + 1600; z += 20) {
            if (z < LAND.z0 || z + 20 > LAND.z1) continue;
            const xw = (zz) => 38 + 9 * Math.sin(zz / 70);
            const A = cam.p([xw(z), 0.05, z]), Bq = cam.p([xw(z + 20), 0.05, z + 20]); if (A[2] < 2 || Bq[2] < 2) continue;
            const s = cam.f / A[2]; if (s < 0.3) continue;
            if (Math.max(A[0], Bq[0]) < -30 || Math.min(A[0], Bq[0]) > env.W + 30 || Math.max(A[1], Bq[1]) < -30 || Math.min(A[1], Bq[1]) > env.H + 30) continue;
            Ink.brush(g, [[A[0], A[1]], [Bq[0], Bq[1]]], { w: cap(2.6 * s, 1, 30), col: '#5a2a9a', seed: 6400 + z, d, taper: 0.02, wob: 0.4 });
            if (z % 40 === 0) { const l = cam.p([xw(z) + 2, 3.5, z]); dot(g, L, l[0], l[1], cap(0.4 * s, 0.8, 5), P.pink, 0.9 * (fx.lampPower ?? 1)); }
            if (z % 120 === 0) {
                const hx = 112, cols = [P.aqua, P.pink, P.gold, P.salmon], col = cols[((z / 120) % 4 + 4) % 4];
                const top = quad(cam, [[hx - 2, 3, z - 2], [hx + 2, 3, z - 2], [hx + 2, 3, z + 2], [hx - 2, 3, z + 2]]);
                const fr = cam.pos[0] > hx + 2 ? quad(cam, [[hx + 2, 1.2, z - 2], [hx + 2, 1.2, z + 2], [hx + 2, 3, z + 2], [hx + 2, 3, z - 2]]) : null;
                if (fr) Ink.shape(g, fr, col, { w: s > 2 ? lw(s, 0.08) : 0, seed: 6600 + z, d, jit: 0.3 });
                if (top) Ink.shape(g, top, css(mix(col, '#04022e', 0.35)), { w: s > 2 ? lw(s, 0.08) : 0, seed: 6700 + z, d, jit: 0.3 });
                const lp = cam.p([hx + 2.2, 2.6, z]); dot(g, L, lp[0], lp[1], cap(0.35 * s, 0.8, 4), P.cyan, 0.9);
            }
        }
        // the blocks (sidewalks and lots), a shade lighter than the asphalt
        const s0 = (x, z) => { const v = cam.view([x, 0, z]); return v[2]; };
        for (const p of pl.pads) {
            const cx = (p.xa + p.xb) / 2, cz = (p.za + p.zb) / 2, r = Math.hypot(p.xb - p.xa, p.zb - p.za) / 2;
            if (!visible(cam, cx, 0, cz, r, env)) continue;
            const q = quad(cam, [[p.xa, 0.02, p.za], [p.xb, 0.02, p.za], [p.xb, 0.02, p.zb], [p.xa, 0.02, p.zb]]); if (!q) continue;
            const s = cam.f / Math.max(1, dist(cam, cx, 0, cz));
            Ink.shape(g, q, '#2a0c7e', { w: s > 1.2 ? lw(s, 0.12) : 0, seed: Math.round(cx * 3 + cz), d, jit: s > 1.2 ? 0.5 : 0 });
            if (s0(cx, cz) < -r) continue;
        }
        // the sidewalk on the park side of Ocean Drive and its kerbs
        { const q = quad(cam, [[6, 0.03, LAND.z0], [9, 0.03, LAND.z0], [9, 0.03, LAND.z1], [6, 0.03, LAND.z1]]); if (q) Ink.shape(g, q, '#2a0c7e', { w: 0, seed: 'swE', d, jit: 0 }); }
        // pools: cyan, glowing faintly, a few strokes of light on the water
        for (const pool of pl.pools) {
            const y = pool.y ?? 0.05, cx = (pool.x0 + pool.x1) / 2, cz = (pool.z0 + pool.z1) / 2;
            if (y > 0.1) continue;                              // roof pools go with their building
            poolDraw(g, L, cam, pool, y, d, env);
        }
        // lane paint and crosswalks near the camera (from the kerb only)
        if (!high) {
            for (let z = Math.floor((c[2] - 40) / 9) * 9; z < c[2] + 160; z += 9) {
                if (STREETS.some(([a, b]) => z > a - 5 && z < b + 1)) continue;
                const q = quad(cam, [[-0.08, 0.04, z], [0.08, 0.04, z], [0.08, 0.04, z + 3], [-0.08, 0.04, z + 3]]); if (q) Ink.shape(g, q, '#e8b04a', { w: 0, seed: z, d, jit: 0.5, light: true });
            }
            for (const [a, b] of STREETS) {
                if (Math.abs(a - c[2]) > 220) continue;
                for (const [zA, zB] of [[a - 3.5, a - 0.5], [b + 0.5, b + 3.5]]) for (let x = -5.6; x < 5.6; x += 1.2) {
                    const q = quad(cam, [[x, 0.04, zA], [x + 0.6, 0.04, zA], [x + 0.6, 0.04, zB], [x, 0.04, zB]]); if (q) Ink.shape(g, q, '#b8a2e8', { w: 0, seed: Math.round(x * 10 + a), d, jit: 0.6, light: true });
                }
                const q = quad(cam, [[0, 0.04, a - 4.1], [6, 0.04, a - 4.1], [6, 0.04, a - 3.75], [0, 0.04, a - 3.75]]); if (q) Ink.shape(g, q, '#d8c8f8', { w: 0, seed: 'stop' + a, d, jit: 0.4, light: true });
            }
            roadLife(g, L, cam, T, d, fx, env, pl);
            // pools of lamp light on Ocean Drive: two flat tones under each lamp
            for (let k = -3; k < 8; k++) {
                const zl = lampZ(c[2]) + k * 28;
                for (const [rz, col] of [[1, '#24097a'], [0.55, '#3a0fa8']]) {
                    const pts = []; for (let i = 0; i < 40; i++) { const an = (i / 40) * Math.PI * 2; pts.push([3.2 + Math.cos(an) * 4.2 * rz, 0.035, zl + Math.sin(an) * 7 * rz]); }
                    const q = quad(cam, pts); if (q) Ink.shape(g, q, col, { w: 0, seed: zl * 3 + rz * 10, d, jit: 0 });
                }
            }
        }
    }

    // the road the camera is on (Ocean Drive or Washington Avenue), wet: under every light near it
    // a column of broken vertical strokes of its colour, as long as the light stands high;
    // manholes, arrows in the lanes, Washington's centre line
    function roadLife(g, L, cam, T, d, fx, env, pl) {
        const c = cam.pos, wash = Math.abs(c[0] + 185) < 30, xa = wash ? -193.6 : -5.7, xb = wash ? -176.4 : 5.7, xc = (xa + xb) / 2;
        const z0 = c[2] - 70, z1 = c[2] + 260;
        const road = quad(cam, [[xa, 0.03, z0], [xb, 0.03, z0], [xb, 0.03, z1], [xa, 0.03, z1]]); if (!road) return;
        const src = [];
        if (wash) {
            src.push([-197, 6.6, 117, P.red, 0.7], [-197, 6.6, 123, P.pink, 0.6], [-197, 3.9, 139, P.aqua, 0.5], [-197, 1.8, 112.5, P.orange, 0.9], [-197, 1.8, 117.5, P.gold, 0.9], [-197, 1.8, 122.5, P.orange, 0.9], [-197, 1.8, 127, P.gold, 0.8], [-197, 2.2, 135, P.cyan, 0.8], [-197, 2.2, 143, P.cyan, 0.8]);
            for (let z = Math.floor((c[2] - 80) / 30) * 30 + 15; z < c[2] + 220; z += 30) for (const sd of [-1, 1]) src.push([-185 + sd * 9, 8.5, z, P.gold, 0.3]);
        } else {
            for (const b of pl.B) if (b.kind === 'deco' && b.z1 > z0 && b.z0 < z1) { const zc = (b.z0 + b.z1) / 2, len = b.z1 - b.z0; src.push([-10, 1.6, zc - len * 0.18, P.gold, 0.6], [-10, 1.6, zc + len * 0.18, P.orange, 0.6], [-10, b.h + 1.3, zc + 0.7, b.ours ? P.pink : b.tube, 0.35], [-10, b.h - 0.35, b.z0 + 2, b.tube, 0.2]); }
            for (let k = -3; k < 10; k++) src.push([5.8, 8.5, lampZ(c[2]) + k * 28, P.gold, 0.35]);
        }
        g.save(); Neon.path(g, road); g.clip();
        for (const [xs, ys, zs, col, wm] of src) {
            if (zs < z0 || zs > z1) continue;
            const xr = cap(xs, xa + 0.4, xb - 0.4), G = cam.p([xr, 0.03, zs]), M = cam.p([xr, -ys * 0.9, zs]); if (G[2] < 1.5) continue;
            const sc = cam.f / G[2], len = Math.min(env.H - G[1] + 30, Math.max(0, M[1] - G[1])); if (len < 3) continue;
            const n = 4, w = cap(wm * sc, 1.6, 22);
            for (let i = 0; i < n; i++) {
                const u0 = (i + 0.1 * H(zs | 0, i, 0)) / n, u1 = u0 + (0.6 + 0.3 * H(zs | 0, i, 1)) / n, wob = Math.sin(i * 2.3 + T * 3 + zs) * w * 0.4;
                Ink.brush(g, [[G[0] + wob, G[1] + len * u0], [G[0] - wob * 0.5, G[1] + len * u1]], { w: w * (1 - u0 * 0.4), col, seed: (zs | 0) * 13 + i + (xs | 0), d, taper: 0.35, wob: 0.5, alpha: 0.85 * (1 - u0 * 0.5), light: true });
            }
        }
        // manholes and the arrows painted in the lanes
        for (let z = Math.floor(z0 / 40) * 40 + 12; z < z1; z += 40) {
            const xm = xc + (Math.round(z / 40) % 2 ? 1.75 : -1.75), pts = []; for (let i = 0; i < 14; i++) { const an = i / 14 * Math.PI * 2; pts.push([xm + Math.cos(an) * 0.36, 0.035, z + Math.sin(an) * 0.36]); }
            const q = quad(cam, pts); if (!q) continue;
            const sc = cam.f / Math.max(1, cam.view([xm, 0, z])[2]);
            Ink.shape(g, q, '#0e0440', { w: lw(sc, 0.04), ink: '#4a2aa0', seed: z, d, jit: 0.3 });
        }
        for (let z = Math.floor(z0 / 55) * 55 + 30; z < z1; z += 55) for (const dir of [1, -1]) {
            const x = xc + dir * (wash ? 4.5 : 1.75), zz = z + (dir < 0 ? 20 : 0), t = dir * 2.4, hd = dir * 3.4;
            const a = quad(cam, [[x - 0.12, 0.035, zz], [x + 0.12, 0.035, zz], [x + 0.12, 0.035, zz + t], [x - 0.12, 0.035, zz + t]]), hq = quad(cam, [[x - 0.45, 0.035, zz + t], [x + 0.45, 0.035, zz + t], [x, 0.035, zz + hd]]);
            for (const q of [a, hq]) if (q) Ink.shape(g, q, '#d8c8f8', { w: 0, seed: Math.round(zz * 3 + dir), d, jit: 0.4, light: true });
        }
        if (wash) for (let z = Math.floor(z0 / 9) * 9; z < z1; z += 9) { if (STREETS.some(([a, b]) => z > a - 5 && z < b + 1)) continue; const q = quad(cam, [[xc - 0.08, 0.04, z], [xc + 0.08, 0.04, z], [xc + 0.08, 0.04, z + 3], [xc - 0.08, 0.04, z + 3]]); if (q) Ink.shape(g, q, '#e8b04a', { w: 0, seed: z + 7, d, jit: 0.5, light: true }); }
        g.restore();
    }

    function poolDraw(g, L, cam, pool, y, d, env) {
        const cx = (pool.x0 + pool.x1) / 2, cz = (pool.z0 + pool.z1) / 2;
        if (!visible(cam, cx, y, cz, 10, env)) return;
        const q = quad(cam, [[pool.x0, y, pool.z0], [pool.x1, y, pool.z0], [pool.x1, y, pool.z1], [pool.x0, y, pool.z1]]); if (!q) return;
        const s = cam.f / Math.max(1, dist(cam, cx, y, cz));
        Ink.shape(g, q, '#2fc8e6', { w: s > 1 ? lw(s, 0.15) : 0, ink: '#e8f8ff', seed: pool.seed, d, jit: s > 1.5 ? 0.5 : 0, light: true });
        L.save(); L.globalAlpha = 0.35; L.fillStyle = P.cyan; Neon.path(L, q); L.fill(); L.restore();
        if (s > 2) { const a = cam.p([pool.x0 + 1, y, cz]), b = cam.p([pool.x1 - 1, y, cz + 1]); Ink.brush(g, [[a[0], a[1]], [b[0], b[1]]], { w: cap(0.3 * s, 1, 4), col: P.cream, seed: pool.seed + 3, d, taper: 0.4, alpha: 0.8, light: true }); }
    }

    // is a sphere (x, y, z, r) in front of the camera and on screen?
    function visible(cam, x, y, z, r, env) {
        const v = cam.view([x, y, z]);
        if (v[2] < -r) return false;
        if (v[2] <= r) return true;
        const sx = cam.f * v[0] / v[2], sy = cam.f * v[1] / v[2], rr = cam.f * r / v[2];
        return Math.abs(sx) < env.W / 2 + rr + 40 && Math.abs(sy) < env.H / 2 + rr + 40 && v[2] < 3200;
    }

    // --- the streets lit: from above, a grid of light ---------------------------------------------
    function streetGlow(g, L, cam, T, d, fx, env) {
        const a = cap((cam.pos[1] - 30) / 80, 0, 1) * (fx.lampPower ?? 1); if (a <= 0) return;
        const seg = (p, q, col, wm, al) => {
            const A = cam.p(p), B = cam.p(q); if (A[2] < 2 || B[2] < 2) return;
            if (Math.max(A[0], B[0]) < -20 || Math.min(A[0], B[0]) > env.W + 20 || Math.max(A[1], B[1]) < -20 || Math.min(A[1], B[1]) > env.H + 20) return;
            const s = cam.f / ((A[2] + B[2]) / 2), w = cap(wm * s, 0.7, 7);
            L.save(); L.globalAlpha = al * a; L.strokeStyle = col; L.lineWidth = w * 1.5; L.lineCap = 'round'; L.beginPath(); L.moveTo(A[0], A[1]); L.lineTo(B[0], B[1]); L.stroke(); L.restore();
            g.save(); g.globalAlpha = al * a * 0.9; g.strokeStyle = col; g.lineWidth = w * 0.6; g.lineCap = 'round'; g.beginPath(); g.moveTo(A[0], A[1]); g.lineTo(B[0], B[1]); g.stroke(); g.restore();
        };
        const kick = 1 + (fx.kick ?? 0) * 0.35;
        for (const [c, w] of AVES.concat([[0, 12]])) {
            const col = c === 0 ? P.pink : c === -75 || c === -185 ? P.gold : P.orange;
            for (let z = LAND.z0; z < LAND.z1; z += 50) seg([c, 0.1, z], [c, 0.1, Math.min(LAND.z1, z + 50)], col, w * 0.16, (c === 0 ? 0.9 : 0.7) * kick);
        }
        for (const [za, zb] of STREETS) { const z = (za + zb) / 2; for (let x = LAND.x0; x < -6; x += 50) seg([x, 0.1, z], [Math.min(-6, x + 50), 0.1, z], P.orange, 1.5, 0.55 * kick); }
    }

    // --- the buildings -------------------------------------------------------------------------------
    function building(g, L, cam, b, T, d, fx, env) {
        const { x0, x1, z0, z1, h } = b, c = cam.pos, y0 = b.base ?? 0;
        const s = cam.f / Math.max(1, dist(cam, (x0 + x1) / 2, (y0 + h) / 2, (z0 + z1) / 2));
        const fine = s > 2.2, jit = fine ? 0.5 : 0, w = fine ? lw(s, 0.035) : 0;
        const walls = [];
        if (c[0] < x0) walls.push(['W', [[x0, y0, z1], [x0, y0, z0], [x0, h, z0], [x0, h, z1]], 0.55]);
        if (c[0] > x1) walls.push(['E', [[x1, y0, z0], [x1, y0, z1], [x1, h, z1], [x1, h, z0]], 0.9]);
        if (c[2] < z0) walls.push(['S', [[x0, y0, z0], [x1, y0, z0], [x1, h, z0], [x0, h, z0]], 0.75]);
        if (c[2] > z1) walls.push(['N', [[x1, y0, z1], [x0, y0, z1], [x0, h, z1], [x1, h, z1]], 0.65]);
        for (const [face, pts, k] of walls) {
            const q = quad(cam, pts); if (!q) continue;
            const front = face === 'E' && (b.kind === 'deco' || b.kind === 'diner' || b.kind === 'laundry');
            const col = front ? b.wall : css(mix(b.wall, '#04022e', 1 - k));
            const seed = b.seed * 5 + face.charCodeAt(0);
            if (front && s > 5) {
                Ink.shape(g, q, col, { w, seed, d, jit });
                const A = cam.p(pts[0]), D = cam.p(pts[3]), C3 = cam.p(pts[2]);
                if (s < 14 && A[2] > 2 && D[2] > 2 && C3[2] > 2) CloudsLife.wall(g, null, q, [A[0], A[1]], [D[0], D[1]], [C3[0], C3[1]], Math.hypot(pts[1][0] - pts[0][0], pts[1][2] - pts[0][2]), h - y0, b.v, 'stucco', b.uOff, 9);
                else if (s >= 14) {
                    const lt = css(mix(b.wall, '#ffffff', 0.22)), dk = css(mix(b.wall, '#1a0450', 0.32)), len = b.z1 - b.z0;
                    g.save(); Neon.path(g, q); g.clip();
                    for (let i = 0; i < 70; i++) {
                        const u = b.z0 + H(b.seed, i, 11) * len, yy = y0 + H(b.seed, i, 12) * (h - y0), l = 0.6 + H(b.seed, i, 13) * 1.4, vert = i % 3 !== 0;
                        const A2 = cam.p([b.x1 + 0.03, yy, u]), B2 = cam.p(vert ? [b.x1 + 0.03, yy + l, u + 0.05] : [b.x1 + 0.03, yy + 0.05, u + l]); if (A2[2] < 1 || B2[2] < 1) continue;
                        Ink.brush(g, [[A2[0], A2[1]], [B2[0], B2[1]]], { w: cap(0.035 * cam.f / A2[2], 1, 4), col: i % 2 ? lt : dk, seed: b.seed * 13 + i, d, taper: 0.45, wob: 0.6 });
                    }
                    g.restore();
                }
                facade(g, L, cam, b, T, d, fx, s);
            }
            else {
                // a far wall: its windows and texture from the cached patterns, laid through the camera
                const wm = (pts[0][0] + pts[2][0]) / 2, wz = (pts[0][2] + pts[2][2]) / 2, ws = cam.f / Math.max(1, dist(cam, wm, (y0 + h) / 2, wz));
                const A = cam.p(pts[0]), D = cam.p(pts[3]), C3 = cam.p(pts[2]), B1 = cam.p(pts[1]);
                const len = Math.hypot(pts[1][0] - pts[0][0], pts[1][2] - pts[0][2]);
                if (ws < 9 && A[2] > 2 && D[2] > 2 && C3[2] > 2 && B1[2] > 2) {
                    Ink.shape(g, q, col, { w: 0, seed, d, jit: 0 });
                    if (ws > 0.9) CloudsLife.wall(g, L, q, [A[0], A[1]], [D[0], D[1]], [C3[0], C3[1]], len, h - y0, b.v, b.style, b.uOff + (face === 'N' || face === 'W' ? 6.8 : 0), ws);
                    if (w) Ink.brush(g, q, { w, seed, d, closed: true });
                } else { Ink.shape(g, q, col, { w, seed, d, jit }); windows(g, L, cam, b, face, pts, s, d, fx); }
            }
            // the light the street throws on the wall's foot: strokes of the lamps' gold
            if (s > 6 && !front) { const A = cam.p(pts[0]), B = cam.p(pts[1]); Ink.hatch(g, [A[0], A[1]], [B[0], B[1]], { count: 4, len: cap(0.6 * s, 4, 30), w: cap(0.05 * s, 1, 3), col: face === 'E' ? P.pink : P.salmon, seed: b.seed + face.charCodeAt(0), d, n: [0, -1], ang: 0.3 }); }
        }
        if (c[1] > h) {
            const q = quad(cam, [[x0, h, z0], [x1, h, z0], [x1, h, z1], [x0, h, z1]]);
            if (q) {
                Ink.shape(g, q, b.roof, { w, seed: b.seed * 5 + 1, d, jit });
                // the parapet's inner line, the roof's lit lip
                if (s > 3) { const i = 0.5, q2 = quad(cam, [[x0 + i, h, z0 + i], [x1 - i, h, z0 + i], [x1 - i, h, z1 - i], [x0 + i, h, z1 - i]]); if (q2) Ink.brush(g, q2, { w: cap(0.04 * s, 0.8, 2.5), col: css(mix(b.roof, '#ffffff', 0.12)), seed: b.seed + 9, d, closed: true, alpha: 0.9, light: true }); }
                roofThings(g, L, cam, b, T, d, fx, s);
            }
        }
        // a neon tube along the roof's edge facing the street (or the hotel's front)
        if (b.tube || b.kind === 'deco') {
            const yy = h - 0.35, e = b.kind === 'deco' ? [[x1 + 0.05, yy, z0], [x1 + 0.05, yy, z1]] : (H(b.seed, 4, 0) < 0.5 ? [[x0, yy + 0.4, z0 - 0.05], [x1, yy + 0.4, z0 - 0.05]] : [[x1 + 0.05, yy + 0.4, z0], [x1 + 0.05, yy + 0.4, z1]]);
            const facing = e[0][0] === e[1][0] ? c[0] > x1 : c[2] < z0 || c[1] > h;
            if (facing) tube(g, L, cam, e[0], e[1], b.tube ?? P.cyan, 0.12, s, b.seed, d, fx);
        }
    }

    function tube(g, L, cam, a3, b3, col, wm, s, seed, d, fx) {
        const A = cam.p(a3), B = cam.p(b3); if (A[2] < 0.5 || B[2] < 0.5) return;
        const w = cap(wm * s, 0.8, 7), core = css(mix(col, '#ffffff', 0.55));
        for (const c of [g, L]) { c.save(); c.lineCap = 'round'; c.strokeStyle = col; c.globalAlpha = c === L ? 0.9 : 1; c.lineWidth = c === L ? w * 1.8 : w; c.beginPath(); c.moveTo(A[0], A[1]); c.lineTo(B[0], B[1]); c.stroke(); if (c === g && w > 2) { c.strokeStyle = core; c.lineWidth = w * 0.35; c.stroke(); } c.restore(); }
    }

    // windows: a grid of lit and dark panes per floor (lit ones also on the light layer)
    function windows(g, L, cam, b, face, pts, s, d, fx) {
        if (s < 0.7) return;
        const [p0, p1] = pts, len = Math.hypot(p1[0] - p0[0], p1[2] - p0[2]); if (len < 3) return;
        const ux = (p1[0] - p0[0]) / len, uz = (p1[2] - p0[2]) / len, off = 0.04;
        const nx = face === 'E' ? off : face === 'W' ? -off : 0, nz = face === 'N' ? off : face === 'S' ? -off : 0;
        const y0 = b.base ?? 0, floors = Math.max(1, Math.floor((b.h - y0 - 0.8) / 3.2)), cols = Math.max(1, Math.floor(len / 3.4)), cw = len / cols;
        const k0 = Math.round((b.uOff + (face === 'N' || face === 'W' ? 6.8 : 0)) / 3.4);
        for (let f = 0; f < floors; f++) for (let k = 0; k < cols; k++) {
            const pn = CloudsLife.pane(b.v, (k + k0) % 16, f + Math.round(y0 / 3.2)), lit = pn.lit;
            if (!lit && s < 5) continue;
            const ya = y0 + f * 3.2 + 1.1, yb = ya + 1.4, ua = k * cw + cw * 0.22, ub = ua + cw * 0.56;
            const P4 = [[p0[0] + ux * ua + nx, ya, p0[2] + uz * ua + nz], [p0[0] + ux * ub + nx, ya, p0[2] + uz * ub + nz], [p0[0] + ux * ub + nx, yb, p0[2] + uz * ub + nz], [p0[0] + ux * ua + nx, yb, p0[2] + uz * ua + nz]];
            const q = quad(cam, P4); if (!q) continue;
            const col = lit ? pn.col : '#120540';
            Ink.shape(g, q, col, { w: s > 14 ? lw(s, 0.02) : 0, seed: b.seed * 31 + f * 7 + k, d, jit: s > 14 ? 0.4 : 0, light: lit });
            // a TV's blue flickers on the light layer, drawing by drawing
            if (lit && s > 2) { L.save(); L.globalAlpha = pn.kind === 'tv' ? 0.25 + 0.5 * H(b.seed + k, f, d) : 0.45; L.fillStyle = col; Neon.path(L, q); L.fill(); L.restore(); }
            if (lit && s > 9) {
                const at = (u, v) => { const uu = ua + (ub - ua) * u, yy = ya + (yb - ya) * v; return cam.p([p0[0] + ux * uu + nx * 1.5, yy, p0[2] + uz * uu + nz * 1.5]); };
                if (pn.kind === 'blinds') for (let j = 1; j < 5; j++) { const A = at(0, j / 5), Bb = at(1, j / 5); Ink.brush(g, [[A[0], A[1]], [Bb[0], Bb[1]]], { w: cap(0.04 * s, 1, 2.5), col: css(mix(col, '#2a0a50', 0.55)), seed: b.seed + f * 50 + k * 5 + j, d, taper: 0.1, wob: 0.3, light: true }); }
                if (pn.kind === 'curtains') for (const [u0, u1] of [[0, 0.3], [0.7, 1]]) { const qq = [at(u0, 0), at(u1, 0), at(u1, 1), at(u0, 1)].map((p) => [p[0], p[1]]); Ink.shape(g, qq, (k + f) % 2 ? P.red : P.magenta, { w: lw(s, 0.015), seed: b.seed + f * 9 + k, d, jit: 0.3 }); }
                if (pn.kind === 'figure') { const hc = at(0.5, 0.62), sh = at(0.5, 0.3), r = 0.17 * s; const hp = []; for (let i = 0; i < 9; i++) { const an = i / 9 * Math.PI * 2; hp.push([hc[0] + Math.cos(an) * r, hc[1] + Math.sin(an) * r * 1.15]); } Ink.shape(g, hp, '#2a0a50', { w: 0, seed: b.seed + f + k * 3, d, jit: 0.2 }); const bl = at(0.25, 0), br = at(0.75, 0); Ink.shape(g, [[bl[0], bl[1]], [sh[0] - r * 1.4, sh[1]], [sh[0] + r * 1.4, sh[1]], [br[0], br[1]]], '#2a0a50', { w: 0, seed: b.seed + f + k * 5, d, jit: 0.2 }); }
                if (pn.kind === 'tv') { const qq = [at(0.3, 0.2), at(0.7, 0.2), at(0.7, 0.5), at(0.3, 0.5)].map((p) => [p[0], p[1]]); Ink.shape(g, qq, '#c8ecff', { w: 0, seed: b.seed + k, d, jit: 0.2, light: true }); }
            }
            if (!lit && s > 14) { const A = cam.p(P4[3]), B = cam.p(P4[2]); Ink.brush(g, [[A[0], A[1] + 2], [B[0], B[1] + 2]], { w: cap(0.04 * s, 1, 2.5), col: P.violet, seed: b.seed + f * 3 + k, d, taper: 0.4, light: true }); }
        }
    }

    // on the roofs: boxes of the air conditioning, a water tank, pools on the towers
    function roofThings(g, L, cam, b, T, d, fx, s) {
        if (s < 1.5) return;
        const { x0, x1, z0, z1, h } = b;
        const n = 1 + Math.floor(H(b.seed, 6, 0) * 3);
        for (let i = 0; i < n; i++) {
            const cx = x0 + 2 + (x1 - x0 - 4) * H(b.seed, 20 + i, 0), cz = z0 + 2 + (z1 - z0 - 4) * H(b.seed, 30 + i, 0), r = 0.9 + H(b.seed, 40 + i, 0) * 0.8, hh = 1.1;
            if (b.ours && cz > z1 - 12) continue;                // their roof's far end stays clear for the two of them
            const top = quad(cam, [[cx - r, h + hh, cz - r], [cx + r, h + hh, cz - r], [cx + r, h + hh, cz + r], [cx - r, h + hh, cz + r]]);
            const sideS = cam.pos[2] < cz - r ? quad(cam, [[cx - r, h, cz - r], [cx + r, h, cz - r], [cx + r, h + hh, cz - r], [cx - r, h + hh, cz - r]]) : null;
            const sideE = cam.pos[0] > cx + r ? quad(cam, [[cx + r, h, cz - r], [cx + r, h, cz + r], [cx + r, h + hh, cz + r], [cx + r, h + hh, cz - r]]) : null;
            const sideW = cam.pos[0] < cx - r ? quad(cam, [[cx - r, h, cz + r], [cx - r, h, cz - r], [cx - r, h + hh, cz - r], [cx - r, h + hh, cz + r]]) : null;
            if (s > 2.5) for (const q of [sideS, sideE, sideW]) if (q) Ink.shape(g, q, '#2a0c6e', { w: s > 3 ? lw(s, 0.04) : 0, seed: b.seed + i * 3, d, jit: 0.3 });
            if (top) Ink.shape(g, top, '#5a2aa8', { w: s > 3 ? lw(s, 0.04) : 0, seed: b.seed + i * 3 + 1, d, jit: s > 3 ? 0.3 : 0 });
            if (top && s > 4) { const cc = cam.p([cx, h + hh + 0.02, cz]), rr = r * 0.6 * cam.f / cc[2], an = T * 9 + i; Ink.brush(g, [[cc[0] - Math.cos(an) * rr, cc[1] - Math.sin(an) * rr * 0.6], [cc[0] + Math.cos(an) * rr, cc[1] + Math.sin(an) * rr * 0.6]], { w: cap(0.1 * s, 1, 4), seed: b.seed + i * 7, d, taper: 0.2 }); }
        }
        // a water tank on legs
        if (b.tank && !b.ours) tank(g, cam, x0 + 3, z1 - 3, h, 1.5, 2.4, b.seed, d, s);
        // an antenna with its red light, blinking on the beat
        if (b.antenna) { const a = cam.p([x1 - 2, h, z0 + 2]), t = cam.p([x1 - 2, h + 6, z0 + 2]); if (a[2] > 1) { Ink.brush(g, [[a[0], a[1]], [t[0], t[1]]], { w: cap(0.06 * s, 0.8, 3), seed: b.seed + 33, d, taper: 0.1 }); if (Math.floor(Song.beatAt(T) * 2) % 2 === 0) dot(g, L, t[0], t[1], cap(0.25 * s, 1, 4), P.red, 1); } }
        // a lit sign standing on the roof: a cocktail glass, a palm or a star in neon tubes
        if (b.roofSign >= 0) roofSign(g, L, cam, b, s, d, fx);
        for (const pool of build().pools) if (pool.y && pool.seed === b.seed) poolDraw(g, L, cam, pool, pool.y, d, { W: cam.W, H: cam.H });
    }

    function tank(g, cam, x, z, h, r, th, seed, d, s) {
        const b0 = cam.p([x, h + 1.4, z]), t0 = cam.p([x, h + 1.4 + th, z]); if (b0[2] < 2) return;
        const k = cam.f / b0[2], rw = r * k, el = cap((cam.pos[1] - h - 2) / Math.max(1, b0[2]), 0, 1);
        if (s > 3) for (const dx of [-0.8, 0.8]) { const a = cam.p([x + dx, h, z + 0.6]), bb = cam.p([x + dx, h + 1.4, z + 0.6]); Ink.brush(g, [[a[0], a[1]], [bb[0], bb[1]]], { w: cap(0.08 * k, 1, 4), seed: seed + dx * 10, d, taper: 0.1 }); }
        Ink.shape(g, [[b0[0] - rw, b0[1]], [t0[0] - rw, t0[1]], [t0[0] + rw, t0[1]], [b0[0] + rw, b0[1]]], '#4a1a8a', { w: s > 3 ? lw(k, 0.04) : 0, seed: seed + 41, d, jit: 0.3 });
        const ry = rw * (0.15 + 0.85 * el), cap0 = []; for (let i = 0; i < 14; i++) { const an = i / 14 * Math.PI * 2; cap0.push([t0[0] + Math.cos(an) * rw, t0[1] + Math.sin(an) * ry]); }
        Ink.shape(g, cap0, '#6a3ab0', { w: s > 3 ? lw(k, 0.04) : 0, seed: seed + 42, d, jit: 0.3 });
        if (s > 3) for (const v of [0.3, 0.65]) { const yy = b0[1] + (t0[1] - b0[1]) * v; Ink.brush(g, [[b0[0] - rw, yy], [b0[0], yy + ry * 0.4], [b0[0] + rw, yy]], { w: cap(0.04 * k, 0.8, 2.5), seed: seed + v * 100, d, taper: 0.1 }); }
        if (s > 3) Ink.brush(g, [[b0[0] + rw * 0.6, b0[1] - 2], [t0[0] + rw * 0.6, t0[1] + 2]], { w: cap(0.06 * k, 1, 3), col: P.pink, seed: seed + 43, d, taper: 0.3 });
    }
    const PICTO = [
        [[[-0.5, 0.95], [0.5, 0.95], [0, 0.45], [-0.5, 0.95]], [[0, 0.45], [0, 0.15]], [[-0.28, 0.1], [0.28, 0.1]], [[0.18, 0.8], [0.32, 0.72], [0.22, 0.62], [0.12, 0.7], [0.18, 0.8]]],
        [[[0.05, 0.08], [0.0, 0.4], [-0.08, 0.78]], [[-0.08, 0.78], [-0.5, 0.62]], [[-0.08, 0.78], [0.42, 0.7]], [[-0.08, 0.78], [-0.3, 0.98]], [[-0.08, 0.78], [0.25, 0.95]]],
        [[[0, 0.98], [0.12, 0.62], [0.48, 0.6], [0.2, 0.4], [0.3, 0.05], [0, 0.26], [-0.3, 0.05], [-0.2, 0.4], [-0.48, 0.6], [-0.12, 0.62], [0, 0.98]]],
    ];
    function roofSign(g, L, cam, b, s, d, fx) {
        const { x0, x1, z0, h } = b, xc = (x0 + x1) / 2, zf = z0 + 1.2, w = Math.min(8, (x1 - x0) * 0.6), hh = w * 0.55, y0 = h + 1.2;
        if (cam.pos[2] > zf) return;
        const q = quad(cam, [[xc - w / 2, y0, zf], [xc + w / 2, y0, zf], [xc + w / 2, y0 + hh, zf], [xc - w / 2, y0 + hh, zf]]); if (!q) return;
        for (const dx of [-0.35, 0.35]) { const a = cam.p([xc + dx * w, h, zf + 0.3]), bb = cam.p([xc + dx * w, y0, zf]); Ink.brush(g, [[a[0], a[1]], [bb[0], bb[1]]], { w: cap(0.1 * s, 1, 4), seed: b.seed + dx * 10, d, taper: 0.1 }); }
        Ink.shape(g, q, '#24083e', { w: s > 2 ? lw(s, 0.04) : 0, seed: b.seed + 51, d, jit: 0.3 });
        const col = [P.cyan, P.pink, P.gold][b.roofSign], on = (fx.lampPower ?? 1);
        for (const line of PICTO[b.roofSign]) for (let i = 0; i + 1 < line.length; i++) {
            const P0 = line[i], P1 = line[i + 1];
            tube(g, L, cam, [xc + P0[0] * w * 0.8, y0 + 0.1 + P0[1] * hh * 0.85, zf - 0.05], [xc + P1[0] * w * 0.8, y0 + 0.1 + P1[1] * hh * 0.85, zf - 0.05], col, 0.12 * on, s, b.seed + i, d, fx);
        }
    }

    // an Art Deco hotel's front (and the diner's, the laundromat's): eyebrows over the windows,
    // a lit lobby, a fin carrying a neon tube, the name in neon on a raised parapet
    function facade(g, L, cam, b, T, d, fx, s) {
        const { x1: X, z0, z1, h } = b, len = z1 - z0, zc = (z0 + z1) / 2;
        const P3 = (y, z, dx = 0.05) => [X + dx, y, z];
        const face = (pts, col, o = {}) => { const q = quad(cam, pts); if (q) Ink.shape(g, q, col, { w: o.w ?? lw(s, 0.03), seed: o.seed ?? Math.round(pts[0][1] * 13 + pts[0][2] * 7), d, jit: 0.4, light: o.light }); return q; };
        if (b.kind === 'diner') return diner(g, L, cam, b, T, d, fx, s, face, P3);
        if (b.kind === 'laundry') return laundry(g, L, cam, b, T, d, fx, s, face, P3);
        const floors = Math.max(2, Math.floor((h - 0.6) / 3.4)), cols = Math.max(2, Math.floor(len / 3.6)), cw = len / cols;
        const light = css(mix(b.wall, '#ffffff', 0.25)), dark = css(mix(b.wall, '#04022e', 0.45));
        // the racing stripes: three thin bands of a darker ink round the corners
        for (const yy of [h - 1.4, h - 1.8, h - 2.2]) face([P3(yy, z0), P3(yy, z1), P3(yy + 0.14, z1), P3(yy + 0.14, z0)], dark, { w: 0 });
        // the lobby: lit glass with mullions, a canopy over it
        const la = zc - len * 0.28, lb = zc + len * 0.28;
        const lob = face([P3(0.3, la), P3(0.3, lb), P3(3.0, lb), P3(3.0, la)], P.gold, { light: true });
        if (lob) { L.save(); L.globalAlpha = 0.55; L.fillStyle = P.orange; Neon.path(L, lob); L.fill(); L.restore(); }
        for (let z = la + 1.6; z < lb - 0.5; z += 1.6) { const A = cam.p(P3(0.3, z, 0.08)), B = cam.p(P3(3.0, z, 0.08)); Ink.brush(g, [[A[0], A[1]], [B[0], B[1]]], { w: lw(s, 0.06), seed: b.seed + Math.round(z * 3), d, taper: 0.05 }); }
        // floors above: windows, each under an eyebrow
        for (let f = 1; f < floors; f++) for (let k = 0; k < cols; k++) {
            const ya = f * 3.4 + 0.2, yb = ya + 1.6, za = z0 + k * cw + cw * 0.2, zb = za + cw * 0.6;
            const lit = H(b.seed, f * 17 + k, 2) < 0.45 || (b.ours && f === floors - 1 && k === Math.floor(cols / 2) + 1);
            const col = lit ? WARM[Math.floor(H(b.seed, f * 5 + k, 7) * 4)] : '#160646';
            const q = face([P3(ya, za, 0.06), P3(ya, zb, 0.06), P3(yb, zb, 0.06), P3(yb, za, 0.06)], col, { w: lw(s, 0.025), light: lit });
            if (lit && q) { L.save(); L.globalAlpha = 0.5; L.fillStyle = col; Neon.path(L, q); L.fill(); L.restore(); }
            // the blinds: dark slats across the lit pane
            if (lit && s > 16) for (let j = 1; j < 5; j++) { const yy = ya + (yb - ya) * j / 5, A = cam.p(P3(yy, za + 0.1, 0.07)), B = cam.p(P3(yy, zb - 0.1, 0.07)); Ink.brush(g, [[A[0], A[1]], [B[0], B[1]]], { w: cap(0.05 * s, 1, 3), col: css(mix(col, '#2a0a50', 0.6)), seed: b.seed + f * 50 + k * 5 + j, d, taper: 0.1, wob: 0.3, light: true }); }
            // the eyebrow: a thin slab out of the wall over the window, its lit underside
            const ye = yb + 0.25, out = 0.7;
            const under = cam.pos[1] < ye ? [P3(ye, za - 0.3, 0), P3(ye, zb + 0.3, 0), P3(ye, zb + 0.3, out), P3(ye, za - 0.3, out)] : [P3(ye + 0.15, za - 0.3, 0), P3(ye + 0.15, zb + 0.3, 0), P3(ye + 0.15, zb + 0.3, out), P3(ye + 0.15, za - 0.3, out)];
            face(under, cam.pos[1] < ye ? light : b.wall, { w: lw(s, 0.025) });
            face([P3(ye, za - 0.3, out), P3(ye, zb + 0.3, out), P3(ye + 0.15, zb + 0.3, out), P3(ye + 0.15, za - 0.3, out)], dark, { w: 0 });
        }
        // the canopy over the lobby with a tube under its lip
        const yc = 3.25, oc = 1.6;
        face(cam.pos[1] < yc ? [P3(yc, la - 0.6, 0), P3(yc, lb + 0.6, 0), P3(yc, lb + 0.6, oc), P3(yc, la - 0.6, oc)] : [P3(yc + 0.3, la - 0.6, 0), P3(yc + 0.3, lb + 0.6, 0), P3(yc + 0.3, lb + 0.6, oc), P3(yc + 0.3, la - 0.6, oc)], cam.pos[1] < yc ? P.salmon : b.wall);
        face([P3(yc, la - 0.6, oc), P3(yc, lb + 0.6, oc), P3(yc + 0.3, lb + 0.6, oc), P3(yc + 0.3, la - 0.6, oc)], dark, { w: lw(s, 0.03) });
        tube(g, L, cam, P3(yc - 0.05, la - 0.5, oc + 0.02), P3(yc - 0.05, lb + 0.5, oc + 0.02), b.tube, 0.1, s, b.seed + 77, d, fx);
        // the raised parapet over the middle, the fin with its vertical tube, the name
        const pa = zc - Math.min(7, len * 0.25), pb = zc + Math.min(7, len * 0.25), ph = 2.6;
        face([P3(h, pa, 0), P3(h, pb, 0), P3(h + ph, pb, 0), P3(h + ph, pa, 0)], b.wall);
        if (cam.pos[1] > h + ph) face([P3(h + ph, pa, 0), P3(h + ph, pb, 0), P3(h + ph, pb, -3), P3(h + ph, pa, -3)], b.roof);
        const fz = b.name ? pa - 0.9 : zc, fo = 1.3;
        const finSide = cam.pos[2] < fz ? -0.15 : 0.15;
        face([[X, 3.6, fz + finSide], [X + fo, 3.6, fz + finSide], [X + fo, h + ph + 1.2, fz + finSide], [X, h + ph + 1.2, fz + finSide]], light, { w: lw(s, 0.03) });
        tube(g, L, cam, [X + fo + 0.05, 3.8, fz], [X + fo + 0.05, h + ph + 1.0, fz], b.tube, 0.11, s, b.seed + 78, d, fx);
        if (b.name) sign(g, L, cam, X + 0.12, h + 0.55, zc + 0.7, b.name, 1.5, b.ours ? P.pink : b.tube, pb - pa - 1.4, fx);
    }

    // neon letters on a wall facing +x (text along +z), baseline at y0, letters hgt m tall
    function sign(g, L, cam, x, y0, zc, text, hgt, col, maxW, fx, on = 1) {
        const p0 = cam.p([x, y0, zc]), pu = cam.p([x, y0, zc + 1]), pv = cam.p([x, y0 + 1, zc]);
        if (p0[2] < 1 || pu[2] < 1 || on <= 0) return;
        // the letters are laid with an affine map: only where the wall faces the camera enough
        // and the sign is small against its distance (else the map smears them across the frame)
        const dd = dist(cam, x, y0, zc), facing = (cam.pos[0] - x) / dd;
        if (facing < 0.3 || p0[2] < Math.max(6, (maxW || 6) * 0.55)) return;
        const ux = (pu[0] - p0[0]) / 100, uy = (pu[1] - p0[1]) / 100, vx = -(pv[0] - p0[0]) / 100, vy = -(pv[1] - p0[1]) / 100;
        const core = css(mix(col, '#ffffff', 0.6));
        for (const c of [g, L]) {
            c.save(); c.transform(ux, uy, vx, vy, p0[0], p0[1]);
            c.font = `${Math.round(hgt * 130)}px Shrikhand`; c.textAlign = 'center'; c.textBaseline = 'alphabetic'; c.lineJoin = 'round'; c.lineCap = 'round';
            const m = c.measureText(text).width, k = maxW ? Math.min(1, (maxW * 100) / m) : 1; c.scale(k, 1);
            c.globalAlpha = on * (c === L ? 0.95 : 1);
            c.strokeStyle = col; c.lineWidth = hgt * (c === L ? 26 : 14); c.strokeText(text, 0, 0);
            if (c === g) { c.strokeStyle = core; c.lineWidth = hgt * 5; c.strokeText(text, 0, 0); }
            c.restore();
        }
    }

    // the diner: a chrome band, a long lit window with the counter and its stools, pendant lamps,
    // OPEN 24 HRS in the window, DINER on a board over the roof
    function diner(g, L, cam, b, T, d, fx, s, face, P3) {
        const { z0, z1, h } = b, wa = z0 + 1.2, wb = z1 - 4.2;
        face([P3(0, z0), P3(0, z1), P3(0.6, z1), P3(0.6, z0)], P.purple, { w: lw(s, 0.03) });
        // chrome: horizontal strokes of the neon it reflects
        for (const [yy, col] of [[0.15, P.cyan], [0.32, P.pink], [0.48, P.cream]]) { const A = cam.p(P3(yy, z0 + 0.3, 0.07)), B = cam.p(P3(yy, z1 - 0.3, 0.07)); Ink.brush(g, [[A[0], A[1]], [B[0], B[1]]], { w: cap(0.05 * s, 1, 3), col, seed: b.seed + Math.round(yy * 100), d, taper: 0.1, light: true }); }
        // the upper wall: three bands of the diner's chrome trim, a cornice of cyan neon
        for (const [yy, col] of [[3.2, P.salmon], [3.75, P.magenta], [4.3, P.salmon]]) face([P3(yy, z0 + 0.2, 0.02), P3(yy, z1 - 0.2, 0.02), P3(yy + 0.22, z1 - 0.2, 0.02), P3(yy + 0.22, z0 + 0.2, 0.02)], col, { w: lw(s, 0.02) });
        tube(g, L, cam, P3(h - 0.15, z0 + 0.2, 0.05), P3(h - 0.15, z1 - 0.2, 0.05), P.cyan, 0.09, s, b.seed + 503, d, fx);
        const win = face([P3(0.65, wa), P3(0.65, wb), P3(2.75, wb), P3(2.75, wa)], P.orange, { light: true });
        if (win) { L.save(); L.globalAlpha = 0.5; L.fillStyle = P.orange; Neon.path(L, win); L.fill(); L.restore(); }
        g.save(); if (win) { Neon.path(g, win); g.clip(); }           // the inside stays behind the glass
        // inside, on the window's plane: the back wall's warm top, a menu board, the counter, stools
        face([P3(1.9, wa + 0.05, 0.03), P3(1.9, wb - 0.05, 0.03), P3(2.7, wb - 0.05, 0.03), P3(2.7, wa + 0.05, 0.03)], P.gold, { w: 0, light: true });
        face([P3(2.0, wa + 3, 0.04), P3(2.0, wa + 7, 0.04), P3(2.55, wa + 7, 0.04), P3(2.55, wa + 3, 0.04)], '#2a0a50', { w: lw(s, 0.02) });
        for (let i = 0; i < 4; i++) { const A = cam.p(P3(2.42 - i * 0.12, wa + 3.3, 0.05)), B = cam.p(P3(2.42 - i * 0.12, wa + 6.2 - i * 0.5, 0.05)); Ink.brush(g, [[A[0], A[1]], [B[0], B[1]]], { w: cap(0.03 * s, 1, 2), col: P.cream, seed: b.seed + 300 + i, d, taper: 0.3, light: true }); }
        const ce = wa + 10.4;                                  // the counter's end; booths beyond it
        // the pass to the kitchen in the back wall, the cook behind it in a white cap
        face([P3(1.35, wa + 7.6, 0.03), P3(1.35, wa + 9.8, 0.03), P3(1.88, wa + 9.8, 0.03), P3(1.88, wa + 7.6, 0.03)], '#b04a28', { w: lw(s, 0.02) });
        { const hc = cam.p(P3(1.66, wa + 8.5, 0.035)), r = 0.12 * s, hp = []; for (let i = 0; i < 10; i++) { const an = i / 10 * Math.PI * 2; hp.push([hc[0] + Math.cos(an) * r, hc[1] + Math.sin(an) * r * 1.15]); }
          const sh0 = cam.p(P3(1.36, wa + 8.15, 0.035)), sh1 = cam.p(P3(1.36, wa + 8.85, 0.035)), nk = cam.p(P3(1.5, wa + 8.5, 0.035));
          Ink.shape(g, [[sh0[0], sh0[1]], [nk[0] - r * 1.6, nk[1]], [nk[0] + r * 1.6, nk[1]], [sh1[0], sh1[1]]], '#3a0a40', { w: 0, seed: b.seed + 610, d, jit: 0.3 });
          Ink.shape(g, hp, '#3a0a40', { w: 0, seed: b.seed + 611, d, jit: 0.2 });
          const ht = cam.p(P3(1.95, wa + 8.5, 0.036)); Ink.shape(g, [[hc[0] - r * 0.9, hc[1] - r * 0.7], [ht[0] - r * 1.2, ht[1]], [ht[0] + r * 1.2, ht[1]], [hc[0] + r * 0.9, hc[1] - r * 0.7]], P.cream, { w: lw(s, 0.015), seed: b.seed + 612, d, jit: 0.3, light: true });
          const pl = cam.p(P3(1.38, wa + 9.3, 0.036)); Ink.brush(g, [[pl[0] - r * 1.5, pl[1]], [pl[0] + r * 1.5, pl[1]]], { w: cap(0.05 * s, 1, 3), col: P.cream, seed: b.seed + 613, d, taper: 0.2, light: true }); }
        // the waitress behind the counter with the coffee pot, pouring towards a stool
        { const ft = cam.p(P3(0, wa + 4.6, 0.035)), sw = cam.f / ft[2];
          CloudsLife.walker(g, ft[0], ft[1], sw, 0, 0, P.pink, b.seed + 620, d, { col: '#3a0a40', shirt: '#5a1060', h: 1.66 });
          const sh = cam.p(P3(1.38, wa + 4.75, 0.036)), hand = cam.p(P3(1.25, wa + 5.35, 0.036)), r = 0.11 * sw;
          Ink.brush(g, [[sh[0], sh[1]], [hand[0], hand[1]]], { w: cap(0.07 * sw, 1, 6), col: '#3a0a40', seed: b.seed + 621, d, taper: 0.2 });
          Ink.shape(g, [[hand[0] - r * 0.4, hand[1] - r], [hand[0] + r * 1.6, hand[1] - r], [hand[0] + r * 1.8, hand[1] + r * 1.2], [hand[0] - r * 0.2, hand[1] + r * 1.2]], '#2a0a30', { w: lw(sw, 0.015), seed: b.seed + 622, d, jit: 0.2 });
          Ink.brush(g, [[hand[0] + r * 0.2, hand[1] - r * 0.5], [hand[0] + r * 0.4, hand[1] + r * 0.8]], { w: cap(0.03 * sw, 1, 2), col: P.cream, seed: b.seed + 623, d, taper: 0.3, light: true });
          const pour = cam.p(P3(1.1, wa + 5.55, 0.036)); Ink.brush(g, [[hand[0] + r * 1.7, hand[1] + r * 1.1], [pour[0], pour[1]]], { w: cap(0.02 * sw, 1, 2), col: '#7a3a20', seed: b.seed + 624, d, taper: 0.1 }); }
        // two customers in a booth by the window, facing each other over a table
        for (const [zb, flip] of [[ce + 1.0, 1], [ce + 3.6, -1]]) {
            face([P3(0.65, zb - 0.2, 0.034), P3(0.65, zb + 0.2, 0.034), P3(1.45, zb + 0.2, 0.034), P3(1.45, zb - 0.2, 0.034)], P.red, { w: lw(s, 0.02) });
            const hc = cam.p(P3(1.38, zb + flip * 0.55, 0.035)), r = 0.12 * s, hp = []; for (let i = 0; i < 10; i++) { const an = i / 10 * Math.PI * 2; hp.push([hc[0] + Math.cos(an) * r, hc[1] + Math.sin(an) * r * 1.15]); }
            const s0 = cam.p(P3(0.95, zb + flip * 0.3, 0.035)), s1 = cam.p(P3(0.95, zb + flip * 0.85, 0.035)), nk = cam.p(P3(1.2, zb + flip * 0.55, 0.035));
            Ink.shape(g, [[s0[0], s0[1]], [nk[0] - r * 1.5, nk[1]], [nk[0] + r * 1.5, nk[1]], [s1[0], s1[1]]], flip > 0 ? '#2a1a60' : '#4a0a50', { w: 0, seed: b.seed + 630 + flip, d, jit: 0.3 });
            Ink.shape(g, hp, '#2a0a40', { w: 0, seed: b.seed + 632 + flip, d, jit: 0.2 });
            Ink.brush(g, [[hc[0] + flip * r * 0.6, hc[1] - r * 0.8], [hc[0] + flip * r * 1.0, hc[1] + r * 0.2]], { w: cap(0.025 * s, 1, 2.5), col: flip > 0 ? P.cyan : P.pink, seed: b.seed + 634 + flip, d, taper: 0.4 });
        }
        face([P3(0.92, ce + 1.75, 0.036), P3(0.92, ce + 2.85, 0.036), P3(1.0, ce + 2.85, 0.036), P3(1.0, ce + 1.75, 0.036)], P.cream, { w: lw(s, 0.015), light: true });
        for (const zc of [ce + 2.0, ce + 2.55]) face([P3(1.0, zc, 0.037), P3(1.0, zc + 0.14, 0.037), P3(1.12, zc + 0.15, 0.037), P3(1.12, zc - 0.01, 0.037)], P.cream, { w: lw(s, 0.015) });
        face([P3(0.65, wa + 0.05, 0.04), P3(0.65, ce, 0.04), P3(1.12, ce, 0.04), P3(1.12, wa + 0.05, 0.04)], P.plum, { w: lw(s, 0.02) });
        face([P3(1.12, wa + 0.05, 0.045), P3(1.12, ce, 0.045), P3(1.2, ce, 0.045), P3(1.2, wa + 0.05, 0.045)], P.cream, { w: 0, light: true });
        // the pie case on the counter: a glass box, wedges of pie on two shelves
        face([P3(1.2, wa + 6.7, 0.046), P3(1.2, wa + 7.7, 0.046), P3(1.75, wa + 7.7, 0.046), P3(1.75, wa + 6.7, 0.046)], '#bfefff', { w: lw(s, 0.02), light: true });
        for (const [yy, zz] of [[1.25, wa + 6.85], [1.25, wa + 7.25], [1.5, wa + 7.0]]) { const a = cam.p(P3(yy, zz, 0.047)), bq = cam.p(P3(yy, zz + 0.3, 0.047)), t = cam.p(P3(yy + 0.16, zz + 0.05, 0.047)); Ink.shape(g, [[a[0], a[1]], [bq[0], bq[1]], [t[0], t[1]]], [P.gold, P.salmon, P.orange][Math.round(zz * 3) % 3], { w: lw(s, 0.015), seed: b.seed + Math.round(zz * 31 + yy * 7), d, jit: 0.2 }); }
        // a coffee pot and cups on the counter, the steam rising
        for (let i = 0; i < 2; i++) { const z = wa + 2 + i * 6.3, cup = face([P3(1.2, z, 0.05), P3(1.2, z + 0.22, 0.05), P3(1.42, z + 0.25, 0.05), P3(1.42, z - 0.03, 0.05)], P.cream, { w: lw(s, 0.02) }); const st = [0, 1, 2].map((j) => cam.p(P3(1.5 + j * 0.18, z + 0.1 + 0.06 * Math.sin(T * 3 + j * 1.3 + i), 0.05))); if (cup) Ink.brush(g, st.map((p) => [p[0], p[1]]), { w: cap(0.03 * s, 1, 2), col: P.pink, seed: b.seed + 400 + i, d, taper: 0.5, alpha: 0.8, light: true }); }
        // stools: red seats on chrome posts below the counter's lip
        for (let z = wa + 1; z < ce - 0.3; z += 1.5) { const c0 = cam.p(P3(0.75, z, 0.06)), r = 0.28 * s; Ink.shape(g, [[c0[0] - r, c0[1]], [c0[0] - r * 0.85, c0[1] - r * 0.4], [c0[0] + r * 0.85, c0[1] - r * 0.4], [c0[0] + r, c0[1]], [c0[0] + r * 0.6, c0[1] + r * 0.25], [c0[0] - r * 0.6, c0[1] + r * 0.25]], P.red, { w: lw(s, 0.02), seed: b.seed + Math.round(z * 7), d, jit: 0.3 }); }
        // pendant lamps
        for (let z = wa + 1.5; z < wb - 0.5; z += 3) { const top = cam.p(P3(2.75, z, 0.05)), lo = cam.p(P3(2.2, z, 0.05)); Ink.brush(g, [[top[0], top[1]], [lo[0], lo[1]]], { w: cap(0.02 * s, 1, 2), seed: b.seed + Math.round(z * 9), d, taper: 0 }); const r = 0.22 * s; Ink.shape(g, [[lo[0] - r, lo[1] + r * 0.6], [lo[0] - r * 0.4, lo[1]], [lo[0] + r * 0.4, lo[1]], [lo[0] + r, lo[1] + r * 0.6]], P.gold, { w: lw(s, 0.02), seed: b.seed + Math.round(z * 11), d, jit: 0.3, light: true }); dot(null, L, lo[0], lo[1] + r * 0.6, r * 0.8, P.gold, 0.8); }
        g.restore();
        // mullions and the door
        for (let z = wa; z <= wb + 0.01; z += (wb - wa) / 6) { const A = cam.p(P3(0.65, z, 0.08)), B = cam.p(P3(2.75, z, 0.08)); Ink.brush(g, [[A[0], A[1]], [B[0], B[1]]], { w: lw(s, 0.05), col: '#d8c8f8', seed: b.seed + Math.round(z * 5), d, taper: 0.02 }); }
        const door = face([P3(0.05, z1 - 3.4, 0.06), P3(0.05, z1 - 2.2, 0.06), P3(2.3, z1 - 2.2, 0.06), P3(2.3, z1 - 3.4, 0.06)], P.salmon, { light: true });
        sign(g, L, cam, b.x1 + 0.1, 2.35, wa + 2.4, 'OPEN 24 HRS', 0.32, P.cyan, 3.6, fx, 0.85 + 0.15 * Math.sin(T * 17));
        // the board over the roof's edge: DINER, red neon with a cyan border
        face([P3(h + 0.2, z0 + 2, -0.2), P3(h + 0.2, z1 - 2, -0.2), P3(h + 2.6, z1 - 2, -0.2), P3(h + 2.6, z0 + 2, -0.2)], '#2a0a50', { w: lw(s, 0.04) });
        tube(g, L, cam, P3(h + 0.35, z0 + 2.2, -0.1), P3(h + 0.35, z1 - 2.2, -0.1), P.cyan, 0.08, s, b.seed + 501, d, fx);
        tube(g, L, cam, P3(h + 2.45, z0 + 2.2, -0.1), P3(h + 2.45, z1 - 2.2, -0.1), P.cyan, 0.08, s, b.seed + 502, d, fx);
        sign(g, L, cam, b.x1 - 0.08, h + 0.75, (z0 + z1) / 2 + 0.3, 'DINER', 1.35, P.red, z1 - z0 - 6, fx);
        if (!door) return;
    }

    // the laundromat at 4 am: a cool lit window, washers and dryers with round doors (the
    // clothes turning inside on the beat), a clock on the back wall at four
    function laundry(g, L, cam, b, T, d, fx, s, face, P3) {
        const { z0, z1, h } = b, wa = z0 + 0.8, wb = z1 - 0.8;
        const win = face([P3(0.5, wa), P3(0.5, wb), P3(3.2, wb), P3(3.2, wa)], '#8ff0ff', { light: true });
        if (win) { L.save(); L.globalAlpha = 0.35; L.fillStyle = P.cyan; Neon.path(L, win); L.fill(); L.restore(); }
        g.save(); if (win) { Neon.path(g, win); g.clip(); }
        face([P3(2.5, wa + 0.05, 0.03), P3(2.5, wb - 0.05, 0.03), P3(3.15, wb - 0.05, 0.03), P3(3.15, wa + 0.05, 0.03)], P.cyan, { w: 0, light: true });
        const spin = Song.beatAt(T) * Math.PI * 0.5 + T * 5;
        for (const [ya, size] of [[0.55, 0.95], [1.65, 0.8]]) for (let z = wa + 0.3; z + size < wb - 0.2; z += size + 0.12) {
            face([P3(ya, z, 0.04), P3(ya, z + size, 0.04), P3(ya + size, z + size, 0.04), P3(ya + size, z, 0.04)], P.cream, { w: lw(s, 0.025) });
            const c0 = cam.p(P3(ya + size / 2, z + size / 2, 0.05)), cu = cam.p(P3(ya + size / 2, z + size / 2 + 1, 0.05)), r = Math.abs(cu[0] - c0[0]) * size * 0.34;
            const ring = [], drum = []; for (let i = 0; i < 18; i++) { const an = (i / 18) * Math.PI * 2; ring.push([c0[0] + Math.cos(an) * r, c0[1] + Math.sin(an) * r]); drum.push([c0[0] + Math.cos(an) * r * 0.78, c0[1] + Math.sin(an) * r * 0.78]); }
            Ink.shape(g, ring, '#b8a2e8', { w: lw(s, 0.025), seed: b.seed + Math.round(z * 13 + ya * 7), d, jit: 0.2 });
            Ink.shape(g, drum, P.navy, { w: 0, seed: b.seed + Math.round(z * 17 + ya), d, jit: 0.2 });
            if (r > 4) for (let j = 0; j < 3; j++) { const an = spin * (ya < 1 ? 1 : -0.6) + j * 2.1 + z; Ink.brush(g, [[c0[0] + Math.cos(an) * r * 0.2, c0[1] + Math.sin(an) * r * 0.2], [c0[0] + Math.cos(an + 0.9) * r * 0.6, c0[1] + Math.sin(an + 0.9) * r * 0.6]], { w: cap(r * 0.22, 1, 5), col: [P.pink, P.gold, P.cyan][j], seed: b.seed + j + Math.round(z * 3), d, taper: 0.3, light: true }); }
        }
        // somebody folding at the table in front of the machines, a basket at her feet
        { const zf = wa + (wb - wa) * 0.62, ft = cam.p(P3(0, zf, 0.06)), sw = cam.f / ft[2];
          face([P3(0.82, zf - 0.9, 0.055), P3(0.82, zf + 0.9, 0.055), P3(0.9, zf + 0.9, 0.055), P3(0.9, zf - 0.9, 0.055)], '#e8e0ff', { w: lw(s, 0.02) });
          CloudsLife.walker(g, ft[0], ft[1], sw, 0.3, 0.2, P.cyan, b.seed + 700, d, { col: '#2a0a50', shirt: '#4a1a80', h: 1.62 });
          const a = cam.p(P3(1.2, zf - 0.45, 0.062)), c2 = cam.p(P3(1.2, zf + 0.45, 0.062)), lo = cam.p(P3(0.92, zf + 0.5, 0.062)), lo0 = cam.p(P3(0.92, zf - 0.5, 0.062));
          Ink.shape(g, [[a[0], a[1]], [c2[0], c2[1]], [lo[0], lo[1]], [lo0[0], lo0[1]]], P.pink, { w: lw(sw, 0.015), seed: b.seed + 701, d, jit: 0.4 });
          const bk = cam.p(P3(0.0, zf - 1.3, 0.062)), bt = cam.p(P3(0.45, zf - 1.3, 0.062)), r = 0.3 * sw; Ink.shape(g, [[bk[0] - r, bk[1]], [bt[0] - r * 1.2, bt[1]], [bt[0] + r * 1.2, bt[1]], [bk[0] + r, bk[1]]], P.gold, { w: lw(sw, 0.02), seed: b.seed + 702, d, jit: 0.3 }); }
        // the clock at four
        const cc = cam.p(P3(2.85, wb - 1.2, 0.05)), cu = cam.p(P3(2.85, wb - 0.2, 0.05)), R = Math.abs(cu[0] - cc[0]) * 0.28;
        if (R > 3) { const pts = []; for (let i = 0; i < 20; i++) { const an = (i / 20) * Math.PI * 2; pts.push([cc[0] + Math.cos(an) * R, cc[1] + Math.sin(an) * R]); } Ink.shape(g, pts, P.cream, { w: lw(s, 0.025), seed: b.seed + 900, d, jit: 0.2 }); const hA = (4 / 12) * Math.PI * 2 - Math.PI / 2; Ink.brush(g, [[cc[0], cc[1]], [cc[0] + Math.cos(hA) * R * 0.55, cc[1] + Math.sin(hA) * R * 0.55]], { w: cap(R * 0.16, 1, 4), seed: b.seed + 901, d, taper: 0.2 }); Ink.brush(g, [[cc[0], cc[1]], [cc[0], cc[1] - R * 0.82]], { w: cap(R * 0.1, 1, 3), seed: b.seed + 902, d, taper: 0.2 }); }
        g.restore();
        for (let z = wa; z <= wb + 0.01; z += (wb - wa) / 4) { const A = cam.p(P3(0.5, z, 0.08)), B = cam.p(P3(3.2, z, 0.08)); Ink.brush(g, [[A[0], A[1]], [B[0], B[1]]], { w: lw(s, 0.05), col: P.ink, seed: b.seed + Math.round(z * 5), d, taper: 0.02 }); }
        sign(g, L, cam, b.x1 + 0.1, 3.55, (z0 + z1) / 2, 'LAUNDROMAT', 0.62, P.aqua, z1 - z0 - 1.5, fx, 1);
    }

    // --- palms, lamps, cars, signals -------------------------------------------------------------
    function palm(g, L, cam, x, z, seed, T, d, fx) {
        const R = Motion.rng('cpalm' + seed), Hh = 9 + R() * 4, lean = (R() - 0.5) * 0.8, leanZ = (R() - 0.5) * 0.6;
        const top = cam.p([x + lean, Hh, z + leanZ]); if (top[2] < 4) return;     // a crown at the lens: left out
        const s = cam.f / top[2];
        const side = cam.pos[1] < Hh + 30;
        if (s < 3) {
            // far: a plain trunk and a star of fronds, no brush (hundreds of them line the avenues)
            const b0 = cam.p([x, 0, z]);
            g.save(); g.lineCap = 'round'; g.strokeStyle = P.purple;
            if (side && b0[2] > 0.5) { g.lineWidth = Math.max(0.8, 0.3 * s); g.beginPath(); g.moveTo(b0[0], b0[1]); g.lineTo(top[0], top[1]); g.stroke(); }
            g.strokeStyle = P.grape; g.lineWidth = Math.max(1, 0.5 * s); g.beginPath();
            for (let i = 0; i < 7; i++) { const an = i * 0.9 + seed, e = cam.p([x + lean + Math.cos(an) * 3.6, Hh - 1.4, z + leanZ + Math.sin(an) * 3.6]); g.moveTo(top[0], top[1]); g.lineTo(e[0], e[1]); }
            g.stroke(); g.restore();
            return;
        }
        if (side && s > 1.5) {
            const pts = []; for (let i = 0; i <= 8; i++) { const u = i / 8, p = cam.p([x + lean * u * u, Hh * 0.92 * u, z + leanZ * u * u]); if (p[2] < 0.3) return; pts.push([p[0], p[1], (0.28 - 0.1 * u) * cam.f / p[2]]); }
            const outline = pts.map((p) => [p[0] - p[2], p[1]]).concat(pts.slice().reverse().map((p) => [p[0] + p[2], p[1]]));
            Ink.shape(g, outline, P.purple, { w: s > 7 ? lw(s, 0.06) : 0, seed: seed * 7 + 1, d, jit: s > 7 ? 0.5 : 0 });
            if (s > 6) Ink.brush(g, pts.map((p) => [p[0] - p[2] * 0.6, p[1]]), { w: cap(0.05 * s, 1, 4), col: P.cyan, seed: seed * 17, d, taper: 0.3 });
            if (s > 12) Ink.hatch(g, [pts[0][0] + pts[0][2] * 0.4, pts[0][1] - 4], [pts[6][0] + pts[6][2] * 0.4, pts[6][1]], { count: 4, len: cap(0.3 * s, 3, 26), w: cap(0.045 * s, 1, 4), col: P.salmon, seed: seed * 3, d, n: [1, 0], ang: 1.2 });
        }
        const mid = s < 9, n = mid ? 8 : 13, sway = Math.sin(T * 1.6 + seed) * 0.05, P0 = [x + lean, Hh, z + leanZ], fr = [];
        for (let i = 0; i < n; i++) { const an = (i / n) * Math.PI * 2 + R() * 0.3; fr.push({ an, dx: Math.cos(an), dz: Math.sin(an), len: 3.2 + R() * 1.2, arch: 0.8 + R() * 0.6 }); }
        const toCam = [cam.pos[0] - P0[0], cam.pos[2] - P0[2]];
        fr.sort((a, b) => (a.dx * toCam[0] + a.dz * toCam[1]) - (b.dx * toCam[0] + b.dz * toCam[1]));
        for (const f of fr) {
            const pt = (u) => cam.p([P0[0] + f.dx * f.len * u, P0[1] + f.arch * Math.sin(u * Math.PI * 0.7) - u * u * (2.2 + sway * 10 * f.dx), P0[2] + f.dz * f.len * u]);
            const rib = []; for (let j = 0; j <= 6; j++) rib.push(pt(j / 6));
            if (rib.some((p) => p[2] < 2 || Math.abs(p[0] - cam.W / 2) > 4000 || Math.abs(p[1] - cam.H / 2) > 4000)) continue;
            const width = (j) => 0.28 * Math.sin((j / 6) * Math.PI * 0.95 + 0.1) * cam.f / rib[j][2];
            const up = rib.map((p, j) => [p[0], p[1] - width(j) * 0.45]), dn = rib.map((p, j) => [p[0], p[1] + width(j) * 0.7]);
            const near = f.dx * toCam[0] + f.dz * toCam[1] > 0;
            Ink.shape(g, up.concat(dn.reverse()), near ? P.plum : P.grape, { w: mid ? 0 : lw(s, 0.05), seed: seed * 101 + Math.round(f.an * 10), d, jit: mid ? 0 : 0.5 });
            if (!mid || near) Ink.brush(g, rib.slice(1, 5).map((p, j) => [p[0], p[1] - width(j + 1) * 0.3]), { w: cap(0.04 * s, 0.8, 3.5), col: f.dx > 0 ? P.pink : P.cyan, seed: seed * 31 + Math.round(f.an * 10), d, taper: 0.4 });
        }
    }

    function lamp(g, L, cam, x, z, dir, d, fx) {
        const top = cam.p([x, 8.6, z]), base = cam.p([x, 0, z]); if (top[2] < 2.5 || base[2] < 2.5) return;
        const s = cam.f / top[2], pw = fx.lampPower ?? 1;
        if (s > 3 && cam.pos[1] < 60) {
            const w0 = 0.1 * cam.f / base[2], w1 = 0.06 * s;
            Ink.shape(g, [[base[0] - w0, base[1]], [top[0] - w1, top[1]], [top[0] + w1, top[1]], [base[0] + w0, base[1]]], '#1a0450', { w: lw(s, 0.03), seed: Math.round(z * 13 + x), d, jit: 0.3 });
            Ink.brush(g, [[base[0] + w0 * 0.4, base[1]], [top[0] + w1 * 0.4, top[1]]], { w: cap(w1 * 0.6, 1, 5), col: P.violet, seed: Math.round(z * 14 + x), d, taper: 0.3 });
            const end = cam.p([x + dir * 1.6, 8.5, z]), hs = cam.f / end[2];
            Ink.brush(g, [[top[0], top[1]], [end[0], end[1]]], { w: cap(0.08 * s, 1.4, 10), seed: Math.round(z * 17 + x), d, taper: 0.1 });
            const hw = 0.4 * hs, hh = 0.13 * hs;
            Ink.shape(g, [[end[0] - hw, end[1] - hh * 0.4], [end[0] + hw, end[1] - hh * 0.4], [end[0] + hw * 0.8, end[1] + hh], [end[0] - hw * 0.8, end[1] + hh]], css(mix(P.gold, P.orange, 1 - Math.min(1, pw))), { w: lw(hs, 0.05), seed: Math.round(z * 23 + x), d, jit: 0.4, light: true });
            Neon.last.glint(null, L, end[0], end[1] + hh * 0.3, Math.min(70, Math.max(3, 0.7 * hs)) * pw, Neon.hex(P.orange), { lightOnly: true, alpha: 0.55, halo: fx.halo ?? 1 });
            const st = (fx.star ?? 0) * Math.min(1, hs / 25);
            if (st > 0.05) for (let r = 0; r < 4; r++) { const an = r * Math.PI / 2 + 0.3, len = st * Math.min(90, 1.2 * hs); Ink.brush(L, [[end[0], end[1] + hh * 0.3], [end[0] + Math.cos(an) * len, end[1] + hh * 0.3 + Math.sin(an) * len]], { w: cap(0.06 * hs, 1, 4), col: P.gold, seed: Math.round(z * 29 + r), d, taper: 0.9, light: true }); }
        } else dot(g, L, top[0], top[1], cap(0.5 * s, 0.8, 4), P.gold, 0.9 * pw);
    }

    // a car of the traffic: from above a dark body with its lights (and the tracers the high
    // leaves behind them); from the street two boxes like the causeway's
    function trafficCar(g, L, cam, t, T, d, fx) {
        const pc = cam.p([t.x, 0.7, t.z]); if (pc[2] < 2) return;
        const s = cam.f / pc[2], ax = t.dx, az = t.dz, px = -az, pz = ax;
        const at = (u, v, y = 0.7) => cam.p([t.x + ax * u + px * v, y, t.z + az * u + pz * v]);
        if (s > 1.4) {
            const body = [at(-2.15, -0.9, 0.9), at(2.15, -0.9, 0.9), at(2.15, 0.9, 0.9), at(-2.15, 0.9, 0.9)];
            if (cam.pos[1] > 25 || s < 5) Ink.shape(g, body.map((p) => [p[0], p[1]]), t.col, { w: s > 4 ? lw(s, 0.06) : 0, seed: t.seed, d, jit: s > 4 ? 0.3 : 0 });
            else boxCar(g, cam, t, s, d);
        }
        const r = cap(0.22 * s, 0.7, 6), trail = fx.trail ?? 0;
        if (s < 3.5) { const h = at(1.8, 0, 0.7), tl = at(-1.8, 0, 0.75); dot(g, L, h[0], h[1], r, P.cream, 0.9); dot(g, L, tl[0], tl[1], r * 0.8, P.red, 0.9); return; }
        for (const v of [-0.6, 0.6]) {
            const h = at(2.2, v, 0.7), tl = at(-2.2, v, 0.75);
            const seenFront = (cam.pos[0] - t.x) * ax + (cam.pos[2] - t.z) * az > 0;
            if (cam.pos[1] > 25 || seenFront) dot(g, L, h[0], h[1], r, P.cream, 0.9);
            if (cam.pos[1] > 25 || !seenFront) dot(g, L, tl[0], tl[1], r * 0.8, P.red, 0.9);
            if (trail > 0 && cam.pos[1] > 25) {
                const back = cam.p([t.x - ax * (2.2 + t.v * 0.5 * trail) + px * v, 0.75, t.z - az * (2.2 + t.v * 0.5 * trail) + pz * v]);
                L.save(); L.globalAlpha = 0.5 * trail; L.strokeStyle = P.red; L.lineWidth = r * 1.4; L.lineCap = 'round'; L.beginPath(); L.moveTo(tl[0], tl[1]); L.lineTo(back[0], back[1]); L.stroke(); L.restore();
            }
        }
    }
    function boxCar(g, cam, t, s, d) {
        const x = t.x, z = t.z, sx = t.dx ? 2.15 : 0.9, sz = t.dx ? 0.9 : 2.15;
        for (const [hx, hz, y0, y1, col] of [[sx, sz, 0.25, 0.95, t.col], [sx * 0.6, sz * 0.6, 0.95, 1.4, P.indigo]]) {
            const x0 = x - hx, x1 = x + hx, z0 = z - hz, z1 = z + hz;
            const faces = [[[[x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]], cam.pos[1] > y1, 1], [[[x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0]], cam.pos[2] < z0, 0.75], [[[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]], cam.pos[2] > z1, 0.75], [[[x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0]], cam.pos[0] < x0, 0.6], [[[x1, y0, z0], [x1, y0, z1], [x1, y1, z1], [x1, y1, z0]], cam.pos[0] > x1, 0.6]];
            for (const [pts, seen, k] of faces) { if (!seen) continue; const q = quad(cam, pts); if (q) Ink.shape(g, q, css(mix(col, '#04022e', 1 - k)), { w: lw(s, 0.04), seed: Math.round(z * 5 + k * 100 + y0 * 10 + x), d, jit: 0.3 }); }
        }
        // the wheels on the side the camera sees, the cabin's glass a strip of reflected sky
        if (s > 8) {
            const sideX = cam.pos[0] > x ? 1 : -1, along = t.dx ? 0 : 1;
            for (const u of [-1.35, 1.35]) {
                const wc = along ? [x + sideX * 0.92, 0.32, z + u] : [x + u, 0.32, z + sideX * 0.92], c0 = cam.p(wc); if (c0[2] < 1) continue;
                const r = 0.32 * cam.f / c0[2], pts = []; for (let i = 0; i < 12; i++) { const an = i / 12 * Math.PI * 2; pts.push([c0[0] + Math.cos(an) * r * (along ? Math.min(1, Math.abs(cam.pos[0] - x) / Math.max(1, c0[2])) + 0.25 : 1), c0[1] + Math.sin(an) * r]); }
                Ink.shape(g, pts, '#0e0430', { w: lw(s, 0.03), seed: Math.round(z * 9 + u * 10), d, jit: 0.2 });
            }
            const gl = along ? [[x + sideX * 0.62, 1.02, z - 0.55], [x + sideX * 0.62, 1.02, z + 0.55], [x + sideX * 0.62, 1.32, z + 0.4], [x + sideX * 0.62, 1.32, z - 0.4]] : null;
            if (gl) { const q = quad(cam, gl); if (q) Ink.shape(g, q, '#7a5ad0', { w: lw(s, 0.02), seed: Math.round(z * 11), d, jit: 0.2, light: true }); }
        }
    }

    // a traffic light at a corner: from above a dot of its colour; on Ocean Drive at the stop line
    // a mast arm over the road with the signal head facing the cars from the south
    function odSignalDraw(g, L, cam, T, d, fx) {
        const zs = 207.5, xp = 7.2, arm = -1.2, yA = 5.8;
        const base = cam.p([xp, 0, zs]), top = cam.p([xp, yA + 0.4, zs]); if (top[2] < 0.6) return;
        const s = cam.f / top[2], sB = cam.f / Math.max(0.6, base[2]);
        Ink.shape(g, [[base[0] - 0.14 * sB, base[1]], [top[0] - 0.1 * s, top[1]], [top[0] + 0.1 * s, top[1]], [base[0] + 0.14 * sB, base[1]]], '#1a0450', { w: lw(s, 0.03), seed: 'sigpole', d, jit: 0.3 });
        const aEnd = cam.p([arm, yA, zs]); Ink.brush(g, [[top[0], top[1] + 0.2 * s], [aEnd[0], aEnd[1]]], { w: cap(0.14 * s, 1.5, 12), seed: 'sigarm', d, taper: 0.05 });
        const state = odSignal(T);
        for (const hx of [LANE, -1.8 + 0.4]) {
            const hw = 0.26, hh = 0.6, zf = zs - 0.2, y0 = yA - 0.1;
            const q = quad(cam, [[hx - hw, y0 - 2 * hh, zf], [hx + hw, y0 - 2 * hh, zf], [hx + hw, y0, zf], [hx - hw, y0, zf]]); if (!q) continue;
            const facing = cam.pos[2] < zf;
            Ink.shape(g, q, facing ? '#2a1040' : '#3c1060', { w: lw(cam.f / Math.max(1, cam.view([hx, y0, zf])[2]), 0.05), seed: 'sighead' + hx, d, jit: 0.3 });
            if (!facing) continue;
            ['red', 'amber', 'green'].forEach((c, i) => {
                const p = cam.p([hx, y0 - hh * 0.35 - i * hh * 0.65, zf - 0.02]), r = 0.17 * cam.f / p[2], on = state === c;
                Ink.shape(g, [0, 1, 2, 3, 4, 5, 6, 7].map((k) => [p[0] + Math.cos(k * Math.PI / 4) * r, p[1] + Math.sin(k * Math.PI / 4) * r]), on ? SIG[c] : '#1a0838', { w: 0, seed: 'sl' + i + hx, d, jit: 0.2, light: on });
                if (on) { dot(null, L, p[0], p[1], r * 1.2, SIG[c], 1); Neon.last.glint(null, L, p[0], p[1], r * 7 * (fx.halo ?? 1), Neon.hex(SIG[c]), { lightOnly: true, alpha: 0.9 }); }
            });
        }
    }

    // --- one frame of the city ---------------------------------------------------------------------
    function draw(g, L, cam, T, d, fx, env, extra = []) {
        const pl = build(), c = cam.pos, high = c[1] > 40;
        // window.__cprof = {} (tools only) collects ms per kind of thing painted
        const PR = window.__cprof, tm = (k, f) => { if (!PR) return f(); const t0 = performance.now(); f(); PR[k] = (PR[k] ?? 0) + performance.now() - t0; };
        tm('ground', () => ground(g, L, cam, T, d, fx, env, pl));
        tm('glow', () => streetGlow(g, L, cam, T, d, fx, env));
        const items = [];
        const put = (x, y, z, draw, k) => items.push({ depth: dist(cam, x, y, z), draw, k });
        for (const b of pl.B) {
            const cx = (b.x0 + b.x1) / 2, cz = (b.z0 + b.z1) / 2, r = Math.hypot(b.x1 - b.x0, b.z1 - b.z0, b.h) / 2 + 4;
            if (!visible(cam, cx, b.h / 2, cz, r, env)) continue;
            // sort by the nearest point of the footprint (a wide hotel beside the camera)
            const nx = cap(c[0], b.x0, b.x1), nz = cap(c[2], b.z0, b.z1);
            // the roof the camera stands over is the floor of everything: painted first
            const under = c[0] > b.x0 && c[0] < b.x1 && c[2] > b.z0 && c[2] < b.z1 && c[1] > b.h;
            items.push({ k: b.kind, depth: under ? 1e7 : high ? dist(cam, cx, b.h, cz) : dist(cam, nx, Math.min(c[1], b.h), nz) + 0.5, draw: () => building(g, L, cam, b, T, d, fx, env) });
        }
        for (const p of pl.palms) { if (!visible(cam, p.x, 6, p.z, 9, env)) continue; if (dist(cam, p.x, 0, p.z) > (high ? 1400 : 700)) continue; put(p.x, 10, p.z, () => palm(g, L, cam, p.x, p.z, p.seed, T, d, fx), 'palm'); }
        for (let z = Math.floor((LAND.z0) / 28) * 28 + 6; z < LAND.z1; z += 28) { if (!visible(cam, 7.4, 4, z, 6, env)) continue; if (high && dist(cam, 7.4, 0, z) > 1500) continue; put(7.4, 4, z, () => lamp(g, L, cam, 7.4, z, -1, d, fx), 'lamp'); }
        if (high) for (const [cx, w] of AVES) for (let z = LAND.z0 + 15; z < LAND.z1; z += 30) for (const sd of [-1, 1]) { const x = cx + sd * (w / 2 + 0.6); if (!visible(cam, x, 8, z, 2, env)) continue; put(x, 8, z, () => { const p = cam.p([x, 8.6, z]); dot(g, L, p[0], p[1], cap(0.45 * cam.f / p[2], 0.7, 3), P.gold, 0.85 * (fx.lampPower ?? 1)); }); }
        else for (const sd of [-1, 1]) for (let z = Math.floor((c[2] - 80) / 30) * 30 + 15; z < c[2] + 220; z += 30) { const x = -185 + sd * 10.6; if (!visible(cam, x, 4, z, 6, env)) continue; put(x, 4, z, () => lamp(g, L, cam, x, z, -sd, d, fx)); }
        for (const p of pl.parked) { if (!visible(cam, p.x, 1, p.z, 3, env) || dist(cam, p.x, 1, p.z) > (high ? 1000 : 400)) continue; const t = { x: p.x, z: p.z, dx: 0, dz: p.dir, v: 0, seed: Math.round(p.z * 7), col: p.col }; put(p.x, 0.8, p.z, () => { const s = cam.f / Math.max(1, dist(cam, p.x, 0.8, p.z)); if (c[1] > 25) { if (s > 1.4) { const q = quad(cam, [[p.x - 0.9, 0.9, p.z - 2.15], [p.x + 0.9, 0.9, p.z - 2.15], [p.x + 0.9, 0.9, p.z + 2.15], [p.x - 0.9, 0.9, p.z + 2.15]]); if (q) Ink.shape(g, q, p.col, { w: s > 4 ? lw(s, 0.06) : 0, seed: t.seed, d, jit: 0.3 }); } } else if (s > 3) boxCar(g, cam, t, s, d); else { const q = quad(cam, [[p.x - 0.9, 1.0, p.z - 2.15], [p.x + 0.9, 1.0, p.z - 2.15], [p.x + 0.9, 1.0, p.z + 2.15], [p.x - 0.9, 1.0, p.z + 2.15]]); if (q) Ink.shape(g, q, p.col, { w: 0, seed: t.seed, d, jit: 0 }); } }, 'parked'); }
        for (const t of traffic(T)) { if (!visible(cam, t.x, 1, t.z, 4, env) || dist(cam, t.x, 1, t.z) > 1300) continue; if (!high && Math.abs(t.x - 1.75) < 0.3) continue; put(t.x, 0.8, t.z, () => trafficCar(g, L, cam, t, T, d, fx), 'traffic'); }
        // the signals at the crossings, from above: one dot for each direction
        if (high) {
            const sig = signal(T);
            for (const [cx] of AVES.concat([[0]])) for (const [za, zb] of STREETS) {
                const zc = (za + zb) / 2; if (!visible(cam, cx, 5, zc, 12, env)) continue;
                put(cx, 5, zc, () => { const s = cam.f / Math.max(1, dist(cam, cx, 5, zc)); if (s < 0.5) return; const r = cap(0.5 * s, 0.8, 3.5); for (const [ox, oz, st] of [[-7, -7, sig.ns], [7, 7, sig.ns], [7, -7, sig.ew], [-7, 7, sig.ew]]) { const p = cam.p([cx + ox, 5.5, zc + oz]); dot(g, L, p[0], p[1], r, SIG[st], 0.95); } });
            }
        } else if (Math.abs(c[2] - 200) < 260 && c[0] > -40) put(2, 5, 207.5, () => odSignalDraw(g, L, cam, T, d, fx), 'signal');
        // passers-by, walking on twos
        if (c[1] < 80) for (const w of pl.walkers) {
            const z = w.z0 + w.dir * w.v * (T - 99); if (dist(cam, w.x, 1, z) > 260 || !visible(cam, w.x, 0.9, z, 1.2, env)) continue;
            put(w.x, 0.9, z, () => { const f = cam.p([w.x, 0, z]); if (f[2] < 2) return; const sc = cam.f / f[2], vx = w.x - c[0], vz = z - c[2], side = Math.abs(vx) / Math.max(0.1, Math.hypot(vx, vz)); CloudsLife.walker(g, f[0], f[1], sc, T * 7.2 + w.seed, side, w.rim, w.seed, d, { shirt: w.shirt }); }, 'people');
        }
        // outside the diner: a newspaper box and a payphone
        if (Math.abs(c[0] + 186) < 40 && Math.abs(c[2] - 125) < 120) {
            put(-195.4, 0.6, 125.6, () => streetBox(g, cam, -195.4, 125.6, 0.5, 0.45, 1.1, P.blue, P.cyan, d), 'shop');
            put(-195.6, 1, 112.4, () => payphone(g, L, cam, -195.6, 112.4, d), 'shop');
        }
        // their roof: a water tank, an air conditioner with its fan, a vent, a sun lounger with a
        // towel, string lights on posts along the parapet
        const ours = pl.B.find((b) => b.ours);
        if (ours && dist(cam, -20, ours.h, 240) < 140 && c[1] > ours.h) roofLife(g, L, cam, ours, T, d, fx, put);
        for (const e of extra) items.push({ k: 'extra', depth: e.depth ?? dist(cam, e.x, e.y, e.z), draw: e.draw });
        items.sort((a, b) => b.depth - a.depth);
        for (const it of items) tm(it.k ?? 'other', it.draw);
    }

    function streetBox(g, cam, x, z, w, dp, hh, col, lit, d) {
        const s = cam.f / Math.max(1, cam.view([x, hh / 2, z])[2]);
        const front = quad(cam, [[x + dp / 2, 0, z - w / 2], [x + dp / 2, 0, z + w / 2], [x + dp / 2, hh, z + w / 2], [x + dp / 2, hh, z - w / 2]]);
        const top = cam.pos[1] > hh ? quad(cam, [[x - dp / 2, hh, z - w / 2], [x + dp / 2, hh, z - w / 2], [x + dp / 2, hh, z + w / 2], [x - dp / 2, hh, z + w / 2]]) : null;
        const sideS = cam.pos[2] < z - w / 2 ? quad(cam, [[x - dp / 2, 0, z - w / 2], [x + dp / 2, 0, z - w / 2], [x + dp / 2, hh, z - w / 2], [x - dp / 2, hh, z - w / 2]]) : null;
        if (sideS) Ink.shape(g, sideS, css(mix(col, '#04022e', 0.4)), { w: lw(s, 0.03), seed: Math.round(z * 7 + 1), d, jit: 0.3 });
        if (front) Ink.shape(g, front, col, { w: lw(s, 0.03), seed: Math.round(z * 7 + 2), d, jit: 0.3 });
        if (top) Ink.shape(g, top, css(mix(col, '#ffffff', 0.2)), { w: lw(s, 0.03), seed: Math.round(z * 7 + 3), d, jit: 0.3 });
        const win = quad(cam, [[x + dp / 2 + 0.01, hh * 0.55, z - w * 0.35], [x + dp / 2 + 0.01, hh * 0.55, z + w * 0.35], [x + dp / 2 + 0.01, hh * 0.85, z + w * 0.35], [x + dp / 2 + 0.01, hh * 0.85, z - w * 0.35]]);
        if (win) Ink.shape(g, win, lit, { w: lw(s, 0.02), seed: Math.round(z * 7 + 4), d, jit: 0.2, light: true });
    }
    function payphone(g, L, cam, x, z, d) {
        const b0 = cam.p([x, 0, z]), t0 = cam.p([x, 2.0, z]); if (b0[2] < 1.5) return;
        const s = cam.f / b0[2];
        Ink.brush(g, [[b0[0], b0[1]], [t0[0], t0[1]]], { w: cap(0.1 * s, 1.5, 8), col: '#2a0a50', seed: Math.round(z * 3), d, taper: 0.05 });
        streetBox(g, cam, x, z, 0.75, 0.5, 0.01, '#2a0a50', P.cyan, d);
        const box = quad(cam, [[x + 0.26, 1.1, z - 0.35], [x + 0.26, 1.1, z + 0.35], [x + 0.26, 2.05, z + 0.35], [x + 0.26, 2.05, z - 0.35]]);
        if (box) Ink.shape(g, box, P.royal, { w: lw(s, 0.03), seed: Math.round(z * 3 + 1), d, jit: 0.3 });
        const pnl = quad(cam, [[x + 0.27, 1.85, z - 0.3], [x + 0.27, 1.85, z + 0.3], [x + 0.27, 2.0, z + 0.3], [x + 0.27, 2.0, z - 0.3]]);
        if (pnl) { Ink.shape(g, pnl, P.cream, { w: 0, seed: Math.round(z * 3 + 2), d, jit: 0.2, light: true }); L.save(); L.globalAlpha = 0.6; L.fillStyle = P.cream; Neon.path(L, pnl); L.fill(); L.restore(); }
        const hs = cam.p([x + 0.3, 1.45, z - 0.15]), hr = 0.09 * s; Ink.shape(g, [[hs[0] - hr, hs[1] - hr * 2], [hs[0] + hr, hs[1] - hr * 2], [hs[0] + hr, hs[1] + hr * 2], [hs[0] - hr, hs[1] + hr * 2]], '#14052e', { w: lw(s, 0.02), seed: Math.round(z * 3 + 3), d, jit: 0.2 });
    }
    function roofLife(g, L, cam, b, T, d, fx, put) {
        const h = b.h, c = cam.pos;
        const at = (x, y, z) => cam.p([x, y, z]);
        const sAt = (x, y, z) => cam.f / Math.max(0.5, cam.view([x, y, z])[2]);
        // the roof's tar seams and gravel close to the camera, painted with the roof itself
        put(-20, h, b.z0 - 200, () => {
            for (let z = Math.ceil(Math.max(b.z0 + 1, c[2] - 2) / 1.2) * 1.2; z < b.z1 - 0.6; z += 1.2) {
                const A = at(b.x0 + 0.8, h + 0.01, z), Bq = at(b.x1 - 0.8, h + 0.01, z); if (A[2] < 0.6 || Bq[2] < 0.6) continue;
                Ink.brush(g, [[A[0], A[1]], [Bq[0], Bq[1]]], { w: cap(0.025 * sAt(-16, h, z), 0.8, 3), col: '#3a1690', seed: Math.round(z * 10), d, taper: 0.05, wob: 0.8 });
            }
            for (let i = 0; i < 70; i++) { const x = b.x0 + 1 + H(i, 1, 0) * (b.x1 - b.x0 - 2), z = Math.max(b.z0 + 1, c[2] + 0.8) + H(i, 2, 0) * 9; if (z > b.z1 - 0.5) continue; const p = at(x, h + 0.01, z); if (p[2] < 0.6) continue; const sc = cam.f / p[2], l = cap(0.08 * sc, 1, 10); Ink.brush(g, [[p[0] - l, p[1]], [p[0] + l, p[1] + 0.5]], { w: cap(0.02 * sc, 0.8, 2.5), col: i % 3 ? '#4a2aa0' : P.purple, seed: 6900 + i, d, taper: 0.4 }); }
            // a puddle with the sign's pink in it
            const pq = quad(cam, [[-17.4, h + 0.012, 247.6], [-16.0, h + 0.012, 247.4], [-15.8, h + 0.012, 248.3], [-17.5, h + 0.012, 248.4]]);
            if (pq) { Ink.shape(g, pq, '#2a0c6e', { w: 0, seed: 'puddle', d, jit: 0.4 }); const A = at(-17.0, h + 0.013, 247.9), Bq = at(-16.2, h + 0.013, 247.9); Ink.brush(g, [[A[0], A[1]], [Bq[0], Bq[1]]], { w: cap(0.04 * sAt(-16.6, h, 248), 1, 3), col: P.pink, seed: 6990, d, taper: 0.4, light: true }); }
        }, 'roof');
        // the water tank on legs, the air conditioner, the vent
        put(-21.5, h + 2, 252, () => tank(g, cam, -21.5, 252, h, 1.4, 2.4, 777, d, sAt(-21.5, h + 2, 252)), 'roof');
        put(-18.6, h + 0.6, 249.9, () => {
            const x0 = -19.4, x1 = -17.8, z0 = 249.2, z1 = 250.6, hh = 1.1, s = sAt(-18.6, h + 0.6, 249.9);
            for (const [pts, col] of [[[[x0, h, z0], [x1, h, z0], [x1, h + hh, z0], [x0, h + hh, z0]], '#3a1488'], [[[x1, h, z0], [x1, h, z1], [x1, h + hh, z1], [x1, h + hh, z0]], '#2a0c6e'], [[[x0, h + hh, z0], [x1, h + hh, z0], [x1, h + hh, z1], [x0, h + hh, z1]], '#5a2aa8']]) { if (pts[0][0] === x1 && pts[1][0] === x1 && c[0] < x1) continue; const q = quad(cam, pts); if (q) Ink.shape(g, q, col, { w: lw(s, 0.03), seed: Math.round(pts[0][2] * 7 + pts[0][0]), d, jit: 0.3 }); }
            for (let j = 0; j < 5; j++) { const A = at(x0 + 0.2, h + 0.2 + j * 0.18, z0 - 0.01), Bq = at(x1 - 0.2, h + 0.2 + j * 0.18, z0 - 0.01); Ink.brush(g, [[A[0], A[1]], [Bq[0], Bq[1]]], { w: cap(0.02 * s, 0.8, 2), seed: 7400 + j, d, taper: 0.1 }); }
            const fc = at(-18.6, h + hh + 0.01, 249.9), fr = 0.5 * sAt(-18.6, h + hh, 249.9), ry = fr * 0.35, ring = []; for (let i = 0; i < 16; i++) { const an = i / 16 * Math.PI * 2; ring.push([fc[0] + Math.cos(an) * fr, fc[1] + Math.sin(an) * ry]); }
            Ink.shape(g, ring, '#1a0640', { w: lw(s, 0.03), seed: 7410, d, jit: 0.2 });
            for (let j = 0; j < 3; j++) { const an = T * 14 + j * 2.09; Ink.brush(g, [[fc[0], fc[1]], [fc[0] + Math.cos(an) * fr * 0.85, fc[1] + Math.sin(an) * ry * 0.85]], { w: cap(0.06 * s, 1, 4), col: '#6a3ab0', seed: 7420 + j, d, taper: 0.4 }); }
        }, 'roof');
        put(-13.4, h + 0.6, 249.4, () => { const a = at(-13.4, h, 249.4), t = at(-13.4, h + 1.1, 249.4), s = sAt(-13.4, h + 0.5, 249.4), r = 0.16 * s; Ink.shape(g, [[a[0] - r, a[1]], [t[0] - r, t[1]], [t[0] + r, t[1]], [a[0] + r, a[1]]], '#4a1a8a', { w: lw(s, 0.03), seed: 7500, d, jit: 0.2 }); Ink.shape(g, [[t[0] - r * 1.8, t[1]], [t[0] - r * 1.2, t[1] - r * 1.4], [t[0] + r * 1.2, t[1] - r * 1.4], [t[0] + r * 1.8, t[1]]], '#6a3ab0', { w: lw(s, 0.03), seed: 7501, d, jit: 0.2 }); }, 'roof');
        // the sun lounger, its back raised, a striped towel over it
        put(-12.2, h + 0.4, 251.4, () => {
            const s = sAt(-12.2, h + 0.4, 251.4), xa = -12.6, xb = -11.85;
            for (const [x, z] of [[xa, 250.5], [xb, 250.5], [xa, 252.0], [xb, 252.0]]) { const A = at(x, h, z), Bq = at(x, h + 0.35, z); Ink.brush(g, [[A[0], A[1]], [Bq[0], Bq[1]]], { w: cap(0.035 * s, 1, 3), col: P.cream, seed: Math.round(x * 10 + z), d, taper: 0.1 }); }
            const seat = quad(cam, [[xa, h + 0.35, 250.4], [xb, h + 0.35, 250.4], [xb, h + 0.35, 252.1], [xa, h + 0.35, 252.1]]);
            const back = quad(cam, [[xa, h + 0.35, 252.1], [xb, h + 0.35, 252.1], [xb, h + 1.0, 252.6], [xa, h + 1.0, 252.6]]);
            if (back) Ink.shape(g, back, P.aqua, { w: lw(s, 0.03), seed: 7600, d, jit: 0.3 });
            if (seat) Ink.shape(g, seat, P.aqua, { w: lw(s, 0.03), seed: 7601, d, jit: 0.3 });
            for (let j = 0; j < 4; j++) { const z = 250.6 + j * 0.35, A = at(xa + 0.05, h + 0.37, z), Bq = at(xb - 0.05, h + 0.37, z); Ink.brush(g, [[A[0], A[1]], [Bq[0], Bq[1]]], { w: cap(0.06 * s, 1, 5), col: j % 2 ? P.pink : P.cream, seed: 7610 + j, d, taper: 0.1, light: true }); }
        }, 'roof');
        // string lights: posts at the parapet's corners, the wire sagging between, bulbs on twos
        const posts = [[b.x0 + 0.6, b.z1 - 0.5], [b.x1 - 0.6, b.z1 - 0.5], [b.x1 - 0.6, b.z0 + 3]];
        for (const [px, pz] of posts) put(px, h + 1.3, pz, () => { const A = at(px, h, pz), Bq = at(px, h + 2.7, pz); if (A[2] < 0.6) return; Ink.brush(g, [[A[0], A[1]], [Bq[0], Bq[1]]], { w: cap(0.05 * sAt(px, h + 1, pz), 1, 5), col: '#2a0a50', seed: Math.round(px * 7 + pz), d, taper: 0.05 }); }, 'roof');
        for (let k = 0; k + 1 < posts.length; k++) {
            const [ax, az] = posts[k], [bx, bz] = posts[k + 1];
            put((ax + bx) / 2, h + 2.3, (az + bz) / 2, () => {
                const pts = []; for (let i = 0; i <= 24; i++) { const u = i / 24, p = at(ax + (bx - ax) * u, h + 2.6 - Math.sin(u * Math.PI) * 0.6, az + (bz - az) * u); if (p[2] < 0.6) return; pts.push(p); }
                Ink.brush(g, pts.map((p) => [p[0], p[1]]), { w: 1.4, col: '#1a0640', seed: 7700 + k, d, taper: 0.02, wob: 0.3 });
                for (let i = 1; i < 24; i += 2) { const p = pts[i], sc = cam.f / p[2], col = [P.gold, P.pink, P.cyan, P.orange][(i >> 1) % 4], on = H(i, k, Math.floor(Song.beatAt(T))) > 0.12; dot(g, on ? L : null, p[0], p[1] + 0.12 * sc, cap(0.06 * sc, 1.2, 6), col, on ? 1 : 0.5); }
            }, 'roof');
        }
    }

    // --- the clouds ----------------------------------------------------------------------------------
    // ~40 clouds at 170–270 m, drifting east on a slow wind; each a cluster of flattened puffs
    // drawn as one inked union: the tops violet with strokes of moonlight, the undersides
    // salmon and pink with the city's light (the side the camera sees decides which leads)
    let CL = null;
    function cloudPlan() {
        if (CL) return CL;
        const R = Motion.rng('clouds-sky'); CL = [];
        for (let i = 0; i < 34; i++) {
            const x = -1200 + R() * 1700, z = -900 + R() * 2600, y = 170 + R() * 110, n = 12 + Math.floor(R() * 10), size = 22 + R() * 22;
            // keep clear of the paths the camera rises through (shots 1 and 5)
            if (Math.hypot(x + 5, z + 130) < 420 || Math.hypot(x + 10, z - 150) < 160) continue;
            // puffs heaped towards the middle (taller there), on a flat base
            const puffs = [], ex = size * (3 + R() * 2.5), ez = size * (1.6 + R());
            for (let j = 0; j < n; j++) { const u = R() * 2 - 1, v = R() * 2 - 1, mid = 1 - Math.min(1, Math.hypot(u, v)); puffs.push({ dx: u * ex, dz: v * ez, dy: size * (0.1 + mid * 0.7 + R() * 0.25), r: size * (0.35 + mid * 0.45 + R() * 0.25) }); }
            puffs.push({ dx: 0, dz: 0, dy: size * 0.15, r: ex * 0.95, base: true });
            CL.push({ x, y, z, puffs, seed: i * 13 + 5 });
        }
        return CL;
    }
    // part: 'above' the clouds higher than the camera (painted before the city), 'below' the rest
    function clouds(g, cam, T, d, fx, env, part) {
        const list = [];
        for (const cl of cloudPlan()) {
            if (part && (part === 'above') !== (cl.y > cam.pos[1])) continue;
            const x = cl.x + (T - 99) * 3.2;
            if (!visible(cam, x, cl.y, cl.z, 200, env) || dist(cam, x, cl.y, cl.z) > 2000) continue;
            list.push({ cl, x, depth: dist(cam, x, cl.y, cl.z) });
        }
        list.sort((a, b) => b.depth - a.depth);
        for (const { cl, x } of list) cloud(g, cam, cl, x, T, d, fx, env);
    }
    function cloud(g, cam, cl, x, T, d, fx, env) {
        const below = cam.pos[1] < cl.y, E = [];
        for (let j = 0; j < cl.puffs.length; j++) {
            const p = cl.puffs[j], P3 = [x + p.dx, cl.y + p.dy, cl.z + p.dz], v = cam.view(P3);
            if (v[2] < p.r * (p.base ? 1.6 : 1.3)) continue;
            const c = cam.p(P3), rr = cam.f * p.r / v[2], dy = Math.abs(cam.pos[1] - P3[1]) / Math.max(1, dist(cam, ...P3));
            const up = cam.p([P3[0], P3[1] + p.r * 0.35, P3[2]]);
            // the base: a wide flat slab of cloud (thin seen edge-on, a broad floor from below/above)
            const fl = p.base ? 0.12 + 0.88 * dy : 0.55 + 0.45 * dy;
            E.push({ x: c[0], y: c[1], rx: rr * (1 + 0.02 * (H(cl.seed, j, d) - 0.5)), ry: rr * fl, ux: up[0] - c[0], uy: up[1] - c[1], depth: v[2] + (p.base ? p.r : 0) });
        }
        if (!E.length) return;
        const near = E.reduce((m, e) => Math.min(m, e.depth), 1e9), s = cam.f / near;
        const lwp = cap(0.06 * s, 1.2, 5);
        E.sort((a, b) => b.depth - a.depth);
        const union = (c, grow = 0) => { c.beginPath(); for (const e of E) { c.moveTo(e.x + e.rx + grow, e.y); c.ellipse(e.x, e.y, e.rx + grow, e.ry + grow, 0, 0, Math.PI * 2); } };
        g.save();
        g.fillStyle = P.ink; union(g, lwp); g.fill();
        const top = below ? '#5a1690' : '#3c12a0', lit = below ? P.salmon : P.magenta;
        union(g); g.clip();
        for (const e of E) {
            // the lit side first, then the body pushed towards the dark side, leaving a crescent
            g.fillStyle = lit; g.beginPath(); g.ellipse(e.x, e.y, e.rx, e.ry, 0, 0, Math.PI * 2); g.fill();
            const k = below ? 0.45 : -0.55;
            g.fillStyle = top; g.beginPath(); g.ellipse(e.x + e.ux * k, e.y + e.uy * k, e.rx * 0.97, e.ry * 0.95, 0, 0, Math.PI * 2); g.fill();
        }
        // strokes: the city's warm light on the undersides, the moon's cyan on the tops
        let bx0 = 1e9, by0 = 1e9, bx1 = -1e9, by1 = -1e9; for (const e of E) { bx0 = Math.min(bx0, e.x - e.rx); bx1 = Math.max(bx1, e.x + e.rx); by0 = Math.min(by0, e.y - e.ry); by1 = Math.max(by1, e.y + e.ry); }
        const bw = bx1 - bx0, bh = by1 - by0;
        if (bw > 30) {
            const n = Math.min(26, Math.round(bw / 40) + 4);
            Ink.strokes(g, bx0, by0 + bh * (below ? 0.5 : 0.62), bw, bh * 0.4, { ang: 0, spread: 0.15, count: n, len: cap(bw * 0.12, 8, 160), w: cap(0.04 * s * 10, 1.4, 6), cols: below ? [P.gold, P.pink, P.orange] : [P.pink, P.salmon], seed: cl.seed, d, alpha: 0.9 });
            Ink.strokes(g, bx0, by0 + bh * 0.05, bw, bh * 0.35, { ang: 0, spread: 0.15, count: Math.round(n * 0.7), len: cap(bw * 0.1, 8, 140), w: cap(0.04 * s * 10, 1.2, 5), cols: below ? [P.violet, P.purple] : [P.cyan, P.violet, '#8a6af0'], seed: cl.seed + 7, d, alpha: 0.85 });
        }
        g.restore();
        Ink.erase(g, (c) => union(c, lwp));
    }

    // the form constants of hallucination, faint on the sky at fixed directions in the world:
    // a cobweb, a spiral, a tunnel, breathing on the bass
    function forms(L, cam, T, fx, env) {
        const a = fx.forms ?? 0; if (a <= 0.01) return;
        const N = Neon.last, dirs = [[-0.55, 0.22, 'cobweb', P.cyan], [0.5, 0.3, 'spiral', P.pink], [0.05, 0.42, 'tunnel', P.violet], [1.6, 0.25, 'cobweb', P.magenta], [-1.5, 0.3, 'spiral', P.cyan]];
        for (const [az, el, kind, col] of dirs) {
            const r = 20000, p = cam.p([cam.pos[0] + Math.sin(az) * Math.cos(el) * r, cam.pos[1] + Math.sin(el) * r, cam.pos[2] + Math.cos(az) * Math.cos(el) * r]);
            if (p[2] < 1) continue;
            const R = cam.f * 0.2 * (1 + (fx.bass ?? 0) * 0.15);
            if (p[0] < -R || p[0] > env.W + R || p[1] < -R || p[1] > env.H + R) continue;
            N.form(L, kind, p[0], p[1], R, T * 0.35 + az, col, a, { w: 1.6, squash: 0.85, n: 10, spokes: 14, rings: 6, arms: 5 });
        }
    }

    return { build, draw, clouds: (...a) => CloudsLife.clouds(...a), forms, signal, lampsNear, lampLight, LANE, HOTEL, STOP, SHOPS, odSignal };
})();
