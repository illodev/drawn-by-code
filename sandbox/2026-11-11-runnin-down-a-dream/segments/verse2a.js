// Verse 2, first block, bars 39–44 (55.42–63.92 s): «cruise control». A hard cut from Hell's
// office to the sunny road: the band feels so good that a rainbow stands on the road like a
// bridge and the car just drives over it. In the cockpit the cactus at the wheel hits the
// cruise button (a call-out shows the dash from his seat: the button, its lamp, the wheel
// that starts to turn by itself), leans back, lifts his shades, rubs his eyes and nods off,
// a snore bubble at his mouth; Tom, on the deck behind him, sings on. Then what is behind
// them: the camera drops back along the road to the hearse towing the rain machine, an imp at
// its crank, and the funnel coughs out its first small storm cloud.
// Props: segments/verse2a-props.js (Verse2aProps); the cactus is chorus 1's (Chorus1Props).
(() => {
    const Seg = (window.Seg = window.Seg || {});
    const C = Cereal, K = C.COL, E = Ease, S = Song, V = Verse2aProps, W = Weather, twos = S.twos, b = S.b, B = S.B, TAU = Math.PI * 2;
    const T0 = B(39), T41 = B(41), T44 = B(44), T45 = B(45);
    const n = (k) => b(156 + k); // beat k of the block (0 = bar 39's first)
    const SC = Rig.CAR, LANE = World.LANE;
    const SKY = { sun: { x: 170, y: 180, r: 70 }, moon: { x: 850, y: 150, r: 38 } };
    const at = (t, a) => t >= a - 1e-6;
    const seg2 = (t, a, c) => E.seg(twos(t, a), a, c); // 0..1 on twos, counted from a
    const bump = (t, a, dur = 0.3) => E.bump(twos(t, a), a, dur);
    const spring = (t, a, f = 17, damp = 6.5) => (t < a - 1e-6 ? 0 : Math.exp(-(t - a) * damp) * Math.cos((t - a) * f));
    const lerpPts = (p, q, u) => p.map((pt, i) => [E.lerp(pt[0], q[i][0], u), E.lerp(pt[1], q[i][1], u)]);
    const SEATS = Rides.bandCarSeats();
    const ON_WHEEL = [SEATS.wheel[0] - SEATS.driver[0] - 0.07, SEATS.wheel[1] - SEATS.driver[1] + 0.02]; // where its arm rests on the rim, in the cactus's units
    // the cactus at the wheel as chorus 1 left it: shades on, one arm on the wheel, the other keeping the beat
    const driving = (t) => {
        const Pu = S.pulseAt(t);
        return { shades: 1, wheel: ON_WHEEL, squash: 0.05 * Pu.pulse, wave: Pu.k % 2 ? Pu.pulse : -Pu.pulse * 0.6 };
    };
    const chorusCactus = (pose) => (g, s) => Chorus1Props.cactus(g, 0, 0, s, pose);

    // =========================================================================================
    // Shot 1 · «Feeling good», bars 39–40: the road, the band playing; a rainbow stands on the
    // road like a bridge and the car drives up and over it
    // =========================================================================================
    const CX = 540, AXLE = 3.55 * SC; // the car's middle; its axles are this far from it
    const BOW_ON = n(1), BOW_OFF = n(7); // the front wheels meet its first foot; the back wheels leave its last
    const BOW_W = Rig.SPEED * (BOW_OFF - BOW_ON) - 2 * AXLE, BOW_H = 200;
    function feeling(g, t) {
        const X = Rig.X(t), Pu = S.pulseAt(t), ph = (t - b(Pu.k)) / S.BEAT;
        World.back(g, t, X, 'day', SKY);
        // the rainbow: its first foot is under the front wheels on BOW_ON and runs with the road
        const xa = CX + AXLE - Rig.SPEED * (t - BOW_ON);
        V.rainbow(g, xa, LANE, BOW_W, BOW_H, t, 'back');
        const hr = V.bowH(CX - AXLE - xa, BOW_W, BOW_H), hf = V.bowH(CX + AXLE - xa, BOW_W, BOW_H);
        const lean = Math.asin(Math.max(-0.5, Math.min(0.5, (hf - hr) / (2 * AXLE)))), y = LANE - hr;
        // the car's shadow lies on whatever is under it
        g.fillStyle = 'rgba(36,21,49,0.28)';
        g.beginPath();
        for (let i = 0; i <= 40; i++) {
            const u = i / 40, x = CX + 0.3 * SC + (u * 2 - 1) * 4.8 * SC, th = 0.2 * SC * Math.sqrt(Math.max(0, 1 - (u * 2 - 1) ** 2));
            g[i ? 'lineTo' : 'moveTo'](x, LANE - 0.1 * SC - V.bowH(x - xa, BOW_W, BOW_H) - th);
        }
        for (let i = 40; i >= 0; i--) {
            const u = i / 40, x = CX + 0.3 * SC + (u * 2 - 1) * 4.8 * SC, th = 0.2 * SC * Math.sqrt(Math.max(0, 1 - (u * 2 - 1) ** 2));
            g.lineTo(x, LANE - 0.1 * SC - V.bowH(x - xa, BOW_W, BOW_H) + th);
        }
        g.fill();
        const onBow = at(t, BOW_ON) && !at(t, BOW_OFF), top = E.bump(t, n(4) - 0.2, 0.5); // light over the top, on bar 40's first beat
        Rig.band(g, t, CX, y, SC, {
            spin: X / (0.56 * SC), bounce: 0.5 * Math.sin(ph * TAU) * (onBow ? 0.5 : 1) + 0.8 * spring(t, BOW_OFF, 19, 7) - 0.5 * top, lean, exhaust: 0.5, shadow: false,
            tomDrives: false, sing: true, driver: chorusCactus(driving(t)),
            pose: { tom: { headTilt: -0.08 - 0.03 * Pu.pulse } },
        });
        V.rainbow(g, xa, LANE, BOW_W, BOW_H, t, 'front');
        // the wheels knock wisps out of the banks of cloud: going in on the snare, coming out on the snare
        wisps(g, t, BOW_ON, CX + AXLE, LANE - 14);
        wisps(g, t, BOW_OFF, CX - AXLE, LANE - 14);
        // over the top on bar 40's first beat: the air twinkles round the car
        const tk = Math.floor((t - n(4)) * 12 + 1e-6);
        if (tk >= 0 && tk < 4) {
            const k = [0.7, 1, 0.75, 0.4][tk];
            for (const [dx, dy, r, c] of [[-372, -214, 30, K.white], [-150, -392, 24, K.yellow], [96, -356, 34, K.white], [318, -250, 26, K.yellow], [418, -120, 22, K.white]]) C.sparkle(g, CX + dx, y + dy, r * k, { color: c, ink: K.ink, lw: 3, rot: tk * 0.2 });
        }
        World.front(g, t, X, 'day', { skip: nearSkip });
    }
    // Wisps of cloud thrown up from (x, y) at `a`: they fly out, shrink and are left behind by the car.
    function wisps(g, t, a, x, y) {
        const age = twos(t, a) - a;
        if (t < a - 1e-6 || age > 0.42) return;
        const k = age / 0.42, d = Math.floor(age * 12 + 1e-6), r = Motion.rng('verse2a-wisps' + Math.round(a * 24)), list = [];
        for (let i = 0; i < 6; i++) {
            const ang = Math.PI * (1.05 + 0.9 * r()), v = 150 + 170 * r(), sz = 15 + 12 * r();
            list.push([x + Math.cos(ang) * v * Math.sqrt(k) - Rig.SPEED * 0.55 * age, y + Math.sin(ang) * v * Math.sqrt(k) * 0.8, sz * (1 - k * k) * Math.min(1, 0.6 + k * 3), 5, r() * TAU + d * 0.5]);
        }
        Chorus1Props.puffs(g, list, '#fffdf4', 3);
    }
    // A near object that would be on screen while the car is on the rainbow is left out.
    const nearSkip = (i) => {
        const x0 = i * 1900 + Motion.rng('near:' + i)() * 1140, tin = (x0 - 1250) / 1.6, tout = (x0 + 250) / 1.6; // on screen while Rig.X(t) is between these
        return tout > Rig.X(BOW_ON - 0.1) && tin < Rig.X(T41);
    };

    // =========================================================================================
    // Shot 2 · «Cruise control», bars 41–43: the cockpit. The cactus hits the button, the wheel
    // turns by itself; he leans back, lifts his shades, rubs his eyes and nods off
    // =========================================================================================
    const CS = 330, CCX = 480 - 2.0 * CS, CGY = 1000 + 0.38 * CS; // the car's scale and where its origin is on screen
    const HIT = n(11), PRESS = n(12), FREE = n(13), LIDS = n(15), RUB = n(16), DROP = n(18), SLEEP = n(19);
    const carPt = (p, bn = 0) => [CCX + p[0] * CS, CGY + (p[1] + 0.1 * bn) * CS];
    // The world behind the cockpit, through a longer lens: the horizon sits under the door's
    // top and the far layers are 1.7 times the wide shot's, so the cactus acts against the sky
    // and the mesas while the verge still runs by under them.
    function cockpitWorld(g, t) {
        g.save();
        g.translate(500, 792);
        g.scale(1.7, 1.7);
        g.translate(-520, -World.HOR);
        World.back(g, t, Rig.X(t), 'day', SKY);
        g.restore();
    }
    // the cactus's arms, as paths in its own units (trunk → elbow → tip)
    const ARM = {
        rUp: [[0.15, -0.9], [0.47, -1.0], [0.42, -1.5]],
        rPress: [[0.15, -0.9], [0.42, -1.04], [0.35, -0.7]],
        rBack: [[0.15, -1.08], [0.5, -1.38], [0.1, -1.74]],
        rLids: (up) => [[0.12, -1.02], [0.5, -1.2], [0.27, -1.47 - up]],
        rOut: [[0.15, -1.02], [0.42, -1.14], [0.56, -1.0]],
        rDroop: [[0.15, -1.0], [0.36, -1.02], [0.33, -0.62]],
        lBack: [[-0.15, -1.08], [-0.5, -1.38], [-0.1, -1.74]],
        lRub: (rx, ry) => [[-0.12, -1.02], [-0.5, -1.24], [-0.1 + rx, -1.49 + ry]],
        lOut: [[-0.15, -1.02], [-0.42, -1.14], [-0.56, -1.0]],
        lDroop: [[-0.15, -1.0], [-0.4, -1.02], [-0.42, -0.64]],
    };
    // an arm let go on DROP: out to the side on the first drawing, then down, with a small swing
    const fall = (from, out, down, t) => {
        const k = Math.floor((t - DROP) * 12 + 1e-6);
        return k < 1 ? lerpPts(from, out, 0.8) : lerpPts(out, down, [0.55, 1.12, 0.95, 1][Math.min(3, k - 1)]);
    };
    function cockpitCactus(t) {
        const Pu = S.pulseAt(t);
        const pose = { shades: 0, squash: 0.05 * Pu.pulse, lean: 0, mouth: 'smile' };
        const wave = Pu.k % 2 ? Pu.pulse : -Pu.pulse * 0.6;
        pose.armL = { pts: V.armUp(-1, wave) };
        pose.armR = V.armTo(ON_WHEEL);
        if (at(t, n(10)) && !at(t, FREE)) {
            // «hit cruise control»: the arm leaves the wheel, goes up, comes down on the button
            const up = E.out(seg2(t, n(10), n(10) + 3 / 12));
            pose.lean = 0.05 * up;
            pose.armL = { pts: V.armUp(-1, 0.4) };
            const wheelPts = [[0.15, ON_WHEEL[1]], [0.33, ON_WHEEL[1]], [ON_WHEEL[0], ON_WHEEL[1]]];
            if (!at(t, PRESS)) pose.armR = { pts: V.bend(lerpPts(wheelPts, ARM.rUp, up)), w: 0.19 };
            else {
                pose.armR = { pts: V.bend(ARM.rPress), w: 0.19 };
                pose.squash += 0.07 * bump(t, PRESS, 0.25);
                pose.lean = 0.08;
            }
            pose.mouth = at(t, HIT) && !at(t, PRESS) ? 'oh' : 'smile';
        } else if (at(t, FREE) && !at(t, LIDS)) {
            // «control»: hands off, back in the seat, arms behind its head
            const u = seg2(t, FREE, FREE + 3 / 12), back = E.back(u);
            pose.lean = E.lerp(0.08, -0.13, back);
            pose.armR = { pts: V.bend(lerpPts(ARM.rPress, ARM.rBack, E.out(u))) };
            pose.armL = { pts: V.bend(lerpPts(V.armUp(-1, 0.4), ARM.lBack, E.out(u))) };
        } else if (at(t, LIDS)) {
            pose.lean = -0.13;
            const lift = E.out(seg2(t, LIDS, LIDS + 3 / 12));
            // the shades: pushed up on to the forehead, held, then let go: they drop back with a bounce
            const bounceUp = at(t, DROP) ? [0.2, 0.06, -0.03, 0.015, 0][Math.min(4, Math.floor((t - DROP) * 12 + 1e-6))] : 0.2 * lift;
            pose.shades = bounceUp;
            pose.shadesTilt = at(t, DROP) ? 0 : 0.1 * lift;
            pose.eyes = at(t, RUB) ? 'shut' : 'sleepy';
            pose.mouth = !at(t, RUB) ? 'yawn' : at(t, SLEEP) ? 'sleep' : 'flat';
            // the right arm lifts them and lets go; the left one rubs, slowly: across and back, a drawing a stop
            if (!at(t, DROP)) pose.armR = { pts: V.bend(lerpPts(ARM.rBack, ARM.rLids(0.2 * lift), lift)), front: lift > 0.4 };
            else pose.armR = { pts: V.bend(fall(ARM.rLids(0.2), ARM.rOut, ARM.rDroop, t)) };
            if (!at(t, RUB - 2 / 12)) pose.armL = { pts: V.bend(ARM.lBack) };
            else if (!at(t, DROP)) {
                const reach = E.out(seg2(t, RUB - 2 / 12, RUB)), k = Math.max(0, Math.floor((t - RUB) * 12 + 1e-6));
                const stop = [[0, 0], [0.07, -0.015], [0.16, 0], [0.19, 0.012], [0.12, -0.012], [0.03, 0], [0.0, 0.012], [0.09, -0.01], [0.17, 0]][Math.min(8, k)];
                pose.armL = { pts: V.bend(lerpPts(ARM.lBack, ARM.lRub(stop[0], stop[1]), reach)), front: reach > 0.4 };
            } else pose.armL = { pts: V.bend(fall(ARM.lRub(0.17, 0), ARM.lOut, ARM.lDroop, t)) };
            if (at(t, DROP)) {
                // asleep: it sags in the seat and the bubble swells
                const sag = E.out(seg2(t, DROP + 1 / 12, SLEEP));
                pose.lean = -0.13 - 0.05 * sag;
                pose.squash = 0.04 * sag;
                pose.eyes = 'shut';
                if (at(t, SLEEP)) pose.bubble = snoreAt(t);
            }
        }
        return pose;
    }
    // The snore: the bubble swells over a beat and a half, sinks back over half a beat, and again.
    const snoreAt = (t) => {
        const per = 2 * S.BEAT, u = ((twos(t, SLEEP) - SLEEP) % per) / per;
        return u < 0.72 ? 0.12 + 0.88 * E.out(u / 0.72) : 0.12 + 0.88 * (1 - E.inOut((u - 0.72) / 0.28));
    };
    // the wheel by itself: it rocks gently once the button is in
    const steer = (t) => (at(t, FREE) ? 0.34 * Math.min(1, (t - FREE) / 0.25) * Math.sin(((t - FREE) / (2 * S.BEAT)) * TAU) : 0);

    function cruise(g, t) {
        const Pu = S.pulseAt(t), d = C.drawing(t), bn = 0.25 * Pu.pulse;
        cockpitWorld(g, t);
        const lit = !at(t, PRESS) ? 0 : [1.5, 1.25, 1][Math.min(2, Math.floor((t - PRESS) * 12 + 1e-6))];
        const pose = cockpitCactus(t), st = steer(t);
        Rig.band(g, t, CCX, CGY, CS, {
            spin: Rig.X(t) / (0.56 * SC), bounce: bn, tomDrives: false, sing: true,
            driver: (g2, s) => V.cactus(g2, 0, 0, s, pose),
            cockpit: {
                back: (g2, s) => {
                    V.wheelSpokes(g2, s, st * 2.2);
                    V.pilot(g2, s, lit, d);
                },
            },
        });
        // the call-out: the dash from his seat. It pops out of the dash on «hit» and goes back when he goes for his shades
        if (at(t, HIT) && !at(t, LIDS + 3 / 12)) {
            const k = !at(t, LIDS) ? S.pop(t, HIT, 0.25) : [1.06, 0.7, 0.3][Math.min(2, Math.floor((t - LIDS) * 12 + 1e-6))];
            // his branch: in over two drawings, held back, down on the button on the beat, off after three drawings
            let arm = null;
            if (!at(t, PRESS)) arm = { u: [0.42, 0.62, 0.7, 0.66][Math.min(3, Math.floor((t - HIT) * 12 + 1e-6))] };
            else if (!at(t, PRESS + 5 / 12)) {
                const k2 = Math.floor((t - PRESS) * 12 + 1e-6);
                arm = { u: [1, 1, 1, 0.6, 0.25][k2], sq: [1, 0.6, 0, 0, 0][k2] };
            }
            const wob = at(t, PRESS) ? 0 : 0.035 * (d % 2 ? 1 : -1) * (d % 3 ? 1 : 0.4);
            V.callout(g, 778, 252, 150, {
                k, from: carPt([V.LAMP[0], V.LAMP[1] - 0.2], bn), d, lit, arm, steer: st,
                press: !at(t, PRESS) ? 0 : !at(t, PRESS + 3 / 12) ? 1 : 0.8, needle: 0.62 + wob,
            });
        }
    }

    // =========================================================================================
    // Shot 3 · «What is behind them», bar 44: the camera drops back along the road to the hearse
    // and the rain machine it tows; an imp cranks, the funnel coughs out its first cloud
    // =========================================================================================
    const BX = 975, HX = 572, FAR = LANE - 53; // where the band's car and the hearse end up; the hearse runs in the far lane
    const COUGH = n(22);
    function behind(g, t) {
        const Pu = S.pulseAt(t), d = C.drawing(t), ph = (t - b(Pu.k)) / S.BEAT;
        // the camera starts on the band's car and drops back; the hearse is catching up as well
        const u = E.seg(t, T44, T44 + 0.62), cam = 300 * Math.pow(1 - u, 3), X = Rig.X(t) + cam;
        const bx = BX - cam, hx = HX - cam - 250 * Math.pow(1 - E.seg(t, T44, T44 + 0.62), 3);
        World.back(g, t, X, 'day', SKY);
        // the machine: the needles climb, a bulge goes up the funnel, and on the third beat it coughs
        const build = E.seg(t, T44, COUGH), cough = at(t, COUGH), since = t - COUGH;
        const hb = 0.4 * Math.sin(ph * TAU), ho = { bounce: hb };
        const mo = {
            towed: true, t, spin: (Rig.X(t) + hx) / (0.28 * SC), crank: ((twos(t, T44) - T44) / S.BEAT) * TAU + 0.6,
            needles: cough ? 0.92 : 0.12 + 0.88 * build, puff: cough ? 1 - seg2(t, COUGH, COUGH + 3 / 12) : seg2(t, n(21), COUGH),
            shake: cough ? Math.max(0.35, 1 - since / 0.5) : 0.25 + 0.5 * build, bounce: cough ? 1.2 * spring(t, COUGH, 22, 8) : 0, smoke: 0.7,
        };
        const tow = W.towedAt(hx, FAR, SC, ho);
        mo.pitch = tow.pitch;
        const mx = tow.x, my = tow.y, MP = W.machinePoints(mo), mouth = [mx + MP.mouth[0] * SC, my + MP.mouth[1] * SC];
        W.machine(g, mx, my, SC, mo);
        // the trident, stood in the pulpit behind him: his mitts are busy
        const hs = Rides.hearseSeats().devil;
        g.save();
        g.translate(hx + (hs[0] - 0.5) * SC, FAR + (hs[1] + 0.1 * hb) * SC);
        g.scale(SC, SC);
        Devil.trident(g, 0, -0.5, 3.2 / SC, { ang: -0.1, grip: 0.5 });
        g.restore();
        // the Devil on his pulpit rubs his mitts; when the cloud is out he looks up at it
        const rub = d % 2 ? 1 : -1, look = cough ? -1 : 1;
        Rig.hearse(g, t, hx, FAR, SC, {
            spin: (Rig.X(t) + hx) / (0.58 * SC), bounce: hb, flames: 0.5,
            devil: { mood: cough && since < 0.3 ? 'grin' : 'sly', trident: false, look, headTilt: cough ? -0.07 : 0.03, handR: [-0.08 + 0.05 * rub, -0.68 - 0.035 * rub], handL: [0.1 - 0.05 * rub, -0.66 + 0.035 * rub] },
        });
        const c = W.crankImp(mo.crank, 0.67, mo);
        Devil.imp(g, mx + c.x * SC, my + c.y * SC, 0.67 * SC, { armUp: c.armUp, hop: c.hop, squash: c.squash, look: -1, shadow: false, wear: 'hat', mood: cough ? 'awe' : 'grin' });
        // the first cloud: out of the funnel on the beat, it rises and hangs over the hearse. On the
        // block's last frame it is still, at (HX − 207, 396) with grow 0.24: the next block takes it from there
        if (cough) {
            const rise = E.out(E.seg(since, 0, 0.55)), hang = [hx - 207, 396], wob = 1 - E.seg(since, 0.35, 0.65);
            const cxy = [E.lerp(mouth[0], hang[0], rise * rise) + 6 * wob * Math.sin(since * 5), E.lerp(mouth[1] - 20, hang[1], rise) + 5 * wob * Math.sin(since * 7)];
            W.stormCloud(g, cxy[0], cxy[1], SC, { grow: 0.04 + 0.2 * E.out(E.seg(since, 0, 0.5)), t });
        }
        // the band's car: nobody has noticed; the cactus sleeps at the wheel. (No near layer in this
        // shot: anything that big would cross the machine in the bar it has.)
        Rig.band(g, t, bx, LANE, SC, {
            spin: Rig.X(t) / (0.56 * SC), bounce: 0.5 * Math.sin(ph * TAU), exhaust: 0.5, tomDrives: false, sing: true,
            driver: (g2, s) => V.cactus(g2, 0, 0, s, { shades: 0, lean: -0.18, squash: 0.04, eyes: 'shut', mouth: 'sleep', bubble: snoreAt(t), armL: { pts: V.bend(ARM.lDroop) }, armR: { pts: V.bend(ARM.rDroop) } }),
        });
    }

    function draw(g, t, env) {
        if (t < T41 - 1e-6) feeling(g, t);
        else if (t < T44 - 1e-6) cruise(g, t);
        else behind(g, t);
    }

    Seg.verse2a = {
        shots: [[T0, T41, 'Feeling good'], [T41, T44, 'Cruise control'], [T44, T45, 'Behind them']],
        draw,
        // the hard cut from Hell's office is a dirty edit: the tracking jumps for two frames
        post: (t) => ({ track: [0.25, 0.1][Math.round((t - T0) * 24)] ?? 0 }),
    };
})();
