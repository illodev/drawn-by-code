// The bridge, bars 119–128 (168.375–182.5 s): the film's turn. The Devil swaps the contract for
// a guitar. No lead vocal; the backing voices' «ooh»s run to 178.2 (the rig sings them).
//   bars 119–120  The contract   close on his box: he holds the contract out over the rail, looks from
//                                it to the band and back, tears it down the middle (bar 120's first
//                                beat), across (the next), and throws the four pieces over his shoulder
//   bars 121–123  The fire       he vaults the rail, slides down the box's corbel onto the rock stack
//                                under it, rolls a sleeve up and puts his arm in the brazier, tongue
//                                out; the fire turns green, blue, purple, pink, a beat each; on bar
//                                123 he pulls: his trident's fork (a beat of doubt), then the rest:
//                                a guitar, on a starburst
//   bar 124       The house      wider: he has it on; the lighters sway, a wave runs through the pit,
//                                the contract's pieces come down on the crowd, which bats them about
//                                (two meet a lighter); he hops down onto the car's bonnet and walks it
//   bars 125–126  The nod        the car's front half, closer: the cactus, Mike, Benmont and Howie
//                                look round, a head every half beat; Tom lifts his shades for a beat
//                                (the only time he notices him), nods them back on and steps up onto
//                                the seat's back; the Devil vaults the windscreen into Tom's place,
//                                hits a sour note (everybody winces), tunes one peg
//   bars 127–128  Face to face   the stage view: the good note (the crowd roars, a spot on each);
//                                Mike steps forward, they square up, necks up; Stan counts four on
//                                his sticks. The last frame is the solo's first picture.
// The cactus in shades sits at the wheel (Chorus1Props). Props: segments/bridge-props.js (BridgeProps).
(() => {
    const Seg = (window.Seg = window.Seg || {});
    const C = Cereal, K = C.COL, E = Ease, S = Song, I = Inferno, P = BridgeProps, twos = S.twos, pop = S.pop;
    const PI = Math.PI, TAU = PI * 2, FR = 1 / 24, lerp = E.lerp;
    const n = (k) => S.snap(S.OFFSET + (476 + k) * S.BEAT); // beat k of the block (halves too), on its frame
    const T0 = n(0), T1 = n(8), T2 = n(20), T3 = n(24), T4 = n(32), T5 = n(40);
    const on = (t, a) => t >= a - 1e-6;
    const seg2 = (t, a, c) => E.seg(twos(t, a), a, c); // 0..1 on twos, counted from a
    const bump = (t, a, dur = 0.3) => E.bump(twos(t, a), a, dur);
    const smooth = (u) => u * u * (3 - 2 * u);
    const dr = (t, a) => Math.floor((t - a) * 12 + 1e-6); // drawings since a
    const lerpPt = (p, q, u) => [lerp(p[0], q[0], u), lerp(p[1], q[1], u)];
    // a hop from p to q: u 0..1, h its height
    const arc = (p, q, u, h) => [lerp(p[0], q[0], u), lerp(p[1], q[1], u) - h * 4 * u * (1 - u)];
    // a value that jumps to `to` at `a` and settles back with a bounce (a landing's squash)
    const thud = (t, a, amp = 0.16, dur = 0.3) => (on(t, a) ? amp * Math.max(0, 1 - (twos(t, a) - a) / dur) * Math.cos(((twos(t, a) - a) / dur) * PI * 1.5) : 0);

    const venueO = (view, pan, t) => ({ view, pan, heat: 1, beatK: S.pulseAt(t).pulse });
    const BOX = [884, 440]; // the box's floor under him (set coordinates)
    const BRZ = I.STAGE.wide.braziers[1]; // the right stack's brazier: the bowl's rim (set coordinates)
    const STACK = [872, 579]; // where he stands on the right stack, in front of the bowl's left end

    // --- the band on its car (Rig.band's own order and poses), with the places this block needs ---
    const SEATS = Rides.bandCarSeats();
    const WHEEL = [SEATS.wheel[0] - SEATS.driver[0] - 0.07, SEATS.wheel[1] - SEATS.driver[1] + 0.02];
    const TOM_NO_SHADOW = { ...Cast.TOM, shadow: 'rgba(0,0,0,0)' };
    const RISER = [1.8, -1.59]; // on the back of the cockpit's seat (its top is 0.69 above the deck), half way across
    const MIKE_FWD = [0.26, -0.77], DEVIL_AT = [1.22, -0.77]; // the deck's near row: Mike in front of his place, the Devil in Tom's
    /**
     * o: { bounce, solo, pose: { tom, mike, … } overrides, cactus: a pose,
     *      tomAt: [x, y] car units (default his place up front), tomUp: true when he is off the deck's boards (no shadow),
     *      mikeAt: [x, y] (default his place), mikeNear: true once he is in the near row,
     *      devil: (g2, sc) => … draws the Devil at (0, 0), devilAt: [x, y],
     *      count: { up, click } Stan's arms up for the count }
     */
    function band(g, t, car, o = {}) {
        const pz = Rig.playing(t, { sing: true, solo: o.solo ?? 0 }), ov = o.pose ?? {}, Pu = S.pulseAt(t);
        const pose = (who) => ({ ...pz[who], ...(ov[who] ?? {}) });
        let tips = null;
        Rides.bandCar(g, car.x, car.y, car.s, { spin: 0, bounce: o.bounce ?? 0, lean: 0, exhaust: 0, t }, (g2, seats, sc0) => {
            const put = (p, fn) => Rides.at(g2, sc0, p, (px, py, sc) => {
                g2.save();
                g2.translate(px, py);
                fn(sc);
                g2.restore();
            });
            const mike = (sc) => BandStrings.mike(g2, 0, 0, sc, pose('mike'));
            put(seats.kit, (sc) => {
                if (o.count) tips = P.stanCount(g2, sc, pose('stan'), o.count.up, o.count.click);
                else BandRhythm.stan(g2, 0, 0, sc, pose('stan'));
            });
            put(seats.deck[3], (sc) => BandStrings.howie(g2, 0, 0, sc, pose('howie')));
            if (!o.mikeNear) put(o.mikeAt ?? seats.deck[1], mike);
            put(seats.deck[2], (sc) => BandRhythm.benmont(g2, 0, 0, sc, pose('ben')));
            put(o.tomAt ?? seats.deck[0], (sc) => Cast.tom(g2, 0, 0, sc, pose('tom'), o.tomUp ? TOM_NO_SHADOW : Cast.TOM));
            if (o.mikeNear) put(o.mikeAt ?? MIKE_FWD, mike);
            if (o.devil) put(o.devilAt ?? DEVIL_AT, (sc) => o.devil(g2, sc));
            put(seats.driver, (sc) => Chorus1Props.cactus(g2, 0, 0, sc, { wheel: WHEEL, shades: 1, squash: 0.05 * Pu.pulse, wave: Pu.k % 2 ? Pu.pulse : -Pu.pulse * 0.6, ...(o.cactus ?? {}) }));
        });
        return tips ? [car.x + (SEATS.kit[0] + tips[0]) * car.s, car.y + (SEATS.kit[1] + tips[1]) * car.s] : null;
    }
    const carPt = (car, p, bounce = 0) => [car.x + p[0] * car.s, car.y + (p[1] + 0.1 * bounce) * car.s];
    // a place on the bonnet, a little way in from its near edge: x along the car
    const bonnet = (x) => [x + 0.12, lerp(-1.12, -1.0, E.clamp((x - 3.15) / 1.15)) - 0.08];

    // --- the contract's pieces, from the throw to the crowd (set coordinates, so every shot sees the same ones) ---
    const CC = [0, -0.5]; // the contract's middle when he tears it, in his units
    const T_THROW = n(6), T_APEX = T_THROW + 10 * FR, BAT_Y = 800;
    const SCRAPS = [
        { apex: [938, 236], sway: 20, ph: 0.4, bats: [[n(21.5), 768], [n(23.5), 728], [n(25.5), 688], [n(27.5), 650]] },
        { apex: [968, 262], sway: 16, ph: 2.1, bats: [[n(21), 792], [n(23), 838]] },
        { apex: [902, 250], sway: 24, ph: 3.6, bats: [[n(22.5), 704], [n(24.5), 652], [n(26.5), 606]] },
        { apex: [996, 300], sway: 14, ph: 5.0, bats: [[n(21), 744]] },
    ];
    const BURN = 0.42; // seconds a piece burns
    function scrapAt(i, t) {
        const sc = SCRAPS[i], h = P.held(i), sg = i % 2 ? 1 : -1;
        const from = [BOX[0] + (CC[0] + h.at[0]) * 84, BOX[1] + (CC[1] + h.at[1]) * 84];
        if (t < T_APEX) {
            const u = E.seg(t, T_THROW, T_APEX);
            return { x: lerp(from[0], sc.apex[0], u), y: lerp(from[1], sc.apex[1], E.out(u)), ang: h.ang + sg * u * 5.2, wide: 0.45 + 0.55 * Math.abs(Math.cos(u * 6 + i)) };
        }
        const [tb, xb] = sc.bats[0], last = sc.bats[sc.bats.length - 1];
        if (t >= last[0] + BURN) return null;
        if (t >= last[0]) return { x: last[1], y: BAT_Y, burn: (t - last[0]) / BURN };
        if (t < tb) {
            // it flutters down: quickly off to the left of the box, then slowly down that side
            const u = (t - T_APEX) / (tb - T_APEX), tau = t - T_APEX, env = Math.sin(PI * Math.min(1, u * 1.02)) ** 0.6;
            return {
                x: lerp(sc.apex[0], xb, smooth(Math.min(1, u * 3.6))) + sc.sway * Math.sin(tau * 2.7 + sc.ph) * env,
                y: lerp(sc.apex[1], BAT_Y, Math.pow(u, 1.12)),
                ang: 0.55 * Math.sin(tau * 2.7 + sc.ph + 1.2) + sg * 0.25, wide: 0.42 + 0.58 * Math.abs(Math.cos(tau * 3.3 + sc.ph)),
            };
        }
        // batted from mitt to mitt
        let k = 0;
        while (k < sc.bats.length - 2 && t >= sc.bats[k + 1][0]) k++;
        const [ta, xa] = sc.bats[k], [tc, xc] = sc.bats[k + 1], u = (t - ta) / (tc - ta);
        return { x: lerp(xa, xc, u), y: BAT_Y - 92 * 4 * u * (1 - u), ang: sg * (0.3 + u * (k % 2 ? -4.2 : 4.2)), wide: 0.5 + 0.5 * Math.abs(Math.cos(u * 5 + i)), bat: t - ta };
    }
    function scraps(g, t, St) {
        if (!on(t, T_THROW)) return;
        const s = 84 * St.k, d = C.drawing(t);
        for (let i = 0; i < 4; i++) {
            const a = scrapAt(i, twos(t, T_THROW));
            if (!a) continue;
            const p = St.at([a.x, a.y]);
            if (p[0] < -80 || p[0] > 1080 || p[1] < -80 || p[1] > 1080) continue;
            if (a.burn != null) P.burnt(g, p[0], p[1], s, a.burn, d);
            else {
                P.scrap(g, p[0], p[1], s, i, a.ang, a.wide);
                if (a.bat != null && a.bat < 2.5 / 12) P.ticks(g, p[0], p[1] + 0.2 * s, 0.2 * s, 0.34 * s, 4, PI * 0.15, PI * 0.85, K.white, 2.6);
            }
        }
    }

    // =========================================================================================
    // Shot 1 · «The contract», bars 119–120: close on his box
    // =========================================================================================
    const V1 = { k: 2.2, cx: 880, cy: 404 };
    const RIP1 = n(4), RIP2 = n(5), VAULT = n(7.5);
    // the contract's k (Inferno.tornContract): whole, torn down the middle, torn across
    const tornK = (t) => (!on(t, RIP1) ? 0 : !on(t, RIP2) ? 0.05 + 0.17 * (0.6 + 0.4 * seg2(t, RIP1, RIP1 + 2 / 12)) : 0.27 + 0.15 * (0.6 + 0.4 * seg2(t, RIP2, RIP2 + 2 / 12)));
    function contractShot(g, t) {
        const o = venueO(V1, 0, t), St = I.stage(V1, 0), Pu = S.pulseAt(t), bx = St.box, s = bx.s, tw = (a) => twos(t, a);
        I.venue(g, t, o);
        // where the contract is held: out over the rail; up to his eyes when he reads it
        const read = seg2(t, n(1), n(1) + 0.17) * (1 - seg2(t, n(2), n(2) + 0.17)) + seg2(t, n(3), n(3) + 0.17);
        const cc = [0, lerp(-0.36, CC[1], Math.min(1, read))], k = tornK(t), thrown = on(t, T_THROW), climb = on(t, n(7));
        const rip = bump(t, RIP1, 0.25) + bump(t, RIP2, 0.25), fling = thrown ? E.out(seg2(t, T_THROW, T_THROW + 2 / 12)) : 0, down = climb ? seg2(t, n(7), n(7) + 0.17) : 0;
        const crouch = on(t, VAULT) ? E.out(seg2(t, VAULT, VAULT + 2 / 12)) : 0;
        const pose = {
            shadow: false, handR: P.NO_HAND, handL: P.NO_HAND, tail: 0.04 * Math.sin((Pu.k + Pu.since) * PI),
            squash: 0.035 * Pu.pulse + 0.07 * rip + 0.14 * crouch - 0.05 * bump(t, T_THROW, 0.25),
            headDy: 0.02 * Pu.pulse + 0.05 * Math.min(1, read) * (thrown ? 0 : 1) + 0.04 * crouch,
            headTilt: thrown && !climb ? -0.07 * fling : on(t, n(2)) && !on(t, n(3)) ? -0.05 : 0,
            look: climb ? -1 : thrown ? 0.4 : on(t, RIP1) ? 0 : on(t, n(3)) ? 0 : on(t, n(2)) ? -1 : on(t, n(1)) ? 0 : -1,
            mood: climb ? 'grin' : on(t, RIP2) ? 'laugh' : on(t, n(3)) && !on(t, RIP1) ? 'sly' : 'grin',
            eyes: on(t, RIP1) && !on(t, RIP1 + 3 / 12) ? 'shut' : 'open',
        };
        I.box(g, bx.x, bx.y, s, { t }, (g2) => Devil.draw(g2, bx.x, bx.y, s, pose));
        // his arms come over the rail: the contract first, his mitts on its two halves
        let hR, hL;
        if (!thrown) {
            const q = I.tornPoints(k, 0), c = P.toFrame(bx.x, bx.y, s, pose, cc);
            I.tornContract(g, c[0], c[1], s, k, 0, { fall: 0 });
            hR = [cc[0] + q.l[0], cc[1] + q.l[1]];
            hL = [cc[0] + q.r[0], cc[1] + q.r[1]];
        } else {
            // the throw: both mitts up and back over his shoulders; then down onto the rail to climb it
            const a = P.held(0).at, c = P.held(2).at;
            hR = lerpPt(lerpPt([CC[0] + a[0] + 0.02, CC[1] + 0.02], [-0.56, -1.52], fling), I.BOX.rail.handR, down);
            hL = lerpPt(lerpPt([CC[0] + c[0] - 0.02, CC[1] + 0.02], [0.6, -1.6], fling), I.BOX.rail.handL, down);
        }
        P.frame(g, bx.x, bx.y, s, pose, (L) => {
            P.arm(g, L, P.SH.R, hR);
            P.arm(g, L, P.SH.L, hL);
        });
        scraps(g, t, St);
    }

    // =========================================================================================
    // Shot 2 · «The fire», bars 121–123: over the rail, down the rock, an arm in the brazier
    // =========================================================================================
    const V2 = { k: 2.3, cx: 880, cy: 484 };
    const SLIDE = n(9), LAND = n(10), ROLL = n(11), DIP = n(12), HEAVE = n(15.5), PULL = n(16), PULL2 = n(17.25), OUT = n(18.75), HANG = n(19.5);
    const FLANK0 = [808, 480], FLANK1 = [870, 524]; // the corbel's left flank, where his hooves slide (set coordinates)
    const COLS = ['green', 'blue', 'purple', 'pink'];
    // the guitar's k (Inferno.guitarFromFire): the fork, a beat of doubt, the rest, and it hangs
    const axeK = (t) => (!on(t, PULL) ? 0 : !on(t, PULL2) ? 0.06 + 0.1 * E.out(seg2(t, PULL, PULL + 2 / 12)) : !on(t, OUT) ? lerp(0.16, 0.85, seg2(t, PULL2, OUT)) : lerp(0.85, 1, smooth(seg2(t, OUT, HANG))));
    function fireShot(g, t) {
        const o = venueO(V2, 0, t), St = I.stage(V2, 0), Pu = S.pulseAt(t), s = 84 * St.k, d = C.drawing(t), sF = s * 0.86;
        I.venue(g, t, o);
        I.box(g, St.box.x, St.box.y, St.box.s, { t });
        const F = St.at([BRZ[0] + 9, BRZ[1] + 6]), k = axeK(t);
        // --- where he is -------------------------------------------------------------------------
        let at, pose = { shadow: false, handR: P.NO_HAND, handL: P.NO_HAND, tail: 0.04 * Math.sin((Pu.k + Pu.since) * PI) }, hR = [-0.5, -0.5], hL = [0.5, -0.5], roll = 0, tongue = false;
        if (!on(t, SLIDE)) {
            // over the rail (he is already in the air on the cut) and down onto the corbel's flank
            const u = E.seg(t, T1 - 2 * FR, SLIDE);
            at = arc([850, 400], FLANK0, u, 16);
            Object.assign(pose, { lean: lerp(-0.5, -0.16, u), mood: 'laugh', squash: -0.06 });
            hR = [-0.7, -1.3];
            hL = [0.72, -1.2];
        } else if (!on(t, LAND)) {
            // down the flank on his hooves, leaning back, and off its tip onto the stack
            const tip = LAND - 3 * FR, u = E.seg(t, SLIDE, tip);
            at = t < tip ? lerpPt(FLANK0, FLANK1, u) : arc(FLANK1, STACK, E.seg(t, tip, LAND), 6);
            Object.assign(pose, { lean: -0.3 + 0.08 * Math.sin(dr(t, SLIDE) * 2.1), mood: 'laugh', squash: 0.06 * (1 - u) });
            hR = [-0.78, -0.95 - 0.08 * (dr(t, SLIDE) % 2)];
            hL = [0.76, -1.0 + 0.08 * (dr(t, SLIDE) % 2)];
        } else {
            at = STACK;
            pose.squash = thud(t, LAND, 0.2) + 0.03 * Pu.pulse;
            pose.mood = 'grin';
            if (!on(t, ROLL)) {
                pose.look = 1;
                hR = [-0.56, -0.6];
                hL = [0.56, -0.6];
            } else if (!on(t, DIP)) {
                // the sleeve: the arm held up, the other mitt pushes the cuff to the shoulder
                roll = E.out(seg2(t, ROLL + 1 / 12, ROLL + 4 / 12));
                hL = [0.66, -1.3];
                const len = Math.hypot(hL[0] - P.SH.L[0], hL[1] - P.SH.L[1]), c = lerp(len - 0.1, 0.2, roll), ux = (hL[0] - P.SH.L[0]) / len, uy = (hL[1] - P.SH.L[1]) / len;
                hR = [P.SH.L[0] + ux * c - 0.06, P.SH.L[1] + uy * c + 0.03];
                Object.assign(pose, { mood: 'sly', look: 1, headTilt: 0.04 });
            } else if (!on(t, PULL)) {
                // in to the shoulder, feeling about, not looking; a heave before the pull
                roll = 1;
                const dip = E.out(seg2(t, DIP, DIP + 2 / 12)), hv = on(t, HEAVE) ? E.out(seg2(t, HEAVE, HEAVE + 2 / 12)) : 0, f = dr(t, DIP);
                Object.assign(pose, { lean: 0.2 * dip + 0.025 * (f % 2) + 0.07 * hv, look: -1, headTilt: -0.13 * dip, squash: 0.03 * Pu.pulse + 0.06 * hv, mood: 'grin', eyes: f % 8 === 5 ? 'shut' : 'open' });
                tongue = dip > 0.5;
                const feel = [[0, 0], [-16, 8], [10, -6], [-6, 12], [14, 6], [-12, -4]][f % 6];
                hL = P.toLocal(...St.at(at), s, pose, [F[0] - 4 + feel[0] * dip, F[1] - 8 + feel[1] * dip]);
                hL = lerpPt([0.66, -1.3], hL, dip);
                hR = [-0.62, -0.62 - 0.08 * (f % 2)];
            } else {
                // the pull: back on his hooves, the mitt on the neck as it comes
                roll = 1;
                const doubt = on(t, PULL + 3 / 12) && !on(t, PULL2), up = on(t, PULL2) ? E.out(seg2(t, PULL2, PULL2 + 3 / 12)) : 0;
                Object.assign(pose, {
                    lean: -0.12 * E.out(seg2(t, PULL, PULL + 2 / 12)) - 0.06 * up, squash: 0.03 * Pu.pulse - 0.05 * bump(t, PULL2, 0.3),
                    mood: doubt ? 'shock' : on(t, HANG) ? 'grin' : on(t, PULL2) ? 'laugh' : 'grin', look: 1, headTilt: doubt ? 0.06 : 0,
                });
                const G = I.fromFirePoints(k), grip = lerpPt(G.body, G.neck, 0.62);
                hL = P.toLocal(...St.at(at), s, pose, [F[0] + grip[0] * sF, F[1] + grip[1] * sF]);
                hR = doubt ? [-0.3, -0.92] : lerpPt([-0.6, -0.6], [-0.66, -1.42], up); // a mitt to his chin, then a fist in the air
            }
        }
        const p = St.at(at), body = () => {
            Devil.draw(g, p[0], p[1], s, pose);
            P.frame(g, p[0], p[1], s, pose, (L) => {
                if (tongue) P.head(g, pose, () => P.tongue(g, L, 1));
                P.arm(g, L, P.SH.R, hR);
                P.arm(g, L, P.SH.L, hL, roll);
            });
        };
        // --- the fire and him, in order ----------------------------------------------------------
        const rim = () => {
            // the bowl's near rim, over the fire's foot (the venue's own drawing of it, to the right of him)
            g.save();
            g.beginPath();
            g.rect(St.at([STACK[0] + 44, 0])[0], 0, 1000, 1000);
            g.clip();
            C.poly(g, [[-46, 0], [38, 0], [33, 20], [-40, 20]].map(([x, y]) => St.at([BRZ[0] + x, BRZ[1] + y])), { fill: I.R.wall, ink: K.ink, lw: 3.2 });
            C.poly(g, [St.at([BRZ[0] - 38, BRZ[1] + 8]), St.at([BRZ[0] + 30, BRZ[1] + 8])], { ink: I.R.wallL, lw: 2.2, close: false });
            g.restore();
        };
        const mainMin = (44 + 50) * (1 + 0.14 * o.beatK) * St.k * 1.05; // over the venue's own flame
        if (!on(t, DIP)) body();
        else if (!on(t, PULL)) {
            const beat = Math.min(3, Math.floor((twos(t, DIP) - DIP) / S.BEAT + 0.04)), cols = P.FIRE[COLS[beat]], big = 0.6 + 0.3 * pop(t, n(12 + beat), 0.2) + 0.1 * (on(t, HEAVE) ? 1 : 0);
            P.fire(g, F[0], F[1], sF, d, cols, big, 'back', mainMin);
            body();
            P.fire(g, F[0], F[1], sF, d, cols, big, 'front');
            // sparks of its colour jump out on each change
            const r = Motion.rng('bridge-sparks' + beat), since = twos(t, n(12 + beat)) - n(12 + beat);
            for (let i = 0; i < 6; i++) {
                const a = -PI / 2 + (r() - 0.5) * 2.2, sp = 150 + r() * 190, u = since / 0.3;
                if (u >= 1) continue;
                C.sparkle(g, F[0] + Math.cos(a) * sp * u, F[1] - 60 + Math.sin(a) * sp * u + 120 * u * u, (16 + r() * 12) * (1 - u * 0.5), { color: i % 2 ? cols[2] : cols[1], ink: K.ink, lw: 2.4, rot: i });
            }
            rim();
        } else {
            I.guitarFromFire(g, F[0], F[1], sF, k, t);
            body();
            // while it is still low the mitt is in the flames
            if (k < 0.3) P.flame(g, F[0] - 0.12 * sF, F[1], 0.62 * sF, d + 1, 1);
            rim();
            // twinkles when it is out
            if (on(t, OUT)) {
                const G = I.fromFirePoints(k), c = [F[0] + G.body[0] * sF, F[1] + G.body[1] * sF];
                [[1.05, -0.9, 0], [-0.75, -0.3, 1], [0.9, 0.5, 2], [-0.2, -1.5, 3]].forEach(([dx, dy, i]) => {
                    const u = bump(t, OUT + (i * 1.5) / 12, 0.42);
                    if (u > 0.01) C.sparkle(g, c[0] + dx * sF, c[1] + dy * sF, (10 + 30 * u), { color: K.white, ink: K.ink, lw: 2.6, rot: i * 0.4 });
                });
            }
        }
        scraps(g, t, St);
    }

    // =========================================================================================
    // Shot 3 · «The house», bar 124: wider. He has it on; the pit; down onto the bonnet
    // =========================================================================================
    const V3 = { k: 1.3, cx: 850, cy: 652 };
    const HOP = n(22), STEP1 = n(23), HOOD0 = 3.78, HOOD1 = 3.52, HOOD2 = 3.3;
    // the Devil with his guitar, keeping the beat
    const axePose = (t, o = {}) => {
        const Pu = S.pulseAt(t), ph = Pu.k + Pu.since;
        return { mood: 'grin', strum: Math.cos(ph * TAU), fret: 0.25 + 0.3 * (Math.floor(ph / 2) % 2), flames: 0.8, t, tail: 0.04 * Math.sin(ph * PI), squash: 0.04 * Pu.pulse, headDy: 0.02 * Pu.pulse, ...o };
    };
    // how the car's front sinks under him
    const dip = (t) => 0.9 * Math.max(0, thud(t, HOP, 1, 0.4));
    function houseShot(g, t) {
        const o = venueO(V3, 0, t), St = I.stage(V3, 0), car = St.car, s = car.s, bn = dip(t);
        I.venue(g, t, o);
        I.box(g, St.box.x, St.box.y, St.box.s, { t });
        band(g, t, car, { bounce: bn });
        // he slings it on (the cut is on the move), stands a beat in its light, hops down onto the bonnet and takes a step
        let p, pose;
        const off = HOP - 7 * FR;
        if (t < off) {
            p = St.at(STACK);
            const sl = E.out(seg2(t, T2, T2 + 3 / 12));
            pose = axePose(t, { shadow: false, strum: lerp(-1, 1, sl), flames: 1, squash: 0.12 * (1 - sl) + 0.03 * S.pulseAt(t).pulse + 0.1 * seg2(t, off - 3 / 12, off), mood: t < n(21) ? 'laugh' : 'grin', look: -1 });
        } else if (!on(t, HOP)) {
            const u = E.seg(t, off, HOP), a = St.at(STACK), c = carPt(car, bonnet(HOOD0));
            p = arc(a, c, u, 46);
            pose = axePose(t, { shadow: false, squash: -0.08, lean: -0.1, mood: 'laugh', flames: 1 });
        } else {
            const st = on(t, STEP1) ? E.out(seg2(t, STEP1, STEP1 + 2 / 12)) : 0, x = lerp(HOOD0, HOOD1, st);
            p = carPt(car, bonnet(x), bn);
            p[1] -= on(t, STEP1) ? 10 * bump(t, STEP1, 0.17) : 0;
            pose = axePose(t, { shadow: false, squash: 0.04 * S.pulseAt(t).pulse + Math.max(0, thud(t, HOP, 0.2)), step: on(t, STEP1) && st < 1 ? -1 : 0, look: -1 });
        }
        I.devilGuitar(g, p[0], p[1], s, pose);
        if (on(t, HOP)) {
            const h = carPt(car, bonnet(HOOD0), bn), u = bump(t, HOP, 0.2);
            if (u > 0.01 && dr(t, HOP) < 3) P.ticks(g, h[0], h[1], 0.5 * s, (0.62 + 0.2 * u) * s, 5, PI * 1.08, PI * 1.92, K.white, 2.6);
        }
        // twinkles round the guitar when it is first on
        const G = I.guitarPoints(pose);
        [[-0.75, -0.25, 0], [0.5, -0.45, 1], [-0.1, 0.55, 2]].forEach(([dx, dy, i]) => {
            const u = bump(t, T2 + i / 12, 0.4);
            if (u > 0.01 && t < off) C.sparkle(g, p[0] + (G.strings[0] + dx) * s, p[1] + (G.strings[1] + dy) * s, 8 + 22 * u, { color: K.white, ink: K.ink, lw: 2.4, rot: i * 0.5 });
        });
        I.crowd(g, t, { ...o, density: 1, hype: 1, lighters: 1, wave: lerp(0.42, 0.98, E.seg(t, T2, n(22.5))) });
        scraps(g, t, St);
    }

    // =========================================================================================
    // Shot 4 · «The nod», bars 125–126: the car's front half
    // =========================================================================================
    const V4 = { k: 1.9, cx: 640, cy: 648 };
    const LOOKS = { cactus: n(24), mike: n(24.5), ben: n(25), howie: n(25.5) };
    const SHADES = n(26), NOD = n(27), SWAP = n(28), DECK = n(29), SOUR = n(30), TUNE = n(31);
    const TOM_UP = SWAP - 7 * FR; // Tom leaves the boards
    // a head that looks round at the bonnet: a start, then it stays turned
    const turned = (t, a) => (on(t, a) ? { headTilt: 0.1 + 0.07 * bump(t, a, 0.25), headDy: -0.035 * bump(t, a, 0.25), eyes: 'wide' } : {});
    // everybody at the sour note
    const wince = (t) => bump(t, SOUR, 0.5);
    function bandPoses(t) {
        const w = wince(t), sour = w > 0.01, pz = {};
        for (const who of ['mike', 'ben', 'howie']) {
            pz[who] = on(t, DECK) ? {} : turned(t, LOOKS[who]);
            if (sour) pz[who] = { eyes: 'shut', mouth: who === 'howie' ? 'smirk' : 'o', headTilt: -0.1 * w, lean: -0.05 * w, headDy: 0.03 * w };
        }
        // Tom: the shades up off his nose for a beat, a nod that drops them back, then up onto the seat's back
        const lift = on(t, SHADES) && !on(t, NOD) ? E.out(seg2(t, SHADES, SHADES + 2 / 12)) : 0, nod = bump(t, NOD, 0.25) + 0.6 * bump(t, NOD + 4 / 12, 0.2);
        pz.tom = { shades: 1 - 0.36 * lift, headTilt: on(t, SHADES) && !on(t, SWAP) ? 0.09 : sour ? -0.06 * w : 0, headDy: 0.07 * nod + (sour ? -0.03 * w : 0) };
        if (on(t, SHADES) && !on(t, NOD + 4 / 12)) pz.tom.mouth = 'smirk';
        return pz;
    }
    // Tom's place: up front, then on the seat's back
    const tomPlace = (t) => (t < TOM_UP ? { tomAt: SEATS.deck[0] } : !on(t, SWAP) ? { tomAt: arc(SEATS.deck[0], RISER, E.seg(t, TOM_UP, SWAP), 0.3), tomUp: true } : { tomAt: RISER, tomUp: true });
    // the note that goes wrong, and the one that does not: where they are
    const sourAt = (t, from) => {
        const u = E.seg(twos(t, SOUR), SOUR, SOUR + 0.75);
        return { x: from[0] - 150 * E.out(u) + 14 * Math.sin(u * 16), y: from[1] - 250 * E.out(u) + 130 * u * u * u, k: pop(t, SOUR, 0.2), ang: -0.3 + 0.5 * u, u };
    };
    function nodShot(g, t) {
        const o = venueO(V4, 0, t), St = I.stage(V4, 0), car = St.car, s = car.s, Pu = S.pulseAt(t), d = C.drawing(t);
        I.venue(g, t, o);
        I.box(g, St.box.x, St.box.y, St.box.s, { t });
        const onDeck = on(t, DECK), w = wince(t), bn = (onDeck ? 0.8 * Math.max(0, thud(t, DECK, 1, 0.35)) : 0) - (on(t, SWAP) && !onDeck ? 0.3 * bump(t, SWAP, 0.3) : 0);
        // the Devil's pose: on the bonnet behind the windscreen, over it, on the deck
        let pose, peg = null, tongue = false;
        if (!on(t, SWAP - 3 * FR)) {
            const st = E.out(seg2(t, T3, T3 + 2 / 12));
            pose = axePose(t, { shadow: false, look: -1, step: st < 1 ? 1 : 0, mood: on(t, SHADES) ? 'sly' : 'grin', squash: 0.04 * Pu.pulse + 0.1 * seg2(t, SWAP - 6 * FR, SWAP - 3 * FR), x: lerp(HOOD1, HOOD2, st) });
        } else if (!onDeck) pose = axePose(t, { shadow: false, mood: 'laugh', squash: -0.08, lean: 0.12, flames: 1, strum: -1 });
        else {
            const hit = on(t, SOUR), tune = on(t, TUNE);
            pose = axePose(t, {
                look: -1, squash: 0.04 * Pu.pulse + Math.max(0, thud(t, DECK, 0.2)) + 0.07 * bump(t, SOUR, 0.2),
                strum: hit && !tune ? lerp(-1, 1, E.out(seg2(t, SOUR, SOUR + 2 / 12))) : tune ? 0.6 : -1, fret: 0.5,
                mood: tune ? 'grin' : hit && on(t, SOUR + 2 / 12) ? 'shock' : 'grin', flames: hit && !tune ? 0.35 : 0.8,
                headTilt: tune ? -0.07 : 0, eyes: tune && dr(t, TUNE) % 6 > 3 ? 'shut' : 'open',
            });
            if (tune) {
                // a mitt on a peg: the neck's arm is drawn here instead (a fret that is no number draws none)
                pose.fret = NaN;
                tongue = true;
                peg = axePoint({ ...pose, fret: 0.5 }, 0.965, -0.2);
            }
        }
        const devil = (g2, x, y, sc) => {
            I.devilGuitar(g2, x, y, sc, pose);
            if (!peg && !tongue) return;
            const R = { lean: (pose.lean ?? 0) + 0.1 * (pose.solo ?? 0), squash: pose.squash, headDy: pose.headDy, headTilt: (pose.headTilt ?? 0) + 0.06 * (pose.solo ?? 0) };
            P.frame(g2, x, y, sc, R, (L) => {
                if (tongue) P.head(g2, R, () => P.tongue(g2, L, -1));
                if (peg) P.arm(g2, L, P.SH.R, P.toLocal(0, 0, 1, R, [peg[0] + 0.05, peg[1] + 0.07]));
            });
            if (peg) {
                const tw = dr(t, TUNE) % 4 < 2 ? 1 : -1;
                P.twist(g2, x + (peg[0] - 0.02) * sc, y + (peg[1] - 0.14) * sc, 0.17 * sc, tw);
            }
        };
        const duck = on(t, SWAP) && !onDeck ? Math.sin(E.seg(t, SWAP, DECK) * PI) : 0;
        band(g, t, car, {
            bounce: bn, pose: bandPoses(t), ...tomPlace(t),
            cactus: { ...(on(t, LOOKS.cactus) && !on(t, SWAP) ? { shades: 1 - 0.5 * E.out(seg2(t, LOOKS.cactus, LOOKS.cactus + 2 / 12)), lean: 0.06, wave: 0.4 } : {}), ...(duck > 0.01 ? { squash: 0.3 * duck, mouth: 'oh' } : {}), ...(w > 0.01 ? { lean: -0.12 * w, mouth: 'oh', shades: 1 - 0.3 * w } : {}) },
            devil: onDeck ? (g2, sc) => devil(g2, 0, 0, sc) : null,
        });
        let at = null;
        if (!onDeck) {
            // on the bonnet, then over the windscreen and the cactus into Tom's place
            const from = carPt(car, bonnet(pose.x ?? HOOD2), bn), to = carPt(car, DEVIL_AT);
            at = !on(t, SWAP - 3 * FR) ? from : arc(carPt(car, bonnet(HOOD2)), to, E.seg(t, SWAP - 3 * FR, DECK), 1.62 * s);
            devil(g, at[0], at[1], s);
        } else at = carPt(car, DEVIL_AT, bn);
        if (onDeck && dr(t, DECK) < 3) P.ticks(g, at[0], at[1] + 6, 0.5 * s, 0.72 * s, 5, PI * 1.08, PI * 1.92, K.white, 2.6);
        // the sour note out of the guitar; everybody's wince shakes the picture's lines
        if (on(t, SOUR) && !on(t, SOUR + 0.75)) {
            const G = I.guitarPoints(pose), a = sourAt(t, [at[0] + G.strings[0] * s, at[1] + G.strings[1] * s]);
            P.sourNote(g, a.x, a.y, 44 * a.k, a.ang, d);
        }
        const hype = 1 - 0.9 * Math.min(1, w * 1.4), lit = lerp(1, 0.3, E.seg(t, n(27.5), n(29)));
        I.crowd(g, t, { ...o, density: 1, hype, lighters: lit * (1 - 0.6 * w) });
        scraps(g, t, St);
    }
    // A point of his guitar for a pose, in his units from his ground point: u along the neck, v across it
    // (Inferno.guitarPoints gives three of them: the strings at u = -0.06, the fork's tip at 1.134, the upper horn at (0.6, -0.27)).
    function axePoint(pose, u, v) {
        const G = I.guitarPoints(pose), eu = [(G.headstock[0] - G.strings[0]) / 1.194, (G.headstock[1] - G.strings[1]) / 1.194];
        const ev = [(G.strings[0] + 0.66 * eu[0] - G.horn[0]) / 0.27, (G.strings[1] + 0.66 * eu[1] - G.horn[1]) / 0.27];
        return [G.strings[0] + (u + 0.06) * eu[0] + v * ev[0], G.strings[1] + (u + 0.06) * eu[1] + v * ev[1]];
    }

    // =========================================================================================
    // Shot 5 · «Face to face», bars 127–128: the stage view. The good note, the two square up, the count
    // =========================================================================================
    const GOOD = T4, FWD = n(33), FACE = n(34), NECKS = n(35), COUNT = n(36);
    const pan5 = (t) => lerp(46, 0, E.inOut(E.seg(t, n(32.5), n(35.5))));
    // the last picture: everything the solo starts from
    const FINAL = { view: 'stage', pan: 0, solo: 0.5, mikeAt: MIKE_FWD, devilAt: DEVIL_AT, tomAt: RISER, hype: 1, lighters: 0.3, heat: 1 };
    function faceShot(g, t) {
        const pan = pan5(t), o = venueO('stage', pan, t), St = I.stage('stage', pan), car = St.car, s = car.s, Pu = S.pulseAt(t), d = C.drawing(t);
        I.venue(g, t, o);
        const fwd = on(t, FWD) ? E.seg(t, FWD, FWD + 6 * FR) : 0, face = on(t, FACE) ? E.out(seg2(t, FACE, FACE + 2 / 12)) : 0, solo = FINAL.solo * (on(t, NECKS) ? E.back(seg2(t, NECKS, NECKS + 3 / 12)) : 0);
        const cnt = on(t, COUNT), ck = cnt ? Math.floor((t - COUNT) / S.BEAT + 0.04) : -1, click = cnt ? 1 - E.seg(twos(t, n(36 + ck)), n(36 + ck) + 1.5 / 12, n(36 + ck) + 3.5 / 12) : 0;
        const held = cnt ? { squash: 0.035 * Pu.pulse, headDy: 0.02 * Pu.pulse, sway: 0 } : {};
        const mikeAt = fwd >= 1 ? MIKE_FWD : fwd > 0 ? arc(SEATS.deck[1], MIKE_FWD, fwd, 0.16) : SEATS.deck[1];
        const mikeDev = on(t, FWD) ? { ...held, squash: (held.squash ?? 0.045 * Pu.pulse) + Math.max(0, thud(t, FWD + 6 * FR, 0.14)), mouth: 'grin', headTilt: 0.07 * face, ...(on(t, NECKS) ? { strum: -1, fret: 0.5 } : {}) } : turned(t, GOOD);
        const pose = axePose(t, {
            look: -1, solo, flames: 0.8 + 0.2 * bump(t, GOOD, 0.4), fret: 0.5, mood: !on(t, FWD) ? 'laugh' : 'grin', headTilt: -0.05 * face,
            strum: !on(t, GOOD + 3 / 12) ? lerp(-1, 1, E.out(seg2(t, GOOD, GOOD + 2 / 12))) : on(t, NECKS) ? -1 : Math.cos((Pu.k + Pu.since) * TAU),
            ...(cnt ? { squash: 0.035 * Pu.pulse, headDy: 0.02 * Pu.pulse } : {}), squash: (cnt ? 0.035 : 0.04) * Pu.pulse + 0.06 * bump(t, GOOD, 0.25),
        });
        // a spot on each, from the rig's two middle lamps: on with the good note
        const mk = carPt(car, mikeAt), dv = carPt(car, DEVIL_AT), sp = pop(t, GOOD, 0.25);
        const spots = (a, pool) => {
            P.spot(g, St.lamps[2][0], St.lamps[2][1], mk[0], mk[1] + 4, 0.62 * s * sp, K.white, a, pool);
            P.spot(g, St.lamps[3][0], St.lamps[3][1], dv[0], dv[1] + 4, 0.66 * s * sp, K.white, a, pool);
        };
        // behind him, the good note's burst
        const gb = bump(t, GOOD, 0.5);
        if (gb > 0.01) C.burst(g, dv[0] - 0.1 * s, dv[1] - 1.0 * s, { r0: 0.9 * s * (0.7 + 0.3 * gb), r1: 1.4 * s * (0.7 + 0.3 * gb), n: 13, seed: 'bridge-good', fill: K.yellow, ink: K.ink, lw: 3.2, rot: d % 2 ? 0.05 : 0 });
        spots(0.16, true);
        const tips = band(g, t, car, {
            solo, tomAt: RISER, tomUp: true, mikeAt, mikeNear: fwd > 0.5,
            pose: { mike: mikeDev, tom: cnt ? held : {}, ben: on(t, FACE) ? { headTilt: 0.08 } : {}, howie: on(t, FACE) ? { headTilt: 0.08 } : {}, stan: cnt ? { kick: 0, headDy: 0.03 * Pu.pulse, eyes: 'wide' } : {} },
            cactus: on(t, FACE) ? { lean: -0.05 } : {},
            devil: (g2, sc) => I.devilGuitar(g2, 0, 0, sc, pose),
            count: on(t, COUNT - 4 / 12) ? { up: E.out(seg2(t, COUNT - 4 / 12, COUNT - 1 / 12)), click } : null,
        });
        spots(0.07, false);
        // the click's mark over Stan's head
        if (cnt && tips && dr(t, n(36 + ck)) < 2) P.ticks(g, tips[0], tips[1] - 6, 0.16 * s, 0.34 * s, 5, PI * 1.1, PI * 1.9, K.white, 2.6);
        // the clean note out of his guitar, with its twinkles
        if (on(t, GOOD) && !on(t, GOOD + 1.0)) {
            const G = I.guitarPoints(pose), u = E.seg(twos(t, GOOD), GOOD, GOOD + 1.0), from = [dv[0] + G.strings[0] * s, dv[1] + G.strings[1] * s];
            const x = from[0] - 60 - 250 * E.out(u), y = from[1] - 150 - 300 * u - 30 * Math.sin(u * PI * 2);
            P.cleanNote(g, x, y, 36 * pop(t, GOOD, 0.2), -0.12 + 0.2 * Math.sin(u * PI * 2));
            for (const [dx, dy, i] of [[-70, -40, 0], [90, -110, 1], [40, 60, 2]]) {
                const v = bump(t, GOOD + (i * 2) / 12, 0.36);
                if (v > 0.01) C.sparkle(g, x + dx, y + dy, 8 + 22 * v, { color: K.white, ink: K.ink, lw: 2.4, rot: i * 0.5 });
            }
        }
        I.crowd(g, t, { ...o, density: 1, hype: FINAL.hype, lighters: FINAL.lighters, wave: on(t, FWD + 0.3) ? null : lerp(0.2, 0.86, E.seg(t, GOOD, FWD + 0.3)) });
        scraps(g, t, St);
    }

    Seg.bridge = {
        shots: [[T0, T1, 'The contract'], [T1, T2, 'The fire'], [T2, T3, 'The house'], [T3, T4, 'The nod'], [T4, T5, 'Face to face']],
        FINAL, band, axePose,
        draw(g, t, env) {
            g.save();
            g.lineJoin = 'round';
            if (t < T1 - 1e-6) contractShot(g, t);
            else if (t < T2 - 1e-6) fireShot(g, t);
            else if (t < T3 - 1e-6) houseShot(g, t);
            else if (t < T4 - 1e-6) nodShot(g, t);
            else faceShot(g, t);
            g.restore();
        },
        post() {
            return {};
        },
    };
})();
