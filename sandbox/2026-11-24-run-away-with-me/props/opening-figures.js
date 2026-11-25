// The opening's people: drawn silhouettes in the film's ink (dark violet bodies, no faces)
// with a cyan rim on one side and a magenta one on the other, the way the user's synthwave
// references light people. They are billboards at a world point (feet), scaled by the camera.
// They dance by changes of drawing (a pose held until the next beat), never by sliding, and
// walk with a four-drawing cycle on twos. Only the two leads have faces (Couple, their sheets).
// Global: OpeningFigures.
(() => {
    const P = Ink.PAL;
    // joints in metres for a 1.75 m figure, origin between the feet, y up:
    // e/h elbow/hand, k/f knee/foot, L/R as seen (screen left/right); lean: shoulders' x shift; dip: drop of the hips
    const base = { eL: [-0.27, 1.14], hL: [-0.25, 0.87], eR: [0.27, 1.14], hR: [0.26, 0.87], kL: [-0.11, 0.5], fL: [-0.12, 0], kR: [0.11, 0.5], fR: [0.13, 0], lean: 0, dip: 0 };
    const POSES = {
        stand: {},
        up: { eL: [-0.36, 1.7], hL: [-0.48, 1.97], eR: [0.36, 1.7], hR: [0.48, 1.97] },
        upR: { eR: [0.3, 1.72], hR: [0.36, 2.0], eL: [-0.33, 1.17], hL: [-0.14, 0.98], lean: 0.04 },
        upL: { eL: [-0.3, 1.72], hL: [-0.36, 2.0], eR: [0.33, 1.17], hR: [0.14, 0.98], lean: -0.04 },
        disco: { eR: [0.38, 1.64], hR: [0.6, 1.86], eL: [-0.3, 1.18], hL: [-0.47, 0.98], lean: 0.05, kR: [0.18, 0.5], fR: [0.27, 0] },
        elbows: { eL: [-0.38, 1.24], hL: [-0.12, 1.36], eR: [0.38, 1.24], hR: [0.12, 1.36], kL: [-0.17, 0.46], kR: [0.17, 0.46], dip: 0.07 },
        clap: { eL: [-0.27, 1.73], hL: [-0.04, 2.0], eR: [0.27, 1.73], hR: [0.04, 2.0] },
        swayL: { lean: -0.08, eL: [-0.36, 1.16], hL: [-0.44, 1.36], eR: [0.2, 1.12], hR: [0.3, 0.95], kR: [0.16, 0.48], fR: [0.2, 0] },
        swayR: { lean: 0.08, eR: [0.36, 1.16], hR: [0.44, 1.36], eL: [-0.2, 1.12], hL: [-0.3, 0.95], kL: [-0.16, 0.48], fL: [-0.2, 0] },
        jump: { eL: [-0.34, 1.72], hL: [-0.4, 2.02], eR: [0.34, 1.72], hR: [0.42, 2.0], kL: [-0.15, 0.56], fL: [-0.12, 0.14], kR: [0.15, 0.56], fR: [0.12, 0.14], dip: -0.1 },
        drink: { eR: [0.28, 1.14], hR: [0.2, 1.45], eL: [-0.27, 1.14], hL: [-0.25, 0.87] },
        // side view, walking to screen right (a four-drawing cycle)
        w0: { side: 1, eL: [-0.1, 1.15], hL: [-0.2, 0.9], eR: [0.08, 1.14], hR: [0.2, 0.92], kL: [-0.08, 0.5], fL: [-0.26, 0.03], kR: [0.13, 0.5], fR: [0.28, 0] },
        w1: { side: 1, eL: [-0.02, 1.13], hL: [-0.04, 0.87], eR: [0.02, 1.13], hR: [0.05, 0.87], kL: [0.06, 0.47], fL: [-0.06, 0.13], kR: [0.07, 0.5], fR: [0.03, 0], dip: -0.02 },
        w2: { side: 1, eL: [0.08, 1.14], hL: [0.2, 0.92], eR: [-0.1, 1.15], hR: [-0.2, 0.9], kL: [0.13, 0.5], fL: [0.28, 0], kR: [-0.08, 0.5], fR: [-0.26, 0.03] },
        w3: { side: 1, eL: [0.02, 1.13], hL: [0.05, 0.87], eR: [-0.02, 1.13], hR: [-0.04, 0.87], kL: [0.07, 0.5], fL: [0.03, 0], kR: [0.06, 0.47], fR: [-0.06, 0.13], dip: -0.02 },
        talk: { side: 1, eL: [0.0, 1.14], hL: [0.04, 0.88], eR: [0.12, 1.17], hR: [0.3, 1.25] },
        // sitting at a café table (the table hides the legs): forearms on it, or a glass raised
        sit: { sit: 1, eL: [-0.3, 1.12], hL: [-0.12, 1.0], eR: [0.3, 1.12], hR: [0.12, 1.0] },
        sitDrink: { sit: 1, eL: [-0.3, 1.12], hL: [-0.12, 1.0], eR: [0.27, 1.12], hR: [0.18, 1.42] },
        // walking with a dog on a lead (the lead in the front hand)
        wd0: { side: 1, eL: [-0.1, 1.15], hL: [-0.2, 0.9], eR: [0.12, 1.12], hR: [0.3, 1.0], kL: [-0.08, 0.5], fL: [-0.26, 0.03], kR: [0.13, 0.5], fR: [0.28, 0] },
        wd1: { side: 1, eL: [-0.02, 1.13], hL: [-0.04, 0.87], eR: [0.12, 1.12], hR: [0.3, 1.0], kL: [0.06, 0.47], fL: [-0.06, 0.13], kR: [0.07, 0.5], fR: [0.03, 0], dip: -0.02 },
        wd2: { side: 1, eL: [0.08, 1.14], hL: [0.2, 0.92], eR: [0.12, 1.12], hR: [0.3, 1.0], kL: [0.13, 0.5], fL: [0.28, 0], kR: [-0.08, 0.5], fR: [-0.26, 0.03] },
        wd3: { side: 1, eL: [0.02, 1.13], hL: [0.05, 0.87], eR: [0.12, 1.12], hR: [0.3, 1.0], kL: [0.07, 0.5], fL: [0.03, 0], kR: [0.06, 0.47], fR: [-0.06, 0.13], dip: -0.02 },
    };
    const DANCE = ['up', 'swayL', 'elbows', 'upR', 'swayR', 'clap', 'disco', 'upL', 'jump', 'elbows', 'swayL', 'up', 'swayR', 'stand'];
    const pose = (name) => ({ ...base, ...POSES[name] });

    // a dancer's drawing at song second T: a new pose on every beat (or every `every` beats),
    // from its own seed; the first drawing after the beat dips (the knees on the kick)
    function dance(seed, T, every = 1) {
        const b = Math.floor(Song.beatAt(T) / every), r = Ink.hsh(seed, b, 3);
        const name = DANCE[Math.floor(Ink.hsh(seed, b, 1) * DANCE.length)];
        const fr = Song.beatAt(T) / every - b;
        return { name, kick: fr < 0.17 * every ? 1 : 0, r };
    }

    // looks per seed: hair, a dress or trousers, how wide, which ink
    function look(seed) {
        const h = (k) => Ink.hsh(seed, k, 77);
        return {
            height: 1.62 + h(1) * 0.26, hair: Math.floor(h(2) * 5), dress: h(3) < 0.45, wide: 0.9 + h(4) * 0.25,
            body: ['#1a0a4a', '#200a52', '#160840', '#241060', '#1c0848'][Math.floor(h(5) * 5)],
            cloth: h(6) < 0.35 ? [P.plum, P.grape, '#3a0c6e', P.indigo][Math.floor(h(7) * 4)] : null,
        };
    }

    // a smooth line through screen points (Catmull-Rom, n samples a segment)
    function smooth(Q, n = 5) {
        if (Q.length < 3) return Q;
        const out = [Q[0]];
        for (let i = 0; i + 1 < Q.length; i++) {
            const a = Q[Math.max(0, i - 1)], b = Q[i], c = Q[i + 1], e = Q[Math.min(Q.length - 1, i + 2)];
            for (let j = 1; j <= n; j++) { const t = j / n, t2 = t * t, t3 = t2 * t; out.push([0, 1].map((k) => 0.5 * (2 * b[k] + (-a[k] + c[k]) * t + (2 * a[k] - 5 * b[k] + 4 * c[k] - e[k]) * t2 + (-a[k] + 3 * b[k] - 3 * c[k] + e[k]) * t3))); }
        }
        return out;
    }
    // a limb as one soft shape: a smooth spine, a width tapering from w0 to w1 px, a round end
    function limbPoly(Q, w0, w1) {
        const P0 = smooth(Q), n = P0.length, L = [], R = [];
        for (let i = 0; i < n; i++) {
            const a = P0[Math.max(0, i - 1)], b = P0[Math.min(n - 1, i + 1)], tx = b[0] - a[0], ty = b[1] - a[1], tl = Math.hypot(tx, ty) || 1;
            const nx = -ty / tl, ny = tx / tl, hw = (w0 + (w1 - w0) * (i / (n - 1))) / 2;
            L.push([P0[i][0] + nx * hw, P0[i][1] + ny * hw]); R.push([P0[i][0] - nx * hw, P0[i][1] - ny * hw]);
        }
        const e = P0[n - 1], q = P0[n - 2], ang = Math.atan2(e[1] - q[1], e[0] - q[0]), cap = [];
        for (let j = 1; j < 6; j++) { const a = ang + Math.PI / 2 - (j / 6) * Math.PI; cap.push([e[0] + Math.cos(a) * w1 / 2, e[1] + Math.sin(a) * w1 / 2]); }
        return { poly: L.concat(cap, R.reverse()), spine: P0 };
    }
    const ell = (cx, cy, rx, ry, n = 20, a0 = 0, a1 = Math.PI * 2) => { const o = []; for (let i = 0; i < n; i++) { const a = a0 + (a1 - a0) * (i / (a1 - a0 >= Math.PI * 2 - 1e-6 ? n : n - 1)); o.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]); } return o; };

    // draw one figure: feet at screen (x, y), s px per metre. o: { pose, look, flip, rim (0..1),
    // cols [left, right], d, seed, haze (0..1 towards the room's air colour), air, kick }
    // Far (s < 30): a head with its hair, shoulders and the arms only (in a crowd only those show).
    function draw(g, x, y, s, o) {
        const lk = o.look, k = lk.height / 1.75, pz = pose(o.pose), fl = o.flip ? -1 : 1, side = pz.side ? 1 : 0;
        const dip = (pz.dip + (o.kick ? 0.05 : 0)) * k;
        const sw = side ? 0.14 : 0.21 * lk.wide, hw = side ? 0.13 : 0.16 * lk.wide;
        const lean = pz.lean, sit = !!pz.sit;
        const S = (p, up = 1) => { const yy = p[1] * k - (sit ? 0.45 * k : p[1] > 0.3 ? dip : 0) * up; return [x + fl * (p[0] * k + lean * (yy / 1.75)) * s, y - yy * s]; };
        const tone = (c) => (o.haze ? Neon.css(Neon.mix(c, o.air ?? '#4a2a8a', o.haze)) : c);
        const col = tone(lk.body), ccol = lk.cloth ? tone(lk.cloth) : col;
        const seed = o.seed ?? 1, d = o.d ?? 0, far = s < 30, px = s * k, jit = far ? 0 : 0.4;
        // tiny (a few dozen pixels): one body shape with the legs as a split, a head, one stroke of light
        if (s < 16 && !o.crowd) {
            const body = [S([-sw * 0.9, 1.4]), S([-sw, 1.3]), S([-hw, 0.95]), S(pz.fL), S([0, 0.75]), S(pz.fR), S([hw, 0.95]), S([sw, 1.3]), S([sw * 0.9, 1.4])];
            Ink.shape(g, body, col, { w: 0, seed: seed * 7, d, jit: 0 });
            for (const [e, h] of [[pz.eL, pz.hL], [pz.eR, pz.hR]]) Ink.brush(g, [S([0, 1.38]), S(e), S(h)].map((p, i) => (i ? p : [p[0] + (h[0] < 0 ? -1 : 1) * fl * sw * px * 0.8, p[1]])), { w: Math.max(1, 0.1 * px), col, seed: seed * 9 + (h[0] < 0 ? 1 : 2), d, taper: 0.05, wob: 0.1 });
            const Hc = S([0, 1.62]), hr = 0.11 * px * (lk.hair === 1 ? 1.4 : 1);
            Ink.shape(g, ell(Hc[0], Hc[1], hr * 0.9, hr * 1.1, 10), col, { w: 0, seed: seed * 11, d, jit: 0 });
            if ((o.rim ?? 1) > 0.02) Ink.brush(g, [[Hc[0] - hr * 0.9, Hc[1] + hr * 0.3], [Hc[0] - hr * 0.6, Hc[1] - hr * 0.9]], { w: 1, col: (o.cols ?? [P.cyan])[0], seed: seed * 3, d, taper: 0.4, light: true });
            return;
        }
        const fill = (pts, c, sd) => Ink.shape(g, pts, c, { w: 0, seed: seed * 7 + sd, d, jit });
        const sL = [-sw + 0.05, 1.39], sR = [sw - 0.05, 1.39];
        // legs (not on far figures, not when sitting behind a table)
        if (!far && !sit) {
            fill(limbPoly([S([-hw * 0.55, 0.98]), S(pz.kL), S(pz.fL)], 0.17 * px, 0.1 * px).poly, col, 1);
            fill(limbPoly([S([hw * 0.55, 0.98]), S(pz.kR), S(pz.fR)], 0.17 * px, 0.1 * px).poly, col, 2);
        }
        // the torso: round shoulders, a waist, hips (a dress flares a little to the knee)
        const sh = (sx, a) => [sx * (sw - 0.05) + sx * Math.cos(a) * 0.055, 1.37 + Math.sin(a) * 0.065];
        const tl = [sh(-1, Math.PI * 0.5), sh(-1, Math.PI * 0.7), sh(-1, Math.PI * 0.85), sh(-1, Math.PI), [-sw * 0.93, 1.24], [-hw * 0.94, 1.08], [-hw * 1.06, 0.98]];
        if (far) tl.splice(5); else if (lk.dress && !sit) tl.push([-hw * 1.2, 0.75], [-hw * 1.28, 0.55]);
        const torso = tl.concat(tl.slice().reverse().map((p) => [-p[0], p[1]])).map((p) => S(p, p[1] > 0.6 ? 1 : 0));
        fill(torso, ccol, 3);
        // arms: one soft shape from the shoulder through the elbow to the hand
        const arms = [];
        for (const [sp, e, h, sd] of [[sL, pz.eL, pz.hL, 4], [sR, pz.eR, pz.hR, 5]]) {
            if (far && h[1] < 1.3) continue;                                  // a lowered arm is lost in the crowd
            const A = limbPoly([S(sp), S(e), S(h)], 0.115 * px, 0.075 * px);
            fill(A.poly, col, sd); arms.push({ A, h, e, sp });
            if (!far) fill(ell(S(h)[0], S(h)[1], 0.048 * px, 0.058 * px, 10), col, sd + 20);
        }
        // the neck and the head, the hair round it: 0 short, 1 big 80s volume, 2 ponytail, 3 cropped, 4 long
        const Hc = S([0, 1.62]), hr = 0.105 * px, hy = Hc[1];
        if (!far) fill(limbPoly([S([0, 1.38]), S([0, 1.53])], 0.1 * px, 0.09 * px).poly, col, 6);
        const hairOf = () => {
            if (lk.hair === 1) return ell(Hc[0], hy - hr * 0.25, hr * 1.55, hr * 1.4, 22).map((p, i) => [p[0] + Math.sin(i * 2.3 + seed) * hr * 0.12, p[1] + Math.cos(i * 1.7 + seed) * hr * 0.1]);
            if (lk.hair === 4) return ell(Hc[0], hy - hr * 0.2, hr * 1.18, hr * 1.2, 18, Math.PI * 0.95, Math.PI * 2.05).concat([[Hc[0] + hr * 1.2, hy + hr * 1.6], [Hc[0] + hr * 0.7, hy + hr * 2.4], [Hc[0] - hr * 0.7, hy + hr * 2.4], [Hc[0] - hr * 1.2, hy + hr * 1.6]]);
            if (lk.hair === 2) return ell(Hc[0], hy - hr * 0.3, hr * 1.02, hr * 0.95, 14, Math.PI, Math.PI * 2).concat([[Hc[0] + fl * hr * 1.55, hy - hr * 0.2], [Hc[0] + fl * hr * 1.75, hy + hr * 0.9], [Hc[0] + fl * hr * 1.15, hy + hr * 0.4]]);
            if (lk.hair === 3) return ell(Hc[0], hy - hr * 0.28, hr * 1.06, hr * 0.98, 16, Math.PI * 0.92, Math.PI * 2.08);
            return null;
        };
        const hair = hairOf();
        if (hair) fill(hair, col, 7);
        fill(ell(Hc[0], hy, hr * 0.86, hr * 1.1, 20), col, 8);
        // near ones: the cloth and the hair catch a little of the room in a lighter ink
        if (s > 110) {
            const lt2 = tone(lk.cloth ? '#5a2a9a' : '#3a1a7a'), Tp = S([0, 1.3]), Hb = S([0, 1.68]);
            Ink.strokes(g, Tp[0] - sw * 0.7 * px, Tp[1], sw * 1.4 * px, 0.35 * px, { ang: Math.PI * 0.5 + 0.25, spread: 0.5, count: 5, len: 0.22 * px, w: Math.max(1, 0.012 * s), cols: [lt2], seed: seed * 41, d, alpha: 0.7 });
            if (lk.hair) Ink.strokes(g, Hb[0] - hr * 0.9, Hb[1] - hr * 0.4, hr * 1.8, hr * 0.9, { ang: 0.4, spread: 0.8, count: 5, len: hr * 0.7, w: Math.max(1, 0.01 * s), cols: [tone('#3a1a7a')], seed: seed * 43, d, alpha: 0.8 });
        }
        // the rims: short strokes of the two lights on the outer contour only (head, shoulders,
        // a raised forearm), cyan from the left, magenta from the right
        const a = o.rim ?? 1; if (a <= 0.02) return;
        const [cl, cr] = o.cols ?? [P.cyan, P.magenta], rw = Math.max(1, Math.min(3, 0.014 * s));
        const stroke = (pts, c, sd) => Ink.brush(g, pts, { w: rw, col: c, seed: seed * 29 + sd, d, taper: 0.45, wob: 0.3, alpha: a, light: true });
        const big = lk.hair === 1 ? 1.5 : lk.hair === 4 ? 1.18 : lk.hair ? 1.03 : 0.9, hrx = hr * big, hry = hr * (lk.hair === 1 ? 1.35 : 1.1), hcy = hy - (lk.hair === 1 ? hr * 0.25 : lk.hair ? hr * 0.15 : 0);
        stroke(ell(Hc[0], hcy, hrx * 0.98, hry, 6, Math.PI * 0.95, Math.PI * 1.35), cl, 1);
        stroke(ell(Hc[0], hcy, hrx * 0.98, hry, 6, -Math.PI * 0.35, Math.PI * 0.05), cr, 2);
        if (far) return;
        stroke([S([-sw + 0.02, 1.4]), S([-sw - 0.005, 1.33]), S([-sw * 0.95, 1.25])], cl, 3);
        stroke([S([sw - 0.02, 1.4]), S([sw + 0.005, 1.33]), S([sw * 0.95, 1.25])], cr, 4);
        for (const { A, h } of arms) {
            if (h[1] < 1.45) continue;                                        // only a raised forearm catches the light
            const sp = A.spine, m = sp.length, outer = (h[0] < 0) === (fl > 0) ? cl : cr, sg = (h[0] < 0) === (fl > 0) ? -1 : 1;
            const seg = sp.slice(Math.floor(m * 0.62), Math.floor(m * 0.9)).map((p) => [p[0] + sg * 0.045 * px, p[1]]);
            if (seg.length > 1) stroke(seg, outer, 5 + (sg > 0 ? 1 : 0));
        }
    }

    // a small dog on a lead, walking (four drawings on twos): feet at (x, y), s px per metre
    function dog(g, x, y, s, o) {
        const fl = o.flip ? -1 : 1, d = o.d ?? 0, ph = o.phase ?? 0, col = o.col ?? '#1a0a4a', seed = o.seed ?? 7;
        const X = (u) => x + fl * u * s, Y = (v) => y - v * s;
        const body = ell(X(0), Y(0.3), 0.26 * s, 0.09 * s, 14), head = ell(X(0.3), Y(0.38), 0.08 * s, 0.07 * s, 10);
        for (const [lx, sgn] of [[-0.18, 1], [-0.12, -1], [0.16, -1], [0.2, 1]]) { const sw = (ph % 2 ? 1 : -1) * sgn * 0.05; Ink.brush(g, [[X(lx), Y(0.27)], [X(lx + sw), Y(0)]], { w: Math.max(1, 0.04 * s), col, seed: seed + lx * 100, d, taper: 0.05 }); }
        Ink.shape(g, body, col, { w: 0, seed, d, jit: 0.3 }); Ink.shape(g, head, col, { w: 0, seed: seed + 1, d, jit: 0.3 });
        Ink.shape(g, [[X(0.33), Y(0.42)], [X(0.4), Y(0.5)], [X(0.38), Y(0.39)]], col, { w: 0, seed: seed + 2, d, jit: 0 });
        Ink.brush(g, [[X(-0.25), Y(0.33)], [X(-0.34), Y(0.45)]], { w: Math.max(1, 0.03 * s), col, seed: seed + 3, d, taper: 0.5 });
        Ink.brush(g, [[X(0.3), Y(0.43)], [X(0.22), Y(0.48)]], { w: Math.max(1, 0.014 * s), col: P.cyan, seed: seed + 4, d, taper: 0.4, light: true });
        if (o.lead) Ink.brush(g, [[X(0.27), Y(0.36)], [o.lead[0], o.lead[1]]], { w: Math.max(1, 0.01 * s), col: P.pink, seed: seed + 5, d, taper: 0.1, wob: 0.3, light: true });
    }

    window.OpeningFigures = { draw, dog, dance, look, pose, POSES, DANCE };
})();
