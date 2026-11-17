// The bank, once, in metres, and the night's clockwork: where every wall is, how the guard
// walks, how each camera pans, where the three marks are at any second. The plan, the
// section, the red pencil, the clock and tools/check-plan.mjs all read this file, so the
// gaps the plan uses are true: a mark really crosses while the sector really looks away.
// No drawing here (it also loads in node).
const Bank = (() => {
    // --- the sheet: 24 units to the metre (1:100); the section sits under the plan, on the same x
    const S = 24, PX = 110, PY = 96, SZ = 690;
    const px = (x) => PX + x * S, py = (y) => PY + y * S, sz = (z) => SZ - z * S;

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

    // --- cameras: [x, y, the middle of the sweep's two limits (degrees from north, clockwise), …]
    // each pans at a steady rate between its limits; `at` is a moment it stands at its first limit
    const CAMS = [
        { name: 'CAM 1', x: 31.3, y: 15.3, a0: -80, a1: -25, rate: 7, at: 21, half: 13, reach: 12 },
        { name: 'CAM 2', x: 16, y: 13.8, a0: -47, a1: -1.5, rate: 9, at: 30.3, half: 13, reach: 17.5 },
        { name: 'CAM 3', x: 31.3, y: 5.75, a0: -118, a1: -72, rate: 8, at: 24, half: 13, reach: 12 },
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

    // --- the times (film seconds; the clock on the sheet starts at CLOCK0 and runs in real time) -----
    const TM = {
        CLOCK0: 26, CLOCK_AT: [2, 14, 0], CLOCK_STOP: 69.2,
        corner: 26.0, // the guard turns his south-west corner
        go: 33.0, // CAM 2 has passed: the marks cross
        stop: 38.0, turn: [39.0, 40.0], // the guard stops, and turns
        duct: 49.0, // the first mark leaves for the riser
        wheel: [55.7, 57.5], bolts: [57.3, 58.1], swing: [58.1, 59.5],
        away: 64.2, // the marks leave by the line the pencil drew
    };

    // --- the guard --------------------------------------------------------------------------------
    const VG = 7 / 6; // m/s
    const SOUTH = 12.9; // the south side of his round
    const BEAT = [[26.5, 6.5], [3, 6.5], [3, SOUTH], [29, SOUTH], [29, 6.5], [26.5, 6.5]]; // rev. A: round the hall
    const BEAT_B = [[17, SOUTH], [17, 6.5], [9.5, 6.5], [9.5, 5.2], [9.5, 3.3]]; // rev. B: across the hall, past the counter, into the store
    const S_CORNER = 23.5 + SOUTH - 6.5; // metres walked along BEAT when he turns the south-west corner
    function guardAt(t) {
        if (t <= TM.stop) { const [x, y, h] = along(BEAT, S_CORNER + VG * (t - TM.corner)); return { x, y, h, rev: 'A' }; }
        const u = Math.max(0, Math.min(1, (t - TM.turn[0]) / (TM.turn[1] - TM.turn[0]))), e = u * u * (3 - 2 * u);
        if (t < TM.turn[1]) return { x: 17, y: SOUTH, h: (Math.PI / 2) * (1 - e), rev: 'B' }; // east → north
        const [x, y, h] = along(BEAT_B, VG * (t - TM.turn[1]));
        return { x, y, h, rev: 'B', inStore: y < NORTH };
    }

    // --- the three marks ----------------------------------------------------------------------------
    const P1 = (i) => [1.5, 6.2 + 0.75 * i]; // the blind corner they wait in
    const Q = [[10.0, 1.45], [10.95, 1.95], [10.15, 2.55]]; // where they stand in the store: east of the door, out of the line a camera has through it
    const STAND = (i) => 16.05 - 0.62 * i; // where they stand at the strong room's door (x)
    const RISER = [DUCT[0] + DUCT[2] / 2, DUCT[1] + DUCT[2] / 2];
    function legs(i) {
        const out = [-0.9 - 0.6 * i, 12.5], p1 = P1(i), r = 0.22;
        const zf = Z.base + r, tDuct = TM.duct + 0.9 * i;
        const toDuct = [Q[i], RISER], tAtDuct = tDuct + lengthOf(toDuct) / 2;
        const tGrille = tAtDuct + (0 - LOBBY.grille) / 1.2, tFloor = tGrille + (LOBBY.grille - zf) / 3.2;
        const xs = STAND(i), tStand = tFloor + (xs - RISER[0]) / 2.3;
        const tAway = TM.away + 0.35 * i, back = xs - RISER[0], up = Z.cowl + 1.6 - zf, V = 6.5;
        return {
            out, p1, tDuct, tAtDuct, tGrille, tFloor, tStand, tAway, zf, xs,
            a: { t0: 26.4 + 0.5 * i, v: 2.2, pts: [out, [1.5, 12.5], p1] },
            b: { t0: TM.go + 0.4 * i, v: 3, pts: [p1, [1.5, 6.0], [9.4, 6.0], [9.7, 5.1], [10.2, 4.5], Q[i]] },
            c: { t0: tDuct, v: 2, pts: toDuct },
            tBack: tAway + back / V, tTop: tAway + (back + up) / V,
        };
    }
    const L = [0, 1, 2].map(legs);
    // where mark i is at t: plan position (x, y), level z, and how it is to be drawn:
    // 'plan' (on the ground floor), 'hidden' (behind the wall the section looks at: dashed),
    // 'section' (in front of it), or 'gone'
    function markAt(i, t) {
        const l = L[i], r = 0.22;
        const run = (leg) => along(leg.pts, Math.max(0, leg.v * (t - leg.t0)));
        if (t < l.b.t0) { const [x, y] = run(l.a); return { x, y, z: r, in: 'plan' }; }
        if (t < l.tDuct) { const [x, y] = run(l.b); return { x, y, z: r, in: y < NORTH ? 'hidden' : 'plan' }; }
        if (t < l.tAtDuct) { const [x, y] = run(l.c); return { x, y, z: r, in: 'hidden' }; }
        if (t < l.tGrille) return { x: RISER[0], y: RISER[1], z: r + (LOBBY.grille - r) * ((t - l.tAtDuct) / (l.tGrille - l.tAtDuct)), in: 'hidden', riser: true };
        if (t < l.tFloor) { const u = (t - l.tGrille) / (l.tFloor - l.tGrille); return { x: RISER[0], y: LOBBY.y[0] + 0.5, z: LOBBY.grille + (l.zf - LOBBY.grille) * u * u, in: 'section' }; }
        if (t < l.tAway) { const u = Math.min(1, (t - l.tFloor) / (l.tStand - l.tFloor)); return { x: RISER[0] + (l.xs - RISER[0]) * u, y: LOBBY.y[0] + 0.5, z: l.zf, in: 'section' }; }
        if (t < l.tBack) { const u = (t - l.tAway) / (l.tBack - l.tAway); return { x: l.xs + (RISER[0] - l.xs) * u, y: LOBBY.y[0] + 0.5, z: l.zf, in: 'section' }; }
        if (t < l.tTop) { const u = (t - l.tBack) / (l.tTop - l.tBack), z = l.zf + (Z.cowl + 1.6 - l.zf) * u; return { x: RISER[0], y: RISER[1], z, in: z > LOBBY.grille && z < Z.roofTop ? 'hidden' : 'section', riser: true }; }
        return { x: RISER[0], y: RISER[1], z: Z.cowl + 2, in: 'gone' };
    }
    // the route as the pencil plans it (rev. A): in at the side door, the blind corner, the
    // crossing, the store, then on to the stair
    const ROUTE = { a: [[-0.6, 12.5], [1.5, 12.5], [1.5, 6.6]], b: [[1.5, 6.0], [9.4, 6.0], [9.7, 5.1], [10.3, 3.0]], c: [[9.3, 4.7], [9.3, 6.25], [26.5, 6.25], [26.5, 3.6]] };

    const clock = (t) => {
        const s = Math.floor(Math.max(0, Math.min(TM.CLOCK_STOP, t) - TM.CLOCK0)) + TM.CLOCK_AT[0] * 3600 + TM.CLOCK_AT[1] * 60 + TM.CLOCK_AT[2];
        const two = (n) => String(n).padStart(2, '0');
        return `${two(Math.floor(s / 3600))}:${two(Math.floor(s / 60) % 60)}:${two(s % 60)}`;
    };

    return { S, PX, PY, SZ, px, py, sz, W, D, T, P, ROOMS, NORTH, DOORS, SIDE, MAIN, DUCT, COLS, COUNTER, Z, STRONG, LOBBY, SECTION_Y, CAMS, camAngle, camSees, along, lengthOf, TM, VG, BEAT, BEAT_B, guardAt, SOUTH, P1, Q, RISER, L, markAt, ROUTE, STAND, clock };
})();

// the film's drawings add themselves here (plan.js, section.js, extras.js, pencil.js)
const Film = {};
