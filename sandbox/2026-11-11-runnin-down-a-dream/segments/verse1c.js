// «The pit», bars 20–24 (28.58–35.67 s): the Devil's third scheme, and the flight that ends
// verse 1. Props and helpers are in verse1c-props.js (PitProps).
//   bars 20–21  Digging   close on the road: fresh out of Hell and still smoking, he digs a pit
//                         across it, a clod a beat; then unrolls a sheet painted like the road
//                         over it, pats it flat and hides behind his heap
//   bar 22      The hop   wide: the band's car arrives, hops on Stan's kick as its front wheels
//                         reach the sheet, sails over, and where its front wheels come down the
//                         pit's lip gives way under the heap: he drops into his own pit
//   bars 23–24  Flying    travelling: the car did not come down. It climbs level with the sun,
//                         noses over and starts down (the next block lands it)
(() => {
    const Seg = (window.Seg = window.Seg || {});
    const C = Cereal, K = C.COL, E = Ease, S = Song, PP = PitProps, twos = S.twos, b = S.b, B = S.B, pop = S.pop;
    const T0 = B(20), T2 = B(22), T3 = B(23), T5 = B(25), EPS = 1e-6;
    const n = (k) => b(80 + k); // beat k of this block
    const bump = (t, a, dur = 0.3) => E.bump(twos(t, a), a, dur);
    const seg = (t, a, c) => E.seg(twos(t, a), a, c);
    const dr = (t, a) => Math.floor((t - a) * 12 + EPS); // drawings since a
    const lerp = E.lerp, SC = 84, LANE = World.LANE;
    const SKY = { sun: { x: 170, y: 180, r: 70 }, moon: { x: 850, y: 150, r: 38 } };

    // --- the place (site coordinates: the wide shot's units, before its camera) -------------
    const X0 = 19344; // where on the road: nothing on the far verge behind the action but one pole
    const WIDE = { k: 1, ox: 0, oy: -60 }; // the camera looks lower: the near verge is part of the stage
    const KC = 2, CLOSE = { k: KC, ox: -335 * KC, oy: 892 - 955 * KC };
    const YN = 926, YF = 830; // the pit's near and far lips
    // the pit after each stroke: its near lip, far lip, the depth it shows, how deep he stands
    const STAGE = [
        { x0: 400, x1: 520, yf: 892, sink: 0.38 }, { x0: 396, x1: 526, yf: 874, sink: 0.62 },
        { x0: 372, x1: 550, yf: 852, sink: 0.86 }, { x0: 350, x1: 570, yf: YF, sink: 1.08 },
    ].map((s, i) => ({ ...s, yn: YN, h: s.sink * SC, seed: 'pit' + i }));
    const PIT = PP.pitShape(STAGE[3]);
    const DIG = [460, 922], HEAP = [725, 952], STAND = [634, 958], HIDE = [725, 926];
    const SH = { x0: 314, x1: 566, yn: 942, yf: 827 };
    const quadTo = (yf) => [[SH.x0, SH.yn], [SH.x1, SH.yn], [SH.x1 + PP.SL * (SH.yn - yf), yf], [SH.x0 + PP.SL * (SH.yn - yf), yf]];
    const HK = [0.42, 0.58, 0.72, 0.86, 1]; // the heap's size after each clod
    const hop = (t, a, dur, p, q, h) => {
        const u = seg(t, a, a + dur);
        return [lerp(p[0], q[0], u), lerp(p[1], q[1], u) - Math.sin(u * Math.PI) * h];
    };

    // what stands on the far verge by the pit, in both shots: one more saguaro
    function dress(g, M) {
        const W = World.THEMES.day, X = (v) => PP.zx(M, v), Y = (v) => PP.zy(M, v);
        World.cactus(g, W, X(372), Y(792), 150 * M.k, -1);
    }

    // --- clods: flung over his head on the third drawing of each stroke, under one gravity ---
    const G = 3600, REL = 2 / 12;
    const CLODS = [0, 1, 2, 3].map((k) => {
        const t0 = n(k) + REL, p0 = [DIG[0] - 1.13 * SC, DIG[1] + (STAGE[k].sink - 1.56) * SC];
        const p1 = [HEAP[0] + [-10, 12, -4, 6][k], HEAP[1] - PP.heapSize(HK[k])[1] + 5];
        const rise = Math.max(0, p0[1] - p1[1]) + [92, 86, 60, 44][k], vy = -Math.sqrt(2 * G * rise), T = -vy / G + Math.sqrt((2 * (p1[1] - p0[1] + rise)) / G);
        return { t0, p0, p1, vy, T, vx: (p1[0] - p0[0]) / T, land: S.snap(t0 + T), kind: k ? 'earth' : 'road' };
    });
    const heapK = (t) => CLODS.reduce((k, c, i) => k + (HK[i + 1] - HK[i]) * pop(t, c.land, 0.2), HK[0]);

    // =========================================================================================
    // Bars 20–21 · Digging
    // =========================================================================================
    // one stroke, drawing by drawing: [the mitt on the shaft, the shovel's angle, squash, lean, the free mitt, mood]
    const STROKE = [
        [[-0.8, -0.5], -0.1, 0.1, -0.05, [0.52, -0.58], 'angry'],
        [[-0.74, -0.62], -1.0, 0.03, 0.03, [0.5, -0.5], 'angry'],
        [[-0.74, -0.92], -2.6, -0.06, 0.06, [0.62, -0.8], 'grin'],
        [[-0.72, -1.0], -3.0, 0, 0.03, [0.58, -0.7], 'grin'],
    ];
    function digging(g, t) {
        const M = CLOSE, P = S.pulseAt(t), d = C.drawing(t), ph = P.k + P.since, s = SC * KC;
        const X = (v) => PP.zx(M, v), Y = (v) => PP.zy(M, v);
        PP.roadClose(g, t, X0, M);
        C.memphis(g, t, [['squiggle', 150, 118, 44, -0.4, K.white], ['tri', 318, 226, 38, 0.3, K.yellow], ['zig', 668, 150, 50, 0.2, K.navy], ['cross', 596, 268, 36, 0.5, K.purple], ['ring', 770, 300, 40, 0, K.white]], { lw: 8 });
        dress(g, M);
        const kb = Math.min(3, Math.max(0, P.k - 80)), digs = t < n(4) - EPS, st = STAGE[digs ? kb : 3], sp = PP.pitShape(st);
        const tail = 0.05 * Math.sin(ph * Math.PI);
        // --- the sheet: rolled by the pit's near lip, then whacked open across it
        const openAt = n(5), di5 = dr(t, openAt), ur = t < openAt - EPS ? 0 : [0.42, 0.74, 0.93, 1][Math.min(3, di5)];
        // two pats on the corner that curls, then the hop behind the heap, landing on the bar's last beat
        const pat1 = n(6), pat2 = pat1 + 4 / 24, hideAt = pat1 + 6 / 24, hidAt = hideAt + 2 / 12, curlAt = hidAt + 2 / 12;
        const pressed = (t >= pat1 - EPS && dr(t, pat1) < 1) || (t >= pat2 - EPS && t < curlAt - EPS);
        const curl = ur < 1 ? 0 : pressed ? 0.05 : t < pat1 ? pop(t, openAt + 3 / 12, 0.2) : t < pat2 ? 0.8 : pop(t, curlAt, 0.25);
        PP.inSite(g, M, (u) => {
            PP.pitInside(g, u, sp, st);
        });
        // --- the Devil in his pit: one stroke a beat, sinking with every one
        const vaultAt = n(4), vault = t >= vaultAt + 1 / 12 - EPS;
        if (!vault) {
            const di = digs ? Math.max(0, Math.min(3, dr(t, n(kb)))) : 0, [pv, ang, sq, ln, hr, mood] = STROKE[di];
            g.save();
            PP.clipAbove(g, sp.near.map(([x, y]) => [X(x), Y(y)]));
            PP.devil(g, X(DIG[0]), Y(DIG[1] + st.sink * SC), s, {
                mood, look: di < 2 ? -1 : 1, squash: sq, lean: ln, tail, handR: pv, handL: hr, headDy: di === 0 ? 0.03 : 0,
            }, { t, shovel: { hand: 'R', ang, dirt: true, load: di === 1 ? (kb ? 'earth' : 'road') : null } });
            g.restore();
        }
        PP.inSite(g, M, (u) => {
            PP.pitLip(g, u, sp, st);
            if (ur > 0) {
                const yf = lerp(SH.yn - 2, SH.yf, ur), q = quadTo(yf);
                PP.sheet(g, u, q, { curl, wave: t >= pat1 ? E.seg(t, pat1, pat1 + 5 / 12) : 0, sag: ur >= 1 ? pop(t, openAt + 3 / 12, 0.25) : 0 });
                PP.roll(g, u, q[3][0] - 5, q[2][0] + 5, yf - 2, 12 * Math.pow(1 - ur, 0.75), { smear: false });
            } else PP.roll(g, u, SH.x0 - 6, SH.x1 + 6, SH.yn - 1, 12, { ties: 1 });
            // its ribbons snap off with the whack
            const fl = (t - openAt) / 0.42;
            if (fl >= 0 && fl < 1) {
                for (const [fx, vx, vy] of [[0.24, -70, -250], [0.74, 46, -300]]) {
                    const x = lerp(SH.x0, SH.x1, fx) + vx * fl * 0.42, y = SH.yn - 10 + vy * fl * 0.42 + 0.5 * G * 0.6 * Math.pow(fl * 0.42, 2), a = dr(t, openAt) * 1.1;
                    g.save();
                    g.translate(x, y);
                    g.rotate(a);
                    C.poly(g, [[-9, -2.4], [0, -4], [9, -1], [8, 3], [0, 1.4], [-9, 3]], { fill: K.pink, ink: K.ink, lw: 2.2 * u });
                    g.restore();
                }
            }
        });
        // --- the Devil out of it: over the lip, the whack, two pats, and behind the heap
        const hidden = t >= hideAt + 1 / 12 - EPS;
        const out = () => {
            if (!vault) return;
            let p, pose, sv;
            if (t < hideAt - EPS) {
                p = hop(t, vaultAt, 2 / 12, [DIG[0], DIG[1] + 30], STAND, 120);
                const land = bump(t, vaultAt + 2 / 12, 0.25), air = t < vaultAt + 2 / 12 - EPS;
                // [the mitt on the shaft, the angle, where on the shaft, squash, lean, mood, the other mitt]
                let [pv, ang, hold, sq, ln, mood, hl] = [[-0.56, -0.98], -2.85, 0.56, 0.14 * land - (air ? 0.06 : 0), air ? 0.12 : 0, 'grin', air ? [0.66, -0.92] : [0.5, -0.5]];
                if (t >= openAt - 2 / 24 - EPS && t < openAt - EPS) [pv, ang, hold, ln] = [[-0.62, -0.92], -2.2, 0.3, 0.08]; // the wind-up
                if (t >= openAt - EPS) [pv, ang, hold, sq, ln, mood] = dr(t, openAt) < 2 ? [[-0.5, -0.5], -1.12, 0.3, 0.12, -0.1, 'angry'] : [[-0.56, -0.7], -0.6, 0.3, 0, -0.03, 'laugh'];
                // the two pats: both mitts on the shovel, its back flat on the corner
                for (const at of [pat1, pat2]) {
                    if (t < at - 2 / 24 - EPS) continue;
                    const k = dr(t, at);
                    [pv, ang, hold, sq, ln, mood, hl] = k < 0 || k >= 1 ? [[-0.4, -0.8], -0.95, 0.9, -0.03, 0.03, 'sly', [0.56, -0.74]] : [[-0.23, -0.34], -1.32, 0.9, 0.1, -0.07, 'sly', [0.62, -0.56]];
                }
                pose = { mood, look: -1, squash: sq + 0.03 * P.pulse, lean: ln, tail, handR: pv, handL: hl, step: air ? 1 : 0 };
                sv = { hand: 'R', ang, hold, dirt: true, both: hold > 0.8 && ang < -1.3 };
            } else {
                // the hop behind the heap; then only his eyes, and the shovel on his shoulder
                p = hop(t, hideAt, 2 / 12, STAND, [HIDE[0], HIDE[1] + 40], 84);
                const air = t < hidAt - EPS, peek = seg(t, hidAt + 1 / 12, hidAt + 3 / 12);
                if (!air) p = [HIDE[0], HIDE[1] + lerp(40, 2, E.out(peek))];
                pose = { mood: 'sly', look: -1, squash: air ? -0.05 : 0.02 * P.pulse, tail, handR: [-0.47, -0.99], handL: air ? [0.62, -0.9] : [0.5, -0.5], lean: air ? 0.1 : 0 };
                sv = { hand: 'R', ang: -2.5, hold: 0.3, behind: true, dirt: true };
            }
            g.save();
            if (hidden) {
                // behind the heap: nothing of him shows under its foot
                g.beginPath();
                g.rect(0, 0, 1000, Y(HEAP[1]));
                g.clip();
            }
            PP.devil(g, X(p[0]), Y(p[1]), s, pose, { t, shovel: sv });
            g.restore();
        };
        if (hidden) out();
        PP.inSite(g, M, (u) => {
            const hk = heapK(t);
            PP.heap(g, u, HEAP[0], HEAP[1], hk, t);
            // crumbs roll off where a clod lands
            for (const c of CLODS) {
                const tt = t - c.land;
                if (tt < 0 || tt > 0.36) continue;
                for (const [vx, vy] of [[-90, -190], [70, -230], [130, -120]]) {
                    const x = c.p1[0] + vx * tt, y = c.p1[1] + vy * tt + 0.5 * G * tt * tt;
                    if (y < HEAP[1] + 4) PP.clod(g, u, x, y, 3.4, dr(t, c.land) * 0.9, 'earth');
                }
            }
            // a puff where the shovel pats the sheet
            for (const at of [pat1, pat2]) PP.dust(g, u, SH.x1 - 10, SH.yn - 3, 15, E.seg(t, at, at + 0.36), 'pat' + at, t);
        });
        if (!hidden) out();
        // --- clods in the air
        PP.inSite(g, M, (u) => {
            for (const c of CLODS) {
                const tt = t - c.t0;
                if (tt < -EPS || t >= c.land - EPS) continue;
                const x = c.p0[0] + c.vx * tt, y = c.p0[1] + c.vy * tt + 0.5 * G * tt * tt, a = 0.3 + dr(t, c.t0) * 0.7;
                PP.clod(g, u, x, y, 12.5, a, c.kind);
                for (const [k, dx, dy] of [[0.07, -7, 5], [0.12, 3, 9]]) {
                    const t2 = tt - k;
                    if (t2 > 0) PP.clod(g, u, c.p0[0] + c.vx * t2 * 0.94 + dx, c.p0[1] + c.vy * t2 * 0.9 + 0.5 * G * t2 * t2 + dy, 2.8, a, 'earth');
                }
            }
        });
    }

    // =========================================================================================
    // Bar 22 · The hop
    // =========================================================================================
    // The car: its front wheels reach the sheet on the third beat and come down past the pit
    // on the fourth. hc: the height of its middle; th: its pitch (clockwise = nose down).
    const AXLE = 3.55 * SC, HOP = n(10), DAB = n(11), X_HOP = 330, X_DAB = 622, V = (X_DAB - X_HOP) / (DAB - HOP);
    const TH_DAB = 0.15, HC_DAB = AXLE * Math.sin(TH_DAB);
    function carAt(t) {
        const x = X_HOP - AXLE + V * (t - HOP);
        if (t < HOP) return { x, hc: 0, th: 0 };
        if (t < DAB) {
            const u = (t - HOP) / (DAB - HOP);
            return { x, hc: 4 * 132 * u * (1 - u) + HC_DAB * u * u, th: -0.07 * Math.sin(Math.min(1, u * 2) * Math.PI) + TH_DAB * Math.pow(u, 2.2) };
        }
        // the front wheels kick off the road and the nose comes up; the back wheels never touch
        const v = (t - DAB) / (T3 - DAB), hf = 330 * (1 - Math.pow(1 - v, 2.2)), hr = 2 * HC_DAB + 140 * v * v - 50 * Math.sin(Math.PI * Math.min(1, v / 0.6));
        return { x, hc: (hf + hr) / 2, th: Math.asin((hr - hf) / (2 * AXLE)) };
    }
    // what gives way: the far lip, from the pit to under the heap
    const EXT_FAR = [[624, 890], [700, 882], [790, 889], [848, 900]], EXT_NEAR = [[570, 926], [588, 950], [628, 969], [808, 965], [840, 930]];
    const rag = (pts, seed) => pts.flatMap((p, i) => (i < pts.length - 1 ? raggedSeg(p, pts[i + 1], seed + i) : [p]));
    function raggedSeg(p, q, seed) {
        const len = Math.hypot(q[0] - p[0], q[1] - p[1]), m = Math.max(1, Math.round(len / 14)), r = Motion.rng('ext' + seed), out = [p];
        for (let i = 1; i < m; i++) out.push([lerp(p[0], q[0], i / m) + (r() - 0.5) * 5, lerp(p[1], q[1], i / m) + (r() - 0.5) * 5]);
        return out;
    }
    const EXT_F = rag(EXT_FAR, 'f'), EXT_N = rag(EXT_NEAR, 'n');
    const EXT = [...EXT_F, ...EXT_N.slice().reverse()];
    // the hole after the lip has gone: the pit's own edge, opened to the right
    const HOLE = (() => {
        const cut = PIT.lip.findIndex(([x, y]) => x > 550 && y > 888);
        return [...PIT.lip.slice(0, cut), ...EXT_F, ...EXT_N.slice().reverse(), ...PIT.near.slice().reverse().slice(1, -1)];
    })();
    function extInside(g, u) {
        g.save();
        C.trace(g, EXT);
        g.clip();
        g.fillStyle = '#24111b';
        g.fillRect(550, 860, 320, 130);
        for (const [a, c, col] of [[0, 5, '#211c57'], [5, 22, '#8f4d24'], [22, 44, '#6b3418'], [44, 66, '#4a2418']]) C.poly(g, [...EXT_F.map(([x, y]) => [x, y + a]), ...EXT_F.slice().reverse().map(([x, y]) => [x, y + c])], { fill: col, lw: 0 });
        C.poly(g, EXT_F.map(([x, y]) => [x, y + 66]), { ink: K.ink, lw: 2.4 * u, close: false });
        g.restore();
    }

    function hopShot(g, t) {
        const M = WIDE, P = S.pulseAt(t), d = C.drawing(t), ph = P.k + P.since;
        const Y = (v) => PP.zy(M, v);
        g.save();
        g.translate(0, M.oy);
        World.back(g, t, X0, 'day', SKY);
        g.restore();
        dress(g, M);
        const falls = t >= DAB - EPS, df = falls ? dr(t, DAB) : -1, gone = df >= 1;
        const tail = 0.05 * Math.sin(ph * Math.PI);
        // --- the ground: the pit under its sheet; then the lip gives and the sheet pours in
        PP.inSite(g, M, (u) => {
            PP.pitInside(g, u, PIT, STAGE[3]);
            if (gone) extInside(g, u);
            // cracks run from where the wheels came down
            if (falls) {
                for (const pts of [[[0, 0], [-16, 10], [-34, 6], [-50, 18]], [[0, 0], [24, 14], [52, 10], [82, 24], [112, 18]], [[0, 0], [10, -14], [36, -20]], [[0, 0], [-22, -10], [-36, -16]]].map((c) => c.map(([x, y]) => [X_DAB + x, 912 + y]))) C.poly(g, pts, { ink: K.ink, lw: 3 * u, close: false });
            }
            if (gone) C.poly(g, HOLE, { ink: K.ink, lw: 3.2 * u });
            else PP.pitLip(g, u, PIT, STAGE[3]);
            // the sheet
            const Q = [640, 954], q0 = quadTo(SH.yf), k = [0, 0, 0.45, 0.82, 1][Math.min(4, df + 1)];
            if (k < 1) {
                const pull = (p, w) => [lerp(p[0], Q[0], Math.min(1, k * w)), lerp(p[1], Q[1], Math.min(1, k * w))];
                const q = k > 0 ? [pull(q0[0], 0.7), pull(q0[1], 1.6), pull(q0[2], 1.25), pull(q0[3], 0.75)] : q0;
                g.save();
                if (k > 0) PP.clipAbove(g, EXT_N);
                PP.sheet(g, u, q, { curl: k > 0 ? 0 : 0.9 + 0.1 * Math.sin(ph * Math.PI) * (d % 2), folds: k, sag: k > 0 ? 0 : 1 });
                g.restore();
            }
        });
        // --- the band's car
        const c = carAt(t), air = t >= HOP - EPS, u10 = E.seg(t, HOP, DAB);
        const float = air && !falls ? Math.sin(Math.min(1, u10 * 1.15) * Math.PI) : 0, slam = bump(t, DAB, 0.3);
        const up = (k, lag) => (air && !falls ? k * Math.pow(Math.sin(E.seg(u10, lag, 1) * Math.PI), 0.8) : 0);
        const awe = float > 0.2 ? { eyes: 'wide', mouth: 'o' } : {};
        PP.car(g, t, c.x, Y(LANE - c.hc), SC, {
            tilt: c.th, ground: Y(LANE), spin: c.x / (0.56 * SC) + (air ? (t - HOP) * 14 : 0), exhaust: 0.7, sing: true,
            bounce: air ? 0 : 0.25 * P.pulse + 0.9 * E.seg(t, HOP - 3 / 24, HOP),
            lift: air && !falls ? { stan: up(0.18, 0.1), ben: up(0.3, 0.05), howie: up(0.4, 0), mike: up(0.32, 0.08), tom: up(0.26, 0.03) } : null,
            pose: {
                tom: { headTilt: -0.1 * float, squash: -0.07 * float + 0.12 * slam, headDy: -0.04 * float },
                mike: { ...awe, squash: -0.08 * float + 0.14 * slam, headDy: -0.05 * float, lean: -0.1 * float },
                howie: { ...awe, squash: -0.1 * float + 0.14 * slam, headDy: -0.06 * float, lean: 0.12 * float },
                ben: { ...awe, squash: -0.08 * float + 0.12 * slam, headDy: -0.05 * float, sway: 0.2 * float },
                stan: { squash: -0.05 * float + 0.1 * slam, headDy: -0.04 * float, ...(float > 0.2 ? { mouth: 'o' } : {}) },
            },
        });
        PP.inSite(g, M, (u) => {
            // dust where it left the road, and a star where it comes down
            for (const wx of [-AXLE, AXLE]) PP.dust(g, u, X_HOP - AXLE + wx, LANE + 4, 30, E.seg(t, HOP, HOP + 0.5), 'hop' + wx, t);
            if (falls && df < 2) C.burst(g, X_DAB + 4, LANE + 2, { r0: 15 + 9 * df, r1: 34 + 22 * df, n: 9, seed: 'dab', jitter: 0.14, fill: K.white, ink: K.ink, lw: 3 * u });
            PP.dust(g, u, X_DAB - 6, LANE + 6, 34, E.seg(t, DAB, DAB + 0.55), 'dab', t);
        });
        // --- the Devil behind his heap: he peeks, ducks, stares, and goes down with it
        const duckAt = n(9), stareAt = HOP + 2 / 12;
        const sink = [0, 26, 104, 210][Math.max(0, Math.min(3, df))], jolt = df === 0 ? 12 : 0;
        const crouch = falls ? -10 : t < duckAt - EPS ? 2 : t < stareAt - EPS ? lerp(2, 40, E.out(seg(t, duckAt, duckAt + 2 / 12))) : -4;
        const mood = t < duckAt - EPS ? 'sly' : t < stareAt - EPS ? 'grin' : 'shock';
        const armsUp = falls ? 1 : 0;
        g.save();
        if (gone) PP.clipAbove(g, EXT_N.map(([x, y]) => [x, Y(y)]));
        PP.devil(g, HIDE[0] + (gone ? -6 * df : 0), Y(HIDE[1] + crouch + sink - jolt), SC, {
            mood, look: t < stareAt ? -1 : falls ? 0 : -1, squash: falls ? -0.06 : 0.02 * P.pulse, tail: falls ? 0.12 : tail, lean: gone ? -0.08 * df : 0,
            headTilt: !falls && t >= stareAt ? -0.06 : 0, headDy: d % 4 < 2 || falls ? 0 : 0.012,
            handR: armsUp ? [-0.72, -1.32 - 0.1 * (df % 2)] : [-0.47, -0.99], handL: armsUp ? [0.74, -1.26 + 0.1 * (df % 2)] : [0.5, -0.5],
        }, { t, shovel: falls ? null : { hand: 'R', ang: -2.5, hold: 0.3, behind: true, dirt: true } });
        PP.inSite(g, M, (u) => {
            g.save();
            g.translate(HEAP[0], HEAP[1] + sink * 0.9 - jolt * 0.7);
            g.rotate(gone ? -0.07 * df : 0);
            PP.heap(g, u, 0, 0, 1, t);
            g.restore();
        });
        g.restore();
        PP.inSite(g, M, (u) => {
            // the shovel leaves his shoulder, turns over and follows him down
            if (falls) {
                const tt = t - DAB, x = HIDE[0] - 62 + 60 * tt, y = HIDE[1] - 150 - 520 * tt + 0.5 * 7600 * tt * tt;
                g.save();
                PP.clipAbove(g, EXT_N);
                g.translate(x, y);
                g.scale(SC, SC);
                PP.shovel(g, 3.2 / SC, [0, 0], -2.5 + df * 1.25, { hold: 0.75, dirt: true });
                g.restore();
            }
            if (gone) PP.dust(g, u, HEAP[0], HEAP[1], 62, E.seg(t, DAB + 1 / 12, DAB + 1 / 12 + 0.9), 'fall', t);
        });
    }
    // =========================================================================================
    // Bars 23–24 · Flying
    // =========================================================================================
    const T_END = T5 - 1 / 24, Y_END = LANE - 110, Y_TOP = 392, Y_IN = 636, K_TOP = 4.3; // in beats of this shot
    const BIRDS = [[862, 200, 62, true], [918, 138, 50, false], [928, 262, 44, false]];
    function flying(g, t) {
        const P = S.pulseAt(t), d = C.drawing(t), X = Rig.X(t), kEnd = (8 * (T_END - T3)) / (T5 - T3), k = (8 * (t - T3)) / (T5 - T3);
        World.back(g, t, X, 'day', SKY);
        // the sun grins while they are level with it
        PP.sunGrin(g, t, X, SKY.sun, t < n(18) - 2 / 12 - EPS ? pop(t, n(15), 0.2) : 1 - E.out(seg(t, n(18) - 2 / 12, n(18))));
        // wind: a few streaks at their height
        const r = Motion.rng('wind');
        for (let i = 0; i < 7; i++) {
            const y = 110 + r() * 520, l = 70 + r() * 110, sp = 1.5 + r() * 0.8, x = 1150 - ((X * sp + r() * 2600) % 2600);
            C.poly(g, [[x, y], [x + l, y]], { ink: '#fffdf4', lw: 4, close: false });
            C.poly(g, [[x + l * 0.3, y + 10], [x + l * 0.8, y + 10]], { ink: '#fffdf4', lw: 3, close: false });
        }
        // the car's arc: up to the sun's height, over, and down
        const y = k < K_TOP ? Y_TOP + (Y_IN - Y_TOP) * Math.pow(1 - k / K_TOP, 2) : Y_TOP + (Y_END - Y_TOP) * Math.pow((k - K_TOP) / (kEnd - K_TOP), 2.3);
        const tilt = k < K_TOP ? -0.17 * (1 - E.inOut(k / K_TOP)) : 0.06 * E.inOut(Math.min(1, (k - K_TOP) / 2.6));
        const top = Math.exp(-Math.pow((k - K_TOP) / 1.1, 2)); // weightless at the top
        // birds keep pace, look the band over, and pull ahead when it noses over
        const away = E.in(E.seg(k, 5.6, 7.3));
        BIRDS.forEach(([bx, by, bs, shades], i) => {
            const x = bx + away * (260 + i * 60) + 4 * Math.sin(k * 1.3 + i * 2), yy = by - away * (90 + 30 * i) + ((d + i * 2) % 6 < 3 ? 0 : 5);
            if (x > 1080) return;
            PP.bird(g, x, yy, bs, { flap: [0, 1, 2, 1][(((d + i) % 4) + 4) % 4], shades, look: away > 0 ? 1 : -1, lookY: y > yy + 240 ? 1 : 0, tilt: -0.5 * away });
        });
        PP.car(g, t, 520, y, SC, {
            tilt, ground: LANE, spin: X / (0.56 * SC), exhaust: 1 - E.seg(k, 6, 7.6), sing: true,
            lift: { stan: 0.05 * top, ben: 0.09 * top, howie: 0.12 * top, mike: 0.1 * top, tom: 0.06 * top },
            pose: { tom: { headTilt: -0.2 - 0.05 * P.pulse, headDy: -0.02 - 0.03 * top, mouth: d % 4 < 3 ? 'sing' : 'grin' }, howie: { headDy: -0.04 * top }, mike: { headDy: -0.04 * top }, ben: { headDy: -0.04 * top } },
        });
        World.front(g, t, X, 'day');
    }

    function draw(g, t, env) {
        if (t < T2 - EPS) digging(g, t);
        else if (t < T3 - EPS) hopShot(g, t);
        else flying(g, t);
    }

    Seg.verse1c = {
        shots: [[T0, T2, 'Digging'], [T2, T3, 'The hop'], [T3, T5, 'Flying']],
        draw,
        post: (t) => ({ track: [0.25, 0.1][Math.round((t - T0) * 24)] ?? 0 }),
    };
})();
