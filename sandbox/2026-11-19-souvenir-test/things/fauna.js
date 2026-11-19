// The small living things and the water that a second look finds in the pictures: a honey
// bee, a swallowtail, a seven-spot ladybird, the ocellated lizard, the wall gecko, a
// goldfinch, a banded snail; dew drops and an orb web. Global: Fauna.
//
// Every creature: Fauna.<name>(g, { x, y, s = 1, rot = 0, flip = false, seed, line = true, cast = true, … })
//   (x, y)  the middle of the body. At rot = 0 every creature heads RIGHT (+x); rot turns it
//           clockwise, flip mirrors the turned creature left to right (two creatures with
//           the same rot then face each other). The geometry is turned and mirrored point
//           by point and then painted, never the canvas: the light stays at the top left.
//   line    true: the emblem manner (blue-black contour, heavier on the shadow side, and
//           airbrush); false: the brush manner (no contour: every piece closes in its own
//           darker tone and the silhouette's last stroke breaks up), for the lemon tree.
//   cast    its shadow on the paint already under it (never on bare canvas): true, false or
//           { blur, dx, dy, color } in the creature's own units.
//   s       contours grow slower than the creature (× s^0.58), so a big one is not all line.
//
//   Fauna.bee        46 long    pose: 'fly' | 'feed'      side view
//   Fauna.butterfly  90 across  fold: 0 … 1               from above (0) round to its side (1)
//   Fauna.ladybird   18 long                               from above
//   Fauna.lizard     190 long   pose: 0 | 1, tear          from above
//   Fauna.gecko      110 long   pose: 0 | 1                from above
//   Fauna.goldfinch  130 long   pose: 0 | 1, perch         side view
//   Fauna.snail      60 long    trail: units of slime      side view
//   Fauna.box(g, name, o)    → { x, y, w, h } what it covers, in the caller's units
//   Fauna.marks(g, name, o)  → { feet: [[x, y], …], mouth: [x, y], … } in the caller's units
//
// Water, painted OVER what is there (it only ever lands on existing paint):
//   Fauna.drop(g, { x, y, r = 8, rot = 0, squash = 1 })
//   Fauna.drops(g, { box | path, n, seed, rMin, rMax, down })
//   Fauna.web(g, { x, y, r, seed, a0, a1, to })
//
// ---------------------------------------------------------------------------------------
// What each one is, and the small true things painted on it.
//
// HONEY BEE (Apis mellifera iberiensis, a worker, from her side). Head, thorax, abdomen.
//  1 antennae elbowed: a long scape, then a flagellum of short segments      2 a kidney-shaped
//  compound eye with hairs on it, and an ocellus on the crown      3 mandibles and the tongue
//  folded back under the chin (out, when she feeds)      4 the thorax is a ball of ochre
//  fur, with a bald dark boss on top and a tegula over each wing root      5 the forewing's
//  veins: a thick costa to the dark stigma, the long marginal cell, three submarginal
//  cells, no veins in the outer fifth      6 the hindwing smaller, hooked to the forewing's
//  rear edge      7 six tergites like roof tiles: the first amber, then amber with a dark hem,
//  then dark with a felt band of pale hair      8 the sternites paler, under them
//  9 the hind tibia widens into the pollen basket, with its load and the broad
//  basitarsus under it      10 a foot of small joints ending in two claws; the sting stays in.
//
// SWALLOWTAIL (Papilio machaon hispanicus). From above, wings open.
//  1 black veins on yellow, every cell its own shape      2 the forewing's base black, dusted
//  with yellow scales      3 three black bars from the costa: across the cell, at its end and
//  beyond      4 a broad black band inside the margin with a row of yellow spots in it, the
//  band dusted with yellow      5 the hindwing's band dusted with blue, a crescent per cell
//  6 a red eye-spot at the inner corner, black-ringed, blue above      7 yellow lunules
//  along the scalloped margin and a tail on the third vein      8 the body black above,
//  yellow along its sides, furry      9 clubbed antennae      10 the underside paler, its black
//  thinned to veins and its band rust-stained.
//
// SEVEN-SPOT LADYBIRD (Coccinella septempunctata). From above.
//  1 the scutellar spot shared by both wing cases      2 a white patch each side of it
//  3 three more spots on each case: a small one at the shoulder, the largest by the seam,
//  one behind      4 the seam, and the fine rim of the cases      5 the pronotum black with
//  white corners      6 the head black with two white dots      7 short clubbed antennae
//  8 six black legs just showing      9 gloss: a short fat streak and a dash      10 red
//  reflected into the rim of the shadow side, punctures in the lacquer.
//
// OCELLATED LIZARD (Timon lepidus, «el lagarto»). From above, in an S.
//  1 the head's great plates: frontal, parietals, the broad occipital, the brows
//  2 the jaw line: a row of lip scales, and the ear behind its corner      3 the eye under its
//  brow, a round pupil, the lid      4 nostrils      5 green beaded with black: a lace of
//  black scales round green rosettes      6 blue eye-spots («ocelos») in rows along the
//  flank, each ringed in black      7 scales in rows of tiny arcs that follow the body
//  8 five long clawed toes, the fourth of the hind foot the longest      9 the tail in
//  whorls, twice the body, greying to its tip      10 the belly's pale edge showing along
//  the flank and under the jaw. And (Lorca) a tear, if asked.
//
// MOORISH WALL GECKO (Tarentola mauritanica, «salamanquesa»). From above, flat on a wall.
//  1 a broad flat triangular head      2 lidless eyes bulging past the head's outline, a
//  vertical slit pupil, a marbled iris      3 rows of keeled tubercles down the back
//  4 spiny tubercles along the tail's sides, in whorls      5 dark saddles across a sandy
//  back, bars on the tail      6 toes widening into pads, the lamellae across them
//  7 claws on the third and fourth toes only      8 short splayed limbs      9 a fold of
//  skin along the flank      10 granules between the tubercles, the ear a slit.
//
// GOLDFINCH (Carduelis carduelis, «jilguero»). From its side, perched.
//  1 the red mask round the bill, split by black lores      2 a white cheek, and a black
//  crown that comes down behind it as a half collar      3 a long ivory cone of a bill with
//  a dusky tip, the gape line, bristles over the nostril      4 a buff-brown mantle in
//  scallops      5 black wing: coverts, then the broad yellow bar on the flight feathers'
//  outer webs      6 white tips to the tertials and the primaries, stacked like a ladder
//  7 a white rump, a black notched tail with white mirrors      8 buff patches on the
//  breast's sides, a white belly, soft flank feathers over the wing's edge      9 flesh-brown
//  tarsi in scutes      10 three toes forward and one back, closed round the perch.
//
// BANDED SNAIL (Cepaea nemoralis). From its right side.
//  1 a dextral shell: the spire turns clockwise out to the mouth      2 its dark bands,
//  spiralling with the whorls      3 growth lines across the whorls, a few of them rests
//  4 the dark-brown lip      5 a sheen on the body whorl      6 the mantle's collar where
//  the body comes out      7 skin in a net of grooves round small tubercles      8 two long
//  tentacles with the eyes in their tips, two short ones below      9 the foot's fringe
//  along the sole      10 the slime: a wet ribbon with broken lights.
//
// A DEW DROP is a lens stuck to the leaf: it magnifies what is under it, is darkest just
// inside its lit edge, lets the light out on the far side (a bright crescent inside, a
// caustic in its own shadow), and mirrors the sky in one sharp window.
const Fauna = (() => {
    const S = Souvenir;
    const { clamp, smooth, lerp, mix, rgba } = S;
    const DEG = Math.PI / 180, TAU = Math.PI * 2;
    const LIT = [-S.SHADE_DIR[0], -S.SHADE_DIR[1]]; // towards the light, on the picture plane
    const SH = S.SHADE_DIR;

    const cache = new Map();
    const memo = (key, fn) => {
        if (!cache.has(key)) {
            if (cache.size >= 64) cache.delete(cache.keys().next().value);
            cache.set(key, fn());
        }
        return cache.get(key);
    };
    // pixels per unit for a sprite pasted at scale s, rounded up to half steps
    const resOf = (g, s = 1) => Math.max(0.5, Math.ceil(S.pxScale(g) * s * 2 - 1e-6) / 2);
    const norm = (v) => {
        const l = Math.hypot(v[0], v[1]) || 1;
        return [v[0] / l, v[1] / l];
    };
    const mixP = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
    const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
    const range = (a, b, n) => Array.from({ length: n + 1 }, (_, i) => a + ((b - a) * i) / n);
    const turn = (v, a) => [v[0] * Math.cos(a) - v[1] * Math.sin(a), v[0] * Math.sin(a) + v[1] * Math.cos(a)];

    // An airbrushed mark: a line (or a filled shape) whose edge is `blur` units soft.
    function soft(g, pts, { color, alpha = 0.5, w = 4, blur = 4, fill = false } = {}) {
        const m = g.getTransform(), k = Math.hypot(m.a, m.b), BIG = 20000;
        g.save();
        g.setTransform(m.a, m.b, m.c, m.d, m.e - BIG, m.f);
        g.shadowColor = rgba(color, alpha);
        g.shadowBlur = blur * k;
        g.shadowOffsetX = BIG;
        g.shadowOffsetY = 0;
        g.beginPath();
        S.trace(g, pts, fill);
        if (fill) {
            g.fillStyle = '#000';
            g.fill();
        } else {
            g.lineWidth = w;
            g.lineCap = 'round';
            g.lineJoin = 'round';
            g.strokeStyle = '#000';
            g.stroke();
        }
        g.restore();
    }
    const disc = (g, p, r, color, alpha = 1) => {
        g.globalAlpha = alpha;
        g.fillStyle = color;
        g.beginPath();
        g.arc(p[0], p[1], r, 0, 6.3);
        g.fill();
        g.globalAlpha = 1;
    };
    const hairline = (g, pts, w, color, alpha = 1) => {
        g.globalAlpha = alpha;
        g.strokeStyle = color;
        g.lineWidth = w;
        g.lineCap = 'round';
        g.lineJoin = 'round';
        g.beginPath();
        S.trace(g, pts, false);
        g.stroke();
        g.globalAlpha = 1;
    };
    // A band along a line: its two edges and the closed outline. hw: half width, or (u) => it.
    // L is the left side of someone walking the line (up, for a line that runs to the right).
    function strip(line, hw) {
        const n = line.length, L = [], R = [];
        for (let i = 0; i < n; i++) {
            const p = line[Math.max(0, i - 1)], q = line[Math.min(n - 1, i + 1)];
            const t = norm([q[0] - p[0], q[1] - p[1]]), h = typeof hw === 'function' ? hw(i / (n - 1)) : hw;
            L.push([line[i][0] + t[1] * h, line[i][1] - t[0] * h]);
            R.push([line[i][0] - t[1] * h, line[i][1] + t[0] * h]);
        }
        return { L, R, poly: [...L, ...R.slice().reverse()] };
    }
    // A line resampled by length: at(u) a point, dir(u) its unit tangent, u in 0 … 1.
    function pathOf(ctrl, seg = 20) {
        const pts = ctrl.length > 2 ? S.curve(ctrl, false, seg) : ctrl, cum = [0];
        for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + dist(pts[i], pts[i - 1]));
        const total = cum[cum.length - 1];
        const at = (u) => {
            const d = clamp(u) * total;
            let i = 1;
            while (i < pts.length - 1 && cum[i] < d) i++;
            return mixP(pts[i - 1], pts[i], (d - cum[i - 1]) / (cum[i] - cum[i - 1] || 1));
        };
        const dir = (u) => {
            const e = 0.5 / Math.max(8, pts.length);
            return norm([at(u + e)[0] - at(u - e)[0], at(u + e)[1] - at(u - e)[1]]);
        };
        return { at, dir, total };
    }

    // ================================================================== the sprite builder
    // The brush manner's last stroke: the silhouette breaks up over its last unit, the
    // paint closes a little darker towards its edge, and its tone drifts as hand-mixed
    // paint does.
    function brushEdge(c, res, sd) {
        const w = c.width, h = c.height, g = c.getContext('2d');
        const img = g.getImageData(0, 0, w, h), px = img.data;
        const inside = new Uint8Array(w * h);
        for (let i = 0; i < w * h; i++) inside[i] = px[i * 4 + 3] > 40 ? 1 : 0;
        const d = S.edt(inside, w, h), eR = 0.85 * res, rR = 1.9 * res;
        for (let y = 0, i = 0; y < h; y++) {
            for (let x = 0; x < w; x++, i++) {
                const a = px[i * 4 + 3];
                if (!a) continue;
                const ux = x / res, uy = y / res;
                let v = 1 + 0.07 * S.noise2(ux * 0.5, uy * 1.5, sd + 5) + 0.035 * S.noise2(ux * 2.3, uy * 2.3, sd + 6);
                if (d[i] < rR) v *= 1 - smooth(rR, 0, d[i]) * (0.3 + 0.16 * S.noise2(ux * 0.8, uy * 0.8, sd + 9));
                px[i * 4] = Math.min(255, px[i * 4] * v);
                px[i * 4 + 1] = Math.min(255, px[i * 4 + 1] * (v * 0.97 + 0.03));
                px[i * 4 + 2] = Math.min(255, px[i * 4 + 2] * (v * 0.9 + 0.1));
                if (d[i] < eR) {
                    const n = S.noise2(ux * 1.5, uy * 1.5, sd + 21) * 0.6 + S.noise2(ux * 4.1, uy * 4.1, sd + 22) * 0.4;
                    px[i * 4 + 3] = a * smooth(0.12, 0.62, d[i] / eR + n * 0.7 + 0.18);
                }
            }
        }
        g.putImageData(img, 0, 0);
    }

    // Collects a creature's pieces, already turned and mirrored, and paints them into one
    // sprite. compose(B) describes the creature in its own frame (heading +x, y down).
    function build(o, res, compose) {
        const { rot = 0, flip = false, line = true, s = 1, seed = '' } = o;
        const rho = flip ? -rot : rot, cr = Math.cos(rho), sr = Math.sin(rho), fx = flip ? -1 : 1;
        const pt = (p) => [p[0] * fx * cr - p[1] * sr, p[0] * fx * sr + p[1] * cr];
        const inv = (x, y) => [fx * (x * cr + y * sr), -x * sr + y * cr];
        const T = (pts) => pts.map(pt);
        const k = clamp(Math.pow(s, -0.42), 0.45, 1.7); // contours grow slower than the creature
        const ops = [], all = [], marks = {};
        let group = null;
        const add = (pts, fn) => {
            for (const p of pts) all.push(p);
            ops.push(fn);
        };
        const rimOf = (fill) => mix(typeof fill === 'object' ? fill.stops[fill.stops.length - 1][1] : fill ?? '#888888', '#141428', 0.55);
        // One piece (S.piece) from points in the creature's frame.
        const piece = (local, q = {}) => {
            const pts = T(local), p = { ...q, line: (q.line ?? 1) * k };
            if (!line) {
                p.line = 0;
                if (q.rimA !== 0) p.shade = [...[].concat(q.shade ?? []), { color: q.rim ?? rimOf(q.fill), alpha: q.rimA ?? 0.5, w: q.rimW ?? 1.1, push: 0, dir: [0, 0] }];
            } else if (group) {
                group.push(pts);
                p.heavy = 0;
            }
            add(pts, (g) => S.piece(g, pts, p));
            return pts;
        };
        // A group of pieces under one heavy contour `w` units wide outside them (emblem
        // manner): the pieces' own lines can then stay thin.
        const outlined = (w, fn, ink = S.INK) => {
            if (!line) return fn();
            const polys = (group = []), slot = ops.length;
            ops.push(null);
            fn();
            group = null;
            const lw = w * 2 * k;
            ops[slot] = (g) => {
                g.save();
                g.lineJoin = 'round';
                g.strokeStyle = g.fillStyle = ink;
                g.lineWidth = lw;
                for (const [dx, dy] of [[SH[0] * lw * 0.32, SH[1] * lw * 0.32], [0, 0]]) {
                    for (const p of polys) {
                        g.beginPath();
                        S.trace(g, p.map(([x, y]) => [x + dx, y + dy]));
                        g.fill();
                        g.stroke();
                    }
                }
                g.restore();
            };
        };
        // A piece that is a lit volume (S.form), wearing the piece's contour and airbrush.
        // f: the form's options, with height/tint taking points in the creature's frame;
        // marks/over paint in the sprite's frame (use B.T).
        const vol = (local, f, q = {}) => {
            const pts = T(local), box = S.bbox(pts, 1.5);
            let sp = null;
            const make = () => sp ?? (sp = S.form({
                box, res, soft: 0.9, ...f,
                mask: (g) => {
                    g.beginPath();
                    S.trace(g, pts);
                    g.fill();
                },
                height: f.height ? (x, y, m) => {
                    const u = inv(x, y);
                    return f.height(u[0], u[1], m);
                } : undefined,
                tint: f.tint ? (x, y, tone, rgb, m) => {
                    const u = inv(x, y);
                    f.tint(u[0], u[1], tone, rgb, m);
                } : undefined,
            }));
            return piece(local, {
                fill: f.ramp[Math.floor(f.ramp.length / 2)][1], ...q,
                detail: (g) => {
                    S.put(g, make());
                    if (q.detail) q.detail(g);
                },
            });
        };
        // A wing's membrane: what is behind it shows through, tinted. veins: [[line, width], …]
        // in the creature's frame; q.axis [root, tip] and q.blur soften it towards the tip.
        const membrane = (local, veins, q = {}) => {
            const pts = T(local), vs = veins.map(([ln, w]) => [T(ln), w]);
            const axis = q.axis ? T(q.axis) : null, tint = q.tint ?? '#cfdcf0', alpha = q.alpha ?? 0.3;
            const wd = q.width ?? 8, dark = q.dark ?? '#1d1826';
            const paint = (c) => {
                c.save();
                c.beginPath();
                S.trace(c, pts);
                c.fillStyle = rgba(tint, alpha);
                c.fill();
                c.clip();
                if (axis) {
                    // denser at the root and along the leading edge, a sheen down the middle
                    const a = axis[0], b = axis[1], d = norm([b[0] - a[0], b[1] - a[1]]), len = dist(a, b);
                    soft(c, [a, mixP(a, b, 0.22)], { color: mix(tint, '#8a7a6a', 0.5), alpha: 0.45, w: wd * 0.5, blur: wd * 0.5 });
                    soft(c, [mixP(a, b, 0.3), mixP(a, b, 0.86)].map((p) => [p[0] + LIT[0] * wd * 0.1, p[1] + LIT[1] * wd * 0.1]), { color: '#ffffff', alpha: 0.5 * (q.sheen ?? 1), w: wd * 0.1, blur: wd * 0.22 });
                    soft(c, [mixP(a, b, 0.62), mixP(a, b, 0.95)].map((p) => [p[0] - d[1] * wd * 0.2, p[1] + d[0] * wd * 0.2]), { color: '#f3bfd6', alpha: 0.3 * (q.sheen ?? 1), w: wd * 0.16, blur: wd * 0.3 });
                    soft(c, [mixP(a, b, 0.4), mixP(a, b, 0.7)].map((p) => [p[0] + d[1] * wd * 0.22, p[1] - d[0] * wd * 0.22]), { color: '#a9ecdc', alpha: 0.26 * (q.sheen ?? 1), w: wd * 0.14, blur: wd * 0.3 });
                    // the membrane's fine pleats
                    c.lineCap = 'round';
                    for (let i = 0; i < 9; i++) {
                        const off = (i / 8 - 0.5) * wd * 0.8, u0 = 0.5 + 0.04 * i, u1 = 0.97;
                        const p0 = mixP(a, b, u0), p1 = mixP(a, b, u1);
                        hairline(c, [[p0[0] - d[1] * off, p0[1] + d[0] * off], [p1[0] - d[1] * off * 0.9, p1[1] + d[0] * off * 0.9]], 0.22, '#ffffff', 0.22);
                    }
                    void len;
                }
                c.restore();
                for (const [ln, w] of vs) S.ink(c, ln, { w: w * (line ? 1 : 0.9), color: q.vein ?? '#3a2a26', alpha: q.veinA ?? 0.85, taper: [0.05, 0.85] });
                if (q.extra) q.extra(c);
                // its edge: an ink hairline, heavier away from the light; in the brush manner a darker veil
                c.lineJoin = 'round';
                c.beginPath();
                S.trace(c, pts);
                if (line) {
                    c.save();
                    c.clip();
                    hairline(c, [...pts, pts[0]].map(([x, y]) => [x - SH[0] * 0.25 * k, y - SH[1] * 0.25 * k]), 1.3 * k * (q.lineK ?? 1), dark, 0.5);
                    c.restore();
                    hairline(c, [...pts, pts[0]], 0.62 * k * (q.lineK ?? 1), dark, 0.92);
                } else {
                    hairline(c, [...pts, pts[0]], 0.7, mix(tint, '#3a3440', 0.6), 0.5);
                }
            };
            add(pts, (g) => {
                if (q.cast !== false) {
                    S.cast(g, (c) => {
                        c.beginPath();
                        S.trace(c, pts);
                        c.fillStyle = '#000';
                        c.fill();
                    }, { blur: 2.2, dx: 0.9, dy: 1.3, color: 'rgba(20,14,34,0.3)' });
                }
                if (!q.blur || !axis) return paint(g);
                // sharp at the root, blurred towards the tip
                const m = g.getTransform(), W = g.canvas.width, H = g.canvas.height;
                const mk = () => {
                    const c = document.createElement('canvas');
                    c.width = W;
                    c.height = H;
                    return c;
                };
                const c1 = mk(), c2 = mk(), g1 = c1.getContext('2d'), g2 = c2.getContext('2d');
                g1.setTransform(m);
                paint(g1);
                g2.filter = `blur(${(q.blur * m.a).toFixed(2)}px)`;
                g2.drawImage(c1, 0, 0);
                g2.filter = 'none';
                const a = mixP(axis[0], axis[1], 0.35), b = mixP(axis[0], axis[1], 0.9);
                for (const [gg, a0, a1] of [[g1, 1, 0.1], [g2, 0, 1]]) {
                    gg.setTransform(m);
                    const gr = gg.createLinearGradient(a[0], a[1], b[0], b[1]);
                    gr.addColorStop(0, `rgba(0,0,0,${a0})`);
                    gr.addColorStop(1, `rgba(0,0,0,${a1})`);
                    gg.globalCompositeOperation = 'destination-in';
                    gg.fillStyle = gr;
                    gg.fillRect(-4000, -4000, 8000, 8000);
                }
                g.save();
                g.setTransform(1, 0, 0, 1, 0, 0);
                g.drawImage(c1, 0, 0);
                g.drawImage(c2, 0, 0);
                g.restore();
            });
        };
        const B = {
            pt, inv, T, k, line, fx, res, add, piece, outlined, vol, membrane,
            ink: (local, q = {}) => {
                const pts = T(local);
                add(pts, (g) => S.ink(g, pts, line ? q : { ...q, color: q.brush ?? mix(q.color ?? S.INK, '#6a5648', 0.35), alpha: (q.alpha ?? 1) * 0.8 }));
            },
            op: (local, fn) => add(T(local), fn),
            mark: (name, local) => {
                marks[name] = Array.isArray(local[0]) ? T(local) : pt(local);
            },
            // the colour of an inner line: ink in the emblem manner, the piece's own dark in the brush manner
            ic: (c, own) => (line ? c : mix(c, own ?? '#6a5648', 0.5)),
            lit: (v) => {
                const q = pt(v);
                return q[0] * LIT[0] + q[1] * LIT[1];
            },
        };
        compose(B);
        const box = S.bbox(all, 4 + 2 * k);
        const c = document.createElement('canvas');
        c.width = Math.max(2, Math.ceil(box.w * res));
        c.height = Math.max(2, Math.ceil(box.h * res));
        const g = c.getContext('2d', { willReadFrequently: !line });
        g.setTransform(res, 0, 0, res, -box.x * res, -box.y * res);
        for (const op of ops) if (op) op(g);
        if (!line) brushEdge(c, res, S.seedOf(seed) & 1023);
        return { canvas: c, box, marks };
    }

    const KINDS = {};
    function spriteOf(g, kind, o = {}) {
        const K = KINDS[kind];
        const q = { x: 0, y: 0, s: 1, rot: 0, flip: false, line: true, cast: true, seed: kind, ...K.defaults, ...o };
        if (K.prep) K.prep(q);
        const res = resOf(g, q.s);
        const key = [kind, K.key ? K.key(q) : '', q.flip ? 1 : 0, q.line ? 1 : 0, q.rot.toFixed(4), q.seed, q.s, res].join('/');
        return { q, K, sp: memo(key, () => build(q, res, (B) => K.make(B, q))) };
    }
    const drawer = (kind) => (g, o = {}) => {
        const { q, K, sp } = spriteOf(g, kind, o);
        const { x, y, s } = q, put = (c) => c.drawImage(sp.canvas, x + sp.box.x * s, y + sp.box.y * s, sp.box.w * s, sp.box.h * s);
        if (q.cast) {
            const c = { ...K.cast, ...(typeof q.cast === 'object' ? q.cast : {}) };
            S.cast(g, put, { blur: c.blur * s, dx: c.dx * s, dy: c.dy * s, color: c.color });
        }
        put(g);
    };
    // What a creature covers, in the caller's units.
    function box(g, kind, o = {}) {
        const { q, sp } = spriteOf(g, kind, o);
        return { x: q.x + sp.box.x * q.s, y: q.y + sp.box.y * q.s, w: sp.box.w * q.s, h: sp.box.h * q.s };
    }
    // Its named points (feet, mouth …), in the caller's units.
    function marks(g, kind, o = {}) {
        const { q, sp } = spriteOf(g, kind, o), out = {};
        const map = (p) => [q.x + p[0] * q.s, q.y + p[1] * q.s];
        for (const [name, v] of Object.entries(sp.marks)) out[name] = Array.isArray(v[0]) ? v.map(map) : map(v);
        return out;
    }

    // ================================================================== honey bee
    const BEE = {
        ink: '#17121c',
        fur: '#c58f33', furLight: '#f3d382', furDeep: '#7a4715', furDark: '#3b2110',
        amber: '#d6861c', amberLight: '#f7c35c', amberDeep: '#8a4710',
        dark: '#2f1c15', darkDeep: '#150c0d', darkSheen: '#8f6a52',
        hair: '#efe3b8', belly: '#8a6438', bellyLight: '#c9a56c',
        eye: '#241a20', eyeSheen: '#9383ad',
        leg: '#33221a', legFar: '#241813', legLight: '#b28a62',
        pollen: '#f0ad17', pollenLight: '#ffe585', pollenDeep: '#a9640a',
        wing: '#cfdcf0', vein: '#3a2a26',
    };
    // wings in their own frame: a along the wing (0 root … 1 tip), c across (− the leading edge)
    const BEE_FORE = [[0, -0.05], [0.12, -0.2], [0.4, -0.36], [0.7, -0.42], [0.9, -0.33], [1, -0.05], [0.97, 0.2], [0.82, 0.44], [0.6, 0.52], [0.4, 0.42], [0.2, 0.22], [0.05, 0.08]];
    const BEE_HIND = [[0, -0.05], [0.2, -0.22], [0.55, -0.32], [0.85, -0.26], [1, 0], [0.9, 0.3], [0.65, 0.5], [0.4, 0.46], [0.2, 0.3], [0.05, 0.1]];
    const BEE_FORE_V = [
        [[[0, -0.09], [0.3, -0.3], [0.62, -0.395]], 0.95], // costa and subcosta, to the stigma
        [[[0, -0.02], [0.18, -0.12], [0.36, -0.2], [0.6, -0.34]], 0.6], // radius
        [[[0.62, -0.37], [0.72, -0.23], [0.86, -0.2], [0.95, -0.27]], 0.5], // the marginal cell
        [[[0.36, -0.2], [0.5, -0.2], [0.64, -0.2], [0.72, -0.23]], 0.45], // radial sector
        [[[0, 0.03], [0.2, 0.02], [0.38, 0]], 0.6], // media + cubitus
        [[[0.38, 0], [0.5, -0.08], [0.62, -0.1], [0.76, -0.06], [0.85, 0.02]], 0.45], // media
        [[[0.38, 0], [0.5, 0.16], [0.62, 0.26], [0.75, 0.31]], 0.45], // cubitus
        [[[0, 0.06], [0.2, 0.19], [0.4, 0.33], [0.5, 0.42]], 0.5], // anal
        [[[0.36, -0.2], [0.38, 0]], 0.4], [[[0.4, 0.01], [0.4, 0.33]], 0.4], // basal, cu-a
        [[[0.5, -0.2], [0.5, -0.08]], 0.35], [[[0.62, -0.2], [0.63, -0.1]], 0.35], [[[0.72, -0.23], [0.76, -0.06]], 0.35], // submarginal cells
        [[[0.62, -0.1], [0.62, 0.26]], 0.35], [[[0.76, -0.06], [0.75, 0.31]], 0.35], // discoidal cells
    ];
    const BEE_HIND_V = [
        [[[0, -0.08], [0.3, -0.24], [0.62, -0.3]], 0.7],
        [[[0, 0], [0.25, -0.04], [0.45, -0.02]], 0.5],
        [[[0.45, -0.02], [0.62, -0.1], [0.8, -0.1]], 0.4],
        [[[0.45, -0.02], [0.58, 0.16], [0.72, 0.3]], 0.4],
        [[[0, 0.06], [0.2, 0.2], [0.36, 0.34]], 0.45],
        [[[0.45, -0.02], [0.44, -0.27]], 0.35], [[[0.3, 0.0], [0.3, 0.27]], 0.35],
    ];

    function beeMake(B, o) {
        const C = BEE, k = B.k, feed = o.pose === 'feed';
        const rnd = Motion.rng('bee/' + o.seed + '/' + o.pose);
        // the bee's own frame lies level; feeding tips her head down into the flower
        const tilt = feed ? 0.5 : -0.07, ct = Math.cos(tilt), st = Math.sin(tilt);
        const P = (p) => [p[0] * ct - p[1] * st, p[0] * st + p[1] * ct];
        const PP = (pts) => pts.map(P);
        const Wp = (p) => B.pt(P(p)), W = (pts) => pts.map(Wp);

        // ---- wings
        const wing = (shape, veins, base, deg, len, wid, mir, q = {}) => {
            const th = deg * DEG, d = [Math.cos(th), Math.sin(th)], n = [Math.sin(th) * (mir ? -1 : 1), -Math.cos(th) * (mir ? -1 : 1)];
            const at = ([a, c]) => [base[0] + d[0] * a * len + n[0] * c * wid, base[1] + d[1] * a * len + n[1] * c * wid];
            B.membrane(PP(S.curve(shape.map(at), true, 7)), veins.map(([ln, w]) => [PP(S.curve(ln.map(at), false, 5)), w * (q.far ? 0.75 : 1)]), {
                axis: PP([base, at([1, 0])]), width: wid, tint: C.wing, alpha: q.far ? 0.2 : 0.3, vein: C.vein, veinA: q.far ? 0.55 : 0.85, dark: C.ink, lineK: q.far ? 0.8 : 1, sheen: q.far ? 0.5 : 1,
                blur: q.blur, cast: !q.far,
                extra: veins === BEE_FORE_V ? (c) => {
                    // the stigma: a dark lens on the leading edge
                    const sg = W(S.curve([[0.6, -0.4], [0.66, -0.41], [0.7, -0.4], [0.66, -0.345]].map(at), true, 5));
                    c.fillStyle = rgba(C.furDark, q.far ? 0.55 : 0.9);
                    c.beginPath();
                    S.trace(c, sg);
                    c.fill();
                } : null,
            });
        };
        if (!feed) {
            wing(BEE_HIND, BEE_HIND_V, [5.2, -5.6], -108, 21, 8, false, { far: true, blur: 0.9 });
            wing(BEE_FORE, BEE_FORE_V, [7.6, -6.2], -84, 30, 11, false, { far: true, blur: 0.9 });
        }

        // ---- legs: femur, tibia, basitarsus, tarsus
        const leg = (J, Wd, q = {}) => {
            for (let i = J.length - 2; i >= 0; i--) {
                const line = range(0, 1, 6).map((u) => mixP(J[i], J[i + 1], u));
                const st2 = strip(line, (u) => lerp(Wd[i], Wd[i + 1], u) * (0.8 + 0.34 * Math.sin(Math.PI * u)));
                B.piece(PP(st2.poly), {
                    fill: q.far ? C.legFar : C.leg, line: 0.4, ink: C.ink, rimA: 0.3,
                    shade: { color: C.darkDeep, alpha: 0.8, w: 0.9 },
                    light: { color: C.legLight, alpha: q.far ? 0.45 : 0.95, w: 0.7, push: 0.22 },
                });
            }
            // the foot's joints and its claws
            const a = Wp(J[J.length - 2]), b = Wp(J[J.length - 1]), d = norm([b[0] - a[0], b[1] - a[1]]);
            B.add([], (g) => {
                for (const u of [0.3, 0.55, 0.78]) {
                    const p = mixP(a, b, u);
                    hairline(g, [[p[0] - d[1] * 0.42, p[1] + d[0] * 0.42], [p[0] + d[1] * 0.42, p[1] - d[0] * 0.42]], 0.14, q.far ? C.darkDeep : C.legLight, 0.7);
                }
                hairline(g, [b, [b[0] + d[0] * 0.9 - d[1] * 0.5, b[1] + d[1] * 0.9 + d[0] * 0.5]], 0.3, C.ink, 0.9);
                hairline(g, [b, [b[0] + d[0] * 0.9 + d[1] * 0.5, b[1] + d[1] * 0.9 - d[0] * 0.5]], 0.3, C.ink, 0.9);
            });
        };
        const LEGS = feed ? {
            fore: [[11.6, 5], [16, 8.6], [18.6, 13], [20.4, 15.2], [21.8, 16.4]],
            mid: [[7, 5.6], [8.4, 11.6], [12.4, 16], [14.4, 18.4], [15.8, 19.8]],
            hind: [[2.6, 4.6], [-1.6, 10.4], [2.2, 17.4], [5, 21.6], [7.2, 24]],
        } : {
            fore: [[11.6, 5], [14.6, 9.2], [12.8, 13.4], [13.6, 15.8], [14.8, 17.6]],
            mid: [[7, 5.6], [4.8, 11.2], [6.8, 16.2], [8, 19], [9.4, 21.2]],
            hind: [[2.6, 4.6], [-3.6, 9.4], [-2.4, 17.6], [-1, 22.2], [0.8, 25.8]],
        };
        const far = (J, dx, dy, a) => J.map((p, i) => {
            const v = turn([p[0] - J[0][0], p[1] - J[0][1]], a);
            return [J[0][0] + v[0] + dx, J[0][1] + v[1] + dy - (i ? 0.6 : 0)];
        });
        const LW = [0.86, 0.76, 0.6, 0.46, 0.3], HW = [1, 0.95, 1.8, 1.3, 0.36];
        B.outlined(0.42, () => {
            leg(far(LEGS.hind, 1.6, -0.2, 0.2), HW.map((w) => w * 0.85), { far: true });
            leg(far(LEGS.mid, 1.8, -0.2, -0.22), LW, { far: true });
            leg(far(LEGS.fore, 1.8, -0.3, -0.25), LW, { far: true });
        }, C.ink);
        // the far antenna
        const ANT = [[19.5, -1.8], [22.6, -6.3], [25.4, -5.6], [28.3, -3.2]];
        const antenna = (dx, dy, a, farOne) => {
            const J = ANT.map((p) => {
                const v = turn([p[0] - ANT[0][0], p[1] - ANT[0][1]], a);
                return [ANT[0][0] + v[0] + dx, ANT[0][1] + v[1] + dy];
            });
            const scape = strip(range(0, 1, 5).map((u) => mixP(J[0], J[1], u)), (u) => 0.36 + 0.14 * u);
            const flag = strip(S.curve([J[1], J[2], J[3]], false, 8), (u) => 0.5 - 0.12 * u);
            for (const st2 of [flag, scape]) B.piece(PP(st2.poly), { fill: farOne ? C.legFar : C.leg, line: 0.36, ink: C.ink, rimA: 0.25, light: { color: C.legLight, alpha: farOne ? 0.4 : 0.9, w: 0.5, push: 0.16 } });
            // the flagellum's segments
            const fl = W(S.curve([J[1], J[2], J[3]], false, 8));
            B.add([], (g) => {
                for (let i = 2; i < fl.length - 1; i += 2) {
                    const p = fl[i], q = fl[i + 1], t = norm([q[0] - p[0], q[1] - p[1]]);
                    hairline(g, [[p[0] - t[1] * 0.45, p[1] + t[0] * 0.45], [p[0] + t[1] * 0.45, p[1] - t[0] * 0.45]], 0.18, C.darkDeep, 0.7);
                }
            });
        };
        B.outlined(0.36, () => antenna(0.5, -0.5, -0.32, true), C.ink);

        // ---- abdomen
        const drop = feed ? 2.6 : 8.4, pw = feed ? 1.5 : 1.7;
        const axis = (t) => [0.8 - 25.4 * t, 0.4 + drop * Math.pow(t, pw)];
        const hwA = (t) => S.track([[0, 3.5], [0.12, 5.5], [0.3, 6.7], [0.5, 6.6], [0.7, 5.5], [0.86, 3.7], [0.96, 1.7], [1, 0.5]], t);
        const at = (t, w) => {
            const a = axis(Math.max(0, t - 0.01)), b = axis(Math.min(1.05, t + 0.01)), d = norm([b[0] - a[0], b[1] - a[1]]);
            const p = axis(t), h = hwA(clamp(t));
            return [p[0] + d[1] * w * h, p[1] - d[0] * w * h];
        };
        // (d points to the tail, so w = −1 is the back and w = +1 the belly)
        const SEG = [0, 0.14, 0.32, 0.5, 0.66, 0.8, 0.92, 1];
        B.outlined(0.62, () => {
            // the sternites: the belly's paler plates, with their hair
            const whole = [...range(0, 1, 30).map((t) => at(t, -1)), ...range(1, 0, 30).map((t) => at(t, 1))];
            const bellyHair = [];
            for (let i = 0; i < 46; i++) {
                const t = 0.06 + rnd() * 0.86, p = at(t, 0.62 + rnd() * 0.36), q2 = at(t + 0.03, 1.12);
                bellyHair.push([Wp(p), Wp(mixP(p, q2, 0.5 + rnd() * 0.5))]);
            }
            B.piece(PP(whole), {
                fill: C.belly, line: 0.5, ink: C.ink,
                shade: { color: C.darkDeep, alpha: 0.85, w: 3 },
                detail: (g) => {
                    for (let i = 1; i < SEG.length - 1; i++) hairline(g, W([at(SEG[i], 0.5), at(SEG[i] + 0.02, 1)]), 0.3, C.darkDeep, 0.8);
                    for (const h of bellyHair) hairline(g, h, 0.22, C.bellyLight, 0.75);
                },
            });
            // the tergites, the last first: each overlaps the one behind it
            for (let i = SEG.length - 2; i >= 0; i--) {
                const t0 = SEG[i], t1 = Math.min(1, SEG[i + 1] + (i < SEG.length - 2 ? 0.032 : 0));
                const poly = [
                    ...range(t0, t1, 7).map((t) => at(t, -1)),
                    ...range(-1, 0.6, 6).slice(1).map((w) => at(t1 + 0.016 * (1 - Math.pow((w + 0.2) / 0.8, 2)), w)),
                    ...range(t1, t0, 7).slice(1).map((t) => at(t, 0.6 - 0.05 * Math.sin((t - t0) / (t1 - t0) * Math.PI))),
                    ...range(0.6, -1, 4).slice(1, -1).map((w) => at(t0, w)),
                ];
                const a = P(at(t0, -0.2)), b = P(at(t1, -0.2));
                const stops = i === 0 ? [[0, C.amberDeep], [0.4, C.amber], [1, C.amberLight]]
                    : i === 1 ? [[0, C.amberLight], [0.3, C.amber], [0.62, C.amber], [0.74, C.dark], [1, C.darkDeep]]
                    : i === 2 ? [[0, C.amberLight], [0.2, C.amber], [0.44, C.amber], [0.56, C.dark], [1, C.darkDeep]]
                    : i < 6 ? [[0, '#cdb88a'], [0.24, '#a88a5a'], [0.36, C.dark], [1, C.darkDeep]] : [[0, C.dark], [1, C.darkDeep]];
                // the felt band of pale hair at the front of the dark tergites, and sparse hair on all
                const felt = [], hairs = [];
                const nf = i >= 3 && i < 6 ? 46 : 0;
                for (let j = 0; j < nf; j++) {
                    const w = -1 + 1.6 * ((j + rnd()) / nf), t = t0 + (t1 - t0) * (0.01 + rnd() * 0.1);
                    felt.push(W([at(t, w), at(t + (t1 - t0) * (0.24 + rnd() * 0.2), w + 0.05)]));
                }
                for (let j = 0; j < 12; j++) {
                    const w = -1 + 1.6 * rnd(), t = t0 + (t1 - t0) * (0.35 + rnd() * 0.5);
                    hairs.push(W([at(t, w), at(t + 0.03, w + 0.04)]));
                }
                const top = W(range(t0 + 0.01, t1 - 0.02, 6).map((t) => at(t, -0.62)));
                const dn = B.pt(turn([0, 1], tilt));
                B.piece(PP(poly), {
                    fill: { from: B.pt(a), to: B.pt(b), stops }, line: 0.5, ink: C.ink, rimA: 0.4, rim: C.darkDeep,
                    cast: { blur: 1.2, dx: -0.7 * B.pt(turn([1, 0], tilt))[0] + 0.3, dy: -0.7 * B.pt(turn([1, 0], tilt))[1] + 0.4, color: 'rgba(14,8,10,0.7)' },
                    shade: [{ color: C.darkDeep, alpha: 0.8, w: 4.4, push: 2.6 }, { color: C.darkDeep, alpha: 0.6, w: 3, dir: dn }],
                    light: { color: i < 3 ? C.amberLight : C.darkSheen, alpha: i < 3 ? 0.8 : 0.75, w: 3.2, push: 1.6 },
                    detail: (g) => {
                        for (const h of felt) hairline(g, h, 0.3, '#f6edd2', 0.9);
                        for (const h of hairs) hairline(g, h, 0.2, i < 3 ? C.amberLight : C.darkSheen, 0.6);
                        // the lacquer's gleam along the back
                        soft(g, top, { color: i < 3 ? '#fff0c0' : '#d6b8a0', alpha: 0.55, w: 0.5, blur: 1 });
                    },
                });
            }
        }, C.ink);

        // ---- near legs: under the thorax's fur
        B.outlined(0.42, () => {
            leg(LEGS.fore, LW);
            leg(LEGS.mid, LW);
            leg(LEGS.hind, HW);
            // the pollen load in the basket of the hind shin
            const a = LEGS.hind[1], b = LEGS.hind[2], c = mixP(a, b, 0.62), ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
            const lump = S.ellipse(c[0] - 0.5 * Math.sin(ang), c[1] + 0.5 * Math.cos(ang), 3.4, 2.5, 22, ang).map(([x, y], i) => [x + 0.22 * Math.sin(i * 2.1), y + 0.22 * Math.cos(i * 1.7)]);
            const grains = [];
            for (let i = 0; i < 26; i++) {
                const aa = rnd() * TAU, rr = Math.sqrt(rnd());
                grains.push([Wp([c[0] + Math.cos(aa) * 2.6 * rr, c[1] + Math.sin(aa) * 2.6 * rr]), rnd()]);
            }
            B.piece(PP(lump), {
                fill: C.pollen, line: 0.45, ink: C.ink, rim: C.pollenDeep,
                cast: { blur: 1, dx: 0.5, dy: 0.7, color: 'rgba(14,8,10,0.6)' },
                shade: { color: C.pollenDeep, alpha: 0.95, w: 2.2, push: 1.2 },
                light: { color: C.pollenLight, alpha: 0.95, w: 1.8, push: 0.8 },
                detail: (g) => {
                    for (const [p, r] of grains) disc(g, p, 0.22 + r * 0.2, r > 0.5 ? C.pollenLight : C.pollenDeep, 0.6);
                },
            });
        }, C.ink);

        // ---- thorax: a ball of fur
        const TC = [7.4, -1.1], TR = [7.7, 6.9];
        const fur = (cx, cy, rx, ry, n, amp) => {
            const pts = [];
            for (let i = 0; i < n; i++) {
                const a0 = (i / n) * TAU, a1 = ((i + 0.62) / n) * TAU, j = 1 + amp * (0.35 + 0.65 * rnd());
                pts.push([cx + Math.cos(a0) * rx * 0.97, cy + Math.sin(a0) * ry * 0.97], [cx + Math.cos(a1) * rx * j, cy + Math.sin(a1) * ry * j]);
            }
            return pts;
        };
        const hairs = (cx, cy, rx, ry, n, len, crown) => {
            const out = [];
            for (let i = 0; i < n; i++) {
                const a = rnd() * TAU, rr = Math.sqrt(rnd()), p = [cx + Math.cos(a) * rx * rr, cy + Math.sin(a) * ry * rr];
                const d = norm([p[0] - crown[0] + (rnd() - 0.5) * 2.4, p[1] - crown[1] + (rnd() - 0.5) * 2.4]), l = len * (0.6 + 0.8 * rnd());
                out.push([Wp(p), Wp([p[0] + d[0] * l, p[1] + d[1] * l]), rnd()]);
            }
            return out;
        };
        const drawHairs = (g, list, cols, w, c, rad) => {
            g.lineCap = 'round';
            for (const [a, b, r] of list) {
                const t = ((a[0] - c[0]) * LIT[0] + (a[1] - c[1]) * LIT[1]) / rad + (r - 0.5) * 0.9;
                hairline(g, [a, b], w * (0.7 + 0.6 * r), t > 0.2 ? cols[2] : t > -0.4 ? cols[1] : cols[0], 0.6 + 0.4 * r);
            }
        };
        const thHairs = hairs(TC[0], TC[1], TR[0] * 0.96, TR[1] * 0.96, 230, 2.4, [TC[0] + 1.5, TC[1] - 1]);
        const tc = Wp(TC);
        B.outlined(0.62, () => {
            B.piece(PP(fur(TC[0], TC[1], TR[0], TR[1], 40, 0.13)), {
                fill: C.fur, line: 0.55, ink: C.ink, rim: C.furDark,
                cast: { blur: 1.6, dx: 0.6, dy: 0.9, color: 'rgba(14,8,10,0.6)' },
                shade: [{ color: C.furDeep, alpha: 0.95, w: 5.5, push: 3.4 }, { color: C.furDark, alpha: 0.85, w: 3.2, push: 1.4 }],
                light: { color: C.furLight, alpha: 0.9, w: 4.4, push: 2.2 },
                detail: (g) => {
                    // the bald boss of the back, dark through the fur
                    soft(g, W([[TC[0] - 2.2, TC[1] - 3.4], [TC[0] + 2.2, TC[1] - 3.8]]), { color: C.furDark, alpha: 0.5, w: 2.2, blur: 2 });
                    drawHairs(g, thHairs, [C.furDark, C.furDeep, C.furLight], 0.3, tc, TR[0]);
                },
            });
        }, C.ink);

        // ---- head
        const head = S.curve([[14.4, -4.6], [16.6, -6], [18.9, -4.7], [20.3, -1.6], [20.5, 1.4], [19.6, 4.3], [17.6, 5.6], [15.2, 4.4], [13.6, 0.6]], true, 7);
        const hc = Wp([17, -0.4]);
        const hdHairs = hairs(17, 0, 3, 5, 60, 1.3, [17.6, -0.6]);
        const tongue = feed ? S.curve([[18.4, 5], [19.6, 9], [20.4, 12.4], [20.5, 14.6]], false, 6) : S.curve([[18.4, 5.2], [17, 7], [15.2, 7.4], [13.8, 6.6]], false, 6);
        B.mark('mouth', P(tongue[tongue.length - 1]));
        B.outlined(0.55, () => {
            B.piece(PP(strip(tongue, (u) => 0.55 - 0.3 * u).poly), { fill: '#6a2f22', line: 0.36, ink: C.ink, light: { color: '#c8785a', alpha: 0.9, w: 0.5, push: 0.15 } });
            B.piece(PP(head), {
                fill: C.dark, line: 0.55, ink: C.ink, rim: C.darkDeep,
                cast: { blur: 1.2, dx: 0.4, dy: 0.6, color: 'rgba(60,30,10,0.6)' },
                shade: { color: C.darkDeep, alpha: 0.9, w: 3, push: 1.6 },
                light: { color: C.darkSheen, alpha: 0.9, w: 2.4, push: 1 },
                detail: (g) => drawHairs(g, hdHairs, [C.furDeep, '#b08a4e', C.hair], 0.22, hc, 4),
            });
            // the mandible, amber-brown, under the face
            B.piece(PP(S.curve([[18.6, 3.2], [20.4, 3.3], [20.9, 5], [19.4, 6], [18.2, 5]], true, 5)), {
                fill: '#7a4a22', line: 0.4, ink: C.ink, shade: { color: C.darkDeep, alpha: 0.8, w: 0.9 }, light: { color: '#d99a52', alpha: 0.9, w: 0.7 },
            });
            // the compound eye
            const eye = S.ellipse(17.5, -1.2, 2, 3.4, 26, -0.16), ec = Wp([17.5, -1.2]);
            const facets = [];
            for (let i = 0; i < 60; i++) {
                const a = rnd() * TAU, rr = Math.sqrt(rnd());
                facets.push(Wp(turn([Math.cos(a) * 1.8 * rr, Math.sin(a) * 3.1 * rr], -0.16).map((v, j) => v + (j ? -1.2 : 17.5))));
            }
            B.piece(PP(eye), {
                fill: C.eye, line: 0.45, ink: '#0c0910', rim: '#0c0910',
                shade: { color: '#08060c', alpha: 0.9, w: 1.6 },
                light: { color: C.eyeSheen, alpha: 0.85, w: 1.5, push: 0.5 },
                detail: (g) => {
                    for (const p of facets) disc(g, p, 0.16, '#6d5f86', 0.5);
                    // the fine hairs that stand between the facets
                    for (let i = 0; i < facets.length; i += 3) hairline(g, [facets[i], [facets[i][0] + LIT[0] * 0.5 + 0.2, facets[i][1] + LIT[1] * 0.5 - 0.3]], 0.12, '#cdbf9a', 0.55);
                    // gloss: a short fat streak and a dash
                    const u = [-LIT[1], LIT[0]], h = [ec[0] + LIT[0] * 1.1, ec[1] + LIT[1] * 1.9];
                    hairline(g, [[h[0] - u[0] * 0.7, h[1] - u[1] * 0.7], [h[0] + u[0] * 0.7, h[1] + u[1] * 0.7]], 0.62, '#f4efff', 0.9);
                    disc(g, [h[0] + u[0] * 1.3 - LIT[0] * 0.5, h[1] + u[1] * 1.3 - LIT[1] * 0.5], 0.2, '#f4efff', 0.8);
                },
            });
            // an ocellus on the crown
            B.piece(PP(S.ellipse(17.2, -5.5, 0.62, 0.5, 10)), { fill: '#5a4032', line: 0.3, ink: C.ink, light: { color: '#f2d9b0', alpha: 0.9, w: 0.4 } });
        }, C.ink);
        B.outlined(0.36, () => antenna(0, 0, 0, false), C.ink);

        // ---- near wings, over the back
        if (feed) {
            wing(BEE_HIND, BEE_HIND_V, [4.6, -5.2], -166, 21, 7, true, { far: true });
            wing(BEE_FORE, BEE_FORE_V, [5.8, -5.8], -173.5, 31, 10, true);
        } else {
            // a ghost of the beat, then the wings themselves
            wing(BEE_FORE, [], [6, -6.4], -131, 30, 11, false, { far: true, blur: 1.6 });
            wing(BEE_HIND, BEE_HIND_V, [3.6, -5.8], -142, 21.5, 8.4, false, { blur: 0.8 });
            wing(BEE_FORE, BEE_FORE_V, [6, -6.4], -117, 31, 11.4, false, { blur: 0.8 });
        }
        // the tegula: a small amber scale over the wing's root
        B.outlined(0.4, () => B.piece(PP(S.ellipse(5.9, -6, 1.25, 0.95, 12, -0.3)), {
            fill: '#9a5a1e', line: 0.4, ink: C.ink, shade: { color: C.furDark, alpha: 0.8, w: 0.9 }, light: { color: '#f3c877', alpha: 0.95, w: 0.7 },
        }), C.ink);
        B.mark('feet', [LEGS.fore, LEGS.mid, LEGS.hind].map((J) => P(J[J.length - 1])));
    }
    KINDS.bee = { make: beeMake, defaults: { pose: 'fly' }, key: (q) => q.pose, cast: { blur: 5, dx: 5, dy: 7, color: 'rgba(16,14,34,0.3)' } };

    // ================================================================== seven-spot ladybird
    const LADY = {
        ink: '#12101c',
        red: [[0, '#4a0c16'], [0.22, '#86151b'], [0.45, '#bd2a20'], [0.66, '#dc452b'], [0.85, '#ee7a50'], [1, '#f9bd9c']],
        black: '#1c1a28', blackDeep: '#0a0912', blackSheen: '#7f83ad', white: '#efe7d0', whiteShade: '#9c98b4',
    };
    function ladybirdMake(B, o) {
        const C = LADY, k = B.k, rnd = Motion.rng('ladybird/' + o.seed);
        // ---- legs and antennae, just showing
        B.outlined(0.3, () => {
            for (const sg of [-1, 1]) {
                // femur, tibia, and a tarsus of three small joints with its claws
                for (const J of [[[5, 3.2], [7.4, 5.9], [8.6, 7.4], [9.9, 7.6]], [[0.8, 5.2], [1, 7.9], [-0.2, 9.4], [-1.4, 10]], [[-4, 4.6], [-6.3, 6.9], [-8, 7.4], [-9.4, 8.2]]]) {
                    const Q = J.map(([x, y]) => [x, y * sg]);
                    for (const [a, b, w0, w1] of [[Q[2], Q[3], 0.2, 0.14], [Q[1], Q[2], 0.34, 0.22], [Q[0], Q[1], 0.52, 0.4]]) {
                        B.piece(strip(range(0, 1, 4).map((u) => mixP(a, b, u)), (u) => lerp(w0, w1, u) * (0.85 + 0.3 * Math.sin(u * Math.PI))).poly, { fill: C.black, line: 0.26, ink: C.ink, rimA: 0.2, light: { color: C.blackSheen, alpha: 0.9, w: 0.34, push: 0.1 } });
                    }
                    const e = Q[3], d = norm([Q[3][0] - Q[2][0], Q[3][1] - Q[2][1]]);
                    B.ink([e, [e[0] + d[0] * 0.5 - d[1] * 0.3, e[1] + d[1] * 0.5 + d[0] * 0.3]], { w: 0.16, color: C.ink, taper: [0, 1] });
                    B.ink([e, [e[0] + d[0] * 0.5 + d[1] * 0.3, e[1] + d[1] * 0.5 - d[0] * 0.3]], { w: 0.16, color: C.ink, taper: [0, 1] });
                }
                const ant = S.curve([[8.6, 1.5 * sg], [9.9, 2.5 * sg], [10.5, 3.7 * sg]], false, 6);
                B.piece(strip(ant, (u) => 0.16 + 0.3 * smooth(0.55, 1, u)).poly, { fill: '#5a3a26', line: 0.24, ink: C.ink, rimA: 0.2, light: { color: '#d9a878', alpha: 0.9, w: 0.3, push: 0.1 } });
            }
        }, C.ink);
        // ---- the wing cases: one lacquered dome
        const ely = S.curve([[4.5, 0], [4, -3.6], [1.9, -6.2], [-2, -6.95], [-6, -5.6], [-8.7, -2.7], [-9.5, 0], [-8.7, 2.7], [-6, 5.6], [-2, 6.95], [1.9, 6.2], [4, 3.6]], true, 9);
        const SPOTS = [[2.7, 0, 1.5, 1.75], [1.3, 4.25, 1.05, 1], [1.3, -4.25, 1.05, 1], [-2.2, 2.45, 1.75, 1.6], [-2.2, -2.45, 1.75, 1.6], [-5.7, 3.5, 1.3, 1.15], [-5.7, -3.5, 1.3, 1.15]]
            .map(([x, y, rx, ry]) => [x + (rnd() - 0.5) * 0.3, y + (rnd() - 0.5) * 0.2 * (y ? 1 : 0), rx * (0.94 + rnd() * 0.12), ry * (0.94 + rnd() * 0.12)]);
        const dc = B.pt([-2.4, 0]), u = [-LIT[1], LIT[0]];
        const pits = [];
        for (let i = 0; i < 90; i++) pits.push(B.pt([-9 + rnd() * 13, (rnd() - 0.5) * 13]));
        B.outlined(0.5, () => {
            B.vol(ely, {
                ramp: C.red, seed: 'lady' + o.seed, relief: 1.05, soft: 0.95,
                // the seam between the cases, and the cases' fine rim
                height: (x, y, m) => -0.42 * Math.exp(-Math.pow(y / 0.34, 2)) * smooth(4.2, 3, x) - 0.5 * smooth(0.16, 0, m),
                spec: { amp: 0.5, power: 22, from: 0.5, to: 0.95, ragged: 0.05, color: '#fff1e4' },
                tint: (x, y, tone, rgb, m) => {
                    // red thrown back into the rim of the shadow side
                    const bounce = smooth(0.3, 0.1, tone) * smooth(0.3, 0.02, m) * 0.5;
                    rgb[0] += (214 - rgb[0]) * bounce;
                    rgb[1] += (70 - rgb[1]) * bounce;
                    rgb[2] += (52 - rgb[2]) * bounce;
                    // the white patches beside the scutellar spot
                    for (const sg of [-1, 1]) {
                        const d = Math.hypot((x - 3.5) / 1.05, (y - sg * 2.05) / 0.95), q = smooth(1.05, 0.8, d + 0.12 * S.noise2(x * 2, y * 2, 3));
                        rgb[0] += (232 * (0.62 + 0.4 * tone) - rgb[0]) * q;
                        rgb[1] += (224 * (0.62 + 0.4 * tone) - rgb[1]) * q;
                        rgb[2] += (206 * (0.66 + 0.4 * tone) - rgb[2]) * q;
                    }
                    // the seven spots: black lacquer that still takes the light
                    let sp = smooth(0.2, 0.1, Math.abs(y)) * smooth(4.3, 3.4, x) * 0.75;
                    for (const [sx, sy, rx, ry] of SPOTS) {
                        const d = Math.hypot((x - sx) / rx, (y - sy) / ry) + 0.07 * S.noise2(x * 1.7, y * 1.7, 5);
                        sp = Math.max(sp, smooth(1.05, 0.9, d));
                    }
                    if (sp > 0) {
                        const v = 14 + 150 * Math.pow(Math.max(0, tone - 0.42), 1.6);
                        rgb[0] += (v * 0.9 + 6 - rgb[0]) * sp;
                        rgb[1] += (v * 0.9 + 4 - rgb[1]) * sp;
                        rgb[2] += (v * 1.1 + 14 - rgb[2]) * sp;
                    }
                },
                over: (g) => {
                    // punctures in the lacquer
                    for (const p of pits) disc(g, p, 0.07, '#5a0c12', 0.35);
                    // gloss: a short fat streak that follows the dome, and a dash after it
                    const h = [dc[0] + LIT[0] * 3.3, dc[1] + LIT[1] * 3.3];
                    const arc = range(-0.36, 0.36, 8).map((a) => {
                        const v = turn(LIT, a);
                        return [dc[0] + v[0] * 3.3, dc[1] + v[1] * 3.3];
                    });
                    soft(g, arc, { color: '#fff4e8', alpha: 0.5, w: 0.9, blur: 0.9 });
                    hairline(g, arc.slice(1, -1), 0.72, '#fff6ec', 0.92);
                    const v2 = turn(LIT, 0.72);
                    hairline(g, [[dc[0] + v2[0] * 3.25, dc[1] + v2[1] * 3.25], [dc[0] + turn(LIT, 0.82)[0] * 3.2, dc[1] + turn(LIT, 0.82)[1] * 3.2]], 0.5, '#fff6ec', 0.85);
                    void h;
                    void u;
                },
            }, {
                line: 0.5, ink: C.ink, rim: '#3a0810',
                shade: { color: '#3a0714', alpha: 0.5, w: 2.4, push: 1 },
            });
        }, C.ink);
        // ---- pronotum and head
        B.outlined(0.45, () => {
            const pro = S.curve([[3.5, -4.5], [5.4, -4.5], [7, -3.3], [7.7, -1.6], [7.8, 0], [7.7, 1.6], [7, 3.3], [5.4, 4.5], [3.5, 4.5], [3.9, 2.2], [4.2, 0], [3.9, -2.2]], true, 7);
            const pc = B.pt([5.6, 0]);
            // the head first: the pronotum's front edge lies over it
            const hd = S.curve([[7.3, -2.3], [8.7, -2.1], [9.5, -1], [9.6, 0], [9.5, 1], [8.7, 2.1], [7.3, 2.3]], true, 6);
            B.piece(hd, {
                fill: C.black, line: 0.4, ink: C.ink, rim: C.blackDeep,
                shade: { color: C.blackDeep, alpha: 0.9, w: 1.2 }, light: { color: C.blackSheen, alpha: 0.7, w: 1, push: 0.3 },
                detail: (g) => {
                    for (const sg of [-1, 1]) {
                        disc(g, B.pt([8.5, sg * 0.95]), 0.42, C.white, 0.95);
                        disc(g, B.pt([8.05, sg * 2.0]), 0.5, '#06050a', 1);
                        disc(g, [B.pt([8.05, sg * 2.0])[0] + LIT[0] * 0.2, B.pt([8.05, sg * 2.0])[1] + LIT[1] * 0.2], 0.14, '#c9cdf0', 0.9);
                    }
                },
            });
            B.piece(pro, {
                fill: C.black, line: 0.45, ink: C.ink, rim: C.blackDeep,
                cast: { blur: 0.9, dx: 0.3, dy: 0.4, color: 'rgba(30,4,10,0.6)' },
                shade: { color: C.blackDeep, alpha: 0.95, w: 2.2, push: 1 },
                light: { color: C.blackSheen, alpha: 0.75, w: 1.8, push: 0.7 },
                detail: (g) => {
                    // the white corners
                    for (const sg of [-1, 1]) {
                        const patch = B.T(S.curve([[5, 4.3 * sg], [6.9, 3.25 * sg], [7.55, 1.9 * sg], [6.3, 2.2 * sg], [5.2, 3 * sg]], true, 6));
                        g.fillStyle = C.white;
                        g.beginPath();
                        S.trace(g, patch);
                        g.fill();
                        g.save();
                        g.clip();
                        S.spray(g, patch, { color: C.whiteShade, alpha: 0.8, w: 0.8 });
                        g.restore();
                    }
                    // gloss
                    const a = range(-0.5, 0.3, 6).map((t) => {
                        const v = turn(LIT, t);
                        return [pc[0] + v[0] * 1.5, pc[1] + v[1] * 2.6];
                    });
                    hairline(g, a, 0.4, '#dfe3ff', 0.75);
                },
            });
            // the scutellum: a tiny black triangle where the cases meet
            B.piece([[3.9, -0.7], [3.9, 0.7], [2.9, 0]], { fill: C.blackDeep, line: 0.2, ink: C.ink, rimA: 0 });
        }, C.ink);
        B.mark('feet', [[9.9, 7.6], [9.9, -7.6], [-1.4, 10], [-1.4, -10], [-9.4, 8.2], [-9.4, -8.2]]);
        B.mark('mouth', [9.6, 0]);
        void k;
    }
    KINDS.ladybird = { make: ladybirdMake, cast: { blur: 2.2, dx: 1.5, dy: 2, color: 'rgba(14,12,30,0.5)' } };

    // ================================================================== banded snail
    const SNAIL = {
        ink: '#1a1826',
        shell: [[0, '#4a3312'], [0.22, '#8a6a2a'], [0.45, '#c7a44a'], [0.66, '#e4ca72'], [0.85, '#f4e5a4'], [1, '#fffbe0']],
        skin: '#a39876', skinLight: '#ddd4ac', skinDeep: '#5c5440', skinDark: '#38342c', sole: '#cfc7a0',
    };
    function snailMake(B, o) {
        const C = SNAIL, k = B.k, rnd = Motion.rng('snail/' + o.seed);
        const trail = o.trail ?? 0;
        // ---- the slime: a wet ribbon behind the tail
        if (trail > 0) {
            const mid = range(0, 1, 24).map((u) => [-29 - trail * u, 12.1 + 0.5 * Math.sin(u * 7) * u]);
            const st0 = strip(mid, (u) => (1.05 - 0.7 * u) * (1 + 0.22 * Math.sin(u * 23))), pts = B.T(st0.poly), ln = B.T(mid);
            const glints = [];
            for (let i = 0; i < trail * 0.7; i++) {
                const u = rnd(), p = mid[Math.floor(u * 24)];
                glints.push([B.pt([p[0] + rnd() * 2, p[1] - 0.45 + rnd() * 0.8]), 0.4 + rnd() * 1.1, rnd()]);
            }
            B.add(pts, (g) => {
                const gr = g.createLinearGradient(ln[0][0], ln[0][1], ln[24][0], ln[24][1]);
                gr.addColorStop(0, 'rgba(206,220,238,0.34)');
                gr.addColorStop(0.7, 'rgba(206,220,238,0.18)');
                gr.addColorStop(1, 'rgba(214,226,240,0)');
                g.fillStyle = gr;
                g.beginPath();
                S.trace(g, pts);
                g.fill();
                const ax = norm([ln[24][0] - ln[0][0], ln[24][1] - ln[0][1]]);
                for (const [p, l, r] of glints) hairline(g, [p, [p[0] + ax[0] * l, p[1] + ax[1] * l]], 0.16 + 0.14 * r, '#fbfdff', 0.3 + 0.5 * r);
                hairline(g, B.T(st0.R.slice(0, 18)), 0.2, '#56607a', 0.35);
            });
        }
        // ---- the body
        const TOP = [[-32, 11.5], [-25, 9.5], [-17, 7], [-11, 3.4], [-5, 1.8], [2, 3], [8, 1.6], [13, -2.4], [17.5, -6.6], [22, -8.6], [26, -7.4], [28.6, -3.8]];
        const BOT = [[28.2, 0.4], [26.2, 3.6], [24.8, 8.4], [23, 11.7], [10, 12.3], [-5, 12.1], [-20, 12.4]];
        const body = S.curve([...TOP, ...BOT], true, 8);
        const topF = pathOf(TOP), yTop = (x) => {
            // the back's height over x (TOP runs left to right)
            let lo = 0, hi = 1;
            for (let i = 0; i < 18; i++) {
                const m = (lo + hi) / 2;
                if (topF.at(m)[0] < x) lo = m;
                else hi = m;
            }
            return topF.at(lo)[1];
        };
        // tentacles: the far pair first
        const tent = (J, w0, bulb, farOne) => {
            const line = S.curve(J, false, 8), st0 = strip(line, (u) => w0 * (1 - 0.5 * u) + bulb * smooth(0.8, 1, u));
            B.piece(st0.poly, {
                fill: farOne ? C.skinDeep : C.skin, line: 0.42, ink: C.ink, rim: C.skinDark, rimA: 0.35,
                shade: { color: C.skinDark, alpha: 0.7, w: 1 }, light: { color: C.skinLight, alpha: farOne ? 0.5 : 0.95, w: 0.8, push: 0.25 },
                detail: (g) => {
                    const tip = B.pt(line[line.length - 1]);
                    if (bulb > 0.5) {
                        disc(g, tip, 0.52, '#0c0b12', 0.95);
                        disc(g, [tip[0] + LIT[0] * 0.2, tip[1] + LIT[1] * 0.2], 0.15, '#e6ecff', 0.9);
                    }
                    // the tentacle's rings
                    const L2 = B.T(line);
                    for (let i = 2; i < L2.length - 2; i += 2) {
                        const p = L2[i], q = L2[i + 1], t = norm([q[0] - p[0], q[1] - p[1]]);
                        hairline(g, [[p[0] - t[1] * w0, p[1] + t[0] * w0], [p[0] + t[1] * w0, p[1] - t[0] * w0]], 0.16, C.skinDark, 0.3);
                    }
                },
            });
        };
        B.outlined(0.5, () => {
            tent([[22.6, -8], [23.2, -14], [24.6, -19.6], [26.6, -23]], 0.72, 0.7, true);
            tent([[27.6, -1.2], [29.6, -0.4], [30.8, 1.2]], 0.52, 0.22, true);
        }, C.ink);
        // tubercles: a net of grooves round small bumps, in rows that follow the body
        const bumps = [];
        for (let x = -29; x < 28; x += 1.5) {
            const y0 = yTop(x) + 0.5, y1 = 10.4, rows = Math.max(1, Math.round((y1 - y0) / 1.25));
            for (let j = 0; j <= rows; j++) {
                if (rnd() < 0.08) continue;
                const v = j / Math.max(1, rows), px = x + (j % 2 ? 0.75 : 0) + (rnd() - 0.5) * 0.5, py = lerp(y0, y1, v) + (rnd() - 0.5) * 0.3;
                if (px > -15 && px < 4 && py < 5) continue; // under the shell
                bumps.push([B.pt([px, py]), 0.5 + 0.28 * rnd() - 0.12 * v, rnd(), v]);
            }
        }
        const ax = B.pt([1, 0]);
        B.outlined(0.62, () => {
            B.piece(body, {
                fill: C.skin, line: 0.6, ink: C.ink, rim: C.skinDark,
                shade: [{ color: C.skinDeep, alpha: 0.9, w: 5, push: 3 }, { color: C.skinDark, alpha: 0.6, w: 1.8 }],
                light: { color: C.skinLight, alpha: 0.85, w: 3.6, push: 1.6 },
                detail: (g) => {
                    // a darker stripe along the back of the neck
                    soft(g, B.T([[7, 1.4], [13, -3], [19, -7], [25, -6.6]]), { color: C.skinDeep, alpha: 0.55, w: 1.5, blur: 1.5 });
                    for (const [p, r, t, v] of bumps) {
                        g.globalAlpha = 0.5 + 0.3 * t;
                        g.fillStyle = mix(C.skin, C.skinLight, 0.35 + 0.5 * t * (1 - v * 0.6));
                        g.beginPath();
                        g.ellipse(p[0], p[1], r * 1.25, r * 0.8, Math.atan2(ax[1], ax[0]), 0, 6.3);
                        g.fill();
                        g.globalAlpha = 0.45;
                        g.strokeStyle = C.skinDark;
                        g.lineWidth = 0.14;
                        g.beginPath();
                        g.arc(p[0], p[1], r * 1.05, Math.atan2(SH[1], SH[0]) - 1.1, Math.atan2(SH[1], SH[0]) + 1.1);
                        g.stroke();
                    }
                    g.globalAlpha = 1;
                    // the foot's fringe along the sole
                    const sole = B.T(range(-28, 23, 50).map((x) => [x, 10.9 + 0.12 * Math.sin(x * 1.9)]));
                    soft(g, sole.map(([x, y]) => [x + B.pt([0, 1])[0] * 1.1, y + B.pt([0, 1])[1] * 1.1]), { color: C.sole, alpha: 0.75, w: 1.2, blur: 0.7 });
                    hairline(g, sole, 0.24, C.skinDark, 0.6);
                    for (let x = -27; x < 23; x += 0.9) hairline(g, B.T([[x, 11], [x + 0.25, 12.3]]), 0.14, C.skinDark, 0.4);
                    // wet lights on the neck and the head
                    for (const [x, y, l] of [[13.6, -3.2, 1.5], [18.2, -6.9, 1.8], [22.8, -8, 1.3], [26.6, -5.6, 0.8], [8.4, 1.6, 1.1], [-21, 8.3, 1.3], [-26.5, 10.1, 0.9]]) {
                        const p = B.pt([x, y + 0.5]);
                        hairline(g, [p, [p[0] + ax[0] * l, p[1] + ax[1] * l]], 0.36, '#fbfbf0', 0.8);
                    }
                    // the mouth
                    hairline(g, B.T([[28.3, 0.5], [27, 1.3], [26.2, 1]]), 0.3, C.skinDark, 0.8);
                },
            });
        }, C.ink);
        // ---- the shell
        const cx = -5, cy = -7.5, Rend = 16, b = 0.115, phiEnd = 62 * DEG;
        const rOut = (phi) => Rend * Math.exp(b * (phi - phiEnd));
        const sp = (phi, r) => [cx + Math.cos(phi) * r, cy + Math.sin(phi) * r];
        const outline = [...range(phiEnd - TAU, phiEnd, 80).map((phi) => sp(phi, rOut(phi))), sp(phiEnd + 0.05, rOut(phiEnd) * 0.8)];
        const whorl = (x, y) => {
            const dx = x - cx, dy = y - cy, r = Math.hypot(dx, dy) + 1e-6;
            let th = Math.atan2(dy, dx);
            while (th > phiEnd) th -= TAU;
            while (th <= phiEnd - TAU) th += TAU;
            const q = Math.max(0, Math.log(rOut(th) / r) / (TAU * b)), n = Math.floor(q);
            return { n, f: 1 - (q - n), phi: th - TAU * n, r };
        };
        const rests = [0.4, 1.9, 3.1, 4.4].map((v) => phiEnd - v - rnd() * 0.3);
        const sc = B.pt([cx, cy]);
        B.outlined(0.62, () => {
            // the mantle's collar: a pale cushion along the lip, where the body comes out
            const lipA = sp(phiEnd, rOut(phiEnd) * 1.0), lipB = sp(phiEnd + 0.02, rOut(phiEnd - TAU) * 1.02);
            const lipLine = S.curve([lipA, mixP(lipA, lipB, 0.35).map((v, i) => v + (i ? -0.3 : 1.5)), mixP(lipA, lipB, 0.72).map((v, i) => v + (i ? -0.2 : 1.1)), lipB], false, 8);
            B.piece(strip(lipLine.map(([x, y]) => [x + 1.1, y + 0.5]), (u) => 1.5 * Math.sin(Math.PI * (0.12 + 0.8 * u)) + 0.3).poly, {
                fill: '#cfc59c', line: 0.4, ink: C.ink, rim: C.skinDeep, shade: { color: C.skinDeep, alpha: 0.85, w: 1.2 }, light: { color: '#f7f0cc', alpha: 0.9, w: 0.9 },
            });
            B.vol(outline, {
                ramp: C.shell, seed: 'shell' + o.seed, relief: 0.5, soft: 0.92,
                height: (x, y) => {
                    const w = whorl(x, y);
                    return 0.2 * w.r * Math.sqrt(Math.max(0, 4 * w.f * (1 - w.f))) + 0.05 * Math.sin(w.phi * 40);
                },
                spec: { amp: 0.45, power: 16, from: 0.45, to: 0.95, ragged: 0.2, color: '#fffbe6' },
                stroke: { amp: 0.04, freq: 0.3, tone: 5 },
                tint: (x, y, tone, rgb, m) => {
                    const w = whorl(x, y), fade = smooth(3.4, 1.6, w.n + (1 - w.f));
                    // growth lines, and the rests where the snail stopped growing
                    let v = 1 + 0.06 * Math.sin(w.phi * 52 + 2.4 * Math.sin(w.f * 3)) + 0.04 * S.noise2(w.phi * 9, w.f * 3, 7);
                    for (const r0 of rests) v -= 0.3 * Math.exp(-Math.pow((w.phi - r0 - 0.1 * w.f) / 0.022, 2));
                    // the bands
                    const wob = 0.02 * S.noise2(w.phi * 3, 1.5, 9);
                    const band = Math.max(
                        smooth(0.16, 0.2, w.f + wob) * smooth(0.3, 0.26, w.f + wob),
                        smooth(0.4, 0.44, w.f + wob) * smooth(0.55, 0.51, w.f + wob),
                        smooth(0.66, 0.7, w.f + wob) * smooth(0.93, 0.89, w.f + wob),
                    ) * (0.35 + 0.65 * fade) * (0.86 + 0.14 * S.noise2(w.phi * 14, w.f * 9, 11));
                    const bk = 0.42 + 0.9 * tone;
                    rgb[0] = (rgb[0] + (92 * bk - rgb[0]) * band) * v;
                    rgb[1] = (rgb[1] + (50 * bk - rgb[1]) * band) * v;
                    rgb[2] = (rgb[2] + (32 * bk - rgb[2]) * band) * v;
                    // the suture between whorls, and the worn apex
                    const su = smooth(0.1, 0, w.f) * 0.45 + smooth(0.06, 0, m) * 0.2;
                    rgb[0] *= 1 - su;
                    rgb[1] *= 1 - su;
                    rgb[2] *= 1 - su * 0.8;
                    const ap = smooth(2.6, 4, w.n + (1 - w.f)) * 0.35;
                    rgb[0] += (150 - rgb[0]) * ap;
                    rgb[1] += (120 - rgb[1]) * ap;
                    rgb[2] += (96 - rgb[2]) * ap;
                },
                over: (g) => {
                    // gloss on the body whorl: a short fat streak and a dash
                    const arc = range(-0.36, 0.26, 8).map((a) => {
                        const v = turn(LIT, a);
                        return [sc[0] + v[0] * 9.4, sc[1] + v[1] * 9.4];
                    });
                    soft(g, arc, { color: '#fffbe8', alpha: 0.5, w: 1.3, blur: 1.4 });
                    hairline(g, arc.slice(2, -1), 0.85, '#fffdf0', 0.88);
                    const v2 = turn(LIT, 0.5), v3 = turn(LIT, 0.6);
                    hairline(g, [[sc[0] + v2[0] * 9.3, sc[1] + v2[1] * 9.3], [sc[0] + v3[0] * 9.2, sc[1] + v3[1] * 9.2]], 0.62, '#fffdf0', 0.82);
                },
            }, {
                line: 0.6, ink: C.ink, rim: '#3a2810',
                cast: { blur: 2.4, dx: 1, dy: 1.6, color: 'rgba(30,24,20,0.6)' },
                shade: [{ color: '#5a3a14', alpha: 0.55, w: 4, push: 2 }, { color: '#2a1c10', alpha: 0.5, w: 1.6 }],
                detail: (g) => {
                    // the spiral's line: the suture, drawn from the apex out
                    const sut = B.T(range(phiEnd - TAU * 4.4, phiEnd - TAU, 150).map((phi) => sp(phi, rOut(phi))));
                    S.ink(g, sut, { w: 0.55 * k, color: B.ic(C.ink, '#5a3a14'), taper: [1, 0.2], alpha: 0.85 });
                    S.ink(g, sut.map(([x, y]) => [x + LIT[0] * 0.45, y + LIT[1] * 0.45]), { w: 0.3, color: '#fff6c8', taper: [1, 0.6], alpha: 0.5 });
                },
            });
            // the lip: dark brown, turned out, widest where the whorl is
            B.piece(strip(lipLine, (u) => 0.95 * Math.sin(Math.PI * (0.1 + 0.75 * u)) + 0.16).poly, {
                fill: '#56301e', line: 0.34, ink: C.ink, rim: '#21100c',
                cast: { blur: 0.8, dx: -0.4, dy: -0.2, color: 'rgba(20,12,8,0.45)' },
                shade: { color: '#21100c', alpha: 0.85, w: 0.9 }, light: { color: '#c98e62', alpha: 0.95, w: 0.7, push: 0.2 },
            });
        }, C.ink);
        // the near tentacles, over everything
        B.outlined(0.5, () => {
            tent([[24.6, -8], [26.8, -13.4], [29.6, -18.2], [32.6, -20.6]], 0.76, 0.72, false);
            tent([[28, -0.6], [30.6, 0.8], [32, 2.8]], 0.55, 0.22, false);
        }, C.ink);
        B.mark('sole', [[-32, 12.4], [24, 12.4]]);
        B.mark('mouth', [28.2, 0.6]);
        B.mark('feet', [[-20, 12.4], [0, 12.3], [20, 12.2]]);
    }
    KINDS.snail = { make: snailMake, defaults: { trail: 0 }, key: (q) => q.trail, cast: { blur: 3, dx: 2, dy: 3, color: 'rgba(14,12,30,0.45)' } };

    // ================================================================== lizards
    // A body along a spine: at(u, w) is the point at fraction u of its length (0 the snout,
    // 1 the tail's tip) and w half-widths to the animal's right; frame(u) its point, the
    // unit vector towards the tail and the one to its right.
    function bodyOf(ctrl, hw) {
        const P = pathOf(ctrl, 24);
        const frame = (u) => {
            const p = P.at(u), d = P.dir(u);
            return { p, d, n: [d[1], -d[0]] };
        };
        const at = (u, w) => {
            const f = frame(u), h = hw(clamp(u)) * w;
            return [f.p[0] + f.n[0] * h, f.p[1] + f.n[1] * h];
        };
        // a point given in units: U from the snout along the spine, V to the right
        const on = (U, V) => {
            const f = frame(U / P.total);
            return [f.p[0] + f.n[0] * V, f.p[1] + f.n[1] * V];
        };
        return { at, on, frame, hw, total: P.total };
    }
    // A limb's joints: segs [[angle, length], …], angles from straight out to the side
    // (sg: −1 the animal's left, +1 its right), + towards the head.
    function limbOf(Bd, sg, u0, root, segs) {
        const f = Bd.frame(u0), h = [-f.d[0], -f.d[1]], n = [f.n[0] * sg, f.n[1] * sg];
        const dirOf = (a) => norm([n[0] * Math.cos(a) + h[0] * Math.sin(a), n[1] * Math.cos(a) + h[1] * Math.sin(a)]);
        const J = [Bd.at(u0, sg * root)];
        for (const [a, l] of segs) {
            const d = dirOf(a), p = J[J.length - 1];
            J.push([p[0] + d[0] * l, p[1] + d[1] * l]);
        }
        return { J, dirOf };
    }
    // joints → a line with eased corners
    const bendy = (J, n = 7) => {
        const out = [];
        for (let i = 0; i < J.length - 1; i++) for (let j = i ? 1 : 0; j <= n; j++) out.push(mixP(J[i], J[i + 1], j / n));
        return out.map((p, i) => (i === 0 || i === out.length - 1 ? p : mixP(p, mixP(out[i - 1], out[i + 1], 0.5), 0.5)));
    };
    // cellular noise: distances to the nearest and the second nearest of a jittered grid of points
    function cells(x, y, size, sd) {
        const gx = Math.floor(x / size), gy = Math.floor(y / size);
        let f1 = 1e9, f2 = 1e9, id = 0;
        for (let j = -1; j <= 1; j++) {
            for (let i = -1; i <= 1; i++) {
                const cx = (gx + i + 0.15 + 0.7 * S.hashI(gx + i, gy + j, 1, sd)) * size, cy = (gy + j + 0.15 + 0.7 * S.hashI(gx + i, gy + j, 2, sd)) * size;
                const d = Math.hypot(x - cx, y - cy);
                if (d < f1) {
                    f2 = f1;
                    f1 = d;
                    id = S.hashI(gx + i, gy + j, 3, sd);
                } else if (d < f2) f2 = d;
            }
        }
        return { f1, f2, id };
    }
    // a batch of small scales: [x, y, angle, ra, rb]; arcs open towards the head
    const scaleArcs = (g, list, color, alpha, w, a0 = -1.3, a1 = 1.3) => {
        g.globalAlpha = alpha;
        g.strokeStyle = color;
        g.lineWidth = w;
        g.lineCap = 'round';
        g.beginPath();
        for (const [x, y, an, ra, rb] of list) {
            const c = Math.cos(an), s = Math.sin(an);
            g.moveTo(x + c * ra * Math.cos(a0) - s * rb * Math.sin(a0), y + s * ra * Math.cos(a0) + c * rb * Math.sin(a0));
            g.ellipse(x, y, ra, rb, an, a0, a1);
        }
        g.stroke();
        g.globalAlpha = 1;
    };
    const scaleDots = (g, list, color, alpha, k = 1) => {
        g.globalAlpha = alpha;
        g.fillStyle = color;
        g.beginPath();
        for (const [x, y, an, ra, rb] of list) {
            g.moveTo(x + Math.cos(an) * ra * k, y + Math.sin(an) * ra * k);
            g.ellipse(x, y, ra * k, rb * k, an, 0, TAU);
        }
        g.fill();
        g.globalAlpha = 1;
    };

    // ------------------------------------------------------------------ ocellated lizard
    const LIZ = {
        ink: '#131a22',
        green: '#6ea23a', greenLight: '#c3dc68', greenDeep: '#2f5c2a', greenDark: '#15301e', yellow: '#e2e486',
        black: '#141a22', blue: '#2a7ad0', blueLight: '#93cdf6', blueDeep: '#143c78',
        belly: '#ece6b4', tail: '#8f8c58', tailDeep: '#4c4a30', head: '#86a23c', toe: '#9aa04e',
    };
    const LIZ_HW = [[0, 1.1], [0.012, 3.1], [0.03, 4.7], [0.055, 6.3], [0.092, 8.4], [0.118, 7.7], [0.146, 5.9], [0.18, 7.6], [0.27, 10.3], [0.34, 10.1], [0.41, 7.5], [0.46, 5.9], [0.55, 4.5], [0.7, 2.9], [0.85, 1.6], [0.96, 0.75], [1, 0.3]];
    const LIZ_POSES = [
        {
            spine: [[66, -16], [48, -13], [28, -4], [6, 5], [-14, 3], [-36, -9], [-56, -15], [-74, -8], [-84, 8], [-78, 24], [-62, 30]],
            // [side, attach, [[angle, length] × 3], toes fan offset]
            limbs: [[-1, 0.172, [[0.5, 11], [1.25, 10], [0.7, 4.6]]], [1, 0.172, [[-0.45, 11], [0.6, 10], [0.9, 4.6]]], [-1, 0.418, [[-0.5, 14], [-1.45, 14], [-0.3, 6.5]]], [1, 0.418, [[0.6, 14], [-0.7, 14], [0.45, 6.5]]]],
        },
        {
            spine: [[52, 22], [40, 8], [24, -4], [2, -6], [-18, 2], [-34, 16], [-52, 22], [-72, 14], [-82, -4], [-74, -22], [-56, -28], [-44, -20]],
            limbs: [[-1, 0.172, [[-0.4, 11], [0.7, 10], [0.9, 4.6]]], [1, 0.172, [[0.55, 11], [1.3, 10], [0.6, 4.6]]], [-1, 0.418, [[0.6, 14], [-0.7, 14], [0.45, 6.5]]], [1, 0.418, [[-0.5, 14], [-1.4, 14], [-0.3, 6.5]]]],
        },
    ];
    function lizardMake(B, o) {
        const C = LIZ, k = B.k, rnd = Motion.rng('lizard/' + o.seed + '/' + o.pose), sd = S.seedOf('lizard' + o.seed) & 255;
        const SP = LIZ_POSES[o.pose] ?? LIZ_POSES[0];
        const c0 = pathOf(SP.spine, 24).at(0.29);
        const Bd = bodyOf(SP.spine.map(([x, y]) => [x - c0[0], y - c0[1]]), (u) => S.track(LIZ_HW, u));
        const L = Bd.total, at = Bd.at, T = B.T, pt = B.pt;
        const angOf = (u) => {
            const d = pt(Bd.frame(u).d);
            return Math.atan2(d[1], d[0]);
        };
        const edge = (u0, u1, n, w) => range(u0, u1, n).map((u) => at(u, w));

        const uH = 0.128, Hd = (hx, hy) => Bd.on(hx, hy);
        // ---- limbs, under the body: the toes lowest
        const feet = [];
        const limb = ([sg, u0, segs], hind) => {
            const G = limbOf(Bd, sg, u0, 0.5, segs), J = G.J, footA = segs[2][0];
            feet.push(J[3]);
            const lens = hind ? [4.2, 6.6, 9.2, 12.4, 7.4] : [3.6, 5.2, 6.4, 6.8, 4.6];
            B.outlined(0.5, () => {
                lens.forEach((len, i) => {
                    // digit I is the inner one (towards the head); the hind foot's fifth sits back on the heel
                    const t = i / 4, a = footA + (hind ? lerp(0.75, -1.15, t) + (i === 4 ? -0.55 : 0) : lerp(1.05, -1.05, t));
                    const base = mixP(J[2], J[3], hind && i === 4 ? 0.35 : 0.86), d = G.dirOf(a), n2 = G.dirOf(a + Math.PI / 2), curl = (rnd() - 0.5) * 0.16 + (0.5 - t) * 0.12;
                    const b0 = [base[0] + n2[0] * (0.5 - t) * 1.6, base[1] + n2[1] * (0.5 - t) * 1.6];
                    const tip = [b0[0] + d[0] * len + n2[0] * len * curl, b0[1] + d[1] * len + n2[1] * len * curl];
                    const line = S.curve([b0, [b0[0] + d[0] * len * 0.52 - n2[0] * len * curl * 0.5, b0[1] + d[1] * len * 0.52 - n2[1] * len * curl * 0.5], tip], false, 6);
                    const st2 = strip(line, (u) => 0.72 - 0.36 * u + 0.1 * Math.sin(u * 9.4));
                    const tl = T(line);
                    B.piece(st2.poly, {
                        fill: C.toe, line: 0.4, ink: C.ink, rim: C.greenDark, rimA: 0.35,
                        shade: { color: C.greenDark, alpha: 0.8, w: 0.9 }, light: { color: C.yellow, alpha: 0.9, w: 0.7, push: 0.2 },
                        detail: (g) => {
                            // the rings of scales under each joint
                            for (let j = 1; j < tl.length - 1; j += 2) {
                                const p = tl[j], q = tl[j + 1], tt = norm([q[0] - p[0], q[1] - p[1]]);
                                hairline(g, [[p[0] - tt[1] * 0.7, p[1] + tt[0] * 0.7], [p[0] + tt[1] * 0.7, p[1] - tt[0] * 0.7]], 0.14, C.greenDark, 0.5);
                            }
                        },
                    });
                    // the claw
                    const cd = norm([tip[0] - line[line.length - 3][0], tip[1] - line[line.length - 3][1]]);
                    B.ink([tip, [tip[0] + cd[0] * 0.9 + n2[0] * curl * 2, tip[1] + cd[1] * 0.9 + n2[1] * curl * 2], [tip[0] + cd[0] * 1.7 + n2[0] * (curl * 6 + 0.3), tip[1] + cd[1] * 1.7 + n2[1] * (curl * 6 + 0.3)]], { w: 0.55, color: '#1c1a18', taper: [0, 1] });
                });
            }, C.ink);
            const line = bendy(J, 7);
            const keys = hind ? [[0, 4.2], [0.2, 4.4], [0.4, 2.8], [0.62, 2.9], [0.83, 1.9], [1, 2.2]] : [[0, 3], [0.2, 3.1], [0.42, 2.1], [0.62, 2.2], [0.84, 1.6], [1, 1.9]];
            const st2 = strip(line, (u) => S.track(keys, u));
            // its scales: arcs across, a lace of black, a few pale spots
            const P2 = pathOf(line, 1), arcs = [], blacks = [], pales = [];
            for (let U = 1; U < P2.total - 0.4; U += 1.25) {
                const u = U / P2.total, h = S.track(keys, u), p = P2.at(u), d = P2.dir(u), n2 = [d[1], -d[0]], nj = Math.max(2, Math.round((2 * h) / 1.25));
                const an = Math.atan2(pt(d)[1], pt(d)[0]);
                for (let j = 0; j < nj; j++) {
                    const w = (-1 + (2 * (j + 0.5 + (Math.round(U / 1.25) % 2 ? 0.25 : -0.25))) / nj) * h;
                    const q = pt([p[0] + n2[0] * w, p[1] + n2[1] * w]), it = [q[0], q[1], an, 0.66, h / nj * 0.92];
                    const c = cells(U + u0 * 300 + sg * 40, w + 30, 4.2, sd);
                    if (c.f2 - c.f1 < 0.75) blacks.push(it);
                    else if (c.f1 < 0.8 && c.id < 0.5) pales.push(it);
                    else arcs.push(it);
                }
            }
            const el = T([mixP(J[1], J[0], 0.12), J[1], mixP(J[1], J[2], 0.12)]);
            B.outlined(0.62, () => B.piece(st2.poly, {
                fill: C.green, line: 0.55, ink: C.ink, rim: C.greenDark,
                shade: [{ color: C.greenDeep, alpha: 0.9, w: 2.6, push: 1.5 }, { color: C.greenDark, alpha: 0.6, w: 1.1 }],
                light: { color: C.greenLight, alpha: 0.85, w: 2, push: 0.9 },
                detail: (g) => {
                    scaleDots(g, blacks, C.black, 0.88, 1.1);
                    scaleDots(g, pales, C.yellow, 0.7, 0.9);
                    scaleArcs(g, arcs, C.greenDark, 0.5, 0.2);
                    scaleArcs(g, blacks, '#7d93b0', 0.4, 0.14, 1.9, 4.4);
                    // the fold of the elbow or the knee
                    soft(g, el, { color: C.greenDark, alpha: 0.5, w: 0.8, blur: 1.2 });
                },
            }), C.ink);
        };
        SP.limbs.forEach((lm, i) => limb(lm, i >= 2));

        // ---- the tail: whorls of keeled scales, greying to its tip
        const tailCuts = [0.445, 0.56, 0.68, 0.8, 1], tailCol = [C.green, mix(C.green, C.tail, 0.45), mix(C.green, C.tail, 0.8), C.tail, mix(C.tail, '#7a7460', 0.6)];
        const rings = [], keels = [], tblack = [];
        for (let U = 0.452 * L; U < 0.992 * L; U += 2.15) {
            const u = U / L, h = Bd.hw(u), bow = Math.min(1, h * 0.25) / L;
            rings.push(T([at(u, -1), at(u + bow, -0.5), at(u + bow * 1.3, 0), at(u + bow, 0.5), at(u, 1)]));
            const nk = Math.max(2, Math.round((2 * h) / 1.3));
            for (let j = 0; j < nk; j++) {
                const w = -1 + (2 * (j + 0.5)) / nk;
                keels.push(T([at(u + 0.2 / L, w), at(u + 1.9 / L, w * 0.985)]));
                const c = cells(U, w * h + 60, 5.2, sd);
                if (u < 0.74 && (c.f2 - c.f1 < 0.7 || (c.id < 0.16 && c.f1 < 1.6))) tblack.push([...pt(at(u + 1.05 / L, w)), angOf(u), 0.95, (h / nk) * 0.86]);
            }
        }
        // (tail and trunk share one contour, so no line crosses the tail's root)
        B.outlined(0.78, () => {
            for (let i = tailCuts.length - 2; i >= 0; i--) {
                const u0 = tailCuts[i], u1 = Math.min(1, tailCuts[i + 1] + 0.004), n = 22;
                const poly = [...edge(u0, u1, n, -1), ...(u1 >= 1 ? [Bd.on(L + 0.5, 0)] : []), ...edge(u1, u0, n, 1)];
                B.piece(poly, {
                    fill: tailCol[i], line: 0, ink: C.ink, rimA: 0,
                    shade: [{ color: mix(tailCol[i], C.greenDark, 0.72), alpha: 0.9, w: 2.8, push: 1.5 }, { color: C.greenDark, alpha: 0.5, w: 1 }],
                    light: { color: mix(tailCol[i], '#f2f0b4', 0.6), alpha: 0.8, w: 2.2, push: 1 },
                });
            }
        B.add([], (g) => {
            g.save();
            g.globalCompositeOperation = 'source-atop';
            scaleDots(g, tblack, C.black, 0.8, 0.95);
            for (const r of rings) hairline(g, r, 0.26, C.greenDark, 0.62);
            for (const kl of keels) hairline(g, kl, 0.16, C.greenDark, 0.4);
            for (const kl of keels) hairline(g, kl.map(([x, y]) => [x + LIT[0] * 0.3, y + LIT[1] * 0.3]), 0.14, '#f0f0b8', 0.3);
            g.restore();
        });

        // ---- the trunk: green beaded with black, the blue eye-spots along the flanks
        const ocelli = [];
        for (const sg of [-1, 1]) {
            for (const [row, v, r0] of [[0, 0.72, 1.7], [1, 0.42, 1.15]]) {
                for (let U = 0.172 * L + row * 4.6 + rnd() * 2; U < 0.42 * L; U += 8.6 + rnd() * 2.6) if (row === 0 || rnd() < 0.6) ocelli.push([U, sg * v * Bd.hw(U / L) + (rnd() - 0.5), r0 * (0.8 + rnd() * 0.35)]);
            }
        }
        const SC = { arc: [], black: [], blue: [], yellow: [] };
        let row = 0;
        for (let U = 0.106 * L; U < 0.47 * L; U += 1.72, row++) {
            const u = U / L, h = Bd.hw(u), nj = Math.max(4, Math.round((2 * h) / 1.62)), an = angOf(u);
            for (let j = 0; j < nj; j++) {
                const w = -1 + (2 * (j + 0.5 + (row % 2 ? 0.25 : -0.25))) / nj;
                if (Math.abs(w) > 0.985) continue;
                const V = w * h, q = pt(at(u, w)), it = [q[0], q[1], an, 0.9, (h / nj) * 0.9];
                let od = 1e9, or = 1;
                for (const [oU, oV, r0] of ocelli) {
                    const d = Math.hypot(U - oU, V - oV);
                    if (d - r0 < od) {
                        od = d - r0;
                        or = r0;
                    }
                }
                const c = cells(U, V + 40, 7.4, sd), lace = c.f2 - c.f1, flank = smooth(0.55, 0.85, Math.abs(w));
                it[3] *= 0.9 + 0.25 * S.hashI(row, j, 4, sd);
                if (od < 0.2) SC.blue.push(it);
                else if (od < 1.5) SC.black.push(it);
                else if (lace < (1.2 - 0.45 * flank) * (0.7 + 0.6 * S.hashI(row, j, 5, sd))) SC.black.push(it);
                else if (c.f1 < 1.7) SC.yellow.push(it);
                else if (S.hashI(row, j, 9, sd) < 0.05) SC.black.push(it);
                else SC.arc.push(it);
            }
        }
        const N = 46, uA = 0.1, uB = 0.474;
        const trunk = [...edge(uA, uB, N, -1), ...edge(uB, uA, N, 1)];
        const bellyL = T(edge(0.125, 0.44, 40, -0.93)), bellyR = T(edge(0.125, 0.44, 40, 0.93)), trunkS = T(trunk);
        const spots = ocelli.map(([U, V, r0]) => ({ c: pt(Bd.on(U, V)), r: r0, a: Math.atan2(pt(Bd.frame(U / L).d)[1], pt(Bd.frame(U / L).d)[0]), k: S.hashI(Math.round(U * 7), Math.round(V * 5), 2, sd) }));
        const spineLine = T(edge(0.12, 0.46, 40, 0));
            B.piece(trunk, {
                fill: C.green, line: 0, ink: C.ink, rim: C.greenDark,
                cast: { blur: 2.6, dx: 1.2, dy: 1.8, color: 'rgba(10,20,14,0.6)' },
                shade: [{ color: C.greenDeep, alpha: 0.95, w: 7.5, push: 4.4 }, { color: C.greenDark, alpha: 0.7, w: 2.6 }],
                light: [{ color: C.greenLight, alpha: 0.85, w: 6, push: 3 }],
                detail: (g) => {
                    // the belly's pale edge, showing along each flank
                    for (const ln of [bellyL, bellyR]) {
                        soft(g, ln, { color: C.belly, alpha: 0.6, w: 0.9, blur: 0.8 });
                    }
                    scaleDots(g, SC.yellow, C.yellow, 0.5, 0.94);
                    scaleDots(g, SC.black, C.black, 0.92, 1.14);
                    scaleArcs(g, SC.arc, C.greenDark, 0.5, 0.2);
                    scaleArcs(g, SC.yellow, '#7f9436', 0.65, 0.18);
                    scaleArcs(g, SC.black, '#8a9cb8', 0.4, 0.15, 1.9, 4.4);
                    // the eye-spots: blue, lighter towards the lamp, each in its black ring
                    for (const sp of spots) {
                        g.save();
                        g.translate(sp.c[0], sp.c[1]);
                        g.rotate(sp.a);
                        g.fillStyle = C.black;
                        g.beginPath();
                        g.ellipse(0, 0, sp.r * 1.62, sp.r * (1.36 + 0.14 * sp.k), 0, 0, TAU);
                        g.fill();
                        g.fillStyle = C.blue;
                        g.beginPath();
                        g.ellipse(0, 0, sp.r * 1.12, sp.r * (0.9 + 0.1 * sp.k), 0, 0, TAU);
                        g.fill();
                        g.restore();
                        disc(g, [sp.c[0] + LIT[0] * sp.r * 0.25, sp.c[1] + LIT[1] * sp.r * 0.25], sp.r * 0.56, C.blueLight, 0.5);
                        disc(g, [sp.c[0] + SH[0] * sp.r * 0.42, sp.c[1] + SH[1] * sp.r * 0.42], sp.r * 0.5, C.blueDeep, 0.45);
                        // the spot is made of scales too
                        for (const [dx, dy] of [[-0.45, -0.3], [0.45, -0.3], [0, 0.42], [-0.6, 0.45], [0.6, 0.45]]) {
                            g.globalAlpha = 0.5;
                            g.strokeStyle = C.blueDeep;
                            g.lineWidth = 0.14;
                            g.beginPath();
                            g.arc(sp.c[0] + dx * sp.r, sp.c[1] + dy * sp.r, sp.r * 0.42, sp.a - 1.2, sp.a + 1.2);
                            g.stroke();
                            g.globalAlpha = 1;
                        }
                    }
                    scaleArcs(g, SC.blue, C.blueDeep, 0.55, 0.16);
                    // the round of the body, over its beads: shade down the far flank, a soft light down the back
                    S.spray(g, trunkS, { color: '#0b1a12', alpha: 0.5, w: 7, push: 4 });
                    S.spray(g, trunkS, { color: '#f6f8b4', alpha: 0.26, w: 6, push: 3.4, dir: LIT });
                    soft(g, spineLine.map(([x, y]) => [x + LIT[0] * 3, y + LIT[1] * 3]), { color: '#f2f6a8', alpha: 0.2, w: 2.4, blur: 3 });
                },
            });
        }, C.ink);

        // ---- the head: its plates, the jaw line, the eyes
        const head = [...edge(0, uH, 26, -1), ...S.curve([at(uH, -1), at(uH + 0.012, -0.5), at(uH + 0.016, 0), at(uH + 0.012, 0.5), at(uH, 1)], false, 5).slice(1, -1), ...edge(uH, 0, 26, 1), Hd(-0.9, 0)];
        const mir = (pl) => [pl, pl.map(([x, y]) => [x, -y]).reverse()];
        const half = (pl) => [...pl, ...pl.map(([x, y]) => [x, -y]).reverse()];
        const PLATES = [
            half([[0.5, 0], [1.3, 1.5], [2.5, 1.3]]), // rostral
            ...mir([[2.8, 0.15], [2.8, 2], [4.5, 2.8], [5.5, 1.6], [5.5, 0.15]]), // nasals
            ...mir([[5.9, 0.15], [5.8, 1.9], [4.9, 3.1], [6.4, 3.9], [8.1, 2.6], [8.1, 0.15]]), // prefrontals
            half([[8.5, 0], [8.5, 2.3], [10.7, 2.6], [13.1, 2], [13.6, 0]]), // frontal
            ...mir([[7.1, 4.2], [8.6, 2.9], [10.5, 3.1], [10.5, 5.5], [8.6, 5.3]]), ...mir([[10.9, 3.1], [13.1, 2.5], [14, 4.6], [12.8, 5.7], [10.9, 5.6]]), // the brows
            ...mir([[13.9, 0.15], [13.8, 2.1], [15.7, 2.8], [16, 0.15]]), // frontoparietals
            ...mir([[14.2, 2.6], [15.9, 3.1], [16.3, 1], [19.7, 1.2], [20.4, 4.4], [17.6, 5.9], [14.5, 5.1]]), // parietals
            half([[16.4, 0], [16.4, 0.7], [18.1, 0.6], [18.5, 0]]), // interparietal
            half([[18.8, 0], [18.9, 0.9], [19.9, 1], [21.6, 2.1], [21.9, 0]]), // the broad occipital
        ];
        const plates = PLATES.map((pl, i) => ({ pts: T(S.curve(pl.map(([hx, hy]) => Hd(hx, hy)), true, 3)), tone: S.hashI(i, 3, 1, sd) }));
        const flecks = [];
        for (let i = 0; i < 90; i++) {
            const hx = 1 + rnd() * 21, hy = (rnd() - 0.5) * 2 * Bd.hw(hx / L) * 0.94, p = pt(Hd(hx, hy));
            flecks.push([p[0], p[1], rnd() * 3, 0.3 + rnd() * 0.5, 0.2 + rnd() * 0.25]);
        }
        // the small scales of the cheeks, the temples and the nape, round the shield of plates
        const SHIELD = [[0, 1.5], [2.5, 2.1], [5, 3.1], [7, 4.3], [10, 5.7], [14, 5.8], [17.6, 6], [20.4, 4.5], [21.9, 2.2], [22.6, 0], [30, 0]];
        const temporal = [], tblackH = [], tyellow = [];
        let hrow = 0;
        for (let hx = 1.2; hx < uH * L + 2.4; hx += 1.36, hrow++) {
            const h = Bd.hw(hx / L), nj = Math.max(3, Math.round((2 * h) / 1.36)), an = angOf(hx / L), sh = S.track(SHIELD, hx);
            for (let j = 0; j < nj; j++) {
                const v = (-1 + (2 * (j + 0.5 + (hrow % 2 ? 0.25 : -0.25))) / nj) * h;
                if (Math.abs(v) < sh + 0.3 || Math.abs(v) > h - 1.5) continue;
                const q = pt(Hd(hx, v)), it = [q[0], q[1], an, 0.7, (h / nj) * 0.9], c = cells(hx, v + 80, 5.4, sd);
                if (c.f2 - c.f1 < 0.8) tblackH.push(it);
                else if (c.f1 < 1.1) tyellow.push(it);
                else temporal.push(it);
            }
        }
        const lips = [-1, 1].map((sg) => T(range(1.4, 20, 30).map((hx) => Bd.on(hx, sg * (Bd.hw(hx / L) - 1.25)))));
        const lipTicks = [];
        for (const sg of [-1, 1]) for (let hx = 2.6; hx < 20; hx += 2.1) lipTicks.push(T([Bd.on(hx, sg * (Bd.hw(hx / L) - 1.25)), Bd.on(hx + 0.3, sg * (Bd.hw(hx / L) - 0.1))]));
        B.mark('mouth', Hd(-0.8, 0));
        B.mark('eye', Hd(9.8, Bd.hw(9.8 / L) - 1.25));
        B.outlined(0.78, () => {
            B.piece(head, {
                fill: C.head, line: 0.6, ink: C.ink, rim: C.greenDark,
                cast: { blur: 2, dx: 0.8, dy: 1.2, color: 'rgba(10,20,14,0.55)' },
                shade: [{ color: C.greenDeep, alpha: 0.95, w: 5.4, push: 3 }, { color: C.greenDark, alpha: 0.7, w: 2 }],
                light: { color: C.greenLight, alpha: 0.85, w: 4.6, push: 2.2 },
                detail: (g) => {
                    // each plate its own tone, a light on its lit edge, the sutures between them
                    for (const pl of plates) {
                        g.globalAlpha = 0.1 + 0.14 * pl.tone;
                        g.fillStyle = pl.tone > 0.45 ? C.yellow : C.greenDeep;
                        g.beginPath();
                        S.trace(g, pl.pts);
                        g.fill();
                        g.globalAlpha = 1;
                        hairline(g, [...pl.pts, pl.pts[0]].map(([x, y]) => [x - LIT[0] * 0.22, y - LIT[1] * 0.22]), 0.22, '#eef2a6', 0.45);
                        hairline(g, [...pl.pts, pl.pts[0]], 0.3 * k + 0.12, B.ic(C.ink, C.greenDark), 0.82);
                    }
                    scaleDots(g, tyellow, C.yellow, 0.45, 0.94);
                    scaleDots(g, tblackH, C.black, 0.88, 1.12);
                    scaleArcs(g, temporal, C.greenDark, 0.55, 0.2);
                    scaleArcs(g, tyellow, '#7f9436', 0.6, 0.18);
                    scaleArcs(g, tblackH, '#8a9cb8', 0.4, 0.15, 1.9, 4.4);
                    scaleDots(g, flecks, C.black, 0.72, 1);
                    // the jaw line: the row of lip scales
                    for (const ln of lips) {
                        hairline(g, ln.map(([x, y]) => [x - LIT[0] * 0.3, y - LIT[1] * 0.3]), 0.22, C.belly, 0.5);
                        hairline(g, ln, 0.34 * k + 0.1, B.ic(C.ink, C.greenDark), 0.85);
                    }
                    for (const tk of lipTicks) hairline(g, tk, 0.2, C.greenDark, 0.7);
                    for (const sg of [-1, 1]) {
                        // nostril, and the ear behind the corner of the jaw
                        disc(g, pt(Hd(2.1, sg * 2.2)), 0.42, '#0a0e12', 0.9);
                        const ear = T(S.ellipse(0, 0, 1.15, 0.7, 14).map(([x, y]) => Hd(22 + x, sg * (Bd.hw(22 / L) - 1.5) + y)));
                        g.globalAlpha = 0.8;
                        g.fillStyle = '#1e2a1a';
                        g.beginPath();
                        S.trace(g, ear);
                        g.fill();
                        g.globalAlpha = 1;
                        hairline(g, ear.slice(0, 8).map(([x, y]) => [x + SH[0] * 0.25, y + SH[1] * 0.25]), 0.2, C.greenLight, 0.5);
                    }
                },
            });
            // the eyes, each under its brow
            for (const sg of [-1, 1]) {
                const ey = sg * (Bd.hw(9.8 / L) - 1.3), ec = Hd(9.8, ey), eye = S.ellipse(0, 0, 2.05, 1.32, 20).map(([x, y]) => Hd(9.8 + x, ey + y)), e = pt(ec);
                // a dark socket first, so the eye sits in the head
                B.piece(S.ellipse(0, 0, 2.7, 1.8, 20).map(([x, y]) => Hd(9.8 + x, ey + y - sg * 0.15)), { fill: '#2c3a1e', line: 0, rimA: 0, shade: { color: '#101a10', alpha: 0.8, w: 1.2 } });
                B.piece(eye, {
                    fill: '#a8762a', line: 0.34, ink: '#0b0e12', rim: '#2a1c08',
                    shade: { color: '#3a2006', alpha: 0.95, w: 1.2 }, light: { color: '#eccb72', alpha: 0.85, w: 0.7 },
                    detail: (g) => {
                        disc(g, e, 0.92, '#07080b', 1);
                        hairline(g, [[e[0] + LIT[0] * 0.75 - LIT[1] * 0.3, e[1] + LIT[1] * 0.75 + LIT[0] * 0.3], [e[0] + LIT[0] * 0.75 + LIT[1] * 0.3, e[1] + LIT[1] * 0.75 - LIT[0] * 0.3]], 0.36, '#f7f9ff', 0.95);
                        disc(g, [e[0] - LIT[0] * 0.8, e[1] - LIT[1] * 0.8], 0.15, '#c7d8ff', 0.6);
                    },
                });
                // the lids: the brow's edge over the eye, a pale lower lid outside it
                B.ink(range(-2.3, 2.3, 8).map((x) => Hd(9.8 + x, ey - sg * (1 + 0.45 * (1 - (x * x) / 5.3)))), { w: 0.62, color: C.ink, brush: C.greenDark, taper: [0.8, 0.8] });
                B.ink(range(-1.9, 1.9, 8).map((x) => Hd(9.8 + x, ey + sg * (1.05 + 0.36 * (1 - (x * x) / 3.6)))), { w: 0.3, color: C.belly, brush: C.belly, taper: [1, 1], alpha: 0.8 });
            }
        }, C.ink);
        if (o.tear) {
            // «El lagarto está llorando»: one tear under the near eye
            const e = Hd(11.2, Bd.hw(11.2 / L) + 2.2), dn = B.inv(0, 1);
            const tear = S.curve([[0, -1.9], [0.85, -0.3], [0.95, 0.75], [0, 1.5], [-0.95, 0.75], [-0.85, -0.3]], true, 6).map(([x, y]) => [e[0] + x * dn[1] + y * dn[0], e[1] - x * dn[0] + y * dn[1]]);
            const tc = pt(e);
            B.outlined(0.34, () => B.piece(tear, {
                fill: '#bfe0f2', line: 0.34, ink: '#1c3a5a', rim: '#4a7a9a',
                shade: { color: '#3f7fae', alpha: 0.75, w: 0.9, dir: [-SH[0], -SH[1]] }, light: { color: '#f4fbff', alpha: 0.95, w: 0.8, dir: SH },
                detail: (g) => {
                    disc(g, [tc[0] + LIT[0] * 0.45, tc[1] + LIT[1] * 0.45 + 0.2], 0.3, '#fdfeff', 0.98);
                },
            }), '#1c3a5a');
        }
        B.mark('feet', feet);
    }
    KINDS.lizard = { make: lizardMake, defaults: { pose: 0, tear: false }, key: (q) => q.pose + '/' + (q.tear ? 1 : 0), cast: { blur: 4, dx: 2.4, dy: 3.4, color: 'rgba(12,12,30,0.5)' } };

    // ------------------------------------------------------------------ moorish wall gecko
    const GEK = {
        ink: '#1a1822',
        skin: '#b8ab92', light: '#e6dcc4', deep: '#6e6250', dark: '#3e372e', band: '#6f5f4c', pad: '#d9cdb4', belly: '#efe8d4',
    };
    const GEK_HW = [[0, 1.7], [0.022, 4.2], [0.06, 6.3], [0.11, 8.5], [0.145, 8.3], [0.178, 5.9], [0.22, 7.6], [0.34, 9.6], [0.45, 8.8], [0.53, 6.2], [0.57, 4.9], [0.63, 5.6], [0.75, 4.2], [0.88, 2.4], [0.97, 1], [1, 0.4]];
    const GEK_POSES = [
        {
            spine: [[40, -14], [26, -8], [10, -1], [-8, 2], [-24, -2], [-40, -12], [-52, -26], [-56, -35]],
            limbs: [[-1, 0.215, [[0.55, 8.5], [1.2, 7.5], [0.9, 3.2]]], [1, 0.215, [[-0.2, 8.5], [0.75, 7.5], [0.4, 3.2]]], [-1, 0.525, [[-0.35, 9.5], [-1.3, 8.5], [-0.6, 3.6]]], [1, 0.525, [[0.45, 9.5], [-0.8, 8.5], [-0.1, 3.6]]]],
        },
        {
            spine: [[30, 26], [24, 12], [14, -2], [0, -8], [-16, -6], [-30, 4], [-46, 6], [-56, -2]],
            limbs: [[-1, 0.215, [[-0.25, 8.5], [0.8, 7.5], [0.5, 3.2]]], [1, 0.215, [[0.6, 8.5], [1.25, 7.5], [0.9, 3.2]]], [-1, 0.525, [[0.5, 9.5], [-0.75, 8.5], [-0.1, 3.6]]], [1, 0.525, [[-0.35, 9.5], [-1.3, 8.5], [-0.6, 3.6]]]],
        },
    ];
    function geckoMake(B, o) {
        const C = GEK, k = B.k, rnd = Motion.rng('gecko/' + o.seed + '/' + o.pose), sd = S.seedOf('gecko' + o.seed) & 255;
        const SP = GEK_POSES[o.pose] ?? GEK_POSES[0];
        const c0 = pathOf(SP.spine, 24).at(0.37);
        const Bd = bodyOf(SP.spine.map(([x, y]) => [x - c0[0], y - c0[1]]), (u) => S.track(GEK_HW, u));
        const L = Bd.total, at = Bd.at, T = B.T, pt = B.pt;
        const edge = (u0, u1, n, w) => range(u0, u1, n).map((u) => at(u, w));
        // a tubercle: a small keeled bump, lit on one side
        const bump = (g, list) => {
            for (const [p, r] of list) disc(g, [p[0] + SH[0] * r * 0.5, p[1] + SH[1] * r * 0.5], r * 1.12, C.dark, 0.55);
            for (const [p, r, t] of list) disc(g, p, r, mix(C.skin, C.light, 0.15 + 0.5 * t), 0.95);
            for (const [p, r] of list) disc(g, [p[0] + LIT[0] * r * 0.36, p[1] + LIT[1] * r * 0.36], r * 0.4, '#f6efdc', 0.6);
        };
        const grit = (g, list) => {
            for (const [p, r, t] of list) disc(g, p, r, t > 0.55 ? C.light : t > 0.12 ? C.deep : C.dark, t > 0.12 ? 0.42 : 0.7);
        };

        // ---- limbs and their padded toes
        const feet = [];
        const limb = ([sg, u0, segs], hind) => {
            const G = limbOf(Bd, sg, u0, 0.55, segs), J = G.J, footA = segs[2][0];
            feet.push(J[3]);
            B.outlined(0.5, () => {
                for (let i = 0; i < 5; i++) {
                    // five toes in a star; the pad widens to the tip
                    const t = i / 4, a = footA + lerp(1.5, -1.5, t) + (hind && i === 4 ? -0.3 : 0), len = (hind ? [4.6, 5.6, 6.2, 6.2, 5.4] : [4.2, 5.2, 5.8, 5.6, 4.6])[i];
                    const d = G.dirOf(a), n2 = G.dirOf(a + Math.PI / 2), b0 = mixP(J[2], J[3], 0.9);
                    const line = range(0, 1, 8).map((v) => [b0[0] + d[0] * len * v + n2[0] * Math.sin(v * 3) * 0.2, b0[1] + d[1] * len * v + n2[1] * Math.sin(v * 3) * 0.2]);
                    const wd = (v) => 0.55 + 0.95 * smooth(0.2, 0.8, v) * (1 - 0.6 * smooth(0.9, 1, v));
                    const st2 = strip(line, wd), tl = T(line);
                    const tip = line[8];
                    if (i === 2 || i === 3) B.ink([tip, [tip[0] + d[0] * 0.9 + n2[0] * 0.3, tip[1] + d[1] * 0.9 + n2[1] * 0.3]], { w: 0.42, color: '#221c18', taper: [0, 1] });
                    B.piece(st2.poly, {
                        fill: C.pad, line: 0.42, ink: C.ink, rim: C.dark, rimA: 0.4,
                        shade: { color: C.deep, alpha: 0.85, w: 1.1 }, light: { color: '#fbf4e0', alpha: 0.9, w: 0.9, push: 0.3 },
                        detail: (g) => {
                            // the lamellae across the pad
                            for (let j = 2; j < tl.length - 1; j++) {
                                for (const f of [0, 0.5]) {
                                    const p = mixP(tl[j], tl[j + 1], f), q = tl[j + 1], tt = norm([q[0] - tl[j][0], q[1] - tl[j][1]]), h = wd((j + f) / 8) * 0.9;
                                    hairline(g, [[p[0] - tt[1] * h, p[1] + tt[0] * h], [p[0] + tt[0] * 0.2, p[1] + tt[1] * 0.2], [p[0] + tt[1] * h, p[1] - tt[0] * h]], 0.13, C.deep, 0.7);
                                }
                            }
                        },
                    });
                }
            }, C.ink);
            const line = bendy(J, 7);
            const keys = hind ? [[0, 3.3], [0.25, 3.3], [0.45, 2.3], [0.7, 2.4], [0.88, 1.7], [1, 2.1]] : [[0, 2.8], [0.25, 2.8], [0.45, 2], [0.7, 2.1], [0.88, 1.5], [1, 1.9]];
            const st2 = strip(line, (u) => S.track(keys, u)), P2 = pathOf(line, 1);
            const tub = [], grains = [];
            for (let U = 1.2; U < P2.total - 0.8; U += 1.9) {
                const u = U / P2.total, h = S.track(keys, u), p = P2.at(u), d = P2.dir(u);
                for (const w of [-0.5, 0.5]) tub.push([pt([p[0] + d[1] * w * h + (rnd() - 0.5) * 0.4, p[1] - d[0] * w * h + (rnd() - 0.5) * 0.4]), 0.36 + rnd() * 0.14, rnd()]);
                for (let j = 0; j < 5; j++) grains.push([pt([p[0] + d[1] * (rnd() - 0.5) * 1.8 * h + d[0] * rnd() * 1.9, p[1] - d[0] * (rnd() - 0.5) * 1.8 * h + d[1] * rnd() * 1.9]), 0.12 + rnd() * 0.1, rnd()]);
            }
            const el = T([mixP(J[1], J[0], 0.15), J[1], mixP(J[1], J[2], 0.15)]);
            const bandAt = T([P2.at(0.3), P2.at(0.36)]), bandB = T([P2.at(0.62), P2.at(0.68)]);
            B.outlined(0.62, () => B.piece(st2.poly, {
                fill: C.skin, line: 0.55, ink: C.ink, rim: C.dark,
                shade: [{ color: C.deep, alpha: 0.9, w: 2.4, push: 1.4 }, { color: C.dark, alpha: 0.55, w: 1 }],
                light: { color: C.light, alpha: 0.9, w: 1.9, push: 0.8 },
                detail: (g) => {
                    soft(g, bandAt, { color: C.band, alpha: 0.6, w: 3.4, blur: 1.4 });
                    soft(g, bandB, { color: C.band, alpha: 0.55, w: 2.6, blur: 1.2 });
                    grit(g, grains);
                    bump(g, tub);
                    soft(g, el, { color: C.dark, alpha: 0.45, w: 0.7, blur: 1.1 });
                },
            }), C.ink);
        };
        SP.limbs.forEach((lm, i) => limb(lm, i >= 2));

        // ---- body and tail in one skin; the head over it
        const uH = 0.182, N = 60;
        const body = [...edge(0.14, 1, N, -1), Bd.on(L + 0.4, 0), ...edge(1, 0.14, N, 1)];
        // the dark saddles across the back and the bars on the tail
        const saddles = [];
        for (const [u, wide] of [[0.245, 1], [0.315, 1.1], [0.39, 1.1], [0.465, 1], [0.535, 0.9], [0.615, 0.9], [0.69, 0.85], [0.76, 0.8], [0.83, 0.75], [0.895, 0.7], [0.95, 0.6]]) {
            const h = Bd.hw(u), back = 3.4 * wide / L;
            // a chevron: its point towards the tail in the middle
            saddles.push(T([at(u - back * 0.2, -0.86), at(u + back * 0.3, -0.45), at(u + back * 0.9, 0), at(u + back * 0.3, 0.45), at(u - back * 0.2, 0.86)]).concat([[h * 0.36 * wide]]));
        }
        const tub = [], spines = [], grains = [];
        for (let U = 0.19 * L; U < 0.985 * L; U += 2.05) {
            const u = U / L, h = Bd.hw(u), tail = u > 0.56;
            const rows = tail ? [-0.62, -0.2, 0.2, 0.62] : [-0.84, -0.6, -0.36, -0.12, 0.12, 0.36, 0.6, 0.84];
            rows.forEach((w, j) => {
                if (h < 1 || (!tail && rnd() < 0.05)) return;
                if (rnd() < 0.12) return;
                tub.push([pt(at(u + ((j % 2) * 1 + (rnd() - 0.5) * 0.9) / L, w + (rnd() - 0.5) * 0.09)), (tail ? 0.3 : 0.36) * (0.75 + rnd() * 0.5) * Math.min(1, h / 3), rnd()]);
            });
            // the spiny tubercles along the tail's sides, in whorls
            if (tail && h > 0.9 && Math.round(U / 2.05) % 2 === 0) for (const sg of [-1, 1]) spines.push([at(u, sg * 0.86), at(u + 0.5 / L, sg * (1 + 0.95 / h)), at(u + 1.5 / L, sg * 0.9)]);
            for (let j = 0; j < 26; j++) grains.push([pt(at(u + (rnd() * 2) / L, (rnd() - 0.5) * 1.9)), 0.1 + rnd() * 0.13, rnd()]);
        }
        const foldL = T(edge(0.24, 0.5, 30, -0.9)), foldR = T(edge(0.24, 0.5, 30, 0.9));
        const blotch = [];
        for (let i = 0; i < 120; i++) {
            const u = 0.18 + rnd() * 0.8, w = (rnd() - 0.5) * 1.7, a = at(u, w), b2 = at(u + (0.6 + rnd() * 1.6) / L, w + (rnd() - 0.5) * 0.3);
            blotch.push([T([a, b2]), rnd(), (0.5 + rnd() * 1.1) * Math.min(1, Bd.hw(u) / 4)]);
        }
        const whorls = [];
        for (let U = 0.585 * L; U < 0.98 * L; U += 4.1) whorls.push(T([at(U / L, -1), at(U / L + 0.4 / L, 0), at(U / L, 1)]));
        B.outlined(0.42, () => {
            for (const sp of spines) B.piece(sp, { fill: C.light, line: 0.3, ink: C.ink, rimA: 0.3, shade: { color: C.deep, alpha: 0.8, w: 0.6 } });
        }, C.ink);
        B.outlined(0.78, () => {
            B.piece(body, {
                fill: C.skin, line: 0.6, ink: C.ink, rim: C.dark,
                cast: { blur: 2.2, dx: 1, dy: 1.5, color: 'rgba(24,18,14,0.55)' },
                shade: [{ color: C.deep, alpha: 0.9, w: 6.5, push: 3.8 }, { color: C.dark, alpha: 0.6, w: 2 }],
                light: { color: C.light, alpha: 0.9, w: 5.4, push: 2.6 },
                detail: (g) => {
                    for (const [ln, t, w] of blotch) soft(g, ln, { color: t > 0.5 ? C.band : C.light, alpha: t > 0.5 ? 0.55 : 0.5, w, blur: w * 0.8 });
                    for (const sdl of saddles) {
                        // a saddle: soft in front, a dark crisp hem behind, a pale band after it
                        const w = sdl[sdl.length - 1][0], ln = sdl.slice(0, -1), bx = (ln[2][0] - ln[0][0]), by = (ln[2][1] - ln[0][1]);
                        soft(g, ln, { color: C.band, alpha: 0.66, w: w * 0.9, blur: w * 0.7 });
                        soft(g, ln.map(([x, y]) => [x + bx * 0.3, y + by * 0.3]), { color: C.dark, alpha: 0.7, w: w * 0.2, blur: w * 0.22 });
                        soft(g, ln.map(([x, y]) => [x + bx * 0.62, y + by * 0.62]), { color: C.light, alpha: 0.5, w: w * 0.26, blur: w * 0.4 });
                    }
                    // the fold of skin along each flank
                    for (const ln of [foldL, foldR]) {
                        hairline(g, ln, 0.3, C.dark, 0.4);
                        hairline(g, ln.map(([x, y]) => [x + LIT[0] * 0.4, y + LIT[1] * 0.4]), 0.24, C.belly, 0.5);
                    }
                    for (const wl of whorls) hairline(g, wl, 0.2, C.dark, 0.35);
                    grit(g, grains);
                    bump(g, tub);
                },
            });
        }, C.ink);
        // ---- the head
        const Hd = (hx, hy) => Bd.on(hx, hy);
        const head = [...edge(0, uH, 26, -1), ...S.curve([at(uH, -1), at(uH + 0.014, -0.5), at(uH + 0.02, 0), at(uH + 0.014, 0.5), at(uH, 1)], false, 5).slice(1, -1), ...edge(uH, 0, 26, 1), Hd(-0.7, 0)];
        const hgrain = [], htub = [];
        for (let i = 0; i < 260; i++) {
            const hx = 0.6 + rnd() * (uH * L - 1), hy = (rnd() - 0.5) * 1.9 * Bd.hw(hx / L);
            hgrain.push([pt(Hd(hx, hy)), 0.12 + rnd() * 0.13, rnd()]);
        }
        for (let hx = 13.5; hx < uH * L; hx += 2) for (const v of [-5, -2.9, -1, 1, 2.9, 5]) htub.push([pt(Hd(hx + (rnd() - 0.5) * 0.9, v + (rnd() - 0.5) * 0.7)), 0.3 + rnd() * 0.12, rnd()]);
        const lips = [-1, 1].map((sg) => T(range(1, 14, 24).map((hx) => Bd.on(hx, sg * (Bd.hw(hx / L) - 0.95)))));
        B.mark('mouth', Hd(-0.6, 0));
        B.outlined(0.78, () => {
            B.piece(head, {
                fill: C.skin, line: 0.6, ink: C.ink, rim: C.dark,
                cast: { blur: 1.8, dx: 0.7, dy: 1.1, color: 'rgba(24,18,14,0.5)' },
                shade: [{ color: C.deep, alpha: 0.9, w: 5, push: 2.8 }, { color: C.dark, alpha: 0.6, w: 1.8 }],
                light: { color: C.light, alpha: 0.9, w: 4.2, push: 2 },
                detail: (g) => {
                    // a dark line from the snout through each eye, a pale brow, the snout's dip
                    for (const sg of [-1, 1]) {
                        soft(g, T([Hd(2, sg * 2.2), Hd(6, sg * 4.2), Hd(13, sg * 7), Hd(18, sg * 6.4)]), { color: C.band, alpha: 0.6, w: 1.2, blur: 1.4 });
                        soft(g, T([Hd(5.5, sg * 2.4), Hd(9, sg * 3.6), Hd(13, sg * 4.6)]), { color: C.light, alpha: 0.6, w: 0.8, blur: 1 });
                    }
                    soft(g, T([Hd(4, 0), Hd(8.5, 0)]), { color: C.deep, alpha: 0.4, w: 1.6, blur: 1.6 });
                    soft(g, T([Hd(14.5, -3.4), Hd(17.5, 0), Hd(14.5, 3.4)]), { color: C.band, alpha: 0.55, w: 1.6, blur: 1.4 });
                    grit(g, hgrain);
                    bump(g, htub);
                    for (const ln of lips) {
                        hairline(g, ln.map(([x, y]) => [x - LIT[0] * 0.28, y - LIT[1] * 0.28]), 0.2, C.belly, 0.6);
                        hairline(g, ln, 0.3 * k + 0.1, B.ic(C.ink, C.dark), 0.75);
                    }
                    for (const sg of [-1, 1]) {
                        disc(g, pt(Hd(1.5, sg * 1.7)), 0.36, '#15110e', 0.9);
                        // the ear: a slit
                        hairline(g, T([Hd(16.8, sg * (Bd.hw(16.8 / L) - 1.3)), Hd(18.1, sg * (Bd.hw(18.1 / L) - 1))]), 0.6, '#17120f', 0.9);
                    }
                },
            });
            // the eyes: lidless, bulging past the outline; a marbled iris, the pupil a slit with pinholes
            for (const sg of [-1, 1]) {
                const ex = 9.6, ey = sg * (Bd.hw(ex / L) - 0.9), e = pt(Hd(ex, ey));
                const eye = S.ellipse(0, 0, 2.15, 1.75, 22).map(([x, y]) => Hd(ex + x, ey + y));
                const veins = [];
                for (let i = 0; i < 22; i++) {
                    const a = rnd() * TAU, r0 = 0.5 + rnd() * 0.5, r1 = r0 + 0.5 + rnd() * 0.6;
                    veins.push(T([Hd(ex + Math.cos(a) * r0 * 1.3, ey + Math.sin(a) * r0), Hd(ex + Math.cos(a + 0.3) * r1 * 1.3, ey + Math.sin(a + 0.3) * r1)]));
                }
                const slit = T(S.curve([[0, -1.45], [0.2, -0.9], [0.1, -0.5], [0.26, 0], [0.1, 0.5], [0.2, 0.9], [0, 1.45], [-0.2, 0.9], [-0.1, 0.5], [-0.26, 0], [-0.1, -0.5], [-0.2, -0.9]], true, 4).map(([x, y]) => Hd(ex + x - 0.2, ey + y)));
                B.piece(eye, {
                    fill: '#b7a36c', line: 0.5, ink: '#100e14', rim: '#3a2f1c',
                    cast: { blur: 1, dx: 0.5, dy: 0.7, color: 'rgba(24,18,14,0.6)' },
                    shade: { color: '#5a4a2a', alpha: 0.9, w: 1.3 }, light: { color: '#f1e3b0', alpha: 0.9, w: 1, push: 0.3 },
                    detail: (g) => {
                        for (const v of veins) hairline(g, v, 0.14, '#5c4a2c', 0.7);
                        g.fillStyle = '#08070b';
                        g.beginPath();
                        S.trace(g, slit);
                        g.fill();
                        // the wet cornea: a short fat streak and a dash
                        const u2 = [-LIT[1], LIT[0]], h = [e[0] + LIT[0] * 0.8, e[1] + LIT[1] * 0.8];
                        hairline(g, [[h[0] - u2[0] * 0.5, h[1] - u2[1] * 0.5], [h[0] + u2[0] * 0.5, h[1] + u2[1] * 0.5]], 0.46, '#fdfcf4', 0.92);
                        disc(g, [h[0] + u2[0] * 1 - LIT[0] * 0.25, h[1] + u2[1] * 1 - LIT[1] * 0.25], 0.15, '#fdfcf4', 0.85);
                    },
                });
                // the brow: a ridge of small scales over the eye
                B.ink(range(-2.1, 2.1, 8).map((x) => Hd(ex + x, ey - sg * (1.45 - 0.16 * x * x * 0.3))), { w: 0.6, color: C.ink, brush: C.dark, taper: [0.9, 0.9] });
            }
        }, C.ink);
        B.mark('feet', feet);
    }
    KINDS.gecko = { make: geckoMake, defaults: { pose: 0 }, key: (q) => q.pose, cast: { blur: 3, dx: 1.8, dy: 2.6, color: 'rgba(12,12,30,0.5)' } };

    // ================================================================== swallowtail
    const FLY = {
        ink: '#15131c', black: '#231f22', blackWarm: '#3b3028', blackDeep: '#0e0c12',
        yellow: '#efd052', yellowLight: '#fbeb9c', yellowDeep: '#c2922a', cream: '#f1e4a6', creamDeep: '#c7b06a',
        blue: '#3f79cc', blueLight: '#a4caf2', red: '#d0432a', redLight: '#f59b58', redDeep: '#7c1c18', rust: '#c97a30',
        fur: '#2a2528', furLight: '#8f7f5c', side: '#e6cc5c',
    };
    // Wings in their own plane: u along the body (+ towards the head), v out from the hinge.
    // fan: the veins from the cell to the margin, from the costa round to the inner margin.
    const FLY_FW = {
        outline: [[6, 1.2], [12, 9], [17.5, 20], [21, 31], [22.5, 40], [21.5, 44.5], [17, 44], [9, 40], [1.5, 35], [-4, 30.5], [-5, 29], [-3.5, 21], [-0.5, 11], [2.5, 2]],
        fan: [[[12.6, 15], [20.2, 28.5]], [[13.8, 18.6], [21.9, 35.5]], [[14.4, 20.6], [22.5, 40.5]], [[14.6, 21.2], [21.4, 44.6]], [[14.2, 21.4], [17.2, 44.1]], [[12.2, 20.8], [12.4, 41.7]], [[9.8, 19.8], [7.6, 39.2]], [[8, 19], [2.9, 35.9]], [[7.2, 13.6], [-2.1, 32]], [[5.2, 3.4], [-4.7, 29.5]]],
        // per cell: where the yellow starts on each of its two veins (fraction from the cell), and the black band's width at the margin
        cells: [[0.36, 0.3, 9], [0.3, 0.26, 9.6], [0.26, 0.3, 10], [0.3, 0.14, 9.6], [0.12, 0.07, 9], [0.06, 0.05, 9], [0.05, 0.05, 9], [0.05, 0.26, 9], [0.2, 0.44, 9]],
        cell: [[[7, 3], [14.6, 21.2]], [[5.6, 3], [8, 19]]], // the discal cell's two edges
        bars: [[0.4, 0.58], [0.7, 0.9]], // its yellow, between the black bars
    };
    const FLY_HW = {
        outline: [[0, 1.2], [-1, 10], [-3.5, 21], [-6.5, 28.8], [-8.4, 28.9], [-10.5, 30.2], [-13, 28.9], [-15.8, 29], [-18.1, 26.8], [-21, 26], [-23.6, 23.2], [-27.6, 21.6], [-30.6, 22.1], [-33.4, 23], [-35.7, 24], [-37.6, 23.6], [-36.35, 22.1], [-33.9, 21.6], [-31.1, 20.6], [-28.6, 19], [-29.6, 16.6], [-30.3, 14.6], [-29.6, 12.4], [-29.8, 10.2], [-28.9, 8.2], [-28.4, 6], [-22, 4.4], [-12, 3], [-5, 2]],
        fan: [[[-2, 12], [-6.5, 28.8]], [[-6, 14.5], [-10.5, 30.2]], [[-7.2, 14.4], [-15.8, 29]], [[-8.8, 13.6], [-21, 26]], [[-10.4, 12.2], [-27, 21.6]], [[-11.5, 10.5], [-30.3, 14.6]], [[-9, 7.5], [-29.8, 10.2]], [[-4, 3], [-28.4, 6]]],
        cells: [[0.1, 0.05, 9], [0.05, 0.05, 9.6], [0.05, 0.05, 9.8], [0.05, 0.05, 9.8], [0.05, 0.05, 9.4], [0.05, 0.1, 8.6], [0.1, 0.3, 7.4]],
        cell: [[[-0.6, 2.6], [-6.8, 14.6]], [[-1.8, 1.9], [-11.5, 10.5]]],
        bars: [[0.12, 0.92]],
        tail: [[-27.6, 20.4], [-36.9, 23.4]],
    };
    function butterflyMake(B, o) {
        const C = FLY, k = B.k, rnd = Motion.rng('butterfly/' + o.seed), fold = clamp(o.fold ?? 0.2);
        // the wings rise about the body (phi) and the whole butterfly rolls towards us (theta):
        // flat from above at fold 0, in profile with the near wing's underside to us at fold 1
        const phi = 82 * DEG * fold, theta = 90 * DEG * Math.pow(fold, 1.5);
        const hy = (sg) => sg * 1.3 * Math.cos(theta) - 1.6 * Math.sin(theta);
        const wingOf = (sg) => {
            const a = sg > 0 ? phi + theta : Math.PI - phi + theta, c = Math.cos(a), z = Math.sin(a);
            return { sg, a, c, z, under: sg > 0 ? c < 0 : c > 0, proj: ([u, v]) => [u, hy(sg) + v * c] };
        };
        const vlen = (V) => dist(V[0], V[1]);
        // a point on a vein: by its fraction from the cell (t) or its distance from the margin (d)
        const onV = (V, q) => (q.t !== undefined ? mixP(V[0], V[1], q.t) : mixP(V[1], V[0], clamp(q.d / vlen(V))));
        // a patch between two veins, inset from them; bulges: bi (fraction) towards the cell, bo (units) towards the margin
        const patch = (A, Bv, inner, outer, { inset = 0.1, bi = 0, bo = 0, n = 6 } = {}) => {
            const pick = (q, i) => (Array.isArray(q) ? q[i] : q);
            const edgeOf = (q, bulge) => range(0, 1, n).map((j) => {
                const b = 4 * j * (1 - j) * bulge, sh = (r) => (r.t !== undefined ? { t: r.t - b } : { d: r.d - b });
                return mixP(onV(A, sh(pick(q, 0))), onV(Bv, sh(pick(q, 1))), inset + (1 - 2 * inset) * j);
            });
            return [...edgeOf(inner, bi), ...edgeOf(outer, bo).reverse()];
        };
        const paintWing = (W, wing, hind, far) => {
            const under = wing.under, proj = wing.proj, r2 = Motion.rng('wing/' + o.seed + (hind ? 'h' : 'f') + wing.sg);
            // a far wing that is hidden behind the near one peeks out a little ahead of it
            const peek = far ? 0.1 * fold * fold : 0, base = W.outline[0];
            const pre = ([u, v]) => {
                const p = turn([u - base[0], v - base[1]], -peek);
                return [base[0] + p[0], base[1] + p[1]];
            };
            const M = (p) => B.pt(proj(pre(p))), MM = (pts) => pts.map(M);
            const outline = S.curve(W.outline, true, hind ? 3 : 6).map((p) => proj(pre(p)));
            const yel = under ? C.cream : C.yellow, yelD = under ? C.creamDeep : C.yellowDeep, blk = under ? '#4a4038' : C.black;
            const grow = under ? 0.03 : 0; // the underside's black is thinner
            const P = { yellow: [], spot: [], blue: [], lun: [], fringe: [], rust: [] };
            W.fan.slice(0, -1).forEach((A, i) => {
                const Bv = W.fan[i + 1], [ta, tb, band0] = W.cells[i], band = band0 * (under ? 0.82 : 1);
                P.yellow.push(patch(A, Bv, [{ t: ta - grow }, { t: tb - grow }], { d: band }, { bi: 0.05, bo: hind ? -0.9 : 0.9, inset: 0.11 }));
                if (!hind) {
                    // the row of yellow spots in the black band, and the fringe's lunules
                    P.spot.push(patch(A, Bv, { d: band * 0.72 }, { d: band * 0.36 }, { bi: 0, bo: 1.1, inset: 0.2 }).map((p, j, arr) => mixP(p, arr[(j + 7) % arr.length], 0.1)));
                    P.fringe.push(patch(A, Bv, { d: 1 }, { d: 0.15 }, { bo: -0.4, inset: 0.18 }));
                } else {
                    // blue dusted into the band, a yellow lunule outside it
                    P.blue.push(patch(A, Bv, { d: band * 0.8 }, { d: band * 0.56 }, { bi: 0, bo: 1.2, inset: 0.22 }));
                    if (i < 6) P.lun.push(patch(A, Bv, { d: band * 0.4 }, { d: 0.95 }, { bo: -1.7, inset: 0.12 }));
                    P.fringe.push(patch(A, Bv, { d: 0.75 }, { d: 0.1 }, { bo: -0.5, inset: 0.22 }));
                    if (under && i > 0 && i < 5) P.rust.push(patch(A, Bv, { d: band * 1.05 }, { d: band * 0.8 }, { bo: 0.6, inset: 0.2 }));
                }
            });
            // the discal cell's yellow, between its black bars
            for (const [t0, t1] of W.bars) P.yellow.push(patch(W.cell[0], W.cell[1], { t: t0 - grow }, { t: t1 + grow }, { inset: 0.09, bi: 0.02, bo: 0 }).map((p) => p));
            if (hind) {
                // the inner margin: yellow at its root, under the hair
                P.yellow.push([[-3, 2.6], [-10, 5.4], [-17, 6.8], [-18, 4.6], [-10, 3.4], [-4, 2.2]]);
            }
            for (const key of Object.keys(P)) P[key] = P[key].map((pl) => MM(pl));
            const veins = [...W.fan, ...W.cell].map(([p0, p1]) => MM([p0, p1]));
            const cellEnd = MM([W.cell[0][1], mixP(W.cell[0][1], W.cell[1][1], 0.5).map((v, j) => v - (j ? 0.5 : -0.3)), W.cell[1][1]]);
            // the scales' dust: specks of yellow over the black at the wing's root and inside the band, of black over the yellow
            const bb = S.bbox(W.outline), dustY = [], dustB = [], dustBlue = [];
            for (let i = 0; i < (hind ? 800 : 1500); i++) {
                const p = [bb.x + r2() * bb.w, bb.y + r2() * bb.h], rootD = dist(p, base);
                if (rootD < (hind ? 9 : 17) * (0.6 + 0.6 * r2())) dustY.push(M(p), M([p[0] + r2() - 0.5, p[1] + r2() - 0.5]), M(mixP(p, base, 0.3)));
                else if (r2() < 0.4) dustB.push(M(p));
                else dustY.push(M(p));
            }
            if (hind) {
                W.fan.slice(0, -1).forEach((A, i) => {
                    const Bv = W.fan[i + 1], band = W.cells[i][2];
                    for (let j = 0; j < 46; j++) {
                        const s = 0.12 + 0.76 * r2(), d = band * (0.46 + 0.42 * r2()) - 1.2 * 4 * s * (1 - s) * 0.4;
                        dustBlue.push([M(mixP(onV(A, { d }), onV(Bv, { d }), s)), r2()]);
                    }
                });
            }
            // the red eye-spot at the hindwing's inner corner
            const eyeC = [-26.9, 8.6], eye = hind ? {
                ring: MM(S.ellipse(eyeC[0], eyeC[1], 3.1, 2.7, 20, 0.2)), red: MM(S.ellipse(eyeC[0] - 0.2, eyeC[1] - 0.1, 2.3, 1.95, 18, 0.2)),
                blue: MM(S.curve([[-24.3, 6.6], [-24.9, 8.8], [-24.4, 10.9], [-23.2, 10.6], [-23.6, 8.7], [-23.2, 6.9]], true, 5)), c: M(eyeC),
            } : null;
            const hairs = [];
            if (hind) {
                for (let i = 0; i < 60; i++) {
                    const u = -1 - r2() * 15, v = 1.6 + r2() * 3.4;
                    hairs.push(MM([[u, v], [u - 2.4 - r2() * 2.4, v + 0.9 + r2() * 1.4]]));
                }
            }
            const pts = B.piece(outline, {
                fill: blk, line: 0.6, ink: C.ink, rim: C.blackDeep, rimA: 0.3,
                cast: { blur: 2, dx: 0.9, dy: 1.3, color: 'rgba(10,8,16,0.5)' },
                detail: (g) => {
                    const fillAll = (list, col, a = 1) => {
                        g.globalAlpha = a;
                        g.fillStyle = col;
                        for (const pl of list) {
                            g.beginPath();
                            S.trace(g, pl);
                            g.fill();
                        }
                        g.globalAlpha = 1;
                    };
                    // every cell its own piece of yellow: deeper towards the root and its edges, lighter in its middle
                    P.yellow.forEach((pl, i) => {
                        g.fillStyle = mix(yel, i % 3 ? C.yellowLight : yelD, 0.1 + 0.14 * ((i * 7) % 5) / 5);
                        g.beginPath();
                        S.trace(g, pl);
                        g.fill();
                        g.save();
                        g.clip();
                        S.spray(g, pl, { color: yelD, alpha: 0.8, w: 1.5, push: 0, dir: [0, 0] });
                        S.spray(g, pl, { color: under ? '#fff6cf' : C.yellowLight, alpha: 0.6, w: 2.4, push: 1, dir: LIT });
                        // the rows of scales, along the cell
                        const h = pl.length / 2;
                        for (let j = 1; j < h - 1; j++) {
                            const a = pl[j], b = pl[pl.length - 1 - j];
                            hairline(g, [mixP(a, b, 0.08), mixP(a, b, 0.92)], 0.16, j % 2 ? yelD : '#fff8d0', j % 2 ? 0.34 : 0.4);
                        }
                        g.restore();
                    });
                    if (under) fillAll(P.rust, C.rust, 0.75);
                    fillAll(P.spot, yel, 0.96);
                    fillAll(P.lun, yel, 0.96);
                    fillAll(P.fringe, mix(yel, '#ffffff', 0.25), 0.9);
                    for (const pl of [...P.spot, ...P.lun]) {
                        g.save();
                        g.beginPath();
                        S.trace(g, pl);
                        g.clip();
                        S.spray(g, pl, { color: yelD, alpha: 0.7, w: 0.9, push: 0, dir: [0, 0] });
                        g.restore();
                    }
                    // blue scales dusted into the black
                    for (const pl of P.blue) soft(g, pl, { color: C.blue, alpha: under ? 0.45 : 0.62, blur: 0.8, fill: true });
                    for (const [p, r] of dustBlue) disc(g, p, 0.13 + 0.12 * r, r > 0.6 ? C.blueLight : C.blue, 0.7);
                    if (eye) {
                        fillAll([eye.ring], C.blackDeep, 1);
                        fillAll([eye.blue], C.blue, 0.95);
                        soft(g, eye.blue, { color: C.blueLight, alpha: 0.7, blur: 0.4, fill: true });
                        fillAll([eye.red], C.red, 1);
                        g.save();
                        g.beginPath();
                        S.trace(g, eye.red);
                        g.clip();
                        S.spray(g, eye.red, { color: C.redDeep, alpha: 0.85, w: 1.3 });
                        S.spray(g, eye.red, { color: C.redLight, alpha: 0.9, w: 1.1, dir: LIT });
                        g.restore();
                    }
                    // the veins, black on the yellow, and the bar that closes the cell
                    for (const v of veins) S.ink(g, v, { w: (under ? 0.5 : 0.75) * (0.55 + 0.45 * k), color: C.black, taper: [0.1, 0.1], alpha: 0.95 });
                    S.ink(g, cellEnd, { w: under ? 0.7 : 1.5, color: C.black, taper: [0.3, 0.3] });
                    // dust
                    for (const p of dustY) disc(g, p, 0.13, C.yellowLight, 0.42);
                    for (const p of dustB) disc(g, p, 0.12, '#4a3a20', 0.32);
                    for (const h of hairs) hairline(g, h, 0.18, r2() < 0.5 ? '#cfc08a' : '#5a5040', 0.6);
                    // the wing as a whole: shade from its root and its rear, a matt light towards the costa
                    S.spray(g, pts, { color: '#1a1420', alpha: far ? 0.5 : 0.3, w: 9, push: 5 });
                    S.spray(g, pts, { color: '#fff3c0', alpha: 0.16, w: 8, push: 4, dir: LIT });
                    if (far) {
                        g.fillStyle = 'rgba(24,20,44,0.2)';
                        g.fillRect(-500, -500, 1000, 1000);
                    }
                },
            });
        };
        const R = wingOf(1), Lw = wingOf(-1);
        const order = [R, Lw].sort((p, q) => p.z - q.z);
        // ---- legs: under everything; they only show when she is seen from her side
        const up = [0, -Math.sin(theta)]; // where «down, under the body» goes on the picture: (0, +) at fold 1
        const feet = [];
        if (fold > 0.45) {
            B.outlined(0.34, () => {
                for (const [x0, dx, len] of [[5.5, 3.5, 9.5], [3.4, 0.6, 10], [1.2, -3.2, 10.5]]) {
                    const a = [x0, 1.2 * Math.sin(theta)], kn = [x0 + dx * 0.5, a[1] - up[1] * len * 0.42], ft = [x0 + dx * 1.35, a[1] - up[1] * len];
                    feet.push(ft);
                    B.piece(strip(S.curve([a, kn, ft], false, 6), (u) => 0.42 - 0.2 * u).poly, { fill: '#2c2624', line: 0.3, ink: C.ink, rimA: 0.2, light: { color: '#b8a888', alpha: 0.8, w: 0.4, push: 0.1 } });
                }
            }, C.ink);
        }
        // ---- the wings, the far pair first; from below the hindwing lies over the forewing
        order.forEach((wing, i) => {
            const seq = wing.under ? [FLY_FW, FLY_HW] : [FLY_HW, FLY_FW];
            for (const W of seq) B.outlined(0.62, () => paintWing(W, wing, W === FLY_HW, i === 0 && fold > 0.5), C.ink);
        });
        // ---- the body: furry, black above and yellow along its sides
        const roll = Math.sin(theta); // how far the back's black stripe has turned out of sight
        const abdo = range(0, 1, 16).map((t) => [-1.5 - 15.5 * t, hy(0) * 0.4 + 0.5 * t * roll]);
        const ab = strip(abdo, (t) => 2.2 * Math.pow(1 - t * t, 0.6) + 0.3);
        const segs = range(0.1, 0.9, 7).map((t) => B.T([[-1.5 - 15.5 * t, hy(0) * 0.4 - 2.4], [-1.5 - 15.5 * t - 0.4, hy(0) * 0.4 + 2.4]]));
        const stripe = B.T(strip(abdo.map(([x, y]) => [x, y - roll * 1.7]), (t) => 1.05 * Math.pow(1 - t, 0.4) + 0.1).poly);
        const tuft = (cx, cy, rx, ry, n, len) => {
            const out = [];
            for (let i = 0; i < n; i++) {
                const a = rnd() * TAU, rr = Math.sqrt(rnd()), p = [cx + Math.cos(a) * rx * rr, cy + Math.sin(a) * ry * rr], l = len * (0.6 + 0.8 * rnd());
                out.push([B.pt(p), B.pt([p[0] - l, p[1] + (p[1] - cy) * 0.5 * l / ry]), rnd(), Math.abs(p[1] - cy) / ry]);
            }
            return out;
        };
        const thH = tuft(2.6, hy(0) * 0.4, 5, 2.9, 200, 2.2), abH = tuft(-7, hy(0) * 0.4, 8, 1.8, 90, 1.4);
        const drawTuft = (g, list) => {
            for (const [a, b, r, side] of list) hairline(g, [a, b], 0.2 + 0.14 * r, side > 0.62 + 0.2 * r ? C.side : r > 0.7 ? C.furLight : r > 0.35 ? '#4a4244' : C.blackDeep, 0.75);
        };
        B.outlined(0.6, () => {
            B.piece(ab.poly, {
                fill: C.side, line: 0.5, ink: C.ink, rim: C.blackDeep,
                cast: { blur: 1.6, dx: 0.7, dy: 1, color: 'rgba(10,8,16,0.55)' },
                shade: { color: '#6a5418', alpha: 0.85, w: 1.6 }, light: { color: '#fff0a8', alpha: 0.7, w: 1.2 },
                detail: (g) => {
                    g.fillStyle = C.black;
                    g.beginPath();
                    S.trace(g, stripe);
                    g.fill();
                    for (const sg of segs) hairline(g, sg, 0.26, C.blackDeep, 0.7);
                    drawTuft(g, abH);
                },
            });
            // thorax
            const th = [];
            for (let i = 0; i < 34; i++) {
                const a0 = (i / 34) * TAU, a1 = ((i + 0.6) / 34) * TAU, j = 1 + 0.1 * (0.4 + 0.6 * rnd());
                th.push([2.6 + Math.cos(a0) * 5.4, hy(0) * 0.4 + Math.sin(a0) * 3], [2.6 + Math.cos(a1) * 5.4 * j, hy(0) * 0.4 + Math.sin(a1) * 3 * j]);
            }
            B.piece(th, {
                fill: C.fur, line: 0.5, ink: C.ink, rim: C.blackDeep,
                cast: { blur: 1.6, dx: 0.6, dy: 0.9, color: 'rgba(10,8,16,0.55)' },
                shade: { color: C.blackDeep, alpha: 0.9, w: 2.2 }, light: { color: '#6a6470', alpha: 0.8, w: 1.8, push: 0.6 },
                detail: (g) => {
                    // the yellow shoulders, each side of the black back
                    for (const sg of [-1, 1]) soft(g, B.T([[-1.6, hy(0) * 0.4 + sg * 2.4 - roll * 1.4], [3, hy(0) * 0.4 + sg * 2.7 - roll * 1.4], [6.8, hy(0) * 0.4 + sg * 2 - roll * 1.2]]), { color: C.side, alpha: 0.85, w: 0.9, blur: 0.9 });
                    drawTuft(g, thH);
                },
            });
            // head and eyes
            const hc = [9.4, hy(0) * 0.4];
            B.piece(S.ellipse(hc[0], hc[1], 2.1, 2.2, 18), {
                fill: C.fur, line: 0.45, ink: C.ink, rim: C.blackDeep,
                shade: { color: C.blackDeep, alpha: 0.9, w: 1.2 }, light: { color: '#6a6470', alpha: 0.8, w: 1, push: 0.3 },
                detail: (g) => {
                    soft(g, B.T([[8, hc[1] - 1.5 - roll], [10.6, hc[1] - 1.3 - roll]]), { color: C.side, alpha: 0.8, w: 0.5, blur: 0.5 });
                    soft(g, B.T([[8, hc[1] + 1.5 - roll], [10.6, hc[1] + 1.3 - roll]]), { color: C.side, alpha: 0.8, w: 0.5, blur: 0.5 });
                },
            });
            for (const sg of fold > 0.6 ? [1] : [-1, 1]) {
                const ec = [9.9, hc[1] + sg * 1.62 * Math.cos(theta) + (fold > 0.6 ? 0.2 : 0)], e = B.pt(ec);
                B.piece(S.ellipse(ec[0], ec[1], 0.82, 0.74, 12), {
                    fill: '#4a2c1c', line: 0.36, ink: C.ink, shade: { color: '#140a08', alpha: 0.9, w: 0.7 }, light: { color: '#c98a5a', alpha: 0.9, w: 0.5 },
                    detail: (g) => disc(g, [e[0] + LIT[0] * 0.35, e[1] + LIT[1] * 0.35], 0.2, '#fff4e6', 0.9),
                });
            }
        }, C.ink);
        // ---- antennae: long, clubbed
        B.outlined(0.3, () => {
            for (const sg of [-1, 1]) {
                const side = sg * Math.cos(theta) - 0.7 * Math.sin(theta);
                const a = [10.8, hy(0) * 0.4 + sg * 0.7 * Math.cos(theta) - 0.6 * Math.sin(theta)];
                const line = S.curve([a, [a[0] + 5, a[1] + side * 2.2], [a[0] + 10, a[1] + side * 5.6], [a[0] + 13.4, a[1] + side * 8.8]], false, 8);
                B.piece(strip(line, (u) => 0.2 + 0.42 * smooth(0.8, 0.95, u) * (1 - 0.5 * smooth(0.97, 1, u))).poly, { fill: C.black, line: 0.26, ink: C.ink, rimA: 0.2, light: { color: '#9a8a7a', alpha: 0.9, w: 0.3, push: 0.08 } });
                const tip = B.pt(line[line.length - 2]);
                B.add([], (g) => disc(g, tip, 0.2, C.rust, 0.9));
            }
        }, C.ink);
        B.mark('mouth', [11.6, hy(0) * 0.4]);
        B.mark('feet', feet.length ? feet : [[4, 0]]);
    }
    KINDS.butterfly = { make: butterflyMake, defaults: { fold: 0.2 }, key: (q) => (q.fold ?? 0.2).toFixed(3), cast: { blur: 6, dx: 5, dy: 7, color: 'rgba(16,14,34,0.3)' } };

    // ================================================================== goldfinch
    const FINCH = {
        ink: '#15131c',
        red: '#c92a22', redLight: '#f26c4c', redDeep: '#7a121a',
        black: '#1c1b24', blackDeep: '#0b0a10', sheen: '#5a5e82', gleam: '#aab2da',
        white: '#f3efe2', whiteShade: '#aaa5ba', whiteDeep: '#7d7896', whiteLight: '#fffdf4',
        buff: '#b98a52', buffLight: '#e6c690', buffDeep: '#7a5430', buffDark: '#4a2f1c', tan: '#d4a86c',
        yellow: '#f0c41c', yellowLight: '#ffe873', yellowDeep: '#b5800a',
        bill: '#eedfc4', billShade: '#b89a86', billTip: '#5a4a50', leg: '#c08a6a', legLight: '#eec09c', legDeep: '#7a4a3a',
    };
    // A feather's outline: the shaft leaves b along the unit vector d for len, bending away
    // from n (its leading side); wl and wt the widths of the leading and trailing vanes.
    function quill(b, d, n, len, wl, wt, { bend = 0.03, tip = 3, tipM = 0.7, base = 0.5, N = 12 } = {}) {
        const shaft = [], lead = [], trail = [];
        for (let i = 0; i <= N; i++) {
            const u = 1 - Math.pow(1 - i / N, 1.5);
            const px = b[0] + d[0] * len * u - n[0] * bend * len * u * u, py = b[1] + d[1] * len * u - n[1] * bend * len * u * u;
            const t = norm([d[0] - n[0] * bend * 2 * u, d[1] - n[1] * bend * 2 * u]);
            let nx = -t[1], ny = t[0];
            if (nx * n[0] + ny * n[1] < 0) {
                nx = -nx;
                ny = -ny;
            }
            const p = (base + (1 - base) * smooth(0, 0.3, u)) * Math.pow(Math.max(0, 1 - Math.pow(u, tip)), tipM);
            shaft.push([px, py]);
            lead.push([px + nx * wl * p, py + ny * wl * p]);
            trail.push([px - nx * wt * p, py - ny * wt * p]);
        }
        return { poly: [...lead, ...trail.slice().reverse().slice(1)], shaft, lead, trail, n, d, wl, wt, len };
    }
    function goldfinchMake(B, o) {
        const C = FINCH, k = B.k, peck = o.pose === 1, rnd = Motion.rng('goldfinch/' + o.seed + '/' + o.pose);
        // pecking tips the whole bird forward about its hips; the feet stay where they are
        const beta = peck ? 0.66 : 0, piv = [2, 20], cb = Math.cos(beta), sb = Math.sin(beta);
        const R = (p) => [piv[0] + (p[0] - piv[0]) * cb - (p[1] - piv[1]) * sb, piv[1] + (p[0] - piv[0]) * sb + (p[1] - piv[1]) * cb];
        const RR = (pts) => pts.map(R), Rv = (v) => [v[0] * cb - v[1] * sb, v[0] * sb + v[1] * cb];
        const Wp = (p) => B.pt(R(p)), W = (pts) => pts.map(Wp);
        const mk = (b, deg, len, wl, wt, q) => {
            const d = [Math.cos(deg * DEG), Math.sin(deg * DEG)];
            return quill(b, d, [d[1], -d[0]], len, wl, wt, q); // n: to the left of the shaft's direction
        };
        // One feather. stops: its colours along the shaft; side +1: it lies over the one on its n side.
        const plume = (F, stops, q = {}) => {
            const side = q.side ?? 1, shaft = W(F.shaft), free = W(side > 0 ? F.lead : F.trail);
            const n = B.pt(Rv(F.n)), fn = [n[0] * side, n[1] * side], w = F.wl + F.wt, pale = !!q.pale;
            const barbs = [];
            if (q.barbs !== 0) {
                const nb = Math.max(4, Math.round(F.len / 2.2));
                for (let i = 1; i < nb; i++) {
                    const p = shaft[Math.round((i / nb) * (shaft.length - 1))], p2 = shaft[Math.min(shaft.length - 1, Math.round((i / nb) * (shaft.length - 1)) + 1)], t = norm([p2[0] - p[0], p2[1] - p[1]]);
                    for (const sg of [1, -1]) barbs.push([p, [p[0] + (t[0] * 0.8 + sg * n[0] * 0.6) * (sg > 0 ? F.wl : F.wt) * 1.5, p[1] + (t[1] * 0.8 + sg * n[1] * 0.6) * (sg > 0 ? F.wl : F.wt) * 1.5]]);
                }
            }
            B.piece(RR(F.poly), {
                fill: { from: shaft[0], to: shaft[shaft.length - 1], stops }, line: q.line ?? 0.5, ink: C.ink, rim: q.rim ?? (pale ? C.whiteDeep : C.blackDeep), rimA: 0.45, rimW: 0.7,
                cast: q.panel ? { blur: w * 0.16, dx: fn[0] * w * 0.08, dy: fn[1] * w * 0.08, color: 'rgba(40,26,4,0.5)' } : { blur: w * 0.45, dx: fn[0] * w * 0.2 + SH[0] * 0.5, dy: fn[1] * w * 0.2 + SH[1] * 0.5, color: pale ? 'rgba(74,66,110,0.45)' : 'rgba(6,6,16,0.7)' },
                shade: { color: q.deep ?? (pale ? C.whiteShade : C.blackDeep), alpha: pale ? 0.6 : 0.85, w: w * 0.5, dir: [-fn[0], -fn[1]] },
                light: { color: q.sheen ?? (pale ? C.whiteLight : C.sheen), alpha: q.lightA ?? (pale ? 0.8 : 0.6), w: w * 0.7, push: w * 0.3, dir: fn },
                detail: (g) => {
                    if (q.panel) {
                        // the yellow of the wing bar: on the web that shows, a little of it on the other
                        const N = shaft.length - 1, iu = (u) => Math.round(N * (1 - Math.pow(1 - u, 2 / 3)));
                        const i0 = iu(q.panel[0]), i1 = iu(q.panel[1]), lead = W(F.lead), trail = W(F.trail), pl = [];
                        for (let i = i0; i <= i1; i++) pl.push(mixP(shaft[i], trail[i], 0.45));
                        for (let i = i1; i >= i0; i--) pl.push(lead[i]);
                        const gr = g.createLinearGradient(shaft[i0][0], shaft[i0][1], shaft[i1][0], shaft[i1][1]);
                        gr.addColorStop(0, C.yellowDeep);
                        gr.addColorStop(0.18, C.yellow);
                        gr.addColorStop(0.8, C.yellow);
                        gr.addColorStop(1, C.yellowDeep);
                        g.fillStyle = gr;
                        g.beginPath();
                        S.trace(g, pl);
                        g.fill();
                        g.save();
                        g.clip();
                        S.spray(g, pl, { color: C.yellowDeep, alpha: 0.55, w: w * 0.3, dir: [-fn[0], -fn[1]] });
                        S.spray(g, pl, { color: C.yellowLight, alpha: 0.9, w: w * 0.4, dir: fn });
                        g.restore();
                    }
                    if (q.tipW) {
                        // a white tip, clean over everything
                        const N = shaft.length - 1, i0 = Math.round(N * (1 - Math.pow(q.tipW, 2 / 3))), lead = W(F.lead), trail = W(F.trail), pl = [];
                        for (let i = i0; i <= N; i++) pl.push(lead[i]);
                        for (let i = N; i >= i0; i--) pl.push(trail[i]);
                        pl.push(mixP(shaft[i0], shaft[Math.max(0, i0 - 1)], 0.8));
                        g.fillStyle = C.white;
                        g.beginPath();
                        S.trace(g, pl);
                        g.fill();
                        g.save();
                        g.clip();
                        S.spray(g, pl, { color: C.whiteShade, alpha: 0.7, w: w * 0.3 });
                        g.restore();
                    }
                    for (const bb of barbs) hairline(g, bb, 0.16, pale ? C.whiteDeep : q.panel ? '#6a4c08' : '#07070f', pale ? 0.3 : q.panel ? 0.22 : 0.4);
                    if (q.extra) q.extra(g, shaft, n);
                    hairline(g, free.slice(2, -1).map(([x, y]) => [x - fn[0] * 0.5, y - fn[1] * 0.5]), 0.28, pale ? C.whiteLight : C.gleam, pale ? 0.7 : 0.55);
                    S.ink(g, shaft, { w: Math.min(0.7, w * 0.12), color: pale ? '#a89c88' : '#06060c', taper: [0.1, 1], alpha: 0.9 });
                    S.ink(g, shaft.map(([x, y]) => [x + LIT[0] * 0.35, y + LIT[1] * 0.35]), { w: 0.25, color: pale ? '#ffffff' : C.gleam, taper: [0.5, 1], alpha: 0.5 });
                },
            });
        };
        const BLK = [[0, C.black], [1, C.blackDeep]];
        // short strokes that lie along a flow: the texture of small body feathers
        const strokes = (n, at, flow, len, cols, w = 0.3) => {
            const out = [];
            for (let i = 0; i < n; i++) {
                const p = at(), d = flow(p), l = len * (0.6 + 0.8 * rnd()), bend = (rnd() - 0.5) * 0.5;
                out.push([W([p, [p[0] + d[0] * l * 0.5 - d[1] * bend, p[1] + d[1] * l * 0.5 + d[0] * bend], [p[0] + d[0] * l, p[1] + d[1] * l]]), cols[Math.floor(rnd() * cols.length)], w * (0.7 + 0.6 * rnd())]);
            }
            return out;
        };
        const drawStrokes = (g, list, a = 0.6) => {
            for (const [ln, col, w] of list) hairline(g, ln, w, col, a);
        };

        // ---- the perch and the feet on it
        const P0 = o._perch ? o._perch[0] : [-22, 41.4], P1 = o._perch ? o._perch[1] : [34, 41.4];
        let pt0 = P0, pt1 = P1;
        if (pt1[0] < pt0[0]) [pt0, pt1] = [pt1, pt0];
        const pd = norm([pt1[0] - pt0[0], pt1[1] - pt0[1]]), pn = [pd[1], -pd[0]].map((v) => v * (pd[0] >= 0 ? 1 : -1)); // along the perch, and up from it
        const hwP = (o.perchW ?? 4.6) / 2;
        const onPerch = (p) => {
            const t = clamp(((p[0] - pt0[0]) * pd[0] + (p[1] - pt0[1]) * pd[1]) / (dist(pt0, pt1) || 1));
            return mixP(pt0, pt1, t);
        };
        const feet = [onPerch([9.5, 41]), onPerch([-2.5, 41])];
        B.mark('feet', feet);
        B.mark('perch', [pt0, pt1]);
        const foot = (F, root, farOne) => {
            const top = [F[0] + pn[0] * hwP, F[1] + pn[1] * hwP];
            const col = farOne ? mix(C.leg, C.legDeep, 0.5) : C.leg;
            const toe = (dx, drop, len, w0) => {
                // over the top of the perch, then down round its near face
                const line = S.curve([[top[0] + pd[0] * dx * 0.1, top[1] + pd[1] * dx * 0.1], [top[0] + pd[0] * dx * 0.6 + pn[0] * 0.5, top[1] + pd[1] * dx * 0.6 + pn[1] * 0.5], [top[0] + pd[0] * dx - pn[0] * drop * 0.35, top[1] + pd[1] * dx - pn[1] * drop * 0.35], [top[0] + pd[0] * (dx + Math.sign(dx) * len * 0.12) - pn[0] * drop, top[1] + pd[1] * (dx + Math.sign(dx) * len * 0.12) - pn[1] * drop]], false, 6);
                const st2 = strip(line, (u) => w0 * (1 - 0.35 * u) * (1 + 0.14 * Math.sin(u * 12)));
                const tl = B.T(line), end = line[line.length - 1], bk = Math.sign(dx);
                // the claw, hooked under
                B.ink([end, [end[0] + pd[0] * bk * 0.3 - pn[0] * 1.3, end[1] + pd[1] * bk * 0.3 - pn[1] * 1.3], [end[0] - pd[0] * bk * 0.9 - pn[0] * 2.3, end[1] - pd[1] * bk * 0.9 - pn[1] * 2.3]], { w: 0.75, color: '#2a2024', taper: [0, 1] });
                B.piece(st2.poly, {
                    fill: col, line: 0.42, ink: C.ink, rim: C.legDeep,
                    cast: { blur: 0.9, dx: 0.4, dy: 0.6, color: 'rgba(30,16,14,0.5)' },
                    shade: { color: C.legDeep, alpha: 0.85, w: 0.9 }, light: { color: C.legLight, alpha: farOne ? 0.4 : 0.9, w: 0.7, push: 0.2 },
                    detail: (g) => {
                        for (let i = 1; i < tl.length - 1; i += 2) {
                            const p = tl[i], q2 = tl[i + 1], t = norm([q2[0] - p[0], q2[1] - p[1]]);
                            hairline(g, [[p[0] - t[1] * w0, p[1] + t[0] * w0], [p[0] + t[1] * w0, p[1] - t[0] * w0]], 0.14, C.legDeep, 0.6);
                        }
                    },
                });
            };
            B.outlined(0.42, () => {
                toe(-3.6, hwP * 1.5, 5, 0.8); // the hind toe
                toe(5.4, hwP * 1.7, 6, 0.72);
                toe(3.8, hwP * 1.9, 6.5, 0.82);
                toe(2.2, hwP * 1.55, 5, 0.76);
                // the tarsus, in scutes
                const line = S.curve([root, mixP(root, top, 0.5).map((v, i) => v + (i ? 0 : -0.7)), top], false, 8), tl = B.T(line);
                B.piece(strip(line, (u) => 1.05 - 0.2 * Math.sin(u * Math.PI) + 0.25 * smooth(0.85, 1, u)).poly, {
                    fill: col, line: 0.45, ink: C.ink, rim: C.legDeep,
                    shade: { color: C.legDeep, alpha: 0.9, w: 1.1 }, light: { color: C.legLight, alpha: farOne ? 0.4 : 0.95, w: 0.8, push: 0.2 },
                    detail: (g) => {
                        for (let i = 2; i < tl.length - 1; i += 2) {
                            const p = tl[i], q2 = tl[i + 1], t = norm([q2[0] - p[0], q2[1] - p[1]]);
                            hairline(g, [[p[0] - t[1] * 1.1, p[1] + t[0] * 1.1], [p[0] + t[0] * 0.3, p[1] + t[1] * 0.3], [p[0] + t[1] * 1.1, p[1] - t[0] * 1.1]], 0.16, C.legDeep, 0.65);
                        }
                    },
                });
            }, C.ink);
        };
        foot(feet[1], R([-3, 21.5]), true);

        // ---- the tail: black, notched, with its white mirrors
        // (the middle feathers are the shortest and lie on top: that is the notch)
        const TR = [-27, 14.5];
        B.outlined(0.7, () => {
            for (const [deg, len, white, mirror] of [[144.5, 44, 0.07, 1], [147, 45.5, 0.06, 1], [149.5, 46, 0.07, 0], [152, 42.5, 0.11, 0], [154, 40, 0.12, 0]]) {
                const F = mk(TR, deg, len * (1 + (rnd() - 0.5) * 0.02), 2.3, 2.5, { bend: -0.01, tip: 5, tipM: 0.5 });
                plume(F, [[0, C.black], [1 - white - 0.02, C.blackDeep], [1 - white, C.white], [1, C.white]], {
                    side: 1,
                    extra: mirror ? (g, shaft, n) => {
                        // the white mirror on the inner web
                        const i0 = Math.round(shaft.length * 0.6), i1 = Math.round(shaft.length * 0.86), pl = [];
                        for (let i = i0; i <= i1; i++) pl.push([shaft[i][0] + n[0] * 0.3, shaft[i][1] + n[1] * 0.3]);
                        for (let i = i1; i >= i0; i--) pl.push([shaft[i][0] + n[0] * (0.5 + 1.7 * Math.sin(((i - i0) / (i1 - i0)) * Math.PI)), shaft[i][1] + n[1] * (0.5 + 1.7 * Math.sin(((i - i0) / (i1 - i0)) * Math.PI))]);
                        g.fillStyle = C.white;
                        g.beginPath();
                        S.trace(g, pl);
                        g.fill();
                    } : null,
                });
            }
        }, C.ink);
        // ---- under-tail coverts: long soft white feathers over the tail's root
        B.outlined(0.6, () => {
            for (const [b, deg, len] of [[[-20, 17], 167, 18.5], [[-12, 20.5], 170, 18], [[-16, 19], 169.5, 20.5]]) plume(mk(b, deg, len, 3, 3, { bend: 0, tip: 2.6, tipM: 0.7, base: 0.8 }), [[0, C.white], [1, '#e9e2d0']], { pale: true, side: 1 });
        }, C.ink);

        // ---- the body: breast, belly, flank
        const body = S.curve([[30, -21], [35.5, -10], [35.5, 1], [31, 10.5], [23, 17.5], [12, 22], [0, 23.5], [-12, 22.5], [-22, 19.5], [-29, 15.5], [-31.5, 11], [-26, 3], [-12, -8], [2, -18.5], [12, -26.5], [22, -27]], true, 7);
        const flow = (p) => norm([-0.55 - 0.012 * (p[1] + 10), 0.75 - 0.01 * p[0]]);
        const inBody = () => [-30 + rnd() * 66, -24 + rnd() * 48];
        const bodyStrokes = strokes(520, inBody, flow, 3.4, [C.whiteShade, C.whiteLight, C.whiteLight, C.buffLight], 0.3);
        const buffStrokes = strokes(260, () => (rnd() < 0.55 ? [21 + rnd() * 14, -18 + rnd() * 26] : [-14 + rnd() * 34, 5 + rnd() * 11]), flow, 3.6, [C.buff, C.buffDeep, C.buffLight, C.tan], 0.34);
        B.outlined(0.8, () => {
            B.piece(RR(body), {
                fill: C.white, line: 0.6, ink: C.ink, rim: C.whiteDeep,
                cast: { blur: 2.4, dx: 1, dy: 1.5, color: 'rgba(40,34,70,0.5)' },
                shade: [{ color: C.whiteShade, alpha: 0.95, w: 12, push: 7 }, { color: C.whiteDeep, alpha: 0.6, w: 4 }],
                light: { color: C.whiteLight, alpha: 0.8, w: 8, push: 3.5 },
                detail: (g) => {
                    // the buff of the breast's sides and of the flank
                    soft(g, W([[30, -17], [32, -7], [29.5, 3], [24, 9.5]]), { color: C.tan, alpha: 0.85, w: 6.5, blur: 5.5 });
                    soft(g, W([[28.5, -13], [29.5, -3], [27, 4]]), { color: C.buff, alpha: 0.6, w: 4, blur: 4 });
                    soft(g, W([[16, 9], [4, 12.5], [-12, 14]]), { color: C.tan, alpha: 0.8, w: 5.5, blur: 5.5 });
                    drawStrokes(g, bodyStrokes, 0.5);
                    drawStrokes(g, buffStrokes, 0.55);
                    // the belly turns under
                    soft(g, W([[24, 18], [10, 23.5], [-10, 24], [-24, 19.5]]), { color: C.whiteDeep, alpha: 0.5, w: 3, blur: 4 });
                },
            });
            // the white rump, over the tail's root
            plume(mk([-19, 2.5], 152, 15, 4, 4, { bend: 0, tip: 2.4, tipM: 0.7, base: 0.9 }), [[0, C.white], [1, '#e6dfd0']], { pale: true, side: 1 });
            plume(mk([-18, 6.5], 157, 14, 3.6, 3.6, { bend: 0, tip: 2.4, tipM: 0.7, base: 0.9 }), [[0, C.white], [1, '#e6dfd0']], { pale: true, side: -1 });
        }, C.ink);
        // the near leg: its feathered shank, the tarsus, the foot
        foot(feet[0], R([7.5, 21.5]), false);
        // ---- the folded wing: black, the broad yellow bar, white tips in a ladder
        const S0 = [17, -13], wa = norm([-60, 21]), wc = [wa[1], -wa[0]]; // along the wing to its tip; across it, towards the belly
        const wp = (s, r) => [S0[0] + wa[0] * s + wc[0] * r, S0[1] + wa[1] * s + wc[1] * r];
        const blade = (b, tipP, wl, wt, q) => {
            const d = norm([tipP[0] - b[0], tipP[1] - b[1]]);
            return quill(b, d, [-d[1], d[0]].map((v) => v * (wc[0] * -d[1] + wc[1] * d[0] > 0 ? 1 : -1)), dist(b, tipP), wl, wt, q); // n: towards the belly (the leading side)
        };
        B.outlined(0.75, () => {
            // primaries: the outermost lowest and longest; each inner one lies over it
            for (let i = 0; i < 6; i++) {
                const F = blade(wp(9, 9.6 - i * 1.05), wp(63 - i * 3.3, 8 - i * 1.3), 1.7, 2.7, { bend: 0.02, tip: 4, tipM: 0.6 });
                plume(F, BLK, { side: 1, panel: [0.2, 0.6 - i * 0.025], tipW: 0.05 });
            }
            // secondaries
            for (let j = 0; j < 5; j++) {
                const F = blade(wp(7, 3.6 - j * 1.1), wp(47 - j * 2.6, 1.4 - j * 1.15), 1.8, 3, { bend: 0.015, tip: 5, tipM: 0.5 });
                plume(F, BLK, { side: 1, panel: [0.18, 0.7 - j * 0.03], tipW: 0.1 });
            }
            // tertials: broad, with white ends
            for (let m = 0; m < 3; m++) {
                const F = blade(wp(3, -1.9 - m * 1.3), wp(38 - m * 4.6, -4.2 - m * 1.2), 2.2, 3.6, { bend: 0.01, tip: 3.4, tipM: 0.6 });
                plume(F, BLK, { side: 1, tipW: 0.17 });
            }
            // greater coverts: black at the root, yellow for most of their length
            for (let q = 0; q < 7; q++) {
                const F = blade(wp(4.5, 9 - q * 1.6), wp(21 + q * 0.5, 9 - q * 1.7), 1.7, 2.2, { bend: 0.02, tip: 3, tipM: 0.65 });
                plume(F, BLK, { side: 1, panel: [0.34, 1] });
            }
            // median and lesser coverts: small black scales, each with a dull edge
            for (let q = 0; q < 7; q++) plume(blade(wp(1.5, 8.6 - q * 1.6), wp(10.5 + q * 0.3, 8.8 - q * 1.7), 1.6, 2, { bend: 0.02, tip: 2.6, tipM: 0.7, base: 0.7 }), BLK, { side: 1, barbs: 0 });
            for (let q = 0; q < 8; q++) plume(blade(wp(-2.5, 7.4 - q * 1.35), wp(4.4 + q * 0.2, 7.8 - q * 1.5), 1.3, 1.7, { bend: 0, tip: 2.4, tipM: 0.7, base: 0.75 }), [[0, '#2a2622'], [1, C.black]], { side: 1, barbs: 0, sheen: '#6a5a4a' });
        }, C.ink);

        // ---- the mantle: buff-brown, in scallops, down over the wing's upper edge
        const mantleLow = range(0, 1, 42).map((v) => {
            const p = mixP([21.5, -14], [-16, -3.4], v), lobe = Math.abs(Math.sin(v * 7 * Math.PI + 0.3));
            return [p[0] - 1.2 * lobe + 0.9 * Math.sin(v * 3.1), p[1] + 2.1 * lobe * (0.7 + 0.3 * Math.sin(v * 23)) + 2.2 * Math.sin(v * Math.PI)];
        });
        const mantle = [...S.curve([[-17.5, -7.6], [-8, -13.4], [3, -20.6], [13, -28.5], [21, -22], [22, -16]], false, 7), ...mantleLow];
        const scallops = [];
        for (let i = 0; i < 46; i++) {
            const t = rnd(), across = rnd(), p = [lerp(17, -13, t) + (across - 0.5) * 3, lerp(-21, -6.5, t) + (across - 0.5) * 6], r0 = 1.4 + rnd() * 0.8;
            scallops.push([W(range(-1.2, 1.2, 6).map((a) => [p[0] + Math.cos(a + 2.55) * r0, p[1] + Math.sin(a + 2.55) * r0 * 1.2])), rnd()]);
        }
        const mantleStrokes = strokes(220, () => {
            const t = rnd();
            return [lerp(18, -15, t) + (rnd() - 0.5) * 6, lerp(-22, -6, t) + (rnd() - 0.5) * 9];
        }, () => norm([-0.82, 0.57]), 3.2, [C.buffDeep, C.buffLight, C.buff, C.buffDark], 0.3);
        B.outlined(0.7, () => {
            B.piece(RR(mantle), {
                fill: C.buff, line: 0.55, ink: C.ink, rim: C.buffDark,
                cast: { blur: 2.2, dx: 0.8, dy: 1.6, color: 'rgba(8,6,16,0.6)' },
                shade: [{ color: C.buffDeep, alpha: 0.95, w: 6, push: 3.4 }, { color: C.buffDark, alpha: 0.6, w: 2 }],
                light: { color: C.buffLight, alpha: 0.9, w: 5, push: 2.4 },
                detail: (g) => {
                    drawStrokes(g, mantleStrokes, 0.55);
                    for (const [sc, r] of scallops) {
                        hairline(g, sc, 0.3, C.buffDark, 0.35 + 0.3 * r);
                        hairline(g, sc.map(([x, y]) => [x + LIT[0] * 0.4, y + LIT[1] * 0.4]), 0.24, C.buffLight, 0.5);
                    }
                },
            });
        }, C.ink);
        // ---- the soft flank: loose buff feathers over the wing's lower edge
        B.outlined(0.34, () => {
            // the flank's loose feathers: their tips, in a ragged row, over the wing's lower edge
            const up = [], lobes = 7;
            for (let i = 0; i <= lobes * 6; i++) {
                const v = i / (lobes * 6), sv = lerp(3, 36, v), lobe = Math.abs(Math.sin(v * lobes * Math.PI + 0.4));
                up.push(wp(sv + 1.6 * lobe, 11.6 - 2.3 * lobe * (0.7 + 0.3 * Math.sin(v * 17)) + 0.04 * sv));
            }
            const fringe = [...up, wp(38, 17), wp(20, 20), wp(3, 18)];
            const fs = strokes(120, () => wp(3 + rnd() * 34, 10 + rnd() * 6), () => norm([wa[0] * 0.95 - wc[0] * 0.1, wa[1] * 0.95 - wc[1] * 0.1]), 3.4, [C.buffLight, C.tan, C.whiteLight, C.buff], 0.3);
            const upS = W(up), fr = W(fringe), dn = B.pt(Rv(wc)), top = Wp(wp(20, 9.5));
            B.add(fr, (g) => {
                // it melts into the body below, so only its ragged upper edge is drawn
                S.cast(g, (c) => {
                    c.beginPath();
                    S.trace(c, [...upS, ...upS.slice().reverse().map(([x, y]) => [x + dn[0] * 2.5, y + dn[1] * 2.5])]);
                    c.fillStyle = '#000';
                    c.fill();
                }, { blur: 1.2, dx: -dn[0] * 0.7, dy: -dn[1] * 0.7, color: 'rgba(6,6,16,0.5)' });
                const gr = g.createLinearGradient(top[0], top[1], top[0] + dn[0] * 8, top[1] + dn[1] * 8);
                gr.addColorStop(0, '#f1e4cb');
                gr.addColorStop(0.35, S.rgba('#e6cfa6', 0.95));
                gr.addColorStop(1, S.rgba('#d8b888', 0));
                g.fillStyle = gr;
                g.beginPath();
                S.trace(g, fr);
                g.fill();
                g.save();
                g.clip();
                drawStrokes(g, fs, 0.6);
                g.restore();
                hairline(g, upS.map(([x, y]) => [x + dn[0] * 0.5, y + dn[1] * 0.5]), 0.36, '#fff8e8', 0.7);
                hairline(g, upS, (B.line ? 0.34 : 0.3) * k + 0.1, B.ic(C.ink, C.buffDeep), B.line ? 0.9 : 0.6);
            });
        }, C.ink);

        // ---- the head
        const back = !peck && (o.look ?? 'back') === 'back';
        const Hc = [22, -33], tiltH = peck ? 0.34 : back ? 0.1 : -0.06, mx = back ? -1 : 1, cH = Math.cos(tiltH), sH = Math.sin(tiltH);
        const Hh = (p) => [Hc[0] + mx * (p[0] * cH - p[1] * sH), Hc[1] + p[0] * sH + p[1] * cH];
        const HH = (pts) => pts.map((p) => R(Hh(p))), Hw = (pts) => pts.map((p) => Wp(Hh(p)));
        const hflow = (p) => norm([-(p[0] - 14), -(p[1] - 1.5) * 0.9]); // feathers lie back from the bill
        const hs = (n, x0, x1, y0, y1, cols, len = 2) => {
            const out = [];
            for (let i = 0; i < n; i++) {
                const p = [x0 + rnd() * (x1 - x0), y0 + rnd() * (y1 - y0)], d = hflow(p), l = len * (0.6 + 0.8 * rnd());
                out.push([Hw([p, [p[0] + d[0] * l, p[1] + d[1] * l]]), cols[Math.floor(rnd() * cols.length)], 0.22 + 0.14 * rnd()]);
            }
            return out;
        };
        const headPts = S.curve([[13, -1], [11.6, -6.6], [7.6, -11], [1.5, -13], [-5.5, -12], [-11, -7.6], [-13.4, -1], [-12.4, 6], [-8, 11], [-1, 13.4], [5.5, 12.4], [10.4, 8.6], [12.6, 4]], true, 7);
        const crown = S.curve([[8.4, -10.6], [2, -13], [-5.5, -12], [-11, -7.6], [-13.4, -1], [-12.6, 5.4], [-9.6, 9.6], [-7.2, 9.4], [-7.4, 6.4], [-8.5, 0.6], [-6.4, -5], [-1.6, -7.5], [3.2, -6.4], [5.8, -9.3]], true, 6);
        const mask = S.curve([[8.6, -10.5], [11.6, -6.6], [13, -1], [12.6, 4], [10.4, 8.6], [6.4, 10.9], [4.2, 7.4], [3.3, 3.4], [2.5, -1], [3.4, -6], [5.9, -9.3]], true, 6);
        const lores = S.curve([[13.1, -3], [7.2, -4.6], [3.8, -3.8], [3.2, -2.2], [4.6, -0.8], [8.2, -0.2], [13.1, 0.8]], true, 5);
        const whiteS = hs(120, -9, 4, -8, 13, [C.whiteShade, C.whiteLight, C.whiteLight]), blackS = hs(110, -13, 8, -13, 10, [C.sheen, C.blackDeep, '#3a3c56']);
        const redS = hs(130, 2.4, 13, -10.5, 11, [C.redDeep, C.redLight, C.redLight, '#e2482e'], 1.7);
        const eye = Hh([5.3, -2.5]), ew = Wp(eye);
        B.mark('eye', R(eye));
        B.outlined(0.8, () => {
            // the cheek's white is the head's ground
            B.piece(HH(headPts), {
                fill: C.white, line: 0.6, ink: C.ink, rim: C.whiteDeep,
                cast: { blur: 2.6, dx: 1, dy: 1.8, color: 'rgba(40,28,40,0.55)' },
                shade: [{ color: C.whiteShade, alpha: 0.95, w: 7, push: 4 }, { color: C.whiteDeep, alpha: 0.55, w: 2.4 }],
                light: { color: C.whiteLight, alpha: 0.8, w: 5, push: 2 },
                detail: (g) => {
                    // a touch of buff where the cheek meets the throat
                    soft(g, Hw([[-4, 11.5], [3, 12.5]]), { color: C.buffLight, alpha: 0.6, w: 2.4, blur: 2.4 });
                    drawStrokes(g, whiteS, 0.5);
                },
            });
            // the black crown, coming down behind the cheek as a half collar
            B.piece(HH(crown), {
                fill: C.black, line: 0.5, ink: C.ink, rim: C.blackDeep,
                cast: { blur: 1.2, dx: 0.4, dy: 0.7, color: 'rgba(40,36,70,0.5)' },
                shade: [{ color: C.blackDeep, alpha: 0.9, w: 4, push: 2 }],
                light: { color: C.sheen, alpha: 0.9, w: 4, push: 1.8 },
                detail: (g) => {
                    drawStrokes(g, blackS, 0.6);
                    soft(g, Hw([[-4, -10.6], [1, -11.2], [5, -10]]), { color: C.gleam, alpha: 0.55, w: 0.6, blur: 1 });
                },
            });
            // the red mask
            B.piece(HH(mask), {
                fill: C.red, line: 0.5, ink: C.ink, rim: C.redDeep,
                cast: { blur: 1, dx: 0.3, dy: 0.5, color: 'rgba(50,30,50,0.45)' },
                shade: [{ color: C.redDeep, alpha: 0.95, w: 4.4, push: 2.4 }, { color: '#4a0c16', alpha: 0.5, w: 1.4 }],
                light: { color: C.redLight, alpha: 0.9, w: 3.4, push: 1.4 },
                detail: (g) => drawStrokes(g, redS, 0.65),
            });
            // the black lores, from the bill to the eye
            B.piece(HH(lores), { fill: C.blackDeep, line: 0.36, ink: C.ink, rimA: 0.2, light: { color: C.sheen, alpha: 0.6, w: 1, push: 0.3 } });
            // the eye: dark, wet, in a thin pale ring
            B.piece(RR(S.ellipse(eye[0], eye[1], 1.9, 1.9, 16)), {
                fill: '#2a1a14', line: 0.4, ink: '#07060a', rimA: 0,
                detail: (g) => {
                    disc(g, ew, 1.95, '#8d8aa6', 0.9);
                    disc(g, ew, 1.6, '#1c110c', 1);
                    disc(g, [ew[0] - LIT[0] * 0.3, ew[1] - LIT[1] * 0.3], 1.1, '#3f2414', 0.9);
                    disc(g, ew, 0.85, '#050408', 1);
                    disc(g, [ew[0] + LIT[0] * 0.62, ew[1] + LIT[1] * 0.62], 0.42, '#fbf8ee', 0.97);
                    disc(g, [ew[0] - LIT[0] * 0.7, ew[1] - LIT[1] * 0.7], 0.18, '#b8c4f0', 0.7);
                },
            });
            // the bill: a long ivory cone, dusky at the tip
            const upper = S.curve([[11.4, -3.6], [16.6, -2.9], [21.6, -0.9], [25.4, 2.3], [20, 2.2], [11.8, 1.7]], true, 6);
            const lower = S.curve([[11.8, 1.9], [20, 2.4], [25, 2.7], [21.4, 4.7], [16.2, 5.9], [11.3, 6.1]], true, 6);
            const tipG = (a, b) => ({ from: Wp(Hh(a)), to: Wp(Hh(b)), stops: [[0, C.bill], [0.62, C.bill], [0.86, '#a08a84'], [1, C.billTip]] });
            B.piece(HH(lower), {
                fill: tipG([11.5, 4], [25, 2.8]), line: 0.5, ink: C.ink, rim: C.billShade,
                shade: { color: C.billShade, alpha: 0.95, w: 2.2 }, light: { color: '#fff8e8', alpha: 0.6, w: 1.2 },
            });
            B.piece(HH(upper), {
                fill: tipG([11.5, -1], [25.4, 2.3]), line: 0.5, ink: C.ink, rim: C.billShade,
                cast: { blur: 0.8, dx: 0.2, dy: 0.5, color: 'rgba(60,40,40,0.5)' },
                shade: { color: C.billShade, alpha: 0.85, w: 1.8 }, light: { color: '#fffaf0', alpha: 0.9, w: 1.6, push: 0.5 },
                detail: (g) => {
                    // the culmen's gleam, the nostril under its bristles, the gape
                    hairline(g, Hw([[13, -2.6], [17.5, -1.9], [21, -0.4]]), 0.4, '#fffdf6', 0.85);
                    disc(g, Wp(Hh([13.2, -0.9])), 0.4, '#6a4a48', 0.9);
                    for (let i = 0; i < 7; i++) hairline(g, Hw([[11.6, -2.6 + i * 0.5], [13.6 + (i % 2) * 0.6, -2.2 + i * 0.42]]), 0.16, i % 2 ? C.blackDeep : '#7a2018', 0.8);
                },
            });
            B.ink(HH([[11.2, 1.8], [16, 2.1], [21, 2.3], [25.2, 2.5]]), { w: 0.5, color: C.ink, brush: '#6a5048', taper: [0.2, 0.9] });
        }, C.ink);
        B.mark('mouth', R(Hh([25.3, 2.5])));
        void k;
    }
    KINDS.goldfinch = {
        make: goldfinchMake, defaults: { pose: 0, perch: null, perchW: 4.6, look: 'back' },
        prep: (q) => {
            // the perch, given in the caller's units, in the bird's own frame
            if (!q.perch) return;
            const rho = q.flip ? -q.rot : q.rot, cr = Math.cos(rho), sr = Math.sin(rho), fx = q.flip ? -1 : 1;
            const loc = (X, Y) => {
                const x = (X - q.x) / q.s, y = (Y - q.y) / q.s;
                return [Math.round(fx * (x * cr + y * sr) * 10) / 10, Math.round((-x * sr + y * cr) * 10) / 10];
            };
            q._perch = [loc(q.perch[0], q.perch[1]), loc(q.perch[2], q.perch[3])];
        },
        key: (q) => [q.pose, q.look, q.perchW, q._perch ? q._perch.join(',') : ''].join('|'),
        cast: { blur: 5, dx: 3, dy: 4.5, color: 'rgba(12,12,30,0.42)' },
    };

    // @@CREATURES@@

    // ================================================================== water
    // One dew drop sitting on what is already painted: a lens. It is built on a copy of
    // the paint under it (magnified, darkened towards the light, lit on the far side),
    // and put back only where there was paint.
    const tmp = { a: null, b: null };
    function drop(g, { x = 0, y = 0, r = 8, rot = 0, squash = 1, pear = 0, shadow = 1 } = {}) {
        const m = g.getTransform(), k = Math.hypot(m.a, m.b);
        if (r * k < 0.6) return;
        const a = r / Math.sqrt(squash), b = r * Math.sqrt(squash), sd = (Math.round(x * 7.3 + y * 13.7 + r * 31) & 1023) + 1;
        const cr = Math.cos(rot), sr = Math.sin(rot);
        const out = [];
        for (let i = 0; i < 44; i++) {
            // a little out of true; a drop that runs is fuller at its lower end (+x of its own frame)
            const t = (i / 44) * TAU, w = 1 + 0.04 * S.noise2(Math.cos(t) * 1.4 + 3, Math.sin(t) * 1.4, sd);
            const px = Math.cos(t) * a * w, py = Math.sin(t) * b * w * (1 + pear * Math.cos(t));
            out.push([x + px * cr - py * sr, y + px * sr + py * cr]);
        }
        // the device box of the drop and its shadow
        const ext = Math.max(a, b) * 2.1 + 2 / k;
        const dx0 = m.a * x + m.c * y + m.e, dy0 = m.b * x + m.d * y + m.f, de = ext * k;
        const bx = Math.max(0, Math.floor(dx0 - de)), by = Math.max(0, Math.floor(dy0 - de));
        const bw = Math.min(g.canvas.width, Math.ceil(dx0 + de)) - bx, bh = Math.min(g.canvas.height, Math.ceil(dy0 + de)) - by;
        if (bw < 2 || bh < 2) return;
        if (!tmp.a) {
            tmp.a = document.createElement('canvas');
            tmp.b = document.createElement('canvas');
        }
        for (const c of [tmp.a, tmp.b]) {
            c.width = bw;
            c.height = bh;
        }
        const g0 = tmp.a.getContext('2d'), t = tmp.b.getContext('2d');
        g0.drawImage(g.canvas, bx, by, bw, bh, 0, 0, bw, bh);
        t.drawImage(tmp.a, 0, 0);
        const user = () => t.setTransform(m.a, m.b, m.c, m.d, m.e - bx, m.f - by);
        const path = (dx = 0, dy = 0) => {
            t.beginPath();
            S.trace(t, dx || dy ? out.map(([px, py]) => [px + dx, py + dy]) : out);
        };
        user();
        const rr = Math.min(a, b);
        // its shadow on the leaf, away from the light, and the light the drop gathers into it
        if (shadow > 0) {
            const sx = x + SH[0] * rr * 0.42, sy = y + SH[1] * rr * 0.5;
            const gr = t.createRadialGradient(sx, sy, rr * 0.5, sx, sy, Math.max(a, b) * 1.28);
            gr.addColorStop(0, `rgba(34,40,64,${0.62 * shadow})`);
            gr.addColorStop(0.62, `rgba(34,40,64,${0.4 * shadow})`);
            gr.addColorStop(1, 'rgba(34,40,64,0)');
            t.globalCompositeOperation = 'multiply';
            t.fillStyle = gr;
            t.fillRect(x - ext, y - ext, ext * 2, ext * 2);
            const qx = x + SH[0] * rr * 1.06, qy = y + SH[1] * rr * 1.08;
            t.globalCompositeOperation = 'screen';
            t.save();
            t.translate(qx, qy);
            t.rotate(Math.atan2(SH[1], SH[0]) + Math.PI / 2);
            t.scale(1, 0.5);
            const cg = t.createRadialGradient(0, 0, 0, 0, 0, rr * 0.5);
            cg.addColorStop(0, `rgba(255,250,214,${0.8 * shadow})`);
            cg.addColorStop(0.5, `rgba(255,246,200,${0.4 * shadow})`);
            cg.addColorStop(1, 'rgba(255,246,200,0)');
            t.fillStyle = cg;
            t.fillRect(-rr, -rr, rr * 2, rr * 2);
            t.restore();
            t.globalCompositeOperation = 'source-over';
        }
        // the lens: what is under it, larger
        t.save();
        path();
        t.clip();
        t.setTransform(1, 0, 0, 1, 0, 0);
        const M = 1.34, cxp = dx0 - bx, cyp = dy0 - by;
        t.imageSmoothingQuality = 'high';
        t.drawImage(tmp.a, cxp - cxp * M, cyp - cyp * M, bw * M, bh * M);
        user();
        // darkest just inside the lit edge: the light that enters there leaves on the far side
        t.globalCompositeOperation = 'multiply';
        let gr = t.createRadialGradient(x + LIT[0] * rr * 0.6, y + LIT[1] * rr * 0.6, 0, x + LIT[0] * rr * 0.6, y + LIT[1] * rr * 0.6, rr * 1.75);
        gr.addColorStop(0, 'rgba(70,66,80,0.86)');
        gr.addColorStop(0.5, 'rgba(96,92,100,0.5)');
        gr.addColorStop(1, 'rgba(110,106,112,0.06)');
        t.fillStyle = gr;
        t.fillRect(x - ext, y - ext, ext * 2, ext * 2);
        // … and glows where it comes out: the paint's own colour, brighter and more saturated
        for (const [mode, a0] of [['overlay', 0.7], ['color-dodge', 0.26], ['screen', 0.1]]) {
            t.globalCompositeOperation = mode;
            gr = t.createRadialGradient(x + SH[0] * rr * 0.62, y + SH[1] * rr * 0.62, 0, x + SH[0] * rr * 0.62, y + SH[1] * rr * 0.62, rr * 0.86);
            gr.addColorStop(0, `rgba(255,250,226,${a0})`);
            gr.addColorStop(0.55, `rgba(255,250,226,${a0 * 0.45})`);
            gr.addColorStop(1, 'rgba(255,250,226,0)');
            t.fillStyle = gr;
            t.fillRect(x - ext, y - ext, ext * 2, ext * 2);
        }
        t.globalCompositeOperation = 'screen';
        // a bright crescent inside the far edge
        path();
        path(LIT[0] * rr * 0.2, LIT[1] * rr * 0.2);
        t.fillStyle = 'rgba(255,253,236,0.62)';
        t.fill('evenodd');
        // a dark rim on the lit side
        t.globalCompositeOperation = 'multiply';
        const lg = t.createLinearGradient(x + LIT[0] * rr, y + LIT[1] * rr, x - LIT[0] * rr * 0.2, y - LIT[1] * rr * 0.2);
        lg.addColorStop(0, 'rgba(36,44,70,0.9)');
        lg.addColorStop(1, 'rgba(36,44,70,0)');
        t.strokeStyle = lg;
        t.lineWidth = Math.max(rr * 0.22, 0.8 / k);
        path();
        t.stroke();
        t.globalCompositeOperation = 'source-over';
        // the sky's window, sharp, near the top left; and a second tiny light opposite
        const hx = x + LIT[0] * rr * 0.5, hy = y + LIT[1] * rr * 0.52, ha = Math.atan2(LIT[1], LIT[0]) + Math.PI / 2;
        t.fillStyle = 'rgba(255,254,246,0.96)';
        t.beginPath();
        t.ellipse(hx, hy, Math.max(rr * 0.22, 0.5 / k), Math.max(rr * 0.13, 0.4 / k), ha, 0, 6.3);
        t.fill();
        t.beginPath();
        t.ellipse(hx + Math.cos(ha) * rr * 0.36 - LIT[0] * rr * 0.1, hy + Math.sin(ha) * rr * 0.36 - LIT[1] * rr * 0.1, rr * 0.07, rr * 0.05, ha, 0, 6.3);
        t.fill();
        t.fillStyle = 'rgba(255,254,246,0.85)';
        t.beginPath();
        t.arc(x + SH[0] * rr * 0.5 - SH[1] * rr * 0.16, y + SH[1] * rr * 0.5 + SH[0] * rr * 0.16, Math.max(rr * 0.07, 0.3 / k), 0, 6.3);
        t.fill();
        t.restore();
        // the drop's own edge: a hair of dark all round, so it holds on a pale ground
        user();
        t.globalCompositeOperation = 'multiply';
        t.strokeStyle = 'rgba(50,58,84,0.4)';
        t.lineWidth = Math.max(rr * 0.06, 0.5 / k);
        path();
        t.stroke();
        t.globalCompositeOperation = 'source-over';
        t.setTransform(1, 0, 0, 1, 0, 0);
        g.save();
        g.setTransform(1, 0, 0, 1, 0, 0);
        g.globalCompositeOperation = 'source-atop';
        g.globalAlpha = 1;
        g.drawImage(tmp.b, bx, by);
        g.restore();
    }

    // Some drops scattered over a box { x, y, w, h } or inside a closed path [[x, y], …].
    // The bigger ones have run (towards `down`, an angle: π/2 is straight down) and left
    // a wet track with a few beads in it. Only lands where there is paint.
    function drops(g, { box = null, path = null, n = 12, seed = 'dew', rMin = 2.5, rMax = 9, down = Math.PI / 2, run = 0.3 } = {}) {
        const rnd = Motion.rng('drops/' + seed), bb = box ?? S.bbox(path);
        const m = g.getTransform();
        const inPath = (p) => {
            if (!path) return true;
            let c = false;
            for (let i = 0, j = path.length - 1; i < path.length; j = i++) {
                const a = path[i], b = path[j];
                if ((a[1] > p[1]) !== (b[1] > p[1]) && p[0] < ((b[0] - a[0]) * (p[1] - a[1])) / (b[1] - a[1]) + a[0]) c = !c;
            }
            return c;
        };
        const painted = (p) => {
            const X = Math.round(m.a * p[0] + m.c * p[1] + m.e), Y = Math.round(m.b * p[0] + m.d * p[1] + m.f);
            if (X < 0 || Y < 0 || X >= g.canvas.width || Y >= g.canvas.height) return false;
            return g.getImageData(X, Y, 1, 1).data[3] > 200;
        };
        const placed = [];
        let tries = 0;
        while (placed.length < n && tries++ < n * 40) {
            const p = [bb.x + rnd() * bb.w, bb.y + rnd() * bb.h], r = rMin + (rMax - rMin) * Math.pow(rnd(), 2.2);
            if (!inPath(p) || placed.some((q) => dist(q.p, p) < (q.r + r) * 1.7 + 2)) continue;
            if (!painted(p)) continue;
            placed.push({ p, r, runs: r > rMin + (rMax - rMin) * (1 - run) * 0.7 && rnd() < 0.8, k: rnd() });
        }
        const d = [Math.cos(down), Math.sin(down)], u = [-d[1], d[0]];
        placed.sort((a, b) => a.r - b.r);
        for (const q of placed) {
            if (q.runs) {
                // the track it left: a film of water, darker, with a thread of light along it
                const len = q.r * (3 + 4 * q.k), top = [q.p[0] - d[0] * len, q.p[1] - d[1] * len];
                const mid = range(0, 1, 14).map((v) => {
                    const w = 0.5 * q.r * Math.sin(v * 5 + q.k * 6) * (1 - v) * 0.5;
                    return [lerp(top[0], q.p[0], v) + u[0] * w, lerp(top[1], q.p[1], v) + u[1] * w];
                });
                const st0 = strip(mid, (v) => q.r * (0.16 + 0.5 * v * v));
                g.save();
                g.globalCompositeOperation = 'source-atop';
                g.fillStyle = 'rgba(40,52,70,0.2)';
                g.beginPath();
                S.trace(g, st0.poly);
                g.fill();
                const lit = u[0] * LIT[0] + u[1] * LIT[1] > 0 ? st0.R : st0.L, dark = lit === st0.R ? st0.L : st0.R;
                hairline(g, lit, Math.max(q.r * 0.07, 0.25), '#fffef4', 0.55);
                hairline(g, dark, Math.max(q.r * 0.06, 0.2), '#2a3450', 0.35);
                g.restore();
                for (let i = 0; i < 3; i++) {
                    const v = 0.1 + 0.6 * ((i + q.k) / 3), p = mid[Math.round(v * 14)];
                    drop(g, { x: p[0] + u[0] * q.r * 0.3 * (i % 2 ? 1 : -1), y: p[1] + u[1] * q.r * 0.3 * (i % 2 ? 1 : -1), r: q.r * (0.16 + 0.1 * i), shadow: 0.7 });
                }
                drop(g, { x: q.p[0], y: q.p[1], r: q.r, rot: down, squash: 0.86, pear: 0.22 });
            } else {
                drop(g, { x: q.p[0], y: q.p[1], r: q.r, rot: q.k * 3, squash: 0.92 + 0.16 * q.k });
            }
        }
        return placed.map((q) => ({ x: q.p[0], y: q.p[1], r: q.r }));
    }

    // A small orb web, hair-thin, with a few beads of dew. Three ways to hang it:
    //   a fan in a corner: its hub at (x, y), radii from angle a0 to a1 (default a quarter), r long;
    //   a whole orb: a1 − a0 = 2π (pass full: true), hub at (x, y);
    //   between two points: to: [x1, y1]; the orb hangs in the middle, r its radius
    //   (default 0.36 of the gap), moored to both.
    function web(g, { x = 0, y = 0, r = 60, seed = 'web', a0 = 0, a1 = Math.PI / 2, to = null, full = false, color = '#e9edf7', alpha = 0.75, dew = 1, w = 0.4 } = {}) {
        const rnd = Motion.rng('web/' + seed);
        let hub = [x, y], R = r;
        const lines = [], beads = [];
        if (to) {
            hub = [(x + to[0]) / 2 + (rnd() - 0.5) * r * 0.1, (y + to[1]) / 2 + (rnd() - 0.5) * r * 0.1];
            R = Math.min(r, dist([x, y], to) * 0.36);
            full = true;
        }
        const whole = full || a1 - a0 > TAU - 0.01;
        if (whole) {
            a0 = rnd() * 0.3;
            a1 = a0 + TAU;
        }
        const nR = Math.max(4, Math.round(((a1 - a0) / TAU) * (15 + rnd() * 5)) + (whole ? 0 : 1));
        const radii = [];
        for (let i = 0; i < (whole ? nR : nR + 1); i++) {
            const a = a0 + ((a1 - a0) * (i + (whole || i === 0 || i === nR ? 0 : (rnd() - 0.5) * 0.4))) / nR;
            radii.push({ a, len: R * (whole ? 0.9 + rnd() * 0.16 : 0.84 + rnd() * 0.2) });
        }
        const at = (i, rr) => [hub[0] + Math.cos(radii[i].a) * rr, hub[1] + Math.sin(radii[i].a) * rr];
        // moorings: the frame threads that carry the orb
        if (to) {
            for (const [p, back] of [[[x, y], 0], [to, 1]]) {
                const ang = Math.atan2(p[1] - hub[1], p[0] - hub[0]);
                const near = radii.map((q, i) => [Math.abs(Math.atan2(Math.sin(q.a - ang), Math.cos(q.a - ang))), i]).sort((p1, p2) => p1[0] - p2[0]).slice(0, 3);
                for (const [, i] of near) lines.push([at(i, radii[i].len), p, 1]);
                void back;
            }
        }
        // radii, and the frame thread from tip to tip
        for (let i = 0; i < radii.length; i++) {
            lines.push([hub, at(i, radii[i].len), 1]);
            const j = (i + 1) % radii.length;
            if (whole || i < radii.length - 1) lines.push([at(i, radii[i].len), at(j, radii[j].len), 1.1]);
        }
        // the spiral: one sagging thread between each pair of radii, ring after ring;
        // a free zone round the hub, the hub's own tight mesh, a few threads gone
        const rings = [];
        for (let rr = R * 0.07; rr < R * 0.16; rr += R * 0.03) rings.push(rr);
        for (let rr = R * 0.26; rr < R * 0.9; rr += R * (0.045 + 0.012 * rnd())) rings.push(rr);
        const nSeg = whole ? radii.length : radii.length - 1;
        rings.forEach((rr, ri) => {
            for (let i = 0; i < nSeg; i++) {
                const j = (i + 1) % radii.length;
                if (rr > radii[i].len * 0.97 || rr > radii[j].len * 0.97) continue;
                if (ri > 2 && rnd() < 0.07) continue;
                const k0 = 1 + (rnd() - 0.5) * 0.05, pA = at(i, rr * k0), pB = at(j, rr * (whole ? 1 + (i / nSeg) * 0.04 : 1) * k0);
                // the thread sags towards the hub (and a little down, with its dew)
                const mid = mixP(pA, pB, 0.5), sag = dist(pA, pB) * (0.1 + 0.06 * rnd());
                const c = [mid[0] + (hub[0] - mid[0]) / (rr || 1) * sag, mid[1] + (hub[1] - mid[1]) / (rr || 1) * sag + sag * 0.25];
                lines.push([pA, pB, 0.8, c]);
                if (ri > 2 && rnd() < 0.2 * dew) {
                    const u = 0.3 + rnd() * 0.4, q = [(1 - u) * (1 - u) * pA[0] + 2 * u * (1 - u) * c[0] + u * u * pB[0], (1 - u) * (1 - u) * pA[1] + 2 * u * (1 - u) * c[1] + u * u * pB[1]];
                    beads.push([q, R * (0.006 + 0.012 * rnd() * rnd())]);
                }
            }
        });
        // a thread come loose
        if (lines.length > 6) {
            const i = Math.floor(rnd() * radii.length), p = at(i, radii[i].len * 0.7);
            lines.push([p, [p[0] + R * 0.03, p[1] + R * 0.22], 0.7, [p[0] + R * 0.07, p[1] + R * 0.1]]);
            beads.push([[p[0] + R * 0.03, p[1] + R * 0.22], R * 0.014]);
        }
        g.save();
        g.lineCap = 'round';
        for (const pass of [0, 1]) {
            g.strokeStyle = pass ? rgba(color, alpha) : 'rgba(14,16,36,0.28)';
            for (const [p, q, k, c] of lines) {
                const dx = pass ? 0 : SH[0] * w * 0.9, dy = pass ? 0 : SH[1] * w * 0.9;
                g.lineWidth = w * k;
                g.beginPath();
                g.moveTo(p[0] + dx, p[1] + dy);
                if (c) g.quadraticCurveTo(c[0] + dx, c[1] + dy, q[0] + dx, q[1] + dy);
                else g.lineTo(q[0] + dx, q[1] + dy);
                g.stroke();
            }
        }
        // dew: beads strung on the threads
        for (const [p, br0] of beads) {
            const br = Math.max(br0, w * 1.1);
            disc(g, [p[0] + SH[0] * br * 0.3, p[1] + SH[1] * br * 0.3], br * 1.05, '#10142c', 0.45);
            disc(g, p, br, '#b9c8e6', 0.6);
            disc(g, [p[0] + SH[0] * br * 0.3, p[1] + SH[1] * br * 0.3], br * 0.55, '#f2f6ff', 0.55);
            disc(g, [p[0] + LIT[0] * br * 0.4, p[1] + LIT[1] * br * 0.4], br * 0.34, '#fffef6', 0.98);
        }
        g.restore();
    }

    const api = { box, marks, drop, drops, web };
    for (const kind of Object.keys(KINDS)) api[kind] = drawer(kind);
    return api;
})();
