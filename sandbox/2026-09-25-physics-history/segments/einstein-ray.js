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
            press.knockout((g) => { Ph.poly(g, Ph.outline(P2, w)); g.globalAlpha = 0.55; g.fill(); g.globalAlpha = 1; });
            line(press, P2, w, { 'blue.s': 0.25, 'yellow.s': 0.12 }, { knock: false });
        }
    }
    // the cube's edges at the end: amber, clean, over the folded grid
    function cube(press, t) {
        const k = IO(S(t, T.fold[1] - 0.8, T.fold[1]));
        if (k <= 0) return;
        const c = [0, 0, 900], h = 350, a = 0.5 + 0.3 * IO(S(t, T.fold[0], T.end)), b = 0.35;
        const R = ([x, y, z]) => { const x1 = x * Math.cos(a) - z * Math.sin(a), z1 = x * Math.sin(a) + z * Math.cos(a); const y1 = y * Math.cos(b) - z1 * Math.sin(b), z2 = y * Math.sin(b) + z1 * Math.cos(b); return proj(c[0] + x1, c[1] + y1, c[2] + z2); };
        const V = [];
        for (const x of [-h, h]) for (const y of [-h, h]) for (const z of [-h, h]) V.push([x, y, z]);
        const E = [[0, 1], [0, 2], [0, 4], [1, 3], [1, 5], [2, 3], [2, 6], [3, 7], [4, 5], [4, 6], [5, 7], [6, 7]];
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
                vy += b * 900 * dy / Math.pow(r2 + 900, 1.5) * 8;
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
        if (sn.u <= 0 || t > T.fold[0] + 1.2) return;
        const p = proj(sn.p[0], sn.p[1], sn.p[2]), R = sn.R * p[2] * (1 - IO(S(t, T.fold[0], T.fold[0] + 1.2)));
        press.knockout((g) => { g.fillStyle = Riso.radial(g, p[0], p[1], R, R * 1.8, 0.7, 0); g.beginPath(); g.arc(p[0], p[1], R * 1.8, 0, 6.2832); g.fill(); });
        put(press, circle(p[0], p[1], R), { yellow: 1, 'pink.s': 0.35 });
        ink(press, circle(p[0], p[1], R), { 'pink.s': (g) => Riso.radial(g, p[0], p[1], R * 0.5, R, 0, 0.5) });
        const r = Motion.rng('sun-gran');
        for (let i = 0; i < 70; i++) { const a = r() * 6.28, rr = Math.sqrt(r()) * R * 0.9; put(press, circle(p[0] + Math.cos(a) * rr, p[1] + Math.sin(a) * rr, R * (0.02 + r() * 0.03)), { 'pink.s': 0.5 }, { knock: false }); }
        for (let i = 0; i < 9; i++) { const a = i * 0.7 + t * 0.1, q = [p[0] + Math.cos(a) * R, p[1] + Math.sin(a) * R]; line(press, [q, [q[0] + Math.cos(a + 0.3) * R * 0.14, q[1] + Math.sin(a + 0.3) * R * 0.14], [q[0] + Math.cos(a) * R * 0.06, q[1] + Math.sin(a) * R * 0.06]], taper(R * 0.03, 0.2, 0.6), { pink: 0.8, yellow: 1 }); }
    }

    // ── Einstein running (young, 1905: dark hair, moustache, a suit) ──────────────────────
    const U = 1.0;
    function runner(press, t, x0, ground) {
        const ph = t * 2.6 * 6.2832, su = P();
        const bob = -Math.abs(Math.sin(ph)) * 14;
        const hip = [x0, ground - 360 + bob], sh = [x0 + 40, ground - 610 + bob], head = [x0 + 78, ground - 700 + bob];
        const legAt = (k) => { const a = Math.sin(ph + k * Math.PI); return [hip[0] + a * 150, ground - Math.max(0, Math.cos(ph + k * Math.PI)) * 70]; };
        const armAt = (k) => { const a = Math.sin(ph + k * Math.PI + Math.PI); return [sh[0] + a * 120 + 20, sh[1] + 180 - Math.abs(a) * 40]; };
        const limb = (a, b, l1, l2, pole, w, spec, end) => {
            const [m] = Fig.ik(a, b, l1, l2, pole);
            line(press, [a, m, b], (u) => L(w, w * 0.75, u), spec);
            end?.(b, m);
        };
        const shoe = (p, m) => put(press, (g) => smooth(g, [[p[0] - 16, p[1] - 22], [p[0] + 40, p[1] - 18], [p[0] + 46, p[1]], [p[0] - 20, p[1]]]), { navy: 1, yellow: 1, 'pink.s': 0.5 });
        const hand = (p) => put(press, circle(p[0], p[1], 20), SKIN);
        // far limbs first
        limb([hip[0] - 10, hip[1]], legAt(1), 170, 170, [hip[0] + 200, hip[1] + 100], 58, su.SUIT_DK, shoe);
        limb([sh[0] - 14, sh[1] + 10], armAt(1), 150, 140, [sh[0] - 60, sh[1] + 200], 48, su.SUIT_DK, hand);
        // the body leaning into the run: jacket tails flying
        const lean = 0.25;
        press.save(); press.each((g) => { g.translate(hip[0], hip[1]); g.rotate(lean); g.translate(-hip[0], -hip[1]); });
        put(press, (g) => smooth(g, [[hip[0] - 60, hip[1] + 20], [hip[0] - 70, hip[1] - 120], [sh[0] - 70, sh[1] + 10], [sh[0] - 10, sh[1] - 30], [sh[0] + 60, sh[1] - 10], [sh[0] + 70, sh[1] + 120], [hip[0] + 60, hip[1] + 10]]), su.SUIT);
        put(press, (g) => poly(g, [[sh[0] + 20, sh[1] - 20], [sh[0] + 64, sh[1] - 6], [sh[0] + 50, sh[1] + 150], [sh[0] + 20, sh[1] + 60]]), Cast.LINEN);
        put(press, (g) => poly(g, [[sh[0] + 36, sh[1] - 16], [sh[0] + 50, sh[1] - 10], [sh[0] + 44, sh[1] + 100]]), { navy: 1, 'pink.s': 0.65 });
        const fl = Math.sin(ph * 0.5) * 20;
        put(press, (g) => smooth(g, [[hip[0] - 60, hip[1] + 10], [hip[0] - 150, hip[1] + 40 + fl], [hip[0] - 170, hip[1] + 90 + fl], [hip[0] - 40, hip[1] + 60]]), su.SUIT_DK);
        press.restore();
        // the head (from the approved Einstein drawing), leaning forward, eyes on the pulse
        Ph.cam(press, head[0], head[1], 0.72, () => { press.each((g) => g.rotate(0.12)); su.einsteinBody(press, { headOnly: true, look: [1, 0.1], brow: 6, hairWave: Math.sin(ph) * 6 }); });
        // near limbs
        limb(hip, legAt(0), 170, 170, [hip[0] + 200, hip[1] + 100], 62, su.SUIT, shoe);
        limb([sh[0] + 6, sh[1] + 10], armAt(0), 150, 140, [sh[0] - 60, sh[1] + 200], 52, su.SUIT, (p, m) => { put(press, (g) => { g.beginPath(); g.ellipse(p[0], p[1], 14, 20, 0, 0, 6.2832); }, Cast.LINEN); hand([p[0] + 8, p[1] + 10]); });
    }

    Seg.einsteinRay = {
        T,
        init() { return {}; },
        draw(press, tq) {
            const t = tq;
            put(press, (g) => g.rect(0, 0, 1600, 900), { blue: 0.9, 'navy.s': 0.92, 'pink.s': 0.2 });
            const fold = IO(S(t, T.fold[0], T.fold[1]));
            grid(press, t, fold);
            sun(press, t);
            // the pulse runs ahead at the frame's right third; they keep up with it (the camera
            // runs with them); at the end it stays on screen as the cube's edge takes over
            const front = t < T.enter[0] ? 1640 : L(1640, 1180, IO(S(t, T.enter[0], T.enter[1])));
            const show = 1 - S(t, T.fold[0], T.fold[0] + 0.8);
            if (show > 0) {
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
            cube(press, t);
        },
    };
})();
