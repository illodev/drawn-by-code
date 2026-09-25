// Segment «Newton's apple» of physics-history (script v2, 5–12 s of the piece; local 0–7):
// an apple hangs among the leaves; it falls, the camera follows it down and it lands on
// Newton's head (bonk, little stars going round). He gets up, picks it up, looks at it,
// glances at the daytime Moon and throws it up hard. The camera pulls away, Powers of Ten
// style: the field, the rolling land, the coast, the curve of the Earth, and the apple rises
// and bends into an orbit round the globe.
//
//   Seg.newtonApple.init() → state · draw(press, tq, st) · APPLE(t) (the apple's screen
//   position and radius, for the next join)
//
// World units at the start: 1 head (u) = 95 units ≈ 23 cm, so 1 unit ≈ 2.4 mm and the Earth's
// radius is 2.65e9 units. The pull-back is a zoom z from 1 to 8.7e-8 (the globe 230 units
// across the screen), eased on log z.
var Seg = globalThis.Seg ?? (globalThis.Seg = {});
(() => {
    const { put, ink, line, smooth, poly, taper, circle, ellipse } = Ph;
    const L = Ease.lerp, S = Ease.seg, IO = Ease.inOut;
    const u = 95, G = 820;
    const RW = 2.65e9;
    // the beats (120 BPM): the bonk on 1.5, the throw on 5.0; snap is set by the fall's time
    const T = { bonk: 1.5, release: 5.0, pull: [5.05, 6.6] }; // the zoom ends at 6.6; then the apple orbits a globe that holds still
    const APPLE_R = 30;
    const GRAV = 4080; // g in world units (1 unit ≈ 2.4 mm): 9.8 m/s²
    // ── colours ──────────────────────────────────────────────────────────────────────────
    const LEAF = [{ yellow: 1, 'blue.s': 0.62, 'navy.s': 0.25 }, { yellow: 1, 'blue.s': 0.5, 'navy.s': 0.1 }, { yellow: 1, 'blue.s': 0.72, 'navy.s': 0.42 }];
    const LEAF_LT = { yellow: 1, 'blue.s': 0.35 };
    const BARK = { 'yellow.s': 0.7, 'pink.s': 0.55, 'navy.s': 0.6 };
    const BARK_LT = { 'yellow.s': 0.6, 'pink.s': 0.4, 'navy.s': 0.3 };
    const GRASS = { yellow: 1, 'blue.s': 0.55, 'navy.s': 0.05 };
    const GRASS_DK = { yellow: 1, 'blue.s': 0.75, 'navy.s': 0.35 };
    const APPLE = { pink: 1, yellow: 1, 'navy.s': 0.05 };
    const APPLE_SH = { pink: 1, yellow: 1, 'navy.s': 0.45 };
    const AMBER = { yellow: 1, 'pink.s': 0.55 };

    // ── choreography ────────────────────────────────────────────────────────────────────
    // Newton as channels (figure.js: Fig.build/track/foot): the pelvis, the spine and neck
    // angles, the hands with elbow poles, the feet planted between steps. Keys are spaced by
    // the action (anticipation, overlap, settle), and motion flows through them.
    const CH = {
        P: [[0, [440, 772]], [1.46, [440, 772]], [1.5, [440, 780]], [1.62, [440, 768]], [1.8, [440, 772]], [2.55, [440, 772]], [2.8, [462, 766]], [3.05, [515, 640]], [3.3, [552, 454]], [3.4, [558, 447]], [3.62, [612, 452]], [3.78, [614, 449]], [3.95, [665, 655]], [4.05, [665, 655]], [4.3, [612, 452]], [4.62, [612, 450]], [4.78, [588, 458]], [4.92, [652, 448]], [5.0, [690, 452]], [5.2, [706, 458]], [5.55, [700, 450]], [7, [700, 450]]],
        sp: [[0, -0.1], [1.46, -0.1], [1.5, 0.05], [1.62, -0.24], [1.9, -0.12], [2.55, -0.1], [2.8, 0.7], [3.05, 0.55], [3.3, 0.08], [3.42, 0.0], [3.62, 0.1], [3.78, 0.04], [3.95, 1.1], [4.05, 1.1], [4.3, 0.02], [4.62, 0.0], [4.78, -0.26], [4.92, 0.08], [5.0, 0.36], [5.2, 0.46], [5.55, 0.08], [7, 0.06]],
        nk: [[0, 0.4], [1.46, 0.4], [1.5, 0.75], [1.62, -0.2], [1.9, 0.12], [2.2, 0.25], [2.55, 0.3], [2.8, 0.1], [3.3, 0.3], [3.62, 0.3], [3.95, -0.55], [4.05, -0.55], [4.3, 0.2], [4.47, 0.28], [4.57, -0.42], [4.78, -0.3], [5.0, -0.2], [5.3, -0.6], [7, -0.62]],
        poleN: [[0, [60, 80]], [1.5, [60, 80]], [1.62, [40, 60]], [1.8, [90, -60]], [2.3, [90, -60]], [2.55, [60, 100]], [3.3, [-20, 120]], [3.8, [40, 120]], [4.3, [30, 140]], [4.62, [30, 140]], [4.78, [-160, 60]], [4.92, [-60, -90]], [5.0, [40, -100]], [5.2, [60, 80]], [7, [60, 80]]],
        poleF: [[0, [60, 80]], [1.62, [20, 100]], [3.3, [-20, 120]], [4.62, [-20, 120]], [4.78, [60, 40]], [5.0, [-40, 100]], [7, [-40, 100]]],
        kneeN: [[0, [40, -130]], [2.9, [40, -130]], [3.3, [150, 0]], [7, [150, 0]]],
        kneeF: [[0, [30, -130]], [2.9, [30, -130]], [3.3, [150, 0]], [7, [150, 0]]],
        look: [[0, [0.8, 0.9]], [1.5, [0.8, 0.9]], [2.2, [1, 0.4]], [2.6, [1, 0.5]], [3.3, [1, 0.7]], [3.95, [0.6, 1]], [4.3, [1, 0.2]], [4.47, [1, 0.1]], [4.57, [0.6, -1]], [4.72, [0.8, -0.6]], [5.0, [0.6, -0.9]], [5.3, [0.3, -1]], [7, [0.3, -1]]],
        brow: [[0, 0], [1.5, 0], [1.62, 1], [2.3, 0.6], [2.6, 0.2], [4.3, 0.4], [4.47, 0.8], [4.57, 1], [4.75, 0.3], [5.3, 1], [7, 1]],
        shut: (t) => t >= 1.5 && t < 2.2,
        gripN: (t) => (t < 3.9 ? 0.5 : t < 3.97 ? 0.15 : t < T.release ? 'apple' : 0.05),
        gripF: (t) => (t < 3.05 ? 0.5 : 0.3),
    };
    const FEET_N = [[3.42, 3.62, 575, 690, 34], [4.74, 4.92, 690, 782, 28]];
    const FEET_F = [[3.58, 3.78, 550, 604, 26], [5.06, 5.3, 604, 652, 12]];
    // the apple's path, from physics: it falls from rest onto Newton's head at T.bonk, bounces
    // off with a restitution, lands, bounces once more and rolls to a stop on the grass
    const sitPose = (t) => Fig.build(CH, t, u);
    const headTop = (() => { const p = sitPose(T.bonk); return [p.H[0] + 6, p.H[1] - 0.64 * u]; })();
    const IMPACT = [headTop[0], headTop[1] - APPLE_R];
    const DROP = 470, T_FALL = Math.sqrt((2 * DROP) / GRAV);
    const HANG = [IMPACT[0], IMPACT[1] - DROP];
    T.snap = T.bonk - T_FALL;
    const REST_Y = G - APPLE_R + 6, VX = 380, VY = -860;
    const T1 = (-VY + Math.sqrt(VY * VY + 2 * GRAV * (REST_Y - IMPACT[1]))) / GRAV; // first flight
    const VY_LAND = VY + GRAV * T1, VY2 = -0.25 * VY_LAND, VX2 = 0.6 * VX, T2 = (-2 * VY2) / GRAV;
    const X1 = IMPACT[0] + VX * T1, X2 = X1 + VX2 * T2, VX3 = 0.6 * VX2, TROLL = 0.55;
    const REST_X = X2 + (VX3 * TROLL) / 2;
    T.land = T.bonk + T1; T.land2 = T.land + T2; T.rest = T.land2 + TROLL;
    // the hand reaches the resting apple: the grab key is placed from the physics
    const GRAB = [REST_X - 1.4 * APPLE_R, REST_Y - 2.6 * APPLE_R]; // above and behind it: the hand comes down on its top // the wrist above and behind it: the hand comes down on its top
    CH.hN = [[0, [560, 598]], [1.46, [560, 598]], [1.5, [584, 556]], [1.62, [520, 520]], [1.8, [448, 404]], [1.9, [460, 398]], [2.0, [436, 404]], [2.1, [458, 398]], [2.2, [438, 404]], [2.32, [452, 400]], [2.55, [560, 610]], [2.8, [600, 650]], [3.05, [590, 560]], [3.3, [575, 470]], [3.62, [640, 470]], [3.8, [690, 560]], [3.95, GRAB], [4.05, GRAB], [4.3, [745, 205]], [4.47, [742, 210]], [4.62, [735, 215]], [4.78, [455, 95]], [4.92, [560, 70]], [5.0, [880, 40]], [5.1, [960, 230]], [5.25, [905, 420]], [5.6, [830, 380]], [7, [830, 380]]];
    CH.hF = [[0, [576, 590]], [1.46, [576, 590]], [1.5, [600, 548]], [1.62, [560, 700]], [2.55, [540, 640]], [2.8, [560, 690]], [3.05, [600, 610]], [3.3, [520, 470]], [3.62, [580, 460]], [3.95, [735, 700]], [4.3, [600, 460]], [4.62, [600, 460]], [4.78, [720, 330]], [4.92, [740, 300]], [5.0, [560, 420]], [5.3, [580, 470]], [7, [580, 470]]];
    function poseAt(t) {
        const n = Fig.foot(FEET_N, 575, t, 812), f = Fig.foot(FEET_F, 550, t, 812);
        return Fig.build(CH, t, u, { fN: n.p, fF: f.p, toeN: n.toe, toeF: t > 5.05 ? 0.5 * S(t, 5.0, 5.15) : f.toe });
    }
    function appleWorld(t, wrist) {
        if (t < T.snap) {
            // it hangs, twitches as the stalk gives, then goes
            const tw = S(t, T.snap - 0.35, T.snap) * Math.sin(t * 60) * 2;
            return { p: [HANG[0] + Math.sin(t * 2.2) * 4 + tw, HANG[1] + Math.cos(t * 1.7) * 1.5], rot: Math.sin(t * 2.2) * 0.1 };
        }
        if (t < T.bonk) { const d = t - T.snap; return { p: [HANG[0], HANG[1] + 0.5 * GRAV * d * d], rot: d * 1.2 }; }
        if (t < T.land) { const d = t - T.bonk; return { p: [IMPACT[0] + VX * d, IMPACT[1] + VY * d + 0.5 * GRAV * d * d], rot: 0.7 + d * 9, squash: d < 1 / 12 ? 0.72 : 1 }; }
        if (t < T.land2) { const d = t - T.land; return { p: [X1 + VX2 * d, REST_Y + VY2 * d + 0.5 * GRAV * d * d], rot: 7 + d * 7, squash: d < 1 / 12 ? 0.85 : 1 }; }
        if (t < 3.97) { const d = Math.min(t - T.land2, TROLL), x = X2 + VX3 * d - (VX3 / (2 * TROLL)) * d * d; return { p: [x, REST_Y], rot: 8.8 + (x - X2) / APPLE_R }; }
        return { p: [wrist[0] + 18, wrist[1] - 12], rot: 9.5 };
    }
    const BOOK_REST = [610, G + 4];

    // the camera for shots A and B: centre in world units and zoom
    const CAM = [[T.bonk, [500, 540]], [2.2, [560, 560]], [2.9, [560, 560]], [3.3, [600, 420]], [3.7, [660, 440]], [4.0, [690, 560]], [4.35, [700, 340]], [4.7, [690, 250]], [5.0, [700, 180]], [7, [700, 180]]];
    const ZK = [[T.bonk, 1.65], [2.2, 1.45], [2.9, 1.45], [3.3, 1.35], [3.7, 1.35], [4.0, 1.45], [4.35, 1.4], [4.7, 1.3], [5.0, 1.25], [7, 1.25]];
    // the join from Galileo: his Jupiter turns into this apple and fills the frame (radius
    // 1400 at the centre); here the camera pulls out of the apple's skin to the hanging apple
    const INTRO = 0.6, Z_IN = 1400 / APPLE_R;
    function camAB(t, apple) {
        if (t < INTRO) {
            const k = Ease.inOut(S(t, 0, INTRO));
            const c1 = [HANG[0] + 20, HANG[1] + 60];
            return { c: [L(apple[0], c1[0], k), L(apple[1], c1[1], k)], z: Math.exp(L(Math.log(Z_IN), Math.log(2.0), Ease.out(S(t, 0, INTRO)))) };
        }
        if (t < T.bonk) {
            // before the snap the camera hangs with the apple; then it rides down with the fall
            // (the apple stays just above centre) and settles on the bonk framing
            const k = IO(S(t, T.snap, T.bonk));
            // follow the apple, handing over to the bonk framing by the impact (no jump)
            const follow = L(apple[1] + 60, 540, k * k);
            return { c: [L(HANG[0] + 20, 500, k), t < T.snap ? HANG[1] + 60 : follow], z: L(2.0, 1.65, k) };
        }
        const shake = t < T.bonk + 0.2 ? Math.sin((t - T.bonk) * 90) * 10 * (1 - (t - T.bonk) / 0.2) : 0;
        const c = Fig.track(CAM, t);
        return { c: [c[0], c[1] + shake], z: Fig.track(ZK, t) };
    }

    // ── the pull-back (shot C) ──────────────────────────────────────────────────────────
    const ZEND = 260 / RW; // the globe 520 px across at the end (radius 260)
    const Z0 = 1.25; // = ZK at the release // the last key of shot B's camera: the pull-back starts from it, no jump
    // smoothstep in log z: it starts sooner than a cubic ease, so the world falls away while the
    // apple still has its speed (the world height h = GD / z keeps growing)
    const zoomAt = (t) => { const k = S(t, T.pull[0], T.pull[1]); return Z0 * Math.exp(Math.log(ZEND / Z0) * k * k * (3 - 2 * k)); };
    // the anchor (Newton's feet) on screen: from where shot B leaves it to the globe's top
    const FEET = [700, G]; // the anchor under the camera at the release
    // the anchor's height on screen: from under the frame (the throw is framed at the waist)
    // it comes up fast so the ground and its horizon are in view, then settles high on the
    // globe's top
    // After the release the camera rides with the apple: AY is the apple's height on screen
    // (it leaves the hand at y 260 and the camera tilts up after it, so it settles near the
    // top), GD the screen distance from the apple down to the ground. GD first grows (the
    // camera still at 1.25: the ground drops out of frame below, the apple rising fast and
    // slowing), then the zoom-out brings the shrinking world back up under it, to the globe.
    const AY = [[T.release, (28 - 180) * 1.25 + 450], [5.12, 190], [5.3, 165], [6.3, 160], [T.pull[1], 140]];
    const GD = [[T.release, (G - 28) * 1.25], [5.12, 1400], [5.28, 1600], [5.5, 700], [5.9, 480], [6.4, 280], [T.pull[1], 110]];
    const AX = [[T.release, 1025], [5.12, 1075], [5.3, 1100], [5.9, 1000]];
    const LEAN = 0.36; // the throw goes up and forward (≈ 20° from the vertical)
    const anchorY = (t) => Fig.track(AY, t) + Fig.track(GD, t);
    // the ground under the camera: it slides back a little as the apple flies forward (never
    // forward again), and ends as the globe's top at (780, 250)
    const GX = [[T.release, 800], [5.3, 786], [6.6, 780], [7, 780]];
    function anchorAt(t, camB) {
        return [Fig.track(GX, t), L(Fig.track(AY, t) + Fig.track(GD, t), 250, IO(S(t, 6.0, 6.6)))];
    }
    // the apple's screen path: it leaves the hand up and forward, rides near the top while
    // the world falls away, then (6.6 on) falls round the finished globe in orbit; x only
    // grows until it passes the side of the globe (no going back)
    const ORB = { c: [780, 510], r: 390, phi0: 1.12, w: 0.85 };
    const orbitPos = (t) => { const f = ORB.phi0 + ORB.w * (t - 6.6); return [ORB.c[0] + Math.sin(f) * ORB.r, ORB.c[1] - Math.cos(f) * ORB.r]; };
    const PATH = [[T.release, [1047, 230]], [5.12, [1075, 190]], [5.3, [1098, 166]], [6.0, [1110, 170]], [6.6, orbitPos(6.6)], [7.0, orbitPos(7.0)]];
    const applePos = (t) => (t >= 6.6 ? orbitPos(t) : Fig.track(PATH, t));
    // terrain height along the ground (world units) as a sum of octaves: fields, hills, downs;
    // flat near Newton; the land ends at the coast (s > 1.1e8, the North Sea)
    function terrain(s) {
        // zero-mean octaves, each fading in over its own wavelength from Newton's spot, so the
        // field is flat where he stands and the land rolls further out (no walls, no valley)
        const as = Math.abs(s);
        let h = 0;
        for (const [wl, amp] of [[9e3, 160], [5e4, 900], [3e5, 3000], [2e6, 7000], [1.2e7, 16000]]) h += amp * Math.sin(s / wl * 6.2832 + wl) * Math.min(1, as / wl);
        return s > 1.1e8 ? 0 : h;
    }

    // ── drawing ─────────────────────────────────────────────────────────────────────────
    function sky(press, t, dark) {
        // day sky: paper with a blue screen, deeper at the top; it turns into space as we rise
        ink(press, (g) => g.rect(0, 0, 1600, 900), { 'blue.s': (g) => Riso.ramp(g, 0, 0, 0, 900, 0.42 * (1 - dark), 0.14 * (1 - dark)) });
        if (dark > 0) ink(press, (g) => g.rect(0, 0, 1600, 900), { blue: 0.9 * dark, 'navy.s': (g) => Riso.radial(g, 820, 420, 120, 1000, 0.5 * dark, 0.95 * dark) });
    }
    function sun(press, x, y, t) {
        for (let i = 0; i < 12; i++) {
            const a = i / 12 * 6.2832 + t * 0.15;
            line(press, [[x + Math.cos(a) * 70, y + Math.sin(a) * 70], [x + Math.cos(a) * 110, y + Math.sin(a) * 110]], taper(9), { yellow: 1, 'pink.s': 0.15 });
        }
        put(press, circle(x, y, 56), { yellow: 1, 'pink.s': 0.2 });
        press.knockout(ellipse(x - 16, y - 18, 14, 10));
    }
    function cloud(press, x, y, s, spec = { 'blue.s': 0.08 }) {
        const bumps = [[-60, 10, 38], [-20, -14, 48], [30, -6, 44], [70, 12, 32], [0, 18, 40]];
        put(press, (g) => { g.beginPath(); for (const [bx, by, r] of bumps) { g.moveTo(x + (bx + r) * s, y + by * s); g.arc(x + bx * s, y + by * s, r * s, 0, 6.2832); } }, spec);
        ink(press, (g) => g.rect(x - 110 * s, y + 18 * s, 220 * s, 30 * s), { 'blue.s': 0.2 });
    }
    function moon(press, x, y) {
        put(press, circle(x, y, 30), { 'blue.s': 0.12 });
        ink(press, (g) => { g.arc(x + 12, y - 4, 26, 0, 6.2832); }, { 'blue.s': 0.28 });
        for (const [dx, dy, r] of [[-10, -8, 5], [6, 10, 4], [-4, 12, 3]]) ink(press, circle(x + dx, y + dy, r), { 'blue.s': 0.3 });
    }
    // ── the orchard at Woolsthorpe, in layers from the far downs to the grass at our feet ──
    const fadeSpec = (f) => (spec) => (f < 1 ? Object.fromEntries(Object.entries(spec).map(([k, v]) => [k.endsWith('.s') ? k : k + '.s', v * f])) : spec);
    const STONE = [{ 'yellow.s': 0.42, 'pink.s': 0.22, 'navy.s': 0.12 }, { 'yellow.s': 0.5, 'pink.s': 0.3, 'navy.s': 0.2 }, { 'yellow.s': 0.36, 'pink.s': 0.16, 'navy.s': 0.06 }];
    function backdrop(press, t, f) {
        const Sf = fadeSpec(f), K = { knock: f >= 1 };
        const r = Motion.rng('downs');
        // far downs: a patchwork of fields in soft screens, hedges between them, copses
        put(press, (g) => smooth(g, [[-1400, 600], [-700, 520], [0, 560], [700, 500], [1400, 540], [2400, 490], [3200, 560], [3200, 900], [-1400, 900]], false), Sf({ 'blue.s': 0.4, 'yellow.s': 0.3 }), K);
        for (let i = 0; i < 16; i++) {
            const x0 = -1400 + i * 290, y0 = 560 + Math.sin(i * 0.9) * 26, w = 290, h = 60 + r() * 30;
            const tone = [{ 'yellow.s': 0.55, 'blue.s': 0.3 }, { 'yellow.s': 0.7, 'pink.s': 0.18, 'blue.s': 0.1 }, { 'yellow.s': 0.4, 'blue.s': 0.45 }][i % 3];
            put(press, (g) => poly(g, [[x0, y0], [x0 + w, y0 - 8], [x0 + w + 20, y0 + h], [x0 + 10, y0 + h + 6]]), Sf(tone), K);
            line(press, [[x0, y0], [x0 + 10, y0 + h + 6]], 3, Sf({ yellow: 1, 'blue.s': 0.7, 'navy.s': 0.3 }), K);
            for (let k = 0; k < 3; k++) put(press, circle(x0 + r() * w, y0 + 4 + r() * 6, 6 + r() * 5), Sf({ yellow: 1, 'blue.s': 0.7, 'navy.s': 0.35 }), K);
            // ploughed furrows in the yellow fields
            if (i % 3 === 1) for (let k = 1; k < 5; k++) line(press, [[x0 + 8, y0 + k * h / 5], [x0 + w + 8, y0 + k * h / 5 - 6]], 1.2, Sf({ 'pink.s': 0.3, 'navy.s': 0.2 }), K);
        }
        // a post mill on the skyline with sails turning
        const wm = [1660, 505];
        put(press, (g) => poly(g, [[wm[0] - 6, wm[1] + 30], [wm[0] + 6, wm[1] + 30], [wm[0] + 3, wm[1]], [wm[0] - 3, wm[1]]]), Sf({ 'navy.s': 0.5, 'yellow.s': 0.3 }), K);
        put(press, (g) => g.rect(wm[0] - 12, wm[1] - 30, 24, 32), Sf({ 'yellow.s': 0.5, 'pink.s': 0.3, 'navy.s': 0.35 }), K);
        for (let k = 0; k < 4; k++) {
            const a = t * 1.6 + k * 1.5708, e = [wm[0] + Math.cos(a) * 46, wm[1] - 18 + Math.sin(a) * 46];
            line(press, [[wm[0], wm[1] - 18], e], 3, Sf({ 'navy.s': 0.5 }), K);
            put(press, (g) => poly(g, [[wm[0] + Math.cos(a) * 12 - Math.sin(a) * 2, wm[1] - 18 + Math.sin(a) * 12 + Math.cos(a) * 2], [e[0] - Math.sin(a) * 2, e[1] + Math.cos(a) * 2], [e[0] - Math.sin(a) * 10, e[1] + Math.cos(a) * 10], [wm[0] + Math.cos(a) * 12 - Math.sin(a) * 10, wm[1] - 18 + Math.sin(a) * 12 + Math.cos(a) * 10]]), Sf({ 'yellow.s': 0.2, 'blue.s': 0.1 }), K);
        }
        // the near meadow's rise
        put(press, (g) => smooth(g, [[-1400, 690], [-600, 640], [200, 668], [900, 630], [1600, 655], [3200, 630], [3200, 900], [-1400, 900]], false), Sf({ yellow: 1, 'blue.s': 0.45 }), K);
        // Woolsthorpe Manor: a limestone house, T-shaped, stone-slate roof, mullioned windows
        const mx = 1330, my = 648;
        const HOUSE = { 'yellow.s': 0.36, 'pink.s': 0.16, 'navy.s': 0.05 }, HOUSE_SH = { 'yellow.s': 0.45, 'pink.s': 0.28, 'navy.s': 0.25 };
        const ROOF = { 'blue.s': 0.45, 'navy.s': 0.45, 'yellow.s': 0.2 };
        put(press, (g) => g.rect(mx - 120, my - 70, 170, 70), Sf(HOUSE), K);
        put(press, (g) => g.rect(mx + 50, my - 86, 70, 86), Sf(HOUSE_SH), K);
        put(press, (g) => poly(g, [[mx - 130, my - 70], [mx - 60, my - 118], [mx + 10, my - 118], [mx + 60, my - 70]]), Sf(ROOF), K);
        put(press, (g) => poly(g, [[mx + 42, my - 86], [mx + 85, my - 128], [mx + 128, my - 86]]), Sf(ROOF), K);
        for (let k = 1; k < 5; k++) line(press, [[mx - 130 + k * 14, my - 70 - k * 10], [mx + 60 - k * 12, my - 70 - k * 10]], 1.3, Sf({ navy: 0.8 }), K);
        for (let k = 1; k < 6; k++) line(press, [[mx - 120, my - 70 + k * 12], [mx + 50, my - 70 + k * 12]], 1, Sf({ 'pink.s': 0.35, 'navy.s': 0.25 }), K);
        for (const [cx, cy] of [[mx - 90, my - 128], [mx + 2, my - 128]]) {
            put(press, (g) => g.rect(cx - 8, cy, 16, 26), Sf(HOUSE_SH), K);
            // smoke from the chimney, drifting right in puffs
            for (let k = 0; k < 5; k++) {
                const ph = (t * 0.5 + k / 5) % 1;
                put(press, circle(cx + ph * 60 + Math.sin(ph * 6 + k) * 5, cy - 8 - ph * 70, 5 + ph * 10), Sf({ 'blue.s': 0.1 + 0.15 * (1 - ph) }), K);
            }
        }
        for (const [wx, wy] of [[-100, -52], [-60, -52], [-20, -52], [20, -52], [-100, -26], [-20, -26], [20, -26], [66, -60], [66, -30]]) {
            put(press, (g) => g.rect(mx + wx, my + wy, 22, 16), Sf({ navy: 1, 'blue.s': 0.3 }), K);
            line(press, [[mx + wx + 11, my + wy], [mx + wx + 11, my + wy + 16]], 2, Sf(HOUSE), K);
            line(press, [[mx + wx - 2, my + wy - 2], [mx + wx + 24, my + wy - 2]], 3, Sf(HOUSE_SH), K);
        }
        put(press, (g) => poly(g, [[mx - 62, my], [mx - 62, my - 22], [mx - 54, my - 28], [mx - 46, my - 22], [mx - 46, my]]), Sf({ 'yellow.s': 0.7, 'pink.s': 0.55, 'navy.s': 0.55 }), K);
        // the orchard round the house: small apple trees with red dots
        for (let i = 0; i < 9; i++) {
            const x = 1050 + i * 70 + Math.sin(i * 3) * 20, y = 662 + (i % 2) * 8;
            line(press, [[x, y], [x, y - 18]], 4, Sf({ 'yellow.s': 0.6, 'pink.s': 0.5, 'navy.s': 0.6 }), K);
            put(press, circle(x, y - 30, 22), Sf(LEAF[i % 3]), K);
            for (let k = 0; k < 3; k++) put(press, circle(x - 12 + k * 11, y - 30 + ((k * 7) % 12) - 5, 3), Sf(APPLE), K);
        }
        // sheep grazing on the rise: body, legs, a black face that dips to the grass
        const rs = Motion.rng('sheep');
        for (let i = 0; i < 8; i++) {
            const x = 760 + rs() * 1000, y = 690 + rs() * 26, graze = Math.max(0, Math.sin(t * 1.2 + i * 2)), dir = rs() < 0.5 ? 1 : -1;
            for (const lx of [-8, -3, 5, 10]) line(press, [[x + lx, y + 4], [x + lx, y + 14]], 2.2, Sf({ navy: 1 }), K);
            put(press, (g) => smooth(g, [[x - 16, y], [x - 10, y - 9], [x + 2, y - 11], [x + 14, y - 8], [x + 17, y + 2], [x + 6, y + 8], [x - 12, y + 7]]), Sf({ 'blue.s': 0.05, 'yellow.s': 0.05 }), K);
            put(press, ellipse(x + dir * 18, y - 4 + graze * 8, 5, 4, dir * 0.6), Sf({ navy: 1, yellow: 0.8 }), K);
        }
        // a dry-stone wall across the middle distance, with a wooden stile
        const wy = 745;
        for (let row = 0; row < 3; row++) {
            for (let k = 0; k < 44; k++) {
                const j = Math.sin(k * 7.3 + row * 3.1) * 0.5 + 0.5, w = 34 + j * 20, x = -700 + k * 54 + (row % 2) * 24, y = wy - row * 14;
                if (x > 1080 && x < 1200) continue;
                put(press, (g) => smooth(g, [[x, y], [x + w * 0.2, y - 12], [x + w * 0.8, y - 13], [x + w, y - 2], [x + w * 0.8, y + 2], [x + w * 0.2, y + 2]]), Sf(STONE[(k + row) % 3]), K);
                line(press, [[x + 3, y + 1], [x + w - 3, y + 1]], 2, Sf({ 'navy.s': 0.55, 'pink.s': 0.3 }), K);
            }
        }
        for (let k = 0; k < 40; k++) { const x = -690 + k * 58; put(press, (g) => poly(g, [[x, wy - 42], [x + 28, wy - 48], [x + 50, wy - 42], [x + 26, wy - 36]]), Sf(STONE[k % 3]), K); }
        for (const sx of [1100, 1180]) put(press, (g) => g.rect(sx, wy - 70, 10, 72), Sf({ 'yellow.s': 0.7, 'pink.s': 0.55, 'navy.s': 0.5 }), K);
        for (const sy of [wy - 58, wy - 30]) put(press, (g) => g.rect(1094, sy, 100, 8), Sf({ 'yellow.s': 0.65, 'pink.s': 0.45, 'navy.s': 0.35 }), K);
        // swallows flicking across the sky
        for (let i = 0; i < 4; i++) {
            const ph = (t * 0.12 + i * 0.27) % 1, x = -300 + ph * 2200, y = 150 + i * 70 + Math.sin(ph * 12 + i) * 30, fl = Math.sin(t * 16 + i * 2);
            line(press, [[x - 14, y - 6 * fl], [x, y], [x + 14, y - 6 * fl]], 3, Sf({ navy: 1 }), K);
        }
    }
    function tree(press, t, apples) {
        const sway = Math.sin(t * 1.3) * 5;
        // roots flaring into the ground, then the trunk: an old apple tree, leaning a little
        for (const [x0, x1, w] of [[300, 220, 50], [350, 330, 36], [420, 520, 44]]) line(press, [[x0 + 40, G - 60], [(x0 + x1) / 2 + 40, G - 10], [x1 + 40, G + 12]], taper(w, 0.05, 0.9), BARK);
        const trunk = [[290, G + 8], [316, G - 70], [334, 420], [326, 180], [304, 60], [362, 30], [396, 140], [412, 420], [424, G - 80], [456, G + 10]];
        put(press, (g) => smooth(g, trunk), BARK);
        press.save();
        press.clip((g) => smooth(g, trunk));
        // bark: long ridges, darker furrows, cracks, moss on the shady side
        const rb = Motion.rng('bark');
        for (let i = 0; i < 16; i++) {
            const x = 300 + i * 8 + rb() * 6;
            line(press, [[x, G + 10], [x + 6 + rb() * 6, 560], [x - 4 + rb() * 8, 300], [x + 4, 60]], taper(2 + rb() * 3, 0.1, 0.1), i % 3 ? BARK_LT : { 'yellow.s': 0.8, 'pink.s': 0.65, 'navy.s': 0.85 });
        }
        for (let i = 0; i < 22; i++) { const x = 320 + rb() * 90, y = 120 + rb() * 680; line(press, [[x, y], [x + 4, y + 10 + rb() * 18]], 2, { navy: 1, 'pink.s': 0.5 }); }
        put(press, (g) => smooth(g, [[300, 700], [330, 620], [340, 520], [322, 450], [300, 520]]), { yellow: 1, 'blue.s': 0.6, 'navy.s': 0.3 }, { knock: false });
        put(press, ellipse(378, 470, 14, 22), { navy: 1, yellow: 1, pink: 0.6 });
        line(press, Ph.sample([[364, 470], [378, 446], [392, 470], [378, 494]], true, 6), 4, BARK_LT);
        press.restore();
        // branches with twigs
        const BR = [[[340, 180], [180, -60], [60, -250]], [[370, 150], [480, -80], [600, -220]], [[350, 120], [380, -150], [420, -330]], [[330, 200], [120, 60], [-80, 20]], [[395, 250], [560, 170], [680, 120]]];
        for (const pts of BR) {
            line(press, pts, taper(34, 0.05, 0.6), BARK);
            line(press, pts.map(([x, y]) => [x + 4, y - 8]), taper(8, 0.1, 0.6), BARK_LT);
            const e = pts[2], m = pts[1];
            for (const [dx, dy] of [[-50, -60], [60, -50], [20, -90]]) line(press, [LPt(m, e, 0.6), [e[0] + dx, e[1] + dy]], taper(8, 0.05, 0.8), BARK);
        }
        // canopy: clusters (dark underneath, lit at the top right), each rimmed with leaves
        const r = Motion.rng('canopy');
        const cl = [];
        for (let i = 0; i < 95; i++) { const x = -420 + r() * 1080, y = -820 + r() * 900; cl.push([x, Math.min(y, x > 480 ? -120 : 100), 70 + r() * 90, r()]); } // the crown ends left of the throw: open sky over it
        cl.sort((a, b) => a[1] - b[1]);
        for (const [x, y, rad, k] of cl) {
            if (Math.hypot(x - HANG[0], y - HANG[1] + 60) < 150 || (Math.abs(x - HANG[0]) < 110 && y > HANG[1])) continue; // sky round the apple and under it: it falls in the clear
            const xs = x + sway * (1 - (y + 800) / 900);
            put(press, circle(xs, y, rad), LEAF[Math.floor(k * 3)]);
            ink(press, circle(xs - rad * 0.1, y + rad * 0.4, rad * 0.78), { 'navy.s': 0.32 });
            put(press, circle(xs + rad * 0.3, y - rad * 0.35, rad * 0.45), LEAF_LT, { knock: false });
            // leaves: pointed ovals with a midrib, round the rim and scattered inside
            for (let j = 0; j < 12; j++) {
                const a = -3 + j * 0.5 + k * 2, rr = j < 8 ? rad : rad * (0.3 + ((j * 0.37 + k) % 0.6)), lx = xs + Math.cos(a) * rr, ly = y + Math.sin(a) * rr, rot = a + 0.4 + Math.sin(t * 2 + j) * 0.08;
                put(press, (g) => { g.beginPath(); g.ellipse(lx, ly, 24, 9, rot, 0, 6.2832); }, j % 3 === 0 ? LEAF_LT : LEAF[(j + Math.floor(k * 3)) % 3]);
                line(press, [[lx - Math.cos(rot) * 18, ly - Math.sin(rot) * 18], [lx + Math.cos(rot) * 18, ly + Math.sin(rot) * 18]], 1.4, { yellow: 1, 'blue.s': 0.3 });
            }
        }
        // the twig the apple hangs from, reaching out from the trunk, with a few leaves
        const tw = [[395, HANG[1] + 120], [HANG[0] - 40, HANG[1] - 30], [HANG[0] + 4, HANG[1] - APPLE_R * 1.25]];
        line(press, tw, taper(14, 0.05, 0.8), BARK);
        for (const [dx, dy, a] of [[-70, -10, -0.5], [-30, -40, 0.6], [20, -70, -0.3], [-110, 20, 0.4]]) put(press, (g) => { g.beginPath(); g.ellipse(HANG[0] + dx + sway * 0.4, HANG[1] + dy, 24, 9, a, 0, 6.2832); }, LEAF[Math.abs(dx) % 3]);
        for (const [x, y] of apples) {
            if (Math.abs(x - HANG[0]) < 130) continue; // keep the falling apple alone in its column
            line(press, [[x + sway * 0.5, y - APPLE_R * 1.4], [x + sway * 0.5, y - APPLE_R * 0.7]], 3, BARK);
            drawApple(press, x + sway * 0.5, y, APPLE_R * 0.9, Math.sin(t + x) * 0.1);
        }
    }
    // a wooden orchard ladder leaning on the far side of the trunk, a basket of apples
    function ladder(press) {
        const W = { 'yellow.s': 0.65, 'pink.s': 0.45, 'navy.s': 0.35 };
        const a0 = [150, G + 4], a1 = [300, 60], b0 = [210, G + 8], b1 = [345, 80];
        line(press, [a0, a1], 12, W);
        line(press, [b0, b1], 12, W);
        for (let i = 1; i < 11; i++) { const k = i / 11; line(press, [LPt(a0, a1, k), LPt(b0, b1, k)], 8, { 'yellow.s': 0.55, 'pink.s': 0.35, 'navy.s': 0.2 }); }
    }
    function basket(press, x, y) {
        const WICK = { 'yellow.s': 0.8, 'pink.s': 0.5, 'navy.s': 0.3 };
        for (const [dx, dy] of [[-40, -58], [-12, -66], [18, -62], [44, -56], [-24, -80], [8, -84], [32, -76]]) drawApple(press, x + dx, y + dy, 22, dx * 0.02);
        put(press, (g) => poly(g, [[x - 80, y - 60], [x + 80, y - 60], [x + 64, y], [x - 64, y]]), WICK);
        for (let i = 0; i < 4; i++) line(press, [[x - 78 + i * 3, y - 50 + i * 14], [x + 78 - i * 3, y - 50 + i * 14]], 3, { navy: 0.8, 'pink.s': 0.4 });
        for (let i = 0; i < 9; i++) line(press, [[x - 70 + i * 17.5, y - 58], [x - 58 + i * 14.5, y - 2]], 2, { 'yellow.s': 0.5, 'pink.s': 0.3 });
        line(press, Ph.sample([[x - 70, y - 60], [x - 40, y - 150], [x + 40, y - 150], [x + 70, y - 60]], false, 8), 8, WICK);
        ink(press, ellipse(x, y + 4, 90, 10), { 'navy.s': 0.4 });
    }
    // leaves drifting down from the canopy, each on its own seesaw
    function fallingLeaves(press, t) {
        const r = Motion.rng('falling');
        for (let i = 0; i < 7; i++) {
            const x0 = -100 + r() * 1100, per = 4 + r() * 3, ph = r();
            const k = ((t / per + ph) % 1), y = L(-100, G - 10, k), x = x0 + Math.sin(k * 14 + i) * 50 + k * 80, rot = Math.sin(k * 14 + i) * 0.9;
            put(press, (g) => { g.beginPath(); g.ellipse(x, y, 16, 7, rot, 0, 6.2832); }, i % 3 ? LEAF[i % 3] : { yellow: 1, 'pink.s': 0.4, 'navy.s': 0.15 });
        }
    }
    const LPt = (p, q, k) => [p[0] + (q[0] - p[0]) * k, p[1] + (q[1] - p[1]) * k];
    function grass(press, t, front) {
        const r = Motion.rng(front ? 'grass-front' : 'grass');
        if (!front) {
            put(press, (g) => g.rect(-2e5, G, 4e5, 2e5), GRASS);
            // mown stripes and shade under the tree
            for (let k = 0; k < 6; k++) ink(press, (g) => g.rect(-2000 + k * 900, G, 450, 400), { 'blue.s': 0.12 });
            ink(press, ellipse(380, G + 20, 420, 40), { 'navy.s': 0.35 });
            // windfalls and fallen leaves round the trunk, a few mushrooms at its foot
            for (const [x, y, rr] of [[180, G + 30, 18], [520, G + 44, 16], [860, G + 26, 15], [-60, G + 38, 17]]) drawApple(press, x, y, rr, x * 0.01);
            for (let i = 0; i < 18; i++) { const x = 100 + r() * 700, y = G + 10 + r() * 60, a = r() * 6; put(press, (g) => { g.beginPath(); g.ellipse(x, y, 14, 6, a, 0, 6.2832); }, i % 2 ? { yellow: 1, 'pink.s': 0.45, 'navy.s': 0.2 } : LEAF[2]); }
            for (const [x, h] of [[268, 22], [286, 16], [476, 20]]) {
                line(press, [[x, G + 8], [x, G + 8 - h]], 5, { 'yellow.s': 0.2 });
                put(press, (g) => { g.beginPath(); g.ellipse(x, G + 8 - h, 14, 8, 0, Math.PI, 0); g.closePath(); }, { 'yellow.s': 0.6, 'pink.s': 0.5, 'navy.s': 0.25 });
            }
        }
        // blades in tufts, bending with the wind
        const n = front ? 70 : 220;
        for (let i = 0; i < n; i++) {
            const x = -900 + r() * 3000, y = G + (front ? 70 + r() * 60 : r() * 70), h = (front ? 70 : 24) + r() * (front ? 70 : 26);
            for (let b = 0; b < 3; b++) {
                const lean = (b - 1) * 0.35 + (r() - 0.5) * 0.3 + Math.sin(t * 2 + x * 0.01) * 0.1, hh = h * (0.7 + 0.3 * r());
                line(press, [[x + b * 3, y], [x + b * 3 + Math.sin(lean) * hh * 0.5, y - hh * 0.5], [x + b * 3 + Math.sin(lean) * hh, y - hh]], taper(front ? 7 : 4, 0.05, 0.9), r() < 0.5 ? GRASS_DK : { yellow: 1, 'blue.s': 0.4 });
            }
        }
        if (front) return;
        // daisies, buttercups, clover, dandelion clocks
        for (let i = 0; i < 60; i++) {
            const x = -600 + r() * 2600, y = G + 6 + r() * 60, kind = i % 4;
            line(press, [[x, y + 8], [x, y]], 1.6, GRASS_DK);
            if (kind === 0) { for (let j = 0; j < 8; j++) put(press, ellipse(x + Math.cos(j * 0.785) * 6, y + Math.sin(j * 0.785) * 3, 4, 1.8, j * 0.785), { 'blue.s': 0.04 }); put(press, circle(x, y, 2.6), { yellow: 1 }); }
            else if (kind === 1) { for (let j = 0; j < 5; j++) put(press, circle(x + Math.cos(j * 1.256) * 3.5, y + Math.sin(j * 1.256) * 2, 3), { yellow: 1, 'pink.s': 0.1 }); }
            else if (kind === 2) { for (let j = 0; j < 3; j++) put(press, circle(x + Math.cos(j * 2.09) * 4, y - 3 + Math.sin(j * 2.09) * 3, 3.5), { yellow: 1, 'blue.s': 0.65 }); put(press, circle(x, y - 12, 4), { pink: 0.8, 'yellow.s': 0.2 }); }
            else { put(press, circle(x, y - 14, 8), { 'blue.s': 0.08 }); for (let j = 0; j < 8; j++) line(press, [[x, y - 14], [x + Math.cos(j * 0.785) * 8, y - 14 + Math.sin(j * 0.785) * 8]], 1, { 'navy.s': 0.3 }); line(press, [[x, y], [x, y - 14]], 1.6, GRASS_DK); }
        }
        // a cabbage white butterfly fluttering past the tree
        const bx = 600 + Math.sin(t * 0.9) * 260, by = 620 + Math.sin(t * 2.3) * 60, fl = Math.abs(Math.sin(t * 18));
        for (const sg of [-1, 1]) put(press, (g) => { g.beginPath(); g.ellipse(bx + sg * 8 * fl, by - 4, 9 * fl + 2, 7, sg * 0.3, 0, 6.2832); }, { 'blue.s': 0.06 });
        line(press, [[bx, by - 8], [bx, by + 2]], 2, { navy: 1 });
    }
    function drawApple(press, x, y, r, rot, squash = 1) {
        press.save();
        press.each((g) => { g.translate(x, y); g.rotate(rot); g.scale(1 / squash ** 0.5, squash); });
        put(press, (g) => smooth(g, [[-r, -r * 0.15], [-r * 0.72, -r * 0.82], [-r * 0.2, -r * 0.86], [0, -r * 0.72], [r * 0.2, -r * 0.86], [r * 0.72, -r * 0.82], [r, -r * 0.15], [r * 0.8, r * 0.7], [r * 0.2, r * 0.98], [-r * 0.2, r * 0.98], [-r * 0.8, r * 0.7]]), APPLE);
        put(press, (g) => smooth(g, [[-r * 0.2, r * 0.1], [r * 0.9, -r * 0.1], [r * 0.6, r * 0.8], [0, r * 0.95]]), APPLE_SH, { knock: false });
        // streaks of yellow in the skin, a highlight, the stalk and a leaf
        for (const dx of [-0.5, -0.2, 0.15]) line(press, [[dx * r, -r * 0.6], [dx * r * 1.2, 0], [dx * r, r * 0.6]], taper(r * 0.08), { yellow: 1, 'pink.s': 0.4 });
        press.knockout(ellipse(-r * 0.4, -r * 0.35, r * 0.18, r * 0.12, -0.5));
        line(press, [[0, -r * 0.7], [3, -r * 1.2]], r * 0.1, BARK);
        put(press, (g) => { g.beginPath(); g.ellipse(r * 0.35, -r * 1.1, r * 0.4, r * 0.16, -0.4, 0, 6.2832); }, LEAF[0]);
        press.restore();
    }
    function book(press, hN, hF) {
        const c = [(hN[0] + hF[0]) / 2 + 6, (hN[1] + hF[1]) / 2 - 6];
        put(press, (g) => poly(g, [[c[0] - 44, c[1] + 6], [c[0], c[1] - 10], [c[0] + 46, c[1] + 4], [c[0] + 44, c[1] + 16], [c[0], c[1] + 4], [c[0] - 46, c[1] + 18]]), { 'yellow.s': 0.15, 'pink.s': 0.05 });
        put(press, (g) => poly(g, [[c[0] - 46, c[1] + 18], [c[0], c[1] + 4], [c[0] + 44, c[1] + 16], [c[0] + 46, c[1] + 24], [c[0], c[1] + 12], [c[0] - 48, c[1] + 26]]), { pink: 1, 'navy.s': 0.6 });
        for (let i = 0; i < 4; i++) for (const sg of [-1, 1]) line(press, [[c[0] + sg * 8, c[1] - 2 + i * 4 - (sg < 0 ? 0 : 2)], [c[0] + sg * 38, c[1] + 4 + i * 4]], 1.4, { 'navy.s': 0.6 });
    }
    // little stars circling a stunned head (drawn as flat 5-point stars)
    function stunStars(press, h, t) {
        const k = S(t, T.bonk, T.bonk + 0.1) * (1 - S(t, 2.2, 2.45));
        if (k <= 0) return;
        for (let i = 0; i < 3; i++) {
            const a = t * 7 + i * 2.094, x = h[0] + Math.cos(a) * 70, y = h[1] - 70 + Math.sin(a) * 18, s = 14 * k;
            const pts = [];
            for (let j = 0; j < 10; j++) { const rr = j % 2 ? s * 0.45 : s; pts.push([x + Math.cos(j * 0.628 - 1.57) * rr, y + Math.sin(j * 0.628 - 1.57) * rr]); }
            put(press, (g) => poly(g, pts), { yellow: 1, 'pink.s': 0.2 });
        }
    }

    // the whole near world (shots A and B, and the start of C) in world units
    function nearWorld(press, t, pose, apple, detail) {
        if (detail > 0) backdrop(press, t, detail);
        ladder(press);
        tree(press, t, [[120, -520], [560, -560], [60, -140], [240, -680], [470, -200], [-150, -380], [-300, -160]]);
        grass(press, t, false);
        basket(press, 180, G + 18);
        // dappled light under the canopy: soft round spots of sun on the grass
        const rd = Motion.rng('dapple');
        for (let i = 0; i < 16; i++) { const x = -200 + rd() * 1200, y = G + 8 + rd() * 70, w = 20 + rd() * 36; press.knockout((g) => { g.fillStyle = Riso.radial(g, x, y, 1, w, 0.35, 0); g.beginPath(); g.ellipse(x, y, w, w * 0.3, 0, 0, 6.2832); g.fill(); }); }
        fallingLeaves(press, t);
        // the book: on his knees, jolted out of his hands by the bonk, it falls and lands flat
        if (t < T.bonk) book(press, pose.hN, pose.hF);
        else {
            const d = t - T.bonk, k = Math.min(1, (0.5 * GRAV * d * d) / (G - 600));
            const bx = L(575, BOOK_REST[0], k), by = L(600, BOOK_REST[1] - 10, k);
            press.save();
            press.each((g) => { g.translate(bx, by); g.rotate(k * 0.6 * (1 - k) * 3); });
            put(press, (g) => poly(g, [[-50, -8], [50, -14], [54, 6], [-46, 12]]), { pink: 1, 'navy.s': 0.6 });
            put(press, (g) => poly(g, [[-46, -12], [48, -18], [50, -12], [-44, -6]]), { 'yellow.s': 0.15 });
            press.restore();
        }
        const fig = Fig.newton(press, pose, { held: t >= 3.97 && t < T.release ? (pr, c) => drawApple(pr, c[0], c[1], APPLE_R, 0.15) : null, heldR: APPLE_R, heldMode: t < 4.12 ? 'pick' : t < 4.68 ? 'hold' : 'cock', heldAt: t < 4.12 ? [pose.hN[0] + REST_X - GRAB[0], pose.hN[1] + REST_Y - GRAB[1]] : null });
        stunStars(press, pose.H, t);
        return fig;
    }

    // precomputed apple flight after the release: screen altitude above the limb a(t) and
    // angle θ(t) round the globe's centre (clockwise from straight up), integrated at 1 ms
    function flight() {
        const dt = 0.001, n = Math.ceil((7.1 - T.release) / dt), th = new Float64Array(n);
        // it leaves the hand 220 units ahead of the feet (float64: on a globe 2.65e9 units
        // wide an angle of 1e-7 rad is still hundreds of pixels)
        let a = -Math.PI / 2 + 198 / RW; // the hand at the release is 198 units ahead of the anchor
        for (let i = 0; i < n; i++) {
            const t = T.release + i * dt, z = zoomAt(t), Rs = RW * z, as = altScreen(t);
            const v = L(80, 900, IO(S(t, T.release, 5.8)));
            a += (v * dt) / (Rs + as);
            th[i] = a;
        }
        return (t) => th[Math.min(n - 1, Math.max(0, Math.round((t - T.release) / dt)))];
    }
    // the apple's height above the ground, on screen: up fast, then settling to an orbit
    function altScreen(t) {
        return Fig.track(GD, t);
    }

    Seg.newtonApple = {
        T, drawApple,
        init() { return { theta: flight() }; },
        draw(press, tq, st) {
            const t = tq;
            const pose = poseAt(t);
            const ap = appleWorld(t, pose.hN); // once carried, it is drawn at the rig's wrist
            const cam = camAB(Math.min(t, T.pull[0]), ap.p);
            const z = t < T.pull[0] ? cam.z : zoomAt(t);
            const anchor = t < T.pull[0] ? [(FEET[0] - cam.c[0]) * cam.z + 800, (FEET[1] - cam.c[1]) * cam.z + 450] : anchorAt(t, cam);
            const dark = S(Math.log10(z), Math.log10(3e-4), Math.log10(3e-6));
            sky(press, t, dark);
            if (dark > 0.4) Sets.stars(press, 0, 1600, S(dark, 0.4, 1), t);
            // world → screen: the anchor (Newton's feet) is fixed at `anchor`, scale z
            const toS = (p) => [anchor[0] + (p[0] - FEET[0]) * z, anchor[1] + (p[1] - FEET[1]) * z];
            // the sun and the daytime moon belong to the sky, not to the screen: a far layer
            // that the camera's pans and tilts move (a quarter of the world's motion) and its
            // zoom scales (gently); they fade as the sky turns to space
            if (dark < 0.9) {
                const tb = Math.min(t, T.pull[0]), c0 = camAB(tb, [0, 0]), zb = Math.min(c0.z, 2);
                let dx = -(c0.c[0] - 700) * zb * 0.25, dy = -(c0.c[1] - 300) * zb * 0.25, k = Math.pow(zb / 1.65, 0.3);
                if (t > T.pull[0]) {
                    const a0 = anchorAt(T.pull[0]), a1 = anchorAt(t);
                    dx += (a1[0] - a0[0]) * 0.25; dy += (a1[1] - a0[1]) * 0.25;
                    k *= Math.pow(z / Z0, 0.12);
                }
                for (const [x0, y0, fn] of [[1330, 110, (x, y) => sun(press, x, y, t)], [1150, 260, (x, y) => moon(press, x, y)]]) {
                    const x = 800 + (x0 - 800) * k + dx, y = 450 + (y0 - 450) * k + dy;
                    press.save(); press.each((g) => { g.translate(x, y); g.scale(k, k); }); fn(0, 0); press.restore();
                }
            }
            if (z > 0.02) {
                for (const [x, y, s, v] of [[200, -900, 1.2, 12], [900, -780, 0.9, 8], [1700, -600, 1.1, 10], [-400, -500, 1, 9], [1150, 160, 1.3, 14], [1520, 330, 0.9, 10], [1000, 420, 0.7, 7]]) {
                    const cp = toS([x + t * v, y]);
                    cloud(press, cp[0], cp[1], s * z);
                }
            }
            // the globe and the land's silhouette: when the curve is visible
            const Rs = RW * z, C = [anchor[0], anchor[1] + Rs];
            if (Rs < 4e5) {
                const gf = 1;
                Globe.draw(press, C, Rs, { f: gf, lon0: -1, lat0: -38, cloudLon: t * 4 });
                // atmosphere: a pale ring a little outside the limb
                const atm = Math.max(3, 4e7 * z);
                press.knockout((g) => { g.beginPath(); g.arc(C[0], C[1], Rs + atm, 0, 6.2832); g.arc(C[0], C[1], Rs, 0, 6.2832, true); g.fill('evenodd'); });
                ink(press, (g) => { g.beginPath(); g.arc(C[0], C[1], Rs + atm, 0, 6.2832); g.arc(C[0], C[1], Rs, 0, 6.2832, true); }, { 'blue.s': 0.35 * (1 - dark * 0.3) });
            }
            // the ground line with its terrain (drawn round the limb, in screen space)
            if (z < 0.6) {
                const pts = [], n = 260;
                const span = Math.min(Math.PI, 2400 / Math.max(Rs, 1)); // visible half-angle
                for (let i = 0; i <= n; i++) {
                    const phi = -span + (2 * span * i) / n, s = phi * RW, h = terrain(s) * z;
                    // relative to the anchor, never through the far centre (a canvas path loses precision
                // with coordinates of 1e7 and silently drops the fill)
                const sh = Math.sin(phi / 2);
                pts.push([C[0] + Math.sin(phi) * (Rs + h), anchor[1] + 2 * Rs * sh * sh - h * Math.cos(phi)]);
                }
                const inner = [[C[0] + Math.sin(span) * Rs * 0.9, C[1] - Math.cos(span) * Rs * 0.9], [C[0], C[1] - Rs * 0.8], [C[0] - Math.sin(span) * Rs * 0.9, C[1] - Math.cos(span) * Rs * 0.9]];
                const band = (g) => { g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.lineTo(pts[n][0], 3000); g.lineTo(pts[0][0], 3000); g.closePath(); };
                const bf = S(Math.log(Rs), Math.log(3e4), Math.log(2e5)); // the band gives way to the globe
                if (bf > 0) put(press, band, bf < 1 ? Object.fromEntries(Object.entries(GRASS).map(([k, v]) => [k.endsWith('.s') ? k : k + '.s', v * bf])) : GRASS, { knock: bf >= 1 });
                // the sea beyond the coast (east of Newton), a blue band along the limb
                const seaPts = pts.filter((q, i) => (-span + (2 * span * i) / n) * RW > 1.1e8);
                const hash = (k, seed) => { const j = Math.sin(k * 12.9898 + seed * 78.233) * 43758.5453; return j - Math.floor(j); };
                // the land seen a little from above: rows of fields receding to the horizon, at
                // three scales (fields, farms, regions), each drawn while its rows are 6–300 px
                if (Rs > 4e4) {
                    press.save();
                    press.clip(band);
                    for (const [W, SEG, seed] of [[900, 2600, 1], [1.2e4, 3.2e4, 2], [1.5e5, 4e5, 3]]) {
                        const rowPx = W * z;
                        if (rowPx < 6 || rowPx > 300) continue;
                        const fade = Math.min(1, (rowPx - 6) / 10, (300 - rowPx) / 80);
                        for (let k = 0; k < 40; k++) {
                            const y0 = anchor[1] + 6 + k * rowPx * (1 + k * 0.08);
                            if (y0 > 950) break;
                            const h = rowPx * (1 + k * 0.08), segPx = SEG * z * (1 + k * 0.08);
                            const off = hash(k, seed) * segPx;
                            for (let x = -segPx - off; x < 1600 + segPx; x += segPx) {
                                const j = hash(Math.floor(x / segPx) + k * 131, seed + 7);
                                const tone = [{ 'yellow.s': 0.5, 'blue.s': 0.35 }, { 'yellow.s': 0.75, 'pink.s': 0.2 }, { 'blue.s': 0.3, 'yellow.s': 0.2 }, { 'yellow.s': 0.3, 'pink.s': 0.25, 'navy.s': 0.1 }][Math.floor(j * 4)];
                                ink(press, (g) => g.rect(x, y0, segPx * 0.97, h), Object.fromEntries(Object.entries(tone).map(([kk, v]) => [kk, v * fade])));
                                line(press, [[x, y0], [x, y0 + h]], Math.max(1.2, h * 0.08), { yellow: fade, 'blue.s': 0.7 * fade, 'navy.s': 0.3 * fade });
                            }
                            line(press, [[-10, y0], [1610, y0]], Math.max(1.2, h * 0.06), { yellow: fade, 'blue.s': 0.7 * fade, 'navy.s': 0.3 * fade });
                        }
                    }
                    press.restore();
                }
                if (seaPts.length > 1 && Rs > 3000 && Rs < 2e5) line(press, seaPts, Math.max(3, 3e5 * z), { blue: 0.9, 'navy.s': 0.2 });
                line(press, pts, Rs > 3000 ? 4 : 2.5, { yellow: 1, 'blue.s': 0.8, 'navy.s': 0.4 });
                // trees and copses on the ground, and villages: visible while they are a few px
                const onGround = (s2, lift) => { const phi = s2 / RW, hh = (terrain(s2) + lift) * z, sh = Math.sin(phi / 2); return [C[0] + Math.sin(phi) * (Rs + hh), anchor[1] + 2 * Rs * sh * sh - hh * Math.cos(phi)]; };
                // Lincolnshire at every scale: hedgerow trees, farmsteads, villages with a church,
                // market towns, a river; each layer drawn while it is between a few px and ~90 px
                const each = (step, size, seed, fn) => {
                    const px = size * z;
                    if (px < 1.6 || px > 140) return;
                    const s0 = Math.floor((-span * RW) / step), s1 = Math.ceil((span * RW) / step);
                    for (let k = Math.max(s0, -260); k <= Math.min(s1, 260); k++) {
                        if (Math.abs(k * step) < 2600) continue; // Newton's own field stays clear
                        const fr = hash(k, seed), s2 = k * step + fr * step * 0.6;
                        if (s2 > 1.1e8) continue; // the sea
                        const q = onGround(s2, 0), up = [Math.sin(s2 / RW), -Math.cos(s2 / RW)];
                        fn(q, up, px, fr, k);
                    }
                };
                const TREE = { yellow: 1, 'blue.s': 0.75, 'navy.s': 0.4 };
                const at = (q, up, h, w = 0) => [q[0] + up[0] * h - up[1] * w, q[1] + up[1] * h + up[0] * w];
                // hedgerow trees
                each(420, 260, 1, (q, up, px, fr) => put(press, circle(...at(q, up, px * 0.5), px * (0.35 + fr * 0.25)), TREE));
                // farmsteads: a barn and a house with red roofs, a haystack
                each(3800, 700, 2, (q, up, px, fr) => {
                    if (fr < 0.3) return;
                    const b = px / 700;
                    put(press, (g) => poly(g, [at(q, up, 0, -220 * b), at(q, up, 160 * b, -220 * b), at(q, up, 250 * b, -120 * b), at(q, up, 160 * b, -20 * b), at(q, up, 0, -20 * b)]), { 'yellow.s': 0.4, 'pink.s': 0.2 });
                    put(press, (g) => poly(g, [at(q, up, 150 * b, -230 * b), at(q, up, 250 * b, -120 * b), at(q, up, 150 * b, -10 * b)]), { pink: 1, 'yellow.s': 0.5, 'navy.s': 0.3 });
                    put(press, (g) => poly(g, [at(q, up, 0, 40 * b), at(q, up, 110 * b, 60 * b), at(q, up, 110 * b, 200 * b), at(q, up, 0, 220 * b)]), { 'yellow.s': 0.55, 'pink.s': 0.35, 'navy.s': 0.2 });
                    put(press, circle(...at(q, up, 60 * b, 330 * b), 70 * b), { yellow: 1, 'pink.s': 0.3 });
                });
                // villages: a row of cottages round a church with a tower and a spire
                each(2.4e4, 5200, 3, (q, up, px, fr) => {
                    const b = px / 5200;
                    for (let i = -4; i <= 4; i++) {
                        if (i === 0) continue;
                        const w = 500 * b, x0 = i * 600 * b, h = (260 + hash(i, 9) * 120) * b;
                        put(press, (g) => poly(g, [at(q, up, 0, x0), at(q, up, h, x0), at(q, up, h + 180 * b, x0 + w / 2), at(q, up, h, x0 + w), at(q, up, 0, x0 + w)]), { 'yellow.s': 0.42, 'pink.s': 0.2, 'navy.s': 0.05 });
                        put(press, (g) => poly(g, [at(q, up, h - 10 * b, x0 - 20 * b), at(q, up, h + 180 * b, x0 + w / 2), at(q, up, h - 10 * b, x0 + w + 20 * b)]), hash(i, 4) < 0.5 ? { pink: 1, 'yellow.s': 0.4, 'navy.s': 0.3 } : { 'blue.s': 0.45, 'navy.s': 0.45 });
                    }
                    put(press, (g) => poly(g, [at(q, up, 0, -150 * b), at(q, up, 900 * b, -150 * b), at(q, up, 900 * b, 150 * b), at(q, up, 0, 150 * b)]), { 'yellow.s': 0.45, 'pink.s': 0.2, 'navy.s': 0.15 });
                    put(press, (g) => poly(g, [at(q, up, 900 * b, -170 * b), at(q, up, 1700 * b, 0), at(q, up, 900 * b, 170 * b)]), { 'blue.s': 0.5, 'navy.s': 0.5 });
                });
                // market towns: dense roofs, a large church, chimney smoke
                each(1.9e5, 2.6e4, 5, (q, up, px, fr) => {
                    if (fr < 0.35) return;
                    const b = px / 2.6e4;
                    for (let i = -12; i <= 12; i++) {
                        const w = 900 * b, x0 = i * 1000 * b, h = (700 + hash(i, 11) * 900) * b;
                        put(press, (g) => poly(g, [at(q, up, 0, x0), at(q, up, h, x0), at(q, up, h + 300 * b, x0 + w / 2), at(q, up, h, x0 + w), at(q, up, 0, x0 + w)]), hash(i, 3) < 0.5 ? { 'yellow.s': 0.5, 'pink.s': 0.35, 'navy.s': 0.2 } : { pink: 0.8, 'yellow.s': 0.5, 'navy.s': 0.35 });
                    }
                    put(press, (g) => poly(g, [at(q, up, 0, -400 * b), at(q, up, 3000 * b, -300 * b), at(q, up, 5200 * b, 0), at(q, up, 3000 * b, 300 * b), at(q, up, 0, 400 * b)]), { 'yellow.s': 0.45, 'pink.s': 0.25, 'navy.s': 0.3 });
                });
                // woods: dark clumps on the hills
                each(4.2e4, 9000, 6, (q, up, px, fr) => { for (let i = 0; i < 4; i++) put(press, circle(...at(q, up, px * 0.35, (i - 1.5) * px * 0.5), px * (0.3 + hash(i, fr) * 0.2)), TREE); });
                // a layer of cumulus clouds 1.2e6 units up (≈ 3 km): the apple goes through it
                const cpx = 2.6e6 * z;
                if (cpx > 12 && cpx < 1400) {
                    for (let k = -30; k <= 30; k++) {
                        const s2 = k * 5.5e6 + 1.3e6, phi = s2 / RW;
                        if (Math.abs(phi) > span) continue;
                        const q = onGround(s2, 1.2e6 - terrain(s2));
                        cloud(press, q[0], q[1], cpx / 190, { 'blue.s': 0.06 });
                    }
                }
            }
            // the near world, fading out as it gets small
            let fig = null;
            if (z > 0.004) {
                Ph.cam(press, anchor[0], anchor[1], z, () => {
                    press.each((g) => g.translate(-FEET[0], -FEET[1]));
                    fig = nearWorld(press, t, pose, ap.p, S(z, 0.1, 0.5));
                    // the apple (before the throw), in the world
                    // (while he holds it, the hand draws it, in its palm, under the fingers)
                    if (t < 3.97) drawApple(press, ap.p[0], ap.p[1], APPLE_R, ap.rot, ap.squash ?? 1);
                    grass(press, t, true);
                });
            }
            // the apple after the throw: screen space, with its amber trail
            if (t >= T.release) {
                const posAt = applePos;
                // the trail: its screen path, stretched downward by its climb while the camera
                // rides with it (the world streaming away under it)
                const climb = 1100 * (1 - S(t, 5.3, 6.0));
                const trail = [];
                for (let tt = Math.max(T.release + 0.04, t - 0.3); tt <= t + 1e-6; tt += 0.01) { const q = posAt(tt); trail.push([q[0] - (t - tt) * climb * LEAN, q[1] + (t - tt) * climb]); }
                if (trail.length > 2) line(press, trail, taper(8, 0.9, 0.02), AMBER);
                const p = posAt(t);
                const r = L(APPLE_R * Math.max(z, 0.55), 17, S(t, T.release, 5.4));
                drawApple(press, p[0], p[1], r, t * 6);
            }
        },
    };
})();
