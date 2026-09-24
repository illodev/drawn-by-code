// Helpers for the group-4 cards (piano, rocket, city, planet, lightning, balloons, cello).
// Global: G4. Everything draws on riso plates in the 1000 × 1000 card units.
var G4 = (() => {
    const T = (v) => Riso.tone(v);
    const fillOf = (v) => (typeof v === 'number' ? T(v) : v);
    // a closed polygon path (no fill)
    function path(g, pts) {
        g.beginPath();
        pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
        g.closePath();
    }
    // a smooth path through points (Catmull-Rom as béziers); closed or open
    function smooth(g, pts, closed = true, begin = true) {
        const n = pts.length;
        if (begin) g.beginPath();
        const P = (i) => (closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))]);
        g.moveTo(pts[0][0], pts[0][1]);
        const last = closed ? n : n - 1;
        for (let i = 0; i < last; i++) {
            const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2);
            g.bezierCurveTo(p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6, p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6, p2[0], p2[1]);
        }
        if (closed) g.closePath();
    }
    function poly(g, pts, v) { g.fillStyle = fillOf(v); path(g, pts); g.fill(); }
    function blob(g, pts, v) { g.fillStyle = fillOf(v); smooth(g, pts, true); g.fill(); }
    function sline(g, pts, w, v = 1, cap = 'round') {
        g.save();
        g.strokeStyle = fillOf(v); g.lineWidth = w; g.lineCap = cap; g.lineJoin = 'round';
        smooth(g, pts, false); g.stroke();
        g.restore();
    }
    function seg(g, pts, w, v = 1, cap = 'round') {
        g.save();
        g.strokeStyle = fillOf(v); g.lineWidth = w; g.lineCap = cap; g.lineJoin = 'round';
        g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke();
        g.restore();
    }
    function disc(g, x, y, r, v = 1) { g.fillStyle = fillOf(v); g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); }
    function ell(g, x, y, rx, ry, rot, v = 1) { g.fillStyle = fillOf(v); g.beginPath(); g.ellipse(x, y, rx, ry, rot, 0, 7); g.fill(); }
    // draw fn(g) clipped to a shape built by shape(g) (no beginPath needed)
    function clip(g, shape, fn) { g.save(); g.beginPath(); shape(g); g.clip(); fn(g); g.restore(); }
    // run fn(g) on several plates
    const on = (plates, fn) => plates.forEach((g) => fn(g));
    // a soft knock-out on some plates: a gradient of erasing (fn gets g, sets its own fill)
    function erase(plates, fn) { for (const g of plates) { g.save(); g.globalCompositeOperation = 'destination-out'; fn(g); g.restore(); } }
    // paper speckles (dust knocked out of every plate): n tiny dots in a box
    function speckle(press, seed, n, box = [0, 0, 1000, 1000], r0 = 0.9, r1 = 2.2) {
        const r = Motion.rng('g4sp' + seed);
        const pts = [];
        for (let i = 0; i < n; i++) pts.push([box[0] + r() * (box[2] - box[0]), box[1] + r() * (box[3] - box[1]), r0 + r() * (r1 - r0)]);
        press.knockout((g) => { g.beginPath(); for (const [x, y, rr] of pts) { g.moveTo(x + rr, y); g.arc(x, y, rr, 0, 7); } g.fill(); });
    }
    // coloured specks on one plate (stray ink)
    function specks(g, seed, n, box = [0, 0, 1000, 1000], r0 = 1, r1 = 2.4, v = 1) {
        const r = Motion.rng('g4sk' + seed);
        g.fillStyle = fillOf(v);
        g.beginPath();
        for (let i = 0; i < n; i++) { const x = box[0] + r() * (box[2] - box[0]), y = box[1] + r() * (box[3] - box[1]), rr = r0 + r() * (r1 - r0); g.moveTo(x + rr, y); g.arc(x, y, rr, 0, 7); }
        g.fill();
    }
    // a coarse hand-made halftone (a bigger screen than the press's): dots on a rotated grid,
    // radius from tone(x, y) 0..1, drawn flat on a solid plate
    function dots(g, box, pitch, angle, tone, v = 1) {
        const ca = Math.cos(angle), sa = Math.sin(angle);
        const [x0, y0, x1, y1] = box, cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, R = Math.hypot(x1 - x0, y1 - y0) / 2 + pitch;
        g.fillStyle = fillOf(v);
        g.beginPath();
        for (let u = -R; u <= R; u += pitch) for (let w = -R; w <= R; w += pitch) {
            const x = cx + u * ca - w * sa, y = cy + u * sa + w * ca;
            if (x < x0 - pitch || x > x1 + pitch || y < y0 - pitch || y > y1 + pitch) continue;
            const tv = tone(x, y);
            if (tv <= 0.01) continue;
            const r = pitch * Math.sqrt(Math.min(1, tv) / Math.PI);
            g.moveTo(x + r, y);
            g.arc(x, y, r, 0, 7);
        }
        g.fill();
    }
    // a gradient fill between stops [[offset, tone], …] along a line
    function lin(g, x0, y0, x1, y1, stops) { const gr = g.createLinearGradient(x0, y0, x1, y1); for (const [o, v] of stops) gr.addColorStop(o, T(v)); return gr; }
    function rad(g, x, y, r0, r1, stops) { const gr = g.createRadialGradient(x, y, r0, x, y, r1); for (const [o, v] of stops) gr.addColorStop(o, T(v)); return gr; }
    // a jagged polyline (lightning, cracks): deterministic jitter along a path
    function jag(pts, seed, amp, step) {
        const r = Motion.rng('g4jag' + seed), out = [pts[0]];
        for (let i = 1; i < pts.length; i++) {
            const [ax, ay] = pts[i - 1], [bx, by] = pts[i], L = Math.hypot(bx - ax, by - ay), n = Math.max(1, Math.round(L / step));
            const nx = -(by - ay) / L, ny = (bx - ax) / L;
            for (let k = 1; k <= n; k++) { const f = k / n, o = k === n ? 0 : (r() - 0.5) * 2 * amp; out.push([ax + (bx - ax) * f + nx * o, ay + (by - ay) * f + ny * o]); }
        }
        return out;
    }
    // A halftone on a measured screen. This film's screens are not the press's: each card
    // has its own pitch, angle and phase (very regular lattices, measured on the reference
    // with a DFT fit), and a dot off by half a cell costs ~10 colour on the detail gate.
    //   screen(press, ink, lat, tones, o)
    //   lat: { p: pitch, a: angle (deg), x, y: an ink dot centre } in the plate's current
    //   units (cards author in reference px: G4.refpx(press) scales 1080 px → 1000 units)
    //   tones(g): draws the tone field (alpha = ink), same units, on an offscreen canvas
    //   o.jit: per-dot size jitter (0.12), o.pj: per-dot position jitter in cells (0.05),
    //   o.edge: dot edge softness (1.1 units),
    //   o.box: [x0, y0, x1, y1] to limit the work, o.mode: 'auto' (ink dots to 50 %, paper
    //   holes above), 'holes' (paper holes down to touching: white dots on ink, 21–100 %)
    // The dots are round ink dots up to 50 % and round paper holes above (a Euclidean-ish
    // screen), set in the artwork's space: a mirrored card mirrors its dots too. The result
    // goes on the ink's solid plate (the press adds spread, mottle, voids).
    let tcan = null, ccan = null;
    function screen(press, ink, lat, tones, o = {}) {
        const plate = press.plate(ink), W = plate.canvas.width, H = plate.canvas.height;
        if (!tcan || tcan.width !== W || tcan.height !== H) {
            tcan = document.createElement('canvas'); tcan.width = W; tcan.height = H;
            ccan = document.createElement('canvas'); ccan.width = W; ccan.height = H;
        }
        const tg = tcan.getContext('2d', { willReadFrequently: true });
        const M = plate.getTransform();
        tg.setTransform(1, 0, 0, 1, 0, 0);
        tg.clearRect(0, 0, W, H);
        tg.setTransform(M);
        tg.globalCompositeOperation = 'source-over';
        tones(tg);
        // work box in output px
        let bx0 = 0, by0 = 0, bx1 = W, by1 = H;
        if (o.box) {
            const cs = [[o.box[0], o.box[1]], [o.box[2], o.box[1]], [o.box[0], o.box[3]], [o.box[2], o.box[3]]].map(([x, y]) => [M.a * x + M.c * y + M.e, M.b * x + M.d * y + M.f]);
            bx0 = Math.max(0, Math.floor(Math.min(...cs.map((c) => c[0])))); bx1 = Math.min(W, Math.ceil(Math.max(...cs.map((c) => c[0]))));
            by0 = Math.max(0, Math.floor(Math.min(...cs.map((c) => c[1])))); by1 = Math.min(H, Math.ceil(Math.max(...cs.map((c) => c[1]))));
        }
        if (bx1 <= bx0 || by1 <= by0) return;
        const bw = bx1 - bx0, bh = by1 - by0;
        const T0 = tg.getImageData(bx0, by0, bw, bh).data;
        const cg = ccan.getContext('2d');
        const out = cg.createImageData(bw, bh), O = out.data;
        // output px → card units (inverse of M) → reference px (× 1.08)
        const I = M.inverse(), holes = o.mode === 'holes';
        const a = (lat.a * Math.PI) / 180, ca = Math.cos(a), sa = Math.sin(a), p = lat.p;
        const jit = o.jit ?? 0.12, pj = o.pj ?? 0.05, e = (o.edge ?? 1.1) / p, PI = Math.PI;
        for (let y = 0; y < bh; y++) {
            const Y = by0 + y + 0.5;
            for (let x = 0; x < bw; x++) {
                const q = (y * bw + x) * 4, t = T0[q + 3] / 255;
                if (t < 0.004) continue;
                const X = bx0 + x + 0.5;
                const lx = (I.a * X + I.c * Y + I.e) - lat.x, ly = (I.b * X + I.d * Y + I.f) - lat.y;
                const u = (lx * ca + ly * sa) / p, v = (-lx * sa + ly * ca) / p;
                let cov;
                if (t >= 0.985) cov = 1;
                else if (holes ? t < 0.215 : t <= 0.5) {
                    const cu = Math.round(u), cv = Math.round(v);
                    const h = Math.sin(cu * 127.1 + cv * 311.7) * 43758.5453, hj = h - Math.floor(h), hk = (hj * 7.31) % 1, hl = (hj * 13.7) % 1;
                    const du = u - cu - pj * (hk - 0.5) * 2, dv = v - cv - pj * (hl - 0.5) * 2;
                    const r = Math.sqrt(t / PI) * (1 + jit * (hj - 0.5) * 2);
                    cov = Math.min(1, Math.max(0, (r - Math.sqrt(du * du + dv * dv)) / e + 0.5));
                } else {
                    const cu = Math.floor(u), cv = Math.floor(v);
                    const h = Math.sin(cu * 269.5 + cv * 183.3) * 43758.5453, hj = h - Math.floor(h), hk = (hj * 7.31) % 1, hl = (hj * 13.7) % 1;
                    const du = u - cu - 0.5 - pj * (hk - 0.5) * 2, dv = v - cv - 0.5 - pj * (hl - 0.5) * 2;
                    const r = Math.sqrt((1 - t) / PI) * (1 + jit * (hj - 0.5) * 2);
                    cov = 1 - Math.min(1, Math.max(0, (r - Math.sqrt(du * du + dv * dv)) / e + 0.5));
                }
                O[q + 3] = cov * 255;
            }
        }
        cg.putImageData(out, 0, 0);
        plate.save();
        plate.setTransform(1, 0, 0, 1, 0, 0);
        plate.globalCompositeOperation = o.op ?? 'source-over';
        plate.drawImage(ccan, 0, 0, bw, bh, bx0, by0, bw, bh);
        plate.restore();
        // o.also: [{ ink, mask(g) }] the same dots printed in another ink too, scaled by a
        // mask (alpha) drawn in plate units: a darker ink that keeps the holes' geometry
        for (const { ink: ink2, mask } of o.also ?? []) {
            tg.setTransform(1, 0, 0, 1, 0, 0);
            tg.clearRect(0, 0, W, H);
            tg.globalCompositeOperation = 'source-over';
            tg.drawImage(ccan, 0, 0, bw, bh, bx0, by0, bw, bh);
            tg.setTransform(M);
            tg.globalCompositeOperation = 'destination-in';
            mask(tg);
            tg.globalCompositeOperation = 'source-over';
            const p2 = press.plate(ink2);
            p2.save(); p2.setTransform(1, 0, 0, 1, 0, 0); p2.drawImage(tcan, 0, 0); p2.restore();
        }
    }
    // The sonar pulse that runs over planet → lightning → balloons (frames 289–296 of the
    // film, one drawing per frame), measured with radial scans round the dot (ref px):
    // a blue ring (≈ 14 px) with paper on both sides (≈ 3–6 px), and thin blue circles
    // (≈ 5 px) born behind it. Returns true when it drew something.
    const PULSE = {
        // frame: [ring radius, [thin circle radii]]
        289: [134, []], 290: [234, []], 291: [327, []], 292: [412, [132]], 293: [484, [225]],
        294: [533, [331]], 295: [590, [416, 135]], 296: [650, [480, 234]],
    };
    function pulse(press, f) {
        const row = PULSE[f];
        if (!row) return false;
        const [R, thin] = row;
        refpx(press);
        const ann = (g, r0, r1) => { g.beginPath(); g.arc(540, 540, r1, 0, 7); g.arc(540, 540, Math.max(0, r0), 0, 7, true); g.fill(); };
        press.knockout((g) => ann(g, R - 11, R + 12));
        const b = press.plate('blue');
        b.fillStyle = T(1);
        ann(b, R - 7, R + 7);
        for (const r of thin) {
            press.knockout((g) => ann(g, r - 2.5, r + 2.5));
            b.fillStyle = T(1);
            ann(b, r - 2.5, r + 2.5);
        }
        press.restore();
        return true;
    }
    // author a card in reference px (the 1080 frame): scale every plate by 1000/1080
    function refpx(press) { press.save(); press.each((g) => g.scale(1000 / 1080, 1000 / 1080)); }
    return { pulse, refpx, T, path, smooth, poly, blob, sline, seg, disc, ell, clip, on, erase, speckle, specks, dots, lin, rad, jag, screen };
})();
