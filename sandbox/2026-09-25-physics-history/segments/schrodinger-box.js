// Segment «Schrödinger's box» of physics-history (script v2), after Einstein's black hole. The
// amber wireframe cube that cut in on the black turns, plank by plank, into a wooden crate;
// the lid swings open on its back hinge, warm light spills out, and Schrödinger rises inside
// it, the film's cat hopping onto the rim beside him. Then the frame splits into outcomes.
//
//   Seg.schrodingerBox.draw(press, tq, st)   local time 0–T.end (on twos)
//
// Join in: Einstein's end: the cube (h 330 at depth 900, yaw 0.55, pitch 0.38) in amber on black,
// its faces' grid, the cat's eyes glowing inside.
var Seg = globalThis.Seg ?? (globalThis.Seg = {});
(() => {
    const { put, ink, line, smooth, poly, taper, circle, ellipse } = Ph;
    const L = Ease.lerp, S = Ease.seg, IO = Ease.inOut;
    const T = { planks: [0.15, 1.15], zoom: [0.6, 2.0], lid: [1.3, 2.0], rise: [1.7, 2.5], cat: [2.1, 2.6], end: 10 };

    const AMBER = { yellow: 1, 'pink.s': 0.55 };
    const BH = { navy: 1, blue: 1, yellow: 1, pink: 0.7 };
    // pine crate: faces lit from the lid's glow and the top-left
    const WOOD = { 'yellow.s': 0.55, 'pink.s': 0.24, 'navy.s': 0.04 };
    const WOOD2 = { 'yellow.s': 0.6, 'pink.s': 0.3, 'navy.s': 0.07 };
    const WOOD_DK = { 'yellow.s': 0.9, 'pink.s': 0.7, 'navy.s': 0.75 };
    const SEAM = { navy: 0.75, pink: 0.6, yellow: 0.8 };
    const GRAIN = { pink: 0.45, yellow: 0.7, navy: 0.2 };
    const BATTEN = { 'yellow.s': 0.85, 'pink.s': 0.55, 'navy.s': 0.32 };
    const BATTEN_LT = { yellow: 0.75, pink: 0.25 };
    const INSIDE = { navy: 1, yellow: 0.8, 'pink.s': 0.7 };
    const F = 900, h = 330, YAW = 0.55, PITCH = 0.38;

    // the camera: from Einstein's framing in to the crate, its rim lowered so the figure fits
    function cam(t) { const u = IO(S(t, T.zoom[0], T.zoom[1])); return { z: L(1, 1.2, u), dy: L(0, 120, u) }; }
    // box coords (±h, y down, z deep) → rotated → screen
    function rot([x, y, z]) {
        const x1 = x * Math.cos(YAW) - z * Math.sin(YAW), z1 = x * Math.sin(YAW) + z * Math.cos(YAW);
        return [x1, y * Math.cos(PITCH) - z1 * Math.sin(PITCH), y * Math.sin(PITCH) + z1 * Math.cos(PITCH)];
    }
    function P(q, c) { const [x, y, z] = rot(q), k = F / (900 + z + 900); return [800 + x * k * c.z, 450 + y * k * c.z + c.dy]; }
    const kAt = (q, c) => F / (1800 + rot(q)[2]) * c.z;
    // a face: its corners, its outward normal; visible if it faces the camera (at z = −1800)
    const FACES = {
        top: { n: [0, -1, 0], q: [[-h, -h, -h], [h, -h, -h], [h, -h, h], [-h, -h, h]] },
        bottom: { n: [0, 1, 0], q: [[-h, h, -h], [h, h, -h], [h, h, h], [-h, h, h]] },
        left: { n: [-1, 0, 0], q: [[-h, -h, -h], [-h, -h, h], [-h, h, h], [-h, h, -h]] },
        right: { n: [1, 0, 0], q: [[h, -h, -h], [h, -h, h], [h, h, h], [h, h, -h]] },
        front: { n: [0, 0, -1], q: [[-h, -h, -h], [h, -h, -h], [h, h, -h], [-h, h, -h]] },
        back: { n: [0, 0, 1], q: [[-h, -h, h], [h, -h, h], [h, h, h], [-h, h, h]] },
    };
    function facing(f) {
        const n = rot(f.n), cq = f.q.reduce((a, q) => [a[0] + q[0] / 4, a[1] + q[1] / 4, a[2] + q[2] / 4], [0, 0, 0]), c = rot(cq);
        return n[0] * (0 - c[0]) + n[1] * (0 - c[1]) + n[2] * (-1800 - c[2]) > 0;
    }
    const lerp3 = (a, b, u) => [L(a[0], b[0], u), L(a[1], b[1], u), L(a[2], b[2], u)];
    // a wooden wall: four planks along its first edge, each snapping in on its own drawing;
    // grain, seams, a darker plank now and then; the shade by the face's turn from the light
    function wall(press, name, f, t, c, shade, n0) {
        for (let i = 0; i < 4; i++) {
            const tI = T.planks[0] + (n0 + i) * 0.03;
            if (t < tI) continue;
            const a0 = lerp3(f.q[0], f.q[3], i / 4), a1 = lerp3(f.q[1], f.q[2], i / 4), b1 = lerp3(f.q[1], f.q[2], (i + 1) / 4), b0 = lerp3(f.q[0], f.q[3], (i + 1) / 4);
            const Q = [a0, a1, b1, b0].map((q) => P(q, c));
            put(press, (g) => poly(g, Q), (i % 2) ? WOOD2 : WOOD);
            if (shade > 0) ink(press, (g) => poly(g, Q), { 'navy.s': 0.7 * shade, 'pink.s': 0.2 * shade });
            // grain: long wavy lines along the plank, a knot on some
            const r = Motion.rng('grain-' + name + i);
            for (let j = 0; j < 4; j++) {
                const v = 0.2 + j * 0.2 + (r() - 0.5) * 0.08, pts = [];
                for (let u = 0; u <= 1.001; u += 0.1) { const A = lerp3(a0, b0, v + Math.sin(u * 7 + j * 2 + r() * 0.3) * 0.04), B = lerp3(a1, b1, v); pts.push(P(lerp3(A, B, u), c)); }
                line(press, pts, taper(2.8 * c.z, 0.2, 0.3), GRAIN, { knock: false });
            }
            if (r() < 0.5) { const K = P(lerp3(lerp3(a0, b0, 0.5), lerp3(a1, b1, 0.5), 0.3 + r() * 0.4), c), kk = kAt(f.q[0], c); put(press, ellipse(K[0], K[1], 9 * kk, 5 * kk), WOOD_DK, { knock: false }); }
            line(press, [Q[3], Q[2]], 2.4 * c.z, SEAM, { knock: false });
            // two nails where the plank meets the battens
            for (const u of [0.06, 0.94]) { const N = P(lerp3(lerp3(a0, b0, 0.5), lerp3(a1, b1, 0.5), u), c); put(press, circle(N[0], N[1], 2.6 * c.z), { navy: 1, 'yellow.s': 0.4 }, { knock: false }); }
        }
    }
    // the corner battens: the amber edges turning into darker wood, thick
    function edges(press, t, c, which) {
        const k = IO(S(t, T.planks[0] + 0.5, T.planks[1]));
        const V = [];
        for (const x of [-h, h]) for (const y of [-h, h]) for (const z of [-h, h]) V.push([x, y, z]);
        const E = [[1, 3], [3, 7], [7, 5], [5, 1], [0, 1], [2, 3], [6, 7], [4, 5], [0, 2], [2, 6], [6, 4], [4, 0]];
        for (const [i, j] of E) {
            const a = V[i], b = V[j], mid = lerp3(a, b, 0.5);
            // edges on a visible face are drawn in front; the rest behind
            const front = rot(mid)[2] < 60;
            if ((which === 'front') !== front) continue;
            const A = P(a, c), B = P(b, c);
            if (k < 1) line(press, [A, B], 6 * c.z * (1 - k) + 1, AMBER);
            if (k > 0) {
                line(press, [A, B], (6 + 20 * k) * c.z, BATTEN);
                line(press, [A, B], (2 + 5 * k) * c.z, BATTEN_LT, { knock: false });
            }
        }
    }
    Seg.schrodingerBox = {
        T,
        init() { return {}; },
        draw(press, tq) {
            const t = tq, c = cam(t);
            put(press, (g) => g.rect(0, 0, 1600, 900), BH);
            // a pool of warm light on the black under the crate once the lid is open
            const glow = IO(S(t, T.lid[0], T.lid[1] + 0.3));
            // the faces: the three turned away (inside, seen once the lid opens) then those facing us
            const names = Object.keys(FACES), vis = names.filter((n) => facing(FACES[n])), hid = names.filter((n) => !facing(FACES[n]));
            // before the planks: the wireframe with its face grid and the eyes inside, as Einstein left it
            if (t < T.planks[1]) {
                const fk = 1 - S(t, T.planks[0], T.planks[0] + 0.4);
                for (const n of hid) { const f = FACES[n]; for (let i = 1; i < 4; i++) { line(press, [P(lerp3(f.q[0], f.q[3], i / 4), c), P(lerp3(f.q[1], f.q[2], i / 4), c)], 2, { yellow: 0.5 * fk, 'pink.s': 0.3 * fk }); line(press, [P(lerp3(f.q[0], f.q[1], i / 4), c), P(lerp3(f.q[3], f.q[2], i / 4), c)], 2, { yellow: 0.5 * fk, 'pink.s': 0.3 * fk }); } }
                const q = P([0, 110, 0], c);
                for (const dx of [-34, 34]) { put(press, ellipse(q[0] + dx, q[1], 22, 16), { yellow: 1, blue: 0.7 }); put(press, ellipse(q[0] + dx, q[1], 5, 14), BH); }
            }
            // inside walls (dark, lit by nothing but the opening)
            if (t >= T.planks[0]) {
                hid.forEach((n, i) => { if (n !== 'top') wall(press, n, FACES[n], t, c, 1, i * 4); });
                if (t > T.lid[0]) for (const n of hid) if (n !== 'top') ink(press, (g) => poly(g, FACES[n].q.map((q) => P(q, c))), { navy: 0.5 });
            }
            edges(press, t, c, 'back');
            const open = IO(S(t, T.lid[0], T.lid[1]));
            if (t > T.lid[0]) {
                // warm light from inside, up out of the opening
                const O = P([0, -h, 0], c), kk = kAt([0, -h, 0], c);
                press.knockout((g) => { g.fillStyle = Riso.radial(g, O[0], O[1] - 60 * kk, 40 * kk, 520 * kk, 0.85 * open, 0); g.beginPath(); g.arc(O[0], O[1] - 60 * kk, 520 * kk, 0, 6.2832); g.fill(); });
                ink(press, (g) => g.arc(O[0], O[1] - 60 * kk, 520 * kk, 0, 6.2832), { 'yellow.s': (g) => Riso.radial(g, O[0], O[1] - 60 * kk, 40 * kk, 520 * kk, 0.5 * open, 0) });
                // the lid, swung up on its back hinge (it stands behind him)
                const th = 1.95 * open;
                const lid = FACES.top.q.map(([x, , z]) => { const dz = z - h; return [x, -h + dz * Math.sin(th), h + dz * Math.cos(th)]; });
                // (while it is still over the opening it is in front of him; once past upright, behind)
                const drawLid = () => { wall(press, 'top', { q: lid }, t, c, th > 1.3 ? 0.6 : 0.1, 0); for (let i = 0; i < 4; i++) line(press, [P(lid[i], c), P(lid[(i + 1) % 4], c)], 16 * c.z, BATTEN); };
                if (th >= 1.4) drawLid();
                // Schrödinger rising inside, the rim across his chest; his arms go down into the box
                const up = Ease.back ? Ease.back(S(t, T.rise[0], T.rise[1])) : IO(S(t, T.rise[0], T.rise[1]));
                const sc = kAt([0, -h, 40], c) * 1.45, R0 = P([-20, -h, 60], c);
                const hx = R0[0], hy = R0[1] + L(60, -200, up) * sc;
                Ph.cam(press, hx, hy, sc, () => {
                    const pp = Seg.schrodinger.parts;
                    pp.sleeve(press, [-60, 132], [-70, 260], [-50, 380], 60);
                    pp.schrodinger(press, { look: [1, 0.1], noLegs: true });
                });
                if (th < 1.4) drawLid();
            }
            // the walls facing us; the lid, while closed, is the top face
            if (t >= T.planks[0]) vis.forEach((n, i) => { if (n === 'top') return; wall(press, n, FACES[n], t, c, n === 'right' ? 0.55 : n === 'front' ? 0.15 : 0, 12 + i * 4); });
            edges(press, t, c, 'front');
            if (t >= T.planks[0] && t <= T.lid[0]) wall(press, 'top', FACES.top, t, c, 0, 24);
            // the cat hops up onto the front rim and sits on the batten (drawn over the front walls)
            const cu = S(t, T.cat[0], T.cat[1]), sc = kAt([0, -h, 40], c) * 1.45, R0 = P([-20, -h, 60], c), hx = R0[0], hy = R0[1] - 200 * sc;
            if (cu > 0) {
                const A = P([h * 0.8, -h, h * 0.1], c), B0 = P([h * 0.45, -h, -h], c), B = [B0[0], B0[1] - 10 * c.z];
                const x = L(A[0], B[0], cu), y = L(A[1], B[1], cu) - Math.sin(cu * Math.PI) * 120 * c.z;
                Cat.sit(press, { x, y, s: kAt([h, -h, -h], c) * 2.1, face: -1, look: [hx, hy], tail: t * 0.6 });
            }
        },
    };
})();
