// Props and helpers of chorus 3 (segments/chorus3.js), the band's entrance into Hell's venue:
// who stands where in the pit (so a thing can land on a head and stay on it), what the car
// threw off and where each thing stays (`dressing`, for the blocks that follow), the title on
// the venue's banner, the dust of the landing, the follow spots that find the players, the
// Devil with or without his scarf, the scarf alone, and the close shot of two fans in the pit.
//
// Everything that lives on the set is given in the venue's SET coordinates (inferno.js) and
// drawn through a view and a pan, like the venue itself; outlines keep their width.
// Global: Chorus3Props. Depends on Cereal, Song, Cast, Devil, Fx, Inferno, Chorus1Props
// (puffs) and Verse3bProps (the cone, the barrier, the arrow, the mallet, the Devil's cold).
const Chorus3Props = (() => {
    const C = Cereal, K = C.COL, E = Ease, S = Song, I = Inferno, V = Verse3bProps, P1 = Chorus1Props;
    const D = Cast.D, Dd = Cast.Dd, TAU = Math.PI * 2, PI = Math.PI, twos = S.twos;
    const lerp = (a, b, u) => a + (b - a) * u;
    const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
    const smooth = (u) => {
        const v = clamp(u);
        return v * v * (3 - 2 * v);
    };
    const rot = ([x, y], a) => [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)];
    const cw = V.cw, mix = V.mix;
    const line = (g, pts, lw, ink = K.ink) => C.poly(g, pts, { ink, lw, close: false });
    const kOf = (t, a) => Math.floor((t - a) * 12 + 1e-6);
    const bump = (t, a, dur = 0.25) => E.bump(twos(t, a), a, dur);
    const PIT_COL = I.R.pit;

    // --- the camera: a set point on screen, and the view's scale ---------------------------------
    const view = (o = {}) => {
        const cam = I.cam(o.view, o.pan);
        return { k: cam.k, at: (p) => I.toScreen(o.view, o.pan, p) };
    };

    // =========================================================================================
    // The pit: the same figures the venue's crowd draws (Inferno seeds them once; this is the
    // same list), so a cone can sit on a head and keep the head's hop.
    // =========================================================================================
    const ROWS = [886, 922, 960, 1000], PITCH = 67;
    const figs = new Map();
    function fig(r, i) {
        const key = r + ':' + i;
        if (figs.has(key)) return figs.get(key);
        const rn = Motion.rng('inferno-pit:' + r + ':' + i), x = 12 + i * PITCH + (r % 2) * PITCH * 0.5 + (rn() - 0.5) * 10;
        const skel = rn() < (r === 0 ? 0.1 : 0.24), turnR = rn();
        const f = {
            r, x, y: ROWS[r] + (rn() - 0.5) * 6, skel, rank: rn(), thr: 0.06 + 0.8 * rn(), ph: rn() < 0.7 ? 0 : 0.5, amp: 0.7 + 0.6 * rn(), size: 0.92 + 0.14 * rn(),
            turnR, turnS: rn() < 0.5 ? -1 : 1, side: rn() < 0.5 ? -1 : 1, wear: Math.floor(rn() * 6), tee: Math.floor(rn() * 4), hawk: rn() < 0.4 ? Math.floor(rn() * 4) : -1,
            light: rn(), foam: rn(), delay: Math.floor(rn() * 3),
        };
        figs.set(key, f);
        return f;
    }
    /**
     * A figure of the pit at t, as Inferno.crowd draws it: { x, top (the crown of its head), u
     * (its unit), sq (its squash), won } in SET coordinates.  o: { hype, lighters, wave }
     */
    function figAt(f, t, o = {}) {
        const hype = clamp(o.hype ?? 0), nl = clamp(o.lighters ?? 0), wave = o.wave ?? null, P = S.pulseAt(t);
        const won = smooth((hype - f.thr) / 0.16 + (hype >= 1 ? 1 : 0));
        const ph = P.k + Math.max(0, P.since - f.delay / 12 / 0.353) + f.ph, fr = ph - Math.floor(ph);
        const xn = (f.x - 20) / 960 + f.r * 0.02, wv = wave == null ? 0 : smooth(1 - Math.abs(xn - (wave * 1.3 - 0.15)) / 0.13);
        const light = f.light < nl * 0.85, sway = Math.sin((C.onTwos(t) * TAU) / 2.4);
        const hop = light ? 0 : won * f.amp * (0.07 + 0.12 * hype) * Math.sin(PI * fr) + wv * 0.14, sq = light ? 0 : won * 0.07 * Math.exp(-fr * 5);
        const u = (f.skel ? 70 : 56) * f.size;
        const top = f.y - hop * u - (f.skel ? 1.74 : 1.02) * u * (1 - sq);
        return { x: f.x + (light ? sway * 3 : 0), feet: f.y - hop * u, top, hat: top - (!f.skel && f.wear === 1 ? 0.27 * u * (1 - sq) : 0), u, sq, won, hop };
    }
    // who got what: two imps of the front row (nobody taller stands in front of them) wear the
    // cones; an imp of the third row, in a hard hat like the staff's, has the imp standing on it
    const HAT_A = fig(0, 7), HAT_B = fig(0, 3), CATCHER = fig(2, 11);

    // =========================================================================================
    // Where the things the car threw off stay (SET coordinates)
    // =========================================================================================
    const HOME = {
        arrow: [331, 156], // wedged between two teeth of the upper jaw, pointing down at the band
        fork: [668, 70], // the trident's tines, in the gum
        barrier: [600, 822], // across the stage's lip
        brazier: [103, 540], // where the blueprint burns
    };
    const IMP_U = 60, CONE_S = 62, BARRIER_S = 64;

    // An imp of the Devil's staff from behind (the pit's view of one), in a hard hat, its mallet
    // in its right mitt. Unit: its width; (x, y) under its hooves.  o: { squash, up (0..1 how high it holds the mallet), swing, tone (0..1 towards the pit's dark) }
    function impBack(g, x, y, u, o = {}) {
        const L = 3 / u, q = o.squash ?? 0, m = (c) => mix(c, PIT_COL, o.tone ?? 0), DP = Devil.P, top = -1.02, up = o.up ?? 0.5;
        const cols = { front: m(DP.skin), top: m(DP.skinTop), side: m(DP.skinSide) };
        g.save();
        g.translate(x, y);
        g.scale(u * (1 + q), u * (1 - q));
        g.lineJoin = 'round';
        for (const sx of [-1, 1]) {
            C.box(g, sx * 0.22 - 0.11, -0.1, 0.22, 0.1, D, { front: m(DP.hoof), top: m(DP.hoofTop), side: m(DP.hoof) }, { lw: L, depth: 0.26 });
            C.box(g, sx * 0.22 - 0.085, -0.26, 0.17, 0.17, D, cols, { lw: L, depth: 0.2 });
        }
        const hand = [0.66, -0.74 - 0.4 * up], ang = 0.34 - 0.24 * up + (o.swing ?? 0);
        C.box(g, -0.5, top, 1, 0.8, D, cols, { lw: L, depth: 0.5 });
        // the tail comes out at us and curls
        const tw = o.tail ?? 0, tl = C.curve([[0, -0.3], [-0.2, -0.16], [-0.44, -0.2], [-0.52, -0.42 + tw], [-0.4, -0.6 + tw * 1.5]], false, 5);
        const band = [], back = [];
        tl.forEach(([px, py], i) => {
            const a = tl[Math.max(0, i - 1)], c = tl[Math.min(tl.length - 1, i + 1)], dx = c[0] - a[0], dy = c[1] - a[1], l = Math.hypot(dx, dy) || 1, w = 0.04 - 0.014 * (i / (tl.length - 1));
            band.push([px - (dy / l) * w, py + (dx / l) * w]);
            back.unshift([px + (dy / l) * w, py - (dx / l) * w]);
        });
        C.poly(g, [...band, ...back], { fill: m(DP.skinTop), ink: K.ink, lw: L });
        const te = tl[tl.length - 1];
        C.poly(g, [[te[0] - 0.1, te[1] + 0.03], [te[0] + 0.02, te[1] - 0.15], [te[0] + 0.1, te[1] + 0.03]], { fill: m(DP.skinTop), ink: K.ink, lw: L });
        // the hard hat: a dome and a brim, a ridge down its back
        const dome = cw(C.curve([[-0.4, top + 0.03], [-0.36, top - 0.2], [0, top - 0.3], [0.36, top - 0.2], [0.4, top + 0.03]], false, 6).concat([[0.4, top + 0.03]])).map(([px, py]) => [px + D[0] * 0.1, py + D[1] * 0.1]);
        C.prism(g, dome, Dd(0.3), { front: m(K.yellow), top: m('#fff59a'), side: m(K.gold) }, { lw: L, sweepInk: null });
        C.prismOutline(g, dome, Dd(0.3), { lw: L });
        C.box(g, -0.5, top - 0.01, 1.0, 0.06, D, { front: m(K.gold), top: m(K.yellow), side: m('#e0a800') }, { lw: L, depth: 0.52 });
        line(g, [[0.03, top - 0.27], [0.03, top - 0.04]], L * 1.4, m('#e0a800'));
        // the mallet in its right mitt, held up beside its head; the other mitt hangs, or punches the air with it
        g.save();
        g.scale(1 / u, 1 / u);
        V.mallet(g, hand[0] * u, hand[1] * u, ang, u * 0.8);
        g.restore();
        const stub = (sh, to) => {
            const dx = to[0] - sh[0], dy = to[1] - sh[1], len = Math.hypot(dx, dy) || 1e-6, ux = dx / len, uy = dy / len, nx = -uy * 0.08, ny = ux * 0.08;
            C.prism(g, cw([[sh[0] + nx, sh[1] + ny], [to[0] + ux * 0.08 + nx, to[1] + uy * 0.08 + ny], [to[0] + ux * 0.08 - nx, to[1] + uy * 0.08 - ny], [sh[0] - nx, sh[1] - ny]]), Dd(0.14), cols, { lw: L });
        };
        stub([-0.48, -0.48], [-0.66, -0.34 - 0.62 * Math.max(0, up - 0.4) / 0.6]);
        stub([0.48, -0.48], hand);
        g.restore();
    }

    // The trident stuck in the gum by its tines: it hangs from them and quivers. tau: seconds since it struck (null: at rest).
    function forkStuck(g, v, tau = null) {
        const [x, y] = v.at(HOME.fork), s = 84 * v.k, q = tau == null ? 0 : 0.2 * Math.exp(-tau * 4.2) * Math.cos(tau * 34);
        // the tips are in the rock: only what hangs below the gum's edge shows
        g.save();
        g.beginPath();
        g.rect(x - 2 * s, y, 4 * s, 3 * s);
        g.clip();
        g.translate(x, y);
        g.scale(s, s);
        Devil.trident(g, 0, 0, 3.2 / s, { ang: -0.17 + q, grip: 2.2 });
        g.restore();
        // the gum cracked round them
        for (const [dx, a, len] of [[-30, -2.5, 20], [-12, -1.9, 15], [8, -1.2, 17], [27, -0.6, 21]]) line(g, [[x + dx * v.k, y - 2], [x + (dx + Math.cos(a) * len * 0.5) * v.k, y - 2 + Math.sin(a) * len * 0.5 * v.k - 3], [x + (dx + Math.cos(a) * len) * v.k, y - 2 + Math.sin(a) * len * v.k]], 2.4, I.R.deep);
    }
    // The billboard's arrow, wedged by its tail between two teeth.
    function arrowStuck(g, v, t, wob = 0) {
        const [x, y] = v.at(HOME.arrow);
        V.arrowPlank(g, x, y, 168 * v.k, { on: true, t, ang: PI / 2 + wob, lw: 3 });
    }
    // A cone on a head of the front row. sink: the squash of its landing.
    function coneHat(g, v, f, t, o, tilt, sink = 0) {
        const a = figAt(f, t, o), [x, y] = v.at([a.x + 4, a.top + 1]);
        V.cone(g, x, y + sink * 5 * v.k, CONE_S * v.k * (1 + 0.0 * sink), tilt);
    }
    // The imp on its colleague's hard hat: its pose on the beat, and where its mallet's head is (SET coordinates).
    const impPose = (t, o) => {
        const Pu = S.pulseAt(t), hype = clamp(o.hype ?? 0);
        return { tone: 0.12, squash: 0.04 * Pu.pulse * hype, up: lerp(0.15, 0.6 + 0.4 * Pu.pulse, smooth(hype * 2)), swing: hype > 0.3 ? 0.25 * Math.cos((Pu.k + Pu.since) * PI) : 0, tail: 0.05 * Math.sin(C.onTwos(t) * 2.2) };
    };
    function malletTop(t, o, pose = {}) {
        const a = figAt(CATCHER, t, o), p = { ...impPose(t, o), ...pose }, ang = 0.34 - 0.24 * p.up + p.swing, q = rot([0, -1.01 * 0.8 * IMP_U], ang);
        return [a.x + 7 + 0.66 * IMP_U + q[0], a.hat + (-0.74 - 0.4 * p.up) * IMP_U + q[1], ang];
    }
    // scarf: seconds since the Devil's scarf came down on the mallet (null: no scarf)
    function impOnSkull(g, v, t, o, pose = {}, scarfAge = null) {
        const a = figAt(CATCHER, t, o), [x, y] = v.at([a.x + 7, a.hat]);
        impBack(g, x, y, IMP_U * v.k, { ...impPose(t, o), ...pose });
        if (scarfAge != null) {
            // it hangs over the mallet's head like a flag, both ends swinging with it
            const m = malletTop(t, o, pose), [mx, my] = v.at(m), ms = 0.8 * IMP_U * v.k, d = C.drawing(t), fl = [0, 5, -4][((d % 3) + 3) % 3] * v.k, sw = 30 * Math.sin(m[2] - 0.2) * v.k + 10 * v.k * Math.exp(-scarfAge * 4) * Math.cos(scarfAge * 20);
            const on = (px, py) => {
                const r = rot([px * ms, py * ms], m[2]);
                return [mx + r[0], my + r[1]];
            };
            const l = on(-0.4, -0.02), r = on(0.4, -0.02);
            scarf(g, C.curve([[l[0] - 6 * v.k - sw * 0.6, l[1] + 50 * v.k + fl], [l[0] - 3 * v.k, l[1] + 16 * v.k], on(-0.3, -0.27), on(0, -0.3), on(0.3, -0.27), [r[0] + 3 * v.k, r[1] + 18 * v.k], [r[0] + 8 * v.k - sw, r[1] + 62 * v.k - fl]], false, 4), 0.07 * 84 * v.k, 2.8);
        }
    }
    /**
     * What the car threw off, where it stays, for any venue shot after the entrance.
     *   o: { view, pan, hype, lighters, wave   as the venue's and the crowd's this frame
     *        part: 'back' (after Inferno.venue: the arrow in the teeth, the trident in the gum),
     *              'stage' (after Rig.band, before Inferno.crowd: the barrier on the lip),
     *              'front' (after Inferno.crowd: the cones on two heads, the imp on a colleague's hard hat),
     *        scarf: seconds since the Devil's scarf came down on the imp's mallet (absent: no scarf there) }
     */
    function dressing(g, t, o = {}) {
        const v = view(o);
        if (o.part === 'back') {
            arrowStuck(g, v, t);
            forkStuck(g, v);
        } else if (o.part === 'stage') {
            V.barrier(g, ...v.at(HOME.barrier), BARRIER_S * v.k, { t });
        } else {
            coneHat(g, v, HAT_A, t, o, -0.12);
            coneHat(g, v, HAT_B, t, o, 0.1);
            impOnSkull(g, v, t, o, {}, o.scarf ?? null);
        }
    }

    // =========================================================================================
    // The landing
    // =========================================================================================
    const DUSTC = { back: '#b2596b', fore: '#e7a3ad', stone: I.R.wallL };
    /**
     * Rock dust where the car comes down on the shelf: a flat flash under it (part 'flash',
     * before the car), then puffs that roll out from both axles and thin, chips of the shelf
     * thrown up. (x, y): the ground under the car's middle, on screen; s: its scale; k: how hard.
     */
    function landing(g, x, y, s, age, part = 'dust', k = 1) {
        if (age < -1e-6 || age > 0.85) return;
        const d = Math.floor(age * 12 + 1e-6), u = age / 0.85, r = Motion.rng('chorus3-land' + k);
        if (part === 'flash') {
            if (d < 2) {
                const f = (d === 0 ? 1 : 1.2) * k;
                C.burst(g, x, y - 0.1 * s, { r0: 2.9 * f * s, r1: 4.2 * f * s, n: 13, seed: 'chorus3-flash', jitter: 0.2, rot: d * 0.12, fill: K.white, ink: K.ink, lw: 3.2, sx: 1.42, sy: 0.26 });
                C.burst(g, x, y - 0.1 * s, { r0: 1.8 * f * s, r1: 2.7 * f * s, n: 11, seed: 'chorus3-flash2', jitter: 0.2, rot: 0.3 + d * 0.12, fill: K.yellow, ink: K.ink, lw: 2.6, sx: 1.42, sy: 0.2 });
            }
            return;
        }
        const grow = 1 - Math.pow(1 - u, 2.4), back = [], fore = [];
        for (const side of [-1, 1]) {
            for (let i = 0; i < 6; i++) {
                const out = 0.3 + 2.2 * r(), size = (0.3 + 0.3 * r()) * k, end = 0.5 + 0.5 * r(), n = 5 + Math.floor(r() * 3), a0 = r() * TAU, up = r();
                const life = Math.max(0, 1 - u / end), rad = size * Math.min(1, 0.45 + u * 4) * Math.pow(life, 0.6) * (1 + 0.05 * (((d + i) % 2) * 2 - 1));
                const px = side * (3.55 + (i % 2 ? out : -out * 0.5) * grow), py = -rad * 0.6 - up * 0.5 * grow;
                (i < 3 ? back : fore).push([x + px * s, y + py * s, rad * s * (i < 3 ? 1.1 : 0.8), n, a0 + 0.4 * (((d + i * 2) % 3) - 1)]);
            }
        }
        for (let i = 0; i < 9; i++) {
            const side = i % 2 ? 1 : -1, vx = side * (1.5 + 3.5 * r()), vy = -(3 + 3.4 * r()) * k, sz = (0.04 + 0.04 * r()) * s, ta = Math.floor(age * 12 + 1e-6) / 12;
            const px = x + (side * 3.55 + vx * ta) * s, py = y + Math.min(0, vy * ta + 9 * ta * ta) * s - 3;
            if (py < y - 4) C.poly(g, [[px - sz, py], [px, py - sz], [px + sz, py + sz * 0.4], [px - sz * 0.2, py + sz]].map((p) => [x + (p[0] - x), p[1]]), { fill: DUSTC.stone, ink: K.ink, lw: 2.2 });
        }
        P1.puffs(g, back, DUSTC.back, 3);
        P1.puffs(g, fore, DUSTC.fore, 3);
    }

    // =========================================================================================
    // The title, on the venue's banner: DREAM in solid letters on the blank cloth, RUNNIN' DOWN A
    // standing on the bone that carries it, a flat star behind that line (the film's title look,
    // chorus1-props' title, set on this piece of the set).
    //   o: { view, pan, at: [t1, t2, t3] when the three words pop, out: when they leave, slam: true for the big hit }
    // Draw it right after Inferno.venue.
    // =========================================================================================
    const BAN = { x: 360, y: 340, w: 280, h: 86 };
    function title(g, t, o) {
        const [t1, t2, t3] = o.at, v = view(o), k = v.k, Pu = S.pulseAt(t), ph = Pu.k + Pu.since, d = C.drawing(t);
        if (t < t1 - 1e-6) return;
        const leave = (wi) => (o.out == null || t < o.out - 1e-6 ? 1 : [1.12, 0.7, 0.3, 0][Math.min(3, kOf(t, o.out))]);
        const [lx, ly] = v.at([BAN.x + BAN.w / 2, 316]), [dx, dy] = v.at([BAN.x + BAN.w / 2 - 2, BAN.y + BAN.h - 10]);
        // the star behind the first line: under RUNNIN', then stretched under DOWN A; it breathes on the beat
        const two = t >= t2 - 1e-6, bp = (two ? 0.9 + 0.1 * S.pop(t, t2, 0.2) : S.pop(t, t1, 0.2)) * leave(0) * (1 + 0.03 * Pu.pulse);
        if (bp > 0) C.burst(g, lx + (two ? 0 : -62 * k), ly - 17 * k, { r0: (two ? 150 : 92) * bp * k, r1: (two ? 186 : 118) * bp * k, n: two ? 19 : 13, seed: 'chorus3-title', jitter: 0.14, rot: d % 4 < 2 ? 0 : 0.03, fill: K.pink, ink: K.ink, lw: 4.2, sy: two ? 0.2 : 0.3 });
        if (o.slam) {
            // the big hit: a white star flashes behind the whole banner for two drawings
            const kd = kOf(t, t1);
            if (kd >= 0 && kd < 2) C.burst(g, lx, ly + 44 * k, { r0: (190 + 26 * kd) * k, r1: (262 + 36 * kd) * k, n: 17, seed: 'chorus3-slam', rot: kd * 0.1, fill: kd ? K.yellow : K.white, ink: K.ink, lw: 4, sy: 0.46 });
        }
        const word = (text, wx, wy, size, when, wi, opt) =>
            C.text3d(g, text, wx, wy, {
                size, dir: [0.72, 0.7], ...opt,
                letter: (i) => {
                    const w = when(i), p = S.pop(t, w, 0.25) * leave(wi(i));
                    if (p <= 0) return { hide: true };
                    const settled = t > w + 0.3;
                    return { s: p, rot: (i % 2 ? 1 : -1) * 0.035, dy: settled ? -5 * k * Pu.pulse * ((i + Math.floor(ph + 1e-6)) % 2 ? 1 : 0.35) : 0 };
                },
            });
        word("RUNNIN' DOWN A", lx, ly, 47 * k, (i) => (i < 7 ? t1 : t2), (i) => (i < 7 ? 0 : 1), { face: K.white, side: K.ink, side2: K.white, bands: 4, depth: 7 * k, ow: 2.6, track: 1 * k });
        word('DREAM', dx, dy, 88 * k, () => t3, () => 2, { face: K.yellow, side: K.red, side2: K.orange, bands: 3, depth: 10 * k, ow: 3.4, track: 5 * k });
    }

    // =========================================================================================
    // Follow spots: the house goes dark and a hard-edged beam finds each player.
    //   spots: [{ from: [x, y] (set), to: [x, y] (set: the middle of the pool, on the deck), rx, ry, on (0..1), col }]
    //   dark: 0..1 how dark the house is outside the beams
    // Call between Rig.band and Inferno.crowd. Uses its own layer (env) to cut the beams out of the dark.
    // =========================================================================================
    function followSpots(g, env, o, spots, dark) {
        const v = view(o);
        const cone = (c, sp, grow = 1) => {
            const a = v.at(sp.from), b = v.at(sp.to), rx = sp.rx * v.k * grow, ry = sp.ry * v.k * grow;
            const ang = Math.atan2(b[1] - a[1], b[0] - a[0]), nx = -Math.sin(ang), ny = Math.cos(ang), w0 = 16 * v.k;
            c.beginPath();
            c.moveTo(a[0] + nx * w0, a[1] + ny * w0);
            c.lineTo(a[0] - nx * w0, a[1] - ny * w0);
            c.lineTo(b[0] - nx * rx, b[1] - ny * rx * 0.3);
            c.lineTo(b[0] + nx * rx, b[1] + ny * rx * 0.3);
            c.closePath();
            c.fill();
            c.beginPath();
            c.ellipse(b[0], b[1], rx, ry, 0, 0, TAU);
            c.fill();
        };
        if (dark > 0.01) {
            const veil = Motion.layer(env, 'chorus3-veil', (c) => {
                c.fillStyle = '#1a0b2a';
                c.fillRect(0, 0, 1000, 1000);
                c.globalCompositeOperation = 'destination-out';
                c.fillStyle = '#000';
                for (const sp of spots) if (sp.on > 0) cone(c, sp, sp.on);
                c.globalCompositeOperation = 'source-over';
            });
            g.save();
            g.globalAlpha = 0.62 * dark;
            Motion.drawLayer(g, env, veil);
            g.restore();
        }
        // the beams' own colour, thin, and a rim on each pool
        g.save();
        g.globalCompositeOperation = 'screen';
        for (const sp of spots) {
            if (sp.on <= 0) continue;
            g.globalAlpha = 0.16;
            g.fillStyle = sp.col;
            cone(g, sp, sp.on);
        }
        g.restore();
    }

    // =========================================================================================
    // The Devil's cold: verse 3's drawing of it (Verse3bProps.devil: the teal scarf with white
    // stripes, the sore nose). Without the scarf, only the nose is left.
    //   cold: { scarf (false once he has thrown it), t, blow, nose, tail, noTail }
    // =========================================================================================
    function devil(g, x, y, s, pose = {}, cold = {}) {
        if (cold.scarf !== false) return V.devil(g, x, y, s, pose, cold);
        Devil.draw(g, x, y, s, pose);
        const L = 3.2 / s, q = pose.squash ?? 0, nr = 0.082 * (cold.nose ?? 1);
        g.save();
        g.translate(x, y);
        g.scale(s, s);
        g.rotate(pose.lean ?? 0);
        g.scale(1 + q, 1 - q);
        g.translate(0, pose.headDy ?? 0);
        g.rotate(pose.headTilt ?? 0);
        V.dot(g, 0.045, -1.225, nr, K.pink, L);
        V.dot(g, 0.02, -1.25, nr * 0.3, '#ffffff');
        g.restore();
    }
    // The scarf alone: a striped band along a centreline (screen points), fringed at both ends.
    function scarf(g, pts, w, lw = 3) {
        V.band(g, pts, w, V.SCARF, V.STRIPE, lw, { fringe: w * 0.9 });
        V.band(g, [pts[1], pts[0]], w, V.SCARF, V.SCARF, lw, { fringe: w * 0.9 });
    }

    // =========================================================================================
    // The pit, close: the reverse angle. Two fans of the front row stand on the pit's floor, the
    // hall's back wall and the rest of the crowd behind them, the stage's beams sweeping over.
    //   o: { heat (0..1), back (0..1 how won over the crowd behind is),
    //        sk: { hype, tap (0..1 the toe's lift), tapHit (drawings since the toe came down), headTilt, look },
    //        im: { hype, crossed, lids (0..0.5), look, mood ('flat' | 'awe' | 'grin'), drop, coneHop } }
    // =========================================================================================
    const SKC = { jeans: '#3a2f5e', jeansSide: '#2c2349', shoe: '#2a2438', shoeTop: '#3d3652', shoeSide: '#1f1a2b', sole: '#fffdf4' };
    const PIT = { ground: 876, s: 262, skx: 650, imx: 328 };
    function pitBackdrop(g, t, o) {
        const R = I.R, d = C.drawing(t), heat = clamp(o.heat ?? 0.3), Pu = S.pulseAt(t), ph = Pu.k + smooth(Math.min(1, Pu.since / 0.5));
        g.fillStyle = R.far;
        g.fillRect(0, 0, 1000, 1000);
        // the back wall: facets of rock, a ledge, the lower jaw's teeth along it
        const r = Motion.rng('chorus3-pitwall');
        for (let i = 0; i < 54; i++) {
            const x = r() * 1040 - 20, y = r() * 600 - 20, w = 40 + 90 * r(), h = 26 + 60 * r(), sk = (r() - 0.5) * 36;
            C.poly(g, [[x, y], [x + w, y + sk * 0.3], [x + w * 0.8 + sk, y + h], [x + sk * 0.5, y + h * 0.8]], { fill: i % 3 ? R.farD : R.farL, lw: 0 });
        }
        // two lava falls down the wall, their dashes running on twos
        for (const [x, w] of [[118, 50], [886, 56]]) {
            C.poly(g, [[x - w / 2, -10], [x + w / 2, -10], [x + w / 2, 606], [x - w / 2, 606]], { fill: mix(R.glow, R.hot, 0.25 + heat * 0.5), ink: K.ink, lw: 3.2 });
            for (let i = 0; i < 9; i++) {
                const yy = ((i * 83 + d * 26 + x) % 620) - 20, xx = x - w / 2 + 7 + ((i * 37) % (w - 16));
                C.poly(g, [[xx, yy], [xx + 6, yy], [xx + 6, Math.min(604, yy + 34)], [xx, Math.min(604, yy + 34)]], { fill: i % 2 ? K.red : K.yellow, lw: 0 });
            }
            C.poly(g, [[x - w * 0.9, 608], [x - w * 0.5, 588], [x - w * 0.1, 600], [x + w * 0.3, 586], [x + w * 0.9, 608]], { fill: K.yellow, ink: K.ink, lw: 3 });
        }
        // the ledge the wall stands on, and a row of teeth along it
        for (let i = 0; i < 12; i++) {
            const x = 30 + i * 88 + (r() - 0.5) * 14, h = 50 + 34 * r();
            if (Math.abs(x - 118) < 64 || Math.abs(x - 886) < 68) continue;
            C.prism(g, cw([[x - 24, 606], [x + 3, 606 - h], [x + 26, 606]]), [7, -4.5], { front: R.tooth, top: R.toothT, side: R.toothS }, { lw: 3 });
        }
        C.box(g, -20, 604, 1040, 70, [9, -6], { front: R.wallD, top: R.wall, side: R.deep }, { lw: 3.2 });
        for (let i = 0; i < 7; i++) line(g, [[40 + i * 150 + 30 * r(), 624 + 20 * r()], [100 + i * 150 + 40 * r(), 630 + 26 * r()]], 2.4, R.deep);
        // the stage's beams, sweeping the hall over their heads
        g.save();
        g.globalCompositeOperation = 'screen';
        const cols = [K.yellow, K.aqua, K.pink, K.aqua], nb = heat < 0.2 ? 1 : heat < 0.5 ? 2 : 4;
        for (let i = 0; i < nb; i++) {
            const x0 = [200, 800, 420, 620][i], x1 = x0 + (i % 2 ? -1 : 1) * 260 + 220 * smooth(heat * 1.4) * Math.sin((ph + i * 0.66) * PI * 0.5) * (i % 2 ? -1 : 1);
            g.globalAlpha = 0.14 + 0.16 * heat + 0.06 * Pu.pulse * heat;
            g.fillStyle = cols[i];
            g.beginPath();
            g.moveTo(x0 - 70, 1000);
            g.lineTo(x0 + 70, 1000);
            g.lineTo(x1 + 190, -20);
            g.lineTo(x1 - 190, -20);
            g.closePath();
            g.fill();
        }
        g.restore();
    }
    // the fans behind the two: the venue's own close fans, pushed back into the pit's dark (their own layer, toned)
    function pitBackRow(g, t, env, o) {
        const back = clamp(o.back ?? 0), list = [[78, 800, 168, 'imp', 0.8, 'bow'], [196, 792, 172, 'skeleton', 0.5, 2], [498, 796, 168, 'imp', 0.3, 'specs'], [842, 792, 172, 'skeleton', 0.65, 1], [956, 800, 168, 'imp', 0.45, 'hat']];
        const row = Motion.layer(env, 'chorus3-pitrow', (c) => {
            for (const [x, y, s, kind, thr, w] of list) {
                const h = smooth((back - thr * 0.8) / 0.2);
                I.fan(c, x, y, s, { kind, hype: h, hold: h > 0.5 && kind === 'imp' && w === 'specs' ? 'trident' : 'none', t: t + thr * 0.04, wear: kind === 'imp' ? w : undefined, tee: kind === 'skeleton' ? w : 0, hawk: kind === 'skeleton' ? [K.sky, K.yellow, K.pink][w] : undefined, shadow: false });
            }
            c.globalCompositeOperation = 'source-atop';
            c.fillStyle = 'rgba(42,8,16,0.5)';
            c.fillRect(0, 0, 1000, 1000);
            c.globalCompositeOperation = 'source-over';
        });
        // the pit's floor: a slab of rock, lit along its far edge, two cracks that glow
        C.poly(g, [[-10, 760], [1010, 760], [1010, 1010], [-10, 1010]], { fill: I.R.deep, ink: K.ink, lw: 3.2 });
        C.poly(g, [[-10, 760], [1010, 760], [1010, 772], [-10, 772]], { fill: I.R.wallD, lw: 0 });
        line(g, [[-10, 760], [1010, 760]], 3.2);
        Motion.drawLayer(g, env, row);
        const d = C.drawing(t);
        for (const [i, pts] of [[[70, 920], [130, 908], [176, 930], [236, 914]], [[770, 934], [836, 918], [890, 936], [960, 916]]].entries()) line(g, pts, 3.4, (d + i) % 4 < 2 ? I.R.glow : '#c85a1e');
    }
    function pitSkeleton(g, t, x, y, s, a) {
        const L = 3.2 / s, tap = a.tap ?? 0, tapping = a.hype < 0.05;
        g.fillStyle = 'rgba(36,21,49,0.28)';
        g.beginPath();
        g.ellipse(x + 0.05 * s, y, 0.56 * s, 0.06 * s, 0, 0, TAU);
        g.fill();
        const A = [x - 0.4 * s, y - 0.355 * s, 0.438 * s, 0.42 * s]; // his right leg's place (screen left)
        g.save();
        if (tapping) {
            g.beginPath();
            g.rect(-100, -100, 1200, 1200);
            g.rect(...A);
            g.clip('evenodd');
        }
        I.fan(g, x, y, s, { kind: 'skeleton', hype: a.hype, hold: 'none', t, headTilt: a.headTilt ?? 0, look: a.look ?? 0, hawk: K.green, tee: 0, shadow: false });
        g.restore();
        if (!tapping) return;
        // that leg again, the shoe's toe lifted (the heel stays down)
        g.save();
        g.beginPath();
        g.rect(...A);
        g.clip();
        g.translate(x, y);
        g.scale(s, s);
        g.lineJoin = 'round';
        const lx = -0.19, h = 0.13 * tap, z = Dd(0.36);
        C.box(g, lx - 0.12, -0.4, 0.24, 0.3, D, { front: SKC.jeans, top: SKC.jeans, side: SKC.jeansSide }, { lw: L, depth: 0.3 });
        const f0 = [lx - 0.15, -0.105 - h], f1 = [lx + 0.15, -0.105 - h], b0 = [lx - 0.15 + z[0], -0.105 + z[1]], b1 = [lx + 0.15 + z[0], -0.105 + z[1]];
        C.poly(g, [f0, f1, b1, b0], { fill: SKC.shoeTop, ink: K.ink, lw: L });
        C.poly(g, [f1, b1, [b1[0], z[1]], [lx + 0.15, -h]], { fill: SKC.shoeSide, ink: K.ink, lw: L });
        C.poly(g, [f0, f1, [lx + 0.15, -h], [lx - 0.15, -h]], { fill: SKC.shoe, ink: K.ink, lw: L });
        line(g, [[lx - 0.15, -0.022 - h], [lx + 0.15, -0.022 - h]], L * 0.8, SKC.sole);
        g.restore();
        // the tap: ticks and a little dust where the toe comes down
        if (a.tapHit === 0 || a.tapHit === 1) {
            const k = a.tapHit ? 1.3 : 1, tx = x - 0.37 * s, ty = y - 0.03 * s;
            for (const [ang, r0, r1] of [[PI * 1.0, 14, 40], [PI * 1.17, 18, 50], [PI * 1.36, 16, 40]]) line(g, [[tx + Math.cos(ang) * r0 * k, ty + Math.sin(ang) * r0 * k], [tx + Math.cos(ang) * r1 * k, ty + Math.sin(ang) * r1 * k]], 4, K.cream);
            P1.puffs(g, [[tx - 4, y - 7, 11 * k, 5, a.tapHit], [tx - 22 * k, y - 5, 7 * k, 5, a.tapHit + 1]], DUSTC.fore, 2.6);
        }
    }
    function pitImp(g, t, x, y, s, a) {
        const u = s * 0.67, Pu = S.pulseAt(t), DP = Devil.P, L = 3 / u, hype = a.hype ?? 0, fr = Pu.since - Math.floor(Pu.since);
        const hop = hype * 0.16 * Math.sin(PI * Math.min(1, fr)), sq = hype * 0.06 * Pu.pulse + 0.1 * (a.drop ?? 0), flat = a.mood === 'flat';
        Devil.imp(g, x, y, u, { squash: sq, hop, mood: flat ? 'grin' : a.mood, look: a.look ?? 0, armUp: a.crossed ? NaN : hype, tail: 0.05 * Math.cos((Pu.k + Pu.since) * PI) * (0.3 + hype) });
        g.save();
        g.translate(x, y - hop * u);
        g.scale(u * (1 + sq), u * (1 - sq));
        g.lineJoin = 'round';
        const top = -1.02, ey = top + 0.33, lids = a.lids ?? 0;
        if (lids > 0.01) {
            // unconvinced: heavy lids
            for (const sx of [-1, 1]) {
                const ex = sx * 0.22;
                g.fillStyle = DP.skin;
                g.fillRect(ex - 0.14, ey - 0.15, 0.28, 0.03 + 0.24 * lids);
                line(g, [[ex - 0.135, ey - 0.12 + 0.24 * lids], [ex + 0.135, ey - 0.12 + 0.24 * lids - sx * 0.02]], L * 1.5);
            }
        }
        if (flat) {
            // and a flat mouth over the grin
            g.fillStyle = DP.skin;
            g.fillRect(-0.2, top + 0.53, 0.4, 0.2);
            line(g, [[-0.13, top + 0.62], [0.12, top + 0.6]], L * 1.3);
        }
        if (a.crossed) {
            // arms crossed over his belly: the far one first
            const cols = { front: DP.skin, top: DP.skinTop, side: DP.skinSide };
            const stub = (sh, hand) => {
                const dx = hand[0] - sh[0], dy = hand[1] - sh[1], len = Math.hypot(dx, dy) || 1e-6, ux = dx / len, uy = dy / len, nx = -uy * 0.08, ny = ux * 0.08;
                C.prism(g, cw([[sh[0] + nx, sh[1] + ny], [hand[0] + ux * 0.08 + nx, hand[1] + uy * 0.08 + ny], [hand[0] + ux * 0.08 - nx, hand[1] + uy * 0.08 - ny], [sh[0] - nx, sh[1] - ny]]), Dd(0.14), cols, { lw: L });
            };
            stub([0.5, -0.5], [-0.2, -0.31]);
            stub([-0.5, -0.5], [0.22, -0.39]);
        }
        g.restore();
        // the cone he wears: it leaves his head at the top of each hop and comes back down on it
        const ch = a.coneHop != null && a.coneHop >= 0 ? 0.09 * u * Math.max(0, Math.sin(PI * (fr - 0.3) / 0.7)) : 0;
        V.cone(g, x + 0.02 * u, y - hop * u - 1.02 * u * (1 - sq) + 2 - ch, u * 1.1, -0.12 + (ch > 0 ? 0.06 : 0));
    }
    function pitShot(g, t, env, o) {
        pitBackdrop(g, t, o);
        pitBackRow(g, t, env, o);
        pitImp(g, t, PIT.imx, PIT.ground, PIT.s, o.im);
        pitSkeleton(g, t, PIT.skx, PIT.ground, PIT.s, o.sk);
    }

    return { pitShot, malletTop, view, fig, figAt, HAT_A, HAT_B, CATCHER, HOME, IMP_U, CONE_S, BARRIER_S, impBack, forkStuck, arrowStuck, coneHat, impOnSkull, dressing, landing, title, BAN, followSpots, devil, scarf, lerp, clamp, smooth, rot, kOf, bump, mix };
})();
