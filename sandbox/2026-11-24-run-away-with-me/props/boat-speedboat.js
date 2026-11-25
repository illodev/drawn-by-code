// The bridge's speedboat (sections/boat.js): an invented 1980s cigarette boat, 12.4 m long,
// a long pointed deep-V hull, white with a pink-and-teal stripe that sweeps up to the bow, a
// low wraparound windscreen two thirds aft, an open cockpit (salmon seats, a dash of gauges),
// an engine hatch with vents on the aft deck. Built in metres (x starboard, y up from the
// waterline, z towards the bow) and painted in the drawn manner (styles/retro-neon/ink.js):
// one ink per material and facing, a brush line by size on screen, light laid on as strokes.
// Parts are split so the scene can put the two of them inside the cockpit: everything behind
// them, then `inside(g)`, then whatever lies between the camera and them.
// Global: BoatSpeedboat.
const BoatSpeedboat = (() => {
    const P = Ink.PAL;
    const cap = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
    // the hull's stations (z, metres) and its lines at each: half-beam at the sheer, sheer
    // height, chine half-width, chine height, keel height (above the waterline at rest)
    const ZS = [-6.0, -4.5, -2.5, -0.5, 1.5, 3.2, 4.6, 5.6, 6.4];
    const SB = [1.18, 1.22, 1.25, 1.25, 1.2, 1.05, 0.8, 0.48, 0.02];
    const SH = [0.95, 1.0, 1.05, 1.1, 1.15, 1.18, 1.2, 1.2, 1.18];
    const CB = [1.05, 1.08, 1.1, 1.1, 1.02, 0.85, 0.58, 0.3, 0.02];
    const CH = [0.15, 0.15, 0.17, 0.2, 0.28, 0.42, 0.6, 0.8, 1.05];
    const KH = [-0.45, -0.48, -0.5, -0.5, -0.45, -0.3, -0.05, 0.3, 1.0];
    const PIV = -3;                                       // planing: the hull pitches about here
    const COCK = { z0: -3.2, z1: 0.4, x: 0.95, depth: 0.62 };   // the cockpit's hole and depth
    // Catmull-Rom through the stations
    function at(A, z) {
        z = cap(z, ZS[0], ZS[ZS.length - 1]);
        let i = 0; while (i < ZS.length - 2 && z > ZS[i + 1]) i++;
        const u = (z - ZS[i]) / (ZS[i + 1] - ZS[i]);
        const p0 = A[Math.max(0, i - 1)], p1 = A[i], p2 = A[i + 1], p3 = A[Math.min(A.length - 1, i + 2)];
        return 0.5 * (2 * p1 + (-p0 + p2) * u + (2 * p0 - 5 * p1 + 4 * p2 - p3) * u * u + (-p0 + 3 * p1 - 3 * p2 + p3) * u * u * u);
    }
    const ZL = []; for (let z = ZS[0]; z < ZS[ZS.length - 1] - 0.01; z += 0.35) ZL.push(z); ZL.push(ZS[ZS.length - 1]);
    const deckY = (z) => at(SH, z);

    // local → world for a pose { x, y (waterline), z, yaw, pitch, roll }
    function W(ps, [x, y, z]) {
        const cr = Math.cos(ps.roll || 0), sr = Math.sin(ps.roll || 0), cp = Math.cos(ps.pitch || 0), sp = Math.sin(ps.pitch || 0), cy = Math.cos(ps.yaw), sy = Math.sin(ps.yaw);
        const x1 = x * cr - y * sr, y1 = x * sr + y * cr, z1 = z - PIV;
        const y2 = y1 * cp + z1 * sp, z2 = -y1 * sp + z1 * cp + PIV;
        return [ps.x + x1 * cy + z2 * sy, ps.y + y2, ps.z - x1 * sy + z2 * cy];
    }
    // world → local (the camera's place in the boat's frame)
    function local(ps, [X, Y, Z]) {
        const cr = Math.cos(ps.roll || 0), sr = Math.sin(ps.roll || 0), cp = Math.cos(ps.pitch || 0), sp = Math.sin(ps.pitch || 0), cy = Math.cos(ps.yaw), sy = Math.sin(ps.yaw);
        const dx = X - ps.x, dy = Y - ps.y, dz = Z - ps.z;
        const x1 = dx * cy - dz * sy, z2 = dx * sy + dz * cy - PIV, y2 = dy;
        const y1 = y2 * cp - z2 * sp, z1 = y2 * sp + z2 * cp;
        return [x1 * cr + y1 * sr, -x1 * sr + y1 * cr, z1 + PIV];
    }
    // keep the part of a world polygon above the water (Sutherland–Hodgman on y)
    function clipY(pts, y0) {
        const out = [];
        for (let i = 0; i < pts.length; i++) {
            const a = pts[i], b = pts[(i + 1) % pts.length], ia = a[1] >= y0, ib = b[1] >= y0;
            if (ia) out.push(a);
            if (ia !== ib) { const u = (y0 - a[1]) / (b[1] - a[1]); out.push([a[0] + (b[0] - a[0]) * u, y0, a[2] + (b[2] - a[2]) * u]); }
        }
        return out.length >= 3 ? out : null;
    }

    // the stripes on a topside: fractions of the way from the sheer down to the chine, sweeping
    // up towards the bow and ending in a point (magenta above, teal below)
    const STRIPES = [
        { col: P.magenta, top: (u) => 0.16 - 0.1 * u * u, bot: (u) => 0.36 - 0.26 * u * u, end: 5.0 },
        { col: P.aqua, top: (u) => 0.44 - 0.3 * u * u, bot: (u) => 0.54 - 0.36 * u * u, end: 4.6 },
    ];

    // o: { cam, ps, d, T, inside(g), light: { dawn 0..1, gold }, L, N, wake }
    function draw(g, o) {
        const { cam, ps, d } = o, L = o.L, N = o.N, dawn = o.dawn ?? 0;
        const c = local(ps, cam.pos);
        const mid = cam.p(W(ps, [0, 0.6, 0])); if (mid[2] < 0.5) return;
        const s = cam.f / mid[2], lw = cap(0.045 * s, 1.1, 5), lwi = lw * 0.6;
        const water = ps.y;
        const proj = (ptsL, clip = true) => { let w = ptsL.map((p) => W(ps, p)); if (clip) { w = clipY(w, water + 0.005); if (!w) return null; } return Neon.poly(cam, w); };
        const seed = 7100;
        const front = [], back = [];
        const put = (isFront, depth, fn) => (isFront ? front : back).push({ depth, fn });
        const dep = (p) => cam.view(W(ps, p))[2];
        const sheer = (sd) => ZL.map((z) => [sd * at(SB, z), at(SH, z), z]);
        const chine = (sd) => ZL.map((z) => [sd * at(CB, z), at(CH, z), z]);
        const keel = () => ZL.map((z) => [0, at(KH, z), z]);
        const dawnCol = (night, day, k = 1) => (dawn > 0 ? Neon.css(Neon.mix(night, day, cap(dawn * k, 0, 1))) : night);

        // --- the hull: bottoms (chine to keel), topsides (sheer to chine), the transom
        for (const sd of [-1, 1]) {
            const outside = c[0] * sd > at(CB, cap(c[2], -6, 6)) || c[2] > 6.2;
            // seen from inside its own beam (over the deck), a side is hidden by the deck: not drawn
            if (!(c[0] * sd > at(SB, cap(c[2], -6, 6.4)) * 0.97 || c[2] > 6.3 || c[2] < ZS[0] - 0.05 || c[1] < at(SH, cap(c[2], -6, 6.4)))) continue;
            put(outside, dep([sd * 1.1, 0.2, 0]) + 0.5, () => {
                const q = proj(chine(sd).concat(keel().reverse())); if (q) Ink.shape(g, q, P.violet, { w: lw, seed: seed + sd, d, jit: 0 });
            });
            put(outside, dep([sd * 1.2, 0.7, 0]), () => {
                const q = proj(sheer(sd).concat(chine(sd).reverse())); if (!q) return;
                Ink.shape(g, q, dawnCol(P.pink, '#ffb0d8', 0.6), { w: lw, seed: seed + 10 + sd, d, jit: 0 });
                // the stripes, then strokes of light along the sheer (sky above; the dawn from the east)
                for (const [k, st] of STRIPES.entries()) {
                    const zz = ZL.filter((z) => z <= st.end), u = (z) => (z - ZS[0]) / (st.end - ZS[0]);
                    const pt = (z, f) => { const a = [sd * at(SB, z), at(SH, z), z], b = [sd * at(CB, z), at(CH, z), z]; return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, z]; };
                    const top = zz.map((z) => pt(z, st.top(u(z)))), bot = zz.map((z) => pt(z, st.bot(u(z)))).reverse();
                    const tip = pt(st.end + 0.5, st.top(1) * 0.6);
                    const qs = proj(top.concat([tip], bot)); if (qs) Ink.shape(g, qs, st.col, { w: lwi * 0.7, seed: seed + 20 + k * 3 + sd, d, jit: 0, inkAlpha: 0.9 });
                }
                const sp = sheer(sd).filter((p, i) => i % 3 === 0).map((p) => cam.p(W(ps, [p[0], p[1] - 0.04, p[2]]))).filter((p) => p[2] > 0.5);
                for (let i = 0; i + 1 < sp.length; i++) {
                    const a = sp[i], b = sp[i + 1];
                    Ink.hatch(g, [a[0], a[1]], [b[0], b[1]], { n: [0, 1], count: 2, len: cap(0.22 * s, 4, 26), w: lwi, col: dawn > 0.35 ? (i % 2 ? P.gold : P.salmon) : (i % 2 ? P.cyan : P.cream), seed: seed + 40 + i * 7 + sd, d, ang: 0.9, alpha: 0.85 });
                }
            });
        }
        if (c[2] < ZS[0] || true) {
            const tr = [[-SB[0], SH[0], ZS[0]], [SB[0], SH[0], ZS[0]], [CB[0], CH[0], ZS[0]], [0, KH[0], ZS[0]], [-CB[0], CH[0], ZS[0]]];
            put(c[2] < ZS[0], dep([0, 0.5, ZS[0]]), () => {
                if (c[2] > ZS[0]) return;
                const q = proj(tr); if (q) Ink.shape(g, q, P.purple, { w: lw, seed: seed + 50, d, jit: 0 });
                // the swim platform's edge and two exhaust ports
                for (const sd of [-0.5, 0.5]) { const e = cam.p(W(ps, [sd, 0.42, ZS[0] - 0.01])); if (e[2] > 0.5) Ink.shape(g, ellipse(e[0], e[1], 0.11 * s, 0.07 * s), P.ink, { w: 0, seed: seed + 51, d, jit: 0 }); }
            });
        }

        // --- the deck, in pieces round the cockpit's hole
        const above = c[1] > deckY(cap(c[2], -6, 6)) - 0.02;
        const deckPiece = (z0, z1, x0f, x1f) => { // between z0 and z1, from x0f(z) to x1f(z)
            const zz = ZL.filter((z) => z > z0 && z < z1); zz.unshift(z0); zz.push(z1);
            return zz.map((z) => [x1f(z), deckY(z) + 0.005, z]).concat(zz.slice().reverse().map((z) => [x0f(z), deckY(z) + 0.005, z]));
        };
        const DECK = dawnCol('#ffc8ee', '#ffe6f6', 0.5);
        const pieces = [
            { pts: deckPiece(COCK.z1, ZS[ZS.length - 1], (z) => -at(SB, z), (z) => at(SB, z)), front: c[2] > COCK.z1, ref: [0, 1.1, 3] },
            { pts: deckPiece(ZS[0], COCK.z0, (z) => -at(SB, z), (z) => at(SB, z)), front: c[2] < COCK.z0, ref: [0, 1.0, -4.6] },
            { pts: deckPiece(COCK.z0, COCK.z1, (z) => -at(SB, z), () => -COCK.x), front: c[0] < -COCK.x, ref: [-1.1, 1.05, -1.4] },
            { pts: deckPiece(COCK.z0, COCK.z1, () => COCK.x, (z) => at(SB, z)), front: c[0] > COCK.x, ref: [1.1, 1.05, -1.4] },
        ];
        if (above) for (const [k, pc] of pieces.entries()) put(pc.front, dep(pc.ref) - 0.2, () => {
            const q = proj(pc.pts, false); if (!q) return;
            Ink.shape(g, q, DECK, { w: lw, seed: seed + 60 + k, d, jit: 0 });
            // strokes of sky along the deck's length (violet at night, salmon at dawn)
            if (k === 0) {
                // the forward hatch: a raised lid with its seam and a handle; two cleats at the bow
                const hy = (z) => deckY(z) + 0.03;
                const hq = proj([[-0.42, hy(2.3), 2.3], [0.42, hy(2.3), 2.3], [0.36, hy(3.5), 3.5], [-0.36, hy(3.5), 3.5]], false);
                if (hq) { Ink.shape(g, hq, '#ffe6f6', { w: lw * 0.7, seed: seed + 80, d, jit: 0 }); }
                const h0 = cam.p(W(ps, [-0.12, hy(3.2) + 0.01, 3.2])), h1 = cam.p(W(ps, [0.12, hy(3.2) + 0.01, 3.2]));
                if (h0[2] > 0.5) Ink.brush(g, [[h0[0], h0[1]], [h1[0], h1[1]]], { w: cap(0.035 * s, 1, 4), seed: seed + 81, d, taper: 0.1 });
                for (const sd of [-1, 1]) { const cz = 5.2, a = cam.p(W(ps, [sd * 0.22, deckY(cz) + 0.02, cz - 0.12])), b = cam.p(W(ps, [sd * 0.22, deckY(cz) + 0.02, cz + 0.12])); if (a[2] > 0.5) Ink.brush(g, [[a[0], a[1]], [b[0], b[1]]], { w: cap(0.05 * s, 1, 5), col: P.ink, seed: seed + 82 + sd, d, taper: 0.1 }); }
                // the bow rail: a thin rail of cream on stanchions along both sheers
                for (const sd of [-1, 1]) {
                    const zz = [3.0, 3.8, 4.6, 5.3, 5.9], R = zz.map((z) => cam.p(W(ps, [sd * at(SB, z) * 0.9, deckY(z) + 0.28, z])));
                    if (R.some((p) => p[2] < 0.5)) continue;
                    for (const [i, z] of zz.entries()) { const b0 = cam.p(W(ps, [sd * at(SB, z) * 0.9, deckY(z), z])); Ink.brush(g, [[b0[0], b0[1]], [R[i][0], R[i][1]]], { w: cap(0.022 * s, 0.8, 3), col: P.ink, seed: seed + 84 + i, d, taper: 0.05 }); }
                    Ink.brush(g, R.map((p) => [p[0], p[1]]), { w: cap(0.035 * s, 1, 4), col: P.ink, seed: seed + 90 + sd, d, taper: 0.04 });
                    Ink.brush(g, R.map((p) => [p[0], p[1] - 0.5]), { w: cap(0.016 * s, 0.6, 2), col: P.cream, seed: seed + 92 + sd, d, taper: 0.06, light: true });
                }
            }
            if (k === 0) for (let i = 0; i < 6; i++) {
                const z = 1.2 + i * 0.8, x = (Ink.hsh(seed, i, 0) - 0.5) * at(SB, z) * 1.1;
                const a = cam.p(W(ps, [x, deckY(z) + 0.01, z])), b = cam.p(W(ps, [x * 0.9, deckY(z + 0.6) + 0.01, z + 0.6])); if (a[2] < 0.5) continue;
                Ink.brush(g, [[a[0], a[1]], [b[0], b[1]]], { w: lwi * 0.9, col: dawn > 0.3 ? P.salmon : P.pink, seed: seed + 70 + i, d, taper: 0.45, alpha: 0.9 });
            }
        });
        // the engine hatch on the aft deck: a raised lid, vents on its sides
        if (above) put(c[2] < -3.4, dep([0, 1.2, -4.6]) - 0.4, () => hatch(g, ps, cam, c, s, lw, d, proj));
        // the cockpit, seen through its hole (always behind the two of them)
        if (above) put(false, dep([0, 0.6, -1.4]) + 0.3, () => cockpit(g, ps, cam, c, s, lw, d, proj, dawn));
        // the windscreen and the dash
        put(c[2] > COCK.z1 + 0.2, dep([0, 1.4, 0.6]), () => screen(g, ps, cam, c, s, lw, d, L, dawn));
        // the stern light's pole and the bow's navigation lights
        put(c[2] < -5, dep([0, 1.6, -5.4]), () => {
            const a = cam.p(W(ps, [0, deckY(-5.4), -5.4])), b = cam.p(W(ps, [0, deckY(-5.4) + 0.95, -5.4])); if (a[2] < 0.5) return;
            Ink.brush(g, [[a[0], a[1]], [b[0], b[1]]], { w: cap(0.05 * s, 1, 4), col: P.cream, seed: seed + 90, d, taper: 0.05 });
        });

        back.sort((a, b) => b.depth - a.depth); for (const it of back) it.fn();
        if (o.inside) o.inside(g);
        front.sort((a, b) => b.depth - a.depth); for (const it of front) it.fn();

        // the lights (emitters: on the picture as a dot, the glow on the light layer)
        if (L && N) {
            const lit = o.lights ?? 1;
            const lt = [[[-1.0, deckY(3.3) + 0.05, 3.3], P.red, -1], [[1.0, deckY(3.3) + 0.05, 3.3], P.mint, 1], [[0, deckY(-5.4) + 1.0, -5.4], '#ffe6f6', 0]];
            for (const [p, col, sd] of lt) {
                const q = cam.p(W(ps, p)); if (q[2] < 3) continue;
                // a side light is seen only from its side and ahead
                if (sd && c[0] * sd < -0.3) continue;
                const r = (sd ? cap(0.5 * s, 4, 40) : cap(0.22 * s, 3, 14)) * lit;
                N.glint(null, L, q[0], q[1], r, col, { lightOnly: true, alpha: 0.9 * lit, halo: o.halo ?? 1 });
                g.fillStyle = col; g.beginPath(); g.arc(q[0], q[1], cap(0.06 * s, 1.2, 5), 0, Math.PI * 2); g.fill();
            }
        }
        return { s, c };
    }

    const ellipse = (x, y, rx, ry, n = 14) => { const q = []; for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2; q.push([x + Math.cos(a) * rx, y + Math.sin(a) * ry]); } return q; };

    function hatch(g, ps, cam, c, s, lw, d, proj) {
        const z0 = -5.6, z1 = -3.5, x = 0.82, h = 0.22, y0 = deckY(-4.6);
        const top = [[-x, y0 + h, z0], [x, y0 + h, z0], [x, y0 + h, z1], [-x, y0 + h, z1]];
        const faces = [
            { pts: [[-x, y0, z1], [x, y0, z1], [x, y0 + h, z1], [-x, y0 + h, z1]], vis: c[2] > z1, col: P.purple },
            { pts: [[-x, y0, z0], [x, y0, z0], [x, y0 + h, z0], [-x, y0 + h, z0]], vis: c[2] < z0, col: P.purple },
            { pts: [[x, y0, z0], [x, y0, z1], [x, y0 + h, z1], [x, y0 + h, z0]], vis: c[0] > x, col: P.pink, vents: 1 },
            { pts: [[-x, y0, z0], [-x, y0, z1], [-x, y0 + h, z1], [-x, y0 + h, z0]], vis: c[0] < -x, col: P.pink, vents: -1 },
        ];
        for (const [k, f] of faces.entries()) {
            if (!f.vis) continue;
            const q = proj(f.pts, false); if (!q) continue;
            Ink.shape(g, q, f.col, { w: lw * 0.8, seed: 7200 + k, d, jit: 0 });
            if (f.vents) for (let i = 0; i < 5; i++) { const zv = z0 + 0.35 + i * 0.32; const a = cam.p(W(ps, [f.vents * x, y0 + h * 0.3, zv])), b = cam.p(W(ps, [f.vents * x, y0 + h * 0.75, zv + 0.12])); if (a[2] > 0.5) Ink.brush(g, [[a[0], a[1]], [b[0], b[1]]], { w: cap(0.05 * s, 1, 4), seed: 7210 + i, d, taper: 0.1 }); }
        }
        const q = proj(top, false); if (q) Ink.shape(g, q, '#ffc8ee', { w: lw * 0.8, seed: 7220, d, jit: 0 });
        // a raised scoop down the middle of the lid
        const a = cam.p(W(ps, [0, y0 + h + 0.01, z0 + 0.3])), b = cam.p(W(ps, [0, y0 + h + 0.01, z1 - 0.2]));
        if (a[2] > 0.5) Ink.brush(g, [[a[0], a[1]], [b[0], b[1]]], { w: cap(0.12 * s, 1.5, 9), col: P.magenta, seed: 7230, d, taper: 0.2 });
    }

    function cockpit(g, ps, cam, c, s, lw, d, proj, dawn) {
        const { z0, z1, x, depth } = COCK, yd = (z) => deckY(z), yf = deckY(-1.4) - depth;
        const zz = ZL.filter((z) => z > z0 && z < z1); zz.unshift(z0); zz.push(z1);
        const hole = zz.map((z) => [x, yd(z), z]).concat(zz.slice().reverse().map((z) => [-x, yd(z), z]));
        const qh = proj(hole, false); if (!qh) return;
        g.save(); Neon.path(g, qh); g.clip();
        // the floor, then the walls that face the camera, then the seats
        const fl = proj([[-x, yf, z0], [x, yf, z0], [x, yf, z1], [-x, yf, z1]], false); if (fl) Ink.shape(g, fl, P.deep, { w: 0, seed: 7300, d, jit: 0 });
        const walls = [
            { pts: [[-x, yf, z1], [x, yf, z1], [x, yd(z1), z1], [-x, yd(z1), z1]], vis: c[2] < z1 },
            { pts: [[-x, yf, z0], [x, yf, z0], [x, yd(z0), z0], [-x, yd(z0), z0]], vis: c[2] > z0 },
            { pts: [[x, yf, z0], [x, yf, z1], [x, yd(z1), z1], [x, yd(z0), z0]], vis: c[0] < x },
            { pts: [[-x, yf, z0], [-x, yf, z1], [-x, yd(z1), z1], [-x, yd(z0), z0]], vis: c[0] > -x },
        ];
        for (const [k, w] of walls.entries()) if (w.vis) { const q = proj(w.pts, false); if (q) Ink.shape(g, q, k < 2 ? P.plum : P.grape, { w: lw * 0.6, seed: 7310 + k, d, jit: 0 }); }
        // the rear lounge across the aft wall and the two bolsters at the helm
        const box = (bx0, bx1, bz0, bz1, h, key) => {
            const y1 = yf + h, faces = [];
            if (c[2] > bz1) faces.push([[bx0, yf, bz1], [bx1, yf, bz1], [bx1, y1, bz1], [bx0, y1, bz1]]);
            if (c[0] > bx1) faces.push([[bx1, yf, bz0], [bx1, yf, bz1], [bx1, y1, bz1], [bx1, y1, bz0]]);
            if (c[0] < bx0) faces.push([[bx0, yf, bz0], [bx0, yf, bz1], [bx0, y1, bz1], [bx0, y1, bz0]]);
            if (c[2] < bz0) faces.push([[bx0, yf, bz0], [bx1, yf, bz0], [bx1, y1, bz0], [bx0, y1, bz0]]);
            for (const [k, f] of faces.entries()) { const q = proj(f, false); if (q) Ink.shape(g, q, P.plum, { w: lw * 0.6, seed: key + k, d, jit: 0 }); }
            const t = proj([[bx0, y1, bz0], [bx1, y1, bz0], [bx1, y1, bz1], [bx0, y1, bz1]], false); if (t) Ink.shape(g, t, P.salmon, { w: lw * 0.6, seed: key + 9, d, jit: 0 });
        };
        // (no seats at the helm: the two of them stand there, and a seat inside the cockpit is
        // painted before them, so from behind it would show in front of their legs)
        box(-0.92, 0.92, -3.2, -2.5, 0.42, 7320);
        g.restore();
        // the coaming's edge
        Ink.brush(g, qh, { w: lw * 0.8, seed: 7390, d, closed: true });
        // strokes of light on the lounge's top (gold at dawn, cyan at night)
        const a = cam.p(W(ps, [-0.6, yf + 0.43, -2.8])), b = cam.p(W(ps, [0.6, yf + 0.43, -2.8]));
        if (a[2] > 0.5) Ink.hatch(g, [a[0], a[1]], [b[0], b[1]], { n: [0, 1], count: 4, len: cap(0.12 * s, 3, 16), w: lw * 0.5, col: dawn > 0.35 ? P.gold : P.cyan, seed: 7395, d, ang: 0.6, alpha: 0.8 });
    }

    // the windscreen: a frame in cream and ink, the glass drawn by strokes of what it reflects;
    // under it the dash (a deep panel, a wheel, gauges that glow)
    function screen(g, ps, cam, c, s, lw, d, L, dawn) {
        const pts = [], N0 = 9;
        for (let i = 0; i <= N0; i++) { const u = i / N0, x = -1.02 + 2.04 * u, z = COCK.z1 + 0.1 + 0.45 * Math.cos((u - 0.5) * Math.PI) ** 1.5; pts.push([x, z]); }
        const yb = (z) => deckY(z) + 0.01, H = 0.48, rake = 0.32;
        const base = pts.map(([x, z]) => [x, yb(z), z]), top = pts.map(([x, z]) => [x * 0.96, yb(z) + H, z - rake]);
        // the dash under it, seen from behind (in the cockpit)
        if (c[2] < COCK.z1 && c[1] > deckY(0) - 0.4) {
            const yf = deckY(0) - 0.05;
            const dash = [[-0.92, yf, COCK.z1 - 0.02], [0.92, yf, COCK.z1 - 0.02], [0.92, yf - 0.32, COCK.z1 - 0.02], [-0.92, yf - 0.32, COCK.z1 - 0.02]];
            const q = Neon.poly(cam, dash.map((p) => W(ps, p)));
            if (q) {
                Ink.shape(g, q, P.ink, { w: cap(0.03 * s, 1, 3), seed: 7400, d, jit: 0 });
                for (let i = 0; i < 6; i++) {
                    const gp = cam.p(W(ps, [-0.75 + i * 0.22, yf - 0.12, COCK.z1 - 0.04])); if (gp[2] < 0.5) continue;
                    const col = i % 3 === 1 ? P.gold : P.cyan, r = cap(0.045 * s, 1.2, 8);
                    g.strokeStyle = col; g.lineWidth = Math.max(1, r * 0.35); g.beginPath(); g.arc(gp[0], gp[1], r, 0, Math.PI * 2); g.stroke();
                    if (L) { L.save(); L.globalAlpha = 0.5; L.fillStyle = col; L.beginPath(); L.arc(gp[0], gp[1], r * 1.4, 0, Math.PI * 2); L.fill(); L.restore(); }
                }
                // the wheel, on the port side (he drives)
                const wc = W(ps, [-0.45, yf + 0.02, COCK.z1 - 0.22]), wq = cam.p(wc);
                if (wq[2] > 0.5) { const r = 0.19 * cam.f / wq[2]; Ink.brush(g, ellipse(wq[0], wq[1], r, r * 0.55, 18), { w: cap(0.035 * s, 1.2, 5), col: P.ink, seed: 7410, d, closed: true }); }
            }
        }
        const qb = base.map((p) => cam.p(W(ps, p))), qt = top.map((p) => cam.p(W(ps, p)));
        if (qb.some((p) => p[2] < 0.4) || qt.some((p) => p[2] < 0.4)) return;
        // the glass: a faint fill of the sky, then strokes of reflection
        const glass = qb.map((p) => [p[0], p[1]]).concat(qt.map((p) => [p[0], p[1]]).reverse());
        g.save(); g.globalAlpha = 0.22; g.fillStyle = dawn > 0.4 ? P.salmon : P.cyan; Neon.path(g, glass); g.fill(); g.restore();
        for (let i = 0; i < 5; i++) {
            const k = 1 + i * 1.6, a = qb[Math.min(N0, Math.round(k))], b = qt[Math.min(N0, Math.round(k + 0.7))];
            const m = (u) => [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u];
            Ink.brush(g, [m(0.2), m(0.75)], { w: cap(0.04 * s, 1, 5), col: i % 2 ? P.cyan : P.cream, seed: 7420 + i, d, taper: 0.4, alpha: 0.75, light: true });
        }
        // the frame: the posts at the ends and the middle, the top rail in cream with an ink line
        for (const i of [0, Math.round(N0 / 2), N0]) Ink.brush(g, [[qb[i][0], qb[i][1]], [qt[i][0], qt[i][1]]], { w: cap(0.05 * s, 1.2, 6), col: P.ink, seed: 7430 + i, d, taper: 0.05 });
        const rail = qt.map((p) => [p[0], p[1]]);
        Ink.brush(g, rail, { w: cap(0.07 * s, 1.6, 8), col: P.ink, seed: 7440, d, taper: 0.03 });
        Ink.brush(g, rail, { w: cap(0.035 * s, 1, 4), col: (ps.gold ?? 0) > 0.05 ? P.gold : P.cream, seed: 7441, d, taper: 0.05, light: true });
        Ink.brush(g, qb.map((p) => [p[0], p[1]]), { w: cap(0.045 * s, 1.2, 5), col: P.ink, seed: 7450, d, taper: 0.03 });
    }

    // the boat's reflection on calm water: broken strokes of the hull's inks under its waterline
    function reflection(g, cam, ps, d, o = {}) {
        const a = o.alpha ?? 0.8;
        for (const sd of [-1, 1]) {
            const c = local(ps, cam.pos); if (c[0] * sd < 0.5) continue;
            for (let i = 0; i < ZL.length - 1; i += 2) {
                const z = ZL[i], p = cam.p(W(ps, [sd * at(CB, z), 0, z])); if (p[2] < 1) continue;
                const s = cam.f / p[2], h = (at(SH, z) + 0.2) * s;
                for (let j = 0; j < 4; j++) {
                    const u = (j + 0.5) / 4, yy = p[1] + 2 + u * h * 0.9, l = (0.6 + Ink.hsh(i, j, 0) * 0.8) * s * (1 - u * 0.3);
                    const sw = Math.sin((o.T ?? 0) * 2.3 + i + j * 1.7) * 0.15 * s;
                    Ink.brush(g, [[p[0] - l / 2 + sw, yy], [p[0] + l / 2 + sw, yy + 0.5]], { w: cap(0.06 * s, 1, 5), col: j < 2 ? P.pink : (j === 2 ? P.magenta : P.aqua), seed: 7500 + i * 5 + j + sd, d, taper: 0.4, alpha: a * (1 - u * 0.5), light: true });
                }
            }
        }
    }

    // spray at speed (v: m/s): sheets of droplets thrown sideways from the bow's chines, and the
    // rooster tail behind the transom; strokes along each droplet's flight
    function spray(g, cam, ps, T, d, v, part) {
        const k = cap(v / 30, 0, 1); if (k < 0.05) return;
        const c = local(ps, cam.pos), cols = [P.cream, P.cyan, P.pink, '#ffc8ee'];
        const streak = (pa, pb, w, col, a, sd) => {
            const A = cam.p(W(ps, pa)), B = cam.p(W(ps, pb)); if (A[2] < 0.5 || B[2] < 0.5) return;
            const s = cam.f / A[2];
            Ink.brush(g, [[A[0], A[1]], [B[0], B[1]]], { w: cap(w * s, 0.8, 7), col, seed: sd, d, taper: 0.45, wob: 0.4, alpha: a, light: true });
        };
        if (part === 'bow') for (const sd of [-1, 1]) {
            if ((c[0] * sd > 0) !== (part === 'bow')) { /* both sides drawn; the hull order is the scene's */ }
            for (let i = 0; i < 26 * k; i++) {
                const h = Ink.hsh(8100 + sd, i, 0), h2 = Ink.hsh(8200 + sd, i, 0), u = ((T * (1.1 + h2 * 0.6) + h) % 1);
                const z0 = 1.6 + 2.2 * h2, x0 = sd * at(CB, z0), y0 = 0.15;
                const vx = sd * (2.5 + 3.5 * h), vy = (2 + 3 * h2) * k, vz = -(0.3 + 0.25 * h) * v, age = u * 0.8;
                const p = [x0 + vx * age, y0 + vy * age - 4.9 * age * age, z0 + vz * age];
                if (p[1] < -0.1) continue;
                const q = [p[0] - vx * 0.03, p[1] - (vy - 9.8 * age) * 0.03, p[2] - vz * 0.012];
                streak(q, p, 0.05 + 0.04 * h, cols[i % 4], 0.9 * (1 - u) * k, 8300 + i * 3 + sd);
            }
            // the sheet's edge: a long curved stroke from the chine outwards and back
            const arc = []; for (let j = 0; j <= 8; j++) { const a = j / 8 * 0.7; arc.push(W(ps, [sd * (at(CB, 2.4) + 4.5 * a), 0.15 + 3.2 * k * a - 4.9 * a * a, 2.4 - 0.32 * v * a])); }
            const Q = arc.map(cam.p); if (Q.every((p) => p[2] > 0.5)) { const s = cam.f / Q[0][2]; Ink.brush(g, Q.map((p) => [p[0], p[1]]), { w: cap(0.09 * s, 1, 8), col: P.cream, seed: 8400 + sd, d, taper: 0.35, alpha: 0.75 * k, light: true }); }
        }
        if (part === 'tail') {
            // the rooster tail: a plume of mist (wide translucent strokes of cream along its arc)
            // and droplets as short dabs on screen, rising behind the props and falling back;
            // it collapses as the boat comes off the plane
            const kt = cap((v - 8) / 22, 0, 1); if (kt <= 0) return;
            const len = 14 * kt, top = 2.2 * kt;
            const arcAt = (u, x = 0) => [x, 0.15 + top * Math.sin(Math.PI * Math.min(1, u)) * (u < 0.5 ? 1 : 1 - 0.15 * (u - 0.5)), ZS[0] - 0.8 - len * u];
            for (let m = 0; m < 3; m++) {
                const xo = (m - 1) * 0.3, Q = []; for (let j = 0; j <= 10; j++) Q.push(cam.p(W(ps, arcAt(0.05 + j * 0.085, xo * (0.4 + j * 0.15)))));
                if (Q.some((p) => p[2] < 2)) continue;
                const s = cam.f / Q[3][2];
                Ink.brush(g, Q.map((p) => [p[0], p[1]]), { w: cap((0.45 - m * 0.08) * s, 2, 40), col: m % 2 ? '#ffc8ee' : P.cream, seed: 8550 + m, d, taper: 0.45, wob: 2.5, alpha: 0.11 * kt, light: true });
            }
            for (let i = 0; i < 70 * kt; i++) {
                const h = Ink.hsh(8500, i, 0), h2 = Ink.hsh(8501, i, 0), u = ((T * (0.9 + 0.5 * h2) + h) % 1);
                const x = (h - 0.5) * (0.5 + u * 2.4), p0 = arcAt(u, x), p = [p0[0], p0[1] + (h2 - 0.5) * 0.6 * kt, p0[2]];
                if (p[1] < 0) continue;
                const A = cam.p(W(ps, p)), Bm = cam.p(W(ps, [p[0], p[1] + (u < 0.5 ? 0.2 : -0.2), p[2] - 0.3])); if (A[2] < 2) continue;
                const s = cam.f / A[2], dl = Math.hypot(Bm[0] - A[0], Bm[1] - A[1]) || 1, L0 = cap((0.12 + 0.12 * h) * s, 1.5, 14);
                const ux = (Bm[0] - A[0]) / dl, uy = (Bm[1] - A[1]) / dl;
                Ink.brush(g, [[A[0], A[1]], [A[0] + ux * L0, A[1] + uy * L0]], { w: cap((0.05 + 0.04 * h) * s, 0.8, 5), col: cols[i % 4], seed: 8600 + i, d, taper: 0.45, wob: 0.3, alpha: 0.85 * (1 - u * 0.6) * kt, light: true });
            }
        }
    }

    return { draw, reflection, spray, W, local, at, deckY, SH, SB, CB, CH, ZS, COCK };
})();
