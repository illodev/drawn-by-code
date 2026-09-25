// Segment «Schrödinger's box» of physics-history (script v2), after Einstein's black hole. The
// amber wireframe cube that cut in on the black stays a drawing: inside it, line by line, the
// 1935 thought experiment draws itself in, seen in cutaway (a speck of radioactive matter, a
// Geiger counter, a hammer on a trip arm over a flask of poison) and the green eyes become the
// film's cat. Unobserved, the cat is both: alive and dead on alternate drawings. The lid lifts
// and Schrödinger leans in from the right to look; then the frame splits into outcomes.
//
//   Seg.schrodingerBox.draw(press, tq, st)   local time 0–T.end (on twos)
//
// Join in: Einstein's end: the cube (h 330 at depth 900, yaw 0.55, pitch 0.38) in amber on black,
// its back faces' grid, the cat's eyes glowing inside.
var Seg = globalThis.Seg ?? (globalThis.Seg = {});
(() => {
    const { put, ink, line, smooth, poly, taper, circle, ellipse } = Ph;
    const L = Ease.lerp, S = Ease.seg, IO = Ease.inOut;
    const T = { cam: [0.2, 2.2], parts: [0.5, 1.7], cat: [0.9, 1.3], both: 1.5, lean: [2.2, 3.2], lid: [2.4, 3.1], end: 10 };

    const AMBER = { yellow: 1, 'pink.s': 0.55 };
    const AMBER_LT = { yellow: 0.6, 'pink.s': 0.3 };
    const BH = { navy: 1, blue: 1, yellow: 1, pink: 0.7 };
    const RADIUM = { blue: 0.5, yellow: 0.6 };
    const F = 900, h = 330;

    // the camera: from Einstein's framing it swings round a little and moves in, the box
    // drifting left to leave room for him on the right
    function cam(t) {
        const u = IO(S(t, T.cam[0], T.cam[1]));
        return { z: L(1, 1.12, u), dx: L(0, -220, u), dy: L(0, 90, u), yaw: L(0.55, 0.42, u), pitch: L(0.38, 0.32, u) };
    }
    function rot([x, y, z], c) {
        const x1 = x * Math.cos(c.yaw) - z * Math.sin(c.yaw), z1 = x * Math.sin(c.yaw) + z * Math.cos(c.yaw);
        return [x1, y * Math.cos(c.pitch) - z1 * Math.sin(c.pitch), y * Math.sin(c.pitch) + z1 * Math.cos(c.pitch)];
    }
    function P(q, c) { const [x, y, z] = rot(q, c), k = F / (1800 + z) * c.z; return [800 + x * k + c.dx, 450 + y * k + c.dy]; }
    const kAt = (q, c) => F / (1800 + rot(q, c)[2]) * c.z;
    const lerp3 = (a, b, u) => [L(a[0], b[0], u), L(a[1], b[1], u), L(a[2], b[2], u)];
    // a line drawn in over [t0, t0 + 0.25]: the first part of the polyline, growing
    function drawIn(press, pts3, t, t0, c, w, spec) {
        const u = S(t, t0, t0 + 0.25);
        if (u <= 0) return;
        const pts = pts3.map((q) => P(q, c)), n = pts.length - 1, m = u * n, i = Math.floor(m);
        const out = pts.slice(0, i + 1);
        if (i < n) { const a = pts[i], b = pts[i + 1], f = m - i; out.push([L(a[0], b[0], f), L(a[1], b[1], f)]); }
        if (out.length > 1) line(press, out, w * c.z, spec);
    }
    const ring3 = (cx, cy, cz, r, plane, n = 24) => Array.from({ length: n + 1 }, (_, i) => { const a = i / n * 6.2832, u = Math.cos(a) * r, v = Math.sin(a) * r; return plane === 'xz' ? [cx + u, cy, cz + v] : plane === 'xy' ? [cx + u, cy + v, cz] : [cx, cy + u, cz + v]; });
    function box3(c0, s) {
        const [x, y, z] = c0, [a, b, d] = s, V = [];
        for (const i of [-1, 1]) for (const j of [-1, 1]) for (const k of [-1, 1]) V.push([x + i * a, y + j * b, z + k * d]);
        return [[0, 1], [0, 2], [0, 4], [1, 3], [1, 5], [2, 3], [2, 6], [3, 7], [4, 5], [4, 6], [5, 7], [6, 7]].map(([i, j]) => [V[i], V[j]]);
    }

    // ── the apparatus, in the diagram's amber line: on the box's floor (y = h), right half
    // (drawn in its own units, then scaled 1.9× about its footprint so it fills the right half)
    const tr = (q) => [120 + (q[0] - 170) * 1.9, h + (q[1] - h) * 1.9, 40 + (q[2] - 40) * 1.9], TR = (pts) => pts.map(tr);
    function apparatus(press, t, c) {
        const t0 = T.parts[0], fl = h;
        // the Geiger counter: a case with a dial on its front, the tube standing on it
        box3([170, fl - 55, 120], [70, 55, 50]).forEach((e, i) => drawIn(press, TR(e), t, t0 + i * 0.02, c, 3, AMBER));
        drawIn(press, TR(ring3(150, fl - 60, 70, 24, 'xy')), t, t0 + 0.25, c, 2.4, AMBER);
        // its needle ticks with every decay
        const tick = Math.floor(t * 12) % 5 === 0 && t > T.both ? 0.9 : -0.6;
        drawIn(press, TR([[150, fl - 60, 70], [150 + Math.sin(tick) * 20, fl - 60 - Math.cos(tick) * 20, 70]]), t, t0 + 0.35, c, 2.6, { pink: 0.8, yellow: 1 });
        drawIn(press, TR([[170, fl - 110, 120], [170, fl - 230, 120]]), t, t0 + 0.3, c, 14, AMBER_LT);
        drawIn(press, TR([[170, fl - 110, 120], [170, fl - 230, 120]]), t, t0 + 0.3, c, 3, AMBER);
        // the speck of radioactive matter over the tube's mouth: a blue-green glow (Curie's)
        if (t > t0 + 0.5) {
            const q = P(tr([170, fl - 250, 120]), c), k = (kAt(tr([170, fl - 250, 120]), c) * 1.9), fl2 = 0.7 + 0.3 * Math.sin(t * 9);
            press.knockout((g) => { g.fillStyle = Riso.radial(g, q[0], q[1], 3, 40 * k, 0.8 * fl2, 0); g.beginPath(); g.arc(q[0], q[1], 40 * k, 0, 6.2832); g.fill(); });
            put(press, circle(q[0], q[1], 7 * k), RADIUM);
        }
        // the hammer: a trip arm pivoting on the case, its head poised over the flask
        const hit = 0; // (it falls in the outcomes, not here)
        const pv = [220, fl - 110, 40], hd = [220, fl - 150, -90 + hit];
        drawIn(press, TR([pv, hd]), t, t0 + 0.45, c, 4, AMBER);
        box3(hd, [18, 12, 16]).forEach((e) => drawIn(press, TR(e), t, t0 + 0.55, c, 3, AMBER));
        drawIn(press, TR(ring3(pv[0], pv[1], pv[2], 8, 'yz', 12)), t, t0 + 0.45, c, 2.4, AMBER);
        // the flask of poison: a round belly, a neck, the liquid's level
        const fx = 220, fz = -90;
        drawIn(press, TR(ring3(fx, fl - 40, fz, 40, 'xy')), t, t0 + 0.6, c, 3, AMBER);
        drawIn(press, TR([[fx - 10, fl - 78, fz], [fx - 10, fl - 110, fz], [fx + 10, fl - 110, fz], [fx + 10, fl - 78, fz]]), t, t0 + 0.7, c, 3, AMBER);
        if (t > t0 + 0.8) { const q = P(tr([fx, fl - 32, fz]), c), k = (kAt(tr([fx, fl - 32, fz]), c) * 1.9); put(press, ellipse(q[0], q[1] + 8 * k, 34 * k, 22 * k), { yellow: 0.7, blue: 0.5 }); }
        // a wire from the counter to the arm's catch
        drawIn(press, TR([[200, fl - 100, 120], [220, fl - 130, 100], [220, fl - 118, 40]]), t, t0 + 0.8, c, 2, AMBER_LT);
    }
    // the cube: its twelve edges, and a faint grid on the three faces turned away
    function cube(press, t, c, lidA) {
        const V = [];
        for (const x of [-h, h]) for (const y of [-h, h]) for (const z of [-h, h]) V.push([x, y, z]);
        // the lid: the top face (y = −h) lifted off like a hat and tipped back a little
        const lidP = (q) => { if (q[1] !== -h || lidA <= 0) return q; const dz = q[2] - h, a = 0.3 * lidA; return [q[0], -h - 170 * lidA + dz * Math.sin(a), h + dz * Math.cos(a)]; };
        const E = [[0, 1], [0, 2], [0, 4], [1, 3], [1, 5], [2, 3], [2, 6], [3, 7], [4, 5], [4, 6], [5, 7], [6, 7]];
        for (const [i, j] of E) { const lid = V[i][1] === -h && V[j][1] === -h; line(press, [P(lid ? lidP(V[i]) : V[i], c), P(lid ? lidP(V[j]) : V[j], c)], 6 * c.z, AMBER); }
        // the rim left on the box once the lid lifts
        if (lidA > 0) for (const [a, b] of [[[-h, -h, -h], [h, -h, -h]], [[-h, -h, -h], [-h, -h, h]], [[h, -h, -h], [h, -h, h]], [[-h, -h, h], [h, -h, h]]]) line(press, [P(a, c), P(b, c)], 6 * c.z, AMBER);
        // the face grids on the floor and the two back walls
        for (let i = 1; i < 4; i++) {
            const u = -h + i * h / 2;
            for (const [a, b] of [[[u, h, -h], [u, h, h]], [[-h, h, u], [h, h, u]], [[u, -h, h], [u, h, h]], [[-h, u, h], [h, u, h]], [[-h, u, -h], [-h, u, h]], [[-h, -h, u], [-h, h, u]]]) line(press, [P(a, c), P(b, c)], 2, { yellow: 0.45, 'pink.s': 0.25 });
        }
    }

    Seg.schrodingerBox = {
        T,
        init() { return {}; },
        draw(press, tq) {
            const t = tq, c = cam(t);
            put(press, (g) => g.rect(0, 0, 1600, 900), BH);
            const lidA = IO(S(t, T.lid[0], T.lid[1]));
            // Schrödinger, behind the box's right side, leaning in to look down into it (mirrored:
            // facing left); his torso runs off the frame's bottom edge
            const ln = IO(S(t, T.lean[0], T.lean[1]));
            if (ln > 0) {
                const top = P([h, -h, 0], c), sc = kAt([h, -h, 0], c) * 1.7;
                const hx = top[0] + L(600, 200, ln), hy = top[1] + L(120, -40, ln);
                Ph.cam(press, hx, hy, sc, () => {
                    press.each((g) => { g.scale(-1, 1); g.rotate(0.3 * ln); });
                    // the jacket goes on down past the frame's edge
                    const pp = Seg.schrodinger.parts;
                    put(press, (g) => g.rect(-128, 360, 290, 900), pp.SUIT);
                    put(press, (g) => g.rect(60, 360, 100, 900), pp.SUIT_LT);
                    pp.schrodinger(press, { look: [1, 0.9], noLegs: true });
                });
            }
            cube(press, t, c, lidA);
            apparatus(press, t, c);
            // the cat: its eyes, then all of it; from T.both, alive and dead on alternate drawings
            const cq = P([-170, h, 0], c), ck = kAt([-170, h, 0], c);
            const cu = S(t, T.cat[0], T.cat[1]);
            if (cu < 1) {
                const q = P([0, 110, 0], c);
                if (t < T.cat[0] + 0.1) for (const dx of [-34, 34]) { put(press, ellipse(q[0] + dx, q[1], 22, 16), { yellow: 1, blue: 0.7 }); put(press, ellipse(q[0] + dx, q[1], 5, 14), BH); }
            }
            if (t >= T.cat[0]) {
                const alive = t < T.both || Math.floor(t * 12) % 2 === 0;
                if (alive) Cat.sit(press, { x: cq[0], y: cq[1], s: ck * 2.9, face: 1, look: P(tr([170, h - 250, 120]), c), tail: t * 0.5 });
                else Cat.dead(press, { x: cq[0] + 10 * ck, y: cq[1], s: ck * 2.4, face: 1 });
            }
        },
    };
})();
