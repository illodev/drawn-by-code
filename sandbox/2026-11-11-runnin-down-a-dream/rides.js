// The rides: the band's hot rod turned into a rolling stage, the Devil's hot-rod hearse with
// its skeleton chauffeur, and the dust a car kicks up when it peels out. Both cars travel to
// screen RIGHT and are drawn in the style's oblique projection: the near side keeps its true
// shape, the top shows, and the car's front end is the right-hand side face.
//
// A car is drawn in two passes so its riders sit INSIDE it: everything behind them, then the
// `riders(g, seats, s)` callback, then everything in front. The callback runs in the car's
// figure units (translated, scaled, bounced and leaned); the cast's drawers take their own
// scale to set the line width, so place each rider with
//     Rides.at(g, s, seats.driver, (x, y, s) => Cast.tom(g, x, y, s, pose));
//
// Units: figure units (a standing person is 1.9 tall); the origin is the ground under the
// middle of the car's near side; y grows downwards. Global: Rides. Depends on Cereal, and on
// Cast for the skeleton's legs and arms.
const Rides = (() => {
    const C = Cereal, K = C.COL, TAU = Math.PI * 2;
    const D = [0.3, -0.2]; // the same as Cast.D: screen offset per unit of depth
    const Dd = (z) => [D[0] * z, D[1] * z];
    const ob = (x, y, z = 0) => [x + D[0] * z, y + D[1] * z]; // a point of the car at depth z
    const lerp = (a, b, u) => a + (b - a) * u;
    const rot = ([x, y], a) => [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)];
    const cw = (pts) => {
        let a = 0;
        for (let i = 0; i < pts.length; i++) {
            const p = pts[i], q = pts[(i + 1) % pts.length];
            a += p[0] * q[1] - q[0] * p[1];
        }
        return a > 0 ? pts : pts.slice().reverse();
    };
    const shift = (pts, d) => pts.map(([x, y]) => [x + d[0], y + d[1]]);
    const circ = (g, x, y, r, fill, lw, ink = K.ink) => {
        g.beginPath();
        g.arc(x, y, r, 0, TAU);
        if (fill) {
            g.fillStyle = fill;
            g.fill();
        }
        if (lw > 0) {
            g.strokeStyle = ink;
            g.lineWidth = lw;
            g.stroke();
        }
    };
    const line = (g, pts, lw, ink = K.ink) => C.poly(g, pts, { ink, lw, close: false });
    // A tube: a thick line in a colour with the outline round it.
    const tube = (g, pts, w, col, L, close = false) => {
        C.poly(g, pts, { ink: K.ink, lw: w + 2 * L, close });
        C.poly(g, pts, { ink: col, lw: w, close });
    };
    // A rectangle lying on a face that looks to the right (the plane x = const): z0..z1, y0..y1.
    const faceX = (x, y0, y1, z0, z1) => [ob(x, y0, z0), ob(x, y0, z1), ob(x, y1, z1), ob(x, y1, z0)];
    // A circle on such a face (a headlight looking ahead), or tilted (a steering wheel).
    const ringX = (c, r, n = 28, up = [0, 1]) => Array.from({ length: n }, (_, i) => {
        const a = (i / n) * TAU;
        return [c[0] + Math.cos(a) * r * D[0] + Math.sin(a) * r * up[0], c[1] + Math.cos(a) * r * D[1] + Math.sin(a) * r * up[1]];
    });
    const SHADOW = 'rgba(36,21,49,0.28)';
    const CHROME = { chrome: '#d5dbea', chromeTop: '#f4f6fc', chromeSide: '#8d95ad' };

    // Place a rider from inside a riders() callback: the cast's drawers want logical units
    // and their own scale. fn(x, y, s) draws at the seat.
    function at(g, s, p, fn) {
        g.save();
        g.scale(1 / s, 1 / s);
        fn(p[0] * s, p[1] * s, s);
        g.restore();
    }

    // --- wheels ----------------------------------------------------------------------------
    // The round face looks at the camera. kind 'white': whitewall and a chrome hub with slots
    // and a spinner; 'red': a red steel wheel with holes and a chrome cap; far: a bare tyre.
    function wheel(g, L, x, y, R, spin, P, o = {}) {
        C.drum(g, x, y, R, Dd(o.depth ?? 0.3), { front: P.tyre, side: P.tyreSide }, { lw: L, ink: P.ink });
        if (o.far) {
            circ(g, x, y, R * 0.52, P.tyreSide, L * 0.8, P.ink);
            return;
        }
        const pol = (r, a) => [x + Math.cos(a) * r * R, y + Math.sin(a) * r * R];
        if (o.kind === 'red') {
            circ(g, x, y, R * 0.7, P.rim, L, P.ink);
            circ(g, x, y, R * 0.59, null, L * 0.7, P.rimSide);
            for (let i = 0; i < 6; i++) {
                const a = spin + (i / 6) * TAU, c = pol(0.46, a);
                circ(g, c[0], c[1], R * 0.075, P.tyre, L * 0.6, P.ink);
            }
            circ(g, x, y, R * 0.3, P.chrome, L * 0.9, P.ink);
            circ(g, x, y, R * 0.13, P.chromeTop, L * 0.6, P.ink);
            for (let i = 0; i < 3; i++) line(g, [pol(0.16, spin + (i / 3) * TAU + 0.5), pol(0.27, spin + (i / 3) * TAU + 0.5)], L * 0.7, P.ink);
            return;
        }
        circ(g, x, y, R * 0.83, P.wall, L * 0.8, P.ink);
        circ(g, x, y, R * 0.6, P.tyre, L * 0.8, P.ink);
        circ(g, x, y, R * 0.52, P.chrome, L * 0.8, P.ink);
        for (let i = 0; i < 5; i++) {
            const a = spin + (i / 5) * TAU;
            C.poly(g, [pol(0.23, a - 0.34), pol(0.42, a - 0.27), pol(0.42, a + 0.27), pol(0.23, a + 0.34)], { fill: P.chromeSide, ink: P.ink, lw: L * 0.65 });
        }
        // the knock-off spinner: two ears on the cap
        const ear = (a) => [pol(0.1, a - 0.9), pol(0.3, a - 0.1), pol(0.3, a + 0.1), pol(0.1, a + 0.9)];
        C.poly(g, ear(spin + 0.3), { fill: P.chromeTop, ink: P.ink, lw: L * 0.65 });
        C.poly(g, ear(spin + 0.3 + Math.PI), { fill: P.chromeTop, ink: P.ink, lw: L * 0.65 });
        circ(g, x, y, R * 0.13, P.chromeTop, L * 0.7, P.ink);
    }

    // --- decals ----------------------------------------------------------------------------
    // A flame job: a field at the front edge (x0, from y0 down to y1) that breaks, at the
    // notch, into tongues whose tips trail to the left. tips: [[x, y], …] from top to bottom.
    function flamePts(x0, y0, y1, notch, tips) {
        const n = tips.length, out = [[x0, y0]];
        const crotch = (i) => [notch + (i % 2) * 0.12, y0 + ((y1 - y0) * i) / n];
        for (let i = 0; i < n; i++) {
            const [tx, ty] = tips[i];
            const p0 = i === 0 ? [x0, y0] : crotch(i), p1 = i === n - 1 ? [x0, y1] : crotch(i + 1);
            const up = C.curve([p0, [lerp(p0[0], tx, 0.36), lerp(p0[1], ty, 0.3) - 0.035], [lerp(p0[0], tx, 0.72), ty - 0.045], [tx, ty]], false, 6);
            const dn = C.curve([[tx, ty], [lerp(tx, p1[0], 0.3), ty + 0.03], [lerp(tx, p1[0], 0.66), lerp(ty, p1[1], 0.5) + 0.03], p1], false, 6);
            out.push(...up.slice(1), ...dn.slice(1));
        }
        return out;
    }

    // A puff of smoke or dust: a scalloped blob (a middle and a ring of bumps). Outlines of a
    // whole group are stroked first and the fills go on top, so touching puffs merge.
    const puffParts = (x, y, r, n, a0) => {
        const parts = [[x, y, r * 0.74]];
        for (let i = 0; i < n; i++) {
            const a = a0 + (i / n) * TAU;
            parts.push([x + Math.cos(a) * r * 0.62, y + Math.sin(a) * r * 0.62, r * 0.4]);
        }
        return parts;
    };
    function puffs(g, list, fill, L, ink = K.ink) {
        const parts = list.flatMap(([x, y, r, n, a0]) => (r > 0.07 ? puffParts(x, y, r, n, a0) : []));
        g.strokeStyle = ink;
        g.lineWidth = L * 2;
        for (const [x, y, r] of parts) {
            g.beginPath();
            g.arc(x, y, r, 0, TAU);
            g.stroke();
        }
        g.fillStyle = fill;
        for (const [x, y, r] of parts) {
            g.beginPath();
            g.arc(x, y, r, 0, TAU);
            g.fill();
        }
    }

    // A flame out of a pipe: base at (x, y), tip along `ang`, flickering between three
    // drawings. cols: [outer, inner]
    function fire(g, L, x, y, ang, len, w, cols, ph) {
        const k = [1, 0.78, 1.16][ph % 3], bend = [0.1, -0.12, 0.02][ph % 3], l = len * k;
        const P = (u, v) => {
            const p = rot([u * l, v * w + bend * w * u * u * 2], ang);
            return [x + p[0], y + p[1]];
        };
        const outer = [P(0, -0.5), P(0.3, -0.72), P(0.62, -0.42), P(1, 0), P(0.6, 0.12), P(0.74, 0.62), P(0.36, 0.56), P(0, 0.5)];
        C.poly(g, outer, { fill: cols[0], ink: K.ink, lw: L * 0.85 });
        C.poly(g, [P(0, -0.3), P(0.28, -0.4), P(0.62, -0.04), P(0.3, 0.3), P(0, 0.3)], { fill: cols[1], lw: 0 });
    }

    // =========================================================================================
    // The band's ride
    // =========================================================================================
    const ROD = {
        ink: K.ink, ...CHROME,
        body: '#e8392f', top: '#ff6f59', side: '#ad211f', inside: '#6d1622',
        flame: '#ff8a2b', flameIn: '#ffe62e',
        tyre: '#2a2438', tyreSide: '#1f1a2b', wall: '#fffdf4',
        wood: '#f4c06c', woodLine: '#c98d3c',
        seat: '#fff1c4', seatTop: '#fffdf4', seatSide: '#e2c98a',
        glass: 'rgba(170,243,236,0.78)', glint: '#fffdf4', lamp: '#ffe62e',
        cab: '#3d3652', cabTop: '#565082', cabSide: '#2a2438', cloth: '#6a64a0', cone: '#2a2438', coneIn: '#4a4470', cap: '#d5dbea', badge: '#ffc21f',
        pennant: '#17b8a6', smoke: '#f1edf8',
    };
    const BW = 1.5; // the car's width (depth)
    const B = { deck: -0.75, rear: [-3.55, 0.56], front: [3.55, 0.42], out: 0.28 };
    // The near side, clockwise: deck, the cockpit's side, cowl, hood, nose, belly (higher
    // behind each axle, so the far wheels show under it).
    const B_SIDE = [[-4.35, -0.75], [1.5, -0.75], [1.55, -1.08], [2.95, -1.1], [3.15, -1.12], [4.3, -1.0], [4.45, -0.9],
        [4.45, -0.52], [4.38, -0.46], [3.0, -0.46], [2.9, -0.36], [-2.5, -0.36], [-2.6, -0.5], [-4.3, -0.5], [-4.35, -0.56]];
    const B_WHEEL = { c: ob(2.62, -1.17, 0.6), r: 0.21, up: [0.3, -0.95] };
    const deckAt = (x, z) => [...ob(x, B.deck, z), z];
    function bandCarSeats() {
        return {
            // a standing figure placed here shows head and shoulders above the door
            driver: [2.15, -0.44, 0.5],
            // front to back, alternating the near and the far row: draw the far ones (z = 0.8) first
            deck: [[1.12, B.deck - 0.04, 0.2], [0.32, B.deck - 0.16, 0.8], [-0.48, B.deck - 0.04, 0.2], [-1.28, B.deck - 0.16, 0.8]],
            kit: [-2.9, B.deck - 0.03, 0.15],
            // where a mitt rests on the steering wheel's rim
            wheel: [B_WHEEL.c[0] - B_WHEEL.r * D[0] - 0.03, B_WHEEL.c[1] - B_WHEEL.r * D[1] - 0.05],
            // any other spot on the deck: at(x along the car, z from the near edge) → [x, y, z];
            // the free boards run from x = -2.6 (the stacks) to 1.45, z from 0 to 1.5
            at: deckAt, deckY: B.deck, width: BW,
        };
    }

    // A speaker cabinet facing the camera: grille cloth, four cones, a badge, corner caps.
    function cabinet(g, L, P, x, yBottom, z, w, h, d) {
        const [X, Y] = ob(x, yBottom - h, z);
        C.box(g, X, Y, w, h, D, { front: P.cab, top: P.cabTop, side: P.cabSide }, { lw: L, ink: P.ink, depth: d });
        g.beginPath();
        g.roundRect(X + 0.07, Y + 0.07, w - 0.14, h - 0.14, 0.05);
        g.fillStyle = P.cloth;
        g.fill();
        g.strokeStyle = P.ink;
        g.lineWidth = L * 0.8;
        g.stroke();
        const r = Math.min(w, h) * 0.185;
        for (const u of [0.29, 0.71]) {
            for (const v of [0.3, 0.72]) {
                const cx = X + w * u, cy = Y + h * v;
                circ(g, cx, cy, r, P.cone, L * 0.8, P.ink);
                circ(g, cx, cy, r * 0.72, P.coneIn, 0);
                circ(g, cx, cy, r * 0.3, P.cap, L * 0.6, P.ink);
            }
        }
        C.poly(g, [[X + w / 2 - 0.09, Y + 0.035], [X + w / 2 + 0.09, Y + 0.035], [X + w / 2 + 0.09, Y + 0.085], [X + w / 2 - 0.09, Y + 0.085]], { fill: P.badge, ink: P.ink, lw: L * 0.6 });
        for (const [cx, cy, sx, sy] of [[X, Y, 1, 1], [X + w, Y, -1, 1], [X + w, Y + h, -1, -1], [X, Y + h, 1, -1]]) {
            C.poly(g, [[cx, cy], [cx + sx * 0.09, cy], [cx, cy + sy * 0.09]], { fill: P.chrome, ink: P.ink, lw: L * 0.6 });
        }
    }

    // A headlight pod beside the grille: a chrome bullet and its round lens, looking ahead.
    function rodLamp(g, L, P, z) {
        const c = ob(4.5, -0.79, z);
        C.poly(g, C.curve([[c[0] - 0.42, c[1]], [c[0] - 0.26, c[1] - 0.13], [c[0] - 0.03, c[1] - 0.175], [c[0] + 0.03, c[1]], [c[0] - 0.03, c[1] + 0.175], [c[0] - 0.26, c[1] + 0.13]], true, 5), { fill: P.chrome, ink: P.ink, lw: L });
        line(g, [[c[0] - 0.33, c[1] - 0.04], [c[0] - 0.14, c[1] - 0.09]], L * 0.8, P.chromeTop);
        C.poly(g, ringX(c, 0.2), { fill: P.chromeSide, ink: P.ink, lw: L * 0.8 });
        C.poly(g, ringX(c, 0.15), { fill: P.lamp, ink: P.ink, lw: L * 0.6 });
        line(g, [[c[0] - 0.012, c[1] - 0.085], [c[0] - 0.012, c[1] - 0.01]], L * 0.8, P.glint);
    }

    function bandBack(g, L, P) {
        const DW = Dd(BW), dk = B.deck;
        rodLamp(g, L, P, BW + 0.22);
        C.prism(g, B_SIDE, DW, { front: P.body, top: P.top, side: P.side }, { lw: L, ink: P.ink });
        // --- the front end: a chrome grille between two round headlights, a bumper ---------
        const fx = 4.45;
        C.poly(g, faceX(fx, -0.885, -0.535, 0.12, BW - 0.12), { fill: P.chromeTop, ink: P.ink, lw: L * 0.8 });
        C.poly(g, faceX(fx, -0.855, -0.565, 0.2, BW - 0.2), { fill: P.chromeSide, ink: P.ink, lw: L * 0.7 });
        for (let i = 1; i < 8; i++) {
            const z = 0.2 + ((BW - 0.4) * i) / 8;
            line(g, [ob(fx, -0.855, z), ob(fx, -0.565, z)], L * 0.6, i % 2 ? P.chromeTop : P.ink);
        }
        const bump = shift([[4.42, -0.6], [4.57, -0.6], [4.6, -0.56], [4.6, -0.5], [4.57, -0.46], [4.42, -0.46]], Dd(-0.1));
        C.prism(g, bump, Dd(BW + 0.2), { front: P.chrome, top: P.chromeTop, side: P.chromeSide }, { lw: L, ink: P.ink });
        // --- the hood: a chrome spine and a bullet ornament at its tip --------------------------
        tube(g, [ob(3.22, -1.113, BW / 2), ob(4.22, -1.008, BW / 2)], 0.035, P.chrome, L * 0.8);
        const [ox, oy] = ob(4.3, -1.0, BW / 2);
        C.poly(g, [[ox - 0.16, oy - 0.02], [ox - 0.08, oy - 0.11], [ox + 0.1, oy - 0.07], [ox + 0.16, oy - 0.03], [ox + 0.1, oy]], { fill: P.chromeTop, ink: P.ink, lw: L * 0.8 });
        // --- the deck: a stage of planks ----------------------------------------------------
        C.poly(g, [ob(-4.35, dk, 0), ob(1.5, dk, 0), ob(1.5, dk, BW), ob(-4.35, dk, BW)], { fill: P.wood, ink: P.ink, lw: L });
        for (let i = 1; i < 5; i++) {
            const z = (BW * i) / 5;
            line(g, [ob(-4.33, dk, z), ob(1.48, dk, z)], L * 0.55, P.woodLine);
            for (let j = 0; j < 5; j++) {
                const x = -3.8 + j * 1.2 + (i % 2) * 0.6;
                if (x < 1.4) line(g, [ob(x, dk, z), ob(x, dk, z - BW / 5)], L * 0.55, P.woodLine);
            }
        }
        // the far rail
        const railF = (x, h) => ob(x, dk - h, BW - 0.04);
        for (const x of [-1.6, -0.5, 0.6]) tube(g, [railF(x, 0), railF(x, 0.17)], 0.04, P.chrome, L * 0.8);
        tube(g, [railF(-4.3, 0.17), railF(1.42, 0.17), railF(1.42, 0)], 0.05, P.chrome, L * 0.8);
        // --- the cockpit: its well, the bench's back, the windshield, the steering wheel ----
        C.poly(g, [ob(1.68, -1.082, 0.1), ob(2.72, -1.097, 0.1), ob(2.72, -1.097, BW - 0.1), ob(1.68, -1.082, BW - 0.1)], { fill: P.inside, ink: P.ink, lw: L * 0.8 });
        const sb = ob(1.5, -1.44, 0.06);
        C.box(g, sb[0], sb[1], 0.15, 0.69, D, { front: P.seat, top: P.seatTop, side: P.seatSide }, { lw: L, ink: P.ink, depth: BW - 0.12 });
        for (let i = 1; i < 6; i++) {
            const z = 0.06 + ((BW - 0.12) * i) / 6;
            line(g, [ob(1.65, -1.42, z), ob(1.65, -1.1, z)], L * 0.55, P.seatTop);
        }
        const nb = [2.95, -1.1], nt = [2.8, -1.78], fb = ob(nb[0], nb[1], BW), ft = ob(nt[0], nt[1], BW);
        C.poly(g, [nb, nt, ft, fb], { fill: P.glass, ink: P.ink, lw: L * 0.7 });
        const onGlass = (u, v) => [lerp(lerp(nb[0], fb[0], u), lerp(nt[0], ft[0], u), v), lerp(lerp(nb[1], fb[1], u), lerp(nt[1], ft[1], u), v)];
        for (const [u, v0, v1] of [[0.3, 0.2, 0.62], [0.42, 0.3, 0.5]]) line(g, [onGlass(u, v0), onGlass(u, v1)], L * 1.1, P.glint);
        tube(g, [fb, ft, nt], 0.05, P.chrome, L * 0.8);
        const W = B_WHEEL;
        tube(g, [ob(2.8, -1.04, 0.6), W.c], 0.045, P.chromeSide, L * 0.7);
        tube(g, ringX(W.c, W.r, 28, W.up), 0.05, P.seat, L * 0.7, true);
        // --- the backline: two stacks of three at the back of the deck, along its far edge, tall
        // enough to show over a drummer sitting in front of them -------------------------------
        for (const col of [0, 1]) for (const lvl of [0, 1, 2]) cabinet(g, L, P, -4.3 + col * 0.86, dk - lvl * 0.88, 0.95, 0.86, 0.88, 0.5);
    }

    function bandFront(g, L, P, t) {
        const dk = B.deck;
        C.poly(g, B_SIDE, { fill: P.body, ink: P.ink, lw: L });
        // the near lip of the cockpit, so the driver sits behind the door
        C.poly(g, [[1.55, -1.08], [2.95, -1.1], ob(2.95, -1.1, 0.1), ob(1.6, -1.08, 0.1)], { fill: P.top, ink: P.ink, lw: L });
        // the flame job, held inside the panel
        g.save();
        C.trace(g, B_SIDE);
        g.clip();
        C.poly(g, flamePts(4.45, -0.99, -0.5, 3.1, [[2.05, -0.97], [1.0, -0.76], [-0.9, -0.535]]), { fill: P.flame, ink: P.ink, lw: L * 0.85 });
        C.poly(g, flamePts(4.45, -0.92, -0.56, 3.5, [[2.75, -0.93], [1.85, -0.75], [0.3, -0.545]]), { fill: P.flameIn, lw: 0 });
        g.restore();
        C.poly(g, B_SIDE, { ink: P.ink, lw: L });
        // door, handle, chrome along the deck's edge and the sill
        line(g, [[1.74, -1.08], [1.74, -0.52], [1.82, -0.44], [2.74, -0.44], [2.82, -0.52], [2.82, -1.1]], L * 0.75, P.ink);
        C.poly(g, [[1.88, -1.0], [2.08, -1.0], [2.08, -0.955], [1.88, -0.955]], { fill: P.chromeTop, ink: P.ink, lw: L * 0.7 });
        C.poly(g, [[-4.35, dk], [1.5, dk], [1.5, dk + 0.1], [-4.35, dk + 0.1]], { fill: P.chrome, ink: P.ink, lw: L * 0.8 });
        // footlights along the stage's edge: they chase, two drawings a step
        const step = Math.floor(C.drawing(t) / 2);
        for (let i = 0; i < 13; i++) circ(g, -2.4 + i * 0.31, dk + 0.05, 0.03, (((i + step) % 2) + 2) % 2 ? P.lamp : P.glint, L * 0.55, P.ink);
        C.poly(g, [[-2.5, -0.42], [2.9, -0.42], [2.9, -0.36], [-2.5, -0.36]], { fill: P.chrome, ink: P.ink, lw: L * 0.8 });
        // the near rail of the stage
        for (const x of [-2.75, -1.6, -0.5, 0.6]) tube(g, [[x, dk], [x, dk - 0.17]], 0.04, P.chrome, L * 0.8);
        tube(g, [[-4.3, dk], [-4.3, dk - 0.17], [1.42, dk - 0.17], [1.42, dk]], 0.05, P.chrome, L * 0.8);
        // the windshield's near post
        tube(g, [[2.95, -1.1], [2.8, -1.78]], 0.05, P.chrome, L * 0.8);
        rodLamp(g, L, P, -0.22);
        // twin megaphone pipes at the tail, the far one first
        for (const z of [0.6, 0.15]) {
            const a = ob(-4.2, -0.6, z), b = ob(-4.84, -0.72, z), n = [0.02, -0.11];
            C.poly(g, [[a[0] - n[0] * 0.5, a[1] + n[1] * 0.5], [b[0] - n[0], b[1] + n[1]], [b[0] + n[0], b[1] - n[1]], [a[0] + n[0] * 0.5, a[1] - n[1] * 0.5]], { fill: P.chrome, ink: P.ink, lw: L * 0.9 });
            line(g, [[a[0] - 0.05, a[1] - 0.03], [b[0] + 0.12, b[1] - 0.04]], L * 0.7, P.chromeTop);
            line(g, [[b[0] + 0.1 - n[0] * 0.9, b[1] + 0.02 + n[1] * 0.9], [b[0] + 0.1 + n[0] * 0.9, b[1] + 0.02 - n[1] * 0.9]], L * 0.7, P.ink);
            C.poly(g, C.ellipsePts(b[0], b[1], 0.035, 0.112, 18, 0.18), { fill: P.tyre, ink: P.ink, lw: L * 0.7 });
        }
        // the whip antenna on the tail and its pennant (it flutters on twos)
        const d = C.drawing(t), sw = [0, 0.05, -0.03][((d % 3) + 3) % 3];
        C.poly(g, [[-4.33, dk], [-4.33, dk - 0.1], [-4.25, dk - 0.1], [-4.25, dk]], { fill: P.chrome, ink: P.ink, lw: L * 0.7 });
        const whip = C.curve([[-4.29, dk - 0.1], [-4.36, dk - 0.95], [-4.56 - sw * 0.4, dk - 1.8], [-4.92 - sw, dk - 2.55]], false, 8);
        line(g, whip, L * 1.15, P.ink);
        const n = whip.length, pa = whip[n - 2], pb = whip[n - 7];
        C.poly(g, [pa, [pa[0] - 0.52, lerp(pa[1], pb[1], 0.6) + sw * 1.4], pb], { fill: P.pennant, ink: P.ink, lw: L * 0.8 });
        circ(g, whip[n - 1][0], whip[n - 1][1], 0.045, P.chromeTop, L * 0.7, P.ink);
    }

    /**
     * The band's ride: a long red hot rod with a stage for a deck (8.8 long from tail to nose,
     * about 9.6 with the pipes and the whip; the backline tops out 3.5 above the ground).
     *   x, y   the ground under the middle of the car;  s  logical units per figure unit
     *   o: { spin (the rear wheels' angle in radians; the smaller front ones turn faster),
     *        bounce (-0.5..1, the body sinks on its suspension by a tenth of a unit),
     *        lean (0..0.25 rad, it rears up on its back wheels), exhaust (0..1 puffs from the
     *        pipes, on twos), t (seconds: puffs, pennant and footlights tick on twos) }
     *   riders(g, seats, s)  called between the two passes, in the car's units; see Rides.at
     *                        and Rides.bandCarSeats
     */
    function bandCar(g, x, y, s, o = {}, riders = null) {
        const P = ROD, L = 3.2 / s, t = o.t ?? 0, spin = o.spin ?? 0, bn = o.bounce ?? 0, lean = o.lean ?? 0, ex = o.exhaust ?? 0;
        const [rx, rR] = B.rear, [fx, fR] = B.front, zf = BW - 0.02;
        g.save();
        g.translate(x, y);
        g.scale(s, s);
        g.lineJoin = 'round';
        // the body turns about the rear axle and sinks on its springs; the rear wheels stay put
        const body = (fn, sprung = true) => {
            g.save();
            g.translate(rx, -rR);
            g.rotate(-lean);
            g.translate(-rx, rR);
            if (sprung) g.translate(0, bn * 0.1);
            fn();
            g.restore();
        };
        g.fillStyle = SHADOW;
        g.beginPath();
        g.ellipse(0.3, -0.1, 4.8, 0.2, 0, 0, TAU);
        g.fill();
        wheel(g, L, rx + D[0] * zf, -rR + D[1] * zf, rR, spin, P, { far: true });
        body(() => wheel(g, L, fx + D[0] * zf, -fR + D[1] * zf, fR, spin, P, { far: true }), false);
        body(() => {
            bandBack(g, L, P);
            if (riders) riders(g, bandCarSeats(), s);
            bandFront(g, L, P, t);
        });
        const near = Dd(-B.out);
        body(() => wheel(g, L, fx + near[0], -fR + near[1], fR, spin * (rR / fR), P, {}), false);
        wheel(g, L, rx + near[0], -rR + near[1], rR, spin, P, {});
        // exhaust: a train of puffs that leaves the pipes and grows, one step per drawing
        if (ex > 0) {
            body(() => {
                const d = C.drawing(t), n = 4, list = [];
                for (let i = 0; i < n; i++) {
                    const u = (i + (((d % 3) + 3) % 3) / 3) / n;
                    if (u > ex * 1.05) continue;
                    list.push([-4.95 - u * 1.9, -0.76 - u * 0.55 - u * u * 0.5, (0.08 + 0.26 * u) * (0.6 + 0.4 * ex) * (u > 0.8 ? (1 - u) / 0.2 * 0.5 + 0.5 : 1), 6, i * 1.3 + d * 0.7]);
                }
                puffs(g, list, P.smoke, L * 0.9, P.ink);
            });
        }
        g.restore();
    }

    // =========================================================================================
    // The Devil's ride
    // =========================================================================================
    const HEARSE = {
        ink: K.ink, ...CHROME,
        body: '#44366f', top: '#6555a3', side: '#2c2349', inside: '#1f1a2b', frame: '#2a2438', frameTop: '#3d3652',
        flame: '#e0258b', flameIn: '#ff8a2b', fire: '#ff8a2b', fireIn: '#ffe62e',
        tyre: '#2a2438', tyreSide: '#1f1a2b', rim: '#e8392f', rimSide: '#ad211f',
        glass: '#ffe62e', glassLow: '#ffc21f', curtain: '#e0258b', curtainDark: '#a3176a', trim: '#ffc21f',
        velvet: '#e0258b', velvetTop: '#ff4fa5', velvetSide: '#a3176a',
        fin: '#7d47e1', finSide: '#5a2fb5',
        bone: '#f4edd8', boneTop: '#fffdf4', boneSide: '#cdbf9c', socket: '#2a2438', tooth: '#fffdf4', mouth: '#5a1220',
        iron: '#4a4470', ironTop: '#625c8c', ironSide: '#353055', lamp: '#ffe62e',
    };
    const HW = 1.5;
    const H = { rear: [-2.5, 0.58], front: [3.1, 0.4], out: 0.28, roof: -1.98 };
    // the coffin, clockwise: foot (rear) top, shoulder top, head top, head bottom, shoulder bottom, foot bottom
    const H_COFFIN = [[-3.5, -1.62], [-0.3, -1.9], [0.5, -1.52], [0.5, -0.92], [-0.3, -0.6], [-3.5, -1.0]];
    const H_TUB = [[-0.3, -0.6], [-0.3, -0.95], [0.5, -1.0], [0.72, -0.92], [1.35, -0.92], [1.72, -1.1], [1.85, -1.1], [1.85, -0.6]];
    const H_FRAME = [[-3.5, -1.0], [-0.3, -0.6], [3.3, -0.6], [3.3, -0.46], [-0.3, -0.46], [-3.5, -0.86]];
    const H_WHEEL = { c: ob(1.68, -1.36, 0.65), r: 0.2, up: [0.35, -0.94] };
    const H_SEAT = { chauffeur: [1.185, -0.54, 0.45], devil: [-1.165, H.roof - 0.09, 0.45] };
    function hearseSeats() {
        return {
            // seated: a standing figure placed here shows from the waist up over the side
            chauffeur: H_SEAT.chauffeur.slice(),
            // standing on the platform on the roof, whole
            devil: H_SEAT.devil.slice(),
            // where a mitt rests on the steering wheel's rim
            wheel: [H_WHEEL.c[0] - H_WHEEL.r * D[0] - 0.02, H_WHEEL.c[1] - H_WHEEL.r * D[1] - 0.03],
            roofY: H.roof, width: HW,
        };
    }
    const roofY = (x) => lerp(-1.9, -1.62, (-0.3 - x) / 3.2);

    // A little box skull facing the camera (the hood ornament). x, y: the middle of its base.
    function miniSkull(g, L, P, x, y, w) {
        const h = w * 0.82, d = w * 0.7;
        C.box(g, x - w * 0.3, y - h * 0.3, w * 0.6, h * 0.3, D, { front: P.bone, top: P.boneTop, side: P.boneSide }, { lw: L, ink: P.ink, depth: d * 0.8 });
        C.box(g, x - w / 2, y - h, w, h * 0.74, D, { front: P.bone, top: P.boneTop, side: P.boneSide }, { lw: L, ink: P.ink, depth: d });
        for (const sx of [-1, 1]) {
            g.fillStyle = P.socket;
            g.fillRect(x + sx * w * 0.2 - w * 0.09, y - h * 0.78, w * 0.18, h * 0.26);
        }
        C.poly(g, [[x, y - h * 0.5], [x + w * 0.05, y - h * 0.38], [x - w * 0.05, y - h * 0.38]], { fill: P.socket, lw: 0 });
        g.strokeStyle = P.ink;
        g.lineWidth = L * 0.6;
        g.beginPath();
        for (let i = -1; i <= 1; i++) {
            g.moveTo(x + i * w * 0.14, y - h * 0.26);
            g.lineTo(x + i * w * 0.14, y - h * 0.04);
        }
        g.stroke();
    }

    // A bat's wing as a tail fin, standing on the roof's edge at depth z.
    function fin(g, L, P, z) {
        const F = [-2.5, roofY(-2.5)], T0 = [-3.72, -2.62], T1 = [-4.02, -2.18], T2 = [-3.9, -1.8], Bk = [-3.5, roofY(-3.5)];
        const lead = C.curve([F, [-2.8, -2.02], [-3.25, -2.38], T0], false, 6);
        const arc = (a, b, sag) => {
            const mx = (a[0] + b[0]) / 2 + sag[0], my = (a[1] + b[1]) / 2 + sag[1];
            return C.curve([a, [mx, my], b], false, 6).slice(1);
        };
        const wing = cw(shift([...lead, ...arc(T0, T1, [0.17, 0.02]), ...arc(T1, T2, [0.16, 0.03]), ...arc(T2, Bk, [0.1, -0.08])], Dd(z)));
        C.prism(g, wing, Dd(0.07), { front: P.fin, top: P.finSide, side: P.finSide }, { lw: L, ink: P.ink, sweepInk: null });
        C.prismOutline(g, wing, Dd(0.07), { lw: L, ink: P.ink });
        const wrist = ob(-2.72, -1.9, z);
        for (const T of [T1, T2]) line(g, [wrist, ob(T[0] + 0.03, T[1] - 0.01, z)], L * 0.8, P.ink);
        line(g, [wrist, ob(-3.5, -2.36, z)], L * 0.8, P.finSide);
    }

    // The platform's rail: short posts with spear tips and one bar, at depth z.
    function pulpitRail(g, L, P, z) {
        const y = H.roof;
        for (const x of [-2.12, -1.33, -0.54]) {
            const p = ob(x, y, z);
            tube(g, [p, [p[0], p[1] - 0.2]], 0.035, P.trim, L * 0.7);
            C.poly(g, [[p[0] - 0.045, p[1] - 0.2], [p[0], p[1] - 0.31], [p[0] + 0.045, p[1] - 0.2]], { fill: P.trim, ink: P.ink, lw: L * 0.7 });
        }
        tube(g, [ob(-2.12, y - 0.13, z), ob(-0.54, y - 0.13, z)], 0.035, P.trim, L * 0.7);
    }

    // A headlight on a stalk beside the radiator: a bullet bucket and a lens like a slit eye.
    function eyeLamp(g, L, P, z) {
        const c = ob(3.45, -1.12, z);
        C.poly(g, C.curve([[c[0] - 0.36, c[1]], [c[0] - 0.22, c[1] - 0.13], [c[0] - 0.02, c[1] - 0.17], [c[0] + 0.03, c[1]], [c[0] - 0.02, c[1] + 0.17], [c[0] - 0.22, c[1] + 0.13]], true, 5), { fill: P.chrome, ink: P.ink, lw: L });
        line(g, [[c[0] - 0.28, c[1] - 0.045], [c[0] - 0.12, c[1] - 0.085]], L * 0.8, P.chromeTop);
        C.poly(g, ringX(c, 0.19), { fill: P.chromeSide, ink: P.ink, lw: L * 0.8 });
        C.poly(g, ringX(c, 0.14), { fill: P.lamp, ink: P.ink, lw: L * 0.6 });
        line(g, [[c[0], c[1] - 0.085], [c[0], c[1] + 0.085]], L * 1.1, P.socket);
    }

    function hearseBack(g, L, P) {
        const DW = Dd(HW), body = { front: P.body, top: P.top, side: P.side };
        eyeLamp(g, L, P, HW + 0.32);
        C.prism(g, H_FRAME, DW, { front: P.frame, top: P.frameTop, side: P.frame }, { lw: L, ink: P.ink });
        C.prism(g, H_TUB, DW, body, { lw: L, ink: P.ink });
        C.prism(g, H_COFFIN, DW, body, { lw: L, ink: P.ink });
        // the lid's seam round the far edge of the roof
        line(g, [ob(-3.4, roofY(-3.4) + 0.012, HW - 0.1), ob(-0.34, -1.888, HW - 0.1), ob(0.42, -1.53, HW - 0.1)], L * 0.6, P.side);
        // --- the bench: its well, a tufted back against the coffin, the cushion -------------
        const rim = [[0.66, -0.94], [0.76, -0.92], [1.35, -0.92], [1.66, -1.07]];
        C.poly(g, [...rim.map(([x, y]) => ob(x, y, 0.1)), ...rim.slice().reverse().map(([x, y]) => ob(x, y, HW - 0.1))], { fill: P.inside, ink: P.ink, lw: L * 0.8 });
        const vel = { front: P.velvet, top: P.velvetTop, side: P.velvetSide };
        const cu = ob(0.64, -0.88, 0.14);
        C.box(g, cu[0], cu[1], 0.7, 0.2, D, vel, { lw: L, ink: P.ink, depth: HW - 0.28 });
        const bk = ob(0.5, -1.46, 0.14);
        C.box(g, bk[0], bk[1], 0.14, 0.6, D, vel, { lw: L, ink: P.ink, depth: HW - 0.28 });
        for (let i = 1; i < 5; i++) {
            const z = 0.14 + ((HW - 0.28) * i) / 5;
            line(g, [ob(0.64, -1.44, z), ob(0.64, -0.9, z)], L * 0.55, P.velvetSide);
        }
        // --- the pulpit on the roof where the Devil stands, and its far rail ----------------
        for (const [x, z] of [[-2.05, 1.2], [-0.62, 1.2], [-2.05, 0.2], [-0.62, 0.2]]) {
            const p = ob(x, H.roof + 0.05, z);
            C.box(g, p[0] - 0.04, p[1], 0.08, roofY(x) - H.roof - 0.02, D, { front: P.iron, top: P.ironTop, side: P.ironSide }, { lw: L * 0.8, ink: P.ink, depth: 0.08 });
        }
        const pl = ob(-2.2, H.roof, 0.15);
        C.box(g, pl[0], pl[1], 1.75, 0.075, D, { front: P.iron, top: P.ironTop, side: P.ironSide }, { lw: L, ink: P.ink, depth: 1.15 });
        for (let i = 1; i < 4; i++) line(g, [ob(-2.18, H.roof, 0.15 + (1.15 * i) / 4), ob(-0.47, H.roof, 0.15 + (1.15 * i) / 4)], L * 0.5, P.ironSide);
        pulpitRail(g, L, P, 1.27);
        fin(g, L, P, HW - 0.09);
        // --- the engine: a chrome block, the blower and its scoop ---------------------------
        const chrome = { front: P.chrome, top: P.chromeTop, side: P.chromeSide };
        const bl = ob(2.2, -1.02, 0.4);
        C.box(g, bl[0], bl[1], 0.92, 0.42, D, chrome, { lw: L, ink: P.ink, depth: 0.7 });
        line(g, [[bl[0] + 0.05, bl[1] + 0.1], [bl[0] + 0.87, bl[1] + 0.1]], L * 0.7, P.ink);
        for (let i = 0; i < 6; i++) circ(g, bl[0] + 0.1 + i * 0.145, bl[1] + 0.05, 0.016, P.ink, 0);
        const bw = ob(2.36, -1.36, 0.5);
        C.box(g, bw[0], bw[1], 0.6, 0.34, D, chrome, { lw: L, ink: P.ink, depth: 0.5 });
        for (let i = 1; i < 5; i++) line(g, [[bw[0] + 0.04, bw[1] + i * 0.068], [bw[0] + 0.56, bw[1] + i * 0.068]], L * 0.6, P.chromeSide);
        // the belt on the blower's nose
        C.poly(g, faceX(2.96, -1.3, -1.06, 0.62, 0.88), { fill: P.frame, ink: P.ink, lw: L * 0.6 });
        const scoop = shift([[2.4, -1.36], [2.4, -1.47], [2.56, -1.66], [3.04, -1.66], [3.04, -1.46], [2.92, -1.36]], Dd(0.52));
        C.prism(g, scoop, Dd(0.46), { front: P.rim, top: '#ff6f59', side: P.rimSide }, { lw: L, ink: P.ink });
        C.poly(g, shift(faceX(3.04, -1.62, -1.5, 0.07, 0.39), Dd(0.52)), { fill: P.socket, ink: P.ink, lw: L * 0.6 });
        // --- the radiator: a shell whose grille is a grin of teeth, lamps for eyes ----------
        const sh = ob(3.25, -1.38, -0.05);
        C.box(g, sh[0], sh[1], 0.2, 0.88, D, body, { lw: L, ink: P.ink, depth: HW + 0.1 });
        const fz = (z, y) => ob(3.45, y, z);
        const lip = [fz(0.06, -1.24), fz(0.36, -1.06), fz(1.14, -1.06), fz(1.44, -1.24), fz(1.22, -0.66), fz(0.28, -0.66)];
        C.poly(g, lip, { fill: P.mouth, ink: P.ink, lw: L });
        g.save();
        C.trace(g, lip);
        g.clip();
        C.poly(g, [fz(-0.1, -1.3), fz(1.6, -1.3), fz(1.6, -0.9), fz(-0.1, -0.9)], { fill: P.tooth, lw: 0 });
        C.poly(g, [fz(0.3, -0.74), fz(1.2, -0.74), fz(1.2, -0.6), fz(0.3, -0.6)], { fill: P.tooth, lw: 0 });
        g.strokeStyle = P.ink;
        g.lineWidth = L * 0.7;
        g.beginPath();
        for (let i = 1; i < 6; i++) {
            const z = 0.06 + (1.38 * i) / 6;
            g.moveTo(...fz(z, -1.3));
            g.lineTo(...fz(z, -0.9));
            g.moveTo(...fz(z + 0.115, -0.74));
            g.lineTo(...fz(z + 0.115, -0.6));
        }
        g.moveTo(...fz(0, -0.9));
        g.lineTo(...fz(1.5, -0.9));
        g.moveTo(...fz(0.2, -0.74));
        g.lineTo(...fz(1.3, -0.74));
        g.stroke();
        g.restore();
        C.poly(g, lip, { ink: P.ink, lw: L });
        const sk = ob(3.35, -1.38, 0.55);
        miniSkull(g, L, P, sk[0], sk[1], 0.34);
        // --- the steering column and wheel ---------------------------------------------------
        const W = H_WHEEL;
        tube(g, [ob(1.8, -1.1, 0.65), W.c], 0.045, P.chromeSide, L * 0.7);
        tube(g, ringX(W.c, W.r, 28, W.up), 0.05, P.bone, L * 0.7, true);
    }

    // A gothic window with tied-back curtains. cx: its middle; y0: sill; y1: the arch's tip.
    function window_(g, L, P, cx, y0, y1, hw) {
        const hgt = y0 - y1, ah = Math.min(hgt * 0.62, hw * 1.7), ys = y1 + ah, pts = [[cx - hw, y0], [cx - hw, ys]];
        for (let i = 1; i <= 8; i++) {
            const a = Math.PI - (i / 8) * (Math.PI / 3);
            pts.push([cx + hw + 2 * hw * Math.cos(a), ys - (2 * hw * Math.sin(a) * ah) / (1.732 * hw)]);
        }
        for (let i = 7; i >= 0; i--) {
            const a = (i / 8) * (Math.PI / 3);
            pts.push([cx - hw + 2 * hw * Math.cos(a), ys - (2 * hw * Math.sin(a) * ah) / (1.732 * hw)]);
        }
        pts.push([cx + hw, y0]);
        const grow = (k) => pts.map(([x, y]) => [cx + (x - cx) * (1 + k / hw), (y0 + y1) / 2 + (y - (y0 + y1) / 2) * (1 + (2 * k) / hgt)]);
        C.poly(g, grow(0.05), { fill: P.trim, ink: P.ink, lw: L });
        C.poly(g, pts, { fill: P.glass, ink: P.ink, lw: L * 0.8 });
        g.save();
        C.trace(g, pts);
        g.clip();
        line(g, [[cx, y1], [cx, y0]], L * 0.6, P.glassLow);
        line(g, [[cx - hw, y0 - hgt * 0.36], [cx + hw, y0 - hgt * 0.36]], L * 0.6, P.glassLow);
        for (const sx of [-1, 1]) {
            // a drape from the arch's tip, swagged to a tie at the side, its tail below
            const tie = [cx + sx * hw * 0.74, y0 - hgt * 0.36];
            const swag = C.curve([[cx + sx * 0.012, y1 - 0.02], [cx + sx * hw * 0.2, lerp(y1, tie[1], 0.66)], tie], false, 6);
            C.poly(g, [[cx + sx * hw * 1.2, y1 - 0.05], ...swag, [cx + sx * hw * 0.56, y0 + 0.03], [cx + sx * hw * 1.2, y0 + 0.03]], { fill: P.curtain, ink: P.ink, lw: L * 0.7 });
            line(g, [[cx + sx * hw * 0.5, ys - hgt * 0.1], [cx + sx * hw * 0.84, tie[1] - 0.03]], L * 0.55, P.curtainDark);
            line(g, [[tie[0] - sx * 0.01, tie[1]], [cx + sx * hw * 1.1, tie[1] - 0.012]], L * 1.5, P.trim);
        }
        g.restore();
        C.poly(g, pts, { ink: P.ink, lw: L * 0.8 });
    }

    function hearseFront(g, L, P, t, fl, swing) {
        const d = C.drawing(t);
        C.poly(g, H_FRAME, { fill: P.frame, ink: P.ink, lw: L });
        // the tub's side and then the coffin's, each with its part of the flame job, which
        // runs from the cowl back along the sill
        const flames = () => {
            C.poly(g, flamePts(1.85, -0.9, -0.6, 1.0, [[-1.85, -0.94], [-0.75, -0.73]]), { fill: P.flame, ink: P.ink, lw: L * 0.85 });
            C.poly(g, flamePts(1.85, -0.855, -0.645, 1.4, [[-0.1, -0.9], [0.45, -0.715]]), { fill: P.flameIn, lw: 0 });
        };
        for (const panel of [H_TUB, H_COFFIN]) {
            C.poly(g, panel, { fill: P.body, lw: 0 });
            g.save();
            C.trace(g, panel);
            g.clip();
            flames();
            g.restore();
            C.poly(g, panel, { ink: P.ink, lw: L });
            if (panel === H_TUB) C.poly(g, [[0.5, -1.0], [0.72, -0.92], [1.35, -0.92], [1.72, -1.1], ob(1.72, -1.1, 0.1), ob(1.35, -0.92, 0.1), ob(0.72, -0.92, 0.1), ob(0.5, -1.0, 0.1)], { fill: P.top, ink: P.ink, lw: L });
        }
        // the lid's seam, the windows, the coffin's handle
        line(g, [[-3.5, -1.53], [-0.33, -1.805], [0.5, -1.41]], L * 0.75, P.ink);
        window_(g, L, P, -0.82, -1.14, -1.73, 0.3);
        window_(g, L, P, -1.68, -1.16, -1.66, 0.27);
        window_(g, L, P, -2.47, -1.18, -1.6, 0.24);
        for (const x of [-2.95, -1.7, -0.45]) {
            const y = lerp(-1.0, -1.08, (-0.45 - x) / 2.5);
            C.poly(g, [[x - 0.05, y - 0.05], [x + 0.05, y - 0.05], [x + 0.05, y + 0.05], [x - 0.05, y + 0.05]], { fill: P.chromeSide, ink: P.ink, lw: L * 0.7 });
        }
        tube(g, [[-3.08, -1.085], [-0.32, -0.996]], 0.045, P.chrome, L * 0.8);
        fin(g, L, P, 0.02);
        pulpitRail(g, L, P, 0.13);
        eyeLamp(g, L, P, -0.32);
        // --- zoomie pipes out of the block's side, and what they spit -----------------------
        for (let i = 3; i >= 0; i--) {
            const a = ob(2.32 + i * 0.185, -0.72, 0.4), m = [a[0] - 0.02, a[1] - 0.2], b = [a[0] - 0.17, a[1] - 0.45];
            if (fl > 0) fire(g, L, b[0], b[1], Math.atan2(-0.4, -0.2), (0.16 + 0.26 * fl) * (i % 2 ? 0.85 : 1), 0.13 + 0.05 * fl, [P.fire, P.fireIn], d + i * 2);
            tube(g, [a, m, b], 0.1, P.chrome, L * 0.85);
            line(g, [[a[0] - 0.03, a[1] - 0.03], [m[0] - 0.03, m[1]], [b[0] - 0.012, b[1] + 0.035]], L * 0.6, P.chromeTop);
            C.poly(g, C.ellipsePts(b[0] - 0.012, b[1] - 0.02, 0.058, 0.026, 14, -0.52), { fill: P.socket, ink: P.ink, lw: L * 0.6 });
            C.poly(g, [[a[0] - 0.075, a[1] + 0.035], [a[0] + 0.075, a[1] + 0.035], [a[0] + 0.075, a[1] - 0.03], [a[0] - 0.075, a[1] - 0.03]], { fill: P.chromeSide, ink: P.ink, lw: L * 0.7 });
        }
        // --- the lantern on a crook at the back, swinging --------------------------------------
        const crook = C.curve([[-3.46, -0.96], [-3.72, -1.02], [-3.97, -1.24], [-4.02, -1.46], [-3.9, -1.56], [-3.8, -1.46]], false, 8);
        tube(g, crook, 0.04, P.iron, L * 0.75);
        const pv = [-3.8, -1.45];
        const lp = (pts) => cw(pts.map((p) => {
            const q = rot(p, swing);
            return [pv[0] + q[0], pv[1] + q[1]];
        }));
        const iron = { front: P.iron, top: P.ironTop, side: P.ironSide }, th = Dd(0.14);
        tube(g, lp([[0, 0], [0, 0.1]]), 0.025, P.iron, L * 0.6);
        C.prism(g, lp([[-0.11, 0.42], [0.11, 0.42], [0.13, 0.48], [-0.13, 0.48]]), th, iron, { lw: L * 0.85, ink: P.ink });
        C.prism(g, lp([[-0.09, 0.19], [0.09, 0.19], [0.09, 0.42], [-0.09, 0.42]]), th, { front: P.lamp, top: P.lamp, side: P.glassLow }, { lw: L * 0.85, ink: P.ink });
        C.poly(g, lp(C.curve([[0, 0.24], [0.04, 0.32], [0.035, 0.38], [0, 0.4], [-0.035, 0.38], [-0.03, 0.31]], true, 4)), { fill: P.fire, ink: P.ink, lw: L * 0.5 });
        C.prism(g, lp([[-0.04, 0.09], [0.04, 0.09], [0.13, 0.19], [-0.13, 0.19]]), th, iron, { lw: L * 0.85, ink: P.ink });
    }

    /**
     * The Devil's ride: a hot-rod hearse (a coffin for a cabin, a pulpit on its roof; 7 long,
     * about 8 with the lantern and the lamps; the pulpit's floor is 1.98 above the ground).
     *   o: { spin, bounce (-0.5..1), lean (0..0.25 rad, rearing up), flames (0..1 out of the
     *        zoomie pipes), t (seconds: flames flicker and the lantern swings on twos),
     *        swing (radians, to pose the lantern yourself) }
     *   riders(g, seats, s)  seats.chauffeur, seats.devil (and seats.wheel for a mitt)
     */
    function hearse(g, x, y, s, o = {}, riders = null) {
        const P = HEARSE, L = 3.2 / s, t = o.t ?? 0, spin = o.spin ?? 0, bn = o.bounce ?? 0, lean = o.lean ?? 0, fl = o.flames ?? 0;
        const tq = C.onTwos(t), swing = o.swing ?? 0.3 * Math.sin(tq * 5.2) + lean * 0.8;
        const [rx, rR] = H.rear, [fx, fR] = H.front, zf = HW + 0.02;
        g.save();
        g.translate(x, y);
        g.scale(s, s);
        g.lineJoin = 'round';
        const body = (fn, sprung = true) => {
            g.save();
            g.translate(rx, -rR);
            g.rotate(-lean);
            g.translate(-rx, rR);
            if (sprung) g.translate(0, bn * 0.1);
            fn();
            g.restore();
        };
        g.fillStyle = SHADOW;
        g.beginPath();
        g.ellipse(0.3, -0.1, 3.95, 0.2, 0, 0, TAU);
        g.fill();
        wheel(g, L, rx + D[0] * zf, -rR + D[1] * zf, rR, spin, P, { far: true });
        body(() => wheel(g, L, fx + D[0] * zf, -fR + D[1] * zf, fR, spin, P, { far: true }), false);
        body(() => {
            hearseBack(g, L, P);
            if (riders) riders(g, hearseSeats(), s);
            hearseFront(g, L, P, t, fl, swing);
        });
        const near = Dd(-H.out);
        body(() => wheel(g, L, fx + near[0], -fR + near[1], fR, spin * (rR / fR), P, { kind: 'red' }), false);
        wheel(g, L, rx + near[0], -rR + near[1], rR, spin, P, { kind: 'red' });
        g.restore();
    }

    // =========================================================================================
    // The chauffeur
    // =========================================================================================
    const SKEL = {
        ink: K.ink, bone: '#f4edd8', boneTop: '#fffdf4', boneSide: '#cdbf9c', socket: '#2a2438', glint: '#fffdf4', mouth: '#5a1220',
        jacket: '#44366f', jacketTop: '#6555a3', jacketSide: '#2c2349', lapel: '#54448a', dark: '#1f1a2b',
        skin: '#fffdf4', skinTop: '#ffffff', skinSide: '#d6d0c2', // the gloves
        jeans: '#3a2f5e', jeansSide: '#2c2349', shoe: '#2a2438', shoeTop: '#3d3652', shoeSide: '#1f1a2b', sole: '#fffdf4',
        cap: '#44366f', capTop: '#6555a3', capSide: '#2c2349', band: '#e0258b', bandSide: '#a3176a', peak: '#1f1a2b', gold: '#ffc21f',
        shadow: SHADOW,
    };
    /**
     * The skeleton chauffeur, a box person like the rest.
     *   x, y   the ground between his feet;  s  logical units per figure unit
     *   pose: { squash, lean, headDy, headTilt, jaw (0..1, it drops for a laugh),
     *           hands: { l: [x, y], r: [x, y] } in his units (l = the arm on screen right;
     *           by default it holds the hearse's wheel and the other rests at his side),
     *           shadow (false to leave the contact shadow out, as when he is seated) }
     */
    function skeleton(g, x, y, s, pose = {}, P = SKEL) {
        const L = 3.2 / s, q = pose.squash ?? 0, jaw = Math.max(0, Math.min(1, pose.jaw ?? 0));
        const T = { x: -0.36, y: -0.98, w: 0.72, h: 0.62, d: 0.4 };
        g.save();
        g.translate(x, y);
        g.scale(s, s);
        g.lineJoin = 'round';
        if (pose.shadow !== false) {
            g.fillStyle = P.shadow;
            g.beginPath();
            g.ellipse(0.05, 0, 0.56 * (1 + q), 0.06, 0, 0, TAU);
            g.fill();
        }
        g.rotate(pose.lean ?? 0);
        g.scale(1 + q, 1 - q);
        Cast.legs(g, P, L);
        // the uniform: a jacket open on the ribs, lapels, gold buttons and shoulder boards
        C.box(g, T.x, T.y, T.w, T.h, D, { front: P.jacket, top: P.jacketTop, side: P.jacketSide }, { lw: L, ink: P.ink, depth: T.d });
        const open = [[-0.2, T.y], [0.2, T.y], [0.045, T.y + 0.45], [-0.045, T.y + 0.45]];
        C.poly(g, open, { fill: P.dark, ink: P.ink, lw: L * 0.8 });
        g.save();
        C.trace(g, open);
        g.clip();
        line(g, [[0, T.y], [0, T.y + 0.45]], 0.042, P.bone);
        for (let i = 0; i < 3; i++) {
            const ry = T.y + 0.1 + i * 0.105;
            line(g, [[-0.2, ry - 0.025], [0, ry + 0.012], [0.2, ry - 0.025]], 0.042, P.bone);
        }
        g.restore();
        C.poly(g, open, { ink: P.ink, lw: L * 0.8 });
        for (const sx of [-1, 1]) {
            C.poly(g, [[sx * 0.2, T.y], [sx * 0.31, T.y], [sx * 0.25, T.y + 0.24], [sx * 0.045, T.y + 0.45]], { fill: P.lapel, ink: P.ink, lw: L * 0.8 });
            C.poly(g, [[sx * 0.36, T.y + 0.012], [sx * 0.22, T.y + 0.012], [sx * 0.22, T.y + 0.07], [sx * 0.36, T.y + 0.07]], { fill: P.gold, ink: P.ink, lw: L * 0.7 });
        }
        line(g, [[0, T.y + 0.45], [0, T.y + T.h]], L * 0.8, P.ink);
        for (const by of [0.5, 0.57]) circ(g, 0.055, T.y + by, 0.02, P.gold, L * 0.5, P.ink);
        // --- the head: jaw, skull, cap ----------------------------------------------------
        g.save();
        g.translate(0, pose.headDy ?? 0);
        g.translate(0, -1.08);
        g.rotate(pose.headTilt ?? 0);
        g.translate(0, 1.08);
        const top = -1.74, hw = 0.42, ch = -1.3, jx = 0.29, ub = -1.13, drop = jaw * 0.13;
        const bone = { front: P.bone, top: P.boneTop, side: P.boneSide };
        // the jaw hangs under the skull; the mouth opens between them
        C.box(g, -jx + 0.02, ub + drop - 0.02, jx * 2 - 0.04, 0.15, D, bone, { lw: L, ink: P.ink, depth: 0.36 });
        if (drop > 0.01) C.poly(g, [[-jx + 0.04, ub - 0.02], [jx - 0.04, ub - 0.02], [jx - 0.04, ub + drop + 0.005], [-jx + 0.04, ub + drop + 0.005]], { fill: P.mouth, ink: P.ink, lw: L * 0.8 });
        g.strokeStyle = P.ink;
        g.lineWidth = L * 0.7;
        g.beginPath();
        g.moveTo(-jx + 0.02, ub + drop + 0.055);
        g.lineTo(jx - 0.02, ub + drop + 0.055);
        for (let i = -2; i <= 2; i++) {
            g.moveTo(i * 0.092, ub + drop - 0.02);
            g.lineTo(i * 0.092, ub + drop + 0.055);
        }
        g.stroke();
        const skull = [[-hw, top], [hw, top], [hw, ch], [jx, ch + 0.07], [jx, ub], [-jx, ub], [-jx, ch + 0.07], [-hw, ch]];
        C.prism(g, skull, Dd(0.46), bone, { lw: L, ink: P.ink });
        // upper teeth along the skull's lower edge
        g.strokeStyle = P.ink;
        g.lineWidth = L * 0.7;
        g.beginPath();
        g.moveTo(-jx, ub - 0.085);
        g.lineTo(jx, ub - 0.085);
        for (let i = -2.5; i <= 2.5; i++) {
            g.moveTo(i * 0.092, ub - 0.085);
            g.lineTo(i * 0.092, ub);
        }
        g.stroke();
        // sockets (slots, with a glint so he can look alive), the nose hole, a crack
        const ey = -1.47;
        for (const sx of [-1, 1]) {
            g.beginPath();
            g.roundRect(sx * 0.175 - 0.07, ey - 0.105, 0.14, 0.21, 0.035);
            g.fillStyle = P.socket;
            g.fill();
            g.fillStyle = P.glint;
            g.fillRect(sx * 0.175 - 0.045, ey - 0.02 - jaw * 0.03, 0.036, 0.04);
        }
        C.poly(g, [[0, ey + 0.1], [0.05, ey + 0.2], [-0.05, ey + 0.2]], { fill: P.socket, lw: 0 });
        line(g, [[0.4, ey - 0.02], [0.33, ey + 0.03], [0.37, ey + 0.08], [0.31, ey + 0.12]], L * 0.6, P.ink);
        // the peaked cap: a band, a crown that flares, a shiny peak and a badge
        const capD = Dd(0.5), bt = top - 0.1;
        C.prism(g, [[-hw - 0.02, bt], [hw + 0.02, bt], [hw + 0.02, top + 0.035], [-hw - 0.02, top + 0.035]], capD, { front: P.band, top: P.band, side: P.bandSide }, { lw: L, ink: P.ink });
        C.prism(g, [[-hw - 0.1, bt - 0.2], [hw + 0.1, bt - 0.2], [hw + 0.02, bt], [-hw - 0.02, bt]], capD, { front: P.cap, top: P.capTop, side: P.capSide }, { lw: L, ink: P.ink });
        C.poly(g, [[-0.38, top + 0.03], [0.38, top + 0.03], [0.33, top + 0.115], [0.2, top + 0.14], [-0.2, top + 0.14], [-0.33, top + 0.115]], { fill: P.peak, ink: P.ink, lw: L });
        line(g, [[-0.25, top + 0.075], [0.02, top + 0.075]], L * 0.7, P.glint);
        circ(g, 0, bt - 0.085, 0.062, P.gold, L * 0.7, P.ink);
        g.restore();
        // --- arms: white-gloved mitts -------------------------------------------------------
        const hands = pose.hands ?? {};
        Cast.arm(g, P, L, [T.x + 0.03, T.y + 0.13], hands.r ?? [-0.5, -0.47]);
        Cast.arm(g, P, L, [T.x + T.w - 0.03, T.y + 0.13], hands.l ?? SKEL_WHEEL);
        g.restore();
    }
    // where the hearse's steering wheel is when he sits on its bench
    const SKEL_WHEEL = [H_WHEEL.c[0] - H_WHEEL.r * D[0] - 0.02 - H_SEAT.chauffeur[0] - 0.08, H_WHEEL.c[1] - H_WHEEL.r * D[1] - 0.03 - H_SEAT.chauffeur[1]];

    // =========================================================================================
    // Dust
    // =========================================================================================
    /**
     * The dust of a car peeling out to the right: a cluster of scalloped puffs that grows up
     * and back (to the left) and thins as k goes 0 → 1, boiling on twos, with a few pebbles.
     *   x, y   the ground where the tyre bites;  s  logical units per figure unit
     *   k      0..1 (nothing is drawn outside);  seed  a string;  t  seconds
     */
    function dust(g, x, y, s, k, seed = 'dust', t = 0) {
        if (!(k > 0 && k < 1)) return;
        const L = 3.2 / s, r = Motion.rng('rides-dust:' + seed), d = C.drawing(t);
        const grow = 1 - Math.pow(1 - k, 2.2), back = [], fore = [], stones = [];
        for (let i = 0; i < 9; i++) {
            const a = Math.PI * (1.02 + 0.5 * r()), dist = 0.25 + 1.5 * r(), size = 0.3 + 0.3 * r(), end = 0.62 + 0.38 * r(), n = 5 + Math.floor(r() * 3), a0 = r() * TAU, first = i < 5;
            const life = Math.max(0, 1 - k / end), rad = size * Math.min(1, 0.35 + k * 3.2) * Math.pow(life, 0.55) * (1 + 0.05 * (((d + i) % 2) * 2 - 1));
            const px = Math.cos(a) * dist * grow * 1.5 - 0.15, py = Math.min(-rad * 0.55, Math.sin(a) * dist * grow * 0.95 - rad * 0.5);
            (first ? back : fore).push([px, py, rad * (first ? 1.15 : 0.8), n, a0 + 0.4 * (((d + i * 2) % 3) - 1)]);
        }
        for (let i = 0; i < 4; i++) {
            const vx = -(2.6 + 2.4 * r()), vy = -(2.2 + 1.8 * r()), sz = 0.035 + 0.03 * r();
            stones.push([vx * k - 0.2, Math.min(0, vy * k + 3.6 * k * k) - 0.03, sz]);
        }
        g.save();
        g.translate(x, y);
        g.scale(s, s);
        g.lineJoin = 'round';
        for (const [px, py, sz] of stones) if (py < -0.031) circ(g, px, py, sz, '#c49a5c', L * 0.8);
        puffs(g, back, '#e2c08a', L);
        puffs(g, fore, '#fff1c4', L);
        g.restore();
    }

    return { D, Dd, ROD, HEARSE, SKEL, at, bandCar, bandCarSeats, hearse, hearseSeats, skeleton, dust, wheel };
})();
