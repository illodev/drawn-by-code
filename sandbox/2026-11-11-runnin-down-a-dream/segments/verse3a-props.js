// Props and effects of verse 3a (segments/verse3a.js): the sun clocking off (its arm, the
// blind it pulls down the sky), the band car's headlight beams, the cactus's plant pot and
// the big pedal under it (seen through a cutaway window in the door), the speedometer that
// pops out of the cowl, the afterburner, hair, pennant and cymbals pinned back by the wind,
// speed lines, the roadside clocks, and the Devil's work site (tower, cones, barrier,
// wheelbarrow of signs, lever, blueprint, his scarf and his sore nose).
//
// Car props are in the band car's figure units (rides.js: the origin is the ground under the
// middle of the car), drawn inside a context already moved and scaled to the car; site props
// take (x, y, s) like the cast. Global: Verse3aProps. Depends on Cereal, Cast, Rides,
// BandStrings, BandRhythm, Devil, Fx.
const Verse3aProps = (() => {
    const C = Cereal, K = C.COL, TAU = Math.PI * 2;
    const D = Cast.D, Dd = Cast.Dd;
    const ob = (x, y, z = 0) => [x + D[0] * z, y + D[1] * z];
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
    const line = (g, pts, lw, ink = K.ink) => C.poly(g, pts, { ink, lw, close: false });
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
    // A tube: a thick line in a colour with the outline round it.
    const tube = (g, pts, w, col, L, close = false) => {
        C.poly(g, pts, { ink: K.ink, lw: w + 2 * L, close });
        C.poly(g, pts, { ink: col, lw: w, close });
    };
    // A bar from a to b, w wide, as a solid (three tones).
    const bar = (g, a, b, w, cols, L, depth = null) => {
        const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1e-6, nx = (-dy / l) * w * 0.5, ny = (dx / l) * w * 0.5;
        C.prism(g, cw([[a[0] + nx, a[1] + ny], [b[0] + nx, b[1] + ny], [b[0] - nx, b[1] - ny], [a[0] - nx, a[1] - ny]]), Dd(depth ?? w), cols, { lw: L });
    };
    // A circle lying flat (a pot's mouth) is a sheared ellipse in this projection; a from 0 to
    // π is its far half, π to 2π the near one.
    const flat = (cx, cy, r, a) => [cx + r * Math.cos(a) + D[0] * r * Math.sin(a), cy + D[1] * r * Math.sin(a)];
    const arcFlat = (cx, cy, r, a0, a1, n = 18) => Array.from({ length: n + 1 }, (_, i) => flat(cx, cy, r, a0 + ((a1 - a0) * i) / n));
    const WOOD = { front: '#b98a55', top: '#dcb37c', side: '#8a6238' };
    const STEEL = { front: '#c9cfe2', top: '#f4f6fc', side: '#8d95ad' };

    // =========================================================================================
    // The sun clocks off
    // =========================================================================================
    // A stub arm in the cast's way, in logical units: a sleeve from the shoulder and a block
    // mitt at the hand.
    function stubArm(g, sh, hand, w, cols, L = 3.2) {
        const dx = hand[0] - sh[0], dy = hand[1] - sh[1], len = Math.hypot(dx, dy) || 1e-6, ux = dx / len, uy = dy / len;
        const quad = (a, b, k) => cw([[sh[0] + ux * a - uy * w * k, sh[1] + uy * a + ux * w * k], [sh[0] + ux * b - uy * w * k, sh[1] + uy * b + ux * w * k], [sh[0] + ux * b + uy * w * k, sh[1] + uy * b - ux * w * k], [sh[0] + ux * a + uy * w * k, sh[1] + uy * a - ux * w * k]]);
        const cut = Math.max(w * 0.3, len - w * 0.55);
        C.prism(g, quad(0, cut, 0.5), [w * 0.3, -w * 0.2], { front: cols.arm, top: cols.armTop, side: cols.armSide }, { lw: L });
        C.prism(g, quad(cut, len + w * 0.75, 0.64), [w * 0.34, -w * 0.23], { front: cols.mitt, top: cols.mittTop, side: cols.mittSide }, { lw: L });
    }
    const SUN_ARM = { arm: K.gold, armTop: K.yellow, armSide: '#e0a800', mitt: K.yellow, mittTop: '#fff59a', mittSide: K.gold };
    // The sun's arm: out of its rim towards `hand` (c: the sun's middle, r: its radius).
    function sunArm(g, c, r, hand) {
        const a = Math.atan2(hand[1] - c[1], hand[0] - c[0]);
        stubArm(g, [c[0] + Math.cos(a) * r * 0.86, c[1] + Math.sin(a) * r * 0.86], hand, 30, SUN_ARM);
    }
    // The blind's hem (a batten and a scalloped valance right across the frame, the night
    // above it) and its pull: a cord down to a ring at (cordX, ringY).
    const NIGHT = '#231e62';
    function blindHem(g, y, cordX, ringY) {
        if (ringY > y + 30) {
            tube(g, [[cordX, y + 14], [cordX, ringY - 20]], 4.4, K.cream, 2.6);
            for (let k = 0.2; k < 1; k += 0.2) line(g, [[cordX - 2.2, lerp(y + 14, ringY - 20, k) - 3], [cordX + 2.2, lerp(y + 14, ringY - 20, k) + 3]], 1.6, '#c9b27a');
        }
        if (y > -40) {
            g.beginPath();
            for (let x = -20; x < 1020; x += 44) {
                g.moveTo(x, y - 2);
                g.arc(x + 22, y - 2, 22, Math.PI, 0, true);
            }
            g.fillStyle = NIGHT;
            g.fill();
            g.strokeStyle = K.ink;
            g.lineWidth = 3.2;
            g.lineJoin = 'round';
            g.stroke();
            for (let x = -20; x < 1020; x += 44) circ(g, x + 22, y + 9, 3.6, K.gold, 0);
            g.fillStyle = '#3b2fa0';
            g.fillRect(-20, y - 15, 1040, 15);
            line(g, [[-20, y - 15], [1020, y - 15]], 3.2);
            line(g, [[-20, y], [1020, y]], 3.2);
            line(g, [[-20, y - 9.5], [1020, y - 9.5]], 2.4, K.violet);
        }
        // the ring, and the ferrule that ties the cord to it
        tube(g, C.ellipsePts(cordX, ringY, 17, 18, 24), 6.5, K.gold, 2.8, true);
        line(g, C.ellipsePts(cordX - 1.5, ringY - 1.5, 17, 18, 8, 0, Math.PI * 1.05, Math.PI * 1.55), 2.2, '#fff59a');
        C.poly(g, [[cordX - 6, ringY - 28], [cordX + 6, ringY - 28], [cordX + 5, ringY - 17], [cordX - 5, ringY - 17]], { fill: K.cream, ink: K.ink, lw: 2.6 });
    }

    // =========================================================================================
    // Headlights
    // =========================================================================================
    const LAMPS = [1.72, -0.22].map((z) => ob(4.5, -0.79, z)); // the far lamp's lens, the near one's
    const LIGHT = '#fff3a8';
    /**
     * The beams, in the car's units (behind the car): from each lens a wedge of lit air down
     * to the road and the pool it throws on the asphalt, hard-edged, and the dust that
     * crosses them. k: their length (1 = full; they shoot out when the lamps click on).
     */
    function beams(g, L, t, k = 1) {
        if (k <= 0) return;
        const d = C.drawing(t), R = 5.2 * k;
        LAMPS.forEach((c, j) => {
            const gy = j === 0 ? D[1] * 1.72 + 0.02 : 0.05; // the road under that lamp's lane
            const air = [[c[0] + 0.02, c[1] - 0.13], [c[0] + R, c[1] - 0.5 * k], [c[0] + R, gy], [c[0] + 1.25 * Math.min(1, k), gy], [c[0] + 0.02, c[1] + 0.13]];
            const pool = [[c[0] + 1.0 * Math.min(1, k), gy - 0.035], [c[0] + R, gy - 0.2], [c[0] + R + 0.4, gy], [c[0] + R, gy + 0.2], [c[0] + 1.0 * Math.min(1, k), gy + 0.05]];
            // light adds to what it falls on: flat shapes, screened over the night
            g.save();
            g.globalCompositeOperation = 'screen';
            C.poly(g, pool, { fill: '#8f8448', lw: 0 });
            C.poly(g, air, { fill: '#5e5632', lw: 0 });
            g.restore();
            // dust: motes that the car runs into, bright only inside the wedge
            g.save();
            C.trace(g, air);
            g.clip();
            const r = Motion.rng('v3a-dust' + j);
            for (let i = 0; i < 9; i++) {
                const u0 = r(), v = r(), sp = 0.19 + r() * 0.17, big = r() < 0.34;
                const u = (((u0 - d * sp) % 1) + 1) % 1, x = c[0] + 0.3 + u * (R - 0.3), top = lerp(c[1] - 0.13, c[1] - 0.5 * k, u), y = lerp(top + 0.04, gy - 0.03, v);
                if (big) C.sparkle(g, x, y, 0.07, { color: '#fffbe0', pinch: 0.3 });
                else circ(g, x, y, 0.022 + 0.014 * v, '#fffbe0', 0);
            }
            g.restore();
        });
    }
    // The lit lenses, over the car (lit: 0..1.x pops the glare when they click on).
    function lamps(g, L, lit = 1) {
        for (const c of LAMPS) {
            const r = 0.15;
            C.poly(g, Array.from({ length: 24 }, (_, i) => {
                const a = (i / 24) * TAU;
                return [c[0] + Math.cos(a) * r * D[0], c[1] + Math.cos(a) * r * D[1] + Math.sin(a) * r];
            }), { fill: '#fffbe0', ink: K.ink, lw: L * 0.6 });
            if (lit > 1.01) C.sparkle(g, c[0] + 0.02, c[1], 0.5 * (lit - 1) + 0.16, { color: '#fffbe0', ink: K.ink, lw: L * 0.8, pinch: 0.22 });
        }
    }

    // =========================================================================================
    // The cactus's pot, the pedal, the window in the door
    // =========================================================================================
    const POT = { h: 0.4, r1: 0.34, r0: 0.235, rim: 0.1, body: '#d8662c', side: '#a8481a', rim1: '#f08a4a', rimTop: '#f7a56c', soil: '#5b3219', mark: '#8a3a12' };
    // The pot round the cactus's foot, in the cactus's units: (0, 0) is the foot, which is also
    // the pot's bottom. Draw potBack, the cactus, then potFront.
    function potBack(g, L) {
        const { h, r1 } = POT;
        C.poly(g, arcFlat(0, -h, r1, 0, TAU, 32), { fill: POT.rimTop, ink: K.ink, lw: L });
        C.poly(g, arcFlat(0, -h, r1 - 0.065, 0, TAU, 32), { fill: POT.soil, ink: K.ink, lw: L * 0.7 });
    }
    function potFront(g, L) {
        const { h, r1, r0, rim } = POT;
        const body = [...arcFlat(0, -h + rim, r1 * 0.9, Math.PI, TAU), ...arcFlat(0, 0, r0, TAU, Math.PI)];
        C.poly(g, body, { fill: POT.body, ink: K.ink, lw: L });
        g.save();
        C.trace(g, body);
        g.clip();
        g.fillStyle = POT.side;
        g.fillRect(0.14, -h, 0.4, h + 0.1);
        g.restore();
        C.poly(g, body, { ink: K.ink, lw: L });
        // it is as heavy as an anchor, and says so
        const ax = -0.045, ay = -0.165, m = POT.mark, w = L * 1.5;
        circ(g, ax, ay - 0.085, 0.022, null, w, m);
        line(g, [[ax, ay - 0.063], [ax, ay + 0.085]], w, m);
        line(g, [[ax - 0.05, ay - 0.03], [ax + 0.05, ay - 0.03]], w, m);
        line(g, C.curve([[ax - 0.085, ay + 0.015], [ax - 0.06, ay + 0.07], [ax, ay + 0.09], [ax + 0.06, ay + 0.07], [ax + 0.085, ay + 0.015]], false, 5), w, m);
        // the rim, in front of the trunk
        const lip = [...arcFlat(0, -h, r1, Math.PI, TAU), ...arcFlat(0, -h + rim, r1, TAU, Math.PI)];
        C.poly(g, lip, { fill: POT.rim1, ink: K.ink, lw: L });
        line(g, arcFlat(0, -h + 0.035, r1 - 0.012, Math.PI * 1.1, Math.PI * 1.45, 8), L * 0.9, POT.rimTop);
    }

    // The footwell, in the car's units: its floor, the pedal's hinge (at the toe board) and how
    // far its heel end stands up before the pot comes down on it.
    const WELL = { floor: -0.4, hinge: [2.74, -0.425], len: 0.82, up: 0.44, th: 0.05 };
    const WIN = [2.28, -0.71]; // the middle of the window in the door
    // where the pedal's top is under a point x of the car (press 0: up, 1: on the floor)
    const pedalTop = (x, press = 0) => WELL.hinge[1] - WELL.th * 0.5 - Math.max(0, WELL.hinge[0] - x) * Math.tan(WELL.up * (1 - press));
    /**
     * The window in the door: a cutaway shaped like a starburst (k: its pop, 0..1.x) through
     * which the footwell shows. inner() draws whoever stands in it, in the car's units.
     *   press: 0..1 the pedal; hit: 0..1 the stamp's flash
     */
    function footwell(g, L, k, press, hit, inner, d = 0) {
        if (k <= 0.02) return;
        const shape = (grow) => C.burstPts(WIN[0], WIN[1], { r0: (0.76 + grow) * k, r1: (0.98 + grow * 1.3) * k, n: 13, seed: 'v3a-well', jitter: 0.1, sy: 0.56, rot: 0.1 });
        C.poly(g, shape(0.085), { fill: K.yellow, ink: K.ink, lw: L });
        const win = shape(0);
        g.save();
        C.trace(g, win);
        g.clip();
        // the far wall, the floor, the toe board, the bench's base
        g.fillStyle = '#47123a';
        g.fillRect(1.0, -1.6, 2.8, 1.8);
        C.poly(g, [[1.0, WELL.floor], [3.6, WELL.floor], [3.6, 0.1], [1.0, 0.1]], { fill: '#6d1622', ink: K.ink, lw: L });
        C.poly(g, [[1.0, WELL.floor], [3.6, WELL.floor], ob(3.6, WELL.floor, 0.5), ob(1.0, WELL.floor, 0.5)], { fill: '#a32a3c', ink: K.ink, lw: L * 0.8 });
        for (const x of [1.7, 2.1, 2.5]) line(g, [ob(x, WELL.floor, 0.04), ob(x - 0.02, WELL.floor, 0.46)], L * 0.6, '#6d1622');
        C.poly(g, [[2.9, WELL.floor], [3.04, -1.4], [3.7, -1.4], [3.7, WELL.floor]], { fill: '#6d1622', ink: K.ink, lw: L });
        C.poly(g, [[1.0, -1.4], [1.6, -1.4], [1.66, WELL.floor], [1.0, WELL.floor]], { fill: Rides.ROD.seat, ink: K.ink, lw: L });
        line(g, [[1.3, -0.8], [1.6, -0.8]], L * 0.7, Rides.ROD.seatSide);
        // the steering column, down to the toe board
        tube(g, [[2.66, -1.3], [2.98, -0.86]], 0.05, Rides.ROD.chromeSide, L * 0.8);
        // the spring under the pedal's heel end
        const H = WELL.hinge, a = WELL.up * (1 - press), end = [H[0] - Math.cos(a) * WELL.len, H[1] - Math.sin(a) * WELL.len];
        const sx = end[0] + 0.16, sTop = pedalTop(sx, press) + WELL.th, coil = [];
        for (let i = 0; i <= 8; i++) coil.push([sx + (i === 0 || i === 8 ? 0 : i % 2 ? 0.06 : -0.06), lerp(WELL.floor - 0.005, sTop, i / 8)]);
        if (sTop < WELL.floor - 0.02) tube(g, coil, 0.022, STEEL.front, L * 0.6);
        // the pedal: a slab hinged at the toe board, ribbed rubber on top
        const n = [Math.sin(a) * WELL.th * 0.5, -Math.cos(a) * WELL.th * 0.5];
        const slab = cw([[H[0] + n[0], H[1] + n[1]], [end[0] + n[0], end[1] + n[1]], [end[0] - n[0], end[1] - n[1]], [H[0] - n[0], H[1] - n[1]]]);
        C.prism(g, slab, Dd(0.36), STEEL, { lw: L });
        const onTop = (u, z) => ob(lerp(H[0], end[0], u) + n[0], lerp(H[1], end[1], u) + n[1], z);
        C.poly(g, [onTop(0.1, 0.03), onTop(0.97, 0.03), onTop(0.97, 0.33), onTop(0.1, 0.33)], { fill: '#565082', ink: K.ink, lw: L * 0.7 });
        for (let i = 1; i < 8; i++) line(g, [onTop(0.1 + i * 0.109, 0.05), onTop(0.1 + i * 0.109, 0.31)], L * 0.7, '#a59fd0');
        // its rod, through the toe board to the engine
        tube(g, [[H[0] - Math.cos(a) * 0.16, H[1] - Math.sin(a) * 0.16 - 0.03], [2.99, -0.62]], 0.03, STEEL.side, L * 0.6);
        circ(g, H[0] + 0.01, H[1], 0.05, STEEL.top, L * 0.8);
        circ(g, H[0] + 0.01, H[1], 0.017, K.ink, 0);
        inner();
        // the stamp: a flash where the pot meets the slab
        if (hit > 0) {
            const c = [2.0, pedalTop(2.0, press) - 0.02];
            C.burst(g, c[0], c[1], { r0: 0.09 + 0.06 * hit, r1: 0.2 + 0.2 * hit, n: 7, seed: 'v3a-stamp' + (d % 2), fill: K.white, ink: K.ink, lw: L * 0.8, sy: 0.7 });
        }
        g.restore();
        C.poly(g, win, { ink: K.ink, lw: L });
    }

    // =========================================================================================
    // The speedometer
    // =========================================================================================
    const SPEEDO = { base: ob(3.3, -1.112, 0.42), r: 0.36, rise: 0.66, a0: Math.PI * 0.8, span: Math.PI * 1.4 };
    /**
     * It lives under a hatch in the cowl and comes up on a scissor arm when the car has
     * something to say. In the car's units.
     *   o: { up (0..1.x: how far out), needle (0 = the dial's first mark, 1 = its last; more is
     *        past the end), ghosts: [needle, …] where it has just been (the smear of a whip),
     *        bend (radians: the wind lays it back), peg: [x, y] the end stop once it has been knocked off }
     */
    function speedo(g, L, o = {}) {
        const up = o.up ?? 0, B0 = SPEEDO.base, r = SPEEDO.r;
        // the hatch: a slot in the cowl, its lid thrown open behind
        if (up > 0) {
            C.poly(g, [ob(B0[0] - 0.2, B0[1], -0.14), ob(B0[0] + 0.2, B0[1], -0.14), ob(B0[0] + 0.2, B0[1], 0.14), ob(B0[0] - 0.2, B0[1], 0.14)], { fill: Rides.ROD.inside, ink: K.ink, lw: L * 0.8 });
            C.poly(g, [ob(B0[0] - 0.2, B0[1], 0.14), ob(B0[0] + 0.2, B0[1], 0.14), ob(B0[0] + 0.22, B0[1] - 0.2, 0.2), ob(B0[0] - 0.18, B0[1] - 0.2, 0.2)], { fill: Rides.ROD.side, ink: K.ink, lw: L * 0.8 });
        }
        if (up <= 0.02) return;
        const bend = o.bend ?? 0, at = (h, dx = 0) => {
            const p = rot([dx, -h * SPEEDO.rise * up], bend * h);
            return [B0[0] + p[0], B0[1] + p[1]];
        };
        // the scissor arm
        const zig = [];
        for (let i = 0; i <= 6; i++) zig.push(at(i / 6, i === 0 || i === 6 ? 0 : i % 2 ? 0.1 : -0.1));
        tube(g, zig, 0.045, STEEL.front, L * 0.7);
        for (let i = 1; i < 6; i++) circ(g, zig[i][0], zig[i][1], 0.03, STEEL.top, L * 0.5);
        const c = at(1), tilt = bend * 1.15;
        g.save();
        g.translate(c[0], c[1] - r * 0.86);
        g.rotate(tilt);
        const s = Math.min(1.2, 0.5 + 0.5 * up);
        g.scale(s, s);
        // the pod, the dial, its marks and the red end of the scale
        C.drum(g, 0, 0, r, Dd(0.16), { front: STEEL.front, side: STEEL.side }, { lw: L });
        circ(g, 0, 0, r * 0.86, K.cream, L * 0.8);
        const { a0, span } = SPEEDO, pol = (rr, a) => [Math.cos(a) * rr * r, Math.sin(a) * rr * r];
        g.beginPath();
        g.arc(0, 0, r * 0.7, a0 + span * 0.78, a0 + span);
        g.strokeStyle = K.red;
        g.lineWidth = r * 0.13;
        g.lineCap = 'butt';
        g.stroke();
        for (let i = 0; i <= 10; i++) line(g, [pol(i % 5 ? 0.7 : 0.6, a0 + (span * i) / 10), pol(0.79, a0 + (span * i) / 10)], L * (i % 5 ? 0.6 : 1));
        // the end stop: a peg after the last mark, until the needle takes it away
        if (!o.peg) circ(g, ...pol(0.62, a0 + span + 0.2), r * 0.06, K.ink, 0);
        // the needle, and where it has just been
        const needle = (v, fill, ink) => {
            const a = a0 + span * v, tip = pol(0.74, a), l = pol(0.07, a + Math.PI / 2), rr = pol(0.07, a - Math.PI / 2), tail = pol(0.2, a + Math.PI);
            C.poly(g, [tip, l, tail, rr], { fill, ink: ink ? K.ink : null, lw: ink ? L * 0.7 : 0 });
        };
        (o.ghosts ?? []).forEach((v, i, all) => needle(v, i < all.length / 2 ? '#ffc9c2' : '#ff8f84', false));
        needle(o.needle ?? 0, K.red, true);
        circ(g, 0, 0, r * 0.13, K.ink, 0);
        circ(g, 0, 0, r * 0.05, STEEL.top, 0);
        // the glass
        line(g, [pol(0.52, Math.PI * 1.15), pol(0.62, Math.PI * 1.32)], L * 1.1, '#ffffff');
        g.restore();
        if (o.peg) circ(g, o.peg[0], o.peg[1], r * 0.07, K.ink, 0);
    }

    // =========================================================================================
    // Fire and wind
    // =========================================================================================
    // the jet's outline per drawing: (u along it, v across; the root is from v = -0.5 to 0.5), barbs swept back
    const JET = [
        [[0, -0.5], [0.22, -0.58], [0.38, -0.88], [0.42, -0.5], [0.6, -0.68], [0.64, -0.34], [1, 0], [0.68, 0.3], [0.66, 0.64], [0.46, 0.46], [0.4, 0.86], [0.24, 0.56], [0, 0.5]],
        [[0, -0.5], [0.18, -0.62], [0.3, -0.82], [0.36, -0.52], [0.56, -0.76], [0.6, -0.4], [0.8, -0.44], [0.82, -0.16], [1.04, 0.06], [0.74, 0.24], [0.7, 0.52], [0.5, 0.4], [0.42, 0.78], [0.2, 0.58], [0, 0.5]],
        [[0, -0.5], [0.2, -0.56], [0.42, -0.8], [0.44, -0.46], [0.66, -0.6], [0.7, -0.24], [0.96, -0.04], [0.76, 0.2], [0.8, 0.54], [0.58, 0.42], [0.5, 0.74], [0.3, 0.52], [0.24, 0.82], [0.12, 0.54], [0, 0.5]],
    ];
    /**
     * An afterburner jet out of a pipe, in logical units: from (x, y) along `ang`, `len` long
     * and `w` wide at its root; three drawings (d). Nested tongues with barbs swept back, the
     * hot core's shock diamonds, and loose fire past the tip.
     */
    function jet(g, x, y, ang, len, w, d, seed = 0, L = 3.2) {
        const f = (((d + seed) % 3) + 3) % 3, k = [1, 0.86, 1.1][f];
        const at = (u, v, ku = 1, kv = 1) => {
            const p = rot([u * len * k * ku, v * w * kv], ang);
            return [x + p[0], y + p[1]];
        };
        const tongue = (ku, kv) => JET[f].map(([u, v]) => at(u, v, ku, kv));
        // loose fire past the tip: two darts
        for (const [u, v, r] of [[1.1, f === 1 ? -0.34 : 0.3, 0.16], [1.3, f === 2 ? -0.16 : 0.1, 0.11]]) {
            C.poly(g, [at(u, v - r), at(u + r * 1.5, v + r * 0.2), at(u + r * 0.2, v + r)], { fill: K.orange, ink: K.ink, lw: L * 0.85 });
        }
        C.poly(g, tongue(1, 1), { fill: K.red, ink: K.ink, lw: L });
        C.poly(g, tongue(0.76, 0.62), { fill: K.orange, lw: 0 });
        C.poly(g, tongue(0.52, 0.34), { fill: K.yellow, lw: 0 });
        // shock diamonds down the core
        for (let i = 0; i < 3; i++) {
            const u = 0.09 + i * 0.115, hw = 0.046 - i * 0.008, hv = 0.13 - i * 0.03;
            C.poly(g, [at(u - hw, 0), at(u, -hv), at(u + hw, 0), at(u, hv)], { fill: '#fffbe0', lw: 0 });
        }
    }
    // Speed lines: hard-edged streaks that tear to the left, on twos. o: { n, seed, y0, y1, color, k }
    function speedLines(g, t, o = {}) {
        const { n = 12, seed = 'v3a-lines', y0 = 60, y1 = 640, k = 1 } = o, d = C.drawing(t), r = Motion.rng(seed);
        for (let i = 0; i < n; i++) {
            const y = lerp(y0, y1, r()), len = (130 + r() * 260) * k, th = 3 + r() * 5, sp = 520 + r() * 330, x0 = r() * 1700, tone = r();
            const x = 1250 - ((x0 + d * sp) % 1700);
            if (k <= 0) continue;
            C.poly(g, [[x, y - th / 2], [x + len * 0.7, y - th / 2], [x + len, y], [x + len * 0.7, y + th / 2], [x, y + th / 2], [x - th, y]], { fill: o.color ?? (tone < 0.3 ? '#fffbe8' : tone < 0.65 ? K.violet : '#6c5fe0'), lw: 0 });
        }
    }

    // --- hair pinned back ------------------------------------------------------------------------
    // A lock torn off a head's edge by the wind: from the edge a–b (on the hair's outline) to its
    // tip. Inside the head it has no outline: it is the same mass of hair.
    function lock(g, L, a, b, tip, cols, bow = 0.16) {
        const len = Math.hypot(tip[0] - (a[0] + b[0]) / 2, tip[1] - (a[1] + b[1]) / 2);
        const up = C.curve([a, [lerp(a[0], tip[0], 0.5), lerp(a[1], tip[1], 0.5) - bow * len], tip], false, 6);
        const dn = C.curve([tip, [lerp(b[0], tip[0], 0.55), lerp(b[1], tip[1], 0.55) - bow * 0.35 * len], b], false, 6);
        const shape = [...up, ...dn.slice(1)];
        C.poly(g, [[a[0] + 0.07, a[1]], ...shape, [b[0] + 0.07, b[1]]], { fill: cols.hair, lw: 0 });
        line(g, shape, L);
        const m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
        line(g, C.curve([[m[0] - 0.02, m[1]], [lerp(m[0], tip[0], 0.45), lerp(m[1], tip[1], 0.45) - bow * 0.62 * len], [lerp(m[0], tip[0], 0.8), lerp(m[1], tip[1], 0.8) - bow * 0.3 * len]], false, 5), L * 0.7, cols.hairLine);
    }
    // A tuft of curls dragged out of a mass of them: a bumpy lock from `a` (on the head) to its
    // tip, r0 thick where it starts. Inside the head it has no outline.
    function tuft(g, L, a, tip, r0, cols, n = 7) {
        const chain = [];
        for (let i = 0; i < n; i++) {
            const u = i / (n - 1), r = r0 * (1 - 0.74 * u), bow = Math.sin(u * Math.PI) * 0.16 * Math.hypot(tip[0] - a[0], tip[1] - a[1]);
            chain.push([lerp(a[0], tip[0], Math.pow(u, 0.85)), lerp(a[1], tip[1], Math.pow(u, 0.85)) - bow, r]);
        }
        g.strokeStyle = K.ink;
        g.lineWidth = L * 2;
        for (const [x, y, r] of chain) {
            g.beginPath();
            g.arc(x, y, r, 0, TAU);
            g.stroke();
        }
        g.fillStyle = cols.hair;
        for (const [x, y, r] of chain) {
            g.beginPath();
            g.arc(x, y, r, 0, TAU);
            g.fill();
        }
        g.beginPath();
        g.arc(a[0] + r0 * 0.8, a[1] + r0 * 0.1, r0 * 0.95, 0, TAU);
        g.fill();
        g.strokeStyle = cols.hairLine;
        g.lineWidth = L * 0.75;
        g.lineCap = 'round';
        [0, 2, 4].forEach((i, j) => {
            const [x, y, r] = chain[i];
            g.beginPath();
            g.arc(x, y, r * 0.5, 0.8 + j * 1.9, 0.8 + j * 1.9 + 4.1);
            g.stroke();
        });
    }
    const NECK = -0.95, STAN_TOP = -1.55; // band-strings.js and band-rhythm.js: where those heads turn
    // how hard the wind leans each head of hair (the cast's own `sway`)
    const SWAY = { tom: -0.2, mike: -0.2, howie: -0.14, ben: -0.2, stan: -0.24 };
    /**
     * The hair the wind takes off a head, over the figure just drawn at (x, y, s) with `pose`
     * (the same call as the cast's). who: 'tom' | 'mike' | 'howie' | 'ben' | 'stan'; d: the
     * drawing (the tips whip between two places); k: 0..1 how long.
     */
    function windHair(g, who, x, y, s, pose, d, k = 1) {
        if (k <= 0) return;
        const L = 3.2 / s, q = pose.squash ?? 0, f = d % 2 ? 1 : 0, w = (dx, dy) => [dx * k + (f ? 0.03 : -0.02), dy * k + (f ? -0.035 : 0.03)];
        g.save();
        g.translate(x, y);
        g.scale(s, s);
        g.lineJoin = 'round';
        g.lineCap = 'round';
        if (who === 'stan') {
            const seat = BandRhythm.KIT.seat;
            g.translate(seat[0], seat[1]);
            g.scale(1 + q, 1 - q);
            g.translate(0, (pose.headDy ?? 0) + STAN_TOP + 1.85);
            g.rotate(pose.headTilt ?? 0);
            g.translate(0, -STAN_TOP - 1.85);
        } else {
            g.rotate(pose.lean ?? 0);
            g.scale(1 + q, 1 - q);
            if (who === 'mike' || who === 'howie') {
                g.translate(0, NECK + (pose.headDy ?? 0));
                g.rotate(pose.headTilt ?? 0);
                g.translate(0, -NECK);
            } else {
                g.translate(0, pose.headDy ?? 0);
                g.rotate(pose.headTilt ?? 0);
            }
        }
        const tipOf = (bx, by, dx, dy) => {
            const o = w(dx, dy);
            return [bx + o[0], by + o[1]];
        };
        if (who === 'tom') {
            const T = -1.85, x0 = -0.43, c = Cast.TOM;
            lock(g, L, [x0, T + 0.2], [x0, T + 0.34], tipOf(x0, T + 0.26, -0.4, -0.1), c, 0.1);
            lock(g, L, [x0, T + 0.07], [x0, T + 0.23], tipOf(x0, T + 0.14, -0.58, -0.15), c, 0.12);
            lock(g, L, [x0, T - 0.035], [x0, T + 0.11], tipOf(x0, T + 0.03, -0.7, -0.2), c, 0.14);
        } else if (who === 'mike') {
            const T = -1.84, x0 = -0.42, c = BandStrings.MIKE;
            lock(g, L, [x0, T + 0.3], [x0, T + 0.45], tipOf(x0, T + 0.36, -0.34, -0.06), c, 0.1);
            lock(g, L, [x0, T + 0.12], [x0, T + 0.3], tipOf(x0, T + 0.2, -0.5, -0.14), c, 0.12);
            lock(g, L, [x0, T - 0.035], [x0, T + 0.14], tipOf(x0, T + 0.04, -0.62, -0.2), c, 0.14);
        } else if (who === 'howie') {
            const T = -1.8, c = BandStrings.HOWIE;
            tuft(g, L, [-0.47, T + 0.5], tipOf(-0.47, T + 0.5, -0.46, -0.1), 0.13, c);
            tuft(g, L, [-0.44, T + 0.16], tipOf(-0.44, T + 0.16, -0.56, -0.2), 0.14, c);
        } else if (who === 'ben') {
            const T = -1.85, c = BandRhythm.BEN;
            tuft(g, L, [-0.56, T + 0.2], tipOf(-0.56, T + 0.2, -0.4, -0.24), 0.13, c, 6);
            tuft(g, L, [-0.4, T - 0.03], tipOf(-0.4, T - 0.03, -0.44, -0.24), 0.12, c, 6);
        } else {
            const T = STAN_TOP, c = BandRhythm.STAN;
            lock(g, L, [-0.66, T + 0.0], [-0.6, T + 0.13], tipOf(-0.66, T + 0.06, -0.36, -0.04), c);
            lock(g, L, [-0.62, T - 0.1], [-0.66, T + 0.04], tipOf(-0.64, T - 0.04, -0.5, -0.17), c);
        }
        g.restore();
    }

    // --- the pennant ---------------------------------------------------------------------------
    // The whip aerial is the car's own (rides.js). Pinned back, the car is drawn without it
    // above its stub (pennantClip, in logical units) and this one is drawn instead.
    const WHIP0 = [-4.3, -0.99];
    function pennantClip(g, x, y, s, bounce = 0) {
        const p = ([px, py]) => [x + px * s, y + (py + 0.1 * bounce) * s];
        g.beginPath();
        g.rect(-3000, -3000, 7000, 7000);
        [[-4.24, -0.99], [-4.24, -3.8], [-5.95, -3.8], [-5.95, -2.5], [-4.62, -0.99]].map(p).forEach(([px, py], i) => (i ? g.lineTo(px, py) : g.moveTo(px, py)));
        g.closePath();
        g.clip('evenodd');
    }
    function pennant(g, L, d) {
        const f = ((d % 3) + 3) % 3, fl = [0, 0.05, -0.04][f], P = Rides.ROD;
        const whip = C.curve([WHIP0, [-4.37, -1.42], [-4.62, -1.86], [-4.94, -2.14 + fl * 0.3], [-5.24, -2.3 + fl * 0.6]], false, 8);
        line(g, whip, L * 1.15 + 0.02);
        line(g, whip, 0.016, P.chrome);
        // the pennant: its hoist along the whip's end, its fly straight out behind
        const n = whip.length, pa = whip[n - 2], pb = whip[n - 9], m = [(pa[0] + pb[0]) / 2, (pa[1] + pb[1]) / 2];
        const flap = [pa, [m[0] - 0.4, pa[1] + 0.06 - fl * 1.2], [m[0] - 0.84, m[1] + 0.02 + fl * 1.8], [m[0] - 0.42, pb[1] + 0.02 + fl * 0.8], pb];
        C.poly(g, [pa, ...C.curve(flap, false, 5).slice(1, -1), pb], { fill: P.pennant, ink: K.ink, lw: L * 0.8 });
        circ(g, whip[n - 1][0], whip[n - 1][1], 0.045, P.chromeTop, L * 0.7);
    }
    // Stan's cymbals laid back by the wind: runs fn with the ride and the crash tilted (the
    // kit's own geometry, put back afterwards). k: 0..1; d: they flutter on twos.
    function cymbalsBack(k, d, fn) {
        const KIT = BandRhythm.KIT, ride = KIT.ride.tilt, crash = KIT.crash.tilt, f = d % 2 ? 0.07 : -0.05;
        if (k > 0) {
            KIT.ride.tilt = ride + k * (0.62 + f);
            KIT.crash.tilt = crash + k * (0.74 - f);
        }
        try {
            fn();
        } finally {
            KIT.ride.tilt = ride;
            KIT.crash.tilt = crash;
        }
    }

    // =========================================================================================
    // «Make some time»: a roadside clock
    // =========================================================================================
    const IRON = { front: '#7a74ae', top: '#a59fd0', side: '#565082' };
    // The post, with the collar its clock sat in. (x, y): its foot; s: units per figure unit.
    function clockPost(g, x, y, s, bare = false) {
        const L = 3.2 / s;
        g.save();
        g.translate(x, y);
        g.scale(s, s);
        g.lineJoin = 'round';
        C.box(g, -0.16, -0.14, 0.32, 0.14, D, IRON, { lw: L, depth: 0.3 });
        C.box(g, -0.055, -2.5, 0.11, 2.36, D, IRON, { lw: L, depth: 0.1 });
        C.box(g, -0.1, -2.58, 0.2, 0.09, D, IRON, { lw: L, depth: 0.16 });
        if (bare) {
            // what is left: two bent stays
            line(g, [[-0.05, -2.58], [-0.12, -2.78], [-0.2, -2.8]], L * 1.6);
            line(g, [[0.07, -2.58], [0.12, -2.74]], L * 1.6);
        }
        g.restore();
    }
    // The clock itself, round its middle: a face without numerals. hands: [hour, minute] angles.
    function clock(g, x, y, s, ang = 0, hands = [1.1, -0.6]) {
        const L = 3.2 / s, r = 0.5;
        g.save();
        g.translate(x, y);
        g.rotate(ang);
        g.scale(s, s);
        g.lineJoin = 'round';
        // the finial and the foot it stood on
        C.poly(g, [[-0.07, -r - 0.02], [0, -r - 0.24], [0.07, -r - 0.02]], { fill: K.gold, ink: K.ink, lw: L });
        circ(g, 0, -r - 0.25, 0.05, K.yellow, L * 0.8);
        C.poly(g, [[-0.14, r - 0.02], [0.14, r - 0.02], [0.09, r + 0.12], [-0.09, r + 0.12]], { fill: IRON.front, ink: K.ink, lw: L });
        C.drum(g, 0, 0, r, Dd(0.2), { front: K.gold, side: '#e0a800' }, { lw: L });
        circ(g, 0, 0, r * 0.82, '#fffdf4', L * 0.8);
        for (let i = 0; i < 12; i++) {
            const a = (i / 12) * TAU, r0 = i % 3 ? 0.68 : 0.58;
            line(g, [[Math.cos(a) * r * r0, Math.sin(a) * r * r0], [Math.cos(a) * r * 0.76, Math.sin(a) * r * 0.76]], L * (i % 3 ? 0.6 : 1.1));
        }
        const hand = (a, len, w) => C.poly(g, [rot([-w, 0.06], a), rot([0, -len], a), rot([w, 0.06], a)], { fill: K.ink, ink: K.ink, lw: L * 0.5 });
        hand(hands[0], r * 0.42, 0.035);
        hand(hands[1], r * 0.66, 0.026);
        circ(g, 0, 0, 0.045, K.red, L * 0.6);
        line(g, C.ellipsePts(0, 0, r * 0.9, r * 0.9, 6, 0, Math.PI * 1.1, Math.PI * 1.35), L * 0.9, '#fff59a');
        g.restore();
    }

    // =========================================================================================
    // The Devil's work site
    // =========================================================================================
    const CONE = { front: '#ff7a1f', top: '#ffa24d', side: '#c9500f' };
    // A traffic cone. (x, y): the middle of its base's near edge. fall: radians, over its right-hand corner.
    function cone(g, x, y, s, o = {}) {
        const L = 3.2 / s;
        g.save();
        g.translate(x, y - (o.hop ?? 0) * s);
        g.scale(s, s);
        g.lineJoin = 'round';
        g.translate(0.2, 0);
        g.rotate(o.fall ?? 0);
        g.translate(-0.2, 0);
        C.box(g, -0.2, -0.055, 0.4, 0.055, D, CONE, { lw: L, depth: 0.32 });
        const o2 = Dd(0.16), body = [[-0.14, -0.055], [-0.035, -0.6], [0.035, -0.6], [0.14, -0.055]].map(([px, py]) => [px + o2[0], py + o2[1]]);
        C.poly(g, body, { fill: CONE.front, lw: 0 });
        g.save();
        C.trace(g, body);
        g.clip();
        g.fillStyle = CONE.side;
        g.fillRect(o2[0] + 0.035, -0.7, 0.2, 0.7);
        g.fillStyle = '#fffdf4';
        g.fillRect(-0.2, o2[1] - 0.46, 0.5, 0.1);
        g.fillRect(-0.2, o2[1] - 0.27, 0.5, 0.085);
        g.restore();
        C.poly(g, body, { ink: K.ink, lw: L });
        g.restore();
    }
    // A striped barrier on two trestles, a warning lamp on its end. (x, y): the ground under its middle.
    function barrier(g, x, y, s, o = {}) {
        const L = 3.2 / s, hw = 0.9;
        g.save();
        g.translate(x, y);
        g.scale(s, s);
        g.lineJoin = 'round';
        g.rotate(o.rock ?? 0);
        for (const lx of [-0.66, 0.66]) {
            bar(g, [lx + 0.1, -0.11], [lx + 0.03, -0.86], 0.07, WOOD, L, 0.06);
            bar(g, [lx - 0.1, 0.03], [lx - 0.01, -0.86], 0.07, WOOD, L, 0.06);
            bar(g, [lx - 0.055, -0.3], [lx + 0.07, -0.36], 0.05, WOOD, L, 0.04);
        }
        for (const [y0, h] of [[-0.92, 0.23], [-0.56, 0.13]]) {
            C.box(g, -hw, y0, hw * 2, h, D, { front: '#fffdf4', top: '#fffdf4', side: '#c9cde0' }, { lw: L, depth: 0.05 });
            g.save();
            g.beginPath();
            g.rect(-hw, y0, hw * 2, h);
            g.clip();
            g.fillStyle = K.red;
            for (let sx = -hw - 0.3; sx < hw; sx += 0.3) {
                g.beginPath();
                g.moveTo(sx, y0 + h);
                g.lineTo(sx + 0.15, y0 + h);
                g.lineTo(sx + 0.15 + h, y0);
                g.lineTo(sx + h, y0);
                g.closePath();
                g.fill();
            }
            g.restore();
            C.poly(g, [[-hw, y0], [hw, y0], [hw, y0 + h], [-hw, y0 + h]], { ink: K.ink, lw: L });
        }
        // the lamp
        C.box(g, 0.55, -1.01, 0.22, 0.09, D, STEEL, { lw: L * 0.8, depth: 0.08 });
        circ(g, 0.66, -1.1, 0.105, o.lamp ? K.yellow : K.orange, L * 0.9);
        if (o.lamp) {
            circ(g, 0.66, -1.1, 0.045, '#fffbe0', 0);
            for (let i = 0; i < 5; i++) {
                const a = -Math.PI * 0.95 + (i / 4) * Math.PI * 0.9;
                line(g, [[0.66 + Math.cos(a) * 0.15, -1.1 + Math.sin(a) * 0.15], [0.66 + Math.cos(a) * 0.23, -1.1 + Math.sin(a) * 0.23]], L * 0.9, K.yellow);
            }
        }
        g.restore();
    }
    // The back of a road sign: bare metal, two rails, bolts. kind: 'oct' | 'diamond' | 'board'
    function signBack(g, L, x, y, kind, ang = 0) {
        g.save();
        g.translate(x, y);
        g.rotate(ang);
        // its post, down into the barrow
        C.box(g, -0.04, 0, 0.08, 1.0, D, WOOD, { lw: L, depth: 0.05 });
        const r = 0.34, shape = kind === 'oct' ? Array.from({ length: 8 }, (_, i) => [Math.cos((i + 0.5) / 8 * TAU) * r, Math.sin((i + 0.5) / 8 * TAU) * r])
            : kind === 'diamond' ? [[0, -r * 1.12], [r * 1.12, 0], [0, r * 1.12], [-r * 1.12, 0]] : [[-0.42, -0.24], [0.42, -0.24], [0.42, 0.24], [-0.42, 0.24]];
        C.prism(g, cw(shape), Dd(0.04), STEEL, { lw: L });
        for (const ry of [-0.11, 0.11]) {
            const hw = kind === 'board' ? 0.36 : kind === 'oct' ? 0.28 : 0.2;
            C.poly(g, [[-hw, ry - 0.03], [hw, ry - 0.03], [hw, ry + 0.03], [-hw, ry + 0.03]], { fill: STEEL.side, ink: K.ink, lw: L * 0.6 });
            circ(g, 0, ry, 0.022, K.ink, 0);
        }
        g.restore();
    }
    // A wheelbarrow full of road signs, seen from behind them. (x, y): the ground under its wheel's side.
    function wheelbarrow(g, x, y, s, o = {}) {
        const L = 3.2 / s, tray = { front: K.teal, top: K.aqua, side: K.tealDeep };
        g.save();
        g.translate(x, y);
        g.scale(s, s);
        g.lineJoin = 'round';
        // the far handle and leg
        const far = Dd(0.5);
        bar(g, [-0.52 + far[0], -0.5 + far[1]], [-1.12 + far[0], -0.62 + far[1]], 0.06, WOOD, L, 0.05);
        bar(g, [-0.32 + far[0], -0.26 + far[1]], [-0.36 + far[0], 0 + far[1]], 0.06, STEEL, L, 0.05);
        // the signs, standing in the tray
        const jig = o.jig ?? 0;
        signBack(g, L, 0.26, -1.36 - jig * 0.04, 'diamond', 0.16 + jig * 0.05);
        signBack(g, L, -0.2, -1.2 + jig * 0.03, 'oct', -0.1 - jig * 0.04);
        signBack(g, L, 0.02, -0.92, 'board', 0.34 - jig * 0.03);
        // the tray
        C.prism(g, [[-0.66, -0.68], [0.7, -0.68], [0.46, -0.24], [-0.44, -0.24]], Dd(0.56), tray, { lw: L });
        line(g, [[-0.58, -0.6], [0.6, -0.6]], L * 0.8, K.aqua);
        // the frame to the wheel, the wheel, the near leg and handle
        bar(g, [0.3, -0.26], [0.74, -0.17], 0.055, STEEL, L, 0.05);
        C.drum(g, 0.76 + D[0] * 0.2, -0.17 + D[1] * 0.2, 0.17, Dd(0.12), { front: '#2a2438', side: '#1f1a2b' }, { lw: L });
        circ(g, 0.76 + D[0] * 0.2, -0.17 + D[1] * 0.2, 0.07, K.yellow, L * 0.7);
        bar(g, [-0.32, -0.26], [-0.36, 0], 0.06, STEEL, L, 0.05);
        bar(g, [-0.5, -0.5], [-1.12, -0.62], 0.06, WOOD, L, 0.05);
        bar(g, [-0.94, -0.585], [-1.14, -0.625], 0.085, { front: '#2a2438', top: '#3d3652', side: '#1f1a2b' }, L, 0.07);
        g.restore();
    }
    // The foreman's tower: a timber trestle with a ladder. (x, y): the ground under its middle;
    // the platform is TOWER.h up, and whoever stands on it stands at towerTop(x, y, s).
    const TOWER = { h: 2.9, hw: 0.72, dep: 0.8 };
    const towerTop = (x, y, s) => [x + (0.06 + D[0] * 0.36) * s, y + (-TOWER.h - 0.1 + D[1] * 0.36) * s];
    function tower(g, x, y, s) {
        const L = 3.2 / s, { h, hw, dep } = TOWER, back = Dd(dep);
        g.save();
        g.translate(x, y);
        g.scale(s, s);
        g.lineJoin = 'round';
        // the far legs and their brace, then the near ones
        for (const lx of [-hw, hw]) C.box(g, lx - 0.055 + back[0], -h + back[1], 0.11, h, D, { front: WOOD.side, top: WOOD.side, side: '#6b4a28' }, { lw: L, depth: 0.1 });
        bar(g, [-hw + back[0], -0.3 + back[1]], [hw + back[0], -h + 0.3 + back[1]], 0.07, { front: WOOD.side, top: WOOD.side, side: '#6b4a28' }, L, 0.04);
        bar(g, [-hw, -h + 0.3], [hw, -1.55], 0.08, WOOD, L, 0.04);
        bar(g, [hw, -h + 0.3], [-hw, -1.55], 0.08, WOOD, L, 0.04);
        bar(g, [-hw, -1.45], [hw, -1.45], 0.08, WOOD, L, 0.04);
        bar(g, [-hw, -1.35], [hw, -0.2], 0.08, WOOD, L, 0.04);
        for (const lx of [-hw, hw]) C.box(g, lx - 0.055, -h, 0.11, h, D, WOOD, { lw: L, depth: 0.1 });
        // the platform: planks
        C.box(g, -hw - 0.2, -h - 0.1, hw * 2 + 0.4, 0.1, D, WOOD, { lw: L, depth: dep + 0.1 });
        for (let i = 1; i < 4; i++) line(g, [ob(-hw - 0.2, -h - 0.1, (i / 4) * (dep + 0.1)), ob(hw + 0.2, -h - 0.1, (i / 4) * (dep + 0.1))], L * 0.6, WOOD.side);
        // the ladder, leaning on its near edge
        const a = [-0.5, 0.06], b = [-0.2, -h - 0.34];
        for (const dx of [-0.17, 0.17]) bar(g, [a[0] + dx, a[1]], [b[0] + dx, b[1]], 0.055, { front: '#e0b070', top: '#f4d09a', side: '#a87840' }, L, 0.04);
        for (let i = 1; i < 12; i++) {
            const u = i / 12.6, p = [lerp(a[0], b[0], u), lerp(a[1], b[1], u)];
            bar(g, [p[0] - 0.17, p[1]], [p[0] + 0.17, p[1]], 0.04, { front: '#e0b070', top: '#f4d09a', side: '#a87840' }, L, 0.03);
        }
        g.restore();
    }
    // The lever: a steel bar as long as a telegraph pole, its chisel end under the asphalt's edge,
    // a block for a fulcrum and a crossbar to stand on. (x, y): where it goes under the road.
    // lean: radians from upright. leverEnd: the middle of the crossbar's top, in logical units.
    const LEVER = { len: 3.3 };
    const leverEnd = (x, y, s, lean = 0) => {
        const p = rot([0, -LEVER.len - 0.02], lean);
        return [x + (0.1 + p[0]) * s, y + (-0.16 + p[1]) * s];
    };
    function lever(g, x, y, s, lean = 0) {
        const L = 3.2 / s, piv = [0.1, -0.16];
        g.save();
        g.translate(x, y);
        g.scale(s, s);
        g.lineJoin = 'round';
        // the fulcrum: a block of timber
        C.box(g, -0.02, -0.2, 0.4, 0.2, D, WOOD, { lw: L, depth: 0.36 });
        line(g, [[0.04, -0.13], [0.3, -0.13]], L * 0.6, WOOD.side);
        g.translate(piv[0], piv[1]);
        g.rotate(lean);
        const w = 0.12, len = LEVER.len;
        // the bar: a chisel end below the fulcrum, a grip of red tape near the top, the crossbar
        C.prism(g, cw([[-w / 2, -len], [w / 2, -len], [w / 2, 0.2], [0.02, 0.42], [-w / 2, 0.24]]), Dd(0.09), STEEL, { lw: L });
        line(g, [[-w / 2 + 0.03, -len + 0.5], [-w / 2 + 0.03, 0.1]], L * 0.7, STEEL.top);
        C.box(g, -w / 2 - 0.012, -len + 0.14, w + 0.024, 0.56, D, { front: K.red, top: '#ff6f59', side: '#ad211f' }, { lw: L, depth: 0.1 });
        for (let i = 1; i < 4; i++) line(g, [[-w / 2 - 0.012, -len + 0.14 + i * 0.14], [w / 2 + 0.012, -len + 0.14 + i * 0.14]], L * 0.6, '#ad211f');
        C.box(g, -0.46, -len - 0.02, 0.92, 0.1, D, IRON, { lw: L, depth: 0.1 });
        g.restore();
    }
    // The asphalt's edge where the lever has started on it: a lip of road prised up. (x, y): on the road's far edge.
    function prisedLip(g, x, y, road, edge) {
        const lip = [[x - 76, y + 2], [x - 34, y - 9], [x + 6, y - 13], [x + 40, y - 6], [x + 70, y + 2], [x + 52, y + 14], [x - 60, y + 14]];
        C.poly(g, lip, { fill: road, ink: K.ink, lw: 3.2 });
        line(g, [[x - 50, y + 6], [x - 26, y - 1], [x + 4, y - 4], [x + 34, y + 1], [x + 52, y + 7]], 3, edge);
        line(g, [[x - 20, y + 14], [x - 30, y + 26], [x - 22, y + 36]], 2.6);
        line(g, [[x + 28, y + 14], [x + 40, y + 24]], 2.6);
    }
    // The blueprint of the last trap: a road that turns down into a mouth. Round its middle;
    // 1.06 × 0.7 figure units. flip: -1..1 squeezes it as it turns over in the air.
    const PLAN = { w: 1.06, h: 0.7, paper: '#2a50dc', grid: '#5a7cf2', chalk: '#fffdf4', back: '#dfe6ff' };
    function blueprint(g, x, y, s, ang = 0, flip = 1) {
        const L = 3.2 / s, { w, h } = PLAN, f = Math.abs(flip) < 0.14 ? 0.14 * (flip < 0 ? -1 : 1) : flip;
        g.save();
        g.translate(x, y);
        g.rotate(ang);
        g.scale(s * f, s);
        g.lineJoin = 'round';
        const sheet = [[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2]];
        if (f < 0) {
            C.poly(g, sheet, { fill: PLAN.back, ink: K.ink, lw: L });
            g.restore();
            return;
        }
        C.poly(g, sheet, { fill: PLAN.paper, ink: K.ink, lw: L });
        g.strokeStyle = PLAN.grid;
        g.lineWidth = L * 0.45;
        g.beginPath();
        for (let i = 1; i < 8; i++) {
            g.moveTo(-w / 2 + (w * i) / 8, -h / 2);
            g.lineTo(-w / 2 + (w * i) / 8, h / 2);
        }
        for (let i = 1; i < 5; i++) {
            g.moveTo(-w / 2, -h / 2 + (h * i) / 5);
            g.lineTo(w / 2, -h / 2 + (h * i) / 5);
        }
        g.stroke();
        // the road: straight, then bent down; an arrow along it; the mouth it ends in
        const ch = (pts, lw = 1) => line(g, pts, L * lw, PLAN.chalk);
        ch(C.curve([[-0.44, -0.2], [-0.1, -0.2], [0.12, -0.14], [0.22, 0.06]], false, 6), 1.2);
        ch(C.curve([[-0.44, -0.08], [-0.14, -0.08], [0.02, -0.03], [0.09, 0.1]], false, 6), 1.2);
        ch([[-0.36, -0.14], [-0.28, -0.14]], 0.8);
        ch([[-0.2, -0.14], [-0.12, -0.14]], 0.8);
        ch([[0.04, 0.12], [0.3, 0.02], [0.4, 0.16], [0.3, 0.26], [0.04, 0.2]], 1.1);
        for (const tx of [0.12, 0.2, 0.28]) ch([[tx - 0.03, 0.105 - (tx - 0.04) * 0.3], [tx, 0.16], [tx + 0.03, 0.08 - (tx - 0.04) * 0.3]], 0.8);
        ch([[-0.4, 0.14], [-0.16, 0.14]], 1);
        ch([[-0.24, 0.08], [-0.16, 0.14], [-0.24, 0.2]], 1);
        g.restore();
    }
    // A mitt of his resting on something he holds, in his units.
    function devilMitt(g, L, at) {
        const P = Devil.P;
        C.box(g, at[0] - 0.105, at[1] - 0.1, 0.21, 0.2, D, { front: P.skin, top: P.skinTop, side: P.skinSide }, { lw: L, depth: 0.16 });
    }
    /**
     * What the cold has done to him, over Devil.draw(g, x, y, s, pose) with the same arguments:
     * a striped scarf round his neck (its long end flies; blow: -1..1 which way and how far)
     * and a sore, shining nose (nose: its size, 1 = at rest).
     */
    const SCARF = { a: K.teal, b: '#fffdf4', dark: K.tealDeep };
    function devilCold(g, x, y, s, pose, t, o = {}) {
        const L = 3.2 / s, q = pose.squash ?? 0, d = C.drawing(t), blow = o.blow ?? 0.5, fl = [0, 0.04, -0.03][((d % 3) + 3) % 3];
        g.save();
        g.translate(x, y);
        g.scale(s, s);
        g.rotate(pose.lean ?? 0);
        g.scale(1 + q, 1 - q);
        g.lineJoin = 'round';
        g.lineCap = 'round';
        const stripes = (shape, n, dir) => {
            C.poly(g, shape, { fill: SCARF.a, lw: 0 });
            g.save();
            C.trace(g, shape);
            g.clip();
            g.fillStyle = SCARF.b;
            for (let i = 0; i < n; i += 2) {
                const p = dir(i / n), p2 = dir((i + 1) / n);
                C.poly(g, [[p[0], p[1] - 0.2], [p2[0], p2[1] - 0.2], [p2[0], p2[1] + 0.2], [p[0], p[1] + 0.2]], { fill: SCARF.b, lw: 0 });
            }
            g.restore();
            C.poly(g, shape, { ink: K.ink, lw: L });
        };
        // the long end, flying from the knot
        const kx = 0.3, ky = -0.9, sgn = blow < 0 ? -1 : 1, bl = Math.abs(blow);
        const mid = C.curve([[kx, ky], [kx + sgn * 0.2 * bl + 0.04, ky + 0.14 - 0.1 * bl + fl], [kx + sgn * 0.46 * bl + 0.05, ky + 0.3 - 0.34 * bl - fl], [kx + sgn * 0.72 * bl + 0.06, ky + 0.5 - 0.5 * bl + fl * 1.5]], false, 5);
        const nrm = mid.map((p, i) => {
            const a = mid[Math.max(0, i - 1)], b = mid[Math.min(mid.length - 1, i + 1)], l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
            return [-(b[1] - a[1]) / l * 0.075, (b[0] - a[0]) / l * 0.075];
        });
        const tail = [...mid.map((p, i) => [p[0] + nrm[i][0], p[1] + nrm[i][1]]), ...mid.map((p, i) => [p[0] - nrm[i][0], p[1] - nrm[i][1]]).reverse()];
        C.poly(g, tail, { fill: SCARF.a, lw: 0 });
        g.save();
        C.trace(g, tail);
        g.clip();
        for (let i = 2; i < mid.length - 1; i += 3) C.poly(g, [[mid[i][0] + nrm[i][0] * 1.3, mid[i][1] + nrm[i][1] * 1.3], [mid[i + 1][0] + nrm[i + 1][0] * 1.3, mid[i + 1][1] + nrm[i + 1][1] * 1.3], [mid[i + 1][0] - nrm[i + 1][0] * 1.3, mid[i + 1][1] - nrm[i + 1][1] * 1.3], [mid[i][0] - nrm[i][0] * 1.3, mid[i][1] - nrm[i][1] * 1.3]], { fill: SCARF.b, lw: 0 });
        g.restore();
        C.poly(g, tail, { ink: K.ink, lw: L });
        const e = mid[mid.length - 1], en = nrm[nrm.length - 1], eu = [en[1] / 0.075, -en[0] / 0.075];
        for (const k of [-0.8, 0, 0.8]) line(g, [[e[0] + en[0] * k, e[1] + en[1] * k], [e[0] + en[0] * k - eu[0] * 0.07, e[1] + en[1] * k - eu[1] * 0.07]], L * 0.8);
        // the wrap, under the chin, and the knot
        const wrap = [[-0.45, -1.0], [0.45, -1.0], [0.47, -0.84], [0, -0.8], [-0.47, -0.84]];
        C.poly(g, [[0.45, -1.0], ob(0.45, -1.0, 0.44), ob(0.47, -0.84, 0.44), [0.47, -0.84]], { fill: SCARF.dark, ink: K.ink, lw: L });
        stripes(wrap, 9, (u) => [lerp(-0.47, 0.47, u), -0.9]);
        g.beginPath();
        g.roundRect(kx - 0.1, ky - 0.11, 0.2, 0.2, 0.05);
        g.fillStyle = SCARF.dark;
        g.fill();
        g.strokeStyle = K.ink;
        g.lineWidth = L;
        g.stroke();
        // the nose, in his head's frame
        g.translate(0, pose.headDy ?? 0);
        g.rotate(pose.headTilt ?? 0);
        const nk = o.nose ?? 1, nx = 0.05, ny = -1.225;
        circ(g, nx, ny, 0.085 * nk, K.rose, L);
        circ(g, nx - 0.028 * nk, ny - 0.03 * nk, 0.024 * nk, '#ffffff', 0);
        if (d % 4 < 2) for (const a of [-2.5, -0.64]) line(g, [[nx + Math.cos(a) * 0.125 * nk, ny + Math.sin(a) * 0.125 * nk], [nx + Math.cos(a) * 0.175 * nk, ny + Math.sin(a) * 0.175 * nk]], L * 0.8, K.rose);
        g.restore();
    }
    // The sneeze itself, in logical units: a burst out of his face and what flies in it. age: seconds since it.
    function sneeze(g, x, y, s, age, dir = -1) {
        const dr = Math.floor(age * 12 + 1e-6);
        if (dr < 0 || dr > 2) return;
        const k = [0.9, 1.3, 1.5][dr], cx = x + dir * (0.62 + 0.3 * dr) * s, cy = y + 0.12 * s;
        if (dr < 2) C.burst(g, cx, cy, { r0: 0.26 * s * k, r1: 0.56 * s * k, n: 9, seed: 'v3a-choo' + dr, fill: dr ? '#dff7ff' : '#fffdf4', ink: K.ink, lw: 3, sx: 1.25, sy: 0.8, rot: 0.2 * dr });
        const r = Motion.rng('v3a-spit');
        for (let i = 0; i < 7; i++) {
            const a = (r() - 0.5) * 1.3, v = 0.6 + r() * 0.9, u = (dr + 1) / 3;
            const px = x + dir * (0.5 + v * u * 1.5) * s, py = y + (0.1 + Math.sin(a) * v * u * 0.8 + 0.3 * u * u) * s;
            C.poly(g, C.ellipsePts(px, py, 0.06 * s * (1 - 0.2 * dr), 0.032 * s, 10, a * 0.5), { fill: '#bfefff', ink: K.ink, lw: 2.2 });
        }
    }

    return {
        stubArm, sunArm, blindHem, NIGHT, LAMPS, beams, lamps, POT, potBack, potFront, WELL, WIN, pedalTop, footwell, SPEEDO, speedo,
        jet, speedLines, SWAY, windHair, pennantClip, pennant, cymbalsBack, clockPost, clock,
        cone, barrier, wheelbarrow, TOWER, towerTop, tower, LEVER, leverEnd, lever, prisedLip, PLAN, blueprint, devilMitt, devilCold, sneeze,
    };
})();
