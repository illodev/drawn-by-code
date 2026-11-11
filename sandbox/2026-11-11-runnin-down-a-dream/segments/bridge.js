// The bridge, bars 119–128 (168.375–182.5 s): the film's turn. The Devil swaps the contract for
// a guitar. No lead vocal; the backing voices' «ooh»s run to 178.2 (the rig sings them).
//   bars 119–120  The contract   the close shot «Hellhoof» ends on (Seg.hellhoof.hold): he holds the
//                                contract out over the rail, looks from it to the band and back, tears
//                                it down the middle (bar 120's first beat), across (the next), and
//                                throws the four pieces over his shoulder
//   bars 121–123  The fire       he vaults the rail, slides down the box's corbel onto the rock stack
//                                under it, rolls a sleeve up and puts his arm in the brazier, tongue
//                                out; the fire turns green, blue, purple, pink, a beat each (his cold
//                                leaves him in a puff of steam); on bar 123 he pulls: his trident's
//                                fork (a beat of doubt), then the rest: a guitar, on a starburst
//   bar 124       The house      wider: he has it on; the lighters sway, a wave runs through the pit,
//                                the contract's pieces come down on the crowd, which bats them about
//                                (they end on the lighters); he hops down onto the car's bonnet
//   bars 125–126  The nod        the car's front half, closer: the cactus, Mike and Benmont look
//                                round, a head every half beat; Tom lifts his shades for a beat (the
//                                only time he notices him), nods them back on and jumps to the bonnet;
//                                the bonnet flings the Devil over the windscreen into Tom's place; he
//                                hits a sour note (everybody winces)
//   (bar 126's last beat)  The peg   the insert: his mitt turns one key of the headstock
//   bars 127–128  Face to face   the stage view: the good note (the crowd roars, a spot on each);
//                                Mike steps forward, they square up, necks up; Stan counts four on
//                                his sticks. The last frame is the solo's first picture (FINAL).
// The cactus in shades sits at the wheel (Chorus1Props). What the car threw off in chorus 3 and his
// sore nose are Chorus3Props's (the close shot's nose is hellhoof's own). Props: segments/bridge-props.js (BridgeProps).
(() => {
    const Seg = (window.Seg = window.Seg || {});
    const C = Cereal, K = C.COL, E = Ease, S = Song, I = Inferno, P = BridgeProps, C3 = Chorus3Props, twos = S.twos, pop = S.pop;
    const PI = Math.PI, TAU = PI * 2, FR = 1 / 24, lerp = E.lerp;
    const n = (k) => S.snap(S.OFFSET + (476 + k) * S.BEAT); // beat k of the block (halves too), on its frame
    const T0 = n(0), T1 = n(8), T2 = n(20), T3 = n(24), T4 = n(32), T5 = n(40);
    const on = (t, a) => t >= a - 1e-6;
    const seg2 = (t, a, c) => E.seg(twos(t, a), a, c); // 0..1 on twos, counted from a
    const bump = (t, a, dur = 0.3) => E.bump(twos(t, a), a, dur);
    const smooth = (u) => u * u * (3 - 2 * u);
    const dr = (t, a) => Math.floor((t - a) * 12 + 1e-6); // drawings since a
    const rot = ([x, y], a) => [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)];
    const lerpPt = (p, q, u) => [lerp(p[0], q[0], u), lerp(p[1], q[1], u)];
    // a hop from p to q: u 0..1, h its height
    const arc = (p, q, u, h) => [lerp(p[0], q[0], u), lerp(p[1], q[1], u) - h * 4 * u * (1 - u)];
    // a landing at `a`: amp on its own frame, then it rings out (it goes negative on the rebound)
    const thud = (t, a, amp = 0.16, dur = 0.3) => (on(t, a) ? amp * Math.max(0, 1 - (twos(t, a) - a) / dur) * Math.cos(((twos(t, a) - a) / dur) * PI * 1.5) : 0);

    const SCARF_AT = 142.7083; // when his scarf came down on the imp's mallet (chorus 3)
    const venueO = (view, pan, t) => ({ view, pan, heat: 1, beatK: S.pulseAt(t).pulse });
    const dress = (g, t, view, pan, crowd, part) => C3.dressing(g, t, { view, pan, hype: 1, lighters: 0.35, wave: null, ...crowd, part, scarf: t - SCARF_AT });
    const BOX = [884, 440]; // the box's floor under him (set coordinates)
    const BRZ = I.STAGE.wide.braziers[1]; // the right stack's brazier: the bowl's rim (set coordinates)
    const STACK = [872, 579]; // where he stands on the right stack, in front of the bowl's left end
    // his box as he left it: empty, the two ushers still dancing at the rail
    const emptyBox = (g, t, St) => {
        const b = St.box;
        I.box(g, b.x, b.y, b.s, { part: 'back', t });
        Seg.hellhoof.dev.ushers(g, t, b.x, b.y, b.s);
        I.box(g, b.x, b.y, b.s, { part: 'front', t });
    };

    // --- the band on its car (Rig.band's own order and poses), with the places this block needs ---
    const SEATS = Rides.bandCarSeats();
    const WHEEL = [SEATS.wheel[0] - SEATS.driver[0] - 0.07, SEATS.wheel[1] - SEATS.driver[1] + 0.02];
    const HOOD = [3.98, -1.2]; // Finale.HOOD: the place on the bonnet (the Devil's from the solo on; Tom's for this block's last bars)
    const MIKE_FWD = [0.3, -0.77], DEVIL_AT = [1.28, -0.77]; // the deck's near row: Mike in front of his own place, the Devil in Tom's
    // a place along the bonnet, as far in from its near edge as HOOD is
    const bonnet = (x) => [x, lerp(-1.12, -1.0, E.clamp((x - 3.375) / 1.15)) - 0.15];
    /**
     * The band on its car as Rig.band draws it (Tom up front, the cactus at the wheel), with:
     *   o: { bounce (added to the beat's own), solo, pose: { tom, mike, … } overrides, cactus: a pose,
     *        tomAt: [x, y] car units (default his place up front),
     *        mikeAt: [x, y] (default his place), mikeNear: true once he is in the near row,
     *        devil: (g2, sc) => … draws the Devil at (0, 0), devilAt: [x, y] (default DEVIL_AT),
     *        count: { up, click } Stan's arms up for the count }
     * Returns where Stan's sticks meet (screen), when he counts.
     */
    function band(g, t, car, o = {}) {
        const pz = Rig.playing(t, { sing: true, solo: o.solo ?? 0 }), ov = o.pose ?? {}, Pu = S.pulseAt(t);
        const pose = (who) => ({ ...pz[who], ...(ov[who] ?? {}) });
        let tips = null;
        Rides.bandCar(g, car.x, car.y, car.s, { spin: 0, bounce: 0.2 * Pu.pulse + (o.bounce ?? 0), lean: 0, exhaust: 0, t }, (g2, seats, sc0) => {
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
            put(o.tomAt ?? seats.deck[0], (sc) => Cast.tom(g2, 0, 0, sc, pose('tom')));
            // the Devil first when Mike has stepped forward beside him: their necks point at each other, and Mike's
            // guitar with both his mitts on it stays whole in front of the fork
            if (o.devil && o.mikeNear) put(o.devilAt ?? DEVIL_AT, (sc) => o.devil(g2, sc));
            if (o.mikeNear) put(o.mikeAt ?? MIKE_FWD, mike);
            if (o.devil && !o.mikeNear) put(o.devilAt ?? DEVIL_AT, (sc) => o.devil(g2, sc));
            put(seats.driver, (sc) => Chorus1Props.cactus(g2, 0, 0, sc, { wheel: WHEEL, shades: 1, squash: 0.05 * Pu.pulse, wave: Pu.k % 2 ? Pu.pulse : -Pu.pulse * 0.6, ...(o.cactus ?? {}) }));
        });
        return tips ? [car.x + (SEATS.kit[0] + tips[0]) * car.s, car.y + (SEATS.kit[1] + tips[1]) * car.s] : null;
    }
    // a point of the car's body on screen (it sinks a tenth of a unit per unit of bounce)
    const carPt = (car, p, t, extra = 0) => [car.x + p[0] * car.s, car.y + (p[1] + 0.1 * (0.2 * S.pulseAt(t).pulse + extra)) * car.s];

    // --- the contract's pieces, from the throw to the crowd (set coordinates, so every shot sees the same ones) ---
    const CC = [0, -0.55]; // the contract's middle in his units (Seg.hellhoof.LAST.contract)
    const T_THROW = n(6), T_APEX = T_THROW + 10 * FR, BAT_Y = 800;
    const SCRAPS = [
        { apex: [938, 236], sway: 20, ph: 0.4, bats: [[n(21.5), 768], [n(23.5), 728], [n(25.5), 688], [n(27.5), 650]] },
        { apex: [968, 262], sway: 16, ph: 2.1, bats: [[n(21), 792], [n(23), 838]] },
        { apex: [902, 250], sway: 24, ph: 3.6, bats: [[n(22.5), 704], [n(24.5), 652], [n(26.5), 606]] },
        { apex: [996, 300], sway: 14, ph: 5.0, bats: [[n(21), 744]] },
    ];
    const BURN = 0.42; // seconds a piece burns on a lighter
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
    // St: { k, at } of the shot (Inferno.stage's, or the close shot's own)
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
    // Shot 1 · «The contract», bars 119–120: the close shot «Hellhoof» ends on, carried on
    // =========================================================================================
    const RIP1 = n(4), RIP2 = n(5), CLIMB = n(7), VAULT = n(7.5);
    // the contract's k (Inferno.tornContract): whole, torn down the middle, torn across
    const tornK = (t) => (!on(t, RIP1) ? 0 : !on(t, RIP2) ? 0.05 + 0.17 * (0.6 + 0.4 * seg2(t, RIP1, RIP1 + 2 / 12)) : 0.27 + 0.15 * (0.6 + 0.4 * seg2(t, RIP2, RIP2 + 2 / 12)));
    function contractShot(g, t) {
        const H = Seg.hellhoof, F = H.dev.F, CL = H.LAST.close, Pu = S.pulseAt(t), k = tornK(t), thrown = on(t, T_THROW), climb = on(t, CLIMB);
        const rip = bump(t, RIP1, 0.25) + bump(t, RIP2, 0.25), fling = thrown ? E.out(seg2(t, T_THROW, T_THROW + 2 / 12)) : 0;
        const down = climb ? seg2(t, CLIMB, CLIMB + 2 / 12) : 0, crouch = on(t, VAULT) ? E.out(seg2(t, VAULT, VAULT + 2 / 12)) : 0;
        // what he looks at: the band, it, the band, it (he has made his mind up); the rips; the throw; the rail
        const reads = !on(t, RIP1) && ((on(t, n(1)) && !on(t, n(2))) || on(t, n(3)));
        const decided = H.dev.face({ h: 0.15, lx: 0, ly: 1, ph: 0.085, lid: 0.1 }, { tilt: 0.05, cock: 0.05 }, 'smile', { droop: -0.015 });
        const effort = H.dev.face({ shut: 'tight' }, { tilt: 0.0, raise: 0.02 }, 'joy', { droop: -0.02 });
        const face = climb ? F.stage : on(t, RIP1 + 3 / 12) ? F.joy : on(t, RIP1) ? effort : on(t, n(3)) ? decided : on(t, n(2)) ? F.real : on(t, n(1)) ? F.read2 : F.real;
        // his mitts: on the contract's edges, each going with its half; up and back over his shoulders; down on the rail
        let hR, hL;
        if (!thrown) {
            const q = I.tornPoints(k, 0), a = k < 0.05 ? 0 : (-0.14 - q.l[0]) / 0.15, eR = rot([-0.105, 0.05], -0.2 * a), eL = rot([0.095, 0.05], 0.2 * a);
            hR = [CC[0] + q.l[0] + eR[0], CC[1] + q.l[1] + eR[1]];
            hL = [CC[0] + q.r[0] + eL[0], CC[1] + q.r[1] + eL[1]];
        } else {
            const a = P.held(0).at, c = P.held(2).at;
            hR = lerpPt(lerpPt([CC[0] + a[0] - 0.06, CC[1] + 0.04], [-0.56, -1.5], fling), [-0.3, -0.6], down);
            hL = lerpPt(lerpPt([CC[0] + c[0] + 0.06, CC[1] + 0.04], [0.6, -1.58], fling), [0.3, -0.6], down);
        }
        const bob = on(t, n(1)) ? 1 : 0; // he keeps the beat from the second one on: the first frames are hellhoof's last pose, untouched
        const pose = {
            handR: hR, handL: hL, face, dy: -0.1 * crouch,
            squash: 0.03 * Pu.pulse * bob + 0.07 * rip + 0.1 * crouch - 0.05 * bump(t, T_THROW, 0.25),
            headDy: 0.015 * Pu.pulse * bob + (reads ? 0.03 : 0) + 0.03 * crouch, headTilt: reads || (on(t, RIP1) && !climb) ? (thrown ? -0.06 * fling : 0) : -0.035,
        };
        H.hold(g, t, { pose, contract: false, held: (g2, L) => {
            if (!thrown) {
                // Inferno.tornContract wants the frame's units: undo his scale round it
                g2.save();
                g2.scale(1 / CL.s, 1 / CL.s);
                I.tornContract(g2, CC[0] * CL.s, CC[1] * CL.s, CL.s, k, 0, { fall: 0 });
                g2.restore();
            }
        } });
        scraps(g, t, { k: CL.s / 84, at: (p) => [CL.x + ((p[0] - BOX[0]) / 84) * CL.s, CL.y + ((p[1] - BOX[1]) / 84) * CL.s] });
    }

    // =========================================================================================
    // Shot 2 · «The fire», bars 121–123: over the rail, down the rock, an arm in the brazier
    // =========================================================================================
    const V2 = { k: 2.05, cx: 880, cy: 474 };
    const SLIDE = T1 + 5 * FR, LAND = n(10), ROLL = n(11), DIP = n(12), STEAM = n(14), HEAVE = n(15.5), PULL = n(16), PULL2 = n(17.25), OUT = n(18.75), HANG = n(19.5);
    const FLANK0 = [808, 480], FLANK1 = [870, 524]; // the corbel's left flank, where his hooves slide (set coordinates)
    const COLS = ['green', 'blue', 'purple', 'pink'];
    // the guitar's k (Inferno.guitarFromFire): the fork, a beat of doubt, the rest, and it hangs
    const axeK = (t) => (!on(t, PULL) ? 0 : !on(t, PULL2) ? 0.06 + 0.1 * E.out(seg2(t, PULL, PULL + 2 / 12)) : !on(t, OUT) ? lerp(0.16, 0.85, seg2(t, PULL2, OUT)) : lerp(0.85, 1, smooth(seg2(t, OUT, HANG))));
    function fireShot(g, t) {
        const o = venueO(V2, 0, t), St = I.stage(V2, 0), Pu = S.pulseAt(t), s = 84 * St.k, d = C.drawing(t), sF = s * 0.86;
        I.venue(g, t, o);
        dress(g, t, V2, 0, {}, 'back');
        emptyBox(g, t, St);
        band(g, t, St.car);
        dress(g, t, V2, 0, {}, 'stage');
        const F = St.at([BRZ[0] + 9, BRZ[1] + 6]), k = axeK(t);
        // --- where he is -------------------------------------------------------------------------
        let at, pose = { shadow: false, handR: P.NO_HAND, handL: P.NO_HAND, tail: 0.04 * Math.sin((Pu.k + Pu.since) * PI) }, hR = [-0.5, -0.5], hL = [0.5, -0.5], roll = 0, tongue = false, chips = -1;
        if (!on(t, SLIDE)) {
            // over the rail (he is already in the air on the cut) and down onto the corbel's flank
            const u = E.seg(t, T1 - 3 * FR, SLIDE);
            at = arc([850, 448], FLANK0, u, 4);
            Object.assign(pose, { lean: lerp(-0.42, -0.2, u), mood: 'laugh', squash: -0.06 });
            hR = [-0.7, -1.3];
            hL = [0.72, -1.2];
        } else if (!on(t, LAND)) {
            // down the flank on his hooves, leaning back, and off its tip onto the stack
            const tip = LAND - 3 * FR, u = E.seg(t, SLIDE, tip);
            at = t < tip ? lerpPt(FLANK0, FLANK1, u) : arc(FLANK1, STACK, E.seg(t, tip, LAND), 6);
            Object.assign(pose, { lean: -0.26 + 0.05 * (dr(t, SLIDE) % 2), mood: 'laugh', squash: 0.06 * (1 - u) });
            chips = t < tip ? dr(t, SLIDE) : -1;
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
                const G = I.fromFirePoints(k), grip = lerpPt(G.body, G.neck, 1.22);
                hL = P.toLocal(...St.at(at), s, pose, [F[0] + grip[0] * sF, F[1] + grip[1] * sF]);
                hR = doubt ? [-0.3, -0.92] : lerpPt([-0.6, -0.6], [-0.66, -1.42], up); // a mitt to his chin, then a fist in the air
            }
        }
        // his cold: the sore nose until the fire steams it off him
        const nose = 1 - seg2(t, STEAM, STEAM + 4 / 12);
        // part 'armL': only the arm that goes into the fire; 'rest': everything but that arm (he stands in front of
        // the bowl's left end, the arm reaches back into it); default: all of him
        const p = St.at(at), body = (part = 'all') => {
            if (part !== 'armL') {
                if (nose > 0.02) C3.devil(g, p[0], p[1], s, pose, { scarf: false, nose });
                else Devil.draw(g, p[0], p[1], s, pose);
            }
            P.frame(g, p[0], p[1], s, pose, (L) => {
                if (part !== 'armL') {
                    if (tongue) P.head(g, pose, () => P.tongue(g, L, 1));
                    P.arm(g, L, P.SH.R, hR);
                }
                if (part !== 'rest') P.arm(g, L, P.SH.L, hL, roll);
            });
            if (part === 'armL') return;
            if (on(t, STEAM)) {
                const np = P.toFrame(p[0], p[1], s, pose, rot([0.045, -1.225 + (pose.headDy ?? 0)], pose.headTilt ?? 0));
                P.steam(g, np[0], np[1] - 0.05 * s, 0.085 * s, E.seg(twos(t, STEAM), STEAM, STEAM + 0.5), 1.1 * s);
            }
            if (chips >= 0) {
                // chips of rock off the flank behind his hooves
                for (let i = 0; i < 3; i++) {
                    const cx = p[0] - (0.34 + 0.16 * i + 0.1 * (chips % 2)) * s, cy = p[1] - (0.1 + 0.13 * ((i + chips) % 3)) * s, r = (0.035 + 0.012 * i) * s;
                    C.poly(g, [[cx - r, cy], [cx, cy - r], [cx + r, cy + r * 0.4], [cx - r * 0.2, cy + r]], { fill: I.R.wallL, ink: K.ink, lw: 2.4 });
                }
            }
        };
        // --- the fire and him, in order ----------------------------------------------------------
        const rim = () => {
            // the bowl's near wall, whole, over the fire's foot (the venue's own drawing of it): he goes on top of its left end
            C.poly(g, [[-46, 0], [38, 0], [33, 20], [-40, 20]].map(([x, y]) => St.at([BRZ[0] + x, BRZ[1] + y])), { fill: I.R.wall, ink: K.ink, lw: 3.2 });
            C.poly(g, [St.at([BRZ[0] - 38, BRZ[1] + 8]), St.at([BRZ[0] + 30, BRZ[1] + 8])], { ink: I.R.wallL, lw: 2.2, close: false });
        };
        const mainMin = (44 + 50) * (1 + 0.14 * o.beatK) * St.k * 1.05; // over the venue's own flame
        if (!on(t, DIP)) body();
        else if (!on(t, PULL)) {
            const beat = Math.min(3, Math.floor((twos(t, DIP) - DIP) / S.BEAT + 0.04)), cols = P.FIRE[COLS[beat]], big = 0.6 + 0.3 * pop(t, n(12 + beat), 0.2) + 0.1 * (on(t, HEAVE) ? 1 : 0);
            P.fire(g, F[0], F[1], sF, d, cols, big, 'back', mainMin);
            body('armL');
            P.fire(g, F[0], F[1], sF, d, cols, big, 'front');
            // sparks of its colour jump out on each change
            const r = Motion.rng('bridge-sparks' + beat), since = twos(t, n(12 + beat)) - n(12 + beat);
            for (let i = 0; i < 6; i++) {
                const a = -PI / 2 + (r() - 0.5) * 2.2, sp = 150 + r() * 190, u = since / 0.3;
                if (u >= 1) continue;
                C.sparkle(g, F[0] + Math.cos(a) * sp * u, F[1] - 60 + Math.sin(a) * sp * u + 120 * u * u, (16 + r() * 12) * (1 - u * 0.5), { color: i % 2 ? cols[2] : cols[1], ink: K.ink, lw: 2.4, rot: i });
            }
            rim();
            body('rest');
        } else {
            I.guitarFromFire(g, F[0], F[1], sF, k, t);
            body('armL');
            // while it is still low the mitt is in the flames
            if (k < 0.3) P.flame(g, F[0] - 0.12 * sF, F[1], 0.62 * sF, d + 1, 1);
            rim();
            body('rest');
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
    const HOP = n(22), STEP1 = n(23), HOODX1 = 3.62, HOODX2 = 3.42;
    // the Devil with his guitar, keeping the beat
    const axePose = (t, o = {}) => {
        const Pu = S.pulseAt(t), ph = Pu.k + Pu.since;
        return { mood: 'grin', strum: Math.cos(ph * TAU), fret: 0.25 + 0.3 * (Math.floor(ph / 2) % 2), flames: 0.8, t, tail: 0.04 * Math.sin(ph * PI), squash: 0.04 * Pu.pulse, headDy: 0.02 * Pu.pulse, ...o };
    };
    function houseShot(g, t) {
        const o = venueO(V3, 0, t), St = I.stage(V3, 0), car = St.car, s = car.s, bn = 0.9 * Math.max(0, thud(t, HOP, 1, 0.4));
        const crowd = { hype: 1, lighters: 1, wave: lerp(0.42, 0.98, E.seg(t, T2, n(22.5))) };
        I.venue(g, t, o);
        dress(g, t, V3, 0, crowd, 'back');
        emptyBox(g, t, St);
        band(g, t, car, { bounce: bn });
        dress(g, t, V3, 0, crowd, 'stage');
        // he slings it on (the cut is on the move), stands a beat in its light, hops down onto the bonnet and takes a step
        let p, pose;
        const off = HOP - 7 * FR;
        if (t < off) {
            p = St.at(STACK);
            const sl = E.out(seg2(t, T2, T2 + 3 / 12));
            pose = axePose(t, { shadow: false, strum: lerp(-1, 1, sl), flames: 1, squash: 0.12 * (1 - sl) + 0.03 * S.pulseAt(t).pulse + 0.1 * seg2(t, off - 3 / 12, off), mood: t < n(21) ? 'laugh' : 'grin', look: -1 });
        } else if (!on(t, HOP)) {
            p = arc(St.at(STACK), carPt(car, HOOD, t), E.seg(t, off, HOP), 46);
            pose = axePose(t, { shadow: false, squash: -0.08, lean: -0.1, mood: 'laugh', flames: 1 });
        } else {
            const st = on(t, STEP1) ? E.out(seg2(t, STEP1, STEP1 + 2 / 12)) : 0;
            p = carPt(car, bonnet(lerp(HOOD[0], HOODX1, st)), t, bn);
            p[1] -= on(t, STEP1) ? 10 * bump(t, STEP1, 0.17) : 0;
            pose = axePose(t, { shadow: false, squash: 0.04 * S.pulseAt(t).pulse + Math.max(0, thud(t, HOP, 0.2)), step: on(t, STEP1) && st < 1 ? -1 : 0, look: -1 });
        }
        I.devilGuitar(g, p[0], p[1], s, pose);
        if (on(t, HOP) && dr(t, HOP) < 3) {
            const h = carPt(car, HOOD, t, bn);
            P.ticks(g, h[0], h[1], 0.5 * s, (0.62 + 0.2 * bump(t, HOP, 0.2)) * s, 5, PI * 1.08, PI * 1.92, K.white, 2.6);
        }
        // twinkles round the guitar when it is first on
        const G = I.guitarPoints(pose);
        [[-0.75, -0.25, 0], [0.5, -0.45, 1], [-0.1, 0.55, 2]].forEach(([dx, dy, i]) => {
            const u = bump(t, T2 + i / 12, 0.4);
            if (u > 0.01 && t < off) C.sparkle(g, p[0] + (G.strings[0] + dx) * s, p[1] + (G.strings[1] + dy) * s, 8 + 22 * u, { color: K.white, ink: K.ink, lw: 2.4, rot: i * 0.5 });
        });
        I.crowd(g, t, { ...o, density: 1, ...crowd });
        dress(g, t, V3, 0, crowd, 'front');
        scraps(g, t, St);
    }

    // =========================================================================================
    // Shot 4 · «The nod», bars 125–126: the car's front half
    // =========================================================================================
    const V4 = { k: 1.9, cx: 665, cy: 648 };
    const LOOKS = { cactus: n(24), mike: n(24.5), ben: n(25) };
    const SHADES = n(26), NOD = n(27), SWAP = n(28), DECK = n(29), SOUR = n(30), TUNE = n(31);
    const TOM_OFF = SWAP - 8 * FR, FLUNG = SWAP + 2 * FR; // Tom leaves the deck; the bonnet throws the Devil
    // a head that looks round at the bonnet: a start, then it stays turned
    const turned = (t, a) => (on(t, a) ? { headTilt: 0.1 + 0.07 * bump(t, a, 0.25), headDy: -0.035 * bump(t, a, 0.25), eyes: 'wide' } : {});
    // everybody at the sour note
    const wince = (t) => bump(t, SOUR, 0.5);
    function bandPoses(t) {
        const w = wince(t), sour = w > 0.01, pz = {};
        for (const who of ['mike', 'ben']) {
            pz[who] = on(t, DECK) ? {} : turned(t, LOOKS[who]);
            if (sour) pz[who] = { eyes: 'shut', mouth: 'o', headTilt: -0.1 * w, lean: -0.05 * w, headDy: 0.03 * w };
        }
        if (sour) pz.howie = { eyes: 'shut', headTilt: -0.1 * w, headDy: 0.03 * w };
        // Tom: the shades up off his nose for a beat, a nod that drops them back, then over the cactus onto the bonnet
        const lift = on(t, SHADES) && !on(t, NOD) ? E.out(seg2(t, SHADES, SHADES + 2 / 12)) : 0, nod = bump(t, NOD, 0.25) + 0.6 * bump(t, NOD + 4 / 12, 0.2);
        pz.tom = { shades: 1 - 0.36 * lift, headTilt: on(t, SHADES) && t < TOM_OFF ? 0.09 : sour ? -0.06 * w : 0, headDy: 0.07 * nod + (sour ? -0.03 * w : 0) };
        if (on(t, SHADES) && !on(t, NOD + 4 / 12)) pz.tom.mouth = 'smirk';
        if (on(t, TOM_OFF) && !on(t, SWAP)) pz.tom.squash = -0.07;
        if (on(t, SWAP)) pz.tom.squash = 0.045 * S.pulseAt(t).pulse + Math.max(0, thud(t, SWAP, 0.2));
        return pz;
    }
    // Tom's place: up front; over the cactus; on the bonnet
    const tomAt = (t) => (t < TOM_OFF ? SEATS.deck[0] : !on(t, SWAP) ? arc(SEATS.deck[0], HOOD, E.seg(t, TOM_OFF, SWAP), 1.9) : HOOD);
    function nodShot(g, t) {
        const o = venueO(V4, 0, t), St = I.stage(V4, 0), car = St.car, s = car.s, Pu = S.pulseAt(t), d = C.drawing(t);
        const onDeck = on(t, DECK), w = wince(t), bn = Math.max(0, thud(t, SWAP, 1, 0.35)) + (onDeck ? 0.7 * Math.max(0, thud(t, DECK, 1, 0.35)) : 0);
        const crowd = { hype: 1 - 0.9 * Math.min(1, w * 1.4), lighters: lerp(1, 0.35, E.seg(t, n(27.5), n(29))) * (1 - 0.6 * w) };
        I.venue(g, t, o);
        dress(g, t, V4, 0, crowd, 'back');
        emptyBox(g, t, St);
        // the Devil's pose: on the bonnet behind the windscreen, flung over it, on the deck
        let pose;
        if (!on(t, FLUNG)) {
            const st = E.out(seg2(t, T3, T3 + 2 / 12));
            pose = axePose(t, { shadow: false, look: -1, step: st < 1 ? 1 : 0, mood: on(t, SWAP) ? 'shock' : on(t, SHADES) ? 'sly' : 'grin', squash: 0.04 * Pu.pulse + (on(t, SWAP) ? 0.16 : 0), x: lerp(HOODX1, HOODX2, st) });
        } else if (!onDeck) pose = axePose(t, { shadow: false, mood: 'shock', squash: -0.08, lean: 0.14, flames: 1, strum: -1 });
        else {
            const hit = on(t, SOUR);
            pose = axePose(t, {
                look: -1, squash: 0.04 * Pu.pulse + Math.max(0, thud(t, DECK, 0.2)) + 0.07 * bump(t, SOUR, 0.2), fret: 0.5,
                strum: hit ? lerp(-1, 1, E.out(seg2(t, SOUR, SOUR + 2 / 12))) : -1,
                mood: hit && on(t, SOUR + 2 / 12) ? 'shock' : 'grin', flames: hit ? 0.35 : 0.8,
            });
        }
        const devil = (g2, x, y, sc) => I.devilGuitar(g2, x, y, sc, pose);
        const duck = on(t, TOM_OFF) && !onDeck ? Math.sin(E.seg(t, TOM_OFF, DECK) * PI) : 0;
        band(g, t, car, {
            bounce: bn, pose: bandPoses(t), tomAt: tomAt(t),
            cactus: { ...(on(t, LOOKS.cactus) && t < TOM_OFF ? { shades: 1 - 0.5 * E.out(seg2(t, LOOKS.cactus, LOOKS.cactus + 2 / 12)), lean: 0.06, wave: 0.4 } : {}), ...(duck > 0.01 ? { squash: 0.26 * duck, mouth: 'oh' } : {}), ...(w > 0.01 ? { lean: -0.12 * w, mouth: 'oh', shades: 1 - 0.3 * w } : {}) },
            devil: onDeck ? (g2, sc) => devil(g2, 0, 0, sc) : null,
        });
        let at;
        if (!onDeck) {
            // on the bonnet; Tom comes down on its nose and it throws him over the windscreen and the cactus into Tom's place
            const from = carPt(car, bonnet(pose.x ?? HOODX2), t, bn);
            at = !on(t, FLUNG) ? from : arc(carPt(car, bonnet(HOODX2), t), carPt(car, DEVIL_AT, t), E.seg(t, FLUNG, DECK), 1.7 * s);
            devil(g, at[0], at[1], s);
        } else at = carPt(car, DEVIL_AT, t, bn);
        if (on(t, SWAP) && dr(t, SWAP) < 3) {
            const h = carPt(car, HOOD, t, bn);
            P.ticks(g, h[0], h[1], 0.5 * s, 0.74 * s, 5, PI * 1.08, PI * 1.92, K.white, 2.6);
        }
        if (onDeck && dr(t, DECK) < 3) P.ticks(g, at[0], at[1] + 6, 0.5 * s, 0.72 * s, 5, PI * 1.08, PI * 1.92, K.white, 2.6);
        dress(g, t, V4, 0, crowd, 'stage');
        // the sour note out of the guitar
        if (on(t, SOUR)) {
            const G = I.guitarPoints(pose), u = E.seg(twos(t, SOUR), SOUR, SOUR + 0.5), from = [at[0] + G.strings[0] * s, at[1] + G.strings[1] * s];
            P.sourNote(g, from[0] - 40 - 150 * E.out(u) + 12 * Math.sin(u * 14), from[1] - 190 - 240 * E.out(u), 54 * pop(t, SOUR, 0.2), -0.3 + 0.5 * u, d);
        }
        I.crowd(g, t, { ...o, density: 1, ...crowd });
        dress(g, t, V4, 0, crowd, 'front');
        scraps(g, t, St);
    }
    // =========================================================================================
    // Shot 5 · «The peg», bar 126's last beat: the insert. The fork of the headstock, a mitt on one key
    // =========================================================================================
    const PEG = { sc: 1050, ang: -0.42, at: [-1340, 975] }; // Inferno.guitar's frame for the insert (mirrored: the neck comes in from the right)
    // a point of the guitar on screen: u along the neck, v across it
    const pegPt = (u, v) => {
        const q = rot([u, v], PEG.ang);
        return [-(q[0] * PEG.sc + PEG.at[0]), q[1] * PEG.sc + PEG.at[1]];
    };
    function pegShot(g, t) {
        const d = C.drawing(t), f = dr(t, TUNE), R = I.R;
        C.sunburst(g, 490, 540, { n: 12, rot: 0.3 + 0.4 * (t - TUNE), a: R.wallL, b: R.wall });
        C.burst(g, 470, 540, { r0: 330, r1: 450, n: 13, seed: 'bridge-peg', fill: R.floor, ink: K.ink, lw: 3.2, rot: f % 2 ? 0.04 : 0 });
        // the guitar's own fire, low after the sour note, behind the fork
        const tip = pegPt(1.07, 0), low = pegPt(0.86, 0.2);
        Fx.flame(g, tip[0] + 10, tip[1] + 40, 170, d, 1);
        Fx.flame(g, low[0], low[1] + 30, 120, d, 2);
        I.guitar(g, 3.2, PEG.at, PEG.ang, PEG.sc, -1);
        // the key he turns: a gold paddle on a post out of the fork's upper edge, seen flat, then edge on
        const p = pegPt(0.965, -0.2), nrm = [0.408, -0.913], wide = f % 2 === 0, c = [p[0] + nrm[0] * 104, p[1] + nrm[1] * 104], a = Math.atan2(nrm[1], nrm[0]);
        C.poly(g, [p, [p[0] + nrm[0] * 70, p[1] + nrm[1] * 70]], { ink: K.ink, lw: 20, close: false });
        C.poly(g, [p, [p[0] + nrm[0] * 70, p[1] + nrm[1] * 70]], { ink: Devil.P.tieDark, lw: 13.6, close: false });
        C.poly(g, C.ellipsePts(c[0], c[1], 46, wide ? 58 : 17, 22, a), { fill: Devil.P.gold, ink: K.ink, lw: 3.2 });
        if (wide) C.poly(g, C.ellipsePts(c[0] + 5, c[1] - 6, 22, 34, 16, a), { ink: '#fff59a', lw: 3, fill: null });
        else C.poly(g, [[c[0] - nrm[0] * 30, c[1] - nrm[1] * 30], [c[0] + nrm[0] * 30, c[1] + nrm[1] * 30]], { ink: Devil.P.tieDark, lw: 3, close: false });
        // his mitt on it, from the right; it rocks with the turn
        const S1 = 760, rock = wide ? 0 : 0.03;
        g.save();
        g.scale(S1, S1);
        g.lineJoin = 'round';
        P.arm(g, 3.2 / S1, [1.46, 0.1 + rock], [(c[0] + 112) / S1, (c[1] - 44) / S1 + rock]);
        g.restore();
        P.twist(g, c[0] - 8, c[1], 96, f % 4 < 2 ? 1 : -1);
        // in tune: a twinkle off the strings at the nut
        if (f >= 2) {
            const nut = pegPt(0.8, 0), u = bump(t, TUNE + 2 / 12, 0.2);
            C.sparkle(g, nut[0] - 6, nut[1] - 4, 26 + 46 * u, { color: K.white, ink: K.ink, lw: 3 });
        }
    }

    // =========================================================================================
    // Shot 6 · «Face to face», bars 127–128: the stage view. The good note, the two square up, the count
    // =========================================================================================
    const GOOD = T4, FWD = n(33), FACE = n(34), NECKS = n(35), COUNT = n(36);
    const pan5 = (t) => lerp(40, 0, E.inOut(E.seg(t, n(32.5), n(35.5))));
    // the last picture: what the solo starts from (the band is Rig.band's, Tom on the bonnet instead of up front)
    const FINAL = { view: 'stage', pan: 0, heat: 1, hype: 1, lighters: 0.35, density: 1, solo: 0.5, mikeAt: MIKE_FWD, devilAt: DEVIL_AT, tomAt: HOOD };
    function faceShot(g, t) {
        const pan = pan5(t), o = venueO('stage', pan, t), St = I.stage('stage', pan), car = St.car, s = car.s, Pu = S.pulseAt(t), d = C.drawing(t);
        const crowd = { hype: FINAL.hype, lighters: FINAL.lighters, wave: on(t, FWD + 0.3) ? null : lerp(0.2, 0.86, E.seg(t, GOOD, FWD + 0.3)) };
        I.venue(g, t, o);
        dress(g, t, 'stage', pan, crowd, 'back');
        const fwd = on(t, FWD) ? E.seg(t, FWD, FWD + 6 * FR) : 0, face = on(t, FACE) ? E.out(seg2(t, FACE, FACE + 2 / 12)) : 0, solo = FINAL.solo * (on(t, NECKS) ? E.back(seg2(t, NECKS, NECKS + 3 / 12)) : 0);
        const cnt = on(t, COUNT), ck = cnt ? Math.min(3, Math.floor((t - COUNT) / S.BEAT + 0.04)) : -1, click = cnt ? 1 - E.seg(twos(t, n(36 + ck)), n(36 + ck) + 1.5 / 12, n(36 + ck) + 3.5 / 12) : 0;
        const held = on(t, NECKS) ? { squash: 0.035 * Pu.pulse, headDy: 0.02 * Pu.pulse, sway: 0, strum: -1, fret: 0.5 } : {};
        const mikeAt = fwd >= 1 ? MIKE_FWD : fwd > 0 ? arc(SEATS.deck[1], MIKE_FWD, fwd, 0.16) : SEATS.deck[1];
        const mikePose = on(t, FWD) ? { ...held, squash: (held.squash ?? 0.045 * Pu.pulse) + Math.max(0, thud(t, FWD + 6 * FR, 0.14)), mouth: 'grin', headTilt: 0.07 * face } : turned(t, GOOD);
        const pose = axePose(t, {
            look: -1, solo, flames: 0.8 + 0.2 * bump(t, GOOD, 0.4), fret: 0.5, mood: !on(t, FWD) ? 'laugh' : 'grin', headTilt: -0.05 * face,
            strum: !on(t, GOOD + 3 / 12) ? lerp(-1, 1, E.out(seg2(t, GOOD, GOOD + 2 / 12))) : on(t, NECKS) ? -1 : Math.cos((Pu.k + Pu.since) * TAU),
            squash: (on(t, NECKS) ? 0.035 : 0.04) * Pu.pulse + 0.06 * bump(t, GOOD, 0.25),
        });
        // a spot on each, from the rig's two middle lamps: on with the good note
        const mk = carPt(car, mikeAt, t), dv = carPt(car, DEVIL_AT, t), sp = pop(t, GOOD, 0.25);
        const spots = (a, pool) => {
            P.spot(g, St.lamps[2][0], St.lamps[2][1], mk[0], mk[1] + 4, 0.6 * s * sp, K.white, a, pool);
            P.spot(g, St.lamps[3][0], St.lamps[3][1], dv[0], dv[1] + 4, 0.64 * s * sp, K.white, a, pool);
        };
        // behind him, the good note's burst
        const gb = bump(t, GOOD, 0.5);
        if (gb > 0.01) C.burst(g, dv[0] - 0.1 * s, dv[1] - 1.0 * s, { r0: 0.9 * s * (0.7 + 0.3 * gb), r1: 1.4 * s * (0.7 + 0.3 * gb), n: 13, seed: 'bridge-good', fill: K.yellow, ink: K.ink, lw: 3.2, rot: d % 2 ? 0.05 : 0 });
        spots(0.16, true);
        const tips = band(g, t, car, {
            solo, tomAt: HOOD, mikeAt, mikeNear: fwd > 0.5,
            pose: { mike: mikePose, ben: on(t, FACE) ? { headTilt: 0.08 } : {}, howie: on(t, FACE) ? { headTilt: 0.08 } : {}, stan: on(t, COUNT - 4 / 12) ? { kick: 0, headDy: 0.03 * Pu.pulse, eyes: 'wide', sway: 0 } : {} },
            cactus: { lean: 0.07, wave: 0.5 + 0.2 * Pu.pulse },
            devil: (g2, sc) => I.devilGuitar(g2, 0, 0, sc, pose),
            count: on(t, COUNT - 4 / 12) ? { up: E.out(seg2(t, COUNT - 4 / 12, COUNT - 1 / 12)), click } : null,
        });
        spots(0.07, false);
        dress(g, t, 'stage', pan, crowd, 'stage');
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
        I.crowd(g, t, { ...o, density: FINAL.density, ...crowd });
        dress(g, t, 'stage', pan, crowd, 'front');
        scraps(g, t, St);
    }

    Seg.bridge = {
        shots: [[T0, T1, 'The contract'], [T1, T2, 'The fire'], [T2, T3, 'The house'], [T3, TUNE, 'The nod'], [TUNE, T4, 'The peg'], [T4, T5, 'Face to face']],
        // for the block that follows: the last picture's state, and the band with this block's places
        FINAL, band, axePose,
        draw(g, t, env) {
            g.save();
            g.lineJoin = 'round';
            if (t < T1 - 1e-6) contractShot(g, t);
            else if (t < T2 - 1e-6) fireShot(g, t);
            else if (t < T3 - 1e-6) houseShot(g, t);
            else if (t < TUNE - 1e-6) nodShot(g, t);
            else if (t < T4 - 1e-6) pegShot(g, t);
            else faceShot(g, t);
            g.restore();
        },
        post() {
            return {};
        },
    };
})();
