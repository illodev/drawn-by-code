// Verse 3a, bars 78–84 (110.5–120.375 s): «The sky grew dark, I put the pedal down to make
// some time». The tape locks back in on the road at the end of the day: the sun waves,
// takes the ring of a blind and pulls the night down the sky as it sinks; the land goes dark
// when the hem lands, the full moon comes up behind the car and the headlights click on.
// Closer: the cactus at the wheel, who has no feet, drops the plant pot he stands in onto a
// pedal as big as a door, and the car answers (the speedometer jumps out of the cowl and its
// needle goes round past the end of the dial, the pipes spit fire, everything smears forward
// and then everything that can bend is pinned back). Wide: the car streaks through the night
// knocking roadside clocks off their posts, the camera runs ahead to the Devil's work site
// (he has a cold: one sneeze), and the car tears past it without anybody looking.
// Props: segments/verse3a-props.js (Verse3aProps); the cactus is Chorus1Props.cactus.
(() => {
    const Seg = (window.Seg = window.Seg || {});
    const C = Cereal, K = C.COL, E = Ease, S = Song, P = Verse3aProps, Q = Chorus1Props, twos = S.twos, b = S.b, B = S.B;
    const T0 = B(78), T80 = B(80), T81 = B(81), T83 = B(83), T85 = B(85);
    const n = (k) => b(312 + k); // beat k of the block (bar 78 starts on beat 312)
    const SC = Rig.CAR, LANE = World.LANE, HOR = World.HOR, ROAD0 = World.ROAD0, FR = 1 / 24, EPS = 1e-6;
    const lerp = E.lerp;
    const rot = ([x, y], a) => [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)];
    const seg2 = (t, a, c) => E.seg(twos(t, a), a, c); // 0..1 on twos, counted from a
    const dr = (t, a) => Math.floor((t - a) * 12 + 1e-6); // drawings since a (negative before it)
    const step = (t, a, list, rest = 0) => (t < a - EPS ? rest : list[dr(t, a)] ?? rest); // a per-drawing table from a
    const spring = (t, a, f = 17, damp = 6.5) => (t < a - EPS ? 0 : Math.exp(-(t - a) * damp) * Math.cos((t - a) * f));

    // --- the road's clock --------------------------------------------------------------------
    // Verse 1's clock (Rig.X) until «down»; from there the car gathers speed for half a second
    // and then runs at twice the road's speed. XR is the distance the CAR has driven; in the
    // travelling shots the camera rides with it, so it is also what the world is drawn at.
    const T_DOWN = n(13); // «down», 115.08
    const boost = (t) => {
        const u = t - T_DOWN;
        return u <= 0 ? 0 : u < 0.5 ? Rig.SPEED * u * u : Rig.SPEED * (u - 0.25);
    };
    const XR = (t) => Rig.X(t) + boost(t);

    // --- the sky -----------------------------------------------------------------------------
    // The sun and the moon are always given to World.back, parked far below the frame when they
    // are not up, so the clouds keep off the same two places from the first frame to the last
    // (a cloud never pops in when one of them moves).
    const OFF = 4000, SUN_X = 165 + 0.004 * XR(T0), MOON_X = 720 + 0.006 * XR(T80), MOON = { y: 270, r: 170 };
    const sky = (o = {}) => ({ sun: { x: SUN_X, y: o.sun ?? OFF, r: 70 }, moon: { x: o.moonX ?? MOON_X, y: o.moon ?? OFF, r: o.moonR ?? MOON.r }, stars: o.stars ?? 0 });
    // the day's land without its sky: drawn over the blind, which hangs behind the mesas
    const LAND = 'verse3a:day-land';
    World.THEMES[LAND] = World.THEMES[LAND] ?? { ...World.THEMES.day, skyA: 'rgba(0,0,0,0)', skyB: 'rgba(0,0,0,0)' };

    // What passes in front of the cars (World.front), minus whatever would cross one of the
    // moments in `keep` ([from, to] in film time) on a camera that is at cam(t) on the road.
    const nearX = (i, X) => i * 1900 + Motion.rng('near:' + i)() * 1900 * 0.6 - X * 1.6;
    const front = (g, t, cam, theme, keep) => World.front(g, t, cam(t), theme, { skip: (i) => keep.some(([a, c]) => nearX(i, cam(a)) > -420 && nearX(i, cam(c)) < 1420) });

    // --- the band on its car -------------------------------------------------------------------
    const SEATS = Rides.bandCarSeats(), SEAT = SEATS.driver;
    const ON_WHEEL = [SEATS.wheel[0] - SEAT[0] - 0.07, SEATS.wheel[1] - SEAT[1] + 0.02];
    // in the car's own units, over or under it (bn: the bounce it was drawn with)
    function inCar(g, x, y, s, bn, fn) {
        g.save();
        g.translate(x, y);
        g.scale(s, s);
        g.translate(0, bn * 0.1);
        g.lineJoin = 'round';
        g.lineCap = 'round';
        fn(3.2 / s);
        g.restore();
    }
    // the cactus in its pot at the wheel. o: { hop (figure units off the floor), pose }
    function cactus(g, s, o = {}) {
        const x = SEAT[0] * s, y = (SEAT[1] - 0.01 - (o.hop ?? 0)) * s, pot = (fn) => {
            g.save();
            g.translate(x, y);
            g.scale(s, s);
            g.lineJoin = 'round';
            fn(g, 3.2 / s);
            g.restore();
        };
        pot(P.potBack);
        Q.cactus(g, x, y, s, o.pose ?? {});
        pot(P.potFront);
    }
    // the cactus keeping the beat, a branch on the wheel
    const driving = (t, o = {}) => {
        const Pu = S.pulseAt(t);
        return { shades: 1, squash: 0.05 * Pu.pulse, wave: Pu.k % 2 ? Pu.pulse : -Pu.pulse * 0.6, wheel: ON_WHEEL, mouth: 'smile', ...o };
    };
    /**
     * The band playing on the car (Tom up front, the cactus driving), as Rig.band draws it, plus
     * what this block adds. o: { bounce, exhaust, pose: { tom: …, … } overrides,
     *   driver: { hop, pose } the cactus,  wind (0..1: hair and cymbals laid back),
     *   pinned (true: the pennant flat out),  speedo: a pose for P.speedo or null }
     */
    function band(g, t, x, y, s, o = {}) {
        const d = C.drawing(t), w = o.wind ?? 0, fl = d % 2 ? 0.03 : -0.02, bn = o.bounce ?? 0;
        const pz = Rig.playing(t, { sing: true }), ov = o.pose ?? {};
        const pose = (who) => ({ ...pz[who], ...(w > 0 ? { sway: (P.SWAY[who] + fl) * w } : {}), ...(ov[who] ?? {}) });
        const draw = () => Rides.bandCar(g, x, y, s, { spin: XR(t) / (0.56 * SC), bounce: bn, exhaust: o.exhaust ?? 0.6, t }, (g2, seats, sc0) => {
            const put = (p, who, fn) => Rides.at(g2, sc0, p, (px, py, sc) => {
                const ps = pose(who);
                fn(g2, px, py, sc, ps);
                P.windHair(g2, who, px, py, sc, ps, d, w);
            });
            P.cymbalsBack(w, d, () => put(seats.kit, 'stan', BandRhythm.stan));
            put(seats.deck[3], 'howie', BandStrings.howie);
            put(seats.deck[1], 'mike', BandStrings.mike);
            put(seats.deck[2], 'ben', BandRhythm.benmont);
            put(seats.deck[0], 'tom', Cast.tom);
            if (o.speedo) P.speedo(g2, 3.2 / sc0, o.speedo);
            Rides.at(g2, sc0, [0, 0], (px, py, sc) => cactus(g2, sc, o.driver ?? { pose: driving(t) }));
        });
        if (o.pinned) {
            g.save();
            P.pennantClip(g, x, y, s, bn);
            draw();
            g.restore();
            inCar(g, x, y, s, bn, (L) => P.pennant(g, L, d));
        } else draw();
    }
    // The afterburner at the two pipes of a car drawn at (x, y, s). k: 0..1.x its length.
    const PIPES = [[-4.66, -0.84], [-4.795, -0.75]]; // the far pipe's mouth, the near one's
    function burner(g, t, x, y, s, bn, k) {
        if (k <= 0) return;
        const d = C.drawing(t);
        PIPES.forEach(([px, py], j) => {
            const mx = x + px * s, my = y + (py + 0.1 * bn) * s;
            // a collar of fire round the mouth, then the jet
            g.save();
            g.translate(mx + 0.06 * s, my);
            g.rotate(-Math.PI / 2 - 0.12);
            Fx.flame(g, 0, 0, (0.62 + 0.1 * j) * s * Math.min(1.1, k), d, j * 2);
            g.restore();
            P.jet(g, mx - 0.02 * s, my, Math.PI + 0.1, (j ? 2.5 : 2.05) * s * k, (j ? 0.36 : 0.3) * s, d, j);
        });
    }

    // =========================================================================================
    // Shot 1 · «Dusk», bars 78–80: the sun pulls the night down; the moon; the headlights
    // =========================================================================================
    const T_WAVE = n(1), T_RING = n(2), T_GRAB = n(3), T_PULL = n(3) + 5 * FR, T_LAND = n(6), T_LIGHTS = n(9);
    const T_CROUCH = n(11), T_LEAP = n(11) + 4 * FR, T_STAMP = T81 + 5 * FR, HOP = 0.8;
    // how high the cactus is off the floor: up through the cut, down onto the pedal
    const hopAt = (t) => (t < T_LEAP - EPS ? 0 : t < T81 + FR - EPS ? HOP * E.out(E.seg(t, T_LEAP, T81 + FR)) : HOP * (1 - Math.pow(E.seg(t, T81 + FR, T_STAMP), 2)));
    function duskWorld(g, t) {
        const X = XR(t), d = C.drawing(t);
        if (t >= T_LAND - EPS) {
            // the blind is down: night. The moon comes up from behind the land and settles on the bar
            const up = E.back(E.seg(t, T_LAND + 2 * FR, T80));
            World.back(g, t, X, 'night', sky({ moon: lerp(MOON.y + 640, MOON.y, up), stars: step(t, T_LAND, [1.5, 1.25], 1) }));
            return;
        }
        const pull = E.seg(t, T_PULL, T_LAND), drop = 724 * Math.pow(pull, 1.7);
        const ringY = lerp(-70, 92, E.back(E.seg(t, T_RING, T_RING + 0.25))) + drop, hem = ringY - 126, sunY = 190 + drop;
        const c = [SUN_X - 0.004 * X, sunY + (d % 4 < 2 ? 0 : 3)], ring = [c[0] + 100, ringY];
        World.back(g, t, X, 'day', sky({ sun: sunY }));
        if (hem > -24) {
            g.save();
            g.beginPath();
            g.rect(-20, -20, 1040, hem + 20 - 12);
            g.clip();
            World.back(g, t, X, 'night', sky({ stars: 1 }));
            g.restore();
        }
        P.blindHem(g, hem, ring[0], ring[1]);
        // its arm: out with a wave, up to the ring, and down with it
        const out = S.pop(t, T_WAVE, 0.25);
        if (out > 0) {
            const wave = [-0.42, -1.0][((dr(t, T_WAVE) % 2) + 2) % 2], reach = seg2(t, T_GRAB - 4 * FR, T_GRAB);
            const waving = [c[0] + Math.cos(wave) * 122 * out, c[1] + Math.sin(wave) * 122 * out];
            P.sunArm(g, c, 70, reach > 0 ? E.lerpPt(waving, [ring[0] - 3, ring[1] + 19], reach) : waving);
        }
        // the land stands in front of the blind, the sun's arm and the cord
        if (pull > 0) World.back(g, t, X, LAND, sky());
    }
    function dusk(g, t, env) {
        const Pu = S.pulseAt(t), bn = 0.2 * Pu.pulse;
        g.save();
        g.translate(0, step(t, T_LAND, [7, -3]));
        duskWorld(g, t);
        g.restore();
        // the camera gets a little ahead of the car, to see where its lamps will point
        const cx = 540 - 104 * E.inOut(E.seg(t, T80 - 6 * FR, T_LIGHTS - 2 * FR));
        const lit = t >= T_LIGHTS - EPS, hop = hopAt(t), air = hop > 0.01;
        if (lit) inCar(g, cx, LANE, SC, bn, (L) => P.beams(g, L, t, S.pop(t, T_LIGHTS, 0.25)));
        const crouch = t >= T_CROUCH - EPS && !air ? 0.24 * Math.sin(Math.min(1, (t - T_CROUCH) / (T_LEAP - T_CROUCH) + 0.3) * Math.PI * 0.8) : 0;
        band(g, t, cx, LANE, SC, {
            bounce: bn + (crouch ? 0.5 : 0) - (air ? 0.4 : 0),
            driver: { hop, pose: air ? driving(t, { squash: -0.12, wheel: null, mouth: 'oh', wave: 1 }) : driving(t, crouch ? { squash: crouch, mouth: 'oh' } : {}) },
        });
        if (lit) inCar(g, cx, LANE, SC, bn, (L) => P.lamps(g, L, 1 + step(t, T_LIGHTS, [1, 0.5])));
        front(g, t, XR, t < T_LAND - EPS ? 'day' : 'night', [[T_PULL, T_LAND + 0.1], [T80 - 0.2, T80 + 0.2], [T_LIGHTS - 0.15, T81]]);
    }

    // =========================================================================================
    // Shot 2 · «Pedal», bars 81–82: the pot comes down on the pedal; the car answers
    // =========================================================================================
    const S2 = 150, CX2 = 298, GY2 = 890, Z2 = S2 / SC;
    const SMEAR0 = T_DOWN + 2 * FR, LAG0 = T_DOWN + 6 * FR, LAG1 = LAG0 + 10 * FR, RET0 = n(16) + 2 * FR, RET1 = n(18);
    // what the speedometer shows from «down» on
    function speedoAt(t) {
        if (t < T_DOWN - EPS) return null;
        const k = dr(t, T_DOWN), up = S.pop(t, T_DOWN, 0.25);
        if (k === 0) return { up, needle: 0.1 };
        if (k === 1) return { up, needle: 1.0, ghosts: [0.26, 0.48, 0.68, 0.86] };
        if (k === 2) return { up, needle: 1.4, ghosts: [1.1, 1.2, 1.3], peg: true, bend: -0.1 };
        const a = 1.4 + (k - 2) * 0.47;
        return { up: 1, needle: a, ghosts: [a - 0.33, a - 0.22, a - 0.11], peg: true, bend: -0.24 + (k % 2 ? 0.035 : -0.03) };
    }
    const windAt = (t) => step(t, T_DOWN, [0, 0.45, 0.8], t < T_DOWN ? 0 : 1);
    const burnAt = (t) => step(t, T_DOWN, [0.7, 1.3, 1.12], t < T_DOWN ? 0 : 1);
    function pedal(g, t, env) {
        const d = C.drawing(t), Pu = S.pulseAt(t), kd = t < T_DOWN - EPS ? -1 : dr(t, T_DOWN);
        // the car leaps ahead of the camera, which catches it up again along the deck
        const lag = 750 * E.out(E.seg(t, LAG0, LAG1)) - 30 * E.seg(t, LAG1, RET0) - 708 * E.inOut(E.seg(t, RET0, RET1));
        const cx = CX2 + lag, jolt = step(t, T_STAMP, [9, -4]) + step(t, T_DOWN, [-6, 3]);
        g.save();
        g.translate(0, jolt);
        // the night, closer: the moon low behind the car
        g.save();
        g.translate(CX2, GY2);
        g.scale(Z2, Z2);
        g.translate(-520, -LANE);
        World.back(g, t, XR(t) - lag / Z2, 'night', sky({ moonX: 716 + 0.006 * XR(T81), moon: 512, moonR: 118, stars: 1 }));
        g.restore();
        if (kd >= 0) P.speedLines(g, t, { n: 11, seed: 'v3a-lines2', y0: 40, y1: 500, k: kd < 1 ? 0.6 : 1.5 });
        // the cactus: in the air on the cut, down on the pedal, then holding on
        const hop = hopAt(t), air = t < T_STAMP - EPS, rest = P.pedalTop(SEAT[0], 0) - P.pedalTop(SEAT[0], 1);
        const press = air ? Math.max(0, 1 - hop / -rest) : 1; // the pot meets the slab `-rest` above the floor
        const land = step(t, T_STAMP, [0.22, 0.12, 0.05]);
        const pose = air ? driving(t, { squash: -0.12, wheel: null, mouth: 'oh', wave: d % 2 ? 1 : -0.4 })
            : kd < 0 ? driving(t, { squash: 0.05 * Pu.pulse + land, mouth: 'oh' })
                : driving(t, { squash: 0.03 * Pu.pulse, lean: step(t, T_DOWN, [-0.03, -0.1, -0.16], -0.11) + (d % 2 ? 0.012 : 0), mouth: kd < 8 ? 'oh' : 'smile', wave: d % 2 ? -1 : -0.7 });
        const driver = { hop, pose };
        const bn = 0.2 * Pu.pulse + 1.0 * spring(t, T_STAMP, 21, 9) + step(t, T_DOWN, [0.5, -0.5, -0.3]);
        const w = windAt(t), burn = burnAt(t);
        // the smear: two drawings stretched back from the windshield
        const sm = kd === 1 ? [1.34, 0.94] : kd === 2 ? [1.14, 0.975] : null;
        g.save();
        if (sm) {
            g.translate(cx + 3.0 * S2, GY2);
            g.scale(sm[0], sm[1]);
            g.translate(-(cx + 3.0 * S2), -GY2);
        }
        inCar(g, cx, GY2, S2, bn, (L) => P.beams(g, L, t, 1));
        band(g, t, cx, GY2, S2, { bounce: bn, exhaust: kd >= 0 ? 1 : 0.6, wind: w, pinned: kd >= 1, speedo: speedoAt(t), driver });
        inCar(g, cx, GY2, S2, bn, (L) => {
            P.lamps(g, L, 1);
            // the window in the door: open on the cut, gone when the car goes
            const win = kd < 0 ? step(t, T81, [0.86, 1.07], 1) : 0;
            P.footwell(g, L, win, press, step(t, T_STAMP, [1, 0.5]), () => {
                g.save();
                g.scale(1 / S2, 1 / S2);
                cactus(g, S2, driver);
                g.restore();
            }, d);
        });
        burner(g, t, cx, GY2, S2, bn, burn * 0.72);
        g.restore();
        g.restore();
    }

    // =========================================================================================
    // Shot 3 · «Time», bars 83–84: the car streaks through the night and past the work site
    // =========================================================================================
    const CX3 = 600, T_PASS = n(27), V_END = 200, WHIP0 = n(23) + 3 * FR, WHIP1 = n(25) - 2 * FR, T_CHOO = n(26), T_RIP = T_PASS - 3 * FR, T_LAST = T85 - FR;
    // The camera's place on the road. Bar 83: with the car. Then it runs ahead and all but stops
    // at the work site, and the car comes through: its middle is at x = 540 on T_PASS.
    const camEnd = (t) => XR(T_PASS) + CX3 - 540 + V_END * (t - T_PASS);
    function cam3(t) {
        if (t < WHIP0) return XR(t);
        if (t >= WHIP1) return camEnd(t);
        const h = WHIP1 - WHIP0, u = (t - WHIP0) / h, u2 = u * u, u3 = u2 * u;
        return (2 * u3 - 3 * u2 + 1) * XR(WHIP0) + (u3 - 2 * u2 + u) * 2 * Rig.SPEED * h + (-2 * u3 + 3 * u2) * camEnd(WHIP1) + (u3 - u2) * V_END * h;
    }
    const carX3 = (t) => XR(t) + CX3 - cam3(t);
    // the two clocks: when each is torn off its post, and where on the screen
    const CLOCKS = [{ at: n(21), x: 716, hands: [1.0, -0.7], fly: [200, 330, 430, 330] }, { at: n(22), x: 700, hands: [-2.2, 0.4], fly: [250, 120, 300, 420] }];
    const CLOCK_Y = ROAD0 - 8, CLOCK_UP = 3.22 * SC; // the post's foot; the clock's middle above it
    // --- the work site: everything is placed from its origin O on the road's far edge -----------
    const SITE_X = 345; // where O is on the last frame
    const siteX = (t) => camEnd(T_LAST) + SITE_X - cam3(t);
    const SITE = { tower: -185, impA: -52, barrow: 44, lever: 132, impB: 202, barrier: 238, cones: [166, 282, 330] };
    const GROUND = 800, FRONT = 814, LEAN = -0.2;
    function site(g, t, ox) {
        const d = C.drawing(t), Pu = S.pulseAt(t), ph = Pu.k + Pu.since, is = 0.67 * SC, f = d % 2 ? 1 : -1;
        const tail = (x) => carX3(t) - 4.9 * SC - (ox + x); // how far the car's tail is past a thing (negative: not yet)
        const blown = (x) => Math.max(0, tail(x)) / ((2 * Rig.SPEED - V_END) / 12); // drawings since its tail went by
        const gust = (x) => (tail(x) > 0 ? Math.exp(-blown(x) * 0.45) : 0);
        const TH = World.THEMES.night;
        // the back row: the tower with the foreman, the barrier
        const tx = ox + SITE.tower;
        P.tower(g, tx, GROUND, SC);
        P.barrier(g, ox + SITE.barrier, GROUND - 2, SC, { lamp: Pu.k % 2 === 0, rock: 0.07 * gust(SITE.barrier) * f });
        foreman(g, t, ...P.towerTop(tx, GROUND, SC));
        // the lever under the asphalt's edge; an imp jumps on its crossbar, a jump a beat
        const lx = ox + SITE.lever, kl = blown(SITE.lever), up = Math.abs(Math.sin(ph * Math.PI)), lean = LEAN - 0.035 * Pu.pulse;
        P.lever(g, lx, ROAD0 + 2, SC, lean);
        P.prisedLip(g, lx + 8, ROAD0, TH.road, TH.roadEdge);
        const end = P.leverEnd(lx, ROAD0 + 2, SC, lean);
        if (kl <= 0) Devil.imp(g, end[0], end[1], is, { wear: 'hat', hop: 0.34 * up, squash: 0.12 * Pu.pulse, armUp: 0.5 * up, mood: 'grin', look: -0.5, shadow: false, tail: 0.1 * Math.sin(ph * Math.PI) });
        else if (kl < 7) {
            // the wake takes it off its perch, heels over head
            g.save();
            g.translate(end[0] + 44 * kl, end[1] - 0.5 * is - 30 * kl + 5.5 * kl * kl);
            g.rotate(0.95 * Math.floor(kl));
            Devil.imp(g, 0, 0.5 * is, is, { wear: 'hat', armUp: 1, mood: 'awe', look: 1, shadow: false, tail: 0.2 * f });
            g.restore();
        }
        // the front row: the barrow of signs and its imp, the imp with a cone, the cones
        const ga = gust(SITE.barrow), pa = tail(SITE.impA) > 0, pb = tail(SITE.impB) > 0;
        Devil.imp(g, ox + SITE.impA, FRONT, is, { wear: 'hat', mood: pa ? 'awe' : 'grin', look: pa ? 1 : 0.5, squash: 0.05 * Pu.pulse, hop: 0.3 * gust(SITE.impA), tail: 0.06 * Math.sin(ph * Math.PI) });
        P.wheelbarrow(g, ox + SITE.barrow, FRONT, SC, { jig: ga * f });
        const gb = gust(SITE.impB), bx = ox + SITE.impB, bhop = 0.3 * gb, cb = blown(SITE.impB);
        Devil.imp(g, bx, FRONT + 2, is, { wear: 'hat', armUp: 1, mood: pb ? 'oops' : 'grin', look: pb ? 1 : -0.4, squash: 0.05 * Pu.pulse, hop: bhop, tail: -0.05 * Math.sin(ph * Math.PI) });
        // the cone it carries over its head leaves with the wake
        if (cb < 7) P.cone(g, bx + 40 * cb, FRONT + 2 - (0.98 + bhop) * is - 13 * cb + 2.6 * cb * cb, SC, { fall: Math.min(3.1, cb * 0.62) });
        for (const x of SITE.cones) {
            const k = blown(x);
            P.cone(g, ox + x + Math.min(30, 10 * k), FRONT + 6, SC, { fall: [0, 0.5, 1.15, 1.68, 1.5][Math.min(4, Math.floor(k))] + (k >= 4 ? 0.07 : 0), hop: k > 0 && k < 3 ? 0.1 : 0 });
        }
    }
    // The Devil up on his tower with the blueprint: «ah… ah…», the sneeze on its beat, and the
    // pass that takes the sheet out of his mitts.
    function foreman(g, t, x, y) {
        const d = C.drawing(t), Pu = S.pulseAt(t), f = d % 2 ? 1 : -1;
        const a1 = T_CHOO - 10 * FR, a2 = T_CHOO - 5 * FR, ripped = t >= T_RIP - EPS, since = dr(t, T_CHOO);
        let pose, nose = 1, blow = 0.3, jolt = 0;
        if (ripped) pose = { mood: 'shock', look: 1, lean: -0.05, headTilt: -0.03, handR: [-0.62, -0.84], handL: [0.74, -1.12 + 0.03 * f], tail: 0.2 * f, step: f }, blow = 1, nose = 1.2;
        else if (since >= 0 && since < 2) pose = { mood: 'angry', eyes: 'shut', lean: 0.2 - 0.05 * since, headTilt: 0.06, headDy: 0.03, squash: 0.08, tail: -0.3 }, nose = 1.7, blow = -0.9, jolt = 1;
        else if (since >= 2) pose = { mood: 'sly', eyes: 'shut', lean: 0.04, headDy: 0.01, tail: 0.05 * f }, nose = 1.35;
        else if (t >= a2 - EPS) pose = { mood: 'shock', eyes: 'shut', lean: -0.15, headTilt: -0.06, headDy: -0.04, squash: -0.04, tail: 0.25 }, nose = 1.55, blow = 0.6;
        else if (t >= a1 - EPS) pose = { mood: 'shock', eyes: 'shut', lean: -0.07, headTilt: -0.03, headDy: -0.02, tail: 0.15 }, nose = 1.3, blow = 0.45;
        else pose = { mood: 'sly', look: -0.4, squash: 0.03 * Pu.pulse, tail: 0.05 * Math.sin((Pu.k + Pu.since) * Math.PI) };
        const hands = ripped ? {} : { handR: [-0.5, -0.5 - 0.05 * jolt], handL: [0.5, -0.5 - 0.05 * jolt] };
        pose = { ...hands, ...pose };
        Devil.draw(g, x, y, SC, pose);
        P.devilCold(g, x, y, SC, pose, t, { blow, nose });
        const q = pose.squash ?? 0, lean = pose.lean ?? 0, at = (p) => {
            const r = rot([p[0] * (1 + q), p[1] * (1 - q)], lean);
            return [x + r[0] * SC, y + r[1] * SC];
        };
        if (!ripped) {
            // the sheet in his mitts, which rest on its edges
            const c = at([0, -0.46 - 0.05 * jolt]);
            P.blueprint(g, c[0], c[1], SC, lean + 0.04 * jolt);
            g.save();
            g.translate(x, y);
            g.scale(SC, SC);
            g.rotate(lean);
            g.scale(1 + q, 1 - q);
            g.lineJoin = 'round';
            for (const h of [pose.handR, pose.handL]) P.devilMitt(g, 3.2 / SC, h);
            g.restore();
        }
        const face = at([-0.1, -1.2]);
        P.sneeze(g, face[0], face[1], SC, t - T_CHOO, -1);
        return at([0, -0.46]);
    }
    function time(g, t, env) {
        const d = C.drawing(t), Pu = S.pulseAt(t), cam = cam3(t), cx = carX3(t), bn = 0.2 * Pu.pulse;
        const whip = t >= WHIP0 && t < WHIP1, ox = siteX(t);
        World.back(g, t, cam, 'night', sky({ moon: MOON.y, stars: 1 }));
        P.speedLines(g, t, { n: whip ? 20 : 12, seed: 'v3a-lines3', y0: 60, y1: 660, k: whip ? 2.4 : t < WHIP0 ? 1.2 : 0 });
        // the clocks on their posts; a torn-off one flies on over the car
        const flying = [];
        for (const c of CLOCKS) {
            const px = XR(c.at) + c.x - cam, a = t - c.at;
            if (px > -200 && px < 1200) {
                P.clockPost(g, px, CLOCK_Y, SC, a >= -EPS);
                if (a < -EPS) P.clock(g, px, CLOCK_Y - CLOCK_UP, SC, 0, c.hands);
                else if (dr(t, c.at) < 2) C.burst(g, px - 4, CLOCK_Y - CLOCK_UP + 0.56 * SC, { r0: 9, r1: 24 + 10 * dr(t, c.at), n: 7, seed: 'v3a-tick' + dr(t, c.at), fill: K.white, ink: K.ink, lw: 2.6 });
            }
            const [fx, vx, vy, gy] = c.fly;
            if (a >= -EPS) flying.push([XR(t) + c.x - fx * (1 - Math.exp(-9 * a)) - vx * a - cam, CLOCK_Y - CLOCK_UP - vy * a + gy * a * a, twos(t, c.at) - c.at, c.hands]);
        }
        if (ox > -500 && ox < 1500) site(g, t, ox);
        inCar(g, cx, LANE, SC, bn, (L) => P.beams(g, L, t, 1));
        band(g, t, cx, LANE, SC, { bounce: bn, exhaust: 1, wind: 1, pinned: true, speedo: speedoAt(t), driver: { pose: driving(t, { lean: -0.11 + (d % 2 ? 0.012 : 0), wave: d % 2 ? -1 : -0.7 }) } });
        inCar(g, cx, LANE, SC, bn, (L) => P.lamps(g, L, 1));
        burner(g, t, cx, LANE, SC, bn, 1 + (d % 2 ? 0.06 : 0));
        for (const [x, y, a, hands] of flying) if (x > -120) P.clock(g, x, y, SC, -a * 7.5, [hands[0] + a * 4, hands[1] + a * 26]);
        // the blueprint, out of his mitts: up and away, turning over
        if (t >= T_RIP - EPS) {
            const a = t - T_RIP, a2 = twos(t, T_RIP) - T_RIP, top = P.towerTop(ox + SITE.tower, GROUND, SC);
            P.blueprint(g, top[0] + 30 + 470 * a, top[1] - 0.5 * SC - 560 * a + 520 * a * a, SC, 0.5 + a2 * 9, Math.cos(a2 * 15));
        }
        if (t < WHIP0) front(g, t, cam3, 'night', [[T83, T83 + 0.2], ...CLOCKS.map((c) => [c.at - 0.15, c.at + 0.3])]);
    }

    function draw(g, t, env) {
        if (t < T81 - EPS) dusk(g, t, env);
        else if (t < T83 - EPS) pedal(g, t, env);
        else time(g, t, env);
    }

    Seg.verse3a = {
        shots: [[T0, T81, 'Dusk'], [T81, T83, 'Pedal'], [T83, T85, 'Time']],
        draw,
        // the tape finds its tracking as the picture replaces the blue (as in the opening)
        post(t) {
            const f = Math.round((t - T0) * 24);
            return f >= 0 && f < 6 ? { track: [1, 0.8, 0.5, 0.3, 0.16, 0.07][f], roll: [0.3, 0.11, 0.035][f] ?? 0 } : {};
        },
        // for the film's cue sheet: the car's road clock, and the camera's place on the road in the last shot
        XR, cam3,
    };
})();
