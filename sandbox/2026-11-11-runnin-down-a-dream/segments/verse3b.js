// Verse 3's last block, bars 85–92 (120.375–131.667 s): the Devil's last trap, at night. He has
// a cold (a scarf, a sore nose) and a road crew of three imps in hard hats; the band never
// notices a thing. Tom sings up front on the deck and the cactus in shades drives.
//   bars 85–86  Billboards   a travelling shot: the headlights light a run of billboards, a
//                            picture and an arrow each (a pie, a bed, a pot of gold, a trophy),
//                            then the biggest, EXIT 666, and the camera lets the car go
//   bars 87–88  The trap     a wide static shot: he hangs his weight on a giant lever, the
//                            highway swings out of its bed onto the tongue of Hell's mouth, an
//                            imp runs its rolled end out, two drive a spike; he dusts his mitts
//                            and sneezes
//   bars 89–92  Pickin' up / Down the hatch   ONE travelling shot that comes to rest (the
//                            boundary on bar 91 is not a cut): the car takes everything of his,
//                            a thing a beat, and on «mine» (bar 91's first beat) his own scarf
//                            catches on the whip; up the tongue, in, and the mouth shuts on bar
//                            92; it blinks, burps a flame and a cone, the sign spins and settles
// Props and sets: segments/verse3b-props.js (Verse3bProps); the cactus is chorus 1's (Chorus1Props).
(() => {
    const Seg = (window.Seg = window.Seg || {});
    const C = Cereal, K = C.COL, E = Ease, S = Song, V = Verse3bProps, twos = S.twos, b = S.b, B = S.B, pop = S.pop;
    const T85 = B(85), T87 = B(87), T89 = B(89), T91 = B(91), T92 = B(92), T93 = B(93);
    const n = (k) => b(340 + k); // beat k of the block
    const SC = Rig.CAR, LANE = World.LANE, PI = Math.PI, TAU = PI * 2;
    const MOON = { x: 720, y: 270, r: 170 };
    const bump = (t, a, dur = 0.3) => E.bump(twos(t, a), a, dur);
    const seg2 = (t, a, c) => E.seg(twos(t, a), a, c);
    const kOf = (t, a) => Math.floor((t - a) * 12 + 1e-6);
    const lerp = E.lerp;

    // the cactus in shades at the wheel, keeping the beat (chorus 1's running gag)
    const SEATS = Rides.bandCarSeats();
    const WHEEL = [SEATS.wheel[0] - SEATS.driver[0] - 0.07, SEATS.wheel[1] - SEATS.driver[1] + 0.02];
    const driver = (t) => (g2, sc) => {
        const Pu = S.pulseAt(t);
        Chorus1Props.cactus(g2, 0, 0, sc, { wheel: WHEEL, shades: 1, squash: 0.05 * Pu.pulse, wave: Pu.k % 2 ? Pu.pulse : -Pu.pulse * 0.6 });
    };

    // =========================================================================================
    // Shot 1 · «Something good», bars 85–86: the headlights light a run of billboards
    // =========================================================================================
    const SPEED = Rig.SPEED, X0 = 20000, BF = 0.92, tGo = n(6);
    // the road's clock: steady, then the camera lets the car go and settles on the last board
    const X1 = (t) => {
        if (t < tGo) return X0 + SPEED * (t - T85);
        const tau = t - tGo, Td = T87 - tGo;
        return X0 + SPEED * (tGo - T85) + SPEED * (tau - (tau * tau) / (2 * Td));
    };
    const BOARDS = [['pie', n(0), 800], ['bed', n(2), 800], ['gold', n(4), 800], ['trophy', n(5), 800], ['exit', n(6), 850]].map(([pic, at, lx]) => ({ pic, at, wx: lx + X1(at) * BF }));
    function billboards(g, t, env) {
        const X = X1(t), Pu = S.pulseAt(t), cx = 430 + (X0 + SPEED * (t - T85) - X);
        // The backdrop's own road signs stand on the billboards' line and travel with them (the same
        // share of the motion: World.back's 'sign' cells, 0.92 · 760 · 80), so one that falls among a
        // board's posts stays there for the whole pass, with the braces and the arrow painted
        // across it. Those signs are left out. World.back clears one stretch a call (and every
        // cactus in it), so the stretch is the sign's own spot and nothing else; a second sign on
        // screen is taken out by painting the backdrop again inside that sign's box only.
        const under = [];
        World.cells(X, 0.92, 760, 80, 'sign', (i, x) => {
            if (BOARDS.some((bd) => Math.abs(x - (bd.wx - X * BF)) < (bd.pic === 'exit' ? 384 : 270) / 2 + 60)) under.push(x);
        });
        const backdrop = (x) => World.back(g, t, X, 'night', { moon: { ...MOON, x: MOON.x + X * 0.006 }, stars: 1, clear: x == null ? undefined : [x - 1e-6, x + 1e-6] });
        backdrop(under[0]);
        for (const x of under.slice(1)) {
            g.save();
            g.beginPath();
            g.rect(x - 50, World.ROAD0 - 10 - 178, 100, 182); // the sign with its outline, short of the road's edge line
            g.clip();
            backdrop(x);
            g.restore();
        }
        for (const bd of BOARDS) {
            const x = bd.wx - X * BF, on = t >= bd.at - 1e-6, big = bd.pic === 'exit';
            if (x < -300 || x > 1300) continue;
            V.billboard(g, x, World.ROAD0 - 10, { pic: bd.pic, on, pop: on ? pop(t, bd.at, 0.25) : 0, t, w: big ? 384 : 270, h: big ? 200 : 170, legs: big ? 236 : 230, arrowAng: big ? -0.52 : 0 });
            const tw = bump(t, bd.at, 0.3);
            if (on && tw > 0.01) {
                C.sparkle(g, x - (big ? 200 : 140), World.ROAD0 - 10 - 420, 14 + 36 * tw, { color: K.white, ink: K.ink, lw: 3 });
                C.sparkle(g, x + (big ? 204 : 146), World.ROAD0 - 10 - 250, 10 + 26 * tw, { color: K.white, ink: K.ink, lw: 3, rot: 0.3 });
            }
        }
        if (cx < 1500) {
            Rig.band(g, t, cx, LANE, SC, { spin: (X0 + SPEED * (t - T85)) / (0.56 * SC), bounce: 0.3 * Pu.pulse, exhaust: 0.6, tomDrives: false, sing: true, driver: driver(t) });
            V.beams(g, cx, LANE + 0.3 * Pu.pulse * 0.1 * SC, SC);
        }
        World.front(g, t, X, 'night', { skip: () => true }); // the one near cactus of this stretch crossed the band (lead's review)
    }

    // =========================================================================================
    // Shot 2 · «Waiting down this road», bars 87–88: the trap. The Devil hangs his weight on a
    // giant lever, the highway swings out of its bed onto the tongue of Hell's mouth, an imp
    // rolls its end out and two more nail it down; he dusts his mitts and sneezes.
    // =========================================================================================
    const G = V.G, CAM2 = { L: -764, z: 0.92, oy: -44 }, FAR = G.VERGE + 62, NEAR = 1036;
    const LEV = [-648, NEAR + 2], SIGN = [-516, FAR], END0 = -370, END1 = -250, PEG = [-265, G.R0 + 6], ROLL_R = 32, LAG = 0.5;
    const tClunk = n(10), tLand = n(11), tUnroll = n(12), tFlat = n(13), HITS = [n(13), n(14)], tAh = n(14) + 3 / 24, tChoo = n(15);
    const lanePt = (x, lift = 0) => [x + G.DX * 0.32, G.LANE - lift];
    const onLine = (x) => [0, x > G.TIP ? V.rampH(x) : 0];
    // the ribbon's lie while it swings: its end leads, the rest follows like a whip
    const swing = (t) => {
        const tt = twos(t, tClunk), U = (1 + LAG) * E.seg(tt, tClunk, tClunk + (1 + LAG) * (tLand - tClunk));
        return (x) => {
            if (t < tClunk - 1e-6) return [G.BED, 0];
            const u = E.clamp(U - (LAG * (END0 - x)) / 470), e = E.inOut(u);
            return [G.BED * (1 - e), Math.sin(PI * u) * (70 + 12 * Math.sin(x / 70 - tt * 20))];
        };
    };
    // an imp's blow with its mallet at `th`: the mitt, the mallet's angle, and the drawing of the blow (hit: 0, 1)
    const BLOW = [{ up: 0.5, ang: -0.2, squash: 0.06 }, { up: 1, ang: -0.62, squash: -0.04 }, { up: 1, ang: -0.7, squash: -0.08 }, { up: 0.1, ang: 1.62, squash: 0.14, hit: 0 }, { up: 0.1, ang: 1.5, squash: 0.06, hit: 1 }, { up: 0.3, ang: 0.9, squash: 0 }, { up: 0.2, ang: 0.4, squash: 0 }];
    const blow = (t, th) => BLOW[kOf(t, th) + 3] ?? null;
    function hammerImp(g, t, x, y, side, hits, o = {}) {
        const Pu = S.pulseAt(t), bl = hits.map((th) => blow(t, th)).find(Boolean), rest = { up: 0, ang: 0.14, squash: 0.06 * Pu.pulse };
        const p = bl ?? rest, hop = o.hop ?? 0;
        Devil.imp(g, x, y, SC, { wear: 'hat', mood: o.mood ?? (p.hit != null ? 'awe' : 'grin'), look: o.look ?? side, armUp: p.up, squash: p.squash, hop, tail: 0.05 * Math.sin((Pu.k + Pu.since) * PI) });
        // the mallet, in the mitt on the side it strikes to (both mitts go up with it)
        V.mallet(g, x + side * 0.7 * SC, y - hop * SC - (0.42 + p.up * 0.5) * SC * (1 - p.squash), side * p.ang, SC);
        return p;
    }

    function trap(g, t, env) {
        const cam = CAM2, Pu = S.pulseAt(t), d = C.drawing(t), ph = Pu.k + Pu.since;
        V.sky(g, t, 0, MOON, G.HOR * cam.z + cam.oy);
        V.ground(g, t, cam, { clear: [[-730, 1400]] });
        // --- the lever and the Devil on it
        const kc = kOf(t, tClunk), kH = kOf(t, T87);
        const ang = kc < -2 ? 0.2 + 0.03 * kH + (kH % 2 ? 0.035 : 0) : [0.62, 1.15, 1.57, 1.45, 1.5][Math.min(4, kc + 2)];
        const tip = V.leverTip(LEV[0], LEV[1], ang), dvy = Math.min(NEAR, tip[1] + 2.08 * SC), hy = -(dvy - tip[1]) / SC, hang = dvy < NEAR - 0.5;
        const f = d % 2 ? 1 : -1, kA = kOf(t, tAh), kS = kOf(t, tChoo);
        let pose, cold = { t, blow: 0.2 };
        if (kc < -2) pose = { mood: 'angry', squash: -0.06, lean: 0.05 * f, step: f, tail: 0.2 * f, headDy: 0.03, handR: [-0.5, hy], handL: [0.5, hy], shadow: false };
        else if (kc < 0) pose = { mood: 'shock', squash: -0.1, step: f, tail: 0.25, handR: [-0.5, hy], handL: [0.5, hy], shadow: hang ? false : undefined };
        else if (t < tLand - 1e-6) pose = { mood: kc < 2 ? 'laugh' : 'grin', look: 1, squash: kc < 2 ? [0.2, 0.1][kc] : 0.04 * Pu.pulse, tail: 0.05 * Math.sin(ph * PI), handR: [-0.5, hy], handL: [0.5, hy] };
        else if (t < tUnroll - 1e-6) {
            // he rubs his mitts over the bar
            const a = kOf(t, tLand) % 2 ? 1 : -1;
            pose = { mood: 'sly', look: 1, squash: 0.05 + 0.02 * a, headTilt: 0.06, handL: [0.13, -0.74 - 0.05 * a], handR: [-0.1, -0.76 + 0.05 * a], tail: 0.09 * Math.sin(kOf(t, tLand) * 2.1) };
        } else if (kA < 0) {
            // and dusts them off, clap by clap
            const cl = kOf(t, tUnroll) % 2 === 0;
            pose = { mood: 'grin', look: 1, squash: 0.04 * Pu.pulse + (cl ? 0.03 : 0), headTilt: 0.05, handL: cl ? [0.07, -0.76] : [0.36, -0.9], handR: cl ? [-0.07, -0.76] : [-0.36, -0.66], tail: 0.05 * Math.sin(ph * PI), clap: cl };
        } else if (kS < 0) {
            // the sneeze comes
            const u = Math.min(2, kA);
            pose = { mood: 'shock', eyes: 'shut', headTilt: [-0.1, -0.2, -0.27][u], headDy: -0.02, squash: [-0.02, -0.05, -0.09][u], lean: [-0.02, -0.05, -0.08][u], handL: [0.3, -1.0 - 0.1 * u], handR: [-0.52, -0.6 - 0.08 * u], tail: 0.1 + 0.06 * u };
            cold = { t, blow: 0.2 - 0.3 * u, nose: 1.15 + 0.2 * u };
        } else if (kS < 2) {
            pose = { mood: 'laugh', eyes: 'shut', headTilt: [0.16, 0.1][kS], headDy: [0.1, 0.06][kS], squash: [0.13, 0.08][kS], lean: [0.1, 0.06][kS], handL: [0.66, -0.42], handR: [-0.68, -0.62], tail: -0.2, step: 1 };
            cold = { t, blow: [-2.2, -1.4][kS], nose: 1.25 };
        } else {
            // he wipes his nose on the scarf's end
            pose = { mood: 'sly', eyes: kS < 3 ? 'shut' : 'open', look: 1, squash: 0.04, headTilt: 0.04, handL: [0.12, -1.16 + (kS % 2 ? 0.03 : 0)], handR: [-0.5, -0.5], tail: 0.05 };
            cold = { t, blow: 0.1, tail: [[-0.24, -0.9], [-0.3, -0.98], [-0.12, -1.1], [0.1, -1.15]], nose: 1.1 };
        }
        // --- the road
        const air = t >= tClunk - 1e-6 && t < tClunk + (1 + LAG) * (tLand - tClunk) - 1e-6, shape = air || t < tClunk ? swing(t) : onLine;
        const uU = seg2(t, tUnroll, tFlat), xe = lerp(END0, END1, uU), rr = ROLL_R * Math.sqrt(Math.max(0, 1 - uU));
        const es = shape(Math.min(xe, END0)), rollC = [xe + (uU > 0 ? rr * 0.3 : 0), G.R1 + (uU > 0 ? -V.rampH(xe) : es[0] - es[1]) - rr];
        const startled = kS >= 0 && kS < 2 ? 0.2 : 0;
        // --- the mouth watches: him, then the road's end
        const look = t < tClunk ? -1 : -0.55, blink = kOf(t, T87 + 5 / 12) === 0 || kOf(t, tLand + 1 / 12) === 0 || kOf(t, tFlat + 4 / 12) === 0;
        const eyes = { look, lookY: t < tClunk ? 0.6 : 1, lid: blink ? 1 : startled ? 0.5 : 0, brow: t < tClunk ? -0.3 : 0.25 };
        const crew = () => {
            // the two with mallets, behind the road's new line: one spike, blow by blow
            const lk = t < tLand ? -1 : undefined, hop = startled || (kOf(t, tLand) === 0 ? 0.12 : 0);
            const pb = hammerImp(g, t, PEG[0] - 144, FAR, 1, [HITS[0]], { hop, look: lk, mood: startled ? 'oops' : t >= tClunk && t < tLand ? 'awe' : undefined });
            const pc = hammerImp(g, t, PEG[0] + 144, FAR, -1, [HITS[1]], { hop, look: lk ?? -1, mood: startled ? 'oops' : t >= tClunk && t < tLand ? 'awe' : undefined });
            return [pb, pc];
        };
        const rider = (when) => {
            // the third: it rides the roll through the swing, runs it out, and jumps down onto the tongue
            const onTop = [rollC[0] + G.DX * 0.4, rollC[1] - rr - G.RW * 0.4 + 4];
            if (t < tFlat - 1e-6) {
                if (when !== 'roll') return;
                const run = uU > 0, st = kOf(t, tUnroll) % 2 ? 1 : -1;
                Devil.imp(g, onTop[0], onTop[1], SC, { wear: 'hat', mood: air ? 'awe' : 'grin', look: run ? 1 : -1, armUp: air ? 1 : run ? 0.4 + 0.3 * st : 0.3 * Pu.pulse, squash: air ? -0.05 : 0.05 * Pu.pulse, hop: run ? 0.06 + 0.05 * st : 0, tail: run ? 0.2 * st : 0.05, shadow: false });
                return;
            }
            const kj = kOf(t, tFlat), to = [-262, 908], from = [END1 + G.DX * 0.4, G.R1 - V.rampH(END1) - G.RW * 0.4], u = Math.min(1, (kj + 1) / 3);
            if (when !== 'air') return;
            Devil.imp(g, lerp(from[0], to[0], u), lerp(from[1], to[1], u) - Math.sin(u * PI) * 50, SC, { wear: 'hat', mood: startled ? 'oops' : 'grin', look: 1, armUp: u < 1 ? 1 : 0.5 + 0.5 * Pu.pulse, squash: u < 1 ? -0.06 : 0.07 * Pu.pulse + (kj === 2 ? 0.14 : 0), hop: startled, shadow: u >= 1 });
        };
        V.view(g, cam, () => {
            V.bed(g, cam.L - 60, cam.L + 1260, t < tClunk ? END0 + 4 : -1e9);
            V.headBack(g, t, 0);
            V.exitSign(g, SIGN[0], SIGN[1], {});
            let hitsNow = [];
            if (t < tFlat - 1e-6) crew();
            V.tongue(g, t);
            V.headFlames(g, t, 0);
            V.headFront(g, t, 0, eyes);
            // the highway: in its bed, in the air, on its new line with the roll at its end
            V.ribbon(g, cam.L - 80, xe, shape, { flush: t < tClunk - 1e-6, endB: true, pegs: t >= HITS[0] - 1e-6 ? [[PEG[0] - G.DX * 0.955, 0.955]] : [] });
            if (t >= tFlat - 1e-6) hitsNow = crew();
            // the star of each blow, at the spike on the road's far edge: over the mallets, but behind
            // the third imp, who jumps down on the near side of it (it was painted over his face and hat)
            for (const p of hitsNow) if (p.hit != null) V.hit(g, PEG[0] + 2, PEG[1] - 16, p.hit ? 34 : 52, 'v3b-peg' + p.hit);
            if (rr > 3) V.roll(g, rollC[0], rollC[1], rr, (xe - END0) / 26);
            rider('roll');
            rider('air');
            // the dust where it comes down
            const kl = kOf(t, tLand);
            if (kl >= 0 && kl < 3) {
                const k2 = [1, 1.3, 0.7][kl];
                V.puffs(g, [[-700, G.R1 + 6 - kl * 8, 26 * k2, 6, kl], [-560, G.R1 + 10 - kl * 6, 20 * k2, 5, kl + 1], [END0 + 30, G.R1 + 8 - kl * 9, 30 * k2, 6, kl + 2], [END0 - 100, G.R1 + 12 - kl * 5, 18 * k2, 5, kl]], '#8f86e8', 3);
            }
            // the Devil and his lever, on the near sand
            V.lever(g, LEV[0], LEV[1], ang);
            V.devil(g, tip[0], dvy, SC, pose, cold);
            if (pose.clap) V.puffs(g, [[tip[0] - 26, dvy - 0.9 * SC, 13, 5, d], [tip[0] + 30, dvy - 0.86 * SC, 11, 5, d + 1]], '#dcd6f7', 2.6);
            if (kS >= 0 && kS < 3) {
                // the sneeze: a spray out of his nose
                const nx = tip[0] + 0.86 * SC, ny = dvy - 0.98 * SC, k = [1, 1.25, 0.8][kS];
                if (kS < 2) V.hit(g, nx, ny, 30 * k, 'v3b-choo' + kS);
                for (const [ax, ay] of [[1, 0.1], [0.9, 0.5], [0.95, -0.3], [0.7, 0.8]]) V.line(g, [[nx + ax * 34 * k, ny + ay * 30 * k], [nx + ax * 60 * k, ny + ay * 48 * k]], 4, '#fffdf4');
            }
        });
    }

    // =========================================================================================
    // Shots 3 and 4 · «I'm pickin' up whatever is mine», bars 89–92. A travelling shot down the
    // relaid road: the car takes everything of his, a thing a beat, each landing where it stays;
    // on «mine» (the bar line) his own scarf catches on the tail. The camera comes to rest on
    // the gate, the car runs up the tongue and in, and the mouth shuts on the next bar line.
    // =========================================================================================
    const S3 = 64, Z3 = S3 / SC, OY3 = 800 - G.LANE * Z3; // the car's scale in these shots
    // the car's middle from the frame's left edge (wu): tight on the car while it gathers things, then room behind it for the Devil
    const HOLD0 = (80 + 4.9 * S3) / Z3, HOLD1 = (104 + 6.9 * S3) / Z3;
    const tA = T91, Td = n(27) - tA, L_F = -600 / Z3, XA = L_F - (SPEED * Td) / 2 + HOLD1;
    const carX = (t) => XA + SPEED * (t - tA);
    const camL = (t) => {
        if (t <= tA) return carX(t) - lerp(HOLD0, HOLD1, E.inOut(E.seg(t, n(21.5), tA)));
        const tau = Math.min(Td, t - tA);
        return XA - HOLD1 + SPEED * (tau - (tau * tau) / (2 * Td));
    };
    const BX0 = carX(T89) - 360, BX1 = BX0 + 700; // the bend out of the old bed
    const shape3 = (x) => (x < BX1 ? [G.BED * (1 - V.smooth((x - BX0) / (BX1 - BX0))), 0] : onLine(x));
    const laneH = (x) => (x > G.TIP ? V.rampH(x - G.DX * 0.32) : -shape3(x - G.DX * 0.32)[0]); // how high the lane is under a wheel at x
    const BR = [-3.55, -0.56], rot = V.rot;
    // what the car takes: when its nose gets to it, and where it stays (car units)
    const NOSE = 4.6, FLY = 4 / 12;
    const TAKE = { coneA: n(18), coneB: n(18) + 2 / 24, coneC: n(18) + 4 / 24, barrier: n(19), arrow: n(20), imp: n(21), plan: n(22), fork: n(23) };
    const HOME = { coneA: [-2.86, -3.64], coneB: [-4.94, -3.24], barrier: [4.74, -0.2], arrow: [-3.1, -3.8], imp: [4.78, -0.98], plan: [-1.2, -0.5], fork: [3.3, -1.1] };
    const at = (k) => carX(TAKE[k]) + NOSE * SC; // where it stands on the lane (wu)
    const XD = XA - 4.3 * SC - 44; // where the Devil stands, on the bare bed
    const tGulp = T92, tBurp = n(30), tSpin = tBurp + 2 / 24;
    const jawAt = (t) => {
        const kg = Math.round((t - tGulp) * 24), kb = kOf(t, tBurp);
        if (kg >= 0) return kb >= 0 && kb < 4 ? [0.06, 0.05, 0.01, V.SHUT - 0.012][kb] : kg < 2 ? V.SHUT - 0.02 : kg < 4 ? V.SHUT + 0.012 : V.SHUT;
        if (kg >= -2) return [0.2, 0.04][kg + 2];
        return 0.34 * E.out(seg2(t, n(23.5), n(24.75)));
    };

    function hatch(g, t, env) {
        const Pu = S.pulseAt(t), d = C.drawing(t), ph = Pu.k + Pu.since, f = d % 2 ? 1 : -1;
        const cam = { L: camL(t), z: Z3, oy: OY3 }, vw = 1000 / Z3, cX = carX(t);
        const kg = kOf(t, tGulp), kb = kOf(t, tBurp), shut = t >= tGulp - 1e-6, jaw = jawAt(t);
        const sh = kg >= 0 && kg < 3 ? [[0, 12], [-7, -5], [4, 2]][kg] : kb >= 0 && kb < 2 ? [[5, 0], [-3, 0]][kb] : [0, 0];
        g.save();
        g.translate(sh[0], sh[1]);
        V.sky(g, t, cam.L, MOON, G.HOR * Z3 + OY3);
        V.ground(g, t, cam, { clear: [[-760, 1400], [at('arrow') - 420, at('arrow') + 160]] });
        // --- the car: on the lane, out of the bend, up the tongue
        const xr = cX + BR[0] * SC, xf = cX - BR[0] * SC, hR = laneH(xr), hF = laneH(xf), lean = Math.max(0, Math.atan2(hF - hR, xf - xr));
        const jolt = Object.values(TAKE).reduce((a, th) => a + bump(t, th, 0.2), 0);
        const bn = 0.3 * Pu.pulse + 0.45 * jolt + 0.6 * bump(t, T89 + 3 / 12, 0.4), cx = (cX - cam.L) * Z3, cy = (G.LANE - (lean > 0 ? hR : (hR + hF) / 2)) * Z3 + OY3;
        const carPt = (p) => {
            const q = rot([p[0] - BR[0], p[1] + 0.1 * bn - BR[1]], -lean);
            return [cx + (q[0] + BR[0]) * S3, cy + (q[1] + BR[1]) * S3];
        };
        // a thing on its way from the nose to its place: [x, y, how far (0..1), the drawing since it was hit]
        const flight = (k, from, H, dur = FLY) => {
            const th = TAKE[k], u = seg2(t, th, th + dur), p = carPt([lerp(from[0], HOME[k][0], u), lerp(from[1], HOME[k][1], u) - H * Math.sin(PI * u)]);
            return [p[0], p[1], u, kOf(t, th)];
        };
        const standing = (k, dy = 0) => V.toScreen(cam, [at(k), G.LANE + dy]);
        const taken = (k) => t >= TAKE[k] - 1e-6;
        const land = (k, dur = FLY) => bump(t, TAKE[k] + dur, 0.25); // the squash where it lands

        // --- the gate's eyes
        const near = E.seg(t, n(23.5), n(26)), look = shut ? (kb >= 0 ? -0.5 : kg < 3 ? 0 : [0.8, 0.8, -0.8, -0.8, 0][Math.min(4, Math.floor((kg - 3) / 2))]) : lerp(-1, 0.9, E.seg(t, n(25), n(27)));
        const blinkAt = n(29) - 1 / 12, lid = kg >= 0 && kg < 2 ? 0.86 : kOf(t, blinkAt) >= 0 && kOf(t, blinkAt) < 2 ? 1 : kb === -1 ? 0 : kb >= 0 && kb < 2 ? 0.8 : kb >= 4 ? 0.36 : 0;
        const eyes = { look, lookY: shut ? 0 : near, lid, brow: shut ? (kg < 2 ? 1 : kb === -1 || kb === 0 ? -1 : 0.3) : -near };
        // --- the sign: the burp's blast spins it on its post, then it creaks
        const su = E.seg(t, tSpin, tSpin + 0.6), ts = Math.max(0, twos(t, tSpin + 0.6) - tSpin - 0.6);
        const spin = t < tSpin ? 0 : TAU * 2 * E.out(su), tilt = su >= 1 ? 0.07 * Math.exp(-ts * 2.2) * Math.cos(ts * 15) : su > 0 ? 0.05 : 0;

        V.view(g, cam, () => {
            V.bed(g, cam.L - 60, cam.L + vw + 60, BX0 + 120);
            if (cam.L - 100 < BX0) V.ribbon(g, cam.L - 100, BX0, V.inBed, { flush: true });
            // a billboard that waits for its arrow
            if (at('arrow') - 150 > cam.L - 300 && at('arrow') - 150 < cam.L + vw + 300) V.billboard(g, at('arrow') - 150, FAR - 8, { pic: 'gold', on: false, arrow: false, t, legs: 200 });
            if (cam.L + vw > -900) {
                V.exitSign(g, SIGN[0], SIGN[1], { spin, tilt });
                V.headBack(g, t, jaw, { glow: shut ? 1.5 + 0.5 * Pu.pulse : 1 });
                V.tongue(g, t);
                if (!shut) V.headFlames(g, t, jaw, 1 + 0.3 * near);
            }
            V.ribbon(g, Math.max(cam.L - 100, BX0), Math.min(cam.L + vw + 100, END1), shape3, { endB: true, endA: false, pegs: [[PEG[0] - G.DX * 0.955, 0.955]] });
        });

        // --- what still stands on the road ahead
        const coneAt = (k) => {
            const [x, y] = standing(k);
            V.cone(g, x, y, S3);
        };
        for (const k of ['coneC', 'coneB', 'coneA']) if (!taken(k)) coneAt(k);
        if (!taken('barrier')) V.barrier(g, ...standing('barrier', 8), S3, { t });
        if (!taken('arrow')) {
            const [x, y] = standing('arrow');
            for (const sx of [-0.5, 0.4]) V.tube(g, [[x + sx * S3, y], [x + sx * S3, y - 0.62 * S3]], 0.07 * S3, V.WOOD, 2.6);
            V.arrowPlank(g, x, y - 0.7 * S3, 2.0 * S3, { on: true, t });
        }
        if (!taken('imp')) {
            // the imp drives its spike, its back to the road
            const [x, y] = standing('imp'), th0 = TAKE.imp - 1.5 * S.BEAT, kk = ((kOf(t, th0) % 5) + 5) % 5, p = [{ up: 1, ang: -0.62, squash: -0.04 }, { up: 1, ang: -0.7, squash: -0.08 }, { up: 0.1, ang: 1.62, squash: 0.14 }, { up: 0.1, ang: 1.5, squash: 0.06 }, { up: 0.5, ang: 0.3, squash: 0 }][kk];
            Devil.imp(g, x, y, S3, { wear: 'hat', mood: 'grin', look: 1, armUp: p.up, squash: p.squash });
            V.mallet(g, x + 0.7 * S3, y - (0.42 + p.up * 0.5) * S3 * (1 - p.squash), p.ang, S3);
        }
        if (!taken('fork')) {
            const [x, y] = standing('fork');
            g.save();
            g.translate(x, y);
            g.scale(S3, S3);
            Devil.trident(g, 0, 0, 3.2 / S3, { ang: 0.04, grip: 0 });
            g.restore();
            V.puffs(g, [[x, y + 1, 7, 5, 0.4]], World.THEMES.night.sand, 2.4);
        }

        // --- the band on its car, the cactus at the wheel
        const band = () => cx < 1700 && Rig.band(g, t, cx, cy, S3, { spin: cX / (0.56 * SC), bounce: bn, lean, exhaust: 0.7, tomDrives: false, sing: true, driver: driver(t), shadow: lean > 0.004 || shape3(cX)[0] > 2 ? false : undefined });

        // --- what it has taken
        const hits = [];
        const cargo = () => {
            // cones: one comes down on the stacks, one on the whip's tip, the third is batted away
            for (const [k, H, tilt] of [['coneA', 3.0, 0], ['coneB', 3.4, -0.2]]) {
                if (!taken(k)) continue;
                const [x, y, u, kk] = flight(k, [NOSE + 0.1, -0.2], H), sw = k === 'coneB' ? [0, 0.05, -0.03][((d % 3) + 3) % 3] : 0;
                V.cone(g, x - sw * S3, y + 0.05 * land(k) * S3, S3, u < 1 ? -TAU * 1.5 * (1 - u) + tilt : tilt + sw * 2 + (k === 'coneB' ? 0 : 0.03 * f * Pu.pulse));
                if (kk === 0) hits.push([x, y - 10, 'a' + k]);
            }
            if (taken('coneC') && t < TAKE.coneC + 0.6) {
                const a = t - TAKE.coneC, kk = kOf(t, TAKE.coneC), p0 = V.toScreen(cam, [at('coneC'), G.LANE]);
                const wx = at('coneC') + 500 * a, wy = G.LANE - 560 * a + 1500 * a * a + 60 * a;
                const p = V.toScreen(cam, [wx, wy]);
                V.cone(g, p[0], p[1], S3, TAU * 2.2 * (twos(t, TAKE.coneC) - TAKE.coneC));
                if (kk === 0) hits.push([p0[0], p0[1] - 14, 'c']);
            }
            if (taken('barrier')) {
                const [x, y, u, kk] = flight('barrier', [NOSE + 0.5, 0], 1.3, 3 / 12);
                V.barrier(g, x, y, S3 * 0.8, { t, ang: u < 1 ? -TAU * (1 - u) : -0.1 + 0.04 * f * Pu.pulse + 0.2 * land('barrier', 3 / 12) });
                if (kk === 0) hits.push([x, y - 26, 'b']);
            }
            if (taken('fork')) {
                const [x, y, u, kk] = flight('fork', [NOSE + 0.2, 0], 2.6, 3 / 12), tau = Math.max(0, twos(t, TAKE.fork + 3 / 12) - TAKE.fork - 3 / 12);
                g.save();
                g.translate(x, y);
                g.scale(S3, S3);
                Devil.trident(g, 0, 0, 3.2 / S3, { ang: u < 1 ? -TAU * (1 - u) - lean : 0.16 * Math.exp(-tau * 7) * Math.cos(tau * 30) - lean + 0.02 * f, grip: 0 });
                g.restore();
                if (kk === 0) hits.push([x, y - 30, 'f']);
            }
            if (taken('imp')) {
                const [x, y, u, kk] = flight('imp', [NOSE + 0.3, -0.2], 2.4), up = u < 1 ? 1 : 0.5 + 0.5 * Pu.pulse;
                g.save();
                g.translate(x, y - 0.5 * S3);
                g.rotate(u < 1 ? -TAU * (1 - u) : -lean);
                Devil.imp(g, 0, 0.5 * S3, S3, { wear: 'hat', mood: u < 1 ? 'oops' : kOf(t, TAKE.imp + FLY) < 4 ? 'awe' : 'grin', look: 1, armUp: up, squash: 0.2 * land('imp') + (u < 1 ? 0 : 0.05 * Pu.pulse), shadow: false, tail: 0.1 * f });
                V.mallet(g, 0.7 * S3, 0.5 * S3 - (0.42 + up * 0.5) * S3, u < 1 ? 0.4 : 0.1 + 0.25 * Pu.pulse, S3);
                g.restore();
                if (kk === 0) hits.push([x, y - 30, 'i']);
            }
            if (taken('arrow')) {
                const [x, y, u, kk] = flight('arrow', [NOSE + 0.3, -0.7], 2.2);
                V.arrowPlank(g, x, y + 0.06 * land('arrow') * S3, 2.0 * S3, { on: true, t, ang: u < 1 ? TAU * (1 - u) : -lean - 0.03 + 0.02 * f * Pu.pulse });
                if (kk === 0) hits.push([x, y, 'r']);
            }
        };
        // his blueprint: out of his mitts, over the band and onto the whip
        const planFly = () => {
            if (!taken('plan')) return;
            const dur = 4 / 12, th = TAKE.plan, u = seg2(t, th, th + dur);
            const from = [(XD - carX(th)) / SC, (NEARY3 - G.LANE) / SC - 0.62];
            const p = carPt([lerp(from[0], HOME.plan[0], u), lerp(from[1], HOME.plan[1], u) - 3.4 * Math.sin(PI * u)]);
            V.blueprint(g, p[0], p[1], S3, { ang: u < 1 ? -5.5 * (1 - u) : -lean + 0.02 * f, wave: u < 1 ? 1 : 0.5 * f });
            // it hangs over the deck's rail like bunting
            if (u >= 1) for (const dx of [-0.36, 0.36]) V.dot(g, ...carPt([HOME.plan[0] + dx, HOME.plan[1] - 0.4]), 3.4, '#d5dbea', 2);
        };

        // --- the Devil: reading his plan on the bare bed, robbed of it, then caught by his own scarf
        const NECK = [-6.12, -1.5], POST = [-4.37, -1.3], caught = t >= tA - 1e-6, kc = kOf(t, tA);
        const devilFoot = () => {
            const [x, y] = V.toScreen(cam, [XD, NEARY3]);
            if (x > 1150) return;
            const kp = kOf(t, TAKE.plan), wind = E.seg(t, TAKE.plan - 0.2, TAKE.plan + 0.1);
            let pose, cold;
            if (kp < 0) {
                pose = { mood: 'sly', look: -0.4, headTilt: 0.05, squash: 0.04 * Pu.pulse, handL: [0.5, -0.82], handR: [-0.5, -0.82], tail: 0.06 * Math.sin(ph * PI) };
                cold = { t, blow: 0.2 + wind };
            } else {
                const pass = kOf(t, n(23.5));
                pose = pass < 0
                    ? { mood: 'shock', look: 1, squash: kp < 2 ? -0.1 : -0.03, headTilt: -0.06, handL: [0.62, -1.3 + 0.05 * f], handR: [-0.5, -1.24 - 0.05 * f], tail: 0.2 * f, step: kp < 2 ? 1 : 0 }
                    : { mood: 'angry', look: 1, squash: 0.03, lean: 0.06, handL: [0.72, -1.12 + 0.07 * f], handR: [-0.56, -0.62], tail: 0.12 * f, step: f };
                // the scarf's long end streams after the car and finds the tail's post
                const post = carPt(POST), e = [(post[0] - x) / S3, (post[1] - y) / S3], reach = E.seg(t, n(23.5), tA - 1 / 24);
                // It leaves from the nape and goes behind his head (tailBack): drawn over him from the
                // knot it lay straight up across his own face.
                // Streaming, it climbs behind his head and comes out over his raised mitt, under the horn.
                const NAPE = [0.1, -1.0], STREAM = [[0.42, -1.5 + 0.04 * f], [0.92, -1.88 - 0.05 * f], [1.42, -1.8 + 0.06 * f]];
                // Reaching, it hooks up beside his head (outside the horn) and over to the post above him.
                const HOOK = [[0.8, -1.56], [0.92, -2.08], e];
                const tail = [NAPE, ...STREAM.map((p, i) => E.lerpPt(p, HOOK[i], reach))];
                cold = { t, tailBack: true, tail: C.curve(tail, false, 5) };
            }
            V.devil(g, x, y, S3, pose, cold);
            if (kp < 0) V.blueprint(g, x, y - 0.62 * S3 * (1 - (pose.squash ?? 0)), S3, { ang: 0.03 * f * Pu.pulse, wave: wind > 0.5 ? f : 0 });
        };
        const devilFlag = () => {
            // he streams out behind the tail, his scarf taut from his neck to the post
            const u = Math.min(1, (kc + 1) / 3), post = carPt(POST);
            const from = [(XD - cX) / SC, (NEARY3 - G.LANE) / SC - 0.95];
            const nk = carPt([lerp(from[0], NECK[0], u) - (u >= 1 ? 0.06 * f : 0), lerp(from[1], NECK[1], u) + (u >= 1 ? 0.07 * f : 0)]);
            const a = lerp(0.1, 0.92, u) + (u >= 1 ? 0.13 * f : 0);
            const sag = u >= 1 ? 0.1 * f * S3 : 0, mid = [(nk[0] + post[0]) / 2, (nk[1] + post[1]) / 2 + sag * 0.5];
            V.band(g, C.curve([nk, mid, [post[0] - 4, post[1]]], false, 6), 0.07 * S3, V.SCARF, V.STRIPE, 2.6);
            V.dot(g, post[0], post[1], 0.1 * S3, V.SCARF, 2.6);
            g.save();
            g.translate(nk[0], nk[1]);
            g.rotate(a);
            V.devil(g, 0, 0.95 * S3, S3, { mood: 'shock', look: 1, squash: -0.06, headTilt: -0.1, handL: [0.78, -1.0 - 0.22 * f], handR: [-0.76, -1.0 + 0.22 * f], step: f, tail: 0.25 * f, shadow: false }, { t, noTail: true });
            g.restore();
            if (kc === 0) hits.push([post[0] - 6, post[1], 'd']);
        };

        // past the throat it is gone, behind the stone: the gate's face (V.headFront, below) is
        // painted over the car, so the cheek's own edge is what cuts it, and between the jaws it
        // shows against the dark inside. (A clip on a vertical at the throat used to saw the amps
        // and the drummer off in mid air.)
        g.save();
        band();
        if (cx < 1700) {
            cargo();
            planFly();
            if (caught) devilFlag();
            if (!shut) V.beams(g, cx, cy - 6 * lean * S3, S3, 440);
        }
        g.restore();
        for (const [x, y, seed] of hits) V.hit(g, x, y, 44, 'v3b-take' + seed);
        // --- the gate's face, over whatever went in
        if (cam.L + vw > -200) {
            V.view(g, cam, () => {
                const lit = shut && jaw < -0.04;
                if (lit) V.headGlow(g, t, jaw);
                V.headFront(g, t, jaw, eyes);
                if (lit) V.headHalo(g, t, jaw);
            });
        }
        if (!caught) devilFoot();

        // --- the burp: a tongue of flame, a ring of smoke, and one cone that comes back out
        const lips = V.toScreen(cam, [-24, 772]);
        if (kb >= 0 && kb < 3) {
            g.save();
            g.translate(lips[0] + 6, lips[1] + 4);
            g.rotate(-PI / 2 - 0.1);
            Fx.flame(g, 0, 0, [150, 215, 120][kb], d, kb);
            g.restore();
        }
        if (kb >= 2 && kb < 9) {
            const a = (kb - 2) / 7, px = lips[0] - 150 - 190 * a, py = lips[1] - 30 - 60 * a, r = 40 * (1 - a * 0.75);
            V.puffs(g, [[px, py, r, 6, kb * 0.5], [px + r * 0.9, py + r * 0.3, r * 0.7, 5, kb * 0.5 + 1]], '#8f86e8', 3);
        }
        if (kb >= 0) {
            const a = Math.max(0, twos(t, tBurp) - tBurp), fly = Math.min(1, a / 0.33), rollU = E.out(E.seg(a, 0.33, 0.33 + 0.38));
            const wx = lerp(-40, -250, fly) - 120 * rollU, wy = lerp(770, 934, fly * fly) - 150 * Math.sin(PI * fly);
            const p = V.toScreen(cam, [wx, wy]);
            // in the air it tumbles; on the ground it rolls on its side round its own tip and rocks to a stop
            V.cone(g, p[0], p[1] - (fly >= 1 ? 0.13 * S3 : 0), S3, fly < 1 ? -TAU * 1.5 * fly : -PI / 2 - 0.2 + 0.5 * (1 - rollU) * Math.cos(a * 22) - 0.25 * rollU);
        }
        // the lever he left, on the near sand
        const lv = V.toScreen(cam, LEV);
        if (lv[0] < 1200 && lv[1] < 936) {
            g.save();
            g.translate(lv[0], lv[1]);
            g.scale(Z3, Z3);
            V.lever(g, 0, 0, 1.5);
            g.restore();
        }
        // dust at the lips when they slam
        if (kg >= 0 && kg < 3) {
            const k2 = [1, 1.3, 0.8][kg];
            V.puffs(g, [[lips[0] - 30, lips[1] + 30 - kg * 6, 24 * k2, 6, kg], [lips[0] + 60, lips[1] + 50 - kg * 4, 18 * k2, 5, kg + 1], [lips[0] - 60, lips[1] - 70 - kg * 8, 16 * k2, 5, kg + 2]], '#8f86e8', 3);
        }
        g.restore();
    }
    const NEARY3 = 905;

    function draw(g, t, env) {
        if (t < T87 - 1e-6) billboards(g, t, env);
        else if (t < T89 - 1e-6) trap(g, t, env);
        else hatch(g, t, env);
    }

    Seg.verse3b = {
        shots: [[T85, T87, 'Billboards'], [T87, T89, 'The trap'], [T89, T91, 'Pickin up'], [T91, T93, 'Down the hatch']],
        draw,
        post: (t) => ({ track: [0.25, 0.1][Math.round((t - T85) * 24)] ?? 0 }),
    };
})();
