// The sunrise section's world: Miami Beach at dawn, in the drawn manner of the film
// (styles/retro-neon/ink.js). Built in metres through Neon.camera:
//   x along the beach (north +), y up, z east (+ = out to sea); the waterline at z = 0, the sea
//   floor sinking 0.13 m per metre out, the sand flat up to Lummus Park (z −82), Ocean Drive
//   and the Art Deco hotels' fronts at z −110, facing the sun.
// The sun is the film's striped synthwave sun, fixed in the sky at azimuth 0 (due east) and
// rising with song time; everything is lit by it: what faces the camera from behind the sun
// becomes a silhouette with a gold rim, what the camera sees with the sun at its back is
// flooded gold. Neon belongs to the night: pale now, and it goes dark on the two «out»s.
// Global: SunriseSet.
const SunriseSet = (() => {
    const P = Ink.PAL, hex = Neon.hex, css = Neon.css, mix = Neon.mix;
    const cap = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
    const lw = (s, m = 0.05) => cap(m * s, 1.2, 6);
    const mx = (a, b, u) => css(mix(a, b, cap(u, 0, 1)));
    const H = Ink.hsh;
    const SUN_R = 0.105;                        // the sun's angular radius (a poster sun, not a real one)
    const OUT1 = 210.0, OUT2 = 226.12;          // «out» (the transcript: 210.04, 226.18; the tube dies on the vowel)
    const depthAt = (z) => (z > 0 ? 0.13 * z : 0);

    // dawn: 0 when the rim touches the sea (198.05), 1 at the last hit
    const dawn = (T) => cap((T - 198.05) / 48.4, 0, 1);
    // the sun's centre elevation: out of the sea on the drop, then climbing
    function sunE(T) {
        const a = Ease.out(Ease.seg(T, 198.05, 203.2)), b = Ease.inOut(Ease.seg(T, 203.2, 253.5));
        return -SUN_R + 0.004 + a * SUN_R * 0.95 + b * SUN_R * 1.75;
    }
    // a direction in the sky (azimuth from east toward +x, elevation) through the camera
    const skyP = (cam, a, e) => { const r = 30000; return cam.p([cam.pos[0] + Math.sin(a) * Math.cos(e) * r, cam.pos[1] + Math.sin(e) * r, cam.pos[2] + Math.cos(a) * Math.cos(e) * r]); };
    // how much the camera looks toward the sun (1) or away from it (0)
    const facing = (cam) => (1 + Math.cos(cam.yaw ?? 0)) / 2;
    // the horizon through the camera: its centre and slant (the camera may roll)
    function level(cam) { const y = cam.yaw ?? 0, a = skyP(cam, y - 0.4, 0), b = skyP(cam, y + 0.4, 0), c = skyP(cam, y, 0); return { ang: Math.atan2(b[1] - a[1], b[0] - a[0]), cx: c[0], cy: c[1] }; }
    const span = (cam, e) => { const y = cam.yaw ?? 0, p = skyP(cam, y, e), c = skyP(cam, y, 0); return Math.hypot(p[0] - c[0], p[1] - c[1]) * (p[1] < c[1] ? 1 : -1); };

    // --- neon: what is lit at song second T (flickers on twos as a tube dies, then dead glass)
    function neonOn(row, x, T) {
        const t0 = (row === 'A' ? OUT1 : OUT2) + cap((150 - x) / 300, 0, 1) * 0.35;
        if (T < t0) return 1;
        const k = Math.floor((T - t0) * 12 + 1e-6);
        return [0.35, 1, 0, 0.55, 0][Math.min(4, k)];
    }
    // after the first «out», the facades take the day: the sun floods what the neon lit
    const dayStep = (T) => Ease.out(Ease.seg(T, OUT1 + 0.1, OUT1 + 0.9)) * 0.35 + Ease.out(Ease.seg(T, OUT2 + 0.1, OUT2 + 0.9)) * 0.25;
    function tube(g, L, pts, col, w, on, T) {
        if (pts.length < 2) return;
        const path = (c) => { c.beginPath(); pts.forEach((p, i) => (i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]))); };
        g.save(); g.lineCap = 'round'; g.lineJoin = 'round';
        if (on <= 0.01) { path(g); g.strokeStyle = '#c9b2dc'; g.globalAlpha = 0.9; g.lineWidth = Math.max(1, w * 0.8); g.stroke(); g.strokeStyle = '#efe2f6'; g.lineWidth = Math.max(0.6, w * 0.25); g.stroke(); g.restore(); return; }
        const C = hex(col), pale = mix(C, [255, 236, 246], 0.18);
        path(g); g.strokeStyle = css(mix(pale, [201, 178, 220], 1 - on)); g.lineWidth = w; g.stroke();
        g.strokeStyle = css(mix(C, [255, 255, 255], 0.8)); g.lineWidth = w * 0.4; g.stroke(); g.restore();
        if (L) { L.save(); L.lineCap = 'round'; L.lineJoin = 'round'; path(L); L.globalAlpha = 0.95 * on; L.strokeStyle = css(C); L.lineWidth = w * 1.8; L.stroke(); L.globalAlpha = 0.25 * on; L.lineWidth = w * 5; L.stroke(); L.restore(); }
    }

    // --- the sky -------------------------------------------------------------------------
    const SKY_E = [1.2, 0.42, 0.22, 0.12, 0.06, 0.025];
    const EAST0 = ['#34107a', '#561894', '#86289e', '#bc389e', '#e8568e', '#f6806e'];
    const EAST1 = ['#3a1488', '#6a249e', '#a83c9e', '#e8628f', '#f78f78', '#ffb468'];
    const WEST0 = ['#24106a', '#3a1a86', '#6a2a9e', '#a848a6', '#e07aac', '#7a5aa8'];
    const WEST1 = ['#4a2490', '#7a3aa6', '#b05aae', '#e488b6', '#f8a8be', '#b090c0'];
    function sky(g, L, cam, T, d, env) {
        const u = dawn(T), fe = facing(cam), lv = level(cam), Wd = env.W * 2;
        const cols = SKY_E.map((_, i) => mx(mix(WEST0[i], WEST1[i], u), mix(EAST0[i], EAST1[i], u), fe));
        g.save(); g.translate(lv.cx, lv.cy); g.rotate(lv.ang);
        for (let i = 0; i < cols.length; i++) {
            const y0 = i === 0 ? -env.H * 3 : -span(cam, SKY_E[i]);
            g.fillStyle = cols[i]; g.beginPath(); g.moveTo(-Wd, 8); g.lineTo(-Wd, y0);
            for (let x = -Wd; x <= Wd; x += 30) g.lineTo(x, y0 + Ink.noise(1900 + i, x / 170, 0) * 7 + Ink.noise(1950 + i, x / 45, 0) * 2);
            g.lineTo(Wd, 8); g.closePath(); g.fill();
            if (i > 0) Ink.strokes(g, -Wd, y0 - 6, Wd * 2, Math.max(6, -y0 * 0.25 + 6), { ang: 0, count: 12, len: 260, w: 5, cols: [cols[i]], seed: 1300 + i, d, alpha: 0.6 });
        }
        g.restore();
        // the last stars, high in the west, going out as the light comes
        const sa = (1 - fe) * (1 - Ease.inOut(Ease.seg(T, 198, 210)));
        if (sa > 0.02) {
            const R = Motion.rng('sunrise-stars');
            for (let i = 0; i < 70; i++) {
                const a = Math.PI + (R() * 2 - 1) * 1.4, e = 0.12 + Math.pow(R(), 1.2) * 0.6, s0 = 1.4 + R() * 2.6;
                const p = skyP(cam, a, e); if (p[2] < 1 || p[0] < -10 || p[0] > env.W + 10 || p[1] < -10) continue;
                const sz = s0 * (0.6 + 0.5 * H(i, 7, d));
                g.save(); g.globalAlpha = sa; g.strokeStyle = i % 3 ? P.cream : P.cyan; g.lineWidth = Math.max(1, sz * 0.35); g.lineCap = 'round';
                g.beginPath(); g.moveTo(p[0] - sz, p[1]); g.lineTo(p[0] + sz, p[1]); g.moveTo(p[0], p[1] - sz); g.lineTo(p[0], p[1] + sz); g.stroke(); g.restore();
            }
        }
        // the glow round the sun: flat rings flattened along the horizon, clipped to the sky
        const e = sunE(T), sp = skyP(cam, 0, e), R0 = SUN_R * cam.f;
        if (sp[2] > 1) {
            g.save(); g.translate(lv.cx, lv.cy); g.rotate(lv.ang); g.beginPath(); g.rect(-Wd, -env.H * 3, Wd * 2, env.H * 3 + 2); g.restore(); g.save(); g.clip();
            const rings = [[6.2, mix('#d84a96', '#f07a92', u)], [4.2, mix('#f0607e', '#fb9a7c', u)], [2.8, mix('#f88a66', '#ffbc6a', u)], [1.75, mix('#ffb45e', '#ffd878', u)]];
            for (const [k, c] of rings) {
                const rx = k * R0 * 1.9, ry = k * R0 * 0.85, pts = [];
                for (let i = 0; i < 72; i++) { const an = (i / 72) * Math.PI * 2, n = 1 + 0.05 * Ink.noise(2100 + k * 10, i / 4, 0); pts.push([sp[0] + Math.cos(an) * rx * n, sp[1] + Math.sin(an) * ry * n]); }
                g.fillStyle = css(c); g.beginPath(); pts.forEach((p, i) => (i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]))); g.closePath(); g.fill();
                Ink.strokes(g, sp[0] - rx * 0.8, sp[1] - ry * 1.02, rx * 1.6, ry * 0.25, { ang: 0, count: 6, len: rx * 0.35, w: 4, cols: [css(c)], seed: 2200 + k * 10, d, alpha: 0.7 });
            }
            g.restore();
        }
        clouds(g, cam, T, d, env, u);
        sun(g, L, cam, T, d, env);
        birds(g, cam, T, d, env);
    }

    // the sun: stacked flat inks from gold to magenta, slits that slide down through its lower
    // half (the poster sun), a brushed rim and strokes of light; its glow on the light layer
    function sun(g, L, cam, T, d, env) {
        const e = sunE(T), c = skyP(cam, 0, e), r = SUN_R * cam.f;
        if (c[2] < 1 || c[0] < -r * 2 || c[0] > env.W + r * 2 || c[1] < -r * 2 || c[1] > env.H + r * 3) return;
        const lv = level(cam), kick = Song.env('kick', T);
        g.save(); g.translate(c[0], c[1]); g.rotate(lv.ang);
        // the disc with its slits cut out (even-odd): slits from 8 % below the centre, thicker lower
        const clip = new Path2D(); clip.arc(0, 0, r, 0, Math.PI * 2);
        const scroll = ((T * 0.35) % 1 + 1) % 1;
        for (let i = -1; i < 7; i++) {
            const v = (i + scroll) / 7, y = r * (0.08 + v * 0.92), th = r * (0.025 + v * 0.085);
            if (y - th / 2 > r || v < 0) continue;
            clip.rect(-r * 1.1, y - th / 2, r * 2.2, th);
        }
        g.save(); g.clip(clip, 'evenodd');
        const bands = [['#fff1b0', -1], ['#ffd25a', -0.62], ['#ffb347', -0.22], ['#f98a4a', 0.12], ['#f45a7f', 0.42], ['#e83aa6', 0.72]];
        for (let i = 0; i < bands.length; i++) {
            const y0 = r * bands[i][1], y1 = i + 1 < bands.length ? r * bands[i + 1][1] : r;
            g.fillStyle = bands[i][0]; g.beginPath(); g.moveTo(-r * 1.1, y0);
            for (let x = -r * 1.1; x <= r * 1.1; x += r / 10) g.lineTo(x, y0 + Ink.noise(2300 + i, x / (r * 0.4), 0) * r * 0.012);
            g.lineTo(r * 1.1, y1 + 1); g.lineTo(-r * 1.1, y1 + 1); g.closePath(); g.fill();
        }
        // strokes of light lying across the upper bands
        Ink.strokes(g, -r * 0.7, -r * 0.85, r * 1.2, r * 0.55, { ang: -0.05, count: 7, len: r * 0.5, w: Math.max(2, r * 0.03), cols: ['#fffbe0', '#ffe48a'], seed: 2401, d, alpha: 0.8 });
        Ink.strokes(g, -r * 0.8, -r * 0.1, r * 1.4, r * 0.5, { ang: 0.02, count: 5, len: r * 0.45, w: Math.max(2, r * 0.025), cols: ['#ffd25a', '#ff9ad0'], seed: 2402, d, alpha: 0.7 });
        g.restore();
        // the rim: a warm brushed line, broken where the slits cut it
        const rim = []; for (let i = 0; i <= 48; i++) { const an = -Math.PI * 1.02 + (i / 48) * Math.PI * 1.1; rim.push([Math.cos(an) * r, Math.sin(an) * r]); }
        Ink.brush(g, rim, { w: Math.max(2, r * 0.022), col: '#ff7a3a', seed: 2410, d, taper: 0.15, alpha: 0.9, light: true });
        g.restore();
        // the glow (light layer): the disc, then a halo that swells a little on the kick
        L.save(); L.translate(c[0], c[1]);
        const gr = L.createRadialGradient(0, 0, r * 0.2, 0, 0, r * (1.9 + kick * 0.25));
        gr.addColorStop(0, 'rgba(255,200,110,0.3)'); gr.addColorStop(0.5, 'rgba(255,150,90,0.2)'); gr.addColorStop(1, 'rgba(255,90,140,0)');
        L.fillStyle = gr; L.beginPath(); L.arc(0, 0, r * (1.9 + kick * 0.25), 0, Math.PI * 2); L.fill(); L.restore();
    }

    // long thin clouds over the sea, dark against the light with their undersides lit gold;
    // two cross the sun. Fixed directions, drifting north slowly.
    const CLOUDS = [[-0.32, 0.034, 0.34, 0.010], [0.06, 0.062, 0.26, 0.007], [0.4, 0.05, 0.3, 0.012], [-0.05, 0.13, 0.22, 0.006], [0.75, 0.09, 0.4, 0.014], [-0.8, 0.07, 0.36, 0.011], [2.8, 0.06, 0.5, 0.012], [-2.7, 0.1, 0.45, 0.01], [3.3, 0.04, 0.6, 0.012]];
    function clouds(g, cam, T, d, env, u) {
        for (let i = 0; i < CLOUDS.length; i++) {
            const [a0, e, len, th] = CLOUDS[i], a = a0 + (T - 198) * 0.0016, n = 18, top = [], bot = [];
            for (let j = 0; j <= n; j++) {
                const v = j / n, aa = a - len / 2 + v * len, bulge = Math.sin(v * Math.PI) ** 0.7;
                top.push(skyP(cam, aa, e + th * bulge * (0.7 + 0.3 * Ink.noise(2500 + i, v * 5, 0))));
                bot.push(skyP(cam, aa, e - th * 0.35 * bulge * (0.8 + 0.4 * Ink.noise(2550 + i, v * 6, 0))));
            }
            if (top.some((p) => p[2] < 1)) continue;
            const xs = top.map((p) => p[0]); if (Math.max(...xs) < -20 || Math.min(...xs) > env.W + 20) continue;
            const s = Math.abs(bot[n >> 1][1] - top[n >> 1][1]), near = Math.abs(a0) < 1.6;
            const body = near ? mx('#4a1474', '#8a3a8e', u * 0.7) : mx('#3a1a78', '#7a3a9a', u);
            const pts = top.map((p) => [p[0], p[1]]).concat(bot.slice().reverse().map((p) => [p[0], p[1]]));
            Ink.shape(g, pts, body, { w: s > 6 ? 2.2 : 0, seed: 2600 + i, d, jit: 0.4, light: true });
            // lit from below: gold and salmon strokes along the underside
            const lit = near ? 1 : 0.4;
            Ink.brush(g, bot.slice(2, n - 1).map((p) => [p[0], p[1] - 1.5]), { w: cap(s * 0.3, 1.5, 6), col: near ? '#ffc46a' : '#f68aa0', seed: 2700 + i, d, taper: 0.3, alpha: 0.9 * lit, light: true });
            Ink.hatch(g, [bot[3][0], bot[3][1]], [bot[n - 3][0], bot[n - 3][1]], { count: 6, len: cap(s * 0.9, 4, 30), w: cap(s * 0.12, 1, 3), col: near ? '#ffe08a' : '#ff9ac8', seed: 2750 + i, d, n: [0, -1], ang: 1.3, alpha: lit });
        }
    }

    // pelicans in a line, low over the sea, and a few gulls: ink strokes that flap on twos
    function birds(g, cam, T, d, env) {
        const flock = [];
        for (let i = 0; i < 6; i++) flock.push([-140 + (T - 198) * 9 + i * 5.5 - (i % 2) * 1.2, 7 + i * 0.35 + Math.sin(T * 0.6 + i) * 0.3, 70 + i * 3.2, 1.8, i * 0.9]);
        for (let i = 0; i < 4; i++) flock.push([60 - (T - 198) * 6 + i * 14, 14 + i * 3 + Math.sin(T * 0.9 + i * 2) * 0.8, 40 + i * 9, 1.0, i * 2.3 + 1]);
        for (const [x, y, z, span0, ph] of flock) {
            const p = cam.p([x, y, z]); if (p[2] < 2 || p[0] < -40 || p[0] > env.W + 40) continue;
            const s = cam.f / p[2], w = span0 * s * 0.5; if (w < 1.5) continue;
            const flap = Math.sin(Math.floor(T * 12) / 12 * (span0 > 1.5 ? 4 : 7) + ph);
            const tip = flap * w * 0.35, mid = -w * 0.12;
            const col = '#2a0a48';
            Ink.brush(g, [[p[0] - w, p[1] + tip], [p[0] - w * 0.45, p[1] + mid - Math.abs(flap) * w * 0.1], [p[0], p[1] + w * 0.08]], { w: cap(0.22 * s, 1.2, 5), col, seed: 2800 + Math.round(ph * 10), d, taper: 0.45 });
            Ink.brush(g, [[p[0], p[1] + w * 0.08], [p[0] + w * 0.45, p[1] + mid - Math.abs(flap) * w * 0.1], [p[0] + w, p[1] + tip]], { w: cap(0.22 * s, 1.2, 5), col, seed: 2850 + Math.round(ph * 10), d, taper: 0.45 });
        }
    }

    // --- the sea -------------------------------------------------------------------------
    // bands by distance (haze), swell strokes fixed on the water, the sun's glitter path as
    // world-fixed glints lit only where the sun's reflection reaches the camera
    const SEA_D = [4000, 1200, 380, 130, 45];
    function sea(g, L, cam, T, d, env) {
        const u = dawn(T), fe = facing(cam), lv = level(cam), Wd = env.W * 2, h = Math.max(0.3, cam.pos[1]);
        const E0 = ['#e86a8e', '#c84a98', '#a03a9c', '#7a2a9c', '#5a2298', '#46209a'], E1 = ['#fbab7c', '#f48a86', '#de6a92', '#b84a98', '#8e369c', '#6a2a9e'];
        const W0 = ['#8a3a9e', '#6a2a9a', '#4e2298', '#3a1c94', '#2e2092', '#262a96'], W1 = ['#b866a8', '#8e46a2', '#6a329e', '#4e269a', '#3a2a9a', '#2e3a9e'];
        const bands = E0.map((_, i) => mx(mix(W0[i], W1[i], u), mix(E0[i], E1[i], u), fe));
        g.save(); g.translate(lv.cx, lv.cy); g.rotate(lv.ang);
        // nothing of the water above the horizon (a bent stroke poked into the sky as a «^»)
        g.beginPath(); g.rect(-Wd, -0.5, Wd * 2, env.H * 3); g.clip();
        g.fillStyle = bands[0]; g.fillRect(-Wd, 0, Wd * 2, env.H * 3);
        for (let i = 0; i < SEA_D.length; i++) {
            const y = (cam.f * h) / SEA_D[i];
            if (y > env.H * 2) break;
            g.fillStyle = bands[i + 1]; g.beginPath(); g.moveTo(-Wd, env.H * 3);
            for (let x = -Wd; x <= Wd; x += 24) g.lineTo(x, y + Ink.noise(3000 + i, x / 300, 0) * Math.min(30, y * 0.12) + Ink.noise(3020 + i, x / 60, 0) * Math.min(6, y * 0.03));
            g.lineTo(Wd, env.H * 3); g.closePath(); g.fill();
            Ink.strokes(g, -Wd, y - Math.min(40, y * 0.2), Wd * 2, Math.min(60, y * 0.3) + 4, { ang: 0, count: 18, len: 160, w: Math.min(4, 1 + y * 0.02), cols: [bands[i + 1], bands[i]], seed: 3100 + i, d, alpha: 0.8 });
        }
        g.restore();
        // swell strokes: fixed on the water in rings of cells round the camera
        const R = Motion.rng('sunrise-swell'), cols = [P.violet, P.purple, P.magenta, P.royal, P.salmon, '#5a7ae8'];
        for (let i = 0; i < 420; i++) {
            const x = (R() - 0.5) * 700, z = 3 + Math.pow(R(), 2.2) * 900, ph = R();
            if (z < 1.5) continue;
            const p = cam.p([x + Math.sin(T * 0.6 + ph * 6) * 1.2, 0, z]);
            if (p[2] < 2 || p[0] < -80 || p[0] > env.W + 80 || p[1] > env.H + 10) continue;
            const s = cam.f / p[2], l = cap(3.5 * s, 3, 90);
            if (l < 16) { g.globalAlpha = 0.7; g.fillStyle = cols[i % cols.length]; g.fillRect(p[0] - l / 2, p[1] - 0.8, l, Math.max(1.2, cap(0.14 * s, 1, 4))); g.globalAlpha = 1; continue; }
            Ink.brush(g, [[p[0] - l / 2, p[1]], [p[0] + l / 2, p[1] + 0.5]], { w: cap(0.14 * s, 1, 4), col: cols[i % cols.length], seed: 3200 + i, d, taper: 0.45, wob: 0.4, alpha: 0.7 });
        }
        glitter(g, L, cam, T, d, env);
    }
    function glitter(g, L, cam, T, d, env) {
        const e = sunE(T); if (e < -SUN_R) return;
        const kick = Song.env('kick', T), amt = cap((e + SUN_R) / (SUN_R * 0.6), 0, 1);
        const spread = 0.05 + 0.04 * amt + 0.09 * dawn(T);
        const cols = ['#fff1b0', '#ffd25a', '#ffb347', '#f98a4a', '#ff8ad8'];
        for (let k = 0; k < 90; k++) {
            const z = 1.5 + 1.2 * (Math.pow(1.075, k) - 1);
            const dz = z - cam.pos[2]; if (dz < 2) continue;
            if (z > 5000) break;
            const dx = 0.6 + dz * 0.018, half = spread * dz, j0 = Math.ceil((cam.pos[0] - half) / dx), j1 = Math.floor((cam.pos[0] + half) / dx);
            for (let j = j0; j <= j1; j++) {
                const x = j * dx + (H(j, k, 1) - 0.5) * dx * 0.8, zz = z + (H(j, k, 2) - 0.5) * 1.2 * (1 + dz * 0.01);
                const off = Math.abs((x - cam.pos[0]) / (zz - cam.pos[2])) / spread; if (off > 1) continue;
                const p = cam.p([x, 0, zz]); if (p[2] < 2 || p[0] < -40 || p[0] > env.W + 40) continue;
                const s = cam.f / p[2], str = (1 - off) * (0.55 + 0.45 * H(j, k, 3));
                if (H(j, k, 4) > 0.35 + str * 0.6) continue;
                const l = cap((0.8 + 1.6 * str) * s * (0.7 + 0.5 * H(j, k, d)), 2, 160) * (0.8 + 0.3 * kick) * amt;
                if (l < 1.5) continue;
                const col = cols[Math.min(cols.length - 1, Math.floor((1 - str) * 3.5 + H(j, k, 5) * 1.5))], w = cap(0.12 * s * (0.6 + str), 1, 7);
                if (l < 18) { g.fillStyle = col; g.fillRect(p[0] - l / 2, p[1] - w / 2, l, w); }
                else Ink.brush(g, [[p[0] - l / 2, p[1]], [p[0] + l / 2, p[1] + 0.3]], { w, col, seed: 3300 + j * 7 + k * 131, d, taper: 0.4, wob: 0.4, light: true });
                if (str > 0.45) { L.globalAlpha = 0.35 * str * amt; L.fillStyle = col; L.fillRect(p[0] - l / 2, p[1] - w, l, w * 2); L.globalAlpha = 1; }
            }
        }
    }

    // --- waves: one breaks on every bar line, runs up the sand and slides back ------------
    const V_WAVE = 4.2;
    const runOf = (n) => (n === 107 ? 4.9 : 1.6 + 1.5 * H(n, 3, 0));
    function swashAt(n, T) {
        const tau = T - Song.B(n), run = runOf(n);
        if (tau < 0 || tau > 3.2) return null;
        const up = tau < 1.15 ? Math.sin((tau / 1.15) * Math.PI / 2) : 1 - Ease.inOut(Ease.seg(tau, 1.15, 3.2));
        return { run: run * up, back: tau > 1.15, tau, n };
    }
    // the sheet of a wave's swash and its foam edge, on the sand (z < 0)
    function swash(g, cam, T, d, env, xr) {
        const nNow = Math.floor((T - Song.bar0) / (Song.beat * 4));
        for (const n of [nNow - 1, nNow]) {
            const sw = swashAt(n, T); if (!sw || sw.run < 0.05) continue;
            const edge = [], base = [];
            for (let x = xr[0]; x <= xr[1]; x += (xr[1] - xr[0]) / 70) {
                const zr = -sw.run * (0.75 + 0.25 * Ink.noise(4000 + n, x / 6, 0)) - 0.2 * Ink.noise(4050 + n, x / 1.5, 0);
                edge.push([x, 0.015, zr]); base.push([x, 0.0, 0.8]);
            }
            const q = Neon.poly(cam, edge.concat(base.slice().reverse()));
            const u = dawn(T);
            if (q) Ink.shape(g, q, mx('#f0a0c0', '#ffc8b0', u), { w: 0, seed: 4100 + n, d, jit: 0, alpha: sw.back ? 0.75 : 0.9, light: true });
            // the foam: a lacy brushed edge and broken strokes behind it
            const E = edge.map((p) => cam.p(p)).filter((p) => p[2] > 0.4);
            for (let i = 0; i + 1 < E.length; i += 2) {
                const a = E[i], b = E[Math.min(E.length - 1, i + 2)];
                if (H(i, n, 9) < 0.18) continue;
                const s = cam.f / a[2];
                Ink.brush(g, [[a[0], a[1]], [b[0], b[1]]], { w: cap(0.05 * s, 1, 7) * (sw.back ? 0.6 : 1), col: '#fff3f8', seed: 4200 + n * 97 + i, d, taper: 0.3, wob: 0.6, light: true });
            }
            for (let i = 0; i < 40; i++) {
                const x = xr[0] + (xr[1] - xr[0]) * H(i, n, 11), z = -sw.run * (0.25 + 0.65 * H(i, n, 12));
                const p = cam.p([x, 0.02, z]); if (p[2] < 0.5) continue;
                const s = cam.f / p[2], l = cap(0.35 * s, 2, 60);
                Ink.brush(g, [[p[0] - l / 2, p[1]], [p[0] + l / 2, p[1]]], { w: cap(0.03 * s, 1, 4), col: i % 3 ? '#ffe6f6' : '#a8e8f0', seed: 4300 + n * 41 + i, d, taper: 0.45, alpha: 0.85, light: true });
            }
        }
    }
    // the crests on their way in, far ones first; breaking into foam over the last metres
    function crests(g, cam, T, d, env, xr) {
        const nNow = Math.floor((T - Song.bar0) / (Song.beat * 4));
        for (let n = nNow + 8; n > nNow; n--) {
            const z = V_WAVE * (Song.B(n) - T); if (z < 0.2 || z > 34) continue;
            const brk = cap(1 - z / 6, 0, 1), pts = [], face = [];
            for (let x = xr[0]; x <= xr[1]; x += (xr[1] - xr[0]) / 60) {
                const zz = z + 1.4 * Ink.noise(4400 + n, x / 25, 0);
                pts.push(cam.p([x, 0.18 + 0.12 * (1 - brk), zz])); face.push([x, 0, zz + 1.2]);
            }
            const fq = Neon.poly(cam, face.map((p, i) => [p[0], 0.18, p[2] - 1.2]).concat(face.slice().reverse()));
            if (fq) Ink.shape(g, fq, mx('#2a1a8e', '#3a3aa8', dawn(T)), { w: 0, seed: 4500 + n, d, jit: 0, alpha: 0.8 });
            for (let i = 0; i + 1 < pts.length; i++) {
                const a = pts[i], b = pts[i + 1]; if (a[2] < 0.5 || b[2] < 0.5) continue;
                if (H(i, n, 13) < 0.3 - brk * 0.25) continue;
                const s = cam.f / a[2];
                Ink.brush(g, [[a[0], a[1]], [b[0], b[1]]], { w: cap((0.07 + 0.12 * brk) * s, 1, 9), col: H(i, n, 14) < 0.25 ? '#ffc8e0' : '#fff3f8', seed: 4600 + n * 61 + i, d, taper: 0.25, wob: 0.8, light: true });
            }
        }
    }

    // --- the ground: the sand, wet near the water, footprints, then the park and the road --
    function ground(g, L, cam, T, d, env, o) {
        const u = dawn(T), fe = facing(cam), xr = o.xr ?? [cam.pos[0] - 400, cam.pos[0] + 400];
        const quad = (x0, x1, z0, z1, y, col, seed, w = 0) => { const q = Neon.poly(cam, [[x0, y, z0], [x1, y, z0], [x1, y, z1], [x0, y, z1]]); if (q) Ink.shape(g, q, col, { w, seed, d, jit: 0 }); };
        if (cam.pos[2] > -112) {
            quad(-900, 900, -150, -110, 0, '#3a1670', 'road');
            quad(-900, 900, -110, -101, 0.05, mx('#7a3a9a', '#c07aa8', 1 - fe), 'walk');
            quad(-900, 900, -101, -82, 0.06, mx('#1f6a78', '#2a3a6a', fe), 'lawn');
        }
        const sand = mx(mix('#f69a86', '#ffc08e', u), mix('#b8508a', '#d8708a', u), fe);
        quad(-900, 900, -82, -5.5, 0, sand, 'sand');
        // the wet band: darker, glossy, carrying the sky and the sun's reflection
        quad(-900, 900, -5.5, 0.6, 0, mx(mix('#a04a8e', '#c86a96', u), mix('#6a2a8a', '#8a3a94', u), fe), 'wet');
        quad(-900, 900, -5.5, -4.8, 0.002, mx('#c86a96', '#e08aa0', u), 'wetline');
        // texture: little ripple strokes and shell bits fixed on the sand near the camera
        const cx = cam.pos[0], cz = cam.pos[2];
        for (let i = Math.floor((cx - 44) / 2.5); i <= Math.ceil((cx + 44) / 2.5); i++) for (let j = -33; j < 0; j++) {
            const c0 = cam.p([i * 2.5 + 1.25, 0, j * 2.5 + 1.25]); if (c0[2] < 0.4 || c0[2] > 55 || c0[0] < -120 || c0[0] > env.W + 120 || c0[1] > env.H + 60) continue;
            const s0 = cam.f / c0[2], nk = s0 < 12 ? 0 : s0 < 30 ? 1 : 3;
            for (let k = 0; k < nk; k++) {
                const x = i * 2.5 + H(i, j, 30 + k) * 2.5, z = j * 2.5 + H(i, j, 40 + k) * 2.5, kk = H(i, j, 50 + k);
                const p = cam.p([x, 0.01, z]); if (p[2] < 0.4 || p[0] < -30 || p[0] > env.W + 30 || p[1] > env.H + 20) continue;
                const s = cam.f / p[2], l = cap((0.22 + H(i, j, 60 + k) * 0.35) * s, 2, 70);
                const col = z > -5.5 ? (kk < 0.5 ? '#ffb0c8' : '#f8d07a') : kk < 0.35 ? mx('#ffe0b0', '#f08aa8', fe) : kk < 0.7 ? mx('#e07a8a', '#8a2a8a', fe) : mx('#fff1d0', '#ffc46a', fe);
                Ink.brush(g, [[p[0] - l / 2, p[1] + l * 0.03], [p[0], p[1] - l * 0.04], [p[0] + l / 2, p[1] + l * 0.02]], { w: cap(0.03 * s, 1, 5), col, seed: 4700 + i * 131 + j * 7 + k, d, taper: 0.45, alpha: 0.8 });
            }
        }
        // the sun in the wet sand: a broken column of gold under it
        if (fe > 0.4 && sunE(T) > -SUN_R * 0.95) {
            for (let k = 0; k < 16; k++) {
                const z = -5.2 + k * 0.35; if (z - cz < 1) continue;
                const xx = cx + (z - cz) * 0.0 + (H(k, 1, 0) - 0.5) * 0.3 * (z - cz) * 0.04;
                const p = cam.p([xx, 0.01, z]); if (p[2] < 0.6) continue;
                const s = cam.f / p[2], l = cap((0.4 + 0.5 * H(k, 2, d)) * s * 0.4, 2, 120);
                Ink.brush(g, [[p[0] - l / 2, p[1]], [p[0] + l / 2, p[1]]], { w: cap(0.05 * s, 1, 6), col: k % 3 ? '#ffd25a' : '#fff1b0', seed: 4800 + k, d, taper: 0.4, alpha: 0.8, light: true });
            }
        }
        // their footprints, from where they watched the sun to the water
        for (const fp of o.prints ?? []) {
            const p = cam.p([fp[0], 0.01, fp[1]]); if (p[2] < 0.6 || p[2] > 40) continue;
            const s = cam.f / p[2];
            const q = []; for (let i = 0; i < 14; i++) { const an = (i / 14) * Math.PI * 2; q.push([fp[0] + Math.cos(an) * 0.055, 0.01, fp[1] + Math.sin(an) * 0.13]); }
            const qq = Neon.poly(cam, q); if (qq) Ink.shape(g, qq, mx('#c0607e', '#5a1a72', fe), { w: 0, seed: 4900, d, jit: 0 });
            if (s > 30) { const a = cam.p([fp[0] - 0.05, 0.01, fp[1] + 0.1]), b = cam.p([fp[0] + 0.05, 0.01, fp[1] + 0.1]); Ink.brush(g, [[a[0], a[1]], [b[0], b[1]]], { w: cap(0.02 * s, 1, 3), col: fe > 0.5 ? '#ffc46a' : '#fff1d0', seed: 4901, d, taper: 0.4, alpha: 0.8 }); }
        }
        swash(g, cam, T, d, env, xr);
        crests(g, cam, T, d, env, xr);
    }

    // --- boxes: the visible faces of an axis-aligned box, lit by the low sun in the east ---
    // col: { front (+z), back, side, top }; returns nothing; o: { w (ink), seed }
    function box(g, cam, x0, x1, y0, y1, z0, z1, col, d, o = {}) {
        const faces = [
            [[[x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]], [0, 1, 0], col.top ?? col.front],
            [[[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]], [0, 0, 1], col.front],
            [[[x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0]], [0, 0, -1], col.back ?? col.side],
            [[[x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0]], [-1, 0, 0], col.side],
            [[[x1, y0, z0], [x1, y0, z1], [x1, y1, z1], [x1, y1, z0]], [1, 0, 0], col.side],
            [[[x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1]], [0, -1, 0], col.under ?? col.side],
        ];
        const pc = cam.p([(x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2]); if (pc[2] < 0.3) return;
        const s = cam.f / pc[2], w = o.w ?? lw(s * Math.max(x1 - x0, y1 - y0, z1 - z0), 0.025);
        for (const [pts, n, c] of faces) {
            const q0 = pts[0]; if ((cam.pos[0] - q0[0]) * n[0] + (cam.pos[1] - q0[1]) * n[1] + (cam.pos[2] - q0[2]) * n[2] <= 0) continue;
            const q = Neon.poly(cam, pts); if (q) Ink.shape(g, q, c, { w, seed: (o.seed ?? 1) * 7 + n[0] * 3 + n[1] * 5 + n[2] * 11, d, jit: 0.3 });
        }
    }
    // a flat quad on a plane of constant z (a facade), as screen points
    const fq = (cam, x0, y0, x1, y1, z) => Neon.poly(cam, [[x0, y0, z], [x1, y0, z], [x1, y1, z], [x0, y1, z]]);

    // --- the hotels of Ocean Drive -------------------------------------------------------
    const ZF = -110;
    const FACADES = ['#ffb08a', '#7fe0c0', '#c49af0', '#ffe0c8', '#ff9ad0', '#8ed7f2', '#ffd27a', '#f6b7a0'];
    const TUBES = [P.magenta, P.cyan, '#ff8ad8', P.aqua, P.orange, P.magenta, P.cyan, '#ffd25a'];
    let HOTELS = null;
    function hotels() {
        if (HOTELS) return HOTELS;
        const R = Motion.rng('sunrise-hotels'); HOTELS = [];
        for (let x = -620, i = 0; x < 620; i++) {
            const w = 26 + R() * 18, floors = 3 + Math.floor(R() * 4), kind = Math.floor(R() * 3);
            HOTELS.push({ i, x0: x, x1: x + w, h: floors * 3.4 + 1.8, floors, kind, col: FACADES[Math.floor(R() * FACADES.length)], tube: TUBES[i % TUBES.length], tower: 4 + R() * 7, tw: 5 + R() * 4, r: R() });
            x += w + 1.5 + R() * 3;
        }
        return HOTELS;
    }
    function hotel(g, L, cam, ht, T, d, env, o) {
        const { x0, x1, h, floors, kind } = ht, fe = facing(cam), day = dayStep(T);
        const pc = cam.p([(x0 + x1) / 2, h / 2, ZF]); if (pc[2] < 1) return;
        const a = cam.p([x0, 0, ZF]), b = cam.p([x1, h + ht.tower + 6, ZF]);
        if (Math.max(a[0], b[0]) < -40 || Math.min(a[0], b[0]) > env.W + 40) return;
        const s = cam.f / pc[2], lit = cap(1 - fe * 1.4, 0, 1);
        const base = mix(ht.col, '#ffe6c0', 0.12 + day * 0.4 * lit);
        const front = css(mix(mix(base, '#3a1a6a', 0.62), base, lit)), side = css(mix(mix(base, '#3a1a6a', 0.55), '#3a1a6a', 0.35)), top = css(mix(base, '#ffffff', 0.15));
        const shade = css(mix(base, '#4a1a7a', 0.6));
        const zb = ZF - 18, xm = (x0 + x1) / 2, tw = ht.tw;
        box(g, cam, x0, x1, 0, h, zb, ZF, { front, side, top }, d, { seed: ht.i * 31 + 1 });
        const far = s < 2.5;
        // windows: dark glass, a third of them blazing with the sunrise they face
        if (!far) for (let f = 0; f < floors; f++) {
            const y0 = 3.4 * f + 1.2, y1 = y0 + 1.6;
            for (let xw = x0 + 1.6; xw < x1 - 2.6; xw += 3.1) {
                if (kind !== 2 && Math.abs(xw + 0.8 - xm) < tw / 2 + 0.6) continue;
                const q = fq(cam, xw, y0, xw + 1.6, y1, ZF + 0.01); if (!q) continue;
                const hh = H(ht.i * 100 + f, Math.round(xw), 21), blaze = hh < 0.35 * lit + 0.05;
                const glass = blaze ? (hh < 0.12 ? '#ffd25a' : '#f98a4a') : mx('#3a1470', '#2a0a50', fe);
                Ink.shape(g, q, glass, { w: s < 9 ? 0 : lw(s * 1.6, 0.04), seed: ht.i * 997 + f * 37 + Math.round(xw), d, jit: s < 9 ? 0 : 0.2 });
                if (!blaze && s > 6) Ink.brush(g, [[q[0][0] + (q[1][0] - q[0][0]) * 0.2, q[2][1] + (q[0][1] - q[2][1]) * 0.25], [q[0][0] + (q[1][0] - q[0][0]) * 0.55, q[2][1] + (q[0][1] - q[2][1]) * 0.75]], { w: cap(0.12 * s, 1, 3), col: '#f68aa0', seed: ht.i * 13 + f * 7 + Math.round(xw), d, taper: 0.4, alpha: 0.8 });
            }
        }
        // eyebrows: thin slabs over every floor's windows, their undersides in shade, sun on top
        if (kind !== 1) for (let f = 1; f <= floors; f++) {
            const y = 3.4 * f - 0.2 + (f === floors ? -0.6 : 0);
            const segs = kind === 2 ? [[x0, x1]] : [[x0, xm - tw / 2], [xm + tw / 2, x1]];
            for (const [a0, a1] of segs) {
                box(g, cam, a0 - 0.3, a1 + 0.3, y - 0.18, y, ZF, ZF + 0.9, { front: top, side: shade, top, under: shade }, d, { seed: ht.i * 53 + f, w: lw(s, 0.06) });
                if (!far && lit > 0.2) { const p0 = cam.p([a0, y, ZF + 0.9]), p1 = cam.p([a1, y, ZF + 0.9]); Ink.hatch(g, [p0[0], p0[1]], [p1[0], p1[1]], { count: Math.round(cap((p1[0] - p0[0]) / 40, 2, 9)), len: cap(0.6 * s, 3, 22), w: cap(0.08 * s, 1, 3), col: '#fff1b0', seed: ht.i * 71 + f, d, n: [0, -1], ang: 0.5, alpha: lit }); }
            }
        }
        // the central tower (kinds 0 and 1): stepped, with a finial
        let towerTop = h;
        if (kind !== 2) {
            towerTop = h + ht.tower;
            box(g, cam, xm - tw / 2, xm + tw / 2, 0, towerTop, ZF - 2, ZF + 1.2, { front, side, top }, d, { seed: ht.i * 37 + 3 });
            box(g, cam, xm - tw * 0.32, xm + tw * 0.32, towerTop, towerTop + 2.2, ZF - 1.5, ZF + 0.8, { front, side, top }, d, { seed: ht.i * 37 + 4 });
            box(g, cam, xm - 0.18, xm + 0.18, towerTop + 2.2, towerTop + 6, ZF - 0.5, ZF - 0.1, { front: shade, side: shade, top }, d, { seed: ht.i * 37 + 5 });
            // vertical fins down the tower's face
            if (!far) for (const xf of [-tw * 0.25, 0, tw * 0.25]) box(g, cam, xm + xf - 0.15, xm + xf + 0.15, 3.6, towerTop - 1.5, ZF + 1.2, ZF + 1.6, { front: top, side: shade, top }, d, { seed: ht.i * 41 + Math.round(xf * 10), w: lw(s, 0.04) });
            if (!far && lit > 0.2) { const p0 = cam.p([xm - tw / 2, towerTop, ZF + 1.2]), p1 = cam.p([xm - tw / 2, 4, ZF + 1.2]); Ink.hatch(g, [p0[0], p0[1]], [p1[0], p1[1]], { count: 5, len: cap(0.8 * s, 3, 24), w: cap(0.08 * s, 1, 3), col: '#ffe08a', seed: ht.i * 73, d, n: [1, 0], ang: 0.4, alpha: lit }); }
        }
        // the ground floor: a shaded porch with an awning
        box(g, cam, x0 + 0.5, x1 - 0.5, 2.6, 2.9, ZF, ZF + 2.2, { front: css(mix(ht.tube, '#3a1a6a', 0.3)), side: shade, top: css(mix(ht.tube, '#ffffff', 0.2)), under: shade }, d, { seed: ht.i * 43, w: lw(s, 0.05) });
        const tw2 = cap(0.3 * s, 1.5, 9);
        // row A: the tubes along the parapet and under the first eyebrow
        const onA = neonOn('A', x0, T);
        const rowA = (y, za) => { const pts = []; for (let k = 0; k <= 8; k++) { const p = cam.p([x0 + 0.6 + ((x1 - x0 - 1.2) * k) / 8, y, za]); if (p[2] > 0.5) pts.push([p[0], p[1]]); } return pts; };
        tube(g, L, rowA(h - 0.5, ZF + 0.05), ht.tube, tw2, onA, T);
        if (kind !== 1) tube(g, L, rowA(3.4 - 0.45, ZF + 0.92), ht.r < 0.5 ? P.cyan : '#ff8ad8', tw2, onA, T);
        if (kind !== 2 && !far) for (const sx of [-1, 1]) { const a = cam.p([xm + sx * (tw / 2 - 0.25), 3.2, ZF + 1.25]), b = cam.p([xm + sx * (tw / 2 - 0.25), towerTop - 0.4, ZF + 1.25]); tube(g, L, [[a[0], a[1]], [b[0], b[1]]], ht.tube, tw2, onA, T); }
        // row B: the tower's sign (a panel of shapes in tube) and the crown's outline
        if (kind !== 2) {
            const onB = neonOn('B', x0, T), col = ht.r < 0.33 ? P.magenta : ht.r < 0.66 ? P.cyan : '#ff8ad8';
            const crown = [[xm - tw * 0.32, towerTop], [xm - tw * 0.32, towerTop + 2.2], [xm + tw * 0.32, towerTop + 2.2], [xm + tw * 0.32, towerTop]].map(([x, y]) => cam.p([x, y, ZF + 0.85])).map((p) => [p[0], p[1]]);
            tube(g, L, crown, col, tw2, onB, T);
            if (!far) {
                const ph = Math.min(towerTop - 7, 9), py0 = towerTop - 1.2 - ph, z = ZF + 1.65, pw = tw * 0.36;
                const panel = fq(cam, xm - pw, py0, xm + pw, py0 + ph, z);
                if (panel) Ink.shape(g, panel, '#2a0a50', { w: lw(s, 0.06), seed: ht.i * 59, d, jit: 0.2 });
                const n = Math.max(3, Math.floor(ph / 1.6));
                for (let k = 0; k < n; k++) {
                    const cy = py0 + ph - 0.8 - k * (ph - 0.8) / n, r = Math.min(pw * 0.6, 0.55), shape = [];
                    const kind2 = (ht.i + k) % 3;
                    for (let j = 0; j <= 16; j++) {
                        const an = (j / 16) * Math.PI * 2, rr = kind2 === 1 ? r / Math.max(Math.abs(Math.cos(an)) + Math.abs(Math.sin(an)), 0.01) : kind2 === 2 && j % 2 ? r * 0.45 : r;
                        shape.push(cam.p([xm + Math.cos(an) * rr, cy + Math.sin(an) * rr, z + 0.02]));
                    }
                    tube(g, L, shape.map((p) => [p[0], p[1]]), k % 2 ? col : P.gold, cap(0.08 * s, 1, 4), onB, T);
                }
                const border = [[xm - pw + 0.2, py0 + 0.2], [xm - pw + 0.2, py0 + ph - 0.2], [xm + pw - 0.2, py0 + ph - 0.2], [xm + pw - 0.2, py0 + 0.2], [xm - pw + 0.2, py0 + 0.2]].map(([x, y]) => cam.p([x, y, z + 0.02])).map((p) => [p[0], p[1]]);
                tube(g, L, border, col, cap(0.08 * s, 1, 4), onB, T);
            }
        }
    }

    // --- palms: trunks and fronds; front-lit they take the sun, backlit they are silhouettes --
    function palm(g, cam, x, z, seed, T, d, fe) {
        const R = Motion.rng('sunrise-palm' + seed), Hh = 9 + R() * 5, lean = (R() - 0.5) * 1.6, yb = 0.05;
        const base = cam.p([x, yb, z]), top = cam.p([x + lean, yb + Hh, z]); if (top[2] < 0.6 || base[2] < 0.6) return;
        if (Math.max(base[0], top[0]) < -200 || Math.min(base[0], top[0]) > cam.W + 200) return;
        const s = cam.f / top[2], sil = fe;
        const trunk = mx('#d8708a', '#2a0a44', sil), frondA = mx('#1f7a7a', '#1c0636', sil), frondB = mx('#2a5a8a', '#2a0a48', sil);
        const lightC = sil > 0.5 ? '#ffc46a' : '#fff1b0';
        const pts = []; for (let i = 0; i <= 9; i++) { const u = i / 9, p = cam.p([x + lean * u * u, yb + Hh * 0.92 * u, z]), w = (0.22 + 0.05 * Math.sin(u * 2.4) - 0.07 * u) * cam.f / p[2]; pts.push([p[0], p[1], w]); }
        const outline = pts.map((p) => [p[0] - p[2], p[1]]).concat(pts.slice().reverse().map((p) => [p[0] + p[2], p[1]]));
        Ink.shape(g, outline, trunk, { w: s > 5 ? lw(s, 0.06) : 0, seed: seed * 7 + 1, d, jit: s > 7 ? 0.5 : 0 });
        if (s > 10) for (let i = 1; i < 9; i++) { const p = pts[i]; Ink.brush(g, [[p[0] - p[2] * 0.8, p[1]], [p[0] + p[2] * 0.8, p[1] + p[2] * 0.12]], { w: cap(0.03 * s, 0.8, 2.5), seed: seed * 13 + i, d, taper: 0.4, alpha: 0.7 }); }
        if (s > 6) Ink.brush(g, pts.map((p) => [p[0] + p[2] * (sil > 0.5 ? 0.7 : 0.2), p[1]]), { w: cap(0.05 * s, 1, 4), col: lightC, seed: seed * 17, d, taper: 0.3, light: true });
        const n = 14, sway = Math.sin(T * 1.4 + seed) * 0.06, fr = [];
        for (let i = 0; i < n; i++) { const an = (i / n) * Math.PI * 2 + R() * 0.3; fr.push({ an, dx: Math.cos(an), dz: Math.sin(an), len: 3 + R() * 1.3, arch: 0.8 + R() * 0.6 }); }
        fr.sort((a, b) => (b.dz - a.dz) * (cam.pos[2] > z ? -1 : 1));
        const P0 = [x + lean, yb + Hh, z];
        for (const f of fr) {
            const pt = (u) => cam.p([P0[0] + f.dx * f.len * u, P0[1] + f.arch * Math.sin(u * Math.PI * 0.7) - u * u * (2.3 + sway * 10 * f.dx), P0[2] + f.dz * f.len * u * 0.9]);
            const rib = []; for (let j = 0; j <= 8; j++) rib.push(pt(j / 8));
            if (rib.some((p) => p[2] < 0.5)) continue;
            const width = (j) => (0.26 * Math.sin((j / 8) * Math.PI * 0.95 + 0.1)) * cam.f / rib[j][2];
            const up = rib.map((p, j) => [p[0], p[1] - width(j) * 0.35]), dn = rib.map((p, j) => [p[0] + f.dx * width(j) * 0.2, p[1] + width(j) * 0.8]);
            Ink.shape(g, up.concat(dn.reverse()), f.dz > 0 ? frondA : frondB, { w: s > 8 ? lw(s, 0.05) : 0, seed: seed * 101 + Math.round(f.an * 10), d, jit: s > 9 ? 0.5 : 0 });
            if (s > 12) for (let j = 2; j <= 8; j++) { const p = rib[j], ll = width(j) * 1.1; Ink.brush(g, [[p[0], p[1] + width(j) * 0.4], [p[0] + f.dx * ll * 0.3, p[1] + ll]], { w: cap(0.04 * s, 1, 3), seed: seed * 997 + Math.round(f.an * 10) * 13 + j, d, taper: 0.5, wob: 0.4 }); }
            if (s > 5) Ink.brush(g, rib.slice(1, 6).map((p, j) => [p[0], p[1] - width(j + 1) * 0.3]), { w: cap(0.04 * s, 1, 3.5), col: sil > 0.5 ? (f.dx > 0 ? '#ffc46a' : '#f68aa0') : (f.dx > 0 ? '#fff1b0' : '#7dffc8'), seed: seed * 31 + Math.round(f.an * 10), d, taper: 0.4, light: true });
        }
    }

    // --- the lifeguard huts: pastel cabins on stilts with a ramp to the sand ---------------
    const HUTS = [
        { x: -13, z: -21, body: '#ff9ad0', trim: '#7fe0c0', roof: 'pyramid', stripe: '#ffd27a' },
        { x: 46, z: -23, body: '#ffd27a', trim: '#e106d3', roof: 'barrel', stripe: '#ff8ad8' },
        { x: -88, z: -22, body: '#8ed7f2', trim: '#ff8ad8', roof: 'slant', stripe: '#ffffff' },
        { x: 112, z: -22, body: '#7fe0c0', trim: '#f45a7f', roof: 'pyramid', stripe: '#ffd27a' },
        { x: -170, z: -24, body: '#c49af0', trim: '#ffd27a', roof: 'barrel', stripe: '#7fe0c0' },
    ];
    function hut(g, L, cam, H0, T, d, fe) {
        const { x, z } = H0, c = cam.p([x, 3, z]); if (c[2] < 1) return;
        const s = cam.f / c[2]; if (c[0] < -6 * s - 50 || c[0] > cam.W + 6 * s + 50) return;
        const sh = (col, k) => css(mix(col, '#2a0a50', k));
        const litF = 1 - fe, body = H0.body;
        // a face toward the sun (+z) is lit, the others shaded; backlit, all go toward the night
        const C = { front: sh(body, 0.15 + fe * 0.55), side: sh(body, 0.35 + fe * 0.3), back: sh(body, 0.55 + fe * 0.15), top: sh(body, 0.1 + fe * 0.4), under: sh(body, 0.7) };
        const T2 = { front: sh(H0.trim, 0.1 + fe * 0.5), side: sh(H0.trim, 0.3 + fe * 0.3), back: sh(H0.trim, 0.5), top: sh(H0.trim, 0.1 + fe * 0.4), under: sh(H0.trim, 0.65) };
        const legs = [[-1.4, -1.4], [1.4, -1.4], [-1.4, 1.4], [1.4, 1.4]].sort((a, b) => Math.hypot(x + b[0] - cam.pos[0], z + b[1] - cam.pos[2]) - Math.hypot(x + a[0] - cam.pos[0], z + a[1] - cam.pos[2]));
        // the ramp down to the sand on the landward side, drawn before what stands in front of it
        const ramp = Neon.poly(cam, [[x - 0.6, 1.9, z - 1.7], [x + 0.6, 1.9, z - 1.7], [x + 0.6, 0.02, z - 6.2], [x - 0.6, 0.02, z - 6.2]]);
        const camBehind = cam.pos[2] < z;
        const drawRamp = () => { if (ramp) Ink.shape(g, ramp, T2.top, { w: lw(s, 0.035), seed: Math.round(x * 7) + 9, d, jit: 0.3 }); };
        if (!camBehind) drawRamp();
        for (const [lx, lz] of legs) box(g, cam, x + lx - 0.1, x + lx + 0.1, 0, 1.9, z + lz - 0.1, z + lz + 0.1, T2, d, { seed: Math.round(x * 3 + lx * 5 + lz * 7) });
        box(g, cam, x - 1.75, x + 1.75, 1.75, 1.95, z - 1.75, z + 1.75, T2, d, { seed: Math.round(x * 11) });
        box(g, cam, x - 1.25, x + 1.25, 1.95, 4.1, z - 1.1, z + 1.1, C, d, { seed: Math.round(x * 13) });
        // the window to the sea and a stripe round the cabin
        const wq = fq(cam, x - 0.9, 2.9, x + 0.9, 3.7, z + 1.11);
        if (wq && cam.pos[2] > z + 1.1) Ink.shape(g, wq, fe > 0.5 ? '#2a0a50' : '#3a1470', { w: lw(s, 0.04), seed: Math.round(x * 17), d, jit: 0.2 });
        const st = fq(cam, x - 1.25, 2.35, x + 1.25, 2.6, z + 1.11);
        if (st && cam.pos[2] > z + 1.1) Ink.shape(g, st, sh(H0.stripe, fe * 0.5), { w: 0, seed: Math.round(x * 19), d, jit: 0 });
        const sb = fq(cam, x - 1.25, 2.35, x + 1.25, 2.6, z - 1.11);
        if (sb && cam.pos[2] < z - 1.1) Ink.shape(g, sb, sh(H0.stripe, 0.4 + fe * 0.3), { w: 0, seed: Math.round(x * 19) + 1, d, jit: 0 });
        // the roof
        if (H0.roof === 'pyramid') {
            const apex = [x, 5.3, z], cs = [[x - 1.55, 4.1, z - 1.4], [x + 1.55, 4.1, z - 1.4], [x + 1.55, 4.1, z + 1.4], [x - 1.55, 4.1, z + 1.4]];
            const fcs = [[0, 1, [0, 0, -1]], [1, 2, [1, 0, 0]], [3, 0, [-1, 0, 0]], [2, 3, [0, 0, 1]]];
            for (const [i, j, n] of fcs) {
                const mid = [(cs[i][0] + cs[j][0] + apex[0]) / 3, 4.5, (cs[i][2] + cs[j][2] + apex[2]) / 3];
                if ((cam.pos[0] - mid[0]) * n[0] + (cam.pos[2] - mid[2]) * n[2] + (cam.pos[1] - mid[1]) * 0.6 <= 0) continue;
                const q = Neon.poly(cam, [cs[i], cs[j], apex]); if (q) Ink.shape(g, q, n[2] > 0 ? T2.front : n[2] < 0 ? T2.back : T2.side, { w: lw(s, 0.035), seed: Math.round(x * 23) + i, d, jit: 0.3 });
            }
        } else if (H0.roof === 'barrel') {
            const pts = []; for (let i = 0; i <= 12; i++) { const an = Math.PI * (i / 12); pts.push([x - Math.cos(an) * 1.5, 4.1 + Math.sin(an) * 0.9]); }
            const zf = cam.pos[2] > z ? z + 1.35 : z - 1.35, zb2 = cam.pos[2] > z ? z - 1.35 : z + 1.35;
            const top0 = pts.map(([px, py]) => cam.p([px, py, zb2])).map((p) => [p[0], p[1]]), top1 = pts.map(([px, py]) => cam.p([px, py, zf])).map((p) => [p[0], p[1]]);
            Ink.shape(g, top0.concat(top1.slice().reverse()), T2.top, { w: lw(s, 0.035), seed: Math.round(x * 29), d, jit: 0.3 });
            Ink.shape(g, top1, cam.pos[2] > z ? T2.front : T2.back, { w: lw(s, 0.035), seed: Math.round(x * 31), d, jit: 0.3 });
        } else {
            box(g, cam, x - 1.5, x + 1.5, 4.1, 4.35, z - 1.4, z + 1.6, T2, d, { seed: Math.round(x * 37) });
        }
        // the flag on its pole
        const p0 = cam.p([x + 1.5, 4.1, z + 1.2]), p1 = cam.p([x + 1.5, 6.4, z + 1.2]);
        Ink.brush(g, [[p0[0], p0[1]], [p1[0], p1[1]]], { w: cap(0.05 * s, 1, 3), seed: Math.round(x * 41), d, taper: 0.1 });
        const fl = []; for (let i = 0; i <= 6; i++) { const u = i / 6; fl.push(cam.p([x + 1.5 + u * 1.0 * Math.cos(0.4), 6.35 - 0.15 * u + 0.08 * Math.sin(T * 6 + u * 4) * u, z + 1.2 + u * 0.4])); }
        const fl2 = fl.map((p, i) => cam.p([x + 1.5 + (i / 6) * 1.0 * Math.cos(0.4), 5.85 - 0.1 * (i / 6) + 0.08 * Math.sin(T * 6 + (i / 6) * 4) * (i / 6), z + 1.2 + (i / 6) * 0.4]));
        Ink.shape(g, fl.map((p) => [p[0], p[1]]).concat(fl2.reverse().map((p) => [p[0], p[1]])), sh('#ff3050', fe * 0.4), { w: lw(s, 0.03), seed: Math.round(x * 43), d, jit: 0.3 });
        if (camBehind) drawRamp();
        // the sun on its sea-facing edges (front-lit) or a gold rim on its silhouette (backlit)
        const e0 = cam.p([x - 1.25, 4.1, z + 1.1]), e1 = cam.p([x + 1.25, 4.1, z + 1.1]);
        if (s > 6) Ink.hatch(g, [e0[0], e0[1]], [e1[0], e1[1]], { count: 4, len: cap(0.35 * s, 3, 18), w: cap(0.05 * s, 1, 3), col: fe > 0.5 ? '#ffc46a' : '#fff1b0', seed: Math.round(x * 47), d, n: [0, 1], ang: 0.4 });
    }

    // sea oats on the dune line and in clumps: thin blades with seed heads, swaying
    function grass(g, cam, x, z, sc, seed, T, d, fe) {
        const b = cam.p([x, 0, z]); if (b[2] < 1.2) return;
        const s = cam.f / b[2]; if (b[0] < -s * 1.5 || b[0] > cam.W + s * 1.5) return;
        if (s * sc < 3) return;
        const n = s * sc < 25 ? 6 : 13, dark = mx('#8a3a7a', '#24083e', fe), mid = mx('#2a6a7a', '#3a0f58', fe), light = fe > 0.5 ? '#ffc46a' : '#ffe08a';
        for (let i = 0; i < n; i++) {
            const leaf = i % 3 !== 0, hgt = sc * (leaf ? 0.35 + 0.35 * H(seed, i, 1) : 0.7 + 0.5 * H(seed, i, 1));
            const side = H(seed, i, 2) - 0.5, lean = side * (leaf ? 1.6 : 0.4) + Math.sin(T * 1.7 + seed + i * 0.7) * 0.05, dx = side * 0.25 * sc;
            const pts = []; for (let j = 0; j <= 5; j++) { const u = j / 5; pts.push(cam.p([x + dx + lean * u * u * hgt, hgt * (u - (leaf ? 0.35 * u * u * Math.abs(side) * 2 : 0)), z + (H(seed, i, 4) - 0.5) * 0.4 * sc])); }
            if (pts.some((p) => p[2] < 0.4)) continue;
            Ink.brush(g, pts.map((p) => [p[0], p[1]]), { w: cap((leaf ? 0.03 : 0.014) * s, 1, 12), col: leaf && i % 2 ? mid : dark, seed: seed * 17 + i, d, taper: 0.6 });
            if (leaf && s > 25) Ink.brush(g, pts.slice(1, 4).map((p) => [p[0], p[1] - 1]), { w: cap(0.008 * s, 1, 3), col: light, seed: seed * 29 + i, d, taper: 0.5, alpha: 0.8, light: true });
            if (!leaf) {
                const t = pts[5], l = cap(0.16 * s * sc, 3, 60);
                for (let k = 0; k < 4; k++) { const a = -Math.PI / 2 + lean * 0.8 + (k - 1.5) * 0.35, gx = t[0] + Math.cos(a) * l * (0.3 + k * 0.12), gy = t[1] + l * 0.1 * k; Ink.brush(g, [[t[0], t[1] + l * 0.15 * k], [gx, gy + l * 0.25]], { w: cap(0.025 * s, 1.5, 9), col: dark, seed: seed * 19 + i * 5 + k, d, taper: 0.6 }); if (k < 2) Ink.brush(g, [[t[0], t[1] + l * 0.15 * k - 1], [gx, gy + l * 0.25 - 1]], { w: cap(0.008 * s, 1, 3), col: light, seed: seed * 23 + i * 5 + k, d, taper: 0.6, light: true }); }
            }
        }
    }

    // the shoes they left at the water: her gold stiletto sandals (one standing, one fallen on
    // its side) and his violet penny loafers, each a side profile in metres; `drift` carries the
    // fallen heel seaward in the backwash, `wet` (0..1) is the swash running round them
    function shoes(g, cam, T, d, at, drift, wet = 0) {
        const [sx, sz] = at, ink = P.ink;
        // a profile (u along the shoe, v up) placed at (x, z) turned by ang; lying: on its side
        const place = (x, z, ang, lying) => (u, v) => { const ca = Math.cos(ang), sa = Math.sin(ang); return lying ? cam.p([x + u * ca - v * sa, 0.012 + 0.0 * v, z + u * sa + v * ca]) : cam.p([x + u * ca, v, z + u * sa]); };
        const shp = (W, pts, col, seed, wInk) => { const q = pts.map(([u, v]) => W(u, v)); if (q.some((p) => p[2] < 0.3)) return null; const s = cam.f / q[0][2]; Ink.shape(g, q.map((p) => [p[0], p[1]]), col, { w: wInk ?? cap(0.006 * s, 1.2, 5), seed, d, jit: 0.25 }); return s; };
        const line = (W, pts, col, w, seed, taper = 0.15) => { const q = pts.map(([u, v]) => W(u, v)); if (q.some((p) => p[2] < 0.3)) return; Ink.brush(g, q.map((p) => [p[0], p[1]]), { w, col, seed, d, taper }); };
        const gold = '#ffc04a', goldD = '#e8782a', goldL = '#fff1b0';
        const SOLE = [[0, 0.004], [0.012, 0.0], [0.07, 0.0], [0.1, 0.008], [0.15, 0.038], [0.2, 0.07], [0.238, 0.077], [0.24, 0.09], [0.2, 0.086], [0.15, 0.054], [0.1, 0.022], [0.07, 0.013], [0.01, 0.014]];
        const STIL = [[0.211, 0.074], [0.237, 0.077], [0.229, 0.0], [0.224, 0.0]];
        function heel(W, seed) {
            const s = shp(W, SOLE, gold, seed); if (!s) return;
            shp(W, STIL, goldD, seed + 1);
            const w = cap(0.011 * s, 1.5, 9);
            // the toe strap (a band over the toes), the heel's cup and the ankle strap with its buckle
            line(W, [[0.012, 0.014], [0.035, 0.05], [0.062, 0.056], [0.09, 0.024]], ink, w * 1.5, seed + 2);
            line(W, [[0.012, 0.014], [0.035, 0.05], [0.062, 0.056], [0.09, 0.024]], gold, w, seed + 3);
            line(W, [[0.2, 0.088], [0.215, 0.14], [0.235, 0.145], [0.24, 0.09]], ink, w * 1.4, seed + 4);
            line(W, [[0.2, 0.088], [0.215, 0.14], [0.235, 0.145], [0.24, 0.09]], gold, w * 0.8, seed + 5);
            line(W, [[0.215, 0.135], [0.17, 0.155], [0.15, 0.14], [0.19, 0.125], [0.215, 0.135]], gold, w * 0.6, seed + 6);
            const bk = W(0.165, 0.147); g.fillStyle = goldL; g.beginPath(); g.arc(bk[0], bk[1], Math.max(1.5, 0.005 * s), 0, Math.PI * 2); g.fill();
            line(W, [[0.03, 0.006], [0.09, 0.012], [0.15, 0.044], [0.205, 0.075]], goldL, cap(0.003 * s, 1, 3), seed + 7, 0.5);
        }
        heel(place(sx + 0.06, sz, 0.3, false), 9101);
        heel(place(sx - 0.18 + drift * 0.12, sz + 0.14 + drift, 2.5 + drift * 0.7, true), 9111);
        // his loafers: sole, heel block, the upper with its collar, the lining, the moc seam, the strap
        const UP = [[0.0, 0.014], [0.0, 0.03], [0.02, 0.046], [0.06, 0.058], [0.12, 0.064], [0.16, 0.062], [0.2, 0.056], [0.245, 0.058], [0.28, 0.068], [0.286, 0.02], [0.28, 0.012]];
        const SO = [[0.0, 0.016], [0.004, 0.003], [0.03, 0.0], [0.255, 0.0], [0.286, 0.002], [0.287, 0.016], [0.03, 0.015]];
        for (const [lx, lz, ang, sd] of [[-0.62, -0.2, 0.25, 9121], [-0.48, 0.02, -0.12, 9131]]) {
            const W = place(sx + lx, sz + lz, ang, false);
            const s = shp(W, UP, '#5a2ad8', sd); if (!s) continue;
            shp(W, SO, '#2a0a60', sd + 1);
            shp(W, [[0.225, 0.0], [0.287, 0.002], [0.287, 0.02], [0.225, 0.02]], '#1a0450', sd + 2);
            line(W, [[0.16, 0.061], [0.2, 0.055], [0.245, 0.057], [0.279, 0.066]], '#1a0450', cap(0.009 * s, 1.5, 7), sd + 3);
            const w = cap(0.0035 * s, 1, 3);
            for (let k = 0; k < 6; k++) { const u0 = 0.022 + k * 0.019; line(W, [[u0, 0.046 + k * 0.0028], [u0 + 0.011, 0.048 + k * 0.0028]], '#c49af0', w, sd + 10 + k, 0.3); }
            line(W, [[0.125, 0.064], [0.13, 0.04], [0.16, 0.036], [0.165, 0.062]], ink, cap(0.005 * s, 1.2, 4), sd + 4);
            line(W, [[0.135, 0.05], [0.155, 0.05]], '#1a0450', cap(0.006 * s, 1.2, 4), sd + 5);
            line(W, [[0.01, 0.034], [0.04, 0.052], [0.09, 0.06]], '#ffc46a', cap(0.004 * s, 1, 3), sd + 6, 0.5);
        }
        // the swash running round them: foam along their feet, a film of water over the soles
        if (wet > 0.02) for (const [ux, uz, sd] of [[0.06, 0, 1], [-0.18 + drift * 0.12, 0.14 + drift, 2], [-0.62, -0.2, 3], [-0.48, 0.02, 4]]) {
            for (let k = 0; k < 5; k++) {
                const x0 = sx + ux - 0.04 + k * 0.07, z0 = sz + uz + (H(sd, k, 1) - 0.5) * 0.12 - 0.03;
                const a = cam.p([x0, 0.006, z0]), b = cam.p([x0 + 0.08 + 0.05 * H(sd, k, d), 0.006, z0 + 0.03]); if (a[2] < 0.3) continue;
                const s = cam.f / a[2];
                Ink.brush(g, [[a[0], a[1]], [b[0], b[1]]], { w: cap(0.012 * s, 1, 10), col: k % 2 ? '#ffe6f6' : '#fff8fc', seed: 9200 + sd * 13 + k, d, taper: 0.4, alpha: wet, light: true });
            }
        }
    }

    // the standing things of the world, as items to sort with the cast: { depth, draw }
    function items(g, L, cam, T, d, env) {
        const fe = facing(cam), out = [];
        const dist = (x, y, z) => cam.view([x, y, z])[2];
        for (const ht of hotels()) { const z = ZF - 9; out.push({ depth: dist((ht.x0 + ht.x1) / 2, 5, z), draw: () => hotel(g, L, cam, ht, T, d, env) }); }
        // Lummus Park's palms and the dune line's palms
        for (let i = -40; i <= 40; i++) {
            const x = i * 14 + (H(i, 1, 0) - 0.5) * 8, z = -92 + (H(i, 2, 0) - 0.5) * 8;
            if (Math.abs(x - cam.pos[0]) > 420) continue;
            out.push({ depth: dist(x, 5, z), draw: () => palm(g, cam, x, z, i + 50, T, d, fe) });
            if (i % 3 === 0) { const x2 = x + 5, z2 = -58 + H(i, 3, 0) * 6; out.push({ depth: dist(x2, 5, z2), draw: () => palm(g, cam, x2, z2, i + 150, T, d, fe) }); }
        }
        for (const H0 of HUTS) out.push({ depth: dist(H0.x, 3, H0.z), draw: () => hut(g, L, cam, H0, T, d, fe) });
        // sea oats along the dune line, and clumps on the open sand
        for (let i = -200; i <= 200; i++) {
            const x = i * 1.5 + (H(i, 5, 0) - 0.5) * 1.2, z = (i % 2 ? -53 : -60) + (H(i, 6, 0) - 0.5) * 4;
            if (Math.abs(x - cam.pos[0]) > 140) continue;
            out.push({ depth: dist(x, 0.5, z), draw: () => grass(g, cam, x, z, 0.8 + 0.5 * H(i, 7, 0), 500 + i, T, d, fe) });
        }
        return out;
    }

    return { swashAt, runOf, sky, sea, ground, items, sunE, facing, dawn, depthAt, hotels, hut, palm, grass, shoes, box, tube, neonOn, skyP, level, SUN_R, OUT1, OUT2, HUTS, ZF };
})();
