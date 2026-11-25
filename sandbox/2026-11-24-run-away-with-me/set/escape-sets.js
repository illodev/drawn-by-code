// The escape section's sets (sections/escape.js), in the film's drawn manner (styles/retro-neon/
// ink.js): the party room (walls with Deco neon, a lit dance floor, the mirror ball and the spots
// it throws, a crowd in silhouette), the bar top in close-up (the pill, a glass, the room beyond
// as discs of light), the hotel room (a suitcase on the bed, blinds, the hotel across the street
// whose windows go dark one by one) and Ocean Drive (the courtyard pool, the gate, the street,
// the hotels' neon, the park's palms, the sea). All in metres through Neon.camera.
// Global: EscapeSet.
const EscapeSet = (() => {
    const P = Ink.PAL, hex = Neon.hex, css = Neon.css, mix = Neon.mix;
    const cap = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
    const lw = (s, m = 0.05) => cap(m * s, 1.2, 6);
    const H = Ink.hsh;
    const tone = (c, fx, k = 1) => (fx.hue ? css(Neon.shift(c, fx.hue * k)) : c);
    const glint = (L, x, y, r, col, o) => Neon.last.glint(null, L, x, y, r, typeof col === 'string' ? hex(col) : col, { lightOnly: true, ...o });

    // --- kit -------------------------------------------------------------------------------
    // a world polygon as a flat ink with a brush line weighted by its distance
    function face(g, cam, pts, fill, o = {}) {
        const q = Neon.poly(cam, pts); if (!q) return null;
        let w = o.w;
        if (w === undefined) { const c = pts.reduce((a, p) => [a[0] + p[0] / pts.length, a[1] + p[1] / pts.length, a[2] + p[2] / pts.length], [0, 0, 0]); const z = cam.view(c)[2]; w = z > 0.05 ? lw(cam.f / z, o.m ?? 0.03) : 3; }
        Ink.shape(g, q, fill, { jit: 0, ...o, w });
        return q;
    }
    // a neon tube along world points: as wide as a `wm`-metre tube at its distance, white core
    function tube(g, L, cam, pts, col, wm = 0.06, o = {}) {
        const on = o.on ?? 1; if (on <= 0.01) return;
        const core = css(mix(typeof col === 'string' && col[0] === '#' ? hex(col) : [255, 140, 220], [255, 255, 255], 0.5));
        for (let i = 0; i + 1 < pts.length; i++) {
            const a = cam.p(pts[i]), b = cam.p(pts[i + 1]); if (a[2] < 0.15 || b[2] < 0.15) continue;
            const wd = cap(wm * cam.f / Math.min(a[2], b[2]), 0.9, o.max ?? 10);
            for (const c of [g, L]) {
                if (!c) continue;
                c.save(); c.globalAlpha = on; c.lineCap = 'round'; c.strokeStyle = col; c.lineWidth = c === L ? wd * 1.6 : wd;
                c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke();
                if (c === g && wd > 2) { c.strokeStyle = core; c.lineWidth = wd * 0.35; c.stroke(); }
                c.restore();
            }
        }
    }
    // a point on a wall: base A→B (x, z), u metres along, v up
    const wall = (A, B) => { const dx = B[0] - A[0], dz = B[1] - A[1], l = Math.hypot(dx, dz); return { len: l, at: (u, v) => [A[0] + (dx * u) / l, v, A[1] + (dz * u) / l] }; };
    const rect = (Wl, u0, u1, v0, v1) => [Wl.at(u0, v0), Wl.at(u1, v0), Wl.at(u1, v1), Wl.at(u0, v1)];
    // a cut-out figure (an image, feet at screen point, h px tall) on the picture, erasing the light
    function fig(g, L, img, x, y, h, o = {}) {
        if (h < 2) return;
        const w = (h * img.width) / img.height * (o.sx ?? 1);
        for (const c of [g, L]) {
            if (!c) continue;
            c.save(); c.translate(x, y); if (o.lean) c.rotate(o.lean); if (o.flip) c.scale(-1, 1);
            if (c === L) c.globalCompositeOperation = 'destination-out'; else c.globalAlpha = o.alpha ?? 1;
            c.drawImage(img, -w / 2, -h, w, h); c.restore();
        }
    }

    // the crowd's silhouettes: the cast's eight views darkened into the night with a cyan rim on
    // one side and a magenta one on the other (baked once)
    function silhouettes(neon) {
        const out = [];
        for (const im of neon) {
            const Hh = 900, s = Hh / im.height, W = Math.ceil(im.width * s), pad = 8;
            const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
            const dark = mk(W + 2 * pad, Hh + 2 * pad), D = dark.getContext('2d');
            D.drawImage(im, pad, pad, W, Hh); D.globalCompositeOperation = 'source-atop'; D.globalAlpha = 0.93; D.fillStyle = '#10042e'; D.fillRect(0, 0, dark.width, dark.height);
            const c = mk(W + 2 * pad, Hh + 2 * pad), G = c.getContext('2d');
            for (const [dx, dy, col] of [[5, -3, P.cyan], [-5, -3, P.magenta]]) {
                const r = mk(c.width, c.height), R = r.getContext('2d');
                R.drawImage(im, pad + dx, pad + dy, W, Hh); R.globalCompositeOperation = 'source-in'; R.fillStyle = col; R.fillRect(0, 0, r.width, r.height);
                G.drawImage(r, 0, 0);
            }
            G.drawImage(dark, 0, 0);
            c.footPad = pad / (Hh + 2 * pad);
            out.push(c);
        }
        return out;
    }

    const BANDS = ['#04022e', '#0f0138', '#18065e', '#260a8c', '#3c0ca8', '#6a1290', '#a8189e'];
    const BAND_E = [0.75, 0.42, 0.26, 0.16, 0.095, 0.05, 0.02];
    const skyP = (cam, A, e) => { const r = 20000; return cam.p([cam.pos[0] + Math.sin(A) * Math.cos(e) * r, cam.pos[1] + Math.sin(e) * r, cam.pos[2] + Math.cos(A) * Math.cos(e) * r]); };
    const STARS = (() => { const R = Motion.rng('esc-stars'), out = []; for (let i = 0; i < 260; i++) out.push({ a: R() * Math.PI * 2, e: 0.03 + Math.pow(R(), 1.4) * 0.6, s: 1.5 + R() * 3, cyan: R() < 0.3 }); return out; })();
    const MOON = [-Math.PI / 2 + 0.35, 0.2];
    function sky(g, cam, T, d, fx, env) {
        const yaw = cam.yaw ?? 0, a = skyP(cam, yaw - 0.5, 0), b = skyP(cam, yaw + 0.5, 0), c = skyP(cam, yaw, 0);
        const ang = Math.atan2(b[1] - a[1], b[0] - a[0]), Wd = env.W * 1.6;
        const span = (e) => { const p = skyP(cam, yaw, e); return Math.hypot(p[0] - c[0], p[1] - c[1]) * (p[1] < c[1] ? 1 : -1); };
        g.save(); g.translate(c[0], c[1]); g.rotate(ang);
        for (let i = 0; i < BANDS.length; i++) {
            const y0 = i === 0 ? -env.H * 3 : -span(BAND_E[i]), col = tone(BANDS[i], fx, 0.4);
            g.fillStyle = col; g.beginPath(); g.moveTo(-Wd, 6); g.lineTo(-Wd, y0);
            for (let x = -Wd; x <= Wd; x += 30) g.lineTo(x, y0 + Ink.noise(900 + i, x / 160, 0) * 6 + Ink.noise(950 + i, x / 45, 0) * 2);
            g.lineTo(Wd, 6); g.closePath(); g.fill();
            if (i > 0) Ink.strokes(g, -Wd, y0 - 10, Wd * 2, 24, { ang: 0, count: 10, len: 220, w: 5, cols: [col], seed: 300 + i, d, alpha: 0.55 });
        }
        g.restore();
        for (let i = 0; i < STARS.length; i++) {
            const st = STARS[i], p = skyP(cam, st.a, st.e); if (p[2] < 1 || p[0] < -10 || p[0] > env.W + 10 || p[1] < -10 || p[1] > c[1] - 8) continue;
            const sz = st.s * (0.55 + 0.55 * H(i, 7, d));
            g.strokeStyle = st.cyan ? P.cyan : P.cream; g.lineWidth = Math.max(1, sz * 0.35); g.lineCap = 'round';
            g.beginPath(); g.moveTo(p[0] - sz, p[1]); g.lineTo(p[0] + sz, p[1]); g.moveTo(p[0], p[1] - sz); g.lineTo(p[0], p[1] + sz); g.stroke();
        }
        const m = skyP(cam, MOON[0], MOON[1]);
        if (m[2] > 1 && m[1] < c[1] - 40 && m[1] > 30 && m[0] > -40 && m[0] < env.W + 40) {
            const r = 24, cres = [];
            for (let i = 0; i <= 20; i++) { const an = Math.PI * 0.42 + (i / 20) * Math.PI * 1.16; cres.push([m[0] + Math.cos(an) * r, m[1] + Math.sin(an) * r]); }
            for (let i = 20; i >= 0; i--) { const an = Math.PI * 0.42 + (i / 20) * Math.PI * 1.16; cres.push([m[0] + 9 + Math.cos(an) * r * 0.86, m[1] - 4 + Math.sin(an) * r * 0.86]); }
            Ink.shape(g, cres, P.cream, { w: 2.6, seed: 'moon', d, jit: 0.4 });
        }
        return c[1];
    }

    // ==========================================================================================
    // --- the party room ------------------------------------------------------------------------
    // a hotel ballroom: floor y 0, x −9…9, z −3…16, ceiling 4.2; the stage and its Deco neon on the
    // back wall, the bar along the left wall, portholes and fins on the right one
    const RM = { x0: -9, x1: 9, z0: -3, z1: 16, h: 4.2 };
    const BALL = [0, 3.45, 8.5], BALL_R = 0.34;
    const CROWD = (() => {
        const R = Motion.rng('esc-crowd'), out = [];
        const keep = [[0.6, 4.0, 1.1], [0.35, 2.6, 1.0], [-1.5, 11.0, 1.1]];
        // lanes kept clear: from each shot's camera to the one of them it looks at
        const lanes = [[0.15, 1.0, 0.6, 4.0, 0.55], [-0.5, 5.2, -1.5, 11.0, 0.7], [1.9, 0.4, -1.5, 11.0, 0.45]];
        const segD = (x, z, [ax, az, bx, bz]) => { const vx = bx - ax, vz = bz - az, u = Math.max(0, Math.min(1, ((x - ax) * vx + (z - az) * vz) / (vx * vx + vz * vz))); return Math.hypot(x - ax - vx * u, z - az - vz * u); };
        for (let i = 0; out.length < 40 && i < 600; i++) {
            const x = -7.6 + R() * 15.2, z = 1.2 + R() * 13, v = R() < 0.72 ? [4, 6, 7, 4, 5][Math.floor(R() * 5)] : [0, 3][Math.floor(R() * 2)], fl = R() < 0.5, sc = 0.93 + R() * 0.12, ph = R(), amp = 0.03 + R() * 0.05, sx = 0.9 + R() * 0.22;
            if (keep.some(([kx, kz, r]) => Math.hypot(x - kx, z - kz) < r)) continue;
            if (lanes.some((l) => segD(x, z, l) < l[4])) continue;
            if (out.some((o) => Math.hypot(o.x - x, o.z - z) < 0.75)) continue;
            out.push({ x, z, v, fl, sc, ph, amp, sx });
        }
        return out;
    })();
    const SPOTS = (() => { const R = Motion.rng('esc-spots'), out = []; for (let i = 0; i < 70; i++) out.push({ az: R() * Math.PI * 2, el: -1.25 + R() * 1.55, r: 0.09 + R() * 0.07, col: [P.cream, P.cream, P.pink, P.cyan, P.cream, P.gold][i % 6] }); return out; })();

    // where a spot of the ball lands at ball-angle `rot`: [point, plane axis u, plane axis v]
    function spotHit(s, rot) {
        const az = s.az + rot, dir = [Math.cos(s.el) * Math.sin(az), Math.sin(s.el), Math.cos(s.el) * Math.cos(az)];
        let best = Infinity, ax = null;
        const tryP = (t, U, V) => { if (t > 0.1 && t < best) { best = t; ax = [U, V]; } };
        if (dir[1] < 0) tryP(-BALL[1] / dir[1], [1, 0, 0], [0, 0, 1]);
        if (dir[1] > 0) tryP((RM.h - BALL[1]) / dir[1], [1, 0, 0], [0, 0, 1]);
        if (dir[0] > 0) tryP((RM.x1 - BALL[0]) / dir[0], [0, 0, 1], [0, 1, 0]);
        if (dir[0] < 0) tryP((RM.x0 - BALL[0]) / dir[0], [0, 0, 1], [0, 1, 0]);
        if (dir[2] > 0) tryP((RM.z1 - BALL[2]) / dir[2], [1, 0, 0], [0, 1, 0]);
        if (dir[2] < 0) tryP((RM.z0 - BALL[2]) / dir[2], [1, 0, 0], [0, 1, 0]);
        if (!ax) return null;
        return { p: [BALL[0] + dir[0] * best, BALL[1] + dir[1] * best, BALL[2] + dir[2] * best], u: ax[0], v: ax[1], dist: best };
    }
    const ballRot = (tc) => tc * 0.42;
    // the spots on the walls, floor and ceiling (light: on the picture and on the light layer)
    function spots(g, L, cam, tc, fx, o = {}) {
        const rot = ballRot(tc), a = (o.alpha ?? 1) * (1 - 0.35 * fx.quiet) * (1 + 0.4 * fx.flash);
        for (let i = 0; i < SPOTS.length; i++) {
            const s = SPOTS[i], h = spotHit(s, rot); if (!h) continue;
            const r = s.r * (1 + 0.12 * h.dist / 6) * (1 + 0.5 * fx.swell), pts = [];
            for (let k = 0; k < 12; k++) { const an = (k / 12) * Math.PI * 2; pts.push([h.p[0] + (h.u[0] * Math.cos(an) + h.v[0] * Math.sin(an)) * r, h.p[1] + (h.u[1] * Math.cos(an) + h.v[1] * Math.sin(an)) * r, h.p[2] + (h.u[2] * Math.cos(an) + h.v[2] * Math.sin(an)) * r]); }
            const q = Neon.poly(cam, pts); if (!q) continue;
            const col = tone(s.col, fx);
            if (g) Ink.shape(g, q, col, { w: 0, alpha: 0.85 * a, light: true, seed: 900 + i, d: o.d ?? 0, jit: 0.4 });
            if (L) { L.save(); L.globalAlpha = 0.7 * a; L.fillStyle = col; Neon.path(L, q); L.fill(); L.restore(); }
        }
    }

    function room(g, L, cam, T, tc, d, fx) {
        const cp = cam.pos, dim = 1 - 0.45 * fx.quiet;
        // the ceiling, the walls, the floor (each only from the side that faces the camera)
        face(g, cam, [[RM.x0, RM.h, RM.z0], [RM.x1, RM.h, RM.z0], [RM.x1, RM.h, RM.z1], [RM.x0, RM.h, RM.z1]], P.ink, { w: 0 });
        face(g, cam, [[RM.x0, 0, RM.z1], [RM.x1, 0, RM.z1], [RM.x1, RM.h, RM.z1], [RM.x0, RM.h, RM.z1]], P.indigo, { w: 0 });
        face(g, cam, [[RM.x0, 0, RM.z0], [RM.x0, 0, RM.z1], [RM.x0, RM.h, RM.z1], [RM.x0, RM.h, RM.z0]], '#260a8c', { w: 0 });
        face(g, cam, [[RM.x1, 0, RM.z0], [RM.x1, 0, RM.z1], [RM.x1, RM.h, RM.z1], [RM.x1, RM.h, RM.z0]], '#260a8c', { w: 0 });
        // wainscots and the cornice: darker bands with an ink edge
        face(g, cam, [[RM.x0, 0, RM.z1 - 0.01], [RM.x1, 0, RM.z1 - 0.01], [RM.x1, 1.0, RM.z1 - 0.01], [RM.x0, 1.0, RM.z1 - 0.01]], P.grape, { m: 0.02 });
        face(g, cam, [[RM.x1 - 0.01, 0, RM.z0], [RM.x1 - 0.01, 0, RM.z1], [RM.x1 - 0.01, 1.0, RM.z1], [RM.x1 - 0.01, 1.0, RM.z0]], P.grape, { m: 0.02 });
        face(g, cam, [[RM.x0, 3.75, RM.z1 - 0.01], [RM.x1, 3.75, RM.z1 - 0.01], [RM.x1, RM.h, RM.z1 - 0.01], [RM.x0, RM.h, RM.z1 - 0.01]], P.navy, { m: 0.02 });
        // the floor, then the dance floor's tiles lit in a pattern that moves on the beat
        face(g, cam, [[RM.x0, 0, RM.z0], [RM.x1, 0, RM.z0], [RM.x1, 0, RM.z1], [RM.x0, 0, RM.z1]], '#12043a', { w: 0 });
        const beat = Math.floor(Song.beatAt(tc)), cols = [P.magenta, P.cyan, P.violet, P.pink, P.purple];
        for (let i = -5; i < 5; i++) for (let j = 3; j < 13; j++) {
            const pts = [[i * 1.0 + 0.04, 0.005, j + 0.04], [i + 0.96, 0.005, j + 0.04], [i + 0.96, 0.005, j + 0.96], [i + 0.04, 0.005, j + 0.96]];
            const lit = H(i + 20, j, beat) > 0.62, q = Neon.poly(cam, pts); if (!q) continue;
            const col = lit ? tone(cols[Math.floor(H(i, j + 40, beat) * cols.length)], fx) : '#1e0a5a';
            Ink.shape(g, q, col, { w: 0, alpha: lit ? 0.85 * dim : 1, light: lit, jit: 0 });
            if (lit) { L.save(); L.globalAlpha = 0.28 * dim; L.fillStyle = col; Neon.path(L, q); L.fill(); L.restore(); }
        }
        for (let i = -5; i <= 5; i++) { const a = cam.p([i, 0.01, 3]), b = cam.p([i, 0.01, 13]); if (a[2] > 0.3 && b[2] > 0.3) Ink.brush(g, [[a[0], a[1]], [b[0], b[1]]], { w: lw(cam.f / a[2], 0.02), seed: 300 + i, d, taper: 0.02, alpha: 0.8 }); }
        for (let j = 3; j <= 13; j++) { const a = cam.p([-5, 0.01, j]), b = cam.p([5, 0.01, j]); if (a[2] > 0.3 && b[2] > 0.3) Ink.brush(g, [[a[0], a[1]], [b[0], b[1]]], { w: lw(cam.f / Math.max(a[2], 0.3), 0.02), seed: 330 + j, d, taper: 0.02, alpha: 0.8 }); }
        // the stage and its booth, the ziggurat of neon behind
        face(g, cam, [[-3.4, 0, 14.2], [3.4, 0, 14.2], [3.4, 0.55, 14.2], [-3.4, 0.55, 14.2]], P.plum, { m: 0.03 });
        face(g, cam, [[-3.4, 0.55, 14.2], [3.4, 0.55, 14.2], [3.4, 0.55, RM.z1], [-3.4, 0.55, RM.z1]], P.grape, { m: 0.03 });
        tube(g, L, cam, [[-3.4, 0.55, 14.2], [3.4, 0.55, 14.2]], tone(P.cyan, fx), 0.05);
        const zig = (k) => { const s = 1 - k * 0.12; return [[-3.1 * s, 1.0, RM.z1 - 0.05], [-3.1 * s, 1.9, RM.z1 - 0.05], [-2.2 * s, 1.9, RM.z1 - 0.05], [-2.2 * s, 2.6, RM.z1 - 0.05], [-1.2 * s, 2.6, RM.z1 - 0.05], [-1.2 * s, 3.25 - k * 0.2, RM.z1 - 0.05], [1.2 * s, 3.25 - k * 0.2, RM.z1 - 0.05], [1.2 * s, 2.6, RM.z1 - 0.05], [2.2 * s, 2.6, RM.z1 - 0.05], [2.2 * s, 1.9, RM.z1 - 0.05], [3.1 * s, 1.9, RM.z1 - 0.05], [3.1 * s, 1.0, RM.z1 - 0.05]]; };
        face(g, cam, zig(0), P.royal, { m: 0.03 });
        tube(g, L, cam, zig(0), tone(P.cyan, fx), 0.06, { on: dim });
        tube(g, L, cam, zig(1), tone(P.magenta, fx), 0.05, { on: dim });
        for (const sx of [-1, 1]) for (const [y, col] of [[2.55, P.pink], [2.8, P.magenta], [3.05, P.pink]]) tube(g, L, cam, [[sx * 3.7, y, RM.z1 - 0.05], [sx * 8.7, y, RM.z1 - 0.05]], tone(col, fx), 0.05, { on: dim });
        // the DJ behind the booth: a silhouette bobbing, the booth hiding the rest of him
        // sconces: gold fans with light thrown up the wall
        for (const sx of [-1, 1]) {
            const c = [sx * 6.1, 1.9, RM.z1 - 0.06], pts = [];
            for (let k = 0; k <= 8; k++) { const an = Math.PI * (k / 8); pts.push([c[0] + Math.cos(an) * 0.42, c[1] + Math.sin(an) * 0.42, c[2]]); }
            face(g, cam, pts, P.gold, { m: 0.03, light: true });
            const p = cam.p([c[0], c[1] + 0.15, c[2]]); if (p[2] > 0.3) { const s = cam.f / p[2]; glint(L, p[0], p[1], cap(0.5 * s, 3, 80), P.orange, { alpha: 0.6 * dim, halo: fx.halo }); Ink.strokes(g, p[0] - 0.35 * s, p[1] - 1.0 * s, 0.7 * s, 0.8 * s, { ang: -Math.PI / 2, spread: 0.6, count: 7, len: 0.5 * s, w: cap(0.03 * s, 1, 4), cols: [P.salmon, P.orange], seed: 400 + sx, d, alpha: 0.8 }); }
        }
        // the right wall: portholes on the night, pink fins between them
        for (let z = 1; z < 15; z += 4) {
            const pts = []; for (let k = 0; k < 20; k++) { const an = (k / 20) * Math.PI * 2; pts.push([RM.x1 - 0.02, 2.1 + Math.sin(an) * 0.55, z + Math.cos(an) * 0.55]); }
            face(g, cam, pts, P.night, { m: 0.04 });
            tube(g, L, cam, pts.concat([pts[0]]), tone(P.cyan, fx), 0.04, { on: dim });
            const st = cam.p([RM.x1 - 0.03, 2.3, z - 0.2]); if (st[2] > 0.3) { g.fillStyle = P.cream; g.fillRect(st[0], st[1], 2, 2); }
            tube(g, L, cam, [[RM.x1 - 0.04, 0.6, z + 2], [RM.x1 - 0.04, 3.6, z + 2]], tone(P.pink, fx), 0.05, { on: dim });
        }
        // the left wall: the back bar (shelves of bottles, a mirror band), the counter with its neon
        face(g, cam, [[RM.x0 + 0.02, 1.35, 1.5], [RM.x0 + 0.02, 1.35, 12.5], [RM.x0 + 0.02, 2.6, 12.5], [RM.x0 + 0.02, 2.6, 1.5]], P.deep, { m: 0.03 });
        for (const y of [1.6, 2.15]) {
            face(g, cam, [[RM.x0 + 0.02, y - 0.04, 1.5], [RM.x0 + 0.02, y - 0.04, 12.5], [RM.x0 + 0.02, y, 12.5], [RM.x0 + 0.02, y, 1.5]], P.plum, { w: 0 });
            for (let z = 1.7; z < 12.4; z += 0.22) {
                const hgt = 0.22 + 0.12 * H(Math.round(z * 10), Math.round(y * 10), 0), w0 = 0.04, col = [P.gold, P.cyan, P.salmon, P.mint, P.orange, P.pink][Math.floor(H(Math.round(z * 10), 7, 0) * 6)];
                const q = face(g, cam, [[RM.x0 + 0.05, y, z - w0], [RM.x0 + 0.05, y, z + w0], [RM.x0 + 0.05, y + hgt * 0.7, z + w0], [RM.x0 + 0.05, y + hgt, z + w0 * 0.3], [RM.x0 + 0.05, y + hgt, z - w0 * 0.3], [RM.x0 + 0.05, y + hgt * 0.7, z - w0]], col, { m: 0.02, alpha: 0.95 });
                if (q && H(Math.round(z * 10), 3, 0) < 0.4) { const p = cam.p([RM.x0 + 0.06, y + hgt * 0.4, z]); glint(L, p[0], p[1], cap(0.06 * cam.f / p[2], 1.5, 14), col, { alpha: 0.45 * dim, halo: fx.halo, star: fx.star * 0.6 }); }
            }
        }
        const xc = RM.x0 + 0.9;
        face(g, cam, [[xc, 0, 1.4], [xc, 0, 12.6], [xc, 1.1, 12.6], [xc, 1.1, 1.4]], P.plum, { m: 0.03 });
        face(g, cam, [[RM.x0, 1.1, 1.4], [RM.x0, 1.1, 12.6], [xc + 0.05, 1.1, 12.6], [xc + 0.05, 1.1, 1.4]], P.grape, { m: 0.03 });
        tube(g, L, cam, [[xc + 0.02, 1.05, 1.4], [xc + 0.02, 1.05, 12.6]], tone(P.pink, fx), 0.04, { on: dim });
        for (let z = 2; z < 12.6; z += 1.3) { const a = cam.p([xc + 0.01, 0.1, z]), b = cam.p([xc + 0.01, 0.95, z]); if (a[2] > 0.3) Ink.hatch(g, [b[0], b[1]], [a[0], a[1]], { count: 2, len: cap(0.25 * cam.f / a[2], 3, 30), w: lw(cam.f / a[2], 0.02), col: P.salmon, seed: 500 + Math.round(z * 10), d, n: [1, 0], ang: 1.1 }); }
    }

    // the mirror ball: a sphere of facets turning, the light they catch, glints with stars
    function ball(g, L, cam, tc, d, fx) {
        const c = cam.p(BALL); if (c[2] < 0.3) return;
        const s = cam.f / c[2], R0 = BALL_R * s, rot = ballRot(tc);
        // the chain to the ceiling
        const top = cam.p([BALL[0], RM.h, BALL[2]]);
        Ink.brush(g, [[c[0], c[1] - R0], [top[0], top[1]]], { w: cap(0.02 * s, 1, 4), col: P.ink, seed: 61, d, taper: 0.05 });
        const disc = []; for (let k = 0; k < 40; k++) { const an = (k / 40) * Math.PI * 2; disc.push([c[0] + Math.cos(an) * R0, c[1] + Math.sin(an) * R0]); }
        Ink.shape(g, disc, '#24105e', { w: lw(s, 0.012), seed: 62, d, jit: 0.3 });
        // facets: latitude bands × longitude cells; a facet is lit when it mirrors the dance floor
        // or a light (by its normal and a hash), dark violet otherwise
        const toCam = [cam.pos[0] - BALL[0], cam.pos[1] - BALL[1], cam.pos[2] - BALL[2]], tl = Math.hypot(...toCam);
        const NL = 14, beat = Math.floor(Song.beatAt(tc) * 2);
        g.save(); Neon.path(g, disc); g.clip();
        for (let i = 0; i < NL; i++) {
            const la0 = -Math.PI / 2 + (i / NL) * Math.PI, la1 = -Math.PI / 2 + ((i + 1) / NL) * Math.PI, nlo = Math.max(6, Math.round(28 * Math.cos((la0 + la1) / 2)));
            for (let j = 0; j < nlo; j++) {
                const lo0 = (j / nlo) * Math.PI * 2 + rot, lo1 = ((j + 1) / nlo) * Math.PI * 2 + rot, lm = (lo0 + lo1) / 2, am = (la0 + la1) / 2;
                const n = [Math.cos(am) * Math.sin(lm), Math.sin(am), Math.cos(am) * Math.cos(lm)];
                const facing = (n[0] * toCam[0] + n[1] * toCam[1] + n[2] * toCam[2]) / tl; if (facing < 0.05) continue;
                const pt = (la, lo) => cam.p([BALL[0] + BALL_R * Math.cos(la) * Math.sin(lo), BALL[1] + BALL_R * Math.sin(la), BALL[2] + BALL_R * Math.cos(la) * Math.cos(lo)]);
                const q = [pt(la0, lo0), pt(la0, lo1), pt(la1, lo1), pt(la1, lo0)].map((p) => [p[0], p[1]]);
                const h = H(i, j, 0), hb = H(i, j + 99, beat), down = -n[1];
                let col = h < 0.33 ? '#3a1a8e' : h < 0.66 ? '#2a1270' : '#4a2aa8';
                if (down > 0.25 && hb > 0.55) col = [P.magenta, P.cyan, P.pink, P.violet][Math.floor(hb * 40) % 4];
                if (hb > 0.93) col = P.cream;
                g.fillStyle = tone(col, fx); Neon.path(g, q); g.fill();
                if (R0 > 40) { g.strokeStyle = 'rgba(11,2,48,0.85)'; g.lineWidth = cap(0.004 * s, 0.6, 2); g.stroke(); }
                if (hb > 0.93 && facing > 0.3) { const m = q.reduce((a, p) => [a[0] + p[0] / 4, a[1] + p[1] / 4], [0, 0]); glint(L, m[0], m[1], cap(0.06 * s, 2, 30), P.cream, { alpha: 0.9, halo: fx.halo, star: 0.35 + fx.star, rays: 4, rot: 0.3 }); }
            }
        }
        // the shading of a sphere in two flat tones: a dark crescent on the side away from the floor
        g.globalAlpha = 0.35; g.fillStyle = P.ink; g.beginPath(); g.arc(c[0] + R0 * 0.25, c[1] - R0 * 0.35, R0 * 1.02, 0, Math.PI * 2); g.arc(c[0] - R0 * 0.05, c[1] + R0 * 0.05, R0 * 0.95, 0, Math.PI * 2, true); g.fill();
        g.restore();
        Ink.brush(g, disc.concat([disc[0]]), { w: lw(s, 0.012), seed: 63, d, taper: 0.02 });
        Ink.hatch(g, [c[0] - R0 * 0.85, c[1] + R0 * 0.3], [c[0] - R0 * 0.2, c[1] + R0 * 0.9], { count: 4, len: R0 * 0.25, w: cap(0.012 * s, 1, 4), col: P.cyan, seed: 64, d, n: [0.7, -0.7] });
    }

    // the crowd: the silhouettes, far ones first, bobbing on the beat (slow and still in the quiet)
    function crowd(g, L, cam, tc, d, fx, sil, o = {}) {
        const list = CROWD.map((c) => ({ c, depth: cam.view([c.x, 1, c.z])[2] })).filter((x) => x.depth > 0.4).sort((a, b) => b.depth - a.depth);
        const bt = Song.beatAt(tc), dance = 1 - 0.85 * fx.quiet;
        for (const { c, depth } of list) {
            if (o.near !== undefined && (depth < o.near[0] || depth >= o.near[1])) continue;
            const Hm = (c.v < 4 ? 1.74 : 1.83) * c.sc, lift = c.amp * Math.abs(Math.sin(Math.PI * (bt + c.ph))) * dance;
            const ft = cam.p([c.x, lift, c.z]), hd = cam.p([c.x, lift + Hm, c.z]); if (ft[2] < 0.4) continue;
            const img = sil[c.v], hh = (ft[1] - hd[1]) / (1 - 2 * img.footPad);
            fig(g, L, img, ft[0], ft[1] + hh * img.footPad, hh, { flip: c.fl, sx: c.sx, lean: 0.05 * Math.sin(Math.PI * (bt + c.ph) * 0.5) * dance });
        }
    }

    // ==========================================================================================
    // --- the bar top in close-up -----------------------------------------------------------------
    // the counter's top at y 0, its front edge at z 0, its back edge at z 0.55, the room beyond as
    // discs of light out of focus (fixed points in the room, so they move with the camera)
    const BOKEH = (() => { const R = Motion.rng('esc-bokeh'), out = []; for (let i = 0; i < 26; i++) out.push({ x: -4 + R() * 8, y: -0.28 + R() * 0.9, z: 4 + R() * 8, r: 0.09 + R() * 0.12, col: [P.magenta, P.cyan, P.gold, P.pink, P.violet, P.salmon][i % 6], ph: R() }); return out; })();
    const BLOB = (() => { const R = Motion.rng('esc-blob'), out = []; for (let i = 0; i < 9; i++) out.push({ x: -3 + R() * 6, z: 3 + R() * 5, ph: R(), s: 0.9 + R() * 0.25 }); return out; })();
    function barTop(g, L, cam, T, tc, d, fx, o) {
        const W = cam.W, Hh = cam.H, dim = 1 - 0.5 * fx.quiet;
        // the room beyond: dark, dancers as soft dark shapes, the lights as discs (doubling in the swell)
        g.fillStyle = '#12043a'; g.fillRect(0, 0, W, Hh);
        const bt = Song.beatAt(tc);
        for (const b of BOKEH) {
            const p = cam.p([b.x, b.y, b.z]); if (p[2] < 1) continue;
            const r = cap(b.r * cam.f / p[2] * 2.2, 14, 160) * (1 + 0.6 * fx.swell), pulse = 0.6 + 0.4 * Math.sin(bt * Math.PI + b.ph * 6) * (1 - fx.quiet * 0.8);
            const col = tone(b.col, fx), copies = fx.swell > 0.15 ? 3 : 1;
            for (let k = copies - 1; k >= 0; k--) {
                const dx = (k === 0 ? 0 : (k === 1 ? -1 : 1)) * r * 0.5 * fx.swell, al = (k ? 0.35 : 0.6) * pulse * dim;
                g.save(); g.globalAlpha = al; g.fillStyle = col; g.beginPath(); g.arc(p[0] + dx, p[1], r, 0, Math.PI * 2); g.fill(); g.restore();
                if (!k) { Ink.brush(g, Array.from({ length: 25 }, (_, i) => [p[0] + Math.cos((i / 24) * Math.PI * 2) * r, p[1] + Math.sin((i / 24) * Math.PI * 2) * r]), { w: cap(r * 0.06, 1, 4), col, seed: 700 + Math.round(b.ph * 1000), d, alpha: 0.8 * pulse * dim, taper: 0.02, light: true }); }
                L.save(); L.globalAlpha = al * (0.35 + 0.5 * fx.swell); L.fillStyle = col; L.beginPath(); L.arc(p[0] + dx, p[1], r * (1 + 0.4 * fx.swell), 0, Math.PI * 2); L.fill(); L.restore();
            }
        }
        for (const b of BLOB) {
            const sway = Math.sin(Math.PI * (bt + b.ph)) * 0.25 * (1 - 0.85 * fx.quiet), p = cam.p([b.x + sway * 0.4, 0.22 + Math.abs(sway) * 0.05, b.z]); if (p[2] < 1) continue;
            const s = cam.f / p[2] * b.s, pts = [];
            for (let k = 0; k <= 24; k++) { const an = Math.PI + (k / 24) * Math.PI, r = k < 6 || k > 18 ? 0.75 : 0.32; pts.push([p[0] + Math.cos(an) * r * s * (k < 6 || k > 18 ? 1 : 0.9), p[1] + (k < 6 || k > 18 ? 0.25 * s : -0.15 * s) + Math.sin(an) * (k < 6 || k > 18 ? 0.25 : 0.32) * s]); }
            pts.push([p[0] + 0.8 * s, Hh + 400], [p[0] - 0.8 * s, Hh + 400]);
            Ink.shape(g, pts, '#0b0230', { w: 0, alpha: 0.92, seed: 800 + Math.round(b.ph * 99), d, jit: 2 });
        }
        // the counter: glossy, the lights mirrored in it as broken vertical strokes
        const top = Neon.poly(cam, [[-2, 0, 0], [2, 0, 0], [2, 0, 0.55], [-2, 0, 0.55]]);
        if (top) Ink.shape(g, top, '#1a0450', { w: 0, jit: 0 });
        const edge = [cam.p([-2, 0, 0.55]), cam.p([2, 0, 0.55])];
        g.save(); if (top) { Neon.path(g, top); g.clip(); }
        for (const b of BOKEH) {
            const p = cam.p([b.x, b.y, b.z]), m = cam.p([b.x, -b.y, b.z]); if (p[2] < 1) continue;
            const yE = edge[0][1] + (edge[1][1] - edge[0][1]) * ((p[0] - edge[0][0]) / (edge[1][0] - edge[0][0]));
            const len = Math.min(Hh, (m[1] - p[1]) * 0.5), col = tone(b.col, fx);
            for (let k = 0; k < 6; k++) { const u = (k + 0.4 * H(Math.round(b.ph * 999), k, 0)) / 6, y = yE + 6 + u * len, l = (10 + 30 * u) * (0.5 + H(k, Math.round(b.ph * 99), 0)); Ink.brush(g, [[p[0] - l / 2, y], [p[0] + l / 2, y + 0.5]], { w: 2 + 4 * u, col, seed: Math.round(b.ph * 777) + k, d, alpha: 0.75 * (1 - u * 0.5) * dim, taper: 0.4, light: true }); }
        }
        // the spots of the mirror ball sweeping across the counter (and their tracers in the swell)
        const sweep = (Tq) => { const out = []; for (let i = 0; i < 4; i++) { const u = (((Tq - 24) * 0.11 + i * 0.27 + 0.05) % 1 + 1) % 1; out.push([-0.2 + u * 0.4, 0.17 + 0.05 * H(i, 3, 0), 0.0035 + 0.001 * i, i]); } return out; };
        const spot = (c, x, z, r, a, col) => { const pts = []; for (let k = 0; k < 24; k++) { const an = (k / 24) * Math.PI * 2; pts.push([x + Math.cos(an) * r, 0.001, z + Math.sin(an) * r]); } const q = Neon.poly(cam, pts); if (!q) return; c.save(); c.globalAlpha = a; c.fillStyle = col; Neon.path(c, q); c.fill(); c.restore(); };
        const trailN = Math.round(6 * fx.tracer);
        for (let k = trailN; k >= 0; k--) for (const [x, z, r, i] of sweep(tc - k * 0.06)) { const a = (k ? 0.6 * Math.pow(0.7, k) * fx.tracer : 0.9) * (1 - 0.3 * fx.quiet); const col = tone([P.cream, P.pink, P.cyan, P.cream][i], fx); spot(g, x, z, r, a, col); spot(L, x, z, r * 1.6, a * 0.8, col); }
        g.restore();
        if (edge[0][2] > 0.05) Ink.brush(g, [[edge[0][0], edge[0][1]], [edge[1][0], edge[1][1]]], { w: 3, seed: 'barEdge', d, taper: 0.01 });
        tube(g, L, cam, [[-2, -0.004, 0.555], [2, -0.004, 0.555]], tone(P.pink, fx), 0.004, { on: dim, max: 6 });
        // the coaster and the glass (the drink lower once the pill has gone), then the pill
        glass(g, L, cam, d, fx, o.drink ?? 0.8, sweep(tc));
        if (o.pill) pill(g, L, cam, d, fx, sweep(tc));
        // a drop of condensation by the glass, a crumb of salt: things that make the counter real
        for (const [x, z, r] of [[0.03, 0.27, 0.004], [-0.06, 0.33, 0.003], [0.115, 0.2, 0.0035]]) {
            const q = Neon.poly(cam, Array.from({ length: 10 }, (_, k) => [x + Math.cos((k / 10) * Math.PI * 2) * r, 0.0005, z + Math.sin((k / 10) * Math.PI * 2) * r * 0.8]));
            if (q) { Ink.shape(g, q, '#2a0c70', { w: 1.2, seed: Math.round(x * 999), d, jit: 0.3 }); const p = cam.p([x - r * 0.3, 0.001, z - r * 0.2]); g.fillStyle = P.cream; g.globalAlpha = 0.8; g.fillRect(p[0] - 1.5, p[1] - 1, 3, 2); g.globalAlpha = 1; }
        }
    }
    const lit = (sweeps, x, z, pad = 0) => sweeps.reduce((m, [sx, sz, r]) => Math.max(m, 1 - Math.min(1, Math.hypot(sx - x, sz - z) / (r + pad))), 0);
    // the pill: 9 mm across, 3.5 mm thick, a score line across its face; a spot passing over it
    // lights it (a brighter face, a glint)
    const PILL = [0.0, 0.19];
    function pill(g, L, cam, d, fx, sweeps) {
        const [x0, z0] = PILL, r = 0.0045, th = 0.0035, n = 28;
        const ring = (y, rr = r) => Array.from({ length: n }, (_, k) => [x0 + Math.cos((k / n) * Math.PI * 2) * rr, y, z0 + Math.sin((k / n) * Math.PI * 2) * rr]);
        const pc = cam.p([x0, th, z0]), s = cam.f / pc[2], l = lit(sweeps, x0, z0, 0.006);
        // its shadow on the counter, then its side band, then the face
        const sh = Neon.poly(cam, ring(0.0004, r * 1.18).map((p) => [p[0] + 0.0012, p[1], p[2] + 0.0016]));
        if (sh) Ink.shape(g, sh, P.ink, { w: 0, seed: 71, d, jit: 0.6 });
        const bot = ring(0.0006).map(cam.p), topR = ring(th).map(cam.p);
        const side = []; let iMin = 0, iMax = 0; bot.forEach((p, i) => { if (p[0] < bot[iMin][0]) iMin = i; if (p[0] > bot[iMax][0]) iMax = i; });
        const front = []; for (let i = iMin; ; i = (i + n - 1) % n) { front.push(i); if (i === iMax) break; }
        side.push(...front.map((i) => [bot[i][0], bot[i][1]])); side.push(...front.slice().reverse().map((i) => [topR[i][0], topR[i][1]]));
        Ink.shape(g, side, l > 0.2 ? P.salmon : '#c84a9a', { w: lw(s, 0.0016), seed: 72, d, jit: 0.4 });
        const faceQ = ring(th + 0.0006, r * 0.97).map(cam.p).map((p) => [p[0], p[1]]);
        Ink.shape(g, faceQ, l > 0.2 ? P.cream : P.pink, { w: lw(s, 0.0016), seed: 73, d, jit: 0.4 });
        // the score line, and a bevel stroke on its near rim
        const a = cam.p([x0 - r * 0.8, th + 0.0007, z0 + 0.0005]), b = cam.p([x0 + r * 0.8, th + 0.0007, z0 - 0.0005]);
        Ink.brush(g, [[a[0], a[1]], [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + 0.5], [b[0], b[1]]], { w: cap(0.0009 * s, 1.4, 5), col: '#8a2a8a', seed: 74, d, taper: 0.2 });
        const nearRim = front.slice(Math.floor(front.length * 0.2), Math.ceil(front.length * 0.8)).map((i) => { const p = cam.p([x0 + Math.cos((i / n) * Math.PI * 2) * r * 0.85, th + 0.0006, z0 + Math.sin((i / n) * Math.PI * 2) * r * 0.85]); return [p[0], p[1]]; });
        Ink.brush(g, nearRim, { w: cap(0.0006 * s, 1, 4), col: l > 0.2 ? P.gold : P.salmon, seed: 75, d, taper: 0.4, light: true });
        Ink.hatch(g, faceQ[Math.floor(n * 0.6)], faceQ[Math.floor(n * 0.85)], { count: 3, len: cap(0.0025 * s, 4, 30), w: cap(0.0006 * s, 1, 4), col: P.cream, seed: 76, d, n: [0.3, 0.95] });
        if (l > 0.05) { const p = cam.p([x0 - r * 0.4, th + 0.001, z0 - r * 0.3]); glint(L, p[0], p[1], cap(0.004 * s, 4, 40), P.cream, { alpha: 0.7 * l, halo: fx.halo, star: 0.6 * l + fx.star, rays: 4, rot: 0.4 }); }
    }
    // the glass: a tumbler (8 cm across, 9.5 cm tall) on a paper coaster, a pink drink with ice,
    // a straw, light down its edges
    const GL = [0.062, 0.36, 0.04, 0.095];
    function glass(g, L, cam, d, fx, level, sweeps) {
        const [x0, z0, r, h] = GL, n = 36;
        const ring = (y, rr) => Array.from({ length: n }, (_, k) => [x0 + Math.cos((k / n) * Math.PI * 2) * rr, y, z0 + Math.sin((k / n) * Math.PI * 2) * rr]);
        const pc = cam.p([x0, h * 0.5, z0]); if (pc[2] < 0.05) return;
        const s = cam.f / pc[2];
        const coaster = Neon.poly(cam, ring(0.0008, r * 1.65));
        if (coaster) { Ink.shape(g, coaster, P.salmon, { w: lw(s, 0.0015), seed: 81, d, jit: 0.5 }); const cq = Neon.poly(cam, ring(0.0012, r * 1.35)); if (cq) Ink.brush(g, cq.concat([cq[0]]), { w: lw(s, 0.0008), col: P.magenta, seed: 82, d, taper: 0.02 }); }
        // its outline on screen: the hull of the bottom and the rim ellipses
        const bot = ring(0.002, r * 0.94).map(cam.p), rim = ring(h, r).map(cam.p);
        const iL = (A) => A.reduce((m, p, i) => (p[0] < A[m][0] ? i : m), 0), iR = (A) => A.reduce((m, p, i) => (p[0] > A[m][0] ? i : m), 0);
        const arc = (A, i0, i1, dir) => { const out = []; for (let i = i0; ; i = (i + dir + n) % n) { out.push([A[i][0], A[i][1]]); if (i === i1) break; } return out; };
        const lower = (A) => { const a = arc(A, iL(A), iR(A), -1), b = arc(A, iL(A), iR(A), 1); return a.reduce((m, p) => m + p[1], 0) / a.length > b.reduce((m, p) => m + p[1], 0) / b.length ? a : b; };
        const upper = (A) => { const a = arc(A, iL(A), iR(A), -1), b = arc(A, iL(A), iR(A), 1); return a.reduce((m, p) => m + p[1], 0) / a.length > b.reduce((m, p) => m + p[1], 0) / b.length ? b : a; };
        const body = lower(bot).concat(upper(rim).reverse());
        // what is seen through the glass: a darker tint of the room
        Ink.shape(g, body, '#2a0c70', { w: 0, alpha: 0.45, seed: 83, d, jit: 0, light: true });
        // the drink: from the bottom to its level, its surface an ellipse; ice cubes in it
        const yl = 0.006 + (h - 0.012) * level, surf = ring(yl, r * 0.97).map(cam.p);
        const drink = lower(bot).concat(upper(surf).reverse());
        Ink.shape(g, drink, tone(P.magenta, fx), { w: 0, seed: 84, d, jit: 0 });
        Ink.shape(g, surf.map((p) => [p[0], p[1]]), tone(P.pink, fx), { w: lw(s, 0.0012), seed: 85, d, jit: 0.3 });
        for (let k = 0; k < 3; k++) {
            const cx = x0 + (k - 1) * r * 0.45, cz = z0 + (k % 2 ? 0.01 : -0.008), cy = yl + 0.004 - k * 0.002, e = 0.012;
            const q = [[cx - e, cy - e * 0.4, cz], [cx + e * 0.6, cy - e * 0.6, cz], [cx + e, cy + e * 0.5, cz], [cx - e * 0.4, cy + e * 0.8, cz]].map(cam.p).map((p) => [p[0], p[1]]);
            Ink.shape(g, q, k === 1 ? P.cyan : '#b8a2e8', { w: lw(s, 0.001), seed: 86 + k, d, jit: 0.6, alpha: 0.9 });
        }
        // the straw, leaning out of the drink
        const sA = cam.p([x0 - r * 0.3, yl - 0.02, z0 + 0.005]), sB = cam.p([x0 - r * 0.9, h + 0.045, z0 - 0.01]);
        Ink.brush(g, [[sA[0], sA[1]], [sB[0], sB[1]]], { w: cap(0.006 * s, 2, 18), col: P.cyan, seed: 88, d, taper: 0.03 });
        Ink.brush(g, [[sA[0] + 2, sA[1]], [sB[0] + 2, sB[1]]], { w: cap(0.0015 * s, 1, 4), col: P.cream, seed: 89, d, taper: 0.2, light: true });
        // the glass: its rim ellipse, its two sides, light running down the edges, a glint on the rim
        Ink.brush(g, rim.map((p) => [p[0], p[1]]).concat([[rim[0][0], rim[0][1]]]), { w: lw(s, 0.0012), seed: 90, d, taper: 0.01 });
        Ink.brush(g, [[bot[iL(bot)][0], bot[iL(bot)][1]], [rim[iL(rim)][0], rim[iL(rim)][1]]], { w: lw(s, 0.0014), seed: 91, d, taper: 0.05 });
        Ink.brush(g, [[bot[iR(bot)][0], bot[iR(bot)][1]], [rim[iR(rim)][0], rim[iR(rim)][1]]], { w: lw(s, 0.0014), seed: 92, d, taper: 0.05 });
        Ink.brush(g, lower(bot), { w: lw(s, 0.0016), seed: 93, d, taper: 0.05 });
        const l = lit(sweeps, x0, z0, 0.03);
        const eL = [bot[iL(bot)], rim[iL(rim)]].map((p) => [p[0] + 0.006 * s, p[1]]), eR = [bot[iR(bot)], rim[iR(rim)]].map((p) => [p[0] - 0.008 * s, p[1]]);
        Ink.brush(g, [[eL[0][0], eL[0][1] - 0.01 * s], [eL[1][0], eL[1][1] + 0.008 * s]], { w: cap(0.0025 * s, 1.5, 8), col: P.cream, seed: 94, d, taper: 0.35, light: true, alpha: 0.85 });
        Ink.brush(g, [[eR[0][0], eR[0][1] - 0.02 * s], [eR[1][0], eR[1][1] + 0.02 * s]], { w: cap(0.0015 * s, 1, 6), col: tone(P.cyan, fx), seed: 95, d, taper: 0.35, light: true, alpha: 0.8 });
        const gp = rim[Math.floor(n * 0.62)];
        glint(L, gp[0], gp[1], cap(0.006 * s, 4, 50), P.cream, { alpha: 0.5 + 0.5 * l, halo: fx.halo, star: 0.25 + fx.star + l * 0.5, rays: 4, rot: 0.2 });
        // condensation: a few drops down the side
        for (let k = 0; k < 7; k++) { const u = H(k, 5, 0), v = 0.15 + 0.6 * H(k, 6, 0), a = cam.p([x0 + Math.cos(Math.PI * (0.25 + 0.5 * u)) * r * 1.001, h * v, z0 - Math.sin(Math.PI * (0.25 + 0.5 * u)) * r]); g.fillStyle = P.cream; g.globalAlpha = 0.75; g.beginPath(); g.ellipse(a[0], a[1], cap(0.0012 * s, 1, 5), cap(0.0018 * s, 1.4, 7), 0, 0, Math.PI * 2); g.fill(); g.globalAlpha = 1; }
    }

    // ==========================================================================================
    // --- the hotel room ----------------------------------------------------------------------------
    // the window wall at z 4 (an opening x ±1.25, y 0.85…2.45, blinds over its top), the bed with
    // the suitcase, the hotel across the street (its face at z 20, the street 7 m below) whose
    // windows go dark one by one, its blade sign lettered in neon
    const WIN = { x0: -1.25, x1: 1.25, y0: 0.85, y1: 2.45, z: 4.0 };
    const OPP = { z: 20, x0: -16, x1: 16, y0: -7, y1: 10.5, sign: 6.2 };
    // when each window across the street goes dark (song seconds; Infinity: stays lit)
    const OPPWIN = (() => { const out = []; for (let c = 0; c < 14; c++) for (let f = 0; f < 5; f++) { const h = H(c, f, 11); out.push({ c, f, lit: h < 0.72, off: h < 0.6 ? 37.0 + H(c, f, 12) * 5.0 : Infinity, col: [P.gold, P.orange, P.salmon, P.cream, P.cyan][Math.floor(H(c, f, 13) * 5)] }); } return out; })();
    function opposite(g, L, cam, T, d, fx) {
        const { z, x0, x1, y0, y1 } = OPP;
        face(g, cam, [[x0, y0, z], [x1, y0, z], [x1, y1, z], [x0, y1, z]], P.salmon, { m: 0.02 });
        // floors: eyebrow ledges with a lit underside; windows that go dark one by one
        for (let f = 0; f < 5; f++) {
            const yb = y0 + 1.2 + f * 3.3;
            face(g, cam, [[x0, yb + 2.0, z - 0.3], [x1, yb + 2.0, z - 0.3], [x1, yb + 2.15, z - 0.3], [x0, yb + 2.15, z - 0.3]], P.magenta, { m: 0.02 });
            for (let c = 0; c < 14; c++) {
                const w = OPPWIN[c * 5 + f], xa = x0 + 1.0 + c * 2.2, xb = xa + 1.2;
                if (Math.abs((xa + xb) / 2 - OPP.sign) < 1.3) continue;
                const on = w.lit && T < w.off, flick = w.lit && T >= w.off && T < w.off + 0.17 && (Math.floor((T - w.off) * 24) % 2 === 0);
                const col = on || flick ? w.col : '#1a0450';
                const q = face(g, cam, [[xa, yb, z - 0.01], [xb, yb, z - 0.01], [xb, yb + 1.6, z - 0.01], [xa, yb + 1.6, z - 0.01]], col, { m: 0.03, light: on });
                if (q && (on || flick)) { L.save(); L.globalAlpha = 0.45; L.fillStyle = col; Neon.path(L, q); L.fill(); L.restore(); const a = cam.p([xa + 0.15, yb + 0.2, z - 0.02]), b = cam.p([xa + 0.15, yb + 1.4, z - 0.02]); Ink.brush(g, [[a[0], a[1]], [b[0], b[1]]], { w: 1.6, col: P.cream, seed: c * 9 + f, d, taper: 0.4, light: true, alpha: 0.7 }); }
                // a curtain half drawn in some
                if (H(c, f, 14) < 0.4) face(g, cam, [[xa, yb, z - 0.02], [xa + 0.45, yb, z - 0.02], [xa + 0.35, yb + 1.6, z - 0.02], [xa, yb + 1.6, z - 0.02]], P.plum, { w: 0 });
            }
        }
        // the roof's neon band and the blade sign
        tube(g, L, cam, [[x0, y1 - 0.3, z - 0.32], [x1, y1 - 0.3, z - 0.32]], tone(P.cyan, fx), 0.12);
        const sx = OPP.sign, sz = z - 0.9;
        face(g, cam, [[sx - 0.6, -4.0, sz], [sx + 0.6, -4.0, sz], [sx + 0.6, 5.6, sz], [sx - 0.6, 5.6, sz]], P.navy, { m: 0.03 });
        tube(g, L, cam, [[sx - 0.6, -4.0, sz - 0.05], [sx - 0.6, 5.6, sz - 0.05], [sx + 0.6, 5.6, sz - 0.05], [sx + 0.6, -4.0, sz - 0.05], [sx - 0.6, -4.0, sz - 0.05]], tone(P.cyan, fx), 0.09);
        neonText(g, L, cam, 'HOTEL', [sx, 4.4, sz - 0.08], 0.62, 1.62, tone(P.magenta, fx), T);
        // the street's glow rising up the face, and the sky above it
    }
    // neon letters stacked down a blade: each letter's outline as a tube, drawn on a plane facing
    // −z through the camera (an affine fit at each letter); one letter buzzes now and then
    function neonText(g, L, cam, text, top, size, step, col, T) {
        for (let i = 0; i < text.length; i++) {
            const c = [top[0], top[1] - i * step, top[2]], o = cam.p(c), ux = cam.p([c[0] + 1, c[1], c[2]]), vy = cam.p([c[0], c[1] - 1, c[2]]);
            if (o[2] < 0.5) continue;
            const buzz = i === 3 && (Math.floor(T * 12) % 17 === 0 || Math.floor(T * 12) % 17 === 3) ? 0.25 : 1;
            for (const ctx of [g, L]) {
                ctx.save(); ctx.translate(o[0], o[1]); ctx.transform((ux[0] - o[0]) / 100 * size, (ux[1] - o[1]) / 100 * size, (vy[0] - o[0]) / 100 * size, (vy[1] - o[1]) / 100 * size, 0, 0);
                ctx.font = '150px Shrikhand'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
                ctx.globalAlpha = buzz; ctx.strokeStyle = col; ctx.lineWidth = ctx === L ? 18 : 11; ctx.strokeText(text[i], 0, 0);
                if (ctx === g) { ctx.strokeStyle = css(mix(hex(P.magenta), [255, 255, 255], 0.55)); ctx.lineWidth = 4; ctx.strokeText(text[i], 0, 0); }
                ctx.restore();
            }
        }
    }

    function hotelRoom(g, L, cam, T, d, fx, o = {}) {
        const { x0, x1, y0, y1, z } = WIN;
        // through the window: the sky, the hotel across, then the window wall round the opening
        g.save(); const hole = Neon.poly(cam, [[x0, y0, z], [x1, y0, z], [x1, y1, z], [x0, y1, z]]);
        if (hole) { Neon.path(g, hole); g.clip(); g.fillStyle = '#0f0138'; g.fillRect(0, 0, cam.W, cam.H); opposite(g, L, cam, T, d, fx); }
        g.restore();
        // the blinds over the top of the window: slats with the sign's light caught on their edges
        const yb = y0 + (y1 - y0) * 0.66;
        for (let y = y1 - 0.02; y > yb; y -= 0.075) {
            const q = face(g, cam, [[x0, y - 0.042, z - 0.06], [x1, y - 0.042, z - 0.06], [x1, y, z - 0.08], [x0, y, z - 0.08]], '#260a8c', { m: 0.008 });
            if (q) { const a = cam.p([x0 + 1.4, y - 0.04, z - 0.06]), b = cam.p([x1 - 0.05, y - 0.04, z - 0.06]); Ink.brush(g, [[a[0], a[1]], [b[0], b[1]]], { w: cap(0.012 * cam.f / a[2], 1, 4), col: tone(P.pink, fx), seed: Math.round(y * 100), d, taper: 0.3, light: true }); }
        }
        const cord = [cam.p([x1 - 0.15, y1, z - 0.07]), cam.p([x1 - 0.15, yb - 0.25, z - 0.07])];
        Ink.brush(g, cord.map((p) => [p[0], p[1]]), { w: 1.4, col: P.cream, seed: 'cord', d, taper: 0.1 });
        const wallC = '#3c0ca8';
        const wl = [[-2.4, 0, z], [x0, 0, z], [x0, 2.9, z], [-2.4, 2.9, z]], wr = [[x1, 0, z], [2.4, 0, z], [2.4, 2.9, z], [x1, 2.9, z]];
        face(g, cam, wl, wallC, { w: 0 }); face(g, cam, wr, wallC, { w: 0 });
        face(g, cam, [[x0, y1, z], [x1, y1, z], [x1, 2.9, z], [x0, 2.9, z]], wallC, { w: 0 });
        face(g, cam, [[x0, 0, z], [x1, 0, z], [x1, y0, z], [x0, y0, z]], wallC, { w: 0 });
        // the reveal (the wall's thickness) on the sides the camera sees, the frame, the sill
        if (cam.pos[0] > x0) face(g, cam, [[x0, y0, z], [x0, y0, z + 0.22], [x0, y1, z + 0.22], [x0, y1, z]], '#260a8c', { m: 0.02 });
        if (cam.pos[0] < x1) face(g, cam, [[x1, y0, z], [x1, y0, z + 0.22], [x1, y1, z + 0.22], [x1, y1, z]], P.indigo, { m: 0.02 });
        for (const [a, b] of [[[x0 - 0.07, y0 - 0.07], [x1 + 0.07, y0]], [[x0 - 0.07, y1], [x1 + 0.07, y1 + 0.07]], [[x0 - 0.07, y0], [x0, y1]], [[x1, y0], [x1 + 0.07, y1]]]) face(g, cam, [[a[0], a[1], z - 0.01], [b[0], a[1], z - 0.01], [b[0], b[1], z - 0.01], [a[0], b[1], z - 0.01]], P.plum, { m: 0.02 });
        face(g, cam, [[x0 - 0.12, y0 - 0.07, z - 0.16], [x1 + 0.12, y0 - 0.07, z - 0.16], [x1 + 0.12, y0 - 0.07, z], [x0 - 0.12, y0 - 0.07, z]], P.purple, { m: 0.02 });
        // the sign's light on the wall beside the window and down the reveal, as strokes
        const lp = cam.p([x1 + 0.1, y0 + 0.2, z - 0.01]), lp2 = cam.p([x1 + 0.1, y1, z - 0.01]);
        if (lp[2] > 0.3) Ink.hatch(g, [lp2[0], lp2[1]], [lp[0], lp[1]], { count: 6, len: cap(0.25 * cam.f / lp[2], 4, 60), w: lw(cam.f / lp[2], 0.012), col: tone(P.pink, fx), seed: 1201, d, n: [1, 0], ang: 0.4 });
        const lp3 = cam.p([x0 - 0.1, y1, z - 0.01]), lp4 = cam.p([x0 - 0.1, y0 + 0.1, z - 0.01]);
        if (lp3[2] > 0.3) Ink.hatch(g, [lp3[0], lp3[1]], [lp4[0], lp4[1]], { count: 5, len: cap(0.22 * cam.f / lp3[2], 4, 50), w: lw(cam.f / lp3[2], 0.012), col: tone(P.cyan, fx), seed: 1202, d, n: [-1, 0], ang: 0.4 });
        // the floor and the bed (only what the camera sees of it)
        face(g, cam, [[-2.4, 0, 0], [2.4, 0, 0], [2.4, 0, z], [-2.4, 0, z]], '#1a0670', { w: 0 });
        bed(g, L, cam, T, d, fx);
    }
    const BED = { x0: -1.3, x1: 1.05, z0: 0.9, z1: 3.3, y: 0.55 };
    function bed(g, L, cam, T, d, fx) {
        const { x0, x1, z0, z1, y } = BED;
        face(g, cam, [[x0, 0, z0], [x1, 0, z0], [x1, y - 0.05, z0], [x0, y - 0.05, z0]], P.indigo, { m: 0.02 });
        if (cam.pos[0] > x1) face(g, cam, [[x1, 0, z0], [x1, 0, z1], [x1, y - 0.05, z1], [x1, y - 0.05, z0]], P.indigo, { m: 0.02 });
        // the bedspread: royal blue with a pattern of the era (pink triangles, cyan squiggles), the
        // blinds' light across it in bands
        const top = [[x0, y, z0 - 0.04], [x1 + 0.04, y, z0 - 0.04], [x1 + 0.04, y, z1], [x0, y, z1]];
        const q = face(g, cam, top, P.royal, { m: 0.015 });
        face(g, cam, [[x0, y, z0 - 0.04], [x1 + 0.04, y, z0 - 0.04], [x1 + 0.04, y - 0.28, z0 - 0.06], [x0, y - 0.28, z0 - 0.06]], P.royal, { m: 0.015 });
        if (q) {
            g.save(); Neon.path(g, q); g.clip();
            const R = Motion.rng('esc-spread');
            for (let i = 0; i < 70; i++) {
                const px = x0 + R() * (x1 - x0), pz = z0 + R() * (z1 - z0), kind = i % 3, p = cam.p([px, y + 0.002, pz]); if (p[2] < 0.3) continue;
                const s = cam.f / p[2];
                if (kind === 0) Ink.shape(g, [[p[0], p[1] - 0.04 * s], [p[0] + 0.04 * s, p[1] + 0.02 * s], [p[0] - 0.04 * s, p[1] + 0.02 * s]], P.pink, { w: 0, seed: 1300 + i, d, jit: 0.4 });
                else if (kind === 1) Ink.brush(g, [[p[0] - 0.05 * s, p[1]], [p[0] - 0.02 * s, p[1] - 0.015 * s], [p[0] + 0.01 * s, p[1] + 0.01 * s], [p[0] + 0.05 * s, p[1] - 0.005 * s]], { w: cap(0.012 * s, 1, 5), col: P.cyan, seed: 1400 + i, d, taper: 0.2 });
                else { g.fillStyle = P.gold; g.beginPath(); g.arc(p[0], p[1], cap(0.015 * s, 1, 7), 0, Math.PI * 2); g.fill(); }
            }
            // bands of the sign's light through the blinds, slanting across the bed
            for (let k = 0; k < 7; k++) { const z = 1.3 + k * 0.28, w = 0.07; const b = Neon.poly(cam, [[x0, y + 0.003, z], [x1 + 0.1, y + 0.003, z + 0.35], [x1 + 0.1, y + 0.003, z + 0.35 + w], [x0, y + 0.003, z + w]]); if (b) Ink.shape(g, b, tone(P.magenta, fx), { w: 0, alpha: 0.55, light: true, seed: 1500 + k, d, jit: 1 }); }
            g.restore();
        }
        // the pillows at the head (left)
        for (const z of [1.45, 2.4]) face(g, cam, [[x0 + 0.05, y + 0.02, z], [x0 + 0.55, y + 0.02, z], [x0 + 0.55, y + 0.16, z + 0.35], [x0 + 0.05, y + 0.18, z + 0.8], [x0 + 0.05, y + 0.02, z + 0.8]], P.pink, { m: 0.015 });
        face(g, cam, [[x0 - 0.06, 0, z0 - 0.06], [x0 - 0.06, 0, z1], [x0 - 0.06, 1.25, z1], [x0 - 0.06, 1.35, (z0 + z1) / 2], [x0 - 0.06, 1.25, z0 - 0.06]], P.plum, { m: 0.02 });
    }

    // the suitcase: an open hard case on the bed (base 0.62 × 0.42 × 0.17 m, the lid open behind),
    // things dropped into it on the beat by someone outside the frame
    const CASE = { x: -0.05, z: 2.2, y: 0.55, w: 0.62, dz: 0.42, h: 0.17, yaw: 0.12 };
    function suitcase(g, L, cam, T, d, fx, drops) {
        const { x, z, y, w, dz, h, yaw } = CASE, c = Math.cos(yaw), s0 = Math.sin(yaw);
        const W = (u, v, t) => [x + u * c + t * s0, y + v, z - u * s0 + t * c];        // local (u across, v up, t back)
        const S = (pts) => pts.map((p) => W(...p));
        const sc = cam.f / cam.view(W(0, 0.1, 0))[2], m = 0.02;
        // the shadow, the lid (open 100°: its lining faces us), the base's inside, the clothes, the front
        face(g, cam, S([[-w / 2 - 0.02, 0.002, -dz / 2 - 0.03], [w / 2 + 0.03, 0.002, -dz / 2 - 0.03], [w / 2 + 0.04, 0.002, dz / 2 + 0.06], [-w / 2 - 0.02, 0.002, dz / 2 + 0.06]]), P.ink, { w: 0 });
        const la = (100 / 180) * Math.PI, lid = (u, l, n) => [u, h + Math.sin(la) * l + Math.cos(la) * n, dz / 2 - Math.cos(la) * l + Math.sin(la) * n];
        face(g, cam, S([lid(-w / 2, 0, 0.05), lid(w / 2, 0, 0.05), lid(w / 2, dz, 0.05), lid(-w / 2, dz, 0.05)]), P.magenta, { m });
        const lin = face(g, cam, S([lid(-w / 2, 0, 0), lid(w / 2, 0, 0), lid(w / 2, dz, 0), lid(-w / 2, dz, 0)]), P.purple, { m });
        if (lin) { const a = cam.p(W(...lid(-w / 2 + 0.05, dz * 0.47, 0.002))), b = cam.p(W(...lid(w / 2 - 0.05, dz * 0.47, 0.002))); Ink.brush(g, [[a[0], a[1]], [b[0], b[1]]], { w: lw(sc, 0.006), col: P.pink, seed: 1601, d, taper: 0.1 }); }
        face(g, cam, S([[-w / 2, 0.02, -dz / 2], [w / 2, 0.02, -dz / 2], [w / 2, 0.02, dz / 2], [-w / 2, 0.02, dz / 2]]), P.grape, { m });
        face(g, cam, S([[-w / 2, 0.02, dz / 2], [w / 2, 0.02, dz / 2], [w / 2, h, dz / 2], [-w / 2, h, dz / 2]]), P.purple, { m });
        face(g, cam, S([[-w / 2, 0.02, -dz / 2], [-w / 2, 0.02, dz / 2], [-w / 2, h, dz / 2], [-w / 2, h, -dz / 2]]), '#9a3ae8', { m });
        // what lies in it: the dress already in, then the things dropped in on the beat
        const items = [{ at: -1, u: -0.12, t: 0.03, a: 0.1, kind: 'dress' }].concat(drops);
        let level = 0.03;
        for (const it of items) {
            const k = it.at < 0 ? 1 : Ease.seg(T, it.at - 0.25, it.at);
            if (k <= 0) continue;
            const fall = 1 - k * k, bounce = T > it.at ? 0.012 * Math.exp(-(T - it.at) * 12) * Math.abs(Math.sin((T - it.at) * 30)) : 0;
            const yy = level + fall * 0.9 + bounce;
            cloth(g, L, cam, W, it, yy, d, fx, sc);
            if (k >= 1) level += it.kind === 'glasses' ? 0 : 0.028;
        }
        face(g, cam, S([[w / 2, 0, -dz / 2], [w / 2, 0, dz / 2], [w / 2, h, dz / 2], [w / 2, h, -dz / 2]]), '#c80cb8', { m });
        face(g, cam, S([[-w / 2, 0, -dz / 2], [w / 2, 0, -dz / 2], [w / 2, h, -dz / 2], [-w / 2, h, -dz / 2]]), P.magenta, { m });
        // the trim round the rim, the latches, the handle, the light down its edges
        for (const [a, b] of [[[-w / 2, h, -dz / 2], [w / 2, h, -dz / 2]], [[w / 2, h, -dz / 2], [w / 2, h, dz / 2]], [[-w / 2, h, -dz / 2], [-w / 2, h, dz / 2]]]) { const A = cam.p(W(...a)), B = cam.p(W(...b)); Ink.brush(g, [[A[0], A[1]], [B[0], B[1]]], { w: lw(sc, 0.012), col: P.cream, seed: 1610 + Math.round(a[0] * 10 + b[2] * 10), d, taper: 0.05 }); }
        for (const u of [-0.2, 0.2]) face(g, cam, S([[u - 0.025, h - 0.05, -dz / 2 - 0.006], [u + 0.025, h - 0.05, -dz / 2 - 0.006], [u + 0.025, h - 0.005, -dz / 2 - 0.006], [u - 0.025, h - 0.005, -dz / 2 - 0.006]]), P.gold, { m: 0.008, light: true });
        face(g, cam, S([[-0.075, h * 0.5, -dz / 2 - 0.004], [-0.055, h * 0.5, -dz / 2 - 0.004], [-0.055, h * 0.72, -dz / 2 - 0.004], [-0.075, h * 0.72, -dz / 2 - 0.004]]), P.gold, { m: 0.006 });
        face(g, cam, S([[0.055, h * 0.5, -dz / 2 - 0.004], [0.075, h * 0.5, -dz / 2 - 0.004], [0.075, h * 0.72, -dz / 2 - 0.004], [0.055, h * 0.72, -dz / 2 - 0.004]]), P.gold, { m: 0.006 });
        face(g, cam, S([[-0.07, h * 0.55, -dz / 2 - 0.03], [0.07, h * 0.55, -dz / 2 - 0.03], [0.07, h * 0.67, -dz / 2 - 0.03], [-0.07, h * 0.67, -dz / 2 - 0.03]]), P.ink, { m: 0.006 });
        const e0 = cam.p(W(w / 2 - 0.01, 0.02, -dz / 2)), e1 = cam.p(W(w / 2 - 0.01, h - 0.01, -dz / 2));
        Ink.hatch(g, [e1[0], e1[1]], [e0[0], e0[1]], { count: 3, len: cap(0.05 * sc, 3, 30), w: lw(sc, 0.006), col: tone(P.pink, fx), seed: 1630, d, n: [-1, 0], ang: 0.3 });
    }
    // a folded thing lying flat in the case at height yy (local), dropped in on its beat
    function cloth(g, L, cam, W, it, yy, d, fx, sc) {
        const rot = (it.a ?? 0), cu = Math.cos(rot), su = Math.sin(rot);
        const at = (u, t) => W(it.u + u * cu - t * su, yy, it.t + u * su + t * cu);
        const quad = (hu, ht) => [at(-hu, -ht), at(hu, -ht), at(hu, ht), at(-hu, ht)];
        const m = 0.012;
        if (it.kind === 'dress') { face(g, cam, quad(0.2, 0.13), P.magenta, { m }); const p = cam.p(at(0, 0)); Ink.strokes(g, p[0] - 0.15 * sc, p[1] - 0.06 * sc, 0.3 * sc, 0.12 * sc, { count: 16, len: 0.02 * sc, w: lw(sc, 0.006), cols: [P.pink, P.cream, P.salmon], seed: 1701, d }); }
        if (it.kind === 'shirt') {
            face(g, cam, quad(0.17, 0.12), P.violet, { m });
            face(g, cam, [at(-0.17, 0.12), at(0.17, 0.12), at(0.12, 0.06), at(-0.12, 0.06)], '#9a3ae8', { m });
            const R = Motion.rng('esc-shirt');
            for (let i = 0; i < 9; i++) { const p = cam.p(at(-0.14 + R() * 0.28, -0.1 + R() * 0.16)), r = 0.012 * sc; if (i % 3 === 0) { g.fillStyle = P.gold; g.beginPath(); g.arc(p[0], p[1], r, 0, Math.PI * 2); g.fill(); } else if (i % 3 === 1) Ink.shape(g, [[p[0], p[1] - r * 1.4], [p[0] + r * 1.3, p[1] + r], [p[0] - r * 1.3, p[1] + r]], P.pink, { w: 0, seed: 1710 + i, d }); else Ink.brush(g, [[p[0] - r * 2, p[1]], [p[0] - r, p[1] - r * 0.7], [p[0], p[1] + r * 0.5], [p[0] + r * 2, p[1] - r * 0.2]], { w: lw(sc, 0.007), col: P.cyan, seed: 1720 + i, d, taper: 0.2 }); }
        }
        if (it.kind === 'jacket') { face(g, cam, quad(0.16, 0.11), P.pink, { m }); const a = cam.p(at(-0.16, 0)), b = cam.p(at(0.16, 0)); Ink.brush(g, [[a[0], a[1]], [b[0], b[1]]], { w: lw(sc, 0.006), col: P.salmon, seed: 1730, d, taper: 0.1 }); for (const u of [-0.08, 0.08]) { const p = cam.p(at(u, -0.05)); g.fillStyle = P.gold; g.beginPath(); g.arc(p[0], p[1], 0.008 * sc, 0, Math.PI * 2); g.fill(); } }
        if (it.kind === 'glasses') {
            for (const u of [-0.035, 0.035]) { const pts = Array.from({ length: 12 }, (_, k) => at(u + Math.cos((k / 12) * Math.PI * 2) * 0.028, Math.sin((k / 12) * Math.PI * 2) * 0.022)); const q = face(g, cam, pts, P.ink, { m: 0.01 }); if (q) { const p = cam.p(at(u - 0.01, -0.008)); Ink.brush(g, [[p[0], p[1]], [p[0] + 0.012 * sc, p[1] - 0.006 * sc]], { w: lw(sc, 0.005), col: tone(P.cyan, fx), seed: 1740 + Math.round(u * 100), d, taper: 0.3, light: true }); } }
            const a = cam.p(at(-0.007, 0)), b = cam.p(at(0.007, 0)); Ink.brush(g, [[a[0], a[1]], [b[0], b[1]]], { w: lw(sc, 0.006), col: P.gold, seed: 1745, d });
            for (const sgn of [-1, 1]) { const A = cam.p(at(sgn * 0.063, 0)), B = cam.p(at(sgn * 0.07, 0.11)); Ink.brush(g, [[A[0], A[1]], [B[0], B[1]]], { w: lw(sc, 0.006), col: P.gold, seed: 1746 + sgn, d }); }
        }
        if (it.kind === 'tape') { face(g, cam, quad(0.05, 0.032), P.ink, { m: 0.01 }); face(g, cam, quad(0.04, 0.02), P.cream, { m: 0.006 }); face(g, cam, [at(-0.025, -0.006), at(0.025, -0.006), at(0.025, 0.008), at(-0.025, 0.008)], P.orange, { m: 0.004 }); }
    }

    // ==========================================================================================
    // --- Ocean Drive -------------------------------------------------------------------------------
    // the street runs along z: road x −4…4, the kerb and the sidewalk to x 7.5 where the hotels'
    // faces stand; the park with palms and the lamps on the other side, then the beach and the sea.
    // Our hotel is z 0…30; its courtyard and pool z 30…42 (the gate on the sidewalk), the next
    // hotel from z 42
    const HOTELS = (() => {
        const out = [], R = Motion.rng('esc-hotels'), inks = [P.salmon, P.magenta, P.violet, '#9a3ae8', P.purple, P.pink];
        let zz = -260;
        while (zz < 520) { const len = 18 + R() * 22, gap = 1.5 + R() * 4; if (!(zz < 42 && zz + len > 0)) out.push({ z0: zz, z1: zz + len, h: 9 + R() * 12, col: inks[Math.floor(R() * inks.length)], neon: [P.cyan, P.pink, P.mint, P.gold][Math.floor(R() * 4)], tower: R() < 0.5, seed: Math.round(R() * 1e6) }); zz += len + gap; if (zz > -2 && zz < 42) zz = 42; }
        out.push({ z0: 0, z1: 30, h: 13, col: P.salmon, neon: P.cyan, tower: true, seed: 77, ours: true });
        return out;
    })();
    const LAMPS = (() => { const out = []; for (let z = -300; z < 560; z += 18) out.push(z); return out; })();
    const LAMP_X = -4.7, LAMP_H = 5.2;
    const lampHeads = () => LAMPS.map((z) => [LAMP_X + 0.6, LAMP_H, z]);

    // one hotel's face on x = 7.5 (facing the street) and, when the camera is in the courtyard or
    // beyond its ends, its side wall (z = z0 or z1)
    function hotel(g, L, cam, T, d, fx, b) {
        const X = 7.5, xb = 7.5 + 30, Wf = wall([X, b.z1], [X, b.z0]);        // u runs towards −z
        const near = cam.view(Wf.at(Wf.len / 2, 5))[2]; if (near < 0.5 && cam.pos[0] < X) return;
        const dark = (u, v) => (b.ours ? 0.55 : 0.38) + H(b.seed, Math.round(u * 3 + v * 7), 1) * 0.5;
        const sleep = (T - 36.7) / 9;                                     // fewer windows lit as the night goes on
        const wallFace = (Wl, len, side) => {
            face(g, cam, rect(Wl, 0, len, 0, b.h), b.col, { m: 0.02 });
            // eyebrows over the windows, floor by floor; windows lit or asleep; the light caught on the edges
            for (let f = 0; f < Math.floor((b.h - 3) / 3.1); f++) {
                const v0 = 3.4 + f * 3.1;
                face(g, cam, rect(Wl, 0.3, len - 0.3, v0 + 1.75, v0 + 1.92), b.col === P.magenta ? P.plum : P.magenta, { m: 0.015 });
                for (let u = 1.2; u < len - 1.6; u += 2.4) {
                    const h = H(b.seed + f * 31, Math.round(u * 10), side), on = h < dark(u, f) - sleep && h < 0.62;
                    const col = on ? [P.gold, P.orange, P.salmon, P.cyan][Math.floor(H(b.seed, f, Math.round(u)) * 4)] : P.deep;
                    const q = face(g, cam, rect(Wl, u, u + 1.1, v0, v0 + 1.5), col, { m: 0.02, light: on });
                    if (q && on) { L.save(); L.globalAlpha = 0.35; L.fillStyle = col; Neon.path(L, q); L.fill(); L.restore(); }
                }
            }
            // the ground floor: an arcade, dark, with lit doors
            face(g, cam, rect(Wl, 0.4, len - 0.4, 0, 2.7), P.plum, { m: 0.02 });
            for (let u = 2; u < len - 2; u += 5) { const q = face(g, cam, rect(Wl, u, u + 1.4, 0, 2.2), b.ours ? P.gold : P.orange, { m: 0.02, light: true }); if (q) { L.save(); L.globalAlpha = 0.4; L.fillStyle = P.orange; Neon.path(L, q); L.fill(); L.restore(); } }
            tube(g, L, cam, [Wl.at(0.2, 2.95), Wl.at(len - 0.2, 2.95)], tone(b.neon, fx), 0.08);
            tube(g, L, cam, [Wl.at(0.2, b.h - 0.4), Wl.at(len - 0.2, b.h - 0.4)], tone(b.col === P.pink ? P.cyan : P.pink, fx), 0.08);
            // vertical fins with tubes up the middle
            const um = len / 2;
            face(g, cam, rect(Wl, um - 0.45, um + 0.45, 2.9, b.h + (b.tower ? 4 : 0)), b.col === P.salmon ? P.magenta : P.salmon, { m: 0.02 });
            tube(g, L, cam, [Wl.at(um, 3.1), Wl.at(um, b.h + (b.tower ? 3.8 : -0.2))], tone(b.neon, fx), 0.08);
            if (b.tower) { face(g, cam, [Wl.at(um - 1.6, b.h), Wl.at(um + 1.6, b.h), Wl.at(um + 1.0, b.h + 1.4), Wl.at(um + 0.45, b.h + 1.4), Wl.at(um + 0.45, b.h + 4.2), Wl.at(um - 0.45, b.h + 4.2), Wl.at(um - 0.45, b.h + 1.4), Wl.at(um - 1.0, b.h + 1.4)], b.col, { m: 0.02 }); }
            // light strokes on the edges facing the street lamps
            const e0 = cam.p(Wl.at(0.1, 3)), e1 = cam.p(Wl.at(0.1, b.h - 0.5)); if (e0[2] > 0.5) Ink.hatch(g, [e1[0], e1[1]], [e0[0], e0[1]], { count: 4, len: cap(0.6 * cam.f / e0[2], 3, 40), w: lw(cam.f / e0[2], 0.03), col: P.cyan, seed: b.seed + side, d, ang: 0.6 });
        };
        // the sides seen from the courtyard or past the ends
        if (cam.pos[2] < b.z0) wallFace(wall([xb, b.z0], [X, b.z0]), 30, 1);
        if (cam.pos[2] > b.z1) wallFace(wall([X, b.z1], [xb, b.z1]), 30, 2);
        if (cam.pos[0] < X) wallFace(Wf, Wf.len, 0);
    }

    // a palm on the park's grass (the film's palm, compact): trunk, crownshaft, fronds
    function palm(g, L, cam, x, z, seed, T, d, fx) {
        const R = Motion.rng('esc-palm' + seed), Hh = 9 + R() * 3, lean = (R() - 0.5) * 0.9;
        const base = cam.p([x, 0, z]), top = cam.p([x + lean, Hh, z]); if (top[2] < 0.6 || base[2] < 0.6) return;
        const s = cam.f / top[2];
        const pts = []; for (let i = 0; i <= 9; i++) { const u = i / 9, p = cam.p([x + lean * u * u, Hh * 0.92 * u, z]), w = (0.22 - 0.07 * u) * cam.f / p[2]; pts.push([p[0], p[1], w]); }
        Ink.shape(g, pts.map((p) => [p[0] - p[2], p[1]]).concat(pts.slice().reverse().map((p) => [p[0] + p[2], p[1]])), P.purple, { w: s > 7 ? lw(s, 0.05) : 0, seed: seed * 7 + 1, d, jit: 0.3 });
        if (s > 8) for (let i = 1; i < 9; i++) { const p = pts[i]; Ink.brush(g, [[p[0] - p[2] * 0.8, p[1]], [p[0] + p[2] * 0.8, p[1] + p[2] * 0.12]], { w: cap(0.03 * s, 0.8, 2.5), seed: seed * 13 + i, d, taper: 0.4, alpha: 0.7 }); }
        if (s > 5) { Ink.brush(g, pts.map((p) => [p[0] + p[2] * 0.6, p[1]]), { w: cap(0.05 * s, 1, 4), col: tone(P.salmon, fx), seed: seed * 17, d, taper: 0.3 }); Ink.brush(g, pts.slice(0, 7).map((p) => [p[0] - p[2] * 0.6, p[1]]), { w: cap(0.04 * s, 1, 3), col: tone(P.cyan, fx), seed: seed * 19, d, taper: 0.3 }); }
        const P0 = [x + lean, Hh, z], sway = Math.sin(T * 1.3 + seed) * 0.08, fr = [];
        for (let i = 0; i < 13; i++) { const an = (i / 13) * Math.PI * 2 + R() * 0.3; fr.push({ an, dx: Math.cos(an), dz: Math.sin(an), len: 3.0 + R() * 1.2, arch: 0.8 + R() * 0.6 }); }
        const toC = [cam.pos[0] - P0[0], cam.pos[2] - P0[2]]; fr.sort((a, b) => (a.dx * toC[0] + a.dz * toC[1]) - (b.dx * toC[0] + b.dz * toC[1]));
        for (const f of fr) {
            const pt = (u) => cam.p([P0[0] + f.dx * f.len * u, P0[1] + f.arch * Math.sin(u * Math.PI * 0.7) - u * u * (2.2 + sway * 8 * f.dx), P0[2] + f.dz * f.len * u]);
            const rib = []; for (let j = 0; j <= 8; j++) rib.push(pt(j / 8));
            if (rib.some((p) => p[2] < 0.5)) continue;
            const wd = (j) => (0.24 * Math.sin((j / 8) * Math.PI * 0.95 + 0.1)) * cam.f / rib[j][2];
            const up = rib.map((p, j) => [p[0], p[1] - wd(j) * 0.35]), dn = rib.map((p, j) => [p[0], p[1] + wd(j) * 0.8]);
            Ink.shape(g, up.concat(dn.reverse()), f.dz * toC[1] + f.dx * toC[0] > 0 ? P.plum : P.grape, { w: s > 9 ? lw(s, 0.05) : 0, seed: seed * 101 + Math.round(f.an * 10), d, jit: 0.4 });
            if (s > 12) for (let j = 2; j <= 8; j++) { const p = rib[j], ll = wd(j) * 1.1; Ink.brush(g, [[p[0], p[1] + wd(j) * 0.4], [p[0] + ll * 0.3, p[1] + ll]], { w: cap(0.04 * s, 1, 3), seed: seed * 997 + Math.round(f.an * 10) * 13 + j, d, taper: 0.5, wob: 0.4 }); }
            if (s > 6) Ink.brush(g, rib.slice(1, 6).map((p, j) => [p[0], p[1] - wd(j + 1) * 0.3]), { w: cap(0.04 * s, 1, 3.5), col: f.dx > 0 ? tone(P.pink, fx) : tone(P.cyan, fx), seed: seed * 31 + Math.round(f.an * 10), d, taper: 0.4 });
        }
    }
    // a Deco street lamp: a post, a bracket and a lantern that glows
    function lamp(g, L, cam, z, d, fx) {
        const b = cam.p([LAMP_X, 0, z]), t = cam.p([LAMP_X, LAMP_H + 0.2, z]); if (t[2] < 0.6 || b[2] < 0.6) return;
        const s = cam.f / t[2], sb = cam.f / b[2];
        Ink.shape(g, [[b[0] - 0.12 * sb, b[1]], [t[0] - 0.05 * s, t[1]], [t[0] + 0.05 * s, t[1]], [b[0] + 0.12 * sb, b[1]]], '#1a0450', { w: lw(s, 0.03), seed: Math.round(z * 13), d, jit: 0.3 });
        const hd = cam.p([LAMP_X + 0.6, LAMP_H, z]), arm = cam.p([LAMP_X + 0.6, LAMP_H + 0.35, z]);
        Ink.brush(g, [[t[0], t[1]], [arm[0], arm[1]], [hd[0], hd[1]]], { w: cap(0.06 * s, 1, 8), seed: Math.round(z * 17), d, taper: 0.1 });
        const hs = cam.f / hd[2], r = cap(0.22 * hs, 1.5, 60);
        Ink.shape(g, Array.from({ length: 14 }, (_, k) => [hd[0] + Math.cos((k / 14) * Math.PI * 2) * r * 0.8, hd[1] + r * 0.5 + Math.sin((k / 14) * Math.PI * 2) * r]), P.gold, { w: lw(hs, 0.03), seed: Math.round(z * 19), d, light: true });
        glint(L, hd[0], hd[1] + r * 0.5, cap(0.9 * hs, 3, 90), P.orange, { alpha: 0.6, halo: fx.halo, star: fx.star * 0.5, rays: 4 });
    }

    function street(g, L, cam, T, d, fx, env, extra = {}) {
        const zc = cam.pos[2], zA = zc - 220, zB = zc + 420;
        // the sea beyond the park and the beach: a navy band to the horizon, the moon's path
        const seaQ = Neon.poly(cam, [[-14, -0.3, zA], [-14, -0.3, zB], [-3000, -0.3, zB + 2000], [-3000, -0.3, zA - 2000]]);
        if (seaQ) { Ink.shape(g, seaQ, '#18065e', { w: 0 }); g.save(); Neon.path(g, seaQ); g.clip(); const R = Motion.rng('esc-sea'); for (let i = 0; i < 70; i++) { const p = cam.p([-20 - Math.pow(R(), 1.6) * 900, -0.3, zc - 300 + R() * 900]); if (p[2] < 2) continue; const l = Math.min(60, 6000 / p[2] + 4); Ink.brush(g, [[p[0] - l / 2, p[1]], [p[0] + l / 2, p[1] + 0.5]], { w: Math.min(4, 1 + 200 / p[2]), col: [P.violet, P.purple, P.royal, P.salmon][i % 4], seed: 2000 + i, d, taper: 0.45, alpha: 0.7 }); } g.restore(); }
        face(g, cam, [[-14, -0.25, zA], [-14, -0.25, zB], [-4, 0, zB], [-4, 0, zA]], '#0e0558', { w: 0 });
        face(g, cam, [[-4, 0, zA], [-4, 0, zB], [4, 0, zB], [4, 0, zA]], '#1a0670', { w: 0 });
        face(g, cam, [[4, 0.15, zA], [4, 0.15, zB], [7.5, 0.15, zB], [7.5, 0.15, zA]], '#3c0ca8', { w: 0 });
        face(g, cam, [[4, 0, zA], [4, 0, zB], [4, 0.15, zB], [4, 0.15, zA]], P.indigo, { w: 0 });
        // the road's paint, kerb lines, the pools of lamp light and their gold streaks on the asphalt
        for (let z = Math.floor(zA / 9) * 9; z < zB; z += 9) { const q = Neon.poly(cam, [[-0.08, 0.005, z], [0.08, 0.005, z], [0.08, 0.005, z + 3.5], [-0.08, 0.005, z + 3.5]]); if (q) Ink.shape(g, q, '#e8b04a', { w: 0, light: true, jit: 0 }); }
        for (const x of [4, -4]) { const a = cam.p([x, x > 0 ? 0.15 : 0.0, Math.max(zA, zc + 0.5)]), b = cam.p([x, x > 0 ? 0.15 : 0, zB]); if (a[2] > 0.3) Ink.brush(g, [[a[0], a[1]], [b[0], b[1]]], { w: 2.5, seed: 'kerb' + x, d, taper: 0.01 }); }
        for (const z of LAMPS) {
            if (z < zc - 30 || z > zc + 200) continue;
            for (const [rz, col] of [[1, P.indigo], [0.6, '#4a10c8']]) { const pts = []; for (let i = 0; i < 40; i++) { const an = (i / 40) * Math.PI * 2; pts.push([LAMP_X + 2.6 + Math.cos(an) * 2.8 * rz, 0.004, z + Math.sin(an) * 5 * rz]); } const q = Neon.poly(cam, pts); if (q) Ink.shape(g, q, col, { w: 0, jit: 0 }); }
            for (let j = 0; j < 5; j++) { const zz = z - 0.8 - j * 1.1; const p = cam.p([LAMP_X + 1.0, 0.01, zz]); if (p[2] < 0.6) continue; const s = cam.f / p[2], w = Math.min(80, (0.3 + j * 0.1) * s); Ink.brush(g, [[p[0] - w / 2, p[1]], [p[0] + w / 2, p[1] + 0.5]], { w: cap(0.05 * s, 1, 5), col: [P.gold, P.orange, P.salmon][j % 3], seed: Math.round(z * 13) + j, d, taper: 0.45, light: true }); }
        }
        // what stands: hotels, palms, lamps, sorted far to near, with the scene's own items
        const items = [];
        if (!extra.noHotels) for (const b of HOTELS) { if (b.z1 < zc - 200 || b.z0 > zc + 400) continue; const zn = cam.pos[2] < b.z0 ? b.z0 : cam.pos[2] > b.z1 ? b.z1 : cam.pos[2]; items.push({ depth: Math.hypot(7.5 - cam.pos[0], zn - cam.pos[2]) + (b.ours ? -0.01 : 0), draw: () => hotel(g, L, cam, T, d, fx, b) }); }
        for (let z = -300, i = 0; z < 560; z += 11, i++) { if (z < zc - 40 || z > zc + 260) continue; const x = -7 - (i % 3) * 1.6; items.push({ depth: cam.view([x, 5, z])[2], draw: () => palm(g, L, cam, x, z, i, T, d, fx) }); }
        for (const z of LAMPS) { if (z < zc - 30 || z > zc + 240) continue; items.push({ depth: cam.view([LAMP_X, 3, z])[2], draw: () => lamp(g, L, cam, z, d, fx) }); }
        for (const it of extra.items ?? []) items.push(it);
        items.filter((it) => it.depth > 0.3).sort((a, b) => b.depth - a.depth).forEach((it) => it.draw());
    }

    // the courtyard: the deck, the pool glowing from inside (caustics, its lights), the coping, a
    // ladder, the gate onto the sidewalk with a Deco arch of neon
    const POOL = { x0: 10, x1: 24, z0: 31.9, z1: 36.6 };
    function courtyardFloor(g, L, cam, T, d, fx) {
        face(g, cam, [[7.6, 0.16, 30], [40, 0.16, 30], [40, 0.16, 42], [7.6, 0.16, 42]], '#3c0ca8', { w: 0 });
        for (let x = 8; x < 40; x += 1.2) { const a = cam.p([x, 0.17, 30]), b = cam.p([x, 0.17, 42]); if (a[2] > 0.3 && b[2] > 0.3) Ink.brush(g, [[a[0], a[1]], [b[0], b[1]]], { w: 1.2, col: '#260a8c', seed: Math.round(x * 10), d, taper: 0.02, alpha: 0.8 }); }
        const { x0, x1, z0, z1 } = POOL;
        face(g, cam, [[x0 - 0.35, 0.18, z0 - 0.35], [x1 + 0.35, 0.18, z0 - 0.35], [x1 + 0.35, 0.18, z1 + 0.35], [x0 - 0.35, 0.18, z1 + 0.35]], P.salmon, { m: 0.02 });
        const water = face(g, cam, [[x0, 0.02, z0], [x1, 0.02, z0], [x1, 0.02, z1], [x0, 0.02, z1]], tone(P.cyan, fx), { w: 2 });
        if (water) {
            L.save(); L.globalAlpha = 0.3; L.fillStyle = tone(P.aqua, fx); Neon.path(L, water); L.fill(); L.restore();
            g.save(); Neon.path(g, water); g.clip();
            // the inner wall seen across the water (darker), the caustic net, the lights under water
            face(g, cam, [[x0, 0.02, z1], [x1, 0.02, z1], [x1, -0.25, z1], [x0, -0.25, z1]], P.blue, { w: 0, alpha: 0.5 });
            for (let i = 0; i < 46; i++) {
                const px = x0 + 0.5 + H(i, 1, 0) * (x1 - x0 - 1), pz = z0 + 0.3 + H(i, 2, 0) * (z1 - z0 - 0.6), ph = H(i, 3, 0) * 6;
                const pts = []; for (let k = 0; k < 4; k++) pts.push(cam.p([px + Math.cos(ph + k * 1.6 + T * 0.9) * 0.45 * k * 0.4, 0.03, pz + Math.sin(ph + k * 2.1 - T * 0.7) * 0.3]));
                if (pts.some((p) => p[2] < 0.5)) continue;
                Ink.brush(g, pts.map((p) => [p[0], p[1]]), { w: cap(0.04 * cam.f / pts[0][2], 1, 5), col: i % 3 ? P.aqua : P.cream, seed: 2100 + i, d, taper: 0.3, alpha: 0.85, light: true });
            }
            for (let x = x0 + 2; x < x1; x += 4) { const p = cam.p([x, -0.1, z1 - 0.05]); if (p[2] > 0.5) glint(L, p[0], p[1], cap(0.9 * cam.f / p[2], 4, 120), P.aqua, { alpha: 0.6, halo: fx.halo }); }
            g.restore();
        }
        // the ladder at the far end: two chrome rails
        for (const dz of [-0.3, 0.3]) { const a = cam.p([x0 + 1.2, 0.18, z1 + 0.05 + dz * 0]), q = [cam.p([x0 + 1.2 + dz, 0.18, z1 + 0.25]), cam.p([x0 + 1.2 + dz, 1.0, z1 + 0.2]), cam.p([x0 + 1.2 + dz, 1.05, z1 - 0.1]), cam.p([x0 + 1.2 + dz, 0.4, z1 - 0.2])]; if (q.every((p) => p[2] > 0.4)) Ink.brush(g, q.map((p) => [p[0], p[1]]), { w: cap(0.04 * cam.f / q[1][2], 1, 6), col: P.cream, seed: 2200 + Math.round(dz * 10), d, taper: 0.05 }); }
    }
    // loungers along the near side of the pool and palms in planters along the walls
    function courtyardThings(g, L, cam, T, d, fx) {
        const items = [];
        for (let x = 11; x < 24; x += 3.2) items.push({ depth: cam.view([x, 0.4, 31.0])[2], draw: () => {
            face(g, cam, [[x, 0.45, 30.35], [x + 1.9, 0.45, 30.35], [x + 1.9, 0.45, 31.1], [x, 0.45, 31.1]], P.cream, { m: 0.02 });
            face(g, cam, [[x, 0.45, 31.1], [x + 1.9, 0.45, 31.1], [x + 1.9, 0.2, 31.1], [x, 0.2, 31.1]], P.pink, { m: 0.02 });
            for (let k = 0; k < 5; k++) { const a = cam.p([x + 0.2 + k * 0.38, 0.46, 30.4]), b = cam.p([x + 0.2 + k * 0.38, 0.46, 31.05]); if (a[2] > 0.3) Ink.brush(g, [[a[0], a[1]], [b[0], b[1]]], { w: 1.4, col: P.cyan, seed: 2300 + k + Math.round(x), d, taper: 0.2 }); }
        } });
        for (const [x, z] of [[10, 41.2], [18, 41.2], [26, 41.2], [34, 41.2], [10, 30.6], [32, 30.6]]) items.push({ depth: cam.view([x, 3, z])[2], draw: () => { face(g, cam, [[x - 0.5, 0.16, z - 0.45], [x + 0.5, 0.16, z - 0.45], [x + 0.5, 0.9, z - 0.45], [x - 0.5, 0.9, z - 0.45]], P.plum, { m: 0.02 }); palm(g, L, cam, x, z, 50 + x, T, d, fx); } });
        return items;
    }
    // the gate: the low wall along the sidewalk with an opening and a stepped arch of neon over it
    function gate(g, L, cam, T, d, fx) {
        const X = 7.55;
        for (const [z0, z1] of [[30, 34], [38, 42]]) face(g, cam, [[X, 0, z0], [X, 0, z1], [X, 1.5, z1], [X, 1.5, z0]], P.magenta, { m: 0.02 });
        const arch = [[X, 0, 34], [X, 3.1, 34], [X, 3.1, 34.4], [X, 3.6, 34.4], [X, 3.6, 35], [X, 3.95, 35], [X, 3.95, 37], [X, 3.6, 37], [X, 3.6, 37.6], [X, 3.1, 37.6], [X, 3.1, 38], [X, 0, 38]];
        const outer = [[X, 0, 33.6], [X, 3.4, 33.6], [X, 3.4, 34.0], [X, 3.9, 34.0], [X, 3.9, 34.6], [X, 4.3, 34.6], [X, 4.3, 37.4], [X, 3.9, 37.4], [X, 3.9, 38.0], [X, 3.4, 38.0], [X, 3.4, 38.4], [X, 0, 38.4]];
        // the arch's frame as two posts and a stepped lintel (the opening left clear)
        face(g, cam, [outer[0], outer[1], outer[2], outer[3], outer[4], outer[5], outer[6], outer[7], outer[8], outer[9], outer[10], outer[11], arch[11], arch[10], arch[9], arch[8], arch[7], arch[6], arch[5], arch[4], arch[3], arch[2], arch[1], arch[0]], P.salmon, { m: 0.02 });
        tube(g, L, cam, arch.slice(1, 11).map((p) => [p[0] - 0.08, p[1] + 0.12, p[2]]), tone(P.cyan, fx), 0.06);
        tube(g, L, cam, outer.slice(1, 11).map((p) => [p[0] - 0.08, p[1] - 0.1, p[2]]), tone(P.pink, fx), 0.06);
    }

    return { sky, face, tube, fig, wall, silhouettes, room, ball, spots, crowd, barTop, hotelRoom, suitcase, street, courtyardFloor, courtyardThings, gate, hotel, palm, lamp, lampHeads, glint, CROWD, BALL, PILL, GL, CASE, POOL, WIN, BED, tone, cap, lw };
})();
