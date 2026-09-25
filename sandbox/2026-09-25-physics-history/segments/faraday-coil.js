// Segment «Faraday's coil» of physics-history (script v2), after Newton's apple. The apple goes
// on round the Earth faster and faster; its amber trail winds into a helix and, as the camera
// turns a quarter round, the helix is a coil of copper wire. The Earth (a magnet itself) opens
// its field lines, takes a north and a south pole and stretches into Faraday's cylindrical bar
// magnet inside the coil. The magnet slides out of one end; the camera flies in at the other,
// through the copper rings with the field lines blooming, and out of the first end: into
// Faraday's hand, holding that magnet, in his laboratory at the Royal Institution (October
// 1831). He pushes it in (the galvanometer's needle kicks), holds it still (nothing: he frowns
// and taps the glass), pulls it out (the needle kicks the other way), thrusts it in hard: a spark
// jumps across a gap in the leads, and the camera goes into its blue-green light.
//
//   Seg.faradayCoil.draw(press, tq, st)   local time 0–T.end (on twos)
//
// One 3D world for the coil and the magnet (coil3d.js), drawn by a perspective camera. Before
// the fly-through it is the orbit's world (the Earth 260 across, the coil 390 in radius); after
// it the laboratory's (the coil 70 in radius): the same shapes, 5.57 times smaller, switched
// while the copper rings fill the frame.
var Seg = globalThis.Seg ?? (globalThis.Seg = {});
(() => {
    const { put, ink, line, smooth, poly, taper, circle, ellipse } = Ph;
    const L = Ease.lerp, S = Ease.seg, IO = Ease.inOut;

    // 0–2.8 the orbit winds into the coil, the Earth into the magnet; 3.0–3.8 the magnet slides
    // out, the camera swings to the coil's end and flies in; 4.0–4.7 an iris of colour bands
    // (the rings' echoes) closes and opens: the world becomes the laboratory; out of the coil
    // into his hand; 4.9–6.4 the camera draws back and round to the bench. 6.6 in (the needle
    // kicks), 7.1–8.3 held (nothing; he leans in, frowning), 8.3 out (the other way, under his
    // nose), 9.2 in hard: a spark; 9.7–11.2 into the spark's light
    const T = { wind: [0, 3.0], turn: [0.3, 2.8], bloom: [0.9, 2.2], wipe: [1.3, 1.9], stretch: [1.9, 2.8], copper: [0.9, 2.4], appleIn: [1.9, 2.35],
        out: [3.0, 3.8], iris: [4.0, 4.3, 4.7], swap: 4.3, in1: [6.6, 7.1], lean: [7.3, 7.9], out1: [8.3, 8.65], in2: [9.2, 9.42], spark: 9.36, push: [9.7, 11.2], end: 11.2 };

    // ── colours ──────────────────────────────────────────────────────────────────────────
    const AMBER = { yellow: 1, 'pink.s': 0.55 };
    const NORTH = { pink: 0.85, 'yellow.s': 0.35 };
    const SOUTH = { blue: 0.55, 'yellow.s': 0.08 };
    const mix = (a, b, k) => { const o = {}; for (const key of new Set([...Object.keys(a), ...Object.keys(b)])) o[key] = L(a[key] ?? 0, b[key] ?? 0, k); return o; };

    // ── the orbit's world ────────────────────────────────────────────────────────────────
    const RE = 260, RO = 390;                  // the Earth, the orbit (Newton's last frame)
    const TURNS = 10, PITCH = 145, SC = 5.57;  // SC: orbit units per lab unit             // the coil: 10 turns, 1450 long
    const RM = 111, HL = 445;                  // the magnet: radius and half length
    const A0 = 1.12 + 0.85 * 0.4;              // the apple's angle where Newton leaves it
    const AEND = A0 + TURNS * 2 * Math.PI;
    // the apple's angle: it speeds up from its orbit's pace to a blur, and stops at the coil's end
    const W0 = 0.85, W1 = 36;
    function appleA(t) {
        // integral of ω(t) = W0 + (W1 - W0) · smoothstep(t / 1.2)
        const n = 60, dt = t / n; let a = A0;
        for (let i = 0; i < n; i++) { const u = Math.min(1, ((i + 0.5) * dt) / 1.2); a += (W0 + (W1 - W0) * u * u * (3 - 2 * u)) * dt; }
        return Math.min(a, AEND);
    }
    const xOf = (a) => (PITCH * (a - A0)) / (2 * Math.PI);
    // the Earth rides along the axis in the middle of the wound turns
    const earthX = (t) => xOf(appleA(t)) / 2;

    function camA(t) {
        const k = 1 - IO(S(t, T.turn[0], T.turn[1])) * 0.92; // 1: down the axis, ~0.08: from the side
        const phi = (k * Math.PI) / 2, d = L(6000, 4200, IO(S(t, T.turn[0], T.turn[1])));
        const tx = earthX(t), target = [tx, 0, 0];
        const eye = [tx - Math.sin(phi) * d, 0, Math.cos(phi) * d];
        const sc = L(1, 0.72, IO(S(t, T.turn[0], T.turn[1])));
        const c = [L(780, 800, IO(S(t, 0.2, 2.2))), L(510, 450, IO(S(t, 0.2, 2.2)))];
        return { C: Coil3D.cam(eye, target, d * sc, c, 0), k, phi };
    }

    // Newton's night sky and stars, swept across by the camera's turn (a far layer)
    function stars(press, t, pan) {
        ink(press, (g) => g.rect(0, 0, 1600, 900), { blue: 0.9 });
        ink(press, (g) => g.rect(0, 0, 1600, 900), { 'navy.s': (g) => Riso.radial(g, 820, 420, 120, 1000, 0.5, 0.95) });
        const off = ((pan % 1600) + 1600) % 1600;
        for (const dx of [off, off - 1600]) { press.save(); press.each((g) => g.translate(dx, 0)); Sets.stars(press, 0, 1600, 1, t + 7); press.restore(); }
    }

    // the Earth becoming the magnet: the globe, painted over from the poles, then a bar
    function earthMagnet(press, C, t) {
        const ex = earthX(t), pc = C.proj([ex, 0, 0]), rs = (RE * C.flen) / pc[2];
        const w = S(t, T.wipe[0], T.wipe[1]), e = IO(S(t, T.stretch[0], T.stretch[1]));
        if (w < 1) {
            Globe.draw(press, [pc[0], pc[1]], rs, { lon0: -1 + t * t * 20, lat0: -38, cloudLon: (7 + t) * 4 });
            // the thin atmosphere, as Newton's globe has it
            const atm = Math.max(3, rs * 0.015);
            press.knockout((g) => { g.beginPath(); g.arc(pc[0], pc[1], rs + atm, 0, 6.2832); g.arc(pc[0], pc[1], rs, 0, 6.2832, true); g.fill('evenodd'); });
            ink(press, (g) => { g.beginPath(); g.arc(pc[0], pc[1], rs + atm, 0, 6.2832); g.arc(pc[0], pc[1], rs, 0, 6.2832, true); }, { 'blue.s': 0.35 * (1 - 0.3) });
            if (w > 0) {
                // north from the +x pole, south from the −x pole, meeting at the equator
                const ax = C.proj([ex + RE, 0, 0]), u = [ax[0] - pc[0], ax[1] - pc[1]], ul = Math.hypot(u[0], u[1]) || 1, un = [u[0] / ul, u[1] / ul];
                press.save(); press.clip(circle(pc[0], pc[1], rs));
                for (const [sgn, spec] of [[1, NORTH], [-1, SOUTH]]) {
                    const reach = rs * (1 - w) * 1.02; // the edge moves from the pole to the middle
                    const o = [pc[0] + un[0] * sgn * reach, pc[1] + un[1] * sgn * reach], nx = -un[1], ny = un[0];
                    put(press, (g) => poly(g, [[o[0] + nx * 2000, o[1] + ny * 2000], [o[0] - nx * 2000, o[1] - ny * 2000], [o[0] - nx * 2000 + un[0] * sgn * 3000, o[1] - ny * 2000 + un[1] * sgn * 3000], [o[0] + nx * 2000 + un[0] * sgn * 3000, o[1] + ny * 2000 + un[1] * sgn * 3000]]), spec);
                }
                ink(press, circle(pc[0], pc[1], rs), { 'navy.s': (g) => Riso.radial(g, pc[0] - rs * 0.3, pc[1] - rs * 0.3, rs * 0.3, rs * 1.1, 0, 0.5) });
                press.restore();
            }
            return;
        }
        // the bar: a sphere stretching into a cylinder, north half red, south half blue
        const hl = L(RE, HL, e), r = L(RE, RM, e);
        const sphere = (u) => Math.sqrt(Math.max(0, 1 - (2 * u - 1) ** 2));
        const bar = (u) => Math.min(1, Math.min(u, 1 - u) * 40 + 0.72);
        Coil3D.cylinder(press, C, ex - hl, ex + hl, r, {
            profile: (u) => L(sphere(u), bar(u), e), base: SOUTH,
            bands: [[ex, ex + hl + 1, NORTH]], end: { pink: 0.7, 'navy.s': 0.3 },
        });
    }

    // the field lines: loops out of the poles, blooming, turning slowly, their colours cycling
    function field(press, C, t, amount) {
        if (amount <= 0) return;
        const ex = earthX(t), e = IO(S(t, T.stretch[0], T.stretch[1]));
        const base = L(RE, HL, e);
        const cols = [{ pink: 0.8 }, { yellow: 0.9 }, { 'blue.s': 0.7, 'yellow.s': 0.2 }, { 'pink.s': 0.6, yellow: 0.6 }];
        const cyc = Math.floor(t * 6);
        Coil3D.dipole(press, C, {
            c: ex, Ls: [1.3, 1.8, 2.6, 3.8].map((k) => k * base), az: [0, 1, 2, 3].map((i) => (i / 4) * 2 * Math.PI + 0.4 + t * 0.6),
            spec: (li) => cols[(li + cyc) % 4], w: 3.4, grow: amount, flow: t * 3, dash: { yellow: 1, 'pink.s': 0.2 },
        });
    }

    function phaseA(press, t) {
        const { C, phi } = camA(t);
        stars(press, t, phi * 900);
        const a = appleA(t), ca = S(t, T.copper[0], T.copper[1]);
        const pts = Coil3D.helix({ r: RO, pitch: PITCH, x0: 0, a0: A0 - 0.35, a1: a });
        // the first stretch (before A0) is the tail of Newton's orbit trail
        pts.forEach((p) => { if (p[0] < 0) p[0] = 0; });
        const wr = L(4, 14, ca);
        const spec = mix(AMBER, Coil3D.COPPER, ca), dark = mix({ yellow: 0.9, 'pink.s': 0.7 }, Coil3D.COPPER_DK, ca);
        const bloom = IO(S(t, T.bloom[0], T.bloom[1]));
        field(press, C, t, bloom);
        Coil3D.wire(press, C, pts, wr, { spec, dark, lit: { yellow: 1, 'pink.s': L(0.2, 0.35, ca) }, between: () => earthMagnet(press, C, t) });
        // the apple at the head of the wire, shrinking into its end
        const sz = 1 - S(t, T.appleIn[0], T.appleIn[1]);
        if (sz > 0) {
            const p = C.proj([xOf(a), RO * Math.cos(a), RO * Math.sin(a)]), rr = (17 * C.flen) / p[2];
            Seg.newtonApple.drawApple(press, p[0], p[1], rr * sz, (7 + t) * 6);
        }
    }


    // ── the laboratory's world (lab units: the coil 70 in radius along x, axis at y = 95) ──
    const AX = 95, CR = RO / SC, CP = PITCH / SC, CW = 14 / SC, MR = RM / SC, MH = HL / SC;
    const toLab = (p) => [(p[0] - 725) / SC, p[1] / SC + AX, p[2] / SC];
    // the magnet's centre along x: in the coil, slid out to his hand, then in and out
    const MX = [[0, 0], [T.out[0], 0], [T.out[1], -250], [T.in1[0], -250], [T.in1[1], -95], [T.out1[0], -95], [T.out1[1], -250], [T.in2[0], -250], [T.in2[1], -95], [T.end, -95]];
    const magX = (t) => Fig.track(MX, t);
    // the camera after the orbit's world: [t, eye, target, flen]
    // before the switch the camera swings to the coil's end and flies in; the iris covers the
    // frame at the switch, and it opens on a close view of his hand on the magnet, from the
    // front, drawing back to the bench
    const FIN = [[20, 130, 1000], [-50, 235, -120], 1520];
    const CAMK = () => {
        const a = camA(2.8), e = toLab(a.C.eye);
        return {
            pre: [[2.8, e, [0, AX, 0], a.C.flen], [T.swap, LAB0[0], LAB0[1], LAB0[2]]],
            post: [[T.swap, ...LAB0], [5.2, ...LAB0], [6.4, ...FIN], [T.push[0], ...FIN],
                [T.push[1], [FarLab.GAP.x + 6, FarLab.GAP.y + 8, FarLab.GAP.z + 70], [FarLab.GAP.x, FarLab.GAP.y, FarLab.GAP.z], 900]],
        };
    };
    // the coil never turns: the camera keeps its side view of the coil wound round the Earth and
    // eases to the lab's framing while the laboratory assembles round it (the bench rises
    // under it, the wall comes down behind, Faraday steps in and takes the magnet)
    const LAB0 = [[-170, 170, 440], [-220, 150, -40], 1050];
    const BUILD = [3.1, 4.3];
    const PULSES = [T.push[0], T.push[0] + 0.45, T.push[0] + 0.9];
    let CK = null;
    function camB(t) {
        CK = CK ?? CAMK();
        const K = t < T.swap ? CK.pre : CK.post, k = (i) => K.map((q) => [q[0], q[i]]);
        // into the spark's light by surges, one per throb (pulled in, not a steady dolly)
        if (t > T.push[0]) { let p = 0; PULSES.forEach((p0, i) => { if (t >= p0) p = L(i ? [0.32, 0.64][i - 1] : 0, [0.32, 0.64, 1][i], IO(Math.min(1, (t - p0) / 0.18))); }); t = T.push[0] + p * (T.push[1] - T.push[0]); }
        const eye = Fig.track(k(1), t), tgt = Fig.track(k(2), t), fl = Fig.track(k(3), t);
        return Coil3D.cam(eye, tgt, fl, [800, 450], 0);
    }

    // the galvanometer: a damped needle driven by the magnet's speed (the change of flux), so it
    // kicks going in, rests while the magnet is held, kicks the other way coming out
    function needleSim() {
        const dt = 0.001, n = Math.ceil(T.end / dt) + 10, th = new Float32Array(n), emf = new Float32Array(n);
        let a = 0, v = 0;
        const w = 2 * Math.PI * 1.6, z = 0.55, K = 0.0011;
        for (let i = 0; i < n; i++) {
            const t = i * dt, vel = t > T.in1[0] - 0.1 ? (magX(t + dt) - magX(t)) / dt : 0;
            emf[i] = vel;
            const acc = w * w * (K * vel - a) - 2 * z * w * v;
            v += acc * dt; a += v * dt; th[i] = a;
        }
        const at = (arr, t) => arr[Math.min(n - 1, Math.max(0, Math.round(t / dt)))];
        return { theta: (t) => Math.max(-0.66, Math.min(0.66, at(th, t))), emf: (t) => at(emf, t) };
    }

    // stars for the flight before the switch, swept by the camera's heading
    function starsB(press, t, C) {
        const yaw = Math.atan2(C.f[2], C.f[0]);
        stars(press, t, (yaw + Math.PI / 2) * 900 + 0.1257 * 900 * 0);
    }

    // the iris of colour bands: the coil's rings echoed in the four inks, closing in from the
    // frame's edge and opening again from the centre (cover 0 → 1 → 0)
    function iris(press, t) {
        const c = t < T.iris[1] ? IO(S(t, T.iris[0], T.iris[1])) : 1 - IO(S(t, T.iris[1], T.iris[2]));
        if (c <= 0) return;
        // (the film's night inks: navy, blue and copper, not a rainbow)
        const cols = [{ navy: 1, 'blue.s': 0.4 }, { pink: 0.75, yellow: 0.9, 'navy.s': 0.3 }, { blue: 0.85, 'navy.s': 0.35 }, { navy: 1, 'pink.s': 0.4 }, { pink: 0.6, yellow: 0.7, 'navy.s': 0.15 }, { blue: 0.7, 'navy.s': 0.6 }];
        const closing = t < T.iris[1], R = 1000, n = 12, rot = Math.floor(t * 12);
        // closing: bands appear from the outside in; opening: the inner ones go first. Each
        // band is a ring, so the scene shows through the hole in the middle
        const kin = closing ? Math.round(n * (1 - c)) : Math.round(n * (1 - c));
        for (let k = n - 1; k >= kin; k--) {
            const r0 = (R * k) / n, r1 = (R * (k + 1)) / n;
            put(press, (g) => { g.beginPath(); g.arc(800, 450, r1, 0, 6.2832); if (k > 0) g.arc(800, 450, r0, 0, 6.2832, true); }, cols[(k + rot) % cols.length]);
        }
        if (closing && c >= 1) put(press, circle(800, 450, R / n), cols[rot % cols.length]);
    }

    function labMagnet(press, C, t, st) {
        const xm = magX(t);
        Coil3D.cylinder(press, C, xm - MH, xm + MH, MR, { ay: AX, base: SOUTH, bands: [[xm, xm + MH + 1, NORTH]], end: { pink: 0.7, 'navy.s': 0.3 },
            profile: (u) => Math.min(1, Math.min(u, 1 - u) * 40 + 0.72) });
    }
    // Faraday: a card behind the bench; his near arm reaches forward to the magnet
    const FZ = -330, FK = 0.92;
    function farPose(t) {
        const lean = IO(S(t, T.lean[0], T.lean[1])) * (1 - IO(S(t, T.out1[0] - 0.05, T.out1[1] + 0.1)));
        const jump = Ease.bump(t, T.spark + 0.15, 0.35);
        // as he draws the magnet out towards him he draws his body back with it, so the arm stays
        // reaching forward (a hand that close to a still body folds the elbow out behind his back)
        const pull = Math.max(0, Math.min(1, (-95 - magX(t)) / 155)) * S(t, T.swap, T.swap + 0.01);
        const H = [-470 + lean * 140 - jump * 30 - 150 * pull, 540 - lean * 50 + jump * 10 + 12 * pull, FZ];
        const surprise = Math.max(Ease.bump(t, T.out1[1] + 0.25, 0.5), S(t, T.spark, T.spark + 0.12));
        const brow = surprise > 0.05 ? surprise : -IO(S(t, T.lean[0] + 0.2, T.lean[1])) * (1 - S(t, T.out1[0], T.out1[0] + 0.1));
        return { H, lean, brow, mouth: surprise * 0.8, look: lean > 0.3 || surprise > 0.2 ? [1, 0.2] : [1, 0.75] };
    }
    const COATC = Cast.COAT, COAT_LIT = Cast.COAT_LIT, COAT_DK = { navy: 1, yellow: 1, pink: 0.6 };
    function faraday(press, C, t, part) {
        const ps = farPose(t);
        const toW = (q) => [ps.H[0] + q[0] * FK, ps.H[1] - q[1] * FK, FZ];
        const drawn = FarLab.card(press, C, ps.H, [FK, 0, 0], [0, -FK, 0], () => {
            if (part !== 'body') return;
            // nothing of him below the bench top's height (the bench hides it from every camera)
            press.save(); press.clip((g) => g.rect(-400, -400, 800, (ps.H[1] + 90) / FK + 400)); // down to 90 below the top: hidden behind its back edge from above, by its front from below
            // the tailcoat from the shoulders down, the waistcoat and shirt in its opening
            // (he stands: the tailcoat and his legs go on down behind the bench to the floor, the
            // bench hiding them, so no cut shows at its edge whatever the camera's height)
            put(press, (g) => g.rect(-120, 520, 110, 420), { navy: 1, yellow: 0.9, 'blue.s': 0.3 });
            put(press, (g) => g.rect(0, 520, 100, 420), { navy: 1, yellow: 0.9, 'blue.s': 0.4 });
            const COATP = [[-120, 140], [-80, 108], [-10, 100], [50, 104], [96, 130], [120, 200], [128, 360], [126, 620], [118, 900], [-160, 900], [-162, 600], [-160, 330], [-150, 200]];
            put(press, (g) => smooth(g, COATP), COATC);
            press.save(); press.clip((g) => smooth(g, COATP));
            put(press, (g) => poly(g, [[44, 104], [100, 140], [110, 330], [96, 900], [40, 900], [34, 300]]), { 'yellow.s': 0.35, 'pink.s': 0.3, 'navy.s': 0.55 });
            for (let i = 0; i < 6; i++) put(press, circle(88 - i * 2, 190 + i * 55, 4), { 'yellow.s': 0.6, navy: 0.4 });
            put(press, (g) => poly(g, [[40, 104], [70, 118], [80, 170], [50, 180]]), Cast.LINEN);
            put(press, (g) => poly(g, [[30, 110], [96, 140], [70, 300], [40, 220]]), COAT_DK);
            line(press, [[36, 116], [70, 220], [76, 330], [80, 900]], taper(4), COAT_LIT);
            for (const [x0, x1] of [[-120, -130], [-70, -90]]) line(press, [[x0, 200], [x1, 900]], taper(5, 0.2, 0.2), COAT_LIT);
            line(press, [[-110, 150], [-40, 118], [40, 116]], taper(9, 0.3, 0.3), COAT_LIT);
            press.restore();
            press.restore();
            Cast.faraday(press, { headOnly: true, look: ps.look, brow: ps.brow, mouth: ps.mouth });
        });
        if (part !== 'arm' || !drawn) return;
        // the near arm: shoulder (in the card) to the hand on the magnet (the magnet's frame)
        const sh3 = toW([-20, 150]);
        const sh = C.proj([sh3[0], sh3[1], FZ + 70]);
        const xm = magX(t), s = xm - MH + 34, r = MR;
        const o = C.proj([s, AX, r]), a = C.proj([s + 1, AX, r]), b = C.proj([s, AX - 1, r]);
        const J = [a[0] - o[0], a[1] - o[1], b[0] - o[0], b[1] - o[1]];
        const F = { apply: (q) => [o[0] + J[0] * q[0] + J[2] * q[1], o[1] + J[1] * q[0] + J[3] * q[1]] };
        // IK to the knuckles, the hand as the forearm's straight continuation: the wrist on the
        // line from the knuckles to the elbow (no bend at the wrist)
        const k = Math.hypot(J[0], J[1]);
        const Kl = [0, -(r + 4)], K = F.apply(Kl);
        const [el] = Fig.ik(sh, K, 240 * k, 243 * k, [sh[0] + 20 * k, sh[1] + 400 * k]);
        const inv = (w) => { const det = J[0] * J[3] - J[1] * J[2], x = w[0] - o[0], y = w[1] - o[1]; return [(J[3] * x - J[2] * y) / det, (-J[1] * x + J[0] * y) / det]; };
        const ve = inv(el), l = Math.hypot(ve[0] - Kl[0], ve[1] - Kl[1]) || 1, fa = [(ve[0] - Kl[0]) / l, (ve[1] - Kl[1]) / l];
        const Wl = [Kl[0] + fa[0] * 28, Kl[1] + fa[1] * 28];
        const cu = F.apply([Wl[0] + fa[0] * 27, Wl[1] + fa[1] * 27]);
        const w = (u) => L(64, 44, u) * k * 0.9;
        line(press, [sh, el, cu], (u) => w(u) + 4 * k, { navy: 1, yellow: 1, pink: 0.8 });
        line(press, [sh, el, cu], w, COATC);
        line(press, [[L(sh[0], el[0], 0.2), L(sh[1], el[1], 0.2) - 18 * k], [el[0], el[1] - 16 * k], [L(el[0], cu[0], 0.8), L(el[1], cu[1], 0.8) - 14 * k]], taper(5 * k, 0.2, 0.3), COAT_LIT);
        press.save(); press.each((g) => g.transform(J[0], J[1], J[2], J[3], o[0], o[1]));
        GalHands.fist(press, r, { fa, squeeze: 0, above: true, align: true, short: true });
        press.restore();
    }

    // the spark's (the radium's) light as a glow, not a target: paper knocked out through a soft
    // radial falloff, a warm yellow core, a blue-green edge; R its radius on screen
    function lightGlow(press, q, R, performanceT = 0) {
        const R2 = R * 1.6;
        press.knockout((g) => { g.fillStyle = Riso.radial(g, q[0], q[1], R * 0.15, R2, 1, 0); g.beginPath(); g.arc(q[0], q[1], R2, 0, 6.2832); g.fill(); });
        ink(press, circle(q[0], q[1], R2), { 'yellow.s': (g) => Riso.radial(g, q[0], q[1], 0, R, 0.85, 0), 'blue.s': (g) => Riso.radial(g, q[0], q[1], R * 0.6, R2, 0.45, 0) });
        // inside the light it keeps beating: rings of brighter paper running out from its heart
        if (R > 900) for (let k = 0; k < 3; k++) { const ph = ((performanceT * 4.5 + k / 3) % 1), rr = 60 + ph * 1500; press.knockout((g) => { g.beginPath(); g.arc(q[0], q[1], rr, 0, 6.2832); g.arc(q[0], q[1], rr * 0.9, 0, 6.2832, true); g.globalAlpha = 0.55 * (1 - ph); g.fill('evenodd'); g.globalAlpha = 1; }); ink(press, (g) => { g.beginPath(); g.arc(q[0], q[1], rr, 0, 6.2832); g.arc(q[0], q[1], rr * 0.9, 0, 6.2832, true); }, { 'yellow.s': 0.25 * (1 - ph) }); }
    }
    function phaseLab(press, t, st) {
        const C = camB(t), lab = t >= BUILD[0];
        // the set assembling: each piece slides into place in screen space, on its own timing
        const bk = (a, b) => IO(S(t, a, b));
        const slide = (dx, dy, fn) => { if (dx === 0 && dy === 0) return fn(); press.save(); press.each((g) => g.translate(dx, dy)); fn(); press.restore(); };
        const kWall = bk(BUILD[0], BUILD[0] + 0.7), kBench = bk(BUILD[0] + 0.15, BUILD[0] + 0.85), kFar = bk(BUILD[0] + 0.45, BUILD[1]);
        starsB(press, t, C);
        if (lab) {
            slide(0, -1000 * (1 - kWall), () => { put(press, (g) => g.rect(0, -60, 1600, 1020), { navy: 1, 'pink.s': 0.45, 'blue.s': 0.3 }); FarLab.back(press, C, t); });
            slide(-900 * (1 - kFar), 0, () => faraday(press, C, t, 'body'));
            slide(0, 900 * (1 - kBench), () => { FarLab.bench(press, C, t); FarLab.galvanometer(press, C, st.sim.theta(t), t); });
        }
        // the field lines retract into the magnet after the switch
        const fg = 1 - IO(S(t, T.swap, T.swap + 0.8));
        if (fg > 0) {
            const cols = [{ pink: 0.8 }, { yellow: 0.9 }, { 'blue.s': 0.7, 'yellow.s': 0.2 }, { 'pink.s': 0.6, yellow: 0.6 }], cyc = Math.floor(t * 6);
            Coil3D.dipole(press, C, { ay: AX, c: magX(t), Ls: [1.3, 1.8, 2.6, 3.8].map((q) => q * MH), az: [0, 1, 2, 3].map((i) => (i / 4) * 2 * Math.PI + 0.4 + t * 0.6), spec: (li) => cols[(li + cyc) % 4], w: 3.4, grow: fg, flow: t * 3, dash: { yellow: 1, 'pink.s': 0.2 } });
        }
        const pts = Coil3D.helix({ r: CR, pitch: CP, x0: -130, a0: A0, a1: AEND, ay: AX });
        if (t >= BUILD[1]) FarLab.leads(press, C);
        Coil3D.wire(press, C, pts, CW, { ay: AX, between: () => { labMagnet(press, C, t, st); } });
        if (t >= BUILD[1] - 0.2) {
            FarLab.sparkGap(press, C, st.sim.emf(t) > 900 || (t >= T.spark && t < T.spark + 0.34) || t > T.push[0] ? 1 : 0, t);
            // (he takes the magnet once he is in place)
            if (t >= BUILD[1]) faraday(press, C, t, 'arm');
            // the spark's light opens into the frame: solid rings of blue-green (no fades on a riso
            // press), the brightest at the core, until the core fills it (Curie's radium glow)
            // the spark's light swells in pulses (three throbs, each bigger than the last) and the
            // third one takes the frame: we go into it
            const LV = [0.42, 0.7, 1.08];
            let gl = 0;
            PULSES.forEach((p0, i) => { if (t >= p0) { const u = t - p0, up = IO(Math.min(1, u / 0.14)), back = i < 2 ? 0.12 * IO(Math.min(1, Math.max(0, (u - 0.14) / 0.3))) : 0; gl = LV[i] * up - back + (i ? (LV[i - 1] - 0.12) * (1 - up) : 0); } });
            if (gl > 0) {
                const q = C.proj([FarLab.GAP.x, FarLab.GAP.y, FarLab.GAP.z]);
                lightGlow(press, q, Math.exp(L(Math.log(30), Math.log(2400), Math.min(1, gl))), t);
                // each throb's leading edge: a bright rim of paper running out ahead of the light
                PULSES.forEach((p0) => { const u = (t - p0) / 0.25; if (u > 0 && u < 1) { const r = Math.exp(L(Math.log(40), Math.log(2600), Math.min(1, gl + 0.08))); press.knockout((g) => { g.beginPath(); g.arc(q[0], q[1], r, 0, 6.2832); g.arc(q[0], q[1], r * 0.93, 0, 6.2832, true); g.globalAlpha = 0.8 * (1 - u); g.fill('evenodd'); g.globalAlpha = 1; }); } });
            }
        }
    }

    Seg.faradayCoil = {
        T,
        init() { return { sim: needleSim() }; },
        draw(press, tq, st) {
            const t = tq;
            if (t < 2.8) phaseA(press, t);
            else phaseLab(press, t, st);
        },
    };
})();
