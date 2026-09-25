// Segment «Galileo on the roof» of physics-history (script v2, 0–5 s of the piece): Padua,
// a winter night in January 1610. Galileo stands on the wooden altana of his house, bent to
// the eyepiece of his telescope, breath steaming; he turns the focusing collar. The camera
// travels up along the tube into the sky, where Jupiter and its four moons wait. The nights
// pass (the sky wheels round the pole, the moons move to their next day's places), and the
// zoom goes on into Jupiter until its disc fills the frame, its bands turn into the streaks
// of an apple's skin, a stalk and a leaf come out: the apple of the next scene.
//
//   Seg.galileoRoof.draw(press, tq, st)   local time 0–5 (on twos)
//
// Layers: the near world (Galileo, telescope, altana), the city (Padua's roofs, the Santo),
// the sky (stars, Jupiter and its moons at infinity). Each layer moves with its own share of
// the camera (a tilt moves them all, a travel along the tube moves the near world most).
var Seg = globalThis.Seg ?? (globalThis.Seg = {});
(() => {
    const { put, ink, line, smooth, poly, taper, circle, ellipse } = Ph;
    const L = Ease.lerp, S = Ease.seg, IO = Ease.inOut;
    const P = () => Seg.galileo.parts;

    // 0–1.5 the macro: the eyepiece (a true 3D telescope, Scope3D) beside his eye; 1.5 a cut on
    // the beat to the roof's close-up, easing back to the whole scene; 3.3–3.5 a push towards the
    // eyepiece; 3.5 a cut back to the macro's framing, and the camera turns round the eyepiece
    // until it looks straight down it (3.5–4.2), closing in; the glass becomes the telescope's
    // field; three nights on the beats; the dive into Jupiter rolls the view 90° (the belts turn
    // vertical, as the apple's streaks) and the colour ripens into the apple; 6.85–7.0 it holds
    const T = { macro: 1.5, diss: [1.5, 1.5], back: [1.5, 2.6], push: [3.3, 3.5], orbit: [3.5, 4.25], field: [4.2, 4.5], nights: [4.5, 5.0, 5.5], glide: 0.22, zoomB: [5.6, 6.85], roll: [5.6, 6.5], ripen: [5.75, 6.85], morph: [6.5, 6.85], end: 7.0 };

    // ── colours ──────────────────────────────────────────────────────────────────────────
    const AMBER = { yellow: 1, 'pink.s': 0.55 };
    const BRASS = { yellow: 1, 'pink.s': 0.22, 'navy.s': 0.08 };
    const BRASS_SH = { yellow: 1, 'pink.s': 0.4, 'navy.s': 0.45 };
    const LEATHER = { pink: 0.85, 'yellow.s': 0.55, 'navy.s': 0.5 };
    const LEATHER_LT = { pink: 0.7, 'yellow.s': 0.5, 'navy.s': 0.22 };
    const LEATHER_DK = { pink: 0.9, 'yellow.s': 0.6, 'navy.s': 0.82 };
    const GOLD = { yellow: 1, 'pink.s': 0.18 };
    const WOOD = { 'yellow.s': 0.75, 'pink.s': 0.55, 'navy.s': 0.62 };
    const WOOD_LT = { 'yellow.s': 0.65, 'pink.s': 0.4, 'navy.s': 0.38 };
    const WOOD_DK = { 'yellow.s': 0.8, 'pink.s': 0.65, 'navy.s': 0.85 };
    const TILE = { pink: 0.75, 'yellow.s': 0.7, 'navy.s': 0.55 };
    const TILE_LT = { pink: 0.6, 'yellow.s': 0.6, 'navy.s': 0.35 };
    const WALL = { 'yellow.s': 0.4, 'pink.s': 0.25, 'navy.s': 0.55, 'blue.s': 0.2 };
    const SIL = { navy: 1, yellow: 0.75, 'pink.s': 0.35 }; // olive-black against the blue night
    const WARM = { yellow: 1, 'pink.s': 0.3 };
    const COAT = Cast.COAT, COAT_LIT = Cast.COAT_LIT;
    const SKIN = Cast.SKIN, SKIN_SH = Cast.SKIN_SH;
    const RIM = { navy: 1, yellow: 1, pink: 0.8 };

    // ── geometry (screen units of the opening frame) ────────────────────────────────────
    const K = 1.45;                     // the head's scale (cast units → screen)
    const H = [470, 372];               // head centre
    const E = [500, 333];               // the eyepiece's face, pressed to his near eye
    const ANG = -0.6, D = [Math.cos(ANG), Math.sin(ANG)], N = [-D[1], D[0]];
    const LPt = (p, q, k) => [p[0] + (q[0] - p[0]) * k, p[1] + (q[1] - p[1]) * k];
    const at = (s, n = 0) => [E[0] + D[0] * s + N[0] * n, E[1] + D[1] * s + N[1] * n];
    const TUBE = 1500;
    const RAIL = 650, FLOOR = 900;
    const JS0 = at(1400);               // where Jupiter sits in the opening frame (off frame)
    const JS1 = [800, 450];             // … and after the tilt up the tube
    const RJ = 1.4;                     // Jupiter's radius in sky units (moons' orbits in radii)
    const MOON_A = [5.9, 9.4, 15.0, 26.4];

    // ── the camera ───────────────────────────────────────────────────────────────────────
    const LENS = [1040, 470], EYE_GAP = 670 / 54; // the macro's lens on screen; eye–lens gap ratio
    const ER = 13;                                  // the eyepiece's radius (roof units)
    // the roof camera: the eyepiece E lands at A, scaled by Zr
    function roofCam(t) {
        const f = macroScale(t);
        if (t < T.back[1]) {
            // coherent with the macro: E sits on its lens, the gap between eye and eyepiece the same
            const k = Ease.out(S(t, T.diss[1], T.back[1]));
            // the cut lands on the same moment: his eye just meeting the eyepiece, right of centre
            const z0 = 6, A0 = [1000, 440];
            return { Zr: Math.exp(L(Math.log(z0), 0, k)), A: [L(A0[0], E[0], k), L(A0[1], E[1], k)] };
        }
        const k = Ease.in(S(t, T.push[0], T.push[1]));
        return { Zr: Math.exp(Math.log(3.2) * k), A: [L(E[0], 800, k), L(E[1], 450, k)] };
    }
    function macroScale(t) { return 0.4; } // the cut on the beat lands on the roof's close-up of the same eye and eyepiece
    // the macro views: the lens on screen, the orbit round the eyepiece and the dolly in
    const LENS0 = [400, 450];
    function macroView(t) {
        if (t < T.macro) {
            const pan = 640 * IO(S(t, 0.25, 1.25));
            return { k: 0.36, dist: 600, flen: 600 * 15, c: [LENS0[0] + pan, LENS0[1] + 60], roll: -0.4, pan, eyeShift: 0, lean: 380 * IO(S(t, 1.05, 1.5)) }; // he leans in to the eyepiece
        }
        if (t >= T.orbit[1]) {
            // looking straight down the eyepiece: it keeps closing in with the field
            const fr = t < T.zoomB[0] ? 420 : L(420, 1700, Math.pow(S(t, T.zoomB[0], T.zoomB[1] - 0.4), 1.5));
            return { k: 1, dist: 600, flen: 600 * fr / 11, c: [800, 450], roll: 0, pan: 640, eyeShift: -1400, lean: 380, sc: fr / 11 };
        }
        const k = IO(S(t, T.orbit[0], T.orbit[1]));
        // turn from the opening's three-quarter view to straight down the axis, closing in so the
        // glass (radius 11) grows to the field's size
        const sc = Math.exp(L(Math.log(15), Math.log(420 / 11), Ease.in(S(t, T.orbit[0], T.orbit[1]))));
        return { k: L(0.36, 1, k), dist: 600, flen: 600 * sc, c: [L(1040, 800, k), L(510, 450, k)], roll: L(-0.4, 0, k), pan: 640, eyeShift: -1400 * Ease.in(k), lean: 380, sc };
    }
    // the sky seen through the telescope: centre, zoom, roll
    function skyCam(t) {
        const za = Math.log(3) + Math.log(10 / 3) * IO(S(t, T.field[0], T.field[1]));
        const zb = Math.log(1000 / 10) * Math.pow(S(t, T.zoomB[0], T.zoomB[1]), 1.35);
        return { base: [800, 450], Zs: Math.exp(za + zb), roll: -Math.PI / 2 * IO(S(t, T.roll[0], T.roll[1])) };
    }
    // the field of view: the glass's radius on screen, then opening to fill the frame
    function fieldR(t) {
        return t > T.field[0] ? 11 * macroView(t).sc : 0;
    }

    // ── the sky ──────────────────────────────────────────────────────────────────────────
    // the whole vault turns round the celestial pole (up and left, off frame) as the nights
    // pass: between two nights it sweeps, and Jupiter stays centred (the telescope follows it)
    const POLE = [-900, -1400];
    function nightF(t) { return T.nights.slice(1).reduce((n, tn) => n + IO(S(t, tn - T.glide, tn)), 0); }
    function sky(press, t, c) {
        ink(press, (g) => g.rect(-800, -800, 3200, 2500), { blue: 0.9 });
        ink(press, (g) => g.rect(-800, -800, 3200, 2500), { 'navy.s': (g) => Riso.ramp(g, 0, 0, 0, 900, 0.95, 0.62) });
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
        const sk = S(t, 2.65, 2.95);
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
                    put(press, circle(cx + ph * 70 + Math.sin(ph * 6 + k) * 6, cy - 44 - ph * 90, 5 + ph * 12), { 'blue.s': 0.2 * (1 - ph), 'yellow.s': 0.05 });
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

    // ── the telescope along the tube axis (s from the eyepiece), on a tripod ───────────────
    function telescope(press, t, turn) {
        const quad = (s0, s1, h0, h1, spec) => put(press, (g) => poly(g, [at(s0, -h0), at(s1, -h1), at(s1, h1), at(s0, h0)]), spec);
        const strip = (s0, s1, k0, k1, h0, h1, spec) => put(press, (g) => poly(g, [at(s0, h0 * k0), at(s1, h1 * k0), at(s1, h1 * k1), at(s0, h0 * k1)]), spec);
        // tripod: three legs from a brass head under the tube to the floor, one leg behind
        const hd = at(560, 34);
        for (const [fx, spec] of [[hd[0] + 160, WOOD_DK], [hd[0] - 150, WOOD], [hd[0] + 20, WOOD_LT]]) {
            line(press, [hd, [fx, FLOOR + 40]], (u) => 12 + 8 * u, spec);
            line(press, [LPt(hd, [fx, FLOOR + 40], 0.1), LPt(hd, [fx, FLOOR + 40], 0.95)], 3, WOOD_LT);
        }
        put(press, circle(hd[0], hd[1], 16), BRASS_SH);
        // the same 3D telescope as the macro, seen almost from the side (a sliver of the
        // eyepiece's face shows), nearly orthographic, rolled to the tube's angle
        Scope3D.draw(press, Scope3D.orbit(0.1, { dist: 20000, flen: 20000, c: E, roll: ANG, aim: 0 }), { turn, t });
    }

    // Galileo: the cast head on his gown, bent to the eyepiece; his right hand on the collar,
    // his left under the tube; breath steaming in the cold
    // a hand holding the tube from below at s: the palm under it, four fingers curling over
    // the top (drawn in front), the thumb along the near side
    function grip(press, s, h, far) {
        const sk = far ? SKIN_SH : SKIN, ln = { 'pink.s': 0.55, 'navy.s': 0.4 };
        put(press, (g) => smooth(g, [at(s - 26, h + 4), at(s + 26, h + 4), at(s + 30, h + 30), at(s + 10, h + 48), at(s - 22, h + 44), at(s - 32, h + 22)]), sk);
        for (let i = 0; i < 4; i++) {
            const x = s - 18 + i * 12;
            put(press, (g) => smooth(g, [at(x - 6, h + 6), at(x + 6, h + 6), at(x + 6, -h * 0.4), at(x + 4, -h - 2), at(x - 1, -h - 6), at(x - 6, -h * 0.4)]), i % 2 ? sk : SKIN_SH);
            if (i < 3) line(press, [at(x + 6, h + 4), at(x + 6, -h)], taper(2.2), ln);
        }
        line(press, [at(s - 30, h + 8), at(s + 4, h * 0.4), at(s + 26, h * 0.1)], taper(13, 0.1, 0.4), sk);
    }
    // a sleeve from the shoulder to the wrist through an elbow that hangs below (IK)
    function arm(press, sh, wr, len, far) {
        const [el] = Fig.ik(sh, wr, len, len * 0.92, [sh[0] - 40, sh[1] + 300], 1);
        line(press, [sh, el, wr], (u) => 74 - 24 * u + 8, RIM);
        line(press, [sh, el, wr], (u) => 74 - 24 * u, far ? { navy: 1, yellow: 1, pink: 0.8 } : COAT);
        if (!far) line(press, [[sh[0] + 16, sh[1] - 14], [el[0] + 18, el[1] - 20], [wr[0] - 10, wr[1] - 16]], taper(9), COAT_LIT);
        put(press, (g) => g.ellipse(wr[0], wr[1], 14, 18, -0.6, 0, 6.2832), { 'blue.s': 0.2, 'yellow.s': 0.15, 'navy.s': 0.15 });
    }
    // Galileo: the cast head on his gown, bent to the eyepiece; his right hand under the tube by
    // the collar, his left further along; breath steaming in the cold
    function galileo(press, t, turn) {
        const lean = 0.08 + 0.02 * Math.sin(t * 1.3);
        const blink = Math.max(0, 1 - Math.abs(t - 2.85) * 14);
        const br = Math.sin(t * 2.4) * 2;
        const rot = (q) => [H[0] + (q[0] * Math.cos(lean) - q[1] * Math.sin(lean)) * K, H[1] + (q[0] * Math.sin(lean) + q[1] * Math.cos(lean)) * K];
        // the far arm, then the body, then the near arm over it
        // the telescope is in front of his face: the eyepiece on his near eye, the tube passing
        // over the brow and nose, so it is drawn after the head
        const hF = at(380, 30);
        arm(press, rot([110, 140]), [hF[0] - 30, hF[1] + 30], 310, true);
        Ph.cam(press, H[0], H[1], K, () => {
            press.each((g) => g.rotate(lean));
            P().galileo(press, { noSeat: true, look: [1, -0.1], lidNear: Math.max(0.6, blink), lidFar: blink, breath: br });
        });
        telescope(press, t, turn);
        grip(press, 380, 25, true);
        const hN = at(175, 26); // along the tube, clear of his face
        arm(press, rot([10, 160]), [hN[0] - 30, hN[1] + 30], 300, false);
        grip(press, 175, 23, false);
        // breath: puffs from the mouth drifting up and right, thinning out
        const mouth = rot([70, 42]);
        // (one soft cloud per breath out, swelling and fading as it drifts)
        const ph = (t * 0.8) % 1, p = [mouth[0] + 20 + ph * 110, mouth[1] - ph * 40], rr = 16 + ph * 50;
        press.knockout((g) => { g.fillStyle = Riso.radial(g, p[0], p[1], 1, rr, 0.22 * Math.sin(ph * Math.PI), 0); g.beginPath(); g.ellipse(p[0], p[1], rr * 1.4, rr, -0.3, 0, 6.2832); g.fill(); });
    }

    // the macro: the room's bokeh far behind, his eye, the 3D telescope, dust in the air
    function macro(press, t) {
        const v = macroView(t), Pp = P(), TMv = Pp.TM, d = Math.round(t * 12);
        ink(press, (g) => g.rect(0, 0, 1600, 900), { blue: 0.9 });
        ink(press, (g) => g.rect(0, 0, 1600, 900), { 'navy.s': (g) => Riso.radial(g, 820, 420, 120, 1000, 0.5, 0.95) });
        const tt = Math.min(t, T.macro - 1 / 12);
        press.save(); press.each((g) => g.translate(v.pan * 0.45 + v.eyeShift * 0.3, 0)); Pp.bokeh(press, tt); press.restore();
        if (v.eyeShift > -1300) {
            const blink = Ease.bump(tt, TMv.blink, 0.25) + (t > T.macro ? Ease.bump(t, T.orbit[0] + 0.15, 0.25) : 0);
            press.save(); press.each((g) => g.translate(v.pan * 0.85 + v.eyeShift + v.lean, 0));
            Pp.eyeMacro(press, Pp.M.eye, { look: 0.55 + 0.25 * S(tt, 0.4, 1.0), lid: Math.min(1, blink), pupil: 1 + 0.18 * IO(S(tt, 1.1, 1.5)), brow: -8 * IO(S(tt, 1.0, 1.4)) });
            press.restore();
        }
        const sweep = t < T.macro ? L(-1.2, 0.1, IO(S(t, TMv.sweep[0], TMv.sweep[1]))) : null;
        const glow = t < T.macro ? Ease.out(S(t, 1.25, 1.5)) : 1 - S(t, T.orbit[0], T.orbit[0] + 0.3);
        Scope3D.draw(press, Scope3D.orbit(v.k, { dist: v.dist, flen: v.flen, c: v.c, roll: v.roll, aim: 0 }), { turn: t * 0.4, sweep, glow, t });
        // dust drifting in the air, nearest of all
        const r = Motion.rng('air-dust3d');
        for (let i = 0; i < 18; i++) {
            const x = r() * 1900 - 300 + v.pan * 1.25 + v.eyeShift * 1.3, y = r() * 900, s = 1.6 + r() * 2.6, ph = r() * 6.3;
            put(press, circle(x + Math.sin(t * 0.7 + ph) * 16, y - t * 10 + Math.cos(t * 0.9 + ph) * 8, s), { 'yellow.s': 0.3, 'blue.s': 0.1 });
        }
    }

    Seg.galileoRoof = {
        T,
        init() { return {}; },
        draw(press, tq, st) {
            const t = tq, nf = nightF(t);
            const inMacro = t < T.macro || (t >= T.push[1] && fieldR(t) < 1400);
            if (inMacro) macro(press, t);
            else if (t < T.push[1]) {
                // the roof: the whole scene, then the push towards the eyepiece
                const rc = roofCam(t);
                sky(press, t, { base: JS0, Zs: 1, roll: 0 }); // the stars stay put (at infinity)
                const turn = Math.sin(Math.max(0, t - 2.0) * 1.6) * 0.5 + 0.5;
                const zc = 1 + (rc.Zr - 1) * 0.5;
                Ph.cam(press, rc.A[0], rc.A[1], zc, () => { press.each((g) => g.translate(-E[0], -E[1])); city(press, t); });
                Ph.cam(press, rc.A[0], rc.A[1], rc.Zr, () => {
                    press.each((g) => g.translate(-E[0], -E[1]));
                    altana(press, t);
                    galileo(press, t, turn);
                });
                return;
            }
            // the view through the eyepiece: the glass becomes a disc of sky, then fills the frame
            // the sky opens in the glass from its centre (where the point of light was)
            const fr = fieldR(t) * Ease.out(S(t, T.field[0], T.field[0] + 0.25));
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
