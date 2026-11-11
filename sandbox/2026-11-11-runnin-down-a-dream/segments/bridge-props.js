// Props of the bridge (segments/bridge.js), where the Devil swaps the contract for a guitar:
// his arms redrawn in his own frame (over the box's rail, a rolled sleeve, a mitt on a tuning
// peg), his tongue, flames of any colour, the contract's four pieces as loose scraps of paper,
// the sour note and the clean one, Stan's count on his sticks, and a follow spot.
// Units as in cast.js: 1 ≈ a head's width; a drawer's (x, y) is its ground point or its middle.
// Global: BridgeProps. Depends on Cereal, Cast, Devil, BandRhythm.
const BridgeProps = (() => {
    const C = Cereal, K = C.COL, DP = Devil.P, Dd = Cast.Dd, PI = Math.PI, TAU = PI * 2;
    const lerp = (a, b, u) => a + (b - a) * u;
    const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
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

    // =========================================================================================
    // The Devil's own frame: what Devil.draw does with (x, y, s) and a pose's lean and squash
    // =========================================================================================
    const SH = { R: [-0.34, -0.84], L: [0.34, -0.84] }; // his shoulders (R is on screen left)
    const NO_HAND = [NaN, NaN]; // a mitt Devil.draw is asked not to draw (the canvas ignores a path that is not a number)
    // fn(L) draws in his units; L is the outline's width
    function frame(g, x, y, s, pose, fn) {
        const q = pose.squash ?? 0;
        g.save();
        g.translate(x, y);
        g.scale(s, s);
        g.rotate(pose.lean ?? 0);
        g.scale(1 + q, 1 - q);
        g.lineJoin = 'round';
        fn(3.2 / s);
        g.restore();
    }
    // a point of the frame in his units, and back
    const toLocal = (x, y, s, pose, p) => {
        const q = pose.squash ?? 0, r = rot([(p[0] - x) / s, (p[1] - y) / s], -(pose.lean ?? 0));
        return [r[0] / (1 + q), r[1] / (1 - q)];
    };
    const toFrame = (x, y, s, pose, p) => {
        const q = pose.squash ?? 0, r = rot([p[0] * (1 + q), p[1] * (1 - q)], pose.lean ?? 0);
        return [x + r[0] * s, y + r[1] * s];
    };
    // inside frame(): his head's own move (Devil.draw turns it about his ground point)
    function head(g, pose, fn) {
        g.save();
        g.translate(0, pose.headDy ?? 0);
        g.rotate(pose.headTilt ?? 0);
        fn();
        g.restore();
    }

    // His arm, as devil.js draws it: a sleeve, a white cuff with a gold link, a red block mitt.
    // roll 0..1 pushes the cuff up to the shoulder: a short sleeve, a thick roll and a bare arm.
    function arm(g, L, sh, hand, roll = 0) {
        const w = 0.16, dx = hand[0] - sh[0], dy = hand[1] - sh[1], len = Math.hypot(dx, dy) || 1e-6;
        const ux = dx / len, uy = dy / len, nx = -uy * w * 0.5, ny = ux * w * 0.5, r = clamp(roll);
        const quad = (a, b, k = 1) => cw([[sh[0] + ux * a + nx * k, sh[1] + uy * a + ny * k], [sh[0] + ux * b + nx * k, sh[1] + uy * b + ny * k], [sh[0] + ux * b - nx * k, sh[1] + uy * b - ny * k], [sh[0] + ux * a - nx * k, sh[1] + uy * a - ny * k]]);
        const c0n = Math.max(0.03, len - 0.14), c1n = Math.max(0.06, len - 0.075), up = Math.min(0.15, len * 0.3);
        const c0 = lerp(c0n, up, r), c1 = c0 + lerp(c1n - c0n, 0.1, r), fat = lerp(1.12, 1.34, r);
        C.prism(g, quad(-0.05, c0), Dd(0.16), { front: DP.suit, top: DP.suitTop, side: DP.suitSide }, { lw: L, ink: DP.ink });
        C.prism(g, quad(c1 - 0.01, len + 0.11), Dd(0.16), { front: DP.skin, top: DP.skinTop, side: DP.skinSide }, { lw: L, ink: DP.ink });
        C.prism(g, quad(c0, c1, fat), Dd(0.17), { front: DP.shirt, top: DP.shirt, side: '#d9d4e6' }, { lw: L, ink: DP.ink });
        const at = (a, k) => [sh[0] + ux * a + nx * k, sh[1] + uy * a + ny * k];
        if (r > 0.3) {
            // the roll: two folds across it, the link gone inside
            line(g, [at(lerp(c0, c1, 0.5), fat), at(lerp(c0, c1, 0.5), -fat)], L * 0.7, '#b9b4dc');
            line(g, [at(c0 + 0.012, fat * 0.7), at(c0 + 0.012, -fat * 0.2)], L * 0.6, DP.suit);
        } else {
            g.beginPath();
            g.arc(sh[0] + (ux * (c0 + c1)) / 2, sh[1] + (uy * (c0 + c1)) / 2, 0.016, 0, TAU);
            g.fillStyle = DP.button;
            g.fill();
        }
    }
    // His tongue, out at the corner of the grin (inside head()): the face of somebody concentrating.
    function tongue(g, L, sx = 1) {
        const my = Devil.HEAD.top + 0.7, x0 = sx * 0.17;
        const t = C.curve([[x0 - sx * 0.055, my + 0.045], [x0 + sx * 0.03, my + 0.02], [x0 + sx * 0.09, my + 0.075], [x0 + sx * 0.085, my + 0.15], [x0 + sx * 0.03, my + 0.185], [x0 - sx * 0.035, my + 0.14]], true, 5);
        C.poly(g, t, { fill: DP.tongue, ink: DP.ink, lw: L * 0.9 });
        line(g, [[x0 + sx * 0.012, my + 0.07], [x0 + sx * 0.035, my + 0.14]], L * 0.7, '#d9486c');
    }

    // The cold leaves him: a puff of steam off the nose, three lobes that rise `rise` and thin out. u 0..1, (x, y) the nose.
    function steam(g, x, y, r, u, rise = r * 6) {
        if (u <= 0 || u >= 1) return;
        const k = Math.sin(Math.min(1, u * 2.2) * PI * 0.5) * (u > 0.6 ? (1 - u) / 0.4 : 1), up = rise * (1 - (1 - u) * (1 - u));
        for (const [dx, dy, rr] of [[-0.7, 0, 0.8], [0.6, -0.9, 1], [-0.2, -1.9, 0.7]]) {
            C.poly(g, C.ellipsePts(x + dx * r * (0.7 + u), y - up + dy * r, rr * r * k, rr * r * k * 0.86, 14), { fill: K.white, ink: K.ink, lw: 2.6 });
        }
    }

    // =========================================================================================
    // Fire of any colour (Fx.flame's three tongues and its drawings; its line keeps its width: call it in frame units)
    // =========================================================================================
    const SHAPES = [
        [[-0.3, 0], [-0.38, -0.3], [-0.2, -0.52], [-0.24, -0.82], [0, -0.58], [0.06, -1.05], [0.28, -0.62], [0.2, -0.38], [0.4, -0.5], [0.3, 0]],
        [[-0.3, 0], [-0.42, -0.36], [-0.22, -0.42], [-0.1, -0.95], [0.08, -0.6], [0.22, -0.86], [0.26, -0.5], [0.42, -0.3], [0.3, 0]],
        [[-0.3, 0], [-0.34, -0.26], [-0.3, -0.66], [-0.1, -0.5], [0.02, -1.0], [0.16, -0.56], [0.34, -0.72], [0.36, -0.28], [0.3, 0]],
    ];
    const FIRE = {
        hot: [K.red, K.orange, K.yellow],
        green: ['#149a4e', '#5fe07a', '#e9ff8a'],
        blue: [K.blue, K.sky, '#e6fbff'],
        purple: ['#6a2fd0', K.violet, '#ffd9f2'],
        pink: [K.magenta, K.rose, K.white],
    };
    function flame(g, x, y, s, d, seed = 0, cols = FIRE.hot) {
        const f = (((d + seed) % 3) + 3) % 3, sh = SHAPES[f];
        const at = (k, dy) => C.curve(sh.map(([px, py]) => [x + px * s * k, y + py * s * k + dy]), true, 5);
        C.poly(g, at(1, 0), { fill: cols[0], ink: K.ink, lw: 3 });
        C.poly(g, at(0.68, -s * 0.02), { fill: cols[1], lw: 0 });
        C.poly(g, at(0.38, -s * 0.03), { fill: cols[2], lw: 0 });
    }
    // A brazier's fire stirred up, as Inferno.guitarFromFire lays its own: (x, y) its foot, s figure units,
    // big its size (guitarFromFire's is 0.75 before anything comes out), part 'back' | 'front'.
    function fire(g, x, y, s, d, cols, big = 0.75, part = 'back', main = 0) {
        if (part === 'back') {
            flame(g, x - 0.4 * s, y, 1.05 * s * big, d, 1, cols);
            flame(g, x + 0.42 * s, y, 0.95 * s * big, d, 2, cols);
            flame(g, x, y, Math.max(main, 1.5 * s * big), d, 2, cols);
        } else {
            flame(g, x - 0.2 * s, y, 0.8 * s * big, d + 1, 2, cols);
            flame(g, x + 0.24 * s, y, 0.7 * s * big, d + 1, 0, cols);
        }
    }

    // =========================================================================================
    // The contract's four pieces, loose (the same four Inferno.tornContract tears with seed 0)
    // =========================================================================================
    const zig = (seed, n, amp) => {
        const r = Motion.rng(seed);
        return Array.from({ length: n + 1 }, (_, i) => (i % 2 ? 1 : -1) * amp * (0.5 + r() * 0.6));
    };
    let QUARTERS = null;
    function quarters() {
        if (QUARTERS) return QUARTERS;
        const X = 0.45, Y = 0.55, sx = 0.232, sy = 0.35, n = 10, mid = n / 2, zv = zig('tornV0', n, 0.02), zl = zig('tornL0', 4, 0.02), zr = zig('tornR0', 4, 0.02);
        const V = zv.map((dx, i) => [dx + 0.01, -sy + (2 * sy * i) / n]);
        const cl = -0.03, cr = 0.045;
        const HL = zl.map((dy, i) => [-sx + ((V[mid][0] + sx) * i) / 4, i === 4 ? V[mid][1] : cl + dy]);
        const HR = zr.map((dy, i) => [V[mid][0] + ((sx - V[mid][0]) * i) / 4, i === 0 ? V[mid][1] : cr + dy]);
        const vt = [[V[0][0], -Y], ...V.slice(0, mid + 1)], vb = [...V.slice(mid), [V[n][0], Y]];
        const hl = [[-X, HL[0][1]], ...HL], hr = [...HR, [X, HR[4][1]]];
        QUARTERS = [
            { poly: [[-X, -Y], ...vt, ...hl.slice(0, -1).reverse()], torn: [V.slice(0, mid + 1), HL], c: [-0.14, -0.19], half: 0, up: -1 },
            { poly: [...hl, ...vb.slice(1), [-X, Y]], torn: [V.slice(mid), HL], c: [-0.14, 0.17], half: 0, up: 1 },
            { poly: [[X, -Y], ...hr.slice().reverse(), ...vt.slice(0, -1).reverse()], torn: [V.slice(0, mid + 1), HR], c: [0.15, -0.15], half: 1, up: -1 },
            { poly: [...hr, [X, Y], ...vb.slice(1).reverse()], torn: [V.slice(mid), HR], c: [0.15, 0.2], half: 1, up: 1 },
        ];
        return QUARTERS;
    }
    // Where piece i is when Inferno.tornContract holds at k = 0.42: its middle from the contract's middle, and its turn.
    function held(i) {
        const p = quarters()[i], sx = p.half ? 1 : -1;
        return { at: [p.c[0] + sx * 0.2, p.c[1] - 0.03 + p.up * 0.09], ang: sx * 0.2 + p.up * sx * 0.16 };
    }
    // One piece: (x, y) its middle, s figure units, ang its turn, wide 0..1 how much of its face we see (it flutters).
    function scrap(g, x, y, s, i, ang = 0, wide = 1) {
        const p = quarters()[i], L = 3.2 / s;
        g.save();
        g.translate(x, y);
        g.rotate(ang);
        g.scale(s * wide, s);
        g.translate(-p.c[0], -p.c[1]);
        g.lineJoin = 'round';
        g.save();
        C.trace(g, p.poly);
        g.clip();
        Devil.contract(g, 0, 0, L, { open: 1 });
        g.restore();
        for (const e of p.torn) line(g, e, L);
        g.restore();
    }
    // A piece of paper that met a lighter: a puff of flame, then two curls of ash. u 0..1.
    function burnt(g, x, y, s, u, d) {
        if (u < 0.55) flame(g, x, y + 0.14 * s, s * (0.34 + 0.5 * Math.sin((u / 0.55) * PI)), d, 1);
        else {
            const v = (u - 0.55) / 0.45;
            for (const sx of [-1, 1]) {
                const px = x + sx * (0.06 + 0.1 * v) * s, py = y - (0.1 + 0.36 * v) * s;
                line(g, C.curve([[px, py + 0.12 * s], [px + sx * 0.05 * s, py + 0.06 * s], [px - sx * 0.03 * s, py], [px + sx * 0.03 * s, py - 0.06 * s * (1 - v)]], false, 5), 3 * (1 - v * 0.6), '#3d3652');
            }
        }
    }

    // =========================================================================================
    // The two notes
    // =========================================================================================
    // The sour one: an eighth note gone wrong: a dented head, a stem kinked like a bolt, a ragged
    // flag, in a sick green; it shivers on twos and drags two stink lines. (x, y) its head's middle.
    const SOUR = [[-0.5, 0.0], [-0.36, -0.3], [-0.08, -0.24], [0.14, -0.4], [0.3, -0.26], [0.5, -0.86], [0.18, -1.02], [0.44, -1.84], [0.62, -1.86],
        [1.12, -1.52], [0.95, -1.34], [1.18, -1.04], [0.86, -1.2], [0.66, -1.5], [0.4, -1.08], [0.7, -0.9], [0.52, -0.2], [0.56, 0.08], [0.36, 0.14], [0.4, 0.36], [0.1, 0.26], [-0.12, 0.42], [-0.34, 0.2]];
    function sourNote(g, x, y, s, ang = 0, d = 0) {
        const j = d % 2 ? 0.07 : -0.07;
        g.save();
        g.translate(x, y);
        g.rotate(ang + j);
        g.lineJoin = 'round';
        const pts = cw(SOUR.map(([px, py]) => [px * s, py * s]));
        C.prism(g, pts, [0.13 * s, -0.09 * s], { front: '#b9e23a', top: '#edff9a', side: '#6f9a1f' }, { lw: 3.2 });
        // a bite out of the head's shine, and a crack down the stem
        line(g, [[-0.3 * s, -0.08 * s], [-0.12 * s, -0.14 * s]], 2.6, '#edff9a');
        line(g, [[0.47 * s, -0.5 * s], [0.56 * s, -0.66 * s], [0.44 * s, -0.78 * s]], 2.2, '#6f9a1f');
        // stink lines under it
        for (const [ox, k] of [[-0.42, 1], [0.12, -1]]) {
            const p = [];
            for (let i = 0; i <= 4; i++) p.push([(ox + (i % 2 ? 0.1 : -0.02) * k) * s, (0.62 + i * 0.13) * s]);
            line(g, p, 5.4);
            line(g, p, 2.4, '#b9e23a');
        }
        g.restore();
    }
    // The clean one: a beamed pair, a solid in yellow with its side in gold, a white shine.
    function cleanNote(g, x, y, s, ang = 0) {
        C.note(g, x + 0.2 * s, y - 0.14 * s, s, { color: K.gold, kind: 2, rot: ang, lw: 3.2 });
        C.note(g, x + 0.1 * s, y - 0.07 * s, s, { color: K.gold, kind: 2, rot: ang, ink: null });
        C.note(g, x, y, s, { color: K.yellow, kind: 2, rot: ang, lw: 3.2 });
        g.save();
        g.translate(x, y);
        g.rotate(ang);
        line(g, [[-0.22 * s, -0.1 * s], [-0.02 * s, -0.2 * s]], 3, K.white);
        line(g, [[1.02 * s, -0.4 * s], [1.2 * s, -0.48 * s]], 3, K.white);
        line(g, [[0.5 * s, -1.56 * s], [1.36 * s, -1.8 * s]], 2.6, K.white);
        g.restore();
    }
    // A hit's mark: short strokes round a point (a click of two sticks, a hoof on a deck).
    function ticks(g, x, y, r0, r1, n = 5, a0 = -PI, a1 = 0, color = K.white, lw = 3) {
        for (let i = 0; i < n; i++) {
            const a = a0 + ((a1 - a0) * (i + 0.5)) / n, p = [[x + Math.cos(a) * r0, y + Math.sin(a) * r0], [x + Math.cos(a) * r1, y + Math.sin(a) * r1]];
            line(g, p, lw + 2.6);
            line(g, p, lw, color);
        }
    }
    // A peg being turned: two curved arrows round (x, y); a ±1 which way.
    function twist(g, x, y, r, a = 1) {
        for (const a0 of [0.3, 0.3 + PI]) {
            const arc = Array.from({ length: 7 }, (_, i) => {
                const th = a0 + a * (i / 6) * 1.5;
                return [x + Math.cos(th) * r, y + Math.sin(th) * r * 0.9];
            });
            const e = arc[6], f = arc[5], dir = Math.atan2(e[1] - f[1], e[0] - f[0]);
            for (const [c, lw] of [[K.ink, 6], [K.white, 2.8]]) {
                line(g, arc, lw, c);
                line(g, [[e[0] + Math.cos(dir + 2.5) * r * 0.42, e[1] + Math.sin(dir + 2.5) * r * 0.42], e, [e[0] + Math.cos(dir - 2.5) * r * 0.42, e[1] + Math.sin(dir - 2.5) * r * 0.42]], lw, c);
            }
        }
    }

    // =========================================================================================
    // Stan counts the solo in: both arms up, the sticks clicked over his head
    // =========================================================================================
    // BandRhythm.stan always draws his arms, so he is drawn without them first: the right one is
    // asked for at no place at all (as Inferno does with the Devil's), and the left one, which
    // cannot be, is drawn at the hi-hat and that patch of the picture is painted again from the
    // drawing where it is up at the crash. Then the raised arms and the sticks.
    //   s: figure units, at Stan's ground point (the caller has translated there);  pose: his beat pose
    //   up 0..1: the arms rise from the kit;  click 0..1: the sticks' tips together
    const ST = BandRhythm.STAN, SEAT = BandRhythm.KIT.seat;
    const S_SH = { R: [SEAT[0] - 0.35, SEAT[1] - 0.55], L: [SEAT[0] + 0.35, SEAT[1] - 0.55] };
    const HEAD_PIVOT = 0.3; // band-rhythm.js turns his head about this height over the seat
    const PATCH = [[0.42, -1.0], [0.475, -1.2], [0.7, -1.022], [0.74, -1.005], [1.17, -0.95], [1.17, -0.8], [0.86, -0.66]]; // round the arm at the hi-hat
    const STUB = [[0.455, -1.118], [0.56, -1.152], [0.715, -1.03], [0.7, -0.985], [0.52, -0.94], [0.45, -0.975]]; // what is left of the other arm at the shoulder
    function stick(g, L, m, a, reach = 0.47, butt = 0.07) {
        const u = [Math.cos(a), Math.sin(a)], n = [-u[1] * 0.017, u[0] * 0.017];
        const p0 = [m[0] - u[0] * butt, m[1] - u[1] * butt], p1 = [m[0] + u[0] * (reach - 0.02), m[1] + u[1] * (reach - 0.02)];
        C.prism(g, cw([[p0[0] + n[0], p0[1] + n[1]], [p1[0] + n[0] * 0.7, p1[1] + n[1] * 0.7], [p1[0] - n[0] * 0.7, p1[1] - n[1] * 0.7], [p0[0] - n[0], p0[1] - n[1]]]), Dd(0.03), { front: ST.stick, top: ST.stickTop, side: ST.stickSide }, { lw: L * 0.8, ink: ST.ink });
        g.beginPath();
        g.ellipse(m[0] + u[0] * reach, m[1] + u[1] * reach, 0.034, 0.024, a, 0, TAU);
        g.fillStyle = ST.stick;
        g.fill();
        g.strokeStyle = ST.ink;
        g.lineWidth = L * 0.8;
        g.stroke();
    }
    function stanCount(g, s, pose, up = 1, click = 0) {
        const L = 3.2 / s, base = { ...pose, snare: NaN, squash: 0, crash: 0, hat: 1 };
        BandRhythm.stan(g, 0, 0, s, base);
        g.save();
        g.scale(s, s);
        g.save();
        C.trace(g, PATCH);
        g.clip();
        g.scale(1 / s, 1 / s);
        BandRhythm.stan(g, 0, 0, s, { ...base, crash: 1 });
        g.restore();
        g.save();
        C.trace(g, STUB);
        g.clip();
        g.translate(SEAT[0], SEAT[1]);
        BandRhythm.stanTorso(g, ST, L);
        g.restore();
        // the arms: from the kit (where the sticks sat) straight up behind his head, the mitts together over it
        // holding the sticks crossed; a click knocks them shut
        const u = clamp(up), top = -2.5, cx = SEAT[0];
        const mR = [lerp(-0.44, cx - 0.17, u), lerp(-1.1, top, u)], mL = [lerp(0.72, cx + 0.17, u), lerp(-0.97, top, u)];
        const lean = lerp(1.2, 0.86, clamp(click)); // the sticks' angle over the horizontal: open, then knocked together
        const aR = lerp(-2.1, -lean, u), aL = lerp(-0.4, -PI + lean, u);
        g.lineJoin = 'round';
        Cast.arm(g, ST, L, S_SH.R, mR);
        Cast.arm(g, ST, L, S_SH.L, mL);
        stick(g, L, mL, aL, 0.5, 0.05);
        stick(g, L, mR, aR, 0.5, 0.05);
        // his head again, over the arms: they go up behind it (it is wider than his shoulders)
        g.translate(SEAT[0], SEAT[1]);
        g.translate(0, (pose.headDy ?? 0) + HEAD_PIVOT);
        g.rotate(pose.headTilt ?? 0);
        g.translate(0, -HEAD_PIVOT);
        BandRhythm.stanHead(g, ST, L, pose);
        g.restore();
        // where the sticks cross, for the click's mark (figure units from his ground point)
        return [cx, top - Math.tan(lean) * 0.17];
    }

    // A follow spot: a hard-edged cone from (x0, y0) to a pool at (x1, y1), screened over the picture.
    function spot(g, x0, y0, x1, y1, r, color, a = 0.22, pool = true) {
        const ang = Math.atan2(y1 - y0, x1 - x0), ux = Math.cos(ang), uy = Math.sin(ang);
        g.save();
        g.globalCompositeOperation = 'screen';
        g.globalAlpha = a;
        g.fillStyle = color;
        g.beginPath();
        g.moveTo(x0 + uy * 16, y0 - ux * 16);
        g.lineTo(x0 - uy * 16, y0 + ux * 16);
        g.lineTo(x1 - r, y1);
        g.lineTo(x1 + r, y1);
        g.closePath();
        g.fill();
        if (pool) {
            g.globalAlpha = a + 0.14;
            g.beginPath();
            g.ellipse(x1, y1, r, r * 0.2, 0, 0, TAU);
            g.fill();
        }
        g.restore();
    }

    return { SH, NO_HAND, frame, toLocal, toFrame, head, arm, tongue, steam, FIRE, flame, fire, quarters, held, scrap, burnt, sourNote, cleanNote, ticks, twist, stanCount, stick, spot };
})();
