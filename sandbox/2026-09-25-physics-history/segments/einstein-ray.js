// Segment «Einstein chases the light» of physics-history (script v2), after Curie's ray. Young
// Einstein (the 1905 thought experiment: what would a light wave look like if you ran beside
// it?) runs flat out beside the ray, whose front is a bright pulse; the film's cat gallops
// ahead chasing the pulse like a laser dot. Around them the grid of spacetime streams past in
// perspective. A huge Sun rises ahead: the grid is pulled in towards it and the ray bends round
// it (gravitational lensing, the 1919 eclipse test). The camera draws back and up, the grid
// folds up into a cube, and the cube is what the next scene opens as Schrödinger's box.
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

    // ── the grid of spacetime: lines along x (depths z) and across (x), on planes above and
    // below the ray, streaming towards −x as they run; pulled towards the Sun when it is there
    const F = 900, CY = 450;
    const proj = (x, y, z) => { const k = F / (z + 900); return [800 + x * k, CY + y * k, k]; };
    function sunAt(t) { const u = IO(S(t, T.sun[0], T.sun[1])); return { u, p: [L(2400, 980, u), -120, 900], R: 420 }; }
    function warp(q, t) {
        const sn = sunAt(t), b = IO(S(t, T.bend[0], T.bend[1]));
        if (b <= 0) return q;
        const dx = sn.p[0] - q[0], dy = sn.p[1] - q[1], dz = sn.p[2] - q[2], r = Math.hypot(dx, dy, dz) || 1;
        const a = 260, d = b * 380 * a * a * r / Math.pow(r * r + a * a, 1.5);
        return [q[0] + dx / r * d, q[1] + dy / r * d, q[2] + dz / r * d];
    }
    function grid(press, t, fold) {
        const off = (t * 900) % 200;
        const lines = [];
        for (const y of [-520, 520]) {
            for (let z = -200; z <= 2200; z += 200) { const pts = []; for (let x = -2200; x <= 3200; x += 100) pts.push([x, y, z]); lines.push(pts); }
            for (let x = -2200 - off + 200; x <= 3200; x += 200) { const pts = []; for (let z = -200; z <= 2200; z += 100) pts.push([x, y, z]); lines.push(pts); }
        }
        // vertical lines at the far side, a curtain of the grid behind
        for (let x = -2200 - off + 200; x <= 3200; x += 200) { const pts = []; for (let y = -520; y <= 520; y += 80) pts.push([x, y, 2200]); lines.push(pts); }
        for (const pts of lines) {
            const Q = pts.map((q) => {
                let w = warp(q, t);
                // the fold: every point is drawn towards the cube's surface (a box 700 wide)
                if (fold > 0) {
                    const c = [0, 0, 900], h = 350, v = [w[0] - c[0], w[1] - c[1], w[2] - c[2]], m = Math.max(Math.abs(v[0]), Math.abs(v[1]), Math.abs(v[2])) || 1;
                    const onBox = [c[0] + v[0] / m * h, c[1] + v[1] / m * h, c[2] + v[2] / m * h];
                    w = [L(w[0], onBox[0], fold), L(w[1], onBox[1], fold), L(w[2], onBox[2], fold)];
                }
                return w;
            }).filter((q) => q[2] > -800).map((q) => proj(q[0], q[1], q[2]));
            if (Q.length < 2) continue;
            // pale lines: the paper knocked back through the night, tinted blue-green
            const P2 = Q.map(([x, y]) => [x, y]), w = Math.max(1.4, 3 * Math.min(1, Q[0][2] * 1.2));
            const al = 1 - S(fold, 0.55, 0.95);
            if (al <= 0) continue;
            press.knockout((g) => { Ph.poly(g, Ph.outline(P2, w)); g.globalAlpha = 0.55 * al; g.fill(); g.globalAlpha = 1; });
            line(press, P2, w, { 'blue.s': 0.25 * al, 'yellow.s': 0.12 * al }, { knock: false });
        }
    }
    // the cube's edges at the end: amber, clean, over the folded grid
    function cube(press, t) {
        const k = IO(S(t, T.fold[0] + 0.6, T.fold[1] - 0.3));
        if (k <= 0) return;
        const c = [0, 0, 900], h = 350, a = 0.5 + 0.3 * IO(S(t, T.fold[0], T.end)), b = 0.35;
        const R = ([x, y, z]) => { const x1 = x * Math.cos(a) - z * Math.sin(a), z1 = x * Math.sin(a) + z * Math.cos(a); const y1 = y * Math.cos(b) - z1 * Math.sin(b), z2 = y * Math.sin(b) + z1 * Math.cos(b); return proj(c[0] + x1, c[1] + y1, c[2] + z2); };
        const V = [];
        for (const x of [-h, h]) for (const y of [-h, h]) for (const z of [-h, h]) V.push([x, y, z]);
        const E = [[0, 1], [0, 2], [0, 4], [1, 3], [1, 5], [2, 3], [2, 6], [3, 7], [4, 5], [4, 6], [5, 7], [6, 7]];
        // a faint grid on the three back faces (what is left of spacetime's lattice), then the edges
        for (const [ax, sg] of [[0, 1], [1, 1], [2, 1]]) for (let i = 1; i < 4; i++) for (const dir of [0, 1]) {
            const u = -h + i * (2 * h / 4), a3 = [0, 0, 0], b3 = [0, 0, 0], o1 = (ax + 1 + dir) % 3, o2 = (ax + 2 - dir) % 3;
            a3[ax] = sg * h; b3[ax] = sg * h; a3[o1] = u; b3[o1] = u; a3[o2] = -h; b3[o2] = h;
            const p = R(a3), q = R(b3);
            press.knockout((g) => { Ph.poly(g, Ph.outline([[p[0], p[1]], [q[0], q[1]]], 2)); g.globalAlpha = 0.4 * k; g.fill(); g.globalAlpha = 1; });
        }
        for (const [i, j] of E) { const p = R(V[i]), q = R(V[j]); line(press, [[p[0], p[1]], [q[0], q[1]]], 6 * k, AMBER); }
    }

    // ── the ray: from the left edge to its front (a bright pulse), bending round the Sun ──────
    function rayPts(t, front) {
        const pts = [];
        const sn = sunAt(t), b = IO(S(t, T.bend[0], T.bend[1]));
        let y = RY, vy = 0;
        for (let x = -40; x <= front; x += 8) {
            if (b > 0) {
                const sp = proj(sn.p[0], sn.p[1], sn.p[2]), dx = sp[0] - x, dy = sp[1] - y, r2 = dx * dx + dy * dy;
                vy += b * 260 * dy / Math.pow(r2 + 900, 1.5) * 8;
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

    // ── the Sun: a disc with a limb, granules and prominences, pulling the grid ─────────────
    function sun(press, t) {
        const sn = sunAt(t);
        if (sn.u <= 0) return;
        const p = proj(sn.p[0], sn.p[1], sn.p[2]), R = sn.R * p[2];
        press.knockout((g) => { g.fillStyle = Riso.radial(g, p[0], p[1], R, R * 1.8, 0.7, 0); g.beginPath(); g.arc(p[0], p[1], R * 1.8, 0, 6.2832); g.fill(); });
        put(press, circle(p[0], p[1], R), { yellow: 1, 'pink.s': 0.35 });
        ink(press, circle(p[0], p[1], R), { 'pink.s': (g) => Riso.radial(g, p[0], p[1], R * 0.5, R, 0, 0.5) });
        const r = Motion.rng('sun-gran');
        for (let i = 0; i < 70; i++) { const a = r() * 6.28, rr = Math.sqrt(r()) * R * 0.9; put(press, circle(p[0] + Math.cos(a) * rr, p[1] + Math.sin(a) * rr, R * (0.02 + r() * 0.03)), { 'pink.s': 0.5 }, { knock: false }); }
        for (let i = 0; i < 9; i++) { const a = i * 0.7 + t * 0.1, q = [p[0] + Math.cos(a) * R, p[1] + Math.sin(a) * R]; line(press, [q, [q[0] + Math.cos(a + 0.3) * R * 0.14, q[1] + Math.sin(a + 0.3) * R * 0.14], [q[0] + Math.cos(a) * R * 0.06, q[1] + Math.sin(a) * R * 0.06]], taper(R * 0.03, 0.2, 0.6), { pink: 0.8, yellow: 1 }); }
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
            const fold = IO(S(t, T.fold[0], T.fold[1]));
            grid(press, t, fold);
            // the pulse runs ahead at the frame's right third; they keep up with it (the camera
            // runs with them); at the end it stays on screen as the cube's edge takes over
            const front = t < T.enter[0] ? 1640 : L(1640, 1180, IO(S(t, T.enter[0], T.enter[1])));
            // during the fold the camera draws back: the runners, the ray and the pulse shrink
            // towards the middle and end up inside the cube, still running
            const zb = L(1, 0.26, IO(S(t, T.fold[0], T.fold[1])));
            press.save(); press.each((g) => { g.translate(800, 450); g.scale(zb, zb); g.translate(-800, -450 - 60 * (1 - zb)); });
            sun(press, t);
            {
                const pts = ray(press, t, front);
                // the cat, chasing the pulse like a laser dot: galloping just below it, pouncing
                const e = pts[pts.length - 1] ?? [front, RY];
                const catX = L(-300, e[0] - 170, IO(S(t, 0.4, 1.6)));
                const pounce = Ease.bump(t, 2.9, 0.5) + Ease.bump(t, 4.6, 0.5);
                Cat.run(press, { x: catX, y: RY + 200, s: 1.3, face: 1, ph: t * 3.2, pounce });
                // Einstein, running below the ray, a stride behind the cat
                const ex = L(-500, e[0] - 620, IO(S(t, T.enter[0], T.enter[1] + 0.4)));
                runner(press, t, ex, 1010);
            }
            press.restore();
            cube(press, t);
        },
    };
})();
