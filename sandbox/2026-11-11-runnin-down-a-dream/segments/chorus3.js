// Chorus 3, bars 93–101 (131.667–144.375 s): the band plays in Hell and Hell loves it.
// The car comes down the gullet onto the stage of Hell's venue and throws off everything it
// scooped up on the road (each thing lands where it stays); the lights find the players one by
// one; a skeleton's foot starts to tap; the house is won over; the Devil, smug in his box,
// looks down at his own crowd cheering, bangs the rail, tears his scarf off and throws it.
// Props: segments/chorus3-props.js (Chorus3Props); the set is inferno.js; the things the car
// carries and the Devil's cold are verse 3's (Verse3bProps); the cactus and the title's look
// are chorus 1's (Chorus1Props).
(() => {
    const Seg = (window.Seg = window.Seg || {});
    const C = Cereal, K = C.COL, E = Ease, S = Song, I = Inferno, P = Chorus3Props, V = Verse3bProps, twos = S.twos, b = S.b, B = S.B;
    const T0 = B(93), T95 = B(95), T96 = B(96), T97 = B(97), T98 = B(98), T99 = B(99), T100 = B(100), T102 = B(102);
    const n = (k) => b(372 + k); // beat k of the chorus
    const FR = 1 / 24, PI = Math.PI, TAU = PI * 2, EPS = 1e-6, SC = 84;
    const lerp = P.lerp, kOf = P.kOf, rot = P.rot, smooth = P.smooth;
    const seg2 = (t, a, c) => E.seg(twos(t, a), a, c);
    const hitK = (t, a, list = [1, 0.75, 0.4, 0.15]) => (t < a - EPS ? 0 : list[kOf(t, a)] ?? 0); // a squash that is whole on the hit's frame
    const spring = (t, a, f = 17, damp = 6.5) => (t < a - EPS ? 0 : Math.exp(-(t - a) * damp) * Math.cos((t - a) * f));
    const stepsAt = (t, list, ramp = 0.14) => list.reduce((v, [at, to], i) => lerp(v, to, i === 0 ? 1 : E.seg(t, at, at + ramp)), 0); // a value that climbs a step on each hit

    // the cactus in shades at the wheel, keeping the beat (chorus 1's running gag)
    const SEATS = Rides.bandCarSeats();
    const WHEEL = [SEATS.wheel[0] - SEATS.driver[0] - 0.07, SEATS.wheel[1] - SEATS.driver[1] + 0.02];
    const driver = (t, o = {}) => (g2, sc) => {
        const Pu = S.pulseAt(t);
        Chorus1Props.cactus(g2, 0, 0, sc, { wheel: WHEEL, shades: 1, squash: 0.05 * Pu.pulse, wave: Pu.k % 2 ? Pu.pulse : -Pu.pulse * 0.6, ...o });
    };
    const band = (g, t, car, o = {}) => Rig.band(g, t, car.x, car.y, car.s, { spin: 0, sing: true, tomDrives: false, driver: driver(t), ...o });

    // The Devil in his box (SET scale 84): pose and cold as Chorus3Props.devil takes them
    const inBox = (g, t, Sg, o, pose, cold) => I.box(g, Sg.box.x, Sg.box.y, Sg.box.s, { t, ...o }, pose && ((g2) => P.devil(g2, Sg.box.x, Sg.box.y, Sg.box.s, { shadow: false, ...pose }, { t, ...cold })));
    // the venue's layers in order; `mid` draws between the band and the pit, `over` after the pit
    function house(g, t, o, parts) {
        const Sg = I.stage(o.view, o.pan);
        I.venue(g, t, o);
        if (parts.back) parts.back(Sg);
        if (parts.box) parts.box(Sg);
        if (parts.band) parts.band(Sg);
        if (parts.mid) parts.mid(Sg);
        I.crowd(g, t, o);
        if (parts.over) parts.over(Sg);
    }

    // =========================================================================================
    // Shot 1 · «The entrance», bars 93–94: a cold house, an empty stage. The car comes down the
    // gullet, lands on its wheels on «down» and bounces, and everything it scooped up on the road
    // flies off: the trident into the gum, the barrier onto the lip, the arrow between two teeth,
    // the cones onto two heads of the front row, the imp onto a colleague's hard hat, the blueprint
    // into the pit, and the Devil, slung by his scarf, across the hall into his box: upside down,
    // then upright.
    // =========================================================================================
    const TL = n(2), TL2 = n(3), GF = 2400, VL = 2123, VUP = (GF * (TL2 - TL)) / 2;
    // how high the car's wheels are over the stage
    const carUp = (t) => {
        if (t < TL - EPS) return VL * (TL - t) - 0.5 * GF * (TL - t) * (TL - t);
        if (t < TL2 - EPS) return VUP * (t - TL) - 0.5 * GF * (t - TL) * (t - TL);
        return 0;
    };
    // where each thing rides on the car (verse3b's HOME, car units) and when it lands where it stays
    const RIDE = { coneA: [-2.86, -3.64], coneB: [-4.94, -3.24], barrier: [4.74, -0.2], arrow: [-3.1, -3.8], imp: [4.78, -0.98], plan: [-1.2, -0.5], fork: [3.3, -1.1], post: [-4.37, -1.3] };
    const LAND = { fork: TL2, barrier: TL2 + 2 * FR, arrow: TL2 + 4 * FR, coneA: n(4), coneB: n(4) + 2 * FR, plan: n(4), imp: n(4) + 4 * FR, devil: n(5), up: n(6), calm: n(7) };
    // a thing thrown at TL from p0 that comes down on p1 at `t1`, on twos: [x, y, u]
    const toss = (t, t1, p0, p1, G = GF) => {
        const T = t1 - TL, a = Math.min(T, Math.max(0, twos(t, TL) - TL)), vx = (p1[0] - p0[0]) / T, vy = (p1[1] - p0[1] - 0.5 * G * T * T) / T;
        return [p0[0] + vx * a, p0[1] + vy * a + 0.5 * G * a * a, a / T];
    };
    const COLD = { view: 'wide', pan: 0, heat: 0.05, hype: 0, density: 1 };
    function entrance(g, t, env) {
        const Pu = S.pulseAt(t), d = C.drawing(t), f = d % 2 ? 1 : -1, o = { ...COLD, beatK: Pu.pulse * 0.4 };
        const air = t < TL - EPS || (t >= TL + FR - EPS && t < TL2 - EPS), up = carUp(t), cy = 800 - up, flying = t >= TL - EPS;
        const bn = t < TL - EPS ? -0.4 : t < TL2 - EPS ? [1, 0.2][kOf(t, TL)] ?? -0.5 : 0.9 * spring(t, TL2, 19, 6);
        const sh = hitK(t, TL, [1, -0.6, 0.3, 0]), shake = [0, 14 * sh];
        const carPt = (p) => [500 + p[0] * SC, cy + (p[1] + 0.1 * bn) * SC];
        const at0 = (key) => [500 + RIDE[key][0] * SC, 800 + (RIDE[key][1] + 0.1) * SC]; // where it was when the car hit
        const hits = [];
        const star = (key, x, y, r = 40) => kOf(t, LAND[key]) === 0 && hits.push([x, y, r, key]);
        const landed = (key) => t >= LAND[key] - EPS;
        const rattle = (i) => (flying ? 0 : 0.06 * ((d + i) % 2)) * SC; // weightless on the way down
        const v = P.view(o);
        // the Devil's flight: his collar's path from behind the tail to his box, tumbling
        const post = carPt(RIDE.post), neck0 = [500 + (RIDE.post[0] - 0.36) * SC, 800 + (RIDE.post[1] - 1.72) * SC];
        const BOXC = [884, 440 - 0.95 * SC - 0.12 * SC];
        const devilFly = () => {
            const T = LAND.devil - TL, u = Math.min(1, Math.max(0, twos(t, TL) - TL) / T), p = 1407 + (BOXC[1] - 360), q = p - (neck0[1] - BOXC[1]);
            return [lerp(neck0[0], BOXC[0], u), neck0[1] - p * u + q * u * u, PI - 0.2 + (TAU + 0.2) * u, u];
        };
        g.save();
        g.translate(shake[0], shake[1]);
        house(g, t, o, {
            back: () => {
                P.title(g, t, { ...o, at: S.TITLES[4].slice(0, 3).map(S.snap), out: T95 - 7 * FR });
                if (landed('arrow')) P.arrowStuck(g, v, t, 0.1 * spring(t, LAND.arrow, 30, 7));
                if (landed('fork')) P.forkStuck(g, v, twos(t, LAND.fork) - LAND.fork);
            },
            box: (Sg) => {
                const kd = kOf(t, LAND.devil);
                if (kd < 0) return inBox(g, t, Sg, {}, null);
                const jolt = Math.max(hitK(t, LAND.devil, [1, 0.8, 0.5, 0.25]), hitK(t, LAND.up, [0.7, 0.4, 0.2]));
                if (t < LAND.up - EPS) {
                    // head first into it: his legs kick over the rail
                    I.box(g, Sg.box.x, Sg.box.y, Sg.box.s, { t, shake: jolt, part: 'back' });
                    g.save();
                    g.beginPath();
                    g.rect(Sg.box.x - 2 * SC, Sg.box.y - 4 * SC, 4 * SC, 4.05 * SC);
                    g.clip();
                    g.translate(BOXC[0], BOXC[1] - 0.08 * SC * hitK(t, LAND.devil, [-2, 1, 0.5, 0]));
                    g.rotate(PI + 0.07 * f);
                    P.devil(g, 0, 0.95 * SC, SC, { mood: 'shock', step: f, tail: 0.3 * f, handL: [0.7, -0.9], handR: [-0.7, -0.9], shadow: false }, { t, blow: f });
                    g.restore();
                    I.box(g, Sg.box.x, Sg.box.y, Sg.box.s, { t, shake: jolt, part: 'front' });
                    return;
                }
                // upright: he pops up dizzy, then finds the band on his stage and likes what he sees
                const calm = t >= LAND.calm - EPS, pop = hitK(t, LAND.up, [-0.16, 0.1, 0.04, 0]);
                inBox(g, t, Sg, { shake: jolt }, calm
                    ? { mood: 'sly', look: -1, headTilt: -0.05, squash: 0.03 * Pu.pulse, tail: 0.05 * f, ...I.BOX.rail }
                    : { mood: 'shock', look: f, headTilt: 0.07 * f, squash: pop, tail: 0.2 * f, handR: [-0.62, -0.74], handL: [0.52, -0.74] }, { blow: calm ? 0.2 : -0.6 * f, nose: calm ? 1 : 1.2 });
            },
            band: (Sg) => {
                // its shadow on the empty stage tells it is coming
                const near = 1 - Math.min(1, up / 950);
                if (air) {
                    g.fillStyle = 'rgba(36,21,49,0.28)';
                    g.beginPath();
                    g.ellipse(500 + 0.3 * SC, 800 - 0.1 * SC, 4.8 * SC * (0.3 + 0.7 * near * near), 0.2 * SC * (0.4 + 0.6 * near), 0, 0, TAU);
                    g.fill();
                }
                P.landing(g, 500, 804, SC, t - TL, 'flash');
                const land = hitK(t, TL), land2 = hitK(t, TL2, [0.5, 0.3, 0.1]), sq = 0.13 * land + 0.06 * land2;
                band(g, t, { x: 500, y: cy, s: SC }, {
                    spin: 20 * (Math.min(t, TL) - T0), bounce: bn, exhaust: flying ? 0 : 0.6, shadow: air ? false : undefined, driver: driver(t, flying && t < TL2 ? { squash: 0.2 * land, mouth: 'oh' } : {}),
                    pose: { tom: { squash: 0.045 * Pu.pulse + sq }, mike: { squash: 0.045 * Pu.pulse + sq }, howie: { squash: 0.045 * Pu.pulse + sq }, ben: { squash: 0.045 * Pu.pulse + sq }, stan: { squash: 0.03 * Pu.pulse + sq * 0.7, crash: land } },
                });
            },
            mid: () => {
                // --- what still rides on the car, on the way down
                if (!flying) {
                    const sw = [0, 0.05, -0.03][((d % 3) + 3) % 3];
                    V.cone(g, ...carPt([RIDE.coneA[0], RIDE.coneA[1] - 0.05]).map((c, i) => c - (i ? rattle(0) : 0)), SC, 0.04 * f);
                    V.cone(g, carPt(RIDE.coneB)[0] - sw * SC, carPt(RIDE.coneB)[1] - rattle(1), SC, -0.2 + sw * 2);
                    V.arrowPlank(g, carPt(RIDE.arrow)[0], carPt(RIDE.arrow)[1] - rattle(1) * 1.4, 2.0 * SC, { on: true, t, ang: -0.03 - 0.03 * f });
                    V.barrier(g, carPt(RIDE.barrier)[0], carPt(RIDE.barrier)[1] - rattle(0), SC * 0.8, { t, ang: -0.1 + 0.03 * f });
                    const ip = carPt(RIDE.imp);
                    Devil.imp(g, ip[0], ip[1] - rattle(0) - rattle(1), P.IMP_U, { wear: 'hat', mood: 'oops', look: -1, armUp: 1, shadow: false, tail: 0.15 * f });
                    V.mallet(g, ip[0] + 0.7 * P.IMP_U, ip[1] - rattle(0) - rattle(1) - 0.92 * P.IMP_U, 0.3 + 0.1 * f, P.IMP_U);
                    const fp = carPt(RIDE.fork);
                    g.save();
                    g.translate(fp[0], fp[1]);
                    g.scale(SC, SC);
                    Devil.trident(g, 0, 0, 3.2 / SC, { ang: 0.03 * f, grip: 0 });
                    g.restore();
                    const pp = carPt(RIDE.plan);
                    V.blueprint(g, pp[0], pp[1] - rattle(1) * 0.5, SC, { ang: 0.03 * f, wave: f });
                    for (const dx of [-0.36, 0.36]) V.dot(g, pp[0] + dx * SC, pp[1] - 0.4 * SC, 3.6, '#d5dbea', 2.2);
                }
                // --- the barrier, across the lip
                if (flying) {
                    const [x, y, u] = toss(t, LAND.barrier, at0('barrier'), P.HOME.barrier);
                    V.barrier(g, x, y - 5 * hitK(t, LAND.barrier, [0, 1, 0.3, 0]), lerp(SC * 0.8, P.BARRIER_S, u), { t, ang: u < 1 ? -TAU * (1 - u) - 0.1 * (1 - u) : 0.07 * spring(t, LAND.barrier, 26, 9) });
                    star('barrier', x - 40, y - 8, 30);
                }
                // --- the blueprint: off the rail, a leaf's fall into the pit
                if (flying && t < LAND.plan + 3 * FR) {
                    const u = seg2(t, TL, LAND.plan + 2 * FR), p0 = at0('plan');
                    V.blueprint(g, p0[0] - 60 * u + 22 * Math.sin(u * 9), p0[1] - 150 * Math.sin(Math.min(1, u * 1.7) * PI * 0.5) + 250 * u * u, SC, { ang: 0.5 * Math.sin(u * 9 + 1) - 0.3 * u, wave: f });
                }
                P.landing(g, 500, 804, SC, t - TL);
                P.landing(g, 500, 804, SC, t - TL2, 'dust', 0.6);
            },
            over: () => {
                // --- the cones, onto two heads of the front row
                for (const [key, fg, tilt] of [['coneA', P.HAT_A, -0.12], ['coneB', P.HAT_B, 0.1]]) {
                    if (!flying) continue;
                    if (landed(key)) {
                        P.coneHat(g, v, fg, t, o, tilt + 0.25 * spring(t, LAND[key], 24, 8), hitK(t, LAND[key], [1, 0.5, 0, 0]));
                        const a = P.figAt(fg, t, o);
                        star(key, a.x - 26, a.top - 14, 26);
                    } else {
                        const a = P.figAt(fg, LAND[key], o), [x, y, u] = toss(t, LAND[key], at0(key), [a.x + 4, a.top + 1]);
                        V.cone(g, x, y, lerp(SC, P.CONE_S, u), -TAU * 1.5 * (1 - u) + tilt);
                    }
                }
                // --- the imp, onto the hard hat of one of the pit's own
                if (flying) {
                    const a = P.figAt(P.CATCHER, t, o);
                    if (landed('imp')) {
                        P.impOnSkull(g, v, t, o, { squash: 0.22 * hitK(t, LAND.imp), up: 0.9 - 0.75 * E.seg(t, LAND.imp, LAND.imp + 0.5), swing: 0.5 * spring(t, LAND.imp, 20, 5) });
                        star('imp', a.x - 30, a.hat - 8, 30);
                    } else {
                        const [x, y, u] = toss(t, LAND.imp, at0('imp'), [a.x + 7, a.hat]);
                        g.save();
                        g.translate(x, y - 0.5 * P.IMP_U);
                        g.rotate(TAU * (1 - u));
                        Devil.imp(g, 0, 0.5 * P.IMP_U, P.IMP_U, { wear: 'hat', mood: 'oops', look: -1, armUp: 1, shadow: false, tail: 0.2 * f });
                        V.mallet(g, 0.7 * P.IMP_U, -0.42 * P.IMP_U, 0.4, P.IMP_U);
                        g.restore();
                    }
                }
                // --- the arrow and the trident, up into the jaw
                if (flying && !landed('arrow')) {
                    const [x, y, u] = toss(t, LAND.arrow, at0('arrow'), P.HOME.arrow);
                    V.arrowPlank(g, x, y, 2.0 * SC, { on: true, t, ang: lerp(0, PI / 2 + TAU, u) });
                }
                if (kOf(t, LAND.arrow) === 0) hits.push([P.HOME.arrow[0], P.HOME.arrow[1] - 70, 30, 'arrow']);
                if (flying && !landed('fork')) {
                    const p0 = at0('fork'), [x, y, u] = toss(t, LAND.fork, [p0[0], p0[1] - 2.2 * SC], P.HOME.fork);
                    g.save();
                    g.translate(x, y);
                    g.scale(SC, SC);
                    Devil.trident(g, 0, 0, 3.2 / SC, { ang: -0.17 * Math.min(1, u * 2), grip: 2.2 });
                    g.restore();
                }
                if (kOf(t, LAND.fork) === 0) hits.push([P.HOME.fork[0], P.HOME.fork[1] + 6, 44, 'fork']);
                // --- the Devil: he streams over the tail on the way down, his scarf caught on the whip; the landing slings him
                if (!flying) {
                    const nk = [post[0] - 0.36 * SC + 5 * f, post[1] - 1.72 * SC - 6 * f];
                    V.band(g, C.curve([nk, [(nk[0] + post[0]) / 2 - 8 * f, (nk[1] + post[1]) / 2], [post[0], post[1] - 3]], false, 6), 0.07 * SC, V.SCARF, V.STRIPE, 2.6);
                    V.dot(g, post[0], post[1], 0.1 * SC, V.SCARF, 2.6);
                    g.save();
                    g.translate(nk[0], nk[1]);
                    g.rotate(PI - 0.2 + 0.1 * f);
                    P.devil(g, 0, 0.95 * SC, SC, { mood: 'shock', look: 1, squash: -0.06, headTilt: -0.1, handL: [0.78, -1.0 - 0.22 * f], handR: [-0.76, -1.0 + 0.22 * f], step: f, tail: 0.25 * f, shadow: false }, { t, noTail: true });
                    g.restore();
                } else if (!landed('devil')) {
                    const [x, y, a, u] = devilFly();
                    g.save();
                    g.translate(x, y);
                    g.rotate(a);
                    P.devil(g, 0, 0.95 * SC, SC, { mood: 'shock', look: f, squash: -0.05, handL: [0.8, -1.1 - 0.2 * f], handR: [-0.8, -1.1 + 0.2 * f], step: f, tail: 0.3 * f, shadow: false }, { t, blow: 1.6 + 0.5 * f, nose: 1.2 });
                    g.restore();
                }
                for (const [x, y, r, key] of hits) V.hit(g, x, y, r, 'chorus3-hit' + key);
            },
        });
        g.restore();
    }

    // =========================================================================================
    // Shot 2 · «Lights», bar 95: the band never stopped. The house lights go and the follow spots
    // find the players one by one on the beats: Stan, Howie, Benmont, Mike, and Tom at the front.
    // =========================================================================================
    const SPOTS = [
        { who: 'stan', at: n(8), from: [200, 60], to: [266, 738], rx: 80, ry: 15, col: K.yellow },
        { who: 'howie', at: n(9), from: [600, 40], to: [396, 728], rx: 46, ry: 11, col: K.aqua },
        { who: 'ben', at: n(9) + 4 * FR, from: [340, 30], to: [462, 738], rx: 50, ry: 12, col: K.pink },
        { who: 'mike', at: n(10), from: [720, 40], to: [531, 728], rx: 46, ry: 11, col: K.aqua },
        { who: 'tom', at: n(11), from: [560, 20], to: [596, 738], rx: 58, ry: 13, col: K.white },
    ];
    function lights(g, t, env) {
        const Pu = S.pulseAt(t), pan = lerp(-92, 26, E.inOut(E.seg(t, T95, n(11) + 0.1)));
        const heat = stepsAt(t, [[T95, 0.1], [n(9), 0.2], [n(10), 0.32], [n(11), 0.42]]);
        const o = { view: 'stage', pan, heat, beatK: Pu.pulse * 0.6, hype: 0.04 * E.seg(t, n(10), T96), density: 1 };
        const pose = {};
        for (const sp of SPOTS) pose[sp.who] = { squash: (sp.who === 'stan' ? 0.03 : 0.045) * Pu.pulse + 0.1 * hitK(t, sp.at, [1, 0.5, 0.2, 0]) };
        house(g, t, o, {
            band: (Sg) => band(g, t, Sg.car, { bounce: 0.25 * Pu.pulse, pose }),
            mid: () => {
                P.dressing(g, t, { ...o, part: 'stage' });
                P.followSpots(g, env, o, SPOTS.map((sp) => ({ ...sp, on: S.pop(t, sp.at, 0.2) })), 1);
                // a glint off each one as the beam finds him
                const v = P.view(o);
                for (const sp of SPOTS) {
                    const k = hitK(t, sp.at, [0.6, 1, 0.6, 0.25]);
                    if (k > 0) C.sparkle(g, ...v.at([sp.to[0] + 30, sp.to[1] - (sp.who === 'stan' ? 150 : 178)]), (14 + 40 * k), { color: K.white, ink: K.ink, lw: 3, rot: 0.2 });
                }
            },
            over: () => P.dressing(g, t, { ...o, part: 'front' }),
        });
    }

    // =========================================================================================
    // Shots 3 and 5 · the pit, close: two of the front row, an imp with a cone for a hat and a
    // skeleton. Bar 96: the skeleton's foot starts to tap and the imp uncrosses his arms.
    // Bar 98: they look at each other, then both throw their mitts up.
    // =========================================================================================
    function pit(g, t, env) {
        const won = t >= T98 - EPS, Pu = S.pulseAt(t), d = C.drawing(t);
        let sk, im;
        if (!won) {
            // the taps: the toe comes down on each beat from the second one on
            const taps = [n(13), n(14), n(15), n(16)], next = taps.find((a) => t < a - EPS), last = [...taps].reverse().find((a) => t >= a - EPS);
            const lift = next != null && t >= next - 4 * FR - EPS ? (t >= next - 2 * FR - EPS ? 1 : 0.6) : 0;
            const seen = t >= n(14) - 2 * FR - EPS, free = t >= n(15) - EPS;
            sk = { hype: 0, tap: lift, tapHit: last != null ? kOf(t, last) : -1, headTilt: t >= n(13) - 2 * FR - EPS && t < n(15) ? -0.12 : 0, look: t >= n(13) - 2 * FR - EPS && t < n(15) ? -1 : 0, nod: t >= n(15) ? Pu.pulse : 0 };
            im = { hype: 0, crossed: !free, lids: free ? 0 : seen ? 0.25 : 0.5, look: free ? 0 : seen ? 1 : 0, lookDown: seen && !free, mood: free ? 'awe' : 'flat', drop: free ? hitK(t, n(15), [1, 0.5, 0.2, 0]) : 0 };
        } else {
            const eye = t >= n(21) - EPS && t < n(22) - EPS, up = t >= n(22) - EPS, h = up ? 0.6 + 0.4 * S.pop(t, n(22), 0.2) : 0;
            sk = { hype: h, tap: !up && Pu.since > 0.5 ? 1 : 0, tapHit: up ? -1 : kOf(t, b(Pu.k)), headTilt: eye ? -0.14 : 0, look: eye ? -1 : 0, nod: up ? 0 : Pu.pulse };
            im = { hype: h, crossed: false, lids: 0, look: eye ? 1 : 0, mood: up ? 'grin' : eye ? 'awe' : 'grin', nod: up ? 0 : Pu.pulse, coneHop: up ? t - n(22) : -1 };
        }
        P.pitShot(g, t, env, { heat: won ? 0.7 : 0.3, back: won ? (t >= n(22) - EPS ? 0.9 : 0.35) : 0.05, sk, im });
    }

    // =========================================================================================
    // Shot 4 · «Won over», bar 97: wide. Mitts go up on the beats, a wave runs through the pit,
    // the first foam tridents; the Devil, in his box, rubs his mitts: he has got them.
    // =========================================================================================
    function wonOver(g, t, env) {
        const Pu = S.pulseAt(t), d = C.drawing(t), f = d % 2 ? 1 : -1, ph = Pu.k + Pu.since;
        const hype = stepsAt(t, [[T97, 0.14], [n(17), 0.27], [n(18), 0.4], [n(19), 0.52]]), heat = stepsAt(t, [[T97, 0.5], [n(18), 0.6]]);
        const o = { view: 'wide', pan: lerp(-56, 36, E.seg(t, T97, T98)), heat, beatK: Pu.pulse, hype, density: 1, wave: lerp(-0.1, 1.1, E.seg(t, n(17), T98)) };
        house(g, t, o, {
            back: () => P.dressing(g, t, { ...o, part: 'back' }),
            box: (Sg) => inBox(g, t, Sg, {}, { mood: 'sly', look: -1, headTilt: 0.05, squash: 0.03 * Pu.pulse, tail: 0.06 * Math.sin(ph * PI), handR: [-0.2 + 0.05 * f, -0.84], handL: [0.16 - 0.05 * f, -0.8] }, { blow: 0.2 }),
            band: (Sg) => band(g, t, Sg.car, { bounce: 0.25 * Pu.pulse }),
            mid: () => {
                I.beams(g, t, { ...o, front: true });
                P.dressing(g, t, { ...o, part: 'stage' });
            },
            over: () => P.dressing(g, t, { ...o, part: 'front' }),
        });
    }

    // =========================================================================================
    // Shot 6 · «The box», bar 99: close on the Devil. He rubs his mitts; a foam trident sails up
    // past his rail from the pit; he looks down at his own crowd, his face falls, and he bangs
    // the rail with both mitts.
    // =========================================================================================
    const BOXV = { k: 2.4, cx: 872, cy: 368 };
    function boxShot(g, t, env) {
        const Pu = S.pulseAt(t), d = C.drawing(t), f = d % 2 ? 1 : -1, ph = Pu.k + Pu.since;
        const o = { view: BOXV, pan: 0, heat: 0.7, beatK: Pu.pulse, hype: 0.6, density: 1 };
        const tUp = n(25), tSee = n(26), bangs = [n(27), n(27) + 4 * FR], tGrabs = T100 - 2 * FR;
        const bang = bangs.reduce((a, at) => Math.max(a, hitK(t, at, [1, 0.6, 0.25])), 0), nextBang = bangs.find((at) => t < at - EPS && t >= at - 2 * FR - EPS);
        let pose, cold = { blow: 0.2 };
        if (t < tUp + 2 * FR - EPS) pose = { mood: 'sly', eyes: t < tUp - EPS ? 'shut' : 'open', look: -1, headTilt: 0.06, headDy: 0.02 * Pu.pulse, squash: 0.03 * Pu.pulse, tail: 0.07 * Math.sin(ph * PI), handR: [-0.2 + 0.06 * f, -0.84], handL: [0.16 - 0.06 * f, -0.8] };
        else if (t < tSee - EPS) pose = { mood: 'grin', look: -1, headTilt: -0.1 + 0.2 * E.seg(t, tUp + 2 * FR, tSee), tail: 0.02, ...I.BOX.rail };
        else if (t < bangs[0] - 2 * FR - EPS) pose = { mood: 'shock', look: -1, lean: -0.1, headTilt: -0.12, headDy: 0.05, squash: hitK(t, tSee, [-0.06, 0.03, 0]), tail: 0.25 * f, handR: [-0.7, -0.76], handL: [0.44, -0.76] }, cold = { blow: -0.6, nose: 1.15 };
        else if (t >= tGrabs - EPS) pose = { mood: 'angry', look: -1, squash: -0.03, tail: 0.3 * f, handR: [-0.34, -0.98], handL: [0.34, -0.96] }, cold = { blow: 0.9, nose: 1.2 }; // his mitts go to his scarf: the next shot tears it off
        else pose = { mood: 'angry', look: -1, lean: -0.05, headDy: 0.04 * bang, squash: 0.06 * bang, tail: 0.3 * f, step: f, handR: nextBang ? [-0.72, -1.5] : [-0.64, -0.76], handL: nextBang ? [0.66, -1.46] : [0.54, -0.76] }, cold = { blow: nextBang ? -1.2 : 0.8 * f, nose: 1.2 };
        I.venue(g, t, o);
        const Sg = I.stage(BOXV, 0);
        inBox(g, t, Sg, { shake: bang }, pose, cold);
        I.beams(g, t, { ...o, front: true });
        // the souvenir: a foam trident thrown up from the pit, turning, and back down
        const u = E.seg(t, tUp - 3 * FR, tSee + 2 * FR);
        if (u > 0 && u < 1) {
            const at = P.view(o).at([758 + 26 * u, 640 - 330 * Math.sin(PI * u)]);
            I.foamTrident(g, 3.2, at[0], at[1], 112, -0.5 + 5.2 * (Math.floor(u * 14) / 14));
        }
        // each bang: a star off the rail
        const kb = bangs.map((at) => kOf(t, at)).find((k) => k === 0);
        if (kb === 0) for (const hx of [-0.64, 0.54]) V.hit(g, Sg.box.x + hx * Sg.box.s, Sg.box.y - 0.9 * Sg.box.s, 56, 'chorus3-bang' + hx);
    }

    // =========================================================================================
    // Shot 7 · «Full heat», bars 100–101: wide, everybody hopping. The Devil tears his scarf off
    // and throws it down (the imp in the pit takes it on its mallet); on «runnin'»
    // the whole title slams onto the banner and holds.
    // =========================================================================================
    const tGrab = T100, tTear = n(29), tThrow = n(30), tCaught = n(31) + 2 * FR, tSlam = S.snap(S.TITLES[5][0]);
    function fullHeat(g, t, env) {
        const Pu = S.pulseAt(t), d = C.drawing(t), f = d % 2 ? 1 : -1;
        const hype = lerp(0.66, 0.8, E.seg(t, T100, n(29))), heat = lerp(0.72, 0.8, E.seg(t, T100, n(29)));
        const o = { view: 'wide', pan: 0, heat, beatK: Pu.pulse, hype, density: 1 };
        const slam = hitK(t, n(32), [1, -0.6, 0.3, 0]);
        const v = P.view(o), mal = P.malletTop(t, o);
        // the scarf in the air: from over his head down to the mallet
        const HOLD = [884 + 0.02 * SC, 440 - 2.36 * SC];
        g.save();
        g.translate(0, 10 * slam);
        house(g, t, o, {
            back: () => {
                P.title(g, t, { ...o, at: [0, 2, 4].map((k) => tSlam + k * FR), slam: true });
                P.dressing(g, t, { ...o, part: 'back' });
            },
            box: (Sg) => {
                let pose, cold = { nose: 1.15 };
                const stomp = Math.max(hitK(t, n(32), [1, 0.7, 0.4, 0.2]), 0.45);
                if (t < tTear - EPS) pose = { mood: 'angry', look: -1, squash: 0.04 * Pu.pulse, tail: 0.25 * f, handR: [-0.3, -0.96 + 0.03 * f], handL: [0.3, -0.94 - 0.03 * f], step: f }, cold = { blow: 0.9 * f, nose: 1.2 };
                else if (t < tThrow - EPS) pose = { mood: 'angry', look: -1, squash: -0.05, headDy: 0.02, tail: 0.3 * f, handR: [-0.72, -2.2 + 0.03 * f], handL: [0.74, -2.2 - 0.03 * f] }, cold = { scarf: false, nose: 1.2 };
                else if (t < tThrow + 4 * FR - EPS) pose = { mood: 'angry', look: -1, lean: -0.14, squash: 0.05, tail: 0.3, handR: [-0.86, -0.9], handL: [0.3, -0.72], step: 1 }, cold = { scarf: false, nose: 1.2 };
                else pose = { mood: 'angry', look: -1, squash: 0.05 * Pu.pulse + 0.05 * stomp * (f > 0 ? 1 : 0), tail: 0.28 * f, step: f, handR: [-0.72, -1.5 + 0.12 * f], handL: [0.68, -1.5 - 0.12 * f] }, cold = { scarf: false, nose: 1.2 };
                inBox(g, t, Sg, { shake: t >= tThrow + 4 * FR - EPS ? stomp : t < tTear ? 0.3 : 0 }, pose, cold);
                // torn off: taut over his head between his mitts
                if (t >= tTear - EPS && t < tThrow - EPS) {
                    const y = 440 - 2.2 * SC + 2 * f;
                    P.scarf(g, C.curve([[884 - 0.98 * SC, y + 16], [884 - 0.72 * SC, y - 2], [884, y - 9 - 3 * f], [884 + 0.74 * SC, y - 2], [884 + 1.0 * SC, y + 18]], false, 5), 0.07 * SC);
                }
            },
            band: (Sg) => band(g, t, Sg.car, { bounce: 0.3 * Pu.pulse + 0.6 * slam, pose: { stan: { crash: hitK(t, n(32)) } } }),
            mid: () => {
                I.beams(g, t, { ...o, front: true });
                P.dressing(g, t, { ...o, part: 'stage' });
            },
            over: () => {
                P.dressing(g, t, { ...o, part: 'front', scarf: t >= tCaught - EPS ? t - tCaught : null });
                // thrown: it sails down from his box, a wave running along it, onto the mallet
                if (t >= tThrow - EPS && t < tCaught - EPS) {
                    const u = seg2(t, tThrow, tCaught), c = [lerp(HOLD[0] - 60, mal[0], u), lerp(HOLD[1] + 40, mal[1] - 10, u * u) - 70 * Math.sin(PI * u)];
                    const a = -0.5 + 1.3 * u + 0.25 * f, len = 0.8 * SC;
                    P.scarf(g, C.curve([-1, -0.35, 0.35, 1].map((k, i) => [c[0] + Math.cos(a) * len * k - Math.sin(a) * 9 * f * (i % 2 ? 1 : -1), c[1] + Math.sin(a) * len * k + Math.cos(a) * 9 * f * (i % 2 ? 1 : -1)]), false, 5), 0.07 * SC);
                }
            },
        });
        g.restore();
    }

    function draw(g, t, env) {
        if (t < T95 - EPS) entrance(g, t, env);
        else if (t < T96 - EPS) lights(g, t, env);
        else if (t < T97 - EPS) pit(g, t, env);
        else if (t < T98 - EPS) wonOver(g, t, env);
        else if (t < T99 - EPS) pit(g, t, env);
        else if (t < T100 - EPS) boxShot(g, t, env);
        else fullHeat(g, t, env);
    }

    Seg.chorus3 = {
        shots: [[T0, T95, 'The entrance'], [T95, T96, 'Lights'], [T96, T97, 'A foot taps'], [T97, T98, 'Won over'], [T98, T99, 'Mitts up'], [T99, T100, 'The box'], [T100, T102, 'Full heat']],
        draw,
        post: (t) => ({ track: [0.25, 0.1][Math.round((t - T0) * 24)] ?? 0 }),
    };
})();
