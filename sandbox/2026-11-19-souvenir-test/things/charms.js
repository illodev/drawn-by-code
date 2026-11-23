// Charms round the emblem, in the emblem manner (dark contour + airbrush): a pair of
// castanets on their silk cord, a fan of three cards of the Spanish deck, a pomegranate
// split open. Global: Charms. Sizes at s = 1, the anchor in the middle of each:
//   Charms.castanets(g, { x, y, s, rot, seed })    232 × 200
//   Charms.cards(g, { x, y, s, rot, seed })        436 × 268 (each card 150 × 230; the ace of
//                                                  coins in front, cups and swords behind)
//   Charms.pomegranate(g, { x, y, s, rot, seed })  188 × 264 with crown and twig (the fruit 185)
//   Charms.aril(g, { x, y, s, rot, seed })         16 × 11, one loose seed, its point along -x
// `rot` turns the object, never the light: the geometry is turned point by point, so the
// sprays keep falling from the top left, and the per-pixel sprites (the shells, the fruit's
// skin) are baked with Souvenir.lightFor and cached by angle, resolution and seed. Paint
// them once on a layer: nothing here takes the time.
const Charms = (() => {
    const S = Souvenir;
    const INK = S.INK, SD = S.SHADE_DIR, TOL = [-SD[0], -SD[1]]; // TOL: towards the light, on the page
    const TAU = Math.PI * 2;
    const cache = new Map();
    const memo = (key, fn) => {
        if (!cache.has(key)) cache.set(key, fn());
        return cache.get(key);
    };
    const STEP = Math.PI / 24;
    const snap = (a) => Math.round(a / STEP) * STEP;
    // pixels per unit for a sprite: the output's, rounded up to half steps
    const resOf = (g, k = 1) => Math.min(8, Math.max(1, Math.ceil(S.pxScale(g) * k * 2 - 1e-6) / 2));
    const rotP = (p, a) => {
        const c = Math.cos(a), s = Math.sin(a);
        return [p[0] * c - p[1] * s, p[0] * s + p[1] * c];
    };
    const pol = (r, a, cx = 0, cy = 0) => [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
    const dot2 = (a, b) => a[0] * b[0] + a[1] * b[1];
    const lerpP = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];

    // A frame maps a part's own coordinates to the drawer's: every point goes through it,
    // the context is never rotated (the light must not turn with the object).
    function frame(x, y, rot = 0, s = 1) {
        const c = Math.cos(rot) * s, sn = Math.sin(rot) * s;
        const f = (p) => [x + p[0] * c - p[1] * sn, y + p[0] * sn + p[1] * c];
        f.pts = (a) => a.map(f);
        f.rot = rot;
        f.s = s;
        f.sub = (px, py, r2 = 0, s2 = 1) => {
            const o = f([px, py]);
            return frame(o[0], o[1], rot + r2, s * s2);
        };
        f.dir = (v) => rotP(v, rot); // a direction of the part, on the page
        return f;
    }

    // ------------------------------------------------------------------ small tools
    const fillPts = (g, pts, style) => {
        g.beginPath();
        S.trace(g, pts);
        g.fillStyle = style;
        g.fill();
    };
    const strokePts = (g, pts, w, style, closed = false) => {
        g.beginPath();
        S.trace(g, pts, closed);
        g.lineWidth = w;
        g.strokeStyle = style;
        g.lineJoin = 'round';
        g.lineCap = 'round';
        g.stroke();
    };
    const disc = (g, p, r, style) => {
        g.beginPath();
        g.arc(p[0], p[1], r, 0, TAU);
        g.fillStyle = style;
        g.fill();
    };
    // a right-hand profile [[x, y], …] from top to bottom, mirrored into a closed outline
    const sym = (right) => [...right, ...right.slice().reverse().filter((p) => p[0] > 1e-6).map(([x, y]) => [-x, y])];
    const rrect = (w, h, r, n = 6) => {
        const out = [], cs = [[w / 2 - r, -h / 2 + r, -Math.PI / 2], [w / 2 - r, h / 2 - r, 0], [-w / 2 + r, h / 2 - r, Math.PI / 2], [-w / 2 + r, -h / 2 + r, Math.PI]];
        for (const [cx, cy, a0] of cs) for (let k = 0; k <= n; k++) out.push(pol(r, a0 + ((k / n) * Math.PI) / 2, cx, cy));
        return out;
    };
    // a polyline walked in even steps: [{ p, t, n, s }]
    function walk(pts, step = 0.5) {
        const out = [];
        let acc = 0, next = 0;
        for (let i = 1; i < pts.length; i++) {
            const a = pts[i - 1], b = pts[i], d = Math.hypot(b[0] - a[0], b[1] - a[1]);
            if (d < 1e-6) continue;
            while (next <= acc + d) {
                const u = (next - acc) / d;
                out.push({ p: [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u], s: next });
                next += step;
            }
            acc += d;
        }
        for (let i = 0; i < out.length; i++) {
            const a = out[Math.max(0, i - 2)].p, b = out[Math.min(out.length - 1, i + 2)].p, l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
            out[i].t = [(b[0] - a[0]) / l, (b[1] - a[1]) / l];
            out[i].n = [-out[i].t[1], out[i].t[0]];
        }
        return out;
    }
    // a band about a centre line, w0 wide at its start and w1 at its end
    function band(line, w0, w1 = w0) {
        const st = walk(line, 1), n = st.length, L = [], R = [];
        st.forEach((q, i) => {
            const w = (w0 + (w1 - w0) * (i / Math.max(1, n - 1))) / 2;
            L.push([q.p[0] + q.n[0] * w, q.p[1] + q.n[1] * w]);
            R.push([q.p[0] - q.n[0] * w, q.p[1] - q.n[1] * w]);
        });
        return [...L, ...R.reverse()];
    }
    const inside = (p, poly) => {
        let c = false;
        for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
            const a = poly[i], b = poly[j];
            if (a[1] > p[1] !== b[1] > p[1] && p[0] < ((b[0] - a[0]) * (p[1] - a[1])) / (b[1] - a[1]) + a[0]) c = !c;
        }
        return c;
    };
    const distSeg = (p, a, b) => {
        const dx = b[0] - a[0], dy = b[1] - a[1], l2 = dx * dx + dy * dy || 1;
        const u = Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / l2));
        return Math.hypot(p[0] - a[0] - dx * u, p[1] - a[1] - dy * u);
    };
    const distLine = (p, pts, closed = false) => {
        let d = 1e9;
        for (let i = closed ? 0 : 1; i < pts.length; i++) d = Math.min(d, distSeg(p, pts[(i - 1 + pts.length) % pts.length], pts[i]));
        return d;
    };

    // Paints with `paint(q)` on a sheet of its own and lets it fade in from `from`
    // (nothing) to `to` (whole): how a part grows out of another without a seam.
    function faded(g, box, from, to, paint) {
        const k = S.pxScale(g), c = document.createElement('canvas');
        c.width = Math.max(2, Math.ceil(box.w * k));
        c.height = Math.max(2, Math.ceil(box.h * k));
        const q = c.getContext('2d');
        q.setTransform(k, 0, 0, k, -box.x * k, -box.y * k);
        paint(q);
        q.globalCompositeOperation = 'destination-in';
        const gr = q.createLinearGradient(from[0], from[1], to[0], to[1]);
        gr.addColorStop(0, 'rgba(0,0,0,0)');
        gr.addColorStop(1, 'rgba(0,0,0,1)');
        q.fillStyle = gr;
        q.fillRect(box.x, box.y, box.w, box.h);
        g.drawImage(c, box.x, box.y, box.w, box.h);
    }

    const GOLD = { base: '#d9a441', deep: '#8a5a17', light: '#f6dc8a', glint: '#fff6cf' };
    const RED = { base: '#c23a35', deep: '#5e1626', light: '#f39a8c', glint: '#ffe1d6' };
    const GREEN = { base: '#2a7a4f', deep: '#0b3a2f', light: '#8fd08a', glint: '#e0f6c8' };
    const STEEL = { base: '#8fa3c8', deep: '#35416f', light: '#e3eaf5', glint: '#fbfdff' };
    // a flat facet of a cut thing (a sun's ray, a star's point, a blade): its tone from the
    // way it faces, l in -1..1
    const facet = (C, l) => (l >= 0 ? S.mix(C.base, C.light, 0.2 + 0.75 * l) : S.mix(C.base, C.deep, 0.2 + 0.7 * -l));
    const sh = (C, w, a = 0.85) => ({ color: C.deep, alpha: a, w });
    const li = (C, w, a = 0.7) => ({ color: C.light, alpha: a, w });

    // A bead: a pellet of gold, a berry, a set stone. Small, so its own contour is thin.
    function bead(g, p, r, C, lw = 0.7) {
        disc(g, [p[0] + SD[0] * lw * 0.7, p[1] + SD[1] * lw * 0.7], r + lw, INK);
        const gr = g.createRadialGradient(p[0] + TOL[0] * r * 0.4, p[1] + TOL[1] * r * 0.4, r * 0.08, p[0], p[1], r * 1.08);
        gr.addColorStop(0, C.light);
        gr.addColorStop(0.5, C.base);
        gr.addColorStop(1, C.deep);
        disc(g, p, r, gr);
        // light bounced back into the shadow's rim, then the point of light
        g.save();
        g.beginPath();
        g.arc(p[0], p[1], r, 0, TAU);
        g.clip();
        g.strokeStyle = S.rgba(C.light, 0.35);
        g.lineWidth = r * 0.22;
        g.beginPath();
        g.arc(p[0], p[1], r * 0.86, Math.atan2(SD[1], SD[0]) - 0.8, Math.atan2(SD[1], SD[0]) + 0.8);
        g.stroke();
        g.restore();
        disc(g, [p[0] + TOL[0] * r * 0.42, p[1] + TOL[1] * r * 0.42], r * 0.24, S.rgba(C.glint ?? '#fff8e8', 0.95));
    }

    // ------------------------------------------------------------------ silk cord and tassels
    const SILK = { base: '#c8322f', mid: '#e0534a', deep: '#6d1226', light: '#f39a8c', ink: '#2a0d24' };

    // A cord of two strands twisted together: every turn is its own little piece, lit across
    // the cord as a cylinder and shaded where it dives under the next turn.
    function rope(g, path, o = {}) {
        const w = o.w ?? 6, lw = o.line ?? 1.4, C = o.col ?? SILK, h = w / 2;
        const st = walk(path, 0.5);
        if (st.length < 4) return;
        const total = st[st.length - 1].s;
        const at = (s) => st[Math.max(0, Math.min(st.length - 1, Math.round(s / 0.5)))];
        const line = st.map((q) => q.p);
        if (o.cast) S.cast(g, (q) => strokePts(q, line, w, '#000'), o.cast);
        g.save();
        g.translate(SD[0] * lw * 0.6, SD[1] * lw * 0.6);
        strokePts(g, line, w + lw * 2, INK);
        g.restore();
        strokePts(g, line, w + lw * 2, INK);
        strokePts(g, line, w, C.deep);
        const n = Math.max(2, Math.round(total / (o.pitch ?? w * 0.82))), pp = total / n, sl = w * 0.46;
        const edge = (s, side, b) => {
            const q = at(s);
            return [q.p[0] + q.n[0] * side * b, q.p[1] + q.n[1] * side * b];
        };
        for (let i = 0; i < n; i++) {
            const s0 = i * pp, poly = [];
            for (let k = 0; k <= 4; k++) poly.push(edge(Math.min(total, s0 + sl + (pp * k) / 4), 1, h + 0.1 * w * Math.sin((Math.PI * k) / 4)));
            for (let k = 4; k >= 0; k--) poly.push(edge(Math.max(0, s0 - sl + (pp * k) / 4), -1, h + 0.1 * w * Math.sin((Math.PI * k) / 4)));
            const m = at(s0 + pp / 2), lit = dot2(m.n, TOL), k = Math.abs(lit);
            const A = [m.p[0] + m.n[0] * h, m.p[1] + m.n[1] * h], B = [m.p[0] - m.n[0] * h, m.p[1] - m.n[1] * h];
            const gr = g.createLinearGradient(A[0], A[1], B[0], B[1]);
            const stops = [[0, S.mix(C.base, C.light, 0.1 + 0.25 * k)], [0.26, S.mix(C.mid, C.light, 0.25 + 0.6 * k)], [0.58, C.base], [1, S.mix(C.base, C.deep, 0.6 + 0.35 * k)]];
            for (const [u, c] of stops) gr.addColorStop(lit >= 0 ? u : 1 - u, c);
            g.save();
            g.beginPath();
            S.trace(g, poly);
            g.fillStyle = gr;
            g.fill();
            g.clip();
            // the shade where this turn comes out from under the one before
            const e0 = edge(Math.min(total, s0 + sl), 1, h * 1.3), e1 = edge(Math.max(0, s0 - sl), -1, h * 1.3);
            g.lineCap = 'butt';
            g.strokeStyle = S.rgba(C.ink, 0.5);
            g.lineWidth = pp * 0.62;
            g.beginPath();
            g.moveTo(e0[0], e0[1]);
            g.lineTo(e1[0], e1[1]);
            g.stroke();
            // a glint on the crown of the turn, along the strand
            const m0 = edge(Math.min(total, s0 + pp * 0.56 + sl), 1, h), m1 = edge(Math.max(0, s0 + pp * 0.56 - sl), -1, h);
            const [ga, gb] = lit >= 0 ? [0.16, 0.44] : [0.56, 0.84];
            g.lineCap = 'round';
            g.strokeStyle = S.rgba('#ffd9cc', 0.25 + 0.5 * k);
            g.lineWidth = w * 0.15;
            g.beginPath();
            g.moveTo(...lerpP(m0, m1, ga));
            g.lineTo(...lerpP(m0, m1, gb));
            g.stroke();
            g.restore();
        }
        if (o.bore) {
            // its first turns are still in the bore's shade
            g.lineCap = 'butt';
            for (const [len, a] of [[o.bore, 0.3], [o.bore * 0.55, 0.4]]) strokePts(g, line.slice(0, Math.max(2, Math.round(len / 0.5))), w, S.rgba('#12060f', a));
            g.lineCap = 'round';
        }
        // the creases between turns
        g.strokeStyle = S.rgba(C.ink, 0.9);
        g.lineWidth = Math.max(0.5, w * 0.11);
        g.lineCap = 'round';
        for (let i = 1; i < n; i++) {
            const e0 = edge(Math.min(total, i * pp + sl), 1, h), e1 = edge(Math.max(0, i * pp - sl), -1, h);
            g.beginPath();
            g.moveTo(e0[0], e0[1]);
            g.lineTo(e1[0], e1[1]);
            g.stroke();
        }
    }

    // A tassel hanging along +y from the frame's origin: a head where the threads fold over
    // the cord, a binding of gold thread, and a skirt in which every thread is a line.
    function tassel(g, F, o = {}) {
        const L = o.len ?? 44, W = o.w ?? 18, C = SILK, r = Motion.rng('tassel' + (o.seed ?? 0));
        const y0 = L * 0.3, hn = W * 0.26, ys = L - y0;
        const side = (sx) => S.curve([[sx * hn, y0 - 1], [sx * W * 0.4, y0 + ys * 0.3], [sx * W * 0.5, y0 + ys * 0.68], [sx * W * 0.53, L]], false, 5);
        const bottom = [];
        for (let k = 1; k < 16; k++) bottom.push([W * 0.53 * (1 - (2 * (k + (r() - 0.5) * 0.5)) / 16), L + (r() - 0.35) * 4.4]);
        const skirt = F.pts([...side(1), ...bottom, ...side(-1).reverse()]);
        S.piece(g, skirt, {
            fill: C.base, line: 1.6, cast: o.cast,
            detail: (q) => {
                const n = 26;
                for (let i = 0; i < n; i++) {
                    const sx = ((i + 0.5) / n) * 2 - 1 + (r() - 0.5) * 0.05, v = r();
                    const th = S.curve([[sx * hn * 0.9, y0 - 2], [sx * W * 0.4 + (r() - 0.5), y0 + ys * 0.3], [sx * W * 0.5 + (r() - 0.5) * 1.4, y0 + ys * 0.7], [sx * W * 0.54 + (r() - 0.5) * 1.6, L + 3]], false, 5);
                    S.ink(q, F.pts(th), { w: 0.7 + r() * 0.8, color: v < 0.28 ? C.ink : v < 0.55 ? C.deep : v < 0.8 ? C.mid : C.light, alpha: 0.55 + r() * 0.4, taper: [0.2, 0.5] });
                }
                // the skirt is a round bundle: shade over the threads, light on its near side
                S.spray(q, skirt, { color: '#3c0a22', alpha: 0.7, w: W * 0.5 });
                S.spray(q, skirt, { color: '#ffb9a6', alpha: 0.3, w: W * 0.3, dir: TOL });
                // under the binding
                const u0 = F([0, y0 + 1]), u1 = F([0, y0 + 8]), gr = q.createLinearGradient(u0[0], u0[1], u1[0], u1[1]);
                gr.addColorStop(0, 'rgba(40,8,30,0.7)');
                gr.addColorStop(1, 'rgba(40,8,30,0)');
                q.fillStyle = gr;
                q.fill();
            },
        });
        // the head
        const head = F.pts(S.ellipse(0, y0 * 0.44, W * 0.31, y0 * 0.5, 28));
        S.piece(g, head, {
            fill: C.base, line: 1.5, shade: { color: C.deep, alpha: 0.9, w: W * 0.26 }, light: { color: C.light, alpha: 0.75, w: W * 0.16 },
            detail: (q) => {
                for (let i = 0; i < 7; i++) {
                    const sx = (i + 0.5) / 7 * 2 - 1;
                    S.ink(q, F.pts(S.curve([[sx * 1.2, -1], [sx * W * 0.3, y0 * 0.4], [sx * hn * 0.95, y0 * 0.95]], false, 5)), { w: 0.6, color: i % 3 ? C.deep : C.light, alpha: 0.55, taper: [0.6, 0.3] });
                }
            },
        });
        // the binding: gold thread wound round the neck
        const bind = F.pts(S.curve(sym([[hn * 1.12, y0 * 0.82], [hn * 1.22, y0 * 0.98], [hn * 1.12, y0 * 1.14]]), true, 4));
        S.piece(g, bind, {
            fill: GOLD.base, line: 1.3, cast: { blur: 2, dx: 0.8, dy: 1.6, color: 'rgba(30,6,24,0.6)' }, shade: sh(GOLD, W * 0.2), light: { color: GOLD.glint, alpha: 0.9, w: W * 0.12 },
            detail: (q) => {
                for (const k of [0.9, 0.98, 1.06]) S.ink(q, F.pts([[-hn * 1.3, y0 * k + 0.4], [0, y0 * k + 1], [hn * 1.3, y0 * k + 0.4]]), { w: 0.6, color: GOLD.deep, alpha: 0.9, taper: [0, 0] });
            },
        });
    }

    // ------------------------------------------------------------------ castanets
    // One shell: the ears at the top (origin between them), the body along +y.
    const SHW = [[-6, 16], [-1.5, 26.5], [8, 28.5], [17, 26.5], [23.5, 26], [31.5, 31.5], [43.5, 40.5], [60, 46], [78, 44.5], [96, 36], [108.5, 19], [112.5, 0.5]];
    const shw = (y) => {
        if (y <= SHW[0][0]) return SHW[0][1];
        for (let i = 1; i < SHW.length; i++) if (y <= SHW[i][0]) return SHW[i - 1][1] + ((SHW[i][1] - SHW[i - 1][1]) * (y - SHW[i - 1][0])) / (SHW[i][0] - SHW[i - 1][0]);
        return 0.5;
    };
    // two ears with a notch between them, a waist, then the round of the shell
    const SHELL = (() => {
        const half = [[0, 6.5], [5.5, -0.5], [12, -5.5], [20, -6], [26.5, -1.5], [28.5, 8], [26.5, 17], [26, 23.5], [31.5, 31.5], [40.5, 43.5], [46, 60], [44.5, 78], [36, 96], [19, 108.5], [0, 112.5]];
        return S.curve([...half, ...half.slice(1, -1).reverse().map(([x, y]) => [-x, y])], true, 7);
    })();
    const HOLE = [13.5, 7.5];
    // granadillo: near black in the shade, a red-brown where it faces the light
    const WOOD = [[0, '#0b0610'], [0.34, '#190c14'], [0.58, '#2a1418'], [0.72, '#3a1f1c'], [0.85, '#58291f'], [0.94, '#7b3f2a'], [1, '#a2623c']];

    function grain(q, seed, n = 46) {
        const r = Motion.rng('grain' + seed);
        q.lineCap = 'round';
        for (let i = 0; i < n; i++) {
            const u = -0.95 + (1.9 * (i + r())) / n, y0 = -4 + r() * 50, y1 = Math.min(111, y0 + 20 + r() * 74), dark = r() < 0.66;
            q.strokeStyle = dark ? `rgba(10,4,9,${(0.14 + r() * 0.2).toFixed(3)})` : `rgba(170,98,62,${(0.05 + r() * 0.1).toFixed(3)})`;
            q.lineWidth = 0.3 + r() * 0.4;
            q.beginPath();
            for (let y = y0, first = true; y <= y1; y += 2.5, first = false) {
                const x = u * shw(y) * (0.985 + 0.03 * Math.sin(y * 0.09 + i * 1.7));
                if (first) q.moveTo(x, y);
                else q.lineTo(x, y);
            }
            q.stroke();
        }
    }
    function holes(q, tl) {
        const a0 = Math.atan2(-tl[1], -tl[0]);
        for (const sx of [-1, 1]) {
            q.fillStyle = '#09050c';
            q.beginPath();
            q.arc(sx * HOLE[0], HOLE[1], 5, 0, TAU);
            q.fill();
            // the far wall of the bore catches the light
            q.strokeStyle = 'rgba(180,108,68,0.8)';
            q.lineWidth = 0.9;
            q.beginPath();
            q.arc(sx * HOLE[0], HOLE[1], 4.4, a0 - 0.9, a0 + 0.9);
            q.stroke();
        }
    }

    // The polished outside of a shell.
    function shellOut(rotT, res, seed) {
        const a = snap(rotT);
        return memo(`out/${a.toFixed(3)}@${res}/${seed}`, () => {
            const L = S.lightFor(a), ll = Math.hypot(L[0], L[1]) || 1, tl = [L[0] / ll, L[1] / ll];
            return S.form({
                box: S.bbox(SHELL, 3), res, seed: 'shell' + seed, light: L, relief: 0.8,
                mask: (q) => {
                    q.beginPath();
                    S.trace(q, SHELL);
                    q.fill();
                },
                // the step cut between the bridge of the ears and the dome
                height: (x, y) => -1.7 * Math.exp(-Math.pow((y - 24 - x * x * 0.011) / 1.5, 2)) * S.smooth(30, 22, Math.abs(x)),
                ramp: WOOD, soft: 1,
                stroke: { amp: 0.05, field: (x, y) => [(x / Math.max(6, shw(y))) * 6.5, y * 0.014, 0.5] },
                mottle: { amp: 0.03, freq: 0.03 },
                spec: { amp: 0.95, power: 46, from: 0.35, to: 0.8, ragged: 0.1, color: '#ffe9cc' },
                tint: (x, y, tone, rgb, m) => {
                    // the night bounced into the shadow side's rim
                    const k = S.smooth(0.34, 0.08, tone) * S.smooth(0.16, 0.01, m) * 0.5;
                    rgb[0] += (74 - rgb[0]) * k;
                    rgb[1] += (64 - rgb[1]) * k;
                    rgb[2] += (120 - rgb[2]) * k;
                },
                over: (q) => {
                    grain(q, seed);
                    const cut = [];
                    for (let x = -27; x <= 27; x += 2) cut.push([x, 24 + x * x * 0.011]);
                    S.ink(q, cut, { w: 1.3, color: '#0b060c', alpha: 0.8, taper: [0.7, 0.7] });
                    S.ink(q, cut.map(([x, y]) => [x, y + (tl[1] < 0 ? 1.3 : -1.3)]), { w: 0.7, color: '#b87048', alpha: 0.55, taper: [0.9, 0.9] });
                    holes(q, tl);
                    // the crisp light along the dome, on the side of the lamp
                    // (no two shells are polished alike: its length, place and weight vary)
                    const hr = Motion.rng('sheen' + seed), th = Math.atan2(tl[1], tl[0]) + (hr() - 0.5) * 0.24, arc = [];
                    const step = 0.06 + hr() * 0.028, rad = 0.93 + hr() * 0.12, da = 0.74 + hr() * 0.3;
                    for (let k = -7; k <= 7; k++) arc.push([Math.cos(th + k * step) * 27.5 * rad, 66 + Math.sin(th + k * step) * 29 * rad]);
                    q.save();
                    q.filter = `blur(${(1.8 * res).toFixed(1)}px)`;
                    S.ink(q, arc, { w: 8, color: '#ffc99a', alpha: 0.55 });
                    q.restore();
                    S.ink(q, arc, { w: 2.1 + hr() * 0.8, color: '#fff5e4', alpha: 0.95 });
                    disc(q, [Math.cos(th + da) * 27 * rad, 66 + Math.sin(th + da) * 29 * rad], 0.9 + hr() * 0.4, 'rgba(255,245,228,0.9)');
                    // the far cheek of the dome mirrors the night: a cool, dim band inside the shadow
                    const tb = th + Math.PI, back = [];
                    for (let k = -6; k <= 6; k++) back.push([Math.cos(tb + k * 0.1) * 36, 66 + Math.sin(tb + k * 0.1) * 37]);
                    q.save();
                    q.filter = `blur(${(1.2 * res).toFixed(1)}px)`;
                    S.ink(q, back, { w: 3.2, color: '#7a6cb0', alpha: 0.4 });
                    q.restore();
                },
            });
        });
    }

    // The inside of a shell: a flat lip round a hollow.
    const HOLLOW = S.ellipse(0, 67, 32, 35.5, 56).map(([x, y]) => [x * (1 + (y - 67) * 0.0022), y]);
    function shellIn(rotT, res, seed) {
        const a = snap(rotT);
        return memo(`in/${a.toFixed(3)}@${res}/${seed}`, () => {
            const L = S.lightFor(a), ll = Math.hypot(L[0], L[1]) || 1, tl = [L[0] / ll, L[1] / ll];
            return S.form({
                box: S.bbox(SHELL, 3), res, seed: 'shellin' + seed, light: L, inflate: 'bevel', R: 4, relief: 0.75, profile: 'dome',
                mask: (q) => {
                    q.beginPath();
                    S.trace(q, SHELL);
                    q.fill();
                },
                height: (x, y) => {
                    const sx = x / (32 * (1 + (y - 67) * 0.0022)), sy = (y - 67) / 35.5, rr = sx * sx + sy * sy;
                    return rr < 1 ? -15 * (1 - rr) : 0;
                },
                ramp: WOOD, soft: 1,
                stroke: { amp: 0.045, field: (x, y) => [(x / Math.max(6, shw(y))) * 6.5, y * 0.014, 0.5] },
                mottle: { amp: 0.03, freq: 0.03 },
                spec: { amp: 0.5, power: 30, from: 0.45, to: 0.85, ragged: 0.15, color: '#ffe2c0' },
                over: (q) => {
                    grain(q, seed, 30);
                    holes(q, tl);
                    q.save();
                    q.beginPath();
                    S.trace(q, HOLLOW);
                    q.clip();
                    // the lip's shadow falls into the hollow from the lamp's side; the far wall glows
                    S.spray(q, HOLLOW, { color: '#07040a', alpha: 0.85, w: 12, push: 8, dir: tl });
                    S.spray(q, HOLLOW, { color: '#c9824e', alpha: 0.45, w: 7, push: 4, dir: [-tl[0], -tl[1]] });
                    q.strokeStyle = 'rgba(8,4,10,0.22)';
                    q.lineWidth = 0.5;
                    for (const k of [0.3, 0.52, 0.72, 0.88]) {
                        q.beginPath();
                        q.ellipse(0, 67, 32 * k, 35.5 * k, 0, 0, TAU);
                        q.stroke();
                    }
                    q.restore();
                    q.lineJoin = 'round';
                    q.strokeStyle = 'rgba(9,5,12,0.85)';
                    q.lineWidth = 1.2;
                    q.beginPath();
                    S.trace(q, HOLLOW);
                    q.stroke();
                    // the lip's edge catches the light on the far side of the hollow
                    const th = Math.atan2(-tl[1], -tl[0]), arc = [];
                    for (let k = -8; k <= 8; k++) arc.push([Math.cos(th + k * 0.09) * 33.6 * (1 + Math.sin(th + k * 0.09) * 0.08), 67 + Math.sin(th + k * 0.09) * 37.1]);
                    S.ink(q, arc, { w: 1.3, color: '#c98a5a', alpha: 0.7 });
                },
            });
        });
    }

    function shell(g, F, kind, res, seed, o = {}) {
        const sp = kind === 'in' ? shellIn(F.rot, res, seed) : shellOut(F.rot, res, seed);
        const at = F([0, 0]), pts = F.pts(SHELL);
        S.piece(g, pts, {
            fill: '#3a1f1c', line: 2.5, heavy: 0.85, cast: o.cast,
            detail: (q) => {
                S.put(q, sp, { x: at[0], y: at[1], rot: F.rot, s: F.s });
                // dark wood on a dark night: a thin warm light along the edge turned to the lamp
                S.spray(q, pts, { color: '#d08a58', alpha: 0.6, w: 2.6, push: 1.3, dir: TOL });
            },
        });
    }

    // The cord's end, tied off where it comes out of a bore: a knot and a frayed stub.
    function stopper(g, Fk) {
        const r = Motion.rng('stopper' + Fk([0, 0]).map((v) => Math.round(v)).join());
        const stub = [];
        for (let i = 0; i < 6; i++) stub.push(S.curve([[(i - 2.5) * 0.7, 2], [(i - 2.5) * 1.3, 6], [(i - 2.5) * 1.9 + (r() - 0.5), 9.5 + r() * 2.5]], false, 4));
        for (const th of stub) S.ink(g, Fk.pts(th), { w: 2.6, color: INK, taper: [0, 0.4] });
        stub.forEach((th, i) => S.ink(g, Fk.pts(th), { w: 1.2, color: i % 3 === 0 ? SILK.light : i % 2 ? SILK.base : SILK.deep, taper: [0, 0.5] }));
        S.piece(g, Fk.pts(S.ellipse(0, 0, 5.2, 4.5, 22)), {
            fill: SILK.base, line: 1.4, cast: { blur: 2.4, dx: 1.2, dy: 2, color: 'rgba(8,4,16,0.7)' },
            shade: { color: SILK.deep, alpha: 0.9, w: 4 }, light: { color: SILK.light, alpha: 0.8, w: 2.6 },
            detail: (q) => {
                S.ink(q, Fk.pts(S.curve([[-5, -1.6], [0, 0.6], [5, -1.2]], false, 5)), { w: 0.7, color: SILK.ink, alpha: 0.75, taper: [0, 0] });
                S.ink(q, Fk.pts(S.curve([[-4, 2.2], [0, 3.4], [4, 2]], false, 5)), { w: 0.6, color: SILK.ink, alpha: 0.6, taper: [0, 0] });
                disc(q, Fk([-1.6, -2]), 0.9, 'rgba(255,225,212,0.85)');
            },
        });
    }

    function castanets(g, o = {}) {
        const { x = 0, y = 0, s = 1, rot = 0, seed = 'castanets' } = o;
        g.save();
        g.translate(x, y);
        g.scale(s, s);
        const K = 0.98, res = resOf(g, K);
        const F = frame(0, 0, rot, K).sub(16.5, 24.5);
        const HL = [-31, -44], HR = [22, -50], aIn = 1.0, aL = 0.2, aR = -0.36;
        const hole = (h, a, sx, up = 0) => {
            const p = rotP([sx * HOLE[0], HOLE[1] - up], a);
            return [h[0] + p[0], h[1] + p[1]];
        };
        const drop = { blur: 8, dx: 4, dy: 5.5, color: 'rgba(12,7,26,0.6)' };
        // the open pair: the far shell shows its hollow, the near one its dome
        shell(g, F.sub(HL[0], HL[1], aIn), 'in', res, seed + 'a', { cast: drop });
        shell(g, F.sub(HL[0], HL[1], aL), 'out', res, seed + 'b', { cast: drop });
        // the closed pair, over it: the shell underneath only shows its edge
        shell(g, F.sub(HR[0] + 4.5, HR[1] + 5, aR - 0.05), 'out', res, seed + 'c', { cast: drop });
        shell(g, F.sub(HR[0], HR[1], aR), 'out', res, seed + 'd', { cast: { blur: 3.5, dx: 2.5, dy: 3.5, color: 'rgba(8,4,16,0.75)' } });

        // the cord: a loop to hang them by, an arch from the knot down to the outer bores, a
        // stopper knot at the inner ones, and two tails that end in tassels
        const w = 5.2 * K, KN = [-5, -99];
        const cs = { blur: 3, dx: 1.6, dy: 2.6, color: 'rgba(10,5,20,0.6)' };
        const run = (pts, o2 = {}) => rope(g, F.pts(S.curve(pts, false, 12)), { w, cast: cs, ...o2 });
        run([[KN[0] - 1.5, KN[1] - 3], [KN[0] - 8, KN[1] - 13], [KN[0], KN[1] - 23], [KN[0] + 8, KN[1] - 13], [KN[0] + 1.5, KN[1] - 3]], { w: w * 0.92 });
        // through the outer bore, behind the ears, and out of the inner one, where it is tied off
        stopper(g, F.sub(...hole(HL, aL, 1, -1.8), aL + 0.35));
        stopper(g, F.sub(...hole(HR, aR, -1, -1.8), aR - 0.3));
        run([hole(HL, aL, -1, 2.6), [-53, -61], [-37, -85], [KN[0] - 2.5, KN[1] + 5]], { bore: 7 });
        run([hole(HR, aR, 1, 2.6), [41, -71], [23, -90], [KN[0] + 2.5, KN[1] + 5]], { bore: 7 });
        const t1 = [[KN[0] - 1.2, KN[1] + 6], [-8.5, -72], [-8, -47], [-13.5, -22], [-22, -3], [-25, 5]];
        const t2 = [[KN[0] + 1.2, KN[1] + 6], [-2.5, -72], [-1.5, -47], [3, -20], [5.5, 6], [5, 23]];
        run(t1);
        run(t2);
        // the knot: three turns of the same cord whipped round all of it
        const Fk = F.sub(KN[0], KN[1], -0.1);
        for (const [yy, hx] of [[-4.3, 5.4], [0, 6.2], [4.3, 5.6]]) {
            rope(g, Fk.pts(S.curve([[-hx, yy - 0.9], [-hx * 0.4, yy + 0.7], [hx * 0.4, yy + 0.9], [hx, yy - 0.5]], false, 8)), { w: w * 0.86, pitch: w * 0.62, cast: { blur: 2, dx: 0.8, dy: 1.8, color: 'rgba(20,4,20,0.6)' } });
        }
        tassel(g, F.sub(-25, 4, 0.16), { len: 50, w: 21, seed: seed + '1', cast: { blur: 4, dx: 2.5, dy: 3.5, color: 'rgba(8,4,16,0.65)' } });
        tassel(g, F.sub(5, 22, 0.02), { len: 52, w: 21, seed: seed + '2', cast: { blur: 4, dx: 2.5, dy: 3.5, color: 'rgba(8,4,16,0.65)' } });
        g.restore();
    }

    // ------------------------------------------------------------------ cards of the Spanish deck
    const PAPER = '#f1e6c8';
    const ONE = [[0.62, -1], [0.62, -0.1], [0.84, -0.07], [0.84, 0], [0.14, 0], [0.14, -0.07], [0.37, -0.1], [0.37, -0.74], [0.13, -0.64], [0.08, -0.73], [0.47, -1]];

    // a pointed leaf along +x from its stalk
    function sprigLeaf(q, Fl, L, W, C, lw = 1) {
        const pts = Fl.pts(S.curve([[0, 0], [L * 0.3, -W * 0.5], [L * 0.72, -W * 0.34], [L, 0], [L * 0.7, W * 0.38], [L * 0.3, W * 0.5]], true, 5));
        S.piece(q, pts, {
            fill: C.base, line: lw, heavy: 0.6, cast: { blur: 2, dx: 0.8, dy: 1.3, color: 'rgba(8,24,20,0.5)' },
            shade: { color: C.deep, alpha: 0.85, w: W * 0.6 }, light: { color: C.light, alpha: 0.65, w: W * 0.42 },
            detail: (qq) => S.ink(qq, Fl.pts([[1, 0], [L * 0.5, -0.3], [L * 0.95, 0]]), { w: lw * 0.75, color: C.deep, taper: [0, 1] }),
        });
    }

    // a part of a turned vessel or a hilt: a mirrored profile, lit as a round thing
    function turned(q, F, right, C, o = {}) {
        const outline = o.raw ? sym(right) : S.curve(sym(right), true, 4);
        let hw = 0, y0 = 1e9, y1 = -1e9;
        for (const [px, py] of right) {
            hw = Math.max(hw, px);
            y0 = Math.min(y0, py);
            y1 = Math.max(y1, py);
        }
        const pts = F.pts(outline);
        S.piece(q, pts, {
            fill: C.base, line: o.line ?? 1.4, heavy: 0.7, cast: o.cast,
            detail: (qq) => {
                if (o.under) o.under(qq);
                S.spray(qq, pts, { color: C.deep, alpha: 0.88, w: hw * 0.75, push: hw * 0.5 });
                S.spray(qq, pts, { color: C.light, alpha: 0.75, w: hw * 0.45, push: hw * 0.2, dir: TOL });
                // bounce in the shadow's rim, and the crisp gleam of polished metal
                const side = dot2(F.dir([1, 0]), SD) >= 0 ? 1 : -1;
                if (hw > 3 && y1 - y0 > 3) {
                    // (a streak and a short dash under it, never a hairline: that reads as a scratch)
                    const h = y1 - y0, gw = Math.max(0.9, Math.min(3.6, hw * 0.13)), gx = -side * hw * 0.52;
                    const streak = F.pts([[gx + side * hw * 0.03, y0 + h * 0.13], [gx, y0 + h * 0.36], [gx - side * hw * 0.02, y0 + h * 0.6]]);
                    S.ink(qq, F.pts([[side * hw * 0.8, y0 + h * 0.2], [side * hw * 0.82, y1 - h * 0.2]]), { w: Math.max(0.6, hw * 0.1), color: C.light, alpha: 0.4 });
                    S.ink(qq, streak, { w: gw * 2.4, color: C.light, alpha: 0.38, taper: [0.7, 0.7] });
                    S.ink(qq, streak, { w: gw, color: C.glint, alpha: 0.9, taper: [0.5, 0.5] });
                    if (h > 9) S.ink(qq, F.pts([[gx - side * hw * 0.02, y0 + h * 0.7], [gx - side * hw * 0.02, y0 + h * 0.82]]), { w: gw * 0.9, color: C.glint, alpha: 0.75, taper: [0.5, 0.5] });
                }
                if (o.detail) o.detail(qq);
            },
        });
    }

    // As de oros: a sun-medal over two laurel branches tied with a bow.
    function oros(q, F) {
        const laurel = (mirror) => {
            const stem = S.curve([[-6, 87], [10, 82], [32, 73], [50, 55], [58, 36], [58.5, 21]].map(([px, py]) => [px * mirror, py]), false, 10);
            const st = walk(stem, 1), total = st[st.length - 1].s;
            S.ink(q, F.pts(stem), { w: 2.8, color: INK, taper: [0.2, 0.8] });
            S.ink(q, F.pts(stem), { w: 1.4, color: '#6f8a3a', taper: [0.2, 0.8] });
            const n = 12;
            for (let i = 0; i < n; i++) {
                const sAt = 15 + (i / (n - 1)) * (total - 16), m = st[Math.min(st.length - 1, Math.round(sAt))];
                const sd = i === n - 1 ? 0 : i % 2 ? 1 : -1, ang = Math.atan2(m.t[1], m.t[0]) + sd * 0.66;
                sprigLeaf(q, F.sub(m.p[0] + m.n[0] * sd * 0.6, m.p[1] + m.n[1] * sd * 0.6, ang), 19 - i * 0.55, 8 - i * 0.2, GREEN, 1.1);
                if (i % 3 === 1) bead(q, F([m.p[0] - m.n[0] * sd * 3.6, m.p[1] - m.n[1] * sd * 3.6]), 2.3, { base: '#cf3a3c', deep: '#7a1428', light: '#f39a8c', glint: '#ffe9e0' }, 0.7);
            }
        };
        laurel(1);
        laurel(-1);
        // the bow that ties them
        const bow = F.sub(0, 82);
        for (const mx of [-1, 1]) {
            S.piece(q, bow.pts(S.curve([[mx * 1, 3], [mx * 5, 10], [mx * 9.5, 14.5], [mx * 6.4, 13.6], [mx * 6, 17], [mx * 2, 10.5]], true, 4)), { fill: RED.base, line: 1, shade: sh(RED, 2.6), light: li(RED, 1.6) });
            S.piece(q, bow.pts(S.curve([[0, 0], [mx * 6, -6.5], [mx * 14, -4.5], [mx * 14.5, 1.5], [mx * 7, 3.5]], true, 5)), {
                fill: RED.base, line: 1.1, cast: { blur: 1.5, dx: 0.6, dy: 1, color: 'rgba(40,10,20,0.5)' }, shade: sh(RED, 3.6), light: li(RED, 2.4),
                detail: (qq) => S.ink(qq, bow.pts([[mx * 1.5, 0], [mx * 7, -1.8], [mx * 11.5, -1.2]]), { w: 0.8, color: RED.deep, alpha: 0.8 }),
            });
        }
        S.piece(q, bow.pts(S.curve([[-2.8, -2.6], [2.8, -2.8], [3.2, 2.8], [-3, 3]], true, 4)), { fill: '#d8463f', line: 1, shade: sh(RED, 2), light: li(RED, 1.4) });

        // the sun: sixteen rays, the long ones cut in two facets, the short ones flames
        const cf = F.sub(0, -21, 0, 1.08), R0 = 35;
        for (let k = 1; k < 16; k += 2) {
            const th = -Math.PI / 2 + (k * Math.PI) / 8, ax = [Math.cos(th), Math.sin(th)], nx = [-ax[1], ax[0]], L = [], Rr = [];
            for (let i = 0; i <= 12; i++) {
                const u = i / 12, rad = R0 + u * 14.5, lat = Math.sin(u * TAU * 0.95 + 0.4) * 2.4 * Math.sqrt(u), w = 3.3 * Math.pow(1 - u, 0.75);
                L.push([ax[0] * rad + nx[0] * (lat + w), ax[1] * rad + nx[1] * (lat + w)]);
                Rr.push([ax[0] * rad + nx[0] * (lat - w), ax[1] * rad + nx[1] * (lat - w)]);
            }
            S.piece(q, cf.pts([...L, ...Rr.reverse()]), { fill: '#dc8a3a', line: 1.1, heavy: 0.5, shade: { color: '#8a3417', alpha: 0.85, w: 3 }, light: { color: '#f8dc8c', alpha: 0.8, w: 2.4 } });
        }
        for (let k = 0; k < 16; k += 2) {
            const th = -Math.PI / 2 + (k * Math.PI) / 8, d = 0.215;
            const b0 = pol(R0, th - d), b1 = pol(R0, th + d), mid = pol(R0, th), tip = pol(55, th);
            const l0 = dot2(cf.dir([Math.sin(th), -Math.cos(th)]), TOL);
            S.piece(q, cf.pts([b0, tip, b1]), {
                fill: facet(GOLD, l0 * 0.9), line: 1.2, heavy: 0.5,
                detail: (qq) => {
                    fillPts(qq, cf.pts([mid, tip, b1]), facet(GOLD, -l0 * 0.9));
                    // the medal's rim shades the root of every ray
                    const c = cf([0, 0]), gr = qq.createRadialGradient(c[0], c[1], R0 * cf.s, c[0], c[1], (R0 + 11) * cf.s);
                    gr.addColorStop(0, 'rgba(96,48,10,0.75)');
                    gr.addColorStop(1, 'rgba(96,48,10,0)');
                    qq.fillStyle = gr;
                    qq.fillRect(c[0] - 80 * F.s, c[1] - 80 * F.s, 160 * F.s, 160 * F.s);
                    S.ink(qq, cf.pts([mid, tip]), { w: 0.7, color: GOLD.deep, alpha: 0.9, taper: [0, 0.6] });
                    S.ink(qq, cf.pts([pol(R0 + 2, th - d * 0.5), pol(51, th - 0.02)]), { w: 0.6, color: GOLD.glint, alpha: l0 > 0 ? 0.8 : 0.25, taper: [0.5, 0.9] });
                },
            });
        }
        // the medal
        const ring = (r, n = 72) => cf.pts(S.ellipse(0, 0, r, r, n));
        S.piece(q, ring(37), { fill: GOLD.base, line: 1.5, cast: { blur: 3, dx: 1.4, dy: 2, color: 'rgba(60,30,10,0.55)' }, shade: sh(GOLD, 9, 0.9), light: { color: GOLD.glint, alpha: 0.85, w: 6 } });
        strokePts(q, ring(33.7), 5.6, 'rgba(104,60,12,0.6)', true);
        for (let i = 0; i < 30; i++) bead(q, cf(pol(33.7, (i / 30) * TAU + 0.05)), 2.3, GOLD, 0.6);
        S.piece(q, ring(30.4), { fill: '#b8352f', line: 1.1, shade: { color: '#5e1626', alpha: 0.9, w: 8 }, light: { color: '#f39a8c', alpha: 0.6, w: 5 } });
        {
            // the gloss of the enamel and the turned edge of the rim: crisp arcs towards the lamp
            const th = Math.atan2(TOL[1], TOL[0]) - cf.rot, arc = (r, sp) => { const a = []; for (let k = -8; k <= 8; k++) a.push(pol(r, th + (k / 8) * sp)); return cf.pts(a); };
            S.ink(q, arc(29.3, 0.62), { w: 1.1, color: '#ffd9cc', alpha: 0.85 });
            S.ink(q, arc(36.1, 0.7), { w: 0.9, color: GOLD.glint, alpha: 0.95 });
            S.ink(q, arc(31.3, 0.9), { w: 0.7, color: GOLD.glint, alpha: 0.6 });
        }
        for (let i = 0; i < 16; i++) {
            const p = cf(pol(27.4, (i / 16) * TAU));
            if (i % 2) bead(q, p, 1.9, GOLD, 0.55);
            else bead(q, p, 1.7, { base: '#1f7350', deep: '#0b3a2f', light: '#46a676', glint: '#d9f5d0' }, 0.55);
        }
        S.piece(q, ring(24.3), {
            fill: '#e2b24c', line: 1.1, shade: sh(GOLD, 11, 0.75), light: { color: GOLD.glint, alpha: 0.75, w: 8 },
            detail: (qq) => {
                // engraved: a ring cut in, and fine rays behind the star
                qq.lineCap = 'butt';
                for (let i = 0; i < 64; i++) {
                    const a = (i / 64) * TAU + 0.02;
                    strokePts(qq, cf.pts([pol(9.5, a), pol(i % 2 ? 19 : 20.2, a)]), 0.45, 'rgba(122,74,16,0.4)');
                }
                strokePts(qq, ring(21.8), 0.9, 'rgba(110,64,12,0.85)', true);
                qq.save();
                qq.translate(SD[0] * 0.7, SD[1] * 0.7);
                strokePts(qq, ring(21.8), 0.6, 'rgba(255,244,196,0.8)', true);
                qq.restore();
            },
        });
        // the eight-pointed star, every point cut in two facets
        const star = [], tips = [], inner = [];
        for (let k = 0; k < 8; k++) {
            tips.push(pol(18.6, -Math.PI / 2 + (k * Math.PI) / 4));
            inner.push(pol(7.7, -Math.PI / 2 + ((k + 0.5) * Math.PI) / 4));
            star.push(tips[k], inner[k]);
        }
        S.piece(q, cf.pts(star), {
            fill: GOLD.base, line: 1.1, heavy: 0.6, cast: { blur: 1.6, dx: 0.8, dy: 1.1, color: 'rgba(70,36,8,0.6)' },
            detail: (qq) => {
                for (let k = 0; k < 8; k++) {
                    const th = -Math.PI / 2 + (k * Math.PI) / 4, l0 = dot2(cf.dir([Math.sin(th), -Math.cos(th)]), TOL);
                    fillPts(qq, cf.pts([[0, 0], inner[(k + 7) % 8], tips[k]]), facet(GOLD, l0));
                    fillPts(qq, cf.pts([[0, 0], tips[k], inner[k]]), facet(GOLD, -l0));
                }
                for (let k = 0; k < 8; k++) {
                    S.ink(qq, cf.pts([[0, 0], tips[k]]), { w: 0.6, color: GOLD.deep, alpha: 0.9, taper: [0, 0.5] });
                    S.ink(qq, cf.pts([[0, 0], inner[k]]), { w: 0.45, color: GOLD.deep, alpha: 0.6, taper: [0, 0.2] });
                }
            },
        });
        bead(q, cf([0, 0]), 5.6, GOLD, 0.8);
        bead(q, cf([0, 0]), 3.9, { base: '#cf3a3c', deep: '#7a1428', light: '#f39a8c', glint: '#fff0ea' }, 0.6);
    }

    // As de copas: a covered goblet, red enamel and gold.
    function copas(q, F0) {
        const F = F0.sub(0, 5);
        const cs = { blur: 2.4, dx: 1.2, dy: 2.2, color: 'rgba(50,20,10,0.6)' };
        const hwAt = (prof, y) => {
            for (let i = 1; i < prof.length; i++) if (y <= prof[i][1]) return prof[i - 1][0] + ((prof[i][0] - prof[i - 1][0]) * (y - prof[i - 1][1])) / (prof[i][1] - prof[i - 1][1] || 1);
            return prof[prof.length - 1][0];
        };
        // foot
        turned(q, F, [[26, 65.2], [29.6, 66.2], [30.6, 69], [29.4, 72], [26, 72.6]], GOLD, {
            detail: (qq) => {
                for (let i = -5; i <= 5; i++) disc(qq, F([i * 4.8, 69.2]), 0.9, 'rgba(110,62,12,0.75)');
            },
        });
        const foot = [[5.4, 50], [7.4, 55.5], [13, 60.6], [21.5, 64], [26.8, 65.8], [26.8, 66.6]];
        turned(q, F, foot, GOLD, {
            cast: cs,
            detail: (qq) => {
                for (const m of [-0.66, -0.33, 0, 0.33, 0.66]) S.ink(qq, F.pts(S.curve([[m * 5, 50], [m * 9, 56], [m * 18, 61.5], [m * 27, 66]], false, 5)), { w: 0.7, color: GOLD.deep, alpha: 0.75, taper: [0.5, 0] });
            },
        });
        turned(q, F, [[3.9, 40.5], [4.2, 45], [5.8, 50.6]], GOLD, { raw: true, line: 1.2 });
        turned(q, F, [[5.3, 25.5], [4.2, 29], [3.9, 32.5]], GOLD, { raw: true, line: 1.2 });
        turned(q, F, [[0, 30.2], [5.5, 30.8], [9.6, 33.6], [10, 36.4], [8.6, 39.8], [4.5, 42.2], [0, 42.6]], GOLD, {
            cast: cs,
            detail: (qq) => S.ink(qq, F.pts([[-10, 36.2], [0, 37.2], [10, 36.2]]), { w: 0.8, color: GOLD.deep, alpha: 0.8, taper: [0, 0] }),
        });
        // the bowl: gadrooned gold under a band of red enamel
        const low = [[29.4, 1], [28.2, 8.5], [23.4, 16.6], [15, 23], [7, 26.4], [5.5, 27]];
        turned(q, F, low, GOLD, {
            cast: cs,
            under: (qq) => {
                // the gadroons: every lobe swells, a light on its near flank and a shade in its valley
                for (let i = -3; i <= 3; i++) {
                    const m = i / 3.5, lobe = (mm) => S.curve([1.5, 8, 15, 21, 26.6].map((yy) => [mm * hwAt(low, yy) * 1.02, yy]), false, 5);
                    S.ink(qq, F.pts(lobe(m - 0.085)), { w: 2.2, color: GOLD.glint, alpha: 0.55, taper: [0.3, 0.9] });
                    S.ink(qq, F.pts(lobe(m + 0.143)), { w: 1.5, color: GOLD.deep, alpha: 0.85, taper: [0.2, 0.7] });
                }
            },
        });
        const up = [[30.6, -28.5], [31.3, -19], [30.6, -9], [29.6, -2.6]];
        turned(q, F, up, RED, {
            raw: true,
            detail: (qq) => {
                // set with gold: lozenges between two fine lines
                for (const yy of [-24.6, -6.6]) S.ink(qq, F.pts([[-32, yy], [0, yy + 0.8], [32, yy]]), { w: 0.8, color: GOLD.base, alpha: 0.95, taper: [0, 0] });
                for (let i = -3; i <= 3; i++) {
                    const cx = i * 8.6, k = 1 - Math.abs(i) * 0.07;
                    const loz = F.pts([[cx, -20.4], [cx + 2.9 * k, -15.4], [cx, -10.4], [cx - 2.9 * k, -15.4]]);
                    S.piece(qq, loz, { fill: GOLD.base, line: 0.7, heavy: 0.5, shade: sh(GOLD, 2), light: { color: GOLD.glint, alpha: 0.9, w: 1.4 } });
                }
            },
        });
        turned(q, F, [[29.3, -3.4], [30.8, -2.6], [31, -0.6], [30.4, 1.4], [29, 2]], GOLD, { cast: cs, line: 1.2 });
        turned(q, F, [[30.6, -32.8], [32.4, -31.8], [32.4, -29.4], [30.6, -28.2]], GOLD, { line: 1.2 });
        // the lid
        const lid = [[3.6, -61.8], [9.5, -59.4], [16.5, -55], [23, -49.6], [28, -43.6], [30.6, -37.6], [16, -36.2], [0, -35.8]];
        turned(q, F, lid, RED, {
            detail: (qq) => {
                for (const m of [-0.82, -0.42, 0, 0.42, 0.82]) {
                    const rib = S.curve([[m * 3.6, -62], [m * 16.5, -55], [m * 28, -43.6], [m * 31.5, -36.4]], false, 6);
                    S.ink(qq, F.pts(rib.map(([px, py]) => [px + 0.7, py + 0.5])), { w: 2.6, color: RED.deep, alpha: 0.8, taper: [0.5, 0] });
                    S.ink(qq, F.pts(rib), { w: 1.7, color: GOLD.base, taper: [0.5, 0] });
                    S.ink(qq, F.pts(rib.map(([px, py]) => [px - 0.3, py - 0.2])), { w: 0.6, color: GOLD.glint, alpha: 0.9, taper: [0.6, 0.3] });
                }
            },
        });
        turned(q, F, [[31, -38], [33.6, -37.2], [34.4, -35], [33.6, -32.8], [31, -32.2]], GOLD, {
            cast: cs,
            detail: (qq) => {
                for (let i = -7; i <= 7; i++) disc(qq, F([i * 4.2, -34.9]), 0.85, 'rgba(110,62,12,0.8)');
            },
        });
        turned(q, F, [[2.5, -65.4], [3.6, -61]], GOLD, { raw: true, line: 1.1 });
        const ball = F([0, -69.6]);
        turned(q, F, [[0, -84], [1.6, -80.6], [2.5, -77], [1.7, -74]], GOLD, { line: 1 });
        S.piece(q, F.pts(S.ellipse(0, -69.6, 5.6, 5.4, 24)), { fill: GOLD.base, line: 1.2, cast: cs, shade: sh(GOLD, 4.5, 0.9), light: { color: GOLD.light, alpha: 0.8, w: 3 } });
        disc(q, [ball[0] + TOL[0] * 2.3, ball[1] + TOL[1] * 2.3], 1.2, 'rgba(255,250,225,0.95)');
    }

    // As de espadas: a straight sword, blue steel and a gold hilt, a red ribbon wound round it.
    function espadas(q, F0) {
        const F = F0.sub(0, -1);
        const cs = { blur: 2.2, dx: 1.1, dy: 2, color: 'rgba(20,16,50,0.6)' };
        // a pass of the ribbon: a band about its centre line; `from`/`to` pin its end sections
        // to the folds it shares with the next pass
        const sect = (line, w, end) => {
            const st = walk(S.curve(line, false, 10), 1), q0 = st[end ? st.length - 1 : 0];
            return [[q0.p[0] + q0.n[0] * w / 2, q0.p[1] + q0.n[1] * w / 2], [q0.p[0] - q0.n[0] * w / 2, q0.p[1] - q0.n[1] * w / 2]];
        };
        const ribbon = (line, w, back, o = {}) => {
            const cl = S.curve(line, false, 10), poly = band(cl, w), n = poly.length / 2;
            const pin = (sec, iL, iR) => {
                const d = (a2, b2) => Math.hypot(a2[0] - b2[0], a2[1] - b2[1]);
                const swap = d(sec[0], poly[iL]) + d(sec[1], poly[iR]) > d(sec[1], poly[iL]) + d(sec[0], poly[iR]);
                poly[iL] = swap ? sec[1] : sec[0];
                poly[iR] = swap ? sec[0] : sec[1];
            };
            if (o.from) pin(o.from, 0, poly.length - 1);
            if (o.to) pin(o.to, n - 1, n);
            const pts = F.pts(poly);
            S.piece(q, pts, {
                fill: back ? '#7a1a28' : RED.base, line: 1.3, cast: o.cast,
                shade: { color: back ? '#2c0a1c' : RED.deep, alpha: 0.85, w: w * 0.5 }, light: { color: RED.light, alpha: back ? 0.2 : 0.7, w: w * 0.36 },
                detail: (qq) => {
                    const st = walk(cl, 1);
                    for (const k of [-0.3, 0.3]) S.ink(qq, F.pts(st.map((m) => [m.p[0] + m.n[0] * w * k, m.p[1] + m.n[1] * w * k])), { w: 0.75, color: back ? '#a8742f' : GOLD.base, alpha: back ? 0.6 : 0.95, taper: [0, 0] });
                    // the silk dips between the folds: a soft light on its crown
                    if (!back) S.ink(qq, F.pts(st.slice(Math.floor(st.length * 0.25), Math.floor(st.length * 0.7)).map((m) => m.p)), { w: w * 0.3, color: '#ffc4b0', alpha: 0.35 });
                },
            });
        };
        const A = [[-31, -52], [-14, -52], [8, -43], [25, -30]], B = [[25, -30], [10, -19], [-10, -18], [-26, -6.5]], C = [[-26, -6.5], [-10, -5], [10, 4], [27, 16.5]], RW = 10.5;
        // behind the blade
        ribbon(B, RW * 0.92, true, { from: sect(A, RW, true), to: sect(C, RW, false) });
        // the blade
        const blade = [[-6.9, 29], [-5.7, -66], [-3.3, -78.5], [0, -89], [3.3, -78.5], [5.7, -66], [6.9, 29]];
        const lL = dot2(F.dir([-1, 0]), TOL);
        S.piece(q, F.pts(blade), {
            fill: facet(STEEL, lL * 0.9), line: 1.5, cast: cs,
            detail: (qq) => {
                fillPts(qq, F.pts([[0, 29], [0, -89], [3.3, -78.5], [5.7, -66], [6.9, 29]]), facet(STEEL, -lL * 0.9));
                // polished steel: a few soft lights lying across the blade, the hilt's shade at its root
                for (const [yy, a] of [[-70, 0.5], [-34, 0.34], [-2, 0.26]]) {
                    const p0 = F([0, yy - 9]), p1 = F([0, yy + 9]), gr = qq.createLinearGradient(p0[0], p0[1], p1[0], p1[1]);
                    gr.addColorStop(0, 'rgba(240,246,255,0)');
                    gr.addColorStop(0.5, `rgba(240,246,255,${a})`);
                    gr.addColorStop(1, 'rgba(240,246,255,0)');
                    fillPts(qq, F.pts([[-8, yy - 5], [8, yy - 13], [8, yy + 5], [-8, yy + 13]]), gr);
                }
                const r0 = F([0, 30]), r1 = F([0, 8]), gs = qq.createLinearGradient(r0[0], r0[1], r1[0], r1[1]);
                gs.addColorStop(0, 'rgba(24,28,72,0.7)');
                gs.addColorStop(1, 'rgba(24,28,72,0)');
                fillPts(qq, F.pts(blade), gs);
                S.spray(qq, F.pts(blade), { color: STEEL.deep, alpha: 0.6, w: 3.4 });
                // the fuller, and the ridge that runs on from it to the point
                const full = [[-1.8, 25], [-1.3, -44], [0, -51], [1.3, -44], [1.8, 25]];
                fillPts(qq, F.pts(full), '#44548a');
                S.ink(qq, F.pts([[-1.5, 24], [-1.1, -44]]), { w: 0.8, color: '#1f2756', alpha: 0.9, taper: [0, 0.4] });
                S.ink(qq, F.pts([[1.5, 24], [1.1, -44]]), { w: 0.7, color: '#dfe8f6', alpha: 0.85, taper: [0, 0.4] });
                S.ink(qq, F.pts([[0, -51], [0, -88]]), { w: 0.8, color: '#27306a', alpha: 0.9, taper: [0, 0.7] });
                S.ink(qq, F.pts([[-5.4, 26], [-4.5, -65], [-2.4, -78]]), { w: 0.6, color: '#f6f9ff', alpha: 0.7, taper: [0.2, 0.6] });
            },
        });
        // in front of the blade: the ribbon's two passes and its swallow-tailed ends
        const tail = (pts) => S.piece(q, F.pts(pts), { fill: '#a82a30', line: 1.2, shade: sh(RED, 4), light: li(RED, 2.4, 0.5) });
        tail([[-29.5, -57.5], [-40, -63], [-46.5, -58.5], [-41.5, -55.5], [-45, -50], [-31, -46.5]]);
        tail([[25.5, 11], [36, 14], [43, 10.5], [39.8, 17], [44.5, 22], [27, 22]]);
        ribbon(A, RW, false, { cast: cs });
        ribbon(C, RW, false, { cast: cs });
        // the hilt
        const grip = [[4.7, 41.5], [6, 52], [5.7, 60], [4.5, 66]];
        turned(q, F, grip, { base: '#6e1a2a', deep: '#2a0a1a', light: '#c0504c', glint: '#f2b0a0' }, {
            under: (qq) => {
                for (let yy = 38; yy < 68; yy += 3.3) {
                    S.ink(qq, F.pts([[-7, yy + 1], [7, yy + 3.9]]), { w: 1.2, color: '#2a0a1a', alpha: 0.9, taper: [0, 0] });
                    S.ink(qq, F.pts([[-7, yy], [7, yy + 2.9]]), { w: 0.9, color: GOLD.base, taper: [0, 0] });
                }
            },
        });
        for (const mx of [-1, 1]) {
            S.piece(q, F.pts(S.curve([[mx * 5, 28.4], [mx * 15, 29], [mx * 24.5, 30], [mx * 25, 35], [mx * 15, 35.6], [mx * 5, 37]], true, 4)), {
                fill: GOLD.base, line: 1.3, cast: cs, shade: sh(GOLD, 3.4, 0.9), light: { color: GOLD.glint, alpha: 0.85, w: 2.2 },
                detail: (qq) => {
                    for (const xx of [19.5, 22]) S.ink(qq, F.pts([[mx * xx, 28], [mx * xx, 37]]), { w: 0.7, color: GOLD.deep, alpha: 0.85, taper: [0, 0] });
                },
            });
            bead(q, F([mx * 28.6, 32.5]), 4.5, GOLD, 1);
        }
        S.piece(q, F.pts(S.curve([[0, 22.5], [8.6, 27.6], [9.4, 36.4], [0, 42], [-9.4, 36.4], [-8.6, 27.6]], true, 4)), { fill: GOLD.base, line: 1.3, cast: cs, shade: sh(GOLD, 6, 0.9), light: { color: GOLD.glint, alpha: 0.9, w: 4 } });
        bead(q, F([0, 32.2]), 2.9, { base: '#cf3a3c', deep: '#7a1428', light: '#f39a8c', glint: '#fff0ea' }, 0.7);
        turned(q, F, [[5.4, 40.2], [6, 41.6], [5.4, 43]], GOLD, { line: 1 });
        turned(q, F, [[4.9, 64.6], [5.5, 66], [4.9, 67.4]], GOLD, { line: 1 });
        turned(q, F, [[0, 66.6], [5.2, 68], [7.8, 73.6], [5.6, 79.6], [0, 81.6]], GOLD, { cast: cs });
        bead(q, F([0, 83.6]), 2.3, GOLD, 0.7);
    }

    const SUITS = { oros: { paint: oros, gaps: [] }, copas: { paint: copas, gaps: [0] }, espadas: { paint: espadas, gaps: [-17, 17] } };

    function card(g, F, suit, seed) {
        const W = 150, H = 230, out = F.pts(rrect(W, H, 11));
        const r = Motion.rng('card' + suit + seed), def = SUITS[suit];
        S.piece(g, out, {
            fill: PAPER, line: 2, heavy: 0.9, cast: { blur: 11, dx: 5, dy: 7, color: 'rgba(16,10,34,0.6)' },
            detail: (q) => {
                // old stock: a deeper cream in blotches, a paler one where it was handled less
                for (let i = 0; i < 14; i++) {
                    const c = F([(r() - 0.5) * W, (r() - 0.5) * H]), rad = 16 + r() * 34, warm = r() < 0.68;
                    const gr = q.createRadialGradient(c[0], c[1], 0, c[0], c[1], rad), col = warm ? '190,150,86' : '255,252,236';
                    gr.addColorStop(0, `rgba(${col},${warm ? 0.2 : 0.35})`);
                    gr.addColorStop(1, `rgba(${col},0)`);
                    q.fillStyle = gr;
                    q.fillRect(c[0] - rad, c[1] - rad, rad * 2, rad * 2);
                }
                // the warp: a band of light lies across the card, a soft shade under it
                const p0 = F([-34, -H / 2]), p1 = F([34, H / 2]), wg = q.createLinearGradient(p0[0], p0[1], p1[0], p1[1]);
                for (const [u, c] of [[0, 'rgba(255,253,238,0)'], [0.2, 'rgba(255,253,238,0)'], [0.34, 'rgba(255,253,238,0.62)'], [0.48, 'rgba(255,253,238,0)'], [0.62, 'rgba(120,84,46,0)'], [0.78, 'rgba(120,84,46,0.16)'], [1, 'rgba(120,84,46,0.04)']]) wg.addColorStop(u, c);
                fillPts(q, out, wg);
                // aged edges, the shade side deeper, the lit edge kept clean
                S.spray(q, out, { color: '#a07636', alpha: 0.55, w: 12, push: 0 });
                S.spray(q, out, { color: '#6d4a2e', alpha: 0.42, w: 22, push: 15 });
                S.spray(q, out, { color: '#fffdf0', alpha: 0.55, w: 16, push: 11, dir: TOL });
                for (let i = 0; i < 26; i++) disc(q, F([(r() - 0.5) * W * 0.96, (r() - 0.5) * H * 0.96]), 0.35 + r() * 0.8, `rgba(128,86,42,${(0.12 + r() * 0.22).toFixed(3)})`);
                // the frame line, with the breaks that name the suit
                const fr = walk([...rrect(W - 19, H - 19, 5, 4), [W / 2 - 9.5 - 5, -H / 2 + 9.5]], 1);
                q.lineWidth = 1.25;
                q.strokeStyle = 'rgba(50,44,92,0.92)';
                q.lineCap = 'round';
                q.lineJoin = 'round';
                q.beginPath();
                let pen = false;
                for (const { p } of fr) {
                    const gap = Math.abs(p[1]) > H / 2 - 12 && def.gaps.some((gx) => Math.abs(p[0] - gx) < 5.6);
                    const w = F(p);
                    if (gap) pen = false;
                    else if (!pen) {
                        q.moveTo(w[0], w[1]);
                        pen = true;
                    } else q.lineTo(w[0], w[1]);
                }
                q.stroke();
                // the index, in the four corners
                for (const Fi of [F.sub(-61.5, -86), F.sub(48, -86), F.sub(61.5, 86, Math.PI), F.sub(-48, 86, Math.PI)]) fillPts(q, Fi.pts(ONE.map(([px, py]) => [px * 15.5, py * 15.5])), '#2b2852');
                def.paint(q, F);
                // the gloss of the printed face, over everything
                const sg = q.createLinearGradient(p0[0], p0[1], p1[0], p1[1]);
                for (const [u, c] of [[0.22, 'rgba(255,255,244,0)'], [0.34, 'rgba(255,255,244,0.2)'], [0.46, 'rgba(255,255,244,0)']]) sg.addColorStop(u, c);
                fillPts(q, out, sg);
            },
        });
    }

    function cards(g, o = {}) {
        const { x = 0, y = 0, s = 1, rot = 0, seed = 'baraja' } = o;
        g.save();
        g.translate(x, y);
        g.scale(s, s);
        // the front card upright-ish, the other two behind it, turned -18° and +16°
        const F = frame(0, 0, rot).sub(3.5, -9);
        card(g, F.sub(-116, 6, -0.314), 'copas', seed);
        card(g, F.sub(112, 13, 0.279), 'espadas', seed);
        card(g, F.sub(0, 0, 0.035), 'oros', seed);
        g.restore();
    }

    // ------------------------------------------------------------------ pomegranate
    const SKIN = [[0, '#280a1c'], [0.2, '#431022'], [0.38, '#6a1929'], [0.54, '#93272d'], [0.68, '#b8352f'], [0.8, '#cc5532'], [0.91, '#dc7c3c'], [1, '#e9a556']];
    const PR = 90, PCA = -Math.PI / 2 + 0.2; // the fruit's radius; the way its crown points
    const wrap = (a) => Math.atan2(Math.sin(a), Math.cos(a));
    const ARIL_INK = '#34081e';

    // The outline: a slightly angular sphere, drawn up into the neck of the crown.
    const pomOutline = (seed) => memo('pomo/' + seed, () => {
        const sd = S.seedOf('pom' + seed), pts = [];
        for (let i = 0; i < 300; i++) {
            const th = (i / 300) * TAU, d = Math.abs(wrap(th - PCA)), e = Math.abs(wrap(th - PCA - Math.PI));
            let r = PR * (1 + 0.014 * Math.cos(5 * th + 0.7) + 0.012 * Math.cos(3 * th - 1.2) + 0.005 * S.noise2(i * 0.14, 2, sd));
            // the calyx tube stands up out of a low shoulder
            r += 19 * (1 - S.smooth(0.18, 0.25, d)) + 4.5 * (1 - S.smooth(0.2, 0.5, d)) - 2.2 * (1 - S.smooth(0, 0.24, e));
            pts.push([Math.cos(th) * r * 1.02, Math.sin(th) * r * 0.975]);
        }
        return pts;
    });

    function pomSkin(rot, res, seed) {
        const a = snap(rot);
        return memo(`pom/${a.toFixed(3)}@${res}/${seed}`, () => {
            const out = pomOutline(seed), L = S.lightFor(a), ax = [Math.cos(PCA), Math.sin(PCA)];
            const ll = Math.hypot(L[0], L[1]) || 1, bc = [(L[0] / ll) * 40, (L[1] / ll) * 38];
            const r = Motion.rng('pomskin' + seed);
            return S.form({
                box: S.bbox(out, 3), res, seed: 'pom' + seed, light: L, relief: 1,
                mask: (q) => {
                    q.beginPath();
                    S.trace(q, out);
                    q.fill();
                },
                // soft facets: the chambers show as lobes running from the crown to the stalk
                height: (x, y) => {
                    const v = x * ax[0] + y * ax[1], u = -x * ax[1] + y * ax[0];
                    const rr = Math.min(0.998, (u * u + v * v) / (PR * PR)), z = Math.sqrt(1 - rr), lon = Math.atan2(u / PR, z);
                    return 3.4 * Math.cos(lon * 6 + 0.9) * z * (1 - 0.7 * (v / PR) * (v / PR)) + 1.0 * S.noise2(x * 0.03, y * 0.03, 5) + 0.05 * S.noise2(x * 0.9, y * 0.9, 11);
                },
                ramp: SKIN, soft: 1,
                stroke: { amp: 0.035, freq: 0.05, tone: 6 },
                mottle: { amp: 0.045, freq: 0.022 },
                spec: { amp: 0.4, power: 10, from: 0.5, to: 1, ragged: 0.18, color: '#fff0d2' },
                tint: (x, y, tone, rgb, m) => {
                    // the yellow blush, on the cheek turned to the lamp
                    const kb = S.smooth(1.15, 0.1, Math.hypot(x - bc[0], y - bc[1]) / 62 + 0.22 * S.noise2(x * 0.025, y * 0.025, 21)) * 0.58, bt = S.clamp(0.22 + tone * 0.9);
                    rgb[0] += (236 * bt - rgb[0]) * kb;
                    rgb[1] += (180 * bt - rgb[1]) * kb;
                    rgb[2] += (76 * bt - rgb[2]) * kb;
                    // leather: freckles and pale flecks
                    const f = S.noise2(x * 1.5, y * 1.5, 33), p = S.noise2(x * 0.9 + 40, y * 0.9, 34);
                    const kd = S.smooth(0.5, 0.8, f) * 0.14, kl = S.smooth(0.55, 0.85, p) * 0.12;
                    rgb[0] += (255 - rgb[0]) * kl - rgb[0] * kd;
                    rgb[1] += (226 - rgb[1]) * kl - rgb[1] * kd;
                    rgb[2] += (170 - rgb[2]) * kl - rgb[2] * kd;
                    // the night in the very rim of the shadow side
                    const k = S.smooth(0.3, 0.06, tone) * S.smooth(0.1, 0.01, m) * 0.42;
                    rgb[0] += (78 - rgb[0]) * k;
                    rgb[1] += (66 - rgb[1]) * k;
                    rgb[2] += (128 - rgb[2]) * k;
                },
                over: (q) => {
                    for (let i = 0; i < 150; i++) {
                        const an = r() * TAU, rd = Math.sqrt(r()) * PR * 0.96, pale = r() < 0.6;
                        q.fillStyle = pale ? `rgba(248,214,150,${(0.14 + r() * 0.22).toFixed(3)})` : `rgba(64,12,26,${(0.14 + r() * 0.2).toFixed(3)})`;
                        q.beginPath();
                        q.arc(Math.cos(an) * rd, Math.sin(an) * rd, 0.35 + r() * 0.7, 0, TAU);
                        q.fill();
                    }
                },
            });
        });
    }

    // One aril: a translucent ruby drop. The light goes through it, so its far side glows,
    // and the lamp leaves one sharp point on the near side.
    const arilShape = (r, sd, loose) => {
        const h = (k) => S.hashI(k, 7, 3, sd);
        if (loose) {
            // a drop: round at its free end, drawn out to the pale point it was held by
            const base = [[1.16, 0], [0.86, 0.6], [0.12, 0.8], [-0.72, 0.5], [-1.3, 0.13], [-1.3, -0.13], [-0.72, -0.5], [0.12, -0.8], [0.86, -0.6]];
            return S.curve(base.map(([x, y], i) => [x * r * (1 + (h(i + 5) - 0.5) * 0.12), y * r * (1 + (h(i + 25) - 0.5) * 0.14)]), true, 5);
        }
        // packed in the fruit they press each other into soft corners
        const n = 5 + Math.floor(h(1) * 2), ph = h(2) * TAU, pts = [];
        for (let i = 0; i < n; i++) {
            const a = ph + (i / n) * TAU + (h(i + 10) - 0.5) * 0.4, rr = r * (0.86 + h(i + 30) * 0.26);
            pts.push([Math.cos(a) * rr, Math.sin(a) * rr * 0.94]);
        }
        return S.curve(pts, true, 4);
    };
    function drop(g, F, r, seed, loose = false) {
        const sd = S.seedOf('aril' + seed), pts = F.pts(arilShape(r, sd, loose)), c = F([0, 0]), R = r * F.s;
        g.save();
        g.translate(SD[0] * 0.55 * F.s, SD[1] * 0.55 * F.s);
        fillPts(g, pts, ARIL_INK);
        g.restore();
        strokePts(g, pts, 1.5 * F.s, ARIL_INK, true);
        const gr = g.createRadialGradient(c[0] + SD[0] * R * 0.34, c[1] + SD[1] * R * 0.34, R * 0.05, c[0], c[1], R * 1.2);
        const v = S.hashI(9, 7, 3, sd), tint = (c) => (v < 0.5 ? S.mix(c, '#4a0418', (0.5 - v) * 0.5) : S.mix(c, '#e8506a', (v - 0.5) * 0.36));
        gr.addColorStop(0, tint('#e4495d'));
        gr.addColorStop(0.4, tint('#b01030'));
        gr.addColorStop(1, tint('#52061e'));
        g.save();
        g.beginPath();
        S.trace(g, pts);
        g.fillStyle = gr;
        g.fill();
        g.clip();
        const a0 = Math.atan2(SD[1], SD[0]);
        g.lineCap = 'round';
        g.strokeStyle = 'rgba(240,138,154,0.82)';
        g.lineWidth = R * 0.26;
        g.beginPath();
        g.arc(c[0], c[1], R * 0.64, a0 - 0.85, a0 + 0.85);
        g.stroke();
        // the seed, seen through the flesh
        const so = F.dir([loose ? r * 0.12 : 0, 0]);
        g.fillStyle = 'rgba(255,216,200,0.24)';
        g.beginPath();
        g.ellipse(c[0] + so[0], c[1] + so[1], R * 0.46, R * 0.3, F.rot + (loose ? 0 : S.hashI(4, 7, 3, sd) * 3), 0, TAU);
        g.fill();
        if (loose) {
            // the pale end it was held by
            const tip = F([-r * 1.3, 0]);
            const tg = g.createRadialGradient(tip[0], tip[1], 0, tip[0], tip[1], R * 0.75);
            tg.addColorStop(0, 'rgba(252,232,200,0.95)');
            tg.addColorStop(0.45, 'rgba(250,200,180,0.5)');
            tg.addColorStop(1, 'rgba(250,200,180,0)');
            g.fillStyle = tg;
            g.fillRect(tip[0] - R, tip[1] - R, R * 2, R * 2);
        }
        g.restore();
        disc(g, [c[0] + TOL[0] * R * 0.42, c[1] + TOL[1] * R * 0.42], R * 0.16, 'rgba(255,249,242,0.97)');
        disc(g, [c[0] + TOL[0] * R * 0.12 - TOL[1] * R * 0.36, c[1] + TOL[1] * R * 0.12 + TOL[0] * R * 0.36], R * 0.07, 'rgba(255,236,232,0.75)');
    }

    function aril(g, o = {}) {
        const { x = 0, y = 0, s = 1, rot = 0, seed = 0 } = o;
        g.save();
        g.translate(x, y);
        g.scale(s, s);
        const F = frame(0, 0, rot);
        S.cast(g, (q) => fillPts(q, F.pts(arilShape(6, S.seedOf('aril' + seed), true)), '#000'), { blur: 2.5, dx: 1.6, dy: 2.2, color: 'rgba(12,6,24,0.6)' });
        drop(g, F, 6, seed, true);
        g.restore();
    }

    // The split in the skin, in its own coordinates (long axis along y): the torn outline,
    // the chamber inside the pith, the membranes, and the arils packed between them.
    const pomCut = (seed) => memo('pomcut/' + seed, () => {
        const sd = S.seedOf('cut' + seed), a = 61, b = 39, N = 52, right = [], left = [];
        const prof = (v) => b * Math.pow(Math.max(0, 1 - v * v), 0.86) * (1 + 0.12 * Math.sin(v * 3.1 + 0.8));
        // torn, not cut: the edge wanders and nicks
        const tear = (i, k) => (1.7 * S.noise2(i * 0.55, k, sd) + 1.3 * S.noise2(i * 1.7, k + 4, sd)) * (1 - Math.pow(Math.abs(-1 + (2 * i) / N), 4));
        for (let i = 0; i <= N; i++) {
            const v = -1 + (2 * i) / N;
            right.push([prof(v) + tear(i, 3), v * a]);
            left.push([-prof(v) * 0.92 + tear(i, 9), v * a]);
        }
        const outline = [...right, ...left.reverse().slice(1, -1)];
        // the pith's width wavers like a torn edge
        const inner = outline.map(([px, py], i) => {
            const cy = py * 0.74, l = Math.hypot(px, py - cy) || 1, t = 5 + 1.2 * S.noise2(i * 0.4, 5, sd);
            return [px - (px / l) * t, py - ((py - cy) / l) * t];
        });
        const membranes = [
            S.curve([[0.5, -a + 1], [-4, -27], [3, -2], [-2.5, 23], [0.5, a - 1]], false, 8),
            S.curve([[-3.5, -21], [-15, -15], [-30, -13.5], [-40, -13]], false, 6),
            S.curve([[2.5, 3], [15, 9], [32, 9.5], [42, 9]], false, 6),
            S.curve([[-2, 25], [-12, 30.5], [-22, 33], [-30, 34]], false, 6),
        ];
        const r = Motion.rng('arils' + seed), arils = [], d = 8.5;
        for (let j = 0, yy = -a; yy <= a; yy += d * 0.866, j++) {
            for (let xx = -b - 4 + (j % 2 ? d / 2 : 0); xx <= b + 4; xx += d) {
                const p = [xx + (r() - 0.5) * 2.8, yy + (r() - 0.5) * 2.8], rad = 3.8 + r() * 1.8, rot = r() * TAU;
                if (!inside(p, inner) || distLine(p, inner, true) < 2.2) continue;
                if (membranes.some((mb) => distLine(p, mb) < 2.6)) continue;
                arils.push({ p, r: rad, rot, id: arils.length });
            }
        }
        const cracks = [
            [[0.5, -a + 3], [-1.8, -a - 4], [1.4, -a - 9], [-0.6, -a - 15], [1.8, -a - 19], [0.6, -a - 25]],
            [[-0.6, -a - 15], [-4, -a - 19], [-4.6, -a - 23]],
        ];
        return { outline, inner, membranes, arils, cracks };
    });

    // a small glossy leaf along +x from its stalk
    function leaf(g, Fl, L, W, o = {}) {
        const bend = o.bend ?? 0.07, B = (x) => bend * L * 4 * (x / L) * (1 - x / L), up = [], dn = [], mid = [];
        for (let i = 0; i <= 18; i++) {
            const u = i / 18, x = u * L, w = W * 0.5 * Math.pow(Math.sin(Math.PI * Math.pow(u, 0.82)), 0.8);
            up.push([x, B(x) - w]);
            dn.push([x, B(x) + w]);
            mid.push([x, B(x)]);
        }
        const C = { base: '#2f8048', deep: '#0b3a2f', light: '#a3d982', glint: '#ecf9d2' };
        const pts = Fl.pts([...up, ...dn.slice(1, -1).reverse()]);
        const lit = dot2(Fl.dir([0, -1]), TOL) >= 0 ? up : dn, sgn = lit === up ? -1 : 1;
        S.piece(g, pts, {
            fill: C.base, line: 2.1, cast: o.cast, shade: { color: C.deep, alpha: 0.9, w: W * 0.6 }, light: { color: C.light, alpha: 0.5, w: W * 0.4 },
            detail: (q) => {
                // the half that faces the lamp, then the veins, the midrib and the gloss
                fillPts(q, Fl.pts([...lit, ...mid.slice().reverse()]), S.rgba(C.light, 0.3));
                for (let k = 1; k <= 7; k++) {
                    const u = 0.06 + k * 0.115, x = u * L;
                    for (const sg of [-1, 1]) S.ink(q, Fl.pts([[x, B(x)], [x + L * 0.07, B(x) + sg * W * 0.2], [x + L * 0.16, B(x + L * 0.16) + sg * W * 0.46]]), { w: 0.7, color: C.deep, alpha: 0.5, taper: [0, 0.8] });
                }
                S.ink(q, Fl.pts(mid.map(([x, y]) => [x, y + 0.8])), { w: 1.9, color: C.deep, alpha: 0.9, taper: [0, 0.9] });
                S.ink(q, Fl.pts(mid), { w: 1.1, color: '#cfe9a2', taper: [0, 0.9] });
                const gl = lit.slice(4, 14).map(([x, y]) => [x, B(x) + (y - B(x)) * 0.52]);
                q.save();
                q.filter = `blur(${(0.9 * S.pxScale(q)).toFixed(1)}px)`;
                S.ink(q, Fl.pts(gl), { w: W * 0.26, color: C.glint, alpha: 0.5 });
                q.restore();
                S.ink(q, Fl.pts(gl.slice(1, -1).map(([x, y]) => [x, y + sgn * W * 0.02])), { w: W * 0.085, color: '#f6fde4', alpha: 0.9 });
            },
        });
    }

    function pomegranate(g, o = {}) {
        const { x = 0, y = 0, s = 1, rot = 0, seed = 'granada' } = o;
        g.save();
        g.translate(x, y);
        g.scale(s, s);
        const res = resOf(g), F = frame(0, 0, rot).sub(-2, 10.5), out = pomOutline(seed);
        const drop0 = { blur: 9, dx: 4.5, dy: 6, color: 'rgba(12,7,26,0.6)' };

        // the twig, cut short, and its two leaves: under the fruit
        const st = PCA + Math.PI, node = pol(PR + 3, st + 0.02);
        const twig = S.curve([pol(PR - 12, st), pol(PR + 8, st + 0.02), pol(PR + 22, st + 0.1), pol(PR + 32, st + 0.24)], false, 8);
        leaf(g, F.sub(node[0] - 1, node[1], 2.74), 66, 21.5, { bend: -0.12, cast: drop0 });
        leaf(g, F.sub(node[0] + 2, node[1] + 1, 0.08), 52, 18, { bend: 0.13, cast: drop0 });
        const tw = F.pts(band(twig, 9, 6.6));
        S.piece(g, tw, {
            fill: '#7a5230', line: 2, cast: { blur: 3, dx: 1.5, dy: 2.5, color: 'rgba(10,6,20,0.6)' }, shade: { color: '#2e1a16', alpha: 0.9, w: 4.6 }, light: { color: '#d2a868', alpha: 0.75, w: 2.8 },
            detail: (q) => {
                const r = Motion.rng('twig' + seed), w = walk(twig, 1);
                for (let i = 0; i < 16; i++) {
                    const k = 4 + Math.floor(r() * (w.length - 12)), off = (r() - 0.5) * 5.6;
                    S.ink(q, F.pts([0, 2, 4, 6].map((j) => [w[k + j].p[0] + w[k + j].n[0] * off, w[k + j].p[1] + w[k + j].n[1] * off])), { w: 0.7, color: r() < 0.6 ? '#2e1a16' : '#d9b77a', alpha: 0.6 });
                }
            },
        });
        const end = twig[twig.length - 1], ea = Math.atan2(end[1] - twig[twig.length - 3][1], end[0] - twig[twig.length - 3][0]);
        S.piece(g, F.pts(S.ellipse(end[0], end[1], 2.2, 3.5, 16, ea)), { fill: '#d9b77a', line: 1.3, shade: { color: '#8a5a2a', alpha: 0.8, w: 1.8 } });

        // the fruit: its skin is a lit sphere painted per pixel, pasted inside its contour
        const sp = pomSkin(rot, res, seed), at = F([0, 0]);
        S.piece(g, F.pts(out), { fill: '#b8352f', line: 2.7, heavy: 0.9, cast: drop0, detail: (q) => S.put(q, sp, { x: at[0], y: at[1], rot }) });

        // the crown: six woody teeth round the mouth of the calyx tube; the far three show
        // their pale inner faces, dried stamens stand in the mouth, the near three close it
        const pc = pol(PR + 22, PCA), Fc = F.sub(pc[0] * 1.02, pc[1] * 0.975, PCA + Math.PI / 2, 1.13);
        // a tooth: from the two ends of its root on the rim up to its tip, its outer side
        // bowed out, then back along the root
        const tooth = (bo, bi, tip, root, bow = 2.2) => {
            const cx = (bo[0] + bi[0] + tip[0]) / 3, cy = (bo[1] + bi[1] + tip[1]) / 3;
            const out = (p0, p1, k) => {
                const m = lerpP(p0, p1, 0.5), dx = m[0] - cx, dy = m[1] - cy, l = Math.hypot(dx, dy) || 1;
                return [m[0] + (dx / l) * k, m[1] + (dy / l) * k];
            };
            const left = S.curve([bo, out(bo, tip, bow), tip], false, 6), right = S.curve([tip, out(tip, bi, bow * 0.5), bi], false, 6);
            return { pts: [...left, ...right.slice(1), ...root], tip, base: lerpP(bo, bi, 0.5), left, root: root.length };
        };
        const far = [
            tooth([-20, -0.3], [-9, -5], [-24.5, -23], []),
            tooth([20, -0.3], [9, -5], [26, -22], []),
            tooth([-9.5, -5], [9.5, -5], [1.5, -28], [], 1.6),
        ];
        const near = [
            tooth([-20.4, 0.6], [-8, 5.4], [-29, -17.5], [[-11, 8], [-17, 6.4]]),
            tooth([20.4, 0.6], [8, 5.4], [30, -16.5], [[11, 8], [17, 6.4]]),
            tooth([-8.4, 5.2], [8.4, 5.2], [-1, -19.5], [[5, 8.6], [0, 9.4], [-5, 8.6]], 1.8),
        ];
        for (const t of far) {
            S.piece(g, Fc.pts(t.pts), {
                fill: { from: Fc(t.base), to: Fc(t.tip), stops: [[0, '#6a2414'], [0.4, '#c47a38'], [1, '#e3b45c']] }, line: 1.9,
                shade: { color: '#6a2a16', alpha: 0.8, w: 7 }, light: { color: '#fbe7a6', alpha: 0.6, w: 4.6 },
                detail: (q) => S.ink(q, Fc.pts([lerpP(t.base, t.tip, 0.15), lerpP(t.base, t.tip, 0.9)]), { w: 1, color: '#7a3a1a', alpha: 0.7, taper: [0.2, 0.9] }),
            });
        }
        S.piece(g, Fc.pts(S.ellipse(0, 0.4, 19, 5.3, 32)), { fill: '#1f0812', line: 0 });
        {
            const r = Motion.rng('stamens' + seed);
            for (let i = 0; i < 15; i++) {
                const u = (i + r() * 0.8) / 15, x0 = -13 + u * 26, len = 9 + r() * 8;
                const tip = [x0 * 1.3 + (r() - 0.5) * 3, -len];
                S.ink(g, Fc.pts(S.curve([[x0, 1], [x0 * 1.12, -len * 0.5], tip], false, 5)), { w: 1, color: r() < 0.5 ? '#e8c878' : '#c99a4c', alpha: 0.95, taper: [0.1, 0.5] });
                disc(g, Fc(tip), 1.15, '#8a5220');
                disc(g, Fc([tip[0] - 0.3, tip[1] - 0.3]), 0.55, '#e3b04a');
            }
        }
        for (const t of near) {
            // rooted in the tube: no line where it leaves the wall, and its paint fades into the skin's
            const pts = Fc.pts(t.pts), free = Fc.pts([...t.left, ...t.pts.slice(t.left.length, t.pts.length - t.root)]);
            S.cast(g, (q) => fillPts(q, pts, '#000'), { blur: 2.6, dx: 1.4, dy: 2.2, color: 'rgba(30,6,16,0.6)' });
            g.save();
            g.translate(SD[0] * 1.3, SD[1] * 1.3);
            strokePts(g, free, 1.9, INK);
            g.restore();
            faded(g, S.bbox(pts, 3), Fc(lerpP(t.base, t.tip, -0.2)), Fc(lerpP(t.base, t.tip, 0.14)), (q) => S.piece(q, pts, {
                fill: { from: Fc(t.base), to: Fc(t.tip), stops: [[0, '#b63c2e'], [0.55, '#c4552e'], [1, '#b47a36']] }, line: 0,
                shade: { color: '#5e1626', alpha: 0.85, w: 6 }, light: { color: '#f2b46a', alpha: 0.7, w: 4.4 },
                detail: (qq) => {
                    S.ink(qq, Fc.pts([lerpP(t.base, t.tip, 0.12), lerpP(t.base, t.tip, 0.86)]), { w: 1.1, color: '#5e1626', alpha: 0.6, taper: [0.2, 0.9] });
                    const pa = Fc(lerpP(t.base, t.tip, 0.68)), pb = Fc(t.tip), gr = qq.createLinearGradient(pa[0], pa[1], pb[0], pb[1]);
                    gr.addColorStop(0, 'rgba(70,40,16,0)');
                    gr.addColorStop(1, 'rgba(70,40,16,0.6)');
                    qq.fillStyle = gr;
                    qq.fill();
                    // the thick edge of the tooth, caught by the lamp
                    S.ink(qq, Fc.pts(t.left.map(([px, py]) => [px + 1.5, py + 0.6])), { w: 1.2, color: '#ffd9a0', alpha: 0.7, taper: [0.6, 0.6] });
                },
            }));
            strokePts(g, free, 1.9, INK);
        }

        // the split: cracks running on from its ends, pith round the wound, the chamber dark
        // behind the seeds
        const cut = pomCut(seed), Ft = F.sub(9, 15, 0.26);
        const edge = Ft.pts(cut.outline), inner = Ft.pts(cut.inner);
        for (const ck of cut.cracks) {
            S.ink(g, Ft.pts(ck).map(([px, py]) => [px + SD[0] * 1, py + SD[1] * 1]), { w: 1.2, color: '#f2b47a', alpha: 0.55, taper: [0, 1] });
            S.ink(g, Ft.pts(ck), { w: 1.9, color: '#2a0816', taper: [0, 1] });
        }
        S.piece(g, edge, {
            fill: '#f0d9a0', line: 2.3, heavy: 0.5,
            // the wall on the lamp's side is in its own shade; the far wall takes the light
            shade: [{ color: '#a8742f', alpha: 0.8, w: 7, dir: TOL }, { color: '#c98f45', alpha: 0.35, w: 3, push: 0 }],
            light: { color: '#fff6d8', alpha: 0.8, w: 5, dir: SD },
        });
        S.piece(g, inner, {
            fill: '#3a0a1c', line: 1.1, ink: '#6a3a1c', heavy: 0,
            detail: (q) => {
                for (const mb of cut.membranes) {
                    const w = Ft.pts(mb);
                    S.ink(q, w.map(([px, py]) => [px + SD[0] * 0.9, py + SD[1] * 0.9]), { w: 4.8, color: '#8a5a22', taper: [0, 0] });
                    S.ink(q, w, { w: 3.6, color: '#f0d9a0', taper: [0, 0] });
                    S.ink(q, w.map(([px, py]) => [px + TOL[0] * 0.6, py + TOL[1] * 0.6]), { w: 1.1, color: '#fff6dc', alpha: 0.8, taper: [0.4, 0.4] });
                }
                const list = cut.arils.map((ar) => ({ ...ar, w: Ft(ar.p) })).sort((p1, p2) => dot2(p2.w, SD) - dot2(p1.w, SD));
                for (const ar of list) {
                    disc(q, [ar.w[0] + SD[0] * 1.5, ar.w[1] + SD[1] * 1.5], ar.r * 1.04, 'rgba(34,4,18,0.5)');
                    drop(q, frame(ar.w[0], ar.w[1], ar.rot + rot), ar.r, seed + ar.id);
                }
                // the skin's lip throws its shade in on the lamp's side
                S.spray(q, inner, { color: '#22040f', alpha: 0.72, w: 13, push: 9, dir: TOL });
                S.spray(q, inner, { color: '#22040f', alpha: 0.3, w: 5, push: 0 });
            },
        });
        g.restore();
    }

    return { castanets, cards, pomegranate, aril, rope, tassel, bead };
})();
