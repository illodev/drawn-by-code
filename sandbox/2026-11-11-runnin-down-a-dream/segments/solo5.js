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
// The moon stage is solo4's (Solo4Props.STAGE and its clocks), drawn here through a camera.
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
    // files a dev scene may leave out (top-level consts are not on window: each is looked up by name)
    const OPT = {
        Weather: typeof Weather !== 'undefined' ? Weather : null, Verse2aProps: typeof Verse2aProps !== 'undefined' ? Verse2aProps : null, Verse2cProps: typeof Verse2cProps !== 'undefined' ? Verse2cProps : null,
        Verse3bProps: typeof Verse3bProps !== 'undefined' ? Verse3bProps : null, Solo3Props: typeof Solo3Props !== 'undefined' ? Solo3Props : null, Solo4Props: typeof Solo4Props !== 'undefined' ? Solo4Props : null,
    };
    const opt = (name) => OPT[name];

    // =========================================================================================
    // The moon stage: solo4's picture (Solo4Props.STAGE), seen by a camera
    // =========================================================================================
    // The block before leaves the car parked on the moon's limb, its pennant planted, the Earth
    // risen, the four fans on the limb to the left and the three angels to the right. Everything
    // here reads its places from Solo4Props.STAGE (the same numbers stand in when that file is not
    // loaded) and draws that picture through a camera { z, cx, cy }: the drawers get positions and
    // scales, never a scaled canvas, so outlines keep their width when the camera pulls back.
    const P4 = OPT.Solo4Props, G4 = P4 ? P4.STAGE : null;
    const CS = G4 ? G4.s : 50, LIMB = G4 ? G4.limb : { x: 500, y: 1520, r: 900 }, MOON_ROT = G4 ? G4.moonRot : 0.5;
    const A_CAR = G4 ? G4.carA : Math.asin((484 - LIMB.x) / Math.sqrt(LIMB.r * LIMB.r - 3.55 * CS * 3.55 * CS));
    const FLAG_A = G4 ? G4.flag.a : Math.asin((744 - LIMB.x) / (LIMB.r * 0.985));
    // a point of the surface over the frame's x, `near` units down the frame from the limb
    const onLimb = (x, near = 0) => {
        const a = Math.asin((x - LIMB.x) / LIMB.r);
        return { x, y: LIMB.y - Math.cos(a) * LIMB.r + near, rot: a };
    };
    const STAND = G4 ? G4.stand : { h0: onLimb(176), h1: onLimb(218), h2: onLimb(197, 24), h3: onLimb(126), a0: onLimb(792), a1: onLimb(843), a2: onLimb(892) };
    const landK4 = P4 ? P4.landK : () => 1, earthAt = P4 ? P4.earthAt : () => ({ x: 805, y: 392, r: 60 }), SPIN = P4 ? P4.SPIN_REST : 0;
    // the landing's dust goes on thinning by solo4's law, and is all gone by the end of bar 168
    const landK = (t) => lerp(landK4(t), 1, smooth(seg(t, T0, T_DANCE)));
    const earth = (g, x, y, r, t) => (P4 ? P4.earth(g, x, y, r, t) : Q.earth(g, x, y, r));
    const noWhip = (g, s, fn) => (P4 ? P4.noWhip(g, s, fn) : fn()); // the car's whip is the flag now
    const view = (cam) => {
        const z = cam.z, P = (x, y) => [500 + (x - cam.cx) * z, 500 + (y - cam.cy) * z], c = P(LIMB.x, LIMB.y);
        return { z, P, s: CS * z, mn: { x: c[0], y: c[1], r: LIMB.r * z }, cam };
    };
    const WIDE = { z: 1, cx: 500, cy: 500 };
    const REST = W.landingAt(LIMB, A_CAR, CS, 1); // the car's ground point
    const near = (dx, dy) => [REST.x + dx * CS, REST.y + dy * CS]; // a place on the near ground, in car units from there
    // solo4's sky: the film's slow burst from under the limb, its stars (the same seed)
    function sky(g, t, c) {
        C.sunburst(g, c[0], c[1], { n: 12, rot: 0.2 + t * 0.03, a: '#0e0b2c', b: '#130f3a', R: Math.hypot(c[0] - 500, c[1] - 500) + 1000 }); // a radius that covers the frame wherever the centre is
        const r = Motion.rng('solo4-stars'), d = C.drawing(t);
        for (let i = 0; i < 74; i++) {
            const x = r() * 1000, y = r() * 760, sz = 5 + r() * 9, ph = Math.floor(r() * 12), big = i % 9 === 0;
            C.sparkle(g, x, y, sz * ((d + ph) % 12 < 2 ? 1.5 : 1) * (big ? 1.6 : 1), { color: i % 5 ? '#fffbe8' : '#ffe62e' });
        }
    }
    // the moon keeps the beat: it dips on each one and rocks a hair, and everything on it goes along
    const nodAt = (t, k) => {
        const P = S.pulseAt(t);
        return { dy: 7 * k * P.pulse, a: 0.007 * k * (P.k % 2 ? 1 : -1) * P.pulse };
    };
    /**
     * o: { nod 0..1, warm 0..1 (the cover's bands rising behind the limb), look [x, y] (the moon's eye),
     *      sun { x, y (world), r, k (0..1 risen) },
     *      behind(g, V)  on the limb behind the car;  parked: what the ride takes (the car as solo4
     *      parks it), or car(g, s): the car drawn by the shot, at its place (0, 0);
     *      front(g, V)   everybody on the surface;  over(g, V)  what is not on the moon }
     */
    function stage(g, t, cam, o = {}) {
        const V = view(cam), z = V.z, nd = nodAt(t, o.nod ?? 0);
        sky(g, t, V.P(LIMB.x, LIMB.y - 160));
        // the limb at the frame's sides is where the bands rise from
        const edge = LIMB.y - Math.sqrt(Math.max(0, LIMB.r * LIMB.r - Math.pow(Math.min(LIMB.r, 500 / z), 2)));
        Q.bands(g, o.warm ?? 0, V.P(0, edge)[1] + 6);
        // the Earth is far: it takes a share of the camera's move
        const e = earthAt(t), zf = lerp(1, z, 0.5), ep = V.P(e.x, e.y);
        earth(g, lerp(e.x, ep[0], 0.85), lerp(e.y, ep[1], 0.85) - 30 * (1 - z) / 0.2, e.r * zf, t);
        if (o.sun && o.sun.k > 0) {
            const p = V.P(o.sun.x, o.sun.y), r = o.sun.r * z;
            Q.sun(g, p[0], p[1] + (1 - o.sun.k) * r * 2.8, r, t);
        }
        g.save();
        g.translate(V.mn.x, V.mn.y + nd.dy * z);
        g.rotate(nd.a);
        g.translate(-V.mn.x, -V.mn.y);
        W.moon(g, V.mn.x, V.mn.y, V.mn.r, { rot: MOON_ROT, t, face: 1, wink: 1, smile: 0, look: o.look ?? [0.2, -0.9], flag: { a: FLAG_A - MOON_ROT, s: V.s, k: 1, t } });
        if (P4 && P4.whip && G4.flag.rot != null) {
            // solo4's glint down the planted rod (it stands behind the limb)
            const f = V.P(G4.flag.x, G4.flag.y);
            g.save();
            g.beginPath();
            g.rect(-400, -400, 1800, 1800);
            g.arc(V.mn.x, V.mn.y, V.mn.r, 0, TAU);
            g.clip('evenodd');
            P4.whip(g, f[0], f[1], V.s, G4.flag.rot, 1, t, true);
            g.restore();
        }
        const rest = W.landingAt(V.mn, A_CAR, V.s, 1), lk = landK(t), lo = { r: V.mn.r, rot: rest.rot, t };
        if (lk > 0) W.landing(g, rest.x, rest.y, V.s, lk, { ...lo, part: 'back' });
        if (o.behind) o.behind(g, V);
        if (o.parked && P4 && z === 1) P4.parked(g, t, o.parked); // solo4's own car, as it parks it
        else {
            g.save();
            g.translate(rest.x, rest.y);
            g.rotate(rest.rot);
            noWhip(g, V.s, () => (o.car ? o.car(g, V.s) : rideOn(g, t, V.s, o.parked ?? {})));
            g.restore();
        }
        if (o.front) o.front(g, V);
        if (lk > 0) W.landing(g, rest.x, rest.y, V.s, lk, { ...lo, part: 'front' });
        g.restore();
        if (o.over) o.over(g, V);
    }

    // =========================================================================================
    // The people on the surface
    // =========================================================================================
    const IMP = 0.67;
    /**
     * An imp at the screen point (x, y), s the figure unit. o: Devil.imp's pose (wear, mood, look,
     * armUp, hop, squash, tail) plus trident ('L' | 'R': the mitt that holds a foam trident; tilt
     * and tridentK, its pop), halo (0..1: a spare halo round its horns, popping; haloDy, haloTilt),
     * scarf (a colour: Weather's scarf and earmuffs, the office's imps)
     */
    function imp(g, x, y, s, o = {}) {
        const u = s * IMP, sq = o.squash ?? 0, hop = o.hop ?? 0, up = o.armUp ?? 0;
        const pose = { squash: sq, hop, mood: o.mood ?? 'grin', look: o.look ?? 0, wear: o.wear, armUp: up, tail: o.tail ?? 0, shadow: o.shadow };
        if (o.trident && (o.tridentK ?? 1) > 0) {
            const sd = o.trident === 'L' ? -1 : 1, hand = [sd * 0.66, -0.4 - up * 0.5];
            I.foamTrident(g, 3, x + (hand[0] + sd * 0.01) * u * (1 + sq), y - hop * u + (hand[1] - 0.03) * u * (1 - sq), u * (o.tridentK ?? 1), o.tilt ?? sd * 0.3);
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
        if (pose.spare && (pose.spareK ?? 1) > 0) {
            const sd = pose.spare === 'L' ? -1 : 1, h = angelPt(x, y, s, pose, sd < 0 ? pts.handR : pts.handL);
            Q.halo(g, h[0] + sd * 0.3 * s * (pose.spareK ?? 1), h[1] - 0.02 * s, s, { k: pose.spareK ?? 1, tilt: sd * (pose.spareTilt ?? 0.12) });
            Q.mitt(g, h[0], h[1], s, pose.who ?? 0, sd < 0 ? PI : 0);
        }
    }
    const skel = (g, x, y, s, t, o = {}) => I.fan(g, x, y, s, { kind: 'skeleton', hawk: K.pink, tee: 2, hold: 'none', t, ...o });
    const wingBeat = (t, ph0) => (opt('Solo3Props') ? Solo3Props.beatWing(t, ph0).flap : W.flap(t));
    const WEAR = ['specs', 'bow', undefined];
    // The order solo4 draws the seven in (back to front), so nobody changes place in the pile when
    // this block takes them over. Solo4Props does not export it: it is read off Solo4Props.company
    // itself, run once on a canvas that draws nothing and only notes where each figure is put.
    const ORDER = (() => {
        const ids = Object.keys(STAND), fallback = ['h3', 'h2', 'h1', 'h0', 'a0', 'a2', 'a1'].filter((id) => ids.includes(id));
        if (!P4) return fallback;
        if (Array.isArray(P4.IDS)) return P4.IDS;
        try {
            const seen = [], noop = () => {};
            const fake = new Proxy({}, {
                get: (_, name) => {
                    if (name === 'translate') return (x, y) => {
                        const id = ids.find((k) => Math.abs(STAND[k].x - x) < 1e-6 && Math.abs(STAND[k].y - y) < 1e-6);
                        if (id && !seen.includes(id)) seen.push(id);
                    };
                    if (name === 'getTransform') return () => ({ a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 });
                    if (name === 'measureText') return () => ({ width: 0 });
                    if (name === 'canvas') return { width: 1000, height: 1000 };
                    return noop;
                },
                set: () => true,
            });
            P4.company(fake, T0);
            return seen.length === ids.length ? seen : fallback;
        } catch (e) {
            return fallback;
        }
    })();
    // The seven on their marks as solo4 leaves them (Solo4Props.stander's own poses), by id
    function marks(t) {
        const P = S.pulseAt(t), p = P.pulse, ph = P.k + P.since;
        const ang = (who) => (P4 ? P4.angelPose(who, t) : { who, mood: 'rock', harp: who === 0, trumpet: who === 1, flap: 0.15, shadow: true, squash: 0.03 * p });
        const im = (i) => ({ wear: WEAR[i], mood: 'grin', look: 1, squash: 0.05 * p, armUp: (P.k + i) % 2 ? 0.25 + 0.75 * p : 0.2, tail: 0.05 * Math.sin(ph * PI + i) });
        return {
            h3: { kind: 'skel', at: STAND.h3, pose: { hype: 0.55, look: 1 } },
            h0: { kind: 'imp', at: STAND.h0, pose: im(0) }, h1: { kind: 'imp', at: STAND.h1, pose: im(1) }, h2: { kind: 'imp', at: STAND.h2, pose: im(2) },
            a0: { kind: 'angel', at: STAND.a0, pose: ang(0) }, a1: { kind: 'angel', at: STAND.a1, pose: ang(1) }, a2: { kind: 'angel', at: STAND.a2, pose: ang(2) },
        };
    }
    // Where the seven dance on the near ground (world): [x, y]
    const POS = {
        mixed: { h1: near(-3.9, 2.4), a0: near(-2.55, 2.65), h2: near(-1.4, 2.35), h0: near(-0.35, 2.75), a2: near(1.05, 2.75), h3: near(2.4, 2.35), a1: near(3.85, 2.4) },
        right: { h2: near(3.2, 2.35), a0: near(4.55, 2.35), h3: near(5.95, 2.35), a1: near(7.4, 2.4), h0: near(3.9, 3.5), a2: near(5.5, 3.55), h1: near(7.0, 3.5) },
    };
    const MEET = { h0: near(-0.75, 2.45), a2: near(1.0, 2.5) }; // where the two walk to in bar 167
    // the seven dancing together at their places p (world): what each does on the beat at t
    function dancers(t, p, o = {}) {
        const P = S.pulseAt(t), ph = P.k + P.since, pu = P.pulse, even = P.k % 2 === 0, hy = o.hype ?? 1;
        const hop = (ph0, amp = 0.16) => amp * hy * Math.sin(PI * Math.min(1, (((P.since + ph0) % 1) + 1) % 1));
        return [
            { id: 'h1', kind: 'imp', at: p.h1, pose: { wear: 'bow', mood: 'grin', armUp: even ? 1 : 0.5, hop: hop(0), squash: 0.06 * pu, tail: 0.05 * Math.cos(ph * PI), look: 0.6 } },
            { id: 'h2', kind: 'imp', at: p.h2, pose: { mood: 'grin', armUp: even ? 0.5 : 1, hop: hop(0.5), squash: 0.06 * pu, tail: -0.05 * Math.cos(ph * PI), look: -0.4 } },
            { id: 'h0', kind: 'imp', at: p.h0, pose: { wear: 'specs', mood: 'grin', armUp: 1, hop: hop(0), squash: 0.06 * pu, tail: 0.05 * Math.cos(ph * PI), look: 1, halo: 1, haloDy: 0.1 * pu, haloTilt: 0.2 + 0.1 * Math.cos(ph * PI) } },
            { id: 'h3', kind: 'skel', at: p.h3, pose: { hype: hy, look: -0.5 } },
            { id: 'a0', kind: 'angel', at: p.a0, pose: { who: 0, mood: 'rock', harp: true, strum: Math.cos(ph * TAU), flap: wingBeat(t, 0), squash: 0.04 * pu, headDy: 0.03 * pu, headTilt: 0.06 * Math.sin(ph * PI), haloUp: 0.7 * pu, halo: 0.1 * Math.sin(ph * PI), lift: 0.5 * hop(0.25) } },
            { id: 'a1', kind: 'angel', at: p.a1, pose: { who: 1, mood: 'rock', trumpet: true, armUp: 0.35 + 0.65 * pu, flap: wingBeat(t, 0.25), squash: 0.04 * pu, headDy: 0.02 * pu, haloUp: 0.7 * pu, halo: -0.1 * Math.sin(ph * PI), lean: -0.1 - 0.05 * pu, lift: 0.5 * hop(0.75) } },
            { id: 'a2', kind: 'angel', at: p.a2, pose: { who: 2, mood: 'rock', armUp: 0.55 + 0.45 * pu, handR: even ? [-0.52, -0.52] : [-0.56, -1.2 - 0.62 * (0.4 + 0.6 * pu)], flap: wingBeat(t, 0.5), squash: 0.04 * pu, headDy: 0.03 * pu, headTilt: even ? 0.06 : -0.06, haloUp: pu, halo: 0.14 * Math.sin(ph * PI), trident: 'R', tilt: 0.1 + 0.14 * Math.cos(ph * PI), lift: 0.6 * hop(0) } },
        ];
    }
    // draw people (a list of { kind, at: [x, y] | { x, y, rot }, pose }) through the view V, in the list's order
    function people(g, V, t, list) {
        for (const m of list) {
            const w = Array.isArray(m.at) ? { x: m.at[0], y: m.at[1], rot: 0 } : m.at, [x, y] = V.P(w.x, w.y), s = V.s, lift = (m.pose.lift ?? 0) * s;
            g.save();
            g.translate(x, y);
            g.rotate(w.rot ?? 0);
            if (m.kind === 'imp') imp(g, 0, 0, s, m.pose);
            else if (m.kind === 'skel') skel(g, 0, 0, s, t, m.pose);
            else {
                // an angel that leaves the ground keeps its shadow there
                if (lift > 0.3 && m.pose.shadow !== false) {
                    g.fillStyle = 'rgba(36,21,49,0.28)';
                    g.beginPath();
                    g.ellipse(0.05 * s, 0, 0.56 * s * (1 - (m.pose.lift ?? 0)), 0.06 * s, 0, 0, TAU);
                    g.fill();
                }
                angel(g, 0, -lift, s, { ...m.pose, shadow: lift <= 0.3 && m.pose.shadow !== false });
            }
            g.restore();
        }
    }
    const byDepth = (list) => list.slice().sort((p, q) => (Array.isArray(p.at) ? p.at[1] : p.at.y) - (Array.isArray(q.at) ? q.at[1] : q.at.y));

    // the car at rest, playing: the ride as solo4 parks it. o: what Finale.ride takes, plus
    // wind: { tom, devil, devilFrom } the windmills' angles on this drawing
    const rideOn = (g, t, s, o = {}) => {
        const { wind, ...ro } = o, P = S.pulseAt(t);
        // (as Solo4Props.parked: the Devil soloing with the neck up unless the shot says otherwise)
        if (!wind) return F.ride(g, t, 0, 0, s, { spin: SPIN, shadow: true, exhaust: 0, ...ro, devil: { solo: 1, shred: 0.6, ...(ro.devil ?? {}) } });
        const dv = { mood: 'laugh', squash: -0.05, headTilt: -0.05, solo: 0.5, ...(ro.devil ?? {}) };
        F.ride(g, t, 0, 0, s, { spin: SPIN, shadow: true, exhaust: 0, ...ro, devil: { ...dv, strum: NaN }, pose: { ...(ro.pose ?? {}), tom: { ...(ro.pose?.tom ?? {}), windmill: wind.tom, squash: -0.05 }, stan: { snare: 0, hat: 0, crash: 0, headDy: -0.05 } } });
        const hx = F.HOOD[0] * s, hy = (F.HOOD[1] + (ro.bounce ?? 0) * 0.1) * s;
        Q.strapEnd(g, hx, hy, s, dv);
        Q.windmill(g, hx, hy, s, wind.devil, { lean: dv.lean, squash: dv.squash, solo: dv.solo, from: wind.devilFrom });
    };
    // the windmill's angle on each drawing of its wind-up (four drawings, down on the chord): Tom's
    // strumming arm (Cast.tom's `windmill`) and the Devil's picking arm, mirrored
    const WM_TOM = [-PI * 0.5, -PI * 0.95, -PI * 1.5, -PI * 1.9], WM_DEV = [70, -8, -88, -128].map((a) => (a * PI) / 180);
    const windAt = (t, chord) => {
        const i = dr(t, chord - 4 / 12);
        return on(t, chord - 4 / 12) && !on(t, chord) ? { tom: WM_TOM[i], devil: WM_DEV[i], devilFrom: i > 0 ? WM_DEV[i - 1] : (118 * PI) / 180 } : null;
    };

    // =========================================================================================
    // 1 · Two crowds (bar 167)
    // =========================================================================================
    const SEEN = T0 + 2 * FR, HOPS = [at(1), at(2), at(3)], FLY = at(2), FLY_END = T_SWAP - 2 * FR;
    function apart(g, t) {
        const P = S.pulseAt(t), ph = P.k + P.since, pu = P.pulse, alive = smooth(seg(t, T0, T0 + 0.5)), m = marks(t);
        const st = go(t, SEEN, 2 / 12), seen = st > 0; // from the second drawing on they have seen each other
        if (!seen && P4) return P4.moonScene(g, t); // until then the picture is solo4's own, whatever it is
        if (seen) {
            // the fans stop and stare across the car; the angels open one eye
            m.h3.pose = { hype: lerp(0.55, 0.08, st), look: 1, headTilt: 0.06 * st };
            m.h1.pose = { ...m.h1.pose, mood: 'awe', armUp: lerp(m.h1.pose.armUp, 0.15, st), squash: 0.03 * pu };
            m.h2.pose = { ...m.h2.pose, mood: on(t, HOPS[0]) ? 'awe' : 'oops', armUp: lerp(m.h2.pose.armUp, 0.15, st), squash: 0.03 * pu };
            m.a0.pose = { who: 0, mood: 'peek', harp: true, handR: [-0.17, -0.5], strum: 0, flap: 0.15, shadow: true, squash: 0.03 * pu, headDy: 0.02 * pu, headTilt: -0.07 * st, lean: 0.05 * st, halo: 0.12 * st };
            m.a1.pose = { who: 1, mood: 'peek', trumpet: true, handR: [-0.5, -0.5], flap: 0.15, shadow: true, squash: 0.03 * pu, headDy: 0.02 * pu, headTilt: -0.06 * st, lean: 0.06 * st, halo: -0.1 * st };
            m.a2.pose = { who: 2, mood: 'peek', handR: [-0.5, -0.55], handL: [0.5, -0.55], flap: 0.15, shadow: true, squash: 0.03 * pu, headDy: 0.02 * pu, headTilt: -0.08 * st, lean: 0.03 * st, halo: 0.1 * st };
            // the imp in specs brings a foam trident out from behind him and hops out into the open, three hops
            const from = STAND.h0, to = MEET.h0, n = HOPS.filter((h) => on(t, h)).length, u = n ? go(t, HOPS[n - 1], 3 / 12) : 0, k = n ? (n - 1 + smooth(u)) / 3 : 0;
            m.h0.at = { x: lerp(from.x, to[0], k), y: lerp(from.y, to[1], k), rot: from.rot * (1 - seg(k, 0, 0.5)) };
            m.h0.pose = { wear: 'specs', mood: 'grin', look: 1, armUp: lerp(m.h0.pose.armUp, 0.9, go(t, HOPS[0], 1 / 12)), hop: n ? 0.5 * Math.sin(PI * u) : 0, squash: 0.03 * pu + (n && u >= 1 ? 0.12 * hit(t, HOPS[n - 1] + 3 / 12, 0.17) : 0), tail: 0.05 * Math.cos(ph * PI),
                trident: on(t, HOPS[0]) ? 'R' : null, tridentK: S.pop(t, HOPS[0], 0.2), tilt: 0.34 - 0.1 * Math.sin(PI * u) };
            // the ginger angel flies down to meet him
            if (on(t, FLY)) {
                const f = go(t, FLY, FLY_END - FLY), e = smooth(f), p = arc([STAND.a2.x, STAND.a2.y], MEET.a2, e, 50);
                m.a2.at = { x: p[0], y: p[1], rot: STAND.a2.rot * (1 - e) };
                m.a2.pose = { ...m.a2.pose, mood: f < 1 ? 'rock' : 'peek', armUp: 0.3, handR: [-0.5, -0.55], flap: f < 1 ? W.flap(t, 3) : 0.2, shadow: f >= 1, lean: -0.1 * Math.sin(PI * f), headTilt: -0.05, squash: f >= 1 ? 0.1 * hit(t, FLY_END, 0.17) : 0 };
            }
        }
        // solo4's order on the marks; whoever has left a mark is nearer than all of them
        const left = [m.h0, m.a2].filter((q, i) => q.at !== STAND[i ? 'a2' : 'h0']);
        const order = ORDER.map((id) => m[id]).filter((q) => !left.includes(q)).concat(left);
        stage(g, t, WIDE, {
            nod: alive * (seen ? 1 : 0), look: [-0.3, -0.9],
            parked: { bounce: 0.25 * pu * st },
            front: (c, V) => people(c, V, t, order),
        });
    }

    // =========================================================================================
    // 2 · The swap (bar 168): close on the two, at s = 200, the limb and the sky behind them
    // =========================================================================================
    const OFFER = at(5), SWAP = at(6), HOP = at(7), SW = 200;
    function swap(g, t) {
        const P = S.pulseAt(t), ph = P.k + P.since, pu = P.pulse, d = C.drawing(t), s = SW, u = s * IMP;
        const mr = (LIMB.r * SW) / CS, mn = { x: 430, y: 706 + mr, r: mr };
        const IX = 306, IY = 846, AX = 676, AY = 852;
        sky(g, t, [500, 1300]);
        earth(g, 180, 250, 96, t);
        W.moon(g, mn.x, mn.y, mn.r, { rot: MOON_ROT + 0.2, t });
        // the swap's own star, behind the two
        const sb = S.pop(t, SWAP, 0.25);
        if (sb > 0) C.burst(g, 506, 590, { r0: 250 * sb, r1: 330 * sb * (1 + 0.03 * pu), n: 15, seed: 'solo5-swap', jitter: 0.14, rot: d % 4 < 2 ? 0 : 0.03, fill: K.pink, ink: K.ink, lw: 5 });
        // who watches: the imp with the bow from the left, the harp's angel from the right
        const cheer = on(t, SWAP + 3 / 12), beatHop = cheer ? 0.14 * Math.sin(PI * Math.min(1, P.since - Math.floor(P.since))) : 0;
        imp(g, 112, 800, s * 0.8, { wear: 'bow', mood: cheer ? 'grin' : 'awe', look: 1, armUp: cheer ? 1 : 0.15, hop: beatHop, squash: 0.04 * pu });
        angel(g, 912, 792, s * 0.8, cheer
            ? { who: 0, mood: 'rock', harp: true, strum: Math.cos(ph * TAU), flap: wingBeat(t, 0.3), squash: 0.03 * pu, headDy: 0.02 * pu, headTilt: -0.06 }
            : { who: 0, mood: on(t, OFFER) ? 'shocked' : 'peek', harp: true, handR: [-0.17, -0.5], handL: [0.43, -0.5], flap: 0.2, squash: 0.03 * pu, headDy: 0.02 * pu, headTilt: -0.08 });
        // --- the two ---------------------------------------------------------------------------
        const fly = go(t, SWAP, 3 / 12), done = fly >= 1, hop = on(t, HOP) ? Math.sin(PI * Math.min(1, (twos(t, HOP) - HOP) / 0.25)) : 0;
        const offer = back(go(t, OFFER, 3 / 12));
        // her poses: one eye on the trident; she holds a spare halo out; she takes the trident high
        const aPose = done
            ? { who: 2, mood: 'rock', armUp: 0.7 + 0.3 * pu, handR: [-0.5, -0.56], flap: wingBeat(t, 0), squash: 0.04 * pu + 0.08 * hit(t, HOP + 0.25, 0.17), headDy: 0.03 * pu, headTilt: -0.05, haloUp: pu, halo: 0.14 * Math.sin(ph * PI), lean: -0.03 }
            : { who: 2, mood: fly > 0 ? 'shocked' : 'peek', flap: 0.2 + 0.5 * offer * (1 - go(t, OFFER, 5 / 12)) + (fly > 0 ? 0.6 : 0), squash: 0.03 * pu, headDy: 0.02 * pu, headTilt: -0.08, lean: -0.02 - 0.03 * offer, halo: 0.1,
                handR: fly > 0 ? [-0.7, -1.56] : [lerp(-0.5, -0.7, offer), lerp(-0.56, -1.5, offer)], handL: fly > 0 ? [0.56, -1.5 - 0.3 * fly] : [0.5, -0.55] };
        const alift = 0.2 * hop, ay = AY - alift * s;
        // his: the trident held out, then both mitts up under the halo
        const iPose = { wear: 'specs', mood: !done && on(t, OFFER) ? 'awe' : 'grin', look: 1, squash: 0.04 * pu + 0.09 * hit(t, HOP + 0.25, 0.17), hop: 0.34 * hop + (!on(t, OFFER) ? 0.08 * pu : 0), armUp: done ? 1 : 0.85, tail: 0.06 * Math.cos(ph * PI) };
        // where the two gifts are: in their mitts, in the air (three drawings), in their new places
        const iMitt = [IX + 0.67 * u, IY - iPose.hop * u - (0.4 + iPose.armUp * 0.5 + 0.03) * u], aPts = W.angelPoints(aPose);
        const aGive = angelPt(AX, ay, s, aPose, aPts.handR), aTake = angelPt(AX, ay, s, aPose, done ? aPts.handL : [0.56, -1.8]);
        const haloHome = [IX + 0.05 * u, IY - iPose.hop * u - 1.13 * u];
        if (alift > 0.005) {
            g.fillStyle = 'rgba(36,21,49,0.28)';
            g.beginPath();
            g.ellipse(AX + 0.05 * s, AY, 0.56 * s * (1 - alift), 0.06 * s, 0, 0, TAU);
            g.fill();
        }
        if (fly > 0 && !done) {
            const tp = arc(iMitt, aTake, fly, 290), hp = arc([aGive[0] - 0.3 * s, aGive[1]], haloHome, fly, 90);
            Q.halo(g, hp[0], hp[1], s, { k: 0.86, tilt: 0.12 - 2.4 * fly, part: 'back' });
            imp(g, IX, IY, s, iPose);
            Q.halo(g, hp[0], hp[1], s, { k: 0.86, tilt: 0.12 - 2.4 * fly, part: 'front' });
            angel(g, AX, ay, s, { ...aPose, shadow: alift <= 0.005 });
            I.foamTrident(g, 3, tp[0], tp[1], u, 0.3 + TAU * fly);
            // ticks where each left a mitt
            for (const [px, py] of [iMitt, aGive]) for (let i = 0; i < 5; i++) {
                const a = -PI / 2 + (i - 2) * 0.5, r0 = 0.2 * s + 40 * fly, r1 = r0 + 0.11 * s;
                C.poly(g, [[px + Math.cos(a) * r0, py + Math.sin(a) * r0], [px + Math.cos(a) * r1, py + Math.sin(a) * r1]], { ink: K.white, lw: 4, close: false });
            }
        } else if (!done) {
            imp(g, IX, IY, s, { ...iPose, trident: 'R', tilt: 0.3 + 0.05 * Math.cos(ph * PI) });
            // the spare halo comes out from behind her on the second beat
            angel(g, AX, ay, s, { ...aPose, spare: on(t, OFFER) ? 'L' : null, spareK: S.pop(t, OFFER, 0.2) });
            const k = hit(t, OFFER, 0.34);
            if (k > 0) for (const [dx, dy, r] of [[-0.66, -0.2, 22], [-0.2, -0.32, 15], [0.04, 0.16, 12]]) C.sparkle(g, aGive[0] + dx * s, aGive[1] + dy * s, r * (1.6 - k), { color: K.white, ink: K.ink, lw: 2 });
        } else {
            const land = hit(t, SWAP + 3 / 12, 0.25);
            imp(g, IX, IY, s, { ...iPose, halo: 1, haloDy: 0.08 * pu - 0.1 * land, haloTilt: 0.2 + 0.12 * Math.cos(ph * PI) });
            angel(g, AX, ay, s, { ...aPose, trident: 'R', tilt: 0.1 + 0.12 * Math.cos(ph * PI), shadow: alift <= 0.005 });
            // twinkles on the halo's new head
            for (const [dx, dy, r, f] of [[-0.62, -0.2, 20, 0], [0.6, -0.34, 16, 1], [0.08, -0.62, 13, 2]]) if ((d + f) % 3 !== 0) C.sparkle(g, haloHome[0] + dx * u, haloHome[1] + dy * u, r, { color: K.white, ink: K.ink, lw: 2 });
        }
    }

    // =========================================================================================
    // 3 · Together (bar 169)
    // =========================================================================================
    function together(g, t) {
        const P = S.pulseAt(t), pu = P.pulse;
        stage(g, t, WIDE, { nod: 1.3, look: [0.3 * (P.k % 2 ? 1 : -1), -0.9], parked: { bounce: 0.4 * pu, cactus: { wheel: null, wave: P.k % 2 ? pu : -pu } }, front: (c, V) => people(c, V, t, byDepth(dancers(t, POS.mixed))) });
    }

    // =========================================================================================
    // 4, 5 · On the car (bars 170–172): a camera of its own, the car drawn where it is asked
    // =========================================================================================
    const SEATS = Rides.bandCarSeats();
    const MIKE_AT = [0.18, 0.2], TOM_BACK = [1.3, 0.8], TOM_UP = [1.36, 0.2];
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
     *   o: { mike, tom, devil: poses merged over the beat's;  tomAt: [x along the car, z];
     *        hop: { mike, tom, devil } (figure units off the deck), cactus: { side, k, lean },
     *        solo (Mike's), bounce, pose (the others') }
     * Returns { hood: [x, y] the Devil's ground point, dp: his pose }.
     */
    function ride(g, t, x, y, s, o = {}) {
        const P = S.pulseAt(t), ph = P.k + P.since, pz = Rig.playing(t, { sing: true, solo: o.solo ?? 0.6 }), bn = o.bounce ?? 0.25 * P.pulse;
        const tomAt = o.tomAt ?? TOM_UP, far = tomAt[1] > 0.5, cac = opt('Verse2aProps'), hp = o.hop ?? {};
        const place = (g2, sc0, [px, pz2], lift, fn) => Rides.at(g2, sc0, [px, SEATS.deckY - 0.04 - 0.2 * pz2 - lift, pz2], fn);
        const tom = (g2, sc0) => place(g2, sc0, tomAt, hp.tom ?? 0, (px, py, sc) => Cast.tom(g2, px, py, sc, { ...pz.tom, ...(o.tom ?? {}) }));
        const mike = (g2, sc0) => place(g2, sc0, MIKE_AT, hp.mike ?? 0, (px, py, sc) => BandStrings.mike(g2, px, py, sc, { ...pz.mike, ...(o.mike ?? {}) }));
        const arms = Q.conduct(o.cactus?.side ?? 0, o.cactus?.k ?? Math.cos(ph * PI));
        g.save();
        g.translate(x, y);
        noWhip(g, s, () => Rig.band(g, t, 0, 0, s, {
            tomDrives: false, sing: true, shadow: true, exhaust: 0, spin: SPIN, bounce: bn, solo: o.solo ?? 0.6, aboard: { tom: 0, mike: 0 }, pose: o.pose,
            driver: (g2, sc) => (cac ? Verse2aProps.cactus(g2, 0, 0, sc, { shades: 0, squash: 0.05 * P.pulse, mouth: 'smile', lean: o.cactus?.lean ?? 0, ...arms }) : Chorus1Props.cactus(g2, 0, 0, sc, { shades: 1, squash: 0.05 * P.pulse, wheel: null })),
            cockpit: {
                back: (g2, sc0) => {
                    if (far) tom(g2, sc0);
                    mike(g2, sc0);
                },
                front: (g2, sc0) => {
                    if (!far) tom(g2, sc0);
                },
            },
        }));
        g.restore();
        // the Devil on the hood, as Finale.ride stands him
        const hx = x + F.HOOD[0] * s, hy = y + (F.HOOD[1] + bn * 0.1 - (hp.devil ?? 0)) * s;
        const dp = { mood: 'grin', look: -1, shadow: false, squash: 0.045 * P.pulse, headDy: 0.02 * P.pulse, tail: 0.05 * Math.sin(ph * PI), strum: Math.cos(ph * TAU), fret: 0.2 + 0.3 * (Math.floor(ph / 2) % 3), solo: 0.5, flames: 1, shred: 0, t, ...(o.devil ?? {}) };
        I.devilGuitar(g, hx, hy, s, dp);
        return { hood: [hx, hy], dp };
    }
    // the moon under a car drawn at (x, y, s), upright: its limb, the flag, the tracks. Returns
    // what goes over the wheels (the near dust), to call after the car.
    function ground(g, t, x, y, s, o = {}) {
        const r = (LIMB.r * s) / CS, mn = { x, y: y + Math.sqrt(r * r - 3.55 * s * 3.55 * s), r }, turn = MOON_ROT - A_CAR, lk = landK(t);
        sky(g, t, [mn.x, mn.y - (160 * s) / CS]);
        if (o.earth) earth(g, o.earth[0], o.earth[1], o.earth[2], t);
        W.moon(g, mn.x, mn.y, r, { rot: turn, t, face: 1, wink: 1, flag: { a: FLAG_A - A_CAR - turn, s, k: 1, t } });
        if (lk > 0) W.landing(g, x, y, s, lk, { r, rot: 0, t, part: 'back' });
        return () => lk > 0 && W.landing(g, x, y, s, lk, { r, rot: 0, t, part: 'front' });
    }
    // a phrase as notes: they leave one guitar and arc over the windshield to the other player
    function phrase(g, t, from, to, a, dur, col, n) {
        for (let i = 0; i < n; i++) {
            const born = a + (i * dur * 0.8) / n, age = since(t, born);
            if (age < 0) continue;
            const u = age / (dur * 0.9 + 0.25);
            if (u >= 1) continue;
            const p = arc(from, to, u, 230 + 30 * (i % 2)), k = Math.min(1, 0.6 + u * 4) * (1 - smooth(seg(u, 0.78, 1)));
            C.note(g, p[0], p[1], 40 * k, { color: col, ink: K.ink, lw: 3, kind: i % 3 === 1 ? 2 : 1, rot: (Math.round(age * 12) % 2 ? 0.16 : -0.14) });
        }
    }
    const SHRED = [0, 0.7, -0.5, 0.9, 0.2, -0.8];

    const TX = 150, TY = 936, TS = 150; // the trade's car
    function trade(g, t) {
        const P = S.pulseAt(t), ph = P.k + P.since, pu = P.pulse, d = C.drawing(t), tu = turnAt(t), s = TS;
        const inn = go(t, tu.from, 2 / 12), mk = tu.who === 'm' ? inn : 1 - inn, dk = 1 - mk; // how far each is into his phrase
        g.save();
        g.translate(0, 4 * pu);
        const dust = ground(g, t, TX, TY, s, { earth: [846, 196, 70] });
        // Mike: neck up, eyes shut, the fretting mitt running; listening, he grins at the Devil
        const mike = mk > 0.5
            ? { fret: clamp(0.5 + 0.5 * SHRED[((d % 6) + 6) % 6]), strum: d % 2 ? 1 : -1, lean: -0.04, squash: 0.04 * pu, headTilt: -0.04 }
            : { strum: 0.2, fret: 0.3, eyes: 'open', mouth: 'grin', lean: 0.03, headTilt: 0.07, squash: 0.045 * pu, headDy: 0.03 * pu };
        // the Devil: the same, mirrored
        const devil = dk > 0.5
            ? { solo: lerp(0.3, 1, dk), shred: 1, flames: 1, mood: 'grin', look: -1, strum: d % 2 ? 1 : -1, fret: 0.5, squash: 0.04 * pu }
            : { solo: 0.2, shred: 0, flames: 0.5, mood: 'sly', look: -1, strum: 0.2, fret: 0.25, headTilt: -0.07, squash: 0.045 * pu, step: P.k % 2 ? 1 : -1, tail: 0.08 * Math.sin(ph * PI) };
        // Tom, behind and between: he follows the phrase like a rally, then hops to the front
        const up = go(t, STEP_UP, 3 / 12), side = tu.who === 'm' ? -1 : 1;
        const tomAt = [lerp(TOM_BACK[0], TOM_UP[0], up), lerp(TOM_BACK[1], TOM_UP[1], up)];
        const tom = { headTilt: 0.1 * side * inn, lean: 0.035 * side * inn, squash: 0.045 * pu + 0.1 * hit(t, STEP_UP + 3 / 12, 0.17) };
        const R = ride(g, t, TX, TY, s, { solo: mk, mike, devil, tom, tomAt, hop: { tom: 0.42 * Math.sin(PI * up) }, cactus: { side, k: Math.cos(ph * PI), lean: 0.09 * side * inn }, bounce: 0.2 * pu });
        dust();
        // the phrases, in each player's colour: off his headstock, over Tom and the cactus, down to the other's head
        const mp = BandStrings.points('mike', { ...mike, solo: mk }), mAt = [TX + (MIKE_AT[0] + 0.06 + mp.headstock[0]) * s, TY + (SEATS.deckY - 0.08 + mp.headstock[1]) * s];
        const gp = I.guitarPoints(R.dp), dAt = [R.hood[0] + gp.headstock[0] * s, R.hood[1] + gp.headstock[1] * s];
        for (let i = 0; i < TURNS.length - 1; i++) {
            const [a, who] = TURNS[i], dur = TURNS[i + 1][0] - a;
            if (!on(t, a)) continue;
            if (who === 'm') phrase(g, t, [mAt[0] + 0.1 * s, mAt[1] - 0.4 * s], [R.hood[0] - 0.1 * s, R.hood[1] - 2.75 * s], a, dur, K.gold, dur > 0.5 ? 4 : 2);
            else phrase(g, t, [dAt[0] - 0.1 * s, dAt[1] - 0.4 * s], [TX + (MIKE_AT[0] + 0.1) * s, TY - 3.1 * s], a, dur, K.pink, dur > 0.5 ? 4 : 2);
        }
        g.restore();
    }

    const LX = 492, LY = 806, LS = 90; // the line's car
    function line3(g, t) {
        const P = S.pulseAt(t), ph = P.k + P.since, pu = P.pulse, d = C.drawing(t), s = LS, even = P.k % 2 === 0;
        // the three jump together: off the deck between the beats, down on each one
        const fr = P.since - Math.floor(P.since), jump = 0.5 * Math.sin(PI * Math.min(1, fr * 1.15)), landed = 0.1 * pu * (jump < 0.05 ? 1 : 0);
        const sway = (even ? -1 : 1) * 0.06;
        g.save();
        g.translate(0, 5 * pu);
        const dust = ground(g, t, LX, LY, s, { earth: [128, 300, 50] });
        const fret = clamp(0.5 + 0.5 * SHRED[((d % 6) + 6) % 6]);
        const R = ride(g, t, LX, LY, s, {
            solo: 1, bounce: 0.6 * pu, tomAt: TOM_UP, cactus: { side: 0, k: Math.cos(ph * PI) }, hop: { mike: jump, tom: jump, devil: jump },
            mike: { fret, strum: d % 2 ? 1 : -1, lean: sway, squash: landed },
            tom: { fret, strum: d % 2 ? 1 : -1, lean: sway - 0.05, squash: landed, headTilt: -0.04 },
            devil: { solo: 1, shred: 1, flames: 1, mood: 'laugh', lean: sway * 0.6, squash: landed, fret: 0.5, strum: d % 2 ? 1 : -1 },
            pose: { stan: { crash: even ? pu : 0, kick: pu, snare: even ? 0 : pu, mouth: 'grin' }, ben: { press: 1, squash: 0.07 * pu, headDy: 0.05 * pu }, howie: { squash: 0.07 * pu, headDy: 0.04 * pu } },
        });
        dust();
        // the angels overhead, playing along
        if (opt('Solo3Props')) Solo3Props.escort(g, t, LX, LY, s, { at: { 0: [-0.5, -0.5], 1: [-0.1, -0.9], 2: [0.6, -7.1] } });
        // one line, three guitars: the same notes off each of them, together
        for (const [nx, ny] of [[LX + (MIKE_AT[0] + 0.5) * s, LY - 3.0 * s], [LX + (TOM_UP[0] + 0.6) * s, LY - 3.0 * s], [R.hood[0] - 0.7 * s, R.hood[1] - 2.2 * s]]) {
            for (let k = P.k - 2; k <= P.k; k++) {
                if (b(k) < T_LINE - 1e-6) continue;
                const age = (twos(t, b(k)) - b(k)) / S.BEAT;
                if (opt('Solo3Props')) Solo3Props.note(g, nx, ny - jump * s * (k === P.k ? 1 : 0), s, age, { v: [0.12, -0.75], life: 1.6, size: 0.36, kind: k % 2 ? 2 : 1, seed: k, color: K.gold });
            }
        }
        g.restore();
    }

    // =========================================================================================
    // 6 · Everybody (bars 173–175): wide and wider, the arrivals on the beats
    // =========================================================================================
    const H_LAND = at(26), SUN_UP = at(28), SIGN_IN = at(29), SIGN_LAND = at(31), CONE_IN = at(31), CONE_LAND = at(33), WIND = T_POSTER - 4 / 12;
    const HEARSE = near(-1.2, 3.15); // where it comes to rest on the near ground (world)
    const SIGN = onLimb(REST.x - 5.9 * CS), CONE = onLimb(REST.x + 6.5 * CS), SUN = { x: REST.x + 7.9 * CS, y: onLimb(REST.x + 7.9 * CS).y - 6, r: 42 };
    const camWide = (t) => {
        const u = seg(t, T_WIDE, T_POSTER), e = 1 - Math.pow(1 - u, 1.5);
        return { z: lerp(0.94, 0.8, e), cx: 500, cy: lerp(552, 782, e) };
    };
    // The hearse with the chauffeur in his scarf, the rain machine on its hitch and the office's
    // three imps aboard, at the screen point (x, y), scale s. o: { lean, bounce, spin, up (0..1
    // every mitt in the air), crank, hype (their hops) }
    const OFFICE = [['specs', K.yellow], ['hat', K.green], ['bow', K.violet]];
    function hearse(g, t, x, y, s, o = {}) {
        const P = S.pulseAt(t), ph = P.k + P.since, pu = P.pulse, Wt = opt('Weather'), ho = { lean: o.lean ?? 0, bounce: o.bounce ?? 0 }, up = o.up ?? 0;
        const hopI = (ph0) => 0.14 * Math.sin(PI * Math.min(1, (((P.since + ph0) % 1) + 1) % 1)) * (o.hype ?? 1);
        if (Wt) {
            // thawed and idling: its needles tick, a puff climbs the funnel on every other beat
            const tow = Wt.towedAt(x, y, s, ho);
            Wt.machine(g, tow.x, tow.y, s, { towed: true, t, pitch: tow.pitch, crank: o.crank ?? 0.7, needles: 0.5 + 0.4 * Math.sin(ph * PI), smoke: 0.6, puff: P.k % 2 ? 0 : pu, shadow: o.shadow, spin: o.spin ?? 0 });
        }
        Rides.hearse(g, x, y, s, { spin: o.spin ?? 0, bounce: ho.bounce, lean: ho.lean, flames: 0.5, t, shadow: o.shadow }, (g2, seats, sc0) => {
            // the three ride the roof, where their boss used to: two on the lid, one on his platform
            [[-1.9, -1.68, 0, 0.5], [-0.95, -1.76, 1, 0.25], [0.1, seats.devil[1], 2, 0]].forEach(([dx, py0, i, ph0]) => {
                Rides.at(g2, sc0, [seats.devil[0] + dx, py0, 0.45], (px, py, sc) => imp(g2, px, py, sc, { wear: OFFICE[i][0], scarf: OFFICE[i][1], armUp: Math.max(up, (P.k + i) % 2 ? 1 : 0.4 + 0.6 * pu), hop: hopI(ph0), squash: 0.05 * pu, look: 1, shadow: false, t, tail: 0.05 * Math.cos(ph * PI + i) }));
            });
            Rides.at(g2, sc0, seats.chauffeur, (px, py, sc) => {
                // he waves his free arm; with `up`, both
                const hands = { r: [-0.6, -1.5 - 0.1 * Math.cos(ph * PI)], ...(up > 0.5 ? { l: [0.6, -1.5 + 0.1 * Math.cos(ph * PI)] } : {}) };
                const pose = { shadow: false, jaw: 0.3 + 0.6 * pu, headDy: 0.02 * pu, headTilt: 0.05 * Math.sin(ph * PI), hands };
                // his scarf goes on under his arms: both are up, and they cross it
                Rides.skeleton(g2, px, py, sc, { ...pose, wear: opt('Verse2cProps') ? (g3) => Verse2cProps.skelScarf(g3, 0, 0, sc, { t, inFrame: true }) : null });
            });
        });
    }
    // The moon's boulders that the hearse comes down on (or would be left poking out from behind
    // it): its landing knocks them off, and they float away. Skyward.moon places its boulders from
    // this table (skyward.js's M_ROCKS, turned by its tilt and the moon's own turn).
    const M_ROCKS = [[0.0, -0.42, 0.085], [-0.67, -0.12, 0.06], [0.8, -0.25, 0.07], [-0.15, 0.25, 0.05], [0.52, 0.58, 0.08], [-0.58, 0.44, 0.065], [0.24, -0.57, 0.045], [-0.44, -0.63, 0.055], [0.2, 0.78, 0.05], [-0.06, -0.93, 0.07], [0.33, -0.9, 0.045], [-0.38, -0.88, 0.05]];
    const KNOCKED = M_ROCKS.map(([bx, by, bs]) => {
        const q = rot([bx * LIMB.r, by * LIMB.r], -0.3 + MOON_ROT);
        return { x: LIMB.x + q[0], y: LIMB.y + q[1], s: bs * LIMB.r };
    }).filter((k) => k.x > HEARSE[0] - 7.2 * CS && k.x < HEARSE[0] + 4.4 * CS && k.y > HEARSE[1] - 3.1 * CS && k.y < HEARSE[1] + 0.5 * CS);
    // a boulder as Skyward.moon draws it: (x, y) the middle of its base, s its size, ang its turn
    function boulder(g, x, y, s, ang) {
        const M = W.MOON, L = Math.min(3.2 * 0.8, s * 0.09);
        g.save();
        g.translate(x, y);
        g.rotate(ang);
        const pts = [[-0.5, 0], [-0.42, -0.34], [-0.12, -0.56], [0.26, -0.48], [0.5, -0.2], [0.52, 0]].map(([qx, qy]) => [qx * s, qy * s]);
        C.prism(g, pts, [s * 0.16, -s * 0.1], { front: M.rock, top: M.rockTop, side: M.rockSide }, { lw: L });
        C.poly(g, [[-0.2 * s, -0.36 * s], [0.06 * s, -0.2 * s], [0.02 * s, -0.02 * s]], { ink: M.rockSide, lw: Math.min(3.2 * 0.7, s * 0.07), close: false });
        g.restore();
    }
    // the EXIT 666 sign (Verse3bProps'), its post's foot at the screen point (x, y), k its size
    // (1 = the road's), turned by ang about its board
    function exitSign(g, x, y, k, ang = 0, about = 0) {
        const V3 = opt('Verse3bProps');
        if (!V3) return;
        g.save();
        g.translate(x, y);
        g.scale(k, k);
        g.translate(0, -about);
        g.rotate(ang);
        g.translate(0, about);
        V3.exitSign(g, 0, 0, {});
        g.restore();
    }
    const SIGN_K = (0.6 * CS) / 50; // the road's sign is drawn for cars at 84: a smaller one here
    function everybody(g, t) {
        const P = S.pulseAt(t), ph = P.k + P.since, pu = P.pulse, cam = camWide(t);
        const warm = seg(t, SUN_UP, T_POSTER - 0.2);
        const wind = windAt(t, T_POSTER), ready = go(t, WIND, 4 / 12); // the last four drawings: everybody winds up
        // the hearse comes down out of the black, the machine swinging behind it
        const fall = seg(t, T_WIDE - 0.5, H_LAND), fe = 1 - Math.pow(1 - fall, 1.7), landed = on(t, H_LAND);
        const hw = [lerp(HEARSE[0] - 640, HEARSE[0], fe), lerp(HEARSE[1] - 120, HEARSE[1], 0.4 * smooth(fe) + 0.6 * fe)]; // in from the left, low: never across the band
        const hb = landed ? -1.6 * thud(t, H_LAND, 1, 0.5) + 0.25 * pu : 0, hl = landed ? 0 : 0.1 * (1 - fall) + 0.03 * Math.sin(fall * 9);
        // the sign tumbles in from the top left and plants itself; the cone from the right
        const sIn = seg(t, SIGN_IN, SIGN_LAND), sPlanted = on(t, SIGN_LAND), cIn = seg(t, CONE_IN, CONE_LAND), cLanded = on(t, CONE_LAND);
        const look = !landed ? [-0.2, -1] : !on(t, SUN_UP) ? [0.1, -0.9] : !on(t, SIGN_IN) ? [0.9, -0.7] : !sPlanted ? [-0.5, -0.9] : !cLanded ? [0.9, -0.8] : [0.3, -1];
        stage(g, t, cam, {
            nod: 1, warm, look, sun: { ...SUN, k: on(t, SUN_UP) ? back(go(t, SUN_UP, 4 / 12)) : 0 },
            behind: (c, V) => {
                // the boulders the hearse has knocked off are gone from the ground
                if (landed) for (const k of KNOCKED) {
                    const p = V.P(k.x, k.y), ks = k.s * V.z;
                    c.save();
                    c.beginPath();
                    c.arc(V.mn.x, V.mn.y, V.mn.r - 3.6, 0, TAU); // inside the limb's outline
                    c.clip();
                    c.translate(p[0], p[1]);
                    c.rotate(MOON_ROT);
                    c.fillStyle = W.MOON.cream;
                    c.beginPath();
                    c.ellipse(0.24 * ks, -0.2 * ks, 1.36 * ks, 0.62 * ks, 0, 0, TAU);
                    c.fill();
                    c.restore();
                }
                if (sPlanted) {
                    const p = V.P(SIGN.x, SIGN.y), q = since(t, SIGN_LAND);
                    exitSign(c, p[0], p[1] + 4 * V.z, SIGN_K * V.z, SIGN.rot * 0.5 + 0.2 * Math.exp(-q * 6) * Math.cos(q * 22));
                    Q.dust(c, p[0], p[1], V.s, q, { seed: 9, n: 4, w: 0.1, size: 0.8, life: 0.9 });
                }
                if (cLanded && opt('Verse3bProps')) {
                    const p = V.P(CONE.x, CONE.y), q = since(t, CONE_LAND);
                    c.save();
                    c.translate(p[0], p[1]);
                    c.rotate(CONE.rot);
                    Verse3bProps.cone(c, 0, -16 * V.z * Math.max(0, thud(t, CONE_LAND + 1 / 12, 1, 0.34)), V.s * 1.1, 0.5 * Math.exp(-q * 7) * Math.cos(q * 20));
                    c.restore();
                    Q.dust(c, p[0], p[1], V.s, q, { seed: 5, n: 4, w: 0.2, size: 0.7, life: 0.9 });
                }
            },
            car: (c, s) => rideOn(c, t, s, { bounce: 0.3 * pu - 0.5 * ready, wind, cactus: { wheel: null, wave: P.k % 2 ? pu : -pu }, devil: wind ? {} : { solo: 0.5 + 0.4 * pu, shred: 1 } }),
            front: (c, V) => {
                const list = dancers(t, POS.right, { hype: 1 - 0.8 * ready }).map((m) => (ready > 0 ? { ...m, pose: { ...m.pose, squash: (m.pose.squash ?? 0) + 0.12 * ready, lift: 0 } } : m));
                people(c, V, t, byDepth(list).filter((m) => (Array.isArray(m.at) ? m.at[1] : m.at.y) < HEARSE[1]));
                if (landed) {
                    const p = V.P(HEARSE[0], HEARSE[1]), q = since(t, H_LAND);
                    hearse(c, t, p[0], p[1], V.s, { bounce: hb, up: ready });
                    for (const [dx, sd] of [[-2.5, 1], [3.1, 2]]) Q.dust(c, p[0] + dx * V.s, p[1], V.s, q, { seed: sd, n: 6, w: 0.5, size: 1.5 });
                }
                people(c, V, t, byDepth(list).filter((m) => (Array.isArray(m.at) ? m.at[1] : m.at.y) >= HEARSE[1]));
            },
            over: (c, V) => {
                // … and float away, turning
                if (landed) KNOCKED.forEach((k, i) => {
                    // out to the left first, clear of the band's car, then up and away
                    const q = t - H_LAND, p = V.P(k.x, k.y), away = Math.max(0, k.x - (REST.x - 5.4 * CS)) + 60 + 50 * i;
                    if (q < 4) boulder(c, p[0] - (away * (1 - Math.exp(-q * 1.8)) + 30 * q) * V.z, p[1] - (50 * q + 62 * q * q) * V.z, k.s * V.z, MOON_ROT - 0.9 * q);
                });
                if (!landed) {
                    const p = V.P(hw[0], hw[1]);
                    hearse(c, t, p[0], p[1], V.s, { lean: hl, spin: t * 6, shadow: false, hype: 0, crank: t * 4 });
                }
                if (on(t, SIGN_IN) && !sPlanted) {
                    const from = [-80, 130], to = V.P(SIGN.x, SIGN.y), p = arc(from, to, sIn, 110);
                    exitSign(c, p[0], p[1], SIGN_K * V.z, lerp(-TAU * 1.25, SIGN.rot * 0.5, sIn), 190);
                }
                if (on(t, CONE_IN) && !cLanded && opt('Verse3bProps')) {
                    const from = [1070, 230], to = V.P(CONE.x, CONE.y), p = arc(from, to, cIn, 120);
                    Verse3bProps.cone(c, p[0], p[1], V.s * 1.1, lerp(TAU * 1.5, CONE.rot, cIn));
                }
            },
        });
    }

    // =========================================================================================
    // 7 · The poster (bars 176–178)
    // =========================================================================================
    // The album's cover with the film's cast: the field in bands, the full moon's disc behind the
    // car (awake, one eye on the band), everybody standing on its lower part in two rows, the
    // title in the film's own solids.
    const PM = { x: 500, y: 640, r: 460 }, PS = 54; // the disc; everybody's scale
    const PCAR = [520, 752], PHEARSE = [506, 900];
    const CHORDS = [T_POSTER, at(40), at(44)]; // a windmill comes down on the first beat of each bar
    const PV = { P: (x, y) => [x, y], s: PS, z: 1 }, P_ROT = 0.25;
    // No shape touches a letter: the craters and boulders the poster's moon would put behind the
    // title (and the boulder over the trumpet's halo) are cleared off it. Skyward.moon places them
    // from these tables (skyward.js's M_CRATERS, M_LITTLE and M_ROCKS, turned by its tilt and by `rot`).
    const M_HOLES = [[0.02, -0.74, 0.105], [0.62, -0.5, 0.05], [-0.68, -0.42, 0.045], [0.3, -0.78, 0.04], [-0.3, -0.72, 0.035]];
    const turned = ([bx, by, bs]) => [...rot([bx, by], -0.3 + P_ROT), bs];
    const P_CLEAR = { holes: M_HOLES.map(turned).filter(([, y]) => y < -0.48), rocks: M_ROCKS.map(turned).filter(([, y]) => y < -0.4) };
    function clearTitle(g, x, y, r) {
        g.save();
        g.translate(x, y);
        g.rotate(P_ROT);
        g.beginPath();
        g.arc(0, 0, r - 3.6, 0, TAU); // inside its outline
        g.clip();
        g.fillStyle = W.MOON.cream;
        g.beginPath();
        for (const [hx, hy, hr] of P_CLEAR.holes.map(([px, py, pr]) => [...rot([px, py], -P_ROT), pr])) {
            g.moveTo(hx * r + hr * r * 1.34, hy * r);
            g.arc(hx * r + hr * r * 0.04, hy * r + hr * r * 0.05, hr * r * 1.3, 0, TAU);
        }
        for (const [kx, ky, ks] of P_CLEAR.rocks.map(([px, py, ps]) => [...rot([px, py], -P_ROT), ps])) {
            g.moveTo((kx + 0.24 * ks + 1.36 * ks) * r, (ky - 0.2 * ks) * r);
            g.ellipse((kx + 0.24 * ks) * r, (ky - 0.2 * ks) * r, 1.36 * ks * r, 0.64 * ks * r, 0, 0, TAU);
        }
        g.fill();
        g.restore();
    }
    function poster(g, t) {
        const P = S.pulseAt(t), ph = P.k + P.since, pu = P.pulse, d = C.drawing(t), s = PS, even = P.k % 2 === 0;
        const chord = CHORDS.filter((c) => on(t, c)).pop(), next = CHORDS.find((c) => !on(t, c)), wind = next ? windAt(t, next) : null;
        const bang = hit(t, chord, 0.34), ready = next ? go(t, next - 4 / 12, 4 / 12) : 0; // each chord's jolt; the wind-up to the next
        const dy = 5 * pu;
        Q.field(g, t, { cx: PM.x, cy: PM.y });
        // twinkles on the field, the Earth, the sun peering round the disc
        const rs = Motion.rng('solo5-poster-stars');
        for (let i = 0; i < 22; i++) {
            const x = 70 + rs() * 860, y = 70 + rs() * 400, sz = 7 + rs() * 9, f = Math.floor(rs() * 12);
            if (Math.hypot(x - PM.x, y - PM.y) < PM.r + 50 || (y < 400 && x > 150 && x < 850)) continue;
            C.sparkle(g, x, y, sz * ((d + f) % 12 < 3 ? 1.6 : 1), { color: K.white });
        }
        earth(g, 102, 316, 34, t);
        Q.sun(g, 874, 334, 38, t);
        const look = [[0.5, 0.8], [-0.5, 0.8], [0, 1]][Math.floor(ph / 2) % 3];
        W.moon(g, PM.x, PM.y + dy, PM.r * (1 + 0.012 * bang), { glow: 0.7 + 0.3 * pu, rot: P_ROT, face: 1, wink: 1, smile: 0, look, t });
        clearTitle(g, PM.x, PM.y + dy, PM.r * (1 + 0.012 * bang));
        Q.title(g, t, 500, 182, { at: [T_POSTER, T_POSTER + 2 * FR, T_POSTER + 4 * FR], k: 0.9 });
        g.save();
        g.translate(0, dy);
        // --- the back row: the car, the angels in the air round it --------------------------------
        g.save();
        g.translate(PCAR[0], PCAR[1]);
        noWhip(g, s, () => rideOn(g, t, s, {
            bounce: 0.35 * pu + 0.8 * bang - 0.5 * ready, wind, cactus: { wheel: null, wave: even ? pu : -pu },
            devil: { mood: bang > 0 ? 'laugh' : 'grin', solo: 0.5 + 0.4 * pu, squash: 0.045 * pu + 0.1 * bang, look: 0, ...(bang > 0.4 ? { strum: 1 } : {}) },
            pose: { tom: { squash: 0.045 * pu + 0.1 * bang, ...(bang > 0.4 ? { strum: 1 } : {}) }, stan: { crash: Math.max(bang, even ? pu : 0), kick: Math.max(bang, even ? pu : 0), mouth: 'grin' } },
        }));
        g.restore();
        const hop = (ph0, amp = 0.16) => amp * (1 - ready) * Math.sin(PI * Math.min(1, (((P.since + ph0) % 1) + 1) % 1));
        const up = Math.max(bang, 0.35 + 0.65 * pu);
        const fliers = [
            { kind: 'angel', at: [176, 640], pose: { who: 0, mood: 'rock', harp: true, strum: Math.cos(ph * TAU), flap: wingBeat(t, 0), squash: 0.03 * pu, headDy: 0.03 * pu, headTilt: 0.05 * Math.sin(ph * PI), haloUp: 0.7 * pu, halo: 0.1 * Math.sin(ph * PI), shadow: false, lift: 0.06 * Math.sin(ph * PI) } },
            { kind: 'angel', at: [520, 590], pose: { who: 1, mood: 'rock', trumpet: true, armUp: up, flap: wingBeat(t, 0.25), squash: 0.03 * pu, headDy: 0.02 * pu, haloUp: 0.7 * pu, halo: -0.1 * Math.sin(ph * PI), lean: -0.12 - 0.05 * pu, shadow: false, lift: 0.06 * Math.sin(ph * PI + 1) } },
            { kind: 'angel', at: [862, 652], pose: { who: 2, mood: 'rock', armUp: up, handR: [-0.56, -1.2 - 0.62 * up], flap: wingBeat(t, 0.5), squash: 0.04 * pu, headDy: 0.03 * pu, headTilt: even ? 0.06 : -0.06, haloUp: pu, halo: 0.14 * Math.sin(ph * PI), trident: 'R', tilt: 0.1 + 0.14 * Math.cos(ph * PI), shadow: false, lift: 0.06 * Math.sin(ph * PI + 2) } },
        ];
        people(g, PV, t, fliers);
        if (opt('Verse3bProps')) Verse3bProps.cone(g, 824, 794, s * 1.1, 0);
        // --- the front row: the sign, the hearse and its machine, the cone, the fans ----------------
        exitSign(g, 876, 878, 0.46, -0.05 + 0.03 * Math.sin(ph * PI), 190);
        hearse(g, t, PHEARSE[0], PHEARSE[1], s, { bounce: 0.25 * pu + 0.8 * bang, up: 1 });
        const fans = [
            { kind: 'imp', at: [778, 880], pose: { mood: 'grin', armUp: 1, hop: hop(0.5), squash: 0.06 * pu + 0.1 * bang, tail: -0.05 * Math.cos(ph * PI), look: -0.4, trident: 'L', tilt: -0.3 + 0.16 * Math.cos(ph * PI) } },
            { kind: 'imp', at: [846, 886], pose: { wear: 'bow', mood: 'grin', armUp: 1, hop: hop(0), squash: 0.06 * pu + 0.1 * bang, tail: 0.05 * Math.cos(ph * PI), look: -0.6 } },
            { kind: 'imp', at: [748, 914], pose: { wear: 'specs', mood: 'grin', armUp: 1, hop: hop(0), squash: 0.06 * pu + 0.1 * bang, tail: 0.05 * Math.cos(ph * PI), look: -1, halo: 1, haloDy: 0.1 * pu, haloTilt: 0.2 + 0.1 * Math.cos(ph * PI) } },
            { kind: 'skel', at: [808, 912], pose: { hype: 1 - 0.8 * ready, look: -0.5 } },
        ];
        people(g, PV, t, fans);
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
