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
// Props: segments/hellplug-props.js (HellplugProps); the title and the cactus are chorus 1's.
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
        Devil.draw(g, p[0], p[1], St.car.s, pose);
    };
    const sat = (g, St, at, pose, o) => {
        const p = St.at(at);
        P.seated(g, p[0], p[1], St.car.s, pose, o);
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
    const GRIP = [[50, -29], [45, 30]]; // where his two mitts rest on the plug (its own frame)
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
                pose[up] = [sx * 0.3, f === 0 ? -0.86 : -0.82];
                pose[second ? 'handR' : 'handL'] = second ? [-0.3, -0.72] : [0.52, -0.52];
                // the drop: from his mouth to the mitt, one drawing in the air, then a splash
                const m = fromDevil([0, -1.08], at, pose), h = fromDevil([sx * 0.33, -0.95], at, pose);
                if (f === 0) fx.push(['drop', lerp(m[0], h[0], 0.55), lerp(m[1], h[1], 0.4) - 4, sx]);
                else if (f === 1) fx.push(['splash', h[0], h[1] - 3]);
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
                // the plug in his lap, a mitt on each end of it
                plugAng = steps(t, LANDED, [0.3, 0.1, 0.16]);
                plugAt = [at[0] - 44, at[1] - steps(t, LANDED, [74, 50, 58, 56])];
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
            else if (seat) {
                pose.handR = toDevil(P.plugPt(plugAt, plugAng, [10, -31]), ga, gp);
                pose.handL = toDevil(P.plugPt(plugAt, plugAng, [58, -27]), ga, gp);
            } else {
                pose.handR = toDevil(P.plugPt(plugAt, plugAng, GRIP[0]), ga, gp);
                pose.handL = toDevil(P.plugPt(plugAt, plugAng, GRIP[1]), ga, gp);
            }
        }
        // --- the picture ---------------------------------------------------------------------
        g.save();
        g.translate(SHIFT, 0);
        I.venue(g, t, o);
        band(g, t, St);
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
        I.crowd(g, dark ? POP + 2 * FR : t, { ...o, hype: 0.8, lighters: 0 });
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
        for (const [kind, x, y, a] of fx) {
            if (kind === 'drop' || kind === 'sweat') {
                const s = kind === 'drop' ? 7 : 6.5;
                g.save();
                g.translate(x, y);
                g.rotate(kind === 'drop' ? a * 0.9 : a);
                C.poly(g, C.curve([[0, -s * 1.5], [s * 0.7, 0.1 * s], [0, s * 0.8], [-s * 0.7, 0.1 * s]], true, 5), { fill: kind === 'drop' ? K.white : K.aqua, ink: K.ink, lw: 2.4 * L });
                g.restore();
            } else if (kind === 'splash') {
                for (const [dx, dy] of [[-13, -9], [0, -15], [13, -9]]) C.poly(g, [[x + dx * 0.5, y + dy * 0.5], [x + dx, y + dy]], { ink: K.ink, lw: 5 * L, close: false });
                for (const [dx, dy] of [[-13, -9], [0, -15], [13, -9]]) C.poly(g, [[x + dx * 0.5, y + dy * 0.5], [x + dx, y + dy]], { ink: K.white, lw: 2.2 * L, close: false });
            }
        }
    }

    function draw(g, t, env) {
        g.lineJoin = 'round';
        plugScene(g, t, env);
    }
    // a dirty edit on the hard cut in
    const post = (t) => (t < T0 + FR - 1e-6 ? { track: 0.25 } : t < T0 + 3 * FR - 1e-6 ? { track: 0.1 } : {});

    Seg.hellplug = { shots: [[T0, TW, 'The plug'], [TW, T106, 'Lighters'], [T106, T108, 'Chorus 4'], [T108, T109, 'Sing along'], [T109, T110, 'Full tilt']], draw, post };
})();
