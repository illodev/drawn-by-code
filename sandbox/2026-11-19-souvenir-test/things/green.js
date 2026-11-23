// Picture 3, «Verde que te quiero verde»: the things of Lorca's «Romance sonámbulo», without
// its people, in the brush manner (no contour line: lit volumes, strokes that follow the
// form, edges broken by the last stroke), almost monochrome: every green from black-green
// to a pale cold moonlit green, silver for the moonlight. Global: Green.
//
// ANATOMY · what the real things have, and the small true details painted here
//
//   The fig tree, Ficus carica («la higuera frota su viento con la lija de sus ramas»)
//     1  the leaf is palmate, three or five lobes from one palm, the lobes widening outward,
//        rounded sinuses between them, a heart-shaped base where the petiole joins
//     2  five main veins from the petiole's end, one to every lobe; side veins that loop
//        near the margin; a net between them, raised and pale on the underside
//     3  the upper surface is rough as sandpaper (scabrous: stiff short hairs), matt, never
//        glossy; the underside paler and downy
//     4  the margin is coarsely and irregularly toothed, waved, sometimes torn
//     5  a long stout petiole, paler than the blade
//     6  the wood is smooth and grey, «elephant skin», with wrinkles where it forks
//     7  every node is ringed by the scar of the stipules that wrapped the bud; the leaf
//        scar is large and round with a ring of bundle dots
//     8  the bud at a shoot's tip is a green cone (two stipules), pointed
//     9  the fig sits in the leaf axil on a short stalk: pear-shaped, its eye (the ostiole)
//        at the broad end closed by small scales, faint ribs, pale specks
//     10 a broken stalk or a picked fig bleeds a white milky latex that beads
//
//   The agave, «pita» (Agave americana; «el monte, gato garduño, eriza sus pitas agrias»)
//     1  a rosette of thick, fleshy, channelled leaves, a hand wide, a man long
//     2  glaucous: a chalky blue-grey bloom that rubs off where touched, darker where it did
//     3  hooked teeth along the margins, dark, each on a small pale shoulder
//     4  a long dark terminal spine, glossy, its base running down the leaf's edge
//     5  bud prints: each leaf carries the ghost of its neighbour's margin and teeth,
//        pressed into it while they were folded together in the heart
//     6  the heart (the «cogollo»): young leaves still clasped upright in a cone
//     7  old leaves at the foot bend down, dry to grey paper, split
//     8  a leaf that broke folds over at a kink
//     9  the flowering pole (the «quiote»), once in its life: tall, with bracts, and
//        branches at the top like a candelabrum, the dry flower clusters on them
//     10 scratches in the bloom where something rubbed: no lettering
//
//   The prickly pear, «chumbera» (Opuntia): flat oval pads grown from each other's
//   rims; areoles in a diagonal lattice, each a tuft of fine glochids and now and then a
//   long spine; new pads small and brighter; fruit on the top rim, with areoles.
//
//   Frost stars («grandes estrellas de escarcha»): six arms at sixty degrees, each a
//   fern of side branches at sixty degrees that grow longer towards the middle of the arm;
//   a hexagonal plate at the heart with ridges; no two alike, one arm sometimes broken.
//
//   The fish of shadow («el pez de sombra que abre el camino del alba»): a sea bream's
//   body (deep, compressed), the spiny dorsal fin, forked tail, scales in rows, a lateral
//   line, the gill cover, a large eye; here dark, and a road of paler light opens behind it.
//
//   The ghost ship and the ghost horse («el barco sobre la mar y el caballo en la
//   montaña»): a two-masted ship under square sails, its rigging, its reflection broken
//   by the swell; a horse standing on a crest, head up, mane and tail blown by the wind.
//
//   The high railings («barandales de la luna por donde retumba el agua»): wrought iron
//   painted green, square bars, scrolls tied with collars, a flat hand-rail, the paint
//   flaking to black iron, water beading under the rails.
//
//   Tin lanterns («farolillos de hojalata»): soldered tin, four glass panes, a pierced cap
//   (holes punched in rings), a ring to hang it, the solder seams, dents; they tremble.
//
//   Glass tambourines («mil panderos de cristal»): a pandero is a frame drum with pairs of
//   jingles in slots round the frame; here the frame and the skin are glass: rims that
//   catch the light, cracks that star from a blow.
//
//   The cistern («aljibe»): a stone curb round the mouth, worn smooth on top, with grooves
//   cut into its rim by the rope; maidenhair fern («culantrillo de pozo») in its damp
//   joints; black water where the moon's crescent hangs as an icicle of light.
//
// API (sizes at s = 1, in the caller's units):
//   figLeaf(v, rot, res, kind)  'moon' | 'shade' | 'lime' | 'under' | 'deep'; about 240–330
//       long, the petiole's end (the joint) at (0, 0), the middle lobe along +x
//   figFruit(v, rot, res)       about 50 × 70, hanging along +y from its stalk at `sp.top`
//   figWood(g, pts, o)          a fig limb along pts: { w0, w1, seed, nodes, scars, wrinkles, dens }
//   tube(g, pts, o)             a lit round section along pts with its own ramp and texture
//   put(g, sp, x, y, s, { rot, fx, fy, alpha }) · shadow(g, sp, x, y, s, { rot, dx, dy, alpha, blur })
const Green = (() => {
    const S = Souvenir;
    const TAU = Math.PI * 2;
    const cache = new Map();
    const stat = { sprites: 0, px: 0 };
    const memo = (key, fn) => {
        let v = cache.get(key);
        if (!v) {
            v = fn();
            if (v && v.canvas) {
                stat.sprites++;
                stat.px += v.canvas.width * v.canvas.height;
            }
            cache.set(key, v);
        }
        return v;
    };
    const canvas = (w, h) => {
        const c = document.createElement('canvas');
        c.width = Math.max(1, Math.ceil(w));
        c.height = Math.max(1, Math.ceil(h));
        return c;
    };
    const NL = 8, LSTEP = TAU / NL;
    const lkey = (rot) => ((Math.round(rot / LSTEP) % NL) + NL) % NL;
    const LN = (() => {
        const l = Math.hypot(S.LIGHT[0], S.LIGHT[1], S.LIGHT[2]);
        return [S.LIGHT[0] / l, S.LIGHT[1] / l, S.LIGHT[2] / l];
    })();
    // towards the lamp in the plane, for a sprite baked for turn k
    const light2 = (k) => {
        const L = S.lightFor(k * LSTEP), l = Math.hypot(L[0], L[1]);
        return [L[0] / l, L[1] / l];
    };
    const toward = (rgb, r, g, b, k) => {
        rgb[0] += (r - rgb[0]) * k;
        rgb[1] += (g - rgb[1]) * k;
        rgb[2] += (b - rgb[2]) * k;
    };
    const disc = (g, x, y, r) => {
        g.beginPath();
        g.arc(x, y, Math.max(0.01, r), 0, TAU);
        g.fill();
    };
    const oval = (g, x, y, rx, ry, a = 0) => {
        g.beginPath();
        g.ellipse(x, y, Math.max(0.01, rx), Math.max(0.01, ry), a, 0, TAU);
        g.fill();
    };
    const poly = (g, pts) => {
        g.beginPath();
        S.trace(g, pts);
        g.fill();
    };
    const line = (g, pts, w, color) => {
        g.lineWidth = w;
        g.strokeStyle = color;
        g.beginPath();
        S.trace(g, pts, false);
        g.stroke();
    };
    // a tapered line: width w0 at the start, w1 at the end
    const taper = (g, pts, w0, w1, color) => {
        if (pts.length < 2) return;
        const L = [], R = [];
        for (let i = 0; i < pts.length; i++) {
            const p = pts[i], q = pts[Math.min(pts.length - 1, i + 1)], o = pts[Math.max(0, i - 1)];
            const tx = q[0] - o[0], ty = q[1] - o[1], tl = Math.hypot(tx, ty) || 1, w = (w0 + (w1 - w0) * (i / (pts.length - 1))) / 2;
            L.push([p[0] - (ty / tl) * w, p[1] + (tx / tl) * w]);
            R.push([p[0] + (ty / tl) * w, p[1] - (tx / tl) * w]);
        }
        g.fillStyle = color;
        poly(g, [...L, ...R.reverse()]);
    };
    // Marks laid softly: what `draw` paints goes down through one blur of `blur` units.
    const softly = (g, blur, draw) => {
        const m = g.getTransform(), c = canvas(g.canvas.width, g.canvas.height), q = c.getContext('2d');
        q.setTransform(m);
        draw(q);
        g.save();
        g.setTransform(1, 0, 0, 1, 0, 0);
        g.filter = `blur(${Math.max(0.01, blur * Math.hypot(m.a, m.b)).toFixed(2)}px)`;
        g.drawImage(c, 0, 0);
        g.restore();
    };
    // A quadratic path from a to b bowed by `bow` (a share of its length) to its left.
    const bowed = (a, b, bow, n = 10) => {
        const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, dx = b[0] - a[0], dy = b[1] - a[1];
        const cx = mx - dy * bow, cy = my + dx * bow, out = [];
        for (let i = 0; i <= n; i++) {
            const t = i / n, u = 1 - t;
            out.push([u * u * a[0] + 2 * u * t * cx + t * t * b[0], u * u * a[1] + 2 * u * t * cy + t * t * b[1]]);
        }
        return out;
    };
    const angDiff = (a, b) => {
        let d = (a - b) % TAU;
        if (d > Math.PI) d -= TAU;
        if (d < -Math.PI) d += TAU;
        return d;
    };

    // ------------------------------------------------------------------ pasting
    function put(g, sp, x, y, s = 1, o = {}) {
        S.put(g, sp, { x, y, rot: o.rot ?? sp.rot ?? 0, sx: s * (o.fx ?? 1), sy: s * (o.fy ?? 1), alpha: o.alpha ?? 1 });
    }
    const SHADE = '#020a07';
    function shadowOf(sp, blur = 7, color = SHADE) {
        const key = blur + color;
        sp.sh = sp.sh || {};
        if (!sp.sh[key]) {
            const r0 = sp.canvas.width / sp.box.w, rs = Math.min(r0, Math.max(0.2, 2.4 / blur));
            const pad = blur * 2.1;
            const c = canvas((sp.box.w + pad * 2) * rs, (sp.box.h + pad * 2) * rs), q = c.getContext('2d');
            q.filter = `blur(${(blur * rs).toFixed(2)}px)`;
            q.drawImage(sp.canvas, pad * rs, pad * rs, sp.box.w * rs, sp.box.h * rs);
            q.filter = 'none';
            q.globalCompositeOperation = 'source-in';
            q.fillStyle = color;
            q.fillRect(0, 0, c.width, c.height);
            sp.sh[key] = { canvas: c, box: { x: sp.box.x - pad, y: sp.box.y - pad, w: c.width / rs, h: c.height / rs } };
        }
        return sp.sh[key];
    }
    // its shadow on the paint already there (dx, dy in the caller's units)
    function shadow(g, sp, x, y, s = 1, o = {}) {
        const sh = shadowOf(sp, o.blur ?? 7, o.color ?? SHADE);
        g.save();
        g.globalCompositeOperation = 'source-atop';
        S.put(g, sh, { x: x + (o.dx ?? 6), y: y + (o.dy ?? 9), rot: o.rot ?? sp.rot ?? 0, sx: s * (o.fx ?? 1), sy: s * (o.fy ?? 1), alpha: o.alpha ?? 0.5 });
        g.restore();
    }
    // the same sprite under another light: multiplied by a colour, then a veil (a copy)
    function graded(sp, mul, veil = null, veilA = 0) {
        const key = mul + veil + veilA;
        sp.gr = sp.gr || {};
        if (!sp.gr[key]) {
            const c = canvas(sp.canvas.width, sp.canvas.height), q = c.getContext('2d');
            q.drawImage(sp.canvas, 0, 0);
            q.globalCompositeOperation = 'multiply';
            q.fillStyle = mul;
            q.fillRect(0, 0, c.width, c.height);
            if (veil) {
                q.globalCompositeOperation = 'source-atop';
                q.globalAlpha = veilA;
                q.fillStyle = veil;
                q.fillRect(0, 0, c.width, c.height);
                q.globalAlpha = 1;
            }
            q.globalCompositeOperation = 'destination-in';
            q.drawImage(sp.canvas, 0, 0);
            sp.gr[key] = { ...sp, canvas: c, sh: null, gr: null };
            stat.sprites++;
            stat.px += c.width * c.height;
        }
        return sp.gr[key];
    }

    // ------------------------------------------------------------------ a lit tube
    // A round section along `pts`, lit by the house light, painted per pixel straight onto g:
    // fig wood, iron bars, stalks. Its texture is the caller's.
    //   w0, w1, taper   widths at the ends (units)
    //   ramp            [[tone, hex], …] dark to light
    //   tex(arc, cu, q, u, side)  → a change of tone (arc: units along, cu: units across)
    //   col(arc, cu, q, u, tone, rgb)  → the last word on the colour
    //   nodes           distances along it where it swells;  bulge: how much
    //   shade           false: no cast shadow on what is under it;  shadeA: its strength
    //   dens            < 1 paints it at a fraction of the pixels (for layers the lens blurs)
    //   edge            false: a clean edge (iron); default: it breaks up in its last stroke
    let scratch = null;
    function tube(g, pts, o = {}) {
        const w0 = o.w0 ?? 10, w1 = o.w1 ?? w0 * 0.5, sd = S.seedOf(o.seed ?? 'tube'), nodes = o.nodes ?? [];
        const ramp = S.rampFn(o.ramp ?? [[0, '#0b1512'], [0.3, '#24342f'], [0.55, '#4f645c'], [0.8, '#8fa59b'], [1, '#d6e2dc']], o.soft ?? 0.9);
        const m = g.getTransform(), dq = o.dens ?? 1, k = Math.hypot(m.a, m.b) * dq;
        const dense = o.raw ? pts : S.curve(pts, false, 10);
        const step = Math.max(1.2, Math.min(4, Math.min(w0, w1 || w0) * 0.5));
        const X = [dense[0][0]], Y = [dense[0][1]];
        let need = step;
        for (let i = 1; i < dense.length; i++) {
            let ax = dense[i - 1][0], ay = dense[i - 1][1];
            const bx = dense[i][0], by = dense[i][1];
            let d = Math.hypot(bx - ax, by - ay);
            while (d >= need && d > 0) {
                const q = need / d;
                ax += (bx - ax) * q;
                ay += (by - ay) * q;
                X.push(ax);
                Y.push(ay);
                d -= need;
                need = step;
            }
            need -= d;
        }
        const last = dense[dense.length - 1];
        if (Math.hypot(last[0] - X[X.length - 1], last[1] - Y[Y.length - 1]) > 0.3) {
            X.push(last[0]);
            Y.push(last[1]);
        }
        const n = X.length;
        if (n < 2) return;
        const D = new Float32Array(n), HW = new Float32Array(n), PX = new Float32Array(n), PY = new Float32Array(n);
        for (let i = 1; i < n; i++) D[i] = D[i - 1] + Math.hypot(X[i] - X[i - 1], Y[i] - Y[i - 1]);
        const total = D[n - 1];
        let wmax = 0;
        for (let i = 0; i < n; i++) {
            const u = D[i] / total;
            let w = (w0 + (w1 - w0) * Math.pow(u, o.taper ?? 1)) * 0.5 * (1 + (o.wobble ?? 0.06) * S.noise2(D[i] * 0.03, 1.5, sd + 3));
            for (const nd of nodes) w *= 1 + (o.bulge ?? 0.18) * Math.exp(-Math.pow((D[i] - nd) / (o.nodeW ?? 5), 2));
            HW[i] = Math.max(0.3, w) * k;
            if (HW[i] > wmax) wmax = HW[i];
            PX[i] = (m.a * X[i] + m.c * Y[i] + m.e) * dq;
            PY[i] = (m.b * X[i] + m.d * Y[i] + m.f) * dq;
        }
        if (o.shade !== false) {
            g.save();
            g.globalCompositeOperation = 'source-atop';
            g.lineCap = 'round';
            g.lineJoin = 'round';
            g.strokeStyle = SHADE;
            const wm = (w0 + w1) * 0.5, off = Math.max(2, wm * 0.5) * (o.shadeOff ?? 1);
            g.beginPath();
            for (let i = 0; i < n; i += 2) g.lineTo(X[i] + off * 0.62, Y[i] + off);
            g.lineTo(X[n - 1] + off * 0.62, Y[n - 1] + off);
            for (const [ww, a] of [[2.1, 0.08], [1.5, 0.12], [0.9, 0.16]]) {
                g.lineWidth = wm * ww + 1.5;
                g.globalAlpha = a * (o.shadeA ?? 1);
                g.stroke();
            }
            g.restore();
        }
        const ext = Math.ceil((wmax + 2) / (step * k)) + 2, CH = 8;
        const SXv = new Float32Array(n), SYv = new Float32Array(n), IL = new Float32Array(n);
        for (let i = 0; i < n - 1; i++) {
            SXv[i] = PX[i + 1] - PX[i];
            SYv[i] = PY[i + 1] - PY[i];
            IL[i] = 1 / (SXv[i] * SXv[i] + SYv[i] * SYv[i] || 1);
        }
        if (!scratch) scratch = canvas(64, 64);
        const c1 = [0, 0, 0];
        const lx = LN[0], ly = LN[1], lz = LN[2];
        const edge = o.edge !== false;
        for (let i0 = 0; i0 < n - 1; i0 += CH) {
            const i1 = Math.min(n - 1, i0 + CH), ja = Math.max(0, i0 - ext), jb = Math.min(n - 1, i1 + ext);
            let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
            for (let i = i0; i <= i1; i++) {
                const p = HW[i] + 2;
                if (PX[i] - p < x0) x0 = PX[i] - p;
                if (PY[i] - p < y0) y0 = PY[i] - p;
                if (PX[i] + p > x1) x1 = PX[i] + p;
                if (PY[i] + p > y1) y1 = PY[i] + p;
            }
            x0 = Math.floor(x0);
            y0 = Math.floor(y0);
            const w = Math.ceil(x1) - x0, h = Math.ceil(y1) - y0;
            if (w < 1 || h < 1 || w > 6000 || h > 6000) continue;
            const img = new ImageData(w, h), px = img.data;
            let any = false;
            for (let yy = 0; yy < h; yy++) {
                for (let xx = 0; xx < w; xx++) {
                    const cx = x0 + xx + 0.5, cy = y0 + yy + 0.5;
                    let best = 1e12, bj = -1, bt = 0, bex = 0, bey = 0;
                    for (let j = ja; j < jb; j++) {
                        const ax = cx - PX[j], ay = cy - PY[j];
                        let t = (ax * SXv[j] + ay * SYv[j]) * IL[j];
                        t = t < 0 ? 0 : t > 1 ? 1 : t;
                        const ex = ax - SXv[j] * t, ey = ay - SYv[j] * t, d2 = ex * ex + ey * ey;
                        if (d2 < best) {
                            best = d2;
                            bj = j;
                            bt = t;
                            bex = ex;
                            bey = ey;
                        }
                    }
                    if (bj < i0 || bj >= i1) continue;
                    const dist = Math.sqrt(best), hw = HW[bj] + (HW[bj + 1] - HW[bj]) * bt;
                    if (dist > hw + 1) continue;
                    const q = Math.min(1, dist / hw), arc = D[bj] + (D[bj + 1] - D[bj]) * bt;
                    const side = bex * -SYv[bj] + bey * SXv[bj] < 0 ? -1 : 1, cu = (side * dist) / k, u = arc / total;
                    const nx = dist > 0 ? bex / dist : 0, ny = dist > 0 ? bey / dist : 0;
                    const lam = (nx * lx + ny * ly) * q + Math.sqrt(1 - q * q) * lz;
                    let tone = 0.5 + 0.5 * lam + (o.bounce ?? 0.07) * S.smooth(0.72, 1, q) * (lam < 0 ? 1 : 0);
                    if (o.tex) tone += o.tex(arc, cu, q, u, side, hw / k);
                    tone = tone < 0 ? 0 : tone > 1 ? 1 : tone;
                    ramp(tone, c1);
                    if (o.col) o.col(arc, cu, q, u, tone, c1, hw / k);
                    let a = hw + 0.5 - dist;
                    a = a < 0 ? 0 : a > 1 ? 1 : a;
                    if (edge && hw > 2.4 * k) {
                        const nz = S.noise2(arc * 0.3, cu * 0.3, sd + 21) * 0.65 + S.noise2(arc * 0.8, cu * 0.8, sd + 22) * 0.35;
                        a *= S.smooth(0.25, 0.75, (hw - dist) / (1.1 * k) + nz * 0.8 + 0.15);
                    }
                    if (a <= 0) continue;
                    const i = (yy * w + xx) * 4;
                    px[i] = c1[0];
                    px[i + 1] = c1[1];
                    px[i + 2] = c1[2];
                    px[i + 3] = a * 255 * (o.alpha ?? 1);
                    any = true;
                }
            }
            if (!any) continue;
            if (scratch.width < w + 2 || scratch.height < h + 2) {
                scratch.width = Math.max(scratch.width, w + 2);
                scratch.height = Math.max(scratch.height, h + 2);
            }
            const sg = scratch.getContext('2d');
            sg.clearRect(0, 0, w + 2, h + 2);
            sg.putImageData(img, 0, 0);
            g.save();
            g.setTransform(1, 0, 0, 1, 0, 0);
            g.drawImage(scratch, 0, 0, w, h, x0 / dq, y0 / dq, w / dq, h / dq);
            g.restore();
        }
        return { X, Y, D, total, at: (d) => {
            d = Math.max(0, Math.min(total, d));
            let i = 1;
            while (i < n - 1 && D[i] < d) i++;
            const t = (d - D[i - 1]) / (D[i] - D[i - 1] || 1);
            return { x: X[i - 1] + (X[i] - X[i - 1]) * t, y: Y[i - 1] + (Y[i] - Y[i - 1]) * t, a: Math.atan2(Y[i] - Y[i - 1], X[i] - X[i - 1]), w: (w0 + (w1 - w0) * Math.pow(d / total, o.taper ?? 1)) };
        } };
    }

    // ------------------------------------------------------------------ the fig
    const FIG = {
        moon: [[0, '#04110c'], [0.2, '#0a2218'], [0.38, '#143825'], [0.54, '#215136'], [0.7, '#376f50'], [0.85, '#61977a'], [1, '#a4ccb6']],
        shade: [[0, '#020a07'], [0.25, '#061710'], [0.45, '#0d2a1c'], [0.62, '#18402b'], [0.8, '#2b5d43'], [1, '#55876c']],
        lime: [[0, '#081509'], [0.22, '#163011'], [0.42, '#294d1a'], [0.6, '#426d25'], [0.78, '#6a953d'], [0.9, '#9dbd66'], [1, '#cfe0a0']],
        under: [[0, '#0f1f1a'], [0.3, '#28443a'], [0.55, '#4d7062'], [0.78, '#80a293'], [1, '#c3d9ce']],
        // round 8 (the loose stratum): the same leaves GREEN under the moon, not silver. The
        // grade (lift, mist) greys whatever is painted, so the paint carries more chroma:
        // true greens in the body, a pale cool green (never a grey) at the top of the ramp
        verd: [[0, '#03120a'], [0.18, '#082611'], [0.36, '#0f3c19'], [0.52, '#195624'], [0.68, '#287533'], [0.82, '#4b9a4a'], [0.93, '#83c070'], [1, '#bfe3a6']],
        vshade: [[0, '#020b05'], [0.25, '#05190b'], [0.45, '#0b2d14'], [0.62, '#13441f'], [0.8, '#22602e'], [1, '#468a48']],
        vunder: [[0, '#0d2214'], [0.3, '#244a2e'], [0.55, '#467a4e'], [0.78, '#7fae7c'], [1, '#c4e2b4']],
    };
    // The drawing of fig leaf number v: its outline (polar about a point in the palm), its
    // veins, what happened to it.
    const figGeoms = new Map();
    function figGeom(v) {
        if (figGeoms.has(v)) return figGeoms.get(v);
        const r = Motion.rng('figleaf' + v);
        const L = 230 + r() * 90, five = r() < 0.64, cd = 0.16 * L;
        const lobes = [{ a: (r() - 0.5) * 0.14, len: L * (0.64 + r() * 0.1), w: 0.5 + r() * 0.12, sk: (r() - 0.5) * 0.3 }];
        for (const sd of [-1, 1]) lobes.push({ a: sd * (0.98 + r() * 0.24), len: L * (0.5 + r() * 0.13), w: 0.42 + r() * 0.1, sk: (r() - 0.5) * 0.4 });
        if (five) for (const sd of [-1, 1]) lobes.push({ a: sd * (1.95 + r() * 0.22), len: L * (0.27 + r() * 0.1), w: 0.34 + r() * 0.08, sk: (r() - 0.5) * 0.4 });
        const rmin = L * (0.24 + r() * 0.04), nT = 30 + Math.floor(r() * 14), ph = r() * 6.28, tAmp = 0.02 + r() * 0.025, wob = r() * 9;
        const P = 7;
        const R = (th) => {
            const dp = angDiff(th, Math.PI);
            let acc = Math.pow(rmin - (rmin - cd) * Math.exp(-(dp * dp) / 0.08), P), top = 0;
            for (const lb of lobes) {
                const t = angDiff(th, lb.a) / lb.w;
                if (Math.abs(t) >= 1) continue;
                const rl = lb.len * Math.pow(1 - Math.pow(Math.abs(t), 2.3), 0.42) * (1 + lb.sk * t);
                acc += Math.pow(rl, P);
                top = Math.max(top, rl / lb.len);
            }
            let rr = Math.pow(acc, 1 / P);
            // coarse, irregular teeth on the lobes, none down in the sinuses
            const tw = S.smooth(0.45, 0.85, top) * S.smooth(0.2, 0.6, Math.abs(dp));
            rr *= 1 + tw * tAmp * (Math.pow(Math.abs(Math.sin(th * nT * 0.5 + ph + 0.6 * Math.sin(th * 7 + wob))), 0.55) - 0.6) + 0.018 * S.noise2(th * 6, wob, 3);
            return rr;
        };
        // the outline's radius as a table (the painter asks it for every pixel)
        const RT = new Float32Array(2049);
        for (let i = 0; i <= 2048; i++) RT[i] = R((i / 2048) * TAU - Math.PI);
        const Rf = (th) => RT[Math.max(0, Math.min(2048, Math.round(((th + Math.PI) / TAU) * 2048)))];
        const C = [cd, 0];
        const NP = 540, pts = [];
        for (let i = 0; i < NP; i++) {
            const th = (i / NP) * TAU, rr = R(th);
            pts.push([C[0] + Math.cos(th) * rr, C[1] + Math.sin(th) * rr]);
        }
        // the joint: where the outline crosses the axis behind the palm
        const jx = C[0] - R(Math.PI);
        for (const p of pts) p[0] -= jx;
        C[0] -= jx;
        const B = [4, 0];
        // the petiole: stout, a little curved, paler than the blade
        const pl = L * (0.26 + r() * 0.1), pb = (r() - 0.5) * 0.3;
        const pet = bowed([-pl, pl * pb * 0.3], [8, 0], pb * 0.4, 12);
        // main veins: from the joint to every lobe's tip, a little bowed
        const mains = lobes.map((lb) => {
            const rt = R(lb.a) * 0.94, tip = [C[0] + Math.cos(lb.a) * rt, C[1] + Math.sin(lb.a) * rt];
            return { lb, pts: bowed(B, tip, (r() - 0.5) * 0.08, 16), len: Math.hypot(tip[0] - B[0], tip[1] - B[1]) };
        });
        const inside = (x, y) => {
            const th = Math.atan2(y - C[1], x - C[0]);
            return Math.hypot(x - C[0], y - C[1]) < Rf(th) * 0.93;
        };
        // side veins: off every main vein, forward, to near the margin, then a loop
        const sides = [];
        for (const mv of mains) {
            const n = Math.max(3, Math.round(mv.len / (26 + r() * 10)));
            for (let k = 1; k < n; k++) {
                for (const sg of [-1, 1]) {
                    if (r() < 0.12) continue;
                    const u = k / n + (r() - 0.5) * 0.05, i = Math.min(15, Math.floor(u * 16)), p = mv.pts[i], q = mv.pts[Math.min(16, i + 1)];
                    const a0 = Math.atan2(q[1] - p[1], q[0] - p[0]) + sg * (0.75 + r() * 0.25);
                    const out = [[p[0], p[1]]];
                    let x = p[0], y = p[1], a = a0;
                    for (let s = 0; s < 40; s++) {
                        x += Math.cos(a) * 4;
                        y += Math.sin(a) * 4;
                        if (!inside(x, y)) break;
                        out.push([x, y]);
                        a -= sg * 0.035; // they curve forward, towards the lobe's tip
                    }
                    if (out.length > 3) sides.push({ pts: out, w: 1.6 * (1 - u * 0.5) });
                }
            }
        }
        const inBlade = (x, y) => Math.hypot(x - C[0], y - C[1]) < Rf(Math.atan2(y - C[1], x - C[0]));
        const G = { v, L, five, lobes, R: Rf, C, B, pts, mains, sides, inside, inBlade, pet, pl, rmin, cup: (r() - 0.35) * 0.9, curl: r() < 0.3 ? (r() - 0.5) * 2 : 0,
            holes: r() < 0.35 ? 1 + Math.floor(r() * 3) : 0, torn: r() < 0.22, dry: r() < 0.16, frost: r() < 0.4, seed: r() * 1000 };
        // holes and tears
        G.cuts = [];
        for (let i = 0; i < G.holes; i++) {
            const mv = mains[Math.floor(r() * mains.length)], p = mv.pts[4 + Math.floor(r() * 10)], rad = 3 + r() * 7, o = [(r() - 0.5) * 30, (r() - 0.5) * 30];
            if (inside(p[0] + o[0], p[1] + o[1])) G.cuts.push(S.ellipse(p[0] + o[0], p[1] + o[1], rad, rad * (0.6 + r() * 0.4), 14, r() * 3).map(([x, y], j) => [x + (S.hashI(j, v, i, 5) - 0.5) * 1.6, y + (S.hashI(j, v, i, 6) - 0.5) * 1.6]));
        }
        if (G.torn) {
            // a split from the margin between two veins, the wind's
            const lb = lobes[Math.floor(r() * lobes.length)], th = lb.a + (r() - 0.5) * lb.w, rr = R(th);
            const tip = [C[0] + Math.cos(th) * rr * 1.05, C[1] + Math.sin(th) * rr * 1.05], deep = [C[0] + Math.cos(th) * rr * (0.55 + r() * 0.2), C[1] + Math.sin(th) * rr * (0.55 + r() * 0.2)];
            const nx = -Math.sin(th) * 3.5, ny = Math.cos(th) * 3.5;
            G.cuts.push([[tip[0] + nx * 2, tip[1] + ny * 2], [(tip[0] + deep[0]) / 2 + nx * 0.8, (tip[1] + deep[1]) / 2 + ny * 0.8], deep, [(tip[0] + deep[0]) / 2 - nx * 0.6, (tip[1] + deep[1]) / 2 - ny * 0.6], [tip[0] - nx * 2, tip[1] - ny * 2]]);
        }
        figGeoms.set(v, G);
        return G;
    }
    // Relief of a fig leaf (veins sunk on top, raised below), painted once per drawing.
    const figReliefs = new Map();
    function figRelief(G, res) {
        const key = G.v + '@' + res;
        if (!figReliefs.has(key)) {
            const box = S.bbox(G.pts, 6), rr = Math.min(res, 1.2);
            figReliefs.set(key, S.reliefField(box, rr, (g) => {
                g.fillStyle = '#fff';
                poly(g, G.pts);
                g.lineCap = 'round';
                g.lineJoin = 'round';
                for (const mv of G.mains) taper(g, mv.pts, 9, 2.5, '#202020');
                for (const sv of G.sides) taper(g, sv.pts, sv.w * 2.6, 0.8, '#5a5a5a');
                const r = Motion.rng('figrel' + G.v);
                g.strokeStyle = 'rgba(80,80,80,0.6)';
                g.lineWidth = 1.1;
                for (let i = 0; i < 260; i++) {
                    const sv = G.sides[Math.floor(r() * G.sides.length)];
                    if (!sv) break;
                    const p = sv.pts[Math.floor(r() * sv.pts.length)], a = r() * TAU, l = 6 + r() * 10;
                    g.beginPath();
                    g.moveTo(p[0], p[1]);
                    g.lineTo(p[0] + Math.cos(a) * l, p[1] + Math.sin(a) * l);
                    g.stroke();
                }
            }, 3.2));
        }
        return figReliefs.get(key);
    }
    // kind: 'moon' (in the moonlight) | 'shade' | 'lime' (a young leaf) | 'under' (turned by
    // the wind, the pale downy underside) | 'deep' (inside the tree)
    function figLeaf(v = 0, rot = 0, res = 1.5, kind = 'moon') {
        if (kind === 'deep') return graded(figLeaf(v, rot, res, 'shade'), '#6c9488', '#0a2a22', 0.12);
        if (kind === 'vdeep') return graded(figLeaf(v, rot, res, 'vshade'), '#5e9468', '#04220c', 0.1);
        const lk = lkey(rot);
        return memo(`fig${v}/${lk}@${res}${kind}`, () => {
            const G = figGeom(v), box = S.bbox(G.pts, 5), under = kind === 'under' || kind === 'vunder', vk = kind[0] === 'v';
            const rel = figRelief(G, res), r = Motion.rng('figpaint' + v + kind), sd = S.seedOf('fig' + v + kind);
            const l2 = light2(lk), cx = G.C[0], cy = G.C[1];
            const sp = S.form({
                box, res, seed: 'fig' + v, light: S.lightFor(lk * LSTEP), inflate: 'none',
                mask: (g) => {
                    poly(g, G.pts);
                    taper(g, G.pet, 5, 7.5, '#fff');
                    g.globalCompositeOperation = 'destination-out';
                    for (const c of G.cuts) poly(g, c);
                    g.globalCompositeOperation = 'source-over';
                },
                height: (x, y) => {
                    const dx = x - cx, dy = y - cy, rho = Math.hypot(dx, dy), th = Math.atan2(dy, dx), rr = G.R(th), m = rho / rr;
                    let h = (under ? -2.6 : 2.4) * (rel(x, y) - 1); // the veins: grooves above, ridges below
                    h += G.cup * m * m * G.L * 0.07; // the blade cups or droops
                    h += G.curl * Math.pow(Math.max(0, m - 0.6), 2) * G.L * 0.25 * Math.sin(th * 2 + G.seed); // a lobe's edge curls
                    h += 0.03 * G.L * m * m * S.noise2(th * 3, m * 2, sd); // the margin waves
                    // sandpaper: the hairs' tiny bumps
                    h += 0.32 * (S.hashI(Math.floor(x * 0.9), Math.floor(y * 0.9), 3, sd) - 0.5);
                    if (x < 6 && !G.inBlade(x, y)) {
                        // the petiole, round
                        const k = Math.max(0, Math.min(12, Math.round(((x + G.pl) / (G.pl + 8)) * 12))), yc = G.pet[k][1];
                        return -0.12 * (y - yc) * (y - yc);
                    }
                    return h;
                },
                ramp: FIG[kind] ?? FIG.moon, soft: 0.88,
                edge: { rough: 1.8, freq: 0.22, amp: 0.9 },
                mottle: { amp: 0.08, freq: 0.014 },
                stroke: { amp: 0.035, freq: 0.06, tone: 7 },
                markAmp: 0.55,
                marks: (g) => {
                    // the paint mixed lighter and darker, then strokes out along the veins
                    softly(g, 0.8, (q) => {
                        for (let j = 0; j < 7; j++) {
                            const mv = G.mains[j % G.mains.length], p = mv.pts[3 + Math.floor(r() * 12)], rad = 20 + r() * 40, c = r() < 0.5 ? '255,255,255' : '0,0,0', a = 0.08 + r() * 0.16;
                            const gr = q.createRadialGradient(p[0], p[1], 0, p[0], p[1], rad);
                            gr.addColorStop(0, `rgba(${c},${a})`);
                            gr.addColorStop(1, `rgba(${c},0)`);
                            q.fillStyle = gr;
                            q.fillRect(p[0] - rad, p[1] - rad, rad * 2, rad * 2);
                        }
                        let i = 0;
                        for (const sv of G.sides) {
                            if (r() < 0.45) continue;
                            const off = (r() - 0.5) * 8, pts = sv.pts.map(([x, y]) => [x + off * 0.7, y + off]);
                            S.dab(q, pts, { w: 3 + r() * 6, color: r() < 0.55 ? '#ffffff' : '#000000', alpha: 0.12 + r() * 0.22, bristles: 4, seed: 'fd' + v + kind + i++, dry: 0.45, taper: 0.8 });
                        }
                        for (const mv of G.mains) {
                            for (const sg of [-1, 1]) {
                                const pts = mv.pts.slice(2).map(([x, y], k) => [x - Math.sin(mv.lb.a) * sg * (6 + k * 0.6), y + Math.cos(mv.lb.a) * sg * (6 + k * 0.6)]);
                                S.dab(q, pts, { w: 5 + r() * 7, color: r() < 0.5 ? '#ffffff' : '#000000', alpha: 0.1 + r() * 0.15, bristles: 5, seed: 'fm' + v + kind + i++, dry: 0.5, taper: 0.8 });
                            }
                        }
                    });
                    // the hairs of a dry brush across the blade
                    for (let j = 0; j < 150; j++) {
                        const mv = G.mains[Math.floor(r() * G.mains.length)], p = mv.pts[2 + Math.floor(r() * 14)], a = mv.lb.a + (r() - 0.5) * 1.6, l = 5 + r() * 14, o = (r() - 0.5) * 50;
                        const x = p[0] - Math.sin(mv.lb.a) * o, y = p[1] + Math.cos(mv.lb.a) * o;
                        line(g, [[x, y], [x + Math.cos(a) * l, y + Math.sin(a) * l]], 0.5 + r() * 0.6, r() < 0.55 ? `rgba(255,255,255,${0.12 + r() * 0.2})` : `rgba(0,0,0,${0.1 + r() * 0.2})`);
                    }
                },
                tint: (x, y, tone, rgb, mm) => {
                    if (x < 6 && !G.inBlade(x, y)) {
                        if (vk) toward(rgb, 118, 160, 92, under ? 0.2 : 0.3);
                        else toward(rgb, 120, 150, 110, under ? 0.2 : 0.3); // the petiole, paler
                        return;
                    }
                    // a cool and a less cool passage in every leaf
                    const n = S.noise2(x * 0.012 + 3, y * 0.016, sd + 2);
                    rgb[0] += n * 8;
                    rgb[1] += n * 4;
                    rgb[2] -= n * 9;
                    if (G.dry && !under) {
                        // a dry lobe edge: grey-olive paper behind a dark line
                        const th = Math.atan2(y - cy, x - cx), m = Math.hypot(x - cx, y - cy) / G.R(th);
                        const lb = G.lobes[G.lobes.length - 1], near = Math.exp(-Math.pow(angDiff(th, lb.a) / (lb.w * 0.7), 2));
                        const k = S.smooth(0.8, 0.86, m + 0.05 * S.noise2(th * 9, 1, sd)) * near;
                        toward(rgb, 92 + tone * 70, 96 + tone * 66, 70 + tone * 40, k * 0.85);
                        toward(rgb, 20, 26, 16, S.smooth(0.77, 0.8, m) * (1 - S.smooth(0.8, 0.84, m)) * near * 0.7);
                    }
                    const k = S.smooth(0.04, 0, mm) * S.smooth(0.55, 0.2, tone) * 0.3;
                    rgb[0] *= 1 - k;
                    rgb[1] *= 1 - k;
                    rgb[2] *= 1 - k;
                },
                over: (g) => {
                    g.lineCap = 'round';
                    g.lineJoin = 'round';
                    // veins: pale, the main ones with their own shade beside them
                    const vc = vk ? (under ? '212,236,196' : '172,220,148') : under ? '210,228,214' : kind === 'lime' ? '214,232,160' : '170,206,180';
                    const va = under ? 0.55 : 0.3;
                    for (const mv of G.mains) {
                        taper(g, mv.pts.map(([x, y]) => [x - l2[0] * 1.3, y - l2[1] * 1.3 + 0]), 5.2, 1.2, `rgba(2,14,8,${under ? 0.2 : 0.35})`);
                        taper(g, mv.pts, 4.2, 0.9, `rgba(${vc},${va + 0.12})`);
                    }
                    for (const sv of G.sides) taper(g, sv.pts, sv.w, 0.4, `rgba(${vc},${va})`);
                    // the net between, as hairlines
                    for (let i = 0; i < (under ? 420 : 200); i++) {
                        const sv = G.sides[Math.floor(r() * G.sides.length)];
                        if (!sv) break;
                        const p = sv.pts[Math.floor(r() * sv.pts.length)], a = r() * TAU, l = 5 + r() * 9;
                        line(g, [[p[0], p[1]], [p[0] + Math.cos(a) * l * 0.5 + (r() - 0.5) * 2, p[1] + Math.sin(a) * l * 0.5 + (r() - 0.5) * 2], [p[0] + Math.cos(a) * l, p[1] + Math.sin(a) * l]], 0.45, `rgba(${vc},${va * 0.55})`);
                    }
                    // the stiff hairs: pale specks, thicker towards the light
                    for (let i = 0; i < (under ? 900 : 520); i++) {
                        const x = box.x + r() * box.w, y = box.y + r() * box.h;
                        g.fillStyle = `rgba(${vk ? (under ? '226,242,214' : '196,232,176') : under ? '226,238,228' : '200,226,206'},${0.1 + r() * 0.2})`;
                        disc(g, x, y, 0.35 + r() * 0.35);
                    }
                    // the leaf's thickness: a thin light on the margin facing the lamp
                    if (!under) {
                        g.strokeStyle = vk ? 'rgba(196,236,170,0.4)' : 'rgba(200,232,210,0.35)';
                        g.lineWidth = 1;
                        g.beginPath();
                        let on = false;
                        for (const [x, y] of G.pts) {
                            const nx = x - G.C[0], ny = y - G.C[1], nl = Math.hypot(nx, ny) || 1, f = (nx / nl) * l2[0] + (ny / nl) * l2[1];
                            if (f > 0.35) {
                                if (!on) g.moveTo(x - l2[0] * 0.9, y - l2[1] * 0.9);
                                else g.lineTo(x - l2[0] * 0.9, y - l2[1] * 0.9);
                                on = true;
                            } else on = false;
                        }
                        g.stroke();
                    }
                    // what happened to it: the lips of holes and tears
                    for (const c of G.cuts) {
                        g.lineWidth = 2.2;
                        g.strokeStyle = 'rgba(70,82,52,0.75)';
                        g.beginPath();
                        S.trace(g, c);
                        g.stroke();
                    }
                    // hoar frost on the edge that faces the night: needles of ice
                    if (G.frost && kind !== 'lime') {
                        for (let i = 0; i < G.pts.length; i += 3) {
                            const [x, y] = G.pts[i], nx = x - G.C[0], ny = y - G.C[1], nl = Math.hypot(nx, ny) || 1;
                            if ((nx / nl) * l2[0] + (ny / nl) * l2[1] < 0.2 || r() < 0.35) continue;
                            const a = Math.atan2(ny, nx) + Math.PI + (r() - 0.5) * 1.4, l = 1.5 + r() * 4;
                            line(g, [[x, y], [x + Math.cos(a) * l, y + Math.sin(a) * l]], 0.5 + r() * 0.4, `rgba(226,242,236,${0.4 + r() * 0.45})`);
                            if (r() < 0.3) {
                                g.fillStyle = 'rgba(236,248,244,0.7)';
                                disc(g, x + Math.cos(a) * l * 0.4, y + Math.sin(a) * l * 0.4, 0.6 + r() * 0.5);
                            }
                        }
                    }
                },
            });
            sp.rot = lk * LSTEP;
            sp.G = G;
            return sp;
        });
    }
    // where a point of a fig leaf pasted at (x, y, rot, s) lands: lobe i's tip at u = 1
    const figAt = (G, x, y, rot, s, lobe, u) => {
        const mv = G.mains[lobe % G.mains.length], p = mv.pts[Math.round(Math.max(0, Math.min(1, u)) * 16)];
        const c = Math.cos(rot), sn = Math.sin(rot);
        return [x + (p[0] * c - p[1] * sn) * s, y + (p[0] * sn + p[1] * c) * s];
    };

    // A fig: a pear on a short stalk, the eye at the broad end. Hanging along +y from its
    // stalk at sp.top (it is pasted turned, as it sits on the twig).
    const FRUIT = [[0, '#07150c'], [0.2, '#123020'], [0.38, '#21492c'], [0.55, '#386534'], [0.7, '#56813f'], [0.84, '#86a660'], [1, '#c6d6a0']];
    function figFruit(v = 0, rot = 0, res = 1.5) {
        const lk = lkey(rot);
        return memo(`fruit${v}/${lk}@${res}`, () => {
            const r = Motion.rng('figfruit' + v), W = 50 + r() * 16, H = 60 + r() * 12, lean = (r() - 0.5) * 0.12, neck = 0.3 + r() * 0.1, sq = 0.9 + r() * 0.15;
            const half = (u) => {
                // a neck at the stalk, the bulb below, flattened round the eye
                const bulb = Math.pow(Math.max(0, 1 - Math.pow((u - 0.6) / 0.42, 2)), 0.45);
                return (W / 2) * Math.max(neck * S.smooth(-0.04, 0.1, u) * (1 - 0.2 * S.smooth(0.1, 0.25, u)), bulb * (0.5 + 0.5 * S.smooth(0.1, 0.5, u)));
            };
            const n = 50, L = [], R = [];
            for (let i = 0; i <= n; i++) {
                const u = i / n, y = u * H, w = half(u) * (1 + 0.03 * Math.sin(u * 9 + v)), x = lean * y;
                L.push([x - w, y]);
                R.push([x + w * sq, y]);
            }
            const pts = [...R, ...L.reverse()];
            const box = S.bbox(pts, 10);
            box.y -= 12;
            box.h += 12;
            const ribs = 6 + Math.floor(r() * 3), eyeY = H * 0.985, l2 = light2(lk);
            const sp = S.form({
                box, res, seed: 'fruit' + v, light: S.lightFor(lk * LSTEP),
                mask: (g) => poly(g, pts),
                ramp: FRUIT, soft: 0.9,
                height: (x, y) => {
                    // faint ribs that run from the stalk to the eye
                    const u = y / H, w = half(u) || 1, t = (x - lean * y) / w;
                    return 0.9 * Math.cos(Math.asin(Math.max(-1, Math.min(1, t))) * ribs) * S.smooth(0.15, 0.5, u) * S.smooth(1, 0.8, u);
                },
                mottle: { amp: 0.06, freq: 0.05 },
                stroke: { amp: 0.04, freq: 0.08, tone: 6 },
                edge: { rough: 1.2, freq: 0.4, amp: 0.7 },
                spec: { amp: 0.35, power: 14, from: 0.4, to: 0.85, ragged: 0.6, color: '#d6ecd8' },
                tint: (x, y, tone, rgb) => {
                    // the neck stays greener and darker, the bulb blushes towards the moon's silver
                    const u = y / H;
                    toward(rgb, 40, 70, 40, S.smooth(0.3, 0, u) * 0.4);
                    rgb[2] += 10 * S.smooth(0.5, 1, tone);
                },
                over: (g) => {
                    // pale specks (lenticels), and a few dark ones
                    for (let i = 0; i < 70; i++) {
                        const u = 0.15 + r() * 0.82, w = half(u), x = lean * u * H + (r() * 2 - 1) * w * 0.88, y = u * H;
                        g.fillStyle = r() < 0.75 ? `rgba(206,228,190,${0.1 + r() * 0.25})` : `rgba(10,26,14,${0.2 + r() * 0.25})`;
                        oval(g, x, y, 0.4 + r() * 0.6, 0.3 + r() * 0.4, r() * 3);
                    }
                    // a bloom of dew on the shoulder away from the light
                    for (let i = 0; i < 26; i++) {
                        const u = 0.45 + r() * 0.45, w = half(u), x = lean * u * H + (0.2 + r() * 0.7) * w, y = u * H;
                        g.fillStyle = `rgba(216,236,226,${0.2 + r() * 0.3})`;
                        disc(g, x, y, 0.3 + r() * 0.5);
                    }
                    // the eye: a dark pit with its scales, a light on its lower lip
                    const ex = lean * eyeY + 1;
                    g.fillStyle = 'rgba(6,18,10,0.55)';
                    oval(g, ex, eyeY - 3, 5.5, 2.8, 0);
                    g.fillStyle = 'rgba(120,150,104,0.55)';
                    for (let i = 0; i < 7; i++) oval(g, ex + Math.cos(i * 0.9) * 3, eyeY - 3 + Math.sin(i * 0.9) * 1.5, 1.6, 0.8, i * 0.9 + 1.57);
                    g.fillStyle = 'rgba(2,8,4,0.8)';
                    oval(g, ex, eyeY - 3, 1.3, 0.8);
                    g.fillStyle = 'rgba(190,214,180,0.5)';
                    oval(g, ex - 0.5, eyeY - 0.6, 3.5, 0.7);
                    // a split along a rib on some: the pale inside
                    if (r() < 0.3) {
                        // a split along a rib: a dark lip, the pale flesh, the seeds' grain
                        const x0 = lean * H * 0.6 + (r() - 0.5) * W * 0.25, sp2 = [[x0, H * 0.5], [x0 + 1.4, H * 0.64], [x0 + 0.3, H * 0.8]];
                        taper(g, sp2.map(([x, y]) => [x + 1.2, y]), 1, 3.6, 'rgba(4,14,8,0.5)');
                        taper(g, sp2, 0.8, 3, 'rgba(196,214,186,0.9)');
                        for (let i = 0; i < 6; i++) {
                            g.fillStyle = 'rgba(70,90,60,0.8)';
                            disc(g, x0 + 0.4 + (r() - 0.5) * 1.6, H * (0.58 + r() * 0.18), 0.4);
                        }
                    }
                },
            });
            // the stalk and its bracts, pasted over the neck's top
            const g = sp.canvas.getContext('2d');
            g.setTransform(res, 0, 0, res, -box.x * res, -box.y * res);
            const st = [[0, 4], [0.5, -4], [-0.5, -11]];
            taper(g, st, 6.5, 4, '#1b3324');
            taper(g, st.map(([x, y]) => [x - l2[0] * 1.2 + 0.5, y]), 2.4, 1.2, 'rgba(150,186,150,0.55)');
            g.fillStyle = '#2a4a32';
            for (const a of [-0.7, 0.2, 1.1]) oval(g, Math.cos(a) * 3, 4 + Math.sin(a), 3.4, 1.5, a);
            g.fillStyle = 'rgba(180,206,176,0.6)';
            disc(g, -0.6, -10.6, 1.4);
            sp.rot = lk * LSTEP;
            sp.top = [0, -10];
            sp.H = H;
            return sp;
        });
    }

    // Fig wood: smooth grey «elephant skin» bark, ringed at every node by the stipules'
    // scar, wrinkled at the forks, with lenticels and crusts of lichen.
    const BARK = [[0, '#07110e'], [0.22, '#152520'], [0.42, '#2c403a'], [0.6, '#4d6560'], [0.76, '#77908a'], [0.9, '#a7bcb4'], [1, '#d4e2dc']];
    function figWood(g, pts, o = {}) {
        const sd = S.seedOf(o.seed ?? 'figwood'), rings = o.nodes ?? [], wr = o.wrinkles ?? [];
        return tube(g, pts, {
            ...o, ramp: BARK, bounce: 0.09, seed: o.seed,
            tex: (arc, cu, q, u, side, hw) => {
                let t = 0.09 * S.noise2(arc * 0.012, cu * 0.08, sd) + 0.05 * S.noise2(arc * 0.06, cu * 0.3, sd + 1) + 0.03 * S.noise2(arc * 0.3, cu * 0.9, sd + 4);
                // dark streaks along the grain where the rain runs down
                t -= 0.12 * S.smooth(0.35, 0.65, S.noise2(arc * 0.004, cu * 0.35 + 9, sd + 5)) * S.smooth(-0.2, 0.5, S.noise2(arc * 0.05, cu * 0.6, sd + 6));
                // elephant skin: fine folds across the grain
                t += 0.04 * Math.sin(arc * (0.4 + 0.25 * S.noise2(arc * 0.01, 1, sd + 7)) + 3 * S.noise2(arc * 0.04, cu * 0.25, sd + 2)) * S.smooth(0.3, 0.9, Math.abs(S.noise2(arc * 0.01, 2, sd + 3))) * S.smooth(0.95, 0.4, q);
                // stipule rings at the nodes: a dark line with a pale lip above it
                for (const nd of rings) {
                    const e = arc - nd + 2 * S.noise2(cu * 0.2, nd, sd);
                    t += -0.22 * Math.exp(-e * e / 0.7) + 0.1 * Math.exp(-(e + 1.4) * (e + 1.4) / 0.8);
                }
                // wrinkles where it forks: deep folds, bunched
                for (const [d, wl] of wr) {
                    const e = Math.abs(arc - d);
                    if (e < wl) t += -0.16 * Math.pow(Math.abs(Math.sin((arc - d) * 1.3 + cu * 0.15)), 6) * (1 - e / wl);
                }
                // lenticels: small pale dots, raised
                const ci = Math.floor(arc / 9), cj = Math.floor((cu + 80) / 5), hh = S.hashI(ci, cj, 0, sd);
                if (hh < 0.18) {
                    const ex = (arc - (ci + 0.5) * 9) / (0.9 + hh * 3), ey = (cu + 80 - (cj + 0.5) * 5) / 1.2;
                    t += 0.12 * S.smooth(1, 0.2, ex * ex + ey * ey);
                }
                return t;
            },
            col: (arc, cu, q, u, tone, rgb) => {
                // lichen: grey-green crusts on the old wood
                const li = S.smooth(0.25, 0.5, S.noise2(arc * 0.012 + 9, cu * 0.09, sd + 15)) * S.smooth(-0.3, 0.4, S.noise2(arc * 0.4, cu * 0.4, sd + 16));
                if (li > 0) toward(rgb, 130 + 80 * tone, 158 + 70 * tone, 132 + 60 * tone, li * 0.55 * (o.lichen ?? 1));
                // a little moss in the cracks of the shaded side
                const mo = S.smooth(0.3, 0.6, S.noise2(arc * 0.03, cu * 0.4, sd + 17)) * S.smooth(-0.2, 0.6, -LN[1] * (cu > 0 ? 1 : -1)) * S.smooth(0.4, 0.2, tone);
                if (mo > 0) toward(rgb, 40, 80, 34, mo * 0.6 * (o.lichen ?? 1));
                // the young end is green
                const gm = S.smooth(o.green ?? 0.85, 1, u);
                if (gm > 0) toward(rgb, 30 + 90 * tone, 70 + 110 * tone, 40 + 60 * tone, gm * 0.7);
            },
        });
    }
    // the scar a fallen fig leaf leaves: a large round scar with its ring of bundle dots
    function leafScar(g, x, y, a, w = 9) {
        g.save();
        g.translate(x, y);
        g.rotate(a);
        g.fillStyle = 'rgba(4,12,9,0.5)';
        oval(g, 0.8, 1, w * 0.5, w * 0.42);
        g.fillStyle = '#6f8780';
        oval(g, 0, 0, w * 0.48, w * 0.4);
        g.fillStyle = '#4a605a';
        oval(g, 0.4, 0.4, w * 0.38, w * 0.3);
        g.fillStyle = '#1a2a24';
        for (let i = 0; i < 9; i++) disc(g, Math.cos(i * 0.7) * w * 0.27, Math.sin(i * 0.7) * w * 0.2, 0.55);
        // the bud above it
        g.fillStyle = '#28462f';
        oval(g, 0, -w * 0.55, w * 0.16, w * 0.24);
        g.fillStyle = 'rgba(160,200,150,0.6)';
        oval(g, -w * 0.05, -w * 0.6, w * 0.06, w * 0.12);
        g.restore();
    }
    // the bud at a fig shoot's tip: a green cone of two stipules, pointed
    function figBud(g, x, y, a, len = 26) {
        const c = Math.cos(a), s = Math.sin(a), n = [-s, c], w = len * 0.24;
        const P = (u, v) => [x + c * u * len + n[0] * v * w, y + s * u * len + n[1] * v * w];
        const body = [];
        for (let i = 0; i <= 12; i++) body.push(P(i / 12, Math.pow(1 - i / 12, 0.8)));
        for (let i = 12; i >= 0; i--) body.push(P(i / 12, -Math.pow(1 - i / 12, 0.8)));
        g.fillStyle = '#1f3a22';
        poly(g, body);
        const lit = n[0] * LN[0] + n[1] * LN[1] < 0 ? 1 : -1;
        const half = [];
        for (let i = 0; i <= 12; i++) half.push(P(i / 12, lit * 0.95 * Math.pow(1 - i / 12, 0.8)));
        for (let i = 12; i >= 0; i--) half.push(P(i / 12, lit * 0.1));
        g.fillStyle = 'rgba(120,170,110,0.75)';
        poly(g, half);
        line(g, [P(0.05, 0.05), P(0.95, 0)], 0.6, 'rgba(6,20,10,0.7)'); // the seam of the two stipules
        line(g, [P(0.1, lit * 0.7), P(0.7, lit * 0.25)], 0.7, 'rgba(210,236,200,0.6)');
    }
    // a bead of milky latex on a broken stalk
    function latex(g, x, y, rad = 3) {
        g.fillStyle = 'rgba(4,12,8,0.45)';
        oval(g, x + 1, y + 1.4, rad * 1.05, rad);
        const gr = g.createRadialGradient(x - rad * 0.4, y - rad * 0.4, 0, x, y, rad);
        gr.addColorStop(0, '#f2f6ee');
        gr.addColorStop(0.6, '#c9d6cc');
        gr.addColorStop(1, '#8ea29a');
        g.fillStyle = gr;
        oval(g, x, y, rad, rad * 0.92);
        g.fillStyle = '#ffffff';
        disc(g, x - rad * 0.35, y - rad * 0.4, rad * 0.22);
    }

    // ------------------------------------------------------------------ the agave («pita»)
    const AGAVE = {
        blue: [[0, '#06110e'], [0.2, '#12251f'], [0.38, '#243e37'], [0.55, '#3b5d54'], [0.7, '#5a8173'], [0.84, '#8aab9c'], [1, '#c6d9cf']],
        green: [[0, '#040d0a'], [0.22, '#0c1d16'], [0.42, '#18352a'], [0.6, '#2a4f3e'], [0.78, '#47705c'], [1, '#86a896']],
        dry: [[0, '#151a15'], [0.25, '#323a31'], [0.5, '#5a6356'], [0.72, '#858d7c'], [0.88, '#adb3a0'], [1, '#d2d6c4']],
    };
    // One leaf along +x from its foot at (0, 0): `len` long, `wid` wide at its broadest.
    function agaveGeom(v, len, wid) {
        const r = Motion.rng('agleaf' + v), n = 60, up = [], dn = [];
        const half = (u) => (wid / 2) * (0.68 + 0.32 * Math.sin(Math.PI * Math.min(1, u / 0.6))) * Math.pow(Math.max(0, 1 - u), 0.62 + r() * 0) * (1 + 0.025 * Math.sin(u * 13 + v));
        const bend = (r() - 0.5) * 0.12, B = (x) => bend * len * 4 * (x / len) * (1 - x / len);
        for (let i = 0; i <= n; i++) {
            const u = i / n, x = u * len * 0.93, w = half(u * 0.93);
            up.push([x, B(x) - w]);
            dn.push([x, B(x) + w]);
        }
        // teeth on both margins: hooked, each on a small shoulder
        const teeth = [];
        const gap = Math.max(11, len / (22 + r() * 8));
        for (const sd of [-1, 1]) {
            for (let x = gap * (0.6 + r() * 0.5); x < len * 0.88; x += gap * (0.8 + r() * 0.45)) {
                const u = x / len, w = half(u), sz = (3 + r() * 3.5) * Math.min(1.4, wid / 80) * (1 - u * 0.4);
                teeth.push({ x, y: B(x) + sd * w, sd, sz, hook: (u < 0.45 ? -1 : 1) * (0.4 + r() * 0.5) });
            }
        }
        const tipX = len * 0.93, tip = [len, B(len)];
        const G = { v, len, wid, half, B, up, dn, teeth, tip, tipX, pts: [...up, tip, ...dn.slice().reverse()],
            prints: [r() < 0.7 ? 0.3 + r() * 0.35 : 0, r() < 0.5 ? 0.25 + r() * 0.35 : 0], scratch: r() < 0.4, rub: r() };
        return G;
    }
    // kind: 'blue' (the bloom in the moonlight) | 'green' (in shade) | 'dry' (an old leaf)
    function agaveLeaf(v = 0, rot = 0, res = 1.2, kind = 'blue', len = 420, wid = 84) {
        const lk = lkey(rot);
        len = Math.round(len / 20) * 20;
        wid = Math.round(wid / 8) * 8;
        return memo(`ag${v}/${lk}@${res}${kind}${len}x${wid}`, () => {
            const G = agaveGeom(v, len, wid), r = Motion.rng('agpaint' + v + kind), sd = S.seedOf('ag' + v), l2 = light2(lk), dry = kind === 'dry';
            const box = S.bbox(G.pts, 12);
            const sp = S.form({
                box, res, seed: 'ag' + v, light: S.lightFor(lk * LSTEP), inflate: 'none',
                mask: (g) => {
                    poly(g, G.pts);
                    for (const t of G.teeth) {
                        // the shoulder and the tooth
                        const a = t.sd < 0 ? -Math.PI / 2 : Math.PI / 2;
                        g.beginPath();
                        g.moveTo(t.x - t.sz * 1.1, t.y - t.sd * 0.5);
                        g.quadraticCurveTo(t.x - t.sz * 0.4, t.y + t.sd * t.sz * 0.5, t.x + t.hook * t.sz * 0.6, t.y + t.sd * t.sz * 1.3);
                        g.quadraticCurveTo(t.x + t.sz * 0.3, t.y + t.sd * t.sz * 0.3, t.x + t.sz * 1.1, t.y - t.sd * 0.5);
                        g.fill();
                    }
                    // the spine
                    taper(g, [[G.tipX - 4, G.B(G.tipX)], [len, G.B(len)], [len + len * 0.07, G.B(len) + 1]], 7, 0.8, '#fff');
                },
                height: (x, y) => {
                    const u = Math.min(1, x / len), w = G.half(u) || 1, t = (y - G.B(x)) / w;
                    // channelled: the margins stand up, a keel of a groove down the middle
                    let h = (dry ? 0.12 : 0.3) * wid * Math.pow(Math.min(1.2, Math.abs(t)), 1.4) - 1.2 * Math.exp(-t * t * 30);
                    if (dry) h += 2.2 * Math.sin(x * 0.12 + 4 * S.noise2(x * 0.02, t, sd)) * (1 - Math.abs(t)); // dry: wrinkled lengthwise
                    h += 0.8 * S.noise2(x * 0.05, t * 3, sd + 1);
                    return h;
                },
                ramp: AGAVE[kind] ?? AGAVE.blue, soft: 0.9,
                edge: { rough: 1.4, freq: 0.3, amp: 0.7 },
                mottle: { amp: 0.06, freq: 0.012 },
                stroke: { amp: 0.04, freq: 0.05, tone: 6 },
                markAmp: 0.6,
                marks: (g) => {
                    // the brush goes along the leaf
                    softly(g, 1, (q) => {
                        for (let i = 0; i < 16; i++) {
                            const t = (r() * 2 - 1) * 0.8, x0 = r() * len * 0.5, x1 = x0 + len * (0.2 + r() * 0.5), pts = [];
                            for (let k = 0; k <= 10; k++) {
                                const x = x0 + ((x1 - x0) * k) / 10;
                                pts.push([x, G.B(x) + t * G.half(x / len)]);
                            }
                            S.dab(q, pts, { w: 4 + r() * 10, color: r() < 0.5 ? '#ffffff' : '#000000', alpha: 0.1 + r() * 0.18, bristles: 5, seed: 'agd' + v + i, dry: 0.5, taper: 0.7 });
                        }
                    });
                },
                tint: (x, y, tone, rgb, m) => {
                    if (dry) return;
                    // the bloom: chalky where it is whole, deeper green where it was rubbed off
                    const u = x / len, t = (y - G.B(x)) / (G.half(u) || 1);
                    const rub = S.smooth(0.25, 0.6, S.noise2(x * 0.012 + G.rub * 9, t * 1.4, sd + 3)) * 0.55;
                    toward(rgb, 0.55 * rgb[0], 0.75 * rgb[1], 0.62 * rgb[2], rub);
                    toward(rgb, rgb[0] + 18, rgb[1] + 22, rgb[2] + 26, (1 - rub) * 0.35 * S.smooth(0.3, 0.8, tone));
                    // the tip dries first
                    toward(rgb, 90 + 70 * tone, 98 + 66 * tone, 82 + 50 * tone, S.smooth(0.84, 0.9, u) * 0.6);
                },
                over: (g) => {
                    g.lineCap = 'round';
                    // bud prints: the ghost of the neighbour's margin and its teeth
                    G.prints.forEach((pv, i) => {
                        if (!pv) return;
                        const sg = i ? 1 : -1, pts = [];
                        for (let x = len * 0.08; x < len * 0.8; x += 3) {
                            const u = x / len, w = G.half(u);
                            pts.push([x, G.B(x) + sg * w * (pv + 0.25 * u)]);
                        }
                        line(g, pts, dry ? 2 : 3.4, `rgba(${dry ? '220,224,206' : '196,222,210'},${dry ? 0.2 : 0.3})`);
                        line(g, pts.map(([x, y]) => [x + 1, y + sg * 2.2]), 1, 'rgba(6,20,14,0.3)');
                        for (let k = 6; k < pts.length - 4; k += 5 + (k % 3)) {
                            const [x, y] = pts[k];
                            g.fillStyle = `rgba(206,228,216,${dry ? 0.18 : 0.32})`;
                            g.beginPath();
                            g.moveTo(x - 2.5, y);
                            g.lineTo(x + 1.2, y - sg * 4.2);
                            g.lineTo(x + 2.5, y);
                            g.fill();
                        }
                    });
                    // the teeth: dark, glossy, a pale shoulder under each
                    for (const t of G.teeth) {
                        g.fillStyle = 'rgba(180,206,190,0.35)';
                        oval(g, t.x, t.y - t.sd * 1.2, t.sz * 1.1, t.sz * 0.5);
                        g.fillStyle = dry ? '#3a3a30' : '#141a14';
                        g.beginPath();
                        g.moveTo(t.x - t.sz * 0.45, t.y + t.sd * t.sz * 0.25);
                        g.quadraticCurveTo(t.x - t.sz * 0.1, t.y + t.sd * t.sz * 0.8, t.x + t.hook * t.sz * 0.6, t.y + t.sd * t.sz * 1.3);
                        g.quadraticCurveTo(t.x + t.sz * 0.2, t.y + t.sd * t.sz * 0.4, t.x + t.sz * 0.45, t.y + t.sd * t.sz * 0.2);
                        g.fill();
                        g.fillStyle = 'rgba(200,226,214,0.5)';
                        disc(g, t.x - t.sz * 0.1 + l2[0] * 0.4, t.y + t.sd * t.sz * 0.55, Math.max(0.35, t.sz * 0.12));
                    }
                    // the spine, its base running down the margin
                    const sp0 = [[G.tipX - len * 0.08, G.B(G.tipX - len * 0.08) - G.half(0.85) * 0.6], [G.tipX - 2, G.B(G.tipX)], [len + len * 0.07, G.B(len) + 1]];
                    taper(g, sp0, 3, 0.6, dry ? '#2e2e26' : '#121812');
                    taper(g, [[G.tipX - 4, G.B(G.tipX) - 1], [len + len * 0.05, G.B(len)]], 4.5, 0.6, '#161c16');
                    line(g, [[G.tipX, G.B(G.tipX) - 1.2 - l2[1]], [len + len * 0.04, G.B(len) - 0.5 - l2[1] * 0.5]], 0.8, 'rgba(210,232,220,0.7)');
                    // scratches in the bloom
                    if (G.scratch) for (let i = 0; i < 4 + Math.floor(r() * 5); i++) {
                        const x0 = len * (0.15 + r() * 0.5), t0 = (r() - 0.5) * 0.9, l = 10 + r() * 40, a = (r() - 0.5) * 0.9;
                        const p0 = [x0, G.B(x0) + t0 * G.half(x0 / len)];
                        line(g, [p0, [p0[0] + Math.cos(a) * l, p0[1] + Math.sin(a) * l]], 0.9, 'rgba(8,24,16,0.45)');
                        line(g, [[p0[0] + 0.6, p0[1] + 0.8], [p0[0] + Math.cos(a) * l + 0.6, p0[1] + Math.sin(a) * l + 0.8]], 0.6, 'rgba(200,226,214,0.3)');
                    }
                    // the bloom's powder: fine pale speckle, rubbed thin along the edges
                    for (let i = 0; i < len * 1.2; i++) {
                        const x = r() * len * 0.9, t = r() * 2 - 1;
                        g.fillStyle = `rgba(214,232,226,${0.06 + r() * 0.14})`;
                        disc(g, x, G.B(x) + t * G.half(x / len) * 0.9, 0.4 + r() * 0.6);
                    }
                    // the margin's thickness: a thin light on the lit edge
                    const lit = l2[1] < 0 ? G.up : G.dn;
                    line(g, lit.map(([x, y]) => [x - l2[0] * 0.8, y - l2[1] * 0.8]), 1.1, 'rgba(206,230,218,0.4)');
                    if (dry) {
                        // splits in the dry paper
                        for (let i = 0; i < 4; i++) {
                            const t = (r() - 0.5) * 1.2, x0 = len * (0.3 + r() * 0.3), x1 = x0 + len * (0.15 + r() * 0.3);
                            line(g, [[x0, G.B(x0) + t * G.half(x0 / len)], [x1, G.B(x1) + t * G.half(x1 / len) * 0.8]], 1, 'rgba(10,14,10,0.5)');
                        }
                    }
                },
            });
            sp.rot = lk * LSTEP;
            sp.G = G;
            return sp;
        });
    }
    // A rosette standing on (x, y): leaves fanned up and out from the ground, the heart's
    // cone of young leaves clasped upright, old ones bent down and dry at the foot.
    //   s: its size (1 ≈ 900 wide);  res: sprite pixels per unit at s = 1;  n: leaves;
    //   kinds: the share of 'blue' (else 'green');  dry: how many dead leaves at the foot
    function agave(g, o = {}) {
        const { x = 0, y = 0, s = 1, seed = 1 } = o, r = Motion.rng('agave' + seed), res = Math.max(0.5, Math.round((o.res ?? 1.2) * s * 4) / 4) / s;
        const n = o.n ?? 20, leaves = [];
        // the leaves on a cone: azimuth round the axis and how far each leans out
        for (let i = 0; i < n; i++) {
            const az = (i / n) * TAU + r() * 0.3, lean = 0.35 + r() * 0.55 + (i % 3 === 0 ? 0.3 : 0);
            // screen direction: up for the ones that lean little, out to the sides for the rest
            const dx = Math.sin(az) * Math.sin(lean), dz = Math.cos(az) * Math.sin(lean), dy = -Math.cos(lean);
            const L = (o.len ?? 440) * (0.75 + r() * 0.45), fs = Math.hypot(dx, dy); // foreshortened
            leaves.push({ az, lean, a: Math.atan2(dy, dx) + (r() - 0.5) * 0.1, L, f: Math.max(0.3, fs), dz, kind: r() < (o.blue ?? 0.7) ? 'blue' : 'green', v: Math.floor(r() * 9), wid: (o.wid ?? 86) * (0.85 + r() * 0.35) });
        }
        // old dry leaves at the foot, bent down
        for (let i = 0; i < (o.dry ?? 3); i++) {
            const sg = i % 2 ? 1 : -1;
            leaves.push({ a: sg > 0 ? 0.25 + r() * 0.35 : Math.PI - 0.25 - r() * 0.35, L: (o.len ?? 440) * (0.6 + r() * 0.3), f: 1, dz: -2 + r() * 0.1, kind: 'dry', v: 20 + Math.floor(r() * 4), wid: (o.wid ?? 86) * 0.8 });
        }
        leaves.sort((p, q) => p.dz - q.dz); // the far ones first
        const drawLeaf = (lf, ox = 0, oy = 0) => {
            const sp = agaveLeaf(lf.v, lf.a, res * s, lf.kind, lf.L, lf.wid);
            shadow(g, sp, x + ox, y + oy, s, { rot: lf.a, fx: lf.f, dx: 10 * s, dy: 16 * s, alpha: 0.55, blur: 12 });
            put(g, sp, x + ox, y + oy, s, { rot: lf.a, fx: lf.f });
        };
        const far = leaves.filter((l) => l.dz < 0), near = leaves.filter((l) => l.dz >= 0);
        for (const lf of far) drawLeaf(lf);
        // the heart: young leaves clasped in a cone
        for (let i = 0; i < 5; i++) {
            const a = -Math.PI / 2 + (i - 2) * 0.12 + (r() - 0.5) * 0.05, L = (o.len ?? 440) * (0.5 + r() * 0.2) * (1 - Math.abs(i - 2) * 0.12);
            drawLeaf({ a, L, f: 1, kind: 'blue', v: 30 + i, wid: (o.wid ?? 86) * 0.7 }, (i - 2) * 8 * s, 0);
        }
        for (const lf of near) drawLeaf(lf);
        return { x, y, s };
    }
    // The flowering pole: tall, with bracts, branching at the top into a candelabrum of dry
    // flower clusters.
    const POLE = [[0, '#0b130f'], [0.25, '#1d2a23'], [0.5, '#3a4a40'], [0.72, '#647666'], [0.88, '#93a493'], [1, '#c6d2c2']];
    function quiote(g, o = {}) {
        const { x = 0, y = 0, h = 900, s = 1, seed = 1, lean = 0.05 } = o, r = Motion.rng('quiote' + seed);
        const top = [x + Math.sin(lean) * h * s, y - h * s], path = bowed([x, y], top, 0.03, 20);
        const T = tube(g, path, { w0: 22 * s, w1: 7 * s, ramp: POLE, seed: 'q' + seed, tex: (arc, cu) => 0.06 * S.noise2(arc * 0.03, cu * 0.3, 5) - 0.1 * S.smooth(0.6, 0.9, S.noise2(arc * 0.2, cu * 0.8, 6)), dens: o.dens });
        // bracts: small dry triangles pressed to the pole
        for (let d = 40 * s; d < T.total * 0.7; d += (36 + r() * 30) * s) {
            const p = T.at(d), sg = r() < 0.5 ? -1 : 1, a = p.a + sg * 0.25, l = (16 + r() * 10) * s * (1 - (d / T.total) * 0.5);
            const nx = -Math.sin(p.a) * sg * p.w * 0.5, ny = Math.cos(p.a) * sg * p.w * 0.5;
            taper(g, [[p.x + nx, p.y + ny], [p.x + nx + Math.cos(a) * l * 0.5, p.y + ny + Math.sin(a) * l * 0.5], [p.x + nx * 1.3 + Math.cos(a) * l, p.y + ny * 1.3 + Math.sin(a) * l]], 5 * s, 0.5, '#3f4e44');
            taper(g, [[p.x + nx, p.y + ny], [p.x + nx + Math.cos(a) * l * 0.8, p.y + ny + Math.sin(a) * l * 0.8]], 1.6 * s, 0.3, 'rgba(176,196,180,0.5)');
        }
        // the candelabrum
        const arms = o.arms ?? 7;
        for (let i = 0; i < arms; i++) {
            const d = T.total * (0.66 + (i / arms) * 0.3), p = T.at(d), sg = i % 2 ? 1 : -1, len = (110 - i * 9 + r() * 30) * s;
            const a0 = p.a + sg * (1.35 + r() * 0.2);
            const e1 = [p.x + Math.cos(a0) * len * 0.6, p.y + Math.sin(a0) * len * 0.6], e2 = [e1[0] + Math.cos(a0) * len * 0.3, e1[1] - len * 0.35];
            tube(g, [[p.x, p.y], e1, e2], { w0: 7 * s, w1: 3.5 * s, ramp: POLE, seed: 'qa' + seed + i, shadeA: 0.6, dens: o.dens });
            // the dry flower cluster: capsules on stalks, upright
            for (let k = 0; k < 9; k++) {
                const a = -Math.PI / 2 + (r() - 0.5) * 1.8, l = (14 + r() * 16) * s, cx = e2[0] + Math.cos(a) * l, cy = e2[1] + Math.sin(a) * l;
                line(g, [e2, [cx, cy]], 1.4 * s, '#2a362e');
                g.fillStyle = '#25302a';
                oval(g, cx + 1, cy + 1, 4.4 * s, 7 * s, a + 1.57);
                g.fillStyle = r() < 0.5 ? '#6d7f70' : '#536456';
                oval(g, cx, cy, 4 * s, 6.5 * s, a + 1.57);
                g.fillStyle = 'rgba(200,214,198,0.55)';
                oval(g, cx - 1.2 * s, cy - 1.5 * s, 1.3 * s, 3 * s, a + 1.57);
                if (r() < 0.4) line(g, [[cx, cy - 6 * s], [cx + (r() - 0.5) * 6 * s, cy - (12 + r() * 6) * s]], 0.6 * s, 'rgba(160,176,158,0.6)'); // a dry stamen
            }
        }
        return T;
    }

    // ------------------------------------------------------------------ the prickly pear
    const PAD = [[0, '#06120c'], [0.2, '#10271a'], [0.38, '#1f4229'], [0.55, '#33603a'], [0.7, '#4f7f4c'], [0.84, '#7ea474'], [1, '#bed4aa']];
    function padSprite(v, rot, res, w = 200, h = 150, young = false) {
        const lk = lkey(rot);
        return memo(`pad${v}/${lk}@${res}${w}x${h}${young}`, () => {
            const r = Motion.rng('pad' + v), pts = [];
            for (let i = 0; i < 64; i++) {
                const a = (i / 64) * TAU, k = 1 + 0.04 * Math.sin(a * 3 + v) + 0.03 * Math.sin(a * 5 + v * 2);
                // obovate: broader at the far end (+x)
                pts.push([Math.cos(a) * (w / 2) * k, Math.sin(a) * (h / 2) * k * (0.82 + 0.18 * Math.cos(a))]);
            }
            const box = S.bbox(pts, 14), areoles = [];
            const step = 22 + r() * 4;
            for (let i = -6; i <= 6; i++) for (let j = -6; j <= 6; j++) {
                const ax = (i + j * 0.5) * step + (r() - 0.5) * 4, ay = j * step * 0.85 + (r() - 0.5) * 4;
                if (Math.pow(ax / (w / 2 - 6), 2) + Math.pow(ay / (h / 2 - 6), 2) < 1) areoles.push([ax, ay, r()]);
            }
            const ramp = young ? PAD.map(([t, c]) => [t, S.mix(c, '#c8e09a', 0.18)]) : PAD;
            const sp = S.form({
                box, res, seed: 'pad' + v, light: S.lightFor(lk * LSTEP), relief: 0.22,
                mask: (g) => poly(g, pts), ramp, soft: 0.9,
                height: (x, y) => {
                    let h2 = 0;
                    for (const [ax, ay] of areoles) {
                        const d2 = (x - ax) * (x - ax) + (y - ay) * (y - ay);
                        if (d2 < 120) h2 += 1.6 * Math.exp(-d2 / 30);
                    }
                    return h2 + 1.2 * S.noise2(x * 0.03, y * 0.03, v);
                },
                mottle: { amp: 0.08, freq: 0.03 }, stroke: { amp: 0.04, freq: 0.07, tone: 6 },
                edge: { rough: 1.5, freq: 0.3, amp: 0.7 },
                spec: { amp: 0.25, power: 10, from: 0.45, to: 0.9, ragged: 0.6, color: '#d8ecd8' },
                over: (g) => {
                    // scars and a crust of old wounds
                    for (let i = 0; i < 3; i++) {
                        if (r() < 0.5) continue;
                        const cx = (r() - 0.5) * w * 0.6, cy = (r() - 0.5) * h * 0.6, rr = 4 + r() * 10;
                        g.fillStyle = 'rgba(120,130,100,0.35)';
                        oval(g, cx, cy, rr, rr * 0.7, r() * 3);
                        g.fillStyle = 'rgba(40,46,34,0.4)';
                        oval(g, cx + 1, cy + 1, rr * 0.5, rr * 0.3, r() * 3);
                    }
                    for (const [ax, ay, q] of areoles) {
                        // the areole: a pale tuft round a dark eye
                        g.fillStyle = 'rgba(4,14,8,0.5)';
                        disc(g, ax + 1, ay + 1.2, 2.6);
                        g.fillStyle = 'rgba(176,192,160,0.85)';
                        disc(g, ax, ay, 2.2);
                        g.fillStyle = 'rgba(60,70,44,0.9)';
                        disc(g, ax + 0.3, ay + 0.3, 0.9);
                        // glochids
                        for (let k = 0; k < 6; k++) {
                            const a = k * 1.05 + q * 3;
                            g.fillStyle = 'rgba(210,214,170,0.7)';
                            disc(g, ax + Math.cos(a) * 1.8, ay + Math.sin(a) * 1.8, 0.35);
                        }
                        // a long spine now and then
                        if (q < 0.35) {
                            const a = -1.6 + (q - 0.17) * 6, l = 12 + q * 30;
                            line(g, [[ax, ay], [ax + Math.cos(a) * l, ay + Math.sin(a) * l]], 0.9, 'rgba(226,232,214,0.85)');
                        }
                    }
                },
            });
            sp.rot = lk * LSTEP;
            sp.w = w;
            sp.h = h;
            return sp;
        });
    }
    // A plant: pads grown from each other's rims, from a foot at (x, y); fruit on the top rims.
    function opuntia(g, o = {}) {
        const { x = 0, y = 0, s = 1, seed = 1 } = o, r = Motion.rng('opuntia' + seed), res = Math.max(0.5, Math.round((o.res ?? 1.2) * s * 4) / 4) / s;
        const pads = [{ x: 0, y: 0, a: -Math.PI / 2 + (r() - 0.5) * 0.4, w: 230, h: 165, d: 0 }];
        const want = o.n ?? 10;
        for (let i = 1; pads.length < want && i < 80; i++) {
            const p = pads[Math.floor(r() * pads.length)];
            if (p.d > 3) continue;
            const side = (r() - 0.5) * 1.9, a = p.a + side, w = p.w * (0.72 + r() * 0.24), h = p.h * (0.7 + r() * 0.25);
            const ex = p.x + Math.cos(p.a + side * 0.6) * p.w * 0.46, ey = p.y + Math.sin(p.a + side * 0.6) * p.w * 0.46;
            pads.push({ x: ex + Math.cos(a) * w * 0.48, y: ey + Math.sin(a) * w * 0.48, a, w, h, d: p.d + 1, young: p.d >= 2 && r() < 0.4 });
        }
        pads.sort((p, q) => p.d - q.d);
        for (const [i, p] of pads.entries()) {
            const sp = padSprite((seed * 7 + i) % 11, p.a, res * s, Math.round(p.w / 10) * 10, Math.round(p.h / 10) * 10, p.young);
            shadow(g, sp, x + p.x * s, y + p.y * s, s, { rot: p.a, dx: 9 * s, dy: 14 * s, alpha: 0.5, blur: 10 });
            put(g, sp, x + p.x * s, y + p.y * s, s, { rot: p.a });
            // fruit on the top rim of the outer pads
            if (p.d >= 2 && r() < 0.6) {
                for (let k = 0; k < 1 + Math.floor(r() * 3); k++) {
                    const t = p.a + (r() - 0.5) * 0.8, fx = x + (p.x + Math.cos(t) * p.w * 0.47) * s, fy = y + (p.y + Math.sin(t) * p.w * 0.47) * s;
                    const fsp = padSprite(40 + k, t, res * s, 54, 40, true);
                    put(g, fsp, fx + Math.cos(t) * 20 * s, fy + Math.sin(t) * 20 * s, s, { rot: t });
                    // the navel at its end
                    g.fillStyle = 'rgba(10,26,14,0.7)';
                    oval(g, fx + Math.cos(t) * 44 * s, fy + Math.sin(t) * 44 * s, 5 * s, 3 * s, t + 1.57);
                }
            }
        }
        return pads;
    }

    // ------------------------------------------------------------------ frost stars
    // A six-armed crystal of frost, about `r` in radius, its arms ferns of side branches.
    function frost(g, o = {}) {
        const { x = 0, y = 0, r: R = 80, rot = 0, seed = 1, alpha = 1, glow = 1 } = o, rr = Motion.rng('frost' + seed);
        const arms = [], broken = rr() < 0.4 ? Math.floor(rr() * 6) : -1;
        const style = rr(), nb = 4 + Math.floor(rr() * 4);
        for (let k = 0; k < 6; k++) {
            const a = rot + (k * TAU) / 6 + (rr() - 0.5) * 0.04, len = R * (0.85 + rr() * 0.25) * (k === broken ? 0.45 + rr() * 0.2 : 1), br = [];
            for (let i = 0; i < nb; i++) {
                const u = 0.22 + (i / nb) * 0.7 + (rr() - 0.5) * 0.04;
                if (u * R > len) break;
                const env = Math.sin(Math.PI * Math.min(1, (u - 0.1) / 0.9)) * (style < 0.5 ? 1 : 1 - u * 0.6);
                br.push({ u, l: R * (0.12 + 0.3 * env) * (0.8 + rr() * 0.4), sub: rr() < 0.6 });
            }
            arms.push({ a, len, br });
        }
        g.save();
        g.globalAlpha *= alpha;
        g.lineCap = 'round';
        const pass = (col, wk, blur, dx = 0, dy = 0) => {
            g.save();
            if (blur) {
                g.shadowColor = col;
                g.shadowBlur = blur * S.pxScale(g);
            }
            g.strokeStyle = col;
            g.fillStyle = col;
            for (const A of arms) {
                const c = Math.cos(A.a), s = Math.sin(A.a), P = (u, v) => [x + dx + c * u - s * v, y + dy + s * u + c * v];
                taper(g, [P(R * 0.08, 0), P(A.len * 0.5, 0), P(A.len, 0)], R * 0.07 * wk, R * 0.015 * wk, col);
                for (const b of A.br) {
                    for (const sg of [-1, 1]) {
                        const u0 = b.u * R, ca = Math.cos(Math.PI / 3), sa = Math.sin(Math.PI / 3) * sg;
                        const e = [u0 + ca * b.l, sa * b.l];
                        taper(g, [P(u0, 0), P(u0 + ca * b.l * 0.5, sa * b.l * 0.5), P(e[0], e[1])], R * 0.035 * wk, R * 0.008 * wk, col);
                        if (b.sub) for (let q = 1; q <= 2; q++) {
                            const f = q / 3, bx = u0 + ca * b.l * f, by = sa * b.l * f, l2b = b.l * 0.3 * (1 - f * 0.5);
                            taper(g, [P(bx, by), P(bx + l2b, by)], R * 0.018 * wk, R * 0.005 * wk, col);
                        }
                    }
                }
            }
            // the plate at the heart
            const hex = [];
            for (let k = 0; k < 6; k++) hex.push([x + dx + Math.cos(rot + (k * TAU) / 6) * R * 0.16, y + dy + Math.sin(rot + (k * TAU) / 6) * R * 0.16]);
            poly(g, hex);
            g.restore();
        };
        if (glow) {
            const gr = g.createRadialGradient(x, y, 0, x, y, R * 1.3);
            gr.addColorStop(0, `rgba(200,236,222,${0.22 * glow})`);
            gr.addColorStop(0.4, `rgba(150,206,186,${0.08 * glow})`);
            gr.addColorStop(1, 'rgba(150,206,186,0)');
            g.fillStyle = gr;
            g.fillRect(x - R * 1.3, y - R * 1.3, R * 2.6, R * 2.6);
        }
        pass('rgba(2,16,10,0.45)', 1.25, 0, R * 0.025, R * 0.035); // its shadow: the crystal has a thickness
        pass('rgba(150,206,188,0.55)', 1.6, glow ? R * 0.08 : 0);
        pass('rgba(232,246,240,0.95)', 1, 0);
        // ridges on the plate, and glints where the facets face the moon
        g.strokeStyle = 'rgba(120,170,150,0.7)';
        g.lineWidth = Math.max(0.4, R * 0.008);
        for (let k = 0; k < 6; k++) {
            const a = rot + (k * TAU) / 6;
            g.beginPath();
            g.moveTo(x, y);
            g.lineTo(x + Math.cos(a) * R * 0.15, y + Math.sin(a) * R * 0.15);
            g.stroke();
        }
        g.fillStyle = '#ffffff';
        for (const A of arms) if (rr() < 0.6) disc(g, x + Math.cos(A.a) * A.len * (0.3 + rr() * 0.5), y + Math.sin(A.a) * A.len * (0.3 + rr() * 0.5), Math.max(0.5, R * 0.02));
        disc(g, x - R * 0.04, y - R * 0.05, Math.max(0.6, R * 0.03));
        g.restore();
    }

    // ------------------------------------------------------------------ the fish of shadow
    // A sea bream's body, dark, heading along +x from its middle; about 420 long at s = 1.
    function fish(g, o = {}) {
        const { x = 0, y = 0, s = 1, rot = 0, seed = 1, alpha = 1 } = o, r = Motion.rng('fish' + seed);
        const c = Math.cos(rot), sn = Math.sin(rot), P = (u, v) => [x + (c * u - sn * v) * s, y + (sn * u + c * v) * s];
        // the body: back and belly as curves, nose at +200
        const back = [[200, 6], [188, -26], [160, -60], [110, -96], [40, -112], [-40, -100], [-110, -60], [-150, -26], [-168, -14]];
        const belly = [[-168, 12], [-150, 22], [-100, 48], [-20, 74], [60, 76], [130, 54], [176, 30], [200, 6]];
        const body = S.curve([...back, ...belly], true, 8).map(([u, v]) => P(u, v));
        const tail = S.curve([[-160, -10], [-196, -44], [-240, -96], [-226, -40], [-212, 2], [-232, 52], [-244, 92], [-196, 40], [-160, 10]], true, 6).map(([u, v]) => P(u, v));
        g.save();
        g.globalAlpha *= alpha;
        softly(g, 3, (q) => {
            q.fillStyle = 'rgba(3,14,10,0.92)';
            poly(q, body);
            poly(q, tail);
            // fins: the spiny dorsal, the soft dorsal, the anal, the pelvic, the pectoral
            const fin = (base, out, col) => {
                q.fillStyle = col;
                poly(q, S.curve([...base, ...out.slice().reverse()], true, 6).map(([u, v]) => P(u, v)));
            };
            fin([[100, -98], [40, -112], [-40, -100]], [[-30, -150], [20, -168], [70, -158], [100, -120]], 'rgba(4,18,12,0.6)');
            fin([[-40, -100], [-110, -60]], [[-120, -82], [-70, -126], [-40, -104]], 'rgba(4,18,12,0.55)');
            fin([[-40, 70], [-100, 48]], [[-110, 66], [-80, 96], [-40, 80]], 'rgba(4,18,12,0.55)');
            fin([[60, 76], [30, 76]], [[20, 116], [44, 120], [60, 84]], 'rgba(4,18,12,0.5)');
        });
        // the fins' rays
        g.lineCap = 'round';
        for (let i = 0; i <= 11; i++) {
            const u = 100 - i * 13, b = P(u, -100 - Math.sin((i / 11) * Math.PI) * 10), t = P(u - 6, -128 - Math.sin((i / 11) * Math.PI) * 36 + r() * 6);
            line(g, [b, t], 1.4 * s, 'rgba(130,176,156,0.35)');
        }
        for (let i = 0; i < 9; i++) {
            const a = -0.9 + i * 0.22, b = P(-170, -6 + i * 2), t = P(-170 + Math.cos(Math.PI + a * 0.4) * 70, -6 + Math.sin(a) * 90);
            line(g, [b, t], 1 * s, 'rgba(110,160,140,0.3)');
        }
        // the scales: rows of small arcs, silver where the moon catches them
        g.save();
        g.beginPath();
        S.trace(g, body);
        g.clip();
        for (let row = -6; row <= 5; row++) {
            for (let col = -9; col <= 9; col++) {
                const u = col * 19 + (row % 2) * 9.5, v = row * 13 + u * 0.06;
                const p = P(u, v), lit = S.smooth(-90, -20, v) * (0.35 + 0.65 * r());
                g.strokeStyle = `rgba(${150 + lit * 80},${200 + lit * 40},${180 + lit * 50},${0.1 + lit * 0.32})`;
                g.lineWidth = 1 * s;
                g.beginPath();
                g.arc(p[0], p[1], 8 * s, rot + Math.PI * 0.5, rot + Math.PI * 1.5);
                g.stroke();
            }
        }
        // the lateral line, the gill cover, a cool light along the back
        line(g, S.curve([[150, -40], [80, -66], [0, -72], [-80, -54], [-150, -16]], false, 8).map(([u, v]) => P(u, v)), 1.4 * s, 'rgba(170,214,196,0.45)');
        line(g, S.curve([[130, -70], [116, -30], [122, 10], [140, 40]], false, 8).map(([u, v]) => P(u, v)), 2.4 * s, 'rgba(150,200,180,0.45)');
        line(g, S.curve([[134, -66], [120, -28], [126, 12], [143, 38]], false, 8).map(([u, v]) => P(u, v)), 1.2 * s, 'rgba(0,8,4,0.5)');
        taper(g, S.curve([[188, -26], [160, -60], [110, -96], [40, -112], [-40, -100]], false, 8).map(([u, v]) => P(u, v + 6)), 7 * s, 2 * s, 'rgba(150,204,184,0.35)');
        g.restore();
        // the eye and the mouth
        const e = P(160, -34);
        g.fillStyle = 'rgba(176,214,200,0.9)';
        disc(g, e[0], e[1], 13 * s);
        g.fillStyle = '#04100a';
        disc(g, e[0] + 1 * s, e[1] + 1 * s, 8 * s);
        g.fillStyle = 'rgba(236,250,244,0.95)';
        disc(g, e[0] - 3.5 * s, e[1] - 3.5 * s, 2.6 * s);
        line(g, [P(200, 8), P(184, 14), P(172, 12)], 1.6 * s, 'rgba(150,200,180,0.6)');
        g.restore();
        return { nose: P(200, 0), tail: P(-240, 0) };
    }

    // ------------------------------------------------------------------ ghosts in the haze
    // One square sail in ship units, mapped by Q(u, v): head on the yard at `top` (half-width
    // wt), foot at `bot` (half-width wb), bellied by `bel`. Anatomy painted: the head laced to
    // the yard by robands (a small sag between each), the cloths (vertical panels, each its
    // own tone, a seam with a lit and a dark side), a reef band with its reef points hanging,
    // the bolt-rope round the leeches and foot, the clews pulled to points by the sheets, two
    // buntlines down the front, the yard's shadow on the head, a patch sewn on one sail, damp
    // streaks from the head; the light on every cloth from the surface's own normal.
    const SAIL = S.rampFn([[0, '#0a2118'], [0.25, '#24493a'], [0.48, '#55846d'], [0.68, '#8db9a0'], [0.85, '#bfdcc8'], [1, '#e8f4ea']], 0.9);
    function sail(q, Q, mx, top, bot, wt, wb, bel, s, sd, tier, refl) {
        const NA = Math.max(6, Math.round((wt + wb) / 16)), NB = 12, rc = (bot - top) * 0.07, H = bot - top, Wd = wt + wb;
        const yHead = (a) => top + 1.3 * Math.abs(Math.sin(Math.PI * a * NA));
        const P = (a, b) => {
            const xh = mx - wt + 2 * wt * a, xf = mx - wb + 2 * wb * a, yf = bot - rc * Math.sin(Math.PI * a);
            return Q(xh + (xf - xh) * b + (2 * a - 1) * bel * 0.5 * Math.sin(Math.PI * b), yHead(a) + (yf - yHead(a)) * b);
        };
        const hgt = (a, b) => Math.pow(Math.sin(Math.PI * Math.max(0, Math.min(1, a))), 0.8) * Math.sin(Math.PI * (0.12 + 0.88 * Math.max(0, Math.min(1, b)))) * bel * 2.2;
        const rgb = [0, 0, 0], e = 0.02;
        const tone = (a, b, i) => {
            const dx = (hgt(a + e, b) - hgt(a - e, b)) / (2 * e * Wd), dy = (hgt(a, b + e) - hgt(a, b - e)) / (2 * e * H);
            const nl = Math.hypot(dx, dy, 1), lam = (-dx * LN[0] - dy * LN[1] + LN[2]) / nl;
            let t = 0.12 + lam * 1.05 + (S.hashI(i, tier, 3, sd) - 0.5) * 0.09 + 0.05 * S.noise2(a * 3 + i, b * 5, sd);
            t -= 0.08 * S.smooth(0.5, 0.9, S.noise2(a * NA * 0.7, b * 1.4, sd + 2)) * (1 - b); // damp streaks from the head
            if (b < 0.06) t -= 0.18 * (1 - b / 0.06); // the yard's shadow on the head
            return S.clamp(t, 0.02, 0.98);
        };
        const fill = (t, alpha = 0.92) => {
            SAIL(t, rgb);
            return `rgba(${rgb[0] | 0},${rgb[1] | 0},${rgb[2] | 0},${alpha})`;
        };
        // the cloths, row by row, each quad lit from its own normal
        for (let i = 0; i < NA; i++) {
            const a0 = i / NA, a1 = (i + 1) / NA;
            for (let j = 0; j < NB; j++) {
                const b0 = j / NB, b1 = (j + 1) / NB;
                q.fillStyle = fill(tone((a0 + a1) / 2, (b0 + b1) / 2, i));
                poly(q, [P(a0, b0), P(a1 + 0.004, b0), P(a1 + 0.004, b1 + 0.004), P(a0, b1 + 0.004)]);
            }
        }
        const hair = (pts, w, c) => line(q, pts, w * s, c);
        const along = (a, b0, b1, n = 10) => Array.from({ length: n + 1 }, (_, k) => P(a, b0 + ((b1 - b0) * k) / n));
        const across = (b, a0 = 0, a1 = 1, n = 16) => Array.from({ length: n + 1 }, (_, k) => P(a0 + ((a1 - a0) * k) / n, b));
        // seams: a dark line and a lit line beside it, every cloth
        for (let i = 1; i < NA; i++) {
            hair(along(i / NA, 0.02, 1), 0.8, 'rgba(8,26,18,0.4)');
            hair(along(i / NA + 0.25 / NA / 2, 0.04, 0.98), 0.5, 'rgba(226,244,232,0.28)');
        }
        // a patch sewn on: a square of other cloth with its stitches
        if (S.hashI(tier, 1, 9, sd) < 0.5) {
            const pa = 0.2 + S.hashI(tier, 2, 9, sd) * 0.5, pb = 0.35 + S.hashI(tier, 3, 9, sd) * 0.35, da = 1.3 / NA, db = 0.16;
            q.fillStyle = fill(tone(pa + da / 2, pb + db / 2, 99) - 0.07, 0.85);
            poly(q, [P(pa, pb), P(pa + da, pb), P(pa + da, pb + db), P(pa, pb + db)]);
            for (let k = 0; k <= 12; k++) {
                const t = k / 12;
                for (const [x, y] of [P(pa + da * t, pb + 0.01), P(pa + da * t, pb + db - 0.01), P(pa + 0.01 / NA, pb + db * t), P(pa + da - 0.01 / NA, pb + db * t)]) {
                    q.fillStyle = 'rgba(10,30,20,0.55)';
                    q.fillRect(x - 0.5 * s, y - 0.5 * s, 1.1 * s, 1.1 * s);
                }
            }
        }
        // the reef band (the doubled cloth across) and its reef points hanging from it
        for (const rb of tier === 0 ? [0.15, 0.3] : [0.17]) {
            q.fillStyle = 'rgba(214,236,222,0.35)';
            poly(q, [...across(rb - 0.012), ...across(rb + 0.02).reverse()]);
            hair(across(rb + 0.022), 0.9, 'rgba(8,26,18,0.45)');
            for (let i = 0; i < NA * 2; i++) {
                const a = (i + 0.5) / (NA * 2), [x, y] = P(a, rb + 0.005), sw = (S.hashI(i, tier, 5, sd) - 0.5) * 3;
                q.fillStyle = 'rgba(6,20,14,0.6)';
                q.fillRect(x - 0.7 * s, y - 0.7 * s, 1.4 * s, 1.4 * s);
                hair([[x, y], [x + sw * 0.3 * s, y + (refl ? -4 : 4) * s], [x + sw * s, y + (refl ? -7 : 7) * s]], 0.7, 'rgba(206,232,216,0.6)');
            }
        }
        // buntlines down the front, lying on the belly
        for (const a of [0.3, 0.7]) hair(along(a, 0, 1).map(([x, y], k) => [x + (a - 0.5) * 2 * s * Math.sin((k / 10) * Math.PI), y]), 0.6, 'rgba(6,22,14,0.55)');
        // the bolt-rope round the leeches and the foot; a light on the lit leech
        hair([...along(0, 0, 1), ...across(1), ...along(1, 1, 0)], 1.7, 'rgba(6,20,14,0.7)');
        hair(along(0, 0.03, 0.97).map(([x, y]) => [x + 1.4 * s, y]), 0.7, 'rgba(230,246,236,0.45)');
        // the clews: pulled to points, the clew iron, the sheet running down
        for (const a of [0, 1]) {
            const [x, y] = P(a, 1);
            q.fillStyle = 'rgba(4,16,10,0.85)';
            disc(q, x, y, 2 * s);
            hair([[x, y], [x + (a ? 1 : -1) * 8 * s, y + (refl ? -1 : 1) * 30 * s]], 0.7, 'rgba(8,26,18,0.55)');
        }
        // the yard, its arms past the sail, the footrope sagging under it
        const ya = Q(mx - wt - 12, top - 1), yb = Q(mx + wt + 12, top - 1);
        taper(q, [ya, Q(mx, top - 1.5), yb], 3.4 * s, 2.2 * s, 'rgba(6,20,14,0.92)');
        hair([Q(mx - wt - 10, top - 2.4), Q(mx + wt * 0.6, top - 2.6)], 0.8, 'rgba(200,228,212,0.55)');
        hair(Array.from({ length: 13 }, (_, k) => {
            const t = k / 12;
            return Q(mx - wt - 8 + (2 * wt + 16) * t, top + 4 + Math.sin(Math.PI * t) * 5);
        }), 0.6, 'rgba(8,26,18,0.5)');
    }
    // A two-masted ship under square sails, sitting on the sea at (x, y) (its waterline),
    // its reflection broken by the swell; about 400 long, 420 tall at s = 1.
    function ship(g, o = {}) {
        const { x = 0, y = 0, s = 1, seed = 1, alpha = 0.8, flip = false } = o, r = Motion.rng('ship' + seed), k = flip ? -1 : 1;
        const P = (u, v) => [x + u * s * k, y + v * s];
        const paint = (q, refl) => {
            const Q = (u, v) => P(u, refl ? -v * 0.85 : v);
            // the hull, its sheer rising to the bow, the wale
            q.fillStyle = 'rgba(6,20,16,0.9)';
            poly(q, S.curve([[-190, -46], [-120, -38], [0, -34], [120, -42], [200, -66], [180, -30], [150, -2], [-150, -2], [-186, -20]], true, 6).map(([u, v]) => Q(u, v)));
            q.fillStyle = 'rgba(150,196,180,0.5)';
            poly(q, S.curve([[-186, -36], [0, -28], [190, -56], [190, -52], [0, -24], [-186, -32]], true, 4).map(([u, v]) => Q(u, v)));
            // gunports along the wale
            q.fillStyle = 'rgba(2,10,6,0.8)';
            for (let i = 0; i < 7; i++) q.fillRect(Q(-130 + i * 40, -20)[0] - 4 * s, Q(-130 + i * 40, refl ? -16 : -20)[1], 8 * s, 6 * s * (refl ? -1 : 1));
            // masts, yards, bowsprit
            q.strokeStyle = 'rgba(8,26,18,0.85)';
            q.lineWidth = 4 * s;
            for (const [mx, mh] of [[60, 380], [-80, 340]]) {
                q.beginPath();
                q.moveTo(...Q(mx, -36));
                q.lineTo(...Q(mx, -36 - mh));
                q.stroke();
            }
            q.beginPath();
            q.moveTo(...Q(190, -60));
            q.lineTo(...Q(290, -110));
            q.stroke();
            // sails: three square sails a mast, each narrower than the one under it. A square
            // sail is cloth cut straight: its head laced flat along the yard, its clews pulled
            // to points by the sheets, its leeches bowed by the wind, its foot cut with a roach.
            // The belly is in the light across it (cloth by cloth, row by row, from the surface's
            // own normal), never in a rounded outline: a soft outline reads as a pillow.
            for (const [mx, mh] of [[60, 380], [-80, 340]]) {
                for (let i = 0; i < 3; i++) {
                    const bot = -64 - i * mh * 0.27, top = bot - mh * 0.21, wt = 74 - i * 18, wb = 84 - i * 18, bel = 12 - i * 3;
                    sail(q, Q, mx, top, bot, wt, wb, bel, s, seed * 31 + mx + i * 7, i, refl);
                }
            }
            // jibs
            for (let i = 0; i < 2; i++) {
                q.fillStyle = 'rgba(180,214,200,0.55)';
                poly(q, [Q(60, -300 + i * 60), Q(280 - i * 40, -104 + i * 18), Q(170 - i * 20, -80 + i * 10)]);
            }
            // rigging: shrouds and stays, hairlines
            q.strokeStyle = 'rgba(16,40,30,0.6)';
            q.lineWidth = 0.8 * s;
            for (const [mx, mh] of [[60, 380], [-80, 340]]) {
                for (let i = -3; i <= 3; i++) {
                    if (!i) continue;
                    q.beginPath();
                    q.moveTo(...Q(mx + i * 14, -38));
                    q.lineTo(...Q(mx, -36 - mh * 0.62));
                    q.stroke();
                }
                q.beginPath();
                q.moveTo(...Q(mx, -36 - mh));
                q.lineTo(...Q(mx + (mx > 0 ? 230 : 140), mx > 0 ? -108 : -36 - 380));
                q.stroke();
            }
            // a pennant at the main truck, blown by the wind
            q.fillStyle = 'rgba(190,226,212,0.6)';
            poly(q, S.curve([[60, -416], [20, -410], [-30, -420], [-60, -414], [-30, -408], [20, -402], [60, -404]], true, 6).map(([u, v]) => Q(u, v)));
        };
        g.save();
        g.globalAlpha *= alpha;
        softly(g, 1.2, (q) => paint(q, false));
        // the reflection, broken into slices by the swell
        const sh = canvas(g.canvas.width, g.canvas.height), q = sh.getContext('2d');
        q.setTransform(g.getTransform());
        paint(q, true);
        const m = g.getTransform(), kx = Math.hypot(m.a, m.b);
        g.save();
        g.setTransform(1, 0, 0, 1, 0, 0);
        g.globalAlpha *= 0.45;
        const y0 = m.d * y + m.f, H = 360 * s * kx;
        for (let yy = 0; yy < H; yy += Math.max(2, 4 * s * kx)) {
            const off = Math.sin(yy * 0.13 + seed) * 6 * s * kx * (0.3 + yy / H) + (r() - 0.5) * 4 * s * kx;
            g.drawImage(sh, 0, y0 + yy, sh.width, Math.max(1, 3 * s * kx), off, y0 + yy, sh.width, Math.max(1, 3 * s * kx));
        }
        g.restore();
        g.restore();
    }
    // A horse standing on a crest at (x, y) (its hooves), facing +x (or −x with flip), head
    // up, mane and tail blown by the wind; about 300 tall at s = 1.
    function horse(g, o = {}) {
        const { x = 0, y = 0, s = 1, seed = 1, alpha = 0.8, flip = false, wind = -1 } = o, r = Motion.rng('horse' + seed), k = flip ? -1 : 1;
        const P = (u, v) => [x + u * s * k, y + v * s];
        const outline = S.curve([
            [92, -176], [70, -204], [40, -214], [0, -206], [-40, -204], [-78, -212], [-104, -196], [-112, -168], // back, croup
            [-106, -132], [-96, -110], [-104, -78], [-110, -46], [-104, -22], [-100, 0], [-86, 0], [-88, -24], [-84, -52], [-78, -82], [-66, -110], // hind leg (far one behind)
            [-50, -120], [-10, -114], [30, -116], [52, -120], // belly
            [56, -96], [58, -54], [60, -22], [62, 0], [76, 0], [74, -24], [74, -58], [78, -100], [82, -130], // foreleg
            [96, -150], [108, -186], [118, -222], [136, -250], [150, -256], [168, -236], [184, -212], [190, -198], [180, -190], [164, -196], [144, -214], [126, -206], [112, -178], [104, -160],
        ], true, 6).map(([u, v]) => P(u, v));
        const far = [
            S.curve([[-74, -110], [-82, -76], [-76, -48], [-70, -22], [-68, 0], [-56, 0], [-60, -24], [-62, -56], [-56, -100]], true, 6),
            S.curve([[44, -120], [40, -84], [36, -50], [34, -22], [32, 0], [44, 0], [46, -22], [50, -56], [58, -110]], true, 6),
        ].map((p) => p.map(([u, v]) => P(u, v)));
        g.save();
        g.globalAlpha *= alpha;
        softly(g, 1.6, (q) => {
            q.fillStyle = 'rgba(120,168,150,0.55)';
            for (const f of far) poly(q, f);
            const gr = q.createLinearGradient(...P(0, -260), ...P(0, 0));
            gr.addColorStop(0, 'rgba(214,236,226,0.92)');
            gr.addColorStop(0.55, 'rgba(160,200,184,0.85)');
            gr.addColorStop(1, 'rgba(100,146,128,0.6)');
            q.fillStyle = gr;
            poly(q, outline);
        });
        // the form: shade on the far side of the barrel, the haunch, the shoulder, the neck
        g.save();
        g.beginPath();
        S.trace(g, outline);
        g.clip();
        softly(g, 6, (q) => {
            q.fillStyle = 'rgba(30,70,56,0.45)';
            poly(q, S.curve([[-100, -150], [-40, -122], [40, -124], [80, -140], [60, -118], [-20, -112], [-96, -120]], true, 6).map(([u, v]) => P(u, v)));
            q.fillStyle = 'rgba(30,70,56,0.3)';
            oval(q, ...P(-70, -160), 26 * s, 34 * s, 0.3);
            oval(q, ...P(70, -150), 18 * s, 30 * s, -0.2);
            q.fillStyle = 'rgba(240,252,246,0.35)';
            oval(q, ...P(-10, -192), 70 * s, 10 * s, 0);
            oval(q, ...P(120, -224), 10 * s, 26 * s, -0.7);
        });
        // muscle strokes, the eye, the nostril
        for (const seg of [[[-90, -170], [-74, -140], [-80, -112]], [[72, -168], [84, -140], [78, -118]], [[106, -190], [126, -222], [146, -244]], [[-30, -160], [10, -150], [40, -152]]]) {
            line(g, S.curve(seg, false, 6).map(([u, v]) => P(u, v)), 1.4 * s, 'rgba(40,84,66,0.4)');
        }
        g.restore();
        g.fillStyle = 'rgba(6,20,14,0.85)';
        disc(g, ...P(158, -238), 3.2 * s);
        oval(g, ...P(185, -204), 2.4 * s, 1.6 * s, 0.5);
        // ears
        g.fillStyle = 'rgba(190,222,210,0.85)';
        poly(g, [P(140, -252), P(138, -278), P(148, -256)]);
        poly(g, [P(148, -254), P(150, -276), P(156, -252)]);
        // hooves
        g.fillStyle = 'rgba(14,34,26,0.8)';
        for (const hx of [-93, 69, -62, 38]) g.fillRect(P(hx - 7, -6)[0] - (k < 0 ? 14 * s : 0), P(0, -6)[1], 14 * s, 6 * s);
        // the mane and the tail: strands blown towards `wind`
        g.lineCap = 'round';
        for (let i = 0; i < 46; i++) {
            const u = i / 45, b = S.curve([[96, -176], [112, -204], [130, -238], [146, -254]], false, 8), p = b[Math.floor(u * (b.length - 1))];
            const len = (30 + r() * 40) * (1 - u * 0.4), a = Math.PI + (wind < 0 ? 0.35 : -0.35) + (r() - 0.5) * 0.5;
            const e = [p[0] + Math.cos(a) * len * k, p[1] + Math.sin(a) * len - 8], m2 = [(p[0] + e[0]) / 2, (p[1] + e[1]) / 2 - 8 + r() * 10];
            line(g, [P(p[0], p[1]), P(m2[0], m2[1]), P(e[0], e[1])], (0.8 + r() * 1.6) * s, `rgba(${180 + r() * 60},${220 + r() * 30},${206 + r() * 40},${0.4 + r() * 0.4})`);
        }
        for (let i = 0; i < 46; i++) {
            // the tail: falls from its dock, then the wind takes it back
            const len = 110 + r() * 60, root = [-106 + r() * 4, -186 + r() * 8], sw = 30 + r() * 26;
            const pts = [];
            for (let j = 0; j <= 10; j++) {
                const t = j / 10;
                pts.push([root[0] - 10 * t - sw * t * t + Math.sin(t * 5 + i) * 4, root[1] + len * t * (1 - 0.25 * t)]);
            }
            line(g, pts.map(([u, v]) => P(u, v)), (0.8 + r() * 1.6) * s, `rgba(${170 + r() * 60},${210 + r() * 40},${196 + r() * 40},${0.3 + r() * 0.45})`);
        }
        g.restore();
    }

    // ------------------------------------------------------------------ the high railings
    const IRON = [[0, '#030a07'], [0.25, '#0a1d15'], [0.45, '#163a2a'], [0.62, '#25543e'], [0.78, '#3f7559'], [0.9, '#6e9e84'], [1, '#b8d6c6']];
    const ironTex = (sd, twist = 0) => (arc, cu, q, u, side, hw) => {
        let t = 0.04 * S.noise2(arc * 0.05, cu * 0.4, sd);
        // the paint flaked off to black iron in patches
        const fl = S.smooth(0.42, 0.5, S.noise2(arc * 0.035, cu * 0.25 + 3, sd + 1) + 0.25 * S.noise2(arc * 0.3, cu * 0.9, sd + 2));
        t -= fl * 0.22;
        // a twisted bar: the light winds round it
        if (twist) t += 0.16 * Math.sin(arc * twist + (cu / Math.max(1, hw)) * 2.4);
        return t;
    };
    const ironCol = (sd) => (arc, cu, q, u, tone, rgb) => {
        const fl = S.smooth(0.42, 0.5, S.noise2(arc * 0.035, cu * 0.25 + 3, sd + 1) + 0.25 * S.noise2(arc * 0.3, cu * 0.9, sd + 2));
        if (fl > 0) toward(rgb, 18 + 50 * tone, 22 + 52 * tone, 22 + 50 * tone, fl * 0.8);
    };
    const bar = (g, pts, w, seed, o = {}) => tube(g, pts, { w0: w, w1: w * (o.taper ?? 1), ramp: IRON, seed, tex: ironTex(S.seedOf(seed), o.twist ?? 0), col: ironCol(S.seedOf(seed)), edge: false, shadeA: o.shadeA ?? 1, raw: o.raw, dens: o.dens, bounce: 0.12 });
    // a scroll: a spiral from its eye outwards, then a tail; as points
    const scrollPts = (cx, cy, r0, turns, a0, sg, tail) => {
        const out = [];
        for (let i = 0; i <= 40; i++) {
            const t = i / 40, a = a0 + sg * t * turns * TAU, rr = r0 * (0.15 + 0.85 * t);
            out.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]);
        }
        if (tail) out.push(tail);
        return out;
    };
    // A wrought-iron balcony rail from x0 to x1: hand-rail at `top`, a band of scrolls, square
    // bars (every third one twisted), a bottom rail at `bottom`; water beading under the rails.
    function railing(g, o = {}) {
        const { x0 = -600, x1 = 600, top = 0, bottom = 300, seed = 'rail', dens } = o, r = Motion.rng('railing' + seed);
        const band = top + 26, band2 = top + 92, pitch = o.pitch ?? 36;
        const bars = [];
        for (let x = x0 + pitch * 0.5; x < x1; x += pitch) bars.push(x + (r() - 0.5) * 1.5);
        // the bars first (behind the rails)
        bars.forEach((x, i) => bar(g, [[x, band2 - 4], [x + (r() - 0.5) * 1.5, (band2 + bottom) / 2], [x + (r() - 0.5) * 2, bottom + 4]], 8, seed + 'b' + i, { twist: i % 3 === 1 ? 0.55 : 0, dens }));
        // the scroll band: pairs of C-scrolls back to back, tied by collars
        for (let i = 0; i < bars.length - 1; i += 1) {
            const xa = bars[i], xb = bars[i + 1], cx = (xa + xb) / 2, h = band2 - band, rr = Math.min(h * 0.24, (xb - xa) * 0.3);
            const up = scrollPts(cx - rr * 0.2, band + rr * 1.05, rr, 1.2, Math.PI * 0.5, i % 2 ? 1 : -1, [cx, band + h * 0.5]);
            const dn = scrollPts(cx + rr * 0.2, band2 - rr * 1.05, rr, 1.2, -Math.PI * 0.5, i % 2 ? 1 : -1, [cx, band + h * 0.5]);
            bar(g, up.reverse(), 4.4, seed + 'su' + i, { raw: false, dens, shadeA: 0.7 });
            bar(g, dn.reverse(), 4.4, seed + 'sd' + i, { raw: false, dens, shadeA: 0.7 });
            // the collar that ties them
            g.fillStyle = '#0e2219';
            g.fillRect(cx - 4, band + h * 0.5 - 5, 8, 10);
            g.fillStyle = 'rgba(120,170,146,0.6)';
            g.fillRect(cx - 4, band + h * 0.5 - 5, 8, 2);
        }
        // the rails
        bar(g, [[x0, band], [x1, band]], 7, seed + 'r1', { dens });
        bar(g, [[x0, band2], [x1, band2]], 7, seed + 'r2', { dens });
        bar(g, [[x0, bottom], [x1, bottom]], 10, seed + 'r3', { dens });
        const hand = bar(g, [[x0 - 10, top], [x1 + 10, top + 1]], 17, seed + 'h', { dens, shadeA: 1.3 });
        // the hand-rail is flat on top: a band of light along it, worn bright by hands
        g.fillStyle = 'rgba(150,200,176,0.45)';
        g.fillRect(x0 - 10, top - 7.5, x1 - x0 + 20, 2.4);
        for (let x = x0; x < x1; x += 6 + r() * 30) {
            g.fillStyle = `rgba(190,226,210,${0.15 + r() * 0.35})`;
            g.fillRect(x, top - 7.5, 3 + r() * 20, 1.4);
        }
        // water beading under the rails, a drop about to fall
        const beads = [];
        for (const [yy, n] of [[top + 8.5, 26], [bottom + 5, 22]]) {
            for (let i = 0; i < n; i++) {
                const x = x0 + r() * (x1 - x0), rad = 1.6 + r() * r() * 3.5;
                beads.push([x, yy + rad * 0.6, rad, r() < 0.25]);
            }
        }
        for (const [x, y, rad, hang] of beads) drop(g, x, y, rad, hang ? 0.8 : 0.2);
        return { bars, band, band2, top, bottom, hand };
    }
    // A drop of water, moonlit: dark towards the lamp, bright on the far side, a point of light.
    function drop(g, x, y, rad = 3, hang = 0) {
        const lx = LN[0] / Math.hypot(LN[0], LN[1]), ly = LN[1] / Math.hypot(LN[0], LN[1]);
        g.save();
        g.translate(x, y);
        const body = () => {
            g.beginPath();
            if (hang) {
                g.moveTo(0, -rad * (1 + hang * 1.5));
                g.bezierCurveTo(rad * 0.2, -rad * 1.1, rad, -rad * 0.7, rad, 0);
                g.arc(0, 0, rad, 0, Math.PI);
                g.bezierCurveTo(-rad, -rad * 0.7, -rad * 0.2, -rad * 1.1, 0, -rad * (1 + hang * 1.5));
            } else g.arc(0, 0, rad, 0, TAU);
        };
        g.fillStyle = 'rgba(2,12,8,0.35)';
        oval(g, -lx * rad * 0.5, -ly * rad * 0.5 + rad * 0.3, rad * 1.05, rad);
        body();
        const gr = g.createLinearGradient(lx * rad, ly * rad, -lx * rad, -ly * rad);
        gr.addColorStop(0, 'rgba(2,14,10,0.6)');
        gr.addColorStop(0.5, 'rgba(30,70,56,0.25)');
        gr.addColorStop(1, 'rgba(214,240,228,0.75)');
        g.fillStyle = gr;
        g.fill();
        g.fillStyle = 'rgba(244,252,248,0.95)';
        oval(g, lx * rad * 0.4, ly * rad * 0.4, rad * 0.28, rad * 0.2, Math.atan2(ly, lx) + 1.57);
        g.restore();
    }

    // ------------------------------------------------------------------ tin lanterns
    const TIN = (t) => S.mix('#0d1a16', '#d8e6e0', Math.max(0, Math.min(1, t)));
    // A tin lantern hanging from (x, y) (its ring), about 150 × 290 at s = 1: a ring, a pierced
    // cap, a crown, four glass panes (two seen) in soldered frames, a candle stub, a pierced
    // tray. `shiver`: how far it trembles (a second, fainter outline).
    function lantern(g, o = {}) {
        const { x = 0, y = 0, s = 1, seed = 1, shiver = 3, turn = 0.35 } = o, r = Motion.rng('lantern' + seed);
        const draw = (q, ox, alpha) => {
            q.save();
            q.globalAlpha *= alpha;
            q.translate(x + ox * s, y);
            q.scale(s, s);
            q.lineCap = 'round';
            q.lineJoin = 'round';
            const fw = 66 * (1 - turn * 0.5), sw = 66 * turn; // front and side faces' widths
            const L = -fw / 2 - sw * 0.4, M = fw / 2 - sw * 0.4, Rr = M + sw;
            // the ring
            q.strokeStyle = TIN(0.15);
            q.lineWidth = 5;
            q.beginPath();
            q.ellipse(0, 10, 11, 13, 0, 0, TAU);
            q.stroke();
            q.strokeStyle = TIN(0.75);
            q.lineWidth = 1.6;
            q.beginPath();
            q.ellipse(-1, 9, 10, 12, 0, Math.PI * 0.9, Math.PI * 1.6);
            q.stroke();
            // the cap: a pyramid, its front face lit, its side in shade, pierced in rings
            const capTop = 26, capBot = 92;
            const cf = q.createLinearGradient(L - 8, capTop, M + 2, capBot);
            cf.addColorStop(0, TIN(0.85));
            cf.addColorStop(0.5, TIN(0.55));
            cf.addColorStop(1, TIN(0.35));
            q.fillStyle = cf;
            poly(q, [[-6, capTop], [L - 8, capBot], [M + 2, capBot], [2, capTop]]);
            const cs = q.createLinearGradient(2, capTop, Rr + 6, capBot);
            cs.addColorStop(0, TIN(0.4));
            cs.addColorStop(1, TIN(0.12));
            q.fillStyle = cs;
            poly(q, [[2, capTop], [M + 2, capBot], [Rr + 6, capBot - 6], [6, capTop]]);
            // the ridge where the faces meet catches the moon
            line(q, [[-2, capTop + 2], [M + 1, capBot - 1]], 1.4, 'rgba(230,244,238,0.7)');
            // brushed tin: streaks down the slope
            for (let k = 0; k < 14; k++) {
                const t0 = r(), xa = -6 + (L - 8 + 6) * t0 * 0.2, ya = capTop + 4;
                line(q, [[xa + (r() - 0.5) * 6, ya], [L - 8 + (M + 10 - L) * r(), capBot - 2]], 0.6, `rgba(${r() < 0.5 ? '230,244,238' : '4,14,10'},${0.1 + r() * 0.15})`);
            }
            for (let ring = 0; ring < 4; ring++) {
                const yy = capTop + 14 + ring * 13, f = (yy - capTop) / (capBot - capTop), half = (fw * 0.55 + 6) * f;
                for (let k = -6; k <= 6; k++) {
                    const xx = (k / 6) * half * 0.9 - 2;
                    if (Math.abs(xx) > half) continue;
                    q.fillStyle = 'rgba(2,8,6,0.85)';
                    disc(q, xx, yy, 1.5 + (ring % 2) * 0.4);
                    q.fillStyle = 'rgba(220,236,230,0.6)';
                    disc(q, xx + 0.5, yy + 1.2, 0.5);
                }
            }
            // the crown: a band of scallops
            q.fillStyle = TIN(0.45);
            q.fillRect(L - 10, capBot, Rr - L + 18, 12);
            for (let xx = L - 8; xx < Rr + 6; xx += 9) {
                q.fillStyle = TIN(0.7);
                q.beginPath();
                q.arc(xx + 4.5, capBot + 12, 4.5, 0, Math.PI);
                q.fill();
                q.fillStyle = 'rgba(2,8,6,0.7)';
                disc(q, xx + 4.5, capBot + 6, 1.2);
            }
            // the body: two panes of glass in their frames
            const bTop = capBot + 14, bBot = bTop + 140;
            const glass = (pts, tone) => {
                q.fillStyle = `rgba(${10 + tone * 30},${30 + tone * 50},${24 + tone * 46},0.82)`;
                poly(q, pts);
            };
            glass([[L, bTop], [M, bTop], [M, bBot], [L, bBot]], 0.4);
            glass([[M, bTop], [Rr, bTop - 4], [Rr, bBot - 4], [M, bBot]], 0.15);
            // the inside: dark at the back, the far panes' frames seen through the glass
            const ins = q.createLinearGradient(0, bTop, 0, bBot);
            ins.addColorStop(0, 'rgba(2,10,6,0.35)');
            ins.addColorStop(1, 'rgba(60,100,84,0.2)');
            q.fillStyle = ins;
            q.fillRect(L, bTop, Rr - L, bBot - bTop);
            line(q, [[L + (M - L) * 0.62, bTop + 2], [L + (M - L) * 0.62, bBot - 2]], 2, 'rgba(120,150,140,0.35)');
            // soot on the inside of the glass, at the top
            q.fillStyle = 'rgba(4,10,8,0.35)';
            q.fillRect(L, bTop, Rr - L, 18);
            // the candle stub inside, unlit, seen through the glass
            q.fillStyle = 'rgba(190,212,200,0.55)';
            q.fillRect(-10, bBot - 50, 18, 46);
            q.fillStyle = 'rgba(230,240,234,0.6)';
            oval(q, -1, bBot - 50, 9, 3);
            line(q, [[-1, bBot - 52], [0, bBot - 60]], 1.2, 'rgba(10,20,16,0.8)');
            // reflections on the glass: streaks of the moon
            q.fillStyle = 'rgba(220,244,234,0.28)';
            poly(q, [[L + 6, bTop + 6], [L + 16, bTop + 6], [L + 8, bBot - 10], [L + 2, bBot - 10]]);
            q.fillStyle = 'rgba(220,244,234,0.14)';
            poly(q, [[L + 22, bTop + 6], [L + 26, bTop + 6], [L + 18, bBot - 30], [L + 15, bBot - 30]]);
            // a cracked pane
            if (r() < 0.6) {
                const cx = M - 14, cy = bTop + 40 + r() * 50;
                q.strokeStyle = 'rgba(220,240,232,0.6)';
                q.lineWidth = 0.7;
                for (let k = 0; k < 5; k++) {
                    const a = r() * TAU, l = 10 + r() * 26;
                    q.beginPath();
                    q.moveTo(cx, cy);
                    q.lineTo(cx + Math.cos(a) * l * 0.5 + (r() - 0.5) * 4, cy + Math.sin(a) * l * 0.5);
                    q.lineTo(cx + Math.cos(a) * l, cy + Math.sin(a) * l);
                    q.stroke();
                }
            }
            // the frames: tin strips, their soldered seams beaded
            for (const [xx, w, t] of [[L - 4, 7, 0.55], [M - 3, 7, 0.75], [Rr - 3, 6, 0.3]]) {
                q.fillStyle = TIN(t);
                q.fillRect(xx, bTop - 2, w, bBot - bTop + 4);
                q.fillStyle = TIN(t + 0.25);
                q.fillRect(xx + 1, bTop, 1.6, bBot - bTop);
                for (let yy = bTop + 4; yy < bBot; yy += 7) {
                    q.fillStyle = 'rgba(200,214,206,0.45)';
                    disc(q, xx + w * 0.6, yy + r() * 2, 1.1);
                }
            }
            q.fillStyle = TIN(0.5);
            q.fillRect(L - 6, bTop - 4, Rr - L + 10, 7);
            q.fillRect(L - 6, bBot - 2, Rr - L + 10, 7);
            // the tray: a shallow pan, pierced
            q.fillStyle = TIN(0.4);
            poly(q, [[L - 10, bBot + 5], [Rr + 8, bBot + 3], [Rr + 2, bBot + 22], [L - 4, bBot + 24]]);
            q.fillStyle = TIN(0.72);
            q.fillRect(L - 10, bBot + 5, Rr - L + 18, 3);
            for (let xx = L - 2; xx < Rr; xx += 10) {
                q.fillStyle = 'rgba(2,8,6,0.8)';
                disc(q, xx, bBot + 15, 1.6);
            }
            // a finial drop under it
            q.fillStyle = TIN(0.5);
            poly(q, [[-6, bBot + 24], [6, bBot + 24], [0, bBot + 46]]);
            q.fillStyle = TIN(0.85);
            disc(q, -1, bBot + 30, 2);
            // dents and a run of dark where the rain sits
            for (let k = 0; k < 6; k++) {
                const dx = L + r() * (Rr - L), dy = capTop + 30 + r() * 180;
                q.fillStyle = `rgba(2,10,6,${0.15 + r() * 0.2})`;
                oval(q, dx, dy, 2 + r() * 3, 1 + r() * 2, r() * 3);
                q.fillStyle = `rgba(220,236,230,${0.2 + r() * 0.2})`;
                oval(q, dx - 1, dy - 1, 1.4, 0.8, r() * 3);
            }
            q.restore();
        };
        // it trembles: a fainter copy a hair to the side, as if two instants of it
        draw(g, shiver, 0.28);
        draw(g, -shiver * 0.4, 0.2);
        draw(g, 0, 1);
        return { bottom: y + 300 * s };
    }

    // ------------------------------------------------------------------ glass tambourines
    // A pandero of glass, seen at a slant: a rim that catches the light, jingles in slots, a
    // pane of glass for a skin, cracked where a blow wounded it. (x, y) its middle, r its
    // radius, tilt how much it is turned from facing us (0 … 1).
    function tambourine(g, o = {}) {
        const { x = 0, y = 0, r: R = 90, rot = 0, tilt = 0.4, seed = 1, crack = true } = o, rr = Motion.rng('pandero' + seed);
        const ry = R * (1 - tilt * 0.7);
        g.save();
        g.translate(x, y);
        g.rotate(rot);
        // the pane: the faintest tint, reflections across it
        g.fillStyle = 'rgba(150,210,190,0.12)';
        oval(g, 0, 0, R, ry);
        g.save();
        g.beginPath();
        g.ellipse(0, 0, R, ry, 0, 0, TAU);
        g.clip();
        for (let k = 0; k < 3; k++) {
            const a = -0.9 + k * 0.25, w = R * (0.08 + rr() * 0.12), off = -R * 0.4 + k * R * 0.35;
            g.fillStyle = `rgba(226,246,238,${0.1 + rr() * 0.16})`;
            g.save();
            g.rotate(a);
            g.fillRect(off, -R * 1.2, w, R * 2.4);
            g.restore();
        }
        g.restore();
        // the rim: a thick ring of glass, dark where it refracts, bright edges
        g.lineWidth = R * 0.13;
        g.strokeStyle = 'rgba(30,80,64,0.45)';
        g.beginPath();
        g.ellipse(0, 0, R, ry, 0, 0, TAU);
        g.stroke();
        g.lineWidth = R * 0.03;
        g.strokeStyle = 'rgba(214,240,230,0.8)';
        g.beginPath();
        g.ellipse(0, 0, R * 1.05, ry * 1.05, 0, Math.PI * 0.95, Math.PI * 1.7);
        g.stroke();
        g.strokeStyle = 'rgba(214,240,230,0.5)';
        g.beginPath();
        g.ellipse(0, 0, R * 0.95, ry * 0.95, 0, Math.PI * 0.05, Math.PI * 0.6);
        g.stroke();
        // the jingles: pairs of small glass discs in slots round the frame
        for (let k = 0; k < 5; k++) {
            const a = (k / 5) * TAU + 0.3, jx = Math.cos(a) * R, jy = Math.sin(a) * ry;
            g.fillStyle = 'rgba(4,16,10,0.6)';
            g.fillRect(jx - R * 0.09, jy - R * 0.05, R * 0.18, R * 0.1);
            for (const d of [-1, 1]) {
                g.fillStyle = 'rgba(170,220,204,0.45)';
                oval(g, jx + d * R * 0.03, jy, R * 0.07, R * 0.07 * (1 - tilt * 0.5));
                g.strokeStyle = 'rgba(230,248,240,0.75)';
                g.lineWidth = Math.max(0.5, R * 0.01);
                g.beginPath();
                g.ellipse(jx + d * R * 0.03, jy, R * 0.07, R * 0.07 * (1 - tilt * 0.5), 0, Math.PI, Math.PI * 1.7);
                g.stroke();
            }
            g.fillStyle = 'rgba(220,236,230,0.9)';
            disc(g, jx, jy, Math.max(0.6, R * 0.012)); // the pin
        }
        // the crack: a star from where the blow fell, a shard gone
        if (crack) {
            const cx = (rr() - 0.5) * R * 0.6, cy = (rr() - 0.5) * ry * 0.6;
            g.lineCap = 'round';
            for (let k = 0; k < 7; k++) {
                let px = cx, py = cy, a = rr() * TAU;
                const pts = [[px, py]], n = 3 + Math.floor(rr() * 4);
                for (let j = 0; j < n; j++) {
                    a += (rr() - 0.5) * 0.7;
                    px += Math.cos(a) * R * (0.1 + rr() * 0.15);
                    py += Math.sin(a) * ry * (0.1 + rr() * 0.15);
                    if ((px / R) ** 2 + (py / ry) ** 2 > 0.95) break;
                    pts.push([px, py]);
                }
                line(g, pts, Math.max(0.6, R * 0.012), 'rgba(236,250,244,0.85)');
                line(g, pts.map(([u, v]) => [u + 0.8, v + 0.8]), Math.max(0.4, R * 0.008), 'rgba(4,20,12,0.5)');
            }
            for (let k = 0; k < 2; k++) {
                const a = rr() * TAU, d = R * (0.1 + rr() * 0.2);
                g.strokeStyle = 'rgba(236,250,244,0.6)';
                g.lineWidth = Math.max(0.5, R * 0.008);
                g.beginPath();
                g.ellipse(cx, cy, d, d * (ry / R), 0, a, a + 1.2 + rr());
                g.stroke();
            }
            g.fillStyle = 'rgba(240,252,248,0.95)';
            disc(g, cx, cy, Math.max(0.8, R * 0.02));
        }
        g.restore();
    }

    // ------------------------------------------------------------------ small true things
    // A tree frog (Hyla meridionalis): smooth bright green, a dark stripe from the nostril
    // through the eye to the shoulder only, round toe pads; ~70 long at s = 1, heading `rot`.
    function frog(g, o = {}) {
        const { x = 0, y = 0, s = 1, rot = 0 } = o;
        g.save();
        g.translate(x, y);
        g.rotate(rot);
        g.scale(s, s);
        const limb = (pts, w) => {
            taper(g, pts, w, w * 0.5, '#2f6b2c');
            taper(g, pts.map(([a, b]) => [a - 0.6, b - 0.8]), w * 0.4, w * 0.2, 'rgba(170,220,130,0.6)');
            const e = pts[pts.length - 1];
            for (let k = -1; k <= 1; k++) {
                const f = [e[0] + 5 + k, e[1] + k * 5];
                line(g, [e, f], 1.6, '#2f6b2c');
                g.fillStyle = '#7fb460';
                disc(g, f[0], f[1], 2);
            }
        };
        g.fillStyle = 'rgba(2,12,6,0.5)';
        oval(g, 4, 6, 34, 20);
        limb([[-14, 12], [-28, 22], [-14, 30], [-2, 26]], 9);
        limb([[-14, -12], [-28, -22], [-14, -30], [-2, -26]], 9);
        limb([[16, 12], [22, 22], [30, 24]], 6);
        limb([[16, -12], [22, -22], [30, -24]], 6);
        const gr = g.createRadialGradient(-2, -8, 2, 4, 0, 34);
        gr.addColorStop(0, '#a8d872');
        gr.addColorStop(0.5, '#4f9a3a');
        gr.addColorStop(1, '#1f4a20');
        g.fillStyle = gr;
        poly(g, S.curve([[34, 0], [28, -12], [10, -16], [-14, -15], [-26, -8], [-28, 4], [-16, 14], [10, 16], [28, 12]], true, 8));
        // the stripe: nostril, eye, to the shoulder
        taper(g, [[33, -3], [22, -9], [10, -11], [2, -9]], 2.4, 1, '#1a2a14');
        taper(g, [[33, 3], [22, 9], [10, 11], [2, 9]], 2.4, 1, '#1a2a14');
        g.fillStyle = 'rgba(232,246,214,0.85)';
        line(g, [[30, 4], [14, 13], [0, 13]], 1.2, 'rgba(220,240,200,0.6)');
        for (const sg of [-1, 1]) {
            g.fillStyle = '#123018';
            disc(g, 20, sg * 9, 5);
            g.fillStyle = '#c6d9b0';
            disc(g, 20, sg * 9, 3.8);
            g.fillStyle = '#071008';
            oval(g, 20, sg * 9, 3, 1.4);
            g.fillStyle = '#ffffff';
            disc(g, 18.6, sg * 9 - 1.4, 0.9);
        }
        g.fillStyle = 'rgba(236,250,226,0.7)';
        oval(g, -6, -6, 12, 3, -0.1);
        g.restore();
    }
    // The Spanish moon moth (Graellsia isabellae): pale green wings, dark veins, an eyespot on
    // each wing, long tails on the hindwings; ~120 across at s = 1, its body along `rot`.
    function moth(g, o = {}) {
        const { x = 0, y = 0, s = 1, rot = 0, open = 1 } = o;
        g.save();
        g.translate(x, y);
        g.rotate(rot);
        g.scale(s, s);
        const wing = (sg, fore) => {
            const pts = fore
                ? S.curve([[0, 2], [-10, 30 * sg], [-6, 58 * sg], [8, 60 * sg * open], [22, 40 * sg], [14, 10 * sg]], true, 8)
                : S.curve([[-4, 4 * sg], [-30, 22 * sg], [-62, 34 * sg], [-74, 30 * sg], [-58, 26 * sg], [-30, 32 * sg], [-14, 26 * sg], [-2, 10 * sg]], true, 8);
            g.fillStyle = 'rgba(2,12,6,0.4)';
            poly(g, pts.map(([a, b]) => [a + 3, b + 4]));
            const gr = g.createLinearGradient(0, 0, 0, 60 * sg);
            gr.addColorStop(0, '#5e8a62');
            gr.addColorStop(0.5, '#a9cc98');
            gr.addColorStop(1, '#cfe4bc');
            g.fillStyle = gr;
            poly(g, pts);
            // the veins, dark
            for (let k = 0; k < 6; k++) line(g, [[0, 2 * sg], [(fore ? 14 : -60) * (k / 6) + (fore ? -6 : -6), (fore ? 56 : 30) * sg * (0.4 + k * 0.1)]], 0.8, 'rgba(30,50,30,0.6)');
            // the eyespot
            const ex = fore ? 6 : -32, ey = (fore ? 34 : 24) * sg;
            g.fillStyle = 'rgba(30,50,30,0.8)';
            disc(g, ex, ey, 5.5);
            g.fillStyle = '#d6e6c6';
            disc(g, ex, ey, 3.6);
            g.fillStyle = '#1b2a1a';
            oval(g, ex, ey, 2, 2.6);
            // the dark leading edge
            line(g, fore ? [[0, 2 * sg], [-10, 30 * sg], [-6, 58 * sg]] : [[-4, 4 * sg], [-62, 34 * sg], [-74, 30 * sg]], 1.6, 'rgba(40,60,40,0.8)');
        };
        for (const sg of [-1, 1]) wing(sg, false);
        for (const sg of [-1, 1]) wing(sg, true);
        // the body: furry, pale; feathered antennae
        g.fillStyle = '#c8d8bc';
        oval(g, -6, 0, 18, 5.5);
        g.fillStyle = 'rgba(120,140,110,0.7)';
        for (let k = 0; k < 5; k++) g.fillRect(-18 + k * 6, -5, 1, 10);
        for (const sg of [-1, 1]) {
            line(g, [[12, 1 * sg], [24, 8 * sg], [30, 14 * sg]], 1.1, '#3a4a30');
            for (let k = 0; k < 8; k++) line(g, [[14 + k * 2, (2 + k) * sg], [16 + k * 2, (6 + k * 1.2) * sg]], 0.5, 'rgba(60,80,50,0.7)');
        }
        g.restore();
    }
    // The trail of blood: dark red drops laid along `pts`, some splashed, some run down. The
    // one warm colour of the picture.
    function blood(g, pts, o = {}) {
        const r = Motion.rng('blood' + (o.seed ?? 1)), s = o.s ?? 1;
        for (const [i, [x, y]] of pts.entries()) {
            const rad = (o.r ?? 4.5) * s * (0.6 + r() * 0.7), run = o.run && r() < 0.5 ? (8 + r() * 26) * s : 0;
            g.fillStyle = 'rgba(10,2,4,0.45)';
            oval(g, x + 1, y + 1.4, rad * 1.1, rad);
            if (run) taper(g, [[x, y], [x + (r() - 0.5) * 2, y + run * 0.6], [x, y + run]], rad * 1.3, rad * 0.7, '#5a0b12');
            g.fillStyle = '#5a0b12';
            poly(g, S.ellipse(x, y, rad, rad * (0.8 + r() * 0.3), 14, r() * 3).map(([a, b], k) => [a + (S.hashI(k, i, 1, 9) - 0.5) * rad * 0.5, b + (S.hashI(k, i, 2, 9) - 0.5) * rad * 0.5]));
            if (run) {
                g.fillStyle = '#4a0910';
                oval(g, x, y + run, rad * 0.8, rad * 0.95);
            }
            // satellites from the fall
            for (let k = 0; k < 3; k++) {
                if (r() < 0.4) continue;
                const a = r() * TAU, d = rad * (1.5 + r() * 2);
                g.fillStyle = '#5a0b12';
                disc(g, x + Math.cos(a) * d, y + Math.sin(a) * d, rad * (0.12 + r() * 0.2));
            }
            g.fillStyle = '#7e1a1c';
            oval(g, x - rad * 0.15, y - rad * 0.2, rad * 0.55, rad * 0.45);
            g.fillStyle = 'rgba(232,200,196,0.75)';
            oval(g, x - rad * 0.35, y - rad * 0.4, rad * 0.22, rad * 0.14, -0.6);
        }
    }

    // ------------------------------------------------------------------ the green wind
    // Long dry-brush strokes of pale green crossing a sheet: the wind made visible, with a
    // few torn leaves and seeds carried in it. dir: the heading of the gusts.
    function wind(g, box, o = {}) {
        const r = Motion.rng('wind' + (o.seed ?? 1)), n = o.n ?? 30, dir = o.dir ?? -0.25, a0 = o.alpha ?? 0.22;
        const clear = o.clear ?? (() => true);
        const cols = o.cols ?? ['#9ccdb0', '#cfe8d8', '#6ea68a', '#b6dcc4', '#4f8a6c'];
        softly(g, o.blur ?? 1.5, (q) => {
            for (let i = 0; i < n; i++) {
                const len = (o.len ?? 700) * (0.5 + r()), x = box.x + r() * box.w, y = box.y + r() * box.h, pts = [];
                const wave = (r() - 0.5) * 0.6, amp = 20 + r() * 50, ph = r() * 6;
                for (let k = 0; k <= 24; k++) {
                    const t = k / 24, a = dir + wave * Math.sin(t * 3 + ph);
                    pts.push([x + Math.cos(dir) * len * t + Math.sin(t * 5 + ph) * amp * 0.2, y + Math.sin(dir) * len * t + Math.sin(t * 4 + ph) * amp]);
                }
                if (!clear(pts[12][0], pts[12][1])) continue;
                S.dab(q, pts, { w: (o.w ?? 18) * (0.4 + r()), color: cols[Math.floor(r() * cols.length)], alpha: a0 * (0.4 + r() * 0.8), bristles: 9, seed: 'wd' + (o.seed ?? 1) + i, dry: 0.65, taper: 0.9 });
            }
        });
    }

    const stats = () => ({ sprites: stat.sprites, px: stat.px, mb: Math.round((stat.px * 4) / 1048576) });
    return {
        S, TAU, memo, canvas, lkey, LSTEP, LN, light2, toward, disc, oval, poly, line, taper, softly, bowed, angDiff, put, shadow, shadowOf, graded, tube,
        FIG, figGeom, figLeaf, figAt, figFruit, figWood, leafScar, figBud, latex, BARK, stats,
        AGAVE, agaveGeom, agaveLeaf, agave, quiote, padSprite, opuntia, frost, fish, ship, horse,
        IRON, bar, railing, drop, lantern, tambourine, frog, moth, blood, wind,
    };
})();
