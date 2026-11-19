// Wares of an Andalusian house and fair, for the corners of the emblem's collage, in the
// emblem manner (dark contour + airbrush; volumes are lit `Souvenir.form` sprites brought
// back to the manner with sprayed shade and an ink contour). Global: Wares. Sizes at s = 1,
// the anchor in the middle of each:
//   Wares.botijo(g, { x, y, s, rot, seed })      186 × 242   the white-clay water jug
//   Wares.fino(g, { x, y, s, rot, seed })        138 × 334   a bottle of fino (90 wide) and
//                                                its catavino, the glass in front of the
//                                                bottle's right flank
//   Wares.peineta(g, { x, y, s, rot, seed })     206 × 233   the tortoiseshell comb
//   Wares.biznaga(g, { x, y, s, rot, seed })     132 × 296   Málaga's jasmine bouquet
//   Wares.farolillos(g, { x, y, s, n, len, sag, seed })  a string of n feria lanterns (5) on
//                                                a cord that sags `sag` (90) between (x, y)
//                                                and (x + len, y) (700); it paints from
//                                                x - 14 to x + len + 14 and from y - 8 to
//                                                about y + sag + 128
// `rot` turns the object, never the light: geometry is turned point by point and the
// per-pixel sprites are baked with Souvenir.lightFor (cached by angle, resolution and seed).
// Paint them once on a layer of their own: nothing here takes the time. The fino's label
// wants the fonts 'IM Fell DW Pica SC' and 'Lora' (both loaded by the film's scene).
//
// What each real thing is, written down before painting it (anatomy · ten true details):
//
// BOTIJO · a thrown belly of porous white clay, closed at the top, on a foot ring; a ring
//   handle luted on the crown; on one shoulder the wide filling mouth (boca), on the other
//   the narrow drinking spout (pitorro). Unglazed: it cools the water by sweating it.
//   1 throwing rings, closer on the shoulder  2 a damp patch low on the belly with a darker
//   tide line and a bloom of salt round it  3 beads of sweat and one run  4 a hairline crack
//   forking down from the boca  5 a chip on the foot ring showing the chalky body  6 lime
//   pops (pale specks with a crater) and iron specks  7 a comb-incised wave between two
//   incised lines on the shoulder  8 the potter's stamp pressed in the shoulder  9 a crochet
//   cap on the boca, weighted with glass beads; a cork for the pitorro on a string tied to
//   the handle  10 the handle darkened and burnished by hands, luting smears at every join,
//   a drip under the pitorro, dirt on the foot. And the souvenir seller's touch: a sprig
//   brushed on in red and green slip, worn thin.
//
// FINO · a tall dark-green sherry bottle (cylinder, round shoulder, long neck with a lip
//   ring, a punt pushed up into the base) and a catavino (tulip bowl narrowing to the rim,
//   short stem, flat foot) a third full.
//   1 the glass is near black, a brighter olive-amber only where light crosses the wine near
//   the far edge  2 a hard vertical highlight with a gap, a thin second one  3 a window with
//   its mullions bent round the shoulder  4 the punt as a dark dome with a lit crescent
//   5 a gold foil capsule with crinkles, a pleated hem and a tear tab, a paper strip stamp
//   over it  6 the wine's level in the neck  7 a paper label wrapped on the cylinder (type
//   squeezed towards the edges), a corner lifting, foxing and a wine ring  8 a mould seam,
//   seeds (tiny bubbles), a scuffed heel with knurling  9 the catavino: rim ellipse with
//   two glints, the meniscus climbing the wall, legs, the bottle seen flipped through the
//   wine, a bright core down the stem, the foot's rings  10 a caustic of pale gold thrown
//   past the foot, and a drop run down the outside of the bottle. And: the lot number
//   rubber-stamped askew on the label, a fly on its margin.
//
// PEINETA · one sheet of tortoiseshell bent to the head: a tall crown with a scalloped
//   edge, sawn through in openwork, a solid bridge, long teeth.
//   1 scallops with a drilled hole in each  2 a pierced fan in the middle  3 two pierced
//   flowers with chased petals  4 C-scrolls, tears and commas between them  5 mottling: dark
//   soft blotches with red-brown halos on honey, drawn out along the sheet  6 light glowing
//   through the thin bars and the teeth's tips  7 a polished streak broken by the holes, a
//   glint on the sawn edges  8 a chased border and a row of punched dots on the bridge
//   9 teeth of unequal length, each with its lit edge and file marks at the root, one
//   chipped  10 hairline scratches, a crack from a hole to the edge, the maker's scratch
//   on the bridge, a long hair still wound through the teeth.
//
// BIZNAGA · a dry thistle head (nerdo) on its stalk; a jasmine bud is threaded on every
//   spike in the evening and opens there, so the head becomes a ball of flowers.
//   1 five or six narrow petals, pinwheeled, each creased  2 a yellow-green throat with a
//   dark eye and an anther at its mouth  3 the long pinkish tube and the green calyx with thread
//   teeth, on the flowers seen from the side and from behind  4 buds: spindles flushed pink
//   5 the thistle's straw spikes and dark heart between the flowers  6 the ball lit as a
//   ball: warm white on top, lilac-grey below, every flower shading the next  7 a bare
//   spike where a flower fell, petals browned at the tip  8 the stalk wound in green tape,
//   its end lifting, the cut straw end below  9 a satin ribbon tied under the head, tails
//   with swallow-cut ends, a frayed thread  10 the thistle's dry bracts under the ball.
//   And: dew on a few petals, a ladybird, one flower slipped off its spike into the bow.
//
// FAROLILLOS · paper lanterns of the feria: tissue pleated like an accordion between two
//   wire rings (spheres, cylinders), a wire bail to hang them, a fringe below, a bulb in.
//   1 every pleat a fold with a lit and a shaded face  2 a white band round the middle
//   3 the glue seam down the side  4 wire rings and a bail hooked on the cord  5 a tuft of
//   cut tissue under the mouth, its strips curled  6 the warm glow on the lower half and in the
//   mouth  7 one crushed, one turned, one torn (a flap hanging, the bulb showing)  8 the
//   cord twisted of two strands, with knots and a frayed end  9 bunting between them, each
//   flag folded over the cord, creased, one curled, one torn  10 polka dots on one lantern
//   (the feria's lunares), rain spots and soft creases on the tissue. And: the flex that
//   feeds the bulbs wound along the cord, a moth on the white paper, a shop ticket on a bail.
const Wares = (() => {
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
    const resOf = (g, k = 1) => Math.min(6, Math.max(1, Math.ceil(S.pxScale(g) * k * 2 - 1e-6) / 2));
    const rotP = (p, a) => {
        const c = Math.cos(a), s = Math.sin(a);
        return [p[0] * c - p[1] * s, p[0] * s + p[1] * c];
    };
    const pol = (r, a, cx = 0, cy = 0) => [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
    const dot2 = (a, b) => a[0] * b[0] + a[1] * b[1];
    const lerpP = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
    const add = (p, v, k = 1) => [p[0] + v[0] * k, p[1] + v[1] * k];

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
    // a direction on the page, as a sprite that will be pasted turned by `rot` sees it
    const local = (v, rot) => rotP(v, -rot);

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
    const oval = (g, p, rx, ry, rot, style) => {
        g.beginPath();
        g.ellipse(p[0], p[1], rx, ry, rot, 0, TAU);
        g.fillStyle = style;
        g.fill();
    };
    // a right-hand profile [[x, y], …] from top to bottom, mirrored into a closed outline
    const sym = (right) => [...right, ...right.slice().reverse().filter((p) => p[0] > 1e-6).map(([x, y]) => [-x, y])];
    // half-width of a profile [[hw, y], …] at y (linear between its points)
    const hwAt = (prof, y) => {
        if (y <= prof[0][1]) return prof[0][0];
        for (let i = 1; i < prof.length; i++) if (y <= prof[i][1]) return prof[i - 1][0] + ((prof[i][0] - prof[i - 1][0]) * (y - prof[i - 1][1])) / (prof[i][1] - prof[i - 1][1] || 1);
        return prof[prof.length - 1][0];
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
    // a band about a centre line: w(u) wide at u = 0..1 along it (or a number)
    function band(line, w) {
        const st = walk(line, 1), n = st.length, L = [], R = [], wf = typeof w === 'function' ? w : () => w;
        st.forEach((q, i) => {
            const h = wf(i / Math.max(1, n - 1)) / 2;
            L.push([q.p[0] + q.n[0] * h, q.p[1] + q.n[1] * h]);
            R.push([q.p[0] - q.n[0] * h, q.p[1] - q.n[1] * h]);
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

    // ------------------------------------------------------------------ sprites in the emblem manner
    // The airbrush on a sprite: colour sprayed in from its own edges (holes included), `w`
    // units deep, from the side `dir` points to. What `Souvenir.spray` does for a polygon.
    function sprayIn(sp, res, { color, alpha = 0.5, w = 6, push = null, dir = SD }) {
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
    // A sheet of its own, in units: for parts that cut holes or cast only on themselves.
    const sheet = (box, res) => {
        const c = document.createElement('canvas');
        c.width = Math.max(2, Math.ceil(box.w * res));
        c.height = Math.max(2, Math.ceil(box.h * res));
        const g = c.getContext('2d');
        g.setTransform(res, 0, 0, res, -box.x * res, -box.y * res);
        return { canvas: c, box, g };
    };
    // Lays a sprite on the page the emblem way: its shadow on what is already there, its
    // silhouette in ink a line's width bigger (heavier towards the shadow), then itself.
    // The sprite is pasted turned by `rot`; the heavy side and the cast stay on the page.
    function stamp(g, sp, { x = 0, y = 0, rot = 0, s = 1, lw = 2.4, heavy = 0.75, cast = null, ink = INK } = {}) {
        if (!sp.sil || sp.silInk !== ink) {
            const sil = document.createElement('canvas');
            sil.width = sp.canvas.width;
            sil.height = sp.canvas.height;
            const q = sil.getContext('2d');
            q.drawImage(sp.canvas, 0, 0);
            // (translucent paint still has a whole contour)
            for (let k = 0; k < 3; k++) q.drawImage(sil, 0, 0);
            q.globalCompositeOperation = 'source-in';
            q.fillStyle = ink;
            q.fillRect(0, 0, sil.width, sil.height);
            sp.sil = sil;
            sp.silInk = ink;
        }
        const b = sp.box;
        const place = (q, ox, oy, img) => {
            q.save();
            q.translate(x + ox, y + oy);
            q.rotate(rot);
            q.scale(s, s);
            q.drawImage(img, b.x, b.y, b.w, b.h);
            q.restore();
        };
        if (cast) S.cast(g, (q) => place(q, 0, 0, sp.sil), cast);
        if (lw > 0) {
            const d = lw * 0.8;
            for (const k of [0, 0.5, 1]) {
                for (let i = 0; i < 16; i++) place(g, SD[0] * lw * heavy * k + Math.cos(i * 0.3927) * d, SD[1] * lw * heavy * k + Math.sin(i * 0.3927) * d, sp.sil);
            }
        }
        place(g, 0, 0, sp.canvas);
    }

    // ------------------------------------------------------------------ shared small painters
    // A bead: a pellet of glass or gold. Small, so its own contour is thin.
    function bead(g, p, r, C, lw = 0.7) {
        disc(g, [p[0] + SD[0] * lw * 0.7, p[1] + SD[1] * lw * 0.7], r + lw, INK);
        const gr = g.createRadialGradient(p[0] + TOL[0] * r * 0.4, p[1] + TOL[1] * r * 0.4, r * 0.08, p[0], p[1], r * 1.08);
        gr.addColorStop(0, C.light);
        gr.addColorStop(0.5, C.base);
        gr.addColorStop(1, C.deep);
        disc(g, p, r, gr);
        g.save();
        g.beginPath();
        g.arc(p[0], p[1], r, 0, TAU);
        g.clip();
        g.strokeStyle = S.rgba(C.light, 0.4);
        g.lineWidth = r * 0.22;
        g.beginPath();
        g.arc(p[0], p[1], r * 0.86, Math.atan2(SD[1], SD[0]) - 0.8, Math.atan2(SD[1], SD[0]) + 0.8);
        g.stroke();
        g.restore();
        disc(g, [p[0] + TOL[0] * r * 0.42, p[1] + TOL[1] * r * 0.42], r * 0.24, S.rgba(C.glint ?? '#fff8e8', 0.95));
    }

    // A cord of two strands twisted together: every turn its own little piece, lit across
    // the cord as a cylinder and shaded where it dives under the next turn.
    const HEMP = { base: '#c9a56a', mid: '#dcc08a', deep: '#6e4a2c', light: '#f3e2b4', ink: '#2c1a22' };
    function rope(g, path, o = {}) {
        const w = o.w ?? 5, lw = o.line ?? 1.2, C = o.col ?? HEMP, h = w / 2;
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
            const e0 = edge(Math.min(total, s0 + sl), 1, h * 1.3), e1 = edge(Math.max(0, s0 - sl), -1, h * 1.3);
            g.lineCap = 'butt';
            g.strokeStyle = S.rgba(C.ink, 0.45);
            g.lineWidth = pp * 0.6;
            g.beginPath();
            g.moveTo(e0[0], e0[1]);
            g.lineTo(e1[0], e1[1]);
            g.stroke();
            // the fibres of the strand
            if (w >= 3.5) {
                const m0 = edge(Math.min(total, s0 + pp * 0.56 + sl), 1, h), m1 = edge(Math.max(0, s0 + pp * 0.56 - sl), -1, h);
                const [ga, gb] = lit >= 0 ? [0.16, 0.44] : [0.56, 0.84];
                g.lineCap = 'round';
                g.strokeStyle = S.rgba(C.light, 0.2 + 0.45 * k);
                g.lineWidth = w * 0.13;
                g.beginPath();
                g.moveTo(...lerpP(m0, m1, ga));
                g.lineTo(...lerpP(m0, m1, gb));
                g.stroke();
            }
            g.restore();
        }
        g.strokeStyle = S.rgba(C.ink, 0.85);
        g.lineWidth = Math.max(0.45, w * 0.11);
        g.lineCap = 'round';
        for (let i = 1; i < n; i++) {
            const e0 = edge(Math.min(total, i * pp + sl), 1, h), e1 = edge(Math.max(0, i * pp - sl), -1, h);
            g.beginPath();
            g.moveTo(e0[0], e0[1]);
            g.lineTo(e1[0], e1[1]);
            g.stroke();
        }
    }

    // A groove cut in a surface: a dark line and the lit wall beyond it (`sh`: where shadows
    // fall, in the surface's own coordinates).
    const incise = (q, pts, sh, w = 1, o = {}) => {
        S.ink(q, pts.map((p) => add(p, sh, w * 0.75)), { w: w * 0.8, color: o.lit ?? '#fff2dc', alpha: o.la ?? 0.55, taper: o.taper ?? [0.4, 0.4] });
        S.ink(q, pts, { w, color: o.color ?? '#6b4038', alpha: o.alpha ?? 0.75, taper: o.taper ?? [0.4, 0.4] });
    };

    // ------------------------------------------------------------------ botijo
    // Local coordinates: the belly's axis is x = 0, the foot stands on y = 118, the handle's
    // crown is at y = -118.
    const CLAY = [[0, '#4f3144'], [0.2, '#7d5257'], [0.4, '#ad7c6a'], [0.56, '#cf9f83'], [0.72, '#e6c2a2'], [0.88, '#f3dcc0'], [1, '#fbeedb']];
    const BOT = (() => {
        const prof = S.curve([[0, -50], [20, -49], [40, -44], [58, -34], [73, -18], [84, 2], [89.5, 24], [88, 46], [80, 68], [66, 87], [52, 99], [43.5, 104.5], [40.5, 108], [42.5, 112.5], [45.5, 116], [44.5, 118]], false, 6);
        // thrown by hand: the left side a little leaner than the right, and neither quite a curve
        const wob = (y, k) => 1 + 0.008 * S.noise2(y * 0.05, k, 9);
        const body = [...prof.map(([x, y]) => [x * 1.012 * wob(y, 1), y]), ...prof.slice(1, -1).reverse().map(([x, y]) => [-x * 0.985 * wob(y, 5), y])];
        const hwBody = (y) => hwAt(prof.map(([x, y2]) => [x, y2]), y);
        const BOCA = { x: -51, y: -37, rot: -0.3 }, PIT = { x: 49, y: -39, rot: 0.36 };
        const bocaProf = [[20.5, 7], [17.5, -8], [15.6, -22], [16.2, -32], [19.6, -37.5], [21.4, -41.5], [20, -45], [0, -46.5]];
        const pitProf = [[15.5, 6], [12.6, -8], [9.2, -28], [6.8, -44], [7.2, -49.5], [5.2, -52], [0, -52.6]];
        const boca = S.xf(S.curve(sym(bocaProf), true, 5), BOCA), pit = S.xf(S.curve(sym(pitProf), true, 5), PIT);
        // the handle: a coil pulled into an arch, its legs sunk in the crown
        const handle = [[-29, -42], [-30.5, -62]];
        for (let i = 1; i < 24; i++) {
            const a = Math.PI + (i / 24) * Math.PI;
            handle.push([1.5 + Math.cos(a) * 31 + 0.8 * S.noise2(i * 0.4, 2, 4), -63 + Math.sin(a) * 47.5]);
        }
        handle.push([32, -62], [31, -42]);
        const chip = [[33.5, 120], [36.5, 114.6], [40, 112.8], [44.5, 113.6], [47.5, 115.4], [50, 120]];
        return { prof, body, hwBody, BOCA, PIT, boca, pit, handle, chip, box: { x: -98, y: -122, w: 196, h: 244 } };
    })();

    function botijoSprite(rot, res, seed) {
        return memo(`botijo/${rot.toFixed(3)}@${res}/${seed}`, () => {
            const L = S.lightFor(rot), sh = local(SD, rot), tl = [-sh[0], -sh[1]], sd = S.seedOf('botijo' + seed);
            const r = Motion.rng('botijo-marks' + seed);
            const bo = (p) => S.xf([p], BOT.BOCA)[0], pi = (p) => S.xf([p], BOT.PIT)[0];
            const ringY = (x, y) => y - 5.5 * (1 - (x * x) / 8100); // rings sag towards the eye: seen a little from above
            const ringAt = (c, m = 3, step = 3) => {
                const hw = BOT.hwBody(c + 3) - m, out = [];
                for (let x = -hw; x <= hw + 0.01; x += step) out.push([x, c + 5.5 * (1 - (x * x) / 8100)]);
                return out;
            };
            // the damp patch: where the water sweats through, low on the belly
            const damp = (x, y) => {
                const dx = (x + 9) / 55, dy = (y - 70) / 35;
                return dx * dx + dy * dy + 0.36 * S.noise2(x * 0.045, y * 0.045, sd + 11) + 0.13 * S.noise2(x * 0.17, y * 0.17, sd + 12);
            };
            const sp = S.form({
                box: BOT.box, res, seed: 'botijo' + seed, light: L, relief: 0.9,
                mask: (q) => {
                    q.beginPath();
                    S.trace(q, BOT.body);
                    q.fill();
                    q.beginPath();
                    S.trace(q, BOT.boca);
                    q.fill();
                    q.beginPath();
                    S.trace(q, BOT.pit);
                    q.fill();
                    q.strokeStyle = '#fff';
                    q.lineWidth = 15.5;
                    q.lineJoin = 'round';
                    q.beginPath();
                    S.trace(q, BOT.handle, false);
                    q.stroke();
                    // the chip out of the foot ring
                    q.globalCompositeOperation = 'destination-out';
                    q.beginPath();
                    S.trace(q, [[37.5, 120], [39.5, 116.4], [43, 115.2], [46.5, 116.8], [48.5, 120]]);
                    q.fill();
                    q.globalCompositeOperation = 'source-over';
                },
                height: (x, y) => {
                    const yy = ringY(x, y), inBody = S.smooth(-50, -38, y) * S.smooth(106, 100, y);
                    const ring = 0.3 * Math.sin(yy * 0.8 + 1.4 * S.noise2(yy * 0.05, 3, sd)) * (0.6 + 0.4 * S.noise2(yy * 0.08, 1, sd + 2)) + 0.07 * Math.sin(yy * 2.3 + 2 * S.noise2(yy * 0.11, 7, sd));
                    const pore = 0.1 * S.noise2(x * 1.3, y * 1.3, sd + 5) + 0.05 * S.noise2(x * 3.1, y * 3.1, sd + 6);
                    // a thumb's dent, left when it was lifted off the wheel
                    const dent = -1.5 * Math.exp(-(Math.pow((x - 40) / 13, 2) + Math.pow((y - 60) / 8, 2)));
                    return ring * inBody + pore + dent;
                },
                ramp: CLAY, soft: 1,
                stroke: { amp: 0.03, freq: 0.07, tone: 5 },
                mottle: { amp: 0.035, freq: 0.03 },
                tint: (x, y, tone, rgb, m) => {
                    // damp clay is darker and redder; its edge is the darkest; salt blooms round it
                    const dd = damp(x, y), wet = S.smooth(1.02, 0.84, dd), edge = wet * (1 - wet) * 4;
                    const kw = wet * 0.82 + edge * 0.1;
                    rgb[0] += (rgb[0] * 0.7 - rgb[0]) * kw;
                    rgb[1] += (rgb[1] * 0.58 - rgb[1]) * kw;
                    rgb[2] += (rgb[2] * 0.58 - rgb[2]) * kw;
                    const bloom = S.smooth(1.0, 1.1, dd) * S.smooth(1.42, 1.12, dd) * S.smooth(-0.3, 0.5, S.noise2(x * 0.3, y * 0.3, sd + 14)) * 0.42;
                    rgb[0] += (252 - rgb[0]) * bloom;
                    rgb[1] += (244 - rgb[1]) * bloom;
                    rgb[2] += (232 - rgb[2]) * bloom;
                    // the handle's crown, darkened by hands
                    const kh = S.smooth(30, 8, Math.hypot(x - 1.5, (y + 106) * 1.4)) * (0.5 + 0.2 * S.noise2(x * 0.2, y * 0.2, sd + 16));
                    rgb[0] += (rgb[0] * 0.82 - rgb[0]) * kh;
                    rgb[1] += (rgb[1] * 0.7 - rgb[1]) * kh;
                    rgb[2] += (rgb[2] * 0.62 - rgb[2]) * kh;
                    // fired clay is never one colour: a warmer and a greyer drift
                    const w = S.noise2(x * 0.021 + 4, y * 0.021, sd + 15) * 0.09;
                    rgb[0] += w * 26;
                    rgb[2] -= w * 30;
                    // the night in the very rim of the shadow side
                    const k = S.smooth(0.32, 0.06, tone) * S.smooth(0.1, 0.01, m) * 0.45;
                    rgb[0] += (104 - rgb[0]) * k;
                    rgb[1] += (92 - rgb[1]) * k;
                    rgb[2] += (150 - rgb[2]) * k;
                },
                over: (q) => {
                    // 1 · lime and iron in the clay
                    for (let i = 0; i < 260; i++) {
                        const x = -95 + r() * 190, y = -118 + r() * 238, pale = r() < 0.62;
                        q.fillStyle = pale ? `rgba(255,248,236,${(0.25 + r() * 0.5).toFixed(3)})` : `rgba(98,54,44,${(0.2 + r() * 0.35).toFixed(3)})`;
                        q.beginPath();
                        q.arc(x, y, pale ? 0.3 + r() * r() * 1.0 : 0.25 + r() * 0.45, 0, TAU);
                        q.fill();
                    }
                    for (let i = 0; i < 6; i++) {
                        // (lime pops: a grain of lime that swelled in the firing and burst a crater)
                        const c = [-70 + r() * 140, -30 + r() * 120], rr = 1.2 + r() * 0.9;
                        disc(q, c, rr, 'rgba(126,82,70,0.42)');
                        q.strokeStyle = 'rgba(255,246,232,0.7)';
                        q.lineWidth = 0.5;
                        q.beginPath();
                        q.arc(c[0], c[1], rr, Math.atan2(sh[1], sh[0]) - 1.1, Math.atan2(sh[1], sh[0]) + 1.1);
                        q.stroke();
                        disc(q, add(c, sh, rr * 0.15), rr * 0.5, 'rgba(255,252,244,0.9)');
                    }
                    // 2 · the shoulder's decoration, cut with a comb while it turned
                    incise(q, ringAt(-25), sh, 1.15);
                    incise(q, ringAt(-8.5), sh, 1.15);
                    for (const o of [-1.5, 0, 1.5]) {
                        const hw = BOT.hwBody(-14) - 6, wave = [];
                        for (let x = -hw; x <= hw; x += 1.2) wave.push([x, -16.8 + o + 5.5 * (1 - (x * x) / 8100) + 3.1 * Math.sin(x * 0.44 + 0.5) * (1 - 0.25 * Math.pow(x / hw, 4))]);
                        incise(q, wave, sh, 0.62, { alpha: 0.62, la: 0.4, taper: [0.1, 0.1] });
                    }
                    // 3 · luting: the smeared joins of handle, mouth and spout
                    const join = (pts, w = 1.25) => {
                        S.ink(q, pts.map((p) => add(p, sh, 1.2)), { w: w * 1.6, color: '#fff1dc', alpha: 0.4 });
                        S.ink(q, pts, { w, color: '#6a3c3a', alpha: 0.7, taper: [0.8, 0.8] });
                    };
                    join(S.curve([[-39.5, -46.5], [-30, -42.2], [-21, -45.8]], false, 6));
                    join(S.curve([[23, -45.6], [31.5, -42], [40, -45.2]], false, 6));
                    join(S.curve([bo([-21.5, 3]), bo([-8, 9.5]), bo([8, 10]), bo([21.5, 4.5])], false, 6), 1.4);
                    join(S.curve([pi([-16, 3.5]), pi([-5, 8.2]), pi([6, 8.4]), pi([16.5, 3])], false, 6), 1.4);
                    for (let i = 0; i < 16; i++) {
                        // the thumb strokes that wiped each join down
                        const c = [bo([-18 + r() * 36, 6]), pi([-13 + r() * 26, 6]), [-38 + r() * 17, -43], [24 + r() * 16, -43]][i % 4];
                        S.ink(q, [c, [c[0] + (r() - 0.5) * 3, c[1] + 4 + r() * 5]], { w: 1.2 + r(), color: r() < 0.5 ? '#fff1dc' : '#7a4a40', alpha: 0.2 });
                    }
                    // the mouth's neck and the spout were thrown too: rings round them
                    for (const [v, a] of [[-12, 0.5], [-25, 0.4], [-36.4, 0.75]]) incise(q, S.curve([bo([-20, v - 1.5]), bo([0, v + 2.4]), bo([20, v - 1.5])], false, 6), sh, 0.8, { alpha: a });
                    for (const [v, a] of [[-12, 0.4], [-30, 0.4], [-45.6, 0.8]]) incise(q, S.curve([pi([-13, v - 0.8]), pi([0, v + 1.4]), pi([13, v - 0.8])], false, 6), sh, 0.75, { alpha: a });
                    // the spout's bore
                    {
                        const c = pi([0, -51]);
                        oval(q, c, 5, 2.1, BOT.PIT.rot, '#f6e2c8');
                        oval(q, add(c, sh, 0.25), 3.9, 1.5, BOT.PIT.rot, '#2c1626');
                        oval(q, add(c, sh, 0.9), 2.6, 0.8, BOT.PIT.rot, 'rgba(120,70,70,0.6)');
                        q.strokeStyle = 'rgba(90,50,56,0.8)';
                        q.lineWidth = 0.55;
                        q.beginPath();
                        q.ellipse(c[0], c[1], 5, 2.1, BOT.PIT.rot, 0, TAU);
                        q.stroke();
                    }
                    // 4 · the potter's stamp, pressed in the shoulder before firing
                    {
                        const c = [-33, 6.5], a = -0.16, E = S.ellipse(c[0], c[1], 11.5, 7.6, 40, a);
                        fillPts(q, E, 'rgba(120,74,62,0.16)');
                        incise(q, [...E, E[0], E[1]], sh, 0.85, { taper: [0, 0] });
                        const star = [];
                        for (let k = 0; k < 16; k++) star.push(add(c, rotP(pol(k % 2 ? 1.5 : 4, (k / 16) * TAU - Math.PI / 2), a)));
                        fillPts(q, star.map((p) => add(p, sh, 0.5)), 'rgba(255,242,224,0.5)');
                        fillPts(q, star, 'rgba(110,64,56,0.72)');
                        for (const sx of [-1, 1]) {
                            for (const k of [0, 1, 2]) disc(q, add(c, rotP([sx * (6.2 + k * 1.5), (k - 1) * 1.7 * sx], a)), 0.5, 'rgba(110,64,56,0.7)');
                        }
                    }
                    // a sprig brushed on in red and green slip before firing, worn thin since
                    {
                        const O = [22, 12], rs = Motion.rng('sprig' + seed);
                        const stroke = (pts, w, color, a = 0.62) => S.dab(q, S.curve(pts.map(([x, y]) => [O[0] + x, O[1] + y]), false, 6), { w, color, alpha: a, bristles: 5, seed: 'sprig' + rs(), dry: 0.5 });
                        stroke([[-16, 16], [-6, 9], [6, 3], [18, -6]], 1.5, '#5c7446');
                        for (const [bx, by, ang, len] of [[-9, 11, -2.2, 10], [-3, 7.5, 0.5, 11], [4, 4, -2.4, 9], [9, 1, 0.3, 9.5]]) {
                            const tip = [bx + Math.cos(ang) * len, by + Math.sin(ang) * len], nx = -Math.sin(ang) * 2.1, ny = Math.cos(ang) * 2.1, m = [(bx + tip[0]) / 2, (by + tip[1]) / 2];
                            stroke([[bx, by], [m[0] + nx, m[1] + ny], tip], 2.6, '#5c7446');
                            stroke([[bx, by], [m[0] - nx * 0.5, m[1] - ny * 0.5], tip], 1.6, '#3f5a36', 0.5);
                        }
                        // the flower: five dabs round a dot
                        for (let k = 0; k < 5; k++) {
                            const a = -0.5 + (k / 5) * TAU, c0 = [20 + Math.cos(a) * 2, -9 + Math.sin(a) * 2], c1 = [20 + Math.cos(a) * 7.6, -9 + Math.sin(a) * 7.6];
                            stroke([c0, [(c0[0] + c1[0]) / 2 - Math.sin(a) * 1.2, (c0[1] + c1[1]) / 2 + Math.cos(a) * 1.2], c1], 4, k % 2 ? '#a8463a' : '#b9584a', 0.66);
                        }
                        disc(q, [O[0] + 20, O[1] - 9], 1.7, 'rgba(226,180,105,0.8)');
                        for (const [dx, dy] of [[30, -1], [32.5, 4.5], [27, 5.5]]) disc(q, [O[0] + dx, O[1] + dy], 1.1, 'rgba(168,70,58,0.6)');
                    }
                    // 5 · the hairline crack, down from under the mouth, with a fork
                    {
                        const jag = (pts) => pts.flatMap((p, i) => (i ? [lerpP(pts[i - 1], p, 0.5).map((v, k) => v + (S.hashI(i, k, 3, sd) - 0.5) * 2.4), p] : [p]));
                        const main = jag([bo([-17, 8]), [-66.5, -16], [-62.5, -4], [-69, 8], [-64.5, 19], [-68, 30], [-64, 41]]);
                        const fork = jag([[-69, 8], [-75, 13], [-77.5, 21]]);
                        for (const c of [main, fork]) {
                            S.ink(q, c.map((p) => add(p, sh, 0.8)), { w: 0.7, color: '#fff3e0', alpha: 0.5, taper: [0, 1] });
                            S.ink(q, c, { w: c === main ? 1.15 : 0.8, color: '#4a2832', alpha: 0.85, taper: [0, 1] });
                        }
                    }
                    // 6 · the break of the chip: chalky, rough
                    {
                        fillPts(q, BOT.chip, 'rgba(252,238,216,0.92)');
                        for (let i = 0; i < 26; i++) disc(q, [34 + r() * 15, 113 + r() * 7], 0.3 + r() * 0.5, r() < 0.5 ? 'rgba(150,104,84,0.55)' : 'rgba(255,255,250,0.8)');
                        S.ink(q, BOT.chip.slice(0, 5).map((p) => add(p, tl, 0.2)), { w: 0.9, color: '#7a4a40', alpha: 0.8, taper: [0.3, 0.3] });
                    }
                    // 7 · the drip under the spout, and the run of a bead of sweat
                    const run = (pts, w) => {
                        const c = S.curve(pts, false, 8);
                        S.ink(q, c, { w, color: '#8a5648', alpha: 0.36, taper: [0.3, 0.9] });
                        S.ink(q, c.map((p) => add(p, tl, w * 0.3)), { w: w * 0.3, color: '#5a3038', alpha: 0.3, taper: [0.3, 0.9] });
                    };
                    run([pi([8, 4]), [66, -24], [71.5, -8], [72.5, 9], [74.5, 22]], 3.4);
                    run([[-28, 74], [-29.5, 84], [-27.5, 95], [-28.5, 103]], 2.2);
                    // 8 · scratches and scuffs from a life of being carried about
                    for (let i = 0; i < 26; i++) {
                        const x = -80 + r() * 160, y = -40 + r() * 150, a = -0.9 + r() * 1.8 + (r() < 0.3 ? 1.5 : 0), l = 4 + r() * 13;
                        S.ink(q, [[x, y], [x + Math.cos(a) * l * 0.5, y + Math.sin(a) * l * 0.5 + (r() - 0.5)], [x + Math.cos(a) * l, y + Math.sin(a) * l]], { w: 0.5 + r() * 0.3, color: r() < 0.55 ? '#fff6e6' : '#7a4a44', alpha: 0.2 + r() * 0.22 });
                    }
                    // the handle is a pulled strap: two soft ridges run along it
                    const along = (off) => BOT.handle.map((p, i) => {
                        const a = BOT.handle[Math.max(0, i - 1)], b = BOT.handle[Math.min(BOT.handle.length - 1, i + 1)], l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
                        return [p[0] - ((b[1] - a[1]) / l) * off, p[1] + ((b[0] - a[0]) / l) * off];
                    });
                    for (const off of [-3.1, 3.3]) incise(q, along(off).slice(1, -1), sh, 0.8, { alpha: 0.5, la: 0.4, taper: [0.9, 0.9] });
                    // and the wet fingers that pulled it left their streaks along it
                    for (let i = 0; i < 16; i++) {
                        const hl = along(-6.4 + r() * 12.8), i0 = 1 + Math.floor(r() * 16), seg = hl.slice(i0, i0 + 4 + Math.floor(r() * 6));
                        if (seg.length > 2) S.ink(q, seg, { w: 0.5, color: r() < 0.5 ? '#7a4a44' : '#fff3e0', alpha: 0.24 + r() * 0.16 });
                    }
                    // where the hand takes it the crown is worn dark and smooth: fine cross-marks of grime
                    for (let i = 0; i < 22; i++) {
                        const hl = along(-6 + r() * 12), k = 9 + Math.floor(r() * 9), p0 = hl[k];
                        S.ink(q, [p0, [p0[0] + (r() - 0.5) * 2.4, p0[1] + 1.6 + r() * 2]], { w: 0.5, color: '#5a3438', alpha: 0.3 });
                    }
                    // a line turned above the foot
                    incise(q, ringAt(96.5, 5, 2).filter(([x]) => Math.abs(x) < BOT.hwBody(99) - 3), sh, 0.9, { alpha: 0.6 });
                    // pen hatching in the turn of the form, along the rings
                    {
                        const sx = sh[0] >= 0 ? 1 : -1;
                        for (let c = -34; c < 100; c += 3.3) {
                            const cc = c + (r() - 0.5) * 1.6, hw = BOT.hwBody(cc + 3), u0 = 0.5 + r() * 0.22 - Math.max(0, (cc - 40) / 160), u1 = 0.93 + r() * 0.04, line = [];
                            for (let u = u0; u <= u1; u += 0.04) line.push([sx * u * hw, cc + 5.5 * (1 - u * u * hw * hw / 8100)]);
                            if (line.length > 2) S.ink(q, line, { w: 0.6 + r() * 0.25, color: '#5a3450', alpha: 0.2 + r() * 0.16, taper: [1, 0.2] });
                        }
                        for (let i = 0; i < 26; i++) {
                            const a = 0.5 + r() * 1.5, rr = 0.82 + r() * 0.12, c0 = [sx * Math.cos(a) * 89 * rr * 0.7, 30 + Math.sin(a) * 76 * rr];
                            S.ink(q, [c0, add(c0, [-sx * 3, 4.5]), add(c0, [-sx * 7, 8])], { w: 0.55, color: '#5a3450', alpha: 0.22, taper: [0.3, 0.9] });
                        }
                    }
                    // the foot stood in the dust
                    for (let i = 0; i < 70; i++) disc(q, [-46 + r() * 92, 108 + r() * r() * 11], 0.3 + r() * 0.7, `rgba(84,52,48,${(0.15 + r() * 0.3).toFixed(3)})`);
                },
            });
            // the airbrush brings the lit volume back to the emblem manner
            sprayIn(sp, res, { color: '#5a3450', alpha: 0.5, w: 30, dir: sh });
            sprayIn(sp, res, { color: '#3b2140', alpha: 0.55, w: 9, dir: sh });
            sprayIn(sp, res, { color: '#fff6e4', alpha: 0.5, w: 15, dir: tl });
            sprayIn(sp, res, { color: '#4a2c34', alpha: 0.45, w: 7, push: 5, dir: [0, 1] });
            sprayIn(sp, res, { color: '#a394c8', alpha: 0.5, w: 2.2, push: 0.6, dir: sh });
            onto(sp, res, (q) => {
                // beads of sweat on the damp clay: each a lens (dark towards the lamp, bright
                // on its far side), with its point of light and its little shadow
                const rb = Motion.rng('botijo-beads' + seed);
                let n = 0;
                for (let i = 0; i < 120 && n < 17; i++) {
                    const p = [-52 + rb() * 86, 46 + rb() * 50];
                    if (damp(p[0], p[1]) > 0.72) continue;
                    n++;
                    const rr = 0.9 + rb() * rb() * 3.2, ry = rr * (1.08 + rb() * 0.2);
                    oval(q, add(p, sh, rr * 0.55), rr * 1.05, ry * 1.05, 0, 'rgba(58,26,40,0.5)');
                    const gr = q.createRadialGradient(p[0] + sh[0] * rr * 0.45, p[1] + sh[1] * rr * 0.45, rr * 0.1, p[0], p[1], rr * 1.15);
                    gr.addColorStop(0, 'rgba(248,214,184,0.95)');
                    gr.addColorStop(0.55, 'rgba(170,108,92,0.9)');
                    gr.addColorStop(1, 'rgba(98,52,56,0.95)');
                    oval(q, p, rr, ry, 0, gr);
                    disc(q, add(p, tl, rr * 0.42), Math.max(0.35, rr * 0.24), 'rgba(255,253,246,0.96)');
                    if (rr > 2.4) disc(q, add(p, sh, rr * 0.5), rr * 0.13, 'rgba(255,246,226,0.8)');
                }
                // the burnish hands have left on the handle's crown
                const arc = [];
                for (let k = 0; k <= 12; k++) {
                    const a = -Math.PI / 2 + (k / 12 - 0.5) * 0.95 + Math.atan2(tl[1], tl[0]) * 0 - 0.25;
                    arc.push([1.5 + Math.cos(a) * 31 + tl[0] * 3.2, -63 + Math.sin(a) * 47.5 + tl[1] * 3.2]);
                }
                q.save();
                q.filter = `blur(${(0.8 * res).toFixed(1)}px)`;
                S.ink(q, arc, { w: 3.2, color: '#ffe9cf', alpha: 0.5 });
                q.restore();
            });
            return sp;
        });
    }

    // The crochet cap on the mouth, in the mouth's own frame (its lip is at y = -44).
    function crochetCap(g, Fb, seed) {
        const r = Motion.rng('cap' + seed), R = 23.2, y0 = -41.5, hem = (x) => -30.5 + 4.2 * (1 - (x / R) * (x / R));
        const top = S.curve([[-R, y0], [-15, -48.3], [0, -51.2], [15, -48.4], [R, y0]], false, 6);
        const N = 7, scal = [], tips = [];
        for (let i = 0; i < N; i++) {
            const x1 = R + 0.6 - ((i + 1) / N) * (2 * R + 1.2), x0 = R + 0.6 - (i / N) * (2 * R + 1.2), xm = (x0 + x1) / 2, rad = (x0 - x1) / 2, deep = 3.2 + r() * 1.1;
            for (let k = 0; k <= 6; k++) {
                const a = (k / 6) * Math.PI, x = xm + Math.cos(a) * rad;
                scal.push([x, hem(x) + Math.sin(a) * deep]);
            }
            tips.push([xm, hem(xm) + deep]);
        }
        const out = Fb.pts([...top, [R + 0.8, -36], ...scal, [-R - 0.8, -36]]);
        const THREAD = { base: '#ece4d0', deep: '#8d86a8', light: '#fffaf0' };
        S.piece(g, out, {
            fill: THREAD.base, line: 1.5, heavy: 0.7, cast: { blur: 3.5, dx: 1.6, dy: 2.6, color: 'rgba(60,30,50,0.6)' },
            shade: [{ color: THREAD.deep, alpha: 0.7, w: 9 }, { color: '#5d5578', alpha: 0.4, w: 3 }], light: { color: THREAD.light, alpha: 0.8, w: 6 },
            detail: (q) => {
                // the cloth turns over the lip: a soft step of shade under it
                const lip = S.curve([[-R, -40.6], [-12, -37.8], [0, -36.8], [12, -37.8], [R, -40.6]], false, 6);
                S.ink(q, Fb.pts(lip.map(([x, y]) => [x, y + 1.6])), { w: 2.6, color: THREAD.deep, alpha: 0.5, taper: [0.3, 0.3] });
                S.ink(q, Fb.pts(lip.map(([x, y]) => [x, y - 0.8])), { w: 1.1, color: '#fffdf6', alpha: 0.8, taper: [0.5, 0.5] });
                // rows of stitches following the hem, and the holes of the mesh between them
                for (let row = 0; row < 3; row++) {
                    const yy = -0.6 - row * 2.7, line = [];
                    for (let x = -R; x <= R; x += 1.5) line.push([x, hem(x) + yy]);
                    S.ink(q, Fb.pts(line), { w: 0.55, color: '#7d7698', alpha: 0.65, taper: [0, 0] });
                    for (let x = -R + 1.6 + (row % 2) * 1.5; x < R - 1; x += 3) {
                        const c = Fb([x + (r() - 0.5) * 0.4, hem(x) + yy - 1.35]);
                        oval(q, c, 1.05 * Fb.s, 0.8 * Fb.s, Fb.rot, 'rgba(104,62,70,0.78)');
                        oval(q, add(c, SD, 0.35 * Fb.s), 0.55 * Fb.s, 0.4 * Fb.s, Fb.rot, 'rgba(206,150,130,0.5)');
                    }
                }
                // each scallop is a little shell of long stitches
                for (let i = 0; i < N; i++) {
                    const [xm, yt] = tips[i], root = [xm, hem(xm) - 0.4];
                    for (const k of [-0.7, -0.35, 0, 0.35, 0.7]) S.ink(q, Fb.pts([root, [xm + k * 3.1, yt - 0.9 - Math.abs(k) * 1.6]]), { w: 0.5, color: '#7d7698', alpha: 0.7, taper: [0, 0.3] });
                }
                // the rosette it was started from, on the crown
                for (const [rx, ry] of [[9.5, 2.3], [5.6, 1.4], [2, 0.6]]) strokePts(q, Fb.pts(S.ellipse(0, -46.6, rx, ry, 28)), 0.5, 'rgba(125,118,152,0.75)', true);
                for (let k = 0; k < 14; k++) {
                    const a = (k / 14) * TAU;
                    S.ink(q, Fb.pts([[Math.cos(a) * 5.8, -46.6 + Math.sin(a) * 1.45], [Math.cos(a) * 9.3, -46.6 + Math.sin(a) * 2.25]]), { w: 0.45, color: '#7d7698', alpha: 0.7, taper: [0, 0] });
                }
                for (let k = 0; k < 9; k++) disc(q, Fb([-16 + k * 4 + (r() - 0.5), -42.4 + 1.5 * Math.sin(k * 1.9)]), 0.5 * Fb.s, 'rgba(112,70,76,0.5)');
            },
        });
        // glass beads sewn to every other scallop keep it from blowing off
        const GLASS = [{ base: '#2f9c96', deep: '#0f4a56', light: '#9be4d4', glint: '#f2fffb' }, { base: '#d98a2a', deep: '#7a3a12', light: '#f8d48a', glint: '#fff8e0' }, { base: '#c23a35', deep: '#5e1626', light: '#f39a8c', glint: '#ffe9e0' }];
        tips.forEach(([xm, yt], i) => {
            if (i % 2) return;
            const len = 2.6 + r() * 1.6, a = Fb([xm, yt - 0.3]), b = [a[0] + (r() - 0.5) * 0.8, a[1] + len];
            strokePts(g, [a, b], 0.9, INK);
            strokePts(g, [a, b], 0.4, '#e6dcc4');
            bead(g, [b[0], b[1] + 1.9], 2.1, GLASS[(i / 2) % 3], 0.65);
        });
    }

    function botijo(g, o = {}) {
        const { x = 0, y = 0, s = 1, seed = 'botijo' } = o, rot = snap(o.rot ?? 0);
        g.save();
        g.translate(x, y);
        g.scale(s, s);
        const res = resOf(g), F = frame(0, 0, rot), sp = botijoSprite(rot, res, seed);
        stamp(g, sp, { rot, lw: 2.6, heavy: 0.8 });
        const cs = { blur: 3, dx: 1.5, dy: 2.4, color: 'rgba(60,28,46,0.55)' };
        // the cork for the spout, on a string tied round the handle's leg
        const TWINE = { base: '#bfa377', mid: '#d6c096', deep: '#6b4a30', light: '#f0e2bc', ink: '#2c1a22' };
        for (const yy of [-55.5, -52.6]) rope(g, F.pts([[23.2, yy + 0.5], [28, yy + 1.5], [35, yy + 1.4], [39.7, yy]]), { w: 2.3, col: TWINE, line: 0.9, cast: cs });
        const string = S.curve([[38.6, -54], [42.5, -47], [39.5, -37], [34, -27], [31, -19.5]], false, 10);
        rope(g, F.pts(string), { w: 2.1, col: TWINE, line: 0.9, cast: cs });
        S.piece(g, F.pts(S.ellipse(39.2, -54, 2.7, 2.4, 14)), { fill: TWINE.base, line: 0.9, shade: { color: TWINE.deep, alpha: 0.8, w: 2 }, light: { color: TWINE.light, alpha: 0.8, w: 1.4 }, cast: cs });
        {
            const Fc = F.sub(30.2, -14, 0.34), cork = Fc.pts(S.curve(sym([[0, -6.2], [3.3, -6], [4.3, -4.6], [3.8, 0], [3.3, 5], [2.4, 6.1], [0, 6.3]]), true, 4));
            const r = Motion.rng('cork' + seed);
            S.piece(g, cork, {
                fill: '#c79d66', line: 1.2, cast: { blur: 3.5, dx: 2, dy: 3, color: 'rgba(60,28,46,0.6)' },
                shade: { color: '#6a4426', alpha: 0.85, w: 4 }, light: { color: '#f6dfae', alpha: 0.8, w: 2.6 },
                detail: (q) => {
                    for (let i = 0; i < 12; i++) oval(q, Fc([-3.5 + r() * 7, -5 + r() * 10]), (0.3 + r() * 0.6) * Fc.s, 0.3 * Fc.s, Fc.rot + 1.57, r() < 0.7 ? 'rgba(84,48,28,0.7)' : 'rgba(255,240,206,0.7)');
                    // the string's two turns in its groove
                    for (const yy of [-3.4, -2.3]) S.ink(q, Fc.pts([[-4.6, yy - 0.4], [0, yy + 0.3], [4.6, yy - 0.4]]), { w: 0.8, color: yy < -3 ? '#5c3c26' : TWINE.light, alpha: 0.9, taper: [0, 0] });
                },
            });
        }
        crochetCap(g, F.sub(BOT.BOCA.x, BOT.BOCA.y, BOT.BOCA.rot), seed);
        // a drop about to fall from the spout
        {
            const p = F(add(S.xf([[5.3, -48.6]], BOT.PIT)[0], [0.9, 1.9]));
            oval(g, add(p, SD, 0.5), 2.3, 2.9, 0, INK);
            const gr = g.createRadialGradient(p[0] + SD[0] * 0.9, p[1] + SD[1] * 1, 0.2, p[0], p[1], 2.6);
            gr.addColorStop(0, '#fbe6cc');
            gr.addColorStop(0.6, '#b98674');
            gr.addColorStop(1, '#6a3c46');
            oval(g, p, 1.7, 2.3, 0, gr);
            disc(g, add(p, TOL, 0.8), 0.5, 'rgba(255,253,246,0.95)');
        }
        g.restore();
    }

    // ------------------------------------------------------------------ fino: the bottle and its glass
    // Bottle coordinates: its axis is x = 0, y runs from the capsule's top (0) to the base
    // (314). Glass coordinates: axis x = 0, y from the rim (0) to the foot (150). Both are
    // seen a little from above: every circle opens into an ellipse KV of its width high.
    const FELL = "'IM Fell DW Pica SC', 'IM Fell DW Pica', Georgia, 'Times New Roman', serif";
    const LORA = "Lora, Georgia, 'Times New Roman', serif";
    const FINO = (() => {
        const BX = -22, BY = -163.5, GX = 36, GY = 9.5, KV = 0.16, R = 45;
        const prof = S.curve([[11.2, 0], [11.6, 2.5], [13.5, 5.5], [13.8, 9.5], [12.5, 13], [11.8, 17], [11.9, 40], [12.4, 70], [13.8, 92], [17.4, 108], [25.5, 122], [35.4, 134], [42, 145], [44.6, 153], [45, 162], [45, 200], [45, 250], [45, 296], [43.6, 306], [40.4, 312.5]], false, 5);
        const arc = (rx, ry, cy, a0, a1, n = 20) => {
            const out = [];
            for (let i = 0; i <= n; i++) {
                const a = a0 + ((a1 - a0) * i) / n;
                out.push([Math.cos(a) * rx, cy + Math.sin(a) * ry]);
            }
            return out;
        };
        const outline = [...arc(11.2, 2.2, 0, Math.PI, TAU, 12), ...prof.slice(1), ...arc(40.4, 6.5, 312.5, 0, Math.PI, 24).slice(1, -1), ...prof.slice(1).reverse().map(([x, y]) => [-x, y])];
        // the catavino: a tulip that closes towards its rim, a short stem, a flat foot
        const gprof = S.curve([[21, 0], [23.4, 12], [27.4, 28], [30.4, 44], [31, 54], [29.6, 64], [24.4, 74], [15.6, 81.5], [8.4, 86], [4.7, 89.5], [3.7, 94], [3.25, 112], [3.6, 130], [5, 137], [9.4, 141.6], [18.5, 145.6], [27, 148.6], [30, 150]], false, 5);
        const gout = [...arc(21, 21 * 0.21, 0, Math.PI, TAU, 16), ...gprof.slice(1), ...arc(30, 6.2, 150, 0, Math.PI, 24).slice(1, -1), ...gprof.slice(1).reverse().map(([x, y]) => [-x, y])];
        // the label: flat paper X (along the circumference) by v (down), wrapped on the cylinder
        const YL = 176, XL = -58, XR = 43;
        const lab = (X, v) => [R * Math.sin(X / R), YL + v + R * KV * Math.cos(X / R) + 0.012 * X];
        return { BX, BY, GX, GY, KV, R, prof, outline, gprof, gout, arc, YL, XL, XR, lab };
    })();

    function bottle(g, Fb, seed) {
        const r = Motion.rng('bottle' + seed), hw = (y) => hwAt(FINO.prof, y);
        const side = dot2(Fb.dir([-1, 0]), TOL) >= 0 ? 1 : -1; // +1: the lamp is on the bottle's own left
        const U = (u, y) => [u * side * hw(y), y]; // u = -1 the lit edge … +1 the far edge
        const col = (u, y0, y1, step = 2.5) => {
            const out = [];
            for (let y = y0; y < y1; y += step) out.push(U(u, y));
            out.push(U(u, y1));
            return out;
        };
        const pts = Fb.pts(FINO.outline);
        S.piece(g, pts, {
            fill: '#0b2219', line: 2.5, heavy: 0.8, cast: { blur: 9, dx: 4.5, dy: 6, color: 'rgba(12,7,26,0.6)' },
            detail: (q) => {
                const k = S.pxScale(q);
                const soft = (b, fn) => {
                    q.save();
                    q.filter = `blur(${(b * k).toFixed(2)}px)`;
                    fn();
                    q.restore();
                };
                const stripe = (u0, u1, y0, y1, style) => fillPts(q, Fb.pts([...col(u0, y0, y1), ...col(u1, y0, y1).reverse()]), style);
                // the glass towards the lamp: a broad green light in its thickness
                soft(5, () => stripe(-0.88, -0.26, 98, 308, S.rgba('#1d5a3a', 0.9)));
                soft(2.5, () => stripe(-0.85, -0.3, 52, 100, S.rgba('#1d5a3a', 0.75)));
                // the wine: light that crosses it near the far edge comes out amber-green
                soft(4.5, () => stripe(0.4, 0.92, 64, 302, S.rgba('#69762a', 0.9)));
                soft(2.2, () => stripe(0.6, 0.86, 112, 298, S.rgba('#aa9c3a', 0.78)));
                soft(1.1, () => stripe(0.71, 0.8, 150, 276, S.rgba('#dcc75e', 0.55)));
                // the empty neck above the wine's level, and the meniscus
                soft(1.2, () => stripe(-0.9, 0.9, 46, 61.5, S.rgba('#2f7550', 0.55)));
                const men = [];
                for (let u = -0.92; u <= 0.921; u += 0.115) men.push([u * hw(62), 62 + 2 * Math.sqrt(1 - u * u)]);
                S.ink(q, Fb.pts(men.map(([x, y]) => [x, y + 1])), { w: 1.3, color: '#06120e', alpha: 0.7, taper: [0.3, 0.3] });
                S.ink(q, Fb.pts(men), { w: 0.8, color: '#d5e9a6', alpha: 0.85, taper: [0.3, 0.3] });
                // the punt: a dome pushed up into the base, dark against the light the thick heel gathers
                const punt = S.curve([[-30, 314], [-25.5, 295], [-13, 280], [0, 276], [13, 280], [25.5, 295], [30, 314]], false, 8);
                soft(3, () => stripe(-0.8, 0.86, 274, 314, S.rgba('#2e7c4a', 0.75)));
                soft(0.7, () => fillPts(q, Fb.pts([...punt, [30, 324], [-30, 324]]), 'rgba(3,10,8,0.82)'));
                S.ink(q, Fb.pts(punt.map(([x, y]) => [x, y - 0.6])), { w: 0.8, color: '#7fb36a', alpha: 0.45, taper: [0.6, 0.6] });
                S.ink(q, Fb.pts(punt.filter(([x]) => x * side > 4 && x * side < 24).map(([x, y]) => [x, y - 0.5])), { w: 1.1, color: '#b5cc62', alpha: 0.55, taper: [0.8, 0.8] });
                // both edges go dark: there the glass shows the room, not the lamp
                S.spray(q, pts, { color: '#030a09', alpha: 0.9, w: 5, push: 2.6, dir: Fb.dir([side, 0]) });
                S.spray(q, pts, { color: '#030a09', alpha: 0.75, w: 3.4, push: 1.6, dir: Fb.dir([-side, 0]) });
                S.ink(q, Fb.pts(col(0.945, 152, 300)), { w: 1, color: '#9fd0a0', alpha: 0.4 });
                // the window, bent round the shoulder: four panes
                soft(0.5, () => {
                    for (const [u0, u1] of [[-0.44, -0.24], [-0.2, 0.0]]) {
                        for (const [y0, y1] of [[113, 128.5], [131, 147]]) stripe(u0, u1, y0 + (u0 + 0.44) * 6, y1 + (u0 + 0.44) * 4, 'rgba(206,230,255,0.4)');
                    }
                });
                // the hard highlight down the lit side, broken at the shoulder (the label hides its middle)
                soft(2.4, () => stripe(-0.74, -0.5, 150, 304, 'rgba(180,235,200,0.4)'));
                S.ink(q, Fb.pts(col(-0.5, 54, 92)), { w: 2.3, color: '#effaf0', alpha: 0.92, taper: [0.7, 0.5] });
                S.ink(q, Fb.pts(col(-0.6, 102, 143)), { w: 3.3, color: '#effaf0', alpha: 0.9, taper: [0.5, 0.7] });
                S.ink(q, Fb.pts(col(-0.62, 150.5, 172)), { w: 4.6, color: '#f4fcf4', alpha: 0.95, taper: [0.6, 0.2] });
                S.ink(q, Fb.pts(col(-0.62, 281, 302)), { w: 4.4, color: '#f4fcf4', alpha: 0.93, taper: [0.2, 0.7] });
                S.ink(q, Fb.pts(col(-0.83, 150, 304)), { w: 1.1, color: '#cdeedb', alpha: 0.6 });
                // the mould's seam, a faint ridge from heel to shoulder
                S.ink(q, Fb.pts(col(0.3, 106, 311)), { w: 0.9, color: '#04100c', alpha: 0.5, taper: [0.8, 0.1] });
                S.ink(q, Fb.pts(col(0.275, 106, 311)), { w: 0.6, color: '#5fae76', alpha: 0.4, taper: [0.8, 0.1] });
                // seeds: bubbles caught in the glass
                q.lineWidth = 0.35;
                for (let i = 0; i < 11; i++) {
                    const p = Fb(U(-0.9 + r() * 1.8, 100 + r() * 205)), rr = 0.6 + r() * 0.9;
                    q.strokeStyle = 'rgba(150,210,165,0.4)';
                    q.beginPath();
                    q.ellipse(p[0], p[1], rr * 0.7, rr, Fb.rot, 0, TAU);
                    q.stroke();
                    disc(q, add(p, TOL, rr * 0.3), rr * 0.22, 'rgba(235,255,240,0.6)');
                }
                // the heel: knurled dots, and the ring it has been scuffed on
                for (let a = 0.12; a < Math.PI - 0.1; a += 0.085) disc(q, Fb([Math.cos(a) * 38.6, 309.6 + Math.sin(a) * 5.6]), 0.5, 'rgba(160,214,170,0.5)');
                for (let i = 0; i < 16; i++) {
                    const y = 297 + r() * 12, u = -0.9 + r() * 1.7, l = 0.04 + r() * 0.12;
                    S.ink(q, Fb.pts([[u * hw(y), y], [(u + l) * hw(y), y + (r() - 0.5) * 0.8]]), { w: 0.5, color: '#cfe9d6', alpha: 0.18 + r() * 0.2 });
                }
                // it came cold from the cellar: a mist of droplets above and below the label, and one run
                for (let i = 0; i < 38; i++) {
                    const y = r() < 0.4 ? 152 + r() * 22 : 280 + r() * 24, p = Fb(U(-0.86 + r() * 1.7, y)), rr = 0.4 + r() * r() * 1.4;
                    disc(q, p, rr, 'rgba(190,232,205,0.16)');
                    q.strokeStyle = 'rgba(222,246,226,0.45)';
                    q.lineWidth = Math.max(0.25, rr * 0.3);
                    q.beginPath();
                    q.arc(p[0], p[1], rr * 0.8, Math.atan2(SD[1], SD[0]) - 0.9, Math.atan2(SD[1], SD[0]) + 0.9);
                    q.stroke();
                    disc(q, add(p, TOL, rr * 0.4), Math.max(0.2, rr * 0.26), 'rgba(255,255,255,0.75)');
                }
                const run = S.curve([[9, 140], [10.5, 150], [9.4, 160], [10.6, 168.5]], false, 6);
                S.ink(q, Fb.pts(run), { w: 1.3, color: '#d8f0dc', alpha: 0.32, taper: [1, 0] });
                oval(q, Fb([10.7, 170.5]), 1.5, 2.1, Fb.rot, 'rgba(206,238,214,0.35)');
                disc(q, add(Fb([10.7, 170.5]), TOL, 0.7), 0.5, 'rgba(255,255,255,0.92)');
            },
        });

        // the capsule: gold foil pressed over cork and neck, its hem pleated
        const FOIL = { base: '#c9993a', deep: '#5e3a12', light: '#f6dc8a', glint: '#fffbe0' };
        const cw = (y) => hw(y) * 1.05 + 0.35, cap = [...FINO.arc(11.55, 2.3, 0, Math.PI, TAU, 12)];
        for (let y = 2; y <= 49; y += 1.5) cap.push([cw(y), y]);
        const NH = 15;
        for (let i = 0; i <= NH; i++) {
            const u = 1 - (2 * i) / NH;
            cap.push([u * cw(50), 50 + 2.1 * Math.sqrt(Math.max(0, 1 - u * u)) + (i % 2 ? 1.2 : 0)]);
        }
        for (let y = 49; y >= 2; y -= 1.5) cap.push([-cw(y), y]);
        const capP = Fb.pts(cap), small = { blur: 2, dx: 0.8, dy: 1.6, color: 'rgba(4,10,8,0.7)' };
        // (its tear tab, lifted from the hem)
        S.piece(g, Fb.pts([U(0.42, 48), U(0.74, 48.5), [U(0.78, 56)[0] + side * 1.2, 57.4], [U(0.5, 57)[0] + side * 0.6, 58.6]]), { fill: '#e2bb5c', line: 1.1, shade: { color: FOIL.deep, alpha: 0.7, w: 2.6 }, light: { color: FOIL.glint, alpha: 0.8, w: 1.6 }, cast: small });
        S.piece(g, capP, {
            fill: FOIL.base, line: 1.8, heavy: 0.7, cast: small,
            detail: (q) => {
                S.spray(q, capP, { color: FOIL.deep, alpha: 0.92, w: 7.5, push: 4.6, dir: Fb.dir([side, 0]) });
                S.spray(q, capP, { color: FOIL.light, alpha: 0.85, w: 5, push: 2.6, dir: Fb.dir([-side, 0]) });
                // pressed round the lip: two rings
                for (const [yy, a] of [[12.4, 0.85], [16.6, 0.55]]) {
                    const ring = [];
                    for (let u = -1; u <= 1.001; u += 0.1) ring.push([u * cw(yy), yy + 2 * Math.sqrt(Math.max(0, 1 - u * u))]);
                    S.ink(q, Fb.pts(ring), { w: 1, color: FOIL.deep, alpha: a, taper: [0, 0] });
                    S.ink(q, Fb.pts(ring.map(([x, y]) => [x, y + 1])), { w: 0.6, color: FOIL.glint, alpha: 0.7, taper: [0.3, 0.3] });
                }
                // crinkles where the foil was smoothed down by hand
                for (let i = 0; i < 26; i++) {
                    const u = -0.92 + r() * 1.84, y0 = 17 + r() * 22, len = 4 + r() * 14, dx = (r() - 0.5) * 0.12, cr = [];
                    for (let y = y0; y <= Math.min(49, y0 + len); y += 2) cr.push([(u + dx * (y - y0) * 0.2) * cw(y) + Math.sin(y * 1.3 + i) * 0.25, y]);
                    if (cr.length < 2) continue;
                    S.ink(q, Fb.pts(cr), { w: 0.55, color: FOIL.deep, alpha: 0.5 });
                    S.ink(q, Fb.pts(cr.map(([x, y]) => [x + 0.55, y])), { w: 0.45, color: FOIL.glint, alpha: 0.45 });
                }
                // a printed band above the hem, a row of pressed dots, the little star
                const hemY = (u, yy) => yy + 2.1 * Math.sqrt(Math.max(0, 1 - u * u));
                const band2 = [];
                for (let u = -1; u <= 1.001; u += 0.1) band2.push([u * cw(45), hemY(u, 44.6)]);
                S.ink(q, Fb.pts(band2), { w: 1.5, color: '#8a1f24', alpha: 0.85, taper: [0, 0] });
                for (let u = -0.9; u <= 0.9; u += 0.15) disc(q, Fb([u * cw(41), hemY(u, 40.6)]), 0.42, 'rgba(94,58,18,0.75)');
                const mc = [-0.8, 29.5];
                strokePts(q, Fb.pts(S.ellipse(mc[0], mc[1], 4.5, 4.9, 24)), 0.55, 'rgba(94,58,18,0.8)', true);
                const st = [];
                for (let i = 0; i < 16; i++) st.push(pol(i % 2 ? 1.3 : 3.3, (i / 16) * TAU - Math.PI / 2, mc[0], mc[1]));
                fillPts(q, Fb.pts(st), 'rgba(110,66,20,0.8)');
                // gloss: a short fat streak and a dash under it
                S.ink(q, Fb.pts(col(-0.56, 19, 37).map(([x, y]) => [x * 1.05, y])), { w: 2.3, color: FOIL.glint, alpha: 0.92, taper: [0.6, 0.6] });
                S.ink(q, Fb.pts(col(-0.56, 40, 43).map(([x, y]) => [x * 1.05, y])), { w: 1.9, color: FOIL.glint, alpha: 0.8, taper: [0.5, 0.5] });
                S.ink(q, Fb.pts(col(0.8, 18, 46).map(([x, y]) => [x * 1.05, y])), { w: 0.9, color: '#e9c070', alpha: 0.45 });
            },
        });
        S.piece(g, Fb.pts(S.ellipse(0, 0.1, 11.4, 2.5, 24)), {
            fill: '#e6c566', line: 1.2, heavy: 0.3, shade: { color: FOIL.deep, alpha: 0.6, w: 3 }, light: { color: FOIL.glint, alpha: 0.7, w: 2 },
            detail: (q) => strokePts(q, Fb.pts(S.ellipse(0, 0.1, 7.6, 1.5, 20)), 0.5, 'rgba(94,58,18,0.7)', true),
        });
        // the paper strip stamp over the cork: green guilloche, a number, a torn end
        const sx = (u, y) => [u * cw(y), y + 2 * Math.sqrt(Math.max(0, 1 - u * u)) - 1.6];
        const strip = [];
        for (let y = -1.5; y <= 66; y += 1.5) strip.push(sx(0.44, Math.max(0, y)).map((v, i) => (i ? v + Math.min(0, y) : v)));
        strip.push(sx(0.36, 67.5), sx(0.2, 65.6), sx(0.06, 68.4), sx(-0.1, 66));
        for (let y = 66; y >= -1.5; y -= 1.5) strip.push(sx(-0.16, Math.max(0, y)).map((v, i) => (i ? v + Math.min(0, y) : v)));
        const stripP = Fb.pts(strip);
        S.piece(g, stripP, {
            fill: '#e8dfc4', line: 1.1, heavy: 0.5, cast: { blur: 1.2, dx: 0.6, dy: 0.9, color: 'rgba(40,20,10,0.6)' },
            shade: { color: '#8a7c62', alpha: 0.7, w: 4, dir: Fb.dir([side, 0]) }, light: { color: '#fffaf0', alpha: 0.6, w: 2.4, dir: Fb.dir([-side, 0]) },
            detail: (q) => {
                for (const u0 of [-0.06, 0.34]) {
                    const wv = [];
                    for (let y = 1; y <= 65; y += 0.8) wv.push(sx(u0 + 0.05 * Math.sin(y * 0.9), y));
                    S.ink(q, Fb.pts(wv), { w: 0.5, color: '#2f7a56', alpha: 0.85, taper: [0, 0] });
                }
                for (let y = 20; y <= 62; y += 2.2) S.ink(q, Fb.pts([sx(0.04, y), sx(0.24, y + 0.2)]), { w: 0.45, color: y > 30 && y < 40 ? '#8a1f24' : '#2f7a56', alpha: 0.7, taper: [0, 0] });
                // it creases over the lip ring
                for (const yy of [5.5, 12.6]) S.ink(q, Fb.pts([sx(-0.16, yy), sx(0.14, yy + 0.2), sx(0.44, yy)]), { w: 0.8, color: '#6a5c48', alpha: 0.6, taper: [0, 0] });
            },
        });
    }

    // Type set on the label: every glyph at its place on the cylinder, squeezed as it turns away.
    function labelType(q, Fb, text, X0, v, size, font, color, o = {}) {
        const { R, KV } = FINO, tilt = o.tilt ?? 0;
        let spacing = o.spacing ?? 0;
        q.save();
        const setFont = (px) => {
            q.font = `${o.italic ? 'italic ' : ''}${px.toFixed(2)}px ${font}`;
        };
        setFont(size);
        q.textBaseline = 'alphabetic';
        q.fillStyle = color;
        let ws = [...text].map((ch) => q.measureText(ch).width + spacing), total = ws.reduce((a, b) => a + b, 0) - spacing;
        if (o.fit && total > o.fit) {
            // (fonts differ between machines: the line is set to the width the design allows)
            const k = o.fit / total;
            spacing *= k;
            setFont(size * k);
            ws = [...text].map((ch) => q.measureText(ch).width + spacing);
            total = ws.reduce((a, b) => a + b, 0) - spacing;
        }
        let X = X0 - total * (o.align ?? 0.5);
        [...text].forEach((ch, i) => {
            const w = ws[i] - spacing, Xc = X + w / 2, a = Xc / R, p = Fb(FINO.lab(Xc, v + tilt * (Xc - X0)));
            const tx = Math.cos(a), ty = -KV * Math.sin(a) + 0.012 + tilt * Math.cos(a);
            q.save();
            q.translate(p[0] + (o.dx ?? 0), p[1] + (o.dy ?? 0));
            q.rotate(Fb.rot + Math.atan2(ty, tx));
            q.scale(Fb.s * Math.hypot(tx, ty), Fb.s);
            q.fillText(ch, -w / 2, 0);
            q.restore();
            X += ws[i];
        });
        q.restore();
        return total;
    }

    function label(g, Fb, seed) {
        const { R, XL, XR, lab, YL } = FINO, r = Motion.rng('label' + seed);
        const side = dot2(Fb.dir([-1, 0]), TOL) >= 0 ? 1 : -1;
        const flat = (X, v) => Fb(lab(X, v));
        const line = (X0, v0, X1, v1, n = 14) => {
            const out = [];
            for (let i = 0; i <= n; i++) out.push(flat(X0 + ((X1 - X0) * i) / n, v0 + ((v1 - v0) * i) / n));
            return out;
        };
        const FX = 23, FV = 31; // the corner that has come unstuck: folded along (XL + FX, 0)–(XL, FV)
        const out = [
            ...line(XL + FX, 0, XR, 0, 20), ...line(XR, 0, XR + 0.4, 100, 16).slice(1), ...line(XR + 0.4, 100, 13, 100.4, 8).slice(1),
            flat(11.6, 97.6), flat(10.2, 100.4), // a nick torn out of the bottom edge
            ...line(10.2, 100.4, XL + 0.5, 100, 12).slice(1),
            // the left edge has lifted off the glass and bows out a little
            ...[0.9, 0.78, 0.66, 0.54, 0.42, 0.32].map((u) => flat(XL - 2.3 * Math.sin((u - 0.3) * 5.2) * (u < 0.9 ? 1 : 0), 100 * u)),
            flat(XL, FV),
        ];
        const Xc = -7.5, PAPER = '#eadcb4', GOLD = '#b8862a', WINE = '#7d1c22', INKB = '#2f2a44';
        S.piece(g, out, {
            fill: PAPER, line: 1.3, heavy: 0.5, cast: { blur: 1.4, dx: 0.7, dy: 1, color: 'rgba(2,8,6,0.7)' },
            detail: (q) => {
                const k = S.pxScale(q);
                // the paper turns with the bottle: shade towards the far edge, a soft light where the glass shines
                S.spray(q, out, { color: '#7c6a4c', alpha: 0.8, w: 17, push: 12, dir: Fb.dir([side, 0]) });
                S.spray(q, out, { color: '#8f7d5c', alpha: 0.4, w: 5, push: 2, dir: Fb.dir([-side, 0]) });
                q.save();
                q.filter = `blur(${(3 * k).toFixed(1)}px)`;
                fillPts(q, [...line(side * -31, 0, side * -31, 100), ...line(side * -21, 100, side * -21, 0)], 'rgba(255,252,240,0.5)');
                q.restore();
                // age: foxing, a wine ring where a glass stood against it
                for (let i = 0; i < 36; i++) {
                    const p = flat(XL + r() * (XR - XL), r() * 100), rr = 0.4 + r() * r() * 1.9;
                    oval(q, p, rr * Fb.s, rr * (0.7 + r() * 0.5) * Fb.s, r() * 3, `rgba(150,98,52,${(0.1 + r() * 0.2).toFixed(3)})`);
                }
                const ringC = [Xc + 30, 85.5], ring = [];
                for (let i = 0; i <= 30; i++) ring.push(flat(ringC[0] + Math.cos(0.6 + (i / 30) * 4.9) * 9.5, ringC[1] + Math.sin(0.6 + (i / 30) * 4.9) * 9.5));
                S.ink(q, ring, { w: 1.5, color: '#8c3c36', alpha: 0.26, taper: [0.8, 0.3] });
                S.ink(q, ring.map((p) => add(p, [0.6, 0.5])), { w: 0.5, color: '#6a2028', alpha: 0.3, taper: [0.8, 0.3] });
                // the frame: a gold rule, a hairline inside it, a leaf in every corner
                const rect = (m) => [...line(XL + m, m - 1.5, XR - m, m - 1.5, 20), ...line(XR - m, m - 1.5, XR - m, 101.5 - m, 14), ...line(XR - m, 101.5 - m, XL + m, 101.5 - m, 20), ...line(XL + m, 101.5 - m, XL + m, m - 1.5, 14)];
                strokePts(q, rect(6).map((p) => add(p, SD, 0.5)), 1.5, 'rgba(96,62,20,0.55)', true);
                strokePts(q, rect(6), 1.5, GOLD, true);
                strokePts(q, rect(6).map((p) => add(p, TOL, 0.35)), 0.45, '#f1d88c', true);
                strokePts(q, rect(8.8), 0.5, S.rgba(WINE, 0.85), true);
                for (const [cx, cv, ax, av] of [[XL + 8.8, 7.3, 1, 1], [XR - 8.8, 7.3, -1, 1], [XL + 8.8, 92.7, 1, -1], [XR - 8.8, 92.7, -1, -1]]) {
                    fillPts(q, [flat(cx, cv), flat(cx + ax * 5.5, cv + av * 1.2), flat(cx + ax * 4.2, cv + av * 4.2), flat(cx + ax * 1.2, cv + av * 5.5)], GOLD);
                    S.ink(q, [flat(cx + ax * 0.6, cv + av * 0.6), flat(cx + ax * 4.6, cv + av * 4.6)], { w: 0.45, color: '#5e3a12', alpha: 0.9, taper: [0, 0.6] });
                    disc(q, flat(cx + ax * 7.6, cv + av * 1.4), 0.6 * Fb.s, WINE);
                    disc(q, flat(cx + ax * 1.4, cv + av * 7.6), 0.6 * Fb.s, WINE);
                }
                // the sun with its eight-pointed star
                const sc = [Xc, 23.5], P = (rad, a) => flat(sc[0] + Math.cos(a) * rad, sc[1] + Math.sin(a) * rad);
                for (let i = 0; i < 24; i++) {
                    const a = (i / 24) * TAU - Math.PI / 2, long = i % 2 === 0, tip = long ? 14.2 : 12, hwid = long ? 0.085 : 0.06;
                    const tri = [P(8.6, a - hwid), P(tip, a + (long ? 0 : 0.05 * Math.sin(i))), P(8.6, a + hwid)];
                    fillPts(q, tri, long ? '#c9952f' : '#d9aa48');
                    strokePts(q, tri, 0.3, 'rgba(94,58,18,0.8)', true);
                }
                const ringP = (rad) => {
                    const o = [];
                    for (let i = 0; i < 40; i++) o.push(P(rad, (i / 40) * TAU));
                    return o;
                };
                fillPts(q, ringP(8.5), '#8a1f24');
                fillPts(q, ringP(8.5).map((p) => add(p, TOL, 0)), 'rgba(0,0,0,0)');
                strokePts(q, ringP(8.5), 0.8, '#c9952f', true);
                strokePts(q, ringP(7.3), 0.35, 'rgba(246,220,138,0.7)', true);
                const tips = [], inner = [];
                for (let i = 0; i < 8; i++) {
                    tips.push(P(6.8, (i / 8) * TAU - Math.PI / 2));
                    inner.push(P(2.9, ((i + 0.5) / 8) * TAU - Math.PI / 2));
                }
                const c0 = P(0, 0);
                for (let i = 0; i < 8; i++) {
                    // each point cut in two facets, the one towards the lamp brighter
                    const a = (i / 8) * TAU - Math.PI / 2, l0 = dot2(Fb.dir([Math.sin(a), -Math.cos(a)]), TOL);
                    fillPts(q, [c0, inner[(i + 7) % 8], tips[i]], l0 > 0 ? '#f3d98a' : '#a8742a');
                    fillPts(q, [c0, tips[i], inner[i]], l0 > 0 ? '#a8742a' : '#f3d98a');
                }
                strokePts(q, tips.flatMap((t, i) => [t, inner[i]]), 0.35, 'rgba(70,40,14,0.9)', true);
                disc(q, c0, 1.1 * Fb.s, '#8a1f24');
                // vine either side of it: a bunch of grapes, a leaf, a tendril
                for (const mx of [-1, 1]) {
                    const bx = Xc + mx * 27.5, bv = 22;
                    S.ink(q, S.curve([flat(Xc + mx * 15.5, 17.5), flat(Xc + mx * 21, 14.4), flat(bx, 16), flat(bx + mx * 5, 13.6)], false, 6), { w: 0.6, color: '#5a4a22', alpha: 0.9, taper: [0.2, 0.4] });
                    S.ink(q, S.curve([flat(bx + mx * 5, 13.6), flat(bx + mx * 8, 14.4), flat(bx + mx * 8.2, 17), flat(bx + mx * 6.4, 16.6), flat(bx + mx * 6.6, 15.4)], false, 5), { w: 0.4, color: '#5a4a22', alpha: 0.85, taper: [0, 0.6] });
                    const leaf = [[0, 0], [2.6, -3.4], [4.4, -1.6], [6.6, -3.6], [7.2, -0.4], [9.4, 0.8], [6.8, 2.6], [5.6, 5.2], [3.2, 3.4], [0.8, 4.2]].map(([lx, lv]) => flat(Xc + mx * (17.5 + lx * 0.85), 15 + lv * 0.85));
                    fillPts(q, leaf, '#55793a');
                    strokePts(q, leaf, 0.35, 'rgba(28,48,24,0.9)', true);
                    S.ink(q, [leaf[0], flat(Xc + mx * 24, 15.6)], { w: 0.35, color: '#1c3018', alpha: 0.8 });
                    [[0, 0], [-1.7, 0.3], [1.7, 0.4], [-0.9, 2.9], [0.9, 3], [-2.5, 3], [2.5, 3.2], [0, 5.8], [-1.7, 5.7], [1.6, 5.9], [-0.8, 8.4], [0.9, 8.5], [0, 11]].forEach(([gx, gv], i) => {
                        const p = flat(bx + gx * 1.05, bv - 2 + gv * 1.02), rr = 1.5 * Fb.s;
                        disc(q, add(p, SD, 0.3), rr + 0.3, 'rgba(34,16,44,0.9)');
                        disc(q, p, rr, i % 3 ? '#5c2f6a' : '#74407c');
                        disc(q, add(p, TOL, rr * 0.38), rr * 0.3, 'rgba(226,196,232,0.85)');
                    });
                }
                // FINO: wine-red capitals with a gold shade
                labelType(q, Fb, 'FINO', Xc, 57.4, 25, FELL, GOLD, { spacing: 4.4, dx: 0.8, dy: 0.8, fit: 63 });
                labelType(q, Fb, 'FINO', Xc, 57.4, 25, FELL, WINE, { spacing: 4.4, fit: 63 });
                // a rule with a lozenge
                S.ink(q, line(Xc - 31, 62.6, Xc - 4, 62.6), { w: 0.75, color: WINE, taper: [0.9, 0] });
                S.ink(q, line(Xc + 4, 62.6, Xc + 31, 62.6), { w: 0.75, color: WINE, taper: [0, 0.9] });
                fillPts(q, [flat(Xc - 2.8, 62.6), flat(Xc, 60.6), flat(Xc + 2.8, 62.6), flat(Xc, 64.6)], GOLD);
                labelType(q, Fb, 'Vino de Jerez', Xc, 73.2, 10.4, LORA, INKB, { spacing: 0.2, italic: true, fit: 58 });
                labelType(q, Fb, 'SECO · MUY PÁLIDO', Xc, 81, 5.3, FELL, WINE, { spacing: 0.9, fit: 60 });
                labelType(q, Fb, 'CRIADO BAJO VELO DE FLOR', Xc, 86.6, 3.9, FELL, INKB, { spacing: 0.5, fit: 62 });
                labelType(q, Fb, '75 cl · 15 % vol.', Xc, 91.4, 3.3, FELL, S.rgba(INKB, 0.85), { spacing: 0.35 });
                // the lot, rubber-stamped a little askew
                labelType(q, Fb, 'N.º 0318', Xc + 26, 9.8, 4.4, FELL, 'rgba(92,56,150,0.72)', { spacing: 0.5, tilt: -0.07 });
                // paper fibres
                for (let i = 0; i < 40; i++) {
                    const X = XL + r() * (XR - XL), v = r() * 100, a = r() * 3.2, l = 1.5 + r() * 3;
                    S.ink(q, [flat(X, v), flat(X + Math.cos(a) * l, v + Math.sin(a) * l)], { w: 0.3, color: r() < 0.5 ? '#fffaf0' : '#9a865c', alpha: 0.35 });
                }
                // the shade under the corner that has curled away
                const f0 = flat(XL + FX, 0), f1 = flat(XL, FV), fm = lerpP(f0, f1, 0.5), fd = flat(XL + FX * 0.9, FV * 0.9), gr = q.createLinearGradient(fm[0], fm[1], fd[0], fd[1]);
                gr.addColorStop(0, 'rgba(60,40,30,0.55)');
                gr.addColorStop(1, 'rgba(60,40,30,0)');
                q.fillStyle = gr;
                q.fill();
            },
        });
        // the curled corner: the gummed back of the paper, catching the lamp
        {
            const p1 = flat(XL + FX, 0), p2 = flat(XL, FV), c = flat(XL, 0), m = lerpP(p1, p2, 0.5), tip = add(lerpP(c, m, 1.62), Fb.dir([-1.5, 1]));
            const bow = (a, b, kk) => add(lerpP(a, b, 0.5), [-(b[1] - a[1]), b[0] - a[0]], kk);
            const flap = S.curve([p1, bow(p1, tip, 0.13), tip, bow(tip, p2, 0.16), p2], false, 6);
            const dir = [m[0] - tip[0], m[1] - tip[1]], dl = Math.hypot(dir[0], dir[1]) || 1;
            S.piece(g, flap, {
                fill: '#f6edd4', line: 1.2, heavy: 0.6, cast: { blur: 2.6, dx: 1.6, dy: 2.4, color: 'rgba(40,24,20,0.6)' },
                shade: { color: '#93835f', alpha: 0.8, w: 5.5, push: 3.4, dir: [dir[0] / dl, dir[1] / dl] }, light: { color: '#fffdf2', alpha: 0.9, w: 3, dir: [-dir[0] / dl, -dir[1] / dl] },
                detail: (q) => {
                    // streaks of dried gum
                    for (const kk of [0.3, 0.5, 0.72]) S.ink(q, [lerpP(lerpP(p1, tip, kk), lerpP(p2, tip, kk), 0.12), lerpP(lerpP(p1, tip, kk), lerpP(p2, tip, kk), 0.88)], { w: 0.5, color: '#a8926a', alpha: 0.6, taper: [0.5, 0.5] });
                },
            });
        }
    }

    function catavino(g, Fg, seed) {
        const r = Motion.rng('catavino' + seed), hw = (y) => hwAt(FINO.gprof, y), k = S.pxScale(g), KG = 0.21;
        const side = dot2(Fg.dir([-1, 0]), TOL) >= 0 ? 1 : -1;
        const U = (u, y) => [u * side * hw(y), y];
        const col = (u, y0, y1, step = 2) => {
            const out = [];
            for (let y = y0; y < y1; y += step) out.push(U(u, y));
            out.push(U(u, y1));
            return out;
        };
        const soft = (b, fn) => {
            g.save();
            g.filter = `blur(${(b * k).toFixed(2)}px)`;
            fn();
            g.restore();
        };
        const stripe = (u0, u1, y0, y1, style) => fillPts(g, Fg.pts([...col(u0, y0, y1), ...col(u1, y0, y1).reverse()]), style);
        const out = Fg.pts(FINO.gout), yS = 58, rS = hw(yS) * 0.965, eS = rS * KG;
        // what it throws on whatever it stands on: its faint shadow, and the pale gold light
        // the wine gathers (only on paint already there)
        {
            const fc = Fg([0, 151]), c1 = add(fc, SD, 31), c2 = add(fc, SD, 36), an = Math.atan2(SD[1], SD[0]);
            g.save();
            g.globalCompositeOperation = 'source-atop';
            g.filter = `blur(${(4.5 * k).toFixed(1)}px)`;
            oval(g, add(fc, SD, 24), 34, 11, an * 0.35, 'rgba(22,14,40,0.4)');
            g.filter = `blur(${(2.6 * k).toFixed(1)}px)`;
            oval(g, c1, 17, 6.5, an * 0.35, 'rgba(255,224,130,0.85)');
            g.filter = `blur(${(0.7 * k).toFixed(1)}px)`;
            const cres = [];
            for (let i = 0; i <= 14; i++) {
                const a = an * 0.35 - 0.2 + (i / 14) * 2.4;
                cres.push([c2[0] + Math.cos(a) * 12 - 6, c2[1] + Math.sin(a) * 4.6 - 1]);
            }
            S.ink(g, cres, { w: 2.4, color: '#fff8d2', alpha: 0.95 });
            S.ink(g, [add(c1, [-9, -1.5]), add(c1, [-1, 0.5]), add(c1, [7, -1.2])], { w: 1.2, color: '#fffbe6', alpha: 0.8 });
            g.restore();
        }
        g.save();
        g.beginPath();
        S.trace(g, out);
        g.clip();
        fillPts(g, out, 'rgba(206,222,244,0.1)');
        // the wine: gold, deeper under its surface and against the wall towards the lamp,
        // light pooled in the point of the bowl
        const wr = FINO.gprof.filter(([, y]) => y > yS && y <= 90).map(([x, y]) => [x * 0.955 - 0.3, y]);
        const wine = [...FINO.arc(rS, eS, yS, Math.PI, TAU, 20), ...wr, ...wr.slice().reverse().map(([x, y]) => [-x, y])];
        const wineP = Fg.pts(wine), w0 = Fg([0, yS - eS]), w1 = Fg([0, 90]), gr = g.createLinearGradient(w0[0], w0[1], w1[0], w1[1]);
        gr.addColorStop(0, 'rgba(190,146,40,0.95)');
        gr.addColorStop(0.45, 'rgba(219,184,74,0.95)');
        gr.addColorStop(1, 'rgba(246,228,146,0.95)');
        fillPts(g, wineP, gr);
        g.save();
        g.beginPath();
        S.trace(g, wineP);
        g.clip();
        S.spray(g, wineP, { color: '#7e5a10', alpha: 0.75, w: 9, push: 5, dir: Fg.dir([-side, 0]) });
        // the bottle behind, seen through the wine: turned left to right, squeezed to a band,
        // its label a pale patch in it
        soft(1.4, () => fillPts(g, Fg.pts([[14, yS - 8], [31, yS - 8], [31, 80], [20, 86], [12, 78]]), 'rgba(34,62,34,0.82)'));
        soft(0.9, () => fillPts(g, Fg.pts([[17.5, yS - 2], [26.5, yS - 2], [25.5, 71], [18, 72.5]]), 'rgba(222,208,160,0.8)'));
        S.ink(g, Fg.pts([[19, 62], [25, 62.4]]), { w: 0.8, color: '#7d1c22', alpha: 0.6 });
        S.ink(g, Fg.pts([[18.6, 65.5], [25.2, 66]]), { w: 0.5, color: '#3a3350', alpha: 0.5 });
        soft(2.2, () => oval(g, Fg([-1, 80.5]), 10, 5.4, Fg.rot, 'rgba(255,248,196,0.8)'));
        S.ink(g, Fg.pts(col(0.82, 66, 84).map(([x, y]) => [x * 0.955, y])), { w: 1.3, color: '#fff3b4', alpha: 0.7 });
        S.ink(g, Fg.pts(col(-0.78, 64, 82).map(([x, y]) => [x * 0.955, y])), { w: 0.9, color: '#f6e08a', alpha: 0.5 });
        g.restore();
        // its surface, seen from above: paler, the far wall mirrored dark along its back, the
        // meniscus climbing the glass in front
        const surf = Fg.pts(S.ellipse(0, yS, rS, eS, 44)), s0 = Fg([0, yS - eS]), s1 = Fg([0, yS + eS]), gs = g.createLinearGradient(s0[0], s0[1], s1[0], s1[1]);
        gs.addColorStop(0, '#cda83c');
        gs.addColorStop(0.5, '#e6cb6c');
        gs.addColorStop(1, '#f5e18c');
        fillPts(g, surf, gs);
        g.save();
        g.beginPath();
        S.trace(g, surf);
        g.clip();
        S.ink(g, Fg.pts(FINO.arc(rS, eS, yS + 1.3, Math.PI, TAU, 20)), { w: 1.6, color: '#96701a', alpha: 0.6, taper: [0.3, 0.3] });
        soft(0.6, () => oval(g, Fg([-side * 9, yS + 1]), 6.5, 1.5, Fg.rot, 'rgba(255,252,226,0.75)'));
        soft(1, () => fillPts(g, Fg.pts([[12, yS - eS], [24, yS - eS], [26, yS + eS], [15, yS + eS]]), 'rgba(40,66,36,0.4)'));
        g.restore();
        S.ink(g, Fg.pts(FINO.arc(rS, eS, yS + 0.9, 0.12, Math.PI - 0.12, 20)), { w: 0.9, color: '#8a6412', alpha: 0.5, taper: [0.5, 0.5] });
        S.ink(g, Fg.pts(FINO.arc(rS, eS, yS, 0.1, Math.PI - 0.1, 20)), { w: 0.9, color: '#fff7cc', alpha: 0.95, taper: [0.5, 0.5] });
        for (let i = 0; i < 5; i++) {
            const a = 1.9 + r() * 0.9, p = Fg([Math.cos(a) * (rS - 1.6 - r() * 2), yS + Math.sin(a) * (eS - 1) - 0.4]);
            g.strokeStyle = 'rgba(255,250,224,0.85)';
            g.lineWidth = 0.3;
            g.beginPath();
            g.arc(p[0], p[1], 0.55 + r() * 0.4, 0, TAU);
            g.stroke();
        }
        // legs: the wine it was swirled with still runs down the wall
        for (let i = 0; i < 7; i++) {
            const x = -24 + i * 8 + (r() - 0.5) * 3, top = 26 + r() * 14, bot = yS - eS * Math.sqrt(Math.max(0, 1 - (x / rS) * (x / rS))) - 0.5;
            S.ink(g, Fg.pts([[x - 0.6, top], [x, (top + bot) / 2], [x + 0.3, bot]]), { w: 0.7 + r() * 0.4, color: '#fffbe6', alpha: 0.3, taper: [1, 0] });
            if (i % 2) oval(g, Fg([x + 0.2, bot - 3 - r() * 6]), 0.7, 1.2, Fg.rot, 'rgba(255,240,176,0.5)');
        }
        // the thickness of the glass: a pale line inside each edge, wider where the light leaves
        S.ink(g, Fg.pts(col(-0.9, 3, 86)), { w: 0.8, color: '#eef6ff', alpha: 0.55, taper: [0.4, 0.6] });
        soft(0.9, () => S.ink(g, Fg.pts(col(0.84, 4, 56)), { w: 2.4, color: '#e6f0ff', alpha: 0.32 }));
        S.ink(g, Fg.pts(col(0.94, 3, 88)), { w: 0.6, color: '#1c2244', alpha: 0.4 });
        // the window, on the bowl's shoulder: two panes above the wine, their echo in it
        soft(1.6, () => stripe(-0.86, -0.46, 8, 48, 'rgba(226,240,255,0.22)'));
        soft(0.25, () => {
            stripe(-0.8, -0.6, 10, 25.5, 'rgba(246,251,255,0.88)');
            stripe(-0.82, -0.62, 28.5, 46, 'rgba(246,251,255,0.8)');
            stripe(-0.57, -0.52, 12, 44, 'rgba(246,251,255,0.35)');
            stripe(-0.78, -0.62, 61.5, 72, 'rgba(255,246,204,0.5)');
            stripe(0.58, 0.68, 12, 21, 'rgba(240,248,255,0.4)');
        });
        // the far rim, through the glass
        S.ink(g, Fg.pts(FINO.arc(21, 21 * KG, 0, Math.PI + 0.1, TAU - 0.1, 16).map(([x, y]) => [x * 0.95, y + 1.1])), { w: 0.7, color: '#eef6ff', alpha: 0.5, taper: [0.3, 0.3] });
        // the solid glass where the bowl meets the stem
        oval(g, Fg([0, 88.4]), 5.6, 3, Fg.rot, 'rgba(34,46,84,0.5)');
        oval(g, Fg([0, 86.6]), 4, 1.3, Fg.rot, 'rgba(255,240,170,0.75)');
        disc(g, Fg([-side * 1.6, 89]), 1, 'rgba(255,255,255,0.95)');
        // the stem: dark at both edges, a bright core
        stripe(-1, 1, 90, 142, 'rgba(190,210,236,0.16)');
        S.ink(g, Fg.pts(col(0.55, 93, 138)), { w: 1, color: '#1c2244', alpha: 0.35 });
        S.ink(g, Fg.pts(col(-0.3, 94, 119)), { w: 1.35, color: '#fafdff', alpha: 0.95, taper: [0.6, 0.4] });
        S.ink(g, Fg.pts(col(-0.3, 123, 135)), { w: 1.3, color: '#fafdff', alpha: 0.9, taper: [0.4, 0.6] });
        // the foot: its far edge, the ring ground on its underside, light caught in it
        const footP = Fg.pts([...FINO.arc(30, 6.2, 150, 0, TAU, 40)]);
        fillPts(g, footP, 'rgba(196,214,238,0.13)');
        S.ink(g, Fg.pts(FINO.arc(30, 6.2, 150.6, Math.PI + 0.25, TAU - 0.25, 20)), { w: 0.7, color: '#1c2244', alpha: 0.55, taper: [0.5, 0.5] });
        strokePts(g, Fg.pts(S.ellipse(0, 150.4, 21, 4.2, 32)), 0.5, 'rgba(238,246,255,0.32)', true);
        strokePts(g, Fg.pts(S.ellipse(0, 150.6, 12, 2.4, 24)), 0.4, 'rgba(238,246,255,0.22)', true);
        const fa = side > 0 ? [1.75, 2.85] : [0.3, 1.4];
        S.ink(g, Fg.pts(FINO.arc(28.6, 5.3, 150, fa[0], fa[1], 14)), { w: 1.2, color: '#ffffff', alpha: 0.88 });
        S.ink(g, Fg.pts(FINO.arc(28.8, 5.4, 150, Math.PI - fa[1] + 0.5, Math.PI - fa[0] - 0.2, 10)), { w: 0.7, color: '#eef6ff', alpha: 0.45 });
        soft(0.5, () => oval(g, Fg([side * 5, 152.2]), 6, 1.5, Fg.rot, 'rgba(255,236,160,0.75)'));
        S.ink(g, Fg.pts([[-9, 142.2], [-17, 146], [-25, 148.6]]), { w: 0.6, color: '#f4f9ff', alpha: 0.5, taper: [0.2, 0.8] });
        g.restore();
        // the contour: a line (the glass has no body to fill), heavier on the far side
        g.save();
        g.beginPath();
        g.rect(-4000, -4000, 8000, 8000);
        S.trace(g, out);
        g.clip('evenodd');
        g.translate(SD[0] * 0.8, SD[1] * 0.8);
        strokePts(g, out, 1.5, INK, true);
        g.restore();
        strokePts(g, out, 1.35, INK, true);
        // the near rim: a pale line with two glints, the glass's thickness under it
        const rimF = (a0, a1, n = 12) => Fg.pts(FINO.arc(21, 21 * KG, 0, a0, a1, n));
        S.ink(g, rimF(0.06, Math.PI - 0.06, 22).map((p) => add(p, Fg.dir([0, 1]), 1)), { w: 0.6, color: '#1c2244', alpha: 0.55, taper: [0.6, 0.6] });
        S.ink(g, rimF(0.03, Math.PI - 0.03, 22), { w: 0.9, color: '#e8f1ff', alpha: 0.85, taper: [0.5, 0.5] });
        const ga = side > 0 ? [1.85, 2.5] : [0.64, 1.29];
        S.ink(g, rimF(ga[0], ga[1]), { w: 1.7, color: '#ffffff', alpha: 0.98 });
        S.ink(g, rimF(Math.PI - ga[1] + 0.35, Math.PI - ga[1] + 0.6, 5), { w: 1.2, color: '#ffffff', alpha: 0.8 });
    }

    // A fly, come for the wine: about 8 units long, heading along -y of its frame.
    function fly(g, Ff) {
        const cs = { blur: 1.4, dx: 1.1, dy: 1.6, color: 'rgba(30,20,30,0.55)' };
        const body = [...S.ellipse(0, 2.4, 1.9, 2.7, 14), ...S.ellipse(0, -0.9, 1.7, 1.5, 12), ...S.ellipse(0, -2.9, 1.25, 1, 10)];
        S.cast(g, (q) => {
            fillPts(q, Ff.pts(S.ellipse(0, 0.8, 2, 4.4, 14)), '#000');
            for (const mx of [-1, 1]) fillPts(q, Ff.pts(S.ellipse(mx * 2.4, 3.2, 1.5, 3.6, 12, mx * -0.42)), '#000');
        }, cs);
        // legs
        for (const mx of [-1, 1]) {
            for (const [y0, dx, dy] of [[-1.6, 3.2, -2.2], [-0.8, 3.8, 0.4], [0, 3.4, 2.6]]) S.ink(g, Ff.pts([[mx * 1.1, y0], [mx * (1.1 + dx * 0.55), y0 + dy * 0.4 - 0.5], [mx * (1.1 + dx), y0 + dy]]), { w: 0.42, color: '#15101c', taper: [0, 0.4] });
        }
        fillPts(g, Ff.pts(S.ellipse(0, 2.4, 2.2, 3, 14)), '#15101c');
        fillPts(g, Ff.pts(S.ellipse(0, 2.4, 1.7, 2.5, 14)), '#3a3442');
        for (const yy of [1.4, 2.7, 3.9]) S.ink(g, Ff.pts([[-1.5, yy], [0, yy + 0.3], [1.5, yy]]), { w: 0.4, color: '#b8ae9a', alpha: 0.6, taper: [0.4, 0.4] });
        fillPts(g, Ff.pts(S.ellipse(0, -0.9, 2, 1.8, 12)), '#15101c');
        fillPts(g, Ff.pts(S.ellipse(0, -0.9, 1.5, 1.35, 12)), '#4a4454');
        disc(g, add(Ff([0, -0.9]), TOL, 0.5), 0.4 * Ff.s, 'rgba(230,232,255,0.8)');
        fillPts(g, Ff.pts(S.ellipse(0, -2.9, 1.5, 1.2, 10)), '#15101c');
        for (const mx of [-1, 1]) disc(g, Ff([mx * 0.8, -3]), 0.62 * Ff.s, '#8e2c22');
        // wings: clear, veined, folded back over the body
        for (const mx of [-1, 1]) {
            const wing = Ff.pts(S.curve([[mx * 0.5, -0.6], [mx * 2.6, 1], [mx * 3.9, 4.2], [mx * 2.8, 6.4], [mx * 1.2, 5.6], [mx * 0.5, 2.6]], true, 5));
            fillPts(g, wing, 'rgba(226,236,255,0.55)');
            strokePts(g, wing, 0.32, 'rgba(21,16,28,0.85)', true);
            S.ink(g, Ff.pts([[mx * 0.7, -0.2], [mx * 2, 2.6], [mx * 2.7, 5.8]]), { w: 0.28, color: '#15101c', alpha: 0.7, taper: [0, 0.6] });
            S.ink(g, Ff.pts([[mx * 1.4, 1.6], [mx * 3.3, 4.4]]), { w: 0.25, color: '#15101c', alpha: 0.6, taper: [0, 0.6] });
            S.ink(g, Ff.pts([[mx * 1.2, 0.4], [mx * 2.2, 3.6]]).map((p2) => add(p2, TOL, 0.3)), { w: 0.4, color: '#ffffff', alpha: 0.6 });
        }
    }

    function fino(g, o = {}) {
        const { x = 0, y = 0, s = 1, seed = 'fino' } = o, rot = snap(o.rot ?? 0);
        g.save();
        g.translate(x, y);
        g.scale(s, s);
        const F = frame(0, 0, rot), Fb = F.sub(FINO.BX, FINO.BY), Fg = F.sub(FINO.GX, FINO.GY);
        bottle(g, Fb, seed);
        label(g, Fb, seed);
        // a fly on the label's margin, between the type and the glass
        {
            const X = 30, v = 68, p = FINO.lab(X, v);
            fly(g, Fb.sub(p[0], p[1], -0.5, 0.95));
        }
        catavino(g, Fg, seed);
        g.restore();
    }

    // ------------------------------------------------------------------ peineta
    // Local coordinates: the crown's top scallop at y = -116, the bridge at y = 2..18, the
    // teeth down to y = 116. One sheet of shell: the mask is the sheet with its piercings cut
    // out, raised as a bevel (the sawn edges are eased) on a gentle cylinder (it is bent to
    // the head).
    const SHELL = [[0, '#200808'], [0.2, '#55200f'], [0.38, '#a2541a'], [0.54, '#d38c2c'], [0.7, '#ecb248'], [0.86, '#f9d886'], [1, '#fff0c0']];
    const comb = (seed) => memo('comb/' + seed, () => {
        const r = Motion.rng('comb' + seed), j = (k = 1) => (r() - 0.5) * k;
        // the crown's edge: an arch of nine scallops, then the sides drawn in to the bridge
        const N = 9, arch = [];
        for (let i = 0; i <= 180; i++) {
            const ph = Math.PI - (i / 180) * Math.PI, lobe = Math.pow(Math.abs(Math.sin(N * ph)), 0.55), k = 1 + 0.05 * lobe;
            arch.push([97 * Math.cos(ph) * k, -22 - 89.5 * Math.sin(ph) * k]);
        }
        const sideR = S.curve([[97, -22], [95.5, -10], [88, 0], [80.5, 7], [78, 18]], false, 6).slice(1);
        // the teeth: nine, the middle ones longest, none quite like its neighbour
        const NT = 9, pitch = 17, teeth = [];
        for (let i = 0; i < NT; i++) {
            const cx = (i - (NT - 1) / 2) * pitch + j(1.2), len = 96 - 1.1 * (i - 4) * (i - 4) + j(5);
            teeth.push({ cx, len, w0: 10.6 + j(0.8), w1: 3.4 + j(0.5), lean: j(1.6) + (i === 2 ? 3.2 : 0), chip: i === 6 });
        }
        const toothPts = (t) => {
            // down its right flank, round the tip (or across the break), up its left flank
            const L = t.chip ? t.len * 0.56 : t.len, y1 = 18 + L, out = [], hwT = (u) => (t.w0 + (t.w1 - t.w0) * Math.pow(u, 0.8)) / 2, cxT = (u) => t.cx + t.lean * u * u;
            const n = 10;
            for (let k = 0; k <= n; k++) out.push([cxT((k / n) * (L / t.len)) + hwT((k / n) * (L / t.len)), 18 + (k / n) * (L - (t.chip ? 0 : 2))]);
            if (t.chip) out.push([cxT(0.56) + 0.6, y1 + 3.4], [cxT(0.56) - 1.4, y1 + 1.2]);
            else for (let k = 1; k < 6; k++) out.push([cxT(1) + Math.cos((k / 6) * Math.PI) * hwT(1), y1 - 2 + Math.sin((k / 6) * Math.PI) * 2.2]);
            for (let k = n; k >= 0; k--) out.push([cxT((k / n) * (L / t.len)) - hwT((k / n) * (L / t.len)), 18 + (k / n) * (L - (t.chip ? 0 : 2))]);
            return out;
        };
        const outline = [...arch, ...sideR];
        for (let i = NT - 1; i >= 0; i--) outline.push(...toothPts(teeth[i]));
        outline.push(...sideR.slice().reverse().map(([x, y]) => [-x, y]).slice(0, -1));
        // --- the piercings
        const holes = [];
        const tear = (cx, cy, ang, len, w, k = 1.45) => {
            // a drop: a point at (cx, cy), swelling to a round end `len` away along `ang`
            const out = [], n = 14;
            for (let i = 0; i <= n; i++) {
                const u = i / n, hw = (w / 2) * Math.pow(Math.sin(Math.PI * Math.pow(u, k)), 0.8);
                out.push([u * len, -hw]);
            }
            for (let i = n - 1; i > 0; i--) {
                const u = i / n, hw = (w / 2) * Math.pow(Math.sin(Math.PI * Math.pow(u, k)), 0.8);
                out.push([u * len, hw]);
            }
            return S.xf(out, { x: cx, y: cy, rot: ang });
        };
        const round = (cx, cy, rr) => S.ellipse(cx, cy, rr * (1 + j(0.1)), rr * (1 + j(0.1)), 14, r() * 3);
        // 1 · a drilled hole in every scallop, a small one in every valley between
        for (let i = 0; i < N; i++) {
            const ph = Math.PI - ((i + 0.5) / N) * Math.PI;
            holes.push(round(97 * Math.cos(ph) * 0.935 + j(0.8), -22 - 89.5 * Math.sin(ph) * 0.935 + j(0.8), 3 + j(0.4)));
            if (i) {
                const pv = Math.PI - (i / N) * Math.PI;
                holes.push(round(97 * Math.cos(pv) * 0.885, -22 - 89.5 * Math.sin(pv) * 0.885, 1.6));
            }
        }
        // 2 · the fan in the middle: seven blades sawn out, round-headed
        const FC = [0, -14], fan = [];
        for (let i = -3; i <= 3; i++) {
            const a = -Math.PI / 2 + i * 0.27 + j(0.02), len = 49 - Math.abs(i) * 3.4 + j(2);
            fan.push({ a, len });
            holes.push(tear(FC[0] + Math.cos(a) * 25, FC[1] + Math.sin(a) * 25, a, len, 9.6 - Math.abs(i) * 0.4 + j(0.6), 1.75));
        }
        // a row of beads over the fan
        for (let i = -4; i <= 4; i++) {
            const a = -Math.PI / 2 + i * 0.2;
            holes.push(round(FC[0] + Math.cos(a) * 82.5, FC[1] + Math.sin(a) * 82.5 + Math.abs(i) * 0.6, 2.1 - Math.abs(i) * 0.1));
        }
        // 3 · a flower each side: six petals round a boss
        const flowers = [];
        for (const mx of [-1, 1]) {
            const c = [mx * 59 + j(1.5), -33 + j(1.5)], a0 = r() * 1;
            flowers.push({ c, a0 });
            for (let k = 0; k < 6; k++) {
                const a = a0 + (k / 6) * TAU + j(0.06);
                holes.push(tear(c[0] + Math.cos(a) * 5.2, c[1] + Math.sin(a) * 5.2, a, 11.6 + j(1), 6.4 + j(0.5), 1.35));
            }
            // 4 · scrolls, commas and tears in what is left
            const C1 = S.curve([[mx * 30, 4.5], [mx * 39, -3], [mx * 47, -5], [mx * 51.5, 0.5], [mx * 48, 5], [mx * 44.5, 2.5]].map(([x, y]) => [x + j(0.8), y - 6 + j(0.8)]), false, 8);
            holes.push(band(C1, (u) => 1.6 + 3.2 * Math.sin(Math.PI * Math.pow(u, 0.6))));
            const C2 = S.curve([[mx * 68, -4], [mx * 76, -10], [mx * 82.5, -9], [mx * 84, -3.5], [mx * 80.5, -1]].map(([x, y]) => [x + j(0.8), y + j(0.8)]), false, 8);
            holes.push(band(C2, (u) => 1.4 + 2.8 * Math.sin(Math.PI * Math.pow(u, 0.6))));
            holes.push(tear(mx * 78 + j(1), -52 + j(1), -Math.PI / 2 + mx * 0.3, 14, 5.8));
            holes.push(tear(mx * 80 + j(1), -18 + j(1), Math.PI / 2 - mx * 0.25, 10, 4.6));
            holes.push(tear(mx * 66.5 + j(1), -62 + j(1), -Math.PI / 2 - mx * 0.22, 11, 5));
            holes.push(tear(mx * 21 + j(0.6), -4.6, Math.PI / 2 + mx * 1.05, 9.5, 4.2));
            holes.push(round(mx * 60 + j(1), -9.4, 2.3), round(mx * 68.5 + j(1), -74 + j(1), 2.2), round(mx * 48 + j(1), -86.5 + j(1), 2), round(mx * 12.8, -1.6, 1.7));
        }
        return { outline, holes, teeth, fan, FC, flowers, box: { x: -104, y: -122, w: 208, h: 244 } };
    });

    function peinetaSprite(rot, res, seed) {
        return memo(`peineta/${rot.toFixed(3)}@${res}/${seed}`, () => {
            const G = comb(seed), L = S.lightFor(rot), sh = local(SD, rot), tl = [-sh[0], -sh[1]], sd = S.seedOf('shell' + seed);
            const r = Motion.rng('shell-marks' + seed);
            const mask = (q) => {
                q.beginPath();
                S.trace(q, G.outline);
                q.fill();
                q.globalCompositeOperation = 'destination-out';
                for (const h of G.holes) {
                    q.beginPath();
                    S.trace(q, h);
                    q.fill();
                }
                q.globalCompositeOperation = 'source-over';
            };
            // how much shell there is about a point (0 = a thin bar, an edge, a tooth's tip:
            // there the light comes through)
            const fr = Math.min(res, 2), fw = Math.ceil(G.box.w * fr), fh = Math.ceil(G.box.h * fr);
            const fc = document.createElement('canvas');
            fc.width = fw;
            fc.height = fh;
            const fq = fc.getContext('2d', { willReadFrequently: true });
            fq.filter = `blur(${(5.5 * fr).toFixed(1)}px)`;
            fq.setTransform(fr, 0, 0, fr, -G.box.x * fr, -G.box.y * fr);
            fq.fillStyle = '#fff';
            mask(fq);
            const fd = fq.getImageData(0, 0, fw, fh).data;
            const solid = (x, y) => fd[(Math.min(fh - 1, Math.max(0, Math.round((y - G.box.y) * fr))) * fw + Math.min(fw - 1, Math.max(0, Math.round((x - G.box.x) * fr)))) * 4 + 3] / 255;
            // The mottle of real shell: dark, soft-edged patches drawn out along the sheet, each
            // in a red-brown halo, and a scatter of smaller spots (the coordinates are warped
            // first, so the patches have lobes and necks).
            const mottle = (x, y) => {
                const wx = x + 15 * S.noise2(x * 0.024, y * 0.024, sd + 20), wy = y + 15 * S.noise2(x * 0.024 + 9, y * 0.024, sd + 21);
                const n1 = S.noise2(wx * 0.036 + 3, wy * 0.025, sd) * 0.6 + S.noise2(wx * 0.085, wy * 0.058 + 7, sd + 1) * 0.4;
                const n2 = S.noise2(wx * 0.14 + 9, wy * 0.1, sd + 2), grainS = 0.93 + 0.07 * S.noise2(x * 0.5, y * 0.05, sd + 4);
                const dark = Math.max(S.smooth(0.045, 0.1, n1), S.smooth(0.35, 0.42, n2) * 0.9) * grainS;
                return [dark, Math.max(S.smooth(-0.2, 0.05, n1), S.smooth(0.14, 0.36, n2) * 0.75) * (1 - dark)];
            };
            const sp = S.form({
                box: G.box, res, seed: 'peineta' + seed, light: L, inflate: 'bevel', R: 2.7, profile: 'dome', relief: 1.25, smooth: 0.0016,
                mask,
                height: (x, y) => 13 * (1 - (x * x) / 11000) + 0.5 * S.noise2(x * 0.05, y * 0.05, sd + 3),
                ramp: SHELL, soft: 1,
                stroke: { amp: 0.03, freq: 0.05, tone: 4 },
                spec: { amp: 0.75, power: 34, from: 0.4, to: 0.9, ragged: 0.12, color: '#fff3d2' },
                tint: (x, y, tone, rgb) => {
                    const [dark, halo] = mottle(x, y);
                    const f = 0.55 + 0.75 * tone;
                    rgb[0] += (150 * f - rgb[0]) * halo * 0.62;
                    rgb[1] += (58 * f - rgb[1]) * halo * 0.62;
                    rgb[2] += (20 * f - rgb[2]) * halo * 0.62;
                    rgb[0] += (36 * f - rgb[0]) * dark * 0.95;
                    rgb[1] += (11 * f - rgb[1]) * dark * 0.95;
                    rgb[2] += (11 * f - rgb[2]) * dark * 0.95;
                    // light through the thin parts: the honey glows, even the patches turn red
                    const thin = S.smooth(0.74, 0.36, solid(x, y)), kg = thin * (0.62 - 0.3 * dark);
                    rgb[0] += (255 - rgb[0]) * kg;
                    rgb[1] += ((dark > 0.5 ? 120 : 190) - rgb[1]) * kg;
                    rgb[2] += ((dark > 0.5 ? 40 : 70) - rgb[2]) * kg * 0.8;
                },
                over: (q) => {
                    // the patches are not clouds: each is made of fine dark fibres along the
                    // sheet, with red threads at its edge; the clear honey has pale flecks
                    for (let i = 0; i < 2600; i++) {
                        const x = -100 + r() * 200, y = -118 + r() * 234, [dk, hl] = mottle(x, y), l = 2 + r() * 6, a = Math.PI / 2 + (r() - 0.5) * 0.5;
                        const b = [x + Math.cos(a) * l, y + Math.sin(a) * l];
                        if (dk > 0.5) S.ink(q, [[x, y], b], { w: 0.45 + r() * 0.4, color: r() < 0.7 ? '#1a0606' : '#8a3212', alpha: 0.3 + r() * 0.3 });
                        else if (hl > 0.25) S.ink(q, [[x, y], b], { w: 0.45 + r() * 0.35, color: r() < 0.55 ? '#8a2e10' : '#2a0c08', alpha: 0.3 + r() * 0.3 });
                        else if (r() < 0.3) S.ink(q, [[x, y], [x + (b[0] - x) * 0.5, y + (b[1] - y) * 0.5]], { w: 0.4, color: '#fff0c0', alpha: 0.16 + r() * 0.18 });
                    }
                    const cut = (pts, w = 0.8, o = {}) => incise(q, pts, sh, w, { color: '#3a1208', lit: '#ffe6a6', alpha: 0.8, la: 0.6, ...o });
                    // chased work: a line inside the scalloped edge, a vein down every rib of the
                    // fan, a rosette on its boss, petals round each flower's boss
                    const inner = [];
                    for (let i = 4; i <= 176; i += 2) {
                        const ph = Math.PI - (i / 180) * Math.PI, lobe = Math.pow(Math.abs(Math.sin(9 * ph)), 0.55), k = (1 + 0.05 * lobe) * 0.83;
                        inner.push([97 * Math.cos(ph) * k, -22 - 89.5 * Math.sin(ph) * k]);
                    }
                    cut(inner, 0.8, { taper: [0.2, 0.2] });
                    for (let i = 0; i < G.fan.length - 1; i++) {
                        const a = (G.fan[i].a + G.fan[i + 1].a) / 2;
                        cut([pol(18, a, ...G.FC), pol(42, a, ...G.FC), pol(64, a, ...G.FC)], 0.75, { taper: [0.2, 0.8] });
                    }
                    for (let k = 0; k < 10; k++) cut([pol(4.5, -Math.PI + (k / 9) * Math.PI, ...G.FC), pol(15.5, -Math.PI + (k / 9) * Math.PI, ...G.FC)], 0.7, { taper: [0.2, 0.6] });
                    strokePts(q, S.ellipse(G.FC[0], G.FC[1], 17.6, 17.6, 40), 0.7, 'rgba(58,18,8,0.7)', true);
                    for (const fl of G.flowers) {
                        strokePts(q, S.ellipse(fl.c[0], fl.c[1], 3.2, 3.2, 16), 0.6, 'rgba(58,18,8,0.8)', true);
                        for (let k = 0; k < 6; k++) disc(q, pol(1.9, fl.a0 + (k / 6) * TAU + 0.5, ...fl.c), 0.42, 'rgba(58,18,8,0.8)');
                        for (let k = 0; k < 6; k++) {
                            const a = fl.a0 + ((k + 0.5) / 6) * TAU;
                            cut([pol(7, a, ...fl.c), pol(17.5, a, ...fl.c)], 0.6, { taper: [0.2, 0.9] });
                        }
                    }
                    // punched dots along the edge line, and a matted (hatched) ground either side of the fan
                    for (let i = 8; i <= 172; i += 4) {
                        const ph = Math.PI - (i / 180) * Math.PI, lobe = Math.pow(Math.abs(Math.sin(9 * ph)), 0.55), k = (1 + 0.05 * lobe) * 0.795, p = [97 * Math.cos(ph) * k, -22 - 89.5 * Math.sin(ph) * k];
                        disc(q, add(p, sh, 0.45), 0.6, 'rgba(255,230,166,0.55)');
                        disc(q, p, 0.6, 'rgba(50,14,8,0.8)');
                    }
                    for (const mx of [-1, 1]) {
                        for (let i = 0; i < 11; i++) {
                            const x0 = mx * (33 + i * 2.6), y0 = -27 + i * 1.1;
                            S.ink(q, [[x0, y0], [x0 + mx * 7, y0 + 12]], { w: 0.4, color: '#3a1208', alpha: 0.42, taper: [0.2, 0.2] });
                        }
                        // a sprig cut beside each flower
                        const c = G.flowers[mx < 0 ? 0 : 1].c, stem = S.curve([[c[0] - mx * 17, c[1] + 15], [c[0] - mx * 23, c[1] + 6], [c[0] - mx * 22.5, c[1] - 6], [c[0] - mx * 17, c[1] - 15]], false, 6);
                        cut(stem, 0.6, { taper: [0.2, 0.7] });
                        for (const k of [5, 10, 15]) cut([stem[k], add(stem[k], [-mx * 4.4, -2.6])], 0.55, { taper: [0, 0.8] });
                    }
                    // the bridge: two cut lines, a row of punched dots, a zigzag
                    const br = (y, x0 = 75) => {
                        const o = [];
                        for (let x = -x0; x <= x0; x += 5) o.push([x, y + 1.2 * (1 - (x * x) / (x0 * x0))]);
                        return o;
                    };
                    cut(br(4.2, 77), 0.8, { taper: [0.3, 0.3] });
                    cut(br(14.6, 74), 0.8, { taper: [0.3, 0.3] });
                    for (let x = -70; x <= 70; x += 4.7) {
                        const p = [x, 9.6 + 1.2 * (1 - (x * x) / 5600)];
                        disc(q, add(p, sh, 0.5), 0.75, 'rgba(255,230,166,0.6)');
                        disc(q, p, 0.75, 'rgba(50,14,8,0.85)');
                    }
                    // the maker's scratch, where the mantilla hides it
                    S.ink(q, [[60, 11.5], [61.5, 7.8], [63, 11.5], [64.5, 7.8], [66, 11.5]], { w: 0.45, color: '#3a1208', alpha: 0.75, taper: [0, 0] });
                    // every tooth: file marks at its root, a dark line down its far flank
                    for (const t of G.teeth) {
                        for (const k of [0, 1, 2]) S.ink(q, [[t.cx - t.w0 * 0.42, 19.5 + k * 2.2], [t.cx + t.w0 * 0.42, 20.6 + k * 2.2]], { w: 0.45, color: '#3a1208', alpha: 0.45 });
                        const L2 = (t.chip ? 0.56 : 1) * t.len;
                        S.ink(q, [0.08, 0.4, 0.7, 0.95].map((u) => [t.cx + t.lean * u * u * (t.chip ? 0.31 : 1) + sh[0] * 0.1 * t.w0, 18 + u * L2]), { w: 0.6, color: '#3a1208', alpha: 0.35, taper: [0.3, 0.9] });
                        if (t.chip) {
                            // the break: a pale, splintered face
                            const yb = 18 + L2;
                            fillPts(q, [[t.cx - 5, yb - 2.6], [t.cx + 5, yb - 4.4], [t.cx + 5, yb + 5], [t.cx - 5, yb + 5]], 'rgba(255,226,160,0.8)');
                            for (const k of [-2, -0.6, 0.9]) S.ink(q, [[t.cx + k, yb - 3.6 + k * 0.2], [t.cx + k + 0.4, yb + 2]], { w: 0.4, color: '#6a2a10', alpha: 0.8 });
                        }
                    }
                    // a hairline crack from a petal of the right-hand flower out to the edge
                    {
                        const c = G.flowers[1].c;
                        const ck = [[c[0] + 15.5, c[1] - 6], [c[0] + 20, c[1] - 9.5], [c[0] + 23.4, c[1] - 9], [c[0] + 28, c[1] - 13], [c[0] + 33, c[1] - 13.8]];
                        S.ink(q, ck.map((p) => add(p, sh, 0.6)), { w: 0.5, color: '#ffe6a6', alpha: 0.6, taper: [0, 0.6] });
                        S.ink(q, ck, { w: 0.8, color: '#2a0a06', alpha: 0.85, taper: [0, 0.6] });
                    }
                    // scratches: years of pins and combing
                    for (let i = 0; i < 60; i++) {
                        const x = -95 + r() * 190, y = -112 + r() * 226, a = (y > 18 ? Math.PI / 2 : r() * Math.PI) + (r() - 0.5) * 0.5, l = 3 + r() * 10;
                        S.ink(q, [[x, y], [x + Math.cos(a) * l, y + Math.sin(a) * l]], { w: 0.4 + r() * 0.25, color: r() < 0.6 ? '#ffedba' : '#3a1208', alpha: 0.16 + r() * 0.2 });
                    }
                },
            });
            sprayIn(sp, res, { color: '#3a0d10', alpha: 0.5, w: 11, dir: sh });
            sprayIn(sp, res, { color: '#2a0816', alpha: 0.6, w: 3.2, dir: sh });
            sprayIn(sp, res, { color: '#ffe9b0', alpha: 0.5, w: 6, dir: tl });
            // the sawn edges: every rim that faces the lamp is a crisp light, every rim that
            // faces away a crisp dark (round the piercings too)
            sprayIn(sp, res, { color: '#1c0508', alpha: 0.85, w: 0.8, push: 0.32, dir: sh });
            sprayIn(sp, res, { color: '#fff2c4', alpha: 1, w: 0.8, push: 0.36, dir: tl });
            sprayIn(sp, res, { color: '#ffd98a', alpha: 0.5, w: 2.4, push: 0.9, dir: tl });
            onto(sp, res, (q) => {
                // the polish: a long light following the crown's curve on the lamp's side (a soft
                // band, a crisp core, a dash beyond it); the piercings break it up
                const phc = S.clamp(Math.atan2(-tl[1], tl[0]) < 0 ? Math.atan2(-tl[1], tl[0]) + TAU : Math.atan2(-tl[1], tl[0]), 0.45, Math.PI - 0.45);
                const arcAt = (k, a0, a1, n = 16) => {
                    const o = [];
                    for (let i = 0; i <= n; i++) {
                        const ph = a0 + ((a1 - a0) * i) / n;
                        o.push([97 * Math.cos(ph) * k, -22 - 89.5 * Math.sin(ph) * k]);
                    }
                    return o;
                };
                q.save();
                q.filter = `blur(${(2.2 * res).toFixed(1)}px)`;
                S.ink(q, arcAt(0.72, phc - 0.55, phc + 0.55), { w: 11, color: '#ffeec0', alpha: 0.42 });
                q.restore();
                S.ink(q, arcAt(0.725, phc - 0.2, phc + 0.14), { w: 2.9, color: '#fffbea', alpha: 0.95, taper: [0.7, 0.6] });
                S.ink(q, arcAt(0.725, phc + 0.2, phc + 0.27, 4), { w: 2.3, color: '#fffbea', alpha: 0.85 });
                S.ink(q, arcAt(0.46, phc - 0.26, phc + 0.1), { w: 1.2, color: '#fff3cc', alpha: 0.5, taper: [0.8, 0.8] });
                // and along the bridge, the one part with no piercing to break it
                {
                    const sg = tl[0] >= 0 ? 1 : -1, by = (x) => 7.4 + 1.2 * (1 - (x * x) / 5600);
                    const run = (x0, x1) => {
                        const o = [];
                        for (let x = x0; x <= x1 + 0.01; x += (x1 - x0) / 8) o.push([sg * x, by(x)]);
                        return o;
                    };
                    q.save();
                    q.filter = `blur(${(1.4 * res).toFixed(1)}px)`;
                    S.ink(q, run(14, 66), { w: 5, color: '#ffeec0', alpha: 0.5 });
                    q.restore();
                    S.ink(q, run(26, 54), { w: 1.7, color: '#fffbea', alpha: 0.92, taper: [0.7, 0.6] });
                    S.ink(q, run(58, 62), { w: 1.5, color: '#fffbea', alpha: 0.8 });
                }
                // a glint on the swell of each scallop that looks at the lamp
                for (let i = 0; i < 9; i++) {
                    const ph = Math.PI - ((i + 0.5) / 9) * Math.PI, d = Math.abs(ph - phc);
                    if (d < 0.75) S.ink(q, arcAt(0.99, ph + 0.06, ph - 0.03, 3).map((p) => add(p, tl, -2.6)), { w: 1.5 - d, color: '#fffbea', alpha: 0.9 - d * 0.6 });
                }
                // each tooth has its own light down the flank that faces the lamp, and a glint near its tip
                for (const t of G.teeth) {
                    const L2 = (t.chip ? 0.56 : 1) * t.len, sg = tl[0] >= 0 ? 1 : -1, fl = (u) => [t.cx + t.lean * u * u * (t.chip ? 0.31 : 1) + sg * (t.w0 + (t.w1 - t.w0) * u) * 0.27, 18 + u * L2];
                    S.ink(q, [0.1, 0.25, 0.42, 0.56].map(fl), { w: 1.25, color: '#fff6d6', alpha: 0.85, taper: [0.6, 0.6] });
                    S.ink(q, [0.63, 0.69].map(fl), { w: 1.1, color: '#fff6d6', alpha: 0.75 });
                    if (!t.chip) disc(q, [t.cx + t.lean * 0.86, 18 + L2 * 0.93], 0.75, 'rgba(255,251,234,0.9)');
                }
            });
            return sp;
        });
    }

    function peineta(g, o = {}) {
        const { x = 0, y = 0, s = 1, seed = 'peineta' } = o, rot = snap(o.rot ?? 0);
        g.save();
        g.translate(x, y);
        g.scale(s, s);
        const sp = peinetaSprite(rot, resOf(g), seed);
        stamp(g, sp, { rot, lw: 1.9, heavy: 0.6, ink: '#150a14', cast: { blur: 8, dx: 4, dy: 5.5, color: 'rgba(12,7,26,0.6)' } });
        // a long dark hair still wound through the teeth
        {
            const F = frame(0, 0, rot), T = comb(seed).teeth, x = (i) => T[i].cx;
            const hair = S.curve([[x(2) - 9, 31], [x(2), 36], [x(3) - 2, 44], [x(3) + 7, 40], [x(4) + 2, 47], [x(5) - 3, 58], [x(5) + 6, 62], [x(5) + 11, 76], [x(5) + 6, 92], [x(5) + 12, 104]], false, 10);
            S.ink(g, F.pts(hair), { w: 1.5, color: '#150a14', alpha: 0.9, taper: [0.9, 0.9] });
            S.ink(g, F.pts(hair), { w: 0.6, color: '#6a4a3a', alpha: 0.95, taper: [0.9, 0.9] });
            S.ink(g, F.pts(hair.slice(20, 44)).map((p) => add(p, TOL, 0.25)), { w: 0.3, color: '#e6c8a0', alpha: 0.7, taper: [0.8, 0.8] });
        }
        g.restore();
    }

    // ------------------------------------------------------------------ biznaga
    // Local coordinates: the ball of flowers is centred on (0, -80), the stalk runs down to
    // (5, 150). Every flower sits on the tip of a spike of the thistle, facing outwards: the
    // ones in the middle are seen from the front, the ones on the edge from the side or from
    // behind, with their tube and calyx.
    const JAS = { lit: '#fffdf2', mid: '#dcd8ea', shade: '#9d97c0', deep: '#6c648f', tube: '#d49aa8', tubeDeep: '#8a4a66', calyx: '#5f8a4a', straw: '#d9c58e', strawDeep: '#7a6234' };
    const BIZ = { C: [0, -80], RF: 56, N: 132 };
    const L3 = (() => {
        const l = Math.hypot(...S.LIGHT);
        return S.LIGHT.map((v) => v / l);
    })();
    const white = (t) => (t < 0.5 ? S.mix(JAS.shade, JAS.mid, t * 2) : S.mix(JAS.mid, JAS.lit, t * 2 - 2 * 0.5));

    // One jasmine: n = where it faces (z towards the eye, in the bouquet's own frame).
    function jasmine(g, F, c, n, seed, o = {}) {
        const r = Motion.rng('jasmine' + seed);
        const rho = Math.hypot(n[0], n[1]), rad = rho > 1e-3 ? [n[0] / rho, n[1] / rho] : [0, -1];
        const e1 = [-rad[1], rad[0], 0], e2 = [-n[2] * rad[0], -n[2] * rad[1], rho]; // the flower's own plane
        const P = r() < 0.72 ? 5 : 6, Lp = (o.len ?? 13.2) * (0.86 + r() * 0.3), W = 6.5 + r() * 1.3, a0 = r() * TAU, twist = 0.28 + r() * 0.2, cup = -2.2 + r() * 5;
        const at = (rr, a, off, lift) => {
            const u = rr * Math.cos(a) - off * Math.sin(a), v = rr * Math.sin(a) + off * Math.cos(a);
            return F([c[0] + u * e1[0] + v * e2[0] + lift * n[0], c[1] + u * e1[1] + v * e2[1] + lift * n[1]]);
        };
        // how the lamp finds it: the whole head is a ball under the lamp
        const nr = rotP([n[0], n[1]], F.rot), lam = Math.max(0, nr[0] * L3[0] + nr[1] * L3[1] + n[2] * L3[2]);
        const tone = S.clamp(0.3 + 0.86 * lam + (r() - 0.5) * 0.12 - (o.sink ?? 0)), back = n[2] < 0;
        const petals = [];
        for (let k = 0; k < P; k++) {
            const a = a0 + (k / P) * TAU + (r() - 0.5) * 0.16, len = Lp * (0.9 + r() * 0.2), up = [], dn = [], mid = [], m = 9;
            for (let i = 0; i <= m; i++) {
                const u = i / m, hw = (W / 2) * Math.pow(Math.sin(Math.PI * Math.pow(u, 0.82)), 0.66) * (1 - 0.06 * u), rr = 1.3 + u * len, lift = cup * u * u, sk = twist * hw * Math.sin(Math.PI * u);
                up.push(at(rr, a, -hw * 1.12 + sk, lift));
                dn.push(at(rr, a, hw * 0.88 + sk, lift));
                mid.push(at(rr, a, sk * 1.5, lift));
            }
            // its own facing: a petal that leans to the lamp is lighter
            const d = rotP([Math.cos(a) * e1[0] + Math.sin(a) * e2[0], Math.cos(a) * e1[1] + Math.sin(a) * e2[1]], F.rot);
            petals.push({ pts: [...up, ...dn.slice(0, -1).reverse()], up, dn, mid, t: S.clamp(tone + 0.16 * (d[0] * L3[0] + d[1] * L3[1]) * (back ? -1 : 1)), brown: r() < (o.wilt ? 0.7 : 0.05), a });
        }
        const tubeLen = 15 * rho, tb = F([c[0] - rad[0] * tubeLen, c[1] - rad[1] * tubeLen]), tc = F(c);
        const tube = () => {
            if (tubeLen < 2.5) return;
            const nn = [-(tc[1] - tb[1]), tc[0] - tb[0]], l = Math.hypot(nn[0], nn[1]) || 1, w0 = 1.1 * F.s, w1 = 1.5 * F.s;
            const poly = [[tb[0] + (nn[0] / l) * w0, tb[1] + (nn[1] / l) * w0], [tc[0] + (nn[0] / l) * w1, tc[1] + (nn[1] / l) * w1], [tc[0] - (nn[0] / l) * w1, tc[1] - (nn[1] / l) * w1], [tb[0] - (nn[0] / l) * w0, tb[1] - (nn[1] / l) * w0]];
            strokePts(g, poly, 1.3 * F.s, INK, true);
            const gr = g.createLinearGradient(tb[0], tb[1], tc[0], tc[1]);
            gr.addColorStop(0, S.mix(JAS.tubeDeep, JAS.tube, tone));
            gr.addColorStop(1, S.mix(JAS.tube, '#f6e2e0', tone));
            fillPts(g, poly, gr);
            S.ink(g, [lerpP(tb, tc, 0.1), lerpP(tb, tc, 0.9)].map((p) => add(p, TOL, 0.4 * F.s)), { w: 0.5 * F.s, color: '#fff4f0', alpha: 0.5 + 0.4 * tone });
            // the calyx: a green cup with thread teeth
            const cx = lerpP(tb, tc, 0.08);
            for (const k of [-1, 0, 1]) S.ink(g, [cx, add(lerpP(tb, tc, 0.42), [nn[0] / l, nn[1] / l], k * 2.1 * F.s)], { w: 0.55 * F.s, color: S.mix('#2c4a2a', JAS.calyx, tone), alpha: 0.95, taper: [0, 0.8] });
            disc(g, cx, 1.9 * F.s, INK);
            disc(g, cx, 1.35 * F.s, S.mix('#2f5230', '#7aa658', tone));
        };
        // the shadow it throws on the flowers under it
        S.cast(g, (q) => {
            for (const p of petals) fillPts(q, p.pts, '#000');
        }, { blur: 2.6 * F.s, dx: 1.5 * F.s, dy: 2.2 * F.s, color: 'rgba(40,30,80,0.5)' });
        if (!back) tube();
        // one contour for the whole flower, heavier towards the shadow
        g.save();
        g.translate(SD[0] * 0.55 * F.s, SD[1] * 0.55 * F.s);
        for (const p of petals) strokePts(g, p.pts, 1.2 * F.s, INK, true);
        g.restore();
        for (const p of petals) strokePts(g, p.pts, 1.1 * F.s, INK, true);
        for (const p of petals) {
            const base = p.mid[0], tip = p.mid[p.mid.length - 1], gr = g.createLinearGradient(base[0], base[1], tip[0], tip[1]);
            const cLit = white(p.t), cSh = white(Math.max(0, p.t - 0.34));
            gr.addColorStop(0, back ? S.mix(cSh, JAS.tube, 0.4) : S.mix(cSh, JAS.deep, 0.35));
            gr.addColorStop(0.26, S.mix(cSh, cLit, 0.6));
            gr.addColorStop(0.62, cLit);
            if (p.brown) gr.addColorStop(0.8, S.mix(cLit, '#c9a26a', 0.5));
            gr.addColorStop(1, p.brown ? S.mix(cLit, '#9a6a3a', 0.85) : S.mix(cLit, JAS.lit, 0.4));
            g.save();
            g.beginPath();
            S.trace(g, p.pts);
            g.fillStyle = gr;
            g.fill();
            g.clip();
            // which margin faces the lamp: light along it, shade along the other
            const mU = lerpP(p.up[5], p.mid[5], 0), mD = p.dn[5], litUp = dot2([mU[0] - mD[0], mU[1] - mD[1]], TOL) > 0;
            const le = litUp ? p.up : p.dn, se = litUp ? p.dn : p.up;
            S.ink(g, se.slice(1).map((q, i) => lerpP(q, p.mid[i + 1], 0.16)), { w: 1.9 * F.s, color: white(Math.max(0, p.t - 0.45)), alpha: 0.75, taper: [0.3, 0.8] });
            S.ink(g, le.slice(2, -1).map((q, i) => lerpP(q, p.mid[i + 2], 0.24)), { w: 1.2 * F.s, color: '#fffef6', alpha: 0.3 + 0.65 * p.t, taper: [0.6, 0.6] });
            // fine veins either side of the crease
            for (const kk of [0.42, 0.62]) S.ink(g, [lerpP(p.mid[2], p.up[2], kk * 0.5), lerpP(p.mid[5], p.up[5], kk), lerpP(p.mid[8], p.up[8], kk * 0.7)], { w: 0.35 * F.s, color: JAS.deep, alpha: 0.28 });
            for (const kk of [0.42, 0.62]) S.ink(g, [lerpP(p.mid[2], p.dn[2], kk * 0.5), lerpP(p.mid[5], p.dn[5], kk), lerpP(p.mid[8], p.dn[8], kk * 0.7)], { w: 0.35 * F.s, color: JAS.deep, alpha: 0.28 });
            // the crease down its middle
            S.ink(g, p.mid.slice(0, -1), { w: 0.6 * F.s, color: back ? JAS.tube : JAS.deep, alpha: 0.55, taper: [0, 0.9] });
            g.restore();
            strokePts(g, p.pts, 0.55 * F.s, S.rgba(JAS.deep, 0.75), true);
        }
        if (back) tube();
        else {
            // the throat: a small yellow-green star where the petals meet, a dark eye, an anther
            const tcx = at(0.2, 0, 0, 0), sq = Math.max(0.4, Math.abs(n[2])), ta = Math.atan2(rad[1], rad[0]) + Math.PI / 2 + F.rot;
            for (const p of petals) S.ink(g, [tcx, lerpP(tcx, p.mid[3], 0.9)], { w: 1.5 * F.s, color: S.mix('#8a9a3a', '#dfe07a', tone), alpha: 0.85, taper: [0, 1] });
            oval(g, tcx, 1.75 * F.s, 1.75 * F.s * sq, ta, S.rgba(JAS.deep, 0.75));
            oval(g, tcx, 1.25 * F.s, 1.25 * F.s * sq, ta, S.mix('#8a9a3a', '#e4e27c', tone));
            disc(g, tcx, 0.5 * F.s, '#34361e');
            disc(g, add(tcx, TOL, 0.6 * F.s), 0.36 * F.s, '#fff7b0');
        }
    }

    // A bud: a spindle on its tube, flushed pink towards the tip, twisted shut.
    function jasmineBud(g, F, c, n, seed) {
        const r = Motion.rng('bud' + seed), rho = Math.max(0.35, Math.hypot(n[0], n[1])), rad = [n[0] / (Math.hypot(n[0], n[1]) || 1), n[1] / (Math.hypot(n[0], n[1]) || 1)];
        const len = (17 + r() * 6) * rho, w = 4.4 + r(), base = [c[0] - rad[0] * 7 * rho, c[1] - rad[1] * 7 * rho], bend = (r() - 0.5) * 5, nn = [-rad[1], rad[0]];
        const up = [], dn = [], mid = [];
        for (let i = 0; i <= 10; i++) {
            const u = i / 10, hw = 0.9 + (w / 2 - 0.9) * Math.pow(Math.sin(Math.PI * Math.pow(u, 1.5)), 0.9) * (u < 1 ? 1 : 0), p = add(add(base, rad, u * len), nn, bend * u * u);
            up.push(F(add(p, nn, hw)));
            dn.push(F(add(p, nn, -hw)));
            mid.push(F(p));
        }
        const nr = rotP([n[0], n[1]], F.rot), tone = S.clamp(0.15 + 0.9 * Math.max(0, nr[0] * L3[0] + nr[1] * L3[1] + n[2] * L3[2]));
        const pts = [...up, ...dn.slice(0, -1).reverse()];
        const gr = { from: mid[0], to: mid[10], stops: [[0, S.mix(JAS.tubeDeep, JAS.tube, tone)], [0.4, S.mix(white(tone), JAS.tube, 0.35)], [0.8, white(tone)], [1, S.mix(white(tone), '#e58a9c', 0.6)]] };
        S.piece(g, pts, {
            fill: gr, line: 1.3 * F.s, heavy: 0.6, cast: { blur: 2.4 * F.s, dx: 1.3 * F.s, dy: 2 * F.s, color: 'rgba(40,30,80,0.5)' },
            detail: (q) => {
                const litUp = dot2(F.dir(nn), TOL) > 0, le = litUp ? up : dn, se = litUp ? dn : up;
                S.ink(q, se.slice(2).map((p, i) => lerpP(p, mid[i + 2], 0.2)), { w: 1.6 * F.s, color: S.mix(JAS.deep, JAS.tubeDeep, 0.4), alpha: 0.6, taper: [0.5, 0.5] });
                S.ink(q, le.slice(3, -1).map((p, i) => lerpP(p, mid[i + 3], 0.3)), { w: 0.9 * F.s, color: '#ffffff', alpha: 0.3 + 0.6 * tone, taper: [0.5, 0.5] });
                // the petals wound round each other
                for (const k of [0.45, 0.68]) S.ink(q, [lerpP(up[4], dn[4], k - 0.3), lerpP(up[7], dn[7], k), lerpP(up[9], dn[9], k + 0.2)], { w: 0.5 * F.s, color: JAS.tubeDeep, alpha: 0.6, taper: [0.3, 0.6] });
            },
        });
        const cx = lerpP(mid[0], mid[1], 0.3);
        for (const k of [-1, 1]) S.ink(g, [cx, add(mid[3], F.dir(nn), k * 1.9 * F.s)], { w: 0.55 * F.s, color: S.mix('#2c4a2a', JAS.calyx, tone), taper: [0, 0.8] });
        disc(g, cx, 1.8 * F.s, INK);
        disc(g, cx, 1.25 * F.s, S.mix('#2f5230', '#7aa658', tone));
    }

    function biznaga(g0, o = {}) {
        let g = g0;
        const { x = 0, y = 0, s = 1, seed = 'biznaga' } = o, rot = snap(o.rot ?? 0);
        g.save();
        g.translate(x, y);
        g.scale(s, s);
        // (on a sheet of its own: every flower casts on the ones under it, and the ball's
        // light is sprayed over all of them: neither may touch the bouquet's neighbours)
        // (the sheet is laid on whole device pixels, so pasting it costs no sharpness)
        const G0 = g, ext = 190, m0 = g.getTransform(), k0 = S.pxScale(g), plain = Math.abs(m0.b) < 1e-6 && Math.abs(m0.c) < 1e-6;
        const ox = plain ? Math.floor(m0.e - ext * k0) : 0, oy = plain ? Math.floor(m0.f - ext * k0) : 0;
        const sh0 = sheet({ x: -ext, y: -ext, w: ext * 2 + 2 / k0, h: ext * 2 + 2 / k0 }, k0);
        if (plain) sh0.g.setTransform(k0, 0, 0, k0, m0.e - ox, m0.f - oy);
        const paste = (q) => {
            if (plain) q.drawImage(sh0.canvas, (ox - m0.e) / k0, (oy - m0.f) / k0, sh0.canvas.width / k0, sh0.canvas.height / k0);
            else q.drawImage(sh0.canvas, -ext, -ext, sh0.canvas.width / k0, sh0.canvas.height / k0);
        };
        g = sh0.g;
        const F = frame(0, 0, rot).sub(0, -5), r = Motion.rng('biznaga' + seed), C = BIZ.C, RF = BIZ.RF;
        const drop = null;
        const cs = { blur: 2.6, dx: 1.4, dy: 2.2, color: 'rgba(14,20,24,0.6)' };

        // the stalk: straw, wound in green florist's tape from under the head almost to its end
        const stalk = S.curve([[0, -30], [1.5, 20], [4.5, 80], [3.5, 124], [5, 150]], false, 12);
        const TAPE = { base: '#3d7d4c', deep: '#143a2c', light: '#8fd08a', glint: '#e0f6c8' };
        {
            const st = walk(stalk, 1), end = st.length - 1, bare = end - 13, w = 7.4;
            const sidePts = (i0, i1, k) => st.slice(i0, i1 + 1).map((q) => add(q.p, q.n, k));
            // the bare straw at its foot, cut on the slant
            const strawP = F.pts([...sidePts(bare - 2, end, w * 0.42), add(st[end].p, [0.6, 1.6]), ...sidePts(bare - 2, end - 2, -w * 0.42).reverse()]);
            S.piece(g, strawP, {
                fill: JAS.straw, line: 1.3, heavy: 0.5, cast: drop, shade: { color: JAS.strawDeep, alpha: 0.85, w: 3.4 }, light: { color: '#fff3c8', alpha: 0.8, w: 2 },
                detail: (q) => {
                    for (const k of [-1.6, -0.4, 0.9, 1.9]) S.ink(q, F.pts(sidePts(bare, end, k)), { w: 0.45, color: JAS.strawDeep, alpha: 0.6, taper: [0, 0.3] });
                    oval(q, F(add(st[end].p, [0.2, -0.4])), 1.5, 0.8, F.rot, '#4a3820');
                },
            });
            const tapeP = F.pts([...sidePts(0, bare, w / 2), ...sidePts(0, bare, -w / 2).reverse()]);
            S.piece(g, tapeP, {
                fill: TAPE.base, line: 1.5, heavy: 0.55, cast: drop,
                shade: [{ color: TAPE.deep, alpha: 0.9, w: 4.2 }, { color: '#0a2420', alpha: 0.5, w: 1.6 }], light: { color: TAPE.light, alpha: 0.7, w: 2.6 },
                detail: (q) => {
                    // every turn of the tape laps the one before: a dark seam, a light lip under it
                    for (let i = 6; i < bare; i += 8 + Math.floor(r() * 3)) {
                        const a = add(st[i].p, st[i].n, w * 0.6), b = add(st[Math.min(bare, i + 5)].p, st[Math.min(bare, i + 5)].n, -w * 0.6);
                        S.ink(q, F.pts([a, b]), { w: 0.9, color: TAPE.deep, alpha: 0.85, taper: [0, 0] });
                        S.ink(q, F.pts([add(a, [0, 1.1]), add(b, [0, 1.1])]), { w: 0.55, color: TAPE.light, alpha: 0.6, taper: [0, 0] });
                        if (r() < 0.4) S.ink(q, F.pts([add(a, [0, 3]), add(lerpP(a, b, 0.6), [0, 3.6])]), { w: 0.4, color: TAPE.deep, alpha: 0.4 });
                    }
                    // the waxed tape shines: a streak and a dash
                    const side = dot2(F.dir([-1, 0]), TOL) >= 0 ? -1 : 1;
                    S.ink(q, F.pts(sidePts(18, 62, side * w * 0.2)), { w: 1.2, color: TAPE.glint, alpha: 0.8, taper: [0.6, 0.6] });
                    S.ink(q, F.pts(sidePts(70, 78, side * w * 0.2)), { w: 1.1, color: TAPE.glint, alpha: 0.7 });
                    S.ink(q, F.pts(sidePts(96, 132, side * w * 0.22)), { w: 0.9, color: TAPE.glint, alpha: 0.55, taper: [0.6, 0.6] });
                },
            });
            // the tape's end, come unstuck
            const e = st[bare], flap = F.pts([add(e.p, e.n, -w / 2), add(e.p, e.n, w / 2), add(add(e.p, e.n, w * 0.95), e.t, 6.5), add(add(e.p, e.n, w * 0.2), e.t, 4)]);
            S.piece(g, flap, { fill: '#5a9a5c', line: 1.3, cast: cs, shade: { color: TAPE.deep, alpha: 0.8, w: 2.6 }, light: { color: TAPE.glint, alpha: 0.7, w: 1.6 } });
        }

        // the thistle's dry bracts, under the head
        {
            const Fb = F.sub(0.5, -31), list = [];
            for (let i = 0; i < 11; i++) list.push({ a: Math.PI * (0.06 + (0.88 * (i + r() * 0.5)) / 11), len: 17 + r() * 11, w: 5.4 + r() * 2, k: i });
            list.sort((p, q) => Math.abs(Math.cos(q.a)) - Math.abs(Math.cos(p.a)));
            for (const b of list) {
                const d = [Math.cos(b.a), Math.sin(b.a) * 0.8 + 0.25], nn = [-d[1], d[0]], curl = (r() - 0.5) * 6;
                const mid = [0, 0.35, 0.7, 1].map((u) => add(add([d[0] * 5, d[1] * 2], d, u * b.len), nn, curl * u * u));
                const pts = Fb.pts(S.curve([mid[0], add(mid[1], nn, b.w * 0.5), add(mid[2], nn, b.w * 0.32), mid[3], add(mid[2], nn, -b.w * 0.32), add(mid[1], nn, -b.w * 0.5)], true, 5));
                S.piece(g, pts, {
                    fill: b.k % 3 ? '#c9b077' : '#b09a66', line: 1.3, cast: cs, shade: { color: '#5e4a26', alpha: 0.85, w: 3.6 }, light: { color: '#f6e8b8', alpha: 0.75, w: 2.2 },
                    detail: (q) => {
                        S.ink(q, Fb.pts(mid), { w: 0.7, color: '#5e4a26', alpha: 0.8, taper: [0, 0.8] });
                        for (const k of [0.3, 0.5, 0.7]) S.ink(q, Fb.pts([lerpP(mid[0], mid[3], k), add(lerpP(mid[0], mid[3], k + 0.16), nn, b.w * 0.3)]), { w: 0.4, color: '#5e4a26', alpha: 0.5 });
                    },
                });
                // the bract ends in a spine
                S.ink(g, Fb.pts([mid[3], add(mid[3], d, 4)]), { w: 1, color: INK, taper: [0, 1] });
            }
        }

        // the head itself: dark between the spikes, every spike a straw line
        {
            const core = F.pts(S.ellipse(C[0], C[1], 49, 49, 48));
            S.piece(g, core, {
                fill: '#241c16', line: 1.6, cast: drop, shade: { color: '#0c0810', alpha: 0.8, w: 16 }, light: { color: '#6a5632', alpha: 0.55, w: 12 },
                detail: (q) => {
                    for (let i = 0; i < 150; i++) {
                        const a = r() * TAU, r0 = 4 + r() * 30, r1 = r0 + 8 + r() * 16;
                        S.ink(q, F.pts([pol(r0, a, ...C), pol(r1, a + (r() - 0.5) * 0.1, ...C)]), { w: 0.6 + r() * 0.6, color: r() < 0.7 ? '#bfa468' : '#6e5a34', alpha: 0.35 + r() * 0.45, taper: [0.2, 0.7] });
                    }
                },
            });
        }

        // where every flower sits: the tips of the spikes, spread evenly over the ball
        const spots = [];
        for (let i = 0; i < BIZ.N; i++) {
            const zz = 1 - (2 * (i + 0.5)) / BIZ.N, ph = i * 2.39996323 + 0.7, rr = Math.sqrt(1 - zz * zz);
            let n = [Math.cos(ph) * rr + (r() - 0.5) * 0.1, zz + (r() - 0.5) * 0.1, Math.sin(ph) * rr + (r() - 0.5) * 0.1];
            const l = Math.hypot(...n);
            n = n.map((v) => v / l);
            if (n[2] < -0.3) continue;
            if (n[1] > 0.8 && Math.abs(n[0]) < 0.3) continue; // the stalk comes in there
            spots.push({ n, id: i, k: r() });
        }
        spots.sort((a, b) => a.n[2] - b.n[2]);
        let bare = -1;
        const fronts = [];
        spots.forEach((sp, i) => {
            if (bare < 0 && sp.n[2] > 0.25 && sp.n[2] < 0.6 && sp.n[0] > 0.3 && sp.n[1] < 0) bare = i;
        });
        spots.forEach((sp, i) => {
            const n = sp.n, rho = Math.hypot(n[0], n[1]), out = [n[0], n[1]];
            const tip = add(C, out, RF), root = add(C, out, 34);
            // its spike
            if (rho > 0.25) {
                S.ink(g, F.pts([root, add(C, out, RF - 12)]), { w: 1.7, color: INK, taper: [0, 0.3] });
                S.ink(g, F.pts([root, add(C, out, RF - 12)]), { w: 0.9, color: S.mix(JAS.strawDeep, JAS.straw, S.clamp(0.4 - n[0] * 0.4 - n[1] * 0.4)), taper: [0, 0.3] });
            }
            if (i === bare) {
                // the flower fell from this one: a bare spike, a shred of calyx still on it
                const end = add(C, out, RF + 5);
                S.ink(g, F.pts([root, end]), { w: 2.1, color: INK, taper: [0, 0.7] });
                S.ink(g, F.pts([root, end]), { w: 1.1, color: JAS.straw, taper: [0, 0.7] });
                disc(g, F(add(C, out, RF - 3)), 1.3, '#6a8a4a');
                return;
            }
            const budLike = sp.k < 0.27 && n[2] < 0.7 && rho > 0.5;
            if (budLike) jasmineBud(g, F, add(tip, out, -2), n, seed + sp.id);
            else jasmine(g, F, add(tip, out, (sp.k - 0.5) * 5), n, seed + sp.id, { len: 12.4 + sp.k * 2.2, sink: n[2] < 0 ? 0.12 : 0, wilt: sp.id % 23 === 7 });
            if (n[2] > 0.5) fronts.push(add(tip, out, (sp.k - 0.5) * 5));
        });
        // the head as one ball under the lamp: a violet shade sprayed over its far side, a
        // warm light over the near one (on the flowers only)
        {
            const cc = F(C), a = add(cc, SD, 50), b = add(cc, TOL, 44);
            g.save();
            g.globalCompositeOperation = 'source-atop';
            g.beginPath();
            g.arc(cc[0], cc[1], 84, 0, TAU);
            g.clip();
            const gs = g.createRadialGradient(a[0], a[1], 6, a[0], a[1], 74);
            gs.addColorStop(0, 'rgba(70,58,140,0.5)');
            gs.addColorStop(0.6, 'rgba(70,58,140,0.2)');
            gs.addColorStop(1, 'rgba(70,58,140,0)');
            g.fillStyle = gs;
            g.fillRect(cc[0] - 90, cc[1] - 90, 180, 180);
            const gl = g.createRadialGradient(b[0], b[1], 4, b[0], b[1], 62);
            gl.addColorStop(0, 'rgba(255,250,224,0.42)');
            gl.addColorStop(1, 'rgba(255,250,224,0)');
            g.fillStyle = gl;
            g.fillRect(cc[0] - 90, cc[1] - 90, 180, 180);
            g.restore();
        }

        // dew on a few petals, and a ladybird that has climbed up to the light
        {
            const rd = Motion.rng('dew' + seed);
            for (let i = 0; i < 7 && fronts.length; i++) {
                const c = fronts[Math.floor(rd() * fronts.length)], a = rd() * TAU, p = F(add(c, [Math.cos(a) * (5 + rd() * 5), Math.sin(a) * (5 + rd() * 5)])), rr = 0.9 + rd() * 0.9;
                oval(g, add(p, SD, rr * 0.5), rr * 1.05, rr * 1.05, 0, 'rgba(70,60,130,0.45)');
                const gr = g.createRadialGradient(p[0] + SD[0] * rr * 0.4, p[1] + SD[1] * rr * 0.4, rr * 0.1, p[0], p[1], rr * 1.1);
                gr.addColorStop(0, 'rgba(255,255,250,0.95)');
                gr.addColorStop(0.6, 'rgba(196,192,226,0.9)');
                gr.addColorStop(1, 'rgba(120,112,170,0.95)');
                disc(g, p, rr, gr);
                disc(g, add(p, TOL, rr * 0.4), Math.max(0.3, rr * 0.28), '#ffffff');
            }
            if (fronts.length > 3) {
                const c = fronts.reduce((b, q) => (q[0] - q[1] * 0.4 < b[0] - b[1] * 0.4 ? q : b)), Fl = F.sub(c[0] + 5.5, c[1] + 4, 0.9);
                S.cast(g, (q) => fillPts(q, Fl.pts(S.ellipse(0, 0, 2.6, 3.2, 14)), '#000'), { blur: 1.6, dx: 1, dy: 1.5, color: 'rgba(40,30,80,0.6)' });
                for (const mx of [-1, 1]) for (const yy of [-1.6, 0, 1.6]) S.ink(g, Fl.pts([[mx * 1.6, yy], [mx * 3.4, yy + (yy < 0 ? -1 : 0.8)]]), { w: 0.4, color: '#15101c' });
                S.piece(g, Fl.pts(S.ellipse(0, 0.3, 2.5, 3, 16)), {
                    fill: '#cf3a3c', line: 0.8, heavy: 0.5, shade: { color: '#7a1428', alpha: 0.8, w: 2 }, light: { color: '#f39a8c', alpha: 0.7, w: 1.4 },
                    detail: (q) => {
                        S.ink(q, Fl.pts([[0, -2.6], [0, 3.2]]), { w: 0.35, color: '#3a0a1c', taper: [0, 0] });
                        for (const [dx, dy, rr] of [[-1.2, -0.6, 0.55], [1.2, -0.5, 0.55], [-1, 1.5, 0.45], [1.1, 1.6, 0.45], [0, 0.5, 0.4]]) disc(q, Fl([dx, dy]), rr * Fl.s, '#1a1020');
                    },
                });
                fillPts(g, Fl.pts(S.ellipse(0, -2.9, 1.6, 1.1, 10)), '#1a1020');
                for (const mx of [-1, 1]) disc(g, Fl([mx * 0.8, -3]), 0.35, '#f4efe4');
                disc(g, add(Fl([-0.6, -0.4]), TOL, 0.5), 0.45, 'rgba(255,240,236,0.9)');
            }
        }

        // the ribbon tied under the head: a bow, a knot, two tails cut in a swallow's tail
        {
            const RIB = { base: '#e0687a', deep: '#84264a', light: '#ffc0bc', back: '#b8405e', glint: '#fff0ea' };
            const Fr = F.sub(1.2, -9);
            const tail = (pts, w, seedK) => {
                const cl = S.curve(pts, false, 10), st = walk(cl, 1), n = st.length, L = [], R = [];
                st.forEach((q, i) => {
                    const u = i / (n - 1), hw = (w / 2) * (0.75 + 0.25 * Math.cos(u * 5 + seedK));
                    L.push(add(q.p, q.n, hw));
                    R.push(add(q.p, q.n, -hw));
                });
                const e = st[n - 1], notch = add(e.p, e.t, -w * 0.62);
                const poly = Fr.pts([...L, add(L[n - 1], e.t, w * 0.3), notch, add(R[n - 1], e.t, w * 0.1), ...R.reverse()]);
                S.piece(g, poly, {
                    fill: RIB.base, line: 1.25, heavy: 0.5, cast: cs, shade: { color: RIB.deep, alpha: 0.85, w: w * 0.55 }, light: { color: RIB.light, alpha: 0.75, w: w * 0.4 },
                    detail: (q) => {
                        // satin: the sheen lies in bands across the ribbon wherever it bends to the lamp
                        for (let i = 4; i < n - 3; i += 1) {
                            const lit = dot2(Fr.dir(st[i].n), TOL), k = Math.pow(Math.abs(lit), 3) * (0.3 + 0.5 * Math.abs(Math.sin(i * 0.31 + seedK)));
                            if (k > 0.1) S.ink(q, Fr.pts([add(st[i].p, st[i].n, -w * 0.34), add(st[i].p, st[i].n, w * 0.34)]), { w: 1.2, color: RIB.glint, alpha: k * 0.5, taper: [0.6, 0.6] });
                        }
                        for (const k of [-0.36, 0.36]) S.ink(q, Fr.pts(st.map((m) => add(m.p, m.n, w * k))), { w: 0.45, color: RIB.deep, alpha: 0.55, taper: [0, 0] });
                    },
                });
                return { e, poly };
            };
            const tA = tail([[-1.5, 2], [-7, 16], [-15, 36], [-13, 58], [-21, 80]], 7.6, 0.4);
            tail([[1.5, 2], [8, 20], [19, 44], [15, 72], [24, 102]], 7.6, 2.1);
            // a thread has frayed from the shorter tail
            S.ink(g, Fr.pts(S.curve([add(tA.e.p, [1.5, 0]), add(tA.e.p, [3.5, 6]), add(tA.e.p, [1, 11]), add(tA.e.p, [4, 15])], false, 6)), { w: 0.6, color: RIB.light, alpha: 0.9, taper: [0, 0.7] });
            for (const mx of [-1, 1]) {
                const loop = Fr.pts(S.curve([[0, 0], [mx * 7, -7.5], [mx * 17, -8.5], [mx * 20.5, -1.5], [mx * 15, 4.6], [mx * 6, 3.2]], true, 6));
                S.piece(g, loop, {
                    fill: RIB.base, line: 1.4, heavy: 0.55, cast: cs, shade: { color: RIB.deep, alpha: 0.9, w: 5 }, light: { color: RIB.light, alpha: 0.8, w: 3.4 },
                    detail: (q) => {
                        // the inside of the loop, seen through it
                        fillPts(q, Fr.pts(S.curve([[mx * 5, 0.2], [mx * 9, -3.4], [mx * 15.4, -3.6], [mx * 16.4, -0.6], [mx * 11, 1.4]], true, 5)), RIB.back);
                        S.ink(q, Fr.pts(S.curve([[mx * 3, -2], [mx * 9, -6], [mx * 16, -6.4]], false, 5)), { w: 1, color: RIB.glint, alpha: 0.7, taper: [0.6, 0.6] });
                        for (const k of [0.3, 0.6]) S.ink(q, Fr.pts([[mx * 1.5, -1 + k * 3], [mx * 6.5, -3 + k * 7]]), { w: 0.5, color: RIB.deep, alpha: 0.7 });
                    },
                });
            }
            S.piece(g, Fr.pts(S.curve([[-3.4, -3], [3.2, -3.4], [3.8, 3.2], [-3.2, 3.6]], true, 5)), {
                fill: '#e8788a', line: 1.4, cast: { blur: 1.6, dx: 0.8, dy: 1.3, color: 'rgba(70,14,40,0.6)' }, shade: { color: RIB.deep, alpha: 0.85, w: 3 }, light: { color: RIB.glint, alpha: 0.8, w: 2 },
                detail: (q) => {
                    for (const k of [-1.2, 0.9]) S.ink(q, Fr.pts([[-3.4, k - 0.6], [0, k], [3.6, k - 0.4]]), { w: 0.5, color: RIB.deep, alpha: 0.7, taper: [0, 0] });
                },
            });
        }
        // one flower has slipped off its spike and hangs caught in the bow
        jasmine(g, F, [11.5, 2.5], [0.52, 0.62, 0.59], seed + 'fallen', { len: 11.5, sink: 0.12 });
        g = G0;
        S.cast(g, paste, { blur: 8, dx: 4, dy: 5.5, color: 'rgba(12,7,26,0.6)' });
        paste(g);
        g.restore();
    }

    // ------------------------------------------------------------------ farolillos
    // A lantern in its own frame: the top wire ring is centred on (0, 0), the paper hangs
    // below it. They hang overhead, so they are seen a little from below: every ring opens
    // into an ellipse whose near edge is the upper one, and the mouth shows the lit inside.
    const TISSUE = {
        red: { base: '#cf3a3c', deep: '#6a1228', light: '#f39a8c', glow: '#ffae5c', ink: '#3a0a1c' },
        green: { base: '#2c8a58', deep: '#0b3a2f', light: '#8fd08a', glow: '#e0f080', ink: '#082a22' },
        white: { base: '#ebe4d2', deep: '#8a84a8', light: '#fffaf0', glow: '#ffe7a4', ink: '#3c3660' },
        gold: { base: '#e0ac42', deep: '#8a5a17', light: '#f6dc8a', glow: '#fff0a0', ink: '#4a2a10' },
    };
    const KE = 0.17;

    function lantern(g, F, o) {
        const r = Motion.rng('lantern' + o.seed), C = TISSUE[o.col], CB = TISSUE[o.band], M = o.M;
        const sphere = o.kind !== 'cyl', R = o.R, tall = o.tall ?? 1;
        const side = dot2(F.dir([-1, 0]), TOL) >= 0 ? 1 : -1; // +1: the lamp of the night is on its own left
        // the rings the paper is folded on, from the top wire to the bottom one
        const rings = [], pt = 1.24, pb = -1.2;
        for (let k = 0; k <= M; k++) {
            const u = S.clamp(k / M + (k && k < M ? ((r() - 0.5) * 0.3 + (k % 2 === (sphere ? 1 : 0) ? 0.2 : 0)) / M : 0)), zig = k === 0 || k === M ? 1 : k % 2 ? 0.948 + (r() - 0.5) * 0.02 : 1.035 + (r() - 0.5) * 0.02;
            if (sphere) {
                const ph = pt + (pb - pt) * u;
                rings.push({ r: R * Math.cos(ph) * zig, y: (R * Math.sin(pt) - R * Math.sin(ph)) * tall, sn: Math.sin(ph) });
            } else {
                rings.push({ r: R * zig * (1 + 0.035 * Math.sin(Math.PI * u)), y: o.H * (0.04 + 0.92 * u), sn: 0.5 - u });
            }
        }
        if (!sphere) {
            rings.unshift({ r: R * 0.98, y: 0, sn: 0.6 });
            rings.push({ r: R * 0.98, y: o.H, sn: -0.6 });
        }
        const NR = rings.length - 1, H = rings[NR].y;
        // crushed: a dent pushed into one flank; the folds there are kinked
        const dent = (k, th) => (o.crush ? o.crush * Math.exp(-Math.pow((th - o.crushA) / 0.55, 2)) * Math.exp(-Math.pow((k - NR * 0.55) / (NR * 0.22), 2)) : 0);
        const P = (k, th, far = false) => {
            const q = rings[k], d = dent(k, th), rr = q.r * (1 - d);
            const wob = 0.5 * S.noise2(k * 1.7, th * 3, S.seedOf(o.seed)) + (o.crush ? 2.6 * d * S.noise2(k * 0.9, th * 9, 5) : 0);
            return [rr * Math.cos(th), q.y + (far ? 1 : -1) * KE * rr * Math.sin(th) + wob];
        };
        const arcK = (k, a0 = Math.PI, a1 = 0, n = 22, far = false) => {
            const out = [];
            for (let i = 0; i <= n; i++) out.push(P(k, a0 + ((a1 - a0) * i) / n, far));
            return out;
        };
        const outline = [...arcK(0), ...rings.slice(1, NR).map((_, i) => P(i + 1, 0)), ...arcK(NR, 0, Math.PI, 22, true), ...rings.slice(1, NR).map((_, i) => P(NR - 1 - i, Math.PI))];
        const outP = F.pts(outline), bulb = [0, H * 0.7];
        const paperOf = (k) => (o.bandK && k >= o.bandK[0] && k < o.bandK[1] ? CB : C);

        // the wire bail it hangs by, hooked over the cord
        const r0 = rings[0].r, bh = o.bail ?? 17;
        const wire = (pts, w = 0.85) => {
            strokePts(g, pts, w + 1.2, INK);
            strokePts(g, pts, w, '#8f9cc0');
            S.ink(g, pts.slice(1, -1).map((p) => add(p, TOL, 0.25)), { w: w * 0.45, color: '#eef2ff', alpha: 0.8, taper: [0.7, 0.7] });
        };
        for (const mx of [-1, 1]) wire(F.pts(S.curve([[mx * r0, 0.5], [mx * r0 * 1.02, -bh * 0.42], [mx * r0 * 0.5, -bh * 0.84], [mx * 0.6, -bh + 1.6]], false, 8)));
        wire(F.pts(S.curve([[-0.8, -bh + 2], [-1.6, -bh - 1], [0.8, -bh - 3.4], [2.6, -bh - 1], [1.2, -bh + 1.4]], false, 6)), 0.8);

        // the tuft of cut tissue under the mouth, the far strips first
        const tuft = (front) => {
            const n = 11, y0 = H + KE * rings[NR].r * 0.2;
            for (let i = 0; i < n; i++) {
                if ((i % 2 === 0) !== front) continue;
                const u = (i + 0.5) / n - 0.5, len = (o.tuft ?? 22) * (0.75 + r() * 0.45), a = u * 0.9 + (r() - 0.5) * 0.2, curl = (r() - 0.5) * 9;
                const mid = S.curve([[u * 5, y0], [u * 5 + Math.sin(a) * len * 0.5, y0 + len * 0.5], [u * 5 + Math.sin(a) * len + curl, y0 + len * Math.cos(a * 0.6)]], false, 6);
                const P2 = i % 3 === 1 ? CB : C, pts = F.pts(band(mid, (t) => 3.5 - t * 1.1 + 0.5 * Math.sin(t * 7 + i)));
                S.piece(g, pts, { fill: front ? P2.base : S.mix(P2.base, P2.deep, 0.5), line: 0.95, heavy: 0.5, shade: { color: P2.deep, alpha: 0.7, w: 1.6 }, light: { color: S.mix(P2.light, P2.glow, 0.5), alpha: front ? 0.75 : 0.3, w: 1 } });
            }
            if (front) {
                // bound with a turn of thread where it is tied to the bottom wire
                S.piece(g, F.pts(S.ellipse(0, y0 + 1.6, 3.4, 2, 14)), { fill: '#e8dcc0', line: 0.9, shade: { color: '#7a6a50', alpha: 0.8, w: 2 } });
            }
        };
        tuft(false);

        S.piece(g, outP, {
            fill: C.base, line: 2.2, heavy: 0.8, cast: { blur: 8, dx: 4, dy: 5.5, color: 'rgba(12,7,26,0.6)' },
            detail: (q) => {
                const kpx = S.pxScale(q);
                // the mouth: the lit inside, seen from below
                const mouth = F.pts([...arcK(NR), ...arcK(NR, 0, Math.PI, 22, true)]);
                // every pleat: a face turned up to the night's lamp or down to the bulb's
                for (let k = 0; k < NR; k++) {
                    const Pp = paperOf(k), up = k % 2 === (sphere ? 1 : 0), snm = (rings[k].sn + rings[k + 1].sn) / 2;
                    const v = S.clamp(0.5 + (up ? 0.27 : -0.25) + 0.24 * snm + (r() - 0.5) * 0.1);
                    const c = v > 0.5 ? S.mix(Pp.base, Pp.light, (v - 0.5) * 1.7) : S.mix(Pp.base, Pp.deep, (0.5 - v) * 1.7);
                    const poly = F.pts([...arcK(k), ...arcK(k + 1, 0, Math.PI)]);
                    const rr = Math.max(rings[k].r, rings[k + 1].r), ym = (rings[k].y + rings[k + 1].y) / 2;
                    const A = F([-side * rr, ym]), B = F([side * rr, ym]), gr = q.createLinearGradient(A[0], A[1], B[0], B[1]);
                    gr.addColorStop(0, S.mix(c, Pp.deep, 0.3));
                    gr.addColorStop(0.2, S.mix(c, Pp.light, 0.32));
                    gr.addColorStop(0.52, c);
                    gr.addColorStop(1, S.mix(c, Pp.deep, 0.68));
                    q.save();
                    q.beginPath();
                    S.trace(q, poly);
                    q.fillStyle = gr;
                    q.fill();
                    q.clip();
                    // under each ridge the paper is in the ridge's own shade; over each valley it catches light
                    q.save();
                    q.filter = `blur(${(0.7 * kpx).toFixed(1)}px)`;
                    S.ink(q, F.pts(arcK(k).map((p) => add(p, [0, 1.3]))), { w: 2.6, color: up ? Pp.light : Pp.ink, alpha: up ? 0.5 : 0.42, taper: [0.1, 0.1] });
                    S.ink(q, F.pts(arcK(k + 1).map((p) => add(p, [0, -1.1]))), { w: 1.8, color: up ? Pp.deep : Pp.light, alpha: up ? 0.3 : 0.28, taper: [0.1, 0.1] });
                    q.restore();
                    // lunares: white dots printed on the tissue, folded with it
                    if (o.dots && Pp === C) {
                        for (let d = 0; d < 9; d++) {
                            const th = 0.25 + ((d + (k >> 1) % 2 * 0.5) / 9) * 2.9;
                            if (((k >> 1) + d) % 2) continue;
                            const c0 = F(P(k + (k % 2 ? 0 : 1), th));
                            oval(q, c0, 4.3 * Math.max(0.3, Math.sin(th)) * F.s, 4.6 * F.s, F.rot, S.mix(up ? '#f6f0e2' : '#c9c2d6', Pp.glow, snm < 0 ? 0.3 : 0));
                        }
                    }
                    // tissue never lies smooth: little creases across the fold
                    for (let i = 0; i < 9; i++) {
                        const th = 0.15 + r() * 2.85, a = P(k, th), b = P(k + 1, th + (r() - 0.5) * 0.12);
                        S.ink(q, F.pts([lerpP(a, b, r() * 0.3), lerpP(a, b, 0.6 + r() * 0.4)]), { w: 0.5, color: r() < 0.5 ? Pp.light : Pp.ink, alpha: 0.2 + r() * 0.25 });
                    }
                    q.restore();
                }
                // the seam where the sheet is glued to itself: double paper, darker, down one flank
                {
                    const a = o.seamA ?? 0.62, strip = [];
                    for (let k = 0; k <= NR; k++) strip.push(P(k, a));
                    for (let k = NR; k >= 0; k--) strip.push(P(k, a + 0.13));
                    fillPts(q, F.pts(strip), S.rgba(C.ink, 0.28));
                    S.ink(q, F.pts(strip.slice(0, NR + 1)), { w: 0.6, color: C.ink, alpha: 0.6, taper: [0, 0] });
                }
                // the volume of the whole lantern over its pleats: the night on its crown and far flank
                S.spray(q, outP, { color: '#241238', alpha: 0.55, w: R * 0.55, push: R * 0.3, dir: F.dir([side * 0.75, -0.66]) });
                S.spray(q, outP, { color: '#241238', alpha: 0.45, w: R * 0.3, push: R * 0.12, dir: F.dir([side, 0]) });
                S.spray(q, outP, { color: C.light, alpha: 0.35, w: R * 0.3, push: R * 0.1, dir: F.dir([-side, -0.2]) });
                // it is lit: the bulb's warm light fills the lower half through the paper
                {
                    const bc = F(bulb), gl = q.createRadialGradient(bc[0], bc[1], R * 0.08 * F.s, bc[0], bc[1], R * 1.12 * F.s);
                    gl.addColorStop(0, S.rgba(C.glow, 1));
                    gl.addColorStop(0.35, S.rgba(C.glow, 0.72));
                    gl.addColorStop(0.7, S.rgba(C.glow, 0.26));
                    gl.addColorStop(1, S.rgba(C.glow, 0));
                    q.save();
                    q.globalCompositeOperation = 'screen';
                    q.fillStyle = gl;
                    q.fillRect(bc[0] - R * 2, bc[1] - R * 2, R * 4, R * 4);
                    // the faces turned down to it catch more of it
                    for (let k = 0; k < NR; k++) {
                        if (k % 2 === (sphere ? 1 : 0) || rings[k].y < H * 0.38) continue;
                        const kk = S.smooth(H * 0.35, H * 0.8, rings[k].y);
                        fillPts(q, F.pts([...arcK(k, 2.6, 0.54, 14), ...arcK(k + 1, 0.54, 2.6, 14)]), S.rgba(C.glow, 0.32 * kk));
                    }
                    q.restore();
                    // the bulb's own shape, blurred by the tissue
                    q.save();
                    q.filter = `blur(${(3.2 * kpx).toFixed(1)}px)`;
                    oval(q, bc, 6.5 * F.s, 8.5 * F.s, F.rot, 'rgba(255,250,214,0.75)');
                    q.restore();
                }
                // the folds: a crease in every valley, the paper's edge lit on every ridge
                for (let k = 1; k < NR; k++) {
                    const Pp = paperOf(Math.min(NR - 1, k)), valley = k % 2 === (sphere ? 1 : 0), line = F.pts(arcK(k, Math.PI - 0.03, 0.03));
                    if (valley) S.ink(q, line, { w: 1.05, color: Pp.ink, alpha: 0.85, taper: [0.2, 0.2] });
                    else {
                        S.ink(q, line.map((p) => add(p, F.dir([0, 1]), 0.7)), { w: 0.6, color: Pp.ink, alpha: 0.5, taper: [0.2, 0.2] });
                        const seg = side > 0 ? line.slice(2, 13) : line.slice(10, 21);
                        S.ink(q, seg, { w: 0.75, color: S.mix(Pp.light, '#ffffff', 0.5), alpha: 0.85, taper: [0.7, 0.7] });
                    }
                }
                if (o.crush) {
                    // creases running out of the dent
                    for (let i = 0; i < 6; i++) {
                        const k0 = Math.round(NR * 0.55), a = o.crushA + (r() - 0.5) * 0.3, c0 = P(k0, a), an = r() * TAU, l = 7 + r() * 9;
                        S.ink(q, F.pts([c0, add(c0, [Math.cos(an) * l * 0.5, Math.sin(an) * l * 0.5 + 1]), add(c0, [Math.cos(an) * l, Math.sin(an) * l])]), { w: 0.8, color: C.ink, alpha: 0.6, taper: [0, 0.9] });
                        S.ink(q, F.pts([add(c0, [0.8, 0.8]), add(c0, [Math.cos(an) * l + 0.8, Math.sin(an) * l + 0.8])]), { w: 0.5, color: C.light, alpha: 0.5, taper: [0, 0.9] });
                    }
                    S.spray(q, F.pts(S.ellipse(...P(Math.round(NR * 0.55), o.crushA), 9, 14, 16)), { color: C.ink, alpha: 0, w: 1 });
                }
                if (o.torn) {
                    // torn: the bulb seen through the hole, a flap of tissue hanging out of it
                    const k0 = Math.round(NR * 0.5), a = o.tornA ?? 2.05;
                    const hc0 = P(k0 + 1, a), hole = [];
                    for (let i = 0; i < 15; i++) {
                        const an = (i / 15) * TAU, rr = (i % 2 ? 0.6 : 1) * (6.6 + 4.4 * S.hashI(i, 3, 1, S.seedOf(o.seed)));
                        hole.push([hc0[0] + Math.cos(an) * rr * 1.05, hc0[1] + Math.sin(an) * rr * 1.6]);
                    }
                    const hp = F.pts(hole), hc = F(P(k0 + 1, a));
                    q.save();
                    q.beginPath();
                    S.trace(q, hp);
                    q.clip();
                    const hg = q.createRadialGradient(hc[0] + 3, hc[1] + 5, 1, hc[0], hc[1], 16 * F.s);
                    hg.addColorStop(0, '#fffbe0');
                    hg.addColorStop(0.3, S.mix(C.glow, '#ffffff', 0.3));
                    hg.addColorStop(1, S.mix(C.deep, C.glow, 0.25));
                    q.fillStyle = hg;
                    q.fill();
                    // the far wall's pleats, seen through it, and the bulb itself on its holder
                    for (let i = -4; i <= 4; i++) S.ink(q, [add(hc, [-14, i * 3.4 + 1]), add(hc, [0, i * 3.4 - 0.6]), add(hc, [14, i * 3.4 + 1])], { w: 0.6, color: C.deep, alpha: 0.4, taper: [0, 0] });
                    const bb = add(hc, [1.5 * F.s, 5 * F.s]);
                    oval(q, bb, 4.6 * F.s, 5.6 * F.s, F.rot, 'rgba(255,255,244,0.98)');
                    strokePts(q, S.ellipse(bb[0], bb[1], 4.6 * F.s, 5.6 * F.s, 18, F.rot), 0.5 * F.s, 'rgba(190,120,40,0.8)', true);
                    fillPts(q, [add(bb, [-2.4 * F.s, -5 * F.s]), add(bb, [2.4 * F.s, -5 * F.s]), add(bb, [2 * F.s, -10 * F.s]), add(bb, [-2 * F.s, -10 * F.s])], '#4a3a2a');
                    S.ink(q, [add(bb, [-1.4 * F.s, 1.5 * F.s]), add(bb, [-0.5 * F.s, -1.5 * F.s]), add(bb, [0.5 * F.s, 1 * F.s]), add(bb, [1.4 * F.s, -1.5 * F.s])], { w: 0.5 * F.s, color: '#e08a1a', taper: [0, 0] });
                    q.restore();
                    // the paper round the tear is scorched darker by contrast
                    q.save();
                    q.filter = `blur(${(1.2 * kpx).toFixed(1)}px)`;
                    strokePts(q, hp, 3, S.rgba(C.ink, 0.45), true);
                    q.restore();
                    strokePts(q, hp, 1.1, C.ink, true);
                    S.ink(q, hp.slice(8, 13).map((p) => add(p, SD, 0.7)), { w: 0.6, color: '#fff3d0', alpha: 0.8 });
                    // two tongues of tissue hang out of it, lit from behind
                    for (const [i0, i1, dx, dy] of [[3, 5, -3, 12], [6, 7, 2.4, 8.5]]) {
                        const f0 = hole[i0], f1 = hole[i1], ft = add(lerpP(f0, f1, 0.5), [dx, dy]);
                        S.piece(q, F.pts(S.curve([f0, lerpP(f0, ft, 0.5).map((v, i) => v + (i ? 0 : 1.8)), ft, lerpP(ft, f1, 0.5).map((v, i) => v - (i ? 0 : 1.4)), f1], false, 5)), {
                            fill: S.mix(C.light, C.glow, 0.5), line: 0.9, heavy: 0.5, cast: { blur: 1.6, dx: 0.8, dy: 1.2, color: S.rgba(C.ink, 0.6) }, shade: { color: C.base, alpha: 0.7, w: 2.6 }, light: { color: '#fff6dc', alpha: 0.7, w: 1.6 },
                            detail: (qq) => S.ink(qq, F.pts([lerpP(f0, f1, 0.5), ft]), { w: 0.45, color: C.ink, alpha: 0.5, taper: [0, 0.8] }),
                        });
                    }
                }
                // rain has spotted it: pale rings where the drops dried
                for (let i = 0; i < 5; i++) {
                    const p = F(P(1 + Math.floor(r() * (NR - 2)), 0.5 + r() * 2.2)), rr = 1.6 + r() * 2.2, blot = S.ellipse(p[0], p[1], rr * 0.8 * F.s, rr * F.s, 9, r() * 3).map(([px, py], k) => [px + Math.sin(k * 2.3 + i) * 0.4, py + Math.cos(k * 1.7 + i) * 0.4]);
                    fillPts(q, blot, S.rgba(C.ink, 0.07));
                    strokePts(q, S.curve(blot, true, 3), 0.4, S.rgba(C.ink, 0.2), true);
                }
                // the mouth: dark paper against the glare inside, the bottom wire across it
                {
                    const mc = F([0, H]), mg = q.createRadialGradient(mc[0], mc[1], 1, mc[0], mc[1], rings[NR].r * F.s);
                    mg.addColorStop(0, '#fffbe0');
                    mg.addColorStop(0.45, C.glow);
                    mg.addColorStop(1, S.mix(C.base, C.glow, 0.35));
                    fillPts(q, mouth, mg);
                    S.ink(q, F.pts(arcK(NR, Math.PI - 0.1, 0.1).map((p) => add(p, [0, 1]))), { w: 1.2, color: C.ink, alpha: 0.5, taper: [0.3, 0.3] });
                    strokePts(q, F.pts([[-rings[NR].r * 0.96, H], [rings[NR].r * 0.96, H]]), 1.5, INK);
                    strokePts(q, F.pts([[-rings[NR].r * 0.96, H], [rings[NR].r * 0.96, H]]), 0.6, '#aab6d8');
                }
            },
        });
        // the two wire rings: card and wire at the top, bare wire round the mouth
        {
            const top = F.pts(arcK(0, Math.PI, 0, 16));
            strokePts(g, top, 2.4, INK);
            strokePts(g, top, 1.1, '#aab4d2');
            S.ink(g, (side > 0 ? top.slice(2, 8) : top.slice(9, 15)).map((p) => add(p, TOL, 0.2)), { w: 0.6, color: '#ffffff', alpha: 0.9 });
            const bot = F.pts(arcK(NR, Math.PI, 0, 16));
            strokePts(g, bot, 1.9, INK);
            strokePts(g, bot, 0.8, '#9aa6c8');
        }
        tuft(true);
    }

    // A moth settled on the warm paper, wings spread: about 13 units across, head along -y.
    function moth(g, Fm) {
        const W = { base: '#b89a72', deep: '#5a4030', light: '#ecdcb8' };
        const cs = { blur: 1.8, dx: 1.2, dy: 1.8, color: 'rgba(40,20,20,0.5)' };
        for (const mx of [-1, 1]) {
            // hind wing under the fore wing
            S.piece(g, Fm.pts(S.curve([[mx * 0.8, 0.6], [mx * 4.6, 1.2], [mx * 5.6, 4.4], [mx * 3.2, 6], [mx * 0.9, 3.8]], true, 5)), { fill: '#d9c8a4', line: 0.8, heavy: 0.5, cast: cs, shade: { color: W.deep, alpha: 0.6, w: 2 } });
            const fore = Fm.pts(S.curve([[mx * 0.7, -1.8], [mx * 4.4, -3.6], [mx * 7.4, -2.2], [mx * 6.4, 1.2], [mx * 3, 2.2], [mx * 0.8, 1]], true, 5));
            S.piece(g, fore, {
                fill: W.base, line: 0.85, heavy: 0.5, cast: cs, shade: { color: W.deep, alpha: 0.7, w: 2.4 }, light: { color: W.light, alpha: 0.7, w: 1.6 },
                detail: (q) => {
                    // bands and an eye-spot, the wing's fringe
                    S.ink(q, Fm.pts([[mx * 2.6, -3.2], [mx * 2.2, -0.4], [mx * 2.8, 2.2]]), { w: 0.55, color: W.deep, alpha: 0.7, taper: [0, 0] });
                    S.ink(q, Fm.pts([[mx * 5, -3.4], [mx * 4.5, -0.6], [mx * 5, 1.8]]), { w: 0.45, color: W.deep, alpha: 0.6, taper: [0, 0] });
                    disc(q, Fm([mx * 3.7, -1]), 0.75 * Fm.s, W.deep);
                    disc(q, Fm([mx * 3.7, -1]), 0.32 * Fm.s, W.light);
                    for (let k = 0; k < 5; k++) S.ink(q, Fm.pts([[mx * (6.6 - k * 0.6), 0.4 + k * 0.3], [mx * (7.3 - k * 0.7), 1.2 + k * 0.3]]), { w: 0.3, color: W.deep, alpha: 0.6 });
                },
            });
            // antennae, feathered
            S.ink(g, Fm.pts(S.curve([[mx * 0.4, -2.6], [mx * 1.8, -4.6], [mx * 3.2, -5.4]], false, 5)), { w: 0.5, color: INK, taper: [0, 0.6] });
        }
        S.piece(g, Fm.pts(S.ellipse(0, 0.4, 1.25, 3.4, 14)), {
            fill: '#8a6e50', line: 0.8, heavy: 0.4, cast: cs, shade: { color: '#3a2820', alpha: 0.8, w: 1.4 }, light: { color: '#e6d2a8', alpha: 0.7, w: 0.9 },
            detail: (q) => {
                for (const yy of [0.6, 1.6, 2.6]) S.ink(q, Fm.pts([[-1.3, yy], [1.3, yy]]), { w: 0.3, color: '#3a2820', alpha: 0.7 });
            },
        });
        disc(g, Fm([0, -2.6]), 1.05 * Fm.s, INK);
        disc(g, Fm([0, -2.6]), 0.7 * Fm.s, '#6a5440');
    }

    // One flag of the bunting: tissue folded over the cord and glued, in the cord's own frame.
    function flag(g, F, o) {
        const r = Motion.rng('flag' + o.seed), C = TISSUE[o.col], w = o.w, L = o.len, tip = [o.dx, L];
        const hem = 3.6, cs = { blur: 2.2, dx: 1.2, dy: 1.8, color: 'rgba(14,8,30,0.5)' };
        const bow = (r() - 0.5) * 3.4;
        let body;
        if (o.cut === 'swallow') {
            body = [[-w / 2, -0.6], [w / 2, -0.6], [w / 2 + o.dx * 0.5 + bow, L * 0.5], [w / 2 + o.dx, L], [o.dx * 0.8, L * 0.7], [-w / 2 + o.dx, L], [-w / 2 + o.dx * 0.5 + bow, L * 0.5]];
        } else {
            body = [[-w / 2, -0.6], [w / 2, -0.6], ...S.curve([[w / 2, hem], [w * 0.3 + o.dx * 0.4 + bow, L * 0.45], [o.dx + (o.torn ? 2.4 : 0), L - (o.torn ? 6 : 0)]], false, 6)];
            if (o.torn) body.push([o.dx - 0.8, L - 9.5], [o.dx - 3.2, L - 4.6]);
            else if (!o.curl) body.push(tip);
            body.push(...S.curve([[o.dx - (o.torn ? 3.2 : 0), L - (o.torn ? 4.6 : 0)], [-w * 0.3 + o.dx * 0.4 + bow, L * 0.45], [-w / 2, hem]], false, 6).slice(1));
        }
        const pts = F.pts(body), lit = dot2(F.dir([-1, 0]), TOL) >= 0 ? 1 : -1;
        S.piece(g, pts, {
            fill: C.base, line: 1.5, heavy: 0.7, cast: cs,
            shade: [{ color: C.deep, alpha: 0.8, w: w * 0.42 }, { color: '#241238', alpha: 0.3, w: 3 }], light: { color: C.light, alpha: 0.75, w: w * 0.3 },
            detail: (q) => {
                // the glued hem, double paper round the cord
                fillPts(q, F.pts([[-w, -1], [w, -1], [w, hem], [-w, hem]]), S.rgba(C.deep, 0.32));
                S.ink(q, F.pts([[-w / 2, hem + 0.4], [0, hem + 0.9], [w / 2, hem + 0.4]]), { w: 0.7, color: C.ink, alpha: 0.75, taper: [0, 0] });
                S.ink(q, F.pts([[-w / 2, hem - 0.5], [0, hem], [w / 2, hem - 0.5]]), { w: 0.5, color: C.light, alpha: 0.7, taper: [0, 0] });
                S.ink(q, F.pts([[-w / 2, 0.6], [w / 2, 0.6]]), { w: 1.2, color: C.light, alpha: 0.5, taper: [0.2, 0.2] });
                // it was folded in four in its packet: a crease down the middle, one across
                const mid = [[0, hem], [o.dx * 0.45 + bow * 0.3, L * 0.5], [o.dx * 0.9, L * 0.96]];
                S.ink(q, F.pts(mid.map(([x, y]) => [x + lit * 0.7, y])), { w: 0.7, color: C.light, alpha: 0.7, taper: [0, 0.6] });
                S.ink(q, F.pts(mid), { w: 0.7, color: C.ink, alpha: 0.6, taper: [0, 0.6] });
                S.ink(q, F.pts([[-w * 0.4, L * 0.36], [w * 0.4, L * 0.34]]), { w: 0.6, color: C.ink, alpha: 0.35, taper: [0.3, 0.3] });
                // a soft wave in the paper, and its fibres
                q.save();
                q.filter = `blur(${(1.4 * S.pxScale(q)).toFixed(1)}px)`;
                S.ink(q, F.pts([[lit * w * 0.26, hem + 2], [lit * w * 0.2 + o.dx * 0.4, L * 0.5], [o.dx * 0.8 + lit * 2, L * 0.82]]), { w: 3.4, color: C.light, alpha: 0.4 });
                S.ink(q, F.pts([[-lit * w * 0.24, hem + 4], [-lit * w * 0.14 + o.dx * 0.4, L * 0.5]]), { w: 3, color: C.deep, alpha: 0.4 });
                q.restore();
                for (let i = 0; i < 9; i++) {
                    const p = [(r() - 0.5) * w * 0.8, hem + r() * L * 0.6], a = r() * 3.1, l = 1.5 + r() * 3;
                    S.ink(q, F.pts([p, [p[0] + Math.cos(a) * l, p[1] + Math.sin(a) * l]]), { w: 0.35, color: r() < 0.5 ? C.light : C.ink, alpha: 0.4 });
                }
            },
        });
        if (o.curl) {
            // its point has curled up: the paler back of the tissue
            const a = [o.dx + 3.6, L - 7.6], b = [o.dx - 3.4, L - 6.8], c = [o.dx - 1.6, L - 13];
            S.piece(g, F.pts(S.curve([a, lerpP(a, c, 0.5).map((v, i) => v + (i ? -0.8 : 1.2)), c, lerpP(c, b, 0.5).map((v, i) => v - (i ? 0 : 1)), b], false, 5)), {
                fill: S.mix(C.base, C.light, 0.55), line: 1.1, heavy: 0.5, cast: { blur: 1.4, dx: 0.8, dy: 1.2, color: S.rgba(C.ink, 0.6) }, shade: { color: C.base, alpha: 0.7, w: 2.6 }, light: { color: '#fffaf0', alpha: 0.6, w: 1.6 },
            });
        }
    }

    function farolillos(g, o = {}) {
        const { x = 0, y = 0, s = 1, n = 5, len = 700, sag = 90, seed = 'feria' } = o;
        g.save();
        g.translate(x, y);
        g.scale(s, s);
        const F = frame(0, 0, 0), r = Motion.rng('farolillos' + seed);
        const para = (u) => [u * len, sag * 4 * u * (1 - u)];
        // loaded cord: nearly straight between the lanterns, bent where each one hangs
        const hang = [];
        for (let i = 0; i < n; i++) hang.push(para((i + 0.5) / n));
        const nodes = [[0, 0], ...hang, [len, 0]], path = [];
        for (let i = 0; i < nodes.length - 1; i++) {
            const a = nodes[i], b = nodes[i + 1];
            path.push(a, add(lerpP(a, b, 0.5), [0, 2.2 + (len / n) * 0.012]));
        }
        path.push(nodes[nodes.length - 1]);
        const cord = S.curve(path, false, 14), st = walk(cord, 1), total = st[st.length - 1].s;
        const atX = (px) => {
            let lo = 0, hi = st.length - 1;
            while (hi - lo > 1) {
                const m = (lo + hi) >> 1;
                if (st[m].p[0] < px) lo = m;
                else hi = m;
            }
            return st[lo];
        };
        const cs = { blur: 3, dx: 1.6, dy: 2.4, color: 'rgba(12,7,26,0.55)' };
        // frayed ends beyond the knots
        for (const [e, dir] of [[st[0], -1], [st[st.length - 1], 1]]) {
            for (let i = 0; i < 7; i++) {
                const a = (dir > 0 ? 0.5 : Math.PI - 0.5) + (r() - 0.5) * 1.3, l = 7 + r() * 8;
                const th = S.curve([e.p, add(e.p, [Math.cos(a) * l * 0.5, Math.sin(a) * l * 0.5 + 1]), add(e.p, [Math.cos(a) * l, Math.sin(a) * l + 4])], false, 5);
                S.ink(g, th, { w: 1.7, color: INK, taper: [0, 0.6] });
                S.ink(g, th, { w: 0.75, color: i % 2 ? HEMP.light : HEMP.base, taper: [0, 0.6] });
            }
        }
        rope(g, cord, { w: 4.4, cast: cs });
        // knots: one at each end, one where every lantern is hooked on
        const knot = (p, a, k = 1) => {
            const Fk = frame(p[0], p[1], a);
            for (const dx of [-1.9, 1.9]) rope(g, Fk.pts(S.curve([[dx - 0.8, -3.9 * k], [dx + 0.9, 0], [dx - 0.8, 3.9 * k]], false, 6)), { w: 3.2 * k, pitch: 2.4, cast: { blur: 1.6, dx: 0.8, dy: 1.2, color: 'rgba(30,14,20,0.6)' } });
        };
        knot(st[0].p, 0.2, 1.15);
        knot(st[st.length - 1].p, -0.2, 1.15);

        // the bunting: three flags between every two lanterns, fewer towards the ends
        const cols = ['red', 'white', 'green', 'gold'];
        let fi = Math.floor(r() * 4);
        for (let i = 0; i <= n; i++) {
            const x0 = i === 0 ? 0 : hang[i - 1][0], x1 = i === n ? len : hang[i][0], m = i === 0 || i === n ? 2 : 3;
            for (let k = 0; k < m; k++) {
                const u = i === 0 ? 0.3 + k * 0.36 : i === n ? 0.36 + k * 0.36 : 0.24 + k * 0.26, q = atX(x0 + (x1 - x0) * u + (r() - 0.5) * 5), a = Math.atan2(q.t[1], q.t[0]);
                const id = fi++;
                flag(g, frame(q.p[0], q.p[1] - 0.4, a * 0.75 + (r() - 0.5) * 0.14), {
                    seed: seed + id, col: cols[id % 4], w: 22 + r() * 7, len: 31 + r() * 12, dx: (r() - 0.35) * 10,
                    cut: id % 5 === 3 ? 'swallow' : 'point', curl: id % 7 === 2, torn: id % 9 === 5,
                });
            }
        }

        // the lanterns: no two alike. Shapes and papers in turn; then one is dealt a tear, one
        // a dent and one hangs askew (as soon as there are three)
        const kinds = [
            { kind: 'sphere', col: 'red', band: 'white', R: 41, M: 16, bandK: [7, 10] },
            { kind: 'cyl', col: 'green', band: 'white', R: 26, H: 80, M: 17, bandK: [8, 11] },
            { kind: 'sphere', col: 'white', band: 'red', R: 38, M: 14, bandK: [6, 8], tall: 1.16 },
            { kind: 'cyl', col: 'red', band: 'white', R: 24, H: 86, M: 19, bandK: [3, 5], dots: true },
            { kind: 'sphere', col: 'green', band: 'white', R: 40, M: 16, bandK: [6, 9] },
            { kind: 'sphere', col: 'red', band: 'white', R: 36, M: 14, bandK: [10, 12], dots: true, tall: 0.92 },
            { kind: 'cyl', col: 'white', band: 'green', R: 25, H: 76, M: 15, bandK: [6, 9] },
        ];
        const off = Math.floor(r() * kinds.length), list = hang.map((h, i) => ({ ...kinds[(i + off) % kinds.length] }));
        const order = list.map((_, i) => i).sort((a, b) => S.hashI(a, 1, 2, S.seedOf(seed)) - S.hashI(b, 1, 2, S.seedOf(seed)));
        if (n >= 3) {
            const tornI = order.find((i) => list[i].col !== 'white') ?? order[0], rest = order.filter((i) => i !== tornI);
            Object.assign(list[tornI], { torn: true, tornA: 1.9 + r() * 0.5 });
            Object.assign(list[rest[0]], { crush: 0.3, crushA: 0.45 + r() * 0.2 });
            Object.assign(list[rest[1]], { tilt: (r() < 0.5 ? -1 : 1) * 0.17, seamA: 1.35 });
        }
        const places = hang.map((h, i) => {
            const bail = 15 + r() * 6;
            return { h, bail, F: frame(h[0], h[1] + bail + 3.6, list[i].tilt ?? (r() - 0.5) * 0.06) };
        });
        // the flex that feeds the bulbs: wound loosely along the cord, a drop into each lantern
        {
            const flex = [];
            for (let i = 0; i < st.length; i += 3) flex.push(add(st[i].p, st[i].n, 3 * Math.sin(st[i].s * 0.085 + 1) + 0.6));
            const wireF = (pts, w) => {
                strokePts(g, pts, w + 0.9, '#10122a');
                strokePts(g, pts, w * 0.45, '#4a4e80');
            };
            S.cast(g, (q) => strokePts(q, flex, 1.6, '#000'), { blur: 1.4, dx: 0.6, dy: 1.2, color: 'rgba(20,10,20,0.6)' });
            wireF(flex, 1.2);
            for (const pl of places) wireF(S.curve([add(pl.h, [-2.5, 2]), add(pl.h, [-5, pl.bail * 0.6]), pl.F([-1.5, -1]), pl.F([0, 2.5])], false, 6), 1.1);
        }
        places.forEach((pl, i) => {
            lantern(g, pl.F, { ...list[i], bail: pl.bail, seed: seed + '/' + i, tuft: 20 + r() * 8 });
            knot(add(pl.h, [3.4 + r() * 2, 0.3]), 0.1 + (r() - 0.5) * 0.4, 0.9);
        });
        // things to find: a moth come to the light, the shop's ticket still tied to a bail
        {
            const mi = Math.max(0, list.findIndex((K) => K.col === 'white')), pl = places[mi], K = list[mi];
            moth(g, pl.F.sub(-(K.R ?? 30) * 0.42, (K.kind === 'cyl' ? K.H : K.R * 2 * (K.tall ?? 1)) * 0.36, 0.5));
            const ti = (mi + 2) % n, pt = places[ti], top = pt.F([list[ti].R * 0.2 + 4, -pt.bail * 0.5]), Ft = frame(top[0] + 5, top[1] + 9, 0.22);
            strokePts(g, [top, Ft([0, -6])], 1.1, INK);
            strokePts(g, [top, Ft([0, -6])], 0.45, '#e6dcc4');
            const card = Ft.pts([[-4.4, -4.6], [-2.2, -7.2], [2.2, -7.2], [4.4, -4.6], [4.6, 7], [-4.6, 7.2]]);
            S.piece(g, card, {
                fill: '#eadcb4', line: 1.1, heavy: 0.6, cast: { blur: 2, dx: 1, dy: 1.6, color: 'rgba(12,7,26,0.55)' }, shade: { color: '#8d7a5a', alpha: 0.7, w: 3 }, light: { color: '#fffaf0', alpha: 0.7, w: 2 },
                detail: (q) => {
                    disc(q, Ft([0, -5.2]), 0.9, '#191c38');
                    strokePts(q, Ft.pts([[-3.2, -2.8], [3.2, -2.9]]), 0.4, 'rgba(125,28,34,0.8)');
                    q.save();
                    const c0 = Ft([0, 2.6]);
                    q.translate(c0[0], c0[1]);
                    q.rotate(Ft.rot);
                    q.font = `5.4px ${FELL}`;
                    q.textAlign = 'center';
                    q.fillStyle = '#2f2a44';
                    q.fillText('12', 0, 0);
                    q.font = `2.6px ${FELL}`;
                    q.fillStyle = '#7d1c22';
                    q.fillText('PTAS', 0, 3.2);
                    q.restore();
                },
            });
        }
        g.restore();
    }

    return { botijo, fino, peineta, biznaga, farolillos, rope, bead };
})();
