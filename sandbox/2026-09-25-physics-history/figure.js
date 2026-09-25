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

    // the near (right) hand holding an apple up to look at it, as the scene shows it: Newton in
    // profile facing +x, palm up, so we see the hand's little-finger edge; the apple sits in the
    // palm, the fingers curl up round its front (the little finger nearest us, the others just
    // behind, their tips beyond the apple's edge), the thumb is on the far side, its tip showing
    // over the apple's top. Local frame: x along the forearm (from the elbow), y the palm's
    // normal pointing up. w: the wrist; dir: the forearm's angle; R: the apple's radius; world
    // units (a real hand: palm 2.6 R long, fingers 2 R). Returns the apple's centre.
    function holdApple(press, w, dir, f, R, spec, sh, held) {
        // x along the forearm (from the elbow), y towards the face (the palm's side): the apple
        // is held between the palm and his eyes
        const ux = Math.cos(dir), uy = Math.sin(dir);
        let nx = -uy, ny = ux;
        if (nx * f > 0) { nx = -nx; ny = -ny; } // towards the face (−x when facing +x)
        const X = (x, y) => [w[0] + (ux * x + nx * y) * R, w[1] + (uy * x + ny * y) * R];
        const lw = Math.max(1.6, R * 0.07), EDGE = { 'pink.s': 0.7, 'navy.s': 0.55 };
        const C = [1.5, 1.35];                                     // the apple, against the palm
        const onA = (t, r) => X(C[0] + Math.cos(t) * r, C[1] + Math.sin(t) * r);
        const arc = (t0, t1, r, n = 10) => Array.from({ length: n + 1 }, (_, i) => onA(t0 + (t1 - t0) * i / n, r));
        // t = 0 points along the forearm (beyond the apple), t = π/2 back to the palm, t = −π/2 … no:
        // here y grows towards the face, so t = +π/2 is the face's side, t = −π/2 the palm's
        const finger = (P, wd, spc, contour) => {
            line(press, P, wd * R, spc);
            const e = P[P.length - 1];
            put(press, circle(e[0], e[1], wd * R * 0.5), spc);
            if (contour) {
                const ol = Ph.outline(P, wd * R), h = ol.length / 2;
                line(press, ol.slice(0, h), taper(lw, 0.1, 0.1), EDGE, { knock: false });
                // the round of the tip, where it lies on the apple
                const tp = P[P.length - 1], pv = P[P.length - 2], an = Math.atan2(tp[1] - pv[1], tp[0] - pv[0]), rr = wd * R * 0.5;
                line(press, Array.from({ length: 7 }, (_, i) => { const aa = an - Math.PI / 2 + (i / 6) * Math.PI; return [tp[0] + Math.cos(aa) * rr, tp[1] + Math.sin(aa) * rr]; }), lw, EDGE, { knock: false });
            }
        };
        // behind the apple: the thumb from the heel round its lower far side, the tip on its
        // face-side bottom; the ring, middle and index fingers over its top, their tips on the
        // face side (each a little longer and further back than the one before)
        finger([X(0.35, 0.3), X(0.4, 0.95), onA(2.3, 1.02)], 0.52, sh, false);
        for (const [r, t1, wd] of [[1.18, 1.45, 0.4], [1.2, 1.2, 0.42], [1.18, 0.9, 0.4]]) finger(arc(-0.95, t1, r), wd, spec, true);
        held(press, X(C[0], C[1]));
        // the palm's little-finger edge, from the wrist to the knuckles, against the apple
        const PALM = [X(-0.25, -0.35), X(0.5, -0.45), X(1.5, -0.42), X(2.25, -0.32), X(2.45, 0.05), X(2.2, 0.3), X(1.4, 0.36), X(0.5, 0.3), X(-0.25, 0.3)];
        put(press, (g) => smooth(g, PALM), spec);
        press.save(); press.clip((g) => smooth(g, PALM));
        Ph.ink(press, (g) => smooth(g, [X(-0.4, -0.6), X(2.6, -0.6), X(2.6, -0.2), X(-0.4, -0.2)]), { 'pink.s': 0.22 });
        press.restore();
        line(press, Ph.sample([X(-0.25, -0.35), X(0.5, -0.45), X(1.5, -0.42), X(2.25, -0.32)], false, 6), taper(lw, 0.1, 0.1), EDGE, { knock: false });
        // the little finger, nearest us: from its knuckle at the palm's end over the apple's top
        finger(arc(-1.0, 0.6, 1.16), 0.38, spec, true);
        const k = onA(-0.35, 1.16), k2 = onA(-0.35, 1.16 + 0.2);
        line(press, [onA(-0.35, 0.98), k2], taper(lw * 0.8), EDGE, { knock: false });
        return X(C[0], C[1]);
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
            if (grip === 'apple' && !far && o.held) held = holdApple(press, wr, cd, f, o.heldR ?? 30, SKIN, SKIN_SH, o.held);
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
