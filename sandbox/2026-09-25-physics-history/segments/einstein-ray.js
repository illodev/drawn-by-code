// Segment «Einstein chases the light» of physics-history (script v2), after Curie's ray. Young
// Einstein (the 1905 thought experiment: what would a light wave look like if you ran beside
// it?) runs flat out beside the ray, whose front is a bright pulse; the film's cat gallops
// ahead chasing the pulse like a laser dot. Around them the grid of spacetime streams past in
// perspective, contracting and curving forward as they speed up. A black hole opens ahead: the
// grid swirls into it, the ray bends towards it, and runners, cat and ray are stretched towards
// it (spaghettified) and swallowed while the camera dives in, rolling, until all is black. Then,
// cut by cut, the lines of a cube snap in on the black: Schrödinger's box, two green eyes inside.
//
//   Seg.einsteinRay.draw(press, tq, st)   local time 0–T.end (on twos)
//
// Join in: one amber ray across the frame at y = 450, 10 wide, on a dark ground (Curie's end).
// Join out: a wireframe cube in amber lines, centred, on black, the cat's eyes glowing inside.
var Seg = globalThis.Seg ?? (globalThis.Seg = {});
(() => {
    const { put, ink, line, smooth, poly, taper, circle, ellipse } = Ph;
    const L = Ease.lerp, S = Ease.seg, IO = Ease.inOut;
    const P = () => Seg.einstein.parts;

    // 0–1.4 they run into their places; 1.4–3.2 the chase, speeding up; 3.2–4.8 the black hole
    // opens ahead; 4.5–6.1 it pulls them in (spaghettification); 5.2–7.0 the camera dives in,
    // rolling, to black (a beat of 0.2 s); 6.6–7.25 the cube snaps in edge by edge; to 8.6 it holds, eyes inside
    const T = { enter: [0.2, 1.4], hole: [3.2, 4.8], pull: [4.5, 6.1], dive: [5.2, 7.0], build: [6.6, 7.5], end: 8.6 };

    const AMBER = { yellow: 1, 'pink.s': 0.55 };
    const GRID = { 'blue.s': 0.55, 'yellow.s': 0.15 };
    const SKIN = Cast.SKIN, SKIN_SH = Cast.SKIN_SH;
    const RY = 450;                                        // the ray's height on screen

    // ── spacetime: a corridor of grid (floor, ceiling, far wall) in the world's rest frame,
    // seen by a camera running with them. As they speed up the world is Lorentz-contracted along
    // the run (x shrinks by 1/γ) and the view ahead bunches forward (aberration), so the grid
    // squeezes and curves into a tunnel, bluer ahead and redder behind (Doppler).
    const F = 900, CY = 450, H = 560, XE = 4000, ZB = 2200;
    const beta = (t) => L(0.25, 0.86, IO(S(t, T.enter[0], T.hole[1])));
    function view(t) { const b = beta(t); return { beta: b, c: Math.sqrt(1 - b * b), ab: 0.5 * b }; }
    function toScreen(q, v) {
        let X = q[0] * v.c, Y = q[1], Z = q[2] + F;
        const r = Math.hypot(X, Y, Z), nx = X / r, den = 1 + v.ab * nx, sc = Math.sqrt(1 - v.ab * v.ab) / den;
        X = r * (nx + v.ab) / den; Y *= sc; Z *= sc;
        if (Z < 60) return null;
        const k = F / Z;
        return [800 + X * k, CY + Y * k, k];
    }
    // ── the black hole, in screen space: its centre ahead and high, its shadow's radius growing
    // as it opens; everything on screen is pulled in and swirled round it, harder near it
    const HC = [1330, 250];
    const holeR = (t) => 95 * IO(S(t, T.hole[0], T.hole[1]));
    function sink(P, t) {
        const R = holeR(t);
        if (R <= 0) return P;
        const g = 1 + 2.5 * IO(S(t, T.pull[0], T.pull[1]));
        const dx = P[0] - HC[0], dy = P[1] - HC[1], r = Math.hypot(dx, dy) || 1;
        const f = 1 - Math.min(0.97, g * R * R * 1.4 / (r * r + R * R * 0.6)) * (r > 0 ? 1 : 0);
        const th = 0.9 * g * R / (r + R);
        const c = Math.cos(th), sn = Math.sin(th);
        return [HC[0] + (dx * c - dy * sn) * f, HC[1] + (dx * sn + dy * c) * f, P[2]];
    }
    function grid(press, t, v) {
        // the lines across the run stream past faster as they speed up
        const off = (900 * t + 260 * Math.pow(Math.max(0, t - T.enter[1]), 2)) % 800;
        const xs = [];
        for (let n = Math.ceil((-XE + off) / 200); n <= Math.floor((XE + off) / 200); n++) xs.push(n * 200 - off);
        const lines = [];
        const run = (f, a0, a1, st) => { const pts = []; for (let u = a0; u <= a1 + 0.1; u += st) pts.push(f(u)); return pts; };
        for (const y of [-H, H]) {
            for (let z = -H; z <= ZB; z += 197) lines.push(run((x) => [x, y, z], -XE, XE, 50));
            for (const x of xs) lines.push(run((z) => [x, y, z], -H, ZB, 50));
        }
        for (const x of xs) lines.push(run((y) => [x, y, ZB], -H, H, 40));
        for (const pts of lines) {
            const Q = pts.map((q) => toScreen(q, v)).filter(Boolean).map((P) => sink(P, t));
            if (Q.length < 2) continue;
            const P2 = Q.map(([x, y]) => [x, y]), w = Math.max(1.4, 3 * Math.min(1, Q[0][2] * 1.2));
            const u = Math.min(1, Math.max(0, Q[Q.length >> 1][0] / 1600)), dop = v.beta;
            // (the grid fades in over the first moments: the cut from Curie is the ray alone)
            const gi = IO(S(t, 0, 0.5));
            if (gi <= 0) continue;
            press.knockout((g) => { Ph.poly(g, Ph.outline(P2, w)); g.globalAlpha = 0.55 * gi; g.fill(); g.globalAlpha = 1; });
            line(press, P2, w, { 'blue.s': (0.25 + 0.45 * dop * u) * gi, 'yellow.s': 0.12 * gi, 'pink.s': 0.55 * dop * (1 - u) * gi }, { knock: false });
        }
    }
    // the hole's back half: the lensed glow, the far side of the accretion disc bent up over the
    // shadow (the Interstellar look), the disc's back arc
    const DISC = { yellow: 1, 'pink.s': 0.6 }, DISC_HOT = { yellow: 1, 'pink.s': 0.25 };
    const BH = { navy: 1, blue: 1, yellow: 1, pink: 0.7 };
    const DEEP = { navy: 1, blue: 0.75, 'pink.s': 0.35, 'yellow.s': 0.1 };
    function arc(cx, cy, rx, ry, a0, a1, n = 40) { const pts = []; for (let i = 0; i <= n; i++) { const a = L(a0, a1, i / n); pts.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]); } return pts; }
    // (disc: 1 until the dive is under way, then 0: the camera falls past the disc's plane)
    const discK = (t) => 1 - S(t, T.dive[0] + 0.5, T.dive[0] + 0.9);
    function holeBack(press, t) {
        const R = holeR(t);
        if (R <= 0) return;
        const dk = discK(t);
        const [x, y] = HC;
        press.knockout((g) => { g.fillStyle = Riso.radial(g, x, y, R, R * 3.2, 0.8, 0); g.beginPath(); g.arc(x, y, R * 3.2, 0, 6.2832); g.fill(); });
        // the far side of the disc, lensed up over the top of the shadow and under its bottom
        if (dk <= 0) return;
        line(press, arc(x, y, R * 1.32, R * 1.36, Math.PI * 1.0, Math.PI * 2.0, 48), taper(R * 0.34 * dk, 0.15, 0.15), DISC);
        line(press, arc(x, y, R * 1.18, R * 1.18, Math.PI * 0.08, Math.PI * 0.92, 40), taper(R * 0.1 * dk, 0.2, 0.2), DISC);
        line(press, arc(x, y, R * 2.9, R * 0.28, Math.PI, Math.PI * 2), taper(R * 0.16 * dk, 0.1, 0.1), DISC);
    }
    function holeFront(press, t) {
        const R = holeR(t);
        if (R <= 0) return;
        const [x, y] = HC;
        put(press, circle(x, y, R), BH);
        // the photon ring, then the near side of the disc crossing in front of the shadow
        line(press, arc(x, y, R * 1.04, R * 1.04, 0, 6.2832, 64), R * 0.06, DISC_HOT, { knock: false });
        const dk = discK(t);
        if (dk <= 0) return;
        line(press, arc(x, y, R * 2.9, R * 0.28, 0, Math.PI, 48), taper(R * 0.2 * dk, 0.1, 0.1), DISC);
        // brighter streaks orbiting in the near side (the side coming at us, Doppler-bright)
        for (let i = 0; i < 12; i++) {
            const a = ((i * 0.52 + t * 2.4) % 6.2832), a2 = a + 0.2;
            if (a > Math.PI - 0.2) continue;
            line(press, arc(x, y, R * 2.9, R * 0.28, a, a2, 6), taper(R * 0.07 * dk, 0.3, 0.3), DISC_HOT, { knock: false });
        }
    }
    // ── the cube, cut in on the black edge by edge (one edge per drawing, montage style), then
    // its faces' grid, then the cat's eyes open inside
    function cube(press, t) {
        if (t < T.build[0]) return;
        const c = [0, 0, 900], h = 330, a = 0.55, b = 0.38;
        const R = ([x, y, z]) => { const x1 = x * Math.cos(a) - z * Math.sin(a), z1 = x * Math.sin(a) + z * Math.cos(a); const y1 = y * Math.cos(b) - z1 * Math.sin(b), z2 = y * Math.sin(b) + z1 * Math.cos(b); const k = F / (c[2] + z2 + 900); return [800 + x1 * k, CY + y1 * k]; };
        const V = [];
        for (const x of [-h, h]) for (const y of [-h, h]) for (const z of [-h, h]) V.push(R([x, y, z]));
        // bottom square, the four uprights, the top square
        const E = [[1, 3], [3, 7], [7, 5], [5, 1], [0, 1], [2, 3], [6, 7], [4, 5], [0, 2], [2, 6], [6, 4], [4, 0]];
        const step = (T.build[1] - T.build[0] - 0.25) / E.length;
        const faces = IO(S(t, T.build[1] - 0.2, T.build[1] + 0.2));
        if (faces > 0) for (const [ax, sg] of [[0, 1], [1, 1], [2, 1]]) for (let i = 1; i < 4; i++) for (const dir of [0, 1]) {
            const u = -h + i * (2 * h / 4), a3 = [0, 0, 0], b3 = [0, 0, 0], o1 = (ax + 1 + dir) % 3, o2 = (ax + 2 - dir) % 3;
            a3[ax] = sg * h; b3[ax] = sg * h; a3[o1] = u; b3[o1] = u; a3[o2] = -h; b3[o2] = h;
            line(press, [R(a3), R(b3)], 2, { yellow: 0.5 * faces, 'pink.s': 0.3 * faces });
        }
        E.forEach(([i, j], n) => {
            const t0 = T.build[0] + n * step;
            if (t < t0) return;
            // its first drawing is a flash: thick and hot, then it settles
            const hot = t < t0 + 0.09;
            line(press, [V[i], V[j]], hot ? 12 : 6, hot ? DISC_HOT : AMBER);
        });
        // the cat's eyes, in the dark inside the box: they open
        const eo = IO(S(t, T.build[1], T.build[1] + 0.2));
        if (eo > 0) {
            const q = R([0, 110, 0]);
            for (const dx of [-34, 34]) {
                put(press, ellipse(q[0] + dx, q[1], 22, 16 * eo), { yellow: 1, blue: 0.7 });
                put(press, ellipse(q[0] + dx, q[1], 5, 14 * eo), BH);
                put(press, circle(q[0] + dx + 8, q[1] - 6 * eo, 3.5 * eo), { 'yellow.s': 0.1 });
            }
        }
    }

    // ── the ray: from the left edge to its front (a bright pulse), bending round the Sun ──────
    function rayPts(t, front) {
        const pts = [], R = holeR(t);
        let y = RY, vy = 0;
        for (let x = -40; x <= front; x += 8) {
            if (R > 0) {
                const dx = HC[0] - x, dy = HC[1] - y, r2 = dx * dx + dy * dy;
                // swallowed at the shadow's edge
                if (r2 < R * R * 2.6) break;
                vy += 0.06 * R * R * dy / Math.pow(r2 + 900, 1.5) * 8;
            }
            y += vy * 8;
            pts.push([x, y]);
        }
        return pts;
    }
    function ray(press, t, front) {
        const pts = rayPts(t, front);
        if (pts.length < 2) return pts;
        press.knockout((g) => { g.lineCap = 'round'; g.lineJoin = 'round'; g.lineWidth = 34; g.globalAlpha = 0.35; g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke(); g.globalAlpha = 1; });
        line(press, pts, 10, AMBER);
        const e = pts[pts.length - 1];
        press.knockout((g) => { g.fillStyle = Riso.radial(g, e[0], e[1], 2, 60, 0.9, 0); g.beginPath(); g.arc(e[0], e[1], 60, 0, 6.2832); g.fill(); });
        put(press, circle(e[0], e[1], 12), { yellow: 1, 'pink.s': 0.25 });
        return pts;
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
        Ph.cam(press, hc[0], hc[1], 0.6, () => { press.each((g) => g.rotate(lean * 0.6)); const wow = IO(S(t, 2.0, 2.4)) * (1 - IO(S(t, 3.2, 3.6)));
            su.einsteinBody(press, { headOnly: true, bold: true, look: [1, 0.05 - 0.25 * wow], brow: 4 + 8 * wow, hairWave: Math.sin(ph) * 4 }); });
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
            if (t < T.dive[1]) {
                const v = view(t);
                // the dive: the camera falls towards the hole, rolling, the hole drifting to the
                // middle of the frame and its shadow growing past the frame's edges
                const dv = IO(S(t, T.dive[0], T.dive[1])), Z = 1 + 11 * dv * dv, roll = 3.2 * Math.pow(dv, 1.4);
                const cc = [L(HC[0], 800, dv), L(HC[1], 450, dv)];
                // a beat in the chase: the camera pushes in on him as he looks at the light he is
                // keeping pace with, wide-eyed (the cat pounces at it), then pulls back out
                const pi = IO(S(t, 1.9, 2.6)) * (1 - IO(S(t, 3.1, 3.7))), PZ = 1 + 0.45 * pi, PC = [760, 330];
                press.save(); press.each((g) => { g.translate(PC[0], PC[1]); g.scale(PZ, PZ); g.translate(-PC[0], -PC[1]); });
                press.save(); press.each((g) => { g.translate(cc[0], cc[1]); g.rotate(roll); g.scale(Z, Z); g.translate(-HC[0], -HC[1]); });
                grid(press, t, v);
                holeBack(press, t);
                // the pulse runs ahead at the frame's right; it creeps further on through the chase
                // (they gain on the screen but never catch it)
                // (the pulse opens where Curie's scene left it, x 1250, never out of frame)
                const front = L(1250, 1180, IO(S(t, 0, T.enter[1]))) + 120 * IO(S(t, T.enter[1], T.hole[1]));
                // spaghettification: their group is stretched along the line to the hole, thinned
                // across it, and drawn in; the shadow, drawn over them, swallows them
                const pl = IO(S(t, T.pull[0], T.pull[1]));
                // (anchored at their end nearest the hole, which is drawn to its centre: the rest
                // trails behind, so nothing ever sticks out past the shadow)
                const N = [1040, 430], d = [HC[0] - N[0], HC[1] - N[1]], ang = Math.atan2(d[1], d[0]);
                const sr = 1 + 2 * pl, mv = pl, sk = 1 - 0.8 * pl;
                press.save(); press.each((g) => { g.translate(N[0] + d[0] * mv, N[1] + d[1] * mv); g.rotate(ang); g.scale(sr * sk, sk / Math.sqrt(sr)); g.rotate(-ang); g.translate(-N[0], -N[1]); });
                {
                    const pts = ray(press, t, front);
                    // the cat, chasing the pulse like a laser dot: galloping just below it, pouncing
                    const e = pts[pts.length - 1] ?? [front, RY];
                    // (the cat, then Einstein, run into the frame from the left after the cut)
                    const catX = L(-40, e[0] - 160, Ease.out(S(t, 0, 1.2)));
                    const pounce = Ease.bump(t, 2.9, 0.5);
                    Cat.run(press, { x: catX, y: RY + 200, s: 1.3, face: 1, ph: t * 3.2, pounce });
                    // Einstein, in frame from the first frame, gaining ground on the pulse
                    const ex = L(-520, e[0] - L(640, 520, IO(S(t, 1.6, 3.4))), Ease.out(S(t, 0.2, 1.7)));
                    runner(press, t, ex, 1010);
                }
                press.restore();
                holeFront(press, t);
                press.restore();
                press.restore();
            }
            // black: the shadow has filled the frame; the cube cuts in on it
            // (past the hole the night is the film's own: deep navy with its grain, not pure black)
            if (t >= T.build[0]) put(press, (g) => g.rect(0, 0, 1600, 900), DEEP);
            cube(press, t);
        },
    };
})();
