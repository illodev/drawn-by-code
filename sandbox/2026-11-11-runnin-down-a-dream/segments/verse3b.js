// Verse 3, bars 85–92 (120.375–131.667 s): the Devil's last trap, at night.
// Props and sets: segments/verse3b-props.js (Verse3bProps); the cactus at the wheel is chorus 1's.
(() => {
    const Seg = (window.Seg = window.Seg || {});
    const C = Cereal, K = C.COL, E = Ease, S = Song, V = Verse3bProps, twos = S.twos, b = S.b, B = S.B, pop = S.pop;
    const T85 = B(85), T87 = B(87), T89 = B(89), T91 = B(91), T92 = B(92), T93 = B(93);
    const n = (k) => b(340 + k); // beat k of the block
    const SC = Rig.CAR, LANE = World.LANE, FR = 1 / 24, PI = Math.PI, TAU = PI * 2;
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
        World.back(g, t, X, 'night', { moon: { ...MOON, x: MOON.x + X * 0.006 }, stars: 1 });
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
        World.front(g, t, X, 'night');
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
            pose = { mood: 'laugh', eyes: 'shut', headTilt: [0.3, 0.2][kS], headDy: [0.08, 0.05][kS], squash: [0.17, 0.1][kS], lean: [0.12, 0.07][kS], handL: [0.74, -0.52], handR: [-0.74, -0.84], tail: -0.2, step: 1 };
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
            const kj = kOf(t, tFlat), to = [-322, 908], from = [END1 + G.DX * 0.4, G.R1 - V.rampH(END1) - G.RW * 0.4], u = Math.min(1, (kj + 1) / 3);
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
            if (rr > 3) V.roll(g, rollC[0], rollC[1], rr, (xe - END0) / 26);
            rider('roll');
            rider('air');
            for (const p of hitsNow) if (p.hit != null) V.hit(g, PEG[0] + 2, PEG[1] - 16, p.hit ? 34 : 52, 'v3b-peg' + p.hit);
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
                const nx = tip[0] + 0.5 * SC, ny = dvy - 1.0 * SC, k = [1, 1.3, 0.8][kS];
                if (kS < 2) V.hit(g, nx + 26 * k, ny + 10, 40 * k, 'v3b-choo' + kS);
                for (const [ax, ay] of [[1, 0.1], [0.9, 0.5], [0.95, -0.3], [0.7, 0.8]]) V.line(g, [[nx + ax * 60 * k, ny + 10 + ay * 40 * k], [nx + ax * 86 * k, ny + 10 + ay * 58 * k]], 4, '#fffdf4');
            }
        });
    }

    function draw(g, t, env) {
        if (t < T87 - 1e-6) billboards(g, t, env);
        else trap(g, t, env);
    }

    Seg.verse3b = {
        shots: [[T85, T87, 'Billboards'], [T87, T89, 'The trap'], [T89, T91, 'Pickin up'], [T91, T93, 'Down the hatch']],
        draw,
        post: (t) => ({ track: [0.25, 0.1][Math.round((t - T85) * 24)] ?? 0 }),
    };
})();
