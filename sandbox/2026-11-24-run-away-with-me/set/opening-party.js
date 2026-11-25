// The party inside the hotel, in the drawn manner: an Art Deco ballroom (pilasters with neon
// tubes, a neon fan behind the DJ, tall windows on the night, a pink cove under the ceiling),
// a bar of lit bottles along the left wall, a light-up dance floor, a truss of lamps whose
// beams change colour on the beat, a mirror ball throwing spots that crawl over the walls and
// the floor, and a dense crowd of drawn silhouettes with neon rims dancing by changes of
// drawing. She stands in it (her approved sheet, Couple.standing). Built in metres: floor y 0,
// ceiling 6.5, side walls x ±11, back wall z 24.
// Global: OpeningParty.
(() => {
    const P = Ink.PAL, css = Neon.css, hex = Neon.hex, mix = Neon.mix;
    const cap = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
    const lw = (s, m = 0.05) => cap(m * s, 1.2, 5);
    const R0 = { x: 11, y: 6.5, z: 24, front: -3 };
    const BALL = [0, 5.0, 12], HER = [0.55, 0, 10.2];
    const BEATCOLS = [P.magenta, P.cyan, P.pink, P.violet, P.gold, P.aqua];

    // what the room's lights do at song second T: o.energy 0 (before the bass) .. 1
    function lights(T, energy) {
        const b = Song.beatAt(T), bi = Math.floor(b), fr = b - bi;
        const hit = Math.exp(-fr * 5) * energy;                         // a pulse on every beat
        return { bi, hit, col: BEATCOLS[((bi % 6) + 6) % 6], col2: BEATCOLS[(((bi + 3) % 6) + 6) % 6], energy, spin: T * 0.55 };
    }

    // --- the room (the far pass: everything here is lit and bloomed before the crowd) ---------
    function room(g, L, cam, T, d, lt, env) {
        const quad = (pts, col, o = {}) => { const q = Neon.poly(cam, pts); if (q) Ink.shape(g, q, col, { w: o.w ?? 2.6, seed: o.seed ?? 1, d, jit: o.jit ?? 0.4, light: o.light }); return q; };
        const tubeW = (pts, col, w = 0.08, on = 1) => {
            const Q = pts.map(cam.p); if (Q.some((p) => p[2] < 0.3)) return;
            const s = cam.f / Q[0][2], wd = cap(w * s, 0.9, 7);
            const path = (c) => { c.beginPath(); Q.forEach((p, i) => (i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]))); };
            g.save(); g.lineCap = 'round'; g.lineJoin = 'round'; path(g); g.globalAlpha = on; g.strokeStyle = col; g.lineWidth = wd; g.stroke();
            if (wd > 1.6) { g.strokeStyle = css(mix(col, '#ffffff', 0.55)); g.lineWidth = wd * 0.38; g.stroke(); } g.restore();
            L.save(); L.lineCap = 'round'; L.lineJoin = 'round'; L.globalAlpha = 0.9 * on; L.strokeStyle = col; L.lineWidth = wd * 1.7; path(L); L.stroke(); L.restore();
        };
        const { x: X, y: Y, z: Zb } = R0, F = R0.front;
        // ceiling, walls, floor
        quad([[-X, Y, F], [X, Y, F], [X, Y, Zb], [-X, Y, Zb]], '#0b0230', { w: 0, seed: 11 });
        quad([[-X, 0, Zb], [X, 0, Zb], [X, Y, Zb], [-X, Y, Zb]], '#1a0650', { w: 0, seed: 12 });
        quad([[-X, 0, F], [-X, 0, Zb], [-X, Y, Zb], [-X, Y, F]], '#200a5a', { w: 0, seed: 13 });
        quad([[X, 0, F], [X, 0, Zb], [X, Y, Zb], [X, Y, F]], '#160548', { w: 0, seed: 14 });
        quad([[-X, 0, F], [X, 0, F], [X, 0, Zb], [-X, 0, Zb]], '#120440', { w: 0, seed: 15 });
        // the ceiling's coffers: recessed panels between beams, each with a lit lip on its far edge
        for (let i = -3; i < 3; i++) for (let j = 0; j < 9; j++) {
            const x0 = i * 3.6 + 0.35, x1 = x0 + 2.9, z0 = F + j * 3.0 + 0.35, z1 = z0 + 2.3, cy = Y - 0.02;
            if (Math.abs((x0 + x1) / 2 - BALL[0]) < 2 && Math.abs((z0 + z1) / 2 - BALL[2]) < 2) continue;
            const q = quad([[x0, cy, z0], [x1, cy, z0], [x1, cy, z1], [x0, cy, z1]], (i + j) % 2 ? '#160548' : '#1a0650', { w: 1.6, seed: 16 + i * 20 + j });
            if (q) { const a = cam.p([x0 + 0.2, cy, z1 - 0.1]), b = cam.p([x1 - 0.2, cy, z1 - 0.1]); if (a[2] > 0.5 && b[2] > 0.5) Ink.brush(g, [[a[0], a[1]], [b[0], b[1]]], { w: cap(0.04 * cam.f / a[2], 1, 3), col: (i + j) % 3 ? P.purple : P.violet, seed: 17 + i * 20 + j, d, taper: 0.3, alpha: 0.8 }); }
        }
        // the medallion round the ball's rod: stepped rings, the inner one a tube
        for (const [r, col] of [[1.0, '#2a0c66'], [0.6, '#3a0c6e']]) { const pts = []; for (let i = 0; i < 24; i++) { const a = (i / 24) * Math.PI * 2; pts.push([BALL[0] + Math.cos(a) * r, Y - 0.03, BALL[2] + Math.sin(a) * r]); } quad(pts, col, { seed: 18 + r * 10, w: 1.8 }); }
        // the pilasters on the back wall, each with a tube up its face; a neon fan behind the DJ
        for (let i = -4; i <= 4; i++) {
            const x = i * 2.45; if (Math.abs(x) < 3.5) continue;
            quad([[x - 0.35, 0, Zb - 0.05], [x + 0.35, 0, Zb - 0.05], [x + 0.35, Y - 0.4, Zb - 0.05], [x - 0.35, Y - 0.4, Zb - 0.05]], P.plum, { seed: 20 + i });
            tubeW([[x, 1.2, Zb - 0.1], [x, Y - 0.8, Zb - 0.1]], i % 2 ? P.cyan : P.magenta, 0.07, 0.75 + 0.25 * lt.hit);
        }
        const fc = [0, 1.6, Zb - 0.1];
        for (let r = 1; r <= 3; r++) { const pts = []; for (let j = 0; j <= 20; j++) { const a = Math.PI * (j / 20); pts.push([fc[0] + Math.cos(a) * (1.4 + r * 1.05), fc[1] + Math.sin(a) * (1.4 + r * 1.05), fc[2]]); } tubeW(pts, r === 2 ? lt.col : P.pink, 0.08, r === 3 ? 0.5 + 0.5 * lt.hit : 1); }
        for (let j = 1; j < 9; j++) { const a = Math.PI * (j / 9), on = lt.energy > 0 ? (((lt.bi + j) % 3 === 0) ? 1 : 0.35) : 0.5; tubeW([[Math.cos(a) * 1.5, fc[1] + Math.sin(a) * 1.5, fc[2]], [Math.cos(a) * 4.5, fc[1] + Math.sin(a) * 4.5, fc[2]]], P.gold, 0.06, on); }
        { const pts = []; for (let i = 0; i <= 24; i++) { const a = (i / 24) * Math.PI * 2; pts.push([BALL[0] + Math.cos(a) * 0.85, Y - 0.05, BALL[2] + Math.sin(a) * 0.85]); } tubeW(pts, P.cyan, 0.05, 0.8 + 0.2 * lt.hit); }
        // the cove under the ceiling, all round
        tubeW([[-X + 0.1, Y - 0.3, F], [-X + 0.1, Y - 0.3, Zb - 0.1], [X - 0.1, Y - 0.3, Zb - 0.1], [X - 0.1, Y - 0.3, F]], P.pink, 0.08);
        // the tall windows on the right wall: an arched opening in a deep frame, the night outside
        // (sky bands, the moon's path on the sea, a far shore of lights), a grid of mullions, curtains
        for (const z of [3, 8.5, 14, 19.5]) {
            const xw = X - 0.05, arch = (r, y0) => { const o = []; for (let i = 0; i <= 10; i++) { const a = Math.PI * (i / 10); o.push([xw, y0 + Math.sin(a) * r, z - Math.cos(a) * r]); } return o; };
            const open = [[xw, 0.9, z - 1.25]].concat(arch(1.25, 4.0), [[xw, 0.9, z + 1.25]]);
            const frameQ = quad([[xw, 0.75, z - 1.5]].concat(arch(1.5, 4.0), [[xw, 0.75, z + 1.5]]), '#2a0c66', { seed: 30 + z, w: 2 });
            const q = Neon.poly(cam, open); if (!q) continue;
            // the view, clipped to the opening: sky bands, the horizon, the sea with the moon's path, far lights
            g.save(); g.beginPath(); q.forEach((p, i) => (i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]))); g.closePath(); g.clip();
            const band = (y0, y1, col, k) => quad([[xw - 0.01, y0, z - 1.3], [xw - 0.01, y1, z - 1.3], [xw - 0.01, y1, z + 1.3], [xw - 0.01, y0, z + 1.3]], col, { w: 0, seed: k, jit: 0 });
            band(2.6, 5.4, '#0f0138', 31 + z); band(2.15, 2.6, '#3c0ca8', 32 + z); band(1.95, 2.15, '#a8189e', 33 + z); band(0.8, 1.95, '#140548', 34 + z);
            for (let i = 0; i < 9; i++) { const zz = z - 1.1 + i * 0.27, y = 1.95 + Ink.hsh(z, i, 3) * 0.12, p = cam.p([xw - 0.02, y, zz]); if (p[2] > 0.5) { const r = cap(0.025 * cam.f / p[2], 1, 4); g.fillStyle = [P.gold, P.pink, P.cyan][i % 3]; g.fillRect(p[0] - r / 2, p[1] - r, r, r * 1.6); } }
            for (let i = 0; i < 6; i++) { const y = 1.85 - i * 0.16, a = cam.p([xw - 0.02, y, z + 0.1 - 0.15 - i * 0.05]), b = cam.p([xw - 0.02, y, z + 0.1 + 0.15 + i * 0.05]); if (a[2] > 0.5) Ink.brush(g, [[a[0], a[1]], [b[0], b[1]]], { w: cap(0.03 * cam.f / a[2], 1, 3), col: P.cream, seed: 35 + z * 10 + i, d, taper: 0.4, alpha: 0.8, light: true }); }
            const mo = cam.p([xw - 0.02, 3.3, z + 0.1]); if (mo[2] > 0.5) { const r = 0.13 * cam.f / mo[2], cr = []; for (let i = 0; i <= 12; i++) { const a = Math.PI * 0.5 + (i / 12) * Math.PI; cr.push([mo[0] + Math.cos(a) * r, mo[1] + Math.sin(a) * r]); } for (let i = 12; i >= 0; i--) { const a = Math.PI * 0.5 + (i / 12) * Math.PI; cr.push([mo[0] + r * 0.35 + Math.cos(a) * r * 0.8, mo[1] + Math.sin(a) * r * 0.9]); } Ink.shape(g, cr, P.cream, { w: 0, seed: 36 + z, d, light: true }); }
            g.restore();
            // the mullions: two uprights and three bars, the arch's own ribs
            const bar = (A, B2, k) => { const a = cam.p(A), b = cam.p(B2); if (a[2] > 0.5 && b[2] > 0.5) Ink.brush(g, [[a[0], a[1]], [b[0], b[1]]], { w: cap(0.06 * cam.f / a[2], 1.2, 5), col: '#2a0c66', seed: 37 + z * 10 + k, d, taper: 0.05 }); };
            bar([xw - 0.03, 0.9, z - 0.42], [xw - 0.03, 4.0, z - 0.42], 1); bar([xw - 0.03, 0.9, z + 0.42], [xw - 0.03, 4.0, z + 0.42], 2);
            for (const y of [1.7, 2.6, 3.4]) bar([xw - 0.03, y, z - 1.25], [xw - 0.03, y, z + 1.25], 3 + y);
            bar([xw - 0.03, 4.0, z], [xw - 0.03, 5.25, z], 7);
            // the curtains, gathered at each side in folds, a tie-back, a lit edge
            for (const sg of [-1, 1]) {
                const zc = z + sg * 1.45, pts = [[xw - 0.1, 5.5, zc + sg * 0.55], [xw - 0.1, 5.5, zc - sg * 0.55], [xw - 0.1, 2.0, zc - sg * 0.25], [xw - 0.1, 0.0, zc - sg * 0.5], [xw - 0.1, 0.0, zc + sg * 0.55]];
                const cq = quad(pts, P.grape, { seed: 40 + z + sg, w: 1.8 });
                if (!cq) continue;
                for (let k = 0; k < 3; k++) { const zz = zc + sg * (0.3 - k * 0.22); bar([xw - 0.11, 5.3, zz], [xw - 0.11, 2.1, zc - sg * 0.1 + sg * (0.2 - k * 0.12)], 50 + sg * 5 + k); }
                const t0 = cam.p([xw - 0.12, 2.0, zc - sg * 0.3]), t1 = cam.p([xw - 0.12, 2.0, zc + sg * 0.5]); if (t0[2] > 0.5) Ink.brush(g, [[t0[0], t0[1]], [t1[0], t1[1]]], { w: cap(0.05 * cam.f / t0[2], 1, 4), col: P.gold, seed: 60 + z + sg, d, taper: 0.2 });
                const e0 = cam.p([xw - 0.12, 5.3, zc - sg * 0.53]), e1 = cam.p([xw - 0.12, 2.2, zc - sg * 0.27]); if (e0[2] > 0.5) Ink.brush(g, [[e0[0], e0[1]], [e1[0], e1[1]]], { w: cap(0.025 * cam.f / e0[2], 1, 3), col: P.pink, seed: 62 + z + sg, d, taper: 0.4, alpha: 0.8, light: true });
            }
        }
        // the bar along the left wall: shelves of bottles lit from below, a mirror strip, the counter
        const xb = -X + 0.05;
        quad([[xb, 1.2, 5], [xb, 1.2, 20], [xb, 3.4, 20], [xb, 3.4, 5]], '#2a0c66', { seed: 50 });
        tubeW([[xb + 0.05, 1.25, 5], [xb + 0.05, 1.25, 20]], P.gold, 0.06); tubeW([[xb + 0.05, 2.3, 5], [xb + 0.05, 2.3, 20]], P.gold, 0.05);
        for (let i = 0; i < 52; i++) {
            const z = 5.3 + i * 0.28, row = i % 2, y0 = row ? 2.32 : 1.27, h = 0.32 + Ink.hsh(i, 2, 3) * 0.18, col = [P.salmon, P.aqua, P.gold, P.pink, P.mint, P.red][i % 6];
            const q = quad([[xb + 0.08, y0, z - 0.06], [xb + 0.08, y0, z + 0.06], [xb + 0.08, y0 + h * 0.6, z + 0.06], [xb + 0.08, y0 + h, z + 0.025], [xb + 0.08, y0 + h, z - 0.025], [xb + 0.08, y0 + h * 0.6, z - 0.06]], col, { w: 1.2, seed: 60 + i, light: true, jit: 0.2 });
        }
        quad([[-X + 1.4, 0, 5], [-X + 1.4, 0, 20], [-X + 1.4, 1.1, 20], [-X + 1.4, 1.1, 5]], P.indigo, { seed: 51 });
        quad([[-X + 1.4, 1.1, 5], [-X + 1.4, 1.1, 20], [-X + 2.0, 1.15, 20], [-X + 2.0, 1.15, 5]], P.purple, { seed: 52 });
        tubeW([[-X + 2.02, 1.12, 5], [-X + 2.02, 1.12, 20]], P.cyan, 0.06);
        // the stage: a platform, two speaker stacks, the DJ's booth with its neon chevrons
        quad([[-4.5, 0, 20], [4.5, 0, 20], [4.5, 1.0, 20], [-4.5, 1.0, 20]], P.indigo, { seed: 70 });
        quad([[-4.5, 1.0, 20], [4.5, 1.0, 20], [4.5, 1.0, 23.9], [-4.5, 1.0, 23.9]], '#2a0c66', { seed: 71, w: 0 });
        for (const sx of [-1, 1]) {
            const x0 = sx * 3.2 - 0.7, x1 = sx * 3.2 + 0.7;
            quad([[x0, 1.0, 21.5], [x1, 1.0, 21.5], [x1, 3.6, 21.5], [x0, 3.6, 21.5]], '#140540', { seed: 72 + sx });
            for (const [yy, r] of [[1.6, 0.42], [2.5, 0.42], [3.25, 0.2]]) {
                const pts = []; const pump = 1 + 0.08 * lt.hit; for (let i = 0; i < 16; i++) { const a = (i / 16) * Math.PI * 2; pts.push([sx * 3.2 + Math.cos(a) * r * pump, yy + Math.sin(a) * r * pump, 21.45]); }
                quad(pts, P.grape, { seed: 74 + yy * 10 + sx, w: 1.6 });
            }
        }
        quad([[-2.2, 1.0, 20.6], [2.2, 1.0, 20.6], [2.2, 2.1, 20.6], [-2.2, 2.1, 20.6]], P.plum, { seed: 80 });
        for (let i = -3; i <= 3; i++) tubeW([[i * 0.6 - 0.22, 1.3, 20.55], [i * 0.6, 1.75, 20.55], [i * 0.6 + 0.22, 1.3, 20.55]], (i + lt.bi) % 2 ? P.cyan : lt.col, 0.05);
        // the light-up dance floor: tiles that change on the beat (dark before the bass)
        for (let i = -4; i < 4; i++) for (let j = 0; j < 10; j++) {
            const x0 = i * 1.5, z0 = 4 + j * 1.5, h = Ink.hsh(i * 7 + j, lt.bi, 9), on = lt.energy > 0 && h < 0.45;
            const col = on ? BEATCOLS[Math.floor(Ink.hsh(i, j + lt.bi, 4) * 6)] : (h < 0.5 ? '#2a0c66' : '#1a0650');
            const q = quad([[x0 + 0.05, 0.01, z0 + 0.05], [x0 + 1.45, 0.01, z0 + 0.05], [x0 + 1.45, 0.01, z0 + 1.45], [x0 + 0.05, 0.01, z0 + 1.45]], col, { w: 0, seed: 90 + i * 20 + j, jit: 0, light: on });
            if (q && on) { L.save(); L.globalAlpha = 0.25 * lt.energy; L.fillStyle = col; L.beginPath(); q.forEach((p, k) => (k ? L.lineTo(p[0], p[1]) : L.moveTo(p[0], p[1]))); L.closePath(); L.fill(); L.restore(); }
        }
    }

    // the mirror ball's spots: fixed facet directions turning with the ball, each a ray from the
    // ball to the first wall, floor or ceiling it meets; drawn as small lights where they land
    const DIRS = (() => { const out = [], n = 90; for (let i = 0; i < n; i++) { const y = 1 - (2 * (i + 0.5)) / n, r = Math.sqrt(1 - y * y), a = i * 2.39996; out.push([Math.cos(a) * r, y, Math.sin(a) * r, i]); } return out.filter((v) => v[1] < 0.35); })();
    function spots(g, L, cam, T, lt, d, rays) {
        const c = Math.cos(lt.spin), s0 = Math.sin(lt.spin), cols = [P.cream, P.cyan, P.pink, P.cream, P.gold];
        for (const [dx0, dy, dz0, i] of DIRS) {
            const dx = dx0 * c - dz0 * s0, dz = dx0 * s0 + dz0 * c;
            let t = Infinity;
            const hitP = (num, den) => { if (Math.abs(den) > 1e-4) { const u = num / den; if (u > 0.1 && u < t) t = u; } };
            hitP(R0.x - BALL[0], dx); hitP(-R0.x - BALL[0], dx); hitP(R0.z - BALL[2], dz); hitP(R0.front - BALL[2], dz); hitP(-BALL[1], dy); hitP(R0.y - BALL[1], dy);
            const hp = [BALL[0] + dx * t, BALL[1] + dy * t, BALL[2] + dz * t], p = cam.p(hp); if (p[2] < 0.5) continue;
            const r = cap(0.09 * cam.f / p[2], 1.5, 18), col = cols[i % cols.length];
            g.save(); g.fillStyle = col; g.globalAlpha = 0.85; g.beginPath(); g.ellipse(p[0], p[1], r * 1.3, r * 0.8, (i % 5) * 0.4, 0, Math.PI * 2); g.fill(); g.restore();
            L.save(); L.globalAlpha = 0.5; L.fillStyle = col; L.beginPath(); L.arc(p[0], p[1], r * 1.6, 0, Math.PI * 2); L.fill(); L.restore();
            if (rays && i % 4 === 0) { const b = cam.p(BALL); if (b[2] > 0.5) Ink.brush(L, [[b[0], b[1]], [p[0], p[1]]], { w: cap(0.02 * cam.f / b[2], 1, 3), col, seed: 9000 + i, d, taper: 0.7, alpha: 0.22, light: true }); }
        }
    }

    function ball(g, L, cam, T, lt, d) {
        const c = cam.p(BALL); if (c[2] < 0.5) return;
        const s = cam.f / c[2], r = 0.62 * s, top = cam.p([BALL[0], R0.y, BALL[2]]);
        Ink.brush(g, [[top[0], top[1]], [c[0], c[1] - r]], { w: cap(0.03 * s, 1.2, 5), seed: 'rod', d, taper: 0.05 });
        const disc = []; for (let i = 0; i < 28; i++) { const a = (i / 28) * Math.PI * 2; disc.push([c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r]); }
        Ink.shape(g, disc, '#3a2a7a', { w: lw(s, 0.035), seed: 'ball', d, jit: 0.3 });
        // facets in latitude rows, turning with the ball; the ones that face the lamps flare
        for (let a = -5; a <= 5; a++) {
            const lat = (a / 6) * (Math.PI / 2), n = Math.max(4, Math.round(22 * Math.cos(lat))), fh = (Math.PI / 12) * r * 0.9;
            for (let j = 0; j < n; j++) {
                const ph = (j / n) * Math.PI * 2 + lt.spin; const zf = Math.cos(lat) * Math.cos(ph); if (zf < 0.12) continue;
                const fx = c[0] + Math.sin(ph) * Math.cos(lat) * r, fy = c[1] - Math.sin(lat) * r, fw = (Math.PI * 2 / n) * Math.cos(lat) * r * zf * 0.85;
                const bright = Ink.hsh(a * 31 + j, Math.floor(lt.spin * 6), 7), col = bright > 0.86 ? P.cream : bright > 0.7 ? P.cyan : bright > 0.55 ? P.pink : bright > 0.3 ? '#7a6ab8' : '#4a3a8a';
                g.fillStyle = col; g.fillRect(fx - fw / 2, fy - fh * Math.cos(lat) * 0.5, Math.max(1, fw - 1), Math.max(1, fh * 0.85));
                if (bright > 0.93 && fw > 2) Neon.last.glint(g, L, fx, fy, cap(0.06 * s, 3, 18), hex(P.cream), { alpha: 0.9, star: 1, rays: 4, rot: 0.4 });
            }
        }
        Ink.brush(g, disc.slice(16, 26), { w: cap(0.025 * s, 1, 4), col: P.cyan, seed: 'ballrim', d, taper: 0.3 });
    }

    // beams from two trusses of lamps, sweeping, a colour per beat (after the bass only)
    function beams(g, L, cam, T, lt, d) {
        if (lt.energy <= 0) return;
        for (const [zt, n] of [[7, 5], [16, 5]]) for (let i = 0; i < n; i++) {
            const x = -8 + i * 4, src = [x, R0.y - 0.3, zt], sw = Math.sin(T * 1.3 + i * 1.7 + zt) * 4;
            const tgt = [x * 0.4 + sw, 0, zt + Math.cos(T * 0.9 + i) * 3];
            const a = cam.p(src), b = cam.p(tgt); if (a[2] < 0.5 || b[2] < 0.5) continue;
            const col = (i + (zt > 10 ? 1 : 0)) % 2 ? lt.col : lt.col2, spread = 0.9 * cam.f / b[2];
            L.save(); L.globalAlpha = 0.1 + 0.18 * lt.hit; L.fillStyle = col; L.beginPath(); L.moveTo(a[0], a[1]); L.lineTo(b[0] - spread, b[1]); L.lineTo(b[0] + spread, b[1]); L.closePath(); L.fill(); L.restore();
            for (const e of [-0.7, 0.7]) Ink.brush(g, [[a[0], a[1]], [b[0] + e * spread, b[1]]], { w: cap(0.03 * cam.f / b[2], 1, 3), col, seed: 9500 + i * 7 + zt + e * 3, d, taper: 0.5, alpha: 0.5 * lt.energy, light: true });
            Ink.shape(g, [[a[0] - 0.2 * cam.f / a[2], a[1] - 0.15 * cam.f / a[2]], [a[0] + 0.2 * cam.f / a[2], a[1] - 0.15 * cam.f / a[2]], [a[0] + 0.15 * cam.f / a[2], a[1] + 0.1 * cam.f / a[2]], [a[0] - 0.15 * cam.f / a[2], a[1] + 0.1 * cam.f / a[2]]], '#140540', { w: 1.4, seed: 9600 + i + zt, d });
        }
    }

    // --- the crowd ------------------------------------------------------------------------------
    const CROWD = (() => {
        const out = [], R = Motion.rng('opening-crowd');
        for (let i = 0; i < 150; i++) {
            const x = -8.2 + R() * 16.4, z = 1.5 + R() * 17.5;
            if (Math.abs(x - HER[0]) < 0.75 && Math.abs(z - HER[2]) < 0.9) continue;
            if (Math.abs(x - HER[0]) < 1.1 && z < HER[2] && z > HER[2] - 7) continue;     // a lane from the camera to her
            out.push({ x, z, seed: 500 + i, flip: R() < 0.5, every: R() < 0.25 ? 2 : 1 });
        }
        // the ring round her, who press in on «I'm sick of the party»
        for (const [dx, dz, sd] of [[-1.05, 0.15, 1], [1.0, 0.35, 2], [-1.55, -0.5, 3], [1.6, -0.55, 4], [-0.6, 1.0, 5], [0.65, 1.15, 6], [-2.3, 0.4, 7], [2.3, 0.3, 8]]) out.push({ x: HER[0] + dx, z: HER[2] + dz, seed: 900 + sd, flip: dx > 0, every: 1, ring: true });
        // at the bar and behind the decks
        for (let i = 0; i < 7; i++) out.push({ x: -8.9 + Ink.hsh(i, 1, 2) * 0.4, z: 6 + i * 2, seed: 960 + i, flip: true, every: 4, bar: true });
        out.push({ x: 0, z: 21.6, y: 1.0, seed: 999, flip: false, every: 1, dj: true });
        return out;
    })();

    // o: { energy, press (0..1), her: { view } | null, rimA }
    function crowd(g, L, cam, T, d, lt, o, env) {
        const items = [], air = '#5a2a9a';
        const cols = lt.energy > 0 ? [[P.cyan, P.magenta], [P.cyan, lt.col], [lt.col2, P.magenta]][lt.bi % 3 < 0 ? 0 : lt.bi % 3] : [P.cyan, P.magenta];
        for (const c of CROWD) {
            let x = c.x, z = c.z;
            if (c.ring && o.press > 0) { x = HER[0] + (x - HER[0]) * (1 - 0.42 * o.press); z = HER[2] + (z - HER[2]) * (1 - 0.3 * o.press); }
            const p = cam.p([x, c.y ?? 0, z]); if (p[2] < 1.0) continue;
            const s = cam.f / p[2]; if (p[0] < -1.2 * s || p[0] > env.W + 1.2 * s || p[1] - 2.2 * s > env.H) continue;
            items.push({ depth: p[2], draw: () => {
                const dn = c.bar ? { name: Ink.hsh(c.seed, Math.floor(Song.beatAt(T) / 4), 1) < 0.5 ? 'drink' : 'stand', kick: 0 } : c.dj ? { name: lt.bi % 4 === 0 && lt.energy > 0 ? 'upR' : 'elbows', kick: lt.hit > 0.5 ? 1 : 0 } : OpeningFigures.dance(c.seed, T, lt.energy > 0 ? c.every : 2);
                const haze = cap((p[2] - 7) / 22, 0, 0.5);
                OpeningFigures.draw(g, p[0], p[1], s, { crowd: true, pose: dn.name, kick: lt.energy > 0 ? dn.kick : 0, look: OpeningFigures.look(c.seed), flip: c.flip, seed: c.seed, d, rim: (o.rimA ?? 1) * (0.75 + 0.25 * lt.hit), cols, haze, air });
            } });
        }
        if (o.her) items.push({ depth: cam.view([HER[0], 1.5, HER[2]])[2], draw: () => {
            // her drawing on its own layer: laid on the picture, cut out of the light behind her,
            // then rimmed by the room: the edge of her silhouette that faces each side, cyan from
            // the left, the beat's colour from the right (on the picture only: no strokes on her face)
            const opt = { view: o.her.view, cut: o.her.cut ?? 1.05, T, d, wind: 0.002 };
            const lay = Motion.layer(env, 'opening-her', (c) => Couple.standing(c, cam, 'her', HER, opt));
            g.drawImage(lay, 0, 0, env.W, env.H);
            L.save(); L.setTransform(1, 0, 0, 1, 0, 0); L.globalCompositeOperation = 'destination-out'; L.drawImage(lay, 0, 0); L.restore();
            const k = env.k, w = Math.max(2, 3.2 * k), rim = Motion.layer(env, 'opening-her-rim', () => {}), R = rim.getContext('2d');
            g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
            for (const [dx, col, a] of [[w, P.cyan, 0.85], [-w, lt.energy > 0 ? lt.col : P.magenta, 0.7]]) {
                R.setTransform(1, 0, 0, 1, 0, 0); R.globalCompositeOperation = 'source-over'; R.clearRect(0, 0, rim.width, rim.height);
                R.drawImage(lay, 0, 0); R.globalCompositeOperation = 'destination-out'; R.drawImage(lay, dx, -w * 0.4);
                R.globalCompositeOperation = 'source-in'; R.fillStyle = col; R.fillRect(0, 0, rim.width, rim.height);
                g.globalAlpha = a * (0.8 + 0.2 * lt.hit); g.drawImage(rim, 0, 0);
            }
            g.restore();
        } });
        items.sort((a, b) => b.depth - a.depth);
        for (const it of items) it.draw();
    }

    // --- one frame ------------------------------------------------------------------------------
    // o: { energy, press, her, rays, flash, close (0..1: the room darkening round her) }
    function frame(g, env, N, T, d, cam, o = {}) {
        const lt = lights(T, o.energy ?? 1);
        Ink.occlude(null);
        g.fillStyle = '#0b0230'; g.fillRect(0, 0, env.W, env.H);
        let L = N.light();
        room(g, L, cam, T, d, lt, env);
        spots(g, L, cam, T, lt, d, o.rays);
        beams(g, L, cam, T, lt, d);
        ball(g, L, cam, T, lt, d);
        N.bloom(g, L, { strength: 0.45 + 0.25 * lt.hit, core: 0.6 });
        L = N.light(); Ink.occlude(L);
        crowd(g, L, cam, T, d, lt, o, env);
        Ink.occlude(null);
        N.bloom(g, L, { strength: 0.4, core: 0.5 });
        // the room closing in on her: the dark comes in from the edges, a beat at a time
        if (o.close > 0) {
            const c = cam.p([HER[0], 1.5, HER[2]]), r1 = env.W * (0.95 - 0.5 * o.close), r0 = r1 * 0.35;
            const gr = g.createRadialGradient(c[0], c[1], r0, c[0], c[1], r1);
            gr.addColorStop(0, 'rgba(4,2,30,0)'); gr.addColorStop(1, `rgba(4,2,30,${0.75 * o.close})`);
            g.save(); g.fillStyle = gr; g.fillRect(0, 0, env.W, env.H); g.restore();
        }
        if (o.flash > 0) { g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = `rgba(255,120,220,${o.flash})`; g.fillRect(0, 0, env.W, env.H); g.restore(); }
        return lt;
    }

    window.OpeningParty = { frame, HER, BALL, lights };
})();
