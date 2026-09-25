// Segment «Einstein chases the light» of physics-history (script v2), after Curie's ray. Young
// Einstein (the 1905 thought experiment: what would a light wave look like if you ran beside
// it?) runs flat out beside the ray, whose front is a bright pulse; the film's cat gallops
// ahead chasing the pulse like a laser dot. Around them the grid of spacetime streams past in
// perspective, contracting and curving forward as they speed up. A huge Sun rises ahead: the
// grid is pulled in towards it and the ray bends round it (gravitational lensing, the 1919
// eclipse test). Near the speed of light the corridor contracts into a box with them inside,
// the camera draws back and up, and the box is what the next scene opens as Schrödinger's.
//
//   Seg.einsteinRay.draw(press, tq, st)   local time 0–T.end (on twos)
//
// Join in: one amber ray across the frame at y = 450, 10 wide, on a dark ground (Curie's end).
// Join out: a wireframe cube in amber lines, centred, on the dark ground.
var Seg = globalThis.Seg ?? (globalThis.Seg = {});
(() => {
    const { put, ink, line, smooth, poly, taper, circle, ellipse } = Ph;
    const L = Ease.lerp, S = Ease.seg, IO = Ease.inOut;
    const P = () => Seg.einstein.parts;

    // 0–1.2 the ray alone, he runs into frame; 1.2–4 the chase; 3.4–5.8 the Sun rises ahead,
    // the grid bends and the ray with it; 5.8–7.8 the camera draws back and the grid folds into
    // the cube; 7.8–8.4 it holds
    const T = { enter: [0.2, 1.4], sun: [3.4, 5.4], bend: [4.2, 5.8], fold: [5.8, 7.8], end: 8.4 };

    const AMBER = { yellow: 1, 'pink.s': 0.55 };
    const GRID = { 'blue.s': 0.55, 'yellow.s': 0.15 };
    const SKIN = Cast.SKIN, SKIN_SH = Cast.SKIN_SH;
    const RY = 450;                                        // the ray's height on screen

    // ── spacetime: a corridor of grid (floor, ceiling, far wall) in the world's rest frame,
    // seen by a camera running with them. As they speed up the world is Lorentz-contracted along
    // the run (x shrinks by 1/γ) and the view ahead bunches forward (aberration), so the grid
    // squeezes and curves into a tunnel, bluer ahead and redder behind (Doppler). At the end, near
    // the speed of light, the endless corridor contracts into a box with them inside, and the
    // camera draws back and up to show it: that box is Schrödinger's.
    const F = 900, CY = 450, H = 560, XE = 4000, ZB = 2200, CEND = H / XE;
    function sunAt(t) { const u = IO(S(t, T.sun[0], T.sun[1])); return { u, p: [L(2400, 420, u), -540, 900], R: 360 }; }
    const beta = (t) => L(0.25, 0.7, IO(S(t, T.enter[0], T.sun[1])));
    function view(t) {
        const fold = IO(S(t, T.fold[0], T.fold[1])), b = beta(t);
        return {
            fold, beta: b, c: L(Math.sqrt(1 - b * b), CEND, fold), zk: L(1, 2 * H / (ZB + H), fold), ab: 0.5 * b * (1 - fold),
            D: L(900, 3000, fold), cx: L(0, -1400, fold), cy: L(0, -900, fold),
        };
    }
    // rest-frame point → screen [x, y, scale]; the lens is shifted so the box stays centred
    function toScreen(q, v) {
        const z = -H + (q[2] + H) * v.zk;
        let X = q[0] * v.c - v.cx, Y = q[1] - v.cy, Z = z + v.D;
        if (v.ab > 0) {
            const r = Math.hypot(X, Y, Z), nx = X / r, den = 1 + v.ab * nx, sc = Math.sqrt(1 - v.ab * v.ab) / den;
            X = r * (nx + v.ab) / den; Y *= sc; Z *= sc;
        }
        if (Z < 60) return null;
        const k = F / Z, k0 = F / v.D;
        return [800 + X * k + v.cx * k0, CY + Y * k + v.cy * k0, k];
    }
    function warp(q, t) {
        const sn = sunAt(t), b = IO(S(t, T.bend[0], T.bend[1])) * (1 - S(t, T.fold[0], T.fold[0] + 1));
        if (b <= 0) return q;
        const dx = sn.p[0] - q[0], dy = sn.p[1] - q[1], dz = sn.p[2] - q[2], r = Math.hypot(dx, dy, dz) || 1;
        const a = 260, d = b * 380 * a * a * r / Math.pow(r * r + a * a, 1.5);
        return [q[0] + dx / r * d, q[1] + dy / r * d, q[2] + dz / r * d];
    }
    function grid(press, t, v) {
        // the lines across the run stream past faster as they speed up; as the contraction packs
        // them closer, every other one fades (then every other again) so the grid never clogs
        const off = (900 * t + 260 * Math.pow(Math.max(0, t - T.enter[1]), 2)) % 800;
        const lod = (n) => { const m = ((n % 4) + 4) % 4; return m === 0 ? 1 : m === 2 ? S(v.c, 0.3, 0.55) : S(v.c, 0.55, 0.8); };
        const xs = [];
        for (let n = Math.ceil((-XE + off) / 200); n <= Math.floor((XE + off) / 200); n++) xs.push([n * 200 - off, lod(n)]);
        const lines = [], face = S(v.fold, 0.3, 0.8);
        const run = (f, a0, a1, st) => { const pts = []; for (let u = a0; u <= a1 + 0.1; u += st) pts.push(f(u)); return pts; };
        // (the camera rises through the ceiling's plane in the fold: the ceiling fades first, so it
        // never shows edge-on as a band; the box's top is left to its amber edges)
        for (const y of [-H, H]) {
            const fy = y < 0 ? 1 - S(v.fold, 0.15, 0.45) : 1;
            for (let z = -H; z <= ZB; z += 197) lines.push([run((x) => [x, y, z], -XE, XE, 100), fy]);
            for (const [x, wt] of xs) lines.push([run((z) => [x, y, z], -H, ZB, 100), wt * fy]);
        }
        for (const [x, wt] of xs) lines.push([run((y) => [x, y, ZB], -H, H, 80), wt]);
        // the box's other faces come in with the fold: the far wall's rows, the two end walls
        if (face > 0) {
            for (const y of [-H / 2, 0, H / 2]) lines.push([run((x) => [x, y, ZB], -XE, XE, 100), face]);
            for (const x of [-XE, XE]) {
                for (let z = -H; z <= ZB; z += 394) lines.push([run((y) => [x, y, z], -H, H, 80), face]);
                for (const y of [-H / 2, 0, H / 2]) lines.push([run((z) => [x, y, z], -H, ZB, 100), face]);
            }
        }
        for (const [pts, wt] of lines) {
            if (wt <= 0.01) continue;
            const Q = pts.map((q) => toScreen(warp(q, t), v)).filter(Boolean);
            if (Q.length < 2) continue;
            const P2 = Q.map(([x, y]) => [x, y]), w = Math.max(1.4 + 1.6 * v.fold, 3 * Math.min(1, Q[0][2] * 1.2));
            const u = Math.min(1, Math.max(0, Q[Q.length >> 1][0] / 1600)), dop = v.beta * (1 - v.fold);
            const al = wt * (1 - 0.35 * v.fold);
            press.knockout((g) => { Ph.poly(g, Ph.outline(P2, w)); g.globalAlpha = 0.55 * al; g.fill(); g.globalAlpha = 1; });
            line(press, P2, w, { 'blue.s': (0.25 + 0.45 * dop * u) * al, 'yellow.s': 0.12 * al, 'pink.s': 0.55 * dop * (1 - u) * al }, { knock: false });
        }
    }
    // the box's edges, traced in amber once the corridor has closed round them
    function cube(press, t, v) {
        const k = IO(S(t, T.fold[0] + 1.0, T.fold[1]));
        if (k <= 0) return;
        const V = [];
        for (const x of [-XE, XE]) for (const y of [-H, H]) for (const z of [-H, ZB]) V.push(toScreen([x, y, z], v));
        const E = [[0, 1], [0, 2], [0, 4], [1, 3], [1, 5], [2, 3], [2, 6], [3, 7], [4, 5], [4, 6], [5, 7], [6, 7]];
        for (const [i, j] of E) if (V[i] && V[j]) line(press, [[V[i][0], V[i][1]], [V[j][0], V[j][1]]], 6 * k, AMBER);
    }

    // ── the ray: from the left edge to its front (a bright pulse), bending round the Sun ──────
    function rayPts(t, front, x0 = -40) {
        const pts = [];
        const sn = sunAt(t), b = IO(S(t, T.bend[0], T.bend[1])) * (1 - IO(S(t, T.fold[0], T.fold[0] + 0.4)));
        const sp = toScreen(sn.p, { ...view(t), fold: 0, D: 900, cx: 0, cy: 0 });
        let y = RY, vy = 0;
        for (let x = -40; x <= front; x += 8) {
            if (x < x0) { pts.length = 0; }
            if (b > 0 && sp) {
                const dx = sp[0] - x, dy = sp[1] - y, r2 = dx * dx + dy * dy;
                vy += b * 110 * dy / Math.pow(r2 + 900, 1.5) * 8;
            }
            y += vy * 8;
            pts.push([x, y]);
        }
        return pts;
    }
    function ray(press, t, front, x0) {
        const pts = rayPts(t, front, x0);
        if (pts.length < 2) return pts;
        press.knockout((g) => { g.lineCap = 'round'; g.lineJoin = 'round'; g.lineWidth = 34; g.globalAlpha = 0.35; g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke(); g.globalAlpha = 1; });
        line(press, pts, 10, AMBER);
        const e = pts[pts.length - 1];
        press.knockout((g) => { g.fillStyle = Riso.radial(g, e[0], e[1], 2, 60, 0.9, 0); g.beginPath(); g.arc(e[0], e[1], 60, 0, 6.2832); g.fill(); });
        put(press, circle(e[0], e[1], 12), { yellow: 1, 'pink.s': 0.25 });
        return pts;
    }

    // ── the Sun: a disc with a limb, granules and prominences, pulling the grid ─────────────
    function sun(press, t, v) {
        const sn = sunAt(t);
        if (sn.u <= 0) return;
        // they overtake it: in the fold it slides back behind them and shrinks away; contracted
        // along the run like everything else in the rest frame
        const gone = IO(S(v.fold, 0, 0.3));
        if (gone >= 1) return;
        const p = toScreen([sn.p[0] - 1500 * gone, sn.p[1], sn.p[2]], v);
        if (!p) return;
        const R = sn.R * p[2] * (1 - 0.5 * gone);
        press.save(); press.each((g) => { g.translate(p[0], p[1]); g.scale(Math.max(0.04, v.c * (1 - gone)), 1); g.translate(-p[0], -p[1]); });
        press.knockout((g) => { g.fillStyle = Riso.radial(g, p[0], p[1], R, R * 1.8, 0.7, 0); g.beginPath(); g.arc(p[0], p[1], R * 1.8, 0, 6.2832); g.fill(); });
        put(press, circle(p[0], p[1], R), { yellow: 1, 'pink.s': 0.35 });
        ink(press, circle(p[0], p[1], R), { 'pink.s': (g) => Riso.radial(g, p[0], p[1], R * 0.5, R, 0, 0.5) });
        const r = Motion.rng('sun-gran');
        for (let i = 0; i < 70; i++) { const a = r() * 6.28, rr = Math.sqrt(r()) * R * 0.9; put(press, circle(p[0] + Math.cos(a) * rr, p[1] + Math.sin(a) * rr, R * (0.02 + r() * 0.03)), { 'pink.s': 0.5 }, { knock: false }); }
        for (let i = 0; i < 9; i++) { const a = i * 0.7 + t * 0.1, q = [p[0] + Math.cos(a) * R, p[1] + Math.sin(a) * R]; line(press, [q, [q[0] + Math.cos(a + 0.3) * R * 0.14, q[1] + Math.sin(a + 0.3) * R * 0.14], [q[0] + Math.cos(a) * R * 0.06, q[1] + Math.sin(a) * R * 0.06]], taper(R * 0.03, 0.2, 0.6), { pink: 0.8, yellow: 1 }); }
        press.restore();
    }

    // ── Einstein running (young, 1905: short dark hair, a moustache, a dark three-piece suit)
    // A 7.5-head figure about 830 tall. The run on a 2.6 Hz stride: the legs swing from the
    // hip, the knee lifts in front, the arms swing opposite with bent elbows and loose fists;
    // the body leans into it and bobs. Every piece is drawn in its own shape, shaded on the
    // side turned from the ray's light (the ray is above and ahead: lit edges at front-top).
    const WOOL = { 'navy.s': 0.82, 'yellow.s': 0.62, 'pink.s': 0.44, 'blue.s': 0.22 };
    const WOOL_LT = { 'navy.s': 0.62, 'yellow.s': 0.58, 'pink.s': 0.42, 'blue.s': 0.24 };
    const WOOL_DK = { navy: 1, 'yellow.s': 0.7, 'pink.s': 0.5, 'blue.s': 0.2 };
    const SHOE = { navy: 1, yellow: 1, 'pink.s': 0.55 };
    const EDGE = { 'pink.s': 0.6, 'navy.s': 0.45 };
    function runner(press, t, x0, ground) {
        const ph = t * 2.6 * 6.2832, su = P();
        const bob = -Math.abs(Math.sin(ph)) * 16;
        const lean = 0.2, cl = Math.cos(lean), sl = Math.sin(lean);
        const hip = [x0, ground - 390 + bob];
        // body frame: x forward, y down the spine, pivoting at the hip
        const B = (x, y) => [hip[0] + x * cl - y * sl, hip[1] + x * sl + y * cl];
        const sh = B(10, -250), neck = B(22, -290);
        // a leg: the foot's target on the stride ellipse; knee pole forward
        const legAt = (k) => { const a = ph + k * Math.PI, sw = Math.sin(a); return [hip[0] + sw * 170 + 20, ground - Math.max(0, Math.cos(a)) * 110 - 4]; };
        const leg = (k, far) => {
            const hp = B(far ? -12 : 8, 0), ft = legAt(k);
            const [kn, an] = Fig.ik(hp, ft, 205, 195, [hp[0] + 300, hp[1] + 60]);
            const spec = far ? WOOL_DK : WOOL;
            Fig.seg(press, hp, kn, 78, 60, spec);
            Fig.seg(press, kn, an, 58, 44, spec);
            if (!far) {
                // the crease down the front of the trouser leg, lit
                line(press, [[hp[0] + 22, hp[1] + 10], [kn[0] + 18, kn[1] - 6], [an[0] + 12, an[1] - 14]], taper(4, 0.2, 0.3), WOOL_LT, { knock: false });
                line(press, [[kn[0] - 22, kn[1] + 4], [kn[0] - 6, kn[1] + 14]], taper(3), EDGE, { knock: false });
            }
            // the shoe: an oxford in profile, its toe along the ground or pointing down in the swing
            const fa = Math.atan2(an[1] - kn[1], an[0] - kn[0]) - Math.PI / 2, ca = Math.cos(fa), sa = Math.sin(fa);
            const S2 = (x, y) => [an[0] + x * ca - y * sa, an[1] + x * sa + y * ca];
            put(press, (g) => smooth(g, [S2(-24, -10), S2(10, -18), S2(50, -8), S2(72, 8), S2(70, 22), S2(-26, 22), S2(-30, 6)]), SHOE);
            line(press, [S2(-28, 20), S2(70, 20)], 5, { 'yellow.s': 0.4, 'navy.s': 0.4 }, { knock: false });
            line(press, [S2(30, -12), S2(44, 2)], taper(3), { 'yellow.s': 0.4, 'blue.s': 0.3 }, { knock: false });
            put(press, (g) => g.rect(an[0] - 26, an[1] - 30, 4, 4), SHOE);
        };
        // an arm swinging opposite its leg: upper arm from the shoulder, elbow bent ~90°, a loose
        // fist (the fingers curled, the thumb over the index, knuckles leading; see the fist below)
        const arm = (k, far) => {
            const a = Math.sin(ph + k * Math.PI + Math.PI), s0 = far ? B(-6, -236) : B(18, -238);
            // the upper arm swings about the shoulder; the forearm stays bent ~80° forward of it,
            // so the hand is always ahead of the elbow (low by the hip going back, up at the chest
            // going forward)
            const th = 0.75 * a, th2 = th + 1.4;
            const el = [s0[0] + 140 * Math.sin(th), s0[1] + 140 * Math.cos(th)];
            const wr = [el[0] + 112 * Math.sin(th2), el[1] + 112 * Math.cos(th2)];
            const spec = far ? WOOL_DK : WOOL;
            Fig.seg(press, s0, el, 60, 50, spec);
            Fig.seg(press, el, wr, 50, 42, spec);
            if (!far) line(press, [[s0[0] + 16, s0[1] + 6], [el[0] + 14, el[1] - 6]], taper(4, 0.2, 0.3), WOOL_LT, { knock: false });
            // the shirt cuff, then the fist
            const d = Math.atan2(wr[1] - el[1], wr[0] - el[0]), dx = Math.cos(d), dy = Math.sin(d);
            const X = (x, y) => [wr[0] + x * dx - y * dy, wr[1] + x * dy + y * dx];
            put(press, (g) => smooth(g, [X(-6, -20), X(8, -21), X(10, 21), X(-6, 20)]), Cast.LINEN);
            // right hand seen from the thumb's side (camera on the figure's right): the back of the
            // hand, the knuckles' step, the four curled fingers stacked index to little down the front,
            // the thumb lying over the index's middle phalanx; one skin, shaded underneath
            const skin = far ? SKIN_SH : SKIN;
            const FIST = [X(4, -16), X(22, -19), X(38, -19), X(48, -16), X(57, -10), X(62, 1), X(60, 13), X(52, 21), X(38, 22), X(20, 20), X(6, 17)];
            put(press, (g) => smooth(g, FIST), skin);
            press.save(); press.clip((g) => smooth(g, FIST));
            ink(press, (g) => poly(g, [X(0, 11), X(70, 9), X(70, 40), X(0, 40)]), SKIN_SH === skin ? { navy: 0.25 } : SKIN_SH);
            put(press, (g) => smooth(g, [X(26, -17), X(40, -17), X(44, -12), X(30, -12)]), { 'yellow.s': 0.1 }, { knock: false });
            press.restore();
            // the knuckles' joint, then the lines between the curled fingers: dark and thick enough
            // to survive the halftone at this size (thin creases vanish and the fist reads as a mitten)
            const CR = { 'pink.s': 0.55, 'navy.s': 0.3, 'yellow.s': 0.2 };
            line(press, [X(40, -10), X(44, 2), X(41, 14)], taper(2.2, 0.3, 0.3), CR, { knock: false });
            for (const [y0, y1] of [[-1, 0], [7, 8], [14, 16]]) line(press, [X(47, y0), X(61, y1)], taper(2.4, 0.2, 0.5), CR, { knock: false });
            // the thumb, raised over the index as a bump on the silhouette, its underside dark
            put(press, (g) => smooth(g, [X(12, -15), X(28, -23), X(46, -20), X(55, -11), X(50, -4), X(30, -8)]), skin);
            line(press, [X(22, -9), X(38, -6), X(52, -4)], taper(2.4, 0.2, 0.3), CR, { knock: false });
            if (!far) put(press, (g) => smooth(g, [X(45, -18), X(53, -13), X(52, -9), X(46, -11)]), { 'pink.s': 0.18, 'yellow.s': 0.05 }, { knock: false });
        };
        // far arm and leg first
        arm(0, true);
        leg(1, true);
        // the jacket: shoulders, chest, back, skirts to the hip that fly back with the run
        const fly = 10 + 8 * Math.sin(ph * 2);
        const JACK = [B(-56, -250), B(-10, -272), B(50, -266), B(70, -210), B(72, -60), B(62, 34), B(10, 46), B(-44, 44), B(-66 - fly, 36), B(-64, -40), B(-66, -160)];
        put(press, (g) => smooth(g, JACK), WOOL);
        press.save(); press.clip((g) => smooth(g, JACK));
        // the back in shade, a seam, the lit front edge
        ink(press, (g) => smooth(g, [B(-120, -300), B(-30, -300), B(-40, 80), B(-160, 80)]), { navy: 0.35 });
        line(press, [B(-20, -250), B(-26, -60), B(-40, 40)], taper(3), WOOL_DK, { knock: false });
        press.restore();
        // the opening: waistcoat, shirt, a dark tie; lapels; buttons
        put(press, (g) => poly(g, [B(34, -262), B(62, -258), B(70, -120), B(58, -40), B(40, -60), B(36, -180)]), { navy: 1, 'yellow.s': 0.5, 'pink.s': 0.5 });
        put(press, (g) => poly(g, [B(38, -266), B(62, -262), B(58, -200), B(44, -186)]), Cast.LINEN);
        put(press, (g) => poly(g, [B(50, -262), B(58, -262), B(60, -196), B(54, -186), B(48, -196)]), { navy: 1, 'pink.s': 0.6 });
        put(press, (g) => poly(g, [B(28, -266), B(46, -250), B(66, -130), B(56, -110), B(30, -200)]), WOOL_LT);
        line(press, [B(30, -262), B(48, -248), B(66, -130)], taper(3), EDGE, { knock: false });
        for (let i = 0; i < 3; i++) { const q = B(64, -100 + i * 36); put(press, circle(q[0], q[1], 4.5), { navy: 1, yellow: 0.8 }); }
        line(press, [B(10, -40), B(56, -44)], taper(3), WOOL_DK, { knock: false });
        // neck and collar
        put(press, (g) => smooth(g, [B(8, -276), B(40, -278), B(44, -306), B(12, -310)]), SKIN_SH);
        put(press, (g) => smooth(g, [B(4, -270), B(46, -272), B(50, -290), B(6, -292)]), Cast.LINEN);
        // the head: the approved Einstein face, with his own thick tousled hair (the neat short hair read as Tesla), leaning into the run, eyes on
        // the pulse ahead; scaled to a 7.5-head figure
        const hc = B(40, -330);
        Ph.cam(press, hc[0], hc[1], 0.6, () => { press.each((g) => g.rotate(lean * 0.6)); su.einsteinBody(press, { headOnly: true, bold: true, look: [1, 0.05], brow: 4, hairWave: Math.sin(ph) * 4 }); });
        // near leg and arm
        leg(0, false);
        arm(1, false);
    }

    Seg.einsteinRay = {
        T,
        init() { return {}; },
        draw(press, tq) {
            const t = tq;
            put(press, (g) => g.rect(0, 0, 1600, 900), { blue: 0.9, 'navy.s': 0.92, 'pink.s': 0.2 });
            const v = view(t);
            grid(press, t, v);
            sun(press, t, v);
            // the pulse runs ahead at the frame's right; it creeps further on through the chase
            // (they gain on the screen but never catch it)
            const front = (t < T.enter[0] ? 1640 : L(1640, 1180, IO(S(t, T.enter[0], T.enter[1])))) + 160 * IO(S(t, T.enter[1], T.fold[0]));
            // their own frame (z = 0): drawn flat, scaled as the camera draws back, nudged to the
            // box's middle; the ray starts at the box's end wall once it closes
            const k0 = F / v.D, sh = 150 * v.fold;
            press.save(); press.each((g) => { g.translate(800, 450); g.scale(k0, k0); g.translate(-800 - sh, -450); });
            {
                const pts = ray(press, t, front, Math.max(-40, 800 + sh - XE * v.c));
                // the cat, chasing the pulse like a laser dot: galloping just below it, pouncing
                const e = pts[pts.length - 1] ?? [front, RY];
                const catX = L(760, e[0] - 160, IO(S(t, 0, 1.6)));
                const pounce = Ease.bump(t, 2.9, 0.5) + Ease.bump(t, 4.6, 0.5);
                Cat.run(press, { x: catX, y: RY + 200, s: 1.3, face: 1, ph: t * 3.2, pounce });
                // Einstein, in frame from the first frame, gaining ground on the pulse through the chase
                const ex = L(120, e[0] - L(640, 500, IO(S(t, 1.6, 5.4))), IO(S(t, 0, 1.8)));
                runner(press, t, ex, 1010);
            }
            press.restore();
            cube(press, t, v);
        },
    };
})();
