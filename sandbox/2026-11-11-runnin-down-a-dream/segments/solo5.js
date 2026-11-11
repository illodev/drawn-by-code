// «solo5», bars 167–178 (236.17–253.125 s): the concert on the moon, and the poster.
//   Two crowds      bar 167        the wide picture of the landing comes alive: Hell's fans on one
//                                  side, Heaven's angels on the other, eyeing each other; the imp in
//                                  specs hops out with his foam trident, the ginger angel steps up
//   The swap        bar 168        close on the two: he holds out the trident, she holds out a spare
//                                  halo, they swap on the third beat and hop on the fourth
//   Together        bar 169        wide again: they all dance, mixed; the moon nods under them
//   The trade       bars 170–171   close on the car: Mike and the Devil trade phrases across the
//                                  windshield, the cactus gives each his turn, Tom looks from one to
//                                  the other and steps up
//   One line        bar 172        the whole car: Mike, Tom and the Devil play it together, the
//                                  angels overhead, the cactus conducting with both arms
//   Everybody       bars 173–175   wide and wider: the hearse lands with the rain machine in tow and
//                                  the office imps aboard, the sun peers over the limb, EXIT 666
//                                  tumbles in and plants itself, a cone lands; the sky warms
//   The poster      bars 176–178   the biggest chord: the album's cover remade with the film's cast
// The limb stage is a stand-in for Solo4Props.moonStage until that file exists (see STAGE).
// Props in solo5-props.js (Solo5Props).
(() => {
    const Seg = (window.Seg = window.Seg || {});
    const C = Cereal, K = C.COL, S = Song, W = Skyward, F = Finale, I = Inferno, Q = Solo5Props, twos = S.twos, b = S.b, B = S.B;
    const TAU = Math.PI * 2, PI = Math.PI, FR = 1 / 24;
    const T0 = B(167), T_SWAP = B(168), T_DANCE = B(169), T_TRADE = B(170), T_LINE = B(172), T_WIDE = B(173), T_POSTER = B(176), T_END = B(179);
    const at = (k) => b(668 + k); // beat k of this block, on its frame (bar 167 starts on beat 668)
    const lerp = (a, b2, u) => a + (b2 - a) * u;
    const clamp = (v, a = 0, b2 = 1) => Math.max(a, Math.min(b2, v));
    const seg = (v, a, b2) => clamp((v - a) / (b2 - a));
    const smooth = (u) => {
        const v = clamp(u);
        return v * v * (3 - 2 * v);
    };
    const back = (u) => 1 + 2.7 * Math.pow(clamp(u) - 1, 3) + 1.7 * Math.pow(clamp(u) - 1, 2);
    const rot = ([x, y], a) => [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)];
    const on = (t, a) => t >= a - 1e-6;
    // time since an event, held on its own drawings (seconds; negative before it)
    const since = (t, a) => (on(t, a) ? twos(t, a) - a : -1);
    const dr = (t, a) => Math.floor((t - a) * 12 + 1e-6); // drawings since a
    // 0 → 1 over `dur` from `a`, on twos
    const go = (t, a, dur) => (on(t, a) ? clamp((twos(t, a) - a) / dur) : 0);
    // a value that jumps on a hit and falls back, on twos: 1 on the hit's frame
    const hit = (t, a, dur = 0.3) => {
        const u = since(t, a);
        return u < 0 || u >= dur ? 0 : Math.pow(1 - u / dur, 1.6);
    };
    // a landing at `a`: amp on its own frame, then it rings out
    const thud = (t, a, amp = 0.16, dur = 0.3) => (on(t, a) && twos(t, a) - a < dur ? amp * (1 - (twos(t, a) - a) / dur) * Math.cos(((twos(t, a) - a) / dur) * PI * 1.5) : 0);
    const arc = (p, q, u, h) => [lerp(p[0], q[0], u), lerp(p[1], q[1], u) - h * 4 * u * (1 - u)];
    const opt = (name) => (typeof window[name] !== 'undefined' ? window[name] : null);

    // =========================================================================================
    // The limb stage: the moon's limb across the frame, the car at rest on it, the near ground
    // =========================================================================================
    // World units are the wide picture's frame units; a camera { z, cx, cy } looks at it (the
    // drawers get positions and scales, never a scaled canvas, so outlines keep their width).
    const STAGE = {
        mn: { x: 500, y: 1500, r: 900 }, // the moon
        rot: 0, // its own turn (its boulders and its shade stay upright only near 0)
        s: 56, carA: -0.03, // the car's scale and where it rests on the limb (radians from the top)
        flagA: 0.36, // the pennant, planted
        earth: [846, 268, 34],
    };
    const view = (cam) => {
        const z = cam.z, P = (x, y) => [500 + (x - cam.cx) * z, 500 + (y - cam.cy) * z], c = P(STAGE.mn.x, STAGE.mn.y);
        return { z, P, s: STAGE.s * z, mn: { x: c[0], y: c[1], r: STAGE.mn.r * z } };
    };
    const WIDE = { z: 1, cx: 500, cy: 500 };
    // the moon keeps the beat: it dips on each one and rocks a hair, and everything on it goes along
    const nodAt = (t, k) => {
        const P = S.pulseAt(t);
        return { dy: 7 * k * P.pulse, a: 0.007 * k * (P.k % 2 ? 1 : -1) * P.pulse };
    };
    // the pennant stands where it was planted whatever the moon's own turn: Skyward.moon draws
    // it (behind its disc); only what is outside the disc is kept
    function flag(g, mn, s, t) {
        g.save();
        g.beginPath();
        g.rect(mn.x - mn.r - 400, mn.y - mn.r - 400, 2 * mn.r + 800, 2 * mn.r + 800);
        g.arc(mn.x, mn.y, mn.r - 1.5, 0, TAU, true);
        g.clip();
        W.moon(g, mn.x, mn.y, mn.r, { flag: { a: STAGE.flagA, s, t }, t });
        g.restore();
    }
    /**
     * o: { nod 0..1, warm 0..1, hor, look [x, y] (the moon's eye), earth [x, y, r] on screen,
     *      sun { x, y (world), r, k (0..1 risen) },
     *      behind(g, V)  on the limb behind the car;  car(g, s)  the car, at its place (0, 0);
     *      front(g, V)   the near ground, in front of it;  over(g, V)  what is not on the moon }
     */
    function stage(g, t, cam, o = {}) {
        const V = view(cam), nd = nodAt(t, o.nod ?? 0), e = o.earth ?? STAGE.earth;
        Q.sky(g, t, { warm: o.warm ?? 0, hor: o.hor ?? 620, cx: V.mn.x, cy: Math.min(V.mn.y, 1300) });
        Q.earth(g, e[0], e[1], e[2]);
        if (o.sun && o.sun.k > 0) {
            const p = V.P(o.sun.x, o.sun.y), r = o.sun.r * V.z;
            Q.sun(g, p[0], p[1] + (1 - o.sun.k) * r * 2.6, r, t);
        }
        g.save();
        g.translate(V.mn.x, V.mn.y + nd.dy * V.z);
        g.rotate(nd.a);
        g.translate(-V.mn.x, -V.mn.y);
        if (STAGE.rot) flag(g, V.mn, V.s, t);
        W.moon(g, V.mn.x, V.mn.y, V.mn.r, { face: 1, wink: 1, smile: o.smile ?? 1, look: o.look ?? [0.15, -0.9], rot: STAGE.rot, flag: STAGE.rot ? false : { a: STAGE.flagA, s: V.s, t }, t });
        const rest = W.landingAt(V.mn, STAGE.carA, V.s, 1);
        W.landing(g, rest.x, rest.y, V.s, 1, { r: V.mn.r, rot: rest.rot, t, part: 'back' });
        if (o.behind) o.behind(g, V);
        g.save();
        g.translate(rest.x, rest.y);
        g.rotate(rest.rot);
        o.car(g, V.s);
        g.restore();
        if (o.front) o.front(g, V);
        g.restore();
        if (o.over) o.over(g, V);
    }

    // =========================================================================================
    // The people on the ground
    // =========================================================================================
    const IMP = 0.67;
    /**
     * An imp at the screen point (x, y), s the figure unit. o: Devil.imp's pose (wear, mood, look,
     * armUp, hop, squash, tail) plus trident ('L' | 'R': the mitt that holds a foam trident),
     * tilt (the trident's), halo (0..1: a spare halo round its horns, popping), haloDy,
     * scarf (a colour: Weather's scarf and earmuffs, the office's imps)
     */
    function imp(g, x, y, s, o = {}) {
        const u = s * IMP, sq = o.squash ?? 0, hop = o.hop ?? 0, up = o.armUp ?? 0;
        const pose = { squash: sq, hop, mood: o.mood ?? 'grin', look: o.look ?? 0, wear: o.wear, armUp: up, tail: o.tail ?? 0, shadow: o.shadow };
        if (o.trident) {
            const sd = o.trident === 'L' ? -1 : 1, hand = [sd * 0.66, -0.4 - up * 0.5];
            I.foamTrident(g, 3, x + (hand[0] + sd * 0.01) * u * (1 + sq), y - hop * u + (hand[1] - 0.03) * u * (1 - sq), u, o.tilt ?? sd * 0.3);
        }
        const hk = o.halo ?? 0, hp = [x + 0.05 * u, y - hop * u - (1.13 + (o.haloDy ?? 0)) * u * (1 - sq)];
        if (hk > 0) Q.halo(g, hp[0], hp[1], s, { k: 0.86 * hk, tilt: o.haloTilt ?? 0.2, part: 'back' });
        Devil.imp(g, x, y, u, pose);
        if (hk > 0) Q.halo(g, hp[0], hp[1], s, { k: 0.86 * hk, tilt: o.haloTilt ?? 0.2, part: 'front' });
        if (o.scarf && opt('Weather')) {
            Weather.onImp(g, x, y, u, pose, (g2) => {
                Weather.scarf(g2, u, o.scarf, { t: o.t ?? 0, blow: o.blow ?? 0.3 });
                Weather.earmuffs(g2, u, o.wear);
                if (up > 0.25 && opt('Verse2cProps')) Verse2cProps.impArms(g2, u, up);
            });
        }
    }
    // where an angel's point is on screen (its own units → the frame), lean and squash applied
    const angelPt = (x, y, s, pose, p) => {
        const q = pose.squash ?? 0, r = rot([p[0] * (1 + q), p[1] * (1 - q)], pose.lean ?? 0);
        return [x + r[0] * s, y + r[1] * s];
    };
    /**
     * An angel at the screen point (x, y). pose: Skyward.angel's, plus trident ('L' | 'R': the
     * mitt that holds a foam trident, with tilt) and spare ('L' | 'R': the mitt that holds a
     * spare halo; spareK its pop)
     */
    function angel(g, x, y, s, pose = {}) {
        W.angel(g, x, y, s, { shadow: true, ...pose });
        const pts = W.angelPoints(pose);
        if (pose.trident) {
            const h = angelPt(x, y, s, pose, pose.trident === 'L' ? pts.handR : pts.handL);
            I.foamTrident(g, 3, h[0], h[1] - 0.02 * s, s * IMP, pose.tilt ?? 0.12);
            Q.mitt(g, h[0], h[1], s, pose.who ?? 0, -PI / 2 + (pose.tilt ?? 0.12));
        }
        if (pose.spare) {
            const sd = pose.spare === 'L' ? -1 : 1, h = angelPt(x, y, s, pose, sd < 0 ? pts.handR : pts.handL);
            Q.halo(g, h[0] + sd * 0.3 * s, h[1] - 0.02 * s, s, { k: pose.spareK ?? 1, tilt: sd * (pose.spareTilt ?? 0.12) });
            Q.mitt(g, h[0], h[1], s, pose.who ?? 0, sd < 0 ? PI : 0);
        }
    }
    const skel = (g, x, y, s, t, o = {}) => I.fan(g, x, y, s, { kind: 'skeleton', hold: 'none', hawk: K.pink, tee: 2, t, ...o });

    // Where the seven stand on the near ground (world), per picture: [x, y]
    const POS = {
        apart: { skel: [150, 778], bow: [226, 804], imp3: [294, 772], specs: [354, 806], A2: [654, 808], A0: [750, 778], A1: [852, 806] },
        mixed: { bow: [176, 808], A0: [268, 790], imp3: [356, 782], specs: [452, 820], A2: [556, 820], skel: [672, 794], A1: [778, 808] },
        right: { imp3: [590, 780], A0: [682, 776], skel: [788, 780], bow: [898, 782], specs: [636, 830], A2: [738, 832], A1: [852, 836] },
    };
    const MEET = { specs: [446, 820], A2: [562, 820] }; // where the two walk to in bar 167
    // the seven dancing, at their places p (world): what each does on the beat at t
    function dancers(t, p, o = {}) {
        const P = S.pulseAt(t), ph = P.k + P.since, pu = P.pulse, even = P.k % 2 === 0, fr = P.since - Math.floor(P.since);
        const hop = (ph0, amp = 0.16) => amp * Math.sin(PI * Math.min(1, (((P.since + ph0) % 1) + 1) % 1)) * (o.hype ?? 1);
        const wing = (ph0) => (opt('Solo3Props') ? Solo3Props.beatWing(t, ph0).flap : W.flap(t));
        const jump = o.jump ?? 0; // everybody in the air together (figure units)
        return [
            { id: 'bow', kind: 'imp', at: p.bow, pose: { wear: 'bow', mood: 'grin', armUp: even ? 1 : 0.5, hop: hop(0) + jump, squash: 0.06 * pu, tail: 0.05 * Math.cos(ph * PI), look: 0.6 } },
            { id: 'imp3', kind: 'imp', at: p.imp3, pose: { mood: 'grin', armUp: even ? 0.5 : 1, hop: hop(0.5) + jump, squash: 0.06 * pu, tail: -0.05 * Math.cos(ph * PI), look: -0.4, trident: 'L', tilt: -0.3 + 0.16 * Math.cos(ph * PI) } },
            { id: 'specs', kind: 'imp', at: p.specs, pose: { wear: 'specs', mood: 'grin', armUp: 1, hop: hop(0) + jump, squash: 0.06 * pu, tail: 0.05 * Math.cos(ph * PI), look: 1, halo: 1, haloDy: 0.1 * pu, haloTilt: 0.2 + 0.1 * Math.cos(ph * PI) } },
            { id: 'skel', kind: 'skel', at: p.skel, pose: { hype: o.hype ?? 1, look: -0.5, lift: jump } },
            { id: 'A0', kind: 'angel', at: p.A0, pose: { who: 0, mood: 'rock', harp: true, strum: Math.cos(ph * TAU), flap: wing(0), squash: 0.04 * pu, headDy: 0.03 * pu, headTilt: 0.06 * Math.sin(ph * PI), haloUp: 0.7 * pu, halo: 0.1 * Math.sin(ph * PI), lift: 0.5 * hop(0.25) + jump } },
            { id: 'A1', kind: 'angel', at: p.A1, pose: { who: 1, mood: 'rock', trumpet: true, armUp: 0.35 + 0.65 * pu, flap: wing(0.25), squash: 0.04 * pu, headDy: 0.02 * pu, haloUp: 0.7 * pu, halo: -0.1 * Math.sin(ph * PI), lean: -0.1 - 0.05 * pu, lift: 0.5 * hop(0.75) + jump } },
            { id: 'A2', kind: 'angel', at: p.A2, pose: { who: 2, mood: 'rock', armUp: 0.55 + 0.45 * pu, handR: even ? [-0.52, -0.52] : [-0.56, -1.2 - 0.62 * (0.4 + 0.6 * pu)], flap: wing(0.5), squash: 0.04 * pu, headDy: 0.03 * pu, headTilt: even ? 0.06 : -0.06, haloUp: pu, halo: 0.14 * Math.sin(ph * PI), trident: 'R', tilt: 0.1 + 0.14 * Math.cos(ph * PI), lift: 0.6 * hop(0) + jump } },
        ];
    }
    // draw a list of people on the ground, far ones first
    function people(g, V, t, list) {
        for (const m of list.slice().sort((p, q) => p.at[1] - q.at[1])) {
            const [x, y] = V.P(m.at[0], m.at[1]), s = V.s;
            if (m.kind === 'imp') imp(g, x, y, s, m.pose);
            else if (m.kind === 'skel') skel(g, x, y - (m.pose.lift ?? 0) * s, s, t, m.pose);
            else {
                // an angel that leaves the ground keeps its shadow there
                const lift = m.pose.lift ?? 0;
                if (lift > 0.005) {
                    g.fillStyle = 'rgba(36,21,49,0.28)';
                    g.beginPath();
                    g.ellipse(x + 0.05 * s, y, 0.56 * s * (1 - lift), 0.06 * s, 0, 0, TAU);
                    g.fill();
                }
                angel(g, x, y - lift * s, s, { ...m.pose, shadow: lift <= 0.005 });
            }
        }
    }

    // the car at rest, playing: the ride as every solo block draws it
    const rideOn = (g, t, s, o = {}) => {
        const P = S.pulseAt(t);
        F.ride(g, t, 0, 0, s, { spin: 0, exhaust: 0, shadow: true, bounce: 0.25 * P.pulse, ...o });
    };

    // =========================================================================================
    // 1 · Two crowds (bar 167)
    // =========================================================================================
    const STEP_I = at(2), STEP_A = at(3);
    function apart(g, t) {
        const P = S.pulseAt(t), ph = P.k + P.since, pu = P.pulse, alive = smooth(seg(t, T0, T0 + 0.5)), p = POS.apart;
        const eye = go(t, at(1), 2 / 12); // on the second beat they lean in and stare
        // the imp in specs: two hops out into the open, his trident held up
        const h1 = go(t, STEP_I, 3 / 12), h2 = go(t, STEP_A, 3 / 12);
        const mid = [lerp(p.specs[0], MEET.specs[0], 0.5), lerp(p.specs[1], MEET.specs[1], 0.5)];
        const ip = h2 > 0 ? arc(mid, MEET.specs, h2, 0) : arc(p.specs, mid, h1, 0);
        const ihop = 0.3 * Math.sin(PI * (h2 > 0 ? h2 : h1));
        // the ginger angel: one step, wings out, the spare halo on her mitt
        const a1 = go(t, STEP_A, 4 / 12), ap = arc(p.A2, MEET.A2, smooth(a1), 0), alift = 0.14 * Math.sin(PI * a1);
        const list = [
            { kind: 'skel', at: p.skel, pose: { hype: 0.12 + 0.1 * eye, look: 1, headTilt: 0.05 * eye } },
            { kind: 'imp', at: p.bow, pose: { wear: 'bow', mood: 'awe', look: 1, squash: 0.04 * pu, armUp: 0, tail: 0.04 * Math.cos(ph * PI) } },
            { kind: 'imp', at: p.imp3, pose: { mood: eye > 0.5 ? 'oops' : 'grin', look: 1, squash: 0.04 * pu, armUp: 0.9, trident: 'L', tilt: -0.34, tail: -0.04 * Math.cos(ph * PI) } },
            { kind: 'imp', at: ip, pose: { wear: 'specs', mood: 'grin', look: 1, squash: 0.04 * pu + 0.1 * (hit(t, STEP_I + 3 / 12, 0.17) + hit(t, STEP_A + 3 / 12, 0.17)), hop: ihop, armUp: 0.9, trident: 'R', tilt: 0.3 - 0.1 * (h1 + h2), tail: 0.05 * Math.cos(ph * PI) } },
            { kind: 'angel', at: ap, pose: { who: 2, mood: 'serene', flap: a1 > 0 && a1 < 1 ? 0.9 : 0.25 + 0.1 * pu, squash: 0.03 * pu, headDy: 0.02 * pu, headTilt: -0.07 * eye, lean: -0.03 * eye + 0.05 * Math.sin(PI * a1), handR: [-0.56, -0.6], handL: [0.3, -0.62], spare: 'L', halo: 0.12 * eye, lift: alift } },
            { kind: 'angel', at: p.A0, pose: { who: 0, mood: 'serene', harp: true, strum: 0, flap: 0.2 + 0.1 * pu, squash: 0.03 * pu, headDy: 0.02 * pu, headTilt: -0.06 * eye, lean: 0.03 * eye, halo: 0.1 * eye } },
            { kind: 'angel', at: p.A1, pose: { who: 1, mood: eye > 0.5 ? 'peek' : 'serene', trumpet: true, flap: 0.2 + 0.1 * pu, squash: 0.03 * pu, headDy: 0.02 * pu, headTilt: -0.05 * eye, lean: 0.04 * eye, halo: -0.1 * eye } },
        ];
        stage(g, t, WIDE, { nod: alive, look: [lerp(0.5, -0.3, seg(t, STEP_I, T_SWAP)), -0.9], car: (c, s) => rideOn(c, t, s), front: (c, V) => people(c, V, t, list) });
    }

    // =========================================================================================
    // 2 · The swap (bar 168): close on the two, at s = 200, the limb and the sky behind them
    // =========================================================================================
    const OFFER = at(5), SWAP = at(6), HOP = at(7), SW = 200;
    function swap(g, t) {
        const P = S.pulseAt(t), ph = P.k + P.since, pu = P.pulse, d = C.drawing(t), s = SW, u = s * IMP;
        const mn = { x: 430, y: 706 + 3214, r: 3214 };
        const IX = 352, IY = 846, AX = 664, AY = 852;
        Q.sky(g, t, { cx: 500, cy: 1300 });
        Q.earth(g, 196, 246, 84);
        W.moon(g, mn.x, mn.y, mn.r, { rot: 2.2, t });
        // the swap's own star, behind the two
        const sb = S.pop(t, SWAP, 0.25);
        if (sb > 0) C.burst(g, 512, 600, { r0: 250 * sb, r1: 330 * sb * (1 + 0.03 * pu), n: 15, seed: 'solo5-swap', jitter: 0.14, rot: d % 4 < 2 ? 0 : 0.03, fill: K.pink, ink: K.ink, lw: 5 });
        // who watches: the imp with the bow from the left, the harp's angel from the right
        const cheer = on(t, SWAP) ? 1 : 0, lookers = on(t, SWAP) ? 0.14 * Math.sin(PI * Math.min(1, P.since - Math.floor(P.since))) : 0;
        imp(g, 138, 792, s * 0.86, { wear: 'bow', mood: cheer ? 'grin' : 'awe', look: 1, armUp: cheer, hop: lookers, squash: 0.04 * pu });
        angel(g, 902, 786, s * 0.86, { who: 0, mood: cheer ? 'rock' : 'serene', harp: true, strum: Math.cos(ph * TAU), flap: cheer ? Solo3Wing(t, 0.3) : 0.25, squash: 0.03 * pu, headDy: 0.02 * pu, headTilt: -0.06, armUp: 0.6 + 0.4 * pu });
        // --- the two ---------------------------------------------------------------------------
        const fly = go(t, SWAP, 3 / 12), done = fly >= 1, hop = on(t, HOP) ? Math.sin(PI * Math.min(1, (twos(t, HOP) - HOP) / 0.25)) : 0;
        const offer = back(go(t, OFFER, 3 / 12));
        // her poses: serene with the spare halo on her mitt; she holds it out; she takes the trident high
        const aPose = done
            ? { who: 2, mood: 'rock', armUp: 0.7 + 0.3 * pu, handR: [-0.5, -0.56], flap: Solo3Wing(t, 0), squash: 0.04 * pu + 0.08 * hit(t, HOP + 0.25, 0.17), headDy: 0.03 * pu, headTilt: -0.05, haloUp: pu, halo: 0.14 * Math.sin(ph * PI), lean: -0.03 }
            : { who: 2, mood: fly > 0 ? 'shocked' : 'serene', flap: 0.25 + 0.5 * offer * (1 - go(t, OFFER, 5 / 12)) + (fly > 0 ? 0.6 : 0), squash: 0.03 * pu, headDy: 0.02 * pu, headTilt: -0.08, lean: -0.02 - 0.03 * offer, halo: 0.1,
                handR: fly > 0 ? [-0.7, -1.3] : [lerp(-0.56, -0.78, offer), lerp(-0.6, -1.16, offer)], handL: fly > 0 ? [0.56, -1.5 - 0.3 * fly] : [0.3, -0.62] };
        const alift = 0.2 * hop, ay = AY - alift * s;
        // his: the trident held out, then both mitts up under the halo
        const iPose = { wear: 'specs', mood: !done && on(t, OFFER) ? 'awe' : 'grin', look: 1, squash: 0.04 * pu + 0.09 * hit(t, HOP + 0.25, 0.17), hop: 0.34 * hop + (on(t, T_SWAP) && !on(t, OFFER) ? 0.06 * pu : 0), armUp: done ? 1 : 0.8, tail: 0.06 * Math.cos(ph * PI) };
        // where the two gifts are: in their mitts, in the air (three drawings), in their new places
        const iMitt = [IX + 0.67 * u, IY - iPose.hop * u - (0.4 + iPose.armUp * 0.5 + 0.03) * u], aPts = W.angelPoints(aPose);
        const aGive = angelPt(AX, ay, s, aPose, aPts.handR), aTake = angelPt(AX, ay, s, { ...aPose, mood: 'rock' }, done ? aPts.handL : [0.56, -1.8]);
        const haloHome = [IX + 0.05 * u, IY - iPose.hop * u - 1.13 * u];
        if (fly > 0 && !done) {
            const tp = arc(iMitt, aTake, fly, 150), hp = arc([aGive[0] - 0.3 * s, aGive[1]], haloHome, fly, 120);
            Q.halo(g, hp[0], hp[1], s, { k: 0.86, tilt: 0.12 - 2.4 * fly, part: 'back' });
            imp(g, IX, IY, s, iPose);
            Q.halo(g, hp[0], hp[1], s, { k: 0.86, tilt: 0.12 - 2.4 * fly, part: 'front' });
            angel(g, AX, ay, s, aPose);
            I.foamTrident(g, 3, tp[0], tp[1], u, 0.3 + TAU * fly);
            // ticks where each left a mitt
            for (const [px, py] of [iMitt, aGive]) for (let i = 0; i < 5; i++) {
                const a = -PI / 2 + (i - 2) * 0.5, r0 = 0.2 * s + 40 * fly, r1 = r0 + 0.11 * s;
                C.poly(g, [[px + Math.cos(a) * r0, py + Math.sin(a) * r0], [px + Math.cos(a) * r1, py + Math.sin(a) * r1]], { ink: K.white, lw: 4, close: false });
            }
        } else if (!done) {
            imp(g, IX, IY, s, { ...iPose, trident: 'R', tilt: 0.3 + 0.05 * Math.cos(ph * PI) });
            angel(g, AX, ay, s, { ...aPose, spare: 'L', spareK: on(t, OFFER) ? 0.9 + 0.1 * S.pop(t, OFFER, 0.2) : 1 });
            if (on(t, OFFER)) {
                const k = hit(t, OFFER, 0.34);
                if (k > 0) for (const [dx, dy, r] of [[-0.62, -0.16, 22], [-0.16, -0.3, 15], [0.06, 0.14, 12]]) C.sparkle(g, aGive[0] + dx * s, aGive[1] + dy * s, r * (1.6 - k), { color: K.white, ink: K.ink, lw: 2 });
            }
        } else {
            const land = hit(t, SWAP + 3 / 12, 0.25);
            imp(g, IX, IY, s, { ...iPose, halo: 1, haloDy: 0.08 * pu - 0.1 * land, haloTilt: 0.2 + 0.12 * Math.cos(ph * PI) });
            angel(g, AX, ay, s, { ...aPose, trident: 'R', tilt: 0.1 + 0.12 * Math.cos(ph * PI) });
            if (alift > 0.005) {
                g.fillStyle = 'rgba(36,21,49,0.28)';
                g.beginPath();
                g.ellipse(AX + 0.05 * s, AY, 0.56 * s * (1 - alift), 0.06 * s, 0, 0, TAU);
                g.fill();
            }
            // twinkles on the halo's new head
            for (const [dx, dy, r, f] of [[-0.52, -0.2, 20, 0], [0.5, -0.34, 16, 1], [0.08, -0.6, 13, 2]]) if ((d + f) % 3 !== 0) C.sparkle(g, haloHome[0] + dx * u, haloHome[1] + dy * u, r, { color: K.white, ink: K.ink, lw: 2 });
        }
    }
    const Solo3Wing = (t, ph0) => (opt('Solo3Props') ? Solo3Props.beatWing(t, ph0).flap : W.flap(t));

    // =========================================================================================
    // 3 · Together (bar 169)
    // =========================================================================================
    function together(g, t) {
        const P = S.pulseAt(t);
        stage(g, t, WIDE, { nod: 1.3, look: [0.2 * (P.k % 2 ? 1 : -1), -0.9], car: (c, s) => rideOn(c, t, s, { bounce: 0.4 * P.pulse }), front: (c, V) => people(c, V, t, dancers(t, POS.mixed)) });
    }

    // =========================================================================================
    // 4, 5 · On the car (bars 170–172): a camera of its own, the car drawn where it is asked
    // =========================================================================================
    const SEATS = Rides.bandCarSeats();
    const MIKE_AT = [0.42, 0.2], TOM_BACK = [1.14, 0.8], TOM_UP = [1.36, 0.2];
    // whose phrase it is: Mike, the Devil, Mike, the Devil … the turns get shorter
    const TURNS = [[at(12), 'm'], [at(14), 'd'], [at(16), 'm'], [at(17), 'd'], [at(18), 'm'], [at(19), 'd'], [at(20), 'all']];
    const turnAt = (t) => {
        let i = 0;
        while (i < TURNS.length - 1 && on(t, TURNS[i + 1][0])) i++;
        return { i, who: TURNS[i][1], from: TURNS[i][0], to: i < TURNS.length - 1 ? TURNS[i + 1][0] : T_WIDE };
    };
    const STEP_UP = at(19); // Tom hops to the front on the last beat of the trade
    /**
     * The band's car with Mike at the front of the deck and Tom wherever he is, the cactus
     * conducting, the Devil on the hood. (x, y, s): the car's ground point and scale.
     *   o: { mike, tom, devil: poses merged over the beat's;  tomAt: [x along the car, z], tomHop
     *        (figure units), cactus: { side, k }, solo (Mike's), bounce, pose (the others'),
     *        wind: { tom, devil: the windmill's angle or null, devilFrom } }
     */
    function ride(g, t, x, y, s, o = {}) {
        const P = S.pulseAt(t), ph = P.k + P.since, pz = Rig.playing(t, { sing: true, solo: o.solo ?? 0.6 }), bn = o.bounce ?? 0.25 * P.pulse;
        const tomAt = o.tomAt ?? TOM_UP, far = tomAt[1] > 0.5, cac = opt('Verse2aProps');
        const place = (g2, sc0, [px, pz2], lift, fn) => Rides.at(g2, sc0, [px, SEATS.deckY - 0.04 - 0.2 * pz2 - lift, pz2], fn);
        const tom = (g2, sc0) => place(g2, sc0, tomAt, o.tomHop ?? 0, (px, py, sc) => Cast.tom(g2, px, py, sc, { ...pz.tom, ...(o.tom ?? {}) }));
        const mike = (g2, sc0) => place(g2, sc0, MIKE_AT, 0, (px, py, sc) => BandStrings.mike(g2, px, py, sc, { ...pz.mike, ...(o.mike ?? {}) }));
        const arms = Q.conduct(o.cactus?.side ?? 0, o.cactus?.k ?? Math.cos(ph * PI));
        Rig.band(g, t, x, y, s, {
            tomDrives: false, sing: true, shadow: true, exhaust: 0, bounce: bn, solo: o.solo ?? 0.6, aboard: { tom: 0, mike: 0 }, pose: o.pose,
            driver: (g2, sc) => (cac ? Verse2aProps.cactus(g2, 0, 0, sc, { shades: 0, squash: 0.05 * P.pulse, mouth: 'smile', ...arms }) : Chorus1Props.cactus(g2, 0, 0, sc, { shades: 1, squash: 0.05 * P.pulse })),
            cockpit: {
                back: (g2, sc0) => {
                    if (far) tom(g2, sc0);
                    mike(g2, sc0);
                },
                front: (g2, sc0) => {
                    if (!far) tom(g2, sc0);
                },
            },
        });
        // the Devil on the hood, as Finale.ride stands him
        const hx = x + F.HOOD[0] * s, hy = y + (F.HOOD[1] + bn * 0.1) * s, w = o.wind?.devil;
        const dp = { mood: 'grin', look: -1, shadow: false, squash: 0.045 * P.pulse, headDy: 0.02 * P.pulse, tail: 0.05 * Math.sin(ph * PI), strum: Math.cos(ph * TAU), fret: 0.2 + 0.3 * (Math.floor(ph / 2) % 3), solo: 0.5, flames: 1, shred: 0, t, ...(o.devil ?? {}) };
        if (w != null) {
            I.devilGuitar(g, hx, hy, s, { ...dp, strum: NaN });
            Q.strapEnd(g, hx, hy, s, dp);
            Q.windmill(g, hx, hy, s, w, { lean: dp.lean, squash: dp.squash, solo: dp.solo, from: o.wind.devilFrom });
        } else I.devilGuitar(g, hx, hy, s, dp);
        return { hood: [hx, hy], dp };
    }
    // the moon under a car drawn at (x, y, s): its limb, the tracks
    function ground(g, t, x, y, s, o = {}) {
        const r = (STAGE.mn.r * s) / STAGE.s, dx = Math.sin(STAGE.carA) * r, mn = { x: x - dx, y: y + Math.sqrt(r * r - 3.55 * s * 3.55 * s) - 2, r };
        Q.sky(g, t, { cx: mn.x, cy: 1300, warm: o.warm ?? 0, hor: o.hor });
        if (o.earth) Q.earth(g, ...o.earth);
        W.moon(g, mn.x, mn.y, mn.r, { rot: STAGE.rot, face: 1, wink: 1, t });
        W.landing(g, x, y, s, 1, { r, rot: 0, t, part: 'back' });
    }
    // a phrase as notes: they leave one guitar and arc over the windshield to the other player
    function phrase(g, t, from, to, a, dur, col, n) {
        for (let i = 0; i < n; i++) {
            const born = a + (i * dur * 0.8) / n, age = since(t, born);
            if (age < 0) continue;
            const u = age / (dur * 0.9 + 0.2);
            if (u >= 1) continue;
            const p = arc(from, [to[0], to[1] - 40], u, 150 + 26 * (i % 2)), k = Math.min(1, 0.6 + u * 4) * (1 - smooth(seg(u, 0.75, 1)));
            C.note(g, p[0], p[1], 30 * k, { color: col, ink: K.ink, lw: 2.6, kind: i % 3 === 1 ? 2 : 1, rot: (Math.round(age * 12) % 2 ? 0.16 : -0.14) });
        }
    }

    const TX = 168, TY = 936, TS = 150; // the trade's car
    function trade(g, t) {
        const P = S.pulseAt(t), ph = P.k + P.since, pu = P.pulse, d = C.drawing(t), tu = turnAt(t), s = TS;
        const inn = go(t, tu.from, 2 / 12), mk = tu.who === 'm' ? inn : 1 - inn, dk = 1 - mk; // how far each is into his phrase
        const nd = 4 * pu;
        g.save();
        g.translate(0, nd);
        ground(g, t, TX, TY, s, { earth: [842, 208, 60] });
        // Mike: neck up, eyes shut, the fretting mitt running; listening, he grins at the Devil
        const mike = mk > 0.5
            ? { fret: clamp(0.5 + 0.5 * [0, 0.7, -0.5, 0.9, 0.2, -0.8][((d % 6) + 6) % 6]), strum: d % 2 ? 1 : -1, lean: -0.04, squash: 0.04 * pu, headTilt: -0.04 }
            : { strum: 0.2, fret: 0.3, eyes: 'open', mouth: 'grin', lean: 0.03, headTilt: 0.07, squash: 0.045 * pu, headDy: 0.03 * pu };
        // the Devil: the same, mirrored
        const devil = dk > 0.5
            ? { solo: lerp(0.3, 1, dk), shred: 1, flames: 1, mood: 'grin', look: -1, strum: d % 2 ? 1 : -1, fret: 0.5, squash: 0.04 * pu }
            : { solo: 0.2, shred: 0, flames: 0.5, mood: 'sly', look: -1, strum: 0.2, fret: 0.25, headTilt: -0.07, squash: 0.045 * pu, step: P.k % 2 ? 1 : -1, tail: 0.08 * Math.sin(ph * PI) };
        // Tom, behind and between: he follows the phrase like a rally, then hops to the front
        const up = go(t, STEP_UP, 3 / 12), side = tu.who === 'm' ? -1 : 1;
        const tomAt = [lerp(TOM_BACK[0], TOM_UP[0], up), lerp(TOM_BACK[1], TOM_UP[1], up)];
        const tom = { headTilt: 0.09 * side * (2 * inn - 1 > 0 ? 1 : -0.4), lean: 0.03 * side * inn, squash: 0.045 * pu + 0.1 * hit(t, STEP_UP + 3 / 12, 0.17) };
        const R = ride(g, t, TX, TY, s, { solo: mk, mike, devil, tom, tomAt, tomHop: 0.42 * Math.sin(PI * up), cactus: { side, k: Math.cos(ph * PI) }, bounce: 0.2 * pu });
        // the phrases, in each player's colour
        const mp = BandStrings.points('mike', { ...mike, solo: mk }), mAt = [TX + (MIKE_AT[0] + mp.strings[0]) * s, TY + (SEATS.deckY - 0.08 + mp.strings[1]) * s];
        const gp = I.guitarPoints(R.dp), dAt = [R.hood[0] + gp.strings[0] * s, R.hood[1] + gp.strings[1] * s];
        for (let i = 0; i < TURNS.length - 1; i++) {
            const [a, who] = TURNS[i], dur = TURNS[i + 1][0] - a;
            if (!on(t, a)) continue;
            if (who === 'm') phrase(g, t, [mAt[0] + 0.3 * s, mAt[1] - 0.5 * s], [R.hood[0], R.hood[1] - 2.0 * s], a, dur, K.gold, dur > 0.5 ? 4 : 2);
            else phrase(g, t, [dAt[0] - 0.3 * s, dAt[1] - 0.5 * s], [TX + MIKE_AT[0] * s, TY - 2.75 * s], a, dur, K.pink, dur > 0.5 ? 4 : 2);
        }
        g.restore();
    }

    const LX = 492, LY = 800, LS = 90; // the line's car
    function line3(g, t) {
        const P = S.pulseAt(t), ph = P.k + P.since, pu = P.pulse, d = C.drawing(t), s = LS, even = P.k % 2 === 0;
        const sway = (even ? -1 : 1) * 0.07 * Math.min(1, P.since * 4), kick = 0.5 * pu;
        g.save();
        g.translate(0, 5 * pu);
        ground(g, t, LX, LY, s, { earth: [868, 250, 44] });
        const fret = clamp(0.5 + 0.5 * [0, 0.7, -0.5, 0.9, 0.2, -0.8][((d % 6) + 6) % 6]);
        ride(g, t, LX, LY, s, {
            solo: 0.55 + 0.45 * pu, bounce: kick, tomAt: TOM_UP, cactus: { side: 0, k: Math.cos(ph * PI) },
            mike: { fret, strum: d % 2 ? 1 : -1, lean: sway, squash: 0.05 * pu },
            tom: { fret, strum: d % 2 ? 1 : -1, lean: sway - 0.06 * pu, squash: 0.05 * pu, headTilt: -0.05 * pu },
            devil: { solo: 0.55 + 0.45 * pu, shred: 1, flames: 1, mood: 'laugh', lean: sway, squash: 0.05 * pu, fret: 0.5, strum: d % 2 ? 1 : -1 },
            pose: { stan: { crash: even ? pu : 0, kick: pu, snare: even ? 0 : pu, mouth: 'grin' }, ben: { press: 1, squash: 0.07 * pu, headDy: 0.05 * pu }, howie: { squash: 0.07 * pu, headDy: 0.04 * pu } },
        });
        // the angels overhead, playing along
        if (opt('Solo3Props')) Solo3Props.escort(g, t, LX, LY, s, { at: { 0: [-0.2, -0.1], 1: [0.2, -0.3], 2: [0.5, -7.0] }, });
        g.restore();
    }

    // =========================================================================================
    // 6 · Everybody (bars 173–175): wide and wider, the arrivals on the beats
    // =========================================================================================
    const H_LAND = at(26), SUN_UP = at(28), SIGN_IN = at(29), SIGN_LAND = at(31), CONE_IN = at(31), CONE_LAND = at(33), WIND = T_POSTER - 4 / 12;
    const HEARSE = [338, 808]; // where it comes to rest on the near ground (world)
    const SIGN = [112, 694], CONE = [556, 852], SUN = { x: 884, y: 668, r: 44 };
    const camWide = (t) => {
        const u = seg(t, T_WIDE, T_POSTER), e = 1 - Math.pow(1 - u, 1.5);
        return { z: lerp(0.95, 0.78, e), cx: 500, cy: lerp(566, 790, e) };
    };
    // the windmill's angle on each drawing of its wind-up (4 drawings, down on the chord)
    const WM_TOM = [-PI * 0.5, -PI * 0.95, -PI * 1.5, -PI * 1.9], WM_DEV = [70, -8, -88, -128].map((a) => (a * PI) / 180);
    const windAt = (t, chord) => {
        const i = dr(t, chord - 4 / 12);
        return on(t, chord - 4 / 12) && !on(t, chord) ? { tom: WM_TOM[i], devil: WM_DEV[i], devilFrom: i > 0 ? WM_DEV[i - 1] : (118 * PI) / 180 } : null;
    };
    // The hearse with the chauffeur in his scarf, the rain machine on its hitch and the office's
    // three imps aboard, at the screen point (x, y), scale s. o: { lean, bounce, spin, wave (0..1),
    // up (0..1 every mitt in the air), crank }
    const OFFICE = [['specs', K.yellow], ['hat', K.green], ['bow', K.violet]];
    function hearse(g, t, x, y, s, o = {}) {
        const P = S.pulseAt(t), ph = P.k + P.since, pu = P.pulse, Wt = opt('Weather'), ho = { lean: o.lean ?? 0, bounce: o.bounce ?? 0 }, up = o.up ?? 0;
        const hopI = (ph0) => 0.14 * Math.sin(PI * Math.min(1, (((P.since + ph0) % 1) + 1) % 1)) * (o.hype ?? 1);
        if (Wt) {
            const tow = Wt.towedAt(x, y, s, ho), crank = o.crank ?? ph * PI, mo = { towed: true, t, pitch: tow.pitch, crank, needles: 0.5 + 0.4 * Math.sin(ph * PI), smoke: 0.6, puff: P.k % 2 ? 0 : pu, shadow: o.shadow, spin: o.spin ?? 0 };
            Wt.machine(g, tow.x, tow.y, s, mo);
            // one imp turns its crank, for the fun of it
            const c = Wt.crankImp(crank, IMP, mo), ix = tow.x + c.x * s, iy = tow.y + c.y * s;
            imp(g, ix, iy, s, { wear: OFFICE[1][0], scarf: OFFICE[1][1], armUp: Math.max(c.armUp, up), hop: c.hop, squash: c.squash, look: 1, shadow: false, t, tail: 0.05 * Math.cos(ph * PI) });
        }
        Rides.hearse(g, x, y, s, { spin: o.spin ?? 0, bounce: ho.bounce, lean: ho.lean, flames: 0.5, t, shadow: o.shadow }, (g2, seats, sc0) => {
            // two more on the roof, where their boss used to ride
            [[seats.devil[0] - 1.25, seats.roofY + 0.19, 0.45, 0, 0.5], [seats.devil[0] + 0.1, seats.devil[1], 0.45, 2, 0]].forEach(([px0, py0, pz0, i, ph0]) => {
                Rides.at(g2, sc0, [px0, py0, pz0], (px, py, sc) => imp(g2, px, py, sc, { wear: OFFICE[i][0], scarf: OFFICE[i][1], armUp: Math.max(up, i ? 1 : 0.5 + 0.5 * pu), hop: hopI(ph0) * (o.landed ?? 1), squash: 0.05 * pu, look: 1, shadow: false, t, tail: 0.05 * Math.cos(ph * PI + i) }));
            });
            Rides.at(g2, sc0, seats.chauffeur, (px, py, sc) => {
                const wv = o.wave ?? 0, hands = wv > 0 || up > 0 ? { r: [-0.6, -1.5 - 0.1 * Math.cos(ph * PI)], ...(up > 0 ? { l: [0.6, -1.5 + 0.1 * Math.cos(ph * PI)] } : {}) } : undefined;
                const pose = { shadow: false, jaw: 0.3 + 0.6 * pu, headDy: 0.02 * pu, headTilt: 0.05 * Math.sin(ph * PI), ...(hands ? { hands } : {}) };
                Rides.skeleton(g2, px, py, sc, pose);
                if (opt('Verse2cProps')) Verse2cProps.skelScarf(g2, px, py, sc, { t, headDy: pose.headDy });
            });
        });
    }
    // the EXIT 666 sign at the screen point (x, y) (its post's foot), k its size, turned by ang about its middle
    function exitSign(g, x, y, k, ang = 0, spin = 0) {
        const V3 = opt('Verse3bProps');
        if (!V3) return;
        g.save();
        g.translate(x, y);
        g.scale(k, k);
        g.translate(0, -180);
        g.rotate(ang);
        g.translate(0, 180);
        V3.exitSign(g, 0, 0, { spin });
        g.restore();
    }
    function everybody(g, t) {
        const P = S.pulseAt(t), ph = P.k + P.since, pu = P.pulse, cam = camWide(t), d = C.drawing(t);
        const warm = seg(t, SUN_UP, T_POSTER - 0.2);
        const wind = windAt(t, T_POSTER), ready = go(t, WIND, 4 / 12); // the last four drawings: everybody winds up
        // the hearse comes down out of the black, the machine swinging behind it
        const fall = seg(t, T_WIDE - 0.5, H_LAND), fe = 1 - Math.pow(1 - fall, 1.7), landed = on(t, H_LAND);
        const hw = [lerp(40, HEARSE[0], fe), lerp(250, HEARSE[1], fe * fe * (3 - 2 * fe) * 0.4 + fe * 0.6)];
        const hb = landed ? -1.6 * thud(t, H_LAND, 1, 0.5) + 0.25 * pu : 0, hl = landed ? 0 : 0.1 * (1 - fall) + 0.03 * Math.sin(fall * 9);
        // the sign tumbles in from the top left and plants itself; the cone from the right
        const sIn = seg(t, SIGN_IN, SIGN_LAND), sPlanted = on(t, SIGN_LAND), cIn = seg(t, CONE_IN, CONE_LAND), cLanded = on(t, CONE_LAND);
        const look = !landed ? [-0.8, -0.7] : !on(t, SUN_UP) ? [-0.6, -0.9] : !on(t, SIGN_IN) ? [0.9, -0.8] : !sPlanted ? [-0.9, -0.9] : !cLanded ? [0.5, -0.5] : [0, -1];
        const jump = -0.07 * ready;
        stage(g, t, cam, {
            nod: 1, warm, hor: lerp(700, 566, seg(t, T_WIDE, T_POSTER)), look,
            earth: [lerp(870, 884, seg(t, T_WIDE, T_POSTER)), lerp(170, 276, seg(t, T_WIDE, T_POSTER)), 34],
            sun: { ...SUN, k: on(t, SUN_UP) ? back(go(t, SUN_UP, 4 / 12)) : 0 },
            behind: (c, V) => {
                if (sPlanted) {
                    const p = V.P(SIGN[0], SIGN[1]), q = since(t, SIGN_LAND);
                    exitSign(c, p[0], p[1], 0.667 * V.z, -0.07 + 0.2 * Math.exp(-q * 6) * Math.cos(q * 22));
                }
            },
            car: (c, s) => {
                const w = wind;
                ride(c, t, 0, 0, s, {
                    solo: 0.6 + 0.3 * pu, bounce: 0.3 * pu - 0.5 * ready, tomAt: TOM_UP, cactus: { side: 0, k: Math.cos(ph * PI) }, wind: w,
                    tom: w ? { windmill: w.tom, squash: -0.05 } : {}, devil: w ? { mood: 'laugh', squash: -0.05, headTilt: -0.05 } : { solo: 0.5 + 0.4 * pu, shred: 1 },
                    pose: w ? { stan: { snare: 0, hat: 0, crash: 0, headDy: -0.05 } } : undefined,
                });
            },
            front: (c, V) => {
                if (landed) {
                    const p = V.P(HEARSE[0], HEARSE[1]);
                    hearse(c, t, p[0], p[1], V.s, { bounce: hb, wave: 1, up: ready });
                    const q = since(t, H_LAND);
                    for (const [dx, sd] of [[-2.5, 1], [3.1, 2]]) Q.dust(c, p[0] + dx * V.s, p[1], V.s, q, { seed: sd, n: 6, w: 0.5, size: 1.5 });
                }
                people(c, V, t, dancers(t, POS.right, { jump: 0, hype: 1 - 0.7 * ready }).map((m) => (ready > 0 ? { ...m, pose: { ...m.pose, squash: 0.12 * ready, hop: 0, lift: 0 } } : m)));
                if (cLanded) {
                    const p = V.P(CONE[0], CONE[1]), q = since(t, CONE_LAND);
                    if (opt('Verse3bProps')) Verse3bProps.cone(c, p[0], p[1] - 14 * V.z * Math.max(0, thud(t, CONE_LAND + 1 / 12, 1, 0.34)), V.s * 0.95, 0.5 * Math.exp(-q * 7) * Math.cos(q * 20));
                    Q.dust(c, p[0], p[1], V.s, q, { seed: 5, n: 4, w: 0.2, size: 0.7, life: 0.9 });
                }
            },
            over: (c, V) => {
                if (!landed) {
                    const p = V.P(hw[0], hw[1]);
                    hearse(c, t, p[0], p[1], V.s, { lean: hl, spin: t * 6, wave: 1, shadow: false, landed: 0, crank: t * 4 });
                }
                if (on(t, SIGN_IN) && !sPlanted) {
                    const from = [-60, 120], to = V.P(SIGN[0], SIGN[1]), p = arc(from, to, sIn, 120);
                    exitSign(c, p[0], p[1], 0.667 * V.z, lerp(-TAU * 1.25, -0.07, sIn));
                }
                if (on(t, CONE_IN) && !cLanded && opt('Verse3bProps')) {
                    const from = [1060, 250], to = V.P(CONE[0], CONE[1]), p = arc(from, to, cIn, 130);
                    Verse3bProps.cone(c, p[0], p[1], V.s * 0.95, lerp(TAU * 1.5, 0, cIn));
                }
            },
        });
    }

    // =========================================================================================
    // 7 · The poster (bars 176–178)
    // =========================================================================================
    // The album's cover with the film's cast: the field in bands, the full moon's disc behind the
    // car, everybody standing on its lower part, the title in the film's own solids.
    const PM = { x: 500, y: 742, r: 404 }, PS = 52; // the disc; everybody's scale
    const PCAR = [512, 812], PHEARSE = [470, 902];
    const CHORDS = [T_POSTER, at(40), at(44)]; // a windmill comes down on the first beat of each bar
    function poster(g, t) {
        const P = S.pulseAt(t), ph = P.k + P.since, pu = P.pulse, d = C.drawing(t), s = PS, even = P.k % 2 === 0;
        const chord = CHORDS.filter((c) => on(t, c)).pop(), next = CHORDS.find((c) => !on(t, c)), wind = next ? windAt(t, next) : null;
        const bang = hit(t, chord, 0.34), first = hit(t, T_POSTER, 0.34); // each chord's jolt; the first one's
        const dy = 5 * pu;
        Q.field(g, t, { cx: PM.x, cy: PM.y });
        // twinkles on the field, the Earth, the sun peering round the disc
        const rs = Motion.rng('solo5-poster-stars');
        for (let i = 0; i < 16; i++) {
            const x = 70 + rs() * 860, y = 70 + rs() * 420, sz = 7 + rs() * 9, f = Math.floor(rs() * 12);
            if (Math.hypot(x - PM.x, y - PM.y) < PM.r + 46) continue;
            C.sparkle(g, x, y, sz * ((d + f) % 12 < 3 ? 1.6 : 1), { color: K.white });
        }
        Q.earth(g, 128, 468, 34);
        Q.sun(g, 866, 492, 40, t);
        W.moon(g, PM.x, PM.y + dy, PM.r * (1 + 0.012 * bang), { glow: 0.7 + 0.3 * pu, rot: 0.4, t });
        Q.title(g, t, 500, 182, { at: [T_POSTER, T_POSTER + 2 * FR, T_POSTER + 4 * FR], k: 0.9 });
        g.save();
        g.translate(0, dy);
        // --- the back row: the sign, the car --------------------------------------------------
        exitSign(g, 884, 806, 0.5, -0.06 + 0.03 * Math.sin(ph * PI));
        const land = first; // they all come down on the chord
        const jump = 0.1 * hit(t, chord, 0.25);
        const w = wind;
        ride(g, t, PCAR[0], PCAR[1], s, {
            solo: 0.6 + 0.4 * pu, bounce: 0.35 * pu + 0.8 * bang, tomAt: TOM_UP, cactus: { side: 0, k: Math.cos(ph * PI) }, wind: w,
            mike: { squash: 0.05 * pu + 0.06 * bang }, tom: w ? { windmill: w.tom, squash: -0.05 } : { squash: 0.05 * pu + 0.1 * bang, strum: bang > 0.4 ? 1 : Math.cos(ph * TAU) },
            devil: w ? { mood: 'laugh', squash: -0.05, headTilt: -0.05 } : { mood: bang > 0 ? 'laugh' : 'grin', solo: 0.5 + 0.4 * pu, squash: 0.045 * pu + 0.1 * bang, strum: bang > 0.4 ? 1 : Math.cos(ph * TAU), look: 0 },
            pose: w ? { stan: { snare: 0, hat: 0, crash: 0, headDy: -0.05 } } : { stan: { crash: Math.max(bang, even ? pu : 0), kick: Math.max(bang, even ? pu : 0), mouth: 'grin' } },
        });
        // two angels in the air over the band
        if (opt('Solo3Props')) Solo3Props.escort(g, t, PCAR[0], PCAR[1], s, { only: [0, 1], at: { 0: [-1.9, 0.5], 1: [1.5, 0.3] } });
        // --- the front row: the hearse and its machine, the fans, the ginger angel, the cone ---
        hearse(g, t, PHEARSE[0], PHEARSE[1], s, { bounce: 0.25 * pu + 0.8 * bang, wave: 1, up: 1 });
        const lift = jump;
        const front = dancers(t, { imp3: [704, 880], skel: [752, 906], bow: [806, 884], specs: [716, 0], A2: [0, 0], A0: [0, 0], A1: [0, 0] }, { jump: lift }).filter((m) => ['imp3', 'skel', 'bow'].includes(m.id));
        const V = { P: (x, y) => [x, y], s };
        people(g, V, t, front);
        g.restore();
    }

    // =========================================================================================
    function draw(g, t, env) {
        g.save();
        g.lineJoin = 'round';
        g.lineCap = 'round';
        if (!on(t, T_SWAP)) apart(g, t);
        else if (!on(t, T_DANCE)) swap(g, t);
        else if (!on(t, T_TRADE)) together(g, t);
        else if (!on(t, T_LINE)) trade(g, t);
        else if (!on(t, T_WIDE)) line3(g, t);
        else if (!on(t, T_POSTER)) everybody(g, t);
        else poster(g, t);
        g.restore();
    }

    Seg.solo5 = {
        shots: [[T0, T_SWAP, 'Two crowds'], [T_SWAP, T_DANCE, 'The swap'], [T_DANCE, T_TRADE, 'Together'], [T_TRADE, T_LINE, 'The trade'], [T_LINE, T_WIDE, 'One line'], [T_WIDE, T_POSTER, 'Everybody'], [T_POSTER, T_END, 'The poster']],
        draw, post: () => ({}),
    };
})();
