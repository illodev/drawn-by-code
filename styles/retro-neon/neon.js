// Retro-neon style kit: 1980s Miami at night as an airbrushed illustration lit by neon.
// A frame is two paintings: the picture (flat shapes, airbrushed gradients, a plum line)
// and its LIGHT (everything that emits: tubes, windows, lamps, tail lights, the sun), which
// is added back over the picture and bloomed through a pyramid of small canvases, so that
// every light glows the same way. Sets are built in metres and projected through one camera.
// The hallucinations (tracers, breathing, halos, colour turning, form constants, snow) are
// functions here too, driven by the music's bands from the scene.
// Global: Neon.
//
//   const N = Neon.make(env)                  per scene (in setup)
//   const L = N.light()                       this frame's light layer (logical units, cleared)
//   ... paint the picture on g, the emitters on g AND on L (N.tube, N.glint do both)
//   N.bloom(g, L, { strength })               adds the light and its glow onto g
//   post(ctx) { N.grain(ctx, t) }             grain + vignette in pixels
//
//   Neon.camera({ pos, yaw, pitch, roll, f, W, H }) → cam.p([x, y, z]) = [sx, sy, depth]
//   (x right, y up, z forward; yaw turns right, pitch looks up; f in logical px)
const Neon = (() => {
    // --- palette: measured on the user's references (night sky, tubes, Miami pastels) ----
    const PAL = {
        ink: '#1b0f2e',                          // the plum line of the cast sheets
        night: ['#07051a', '#120a33', '#2a1250', '#5a1a66', '#a8306e'], // zenith → horizon glow
        pink: '#ff3fa4', magenta: '#ff2bd6', cyan: '#2ef2ff', aqua: '#3fffd2', mint: '#7dffb2',
        violet: '#9d5cff', orange: '#ff8a3d', yellow: '#ffe45c', gold: '#ffc94a', red: '#ff2a4a',
        white: '#fff6fb', sodium: '#ffb267',
        deco: { peach: '#f6b7a0', salmon: '#f28a8a', mint: '#8fe3c8', lavender: '#b8a6f0', cream: '#f4ecd8', sky: '#8ed7f2' },
    };

    // --- colour helpers ---------------------------------------------------------------
    const hex = (h) => { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
    const css = (c, a = 1) => `rgba(${Math.round(c[0])},${Math.round(c[1])},${Math.round(c[2])},${a})`;
    const mix = (a, b, u) => { const A = typeof a === 'string' ? hex(a) : a, B = typeof b === 'string' ? hex(b) : b; return [A[0] + (B[0] - A[0]) * u, A[1] + (B[1] - A[1]) * u, A[2] + (B[2] - A[2]) * u]; };
    const rgba = (h, a = 1) => css(typeof h === 'string' ? hex(h) : h, a);
    function toHsl([r, g, b]) {
        r /= 255; g /= 255; b /= 255;
        const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2;
        if (mx === mn) return [0, 0, l];
        const d = mx - mn, s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
        const h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
        return [h * 60, s, l];
    }
    function fromHsl([h, s, l]) {
        h = ((h % 360) + 360) % 360 / 360;
        if (s === 0) return [l * 255, l * 255, l * 255];
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q;
        const f = (t) => { t = (t + 1) % 1; return t < 1 / 6 ? p + (q - p) * 6 * t : t < 1 / 2 ? q : t < 2 / 3 ? p + (q - p) * (2 / 3 - t) * 6 : p; };
        return [f(h + 1 / 3) * 255, f(h) * 255, f(h - 1 / 3) * 255];
    }
    // a colour turned round the wheel (the trip's colour cycling) and pushed in saturation
    const shift = (h, deg = 0, sat = 1) => { const c = toHsl(typeof h === 'string' ? hex(h) : h); return fromHsl([c[0] + deg, Math.min(1, c[1] * sat), c[2]]); };

    // --- camera -------------------------------------------------------------------------
    function camera(o) {
        const [px, py, pz] = o.pos, f = o.f, W = o.W, H = o.H;
        const cy = Math.cos(o.yaw || 0), sy = Math.sin(o.yaw || 0);
        const cp = Math.cos(o.pitch || 0), sp = Math.sin(o.pitch || 0);
        const cr = Math.cos(o.roll || 0), sr = Math.sin(o.roll || 0);
        const cx0 = o.cx ?? W / 2, cy0 = o.cy ?? H / 2;
        // world → camera: translate, yaw about y, pitch about x, roll about z
        function view([x, y, z]) {
            let X = x - px, Y = y - py, Z = z - pz;
            let x1 = cy * X - sy * Z, z1 = sy * X + cy * Z;
            let y2 = cp * Y - sp * z1, z2 = sp * Y + cp * z1;
            const x3 = cr * x1 + sr * y2, y3 = -sr * x1 + cr * y2;
            return [x3, y2 === y2 ? y3 : 0, z2];
        }
        const p = (P) => { const [X, Y, Z] = view(P); const z = Math.max(Z, 0.01); return [cx0 + f * X / z, cy0 - f * Y / z, Z]; };
        return { p, view, f, W, H, pos: o.pos, near: 0.3, roll: o.roll || 0 };
    }
    // a polygon in the world, clipped against the near plane, as screen points (or null)
    function poly(cam, pts) {
        const V = pts.map(cam.view), out = [], n = cam.near;
        for (let i = 0; i < V.length; i++) {
            const a = V[i], b = V[(i + 1) % V.length];
            if (a[2] >= n) out.push(a);
            if ((a[2] >= n) !== (b[2] >= n)) { const u = (n - a[2]) / (b[2] - a[2]); out.push([a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, n]); }
        }
        if (out.length < 3) return null;
        const cx0 = cam.W / 2, cy0 = cam.H / 2;
        return out.map(([X, Y, Z]) => [cx0 + cam.f * X / Z, cy0 - cam.f * Y / Z]);
    }
    const path = (g, pts, close = true) => { g.beginPath(); pts.forEach((p, i) => (i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]))); if (close) g.closePath(); };

    // --- the scene object ---------------------------------------------------------------
    function make(env) {
        const [PW, PH] = env.px;
        const mk = (w, h) => { const c = document.createElement('canvas'); c.width = Math.max(1, Math.round(w)); c.height = Math.max(1, Math.round(h)); return c; };
        const lightC = mk(PW, PH), lightG = lightC.getContext('2d');
        // the bloom pyramid: halves down to ~1/64 of the frame
        const levels = []; for (let i = 1; i <= 6; i++) levels.push(mk(PW / 2 ** i, PH / 2 ** i));
        const scratch = mk(PW, PH), scratchG = scratch.getContext('2d');
        const k = env.k;

        // a fresh light layer for this frame, in logical units
        function light() {
            lightG.setTransform(1, 0, 0, 1, 0, 0);
            lightG.globalAlpha = 1; lightG.globalCompositeOperation = 'source-over'; lightG.filter = 'none';
            lightG.clearRect(0, 0, PW, PH);
            lightG.setTransform(k, 0, 0, k, 0, 0);
            lightG.globalCompositeOperation = 'lighter';
            lightG.canvas_ = lightC;
            return lightG;
        }
        // add the light to the picture: the light itself (sharp) and its glow. The glow is a
        // pyramid of halvings, summed back up from the smallest at low resolution, so the
        // frame-sized work is two draws: the sharp light and the summed glow.
        // weights: per level, from the sharpest; strength scales the glow; core the sharp light;
        // split: px of chromatic fringe on the glow (red one way, cyan the other)
        const tintC = [mk(PW / 2, PH / 2), mk(PW / 2, PH / 2)];
        function bloom(g, L, o = {}) {
            const strength = o.strength ?? 1, core = o.core ?? 1;
            const W8 = o.weights ?? [0.55, 0.6, 0.55, 0.45, 0.35, 0.3];
            let src = lightC;
            for (let i = 0; i < levels.length; i++) {
                const c = levels[i], cg = c.getContext('2d');
                cg.setTransform(1, 0, 0, 1, 0, 0); cg.globalCompositeOperation = 'source-over'; cg.globalAlpha = 1;
                cg.clearRect(0, 0, c.width, c.height);
                cg.imageSmoothingEnabled = true; cg.imageSmoothingQuality = i === 0 ? 'low' : 'high';
                cg.filter = (window.NOBLUR ? false : i >= 2) ? 'blur(1px)' : 'none';
                cg.drawImage(src, 0, 0, c.width, c.height);
                cg.filter = 'none';
                src = c;
            }
            // sum upwards: level i += level i+1 (already holding everything below it)
            const n = levels.length;
            for (let i = n - 1; i >= 0; i--) {
                const c = levels[i], cg = c.getContext('2d');
                cg.globalCompositeOperation = 'source-over';
                cg.globalAlpha = 1;
                // scale this level's own light by its weight: draw it again with copy semantics
                if (i < n - 1) { cg.globalCompositeOperation = 'lighter'; cg.globalAlpha = 1; cg.drawImage(levels[i + 1], 0, 0, c.width, c.height); }
            }
            // the weights are applied as a single gain on the sum (the pyramid already falls off)
            const gain = Math.min(1.6, (W8.reduce((a, b) => a + b, 0) / n) * strength * 0.9);
            g.save();
            g.setTransform(1, 0, 0, 1, 0, 0);
            g.globalCompositeOperation = 'lighter';
            g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'low';
            if (core > 0) { g.globalAlpha = core; g.drawImage(lightC, 0, 0); }
            const glow = levels[0];
            const sp = o.split ?? 0;
            if (sp > 0.3) {
                // chromatic fringe: the glow tinted red and cyan, pushed apart
                for (let j = 0; j < 2; j++) {
                    const tc = tintC[j], tg = tc.getContext('2d');
                    tg.globalCompositeOperation = 'source-over'; tg.globalAlpha = 1; tg.clearRect(0, 0, tc.width, tc.height);
                    tg.drawImage(glow, 0, 0, tc.width, tc.height);
                    tg.globalCompositeOperation = 'multiply'; tg.fillStyle = j ? '#00ffff' : '#ff0000'; tg.fillRect(0, 0, tc.width, tc.height);
                    tg.globalCompositeOperation = 'destination-in'; tg.drawImage(glow, 0, 0, tc.width, tc.height);
                    g.globalAlpha = Math.min(1, gain);
                    g.drawImage(tc, (j ? -1 : 1) * sp * k, 0, PW, PH);
                }
            } else {
                g.globalAlpha = Math.min(1, gain);
                g.drawImage(glow, 0, 0, PW, PH);
                if (gain > 1) { g.globalAlpha = gain - 1; g.drawImage(glow, 0, 0, PW, PH); }
            }
            g.restore();
        }

        // a neon tube: a path stroked as a coloured body with a white-hot core, on the
        // picture and on the light. w in logical units; on: 0..1 (a tube striking or failing)
        function tube(g, L, draw, col, w = 4, o = {}) {
            const on = o.on ?? 1; if (on <= 0) return;
            const C = typeof col === 'string' ? hex(col) : col;
            const coreC = mix(C, [255, 255, 255], o.white ?? 0.7);
            for (const [ctx, lit] of [[g, false], [L, true]]) {
                if (!ctx) continue;
                ctx.save();
                ctx.lineCap = 'round'; ctx.lineJoin = 'round';
                draw(ctx);
                ctx.globalAlpha = (lit ? 0.9 : 1) * on;
                ctx.strokeStyle = css(lit ? C : mix(C, [255, 255, 255], 0.15)); ctx.lineWidth = w; ctx.stroke();
                ctx.globalAlpha = on;
                ctx.strokeStyle = css(coreC); ctx.lineWidth = w * 0.42; ctx.stroke();
                ctx.restore();
            }
        }

        // a point of light: core, a soft halo, and (star > 0) a four- or six-point glint like
        // the references' sparkles. r: the halo's radius. Halos grow with the trip (o.halo).
        function glint(g, L, x, y, r, col, o = {}) {
            const C = typeof col === 'string' ? hex(col) : col, a = o.alpha ?? 1;
            const dst = o.lightOnly ? [L] : [g, L];
            for (const ctx of dst) {
                if (!ctx) continue;
                ctx.save();
                const hr = r * (o.halo ?? 1);
                const gr = ctx.createRadialGradient(x, y, 0, x, y, hr);
                gr.addColorStop(0, css(mix(C, [255, 255, 255], 0.85), a));
                gr.addColorStop(0.12, css(mix(C, [255, 255, 255], 0.35), a * 0.9));
                gr.addColorStop(0.35, css(C, a * 0.35));
                gr.addColorStop(1, css(C, 0));
                ctx.fillStyle = gr;
                ctx.beginPath(); ctx.arc(x, y, hr, 0, Math.PI * 2); ctx.fill();
                if ((o.star ?? 0) > 0) {
                    const rays = o.rays ?? 4, len = r * (o.starLen ?? 3) * o.star, rot = o.rot ?? 0;
                    for (let i = 0; i < rays; i++) {
                        const ang = rot + (i * Math.PI * 2) / rays, wdt = r * 0.09 * (i % 2 ? 0.6 : 1);
                        const l2 = len * (i % 2 && rays > 4 ? 0.55 : 1);
                        const ex = Math.cos(ang) * l2, ey = Math.sin(ang) * l2, nx = -Math.sin(ang) * wdt, ny = Math.cos(ang) * wdt;
                        const lg = ctx.createLinearGradient(x, y, x + ex, y + ey);
                        lg.addColorStop(0, css(mix(C, [255, 255, 255], 0.8), a));
                        lg.addColorStop(1, css(C, 0));
                        ctx.fillStyle = lg;
                        ctx.beginPath(); ctx.moveTo(x + nx, y + ny); ctx.lineTo(x + ex, y + ey); ctx.lineTo(x - nx, y - ny); ctx.closePath(); ctx.fill();
                    }
                }
                ctx.restore();
            }
        }

        // the night sky: an airbrushed gradient from the zenith to the city's glow, with stars
        function sky(g, y0, y1, o = {}) {
            const P = o.stops ?? PAL.night;
            const gr = g.createLinearGradient(0, y0, 0, y1);
            P.forEach((c, i) => gr.addColorStop(i / (P.length - 1), c));
            g.fillStyle = gr; g.fillRect(-50, y0 - 2, env.W + 100, y1 - y0 + 4);
            if (o.stars) {
                const R = Motion.rng(o.seed ?? 'stars');
                for (let i = 0; i < o.stars; i++) {
                    const x = R() * env.W, y = y0 + (y1 - y0) * Math.pow(R(), 1.8) * 0.8, s = 0.6 + R() * 1.6;
                    const tw = 0.6 + 0.4 * Math.sin((o.t ?? 0) * (1 + R() * 3) + R() * 6);
                    g.fillStyle = rgba(PAL.white, (0.35 + R() * 0.5) * tw);
                    g.beginPath(); g.arc(x + (o.dx ?? 0) % env.W, y + (o.dy ?? 0), s, 0, Math.PI * 2); g.fill();
                }
            }
        }

        // water: the canvas above the line y0 (in pixels, from a layer) mirrored below it,
        // broken into rows that ripple sideways and stretch, darkened towards the viewer.
        // src: a canvas at output size; y0: the waterline (logical); o: { amp, t, dark, rows }
        function reflect(g, src, y0, y1, o = {}) {
            const rows = o.rows ?? 90, t = o.t ?? 0, amp = o.amp ?? 6, stretch = o.stretch ?? 1.6;
            g.save();
            g.setTransform(1, 0, 0, 1, 0, 0);
            const Y0 = y0 * k, Y1 = y1 * k, Hh = Y1 - Y0;
            for (let i = 0; i < rows; i++) {
                const a = i / rows, b = (i + 1) / rows;
                const dy0 = Y0 + Hh * a * a, dy1 = Y0 + Hh * b * b;        // rows get taller nearer
                const sy0 = Y0 - (dy0 - Y0) / stretch, sy1 = Y0 - (dy1 - Y0) / stretch;
                const h = Math.max(1, sy0 - sy1);
                const wob = Math.sin(i * 1.7 + t * 2.3) * amp * k * (0.3 + a) + Math.sin(i * 0.37 - t * 1.1) * amp * k * 0.5;
                g.globalAlpha = (o.alpha ?? 0.75) * (1 - a * (o.fade ?? 0.6));
                g.drawImage(src, 0, Math.max(0, sy1), src.width, h, wob, dy0, src.width, Math.max(1, dy1 - dy0) + 1);
            }
            g.restore();
        }

        // rim light on a cut-out figure: the edge of its silhouette that faces each light,
        // in that light's colour, on the picture and on the light layer.
        // img: an image/canvas with alpha; box: [x, y, w, h] in logical units;
        // lights: [{ dx, dy, col, a }] (dx, dy: the light's direction, in logical units of offset)
        function rim(g, L, img, sx, sy, sw, sh, box, lights) {
            const [x, y, w, h] = box;
            const bw = Math.ceil(w * k) + 8, bh = Math.ceil(h * k) + 8;
            if (scratch.width < bw || scratch.height < bh) { scratch.width = Math.max(scratch.width, bw); scratch.height = Math.max(scratch.height, bh); }
            for (const lt of lights) {
                const G = scratchG;
                G.setTransform(1, 0, 0, 1, 0, 0); G.globalAlpha = 1; G.globalCompositeOperation = 'source-over';
                G.clearRect(0, 0, bw, bh);
                G.drawImage(img, sx, sy, sw, sh, 4, 4, w * k, h * k);
                G.globalCompositeOperation = 'source-in';
                G.fillStyle = rgba(lt.col, 1); G.fillRect(0, 0, bw, bh);
                G.globalCompositeOperation = 'destination-out';
                G.drawImage(img, sx, sy, sw, sh, 4 - lt.dx * k, 4 - lt.dy * k, w * k, h * k);
                for (const ctx of [g, L]) {
                    if (!ctx) continue;
                    ctx.save(); ctx.globalAlpha = lt.a ?? 1;
                    ctx.drawImage(scratch, 0, 0, bw, bh, x - 4 / k, y - 4 / k, bw / k, bh / k);
                    ctx.restore();
                }
            }
        }

        // tint a figure towards the night: a colour multiplied over its own alpha
        function tint(g, img, sx, sy, sw, sh, box, col, a = 0.5) {
            const [x, y, w, h] = box, bw = Math.ceil(w * k) + 2, bh = Math.ceil(h * k) + 2;
            if (scratch.width < bw || scratch.height < bh) { scratch.width = Math.max(scratch.width, bw); scratch.height = Math.max(scratch.height, bh); }
            const G = scratchG;
            G.setTransform(1, 0, 0, 1, 0, 0); G.globalAlpha = 1; G.globalCompositeOperation = 'source-over';
            G.clearRect(0, 0, bw, bh);
            G.drawImage(img, sx, sy, sw, sh, 0, 0, w * k, h * k);
            G.globalCompositeOperation = 'source-atop';
            G.globalAlpha = a; G.fillStyle = rgba(col, 1); G.fillRect(0, 0, bw, bh);
            g.drawImage(scratch, 0, 0, bw, bh, x, y, bw / k, bh / k);
        }

        // --- the trip ---------------------------------------------------------------------
        // tracers: paint(L2, t') the emitters at earlier times, each copy dimmer (decay per
        // copy), added onto the light layer. dt: seconds between copies.
        const trailC = mk(PW / 2, PH / 2), trailG = trailC.getContext('2d');
        function trails(L, paint, t, o = {}) {
            const n = o.n ?? 6, dt = o.dt ?? 1 / 24, decay = o.decay ?? 0.7, amt = o.amount ?? 1;
            if (amt <= 0 || n <= 0) return;
            trailG.setTransform(1, 0, 0, 1, 0, 0); trailG.globalAlpha = 1; trailG.globalCompositeOperation = 'source-over';
            trailG.clearRect(0, 0, trailC.width, trailC.height);
            trailG.setTransform(k / 2, 0, 0, k / 2, 0, 0); trailG.globalCompositeOperation = 'lighter';
            for (let i = 1; i <= n; i++) { trailG.globalAlpha = amt * Math.pow(decay, i); paint(trailG, t - i * dt, i); }
            trailG.globalAlpha = 1;
            L.save(); L.setTransform(1, 0, 0, 1, 0, 0); L.globalCompositeOperation = 'lighter';
            L.drawImage(trailC, 0, 0, PW, PH);
            L.restore();
        }
        // breathing: a layer (canvas at output size) drawn back in horizontal bands that
        // swell and shrink round a centre line, like a surface drawing breath (amp: 0..0.05)
        function breathe(g, src, amp, t, o = {}) {
            const bands = o.bands ?? 48, cy = (o.cy ?? env.H / 2) * k;
            g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
            for (let i = 0; i < bands; i++) {
                const y0 = (i / bands) * PH, y1 = ((i + 1) / bands) * PH;
                const s = 1 + amp * (0.6 + 0.4 * Math.sin(i * 0.5 + t * 3.1));
                const d0 = cy + (y0 - cy) * s, d1 = cy + (y1 - cy) * s;
                const wob = Math.sin(i * 0.9 + t * 2.0) * amp * 60 * k;
                g.drawImage(src, 0, y0, PW, y1 - y0, wob - PW * amp * 0.5, d0, PW * (1 + amp), d1 - d0 + 1);
            }
            g.restore();
        }
        // the four geometric forms of hallucination (Klüver): 'tunnel', 'spiral', 'lattice',
        // 'cobweb', drawn as thin light round (cx, cy) up to radius r; a: 0..1; ph: phase
        function form(L, kind, cx, cy, r, ph, col, a = 1, o = {}) {
            if (a <= 0) return;
            const C = typeof col === 'string' ? hex(col) : col, lw = o.w ?? 1.6;
            L.save(); L.lineWidth = lw; L.strokeStyle = css(C, a);
            if (kind === 'tunnel') {
                const n = o.n ?? 14;
                for (let i = 0; i < n; i++) {
                    const u = ((i + ph) % n) / n, rr = r * Math.pow(u, 2.2);
                    L.globalAlpha = a * u; L.beginPath();
                    const sides = o.sides ?? 0;
                    if (sides) { for (let j = 0; j <= sides; j++) { const an = (j / sides) * Math.PI * 2 + (o.rot ?? 0); const px = cx + Math.cos(an) * rr, py = cy + Math.sin(an) * rr * (o.squash ?? 1); j ? L.lineTo(px, py) : L.moveTo(px, py); } }
                    else L.ellipse(cx, cy, rr, rr * (o.squash ?? 1), 0, 0, Math.PI * 2);
                    L.stroke();
                }
            } else if (kind === 'spiral') {
                const arms = o.arms ?? 6;
                for (let j = 0; j < arms; j++) {
                    L.beginPath();
                    for (let s = 0; s <= 80; s++) {
                        const u = s / 80, rr = r * u, an = (j / arms) * Math.PI * 2 + ph + Math.log(1 + u * 9) * (o.twist ?? 2.4);
                        const px = cx + Math.cos(an) * rr, py = cy + Math.sin(an) * rr * (o.squash ?? 1);
                        s ? L.lineTo(px, py) : L.moveTo(px, py);
                    }
                    L.stroke();
                }
            } else if (kind === 'cobweb') {
                const spokes = o.spokes ?? 12, rings = o.rings ?? 7;
                for (let j = 0; j < spokes; j++) { const an = (j / spokes) * Math.PI * 2 + ph * 0.2; L.beginPath(); L.moveTo(cx, cy); L.lineTo(cx + Math.cos(an) * r, cy + Math.sin(an) * r * (o.squash ?? 1)); L.stroke(); }
                for (let i = 1; i <= rings; i++) {
                    const rr = r * ((i + (ph % 1)) / (rings + 1)); L.beginPath();
                    for (let j = 0; j <= spokes; j++) { const an = (j / spokes) * Math.PI * 2 + ph * 0.2, sag = 0.88 + 0.12 * Math.cos(j * 3.1 + i); const px = cx + Math.cos(an) * rr * sag, py = cy + Math.sin(an) * rr * sag * (o.squash ?? 1); j ? L.lineTo(px, py) : L.moveTo(px, py); }
                    L.stroke();
                }
            } else if (kind === 'lattice') {
                const step = o.step ?? r / 8, sw = o.swell ?? 0.15;
                const warp = (x, y) => { const dx = x - cx, dy = y - cy, d = Math.hypot(dx, dy) / r; const s = 1 + sw * Math.sin(d * 6 - ph * 2); return [cx + dx * s, cy + dy * s]; };
                for (let gx = -r; gx <= r; gx += step) { L.beginPath(); for (let gy = -r; gy <= r; gy += step / 4) { const p = warp(cx + gx, cy + gy); gy === -r ? L.moveTo(p[0], p[1]) : L.lineTo(p[0], p[1]); } L.stroke(); }
                for (let gy = -r; gy <= r; gy += step) { L.beginPath(); for (let gx = -r; gx <= r; gx += step / 4) { const p = warp(cx + gx, cy + gy); gx === -r ? L.moveTo(p[0], p[1]) : L.lineTo(p[0], p[1]); } L.stroke(); }
            }
            L.restore();
        }
        // visual snow: fine sparkles that change every frame (frame-seeded on purpose)
        function snow(L, frame, n, col, a = 1, box = null) {
            const R = Motion.rng('snow' + frame), [x0, y0, w, h] = box ?? [0, 0, env.W, env.H];
            L.save(); L.fillStyle = rgba(col, a);
            for (let i = 0; i < n; i++) { const s = 0.6 + R() * 1.4; L.fillRect(x0 + R() * w, y0 + R() * h, s, s); }
            L.restore();
        }
        // chromatic split of the whole frame (pixels): red one way, cyan the other
        const splitC = mk(PW, PH), splitG = splitC.getContext('2d');
        function split(ctx, amt) {
            if (amt <= 0.05) return;
            const c = ctx.canvas;
            for (const [col, dx] of [['#ff0000', amt], ['#00ffff', -amt]]) {
                splitG.setTransform(1, 0, 0, 1, 0, 0); splitG.globalCompositeOperation = 'source-over'; splitG.globalAlpha = 1;
                splitG.clearRect(0, 0, PW, PH);
                splitG.drawImage(c, 0, 0);
                splitG.globalCompositeOperation = 'multiply'; splitG.fillStyle = col; splitG.fillRect(0, 0, PW, PH);
                ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = 0.5;
                ctx.drawImage(splitC, dx * k, 0); ctx.restore();
            }
        }

        // grain and vignette (pixels): a cached noise tile placed per frame
        const grainC = mk(256, 256);
        { const G = grainC.getContext('2d'), im = G.createImageData(256, 256), R = Motion.rng('grain');
          for (let i = 0; i < im.data.length; i += 4) { const v = R(); const on = v > 0.5; im.data[i] = im.data[i + 1] = im.data[i + 2] = on ? 255 : 0; im.data[i + 3] = Math.round(Math.abs(v - 0.5) * 2 * 255); }
          G.putImageData(im, 0, 0); }
        function grain(ctx, t, o = {}) {
            const fr = Math.round(t * env.fps), R = Motion.rng('g' + fr);
            ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = (o.amount ?? 0.07) * 0.6;
            const ox = Math.floor(R() * 256), oy = Math.floor(R() * 256);
            for (let y = -oy; y < PH; y += 256) for (let x = -ox; x < PW; x += 256) ctx.drawImage(grainC, x, y);
            ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
            const v = o.vignette ?? 0.45;
            if (v > 0) {
                const gr = ctx.createRadialGradient(PW / 2, PH / 2, PH * 0.35, PW / 2, PH / 2, PH * 0.95);
                gr.addColorStop(0, 'rgba(7,5,26,0)'); gr.addColorStop(1, `rgba(7,5,26,${v})`);
                ctx.fillStyle = gr; ctx.fillRect(0, 0, PW, PH);
            }
            ctx.restore();
        }

        const api = { light, bloom, tube, glint, sky, reflect, rim, tint, trails, breathe, form, snow, split, grain, mk, k };
        Neon.last = api;                                 // for profiling tools
        return api;
    }

    // load an image in setup (await Neon.image(path)); null when missing (private files)
    const image = (src) => new Promise((ok) => { const im = new Image(); im.onload = () => ok(im); im.onerror = () => ok(null); im.src = '../' + src; });

    return { PAL, hex, css, mix, rgba, shift, camera, poly, path, make, image };
})();
