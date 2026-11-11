// «Hellplug», bars 102–109 (144.38–155.67 s): four bars of the riff and the first half of the
// fourth chorus, in Hell's venue. The Devil tries to stop the show and makes it better.
// At the side of the stage he spits on his mitts and heaves the band's plug out of the wall:
// the house goes dark, and he struts into the one work light left with the plug held up like
// a trophy. But the band is the film's soundtrack: it plays on in the gloom, and the pit
// answers with lighters: one flame, five, all of them. On the chorus's first beat the plug
// tears itself out of his mitt and flies home; he holds on to its cable and is dragged across
// the stage into the wall. Everything comes back at once and more: the title as it is sung,
// a skeleton surfing the crowd, the front row singing along, the band at full tilt, and the
// Devil sat by his socket wound in cable, getting up as the block ends.
// Props: segments/hellplug-props.js (HellplugProps); the cactus is chorus 1's (Chorus1Props).
// What chorus 3 established is taken from Chorus3Props when it is loaded (after
// verse3b-props.js): the things the car threw off (dressing), the Devil's sore nose (devil),
// the title on the banner (title), a cone for a front-row imp's hat (Verse3bProps.cone).
(() => {
    const Seg = (window.Seg = window.Seg || {});
    const C = Cereal, K = C.COL, E = Ease, S = Song, I = Inferno, P = HellplugProps, P1 = Chorus1Props, twos = S.twos, b = S.b, B = S.B, TAU = Math.PI * 2, PI = Math.PI;
    const T0 = B(102), T104 = B(104), TW = b(418), T105 = B(105), T106 = B(106), T107 = B(107), T108 = B(108), T109 = B(109), T110 = B(110);
    const n = (k) => b(408 + k); // beat k of the block (0 = bar 102's first)
    const FR = 1 / 24, U = 84; // a frame; the cast's unit in the venue's set coordinates
    const lerp = E.lerp;
    const rot = ([x, y], a) => [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)];
    const on = (t, a) => t >= a - 1e-6;
    const dr = (t, a) => Math.floor((t - a) * 12 + 1e-6); // drawings since a
    const seg2 = (t, a, c) => E.seg(twos(t, a), a, c); // 0..1 on twos, counted from a
    // a table of values, one per drawing since `a` (the last one holds); before `a`: `before`
    const steps = (t, a, list, before = list[list.length - 1]) => (on(t, a) ? list[Math.min(list.length - 1, dr(t, a))] : before);
    const lerpPt = (p, q, u) => [lerp(p[0], q[0], u), lerp(p[1], q[1], u)];

    // --- the band on its car: Tom up front, the cactus in shades at the wheel ------------------
    const SEATS = Rides.bandCarSeats(), WHEEL = [SEATS.wheel[0] - SEATS.driver[0] - 0.07, SEATS.wheel[1] - SEATS.driver[1] + 0.02];
    const cactus = (t) => {
        const Pu = S.pulseAt(t);
        return (g, s) => P1.cactus(g, 0, 0, s, { wheel: WHEEL, shades: 1, squash: 0.05 * Pu.pulse, wave: Pu.k % 2 ? Pu.pulse : -Pu.pulse * 0.6 });
    };
    const band = (g, t, St, o = {}) => Rig.band(g, t, St.car.x, St.car.y, St.car.s, { sing: true, tomDrives: false, driver: cactus(t), ...o });

    // What chorus 3 left in the house (the trident in the gum, the arrow in the teeth, the barrier
    // on the lip, two cones for hats, the imp on a hard hat with the Devil's scarf on its mallet):
    // Chorus3Props.dressing, when that block is loaded. o: the venue's and the crowd's options.
    const C3 = typeof Chorus3Props !== 'undefined' ? Chorus3Props : null;
    const dress = (g, t, o, part, tc = t) => {
        if (C3) C3.dressing(g, tc, { ...o, part, scarf: t - 142.7083 });
    };
    // The Devil as chorus 3 left him: the scarf thrown off, the sore nose of his cold still on
    // him (Chorus3Props.devil wraps Devil.draw).
    const drawDevil = (g, x, y, s, pose) => (C3 ? C3.devil(g, x, y, s, pose, { scarf: false, nose: 1 }) : Devil.draw(g, x, y, s, pose));

    // --- the Devil in set coordinates -----------------------------------------------------------
    // a set point in his own units, for a mitt: where he stands, how he leans and squashes
    const toDevil = (p, at, pose = {}) => {
        const r = rot([(p[0] - at[0]) / U, (p[1] - at[1]) / U], -(pose.lean ?? 0)), q = pose.squash ?? 0;
        return [r[0] / (1 + q), r[1] / (1 - q)];
    };
    const fromDevil = (p, at, pose = {}) => {
        const q = pose.squash ?? 0, r = rot([p[0] * (1 + q), p[1] * (1 - q)], pose.lean ?? 0);
        return [at[0] + r[0] * U, at[1] + r[1] * U];
    };
    const devil = (g, St, at, pose) => {
        const p = St.at(at);
        drawDevil(g, p[0], p[1], St.car.s, pose);
    };
    const sat = (g, St, at, pose, o) => {
        const p = St.at(at);
        P.seated(g, p[0], p[1], St.car.s, pose, { draw: drawDevil, ...o });
    };
    // his eyes and mouth, for the night: shapes to fill on a context (c is in frame coordinates)
    const face = (c, St, at, pose, seat = false) => {
        const p = St.at(at), s = St.car.s;
        if (seat) {
            c.save();
            c.translate(p[0], p[1]);
            c.rotate(pose.lean ?? 0);
            P.inDevil(c, 0, P.seatDrop(pose, s), s, { ...pose, lean: 0 }, true, (c2) => P.faceHoles(c2, pose.mood));
            c.restore();
        } else P.inDevil(c, p[0], p[1], s, pose, true, (c2) => P.faceHoles(c2, pose.mood));
    };

    // --- the plug, its cable, the socket ----------------------------------------------------------
    const HOME = P.HOME, FLOOR = 803; // the floor the cable lies on, behind his hooves
    const GRIP = [[72, -13], [50, 31]]; // where his two mitts rest on the plug (its own frame)
    // the cable's line from the plug's tail to the jack on the car: it hangs to the floor, lies
    // along it (a lazy wave, `slack` high) and climbs to the jack
    function cablePts(tail, o = {}) {
        const J = P.JACK, sl = o.slack ?? 1, dir = o.dir ?? [1, 0], x0 = tail[0], xa = o.land ?? x0 + 24, pts = [tail, [x0 + dir[0] * 16, tail[1] + dir[1] * 16 + 3]];
        if (tail[1] < FLOOR - 30) pts.push([lerp(x0 + dir[0] * 26, xa, 0.5), lerp(tail[1], FLOOR, 0.55)]);
        pts.push([xa, FLOOR - 2]);
        const a = xa, c = J[0] - 14, m = Math.max(2, Math.round(Math.abs(c - a) / 46));
        for (let i = 1; i < m; i++) pts.push([lerp(a, c, i / m), FLOOR + (i % 2 ? 5 : -3) * sl]);
        pts.push([J[0] - 12, FLOOR - 1], [J[0] - 1, FLOOR - 22], [J[0], J[1] + 6]);
        return C.curve(pts, false, 8);
    }

    // =========================================================================================
    // Shot 1 · «The plug», beats 0–9 (bars 102–103 and half of 104): the side of the stage
    // =========================================================================================
    const SIDE = { k: 2, cx: 120, cy: 664 }, SHIFT = 60; // the camera cannot pan further left: the picture is slid over instead
    const H0 = [112, 806]; // where he stands at the socket
    const GRAB = n(3), BRACE = n(4), HEAVE = [n(5), n(6), n(7)], POP = T104, UP = n(9);
    const LAND = [228, 806], LANDED = POP + 2 / 12;
    // how far out the plug is: three heaves, each wins a little and the socket takes half of it back
    function plugOut(t) {
        if (on(t, POP)) return 99;
        let out = 0;
        HEAVE.forEach((h, i) => {
            if (on(t, h)) out = steps(t, h, [[9, 7, 5, 4], [16, 13, 10, 9], [23, 20, 17, 15]][i]);
        });
        if (on(t, POP - 2 / 12)) out = Math.max(0, out - 5); // the wind-up for the last one: he gives it back
        return out;
    }
    function plugScene(g, t, env) {
        const St = I.stage(SIDE, 0), Pu = S.pulseAt(t), d = C.drawing(t), dark = on(t, POP), ph = Pu.k + Pu.since;
        const o = { view: SIDE, pan: 0, heat: dark ? 0 : 0.8, beatK: dark ? 0 : Pu.pulse };
        const out = plugOut(t), k = (t - T0) / S.BEAT; // the beat we are in, as a number
        // --- his act -----------------------------------------------------------------------
        let at = H0, pose, plugAt = [HOME[0] + Math.min(out, 30), HOME[1]], plugAng = 0, seat = false, sock = 'calm', held = false;
        const fx = []; // what flies off him: [kind, x, y, …] in set coordinates
        if (!on(t, n(1))) {
            // beat 0: he has stormed down; he shakes his fists at the stage, stamping
            const f = d % 2 ? 1 : -1;
            pose = { mood: 'angry', look: 1, handR: [-0.62, -1.2 + 0.07 * f], handL: [0.66, -1.24 - 0.07 * f], step: f, squash: 0.03 + 0.03 * Pu.pulse, lean: 0.05, headTilt: 0.05, tail: 0.1 * f };
        } else if (!on(t, GRAB)) {
            // beats 1 and 2: he spits on one mitt, then the other, and rubs them
            const second = on(t, n(2)), a = second ? n(2) : n(1), f = dr(t, a), rub = on(t, n(2) + 2 / 12);
            const up = second ? 'handL' : 'handR', sx = second ? 1 : -1;
            pose = { mood: 'angry', look: -0.6, squash: 0.03 * Pu.pulse, lean: -0.03, headTilt: -0.04 * sx, tail: 0.04 * Math.sin(ph * PI) };
            if (rub) {
                const r = (dr(t, n(2) + 2 / 12) % 2 ? 1 : -1) * 0.07;
                pose.handR = [-0.1, -0.74 + r];
                pose.handL = [0.1, -0.74 - r];
                pose.mood = 'sly';
            } else {
                // the mitt comes up beside his mouth, flat; he turns his head to it
                pose[up] = [sx * 0.74, f === 1 ? -0.86 : -0.92];
                pose[second ? 'handR' : 'handL'] = second ? [-0.5, -0.56] : [0.5, -0.5];
                pose.look = sx;
                pose.headTilt = 0.1 * sx;
                // the drop: from his mouth to the mitt, one drawing in the air, then a splash
                const m = fromDevil([sx * 0.26, -1.06], at, pose), h = fromDevil([sx * 0.76, -1.03], at, pose);
                if (f === 0) fx.push(['drop', lerp(m[0], h[0], 0.62), lerp(m[1], h[1], 0.62) - 6, sx, m]);
                else if (f === 1) fx.push(['splash', h[0], h[1] + 2]);
            }
        } else if (!dark) {
            // he takes the plug in both mitts, braces, and heaves on the beats: one, two, three
            held = true;
            sock = 'strain';
            let lean = -0.14 * (1 - seg2(t, GRAB, GRAB + 0.2)) - 0.05, sq = 0.05 * S.pop(t, GRAB, 0.2), eyes = 'open', tail = 0.05 * Math.sin(ph * PI), tilt = -0.05;
            if (on(t, BRACE)) {
                // he sinks, shifts his grip, wags his tail
                sq = steps(t, BRACE, [0.14, 0.1, 0.12, 0.1]);
                lean = -0.1;
                tail = (dr(t, BRACE) % 2 ? 0.14 : -0.06);
            }
            HEAVE.forEach((h, i) => {
                if (!on(t, h)) return;
                const f = dr(t, h);
                lean = steps(t, h, [[0.36, 0.3, 0.2, 0.16], [0.44, 0.36, 0.24, 0.18], [0.54, 0.46, 0.32, 0.26]][i]);
                sq = steps(t, h, [-0.08, -0.05, 0.02, 0.04]);
                eyes = f < 2 ? 'shut' : 'open';
                tail = f < 2 ? -0.2 : 0.06 * (f % 2 ? 1 : -1);
                tilt = f < 2 ? 0.1 : 0;
                // sweat off his brow
                if (f < 3) {
                    const hd = fromDevil([0.1, -1.9], at, { lean, squash: sq });
                    for (let j = 0; j < 3; j++) fx.push(['sweat', hd[0] + (j - 1) * 30 + (j - 1) * f * 12, hd[1] - 4 - f * 9 + Math.abs(j - 1) * 8 + f * f * 3, (j - 1) * 0.5]);
                }
            });
            if (on(t, POP - 2 / 12)) {
                // the wind-up for the big one
                lean = -0.16;
                sq = 0.16;
                eyes = 'open';
                tail = 0.2;
            }
            // between the heaves he trembles
            const tr = on(t, HEAVE[0]) && dr(t, Pu.k >= 0 ? b(Pu.k) : T0) >= 2 ? (d % 2 ? 1.5 : -1.5) : 0;
            at = [H0[0] + tr, H0[1]];
            pose = { mood: 'angry', look: -1, eyes, lean, squash: sq, headTilt: tilt, tail };
        } else if (!on(t, UP)) {
            // it comes out: he goes over backwards with it and lands on his tail
            held = true;
            sock = 'dead';
            const f = dr(t, POP);
            if (f < 2) {
                at = [[150, 786], [192, 772]][f];
                pose = { mood: 'shock', look: -1, lean: [0.5, 0.95][f], squash: -0.1, tail: -0.25, step: f ? 1 : -1, shadow: false };
                plugAng = [0.3, 0.7][f];
                plugAt = fromDevil([-0.98, -1.2], at, pose);
            } else {
                seat = true;
                at = LAND;
                pose = { mood: on(t, LANDED + 3 / 12) ? 'grin' : 'shock', look: -0.4, squash: steps(t, LANDED, [0.24, -0.07, 0.04, 0]), headTilt: steps(t, LANDED, [0.1, -0.06, 0.02, 0]), tail: steps(t, LANDED, [0.62, 0.42, 0.55, 0.5]) };
                // the plug out at arm's length, still in his right mitt
                plugAng = steps(t, LANDED, [0.34, 0.1, 0.2, 0.16]);
                plugAt = [at[0] - 152, at[1] - steps(t, LANDED, [92, 66, 80, 76])];
                pose.handL = on(t, LANDED + 3 / 12) ? [0.5, -0.5] : [0.66, -1.3];
            }
        } else {
            // up he gets, the plug held high like a trophy: the salesman's grin
            held = true;
            sock = 'dead';
            const strut = on(t, UP + 3 / 12), f = dr(t, UP), stp = strut ? (dr(t, UP + 3 / 12) % 2 ? 1 : -1) : 0;
            at = [LAND[0] + (strut ? 8 + 9 * dr(t, UP + 3 / 12) : 0), LAND[1]];
            pose = { mood: 'grin', look: strut ? 1 : 0, squash: steps(t, UP, [-0.12, 0.07, 0]), lean: strut ? 0.07 : 0, headTilt: strut ? 0.06 : -0.03, tail: 0.08 * Math.sin(f * 1.6), step: stp };
            plugAng = PI / 2;
            plugAt = trophy(at, pose);
        }
        if (held) {
            // his mitts are on the plug wherever it is
            const gp = seat ? { ...pose, lean: 0 } : pose, ga = seat ? [at[0], at[1] + P.seatDrop(pose, U)] : at;
            if (plugAng === PI / 2) pose.handR = toDevil(P.plugPt(plugAt, plugAng, [40, 0]), ga, gp);
            else if (seat) pose.handR = toDevil(P.plugPt(plugAt, plugAng, [56, -24]), ga, gp);
            else {
                pose.handR = toDevil(P.plugPt(plugAt, plugAng, GRIP[0]), ga, gp);
                pose.handL = toDevil(P.plugPt(plugAt, plugAng, GRIP[1]), ga, gp);
            }
        }
        // --- the picture ---------------------------------------------------------------------
        g.save();
        g.translate(SHIFT, 0);
        const co = { ...o, hype: 0.8, lighters: 0 }, tc = dark ? POP + 2 * FR : t; // the crowd's clock stops with the lights
        I.venue(g, t, o);
        dress(g, t, co, 'back');
        band(g, t, St);
        dress(g, t, co, 'stage');
        const tail = P.plugTail(plugAt, plugAng), tdir = rot([1, 0], plugAng);
        const pts = cablePts(tail, { dir: tdir, slack: dark ? 2.2 : 1, land: dark ? Math.min(tail[0] + 10, 150) : 86 });
        P.layer(g, SIDE, 0, (L) => {
            P.socket(g, L, { live: dark ? 0 : 1, beat: Pu.pulse, face: sock, holes: out > 26, d });
            P.jack(g, L);
            P.cable(g, L, pts);
            P.plug(g, L, plugAt, { ang: plugAng, out });
        });
        if (seat) sat(g, St, at, pose);
        else devil(g, St, at, pose);
        P.layer(g, SIDE, 0, (L) => drawFx(g, L, fx, d));
        // the front row along the bottom: they stop in the air when the lights go
        I.crowd(g, tc, co);
        dress(g, t, co, 'front', tc);
        g.restore();
        if (dark) {
            // the night, with what still shines punched out of it: the flash at the socket, the
            // sparks on the pins, his eyes and his grin
            const f = dr(t, POP), sp = St.at([P.SOCK.x1 + 14, HOME[1]]), pin = St.at(P.plugPt(plugAt, plugAng, [-16, 0]));
            const R = [170, 120, 70][f] ?? 0, hot = f < 9 && f % 2 === 0;
            P.night(g, env, (c) => {
                c.translate(SHIFT, 0);
                if (R) {
                    C.trace(c, P.flashPts(sp[0], sp[1], R * 1.25, 'hp-pop' + f, f * 0.4));
                    c.fill();
                }
                if (hot) {
                    C.trace(c, P.flashPts(pin[0], pin[1], 46, 'hp-pin' + f, f));
                    c.fill();
                }
                face(c, St, at, pose, seat);
            });
            g.save();
            g.translate(SHIFT, 0);
            if (R) {
                P.flash(g, sp[0], sp[1], R, 'hp-pop' + f, 3.2, f * 0.4);
                P.bolts(g, sp[0], sp[1], R * 0.7, R * 1.5, 6, 'hp-popb' + f, 3, { rot: f * 0.5 });
            }
            if (hot) P.bolts(g, pin[0], pin[1], 8, 40, 4, 'hp-pinb' + f, 2.4, { rot: f * 0.9 });
            if (seat) {
                // stars where his tail met the floor
                const k2 = E.bump(twos(t, LANDED), LANDED, 0.34), a = St.at([LAND[0] + 70, LAND[1] - 8]);
                if (k2 > 0) for (let i = 0; i < 5; i++) C.sparkle(g, a[0] + Math.cos(-0.2 - i * 0.62) * (36 + 70 * k2), a[1] + Math.sin(-0.2 - i * 0.62) * (26 + 60 * k2), 9 + 14 * k2, { color: i % 2 ? K.yellow : K.white, ink: K.ink, lw: 2.4, rot: i });
            }
            g.restore();
        }
    }
    // the plug held up over his right shoulder, pins to the roof: where its pin face is
    const trophy = (at, pose) => {
        const h = fromDevil([-0.9, -1.72], at, pose);
        return [h[0], h[1] - 40];
    };
    // small things in set coordinates: spit, its splash, sweat
    function drawFx(g, L, fx, d) {
        for (const [kind, x, y, a, from] of fx) {
            if (from) {
                // the streak it leaves from his mouth
                for (const lw of [7 * L, 2.8 * L]) C.poly(g, [[lerp(from[0], x, 0.15), lerp(from[1], y, 0.15) - 2], [lerp(from[0], x, 0.7), lerp(from[1], y, 0.7) - 4]], { ink: lw > 4 * L ? K.ink : K.white, lw, close: false });
            }
            if (kind === 'drop' || kind === 'sweat') {
                const s = kind === 'drop' ? 8.5 : 6.5;
                g.save();
                g.translate(x, y);
                g.rotate(kind === 'drop' ? -a * 1.9 : a);
                C.poly(g, C.curve([[0, -s * 1.5], [s * 0.7, 0.1 * s], [0, s * 0.8], [-s * 0.7, 0.1 * s]], true, 5), { fill: kind === 'drop' ? K.white : K.aqua, ink: K.ink, lw: 2.4 * L });
                g.restore();
            } else if (kind === 'splash') {
                for (const lw of [6.4 * L, 2.6 * L]) for (const [dx, dy] of [[-17, -8], [-7, -18], [7, -18], [17, -8]]) C.poly(g, [[x + dx * 0.45, y + dy * 0.45], [x + dx, y + dy]], { ink: lw > 4 * L ? K.ink : K.white, lw, close: false });
            }
        }
    }

    // =========================================================================================
    // Shots 2 and 3 · «Lighters» and «Chorus 4», beats 10–23: the whole house, the camera a
    // little to the left so the socket is in the picture. Dark, then the pit's flames, then
    // everything back at once on bar 106
    // =========================================================================================
    const SPOT = 392; // where the one work light left falls on the stage's edge
    const SIT = [160, 806]; // where the cable leaves him
    const ARRIVE = n(11), FLAMES = [n(12), n(13), n(14)], GONE = n(14) + 3 / 12, JERK = n(15), SLAM = T106, SIT_AT = T106 + 2 / 12;
    const TITLE_AT = [T106, S.snap(S.TITLES[6][1]), S.snap(S.TITLES[6][2])], TITLE_OUT = n(21);
    const SURF = [n(20), n(28)]; // the surfer's two bars
    const wpan = (t) => -156 + 12 * E.seg(t, TW, T108);
    const surfU = (t) => lerp(0.1, 1, E.seg(t, SURF[0], SURF[1]));
    function house(g, t, env) {
        const pan = wpan(t), St = I.stage('wide', pan), Pu = S.pulseAt(t), d = C.drawing(t), ph = Pu.k + Pu.since, dark = !on(t, SLAM);
        const o = { view: 'wide', pan, heat: dark ? 0 : 1, beatK: dark ? 0 : Pu.pulse };
        const x0 = pan - 30, x1 = 1000 + pan + 30; // the set's span in the frame
        // --- his act -----------------------------------------------------------------------
        let at = [SPOT, 808], pose, plugAt = HOME, plugAng = 0, seat = false, sock = 'dead', grip = null, wrap = 0, taut = false;
        const dust = [];
        if (!on(t, ARRIVE)) {
            // he struts to the light, the plug over his shoulder
            const f = dr(t, TW), stp = f % 2 ? 1 : -1;
            at = [[258, 292, 326, 360][Math.min(3, f)], 808];
            pose = { mood: 'grin', look: 1, lean: 0.08, headTilt: 0.06, squash: f % 2 ? 0.03 : -0.02, step: stp, tail: 0.1 * stp };
            plugAng = PI / 2;
            plugAt = trophy(at, pose);
            grip = 'up';
        } else if (!on(t, JERK)) {
            // in the light: the showman, until the flames come up
            const gone = on(t, GONE), f = dr(t, ARRIVE);
            pose = { mood: gone ? 'shock' : 'grin', look: gone ? (dr(t, GONE) % 4 < 2 ? -1 : 1) : 0, squash: steps(t, ARRIVE, [-0.1, 0.06, 0]) + 0.03 * Pu.pulse, headTilt: gone ? 0 : 0.05 * Math.sin(ph * PI), tail: gone ? -0.12 : 0.08 * Math.sin(ph * PI), handL: gone ? [0.5, -0.5] : [0.84, -1.02 - 0.06 * Pu.pulse] };
            plugAng = PI / 2;
            plugAt = trophy(at, pose);
            if (gone) plugAt = [plugAt[0] + 6, plugAt[1] + steps(t, GONE, [14, 30, 34])];
            grip = 'up';
        } else if (dark) {
            // the plug comes alive: it turns for home and takes him with it
            const f = Math.min(3, dr(t, JERK));
            at = [[SPOT, SPOT - 14, SPOT - 36, 318][f], [808, 808, 806, 778][f]];
            pose = { mood: 'shock', look: -1, lean: [-0.12, -0.34, -0.62, -1.25][f], squash: [0.02, -0.04, -0.08, -0.12][f], tail: [0.1, -0.1, -0.24, -0.3][f], step: f % 2 ? 1 : -1, shadow: f < 3 };
            plugAt = [[262, 216, 172, 96][f], [668, 684, 696, 712][f]];
            plugAng = [0.24, 0.14, 0.1, 0.05][f];
            grip = f === 0 ? 'one' : 'cable';
            taut = true;
            if (f === 1 || f === 2) dust.push([at[0] + 46, 806, 0.5 + 0.3 * f]);
        } else if (!on(t, SIT_AT)) {
            // home: the plug is in, and he is still on the end of its cable
            const f = dr(t, SLAM);
            sock = 'chomp';
            at = [[272, 232][f], [724, 730][f]];
            pose = { mood: 'shock', look: -1, lean: -PI / 2 + [0.04, -0.03][f], squash: [-0.14, 0.26][f], tail: [-0.3, 0.2][f], step: f ? 1 : -1, shadow: false };
            grip = 'cable';
            taut = true;
        } else {
            // sat by his socket, wound in the cable, his own house going wild in front of him
            seat = true;
            sock = on(t, SLAM + 6 / 12) ? 'calm' : 'chomp';
            at = SIT;
            const f = dr(t, SIT_AT);
            wrap = Math.min(3, 1 + Math.floor(f / 2));
            const look = on(t, n(18)) ? (Math.floor(ph / 2) % 2 ? -0.4 : 1) : 1;
            pose = { mood: on(t, n(20)) ? 'angry' : 'shock', look, squash: steps(t, SIT_AT, [0.22, -0.06, 0.04, 0]) + 0.02 * Pu.pulse, headTilt: steps(t, SIT_AT, [0.12, -0.08, 0.04, 0]) + (on(t, n(18)) ? 0.05 * look : 0), tail: 0.5 + 0.06 * Math.sin(ph * PI) };
        }
        // his mitts: on the plug, or on the cable just behind it
        const tail = P.plugTail(plugAt, plugAng), hold = [tail[0] + 30, tail[1] + 3];
        if (grip === 'up') pose.handR = toDevil(P.plugPt(plugAt, plugAng, [40, 0]), at, pose);
        else if (grip === 'one') pose.handR = toDevil(P.plugPt(plugAt, plugAng, [52, -8]), at, pose);
        else if (grip === 'cable') {
            pose.handR = toDevil([hold[0] - 6, hold[1] - 3], at, pose);
            pose.handL = toDevil([hold[0] + 12, hold[1] + 4], at, pose);
        }
        // --- the picture ---------------------------------------------------------------------
        const nl = dark ? (on(t, FLAMES[2]) ? 1 : on(t, FLAMES[1]) ? P.lightersFor(5, x0, x1) : on(t, FLAMES[0]) ? P.lightersFor(1, x0, x1) : 0) : 0.3;
        const co = { ...o, hype: dark ? 0 : 1, lighters: nl };
        I.venue(g, t, o);
        dress(g, t, co, 'back');
        // the title, word by word as it is sung: on the banner, as chorus 3 set it
        if (!dark) {
            if (C3) C3.title(g, t, { view: 'wide', pan, at: TITLE_AT, out: TITLE_OUT });
            else P1.title(g, t, 506, 236, { at: TITLE_AT, out: TITLE_OUT, k: 0.8 });
        }
        I.box(g, St.box.x, St.box.y, St.box.s, { t }); // his box, empty
        band(g, t, St, dark ? {} : { bounce: 0.25 * Pu.pulse });
        if (!dark) I.beams(g, t, { ...o, front: true });
        dress(g, t, co, 'stage');
        // the cable: from the plug to his mitts when he is on the end of it, then along the floor to the car
        let pts;
        if (taut && grip === 'cable') {
            const hp = fromDevil([0, -0.5], at, pose);
            pts = C.curve([tail, hold, [lerp(hold[0], hp[0], 0.5), hold[1] + 26], [hp[0] + 20, Math.min(FLOOR, hp[1] + 40)], [lerp(hp[0], 257, 0.5) + 30, FLOOR - 4], [257, FLOOR], [P.JACK[0] - 1, FLOOR - 22], [P.JACK[0], P.JACK[1] + 6]], false, 8);
        } else if (seat) pts = C.curve([tail, [tail[0] + 16, tail[1] + 4], [tail[0] + 24, 770], [102, FLOOR], [150, FLOOR - 4], [206, FLOOR + 3], [257, FLOOR], [P.JACK[0] - 1, FLOOR - 22], [P.JACK[0], P.JACK[1] + 6]], false, 8);
        else pts = cablePts(tail, { dir: rot([1, 0], plugAng), land: at[0] - 34, slack: 1 });
        P.layer(g, 'wide', pan, (L) => {
            P.socket(g, L, { live: dark ? 0 : 1, beat: Pu.pulse, face: sock, holes: dark, d });
            P.jack(g, L);
            P.cable(g, L, pts);
            P.plug(g, L, plugAt, { ang: plugAng, out: on(t, SLAM) ? 0 : 99 });
            for (const [dx, dy, k2] of dust) P1.puffs(g, [[dx, dy - 10 * k2, 15 * k2, 6, 0.3], [dx + 22 * k2, dy - 6 * k2, 11 * k2, 5, 1.1], [dx - 16 * k2, dy - 5 * k2, 9 * k2, 5, 2]], '#c9a0a8', 3.2 * L);
        });
        if (seat) sat(g, St, at, pose, { between: (g2, sc) => coils(g2, sc, pose, wrap) });
        else devil(g, St, at, pose);
        I.crowd(g, t, { ...co, surf: { u: surfU(t), on: on(t, SURF[0]) } });
        dress(g, t, co, 'front');
        if (dark) {
            // the night: the work light's cone on him, a pool round every flame, his eyes and his grin
            const lamp = St.lamps[1], flames = P.lighterPoints(t, nl, x0, x1).map((q) => [...St.at([q.x, q.y]), q.u]);
            const jf = on(t, JERK) ? dr(t, JERK) : -1, hot = on(t, ARRIVE) && !on(t, JERK) && dr(t, ARRIVE) % 4 < 2, pin = St.at(P.plugPt(plugAt, plugAng, [-16, 0]));
            const cone = (c) => {
                const a = St.at([SPOT - 96, 794]), e = St.at([SPOT + 96, 794]), m = St.at([SPOT, 800]), ux = m[0] - lamp[0], uy = m[1] - lamp[1], l = Math.hypot(ux, uy);
                C.trace(c, [[lamp[0] + (ux / l) * 30 + (uy / l) * 20, lamp[1] + (uy / l) * 30 - (ux / l) * 20], [lamp[0] + (ux / l) * 30 - (uy / l) * 20, lamp[1] + (uy / l) * 30 + (ux / l) * 20], a, e]);
                c.fill();
                c.beginPath();
                c.ellipse(m[0], m[1], 96, 22, 0, 0, TAU);
                c.fill();
            };
            const discs = (c, r) => {
                for (const [fx, fy, u] of flames) {
                    c.beginPath();
                    c.arc(fx, fy + r * 0.35, r * (u / 56), 0, TAU);
                    c.fill();
                }
            };
            const extra = (c) => {
                cone(c);
                if (hot || jf >= 0) {
                    C.trace(c, P.flashPts(pin[0], pin[1], jf >= 0 ? 44 : 30, 'hp-wpin' + d, d));
                    c.fill();
                }
                face(c, St, at, pose);
            };
            // a few flames: wide pools; a pit full of them: small ones that run together
            const few = nl < 0.5;
            P.night(g, env, (c) => {
                extra(c);
                discs(c, few ? 30 : 20);
            }, (c) => {
                extra(c);
                discs(c, few ? 62 : 40);
            });
            if (hot || jf >= 0) P.bolts(g, pin[0], pin[1], 6, jf >= 0 ? 40 : 26, 4, 'hp-wpinb' + d, 2.2, { rot: d * 0.9 });
        } else {
            // the plug is home: a flash at the socket, stars round his head when he lands
            const f = dr(t, SLAM), sp = St.at([P.SOCK.x1 + 14, HOME[1]]), R = [96, 70, 40][f] ?? 0;
            if (R) {
                P.flash(g, sp[0], sp[1], R, 'hp-home' + f, 3.2, f * 0.4);
                P.bolts(g, sp[0], sp[1], R * 0.7, R * 1.5, 6, 'hp-homeb' + f, 2.6, { rot: f * 0.5 });
            }
            if (seat) {
                const k2 = E.bump(twos(t, SIT_AT), SIT_AT, 0.4), a = St.at([SIT[0] + 4, SIT[1] - 150]);
                if (k2 > 0) for (let i = 0; i < 5; i++) C.sparkle(g, a[0] + Math.cos(PI + i * 0.78) * (40 + 30 * k2), a[1] + Math.sin(PI + i * 0.78) * (14 + 16 * k2), 7 + 9 * k2, { color: i % 2 ? K.yellow : K.white, ink: K.ink, lw: 2.2, rot: i + dr(t, SIT_AT) });
            }
        }
    }
    // The cable wound round him as he sits: `turns` of it over his arms and his coat, drawn from
    // his seat in frame units (sc: his scale); his legs go over the lowest.
    function coils(g, sc, pose, turns) {
        const q = pose.squash ?? 0, u = sc / U;
        for (let i = 0; i < turns; i++) {
            const y = -(15 + i * 15) * (1 - q) * u, tilt = (i % 2 ? 1 : -1) * 0.07, rx = (53 - i * 2) * u;
            const arc = C.ellipsePts(3 * u, y, rx, 7 * u, 14, tilt, -0.12, PI + 0.12);
            P.cable(g, 1, arc, { w: 10 * u, bands: false });
            const m = arc[5 + (i % 2) * 4];
            C.poly(g, [[m[0] - 1 * u, m[1] - 5 * u], [m[0] + 1 * u, m[1] + 5 * u]], { ink: P.CABLE.band, lw: 4.4 * u, close: false });
        }
    }
    // a ring of cable lying round a point (set coordinates): its far half, or its near half
    const ring = (g, L, cx, cy, rx, ry, near, tilt = 0) => P.cable(g, L, C.ellipsePts(cx, cy, rx, ry, 14, tilt, near ? 0 : PI, near ? PI : TAU), { w: 10, bands: false });

    // =========================================================================================
    // Shot 4 · «Sing along», bar 108: the front row from the stage, singing the line with
    // Tom, lighters and foam tridents up; the surfer is handed across over their heads
    // =========================================================================================
    const HOUSE = { a: '#6a1221', b: '#8a1a2c', tooth: '#fff6e0', toothT: '#fffdf4', toothS: '#d9c39a' };
    const FRONT = [
        { kind: 'imp', x: 150, y: 986, s: 300, wear: 'specs', cone: true, hold: 'lighter', ph: 0 }, // one of the two who got a cone for a hat
        { kind: 'skeleton', x: 385, y: 1090, s: 205, hawk: K.green, tee: 1, hold: 'trident', ph: 0.5 },
        { kind: 'imp', x: 622, y: 990, s: 300, wear: 'bow', hold: 'lighter', ph: 0.5 },
        { kind: 'skeleton', x: 856, y: 1096, s: 205, hawk: K.yellow, tee: 3, hold: 'lighter', ph: 0 },
    ];
    const BACK = [
        { kind: 'skeleton', x: 40, y: 880, s: 150, hawk: K.sky, tee: 2, hold: 'none' },
        { kind: 'imp', x: 262, y: 826, s: 215, wear: 'hat', hold: 'none' },
        { kind: 'skeleton', x: 505, y: 884, s: 150, hawk: K.sky, tee: 0, hold: 'none' },
        { kind: 'imp', x: 742, y: 826, s: 215, wear: null, hold: 'none' },
        { kind: 'skeleton', x: 968, y: 880, s: 150, hawk: K.green, tee: 2, hold: 'none' },
    ];
    // one fan facing us; an imp sings with its mouth (Devil.imp's round one) on the lead's words
    function fan(g, t, f, sing) {
        if (f.kind === 'skeleton') return I.fan(g, f.x, f.y, f.s, { kind: 'skeleton', hype: 1, lighter: f.hold === 'lighter' ? 0.9 : 0, hold: f.hold, t: t + (f.ph ?? 0) * S.BEAT * 0, hawk: f.hawk, tee: f.tee, look: f.look ?? 0 });
        const Pu = S.pulseAt(t), d = C.drawing(t), u = f.s * 0.67, sway = Math.sin((C.onTwos(t) * TAU) / 2.4), fr = Pu.since - Math.floor(Pu.since);
        const light = f.hold === 'lighter', hop = light ? 0.03 * Pu.pulse : 0.16 * Math.sin(PI * Math.min(1, fr)), sq = 0.06 * Pu.pulse, up = light ? 0.9 : 1;
        if (light) {
            const hand = [-0.66, -0.4 - up * 0.5], dir = [-0.34, -0.94];
            const tip = [f.x + (hand[0] + dir[0] * 0.03) * u * (1 + sq), f.y - hop * u + (hand[1] + dir[1] * 0.03) * u * (1 - sq)];
            I.lighter(g, 3, tip[0] + sway * 2, tip[1], u * 1.5, 0.9, d, -0.2 + sway * 0.14);
        }
        const coned = f.cone && typeof Verse3bProps !== 'undefined' && Verse3bProps.cone;
        Devil.imp(g, f.x, f.y, u, { squash: sq, hop, mood: sing ? 'awe' : 'grin', look: f.look ?? 0, wear: coned ? null : f.wear, armUp: up, tail: 0.05 * Math.cos((Pu.k + Pu.since) * PI), shadow: false });
        if (coned) Verse3bProps.cone(g, f.x + 0.02 * u, f.y - hop * u - 1.02 * u * (1 - sq) + 2, u * 1.1, -0.12); // as chorus 3's close shot of the pit wears it
    }
    const SUNG = S.WORDS.filter(([a]) => a >= T108 - 0.3 && a < T109).map(([a]) => S.snap(a)); // the words of the line, on their frames
    function singAlong(g, t, env) {
        const Pu = S.pulseAt(t), d = C.drawing(t), ph = Pu.k + E.out(Math.min(1, Pu.since / 0.5)), sing = S.mouth(t) != null;
        // the house from the stage: its rock in rays, the upper teeth, three spots that swing a step a beat
        C.sunburst(g, 500, 640, { n: 12, rot: 0.1 + t * 0.2, a: HOUSE.a, b: HOUSE.b });
        const spots = (a) => {
            g.save();
            g.globalCompositeOperation = 'screen';
            [[180, K.yellow, 0], [500, K.pink, 1], [820, K.aqua, 2]].forEach(([x, col, i]) => {
                const tx = x + 170 * Math.sin((ph + i * 0.66) * PI * 0.5) * (i % 2 ? -1 : 1);
                g.globalAlpha = a;
                g.fillStyle = col;
                g.beginPath();
                g.moveTo(x - 20, -10);
                g.lineTo(x + 20, -10);
                g.lineTo(tx + 150, 900);
                g.lineTo(tx - 150, 900);
                g.closePath();
                g.fill();
            });
            g.restore();
        };
        spots(0.2);
        // the row behind, both mitts up; the pit behind the front row is a tone darker
        for (const f of BACK) fan(g, t + 0.5 * S.BEAT, f, false);
        g.save();
        g.globalCompositeOperation = 'multiply';
        g.fillStyle = '#b59fd6';
        g.fillRect(0, 0, 1000, 1000);
        g.restore();
        spots(0.2 + 0.1 * Pu.pulse);
        for (let i = 0; i < 9; i++) {
            const x = 30 + i * 118, w = 58 + (i % 3) * 8, h = 92 + ((i * 5) % 4) * 16 + Math.abs(i - 4) * 12, lean = (i - 4) * -2.5;
            const pts = [[x - w / 2, -10], [x + w / 2, -10], [x + lean + w * 0.07, h], [x + lean - w * 0.07, h]];
            C.prism(g, pts, [w * 0.16, -w * 0.105], { front: HOUSE.tooth, top: HOUSE.toothT, side: HOUSE.toothS }, { lw: 3.2 });
            C.poly(g, [[x + w * 0.12, -6], [x + w / 2 - 2, -6], [x + lean + w * 0.05, h - 5]], { fill: HOUSE.toothS, lw: 0 });
            C.poly(g, pts, { ink: K.ink, lw: 3.2 });
        }
        // the surfer, handed along over their mitts
        const u = surfU(t), k = 2.3, sx = lerp(110, 890, u), want = lerp(40, 960, E.seg(t, T108, T109));
        I.crowd(g, t, { view: { k, cx: sx - (want - 500) / k, cy: 842 - (648 - 500) / k }, pan: 0, density: 0, surf: { u, on: true } });
        // the front row
        for (const f of FRONT) fan(g, t + f.ph * 0, f, sing);
        // the line leaves them as notes, one a word
        SUNG.forEach((w, i) => {
            if (!on(t, w)) return;
            const f = dr(t, w), who = FRONT[[0, 2, 0, 2, 0, 2, 0][i % 7]], k2 = S.pop(t, w, 0.2);
            if (f > 5) return;
            const nx = who.x + (i % 2 ? 70 : -20) + f * (i % 2 ? 10 : -8), ny = who.y - 236 - f * 30;
            C.note(g, nx, ny, 23 * k2 * (f > 4 ? 0.6 : 1), { color: [K.yellow, K.white, K.aqua][i % 3], kind: i % 2 ? 2 : 1, rot: (i % 2 ? 0.2 : -0.2) + (f % 2 ? 0.08 : -0.08) });
        });
    }

    // =========================================================================================
    // Shot 5 · «Full tilt», bar 109: the stage, the band flat out, the pit's mitts and flames
    // along the bottom; by his socket the Devil fights his way out of the cable and gets up
    // =========================================================================================
    const FIN = { k: 1.32, cx: 296, cy: 634 };
    const FIGHT = n(29), RISE = n(30), STAND = n(31);
    function fullTilt(g, t, env) {
        const St = I.stage(FIN, 0), Pu = S.pulseAt(t), d = C.drawing(t), ph = Pu.k + Pu.since;
        const o = { view: FIN, pan: 0, heat: 1, beatK: Pu.pulse };
        const tail = P.plugTail(HOME, 0), up = on(t, RISE), hopping = on(t, STAND) && dr(t, STAND) % 2 === 1, at = hopping ? [SIT[0], SIT[1] - 5] : SIT;
        let pose, wrap = 3;
        if (!on(t, FIGHT)) pose = { mood: 'angry', look: 1, squash: 0.02 * Pu.pulse, headTilt: 0.05, tail: 0.5 + 0.06 * Math.sin(ph * PI) };
        else if (!up) {
            // he heaves at the turns from inside
            const f = dr(t, FIGHT), w = f % 2 ? 1 : -1;
            pose = { mood: 'angry', look: w, eyes: f % 4 === 1 ? 'shut' : 'open', lean: 0.07 * w, squash: f % 2 ? -0.05 : 0.07, headTilt: -0.06 * w, tail: 0.5 + 0.1 * w };
            wrap = f >= 2 ? 2 : 3;
        } else {
            // up: the turns drop round his hooves, one stays on the hoof he lifts to shake it off
            const st = on(t, STAND), f = dr(t, st ? STAND : RISE);
            pose = st
                ? { mood: 'angry', look: f % 4 < 2 ? 1 : -0.3, squash: steps(t, STAND, [0.02, 0.1, 0.08]), lean: 0.05, headTilt: 0.04, step: 1, tail: 0.1 * (f % 2 ? 1 : -1), handR: [-0.56, -0.62], handL: [0.8, -1.16 + (f % 2 ? 0.07 : 0)] }
                : { mood: 'angry', look: 1, eyes: f < 1 ? 'shut' : 'open', squash: steps(t, RISE, [0.3, 0.24, 0.18, 0.14]), lean: 0.1, tail: 0.14, handR: [-0.5, -0.42], handL: [0.52, -0.42] };
        }
        const co = { ...o, hype: 1, lighters: 0.3 };
        I.venue(g, t, o);
        dress(g, t, co, 'back');
        band(g, t, St, { bounce: 0.3 * Pu.pulse });
        I.beams(g, t, { ...o, front: true });
        dress(g, t, co, 'stage');
        const hoof = up && on(t, STAND) ? [at[0] + 0.19 * U + 3, at[1] - 0.27 * U] : null; // the hoof in the air, the cable round its shin
        P.layer(g, FIN, 0, (L) => {
            P.socket(g, L, { live: 1, beat: Pu.pulse, face: 'calm', d });
            P.jack(g, L);
            // the cable: from the plug down to the floor, to him, and on to the car; once he is up
            // it runs from the plug straight to the hoof it has hold of
            if (hoof) {
                P.cable(g, L, C.curve([tail, [tail[0] + 14, tail[1] + 5], [lerp(tail[0], hoof[0], 0.5), lerp(tail[1], hoof[1], 0.5) + 12], [hoof[0] - 21, hoof[1] + 1]], false, 8));
                P.cable(g, L, C.curve([[196, FLOOR - 2], [228, FLOOR + 3], [257, FLOOR], [P.JACK[0] - 1, FLOOR - 22], [P.JACK[0], P.JACK[1] + 6]], false, 8), { bands: false });
            } else P.cable(g, L, C.curve([tail, [tail[0] + 16, tail[1] + 4], [tail[0] + 24, 770], [102, FLOOR], [150, FLOOR - 4], [206, FLOOR + 3], [257, FLOOR], [P.JACK[0] - 1, FLOOR - 22], [P.JACK[0], P.JACK[1] + 6]], false, 8));
            P.plug(g, L, HOME, { out: 0 });
            if (up) {
                // the turns he has stepped out of, the far halves
                ring(g, L, at[0] + 4, at[1] - 5, 54, 9, false, 0.05);
                ring(g, L, at[0] - 2, at[1] - 13, 50, 8, false, -0.06);
                if (hoof) ring(g, L, hoof[0], hoof[1], 21, 5.5, false, 0.1);
            }
        });
        if (up) {
            devil(g, St, at, pose);
            P.layer(g, FIN, 0, (L) => {
                ring(g, L, at[0] + 4, at[1] - 5, 54, 9, true, 0.05);
                ring(g, L, at[0] - 2, at[1] - 13, 50, 8, true, -0.06);
                if (hoof) {
                    // the loop on his hoof, and the slack from it down to the heap
                    P.cable(g, L, C.curve([[hoof[0] + 20, hoof[1] + 2], [hoof[0] + 34, hoof[1] + 12], [hoof[0] + 40, at[1] - 16], [hoof[0] + 30, at[1] - 7]], false, 6), { w: 10, bands: false });
                    ring(g, L, hoof[0], hoof[1], 21, 5.5, true, 0.1);
                }
            });
        } else sat(g, St, at, pose, { between: (g2, sc) => coils(g2, sc, pose, wrap) });
        I.crowd(g, t, co);
        dress(g, t, co, 'front');
    }

    function draw(g, t, env) {
        g.lineJoin = 'round';
        if (!on(t, TW)) plugScene(g, t, env);
        else if (!on(t, T108)) house(g, t, env);
        else if (!on(t, T109)) singAlong(g, t, env);
        else fullTilt(g, t, env);
    }
    // a dirty edit on the hard cut in
    const post = (t) => (t < T0 + FR - 1e-6 ? { track: 0.25 } : t < T0 + 3 * FR - 1e-6 ? { track: 0.1 } : {});

    Seg.hellplug = { shots: [[T0, TW, 'The plug'], [TW, T106, 'Lighters'], [T106, T108, 'Chorus 4'], [T108, T109, 'Sing along'], [T109, T110, 'Full tilt']], draw, post };
})();
