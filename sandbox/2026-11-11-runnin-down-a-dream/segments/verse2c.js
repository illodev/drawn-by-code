// «Verse 2 · three days of rain», last part: bars 50–53 (70.96–76.63 s). Plan B overdoes it.
//   bar 50      Cold               the shot verse2b ends on (the hearse tows the machine through
//                                  the rain, the Devil on its running board cranking with both
//                                  mitts, an imp stuck in the funnel): on «cold» the machine goes
//                                  over the top. Frost races over it, the funnel coughs the imp
//                                  out in a burst of snow, the rain turns to snowflakes, the
//                                  crank snaps off in his mitt, the rig skids to a halt on its
//                                  locked wheels and the frost runs up his arm while he laughs
//   bars 51–52  Hell freezes over  Hell's office: the imp from the funnel drops in with the
//                                  cold; the lava fall in the window freezes, the bin's flame
//                                  after it; three imps shiver on the beat, a scarf and
//                                  earmuffs pop on one a beat on «no sunshine», the board
//                                  HELL · CLOSED: SNOW swings in, one imp builds a snowman with
//                                  horns, one jumps to warm his mitts at the frozen flame
//   bar 53      On ice             the road, wide, the rain thinning into snow: the machine
//                                  iced over on its hitch, the Devil in a block of ice beside
//                                  it, the chauffeur in a scarf knocking on the block from his
//                                  seat on the beat, the band's car far off, top up, still
//                                  playing
// Props: segments/verse2c-props.js (Verse2cProps); the weather's own: weather.js; the last
// shot of verse2b is rebuilt here from its numbers (V2B gives its whirl, whistle, spray, rivets).
(() => {
    const Seg = (window.Seg = window.Seg || {});
    const C = Cereal, K = C.COL, E = Ease, S = Song, W = Weather, V = V2B, Q = Verse2cProps, ICE = W.ICE, twos = S.twos, b = S.b, B = S.B, pop = S.pop, TAU = Math.PI * 2;
    const T49 = B(49), T50 = B(50), T51 = B(51), T53 = B(53), T54 = B(54);
    const n = (k) => b(200 + k); // beat k of the block (bar 50 is beats 0–3, bar 51 4–7, bar 52 8–11, bar 53 12–15)
    const CAR = Rig.CAR, LANE = World.LANE, FAR = LANE - 53, BEAT = S.BEAT, FR = 1 / 24;
    const at = (t, a) => t >= a - 1e-6;
    const clamp = (v, a = 0, c = 1) => Math.max(a, Math.min(c, v));
    const seg2 = (t, a, c) => E.seg(twos(t, a), a, c); // 0..1 on twos, counted from a
    const bump2 = (t, a, dur = 0.3) => E.bump(twos(t, a), a, dur);
    const dAt = (t, a) => Math.floor((t - a) * 12 + 1e-6); // the drawing since a (negative before it)
    const rot = ([x, y], a) => [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)];
    const COLD = S.snap(71.56); // «cold»: the machine goes over the top

    // =========================================================================================
    // The join with verse2b: its last shot («Unstoppable»), by its numbers
    // =========================================================================================
    const CS = 176, MX = 408, GY = 900; // the machine's scale and place in the close shot
    const WIDE_M = 176; // where the machine is in verse2b's wide framing (the world is drawn for that one)
    const LAND = T49 + 2 / 12, PLUG = b(197);
    const POPS = [[b(198), [-0.625, -1.735], [0.5, -3.2]], [b(198) + S.snap(BEAT / 2), [-1.105, -1.261], [-1.9, -2.3]], [b(199), [-0.175, -1.735], [-0.8, -3.4]], [b(199) + S.snap(BEAT / 2), [-0.925, -0.625], [-1.5, -1.6]]];
    const crankC = (t) => {
        const u = twos(t, T49) - (LAND + 1 / 12);
        return 2.2 + 9 * (LAND + 1 / 12 - T49) + 11 * u + 8.5 * u * u;
    };
    const JAM = crankC(COLD); // the angle the handle jams at
    const MACH = { axle: -0.3, R: 0.28, valve: [0.31, -2.13], mouth: [-0.18, -3.02], mouthR: 0.74 * 0.88 };
    // a point of the machine's sprung body (weather.js keeps its move to itself)
    const onBody = (p, o) => {
        const sh = clamp(o.shake ?? 0), d = C.drawing(o.t ?? 0);
        const dx = sh ? (d % 2 ? 1 : -1) * 0.014 * sh : 0, dy = (o.bounce ?? 0) * 0.06 + (sh ? [-1, 0.6, 0.1][((d % 3) + 3) % 3] * 0.014 * sh : 0);
        const q = rot([p[0] - MACH.axle, p[1] + MACH.R], o.pitch ?? 0);
        return [q[0] + MACH.axle + dx, q[1] - MACH.R + dy];
    };
    // The road's clock: verse2b's until «cold», then the rig skids to a halt in STOP seconds.
    const STOP = 0.5, X0 = (t) => Rig.X(t) - 545;
    const roadX = (t) => {
        if (t < COLD) return X0(t);
        const u = Math.min(STOP, t - COLD);
        return X0(COLD) + Rig.SPEED * (u - (u * u) / (2 * STOP));
    };
    const going = (t) => (t < COLD ? 1 : Math.max(0, 1 - (t - COLD) / STOP)); // its speed, 1..0
    const XSTOP = roadX(COLD + STOP);
    // the black the locked wheels leave on the road, in the wide framing's coordinates
    function skid(g, X, mx, my = FAR) {
        const len = Math.min(900, X - X0(COLD));
        if (len <= 2) return;
        const wx = mx - 0.372 * CAR, wy = my + 0.05 * CAR;
        for (const [dx, dy] of [[0, -3], [0, 5], [30, -22], [30, -15]]) C.poly(g, [[wx + dx - len, wy + dy], [wx + dx, wy + dy]], { ink: '#2b2e42', lw: 3.4, close: false });
    }
    const chauffeur = (g2, seats, sc0, pose, scarf, t) => Rides.at(g2, sc0, seats.chauffeur, (px, py, sc) => {
        Rides.skeleton(g2, px, py, sc, { jaw: 0, shadow: false, ...pose });
        if (scarf) Q.skelScarf(g2, px, py, sc, { t });
    });

    // =========================================================================================
    // Bar 50 · Cold
    // =========================================================================================
    const FUNNEL_IMP = true; // verse2b leaves an imp stuck in the funnel: «cold» shoots it out, and it lands in Hell
    const SNAPPED = [ // the two drawings between the snap and the pose the ice will keep
        { lean: 0.1, squash: -0.07, handR: [-0.74, -1.34], handL: [0.55, -1.22], headTilt: -0.12, tail: 0.3 },
        { lean: 0.03, squash: 0.05, handR: [-0.7, -0.93], handL: [0.66, -0.88], headTilt: -0.08, tail: 0.1 },
    ];
    function coldShot(g, t) {
        const s = CS, z = s / CAR, X = roadX(t), v = going(t), Pu = S.pulseAt(t), ph = (t - b(Pu.k)) / BEAT, d = C.drawing(t);
        const dc = dAt(t, COLD), cold = dc >= 0, snapped = dc >= 1;
        g.save();
        g.translate(MX, GY);
        g.scale(z, z);
        g.translate(-WIDE_M, -FAR);
        World.back(g, t, X, 'rain');
        if (cold) skid(g, X, WIDE_M);
        g.restore();
        W.stormCloud(g, MX - 6, 226, s, { grow: 1, t });

        const iced = !cold ? 0.3 : [0.5, 0.7, 0.88][dc] ?? 1, shake = !cold ? 1 : [1, 0.5][dc] ?? 0;
        const ho = { bounce: 0.3 * Math.sin((ph + 0.5) * TAU) * v - (cold ? 0.45 * E.bump(t, COLD, STOP) : 0), lean: 0 }, off = W.towedAt(0, 0, s, ho);
        const crank = cold ? JAM : crankC(t), pumpU = cold ? 0 : ((twos(t, LAND) - LAND) / (BEAT / 2)) % 1;
        const mo = {
            towed: true, t, pitch: off.pitch, spin: (cold ? X0(COLD) : X) / (0.28 * CAR), crank: snapped ? Q.NO_CRANK : crank, shake, iced, smoke: 0.9,
            bounce: 0.25 * Math.sin((ph + 0.2) * TAU) * v - (cold ? 0.5 * bump2(t, COLD, 0.25) : 0), needles: 1, puff: pumpU * 0.6,
        };
        const pt = (p) => {
            const q = onBody(p, mo);
            return [MX + q[0] * s, GY + q[1] * s];
        };
        W.machine(g, MX, GY, s, mo);
        if (snapped) Q.snappedStub(g, MX, GY, s, { a: JAM, ice: iced, c: onBody(Q.COG, mo) });
        Rides.hearse(g, MX - off.x, GY - off.y, s, { spin: X / (0.58 * CAR), ...ho, flames: 0.5 * v, t }, (g2, seats, sc0) => chauffeur(g2, seats, sc0, { headDy: 0.02 * Pu.pulse }, false, t));
        if (v > 0.04) V.wheelSpray(g, MX - 0.372 * s, GY + 0.05 * s, s, t, 0.8 * v, 0, 2);

        // --- what verse2b left going: the valve's whistle, the rivets in the air, a glint on the dials
        const MPt = W.machinePoints(mo);
        V.whistle(g, ...pt(MACH.valve), s, t, cold ? [0.5][dc] ?? 0 : 1);
        if (dc < 1) POPS.forEach(([a, p, dir]) => V.rivetPop(g, ...pt(p), s, t - a, dir));
        else {
            // the holes stop hissing: each one keeps a bead of ice
            POPS.forEach(([, p]) => {
                const q = pt(p);
                W.icicle(g, 3.2, q[0], q[1], (0.05 + 0.09 * iced) * s, 0.045 * s, 0);
                g.beginPath();
                g.arc(q[0], q[1], 0.03 * s, 0, TAU);
                g.fillStyle = '#2a2438';
                g.fill();
            });
        }
        const fd = dAt(t, b(199));
        if (fd >= 0 && fd < 5) {
            const tw = [0.6, 1, 0.8, 0.5, 0.25][fd];
            C.sparkle(g, ...pt([-0.9, -1.48]), 30 * tw, { color: '#ffffff', ink: ICE.line, lw: 2.4 });
            C.sparkle(g, ...pt([-0.2, -1.5]), 22 * tw, { color: '#ffffff', ink: ICE.line, lw: 2.4, rot: 0.3 });
        }

        // --- the imp in the funnel's mouth; «cold» coughs it out with a burst of snow
        const step = [MX + MPt.step[0] * s, GY + MPt.step[1] * s], hub = [MX + MPt.hub[0] * s, GY + MPt.hub[1] * s];
        const mouth = pt(MACH.mouth), IS = 0.67 * s;
        if (FUNNEL_IMP && !cold) {
            const bob = 0.1 * Math.max(0, Math.sin(pumpU * Math.PI)) * s, shiver = d % 2 ? 3 : -3;
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
            if (pumpU > 0.55) V.puffs(g, [[mouth[0] - 0.5 * s, mouth[1] - 0.02 * s, 0.14 * s, 5, d], [mouth[0] + 0.5 * s, mouth[1] - 0.04 * s, 0.12 * s, 5, d + 2]], '#fffdf4', 2.8);
            Devil.imp(g, mouth[0] + shiver, mouth[1] + 0.52 * IS - bob, IS, { armUp: 0, squash: 0, look: 1, shadow: false, wear: 'hat', mood: 'oops', tail: 0 });
            g.restore();
            W.breath(g, mouth[0] + 0.2 * IS, mouth[1] - 0.2 * IS - bob, IS, t, 1);
        }
        if (cold && dc < 5) {
            Q.snowBurst(g, mouth[0], mouth[1] - 0.04 * s, s, dc);
            if (FUNNEL_IMP && dc < 3) {
                // three drawings in the air: up through its own snow and out of the top of the frame
                const up = [[0.08, -0.62], [0.34, -1.5], [0.62, -2.5]][dc], x = mouth[0] + up[0] * s, y = mouth[1] + up[1] * s;
                g.setLineDash([14, 12]);
                C.poly(g, [[mouth[0] + 0.02 * s, mouth[1] - 0.3 * s], [x - 0.1 * s, y + 0.5 * s]], { ink: K.ink, lw: 3.2, close: false });
                g.setLineDash([]);
                g.save();
                g.translate(x, y - 0.34 * s);
                g.rotate(0.35 + 0.9 * dc);
                Devil.imp(g, 0, 0.34 * s, IS, { armUp: 1, squash: -0.1, look: 1, shadow: false, wear: 'hat', mood: 'awe', tail: 0.2 });
                g.restore();
            }
        }

        // --- the Devil on the running board: both mitts on the handle, then the handle in his mitt
        const shv = dc >= 6 ? (d % 2 ? 1.5 : -1.5) : 0, fx = step[0] + 0.34 * s + shv, fy = step[1];
        if (!snapped) {
            const h = MPt.handle(crank), hs = [MX + h[0] * s, GY + h[1] * s], jig = d % 2 ? 1 : -1;
            const q = cold ? 0.1 : 0.03 * jig, lean = cold ? -0.2 : -0.1 - 0.03 * Math.cos(crank);
            const r = rot([(hs[0] - fx) / s, (hs[1] - fy) / s], -lean), grip = [r[0] / (1 + q), r[1] / (1 - q)];
            if (!cold) V.whirl(g, hub[0], hub[1], s, crank, 0.26, 1);
            Devil.draw(g, fx, fy, s, {
                mood: at(t, n(1)) ? 'laugh' : 'grin', look: -1, shadow: false, lean, squash: q, headTilt: cold ? 0.09 : 0.05 * jig, headDy: cold ? 0.03 : 0.02 * (jig > 0),
                tail: cold ? -0.1 : 0.16 * jig, step: cold ? 0 : jig * 0.6, handR: grip, handL: [grip[0] + 0.1, grip[1] + 0.085],
            });
            if (!cold) {
                // soaked and delighted: his own rain runs off his horns and his elbows
                g.save();
                g.translate(fx, fy);
                g.rotate(lean);
                W.drips(g, 0, 0, s, t, 0, { pts: [[-0.47, -2.02], [0.47, -2.0], [-0.52, -1.18], [0.5, -1.2], [0.36, -0.42]], len: 0.5 });
                g.restore();
            } else {
                // it jams: the handle stops dead under his mitts
                for (const [a, r0, r1] of [[-2.2, 0.36, 0.52], [-1.5, 0.4, 0.6], [-0.8, 0.36, 0.52]]) C.poly(g, [[hs[0] + Math.cos(a) * r0 * s, hs[1] + Math.sin(a) * r0 * s], [hs[0] + Math.cos(a) * r1 * s, hs[1] + Math.sin(a) * r1 * s]], { ink: K.ink, lw: 3.2, close: false });
            }
            W.breath(g, fx - 0.62 * s, fy - 1.0 * s, s, t + 0.3, -1);
        } else {
            // the snap: a star on the shaft, his arms fly up with the handle; then he is as the ice will keep him
            if (dc < 3) C.burst(g, hub[0] - 0.03 * s, hub[1] + 0.02 * s, { r0: (0.1 + 0.04 * dc) * s, r1: (0.24 + 0.07 * dc) * s, n: 8, seed: 'v2c-snap', jitter: 0.2, rot: dc * 0.4, fill: dc === 1 ? '#ffffff' : K.yellow, ink: K.ink, lw: 3.2 });
            const pose = SNAPPED[dc - 1] ?? {}, armK = dc < 2 ? 0 : [0.14, 0.3, 0.5, 0.7, 0.88][dc - 2] ?? 1, bodyK = dc < 7 ? 0 : [0.3, 0.65][dc - 7] ?? 1;
            Q.devilWithCrank(g, fx, fy, s, { pose: { ...pose, look: -1 }, crankFrost: dc < 3 ? 0 : E.seg(dc, 3, 7) });
            if (dc >= 3) {
                Q.devilFrost(g, fx, fy, s, { arm: armK, body: bodyK });
                // the handle rings like a bell in the cold, on the bar's last beat
                const tk = bump2(t, n(3), 0.34);
                if (tk > 0) C.sparkle(g, fx - 0.93 * s, fy - 1.27 * s, (0.1 + 0.2 * tk) * s, { color: '#ffffff', ink: ICE.line, lw: 2.4, rot: 0.2 });
                W.breath(g, fx + 0.2 * s, fy - 1.04 * s, s, t + 0.3, 1);
            }
        }
        World.rain(g, t, 1.15 * (!cold ? 1 : [0.75, 0.45, 0.18][dc] ?? 0));
        if (cold) W.snowfall(g, t, [0.35, 0.6, 0.85][dc] ?? 1);
    }

    // =========================================================================================
    // Bars 51–52 · Hell freezes over
    // =========================================================================================
    const IX = [358, 574, 790], IY = 936, IS = 132, WEAR = ['specs', 'hat', 'bow'], SCARF = [K.yellow, K.green, K.violet];
    const WIN = n(5), WIPE = 3 / 12, FZ = WIN + WIPE; // the lava fall freezes, then the bin's flame
    const DRESS = [n(6), n(7), n(8)]; // a scarf and earmuffs on one imp a beat
    const BOARD = { at: n(9), x: 277, y: 452, s: 80 }; // the nail HELL · CLOSED: SNOW hangs from
    const SNOWMAN = { x: 204, y: 950, s: 140, base: n(7), body: n(8), head: n(10), face: n(11) };
    const LANDS = T51 + 2 / 12; // the imp from the funnel lands
    const winPath = () => {
        const p = new Path2D();
        p.moveTo(44, 400);
        p.lineTo(44, 210);
        p.quadraticCurveTo(44, 96, 148, 96);
        p.quadraticCurveTo(252, 96, 252, 210);
        p.lineTo(252, 400);
        p.closePath();
        return p;
    };
    const coldOf = (t) => (t < WIN - 1e-6 ? E.lerp(0.1, 0.3, seg2(t, T51, WIN)) : t < FZ - 1e-6 ? 0.3 : E.lerp(0.34, 1, seg2(t, FZ, n(8))));

    function hellShot(g, t) {
        const Pu = S.pulseAt(t), d = C.drawing(t), ph = Pu.k + Pu.since, k = coldOf(t);
        Seg.planb.set(g, t, 1);
        const R = Seg.planb.board(g, t, 1);
        Seg.planb.plan(g, t, R);
        W.frozenHell(g, t, { k, board: false, flakes: 0 });
        if (at(t, WIN) && !at(t, FZ)) {
            // the lava fall freezes from the top down, three drawings: a front of crystals
            const u = [0.42, 0.74, 1][dAt(t, WIN)], yf = 96 + 312 * u, front = [];
            for (let i = 0; i <= 12; i++) front.push([30 + i * 20, yf + (i % 2 ? -13 : 9)]);
            g.save();
            g.beginPath();
            g.moveTo(20, 70);
            g.lineTo(280, 70);
            g.lineTo(280, front[12][1]);
            for (let i = 12; i >= 0; i--) g.lineTo(front[i][0], front[i][1]);
            g.closePath();
            g.clip();
            W.frozenHell(g, t, { k: 0.34, board: false, flakes: 0 });
            g.restore();
            g.save();
            g.clip(winPath());
            C.poly(g, front, { ink: ICE.line, lw: 6, close: false });
            C.poly(g, front, { ink: ICE.white, lw: 2.6, close: false });
            g.restore();
        }
        const wd = dAt(t, WIN);
        if (wd >= 1 && wd < 5) {
            // it rings as it sets
            const tw = [0, 0.7, 1, 0.7, 0.4][wd];
            C.sparkle(g, 96, 170, 34 * tw, { color: '#ffffff', ink: ICE.line, lw: 2.4 });
            C.sparkle(g, 214, 300, 24 * tw, { color: '#ffffff', ink: ICE.line, lw: 2.4, rot: 0.4 });
        }
        // the board on its nail under the window: it drops into place and swings out
        if (at(t, BOARD.at)) {
            const u = twos(t, BOARD.at) - BOARD.at, p = pop(t, BOARD.at, 0.22);
            W.closedBoard(g, BOARD.x, BOARD.y, BOARD.s * p, { swing: 0.14 * Math.exp(-u * 3.4) * Math.cos(u * 13), snow: 1 });
        }
        // the bin: plan A's ashes burn in it until the cold gets there
        const fz = at(t, FZ), fd = dAt(t, FZ);
        Q.bin(g, { frozen: fz, d, f: C.drawing(FZ), frost: fz ? seg2(t, FZ, FZ + 0.6) : 0, glint: fz && (fd < 3 || d % 8 < 2), pop: fz ? [1.14, 1.06][fd] ?? 1 : 1 });

        // the snowman, left of the first imp
        const sm = SNOWMAN;
        Q.snowman(g, sm.x, sm.y, sm.s, { base: pop(t, sm.base, 0.2), body: pop(t, sm.body, 0.2), head: pop(t, sm.head, 0.2), face: pop(t, sm.face, 0.2), d });

        // --- the imps -----------------------------------------------------------------------------
        const startle = bump2(t, WIN, 0.25), shiverOn = at(t, WIN + 2 / 12);
        const shake = shiverOn ? Math.exp(-Pu.since * 2.6) : 0; // a shudder on every beat, in unison
        const jx = (d % 2 ? 1 : -1) * 4.5 * shake, sq = (d % 2 ? 0.07 : 0.015) * shake;
        const touchAt = [n(10), n(11)], reach = Math.max(...touchAt.map((a) => bump2(t, a, 3 / 12)));
        IX.forEach((ix, i) => {
            const dressed = at(t, DRESS[i]), dp = pop(t, DRESS[i], 0.22), cosy = dressed ? 0.35 : 1;
            const pose = { wear: WEAR[i], look: -1, mood: at(t, WIN + 3 / 12) ? (dressed ? 'grin' : 'oops') : 'awe', hop: 0.16 * startle, squash: sq * cosy + 0.03 * Pu.pulse, armUp: 0, tail: 0.05 * Math.sin((ph + i) * Math.PI), shadow: true };
            let x = ix + jx * cosy, fall = null;
            if (i === 0) {
                // the builder: a pat for each ball, both mitts up when the horns go on
                const pat = Math.max(0.3 * bump2(t, sm.base, 0.25), 0.75 * bump2(t, sm.body, 0.25), bump2(t, sm.head, 0.25));
                pose.armUp = at(t, sm.face) ? 0.55 + 0.45 * pop(t, sm.face, 0.2) : pat;
                pose.hop += 0.12 * bump2(t, sm.body, 0.25) + 0.2 * bump2(t, sm.head, 0.25) + 0.22 * bump2(t, sm.face, 0.25);
                if (at(t, sm.face)) pose.mood = 'grin';
            } else if (i === 1) {
                if (FUNNEL_IMP && !at(t, LANDS)) {
                    // still falling: two drawings head over heels in front of the blueprint
                    const f = dAt(t, T51);
                    fall = { y: [450, 740][f], a: [2.3, 0.9][f] };
                } else if (FUNNEL_IMP) {
                    const f = dAt(t, LANDS);
                    pose.squash += [0.26, -0.07, 0.05][f] ?? 0;
                    pose.hop += f === 1 ? 0.06 : 0;
                }
                if (at(t, n(10))) pose.look = at(t, n(11)) ? -1 : 1;
                if (at(t, sm.face)) pose.mood = 'awe';
            } else {
                // the one by the bin: he turns to it and jumps to hold his mitts to the flame
                if (FUNNEL_IMP && !at(t, WIN)) pose.look = at(t, LANDS) ? -1 : 0.4;
                if (at(t, n(10))) {
                    pose.look = 1;
                    pose.armUp = 1;
                    pose.hop += 0.3 * reach;
                    pose.squash += -0.05 * reach;
                    pose.mood = at(t, n(10) + 2 / 12) ? 'oops' : 'awe';
                }
            }
            if (FUNNEL_IMP && i !== 1 && !at(t, WIN)) {
                // the other two: it comes down between them, and they jump
                pose.look = i === 0 ? (at(t, LANDS) ? 1 : 0.5) : pose.look;
                pose.hop += 0.14 * bump2(t, LANDS, 0.25);
                pose.mood = 'awe';
            }
            const wearIt = (g2) => {
                if (!dressed) return;
                g2.translate(0, -0.6);
                g2.scale(dp, dp);
                g2.translate(0, 0.6);
                W.scarf(g2, IS, SCARF[i], { t, blow: 0.35 });
                W.earmuffs(g2, IS, WEAR[i]);
                if (pose.armUp > 0.25 && dp > 0.99) Q.impArms(g2, IS, pose.armUp); // its mitts, over the earmuffs
            };
            if (fall) {
                g.setLineDash([14, 12]);
                C.poly(g, [[ix + 8, fall.y - 250], [ix + 2, fall.y - 120]], { ink: '#fffdf4', lw: 3.2, close: false });
                g.setLineDash([]);
                g.save();
                g.translate(ix, fall.y - 0.5 * IS);
                g.rotate(fall.a);
                Devil.imp(g, 0, 0.5 * IS, IS, { ...pose, armUp: 1, squash: -0.08, hop: 0, mood: 'awe', shadow: false });
                W.onImp(g, 0, 0.5 * IS, IS, { squash: -0.08 }, (g2) => W.snowCap(g2, 3 / IS, [-0.3, -1.3], [0.3, -1.3], 0.07, 'v2c-hat', 0));
                g.restore();
                return;
            }
            Devil.imp(g, x, IY, IS, pose);
            W.onImp(g, x, IY, IS, pose, wearIt);
            if (i === 1 && FUNNEL_IMP && !dressed) W.onImp(g, x, IY, IS, pose, (g2) => W.snowCap(g2, 3 / IS, [-0.3, -1.3], [0.3, -1.3], 0.07, 'v2c-hat', 0)); // the snow it brought on its hat
            if (dressed && dAt(t, DRESS[i]) < 3) C.sparkle(g, x + 76, IY - 158 - 8 * dAt(t, DRESS[i]), 30 - 6 * dAt(t, DRESS[i]), { color: K.white, ink: K.ink, lw: 3 });
            if ((shiverOn || (FUNNEL_IMP && i === 1 && at(t, LANDS + 2 / 12))) && !(i === 0 && at(t, sm.head - 2 / 12))) W.breath(g, x + (i === 0 ? -22 : 22), IY - 0.42 * IS - pose.hop * IS, IS, t + i * 0.3, i === 0 ? -1 : 1);
        });
        if (FUNNEL_IMP) {
            // where it lands: a puff of the snow it brought, flakes thrown out
            const f = dAt(t, LANDS);
            if (f >= 0 && f < 4) {
                const u = [0.5, 0.8, 1, 1.1][f], fade = [1, 1, 0.75, 0.45][f];
                Q.puffs(g, [[IX[1] - 78 * u - 20, IY - 14, 26 * fade, 6, f], [IX[1] + 78 * u + 20, IY - 12, 24 * fade, 6, f + 2], [IX[1] - 40 * u - 60, IY - 40 * u, 17 * fade, 5, f + 1], [IX[1] + 40 * u + 62, IY - 44 * u, 16 * fade, 5, f]], '#f4fbff', 2.8, ICE.line);
                for (let i = 0; i < 6; i++) {
                    const a = Math.PI * (1.1 + 0.16 * i);
                    Q.flake(g, IX[1] + Math.cos(a) * (90 + 110 * u), IY - 60 + Math.sin(a) * (40 + 120 * u), 9, i + f * 0.3, 2.6);
                }
            }
        }
        // the flame rings when a mitt gets to it
        touchAt.forEach((a) => {
            const f = dAt(t, a + 1 / 12);
            if (f >= 0 && f < 3) C.sparkle(g, 906, 786, [34, 24, 14][f], { color: '#ffffff', ink: ICE.line, lw: 2.4, rot: f * 0.3 });
        });
        W.snowfall(g, t, 0.85 * k);
    }

    // =========================================================================================
    // Bar 53 · On ice: the roadside the thaw comes back to
    // =========================================================================================
    // Everything is where the rig skidded to a halt. Frame units, the cars at Rig.CAR.
    const OFF = W.towedAt(0, 0, CAR, {});
    const ROAD = {
        // the world: World.back(g, t, ROAD.X, 'rain'). A stretch of the road a little further on than
        // the skid ends, picked so that no pole, cactus or sign stands behind the funnel, the block
        // or the chauffeur's head
        X: 64118,
        hearse: { x: 606, y: FAR + 36, s: CAR }, // Rides.hearse; its machine is on the hitch (Weather.towedAt)
        machine: { x: 606 + OFF.x, y: FAR + 36 + OFF.y, s: CAR, pitch: OFF.pitch },
        devil: { x: 480, y: 930, s: CAR }, // his ground point in the block (pose: Verse2cProps.FROZEN, the crank in his right mitt)
        block: Q.BLOCK, // Weather.iceBlock's options for it
        knocks: [n(13), n(14), n(15)],
    };
    const SEAT = Rides.hearseSeats().chauffeur, SKX = ROAD.hearse.x + SEAT[0] * CAR, SKY = ROAD.hearse.y + SEAT[1] * CAR; // the chauffeur's own origin
    const SHOULDER = [-0.33, -0.85]; // of his right arm (screen left), in his units
    const TOUCH = Q.blockSide(ROAD.devil.x, ROAD.devil.y, CAR, ROAD.block, 2.02); // where his mitt meets the ice
    // his right mitt: on the ice on the beat, cocked back before it, resting near it otherwise
    const mittAt = (t, knocks) => {
        let back = 0.11;
        for (const a of knocks) {
            if (t >= a - 1 / 12 - 1e-6 && t < a - 1e-6) back = 0.2;
            else if (t >= a - 1e-6 && t < a + 1 / 12 - 1e-6) back = 0;
            else if (t >= a + 1 / 12 - 1e-6 && t < a + 2 / 12 - 1e-6) back = 0.07;
        }
        const tx = (TOUCH[0] - SKX) / CAR + 0.1, ty = (TOUCH[1] - SKY) / CAR; // the mitt's end is 0.1 past the hand point
        return [tx + back, ty - back * 0.25];
    };
    const duneY = (x, X) => World.HOR - 16 - 12 * Math.sin((x + X * 0.25) / 130) - 7 * Math.sin((x + X * 0.25) / 47 + 1);
    /**
     * The roadside picture. o: { rain (0..1), snow (0..1), band (the far car's x, or null when
     * it has gone), knocks ([times] of the chauffeur's knocks; [] rests his mitt by the ice),
     * melt, crack, shake (Weather.iceBlock's), iced (the machine's, default 1), drip (bool) }
     */
    function roadside(g, t, o = {}) {
        const Pu = S.pulseAt(t), d = C.drawing(t), R = ROAD, knocks = o.knocks ?? R.knocks, iced = o.iced ?? 1;
        World.back(g, t, R.X, 'rain');
        skid(g, XSTOP, R.machine.x, R.machine.y);
        // the band, a long way down the road: over the ridge of the dunes, behind the poles
        if (o.band != null) {
            const bx = o.band, by = duneY(bx, R.X) + 5;
            Q.farBand(g, t, bx, by, 18, { spin: t * 9 });
            const SP = 430, PF = 0.86, py = World.ROAD0 - 26;
            for (let i = Math.floor((R.X * PF - 200) / SP); i <= Math.ceil((R.X * PF + 1200) / SP); i++) {
                const px = i * SP - R.X * PF;
                if (Math.abs(px - bx) < 90) World.pole(g, World.THEMES.rain, px, py);
            }
        }
        // the machine on its hitch: iced over, its fire out, the crank gone
        const mo = { towed: true, t, pitch: R.machine.pitch, spin: X0(COLD) / (0.28 * CAR), crank: Q.NO_CRANK, shake: 0, iced, smoke: 0, needles: 1, swing: 0 };
        W.machine(g, R.machine.x, R.machine.y, CAR, mo);
        Q.snappedStub(g, R.machine.x, R.machine.y, CAR, { a: JAM, ice: iced, c: onBody(Q.COG, mo) });
        // the hearse, its engine off; the chauffeur in a scarf, turned to the block
        const kn = Math.max(0, ...knocks.map((a) => bump2(t, a, 2 / 12))), hand = mittAt(t, knocks);
        const dx = hand[0] - SHOULDER[0], dy = hand[1] - SHOULDER[1], dl = Math.hypot(dx, dy);
        const listen = knocks.length ? Math.max(...knocks.map((a) => E.seg(t, a + 1 / 12, a + 3 / 12) * (1 - E.seg(t, a + BEAT - 3 / 12, a + BEAT - 1 / 12)))) : 0;
        Rides.hearse(g, R.hearse.x, R.hearse.y, CAR, { spin: XSTOP / (0.58 * CAR), bounce: 0, lean: 0, flames: 0, t, swing: 0 }, (g2, seats, sc0) => chauffeur(g2, seats, sc0, {
            headTilt: -0.07 - 0.07 * listen, headDy: 0.012 * Pu.pulse, jaw: 0.5 * kn,
            hands: { r: [SHOULDER[0] + (dx / dl) * 0.02, SHOULDER[1] + (dy / dl) * 0.02] }, // a stub: the arm itself goes on after the car
        }, true, t));
        g.save();
        g.translate(SKX, SKY);
        g.scale(CAR, CAR);
        g.lineJoin = 'round';
        Cast.arm(g, Rides.SKEL, 3.2 / CAR, SHOULDER, hand);
        g.restore();
        // an icicle under the hearse's lantern, and the drop that falls from it
        const lan = [R.hearse.x - 3.8 * CAR, R.hearse.y - 0.965 * CAR];
        g.save();
        g.lineJoin = 'round';
        g.lineCap = 'round';
        W.icicle(g, 3.2, lan[0], lan[1], 0.24 * CAR, 0.075 * CAR, 0);
        g.restore();
        if (o.drip !== false) W.drips(g, lan[0], lan[1] + 0.24 * CAR, CAR, t, 1, { pts: [[0, 0]], len: 0.66, slant: 0 });
        // snow that has settled on the road
        Q.mound(g, R.devil.x - 118, R.devil.y + 10, 96, 13);
        Q.mound(g, R.machine.x - 96, R.machine.y + 22, 110, 12);
        Q.mound(g, R.hearse.x + 196, R.hearse.y + 30, 120, 12);
        // the Devil on ice
        const tapD = knocks.length ? Math.min(...knocks.map((a) => (t >= a - 1e-6 ? dAt(t, a) : 99))) : 99;
        Q.frozenDevil(g, R.devil.x, R.devil.y, CAR, { ...R.block, t, melt: o.melt ?? 0, crack: o.crack ?? 0, shake: o.shake ?? (tapD === 0 ? 1 : 0) });
        Q.knock(g, TOUCH[0] - 4, TOUCH[1], tapD === 0 ? 1 : tapD === 1 ? 0.55 : 0);
        World.rain(g, t, o.rain ?? 0);
        W.snowfall(g, t, o.snow ?? 0.6);
    }
    function iceShot(g, t) {
        const u = t - T53;
        roadside(g, t, { rain: [0.5, 0.42, 0.34, 0.26, 0.18, 0.1][dAt(t, T53)] ?? 0, snow: 0.6, band: 852 + 16 * u });
    }

    function draw(g, t, env) {
        if (t < T51 - 1e-6) coldShot(g, t);
        else if (t < T53 - 1e-6) hellShot(g, t);
        else iceShot(g, t);
    }

    Seg.verse2c = {
        shots: [[T50, T51, 'Cold'], [T51, T53, 'Hell freezes over'], [T53, T54, 'On ice']],
        draw,
        post: () => ({}),
        roadside, ROAD, // the picture the block ends on and where everything in it stands, for the thaw
    };
})();
