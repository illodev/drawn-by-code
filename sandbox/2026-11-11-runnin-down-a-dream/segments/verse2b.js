// «Verse 2 · three days of rain», second part: bars 45–49 (63.92–70.96 s).
//   bar 45      The cloud grows   the block before's last shot goes on (the hearse and the
//                                 machine it tows, the band's tail at the right edge): the imp
//                                 cranks faster, every turn sends a puff up the funnel and the
//                                 cloud swells on the beat; it rains on the Devil first, he
//                                 conjures an umbrella; on the third beat the cloud's first fork
//                                 finds the trident stood beside him, he jumps, then cackles; the
//                                 hearse drops back and the cloud rolls on towards the band
//   bars 46–48  Three days        the band's car: the front crosses the frame from the left and
//                                 the colour drains out of the world behind it. One page of a
//                                 calendar a bar (MON, TUE, WED) flies past in the wind. Stan's
//                                 umbrella springs open on its cymbal stand; the first drop
//                                 bursts the sleeping cactus's bubble, it wakes with a start, the
//                                 canvas top comes up over it and latches on bar 48, the wipers
//                                 beat time; the band is soaked and plays on
//   bar 49      Unstoppable       the machine, closer: the Devil drops onto the running board,
//                                 knocks the imp into the funnel and cranks with both mitts, far
//                                 too fast: the needles hit the red, the valve whistles, rivets
//                                 pop, and on the last beat the first frost creeps over the dials
// Props and effects: segments/verse2b-props.js (V2B); the weather's own props: weather.js; the
// cactus at the wheel is verse2a's (Verse2aProps.cactus: chorus 1's, with arms that act).
(() => {
    const Seg = (window.Seg = window.Seg || {});
    const C = Cereal, K = C.COL, E = Ease, S = Song, W = Weather, V = V2B, VA = Verse2aProps, twos = S.twos, b = S.b, B = S.B, pop = S.pop, TAU = Math.PI * 2;
    const T45 = B(45), T46 = B(46), T49 = B(49), T50 = B(50);
    const n = (k) => b(180 + k); // beat k of the block (the kick on the even ones, the snare on the odd)
    const CAR = Rig.CAR, LANE = World.LANE, FAR = LANE - 53, FR = 1 / 24, BEAT = S.BEAT;
    const at = (t, a) => t >= a - 1e-6;
    const clamp = (v, a = 0, c = 1) => Math.max(a, Math.min(c, v));
    const seg2 = (t, a, c) => E.seg(twos(t, a), a, c); // 0..1 on twos, counted from a
    const bump2 = (t, a, dur = 0.3) => E.bump(twos(t, a), a, dur);
    const dAt = (t, a) => Math.floor((t - a) * 12 + 1e-6); // the drawing since a (negative before it)
    const rot = ([x, y], a) => [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)];
    // The road's near layer (World.front) plants a saguaro or a bush every second or so; at this
    // song's speed a saguaro would stand on the action in every beat of the block, so only the
    // low bushes pass. (The kind is the second draw of the cell's own generator, as in world.js.)
    const noCacti = (i) => {
        const r = Motion.rng('near:' + i);
        r();
        return r() < 0.45;
    };
    const SKY = { sun: { x: 170, y: 180, r: 70 }, moon: { x: 850, y: 150, r: 38 } }; // the film's day sky (by now the sun is leaving by the left edge)

    // --- the hearse, with a pulpit of our own (an umbrella goes behind the Devil's mitt) ---------
    /**
     * o: { spin, bounce, lean, flames, skel: a pose for the chauffeur,
     *      devil(g, px, py, sc): draws whoever stands on the pulpit, or null }
     */
    function hearse(g, t, x, y, s, o = {}) {
        const P = S.pulseAt(t);
        Rides.hearse(g, x, y, s, { spin: o.spin ?? 0, bounce: o.bounce ?? 0, lean: o.lean ?? 0, flames: o.flames ?? 0.4, t }, (g2, seats, sc0) => {
            if (o.devil) Rides.at(g2, sc0, seats.devil, (px, py, sc) => o.devil(g2, px, py, sc));
            Rides.at(g2, sc0, seats.chauffeur, (px, py, sc) => Rides.skeleton(g2, px, py, sc, { jaw: 0, headDy: 0.02 * P.pulse, shadow: false, ...(o.skel ?? {}) }));
        });
    }

    // --- the machine's own points (weather.js keeps its body's move to itself) -------------------
    // The sprung body sinks, pitches about the axle and rattles: the same move as Weather's, so
    // that what we add to its plates (a rivet's hole, the valve's jet) rides with them.
    const MACH = { axle: -0.3, R: 0.28, valve: [0.31, -2.13], mouth: [-0.18, -3.02], mouthR: 0.74 * 0.88 };
    const onBody = (p, o) => {
        const sh = clamp(o.shake ?? 0), d = C.drawing(o.t ?? 0);
        const dx = sh ? (d % 2 ? 1 : -1) * 0.014 * sh : 0, dy = (o.bounce ?? 0) * 0.06 + (sh ? [-1, 0.6, 0.1][((d % 3) + 3) % 3] * 0.014 * sh : 0);
        const q = rot([p[0] - MACH.axle, p[1] + MACH.R], o.pitch ?? 0);
        return [q[0] + MACH.axle + dx, q[1] - MACH.R + dy];
    };

    // --- the cactus at the wheel: chorus 1's, with the arms and the sleep verse 2 gave it ---------
    const SEATS = Rides.bandCarSeats();
    const ON_WHEEL = [SEATS.wheel[0] - SEATS.driver[0] - 0.07, SEATS.wheel[1] - SEATS.driver[1] + 0.02];
    // asleep on cruise control, exactly as the block before leaves it: leaning back, its arms
    // let go, its eyes shut behind the shades, a bubble at its mouth
    const DROOP = { armL: { pts: VA.bend([[-0.15, -1.0], [-0.4, -1.02], [-0.42, -0.64]]) }, armR: { pts: VA.bend([[0.15, -1.0], [0.36, -1.02], [0.33, -0.62]]) } };
    const asleep = (bubble) => ({ shades: 0, lean: -0.18, squash: 0.04, eyes: 'shut', mouth: 'sleep', bubble, ...DROOP });
    // the snore: the bubble swells over a beat and a half and sinks back over half a beat (from: a breath's start)
    const snoreAt = (t, from) => {
        const per = 2 * BEAT, u = ((((twos(t, from) - from) % per) + per) % per) / per;
        return u < 0.72 ? 0.12 + 0.88 * E.out(u / 0.72) : 0.12 + 0.88 * (1 - E.inOut((u - 0.72) / 0.28));
    };

    // =========================================================================================
    // Bar 45 · The cloud grows
    // =========================================================================================
    // The shot goes on from the block before (its «What is behind them»): the same framing, the
    // same sky, the hearse in the far lane with the machine on its hitch, the Devil rubbing his
    // mitts under the first cloud, his trident stood in the pulpit, the band's tail at the right.
    const A = { BX: 975, HX: 572 };
    // the cloud on each beat: [x, y (the middle of its belly), scale, grow]. The first is where
    // verse2a's cough leaves it hanging (HX − 207, 396), grow 0.24
    const HANG = [365, 396], COUGH = b(178);
    const LEVELS = [[HANG[0], HANG[1], 84, 0.24], [412, 334, 116, 0.56], [416, 186, 154, 0.82], [470, 296, 190, 1]];
    // where the trident's tines are, stood in the pulpit (the hearse at A.HX): the fork of beat 2 lands there
    const HS = Rides.hearseSeats().devil, TRIDENT = [(HS[0] - 0.5) * CAR, HS[1] * CAR], TINES = [TRIDENT[0] - 0.18 * CAR, TRIDENT[1] - 2.29 * CAR];
    const beatOf = (t) => (at(t, n(3)) ? 3 : at(t, n(2)) ? 2 : at(t, n(1)) ? 1 : 0);
    // mouth: the funnel's mouth on screen (only the first beat needs it: the cloud is still on its way up from it)
    function cloudAt(t, mouth = HANG) {
        const j = beatOf(t);
        if (j === 0) {
            // verse2a's own clock, carried on: the cough's cloud finishes its rise and comes to rest
            const since = t - COUGH, rise = E.out(E.seg(since, 0, 0.55)), wob = 1 - E.seg(since, 0.35, 0.65);
            return {
                x: E.lerp(mouth[0], HANG[0], rise * rise) + 6 * wob * Math.sin(since * 5), y: E.lerp(mouth[1] - 20, HANG[1], rise) + 5 * wob * Math.sin(since * 7),
                s: CAR, grow: 0.04 + 0.2 * E.out(E.seg(since, 0, 0.5)), j,
            };
        }
        const cur = LEVELS[j], prev = LEVELS[j - 1], u = pop(t, n(j), 0.25), drift = twos(t, n(j)) - n(j);
        const v = cur.map((c, i) => prev[i] + (c - prev[i]) * u);
        const c = { x: v[0] + 40 * drift, y: v[1] - 6 * drift, s: v[2] + 16 * drift, grow: clamp(v[3] + 0.08 * drift), j };
        if (j === 2) {
            // it rears up to throw its fork: it stands where the fork's tip (Weather's own bolt, from
            // its belly) comes down on the tines, whatever its size on that drawing
            const G = 0.22 + 0.78 * c.grow, len = (1.5 + 0.6 * c.grow) * G;
            c.x = A.HX + TINES[0] - (0.25 * G - 0.12 * len) * c.s;
            c.y = FAR + TINES[1] - (0.3 * G + len) * c.s;
        }
        return c;
    }
    const spring = (t, a, f = 17, damp = 6.5) => (t < a - 1e-6 ? 0 : Math.exp(-(t - a) * damp) * Math.cos((t - a) * f));
    // the imp's cranking: a turn a beat as it was, then faster and faster (the angle, on twos)
    // (verse2a's clock, counted from its bar 44, carried on: the cut does not move the handle)
    const crankA = (t) => {
        const tq = twos(t, T45), u = (tq - T45) / BEAT;
        return 0.6 + TAU * ((tq - B(44)) / BEAT + 0.075 * u * u);
    };
    const UMB = n(1) + 2 / 12; // two drawings of his own rain on his head, and he has an umbrella

    function cloudShot(g, t) {
        const X = Rig.X(t), Pu = S.pulseAt(t), ph = (t - b(Pu.k)) / BEAT, d = C.drawing(t);
        World.back(g, t, X, 'day', SKY);

        // --- the hearse in the far lane, the machine on its hitch, as verse2a leaves them (the
        // same clocks: the bounce, the crank, the last of the cough's spring). On the last beat
        // the chauffeur eases off: they drop back and let the cloud go on ahead
        const jb = beatOf(t), back = 250 * Math.pow(E.seg(t, n(3) - 2 * FR, T46 + 2 * FR), 2), hx = A.HX - back;
        const hb = 0.4 * Math.sin(ph * TAU), ho = { bounce: hb }, tw = W.towedAt(hx, FAR, CAR, ho);
        const crank = crankA(t), beatU = (t - n(jb)) / BEAT, feeding = jb < 3; // 0..1 through the beat
        // the needles climb while it is cranked and fall when the puff goes
        const mo = {
            towed: true, t, pitch: tw.pitch, spin: (X + hx) / (0.28 * CAR), crank, smoke: 0.7,
            bounce: 1.2 * spring(t, COUGH, 22, 8) + 0.25 * Math.sin((ph + 0.2) * TAU) * E.seg(t, T45, T45 + 0.3),
            needles: !feeding ? E.lerp(0.92, 1, E.seg(t, n(3), T46)) : beatU < 0.36 ? 0.92 + 0.06 * (beatU / 0.36) : E.lerp(0.62, 0.92, (beatU - 0.36) / 0.64),
            shake: 0.35 + 0.2 * E.seg(t, n(2), T46), puff: feeding && beatU < 0.36 ? beatU / 0.36 : 0,
        };
        const MP = W.machinePoints(mo), mouth = [tw.x + MP.mouth[0] * CAR, tw.y + MP.mouth[1] * CAR];

        // --- the cloud: it swells on every beat, when the funnel's puff gets to it
        const cl = cloudAt(t, mouth), G = 0.22 + 0.78 * cl.grow, half = (0.55 + 1.8 * cl.grow) * G * cl.s;
        const raining = at(t, n(1)), flashD = dAt(t, n(2));
        // where it rains: under its belly, slanted like the rain, and not yet on the band
        const y0 = cl.y + 0.2 * G * cl.s, wet = seg2(t, n(1), n(1) + 0.25), slant = 0.32 * (1010 - y0);
        const x0 = cl.x - half * 0.84, x1 = Math.min(cl.x + half * 0.84 * wet, 600 + 0.32 * (700 - y0));
        const under = [[x0, y0], [x1, y0], [x1 - slant, 1010], [x0 - slant, 1010]];
        if (raining) C.poly(g, under, { fill: 'rgba(67,73,102,0.36)', lw: 0 }); // its shadow of rain on the land behind the cars
        W.stormCloud(g, cl.x, cl.y, cl.s, { grow: cl.grow, t, rain: raining ? 0.8 : 0, fall: (760 - cl.y) / cl.s, flash: flashD >= 0 && flashD < 2 ? 1 : 0 });
        // the puff that leaves the funnel and feeds the cloud on the next beat
        const puffAt = n(jb) + 3 / 24;
        if (at(t, puffAt) && feeding) {
            const u = seg2(t, puffAt, n(jb + 1)), to = cloudAt(n(jb + 1) - FR);
            W.stormCloud(g, E.lerp(mouth[0] - 2, to.x - 30, u * u), E.lerp(mouth[1] + 4, to.y + 6, u), CAR, { grow: 0.05 + 0.2 * u, t });
        }
        W.machine(g, tw.x, tw.y, CAR, mo);
        // his trident, stood in the pulpit behind him: the cloud's first fork finds it
        const tx = hx + TRIDENT[0], ty = FAR + TRIDENT[1] + 0.1 * hb * CAR, forkAt = [hx + TINES[0], FAR + TINES[1] + 0.1 * hb * CAR];
        g.save();
        g.translate(tx, ty);
        g.scale(CAR, CAR);
        Devil.trident(g, 0, -0.5, 3.2 / CAR, { ang: -0.1, grip: 0.5 });
        g.restore();
        // the Devil on his pulpit. He is as verse2a leaves him, sly, rubbing his mitts at the cloud;
        // then the laugh breaks out of him: a drawing's crouch, and his mitts come up from his chest.
        // On beat 1 his own rain is on his head; two drawings and he has an umbrella; a start when
        // the fork lands beside him; then he cackles
        const open = at(t, UMB) ? Math.min(1, pop(t, UMB, 0.22)) : 0, lol = flashD >= 2, start = flashD >= 0 && flashD < 2;
        const gd = dAt(t, T45), crouch = !raining && gd === 1, glee = !raining && gd >= 2;
        const rub = d % 2 ? 1 : -1, jig = lol || glee ? rub : 0, caught = raining && !open;
        const pose = {
            mood: start ? 'shock' : caught ? 'angry' : lol || glee ? 'laugh' : open || crouch ? 'grin' : 'sly', look: start ? -1 : caught ? 0 : -1, trident: false,
            squash: start ? -0.07 : caught ? 0.07 : crouch ? 0.07 : lol || glee ? 0.035 * jig : 0.04 * Pu.pulse,
            headTilt: start || caught ? 0 : open && !lol ? -0.03 : -0.07 + 0.03 * jig, headDy: lol || glee ? -0.02 * (jig > 0) : 0,
            tail: start ? 0.3 : 0.04 * Math.sin((Pu.k + Pu.since) * Math.PI) + 0.12 * jig, step: start ? 1 : 0,
            handR: start ? [-0.8, -0.98] : caught ? [-0.6, -0.72] : lol || glee ? [-0.7, -1.02 + 0.05 * jig] : crouch ? [-0.4, -0.8] : open ? [-0.52, -0.56] : [-0.08 + 0.05 * rub, -0.68 - 0.035 * rub],
            handL: start ? [0.66, -0.98] : caught ? [0.6, -0.7] : open ? [0.6, -0.84] : glee ? [0.68, -1.0 - 0.05 * jig] : crouch ? [0.42, -0.78] : [0.1 - 0.05 * rub, -0.66 + 0.035 * rub],
        };
        hearse(g, t, hx, FAR, CAR, {
            spin: (X + hx) / (0.58 * CAR), ...ho, flames: 0.5,
            skel: lol ? { jaw: d % 2 ? 1 : 0.4, headTilt: -0.08 } : {},
            devil: (g2, px, py, sc) => {
                const q = pose.squash, ux = px + pose.handL[0] * (1 + q) * sc, uy = py + pose.handL[1] * (1 - q) * sc;
                const uo = { open, tilt: -0.2 + (lol ? 0.03 * jig : 0), color: K.magenta };
                if (open) W.umbrella(g2, ux, uy, sc, uo);
                Devil.draw(g2, px, py, sc, pose);
                if (caught) V.patter(g2, 1, t, [[px - 0.2 * sc, py - 1.98 * sc], [px + 0.22 * sc, py - 2.0 * sc], [px - 0.42 * sc, py - 1.0 * sc]], { size: 0.11 * sc, seed: 'devil', every: 2 });
                if (open >= 1) W.drips(g2, ux, uy, sc, t, 0, { pts: W.umbrellaTips(uo), len: 0.7 });
                // conjured: a twinkle where it came from
                const ud = dAt(t, UMB);
                if (ud >= 0 && ud < 3) C.sparkle(g2, ux + 0.42 * sc, uy - 1.5 * sc, [26, 34, 18][ud], { color: K.white, ink: K.ink, lw: 2.6, rot: 0.2 * ud });
            },
        });
        // the imp on the running board, a mitt on the handle
        const ci = W.crankImp(crank, 0.67, mo);
        Devil.imp(g, tw.x + ci.x * CAR, tw.y + ci.y * CAR, 0.67 * CAR, { armUp: ci.armUp, hop: ci.hop, squash: ci.squash, look: -1, shadow: false, wear: 'hat', mood: 'awe' });
        // the fork on the trident: a star on its tines, then a wisp of smoke off them
        if (flashD >= 0 && flashD < 3) C.burst(g, forkAt[0], forkAt[1], { r0: 16 + 6 * flashD, r1: 36 + 12 * flashD, n: 8, seed: 'v2b-strike', rot: flashD * 0.4, fill: flashD ? K.yellow : '#ffffff', ink: K.ink, lw: 3 });
        else if (flashD >= 3 && flashD < 9) {
            const u = (flashD - 3) / 6;
            V.puffs(g, [[forkAt[0] - 10 - 26 * u, forkAt[1] - 16 - 44 * u, (10 + 12 * u) * (u > 0.6 ? 1.6 - u : 1), 5, flashD * 0.8], [forkAt[0] - 4 - 12 * u, forkAt[1] - 6 - 20 * u, 8 * (1 - u), 5, flashD]], '#c9c3e6', 2.8);
        }

        // --- the band's car ahead of them, in the near lane: nobody has noticed
        Rig.band(g, t, A.BX, LANE, CAR, {
            spin: X / (0.56 * CAR), bounce: 0.5 * Math.sin(ph * TAU), exhaust: 0.5, sing: true, tomDrives: false,
            driver: (g2, sc) => VA.cactus(g2, 0, 0, sc, asleep(snoreAt(t, b(175)))),
        });

        // --- his own rain falls on him: in front of the hearse, under the cloud
        if (raining) {
            g.save();
            C.trace(g, under);
            g.clip();
            World.rain(g, t, 1);
            g.restore();
        }
    }

    // =========================================================================================
    // Bars 46–48 · Three days of rain
    // =========================================================================================
    const BX = 590, BASE = 480; // the car; the belly of the front's wall, clear of the car's top
    // the front: it is over the cactus just after beat 9 and has left the frame half way through bar 47's last beat
    const kNeed = (x, y) => (x + 320 - 0.32 * (500 - y)) / 1660; // Weather.frontX, turned round
    const CACTUS = [BX + 2.2 * CAR, 735], LAG = 2 / 12; // the first drop falls ahead of the sheet
    const KR = (1 - kNeed(...CACTUS)) / (n(11) + S.snap(BEAT / 2) - n(9)), K0 = kNeed(...CACTUS) - KR * (n(9) + LAG - T46);
    const kAt = (t) => clamp(K0 + KR * (t - T46));
    const wetAt = (x, y) => T46 + (kNeed(x, y) - K0) / KR; // when the edge gets to a point of the frame
    const WAKE = n(9), UP0 = n(12) - 11 / 12, LATCH = n(12), WIPE0 = n(12), BROLLY = n(8), SPARKS = [n(13), n(15)];
    // a point of the car on screen (its body sinks a tenth of a unit per unit of bounce)
    const carPt = (p, bn = 0) => [BX + p[0] * CAR, LANE + (p[1] + 0.1 * bn) * CAR];

    // The pages: each comes in at the right on its bar's first beat, hangs in the wind over the
    // car long enough to be read, and is gone by the left edge before the next bar.
    const PAGES = [
        { day: 'MON', from: n(4), to: n(8) - 2 * FR, y: 318, s: 124, seed: 1 },
        { day: 'TUE', from: n(8), to: n(12) - 2 * FR, y: 384, s: 118, seed: 2 },
        { day: 'WED', from: n(12), to: n(16) - 3 * FR, y: 300, s: 128, seed: 3 },
    ];
    function page(g, t, p) {
        if (!at(t, p.from) || t >= p.to) return;
        const u = (twos(t, p.from) - p.from) / (p.to - p.from), v = 2 * u - 1;
        // fast in, slow over the car, fast out
        const f = 0.5 + 0.5 * Math.sign(v) * Math.pow(Math.abs(v), 2.1), x = E.lerp(1120, -130, f);
        const y = p.y + 34 * Math.sin(u * 7 + p.seed * 2) - 60 * Math.pow(Math.abs(v), 3) * (p.seed % 2 ? 1 : -1);
        const flat = 1 - Math.pow(Math.abs(v), 1.6); // 1 while it hangs
        const rotA = (0.16 * Math.sin(u * 11 + p.seed) - 0.1) * (0.4 + 0.6 * flat) + (1 - flat) * (v < 0 ? 0.5 : -0.55);
        W.calendar(g, x, y, p.s, { day: p.day, rot: rotA, curl: 0.25 + 0.6 * Math.abs(Math.sin(u * 9 + p.seed * 1.3)) });
    }

    function rainShot(g, t) {
        const X = Rig.X(t), Pu = S.pulseAt(t), ph = (t - b(Pu.k)) / BEAT, d = C.drawing(t), k = kAt(t);
        const bn = 0.5 * Math.sin(ph * TAU) + 0.5 * bump2(t, LATCH, 0.22);
        W.split(g, k, () => {
            World.back(g, t, X, 'rain');
            V.puddles.draw(g, t, X);
        }, () => World.back(g, t, X, 'day', SKY));

        // --- the cactus: asleep until the first drop bursts its bubble
        const awake = at(t, WAKE), wd = dAt(t, WAKE);
        let cpose;
        if (!awake) cpose = asleep(snoreAt(t, WAKE - 0.72 * 2 * BEAT)); // the bubble is at its biggest when the drop comes
        else if (wd < 7) {
            // the start: it shoots up straight, its shades jump off its nose and come back down askew
            cpose = {
                shades: [0.26, 0.3, 0.2, 0.08, 0, 0, 0][wd], shadesTilt: [0.28, -0.2, 0.12, -0.05, 0, 0, 0][wd], eyes: 'open', mouth: 'oh',
                lean: [-0.08, -0.03, 0.02, 0, 0, 0, 0][wd], squash: [-0.16, -0.1, 0.05, -0.03, 0, 0, 0][wd],
                armL: { pts: VA.armUp(-1, wd % 2 ? 1 : -0.6) }, armR: { pts: VA.armUp(1, wd % 2 ? -1 : 0.6, -1.2, 0.44) },
            };
        } else cpose = { shades: 0, squash: 0.05 * Pu.pulse, armL: { pts: VA.armUp(-1, Pu.k % 2 ? Pu.pulse : -Pu.pulse * 0.6) }, armR: VA.armTo(ON_WHEEL), mouth: at(t, LATCH) ? 'smile' : 'oh' };
        const driver = (g2, sc) => {
            VA.cactus(g2, 0, 0, sc, cpose);
            if (awake && wd < 2) {
                g2.save();
                g2.scale(sc, sc);
                V.bubblePop(g2, sc, 0.2, VA.FACE_Y + 0.14, wd);
                g2.restore();
            }
        };
        const up = at(t, UP0) ? clamp((twos(t, UP0) - UP0) / (LATCH - UP0)) : 0;
        const tomWet = at(t, wetAt(...carPt([1.12, -2.5])));
        const sparkD = SPARKS.map((a) => dAt(t, a)).find((f) => f >= 0 && f < 4);
        const co = { spin: X / (0.56 * CAR), bounce: bn, lean: 0, exhaust: 0.45 };
        Rig.band(g, t, BX, LANE, CAR, {
            ...co, sing: true, tomDrives: false, driver,
            cockpit: { back: (g2, sc) => W.softTop(g2, sc, { up, part: 'back' }), front: (g2, sc) => W.softTop(g2, sc, { up, part: 'front' }) },
            pose: {
                tom: tomWet ? { headTilt: -0.1 - 0.03 * Pu.pulse } : {}, // he sings at the sky that is raining on him
                ben: sparkD != null ? { eyes: 'wide', headDy: -0.03 } : {},
            },
        });

        // --- on the car, over the band: Stan's umbrella on its stand, the wipers
        const kit = SEATS.kit, jaw = [kit[0] + 1.47, kit[1] - 0.98], socket = [kit[0] + 0.98, kit[1] - 1.34];
        // it shoots up out of its socket over two drawings, and springs open on the beat
        const bOpen = at(t, BROLLY) ? Math.min(1, pop(t, BROLLY, 0.22)) : 0, uo = { open: bOpen, tilt: -0.3 + 0.05 * bump2(t, BROLLY, 0.3), color: K.yellow };
        const upD = dAt(t, BROLLY - 2 / 12), out = upD < 0 ? 0 : [0.5, 0.82][upD] ?? 1;
        W.split(g, k, () => W.onBandCar(g, BX, LANE, CAR, co, (g2) => wet(g2, t, { part: 'stacks' })), null);
        W.onBandCar(g, BX, LANE, CAR, co, (g2) => {
            if (out > 0) Rides.at(g2, CAR, socket, (px, py, sc) => W.umbrella(g2, px, py, sc * out, uo));
            V.brollyClamp(g2, CAR, jaw, socket);
            if (at(t, WIPE0)) {
                // one sweep a beat: over on the kick, back on the snare
                const Pw = S.pulseAt(t), sw = Math.cos(Math.min(1, Pw.since * 1.25) * Math.PI) * (Pw.k % 2 ? -1 : 1);
                W.wipers(g2, CAR, 0.85 * sw);
            } else W.wipers(g2, CAR, 0.85);
        });
        const dBr = dAt(t, BROLLY);
        if (dBr >= 0 && dBr < 3) V.knock(g, ...carPt([socket[0] - 0.42, socket[1] - 1.9], bn), CAR, dBr, 0.5, 7);

        // --- what the rain does to them, behind the edge
        W.split(g, k, () => {
            // spray off the wheels, a sheet of it when one drives through a puddle
            for (const [wx, seed] of [[-3.55 - 0.084, 0], [3.55 - 0.084, 1]]) {
                const sx = BX + wx * CAR, into = V.puddles.hit(X, sx), f = into == null ? 9 : Math.floor((into / Rig.SPEED) * 12 + 1e-6);
                V.wheelSpray(g, sx, LANE + 5, CAR, t, 1, [1, 0.85, 0.5, 0.2][f] ?? 0, seed);
            }
            W.onBandCar(g, BX, LANE, CAR, co, (g2) => wet(g2, t, { up, tomTilt: tomWet ? -0.1 - 0.03 * Pu.pulse : 0, bOpen, uo, socket }));
        }, null);
        // the organ spits a spark
        SPARKS.forEach((a) => {
            const f = dAt(t, a), p = SEATS.deck[2];
            if (f >= 0 && f < 6) W.onBandCar(g, BX, LANE, CAR, co, (g2) => V.spark(g2, CAR, p[0] + 0.74, p[1] - 0.64, f, 0.3));
        });
        // the latch
        const dl = dAt(t, LATCH);
        if (dl >= 0 && dl < 3) V.knock(g, ...carPt([2.84, -1.86], bn), CAR, dl, 0.22, 5);
        W.split(g, k, () => World.rain(g, t, 1), null);
        W.front(g, t, k, { base: BASE });
        // the first drop, out of the wall's belly and down onto the cactus's bubble
        const dropD = dAt(t, WAKE - 3 / 12);
        if (dropD >= 0 && dropD < 3) {
            const [hx, hy] = carPt([2.16, -1.84], bn), off = (3 - dropD) * 62, x = hx + off * 0.32, y = hy - off;
            C.poly(g, C.curve([[x + 9, y - 44], [x + 13, y - 12], [x + 8, y + 2], [x - 3, y + 3], [x - 10, y - 8], [x - 2, y - 26]], true, 5), { fill: V.WATER.fill, ink: K.ink, lw: 2.8 });
            C.poly(g, [[x - 3, y - 6], [x + 1, y - 18]], { ink: '#ffffff', lw: 2.4, close: false });
        }
        PAGES.forEach((p) => page(g, t, p));
        W.split(g, k, () => World.front(g, t, X, 'rain', { skip: noCacti }), () => World.front(g, t, X, 'day', { skip: noCacti }));
    }

    // Everything the rain adds on the car, in the car's units (inside Weather.onBandCar): it is
    // clipped to the wet side of the edge by the caller.
    function wet(g, t, o) {
        const dk = SEATS.deckY, D = W.D;
        // the speakers: a sheet of water on the stacks, running over their front
        const top = dk - 3 * 0.88, a = [-4.3 + D[0] * 0.95, top + D[1] * 0.95], bb = [-4.3 + 1.72 + D[0] * 0.95, top + D[1] * 0.95];
        const full = seg2(t, wetAt(...carPt([-3.4, -3.5])), wetAt(...carPt([-3.4, -3.5])) + 0.5);
        // (its own pass, before Stan's umbrella: the stacks stand behind him, so the umbrella
        // must cover their water, never the other way round)
        if (o.part === 'stacks') {
            V.waterHat(g, CAR, t, a, bb, [D[0] * 0.5, D[1] * 0.5], full);
            W.drips(g, (a[0] + bb[0]) / 2, a[1] + 0.12, 1.5, t, 5, { w: 1.5 / 1.5, len: 0.5 });
            return;
        }
        // the deck: rain on the boards, water off its edge
        const boards = [];
        for (let i = 0; i < 9; i++) boards.push([-2.3 + i * 0.44 + (i % 2) * 0.1, dk - 0.02 - (i % 3) * 0.07]);
        V.patter(g, CAR, t, boards, { seed: 'deck', size: 0.08 });
        W.drips(g, -1.45, dk + 0.11, 1.5, t, 9, { w: 5.5 / 1.5, len: 0.36 });
        // the hood and the top
        V.patter(g, CAR, t, [[3.3, -1.16], [3.75, -1.1], [4.15, -1.04], [3.55, -1.3], [4.0, -1.24]], { seed: 'hood', size: 0.08 });
        W.drips(g, 3.7, -0.47, 1.5, t, 3, { w: 1.3 / 1.5, len: 0.3 });
        if (o.up > 0.9) {
            V.patter(g, CAR, t, [[1.75, -2.6], [2.1, -2.95], [2.5, -2.98], [2.75, -2.5]], { seed: 'top', size: 0.08 });
            W.drips(g, 2.36, -2.5, 1.5, t, 3, { w: 0.6 / 1.5, len: 0.45 });
        }
        // the band: rain on their heads and shoulders, water off the hair and down it
        const who = (p, fn) => {
            g.save();
            g.translate(p[0], p[1]);
            fn();
            g.restore();
        };
        const soaked = (seed, topY, hw, hemY, sh = 0.36) => {
            V.patter(g, CAR, t, [[-hw * 0.6, topY], [hw * 0.1, topY - 0.02], [hw * 0.75, topY + 0.01], [-sh - 0.06, -0.99], [sh + 0.08, -1.0]], { seed, size: 0.075 });
            V.runs(g, CAR, t, [[-hw + 0.07, topY + 0.3, 0.5], [hw - 0.05, topY + 0.22, 0.55], [-hw + 0.2, topY + 0.12, 0.3]], { seed });
            W.drips(g, 0, hemY, 1.5, t, 0, { pts: [[-hw / 1.5, 0], [hw / 1.5, 0.01]], len: 0.3 });
        };
        who(SEATS.deck[3], () => soaked('howie', -1.92, 0.52, -0.9));
        who(SEATS.deck[1], () => soaked('mike', -1.88, 0.44, -0.86));
        who(SEATS.deck[2], () => soaked('ben', -2.0, 0.6, -0.98));
        who(SEATS.deck[0], () => {
            g.rotate(o.tomTilt);
            soaked('tom', -1.9, 0.45, -0.82);
            // off his shades
            V.runs(g, CAR, t, [[-0.25, -1.24, 0.2], [0.26, -1.25, 0.22]], { seed: 'shades', lw: 2.6 });
            W.drips(g, 0, -1.02, 1.3, t, 0, { pts: [[-0.25 / 1.3, 0], [0.26 / 1.3, 0]], len: 0.16 });
        });
        // Stan stays dry: his umbrella takes it
        if (o.bOpen >= 1) {
            const tips = W.umbrellaTips(o.uo);
            W.drips(g, o.socket[0], o.socket[1], 1, t, 0, { pts: tips, len: 0.5 });
            V.patter(g, CAR, t, tips.slice(1, -1).map(([x, y]) => [o.socket[0] + x * 0.6 - 0.12, o.socket[1] + y - 0.38]), { seed: 'brolly', size: 0.08 });
        }
    }

    // =========================================================================================
    // Bar 49 · Unstoppable
    // =========================================================================================
    const CS = 176, MX = 408, GY = 900;
    const LAND = T49 + 2 / 12, PLUG = n(17), POPS = [[n(18), [-0.625, -1.735], [0.5, -3.2]], [n(18) + S.snap(BEAT / 2), [-1.105, -1.261], [-1.9, -2.3]], [n(19), [-0.175, -1.735], [-0.8, -3.4]], [n(19) + S.snap(BEAT / 2), [-0.925, -0.625], [-1.5, -1.6]]];
    // the handle's angle: the imp's steady turns, then the Devil's, faster with every drawing
    const crankC = (t) => {
        const tq = twos(t, T49);
        if (tq < LAND + 1 / 12 - 1e-6) return 2.2 + 9 * (tq - T49);
        const u = tq - (LAND + 1 / 12);
        return 2.2 + 9 * (LAND + 1 / 12 - T49) + 11 * u + 8.5 * u * u;
    };

    function crankShot(g, t) {
        const s = CS, z = s / CAR, X = Rig.X(t), Pu = S.pulseAt(t), ph = (t - b(Pu.k)) / BEAT, d = C.drawing(t);
        g.save();
        g.translate(MX, GY);
        g.scale(z, z);
        g.translate(-147, -FAR); // where the machine is in the wide shot
        World.back(g, t, X, 'rain');
        g.restore();
        // the cloud it has made, low over the funnel
        W.stormCloud(g, MX - 6, 226, s, { grow: 1, t });

        const landed = at(t, LAND), cranking = at(t, LAND + 1 / 12), plugged = at(t, PLUG);
        const ho = { bounce: 0.3 * Math.sin((ph + 0.5) * TAU), lean: 0 }, off = W.towedAt(0, 0, s, ho);
        const crank = crankC(t), shake = cranking ? 0.12 + 0.88 * E.seg(t, n(17), n(19)) : 0;
        const iced = at(t, n(19)) ? 0.3 * seg2(t, n(19), T50 - 2 / 12) : 0;
        const pumpU = cranking ? (((twos(t, LAND) - LAND) / (BEAT / 2)) % 1) : 0;
        const mo = {
            towed: true, t, pitch: off.pitch, spin: X / (0.28 * CAR), crank, shake, iced, smoke: 0.9,
            bounce: 0.25 * Math.sin((ph + 0.2) * TAU) + 0.9 * bump2(t, LAND, 0.25),
            needles: cranking ? E.lerp(0.5, 1, E.seg(t, LAND, n(18))) : 0.5, puff: plugged ? pumpU * 0.6 : pumpU,
        };
        const pt = (p) => {
            const q = onBody(p, mo);
            return [MX + q[0] * s, GY + q[1] * s];
        };
        W.machine(g, MX, GY, s, mo);
        hearse(g, t, MX - off.x, GY - off.y, s, { spin: X / (0.58 * CAR), ...ho, flames: 0.5 });
        V.wheelSpray(g, MX - 0.372 * s, GY + 0.05 * s, s, t, 0.8, 0, 2);

        // --- rivets out of the boiler's face, the valve's whistle
        const MPt = W.machinePoints(mo);
        V.whistle(g, ...pt(MACH.valve), s, t, E.seg(t, n(18) - 2 * FR, n(18) + 3 * FR));
        POPS.forEach(([a, p, dir]) => V.rivetPop(g, ...pt(p), s, t - a, dir));

        // --- the imp: at the crank, then knocked off the board and into the funnel
        const step = [MX + MPt.step[0] * s, GY + MPt.step[1] * s], hub = [MX + MPt.hub[0] * s, GY + MPt.hub[1] * s];
        const mouth = pt(MACH.mouth), IS = 0.67 * s;
        if (!landed) {
            const ci = W.crankImp(crank, 0.67, mo);
            Devil.imp(g, MX + ci.x * s, GY + ci.y * s, IS, { armUp: ci.armUp, hop: ci.hop, squash: ci.squash, look: 1, shadow: false, wear: 'hat', mood: 'oops' });
        } else if (!plugged) {
            // three drawings in the air, over the gearbox and the valve
            const ci = W.crankImp(crankC(LAND - FR), 0.67, mo), from = [MX + ci.x * s, GY + ci.y * s], f = dAt(t, LAND), u = [0.22, 0.55, 0.86][Math.min(2, f)];
            const x = E.lerp(from[0], mouth[0], u), y = E.lerp(from[1], mouth[1] + 0.2 * s, u) - 0.95 * s * Math.sin(u * Math.PI);
            // the way it came
            g.setLineDash([14, 12]);
            C.poly(g, Array.from({ length: 9 }, (_, i) => {
                const v = (u * i) / 8 * 0.86;
                return [E.lerp(from[0], mouth[0], v), E.lerp(from[1], mouth[1] + 0.2 * s, v) - 0.95 * s * Math.sin(v * Math.PI) - 0.34 * s];
            }), { ink: K.ink, lw: 3.2, close: false });
            g.setLineDash([]);
            g.save();
            g.translate(x, y - 0.34 * s);
            g.rotate(-1.1 - 1.7 * f);
            Devil.imp(g, 0, 0.34 * s, IS, { armUp: 1, squash: -0.08, look: -1, shadow: false, wear: 'hat', mood: 'awe', tail: 0.2 });
            g.restore();
        } else {
            // in the funnel's mouth, up to its middle: every stroke of the pump bounces it
            const f = dAt(t, PLUG), bob = (f < 2 ? [0.2, 0.08][f] : 0.1 * Math.max(0, Math.sin(pumpU * Math.PI))) * s, shiver = iced > 0 ? (d % 2 ? 3 : -3) : 0;
            g.save();
            g.beginPath();
            g.moveTo(mouth[0] - 2 * s, mouth[1] - 3 * s);
            for (let i = 0; i <= 16; i++) {
                const a = Math.PI + (i / 16) * Math.PI, r = MACH.mouthR * s;
                g.lineTo(mouth[0] + Math.cos(a) * r + W.D[0] * Math.sin(a) * r, mouth[1] + W.D[1] * Math.sin(a) * r);
            }
            g.lineTo(mouth[0] + 2 * s, mouth[1] - 3 * s);
            g.closePath();
            g.clip();
            // the steam that gets past it
            if (pumpU > 0.55) V.puffs(g, [[mouth[0] - 0.5 * s, mouth[1] - 0.02 * s, 0.14 * s, 5, d], [mouth[0] + 0.5 * s, mouth[1] - 0.04 * s, 0.12 * s, 5, d + 2]], '#fffdf4', 2.8);
            Devil.imp(g, mouth[0] + shiver, mouth[1] + 0.52 * IS - bob, IS, { armUp: iced > 0 ? 0 : 0.55 + 0.45 * (d % 2), squash: f < 2 ? [0.16, -0.06][f] : 0, look: 1, shadow: false, wear: 'hat', mood: f < 4 ? 'awe' : 'oops', tail: 0 });
            g.restore();
            if (f < 3) V.knock(g, mouth[0], mouth[1] - 0.05 * s, s, f, 0.62, 8);
            if (iced > 0.08) W.breath(g, mouth[0] + 0.2 * IS, mouth[1] - 0.2 * IS - bob, IS, t, 1);
        }

        // --- the Devil: down onto the board, then both mitts on the handle
        const fx = step[0] + (landed && dAt(t, LAND) >= 1 ? 0.34 : 0.2) * s, fy = step[1];
        if (!landed) {
            const f = dAt(t, T49), drop = [[0.42, -1.05], [0.18, -0.42]][Math.min(1, f)];
            Devil.draw(g, fx + drop[0] * s, fy + drop[1] * s, s, { mood: 'laugh', look: -1, shadow: false, lean: -0.22, squash: -0.06, step: 1, tail: 0.3, handR: [-0.8, -1.25], handL: [0.72, -1.3] });
        } else {
            const f = dAt(t, LAND), h = W.machinePoints(mo).handle(crank), hs = [MX + h[0] * s, GY + h[1] * s];
            const beatOdd = Pu.k % 2 === 1, jig = d % 2 ? 1 : -1;
            const q = f < 3 ? [0.2, 0.1, -0.03][f] : 0.03 * jig, lean = cranking ? -0.1 - 0.03 * Math.cos(crank) : -0.05;
            // a point of the frame in his own units, whatever his lean and squash
            const mine = (p) => {
                const r = rot([(p[0] - fx) / s, (p[1] - fy) / s], -lean);
                return [r[0] / (1 + q), r[1] / (1 - q)];
            };
            const grip = mine(hs), mood = at(t, n(19)) || !beatOdd ? 'grin' : 'laugh';
            // the handle's whirl, behind him: his mitts and sleeves stay clean
            if (cranking) V.whirl(g, hub[0], hub[1], s, crank, 0.26, E.seg(t, LAND + 0.2, n(18)));
            Devil.draw(g, fx, fy, s, {
                mood, look: -1, shadow: false, lean, squash: q, headTilt: 0.05 * jig * (cranking ? 1 : 0), headDy: 0.02 * (jig > 0),
                tail: 0.16 * jig, step: cranking ? jig * 0.6 : 0,
                handR: cranking ? grip : [-0.85, -1.05], handL: cranking ? [grip[0] + 0.1, grip[1] + 0.085] : [0.8, -1.1],
            });
            // soaked and delighted: his own rain runs off his horns and his elbows
            g.save();
            g.translate(fx, fy);
            g.rotate(lean);
            W.drips(g, 0, 0, s, t, 0, { pts: [[-0.47, -2.02], [0.47, -2.0], [-0.52, -1.18], [0.5, -1.2], [0.36, -0.42]], len: 0.5 });
            g.restore();
            if (f < 3) V.knock(g, fx, fy + 0.02 * s, s, f, 0.6, 6);
            if (iced > 0.05) W.breath(g, fx - 0.62 * s, fy - 1.0 * s, s, t + 0.3, -1);
        }
        // the first frost: a glint on each dial as it takes
        const fd = dAt(t, n(19));
        if (fd >= 0 && fd < 5) {
            const tw = [0.6, 1, 0.8, 0.5, 0.25][fd];
            C.sparkle(g, ...pt([-0.9, -1.48]), 30 * tw, { color: '#ffffff', ink: W.ICE.line, lw: 2.4 });
            C.sparkle(g, ...pt([-0.2, -1.5]), 22 * tw, { color: '#ffffff', ink: W.ICE.line, lw: 2.4, rot: 0.3 });
        }
        World.rain(g, t, 1.15);
    }

    function draw(g, t, env) {
        if (t < T46 - 1e-6) cloudShot(g, t);
        else if (t < T49 - 1e-6) rainShot(g, t);
        else crankShot(g, t);
    }

    Seg.verse2b = {
        shots: [[T45, T46, 'The cloud grows'], [T46, T49, 'Three days of rain'], [T49, T50, 'Unstoppable']],
        draw,
        post: () => ({}),
    };
})();
