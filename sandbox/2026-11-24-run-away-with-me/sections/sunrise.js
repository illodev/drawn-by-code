// uses: set/sunrise-beach.js
// Section · the sunrise, 3:18–4:13 (bar 98 to the end): the final chorus, the outro, the last
// hit and the silence. On the drop the striped sun comes out of the Atlantic; they run across
// the sand into the water; on each «when the lights go out» a row of Ocean Drive's neon dies
// because it is day; the outro rises away until they are small in the gold; the title lands
// on the last hit and the signature lights in the silence. World: set/sunrise-beach.js.
// Contract: sections/README.md.
(() => {
    const S = () => SunriseSet;
    const B = (n) => 0.415 + n * 2.01672;
    const HIT = 246.47, SIGN = 250.55, END = 253.5;
    const SHOTS = [
        [B(98), B(100), '1 · the sun comes out of the sea'],
        [B(100), B(102), '2 · they run down to the water'],
        [B(102), B(105), '3 · the lights go out on Ocean Drive'],
        [B(105), B(107), '4 · into the water'],
        [B(107), B(109), '5 · the wave takes the shoes'],
        [B(109), B(111), '6 · from the sea, the two of them'],
        [B(111), B(114), '7 · the lights go out again'],
        [B(114), B(122), '8 · run away: the long rise'],
        [B(122), END, '9 · the title, the signature'],
    ];
    const shotIndex = (T) => { const i = SHOTS.findIndex(([a, b]) => T >= a && T < b); return i < 0 ? (T < SHOTS[0][0] ? 0 : SHOTS.length - 1) : i; };
    const seg = (T, a, b) => Ease.seg(T, a, b), io = (x) => Ease.inOut(x);

    // where they stand (feet, metres) at song second T: watching the sun up the sand, running
    // down to the water, shoes off, wading out, standing in the gold
    function zOf(T) {
        if (T < B(100)) return -14;
        if (T < 205.4) { const u = seg(T, B(100) + 0.1, 205.4); return -14 + 10.6 * (u < 0.1 ? u * u / 0.2 : u - 0.05) / 0.95; }
        if (T < B(105)) return -3.4 + 0.4 * io(seg(T, 205.4, B(105)));
        if (T < 216.0) return -3.0 + 6.6 * io(seg(T, B(105), 216.0));
        if (T < B(114)) return 3.6 + 1.8 * io(seg(T, 216.0, B(114)));
        return 5.4 + 1.6 * io(seg(T, B(114), END));
    }
    const XOF = { him: -0.6, her: 0.6 };
    const SHOES = [0.15, -3.85];
    // footprints from where they stood to where they kicked their shoes off
    function prints(T) {
        const z = Math.min(zOf(T), -3.3), out = [];
        // the way they came down the beach in the dark, to where they stood for the sun
        for (const who of ['him', 'her']) for (let k = 0, zz = -64; zz < -14.6; k++, zz += 0.72) out.push([XOF[who] * 0.8 + 0.25 * Math.sin(zz * 0.09) + (k % 2 ? 0.1 : -0.1), zz + (who === 'her' ? 0.3 : 0)]);
        if (z <= -13.9) return out;
        for (const who of ['him', 'her']) for (let k = 0, zz = -13.6; zz < z; k++, zz += 0.78) out.push([XOF[who] + (k % 2 ? 0.11 : -0.11), zz + (who === 'her' ? 0.3 : 0)]);
        return out;
    }

    function cam(o, env) { const c = Neon.camera({ W: env.W, H: env.H, ...o }); c.yaw = o.yaw ?? 0; return c; }
    function camera(shot, T, env) {
        const u = (i) => io(seg(T, SHOTS[i][0], SHOTS[i][1]));
        switch (shot) {
            case 0: { // low on the sand behind them, a long lens: the sun comes up between them
                const k = u(0);
                return cam({ pos: [0.12, 1.55, -50 + k * 3.5], yaw: 0.002 * Math.sin(T * 1.3), pitch: 0.085, roll: 0.003 * Math.sin(T * 0.9), f: 2100 + k * 120 }, env);
            }
            case 1: { // beside them as they run, low behind the sea oats, looking down the beach
                const z = zOf(T) - 1.6;
                return cam({ pos: [12.5, 0.8, z], yaw: -Math.PI / 2 + 0.17, pitch: 0.025, roll: 0.006 * Math.sin(T * 5.1), f: 1250 }, env);
            }
            case 2: { // on the sand looking back at Ocean Drive, tracking along the hotels
                const k = u(2);
                return cam({ pos: [-24 + k * 20, 1.45, -49.5], yaw: Math.PI - 0.04 + k * 0.05, pitch: 0.13, roll: 0, f: 1000 }, env);
            }
            case 3: { // behind them at the water, the sun ahead: they wade in
                const k = u(3);
                return cam({ pos: [0.25, 1.35, -12.5 + k * 2.5], yaw: 0.003 * Math.sin(T * 1.1), pitch: 0.03, roll: 0, f: 1700 }, env);
            }
            case 4: { // low over the shoes at the water's edge; the wave runs in
                const k = u(4);
                return cam({ pos: [0.22 + k * 0.1, 0.34 - k * 0.03, -5.25], yaw: 0.05 - k * 0.03, pitch: -0.075, roll: 0, f: 1500 }, env);
            }
            case 5: { // from the sea, looking back at them and the beach
                const k = u(5);
                return cam({ pos: [1.4 - k * 1.8, 1.25 + k * 0.15, 13.5 - k * 1.2], yaw: Math.PI + 0.05 - k * 0.04, pitch: 0.06, roll: 0.004 * Math.sin(T * 1.6), f: 1250 }, env);
            }
            case 6: { // further out: the whole waterfront; the last neon goes
                const k = u(6);
                return cam({ pos: [12 - k * 10, 3.2 + k * 1.5, 44 - k * 5], yaw: Math.PI - 0.08 + k * 0.06, pitch: 0.035, roll: 0, f: 1350 }, env);
            }
            default: { // the long rise away from them over the beach, toward the sun; on into the title
                const k = io(seg(T, B(114), 247.2)), k2 = seg(T, 247.2, END);
                return cam({ pos: [0.15, 1.3 + k * 21 + k2 * 2, -3 - k * 33 - k2 * 2.5], yaw: 0, pitch: 0.04 - k * 0.23 - k2 * 0.01, roll: 0, f: 1500 - k * 350 }, env);
            }
        }
    }
    // how each shot shows them: view, flip, whether they run
    function staging(shot) {
        if (shot === 1) return { view: 'side', run: true };
        if (shot === 5 || shot === 6) return { view: 'front' };
        if (shot === 2) return null;
        return { view: 'back' };
    }

    // the two of them through one layer: silhouetted against the sun by how much the camera
    // faces it, a gold rim on the edges that face it, the water cutting them at its depth,
    // rings of foam where they stand in it
    function couple(g, L, env, cam, T, d, st) {
        const fe = S().facing(cam), z = zOf(T), dep = S().depthAt(z);
        const who2 = ['him', 'her'].sort((a, b) => cam.view([XOF[b], 1, z])[2] - cam.view([XOF[a], 1, z])[2]);
        const runPh = st.run ? (T - B(100)) * 3 * Math.PI : 0, running = st.run && T < 205.4;
        const F = Motion.layer(env, 'sunriseFig', (c) => {
            for (const who of who2) {
                const ph = runPh + (who === 'her' ? 1.7 : 0), bob = running ? Math.abs(Math.sin(ph)) * 0.07 : 0;
                const dz = st.view === 'side' && who === 'him' ? 1.5 : 0;
                Couple.standing(c, cam, who, [XOF[who], -dep + bob, z + dz], { view: st.view, flip: st.view === 'side' && who === 'him', lean: running ? 0.1 : 0, sway: Math.sin(T * 1.3 + (who === 'her' ? 1 : 0)) * 0.01, T, d, cut: Couple.HEIGHT[who] - dep + (dep > 0 ? 0.04 : 0.02), wind: who === 'her' ? 0.008 : 0.003 });
            }
        });
        const k = env.k, sil = Math.min(0.9, fe * 0.95);
        const fc = F.getContext('2d');
        if (sil > 0.02) { fc.save(); fc.setTransform(1, 0, 0, 1, 0, 0); fc.globalCompositeOperation = 'source-atop'; fc.globalAlpha = sil; fc.fillStyle = '#24083e'; fc.fillRect(0, 0, F.width, F.height); fc.restore(); }
        // the rim on the side that faces the sun (on screen)
        const head = cam.p([0, 1.4 - dep, z]), sp = S().skyP(cam, 0, S().sunE(T));
        let vx = sp[0] - head[0], vy = sp[1] - head[1]; const vl = Math.hypot(vx, vy) || 1; vx /= vl; vy /= vl;
        if (sp[2] < 1) { vx = 0.6; vy = -0.8; }
        vy = Math.min(vy, -0.6); { const l2 = Math.hypot(vx, vy); vx /= l2; vy /= l2; }
        const w = Math.max(1.5, (fe > 0.5 ? 2.6 : 1.6) * k);
        const Rm = Motion.layer(env, 'sunriseRim', () => {}), rc = Rm.getContext('2d');
        rc.setTransform(1, 0, 0, 1, 0, 0);
        rc.drawImage(F, 0, 0); rc.globalCompositeOperation = 'destination-out'; rc.drawImage(F, -vx * w, -vy * w);
        rc.globalCompositeOperation = 'source-in'; rc.fillStyle = fe > 0.5 ? '#ffc65e' : '#ffe6a0'; rc.fillRect(0, 0, Rm.width, Rm.height);
        rc.globalCompositeOperation = 'source-over';
        // the figures hide the light behind them, then take their place
        L.save(); L.setTransform(1, 0, 0, 1, 0, 0); L.globalCompositeOperation = 'destination-out'; L.drawImage(F, 0, 0);
        L.globalCompositeOperation = 'lighter'; L.globalAlpha = 0.45 * fe; L.drawImage(Rm, 0, 0); L.restore();
        g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(F, 0, 0); g.globalAlpha = 0.5 + 0.5 * fe; g.drawImage(Rm, 0, 0); g.restore();
        // where the water holds them: rings of foam round each waterline; on the wet sand, foam at the ankles
        for (const who of who2) {
            const x = XOF[who], zz = z + (st.view === 'side' && who === 'him' ? 1.5 : 0);
            const c = cam.p([x, 0, zz]); if (c[2] < 0.5) continue;
            const s = cam.f / c[2];
            if (running) for (let k = 0; k < 4; k++) {
                const h = Ink.hsh(k, d, who === 'her' ? 3 : 4), a0 = cam.p([x, 0.05, zz - 0.15]), a1 = cam.p([x, 0.12 + 0.25 * h, zz - 0.4 - 0.5 * h]);
                Ink.brush(g, [[a0[0], a0[1]], [a1[0], a1[1]]], { w: Math.max(1, Math.min(4, 0.025 * s)), col: k % 2 ? '#ffd6a0' : '#f8a0a0', seed: 9450 + k + (who === 'her' ? 9 : 0), d, taper: 0.6, alpha: 0.85 });
            }
            if (dep > 0.05 || (zz > -2.6 && T >= B(105))) {
                for (const [r, a, sd] of [[0.26, 1, 0], [0.48, 0.65, 1]]) {
                    const pts = []; for (let i = 0; i <= 22; i++) { const an = Math.PI * (i / 22); pts.push(cam.p([x + Math.cos(an) * r * (1 + 0.1 * Math.sin(T * 3 + i)), 0.01, zz - Math.sin(an) * r * 0.6])); }
                    for (let i = 0; i + 3 < pts.length; i += 3) {
                        if (Ink.hsh(i, sd, 7) < 0.2) continue;
                        const seg2 = pts.slice(i, i + 4).map((p) => [p[0], p[1]]);
                        Ink.brush(g, seg2, { w: Math.max(1, Math.min(6, 0.04 * s)), col: sd ? '#ffd6ec' : '#fff6fa', seed: 9300 + i + sd * 50 + (who === 'her' ? 7 : 0), d, taper: 0.3, alpha: a, light: true });
                    }
                    const front = []; for (let i = 0; i <= 12; i++) { const an = Math.PI + Math.PI * (i / 12); front.push(cam.p([x + Math.cos(an) * r, 0.01, zz - Math.sin(an) * r * 0.6])); }
                    Ink.brush(g, front.map((p) => [p[0], p[1]]), { w: Math.max(1, Math.min(5, 0.03 * s)), col: '#fff6fa', seed: 9400 + sd * 50 + (who === 'her' ? 7 : 0), d, taper: 0.3, alpha: a * 0.8, light: true });
                }
            }
        }
    }

    // --- the title and the signature ----------------------------------------------------
    // the film's lettering (Shrikhand): a block shadow in ink, a thick ink line, flat bands of
    // the sun's inks, strokes of light, and a neon tube along every letter's edge
    function lettering(g, L, env, T, d, text, o) {
        const u = T - o.at; if (u < 0) return;
        g.save(); g.font = `${o.size}px Shrikhand`; g.textBaseline = 'alphabetic';
        const full = g.measureText(text).width, sc = Math.min(1, o.maxW / full), size = o.size * sc;
        g.font = `${size}px Shrikhand`;
        const total = g.measureText(text).width, x0 = env.W / 2 - total / 2, y = o.y;
        const L8 = [];
        for (let i = 0; i < text.length; i++) {
            const ch = text[i]; if (ch === ' ') continue;
            const xi = x0 + g.measureText(text.slice(0, i)).width, wi = g.measureText(ch).width;
            const tl = u - i * (o.stagger ?? 0.016), land = Ease.out(seg(tl, 0, 0.18));
            if (tl < 0) continue;
            const dy = -o.drop * (1 - land) + Math.sin(seg(tl, 0.18, 0.36) * Math.PI) * size * 0.04;
            const rot = (Ink.hsh(i, 3, d) - 0.5) * 0.02 + (1 - land) * (i % 2 ? 0.12 : -0.12);
            L8.push({ ch, cx: xi + wi / 2, y: y + dy, rot, a: seg(tl, 0, 0.06), jx: (Ink.hsh(i, 1, d) - 0.5) * 1.2, jy: (Ink.hsh(i, 2, d) - 0.5) * 1.2 });
        }
        const each = (c, fn) => { for (const l of L8) { c.save(); c.translate(l.cx + l.jx, l.y + l.jy); c.rotate(l.rot); c.globalAlpha = l.a; c.font = `${size}px Shrikhand`; c.textAlign = 'center'; fn(c, l); c.restore(); } };
        g.lineJoin = 'round'; g.lineCap = 'round';
        // block shadow, then the ink line
        each(g, (c, l) => { c.fillStyle = '#1a0440'; const n = Math.round(size * 0.05); for (let e = n; e >= 1; e--) c.fillText(l.ch, e * 0.8, e * 1.0); });
        each(g, (c, l) => { c.strokeStyle = Ink.PAL.ink; c.lineWidth = size * 0.075; c.strokeText(l.ch, 0, 0); });
        // the fill in the sun's bands, with strokes of light laid on it, through its own layer
        const Fl = Motion.layer(env, 'sunriseLetters', () => {});
        const fc = Fl.getContext('2d');
        each(fc, (cc, l) => { const gr = cc.createLinearGradient(0, -size * 0.78, 0, size * 0.05); for (const [a, b, col] of o.bands) { gr.addColorStop(a, col); gr.addColorStop(b, col); } cc.fillStyle = gr; cc.fillText(l.ch, 0, 0); });
        fc.save(); fc.globalCompositeOperation = 'source-atop';
        Ink.strokes(fc, x0, y - size * 0.75, total, size * 0.32, { ang: -0.35, spread: 0.2, count: Math.round(total / 26), len: size * 0.22, w: Math.max(2, size * 0.022), cols: o.light, seed: o.seed, d, alpha: 0.85 });
        fc.restore();
        g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(Fl, 0, 0); g.restore();
        // the tube along each letter's edge, struck on the hit, glowing less as the sound decays
        const on = o.on(u), C = Neon.hex(o.tube);
        if (on > 0.01) {
            each(g, (c, l) => { c.strokeStyle = Neon.css(Neon.mix(C, [255, 255, 255], 0.25)); c.globalAlpha *= on; c.lineWidth = Math.max(2, size * 0.028); c.strokeText(l.ch, 0, 0); c.strokeStyle = Neon.css(Neon.mix(C, [255, 255, 255], 0.85)); c.lineWidth = Math.max(1, size * 0.01); c.strokeText(l.ch, 0, 0); });
            each(L, (c, l) => { c.strokeStyle = Neon.css(C); c.globalAlpha *= on * 0.9; c.lineWidth = Math.max(3, size * 0.05); c.strokeText(l.ch, 0, 0); });
        }
        g.restore();
    }
    const flick = (u, at) => { if (u < at) return 0; const k = Math.floor((u - at) * 12 + 1e-6); return [0.45, 0, 1, 0.6, 1][Math.min(4, k)]; };

    Sections.sunrise = {
        from: B(98), to: END, shots: SHOTS,
        async setup(env) { return { ready: true }; },
        draw(g, env, T, d) {
            const N = env.state.N, shot = shotIndex(T + 1 / 24), c = camera(shot, T, env), set = S();
            // the far world: sky, sun, sea, with their own light, bloomed before anything near
            Ink.occlude(null);
            let L = N.light();
            set.sky(g, L, c, T, d, env);
            set.sea(g, L, c, T, d, env);
            N.bloom(g, L, { strength: 0.4, core: 0.3 });
            // the near world: every opaque thing hides the light behind it
            L = N.light();
            Ink.occlude(L);
            const XR = [[-70, 70], [-160, 14], [-200, 200], [-40, 40], [-8, 8], [-70, 70], [-160, 160], [-150, 150], [-150, 150]][shot];
            set.ground(g, L, c, T, d, env, { prints: prints(T), xr: XR });
            const list = set.items(g, L, c, T, d, env).filter((it) => it.depth > 2.5);
            const st = staging(shot);
            if (st) list.push({ depth: c.view([0, 1, zOf(T)])[2], draw: () => couple(g, L, env, c, T, d, st) });
            if (T >= B(102)) {
                const drift = 0.75 * io(seg(T, B(107) + 1.3, B(107) + 3.0));
                let wet = 0; const n0 = Math.floor((T - Song.bar0) / (Song.beat * 4));
                for (const n of [n0 - 1, n0]) { const sw = set.swashAt(n, T); if (sw) wet = Math.max(wet, Math.min(1, (sw.run + SHOES[1]) / 0.35)); }
                list.push({ depth: c.view([SHOES[0], 0.05, SHOES[1]])[2], draw: () => set.shoes(g, c, T, d, SHOES, drift, wet) });
            }
            if (shot === 0) for (const [x, z, sc, sd] of [[-3.6, -46.2, 1.2, 801], [-2.2, -45.4, 0.8, 802], [3.9, -45.8, 1.1, 803], [5.2, -44.6, 0.9, 804]]) list.push({ depth: c.view([x, 0.5, z])[2], draw: () => set.grass(g, c, x, z, sc, sd, T, d, set.facing(c)) });
            // the sea oats they run behind
            if (shot === 1) for (let i = 0; i < 46; i += 2) {
                const x = 8.4 + Ink.hsh(i, 1, 0) * 2.8, z = -22 + i * 0.5 + Ink.hsh(i, 2, 0) * 0.6, sc = 0.8 + Ink.hsh(i, 3, 0) * 0.45;
                list.push({ depth: c.view([x, 0.5, z])[2], draw: () => set.grass(g, c, x, z, sc, 700 + i, T, d, set.facing(c)) });
            }
            list.sort((a, b) => b.depth - a.depth);
            for (const it of list) it.draw();
            Ink.occlude(null);
            N.bloom(g, L, { strength: 0.32, core: 0.6 });
            // the drop: a flash of gold as the sun breaks the sea
            const fl = Math.max(T >= B(98) ? 0.5 * Math.exp(-(T - B(98)) * 6) : 0, T >= HIT ? 0.45 * Math.exp(-(T - HIT) * 7) : 0);
            if (fl > 0.01) { g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = `rgba(255,190,110,${fl})`; g.fillRect(0, 0, env.W, env.H); g.restore(); }
            // the silence: the world dims under the lettering
            const dim = 0.5 * Ease.inOut(seg(T, 250.3, 253.3));
            if (dim > 0) { g.save(); g.globalAlpha = dim; g.fillStyle = '#0b0230'; g.fillRect(0, 0, env.W, env.H); g.restore(); }
            if (T >= HIT) {
                const L2 = N.light();
                lettering(g, L2, env, T, d, 'RUN AWAY WITH ME', { at: HIT, size: 168, maxW: 1640, y: 610, drop: 70, seed: 9500, tube: Ink.PAL.cyan, light: ['#fffbe0', '#ffe48a'],
                    bands: [[0, 0.36, '#ffd25a'], [0.36, 0.56, '#ffb347'], [0.56, 0.74, '#f98a4a'], [0.74, 0.88, '#f45a7f'], [0.88, 1, '#e106d3']],
                    on: (u) => (u < 0.08 ? 1.4 : 1 - 0.35 * seg(u, 0.5, 4.0)) });
                if (T >= SIGN) lettering(g, L2, env, T, d, 'illodev x Claude', { at: SIGN, size: 76, maxW: 900, y: 770, drop: 0, stagger: 0, seed: 9600, tube: '#ff8ad8', light: ['#fffbe0'],
                    bands: [[0, 1, '#ffe6f6']], on: (u) => flick(u, 0) });
                N.bloom(g, L2, { strength: 0.45, core: 0.5 });
            }
        },
    };
})();
