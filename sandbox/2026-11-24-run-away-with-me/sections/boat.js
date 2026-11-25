// uses: props/boat-speedboat.js (load it before this file)
// Section · the bridge, 2:43–3:18 (bars 81–98): the speedboat across Biscayne Bay at night
// (bridge A), the comedown at sea as the night pales over the Atlantic and what they touch
// turns gold (bridge B), the horizon burning brighter on every beat (the build) and the sun's
// rim touching the sea, held (the riser), up to the final chorus's drop at 198.054.
// The far world (the city panorama) is Drawn.city's; the sky, the sea at dawn, the causeway
// seen from the water, the wake, the gold and the sun are this file's. The boat:
// props/boat-speedboat.js. Contract: sections/README.md.
(() => {
    const BAR = 2.01672, B = (n) => 0.415 + n * BAR;
    const FROM = B(81), TO = B(98), TB = B(89);               // 163.769 · 198.054 · 179.903 (the music falls)
    const WATER = Causeway.WATER;
    const P = Ink.PAL, hex = Neon.hex, css = Neon.css, mix = Neon.mix;
    const cap = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
    const seg = Ease.seg, io = Ease.inOut;
    const SHOTS = [
        [B(81), B(83), '1 · the boat bursts past, downtown behind'],
        [B(83), B(85), '2 · they hold on behind the windscreen'],
        [B(85), B(87), '3 · the wake fans out (from above)'],
        [B(87), B(89), '4 · racing the causeway\'s lamps'],
        [B(89), B(91), '5 · the boat slows, the sky pales'],
        [B(91), B(93), '6 · what they touch turns gold'],
        [B(93), B(95), '7 · the gold runs out over the sea'],
        [B(95), B(96), '8 · the horizon burns (build)'],
        [B(96), B(97), '9 · the two of them face the light'],
        [B(97), B(98), '10 · the sun\'s rim touches the sea (riser)'],
    ];
    const shotIndex = (T) => { const i = SHOTS.findIndex(([a, b]) => T >= a && T < b); return i < 0 ? SHOTS.length - 1 : i; };

    // --- the course: east (−z) across the bay 150 m north of the causeway, weaving a little ----
    const V = 30;                                             // m/s (about 58 knots)
    const X0 = 150, Z0 = 1150;
    const sAt = (T) => { if (T <= TB) return V * (T - FROM); const t = T - TB; return V * (TB - FROM) + 1.2 * t + 28.8 * 1.3 * (1 - Math.exp(-t / 1.3)); };
    const vAt = (T) => (T <= TB ? V : 1.2 + 28.8 * Math.exp(-(T - TB) / 1.3));
    const sInv = (s) => { if (s <= V * (TB - FROM)) return FROM + s / V; let T = TB + 1; for (let i = 0; i < 12; i++) T -= (sAt(T) - s) / Math.max(0.5, vAt(T)); return T; };
    const WEAVE = 0.2, WL = 60;
    const headAt = (s) => -Math.PI + WEAVE * Math.sin(s / WL);
    // position by arc length (the heading's integral, closed form: x drifts as the weave turns)
    const posAt = (s) => [X0 - WEAVE * WL * (1 - Math.cos(s / WL)) * 1.0, Z0 - s];
    // the swing at sea: the bow comes round to the north as she idles (bridge B)
    const swing = (T) => -(Math.PI / 2) * io(seg(T, 180.4, 183.6));
    function pose(T) {
        const s = sAt(T), [x, z] = posAt(s), v = vAt(T), k = v / V;
        const kick = Song.env('kick', T), bass = Song.env('bass', T);
        const yaw = headAt(s) + swing(T);
        const curv = (WEAVE / WL) * Math.cos(s / WL);
        const calm = T >= B(97) ? 0.4 : 1;                    // the riser: no bass, the sea holds its breath
        return {
            x, z, yaw, v,
            y: WATER + 0.16 * k + 0.035 * Math.sin(T * 3.1) * calm,
            pitch: 0.055 * k + (0.012 * Math.sin(T * 5.3) + 0.022 * kick * bass) * k + 0.008 * Math.sin(T * 1.4) * (1 - k) * calm,
            roll: curv * 14 * k + 0.012 * Math.sin(T * 2.3) * k + 0.025 * Math.sin(T * 1.25) * (1 - k) * calm,
        };
    }

    // --- what the music does here -----------------------------------------------------------
    function effects(T) {
        const kick = Song.env('kick', T), mid = Song.env('mid', T), high = Song.env('high', T);
        // bridge A: the trip's last colours, fading out bar by bar
        const trip = T < TB ? 0.55 * (1 - seg(T, FROM, TB - 1)) : 0;
        const hue = trip ? 30 * Math.sin((T - FROM) * 2.2) * trip : 0;
        // the night pales: slowly through bridge B, then the build lifts it the rest of the way
        const dawn = T < TB ? 0 : 0.72 * io(seg(T, TB + 0.2, B(95))) + 0.28 * io(seg(T, B(95), B(97)));
        // the build: the horizon burns brighter on every beat (a step and a flare), most when the
        // mids and highs come in (193.6)
        let burn = 0;
        if (T >= B(95)) {
            const bi = Math.floor((T - B(95)) / Song.beat), bt = T - B(95) - bi * Song.beat;
            burn = Math.min(1, 0.11 * (Math.min(bi, 7) + 1)) * (0.75 + 0.25 * mid) + 0.35 * Math.exp(-bt * 6) * (T < B(97) ? 1 : 0);
            if (T >= B(97)) burn = 1 + 0.25 * io(seg(T, B(97), TO));      // the riser: held, breathing in
        }
        // the sun's rim: on the riser's bar line it touches the sea and holds
        const rim = T >= B(97) ? io(seg(T, B(97), B(97) + 0.45)) : 0;
        // the gold: from where they stand, over the boat, then out over the sea
        const goldBoat = io(seg(T, 184.25, 186.8));
        const goldSea = T > 185.1 ? (T - 185.1) * 24 : 0;             // the front's radius, metres
        return { T, kick, mid, high, trip, hue, dawn, burn, rim, goldBoat, goldSea, halo: 1 + trip * (0.4 + kick * 0.6), star: trip * 0.5 };
    }

    // --- the sky -------------------------------------------------------------------------------
    // Drawn.sky's bands at fixed elevations (copied: its stars and moon only cover the west, and
    // its inks are the night's), here warming towards the east as the night pales, with clouds
    // lit from below, the stars going out, the horizon burning and the sun's rim.
    const SUN_A = Math.PI;                                     // east: −z
    const skyP = (cam, a, e) => { const r = 20000; return cam.p([cam.pos[0] + Math.sin(a) * Math.cos(e) * r, cam.pos[1] + Math.sin(e) * r, cam.pos[2] + Math.cos(a) * Math.cos(e) * r]); };
    const level = (cam) => { const a = skyP(cam, camAz(cam) - 0.6, 0), b = skyP(cam, camAz(cam) + 0.6, 0), c = skyP(cam, camAz(cam), 0); return { ang: Math.atan2(b[1] - a[1], b[0] - a[0]), cx: c[0], cy: c[1] }; };
    const span = (cam, e) => { const a = camAz(cam), p = skyP(cam, a, e), c = skyP(cam, a, 0); return Math.hypot(p[0] - c[0], p[1] - c[1]) * (p[1] < c[1] ? 1 : -1); };
    // the azimuth the camera looks along (0 = +z, west; π = east)
    const camAz = (cam) => { const a = cam.view([cam.pos[0], cam.pos[1], cam.pos[2] + 1]), b = cam.view([cam.pos[0] + 1, cam.pos[1], cam.pos[2]]); return Math.atan2(b[2], a[2]); };
    const NIGHT = ['#04022e', '#0f0138', '#18065e', '#260a8c', '#3c0ca8', '#6a1290', '#a8189e'];
    const DAWN = ['#120244', '#260a8c', '#4a0fb0', '#7407f0', '#ad19b0', '#e106d3', '#f45a7f'];
    const BAND_E = [0.75, 0.42, 0.26, 0.16, 0.095, 0.05, 0.02];
    const tone = (c, fx, k = 1) => (fx.hue ? css(Neon.shift(c, fx.hue * k)) : c);
    // how much of the dawn a direction gets (the east most, the west a little)
    const toward = (az) => 0.35 + 0.65 * (0.5 + 0.5 * Math.cos(az - SUN_A));

    function sky(g, L, cam, T, d, fx, env) {
        const lv = level(cam), Wd = env.W * 1.8, az = camAz(cam), dw = fx.dawn * toward(az);
        const bands = NIGHT.map((c, i) => { const k = dw * [0.25, 0.4, 0.55, 0.7, 0.82, 0.92, 1][i]; return tone(k > 0 ? css(mix(c, DAWN[i], k)) : c, fx, 0.4); });
        g.save(); g.translate(lv.cx, lv.cy); g.rotate(lv.ang);
        const top = -env.H * 2.5;
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
        g.restore();
        // the glow over the sunrise point: the sky's own layers, laid as horizontal bands of flat ink
        // with brushed, ragged edges, warmer and thinner towards the sun; some sit on the
        // horizon, some float as streaks above it. The burn of the build widens and lifts them.
        const sp = skyP(cam, SUN_A, 0);
        if (fx.dawn > 0.02 && sp[2] > 1) {
            const gl = fx.dawn + fx.burn * 0.6, f = cam.f / 1000;
            // [ink, half-width, bottom, top (px at f 1000, up is negative), order of arrival]
            const bands = [[P.purple, 1150, 4, -150, 0], [P.magenta, 980, -128, -170, 1], [P.magenta, 900, 4, -92, 1], [P.salmon, 720, -66, -84, 2],
                [P.salmon, 640, 4, -52, 2], [P.orange, 470, -34, -44, 3], [P.orange, 420, 4, -27, 3], [P.gold, 260, 4, -13, 4], ['#ffe6c8', 120, 4, -6, 5]];
            g.save(); g.translate(sp[0], sp[1]); g.rotate(lv.ang);
            for (let i = 0; i < bands.length; i++) {
                const [col, W0, yb0, yt0, o] = bands[i], a = cap(gl * 1.3 - o * 0.22, 0, 1) * (o >= 4 ? 1 - 0.85 * fx.rim : 1); if (a <= 0) continue;
                const Wd = W0 * f * (0.55 + 0.45 * Math.min(1, gl) + 0.25 * fx.burn), lift = 1 + fx.burn * 0.35;
                const yt = yt0 * f * lift, yb = yb0 > 0 ? yb0 : yb0 * f * lift, mid = (yt + yb) / 2, floating = yb0 <= 0;
                const top = [], bot = [];
                for (let j = 0; j <= 40; j++) {
                    const u = j / 40, x = -Wd + 2 * Wd * u, t = Math.sqrt(Math.max(0, 1 - Math.abs(2 * u - 1) ** 3));
                    const rag = 4 * f * Ink.noise(600 + i, u * 14, 0) + 1.2 * Ink.noise(610 + i, u * 40, d);
                    const yT = (floating ? mid + (yt - mid) * t : yb + (yt - yb) * t * (0.85 + 0.15 * Ink.noise(620 + i, u * 5, 0))) + rag;
                    top.push([x, yT]); bot.push([x, floating ? mid + (yb - mid) * t - rag * 0.5 : yb]);
                }
                const q = top.concat(bot.reverse());
                g.globalAlpha = a; g.fillStyle = col; Neon.path(g, q); g.fill();
                // the brushed edge: the band's own ink dragged along its top, then a few loose strokes
                Ink.brush(g, top.filter((p, j) => j % 2 === 0), { w: 3 * f + 1, col, seed: 630 + i, d, taper: 0.35, wob: 2, alpha: a });
                Ink.strokes(g, -Wd * 0.85, yt - 3, Wd * 1.7, Math.max(4, (yb - yt) * 0.35), { ang: 0, count: 6, len: Wd * 0.28, w: 3, cols: [col], seed: 650 + i, d, alpha: 0.75 * a });
            }
            g.globalAlpha = 1;
            // the burning horizon: a seam of light along the sea, on the light layer too
            if (fx.burn > 0 || fx.dawn > 0.5) {
                const b = Math.max(fx.burn, (fx.dawn - 0.5) * 0.8) * (1 - 0.45 * fx.rim), hw = (300 + 700 * b) * f;
                for (let k = 0; k < 7; k++) {
                    const y = -1 - k * 1.6 * (1 + b), w = hw * (1 - k * 0.12) * (0.8 + 0.2 * Ink.hsh(k, 3, 0));
                    Ink.brush(g, [[-w, y], [0, y - 1], [w, y]], { w: 2.5 + 2 * b, col: k < 2 && !fx.rim ? '#ffe6c8' : k < 4 ? P.orange : P.salmon, seed: 640 + k, d, taper: 0.45, alpha: cap(b * 1.3, 0, 1) * (1 - 0.5 * fx.rim), light: true });
                }
                L.save(); L.translate(sp[0], sp[1]); L.rotate(lv.ang);
                L.globalAlpha = cap(b, 0, 1.2) * 0.8 * (1 - 0.75 * fx.rim); L.fillStyle = P.gold; L.beginPath(); L.ellipse(0, 0, hw * 0.9, 10 + 22 * b, 0, Math.PI, 0); L.fill();
                L.globalAlpha = cap(b, 0, 1.2) * 0.5 * (1 - 0.5 * fx.rim); L.fillStyle = P.salmon; L.beginPath(); L.ellipse(0, 0, hw * 1.6, 30 + 50 * b, 0, Math.PI, 0); L.fill();
                L.restore();
            }
            g.restore();
        }
        // clouds: long low banks fixed in the sky, plum at night, their undersides catching the dawn
        const RC = Motion.rng('boat-clouds');
        for (let i = 0; i < 12; i++) {
            const a = SUN_A + (RC() * 2 - 1) * (i < 5 ? 0.45 : 1.5), e = 0.03 + RC() * 0.1, wA = 0.06 + RC() * 0.14, hE = 0.006 + RC() * 0.012, ph = RC();
            const pts = [], n = 18;
            for (let j = 0; j <= n; j++) { const u = j / n, aa = a - wA / 2 + wA * u, bump = Math.sin(u * Math.PI) * (0.55 + 0.45 * Math.abs(Math.sin(u * 9 + ph * 7))); pts.push(skyP(cam, aa, e + hE * bump)); }
            const under = []; for (let j = n; j >= 0; j--) { const u = j / n, aa = a - wA / 2 + wA * u; under.push(skyP(cam, aa, e - hE * 0.15 * Math.sin(u * Math.PI))); }
            const all = pts.concat(under); if (all.some((p) => p[2] < 1)) continue;
            const dc = fx.dawn * toward(a);
            const body = dc > 0 ? css(mix(P.grape, P.plum, cap(dc * 1.4, 0, 1))) : P.grape;
            Ink.shape(g, all.map((p) => [p[0], p[1]]), tone(body, fx, 0.4), { w: 2.6, seed: 660 + i, d, jit: 0.3 });
            // lit from below: a rim of the dawn's ink just inside the underside, a second paler one
            // under it, and strokes of light up into the cloud's belly
            const U = under.map((p) => [p[0], p[1] - 2.5]);
            const rimCol = dc > 0.25 ? (dc > 0.55 ? P.gold : P.salmon) : P.violet;
            Ink.brush(g, U, { w: 3 + dc * 4, col: rimCol, seed: 680 + i, d, taper: 0.3, alpha: 0.95, light: true });
            if (dc > 0.4) {
                Ink.brush(g, U.map((p) => [p[0], p[1] - 4 - dc * 3]).slice(3, -3), { w: 1.6 + dc * 1.5, col: dc > 0.6 ? '#fff0c8' : P.orange, seed: 690 + i, d, taper: 0.4, alpha: 0.9, light: true });
                for (let k = 2; k < U.length - 2; k += 3) Ink.brush(g, [[U[k][0], U[k][1] - 2], [U[k][0] + 6, U[k][1] - 7 - 6 * dc]], { w: 1.6, col: P.salmon, seed: 700 + i * 20 + k, d, taper: 0.4, alpha: 0.8, light: true });
                L.save(); L.globalAlpha = (dc - 0.4) * 0.7; L.strokeStyle = dc > 0.6 ? P.gold : P.salmon; L.lineWidth = 5; Neon.path(L, U, false); L.stroke(); L.restore();
            }
        }
        // stars (the whole sky), going out as the night pales
        const sa = 1 - cap(fx.dawn * 1.6, 0, 1), horizon = lv.cy;
        if (sa > 0.02) {
            const R = Motion.rng('boat-stars');
            for (let i = 0; i < 220; i++) {
                const a = R() * Math.PI * 2, e = 0.04 + Math.pow(R(), 1.4) * 0.6, s0 = 1.5 + R() * 3.2, cy = R() < 0.3;
                const p = skyP(cam, a, e); if (p[2] < 1 || p[0] < -10 || p[0] > env.W + 10 || p[1] < -10 || p[1] > horizon - 8) continue;
                const sz = s0 * (0.55 + 0.55 * Ink.hsh(i, 7, d)) * (0.5 + 0.5 * sa);
                g.globalAlpha = sa * (e > 0.2 ? 1 : 0.6 + e * 2); g.strokeStyle = cy ? P.cyan : P.cream; g.lineWidth = Math.max(1, sz * 0.35); g.lineCap = 'round';
                g.beginPath(); g.moveTo(p[0] - sz, p[1]); g.lineTo(p[0] + sz, p[1]); g.moveTo(p[0], p[1] - sz); g.lineTo(p[0], p[1] + sz); g.stroke();
            }
            g.globalAlpha = 1;
            // the falling bars of the reference, only while it is night, never over the sunrise
            const R2 = Motion.rng('boat-rain');
            for (let i = 0; i < 12; i++) {
                const a = R2() * Math.PI * 2, v = 0.008 + R2() * 0.008, ph = R2(), len = 0.03 + R2() * 0.035, col = R2() < 0.5 ? P.violet : P.purple, wdt = 9 + R2() * 7;
                if (Math.cos(a - SUN_A) > 0.8) continue;
                const u = ((T * v / 0.5 + ph) % 1 + 1) % 1, eTop = 0.62 - u * 0.5;
                const p0 = skyP(cam, a, eTop), p1 = skyP(cam, a, eTop - len); if (p0[2] < 1) continue;
                const fade = Math.min(1, u * 6, (1 - u) * 6) * sa;
                g.save(); g.globalAlpha = 0.9 * fade; g.fillStyle = tone(col, fx, 0.5);
                g.beginPath(); g.roundRect(p0[0] - wdt / 2, p0[1], wdt, Math.max(8, p1[1] - p0[1]), wdt / 2); g.fill(); g.restore();
            }
        }
        // the moon, low in the west (Drawn's), paling
        const m = skyP(cam, 0.5, 0.2);
        if (m[2] > 1 && m[1] < horizon - 40 && m[1] > 30 && m[0] > -30 && m[0] < env.W + 30) {
            const r = 24, cres = [];
            for (let i = 0; i <= 20; i++) { const an = Math.PI * 0.42 + (i / 20) * Math.PI * 1.16; cres.push([m[0] + Math.cos(an) * r, m[1] + Math.sin(an) * r]); }
            for (let i = 20; i >= 0; i--) { const an = Math.PI * 0.42 + (i / 20) * Math.PI * 1.16; cres.push([m[0] + 9 + Math.cos(an) * r * 0.86, m[1] - 4 + Math.sin(an) * r * 0.86]); }
            Ink.shape(g, cres, P.cream, { w: 2.6, seed: 'moon', d, jit: 0.4 });
        }
    }

    // the sun's rim: the top of the striped sun just over the sea, burning, held (the riser)
    const SUN_R = 0.12;                                       // its angular radius (the film's big sun)
    function sunRim(g, L, cam, T, d, fx, env) {
        if (fx.rim <= 0) return;
        const c = skyP(cam, SUN_A, 0), top = skyP(cam, SUN_A, SUN_R); if (c[2] < 1) return;
        const r = Math.hypot(top[0] - c[0], top[1] - c[1]), lv = level(cam);
        const h = r * 0.16 * fx.rim;      // how much of it stands over the sea
        const yc = r - h;                                      // the centre under the horizon
        const half = Math.sqrt(Math.max(0, r * r - yc * yc));
        const q = []; for (let j = 0; j <= 30; j++) { const x = -half + (2 * half * j) / 30; q.push([x, -(Math.sqrt(Math.max(0, r * r - x * x)) - yc)]); }
        g.save(); g.translate(c[0], c[1]); g.rotate(lv.ang);
        Ink.shape(g, q, P.gold, { w: 0, seed: 700, d, jit: 0.2, light: true });
        // its lower edge: the sea's line drawn across it in salmon, so the cap sits on the water
        Ink.brush(g, [[-half * 1.3, 0.5], [half * 1.3, 0.5]], { w: 2.4, col: P.salmon, seed: 702, d, taper: 0.3, light: true });
        Ink.brush(g, q.slice(4, 27), { w: 2 + 2 * fx.rim, col: '#fff0c8', seed: 701, d, taper: 0.3, light: true });
        g.restore();
        L.save(); L.translate(c[0], c[1]); L.rotate(lv.ang);
        L.globalAlpha = 0.45 * fx.rim * (0.85 + 0.15 * Math.sin(T * 9)); L.fillStyle = '#f9a03a'; Neon.path(L, q); L.fill();
        L.lineWidth = 4; L.strokeStyle = '#ffd25a'; L.stroke();
        L.restore();
    }

    // --- the sea -------------------------------------------------------------------------------
    // the bay's fills and strokes (Drawn.bay's layout, here for any heading and with the dawn's
    // inks), the column of the sunrise on the water, the swell turning gold behind the gold's front
    function sea(g, L, cam, T, d, fx, env, ps) {
        const lv = level(cam), Wd = env.W * 1.8, dw = fx.dawn * toward(camAz(cam));
        const tint = (c, day, k = 1) => (dw > 0 ? css(mix(c, day, cap(dw * k, 0, 1))) : c);
        g.save(); g.translate(lv.cx, lv.cy); g.rotate(lv.ang);
        g.fillStyle = tint('#18065e', '#4a0fb0', 0.8); g.fillRect(-Wd, 0, Wd * 2, env.H * 3);
        for (const [f, col, day, seed] of [[0.28, P.deep, P.indigo, 55], [0.6, P.navy, '#200887', 56]]) {
            const y2 = (env.H - lv.cy) * f;
            const c2 = tint(col, day, 0.7);
            g.fillStyle = c2; g.beginPath(); g.moveTo(-Wd, env.H * 3);
            for (let x = -Wd; x <= Wd; x += 24) g.lineTo(x, y2 + Ink.noise(seed, x / 420, 0) * 46 + Ink.noise(seed + 9, x / 90, 0) * 12 + Ink.noise(seed + 19, x / 25, 0) * 4);
            g.lineTo(Wd, env.H * 3); g.closePath(); g.fill();
            Ink.strokes(g, -Wd, y2 - 60, Wd * 2, 70, { ang: 0, count: 26, len: 140, w: 4, cols: [c2], seed: seed * 7, d, alpha: 0.8 });
        }
        // the horizon's bright line on the water (the sky's lowest band mirrored)
        if (dw > 0.05) {
            Ink.strokes(g, -Wd, 2, Wd * 2, 10, { ang: 0, count: 70, len: 90, w: 3, cols: [P.salmon, P.magenta], seed: 58, d, alpha: cap(dw * 1.2, 0, 0.9) });
            Ink.strokes(g, -Wd, 14, Wd * 2, (env.H - lv.cy) * 0.35, { ang: 0, count: 130, len: 110, w: 3.5, cols: [P.purple, P.magenta, P.violet], seed: 59, d, alpha: cap(dw, 0, 0.7) });
        }
        g.restore();
        // the sunrise's column: horizontal strokes under the sun's point, widening towards us
        const sp = skyP(cam, SUN_A, 0);
        if (fx.dawn > 0.1 && sp[2] > 1) {
            const gl = cap((fx.dawn - 0.1) * 1.3 + fx.burn * 0.8 + fx.rim * 0.5, 0, 2), n = Math.round(18 + 30 * Math.min(1, gl));
            for (let k = 0; k < n; k++) {
                const u = Math.pow((k + 0.5 * Ink.hsh(k, 1, 0)) / n, 1.6), yy = sp[1] + 3 + u * (env.H - sp[1]) * 0.98;
                if (yy > env.H + 10) continue;
                const w = (20 + 520 * u) * (0.4 + 0.6 * Math.min(1, gl)) * (0.4 + 0.9 * Ink.hsh(k, 2, 0)) * cam.f / 1000;
                const x0 = sp[0] + Ink.noise(k * 3, T * 0.6, 0) * 10 + (Ink.hsh(k, 4, 0) - 0.5) * w * 0.5;
                const col = u < 0.15 ? '#ffe6c8' : [P.gold, P.orange, P.salmon, P.gold][k % 4];
                Ink.brush(g, [[x0 - w / 2, yy], [x0 + w / 2, yy + 0.5]], { w: 1.6 + 4 * u, col, seed: 720 + k, d, taper: 0.45, wob: 0.6, alpha: cap(0.35 + gl * 0.5, 0, 0.95) * (1 - u * 0.35), light: true });
                if (u < 0.3) { L.save(); L.globalAlpha = 0.35 * Math.min(1, gl); L.strokeStyle = P.gold; L.lineWidth = 3; L.beginPath(); L.moveTo(x0 - w / 2, yy); L.lineTo(x0 + w / 2, yy); L.stroke(); L.restore(); }
            }
        }
        // the swell: loose strokes of the sky's colours, scattered in the water on three grids of
        // cells round the camera (finer near it), so each stroke stays where it lies in the water;
        // gold where the gold's front has passed
        const gr = fx.goldSea, bc = ps ? [ps.x, ps.z] : [0, 0], cx = cam.pos[0], cz = cam.pos[2];
        const cols = [P.violet, P.purple, P.magenta, P.royal, P.salmon];
        let inner = 0;
        for (const [cs, rr, ring] of [[2.1, 22, 0], [5.5, 70, 1], [20, 320, 2], [100, 1700, 3]]) {
            for (let ix = Math.floor((cx - rr) / cs); ix <= Math.ceil((cx + rr) / cs); ix++) for (let iz = Math.floor((cz - rr) / cs); iz <= Math.ceil((cz + rr) / cs); iz++) {
                const h1 = Ink.hsh(ix, iz, ring), h2 = Ink.hsh(iz + 77, ix, ring), h3 = Ink.hsh(ix + 5, iz + 9, ring);
                const gx = (ix + h1) * cs, gz = (iz + h2) * cs, dd = Math.hypot(gx - cx, gz - cz);
                if (dd < inner || dd > rr || dd < 3) continue;
                const p = cam.p([gx + Math.sin(T * 0.7 + h3 * 6) * 1.2, WATER, gz]);
                if (p[2] < 2 || p[1] < lv.cy + 2 || p[1] > env.H + 10 || p[0] < -80 || p[0] > env.W + 80) continue;
                const l = Math.min(110, 9000 / dd + 4);
                const gd = gr > 0 ? gr - Math.hypot(gx - bc[0], gz - bc[1]) : -1, inGold = gd > 0 && gd < 28 && h1 < 0.75;
                const ci = Math.floor(h3 * 997) % 5;
                const col = inGold ? [P.gold, P.orange, P.gold, '#ffe6c8', P.orange][ci] : (dw > 0.3 && ci === 3 ? P.salmon : cols[ci]);
                Ink.brush(g, [[p[0] - l / 2, p[1]], [p[0] + l / 2, p[1] + 0.5]], { w: Math.min(4.5, 1 + 300 / dd), col, seed: 5000 + ((ix * 131 + iz * 17 + ring) & 0xffff), d, taper: 0.45, wob: 0.4, alpha: inGold ? 0.95 : 0.85, light: true });
            }
            inner = rr;
        }
    }

    // --- the causeway seen from the water (bridge A): its deck a low dark band with the pink
    // tube on its parapet, its lamps every 12.6 m, their light broken on the bay ------------------
    function causeway(g, L, cam, T, d, fx, N) {
        const C = Causeway, zc = cam.pos[2];
        const zs = []; for (let z = -400; z <= 1900; z += 8) zs.push(z);
        const vis = (p) => p[2] > 2;
        const lamps = [];
        for (let k = -40; k < 200; k++) { const z = 12.6 * k + 3; lamps.push(z); }
        // the lamps' reflections first (strokes of gold under each, on the water)
        for (const z of lamps) {
            const top = cam.p([-2.4, WATER, z]), mir = cam.p([-2.4, 2 * WATER - (C.y(z) + 10), z]); if (!vis(top) || top[0] < -40 || top[0] > cam.W + 40) continue;
            const s = cam.f / top[2]; if (s < 0.4) continue;
            const len = Math.max(6, mir[1] - top[1]);
            for (let j = 0; j < 4; j++) {
                const u = (j + 0.4 * Ink.hsh(z | 0, j, 0) + 0.3) / 4, yy = top[1] + len * u * u, w = (1 + u * 2.2) * s * (0.6 + Ink.hsh(z | 0, j + 9, 0));
                Ink.brush(g, [[top[0] - w / 2, yy], [top[0] + w / 2, yy + 0.5]], { w: cap(0.25 * s, 1, 4), col: j % 2 ? P.orange : P.gold, seed: (z | 0) * 17 + j, d, taper: 0.4, alpha: 0.8 * (1 - u * 0.5), light: true });
            }
        }
        // the deck's north face and parapet: one strip at the side we look at
        const xf = cam.pos[0] > 0 ? 7.9 : -12.3;
        const A = zs.map((z) => cam.p([xf, C.y(z) - 1.3, z])), Bq = zs.map((z) => cam.p([xf, C.y(z) + 1.05, z]));
        const runs = []; let cur = [];
        for (let i = 0; i < zs.length; i++) { if (vis(A[i]) && vis(Bq[i])) cur.push(i); else if (cur.length) { runs.push(cur); cur = []; } }
        if (cur.length) runs.push(cur);
        for (const run of runs) {
            if (run.length < 2) continue;
            const q = run.map((i) => [A[i][0], A[i][1]]).concat(run.slice().reverse().map((i) => [Bq[i][0], Bq[i][1]]));
            Ink.shape(g, q, P.indigo, { w: 2, seed: 760, d, jit: 0 });
            // piers under it
            for (const i of run) { if (zs[i] % 24 !== 0) continue; const w0 = cam.p([xf, WATER, zs[i]]); if (!vis(w0)) continue; const s = cam.f / w0[2]; Ink.brush(g, [[A[i][0], A[i][1]], [w0[0], w0[1]]], { w: cap(1.0 * s, 1, 4), col: P.indigo, seed: 770 + i, d, taper: 0.05 }); }
            // the tube on the parapet: pink, glowing
            const tq = run.map((i) => cam.p([xf, C.y(zs[i]) + 1.12, zs[i]])).map((p) => [p[0], p[1]]);
            Ink.brush(g, tq, { w: 2.2, col: tone(P.pink, fx), seed: 780, d, taper: 0.02, light: true });
            L.save(); L.strokeStyle = tone(P.pink, fx); L.lineWidth = 4; L.globalAlpha = 0.8; Neon.path(L, tq, false); L.stroke(); L.restore();
        }
        // the lamps: a pole and a head of sodium light, glowing
        for (const z of lamps) {
            const base = cam.p([-2.4, C.y(z) + 1, z]), head = cam.p([-2.4, C.y(z) + 10, z]); if (!vis(head) || head[0] < -40 || head[0] > cam.W + 40) continue;
            const s = cam.f / head[2];
            if (s > 0.5) Ink.brush(g, [[base[0], base[1]], [head[0], head[1]]], { w: cap(0.25 * s, 0.8, 4), col: P.ink, seed: 790 + (z | 0), d, taper: 0.05 });
            N.glint(null, L, head[0], head[1], cap(1.6 * s, 3, 26), tone(P.gold, fx), { lightOnly: true, alpha: 0.95, halo: fx.halo, star: fx.star, rays: 4 });
            g.fillStyle = P.cream; g.beginPath(); g.arc(head[0], head[1], cap(0.3 * s, 1, 5), 0, Math.PI * 2); g.fill();
        }
    }

    // the bay's broken reflections of the far lights: from each light's foot on the water a path of
    // short strokes lying across it, spreading and thinning as it comes towards the camera (the
    // lower third of the night shots), rippling sideways
    function glitter(g, L, cam, T, d, fx, env) {
        const lights = [], R = Motion.rng('boat-glitter'), cols = [P.orange, P.gold, P.salmon, P.cyan, P.pink, P.gold];
        for (let i = 0; i < 40; i++) { const u = R(), x = -1900 + 4200 * (u < 0.6 ? 0.42 + (R() - 0.5) * 0.5 : u); lights.push([x, 2600, cols[i % 6], 1000 + i]); }
        for (let k = -32; k < 150; k += 3) lights.push([-2.4, 12.6 * k + 3, P.gold, 2000 + k]);
        const C0 = [cam.pos[0], cam.pos[2]];
        for (const [lx, lz, col, key] of lights) {
            if (lz > 1900 && lz < 2500) continue;
            const foot = cam.p([lx, WATER, lz]); if (foot[2] < 5 || foot[0] < -150 || foot[0] > env.W + 150) continue;
            const D = Math.hypot(lx - C0[0], lz - C0[1]), n = 9, dMin = Math.max(8, D * 0.02), ux = (lx - C0[0]) / D, uz = (lz - C0[1]) / D;
            for (let k = 0; k < n; k++) {
                const dk = D * Math.pow(dMin / D, (k + 0.5 * Ink.hsh(key, k, 0)) / n) * 0.985, near = 1 - dk / D;
                if (Ink.hsh(key, k + 20, 0) < 0.25 + 0.45 * near) continue;
                const sway = Ink.noise(key * 3 + k, T * 0.9, 0) * (0.4 + dk * 0.004), hw = (0.5 + dk * 0.011) * (0.6 + 0.8 * Ink.hsh(key, k + 40, 0));
                const cx = C0[0] + ux * dk - uz * sway, cz = C0[1] + uz * dk + ux * sway;
                const A = cam.p([cx + uz * hw, WATER, cz - ux * hw]), Bq = cam.p([cx - uz * hw, WATER, cz + ux * hw]);
                if (A[2] < 2 || Bq[2] < 2 || A[1] > env.H + 10) continue;
                const s = cam.f / A[2];
                Ink.brush(g, [[A[0], A[1]], [Bq[0], Bq[1] + 0.5]], { w: cap(0.12 * s, 1, 4.5), col, seed: key * 13 + k, d, taper: 0.4, wob: 0.5, alpha: 0.85 * (1 - near * 0.5), light: true });
            }
        }
    }

    // a freighter far out on the Atlantic: a low hull, a block of a bridge, its deck lights
    function freighter(g, L, cam, T, d, fx, N) {
        const az = SUN_A + 0.32, dist = 5200, x = cam.pos[0] + Math.sin(az) * dist - (T - FROM) * 3, z = cam.pos[2] + Math.cos(az) * dist;
        const pt = (dx, dy, dz) => cam.p([x + dx, WATER + dy, z + dz]);
        const a = pt(-110, 0, 0), b = pt(110, 0, 0); if (a[2] < 10 || Math.max(a[0], b[0]) < -50 || Math.min(a[0], b[0]) > cam.W + 50) return;
        const hull = [pt(-110, 0, 0), pt(-118, 12, 0), pt(115, 12, 0), pt(110, 0, 0)].map((p) => [p[0], p[1]]);
        const bridge = [pt(-95, 12, 0), pt(-95, 34, 0), pt(-70, 34, 0), pt(-70, 12, 0)].map((p) => [p[0], p[1]]);
        const col = fx.dawn > 0.5 ? P.grape : P.ink;
        Ink.shape(g, hull, col, { w: 1.2, seed: 800, d, jit: 0.2 });
        Ink.shape(g, bridge, col, { w: 1.2, seed: 801, d, jit: 0.2 });
        for (let i = 0; i < 7; i++) { const p = pt(-100 + i * 32, 13, 0); N.glint(null, L, p[0], p[1], 4, i % 3 ? P.gold : P.cream, { lightOnly: true, alpha: 0.8 }); g.fillStyle = P.gold; g.fillRect(p[0] - 0.8, p[1] - 0.8, 1.6, 1.6); }
        const m = pt(-82, 44, 0), on = (Math.floor(Song.beatAt(T)) & 1) === 0;
        if (on) N.glint(null, L, m[0], m[1], 6, P.red, { lightOnly: true, alpha: 0.9 });
    }

    // gulls crossing the dawn: ink wings that beat on twos, fixed paths in the world
    function gulls(g, cam, T, d, fx, ps) {
        if (fx.dawn < 0.25) return;
        const R = Motion.rng('boat-gulls');
        for (let i = 0; i < 5; i++) {
            const az = SUN_A + (R() * 2 - 1) * 0.6, dist = 60 + R() * 160, h = 14 + R() * 30, v = 5 + R() * 4, dir = R() < 0.5 ? -1 : 1, ph = R();
            const x = ps.x + Math.sin(az) * dist + dir * v * (T - 186), z = ps.z + Math.cos(az) * dist;
            const p = cam.p([x, WATER + h, z]); if (p[2] < 5 || p[0] < -40 || p[0] > cam.W + 40) continue;
            const s = cam.f / p[2], span = 0.9 * s, flap = Math.sin((d * 0.5 + ph * 8) * 2.2);
            const wy = -flap * span * 0.35, w = cap(0.09 * s, 1.2, 4);
            Ink.brush(g, [[p[0] - span, p[1] + wy], [p[0] - span * 0.45, p[1] - span * 0.18 + wy * 0.4], [p[0], p[1]], [p[0] + span * 0.45, p[1] - span * 0.18 + wy * 0.4], [p[0] + span, p[1] + wy]], { w, col: P.ink, seed: 820 + i, d, taper: 0.3 });
        }
    }

    // --- the wake: a white fan of strokes, laid where the boat passed (anchored to the distance
    // along the course, so the foam stays in the water) and spreading at the Kelvin angle ----------
    function wake(g, cam, T, d, ps0) {
        const sNow = sAt(T), step = 1.6, cols = [P.cream, '#ffc8ee', P.cyan, P.pink];
        const s0 = Math.floor((sNow - 4) / step) * step;
        for (let s = s0, i = 0; s > sNow - 320 && i < 220; s -= step, i++) {
            const Tof = sInv(s), age = T - Tof; if (age > 9 || age < 0) continue;
            const fade = Math.max(0, 1 - age / 9) * cap((vAt(Tof) - 3) / 12, 0, 1);
            if (fade <= 0.01) continue;
            const [x, z] = posAt(s), h = headAt(s) + (Tof > TB ? swing(Tof) : 0), fw = [Math.sin(h), Math.cos(h)], rt = [Math.cos(h), -Math.sin(h)];
            const back = Math.max(0, sNow - s), half = Math.min(0.354 * back, 3 + age * 9);
            const pc = cam.p([x, WATER, z]); if (pc[2] < 1.5) continue;
            const sc = cam.f / pc[2];
            // fewer strokes far away
            if (sc < 6 && (Math.round(s / step) % 2)) continue;
            const key = Math.round(s / step);
            const put = (lat, along, len, ang, w, col, a, sd) => {
                const cx = x + rt[0] * lat + fw[0] * along, cz = z + rt[1] * lat + fw[1] * along;
                const dx = fw[0] * Math.cos(ang) + rt[0] * Math.sin(ang), dz = fw[1] * Math.cos(ang) + rt[1] * Math.sin(ang);
                const A = cam.p([cx - dx * len / 2, WATER + 0.02, cz - dz * len / 2]), Bp = cam.p([cx + dx * len / 2, WATER + 0.02, cz + dz * len / 2]);
                if (A[2] < 1 || Bp[2] < 1) return;
                if (Math.max(A[0], Bp[0]) < -30 || Math.min(A[0], Bp[0]) > cam.W + 30 || Math.max(A[1], Bp[1]) < 0 || Math.min(A[1], Bp[1]) > cam.H + 30) return;
                const s2 = cam.f / A[2], sl = Math.hypot(Bp[0] - A[0], Bp[1] - A[1]), mx = 70;
                if (sl > mx) { const m = [(A[0] + Bp[0]) / 2, (A[1] + Bp[1]) / 2], f = mx / sl / 2; A[0] = m[0] - (Bp[0] - A[0]) * f; A[1] = m[1] - (Bp[1] - A[1]) * f; Bp[0] = m[0] * 2 - A[0]; Bp[1] = m[1] * 2 - A[1]; }
                // foam lies on the water: never steeper on screen than a gentle slope
                { const m = [(A[0] + Bp[0]) / 2, (A[1] + Bp[1]) / 2]; let vx = Bp[0] - A[0], vy = Bp[1] - A[1]; const vl = Math.hypot(vx, vy);
                  if (Math.abs(vy) > 0.35 * Math.abs(vx)) { const hx = Math.max(Math.abs(vx), vl * 0.6) * (vx < 0 ? -1 : 1); vy = Math.sign(vy) * 0.35 * Math.abs(hx); vx = hx; A[0] = m[0] - vx / 2; A[1] = m[1] - vy / 2; Bp[0] = m[0] + vx / 2; Bp[1] = m[1] + vy / 2; } }
                Ink.brush(g, [[A[0], A[1]], [Bp[0], Bp[1]]], { w: cap(w * s2, 0.8, 9), col, seed: sd, d, taper: 0.4, wob: 0.5, alpha: a, light: true });
            };
            // the foam down the middle: churned, widening with age
            const fwid = 0.9 + 0.5 * Math.sqrt(age * 8);
            const foamA = T >= TB ? cap(1 - age / 3.5, 0, 1) : 1;
            for (let j = 0; j < 4; j++) put((Ink.hsh(key, j, 0) - 0.5) * 2 * fwid, (Ink.hsh(key, j + 9, 0) - 0.5) * step, 1.0 + 1.0 * Ink.hsh(key, j + 3, 0), (Ink.hsh(key, j + 6, 0) - 0.5) * 0.6, 0.36, cols[j % 4], 0.9 * fade * foamA, 900 + key * 7 + j);
            // the two arms of the fan and the crests inside them, at the Kelvin angle
            if (back > 3) for (const sd of [-1, 1]) for (const [f, w, a] of [[1, 0.34, 0.95], [0.84, 0.24, 0.8], [0.66, 0.2, 0.7], [0.46, 0.16, 0.55]]) {
                if (Ink.hsh(key, sd + 20 + f * 10, 0) < 0.25) continue;
                put(sd * half * f, 0, 1.8 + 1.4 * Ink.hsh(key, sd + 30, 0), sd * 0.34, w, cols[(key + (sd > 0 ? 1 : 2)) % 4], a * fade, 1000 + key * 11 + (sd + 1) * 3 + Math.round(f * 10));
            }
        }
    }

    // --- the gold: the boat's own inks turn gold from where they stand (props/boat-speedboat.js),
    // and rings of gold run out over the sea
    // the gold on the water: rings of broken gold strokes running out from the boat
    function goldSea(g, L, cam, ps, d, fx) {
        if (fx.goldSea <= 0) return;
        for (let j = 0; j < 8; j++) {
            const r = fx.goldSea - j * 11; if (r < 4 || r > 900) continue;
            const nArc = 7, a0 = Ink.hsh(j, 1, 0) * 6, al = (1 - j / 9) * cap(1 - r / 650, 0.3, 1);
            for (let i = 0; i < nArc; i++) {
                const span = (0.3 + 0.45 * Ink.hsh(j, i + 5, 0)) * (Math.PI * 2 / nArc), st = a0 + (i * Math.PI * 2) / nArc;
                const n = Math.min(26, Math.max(5, Math.round((span * r) / 2.5))), run = [];
                const flush = () => {
                    if (run.length > 1) {
                        const s = cam.f / run[0][2], w = cap(0.22 * s, 1.2, 7), q = run.map((p) => [p[0], p[1]]);
                        Ink.brush(g, q, { w, col: j === 0 ? '#ffe6c8' : (i + j) % 2 ? P.gold : P.orange, seed: 1400 + j * 50 + i, d, taper: 0.35, wob: 0.8, alpha: al, light: true });
                        if (j < 2) { L.save(); L.globalAlpha = 0.4 * al; L.strokeStyle = P.gold; L.lineWidth = w * 2; L.lineCap = 'round'; Neon.path(L, q, false); L.stroke(); L.restore(); }
                    }
                    run.length = 0;
                };
                for (let k = 0; k <= n; k++) {
                    const an = st + (span * k) / n, rr = r * (1 + 0.012 * Ink.noise(j * 9 + i, k * 0.7, 0)) + Math.sin(fx.T * 1.3 + an * 5) * 0.4;
                    const p = cam.p([ps.x + Math.sin(an) * rr, WATER + 0.02, ps.z + Math.cos(an) * rr]);
                    if (p[2] < 1.5 || p[0] < -300 || p[0] > cam.W + 300 || p[1] > cam.H + 50) flush(); else run.push(p);
                }
                flush();
            }
        }
    }

    // --- the two of them in the boat -----------------------------------------------------------
    // Only the sheets' four views exist: each is chosen by where the camera stands relative to the
    // way the figure faces (front, three-quarter, side, back) and mirrored to face the right way
    // on screen. Bridge A: they face the bow. Shots 6–7: they face each other. Then they face east.
    const FLOOR = () => BoatSpeedboat.deckY(-1.4) - BoatSpeedboat.COCK.depth;
    const NATIVE = { her: { side: 1, tq: -1 }, him: { side: -1, tq: 1 } };     // which way each drawing faces on the sheet
    function couple(g, cam, ps, T, d, shot) {
        const v = ps.v / V, W = BoatSpeedboat.W, fwd = [Math.sin(ps.yaw), Math.cos(ps.yaw)], east = [0, -1];
        const spots = shot === 5 || shot === 6
            ? [['her', 0, -0.25, [-fwd[0], -fwd[1]]], ['him', 0, -1.35, fwd]]
            : shot >= 7 ? [['her', 0.45, -0.25, east], ['him', 0.45, -1.2, east]]
            : [['her', 0.45, -0.7, T < TB ? fwd : east], ['him', -0.45, -0.75, T < TB ? fwd : east]];
        const list = spots.map(([who, x, z, f]) => { const feet = W(ps, [x, FLOOR(), z]); return { who, x, z, f, feet, dep: cam.view(feet)[2] }; });
        list.sort((a, b) => b.dep - a.dep);
        for (const it of list) {
            const a = cam.p(it.feet), b = cam.p(W(ps, [it.x, FLOOR() + 1.7, it.z])); if (a[2] < 0.5) continue;
            const tc = [cam.pos[0] - it.feet[0], cam.pos[2] - it.feet[2]], tl = Math.hypot(tc[0], tc[1]) || 1;
            const ang = Math.acos(cap((tc[0] * it.f[0] + tc[1] * it.f[1]) / tl, -1, 1));
            // shot 1 holds the three-quarter view (the angle crosses from front to three-quarter as she gains: one drawing, no pop)
            const view = shot === 0 ? 'tq' : ang < 0.5 ? 'front' : ang < 1.15 ? 'tq' : ang < 2.25 ? 'side' : 'back';
            const h = cam.p([it.feet[0], it.feet[1] + 1.3, it.feet[2]]), hf = cam.p([it.feet[0] + it.f[0] * 0.5, it.feet[1] + 1.3, it.feet[2] + it.f[1] * 0.5]);
            const right = hf[0] > h[0] ? 1 : -1, native = NATIVE[it.who][view];
            const lean = Math.atan2(b[0] - a[0], a[1] - b[1]) + (T < TB ? 0.025 * Song.env('kick', T) * Math.sin(T * 4.1 + (it.who === 'her' ? 0 : 1.3)) : 0);
            Couple.standing(g, cam, it.who, it.feet, { view, flip: native ? native !== right : false, lean, T, d, wind: (it.who === 'her' ? 0.02 : 0.005) * (0.25 + 0.75 * v), sway: Math.sin(T * 1.7 + (it.who === 'her' ? 0 : 1)) * 0.004 });
        }
    }

    // --- the cameras -----------------------------------------------------------------------------
    function camera(shot, T, env) {
        const base = { W: env.W, H: env.H }, ps = pose(T), [a0, b0] = [SHOTS[shot][0], SHOTS[shot][1]], k = io(seg(T, a0, b0));
        switch (shot) {
            case 0: { // a lead boat ahead and to the north, low, looking back: she bursts towards us out of the night, downtown behind her, and gains on us
                const cz = ps.z - 17 + 12 * k, cx = ps.x + 9 - 2.5 * k;
                const pos = [cx, WATER + 1.8 + 0.12 * Math.sin(T * 2.7), cz];
                const yaw = Math.atan2(ps.x - cx, ps.z - cz) + 0.1 + 0.08 * k;
                return Neon.camera({ ...base, pos, yaw, pitch: -0.03, roll: 0.015 * Math.sin(T * 1.9), f: 1000 });
            }
            case 1: { // on a pole off the starboard bow, a long lens looking aft over the foredeck: the two of
                // them from the waist up behind the windscreen, spray over the bow, the city behind
                const W = BoatSpeedboat.W, p = W(ps, [1.25 + 0.1 * k, BoatSpeedboat.deckY(6.0) + 0.8 + 0.04 * k, 6.0 - 0.3 * k]), t = W(ps, [-0.05, 1.78, -0.7]);
                const dx = t[0] - p[0], dy = t[1] - p[1], dz = t[2] - p[2];
                return Neon.camera({ ...base, pos: p, yaw: Math.atan2(dx, dz), pitch: Math.atan2(dy, Math.hypot(dx, dz)) + 0.035, roll: ps.roll * 0.8, f: 1750 + 80 * k });
            }
            case 2: { // a drone flying backwards ahead of the boat: the wake fans out behind it towards the city
                const pos = [ps.x + 7 - 4 * k, WATER + 24 - 8 * k, ps.z - 30 + 6 * k];
                return Neon.camera({ ...base, pos, yaw: -0.14 + 0.06 * k, pitch: -0.4 + 0.16 * k, roll: 0.02, f: 1000 });
            }
            case 3: { // alongside to the north, low: the boat races the causeway's lamps and pulls away
                const pos = [ps.x + 11, WATER + 3.2 + 0.1 * Math.sin(T * 2.3), ps.z - 4 + 9 * k];
                return Neon.camera({ ...base, pos, yaw: -Math.PI / 2 - 0.1, pitch: -0.1, roll: 0.015 * Math.sin(T * 1.6), f: 1000 });
            }
            case 4: { // behind and above, the chase boat slowing with them: east, the night pales
                const pos = [ps.x - 1.2 + 1.5 * k, WATER + 4.8 + 0.4 * k, ps.z + 13 + 4 * k];
                return Neon.camera({ ...base, pos, yaw: Math.PI + 0.02, pitch: -0.16 + 0.05 * k, roll: 0, f: 1000 });
            }
            case 5: { // close, from the west: the two of them face each other, the dawn between their faces; gold spreads from them
                const pos = [ps.x - 0.8 + 0.25 * (1 - k), WATER + 2.15, ps.z + 5.2 - 0.4 * k];
                return Neon.camera({ ...base, pos, yaw: Math.PI, pitch: -0.12, roll: 0, f: 1350 + 120 * k });
            }
            case 6: { // low on the water: the gold runs out over the sea from the boat
                const pos = [ps.x + 5, WATER + 1.5 + 1.5 * k, ps.z + 24 - 4 * k];
                return Neon.camera({ ...base, pos, yaw: Math.PI + 0.1, pitch: 0.0, roll: 0, f: 1000 });
            }
            case 7: { // very wide, low: the horizon burns brighter on every beat
                const pos = [ps.x - 12, WATER + 2.2, ps.z + 70 - 10 * k];
                return Neon.camera({ ...base, pos, yaw: Math.PI - 0.06, pitch: 0.04, roll: 0, f: 850 + 60 * k });
            }
            case 8: { // behind the two of them across the cockpit: they face the light
                const pos = [ps.x - 0.3, WATER + 2.6, ps.z + 5.6 - 0.6 * k];
                return Neon.camera({ ...base, pos, yaw: Math.PI - 0.05, pitch: -0.02, roll: 0, f: 1100 + 80 * k });
            }
            default: { // low and wide: the sun's rim touches the sea and holds; a slow push
                const pos = [ps.x + 9, WATER + 1.2, ps.z + 26 - 3 * k];
                return Neon.camera({ ...base, pos, yaw: Math.PI, pitch: 0.035, roll: 0, f: 1000 + 120 * k });
            }
        }
    }

    // --- one frame ----------------------------------------------------------------------------
    function draw(g, env, T, d) {
        const N = env.state.N, shot = shotIndex(T + 1 / 24), cam = camera(shot, T, env), fx = effects(T), ps = pose(T);
        ps.gold = fx.goldBoat;
        const A = T < TB;
        // the far world, bloomed before anything near is painted over it
        Ink.occlude(null);
        let L = N.light();
        sky(g, L, cam, T, d, fx, env);
        sunRim(g, L, cam, T, d, fx, env);
        if (A) Drawn.city(g, cam, T, d, { breathe: 0 }, env);
        sea(g, L, cam, T, d, fx, env, ps);
        if (A) glitter(g, L, cam, T, d, fx, env);
        if (A) causeway(g, L, cam, T, d, fx, N); else freighter(g, L, cam, T, d, fx, N);
        gulls(g, cam, T, d, fx, ps);
        N.bloom(g, L, { strength: 0.4 + fx.burn * 0.25 + fx.rim * 0.2, core: 0.55 });
        // the near world: the wake, the gold on the water, the boat with the two of them in it
        L = N.light();
        if (fx.trip > 0.02) N.trails(L, (L2, Tp) => { const c2 = camera(shot, Tp, env), p2 = pose(Tp); navLights(L2, c2, p2, fx); }, T, { n: 6, dt: 1.5 / 24, decay: 0.72, amount: fx.trip * 1.4 });
        wake(g, cam, T, d, ps);
        if (ps.v < 8) BoatSpeedboat.reflection(g, cam, ps, d, { T, alpha: cap(1 - ps.v / 8, 0, 0.85) });
        goldSea(g, L, cam, ps, d, fx);
        Ink.occlude(L);
        const c = BoatSpeedboat.local(ps, cam.pos);
        if (c[2] > -6) BoatSpeedboat.spray(g, cam, ps, T, d, ps.v, 'tail');
        BoatSpeedboat.draw(g, { cam, ps, d, T, L, N, dawn: fx.dawn, halo: fx.halo, gold: fx.goldBoat > 0 ? { x: 0.1, z: -0.8, r: fx.goldBoat * 9 } : null, coupleZ: [-1.45, -0.15], inside: (gg) => {
            // on its own layer, so they hide the light behind them
            const lay = Motion.layer(env, 'boatCouple', (cc) => couple(cc, cam, ps, T, d, shot));
            L.save(); L.setTransform(1, 0, 0, 1, 0, 0); L.globalCompositeOperation = 'destination-out'; L.drawImage(lay, 0, 0); L.restore();
            gg.save(); gg.setTransform(1, 0, 0, 1, 0, 0); gg.drawImage(lay, 0, 0); gg.restore();
        } });
        BoatSpeedboat.spray(g, cam, ps, T, d, ps.v, 'over');
        BoatSpeedboat.spray(g, cam, ps, T, d, ps.v, 'bow');
        waterline(g, cam, ps, T, d);
        if (c[2] <= -6) BoatSpeedboat.spray(g, cam, ps, T, d, ps.v, 'tail');
        Ink.occlude(null);
        N.bloom(g, L, { strength: 0.4 + fx.goldBoat * 0.2, core: 0.55 });
        return fx;
    }
    // at speed the hull cuts the water in a seam of foam along its sides
    function waterline(g, cam, ps, T, d) {
        const k = cap((ps.v - 4) / 20, 0, 1); if (k <= 0) return;
        const c = BoatSpeedboat.local(ps, cam.pos), at = BoatSpeedboat.at, CB = BoatSpeedboat.CB;
        for (const sd of [-1, 1]) {
            if (c[0] * sd < 1.3) continue;
            for (let i = 0; i < 16; i++) {
                const z = -5.8 + i * 0.62 + (Ink.hsh(i, sd, 0) - 0.5) * 0.4, wz = BoatSpeedboat.W(ps, [sd * (at(CB, Math.min(z, 3)) + 0.05), 0, z]);
                const A = cam.p([wz[0], WATER + 0.03, wz[2]]), Bq = cam.p(BoatSpeedboat.W(ps, [sd * (at(CB, Math.min(z, 3)) + 0.25), 0, z - 0.9])); if (A[2] < 1) continue;
                const s = cam.f / A[2];
                Ink.brush(g, [[A[0], A[1]], [Bq[0], A[1] + 1]], { w: cap(0.09 * s, 1, 6), col: [P.cream, '#ffc8ee', P.cyan][i % 3], seed: 1600 + i + sd * 40, d, taper: 0.4, alpha: 0.9 * k, light: true });
            }
        }
    }

    // the boat's lights alone (for the trip's tracers in bridge A)
    function navLights(L2, cam, ps, fx) {
        for (const [p, col] of [[[-1.0, 1.25, 3.3], P.red], [[1.0, 1.25, 3.3], P.mint], [[0, 1.95, -5.4], P.pink]]) {
            const q = cam.p(BoatSpeedboat.W(ps, p)); if (q[2] < 0.5) continue;
            const s = cam.f / q[2]; L2.fillStyle = col; L2.beginPath(); L2.arc(q[0], q[1], cap(0.3 * s, 2, 18), 0, Math.PI * 2); L2.fill();
        }
    }

    Sections.boat = {
        from: FROM, to: TO, shots: SHOTS,
        async setup(env) { return {}; },
        draw(g, env, T, d) { return draw(g, env, T, d); },
        // for the next section's first frame: where the sun stands at the end of this one
        sunAt(env, T = TO - 1 / 24) { const cam = camera(SHOTS.length - 1, T, env); return { centre: skyP(cam, SUN_A, 0), radius: SUN_R }; },
    };
})();
