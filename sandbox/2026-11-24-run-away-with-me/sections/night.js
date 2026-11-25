// uses: (none: everything of this section lives in this file)
// Section · the night together, 2:11–2:43 (bars 65–81): chorus 2, by ellipsis. A hotel room
// high over Ocean Drive: venetian blinds laying stripes of the neon sign outside across the
// room and across two silhouettes, a crumpled bed, clothes on a chair, a fan turning, a TV of
// static, a clock flipping its minutes; the pool below with the two of them under its cyan
// water; a steamed window over the sea. On each «out» (143.56, 159.56: chorus 1's cues + 66.56)
// the lights go out and the two of them remain as neon outlines (film.js's blackout: a ring of
// their own layer, glowing), back on the next bar line with a flash. Contract: sections/README.md.
(() => {
    const BAR = 2.01672, B = (n) => 0.415 + n * BAR;
    const FROM = B(65), TO = B(81);
    const OUT3 = 143.56, BACK3 = B(72), OUT4 = 159.56, BACK4 = B(80);
    const P = Ink.PAL, hex = Neon.hex, css = Neon.css, mix = Neon.mix;
    const cap = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
    const lw = (s, m = 0.05) => cap(m * s, 1.2, 6);
    const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    const norm = (v) => { const l = Math.hypot(v[0], v[1], v[2]); return [v[0] / l, v[1] / l, v[2] / l]; };
    const win = (T, a, b, up = 0.06, down = 0.12) => Math.min(Ease.seg(T, a, a + up), 1 - Ease.seg(T, b - down, b));
    const sAt = (cam, p) => cam.f / Math.max(0.3, cam.view(p)[2]);

    // [start, end, name] in song seconds, on bar lines
    const SHOTS = [
        [B(65), B(66), '1 · the camera rises to their window'],
        [B(66), B(68), '2 · stripes of neon over the two of them'],
        [B(68), B(69), '3 · the light slides over their faces'],
        [B(69), B(70), '4 · the fan turns over the bed'],
        [B(70), B(72), '5 · the lights go out (room)'],
        [B(72), B(74), '6 · under the cyan water'],
        [B(74), B(76), '7 · every single minute'],
        [B(76), B(78), '8 · the steamed window'],
        [B(78), B(80), '9 · the lights go out (pool)'],
        [B(80), B(81), '10 · away from their window'],
    ];
    const shotIndex = (T) => { const i = SHOTS.findIndex(([a, b]) => T >= a && T < b); return i < 0 ? (T < FROM ? 0 : SHOTS.length - 1) : i; };

    // what the music does here: the sign pulses on every beat, the two blacks, the flashes
    function effects(T) {
        const kick = Song.env('kick', T), bass = Song.env('bass', T), mid = Song.env('mid', T);
        const ba = Song.beatAt(T), beat = Math.floor(ba), bf = ba - beat;
        const black = Math.max(win(T, OUT3, BACK3), win(T, OUT4, BACK4));
        const flash = [FROM, BACK3, BACK4].reduce((m, c) => Math.max(m, T >= c ? 0.5 * Math.exp(-(T - c) * 9) : 0), 0);
        const strike = T < FROM + 0.35 ? (Ink.hsh(Math.floor(T * 12), 3, 1) > 0.35 ? 1 : 0.25) : 1;
        const pulse = (0.6 + 0.4 * Math.exp(-bf * 5)) * strike;       // the sign: full on the beat, settling
        return { kick, bass, mid, beat, bf, black, flash, pulse, hue: 0, hold: 0, trip: 0, star: 0, halo: 1 + mid * 0.3 };
    }

    // --- small drawing helpers ---------------------------------------------------------------
    const quad = (g, cam, pts, fill, o) => { const q = Neon.poly(cam, pts); if (q) Ink.shape(g, q, fill, o); return q; };
    // a box of flat faces turned to the camera, each a shade of `col`; o.cols per face
    function box(g, cam, x0, x1, y0, y1, z0, z1, col, seed, d, o = {}) {
        const faces = [
            ['top', [[x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]], [0, 1, 0], 1.0],
            ['bot', [[x0, y0, z0], [x0, y0, z1], [x1, y0, z1], [x1, y0, z0]], [0, -1, 0], 0.45],
            ['front', [[x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0]], [0, 0, -1], 0.8],
            ['back', [[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]], [0, 0, 1], 0.8],
            ['left', [[x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0]], [-1, 0, 0], 0.62],
            ['right', [[x1, y0, z0], [x1, y0, z1], [x1, y1, z1], [x1, y1, z0]], [1, 0, 0], 0.62],
        ];
        const s = sAt(cam, [(x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2]), out = {};
        for (const [name, pts, n, k] of faces) {
            const c = pts[0]; if ((cam.pos[0] - c[0]) * n[0] + (cam.pos[1] - c[1]) * n[1] + (cam.pos[2] - c[2]) * n[2] <= 0) continue;
            const fill = o.cols?.[name] ?? css(mix(col, '#04022e', 1 - k));
            out[name] = quad(g, cam, pts, fill, { w: o.w ?? lw(s, 0.012), seed: seed + name.length * 17 + Math.round(k * 100), d, jit: 0.4 });
        }
        return out;
    }
    // a point of light on the light layer only
    const glow = (L, x, y, r, col, a = 0.6) => Neon.last.glint(null, L, x, y, r, typeof col === 'string' ? hex(col) : col, { lightOnly: true, alpha: a, star: 0 });
    // a 3D polyline as a neon tube (picture + light), width in metres
    function tube3(g, L, cam, pts, col, wm, on = 1) {
        const Q = pts.map(cam.p); if (Q.some((p) => p[2] < 0.3)) return;
        const w = cap(wm * cam.f / Q[0][2], 1.2, 14);
        Neon.last.tube(g, L, (c) => { c.beginPath(); Q.forEach((p, i) => (i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]))); }, col, w, { on, white: 0.55 });
    }
    const ring3 = (c, r, n = 24, plane = 'xy') => { const o = []; for (let i = 0; i <= n; i++) { const a = (i / n) * Math.PI * 2; o.push(plane === 'xy' ? [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r, c[2]] : [c[0] + Math.cos(a) * r, c[1], c[2] + Math.sin(a) * r]); } return o; };

    // a palm (the causeway's, at any base height): trunk to a crownshaft, arched fronds
    function palm(g, cam, x, yb, z, seed, T, d, o = {}) {
        const R = Motion.rng('nightpalm' + seed), H = (o.H ?? 12) + R() * 2, lean = (R() - 0.5) * 0.8;
        const top = cam.p([x + lean, yb + H, z]); if (top[2] < 0.6) return;
        const s = cam.f / top[2];
        if (!o.noTrunk) {
            const pts = []; for (let i = 0; i <= 9; i++) { const u = i / 9, p = cam.p([x + lean * u * u, yb + H * 0.9 * u, z]); if (p[2] < 0.5) return; pts.push([p[0], p[1], (0.3 - 0.1 * u) * cam.f / p[2]]); }
            const outline = pts.map((p) => [p[0] - p[2], p[1]]).concat(pts.slice().reverse().map((p) => [p[0] + p[2], p[1]]));
            Ink.shape(g, outline, P.purple, { w: s > 7 ? lw(s, 0.06) : 0, seed: seed * 7 + 1, d, jit: 0.4 });
            if (s > 5) Ink.brush(g, pts.map((p) => [p[0] - p[2] * 0.6, p[1]]), { w: cap(0.05 * s, 1, 4), col: P.cyan, seed: seed * 17, d, taper: 0.3 });
            if (s > 10) for (let i = 1; i < 9; i++) { const p = pts[i]; Ink.brush(g, [[p[0] - p[2] * 0.8, p[1]], [p[0] + p[2] * 0.8, p[1] + p[2] * 0.12]], { w: cap(0.03 * s, 0.8, 2.5), seed: seed * 13 + i, d, taper: 0.4, alpha: 0.7 }); }
        }
        const n = 15, sway = Math.sin(T * 1.6 + seed) * 0.05, fr = [];
        for (let i = 0; i < n; i++) { const an = (i / n) * Math.PI * 2 + R() * 0.25; fr.push({ an, dx: Math.cos(an), dz: Math.sin(an), len: 3.4 + R() * 1.2, arch: 0.9 + R() * 0.6 }); }
        // far fronds first: by their tips' depth from this camera
        const P0 = [x + lean, yb + H, z];
        fr.forEach((f) => { f.dep = cam.view([P0[0] + f.dx * 2, P0[1], P0[2] + f.dz * 2])[2]; });
        fr.sort((a, b) => b.dep - a.dep);
        for (const f of fr) {
            const pt = (u) => cam.p([P0[0] + f.dx * f.len * u, P0[1] + f.arch * Math.sin(u * Math.PI * 0.7) - u * u * (2.4 + sway * 10 * f.dx), P0[2] + f.dz * f.len * u * 0.9]);
            const rib = []; for (let j = 0; j <= 8; j++) rib.push(pt(j / 8));
            if (rib.some((p) => p[2] < 0.5)) continue;
            const width = (j) => (0.26 * Math.sin((j / 8) * Math.PI * 0.95 + 0.1)) * cam.f / rib[j][2];
            // the leaf's normal on screen: perpendicular to the rib
            const nrm = (j) => { const a = rib[Math.max(0, j - 1)], b = rib[Math.min(8, j + 1)], tx = b[0] - a[0], ty = b[1] - a[1], l = Math.hypot(tx, ty) || 1; return [-ty / l, tx / l]; };
            const up = rib.map((p, j) => { const nn = nrm(j); return [p[0] - nn[0] * width(j) * 0.45, p[1] - nn[1] * width(j) * 0.45]; });
            const dn = rib.map((p, j) => { const nn = nrm(j); return [p[0] + nn[0] * width(j) * 0.8, p[1] + nn[1] * width(j) * 0.8]; });
            Ink.shape(g, up.concat(dn.reverse()), f.dz > 0 ? P.grape : P.plum, { w: s > 9 ? lw(s, 0.05) : 0, seed: seed * 101 + Math.round(f.an * 10), d, jit: s > 9 ? 0.5 : 0 });
            if (s > 12) for (let j = 2; j <= 8; j++) { const p = rib[j], nn = nrm(j), ll = width(j) * 1.1; Ink.brush(g, [[p[0], p[1]], [p[0] + nn[0] * ll, p[1] + nn[1] * ll]], { w: cap(0.04 * s, 1, 3), seed: seed * 997 + Math.round(f.an * 10) * 13 + j, d, taper: 0.5, wob: 0.4 }); }
            if (s > 6) Ink.brush(g, rib.slice(1, 6), { w: cap(0.04 * s, 1, 3.5), col: f.dx > 0 ? P.pink : P.cyan, seed: seed * 31 + Math.round(f.an * 10), d, taper: 0.4 });
        }
    }

    // ================================================================================== the room
    // metres; floor y = 0, the window wall at z = 5.2, the bed on the right, the chair on the left
    const RM = { x0: -2.6, x1: 2.6, z0: -1.6, z1: 5.2, h: 2.8 };
    const WIN = { x0: -1.4, x1: 1.4, y0: 0.5, y1: 2.5, z: 5.2 };
    const SLATS = 24, PITCH = (WIN.y1 - WIN.y0) / SLATS;
    const FIG = { her: [-0.31, 0, 4.42], him: [0.31, 0, 4.48] };
    // the gaps between the slats, as heights on the window (blinds down and tilted open)
    const GAPS = []; for (let i = 0; i < SLATS; i++) { const top = WIN.y1 - i * PITCH; GAPS.push([top - PITCH, top - PITCH * 0.6]); }
    // the sign's light through the blinds: from the right, falling into the room
    const lightDir = (T, slide = 0) => norm([-0.34 + 0.03 * Math.sin(T * 0.7), -0.42 + slide, -1]);
    const signCol = (fx) => css(mix(P.magenta, P.pink, 0.25 + 0.35 * (fx.pulse - 0.6) / 0.4));

    // the light of each gap pushed along D onto the plane n·p = c, as flat light (screen)
    function stripes(g, cam, D, n, c, col, a, T, d, seed, xr = [WIN.x0, WIN.x1], op = 'screen') {
        const nd = dot(n, D); if (Math.abs(nd) < 1e-4) return;
        g.save(); g.globalCompositeOperation = op;
        GAPS.forEach(([ya, yb], i) => {
            const pts = [[xr[0], ya], [xr[1], ya], [xr[1], yb], [xr[0], yb]].map(([x, y]) => { const p = [x, y, WIN.z], t = (c - dot(n, p)) / nd; return t > 0 ? [p[0] + D[0] * t, p[1] + D[1] * t, p[2] + D[2] * t] : null; });
            if (pts.some((p) => !p)) return;
            const q = Neon.poly(cam, pts); if (!q) return;
            Ink.shape(g, q, col, { w: 0, light: true, jit: 1.6, seed: seed + i * 7, d, alpha: a });
        });
        g.restore();
    }

    // the world outside the window (room coordinates), painted first and bloomed: the sky, the
    // moon over the Atlantic, a ship's lights, the neighbouring tower, the hotel's own fin and
    // its neon sign right beside the window
    function outside(g, L, cam, T, d, fx, env) {
        const wq = Neon.poly(cam, [[WIN.x0, WIN.y0, WIN.z], [WIN.x1, WIN.y0, WIN.z], [WIN.x1, WIN.y1, WIN.z], [WIN.x0, WIN.y1, WIN.z]]);
        if (!wq) return;
        g.save(); Neon.path(g, wq); g.clip(); L.save(); Neon.path(L, wq); L.clip();
        const horizon = cam.p([cam.pos[0], cam.pos[1], cam.pos[2] + 9000])[1];
        Drawn.sky(g, cam, T, d, fx, env, horizon);
        // the sea: navy to the horizon, brushed, with the moon's road of strokes
        const sea = [[-3000, -27, 6000], [3000, -27, 6000], [3000, -27, 60], [-3000, -27, 60]];
        quad(g, cam, sea, P.navy, { w: 0, seed: 77, d, jit: 0 });
        Ink.strokes(g, 0, horizon + 4, env.W, 90, { ang: 0, count: 22, len: 120, w: 3, cols: [P.deep, '#18065e'], seed: 61, d, alpha: 0.8 });
        const mo = cam.p([cam.pos[0] + Math.sin(0.5) * 9000, cam.pos[1], cam.pos[2] + Math.cos(0.5) * 9000]);
        for (let k = 0; k < 14; k++) { const u = (k + 0.5) / 14, y = horizon + 3 + u * u * 160, l = (10 + 40 * u) * (0.6 + Ink.hsh(k, 3, 0)); Ink.brush(g, [[mo[0] - l / 2 + Ink.noise(k, T * 0.7, 0) * 6, y], [mo[0] + l / 2 + Ink.noise(k, T * 0.7, 0) * 6, y + 0.5]], { w: 2 + u * 2, col: k % 3 ? P.cream : P.gold, seed: 500 + k, d, taper: 0.4, light: true, alpha: 0.85 }); }
        // a ship on the horizon, its lights
        for (let k = 0; k < 5; k++) { const p = cam.p([-900 + k * 9 + T * 0.6, -26, 4000]); if (p[2] > 1) { g.fillStyle = k % 2 ? P.gold : P.cream; g.fillRect(p[0] - 1.5, p[1] - 4, 3, 3); glow(L, p[0], p[1] - 3, 6, P.gold, 0.5); } }
        // the neighbouring tower to the left: a flat face of lit windows, a neon crown
        const tw = [[-40, -26, 46], [-14, -26, 46], [-14, 14, 46], [-40, 14, 46]];
        quad(g, cam, tw, P.royal, { w: 3, seed: 81, d, jit: 0.5 });
        for (let fl = 0; fl < 13; fl++) for (let c = 0; c < 8; c++) {
            if (Ink.hsh(fl, c, 9) > 0.45) continue;
            const x = -38 + c * 3, y = -24 + fl * 3;
            const q = Neon.poly(cam, [[x, y, 46], [x + 1.8, y, 46], [x + 1.8, y + 1.4, 46], [x, y + 1.4, 46]]); if (!q) continue;
            g.fillStyle = [P.orange, P.gold, P.salmon, P.cyan][Math.floor(Ink.hsh(fl, c, 4) * 4)]; Neon.path(g, q); g.fill();
        }
        tube3(g, L, cam, [[-40, 14.2, 45.9], [-14, 14.2, 45.9]], hex(P.cyan), 0.4);
        // the hotel's own fin, right beside the window, and the sign on its face: a column of
        // rings that light one after another on the beat, a star on top that pulses
        box(g, cam, 1.85, 2.45, -30, 9, 5.25, 6.6, P.salmon, 91, d, { cols: { left: P.purple, front: P.plum, top: P.salmon } });
        for (let i = 0; i < 6; i++) {
            const y = -1.6 + i * 1.05, lit = (fx.beat - i) % 6 === 0 || (fx.beat - i) % 6 === -0 ? 1 : 0.55;
            const pts = []; for (let j = 0; j <= 20; j++) { const a = (j / 20) * Math.PI * 2; pts.push([1.84, y + Math.sin(a) * 0.36, 5.9 + Math.cos(a) * 0.4]); }
            tube3(g, L, cam, pts, hex(i % 2 ? P.cyan : P.magenta), 0.07, lit * (i % 2 ? 1 : fx.pulse));
        }
        tube3(g, L, cam, [[1.84, -3, 5.3], [1.84, 6, 5.3]], hex(P.pink), 0.06, fx.pulse);
        g.restore(); L.restore();
    }

    // the room, painted near-to-the-camera last. o: { blinds: 'down' | 'up', view: 'side' | 'back',
    // slide (stripes sliding), steam (0..1), figs: false }. Returns the figures' layer (for the black).
    function room(g, L, cam, T, d, fx, env, o = {}) {
        const D = lightDir(T, o.slide ?? 0), sc = signCol(fx), down = (o.blinds ?? 'down') === 'down';
        const sa = 0.55 * fx.pulse + 0.25 * fx.kick;
        // walls, floor, ceiling (the back wall in four pieces round the window)
        const wallB = '#2b0b78', wallL = '#220a66', wallR = '#1d075a', floor = '#2a0750', ceil = '#120440';
        quad(g, cam, [[RM.x0, RM.h, RM.z0], [RM.x1, RM.h, RM.z0], [RM.x1, RM.h, RM.z1], [RM.x0, RM.h, RM.z1]], ceil, { w: 0, seed: 1, d });
        quad(g, cam, [[RM.x0, 0, RM.z0], [RM.x0, 0, RM.z1], [RM.x0, RM.h, RM.z1], [RM.x0, RM.h, RM.z0]], wallL, { w: 3, seed: 2, d });
        quad(g, cam, [[RM.x1, 0, RM.z0], [RM.x1, 0, RM.z1], [RM.x1, RM.h, RM.z1], [RM.x1, RM.h, RM.z0]], wallR, { w: 3, seed: 3, d });
        for (const [x0, x1, y0, y1] of [[RM.x0, RM.x1, WIN.y1, RM.h], [RM.x0, RM.x1, 0, WIN.y0], [RM.x0, WIN.x0, WIN.y0, WIN.y1], [WIN.x1, RM.x1, WIN.y0, WIN.y1]])
            quad(g, cam, [[x0, y0, RM.z1], [x1, y0, RM.z1], [x1, y1, RM.z1], [x0, y1, RM.z1]], wallB, { w: 0, seed: 4 + x0, d });
        const fq = quad(g, cam, [[RM.x0, 0, RM.z0], [RM.x1, 0, RM.z0], [RM.x1, 0, RM.z1], [RM.x0, 0, RM.z1]], floor, { w: 3, seed: 5, d });
        // the carpet's pile: short strokes in a darker plum
        if (fq) { g.save(); Neon.path(g, fq); g.clip(); for (let i = 0; i < 26; i++) { const p = cam.p([RM.x0 + 0.2 + Ink.hsh(i, 1, 0) * 5, 0, Math.max(cam.pos[2] + 0.8, 0) + Ink.hsh(i, 2, 0) * 4.2]); if (p[2] > 0.5) Ink.brush(g, [[p[0] - 14, p[1]], [p[0] + 14, p[1] + 1]], { w: 2.5, col: '#3a0b6a', seed: 40 + i, d, taper: 0.4, light: true }); } g.restore(); }
        walls2(g, L, cam, T, d, fx);
        // a Deco frieze under the ceiling: a band of salmon with a cyan line
        quad(g, cam, [[RM.x0, 2.55, RM.z1 - 0.01], [RM.x1, 2.55, RM.z1 - 0.01], [RM.x1, 2.62, RM.z1 - 0.01], [RM.x0, 2.62, RM.z1 - 0.01]], P.plum, { w: 0, seed: 6, d });
        quad(g, cam, [[RM.x0 + 0.01, 2.55, RM.z0], [RM.x0 + 0.01, 2.55, RM.z1], [RM.x0 + 0.01, 2.62, RM.z1], [RM.x0 + 0.01, 2.62, RM.z0]], P.plum, { w: 0, seed: 7, d });
        quad(g, cam, [[RM.x1 - 0.01, 2.55, RM.z0], [RM.x1 - 0.01, 2.55, RM.z1], [RM.x1 - 0.01, 2.62, RM.z1], [RM.x1 - 0.01, 2.62, RM.z0]], P.plum, { w: 0, seed: 8, d });
        // the window: sill, jambs, blinds over the outside
        if (down) {
            for (let i = 0; i < SLATS; i++) {
                const top = WIN.y1 - i * PITCH, yb = top - PITCH * 0.6;
                const q = Neon.poly(cam, [[WIN.x0, yb, WIN.z - 0.02], [WIN.x1, yb, WIN.z - 0.02], [WIN.x1, top, WIN.z - 0.02], [WIN.x0, top, WIN.z - 0.02]]); if (!q) continue;
                const s = sAt(cam, [0, top, WIN.z]);
                Ink.shape(g, q, i % 2 ? '#3a0f86' : '#36107e', { w: lw(s, 0.006), seed: 100 + i, d, jit: 0.5 });
                // the slat's lower lip catches the sign: a stroke of light
                const a = cam.p([WIN.x0 + 0.05, yb + 0.006, WIN.z - 0.03]), b = cam.p([WIN.x1 - 0.05, yb + 0.006, WIN.z - 0.03]);
                Ink.brush(g, [[a[0], a[1]], [b[0], b[1]]], { w: cap(0.008 * s, 1, 3), col: i % 3 ? sc : P.cyan, seed: 130 + i, d, taper: 0.2, alpha: 0.75 * fx.pulse, light: true });
            }
            // the cords of the blinds
            for (const x of [-0.7, 0.7]) { const a = cam.p([x, WIN.y1, WIN.z - 0.04]), b = cam.p([x, WIN.y0, WIN.z - 0.04]); Ink.brush(g, [[a[0], a[1]], [b[0], b[1]]], { w: 1.4, seed: 160 + x * 10, d, taper: 0.05 }); }
        } else {
            // raised: the slats stacked at the head, the glass steamed
            box(g, cam, WIN.x0, WIN.x1, WIN.y1 - 0.22, WIN.y1, WIN.z - 0.08, WIN.z - 0.02, '#3a0f86', 170, d);
            for (let i = 0; i < 6; i++) { const y = WIN.y1 - 0.22 + i * 0.037, a = cam.p([WIN.x0, y, WIN.z - 0.081]), b = cam.p([WIN.x1, y, WIN.z - 0.081]); Ink.brush(g, [[a[0], a[1]], [b[0], b[1]]], { w: 1.4, col: i % 2 ? P.ink : sc, seed: 180 + i, d, taper: 0.1, light: i % 2 === 1 }); }
        }
        box(g, cam, WIN.x0 - 0.08, WIN.x1 + 0.08, WIN.y0 - 0.06, WIN.y0, WIN.z - 0.2, WIN.z, P.plum, 190, d, { cols: { top: P.purple } });
        box(g, cam, WIN.x0 - 0.08, WIN.x0, WIN.y0, WIN.y1, WIN.z - 0.1, WIN.z, P.plum, 195, d);
        box(g, cam, WIN.x1, WIN.x1 + 0.08, WIN.y0, WIN.y1, WIN.z - 0.1, WIN.z, P.plum, 196, d);
        // curtains, gathered either side: salmon cloth with fold lines
        for (const [xa, xb, sd] of [[WIN.x0 - 0.55, WIN.x0 - 0.02, 200], [WIN.x1 + 0.02, WIN.x1 + 0.55, 210]]) {
            const pts = []; for (let i = 0; i <= 8; i++) { const u = i / 8; pts.push([xa + (xb - xa) * u, 2.62, WIN.z - 0.12 - 0.04 * Math.sin(u * Math.PI * 4)]); }
            for (let i = 8; i >= 0; i--) { const u = i / 8; pts.push([xa + (xb - xa) * u + (sd === 200 ? 0.05 : -0.05), 0.02, WIN.z - 0.12 - 0.04 * Math.sin(u * Math.PI * 4)]); }
            const q = Neon.poly(cam, pts); if (!q) continue;
            const s = sAt(cam, [xa, 1.3, WIN.z]);
            Ink.shape(g, q, '#b0247e', { w: lw(s, 0.008), seed: sd, d, jit: 0.6 });
            for (let k = 1; k < 5; k++) { const x = xa + (xb - xa) * k / 5, a = cam.p([x, 2.55, WIN.z - 0.15]), b = cam.p([x + 0.02, 0.1, WIN.z - 0.15]); Ink.brush(g, [[a[0], a[1]], [(a[0] + b[0]) / 2 + 3, (a[1] + b[1]) / 2], [b[0], b[1]]], { w: cap(0.01 * s, 1, 3), col: k % 2 ? P.ink : P.magenta, seed: sd + k, d, taper: 0.3, alpha: 0.8 }); }
        }
        // stripes on the floor and the back wall's lower part (from the window down into the room)
        if (down) {
            stripes(g, cam, D, [0, 1, 0], 0, sc, sa, T, d, 300);
            stripes(g, cam, D, [1, 0, 0], RM.x0, sc, sa * 0.8, T, d, 330);
        } else {
            // blinds up: one wide patch of the sign's light on the floor
            g.save(); g.globalCompositeOperation = 'screen';
            const pts = [[WIN.x0, WIN.y0], [WIN.x1, WIN.y0], [WIN.x1, WIN.y1], [WIN.x0, WIN.y1]].map(([x, y]) => { const t = -y / D[1]; return [x + D[0] * t, 0, WIN.z + D[2] * t]; });
            const q = Neon.poly(cam, pts); if (q) Ink.shape(g, q, sc, { w: 0, light: true, seed: 340, d, alpha: sa * 0.6 });
            g.restore();
        }
        rug(g, cam, D, sc, sa, T, d);
        // the TV's cold light on the floor before it, the corridor's warm wedge from the door
        for (const [pts, col, a, sd] of [[[[-2.1, 0.014, 2.45], [-0.95, 0.014, 2.2], [-0.8, 0.014, 3.7], [-2.1, 0.014, 3.45]], '#2a6a9a', (0.3 + 0.2 * Ink.hsh(3, 3, d)) * (1 - fx.black), 350], [doorLight(g, fx), '#a0602a', 0.8 * (1 - fx.black), 351]]) {
            const q = Neon.poly(cam, pts); if (q) { g.save(); g.globalCompositeOperation = 'screen'; Ink.shape(g, q, col, { w: 0, light: true, seed: sd, d, alpha: a }); g.restore(); }
        }

        // the furniture, far to near (by depth from this camera)
        const items = [
            { at: [-1.5, 0.6, 3.5], draw: () => chair(g, cam, T, d, fx, D, sc, sa) },
            { at: [-2.35, 0.6, 2.95], draw: () => tv(g, L, cam, T, d, fx) },
            { at: [-2.35, 0.6, 1.75], draw: () => dresser(g, L, cam, T, d, fx, sc) },
            { at: [1.55, 0.4, 2.75], draw: () => bed(g, cam, T, d, fx, D, sc, sa) },
            { at: [2.3, 0.5, 4.0], draw: () => nightstand(g, L, cam, T, d, fx) },
            { at: [0.2, 2.6, 2.8], draw: () => fan(g, cam, T, d) },
            { at: [-0.85, 0.05, 2.9], draw: () => heels(g, cam, d) },
        ];
        let figPic = null;
        if (o.figs !== false) items.push({ at: [0, 1, FIG.her[2]], draw: () => { figPic = figures(g, L, cam, T, d, fx, env, D, sc, sa, o); } });
        for (const it of items) it.dep = cam.view(it.at)[2];
        items.sort((a, b) => b.dep - a.dep);
        for (const it of items) if (it.dep > -1.5) it.draw();
        return figPic;
    }

    // the two of them by the window: silhouettes with the blinds' stripes across them, on their
    // own layer (for the outline when the lights go out)
    function figures(g, L, cam, T, d, fx, env, D, sc, sa, o) {
        const view = o.view ?? 'side', back = view === 'back';
        const her = back ? [-0.3, 0, 4.6] : FIG.her, him = back ? [0.3, 0, 4.62] : FIG.him;
        const pic = Motion.layer(env, 'nightFig', (c) => {
            const order = [['her', her], ['him', him]].sort((a, b) => cam.view(b[1])[2] - cam.view(a[1])[2]);
            for (const [who, p] of order) Couple.standing(c, cam, who, p, { view, T, d, ...(o.cut ? { cut: o.cut } : {}), sway: Math.sin(T * 0.9 + (who === 'her' ? 0 : 2)) * 0.004 });
            // into the dark: a deep violet over the drawing, the drawing still faintly there
            c.globalCompositeOperation = 'source-atop';
            c.globalAlpha = o.dark ?? 0.8; c.fillStyle = '#0b0330'; c.fillRect(0, 0, env.W, env.H); c.globalAlpha = 1;
            // the stripes on the plane they stand in
            if ((o.blinds ?? 'down') === 'down') stripes(c, cam, D, [0, 0, 1], (her[2] + him[2]) / 2, sc, Math.min(0.85, sa * (o.stripeOnFigs ?? 1.1)), T, d, 400, [WIN.x0, WIN.x1], 'source-atop');
            else {
                // the sign's light on the edge that faces it (from the right), as a rim
                c.globalCompositeOperation = 'source-atop';
            }
        });
        // erase the light behind them, then lay them on the picture
        L.save(); L.setTransform(1, 0, 0, 1, 0, 0); L.globalCompositeOperation = 'destination-out'; L.drawImage(pic, 0, 0); L.restore();
        g.drawImage(pic, 0, 0, env.W, env.H);
        if ((o.blinds ?? 'down') !== 'down') rim(g, env, pic, -3, 1, sc, 0.9 * fx.pulse);
        return pic;
    }
    // a rim of colour on the edge of a layer's figures that faces (-dx, -dy)
    function rim(g, env, pic, dx, dy, col, a) {
        const k = env.k, R = Motion.layer(env, 'nightRim', () => {}), G = R.getContext('2d');
        G.setTransform(1, 0, 0, 1, 0, 0); G.drawImage(pic, 0, 0);
        G.globalCompositeOperation = 'source-in'; G.fillStyle = col; G.fillRect(0, 0, R.width, R.height);
        G.globalCompositeOperation = 'destination-out'; G.drawImage(pic, dx * k, dy * k);
        G.globalCompositeOperation = 'source-over';
        g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = a; g.drawImage(R, 0, 0); g.restore();
    }

    // the bed: a low Deco frame against the right wall, a crumpled sheet thrown back, two pillows
    function bed(g, cam, T, d, fx, D, sc, sa) {
        const x0 = 0.55, x1 = 2.55, z0 = 1.85, z1 = 3.65, s = sAt(cam, [1.5, 0.5, 2.7]);
        box(g, cam, x0, x1, 0, 0.32, z0, z1, '#3a0d6e', 500, d);
        // the headboard: a tall panel with a rounded top, ribbed
        const hb = []; for (let i = 0; i <= 12; i++) { const u = i / 12, z = z0 - 0.05 + (z1 - z0 + 0.1) * u; hb.push([x1 + 0.04, 1.05 + 0.18 * Math.sin(u * Math.PI), z]); }
        hb.push([x1 + 0.04, 0, z1 + 0.05], [x1 + 0.04, 0, z0 - 0.05]);
        const hq = Neon.poly(cam, hb); if (hq) { Ink.shape(g, hq, P.purple, { w: lw(s, 0.012), seed: 510, d, jit: 0.5 }); for (let k = 1; k < 6; k++) { const z = z0 + (z1 - z0) * k / 6, a = cam.p([x1 + 0.03, 0.4, z]), b = cam.p([x1 + 0.03, 1.08 + 0.15 * Math.sin((k / 6) * Math.PI), z]); Ink.brush(g, [[a[0], a[1]], [b[0], b[1]]], { w: cap(0.008 * s, 1, 3), col: k % 2 ? P.ink : P.pink, seed: 520 + k, d, taper: 0.2, alpha: 0.8 }); } }
        // the mattress under the sheet, then the sheet: a lumpy top over the mattress and a fall
        // over the edge towards us with a ragged hem
        box(g, cam, x0 + 0.03, x1 - 0.03, 0.32, 0.55, z0 + 0.03, z1 - 0.03, '#9a62d8', 530, d, { cols: { top: '#b47ae6' } });
        const lump = (x, z) => 0.58 + 0.09 * Math.sin(x * 4.1 + 1.3) * Math.cos(z * 3.3) + 0.05 * Math.sin(x * 9 + z * 7);
        const top = [], NS = 10;
        for (let i = 0; i <= NS; i++) top.push([x0 - 0.02 + (x1 - 0.45 - x0) * i / NS, 0, z0 - 0.04]);
        for (let i = 0; i <= NS; i++) top.push([x1 - 0.45 + 0.12 * Math.sin(i), 0, z0 + (z1 - z0) * i / NS]);
        for (let i = NS; i >= 0; i--) top.push([x0 - 0.02 + (x1 - 0.5 - x0) * i / NS, 0, z1 + 0.03]);
        for (const p of top) p[1] = lump(p[0], p[2]);
        const tq = Neon.poly(cam, top); if (tq) Ink.shape(g, tq, '#d79af0', { w: lw(s, 0.012), seed: 540, d, jit: 0.6 });
        // the fall towards us (the face at z0): a skirt with a ragged hem
        const fall = []; for (let i = 0; i <= NS; i++) { const x = x0 - 0.02 + (x1 - 0.45 - x0) * i / NS; fall.push([x, lump(x, z0 - 0.04), z0 - 0.04]); }
        for (let i = NS; i >= 0; i--) { const x = x0 - 0.02 + (x1 - 0.45 - x0) * i / NS; fall.push([x + 0.02 * Math.sin(i * 2.3), 0.08 + 0.12 * Ink.hsh(i, 5, 0), z0 - 0.09 - 0.04 * Ink.hsh(i, 6, 0)]); }
        const fq = Neon.poly(cam, fall); if (fq) Ink.shape(g, fq, '#b97ee4', { w: lw(s, 0.012), seed: 545, d, jit: 0.6 });
        // folds: curved strokes across the sheet, the deep ones in ink, the lit ones in pink
        for (let k = 0; k < 9; k++) {
            const xa = x0 + 0.15 + Ink.hsh(k, 1, 0) * 1.3, za = z0 + 0.1 + Ink.hsh(k, 2, 0) * 1.5, l = 0.3 + Ink.hsh(k, 3, 0) * 0.4, an = Ink.hsh(k, 4, 0) * 3;
            const pts = []; for (let j = 0; j <= 4; j++) { const u = j / 4, x = xa + Math.cos(an) * l * u, z = za + Math.sin(an) * l * u + 0.06 * Math.sin(u * 3); pts.push(cam.p([x, lump(x, z) + 0.01, z])); }
            if (pts.some((p) => p[2] < 0.3)) continue;
            Ink.brush(g, pts, { w: cap(0.012 * s, 1, 4), col: k % 3 ? '#6a2aa0' : P.cream, seed: 550 + k, d, taper: 0.45 });
        }
        for (let k = 0; k < 6; k++) { const a = fq ? fall[k + 2] : null; if (!a) break; const p0 = cam.p(a), p1 = cam.p([a[0] + 0.03, 0.15, z0 - 0.1]); Ink.brush(g, [[p0[0], p0[1]], [p1[0], p1[1]]], { w: cap(0.01 * s, 1, 3), col: '#5a2a9a', seed: 570 + k, d, taper: 0.4 }); }
        // pillows by the headboard, one knocked crooked
        for (const [zc, tilt, sd] of [[2.3, 0.1, 580], [3.15, -0.25, 590]]) {
            const pts = []; for (let i = 0; i < 14; i++) { const a = (i / 14) * Math.PI * 2, r = 1 + 0.12 * Math.cos(a * 2); pts.push([x1 - 0.28 + Math.cos(a + tilt) * 0.22 * r, 0.7 + 0.05 * Math.sin(a), zc + Math.sin(a + tilt) * 0.36 * r]); }
            const q = Neon.poly(cam, pts); if (q) Ink.shape(g, q, '#f0b8f4', { w: lw(s, 0.012), seed: sd, d, jit: 0.6 });
        }
        // the sign's stripes across the sheet
        if (tq) { g.save(); Neon.path(g, tq); g.clip(); stripes(g, cam, D, [0, 1, 0], 0.62, sc, Math.min(1, sa * 1.2), T, d, 600); g.restore(); }
    }

    // a flat profile (metres: x across, y up) stood up in the world facing the camera at c
    function bb(cam, c, pts, rot = 0) {
        const dx = c[0] - cam.pos[0], dz = c[2] - cam.pos[2], l = Math.hypot(dx, dz) || 1, rx = dz / l, rz = -dx / l, cr = Math.cos(rot), sr = Math.sin(rot);
        return pts.map(([x, y]) => { const X = x * cr - y * sr, Y = x * sr + y * cr; return [c[0] + rx * X, c[1] + Y, c[2] + rz * X]; });
    }
    const vline = (g, cam, a3, b3, col, seed, d, m = 0.012, alpha = 0.55) => { const a = cam.p(a3), b = cam.p(b3); if (a[2] < 0.3 || b[2] < 0.3) return; const s = cam.f / Math.min(a[2], b[2]); Ink.brush(g, [[a[0], a[1]], [b[0], b[1]]], { w: cap(m * s, 1, 3), col, seed, d, taper: 0.3, wob: 0.6, alpha, light: true }); };

    // the walls' texture (a Deco pinstripe, broken), the framed print, the door ajar with the
    // corridor's light in its gap and on the floor
    function walls2(g, L, cam, T, d, fx) {
        for (let z = 0.2; z < 5.1; z += 0.42) for (const [x, col, sd] of [[RM.x0 + 0.004, '#33107a', 0], [RM.x1 - 0.004, '#2c0c72', 50]]) {
            if (x < 0 && z > 3.85 && z < 4.95) continue;
            vline(g, cam, [x, 0.15, z], [x, 1.15 + 0.25 * Ink.hsh(Math.round(z * 10), sd, 0), z], col, 2000 + sd + Math.round(z * 10), d);
            vline(g, cam, [x, 1.42 + 0.12 * Ink.hsh(Math.round(z * 10), sd + 1, 0), z], [x, 2.48, z], col, 2100 + sd + Math.round(z * 10), d);
        }
        for (let x = RM.x0 + 0.2; x < RM.x1; x += 0.42) {
            if (x > WIN.x0 - 0.6 && x < WIN.x1 + 0.6) vline(g, cam, [x, 0.05, RM.z1 - 0.004], [x, WIN.y0 - 0.1, RM.z1 - 0.004], '#3a1288', 2200 + Math.round(x * 10), d);
            else if (!(x > 1.9 && x < 2.6)) vline(g, cam, [x, 0.15, RM.z1 - 0.004], [x, 2.45, RM.z1 - 0.004], '#3a1288', 2300 + Math.round(x * 10), d);
        }
        // a framed print on the back wall: a striped sun going into the sea
        const zb = RM.z1 - 0.012, X = (u) => 1.99 + u * 0.5, Y = (v) => 1.2 + v * 0.66;
        const PQ = (u0, v0, u1, v1, z) => [[X(u0), Y(v0), z], [X(u1), Y(v0), z], [X(u1), Y(v1), z], [X(u0), Y(v1), z]];
        const sP = sAt(cam, [2.25, 1.55, zb]);
        if (quad(g, cam, PQ(-0.05, -0.04, 1.05, 1.04, zb), P.gold, { w: lw(sP, 0.01), seed: 2400, d })) {
            quad(g, cam, PQ(0.07, 0.05, 0.93, 0.95, zb - 0.003), '#1a0a5a', { w: lw(sP, 0.005), seed: 2401, d });
            const sun = []; for (let i = 0; i <= 16; i++) { const a = (Math.PI * i) / 16; sun.push([X(0.5 + Math.cos(a) * 0.3), Y(0.4 + Math.sin(a) * 0.23), zb - 0.005]); }
            quad(g, cam, sun, P.orange, { w: 0, seed: 2402, d });
            for (const [v, h] of [[0.47, 0.03], [0.53, 0.025], [0.58, 0.02]]) quad(g, cam, PQ(0.15, v, 0.85, v + h, zb - 0.006), '#1a0a5a', { w: 0, seed: 2403 + Math.round(v * 100), d });
            quad(g, cam, PQ(0.07, 0.05, 0.93, 0.4, zb - 0.006), P.deep, { w: 0, seed: 2406, d });
            for (let k = 0; k < 4; k++) vline(g, cam, [X(0.3 + 0.06 * k), Y(0.33 - k * 0.07), zb - 0.007], [X(0.7 - 0.06 * k), Y(0.33 - k * 0.07), zb - 0.007], P.salmon, 2410 + k, d, 0.012, 0.9);
            vline(g, cam, [X(-0.05), Y(1.04), zb - 0.004], [X(1.05), Y(1.04), zb - 0.004], P.cyan, 2415, d, 0.01, 0.9);
        }
        // the door, ajar: hinged at its far side, opened a little into the room
        const xw = RM.x0, dz0 = 3.95, dz1 = 4.85, dh = 2.1, op = 0.3, sD = sAt(cam, [xw, 1, 4.4]);
        const gap = quad(g, cam, [[xw + 0.003, 0, dz0], [xw + 0.003, 0, dz1], [xw + 0.003, dh, dz1], [xw + 0.003, dh, dz0]], '#ffc27a', { w: 0, seed: 2450, d, light: true });
        if (gap) { L.save(); Neon.path(L, gap); L.globalAlpha = 0.3 * (1 - fx.black); L.fillStyle = P.orange; L.fill(); L.restore(); }
        box(g, cam, xw, xw + 0.05, 0, dh + 0.08, dz0 - 0.08, dz0, P.salmon, 2455, d);
        box(g, cam, xw, xw + 0.05, dh, dh + 0.08, dz0, dz1 + 0.08, P.salmon, 2456, d);
        const fxx = xw + 0.9 * Math.sin(op), fz = dz1 - 0.9 * Math.cos(op), D2 = (t, y) => [xw + (fxx - xw) * t + 0.004, y, dz1 + (fz - dz1) * t];
        if (quad(g, cam, [D2(0, 0), D2(1, 0), D2(1, dh - 0.02), D2(0, dh - 0.02)], '#5a1a8a', { w: lw(sD, 0.01), seed: 2460, d, jit: 0.4 })) {
            for (const [t0, t1, y0, y1] of [[0.15, 0.85, 1.15, 1.9], [0.15, 0.85, 0.15, 0.95]]) { const pts = [D2(t0, y0), D2(t1, y0), D2(t1, y1), D2(t0, y1), D2(t0, y0)].map(cam.p); if (pts.every((p) => p[2] > 0.3)) Ink.brush(g, pts, { w: cap(0.01 * sD, 1, 3), col: '#3a0a66', seed: 2461 + y0 * 10, d, taper: 0.05 }); }
            const a = cam.p(D2(1, 0.02)), b = cam.p(D2(1, dh - 0.04));
            Ink.brush(g, [[a[0], a[1]], [b[0], b[1]]], { w: cap(0.014 * sD, 1, 4), col: P.gold, seed: 2465, d, taper: 0.1, light: true });
            const kn = cam.p(D2(0.88, 1.0)), r = cap(0.03 * sD, 2, 8);
            g.fillStyle = P.gold; g.beginPath(); g.arc(kn[0], kn[1], r, 0, Math.PI * 2); g.fill();
            // a card on the knob, a crescent on it (no words)
            const t0 = cam.p(D2(0.9, 0.96)), t1 = cam.p(D2(0.8, 0.96)), t2 = cam.p(D2(0.8, 0.7)), t3 = cam.p(D2(0.9, 0.7));
            Ink.shape(g, [[t0[0], t0[1]], [t1[0], t1[1]], [t2[0], t2[1]], [t3[0], t3[1]]], P.cream, { w: cap(0.006 * sD, 1, 2), seed: 2466, d });
            const mc = cam.p(D2(0.85, 0.8)); g.fillStyle = P.magenta; g.beginPath(); g.arc(mc[0], mc[1], r * 0.9, 0, Math.PI * 2); g.fill(); g.fillStyle = P.cream; g.beginPath(); g.arc(mc[0] + r * 0.4, mc[1] - r * 0.2, r * 0.8, 0, Math.PI * 2); g.fill();
        }
    }
    // the corridor's light on the floor from the door's gap
    function doorLight(g, fx) { return [[RM.x0, 0.006, 3.95], [RM.x0 + 1.4, 0.006, 3.55], [RM.x0 + 1.5, 0.006, 3.95], [RM.x0 + 0.26, 0.006, 4.1]]; }

    // the rug: a salmon border, a field of indigo, a Deco fan at its heart; the sign's stripes
    // break over it (their own colour on its pile)
    function rug(g, cam, D, sc, sa, T, d) {
        const x0 = -1.6, x1 = 0.35, z0 = 1.2, z1 = 3.9, y = 0.012, R = (u, v) => [x0 + (x1 - x0) * u, y, z0 + (z1 - z0) * v];
        const s = sAt(cam, R(0.5, 0.5));
        const q = quad(g, cam, [R(0, 0), R(1, 0), R(1, 1), R(0, 1)], P.salmon, { w: lw(s, 0.008), seed: 2500, d, jit: 0.6 });
        if (!q) return;
        quad(g, cam, [R(0.07, 0.05), R(0.93, 0.05), R(0.93, 0.95), R(0.07, 0.95)], '#241070', { w: 0, seed: 2501, d });
        for (const [r, col] of [[0.34, P.salmon], [0.25, P.cyan], [0.16, P.salmon]]) { const pts = []; for (let i = 0; i <= 18; i++) { const a = Math.PI * (i / 18); pts.push(cam.p(R(0.5 + Math.cos(a) * r, 0.2 + Math.sin(a) * r * 0.7))); } if (pts.every((p) => p[2] > 0.3)) Ink.brush(g, pts, { w: cap(0.025 * s, 1.2, 5), col, seed: 2510 + Math.round(r * 100), d, taper: 0.1 }); }
        for (let i = 0; i < 14; i++) { const u = 0.05 + i * 0.065; for (const v of [0, 1]) { const a = cam.p(R(u, v)), b = cam.p(R(u, v + (v ? 0.03 : -0.03))); Ink.brush(g, [[a[0], a[1]], [b[0], b[1]]], { w: cap(0.008 * s, 1, 2.5), col: P.cream, seed: 2520 + i + v * 30, d, taper: 0.3, alpha: 0.8 }); } }
        g.save(); Neon.path(g, q); g.clip(); stripes(g, cam, D, [0, 1, 0], y, P.pink, sa * 0.7, T, d, 2550); g.restore();
    }

    // the dresser on the left wall under a round mirror that catches the sign; a bottle, two
    // glasses (one fallen)
    function dresser(g, L, cam, T, d, fx, sc) {
        const x0 = RM.x0, x1 = -2.15, z0 = 1.1, z1 = 2.4, h = 0.8, s = sAt(cam, [-2.3, 0.6, 1.75]);
        const mc = [RM.x0 + 0.01, 1.58, 1.75], ring = (r, dx) => { const o = []; for (let i = 0; i <= 28; i++) { const a = (i / 28) * Math.PI * 2; o.push([mc[0] + dx, mc[1] + Math.sin(a) * r, mc[2] + Math.cos(a) * r]); } return o; };
        quad(g, cam, ring(0.42, 0), P.gold, { w: lw(s, 0.01), seed: 2600, d });
        const gq = quad(g, cam, ring(0.36, 0.006), '#24146e', { w: lw(s, 0.006), seed: 2601, d });
        if (gq) {
            g.save(); Neon.path(g, gq); g.clip(); g.globalCompositeOperation = 'screen';
            for (let k = 0; k < 4; k++) { const o = -0.24 + k * 0.15, band = [[0.6, o], [0.6, o + 0.06], [-0.6, o + 0.06 + 0.5], [-0.6, o + 0.5]].map(([a, b]) => [mc[0] + 0.007, mc[1] + a * 0.6 + b * 0.8 - 0.1, mc[2] + a * 0.8 - b * 0.6]); const q = Neon.poly(cam, band); if (q) Ink.shape(g, q, sc, { w: 0, light: true, seed: 2602 + k, d, alpha: 0.55 * fx.pulse }); }
            g.restore();
            const arc = []; for (let i = 0; i <= 10; i++) { const a = -0.9 + (i / 10) * 1.3; arc.push(cam.p([mc[0] + 0.012, mc[1] + Math.sin(a) * 0.39, mc[2] + Math.cos(a) * 0.39])); }
            if (arc.every((p) => p[2] > 0.3)) Ink.brush(g, arc, { w: cap(0.012 * s, 1, 4), col: sc, seed: 2605, d, taper: 0.3, light: true });
        }
        box(g, cam, x0, x1, 0.1, h, z0, z1, '#3d0e74', 2610, d, { cols: { top: P.plum } });
        for (const z of [z0 + 0.05, z1 - 0.05]) box(g, cam, x1 - 0.06, x1 - 0.02, 0, 0.1, z - 0.02, z + 0.02, P.gold, 2615 + z * 10, d);
        for (const y of [0.33, 0.56]) { const a = cam.p([x1 + 0.002, y, z0 + 0.03]), b = cam.p([x1 + 0.002, y, z1 - 0.03]); Ink.brush(g, [[a[0], a[1]], [b[0], b[1]]], { w: cap(0.008 * s, 1, 3), seed: 2620 + y * 10, d, taper: 0.1 }); }
        for (const y of [0.21, 0.45, 0.68]) for (const z of [z0 + 0.35, z1 - 0.35]) box(g, cam, x1, x1 + 0.025, y - 0.015, y + 0.015, z - 0.05, z + 0.05, P.gold, 2630 + Math.round(y * 100 + z * 10), d);
        // the bottle: dark glass, gold foil, a cream label, a stroke of the sign down its side
        const bt = quad(g, cam, bb(cam, [-2.36, h, 1.42], [[-0.045, 0], [0.045, 0], [0.045, 0.2], [0.016, 0.26], [0.016, 0.32], [-0.016, 0.32], [-0.016, 0.26], [-0.045, 0.2]]), '#123a50', { w: lw(s, 0.008), seed: 2640, d });
        if (bt) {
            quad(g, cam, bb(cam, [-2.36, h, 1.415], [[-0.017, 0.25], [0.017, 0.25], [0.017, 0.325], [-0.017, 0.325]]), P.gold, { w: 0, seed: 2641, d });
            quad(g, cam, bb(cam, [-2.36, h, 1.415], [[-0.04, 0.07], [0.04, 0.07], [0.04, 0.14], [-0.04, 0.14]]), P.cream, { w: 0, seed: 2642, d });
            const e = bb(cam, [-2.36, h, 1.41], [[0.03, 0.02], [0.03, 0.19], [0.01, 0.25]]).map(cam.p); Ink.brush(g, e, { w: cap(0.008 * s, 1, 3), col: sc, seed: 2643, d, taper: 0.3, light: true });
        }
        // two flutes: one standing with a finger of gold, one fallen on its side
        const flute = [[-0.028, 0], [0.028, 0], [0.004, 0.006], [0.004, 0.1], [0.024, 0.13], [0.028, 0.22], [-0.028, 0.22], [-0.024, 0.13], [-0.004, 0.1], [-0.004, 0.006]];
        for (const [c, rot, sd] of [[[-2.33, h, 1.62], 0, 2650], [[-2.3, h + 0.03, 1.82], -Math.PI / 2, 2660]]) {
            const q = quad(g, cam, bb(cam, c, flute, rot), 'rgba(170,220,255,0.4)', { w: lw(s, 0.005), seed: sd, d, light: true });
            if (q && !rot) quad(g, cam, bb(cam, c, [[-0.025, 0.13], [0.025, 0.13], [0.026, 0.17], [-0.026, 0.17]]), P.gold, { w: 0, seed: sd + 1, d, light: true });
            if (q) { const e = bb(cam, c, [[0.022, 0.2], [0.02, 0.13]], rot).map(cam.p); Ink.brush(g, e, { w: cap(0.006 * s, 1, 2), col: P.cream, seed: sd + 2, d, taper: 0.3, light: true }); }
        }
    }

    // the chair, turned to us: his shirt draped over its back (open collar, two short sleeves
    // hanging, folds with the print following them, its shadow on the seat), her jacket thrown
    // on the seat (lapels, stitching, a sleeve over the front edge)
    function chair(g, cam, T, d, fx, D, sc, sa) {
        const cx = -1.5, x0 = cx - 0.25, x1 = cx + 0.25, z0 = 3.28, z1 = 3.76, s = sAt(cam, [cx, 0.7, 3.5]);
        for (const [x, z] of [[x0 + 0.03, z0 + 0.03], [x1 - 0.03, z0 + 0.03], [x0 + 0.03, z1 - 0.03], [x1 - 0.03, z1 - 0.03]]) box(g, cam, x - 0.022, x + 0.022, 0, 0.45, z - 0.022, z + 0.022, '#1a0450', 2700 + Math.round(x * 10 + z * 100), d);
        box(g, cam, x0, x1, 0.45, 0.5, z0, z1, P.grape, 2710, d, { cols: { top: P.plum } });
        box(g, cam, x0, x1, 0.5, 1.02, z1 - 0.05, z1, P.grape, 2720, d);
        quad(g, cam, [[x0 + 0.02, 0.503, z1 - 0.05], [x1 - 0.02, 0.503, z1 - 0.05], [x1 - 0.05, 0.503, z1 - 0.21], [x0 + 0.05, 0.503, z1 - 0.18]], '#1e0640', { w: 0, seed: 2725, d });
        const W = (u, v) => [cx + u * 0.27, 1.05 - v, z1 - 0.07 - 0.018 * Math.sin(u * 2.6 + v * 3) - 0.05 * v];
        const P2 = (pts) => Neon.poly(cam, pts.map(([u, v]) => W(u, v)));
        const panel = [[-0.86, -0.012], [0.86, -0.012], [0.9, 0.12], [0.92, 0.3], [0.88, 0.44]];
        for (let i = 0; i <= 12; i++) { const u = 0.88 - (1.76 * i) / 12; panel.push([u, 0.45 + 0.025 * Math.sin(u * 8) + 0.015 * Ink.hsh(i, 9, 0)]); }
        panel.push([-0.92, 0.3], [-0.9, 0.12]);
        const sleeves = [[[-0.84, 0.0], [-1.12, 0.05], [-1.22, 0.3], [-1.0, 0.34], [-0.93, 0.13]], [[0.84, 0.0], [1.1, 0.09], [1.14, 0.36], [0.94, 0.33], [0.92, 0.12]]];
        const shapes = [...sleeves.map(P2), P2(panel)];
        shapes.forEach((q, i) => { if (q) Ink.shape(g, q, i < 2 ? '#6a06dc' : P.violet, { w: lw(s, 0.01), seed: 2730 + i, d, jit: 0.5 }); });
        // folds: dark valleys and lit ridges running down, and the print riding on them
        const fold = (u, v) => u + 0.035 * Math.sin(v * 9 + u * 5);
        g.save(); g.beginPath(); for (const q of shapes) if (q) q.forEach((p, i) => (i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]))); g.clip();
        for (const [k, u0] of [[0, -0.62], [1, -0.28], [2, 0.18], [3, 0.55]]) {
            const val = [], ridge = []; for (let j = 0; j <= 6; j++) { const v = 0.06 + j * 0.065; val.push(cam.p(W(fold(u0, v), v))); ridge.push(cam.p(W(fold(u0 + 0.07, v), v))); }
            if (val.some((p) => p[2] < 0.3)) continue;
            Ink.brush(g, val, { w: cap(0.022 * s, 1.5, 7), col: '#4a0a9a', seed: 2740 + k, d, taper: 0.4, alpha: 0.75 });
            Ink.brush(g, ridge, { w: cap(0.008 * s, 1, 3), col: P.pink, seed: 2745 + k, d, taper: 0.5, alpha: 0.8, light: true });
        }
        let n = 0;
        for (let v = 0.08; v < 0.44; v += 0.09) for (let u = -1.1; u < 1.12; u += 0.2) {
            n++; const uu = fold(u + 0.06 * (Ink.hsh(n, 1, 0) - 0.5), v), p = cam.p(W(uu, v + 0.03 * Ink.hsh(n, 2, 0))), r = cap(0.016 * s, 1.5, 8), sq = 0.6 + 0.4 * Math.abs(Math.cos(v * 9 + u * 5));
            if (p[2] < 0.3 || (Math.abs(u) > 0.9 && v > 0.32)) continue;
            if (n % 3 === 0) { g.fillStyle = P.gold; g.beginPath(); g.ellipse(p[0], p[1], r * sq, r, 0, 0, Math.PI * 2); g.fill(); }
            else if (n % 3 === 1) Ink.brush(g, [[p[0] - r * 1.4 * sq, p[1]], [p[0] - r * 0.4 * sq, p[1] - r], [p[0] + r * 0.5 * sq, p[1] + r * 0.5], [p[0] + r * 1.4 * sq, p[1] - r * 0.5]], { w: cap(0.007 * s, 1, 3), col: P.aqua, seed: 2750 + n, d, taper: 0.2, light: true });
            else { g.fillStyle = P.magenta; g.beginPath(); g.moveTo(p[0], p[1] - r * 1.3); g.lineTo(p[0] + r * 1.1 * sq, p[1] + r); g.lineTo(p[0] - r * 1.1 * sq, p[1] + r); g.closePath(); g.fill(); }
        }
        g.restore();
        // the open collar: the dark inside of the neck, two points folded down, the placket
        const nk = P2([[-0.3, -0.01], [0.3, -0.01], [0.0, 0.11]]); if (nk) Ink.shape(g, nk, '#1a0440', { w: 0, seed: 2760, d });
        for (const sg of [-1, 1]) { const q = P2([[sg * 0.36, -0.015], [sg * 0.03, -0.015], [sg * 0.06, 0.17], [sg * 0.24, 0.09]]); if (q) Ink.shape(g, q, '#8a2af8', { w: lw(s, 0.008), seed: 2761 + sg, d, jit: 0.4 }); }
        { const a = cam.p(W(0.0, 0.13)), b = cam.p(W(0.01, 0.44)); Ink.brush(g, [[a[0], a[1]], [b[0], b[1]]], { w: cap(0.006 * s, 1, 2.5), seed: 2765, d, taper: 0.1 }); for (const v of [0.2, 0.29, 0.38]) { const p = cam.p(W(0.03, v)); g.fillStyle = P.cream; g.beginPath(); g.arc(p[0], p[1], cap(0.008 * s, 1, 4), 0, Math.PI * 2); g.fill(); } }
        for (const sl of sleeves) { const a = cam.p(W(sl[2][0], sl[2][1] - 0.04)), b = cam.p(W(sl[3][0], sl[3][1] - 0.04)); Ink.brush(g, [[a[0], a[1]], [b[0], b[1]]], { w: cap(0.006 * s, 1, 2.5), seed: 2766 + sl[0][0] * 10, d, taper: 0.2 }); }
        // her jacket on the seat
        const J = (u, w, hh = 0) => [cx + u * 0.25, 0.508 + hh, z0 + 0.02 + w * 0.3];
        const jb = Neon.poly(cam, [[-0.92, 0.08], [-0.2, 0.0], [0.6, 0.02], [0.95, 0.2], [0.9, 0.62], [0.25, 0.72], [-0.4, 0.66], [-0.88, 0.55]].map(([u, w], i) => J(u, w, 0.015 + 0.02 * Ink.hsh(i, 3, 0))));
        if (jb) {
            Ink.shape(g, jb, '#ff6fb8', { w: lw(s, 0.01), seed: 2770, d, jit: 0.5 });
            for (const [pts, sd] of [[[[-0.25, 0.1], [0.0, 0.1], [-0.08, 0.5]], 2771], [[[0.1, 0.1], [0.38, 0.12], [0.16, 0.5]], 2772]]) { const q = Neon.poly(cam, pts.map(([u, w]) => J(u, w, 0.04))); if (q) Ink.shape(g, q, '#ff9ad0', { w: lw(s, 0.008), seed: sd, d, jit: 0.4 }); }
            for (let k = 0; k < 3; k++) { const pts = [J(-0.8 + k * 0.5, 0.2 + k * 0.1, 0.04), J(-0.55 + k * 0.5, 0.45, 0.04)].map(cam.p); Ink.brush(g, pts, { w: cap(0.012 * s, 1, 4), col: '#c8408e', seed: 2773 + k, d, taper: 0.4 }); }
            const st = [J(-0.85, 0.5, 0.04), J(0.2, 0.66, 0.04), J(0.85, 0.56, 0.04)].map(cam.p); for (let k = 0; k < 2; k++) { const a = st[k], b = st[k + 1]; for (let j = 0; j < 5; j++) { const u0 = j / 5, u1 = u0 + 0.1; Ink.brush(g, [[a[0] + (b[0] - a[0]) * u0, a[1] + (b[1] - a[1]) * u0], [a[0] + (b[0] - a[0]) * u1, a[1] + (b[1] - a[1]) * u1]], { w: cap(0.004 * s, 1, 2), col: P.cream, seed: 2776 + k * 9 + j, d, taper: 0.3 }); } }
        }
        const sv = Neon.poly(cam, [[cx + 0.04, 0.515, z0 + 0.03], [cx + 0.2, 0.515, z0 + 0.03], [cx + 0.19, 0.5, z0 - 0.012], [cx + 0.18, 0.24, z0 - 0.03], [cx + 0.06, 0.22, z0 - 0.03], [cx + 0.05, 0.48, z0 - 0.012]]);
        if (sv) { Ink.shape(g, sv, '#f25aa8', { w: lw(s, 0.01), seed: 2790, d, jit: 0.4 }); const c0 = cam.p([cx + 0.18, 0.3, z0 - 0.031]), c1 = cam.p([cx + 0.06, 0.28, z0 - 0.031]); Ink.brush(g, [[c0[0], c0[1]], [c1[0], c1[1]]], { w: cap(0.006 * s, 1, 2.5), seed: 2791, d, taper: 0.1 }); }
        // the stripes fall across the shirt
        const all = shapes.filter(Boolean);
        if (all.length) { g.save(); g.beginPath(); for (const q of all) q.forEach((p, i) => (i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]))); g.clip(); stripes(g, cam, D, [0, 0, 1], z1 - 0.1, sc, sa * 0.55, T, d, 2795); g.restore(); }
    }

    // her heels: gold sandals, sole, stiletto, the band over the toes, the ankle strap; one
    // standing, one fallen on its side
    function heels(g, cam, d) {
        const shoe = (x, z, rot, lying, sd) => {
            const c = Math.cos(rot), sn = Math.sin(rot);
            const W = lying ? (sv, hh) => [x + c * sv - sn * hh * 0.95, 0.012 + hh * 0.12, z + sn * sv + c * hh * 0.95] : (sv, hh) => [x + c * sv, hh, z + sn * sv];
            const s = sAt(cam, [x, 0.05, z]);
            const pq = (pts, fill, k) => quad(g, cam, pts.map(([a, b]) => W(a, b)), fill, { w: lw(s, 0.005), seed: sd + k, d, jit: 0.15 });
            pq([[0, 0.006], [0.02, 0], [0.09, 0.002], [0.15, 0.04], [0.2, 0.078], [0.236, 0.086], [0.236, 0.098], [0.2, 0.092], [0.15, 0.054], [0.09, 0.016], [0.02, 0.014]], P.orange, 0);
            pq([[0.21, 0.082], [0.236, 0.088], [0.231, 0], [0.224, 0]], P.gold, 1);
            pq([[0.02, 0.012], [0.08, 0.014], [0.085, 0.05], [0.035, 0.045]], P.gold, 2);
            const loop = []; for (let i = 0; i <= 14; i++) { const a = (i / 14) * Math.PI * 2; loop.push(cam.p(W(0.2 + 0.03 * Math.cos(a), 0.135 + 0.04 * Math.sin(a)))); }
            if (loop.every((p) => p[2] > 0.3)) Ink.brush(g, loop, { w: cap(0.009 * s, 1, 3), col: P.gold, seed: sd + 3, d, taper: 0.05 });
            const pts = [W(0.03, 0.016), W(0.15, 0.056), W(0.22, 0.097)].map(cam.p);
            Ink.brush(g, pts, { w: cap(0.005 * s, 1, 2), col: P.cream, seed: sd + 4, d, taper: 0.4, light: true });
        };
        shoe(-0.98, 3.0, 0.25, false, 2800);
        shoe(-0.72, 2.72, 2.3, true, 2810);
    }

    // the TV on its stand against the left wall, a VCR on the shelf, its screen turned to the
    // bed: static
    function tv(g, L, cam, T, d, fx) {
        const x0 = -2.55, x1 = -2.1, z0 = 2.62, z1 = 3.3, s = sAt(cam, [-2.3, 0.8, 2.95]);
        for (const [x, z] of [[x0 + 0.03, z0 + 0.03], [x1 - 0.03, z0 + 0.03], [x0 + 0.03, z1 - 0.03], [x1 - 0.03, z1 - 0.03]]) box(g, cam, x - 0.018, x + 0.018, 0, 0.56, z - 0.018, z + 0.018, P.gold, 900 + Math.round(x * 10 + z * 100), d);
        box(g, cam, x0, x1, 0.15, 0.18, z0, z1, '#3a0d6e', 905, d);
        box(g, cam, x0 + 0.04, x1 - 0.04, 0.18, 0.27, z0 + 0.08, z1 - 0.08, '#1a1030', 906, d);
        { const p = cam.p([x1 - 0.039, 0.23, z1 - 0.15]); g.fillStyle = P.red; g.fillRect(p[0] - 1.5, p[1] - 1.5, 3, 3); }
        box(g, cam, x0, x1, 0.56, 0.6, z0, z1, '#3a0d6e', 907, d, { cols: { top: P.plum } });
        box(g, cam, x0 + 0.02, x1 - 0.01, 0.6, 1.12, z0 + 0.04, z1 - 0.04, '#2a2a5a', 910, d);
        const scr = Neon.poly(cam, [[x1 - 0.005, 0.66, z0 + 0.1], [x1 - 0.005, 0.66, z1 - 0.1], [x1 - 0.005, 1.06, z1 - 0.1], [x1 - 0.005, 1.06, z0 + 0.1]]);
        if (!scr) return;
        g.save(); Neon.path(g, scr); g.fillStyle = '#7aa6c8'; g.fill(); g.clip();
        const xs = scr.map((p) => p[0]), ys = scr.map((p) => p[1]), bx = Math.min(...xs), by = Math.min(...ys), bw = Math.max(...xs) - bx, bh = Math.max(...ys) - by;
        const cell = Math.max(2, bh / 40);
        for (let y = by; y < by + bh; y += cell) for (let x = bx; x < bx + bw; x += cell * 1.6) { const h = Ink.hsh(Math.round(x), Math.round(y), d); if (h < 0.45) continue; g.fillStyle = h > 0.9 ? P.cream : h > 0.7 ? '#c8e8ff' : h > 0.55 ? '#3a4a7a' : '#1a1a40'; g.fillRect(x, y, cell * 1.5, cell * 0.9); }
        const rb = by + ((T * 0.8) % 1) * bh; g.fillStyle = 'rgba(255,255,255,0.25)'; g.fillRect(bx, rb, bw, bh * 0.12);
        g.restore();
        Ink.shape(g, scr, null, { w: lw(s, 0.012), seed: 920, d });
        L.save(); Neon.path(L, scr); L.globalAlpha = (0.35 + 0.2 * Ink.hsh(1, 1, d)) * (1 - fx.black); L.fillStyle = '#9fd8ff'; L.fill(); L.restore();
        const top = cam.p([-2.33, 1.12, 2.96]);
        for (const [dz, sd] of [[-0.25, 930], [0.22, 931]]) { const e = cam.p([-2.3, 1.5, 2.96 + dz]); Ink.brush(g, [[top[0], top[1]], [e[0], e[1]]], { w: cap(0.01 * s, 1, 3), col: P.cream, seed: sd, d, taper: 0.1 }); }
    }

    // the nightstand: the lamp (lit), the phone, the clock radio, a glass
    function nightstand(g, L, cam, T, d, fx) {
        const x0 = 2.0, x1 = 2.55, z0 = 3.75, z1 = 4.25, y1 = 0.56, s = sAt(cam, [2.3, 0.6, 4.0]);
        box(g, cam, x0, x1, 0, y1, z0, z1, '#4a1288', 1000, d, { cols: { top: P.plum } });
        { const a = cam.p([x0 - 0.001, 0.3, z0 + 0.05]), b = cam.p([x0 - 0.001, 0.3, z1 - 0.05]); Ink.brush(g, [[a[0], a[1]], [b[0], b[1]]], { w: cap(0.01 * s, 1, 3), seed: 1001, d, taper: 0.1 }); }
        // the lamp: a round base, a stem, a drum shade of pleated card: darker outside with its
        // seams, lit inside where the camera can see in; the glow comes only from the openings
        box(g, cam, 2.33, 2.47, y1, y1 + 0.04, 4.05, 4.19, P.gold, 1010, d);
        box(g, cam, 2.39, 2.41, y1 + 0.04, y1 + 0.34, 4.11, 4.13, P.gold, 1020, d);
        const lamp = fx.black > 0 ? 1 - fx.black : 1, C0 = [2.4, y1 + 0.3, 4.12], rB = 0.17, rT = 0.11, hS = 0.22;
        const toCam = Math.atan2(cam.pos[2] - C0[2], cam.pos[0] - C0[0]);
        const rp = (a, r, y) => [C0[0] + Math.cos(a) * r, y, C0[2] + Math.sin(a) * r];
        const arc = (r, y, a0, a1, n = 18) => { const o = []; for (let i = 0; i <= n; i++) o.push(rp(a0 + ((a1 - a0) * i) / n, r, y)); return o; };
        const front = arc(rB, C0[1], toCam - Math.PI / 2, toCam + Math.PI / 2).concat(arc(rT, C0[1] + hS, toCam + Math.PI / 2, toCam - Math.PI / 2));
        const shq = Neon.poly(cam, front);
        if (shq) {
            Ink.shape(g, shq, css(mix('#4a1a5a', '#b8406c', lamp)), { w: lw(s, 0.012), seed: 1030, d, jit: 0.5 });
            for (let k = 1; k < 8; k++) { const a = toCam - Math.PI / 2 + (k / 8) * Math.PI, p0 = cam.p(rp(a, rB, C0[1])), p1 = cam.p(rp(a, rT, C0[1] + hS)); Ink.brush(g, [[p0[0], p0[1]], [p1[0], p1[1]]], { w: cap(0.006 * s, 1, 2.5), col: k % 2 ? '#7a1e52' : css(mix('#7a1e52', P.salmon, lamp)), seed: 1040 + k, d, taper: 0.3, alpha: 0.85 }); }
            // the openings: the inside seen through the bottom (camera below it) or the top (above)
            const open = [];
            if (cam.pos[1] < C0[1]) open.push([rB, C0[1], 1050]);
            if (cam.pos[1] > C0[1] + hS) open.push([rT, C0[1] + hS, 1052]);
            for (const [r, y, sd] of open) {
                const q = Neon.poly(cam, arc(r, y, 0, Math.PI * 2, 24));
                if (!q) continue;
                Ink.shape(g, q, css(mix('#3a1040', '#ffd9a0', lamp)), { w: lw(s, 0.008), seed: sd, d, light: true });
                const far = arc(r * 0.97, y, toCam + Math.PI / 2, toCam + Math.PI * 1.5).map(cam.p);
                Ink.brush(g, far, { w: cap(0.012 * s, 1, 4), col: css(mix('#3a1040', P.gold, lamp)), seed: sd + 1, d, taper: 0.3, light: true });
                L.save(); Neon.path(L, q); L.globalAlpha = 0.55 * lamp; L.fillStyle = '#ffb060'; L.fill(); L.restore();
            }
            // the light out of the bottom: a glow under the shade and a warm pool on the top
            const c = cam.p([C0[0], C0[1] - 0.02, C0[2]]);
            glow(L, c[0], c[1], cap(0.45 * s, 16, 220), P.orange, 0.32 * lamp);
            const pool = Neon.poly(cam, arc(0.3, y1 + 0.002, 0, Math.PI * 2, 20).map((p) => [Math.min(2.54, Math.max(2.01, p[0])), p[1], Math.min(4.24, Math.max(3.76, p[2]))]));
            if (pool) { g.save(); g.globalCompositeOperation = 'screen'; Ink.shape(g, pool, '#7a3a20', { w: 0, light: true, seed: 1055, d, alpha: 0.8 * lamp }); g.restore(); }
        }
        // the phone: a cream body, the handset on its cradle, the coiled cord
        box(g, cam, 2.1, 2.32, y1, y1 + 0.06, 4.02, 4.22, '#f0c8e8', 1060, d, { cols: { top: P.cream } });
        box(g, cam, 2.16, 2.26, y1 + 0.06, y1 + 0.085, 4.04, 4.2, '#f0c8e8', 1070, d, { cols: { top: '#ffe6f6' } });
        for (const [za, zb, sd] of [[4.03, 4.08, 1071], [4.16, 4.21, 1072]]) box(g, cam, 2.13, 2.29, y1 + 0.085, y1 + 0.115, za, zb, '#f0c8e8', sd, d, { cols: { top: '#ffe6f6' } });
        const cord = []; for (let i = 0; i <= 30; i++) { const u = i / 30; cord.push(cam.p([2.2 + u * 0.2 + 0.012 * Math.cos(u * 40), y1 + 0.016 + 0.012 * Math.sin(u * 40), 4.23 - u * 0.02])); }
        if (cord.every((p) => p[2] > 0.3)) Ink.brush(g, cord, { w: cap(0.006 * s, 1, 3), col: P.cream, seed: 1080, d, taper: 0.05, wob: 0.2 });
        // the clock radio: a dark box, red seven-segment digits flipping the minute on every bar
        const cq = box(g, cam, 2.04, 2.3, y1, y1 + 0.11, 3.78, 3.98, '#22104a', 1050, d);
        const face = cq.left;
        if (face) {
            const bar = Math.floor((T - 0.415) / BAR), min = 12 + (bar - 65), hh = 3, txt = [hh, Math.floor(min / 10) % 6, min % 10];
            const C3 = (u, v) => cam.p([2.035, y1 + 0.02 + v * 0.07, 3.96 - u * 0.16]);
            const segs = { a: [[0.15, 1], [0.85, 1]], b: [[0.85, 1], [0.85, 0.5]], c: [[0.85, 0.5], [0.85, 0]], d: [[0.15, 0], [0.85, 0]], e: [[0.15, 0.5], [0.15, 0]], f: [[0.15, 1], [0.15, 0.5]], g: [[0.15, 0.5], [0.85, 0.5]] };
            const map = ['abcdef', 'bc', 'abdeg', 'abcdg', 'bcfg', 'acdfg', 'acdefg', 'abc', 'abcdefg', 'abcdfg'];
            const slots = [0.02, 0.36, 0.66];
            txt.forEach((dg, i) => {
                for (const ch of map[dg]) {
                    const [[u0, v0], [u1, v1]] = segs[ch], a = C3(slots[i] + u0 * 0.27, v0), b = C3(slots[i] + u1 * 0.27, v1);
                    g.strokeStyle = P.red; g.lineWidth = cap(0.006 * s, 1, 4); g.lineCap = 'round'; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke();
                    L.strokeStyle = P.red; L.lineWidth = cap(0.01 * s, 1.5, 6); L.lineCap = 'round'; L.globalAlpha = 0.8; L.beginPath(); L.moveTo(a[0], a[1]); L.lineTo(b[0], b[1]); L.stroke(); L.globalAlpha = 1;
                }
            });
            // the colon blinks on the beat
            if (fx.bf < 0.5) for (const v of [0.3, 0.7]) { const p = C3(0.325, v); g.fillStyle = P.red; g.fillRect(p[0] - 1, p[1] - 1, 2.5, 2.5); }
        }
        // a glass with a last finger of something gold
        const gl = []; for (let i = 0; i <= 10; i++) { const a = (i / 10) * Math.PI; gl.push([2.47 + Math.cos(a + Math.PI) * 0.035, y1, 3.86 - Math.sin(a) * 0.035]); }
        gl.push([2.505, y1 + 0.11, 3.86], [2.435, y1 + 0.11, 3.86]);
        const gq = Neon.poly(cam, gl); if (gq) Ink.shape(g, gq, 'rgba(160,220,255,0.45)', { w: lw(s, 0.006), seed: 1090, d, light: true });
        const lq = Neon.poly(cam, [[2.437, y1 + 0.005, 3.86], [2.503, y1 + 0.005, 3.86], [2.503, y1 + 0.035, 3.86], [2.437, y1 + 0.035, 3.86]]); if (lq) Ink.shape(g, lq, P.gold, { w: 0, seed: 1095, d, light: true });
    }

    // the ceiling fan, turning (on twos, ~23° a drawing, so the four blades never read backwards)
    function fan(g, cam, T, d) {
        const c = [0.2, 2.8, 2.8], s = sAt(cam, [0.2, 2.5, 2.8]), ang = Math.floor(T * 12) / 12 * Math.PI * 2 * 0.65;
        box(g, cam, 0.18, 0.22, 2.48, 2.8, 2.78, 2.82, P.gold, 1100, d);
        const blades = [];
        for (let i = 0; i < 4; i++) {
            const a = ang + (i * Math.PI) / 2, ca = Math.cos(a), sa = Math.sin(a), w = (u, v) => [c[0] + ca * u - sa * v, 2.46 - u * 0.02, c[2] + sa * u + ca * v];
            const pts = [w(0.1, -0.05), w(0.7, -0.08), w(0.74, 0), w(0.7, 0.08), w(0.1, 0.05)];
            blades.push({ pts, dep: cam.view(w(0.4, 0))[2], i });
        }
        blades.sort((a, b) => b.dep - a.dep);
        for (const b of blades) { const q = Neon.poly(cam, b.pts); if (q) Ink.shape(g, q, b.i % 2 ? '#3a1478' : '#43188a', { w: lw(s, 0.01), seed: 1110 + b.i, d, jit: 0.5 }); }
        const hub = []; for (let i = 0; i <= 16; i++) { const a = (i / 16) * Math.PI * 2; hub.push([c[0] + Math.cos(a) * 0.12, 2.44, c[2] + Math.sin(a) * 0.12]); }
        const hq = Neon.poly(cam, hub); if (hq) Ink.shape(g, hq, P.gold, { w: lw(s, 0.01), seed: 1120, d });
        const body = []; for (let i = 0; i <= 16; i++) { const a = (i / 16) * Math.PI * 2; body.push([c[0] + Math.cos(a) * 0.09, 2.52, c[2] + Math.sin(a) * 0.09]); }
        const bq = Neon.poly(cam, body); if (bq) Ink.shape(g, bq, P.orange, { w: lw(s, 0.01), seed: 1121, d });
    }

    // steam on the glass: the outside blurred under a pale breath, with clear runs where drops
    // slid down and a scatter of beads
    function steam(g, env, cam, T, d, a) {
        const wq = Neon.poly(cam, [[WIN.x0, WIN.y0, WIN.z], [WIN.x1, WIN.y0, WIN.z], [WIN.x1, WIN.y1 - 0.22, WIN.z], [WIN.x0, WIN.y1 - 0.22, WIN.z]]); if (!wq) return;
        const copy = Motion.layer(env, 'nightSteam', (c) => { c.setTransform(1, 0, 0, 1, 0, 0); c.drawImage(g.canvas, 0, 0); });
        const k = env.k;
        g.save(); Neon.path(g, wq); g.clip();
        g.setTransform(1, 0, 0, 1, 0, 0); g.filter = `blur(${Math.round(9 * k)}px)`; g.globalAlpha = a; g.drawImage(copy, 0, 0); g.filter = 'none';
        g.setTransform(k, 0, 0, k, 0, 0);
        g.globalAlpha = 0.28 * a; g.fillStyle = '#c9a0ff'; g.fillRect(0, 0, env.W, env.H); g.globalAlpha = 1;
        // the runs: the sharp outside again inside narrow wavy strips
        const x0 = Math.min(...wq.map((p) => p[0])), x1 = Math.max(...wq.map((p) => p[0])), y0 = Math.min(...wq.map((p) => p[1])), y1 = Math.max(...wq.map((p) => p[1]));
        for (let i = 0; i < 11; i++) {
            const x = x0 + (x1 - x0) * (0.05 + 0.9 * Ink.hsh(i, 1, 0)), top = y0 + (y1 - y0) * (0.05 + 0.5 * Ink.hsh(i, 2, 0)), grow = Ease.seg(T, B(76) + Ink.hsh(i, 3, 0) * 3, B(76) + 1.2 + Ink.hsh(i, 3, 0) * 3);
            const bot = top + (y1 - top) * (0.3 + 0.7 * grow), w = 3 + 4 * Ink.hsh(i, 4, 0);
            g.save(); g.beginPath();
            for (let y = top; y <= bot; y += 8) g.lineTo(x + Math.sin(y * 0.05 + i) * 3 - w / 2, y);
            for (let y = bot; y >= top; y -= 8) g.lineTo(x + Math.sin(y * 0.05 + i) * 3 + w / 2, y);
            g.closePath(); g.clip(); g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(copy, 0, 0); g.restore();
            g.fillStyle = 'rgba(230,210,255,0.8)'; g.beginPath(); g.arc(x + Math.sin(bot * 0.05 + i) * 3, bot, w * 0.75, 0, Math.PI * 2); g.fill();
        }
        for (let i = 0; i < 60; i++) { const x = x0 + (x1 - x0) * Ink.hsh(i, 7, 0), y = y0 + (y1 - y0) * Ink.hsh(i, 8, 0), r = 1 + 2.5 * Ink.hsh(i, 9, 0); g.fillStyle = i % 4 ? 'rgba(230,210,255,0.55)' : 'rgba(255,255,255,0.8)'; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); }
        g.restore();
    }

    // a palm crown seen from above: fronds radiating from a heart of dates, each a long leaf with
    // its leaflets in ink and a lit midrib, the lower ring drooping under the upper
    function crownTop(g, cam, c, R, seed, T, d) {
        const fr = [];
        for (let i = 0; i < 14; i++) fr.push({ a: (i / 14) * Math.PI * 2 + Ink.hsh(seed, i, 0) * 0.35, len: R * (0.78 + 0.3 * Ink.hsh(seed, i + 20, 0)), droop: 0.6 + 0.6 * Ink.hsh(seed, i + 40, 0), lower: i % 2 });
        fr.sort((p, q) => q.lower - p.lower);
        const sw = Math.sin(T * 1.3 + seed) * 0.05;
        for (const f of fr) {
            const pt = (u) => [c[0] + Math.cos(f.a + sw * u) * f.len * u, c[1] - f.droop * u * u * (f.lower ? 1.3 : 0.8), c[2] + Math.sin(f.a + sw * u) * f.len * u];
            const rib = []; for (let j = 0; j <= 10; j++) rib.push(cam.p(pt(j / 10)));
            if (rib.some((p) => p[2] < 0.5)) continue;
            const s = cam.f / rib[5][2];
            const width = (j) => 0.045 * R * Math.sin(Math.min(1, (j / 10) * 1.1) * Math.PI) * cam.f / rib[j][2] + 1, leaf = (j) => 0.2 * R * Math.sin(Math.min(1, (j / 10) * 1.05) * Math.PI) * cam.f / rib[j][2];
            const tan = (j) => { const a = rib[Math.max(0, j - 1)], b = rib[Math.min(10, j + 1)], tx = b[0] - a[0], ty = b[1] - a[1], l = Math.hypot(tx, ty) || 1; return [tx / l, ty / l]; };
            const side = (k) => rib.map((p, j) => { const t = tan(j); return [p[0] - t[1] * width(j) * k, p[1] + t[0] * width(j) * k]; });
            Ink.shape(g, side(1).concat(side(-1).reverse()), f.lower ? P.grape : P.plum, { w: lw(s, 0.025), seed: seed * 101 + Math.round(f.a * 10), d, jit: 0.5 });
            // the leaflets: outlined strokes springing off both sides of the rib, leaning to the tip
            const lc = f.lower ? P.grape : P.plum;
            for (let j = 1; j < 10; j++) for (const k of [-1, 1]) {
                const p = rib[j], t = tan(j), l = leaf(j), lp = [[p[0], p[1]], [p[0] + (-t[1] * k * 0.8 + t[0] * 0.55) * l * 0.5, p[1] + (t[0] * k * 0.8 + t[1] * 0.55) * l * 0.5 + l * 0.04], [p[0] + (-t[1] * k * 0.75 + t[0] * 0.65) * l, p[1] + (t[0] * k * 0.75 + t[1] * 0.65) * l + l * 0.12]];
                const sdl = seed * 97 + j * 7 + k + Math.round(f.a * 10) * 31, w = cap(0.035 * s * (1.1 - j / 12), 1.5, 9);
                Ink.brush(g, lp, { w: w + 2.4, col: P.ink, seed: sdl, d, taper: 0.55, wob: 0.3 });
                Ink.brush(g, lp, { w, col: lc, seed: sdl + 1, d, taper: 0.6, wob: 0.3 });
            }
            Ink.brush(g, rib.slice(0, 9), { w: cap(0.025 * s, 1, 3.5), col: Math.cos(f.a) > 0 ? P.pink : P.cyan, seed: seed * 31 + Math.round(f.a * 10), d, taper: 0.3 });
        }
        const cp = cam.p(c); if (cp[2] < 0.5) return;
        const s0 = cam.f / cp[2];
        for (let i = 0; i < 8; i++) { const r = 0.07 * R * s0, a = i * 2.4; g.fillStyle = i % 2 ? P.orange : P.gold; g.beginPath(); g.arc(cp[0] + Math.cos(a) * r * 1.4, cp[1] + Math.sin(a) * r * 1.4, r * 0.55, 0, Math.PI * 2); g.fill(); }
    }

    // ================================================================================= the pool
    // seen from their window: a pool 9 × 4.8 m at the foot of the hotel, its lamps under water,
    // loungers, palms; the two of them under the cyan water
    const PL = { x0: -4.5, x1: 4.5, z0: -2.4, z1: 2.4, r: 0.9 };
    const PALMS = [[-5.05, 1.0, 31], [5.05, -0.9, 32]];         // pygmy palms in planters either side of the pool
    const rrect = (x0, x1, z0, z1, r, y, n = 5) => { const o = []; const c = [[x1 - r, z1 - r, 0], [x0 + r, z1 - r, 0.5], [x0 + r, z0 + r, 1], [x1 - r, z0 + r, 1.5]]; for (const [cx, cz, a0] of c) for (let i = 0; i <= n; i++) { const a = (a0 + (i / n) * 0.5) * Math.PI; o.push([cx + Math.cos(a) * r, y, cz + Math.sin(a) * r]); } return o; };
    function pool(g, L, cam, T, d, fx, env) {
        const lit = 1 - fx.black;
        // the deck: tiles in two violets, grout strokes
        quad(g, cam, [[-30, 0, -20], [30, 0, -20], [30, 0, 20], [-30, 0, 20]], '#3a1080', { w: 0, seed: 1200, d });
        for (let x = -14; x <= 14; x += 1.2) { const a = cam.p([x, 0, -12]), b = cam.p([x, 0, 12]); Ink.brush(g, [[a[0], a[1]], [b[0], b[1]]], { w: 1.2, col: '#2a0a62', seed: 1210 + x * 10, d, taper: 0.02, wob: 0.4, alpha: 0.8 }); }
        for (let z = -12; z <= 12; z += 1.2) { const a = cam.p([-14, 0, z]), b = cam.p([14, 0, z]); Ink.brush(g, [[a[0], a[1]], [b[0], b[1]]], { w: 1.2, col: '#2a0a62', seed: 1260 + z * 10, d, taper: 0.02, wob: 0.4, alpha: 0.8 }); }
        // the hotel's wall at the top of the frame, its ground floor lit
        // a neon strip along the deck's far edge, pulsing with the sign
        tube3(g, L, cam, [[-14, 0.05, 6.2], [14, 0.05, 6.2]], hex(P.cyan), 0.1, fx.pulse * lit);
        tube3(g, L, cam, [[-14, 0.05, -6.2], [14, 0.05, -6.2]], hex(P.magenta), 0.1, fx.pulse * lit);
        // the coping, then the water
        quad(g, cam, rrect(PL.x0 - 0.35, PL.x1 + 0.35, PL.z0 - 0.35, PL.z1 + 0.35, PL.r + 0.35, 0.01), '#f4b8d8', { w: 3, seed: 1350, d, jit: 0.5 });
        const wq = Neon.poly(cam, rrect(PL.x0, PL.x1, PL.z0, PL.z1, PL.r, 0.02));
        if (!wq) return null;
        const water = css(mix('#0a2a5a', '#1ec8e0', lit)), deep = css(mix('#061a40', '#1590c8', lit));
        Ink.shape(g, wq, water, { w: 3, seed: 1360, d, jit: 0.4 });
        g.save(); Neon.path(g, wq); g.clip();
        // the deep end: a darker half, its edge brushed
        const dq = Neon.poly(cam, [[0.5, 0.02, -3], [6, 0.02, -3], [6, 0.02, 3], [1.5, 0.02, 3]]); if (dq) Ink.shape(g, dq, deep, { w: 0, seed: 1370, d, jit: 2 });
        // the lane line on the floor
        g.restore();
        // the two of them under the water, drifting, broken by the ripples
        const s = sAt(cam, [0, -1, 0]);
        const drift = (T - B(72)) * 0.06;
        const under = Motion.layer(env, 'nightUnder', (c) => {
            for (const [who, x, z, ang] of [['her', -0.45 + drift * 0.6, 0.35, -0.12], ['him', 0.4 + drift * 0.6, 0.2, 0.08]]) {
                const p = cam.p([x, -1.1, z]), sp = cam.f / p[2], hgt = Couple.HEIGHT[who] * sp;
                c.save(); c.translate(p[0], p[1]); c.rotate(Math.PI + ang + 0.03 * Math.sin(T * 0.8 + x));
                Couple.drawAt(c, { f: sp, p: () => [0, -hgt / 2, 1] }, who, null, {}, { view: 'back', T, d, cut: Couple.HEIGHT[who] + 0.02, wind: 0.012 });
                c.restore();
            }
            c.globalCompositeOperation = 'source-atop';
            c.globalAlpha = 0.62; c.fillStyle = css(mix('#04122e', '#0a5a8a', lit)); c.fillRect(0, 0, env.W, env.H); c.globalAlpha = 1;
        });
        // drawn back in rows that slide sideways with the ripple
        const rows = 90, k = env.k, rh = env.H / rows;
        const wave = Motion.layer(env, 'nightWave', (c) => {
            c.setTransform(1, 0, 0, 1, 0, 0);
            for (let i = 0; i < rows; i++) { const y = i * rh, off = (Math.sin(y * 0.045 + T * 2.2) * 5 + Math.sin(y * 0.11 - T * 3.1) * 2) * k; c.drawImage(under, 0, y * k, under.width, rh * k + 1, off, y * k, under.width, rh * k + 1); }
        });
        g.save(); Neon.path(g, wq); g.clip(); g.globalAlpha = 0.92; g.drawImage(wave, 0, 0, env.W, env.H); g.restore();
        // caustics: a woven net of light strokes drifting over everything under the surface
        g.save(); Neon.path(g, wq); g.clip();
        const cc = css(mix('#2a3a7a', P.aqua, lit)), cc2 = css(mix('#2a3a7a', P.cream, lit));
        for (let i = 0; i < 16; i++) for (let j = 0; j < 5; j++) {
            const zz = PL.z0 + (i + 0.5) * (PL.z1 - PL.z0) / 16, xa = PL.x0 + j * 1.9 + Ink.hsh(i, j, 0) * 0.6, pts = [];
            for (let u = 0; u <= 6; u++) { const x = xa + u * 0.22, z = zz + 0.09 * Math.sin(x * 3.1 + T * 1.3 + i) + 0.05 * Math.sin(x * 7 - T * 2); pts.push(cam.p([x, 0.02, z])); }
            Ink.brush(g, pts, { w: cap(0.035 * s, 1.2, 5), col: (i + j) % 3 ? cc : cc2, seed: 1400 + i * 7 + j, d, taper: 0.4, alpha: 0.75, light: true });
        }
        g.restore();
        // the lamps in the pool's walls, glowing up through the water
        for (const [x, z] of [[-2.6, PL.z0], [0, PL.z0], [2.6, PL.z0], [-2.6, PL.z1], [0, PL.z1], [2.6, PL.z1]]) {
            const p = cam.p([x, -0.4, z + (z < 0 ? 0.05 : -0.05)]);
            if (lit > 0.02) { glow(L, p[0], p[1], cap(0.9 * s, 20, 120), P.aqua, 0.55 * lit); g.fillStyle = P.cream; g.globalAlpha = lit; g.beginPath(); g.ellipse(p[0], p[1], cap(0.12 * s, 3, 14), cap(0.06 * s, 2, 7), 0, 0, Math.PI * 2); g.fill(); g.globalAlpha = 1; }
        }
        // loungers in two rows, striped cushions, a towel
        for (const [zc, flip] of [[-3.9, 1], [3.9, -1]]) for (let i = 0; i < 4; i++) {
            const x = -3.9 + i * 2.6;
            if (PALMS.some(([px, pz]) => Math.abs(px - x) < 1.6 && Math.abs(pz - zc) < 1.6)) continue;
            const sd = 1500 + i * 10 + (flip > 0 ? 0 : 100);
            box(g, cam, x - 0.32, x + 0.32, 0, 0.32, zc - 0.95, zc + 0.95, P.cream, sd, d, { cols: { top: '#f4d6f0' } });
            for (let k2 = 0; k2 < 5; k2++) { const z = zc - 0.8 + k2 * 0.4; const q = Neon.poly(cam, [[x - 0.28, 0.33, z], [x + 0.28, 0.33, z], [x + 0.28, 0.33, z + 0.18], [x - 0.28, 0.33, z + 0.18]]); if (q) Ink.shape(g, q, k2 % 2 ? P.magenta : P.salmon, { w: 0, seed: sd + k2, d }); }
            const back = [[x - 0.3, 0.32, zc + flip * 0.95], [x + 0.3, 0.32, zc + flip * 0.95], [x + 0.3, 0.8, zc + flip * 0.65], [x - 0.3, 0.8, zc + flip * 0.65]];
            quad(g, cam, back, P.salmon, { w: lw(s, 0.01), seed: sd + 7, d });
            if (i === 1 && flip > 0) quad(g, cam, [[x - 0.2, 0.36, zc - 0.3], [x + 0.35, 0.36, zc - 0.2], [x + 0.3, 0.36, zc + 0.3], [x - 0.25, 0.36, zc + 0.25]], P.aqua, { w: lw(s, 0.01), seed: sd + 8, d });
        }
        // palms at the corners, their crowns nearer the camera than the water
        for (const [x, z, sd] of PALMS) { box(g, cam, x - 0.3, x + 0.3, 0, 0.5, z - 0.3, z + 0.3, P.salmon, 1700 + sd, d, { cols: { top: '#3a1050' } }); crownTop(g, cam, [x, 2.4, z], 2.2, sd, T, d); }
        // the surface: glints of the hotel's neon in short cream and pink strokes
        g.save(); Neon.path(g, wq); g.clip();
        for (let i = 0; i < 18; i++) { const x = PL.x0 + 0.3 + Ink.hsh(i, 21, 0) * 8.4, z = PL.z0 + 0.2 + Ink.hsh(i, 22, 0) * 4.4, p = cam.p([x + 0.1 * Math.sin(T + i), 0.03, z]), l = cap(0.25 * s, 6, 40); Ink.brush(g, [[p[0] - l / 2, p[1]], [p[0] + l / 2, p[1] + 1]], { w: cap(0.03 * s, 1.2, 4), col: i % 3 ? P.cream : P.pink, seed: 1600 + i, d, taper: 0.45, alpha: 0.8 * lit + 0.2, light: true }); }
        g.restore();
        return wave;
    }

    // ============================================================================== the façade
    // the hotel seen from across Ocean Drive (façade coordinates: x right, the face at z = 0):
    // ten floors of Deco eyebrows, windows lit and dark, a fin carrying the sign, their window
    // on the ninth floor with the two of them behind its blinds
    const FW = { x0: -1.3, x1: 1.3, y0: 26.5, y1: 28.4 };
    const FR = 2.4, FX = 10.6;                                   // the rounded corners: radius, where the flat face ends
    function facade(g, L, cam, T, d, fx, env) {
        // the ground: Ocean Drive's asphalt with its centre line, the pink sidewalk
        quad(g, cam, [[-80, 0, -60], [80, 0, -60], [80, 0, -11], [-80, 0, -11]], '#1a0a40', { w: 0, seed: 1690, d });
        quad(g, cam, [[-80, 0, -11], [80, 0, -11], [80, 0, 4], [-80, 0, 4]], '#7a2a7a', { w: 0, seed: 1691, d });
        for (let x = -60; x < 60; x += 6) { const q = Neon.poly(cam, [[x, 0.01, -24.1], [x + 3, 0.01, -24.1], [x + 3, 0.01, -23.9], [x, 0.01, -23.9]]); if (q) Ink.shape(g, q, P.gold, { w: 0, seed: 1692 + x, d }); }
        { const a = cam.p([-80, 0.02, -11]), b = cam.p([80, 0.02, -11]); if (a[2] > 0.3 && b[2] > 0.3) Ink.brush(g, [[a[0], a[1]], [b[0], b[1]]], { w: 2.5, col: P.cream, seed: 1693, d, taper: 0.02 }); }
        // the neighbours, set back
        for (const [x0, x1, top, col, sd] of [[-34, -13.6, 23, P.royal, 1700], [13.6, 36, 28.5, '#3c0ca8', 1710], [-60, -34, 31, '#260a8c', 1720]]) {
            quad(g, cam, [[x0, 0, 5], [x1, 0, 5], [x1, top, 5], [x0, top, 5]], col, { w: 2.5, seed: sd, d, jit: 0.5 });
            for (let y = 1.2; y < top - 1.5; y += 3.2) for (let x = x0 + 1; x < x1 - 1.5; x += 2.6) { if (Ink.hsh(Math.round(x), Math.round(y), sd) > 0.4) continue; const q = Neon.poly(cam, [[x, y, 4.99], [x + 1.4, y, 4.99], [x + 1.4, y + 1.3, 4.99], [x, y + 1.3, 4.99]]); if (q) { g.fillStyle = [P.orange, P.gold, P.salmon, P.cyan][Math.floor(Ink.hsh(Math.round(x), Math.round(y), 3) * 4)]; Neon.path(g, q); g.fill(); } }
            tube3(g, L, cam, [[x0, top + 0.1, 4.95], [x1, top + 0.1, 4.95]], hex(sd === 1710 ? P.pink : P.cyan), 0.18);
        }
        const TOP = 34.4;
        // the rounded corners: the face wraps back in slices, shaded as they turn, with
        // wrap-around corner windows and three speed lines per floor
        const cw = (sg, a, y) => [sg * (FX + Math.sin(a) * FR), y, FR - Math.cos(a) * FR];
        for (const sg of [-1, 1]) for (let i = 0; i < 6; i++) {
            const a0 = (i / 6) * Math.PI / 2, a1 = ((i + 1) / 6) * Math.PI / 2;
            const sh = css(mix('#c8509a', '#4a0e6a', (i + 0.5) / 6));
            quad(g, cam, [cw(sg, a0, 0), cw(sg, a1, 0), cw(sg, a1, TOP), cw(sg, a0, TOP)], sh, { w: i === 5 ? 2.5 : 0, seed: 1730 + i + sg * 10, d, jit: 0.2 });
            for (let fl = 1; fl < 10; fl++) {
                const y0 = fl * 3.2 + 0.9, y1 = y0 + 1.9, on = Ink.hsh(fl, sg + 5, 41) < 0.3;
                const q = Neon.poly(cam, [cw(sg, a0, y0), cw(sg, a1, y0), cw(sg, a1, y1), cw(sg, a0, y1)]);
                if (q) { g.fillStyle = on ? css(mix(P.orange, '#5a1a40', i / 8)) : css(mix('#1a0650', '#0a0230', i / 6)); Neon.path(g, q); g.fill(); }
            }
        }
        for (const sg of [-1, 1]) for (let fl = 1; fl < 11; fl++) for (const dy of [0.12, 0.3, 0.48]) {
            const y = fl * 3.2 + 0.1 + dy, pts = []; for (let i = 0; i <= 8; i++) pts.push(cam.p(cw(sg, (i / 8) * Math.PI / 2, y)));
            if (pts.every((p) => p[2] > 0.3)) Ink.brush(g, pts, { w: cap(0.06 * cam.f / pts[0][2], 1, 4), col: dy === 0.3 ? P.cream : P.pink, seed: 1760 + fl * 3 + dy * 10 + sg, d, taper: 0.05, alpha: 0.85 });
        }
        // the flat face in pastel: a salmon body, a lavender centre bay, pink pilasters, a mint frieze
        quad(g, cam, [[-FX, 0, 0], [FX, 0, 0], [FX, TOP, 0], [-FX, TOP, 0]], '#c0388e', { w: 3, seed: 1750, d, jit: 0.5 });
        quad(g, cam, [[-3.4, 4, -0.01], [3.4, 4, -0.01], [3.4, TOP, -0.01], [-3.4, TOP, -0.01]], '#9a3ad0', { w: 2, seed: 1751, d });
        for (const x of [-7.8, -3.6, 3.6, 7.8]) quad(g, cam, [[x - 0.35, 4, -0.15], [x + 0.35, 4, -0.15], [x + 0.35, TOP, -0.15], [x - 0.35, TOP, -0.15]], '#ff8ac8', { w: 2, seed: 1752 + x, d });
        quad(g, cam, [[-FX, TOP - 1.1, -0.02], [FX, TOP - 1.1, -0.02], [FX, TOP - 0.5, -0.02], [-FX, TOP - 0.5, -0.02]], P.mint, { w: 2, seed: 1756, d });
        for (let k = 0; k < 14; k++) { const x = -FX + 0.75 + k * 1.5; quad(g, cam, [[x - 0.25, TOP - 1.0, -0.03], [x + 0.25, TOP - 1.0, -0.03], [x, TOP - 0.6, -0.03]], '#2aa08a', { w: 0, seed: 1757 + k, d }); }
        // the stepped crown and the parapet's tube
        box(g, cam, -5, 5, TOP, TOP + 2, -0.3, 0, '#ff8ac8', 1770, d, { cols: { front: '#c4307e' } });
        box(g, cam, -2.5, 2.5, TOP + 2, TOP + 3.6, -0.3, 0, '#ff8ac8', 1775, d, { cols: { front: '#c4307e' } });
        tube3(g, L, cam, [[-FX, TOP + 0.1, -0.05], [-5, TOP + 0.1, -0.05], [-5, TOP + 2.1, -0.35], [-2.5, TOP + 2.1, -0.35], [-2.5, TOP + 3.7, -0.35], [2.5, TOP + 3.7, -0.35], [2.5, TOP + 2.1, -0.35], [5, TOP + 2.1, -0.35], [5, TOP + 0.1, -0.05], [FX, TOP + 0.1, -0.05]], hex(P.cyan), 0.16, 0.85 + 0.15 * fx.pulse);
        // the floors: windows, each under its own eyebrow with a shadow beneath it
        const cols = [-8.9, -5.7, 0, 5.7, 8.9];
        for (let fl = 1; fl < 10; fl++) {
            const y0 = fl * 3.2 + 0.9, y1 = y0 + 1.9;
            for (const cx of cols) {
                const hw = cx === 0 ? 1.3 : 1.0, x0 = cx - hw, x1 = cx + hw;
                if (fl === 8 && cx === 0) theirWindow(g, L, cam, T, d, fx, env);
                else {
                    const on = Ink.hsh(fl, Math.round(cx * 10), 77) < 0.36;
                    const q = quad(g, cam, [[x0, y0, 0], [x1, y0, 0], [x1, y1, 0], [x0, y1, 0]], on ? [P.orange, P.salmon, '#ffb46a'][Math.floor(Ink.hsh(fl, cx * 10, 5) * 3)] : '#1a0650', { w: 2, seed: 1800 + fl * 13 + cx * 10, d, light: on });
                    if (q && on) { L.save(); Neon.path(L, q); L.globalAlpha = 0.25; L.fillStyle = P.orange; L.fill(); L.restore(); for (let k = 1; k < 5; k++) { const a = cam.p([x0, y0 + ((y1 - y0) * k) / 5, -0.01]), b = cam.p([x1, y0 + ((y1 - y0) * k) / 5, -0.01]); g.strokeStyle = 'rgba(122,21,129,0.55)'; g.lineWidth = Math.max(1, (0.05 * cam.f) / a[2]); g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); } }
                    else if (q) { const a = cam.p([x0 + 0.3, y1 - 0.3, -0.01]), b = cam.p([x0 + 0.9, y0 + 0.3, -0.01]); Ink.brush(g, [[a[0], a[1]], [b[0], b[1]]], { w: 2, col: P.cyan, seed: 1900 + fl * 7 + cx, d, taper: 0.4, alpha: 0.6, light: true }); }
                }
                quad(g, cam, [[x0 - 0.2, y1 - 0.25, -0.005], [x1 + 0.2, y1 - 0.25, -0.005], [x1 + 0.2, y1 + 0.1, -0.005], [x0 - 0.2, y1 + 0.1, -0.005]], 'rgba(40,6,60,0.45)', { w: 0, seed: 1950 + fl, d, light: true });
                box(g, cam, x0 - 0.3, x1 + 0.3, y1 + 0.1, y1 + 0.24, -0.6, 0, P.pink, 1960 + fl * 7 + cx, d, { cols: { front: '#ff9ad8', bot: P.grape, top: '#ffc0e6' } });
            }
            if (fl % 3 === 2) tube3(g, L, cam, [[-FX, fl * 3.2 + 3.05, -0.62], [FX, fl * 3.2 + 3.05, -0.62]], hex(fl === 8 ? P.magenta : P.pink), 0.07, 0.7);
        }
        // the ground floor: the café behind lit glass, striped awnings, tables with candles
        quad(g, cam, [[-FX, 0, -0.02], [FX, 0, -0.02], [FX, 4, -0.02], [-FX, 4, -0.02]], '#7a1a7a', { w: 2.5, seed: 2050, d });
        for (const cx of [-7.8, -3.6, 3.6, 7.8]) {
            const q = quad(g, cam, [[cx - 1.6, 0.3, -0.03], [cx + 1.6, 0.3, -0.03], [cx + 1.6, 3.0, -0.03], [cx - 1.6, 3.0, -0.03]], '#ffb060', { w: 2, seed: 2051 + cx, d, light: true });
            if (q) { L.save(); Neon.path(L, q); L.globalAlpha = 0.3; L.fillStyle = P.orange; L.fill(); L.restore(); for (const x of [cx - 0.55, cx + 0.55]) { const a = cam.p([x, 0.3, -0.04]), b = cam.p([x, 3.0, -0.04]); Ink.brush(g, [[a[0], a[1]], [b[0], b[1]]], { w: cap(0.08 * cam.f / a[2], 1, 4), seed: 2055 + x * 10, d, taper: 0.05 }); } }
            // the awning: stripes sloping out from the wall, a scalloped hem, string lights
            for (let k = 0; k < 8; k++) { const xa = cx - 1.8 + k * 0.45, xb = xa + 0.45; quad(g, cam, [[xa, 3.5, -0.05], [xb, 3.5, -0.05], [xb, 3.0, -1.7], [xa, 3.0, -1.7]], k % 2 ? P.cream : P.magenta, { w: k === 0 ? 2 : 0, seed: 2060 + cx * 10 + k, d }); quad(g, cam, [[xa, 3.0, -1.7], [xb, 3.0, -1.7], [(xa + xb) / 2, 2.75, -1.72]], k % 2 ? P.cream : P.magenta, { w: 1.5, seed: 2070 + cx * 10 + k, d }); }
            for (let k = 0; k < 7; k++) { const p = cam.p([cx - 1.6 + k * 0.53, 2.72, -1.75]); if (p[2] > 0.5) { g.fillStyle = P.gold; g.beginPath(); g.arc(p[0], p[1], Math.max(1.2, 0.05 * cam.f / p[2]), 0, Math.PI * 2); g.fill(); glow(L, p[0], p[1], Math.max(3, 0.3 * cam.f / p[2]), P.gold, 0.5); } }
            for (const tx of [cx - 0.9, cx + 0.9]) {
                const tz = -3.0, top = Neon.poly(cam, ring3([tx, 0.76, tz], 0.38, 16, 'xz'));
                const a = cam.p([tx, 0.74, tz]), b = cam.p([tx, 0, tz]);
                if (a[2] > 0.5) Ink.brush(g, [[a[0], a[1]], [b[0], b[1]]], { w: cap(0.05 * cam.f / a[2], 1, 5), col: P.ink, seed: 2080 + tx * 10, d, taper: 0.05 });
                for (const dx of [-0.55, 0.55]) box(g, cam, tx + dx - 0.18, tx + dx + 0.18, 0.45, 0.5, tz - 0.18, tz + 0.18, P.cream, 2090 + Math.round((tx + dx) * 10), d, { w: 1.5 });
                if (top) Ink.shape(g, top, P.cream, { w: 1.8, seed: 2085 + tx * 10, d });
                const cp = cam.p([tx, 0.82, tz]); if (cp[2] > 0.5) { g.fillStyle = P.gold; g.fillRect(cp[0] - 1.5, cp[1] - 3, 3, 4); glow(L, cp[0], cp[1] - 2, Math.max(4, 0.5 * cam.f / cp[2]), P.orange, 0.6); }
            }
        }
        // the fin with the sign: rings that chase up it on the beat, the star on top, its tubes
        box(g, cam, -2.75, -2.05, 9, 41, -1.5, 0, P.salmon, 2000, d, { cols: { front: '#d63a8e', left: P.purple, right: P.plum } });
        for (let i = 0; i < 10; i++) {
            const y = 11 + i * 2.9, on = ((fx.beat % 10) + 10) % 10 === i ? 1 : 0.6;
            tube3(g, L, cam, ring3([-2.4, y, -1.52], 0.28), hex(i % 2 ? P.cyan : P.magenta), 0.1, on * (i % 2 ? 1 : 0.7 + 0.3 * fx.pulse));
        }
        const st = []; for (let i = 0; i <= 10; i++) { const a = (i / 10) * Math.PI * 2 - Math.PI / 2, r = i % 2 ? 0.45 : 1.1; st.push([-2.4 + Math.cos(a) * r, 42.4 - Math.sin(a) * r, -1.0]); }
        tube3(g, L, cam, st, hex(P.gold), 0.12, fx.pulse);
        for (const x of [-2.76, -2.04]) tube3(g, L, cam, [[x, 9, -1.51], [x, 41, -1.51]], hex(P.cyan), 0.07, 1);
        // palms along the sidewalk
        for (const [x, sd] of [[-11, 31], [-5, 32], [4.5, 33], [10.5, 34], [17, 35], [-18, 36]]) palm(g, cam, x, 0, -7 + (sd % 2) * 1.5, sd, T, d, { H: 12 });
    }
    // their window from outside: the room's pink light behind the blinds, two silhouettes
    function theirWindow(g, L, cam, T, d, fx, env) {
        const q = quad(g, cam, [[FW.x0, FW.y0, 0], [FW.x1, FW.y0, 0], [FW.x1, FW.y1, 0], [FW.x0, FW.y1, 0]], '#ff5ab4', { w: 2.5, seed: 2100, d, light: true });
        if (!q) return;
        L.save(); Neon.path(L, q); L.globalAlpha = 0.4 * fx.pulse; L.fillStyle = P.magenta; L.fill(); L.restore();
        g.save(); Neon.path(g, q); g.clip();
        // the two of them inside (0.8 m back), facing each other, dark against the light
        const pic = Motion.layer(env, 'nightFacFig', (c) => {
            Couple.standing(c, cam, 'him', [-0.3, FW.y0 - 0.9, 0.8], { view: 'side', T, d, flip: true });
            Couple.standing(c, cam, 'her', [0.3, FW.y0 - 0.9, 0.85], { view: 'side', T, d, flip: true });
            c.globalCompositeOperation = 'source-atop'; c.fillStyle = '#2a0640'; c.globalAlpha = 0.88; c.fillRect(0, 0, env.W, env.H);
        });
        g.drawImage(pic, 0, 0, env.W, env.H);
        // the slats in front of them
        for (let i = 0; i < 16; i++) { const y = FW.y1 - (i + 0.5) * (FW.y1 - FW.y0) / 16, a = cam.p([FW.x0, y, -0.01]), b = cam.p([FW.x1, y, -0.01]), w = Math.max(1, 0.06 * cam.f / a[2]); g.strokeStyle = 'rgba(122,21,129,0.55)'; g.lineWidth = w; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); }
        g.restore();
        box(g, cam, FW.x0 - 0.1, FW.x1 + 0.1, FW.y0 - 0.15, FW.y0, -0.25, 0, P.salmon, 2110, d);
    }

    // ============================================================================== the blackout
    // everything sinks into the night; what remains is the two of them as a ring of neon
    function blackout(g, env, fx, pic, T) {
        const b = fx.black;
        g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 0.93 * b; g.fillStyle = '#04021a'; g.fillRect(0, 0, env.px[0], env.px[1]); g.restore();
        if (!pic) return;
        const k = env.k, w = Math.max(2, 3 * k), ring = Motion.layer(env, 'nightRing', () => {}), R = ring.getContext('2d');
        R.setTransform(1, 0, 0, 1, 0, 0);
        for (const [dx, dy] of [[w, 0], [-w, 0], [0, w], [0, -w], [w * 0.7, w * 0.7], [-w * 0.7, w * 0.7], [w * 0.7, -w * 0.7], [-w * 0.7, -w * 0.7]]) R.drawImage(pic, dx, dy);
        R.globalCompositeOperation = 'source-in';
        R.fillStyle = [P.cyan, P.magenta, P.pink][((Math.floor(Song.beatAt(T)) % 3) + 3) % 3]; R.fillRect(0, 0, ring.width, ring.height);
        R.globalCompositeOperation = 'destination-out'; R.drawImage(pic, 0, 0);
        R.globalCompositeOperation = 'source-over';
        g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
        g.globalAlpha = b; g.drawImage(ring, 0, 0);
        g.globalCompositeOperation = 'lighter';
        g.globalAlpha = 0.6 * b; g.filter = `blur(${Math.round(4 * k)}px)`; g.drawImage(ring, 0, 0); g.filter = 'none';
        g.restore();
    }

    // ================================================================================ the shots
    function camera(shot, T, env) {
        const base = { W: env.W, H: env.H }, u = (a, b) => Ease.inOut(Ease.seg(T, a, b));
        const [a, b] = SHOTS[shot];
        const k = u(a, b);
        switch (shot) {
            case 0: return Neon.camera({ ...base, pos: [0.6, 2.6 + 24.6 * k, -17], yaw: -0.02, pitch: 0.14 - 0.12 * k, roll: 0.01, f: 1050 });
            case 1: return Neon.camera({ ...base, pos: [-0.75 + k * 0.9, 1.5, -0.45 + k * 0.5], yaw: 0.1 - k * 0.12, pitch: 0.0, roll: 0.004, f: 860 });
            case 2: return Neon.camera({ ...base, pos: [0.02 - k * 0.05, 1.42, 2.85 + k * 0.08], yaw: 0.0, pitch: 0.0, roll: -0.008, f: 1150 });
            case 3: return Neon.camera({ ...base, pos: [0.0, 0.95, 1.0 + k * 0.15], yaw: 0.62 - k * 0.12, pitch: -0.12 + k * 0.42, roll: 0.01, f: 900 });
            case 4: return Neon.camera({ ...base, pos: [1.25 - k * 0.15, 1.4, 0.7 + k * 0.25], yaw: -0.18 + k * 0.04, pitch: 0.0, roll: -0.006, f: 1000 });
            case 5: return Neon.camera({ ...base, pos: [-0.3 + k * 0.6, 11, -4.6 + k * 0.4], yaw: 0, pitch: -1.18 - k * 0.03, roll: 0.05 - k * 0.06, f: 2150 });
            case 6: return Neon.camera({ ...base, pos: [1.3, 0.8, 3.3 + k * 0.15], yaw: 1.1, pitch: -0.06, roll: 0.0, f: 1700 - k * 250 });
            case 7: return Neon.camera({ ...base, pos: [0.02, 1.62, 2.45 + k * 0.35], yaw: 0.0, pitch: 0.06, roll: 0, f: 1050 });
            case 8: return Neon.camera({ ...base, pos: [0.1 - k * 0.2, 7.4 - k * 0.8, -2.3], yaw: 0, pitch: -1.28, roll: -0.04 + k * 0.05, f: 2000 });
            default: { const e = Ease.out(Ease.seg(T, a, b)); return Neon.camera({ ...base, pos: [0.6 - e * 1.2, 27.4 - e * 12, -4.5 - e * 40], yaw: -0.01, pitch: 0.01 + e * 0.14, roll: 0, f: 1000 - e * 60 }); }
        }
    }

    function frame(g, env, T, d) {
        const N = env.state.N, fx = effects(T), shot = shotIndex(T + 1 / 24), cam = camera(shot, T, env);
        const kind = shot === 0 || shot === 9 ? 'facade' : shot === 5 || shot === 8 ? 'pool' : 'room';
        Ink.occlude(null);
        g.fillStyle = P.night; g.fillRect(0, 0, env.W, env.H);          // nothing may show through
        let L = N.light(), pic = null;
        if (kind === 'room') {
            outside(g, L, cam, T, d, fx, env);
            N.bloom(g, L, { strength: 0.45, core: 0.6 });
            if (shot === 7) steam(g, env, cam, T, d, 1);
            L = N.light(); Ink.occlude(L);
            const o = shot === 7 ? { blinds: 'up', view: 'back', cut: 1.15, dark: 0.7 } : shot === 2 ? { dark: 0.7, stripeOnFigs: 0.6, slide: 0.12 * Math.sin((T - SHOTS[2][0]) * 1.4) - 0.04 } : {};
            if (shot === 3 || shot === 6) o.figs = false;
            pic = room(g, L, cam, T, d, fx, env, o);
        } else if (kind === 'pool') {
            L = N.light(); Ink.occlude(L);
            pic = pool(g, L, cam, T, d, fx, env);
        } else {
            Drawn.sky(g, cam, T, d, fx, env, cam.p([cam.pos[0], cam.pos[1], cam.pos[2] + 9000])[1]);
            N.bloom(g, L, { strength: 0.4, core: 0.5 });
            L = N.light(); Ink.occlude(L);
            facade(g, L, cam, T, d, fx, env);
        }
        Ink.occlude(null);
        N.bloom(g, L, { strength: 0.42, core: 0.6 });
        if (fx.black > 0) blackout(g, env, fx, pic, T);
        if (fx.flash > 0) { g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = `rgba(255,120,220,${fx.flash})`; g.fillRect(0, 0, env.W, env.H); g.restore(); }
    }

    Sections.night = {
        from: FROM, to: TO, shots: SHOTS,
        async setup(env) { return {}; },
        draw(g, env, T, d) { frame(g, env, T, d); },
    };
})();
