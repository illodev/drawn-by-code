// The emblem's motto ribbon and two charms, in the emblem manner (dark contour + airbrush).
// Global: Ribbon.
//   Ribbon.draw(g, { x, y, s, text, w, h, cap, seed })   a banderole `w` (900) wide from tip
//       to tip, its lettered face `h` (96) tall. Anchor: the middle of the lettered face's
//       box (the face sags 0.42 h: its mid-line is 0.21 h below the anchor in the middle and
//       0.21 h above it at the ends); the whole thing spans about x ±w/2, y −0.7 h … +0.93 h.
//       `cap`: the most the capitals may take of the face (0.52). The lettering is as big as
//       that and the face's length allow; returns { capH, size, spacing, width } (null: no text).
//   Ribbon.key(g, { x, y, s, rot })         an old gilt iron key, 300 long along +x (bow at
//       −150, bit hanging on the +y side near +108), anchor at the middle of the shank
//   Ribbon.horseshoe(g, { x, y, s, rot })   a forged shoe, 150 wide and about as tall, heels
//       up (toe down), anchor at the middle of its box
//   Ribbon.ornament(g, x, y, R, rot, 'star' | 'lozenge')   the lettering's ornaments
//
// The ribbon is one strip of cloth standing on its edge, drawn from a plan: a curve seen
// from above (x across the page, z into it) that runs along the centre face, turns back
// behind itself, runs the other way, turns again and comes forward as a tail. Seen from a
// little below, what is deeper sits lower on the page, so the folds open as real S-folds:
// the front face, the turn, the back face going the other way. Shade comes from that plan
// too (which way each stretch faces the light), then the airbrush works over it.
//
// The key and the horseshoe are lit volumes (`Souvenir.form`) assembled from parts and
// cached per angle and resolution: the light is baked for `rot`, so it stays at the top left.
const Ribbon = (() => {
    const S = Souvenir;
    const COL = {
        ivory: '#f4efe4', tan: '#c9b98c', cool: '#8f8db0', red: '#8f2030', redDeep: '#5a1024',
        gold: '#d9a441', goldLight: '#f6dc8a', goldDeep: '#8a5a17', carn: '#cf3a3c', carnDeep: '#7a1428', carnLight: '#f39a8c',
    };
    const FONT = '"IM Fell DW Pica SC", "IM Fell DW Pica", Georgia, serif';
    const TILT = 0.48; // how much lower a unit of depth sits on the page
    const LX = -0.62, LZ = 0.39; // the house light, across and towards the viewer

    const rampHex = (stops) => {
        const f = S.rampFn(stops, 1), o = [0, 0, 0];
        return (t) => {
            f(S.clamp(t), o);
            return S.rgb2hex(o[0], o[1], o[2]);
        };
    };
    const IVORY = rampHex([[0, '#56537f'], [0.2, '#8f8db0'], [0.45, '#c9b98c'], [0.7, '#f4efe4'], [1, '#fffcf1']]);
    const RED = rampHex([[0, '#27091c'], [0.3, '#5a1024'], [0.62, '#8f2030'], [0.86, '#b6434b'], [1, '#d56a6b']]);
    const HEM = rampHex([[0, '#5c5273'], [0.3, '#a08d6c'], [0.6, '#ead9a6'], [1, '#fff6d6']]);

    // ------------------------------------------------------------------ polylines
    const plen = (pts) => {
        let l = 0;
        for (let i = 1; i < pts.length; i++) l += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
        return l;
    };
    // the point `sd` along a polyline, and the direction there
    const along = (pts, sd) => {
        let i = 1, acc = 0;
        for (; i < pts.length; i++) {
            const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
            if (acc + d >= sd || i === pts.length - 1) {
                const k = (sd - acc) / (d || 1), p = pts[i - 1], q = pts[i];
                return [p[0] + (q[0] - p[0]) * k, p[1] + (q[1] - p[1]) * k, Math.atan2(q[1] - p[1], q[0] - p[0])];
            }
            acc += d;
        }
        return [pts[0][0], pts[0][1], 0];
    };
    // moved `d` to the right of its direction (down the page, for a line drawn left to right)
    const offset = (pts, d) => pts.map((p, i) => {
        const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
        const tx = b[0] - a[0], ty = b[1] - a[1], tl = Math.hypot(tx, ty) || 1;
        return [p[0] - (ty / tl) * d, p[1] + (tx / tl) * d];
    });
    const stroke = (g, pts, color, w, close = false) => {
        g.beginPath();
        S.trace(g, pts, close);
        g.strokeStyle = color;
        g.lineWidth = w;
        g.lineJoin = 'round';
        g.lineCap = 'round';
        g.stroke();
    };
    const star8 = (cx, cy, R, ratio = 0.765, rot = 0) => {
        const pts = [];
        for (let i = 0; i < 16; i++) {
            const a = rot + (i / 16) * Math.PI * 2, r = i % 2 ? R * ratio : R;
            pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
        }
        return pts;
    };

    // ------------------------------------------------------------------ the ribbon's plan
    // Samples along the strip are [x, z, y, occ]: across, depth, the height of its mid-line
    // on the page before the depth is added, and how much of the light reaches it.
    function geometry(w, H, seed) {
        const rnd = Motion.rng('ribbon/' + seed);
        const rX1 = H * 0.16, rZ1 = H * 0.2, rX2 = H * 0.12, rZ2 = H * 0.155, dZb = H * 0.06;
        const tail = H * 0.98, back = H * 0.52;
        const xT = Math.max(w / 2, tail + rX1 + H), xA = xT - tail - rX1, xB = xA - back;
        const sag = Math.min(H * 0.42, xA * 0.124); // 40 on the standard ribbon, less on a short one
        const c1 = Math.cosh(1) - 1;
        const ysag = (ax) => sag * (0.5 - (Math.cosh(ax / xA) - 1) / c1); // a hanging cloth's smile
        const slopeA = (-sag * Math.sinh(1)) / c1 / xA;
        const p1 = rnd() * 6.28, p2 = rnd() * 6.28, waves = S.clamp(xA / (H * 1.4), 0.8, 4) * (0.9 + rnd() * 0.2);
        const rip = (X) => {
            const u = X / xA;
            return H * 0.05 * S.smooth(1, 0.8, Math.abs(u)) * (0.72 * Math.sin(u * Math.PI * waves + p1) + 0.28 * Math.sin(u * Math.PI * waves * 2.2 + p2));
        };
        const Q = Math.PI / 2, N = 12;
        const half = (side) => {
            const drop = H * (0.24 + rnd() * 0.05), rise = H * (0.3 + rnd() * 0.08), zf = H * (0.25 + rnd() * 0.08), wph = (rnd() - 0.5) * 0.9, wlen = 0.5 + rnd() * 0.1, wamp = H * (0.082 + rnd() * 0.02);
            const c = [], b = [], o = [];
            const nC = Math.max(30, Math.round(xA / 5));
            for (let i = 0; i <= nC; i++) {
                const ax = (xA * i) / nC;
                // the face darkens as it nears the fold
                c.push([side * ax, rip(side * ax), ysag(ax), 1 - 0.2 * S.smooth(xA - H * 0.75, xA, ax)]);
            }
            // the first turn: its near quarter still shows the front, its far quarter the back
            const yA = ysag(xA), y1 = yA + slopeA * rX1 * 0.5;
            for (let k = 1; k <= N; k++) {
                const th = (k / N) * Q;
                c.push([side * (xA + rX1 * Math.sin(th)), rZ1 * (1 - Math.cos(th)), yA + slopeA * rX1 * 0.5 * Math.sin(th), 0.8]);
            }
            for (let k = 0; k <= N; k++) {
                const th = Q + (k / N) * Q;
                b.push([side * (xA + rX1 * Math.sin(th)), rZ1 * (1 - Math.cos(th)), y1, 0.45 + 0.35 * (k / N)]);
            }
            // the back face runs the other way, sinking
            const zb = 2 * rZ1 + dZb;
            for (let k = 1; k <= N; k++) {
                const p = k / N;
                b.push([side * (xA - back * p), 2 * rZ1 + dZb * p, y1 + drop * S.smooth(0, 1, p), 0.82]);
            }
            for (let k = 1; k <= N; k++) {
                const th = (k / N) * Q;
                b.push([side * (xB - rX2 * Math.sin(th)), zb + rZ2 * (1 - Math.cos(th)), y1 + drop, 0.82]);
            }
            for (let k = 0; k <= N; k++) {
                const th = Q + (k / N) * Q;
                o.push([side * (xB - rX2 * Math.sin(th)), zb + rZ2 * (1 - Math.cos(th)), y1 + drop, 0.5 + 0.35 * (k / N)]);
            }
            // the tail comes forward again (so it rises), with one wave between the place where
            // it comes out from behind the centre face (`pe`, in the centre face's shade) and its tips
            const zc = zb + 2 * rZ2, nO = 60, pe = (back + rX1) / (xT - xB);
            for (let k = 1; k <= nO; k++) {
                const p = k / nO;
                const z = zc - (zc - zf) * S.smooth(0.04, 0.84, p) + wamp * Math.sin((6.2832 * (p - pe)) / wlen + wph) * S.smooth(pe - 0.14, pe + 0.1, p);
                o.push([side * (xB + (xT - xB) * p), z, y1 + drop - rise * S.smooth(0.08, 1, p), 0.5 + 0.5 * S.smooth(pe - 0.06, pe + 0.24, p)]);
            }
            return { c, b, o };
        };
        const toFace = (smp, front, gain = 1) => {
            const n = smp.length, top = [], bot = [], tone = [], nrm = [];
            for (let i = 0; i < n; i++) {
                const [X, Z, Y, occ] = smp[i];
                const a = smp[Math.max(0, i - 1)], b = smp[Math.min(n - 1, i + 1)];
                let tx = b[0] - a[0], tz = b[1] - a[1];
                const tl = Math.hypot(tx, tz) || 1;
                tx /= tl;
                tz /= tl;
                // the side that faces the viewer: how far it turns to the left or the right
                const Nv = Math.abs(tx), Nx = S.clamp(tz * (tx < 0 ? -1 : 1) * (1 + (gain - 1) * Math.pow(Nv, 6)), -1, 1);
                const yy = Y + Z * TILT;
                top.push([X, yy - H / 2]);
                bot.push([X, yy + H / 2]);
                tone.push(S.clamp((0.5 + 0.5 * (Nx * LX + Nv * LZ) - 0.3 * Math.pow(1 - Nv, 1.6)) * occ));
                nrm.push([tz, -tx]);
            }
            return { top, bot, tone, nrm, front, cap: [] };
        };
        const Lh = half(-1), Rh = half(1);
        const c = toFace([...Lh.c.slice(1).reverse(), ...Rh.c], true, 4.2);
        const faces = [toFace(Lh.o, true, 1.3), toFace(Rh.o, true, 1.3), toFace(Lh.b, false), toFace(Rh.b, false), c];
        // swallowtails: a V cut into each tail's end
        for (const [F, side] of [[faces[0], -1], [faces[1], 1]]) {
            const n = F.top.length, t = F.top[n - 1], b = F.bot[n - 1];
            F.cap = [[t[0] - side * H * 0.4, (t[1] + b[1]) / 2 + H * 0.03]];
        }
        // the lettered stretch: the centre face's mid-line, clear of the turns
        const xL = xA - H * 0.1, mid = [];
        for (let i = 0; i < c.top.length; i++) if (Math.abs(c.top[i][0]) <= xL) mid.push([c.top[i][0], (c.top[i][1] + c.bot[i][1]) / 2]);
        return { faces, mid, xA, xB, xT, H };
    }

    // ------------------------------------------------------------------ painting a face
    function face(g, F, H, key) {
        const { top, bot, tone, front, cap } = F;
        const pts = [...top, ...cap, ...bot.slice().reverse()];
        let x0 = 1e9, x1 = -1e9;
        for (const p of top) {
            if (p[0] < x0) x0 = p[0];
            if (p[0] > x1) x1 = p[0];
        }
        const at = (i) => S.clamp((top[i][0] - x0) / (x1 - x0));
        const ramp = front ? IVORY : RED;
        const rnd = Motion.rng('face/' + key);
        const inset = H * 0.085;
        S.piece(g, pts, {
            fill: { from: [x0, 0], to: [x1, 0], stops: tone.map((t, i) => [at(i), ramp(t)]) },
            line: H * 0.027, heavy: 0.9,
            cast: { blur: H * 0.09, dx: H * 0.04, dy: H * 0.08, color: 'rgba(24,14,46,0.66)' },
            detail: (q) => {
                const midl = top.map((p, i) => [p[0], (p[1] + bot[i][1]) / 2]);
                if (front) {
                    // the brush along the cloth: pale streaks high, warm ones low
                    const n = Math.max(3, Math.round(plen(midl) / (H * 0.9)));
                    for (let k = 0; k < n; k++) {
                        const v = rnd() - 0.5, a = Math.floor(rnd() * midl.length * 0.6), b = Math.min(midl.length, a + 6 + Math.floor(rnd() * midl.length * 0.5));
                        if (b - a < 4) continue;
                        S.dab(q, midl.slice(a, b).map(([x, y]) => [x, y + v * H * 0.62]), { w: H * (0.05 + rnd() * 0.07), color: v < 0 ? '#fffdf4' : '#d3c397', alpha: 0.2 + rnd() * 0.18, bristles: 6, seed: key + '/' + k, dry: 0.5 });
                    }
                    // the woven gold border
                    for (const [edge, sg] of [[top, 1], [bot, -1]]) {
                        const line = edge.map(([x, y]) => [x, y + sg * inset]);
                        stroke(q, line, COL.goldDeep, H * 0.04);
                        stroke(q, line, COL.gold, H * 0.026);
                        stroke(q, line.map(([x, y]) => [x, y - H * 0.007]), COL.goldLight, H * 0.008);
                    }
                    // shade from underneath, warm, then the cool of the deep folds close to the edge
                    S.spray(q, pts, { color: '#b09862', alpha: 0.8, w: H * 0.27 });
                    S.spray(q, pts, { color: COL.cool, alpha: 0.62, w: H * 0.09 });
                    S.spray(q, pts, { color: '#fffdf2', alpha: 0.9, w: H * 0.13, dir: [-0.35, -0.94] });
                } else {
                    // the border shows through on the back, tone on tone
                    stroke(q, bot.map(([x, y]) => [x, y - inset]), 'rgba(58,6,26,0.5)', H * 0.024);
                    S.spray(q, pts, { color: COL.redDeep, alpha: 0.9, w: H * 0.22 });
                    S.spray(q, pts, { color: '#27091c', alpha: 0.6, w: H * 0.08 });
                    S.spray(q, pts, { color: '#e58a84', alpha: 0.4, w: H * 0.1, dir: [-0.35, -0.94] });
                }
            },
        });
        // the cloth's own thickness, seen from below along its lower edge: a pale sliver that
        // widens where the strip turns away
        const th = H * 0.019, a = [], b = [];
        for (let i = 0; i < bot.length; i++) {
            const [nx, nz] = F.nrm[i];
            a.push([bot[i][0] + nx * th, bot[i][1] + nz * th * TILT]);
            b.push([bot[i][0] - nx * th, bot[i][1] - nz * th * TILT]);
        }
        const hem = [...a, ...b.reverse()];
        const gr = g.createLinearGradient(x0, 0, x1, 0);
        tone.forEach((t, i) => gr.addColorStop(at(i), HEM(t * 0.8 + 0.2)));
        g.beginPath();
        S.trace(g, hem);
        g.fillStyle = gr;
        g.fill();
        stroke(g, hem, S.INK, H * 0.008, true);
    }

    // ------------------------------------------------------------------ ornaments
    function ornament(g, x, y, R, rot, kind) {
        const pts = kind === 'star' ? star8(x, y, R, 0.52, rot - Math.PI / 2) : S.xf([[0, -R], [R * 0.6, 0], [0, R], [-R * 0.6, 0]], { x, y, rot });
        S.piece(g, pts, { fill: COL.carn, line: Math.max(0.8, R * 0.1), heavy: 0.8, shade: { color: COL.carnDeep, alpha: 0.9, w: R * 0.5 }, light: { color: COL.carnLight, alpha: 0.85, w: R * 0.28 } });
        if (kind === 'star') S.piece(g, S.ellipse(x, y, R * 0.2, R * 0.2, 14), { fill: COL.gold, line: Math.max(0.6, R * 0.07), shade: { color: COL.goldDeep, alpha: 0.9, w: R * 0.14 }, light: { color: '#fff3c0', alpha: 0.9, w: R * 0.08 } });
    }

    // ------------------------------------------------------------------ lettering
    // The motto on the centre face: set on its curve, as large as the face and the text
    // allow (first the letterspacing gives way, then the size), a star at both ends and
    // between two words (lozenges between more than two).
    function letter(g, G, text, cap) {
        const H = G.H, words = String(text).trim().split(/\s+/).filter(Boolean);
        if (!words.length) return null;
        g.save();
        g.font = `100px ${FONT}`;
        g.textBaseline = 'alphabetic';
        const capR = (g.measureText('H').actualBoundingBoxAscent || 68) / 100;
        const all = g.measureText(words.join(''));
        const overR = Math.max(0, all.actualBoundingBoxAscent / 100 - capR), descR = Math.max(0, all.actualBoundingBoxDescent / 100);
        const wR = words.map((wd) => [...wd].reduce((s, ch) => s + g.measureText(ch).width / 100, 0));
        const nCh = words.reduce((s, wd) => s + [...wd].length, 0);
        g.restore();
        const stars = words.length <= 2;
        const endR = 0.33 * capR, sepR = (stars ? 0.33 : 0.2) * capR, sepW = stars ? 2 * sepR : 1.2 * sepR, gapE = 0.2, gapS = stars ? 0.17 : 0.13;
        // everything in ems: the whole line is size × K(letterspacing)
        const K = (sp) => wR.reduce((a, b) => a + b, 0) + sp * nCh + 4 * endR + 2 * gapE + (words.length - 1) * (sepW + 2 * gapS);
        const room = H / 2 - H * 0.085 - H * 0.035 - H * 0.05; // from the mid-line to the gold line, with air
        const lift = descR * 0.3;
        let size = Math.min((H * cap) / capR, room / (capR / 2 + Math.max(overR, descR - lift)));
        const avail = plen(G.mid) - H * 0.12;
        let sp = 0.15;
        if (size * K(sp) > avail) {
            sp = (avail / size - K(0)) / nCh;
            if (sp < 0.07) {
                sp = 0.07;
                size = avail / K(sp);
            }
        }
        const capH = capR * size;
        const base = offset(G.mid, capH / 2 - lift * size), len = plen(base);
        const total = size * K(sp);
        const font = `${size.toFixed(3)}px ${FONT}`;
        const m0 = g.getTransform(), a0 = Math.atan2(m0.b, m0.a);
        const d = size * 0.04;
        const glyph = (q, ch) => {
            // the sign-painter's shade: a fine red line down and to the right, on the page
            const m = q.getTransform(), a = Math.atan2(m.b, m.a) - a0, c = Math.cos(a), s = Math.sin(a);
            q.fillStyle = COL.carn;
            q.fillText(ch, (0.74 * c + 0.67 * s) * d, (-0.74 * s + 0.67 * c) * d);
            q.fillStyle = S.INK;
            q.fillText(ch, 0, 0);
        };
        // lay it out along the baseline: `sd` is how far along it the next thing starts
        let sd = (len - total) / 2;
        const orn = (wEm, R, kind) => {
            const [x, y, a] = along(base, sd + (wEm * size) / 2);
            ornament(g, x + Math.sin(a) * capH * 0.5, y - Math.cos(a) * capH * 0.5, R * size, a, kind);
            sd += wEm * size;
        };
        orn(2 * endR, endR, 'star');
        sd += gapE * size;
        words.forEach((wd, i) => {
            const tw = (wR[i] + sp * [...wd].length) * size;
            S.textOn(g, wd, base, { font, spacing: sp * size, glyph, align: Math.abs(len - tw) < 1e-6 ? 0.5 : sd / (len - tw) });
            sd += tw;
            if (i < words.length - 1) {
                sd += gapS * size;
                orn(sepW, sepR, stars ? 'star' : 'lozenge');
                sd += gapS * size;
            }
        });
        sd += gapE * size;
        orn(2 * endR, endR, 'star');
        return { size, capH, spacing: sp, width: total };
    }

    function draw(g, o = {}) {
        const { x = 0, y = 0, s = 1, text = 'SONIDOS NEGROS', w = 900, h = 96, cap = 0.52, seed = 'ribbon' } = o;
        g.save();
        g.translate(x, y);
        g.scale(s, s);
        const G = geometry(w, h, seed);
        G.faces.forEach((F, i) => face(g, F, h, seed + '/' + i));
        const info = letter(g, G, text, cap);
        g.restore();
        return info;
    }

    // ------------------------------------------------------------------ forged things
    // The two charms are lit volumes (`Souvenir.form`), built from several parts on one
    // canvas, each part with its ink contour and its shadow on the parts under it.
    const cache = new Map();
    const memo = (key, fn) => {
        if (!cache.has(key)) cache.set(key, fn());
        return cache.get(key);
    };
    const resOf = (g, s) => Math.min(6, Math.max(1, Math.ceil(S.pxScale(g) * s * 2 - 1e-6) / 2));
    const even = (b) => {
        const x = Math.floor(b.x / 2) * 2, y = Math.floor(b.y / 2) * 2;
        return { x, y, w: Math.ceil((b.x + b.w - x) / 2) * 2, h: Math.ceil((b.y + b.h - y) / 2) * 2 };
    };
    // a direction on the page, as a sprite that will be pasted turned by `rot` sees it
    const local = (v, rot) => {
        const c = Math.cos(-rot), s = Math.sin(-rot);
        return [v[0] * c - v[1] * s, v[0] * s + v[1] * c];
    };
    // A scalar field painted with the canvas (strokes, blobs, blur) and read back per pixel:
    // grooves and dents are easier to draw than to write as a formula. Returns (x, y) → 0..1.
    function field(box, res, paint, bg = '#000') {
        const w = Math.ceil(box.w * res), h = Math.ceil(box.h * res);
        const c = document.createElement('canvas');
        c.width = w;
        c.height = h;
        const q = c.getContext('2d', { willReadFrequently: true });
        q.fillStyle = bg;
        q.fillRect(0, 0, w, h);
        q.setTransform(res, 0, 0, res, -box.x * res, -box.y * res);
        paint(q, res);
        const d = q.getImageData(0, 0, w, h).data;
        return (x, y) => d[(Math.min(h - 1, Math.max(0, Math.round((y - box.y) * res))) * w + Math.min(w - 1, Math.max(0, Math.round((x - box.x) * res)))) * 4] / 255;
    }
    // Lays a sprite on the assembly canvas the emblem way: its shadow on what is already
    // there, its silhouette in ink a line's width bigger (and heavier towards `sh`), itself.
    function stamp(G, sp, { lw = 2.2, sh = S.SHADE_DIR, heavy = 0.75, cast = null, ink = S.INK } = {}) {
        const b = sp.box;
        const sil = document.createElement('canvas');
        sil.width = sp.canvas.width;
        sil.height = sp.canvas.height;
        const q = sil.getContext('2d');
        q.drawImage(sp.canvas, 0, 0);
        q.globalCompositeOperation = 'source-in';
        q.fillStyle = ink;
        q.fillRect(0, 0, sil.width, sil.height);
        if (cast) S.cast(G, (c) => c.drawImage(sil, b.x, b.y, b.w, b.h), cast);
        const d = lw * 0.8;
        for (const [ox, oy] of [[0, 0], [sh[0] * lw * heavy * 0.5, sh[1] * lw * heavy * 0.5], [sh[0] * lw * heavy, sh[1] * lw * heavy]]) {
            for (let k = 0; k < 16; k++) G.drawImage(sil, b.x + ox + Math.cos(k * 0.3927) * d, b.y + oy + Math.sin(k * 0.3927) * d, b.w, b.h);
        }
        G.drawImage(sp.canvas, b.x, b.y, b.w, b.h);
    }
    const assembly = (box, res) => {
        const c = document.createElement('canvas');
        c.width = Math.ceil(box.w * res);
        c.height = Math.ceil(box.h * res);
        const G = c.getContext('2d');
        G.setTransform(res, 0, 0, res, -box.x * res, -box.y * res);
        return { canvas: c, G };
    };
    const poly = (g, pts) => {
        g.beginPath();
        S.trace(g, pts);
        g.fill();
    };
    const cut = (g, fn) => {
        g.save();
        g.globalCompositeOperation = 'destination-out';
        g.fillStyle = '#000';
        fn(g);
        g.restore();
    };
    // the half-way direction between the light and the eye: where a clean highlight sits
    const halfway = (L) => {
        const l = Math.hypot(L[0], L[1], L[2]), h = [L[0] / l, L[1] / l, L[2] / l + 1], hl = Math.hypot(h[0], h[1], h[2]);
        return [h[0] / hl, h[1] / hl, h[2] / hl];
    };

    // The airbrush on a sprite: colour sprayed in from its own edges (holes included), `w`
    // units deep, from the side `dir` points to. What `Souvenir.spray` does for a polygon.
    function sprayIn(sp, res, { color, alpha = 0.5, w = 6, push = null, dir = S.SHADE_DIR }) {
        const c = sp.canvas, d = (push ?? w * 0.6) * res, pad = Math.ceil(w * res * 2 + d), BIG = 20000;
        const inv = document.createElement('canvas');
        inv.width = c.width + pad * 2;
        inv.height = c.height + pad * 2;
        const q = inv.getContext('2d');
        q.fillStyle = '#000';
        q.fillRect(0, 0, inv.width, inv.height);
        q.globalCompositeOperation = 'destination-out';
        q.drawImage(c, pad, pad);
        const g = c.getContext('2d');
        g.save();
        g.setTransform(1, 0, 0, 1, 0, 0);
        g.globalCompositeOperation = 'source-atop';
        g.shadowColor = S.rgba(color, alpha);
        g.shadowBlur = w * res;
        g.shadowOffsetX = BIG - dir[0] * d;
        g.shadowOffsetY = -dir[1] * d;
        g.drawImage(inv, -pad - BIG, -pad);
        g.restore();
    }
    // paints on a finished sprite, in its units, inside its silhouette
    const onto = (sp, res, fn) => {
        const g = sp.canvas.getContext('2d');
        g.save();
        g.setTransform(res, 0, 0, res, -sp.box.x * res, -sp.box.y * res);
        g.globalCompositeOperation = 'source-atop';
        fn(g);
        g.restore();
    };

    // ------------------------------------------------------------------ the key
    // An old iron key, gilded: bow to the left, bit down at the right end, along +x.
    const GILT = [[0, '#1e1226'], [0.14, '#3a2440'], [0.4, '#5a3a22'], [0.57, '#9c6a1e'], [0.7, '#d9a441'], [0.87, '#f6dc8a'], [1, '#fff6d2']];
    const GLINT = '#fff8d6';
    // gilt rubbed back to the iron in slow patches, and pitted
    const wear = (seed, amount = 0.5) => (x, y, tone, rgb, m) => {
        const n = S.noise2(x * 0.05, y * 0.05, seed) * 0.6 + S.noise2(x * 0.16, y * 0.16, seed + 1) * 0.4;
        let k = S.smooth(0.12, 0.6, n + (1 - m) * 0.2 + (0.6 - tone) * 0.5) * amount;
        const cx = Math.floor(x / 2.3), cy = Math.floor(y / 2.3), h = S.hashI(cx, cy, 3, seed);
        if (h > 0.82) {
            const px = (cx + 0.25 + 0.5 * S.hashI(cx, cy, 4, seed)) * 2.3, py = (cy + 0.25 + 0.5 * S.hashI(cx, cy, 5, seed)) * 2.3, rr = 0.22 + 0.62 * Math.pow(S.hashI(cx, cy, 6, seed), 2.4);
            k = Math.max(k, S.smooth(rr, rr * 0.4, Math.hypot(x - px, (y - py) * 1.3)) * (0.55 + 0.4 * S.hashI(cx, cy, 7, seed)));
        }
        const f = 0.5 + 0.8 * tone;
        rgb[0] += (84 * f - rgb[0]) * k;
        rgb[1] += (50 * f - rgb[1]) * k;
        rgb[2] += (44 * f - rgb[2]) * k;
    };

    function keySprite(rot, res) {
        return memo(`key/${rot.toFixed(2)}@${res}`, () => {
            const L = S.lightFor(rot), sh = local(S.SHADE_DIR, rot), lit = [-sh[0], -sh[1]], hv = halfway(L);
            const box = { x: -162, y: -58, w: 324, h: 132 };
            const { canvas, G } = assembly(box, res);
            const cast = { blur: 3.2, dx: sh[0] * 3, dy: sh[1] * 3, color: 'rgba(20,10,34,0.66)' };
            // One part: a lit volume, the airbrush over it (shade from the shadow side, a warm
            // light from the other), then what is drawn on it. Round bars and turned rings get
            // their surface from a formula (`height`) instead of a balloon over their outline:
            // a ring turned on a bar is a torus seen edge-on, which a balloon is not.
            const part = (pts, mask, o = {}, air = 5, marks = null) => {
                const sp = S.form({
                    box: even(S.bbox(pts, 8)), res, light: L, ramp: GILT, soft: 1, mask, inflate: 'none',
                    mottle: { amp: 0.05, freq: 0.06 }, spec: { amp: 0.6, power: 26, from: 0.5, to: 0.95, color: '#fff3c4' }, ...o,
                });
                sprayIn(sp, res, { color: '#6b3f1c', alpha: 0.6, w: air * 1.7, dir: sh });
                sprayIn(sp, res, { color: '#3a2440', alpha: 0.85, w: air * 0.8, dir: sh });
                sprayIn(sp, res, { color: '#ffe9a6', alpha: 0.7, w: air * 0.5, dir: lit });
                // the ground's light thrown back into the shadow's edge keeps it off the night
                sprayIn(sp, res, { color: '#b8742c', alpha: 0.75, w: 1.5, push: 0.5, dir: sh });
                if (marks) onto(sp, res, marks);
                stamp(G, sp, { sh, cast });
            };
            const pill = (x0, x1, hh) => {
                const r = Math.min((x1 - x0) / 2, hh), pts = [], q = Math.PI / 16;
                for (let k = 0; k <= 8; k++) pts.push([x1 - r + Math.sin(k * q) * r, -hh + r - Math.cos(k * q) * r]);
                for (let k = 0; k <= 8; k++) pts.push([x1 - r + Math.cos(k * q) * r, hh - r + Math.sin(k * q) * r]);
                for (let k = 0; k <= 8; k++) pts.push([x0 + r - Math.sin(k * q) * r, hh - r + Math.cos(k * q) * r]);
                for (let k = 0; k <= 8; k++) pts.push([x0 + r - Math.cos(k * q) * r, -hh + r - Math.sin(k * q) * r]);
                return pts;
            };
            const root = (v) => Math.sqrt(Math.max(0, v));
            // a bar with round ends along x, and a ring turned on the bar (a torus seen edge-on)
            const capsule = (x0, x1, r) => (x, y) => {
                const dx = x < x0 + r ? x0 + r - x : x > x1 - r ? x - x1 + r : 0;
                return 1.1 * root(r * r - y * y - dx * dx);
            };
            const torus = (x0, x1, hh) => (x, y) => {
                const hw = (x1 - x0) / 2, t = root(hw * hw - (x - x0 - hw) * (x - x0 - hw));
                return 1.1 * root((hh - hw + t) * (hh - hw + t) - y * y);
            };
            // a clean highlight along a round bar of half-height `hh`
            const gy = (hh) => (hh * hv[1]) / Math.hypot(hv[1], hv[2]);
            const barGlint = (g, x0, x1, hh) => S.ink(g, [[x0, gy(hh)], [(x0 + x1) / 2, gy(hh)], [x1, gy(hh)]], { w: hh * 0.2, color: GLINT, alpha: 0.92 });
            const dot = (g, x, y, r) => {
                g.fillStyle = GLINT;
                g.beginPath();
                g.ellipse(x, y, r, r * 0.55, Math.atan2(hv[1], hv[0]) + Math.PI / 2, 0, 6.2832);
                g.fill();
            };
            // 1 · the bit: a plate with its wards filed out, and a cut cross
            // (cut by hand: no corner is quite square, every corner a little eased)
            const rb = Motion.rng('key-bit');
            const eased = (pts, r) => pts.flatMap((p, i) => {
                const a = pts[(i + pts.length - 1) % pts.length], b = pts[(i + 1) % pts.length];
                const la = Math.hypot(a[0] - p[0], a[1] - p[1]), lb = Math.hypot(b[0] - p[0], b[1] - p[1]);
                return [[p[0] + ((a[0] - p[0]) / la) * r, p[1] + ((a[1] - p[1]) / la) * r], [p[0] + ((b[0] - p[0]) / lb) * r, p[1] + ((b[1] - p[1]) / lb) * r]];
            });
            const bit = eased([[82, 0], [134, 0], [134, 22], [126.5, 22], [126.5, 29], [134, 29], [134, 47], [127, 47], [127, 60], [122, 60], [122, 43], [116, 43], [116, 60], [98, 60], [98, 35], [92, 35], [92, 60], [82, 60]].map(([x, y]) => [x + (y > 1 ? (rb() - 0.5) * 1.1 : 0), y + (y > 1 ? (rb() - 0.5) * 1.1 : 0)]), 0.8);
            // the cross: its arms flare a little towards their ends
            const cross = eased([[105.2, 11], [108.8, 11], [108.3, 17.2], [114.6, 16.7], [114.6, 22.3], [108.3, 21.8], [109, 33], [105, 33], [105.7, 21.8], [99.4, 22.3], [99.4, 16.7], [105.7, 17.2]], 0.5);
            part(bit, (g) => {
                poly(g, bit);
                cut(g, (q) => poly(q, cross));
            }, { inflate: 'bevel', R: 2.6, relief: 1.1, smooth: 0.003, tint: wear(11, 0.5), height: (x, y) => 0.35 * S.noise2(x * 0.22, y * 0.22, 4), occl: { amp: 0.3, dir: sh, reach: 0.35 } }, 6, (g) => {
                // file marks across the plate
                for (let k = 0; k < 7; k++) S.ink(g, [[84 + k * 7, 8 + (k % 3) * 2], [88 + k * 7, 56 - (k % 2) * 6]], { w: 0.5, color: '#4a2f24', alpha: 0.28 });
            });
            // 2 · the shank, a long round bar, and its pin
            const shank = [[-60, -6.9], [141, -6.1], [141, 6.1], [-60, 6.9]];
            const rAt = (x) => 6.9 - (0.8 * (x + 60)) / 201;
            part(shank, (g) => poly(g, shank), { tint: wear(12, 0.4), height: (x, y) => 1.1 * root(rAt(x) * rAt(x) - y * y) }, 4.4, (g) => {
                barGlint(g, -16, 50, 6.6);
                barGlint(g, 57, 76, 6.3);
                barGlint(g, 90, 131, 6.2);
            });
            const nose = pill(137, 150.5, 5.3);
            part(nose, (g) => poly(g, nose), { tint: wear(13, 0.4), height: capsule(137, 150.5, 5.3) }, 3.6, (g) => dot(g, 146 + hv[0] * 2.4, hv[1] * 2.8, 1.3));
            const ring = (x0, x1, hh, seed) => {
                const p = pill(x0, x1, hh);
                part(p, (g) => poly(g, p), { tint: wear(seed, 0.3), height: torus(x0, x1, hh) }, Math.min(5, hh * 0.45), (g) => dot(g, (x0 + x1) / 2 + hv[0] * (x1 - x0) * 0.2, hv[1] * hh * 0.66, Math.min(1.8, (x1 - x0) * 0.17)));
            };
            ring(133.5, 139.5, 8.6, 14);
            // 3 · the collar: a sleeve with turned rings
            const sleeve = pill(-60, -17, 8.4);
            part(sleeve, (g) => poly(g, sleeve), { tint: wear(15, 0.5), height: capsule(-60, -17, 8.4) }, 4.6);
            ring(-28.5, -20.5, 10.6, 16);
            ring(-45.5, -31, 13.6, 17);
            ring(-57.5, -48.5, 11.2, 18);
            // 4 · the bow: four rings about a boss, a bead in every crotch, a star cut through
            const C = [-101, 0], lobes = [[-125, 0], [-77, 0], [-101, -24], [-101, 24]];
            const eye = ([lx, ly]) => [C[0] + (lx - C[0]) * 1.1, C[1] + (ly - C[1]) * 1.1];
            const bowPts = [[-151, -46], [-56, -46], [-56, 46], [-151, 46]];
            part(bowPts, (g) => {
                g.beginPath();
                for (const [lx, ly] of lobes) {
                    g.moveTo(lx + 19.5, ly);
                    g.arc(lx, ly, 19.5, 0, 6.2832);
                }
                for (let k = 0; k < 4; k++) {
                    const a = 0.7854 + k * 1.5708, bx = C[0] + Math.cos(a) * 28.6, by = C[1] + Math.sin(a) * 28.6;
                    g.moveTo(bx + 4.3, by);
                    g.arc(bx, by, 4.3, 0, 6.2832);
                }
                g.moveTo(-140.8, 0);
                g.arc(-145.6, 0, 4.8, 0, 6.2832);
                g.fill();
                cut(g, (q) => {
                    q.beginPath();
                    for (const l of lobes) {
                        const [hx, hy] = eye(l);
                        q.moveTo(hx + 8, hy);
                        q.arc(hx, hy, 8, 0, 6.2832);
                    }
                    q.fill();
                    poly(q, star8(C[0], C[1], 12.4, 0.56, 0));
                });
            }, { inflate: 'bevel', R: 4.7, profile: 'dome', relief: 1.05, smooth: 0.003, tint: wear(19, 0.42), height: (x, y) => 0.4 * S.noise2(x * 0.1, y * 0.1, 6), occl: { amp: 0.16, dir: sh, reach: 0.4 } }, 5.5, (g) => {
                // chased lines: a ring about the star, one about every eye
                for (const [col, lw, dx, dy] of [['rgba(44,24,40,0.7)', 0.9, 0, 0], ['rgba(255,240,180,0.34)', 0.6, sh[0] * 0.8, sh[1] * 0.8]]) {
                    g.strokeStyle = col;
                    g.lineWidth = lw;
                    g.beginPath();
                    g.arc(C[0] + dx, C[1] + dy, 16, 0, 6.2832);
                    g.stroke();
                    for (const l of lobes) {
                        const [hx, hy] = eye(l);
                        g.beginPath();
                        g.arc(hx + dx, hy + dy, 11.7, 0, 6.2832);
                        g.stroke();
                    }
                }
                // clean highlights where each ring's rim turns to the light
                const la = Math.atan2(hv[1], hv[0]);
                for (const [lx, ly] of lobes) {
                    const arc = [];
                    for (let k = 0; k <= 10; k++) arc.push([lx + Math.cos(la - 0.45 + 0.09 * k) * 17, ly + Math.sin(la - 0.45 + 0.09 * k) * 17]);
                    S.ink(g, arc, { w: 1.5, color: GLINT, alpha: 0.9 });
                }
            });
            return { canvas, box };
        });
    }
    function key(g, o = {}) {
        const { x = 0, y = 0, s = 1, rot = 0 } = o;
        const sp = keySprite(Math.round(rot * 100) / 100, resOf(g, s));
        S.cast(g, (q) => S.put(q, sp, { x, y, rot, s }), { blur: 7 * s, dx: 3 * s, dy: 6 * s, color: 'rgba(20,12,40,0.55)' });
        S.put(g, sp, { x, y, rot, s });
    }

    // ------------------------------------------------------------------ the horseshoe
    // Forged iron, seen from the ground side: the fullered groove with its seven nail holes
    // (four on one branch, three on the other), calkins on the heels, a toe clip. Heels up.
    const IRON = [[0, '#12142a'], [0.25, '#242947'], [0.5, '#434b6b'], [0.7, '#6f7892'], [0.86, '#a2aac2'], [1, '#e6e9f2']];
    function shoeSprite(rot, res) {
        return memo(`shoe/${rot.toFixed(2)}@${res}`, () => {
            const L = S.lightFor(rot), sh = local(S.SHADE_DIR, rot), lit = [-sh[0], -sh[1]];
            // (forged by hand: one branch a little wider than the other, the web not quite even)
            const A0 = 61.5, B = 71, PM = 2.3, Y0 = 52;
            const webAt = (ph) => (27 - 6 * Math.pow(Math.abs(ph) / PM, 1.5)) * (1 + 0.035 * Motion.noise1('shoe-web', ph * 1.9));
            const ctr = (ph, off = 0) => {
                const A = A0 * (1 + 0.024 * Math.sin(ph * 0.68));
                const tx = A * Math.cos(ph), ty = -B * Math.sin(ph), tl = Math.hypot(tx, ty);
                return [A * Math.sin(ph) - (ty / tl) * off, Y0 - B * (1 - Math.cos(ph)) + (tx / tl) * off];
            };
            const outer = [], inner = [];
            for (let i = 0; i <= 90; i++) {
                const ph = -PM + (2 * PM * i) / 90;
                outer.push(ctr(ph, webAt(ph) / 2));
                inner.push(ctr(ph, -webAt(ph) / 2));
            }
            const band = [...outer, ...inner.reverse()];
            const box = even(S.bbox(band, 14));
            const { canvas, G } = assembly(box, res);
            const cast = { blur: 3.2, dx: sh[0] * 3, dy: sh[1] * 3.4, color: 'rgba(14,12,34,0.66)' };
            const rnd = Motion.rng('horseshoe');
            // rust blooms: slow patches with a darker heart, and fine pits of scale
            const rust = (seed, amount = 0.85, extra = null) => (x, y, tone, rgb) => {
                const n = S.noise2(x * 0.03, y * 0.03, seed) * 0.62 + S.noise2(x * 0.1, y * 0.1, seed + 1) * 0.3 + S.noise2(x * 0.5, y * 0.5, seed + 2) * 0.08 + (extra ? extra(x, y) : 0);
                const k = S.smooth(0.04, 0.44, n) * amount, deep = S.smooth(0.3, 0.6, n), f = 0.45 + 0.85 * tone;
                rgb[0] += ((154 - 54 * deep) * f - rgb[0]) * k;
                rgb[1] += ((90 - 36 * deep) * f - rgb[1]) * k;
                rgb[2] += ((58 - 18 * deep) * f - rgb[2]) * k;
                const cx = Math.floor(x / 2.6), cy = Math.floor(y / 2.6), h = S.hashI(cx, cy, 3, seed);
                if (h > 0.92) {
                    const px = (cx + 0.25 + 0.5 * S.hashI(cx, cy, 4, seed)) * 2.6, py = (cy + 0.25 + 0.5 * S.hashI(cx, cy, 5, seed)) * 2.6, rr = 0.25 + 0.55 * Math.pow(S.hashI(cx, cy, 6, seed), 2);
                    const p = S.smooth(rr, rr * 0.4, Math.hypot(x - px, y - py)) * 0.5;
                    rgb[0] *= 1 - p;
                    rgb[1] *= 1 - p;
                    rgb[2] *= 1 - p * 0.9;
                }
            };
            const air = (sp, w) => {
                sprayIn(sp, res, { color: '#2b2a52', alpha: 0.6, w: w * 1.6, dir: sh });
                sprayIn(sp, res, { color: '#141631', alpha: 0.85, w: w * 0.7, dir: sh });
                sprayIn(sp, res, { color: '#e3e8f6', alpha: 0.65, w: w * 0.5, dir: lit });
                sprayIn(sp, res, { color: '#7d86a6', alpha: 0.7, w: 1.5, push: 0.5, dir: sh });
            };
            // 1 · the toe clip, drawn up from the toe (it lies behind the web)
            const clip = S.curve([[-13, Y0 + 8], [-7.5, Y0 + 19], [0, Y0 + 23], [7.5, Y0 + 19], [13, Y0 + 8], [0, Y0 + 4]], true, 6);
            const clipSp = S.form({ box: even(S.bbox(clip, 8)), res, light: L, ramp: IRON, soft: 1, mask: (g) => poly(g, clip), relief: 0.6, tint: rust(31, 0.6) });
            air(clipSp, 4);
            stamp(G, clipSp, { sh });
            // 2 · the web: the groove, the nail holes in it, hammer marks
            const PG = 1.84, groove = [];
            for (let i = 0; i <= 80; i++) groove.push(ctr(-PG + (2 * PG * i) / 80, 2.2));
            const nails = [-1.52, -1.17, -0.82, -0.47, 0.52, 0.9, 1.28];
            const dents = field(box, res, (q) => {
                q.filter = `blur(${(1.7 * res).toFixed(1)}px)`;
                for (let i = 0; i < 60; i++) {
                    const ph = (rnd() * 2 - 1) * PM, [x, y] = ctr(ph, (rnd() - 0.5) * 20);
                    q.fillStyle = rnd() < 0.5 ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)';
                    q.beginPath();
                    q.ellipse(x, y, 4 + rnd() * 6, 3 + rnd() * 4, rnd() * 3.14, 0, 6.2832);
                    q.fill();
                }
            }, '#808080');
            const trough = field(box, res, (q) => {
                q.filter = `blur(${(0.7 * res).toFixed(1)}px)`;
                stroke(q, groove, '#fff', 6.4);
            });
            const web = S.form({
                box, res, light: L, ramp: IRON, soft: 1, inflate: 'bevel', R: 3.4, relief: 1.1, smooth: 0.003,
                mask: (g) => {
                    poly(g, band);
                    cut(g, (q) => {
                        for (const ph of nails) {
                            const [x, y] = ctr(ph, 2.2), [x2, y2] = ctr(ph + 0.01, 2.2);
                            poly(q, S.xf([[-3, -2.5], [3, -2.5], [3, 2.5], [-3, 2.5]], { x, y, rot: Math.atan2(y2 - y, x2 - x) }));
                        }
                    });
                },
                height: (x, y) => (dents(x, y) - 0.5) * 3.2 - trough(x, y) * 2.6 + 0.2 * S.noise2(x * 0.4, y * 0.4, 8),
                occl: { amp: 0.2, dir: sh, reach: 0.4 },
                mottle: { amp: 0.05, freq: 0.05 },
                spec: { amp: 0.4, power: 16, from: 0.5, to: 0.95, color: '#f2f5ff' },
                // rust gathers in the groove; the groove itself is in its own shade
                tint: (() => {
                    const r = rust(32, 0.85, (x, y) => trough(x, y) * 0.22);
                    return (x, y, tone, rgb, m) => {
                        const k = 1 - trough(x, y) * 0.3;
                        rgb[0] *= k;
                        rgb[1] *= k;
                        rgb[2] *= k;
                        r(x, y, tone, rgb, m);
                    };
                })(),
            });
            air(web, 6.5);
            // the groove's wall on the light's side is in shade: an inner line
            onto(web, res, (g) => stroke(g, groove.map(([x, y]) => [x - sh[0] * 2.6, y - sh[1] * 2.6]), 'rgba(18,20,44,0.5)', 1));
            stamp(G, web, { sh, lw: 2.4 });
            // 3 · the calkins: the heels turned down into blocks
            for (const side of [-1, 1]) {
                const p0 = side * (PM - 0.2), p1 = side * (PM + 0.03), w0 = webAt(side * PM) / 2 + 0.5;
                const blk = [ctr(p0, w0), ctr(p1, w0), ctr(p1, -w0), ctr(p0, -w0)];
                const sp = S.form({ box: even(S.bbox(blk, 8)), res, light: L, ramp: IRON, soft: 1, inflate: 'bevel', R: 3, relief: 1.2, smooth: 0.02, mask: (g) => poly(g, blk), mottle: { amp: 0.06, freq: 0.09 }, tint: rust(40 + side * 3, 0.6), spec: { amp: 0.4, power: 16, from: 0.5, to: 0.95, color: '#f2f5ff' } });
                air(sp, 5);
                stamp(G, sp, { sh, cast });
            }
            return { canvas, box, cy: (box.y * 2 + box.h) / 2 };
        });
    }
    function horseshoe(g, o = {}) {
        const { x = 0, y = 0, s = 1, rot = 0 } = o;
        const sp = shoeSprite(Math.round(rot * 100) / 100, resOf(g, s));
        // anchor: the middle of the shoe
        const c = Math.cos(rot), sn = Math.sin(rot), ox = x + sn * sp.cy * s, oy = y - c * sp.cy * s;
        S.cast(g, (q) => S.put(q, sp, { x: ox, y: oy, rot, s }), { blur: 7 * s, dx: 3 * s, dy: 6 * s, color: 'rgba(20,12,40,0.55)' });
        S.put(g, sp, { x: ox, y: oy, rot, s });
    }

    return { draw, key, horseshoe, ornament, COL };
})();
