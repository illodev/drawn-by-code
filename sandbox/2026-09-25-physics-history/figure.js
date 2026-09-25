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
        const score = (e) => (pick === 'fwd' ? e[0] * face : pick === 'back' ? -e[0] * face : pick === 'up' ? -e[1] : e[1]);
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
        const UA = 1.45 * u, FA = 1.25 * u, TH = 1.95 * u, SH = 1.95 * u;
        const shN = add(p.C, -0.12 * u * f, 0.06 * u), shF = add(p.C, 0.22 * u * f, -0.04 * u);
        const hipN = add(p.P, 0.1 * u * f, 0), hipF = add(p.P, -0.1 * u * f, -0.04 * u);
        const [elF, wrF] = ik(shF, p.hF, UA, FA, p.elbowF ?? 'back', f);
        const [elN, wrN] = ik(shN, p.hN, UA, FA, p.elbowN ?? 'back', f);
        const [knF, anF] = ik(hipF, p.fF, TH, SH, 'fwd', f);
        const [knN, anN] = ik(hipN, p.fN, TH, SH, 'fwd', f);
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
            hand(press, add(wr, Math.cos(cd) * 0.08 * u, Math.sin(cd) * 0.08 * u), cd, grip, 0.62 * u, far ? SKIN_SH : SKIN, SKIN_SH, LINE, f);
        };
        // far arm and far leg first
        arm(shF, elF, wrF, true, p.gripF ?? 0.3);
        leg(hipF, knF, anF, true, p.toeF);
        // the body: a straight back from the neck to the waist, a chest a little forward, a
        // narrow waist; the coat's skirt flares from the waist to the knees in an A with folds
        const back = -f, kneeY = (knN[1] + knF[1]) / 2, hemY = kneeY + 0.1 * u;
        const waistB = add(p.P, back * 0.48 * u, -0.35 * u), waistF = add(p.P, -back * 0.42 * u, -0.35 * u);
        const skirtB = [Math.min(p.P[0] + back * 0.75 * u, Math.min(knN[0], knF[0]) - 0.1 * u) * (f > 0 ? 1 : 0) + Math.max(p.P[0] + back * 0.75 * u, Math.max(knN[0], knF[0]) + 0.1 * u) * (f > 0 ? 0 : 1), hemY];
        const frontX = f > 0 ? Math.max(knN[0], knF[0]) + 0.2 * u : Math.min(knN[0], knF[0]) - 0.2 * u;
        const skirt = [waistB, LP(waistB, skirtB, 0.5), skirtB, [L(skirtB[0], frontX, 0.5), hemY + 0.06 * u], [frontX, hemY - 0.02 * u], LP(waistF, [frontX, hemY], 0.45), waistF];
        put(press, (g) => smooth(g, skirt), COAT_FAR);
        for (let i = 1; i < 4; i++) line(press, [LP(waistB, waistF, i / 4), [L(skirtB[0], frontX, i / 4), hemY]], taper(0.05 * u, 0.3, 0.1), { navy: 1, pink: 0.9, yellow: 1 });
        const neckB = add(p.C, back * 0.2 * u, -0.3 * u), neckF = add(p.C, -back * 0.16 * u, -0.32 * u);
        const torso = [neckB, add(p.C, back * 0.5 * u, -0.05 * u), add(p.C, back * 0.52 * u, 0.6 * u), waistB, add(p.P, back * 0.45 * u, 0.15 * u), add(p.P, -back * 0.38 * u, 0.15 * u), waistF, add(p.C, -back * 0.52 * u, 0.7 * u), add(p.C, -back * 0.5 * u, 0.2 * u), neckF];
        put(press, (g) => smooth(g, torso), COAT);
        // waistcoat showing in the coat's opening, with buttons
        const vt = add(p.C, -back * 0.22 * u, -0.1 * u), vb = add(p.P, -back * 0.3 * u, 0.05 * u);
        put(press, (g) => smooth(g, [vt, add(vt, -back * 0.26 * u, 0.12 * u), add(vb, -back * 0.08 * u, 0), add(vb, back * 0.14 * u, 0.02 * u), add(vt, back * 0.08 * u, 0.25 * u)]), VEST);
        for (let i = 0; i < 6; i++) {
            const q = LP(add(vt, -back * 0.06 * u, 0.22 * u), add(vb, back * 0.0 * u, -0.12 * u), i / 5);
            put(press, circle(q[0], q[1], 0.045 * u), { yellow: 1, 'pink.s': 0.3, 'navy.s': 0.2 });
        }
        // the coat's front edge and a pocket flap
        line(press, [add(p.C, -back * 0.16 * u, 0.1 * u), add(p.P, -back * 0.12 * u, 0.05 * u)], taper(0.05 * u), { navy: 1, 'pink.s': 0.6 });
        line(press, [add(p.P, back * 0.1 * u, 0.02 * u), add(p.P, -back * 0.36 * u, 0.02 * u)], taper(0.07 * u), COAT_LIT);
        line(press, [add(p.C, back * 0.45 * u, 0.1 * u), add(p.P, back * 0.4 * u, -0.1 * u)], taper(0.06 * u), COAT_LIT);
        // near leg, then the coat's front skirt panel over the near thigh
        leg(hipN, knN, anN, false, p.toeN);
        put(press, (g) => smooth(g, [waistF, add(waistF, back * 0.3 * u, 0.05 * u), add(LP(hipN, knN, 0.85), back * 0.1 * u, 0), add(LP(hipN, knN, 0.88), -back * 0.3 * u, 0.05 * u), add(waistF, -back * 0.1 * u, 0.3 * u)]), COAT);
        line(press, [add(waistF, -back * 0.02 * u, 0.1 * u), add(LP(hipN, knN, 0.85), -back * 0.24 * u, 0)], taper(0.05 * u), COAT_LIT);
        // head (the cast's Newton head at 165 cast units per head unit: a touch large, as in
        // illustration, so the face reads)
        Ph.cam(press, p.H[0], p.H[1], u / 150, () => {
            press.each((g) => { g.rotate(p.tilt ?? 0); if (f < 0) g.scale(-1, 1); });
            Cast.newton(press, { headOnly: true, look: p.look ?? [1, 0.2], shut: p.shut, brow: p.brow });
        });
        // near arm last (it crosses in front)
        arm(shN, elN, wrN, false, p.gripN ?? 0.3);
        return { wrN, wrF, elN, knN, anN, H: p.H };
    }

    return { pose, ik, seg, hand, newton };
})();
