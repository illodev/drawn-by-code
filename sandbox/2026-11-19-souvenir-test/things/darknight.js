// The things of picture 5, «En una noche oscura» (tableaux/darknight.js), in a manner of their
// own: the brush manner lit by flames. Nothing here is lit from the top left: every sheet is
// painted as a G-buffer (albedo, normal, bump, material, air) and then lit per pixel by the
// picture's flames as point lights in depth, warm, falling off fast, over a faint violet-blue
// ambient. So what is near a flame glows and everything else is drawing in dark colours: the
// grain, the chasing, the weave are all there, only lit by almost nothing.
// Global: Night. Units are the layer's (1 = a logical unit of the 1600 × 900 frame at the
// distance of focus); y grows downwards; a normal's z points at the viewer.
//
//   const P = Night.begin(g)              the buffers, sized and placed like the layer's canvas
//   Night.<thing>(P, { … })               paints a thing into the buffers (see each one)
//   P.light(lights, { amb })              lights the buffers onto g: lights [{ x, y, z, p, r, c }]
//                                         (z: how far IN FRONT of this sheet the flame is)
//   Night.flame(g, x, y, o) / Night.halo  the flames and their glow, painted after, as light
//
// What each thing is, and the small true details painted on it
//
// CIRIO (the long wax candle of the Holy Week candelería, in its candlestick). 1 a shaft a
// little wider at the foot and never quite straight · 2 the well at the top with its rim,
// broken where the wax ran over · 3 runs down the leeward side, each a rounded cord that ends
// in a bead, older ones under newer · 4 faint rings left by the dipping and long scratches
// · 5 snuffed: a charred wick bent over, sometimes a last red ember, and a thread of smoke
// · 6 lit: a pool of liquid wax that shines, the wax translucent for a hand's width under the
// flame · 7 a run that reached the drip pan and spread on it · 8 a moth dead in a pool (one
// candle) · 9 the colour: ivory, yellower towards the top where it has been warmed · 10 a
// chip out of the rim.
//
// CANDELERO (a chased silver candlestick of a paso's candelería). 1 a drip pan (arandela)
// with a gadrooned edge · 2 a socket with a beaded lip · 3 a vase-shaped knop under it · 4 a
// baluster stem with rings · 5 a lower knop · 6 a spreading foot with gadroons (gallones)
// · 7 chased leaves on the socket · 8 tarnish black in every recess, the high points rubbed
// bright · 9 the flames mirrored as small lights on every convex part · 10 wax that fell on
// the pan and the foot.
//
// HUMO (smoke from a wick just put out, and from the thurible). 1 a straight laminar thread
// for the first hand's width · 2 then waves that grow · 3 then the thread folds over and
// rolls into curls · 4 strands that part and braid · 5 it thins and widens as it rises
// · 6 a few strands stay crisp where the rest has gone soft · 7 lit warm where it passes a
// flame, a cold violet-grey away from it · 8 it leans with the draught · 9 each plume its
// own · 10 it fades without an edge.
//
// VELO (the Lenten veil of a cathedral, rent on Holy Wednesday at the words «velum templi
// scissum est»). 1 heavy wool of liturgical violet hanging in folds that deepen downwards
// · 2 rent from the top to the bottom: a slit above and below, gaping in the middle · 3 the
// torn edge stepped along the weave, with frayed weft threads hanging from it · 4 the edges
// rolled back by their own weight · 5 a galloon of gold thread across the top, torn with the
// rest · 6 moth holes · 7 a darn · 8 drops of wax on the cloth · 9 the weave in the light
// · 10 the dye uneven: bluer in the folds, redder where it is worn.
const Night = (() => {
    const S = Souvenir, TAU = Math.PI * 2;
    const clamp = S.clamp, smooth = S.smooth, noise2 = S.noise2, hashI = S.hashI;
    const lerp = (a, b, t) => a + (b - a) * t;
    const hex = (h) => S.hex2rgb(h).map((v) => v / 255);

    // ------------------------------------------------------------------ the buffers
    // P.a albedo (alpha = coverage) · P.n normal (rgb = 128 + 127 n) · P.b bump (grey) ·
    // P.m material (r: specular, g: shininess, b: translucency; g < 12 is velvet) · P.air smoke
    // (rgb: its tint, alpha: its density). All with the layer's transform.
    function begin(g) {
        const T = g.getTransform(), W = g.canvas.width, H = g.canvas.height;
        const mk = (fill) => {
            const c = document.createElement('canvas');
            c.width = W;
            c.height = H;
            const q = c.getContext('2d', { willReadFrequently: true });
            if (fill) {
                q.fillStyle = fill;
                q.fillRect(0, 0, W, H);
            }
            q.setTransform(T);
            return q;
        };
        const P = { g, res: T.a, ox: T.e, oy: T.f, W, H, a: mk(null), n: mk('rgb(128,128,255)'), b: mk('rgb(128,128,128)'), m: mk('rgb(0,128,0)'), air: mk(null), soft: mk(null), fog: mk(null) };
        P.box = { x: -T.e / T.a, y: -T.f / T.a, w: W / T.a, h: H / T.a };
        // the pixels of a box in units, clipped to the canvas
        P.px = (b) => {
            const x0 = Math.max(0, Math.floor(b.x * P.res + P.ox)), y0 = Math.max(0, Math.floor(b.y * P.res + P.oy));
            const x1 = Math.min(W, Math.ceil((b.x + b.w) * P.res + P.ox)), y1 = Math.min(H, Math.ceil((b.y + b.h) * P.res + P.oy));
            return { x0, y0, w: x1 - x0, h: y1 - y0 };
        };
        const scratch = document.createElement('canvas'), sq = scratch.getContext('2d');
        const lay = (q, img, x0, y0, mode) => {
            scratch.width = img.width;
            scratch.height = img.height;
            sq.putImageData(img, 0, 0);
            q.save();
            q.setTransform(1, 0, 0, 1, 0, 0);
            if (mode) q.globalCompositeOperation = mode;
            q.drawImage(scratch, x0, y0);
            q.restore();
        };
        // A thing painted per pixel: fn(ux, uy, o) → coverage 0..1, filling
        //   o.r o.g o.b  albedo 0..1 · o.nx o.ny o.nz  normal · o.h  bump −1..1
        //   o.sp  specular 0..1 · o.sh  shininess 0..1 (velvet below 0.05) · o.tr  translucency
        // `only` limits it to some buffers ('anbm').
        P.solid = (b, fn, only = 'anbm') => {
            const R = P.px(b);
            if (R.w <= 0 || R.h <= 0) return;
            const A = only.includes('a') ? new ImageData(R.w, R.h) : null, N = only.includes('n') ? new ImageData(R.w, R.h) : null;
            const B = only.includes('b') ? new ImageData(R.w, R.h) : null, M = only.includes('m') ? new ImageData(R.w, R.h) : null;
            const o = {};
            for (let y = 0; y < R.h; y++) {
                const uy = (R.y0 + y + 0.5 - P.oy) / P.res;
                for (let x = 0; x < R.w; x++) {
                    const ux = (R.x0 + x + 0.5 - P.ox) / P.res;
                    o.r = o.g = o.b = 0.5;
                    o.nx = o.ny = 0;
                    o.nz = 1;
                    o.h = 0;
                    o.sp = 0;
                    o.sh = 0.5;
                    o.tr = 0;
                    const c = fn(ux, uy, o);
                    if (!(c > 0)) continue;
                    const i = (y * R.w + x) * 4, al = Math.min(255, c * 255);
                    if (A) {
                        A.data[i] = clamp(o.r) * 255;
                        A.data[i + 1] = clamp(o.g) * 255;
                        A.data[i + 2] = clamp(o.b) * 255;
                        A.data[i + 3] = al;
                    }
                    if (N) {
                        const l = Math.hypot(o.nx, o.ny, o.nz) || 1;
                        N.data[i] = 128 + (127 * o.nx) / l;
                        N.data[i + 1] = 128 + (127 * o.ny) / l;
                        N.data[i + 2] = 128 + (127 * o.nz) / l;
                        N.data[i + 3] = al;
                    }
                    if (B) {
                        B.data[i] = B.data[i + 1] = B.data[i + 2] = 128 + 127 * clamp(o.h, -1, 1);
                        B.data[i + 3] = al;
                    }
                    if (M) {
                        M.data[i] = clamp(o.sp) * 255;
                        M.data[i + 1] = clamp(o.sh) * 255;
                        M.data[i + 2] = clamp(o.tr) * 255;
                        M.data[i + 3] = al;
                    }
                }
            }
            if (A) lay(P.a, A, R.x0, R.y0);
            if (N) lay(P.n, N, R.x0, R.y0);
            if (B) lay(P.b, B, R.x0, R.y0);
            if (M) lay(P.m, M, R.x0, R.y0);
        };
        // run the same drawing on several buffers, each with its own style:
        //   P.each({ a: '#fff', n: flat, m: mat(…) }, (q) => { q.beginPath(); … ; q.fill(); })
        P.each = (styles, draw) => {
            for (const k of Object.keys(styles)) {
                const q = P[k];
                q.save();
                q.fillStyle = q.strokeStyle = styles[k];
                draw(q, k);
                q.restore();
            }
        };
        // a shadow cast on the albedo already there (only on paint)
        P.cast = (draw, o = {}) => S.cast(P.a, draw, { blur: 8, dx: 0, dy: 0, color: 'rgba(4,2,10,0.55)', ...o });

        // ------------------------------------------------ the light
        // Each light: { x, y } on this sheet, z how far in front of it (negative: behind), p
        // its power, r the distance at which it has fallen to half, c its colour (0..1).
        P.light = (lights, o = {}) => {
            const amb = o.amb ?? [0.18, 0.16, 0.3], ambAir = o.ambAir ?? [0.12, 0.11, 0.22], wrap = o.wrap ?? 0.3, bk = (o.bump ?? 2.2) / 255;
            const exposure = o.exposure ?? 1;
            const AL = (() => {
                const v = o.ambDir ?? [-0.12, -0.38, 0.92], l = Math.hypot(...v);
                return v.map((c) => c / l);
            })();
            // the soft part of the smoke, blurred once (a filter per stroke costs seconds)
            P.air.save();
            P.air.setTransform(1, 0, 0, 1, 0, 0);
            P.air.filter = `blur(${(o.softBlur ?? 4) * P.res}px)`;
            P.air.drawImage(P.soft.canvas, 0, 0);
            P.air.filter = `blur(${(o.fogBlur ?? 16) * P.res}px)`;
            P.air.drawImage(P.fog.canvas, 0, 0);
            P.air.restore();
            const Ad = P.a.getImageData(0, 0, W, H).data, Nd = P.n.getImageData(0, 0, W, H).data, Bd = P.b.getImageData(0, 0, W, H).data;
            const Md = P.m.getImageData(0, 0, W, H).data, Qd = P.air.getImageData(0, 0, W, H).data;
            const out = P.g.createImageData(W, H), Od = out.data;
            const Ls = lights.map((l) => ({ x: l.x, y: l.y, z: l.z ?? 10, p: l.p ?? 1, r2: (l.r ?? 120) ** 2, cut: (l.r ?? 120) * (l.cut ?? 9), c: l.c ?? [1, 0.62, 0.3], air: l.air ?? 1 }));
            const TS = 32, res = P.res;
            const shoulder = (v) => (v < 0.72 ? v : 0.72 + 0.28 * (1 - Math.exp(-(v - 0.72) / 0.28)));
            for (let ty = 0; ty < H; ty += TS) {
                for (let tx = 0; tx < W; tx += TS) {
                    // the lights that reach this tile
                    const ux0 = (tx - P.ox) / res, uy0 = (ty - P.oy) / res, ux1 = (tx + TS - P.ox) / res, uy1 = (ty + TS - P.oy) / res;
                    const act = Ls.filter((l) => {
                        const dx = Math.max(ux0 - l.x, 0, l.x - ux1), dy = Math.max(uy0 - l.y, 0, l.y - uy1);
                        return Math.hypot(dx, dy, l.z) < l.cut;
                    });
                    const ye = Math.min(H, ty + TS), xe = Math.min(W, tx + TS);
                    for (let y = ty; y < ye; y++) {
                        const uy = (y + 0.5 - P.oy) / res;
                        for (let x = tx; x < xe; x++) {
                            const i = (y * W + x) * 4, as = Ad[i + 3], aq = Qd[i + 3];
                            if (!as && !aq) continue;
                            const ux = (x + 0.5 - P.ox) / res;
                            let cr = 0, cg = 0, cb = 0;
                            if (as) {
                                let nx = (Nd[i] - 128) / 127, ny = (Nd[i + 1] - 128) / 127, nz = (Nd[i + 2] - 128) / 127;
                                // the bump, per unit (whatever the paint resolution)
                                const xl = x > 0 ? i - 4 : i, xr = x < W - 1 ? i + 4 : i, yu = y > 0 ? i - W * 4 : i, yd = y < H - 1 ? i + W * 4 : i;
                                nx -= (Bd[xr] - Bd[xl]) * bk * res;
                                ny -= (Bd[yd] - Bd[yu]) * bk * res;
                                const nl = Math.hypot(nx, ny, nz) || 1;
                                nx /= nl;
                                ny /= nl;
                                nz /= nl;
                                const sp = Md[i] / 255, shb = Md[i + 1], tr = Md[i + 2] / 255, velvet = shb < 12, shin = 4 + (shb / 255) * 140;
                                // the dark has a faint cool side (from the top left, in front), so forms model in it
                                const k = 0.12 + 1.1 * Math.pow(Math.max(0, nx * AL[0] + ny * AL[1] + nz * AL[2]), 1.6);
                                let lr = amb[0] * k, lg = amb[1] * k, lb = amb[2] * k, sr = 0, sg = 0, sb = 0, trr = 0, trg = 0, trb = 0;
                                if (velvet) {
                                    const sh = (1 - nz) * (1 - nz) * 0.9;
                                    lr += amb[0] * sh;
                                    lg += amb[1] * sh;
                                    lb += amb[2] * sh;
                                }
                                for (const l of act) {
                                    const dx = l.x - ux, dy = l.y - uy, dz = l.z, d2 = dx * dx + dy * dy + dz * dz, d = Math.sqrt(d2);
                                    if (d > l.cut) continue;
                                    const f = (l.p / (1 + d2 / l.r2)) * (1 - smooth(l.cut * 0.45, l.cut, d));
                                    const lx = dx / d, ly = dy / d, lz = dz / d, ndl = nx * lx + ny * ly + nz * lz;
                                    let diff = Math.max(0, (ndl + wrap) / (1 + wrap));
                                    if (velvet) diff += (1 - nz) * (1 - nz) * 0.8 * Math.max(0, ndl + 0.5);
                                    lr += l.c[0] * f * diff;
                                    lg += l.c[1] * f * diff;
                                    lb += l.c[2] * f * diff;
                                    if (sp > 0) {
                                        let hx = lx, hy = ly, hz = lz + 1;
                                        const hl = Math.hypot(hx, hy, hz) || 1;
                                        const nh = Math.max(0, (nx * hx + ny * hy + nz * hz) / hl);
                                        const s = sp * f * ((sp > 0.55 ? 0.55 : 0.18) * Math.pow(nh, 6) + (sp > 0.55 ? 0.6 : 0) * Math.pow(nh, 24) + 1.6 * Math.pow(nh, shin));
                                        sr += l.c[0] * s;
                                        sg += l.c[1] * s;
                                        sb += l.c[2] * s;
                                    }
                                    if (tr > 0) {
                                        trr += l.c[0] * f * tr;
                                        trg += l.c[1] * f * tr;
                                        trb += l.c[2] * f * tr;
                                    }
                                }
                                if (sp > 0.55) {
                                    // metal: its rim mirrors the room's faint light, so it reads as metal in the dark
                                    const fr = (1 - nz) * (1 - nz) * sp * 0.8;
                                    sr += amb[0] * fr;
                                    sg += amb[1] * fr;
                                    sb += amb[2] * fr * 1.1;
                                }
                                const ar = Ad[i] / 255, ag = Ad[i + 1] / 255, ab = Ad[i + 2] / 255;
                                cr = ar * (lr + trr * 0.9) + sr;
                                cg = ag * (lg + trg * 0.9) + sg;
                                cb = ab * (lb + trb * 0.9) + sb;
                            }
                            let A = as / 255;
                            if (aq) {
                                // smoke scatters the light round it, no matter which way it faces
                                let lr = ambAir[0], lg = ambAir[1], lb = ambAir[2];
                                for (const l of act) {
                                    const dx = l.x - ux, dy = l.y - uy, d2 = dx * dx + dy * dy + l.z * l.z * 0.5, d = Math.sqrt(d2);
                                    if (d > l.cut) continue;
                                    const f = ((l.p * l.air) / (1 + d2 / l.r2)) * (1 - smooth(l.cut * 0.45, l.cut, d));
                                    lr += l.c[0] * f;
                                    lg += l.c[1] * f;
                                    lb += l.c[2] * f;
                                }
                                const q = aq / 255;
                                const sr = (Qd[i] / 255) * lr * 1.4, sg = (Qd[i + 1] / 255) * lg * 1.4, sb = (Qd[i + 2] / 255) * lb * 1.4;
                                // the smoke over the surface (premultiplied, then back)
                                const Aout = q + A * (1 - q);
                                cr = (sr * q + cr * A * (1 - q)) / Aout;
                                cg = (sg * q + cg * A * (1 - q)) / Aout;
                                cb = (sb * q + cb * A * (1 - q)) / Aout;
                                A = Aout;
                            }
                            Od[i] = shoulder(cr * exposure) * 255;
                            Od[i + 1] = shoulder(cg * exposure) * 255;
                            Od[i + 2] = shoulder(cb * exposure) * 255;
                            Od[i + 3] = A * 255;
                        }
                    }
                }
            }
            P.g.save();
            P.g.setTransform(1, 0, 0, 1, 0, 0);
            const c = document.createElement('canvas');
            c.width = W;
            c.height = H;
            c.getContext('2d').putImageData(out, 0, 0);
            P.g.drawImage(c, 0, 0);
            P.g.restore();
            // the buffers are big: give them back
            for (const k of ['a', 'n', 'b', 'm', 'air', 'soft', 'fog']) P[k].canvas.width = P[k].canvas.height = 0;
        };
        return P;
    }

    // ------------------------------------------------------------------ helpers
    // a profile [[y, r], …] (y increasing) as a function r(y), smooth through its points
    function profile(pts, seg = 10) {
        const d = S.curve(pts, false, seg), y0 = pts[0][0], y1 = pts[pts.length - 1][0], n = 512, tab = new Float32Array(n + 1);
        let j = 0;
        for (let k = 0; k <= n; k++) {
            const y = y0 + ((y1 - y0) * k) / n;
            while (j < d.length - 2 && d[j + 1][0] < y) j++;
            const a = d[j], b = d[j + 1], u = clamp((y - a[0]) / ((b[0] - a[0]) || 1));
            tab[k] = Math.max(0, a[1] + (b[1] - a[1]) * u);
        }
        const at = (y) => {
            if (y < y0 || y > y1) return 0;
            const f = ((y - y0) / (y1 - y0)) * n, i = Math.min(n - 1, Math.floor(f));
            return tab[i] + (tab[i + 1] - tab[i]) * (f - i);
        };
        at.y0 = y0;
        at.y1 = y1;
        at.max = Math.max(...tab);
        return at;
    }
    // the normal of a body of revolution about a vertical axis: s = offset / radius,
    // dr = dR/dy (positive: widening downwards, so the surface looks up)
    const latheN = (o, s, dr) => {
        const c = Math.sqrt(Math.max(0, 1 - s * s)), l = Math.hypot(s, dr * c, c) || 1;
        o.nx = s / l;
        o.ny = (-dr * c) / l;
        o.nz = c / l;
    };
    const smoothBump = (v) => v * v * (3 - 2 * v);

    // ------------------------------------------------------------------ silver
    // chased silver in candlelight: dark, it reads by what it mirrors
    const SILVER = [0.5, 0.5, 0.56];
    function silverAt(o, ux, uy, seed, tarn = 0) {
        const n = noise2(ux * 0.21, uy * 0.21, seed) * 0.5 + noise2(ux * 0.9, uy * 0.9, seed + 3) * 0.25;
        const k = clamp(0.82 + n * 0.35 - tarn * 0.55);
        o.r = SILVER[0] * k;
        o.g = SILVER[1] * k;
        o.b = SILVER[2] * k * (1 + tarn * 0.12);
        o.sp = clamp(0.95 - tarn * 0.7);
        o.sh = 0.72;
    }

    // ------------------------------------------------------------------ the candlestick
    // A chased silver candlestick, its socket's lip at (x, y), `h` tall, for a candle of
    // radius rc. Returns the y of the socket's lip (where the candle stands).
    function candlestick(P, o) {
        const { x, y, rc = 12, h = 150, seed = 'cs' } = o;
        const r = Motion.rng('candlestick' + seed), k = rc / 12;
        const sd = S.seedOf(seed);
        // the profile, down from the lip: lip, drip pan, socket, knop, stem, knop, foot
        const v = (a) => a * (0.92 + r() * 0.16);
        const pts = [
            [0, 15.5], [1.6, 16.5], [3.4, 15.8], [4.6, 30 * v(1)], [6.2, 33 * v(1)], [7.8, 31], [9, 16], [11, 15.4], [20, 14.2], [24, 15.6], [27, 13], [30, 7.4], [34, 6.8],
            [40, 13 * v(1)], [47, 18 * v(1)], [54, 15], [60, 8], [64, 6.2], [70, 7.6], [73, 6], [h * 0.5 / k, 5.6], [h * 0.62 / k, 8.6 * v(1)], [h * 0.66 / k, 6.6], [h * 0.72 / k, 11 * v(1)],
            [h * 0.78 / k, 9], [h * 0.82 / k, 7], [h * 0.86 / k, 12], [h * 0.92 / k, 22 * v(1)], [h * 0.97 / k, 34 * v(1)], [h * 0.99 / k, 36], [h / k, 35],
        ].map(([yy, rr]) => [yy * k, rr * k]);
        const R = profile(pts);
        const H = h;
        // bands of gadroons and chasing: [y0, y1, kind]
        const gad = [[4.4 * k, 8 * k], [36 * k, 56 * k], [H * 0.86, H * 0.99]];
        P.solid({ x: x - R.max - 2, y: y - 1, w: R.max * 2 + 4, h: H + 2 }, (ux, uy, q) => {
            const yy = uy - y, rr = R(yy);
            if (rr <= 0) return 0;
            const s = (ux - x) / rr;
            if (Math.abs(s) >= 1) return 0;
            const cov = clamp((rr - Math.abs(ux - x)) * P.res + 0.5) * clamp((yy) * P.res + 0.5) * clamp((H - yy) * P.res + 0.5);
            const dr = (R(yy + 0.6) - R(yy - 0.6)) / 1.2;
            latheN(q, s, dr);
            // tarnish where the profile turns in (a recess) and towards the outline
            const curv = (R(yy + 1.5) + R(yy - 1.5) - 2 * rr) / 2.25;
            const tarn = clamp(curv * 1.2 + Math.pow(Math.abs(s), 6) * 0.4 + (noise2(ux * 0.08, uy * 0.08, sd) - 0.1) * 0.5);
            silverAt(q, ux, uy, sd, tarn);
            const phi = Math.asin(s);
            for (const [g0, g1] of gad) {
                if (yy > g0 && yy < g1) {
                    // gadroons: lobes round the body, their light running down each
                    const u = (yy - g0) / (g1 - g0), lobe = Math.cos(phi * 7 + sd);
                    q.h += 0.55 * lobe * Math.sin(Math.PI * u);
                    q.r *= 0.92 + 0.08 * lobe;
                }
            }
            // chased leaves on the socket
            if (yy > 10 * k && yy < 24 * k) {
                const u = (yy - 10 * k) / (14 * k), lf = Math.abs(Math.sin(phi * 4 + 0.6)) - u * 0.8;
                q.h += 0.5 * smooth(0.0, 0.25, lf) - 0.25 * smooth(0.25, 0.3, lf) * smooth(0.36, 0.3, lf);
                q.h += 0.2 * Math.sin(u * 40) * smooth(0.1, 0.5, lf);
            }
            // turned rings on the stem
            q.h += 0.25 * Math.sin(yy * 1.7) * smooth(74 * k, 80 * k, yy) * smooth(H * 0.6, H * 0.55, yy);
            // scratches
            q.h += (hashI(Math.round(ux * 3), Math.round(uy * 0.4), 1, sd) - 0.5) * 0.18;
            return cov;
        });
        // wax that fell on the pan and ran over its edge
        const nd = 1 + Math.floor(r() * 3);
        for (let i = 0; i < nd; i++) {
            const dx = (r() - 0.5) * 50 * k, len = (2 + r() * 9) * k;
            wax(P, [[x + dx, y + 4.6 * k], [x + dx * 1.04, y + 5.4 * k + len]], 1.6 * k + r() * 1.2 * k, seed + 'pan' + i, { col: o.wax ?? [0.8, 0.74, 0.6] });
        }
        return y;
    }

    // a run of wax: a rounded cord along `pts` that ends in a bead
    function wax(P, pts, w, seed, o = {}) {
        const line = pts.length > 2 ? S.curve(pts, false, 6) : pts;
        const col = o.col ?? [0.9, 0.84, 0.7];
        const b = S.bbox(line, w * 2 + 2);
        // distance to the polyline, and how far along
        const segs = [];
        let L = 0;
        for (let i = 1; i < line.length; i++) {
            const a = line[i - 1], c = line[i], d = Math.hypot(c[0] - a[0], c[1] - a[1]);
            segs.push([a, c, d, L]);
            L += d;
        }
        const end = line[line.length - 1];
        P.solid(b, (ux, uy, q) => {
            let best = 1e9, along = 0, px = 0, py = 0;
            for (const [a, c, d, l0] of segs) {
                const vx = c[0] - a[0], vy = c[1] - a[1], u = clamp(((ux - a[0]) * vx + (uy - a[1]) * vy) / (d * d || 1));
                const dx = ux - (a[0] + vx * u), dy = uy - (a[1] + vy * u), dd = dx * dx + dy * dy;
                if (dd < best) {
                    best = dd;
                    along = l0 + u * d;
                    px = dx;
                    py = dy;
                }
            }
            const u = along / (L || 1), ww = w * (0.55 + 0.45 * u) * (1 + 0.15 * Math.sin(along * 0.5));
            let dist = Math.sqrt(best), rad = ww, sx, sy, sz;
            // the bead at the end
            const be = Math.hypot(ux - end[0], uy - end[1] - w * 0.3), br = w * 1.35;
            if (be < br && be / br < dist / rad) {
                const t = be / br;
                sx = (ux - end[0]) / br;
                sy = (uy - end[1] - w * 0.3) / br;
                sz = Math.sqrt(Math.max(0, 1 - t * t));
                dist = be;
                rad = br;
            } else {
                if (dist >= rad) return 0;
                // a round cord: the normal turns across it
                const t = dist / rad, pl = dist || 1;
                sx = (px / pl) * t;
                sy = (py / pl) * t;
                sz = Math.sqrt(Math.max(0, 1 - t * t));
            }
            q.nx = sx;
            q.ny = sy;
            q.nz = sz + 0.15;
            q.r = col[0];
            q.g = col[1];
            q.b = col[2];
            q.sp = 0.4;
            q.sh = 0.45;
            q.tr = 0.25;
            q.h = sz * 0.3;
            return clamp((rad - dist) * P.res + 0.5);
        });
    }

    // ------------------------------------------------------------------ the candle
    // A wax candle standing in its socket at (x, y), `len` long, radius r. lit: true for a
    // burning one (returns where its flame stands), false for one put out (its smoke is
    // painted into the air), and `ember` for one put out a moment ago.
    function candle(P, o) {
        const { x, y, len = 300, r = 12, seed = 'c', lit = false } = o;
        const rg = Motion.rng('candle' + seed), sd = S.seedOf(seed);
        const yT = y - len;
        const lee = o.lee ?? (rg() < 0.5 ? -1 : 1);
        // bleached wax (ivory) or the unbleached yellow wax of the Tenebrae candles
        const WX = o.wax ?? [0.88, 0.83, 0.7];
        const R = (yy) => r * (1 + 0.07 * ((yy - yT) / len) + 0.025 * Math.sin(yy * 0.031 + sd) + 0.012 * Math.sin(yy * 0.13 + sd * 2));
        // tall candles bend in the heat of their neighbours
        const lean = (o.bend ?? (len > 300 ? (rg() - 0.5) * 0.02 * len : 0));
        const CX = (yy) => x + r * 0.12 * Math.sin(((yy - yT) / len) * Math.PI + sd) + lean * Math.pow(1 - (yy - yT) / len, 2);
        // the runs: [lateral position (−1..1), length, width, start]
        const runs = [];
        const nr = o.runs ?? 2 + Math.floor(rg() * 4);
        for (let i = 0; i < nr; i++) {
            const s0 = lee * (0.15 + rg() * 0.75) * (rg() < 0.2 ? -1 : 1);
            runs.push({ s0, drift: (rg() - 0.5) * 0.25, L: len * (0.06 + rg() * rg() * 0.7), w: r * (0.14 + rg() * 0.14), old: i < nr / 2 });
        }
        const RIM = r * 0.2, top = yT - RIM;
        const glowLen = lit ? r * 3.2 : 0;
        P.solid({ x: x - r * 1.5, y: top - 3, w: r * 3, h: len + RIM + 6 }, (ux, uy, q) => {
            if (uy > y + 1) return 0;
            const yy = Math.max(yT, uy), rr = R(yy), cx = CX(yy);
            let s = (ux - cx) / rr;
            // the top: the rim seen a little from above, the well inside it
            if (uy < yT) {
                const e = Math.hypot(s, (uy - yT) / RIM);
                const notch = Math.max(0, 1 - Math.abs(s - lee * 0.55) * 4) * 0.5;
                if (e > 1 || (uy - yT) / RIM < -1 + notch) return 0;
                const cov = clamp((1 - e) * rr * P.res + 0.5);
                if (e < 0.78) {
                    // the well
                    q.nx = -s * 0.5;
                    q.ny = 0.2;
                    q.nz = 1;
                    if (lit) {
                        q.r = 0.98;
                        q.g = 0.8;
                        q.b = 0.42;
                        q.sp = 1;
                        q.sh = 0.9;
                        q.tr = 1;
                    } else {
                        q.r = 0.66;
                        q.g = 0.6;
                        q.b = 0.5;
                        q.sp = 0.2;
                        q.tr = 0.3;
                        q.h = (noise2(ux * 0.8, uy * 2, sd) - 0.5) * 0.6;
                    }
                } else {
                    q.nx = s;
                    q.ny = -0.6;
                    q.nz = 0.6;
                    q.r = 0.93;
                    q.g = 0.88;
                    q.b = 0.74;
                    q.tr = lit ? 1 : 0.4;
                    q.sp = 0.4;
                }
                return cov;
            }
            if (Math.abs(s) >= 1) {
                // a run that bulges the outline
                let hit = false;
                for (const rn of runs) {
                    if (Math.abs(rn.s0) > 0.8 && uy - yT < rn.L && Math.sign(s) === Math.sign(rn.s0)) {
                        const out = (Math.abs(ux - cx) - rr) / (rn.w * 0.8);
                        if (out < 1) hit = true;
                    }
                }
                if (!hit) return 0;
                s = Math.sign(s) * 0.99;
            }
            const cov = clamp((rr * 1.08 - Math.abs(ux - cx)) * P.res + 0.5);
            const dr = (R(yy + 1) - R(yy - 1)) / 2;
            latheN(q, s, dr);
            // ivory wax, yellower towards the top, faint dipping rings and scratches
            const warmT = smooth(len * 0.5, 0, uy - yT);
            const n = noise2(ux * 0.05, uy * 0.012, sd) * 0.06 + noise2(ux * 0.6, uy * 0.05, sd + 1) * 0.03;
            q.r = WX[0] + n + warmT * 0.04;
            q.g = WX[1] + n - warmT * 0.02;
            q.b = WX[2] + n - warmT * 0.1;
            if (!lit) {
                // a snuffed candle: the soot of its last flame on the top, a stain down the lee side
                const soot = smooth(r * 2.2, 0, uy - yT) * 0.55 + smooth(r * 9, 0, uy - yT) * smooth(0.2, 0.9, s * lee) * 0.25;
                q.r *= 1 - soot;
                q.g *= 1 - soot;
                q.b *= 1 - soot * 0.9;
            }
            q.sp = 0.32;
            q.sh = 0.35;
            q.tr = lit ? 0.1 + 0.55 * smooth(glowLen, 0, uy - yT) : 0.12;
            // lumps and faint ridges left by the dipping, never regular; long scratches
            q.h = 0.22 * smooth(0.6, 0.72, noise2(ux * 0.03, uy * 0.11, sd)) - 0.14 * smooth(0.35, 0.22, noise2(ux * 0.05, uy * 0.04, sd + 4));
            q.h += (hashI(Math.round(ux * 3), Math.round(uy * 0.08), 2, sd) - 0.5) * 0.3 * (hashI(Math.round(ux * 3), 0, 3, sd) > 0.9 ? 1 : 0);
            q.r -= 0.05 * smooth(0.55, 0.75, noise2(ux * 0.02, uy * 0.006, sd + 9));
            q.g -= 0.06 * smooth(0.55, 0.75, noise2(ux * 0.02, uy * 0.006, sd + 9));
            q.b -= 0.08 * smooth(0.55, 0.75, noise2(ux * 0.02, uy * 0.006, sd + 9));
            // the runs: rounded cords, a bead at the end of each
            for (const rn of runs) {
                const d = uy - yT;
                if (d < 0 || d > rn.L + rn.w * 1.6) continue;
                const sr = rn.s0 + rn.drift * (d / rn.L) + 0.05 * Math.sin(d * 0.08 + rn.s0 * 9);
                const wv = rn.w * (0.6 + 0.4 * smooth(0, rn.L * 0.3, d)) * (1 + 0.2 * Math.sin(d * 0.21));
                const px = (s - sr) * rr * Math.sqrt(Math.max(0.05, 1 - sr * sr));
                let t = Math.abs(px) / wv;
                if (d > rn.L) t = Math.hypot(px, d - rn.L) / (rn.w * 1.3);
                if (t < 1) {
                    const hh = Math.sqrt(1 - t * t);
                    q.h += hh * (rn.old ? 0.5 : 0.85);
                    q.nx += (px / wv) * 0.6;
                    q.ny += d > rn.L ? ((d - rn.L) / (rn.w * 1.3)) * 0.6 : 0;
                    q.r += rn.old ? -0.03 : 0.05;
                    q.g += rn.old ? -0.03 : 0.04;
                    q.b += rn.old ? -0.05 : 0.02;
                    q.sp = 0.6;
                    q.tr += 0.2;
                }
            }
            return cov;
        });
        // the wick
        const wx = CX(yT) + lee * 0.6, wy = yT - RIM * 0.2;
        if (lit) {
            S.ink(P.a, [[wx, wy + 1], [wx, wy - 4], [wx - lee * 1.2, wy - 7]], { w: 1.6, color: '#140e10' });
            return { x: wx - lee * 1.4, y: wy - 7 };
        }
        const bend = lee * (2 + rg() * 3);
        const wick = S.curve([[wx, wy + 1], [wx + bend * 0.1, wy - 4], [wx + bend * 0.6, wy - 7.5], [wx + bend, wy - 8]], false, 6);
        S.ink(P.a, wick, { w: 1.7, color: '#120c10' });
        S.ink(P.m, wick, { w: 1.7, color: '#000000' });
        const tip = wick[wick.length - 1];
        // smoke, if it was put out not long ago
        if (o.smoke !== false) smoke(P, tip[0], tip[1] - 1, { seed: seed + 'smoke', h: o.smokeH ?? 260 + rg() * 200, drift: o.drift ?? 0.12, alpha: o.smokeA ?? 0.5 });
        return { x: tip[0], y: tip[1], ember: o.ember ?? false };
    }

    // ------------------------------------------------------------------ smoke
    // A plume from (x, y): strands carried by a field that is still near the wick and turns
    // over higher up (curl noise whose strength grows with height). Painted into the air.
    function smoke(P, x0, y0, o = {}) {
        const sd = S.seedOf(o.seed ?? 's'), r = Motion.rng('smoke' + (o.seed ?? 's'));
        const Hh = o.h ?? 300, n = o.n ?? 18, f = o.freq ?? 0.016, drift = o.drift ?? 0.1, a0 = o.alpha ?? 0.5;
        const tint = o.tint ?? '#b9b6d0', still = o.still ?? 40, wide = o.wide ?? 1;
        const psi = (x, y) => noise2(x * f, y * f, sd) + 0.45 * noise2(x * f * 2.3, y * f * 2.3, sd + 7);
        const fine = (x, y) => noise2(x * f * 4.3, y * f * 4.3, sd + 11);
        const strands = [];
        for (let i = 0; i < n; i++) {
            const u = n > 1 ? i / (n - 1) - 0.5 : 0, ph = r() * TAU;
            let x = x0 + u * 1.4, y = y0;
            const pts = [[x, y]];
            for (let st = 0; st < 700; st++) {
                const h = y0 - y;
                if (h > Hh || st > 690) break;
                // still near the wick, waves above it, then the thread turns over
                const amp = smooth(still * 0.5, still * 3, h) * (o.amp ?? 1), turb = smooth(still * 2.2, still * 6, h) * (o.turb ?? 1);
                const e = 2;
                let vx = ((psi(x, y + e) - psi(x, y - e)) / (2 * e)) / f * 0.9 * amp;
                let vy = (-(psi(x + e, y) - psi(x - e, y)) / (2 * e)) / f * 0.9 * amp;
                vx += ((fine(x, y + e) - fine(x, y - e)) / (2 * e)) / (f * 4.3) * 0.7 * turb;
                vy += (-(fine(x + e, y) - fine(x - e, y)) / (2 * e)) / (f * 4.3) * 0.7 * turb;
                // curls: the sheet rolls up, each strand a little out of step with the next
                // (the phase runs unevenly, and the roll is flatter than it is wide: no circles)
                const a = h * (0.03 + 0.025 * noise2(h * 0.01, i, sd + 5)) + ph * 0.15 + u * 2.4 * turb;
                x += vx * 1.6 + drift * amp + u * 0.22 * wide * turb + 2.2 * turb * Math.cos(a) * (0.25 + Math.abs(u));
                y += -2 + vy * 1.2 + 1.1 * turb * Math.sin(a) * (0.2 + Math.abs(u));
                if (y > y0 + 4) y = y0 + 4;
                pts.push([x, y]);
            }
            strands.push(pts);
        }
        const q = P.air;
        q.save();
        q.lineCap = 'round';
        q.lineJoin = 'round';
        // a soft body round the strands
        const sq = wide > 1.5 ? P.fog : P.soft;
        sq.save();
        sq.lineCap = 'round';
        for (let i = 0; i < n; i += 3) {
            const pts = strands[i];
            for (let k = 1; k < pts.length; k += 3) {
                const u = k / pts.length;
                sq.strokeStyle = S.rgba(tint, a0 * 0.16 * (1 - u) * smooth(0, 0.1, u));
                sq.lineWidth = 2 + u * 22 * wide;
                sq.beginPath();
                sq.moveTo(pts[k - 1][0], pts[k - 1][1]);
                sq.lineTo(pts[Math.min(pts.length - 1, k + 2)][0], pts[Math.min(pts.length - 1, k + 2)][1]);
                sq.stroke();
            }
        }
        sq.restore();
        // the strands: crisp near the wick, some stay crisp higher up
        for (let i = 0; i < n; i++) {
            const pts = strands[i], crisp = r() < 0.35;
            for (let k = 1; k < pts.length; k += 2) {
                const u = k / pts.length;
                const al = a0 * (crisp ? 0.5 : 0.32) * Math.pow(1 - u, 1.4) * (0.6 + 0.4 * noise2(k * 0.05, i, sd));
                if (al < 0.01) continue;
                q.strokeStyle = S.rgba(tint, al);
                q.lineWidth = (crisp ? 0.5 : 0.7) + u * (crisp ? 1.2 : 3.2) * wide;
                q.beginPath();
                q.moveTo(pts[k - 1][0], pts[k - 1][1]);
                q.lineTo(pts[Math.min(pts.length - 1, k + 1)][0], pts[Math.min(pts.length - 1, k + 1)][1]);
                q.stroke();
            }
        }
        q.restore();
    }

    // ------------------------------------------------------------------ flames, as light
    // A candle flame standing on (x, y) (the wick's tip), painted straight on the lit layer.
    function flame(g, x, y, o = {}) {
        const D = typeof Devotion !== 'undefined' ? Devotion : null;
        const s = o.s ?? 1;
        if (o.halo !== false) halo(g, x, y - 22 * s, (o.R ?? 90) * s, o.glow ?? 0.8);
        if (D && D.flame) D.flame(g, S.frame(x, y, 0, s), { h: o.h ?? 52, w: o.w ?? 14, lean: o.lean ?? -3, seed: o.seed ?? 'f' });
    }
    function halo(g, x, y, R, a = 1) {
        g.save();
        g.globalCompositeOperation = 'screen';
        for (const [rad, col, al] of [[R, '255,150,60', 0.22], [R * 0.5, '255,196,110', 0.3], [R * 0.18, '255,236,190', 0.5]]) {
            const gr = g.createRadialGradient(x, y, 0, x, y, rad);
            gr.addColorStop(0, `rgba(${col},${al * a})`);
            gr.addColorStop(0.4, `rgba(${col},${al * a * 0.4})`);
            gr.addColorStop(1, `rgba(${col},0)`);
            g.fillStyle = gr;
            g.fillRect(x - rad, y - rad, rad * 2, rad * 2);
        }
        g.restore();
    }
    // a red ember at the tip of a wick put out a moment ago
    function ember(g, x, y) {
        halo(g, x, y, 7, 0.6);
        g.save();
        g.fillStyle = '#ff6a2a';
        g.beginPath();
        g.arc(x, y, 1.1, 0, TAU);
        g.fill();
        g.fillStyle = '#ffd08a';
        g.beginPath();
        g.arc(x - 0.2, y - 0.2, 0.5, 0, TAU);
        g.fill();
        g.restore();
    }

    // ------------------------------------------------------------------ the veil
    // The Lenten veil over the whole box but the rent: o.box, o.tear { x, cy, sy, hw } (the
    // rent's middle, its half-height scale and its widest half-width), o.band (the galloon's
    // y), o.seed. Returns the rent's edge function edge(y) → [left, right].
    function veil(P, o) {
        const b = o.box, sd = S.seedOf(o.seed ?? 'veil'), r = Motion.rng('veil' + (o.seed ?? ''));
        const T = { x: 0, cy: 20, sy: 430, hw: 250, ...(o.tear ?? {}) };
        const BAND = o.band ?? -560;
        const jag = (y, k) => 10 * noise2(y * 0.07, k, sd) + 5 * noise2(y * 0.31, k + 3, sd) + 4 * Math.abs(((y * 0.35 + k * 7) % 2) - 1);
        const xc = (y) => T.x + 14 * Math.sin(y * 0.0055 + 1) + 6 * Math.sin(y * 0.021);
        const hw = (y) => T.hw * Math.exp(-(((y - T.cy) / T.sy) ** 2)) + 5;
        const edge = (y) => [xc(y) - hw(y) - jag(y, 1), xc(y) + hw(y) + jag(y, 9)];
        // the folds: hanging from above, deepening downwards, drawn towards the rent
        const F = [[190, 16, 0.3], [113, 8, 1.7], [61, 4, 4.1], [37, 1.6, 2.2]];
        // moth holes, a darn, drops of wax
        const holes = [], drops = [];
        for (let i = 0; i < 9; i++) {
            const y = b.y + 80 + r() * (b.h - 160), x = b.x + 80 + r() * (b.w - 160);
            const [L, R] = edge(y);
            if (x > L - 60 && x < R + 60) continue;
            holes.push([x, y, 1.6 + r() * 3.4, r() * TAU]);
        }
        for (let i = 0; i < 14; i++) {
            const y = b.y + 100 + r() * (b.h - 200), x = b.x + 100 + r() * (b.w - 200);
            const [L, R] = edge(y);
            if (x > L - 20 && x < R + 20) continue;
            drops.push([x, y, 1.4 + r() * 2.6]);
        }
        const darn = o.darn ?? [-560, 260, 34, 26];
        // the instruments of the Passion embroidered in gold thread, powdered over the cloth
        // (the ladder among them): drawn once as a relief of the thread
        const arma = S.reliefField(b, 1.1, (q) => {
            q.strokeStyle = '#fff';
            q.fillStyle = '#fff';
            q.lineCap = 'round';
            q.lineJoin = 'round';
            const line = (pts, w = 3.4) => {
                q.lineWidth = w;
                q.beginPath();
                q.moveTo(pts[0][0], pts[0][1]);
                for (const p of pts.slice(1)) q.lineTo(p[0], p[1]);
                q.stroke();
            };
            const MOT = [
                (x, y) => { // the ladder
                    line([[x - 12, y - 40], [x - 16, y + 40]]);
                    line([[x + 12, y - 40], [x + 16, y + 40]]);
                    for (let k = -3; k <= 3; k++) line([[x - 13 - k * 0.5, y + k * 11], [x + 13 + k * 0.5, y + k * 11]], 2.6);
                },
                (x, y) => { // three nails
                    for (const a of [-0.45, 0, 0.45]) {
                        const c = Math.cos(a - Math.PI / 2), sn = Math.sin(a - Math.PI / 2);
                        line([[x - c * 34, y - sn * 34], [x + c * 30, y + sn * 30]], 3.6);
                        line([[x + c * 30 - sn * 7, y + sn * 30 + c * 7], [x + c * 30 + sn * 7, y + sn * 30 - c * 7]], 4.2);
                    }
                },
                (x, y) => { // the crown of thorns
                    q.lineWidth = 3;
                    for (const ph of [0, 1.7]) {
                        q.beginPath();
                        for (let t = 0; t <= TAU + 0.01; t += 0.1) {
                            const rr = 26 + 3 * Math.sin(t * 9 + ph);
                            q.lineTo(x + Math.cos(t) * rr, y + Math.sin(t) * rr * 0.55);
                        }
                        q.stroke();
                    }
                    for (let t = 0; t < TAU; t += 0.55) line([[x + Math.cos(t) * 27, y + Math.sin(t) * 15], [x + Math.cos(t) * 35, y + Math.sin(t) * 21]], 1.8);
                },
                (x, y) => { // three dice
                    for (const [dx, dy, n] of [[-18, 6, 3], [16, 10, 5], [0, -18, 2]]) {
                        q.lineWidth = 2.6;
                        q.strokeRect(x + dx - 10, y + dy - 10, 20, 20);
                        const pips = { 2: [[-5, -5], [5, 5]], 3: [[-5, -5], [0, 0], [5, 5]], 5: [[-5, -5], [5, -5], [0, 0], [-5, 5], [5, 5]] }[n];
                        for (const [px, py] of pips) {
                            q.beginPath();
                            q.arc(x + dx + px, y + dy + py, 1.8, 0, TAU);
                            q.fill();
                        }
                    }
                },
                (x, y) => { // the spear and the reed with the sponge, crossed
                    line([[x - 34, y + 40], [x + 30, y - 34]]);
                    q.beginPath();
                    q.moveTo(x + 30, y - 34);
                    q.lineTo(x + 36, y - 50);
                    q.lineTo(x + 24, y - 40);
                    q.fill();
                    line([[x + 34, y + 40], [x - 28, y - 30]]);
                    q.beginPath();
                    q.arc(x - 32, y - 35, 7, 0, TAU);
                    q.fill();
                },
                (x, y) => { // the cock on its column
                    line([[x - 8, y + 42], [x - 8, y + 6]], 4);
                    line([[x + 8, y + 42], [x + 8, y + 6]], 4);
                    line([[x - 14, y + 6], [x + 14, y + 6]], 3);
                    q.beginPath();
                    q.ellipse(x, y - 8, 12, 9, -0.2, 0, TAU);
                    q.fill();
                    q.beginPath();
                    q.arc(x + 11, y - 20, 5, 0, TAU);
                    q.fill();
                    for (const a of [-2.2, -2.6, -3.0]) line([[x - 10, y - 10], [x - 10 + Math.cos(a) * 18, y - 10 + Math.sin(a) * 18]], 2.4);
                    line([[x + 12, y - 25], [x + 14, y - 29]], 2.4);
                },
                (x, y) => { // the hammer and the pincers
                    line([[x - 26, y + 36], [x + 4, y - 22]], 3.4);
                    line([[x - 6, y - 32], [x + 16, y - 14]], 6);
                    line([[x + 26, y + 36], [x + 4, y - 4], [x + 2, y - 18]], 2.8);
                    line([[x + 12, y + 36], [x + 12, y - 2], [x + 18, y - 16]], 2.8);
                },
            ];
            let k = 0;
            for (let gy = b.y + 120, row = 0; gy < b.y + b.h - 60; gy += 250, row++) {
                for (let gx = b.x + 90 + (row % 2) * 150; gx < b.x + b.w - 60; gx += 300) {
                    const [L, R] = edge(gy);
                    if (gx > L - 90 && gx < R + 90) continue;
                    if (Math.abs(gy - BAND) < 80) continue;
                    MOT[k++ % MOT.length](gx + (hashI(gx, gy, 1, sd) - 0.5) * 40, gy + (hashI(gx, gy, 2, sd) - 0.5) * 30);
                }
            }
        }, 0.7);
        // small things by cell, so a pixel only asks its neighbours
        const CELL = 32, grid = new Map();
        const file = (list, kind, rad) => list.forEach((it) => {
            for (let gx = Math.floor((it[0] - rad) / CELL); gx <= Math.floor((it[0] + rad) / CELL); gx++) {
                for (let gy = Math.floor((it[1] - rad) / CELL); gy <= Math.floor((it[1] + rad) / CELL); gy++) {
                    const k = gx + ',' + gy;
                    if (!grid.has(k)) grid.set(k, []);
                    grid.get(k).push([kind, it]);
                }
            }
        });
        file(holes, 0, 12);
        file(drops, 1, 6);
        let rowY = NaN, L = 0, R = 0, foldK = 0, bend = [0, 0, 0, 0];
        P.solid(b, (ux, uy, q) => {
            if (uy !== rowY) {
                rowY = uy;
                [L, R] = edge(uy);
                foldK = 0.45 + 0.75 * smooth(b.y, b.y + b.h, uy);
                F.forEach(([, , ph], k) => (bend[k] = 18 * Math.sin(uy * 0.003 + ph)));
            }
            const near = grid.get(Math.floor(ux / CELL) + ',' + Math.floor(uy / CELL));
            const holesHere = near ? near.filter((e) => e[0] === 0).map((e) => e[1]) : [];
            const dropsHere = near ? near.filter((e) => e[0] === 1).map((e) => e[1]) : [];
            const dL = L - ux, dR = ux - R;
            const e = Math.max(dL, dR); // > 0 in the cloth, distance to the nearest torn edge
            if (e < -0.5) return 0;
            for (const [hx, hy, hr, ha] of holesHere) {
                const dx = ux - hx, dy = uy - hy, d = Math.hypot(dx, dy), ang = Math.atan2(dy, dx);
                const rr = hr * (1 + 0.35 * Math.sin(ang * 3 + ha) + 0.2 * Math.sin(ang * 5 + ha * 2));
                if (d < rr) return 0;
                if (d < rr + 2.2) {
                    q.h -= 0.4;
                    q.r = 0.38;
                }
            }
            let h = 0, dh = 0;
            for (let k = 0; k < 4; k++) {
                const [Lw, A, ph] = F[k], w = TAU / Lw, a = w * (ux + bend[k]) + ph;
                h += A * foldK * Math.sin(a);
                dh += A * foldK * w * Math.cos(a);
            }
            q.nx = -dh * 0.9;
            q.ny = -0.08;
            q.nz = 1;
            // the edges roll back where the cloth gave
            const side = dL > dR ? -1 : 1;
            if (e < 16) {
                const k = Math.pow(1 - e / 16, 2);
                q.nx += side * k * 1.3;
                q.nz -= k * 0.4;
            }
            // wool of liturgical violet: bluer in the hollows, redder where it is worn
            const valley = clamp(0.5 - h / 40), wear = smooth(0.55, 0.8, noise2(ux * 0.012, uy * 0.012, sd + 2));
            q.r = 0.31 - valley * 0.07 + wear * 0.06;
            q.g = 0.15 - valley * 0.02 + wear * 0.01;
            q.b = 0.41 + valley * 0.03 - wear * 0.04;
            const mot = noise2(ux * 0.05, uy * 0.05, sd + 5) * 0.06;
            q.r += mot;
            q.g += mot * 0.6;
            q.b += mot;
            // the weave: a twill, and slubs in the yarn
            q.h += 0.22 * Math.sin((ux + uy) * 2.1) + 0.14 * Math.sin(ux * 2.3) * Math.sin(uy * 2.3);
            q.h += 0.2 * (smooth(0.7, 0.8, noise2(ux * 0.3, uy * 0.02, sd + 6)) - 0.5);
            q.sh = 0.02;
            // the torn edge itself: the reverse of the cloth, paler and fuzzy
            if (e < 2.6) {
                q.r += 0.08;
                q.g += 0.05;
                q.b += 0.05;
                q.h += (hashI(Math.round(ux * 2), Math.round(uy * 2), 4, sd) - 0.5) * 0.8;
            }
            const am = arma(ux, uy);
            if (am > 0.3) {
                const worn = smooth(0.66, 0.72, noise2(ux * 0.05, uy * 0.05, sd + 12));
                const lay = Math.sin((ux + uy) * 1.8);
                q.r = worn ? 0.36 : 0.74 - 0.1 * lay;
                q.g = worn ? 0.22 : 0.55 - 0.08 * lay;
                q.b = worn ? 0.3 : 0.26;
                q.sp = worn ? 0 : 0.75;
                q.sh = 0.45;
                q.h += am * 1.2 + 0.3 * lay;
            }
            // the galloon: gold thread in lozenges between two cords, worn through in places
            const by = uy - BAND - h * 0.2;
            if (Math.abs(by) < 24) {
                const ab = Math.abs(by);
                const worn = smooth(0.62, 0.7, noise2(ux * 0.04, uy * 0.1, sd + 8));
                let gold = 0, hh = 0;
                if (ab > 18) {
                    gold = 1;
                    hh = Math.sin(((ab - 18) / 6) * Math.PI) * 0.8 + 0.25 * Math.sin((ux - by) * 1.6);
                } else {
                    const m = ((ux % 44) + 44) % 44 - 22, lz = Math.abs(m) + ab;
                    if (lz < 15) {
                        gold = 1;
                        hh = 0.6 * (1 - lz / 15) + 0.25 * Math.sin((ux + uy) * 1.9);
                    } else if (Math.hypot(Math.abs(m) - 22, ab - 0) < 4 || Math.hypot(m, ab - 12) < 2.6) {
                        gold = 1;
                        hh = 0.5;
                    }
                }
                if (gold && !worn) {
                    q.r = 0.8;
                    q.g = 0.6;
                    q.b = 0.28;
                    q.sp = 0.85;
                    q.sh = 0.5;
                    q.h += hh;
                } else if (gold) {
                    q.r = 0.42;
                    q.g = 0.3;
                    q.b = 0.26;
                    q.h += hh * 0.4;
                }
            }
            // a darn: a patch of crossing stitches in a violet a little off
            if (Math.abs(ux - darn[0]) < darn[2] / 2 && Math.abs(uy - darn[1]) < darn[3] / 2) {
                q.r = 0.26;
                q.g = 0.14;
                q.b = 0.36;
                q.h = 0.5 * Math.sin(ux * 1.7) * (((Math.floor(uy / 2.2) % 2) ? 1 : -1)) + 0.3 * Math.sin(uy * 3);
            }
            for (const [dx, dy, dr] of dropsHere) {
                const d = Math.hypot(ux - dx, (uy - dy) * 1.2);
                if (d < dr) {
                    q.r = 0.82;
                    q.g = 0.76;
                    q.b = 0.62;
                    q.h += Math.sqrt(1 - (d / dr) ** 2) * 0.9;
                    q.sp = 0.5;
                    q.tr = 0.3;
                }
            }
            return clamp(e * P.res + 0.5);
        });
        // frayed weft threads hanging from the torn edges
        const a = P.a, mm = P.m;
        for (let i = 0; i < 70; i++) {
            const y = T.cy + (r() - 0.5) * T.sy * 2.2, [L, R] = edge(y), sideL = r() < 0.5;
            const x = sideL ? L : R, dir = sideL ? 1 : -1, len = 6 + r() * r() * 34;
            const pts = [[x - dir * 2, y]];
            let px = x, py = y, ang = (r() - 0.5) * 0.6;
            for (let k = 0; k < 8; k++) {
                ang += 0.12 + (r() - 0.5) * 0.4; // they hang
                px += dir * Math.cos(ang) * (len / 8);
                py += Math.abs(Math.sin(ang)) * (len / 8) + 0.4;
                pts.push([px, py]);
            }
            const col = r() < 0.3 ? '#6a4a80' : '#4c2c66';
            S.ink(a, pts, { w: 0.7 + r() * 0.6, color: col, taper: [0, 0.8] });
            S.ink(mm, pts, { w: 0.7, color: 'rgb(0,10,0)', taper: [0, 0.8] });
        }
        return edge;
    }

    // ------------------------------------------------------------------ the ladder
    // A wooden ladder lying along the axis below it, as each sheet sees its stretch: the
    // rails on the rays from the vanishing point through (±X, Y), as wide as `w` at Y and
    // widening with the distance from the axis (so the stretches of every sheet join into
    // one ladder from wherever on the axis the camera is), from radius `from` to `to` (in
    // multiples of Y); rungs at the heights `rungs`. A rung bound with cord where it split.
    function ladder(P, o) {
        const { X = 120, Y = 230, w = 20, from = 0.86, to = 2, rungs = [Y], seed = 'ladder', rr = 9 } = o;
        const sd = S.seedOf(seed), r = Motion.rng('ladder' + seed);
        const RL = Math.hypot(X, Y);
        const rails = [-1, 1].map((sg) => ({ sg, ex: (sg * X) / RL, ey: Y / RL }));
        const ext = to * RL + w * to, maxY = to * Y + w;
        const bx = { x: -X * to - w * to * 2, y: from * Y - rr * 2, w: (X * to + w * to * 2) * 2, h: maxY - from * Y + rr * 4 + w };
        // walnut gone dark with hands and years
        const WOOD = [0.42, 0.27, 0.15];
        const grain = (a, t, k) => {
            const g = noise2(a * 0.9, t * 0.018, sd + k) * 0.7 + noise2(a * 3.1, t * 0.05, sd + k + 1) * 0.3;
            return Math.sin(g * 24 + a * 1.2);
        };
        const knots = [];
        for (let i = 0; i < 3; i++) knots.push([rails[i % 2].sg, (from + r() * (to - from)) * RL, (r() - 0.5) * 0.6, 3 + r() * 4]);
        const bound = Math.floor(r() * rungs.length);
        // the rungs first: round, turned, worn pale on top by the feet
        rungs.forEach((ry, j) => {
            const k = ry / Y, half = X * k, rad = rr * Math.sqrt(k);
            P.solid({ x: -half - 4, y: ry - rad - 1, w: half * 2 + 8, h: rad * 2 + 2 }, (ux, uy, q) => {
                const t = (uy - ry) / rad;
                if (Math.abs(t) >= 1 || Math.abs(ux) > half) return 0;
                const cz = Math.sqrt(1 - t * t);
                q.nx = 0;
                q.ny = t;
                q.nz = cz;
                const gr = grain(t * 3, ux * 2, 20 + j);
                const wear = smooth(0.1, -0.7, t) * smooth(half, half * 0.6, Math.abs(ux));
                q.r = WOOD[0] * (0.9 + 0.12 * gr) + wear * 0.16;
                q.g = WOOD[1] * (0.9 + 0.12 * gr) + wear * 0.11;
                q.b = WOOD[2] * (0.9 + 0.1 * gr) + wear * 0.06;
                q.h = 0.25 * gr * (1 - wear) + (hashI(Math.round(ux * 2), Math.round(uy * 3), 5, sd) - 0.5) * 0.2;
                q.sp = 0.15 + wear * 0.35;
                q.sh = 0.4;
                // the split rung, bound with cord
                if (j === bound && Math.abs(ux + half * 0.25) < 9 * Math.sqrt(k)) {
                    const c = Math.sin((ux + t * 2.2) * 2.4 / Math.sqrt(k));
                    q.r = 0.5 + 0.08 * c;
                    q.g = 0.42 + 0.07 * c;
                    q.b = 0.3 + 0.05 * c;
                    q.h = 0.6 * c;
                    q.sp = 0.05;
                }
                if (j === bound && Math.abs(ux - half * 0.1) < 30 * Math.sqrt(k) && Math.abs(t + 0.1 + 0.15 * Math.sin(ux * 0.2)) < 0.06) q.r = q.g = q.b = 0.05;
                return clamp((1 - Math.abs(t)) * rad * P.res + 0.5) * clamp((half - Math.abs(ux)) * P.res + 0.5);
            });
        });
        // the rails: their top faces, receding towards the vanishing point
        for (const R of rails) {
            P.solid(bx, (ux, uy, q) => {
                const t = ux * R.ex + uy * R.ey, p = -ux * R.ey + uy * R.ex;
                if (t < from * RL || t > to * RL) return 0;
                const hw = (w / 2) * (t / RL), a = p / hw;
                if (Math.abs(a) >= 1) return 0;
                // a squared rail with eased arrises: the top face, an inner face in the shade
                const arr = smooth(0.7, 1, Math.abs(a));
                q.nx = R.sg * 0.15 + Math.sign(a) * arr * 0.7 * R.ey;
                q.ny = -0.85 - Math.sign(a) * arr * 0.7 * R.ex;
                q.nz = 0.5;
                const gr = grain(a * 2, t, R.sg > 0 ? 3 : 7);
                let col = 0.92 + 0.14 * gr;
                for (const [sg, kt, ka, kr] of knots) {
                    if (sg !== R.sg) continue;
                    const d = Math.hypot((t - kt) / (kr * 2.4), (a - ka) * hw / kr);
                    if (d < 1.6) {
                        col *= 0.65 + 0.35 * smooth(0.4, 1.6, d);
                        q.h += Math.sin(d * 6) * 0.3 * (1 - d / 1.6);
                    }
                }
                q.r = WOOD[0] * col;
                q.g = WOOD[1] * col;
                q.b = WOOD[2] * col;
                q.h += 0.35 * gr + (hashI(Math.round(t * 0.5), Math.round(a * 6), 6, sd) - 0.5) * 0.15;
                q.sp = 0.2;
                q.sh = 0.35;
                // the rungs come through the rail: the tenon's end grain and its wedge
                for (const ry of rungs) {
                    const k = ry / Y, cx = R.sg * X * k, d = Math.hypot(ux - cx, uy - ry) / (rr * Math.sqrt(k) * 0.95);
                    if (d < 1) {
                        q.r = WOOD[0] * 1.1;
                        q.g = WOOD[1] * 1.05;
                        q.b = WOOD[2];
                        q.h = 0.3 * Math.sin(d * 14) + (Math.abs(ux - cx) < 0.9 * Math.sqrt(k) ? -1 : 0);
                        q.nx = (ux - cx) * 0.02;
                        q.ny = -0.4;
                        q.nz = 1;
                    }
                }
                // a nail, its head
                return clamp((1 - Math.abs(a)) * hw * P.res + 0.5);
            });
        }
    }

    // ------------------------------------------------------------------ a moth
    // A moth (a noctuid, grey-brown; or a pale geometrid) at (x, y), heading `rot` (0 = up the
    // page), `s` its size (1 = 34 units across the open wings), `open` how far its wings are
    // spread (0 folded roof-wise, 1 flat open), `blur` for one in flight.
    function moth(P, o) {
        const { x, y, s = 1, rot = 0, open = 1, seed = 'moth', pale = false } = o;
        const sd = S.seedOf(seed), r = Motion.rng('moth' + seed);
        const c = Math.cos(rot), sn = Math.sin(rot);
        const toL = (ux, uy) => {
            const dx = (ux - x) / s, dy = (uy - y) / s;
            return [dx * c + dy * sn, -dx * sn + dy * c];
        };
        // the wings in the moth's frame (head up, y down), right side; mirrored for the left
        const spread = 0.35 + 0.65 * open;
        const fore = S.curve([[1.5, -4], [7, -8 * spread - 1], [15 * spread + 2, -9 * spread], [17 * spread + 1.5, -6 * spread], [15 * spread + 1, 1], [9 * spread + 1, 4], [2, 3]], true, 6);
        const hind = S.curve([[1.5, 1], [7 * spread + 2, 0], [12 * spread + 1, 3.5], [11 * spread, 8.5], [6 * spread, 10.5], [2, 7]], true, 6);
        const inside = (pts, px, py) => {
            let inn = false;
            for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
                const [xi, yi] = pts[i], [xj, yj] = pts[j];
                if ((yi > py) !== (yj > py) && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) inn = !inn;
            }
            return inn;
        };
        const base = pale ? [0.78, 0.74, 0.66] : [0.46, 0.38, 0.3];
        const dark = pale ? [0.5, 0.46, 0.4] : [0.2, 0.15, 0.12];
        const R = 20 * s;
        P.solid({ x: x - R, y: y - R, w: R * 2, h: R * 2 }, (ux, uy, q) => {
            let [lx, ly] = toL(ux, uy);
            const side = lx < 0 ? -1 : 1;
            lx = Math.abs(lx);
            const body = Math.hypot(lx / 1.6, (ly - 1.5) / 7.5);
            const head = Math.hypot(lx / 1.5, (ly + 6.2) / 1.6);
            q.sp = 0.05;
            q.tr = 0.2;
            if (head < 1 || body < 1) {
                // the furry thorax, the ringed abdomen, the head
                const d = Math.min(head, body);
                q.nx = (lx / 1.6) * side * 0.8;
                q.ny = 0;
                q.nz = Math.sqrt(Math.max(0.1, 1 - d * d));
                const ring = ly > 1 ? 0.5 + 0.5 * Math.sin(ly * 2.6) : 0;
                q.r = base[0] * (0.75 + ring * 0.2);
                q.g = base[1] * (0.75 + ring * 0.2);
                q.b = base[2] * (0.75 + ring * 0.2);
                q.h = (hashI(Math.round(ux * 3), Math.round(uy * 3), 7, sd) - 0.5) * 0.9;
                return clamp((1 - d) * 2 * s * P.res + 0.5);
            }
            const inF = inside(fore, lx, ly), inH = !inF && inside(hind, lx, ly);
            if (!inF && !inH) return 0;
            q.nx = side * 0.12 * (1 - open);
            q.nz = 1;
            q.tr = 0.75;
            let t;
            if (inF) {
                // the forewing: cross lines, a kidney spot, the fringe chequered at the edge
                const u = Math.hypot(lx - 1.5, ly + 3) / (16 * spread + 2);
                const wave = 0.04 * Math.sin(ly * 1.4 + sd);
                t = 0.55 + 0.25 * noise2(lx * 0.4, ly * 0.4, sd);
                if (Math.abs(u - 0.38 - wave) < 0.04 || Math.abs(u - 0.66 + wave) < 0.035) t = 0.15;
                if (Math.abs(u - 0.86) < 0.025) t = 0.85;
                if (Math.hypot(lx - 8 * spread - 1, ly + 3) < 1.6) t = 0.1;
                if (u > 0.93) t = Math.floor(ly * 0.9 + lx * 0.3) % 2 ? 0.3 : 0.75;
                // the veins
                if (Math.abs(Math.sin(Math.atan2(ly + 3, lx - 1.5) * 7)) < 0.06 && u > 0.5) t *= 0.8;
            } else {
                t = 0.7 + 0.15 * (Math.hypot(lx, ly - 4) / 11) + 0.05 * noise2(lx, ly, sd + 1);
                if (Math.hypot(lx - 6 * spread, ly - 4) < 1) t = 0.3;
            }
            q.r = lerp(dark[0], base[0], t);
            q.g = lerp(dark[1], base[1], t);
            q.b = lerp(dark[2], base[2], t);
            q.h = (hashI(Math.round(ux * 4), Math.round(uy * 4), 8, sd) - 0.5) * 0.5;
            return 1;
        });
        // the antennae, feathered
        const F = (p) => [x + (p[0] * c - p[1] * sn) * s, y + (p[0] * sn + p[1] * c) * s];
        for (const sg of [-1, 1]) {
            const pts = [[sg * 0.6, -7], [sg * 2.5, -10.5], [sg * 4.6, -12.5]].map(F);
            S.ink(P.a, S.curve(pts, false, 4), { w: 0.55 * s, color: '#2a1f1a', taper: [0, 1] });
        }
    }

    // ------------------------------------------------------------------ polygons
    // a flat piece: the same polygon in every buffer
    function poly(P, pts, o = {}) {
        const n = o.n ?? [0, 0, 1], l = Math.hypot(...n);
        P.each({
            a: o.a ?? '#808080',
            n: `rgb(${128 + (127 * n[0]) / l},${128 + (127 * n[1]) / l},${128 + (127 * n[2]) / l})`,
            m: `rgb(${(o.sp ?? 0) * 255},${(o.sh ?? 0.5) * 255},${(o.tr ?? 0) * 255})`,
            ...(o.b ? { b: o.b } : {}),
        }, (q) => {
            q.beginPath();
            S.trace(q, pts);
            q.fill();
        });
    }

    // ------------------------------------------------------------------ carved steps
    // Stepped stands of dark oak: each { x0, x1, y } a step whose top edge is at y, running
    // down to `bottom`; a moulded nosing (fillet, ovolo, cavetto), the grain along the board,
    // woodworm holes, wax that ran over the edge. Painted far to near: list the higher first.
    function steps(P, list, o = {}) {
        const bottom = o.bottom ?? 760, sd = S.seedOf(o.seed ?? 'steps');
        const OAK = o.wood ?? [0.33, 0.21, 0.12];
        for (const [j, st] of list.entries()) {
            const x0 = Math.min(st.x0, st.x1), x1 = Math.max(st.x0, st.x1);
            const inner = st.x0; // the end that faces the way through is cut square and moulded too
            // only down to the step in front of it on the same side (it hides the rest)
            const side = Math.sign(st.x1 - st.x0);
            const below = list.filter((o2) => Math.sign(o2.x1 - o2.x0) === side && o2.y > st.y).reduce((m, o2) => Math.min(m, o2.y), bottom);
            const yEnd = Math.min(bottom, below + 30);
            P.solid({ x: x0 - 2, y: st.y - 2, w: x1 - x0 + 4, h: yEnd - st.y + 2 }, (ux, uy, q) => {
                const d = uy - st.y, e = Math.abs(ux - inner);
                if (d < 0) return 0;
                // the nosing: a thin top seen from above, an ovolo, a cavetto, the riser
                let ny = 0, nz = 1, dark = 0;
                if (d < 3) {
                    ny = -0.95;
                    nz = 0.3;
                } else if (d < 11) {
                    const t = (d - 3) / 8;
                    ny = -Math.cos(t * Math.PI * 0.5) * 0.9;
                    nz = Math.sin(t * Math.PI * 0.5) + 0.2;
                } else if (d < 13) {
                    ny = 0.3;
                    dark = 0.4;
                } else if (d < 22) {
                    const t = (d - 13) / 9;
                    ny = 0.75 * (1 - t);
                    nz = 0.5 + t * 0.5;
                } else if (d < 24) {
                    ny = -0.5;
                }
                // the square end, moulded the same way, turned
                let nx = 0;
                if (e < 10) {
                    nx = (inner > (x0 + x1) / 2 ? 1 : -1) * Math.cos((e / 10) * Math.PI * 0.5) * 0.85;
                }
                q.nx = nx;
                q.ny = ny;
                q.nz = nz;
                // the grain along the board, a ray of medullary flecks (oak)
                const gr = noise2(ux * 0.006, uy * 0.32, sd + j) * 0.7 + noise2(ux * 0.02, uy * 0.9, sd + j + 5) * 0.3;
                const ring = Math.sin(gr * 30 + uy * 0.05);
                const fleck = smooth(0.82, 0.9, noise2(ux * 0.08, uy * 0.5, sd + 9)) * 0.12;
                const k = 0.88 + 0.1 * ring + fleck - dark;
                q.r = OAK[0] * k;
                q.g = OAK[1] * k;
                q.b = OAK[2] * k;
                q.h = 0.35 * ring + (hashI(Math.round(ux * 0.7), Math.round(uy * 2.5), 9, sd) - 0.5) * 0.2;
                // woodworm: small round holes, a few in a cluster
                const wx = Math.floor(ux / 9), wy = Math.floor(uy / 9);
                if (hashI(wx, wy, 11 + j, sd) > 0.985) {
                    const cx = (wx + 0.5) * 9, cy = (wy + 0.5) * 9;
                    if (Math.hypot(ux - cx, uy - cy) < 1.1) {
                        q.r *= 0.25;
                        q.g *= 0.25;
                        q.b *= 0.25;
                        q.h = -1;
                    }
                }
                q.sp = 0.14 + (d < 11 ? 0.2 : 0);
                q.sh = 0.3;
                return clamp(d * P.res + 0.5) * clamp((x1 - ux) * P.res + 0.5) * clamp((ux - x0) * P.res + 0.5);
            });
            // wax that ran over the nosing
            const r = Motion.rng('stepwax' + j + (o.seed ?? ''));
            for (let i = 0; i < (st.wax ?? 2); i++) {
                const x = st.x0 + (st.x1 > st.x0 ? 1 : -1) * (14 + r() * 90), len = 8 + r() * r() * 50;
                wax(P, [[x, st.y + 1], [x + (r() - 0.5) * 3, st.y + 10], [x + (r() - 0.5) * 4, st.y + 12 + len]], 2 + r() * 2, 'sw' + j + i, { col: o.waxCol ?? [0.8, 0.74, 0.6] });
            }
        }
    }

    // ------------------------------------------------------------------ the cell's wall
    // A wall of rough-hewn stone round a round-headed window (the way through): o.box, o.win
    // { w (half-width), sill (y), spring (y where the arch begins) }, o.seed. Courses of
    // unequal height, stones of unequal length, each its own tone and slight swell, tooled
    // with parallel strokes; lime mortar sunk in the joints; voussoirs round the arch, a
    // worn sill; the sockets of the bars that were sawn out, rust running from them; a crack;
    // a prisoner's tally scratched on a stone by the window.
    function wall(P, o) {
        const b = o.box, sd = S.seedOf(o.seed ?? 'wall'), r = Motion.rng('wall' + (o.seed ?? ''));
        const Wn = { w: 200, sill: 160, spring: -40, reveal: 30, ...(o.win ?? {}) };
        const STONE = o.stone ?? [0.5, 0.45, 0.42];
        // the courses
        const rows = [];
        for (let y = b.y; y < b.y + b.h;) {
            const h = 38 + r() * 30;
            const cuts = [];
            for (let x = b.x - r() * 120; x < b.x + b.w; x += 70 + r() * 110) cuts.push(x);
            cuts.push(b.x + b.w + 200);
            rows.push({ y0: y, y1: y + h, cuts, seed: rows.length });
            y += h;
        }
        const arch = (ux, uy) => {
            // > 0 outside the opening, in units from its edge
            if (uy > Wn.spring) return uy > Wn.sill ? uy - Wn.sill : Math.abs(ux) - Wn.w;
            return Math.hypot(ux, uy - Wn.spring) - Wn.w;
        };
        const sockets = [];
        for (const x of [-110, -38, 38, 110]) {
            sockets.push([x, Wn.sill + 4]);
            sockets.push([x, Wn.spring - Math.sqrt(Math.max(0, Wn.w * Wn.w - x * x)) - 4]);
        }
        const tally = o.tally ?? [-320, -60];
        let rowY = NaN, row = null;
        P.solid(b, (ux, uy, q) => {
            const e = arch(ux, uy);
            if (e < 0) return 0;
            if (uy !== rowY) {
                rowY = uy;
                row = rows.find((rw) => uy >= rw.y0 && uy < rw.y1) ?? rows[rows.length - 1];
            }
            let sx0 = 0, sx1 = 0, si = 0, sy0 = row.y0, sy1 = row.y1;
            let voussoir = false;
            if (e < Wn.reveal + 34 && uy < Wn.spring + 6) {
                // the voussoirs: wedges on the arch's centre
                voussoir = true;
                const a = Math.atan2(uy - Wn.spring, ux), n = 15, k = ((a + Math.PI) / Math.PI) * n;
                si = Math.floor(k) + 100;
                const f = k - Math.floor(k), w = Math.min(f, 1 - f) * (Math.PI / n) * (Wn.w + e);
                sx0 = -w;
                sx1 = w;
                sy0 = 0;
                sy1 = Wn.reveal + 34;
            } else {
                let i = 0;
                while (i < row.cuts.length - 1 && row.cuts[i + 1] <= ux) i++;
                sx0 = row.cuts[i] - ux;
                sx1 = row.cuts[i + 1] - ux;
                si = row.seed * 50 + i;
            }
            // the joint: distance to the stone's edge
            const dj = voussoir ? Math.min(sx1, -sx0, e - (Wn.reveal - 2) > 0 ? Wn.reveal + 34 - e : e) : Math.min(-sx0, sx1, uy - sy0, sy1 - uy);
            const jw = 2.4 + 1.5 * noise2(ux * 0.1, uy * 0.1, sd);
            // the reveal: the window's sides, in the wall's thickness, facing the opening
            if (e < Wn.reveal) {
                const t = e / Wn.reveal;
                let nx, ny;
                if (uy > Wn.sill) {
                    nx = 0;
                    ny = -1;
                } else if (uy > Wn.spring) {
                    nx = -Math.sign(ux);
                    ny = 0;
                } else {
                    const l = Math.hypot(ux, uy - Wn.spring) || 1;
                    nx = -ux / l;
                    ny = -(uy - Wn.spring) / l;
                }
                q.nx = nx * 0.9;
                q.ny = ny * 0.9;
                q.nz = 0.25 + t * 0.3;
            } else {
                // each stone a slight swell
                const u = clamp(Math.min(-sx0, sx1) / 30), v = clamp(Math.min(uy - sy0, sy1 - uy) / 20);
                q.nx = (sx0 + sx1) / (sx1 - sx0 || 1) * -0.25 * (1 - u);
                q.ny = voussoir ? 0 : ((uy - (sy0 + sy1) / 2) / ((sy1 - sy0) / 2)) * 0.22 * (1 - v);
                q.nz = 1;
            }
            const tone = 0.82 + 0.3 * (hashI(si, 0, 1, sd) - 0.5) + 0.12 * noise2(ux * 0.03, uy * 0.03, sd + si);
            const warm = hashI(si, 0, 2, sd) - 0.5;
            q.r = STONE[0] * tone * (1 + warm * 0.12);
            q.g = STONE[1] * tone;
            q.b = STONE[2] * tone * (1 - warm * 0.1);
            // tooling: parallel strokes of the bush hammer and the claw, a direction per stone
            const ang = hashI(si, 1, 3, sd) * Math.PI;
            const tl = ux * Math.cos(ang) + uy * Math.sin(ang);
            q.h = 0.35 * Math.sin(tl * 1.4 + noise2(ux * 0.2, uy * 0.2, sd + 3) * 4) * smooth(0.3, 0.6, noise2(ux * 0.04, uy * 0.04, sd + si));
            q.h += (hashI(Math.round(ux * 1.5), Math.round(uy * 1.5), 4, sd) - 0.5) * 0.5;
            // pits and spalls
            const pit = noise2(ux * 0.09, uy * 0.09, sd + 7);
            if (pit > 0.78) {
                q.h -= (pit - 0.78) * 4;
                q.r *= 0.8;
                q.g *= 0.8;
                q.b *= 0.8;
            }
            q.sp = 0.04;
            q.sh = 0.2;
            if (dj < jw && e >= Wn.reveal) {
                // the mortar: lime, paler, sunk and crumbling
                const t = dj / jw;
                q.r = 0.56 + 0.06 * noise2(ux * 0.5, uy * 0.5, sd + 9);
                q.g = 0.52;
                q.b = 0.48;
                q.h = -0.8 + t * 0.6 + (hashI(Math.round(ux * 3), Math.round(uy * 3), 5, sd) - 0.5) * 0.6;
                q.nz = 1;
            }
            // a crack running down from the arch
            const cx = 120 + 30 * Math.sin(uy * 0.02) + 12 * noise2(0, uy * 0.05, sd + 11);
            if (uy < Wn.spring - 60 && Math.abs(ux - cx) < 0.9 + 0.6 * noise2(uy * 0.1, 0, sd)) {
                q.r *= 0.3;
                q.g *= 0.3;
                q.b *= 0.3;
                q.h = -1;
            }
            // the bars' sockets, sealed with lead once, the rust run down from them
            for (const [bx, by] of sockets) {
                const dx = ux - bx, dy = uy - by;
                if (Math.abs(dx) < 4.5 && Math.abs(dy) < 4.5) {
                    q.r = 0.12;
                    q.g = 0.09;
                    q.b = 0.1;
                    q.h = -1;
                } else if (Math.abs(dx) < 6 && Math.abs(dy) < 6) {
                    q.r = 0.42;
                    q.g = 0.38;
                    q.b = 0.38;
                    q.sp = 0.5;
                } else if (by > 0 && dy > 0 && dy < 60 && Math.abs(dx + 0.15 * Math.sin(dy * 0.2)) < 3.2 * (1 - dy / 70)) {
                    const k = (1 - dy / 60) * 0.7;
                    q.r = lerp(q.r, 0.42, k);
                    q.g = lerp(q.g, 0.2, k);
                    q.b = lerp(q.b, 0.1, k);
                }
            }
            // the tally: days scratched in fives
            const tx = ux - tally[0], ty = uy - tally[1];
            if (tx > 0 && tx < 120 && ty > 0 && ty < 26) {
                const grp = Math.floor(tx / 22), inG = tx - grp * 22;
                if (grp < 5) {
                    const st = Math.floor(inG / 4.2), off = inG - st * 4.2;
                    if ((st < 4 && Math.abs(off - 1.2 - ty * 0.04) < 0.55) || Math.abs(inG - (ty * 0.7 + 1)) < 0.6) {
                        q.r *= 1.35;
                        q.g *= 1.3;
                        q.b *= 1.25;
                        q.h = -0.8;
                    }
                }
            }
            return clamp(e * P.res + 0.5);
        });
        return { arch, sockets };
    }

    // ------------------------------------------------------------------ a cord, a bar
    // Anything long and round along a path, painted per pixel: `w` its width (or w(u)), and
    // look(u, across, around, q) to colour it (u along 0..1, across −1..1, around the twist).
    function tube(P, pts, w, look, o = {}) {
        const line = pts.length > 2 ? S.curve(pts, false, o.seg ?? 8) : pts;
        const segs = [];
        let L = 0;
        for (let i = 1; i < line.length; i++) {
            const a = line[i - 1], c = line[i], d = Math.hypot(c[0] - a[0], c[1] - a[1]);
            if (d < 1e-6) continue;
            segs.push([a, c, d, L]);
            L += d;
        }
        const W = typeof w === 'function' ? w : () => w;
        let wmax = 0;
        for (let k = 0; k <= 20; k++) wmax = Math.max(wmax, W(k / 20));
        const bb = S.bbox(line, wmax + 2);
        // segments by cell, so each pixel only measures the near ones
        const CELL = Math.max(16, wmax * 2), grid = new Map();
        segs.forEach((sg, j) => {
            const x0 = Math.min(sg[0][0], sg[1][0]) - wmax, x1 = Math.max(sg[0][0], sg[1][0]) + wmax;
            const y0 = Math.min(sg[0][1], sg[1][1]) - wmax, y1 = Math.max(sg[0][1], sg[1][1]) + wmax;
            for (let gx = Math.floor(x0 / CELL); gx <= Math.floor(x1 / CELL); gx++) {
                for (let gy = Math.floor(y0 / CELL); gy <= Math.floor(y1 / CELL); gy++) {
                    const k = gx + ',' + gy;
                    if (!grid.has(k)) grid.set(k, []);
                    grid.get(k).push(j);
                }
            }
        });
        P.solid(bb, (ux, uy, q) => {
            const near = grid.get(Math.floor(ux / CELL) + ',' + Math.floor(uy / CELL));
            if (!near) return 0;
            let best = 1e9, along = 0, px = 0, py = 0, tx = 0, ty = 0;
            for (const j of near) {
                const [a, c, d, l0] = segs[j];
                const vx = c[0] - a[0], vy = c[1] - a[1], u = clamp(((ux - a[0]) * vx + (uy - a[1]) * vy) / (d * d));
                const dx = ux - (a[0] + vx * u), dy = uy - (a[1] + vy * u), dd = dx * dx + dy * dy;
                if (dd < best) {
                    best = dd;
                    along = l0 + u * d;
                    px = dx;
                    py = dy;
                    tx = vx / d;
                    ty = vy / d;
                }
            }
            const u = along / L, ww = W(u) / 2, dist = Math.sqrt(best);
            if (dist >= ww) return 0;
            const across = (px * -ty + py * tx) / ww; // signed −1..1
            const cz = Math.sqrt(Math.max(0, 1 - across * across));
            q.nx = -ty * across;
            q.ny = tx * across;
            q.nz = cz;
            look(u, across, along, q, ww);
            return clamp((ww - dist) * P.res + 0.5) * (o.ends === false ? 1 : clamp(along * P.res + 0.5) * clamp((L - along) * P.res + 0.5));
        });
        return { line, L };
    }

    // The rope he let himself down by: strips torn from a blanket and a habit, twisted and
    // knotted end to end. Along `pts` (from where it is tied), `w` wide.
    function rope(P, pts, o = {}) {
        const w = o.w ?? 10, sd = S.seedOf(o.seed ?? 'rope'), r = Motion.rng('rope' + (o.seed ?? ''));
        const line = S.curve(pts, false, 10);
        let L = 0;
        for (let i = 1; i < line.length; i++) L += Math.hypot(line[i][0] - line[i - 1][0], line[i][1] - line[i - 1][1]);
        const knots = [];
        for (let d = 60 + r() * 40; d < L - 30; d += 90 + r() * 70) knots.push(d);
        const stuff = knots.map((_, i) => (i % 3 === 1 ? 1 : 0)); // 0 brown sayal, 1 a striped blanket
        const kind = (along) => {
            let i = 0;
            while (i < knots.length && knots[i] < along) i++;
            return [i, stuff[Math.min(stuff.length - 1, i)] ?? 0];
        };
        tube(P, line, (u) => {
            const along = u * L;
            let k = 0;
            for (const kd of knots) k = Math.max(k, 1 - Math.abs(along - kd) / 16);
            return w * (1 + 0.9 * smoothBump(clamp(k)));
        }, (u, a, along, q) => {
            const [i, st] = kind(along);
            const tw = Math.sin((along * 0.45 + a * 2.6) + i);
            let nearK = 0;
            for (const kd of knots) nearK = Math.max(nearK, 1 - Math.abs(along - kd) / 16);
            if (st === 1) {
                const stripe = Math.sin(along * 0.12 + i) > 0.55;
                q.r = stripe ? 0.36 : 0.66;
                q.g = stripe ? 0.24 : 0.6;
                q.b = stripe ? 0.16 : 0.5;
            } else {
                q.r = 0.38;
                q.g = 0.29;
                q.b = 0.2;
            }
            const fz = noise2(along * 0.3, a * 3, sd);
            q.r *= 0.85 + 0.3 * fz;
            q.g *= 0.85 + 0.3 * fz;
            q.b *= 0.85 + 0.3 * fz;
            q.h = 0.7 * tw + (hashI(Math.round(along * 2), Math.round(a * 8), 3, sd) - 0.5) * 0.7;
            if (nearK > 0) q.h += 0.6 * Math.sin(along * 0.9 + a * 4) * nearK;
            q.sp = 0;
            q.sh = 0.06;
        });
        // the frayed ends at each knot
        const at = (d) => {
            let acc = 0;
            for (let i = 1; i < line.length; i++) {
                const s = Math.hypot(line[i][0] - line[i - 1][0], line[i][1] - line[i - 1][1]);
                if (acc + s >= d) {
                    const t = (d - acc) / s;
                    return [lerp(line[i - 1][0], line[i][0], t), lerp(line[i - 1][1], line[i][1], t)];
                }
                acc += s;
            }
            return line[line.length - 1];
        };
        for (const kd of knots) {
            const [x, y] = at(kd);
            for (let k = 0; k < 2; k++) {
                const dir = r() < 0.5 ? -1 : 1, len = 14 + r() * 16;
                const end = S.curve([[x, y], [x + dir * len * 0.5, y + len * 0.3], [x + dir * len * 0.8, y + len * 0.9]], false, 5);
                tube(P, end, (u) => w * 0.5 * (1 - u * 0.6), (u, a, along, q) => {
                    q.r = 0.42;
                    q.g = 0.33;
                    q.b = 0.24;
                    q.h = 0.6 * Math.sin(along * 1.2 + a * 3);
                    q.sh = 0.06;
                });
                for (let f = 0; f < 5; f++) S.ink(P.a, [[end[end.length - 1][0], end[end.length - 1][1]], [end[end.length - 1][0] + (r() - 0.5) * 8, end[end.length - 1][1] + 4 + r() * 6]], { w: 0.6, color: '#5a4636', taper: [0, 1] });
            }
        }
        return { line, L, at };
    }

    // a forged iron bar, square in section, along pts
    function bar(P, pts, w = 9, seed = 'bar') {
        const sd = S.seedOf(seed);
        return tube(P, pts, w, (u, a, along, q) => {
            // square: two faces, a sharp arris between them
            const f = a < 0 ? -1 : 1;
            q.nx *= 0.4;
            q.ny *= 0.4;
            q.nz = 0.8;
            q.nx += q.nx * 0 + (f * 0.35);
            const rust = smooth(0.5, 0.7, noise2(along * 0.08, a, sd));
            q.r = lerp(0.2, 0.42, rust);
            q.g = lerp(0.19, 0.22, rust);
            q.b = lerp(0.22, 0.12, rust);
            q.h = (hashI(Math.round(along * 1.5), Math.round(a * 4), 2, sd) - 0.5) * 0.8 + 0.3 * Math.sin(along * 0.7);
            q.sp = 0.35 * (1 - rust);
            q.sh = 0.4;
            // the sawn end, bright
            if (along < 3) {
                q.r = 0.55;
                q.g = 0.55;
                q.b = 0.58;
                q.sp = 0.9;
            }
        });
    }

    // ------------------------------------------------------------------ the lantern put out
    // A pierced tin lantern hanging from its ring at (x, y): a cone of punched holes, a
    // drum with four panes of horn gone dark with soot, a candle stub inside with its wick
    // still smoking, a door with its latch, a dent. `s` its size (1 = 150 units tall).
    function lantern(P, o) {
        const { x, y, s = 1, seed = 'lantern' } = o;
        const sd = S.seedOf(seed), k = s;
        // profile below the ring: cap, cone, collar, drum, base
        const R = profile([[0, 3], [8, 6], [14, 14], [30, 28], [46, 40], [50, 42], [54, 38], [58, 38], [118, 38], [122, 42], [130, 40], [140, 30], [148, 24], [150, 22]].map(([yy, rr]) => [yy * k, rr * k]));
        const top = y + 14 * k;
        P.solid({ x: x - 45 * k, y: top, w: 90 * k, h: 152 * k }, (ux, uy, q) => {
            const yy = uy - top, rr = R(yy);
            if (rr <= 0) return 0;
            const s2 = (ux - x) / rr;
            if (Math.abs(s2) >= 1) return 0;
            const dr = (R(yy + 0.6) - R(yy - 0.6)) / 1.2;
            latheN(q, s2, dr);
            const phi = Math.asin(s2);
            // tin: dull grey, dark with smoke
            silverAt(q, ux, uy, sd, 0.55);
            q.r *= 0.85;
            q.g *= 0.83;
            q.b *= 0.8;
            q.sp = 0.45;
            q.sh = 0.5;
            const Y = yy / k;
            if (Y > 14 && Y < 46) {
                // the cone, punched in rows of holes and little stars
                const row = Math.floor((Y - 14) / 5.2), lon = phi * (8 + row * 2);
                const fr = (Y - 14) / 5.2 - row, fl = ((lon / Math.PI) % 1 + 1) % 1;
                const d = Math.hypot((fr - 0.5) * 5.2, (fl - 0.5) * (Math.PI * rr / (8 + row * 2)));
                if (d < 1.1 * k) {
                    q.r = q.g = q.b = 0.04;
                    q.h = -1;
                } else if (d < 1.8 * k) {
                    q.h = 0.6;
                    q.sp = 0.8;
                }
            } else if (Y > 58 && Y < 118) {
                // the drum: four panes of horn between strips of tin
                const pane = ((phi + Math.PI / 2) / (Math.PI / 2)) % 1;
                const strip = Math.min(pane, 1 - pane) * Math.PI / 2 * rr;
                if (strip > 3 * k && Y > 61 && Y < 115) {
                    const soot = smooth(100, 62, Y) * 0.6 + 0.3 * noise2(ux * 0.08, uy * 0.08, sd);
                    q.r = lerp(0.62, 0.12, soot);
                    q.g = lerp(0.48, 0.1, soot);
                    q.b = lerp(0.28, 0.1, soot);
                    q.sp = 0.6;
                    q.sh = 0.75;
                    q.tr = 0.3;
                    q.nx *= 0.3;
                    // the candle stub behind the horn
                    if (Math.abs(ux - x) < 7 * k && Y > 92) {
                        q.r += 0.15;
                        q.g += 0.13;
                        q.b += 0.08;
                    }
                    // a scratch in the soot
                    if (Math.abs((ux - x) * 0.6 - (Y - 80) * 0.3) < 0.5 && Math.abs(Y - 80) < 9) q.r += 0.25;
                } else {
                    q.h = 0.4;
                }
                // the door's latch
                if (Math.hypot(ux - x - rr * 0.55, Y - 88) < 3 * k) {
                    q.h = 1;
                    q.sp = 0.8;
                }
            } else if (Y >= 46 && Y <= 58) {
                q.h = 0.3 * Math.sin(Y * 2);
            }
            // a dent in the drum
            const dn = Math.hypot(ux - x + rr * 0.3, Y - 70);
            if (dn < 6) q.h += -0.8 * (1 - dn / 6);
            return clamp((rr - Math.abs(ux - x)) * P.res + 0.5);
        });
        // the ring and the hook it hangs from
        tube(P, S.ellipse(x, y + 6 * k, 7 * k, 8 * k, 20).concat([S.ellipse(x, y + 6 * k, 7 * k, 8 * k, 20)[0]]), 2.4 * k, (u, a, along, q) => {
            q.r = 0.22;
            q.g = 0.2;
            q.b = 0.22;
            q.sp = 0.5;
        }, { ends: false });
        return { top: [x, y], vent: [x, top + 4 * k] };
    }

    // ------------------------------------------------------------------ velvet hangings
    // The palio's velvet, night blue, over the box but an opening `open` { x0, x1, y0, y1, r }
    // (a rounded rectangle about the axis): hanging folds that catch the light at their
    // edges (velvet), a valance across the top with a band of gold embroidery in relief and a
    // bullion fringe hanging from it, worn patches in the pile, a pin.
    function velvet(P, o) {
        const b = o.box, sd = S.seedOf(o.seed ?? 'velvet'), r = Motion.rng('velvet' + (o.seed ?? ''));
        const OP = { x0: -240, x1: 240, y0: -190, y1: 200, r: 60, ...(o.open ?? {}) };
        const VAL = o.valance ?? OP.y0; // the valance's lower edge
        const COL = o.color ?? [0.14, 0.13, 0.3];
        const inOpen = (x, y) => {
            const cx = clamp(x, OP.x0 + OP.r, OP.x1 - OP.r), cy = clamp(y, OP.y0 + OP.r, OP.y1 - OP.r);
            return OP.r - Math.hypot(x - cx, y - cy); // > 0 inside
        };
        // embroidery: scrolls drawn as a relief field once
        const EB = { x: b.x, y: VAL - 70, w: b.w, h: 64 };
        const emb = S.reliefField(EB, 1.4, (q) => {
            q.fillStyle = '#fff';
            q.strokeStyle = '#fff';
            q.lineCap = 'round';
            // a repeat of pomegranates between symmetric sprays of leaves: filled shapes,
            // mirrored about each fruit, nothing that could be read as a letter
            const leafAt = (x, y, a, L, W) => {
                q.beginPath();
                q.ellipse(x + Math.cos(a) * L / 2, y + Math.sin(a) * L / 2, L / 2, W / 2, a, 0, TAU);
                q.fill();
            };
            for (let x = EB.x - 60; x < EB.x + EB.w + 60; x += 110) {
                const cy = EB.y + 32;
                // the fruit: a round body, its crown, a split showing seeds
                q.beginPath();
                q.arc(x, cy + 3, 11, 0, TAU);
                q.fill();
                for (const dx of [-5, 0, 5]) leafAt(x + dx * 0.6, cy - 7, -Math.PI / 2 + dx * 0.08, 8, 3.4);
                // the sprays either side, mirrored
                for (const sg of [-1, 1]) {
                    q.lineWidth = 3.2;
                    q.beginPath();
                    q.moveTo(x + sg * 12, cy + 6);
                    q.quadraticCurveTo(x + sg * 30, cy + 22, x + sg * 50, cy + 8);
                    q.stroke();
                    for (let k = 0; k < 4; k++) {
                        const t = 0.25 + k * 0.22, px = x + sg * (14 + 36 * t), py = cy + 6 + 14 * Math.sin(t * Math.PI) * 0.9;
                        leafAt(px, py, sg > 0 ? -0.9 - k * 0.15 : Math.PI + 0.9 + k * 0.15, 11 - k, 4.4);
                        leafAt(px, py, sg > 0 ? 0.7 : Math.PI - 0.7, 8 - k, 3.6);
                    }
                    // a small rosette between repeats
                    q.beginPath();
                    q.arc(x + sg * 55, cy - 12, 4.2, 0, TAU);
                    q.fill();
                }
            }
            q.lineWidth = 3;
            q.beginPath();
            q.moveTo(EB.x, EB.y + 4);
            q.lineTo(EB.x + EB.w, EB.y + 4);
            q.moveTo(EB.x, EB.y + 60);
            q.lineTo(EB.x + EB.w, EB.y + 60);
            q.stroke();
            for (let x = EB.x; x < EB.x + EB.w; x += 9) {
                q.beginPath();
                q.arc(x, EB.y + 10, 1.6, 0, TAU);
                q.arc(x + 4.5, EB.y + 54, 1.6, 0, TAU);
                q.fill();
            }
        }, 1.2);
        let rowY = NaN, k = 0;
        P.solid(b, (ux, uy, q) => {
            const inside = inOpen(ux, uy);
            if (uy > VAL && inside > -0.5) return 0;
            if (uy !== rowY) {
                rowY = uy;
                k = 0.5 + 0.6 * smooth(b.y, b.y + b.h, uy);
            }
            const valance = uy <= VAL;
            // folds: the valance gathered in small swags, the curtains in long folds
            let dh;
            if (valance) {
                const f = Math.sin(ux * 0.11 + Math.sin(uy * 0.02) * 0.5);
                dh = f * 0.6 * smooth(VAL - 180, VAL, uy);
                q.ny = 0.25 * Math.cos(ux * 0.11) * smooth(VAL - 30, VAL, uy);
            } else {
                dh = 0.8 * k * Math.cos(ux * 0.046 + 1.2 + 0.4 * Math.sin(uy * 0.004)) + 0.35 * k * Math.cos(ux * 0.13 + 2);
            }
            q.nx = -dh;
            q.nz = 1;
            const wear = smooth(0.66, 0.78, noise2(ux * 0.02, uy * 0.02, sd + 1));
            const m = noise2(ux * 0.06, uy * 0.06, sd) * 0.05;
            q.r = COL[0] + m + wear * 0.05;
            q.g = COL[1] + m + wear * 0.03;
            q.b = COL[2] + m - wear * 0.04;
            q.sh = 0.01; // velvet
            q.h = (hashI(Math.round(ux * 2), Math.round(uy * 2), 1, sd) - 0.5) * 0.35;
            // the embroidery: gold thread laid over a raised padding
            if (uy > EB.y && uy < EB.y + EB.h) {
                const e = emb(ux, uy);
                if (e > 0.3) {
                    const gl = Math.sin((ux * 0.8 + uy * 1.6)) * 0.5 + 0.5; // the thread's lay
                    q.r = 0.78 - 0.2 * gl;
                    q.g = 0.57 - 0.15 * gl;
                    q.b = 0.26 - 0.08 * gl;
                    q.sp = 0.8;
                    q.sh = 0.45;
                    q.h = e * 1.4 + 0.3 * gl;
                    q.nx += (emb(ux + 1, uy) - emb(ux - 1, uy)) * -1.2;
                    q.ny += (emb(ux, uy + 1) - emb(ux, uy - 1)) * -1.2;
                }
            }
            return clamp(Math.max(-inside, uy <= VAL ? 1 : -inside) * P.res + 0.5);
        });
        // the bullion fringe under the valance: twisted cords, each its own length
        for (let x = b.x; x < b.x + b.w; x += 5.5 + r() * 2) {
            const len = 30 + r() * 10, sway = (r() - 0.5) * 3;
            const pts = [[x, VAL - 4], [x + sway * 0.5, VAL + len * 0.5], [x + sway, VAL + len]];
            tube(P, pts, 4.6, (u, a, along, q) => {
                const tw = Math.sin(along * 1.5 + a * 2.5);
                q.r = 0.72 + 0.08 * tw;
                q.g = 0.52 + 0.06 * tw;
                q.b = 0.24;
                q.h = 0.8 * tw;
                q.sp = 0.7;
                q.sh = 0.5;
            });
        }
    }

    // ------------------------------------------------------------------ a silver jar
    // The jarra of a paso, chased silver: a foot, a gadrooned belly, a neck, a lip. The
    // lip's middle at (x, y), `h` tall. Returns the mouth.
    function jar(P, o) {
        const { x, y, h = 120, seed = 'jar' } = o, k = h / 120, sd = S.seedOf(seed);
        const R = profile([[0, 22], [3, 26], [6, 24], [14, 17], [26, 20], [44, 36], [62, 42], [78, 38], [92, 26], [100, 16], [106, 14], [110, 18], [114, 22], [118, 20], [120, 18]].map(([yy, rr]) => [yy * k, rr * k]));
        P.solid({ x: x - 46 * k, y: y - 1, w: 92 * k, h: h + 2 }, (ux, uy, q) => {
            const yy = uy - y, rr = R(yy);
            if (rr <= 0) return 0;
            const s = (ux - x) / rr;
            if (Math.abs(s) >= 1) return 0;
            latheN(q, s, (R(yy + 0.6) - R(yy - 0.6)) / 1.2);
            const curv = (R(yy + 1.5) + R(yy - 1.5) - 2 * rr) / 2.25;
            silverAt(q, ux, uy, sd, clamp(curv * 1.2 + Math.pow(Math.abs(s), 6) * 0.3));
            const Y = yy / k, phi = Math.asin(s);
            if (Y > 40 && Y < 82) {
                const lobe = Math.cos(phi * 9 + sd);
                q.h += 0.7 * lobe * Math.sin(((Y - 40) / 42) * Math.PI);
            }
            if (Y > 84 && Y < 100) {
                // chased leaves round the shoulder
                const lf = Math.abs(Math.sin(phi * 6)) - (Y - 84) / 16;
                q.h += 0.6 * smooth(0, 0.2, lf);
            }
            if (Y < 6 || (Y > 106 && Y < 114)) q.h += 0.4 * Math.sin(phi * 30); // beading
            return clamp((rr - Math.abs(ux - x)) * P.res + 0.5);
        });
        return { x, y, r: 18 * k };
    }

    // ------------------------------------------------------------------ lilies
    // Madonna lilies (Lilium candidum) on one stem from (x, y) along `pts`: narrow leaves
    // scattered up the stem, buds and open flowers at the top on short pedicels. Each flower
    // `{ u, a, s, open }` (where on the stem, the angle it faces, size, 0 bud … 1 open).
    function lily(P, o) {
        const sd = S.seedOf(o.seed ?? 'lily'), r = Motion.rng('lily' + (o.seed ?? ''));
        const st = tube(P, o.pts, (u) => 5.2 - u * 2, (u, a, along, q) => {
            q.r = 0.32;
            q.g = 0.44;
            q.b = 0.22;
            q.h = 0.2 * Math.sin(a * 3);
            q.sp = 0.2;
            q.sh = 0.4;
        });
        const line = st.line;
        const at = (u) => {
            const i = Math.min(line.length - 2, Math.floor(u * (line.length - 1)));
            const p = line[i], q2 = line[i + 1];
            return { x: p[0], y: p[1], a: Math.atan2(q2[1] - p[1], q2[0] - p[0]) };
        };
        // the leaves: narrow, alternate, pointing up the stem
        for (let u = 0.05; u < 0.7; u += 0.045 + r() * 0.03) {
            const p = at(u), side = r() < 0.5 ? -1 : 1, a = p.a + side * (0.35 + r() * 0.35), L = 46 + r() * 30;
            const tip = [p.x + Math.cos(a) * L, p.y + Math.sin(a) * L + 6];
            const mid = [p.x + Math.cos(a) * L * 0.5 + Math.cos(a + side * 1.57) * 2, p.y + Math.sin(a) * L * 0.5];
            tube(P, [[p.x, p.y], mid, tip], (t) => 9 * Math.sin(Math.PI * Math.pow(t, 0.8)) + 0.5, (t, ac, along, q) => {
                const vein = Math.abs(ac) < 0.12 ? 0.08 : 0;
                q.r = 0.26 + vein;
                q.g = 0.4 + vein;
                q.b = 0.2;
                q.ny += 0.3 * side;
                q.h = Math.abs(ac) < 0.1 ? -0.5 : 0.1 * Math.sin(ac * 8);
                q.sp = 0.35;
                q.sh = 0.55;
            });
        }
        for (const fl of o.flowers ?? []) flower(P, at(fl.u), fl, sd + Math.round(fl.u * 100));
    }
    // one lily flower (or bud) at the stem point p: a pedicel, then the trumpet facing `a`
    function flower(P, p, fl, sd) {
        const s = fl.s ?? 1, a = fl.a ?? -1.2, open = fl.open ?? 1, r = Motion.rng('flower' + sd);
        const ped = [[p.x, p.y], [p.x + Math.cos(a) * 14 * s, p.y + Math.sin(a) * 10 * s - 4 * s], [p.x + Math.cos(a) * 24 * s, p.y + Math.sin(a) * 22 * s]];
        tube(P, ped, 3.2 * s, (u, ac, along, q) => {
            q.r = 0.34;
            q.g = 0.46;
            q.b = 0.24;
            q.sp = 0.2;
        });
        const b = ped[2], ca = Math.cos(a), sa = Math.sin(a), na = [-sa, ca];
        const F = (u, v) => [b[0] + ca * u * s + na[0] * v * s, b[1] + sa * u * s + na[1] * v * s];
        if (open < 0.5) {
            // a bud: a long club, green at its foot, the tepals' seams down it
            const pts = [];
            for (let i = 0; i <= 24; i++) {
                const u = (i / 24) * 70, w = 9 * Math.sin(Math.PI * Math.pow(u / 70, 0.6)) * (u < 10 ? 0.6 + u / 25 : 1);
                pts.push(F(u, w));
            }
            for (let i = 24; i >= 0; i--) {
                const u = (i / 24) * 70, w = 9 * Math.sin(Math.PI * Math.pow(u / 70, 0.6)) * (u < 10 ? 0.6 + u / 25 : 1);
                pts.push(F(u, -w));
            }
            const bb = S.bbox(pts, 2);
            P.solid(bb, (ux, uy, q) => {
                const dx = ux - b[0], dy = uy - b[1], u = (dx * ca + dy * sa) / s, v = (dx * na[0] + dy * na[1]) / s;
                const w = 9 * Math.sin(Math.PI * Math.pow(clamp(u / 70), 0.6)) * (u < 10 ? 0.6 + u / 25 : 1);
                if (u < 0 || u > 70 || Math.abs(v) >= w) return 0;
                const t = v / w;
                q.nx = na[0] * t;
                q.ny = na[1] * t;
                q.nz = Math.sqrt(1 - t * t);
                const g = smooth(40, 0, u);
                q.r = lerp(0.9, 0.62, g);
                q.g = lerp(0.88, 0.72, g);
                q.b = lerp(0.76, 0.44, g);
                q.h = Math.abs(Math.sin(t * 2.4)) < 0.08 ? -0.6 : 0;
                q.tr = 0.4;
                q.sp = 0.3;
                return clamp((w - Math.abs(v)) * s * P.res + 0.5);
            });
            return;
        }
        // the trumpet: back tepals, the stamens and the style, front tepals
        const L = 78;
        const tepal = (ang, front, kk) => {
            // a tepal from the throat outwards, flaring, its tip curled back
            const spread = ang, len = L * (0.92 + r() * 0.12), wid = (front ? 15 : 13) * (0.9 + r() * 0.2);
            const pts = [];
            const pos = (t, side) => {
                const flare = Math.pow(t, 1.8) * 30 * spread;
                const curl = smooth(0.78, 1, t) * 10 * (front ? 1 : 0.6);
                const w = wid * Math.sin(Math.PI * Math.pow(t, 0.75)) * (0.35 + 0.65 * t) * side;
                return F(len * t - curl * 0.3, flare + w + (side > 0 ? 0 : 0) + curl * Math.sign(spread || 1) * 0.6);
            };
            for (let i = 0; i <= 20; i++) pts.push(pos(i / 20, 1));
            for (let i = 20; i >= 0; i--) pts.push(pos(i / 20, -1));
            const bb = S.bbox(pts, 2);
            const cx = pos(0.5, 0);
            P.each({ a: '#fff', b: '#808080', m: `rgb(${0.25 * 255},${0.4 * 255},${0.55 * 255})` }, (q) => {
                q.beginPath();
                S.trace(q, pts);
                q.fill();
            });
            // albedo: white, green in the throat, a little cream at the tip; the back of the
            // curl greyer; veins as faint grooves
            const g0 = F(0, 0), g1 = pos(1, 0);
            const ga = P.a.createLinearGradient(g0[0], g0[1], g1[0], g1[1]);
            ga.addColorStop(0, '#9fb07a');
            ga.addColorStop(0.28, '#e6ead4');
            ga.addColorStop(0.7, front ? '#f4f1e8' : '#d8d6cc');
            ga.addColorStop(1, '#e8e2cc');
            P.a.save();
            P.a.beginPath();
            S.trace(P.a, pts);
            P.a.clip();
            P.a.fillStyle = ga;
            P.a.fill();
            P.a.restore();
            // the normal: a trough across the tepal (its edges turn towards the middle), and
            // the curl at the tip faces back
            const nrm = P.n;
            nrm.save();
            nrm.beginPath();
            S.trace(nrm, pts);
            nrm.clip();
            const e0 = pos(0.55, 1), e1 = pos(0.55, -1);
            const gn = nrm.createLinearGradient(e0[0], e0[1], e1[0], e1[1]);
            const enc = (v) => `rgb(${128 + 127 * v[0]},${128 + 127 * v[1]},${128 + 127 * v[2]})`;
            const sideN = (t) => {
                const k = (front ? 0.65 : -0.45) * t;
                const l = Math.hypot(na[0] * k, na[1] * k, 1);
                return [(na[0] * k) / l, (na[1] * k) / l, 1 / l];
            };
            gn.addColorStop(0, enc(sideN(-1)));
            gn.addColorStop(0.5, enc([0, 0, 1]));
            gn.addColorStop(1, enc(sideN(1)));
            nrm.fillStyle = gn;
            nrm.fill();
            nrm.restore();
            // the veins
            for (let k = -2; k <= 2; k++) {
                const vp = [];
                for (let i = 2; i <= 18; i++) {
                    const t = i / 20, a0 = pos(t, 1), a1 = pos(t, -1), f = 0.5 + k * 0.17;
                    vp.push([lerp(a1[0], a0[0], f), lerp(a1[1], a0[1], f)]);
                }
                S.ink(P.b, vp, { w: k === 0 ? 1.4 : 0.7, color: '#606060', alpha: 0.8 });
            }
            void bb; void cx; void kk;
        };
        // back tepals
        tepal(-0.9, false, 0);
        tepal(0.05, false, 1);
        tepal(0.9, false, 2);
        // stamens: pale filaments, anthers rocking on their tips, pollen
        for (let i = 0; i < 6; i++) {
            const sp = (i / 5 - 0.5) * 1.5, len = 66 + r() * 10;
            const f = [F(10, sp * 3), F(40, sp * 10), F(len, sp * 22 + 4)];
            tube(P, f, 1.8 * s, (u, ac, along, q) => {
                q.r = 0.8;
                q.g = 0.84;
                q.b = 0.6;
                q.tr = 0.4;
            });
            const t = f[2], aa = a + (r() - 0.5) * 1.4;
            const an = [[t[0] - Math.cos(aa) * 6 * s, t[1] - Math.sin(aa) * 6 * s], [t[0] + Math.cos(aa) * 6 * s, t[1] + Math.sin(aa) * 6 * s]];
            tube(P, an, 4.2 * s, (u, ac, along, q) => {
                q.r = 0.86;
                q.g = 0.56;
                q.b = 0.12;
                q.h = (hashI(Math.round(along * 4), Math.round(ac * 4), 1, sd + i) - 0.5) * 1.2;
                q.tr = 0.2;
            });
        }
        // the style and its three-lobed stigma
        const sty = [F(8, 0), F(50, 2), F(84, 5)];
        tube(P, sty, 2.2 * s, (u, ac, along, q) => {
            q.r = 0.72;
            q.g = 0.8;
            q.b = 0.56;
        });
        tube(P, [F(82, 3), F(88, 7)], 5 * s, (u, ac, along, q) => {
            q.r = 0.66;
            q.g = 0.72;
            q.b = 0.42;
            q.h = Math.sin(ac * 6) * 0.8;
        });
        // front tepals
        tepal(-0.5, true, 3);
        tepal(0.5, true, 4);
        // pollen fallen on a tepal
        for (let i = 0; i < 9; i++) {
            const pp = F(40 + r() * 30, (r() - 0.5) * 18);
            S.ink(P.a, [[pp[0], pp[1]], [pp[0] + 0.6, pp[1] + 0.4]], { w: 1.4 * s, color: '#d0901c' });
        }
    }

    // ------------------------------------------------------------------ the silver lantern on its pole
    // The farol that goes with the cross at the head of a cofradía: a hexagonal lantern of
    // chased silver and glass, a crest of pierced leaves round its top, a dome and a ball,
    // a candle burning inside; on a pole sheathed in silver with knops. Its flame at the
    // returned point. (x, y): the middle of the glass.
    function farol(P, o) {
        const { x, y, s = 1, seed = 'farol', pole = 700 } = o, sd = S.seedOf(seed);
        const GW = 44 * s, GH = 96 * s;
        // the pole: a tube of silver with knops and turned rings
        const top = y + GH * 0.5 + 40 * s;
        tube(P, [[x, top], [x, top + pole]], (u) => (10 + 7 * Math.exp(-(((u * pole - 30) / 10) ** 2)) + 6 * Math.exp(-(((u * pole - 160) / 14) ** 2)) + 4 * Math.exp(-(((u * pole - 320) / 8) ** 2))) * s, (u, a, along, q) => {
            silverAt(q, along, a, sd, 0.2 + 0.2 * Math.abs(a));
            q.h = 0.4 * Math.sin(along * 0.5) * smooth(20, 40, along) * smooth(60, 40, along) + 0.15 * Math.sin(along * 2.1);
        });
        // the base: a cone with gadroons, from the glass down to the pole
        const R = profile([[0, 44], [6, 48], [12, 46], [20, 36], [30, 20], [38, 14], [40, 12]].map(([yy, rr]) => [yy * s, rr * s]));
        const by = y + GH * 0.5;
        P.solid({ x: x - 50 * s, y: by - 1, w: 100 * s, h: 42 * s }, (ux, uy, q) => {
            const yy = uy - by, rr = R(yy);
            if (rr <= 0) return 0;
            const sx = (ux - x) / rr;
            if (Math.abs(sx) >= 1) return 0;
            latheN(q, sx, (R(yy + 0.6) - R(yy - 0.6)) / 1.2);
            silverAt(q, ux, uy, sd, 0.15);
            q.h = 0.6 * Math.cos(Math.asin(sx) * 10) * smooth(10, 16, yy / s);
            return clamp((rr - Math.abs(ux - x)) * P.res + 0.5);
        });
        // the glass: six panes, three seen, framed by silver posts; the candle inside
        P.solid({ x: x - GW - 2, y: y - GH / 2, w: GW * 2 + 4, h: GH }, (ux, uy, q) => {
            const sx = (ux - x) / GW;
            if (Math.abs(sx) >= 1) return 0;
            // a hexagon seen from the front: posts at sx = ±1 and ±0.5
            const post = Math.min(Math.abs(Math.abs(sx) - 0.5), Math.abs(Math.abs(sx) - 1)) * GW;
            if (post < 3.2 * s) {
                silverAt(q, ux, uy, sd, 0.1);
                q.nx = Math.sign(sx) * (Math.abs(sx) > 0.75 ? 0.7 : 0.3);
                q.nz = 0.7;
                q.h = 0.5 * Math.sin(uy * 0.8);
                return 1;
            }
            // the glass: dark, a little of the candle's light caught in it, reflections
            const face = Math.abs(sx) > 0.5 ? Math.sign(sx) * 0.5 : 0;
            q.nx = face;
            q.nz = 1;
            q.r = 0.1;
            q.g = 0.09;
            q.b = 0.12;
            q.sp = 0.9;
            q.sh = 0.95;
            // the candle inside
            if (Math.abs(ux - x) < 7 * s && uy > y - 6 * s) {
                q.r = 0.95;
                q.g = 0.86;
                q.b = 0.66;
                q.tr = 0.9;
                q.sp = 0.3;
            }
            return 1;
        });
        // the frame: a cornice above, a moulding below
        for (const [yy, hh] of [[y - GH / 2 - 8 * s, 10 * s], [y + GH / 2 - 2 * s, 8 * s]]) {
            P.solid({ x: x - GW - 8 * s, y: yy, w: GW * 2 + 16 * s, h: hh }, (ux, uy, q) => {
                const t = (uy - yy) / hh, sx = (ux - x) / (GW + 7 * s);
                if (Math.abs(sx) >= 1) return 0;
                q.ny = (t - 0.5) * 1.6;
                q.nx = sx * 0.6;
                q.nz = 1;
                silverAt(q, ux, uy, sd, 0.1);
                q.h = 0.5 * Math.sin(ux * 1.4);
                return clamp((1 - Math.abs(sx)) * GW * P.res);
            });
        }
        // the crest: pierced leaves standing round the top, a dome, a ball
        const cy = y - GH / 2 - 8 * s;
        for (let i = -3; i <= 3; i++) {
            const lx = x + i * 14 * s * (1 - Math.abs(i) * 0.03), lh = (22 - Math.abs(i) * 2) * s;
            const pts = S.curve([[lx - 6 * s, cy], [lx - 7 * s, cy - lh * 0.5], [lx - 2 * s, cy - lh * 0.9], [lx, cy - lh], [lx + 2 * s, cy - lh * 0.9], [lx + 7 * s, cy - lh * 0.5], [lx + 6 * s, cy]], true, 5);
            poly(P, pts, { a: '#7e7e8c', n: [i * 0.08, -0.4, 1], sp: 0.85, sh: 0.7 });
            // the piercing
            S.ink(P.a, [[lx, cy - 3 * s], [lx, cy - lh * 0.6]], { w: 2 * s, color: '#0a0910' });
        }
        const D = profile([[0, 3], [6, 9], [16, 22], [28, 34], [34, 38]].map(([yy, rr]) => [yy * s, rr * s]));
        const dy = cy - 40 * s;
        P.solid({ x: x - 40 * s, y: dy, w: 80 * s, h: 36 * s }, (ux, uy, q) => {
            const yy = uy - dy, rr = D(yy);
            if (rr <= 0) return 0;
            const sx = (ux - x) / rr;
            if (Math.abs(sx) >= 1) return 0;
            latheN(q, sx, (D(yy + 0.6) - D(yy - 0.6)) / 1.2);
            silverAt(q, ux, uy, sd, 0.2);
            q.h = 0.5 * Math.cos(Math.asin(sx) * 8);
            return clamp((rr - Math.abs(ux - x)) * P.res + 0.5);
        });
        P.solid({ x: x - 9 * s, y: dy - 18 * s, w: 18 * s, h: 19 * s }, (ux, uy, q) => {
            const dx = (ux - x) / (8 * s), dyy = (uy - dy + 9 * s) / (8 * s), d = Math.hypot(dx, dyy);
            if (d >= 1) return 0;
            q.nx = dx;
            q.ny = dyy;
            q.nz = Math.sqrt(1 - d * d);
            silverAt(q, ux, uy, sd, 0);
            return clamp((1 - d) * 8 * s * P.res + 0.5);
        });
        return { fx: x, fy: y - 8 * s };
    }

    // ------------------------------------------------------------------ a chain
    function chain(P, pts, o = {}) {
        const w = o.w ?? 5, sd = S.seedOf(o.seed ?? 'chain'), link = o.link ?? 9;
        return tube(P, pts, w, (u, a, along, q) => {
            // links alternately flat and on edge: an oval with its hole, a bar
            const k = Math.floor(along / link), f = along / link - k;
            silverAt(q, along, a, sd, 0.3);
            if (k % 2) {
                q.nx *= 0.4;
                q.h = 0.5;
                if (Math.abs(a) < 0.3) q.h = 1;
            } else {
                const hole = Math.hypot((f - 0.5) * 2.2, a * 1.6);
                if (hole < 0.6) {
                    q.r = q.g = q.b = 0.03;
                    q.sp = 0;
                } else q.h = 0.6 * Math.sin(hole * 3);
            }
            if (f < 0.1 || f > 0.9) q.h -= 0.6;
        }, { seg: 6 });
    }

    // ------------------------------------------------------------------ the thurible
    // A silver thurible hanging at (x, y) (the top of its lid's finial) on three chains going
    // up out of the frame to `hang`; smoke pouring from the lid's piercings, drifting `drift`.
    function thurible(P, o) {
        const { x, y, s = 1, seed = 'thurible', hang = -800 } = o, sd = S.seedOf(seed);
        for (const dx of [-26, 0, 26]) chain(P, [[x + dx * s * 0.6, y + 70 * s + (dx ? 0 : -60 * s)], [x + dx * s * 0.3, y - 100 * s], [x + dx * 0.05, hang]], { w: 4.6 * s, link: 9 * s, seed: seed + dx });
        const R = profile([[0, 4], [8, 6], [12, 12], [22, 10], [30, 18], [44, 22], [56, 30], [72, 36], [80, 40], [84, 38], [96, 42], [112, 40], [126, 30], [134, 18], [140, 14], [146, 22], [150, 24], [154, 18]].map(([yy, rr]) => [yy * s, rr * s]));
        P.solid({ x: x - 46 * s, y: y - 1, w: 92 * s, h: 156 * s }, (ux, uy, q) => {
            const yy = uy - y, rr = R(yy);
            if (rr <= 0) return 0;
            const sx = (ux - x) / rr;
            if (Math.abs(sx) >= 1) return 0;
            latheN(q, sx, (R(yy + 0.6) - R(yy - 0.6)) / 1.2);
            const Y = yy / s, phi = Math.asin(sx);
            const curv = (R(yy + 1.5) + R(yy - 1.5) - 2 * rr) / 2.25;
            silverAt(q, ux, uy, sd, clamp(curv * 1.3 + 0.15));
            if (Y > 26 && Y < 80) {
                // the lid: flame-shaped piercings in tiers, coals glowing through the lowest
                const tier = Math.floor((Y - 26) / 18), f = ((Y - 26) / 18) % 1;
                const cell = ((phi * (5 + tier) / Math.PI) % 1 + 1) % 1;
                const flame = Math.abs(cell - 0.5) < 0.18 * Math.sin(f * Math.PI) * (1 - f * 0.4);
                if (flame) {
                    q.r = tier === 2 ? 0.5 : 0.03;
                    q.g = tier === 2 ? 0.16 : 0.02;
                    q.b = 0.03;
                    q.sp = 0;
                    q.tr = tier === 2 ? 0.6 : 0;
                    q.h = -1;
                } else q.h = 0.3;
            }
            if (Y > 84 && Y < 130) q.h += 0.7 * Math.cos(phi * 8 + sd) * Math.sin(((Y - 84) / 46) * Math.PI);
            if (Math.abs(Y - 82) < 2) q.h += 0.8 * Math.sin(phi * 40);
            return clamp((rr - Math.abs(ux - x)) * P.res + 0.5);
        });
        // smoke from the piercings: thick, rolling
        for (const [k, dx] of [[0, -14], [1, 8], [2, 22]]) smoke(P, x + dx * s, y + 40 * s, { seed: seed + 'smoke' + k, h: o.smokeH ?? 700, n: 22, wide: 3.2, still: 10, drift: o.drift ?? -0.9, alpha: 0.75, freq: 0.008, amp: 1.6, turb: 1.4, tint: '#c4c0d8' });
        return { coals: [x, y + 64 * s] };
    }

    // ------------------------------------------------------------------ gold leaf
    // A pixel of gilding: leaves laid in squares that overlap at their seams, burnished in
    // places and matt in others, cracked, the bole showing red-brown where it has worn.
    function gilt(q, ux, uy, sd, o = {}) {
        const L = 28, fx = ((ux % L) + L) % L, fy = ((uy % L) + L) % L;
        const seam = Math.min(fx, fy) < 1.2 ? 1 : 0;
        const leaf = hashI(Math.floor(ux / L), Math.floor(uy / L), 3, sd);
        const silver = o.silver ?? false;
        const worn = smooth(0.7, 0.78, noise2(ux * 0.05, uy * 0.05, sd + 4)) * (o.wear ?? 1);
        if (silver) {
            // silver leaf gone dark: grey-violet, black where it has tarnished most
            const tn = smooth(0.3, 0.7, noise2(ux * 0.02, uy * 0.02, sd + 6));
            q.r = lerp(0.62, 0.22, tn);
            q.g = lerp(0.62, 0.2, tn);
            q.b = lerp(0.68, 0.26, tn);
            q.sp = lerp(0.9, 0.3, tn);
        } else {
            q.r = 0.82 + leaf * 0.08;
            q.g = 0.62 + leaf * 0.06;
            q.b = 0.28 + leaf * 0.04;
            q.sp = 0.6 + 0.4 * leaf;
        }
        q.sh = 0.55 + 0.25 * leaf;
        q.h += seam * 0.5;
        if (seam) {
            q.r *= 0.9;
            q.g *= 0.88;
        }
        // cracks in the gesso
        const cr = Math.abs(noise2(ux * 0.06, uy * 0.06, sd + 8) - 0.5);
        if (cr < 0.012) {
            q.r *= 0.45;
            q.g *= 0.4;
            q.b *= 0.4;
            q.h -= 0.8;
        }
        if (worn) {
            q.r = lerp(q.r, 0.42, worn);
            q.g = lerp(q.g, 0.2, worn);
            q.b = lerp(q.b, 0.12, worn);
            q.sp *= 1 - worn * 0.8;
        }
    }

    // ------------------------------------------------------------------ the board of circles
    // A board painted blue-black, cracked with age, over the box but a round opening of
    // radius `R0`: concentric circles in gold and silver leaf about the opening (Ibn Arabi's
    // spheres), a ring of interlaced circles, and below it the mount drawn as a diagram of
    // its paths: the narrow one straight up the middle to the circles, the two wide ones
    // winding and ending short. Punched dots along some lines. No words anywhere.
    function circles(P, o) {
        const b = o.box, sd = S.seedOf(o.seed ?? 'circles'), R0 = o.R0 ?? 205;
        // [radius, width, kind]: 0 gold, 1 silver, 2 punched dots, 3 a double line
        const RINGS = o.rings ?? [[R0 + 12, 9, 0], [R0 + 36, 4, 1], [R0 + 70, 6, 3], [R0 + 132, 5, 2], [R0 + 205, 8, 0], [R0 + 290, 4, 1], [R0 + 392, 6, 3], [R0 + 520, 9, 0], [R0 + 680, 4, 2], [R0 + 860, 7, 0]];
        const IR = o.interlace ?? { n: 8, c: R0 + 175, r: 92, w: 6 };
        const centres = [];
        for (let i = 0; i < IR.n; i++) centres.push([Math.cos((i / IR.n) * TAU - Math.PI / 2) * IR.c, Math.sin((i / IR.n) * TAU - Math.PI / 2) * IR.c]);
        // the mount: its flanks, the paths
        const MT = o.mount ?? true;
        const mountL = S.curve([[-1000, 720], [-760, 520], [-560, 380], [-380, 290], [-250, 236]], false, 10);
        const mountR = mountL.map(([x, y]) => [-x * 1.03, y + 6]);
        const pathL = S.curve([[-120, 720], [-160, 600], [-300, 560], [-360, 470], [-300, 400], [-380, 340], [-440, 330]], false, 10);
        const pathR = S.curve([[130, 720], [190, 620], [320, 590], [380, 500], [330, 430], [410, 380], [470, 388]], false, 10);
        const segDist = (pts, x, y) => {
            let best = 1e9, along = 0, acc = 0;
            for (let i = 1; i < pts.length; i++) {
                const a = pts[i - 1], c = pts[i], vx = c[0] - a[0], vy = c[1] - a[1], d2 = vx * vx + vy * vy, d = Math.sqrt(d2);
                const u = clamp(((x - a[0]) * vx + (y - a[1]) * vy) / (d2 || 1));
                const dd = Math.hypot(x - a[0] - vx * u, y - a[1] - vy * u);
                if (dd < best) {
                    best = dd;
                    along = acc + u * d;
                }
                acc += d;
            }
            return [best, along];
        };
        const lines = MT ? [[mountL, 7, 0], [mountR, 7, 0], [pathL, 4, 1], [pathR, 4, 1]] : [];
        const lineBox = lines.map(([pts, w]) => S.bbox(pts, w + 4));
        P.solid(b, (ux, uy, q) => {
            const rr = Math.hypot(ux, uy);
            if (rr < R0 - 0.5) return 0;
            // the board: blue-black paint, brushed, cracked into islands
            const m = noise2(ux * 0.01, uy * 0.01, sd) * 0.04 + noise2(ux * 0.07, uy * 0.02, sd + 1) * 0.02;
            q.r = 0.1 + m;
            q.g = 0.1 + m;
            q.b = 0.2 + m * 1.5;
            q.sp = 0.25;
            q.sh = 0.5;
            const crk = Math.abs(noise2(ux * 0.035, uy * 0.035, sd + 2) - 0.5);
            q.h = (crk < 0.01 ? -1 : 0) + 0.2 * Math.sin(ux * 0.9 + noise2(ux * 0.05, uy * 0.3, sd) * 5);
            if (crk < 0.01) {
                q.r *= 0.5;
                q.g *= 0.5;
                q.b *= 0.5;
            }
            let hit = false;
            // concentric circles
            for (const [R, w, kind] of RINGS) {
                const d = Math.abs(rr - R);
                if (kind === 3) {
                    if (Math.abs(d - w * 0.9) < w * 0.35) {
                        gilt(q, ux, uy, sd);
                        q.h += 0.5;
                        hit = true;
                    }
                } else if (kind === 2) {
                    if (d < w * 0.25) {
                        gilt(q, ux, uy, sd);
                        hit = true;
                    }
                    const ang = Math.atan2(uy, ux), step = 14 / R, k = Math.round(ang / step), px = Math.cos(k * step) * (R + w), py = Math.sin(k * step) * (R + w);
                    const dd = Math.hypot(ux - px, uy - py);
                    if (dd < 2.6) {
                        gilt(q, ux, uy, sd);
                        q.nx = (ux - px) / 2.6;
                        q.ny = (uy - py) / 2.6;
                        q.nz = 0.6;
                        hit = true;
                    }
                } else if (d < w / 2) {
                    gilt(q, ux, uy, sd, { silver: kind === 1 });
                    const t = (rr - R) / (w / 2);
                    q.nx = (ux / rr) * t * 0.5;
                    q.ny = (uy / rr) * t * 0.5;
                    q.nz = 1;
                    hit = true;
                }
            }
            // the interlace: each ring over the next at its outer crossing, under at the inner
            let best = null;
            for (let i = 0; i < IR.n; i++) {
                const [cx, cy] = centres[i], d = Math.abs(Math.hypot(ux - cx, uy - cy) - IR.r);
                if (d < IR.w / 2 + 1.6) {
                    const prev = (i + IR.n - 1) % IR.n, next = (i + 1) % IR.n;
                    let rank = 0;
                    for (const j of [prev, next]) {
                        const dj = Math.abs(Math.hypot(ux - centres[j][0], uy - centres[j][1]) - IR.r);
                        if (dj < IR.w / 2 + 2) {
                            const outer = rr > IR.c;
                            const iOver = (j === next) === outer;
                            rank += iOver ? 1 : -1;
                        }
                    }
                    if (!best || rank > best.rank) best = { i, d, rank };
                }
            }
            if (best) {
                if (best.d < IR.w / 2) {
                    gilt(q, ux, uy, sd + best.i, { silver: best.i % 2 === 1, wear: 0.6 });
                    const [cx, cy] = centres[best.i], l = Math.hypot(ux - cx, uy - cy), t = (l - IR.r) / (IR.w / 2);
                    q.nx = ((ux - cx) / l) * t * 0.6;
                    q.ny = ((uy - cy) / l) * t * 0.6;
                    q.nz = 1;
                    if (best.rank < 0) {
                        q.r *= 0.55;
                        q.g *= 0.55;
                        q.b *= 0.55;
                    }
                    hit = true;
                } else if (!hit) {
                    // the shadow of the line on the board
                    q.r *= 0.6;
                    q.g *= 0.6;
                    q.b *= 0.6;
                }
            }
            // the mount and its paths
            for (let k = 0; k < lines.length; k++) {
                const bb = lineBox[k];
                if (ux < bb.x || ux > bb.x + bb.w || uy < bb.y || uy > bb.y + bb.h) continue;
                const [pts, w, kind] = lines[k];
                const [d, along] = segDist(pts, ux, uy);
                if (d < w / 2) {
                    gilt(q, ux, uy, sd + 9, { silver: kind === 1 });
                    hit = true;
                }
                // the wide paths end in a bar across them: they go nowhere
                const end = pts[pts.length - 1], pr = pts[pts.length - 3];
                const ex = end[0] - pr[0], ey = end[1] - pr[1], el = Math.hypot(ex, ey);
                if (kind === 1 && Math.abs(((ux - end[0]) * ex + (uy - end[1]) * ey) / el) < 2.2 && Math.abs(((ux - end[0]) * -ey + (uy - end[1]) * ex) / el) < 12) {
                    gilt(q, ux, uy, sd + 9, { silver: true });
                    hit = true;
                }
                void along;
            }
            // the narrow path: two lines straight up the middle, steps between them
            if (MT && uy > R0 + 4 && Math.abs(ux) < 20) {
                const ax = Math.abs(ux);
                if (Math.abs(ax - 15) < 2.4 || (Math.abs(((uy - R0) % 26) - 13) < 1.6 && ax < 14)) {
                    gilt(q, ux, uy, sd + 11);
                    hit = true;
                }
            }
            void hit;
            return clamp((rr - R0) * P.res + 0.5);
        });
    }

    // ------------------------------------------------------------------ the moon
    // A gibbous moon painted on the board in silver leaf: the lit part, the dark limb, the
    // seas, a few craters with their rays, at (x, y), radius R; `phase` the lit fraction.
    function moon(P, o) {
        const { x, y, R = 70, seed = 'moon', phase = 0.78 } = o, sd = S.seedOf(seed);
        const k = 1 - 2 * phase; // the terminator as an ellipse
        P.solid({ x: x - R - 2, y: y - R - 2, w: R * 2 + 4, h: R * 2 + 4 }, (ux, uy, q) => {
            const dx = (ux - x) / R, dy = (uy - y) / R, d = Math.hypot(dx, dy);
            if (d >= 1) return 0;
            const z = Math.sqrt(1 - d * d);
            q.nx = dx * 0.5;
            q.ny = dy * 0.5;
            q.nz = 1;
            // lit where x' > k·sqrt(1 − y²) (the lit side on the right)
            const lit = smooth(-0.05, 0.05, dx - k * Math.sqrt(Math.max(0, 1 - dy * dy)));
            const sea = smooth(0.52, 0.62, noise2(dx * 2.2 + 3, dy * 2.2, sd)) * 0.5 + smooth(0.6, 0.7, noise2(dx * 4, dy * 4, sd + 1)) * 0.3;
            let v = lerp(0.12, 0.8 - sea * 0.35, lit) * (0.75 + 0.25 * z);
            // craters
            for (let i = 0; i < 9; i++) {
                const cx = (hashI(i, 0, 1, sd) - 0.5) * 1.5, cy = (hashI(i, 1, 1, sd) - 0.5) * 1.5, cr = 0.04 + hashI(i, 2, 1, sd) * 0.08;
                const e = Math.hypot(dx - cx, dy - cy);
                if (e < cr) v *= 0.82 + 0.3 * (e / cr);
                else if (i === 2 && e < cr * 4 && Math.abs(Math.sin(Math.atan2(dy - cy, dx - cx) * 7)) < 0.2) v = lerp(v, 0.9, 0.3 * lit);
            }
            q.r = v * 0.92;
            q.g = v * 0.92;
            q.b = v;
            q.sp = 0.5 * lit;
            q.sh = 0.6;
            q.h = (hashI(Math.round(ux * 2), Math.round(uy * 2), 1, sd) - 0.5) * 0.4 + sea * 0.3;
            return clamp((1 - d) * R * P.res + 0.5);
        });
    }

    // ------------------------------------------------------------------ feathers
    // one feather as a vane: from `base` along `dir`, `len` long, `wid` wide, bending `bend`;
    // white (or `col`), its rachis a groove, its barbs a fine hatch, its edge a little parted
    function feather(P, base, dir, len, wid, o = {}) {
        const bend = o.bend ?? 0.12, col = o.col ?? [0.9, 0.88, 0.84], sd = o.seed ?? 1, asym = o.asym ?? 0.35;
        const c = Math.cos(dir), s = Math.sin(dir), n = [-s, c];
        const axis = (t) => [base[0] + c * len * t + n[0] * bend * len * t * t, base[1] + s * len * t + n[1] * bend * len * t * t];
        const W = (t, side) => wid * Math.pow(Math.sin(Math.PI * Math.min(1, t * 1.05 + 0.02)), 0.6) * (side > 0 ? 1 - asym * 0.6 : 1 + asym * 0.4) * (t > 0.85 ? 1 - (t - 0.85) * 2 : 1);
        const pts = [];
        for (let i = 0; i <= 18; i++) {
            const t = i / 18, a = axis(t);
            pts.push([a[0] + n[0] * W(t, 1), a[1] + n[1] * W(t, 1)]);
        }
        for (let i = 18; i >= 0; i--) {
            const t = i / 18, a = axis(t);
            pts.push([a[0] - n[0] * W(t, -1), a[1] - n[1] * W(t, -1)]);
        }
        const bb = S.bbox(pts, 2);
        P.cast((g) => {
            g.beginPath();
            S.trace(g, pts);
            g.fillStyle = '#000';
            g.fill();
        }, { blur: wid * 0.8, dx: 0, dy: wid * 0.25, color: 'rgba(10,8,20,0.45)' });
        P.solid(bb, (ux, uy, q) => {
            const dx = ux - base[0], dy = uy - base[1];
            const t = (dx * c + dy * s) / len;
            if (t < 0 || t > 1) return 0;
            const a = axis(t), v = (ux - a[0]) * n[0] + (uy - a[1]) * n[1];
            const w = W(t, v > 0 ? 1 : -1);
            if (Math.abs(v) >= w) return 0;
            const f = v / w;
            q.nx = n[0] * f * 0.5;
            q.ny = n[1] * f * 0.5;
            q.nz = 1;
            const barb = Math.sin((t * len) * 2.4 - Math.abs(v) * 1.4 + sd);
            const tone = 0.94 + 0.06 * barb - 0.14 * Math.abs(f) * Math.abs(f);
            q.r = col[0] * tone;
            q.g = col[1] * tone;
            q.b = col[2] * tone;
            q.h = 0.25 * barb + (Math.abs(v) < 0.7 ? 0.6 : 0);
            // a parting in the vane
            if (Math.abs(t - 0.6 - 0.1 * Math.sin(sd)) < 0.012 && v > w * 0.3) return 0;
            q.tr = 0.35;
            q.sp = 0.06;
            return clamp((w - Math.abs(v)) * P.res + 0.5);
        });
        return pts;
    }

    // ------------------------------------------------------------------ the dove
    // A white dove flying with an olive sprig in its beak («la blanca palomica / al arca con
    // el ramo se ha tornado»). (x, y) its breast, heading `dir` (radians, 0 = to the right),
    // `s` its size (1 = some 230 units wing tip to wing tip). Wings raised.
    function dove(P, o) {
        const { x, y, s = 1, seed = 'dove' } = o, sd = S.seedOf(seed), r = Motion.rng('dove' + seed);
        const flip = o.flip ? -1 : 1;
        const F = (px, py) => [x + px * s * flip, y + py * s];
        const ang = (a) => (flip > 0 ? a : Math.PI - a);
        // the tail fan, behind
        for (let i = 0; i < 12; i++) {
            const a = ang(Math.PI + 0.32 + (i / 11 - 0.5) * 0.7);
            feather(P, F(-40, 6), a, 70 * s, 9 * s, { bend: 0.03, asym: 0.1, seed: i, col: [0.86, 0.85, 0.82] });
        }
        // the far wing, raised, darker
        const wing = (root, base, fl, shade) => {
            const col = shade ? [0.72, 0.72, 0.74] : [0.93, 0.92, 0.88];
            // primaries: long, the outer ones longest
            for (let i = 0; i < 10; i++) {
                const t = i / 9, a = ang(base + (t - 0.5) * fl);
                feather(P, F(root[0] + t * 22, root[1] - t * 30), a, (60 + 40 * Math.sin(t * Math.PI * 0.9)) * s, 9 * s, { bend: -0.08, asym: 0.5, seed: i + 20, col });
            }
            // secondaries and coverts in rows, shorter, rounder
            for (let i = 0; i < 9; i++) {
                const t = i / 8, a = ang(base + 0.55 + (t - 0.5) * 0.5);
                feather(P, F(root[0] - 10 + t * 24, root[1] + 4 - t * 16), a, 52 * s, 11 * s, { bend: 0.05, asym: 0.2, seed: i + 40, col });
            }
            for (let i = 0; i < 8; i++) {
                const t = i / 7, a = ang(base + 0.5 + (t - 0.5) * 0.6);
                feather(P, F(root[0] - 4 + t * 20, root[1] + 2 - t * 10), a, 30 * s, 10 * s, { bend: 0.1, asym: 0.1, seed: i + 60, col: col.map((v) => v * 0.98) });
            }
        };
        wing([-6, -14], -2.15, 0.9, true);
        // the body: a plump teardrop, breast forward
        P.solid({ x: x - 70 * s, y: y - 50 * s, w: 140 * s, h: 100 * s }, (ux, uy, q) => {
            const lx = ((ux - x) / s) * flip, ly = (uy - y) / s;
            const t = (lx + 52) / 92;
            if (t < 0 || t > 1) return 0;
            const hw = 26 * Math.pow(Math.sin(Math.PI * Math.pow(t, 0.75)), 0.8);
            const cy = 4 - 8 * t;
            const v = (ly - cy) / (hw || 1);
            if (Math.abs(v) >= 1) return 0;
            q.nx = flip * (t - 0.6) * 0.8;
            q.ny = v;
            q.nz = Math.sqrt(1 - v * v);
            const tone = 0.92 + 0.05 * Math.sin(lx * 0.6 + ly * 0.9);
            q.r = 0.9 * tone;
            q.g = 0.89 * tone;
            q.b = 0.86 * tone;
            q.h = 0.3 * Math.sin((lx * 0.9 - Math.abs(ly) * 0.5)) + (hashI(Math.round(ux * 2), Math.round(uy * 2), 1, sd) - 0.5) * 0.3;
            q.tr = 0.3;
            return clamp((1 - Math.abs(v)) * hw * s * P.res + 0.5);
        });
        // the head, round; its eye and the cere over the beak; the beak holding the sprig
        const hc = F(44, -26);
        P.solid({ x: hc[0] - 20 * s, y: hc[1] - 20 * s, w: 40 * s, h: 40 * s }, (ux, uy, q) => {
            const dx = (ux - hc[0]) / (15 * s), dy = (uy - hc[1]) / (14 * s), d = Math.hypot(dx, dy);
            if (d >= 1) return 0;
            q.nx = dx;
            q.ny = dy;
            q.nz = Math.sqrt(1 - d * d);
            q.r = 0.9;
            q.g = 0.89;
            q.b = 0.86;
            q.tr = 0.3;
            const e = F(49, -29), ed = Math.hypot(ux - e[0], uy - e[1]);
            if (ed < 3.4 * s) {
                q.r = 0.14;
                q.g = 0.08;
                q.b = 0.06;
                q.sp = 0.9;
                q.sh = 0.9;
                if (ed < 2.6 * s && ed > 1.8 * s) {
                    q.r = 0.55;
                    q.g = 0.2;
                    q.b = 0.1;
                }
            }
            return clamp((1 - d) * 14 * s * P.res + 0.5);
        });
        const bk = [F(57, -24), F(66, -22), F(72, -19)];
        tube(P, bk, (u) => (6 - u * 4.5) * s, (u, a, along, q) => {
            q.r = u < 0.3 ? 0.86 : 0.5;
            q.g = u < 0.3 ? 0.84 : 0.34;
            q.b = u < 0.3 ? 0.8 : 0.3;
            q.h = u < 0.3 ? (hashI(Math.round(along * 4), Math.round(a * 4), 2, sd) - 0.5) : 0;
            q.sp = 0.4;
        });
        // the olive sprig: a twig, leaves silver underneath, two olives
        const tw = [F(64, -21), F(90, -6), F(118, 10)];
        tube(P, tw, 2.6 * s, (u, a, along, q) => {
            q.r = 0.34;
            q.g = 0.3;
            q.b = 0.22;
        });
        for (let i = 0; i < 7; i++) {
            const t = 0.15 + i * 0.12, p = [lerp(tw[0][0], tw[2][0], t), lerp(tw[0][1], tw[2][1], t)];
            const side = i % 2 ? 1 : -1, a = ang(0.5 + side * 0.9 + (r() - 0.5) * 0.3);
            const L = (22 + r() * 8) * s, tip = [p[0] + Math.cos(a) * L, p[1] + Math.sin(a) * L];
            const silver = r() < 0.4;
            tube(P, [p, [lerp(p[0], tip[0], 0.5) + side * 1.5, lerp(p[1], tip[1], 0.5)], tip], (u) => 6 * s * Math.sin(Math.PI * Math.pow(u, 0.8)) + 0.4, (u, ac, along, q) => {
                q.r = silver ? 0.6 : 0.3;
                q.g = silver ? 0.64 : 0.38;
                q.b = silver ? 0.52 : 0.22;
                q.h = Math.abs(ac) < 0.12 ? -0.5 : 0;
                q.sp = silver ? 0.1 : 0.45;
            });
        }
        for (const t of [0.55, 0.8]) {
            const p = [lerp(tw[0][0], tw[2][0], t) + 4 * s, lerp(tw[0][1], tw[2][1], t) + 9 * s];
            P.solid({ x: p[0] - 7 * s, y: p[1] - 9 * s, w: 14 * s, h: 18 * s }, (ux, uy, q) => {
                const dx = (ux - p[0]) / (5.5 * s), dy = (uy - p[1]) / (7.5 * s), d = Math.hypot(dx, dy);
                if (d >= 1) return 0;
                q.nx = dx;
                q.ny = dy;
                q.nz = Math.sqrt(1 - d * d);
                q.r = 0.22;
                q.g = 0.26;
                q.b = 0.14;
                q.sp = 0.8;
                q.sh = 0.8;
                return clamp((1 - d) * 5 * s * P.res + 0.5);
            });
        }
        // the near wing over the body
        wing([-2, -8], -1.7, 1.0, false);
    }

    // ------------------------------------------------------------------ the vihuela
    // A vihuela de mano, no one to play it, hanging from a nail by a faded ribbon: a waisted
    // body with a flat spruce top, a gothic rose of interlaced tracery, inlaid bands round
    // the edges, a bridge with twelve strings in six courses tied to it, the neck with its
    // gut frets tied round it (the knots at the side), the flat head with its pegs. (x, y)
    // the middle of the body; `rot` the turn of its axis from upright (head up); `s` its size
    // (1 = the body 300 long).
    function vihuela(P, o) {
        const { x, y, s = 1, rot = 0, seed = 'vihuela' } = o, sd = S.seedOf(seed);
        const c = Math.cos(rot), sn = Math.sin(rot);
        // local frame: v along the axis (−150 at the neck joint, +150 at the tail), u across
        const toL = (ux, uy) => {
            const dx = (ux - x) / s, dy = (uy - y) / s;
            return [dx * c + dy * sn, -dx * sn + dy * c];
        };
        const toW = (u, v) => [x + (u * c - v * sn) * s, y + (u * sn + v * c) * s];
        const half = (v) => {
            // upper bout, waist, lower bout
            const t = (v + 150) / 300;
            if (t < 0 || t > 1) return 0;
            const ub = 92 * Math.sqrt(Math.max(0, 1 - ((t - 0.25) / 0.27) ** 2));
            const lb = 112 * Math.sqrt(Math.max(0, 1 - ((t - 0.68) / 0.33) ** 2));
            const waist = 74;
            return Math.max(ub, lb, t > 0.18 && t < 0.88 ? waist + 6 * Math.cos((t - 0.47) * 9) : 0);
        };
        const ROSE = [0, -46], RR = 34;
        // the neck and the head, first (under the body's end)
        const nk0 = toW(0, -150), nk1 = toW(0, -420);
        tube(P, [nk0, nk1], (u) => (44 - u * 8) * s, (u, a, along, q) => {
            const v = along / s;
            q.r = 0.18;
            q.g = 0.11;
            q.b = 0.07;
            q.h = 0.3 * Math.sin(a * 9 + v * 0.05);
            q.sp = 0.3;
            // the gut frets, tied: a double cord across, its knot on the bass side
            const fret = [18, 44, 68, 90, 110, 128, 145, 160, 174, 187];
            for (const f of fret) {
                if (Math.abs(v - f) < 1.6 || Math.abs(v - f - 3.2) < 1.2) {
                    q.r = 0.62;
                    q.g = 0.52;
                    q.b = 0.36;
                    q.h = 0.8;
                    q.sp = 0.4;
                }
                if (Math.abs(v - f - 1.6) < 3 && a < -0.82) {
                    q.r = 0.6;
                    q.g = 0.5;
                    q.b = 0.34;
                    q.h = 1;
                }
            }
        });
        // the body
        P.solid({ x: x - 170 * s, y: y - 170 * s, w: 340 * s, h: 340 * s }, (ux, uy, q) => {
            const [u, v] = toL(ux, uy), hw = half(v);
            if (Math.abs(u) >= hw) return 0;
            const e = hw - Math.abs(u); // from the edge, inwards
            q.nx = 0;
            q.ny = 0;
            q.nz = 1;
            // the edge rounds over a little; the top bellies behind the bridge
            if (e < 6) {
                const k = 1 - e / 6, sg = Math.sign(u);
                q.nx = (sg * c) * k * 0.8;
                q.ny = (sg * sn) * k * 0.8;
            }
            // spruce: lines of grain along the axis, unequal, a little darker at the edges
            const gl = Math.sin(u * 1.3 + noise2(u * 0.05, v * 0.01, sd) * 7);
            const tone = 0.95 + 0.07 * gl - 0.12 * smooth(40, 0, e) + 0.05 * noise2(u * 0.02, v * 0.02, sd + 1);
            q.r = 0.66 * tone;
            q.g = 0.5 * tone;
            q.b = 0.3 * tone;
            q.h = 0.25 * gl;
            q.sp = 0.3;
            q.sh = 0.55;
            // the inlaid band round the edge: a chequer of dark and pale wood between lines
            if (e > 4 && e < 13) {
                const along = v + u * 0.1, ck = (Math.floor(along / 3.2) + Math.floor((e - 4) / 3)) % 2;
                if (e < 5.2 || e > 11.8) {
                    q.r = 0.12;
                    q.g = 0.08;
                    q.b = 0.06;
                } else {
                    q.r = ck ? 0.14 : 0.72;
                    q.g = ck ? 0.09 : 0.6;
                    q.b = ck ? 0.06 : 0.4;
                }
                q.h = 0;
            }
            // the rose: interlaced circles cut in the top (the openings dark), a ring round it
            const rd = Math.hypot(u - ROSE[0], v - ROSE[1]);
            if (rd < RR + 8) {
                if (rd > RR + 2) {
                    const ring = Math.sin(rd * 3) > 0;
                    q.r = ring ? 0.16 : 0.7;
                    q.g = ring ? 0.1 : 0.56;
                    q.b = ring ? 0.07 : 0.36;
                } else if (rd < RR) {
                    // six circles round one, their lines the wood, the rest open
                    let wood = Math.abs(rd - RR + 1) < 1.5 || Math.abs(rd - RR * 0.38) < 1.4;
                    for (let k = 0; k < 6; k++) {
                        const a = (k / 6) * TAU, cx = ROSE[0] + Math.cos(a) * RR * 0.5, cy = ROSE[1] + Math.sin(a) * RR * 0.5;
                        if (Math.abs(Math.hypot(u - cx, v - cy) - RR * 0.5) < 1.3) wood = true;
                    }
                    if (!wood) {
                        q.r = 0.04;
                        q.g = 0.03;
                        q.b = 0.04;
                        q.sp = 0;
                        q.h = -1;
                    } else {
                        q.r = 0.6;
                        q.g = 0.46;
                        q.b = 0.28;
                        q.h = 0.8;
                    }
                }
            }
            // the bridge: a bar of dark wood, its ends carved as moustaches
            const bv = v - 92;
            if (Math.abs(bv) < 6 && Math.abs(u) < 54 - Math.abs(bv) * 1.5 + 6 * Math.cos(u * 0.12)) {
                q.r = 0.14;
                q.g = 0.08;
                q.b = 0.05;
                q.ny += (bv / 6) * 0.6;
                q.h = 0.5;
                q.sp = 0.5;
            }
            // the fingerboard over the top as far as the rose
            if (v < -96 && Math.abs(u) < 22 - (v + 150) * 0.02) {
                q.r = 0.13;
                q.g = 0.08;
                q.b = 0.05;
                q.sp = 0.4;
            }
            return clamp(e * s * P.res + 0.5);
        });
        // the strings: six courses of two, from the bridge up the neck
        for (let k = 0; k < 6; k++) {
            for (const d of [-1.3, 1.3]) {
                const u = (k - 2.5) * 6.4 + d;
                const a = toW(u, 92), b2 = toW(u * 0.78, -420);
                S.ink(P.a, [a, b2], { w: 0.7 * s, color: k < 3 ? '#d8cfb8' : '#c2b28a', taper: [0, 0] });
                S.ink(P.m, [a, b2], { w: 0.7 * s, color: 'rgb(140,200,40)', taper: [0, 0] });
                // the loop round the bridge
                S.ink(P.a, [toW(u, 92), toW(u + 1, 98), toW(u - 0.5, 99)], { w: 0.8 * s, color: '#e0d6c0' });
            }
        }
        return { toW };
    }

    // ------------------------------------------------------------------ the innermost circles
    // The plate: the board of circles at its smallest, the rings tightening towards the
    // middle and turning to light; a ring of small flames round the hole (the «lámparas de
    // fuego»): returns where they burn.
    function inmost(P, o) {
        const b = o.box, sd = S.seedOf(o.seed ?? 'inmost'), H = o.hole ?? 130;
        const rings = [];
        for (let R = H + 8, w = 7, k = 0; R < 1700; R += 18 + k * 9, w = 4 + (k % 3) * 2.5, k++) rings.push([R, w, k % 4 === 3 ? 1 : 0]);
        P.solid(b, (ux, uy, q) => {
            const rr = Math.hypot(ux, uy);
            if (rr < H - 2) return 0;
            const m = noise2(ux * 0.01, uy * 0.01, sd) * 0.05;
            q.r = 0.1 + m;
            q.g = 0.09 + m;
            q.b = 0.2 + m;
            q.sp = 0.2;
            q.h = 0.2 * Math.sin(ux * 0.7 + noise2(ux * 0.04, uy * 0.2, sd) * 5);
            for (const [R, w, kind] of rings) {
                const d = Math.abs(rr - R);
                if (d < w / 2) {
                    gilt(q, ux, uy, sd, { silver: kind === 1 && rr > 400, wear: 0.4 });
                    const t = (rr - R) / (w / 2);
                    q.nx = (ux / rr) * t * 0.5;
                    q.ny = (uy / rr) * t * 0.5;
                    q.nz = 1;
                }
            }
            // rays of gilding from the middle, between the rings, fading outwards
            const ang = Math.atan2(uy, ux), ray = Math.abs(Math.sin(ang * 24));
            if (ray < 0.05 * smooth(700, H, rr) && rr < 700) {
                gilt(q, ux, uy, sd + 2);
            }
            return 1;
        });
        const lamps = [];
        for (let i = 0; i < (o.lamps ?? 12); i++) {
            const a = (i / (o.lamps ?? 12)) * TAU + 0.13;
            lamps.push([Math.cos(a) * (H + 46), Math.sin(a) * (H + 46)]);
        }
        return lamps;
    }

    // ------------------------------------------------------------------ the choir book
    // A cantoral open for the Lamentations of Tenebrae: two leaves of parchment curving up
    // from the gutter, four-line staves ruled in red with square notes in black, the ruled
    // lines under each staff left empty (no words), an initial square of blue with red pen
    // flourishes whose letter has rubbed away, a brass corner and bosses on the leather
    // boards, the stacked edges of the leaves, a wax drop on a page, a thumbed corner.
    // (x, y) the gutter's middle; `w` the width of both leaves; `h` their height.
    function book(P, o) {
        const { x, y, w = 520, h = 360, seed = 'cantoral' } = o, sd = S.seedOf(seed), r = Motion.rng('book' + seed);
        const hw = w / 2;
        // the boards under the leaves, a little larger
        P.solid({ x: x - hw - 26, y: y - h / 2 - 22, w: w + 52, h: h + 44 }, (ux, uy, q) => {
            const lx = ux - x, ly = uy - y;
            const inB = Math.abs(lx) < hw + 22 && Math.abs(ly) < h / 2 + 18;
            if (!inB) return 0;
            const inLeaves = Math.abs(lx) < hw + 2 && Math.abs(ly) < h / 2 + 2;
            const leaf = noise2(ux * 0.05, uy * 0.05, sd) * 0.1;
            q.r = 0.3 + leaf;
            q.g = 0.16 + leaf * 0.6;
            q.b = 0.1;
            q.h = (hashI(Math.round(ux * 1.5), Math.round(uy * 1.5), 1, sd) - 0.5) * 0.6 + 0.4 * Math.sin(lx * 0.3) * (Math.abs(ly) > h / 2 + 8 ? 1 : 0);
            q.sp = 0.2;
            if (!inLeaves) {
                // brass corner pieces and bosses
                const cx = Math.abs(lx) - hw - 4, cy = Math.abs(ly) - h / 2 + 4;
                if (cx > -40 && cy > -40) {
                    q.r = 0.7;
                    q.g = 0.52;
                    q.b = 0.22;
                    q.sp = 0.85;
                    q.sh = 0.6;
                    q.h = 0.5 + 0.5 * Math.sin((cx + cy) * 0.6);
                }
                return 1;
            }
            // the stacked edges of the leaves, seen at the fore-edge
            if (Math.abs(lx) > hw - 4) {
                q.r = 0.62;
                q.g = 0.54;
                q.b = 0.4;
                q.h = Math.sin(lx * 3) * 0.8;
            }
            return 1;
        });
        // the leaves
        P.solid({ x: x - hw, y: y - h / 2, w: w, h: h }, (ux, uy, q) => {
            const lx = ux - x, ly = uy - y, u = lx / hw, side = u < 0 ? -1 : 1, au = Math.abs(u);
            // the leaf rises from the gutter and lies flat towards the fore-edge
            const rise = Math.exp(-au * 6);
            q.nx = side * -rise * 1.6;
            q.ny = -0.1 * Math.sin(ly * 0.01);
            q.nz = 1;
            // the thumbed corner, lower right: dark with use
            const thumb = smooth(60, 0, Math.hypot(lx - hw, ly - h / 2));
            const stain = smooth(0.6, 0.75, noise2(ux * 0.015, uy * 0.015, sd + 1));
            const pv = noise2(ux * 0.08, uy * 0.08, sd + 2) * 0.05;
            q.r = 0.8 + pv - stain * 0.1 - thumb * 0.2;
            q.g = 0.72 + pv - stain * 0.12 - thumb * 0.22;
            q.b = 0.56 + pv - stain * 0.14 - thumb * 0.2;
            q.h = (hashI(Math.round(ux * 2), Math.round(uy * 2), 3, sd) - 0.5) * 0.25 + 0.15 * noise2(ux * 0.3, uy * 0.3, sd);
            q.sp = 0.1;
            q.tr = 0.15;
            // the gutter's shadow
            const gut = smooth(0.08, 0, au);
            q.r *= 1 - gut * 0.6;
            q.g *= 1 - gut * 0.6;
            q.b *= 1 - gut * 0.55;
            // margins and the written block
            const px = au * hw, mx0 = 34, mx1 = hw - 30;
            if (px < mx0 || px > mx1 || Math.abs(ly) > h / 2 - 28) return 1;
            const top = -h / 2 + 30, sys = 52; // a staff and its empty text line every 52
            const k = Math.floor((ly - top) / sys), f = ly - top - k * sys;
            // the initial: a square of blue with red pen flourishes, on the left leaf's first staves
            if (side < 0 && px > mx1 - 74 && k < 2) {
                const ix = mx1 - 74, inner = px - ix;
                if (inner > 6 && inner < 70 && ly - top > 2 && ly - top < 98) {
                    q.r = 0.2;
                    q.g = 0.26;
                    q.b = 0.5;
                    if (Math.abs(Math.sin(inner * 0.5 + (ly - top) * 0.3)) < 0.18 || Math.abs(Math.hypot(inner - 38, ly - top - 50) - 20) < 1.3) {
                        q.r = 0.66;
                        q.g = 0.16;
                        q.b = 0.12;
                    }
                    q.h = 0.2;
                    return 1;
                }
            }
            if (f < 22) {
                // four red lines
                for (let l = 0; l < 4; l++) {
                    if (Math.abs(f - 2 - l * 6) < 0.65) {
                        q.r = 0.62;
                        q.g = 0.2;
                        q.b = 0.16;
                    }
                }
                // square notes on the lines and in the spaces, some joined in ligatures
                const col = Math.floor(px / 14), cf = px - col * 14;
                const hsh = hashI(col, k, 5 + (side > 0 ? 1 : 0), sd);
                if (hsh > 0.3) {
                    const pos = Math.floor(hashI(col, k, 6, sd) * 7), ny = 2 + pos * 3;
                    if (cf > 4 && cf < 9.5 && Math.abs(f - ny) < 2.6) {
                        q.r = 0.08;
                        q.g = 0.06;
                        q.b = 0.06;
                        q.h = 0.4;
                    }
                    // a stem on some
                    if (hsh > 0.85 && Math.abs(cf - 4.5) < 0.6 && f > ny && f < ny + 9) {
                        q.r = 0.1;
                        q.g = 0.08;
                        q.b = 0.08;
                    }
                }
                // a custos at the end of the staff, a bar line
                if (Math.abs(px - mx1 + 6) < 0.6) {
                    q.r = 0.12;
                    q.g = 0.1;
                    q.b = 0.1;
                }
            } else if (Math.abs(f - 40) < 0.4) {
                // the dry-point ruling of the empty text line
                q.r *= 0.9;
                q.g *= 0.9;
                q.b *= 0.92;
                q.h = -0.4;
            }
            return 1;
        });
        // a drop of wax on the right leaf
        wax(P, [[x + hw * 0.5, y - 40], [x + hw * 0.5 + 1, y - 34]], 4, seed + 'drop', { col: [0.7, 0.55, 0.32] });
    }

    // ------------------------------------------------------------------ things on a sill
    // an inkpot of glazed clay with a quill in it, a folded paper, a crust of bread and the
    // tail of a sardine on it (his ration in the Toledo prison)
    function sill(P, o) {
        const { x, y, seed = 'sill' } = o, sd = S.seedOf(seed);
        // the inkpot: a squat jar, green glaze crazed, ink black at the mouth
        const R = profile([[0, 7], [2, 8], [5, 7], [8, 10], [16, 13], [24, 12], [28, 10]]);
        const ix = x - 40, iy = y - 28;
        P.solid({ x: ix - 15, y: iy - 1, w: 30, h: 30 }, (ux, uy, q) => {
            const yy = uy - iy, rr = R(yy);
            if (rr <= 0) return 0;
            const s = (ux - ix) / rr;
            if (Math.abs(s) >= 1) return 0;
            latheN(q, s, (R(yy + 0.5) - R(yy - 0.5)) / 1.0);
            q.r = 0.22;
            q.g = 0.32;
            q.b = 0.2;
            q.sp = 0.8;
            q.sh = 0.8;
            if (Math.abs(noise2(ux * 0.4, uy * 0.4, sd) - 0.5) < 0.03) q.r = q.g = q.b = 0.08;
            if (yy < 2) {
                q.r = q.g = q.b = 0.03;
            }
            return clamp((rr - Math.abs(ux - ix)) * P.res + 0.5);
        });
        // the quill: a shaft and its barbs, leaning
        const qa = [ix + 2, iy + 2], qb = [ix + 46, iy - 60];
        tube(P, [qa, qb], 1.8, (u, a, along, q) => {
            q.r = 0.8;
            q.g = 0.76;
            q.b = 0.66;
            q.sp = 0.4;
        });
        feather(P, [lerp(qa[0], qb[0], 0.35), lerp(qa[1], qb[1], 0.35)], Math.atan2(qb[1] - qa[1], qb[0] - qa[0]), 52, 6, { bend: 0.06, asym: 0.6, col: [0.74, 0.7, 0.62], seed: 3 });
        // the folded paper
        poly(P, [[x - 6, y], [x + 38, y - 3], [x + 40, y - 9], [x - 4, y - 7]], { a: '#c9bb9a', n: [0, -0.9, 0.4], tr: 0.2 });
        poly(P, [[x - 4, y - 7], [x + 40, y - 9], [x + 36, y - 13], [x - 2, y - 11]], { a: '#d8ccae', n: [0, -0.4, 1], tr: 0.2 });
        // bread and the sardine's tail
        const bx = x + 70, by = y - 8;
        P.solid({ x: bx - 18, y: by - 12, w: 36, h: 22 }, (ux, uy, q) => {
            const dx = (ux - bx) / 16, dy = (uy - by) / 8, d = Math.hypot(dx, dy);
            if (d >= 1 || uy > y) return 0;
            q.nx = dx * 0.8;
            q.ny = dy * 0.8 - 0.3;
            q.nz = Math.sqrt(1 - d * d * 0.6);
            const crumb = dx < -0.3;
            q.r = crumb ? 0.74 : 0.52;
            q.g = crumb ? 0.64 : 0.34;
            q.b = crumb ? 0.46 : 0.16;
            q.h = (hashI(Math.round(ux * 2), Math.round(uy * 2), 7, sd) - 0.5) * (crumb ? 1.2 : 0.5);
            return clamp((1 - d) * 8 * P.res + 0.5);
        });
        tube(P, [[bx + 14, by - 6], [bx + 26, by - 9], [bx + 33, by - 7]], (u) => 5 * (1 - u * 0.7), (u, a, along, q) => {
            q.r = 0.55;
            q.g = 0.58;
            q.b = 0.62;
            q.sp = 0.9;
            q.sh = 0.8;
            q.h = Math.sin(along * 3) * 0.4;
        });
        poly(P, [[bx + 32, by - 7], [bx + 40, by - 13], [bx + 38, by - 6], [bx + 41, by - 1]], { a: '#7a7e88', sp: 0.6, sh: 0.7 });
    }

    // ------------------------------------------------------------------ a veil of smoke
    // Incense that has spread into a level veil: long strands drifting across from x0 to x1
    // about the height y, `band` thick, waving, thinning at the ends. Into the air.
    function haze(P, o) {
        const { x0 = -1200, x1 = 1200, y = 0, band = 120, seed = 'haze', alpha = 0.3, n = 40, tint = '#c2bfd6' } = o;
        const sd = S.seedOf(seed), r = Motion.rng('haze' + seed);
        // the body: soft clouds laid along the band, never the same twice
        const f = P.fog;
        f.save();
        for (let i = 0; i < n; i++) {
            const x = x0 + r() * (x1 - x0), yy = y + (r() - 0.5) * band * 1.2 + 30 * noise2(x * 0.004, 0, sd);
            const rx = 60 + r() * 220, ry = 14 + r() * 40, a = alpha * (0.15 + 0.35 * r()) * smooth(x0, x0 + 300, x) * smooth(x1, x1 - 300, x);
            f.fillStyle = S.rgba(tint, a);
            f.beginPath();
            f.ellipse(x, yy, rx, ry, (r() - 0.5) * 0.3, 0, TAU);
            f.fill();
        }
        f.restore();
        // a few wisps drawn crisp, broken, each with its own drift
        const q = P.air;
        q.save();
        q.lineCap = 'round';
        for (let i = 0; i < n / 3; i++) {
            const len = 120 + r() * 420, xs = x0 + r() * (x1 - x0 - len), yy = y + (r() - 0.5) * band, ph = r() * 10, tilt = (r() - 0.5) * 0.25;
            let prev = null;
            for (let x = xs; x < xs + len; x += 4) {
                const u = (x - xs) / len;
                const py = yy + (x - xs) * tilt + 10 * Math.sin(x * 0.012 + ph) + 8 * noise2(x * 0.02, i, sd) + 18 * u * u * Math.sin(ph);
                if (prev && noise2(x * 0.03, i + 30, sd) > 0.35) {
                    q.strokeStyle = S.rgba(tint, alpha * 0.45 * Math.sin(Math.PI * u));
                    q.lineWidth = 0.6 + 1.6 * Math.sin(Math.PI * u);
                    q.beginPath();
                    q.moveTo(prev[0], prev[1]);
                    q.lineTo(x, py);
                    q.stroke();
                }
                prev = [x, py];
            }
        }
        q.restore();
    }

    // ------------------------------------------------------------------ a bed of white flowers
    // The mass of white carnations at the foot of a paso: heads packed close, each a frilled
    // dome of petals with toothed edges, a few still in bud, grey-green blades between, one
    // head gone brown. `inside(x, y)` the bed's shape; `n` heads tried.
    function carnations(P, o) {
        const sd = S.seedOf(o.seed ?? 'clavel'), r = Motion.rng('clavel' + (o.seed ?? '')), b = o.box;
        const heads = [];
        for (let i = 0; i < (o.n ?? 400) && heads.length < (o.max ?? 160); i++) {
            const x = b.x + r() * b.w, y = b.y + r() * b.h, R = (o.r ?? 15) * (0.75 + r() * 0.5);
            if (!o.inside(x, y)) continue;
            if (heads.some((h) => Math.hypot(h[0] - x, h[1] - y) < (h[2] + R) * 0.5)) continue;
            heads.push([x, y, R, r()]);
        }
        heads.sort((a, b2) => a[1] - b2[1]);
        // blades first
        for (const [x, y, R] of heads) {
            for (let k = 0; k < 2; k++) {
                const a = -Math.PI / 2 + (r() - 0.5) * 2.2, L = R * (1.5 + r());
                tube(P, [[x, y + R * 0.4], [x + Math.cos(a) * L * 0.5, y + R * 0.4 + Math.sin(a) * L * 0.5], [x + Math.cos(a) * L, y + R * 0.4 + Math.sin(a) * L + 4]], (u) => 3.4 * (1 - u * 0.8), (u, ac, along, q) => {
                    q.r = 0.3;
                    q.g = 0.4;
                    q.b = 0.32;
                    q.sp = 0.3;
                    q.h = Math.abs(ac) < 0.2 ? -0.4 : 0;
                });
            }
        }
        for (const [x, y, R, v] of heads) {
            const brown = v > 0.97, bud = v < 0.06, ph = v * 40;
            const RR = bud ? R * 0.55 : R;
            P.solid({ x: x - RR * 1.3, y: y - RR * 1.3, w: RR * 2.6, h: RR * 2.6 }, (ux, uy, q) => {
                const dx = ux - x, dy = (uy - y) * 1.15, d = Math.hypot(dx, dy), a = Math.atan2(dy, dx);
                const edge = RR * (1 + 0.14 * noise2(Math.cos(a) * 2 + ph, Math.sin(a) * 2, sd) + 0.05 * Math.sin(a * 23 + ph));
                if (d >= edge) return 0;
                const t = d / edge;
                // tiers of petals: rings of toothed edges, each its own shadow
                const tier = Math.sin(t * 9 + noise2(a * 2, t * 3, sd + 1) * 3) * 0.5 + 0.5;
                const tooth = Math.sin(a * 37 + t * 5 + ph);
                q.nx = (dx / (edge || 1)) * 0.9;
                q.ny = (dy / (edge || 1)) * 0.9;
                q.nz = Math.sqrt(Math.max(0.05, 1 - t * t * 0.8));
                const k = 0.82 + 0.18 * tier;
                q.r = (brown ? 0.6 : 0.94) * k;
                q.g = (brown ? 0.45 : 0.92) * k;
                q.b = (brown ? 0.3 : 0.86) * k;
                if (bud) {
                    q.r = 0.5;
                    q.g = 0.6;
                    q.b = 0.42;
                }
                q.h = 0.7 * tier + 0.3 * tooth;
                q.tr = 0.4;
                q.sp = 0.05;
                return clamp((edge - d) * P.res + 0.5);
            });
        }
    }

    return { begin, profile, latheN, candlestick, candle, wax, smoke, flame, halo, ember, hex, lerp, silverAt, smoothBump, veil, ladder, moth, poly, steps, wall, tube, rope, bar, lantern, velvet, jar, lily, flower, farol, chain, thurible, gilt, circles, moon, feather, dove, vihuela, inmost, book, sill, haze, carnations };
})();
