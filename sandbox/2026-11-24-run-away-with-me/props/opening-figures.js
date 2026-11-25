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

    // draw one figure: feet at screen (x, y), s px per metre. o: { pose, look, flip, rim (0..1),
    // cols [left, right], d, seed, haze (0..1 towards the room's air colour), air }
    function draw(g, x, y, s, o) {
        const lk = o.look, k = lk.height / 1.75, pz = pose(o.pose), fl = o.flip ? -1 : 1, side = pz.side ? 1 : 0;
        const dip = (pz.dip + (o.kick ? 0.05 : 0)) * k;
        const sw = side ? 0.14 : 0.22 * lk.wide, hw = side ? 0.13 : 0.16 * lk.wide;
        const lean = pz.lean;
        const S = (p, up = 1) => { const yy = p[1] * k - (p[1] > 0.3 ? dip : 0) * up; return [x + fl * (p[0] * k + lean * (yy / 1.75)) * s, y - yy * s]; };
        const col = o.haze ? Neon.css(Neon.mix(lk.body, o.air ?? '#4a2a8a', o.haze)) : lk.body;
        const ccol = lk.cloth ? (o.haze ? Neon.css(Neon.mix(lk.cloth, o.air ?? '#4a2a8a', o.haze)) : lk.cloth) : col;
        const seed = o.seed ?? 1, d = o.d ?? 0, big = s > 60, tiny = s < 22;
        const sL = [-sw, 1.42], sR = [sw, 1.42], hL = [-hw * 0.75, 0.95], hR = [hw * 0.75, 0.95], nk = [0, 1.5], hd = [0, 1.62];
        const limbW = (m) => Math.max(1.2, m * s * k);
        const limb = (pts, w, c, sd) => Ink.brush(g, pts.map((p) => S(p)), { w: limbW(w), col: c, seed: seed * 17 + sd, d, taper: 0.04, wob: tiny ? 0.2 : 0.5 });
        // legs, then the torso (a dress flares to the knees), arms, neck, head, hair
        limb([hL, pz.kL, pz.fL], 0.16, col, 1); limb([hR, pz.kR, pz.fR], 0.16, col, 2);
        // the torso: round shoulders, a waist, hips (a dress flares a little to the knee); one skin, no inner line
        const sh = (sx, a) => [sx * (sw - 0.05) + sx * Math.cos(a) * 0.05, 1.37 + Math.sin(a) * 0.06];
        const tl = [sh(-1, Math.PI * 0.5), sh(-1, Math.PI * 0.75), sh(-1, Math.PI), [-sw * 0.92, 1.25], [-hw * 0.95, 1.08], [-hw * 1.08, 0.98]];
        if (lk.dress) tl.push([-hw * 1.22, 0.75], [-hw * 1.3, 0.55]);
        const torso = tl.concat(tl.slice().reverse().map((p) => [-p[0], p[1]])).map((p) => S(p, p[1] > 0.6 ? 1 : 0));
        Ink.shape(g, torso, ccol, { w: 0, seed: seed * 7, d, jit: tiny ? 0 : 0.6 });
        // arms: the upper arm thicker than the forearm, a hand at the end
        for (const [sp, e, h, sd] of [[[-sw + 0.04, 1.38], pz.eL, pz.hL, 3], [[sw - 0.04, 1.38], pz.eR, pz.hR, 4]]) {
            limb([sp, e], 0.11, col, sd); limb([e, h], 0.085, col, sd + 10);
            if (!tiny) { const Hh = S(h), r = 0.05 * k * s, pts = []; for (let i = 0; i < 9; i++) { const a = (i / 9) * Math.PI * 2; pts.push([Hh[0] + Math.cos(a) * r, Hh[1] + Math.sin(a) * r * 1.2]); } Ink.shape(g, pts, col, { w: 0, seed: seed * 19 + sd, d, jit: 0.4 }); }
        }
        limb([[0, 1.4], nk], 0.1, col, 5);
        const H = S(hd), hr = 0.105 * k * s, head = [];
        for (let i = 0; i < 14; i++) { const a = (i / 14) * Math.PI * 2; head.push([H[0] + Math.cos(a) * hr * 0.85, H[1] + Math.sin(a) * hr * 1.12]); }
        Ink.shape(g, head, col, { w: 0, seed: seed * 11, d, jit: tiny ? 0 : 0.5 });
        // hair: 0 short, 1 big 80s volume, 2 ponytail, 3 flat top, 4 long
        const hair = [];
        if (lk.hair === 1 || lk.hair === 4) {
            const R = hr * (lk.hair === 1 ? 1.65 : 1.25), drop = lk.hair === 4 ? 2.6 : 1.3;
            for (let i = 0; i <= 16; i++) { const a = Math.PI * (0.95 + (i / 16) * 1.1) - 0.05; const bump = 1 + 0.1 * Math.sin(i * 2.7 + seed); hair.push([H[0] + Math.cos(a) * R * bump * 0.9, H[1] - hr * 0.2 + Math.sin(a) * R * bump]); }
            hair.push([H[0] + R * 0.85, H[1] + hr * drop * 0.6], [H[0] + R * 0.55, H[1] + hr * drop], [H[0] - R * 0.55, H[1] + hr * drop], [H[0] - R * 0.85, H[1] + hr * drop * 0.6]);
        } else if (lk.hair === 2) {
            hair.push([H[0] - hr * 0.95, H[1]], [H[0] - hr * 0.8, H[1] - hr * 1.1], [H[0] + hr * 0.6, H[1] - hr * 1.25], [H[0] + hr * 1.6 * fl, H[1] - hr * 0.6], [H[0] + hr * 1.9 * fl, H[1] + hr * 1.2], [H[0] + hr * 1.0 * fl, H[1] + hr * 0.2], [H[0] + hr * 0.9, H[1] - hr * 0.2]);
        } else if (lk.hair === 3) {
            hair.push([H[0] - hr * 0.95, H[1] - hr * 0.3], [H[0] - hr * 0.95, H[1] - hr * 1.45], [H[0] + hr * 0.95, H[1] - hr * 1.45], [H[0] + hr * 0.95, H[1] - hr * 0.3]);
        }
        if (hair.length) Ink.shape(g, hair, col, { w: 0, seed: seed * 13, d, jit: tiny ? 0 : 0.8 });
        // the rims: cyan on the left edges, magenta on the right, on what faces each side
        const a = o.rim ?? 1; if (a <= 0.02) return;
        const [cl, cr] = o.cols ?? [P.cyan, P.magenta], rw = Math.max(1, Math.min(4, 0.022 * s));
        const rimSeg = (A, B, w, sd) => {
            const ax = B[0] - A[0], ay = B[1] - A[1], l = Math.hypot(ax, ay) || 1, nx = -ay / l, ny = ax / l;
            for (const sg of [-1, 1]) {
                const ex = nx * sg; if (Math.abs(ex) < 0.35) continue;
                const off = w * s * k * 0.42, c = ex < 0 ? cl : cr;
                const n = l > 60 ? 2 : 1;
                for (let j = 0; j < n; j++) {
                    const u0 = n === 1 ? 0.18 : [0.08, 0.55][j], u1 = n === 1 ? 0.78 : [0.42, 0.85][j];
                    const p0 = [A[0] + nx * sg * off + ax * u0, A[1] + ny * sg * off + ay * u0], p1 = [A[0] + nx * sg * off + ax * u1, A[1] + ny * sg * off + ay * u1];
                    Ink.brush(g, [p0, p1], { w: rw, col: c, seed: seed * 29 + sd * 3 + j * 7 + (sg > 0 ? 1 : 0), d, taper: 0.4, wob: 0.4, alpha: a, light: true });
                }
            }
        };
        if (tiny) {
            Ink.brush(g, [[H[0] - hr * 0.9, H[1] + hr * 0.5], [H[0] - hr * 0.7, H[1] - hr * 0.8]], { w: rw, col: cl, seed: seed * 3, d, taper: 0.4, alpha: a, light: true });
            Ink.brush(g, [S(sR), S([sw * 0.85, 1.15])], { w: rw, col: cr, seed: seed * 5, d, taper: 0.4, alpha: a, light: true });
            return;
        }
        const arc = (a0, a1, c, sd) => { const pts = []; const R = (lk.hair === 1 ? 1.6 : lk.hair === 4 ? 1.2 : 1.02) * hr; for (let i = 0; i <= 6; i++) { const t = a0 + (a1 - a0) * (i / 6); pts.push([H[0] + Math.cos(t) * R * 0.88, H[1] - (lk.hair === 1 ? hr * 0.2 : 0) + Math.sin(t) * R * 1.08]); } Ink.brush(g, pts, { w: rw, col: c, seed: seed * 31 + sd, d, taper: 0.4, wob: 0.4, alpha: a, light: true }); };
        arc(Math.PI * 0.75, Math.PI * 1.3, cl, 1); arc(-Math.PI * 0.3, Math.PI * 0.25, cr, 2);
        rimSeg(S([-sw, 1.34]), S([-hw * 0.95, 1.08]), 0, 3); rimSeg(S([sw, 1.34]), S([hw * 0.95, 1.08]), 0, 4);
        rimSeg(S(sL), S(pz.eL), 0.085, 5); rimSeg(S(pz.eL), S(pz.hL), 0.085, 6); rimSeg(S(sR), S(pz.eR), 0.085, 7); rimSeg(S(pz.eR), S(pz.hR), 0.085, 8);
        if (s > 35) { rimSeg(S(pz.kL), S(pz.fL), 0.13, 9); rimSeg(S(pz.kR), S(pz.fR), 0.13, 10); }
        // a shoulder line of light on the bigger ones
        if (big) Ink.brush(g, [S([-sw * 0.9, 1.43]), S([-sw * 0.3, 1.46])], { w: rw, col: cl, seed: seed * 37, d, taper: 0.4, alpha: a * 0.8, light: true });
    }

    window.OpeningFigures = { draw, dance, look, pose, POSES, DANCE };
})();
