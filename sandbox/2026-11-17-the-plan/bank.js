// The bank, once, in metres, and the night's clockwork: where every wall is, how the guard
// walks, how each camera pans, where the three marks are at any second. Every drawing (the
// three plans, the section, the axonometric, detail C), the red pencil, the clock, the edit
// and tools/check-plan.mjs read this file, so the gaps the plan uses are true: a mark really
// crosses while the sector really looks away. No drawing here (it also loads in node).
const Bank = (() => {
    // --- the sheet (3200 × 1350): 24 units to the metre (1:100). The ground floor plan, with the
    // section under it and the basement plan under that, all on the same x; notes, detail C and
    // the title block; the roof plan on the ground floor's y; the axonometric in a column of its own
    const S = 24, PX = 110, PY = 96, SZ = 690, BY = 940, RX = 1612;
    const px = (x) => PX + x * S, py = (y) => PY + y * S, sz = (z) => SZ - z * S;
    const SHEET = [3200, 1350];
    // the axonometric: an isometric of the three levels, pulled apart. A level's plan (drawn at
    // PX, PY) is painted through axon(level).m; a point (x, y, z in metres) goes through axon.pt
    const AX = { x: 2640, y: 920, k: 0.56, gap: 185, c: Math.cos(Math.PI / 6), s: 0.5 }; // centre of the ground plate, scale, units between plates
    const LEVELS = { roof: 1, ground: 0, basement: -1 };
    const axon = (level, open = 1) => {
        const { x, y, k, c, s, gap } = AX, lift = LEVELS[level] * gap * open;
        // a plan's sheet units (u, v) → the axonometric, the plate's middle (16, 8 m) on (x, y − lift)
        const m = [c * k, s * k, -c * k, s * k, x - c * k * (PX + 16 * S - PY - 8 * S), y - s * k * (PX + 16 * S + PY + 8 * S) - lift];
        return { m, lift, pt: (X, Y) => { const u = px(X), v = py(Y); return [m[0] * u + m[2] * v + m[4], m[1] * u + m[3] * v + m[5]]; } };
    };

    // --- the building (x east, y south, z up from the banking hall's floor) ---------------------
    const W = 32, D = 16, T = 0.45, P = 0.2; // outer size, outer walls, partitions
    const ROOMS = { manager: [0, 7], store: [7, 12], tellers: [12, 24.5], stair: [24.5, 28.5], lift: [28.5, 32] }; // x ranges of the north rooms, 5 m deep
    const NORTH = 5; // the line between the north rooms and the hall
    const DOORS = { manager: [3.0, 3.9], store: [9.05, 9.95], stair: [26.05, 26.95], lift: [29.4, 30.8] }; // openings in that line
    const SIDE = [12.0, 13.0], MAIN = [14.6, 17.4]; // the side door (west wall, y range) and the main entrance (south wall, x range)
    const DUCT = [10.75, 3.95, 0.9]; // the riser in the store: x, y, side
    const COLS = [[8, 10.5], [16, 10.5], [24, 10.5]];
    const COUNTER = [12.5, 24.0, 5.0, 5.7]; // x0, x1, y0, y1
    const Z = { roof: 4.2, roofTop: 4.6, parapet: 5.3, cowl: 6.0, slab: -0.4, base: -3.8, baseSlab: -4.3 };
    const STRONG = { x: [13, 23], y: [0.6, 4.9], door: 18, r: 1.0, cz: -2.65 }; // under the tellers; its round door faces the lobby
    const LOBBY = { y: [5.6, 8.4], grille: -0.75 };
    const SECTION_Y = 7; // B–B: cut along the hall, looking north

    // --- cameras: each pans at a steady rate between its limits (degrees from north, clockwise);
    // `at` is a moment it stands at its first limit
    const CAMS = [
        { name: 'CAM 1', x: 31.3, y: 15.3, a0: -80, a1: -25, rate: 8, at: 15, half: 13, reach: 12 },
        { name: 'CAM 2', x: 16, y: 13.8, a0: -47, a1: -1.5, rate: 11, at: 24.0, half: 13, reach: 17.5 },
        { name: 'CAM 3', x: 31.3, y: 5.75, a0: -118, a1: -72, rate: 9, at: 18, half: 13, reach: 12 },
    ];
    const tri = (u) => { const f = ((u % 2) + 2) % 2; return f < 1 ? f : 2 - f; };
    // the direction a camera looks at t (degrees from north)
    const camAngle = (c, t) => c.a0 + (c.a1 - c.a0) * tri(((t - c.at) * c.rate) / (c.a1 - c.a0));
    const camSees = (c, t, x, y) => {
        const dx = x - c.x, dy = y - c.y, d = Math.hypot(dx, dy);
        if (d > c.reach) return false;
        let a = (Math.atan2(dx, -dy) * 180) / Math.PI - camAngle(c, t);
        a = ((a + 540) % 360) - 180;
        return Math.abs(a) < c.half;
    };

    // --- a path walked at given speeds: [[x, y], …] → position and heading at a distance -----------
    const along = (pts, s) => {
        let i = 0;
        for (; i < pts.length - 1; i++) {
            const d = Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]);
            if (s <= d || i === pts.length - 2) { const f = d ? Math.max(0, Math.min(1, s / d)) : 0; return [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * f, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * f, Math.atan2(pts[i + 1][0] - pts[i][0], -(pts[i + 1][1] - pts[i][1]))]; }
            s -= d;
        }
        return [...pts[pts.length - 1], 0];
    };
    const lengthOf = (pts) => pts.slice(1).reduce((s, p, i) => s + Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]), 0);

    // --- the times (film seconds; the clock on the sheet reads 02:14:00 at CLOCK0, in real time) ---
    const TM = {
        CLOCK0: 20, CLOCK_AT: [2, 14, 0], CLOCK_STOP: 54.5,
        corner: 20.0, // the guard turns his south-west corner
        go: 26.2, // CAM 2 has passed: the marks cross
        stop: 31.0, turn: [31.6, 32.4], // the guard stops, and turns
        duct: 38.0, // the first mark leaves for the riser
        wheel: [43.0, 44.5], bolts: [44.3, 45.0], swing: [45.0, 46.2],
        away: 48.6, // the marks leave by the line the pencil drew
    };

    // --- the guard --------------------------------------------------------------------------------
    const VG = 7 / 6, VG2 = 1.6; // m/s on his round; after the change
    const SOUTH = 12.9; // the south side of his round
    const BEAT = [[26.5, 6.5], [3, 6.5], [3, SOUTH], [29, SOUTH], [29, 6.5], [26.5, 6.5]]; // rev. A: round the hall
    const S_CORNER = 23.5 + SOUTH - 6.5; // metres walked along BEAT when he turns the south-west corner
    const XS = 3 + VG * (TM.stop - TM.corner); // where he stops
    const BEAT_B = [[XS, SOUTH], [XS, 6.5], [9.5, 6.5], [9.5, 5.2], [9.5, 3.3]]; // rev. B: across the hall, past the counter, into the store
    function guardAt(t) {
        if (t <= TM.stop) { const [x, y, h] = along(BEAT, S_CORNER + VG * (t - TM.corner)); return { x, y, h, rev: 'A' }; }
        const u = Math.max(0, Math.min(1, (t - TM.turn[0]) / (TM.turn[1] - TM.turn[0]))), e = u * u * (3 - 2 * u);
        if (t < TM.turn[1]) return { x: XS, y: SOUTH, h: (Math.PI / 2) * (1 - e), rev: 'B' }; // east → north
        const [x, y, h] = along(BEAT_B, VG2 * (t - TM.turn[1]));
        return { x, y, h, rev: 'B', inStore: y < NORTH };
    }

    // --- the three marks ----------------------------------------------------------------------------
    const P1 = (i) => [1.5, 6.2 + 0.75 * i]; // the blind corner they wait in
    const Q = [[10.0, 1.45], [10.95, 1.95], [10.15, 2.55]]; // where they stand in the store: east of the door, out of the line a camera has through it
    const STAND = (i) => 16.05 - 0.62 * i; // where they stand at the strong room's door (x)
    const RISER = [DUCT[0] + DUCT[2] / 2, DUCT[1] + DUCT[2] / 2];
    const OFF = [-1.4, 4.4]; // over the parapet, on the west side: out
    function legs(i) {
        const out = [-0.9 - 0.6 * i, 12.5], p1 = P1(i), r = 0.22;
        const zf = Z.base + r, tDuct = TM.duct + 0.7 * i;
        const toDuct = [Q[i], RISER], tAtDuct = tDuct + lengthOf(toDuct) / 2.4;
        const tGrille = tAtDuct + (0 - LOBBY.grille) / 1.3, tFloor = tGrille + (LOBBY.grille - zf) / 3.4;
        const xs = STAND(i), tStand = tFloor + (xs - RISER[0]) / 2.6;
        const tAway = TM.away + 0.3 * i, back = xs - RISER[0], up = Z.roofTop + r - zf, V = 6.5;
        const tBack = tAway + back / V, tRoof = tBack + up / V, roofRun = [RISER, [RISER[0], OFF[1]], OFF], tOff = tRoof + lengthOf(roofRun) / 5;
        return {
            out, p1, tDuct, tAtDuct, tGrille, tFloor, tStand, tAway, zf, xs, tBack, tRoof, tOff, roofRun,
            a: { t0: 20.3 + 0.4 * i, v: 2.6, pts: [out, [1.5, 12.5], p1] },
            b: { t0: TM.go + 0.3 * i, v: 3.5, pts: [p1, [1.5, 6.0], [9.4, 6.0], [9.7, 5.1], [10.2, 4.5], Q[i]] },
            c: { t0: tDuct, v: 2.4, pts: toDuct },
        };
    }
    const L = [0, 1, 2].map(legs);
    // where mark i is at t: position (x, y), level z, and where it is: 'ground' (on the hall's
    // level, in the open), 'store' (on it, behind the wall section B–B looks at), 'riser',
    // 'basement', 'roof', or 'gone'
    function markAt(i, t) {
        const l = L[i], r = 0.22;
        const run = (leg) => along(leg.pts, Math.max(0, leg.v * (t - leg.t0)));
        if (t < l.b.t0) { const [x, y] = run(l.a); return { x, y, z: r, at: 'ground' }; }
        if (t < l.tDuct) { const [x, y] = run(l.b); return { x, y, z: r, at: y < NORTH ? 'store' : 'ground' }; }
        if (t < l.tAtDuct) { const [x, y] = run(l.c); return { x, y, z: r, at: 'store' }; }
        if (t < l.tGrille) return { x: RISER[0], y: RISER[1], z: r + (LOBBY.grille - r) * ((t - l.tAtDuct) / (l.tGrille - l.tAtDuct)), at: 'riser' };
        if (t < l.tFloor) { const u = (t - l.tGrille) / (l.tFloor - l.tGrille); return { x: RISER[0], y: LOBBY.y[0] + 0.5, z: LOBBY.grille + (l.zf - LOBBY.grille) * u * u, at: 'basement' }; }
        if (t < l.tAway) { const u = Math.min(1, (t - l.tFloor) / (l.tStand - l.tFloor)); return { x: RISER[0] + (l.xs - RISER[0]) * u, y: LOBBY.y[0] + 0.5, z: l.zf, at: 'basement' }; }
        if (t < l.tBack) { const u = (t - l.tAway) / (l.tBack - l.tAway); return { x: l.xs + (RISER[0] - l.xs) * u, y: LOBBY.y[0] + 0.5, z: l.zf, at: 'basement' }; }
        if (t < l.tRoof) { const u = (t - l.tBack) / (l.tRoof - l.tBack), z = l.zf + (Z.roofTop + r - l.zf) * u; return { x: RISER[0], y: RISER[1], z, at: 'riser' }; }
        if (t < l.tOff) { const [x, y] = along(l.roofRun, 5 * (t - l.tRoof)); return { x, y, z: Z.roofTop + r, at: 'roof' }; }
        return { x: OFF[0], y: OFF[1], z: Z.roofTop, at: 'gone' };
    }
    // the route as the pencil plans it (rev. A): in at the side door, the blind corner, the
    // crossing, the store, then on to the stair
    const ROUTE = { a: [[-0.6, 12.5], [1.5, 12.5], [1.5, 6.6]], b: [[1.5, 6.0], [9.4, 6.0], [9.7, 5.1], [10.3, 3.0]], c: [[9.3, 4.7], [9.3, 6.25], [26.5, 6.25], [26.5, 3.6]] };

    const clock = (t) => {
        const s = Math.floor(Math.min(TM.CLOCK_STOP, t) - TM.CLOCK0) + TM.CLOCK_AT[0] * 3600 + TM.CLOCK_AT[1] * 60 + TM.CLOCK_AT[2];
        const two = (n) => String(n).padStart(2, '0');
        return `${two(Math.floor(s / 3600))}:${two(Math.floor(s / 60) % 60)}:${two(s % 60)}`;
    };

    return { S, PX, PY, SZ, BY, RX, SHEET, AX, LEVELS, axon, px, py, sz, W, D, T, P, ROOMS, NORTH, DOORS, SIDE, MAIN, DUCT, COLS, COUNTER, Z, STRONG, LOBBY, SECTION_Y, CAMS, camAngle, camSees, along, lengthOf, TM, VG, VG2, BEAT, BEAT_B, XS, guardAt, SOUTH, P1, Q, RISER, OFF, L, markAt, ROUTE, STAND, clock };
})();

// the film's drawings add themselves here (plan.js, section.js, extras.js, pencil.js)
const Film = {};
