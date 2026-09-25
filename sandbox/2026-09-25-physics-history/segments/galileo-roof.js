// Segment «Galileo on the roof» of physics-history (script v2): Padua, a winter night in
// January 1610. One continuous shot. It opens on his eye beside the eyepiece of his telescope;
// he leans in to look. The camera dollies slowly back until the whole man stands on the wooden
// altana of his house, the city and the sky behind him, breath steaming, turning the focusing
// collar. He pulls back from the eyepiece, astonished; the camera takes his place, turning round
// behind the eyepiece and closing in until the glass becomes the telescope's field: Jupiter and
// its four moons. The nights pass (the sky wheels round the pole, the moons move to their next
// places), and the zoom goes on into Jupiter, the view rolling a quarter turn so its belts stand
// upright like an apple's streaks, the colour ripening into the apple of the next scene.
//
//   Seg.galileoRoof.draw(press, tq, st)   local time 0–T.end (on twos)
//
// The camera is a real one: a perspective view of the 3D telescope (Scope3D), dollying (the
// distance d shrinks, the focal length stays), so the man, drawn on the plane through the tube's
// axis, the tube and its hands keep one perspective at every size. The far layers (the city,
// the altana's rail) scale by their own depth, the stars not at all.
var Seg = globalThis.Seg ?? (globalThis.Seg = {});
(() => {
    const { put, ink, line, smooth, poly, taper, circle, ellipse } = Ph;
    const L = Ease.lerp, S = Ease.seg, IO = Ease.inOut;
    const P = () => Seg.galileo.parts;

    // 0–2.2 the eye beside the eyepiece (the lantern's light sweeps the glass, a blink; he leans
    // in 1.0–1.8); 2.2–5.4 the camera dollies back to the whole scene; he turns the collar, a
    // shooting star; 6.3–7.0 he pulls back from the eyepiece, astonished; 6.6–8.6 the camera
    // closes in and turns round behind the eyepiece into his place; the glass opens into the
    // field; three nights; the dive into Jupiter rolls the view and ripens it into the apple
    const T = { sweep: [0.2, 1.7], blink: 0.75, lean: [1.0, 1.8], back: [2.2, 5.4], star: 5.6, look: [6.3, 7.0], push: [6.6, 8.6], orbit: [7.1, 8.6], glow: [7.9, 8.5], field: [8.5, 8.9], nights: [9.0, 9.8, 10.6], glide: 0.35, zoomB: [10.8, 12.6], roll: [10.8, 12.1], ripen: [11.0, 12.6], morph: [12.1, 12.6], end: 12.8 };

    // ── colours ──────────────────────────────────────────────────────────────────────────
    const BRASS_SH = { yellow: 1, 'pink.s': 0.4, 'navy.s': 0.45 };
    const WOOD = { 'yellow.s': 0.75, 'pink.s': 0.55, 'navy.s': 0.62 };
    const WOOD_LT = { 'yellow.s': 0.65, 'pink.s': 0.4, 'navy.s': 0.38 };
    const WOOD_DK = { 'yellow.s': 0.8, 'pink.s': 0.65, 'navy.s': 0.85 };
    const TILE = { pink: 0.75, 'yellow.s': 0.7, 'navy.s': 0.55 };
    const TILE_LT = { pink: 0.6, 'yellow.s': 0.6, 'navy.s': 0.35 };
    const WALL = { 'yellow.s': 0.4, 'pink.s': 0.25, 'navy.s': 0.55, 'blue.s': 0.2 };
    const SIL = { navy: 1, yellow: 0.75, 'pink.s': 0.35 }; // olive-black against the blue night
    const WARM = { yellow: 1, 'pink.s': 0.3 };
    const COAT = Cast.COAT, COAT_LIT = Cast.COAT_LIT, LINEN = Cast.LINEN, LINEN_SH = Cast.LINEN_SH;
    const COAT_DK = { navy: 1, yellow: 1, pink: 0.6 };
    const RIM = { navy: 1, yellow: 1, pink: 0.8 };

    // ── the world (units of the whole-scene frame at Z = 1) ────────────────────────────────
    const E = [500, 333];                   // the eyepiece's face
    const ANG = -0.6, D = [Math.cos(ANG), Math.sin(ANG)], N = [-D[1], D[0]]; // the tube's axis; N below it
    const at = (s, n = 0) => [E[0] + D[0] * s + N[0] * n, E[1] + D[1] * s + N[1] * n];
    const RAIL = 650, FLOOR = 900;
    const JS0 = at(1400);                   // where Jupiter sits in the sky (off frame)
    const RJ = 1.4;                         // Jupiter's radius in sky units (moons' orbits in radii)
    const MOON_A = [5.9, 9.4, 15.0, 26.4];
    const KH = 0.057;                       // head units → world (the head ≈ 170 tall)
    const rAt = (s) => 19 + 11 * (s - 46) / 1424;   // the leather tube's radius
    const HAND = { near: 110, far: 225 };   // where the hands hold the tube (s)
    const ARM = [180, 185];                 // upper arm, forearm to the cuff (world, as seen: the upper arm points half at the camera)

    // ── the camera ───────────────────────────────────────────────────────────────────────
    // Z: pixels per world unit at the eyepiece; k: the orbit round it (0.12 from the side,
    // 1 straight down the axis from behind); F lands on screen at S; rc rolls the frame
    const D0 = 6000, ZM = 14, ZF = 420 / 11;
    const FM = at(-24), FW = [800, 450];
    // between two framings, the focus moves so the screen motion is even across a log zoom
    const zPath = (u, z0, z1, f0, f1) => {
        const z = Math.exp(L(Math.log(z0), Math.log(z1), u)), w = (1 / z - 1 / z0) / (1 / z1 - 1 / z0);
        return { Z: z, F: [L(f0[0], f1[0], w), L(f0[1], f1[1], w)] };
    };
    function view(t) {
        if (t < T.back[0]) {
            const u = S(t, 0, T.back[0]);
            return { Z: ZM * (1 + 0.04 * u), k: 0.3, F: FM, S: [L(830, 800, u), 470], rc: 0.36, d: D0 / ZM };
        }
        if (t < T.push[0]) {
            const u = IO(S(t, T.back[0], T.back[1])), zp = zPath(u, ZM * 1.04, 1, FM, FW);
            return { Z: zp.Z, k: L(0.3, 0.12, u), F: zp.F, S: [800, L(470, 450, u)], rc: L(0.36, 0, u), d: D0 / zp.Z };
        }
        const u = IO(S(t, T.push[0], T.push[1])), zp = zPath(u, 1, ZF, FW, E), ko = IO(S(t, T.orbit[0], T.orbit[1]));
        // closing in, the camera comes forward past his head into his place (d shrinks faster)
        const d = Math.exp(L(Math.log(D0), Math.log(40), Ease.in(u) * 0.5 + u * 0.5));
        return { Z: zp.Z, k: L(0.12, 1, ko), F: zp.F, S: [800, 450], rc: 0, d };
    }
    // the scope camera for a view, and the plane of the man (z = 0 through the axis) on screen
    function rig(v) {
        const V = Scope3D.orbit(v.k, { dist: v.d, flen: v.Z * v.d, c: [0, 0], roll: ANG + v.rc, aim: 0 });
        const C0 = Scope3D.camera(V);
        const sc = (p, z = 0) => { const q = [(p[0] - E[0]) * D[0] + (p[1] - E[1]) * D[1], -((p[0] - E[0]) * N[0] + (p[1] - E[1]) * N[1]), z]; return q; };
        const f0 = C0.proj(sc(v.F));
        const off = [v.S[0] - f0[0], v.S[1] - f0[1]];
        V.c = off;
        const C = Scope3D.camera(V);
        const scr = (p, z = 0) => C.proj(sc(p, z));
        return { V, C, scr, sc };
    }
    // the affine map of the man's plane at p (world → screen), and its scale
    function planeAt(R, p) {
        const o = R.scr(p), a = R.scr([p[0] + 1, p[1]]), b = R.scr([p[0], p[1] + 1]);
        const J = [a[0] - o[0], a[1] - o[1], b[0] - o[0], b[1] - o[1]];
        return { o, J, z: o[2], k: Math.sqrt(Math.abs(J[0] * J[3] - J[1] * J[2])), apply: (q) => [o[0] + J[0] * (q[0] - p[0]) + J[2] * (q[1] - p[1]), o[1] + J[1] * (q[0] - p[0]) + J[3] * (q[1] - p[1])], p };
    }
    const withPlane = (press, M, fn) => {
        press.save();
        press.each((g) => g.transform(M.J[0], M.J[1], M.J[2], M.J[3], M.o[0] - M.J[0] * M.p[0] - M.J[2] * M.p[1], M.o[1] - M.J[1] * M.p[0] - M.J[3] * M.p[1]));
        fn();
        press.restore();
    };
    // the tube's own frame at s on its near surface: a along the tube, b across (down)
    function tubeFrame(R, s) {
        const r = rAt(s), o = R.C.proj([s, 0, r]), a = R.C.proj([s + 1, 0, r]), b = R.C.proj([s, -1, r]);
        const J = [a[0] - o[0], a[1] - o[1], b[0] - o[0], b[1] - o[1]];
        return { r, o, J, apply: (q) => [o[0] + J[0] * q[0] + J[2] * q[1], o[1] + J[1] * q[0] + J[3] * q[1]], inv: (w) => { const det = J[0] * J[3] - J[1] * J[2], x = w[0] - o[0], y = w[1] - o[1]; return [(J[3] * x - J[2] * y) / det, (-J[1] * x + J[0] * y) / det]; } };
    }
    // the sky seen through the telescope: centre, zoom, roll
    function skyCam(t) {
        const za = Math.log(3) + Math.log(10 / 3) * IO(S(t, T.field[0], T.field[1]));
        const zb = Math.log(1000 / 10) * Math.pow(S(t, T.zoomB[0], T.zoomB[1]), 1.35);
        return { base: [800, 450], Zs: Math.exp(za + zb), roll: -Math.PI / 2 * IO(S(t, T.roll[0], T.roll[1])) };
    }
    // looking down the eyepiece after the turn: the glass keeps growing through the dive
    function glassZ(t) { return t < T.zoomB[0] ? ZF : L(ZF, 1700 / 11, Math.pow(S(t, T.zoomB[0], T.zoomB[1] - 0.4), 1.5)); }
    function fieldR(t) { return t > T.field[0] ? 11 * glassZ(t) : 0; }


    // ── the sky ──────────────────────────────────────────────────────────────────────────
    // the whole vault turns round the celestial pole (up and left, off frame) as the nights
    // pass: between two nights it sweeps, and Jupiter stays centred (the telescope follows it)
    const POLE = [-900, -1400];
    function nightF(t) { return T.nights.slice(1).reduce((n, tn) => n + IO(S(t, tn - T.glide, tn)), 0); }
    function sky(press, t, c) {
        ink(press, (g) => g.rect(-3000, -3000, 7000, 6000), { blue: 0.9 });
        ink(press, (g) => g.rect(-3000, -3000, 7000, 6000), { 'navy.s': (g) => Riso.ramp(g, 0, 0, 0, 900, 0.95, 0.62) });
        const nf = nightF(t), sweep = nf * 0.22;
        const rotB = (v, rl) => [v[0] * Math.cos(rl) - v[1] * Math.sin(rl), v[0] * Math.sin(rl) + v[1] * Math.cos(rl)];
        const toS = (q) => {
            // rotate about the pole by the nights' sweep, then the camera (tilt and zoom round Jupiter)
            const dx = q[0] - POLE[0], dy = q[1] - POLE[1], cs = Math.cos(sweep), sn = Math.sin(sweep);
            const r = [POLE[0] + dx * cs - dy * sn, POLE[1] + dx * sn + dy * cs];
            // Jupiter is re-centred each night (the telescope tracks it): measure from its rotated place
            const jr = [POLE[0] + (JS0[0] - POLE[0]) * cs - (JS0[1] - POLE[1]) * sn, POLE[1] + (JS0[0] - POLE[0]) * sn + (JS0[1] - POLE[1]) * cs];
            const v = rotB([(r[0] - jr[0]) * c.Zs, (r[1] - jr[1]) * c.Zs], c.roll);
            return [c.base[0] + v[0], c.base[1] + v[1]];
        };
        // the Milky Way: a soft band of light, knocked back through the navy
        if (c.Zs < 3) {
            const a = toS([-600, 900]), b = toS([2600, -1500]);
            for (const [w, al] of [[520, 0.05], [340, 0.06], [180, 0.07]]) press.knockout((g) => { g.lineCap = 'round'; g.lineWidth = w; g.strokeStyle = `rgba(0,0,0,${al})`; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); });
            // its dust of faint stars
            const rm = Motion.rng('milky');
            for (let i = 0; i < 260; i++) { const u = rm(), v = (rm() + rm() + rm() - 1.5) * 150, q = [L(a[0], b[0], u) - v * 0.58, L(a[1], b[1], u) - v * 0.81]; if (q[0] > -10 && q[0] < 1610 && q[1] > -10 && q[1] < 910) press.knockout(circle(q[0], q[1], 1.2 + rm() * 1.2)); }
        }
        // stars: fixed in sky units, twinkling; bright ones with rays; they streak as the sky sweeps
        const r = Motion.rng('roof-stars'), sw = nf % 1 > 0.02 && nf % 1 < 0.98 ? 1 : 0;
        for (let i = 0; i < 900; i++) {
            const q = [-1400 + r() * 4200, -2200 + r() * 3300], big = r() > 0.93, tw = 0.75 + 0.25 * Motion.noise1('rs' + i, t * 3);
            const p = toS(q);
            if (p[0] < -20 || p[0] > 1620 || p[1] < -20 || p[1] > 920) continue;
            const rad = (big ? 6.5 : 3.6) * tw * Math.min(1.6, Math.sqrt(c.Zs));
            const spec = r() < 0.3 ? { yellow: 0.35 } : { blue: 0.15 };
            if (sw) {
                // a short arc: where it was a moment ago
                const t0 = Math.max(0, t - 0.08), c0 = skyCam(t0), dx = q[0] - POLE[0], dy = q[1] - POLE[1];
                const s0 = nightF(t0) * 0.22, cs = Math.cos(s0), sn = Math.sin(s0);
                const r0 = [POLE[0] + dx * cs - dy * sn, POLE[1] + dx * sn + dy * cs];
                const jr0 = [POLE[0] + (JS0[0] - POLE[0]) * cs - (JS0[1] - POLE[1]) * sn, POLE[1] + (JS0[0] - POLE[0]) * sn + (JS0[1] - POLE[1]) * cs];
                const v0 = rotB([(r0[0] - jr0[0]) * c0.Zs, (r0[1] - jr0[1]) * c0.Zs], c0.roll), p0 = [c.base[0] + v0[0], c.base[1] + v0[1]];
                line(press, [p0, p], rad * 1.6, spec);
            } else put(press, circle(p[0], p[1], rad), spec);
            if (big && !sw) for (const [ux, uy] of [[1, 0], [0, 1]]) line(press, [[p[0] - ux * rad * 3.4, p[1] - uy * rad * 3.4], [p[0] + ux * rad * 3.4, p[1] + uy * rad * 3.4]], taper(2.6, 0.5, 0.5), spec);
        }
        // a shooting star early on
        const sk = S(t, T.star, T.star + 0.3);
        if (sk > 0 && sk < 1) { const a = toS([1100 + sk * 380, 40 + sk * 150]), b = toS([1100 + Math.max(0, sk - 0.3) * 380, 40 + Math.max(0, sk - 0.3) * 150]); line(press, [b, a], taper(3.5, 0.9, 0.05), { 'yellow.s': 0.6 }); }
        return toS;
    }

    // Jupiter and its moons on night nf (the moons move by one day per night)
    function jupiter(press, t, c, nf) {
        const J = c.base, Z = c.Zs, R = RJ * Z, rl = c.roll;
        const m = S(t, T.morph[0], T.morph[1]), mc = IO(S(t, T.ripen[0], T.ripen[1])); // shape, colour
        if (m >= 1) { Seg.newtonApple.drawApple(press, J[0], J[1], R, 0); return; }
        // the moons (behind first), with faint marks of where they were the nights before
        const moons = (n) => MOON_A.map((a, i) => {
            const P0 = P().parts ? null : null;
            const per = [1.769, 3.551, 7.155, 16.69][i], th0 = [3.976, 4.022, 1.077, 1.224][i];
            const th = th0 + 2 * Math.PI * n / per;
            const vx = a * RJ * Z * Math.sin(th), vy = -a * RJ * Z * 0.07 * Math.cos(th);
            return [J[0] + vx * Math.cos(rl) - vy * Math.sin(rl), J[1] + vx * Math.sin(rl) + vy * Math.cos(rl), Math.cos(th) > 0];
        });
        const mr = Math.max(4, 0.28 * RJ * Z), fadeM = 1 - S(t, T.zoomB[0] + 0.25, T.zoomB[0] + 0.6);
        if (Z > 4 && fadeM > 0) for (let k = 0; k < Math.floor(nf + 1e-6); k++) for (const [x, y] of moons(k)) line(press, Array.from({ length: 17 }, (_, q) => [x + Math.cos(q / 16 * 6.2832) * (mr + 6), y + Math.sin(q / 16 * 6.2832) * (mr + 6)]), 2.4, { 'yellow.s': 0.55 * fadeM, 'pink.s': 0.4 * fadeM });
        const drawMoon = ([x, y]) => { if (fadeM <= 0) return; press.knockout((g) => { g.fillStyle = Riso.radial(g, x, y, 1, mr * 3, 0.6 * fadeM, 0); g.beginPath(); g.arc(x, y, mr * 3, 0, 6.2832); g.fill(); }); put(press, circle(x, y, mr), { yellow: 0.3 * fadeM }); };
        const now = moons(nf);
        now.forEach((q) => { if (!q[2]) drawMoon(q); });
        // the glow round the planet, then the disc
        const RR = Math.max(R, 3.2);
        press.knockout((g) => { g.fillStyle = Riso.radial(g, J[0], J[1], RR, RR * 3, 0.55 * (1 - mc), 0); g.beginPath(); g.arc(J[0], J[1], RR * 3, 0, 6.2832); g.fill(); });
        // the outline morphs from a circle to the apple's
        const APPLE = [[-1, -0.15], [-0.72, -0.82], [-0.2, -0.86], [0, -0.72], [0.2, -0.86], [0.72, -0.82], [1, -0.15], [0.8, 0.7], [0.2, 0.98], [-0.2, 0.98], [-0.8, 0.7]];
        const outline = APPLE.map(([ax, ay]) => { const a = Math.atan2(ay, ax); return [J[0] + L(Math.cos(a), ax, m) * RR, J[1] + L(Math.sin(a), ay, m) * RR]; });
        const shape = (g) => smooth(g, outline);
        // the colour ripens through ochre and orange to the apple's red (screens first, then solid)
            put(press, shape, { 'yellow.s': L(0.34, 1, S(mc, 0, 0.5)) * (mc < 0.85 ? 1 : 0), yellow: S(mc, 0.7, 1), 'pink.s': L(0.12, 1, mc) * (mc < 0.85 ? 1 : 0), pink: S(mc, 0.7, 1), 'navy.s': 0.05 * mc });
        if (R > 14) {
            press.save();
            press.clip(shape);
            // bands: belts in ochre, zones in cream, drawn in Jupiter's frame (the camera's roll
            // turns them vertical); each sits where an apple streak will be, and narrows into it
            press.save();
            press.each((g) => { g.translate(J[0], J[1]); g.rotate(rl); g.translate(-J[0], -J[1]); });
            const bands = [[-0.5, L(0.13, 0.07, mc), 0.6], [-0.2, L(0.16, 0.07, mc), 0.72], [0.15, L(0.16, 0.07, mc), 0.75], [0.45, L(0.12, 0.07, mc), 0.62], [0.74, 0.08 * (1 - mc), 0.45]];
            for (const [y, h, a] of bands) {
                const yy = J[1] + y * RR, hh = h * RR, w = Math.sin(t * 0.6 + y * 5) * 0.02 * RR;
                ink(press, (g) => { g.beginPath(); g.moveTo(J[0] - RR * 1.2, yy - hh / 2); for (let i = 0; i <= 12; i++) { const x = J[0] - RR * 1.2 + i * RR * 0.2; g.lineTo(x, yy - hh / 2 + Math.sin(i * 1.3 + y * 9) * hh * 0.18 + w); } g.lineTo(J[0] + RR * 1.2, yy + hh / 2); for (let i = 12; i >= 0; i--) { const x = J[0] - RR * 1.2 + i * RR * 0.2; g.lineTo(x, yy + hh / 2 + Math.sin(i * 1.7 + y * 7) * hh * 0.18); } g.closePath(); }, { 'pink.s': 0.45 * a * (1 - mc), 'yellow.s': L(0.3 * a, 1, mc), 'navy.s': 0.12 * a * (1 - mc) });
            }
            press.restore();
            // the apple's streaks (vertical, where the belts now lie) take over from the bands
            if (m > 0.5) for (const dx of [-0.5, -0.2, 0.15, 0.45]) line(press, [[J[0] + dx * RR, J[1] - RR * 0.6], [J[0] + dx * RR * 1.2, J[1]], [J[0] + dx * RR, J[1] + RR * 0.6]], taper(RR * 0.08), { yellow: 1, 'pink.s': 0.4 });
            // the apple's own shadow side comes in with it (the same shape drawApple uses)
            if (mc > 0) ink(press, (g) => smooth(g, [[J[0] - 0.2 * RR, J[1] + 0.1 * RR], [J[0] + 0.9 * RR, J[1] - 0.1 * RR], [J[0] + 0.6 * RR, J[1] + 0.8 * RR], [J[0], J[1] + 0.95 * RR]]), { 'navy.s': 0.45 * mc });
            // limb darkening and the terminator's soft shadow
            ink(press, circle(J[0], J[1], RR * 1.1), { 'navy.s': (g) => Riso.radial(g, J[0] - RR * 0.25, J[1] - RR * 0.25, RR * 0.4, RR * 1.15, 0, 0.5 * (1 - mc)) });
            press.restore();
            if (m > 0.2) press.knockout(ellipse(J[0] - RR * 0.4, J[1] - RR * 0.35, RR * 0.18 * m, RR * 0.12 * m, -0.5));
            // the stalk and the leaf grow out of the top
            const g = S(m, 0.55, 1);
            if (g > 0) {
                // (grown in place: the stalk from the dimple, the leaf unfolding at its tip)
                line(press, [[J[0], J[1] - RR * 0.7], [J[0] + 3 * RR / 30 * g, J[1] - RR * (0.7 + 0.5 * g)]], RR * 0.1, { 'yellow.s': 0.7, 'pink.s': 0.55, 'navy.s': 0.6 });
                put(press, (gg) => { gg.beginPath(); gg.ellipse(J[0] + RR * 0.35, J[1] - RR * 1.1, RR * 0.4 * g, RR * 0.16 * g, -0.4, 0, 6.2832); }, { yellow: 1, 'blue.s': 0.62, 'navy.s': 0.25 });
            }
        }
        now.forEach((q) => { if (q[2]) drawMoon(q); });
    }

    // ── Padua beyond the railing: roofs, chimneys, the Santo's domes, lit windows ───────────
    function city(press, t) {
        const r = Motion.rng('padua');
        // far: the Basilica del Santo — eight domes with lanterns and two slender bell towers
        const SX = 1040, SY = 560;
        for (const [dx, h, w] of [[-190, 70, 60], [-110, 92, 72], [-20, 118, 88], [80, 92, 72], [160, 70, 60], [-60, 74, 56], [40, 74, 56], [240, 58, 50]]) {
            put(press, (g) => { g.beginPath(); g.ellipse(SX + dx, SY - 40, w, h, 0, Math.PI, 0); g.lineTo(SX + dx + w, SY + 20); g.lineTo(SX + dx - w, SY + 20); g.closePath(); }, SIL);
            line(press, [[SX + dx, SY - 40 - h], [SX + dx, SY - 58 - h]], 5, SIL);
            put(press, circle(SX + dx, SY - 62 - h, 4), SIL);
        }
        for (const bx of [SX - 290, SX + 330]) {
            put(press, (g) => poly(g, [[bx - 12, SY + 20], [bx - 10, SY - 180], [bx, SY - 230], [bx + 10, SY - 180], [bx + 12, SY + 20]]), SIL);
            put(press, (g) => g.rect(bx - 16, SY - 150, 32, 10), SIL);
        }
        // the Palazzo della Ragione's keel roof, far left
        put(press, (g) => { g.beginPath(); g.moveTo(20, SY + 30); g.quadraticCurveTo(200, SY - 120, 380, SY + 30); g.closePath(); }, { navy: 1, 'blue.s': 0.4 });
        // near roofs: gables in terracotta with tile courses, chimneys with smoke, lit windows
        for (let i = 0; i < 9; i++) {
            const x0 = -60 + i * 200 + r() * 40, w = 190 + r() * 60, top = 580 + r() * 40, h = 90;
            put(press, (g) => g.rect(x0, top, w, RAIL - top + 40), WALL);
            put(press, (g) => poly(g, [[x0 - 14, top + 6], [x0 + w / 2, top - 46], [x0 + w + 14, top + 6]]), TILE);
            for (let k = 1; k < 4; k++) line(press, [[x0 - 14 + k * 18, top + 6 - k * 13], [x0 + w + 14 - k * 18, top + 6 - k * 13]], 2, TILE_LT);
            for (let k = 0; k < 2; k++) {
                const wx = x0 + 30 + k * (w - 80), lit = Motion.noise1('win' + i + k, t * 0.8) > -0.2;
                put(press, (g) => g.rect(wx, top + 22, 20, 26), lit ? WARM : { navy: 1 });
                line(press, [[wx + 10, top + 22], [wx + 10, top + 48]], 2, WALL);
            }
            if (i % 2 === 0) {
                const cx = x0 + w * 0.7, cy = top - 40;
                put(press, (g) => g.rect(cx - 9, cy - 34, 18, 36), WALL);
                put(press, (g) => g.rect(cx - 13, cy - 38, 26, 8), TILE);
                for (let k = 0; k < 5; k++) {
                    const ph = (t * 0.35 + k / 5 + i * 0.13) % 1;
                    { const x = cx + ph * 70 + Math.sin(ph * 6 + k) * 6, y = cy - 44 - ph * 90, rr = 8 + ph * 16; press.knockout((g) => { g.fillStyle = Riso.radial(g, x, y, 1, rr, 0.22 * (1 - ph), 0); g.beginPath(); g.arc(x, y, rr, 0, 6.2832); g.fill(); }); }
                }
            }
        }
    }

    // ── the altana: plank floor, turned balusters, a top rail; the lantern, the cat ─────────
    function altana(press, t) {
        put(press, (g) => g.rect(-200, RAIL - 12, 2000, 22), WOOD);
        put(press, (g) => g.rect(-200, RAIL - 12, 2000, 6), WOOD_LT);
        for (let x = -180; x < 1800; x += 46) {
            put(press, (g) => smooth(g, [[x - 6, RAIL + 10], [x + 6, RAIL + 10], [x + 11, RAIL + 60], [x + 5, RAIL + 110], [x + 12, RAIL + 170], [x + 6, FLOOR], [x - 6, FLOOR], [x - 12, RAIL + 170], [x - 5, RAIL + 110], [x - 11, RAIL + 60]]), WOOD);
            line(press, [[x - 2, RAIL + 14], [x - 3, FLOOR]], 2, WOOD_LT);
        }
        for (const px of [60, 700, 1340]) {
            put(press, (g) => g.rect(px - 16, RAIL - 60, 32, FLOOR), WOOD_DK);
            put(press, circle(px, RAIL - 70, 18), WOOD);
            put(press, (g) => g.rect(px - 16, RAIL - 60, 8, FLOOR), WOOD_LT);
        }
        // the lantern hanging from the left post, its glow on the rail
        const lx = 60, ly = RAIL - 150, fl = Motion.noise1('lamp', Math.floor(t * 12) * 0.7);
        line(press, [[lx, RAIL - 86], [lx + 50, RAIL - 120], [lx + 50, ly - 20]], 4, { navy: 1 });
        press.knockout((g) => { g.fillStyle = Riso.radial(g, lx + 50, ly + 30, 6, 220, 0.5, 0); g.beginPath(); g.arc(lx + 50, ly + 30, 220, 0, 6.2832); g.fill(); });
        ink(press, circle(lx + 50, ly + 30, 220), { 'yellow.s': (g) => Riso.radial(g, lx + 50, ly + 30, 6, 220, 0.55 + 0.05 * fl, 0) });
        put(press, (g) => poly(g, [[lx + 32, ly], [lx + 68, ly], [lx + 64, ly + 56], [lx + 36, ly + 56]]), { 'yellow.s': 0.25 });
        put(press, (g) => smooth(g, [[lx + 50, ly + 14 - fl * 4], [lx + 57, ly + 36], [lx + 50, ly + 46], [lx + 43, ly + 36]]), WARM);
        for (const x of [lx + 32, lx + 50, lx + 68]) line(press, [[x, ly], [x - (x - lx - 50) * 0.1, ly + 56]], 3, { navy: 1 });
        put(press, (g) => poly(g, [[lx + 26, ly], [lx + 50, ly - 22], [lx + 74, ly]]), { navy: 1, yellow: 0.8 });
        // the cat on the rail: sitting, looking out at the city; its tail flicks, an ear twitches
        const cx = 1240, cy = RAIL - 12, tw = Math.sin(t * 3.1) * 0.5 + Math.sin(t * 7.3) * 0.15;
        const CAT = { navy: 1, yellow: 0.9, 'pink.s': 0.4 };
        line(press, Ph.sample([[cx + 30, cy - 6], [cx + 70, cy + 10], [cx + 92, cy + 50 + tw * 10], [cx + 78 + tw * 30, cy + 92]], false, 6), taper(12, 0.2, 0.7), CAT);
        put(press, (g) => smooth(g, [[cx - 34, cy], [cx - 40, cy - 40], [cx - 26, cy - 80], [cx, cy - 92], [cx + 22, cy - 70], [cx + 36, cy - 30], [cx + 38, cy]]), CAT);
        put(press, (g) => smooth(g, [[cx - 30, cy - 90], [cx - 18, cy - 124], [cx + 16, cy - 128], [cx + 26, cy - 100], [cx + 10, cy - 82], [cx - 22, cy - 80]]), CAT);
        const ear = Math.max(0, Math.sin(t * 5)) * 4;
        put(press, (g) => poly(g, [[cx - 22, cy - 118], [cx - 20, cy - 144 - ear], [cx - 6, cy - 124]]), CAT);
        put(press, (g) => poly(g, [[cx + 6, cy - 126], [cx + 18, cy - 148], [cx + 22, cy - 118]]), CAT);
        for (const ex of [-12, 10]) put(press, ellipse(cx + ex, cy - 106, 4, 3), { yellow: 1, 'blue.s': 0.5 });
    }

    // ── the tripod under the tube ────────────────────────────────────────────────────────
    function tripod(press, R, M) {
        const s = 560, hd = R.C.proj([s, -(rAt(s) + 12), 0]), base = at(s, rAt(s) + 12);
        for (const [dx, z, spec] of [[-150, -110, WOOD], [20, -170, WOOD_DK], [170, 120, WOOD_LT]]) {
            const f = R.scr([base[0] + dx, FLOOR + 60], z);
            if (f[2] < 5) continue;
            line(press, [hd, f], (u) => (10 + 8 * u) * M.k, spec);
            line(press, [[L(hd[0], f[0], 0.1), L(hd[1], f[1], 0.1)], [L(hd[0], f[0], 0.95), L(hd[1], f[1], 0.95)]], 2.4 * M.k, WOOD_LT);
        }
        put(press, circle(hd[0], hd[1], 15 * M.k), BRASS_SH);
    }

    // ── Galileo ──────────────────────────────────────────────────────────────────────────
    // where his eye is and how his head turns: leaning in to the eyepiece, then pulling back
    function pose(t) {
        const lean = IO(S(t, T.lean[0], T.lean[1])), look = IO(S(t, T.look[0], T.look[1]));
        const br = Math.sin(t * 2.4);
        const gap = L(45, 12, lean) + 70 * look, lift = 40 * look + br * 0.8;
        const Pe = [E[0] - D[0] * gap - N[0] * lift, E[1] - D[1] * gap - N[1] * lift];
        const hr = ANG + 0.34 * look + 0.02 * Math.sin(t * 1.3);
        const blink = Math.min(1, Ease.bump(t, T.blink, 0.22) + Ease.bump(t, 4.6, 0.22) + Ease.bump(t, T.look[0] + 0.12, 0.2));
        return { Pe, hr, look, lean, br, blink };
    }
    const headPt = (ps, q) => { const c = Math.cos(ps.hr), s = Math.sin(ps.hr); return [ps.Pe[0] + (q[0] * c - q[1] * s) * KH, ps.Pe[1] + (q[0] * s + q[1] * c) * KH]; };
    // the body's frame: from the collar, the torso leaning a little forward
    function bodyFrame(ps) {
        const B = headPt(ps, GalHead.NECK), ta = -0.08 - 0.06 * ps.look;
        const c = Math.cos(ta), s = Math.sin(ta);
        return (q) => [B[0] + q[0] * c - q[1] * s, B[1] + q[0] * s + q[1] * c + ps.br * 1.2 * (q[1] > 40 ? 1 : 0.5)];
    }
    const SHOULDER = { near: [-14, 66], far: [26, 54] };
    // the gown: an academic's black toga over a doublet buttoned down the front, a white
    // falling collar; folds down the back, the lantern's warm light along the shoulder
    function gown(press, bf) {
        const P = (pts) => pts.map(bf);
        const GOWN = P([[-70, -6], [-108, 30], [-146, 150], [-162, 340], [-166, 560], [-158, 900], [100, 900], [108, 560], [112, 330], [102, 150], [74, 40], [44, 2]]);
        put(press, (g) => smooth(g, GOWN), COAT);
        press.save(); press.clip((g) => smooth(g, GOWN));
        // the doublet in the gown's opening, its buttons, the lit edge of the gown's front
        const DB = P([[36, 8], [70, 40], [100, 150], [110, 330], [106, 560], [100, 900], [52, 900], [56, 330], [52, 130], [26, 30]]);
        put(press, (g) => smooth(g, DB), COAT_DK);
        for (let i = 0; i < 9; i++) { const q = bf([L(86, 90, i / 8), 70 + i * 50]); put(press, circle(q[0], q[1], 3.4), { 'yellow.s': 0.5, navy: 0.7 }); press.knockout(circle(q[0] - 1, q[1] - 1, 1)); }
        line(press, P([[30, 30], [52, 130], [56, 330], [52, 900]]), taper(4, 0.1, 0.1), COAT_LIT);
        // the back's folds and the light on the shoulder's round
        for (const [x0, x1] of [[-120, -140], [-80, -110], [-40, -60]]) line(press, P([[x0, 160], [L(x0, x1, 0.5) + 6, 400], [x1, 900]]), taper(5, 0.2, 0.2), COAT_LIT);
        line(press, P([[-100, 20], [-60, 0], [0, -2], [40, 6]]), taper(9, 0.3, 0.3), COAT_LIT);
        press.restore();
    }
    function collar(press, bf) {
        const P = (pts) => pts.map(bf);
        const C = P([[-78, 4], [-40, -18], [10, -22], [52, -10], [78, 14], [72, 40], [36, 50], [0, 34], [-40, 28], [-80, 22]]);
        put(press, (g) => smooth(g, C), LINEN);
        press.save(); press.clip((g) => smooth(g, C));
        ink(press, (g) => smooth(g, P([[-80, 20], [-30, 10], [30, 20], [80, 30], [80, 60], [-80, 60]])), LINEN_SH);
        press.restore();
        line(press, P([[-78, 8], [-30, -12], [20, -16], [60, -2]]), taper(2.4, 0.2, 0.2), LINEN_SH, { knock: false });
        line(press, P([[0, 32], [8, 46]]), taper(2), LINEN_SH, { knock: false });
    }
    // a sleeve on screen from the shoulder through the elbow to the cuff; widths in world units
    function sleeve(press, sh, el, cu, k, far) {
        const pts = [sh, el, cu], w = (u) => (u < 0.5 ? L(84, 66, u * 2) : L(66, 46, (u - 0.5) * 2)) * k;
        line(press, pts, (u) => w(u) + 4 * k, RIM);
        line(press, pts, w, far ? COAT_DK : COAT);
        const dir = (a, b) => { const l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1; return [(b[0] - a[0]) / l, (b[1] - a[1]) / l]; };
        // the lit edge along the top of the arm; creases gathering at the inside of the elbow
        const u1 = dir(sh, el), u2 = dir(el, cu), n1 = [u1[1], -u1[0]], n2 = [u2[1], -u2[0]];
        const lit = far ? { navy: 1, 'yellow.s': 0.5, 'pink.s': 0.5 } : COAT_LIT;
        const side = (u, n, p, o) => [p[0] + n[0] * o, p[1] + n[1] * o];
        line(press, [side(u1, n1, [L(sh[0], el[0], 0.15), L(sh[1], el[1], 0.15)], 26 * k), side(u1, n1, [L(sh[0], el[0], 0.85), L(sh[1], el[1], 0.85)], 24 * k), side(u2, n2, [L(el[0], cu[0], 0.4), L(el[1], cu[1], 0.4)], 18 * k), side(u2, n2, [L(el[0], cu[0], 0.92), L(el[1], cu[1], 0.92)], 16 * k)], taper(6 * k, 0.2, 0.3), lit);
        for (let i = 0; i < 3; i++) {
            const c = [L(el[0], cu[0], 0.05 + i * 0.1), L(el[1], cu[1], 0.05 + i * 0.1)];
            line(press, [side(u2, n2, c, -22 * k), [c[0] - u2[0] * 8 * k, c[1] - u2[1] * 8 * k], side(u2, n2, c, 6 * k)], taper(3 * k, 0.2, 0.3), lit);
        }
    }
    // one arm and its hand on the tube: IK on screen from the shoulder to the wrist on the tube
    function armAndHand(press, R, M, bf, which, s, pole, ps) {
        const F = tubeFrame(R, s), r = F.r, far = which === 'far';
        const sh = M.apply(bf(SHOULDER[which]));
        const Wl = GalHands.wristPt(which, r), W = F.apply(Wl);
        const [el] = Fig.ik(sh, W, ARM[0] * M.k, ARM[1] * M.k, M.apply(bf(pole)));
        const v = F.inv([W[0] + (el[0] - W[0]) * 0.01, W[1] + (el[1] - W[1]) * 0.01]);
        const l = Math.hypot(v[0] - Wl[0], v[1] - Wl[1]) || 1, fa = [(v[0] - Wl[0]) / l, (v[1] - Wl[1]) / l];
        const cu = F.apply([Wl[0] + fa[0] * 27, Wl[1] + fa[1] * 27]);
        return {
            sleeve: () => sleeve(press, sh, el, cu, M.k, far),
            hand: () => {
                press.save();
                press.each((g) => g.transform(F.J[0], F.J[1], F.J[2], F.J[3], F.o[0], F.o[1]));
                GalHands[which](press, r, { fa, squeeze: which === 'near' ? 1.5 * Math.max(0, Math.sin((ps.lean + ps.look) * Math.PI)) : 0 });
                press.restore();
            },
        };
    }
    function galileo(press, t, R, part) {
        const ps = pose(t), M = planeAt(R, ps.Pe);
        if (M.z < 12) return; // the camera has passed his head
        const bf = bodyFrame(ps);
        const nearA = armAndHand(press, R, M, bf, 'near', HAND.near, [70, 360], ps);
        const farA = armAndHand(press, R, M, bf, 'far', L(HAND.far, 195, ps.look), [150, 330], ps);
        if (part === 'back') {
            farA.sleeve();
            withPlane(press, M, () => {
                gown(press, bf);
                const head = (prt) => { press.save(); press.each((g) => { g.translate(ps.Pe[0], ps.Pe[1]); g.rotate(ps.hr); g.scale(KH, KH); }); GalHead.draw(press, { part: prt, lid: ps.blink, look: 0.72 - 0.2 * ps.look, pupil: 1 + 0.15 * ps.lean - 0.1 * ps.look, brow: -8 * ps.lean - 44 * ps.look, mouth: 0.7 * ps.look }); press.restore(); };
                head('neck');
                collar(press, bf);
                head('head');
            });
            return;
        }
        farA.hand();
        nearA.sleeve();
        nearA.hand();
        // breath: soft clouds from the mouth drifting up and forward, thinning out
        withPlane(press, M, () => {
            const m = headPt(ps, GalHead.MOUTH);
            for (let i = 0; i < 2; i++) {
                const ph = (t * 0.42 + i * 0.5) % 1, p = [m[0] + 14 + ph * 70, m[1] - 4 - ph * 36], rr = 7 + ph * 26;
                press.knockout((g) => { g.fillStyle = Riso.radial(g, p[0], p[1], 1, rr, 0.24 * Math.sin(ph * Math.PI), 0); g.beginPath(); g.ellipse(p[0], p[1], rr * 1.4, rr, -0.3, 0, 6.2832); g.fill(); });
            }
        });
    }

    // ── the frame ────────────────────────────────────────────────────────────────────────
    // a background layer at extra depth dz behind the man: it scales by the dolly as its depth
    // says, turns with the frame, and slides away as the camera turns towards the sky
    function layer(press, v, dz, pan, fn) {
        const sl = dz === Infinity ? 1 : (D0 + dz) / (v.d + dz);
        press.save();
        press.each((g) => {
            g.translate(v.S[0] + pan[0], v.S[1] + pan[1]); g.rotate(v.rc); g.scale(sl, sl);
            g.translate(dz === Infinity ? -v.S[0] : -v.F[0], dz === Infinity ? -v.S[1] : -v.F[1]);
        });
        fn();
        press.restore();
    }
    function scene(press, t, v) {
        const R = rig(v), M = planeAt(R, pose(t).Pe);
        // the camera turning round behind the eyepiece swings the view up the tube, to Jupiter
        const ko = IO(S(t, T.orbit[0], T.orbit[1])), pan = [(800 - JS0[0]) * ko, (450 - JS0[1]) * ko];
        layer(press, v, Infinity, pan, () => sky(press, t, { base: JS0, Zs: 1, roll: 0 }));
        layer(press, v, 30000, pan, () => city(press, t));
        layer(press, v, 2500, pan, () => altana(press, t));
        if (M.z > 12) tripod(press, R, M);
        galileo(press, t, R, 'back');
        const sweep = L(-1.2, 0.8, IO(S(t, T.sweep[0], T.sweep[1])));
        const glow = Ease.out(S(t, T.glow[0], T.glow[1]));
        const turn = 0.3 + 0.25 * IO(S(t, 1.2, 1.8)) + 0.4 * IO(S(t, 4.4, 5.6));
        Scope3D.draw(press, R.V, { turn, sweep, glow, t });
        if (v.k < 0.85) galileo(press, t, R, 'front');
        // dust in the air, nearest of all, drifting past the lens while the camera is close
        if (v.Z > 3) {
            const r = Motion.rng('air-dust3d');
            for (let i = 0; i < 18; i++) {
                const x = r() * 1900 - 150, y = r() * 900, s = 1.6 + r() * 2.6, ph = r() * 6.3;
                put(press, circle(x + Math.sin(t * 0.7 + ph) * 16, y - t * 10 + Math.cos(t * 0.9 + ph) * 8, s), { 'yellow.s': 0.3, 'blue.s': 0.1 });
            }
        }
    }

    Seg.galileoRoof = {
        T,
        init() { return {}; },
        draw(press, tq, st) {
            const t = tq, nf = nightF(t);
            const v = t < T.push[1] ? view(t) : { Z: glassZ(t), k: 1, F: E, S: [800, 450], rc: 0, d: 40 };
            const fr = fieldR(t) * Ease.out(S(t, T.field[0], T.field[0] + 0.25));
            if (fr < 1400) scene(press, t, v);
            // the view through the eyepiece: the glass becomes a disc of sky, then fills the frame
            if (fr > 1) {
                const C = [800, 450], sc = skyCam(t);
                press.save();
                press.clip((g) => g.arc(C[0], C[1], fr, 0, 6.2832));
                press.knockout((g) => { g.beginPath(); g.arc(C[0], C[1], fr, 0, 6.2832); g.fill(); });
                sky(press, t, { ...sc, base: C });
                jupiter(press, t, { ...sc, base: C }, nf);
                if (fr < 1400) press.knockout((g) => { Ph.poly(g, Ph.outline(Array.from({ length: 10 }, (_, i) => [C[0] + Math.cos(-2.5 + i * 0.08) * fr * 0.9, C[1] + Math.sin(-2.5 + i * 0.08) * fr * 0.9]), taper(Math.max(2, fr * 0.02), 0.3, 0.3))); g.globalAlpha = 0.5; g.fill(); g.globalAlpha = 1; });
                press.restore();
            }
        },
    };
})();
