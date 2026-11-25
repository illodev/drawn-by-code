// The causeway, the bay and the city in the drawn manner of the user's reference (styles/
// retro-neon/ink.js): flat neon inks, a thick boiling brush line, light laid on as strokes.
// The geometry is Causeway's (metres, the same camera); only the painting differs.
// Round 3 (the audit of every shot at 100 %): things are where the camera says they are
// (the city laid in exact strips, stars and bars fixed in the sky), opaque things hide the
// light behind them (Ink.occlude, set by the scene), the deck hides what lies beyond its crest,
// reflections lie only where their surface is, and every plane carries strokes.
// Global: Drawn.
const Drawn = (() => {
    const P = Ink.PAL;
    const hex = Neon.hex, css = Neon.css, mix = Neon.mix;
    const C = Causeway;
    const tone = (c, fx, k = 1) => (fx.hue ? css(Neon.shift(c, fx.hue * k)) : c);
    const cap = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
    // a line weight by screen size: about 2.2 px for a thing ~100 px across, 6 px at most
    const lw = (s, m = 0.05) => cap(m * s, 1.2, 6);

    // a direction in the sky (azimuth a, elevation e; 0,0 = straight down the road) through the camera
    const skyP = (cam, a, e) => { const r = 20000; return cam.p([cam.pos[0] + Math.sin(a) * Math.cos(e) * r, cam.pos[1] + Math.sin(e) * r, cam.pos[2] + Math.cos(a) * Math.cos(e) * r]); };

    // --- the sky -------------------------------------------------------------------------------
    // The bands sit at fixed elevations above the horizon (they do not squash when the camera
    // tilts) and the whole sky and bay are drawn in the camera's rolled frame: a frame rotated
    // about the horizon's centre by the horizon's own slant on screen.
    const BANDS = ['#04022e', '#0f0138', '#18065e', '#260a8c', '#3c0ca8', '#6a1290', '#a8189e'];
    const BAND_E = [0.75, 0.42, 0.26, 0.16, 0.095, 0.05, 0.02];          // radians above the horizon
    const level = (cam) => { const a = skyP(cam, -0.6, 0), b = skyP(cam, 0.6, 0), c = skyP(cam, 0, 0); return { ang: Math.atan2(b[1] - a[1], b[0] - a[0]), cx: c[0], cy: c[1] }; };
    const span = (cam, e) => { const p = skyP(cam, 0, e), c = skyP(cam, 0, 0); return Math.hypot(p[0] - c[0], p[1] - c[1]) * (p[1] < c[1] ? 1 : -1); };
    function sky(g, cam, T, d, fx, env, horizon) {
        const bands = BANDS.map((c) => tone(c, fx, 0.4)), lv = level(cam), Wd = env.W * 1.6;
        g.save(); g.translate(lv.cx, lv.cy); g.rotate(lv.ang);
        const top = -env.H * 2;
        for (let i = 0; i < bands.length; i++) {
            const y0 = i === 0 ? top : -span(cam, BAND_E[i]);
            g.fillStyle = bands[i];
            g.beginPath(); g.moveTo(-Wd, 6); g.lineTo(-Wd, y0);
            for (let x = -Wd; x <= Wd; x += 30) g.lineTo(x, y0 + Ink.noise(900 + i, x / 160, 0) * 6 + Ink.noise(950 + i, x / 45, 0) * 2);
            g.lineTo(Wd, 6); g.closePath(); g.fill();
            if (i > 0) {
                const y1 = i + 1 < bands.length ? -span(cam, BAND_E[i + 1]) : 0;
                Ink.strokes(g, -Wd, y0 - (y0 - (i > 1 ? -span(cam, BAND_E[i - 1]) : y0 - 60)) * 0.45, Wd * 2, Math.max(4, Math.abs(y1 - y0) * 0.5), { ang: 0, count: 10, len: 220, w: 5, cols: [bands[i]], seed: 300 + i, d, alpha: 0.55 });
            }
        }
        if (fx.hold > 0) { const yh = -span(cam, BAND_E[bands.length - 1]); g.globalAlpha = 0.3 * fx.hold; g.fillStyle = P.magenta; g.fillRect(-Wd, yh, Wd * 2, -yh + 6); g.globalAlpha = 1; }
        g.restore();
        // stars, fixed in the sky (they move with the camera), twinkling in size on twos
        const R = Motion.rng('ink-stars');
        for (let i = 0; i < 110; i++) {
            const a = (R() * 2 - 1) * 1.3, e = 0.03 + Math.pow(R(), 1.4) * 0.55, s0 = 1.5 + R() * 3.2, cyan = R() < 0.3;
            const p = skyP(cam, a, e); if (p[2] < 1 || p[1] > horizon - 8) continue;
            const sz = s0 * (0.55 + 0.55 * Ink.hsh(i, 7, d));
            g.strokeStyle = cyan ? P.cyan : P.cream; g.lineWidth = Math.max(1, sz * 0.35); g.lineCap = 'round';
            g.beginPath(); g.moveTo(p[0] - sz, p[1]); g.lineTo(p[0] + sz, p[1]); g.moveTo(p[0], p[1] - sz); g.lineTo(p[0], p[1] + sz); g.stroke();
        }
        if (fx.trip > 0) {
            const R3 = Motion.rng('trip-stars');
            for (let i = 0; i < 22; i++) {
                const a = (R3() * 2 - 1) * 1.1, e = 0.06 + R3() * 0.4, r0 = 5 + R3() * 9, col = [P.cyan, P.pink, P.gold, P.cream][i % 4];
                const p = skyP(cam, a, e); if (p[2] < 1 || p[1] > horizon - 12) continue;
                const r = r0 * fx.trip * (0.6 + 0.5 * fx.kick + 0.25 * Ink.hsh(i, 5, d));
                g.save(); g.fillStyle = col; g.beginPath();
                for (let j = 0; j < 8; j++) { const an = (j / 8) * Math.PI * 2 + i, rr = j % 2 ? r * 0.28 : r; g.lineTo(p[0] + Math.cos(an) * rr, p[1] + Math.sin(an) * rr); }
                g.closePath(); g.fill(); g.restore();
            }
        }
        // the falling bars: fixed directions (none near the moon), falling slowly, fading in and out
        const MOON = [0.5, 0.2];
        const R2 = Motion.rng('ink-rain');
        for (let i = 0; i < 8; i++) {
            let a = (R2() * 2 - 1) * 1.1; const v = 0.008 + R2() * 0.008, ph = R2(), len = 0.03 + R2() * 0.035, col = R2() < 0.5 ? P.violet : P.purple, wdt = 9 + R2() * 7;
            if (Math.abs(a - MOON[0]) < 0.14) a += a < MOON[0] ? -0.16 : 0.16;
            if (Math.abs(a) < 0.3) a = a < 0 ? a - 0.3 : a + 0.3;                // not over the road and its palms
            const span2 = 0.5, u = ((T * v / span2 + ph) % 1 + 1) % 1, eTop = 0.62 - u * span2;
            const p0 = skyP(cam, a, eTop), p1 = skyP(cam, a, eTop - len); if (p0[2] < 1) continue;
            const fade = Math.min(1, u * 6, (1 - u) * 6);
            g.save(); g.globalAlpha = 0.9 * fade; g.fillStyle = tone(col, fx, 0.5);
            g.beginPath(); g.roundRect(p0[0] - wdt / 2, p0[1], wdt, Math.max(8, p1[1] - p0[1]), wdt / 2); g.fill(); g.restore();
        }
        // the moon: a crescent, inked on its lit edge
        const m = skyP(cam, MOON[0], MOON[1]);
        if (m[2] > 1 && m[1] < horizon - 40 && m[1] > 30) {
            const r = 24, cres = [];
            for (let i = 0; i <= 20; i++) { const an = Math.PI * 0.42 + (i / 20) * Math.PI * 1.16; cres.push([m[0] + Math.cos(an) * r, m[1] + Math.sin(an) * r]); }
            for (let i = 20; i >= 0; i--) { const an = Math.PI * 0.42 + (i / 20) * Math.PI * 1.16; cres.push([m[0] + 9 + Math.cos(an) * r * 0.86, m[1] - 4 + Math.sin(an) * r * 0.86]); }
            Ink.shape(g, cres, P.cream, { w: 2.6, seed: 'moon', d, jit: 0.4 });
        }
    }

    // --- the city: one drawn panorama, laid through the camera in exact strips ------------------
    const PAN = { z: 2600, x0: -4200, x1: 3000, y0: -4.5, y1: 300, pxm: 0.62 };
    let pano = null, panoCols = null;
    const LANDMARK = { x: 300, h: 240, w: 46 };
    function buildPano() {
        const W = Math.round((PAN.x1 - PAN.x0) * PAN.pxm), H = Math.round((PAN.y1 - PAN.y0) * PAN.pxm);
        const c = document.createElement('canvas'); c.width = W; c.height = H;
        const g = c.getContext('2d'), R = Motion.rng('ink-city');
        const X = (x) => (x - PAN.x0) * PAN.pxm, Y = (y) => H - (y - PAN.y0) * PAN.pxm;
        const towers = [];
        for (let i = 0; i < 80; i++) {
            const x = (R() * 2 - 1) * 2200 + 200, centre = Math.exp(-(((x - 250) / 700) ** 2));
            towers.push({ x, w: 22 + R() * 45, h: 30 + centre * (70 + R() * 140) + R() * 25, kind: Math.floor(R() * 4), r: R() });
        }
        towers.push({ ...LANDMARK, kind: 9, r: 0.5 });
        towers.sort((a, b) => a.h - b.h);
        const bodies = ['#260a8c', P.royal, P.violet, P.plum, '#3c0ca8', P.indigo];
        const wins = [P.orange, P.gold, P.salmon, P.cyan, P.pink];
        const tops = new Float32Array(W).fill(H);
        for (const t of towers) {
            const x0 = X(t.x - t.w / 2), x1 = X(t.x + t.w / 2), yb = Y(0), yt = Y(t.h), tw = x1 - x0;
            const body = t.kind === 9 ? P.purple : bodies[Math.floor(t.r * bodies.length)];
            let pts = [[x0, yb], [x0, yt], [x1, yt], [x1, yb]];
            if (t.kind === 1 || t.kind === 9) { const st = tw * 0.22; pts = [[x0, yb], [x0, yt], [x0 + st, yt], [x0 + st, yt - st], [x1 - st, yt - st], [x1 - st, yt], [x1, yt], [x1, yb]]; }
            if (t.kind === 2) pts = [[x0, yb], [x0, yt], [(x0 + x1) / 2, yt - tw * 0.55], [x1, yt], [x1, yb]];
            Ink.shape(g, pts, body, { w: 2.4, seed: Math.round(t.x * 7), jit: 0.4 });
            // the side the city's glow lights: a band of a brighter ink
            g.fillStyle = t.r < 0.5 ? P.magenta : P.blue; g.fillRect(x1 - tw * 0.24, yt + 2, tw * 0.2, yb - yt - 3);
            // windows as bars of light two floors tall, a few per row
            const fl = 7.2 * PAN.pxm, cols = Math.max(2, Math.round(t.w / 9)), cw = tw / cols, wc = wins[Math.floor(t.r * 997) % wins.length];
            for (let y = yt + fl * 0.6; y < yb - fl * 0.5; y += fl) for (let k = 0; k < cols; k++) {
                if (R() > 0.42) continue;
                g.fillStyle = R() < 0.8 ? wc : wins[Math.floor(R() * wins.length)];
                g.fillRect(x0 + k * cw + cw * 0.22, y, Math.max(1.5, cw * 0.5), Math.max(1.5, fl * 0.42));
            }
            if (t.kind === 1 || t.kind === 9 || t.r > 0.78) { g.strokeStyle = t.r < 0.4 ? P.cyan : P.pink; g.lineWidth = 2; g.beginPath(); g.moveTo(x0 + 2, yt + 2); g.lineTo(x1 - 2, yt + 2); g.stroke(); }
            for (let x = Math.max(0, Math.floor(x0)); x < Math.min(W, Math.ceil(x1)); x++) tops[x] = Math.min(tops[x], t.kind === 2 ? yt - tw * 0.3 : yt);
        }
        // the waterfront: low hotels in salmon and magenta with orange windows, palms between
        for (let x = -4000; x < 2800; x += 45 + R() * 55) {
            const w = 30 + R() * 40, h = 14 + R() * 24, x0 = X(x), x1 = X(x + w), yb = Y(0), yt = Y(h);
            Ink.shape(g, [[x0, yb], [x0, yt], [x1, yt], [x1, yb]], R() < 0.5 ? P.salmon : P.magenta, { w: 2, seed: Math.round(x), jit: 0.3 });
            for (let y = yt + 3; y < yb - 2; y += 4.5) for (let xx = x0 + 2; xx < x1 - 3; xx += 4.5) if (R() < 0.5) { g.fillStyle = R() < 0.7 ? P.orange : P.gold; g.fillRect(xx, y, 2.2, 2); }
            g.strokeStyle = R() < 0.5 ? P.cyan : P.pink; g.lineWidth = 1.6; g.beginPath(); g.moveTo(x0, yt + 1); g.lineTo(x1, yt + 1); g.stroke();
            for (let xx = Math.max(0, Math.floor(x0)); xx < Math.min(W, Math.ceil(x1)); xx++) tops[xx] = Math.min(tops[xx], yt);
        }
        Ink.brush(g, [[0, Y(0)], [W * 0.5, Y(0) + 0.5], [W, Y(0)]], { w: 2.5, seed: 'shore' });
        // per column of 6 px: the colour of the lights the bay will mirror and how tall they stand
        const im = g.getImageData(0, 0, W, Math.round(Y(0))).data, cw = 6;
        panoCols = [];
        for (let x = 0; x < W; x += cw) {
            let r = 0, gg = 0, b = 0, n = 0;
            for (let y = 0; y < Math.round(Y(0)) - 1; y += 2) for (let k = 0; k < cw && x + k < W; k += 2) {
                const i = (y * W + x + k) * 4; if (im[i + 3] < 10) continue;
                if (im[i] + im[i + 1] + im[i + 2] > 380) { r += im[i]; gg += im[i + 1]; b += im[i + 2]; n++; }
            }
            let top = H; for (let k = 0; k < cw && x + k < W; k++) top = Math.min(top, tops[x + k]);
            panoCols.push(n ? { col: [r / n, gg / n, b / n], lit: Math.min(1, n / 30), h: (Y(0) - top) / PAN.pxm } : null);
        }
        pano = c;
    }
    // world x of the panorama → its screen strip through the real projection
    function city(g, cam, T, d, fx, env) {
        if (!pano) buildPano();
        const N = 96, H = pano.height, sw = pano.width / N;
        for (let i = 0; i < N; i++) {
            const xa = PAN.x0 + (i * sw) / PAN.pxm, xb = PAN.x0 + ((i + 1) * sw) / PAN.pxm;
            const P00 = cam.p([xa, PAN.y1, PAN.z]), P10 = cam.p([xb, PAN.y1, PAN.z]), P01 = cam.p([xa, PAN.y0, PAN.z]);
            if (P00[2] < 10 || Math.max(P00[0], P10[0]) < -20 || Math.min(P00[0], P10[0]) > env.W + 20) continue;
            // breathing: the strip swells from the waterline on the kick, each on its own phase
            const b = 1 + (fx.breathe ?? 0) * (0.5 + 0.5 * Math.sin(i * 1.7 + T * 6.3));
            const cx = (P00[0] - P01[0]) * b, cy = (P00[1] - P01[1]) * b;
            g.save();
            g.transform((P10[0] - P00[0]) / sw, (P10[1] - P00[1]) / sw, -cx / H, -cy / H, P01[0] + cx, P01[1] + cy);
            g.drawImage(pano, i * sw, 0, sw + 1, H, 0, 0, sw + 1, H);
            g.restore();
        }
        // the landmark's crown, recoloured on every bar (the film's lights)
        const crown = Skyline.crownColour ? Skyline.crownColour(T, fx) : hex(P.pink);
        const st = LANDMARK.w * 0.22;
        const c0 = cam.p([LANDMARK.x - LANDMARK.w / 2 + st, LANDMARK.h + st, PAN.z]), c1 = cam.p([LANDMARK.x + LANDMARK.w / 2 - st, LANDMARK.h + st, PAN.z]);
        if (c0[2] > 10) { g.strokeStyle = css(crown); g.lineWidth = 3; g.beginPath(); g.moveTo(c0[0], c0[1]); g.lineTo(c1[0], c1[1]); g.stroke(); }
    }

    // --- the bay ------------------------------------------------------------------------------
    function bay(g, L, cam, T, d, fx, env, horizon) {
        const lv = level(cam), Wd = env.W * 1.6;
        g.save(); g.translate(lv.cx, lv.cy); g.rotate(lv.ang);
        g.fillStyle = '#18065e'; g.fillRect(-Wd, 0, Wd * 2, env.H * 2);
        for (const [f, col, seed] of [[0.28, P.deep, 55], [0.6, P.navy, 56]]) {
            const y2 = (env.H - lv.cy) * f;
            g.fillStyle = col; g.beginPath(); g.moveTo(-Wd, env.H * 2);
            for (let x = -Wd; x <= Wd; x += 24) g.lineTo(x, y2 + Ink.noise(seed, x / 420, 0) * 46 + Ink.noise(seed + 9, x / 90, 0) * 12 + Ink.noise(seed + 19, x / 25, 0) * 4);
            g.lineTo(Wd, env.H * 2); g.closePath(); g.fill();
            Ink.strokes(g, -Wd, y2 - 60, Wd * 2, 70, { ang: 0, count: 26, len: 140, w: 4, cols: [col], seed: seed * 7, d, alpha: 0.8 });
        }
        g.restore();
        if (!panoCols) return;
        // the city mirrored: under each lit column a broken stack of horizontal strokes, as long
        // as the column stands tall on screen, rows jittered per column, fading with depth
        const cw = 6;
        for (let i = 0; i < panoCols.length; i++) {
            const c = panoCols[i]; if (!c || c.lit < 0.04) continue;
            const xw = PAN.x0 + (i * cw + cw / 2) / PAN.pxm;
            const base = cam.p([xw, C.WATER, PAN.z]), top = cam.p([xw, C.WATER + c.h, PAN.z]);
            if (base[2] < 10 || base[0] < -40 || base[0] > env.W + 40) continue;
            const len = Math.min(env.H - horizon, (base[1] - top[1]) * 1.3 + 8), n = Math.round(2 + c.lit * 9);
            for (let k = 0; k < n; k++) {
                const u = (k + 0.3 + 0.6 * Ink.hsh(i, k, 0)) / n, yy = base[1] + 2 + u * len;
                const sway = Ink.noise(i * 7 + k, T * 0.8, 0) * 5;
                const l = (4 + 10 * u) * (0.5 + Ink.hsh(i + 3, k, 0));
                Ink.brush(g, [[base[0] - l / 2 + sway, yy], [base[0] + l / 2 + sway, yy + 0.5]], { w: 1.4 + 1.6 * u, col: css(c.col), seed: i * 31 + k, d, taper: 0.4, wob: 0.4, alpha: 0.9 * (1 - u * 0.6) });
            }
        }
        // the water nearer: loose strokes of the sky's colours on the swell, everywhere
        const R = Motion.rng('swell-ink');
        for (let i = 0; i < 170; i++) {
            const a = (R() * 2 - 1) * 1.2, dist = 25 + Math.pow(R(), 1.8) * 1600, ph = R(), col = [P.violet, P.purple, P.magenta, P.royal, P.salmon][i % 5];
            const p = cam.p([cam.pos[0] + Math.sin(a) * dist + Math.sin(T * 0.7 + ph * 6) * 2, C.WATER, cam.pos[2] + Math.cos(a) * dist]);
            if (p[2] < 3 || p[1] < horizon + 2 || p[1] > env.H + 10) continue;
            const l = Math.min(70, 9000 / dist + 4);
            Ink.brush(g, [[p[0] - l / 2, p[1]], [p[0] + l / 2, p[1] + 0.5]], { w: Math.min(4, 1 + 300 / dist), col, seed: 5000 + i, d, taper: 0.45, wob: 0.4, alpha: 0.75 });
        }
    }

    // --- under the deck, seen from beside it: reflections, then piers ---------------------------
    function underDeck(g, L, cam, T, d, fx) {
        const zc = cam.pos[2];
        if (cam.pos[0] < 8) return;
        const kN = Math.floor(((zc + 0.5) / C.V + C.T0 - Song.bar0) / Song.beat);
        // the lamps' reflections: stacks of gold strokes straight under each head
        for (let k = kN + 34; k >= kN; k--) {
            const zl = C.lampZ(k); if (zl < zc + 2) continue;
            for (const xh of [1.7, -6.5]) {
                const top = cam.p([xh, C.WATER, zl]), mir = cam.p([xh, 2 * C.WATER - (C.y(zl) + 10), zl]); if (top[2] < 2 || top[0] < -60 || top[0] > cam.W + 60) continue;
                const s = cam.f / top[2], len = Math.max(10, mir[1] - top[1]);
                for (let j = 0; j < 7; j++) {
                    const u = (j + 0.4 * Ink.hsh(k, j, 0) + 0.3) / 7, yy = top[1] + len * u * u, w = (0.6 + u * 1.6) * s * (0.5 + Ink.hsh(k, j + 9, 0));
                    Ink.brush(g, [[top[0] - w / 2, yy], [top[0] + w / 2, yy + 0.5]], { w: Math.max(1, 0.12 * s * (1 + u)), col: j % 2 ? P.orange : P.gold, seed: k * 17 + j, d, taper: 0.4, alpha: 0.85 * (1 - u * 0.6), light: true });
                }
            }
        }
        // the near tube mirrored: a broken pink line under the deck
        const tc = tone(P.pink, fx);
        for (let z = Math.floor((zc + 400) / 3) * 3; z >= zc + 3; z -= 3) {
            if (Ink.hsh(z, 1, 0) < 0.15) continue;
            const ht = C.y(z) + 1.08, a = cam.p([7.9, 2 * C.WATER - ht, z]), b = cam.p([7.9, 2 * C.WATER - ht, z + 4]); if (a[2] < 2) continue;
            const wob = Math.sin(z * 0.7 + T * 2.5) * 3;
            Ink.brush(g, [[a[0] + wob, a[1]], [b[0] + wob, b[1]]], { w: 2.4, col: tc, seed: 3000 + z, d, taper: 0.3, alpha: 0.75, light: true });
        }
        // the piers: their reflection first (darker, broken), then the pier itself
        for (let z = Math.floor((zc + 400) / 24) * 24; z >= zc - 24; z -= 24) {
            const a = cam.p([7.0, C.WATER, z]), b = cam.p([7.0, C.y(z) - 1.3, z]), r = cam.p([7.0, 2 * C.WATER - (C.y(z) - 1.3), z]); if (a[2] < 1) continue;
            const s = cam.f / a[2], hw = 0.8 * s;
            for (let j = 0; j < 12; j++) {
                const u = (j + 0.5) / 12, yy = a[1] + (r[1] - a[1]) * u, off = Math.sin(j * 2.1 + T * 2.2 + z) * (0.1 + u * 0.35) * s, ww = hw * (1.1 + 0.5 * Math.abs(Math.sin(j * 3.7 + z)));
                Ink.brush(g, [[a[0] - ww + off, yy], [a[0] + ww + off, yy + 0.5]], { w: cap(0.12 * s * (1 - u * 0.4), 1, 8), col: '#1a0450', seed: z * 3 + j, d, taper: 0.35, alpha: 0.9 });
            }
            Ink.shape(g, [[a[0] - hw, a[1]], [b[0] - hw, b[1]], [b[0] + hw, b[1]], [a[0] + hw, a[1]]], P.royal, { w: lw(s, 0.12), seed: z, d, jit: 0 });
            Ink.hatch(g, [b[0] + hw * 0.6, b[1] + 2], [a[0] + hw * 0.6, a[1] - 2], { count: 3, len: Math.min(30, 0.5 * s), w: lw(s, 0.06), col: P.pink, seed: z + 7, d, n: [-1, 0], ang: 1.2 });
        }
    }

    // --- the causeway --------------------------------------------------------------------------
    // The deck is painted in two pieces, the far one (beyond the crest) first with everything
    // standing on it, then the near one with its own standing things: the near deck covers what
    // the hump hides, from any camera, and (with Ink.occlude) the light of it too.
    // Returns { far, farItems, near, nearItems, last, zSplit }: the scene adds the car to the
    // list its z falls in, paints far(), the far items sorted, near(), the near items sorted,
    // then last() (the near parapet, when the camera stands beside the deck).
    function causeway(g, L, cam, T, d, fx) {
        const zc = cam.pos[2], zFar = Math.max(zc + 700, PAN.z - 680), zNear = zc + 0.4;
        const y = C.y;
        const outside = cam.pos[0] > 7.9;
        const zs = []; for (let z = zNear; z < zFar; z += Math.max(2, (z - zc) * 0.05)) zs.push(z); zs.push(zFar);
        let zSplit = zs[0], yMax = -1e9; for (const z of zs) if (y(z) > yMax + 1e-6) { yMax = y(z); zSplit = z; }
        if (zSplit <= zNear + 0.5) zSplit = zNear;                       // past the crest: one piece
        const kN = Math.floor(((zNear + 0.5) / C.V + C.T0 - Song.bar0) / Song.beat) - 1;

        function deck(zA, zB) {
            if (zB - zA < 0.2) return;
            const zr = zs.filter((z) => z > zA && z < zB); zr.unshift(zA); zr.push(zB);
            const edge = (x, dy = 0) => zr.map((z) => cam.p([x, y(z) + dy, z])).filter((p) => p[2] > 0.3).map((p) => [p[0], p[1]]);
            const strip = (xa, xb, dy = 0) => { const A = edge(xa, dy), B = edge(xb, dy); return A.length > 1 && B.length > 1 ? A.concat(B.reverse()) : null; };
            const inR = (z) => z >= zA && z <= zB;
            const carriage = [strip(-11.8, -4.4), strip(-0.4, 7.4)];
            // the slab's outer face (from beside), the asphalt, the median
            if (outside) { const A = edge(7.9, 0), B = edge(7.9, -1.3); if (A.length > 1) Ink.shape(g, A.concat(B.reverse()), P.royal, { w: 3, seed: 'slabR', d, jit: 0 }); }
            for (const q of carriage) if (q) Ink.shape(g, q, '#1a0670', { w: 0, seed: 'asph', d, jit: 0 });
            // on the asphalt (clipped to it): pools of lamp light, wet reflections, paint
            g.save(); g.beginPath(); for (const q of carriage) if (q) { q.forEach((p, i) => (i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]))); g.closePath(); } g.clip();
            for (let k = kN + 50; k >= kN; k--) {
                const zl = C.lampZ(k); if (zl + 6 < zA || zl - 6 > zB || zl > zc + 260 || zl < zNear - 6) continue;
                for (const xl of [1.7, -6.5]) for (const [rz, col] of [[1, P.indigo], [0.6, '#4a10c8']]) {
                    const pts = []; for (let i = 0; i < 64; i++) { const an = (i / 64) * Math.PI * 2, wob = 1 + 0.05 * Math.sin(i * 1.3 + k); pts.push([xl + Math.cos(an) * 3.4 * rz * wob, 0, outside ? zl + Math.sin(an) * 6 * rz * wob : Math.max(zc + 1.5, zl + Math.sin(an) * 6 * rz * wob)]); }
                    for (const q of pts) q[1] = y(q[2]) + 0.02;
                    const q = Neon.poly(cam, pts); if (q) Ink.shape(g, q, col, { w: 0, seed: k * 5 + rz * 10, d, jit: 0 });
                }
                if (zl - zc > 150) continue;
                for (const xh of [1.7, -6.5]) for (let j = 0; j < 6; j++) {
                    const zz = zl - 0.6 - j * 1.1; if (zz < zNear + 0.3 || zz < zA - 1 || zz > zB + 1) continue;
                    const p = cam.p([xh + (Ink.hsh(k, j, 0) - 0.5) * 0.4, y(zz) + 0.01, zz]); if (p[2] < 0.5) continue;
                    const s = cam.f / p[2], wdt = Math.min(90, (0.3 + j * 0.1) * s * (1 - j / 9));
                    Ink.brush(g, [[p[0] - wdt / 2, p[1]], [p[0] + wdt / 2, p[1] + 0.5]], { w: cap(0.06 * s * (1 - j / 9), 1, 6), col: [P.gold, P.orange, P.salmon][j % 3], seed: k * 13 + j, d, taper: 0.45, light: true });
                }
            }
            const paint = '#b8a2e8', gold = '#e8b04a';
            for (let zd = Math.floor(Math.min(zB, zc + 260) / 12) * 12; zd >= zA - 3; zd -= 12) {
                const z0 = Math.max(zd, zA, zNear), z1 = Math.min(zd + 3, zB); if (z1 <= z0) continue;
                for (const xx of [3.7, -8.1]) { const q = Neon.poly(cam, [[xx - 0.08, y(z0) + 0.01, z0], [xx + 0.08, y(z0) + 0.01, z0], [xx + 0.08, y(z1) + 0.01, z1], [xx - 0.08, y(z1) + 0.01, z1]]); if (q) Ink.shape(g, q, paint, { w: 0, seed: Math.round(zd * 3 + xx), d, jit: 0.6, light: true }); }
            }
            for (const [xx, col] of [[-0.6, gold], [7.1, paint], [-4.2, gold], [-11.5, paint]]) { const q = strip(xx - 0.06, xx + 0.06, 0.01); if (q) Ink.shape(g, q, col, { w: 0, seed: 'line' + xx, d, jit: 0, light: true }); }
            if (fx.onDeck) fx.onDeck(zA, zB, (c) => { c.beginPath(); for (const q of carriage) if (q) { q.forEach((p, i) => (i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]))); c.closePath(); } c.clip(); });
            g.restore();
            // the raised median, after what lies on the asphalt: its kerb faces, its top, the kerb lines
            for (const xx of [-4.4, -0.4]) { const A = edge(xx, 0), B = edge(xx, 0.18); if (A.length > 1 && B.length > 1) Ink.shape(g, A.concat(B.slice().reverse()), P.grape, { w: 0, seed: 'kf' + xx, d, jit: 0 }); }
            const med = strip(-4.4, -0.4, 0.18);
            if (med) { Ink.shape(g, med, P.plum, { w: 0, seed: 'median', d, jit: 0 });
                for (let zg = Math.ceil(Math.max(zA, zc + 1) / 2.6) * 2.6; zg < Math.min(zB, zc + 90); zg += 2.6) {
                    const xg = -4.0 + 3.2 * Ink.hsh(Math.round(zg * 10), 1, 0), pg = cam.p([xg, y(zg) + 0.19, zg]); if (pg[2] < 0.8) continue;
                    const sg = cam.f / pg[2], lg = cap(0.25 * sg, 3, 26);
                    Ink.brush(g, [[pg[0] - lg / 2, pg[1]], [pg[0] + lg / 2, pg[1] - lg * 0.08]], { w: cap(0.025 * sg, 0.8, 3), col: C.lampLight(zg) > 0.4 ? P.salmon : P.purple, seed: Math.round(zg * 13), d, taper: 0.5 });
                } for (const xx of [-4.4, -0.4]) { const E = edge(xx, 0.18); if (E.length > 1) Ink.brush(g, E, { w: 2.4, seed: 'kerb' + xx, d, taper: 0.02 }); } }
            // the parapets seen from the deck: their face, their cap, the tube seated on it
            for (const side of outside ? [-1] : [-1, 1]) parapet(side, edge, zA, zB);
        }

        function parapet(side, edge, zA, zB) {
            const right = side > 0, inner = right ? 7.4 : -11.8, outer = right ? 7.9 : -12.3, h = 1.05;
            const face = right ? P.purple : P.violet, capC = right ? P.magenta : '#9a3ae8';
            const neon = tone(right ? P.pink : P.cyan, fx);
            const seen = right ? cam.pos[0] < inner : cam.pos[0] > inner;
            const fx0 = seen ? inner : outer;
            const A = edge(fx0, right && outside ? -1.3 : 0), B = edge(fx0, h);
            if (A.length > 1 && B.length > 1) {
                Ink.shape(g, A.concat(B.slice().reverse()), right && outside ? P.violet : face, { w: 0, seed: 'par' + side, d, jit: 0 });
                if (right && outside) { const D0 = edge(fx0, 0); if (D0.length > 1) Ink.brush(g, D0, { w: 3, seed: 'deckline' + zA, d, taper: 0.02 }); }
                Ink.brush(g, A, { w: 3, seed: 'parA' + side + zA, d, taper: 0.03 });
                // light along the whole face: strokes every 5 m, warmer where a lamp stands
                for (let zh = Math.ceil(Math.max(zA, zc + 2) / 5) * 5; zh < Math.min(zB, zc + 160); zh += 5) {
                    const a = cam.p([fx0, y(zh) + 0.85, zh - 2.2]), b = cam.p([fx0, y(zh) + 0.85, zh + 2.2]); if (a[2] < 0.5 || b[2] < 0.5) continue;
                    const s = cam.f / a[2], lit = C.lampLight(zh);
                    if (s < 8) continue;
                    Ink.hatch(g, [a[0], a[1]], [b[0], b[1]], { count: 2 + Math.round(lit * 3), len: Math.min(50, 0.45 * s), w: cap(0.045 * s, 1, 4.5), col: lit > 0.4 ? (right ? P.salmon : P.pink) : (right ? P.pink : P.cyan), seed: Math.round(zh * 7) + side, d, n: [0, 1], ang: 0.2 });
                }
                for (let zj = Math.ceil(Math.max(zA, zc + 2) / 6) * 6; zj < Math.min(zB, zc + 120); zj += 6) {
                    const a = cam.p([fx0, y(zj) + 0.05, zj]), b = cam.p([fx0, y(zj) + h - 0.05, zj]); if (a[2] < 0.5) continue;
                    Ink.brush(g, [[a[0], a[1]], [b[0], b[1]]], { w: cap(0.03 * cam.f / a[2], 1, 3), seed: 'j' + zj + side, d, taper: 0.2, alpha: 0.6 });
                }
            }
            const T0 = edge(inner, h), T1 = edge(outer, h);
            if (T0.length > 1 && T1.length > 1) { Ink.shape(g, T0.concat(T1.slice().reverse()), capC, { w: 0, seed: 'cap' + side, d, jit: 0 }); Ink.brush(g, right === !outside ? T0 : T1, { w: 3, seed: 'capI' + side + zA, d, taper: 0.03 }); }
            // the tube: segment by segment, as wide as a 9 cm tube at its distance (1 px far away)
            const core = css(mix(neon.startsWith('#') ? hex(neon) : [255, 120, 220], [255, 255, 255], 0.4));
            const xt = (inner + outer) / 2, zt = [];
            for (const z of zs) if (z >= zA && z <= zB) zt.push(z);
            for (let i = 0; i + 1 < zt.length; i++) {
                const a = cam.p([xt, y(zt[i]) + h + 0.06, zt[i]]), b = cam.p([xt, y(zt[i + 1]) + h + 0.06, zt[i + 1]]); if (a[2] < 0.3 || b[2] < 0.3) continue;
                const wd = cap(0.09 * cam.f / a[2], 0.9, 6);
                for (const c of [g, L]) { c.save(); c.lineCap = 'round'; c.strokeStyle = neon; c.lineWidth = c === L ? wd * 1.4 : wd; c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke(); if (c === g && wd > 2) { c.strokeStyle = core; c.lineWidth = wd * 0.32; c.stroke(); } c.restore(); }
            }
        }

        // the standing things, into the far or the near list by where they stand
        const farItems = [], nearItems = [];
        const put = (z, draw) => (z >= zSplit ? farItems : nearItems).push({ z, draw });
        for (let k = kN + 60; k >= kN - 1; k--) {
            const zl = C.lampZ(k); if (zl < zc + 0.6 || zl > zFar) continue;
            put(zl, () => lamp(g, L, cam, zl, d, fx));
            const zp = zl + Song.beat * C.V * 0.38, xp = -2.4 + (k % 2 ? 0.9 : -0.9);
            if (zp < zFar && zp > zc + 1) put(zp, () => palm(g, L, cam, xp, zp, k, T, d, fx));
        }
        const Rs = Motion.rng('shrubs');
        for (let i = 0, zz = 0; zz < zc + 220; i++) {
            zz += 1.6 + Rs() * 1.8; const x = Rs() < 0.5 ? -3.5 + Rs() * 0.5 : -1.3 - Rs() * 0.5, sc = 0.8 + Rs() * 0.5, seed = i;
            if (zz < zNear + 0.6) continue;
            const z = zz; put(z, () => shrub(g, cam, x, z, sc, seed, d, fx));
        }
        for (const t of C.traffic(T)) if (t.z > zc + 2 && t.z < zFar) { const zz = t.z; (zz - 2.3 >= zSplit ? farItems : nearItems).push({ z: zz, draw: () => car(g, L, cam, t, d, fx) }); }
        if (fx.trip > 0) for (let zh = Math.ceil((zc + 4) / 22) * 22; zh < zc + 260; zh += 22) { const z = zh; put(z, () => hoop(g, L, cam, z, d, fx)); }
        const lastEdge = (x, dy = 0) => zs.map((z) => cam.p([x, y(z) + dy, z])).filter((p) => p[2] > 0.3).map((p) => [p[0], p[1]]);
        return {
            far: () => deck(zSplit, zFar), farItems, near: () => deck(zNear, zSplit), nearItems, zSplit,
            last: outside ? () => parapet(1, lastEdge, zNear, zFar) : null,
        };
    }

    function lamp(g, L, cam, z, d, fx) {
        const yb = C.y(z), base = cam.p([-2.4, yb + 0.2, z]), top = cam.p([-2.4, yb + 10.6, z]);
        if (top[2] < 0.5) return;
        const s = cam.f / top[2], sB = cam.f / Math.max(0.5, base[2]), lit = tone(P.violet, fx, 0.5);
        // a base plate, a mast 0.24 m thick at the foot and 0.14 at the top, its lit edge on its edge
        const bp = cam.p([-2.4, yb + 0.5, z]);
        Ink.shape(g, [[base[0] - 0.3 * sB, base[1]], [bp[0] - 0.22 * sB, bp[1]], [bp[0] + 0.22 * sB, bp[1]], [base[0] + 0.3 * sB, base[1]]], P.indigo, { w: lw(sB, 0.04), seed: Math.round(z * 11), d });
        const w0 = 0.12 * sB, w1 = 0.07 * s;
        Ink.shape(g, [[bp[0] - w0, bp[1]], [top[0] - w1, top[1]], [top[0] + w1, top[1]], [bp[0] + w0, bp[1]]], '#1a0450', { w: lw(s, 0.03), seed: Math.round(z * 13), d, jit: 0.3 });
        Ink.brush(g, [[bp[0] + w0 * 0.5, bp[1]], [top[0] + w1 * 0.5, top[1]]], { w: cap(Math.min(w0, w1) * 0.5, 1, 6), col: lit, seed: Math.round(z * 14), d, taper: 0.3 });
        for (const dir of [1, -1]) {
            const hx = -2.4 + dir * 4.1, mid = cam.p([-2.4 + dir * 1.6, yb + 10.8, z]), end = cam.p([hx, yb + 10.1, z]);
            if (end[2] < 0.5) continue;
            const aw = cap(0.09 * s, 1.4, 14);
            Ink.brush(g, [[top[0], top[1]], [mid[0], mid[1]], [end[0], end[1]]], { w: aw, col: P.ink, seed: Math.round(z * 17 + dir), d, taper: 0.1 });
            Ink.brush(g, [[top[0], top[1] - aw * 0.3], [mid[0], mid[1] - aw * 0.3], [end[0], end[1] - aw * 0.25]], { w: cap(aw * 0.35, 1, 5), col: lit, seed: Math.round(z * 19 + dir), d, taper: 0.3 });
            const hs = cam.f / end[2], hw = 0.45 * hs, hh = 0.14 * hs;
            const col = fx.lampCol ? css(fx.lampCol) : css(mix(P.gold, P.orange, 1 - Math.min(1, fx.lampPower ?? 1)));
            Ink.shape(g, [[end[0] - hw, end[1] - hh * 0.4], [end[0] + hw, end[1] - hh * 0.4], [end[0] + hw * 0.8, end[1] + hh], [end[0] - hw * 0.8, end[1] + hh]], col, { w: lw(hs, 0.05), seed: Math.round(z * 23 + dir), d, jit: 0.4 });
            Neon.last.glint(null, L, end[0], end[1] + hh * 0.3, Math.min(60, Math.max(3, 0.6 * hs)) * (fx.lampPower ?? 1), fx.lampCol ?? hex(P.orange), { lightOnly: true, alpha: 0.55, halo: fx.halo ?? 1, star: 0 });
            // the star, drawn: four tapered strokes of light round the head when the lamps swell
            const st = (fx.star ?? 0) * Math.min(1, hs / 25);
            if (st > 0.05) for (let r = 0; r < 4; r++) { const an = r * Math.PI / 2 + 0.3, len = st * Math.min(90, 1.2 * hs); Ink.brush(L, [[end[0], end[1] + hh * 0.3], [end[0] + Math.cos(an) * len, end[1] + hh * 0.3 + Math.sin(an) * len]], { w: cap(0.06 * hs, 1, 4), col: css(fx.lampCol ?? hex(P.gold)), seed: Math.round(z * 29 + r + dir * 7), d, taper: 0.9, light: true }); }
        }
    }

    function palm(g, L, cam, x, z, seed, T, d, fx) {
        const yb = C.y(z) + 0.18, R = Motion.rng('palm' + seed), H = 12 + R() * 3, lean = (R() - 0.5) * 0.6;
        const base = cam.p([x, yb, z]), top = cam.p([x + lean, yb + H, z]); if (top[2] < 0.6) return;
        const s = cam.f / top[2];
        // the trunk runs to the crown: purple, ringed, a cyan rim on the city side, the uplight's
        // salmon on the other (strokes only while they can be seen as strokes)
        const pts = []; for (let i = 0; i <= 9; i++) { const u = i / 9, p = cam.p([x + lean * u * u, yb + H * 0.9 * u, z]), w = (0.3 + 0.06 * Math.sin(u * 2.4) - 0.1 * u) * cam.f / p[2]; pts.push([p[0], p[1], w]); }
        const outline = pts.map((p) => [p[0] - p[2], p[1]]).concat(pts.slice().reverse().map((p) => [p[0] + p[2], p[1]]));
        Ink.shape(g, outline, P.purple, { w: s > 7 ? lw(s, 0.06) : 0, seed: seed * 7 + 1, d, jit: s > 7 ? 0.5 : 0 });
        if (s > 10) for (let i = 1; i < 9; i++) { const p = pts[i]; Ink.brush(g, [[p[0] - p[2] * 0.8, p[1]], [p[0] + p[2] * 0.8, p[1] + p[2] * 0.12]], { w: cap(0.03 * s, 0.8, 2.5), seed: seed * 13 + i, d, taper: 0.4, alpha: 0.7 }); }
        if (s > 5) Ink.brush(g, pts.slice(0, 10).map((p) => [p[0] - p[2] * 0.62, p[1]]), { w: cap(0.05 * s, 1, 4), col: tone(P.cyan, fx), seed: seed * 17, d, taper: 0.3 });
        if (s > 14) Ink.hatch(g, [pts[0][0] + pts[0][2] * 0.4, pts[0][1] - 4], [pts[6][0] + pts[6][2] * 0.4, pts[6][1]], { count: s > 40 ? 7 : 4, len: cap(0.3 * s, 3, 26), w: cap(0.045 * s, 1, 4), col: P.salmon, seed: seed * 3, d, n: [1, 0], ang: 1.2 });
        // the crownshaft: a smooth green-violet column from the trunk's top to the crown
        const c0 = cam.p([x + lean, yb + H * 0.9, z]), c1 = cam.p([x + lean, yb + H, z]), cwd = 0.23 * cam.f / c0[2];
        Ink.shape(g, [[c0[0] - cwd, c0[1]], [c1[0] - cwd * 0.8, c1[1]], [c1[0] + cwd * 0.8, c1[1]], [c0[0] + cwd, c0[1]]], '#2a5a7a', { w: s > 7 ? lw(s, 0.05) : 0, seed: seed * 9, d, jit: 0.4 });
        // fronds as leaf shapes springing from the crown, far ones first
        const n = 15, sway = Math.sin(T * 1.6 + seed) * 0.05, fr = [];
        for (let i = 0; i < n; i++) { const an = (i / n) * Math.PI * 2 + R() * 0.25; fr.push({ an, dx: Math.cos(an), dz: Math.sin(an), len: 3.4 + R() * 1.2, arch: 0.9 + R() * 0.6 }); }
        fr.sort((a, b) => b.dz - a.dz);
        const P0 = [x + lean, yb + H, z];
        for (const f of fr) {
            const pt = (u) => cam.p([P0[0] + f.dx * f.len * u, P0[1] + f.arch * Math.sin(u * Math.PI * 0.7) - u * u * (2.4 + sway * 10 * f.dx), P0[2] + f.dz * f.len * u * 0.9]);
            const rib = []; for (let j = 0; j <= 8; j++) rib.push(pt(j / 8));
            if (rib.some((p) => p[2] < 0.5)) continue;
            const width = (j) => (0.26 * Math.sin((j / 8) * Math.PI * 0.95 + 0.1)) * cam.f / rib[j][2];
            const up = rib.map((p, j) => [p[0], p[1] - width(j) * 0.35]), dn = rib.map((p, j) => [p[0] + f.dx * width(j) * 0.2, p[1] + width(j) * 0.8]);
            Ink.shape(g, up.concat(dn.reverse()), f.dz > 0 ? P.grape : P.plum, { w: s > 9 ? lw(s, 0.05) : 0, seed: seed * 101 + Math.round(f.an * 10), d, jit: s > 9 ? 0.5 : 0 });
            if (s > 12) for (let j = 2; j <= 8; j++) { const p = rib[j], ll = width(j) * 1.1; Ink.brush(g, [[p[0], p[1] + width(j) * 0.4], [p[0] + f.dx * ll * 0.3, p[1] + ll]], { w: cap(0.04 * s, 1, 3), seed: seed * 997 + Math.round(f.an * 10) * 13 + j, d, taper: 0.5, wob: 0.4 }); }
            if (s > 6) Ink.brush(g, rib.slice(1, 6).map((p, j) => [p[0], p[1] - width(j + 1) * 0.3]), { w: cap(0.04 * s, 1, 3.5), col: f.dx > 0 ? tone(P.pink, fx) : tone(P.cyan, fx), seed: seed * 31 + Math.round(f.an * 10), d, taper: 0.4 });
        }
    }

    // a clipped shrub: the upper envelope of three or four round lobes (one clean outline), a
    // violet ink, light strokes lying on its top
    function shrub(g, cam, x, z, sc, seed, d, fx) {
        const b = cam.p([x, C.y(z) + 0.18, z]); if (b[2] < 0.8) return;
        const s = cam.f / b[2], R = Motion.rng('shrub' + seed), lobes = 3 + Math.floor(R() * 2);
        const w = 0.62 * sc * s, L0 = [];
        for (let i = 0; i < lobes; i++) { const cx = -w + (2 * w * (i + 0.5)) / lobes, r = (w / lobes) * (1.25 + 0.25 * R()), lift = (0.35 + 0.45 * Math.sin(((i + 0.5) / lobes) * Math.PI)) * w * 0.9; L0.push([cx, r, lift]); }
        const top = (dx) => { let best = 0; for (const [cx, r, lift] of L0) { const u = (dx - cx) / r; if (Math.abs(u) < 1) best = Math.max(best, lift + Math.sqrt(1 - u * u) * r * 0.85); } return best; };
        // the sides bulge out in two lobes each, the base tucks in: a clump, not a box
        const pts = [[b[0] - w * 0.82, b[1]]];
        for (let i = 0; i <= 6; i++) { const t = i / 6, a = Math.PI * (0.5 + t * 0.5); pts.push([b[0] - w * 0.82 + Math.cos(a) * w * 0.25 * (1 + 0.3 * Math.sin(t * Math.PI * 2 + seed)), b[1] - top(-w) * t * 0.9 - Math.sin(a) * 2]); }
        for (let i = 0; i <= 24; i++) { const dx = -w + (2 * w * i) / 24; pts.push([b[0] + dx, b[1] - Math.max(2, top(dx))]); }
        for (let i = 0; i <= 6; i++) { const t = 1 - i / 6, a = Math.PI * (0.5 - t * 0.5); pts.push([b[0] + w * 0.82 + Math.cos(a) * w * 0.25 * (1 + 0.3 * Math.sin(t * Math.PI * 2 + seed * 3)), b[1] - top(w) * t * 0.9]); }
        pts.push([b[0] + w * 0.82, b[1]]);
        const body = seed % 2 ? '#4a10c8' : P.royal;
        Ink.shape(g, pts, body, { w: lw(s, 0.035), seed: 7000 + seed, d, jit: 0.4 });
        if (s > 14) {
            Ink.shape(g, [[b[0] - w * 0.8, b[1]], [b[0] - w * 0.7, b[1] - w * 0.25], [b[0] + w * 0.7, b[1] - w * 0.22], [b[0] + w * 0.8, b[1]]], '#1a0670', { w: 0, seed: 7200 + seed, d, jit: 0.5 });
            for (let i = 0; i < 5; i++) { const cx = b[0] + (Ink.hsh(seed, i, 0) - 0.5) * w * 1.3, cy = b[1] - top(cx - b[0]) * (0.45 + 0.3 * Ink.hsh(seed, i + 9, 0)), r = cap(0.07 * s, 2, 10); Ink.brush(g, [[cx - r, cy + r * 0.4], [cx, cy - r * 0.3], [cx + r, cy + r * 0.4]], { w: cap(0.02 * s, 0.8, 2), seed: 7300 + seed * 11 + i, d, taper: 0.4, alpha: 0.8 }); }
        }
        if (s > 18) for (let i = 0; i < 4; i++) {
            const dx = -w * 0.6 + (1.2 * w * (i + 0.5)) / 4, ty = b[1] - top(dx) + cap(0.05 * s, 2, 8), l = cap(0.14 * s, 3, 14);
            Ink.brush(g, [[b[0] + dx - l * 0.5, ty + l * 0.15], [b[0] + dx + l * 0.5, ty]], { w: cap(0.03 * s, 1, 3), col: seed % 3 ? tone(P.cyan, fx) : P.pink, seed: 7100 + seed * 7 + i, d, taper: 0.5 });
        }
    }

    // the traffic: a small car as two boxes through the camera (body and cabin), faces that
    // face the camera drawn far to near, lights on its tail or nose
    function car(g, L, cam, t, d, fx) {
        const yb = C.y(t.z), x = t.x, z = t.z, dir = t.dir;
        const pc = cam.p([x, yb + 0.6, z]); if (pc[2] < 2) return;
        const s = cam.f / pc[2];
        const boxes = [[x - 0.9, x + 0.9, yb + 0.25, yb + 0.95, z - 2.15, z + 2.15, dir > 0 ? P.violet : P.royal], [x - 0.75, x + 0.75, yb + 0.95, yb + 1.4, z - 1.0 * dir - 0.3, z + 1.0 * dir - 0.3, P.indigo]];
        for (const [x0, x1, y0, y1, za, zb, col] of boxes) {
            const z0 = Math.min(za, zb), z1 = Math.max(za, zb);
            const faces = [
                [[[x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]], [0, 1, 0], 1.0],
                [[[x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0]], [0, 0, -1], 0.75],
                [[[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]], [0, 0, 1], 0.75],
                [[[x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0]], [-1, 0, 0], 0.6],
                [[[x1, y0, z0], [x1, y0, z1], [x1, y1, z1], [x1, y1, z0]], [1, 0, 0], 0.6],
            ].filter(([pts, n]) => { const c = pts[0]; return (cam.pos[0] - c[0]) * n[0] + (cam.pos[1] - c[1]) * n[1] + (cam.pos[2] - c[2]) * n[2] > 0; });
            for (const [pts, , k] of faces) { const q = Neon.poly(cam, pts); if (q) Ink.shape(g, q, css(mix(col, '#04022e', 1 - k)), { w: lw(s, 0.04), seed: Math.round(z * 5 + k * 100 + y0 * 10), d, jit: 0.3 }); }
        }
        // lights on the face turned to us
        const zf = dir > 0 ? z - 2.16 : z + 2.16, seen = dir > 0 ? cam.pos[2] < zf : cam.pos[2] > zf;
        if (!seen) return;
        const col = dir > 0 ? P.red : P.cream;
        for (const dx of [-0.62, 0.62]) {
            const q = Neon.poly(cam, [[x + dx - 0.18, yb + 0.6, zf], [x + dx + 0.18, yb + 0.6, zf], [x + dx + 0.18, yb + 0.75, zf], [x + dx - 0.18, yb + 0.75, zf]]); if (!q) continue;
            Ink.shape(g, q, col, { w: lw(s, 0.02), seed: Math.round(z * 13 + dx * 7), d, light: true });
            const c = cam.p([x + dx, yb + 0.68, zf]);
            Neon.last.glint(null, L, c[0], c[1], Math.max(2, 0.35 * s) * (dir < 0 ? 1.5 : 1), hex(col), { lightOnly: true, alpha: 0.6, halo: fx.halo ?? 1 });
        }
    }

    // the trip's hoops: arcs of light standing over the road every 22 m, inside the parapets,
    // fixed in the world (the car drives through them); only the part above the deck exists
    function hoop(g, L, cam, z, d, fx) {
        const yb = C.y(z), cx = -2.2, cy = yb + 1.2, r = 8.6, pts = [];
        for (let i = 0; i <= 48; i++) { const a = Math.PI * (i / 48); pts.push(cam.p([cx + Math.cos(a) * r, cy + Math.sin(a) * r * 0.85, z])); }
        if (pts.some((p) => p[2] < 0.6)) return;
        const q = pts.map((p) => [p[0], p[1]]), col = tone(Math.round(z / 22) % 2 ? P.magenta : P.cyan, fx), s = cam.f / pts[0][2];
        const a = fx.trip * Math.min(1, (z - cam.pos[2] - 4) / 20) * Math.max(0, 1 - (z - cam.pos[2]) / 260);
        if (a <= 0.02) return;
        Ink.brush(g, q, { w: cap(0.16 * s, 1.5, 9), col, seed: 8000 + Math.round(z), d, alpha: a, taper: 0.08, light: true });
        L.save(); L.globalAlpha = a * 0.7; L.strokeStyle = col; L.lineWidth = cap(0.3 * s, 2, 14); L.lineCap = 'round'; L.beginPath(); q.forEach((p, i) => (i ? L.lineTo(p[0], p[1]) : L.moveTo(p[0], p[1]))); L.stroke(); L.restore();
    }

    return { sky, city, bay, causeway, underDeck };
})();
