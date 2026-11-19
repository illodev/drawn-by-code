// The plants of the emblem, in the emblem manner (dark contour + airbrush): an olive
// branch built the way a shoot grows, carnations, a bud, a bunch of them. Global: Garland.
//
//   Garland.olive(g, { path, seed, s = 1, olives = true, flip = false, shoots = 2 })
//       A wreath arm along `path` (a list of points, base first, 500–700 units at s = 1):
//       a woody stem, leaves in opposite pairs, olives on stalks from the axils. `s` scales
//       the leaves, the stem and the fruit, not the path. For the mirror arm pass the
//       mirrored path and `flip: true`: the same branch, mirrored, the light still at the
//       top left.
//   Garland.carnation(g, { x, y, r = 70, rot = 0, seed, color = 'red' | 'white',
//                          stem = 2.5, to = null, leaves = 1 })
//       (x, y) is the centre of the head, r its half-width. At rot = 0 the head faces up
//       and the stem trails down, `stem` × r long below the calyx (0: no stem), or through
//       the points of `to` (caller's units) to end at the last one.
//   Garland.bud(g, { x, y, s = 1, rot = 0, seed, stem = 75, to = null, leaves = 1 })
//       (x, y) is the middle of the calyx; 26 × 86 units at s = 1 without its stem.
//   Garland.spray(g, { x, y, s = 1, rot = 0, seed, flip = false, tie = true })
//       Three carnations, a bud and their leaves, about 260 across and 330 tall at s = 1;
//       (x, y) is the middle of the heads, the stems gather 150 below it.
const Garland = (() => {
    const S = Souvenir;
    const TAU = Math.PI * 2, DEG = Math.PI / 180;
    const TO_LIGHT = [-S.SHADE_DIR[0], -S.SHADE_DIR[1]];
    const LN = (() => {
        const l = Math.hypot(S.LIGHT[0], S.LIGHT[1], S.LIGHT[2]);
        return [S.LIGHT[0] / l, S.LIGHT[1] / l, S.LIGHT[2] / l];
    })();

    // ------------------------------------------------------------------ geometry
    const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
    const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
    const unit = (v) => {
        const l = Math.hypot(v[0], v[1]) || 1;
        return [v[0] / l, v[1] / l];
    };
    const dot = (a, b) => a[0] * b[0] + a[1] * b[1];
    const dir = (a) => [Math.cos(a), Math.sin(a)];
    const trace = (q, pts) => {
        q.beginPath();
        S.trace(q, pts);
    };
    // The points of a polyline at equal steps along it.
    function walk(pts, step) {
        const out = [pts[0]];
        let need = step;
        for (let i = 1; i < pts.length; i++) {
            let a = pts[i - 1];
            const b = pts[i];
            let d = dist(a, b);
            while (d >= need && d > 0) {
                const k = need / d;
                a = [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
                out.push(a);
                d -= need;
                need = step;
            }
            need -= d;
        }
        return out;
    }
    // A band about a centre line: hw(u, i) → half width, or [left, right].
    function ribbon(mid, hw) {
        const n = mid.length, L = [], R = [];
        for (let i = 0; i < n; i++) {
            const p = mid[Math.max(0, i - 1)], q = mid[Math.min(n - 1, i + 1)];
            const t = unit(sub(q, p)), w = hw(i / (n - 1), i);
            const wl = Array.isArray(w) ? w[0] : w, wr = Array.isArray(w) ? w[1] : w;
            L.push([mid[i][0] + t[1] * wl, mid[i][1] - t[0] * wl]);
            R.push([mid[i][0] - t[1] * wr, mid[i][1] + t[0] * wr]);
        }
        return { mid, L, R, poly: [...L, ...R.slice().reverse()] };
    }
    // A line cut with pinking shears: n teeth, d deep, on its left.
    function pinked(line, n, d) {
        let len = 0;
        for (let i = 1; i < line.length; i++) len += dist(line[i - 1], line[i]);
        const pts = walk(line, len / (n * 2) - 1e-6).slice(0, n * 2);
        pts.push(line[line.length - 1]);
        return pts.map((p, i) => {
            if (i % 2 === 0) return p;
            const t = unit(sub(pts[i + 1], pts[i - 1]));
            return [p[0] + t[1] * d, p[1] - t[0] * d];
        });
    }
    // Two open curves that meet in a point: a bract, a tooth (the tip stays sharp).
    const pointed = (left, tip, right) => [...S.curve([...left, tip], false, 6), ...S.curve([tip, ...right], false, 6).slice(1)];

    // ------------------------------------------------------------------ airbrush
    // A soft patch of colour on the paint already there (inside the current clip).
    const blob = (g, pts, color, alpha, blur) => S.cast(g, (q) => {
        trace(q, pts);
        q.fillStyle = '#000';
        q.fill();
    }, { blur, dx: 0, dy: 0, color: S.rgba(color, alpha) });
    // The kit's spray, kept inside a part of a piece (one half of a leaf).
    const sprayIn = (g, pts, o) => {
        g.save();
        trace(g, pts);
        g.clip();
        S.spray(g, pts, o);
        g.restore();
    };

    // ------------------------------------------------------------------ a blade
    // One leaf blade (or the stretch of one between two points of its midrib): contour,
    // shade from the shadow side and from its base, the fold along the midrib (one half
    // takes the light, the other loses it), the midrib itself.
    //   lf: { mid, L, R, s }   pal: { fill, deep, light, rib, ribLight, ribW, trough }
    function blade(g, lf, pal, o = {}) {
        const i0 = o.i0 ?? 0, i1 = o.i1 ?? lf.mid.length - 1;
        const mid = lf.mid.slice(i0, i1 + 1), L = lf.L.slice(i0, i1 + 1), R = lf.R.slice(i0, i1 + 1);
        const n = mid.length - 1, s = lf.s ?? 1;
        const poly = [...L, ...R.slice().reverse()];
        const len = dist(mid[0], mid[n]) || 1, ax = unit(sub(mid[n], mid[0]));
        let m = 0, wid = 0;
        for (let i = 0; i <= n; i++) {
            const w = dist(L[i], R[i]);
            if (w > wid) {
                wid = w;
                m = i;
            }
        }
        const nl = unit(sub(L[m], R[m]));
        // a keeled leaf lights the half that faces the lamp; seen from below it is a trough
        // and the far half takes it
        let litL = dot(nl, TO_LIGHT) > 0;
        if (pal.trough) litL = !litL;
        const k0 = Math.min(n - 1, Math.round(n * 0.14));
        const back = mid.slice(k0).reverse();
        const lit = [...(litL ? L : R).slice(k0), ...back], dark = [...(litL ? R : L).slice(k0), ...back];
        const nLit = litL ? nl : [-nl[0], -nl[1]];
        const facing = 0.35 + 0.65 * Math.abs(dot(nl, TO_LIGHT));
        const lw = o.line ?? S.clamp(1.9 * s, 1.1, 2.6);
        S.piece(g, poly, {
            fill: o.fill ?? pal.fill, line: lw, heavy: 0.6, ink: pal.ink ?? S.INK,
            cast: o.cast === false ? undefined : { blur: 4.5 * s, dx: 2.2 * s, dy: 3 * s, color: 'rgba(12,16,34,0.5)', ...(o.cast ?? {}) },
            shade: [
                { color: pal.deep, alpha: 0.5, w: wid * 0.3 },
                { color: pal.deep, alpha: o.baseShade ?? 0.85, w: len * 0.15, push: len * 0.17, dir: [-ax[0], -ax[1]] },
            ],
            light: [{ color: pal.light, alpha: 0.3, w: wid * 0.16, push: wid * 0.06 }],
            detail: (q) => {
                // the half that loses the light: darkest against the midrib; the half that
                // takes it: a light laid along the midrib, and a cleaner one in its middle
                sprayIn(q, dark, { color: pal.deep, alpha: 0.75 * facing, w: wid * 0.3, push: wid * 0.22, dir: nLit });
                sprayIn(q, lit, { color: pal.light, alpha: 0.95 * facing, w: wid * 0.3, push: wid * 0.26, dir: [-nLit[0], -nLit[1]] });
                if (pal.glint) {
                    const E = litL ? L : R, a0 = Math.round(n * 0.34), a1 = Math.round(n * 0.7), band = [];
                    for (let i = a0; i <= a1; i++) band.push([mid[i][0] + (E[i][0] - mid[i][0]) * 0.18, mid[i][1] + (E[i][1] - mid[i][1]) * 0.18]);
                    for (let i = a1; i >= a0; i--) band.push([mid[i][0] + (E[i][0] - mid[i][0]) * 0.62, mid[i][1] + (E[i][1] - mid[i][1]) * 0.62]);
                    if (band.length > 5) blob(q, band, pal.glint, 0.85 * facing, wid * 0.09);
                }
                if (o.over) o.over(q, { mid, L, R, lit: litL ? L : R, nLit, wid, len });
                // the midrib, with a thread of light on the side the lamp is
                const rib = mid.slice(0, n);
                if (pal.ribLight) S.ink(q, rib.map((p) => [p[0] + nLit[0] * 0.75 * s, p[1] + nLit[1] * 0.75 * s]), { w: (pal.ribLightW ?? 0.9) * s, color: pal.ribLight, taper: [0.8, 1], alpha: 0.75 });
                S.ink(q, rib, { w: (pal.ribW ?? 1.1) * s, color: pal.rib, taper: [0.2, 1], alpha: 0.9 });
            },
        });
    }
    const mapGeom = (lf, fn) => ({ ...lf, mid: lf.mid.map(fn), L: lf.L.map(fn), R: lf.R.map(fn) });

    // ================================================================== OLIVE
    const UPPER = { fill: '#5f7a45', deep: '#2a4032', light: '#8fa666', glint: '#bccb8c', rib: '#22331f', ribLight: '#b9c98a', ribW: 1.05 };
    const UNDER = { fill: '#b9c4a0', deep: '#6b7f70', light: '#e3e9d4', glint: '#f4f6ea', rib: '#647763', ribLight: '#f3f5e8', ribW: 0.9, ribLightW: 1.5, trough: true };
    const BARK = { fill: '#7d6e5d', deep: '#3a3044', light: '#bcad90', green: '#74834d' };

    // A lanceolate olive leaf from `base` along `ang`: a short stalk, the blade widest
    // before its middle, a short point.
    function leafGeom(base, ang, len, wid, bend, asym, s, sd) {
        const n = 26, mid = [base.slice()], pet = 0.06;
        let x = base[0], y = base[1];
        for (let i = 1; i <= n; i++) {
            const a = ang + bend * Math.pow((i - 0.5) / n, 1.4);
            x += (Math.cos(a) * len) / n;
            y += (Math.sin(a) * len) / n;
            mid.push([x, y]);
        }
        const rb = ribbon(mid, (v) => {
            if (v >= 1) return 0;
            const q = (v - pet) / (1 - pet);
            let b = q > 0 ? (wid / 2) * Math.pow(Math.max(0, Math.sin(Math.PI * Math.pow(q, 0.86))), 0.8) : 0;
            const stalk = 1.55 * s * (1 - S.smooth(pet * 0.6, pet * 2.6, v));
            const wob = 0.07 * S.noise2(v * 4.2, 1.7, sd);
            return [Math.max(stalk, b * (1 + asym) * (1 + wob)), Math.max(stalk, b * (1 - asym) * (1 - wob))];
        });
        return { mid: rb.mid, L: rb.L, R: rb.R };
    }

    // ------------------------------------------------------------------ the fruit
    const OLIVE = {
        green: {
            ramp: [[0, '#1f2916'], [0.25, '#39481e'], [0.45, '#5a6c28'], [0.62, '#788a33'], [0.76, '#8a9a3c'], [0.9, '#a9b550'], [1, '#cbd27a']],
            sheen: '#f7f6dc', bounce: [112, 128, 84], speck: 'rgba(228,234,170,0.6)',
        },
        turning: {
            ramp: [[0, '#1f2916'], [0.25, '#39481e'], [0.45, '#5a6c28'], [0.62, '#788a33'], [0.76, '#8a9a3c'], [0.9, '#a9b550'], [1, '#cbd27a']],
            ramp2: [[0, '#1a0f24'], [0.25, '#371d3a'], [0.45, '#5a2f52'], [0.62, '#794368'], [0.76, '#8d5477'], [0.9, '#ac7b94'], [1, '#d2abb5']],
            sheen: '#f6ecea', bounce: [116, 104, 132], speck: 'rgba(232,214,196,0.5)',
        },
        black: {
            ramp: [[0, '#0d0a16'], [0.25, '#170f20'], [0.45, '#21152b'], [0.62, '#2a1b33'], [0.76, '#382443'], [0.9, '#553d69'], [1, '#7f6a96']],
            sheen: '#e9e6f6', bounce: [92, 84, 146], speck: 'rgba(160,150,208,0.45)',
        },
    };
    const RIPE = ['green', 'turning', 'black'];
    const OLIVE_A = [11, 11.8, 10.4], OLIVE_B = [8, 7.5, 8.3], OLIVE_NIP = [0.5, 1.5, 0.2];
    // An egg along +x, the stalk at −x: fuller towards the stalk, a small point at the tip.
    function oliveShape(v) {
        const a = OLIVE_A[v], b = OLIVE_B[v], pts = [];
        for (let i = 0; i < 52; i++) {
            const t = (i / 52) * TAU, c = Math.cos(t);
            pts.push([a * c + OLIVE_NIP[v] * S.smooth(0.86, 1, c), b * Math.sin(t) * (1 - 0.11 * c)]);
        }
        return pts;
    }
    const OSTEP = Math.PI / 8;
    const osnap = (rot) => Math.round(rot / OSTEP) * OSTEP;
    const oliveCache = new Map();
    function oliveSprite(ripe, v, rot, res) {
        rot = osnap((((rot % TAU) + TAU) % TAU));
        if (rot >= TAU - 1e-6) rot = 0;
        const key = `${ripe}/${v}/${rot.toFixed(3)}@${res}`;
        if (oliveCache.has(key)) return oliveCache.get(key);
        const K = OLIVE[ripe], pts = oliveShape(v), a = OLIVE_A[v], b = OLIVE_B[v];
        const box = S.bbox(pts, 4), sd = S.seedOf('olive' + ripe + v);
        const L = S.lightFor(rot, [-0.6, -0.66, 0.46]);
        const second = K.ramp2 ? S.rampFn(K.ramp2, 1) : null, tmp = [0, 0, 0];
        const r = Motion.rng('olive-skin' + ripe + v);
        const sp = S.form({
            box, res, seed: sd, light: L,
            mask: (g) => {
                trace(g, pts);
                g.fill();
            },
            ramp: K.ramp, soft: 1,
            mottle: { amp: 0.03, freq: 0.3 },
            tint: (x, y, tone, rgb, m) => {
                if (second) {
                    // a fruit that is turning: violet spreads from the tip through the green
                    const k = S.smooth(-0.3, 0.3, (x / a) * 0.6 + 0.55 * S.noise2(x * 0.2 + 3, y * 0.2, sd) + 0.12);
                    second(S.clamp(tone), tmp);
                    rgb[0] += (tmp[0] - rgb[0]) * k;
                    rgb[1] += (tmp[1] - rgb[1]) * k;
                    rgb[2] += (tmp[2] - rgb[2]) * k;
                }
                // light thrown back into the rim of the shadow
                const q = S.smooth(0.34, 0.1, tone) * S.smooth(0.55, 0.06, m) * 0.6;
                rgb[0] += (K.bounce[0] - rgb[0]) * q;
                rgb[1] += (K.bounce[1] - rgb[1]) * q;
                rgb[2] += (K.bounce[2] - rgb[2]) * q;
            },
            over: (g) => {
                // pale specks in the skin
                g.fillStyle = K.speck;
                for (let i = 0; i < 11; i++) {
                    const t = r() * TAU, d = Math.sqrt(r()) * 0.82;
                    g.beginPath();
                    g.arc(Math.cos(t) * d * a, Math.sin(t) * d * b, 0.3 + r() * 0.3, 0, TAU);
                    g.fill();
                }
                // the pit where the stalk goes in
                g.fillStyle = 'rgba(18,16,34,0.7)';
                g.beginPath();
                g.ellipse(-a + 1.1, 0, 1.3, 2, 0, 0, TAU);
                g.fill();
                // the sheen: a clean small light where the form turns to the lamp
                const hl = Math.hypot(L[0], L[1]) || 1, hx = (L[0] / hl) * a * 0.5, hy = (L[1] / hl) * b * 0.5, ha = Math.atan2(L[1], L[0]) + Math.PI / 2;
                g.fillStyle = S.rgba(K.sheen, 0.35);
                g.beginPath();
                g.ellipse(hx, hy, 3.3, 2, ha, 0, TAU);
                g.fill();
                g.fillStyle = S.rgba(K.sheen, 0.95);
                g.beginPath();
                g.ellipse(hx + (L[0] / hl) * 0.4, hy + (L[1] / hl) * 0.4, 2, 1.05, ha, 0, TAU);
                g.fill();
            },
        });
        // the contour, heavier away from the light
        const g = sp.canvas.getContext('2d');
        g.setTransform(res, 0, 0, res, -box.x * res, -box.y * res);
        g.lineJoin = 'round';
        g.lineWidth = 1.5;
        g.strokeStyle = S.INK;
        trace(g, pts);
        g.stroke();
        g.globalCompositeOperation = 'destination-over';
        const c = Math.cos(-rot), sn = Math.sin(-rot);
        g.translate((S.SHADE_DIR[0] * c - S.SHADE_DIR[1] * sn) * 1.05, (S.SHADE_DIR[0] * sn + S.SHADE_DIR[1] * c) * 1.05);
        g.fillStyle = S.INK;
        trace(g, pts);
        g.fill();
        g.stroke();
        sp.rot = rot;
        oliveCache.set(key, sp);
        return sp;
    }

    // ------------------------------------------------------------------ the shoot
    // Everything a shoot is made of, as a list of things to paint with a depth each.
    function buildShoot(path, o) {
        const { s, seed } = o, rnd = Motion.rng('olivo/' + seed), sd = S.seedOf('olivo/' + seed);
        const step = 3 * s;
        const raw = walk(S.curve(path, false, 16), step), n = raw.length - 1, Ltot = n * step;
        // a shoot is never a clean curve: it wanders a little between its nodes
        const mid = raw.map((p, i) => {
            const t = unit(sub(raw[Math.min(n, i + 1)], raw[Math.max(0, i - 1)])), d = i * step;
            const k = S.smooth(0, 40 * s, d) * (3.6 * S.noise2(d / (50 * s), 0.3, sd) + 1.5 * S.noise2(d / (17 * s), 5.3, sd)) * s;
            return [p[0] - t[1] * k, p[1] + t[0] * k];
        });
        const tan = (i) => unit(sub(mid[Math.min(n, i + 2)], mid[Math.max(0, i - 2)]));
        const nodes = [];
        for (let d = (o.first ?? 22 + 10 * rnd()) * s; d < Ltot - 15 * s;) {
            nodes.push(d);
            d += (28 + 12 * rnd()) * s * (1 - 0.22 * (d / Ltot)) * (o.leafK < 1 ? 0.9 : 1);
        }
        const N = nodes.length;
        const hwAt = (d) => {
            const u = d / Ltot;
            let w = (o.w0 + (o.w1 - o.w0) * Math.pow(u, 0.95)) * 0.5 * s * (1 + 0.17 * S.noise2(d / (24 * s), 3.3, sd) + 0.07 * S.noise2(d / (8 * s), 8.1, sd));
            for (const nd of nodes) w *= 1 + 0.2 * Math.exp(-Math.pow((d - nd) / (5 * s), 2));
            return w;
        };
        const rb = ribbon(mid, (u, i) => hwAt(i * step));
        const items = [{ kind: 'stem', z: 0, mid, L: rb.L, R: rb.R, s, sd, w0: o.w0 * s, nodes: nodes.map((d) => Math.min(n - 1, Math.round(d / step))), cut: o.cut !== false }];

        const leafAt = (p, a, len, wid, bend, front, depth, extra = {}) => {
            const q = rnd(), face = extra.face ?? (q < 0.24 ? 'under' : q < 0.42 ? 'curl' : 'upper');
            const lf = leafGeom(p, a, len, wid, bend, (rnd() - 0.5) * 0.16, s, sd + items.length * 13);
            const it = { kind: 'leaf', z: (front ? 100 : -1000) + depth, ...lf, s, face, tint: rnd(), back: !front, young: !!extra.young, seed: sd + items.length };
            if (face === 'curl') {
                // one margin rolled over: a sliver of the underside along that edge
                const E = rnd() < 0.5 ? lf.L : lf.R, a0 = 5 + Math.floor(rnd() * 3), a1 = 23 - Math.floor(rnd() * 3), inner = [];
                for (let i = a0; i <= a1; i++) {
                    const k = 0.62 * Math.pow(Math.sin((Math.PI * (i - a0)) / (a1 - a0)), 0.7);
                    inner.push([E[i][0] + (lf.mid[i][0] - E[i][0]) * k, E[i][1] + (lf.mid[i][1] - E[i][1]) * k]);
                }
                it.curl = [...E.slice(a0, a1 + 1), ...inner.reverse()];
            }
            items.push(it);
        };
        nodes.forEach((nd, k) => {
            const i = Math.min(n - 1, Math.round(nd / step)), p = mid[i], t = tan(i), a = Math.atan2(t[1], t[0]), u = nd / Ltot, h = hwAt(nd);
            const size = (1 - 0.36 * u * u * u) * (k === 0 ? 0.8 : 1) * o.leafK;
            const frontSide = rnd() < 0.5 ? 1 : -1;
            for (const sg of [1, -1]) {
                const beta = (30 + 20 * rnd()) * DEG, len = (55 + 30 * rnd()) * s * size, wid = Math.min(16.5 * s * size, len * (0.2 + 0.03 * rnd()));
                // the leaf in front leaves from an edge of the stem (its own, or the far one, and
                // then it lies across the stem); the other comes out from behind it
                const bend = sg * (rnd() - 0.6) * 0.6, front = sg === frontSide, off = h * (front ? (rnd() < 0.5 ? -0.8 : 0.85) : 0.1);
                leafAt([p[0] - t[1] * sg * off, p[1] + t[0] * sg * off], a + sg * beta, len, wid, bend, front, N - k + (sg > 0 ? 0.3 : 0));
            }
        });
        // the growing tip: a pair of young leaves still close together, and the bud between them
        {
            const t = tan(n), a = Math.atan2(t[1], t[0]), k = s * o.leafK;
            leafAt(mid[n], a + 0.26, (30 + 8 * rnd()) * k, 6.5 * k, -0.2, true, -1, { face: 'upper', young: true });
            leafAt(mid[n], a - 0.3, (27 + 8 * rnd()) * k, 6 * k, 0.22, true, -0.8, { face: rnd() < 0.5 ? 'under' : 'upper', young: true });
            leafAt(mid[n], a + (rnd() - 0.5) * 0.2, 15 * k, 3.6 * k, 0, true, -0.6, { face: 'upper', young: true });
        }
        // the fruit: small groups on a stalk out of a leaf axil, and then gravity
        if (o.olives && N > 3) {
            const cand = [];
            for (let k = 1; k < N - 1; k++) cand.push(k);
            for (let i = cand.length - 1; i > 0; i--) {
                const j = Math.floor(rnd() * (i + 1));
                [cand[i], cand[j]] = [cand[j], cand[i]];
            }
            const count = Math.min(cand.length, o.groups[0] + Math.floor(rnd() * (o.groups[1] - o.groups[0] + 1)));
            cand.slice(0, count).forEach((k) => {
                const nd = nodes[k], i = Math.min(n - 1, Math.round(nd / step)), p = mid[i], t = tan(i), a = Math.atan2(t[1], t[0]), h = hwAt(nd);
                const sg = rnd() < 0.5 ? 1 : -1, nrm = [-t[1] * sg, t[0] * sg];
                const z = rnd() < 0.75 ? 2000 + (N - k) : 60 + (N - k); // most lie over the leaves, some are tucked under them
                const p0 = [p[0] + nrm[0] * h * 0.6, p[1] + nrm[1] * h * 0.6];
                const ax = dir(a + sg * 0.4), d0 = unit([ax[0] * 0.5 + nrm[0] * 0.4, ax[1] * 0.5 + nrm[1] * 0.4 + 0.55]);
                const lp = (11 + 9 * rnd()) * s, p1 = [p0[0] + d0[0] * lp, p0[1] + d0[1] * lp + lp * 0.2];
                items.push({ kind: 'stalk', z: z - 0.5, pts: S.curve([p0, [p0[0] + d0[0] * lp * 0.55, p0[1] + d0[1] * lp * 0.55], p1], false, 5), w: 1.5 * s });
                const c = rnd(), nO = c < 0.22 ? 1 : c < 0.66 ? 2 : 3, rr = rnd(), g0 = rr < 0.42 ? 0 : rr < 0.64 ? 1 : 2;
                for (let j = 0; j < nO; j++) {
                    const sp = j - (nO - 1) / 2;
                    const dj = unit([d0[0] - d0[1] * sp * 1.3, d0[1] + d0[0] * sp * 1.3 + 0.4]);
                    const lq = (4.5 + 4 * rnd() + (nO === 3 && j === 1 ? 4 : 0)) * s, q1 = [p1[0] + dj[0] * lq, p1[1] + dj[1] * lq];
                    const rot = osnap(Math.atan2(dj[1] * 0.5 + 0.8, dj[0] * 0.5 + sp * 0.42 + (rnd() - 0.5) * 0.3));
                    const v = Math.floor(rnd() * 3), al = (OLIVE_A[v] - 1.3) * s;
                    const ripe = rnd() < 0.72 ? g0 : (g0 + 1 + Math.floor(rnd() * 2)) % 3;
                    items.push({ kind: 'stalk', z: z - 0.4, pts: [p1, [(p1[0] + q1[0]) / 2 + dj[1] * 0.8 * s, (p1[1] + q1[1]) / 2 - dj[0] * 0.8 * s], q1], w: 1.2 * s });
                    items.push({ kind: 'olive', z: z + j * 0.01, x: q1[0] + Math.cos(rot) * al, y: q1[1] + Math.sin(rot) * al, rot, ripe: RIPE[ripe], v, s });
                }
            });
        }
        // side shoots out of an axil: one behind the arm, one over it
        for (let q = 0; q < (o.shoots ?? 0) && N > 8; q++) {
            const k = Math.round(N * [0.3, 0.57, 0.14, 0.74][q % 4]), nd = nodes[k], i = Math.min(n - 1, Math.round(nd / step)), p = mid[i], t = tan(i), a = Math.atan2(t[1], t[0]);
            const sg = (q % 2 === 0 ? 1 : -1) * (o.side ?? 1);
            const p1 = [p[0] + Math.cos(a + sg * 0.75) * 40 * s, p[1] + Math.sin(a + sg * 0.75) * 40 * s];
            const p2 = [p1[0] + Math.cos(a + sg * 0.45) * 52 * s, p1[1] + Math.sin(a + sg * 0.45) * 52 * s];
            const p3 = [p2[0] + Math.cos(a + sg * 0.18) * (46 + 24 * rnd()) * s, p2[1] + Math.sin(a + sg * 0.18) * (46 + 24 * rnd()) * s];
            const side = buildShoot([p, p1, p2, p3], { ...o, seed: seed + '/shoot' + q, w0: 5.8, w1: 3.2, leafK: 0.8, shoots: 0, groups: [1, 3], first: 15, cut: false });
            side.sort((x, y) => x.z - y.z);
            const zb = q % 2 === 0 ? -5000 - q : 900 + q;
            side.forEach((it, j) => {
                it.z = zb + j * 0.001;
                items.push(it);
            });
        }
        return items;
    }

    const PAINT = {
        stem(g, it) {
            const { mid, L, R, s } = it, n = mid.length - 1, lw = S.clamp(2 * s, 1.2, 2.6), r = Motion.rng(it.sd + 5);
            const poly = [...L, ...R.slice().reverse()];
            const nl = unit(sub(L[Math.round(n / 3)], R[Math.round(n / 3)])), lit = dot(nl, TO_LIGHT) > 0 ? 1 : -1;
            // a line along the stem, k of the way from its middle to one edge (−1 … 1), drifting to k1
            const along = (i0, i1, k0, k1 = k0) => {
                const out = [];
                i0 = Math.max(0, i0);
                i1 = Math.min(n, i1);
                for (let i = i0; i <= i1; i++) {
                    const k = k0 + ((k1 - k0) * (i - i0)) / Math.max(1, i1 - i0), e = k > 0 ? L[i] : R[i], a = Math.abs(k);
                    out.push([mid[i][0] + (e[0] - mid[i][0]) * a, mid[i][1] + (e[1] - mid[i][1]) * a]);
                }
                return out;
            };
            const woody = Math.round(n * 0.74);
            S.piece(g, poly, {
                fill: { from: mid[0], to: mid[n], stops: [[0, BARK.fill], [0.55, BARK.fill], [0.85, S.mix(BARK.fill, BARK.green, 0.6)], [1, BARK.green]] },
                line: lw, heavy: 0.7,
                cast: { blur: 5 * s, dx: 2.4 * s, dy: 3.4 * s, color: 'rgba(12,14,32,0.5)' },
                shade: { color: BARK.deep, alpha: 0.9, w: it.w0 * 0.36 },
                light: { color: BARK.light, alpha: 0.85, w: it.w0 * 0.2 },
                detail: (q) => {
                    // old wood: a dry light dragged along the lit side, fissures that wander with
                    // the grain, a knot here and there, the cushion each leaf sits on
                    for (let i = 1; i < woody; i += 7 + Math.floor(r() * 7)) {
                        const k = lit * (0.2 + r() * 0.4);
                        S.dab(q, along(i, i + 6 + Math.floor(r() * 8), k, k + (r() - 0.5) * 0.2), { w: it.w0 * (0.14 + r() * 0.1), color: r() < 0.5 ? BARK.light : '#d3c7ad', alpha: 0.6, bristles: 3, seed: it.sd + i, dry: 0.5 });
                    }
                    for (let i = 0; i < woody; i += 1 + Math.floor(r() * 3)) {
                        const k = (r() * 2 - 1) * 0.85, l = 3 + Math.floor(r() * 7);
                        S.ink(q, along(i, i + l, k, k + (r() - 0.5) * 0.45), { w: (0.7 + r() * 0.8) * s, color: BARK.deep, alpha: 0.4 + r() * 0.45, taper: [1, 1] });
                    }
                    for (let i = Math.round(n * 0.08); i < n * 0.6; i += Math.round(n * (0.13 + r() * 0.1))) {
                        const p = along(i, i, (r() * 2 - 1) * 0.35)[0], t = unit(sub(mid[Math.min(n, i + 1)], mid[Math.max(0, i - 1)])), a = Math.atan2(t[1], t[0]);
                        q.fillStyle = S.rgba(BARK.deep, 0.85);
                        q.beginPath();
                        q.ellipse(p[0], p[1], 2.5 * s, 1.5 * s, a, 0, TAU);
                        q.fill();
                        q.fillStyle = S.rgba(BARK.light, 0.85);
                        q.beginPath();
                        q.ellipse(p[0] - 0.45 * s, p[1] - 0.5 * s, 1.3 * s, 0.7 * s, a, 0, TAU);
                        q.fill();
                    }
                    for (const i of it.nodes) {
                        if (i + 2 > n || i < 2) continue;
                        for (const E of [L, R]) {
                            const c = [mid[i][0] + (E[i][0] - mid[i][0]) * 0.45, mid[i][1] + (E[i][1] - mid[i][1]) * 0.45];
                            S.ink(q, S.curve([E[i - 2], c, E[i + 1]], false, 4), { w: 0.9 * s, color: BARK.deep, alpha: 0.6, taper: [0.6, 0.6] });
                        }
                    }
                },
            });
            if (it.cut) {
                // where it was cut: pale wood, a ring, the pith
                const t = unit(sub(mid[1], mid[0])), a = Math.atan2(t[1], t[0]), h = dist(L[0], R[0]) / 2;
                S.piece(g, S.ellipse(mid[0][0], mid[0][1], h * 0.5, h * 1.08, 20, a - 0.25), {
                    fill: '#d6c198', line: lw * 0.8, shade: { color: '#8a6a45', alpha: 0.7, w: h * 0.7 },
                    detail: (q) => {
                        q.strokeStyle = 'rgba(110,80,50,0.7)';
                        q.lineWidth = 0.7 * s;
                        q.beginPath();
                        q.ellipse(mid[0][0], mid[0][1], h * 0.26, h * 0.6, a - 0.25, 0, TAU);
                        q.stroke();
                        q.fillStyle = 'rgba(80,54,40,0.8)';
                        q.beginPath();
                        q.ellipse(mid[0][0], mid[0][1], h * 0.09, h * 0.2, a - 0.25, 0, TAU);
                        q.fill();
                    },
                });
            }
        },
        leaf(g, it) {
            const s = it.s;
            const upFill = it.young ? S.mix(UPPER.fill, '#93a85e', 0.5) : S.mix(S.mix(UPPER.fill, '#55724c', it.tint * 0.6), UPPER.deep, it.back ? 0.2 : 0);
            const unFill = S.mix(S.mix(UNDER.fill, '#a9b89c', it.tint * 0.6), UNDER.deep, it.back ? 0.14 : 0);
            // the upper face: leathery, a dry light dragged along the lit half
            const upper = (q, b) => {
                const k0 = Math.round(b.mid.length * 0.25), k1 = Math.round(b.mid.length * 0.8);
                if (k1 - k0 < 3) return;
                const line = [];
                for (let i = k0; i <= k1; i++) line.push([b.mid[i][0] + (b.lit[i][0] - b.mid[i][0]) * 0.5, b.mid[i][1] + (b.lit[i][1] - b.mid[i][1]) * 0.5]);
                S.dab(q, line, { w: b.wid * 0.22, color: '#a9bd7c', alpha: 0.5, bristles: 4, seed: it.seed, dry: 0.55 });
            };
            // the underside: a felt of silver scales, and the midrib standing proud
            const under = (q, b) => {
                const r = Motion.rng(it.seed + 3), m = b.mid.length;
                for (let i = 0; i < 26; i++) {
                    const j = 2 + Math.floor(r() * (m - 4)), e = r() < 0.5 ? b.L[j] : b.R[j], k = r() * 0.85;
                    q.fillStyle = r() < 0.6 ? 'rgba(244,247,234,0.6)' : 'rgba(104,124,104,0.4)';
                    q.beginPath();
                    q.arc(b.mid[j][0] + (e[0] - b.mid[j][0]) * k, b.mid[j][1] + (e[1] - b.mid[j][1]) * k, (0.35 + r() * 0.35) * s, 0, TAU);
                    q.fill();
                }
            };
            if (it.face === 'under') blade(g, it, UNDER, { fill: unFill, over: under });
            else blade(g, it, UPPER, { fill: upFill, over: upper });
            if (it.curl) {
                S.piece(g, it.curl, {
                    fill: unFill, line: S.clamp(1.3 * s, 0.9, 2),
                    cast: { blur: 2.6 * s, dx: 1.3 * s, dy: 1.8 * s, color: 'rgba(14,24,24,0.55)' },
                    shade: { color: UNDER.deep, alpha: 0.7, w: 2.6 * s }, light: { color: UNDER.light, alpha: 0.8, w: 1.8 * s },
                });
            }
        },
        stalk(g, it) {
            S.ink(g, it.pts, { w: it.w * 1.9, color: S.INK, taper: [0, 0.15] });
            S.ink(g, it.pts, { w: it.w * 0.8, color: '#8d9556', taper: [0, 0.15] });
        },
        olive(g, it) {
            const res = Math.min(8, Math.max(1.5, Math.ceil(S.pxScale(g) * it.s * 1.25 * 2) / 2));
            const sp = oliveSprite(it.ripe, it.v, it.rot, res);
            const at = { x: it.x, y: it.y, rot: sp.rot, s: it.s };
            S.cast(g, (q) => S.put(q, sp, at), { blur: 4 * it.s, dx: 2 * it.s, dy: 3 * it.s, color: 'rgba(10,12,30,0.55)' });
            S.put(g, sp, at);
        },
    };

    function olive(g, o = {}) {
        const { path, seed = 'olivo', s = 1, olives = true, flip = false, shoots = 2 } = o;
        // the mirror arm is the same shoot grown on the mirrored path, then turned back:
        // only the geometry is mirrored, the paint is laid afterwards under the same light
        const mx = (p) => [-p[0], p[1]];
        const items = buildShoot(flip ? path.map(mx) : path, { s, seed, w0: 13.5, w1: 4, leafK: 1, olives, groups: [10, 14], shoots, side: o.side ?? 1 });
        if (flip) {
            for (const it of items) {
                for (const k of ['mid', 'L', 'R', 'curl', 'pts']) if (it[k]) it[k] = it[k].map(mx);
                if (it.kind === 'olive') {
                    it.x = -it.x;
                    it.rot = Math.PI - it.rot;
                }
            }
        }
        items.sort((a, b) => a.z - b.z);
        for (const it of items) PAINT[it.kind](g, it);
    }

    // ================================================================== CARNATION
    const RED = { base: '#cf3a3c', deep: '#7a1428', light: '#f39a8c', fold: '#460c24', line: '#3c0a24', cast: 'rgba(52,6,30,0.5)', claw: '#571027', eye: '#4d0b22', soft: 1 };
    const WHITE = { base: '#efe7da', deep: '#9c97b4', light: '#fdfaf1', fold: '#77739a', line: '#4a3a66', cast: 'rgba(58,54,104,0.36)', claw: '#a9ac8c', eye: '#9a6a84', edge: '#c9343a', edgeDeep: '#8a1a2c', soft: 0.62 };
    const CALYX = { fill: '#6c9862', deep: '#28503f', light: '#b0d294', bract: '#86a866' };
    const GLAUC = { fill: '#7b9a86', deep: '#2e504c', light: '#bfd8bd', glint: '#e0eeda', rib: '#25423d', ribLight: '#d6e8d0', ribW: 1 };
    const VIEW = 40 * DEG; // how far the flower's axis leans towards the eye
    const cT = Math.cos(VIEW), sT = Math.sin(VIEW);
    // The tiers of a double carnation, from the skirt (turned back) to the heart: nested
    // funnels, the inner ones shorter and more upright, so that their rims lie one inside
    // the other as rings seen from above and in front.
    //   th: the petal's angle off the flower's axis [on the far side, on the side of the eye]
    //   len: its length × r [far, near];  at: azimuths (degrees, 90 = towards the eye)
    const TIERS = [
        { at: [224, 196, -44, -16], th: [102, 102], len: [1.08, 1.08], half: 0.5, curl: 0.35, ruf: 0.07, cup: -0.04, dark: 0 },
        { n: 9, th: [62, 58], len: [1.25, 0.95], half: 0.5, curl: 0.22, ruf: 0.07, cup: 0, dark: 0 },
        { n: 8, th: [50, 48], len: [1.05, 0.95], half: 0.48, curl: 0.12, ruf: 0.065, cup: 0.03, dark: 0.04 },
        { n: 7, th: [36, 36], len: [0.88, 0.85], half: 0.46, curl: 0.06, ruf: 0.06, cup: 0.05, dark: 0.1 },
        { n: 5, th: [22, 22], len: [0.72, 0.78], half: 0.44, curl: 0, ruf: 0.055, cup: 0.07, dark: 0.2 },
        { n: 3, th: [8, 8], len: [0.55, 0.56], half: 0.4, curl: 0, ruf: 0.05, cup: 0.08, dark: 0.34 },
    ];
    // The petal's own axes for an angle off the flower's axis and an azimuth about it, in
    // view space (x right, y down, z to the eye): along it, across it, out of its upper face.
    const frame = (th, ph) => {
        const ct = Math.cos(th), st = Math.sin(th), cp = Math.cos(ph), sp = Math.sin(ph);
        const Rx = cp, Ry = sp * sT, Rz = sp * cT;
        return { d: [st * Rx, -ct * cT + st * Ry, ct * sT + st * Rz], N: [-ct * Rx, -st * cT - ct * Ry, st * sT - ct * Rz], T: [-sp, cp * sT, cp * cT] };
    };
    // A point of a petal: rho along it (0 at the calyx's mouth, 1 at the rim), al across it.
    // The blade turns back as it goes out, ruffles more towards the rim, and is a little cupped.
    const p3 = (P, rho, al) => {
        const f = frame(P.th + P.curl * rho * rho, P.ph), ca = Math.cos(al), sa = Math.sin(al), L = P.len * rho, q = al / P.half;
        // (the ruffle dies away towards the petal's two sides, or its corners fold into spikes)
        const h = P.len * (P.ruf * Math.pow(rho, 1.5) * Math.sin(P.om * al + P.phase) * (1 - 0.75 * q * q * q * q) + P.cup * rho * q * q);
        return [L * (f.d[0] * ca + f.T[0] * sa) + h * f.N[0], L * (f.d[1] * ca + f.T[1] * sa) + h * f.N[1], L * (f.d[2] * ca + f.T[2] * sa) + h * f.N[2]];
    };
    function petalList(seed) {
        const rnd = Motion.rng('clavel-petals/' + seed), list = [];
        TIERS.forEach((T, ti) => {
            const turn = rnd() * TAU, n = T.at ? T.at.length : T.n;
            for (let k = 0; k < n; k++) {
                const ph = (T.at ? T.at[k] * DEG : turn + (k / n) * TAU) + (rnd() - 0.5) * 0.2;
                const far = (1 - Math.sin(ph)) / 2;
                const th = (T.th[1] + (T.th[0] - T.th[1]) * far + (rnd() - 0.5) * 7) * DEG;
                const half = T.half * (0.9 + rnd() * 0.22), waves = 1.4 + rnd() * 1.3, teeth = 6 + Math.floor(rnd() * 5);
                const P = {
                    tier: ti, k: list.length, th, ph, len: (T.len[1] + (T.len[0] - T.len[1]) * far) * (0.95 + rnd() * 0.09), half, curl: T.curl * (0.6 + rnd() * 0.8), ruf: T.ruf * (0.7 + rnd() * 0.6),
                    om: (TAU * waves) / (2 * half), phase: rnd() * TAU, cup: T.cup, teeth, dep: [], jit: [], dark: T.dark, vary: rnd(),
                };
                for (let j = 0; j <= teeth * 2; j++) {
                    P.dep.push(0.05 + rnd() * 0.06);
                    P.jit.push(rnd() - 0.5);
                }
                list.push(P);
            }
        });
        return list;
    }
    // The pinked rim: [rho, al] at every notch and every point.
    function rimOf(P) {
        const out = [], m = P.teeth * 2;
        for (let j = 0; j <= m; j++) {
            const al = -P.half + (2 * P.half * (j + (j > 0 && j < m ? P.jit[j] * 0.5 : 0))) / m, q = al / P.half;
            const round = 1 - 0.13 * q * q + 0.03 * S.noise2(q * 2.1, P.k * 0.37, 11);
            out.push([round - (j % 2 === 0 ? P.dep[j] : 0), al]);
        }
        return out;
    }

    // A calyx seen a little from above: a tube of revolution whose axis runs down the
    // picture from (0, my), crowned by five teeth (three in view). Local units.
    //   rad(s): radius at s down the axis; the teeth's points at s = tip, the notches between
    //   them at s = sinus; flare: how far the points stand off the tube (× radius)
    function crown({ my, len, rad, tau, tip, sinus, flare, cap }) {
        const c = Math.cos(tau), sn = Math.sin(tau);
        const tooth = (psi) => {
            let m = 0;
            for (let k = 0; k < 5; k++) {
                const d = Math.abs(((((psi - 90 - 72 * k) % 360) + 540) % 360) - 180);
                m = Math.max(m, 1 - d / 36);
            }
            return Math.pow(Math.max(0, m), 0.9);
        };
        const at = (psi, sv, k = 1) => {
            const rr = rad(Math.max(0, sv)) * k, a = psi * DEG;
            return [rr * Math.cos(a), my + sv * c + rr * Math.sin(a) * sn];
        };
        const topS = (psi) => sinus + (tip - sinus) * tooth(psi);
        const poly = [];
        for (let i = 0; i < 10; i++) poly.push(at(180, len + (topS(180) - len) * (i / 10)));
        for (let psi = 180; psi >= 0; psi -= 3) poly.push(at(psi, topS(psi), 1 + (flare - 1) * tooth(psi)));
        for (let i = 1; i <= 10; i++) poly.push(at(0, topS(0) + (len - topS(0)) * (i / 10)));
        for (let psi = 6; psi <= 174; psi += 6) {
            const p = at(psi, len);
            poly.push([p[0], p[1] + cap * Math.sin(psi * DEG)]);
        }
        return { poly, at, base: my + len * c + cap, tau };
    }
    // Paints a crown: the tube's roundness, the seams between its sepals, its fine ribs.
    function paintCrown(g, W, wrot, cr, o) {
        const { r, lw, sinus, len, tip } = o, R = r * (o.k ?? 1); // r: local units; R: the caller's, for the paint
        // where the tube turns to the lamp
        let best = 90, bv = -9, worst = 90, wv = 9;
        const cR = Math.cos(wrot), sR = Math.sin(wrot), ct = Math.cos(cr.tau), st = Math.sin(cr.tau);
        const hl = Math.hypot(LN[0], LN[1], LN[2] + 1), H = [LN[0] / hl, LN[1] / hl, (LN[2] + 1) / hl];
        for (let psi = 14; psi <= 166; psi += 4) {
            const a = psi * DEG, nx = Math.cos(a), ny = Math.sin(a) * st, nz = Math.sin(a) * ct;
            const wx = nx * cR - ny * sR, wy = nx * sR + ny * cR;
            const v = wx * H[0] + wy * H[1] + nz * H[2], d = wx * LN[0] + wy * LN[1] + nz * LN[2];
            if (v > bv) {
                bv = v;
                best = psi;
            }
            if (d < wv) {
                wv = d;
                worst = psi;
            }
        }
        S.piece(g, W(cr.poly), {
            fill: CALYX.fill, line: lw, heavy: 0.7,
            cast: { blur: R * 0.06, dx: R * 0.025, dy: R * 0.035, color: o.cast },
            shade: [{ color: CALYX.deep, alpha: 0.9, w: R * 0.13 }],
            light: [{ color: CALYX.light, alpha: 0.5, w: R * 0.05 }],
            detail: (q) => {
                const s0 = sinus + r * 0.02, s1 = len - r * 0.12;
                const band = (psi, dw) => W([cr.at(Math.max(0, psi - dw), s0), cr.at(Math.min(180, psi + dw), s0), cr.at(Math.min(180, psi + dw), s1), cr.at(Math.max(0, psi - dw), s1)]);
                blob(q, band(worst, 24), CALYX.deep, 0.55, R * 0.05);
                blob(q, band(best, 12), CALYX.light, 0.8, R * 0.035);
                // the head overhangs it: a shade across its top
                if (o.under) blob(q, W([cr.at(180, tip - r * 0.1), cr.at(0, tip - r * 0.1), cr.at(0, sinus + r * 0.06), cr.at(90, sinus + r * 0.14), cr.at(180, sinus + r * 0.06)]), '#173a36', o.under, R * 0.07);
                // ribs down the tube, and the seams that run down from between the teeth
                for (const psi of [14, 30, 44, 66, 78, 102, 114, 136, 150, 166]) {
                    const line = [];
                    for (let i = 0; i <= 6; i++) line.push(cr.at(psi, s0 + (s1 - s0) * (i / 6)));
                    S.ink(q, W(line), { w: lw * 0.4, color: CALYX.deep, alpha: 0.45, taper: [1, 1] });
                }
                for (const psi of [54, 126]) {
                    const line = [];
                    for (let i = 0; i <= 6; i++) line.push(cr.at(psi, sinus + (len * 0.62 - sinus) * (i / 6)));
                    S.ink(q, W(line), { w: lw * 0.8, color: S.INK, alpha: 0.9, taper: [0, 1] });
                    S.ink(q, W(line.map((p) => [p[0] - lw * 0.55, p[1]])), { w: lw * 0.45, color: CALYX.light, alpha: 0.6, taper: [0.4, 1] });
                }
            },
        });
    }
    // A scale at the foot of the calyx: pointed, keeled, lying on the tube.
    function bract(g, pts, keel, lw, r, fill) {
        S.piece(g, pts, {
            fill: fill ?? CALYX.bract, line: lw * 0.9, heavy: 0.6,
            cast: { blur: r * 0.045, dx: r * 0.02, dy: r * 0.03, color: 'rgba(8,30,30,0.55)' },
            shade: { color: CALYX.deep, alpha: 0.85, w: r * 0.07 },
            light: { color: '#d3e4a6', alpha: 0.75, w: r * 0.04 },
            detail: (q) => {
                S.ink(q, keel, { w: lw * 0.5, color: CALYX.deep, alpha: 0.7, taper: [1, 0.2] });
                S.ink(q, keel.map((p) => [p[0] - lw * 0.5, p[1] - lw * 0.2]), { w: lw * 0.4, color: '#e2efba', alpha: 0.6, taper: [1, 0.6] });
            },
        });
    }

    // A narrow carnation leaf from a node: it clasps the stem, runs out straight and curls
    // back at its tip.
    function strap(base, ang, len, wid, curl, hwStem, sd) {
        const n = 24, mid = [base.slice()];
        let x = base[0], y = base[1];
        for (let i = 1; i <= n; i++) {
            const a = ang + curl * Math.pow((i - 0.5) / n, 1.9);
            x += (Math.cos(a) * len) / n;
            y += (Math.sin(a) * len) / n;
            mid.push([x, y]);
        }
        const rb = ribbon(mid, (v) => {
            if (v >= 1) return 0;
            const b = (wid / 2) * (0.7 + 0.3 * S.smooth(0.05, 0.3, v)) * Math.pow(Math.max(0, 1 - Math.pow(v, 2.6)), 0.85);
            const sheath = hwStem * 1.25 * (1 - S.smooth(0, 0.12, v));
            return Math.max(sheath, b) * (1 + 0.05 * S.noise2(v * 4, 0.7, sd));
        });
        return { mid: rb.mid, L: rb.L, R: rb.R };
    }

    // A jointed stem and its leaves, in local units mapped by `W`. It runs through `pts`
    // from under the calyx to its cut end and swells at every node; a leafed node carries
    // an opposite pair of narrow leaves, one behind the stem and one in front of it.
    function stalk(g, W, pts, o) {
        const { hw, nodes, leafLen, leafWid, rnd, sd, lw, s } = o, k = o.k ?? 1; // k: local units → the caller's
        const step = Math.max(1.5, hw * 0.8);
        const mid = walk(S.curve(pts, false, 12), step), n = mid.length - 1;
        if (n < 4) return;
        const nd = nodes.map((q) => ({ ...q, i: S.clamp(Math.round(q.at * n), 2, n - 2) }));
        const rb = ribbon(mid, (u, i) => {
            let w = hw * (1 - 0.1 * u);
            for (const q of nd) w *= 1 + 0.45 * Math.exp(-Math.pow(((i - q.i) * step) / (hw * 1.5), 2));
            return w;
        });
        const leaves = [];
        for (const q of nd) {
            if (!q.leaves) continue;
            const up = Math.atan2(mid[q.i - 2][1] - mid[q.i + 2][1], mid[q.i - 2][0] - mid[q.i + 2][0]);
            const frontSide = rnd() < 0.5 ? 1 : -1;
            for (const sg of [1, -1]) {
                const len = leafLen * (q.k ?? 1) * (0.82 + rnd() * 0.36), ang = up + sg * (0.42 + rnd() * 0.3), curl = sg * (0.7 + rnd() * 1.3);
                leaves.push({ front: sg === frontSide, lf: { ...mapGeom(strap(mid[q.i], ang, len, leafWid * (q.k ?? 1), curl, hw, sd + leaves.length * 7), (p) => W([p])[0]), s } });
            }
        }
        const leafCast = { blur: 4 * s, dx: 2 * s, dy: 2.8 * s, color: 'rgba(12,16,34,0.5)' };
        for (const l of leaves) if (!l.front) blade(g, l.lf, GLAUC, { fill: S.mix(GLAUC.fill, GLAUC.deep, 0.18), line: lw * 0.9, cast: leafCast });
        const poly = W(rb.poly);
        S.piece(g, poly, {
            fill: '#7c9c7c', line: lw, heavy: 0.7,
            cast: { blur: 4 * s, dx: 2 * s, dy: 3 * s, color: 'rgba(12,16,34,0.5)' },
            shade: { color: GLAUC.deep, alpha: 0.9, w: hw * k * 1.1 },
            light: { color: GLAUC.light, alpha: 0.85, w: hw * k * 0.55 },
            detail: (q) => {
                // the joints: a ring under each swelling
                for (const e of nd) {
                    const j = Math.min(n, e.i + Math.max(1, Math.round((hw * 1.2) / step)));
                    const a = rb.L[j], b = rb.R[j], c = mid[Math.min(n, j + 1)];
                    S.ink(q, W(S.curve([a, [c[0] * 0.6 + (a[0] + b[0]) * 0.2, c[1] * 0.6 + (a[1] + b[1]) * 0.2], b], false, 4)), { w: lw * 0.7, color: S.INK, alpha: 0.8, taper: [0.3, 0.3] });
                    blob(q, W([rb.L[e.i - 1], rb.R[e.i - 1], rb.R[e.i + 1], rb.L[e.i + 1]]), GLAUC.light, 0.5, hw * k * 0.6);
                }
            },
        });
        for (const l of leaves) if (l.front) blade(g, l.lf, GLAUC, { line: lw * 0.9, cast: leafCast });
        // the cut end
        const t = unit(sub(mid[n], mid[n - 1])), e = W([mid[n], [mid[n][0] + t[0], mid[n][1] + t[1]]]), a = Math.atan2(e[1][1] - e[0][1], e[1][0] - e[0][0]);
        S.piece(g, S.ellipse(e[0][0], e[0][1], hw * k * 0.5, hw * k * 0.98, 14, a + 0.3), { fill: '#bfd0a2', line: lw * 0.7, shade: { color: GLAUC.deep, alpha: 0.6, w: hw * k * 0.6 } });
    }

    function carnation(g, o = {}) {
        const { x = 0, y = 0, r = 70, rot = 0, seed = 'clavel', color = 'red', stem = 2.5, to = null, leaves = 1 } = o;
        const pal = color === 'white' ? WHITE : RED, white = color === 'white';
        const rnd = Motion.rng('clavel/' + seed), sd = S.seedOf('clavel/' + seed);
        const cR = Math.cos(rot), sR = Math.sin(rot);
        const Wp = (p) => [x + p[0] * cR - p[1] * sR, y + p[0] * sR + p[1] * cR];
        const W = (pts) => pts.map(Wp);
        const toLocal = (p) => [(p[0] - x) * cR + (p[1] - y) * sR, -(p[0] - x) * sR + (p[1] - y) * cR];
        const lw = S.clamp(r * 0.028, 1.3, 2.4);
        const my = 0.5 * r; // the calyx's mouth: the head stands on it
        const CL = 0.92 * r, TIP = -0.1 * r, SIN = 0.25 * r;
        const cr = crown({
            my, len: CL, tau: VIEW, tip: TIP, sinus: SIN, flare: 1.12, cap: 0.05 * r,
            rad: (sv) => {
                const t = Math.min(1, sv / CL);
                return r * (0.185 + 0.03 * Math.sin(Math.PI * Math.pow(t, 0.7)) - 0.06 * t * t * t);
            },
        });
        const yb = cr.base;

        // 1 · the stem and its leaves, behind everything
        if (to || stem > 0) {
            const path = [[0, yb - 0.06 * r], [0, yb + 0.3 * r]];
            let nodes;
            if (to) {
                const via = (Array.isArray(to[0]) ? to : [to]).map(toLocal);
                path.push(...via);
                nodes = [{ at: 0.34, leaves: leaves > 0 }, { at: 0.68, leaves: leaves > 1, k: 0.8 }];
            } else {
                const bend = (rnd() - 0.5) * 0.5, len = stem * r;
                for (let i = 1; i <= 4; i++) {
                    const u = i / 4;
                    path.push([Math.sin(bend * u) * len * u * 0.6, yb + 0.3 * r + len * u]);
                }
                nodes = stem >= 1.6 ? [{ at: 0.4, leaves: leaves > 0 }, { at: 0.82, leaves: leaves > 1, k: 0.75 }] : [{ at: 0.6, leaves: leaves > 0, k: 0.7 }];
            }
            stalk(g, W, path, { hw: Math.max(1.7, 0.046 * r), nodes, leafLen: 1.25 * r, leafWid: Math.max(5, 0.17 * r), rnd, sd, lw: lw * 0.9, s: r / 70 });
        }

        // 2 · the petals, tier by tier from the outside in, the far ones of a tier first
        const list = petalList(seed).map((P) => {
            const f = frame(P.th + P.curl * 0.4, P.ph), sign = f.N[2] >= 0 ? 1 : -1;
            const nx = f.N[0] * sign, ny = f.N[1] * sign, nz = f.N[2] * sign;
            const tone = (nx * cR - ny * sR) * LN[0] + (nx * sR + ny * cR) * LN[1] + nz * LN[2];
            const tl = (f.T[0] * cR - f.T[1] * sR) * LN[0] + (f.T[0] * sR + f.T[1] * cR) * LN[1] + f.T[2] * LN[2];
            // the head as a whole is a dome under the same lamp: its upper left takes the
            // light whatever each petal does
            const e = p3(P, 0.9, 0), ex = e[0], ey = e[1] + 0.5;
            const dome = (ex * cR - ey * sR) * TO_LIGHT[0] + (ex * sR + ey * cR) * TO_LIGHT[1];
            return { P, sign, tone: 0.7 * tone + 0.6 * dome, tl, z: p3(P, 0.7, 0)[2] };
        });
        list.sort((a, b) => a.P.tier - b.P.tier || a.z - b.z);
        const tintOf = (tone, dark, vary) => {
            const t = S.clamp(0.5 + 0.55 * tone);
            let c = t < 0.55 ? S.mix(S.mix(pal.deep, pal.base, white ? 0.62 : 0.3), pal.base, S.smooth(0.08, 0.55, t)) : S.mix(pal.base, pal.light, S.smooth(0.55, 1.1, t) * (white ? 0.8 : 0.45));
            c = S.mix(c, pal.deep, dark * (white ? 0.4 : 1));
            return S.mix(c, white ? '#e6d9cf' : '#c2303e', vary * 0.25);
        };
        const paintPetal = ({ P, sign, tone, tl }) => {
            const to2 = (rho, al) => {
                const q = p3(P, rho, al);
                return Wp([q[0] * r, my + q[1] * r]);
            };
            const rim = rimOf(P), m = rim.length - 1, poly = [], rimLine = [];
            const side = (u) => P.half * (0.42 + 0.58 * S.smooth(0.05, 0.85, u));
            for (let i = 0; i < 6; i++) poly.push(to2(0.12 + (rim[0][0] - 0.12) * (i / 6), -side(i / 6)));
            for (let j = 0; j <= m; j++) {
                rimLine.push(to2(rim[j][0], rim[j][1]));
                if (j < m) rimLine.push(to2((rim[j][0] + rim[j + 1][0]) / 2, (rim[j][1] + rim[j + 1][1]) / 2));
            }
            poly.push(...rimLine);
            for (let i = 5; i >= 0; i--) poly.push(to2(0.12 + (rim[m][0] - 0.12) * (i / 6), side(i / 6)));
            const b0 = to2(0.14, 0), b1 = to2(0.95, 0), ax = unit(sub(b1, b0)), Lp = Math.max(dist(b0, b1), r * 0.16);
            const plw = lw * (1 - 0.07 * P.tier), ink = S.mix(S.INK, pal.line, [0, 0, 0.35, 0.6, 0.8, 0.9][P.tier]);
            const litK = S.clamp(0.35 + 0.65 * tone);
            S.piece(g, poly, {
                fill: tintOf(tone, P.dark, P.vary), line: plw, heavy: 0.6, ink,
                cast: { blur: r * 0.07, dx: r * 0.03, dy: r * 0.042, color: pal.cast },
                shade: [
                    { color: white ? S.mix(pal.deep, '#8a3350', 0.2) : pal.deep, alpha: 0.85 * pal.soft, w: Lp * 0.3, push: Lp * 0.32, dir: [-ax[0], -ax[1]] },
                    { color: pal.deep, alpha: 0.4 * pal.soft, w: r * 0.1 },
                ],
                light: [{ color: pal.light, alpha: 0.85 * litK, w: r * 0.09, push: r * 0.04, dir: ax }],
                detail: (q) => {
                    // the ruffles: every flank that turns to the lamp takes a light, the one
                    // behind it a shade; a fold line down every valley
                    const kmin = Math.ceil((-P.half * P.om + P.phase) / Math.PI - 1), kmax = Math.floor((P.half * P.om + P.phase) / Math.PI + 1);
                    const wd = (0.3 * Math.PI) / P.om;
                    for (let k = kmin; k <= kmax; k++) {
                        const al = (k * Math.PI - P.phase) / P.om;
                        if (Math.abs(al) > P.half * 0.92) continue;
                        const d = -sign * P.ruf * P.om * (k % 2 === 0 ? 1 : -1) * tl * 0.9;
                        const a0 = Math.max(-P.half, al - wd), a1 = Math.min(P.half, al + wd);
                        const wedge = [to2(0.42, al), to2(0.7, a0 * 0.85 + al * 0.15), to2(1.03, a0), to2(1.03, a1), to2(0.7, a1 * 0.85 + al * 0.15)];
                        if (Math.abs(d) > 0.06) blob(q, wedge, d > 0 ? pal.light : pal.deep, Math.min(d > 0 ? 0.75 : 0.6 * pal.soft, Math.abs(d) * 1.5), r * 0.03);
                    }
                    if (white) {
                        // a picotee: the rim dipped in red, and flecks of it run down the petal
                        q.save();
                        q.lineJoin = 'round';
                        q.strokeStyle = pal.edge;
                        q.lineWidth = r * (0.07 + 0.035 * P.vary);
                        q.beginPath();
                        S.trace(q, rimLine, false);
                        q.stroke();
                        q.restore();
                        const fr = Motion.rng(sd + P.k * 31);
                        for (let i = 0; i < 4; i++) {
                            const al = (fr() * 2 - 1) * P.half * 0.9, r0 = 0.55 + fr() * 0.3;
                            S.ink(q, [to2(1.0, al), to2((1 + r0) / 2, al), to2(r0, al)], { w: r * (0.014 + fr() * 0.02), color: fr() < 0.5 ? pal.edge : pal.edgeDeep, taper: [0, 1], alpha: 0.85 });
                        }
                    }
                    for (let k = kmin; k <= kmax; k++) {
                        const al = ((k + 0.5) * Math.PI - P.phase) / P.om;
                        if (Math.abs(al) > P.half * 0.86) continue;
                        const valley = sign * (k % 2 === 0 ? 1 : -1) < 0;
                        const line = S.curve([to2(0.3, al * 0.7), to2(0.52, al * 0.86), to2(0.74, al), to2(0.93, al)], false, 4);
                        if (valley) S.ink(q, line, { w: plw * 0.62, color: pal.fold, taper: [1, 0.4], alpha: 0.8 });
                        else if (tone > 0.1) S.ink(q, line, { w: plw * 0.55, color: pal.light, taper: [1, 0.6], alpha: 0.55 });
                    }
                },
            });
        };
        const tier = (t) => list.filter((q) => q.P.tier === t).forEach(paintPetal);
        tier(0);
        tier(1);

        // 3 · the calyx: the claws of the petals in its throat, the tube and its teeth over
        // the lowest petals, the scales at its foot
        S.piece(g, W([cr.at(180, -0.04 * r), cr.at(180, SIN + 0.03 * r), cr.at(135, SIN + 0.03 * r), cr.at(90, SIN + 0.03 * r), cr.at(45, SIN + 0.03 * r), cr.at(0, SIN + 0.03 * r), cr.at(0, -0.04 * r)]), { fill: pal.claw, line: 0, shade: { color: white ? '#5e6a58' : '#2a0616', alpha: 0.8, w: r * 0.1 } });
        paintCrown(g, W, rot, cr, { r, lw, sinus: SIN, len: CL, tip: TIP, flare: 1.12, cast: pal.cast, under: 0.5 });
        const P2 = (u, v) => Wp([u * r, yb + v * r]);
        // two pairs of scales, crossed: the outer pair shows its points at the sides, the
        // inner pair laps over the front
        for (const sg of [-1, 1]) bract(g, pointed([P2(sg * 0.12, 0.01), P2(sg * 0.2, -0.1)], P2(sg * 0.215, -0.31), [P2(sg * 0.13, -0.17), P2(sg * 0.06, -0.04)]), [P2(sg * 0.12, -0.03), P2(sg * 0.18, -0.16), P2(sg * 0.21, -0.29)], lw, r, S.mix(CALYX.bract, CALYX.fill, 0.5));
        bract(g, pointed([P2(0.03, 0.06), P2(-0.15, -0.02), P2(-0.17, -0.14)], P2(-0.07, -0.36), [P2(0.0, -0.2), P2(0.06, -0.06)]), [P2(-0.04, 0.02), P2(-0.07, -0.16), P2(-0.07, -0.33)], lw, r);
        bract(g, pointed([P2(-0.04, 0.06), P2(-0.03, -0.1), P2(0.03, -0.2)], P2(0.1, -0.33), [P2(0.17, -0.13), P2(0.15, -0.01)]), [P2(0.06, 0.02), P2(0.09, -0.15), P2(0.1, -0.3)], lw, r);

        // 4 · the inner tiers, tighter and darker towards the heart
        tier(2);
        tier(3);
        tier(4);
        blob(g, W(S.ellipse(0, my - 0.52 * r, 0.24 * r, 0.15 * r, 24)), pal.eye, 0.5, r * 0.09);
        tier(5);
    }

    // ================================================================== BUD
    function bud(g, o = {}) {
        const { x = 0, y = 0, s = 1, rot = 0, seed = 'capullo', stem = 75, to = null, leaves = 1 } = o;
        const rnd = Motion.rng('capullo/' + seed), sd = S.seedOf('capullo/' + seed);
        const cR = Math.cos(rot), sR = Math.sin(rot);
        const Wp = (p) => [x + (p[0] * cR - p[1] * sR) * s, y + (p[0] * sR + p[1] * cR) * s];
        const W = (pts) => pts.map(Wp);
        const toLocal = (p) => [((p[0] - x) * cR + (p[1] - y) * sR) / s, (-(p[0] - x) * sR + (p[1] - y) * cR) / s];
        const lw = S.clamp(1.7 * s, 1.1, 2.4), tau = 14 * DEG, len = 54, my = -22;
        const cr = crown({
            my, len, tau, tip: -13, sinus: 6, flare: 0.5, cap: 3,
            rad: (sv) => {
                const t = 1 - Math.min(1, sv / len);
                return 5.4 + 7.6 * Math.pow(Math.max(0, Math.sin(Math.PI * Math.pow(t, 1.2))), 0.85) - 1.3 * t;
            },
        });
        const yb = cr.base;
        // the stem
        if (to || stem > 0) {
            const path = [[0, yb - 3], [0, yb + 16]];
            if (to) path.push(...(Array.isArray(to[0]) ? to : [to]).map(toLocal));
            else {
                const bend = (rnd() - 0.5) * 0.5;
                for (let i = 1; i <= 3; i++) path.push([Math.sin((bend * i) / 3) * stem * (i / 3) * 0.6, yb + 16 + (stem - 16) * (i / 3)]);
            }
            stalk(g, (pts) => W(pts), path, { hw: 2.3, nodes: [{ at: to ? 0.3 : 0.55, leaves: leaves > 0, k: 1 }], leafLen: 52, leafWid: 7.5, rnd, sd, lw: lw * 0.9, s, k: s });
        }
        // the tongue of petals, still furled: a pointed roll, one petal wrapped across the
        // others, their pinked edges showing only at the tip and along the wrap
        const tongue = (pts, fill, k) => S.piece(g, W(pts), {
            fill, line: lw, heavy: 0.6,
            cast: { blur: 3 * s, dx: 1.4 * s, dy: 2 * s, color: RED.cast },
            shade: [{ color: RED.deep, alpha: 0.9, w: 9 * s, push: 11 * s, dir: [-sR, cR] }, { color: RED.deep, alpha: 0.55, w: 3.6 * s }],
            light: [{ color: RED.light, alpha: 0.75 * k, w: 3 * s }],
        });
        const lean = (rnd() - 0.5) * 3;
        tongue([
            ...S.curve([[-4.8, my + 6], [-5.4, my - 6], [-5.2, my - 17], [-3.2 + lean, my - 26]], false, 6),
            ...pinked(S.curve([[-3.2 + lean, my - 26], [-0.4 + lean, my - 30], [2.6 + lean, my - 31.5]], false, 6), 4, 1.5).slice(1),
            ...S.curve([[2.6 + lean, my - 31.5], [4.6 + lean * 0.5, my - 23], [5.6, my - 12], [5, my + 6]], false, 6).slice(1),
        ], '#b82c38', 0.6);
        tongue([
            ...S.curve([[-5.2, my + 6], [-6.2, my - 5], [-6.2, my - 14], [-4.4 + lean * 0.5, my - 22]], false, 6),
            ...pinked(S.curve([[-4.4 + lean * 0.5, my - 22], [-1, my - 19], [2.6, my - 12], [5.4, my - 2]], false, 6), 6, 1.3).slice(1),
            [5.4, my + 6],
        ], '#d64546', 1);
        blob(g, W([[-7, my + 8], [-7, my - 3], [7, my - 3], [7, my + 8]]), RED.deep, 0.6, 4 * s);
        // the calyx, its teeth just parting, and the scales at its foot
        paintCrown(g, W, rot, cr, { r: 52, k: s, lw, sinus: 6, len, tip: -13, flare: 0.5, cast: 'rgba(40,6,30,0.5)' });
        const P2 = (u, v) => Wp([u, yb + v]);
        for (const sg of [-1, 1]) bract(g, pointed([P2(sg * 5, 1), P2(sg * 9.4, -7)], P2(sg * 9.8, -23), [P2(sg * 5, -11), P2(sg * 2, -2)]), [P2(sg * 5.4, -2), P2(sg * 8.4, -12), P2(sg * 9.6, -21)], lw, 52 * s, S.mix(CALYX.bract, CALYX.fill, 0.5));
        bract(g, pointed([P2(1.4, 3.6), P2(-6.6, -1.6), P2(-7.4, -9)], P2(-2.6, -24), [P2(0.4, -12), P2(2.8, -3)]), [P2(-1.6, 1), P2(-3, -10), P2(-2.7, -22)], lw, 52 * s);
        bract(g, pointed([P2(-1.8, 3.6), P2(-1.2, -6), P2(1.4, -12)], P2(4.6, -21), [P2(7.6, -8), P2(6.6, -0.6)]), [P2(2.8, 1), P2(4.2, -9), P2(4.6, -19)], lw, 52 * s);
    }

    // ================================================================== SPRAY
    function spray(g, o = {}) {
        const { x = 0, y = 0, s = 1, rot = 0, seed = 'ramo', flip = false, tie = true } = o;
        const fx = flip ? -1 : 1, cR = Math.cos(rot), sR = Math.sin(rot);
        const Wp = (p) => [x + (p[0] * fx * cR - p[1] * sR) * s, y + (p[0] * fx * sR + p[1] * cR) * s];
        const knot = [6, 150];
        const stemTo = (dx, spread) => [Wp([knot[0] + dx, knot[1]]), Wp([knot[0] + dx * 2.6 + spread, knot[1] + 34])];
        // two long leaves out of the bunch, behind everything
        const rnd = Motion.rng('ramo/' + seed);
        for (const sg of [-1, 1]) {
            const lf = strap([knot[0] + sg * 3, knot[1] - 6], -Math.PI / 2 + sg * (0.75 + rnd() * 0.2), 118 + rnd() * 24, 9.5, sg * (0.9 + rnd() * 0.5), 2.6, S.seedOf(seed) + sg);
            blade(g, { ...mapGeom(lf, Wp), s }, GLAUC, { fill: S.mix(GLAUC.fill, GLAUC.deep, 0.22), line: S.clamp(1.6 * s, 1.1, 2.4) });
        }
        bud(g, { x: Wp([58, -86])[0], y: Wp([58, -86])[1], s: s * 0.92, rot: rot + fx * 0.2, seed: seed + '/bud', to: stemTo(4, 3), leaves: 1 });
        carnation(g, { x: Wp([-84, 26])[0], y: Wp([-84, 26])[1], r: 40 * s, rot: rot - fx * 0.86, seed: seed + '/c', to: stemTo(-5, -4), leaves: 1 });
        carnation(g, { x: Wp([88, 4])[0], y: Wp([88, 4])[1], r: 46 * s, rot: rot + fx * 0.74, seed: seed + '/b', to: stemTo(7, 6), leaves: 1 });
        carnation(g, { x: Wp([-8, -44])[0], y: Wp([-8, -44])[1], r: 62 * s, rot: rot - fx * 0.1, seed: seed + '/a', to: stemTo(-1, -1), leaves: 1 });
        if (tie) {
            // the binding: a few turns of raffia about the stems
            const lw = S.clamp(1.6 * s, 1.1, 2.4);
            const band = [[-11, -5.5], [0, -4.2], [11, -5.5], [12, 4.5], [0, 6.2], [-12, 4.5]].map(([u, v]) => Wp([knot[0] + u, knot[1] + v]));
            S.piece(g, S.curve(band, true, 5), {
                fill: '#e3cf9d', line: lw, heavy: 0.7,
                cast: { blur: 3 * s, dx: 1.5 * s, dy: 2.4 * s, color: 'rgba(12,16,34,0.55)' },
                shade: { color: '#8a6a3a', alpha: 0.85, w: 5 * s }, light: { color: '#fbf1cf', alpha: 0.8, w: 2.4 * s },
                detail: (q) => {
                    for (const v of [-2.2, 1.2]) S.ink(q, S.curve([[-12, v - 1], [0, v + 0.6], [12, v - 1]].map(([u, w]) => Wp([knot[0] + u, knot[1] + w])), false, 5), { w: lw * 0.55, color: '#7a5a30', alpha: 0.8, taper: [0.2, 0.2] });
                },
            });
        }
    }

    return { olive, carnation, bud, spray, oliveSprite };
})();
