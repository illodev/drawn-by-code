// Risograph style kit: a scene is printed like a riso print. Each ink has a plate you draw
// on in any colour (only the alpha counts: how much ink goes there); the kit prints the
// plates onto the paper in multiply, each ink through its own halftone screen or flat, a
// little out of register, with uneven inking and paper grain. Global: Riso.
//
//   const press = Riso.press(env)                  once, in setup
//   press.begin(seed)                              clears the plates for a new print
//   const g = press.plate('pink')                  a flat (solid) plate, logical units
//   const s = press.plate('blue', 'screen')        a halftone plate (tones become dots)
//   g.fillStyle = Riso.tone(0.6) …                 draw density: 0 no ink, 1 full ink
//   press.print(g, { key, register, inks })        prints onto g (full frame); key = memo
//                                                  (the drawing index); register: per-ink
//                                                  offsets in output px; inks: re-ink the
//                                                  plates ({ pink: 'blue' } → a colourway)
//   press.save() / restore() / clip(fn) / each(fn) the same transform or clip on every plate
//                                                  (a card inside a circle, in a mosaic cell)
//
// Inks (measured on a riso reference): pink (fluorescent), yellow, blue (aqua), navy.
// Overprints make the rest: pink + yellow = orange/red, yellow + blue = green, navy +
// yellow = olive, pink + blue = purple. Whites are knockouts: erase on every plate
// (`Riso.knock(g)` sets destination-out).
const Riso = (() => {
    const INKS = {
        pink: { rgb: [240, 76, 183], angle: 0.26, pitch: 1 },
        yellow: { rgb: [255, 250, 55], angle: 0.0, pitch: 1 },
        blue: { rgb: [58, 146, 197], angle: 1.31, pitch: 1 },
        navy: { rgb: [32, 56, 146], angle: 0.79, pitch: 1 },
    };
    const ORDER = ['yellow', 'pink', 'blue', 'navy'];
    const PAPER = [241, 235, 226];
    const tone = (v) => `rgba(0,0,0,${Math.max(0, Math.min(1, v))})`;
    const knock = (g) => { g.globalCompositeOperation = 'destination-out'; return g; };

    function press(env, o = {}) {
        const [W, H] = env.px, k = env.k;
        const pitch = (o.pitch ?? 9.5) * (W / 1080); // halftone cell, output px (≈ 9.5 at 1080)
        const mk = () => { const c = document.createElement('canvas'); c.width = W; c.height = H; return c; };
        const plates = {};
        for (const ink of ORDER) plates[ink] = { solid: mk(), screen: mk() };
        const ctxs = {};
        for (const ink of ORDER) for (const kind of ['solid', 'screen']) {
            const g = plates[ink][kind].getContext('2d', { willReadFrequently: true });
            g.setTransform(k, 0, 0, k, 0, 0);
            ctxs[ink + kind] = g;
        }
        const out = mk(), og = out.getContext('2d');
        // fixed textures: paper grain, ink starvation blotches (big and small)
        const r = Motion.rng('riso-tex' + W);
        const grain = new Float32Array(W * H), starve = new Float32Array(W * H);
        for (let i = 0; i < W * H; i++) grain[i] = r();
        const bs = 24, bw = Math.ceil(W / bs) + 2, bh = Math.ceil(H / bs) + 2, blot = new Float32Array(bw * bh);
        for (let i = 0; i < blot.length; i++) blot[i] = r();
        for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
            const fx = x / bs, fy = y / bs, ix = Math.floor(fx), iy = Math.floor(fy), u = fx - ix, v = fy - iy;
            const a = blot[iy * bw + ix], b = blot[iy * bw + ix + 1], c = blot[(iy + 1) * bw + ix], d = blot[(iy + 1) * bw + ix + 1];
            const su = u * u * (3 - 2 * u), sv = v * v * (3 - 2 * v);
            starve[y * W + x] = a + (b - a) * su + (c - a) * sv + (a - b - c + d) * su * sv;
        }
        // the print's noise, measured on a riso film at 3×: ink mottles at a small scale
        // (~3 px), every ink throws stray specks (on paper and inside other inks), and each
        // halftone dot is a little off in size and place. Fine value noise, per ink:
        const fine = (seed, scale) => {
            const rr = Motion.rng(seed), gw = Math.ceil(W / scale) + 2, gh = Math.ceil(H / scale) + 2, v = new Float32Array(gw * gh), f = new Float32Array(W * H);
            for (let i = 0; i < v.length; i++) v[i] = rr();
            for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
                const fx = x / scale, fy = y / scale, ix = Math.floor(fx), iy = Math.floor(fy), u = fx - ix, w2 = fy - iy;
                const a = v[iy * gw + ix], b = v[iy * gw + ix + 1], c = v[(iy + 1) * gw + ix], d = v[(iy + 1) * gw + ix + 1];
                f[y * W + x] = a + (b - a) * u + (c - a) * w2 + (a - b - c + d) * u * w2;
            }
            return f;
        };
        const sc = W / 1080, mottle = {}, speck = {};
        // the paper, measured at 3× on the reference: an even warm stock with a faint cloud
        // (a few % at ~50 px) and hair-like fibres (thin grey curls, 10–40 px), almost no
        // specks. Never a confetti of coloured dots.
        const cloud = fine('cloud' + W, 48 * sc), fiber = new Float32Array(W * H);
        {
            const fc = mk(), fg = fc.getContext('2d'), fr = Motion.rng('fibres' + W), n = Math.round(300 * (W * H) / (1080 * 1080));
            fg.lineCap = 'round';
            for (let k = 0; k < n; k++) {
                let x = fr() * W, y = fr() * H, a = fr() * 6.28;
                const len = (8 + fr() * 32) * sc, bend = (fr() - 0.5) * 0.25;
                fg.strokeStyle = `rgba(0,0,0,${0.25 + fr() * 0.35})`;
                fg.lineWidth = (0.6 + fr() * 0.5) * sc;
                fg.beginPath();
                fg.moveTo(x, y);
                for (let s2 = 0; s2 < len; s2 += 2 * sc) { a += bend; x += Math.cos(a) * 2 * sc; y += Math.sin(a) * 2 * sc; fg.lineTo(x, y); }
                fg.stroke();
            }
            const fd = fg.getImageData(0, 0, W, H).data;
            for (let i = 0; i < W * H; i++) fiber[i] = fd[i * 4 + 3] / 255;
        }
        for (const ink of ORDER) { mottle[ink] = fine('mottle' + ink + W, 3.2 * sc); speck[ink] = fine('speck' + ink + W, 1.6 * sc); }
        let memoKey = null;
        const EDGE = globalThis.RISO_EDGE ?? 1.1, SPREAD = globalThis.RISO_SPREAD ?? 0.8;

        return {
            W, H,
            begin(seed) {
                for (const g of Object.values(ctxs)) { g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, W, H); g.restore(); g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1; }
                this.seed = seed ?? 0;
            },
            plate(ink, kind = 'solid') {
                const g = ctxs[ink + kind];
                if (!g) throw new Error('Riso: no plate ' + ink + ' ' + kind);
                return g;
            },
            // run fn(g, ink, kind) on every plate: shared transforms and clips (save/restore
            // pairs) so one card can be drawn inside another, scaled into a mosaic cell, etc.
            each(fn) { for (const ink of ORDER) for (const kind of ['solid', 'screen']) fn(ctxs[ink + kind], ink, kind); },
            save() { this.each((g) => g.save()); },
            restore() { this.each((g) => g.restore()); },
            // clip every plate to a path: fn(g) builds it (no beginPath needed)
            clip(fn) { this.each((g) => { g.beginPath(); fn(g); g.clip(); }); },
            // knock a shape out of every plate (paper white): fn(g) draws the shape
            knockout(fn) {
                for (const g of Object.values(ctxs)) { g.save(); g.globalCompositeOperation = 'destination-out'; g.fillStyle = '#000'; g.strokeStyle = '#000'; fn(g); g.restore(); }
            },
            print(g, po = {}) {
                const key = po.key;
                if (key == null || key !== memoKey) {
                    const img = og.createImageData(W, H), D = img.data;
                    for (let i = 0; i < W * H; i++) {
                        const p = (0.982 + 0.018 * grain[i] + 0.012 * (cloud[i] - 0.5)) * (1 - 0.2 * fiber[i]);
                        D[i * 4] = PAPER[0] * p; D[i * 4 + 1] = PAPER[1] * p; D[i * 4 + 2] = PAPER[2] * p; D[i * 4 + 3] = 255;
                    }
                    const reg = po.register ?? { yellow: [2, -1], pink: [-1, 1], blue: [1, 2], navy: [0, 0] };
                    // po.inks re-inks the plates: { pink: 'blue', … } prints the pink plate in
                    // blue ink (the same drawing, a new colourway)
                    const inkOf = (plate) => (po.inks ?? {})[plate] ?? plate;
                    for (const ink of ORDER) {
                        const S = ctxs[ink + 'solid'].getImageData(0, 0, W, H).data;
                        const T = ctxs[ink + 'screen'].getImageData(0, 0, W, H).data;
                        const I = INKS[inkOf(ink)], [ir, ig, ib] = I.rgb, ca = Math.cos(INKS[ink].angle), sa = Math.sin(INKS[ink].angle);
                        const [ox, oy] = (reg[ink] ?? [0, 0]).map((v) => Math.round(v * (W / 1080)));
                        const ip = I.pitch * pitch, io = ORDER.indexOf(ink) * 7919;
                        for (let y = 0; y < H; y++) {
                            const sy = y - oy;
                            if (sy < 0 || sy >= H) continue;
                            for (let x = 0; x < W; x++) {
                                const sx = x - ox;
                                if (sx < 0 || sx >= W) continue;
                                const j = (sy * W + sx) * 4;
                                let cov = S[j + 3] / 255;
                                const tv = T[j + 3] / 255;
                                if (tv > 0.003) {
                                    // the halftone: a dot per cell, its area = the tone
                                    const u = (x * ca + y * sa) / ip, v = (-x * sa + y * ca) / ip;
                                    // each cell's dot a little off in place and size (a hash of the cell)
                                    const cu = Math.floor(u), cv = Math.floor(v), hsh = Math.sin(cu * 127.1 + cv * 311.7 + ink.length * 17.3) * 43758.5453, hj = hsh - Math.floor(hsh);
                                    const du = u - cu - 0.5 + (hj - 0.5) * 0.14, dv = v - cv - 0.5 + ((hj * 7.13) % 1 - 0.5) * 0.14;
                                    const d = Math.sqrt(du * du + dv * dv), rad = Math.sqrt(tv / Math.PI) * (0.9 + 0.22 * hj);
                                    const edge = EDGE / ip;
                                    const dot = Math.min(1, Math.max(0, (rad - d) / edge + 0.5));
                                    cov = Math.max(cov, dot);
                                }
                                const i = y * W + x;
                                // stray specks of this ink anywhere (on paper, in other inks)
                                const sp = speck[ink][i];
                                if (sp > 0.985) cov = Math.max(cov, (sp - 0.985) * 40);
                                if (cov <= 0.003) continue;
                                // (voids per ink: shared ones would punch paper-white pinholes through overprints)
                                const gv = grain[(i + io) % (W * H)];
                                // uneven inking: a solid prints nearly full and crisp, pocked with
                                // pixel-size voids (paper showing through); starved blotches are faint
                                cov *= (0.91 + 0.12 * mottle[ink][i]) * (0.95 + 0.05 * starve[i]) - (gv > 0.93 ? 0.3 : 0) - (gv > 0.985 ? 0.5 : 0) - (sp < 0.04 ? 0.5 : 0);
                                if (cov <= 0) continue;
                                const q = i * 4;
                                D[q] *= 1 - cov + (cov * ir) / 255;
                                D[q + 1] *= 1 - cov + (cov * ig) / 255;
                                D[q + 2] *= 1 - cov + (cov * ib) / 255;
                            }
                        }
                    }
                    og.putImageData(img, 0, 0);
                    // ink spreads into the paper fibres: a slight blur of the whole print
                    const sp = (po.spread ?? SPREAD) * (W / 1080);
                    if (sp > 0) {
                        const tmp = mk(), tg = tmp.getContext('2d');
                        tg.filter = `blur(${sp}px)`;
                        tg.drawImage(out, 0, 0);
                        og.clearRect(0, 0, W, H);
                        og.drawImage(tmp, 0, 0);
                    }
                    memoKey = key;
                }
                g.save();
                g.setTransform(1, 0, 0, 1, 0, 0);
                g.drawImage(out, 0, 0);
                g.restore();
            },
        };
    }

    // a hand-inked line: a polyline with a slight wobble and varying width (drawn on a plate)
    function line(g, pts, w, seed, o = {}) {
        const r = Motion.rng('rl' + seed);
        g.save();
        g.lineCap = 'round';
        g.lineJoin = 'round';
        g.strokeStyle = o.color ?? '#000';
        for (let i = 1; i < pts.length; i++) {
            g.lineWidth = w * (0.8 + 0.4 * r());
            g.beginPath();
            g.moveTo(pts[i - 1][0], pts[i - 1][1]);
            g.lineTo(pts[i][0], pts[i][1]);
            g.stroke();
        }
        g.restore();
    }
    // a hand-drawn circle (an ellipse with a wobbling radius), stroked; `p` draws it on (0..1)
    function ring(g, cx, cy, r, w, seed, o = {}) {
        const n = Math.max(24, Math.round(r * 0.8)), p = o.p ?? 1, rr = Motion.rng('rr' + seed), ph = rr() * 6.28, wob = o.wobble ?? 0.012;
        const pts = [];
        for (let i = 0; i <= n * p; i++) {
            const a = (o.a0 ?? -Math.PI / 2) + (i / n) * Math.PI * 2;
            const rad = r * (1 + wob * Math.sin(a * 3 + ph) + wob * 0.6 * Math.sin(a * 7 + ph * 2));
            pts.push([cx + Math.cos(a) * rad, cy + Math.sin(a) * rad * (o.squash ?? 1)]);
        }
        g.save();
        g.lineWidth = w;
        g.lineCap = 'round';
        g.strokeStyle = o.color ?? '#000';
        g.beginPath();
        pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
        g.stroke();
        g.restore();
    }
    // a vertical or radial tone ramp as a fill style (for screen plates): t0 → t1
    function ramp(g, x0, y0, x1, y1, t0, t1) {
        const gr = g.createLinearGradient(x0, y0, x1, y1);
        gr.addColorStop(0, tone(t0));
        gr.addColorStop(1, tone(t1));
        return gr;
    }
    function radial(g, x, y, r0, r1, t0, t1) {
        const gr = g.createRadialGradient(x, y, r0, x, y, r1);
        gr.addColorStop(0, tone(t0));
        gr.addColorStop(1, tone(t1));
        return gr;
    }
    return { INKS, ORDER, PAPER, tone, knock, press, line, ring, ramp, radial };
})();
