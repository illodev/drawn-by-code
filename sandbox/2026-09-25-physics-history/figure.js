// Full-body figures for physics-history, drawn as riso separations. A pose is a handful of
// targets (pelvis, chest, head, hands, ankles); elbows and knees come from two-bone IK with
// fixed lengths, so limbs never stretch. Proportions follow a 7.5-head figure with an
// upright spine: the head sits over the shoulders, the back is a straight line from the
// neck to the pelvis (no hunch). Global: Fig.
//
//   Fig.pose(keys, t)                 keys: [[t, pose], …] → the pose at t (eased per key)
//   Fig.newton(press, pose, o)        Newton in coat, waistcoat, breeches, stockings, shoes
//
// Pose (local units, y down, feet on the ground line): { u, P, C, H, tilt, hN, hF, fN, fF,
// toeN, toeF, gripN, gripF, face }. N = the near side (the figure's right when facing
// right), F = far. gripX: 0 open hand … 1 fist, or 'apple' (holding something round).
const Fig = (() => {
    const { put, line, smooth, poly, taper, circle, ellipse } = Ph;
    const L = (a, b, t) => a + (b - a) * t;
    const LP = (p, q, t) => [L(p[0], q[0], t), L(p[1], q[1], t)];
    const add = (p, dx, dy) => [p[0] + dx, p[1] + dy];

    function pose(keys, t) {
        let i = 0;
        while (i < keys.length - 2 && t >= keys[i + 1][0]) i++;
        const [t0, a] = keys[i], [t1, b] = keys[Math.min(i + 1, keys.length - 1)];
        const k = t1 > t0 ? Ease.inOut(Math.max(0, Math.min(1, (t - t0) / (t1 - t0)))) : 0;
        const out = {};
        for (const key of Object.keys(a)) {
            const va = a[key], vb = b[key] ?? va;
            out[key] = Array.isArray(va) ? LP(va, vb, k) : typeof va === 'number' && typeof vb === 'number' ? L(va, vb, k) : k < 0.5 ? va : vb;
        }
        return out;
    }
    // two-bone IK; pick: 'fwd' | 'back' | 'up' | 'down' chooses between the two solutions
    function ik(s, w, a, b, pick, face = 1) {
        const dx = w[0] - s[0], dy = w[1] - s[1], d = Math.min(Math.hypot(dx, dy), a + b - 0.01);
        const ang = Math.atan2(dy, dx), c = Math.acos(Math.max(-1, Math.min(1, (a * a + d * d - b * b) / (2 * a * d))));
        const e1 = [s[0] + Math.cos(ang + c) * a, s[1] + Math.sin(ang + c) * a], e2 = [s[0] + Math.cos(ang - c) * a, s[1] + Math.sin(ang - c) * a];
        // pick: a keyword, or a pole point (the joint goes to the solution nearer to it, so a
        // pole that moves smoothly makes the joint move smoothly: no flip between keys)
        const score = Array.isArray(pick) ? (e) => -Math.hypot(e[0] - pick[0], e[1] - pick[1]) : (e) => (pick === 'fwd' ? e[0] * face : pick === 'back' ? -e[0] * face : pick === 'up' ? -e[1] : e[1]);
        const e = score(e1) >= score(e2) ? e1 : e2;
        // clamp the wrist to reach
        const wr = [s[0] + Math.cos(ang) * d, s[1] + Math.sin(ang) * d];
        const r = Math.hypot(w[0] - s[0], w[1] - s[1]) > a + b ? [e[0] + (wr[0] - e[0]) * (b / Math.hypot(wr[0] - e[0], wr[1] - e[1])), e[1] + (wr[1] - e[1]) * (b / Math.hypot(wr[0] - e[0], wr[1] - e[1]))] : w;
        return [e, r];
    }
    // a limb segment: a filled capsule between two points, widths at each end
    function seg(press, a, b, wa, wb, spec) {
        line(press, [a, LP(a, b, 0.5), b], (u) => L(wa, wb, u), spec);
        put(press, circle(a[0], a[1], wa / 2), spec);
        put(press, circle(b[0], b[1], wb / 2), spec);
    }
    // a hand at the wrist w pointing along dir (radians); grip 0 open … 1 fist; s = size
    function hand(press, w, dir, grip, s, spec, sh, lineSpec, face = 1) {
        const R = (x, y) => [w[0] + Math.cos(dir) * x - Math.sin(dir) * y * face, w[1] + Math.sin(dir) * x + Math.cos(dir) * y * face];
        const g = typeof grip === 'number' ? grip : 0.55;
        // palm
        put(press, (c) => smooth(c, [R(-0.05 * s, -0.22 * s), R(0.45 * s, -0.26 * s), R(0.62 * s, -0.05 * s), R(0.6 * s, 0.2 * s), R(0.3 * s, 0.3 * s), R(0, 0.22 * s)]), spec);
        // four fingers: straight when open, curled towards the palm when gripping
        for (let i = 0; i < 4; i++) {
            const y = (-0.2 + i * 0.13) * s, len = (0.5 - Math.abs(i - 1.3) * 0.06) * s;
            const k1 = R(0.55 * s, y), bend = g * 1.9;
            const k2 = [k1[0] + Math.cos(dir + bend * face * 0.55) * len * 0.5, k1[1] + Math.sin(dir + bend * face * 0.55) * len * 0.5];
            const k3 = [k2[0] + Math.cos(dir + bend * face) * len * 0.45, k2[1] + Math.sin(dir + bend * face) * len * 0.45];
            line(press, [k1, k2, k3], taper(0.15 * s, 0.05, 0.35), i === 0 ? spec : sh);
        }
        // thumb: out to the side, closing over the fingers when gripping
        const t0 = R(0.12 * s, -0.24 * s), t1 = R((0.35 + g * 0.15) * s, (-0.5 + g * 0.3) * s), t2 = R((0.52 + g * 0.1) * s, (-0.52 + g * 0.42) * s);
        line(press, [t0, t1, t2], taper(0.17 * s, 0.1, 0.4), spec);
        line(press, [R(0.18 * s, -0.12 * s), R(0.5 * s, -0.12 * s)], taper(0.03 * s), lineSpec);
    }

    // a right hand holding an apple up to look at it, traced from a reference line drawing of a
    // right hand holding an apple (Alamy 2D4HPAD, measured in units of the apple's radius): the
    // palm is behind the apple; the index and middle fingers cross its lower front with their
    // backs and nails to us, the ring and little fingers curl under it, the thumb is hidden
    // behind it; the heel and the wrist go down and back (towards the elbow, forward of him).
    // c: the apple's centre; R: its radius; f: the way he faces (the drawing mirrors for
    // f = -1, which is then his left hand). held(press, c) draws the apple (before the hand).
    const APPLE_HAND = {
        body: [[-1.52, 0.78], [-1.37, 1.63], [-1.07, 2.04], [0.11, 2.48], [1.37, 3.04], [2.11, 2.48], [1.52, 1.48], [0.96, 0.44], [0.63, 1.0], [-0.37, 1.0], [-0.93, 0.85]],
        // [centre line, width, nail]: little, ring (curled under), middle, index (front)
        fingers: [
            [[[0.0, 1.5], [0.45, 1.48], [0.7, 1.7]], 0.27, false],
            [[[-0.2, 1.12], [0.35, 1.02], [0.72, 1.25]], 0.31, false],
            [[[-0.6, 1.1], [-0.2, 0.66], [0.36, 0.42]], 0.34, true],
            [[[-1.28, 0.76], [-0.9, 0.24], [-0.38, -0.1]], 0.34, true],
        ],
    };
    function holdApple(press, c, R, f, spec, sh, held) {
        const X = ([x, y]) => [c[0] + x * R * f, c[1] + y * R];
        held(press, c);
        const body = APPLE_HAND.body.map(X);
        put(press, (g) => smooth(g, body), spec);
        // the back of the hand turns away towards the little finger's side and the wrist
        // a soft shade along the little finger's edge of the hand (the side turned from the light)
        press.save(); press.clip((g) => smooth(g, body));
        const e0 = X([1.9, 1.6]), e1 = X([1.2, 1.2]);
        Ph.ink(press, (g) => g.rect(c[0] - 4 * R, c[1] - 2 * R, 8 * R, 7 * R), { 'pink.s': (g) => Riso.ramp(g, e0[0], e0[1], e1[0], e1[1], 0.3, 0) });
        press.restore();
        for (const [pts, w, nail] of APPLE_HAND.fingers) {
            const P = Ph.sample(pts.map(X), false, 6), wd = w * R;
            line(press, P, wd, spec);
            put(press, circle(P[0][0], P[0][1], wd * 0.5), spec);
            const tip = P[P.length - 1], pv = P[P.length - 4], an = Math.atan2(tip[1] - pv[1], tip[0] - pv[0]);
            put(press, circle(tip[0], tip[1], wd * 0.5), spec);
            // the finger's contour: both sides and the round of the tip, as one thin line (the
            // lines between the fingers, as in the reference); its base runs into the hand
            const ol = Ph.outline(P, wd), nH = ol.length / 2;
            const sideA = ol.slice(3, nH), sideB = ol.slice(nH, ol.length - 3);
            const tipArc = Array.from({ length: 9 }, (_, i) => { const aa = an - Math.PI / 2 + (i / 8) * Math.PI; return [tip[0] + Math.cos(aa) * wd * 0.5, tip[1] + Math.sin(aa) * wd * 0.5]; });
            const lw = Math.max(1, R * 0.028);
            line(press, sideA, taper(lw, 0.3, 0.02), LINE, { knock: false });
            line(press, tipArc, lw, LINE, { knock: false });
            line(press, sideB, taper(lw, 0.02, 0.3), LINE, { knock: false });
            // the middle joint's crease across the back
            const m = P[Math.floor(P.length * 0.5)], m2 = P[Math.floor(P.length * 0.5) + 1], a2 = Math.atan2(m2[1] - m[1], m2[0] - m[0]);
            line(press, [[m[0] - Math.sin(a2) * wd * 0.25, m[1] + Math.cos(a2) * wd * 0.25], [m[0] + Math.cos(a2) * 1.5, m[1] + Math.sin(a2) * 1.5], [m[0] + Math.sin(a2) * wd * 0.25, m[1] - Math.cos(a2) * wd * 0.25]], taper(Math.max(0.8, R * 0.025)), LINE, { knock: false });
            if (nail) { const nc = [tip[0] - Math.cos(an) * wd * 0.1, tip[1] - Math.sin(an) * wd * 0.1]; put(press, ellipse(nc[0], nc[1], wd * 0.3, wd * 0.24, an), { 'pink.s': 0.22, 'yellow.s': 0.06 }); line(press, Array.from({ length: 9 }, (_, i) => { const aa = an + Math.PI / 2 + (i / 8) * Math.PI; return [nc[0] + Math.cos(aa) * wd * 0.3 * Math.abs(Math.cos(aa - an)) + Math.cos(aa) * 0, nc[1] + Math.sin(aa) * wd * 0.24]; }), taper(lw * 0.8), LINE, { knock: false }); }
        }
        // the knuckles: a few light bumps along the hand's upper edge
        for (const q of [[-1.25, 0.85], [-0.62, 1.12]]) { const p = X(q); press.knockout(ellipse(p[0], p[1], R * 0.12, R * 0.07, 0)); }
    }

    // ── Newton ───────────────────────────────────────────────────────────────────────────
    const COAT = { navy: 1, yellow: 1, 'pink.s': 0.55 };
    const COAT_FAR = { navy: 1, yellow: 1, pink: 0.8 };
    const COAT_LIT = { navy: 1, 'yellow.s': 0.6, 'pink.s': 0.45, 'blue.s': 0.25 };
    const CUFF = { navy: 1, 'yellow.s': 0.7, 'pink.s': 0.45, 'blue.s': 0.3 }; // the coat's cloth, turned back (lighter)
    const VEST = { 'yellow.s': 0.75, 'pink.s': 0.5, 'navy.s': 0.3 };
    const STOCK = { 'blue.s': 0.2, 'navy.s': 0.08 };
    const STOCK_FAR = { 'blue.s': 0.45, 'navy.s': 0.3 };
    const SHOE = { navy: 1, yellow: 0.9, 'pink.s': 0.4 };
    const SKIN = { 'yellow.s': 0.12, 'pink.s': 0.07 };
    const SKIN_SH = { 'yellow.s': 0.3, 'pink.s': 0.36, 'navy.s': 0.06 };
    const LINE = { 'pink.s': 0.55, 'navy.s': 0.4 };
    const LINEN = { 'blue.s': 0.05, 'yellow.s': 0.05 };

    function newton(press, p, o = {}) {
        const u = p.u, f = p.face ?? 1;
        let held = null;
        const UA = 1.45 * u, FA = 1.25 * u, TH = 1.95 * u, SH = 1.95 * u;
        const shN = add(p.C, -0.12 * u * f, 0.06 * u), shF = add(p.C, 0.22 * u * f, -0.04 * u);
        const hipN = add(p.P, 0.1 * u * f, 0), hipF = add(p.P, -0.1 * u * f, -0.04 * u);
        // poles are offsets from the shoulder / hip (p.poleN, p.poleF, p.kneeN, p.kneeF)
        const pole = (o, base, kw) => (o ? [base[0] + o[0] * f, base[1] + o[1]] : kw);
        const [elF, wrF] = ik(shF, p.hF, UA, FA, pole(p.poleF, shF, p.elbowF ?? 'back'), f);
        const [elN, wrN] = ik(shN, p.hN, UA, FA, pole(p.poleN, shN, p.elbowN ?? 'back'), f);
        const [knF, anF] = ik(hipF, p.fF, TH, SH, pole(p.kneeF, hipF, 'fwd'), f);
        const [knN, anN] = ik(hipN, p.fN, TH, SH, pole(p.kneeN, hipN, 'fwd'), f);
        const dirOf = (a, b) => Math.atan2(b[1] - a[1], b[0] - a[0]);
        const shoe = (an, toe, spec) => {
            const d = f * (toe ?? 0);
            const R = (x, y) => [an[0] + (Math.cos(d) * x - Math.sin(d) * y) * f, an[1] + Math.sin(d) * x * f + Math.cos(d) * y];
            put(press, (g) => smooth(g, [R(-0.2 * u, -0.12 * u), R(0.2 * u, -0.16 * u), R(0.62 * u, -0.02 * u), R(0.66 * u, 0.1 * u), R(-0.18 * u, 0.1 * u)]), spec);
            put(press, (g) => poly(g, [R(0.12 * u, -0.14 * u), R(0.3 * u, -0.12 * u), R(0.3 * u, -0.02 * u), R(0.12 * u, -0.04 * u)]), { yellow: 1, 'pink.s': 0.25 });
        };
        const leg = (hip, kn, an, far, toe) => {
            // breeches to the knee (buckled band), stocking below, shoe
            seg(press, kn, an, 0.38 * u, 0.24 * u, far ? STOCK_FAR : STOCK);
            // the calf's curve at the back of the shin
            const cb = LP(kn, an, 0.3), dirK = Math.atan2(an[1] - kn[1], an[0] - kn[0]);
            put(press, (g) => { g.beginPath(); g.ellipse(cb[0] - Math.sin(dirK) * 0.06 * u * -f, cb[1] + Math.cos(dirK) * 0.06 * u * -f, 0.45 * u, 0.22 * u, dirK, 0, Math.PI * 2); }, far ? STOCK_FAR : STOCK);
            line(press, [LP(kn, an, 0.2), LP(kn, an, 0.95)], taper(0.04 * u), { 'navy.s': 0.35 });
            seg(press, hip, kn, 0.62 * u, 0.42 * u, far ? COAT_FAR : COAT);
            put(press, circle(kn[0], kn[1], 0.22 * u), far ? COAT_FAR : COAT);
            put(press, circle(kn[0] + 0.12 * u * f, kn[1] + 0.05 * u, 0.05 * u), { yellow: 1 });
            shoe(an, toe, SHOE);
        };
        const arm = (sh, el, wr, far, grip) => {
            const spec = far ? COAT_FAR : COAT;
            seg(press, sh, el, 0.5 * u, 0.42 * u, spec);
            seg(press, el, wr, 0.42 * u, 0.4 * u, spec);
            if (!far) line(press, [LP(sh, el, 0.15), el, LP(el, wr, 0.6)], taper(0.08 * u), COAT_LIT);
            // the wide turned-back cuff, the shirt's ruffle, the hand
            const cd = dirOf(el, wr), cx = LP(el, wr, 0.78);
            put(press, (g) => { g.beginPath(); g.ellipse(cx[0], cx[1], 0.2 * u, 0.26 * u, cd, 0, Math.PI * 2); }, far ? COAT_FAR : CUFF);
            line(press, [add(cx, -Math.sin(cd) * 0.24 * u, Math.cos(cd) * 0.24 * u), add(cx, Math.sin(cd) * 0.24 * u, -Math.cos(cd) * 0.24 * u)], 0.04 * u, { yellow: 1, 'pink.s': 0.3 });
            put(press, circle(wr[0], wr[1], 0.16 * u), LINEN);
            if (grip === 'apple' && !far && o.held) { const R = o.heldR ?? 30; held = [wr[0] - 1.4 * R * f, wr[1] - 2.9 * R]; holdApple(press, held, R, f, SKIN, SKIN_SH, o.held); }
            else hand(press, add(wr, Math.cos(cd) * 0.08 * u, Math.sin(cd) * 0.08 * u), cd, grip, 0.62 * u, far ? SKIN_SH : SKIN, SKIN_SH, LINE, f);
        };
        // far arm and far leg first
        arm(shF, elF, wrF, true, p.gripF ?? 0.3);
        leg(hipF, knF, anF, true, p.toeF);
        // the body: a straight back from the neck to the waist, a chest a little forward, a
        // narrow waist; the coat's skirt flares from the waist to the knees in an A with folds
        // torso offsets are in the body's frame: x across the body, y along the spine, so a
        // leaning figure keeps its chest, waistcoat and seams where they belong
        const spAng = Math.atan2(p.C[0] - p.P[0], p.P[1] - p.C[1]), ca = Math.cos(spAng), sa = Math.sin(spAng);
        const tb = (q, dx, dy) => [q[0] + dx * ca - dy * sa, q[1] + dx * sa + dy * ca];
        // the coat's skirt hangs from the waist by gravity: standing it falls to the knees,
        // bending or squatting it still hangs down (behind the thighs), never along them
        const back = -f;
        const waistB = tb(p.P, back * 0.48 * u, -0.35 * u), waistF = tb(p.P, -back * 0.42 * u, -0.35 * u);
        const ground = Math.max(anN[1], anF[1]);
        const hemY = Math.min(waistB[1] + 2.05 * u, ground - 0.25 * u);
        const skirtB = [waistB[0] + back * 0.35 * u, hemY];
        const frontX = waistF[0] - back * 0.1 * u;
        const skirt = [waistB, add(LP(waistB, skirtB, 0.5), back * 0.12 * u, 0), skirtB, [L(skirtB[0], frontX, 0.5), hemY + 0.06 * u], [frontX, hemY - 0.1 * u], LP(waistF, [frontX, hemY], 0.45), waistF];
        put(press, (g) => smooth(g, skirt), COAT_FAR);
        for (let i = 1; i < 4; i++) line(press, [LP(waistB, waistF, i / 4), LP(skirtB, [frontX, hemY - 0.1 * u], i / 4)], taper(0.05 * u, 0.3, 0.1), { navy: 1, pink: 0.9, yellow: 1 });
        const neckB = tb(p.C, back * 0.2 * u, -0.3 * u), neckF = tb(p.C, -back * 0.16 * u, -0.32 * u);
        const torso = [neckB, tb(p.C, back * 0.5 * u, -0.05 * u), tb(p.C, back * 0.52 * u, 0.6 * u), waistB, tb(p.P, back * 0.45 * u, 0.15 * u), tb(p.P, -back * 0.38 * u, 0.15 * u), waistF, tb(p.C, -back * 0.52 * u, 0.7 * u), tb(p.C, -back * 0.5 * u, 0.2 * u), neckF];
        put(press, (g) => smooth(g, torso), COAT);
        // waistcoat showing in the coat's opening, with buttons
        const vt = tb(p.C, -back * 0.22 * u, -0.1 * u), vb = tb(p.P, -back * 0.3 * u, 0.05 * u);
        put(press, (g) => smooth(g, [vt, tb(vt, -back * 0.26 * u, 0.12 * u), tb(vb, -back * 0.08 * u, 0), tb(vb, back * 0.14 * u, 0.02 * u), tb(vt, back * 0.08 * u, 0.25 * u)]), VEST);
        for (let i = 0; i < 6; i++) {
            const q = LP(tb(vt, -back * 0.06 * u, 0.22 * u), tb(vb, back * 0.0 * u, -0.12 * u), i / 5);
            put(press, circle(q[0], q[1], 0.045 * u), { yellow: 1, 'pink.s': 0.3, 'navy.s': 0.2 });
        }
        // the coat's front edge and a pocket flap
        line(press, [tb(p.C, -back * 0.16 * u, 0.1 * u), tb(p.P, -back * 0.12 * u, 0.05 * u)], taper(0.05 * u), { navy: 1, 'pink.s': 0.6 });
        line(press, [tb(p.P, back * 0.1 * u, 0.02 * u), tb(p.P, -back * 0.36 * u, 0.02 * u)], taper(0.07 * u), COAT_LIT);
        // near leg, then the coat's front skirt panel over the near thigh
        leg(hipN, knN, anN, false, p.toeN);
        // the front of the coat over the near hip, a short panel (the skirt hangs behind)
        put(press, (g) => smooth(g, [waistF, tb(waistF, back * 0.3 * u, 0.05 * u), add(LP(hipN, knN, 0.35), back * 0.1 * u, 0), add(LP(hipN, knN, 0.4), -back * 0.25 * u, 0.05 * u), tb(waistF, -back * 0.1 * u, 0.3 * u)]), COAT);
        // head (the cast's Newton head at 165 cast units per head unit: a touch large, as in
        // illustration, so the face reads)
        Ph.cam(press, p.H[0], p.H[1], u / 150, () => {
            press.each((g) => { g.rotate(p.tilt ?? 0); if (f < 0) g.scale(-1, 1); });
            Cast.newton(press, { headOnly: true, look: p.look ?? [1, 0.2], shut: p.shut, brow: p.brow });
        });
        // near arm last (it crosses in front)
        arm(shN, elN, wrN, false, p.gripN ?? 0.3);
        return { wrN, wrF, elN, knN, anN, H: p.H, held };
    }

    // ── smooth choreography ──────────────────────────────────────────────────────────────
    // A track is [[t, value], …] (numbers or points). Values pass through every key with a
    // continuous velocity (Hermite, tangents from the neighbours: Catmull-Rom on uneven
    // times), so motion flows through keys instead of stopping dead at each one. A key
    // written twice in a row ([t, v], [t2, v]) is a hold.
    function track(keys, t) {
        const n = keys.length;
        if (t <= keys[0][0]) return keys[0][1];
        if (t >= keys[n - 1][0]) return keys[n - 1][1];
        let i = 0;
        while (t >= keys[i + 1][0]) i++;
        const [t0, a] = keys[i], [t1, b] = keys[i + 1], h = t1 - t0, k = (t - t0) / h;
        if (typeof a !== 'number' && !Array.isArray(a)) return a; // flags and grips step
        const prev = keys[Math.max(0, i - 1)], next = keys[Math.min(n - 1, i + 2)];
        const same = (x, y) => (Array.isArray(x) ? x[0] === y[0] && x[1] === y[1] : x === y);
        const tan = (pk, qk, v0, v1) => {
            if (same(v0, v1)) return Array.isArray(v0) ? v0.map(() => 0) : 0; // holds stay still
            const dt = qk[0] - pk[0] || 1;
            return Array.isArray(v0) ? v0.map((_, j) => (qk[1][j] - pk[1][j]) / dt) : (qk[1] - pk[1]) / dt;
        };
        const m0 = same(a, b) ? tan(keys[i], keys[i], a, a) : same(prev[1], a) ? tan(keys[i], keys[i], a, a) : tan(prev, keys[i + 1], a, b);
        const m1 = same(a, b) ? m0 : same(b, next[1]) ? tan(keys[i], keys[i], a, a) : tan(keys[i], next, a, b);
        const k2 = k * k, k3 = k2 * k, h00 = 2 * k3 - 3 * k2 + 1, h10 = k3 - 2 * k2 + k, h01 = -2 * k3 + 3 * k2, h11 = k3 - k2;
        const f = (p0, p1, v0, v1) => h00 * p0 + h10 * h * v0 + h01 * p1 + h11 * h * v1;
        return Array.isArray(a) ? a.map((_, j) => f(a[j], b[j], m0[j], m1[j])) : f(a, b, m0, m1);
    }
    // feet: planted between steps; a step lifts the foot on an arc and sets it down
    function foot(steps, x0, t, ground) {
        let x = x0, y = ground, toe = 0;
        for (const [a, b, xa, xb, lift] of steps) {
            if (t >= b) { x = xb; continue; }
            if (t > a) { const k = Ease.inOut((t - a) / (b - a)); x = L(xa, xb, k); y = ground - lift * Math.sin(Math.PI * k); toe = lift ? -0.25 * Math.sin(Math.PI * k) : 0; }
            break;
        }
        return { p: [x, y], toe };
    }
    // a pose from channels: the torso keeps its length (pelvis → chest along the spine angle,
    // chest → head along the spine plus the neck), so the body never stretches
    function build(ch, t, u, extra = {}) {
        const P = track(ch.P, t), sp = track(ch.sp, t), nk = track(ch.nk, t);
        const C = [P[0] + Math.sin(sp) * 2.4 * u, P[1] - Math.cos(sp) * 2.4 * u];
        const H = [C[0] + Math.sin(sp + nk) * 0.85 * u, C[1] - Math.cos(sp + nk) * 0.85 * u];
        const out = { u, P, C, H, tilt: sp * 0.6 + nk };
        for (const k of Object.keys(ch)) if (!['P', 'sp', 'nk'].includes(k)) out[k] = typeof ch[k] === 'function' ? ch[k](t) : track(ch[k], t);
        return { ...out, ...extra };
    }

    return { pose, ik, seg, hand, holdApple, newton, track, foot, build };
})();
