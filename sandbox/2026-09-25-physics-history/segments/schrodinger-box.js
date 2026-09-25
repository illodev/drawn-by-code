// Segment «Schrödinger's box» of physics-history (script v2), after Einstein's black hole. The
// amber wireframe cube that cut in on the black closes into an opaque box with the cat inside.
// The Geiger counter clicks, the radioactivity lights the inside, and a scan line turns the
// frame into a radiograph: through the box, the 1935 apparatus and the cat's skeleton. Unseen,
// reality splits: 2, 4, 8, 16 radiographs, alive in some, dead in others. Then Schrödinger
// lifts the lid and every world collapses into one: the cat peeks out, winks at us, ducks
// back in and the lid slams shut. A meow, one click of the counter inside: the question is
// open again. Fade to black.
//
//   Seg.schrodingerBox.draw(press, tq, st)   local time 0–T.end (on twos)
//
// Join in: Einstein's end: the cube (h 330 at depth 900, yaw 0.55, pitch 0.38) in amber on black,
// its back faces' grid, the cat's eyes glowing inside.
var Seg = globalThis.Seg ?? (globalThis.Seg = {});
(() => {
    const { put, ink, line, smooth, poly, taper, circle, ellipse } = Ph;
    const L = Ease.lerp, S = Ease.seg, IO = Ease.inOut;
    const T = { close: [0.3, 0.9], click: 1.2, scan: [1.4, 2.2], split: [2.8, 3.5, 4.1], lean: [5.2, 6.1], lid: [6.0, 6.5], collapse: [6.6, 7.1], flash: 6.95, peek: [7.35, 7.9], wink: [8.3, 8.5], duck: [8.56, 8.68], slam: [8.6, 8.75], click2: 9.8, fade: [10.2, 10.8], end: 10.8 };

    const AMBER = { yellow: 1, 'pink.s': 0.55 };
    const AMBER_LT = { yellow: 0.6, 'pink.s': 0.3 };
    const BH = { navy: 1, blue: 1, yellow: 1, pink: 0.7 };
    const DEEP = { navy: 1, blue: 0.75, 'pink.s': 0.35, 'yellow.s': 0.1 };
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

    // ── the radiograph of the box: pale walls, the apparatus in white, the cat's skeleton;
    // o.dead: the hammer down, the flask broken, the cat on its back
    const XR_BG = { navy: 1, blue: 0.85 };
    // the lid's corners lifted off the box by u (0..1): up and tipped back on its far edge
    const lidQuad = (u) => [[-h, -h, -h], [h, -h, -h], [h, -h, h], [-h, -h, h]].map(([x, , z]) => { const dz = z - h, a = 0.3 * u; return [x, -h - 170 * u + dz * Math.sin(a), h + dz * Math.cos(a)]; });
    const kline = (press, pts, w, a) => press.knockout((g) => { poly(g, Ph.outline(pts, w)); g.globalAlpha = a; g.fill(); g.globalAlpha = 1; });
    function radiograph(press, t, c, o) {
        const V = [];
        for (const x of [-h, h]) for (const y of [-h, h]) for (const z of [-h, h]) V.push(P([x, y, z], c));
        const E = [[0, 1], [0, 2], [0, 4], [1, 3], [1, 5], [2, 3], [2, 6], [3, 7], [4, 5], [4, 6], [5, 7], [6, 7]];
        // the walls: a faint glow inside the box's outline, its edges pale
        press.knockout((g) => { poly(g, [V[0], V[1], V[3], V[7], V[6], V[4]]); g.globalAlpha = 0.07; g.fill(); g.globalAlpha = 1; });
        for (const [i, j] of E) kline(press, [V[i], V[j]], 4 * c.z, 0.4);
        // the lid, lifted off and tipped back (o.lid 0..1)
        if (o.lid > 0) { const Q = lidQuad(o.lid).map((q) => P(q, c)); press.knockout((g) => { poly(g, Q); g.globalAlpha = 0.12; g.fill(); g.globalAlpha = 1; }); for (let i = 0; i < 4; i++) kline(press, [Q[i], Q[(i + 1) % 4]], 5 * c.z, 0.7); }
        // the apparatus, in the same place as the diagram's, as white shadows
        const A = (q) => P(tr(q), c), k = kAt(tr([170, h, 120]), c) * 1.9, fl = h;
        const cs = [[100, fl - 110, 120], [240, fl - 110, 120], [240, fl, 120], [100, fl, 120]].map(A);
        press.knockout((g) => { poly(g, cs); g.globalAlpha = 0.3; g.fill(); g.globalAlpha = 1; });
        kline(press, [A([170, fl - 110, 120]), A([170, fl - 230, 120])], 12 * k, 0.55);
        const sp = A([170, fl - 250, 120]);
        press.knockout((g) => { g.fillStyle = Riso.radial(g, sp[0], sp[1], 2, 60 * k, 0.95, 0); g.beginPath(); g.arc(sp[0], sp[1], 60 * k, 0, 6.2832); g.fill(); });
        const pv = A([220, fl - 110, 40]), hd = A(o.dead ? [220, fl - 80, -90] : [220, fl - 150, -90]);
        kline(press, [pv, hd], 5 * k, 0.8);
        press.knockout((g) => { g.beginPath(); g.ellipse(hd[0], hd[1], 16 * k, 11 * k, 0, 0, 6.2832); g.globalAlpha = 0.9; g.fill(); g.globalAlpha = 1; });
        const fq = A([220, fl - 40, -90]);
        if (o.dead) { for (let i = 0; i < 6; i++) { const a = i * 1.1, r = 30 * k; kline(press, [[fq[0] + Math.cos(a) * r * 0.4, fq[1] + 30 * k], [fq[0] + Math.cos(a) * r * 1.3, fq[1] + 30 * k + Math.sin(a) * 6 * k]], 3 * k, 0.6); } }
        else { press.knockout((g) => { g.beginPath(); g.arc(fq[0], fq[1], 38 * k, 0, 6.2832); g.globalAlpha = 0.35; g.fill(); g.globalAlpha = 1; }); kline(press, [[fq[0], fq[1] - 36 * k], [fq[0], fq[1] - 70 * k]], 18 * k, 0.35); }
        // the cat
        const cq = P([-110, h, 0], c), ck = kAt([-110, h, 0], c);
        // every world its own cat: alive, it sits looking at the speck or up at the lid, sleeps
        // curled, or leaps at the speck; dead, it lies one way or the other
        const v = o.v ?? 0, spk = P(tr([170, h - 250, 120]), c);
        if (o.alive) {
            if (v < 0.25) Cat.sit(press, { x: cq[0], y: cq[1], s: ck * 2.9, face: 1, look: spk, tail: t * 0.8, blink: Math.abs((t % 1.7) - 0.8) < 0.06 });
            else if (v < 0.5) Cat.sit(press, { x: cq[0] + 60 * ck, y: cq[1], s: ck * 2.9, face: -1, look: [cq[0], cq[1] - 900 * ck], tail: t * 0.8 + 0.4 });
            else if (v < 0.75) Cat.curl(press, { x: cq[0] + 40 * ck, y: cq[1], s: ck * 1.7, face: 1, t });
            else Cat.run(press, { x: cq[0] + 40 * ck, y: cq[1] - 60 * ck, s: ck * 2.2, face: 1, ph: 0.3, pounce: 1 });
        } else if (o.dead) Cat.xray(press, { x: cq[0] + (v < 0.5 ? 0 : 60) * ck, y: cq[1], s: ck * 2.4, face: v < 0.5 ? 1 : -1, pose: v > 0.75 ? 'sit' : 'dead' });
        else Cat.xray(press, { x: cq[0], y: cq[1], s: ck * 2.9, face: 1, pose: 'sit' });
        ink(press, (g) => g.rect(-5000, -5000, 10000, 10000), { 'blue.s': 0.25 });
    }
    // the opaque box: dark panels, amber edges, the eyes inside while it is still open
    function solid(press, t, c) {
        const V = [];
        for (const x of [-h, h]) for (const y of [-h, h]) for (const z of [-h, h]) V.push([x, y, z]);
        const faces = [[0, 1, 3, 2], [4, 5, 7, 6], [0, 1, 5, 4], [2, 3, 7, 6], [0, 2, 6, 4], [1, 3, 7, 5]];
        const cl = S(t, T.close[0], T.close[1]);
        // the faces close one by one, on their own drawings; a panel turned to us is lighter
        if (cl < 1) for (let i = 1; i < 4; i++) {
            const u = -h + i * h / 2, gk = 1 - cl;
            for (const [a, b] of [[[u, h, -h], [u, h, h]], [[-h, h, u], [h, h, u]], [[u, -h, h], [u, h, h]], [[-h, u, h], [h, u, h]], [[-h, u, -h], [-h, u, h]], [[-h, -h, u], [-h, h, u]]]) line(press, [P(a, c), P(b, c)], 2, { yellow: 0.45 * gk, 'pink.s': 0.25 * gk });
        }
        let nf = 0; const visF = [];
        faces.forEach((f) => {
            const n = [0, 1, 2].map((a) => (V[f[0]][a] === V[f[1]][a] && V[f[1]][a] === V[f[2]][a]) ? Math.sign(V[f[0]][a]) : 0), nr = rot(n, c);
            const ctr = rot(f.reduce((m, j) => [m[0] + V[j][0] / 4, m[1] + V[j][1] / 4, m[2] + V[j][2] / 4], [0, 0, 0]), c);
            if (nr[0] * -ctr[0] + nr[1] * -ctr[1] + nr[2] * (-1800 - ctr[2]) <= 0) return;
            visF.push(f);
            if (cl < ++nf / 3) return;
            const Q = f.map((j) => P(V[j], c));
            // the top catches the most light, the side turned right the least
            const dk = nr[1] < -0.3 ? 0.5 : nr[0] > 0.2 ? 0.95 : 0.75;
            put(press, (g) => poly(g, Q), { 'navy.s': dk, 'blue.s': 0.55, 'pink.s': 0.2 });
            panel(press, f.map((j) => V[j]), c);
        });
        const E = [[0, 1], [0, 2], [0, 4], [1, 3], [1, 5], [2, 3], [2, 6], [3, 7], [4, 5], [4, 6], [5, 7], [6, 7]];
        // at the click, light leaks out along every seam
        const leak = Ease.bump(t, T.click, 0.35) + S(t, T.click + 0.2, T.scan[0]);
        // once it is shut, only the edges of the faces turned to us (the rest are behind them)
        const onVis = ([i, j]) => cl < 1 || visF.some((f) => f.includes(i) && f.includes(j));
        for (const e of E) if (onVis(e)) line(press, [P(V[e[0]], c), P(V[e[1]], c)], 6 * c.z, AMBER);
        if (leak > 0) for (const [i, j] of E.filter(onVis)) { const a = P(V[i], c), b = P(V[j], c); kline(press, [a, b], (6 + 14 * leak) * c.z, 0.5 * Math.min(1, leak)); }
        if (cl < 0.5) { const q = P([0, 110, 0], c); for (const dx of [-34, 34]) { put(press, ellipse(q[0] + dx, q[1], 22, 16), { yellow: 1, blue: 0.7 }); put(press, ellipse(q[0] + dx, q[1], 5, 14), BH); } }
    }
    // a wall's face detail: an inset frame line and a rivet in each corner
    function panel(press, q4, c) {
        const cq = q4.reduce((m, q) => [m[0] + q[0] / 4, m[1] + q[1] / 4, m[2] + q[2] / 4], [0, 0, 0]);
        const ins = q4.map((q) => lerp3(q, cq, 0.12)), Q = ins.map((q) => P(q, c));
        line(press, [...Q, Q[0]], 5 * c.z, { navy: 1, 'blue.s': 0.3 }, { knock: false });
        line(press, [Q[3], Q[0], Q[1]].map(([x, y]) => [x + 3, y + 3]), 2.4 * c.z, { 'blue.s': 0.4, 'yellow.s': 0.15 }, { knock: false });
        for (const q of q4.map((q) => lerp3(q, cq, 0.06))) { const p = P(q, c); put(press, circle(p[0], p[1], 7 * c.z), { yellow: 0.8, 'pink.s': 0.5, 'navy.s': 0.3 }); press.knockout(circle(p[0] - 1.5, p[1] - 1.5, 1.6 * c.z)); }
    }
    // the one world left: the box, shut but for its lifted lid, blue-green light from inside,
    // the cat peeking over the front rim and looking at us
    function opened(press, t, c0) {
        // the slam jolts the box
        const jolt = Ease.bump(t, T.slam[1], 0.2), c = { ...c0, dy: c0.dy + 10 * jolt * Math.cos((t - T.slam[1]) * 60) };
        const V = [];
        for (const x of [-h, h]) for (const y of [-h, h]) for (const z of [-h, h]) V.push([x, y, z]);
        const Pv = (i) => P(V[i], c);
        // the lid: up in the air, then dropping back on (accelerating) once the cat has ducked
        const lu = 1 - Math.pow(S(t, T.slam[0], T.slam[1]), 2);
        const Q = lidQuad(lu).map((q) => P(q, c));
        const drawLid = () => { put(press, (g) => poly(g, Q), { 'navy.s': 0.5, 'blue.s': 0.55, 'pink.s': 0.2 }); for (let i = 0; i < 4; i++) line(press, [Q[i], Q[(i + 1) % 4]], 6 * c.z, AMBER); };
        const shut = lu <= 0;
        // the opening: dark, lit from below
        const top = [0, 1, 5, 4].map(Pv);
        if (!shut) {
            put(press, (g) => poly(g, top), { navy: 1, blue: 0.6 });
            const oc = P([0, -h, 0], c);
            press.knockout((g) => { g.fillStyle = Riso.radial(g, oc[0], oc[1], 20, 380, 0.6, 0); poly(g, top); g.fill(); });
            ink(press, (g) => poly(g, top), { 'blue.s': 0.35, 'yellow.s': 0.3 });
        }
        // the rim's far edges, behind the cat
        for (const [i, j] of [[1, 5], [4, 5]]) line(press, [Pv(i), Pv(j)], 6 * c.z, AMBER);
        // the lid, up in the air (behind the cat's head) until it comes down
        if (lu > 0.5) drawLid();
        // the cat, rising behind the front rim, winking, then ducking back in
        const up = (Ease.back ? Ease.back(S(t, T.peek[0], T.peek[1])) : IO(S(t, T.peek[0], T.peek[1]))) * (1 - IO(S(t, T.duck[0], T.duck[1])));
        const rim = P([-60, -h, -h], c), k = kAt([-60, -h, -h], c);
        const wink = t > T.wink[0] && t < T.wink[1];
        if (up > 0.02) Cat.peek(press, { x: rim[0], y: rim[1] + 4 * k, s: k * 3.1, up, wink, look: t < T.peek[1] + 0.3 ? [0.8, 0.4] : [0, 0] });
        // the two walls turned to us, over its body, and the edges
        const walls = [[0, 1, 3, 2], [0, 2, 6, 4]];
        for (const f of walls) { const dk = f[1] === 1 ? 0.75 : 0.95; put(press, (g) => poly(g, f.map(Pv)), { 'navy.s': dk, 'blue.s': 0.55, 'pink.s': 0.2 }); panel(press, f.map((i) => V[i]), c); }
        // the near edges, then the paws on the rim over them
        for (const [i, j] of [[0, 1], [0, 2], [0, 4], [1, 3], [2, 3], [2, 6], [4, 6]]) line(press, [Pv(i), Pv(j)], 6 * c.z, AMBER);
        if (up > 0.4) Cat.peek(press, { x: rim[0], y: rim[1] + 4 * k, s: k * 3.1, up, pawsOnly: true });
        // the lid coming down over the opening, then shut: the top face
        if (lu <= 0.5) { drawLid(); if (shut) panel(press, [0, 1, 5, 4].map((i) => V[i]), c); }
        // the counter clicks once inside: light leaks along the lid's seam
        const lk = Ease.bump(t, T.click2, 0.3);
        if (shut && lk > 0) for (let i = 0; i < 4; i++) kline(press, [Q[i], Q[(i + 1) % 4]], (6 + 26 * lk) * c.z, 0.9 * lk);
    }
    // Schrödinger, leaning in from the right to look (mirrored: facing left), his jacket running
    // off the frame's bottom
    function erwin(press, t, c) {
        const ln = IO(S(t, T.lean[0], T.lean[1]));
        if (ln <= 0) return;
        const top = P([h, -h, 0], c), sc = kAt([h, -h, 0], c) * 1.7;
        const hx = top[0] + L(820, 330, ln), hy = top[1] + L(160, 10, ln);
        Ph.cam(press, hx, hy, sc, () => {
            press.each((g) => { g.scale(-1, 1); g.rotate(0.3 * ln - 0.16 * IO(S(t, T.peek[1] + 0.2, T.peek[1] + 0.5)) - 0.14 * Ease.bump(t, T.slam[1], 0.45)); g.translate(0, -30 * Ease.bump(t, T.slam[1], 0.3)); });
            const pp = Seg.schrodinger.parts;
            put(press, (g) => g.rect(-128, 360, 290, 900), pp.SUIT);
            put(press, (g) => g.rect(60, 360, 100, 900), pp.SUIT_LT);
            pp.schrodinger(press, { look: t > T.peek[0] + 0.2 ? [1, 0.5] : [1, 0.9], noLegs: true });
        });
    }
    // the worlds: how the frame is cut at each split, and which worlds hold a dead cat
    const GRID = [[1, 1], [2, 1], [2, 2], [4, 2], [4, 4]];
    const hash01 = (k) => { const x = Math.sin(k * 78.233 + 1.7) * 43758.5453; return x - Math.floor(x); };
    const deadIn = (n, i) => { const x = Math.sin((n * 7 + i) * 12.9898) * 43758.5453; return x - Math.floor(x) < 0.5; };
    Seg.schrodingerBox = {
        T,
        init() { return {}; },
        draw(press, tq) {
            const t = tq, c = { z: 1, dx: 0, dy: 0, yaw: 0.55, pitch: 0.38 };
            put(press, (g) => g.rect(0, 0, 1600, 900), DEEP);
            if (t < T.scan[1]) solid(press, t, c);
            if (t < T.scan[0]) return;
            // the collapse done: one world, seen plainly
            if (t >= T.flash) {
                opened(press, t, c);
                erwin(press, t, c);
                const fo = IO(S(t, T.fade[0], T.fade[1]));
                if (fo > 0) ink(press, (g) => g.rect(0, 0, 1600, 900), { navy: fo, blue: fo, yellow: fo, pink: 0.7 * fo });
                // (the flash is one drawing of bare paper, warmed with yellow: a hard white, never a
                // grey half-fade over the dark)
                if (t < T.flash + 0.05) { press.knockout((g) => g.fillRect(0, 0, 1600, 900)); ink(press, (g) => g.rect(0, 0, 1600, 900), { 'yellow.s': 0.18 }); }
                return;
            }
            // the scan: a bright line sweeping down; above it, the radiograph
            const sc = S(t, T.scan[0], T.scan[1]), sy = L(-20, 920, IO(sc));
            // (the scan reveals reality already split in two: then 4, 8, 16)
            const lvl = 1 + T.split.filter((x) => t >= x).length, [gx, gy] = GRID[lvl], W = 1600 / gx, H = 900 / gy;
            const lid = IO(S(t, T.lid[0], T.lid[1])), cu = IO(S(t, T.collapse[0], T.collapse[1]));
            // the world that remains: an alive one near the middle
            const cellR = (n) => { const i = n % gx, j = Math.floor(n / gx), pad = lvl ? 6 : 0; return [i * W + pad, j * H + pad, W - 2 * pad, H - 2 * pad]; };
            const cell = (n, r) => {
                press.save();
                const [x0, y0, cw, chh] = r;
                if (lvl) press.clip((g) => g.rect(x0, y0, cw, chh));
                const zs = lvl ? Math.min(cw / 1000, chh / 760) : 1;
                press.each((g) => { g.translate(x0 + cw / 2, y0 + chh / 2); g.scale(zs, zs); g.translate(-800, -450); });
                // (once reality splits, the worlds where it lives are in colour: a warm ground and
                // the cat itself; where it died, the cold X-ray and its skeleton)
                const dead = lvl > 0 && (lvl === 1 ? n === 1 : deadIn(lvl, n)), alive = lvl > 0 && !dead;
                put(press, (g) => g.rect(-4000, -4000, 9600, 8900), alive ? { pink: 0.9, 'navy.s': 0.6, 'yellow.s': 0.3 } : XR_BG);
                radiograph(press, t, c, { dead, alive, lid, v: ((n * 3 + lvl) % 4) / 4 + 0.05 });
                press.restore();
            };
            press.save();
            if (sc < 1) press.clip((g) => g.rect(0, 0, 1600, sy));
            // the collapse: every world, the living and the dead alike, shrinks into the middle at
            // once, so which one is real stays unknown until the flash
            for (let n = 0; n < gx * gy; n++) {
                const r = cellR(n);
                if (cu > 0) {
                    const cx = L(r[0] + r[2] / 2, 800, cu), cy = L(r[1] + r[3] / 2, 450, cu), f = 1 - cu;
                    if (f < 0.02) continue;
                    cell(n, [cx - r[2] * f / 2, cy - r[3] * f / 2, r[2] * f, r[3] * f]);
                } else cell(n, r);
            }
            press.restore();
            if (sc < 1) { kline(press, [[0, sy], [1600, sy]], 10, 0.9); press.knockout((g) => { g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(0, sy - 40, 1600, 40); }); }
            erwin(press, t, c);
            // the flash as the worlds collapse
            if (t >= T.flash - 0.05) { press.knockout((g) => g.fillRect(0, 0, 1600, 900)); ink(press, (g) => g.rect(0, 0, 1600, 900), { 'yellow.s': 0.18 }); }
        },
    };
})();
