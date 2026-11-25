// The clouds section's city, the second layer (set/clouds-city.js calls it): what makes the
// blocks lived in and cheap at once.
//   · walls: window patterns painted once into textures (eight of them: four lit patterns, a
//     plain and an Art Deco manner) and laid on every far wall with an affine map through the
//     camera; the lit panes again on the light layer. Panes vary: blinds, curtains, a figure, a
//     TV's blue. Strokes of stucco, slab lines, eyebrows, portholes and fins are in them too.
//   · clouds: irregular masses wider than tall, lobed top and bottom, in three inks (a violet
//     body, a darker core, the underside lit salmon and pink by the city), a brush line broken
//     where they are thin, loose strokes of light along the lit underside; passed through, a
//     cloud becomes wisps rushing by as strokes.
//   · people: silhouettes walking on twos, figures behind the diner's and the laundromat's glass.
// Global: CloudsLife.
const CloudsLife = (() => {
    const P = Ink.PAL, css = Neon.css, mix = Neon.mix, H = Ink.hsh;
    const cap = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
    const WARM = [P.orange, P.gold, P.salmon, P.orange, P.pink];

    // --- wall textures -------------------------------------------------------------------------
    const PPM = 7, CW = 3.4, FH = 3.2, COLS = 16, FLOORS = 24, TW = COLS * CW, TH = FLOORS * FH;
    const TEX = new Map();
    const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
    // the kind of each pane, by pattern (variant), column and floor
    function pane(v, k, f) {
        const r = H(v * 97 + 5, k * 31 + f, 1);
        if (r > 0.38) return { lit: false };
        const r2 = H(v * 97 + 6, k * 31 + f, 2), col = WARM[Math.floor(H(v, k * 7 + f, 3) * WARM.length)];
        return { lit: true, col: r2 < 0.08 ? '#4a7aff' : col, kind: r2 < 0.08 ? 'tv' : r2 < 0.33 ? 'blinds' : r2 < 0.5 ? 'curtains' : r2 < 0.56 ? 'figure' : 'plain' };
    }
    // the picture of a wall's windows and texture over any wall colour (inks only where things
    // are, the wall's own colour shows between), and the light of its lit panes
    function tex(v, style) {
        const key = v + style; if (TEX.has(key)) return TEX.get(key);
        const W = Math.round(TW * PPM), Hh = Math.round(TH * PPM), c = mk(W, Hh), l = mk(W, Hh), g = c.getContext('2d'), L = l.getContext('2d');
        const X = (u) => u * PPM, Y = (y) => Hh - y * PPM;
        // stucco: loose strokes a shade lighter and darker, the slab lines between floors
        Ink.strokes(g, 0, 0, W, Hh, { ang: Math.PI / 2, spread: 0.2, count: 260, len: 26, w: 1.6, cols: ['rgba(255,170,230,0.16)', 'rgba(10,2,40,0.22)'], seed: 7700 + v, d: 0 });
        Ink.strokes(g, 0, 0, W, Hh, { ang: 0, spread: 0.1, count: 140, len: 34, w: 1.4, cols: ['rgba(255,190,240,0.14)', 'rgba(10,2,40,0.2)'], seed: 7800 + v, d: 0 });
        if (style !== 'stucco') for (let f = 1; f < FLOORS; f++) { g.fillStyle = 'rgba(10,2,40,0.35)'; g.fillRect(0, Y(f * FH) - 1, W, 2); g.fillStyle = 'rgba(255,180,240,0.18)'; g.fillRect(0, Y(f * FH) + 1, W, 1); }
        if (style === 'deco') { for (let k = 2; k < COLS; k += 5) { g.fillStyle = 'rgba(255,190,240,0.22)'; g.fillRect(X(k * CW - 0.25), 0, X(0.5), Hh); g.fillStyle = 'rgba(10,2,40,0.35)'; g.fillRect(X(k * CW + 0.25), 0, 2, Hh); } }
        if (style === 'stucco') { const t = { c, l, W, Hh }; TEX.set(key, t); return t; }    // texture alone, for walls with drawn windows
        for (let f = 0; f < FLOORS; f++) for (let k = 0; k < COLS; k++) {
            const p = pane(v, k, f), x0 = X(k * CW + CW * 0.22), x1 = X(k * CW + CW * 0.78), y0 = Y(f * FH + 2.5), y1 = Y(f * FH + 1.0);
            const port = style === 'deco' && k % 5 === 4;
            if (port) {
                const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, r = (y1 - y0) * 0.36;
                g.fillStyle = p.lit ? p.col : '#120540'; g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2); g.fill();
                g.strokeStyle = 'rgba(10,2,40,0.9)'; g.lineWidth = 2; g.stroke();
                if (p.lit) { L.fillStyle = p.col; L.beginPath(); L.arc(cx, cy, r, 0, Math.PI * 2); L.fill(); }
                continue;
            }
            g.fillStyle = p.lit ? p.col : '#120540'; g.fillRect(x0, y0, x1 - x0, y1 - y0);
            if (p.lit) {
                L.fillStyle = p.col; L.fillRect(x0, y0, x1 - x0, y1 - y0);
                if (p.kind === 'blinds') { g.fillStyle = css(mix(p.col, '#2a0a50', 0.55)); for (let j = 1; j < 5; j++) g.fillRect(x0, y0 + (y1 - y0) * j / 5, x1 - x0, 1.5); }
                if (p.kind === 'curtains') { g.fillStyle = H(v, k + f, 9) < 0.5 ? P.red : P.magenta; g.fillRect(x0, y0, (x1 - x0) * 0.3, y1 - y0); g.fillRect(x1 - (x1 - x0) * 0.3, y0, (x1 - x0) * 0.3, y1 - y0); }
                if (p.kind === 'figure') { const cx = x0 + (x1 - x0) * (0.35 + 0.3 * H(v, k, f)); g.fillStyle = '#2a0a50'; g.beginPath(); g.arc(cx, y0 + (y1 - y0) * 0.42, (y1 - y0) * 0.14, 0, Math.PI * 2); g.fill(); g.fillRect(cx - (y1 - y0) * 0.22, y0 + (y1 - y0) * 0.58, (y1 - y0) * 0.44, (y1 - y0) * 0.42); }
                if (p.kind === 'tv') { g.fillStyle = '#9fd8ff'; g.fillRect(x0 + (x1 - x0) * 0.3, y0 + (y1 - y0) * 0.45, (x1 - x0) * 0.4, (y1 - y0) * 0.3); }
            } else { g.strokeStyle = 'rgba(116,7,240,0.8)'; g.lineWidth = 1.4; g.beginPath(); g.moveTo(x0 + 2, y1 - 3); g.lineTo(x1 - 3, y0 + 3); g.stroke(); }
            g.strokeStyle = 'rgba(10,2,40,0.85)'; g.lineWidth = 1.6; g.strokeRect(x0, y0, x1 - x0, y1 - y0);
            if (style === 'deco') { g.fillStyle = 'rgba(10,2,40,0.5)'; g.fillRect(x0 - 3, y0 - 6, x1 - x0 + 6, 4); g.fillStyle = 'rgba(255,200,240,0.4)'; g.fillRect(x0 - 3, y0 - 7, x1 - x0 + 6, 1.5); }
        }
        const t = { c, l, W, Hh }; TEX.set(key, t); return t;
    }
    // a wall (projected corners: bottom of u = 0, top of u = 0, top of u = len) of len × h metres:
    // its texture laid by an affine map, clipped to its outline q when the map could stray
    function wall(g, L, q, A, D, C3, len, h, v, style, uOff, s, alpha = 1) {
        const t = tex(v, style), u0 = Math.min(Math.max(0, TW - len), uOff), sw = Math.min(len, TW) * PPM, sh = Math.min(h, TH) * PPM, sx = u0 * PPM, sy = t.Hh - sh;
        if (sw < 1 || sh < 1) return;
        const a = (C3[0] - D[0]) / sw, b = (C3[1] - D[1]) / sw, c = (A[0] - D[0]) / sh, dd = (A[1] - D[1]) / sh;
        g.save(); if (s > 2.5) { Neon.path(g, q); g.clip(); }
        g.transform(a, b, c, dd, D[0], D[1]); g.globalAlpha *= alpha; g.drawImage(t.c, sx, sy, sw, sh, 0, 0, sw, sh); g.restore();
        if (L && s > 1.2) { L.save(); L.transform(a, b, c, dd, D[0], D[1]); L.globalAlpha = 0.5 * alpha; L.drawImage(t.l, sx, sy, sw, sh, 0, 0, sw, sh); L.restore(); }
    }

    // --- clouds --------------------------------------------------------------------------------
    let CL = null;
    function plan() {
        if (CL) return CL;
        const R = Motion.rng('clouds-masses'); CL = [];
        const add = (x, y, z, w) => { const seed = CL.length * 17 + 3; CL.push({ x, y, z, w, seed, shape: outline(seed) }); };
        // far masses all round, low in the sky from the street
        for (let i = 0; i < 26; i++) {
            const an = R() * Math.PI * 2, rr = 900 + R() * 2200;
            add(-250 + Math.sin(an) * rr, 290 + R() * 110, 300 + Math.cos(an) * rr, 280 + R() * 420);
        }
        // a few over the city, below the camera of the shot from straight above
        for (const [x, z] of [[-620, -260], [-60, 420], [-480, 520], [120, -520]]) add(x + (R() - 0.5) * 80, 300 + R() * 40, z, 260 + R() * 160);
        // the layer the camera climbs through in shot 1: passed beside, then through
        for (const [x, y, z, w] of [[-70, 270, -40, 240], [110, 300, -90, 220], [-20, 330, -260, 300]]) add(x, y, z, w);
        return CL;
    }
    // a cloud's outline in units of its width: the top an envelope of lobes, taller in the
    // middle; the bottom flatter, with smaller lobes; ends rounded
    function outline(seed) {
        const R = Motion.rng('cl' + seed), top = [], bot = [];
        const nt = 4 + Math.floor(R() * 4), nb = 5 + Math.floor(R() * 4);
        for (let i = 0; i < nt; i++) { const cx = -0.4 + 0.8 * (i + R() * 0.8) / nt, mid = 1 - Math.abs(cx) * 1.6; top.push([cx, 0.07 + R() * 0.07 + mid * 0.07, 0.06 + R() * 0.07 + mid * 0.05]); }
        for (let i = 0; i < nb; i++) { const cx = -0.42 + 0.84 * (i + R()) / nb; bot.push([cx, 0.015 + R() * 0.02, 0.03 + R() * 0.04]); }
        const T = (x) => { let m = 0; for (const [cx, lift, r] of top) { const u = x - cx; if (Math.abs(u) < r) m = Math.max(m, lift + Math.sqrt(r * r - u * u)); } return m; };
        const Bt = (x) => { let m = 0; for (const [cx, dep, r] of bot) { const u = x - cx; if (Math.abs(u) < r) m = Math.max(m, dep + Math.sqrt(r * r - u * u) * 0.55); } return m; };
        const N = 44, pts = [], under = [];
        for (let i = 0; i <= N; i++) { const x = -0.5 + i / N, end = Math.pow(Math.sin(Math.PI * i / N), 0.6); pts.push([x, Math.max(0.004, T(x) * end + 0.02 * end)]); }
        for (let i = N; i >= 0; i--) { const x = -0.5 + i / N, end = Math.pow(Math.sin(Math.PI * i / N), 0.7); const y = -Math.max(0.003, Bt(x) * end + 0.012 * end); pts.push([x, y]); under.push([x, y]); }
        return { pts, under, N };
    }
    // part: 'above' (clouds higher than the camera: painted before the city) or 'below'
    function clouds(g, cam, T, d, fx, env, part) {
        const list = [];
        for (const cl of plan()) {
            if (part && (part === 'above') !== (cl.y > cam.pos[1])) continue;
            const x = cl.x + (T - 99) * 3.2, v = cam.view([x, cl.y, cl.z]);
            if (v[2] < -cl.w) continue;
            const dd = Math.hypot(x - cam.pos[0], cl.y - cam.pos[1], cl.z - cam.pos[2]);
            list.push({ cl, x, dd });
        }
        list.sort((a, b) => b.dd - a.dd);
        for (const it of list) one(g, cam, it.cl, it.x, it.dd, T, d, fx, env);
    }
    function one(g, cam, cl, x, dd, T, d, fx, env) {
        const near = dd / cl.w;
        if (near < 1.5) wisps(g, cam, cl, x, T, d, Math.min(1, (1.5 - near) / 0.5));
        if (near < 0.95) return;
        const c = cam.p([x, cl.y, cl.z]); if (c[2] < 5) return;
        const k = cl.w * cam.f / c[2];
        if (c[0] + k < -50 || c[0] - k > env.W + 50) return;
        const el = Math.abs(cl.y - cam.pos[1]) / Math.max(1, dd), below = cam.pos[1] < cl.y;
        const ky = k * (1 + 1.6 * el * el);
        if (c[1] + ky * 0.2 < -60 || c[1] - ky * 0.3 > env.H + 60) return;
        const alpha = cap((near - 0.95) / 0.5, 0, 1);
        const S = (p) => [c[0] + p[0] * k, c[1] - p[1] * ky];
        const pts = cl.shape.pts.map(S), under = cl.shape.under.map(S);
        const lw = cap(0.0035 * k, 1.2, 4.5);
        g.save();
        // the body, then a darker core, then the lit underside in two bands
        Ink.shape(g, pts, '#4c1c94', { w: 0, seed: cl.seed, d, jit: 0.6, alpha });
        const core = cl.shape.pts.filter((p, i) => i % 2 === 0).map((p) => S([p[0] * 0.62 - 0.02, p[1] * 0.55 + 0.03]));
        Ink.shape(g, core, '#2e0e70', { w: 0, seed: cl.seed + 1, d, jit: 0.8, alpha });
        const band = (t) => under.map((p, i) => [p[0], p[1] - t * ky * (0.7 + 0.3 * Ink.noise(cl.seed + 5, i / 6, 0))]);
        const tb = below ? 0.05 : 0.02;
        const b1 = band(tb), b2 = band(tb * 0.45);
        g.save(); Neon.path(g, pts); g.clip();
        Ink.shape(g, under.concat(b1.slice().reverse()), P.salmon, { w: 0, seed: cl.seed + 2, d, jit: 0.5, alpha });
        Ink.shape(g, under.concat(b2.slice().reverse()), P.pink, { w: 0, seed: cl.seed + 3, d, jit: 0.5, alpha });
        // loose strokes of light along the lit underside; the moon's cyan on the tops seen from above
        let x0 = 1e9, x1 = -1e9, yb = -1e9; for (const p of under) { x0 = Math.min(x0, p[0]); x1 = Math.max(x1, p[0]); yb = Math.max(yb, p[1]); }
        const wpx = x1 - x0;
        if (wpx > 40) {
            const n = cap(Math.round(wpx / 30), 4, 22);
            Ink.strokes(g, x0 + wpx * 0.05, yb - tb * ky * 1.6, wpx * 0.9, tb * ky * 1.4, { ang: 0, spread: 0.12, count: n, len: cap(wpx * 0.09, 6, 120), w: cap(lw * 0.9, 1.2, 4), cols: [P.gold, P.cream, P.pink], seed: cl.seed + 9, d, alpha: 0.95 * alpha });
            Ink.strokes(g, x0 + wpx * 0.1, c[1] - 0.16 * ky, wpx * 0.8, 0.12 * ky, { ang: 0, spread: 0.15, count: Math.round(n * 0.6), len: cap(wpx * 0.08, 6, 100), w: cap(lw * 0.8, 1, 3.5), cols: below ? [P.purple, P.violet] : [P.cyan, P.violet], seed: cl.seed + 11, d, alpha: 0.8 * alpha });
        }
        g.restore();
        // the ink line, broken where the cloud is thin (its ends, much of the flat underside)
        if (alpha > 0.5) {
            const n = pts.length, ch = 5;
            for (let i = 0; i + 1 < n; i += ch) {
                const onBottom = i > cl.shape.N, r = H(cl.seed, i, 0);
                if (r < (onBottom ? 0.55 : 0.22) || i < 3 || (i > cl.shape.N - 4 && i < cl.shape.N + 4)) continue;
                Ink.brush(g, pts.slice(i, Math.min(n, i + ch + 1)), { w: lw, seed: cl.seed * 7 + i, d, taper: 0.35 });
            }
        }
        g.restore();
    }
    // passing through: wisps as strokes, rushing by
    function wisps(g, cam, cl, x, T, d, a) {
        const R = Motion.rng('wisp' + cl.seed);
        for (let j = 0; j < 26; j++) {
            const wx = x + (R() - 0.5) * cl.w, wy = cl.y + (R() - 0.5) * cl.w * 0.18, wz = cl.z + (R() - 0.5) * cl.w * 0.6, len = cl.w * (0.08 + R() * 0.14), col = [P.salmon, P.violet, P.pink, '#6a2ab0'][j % 4];
            const A = cam.p([wx - len / 2, wy, wz]), B = cam.p([wx + len / 2, wy, wz]);
            if (A[2] < 4 || B[2] < 4) continue;
            const s = cam.f / ((A[2] + B[2]) / 2);
            if (Math.max(A[1], B[1]) < -50 || Math.min(A[1], B[1]) > cam.H + 50) continue;
            Ink.brush(g, [[A[0], A[1]], [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2 - 0.01 * len * s], [B[0], B[1]]], { w: cap(cl.w * 0.012 * s, 2, 26), col, seed: cl.seed * 31 + j, d, taper: 0.45, wob: 1.2, alpha: a * 0.9 });
        }
    }

    // --- people ----------------------------------------------------------------------------------
    // a passer-by: a dark silhouette 1.7 m tall at foot (screen fx, fy), s px per metre, walking
    // (phase, on the film's 12-a-second grid), side = how much of the stride faces the camera,
    // a rim of neon on one edge
    function walker(g, fx, fy, s, phase, side, rim, seed, d, o = {}) {
        const h = (o.h ?? 1.7) * s, sw = Math.sin(phase) * 0.28 * s * side, lift = Math.abs(Math.cos(phase)) * 0.02 * s;
        const head = [fx, fy - h * 0.93 - lift], hr = h * 0.065;
        const sh = h * 0.12, hip = fy - h * 0.5 - lift, top = fy - h * 0.8 - lift;
        const body = [[fx - sh * 0.7, top - h * 0.02], [fx + sh * 0.7, top - h * 0.02], [fx + sh * 1.05, top + h * 0.03], [fx + sh * 0.82, hip + h * 0.02], [fx - sh * 0.82, hip + h * 0.02], [fx - sh * 1.05, top + h * 0.03]];
        const legs = [[[fx - sh * 0.72, hip], [fx + sh * 0.02, hip], [fx + sw * 0.5 + sh * 0.12, fy - h * 0.03], [fx + sw * 0.5 + sh * 0.3, fy], [fx + sw * 0.5 - sh * 0.4, fy], [fx + sw * 0.5 - sh * 0.36, fy - h * 0.03]], [[fx - sh * 0.02, hip], [fx + sh * 0.72, hip], [fx - sw * 0.5 + sh * 0.36, fy - h * 0.03], [fx - sw * 0.5 + sh * 0.4, fy], [fx - sw * 0.5 - sh * 0.3, fy], [fx - sw * 0.5 - sh * 0.12, fy - h * 0.03]]];
        const col = o.col ?? '#1a0640', lw = cap(0.03 * s, 0.8, 2.5);
        for (const q of legs) Ink.shape(g, q, col, { w: s > 30 ? lw : 0, seed: seed + 3, d, jit: 0.3 });
        Ink.shape(g, body, o.shirt ?? col, { w: s > 30 ? lw : 0, seed: seed + 1, d, jit: 0.3 });
        const hp = []; for (let i = 0; i < 10; i++) { const an = i / 10 * Math.PI * 2; hp.push([head[0] + Math.cos(an) * hr, head[1] + Math.sin(an) * hr * 1.15]); }
        Ink.shape(g, hp, col, { w: s > 30 ? lw : 0, seed: seed + 2, d, jit: 0.2 });
        // arms swinging against the legs
        for (const sg of [-1, 1]) Ink.brush(g, [[fx + sg * sh * 0.95, top + h * 0.02], [fx + sg * sh + sw * -0.3 * sg * sg, top + h * 0.2], [fx + sg * sh * 0.9 - sw * 0.45, hip + h * 0.02]], { w: cap(0.09 * s, 1, 10), col, seed: seed + 5 + sg, d, taper: 0.25 });
        if (rim && s > 8) Ink.brush(g, [[head[0] + hr * 0.7, head[1] - hr * 0.6], [fx + sh, top + h * 0.03], [fx + sh * 0.8, hip]], { w: cap(0.025 * s, 1, 3), col: rim, seed: seed + 9, d, taper: 0.4 });
    }

    return { wall, tex, clouds, walker, pane, TW, CW };
})();
