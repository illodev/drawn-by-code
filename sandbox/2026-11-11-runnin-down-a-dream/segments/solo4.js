// «solo4», bars 155–166 (219.21–236.17 s) of the long solo: they run the dream down.
//   1 · Leaving the air (bars 155–158): the climb's travelling shot goes on above the clouds;
//       things go weightless one by one on the beats: Stan's sticks drift out of his mitts and
//       come back, Benmont's curls stand up, the cactus's flower floats off and he stretches to
//       catch it on his crown, the hangers' chain drifts up level under the car, the angels
//       stop flapping and float. Shooting stars on the even beats; the speed lines thin out.
//   2 · The moon (bars 159–162): the camera looks up (the car sinks in the frame) and the moon
//       grows ahead; it has a face, asleep; on bar 161 it opens one eye at them, looks them
//       over and stops on the Devil, who takes both mitts off his guitar for a beat; on bar
//       162 it grins, a halo ring on every beat.
//   3 · Landing (bars 163–166): cut to the moon's limb as the ground. The car sinks out of the
//       black, touches (dust that hangs), takes one long lazy hop, comes down and skids to
//       rest; the whip springs off its tail, the cactus catches it and throws it: it plants
//       itself as a flag; the hangers let go one by one and drift down, the angels alight;
//       the Earth has risen over the limb. From beat 667 the picture is Solo4Props.moonScene.
// Props, the moon stage and its positions are in segments/solo4-props.js.
(() => {
    const Seg = (window.Seg = window.Seg || {});
    const C = Cereal, K = C.COL, S = Song, W = Skyward, F = Finale, R = Solo4Props, CAR = F.CAR, ST = R.STAGE, CS = ST.s;
    const twos = S.twos, b = S.b, B = S.B, PI = Math.PI, TAU = PI * 2, EPS = 1e-6;
    const T0 = B(155), T_MOON = B(159), T_LAND = B(163), T_END = B(167), SPIN = 12;
    const lerp = (a, c, u) => a + (c - a) * u;
    const clamp = (v, a = 0, c = 1) => Math.max(a, Math.min(c, v));
    const seg = (v, a, c) => clamp((v - a) / (c - a));
    const smooth = (u) => {
        const v = clamp(u);
        return v * v * (3 - 2 * v);
    };
    const rot = ([x, y], a) => [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)];
    // time since an event, held on its own drawings (seconds; negative before it)
    const since = (t, at) => (t < at - EPS ? -1 : twos(t, at) - at);
    // a value that jumps on a hit and falls back, on twos: 1 on the hit's frame
    const hit = (t, at, dur = 0.3) => {
        const a = since(t, at);
        return a < 0 || a >= dur ? 0 : Math.pow(1 - a / dur, 1.6);
    };
    // a spring that rings out after a hit (smooth time: the car's body)
    const ring = (t, at, f = 16, damp = 6) => (t < at ? 0 : Math.exp(-(t - at) * damp) * Math.cos((t - at) * f));
    // a value through keys [[t, v], …], eased between them
    const keys = (t, ks) => {
        if (t <= ks[0][0]) return ks[0][1];
        for (let i = 1; i < ks.length; i++) if (t < ks[i][0]) return lerp(ks[i - 1][1], ks[i][1], smooth(seg(t, ks[i - 1][0], ks[i][0])));
        return ks[ks.length - 1][1];
    };
    const hangers = (g, t, x, y, s, o = {}) => {
        if (R.has2()) Solo2Props.hangers(g, t, x, y, s, o);
    };

    // =========================================================================================
    // 1 and 2 · the climb: leaving the air, then the moon
    // =========================================================================================
    const N = { sticks: 622, curls: 624, back: 626, chain: 628, caught: 630, float: 632, face: 636, wink: 644, sweep: 645, mitts: 647, grin: 648 };
    // shooting stars on the even beats: [beat, x0, y0, dir, len, size]
    const STARS = [[620, 90, 70, 1, 300, 1.2], [622, 640, 50, -1, 300, 1], [624, 300, 40, 1, 280, 1.2], [626, 600, 110, -1, 330, 1], [628, 110, 130, 1, 320, 1.2], [630, 560, 40, -1, 280, 1], [632, 200, 60, 1, 340, 1.2], [634, 650, 70, -1, 320, 1]];
    const MOON0 = { x: 770, y: 190, r: 62 }, MOON1 = { x: 500, y: 318, r: 310 };
    function moonNow(t) {
        const u = smooth(seg(t, b(633), b(647))), r = MOON0.r * Math.pow(MOON1.r / MOON0.r, u) + 9 * seg(t, b(647), T_LAND), e = clamp((r - MOON0.r) / (MOON1.r - MOON0.r));
        return { x: lerp(MOON0.x, MOON1.x, e), y: lerp(MOON0.y, MOON1.y, e), r };
    }
    function moonLook(t) {
        const P = S.pulseAt(t), sw = seg(twos(t, b(N.sweep)), b(N.sweep), b(N.mitts)), back = smooth(seg(twos(t, b(N.grin)), b(N.grin) + 0.2, b(N.grin) + 0.5));
        const blink = t >= b(650) - EPS && since(t, b(650)) < 2 / 12 - EPS ? 0.12 : 1;
        return {
            face: smooth(seg(twos(t, b(N.face)), b(N.face), b(N.wink) - 0.3)),
            wink: clamp(S.pop(t, b(N.wink), 0.25)) * blink,
            look: t < b(N.sweep) - EPS ? [0.2, 0.7] : [lerp(lerp(-0.95, 0.95, smooth(sw)), 0.25, back), 0.85],
            smile: clamp(S.pop(t, b(N.grin), 0.3)),
            glow: Math.max(hit(t, b(N.wink), 0.5), t >= b(N.grin) - EPS ? 0.3 + 0.7 * P.pulse : 0),
        };
    }

    function climb(g, t) {
        const Y = F.Y(t), d = C.drawing(t), P = S.pulseAt(t), ph = P.k + P.since, s = CAR.s;
        // the camera looks up at the moon: the car sinks in the frame
        const cx = CAR.x, cy = CAR.y + 170 * smooth(seg(t, b(N.float), b(642)));
        const o = { town: false, speedLines: 0.5 * (1 - smooth(seg(t, b(N.chain), b(640)))) };
        if (t >= b(N.float) - EPS) {
            const mn = moonNow(t);
            Object.assign(o, { moon: mn, moonTo: mn, moonLook: moonLook(t) });
        }
        W.ascent(g, t, Y, o);
        for (const [n, x0, y0, dir, len, k] of STARS) R.shootingStar(g, x0, y0, dir, len, since(t, b(n)) / 0.42, k);

        // --- who does what ------------------------------------------------------------------
        const base = Rig.playing(t, { sing: true, solo: 0.6 }), pose = {};
        const awe = t >= b(N.wink) - EPS, gasp = awe && t < b(N.wink + 2) - EPS, calm = t >= b(N.grin) - EPS;
        const up = (tilt) => (awe ? { headTilt: tilt, headDy: -0.035 + (base.tom.headDy ?? 0), eyes: calm ? 'open' : 'wide', ...(gasp ? { mouth: 'o' } : {}) } : {});
        // Stan: his sticks leave on N.sticks and are back in his mitts on N.back
        const stOut = t >= b(N.sticks) - EPS && t < b(N.back) - EPS, stUp = t >= b(N.sticks) - 2 / 12 - EPS && t < b(N.back) - EPS;
        pose.stan = { ...(stUp ? { snare: 0, hat: 0, crash: 0, eyes: 'wide', mouth: t < b(N.sticks + 2) - EPS ? 'o' : 'grin', headDy: -0.04, headTilt: -0.05 } : {}), ...up(0.1) };
        // Benmont: his curls stand up on N.curls and stay up
        const cu = since(t, b(N.curls)), curlK = cu < 0 ? 0 : S.pop(t, b(N.curls), 0.3) * (1 + 0.22 * hit(t, b(N.curls) + 2 / 12, 0.45));
        pose.ben = { ...(cu >= 0 && cu < 2 * S.BEAT ? { eyes: 'wide' } : {}), ...up(0.05) };
        pose.howie = up(0.08);
        pose.mike = awe ? { ...up(0.06), solo: 0, mouth: gasp ? 'o' : 'grin' } : {};
        pose.tom = awe ? { headTilt: -0.03, headDy: -0.035 + (base.tom.headDy ?? 0) } : {};
        // the cactus: its flower floats off on N.back; he stretches up under it and has it back on N.caught
        const fu = seg(twos(t, b(N.back)), b(N.back), b(N.caught)), flOut = t >= b(N.back) - EPS && t < b(N.caught) - EPS, fa = since(t, b(N.caught));
        let cq = 0.05 * P.pulse;
        if (flOut) cq = lerp(cq, -0.2, smooth(seg(fu, 0.6, 0.94)));
        else if (fa >= 0 && fa < 0.5) cq = -0.2 * Math.cos(fa * 18) * Math.exp(-fa * 7) + 0.05 * P.pulse * seg(fa, 0.2, 0.45);
        const cactus = { squash: cq, ...(flOut ? { mouth: 'oh', wave: lerp(-0.8, 1, fu) } : {}), ...(awe && !calm ? { mouth: 'oh', lean: -0.05 } : {}) };
        // the Devil: startled by the eye, both mitts off the strings while it rests on him, then he plays for it
        const mitts = R.has3() && t >= b(N.mitts) - EPS && t < b(N.grin) - EPS;
        const devil = awe ? { mood: calm ? 'laugh' : 'shock', headTilt: -0.1, ...(mitts ? { strum: NaN, fret: NaN } : {}), ...(calm ? { solo: 1, shred: 0.8 } : {}) } : {};

        const ride = () => F.ride(g, t, cx, cy, s, { spin: t * SPIN, exhaust: 0.6 * (1 - smooth(seg(t, b(N.chain), b(640)))), pose, cactus, devil });
        const drawn = () => (stOut ? R.emptyMitts(ride) : ride());
        if (flOut) R.noFlower(g, cx, cy, s, cactus, drawn);
        else drawn();
        // the loose things
        R.curls(g, cx, cy, s, { ...base.ben, ...pose.ben }, curlK, Math.floor(d / 2) * 1.3);
        if (stOut) R.sticks(g, cx, cy, s, seg(twos(t, b(N.sticks)), b(N.sticks), b(N.back)));
        if (flOut) {
            const home = R.flowerHome(cx, cy, s, {}), rise = fu < 0.55 ? 0.85 * Math.sin((PI / 2) * (fu / 0.55)) : lerp(0.85, 0.399, smooth((fu - 0.55) / 0.45));
            R.flower(g, home[0] + 0.3 * Math.sin(PI * fu) * s, home[1] - rise * s, s, TAU * smooth(fu), cq * smooth(seg(fu, 0.85, 1)));
        }
        if (mitts) {
            const [hx, hy] = F.hoodAt(cx, cy, s), j = d % 2 ? 0.03 : -0.02;
            R.devilMitts(g, hx, hy, s, { squash: 0.045 * P.pulse, tail: 0.05 * Math.sin(ph * PI), solo: 0.5, ...devil }, [-0.8, -1.3 + j], [0.82, -1.26 - j]);
        }
        // the chain drifts up until it lies level under the car
        const ck = smooth(seg(t, b(N.chain), b(633)));
        hangers(g, t, cx, cy, s, ck > 0 ? { trail: 1.32 * ck + 0.06 * ck * Math.sin(t * 2.1), swing: lerp(1, 0.4, ck) } : {});
        // the angels stop flapping and float out to the sides; the third is left below as the camera looks up
        if (R.has3()) {
            const fk = t >= b(N.float) - EPS, k = smooth(seg(t, b(N.float), b(642))), fl = (who) => ({ flap: 0.55, bob: 0.07 * Math.sin((t - b(N.float)) * 1.7 + who * 2.1), haloUp: 0.6 + 0.4 * P.pulse });
            Solo3Props.escort(g, t, cx, cy, s, fk ? {
                at: { 0: [-3.2 * k, -0.85 * k], 1: [3.1 * k, -0.9 * k], 2: [0, 2.3 * k] },
                pose: { 0: { ...fl(0), ...(awe ? { headTilt: 0.14 } : {}) }, 1: { ...fl(1), ...(awe ? { headTilt: -0.1 } : {}) }, 2: fl(2) },
            } : {});
        }
        W.ascentFront(g, t, Y, o);
    }

    // =========================================================================================
    // 3 · the landing
    // =========================================================================================
    const T1 = b(656), T2 = R.T_DOWN, TR = R.T_REST, HOP = 110, DROP = 330; // the hop's height; how high it is at the cut
    const VX = (1.2 * R.SLIDE0 * CS) / (TR - T2) / ST.limb.r, VXD = 20 / ST.limb.r; // radians a second along the limb: in the hop, on the way down
    const A2 = ST.carA - (R.SLIDE0 * CS) / ST.limb.r, A1 = A2 - VX * (T2 - T1);
    // the car at t: { x, y, rot, lean, bounce, spin, air (its height above the ground), a }
    function carState(t) {
        let a, h = 0, pitch = 0;
        if (t < T1) {
            a = A1 - VXD * (T1 - t);
            h = DROP * Math.pow((T1 - t) / (T1 - T_LAND), 2);
            pitch = 0.07 * smooth((T1 - t) / 1.1) - a * smooth((T1 - t) / 0.9); // level in the black, then it takes the ground's slope
        } else if (t < T2) {
            const u = (t - T1) / (T2 - T1);
            a = A1 + VX * (t - T1);
            h = 4 * HOP * u * (1 - u);
            pitch = lerp(-0.075, 0.045, u) * Math.pow(Math.sin(PI * u), 0.7);
        } else a = ST.carA + (R.slideAt(t) * CS) / ST.limb.r;
        const p = R.carAt(a, h);
        return {
            ...p, a, air: h, rot: a + pitch,
            lean: 0.1 * Math.max(0, ring(t, T1, 9, 5)), bounce: clamp(ring(t, T1, 15, 6) + 0.9 * ring(t, T2, 15, 6), -0.5, 1),
            spin: t < T2 ? t * SPIN : T2 * SPIN + ((R.slideAt(t) + R.SLIDE0) / 0.56) * 0.6,
        };
    }
    const toScreen = (car, p) => {
        const q = rot([p[0] * CS, p[1] * CS], car.rot);
        return [car.x + q[0], car.y + q[1]];
    };
    // --- the whip: off the tail on T2, into the cactus's arm, thrown, planted --------------------
    const W_CATCH = b(663), W_THROW = b(663.5), W_STICK = b(665);
    const holdBase = (q) => [2.15 - 0.51 * (1 + q), -0.44 - 1.48 * (1 - q)]; // on the cactus's raised arm, in the car's units
    const bez = (p0, p1, p2, p3, u) => {
        const v = 1 - u;
        return [v * v * v * p0[0] + 3 * v * v * u * p1[0] + 3 * v * u * u * p2[0] + u * u * u * p3[0], v * v * v * p0[1] + 3 * v * v * u * p1[1] + 3 * v * u * u * p2[1] + u * u * u * p3[1]];
    };
    const HALF = 1.25; // the whip turns about its middle
    // the cactus's pose through the catch and the throw
    function cactusAct(t) {
        const P = S.pulseAt(t), a = since(t, W_CATCH), th = since(t, W_THROW);
        if (t < W_CATCH - 0.5) return {};
        if (a < 0) return { wave: 0, mouth: 'oh', squash: 0.05 * P.pulse };
        if (th < 0) return { wave: 0, squash: -0.1 + 0.06 * seg(a, 0, 0.17), lean: -0.13 * smooth(seg(a, 0.05, 0.17)) };
        if (th < 0.5) return { wave: 0.6, squash: 0.08 * Math.exp(-th * 8), lean: 0.14 * Math.exp(-th * 5) };
        return {};
    }
    // { x, y, ang, bend } on screen, or null when it is on the car or in the ground
    function whipState(t) {
        if (t < T2 - EPS || t >= W_STICK - EPS) return null;
        const car = carState(t);
        if (t < W_CATCH - EPS) {
            const u = seg(twos(t, T2), T2, W_CATCH), e = Math.pow(u, 0.85), ang = TAU * smooth(u), hb = holdBase(-0.1);
            const mid = bez([R.WHIP_BASE[0], R.WHIP_BASE[1] - HALF], [-3.9, -6.3], [0.7, -6.6], [hb[0], hb[1] - HALF], e);
            const base = [mid[0] - Math.sin(ang) * HALF, mid[1] + Math.cos(ang) * HALF];
            const p = toScreen(car, base);
            return { x: p[0], y: p[1], ang: car.rot + ang, bend: lerp(-1, 0.2, smooth(u)) };
        }
        const act = cactusAct(W_THROW - 1 / 24), hold = (tt, q, lean) => {
            const c = carState(tt), p = toScreen(c, holdBase(q));
            return { x: p[0], y: p[1], ang: c.rot + lean * 2.6 };
        };
        if (t < W_THROW - EPS) {
            const ca = cactusAct(t), h = hold(t, ca.squash ?? 0, ca.lean ?? 0);
            return { ...h, bend: 0.2 };
        }
        const h0 = hold(W_THROW, act.squash ?? 0, act.lean ?? 0), u = seg(twos(t, W_THROW), W_THROW, W_STICK), ang = lerp(h0.ang, TAU + ST.flag.rot, Math.pow(u, 0.9));
        const m0 = [h0.x + Math.sin(h0.ang) * HALF * CS, h0.y - Math.cos(h0.ang) * HALF * CS], m1 = [ST.flag.x + Math.sin(ST.flag.rot) * HALF * CS, ST.flag.y - Math.cos(ST.flag.rot) * HALF * CS];
        const mid = [lerp(m0[0], m1[0], u), lerp(m0[1], m1[1], u) - 4 * 120 * u * (1 - u)];
        return { x: mid[0] - Math.sin(ang) * HALF * CS, y: mid[1] + Math.cos(ang) * HALF * CS, ang, bend: lerp(0.2, 1, smooth(u)) };
    }
    // --- the hangers: on the chain, letting go from its end, drifting down, standing ---------------
    const REL = [b(664), b(663), b(662), b(661)], DRIFT = 2.5 * S.BEAT, IMP = 0.67;
    // In this shot the chain is laid out here, link by link (Solo2Props.hanger): with next to no
    // gravity it streams up behind the tail instead of hanging. th: each link's turn on screen
    // (0 hangs straight down, π/2 lies level with its feet to the left, π points straight up).
    function chain(t) {
        const car = carState(t), out = [];
        let grip = toScreen(car, Solo2Props.onBody(Solo2Props.PIPE, 0, 0, 1, { lean: car.lean, bounce: car.bounce }));
        const th0 = keys(t, [[T_LAND, 2.75], [T1, 2.55], [T1 + 0.3, 2.2], [b(658), 2.0], [T2, 2.3], [T2 + 0.35, 1.72], [b(662), 1.95], [b(664), 1.85]]);
        for (let i = 0; i < 4; i++) {
            const lk = Solo2Props.LINKS[i], un = (lk.kind === 'imp' ? IMP : 1) * CS, th = th0 + 0.1 * i + 0.09 * Math.sin(t * 5.2 - i * 0.8) + car.rot * 0.5;
            out.push({ grip, th });
            const q = rot([(lk.next[0] - lk.grip[0]) * un, (lk.next[1] - lk.grip[1]) * un], th);
            grip = [grip[0] + q[0], grip[1] + q[1]];
        }
        return out;
    }
    const linkPose = (i, t) => {
        const P = S.pulseAt(t), ph = P.k + P.since;
        return i === 3 ? { jaw: 0.25 + 0.6 * P.pulse, look: Math.cos(ph * PI), pump: Math.cos(ph * PI) } : { tail: 0.06 * Math.cos(ph * PI - i * 0.7) };
    };
    function hanger(g, i, t) {
        const id = 'h' + i, land = REL[i] + DRIFT;
        if (t >= land - EPS) return R.stander(g, id, t, { squash: 0.22 * hit(t, land, 0.3) });
        if (!R.has2()) return;
        if (t < REL[i] - EPS) {
            const c = chain(t)[i];
            return Solo2Props.hanger(g, i, c.grip[0], c.grip[1], CS, -c.th, linkPose(i, t));
        }
        // from where it let go to its mark: it falls slowly and turns feet down
        const link = Solo2Props.LINKS[i], un = (link.kind === 'imp' ? IMP : 1) * CS, at0 = chain(REL[i])[i], off = (th) => rot([link.grip[0] * un, link.grip[1] * un], th);
        const f0 = [at0.grip[0] - off(at0.th)[0], at0.grip[1] - off(at0.th)[1]], m = ST.stand[id];
        const u = seg(twos(t, REL[i]), REL[i], land), th = lerp(at0.th, m.rot, smooth(u * 1.15)), fx = lerp(f0[0], m.x, 1 - Math.pow(1 - u, 1.6)), fy = lerp(f0[1], m.y, Math.pow(u, 1.7)) - 30 * Math.sin(PI * u) * (1 - u);
        const gp = off(th);
        Solo2Props.hanger(g, i, fx + gp[0], fy + gp[1], CS, -th, linkPose(i, t));
    }
    // --- the angels: alongside on the way down, hovering, alighting ---------------------------------
    const ALIGHT = [b(665.5), b(666), b(666.5)], A_OFF = [[5.4, -2.6], [6.3, -1.35], [7.2, -2.8]], HOVER = [62, 52, 70];
    const groundY = (x) => ST.limb.y - Math.sqrt(ST.limb.r * ST.limb.r - (x - ST.limb.x) * (x - ST.limb.x));
    function angel(g, who, t) {
        const id = 'a' + who, land = ALIGHT[who], m = ST.stand[id];
        if (t >= land - EPS) return R.stander(g, id, t, { squash: 0.16 * hit(t, land, 0.3) });
        // down with the car, just ahead of its nose; then along the ground, under the Earth, to hover over its mark
        const car = carState(t), k = smooth(seg(t, b(656), b(662.5))), low = smooth(seg(t, b(652.5), b(656.5))), dn = smooth(seg(t, land - 3 * S.BEAT, land));
        const base = R.has3() ? Solo3Props.escortPoses(t)[who] : R.angelPose(who, t), slow = 0.05 * Math.sin((t - T_LAND) * 2.2 + who * 2);
        const x = lerp(car.x + A_OFF[who][0] * CS, m.x, k), hov = groundY(x) + (m.y - groundY(m.x)) * k - HOVER[who];
        const y = lerp(lerp(car.y + A_OFF[who][1] * CS, hov, low), m.y, dn) + ((base.bob ?? 0) + slow) * CS * (1 - dn);
        R.onStage(g, { x, y, rot: m.rot * smooth(dn * 1.2) }, () => W.angel(g, 0, 0, CS, { ...base, flap: dn > 0.85 ? 0.3 : base.flap ?? 0.5, shadow: false }));
    }

    function landing(g, t) {
        if (t >= b(667) - EPS) return R.moonScene(g, t);
        const car = carState(t), P = S.pulseAt(t), L = ST.limb, grounded = car.air < 0.5;
        const fa = since(t, W_STICK), d1 = t < T1 ? 0 : Math.pow(seg(twos(t, T1), T1, T1 + 3.5), 0.6);
        R.moonStage(g, t, { flag: fa < 0 ? 0 : 0.6 + 0.4 * seg(fa, 0, 0.25) });
        // its shadow on the ground while it is in the air
        if (!grounded) {
            const sh = R.carAt(car.a, 0), kk = 1 - 0.45 * clamp(car.air / 300);
            g.save();
            g.beginPath();
            g.arc(L.x, L.y, L.r, 0, TAU);
            g.clip();
            g.fillStyle = 'rgba(36,21,49,0.28)';
            g.beginPath();
            g.ellipse(sh.x, sh.y - 12, 4.6 * CS * kk, 13 * kk, sh.rot, 0, TAU);
            g.fill();
            g.restore();
        }
        // where the wheels first touched
        const w1 = [-1, 1].map((sd) => R.carAt(A1 + (sd * 3.55 * CS) / L.r, 0));
        w1.forEach((p, i) => R.dustBurst(g, p.x, p.y, CS, d1, { seed: 'touch' + i, t, a: p.rot, part: 'back', dir: -1, n: 6 }));
        // the car
        const whip = whipState(t), noWhip = t >= T2 - EPS, cactus = cactusAct(t);
        const ride = () => F.ride(g, t, 0, 0, CS, {
            spin: car.spin, lean: car.lean, bounce: car.bounce, shadow: grounded, exhaust: t < T1 ? 0.5 : 0, cactus,
            devil: { solo: 1, shred: 0.6, ...(Math.max(hit(t, T1, 0.25), hit(t, T2, 0.25)) > 0 ? { mood: 'shock' } : {}) },
        });
        R.onStage(g, car, () => {
            if (noWhip) R.noWhip(g, CS, ride);
            else ride();
        });
        for (const i of [3, 2, 1, 0]) hanger(g, i, t);
        for (const who of [1, 2, 0]) angel(g, who, t);
        if (whip) R.whip(g, whip.x, whip.y, CS, whip.ang, whip.bend, t);
        R.moonStage(g, t, { part: 'front' });
        w1.forEach((p, i) => R.dustBurst(g, p.x, p.y, CS, d1, { seed: 'touch' + i, t, a: p.rot, part: 'front', dir: -1, n: 6 }));
        // the flag goes in: a puff at its foot
        if (fa >= 0) {
            const f = R.onLimb(Math.asin((ST.flag.x - 6 - L.x) / L.r));
            R.dustBurst(g, f.x, f.y, CS, seg(fa, 0, 0.66), { seed: 'flag', t, a: f.rot, n: 4, size: 0.62 });
        }
    }

    function draw(g, t, env) {
        if (t < T_LAND - EPS) climb(g, t);
        else landing(g, t);
    }

    Seg.solo4 = { shots: [[T0, T_MOON, 'Leaving the air'], [T_MOON, T_LAND, 'The moon'], [T_LAND, T_END, 'Landing']], draw, post: () => ({}) };
})();
