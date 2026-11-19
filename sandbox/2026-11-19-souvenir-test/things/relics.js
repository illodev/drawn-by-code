// Relics round the emblem, the ancient half of the wheel of peoples, oldest first, in the
// emblem manner (dark contour + airbrush; volumes are lit per pixel and brought back to the
// manner with sprayed shade and a contour). Museum pieces, each after a real object or type.
// Global: Relics. Sizes at s = 1, the anchor in the middle of each:
//   Relics.carambolo(g, { x, y, s, rot, seed })   236 × 196  Tartessos: the gold of El Carambolo
//   Relics.murex(g, { x, y, s, rot, seed })       176 × 156  Phoenicians: a dye-murex, its purple, a glass pendant
//   Relics.helmet(g, { x, y, s, rot, seed })      204 × 244  Greeks: a Corinthian helmet, patinated
//   Relics.amphora(g, { x, y, s, rot, seed })     264 × 304  Rome: a Dressel 20 oil amphora and sherds
//   Relics.mosaic(g, { x, y, s, rot, seed })      304 × 244  Rome: a fragment of a floor mosaic, a partridge
//   Relics.stele(g, { x, y, s, rot, seed })       172 × 262  Tartessos: a slate stele with the south-western script
// `seed` (default: the relic's name) re-rolls the hand: jitter, wear, which stones are lost.
// `rot` turns the object, never the light: each relic is painted once on a sheet of its own
// with the lamp turned the other way (Souvenir.lightFor, and the shade direction to match),
// then pasted turned; sheets are cached by seed, angle and resolution. Nothing takes time.
//
// What each one is, and the ten true things painted on it:
//
// CARAMBOLO (Camas, Seville, 7th c. BC; 24-carat gold, a Phoenician workshop for a Tartessian
// shrine). A pectoral in the shape of a stretched ox-hide (the shape of the copper ingots
// and of the altar found on the same hill) and one of the two cylindrical cuffs.
//  1 the ox-hide outline: four drawn-out corners, four concave sides, no two corners alike
//  2 rows that follow the outline, band inside band, as the goldsmith soldered them
//  3 hemispheres raised in cups, each with its own light, shade and reflected light
//  4 rosettes of eight petals round a bead, each in its cup, turned at random
//  5 bands of two-ply rope-twist wire between the rows, and a wire round the rim
//  6 a suspension tube with turned collars at the top, a loop-in-loop chain through it
//  7 a dent that has flattened four bosses, and a lost hemisphere (its empty cup, a solder scar)
//  8 the cuff: the same rows wrapped round a cylinder, thick rolled rims, the plain inside
//  9 burnishing scratches and red earth left in the hollows (deep shade is red-brown, not grey)
// 10 the cuff's shadow on the pectoral, the chain's on the ground
//
// MUREX (Bolinus brandaris, the spiny dye-murex the Phoenicians of Gadir crushed for purple).
//  1 a globular body whorl, a low spire of stepped whorls, a long straight siphonal canal
//  2 varices: each with a long spine on the shoulder and a shorter one below, hollow, grooved
//  3 spiral cords crossing fine axial growth ridges; brown spiral bands on ochre and cream
//  4 the flared outer lip, crenulated, with its own spines; the glazed inner lip (callus)
//  5 the porcelain aperture: pink to orange, dark in the throat; the canal's slit
//  6 a worn apex, pin-holes of a boring sponge, a worm tube, a chipped spine
//  7 the gland's dye: yellow-green where it is fresh at the lip, turning violet, then purple
//  8 the stain pooled and dried: a darker rim, drips, a dry-brushed drag, spatter
//  9 a rod-formed glass head pendant (Punic type): yellow face, stratified eyes of white and
//    dark blue, brows, a row of curls, a beard of coils, ears, the loop
// 10 its two-ply thread through the loop, knotted, frayed; weathered pits in the glass
//
// HELMET (the Corinthian type; one came out of the ría de Huelva, another from the Guadalete).
//  1 one sheet of bronze raised into a dome: the crown, with a faint carination over the brow
//  2 almond eye openings, pointed at the outer corner, dark and hollow, the far wall glimpsed
//  3 the long nose guard, worn bright along its ridge
//  4 cheek pieces that close to a narrow slit; the notch before the flared neck guard
//  5 a row of small holes along every edge, for stitching the lining; some corroded through
//  6 an incised line following the edges, and a palmette on two volutes at the brow
//  7 patina: green and blue-green crusts, brown bare patches rimmed in red cuprite
//  8 pitting, pale powdery bloom in the hollows, a few chalky sea encrustations
//  9 a crack at the crown with a lost flake; a dent in the cheek
// 10 the thickness of the sheet where the lamp catches the edge of an opening
//
// AMPHORA (Dressel 20: the globular oil jar of Baetica, the Guadalquivir's kilns; Monte
// Testaccio in Rome is a hill of them).
//  1 a near-spherical belly, a short neck, a thick rounded rim, a small knob at the base
//  2 two short, thick handles of round section, arched from under the rim to the shoulder
//  3 buff-orange fabric under a paler slip, worn through on the belly; a grey firing cloud
//  4 turning lines (rilling) all the way down, finger-smears where the handles were luted on
//  5 a potter's stamp in a rectangular cartouche on a handle: L·Q·S in raised letters
//  6 tituli picti in black: the tare (α) on the neck, the shipper's name in rustic capitals
//    (β), the oil's weight (γ), and the oblique cursive control note by the handle (δ)
//  7 a spall showing the gritty break (quartz and grog), and a hairline crack from it
//  8 lime encrustation, rootlet marks, a dark run of oil from the mouth
//  9 the mouth seen a little from above: the dark throat, the rim's own thickness
// 10 three sherds beside it: a wall sherd with its section, a handle stub with a grey core,
//    a sherd lying inside-up
//
// MOSAIC (Italica, the House of the Birds: small square panels, each with one bird, round a
// central scene). A broken-off fragment: a red-legged partridge in its panel.
//  1 every tessera its own stone: a quadrilateral, never quite square, its own tone
//  2 rows that follow the bird (opus vermiculatum) and two rows of ground that outline it
//  3 straight courses in the white ground (opus tessellatum), cut to fit where they meet
//  4 the partridge: red bill and legs, a white throat in a black collar, barred flanks
//  5 a two-strand guilloche on black, each strand shaded across in three stones, with eyes
//  6 a black fillet each side of the braid; a sprig with a red berry under the bird
//  7 mortar joints, darker with dirt; a few stones lost, the pink bed showing their sockets
//  8 the ragged edge of the break, tesserae hanging on, others loose on the ground
//  9 the section at the break: the setting bed, the pink nucleus with crushed brick, the rudus
// 10 limescale bloom, a burnt patch, a stone replaced in antiquity with the wrong colour
//
// STELE (the south-west, 7th–5th c. BC: grave slabs of slate with the oldest script of the
// peninsula, still undeciphered; one from Abóbada shows a warrior inside the text).
//  1 a slab of slate, cleaved flat, broken clean across one corner
//  2 the text in a band that runs round the edge and turns inward, between two scored lines
//  3 signs cut as plain strokes, read right to left, none quite on the line
//  4 a schematic warrior: a round shield with rings, a sword, a mirror with its handle
//  5 cleavage steps and laminations of the slate; lichen in orange and grey-green rosettes
//  6 the cut lines paler than the stone, weathered, some lost in a flaked patch
//  7 a spear and a comb beside him; two furrows a plough dragged across; rust stains
const Relics = (() => {
    const S = Souvenir;
    const INK = S.INK, TAU = Math.PI * 2;
    const clamp = S.clamp, smooth = S.smooth, mix = S.mix, rgba = S.rgba;
    const cache = new Map();
    const memo = (key, fn) => {
        if (!cache.has(key)) cache.set(key, fn());
        return cache.get(key);
    };
    // pixels per unit for a sheet: the output's, rounded up to half steps
    const resOf = (g, s) => Math.min(6, Math.max(1, Math.ceil(S.pxScale(g) * s * 2 - 1e-6) / 2));

    // ------------------------------------------------------------------ geometry
    const rotP = (p, a) => {
        const c = Math.cos(a), s = Math.sin(a);
        return [p[0] * c - p[1] * s, p[0] * s + p[1] * c];
    };
    const lerpP = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
    const dot2 = (a, b) => a[0] * b[0] + a[1] * b[1];
    const pol = (r, a, cx = 0, cy = 0) => [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
    // A frame maps a part's own coordinates to the sheet's (and back with `inv`): parts are
    // turned point by point, the context never is.
    function frame(x, y, rot = 0, s = 1) {
        const c = Math.cos(rot), sn = Math.sin(rot);
        const f = (p) => [x + (p[0] * c - p[1] * sn) * s, y + (p[0] * sn + p[1] * c) * s];
        f.pts = (a) => a.map(f);
        f.inv = (p) => {
            const dx = p[0] - x, dy = p[1] - y;
            return [(dx * c + dy * sn) / s, (-dx * sn + dy * c) / s];
        };
        f.dir = (v) => rotP(v, rot);
        f.rot = rot;
        f.s = s;
        f.sub = (px, py, r2 = 0, s2 = 1) => {
            const o = f([px, py]);
            return frame(o[0], o[1], rot + r2, s * s2);
        };
        return f;
    }
    const even = (b) => {
        const x = Math.floor(b.x / 2) * 2, y = Math.floor(b.y / 2) * 2;
        return { x, y, w: Math.ceil((b.x + b.w - x) / 2) * 2, h: Math.ceil((b.y + b.h - y) / 2) * 2 };
    };
    const plen = (pts) => {
        let l = 0;
        for (let i = 1; i < pts.length; i++) l += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
        return l;
    };
    // a polyline walked in even steps: [{ p, t, n, s }]
    function walk(pts, step = 0.5) {
        const out = [];
        let acc = 0, next = 0;
        for (let i = 1; i < pts.length; i++) {
            const a = pts[i - 1], b = pts[i], d = Math.hypot(b[0] - a[0], b[1] - a[1]);
            if (d < 1e-9) continue;
            while (next <= acc + d + 1e-9) {
                const u = (next - acc) / d;
                out.push({ p: [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u], s: next });
                next += step;
            }
            acc += d;
        }
        const k = Math.max(1, Math.round(1.5 / step));
        for (let i = 0; i < out.length; i++) {
            const a = out[Math.max(0, i - k)].p, b = out[Math.min(out.length - 1, i + k)].p, l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
            out[i].t = [(b[0] - a[0]) / l, (b[1] - a[1]) / l];
            out[i].n = [-out[i].t[1], out[i].t[0]];
        }
        return out;
    }
    // a band about a centre line, w0 wide at its start and w1 at its end (or w(u) → width)
    function band(line, w0, w1 = w0) {
        const st = walk(line, 1), n = st.length, L = [], R = [];
        st.forEach((q, i) => {
            const u = i / Math.max(1, n - 1), w = (typeof w0 === 'function' ? w0(u) : w0 + (w1 - w0) * u) / 2;
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
    // a polyline eased by a moving average (closed ones keep their first point repeated)
    function eased(pts, passes = 2, closed = false) {
        let a = closed ? pts.slice(0, -1) : pts.slice();
        const n = a.length;
        for (let k = 0; k < passes; k++) {
            a = a.map((p, i) => {
                if (!closed && (i === 0 || i === n - 1)) return p;
                const q = a[(i - 1 + n) % n], r = a[(i + 1) % n];
                return [(q[0] + 2 * p[0] + r[0]) / 4, (q[1] + 2 * p[1] + r[1]) / 4];
            });
        }
        if (closed) a.push(a[0]);
        return a;
    }

    // Value noise shows its lattice as soon as it is thresholded (square blotches): two
    // octaves on turned axes hide it. For every mask of patina, crust, wear.
    const fbm = (x, y, s) => S.noise2(x * 0.8 + y * 0.6, y * 0.8 - x * 0.6, s) * 0.6 + S.noise2((x * 0.5 - y * 0.87) * 2.1, (y * 0.5 + x * 0.87) * 2.1, s + 1) * 0.4;

    // ------------------------------------------------------------------ small painting tools
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
    const sheet = (box, res) => {
        const c = document.createElement('canvas');
        c.width = Math.max(2, Math.ceil(box.w * res));
        c.height = Math.max(2, Math.ceil(box.h * res));
        const G = c.getContext('2d');
        G.setTransform(res, 0, 0, res, -box.x * res, -box.y * res);
        return { canvas: c, G, box };
    };
    const cut = (g, fn) => {
        g.save();
        g.globalCompositeOperation = 'destination-out';
        g.fillStyle = '#000';
        fn(g);
        g.restore();
    };
    // The lamp as a sheet that will be pasted turned by `rot` sees it.
    const kit = (rot, res, seed) => {
        const L = S.lightFor(rot), c = Math.cos(-rot), s = Math.sin(-rot), D = S.SHADE_DIR;
        const sd = [D[0] * c - D[1] * s, D[0] * s + D[1] * c];
        return { L, sd, tol: [-sd[0], -sd[1]], res, seed, rot };
    };

    // The airbrush on a sprite: colour sprayed in from its own edges (holes included), `w`
    // units deep, from the side `dir` points to (after `sprayIn` in things/ribbon.js).
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
        g.shadowColor = rgba(color, alpha);
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
    // Lays a sprite on a sheet the emblem way: its shadow on what is already there, its
    // silhouette in ink a line's width bigger (heavier towards the shade), then itself.
    function stamp(G, sp, K, { lw = 2.2, heavy = 0.75, cast = null, ink = INK, at = [0, 0] } = {}) {
        const b = sp.box, sh = K.sd, x0 = b.x + at[0], y0 = b.y + at[1];
        const sil = document.createElement('canvas');
        sil.width = sp.canvas.width;
        sil.height = sp.canvas.height;
        const q = sil.getContext('2d');
        q.drawImage(sp.canvas, 0, 0);
        q.globalCompositeOperation = 'source-in';
        q.fillStyle = ink;
        q.fillRect(0, 0, sil.width, sil.height);
        if (cast) S.cast(G, (c) => c.drawImage(sil, x0, y0, b.w, b.h), { blur: 3, color: 'rgba(14,8,26,0.6)', ...cast, dx: sh[0] * (cast.d ?? 3), dy: sh[1] * (cast.d ?? 3) });
        if (lw > 0) {
            const d = lw * 0.8;
            for (const k of [0, 0.5, 1]) {
                for (let j = 0; j < 16; j++) G.drawImage(sil, x0 + sh[0] * lw * heavy * k + Math.cos(j * 0.3927) * d, y0 + sh[1] * lw * heavy * k + Math.sin(j * 0.3927) * d, b.w, b.h);
            }
        }
        G.drawImage(sp.canvas, x0, y0, b.w, b.h);
    }
    // One piece in the emblem manner, as Souvenir.piece, but under the sheet's own lamp.
    function piece(g, K, pts, o = {}) {
        const lw = o.line ?? 2, ink = o.ink ?? INK, heavy = o.heavy ?? 0.7, sd = K.sd;
        const outline = () => {
            g.beginPath();
            S.trace(g, pts);
        };
        if (o.cast) S.cast(g, (q) => fillPts(q, pts, '#000'), { blur: 3, color: 'rgba(14,8,26,0.6)', ...o.cast, dx: sd[0] * (o.cast.d ?? 2.5), dy: sd[1] * (o.cast.d ?? 2.5) });
        if (lw > 0) {
            g.save();
            g.translate(sd[0] * lw * heavy, sd[1] * lw * heavy);
            outline();
            g.fillStyle = ink;
            g.fill();
            g.lineJoin = 'round';
            g.lineWidth = lw;
            g.strokeStyle = ink;
            g.stroke();
            g.restore();
        }
        if (o.fill && typeof o.fill === 'object') {
            const gr = g.createLinearGradient(o.fill.from[0], o.fill.from[1], o.fill.to[0], o.fill.to[1]);
            for (const [t, c] of o.fill.stops) gr.addColorStop(t, c);
            g.fillStyle = gr;
        } else {
            g.fillStyle = o.fill ?? '#ccc';
        }
        outline();
        g.fill();
        g.save();
        outline();
        g.clip();
        for (const sh of [].concat(o.shade ?? [])) S.spray(g, pts, { dir: sd, ...sh });
        for (const li of [].concat(o.light ?? [])) S.spray(g, pts, { color: '#ffffff', alpha: 0.4, dir: K.tol, ...li });
        if (o.detail) o.detail(g);
        g.restore();
        if (lw > 0) {
            outline();
            g.lineJoin = 'round';
            g.lineWidth = lw;
            g.strokeStyle = ink;
            g.stroke();
        }
    }
    // ------------------------------------------------------------------ fields
    // A scalar field over a box, `res` cells per unit: a relief to light, a distance, a mask.
    // Bumps are written straight into it; anything easier to draw than to write as a formula
    // (wires, grooves, cracks) is painted with the canvas in greys and read back.
    function Field(box, res) {
        const w = Math.max(2, Math.ceil(box.w * res)), h = Math.max(2, Math.ceil(box.h * res));
        const a = new Float32Array(w * h);
        const F = { box, res, w, h, a };
        F.i = (x, y) => Math.min(h - 1, Math.max(0, Math.round((y - box.y) * res))) * w + Math.min(w - 1, Math.max(0, Math.round((x - box.x) * res)));
        F.at = (x, y) => a[F.i(x, y)];
        F.lin = (x, y) => {
            const fx = Math.min(w - 1.001, Math.max(0, (x - box.x) * res)), fy = Math.min(h - 1.001, Math.max(0, (y - box.y) * res));
            const x0 = Math.floor(fx), y0 = Math.floor(fy), ax = fx - x0, ay = fy - y0, i = y0 * w + x0;
            return (a[i] * (1 - ax) + a[i + 1] * ax) * (1 - ay) + (a[i + w] * (1 - ax) + a[i + w + 1] * ax) * ay;
        };
        // fn(dx, dy) → a height, merged within R units of (cx, cy)
        F.bump = (cx, cy, R, fn, mode = 'max') => {
            const x0 = Math.max(0, Math.floor((cx - R - box.x) * res)), x1 = Math.min(w - 1, Math.ceil((cx + R - box.x) * res));
            const y0 = Math.max(0, Math.floor((cy - R - box.y) * res)), y1 = Math.min(h - 1, Math.ceil((cy + R - box.y) * res));
            for (let y = y0; y <= y1; y++) {
                for (let x = x0; x <= x1; x++) {
                    const v = fn(box.x + x / res - cx, box.y + y / res - cy), i = y * w + x;
                    if (mode === 'max') {
                        if (v > a[i]) a[i] = v;
                    } else if (mode === 'add') a[i] += v;
                    else a[i] *= v;
                }
            }
        };
        // paint(q) in greys on black: white is `scale` units
        F.paint = (scale, paint, mode = 'max', blur = 0) => {
            const c = document.createElement('canvas');
            c.width = w;
            c.height = h;
            const q = c.getContext('2d', { willReadFrequently: true });
            q.fillStyle = '#000';
            q.fillRect(0, 0, w, h);
            q.setTransform(res, 0, 0, res, -box.x * res, -box.y * res);
            if (blur) q.filter = `blur(${(blur * res).toFixed(2)}px)`;
            paint(q);
            const d = q.getImageData(0, 0, w, h).data;
            for (let i = 0; i < w * h; i++) {
                const v = (d[i * 4] / 255) * scale;
                if (mode === 'max') {
                    if (v > a[i]) a[i] = v;
                } else if (mode === 'add') a[i] += v;
                else if (mode === 'sub') a[i] -= v;
                else a[i] = v;
            }
            return F;
        };
        // how far each cell lies under its surroundings (0 on a crest): where dirt and shade sit
        F.hollows = (r) => {
            const b = S.boxBlur(Float32Array.from(a), w, h, Math.max(1, Math.round(r * res)), 2), H = Field(box, res);
            for (let i = 0; i < w * h; i++) H.a[i] = b[i] - a[i];
            return H;
        };
        return F;
    }
    // the distance (in units) from every cell inside what `paint` fills to its outline
    function distField(box, res, paint) {
        const F = Field(box, res), c = document.createElement('canvas');
        c.width = F.w;
        c.height = F.h;
        const q = c.getContext('2d', { willReadFrequently: true });
        q.setTransform(res, 0, 0, res, -box.x * res, -box.y * res);
        q.fillStyle = '#fff';
        paint(q);
        const d = q.getImageData(0, 0, F.w, F.h).data, m = new Uint8Array(F.w * F.h);
        for (let i = 0; i < m.length; i++) m[i] = d[i * 4 + 3] > 127 ? 1 : 0;
        const e = S.edt(m, F.w, F.h);
        for (let i = 0; i < m.length; i++) F.a[i] = e[i] / res;
        F.mask = m;
        return F;
    }
    // The lines along which a field has the value `level` (marching squares, chained):
    // polylines in units; closed ones repeat their first point.
    function isolines(F, level) {
        const { w, h, a, box, res } = F, adj = new Map();
        const link = (k1, k2) => {
            if (!adj.has(k1)) adj.set(k1, []);
            if (!adj.has(k2)) adj.set(k2, []);
            adj.get(k1).push(k2);
            adj.get(k2).push(k1);
        };
        for (let y = 0; y < h - 1; y++) {
            for (let x = 0; x < w - 1; x++) {
                const i = y * w + x;
                const c = (a[i] >= level ? 1 : 0) | (a[i + 1] >= level ? 2 : 0) | (a[i + w + 1] >= level ? 4 : 0) | (a[i + w] >= level ? 8 : 0);
                if (c === 0 || c === 15) continue;
                const T = i * 2, B = (i + w) * 2, Lf = i * 2 + 1, R = (i + 1) * 2 + 1;
                if (c === 1 || c === 14) link(Lf, T);
                else if (c === 2 || c === 13) link(T, R);
                else if (c === 3 || c === 12) link(Lf, R);
                else if (c === 4 || c === 11) link(R, B);
                else if (c === 6 || c === 9) link(T, B);
                else if (c === 7 || c === 8) link(Lf, B);
                else if (c === 5) {
                    link(Lf, T);
                    link(R, B);
                } else {
                    link(T, R);
                    link(Lf, B);
                }
            }
        }
        const pt = (k) => {
            const i = k >> 1, x = i % w, y = (i - x) / w, v0 = a[i], v1 = k & 1 ? a[i + w] : a[i + 1], u = (level - v0) / (v1 - v0 || 1);
            return k & 1 ? [box.x + (x + 0.5) / res, box.y + (y + u + 0.5) / res] : [box.x + (x + u + 0.5) / res, box.y + (y + 0.5) / res];
        };
        const seen = new Set(), lines = [];
        const follow = (prev, cur) => {
            const out = [];
            while (cur !== undefined && !seen.has(cur)) {
                seen.add(cur);
                out.push(cur);
                const nb = adj.get(cur), nx = nb[0] === prev ? nb[1] : nb[0];
                prev = cur;
                cur = nx;
            }
            return { out, end: cur };
        };
        for (const k0 of adj.keys()) {
            if (seen.has(k0)) continue;
            seen.add(k0);
            const nb = adj.get(k0), f = follow(k0, nb[0]), closed = f.end === k0;
            let keys = [k0, ...f.out];
            if (!closed && nb.length > 1) keys = [...follow(k0, nb[1]).out.reverse(), ...keys];
            const pts = keys.map(pt);
            if (closed) pts.push(pts[0]);
            lines.push(pts);
        }
        return lines;
    }

    // One relic: `paint(G, K)` on a sheet of its own (K: the lamp for that sheet), pasted turned.
    const relic = (kind, box, paint) => (g, o = {}) => {
        const { x = 0, y = 0, s = 1, rot = 0, seed = kind } = o;
        const r = Math.round(rot * 64) / 64, res = resOf(g, s);
        const sp = memo(`${kind}/${seed}/${r}@${res}`, () => {
            const sh = sheet(box, res);
            paint(sh.G, kit(r, res, String(seed)));
            return { canvas: sh.canvas, box };
        });
        S.cast(g, (q) => S.put(q, sp, { x, y, rot, s }), { blur: 8 * s, dx: 4 * s, dy: 6 * s, color: 'rgba(12,7,26,0.55)' });
        S.put(g, sp, { x, y, rot, s });
    };

    // ------------------------------------------------------------------ 1 · the gold of El Carambolo
    // Heavy, buttery gold: the lights warm and pale, the deep shade a red-brown.
    const GOLD = [[0, '#2a0c08'], [0.16, '#55200e'], [0.33, '#8c4712'], [0.5, '#b4741e'], [0.66, '#d39c32'], [0.78, '#e8c054'], [0.89, '#f8e394'], [1, '#fffbe2']];
    const GV = { base: '#d9a63c', deep: '#7c3a10', light: '#f8e394', glint: '#fffbe2', ink: '#3a1408' };

    // repoussé, as heights: a hemisphere, a ring (a cup's rim), petals round a bead
    const dome = (F, cx, cy, r, h = r) => F.bump(cx, cy, r, (dx, dy) => {
        const q = 1 - (dx * dx + dy * dy) / (r * r);
        return q > 0 ? h * Math.sqrt(q) : 0;
    });
    const rim = (F, cx, cy, rc, wr, h) => F.bump(cx, cy, rc + wr, (dx, dy) => {
        const d = (Math.hypot(dx, dy) - rc) / wr, q = 1 - d * d;
        return q > 0 ? h * Math.sqrt(q) : 0;
    });
    const petals = (F, cx, cy, n, r0, r1, h, ph) => F.bump(cx, cy, r1, (dx, dy) => {
        const d = Math.hypot(dx, dy);
        if (d <= r0 || d >= r1) return 0;
        const u = (d - r0) / (r1 - r0), rad = Math.sin(Math.PI * Math.pow(u, 0.62));
        const ang = (Math.abs(Math.cos((Math.atan2(dy, dx) + ph) * n * 0.5)) - 0.16 - 0.2 * (1 - u)) / 0.7;
        return ang > 0 ? h * Math.pow(rad * Math.min(1, ang), 0.4) : 0;
    });
    // one boss of the plan, raised on a field (k: squashed by a dent)
    function raise(F, b, k = 1) {
        const [x, y] = b.p;
        if (b.kind === 'small') dome(F, x, y, b.r, b.r * 0.92 * k);
        else if (b.kind === 'hemi' || b.kind === 'empty') {
            rim(F, x, y, b.rc, 0.75, 0.95);
            if (b.kind === 'hemi') dome(F, x, y, b.r, b.r * 0.9 * k);
        } else {
            rim(F, x, y, b.rc, 0.75, 0.95);
            petals(F, x, y, 8, b.r * 0.26, b.r * 1.02, 1.3 * k, b.ph);
            dome(F, x, y, b.r * 0.3, b.r * 0.4 * k);
        }
    }
    // a rope-twist wire along a line, painted as a height: a round bead cut by slanting grooves
    function ropeRelief(q, line, hw, pitch = 1.9) {
        for (const [w, v] of [[2, 0.5], [1.5, 0.8], [0.8, 1]]) strokePts(q, line, hw * w, `rgb(${Math.round(v * 255)},0,0)`);
        const st = walk(line, pitch);
        q.save();
        q.globalCompositeOperation = 'multiply';
        q.strokeStyle = 'rgb(120,0,0)';
        q.lineWidth = pitch * 0.34;
        q.lineCap = 'butt';
        q.beginPath();
        for (const { p, t, n } of st) {
            q.moveTo(p[0] + n[0] * hw * 1.2 + t[0] * hw * 0.8, p[1] + n[1] * hw * 1.2 + t[1] * hw * 0.8);
            q.lineTo(p[0] - n[0] * hw * 1.2 - t[0] * hw * 0.8, p[1] - n[1] * hw * 1.2 - t[1] * hw * 0.8);
        }
        q.stroke();
        q.restore();
    }
    // what the brush adds to a lit boss: a dark crescent under it, light thrown back into its
    // shadow, the lamp's point on it
    function bossInk(q, K, b) {
        const [x, y] = b.p, a0 = Math.atan2(K.sd[1], K.sd[0]), r = b.kind === 'small' || b.kind === 'hemi' ? b.r : b.rc;
        q.lineCap = 'round';
        q.strokeStyle = 'rgba(46,12,6,0.8)';
        q.lineWidth = b.kind === 'small' ? 0.5 : 0.7;
        q.beginPath();
        q.arc(x, y, r + 0.3, a0 - 1.15, a0 + 1.15);
        q.stroke();
        if (b.kind === 'empty') {
            // the solder scar where the hemisphere came away
            q.fillStyle = 'rgba(96,44,14,0.55)';
            q.beginPath();
            q.ellipse(x + 0.3, y + 0.2, b.r * 0.7, b.r * 0.55, b.ph, 0, TAU);
            q.fill();
            q.strokeStyle = 'rgba(255,236,170,0.5)';
            q.lineWidth = 0.4;
            q.beginPath();
            q.arc(x, y, b.r * 0.62, a0 - 0.9 + Math.PI, a0 + 0.6 + Math.PI);
            q.stroke();
            return;
        }
        if (b.kind === 'rosette') {
            q.strokeStyle = 'rgba(46,12,6,0.55)';
            q.lineWidth = 0.45;
            q.beginPath();
            q.arc(x, y, b.r * 0.34, a0 - 1.3, a0 + 1.3);
            q.stroke();
            disc(q, [x + K.tol[0] * b.r * 0.1, y + K.tol[1] * b.r * 0.1], b.r * 0.1, 'rgba(255,252,226,0.9)');
            return;
        }
        q.strokeStyle = 'rgba(255,196,96,0.5)';
        q.lineWidth = b.r * 0.16;
        q.beginPath();
        q.arc(x, y, b.r * 0.76, a0 - 0.7, a0 + 0.7);
        q.stroke();
        q.fillStyle = 'rgba(255,253,232,0.96)';
        q.beginPath();
        q.ellipse(x + K.tol[0] * b.r * 0.4, y + K.tol[1] * b.r * 0.4, b.r * 0.2, b.r * 0.13, a0 + Math.PI / 2, 0, TAU);
        q.fill();
    }
    const goldTint = (AO) => (x, y, tone, rgb) => {
        // red earth and deep shade in the hollows; the crests burnished paler
        const c = AO.at(x, y), k = clamp(c * 0.75) * 0.85, kl = clamp(-c * 0.5) * 0.25;
        rgb[0] += (112 - rgb[0]) * k + (255 - rgb[0]) * kl;
        rgb[1] += (44 - rgb[1]) * k + (240 - rgb[1]) * kl;
        rgb[2] += (16 - rgb[2]) * k + (170 - rgb[2]) * kl;
    };
    const scratches = (q, seed, box, n, len = 9) => {
        const r = Motion.rng('scratch' + seed);
        q.lineCap = 'round';
        for (let i = 0; i < n; i++) {
            const x = box.x + r() * box.w, y = box.y + r() * box.h, a = -0.5 + (r() - 0.5) * 1.6, l = len * (0.3 + r());
            const dx = Math.cos(a) * l, dy = Math.sin(a) * l, pale = r() < 0.6;
            q.strokeStyle = pale ? `rgba(255,246,200,${(0.25 + r() * 0.3).toFixed(2)})` : `rgba(90,36,10,${(0.25 + r() * 0.3).toFixed(2)})`;
            q.lineWidth = 0.25 + r() * 0.2;
            q.beginPath();
            q.moveTo(x, y);
            q.quadraticCurveTo(x + dx * 0.5 + (r() - 0.5) * 2, y + dy * 0.5 + (r() - 0.5) * 2, x + dx, y + dy);
            q.stroke();
        }
    };

    // The ox-hide: a rectangle with four drawn-out corners and concave sides. Cut by hand
    // from a sheet: no two corners alike.
    const oxhide = (seed) => memo('ox/' + seed, () => {
        const r = Motion.rng('oxhide' + seed), a = 87, b = 57, j = () => (r() - 0.5) * 2.6;
        const quad = (sx, sy) => [[0.34 * a, -b + 13.6], [0.62 * a, -b + 10.6], [0.82 * a, -b + 4.8], [0.95 * a, -b - 1], [a + 1.5, -b - 2.6], [a + 4, -b + 2.4], [a + 0.5, -b + 9.5], [a - 8.5, -b + 19], [a - 16, -b + 34]].map(([x, y]) => [sx * (x + j()), sy * (y + j())]);
        return S.curve([[j(), -b + 14.5], ...quad(1, 1), [a - 19.5, j()], ...quad(1, -1).reverse(), [j(), b - 14.5], ...quad(-1, -1), [-a + 20, j()], ...quad(-1, 1).reverse()], true, 10);
    });
    // Where everything sits on the pectoral: the wires and the rows follow the outline,
    // band inside band.
    const pectoralPlan = (seed) => memo('pplan/' + seed, () => {
        const out = oxhide(seed), box = even(S.bbox(out, 4));
        const D = distField(box, 3, (q) => fillPts(q, out, '#fff'));
        const r = Motion.rng('pectoral' + seed);
        const ring = (lv) => isolines(D, lv).filter((l) => plen(l) > 24).map((l) => eased(l, 3, true));
        const wires = [[2, 1.25], [10.4, 1.05], [23.6, 1.05], [36.4, 1.05]].flatMap(([lv, hw]) => ring(lv).map((line) => ({ line, hw })));
        const bosses = [];
        const row = (lv, pitch, make) => {
            for (const line of ring(lv)) {
                const len = plen(line), n = Math.max(3, Math.round(len / pitch)), st = walk(line, len / n).slice(0, n);
                st.forEach((q, i) => bosses.push({ p: [q.p[0] + (r() - 0.5) * 0.5, q.p[1] + (r() - 0.5) * 0.5], ...make(i) }));
            }
        };
        row(6.2, 5.5, () => ({ kind: 'small', r: 2.15 * (0.92 + r() * 0.16) }));
        row(17, 11.6, () => ({ kind: 'rosette', r: 3.9 * (0.95 + r() * 0.1), rc: 5.05, ph: r() * TAU }));
        row(30, 11.2, () => ({ kind: 'hemi', r: 3.55 * (0.94 + r() * 0.12), rc: 4.85, ph: r() * TAU }));
        // the middle: one more row of rosettes along the axis, as far as it fits
        const mid = [];
        for (let x = -60; x <= 60; x += 0.5) if (D.lin(x, 0) > 41.4) mid.push(x);
        if (mid.length) {
            const x0 = mid[0], x1 = mid[mid.length - 1], n = Math.max(1, Math.round((x1 - x0) / 11.4)) + 1;
            for (let i = 0; i < n; i++) bosses.push({ p: [n > 1 ? x0 + ((x1 - x0) * i) / (n - 1) : 0, (r() - 0.5) * 0.6], kind: 'rosette', r: 3.9, rc: 5.05, ph: r() * TAU });
        }
        // one hemisphere of the inner row has come away
        const hemis = bosses.filter((b) => b.kind === 'hemi');
        hemis[Math.floor(hemis.length * 0.62)].kind = 'empty';
        // a pellet in the bare corner of every arm
        for (const [sx, sy] of [[1, 1], [1, -1], [-1, -1], [-1, 1]]) {
            for (let t = 1.2; t > 0.5; t -= 0.004) {
                if (D.lin(sx * 87 * t, sy * 57 * t) >= 13.3) {
                    bosses.push({ p: [sx * 87 * t, sy * 57 * t], kind: 'small', r: 2.5 });
                    break;
                }
            }
        }
        const dents = [{ p: [-37, 7], R: 13 }, { p: [40, -27], R: 8 }];
        return { out, box, D, wires, bosses, dents };
    });

    function pectoral(K) {
        const P = pectoralPlan(K.seed), { box, out } = P, res = K.res;
        const F = Field(box, res);
        F.paint(1.35, (q) => {
            for (const w of P.wires) ropeRelief(q, w.line, w.hw);
        });
        const dentAt = (p) => P.dents.reduce((m, d) => Math.max(m, Math.exp(-Math.pow(Math.hypot(p[0] - d.p[0], p[1] - d.p[1]) / (d.R * 0.6), 2))), 0);
        for (const b of P.bosses) raise(F, b, 1 - 0.8 * dentAt(b.p));
        // the dents themselves: the sheet pushed in
        for (const d of P.dents) F.bump(d.p[0], d.p[1], d.R * 1.6, (dx, dy) => -3.2 * Math.exp(-(dx * dx + dy * dy) / (d.R * d.R * 0.3)), 'add');
        const AO = F.hollows(2.2);
        const sp = S.form({
            box, res, light: K.L, seed: 'pect' + K.seed, inflate: 'bevel', R: 1.7, relief: 0.8, smooth: 0.0015,
            mask: (q) => fillPts(q, out, '#fff'),
            height: (x, y) => F.at(x, y) + 0.12 * S.noise2(x * 0.35, y * 0.35, 5) + 2.6 * fbm(x * 0.022, y * 0.022, 6),
            ramp: GOLD, soft: 1, mottle: { amp: 0.035, freq: 0.045 },
            spec: { amp: 0.8, power: 20, from: 0.5, to: 0.96, color: '#fffbe2' },
            tint: goldTint(AO),
        });
        onto(sp, res, (q) => {
            scratches(q, K.seed, box, 60);
            // the wires' edges, drawn
            for (const w of P.wires) {
                const st = walk(w.line, 1.5);
                for (const sg of [-1, 1]) strokePts(q, st.map((s) => [s.p[0] + s.n[0] * sg * (w.hw + 0.15), s.p[1] + s.n[1] * sg * (w.hw + 0.15)]), 0.4, 'rgba(60,20,8,0.5)');
            }
            for (const b of P.bosses) bossInk(q, K, b);
            // the crease of the dent, on the side the lamp does not reach
            for (const d of P.dents) {
                const a0 = Math.atan2(K.tol[1], K.tol[0]), arc = [];
                for (let k = -5; k <= 5; k++) arc.push(pol(d.R * 0.62, a0 + k * 0.16, d.p[0], d.p[1]));
                S.ink(q, arc, { w: 0.8, color: '#4a1808', alpha: 0.6 });
                S.ink(q, arc.map(([x, y]) => [2 * d.p[0] - x, 2 * d.p[1] - y]), { w: 0.7, color: '#fff6c8', alpha: 0.6 });
            }
        });
        // red earth still in the low places, more of it towards the corners
        onto(sp, res, (q) => {
            const r = Motion.rng('earth' + K.seed);
            for (let i = 0; i < 26; i++) blobOn(q, [box.x + r() * box.w, box.y + r() * box.h], 5 + r() * 12, r() < 0.7 ? '#8a3a12' : '#f8e7a0', r() < 0.7 ? 0.22 : 0.16);
        });
        sprayIn(sp, res, { color: '#7a2c0e', alpha: 0.78, w: 34, dir: K.sd });
        sprayIn(sp, res, { color: '#3a0f14', alpha: 0.55, w: 8, dir: K.sd });
        sprayIn(sp, res, { color: '#fff6c8', alpha: 0.5, w: 20, dir: K.tol });
        sprayIn(sp, res, { color: '#e9a23c', alpha: 0.7, w: 1.4, push: 0.5, dir: K.sd });
        return sp;
    }

    // The cuff: a cylinder seen a little from above. (u, v) across and along its axis; the
    // rows live on the unrolled wall (s along the arc, t along the axis).
    const CUFF = { c: [64, 46], tilt: 0.3, R: 33, H: 56, e: 10.5 };
    const cuffPlan = (seed) => memo('cplan/' + seed, () => {
        const r = Motion.rng('cuff' + seed), R = CUFF.R, half = (Math.PI * R) / 2, bosses = [];
        [-19, -9.5, 0, 9.5, 19].forEach((t, k) => {
            const pitch = 9.7, off = k % 2 ? pitch / 2 : 0;
            for (let s = -half - pitch + off; s <= half + pitch; s += pitch) {
                const p = [s + (r() - 0.5) * 0.5, t + (r() - 0.5) * 0.4];
                bosses.push(k % 2 ? { p, kind: 'rosette', r: 3.5, rc: 4.45, ph: r() * TAU } : { p, kind: 'hemi', r: 3.15 * (0.94 + r() * 0.12), rc: 4.3, ph: 0 });
            }
        });
        return { bosses, wires: [-14.25, -4.75, 4.75, 14.25, -23.9, 23.9], half };
    });
    function cuff(G, K) {
        const P = cuffPlan(K.seed), { c, tilt, R, H, e } = CUFF, res = K.res;
        const U = [Math.cos(tilt), Math.sin(tilt)], V = [-Math.sin(tilt), Math.cos(tilt)];
        const at = (u, v) => [c[0] + u * U[0] + v * V[0], c[1] + u * U[1] + v * V[1]];
        // the unrolled wall
        const W = Field({ x: -P.half - 6, y: -H / 2 - 2, w: P.half * 2 + 12, h: H + 4 }, res * 1.25);
        W.paint(1.3, (q) => {
            for (const t of P.wires) ropeRelief(q, [[-P.half - 6, t], [P.half + 6, t]], 1.0);
        });
        // the rolled rims
        W.paint(3, (q) => {
            for (const t of [-H / 2 + 2.2, H / 2 - 2.2]) for (const [w, v] of [[4.4, 0.5], [3.4, 0.82], [2, 1]]) strokePts(q, [[-P.half - 6, t], [P.half + 6, t]], w, `rgb(${Math.round(v * 255)},0,0)`);
        });
        for (const b of P.bosses) raise(W, b);
        const AO = W.hollows(2.2);
        // outline: the wall between the near halves of its two end ellipses
        const wall = [], mouth = [];
        for (let k = 0; k <= 40; k++) {
            const a = Math.PI - (k / 40) * Math.PI;
            wall.push(at(Math.cos(a) * R, H / 2 + Math.sin(a) * e));
        }
        for (let k = 0; k <= 40; k++) {
            const a = (k / 40) * Math.PI;
            wall.push(at(Math.cos(a) * R, -H / 2 + Math.sin(a) * e));
        }
        for (let k = 0; k < 64; k++) mouth.push(at(Math.cos((k / 64) * TAU) * R, -H / 2 + Math.sin((k / 64) * TAU) * e));
        const uv = (x, y) => [(x - c[0]) * U[0] + (y - c[1]) * U[1], (x - c[0]) * V[0] + (y - c[1]) * V[1]];
        // the inside, through the mouth: a hollow, lit on the side away from the lamp
        const box = even(S.bbox([...wall, ...mouth], 4));
        const inner = S.form({
            box, res, light: K.L, seed: 'cuffin' + K.seed, inflate: 'none',
            mask: (q) => fillPts(q, mouth, '#fff'),
            height: (x, y) => {
                const [u, v] = uv(x, y);
                return -0.85 * Math.sqrt(Math.max(0, R * R - u * u)) + 0.25 * S.noise2(u * 0.2, v * 0.6, 3);
            },
            ramp: GOLD, soft: 1, mottle: { amp: 0.04, freq: 0.06 },
            tint: (x, y, tone, rgb) => {
                // deeper is darker: the far wall falls away from the rim
                const [, v] = uv(x, y), k = smooth(-H / 2 - e, -H / 2 + e, v) * 0.55 + 0.12;
                rgb[0] += (70 - rgb[0]) * k;
                rgb[1] += (24 - rgb[1]) * k;
                rgb[2] += (14 - rgb[2]) * k;
            },
        });
        onto(inner, res, (q) => {
            // hammer marks and the seam of the sheet
            const r = Motion.rng('cuffin' + K.seed);
            for (let i = 0; i < 26; i++) {
                const u = (r() * 2 - 1) * R * 0.9, v = -H / 2 + (r() * 2 - 1) * e * 0.8, p = at(u, v), p2 = at(u + (r() - 0.5) * 3, v + 3 + r() * 4);
                strokePts(q, [p, p2], 0.4, r() < 0.5 ? 'rgba(255,230,150,0.35)' : 'rgba(60,20,8,0.4)');
            }
            strokePts(q, [at(R * 0.2, -H / 2 - e), at(R * 0.24, -H / 2 + e)], 0.6, 'rgba(50,16,8,0.6)');
            strokePts(q, [at(R * 0.2 + 0.8, -H / 2 - e), at(R * 0.24 + 0.8, -H / 2 + e)], 0.4, 'rgba(255,236,170,0.4)');
        });
        sprayIn(inner, res, { color: '#3a0f10', alpha: 0.8, w: 9, dir: K.tol });
        stamp(G, inner, K, { lw: 1.8, cast: { d: 3, blur: 4 } });
        const outer = S.form({
            box, res, light: K.L, seed: 'cuff' + K.seed, inflate: 'none',
            mask: (q) => fillPts(q, wall, '#fff'),
            height: (x, y) => {
                const [u, v] = uv(x, y), cu = Math.sqrt(Math.max(0, 1 - (u * u) / (R * R)));
                return 0.9 * R * cu + W.lin(R * Math.asin(clamp(u / R, -1, 1)), v - e * cu) * (0.3 + 0.7 * cu);
            },
            ramp: GOLD, soft: 1, mottle: { amp: 0.035, freq: 0.05 },
            spec: { amp: 0.8, power: 20, from: 0.5, to: 0.96, color: '#fffbe2' },
            tint: (x, y, tone, rgb) => {
                const [u, v] = uv(x, y), cu = Math.sqrt(Math.max(0, 1 - (u * u) / (R * R)));
                const a = AO.lin(R * Math.asin(clamp(u / R, -1, 1)), v - e * cu);
                const k = clamp(a * 0.75) * 0.85;
                rgb[0] += (112 - rgb[0]) * k;
                rgb[1] += (44 - rgb[1]) * k;
                rgb[2] += (16 - rgb[2]) * k;
            },
        });
        onto(outer, res, (q) => {
            // each boss where the wall carries it, squeezed towards the sides
            for (const b of P.bosses) {
                const ph = b.p[0] / R;
                if (Math.abs(ph) > 1.05) continue;
                const cu = Math.cos(ph), p = at(R * Math.sin(ph), b.p[1] + e * cu);
                q.save();
                q.translate(p[0], p[1]);
                q.rotate(tilt);
                q.scale(Math.max(0.25, cu), 1);
                q.rotate(-tilt);
                q.translate(-p[0], -p[1]);
                bossInk(q, K, { ...b, p });
                q.restore();
            }
            scratches(q, K.seed + 'cuff', box, 30, 7);
        });
        sprayIn(outer, res, { color: '#7a2c0e', alpha: 0.8, w: 22, dir: K.sd });
        sprayIn(outer, res, { color: '#3a0f14', alpha: 0.6, w: 7, dir: K.sd });
        sprayIn(outer, res, { color: '#fff4c0', alpha: 0.45, w: 10, dir: K.tol });
        sprayIn(outer, res, { color: '#e9a23c', alpha: 0.7, w: 1.4, push: 0.5, dir: K.sd });
        stamp(G, outer, K, { lw: 2.2, cast: { d: 5, blur: 5 } });
        // the near rim's edge: the thickness of the rolled sheet
        const lip = [];
        for (let k = 2; k <= 38; k++) lip.push(at(Math.cos((k / 40) * Math.PI) * R, -H / 2 + Math.sin((k / 40) * Math.PI) * e));
        strokePts(G, lip, 0.9, 'rgba(255,246,200,0.75)');
    }

    // A loop-in-loop chain along a path: links seen flat (a ring) and on edge (two wires
    // side by side) in turn, each through the last.
    function chain(G, K, path, o = {}) {
        const pitch = o.pitch ?? 6, st = walk(path, pitch), sd = K.sd, tol = K.tol;
        const flat = (q, i) => S.xf(S.ellipse(0, 0, 4.8, 2.9, 20), { x: st[i].p[0], y: st[i].p[1], rot: Math.atan2(st[i].t[1], st[i].t[0]) + (S.hashI(i, 3, 1, 9) - 0.5) * 0.5 });
        const edge = (i) => {
            const a = st[i], h = 4.1, w = 1.45;
            return [[-h, -w * 0.6], [-h * 0.6, -w], [h * 0.6, -w], [h, -w * 0.6], [h, w * 0.6], [h * 0.6, w], [-h * 0.6, w], [-h, w * 0.6]].map(([x, y]) => [a.p[0] + a.t[0] * x + a.n[0] * y, a.p[1] + a.t[1] * x + a.n[1] * y]);
        };
        S.cast(G, (q) => {
            for (let i = 0; i < st.length; i++) i % 2 ? fillPts(q, edge(i), '#000') : strokePts(q, flat(q, i), 1.7, '#000', true);
        }, { blur: 2.5, dx: sd[0] * 2.5, dy: sd[1] * 2.5, color: 'rgba(14,8,26,0.6)' });
        for (let i = 0; i < st.length; i += 2) {
            const e = flat(G, i), p = st[i].p;
            G.save();
            G.translate(sd[0] * 0.5, sd[1] * 0.5);
            strokePts(G, e, 3, INK, true);
            G.restore();
            strokePts(G, e, 3, INK, true);
            const gr = G.createLinearGradient(p[0] + tol[0] * 4.5, p[1] + tol[1] * 4.5, p[0] + sd[0] * 4.5, p[1] + sd[1] * 4.5);
            gr.addColorStop(0, GV.glint);
            gr.addColorStop(0.3, GV.light);
            gr.addColorStop(0.58, GV.base);
            gr.addColorStop(1, GV.deep);
            strokePts(G, e, 1.7, gr, true);
            strokePts(G, e.map(([x, y]) => [x + sd[0] * 0.45, y + sd[1] * 0.45]), 0.35, 'rgba(70,24,8,0.6)', true);
        }
        for (let i = 1; i < st.length; i += 2) {
            const a = st[i], e = edge(i), lit = dot2(a.n, tol);
            piece(G, K, e, {
                fill: GV.base, line: 1.1, heavy: 0.5,
                shade: { color: GV.deep, alpha: 0.9, w: 1.4 }, light: { color: GV.glint, alpha: 0.9, w: 1.1 },
                detail: (q) => strokePts(q, [[a.p[0] - a.t[0] * 3, a.p[1] - a.t[1] * 3], [a.p[0] + a.t[0] * 3, a.p[1] + a.t[1] * 3]], 0.35, 'rgba(70,24,8,0.75)'),
            });
            disc(G, [a.p[0] + a.n[0] * Math.sign(lit || 1) * 0.6 - a.t[0] * 1.2, a.p[1] + a.n[1] * Math.sign(lit || 1) * 0.6 - a.t[1] * 1.2], 0.38, 'rgba(255,252,226,0.9)');
        }
    }

    function paintCarambolo(G, K) {
        const P0 = [-23, -3], P = pectoralPlan(K.seed);
        // the suspension tube, soldered along the top edge, and the chain through it
        const ty = P0[1] + P.out.reduce((m, p) => (Math.abs(p[0]) < 4 ? Math.min(m, p[1]) : m), 99) - 2.4, tx0 = P0[0] - 25, tx1 = P0[0] + 25;
        const left = S.curve([[tx0 + 4, ty], [tx0 - 9, ty - 9], [tx0 - 22, ty - 27], [tx0 - 40, ty - 40], [tx0 - 57, ty - 33], [tx0 - 64, ty - 12], [tx0 - 60, ty + 10], [tx0 - 65, ty + 34], [tx0 - 61, ty + 55]], false, 12);
        const right = S.curve([[tx1 - 4, ty], [tx1 + 10, ty - 10], [tx1 + 26, ty - 30], [tx1 + 47, ty - 42], [tx1 + 70, ty - 36], [tx1 + 83, ty - 17], [tx1 + 88, ty + 6], [tx1 + 95, ty + 28], [tx1 + 99, ty + 50]], false, 12);
        const sp = pectoral(K);
        stamp(G, sp, K, { lw: 2.4, heavy: 0.8, at: P0, cast: { d: 3 } });
        chain(G, K, left.slice().reverse());
        chain(G, K, right.slice().reverse());
        // the tube: a rolled sheet with turned collars
        const rAt = (x) => 3.5 + 1.2 * Math.max(...[-23, -20, -7, 7, 20, 23].map((c) => Math.exp(-Math.pow((x - P0[0] - c) / 1.1, 2))));
        const tube = [];
        for (let x = tx0; x <= tx1; x += 0.5) tube.push([x, ty - rAt(x) * smooth(0, 1.5, Math.min(x - tx0, tx1 - x) + 0.6)]);
        for (let x = tx1; x >= tx0; x -= 0.5) tube.push([x, ty + rAt(x) * smooth(0, 1.5, Math.min(x - tx0, tx1 - x) + 0.6)]);
        const tsp = S.form({
            box: even(S.bbox(tube, 4)), res: K.res, light: K.L, seed: 'tube', inflate: 'none',
            mask: (q) => fillPts(q, tube, '#fff'),
            height: (x, y) => 1.15 * Math.sqrt(Math.max(0, rAt(x) * rAt(x) - (y - ty) * (y - ty))),
            ramp: GOLD, soft: 1, mottle: { amp: 0.04, freq: 0.08 }, spec: { amp: 0.8, power: 24, from: 0.5, to: 0.95, color: '#fffbe2' },
        });
        onto(tsp, K.res, (q) => {
            for (const c of [-23, -20, -7, 7, 20, 23]) strokePts(q, [[P0[0] + c + 1.5, ty - 5], [P0[0] + c + 1.5, ty + 5]], 0.4, 'rgba(60,20,8,0.6)');
            scratches(q, K.seed + 'tube', S.bbox(tube), 10, 5);
        });
        sprayIn(tsp, K.res, { color: '#6e2a10', alpha: 0.75, w: 3.2, dir: K.sd });
        sprayIn(tsp, K.res, { color: '#fff4c0', alpha: 0.5, w: 2, dir: K.tol });
        stamp(G, tsp, K, { lw: 1.7, cast: { d: 2.2, blur: 2.5 } });
        // the dark of the bore at each end
        for (const [x, sg] of [[tx0, -1], [tx1, 1]]) {
            G.fillStyle = '#2a0c08';
            G.beginPath();
            G.ellipse(x + sg * 0.4, ty, 1.1, 2.4, 0, 0, TAU);
            G.fill();
        }
        cuff(G, K);
    }

    // ------------------------------------------------------------------ 2 · the murex of Gadir
    // The shell in its own coordinates: the axis along y, the apex up at (0, −64), the tip
    // of the siphonal canal at (0, 100), the aperture on the right (it is seen from below).
    const MX = (() => {
        const right = [[0, -64], [4.5, -59], [8.5, -54], [8, -50.5], [15.5, -45.5], [15, -40.5], [24, -33.5], [23.5, -27], [35.5, -19], [40.5, -7], [40, 7], [34.5, 21], [25, 31], [13, 41], [8, 52], [6.2, 70], [5, 88], [3.2, 99]];
        const left = [[-0.5, 100.5], [-3, 99], [-4.2, 88], [-5.2, 70], [-6.5, 52], [-10.5, 40], [-22, 30], [-32.5, 18], [-37.5, 4], [-36.5, -8], [-30.5, -19], [-22, -27], [-22.5, -33.5], [-14.5, -40.5], [-15, -45.5], [-7.8, -50.5], [-8.2, -54], [-4, -59]];
        const out = S.curve([...right, ...left], true, 8);
        // its middle and half-width at every height
        const span = [];
        for (let y = -66; y <= 102; y++) {
            let x0 = 1e9, x1 = -1e9;
            for (let i = 0; i < out.length; i++) {
                const a = out[i], b = out[(i + 1) % out.length];
                if (a[1] > y !== b[1] > y) {
                    const x = a[0] + ((b[0] - a[0]) * (y - a[1])) / (b[1] - a[1]);
                    x0 = Math.min(x0, x);
                    x1 = Math.max(x1, x);
                }
            }
            span.push(x1 > x0 ? [(x0 + x1) / 2, Math.max(1.5, (x1 - x0) / 2)] : [0, 1.5]);
        }
        const at = (y) => span[Math.max(0, Math.min(span.length - 1, Math.round(y + 66)))];
        const aperture = S.curve([[15, -14], [23, -12.5], [29, -5], [30.5, 5], [28, 15], [22, 23], [15, 28], [10, 30.5], [7.4, 35], [6, 30], [4.5, 22], [3.5, 12], [4.5, 2], [8, -8], [11.5, -12.5]], true, 8);
        const callus = S.curve([[12.5, -16], [5, -13.5], [-2.5, -6.5], [-6, 5], [-5, 17], [-1, 27], [3.4, 35.5], [5.4, 43], [7, 41], [7.4, 35], [6, 30], [4.5, 22], [3.5, 12], [4.5, 2], [8, -8], [11.5, -12.5]], true, 8);
        // spines: [base, tip, width at the root, where: behind the shell or on its face]
        const spines = [
            [[-31, -18], [-58, -31], 12.5, 0], [[-35.5, 10], [-53, 18.5], 10.5, 0],
            [[36, -17], [61, -32], 12.5, 0], [[37, 13], [54, 22.5], 10.5, 0], [[27, 27.5], [38, 37], 7.5, 0],
            [[-21.5, -32], [-35, -41], 8, 0], [[22.5, -32], [36, -42], 8, 0], [[-14, -45], [-23.5, -52], 6, 0], [[14.5, -45], [24, -52.5], 6, 0],
            [[-6, 50], [-17, 56], 6.4, 0], [[7, 47.5], [18.5, 53.5], 6.4, 0], [[-5, 66], [-12, 71], 4.6, 0],
            [[-15, -19.5], [-22, -31], 10.5, 1], [[-18, 14], [-25.5, 21.5], 8.6, 1], [[3, -30], [1.6, -37.5], 6.6, 1],
        ];
        return { out, at, aperture, callus, spines, varices: [-1.25, -0.42, 1.0] };
    })();

    // One spine: a hollow cone rolled from the lip's edge, with the seam of the roll along it.
    function spine(G, K, F, [base, tip, w0, front], i, seed) {
        const r = Motion.rng('spine' + seed + i), d = [tip[0] - base[0], tip[1] - base[1]], L = Math.hypot(d[0], d[1]), t = [d[0] / L, d[1] / L], n = [-t[1], t[0]];
        const broken = i === 4, len = broken ? 0.62 : 1, bend = (r() - 0.5) * 0.22;
        const mid = (u) => [base[0] + d[0] * u + n[0] * bend * L * u * u, base[1] + d[1] * u + n[1] * bend * L * u * u];
        const wd = (u) => (front ? w0 * (0.12 + 0.88 * Math.pow(Math.max(0, 1 - u / 1.02), 0.8)) : w0 * (0.15 + 0.85 * Math.pow(Math.max(0, 1 - u / 1.03), 1.3)) * (u < 0 ? 1 + -u * 1.6 : 1)) * 0.5;
        const up = [], dn = [], axis = [];
        for (let k = 0; k <= 14; k++) {
            const u = -0.16 + (k / 14) * (len + 0.16), m = mid(u), w = wd(u);
            up.push([m[0] + n[0] * w, m[1] + n[1] * w]);
            dn.push([m[0] - n[0] * w, m[1] - n[1] * w]);
            axis.push(m);
        }
        const end = broken ? [lerpP(up[14], dn[14], 0.3).map((v, j) => v + t[j] * 1.2), lerpP(up[14], dn[14], 0.62).map((v, j) => v - t[j] * 0.6)] : [];
        const pts = F.pts([...up, ...end, ...dn.reverse()]), ax = F.pts(axis), w = w0 * F.s;
        const paint = (q) => piece(q, K, pts, {
            fill: front ? '#f6ead0' : '#efdfb8', line: front ? 0.8 : 1.15, heavy: 0.55, ink: front ? '#4a2c2e' : INK, cast: front ? null : { d: 1.6, blur: 2 },
            shade: [{ color: '#a8703e', alpha: front ? 0.85 : 0.7, w: w * 0.34 }, { color: '#4a2a3a', alpha: 0.4, w: w * 0.12 }], light: { color: '#fffdf4', alpha: 0.8, w: w * 0.26 },
            detail: (g) => {
                // growth lamellae across the root, the seam of the roll, the stained tip
                for (let k = 2; k <= 7; k++) {
                    const a = lerpP(pts[k], pts[pts.length - 1 - k], -0.05), b = lerpP(pts[k], pts[pts.length - 1 - k], 1.05), m = lerpP(a, b, 0.5), tt = F.dir(t);
                    S.ink(g, [a, [m[0] + tt[0] * w * 0.14, m[1] + tt[1] * w * 0.14], b], { w: 0.5, color: '#7a4a30', alpha: 0.5 - k * 0.04, taper: [0.4, 0.4] });
                }
                const sm = ax.slice(3).map((p, k) => [p[0] + K.sd[0] * w * 0.07, p[1] + K.sd[1] * w * 0.07]);
                S.ink(g, sm, { w: 0.75, color: '#5a3226', alpha: 0.75, taper: [0.2, 0.7] });
                S.ink(g, sm.map(([x, y]) => [x - K.sd[0] * 0.7, y - K.sd[1] * 0.7]), { w: 0.5, color: '#fff6e0', alpha: 0.7, taper: [0.2, 0.9] });
                const a = ax[9], b = ax[14], gr = g.createLinearGradient(a[0], a[1], b[0], b[1]);
                gr.addColorStop(0, 'rgba(120,70,44,0)');
                gr.addColorStop(1, `rgba(132,80,50,${broken ? 0 : 0.5})`);
                fillPts(g, pts, gr);
                if (broken) fillPts(g, [pts[13], pts[14], pts[15], pts[16], pts[17], pts[18]], 'rgba(255,250,236,0.85)');
            },
        });
        if (front) {
            // it stands out of the whorl towards us: its shadow lies on the shell, and the
            // shell swells a little round its foot
            S.cast(G, (q) => fillPts(q, pts, '#000'), { blur: 2.2, dx: K.sd[0] * 3.2, dy: K.sd[1] * 3.2, color: 'rgba(52,26,34,0.6)' });
            const foot = S.ellipse(ax[1][0], ax[1][1], w * 0.62, w * 0.4, 16, Math.atan2(F.dir(n)[1], F.dir(n)[0]));
            G.save();
            G.globalCompositeOperation = 'source-atop';
            blobOn(G, ax[1], w * 0.8, '#fff6e0', 0.5);
            strokePts(G, foot.slice(0, 9), 0.5, 'rgba(90,52,44,0.5)');
            G.restore();
            paint(G);
            S.ink(G, ax.slice(5, 12).map(([x, y]) => [x + K.tol[0] * w * 0.1, y + K.tol[1] * w * 0.1]), { w: 0.8, color: '#ffffff', alpha: 0.85 });
        } else paint(G);
        if (!broken && !front) disc(G, lerpP(ax[14], ax[13], 0.2), 0.5 * F.s, 'rgba(60,30,30,0.8)');
    }

    function murexShell(G, K, F) {
        const res = K.res, seed = K.seed, out = F.pts(MX.out), box = even(S.bbox(out, 4));
        const c = Math.cos(F.rot) / F.s, sn = Math.sin(F.rot) / F.s, o = F([0, 0]);
        const SX = (x, y) => (x - o[0]) * c + (y - o[1]) * sn, SY = (x, y) => -(x - o[0]) * sn + (y - o[1]) * c;
        // the sutures between whorls, each stepping down towards the lip, as grooves
        const sutures = [[[-8, -50.5], [0, -47.6], [8, -49]], [[-15, -40.5], [0, -36.2], [15.5, -39]], [[-22.5, -27], [-2, -21.5], [14, -20], [24, -25]]].map((l) => F.pts(S.curve(l, false, 8)));
        const Gv = Field(box, res).paint(1.5, (q) => {
            for (const l of sutures) strokePts(q, l, 1.6, '#fff');
        }, 'set', 0.45);
        for (const b of MX.spines) if (!b[3]) continue;
        const cordOf = (sx, sy, lon) => sy - 0.09 * sx - 2.6 * (1 - lon * lon);
        const sp = S.form({
            box, res, light: K.L, seed: 'murex' + seed, relief: 0.95,
            mask: (q) => fillPts(q, out, '#fff'),
            height: (x, y) => {
                const sx = SX(x, y), sy = SY(x, y), s = MX.at(sy), lon = clamp((sx - s[0]) / s[1], -1, 1), cz = Math.sqrt(1 - lon * lon);
                const body = smooth(-30, -18, sy) * smooth(48, 30, sy), k = cordOf(sx, sy, lon) / 4, f = k - Math.floor(k);
                const cord = Math.pow(0.5 + 0.5 * Math.cos(f * TAU), 1.6);
                let h = -Gv.at(x, y) + (0.5 + (((Math.floor(k) % 3) + 3) % 3 === 0 ? 0.4 : 0)) * cord * cz * (0.4 + 0.6 * body);
                const al = Math.asin(lon);
                h += (0.16 * S.noise2(al * 26, sy * 0.05, 7) + 0.1 * S.noise2(al * 60, sy * 0.1, 8)) * cz;
                for (const l0 of MX.varices) h += 1.7 * Math.exp(-Math.pow((al - l0) / 0.11, 2)) * body * cz * (0.55 + 0.9 * cord);
                // the shoulder of each whorl stands a little proud under its suture
                h += 0.7 * Math.exp(-Math.pow((sy + 0.09 * sx + 19) / 3, 2)) * cz;
                return h;
            },
            ramp: [[0, '#2e1c2c'], [0.18, '#5c3a34'], [0.36, '#9a7048'], [0.54, '#c8a56c'], [0.7, '#e3cf9c'], [0.86, '#f3e8c6'], [1, '#fffaf0']], soft: 1,
            mottle: { amp: 0.035, freq: 0.05 }, stroke: { amp: 0.01, freq: 0.07, tone: 5 },
            spec: { amp: 0.3, power: 18, from: 0.55, to: 1, ragged: 0.2, color: '#fffaf0' },
            tint: (x, y, tone, rgb, m) => {
                const sx = SX(x, y), sy = SY(x, y), s = MX.at(sy), lon = clamp((sx - s[0]) / s[1], -1, 1), cc = cordOf(sx, sy, lon);
                // brown spiral bands, broken along their length; dirt between the cords
                let k = 0;
                for (const [b0, bw, ba] of [[-13, 4.6, 0.95], [6, 7, 0.8], [23, 4, 0.9], [-34, 2.4, 0.8], [-45.5, 1.8, 0.7], [40, 3, 0.5], [62, 5, 0.4]]) k = Math.max(k, ba * smooth(bw, bw * 0.3, Math.abs(cc - b0)));
                k *= 0.6 + 0.5 * S.noise2(sx * 0.16, sy * 0.4, 11);
                const kk = cc / 4, f = kk - Math.floor(kk);
                k = clamp(k + 0.16 * (1 - Math.pow(0.5 + 0.5 * Math.cos(f * TAU), 1.6)) + 0.1 * smooth(0.2, 0.7, S.noise2(sx * 1.3, sy * 1.3, 13)));
                rgb[0] *= 1 - k * 0.4;
                rgb[1] *= 1 - k * 0.58;
                rgb[2] *= 1 - k * 0.7;
                // the apex worn chalky; a pink flush towards the lip
                const ka = smooth(-44, -60, sy) * 0.55 + smooth(0.35, 0.8, S.noise2(sx * 0.07 + 3, sy * 0.07, 15)) * 0.25, f2 = 0.55 + 0.5 * tone;
                rgb[0] += (240 * f2 - rgb[0]) * ka;
                rgb[1] += (232 * f2 - rgb[1]) * ka;
                rgb[2] += (218 * f2 - rgb[2]) * ka;
                const kp = smooth(0.45, 0.95, lon) * smooth(-24, -10, sy) * smooth(40, 24, sy) * 0.3;
                rgb[0] += (238 * f2 - rgb[0]) * kp;
                rgb[1] += (150 * f2 - rgb[1]) * kp;
                rgb[2] += (120 * f2 - rgb[2]) * kp;
                // the night in the very rim of the shadow side
                const kn = smooth(0.3, 0.06, tone) * smooth(0.1, 0.01, m) * 0.45;
                rgb[0] += (84 - rgb[0]) * kn;
                rgb[1] += (72 - rgb[1]) * kn;
                rgb[2] += (132 - rgb[2]) * kn;
            },
        });
        onto(sp, res, (q) => {
            const r = Motion.rng('murexink' + seed);
            // cords drawn here and there, never the whole way round
            for (let cc = -56; cc < 60; cc += 4) {
                const y0 = cc, line = [];
                for (let u = -0.96; u <= 0.96; u += 0.06) {
                    const sy = y0 + 2.6 * (1 - u * u), s = MX.at(sy), sx = s[0] + u * s[1];
                    line.push(F([sx, sy + 0.09 * sx]));
                }
                const a = Math.floor(r() * 20), b = a + 5 + Math.floor(r() * 14);
                if (r() < 0.75) S.ink(q, line.slice(a, b), { w: 0.45, color: '#6a4030', alpha: 0.28 + r() * 0.2 });
            }
            // growth lines, parallel to the lip
            for (let i = 0; i < 26; i++) {
                const al = -1.35 + r() * 2.7, y0 = -24 + r() * 30, y1 = y0 + 8 + r() * 26, line = [];
                for (let sy = y0; sy <= y1; sy += 2) {
                    const s = MX.at(sy);
                    line.push(F([s[0] + Math.sin(al) * s[1], sy]));
                }
                S.ink(q, line, { w: 0.4, color: r() < 0.7 ? '#6a4030' : '#fff6e0', alpha: 0.3 });
            }
            for (const [l, w] of sutures.map((l, i) => [l, 0.9 + i * 0.25])) {
                S.ink(q, l, { w, color: '#3c2028', alpha: 0.85, taper: [0.5, 0.5] });
                S.ink(q, l.map(([x, y]) => [x + K.sd[0] * 1.1, y + K.sd[1] * 1.1]), { w: 0.6, color: '#fff6e0', alpha: 0.5, taper: [0.8, 0.8] });
            }
            // the pin-holes of a boring sponge, in a drift across the back of the whorl
            for (let i = 0; i < 26; i++) {
                const p = F([-31 + r() * 14 + r() * 8, -10 + r() * 26]), rr = 0.22 + r() * r() * 0.45;
                disc(q, p, rr, 'rgba(60,34,36,0.7)');
                disc(q, [p[0] + K.sd[0] * rr, p[1] + K.sd[1] * rr], rr * 0.6, 'rgba(255,248,230,0.5)');
            }
        });
        sprayIn(sp, res, { color: '#5a3040', alpha: 0.55, w: 15, dir: K.sd });
        sprayIn(sp, res, { color: '#2e1c30', alpha: 0.5, w: 4, dir: K.sd });
        sprayIn(sp, res, { color: '#fff8e6', alpha: 0.4, w: 9, dir: K.tol });
        stamp(G, sp, K, { lw: 2.1, heavy: 0.8, cast: { d: 3, blur: 3 } });
    }

    function murexMouth(G, K, F) {
        const ap = F.pts(MX.aperture), cal = F.pts(MX.callus), s = F.s;
        // the inner lip: a glaze spread over the whorl
        piece(G, K, cal, {
            fill: '#f0dcc2', line: 1.1, heavy: 0.3, ink: '#6a4034',
            shade: [{ color: '#c08a6a', alpha: 0.7, w: 5 * s }, { color: '#e8a890', alpha: 0.5, w: 9 * s, dir: K.tol }], light: { color: '#fffdf6', alpha: 0.8, w: 3 * s },
            detail: (q) => {
                const gl = F.pts(S.curve([[-2.4, 1], [-3, 8], [-2, 15]], false, 6));
                S.ink(q, gl, { w: 1.5 * s, color: '#ffffff', alpha: 0.85 });
                disc(q, F([-0.4, 20.5]), 0.6 * s, 'rgba(255,255,255,0.85)');
                S.ink(q, F.pts(S.curve([[9, -13.5], [2, -8], [-1.5, 1]], false, 5)), { w: 0.5, color: '#b0765c', alpha: 0.6 });
            },
        });
        // the aperture: porcelain, lit on the inside of the outer lip, dark in the throat
        const c0 = F([25, 11]), gr = G.createRadialGradient(c0[0], c0[1], 1, c0[0], c0[1], 29 * s);
        gr.addColorStop(0, '#f8cdb0');
        gr.addColorStop(0.3, '#ee9f7c');
        gr.addColorStop(0.62, '#b8543e');
        gr.addColorStop(1, '#451828');
        piece(G, K, ap, {
            fill: '#b8543e', line: 1.6, heavy: 0.5, ink: '#2e1420',
            detail: (q) => {
                fillPts(q, ap, gr);
                S.spray(q, ap, { color: '#1e0c1a', alpha: 0.9, w: 9 * s, push: 6 * s, dir: K.tol });
                S.spray(q, ap, { color: '#ffe6d0', alpha: 0.55, w: 3 * s, push: 1.5 * s, dir: K.sd });
                // lirae: faint threads running into the throat
                for (let k = 0; k < 6; k++) {
                    const u = k / 5, a = lerpP([28.5, -5], [14, 27], u), b = lerpP([13, -8], [7.5, 20], u);
                    S.ink(q, F.pts(S.curve([a, lerpP(a, b, 0.5).map((v, j) => v + (j ? -1.5 : 0)), b], false, 5)), { w: 0.5 * s, color: '#8a3a30', alpha: 0.4, taper: [0.2, 1] });
                }
                // gloss: a short fat streak and a dash under it
                S.ink(q, F.pts(S.curve([[27, 1], [26.6, 8], [24, 14.5]], false, 5)), { w: 1.7 * s, color: '#fff8f0', alpha: 0.9 });
                disc(q, F([20.5, 20]), 0.7 * s, 'rgba(255,248,240,0.9)');
            },
        });
        // the outer lip's edge is scalloped where each cord ends
        for (let k = 0; k < 9; k++) {
            const u = k / 8, p = F(lerpP(lerpP([24.5, -11.5], [30.6, 4], Math.min(1, u * 2)), [17, 27], Math.max(0, u * 2 - 1) * 0.9)), n = F.dir(u < 0.5 ? [0.9, -0.4] : [0.8, 0.6]);
            S.ink(G, [[p[0] - n[0] * 0.4 * s, p[1] - n[1] * 0.4 * s], [p[0] + n[0] * 2.6 * s, p[1] + n[1] * 2.6 * s]], { w: 0.7 * s, color: '#4a2a2e', alpha: 0.7, taper: [0, 0.9] });
        }
        // the canal: all but closed, a slit down to its tip
        const slit = F.pts(S.curve([[7.4, 34], [6.4, 44], [5, 58], [3.4, 74], [2.2, 90], [1.2, 98]], false, 8));
        S.ink(G, slit, { w: 1.5 * s, color: '#2e1420', alpha: 0.9, taper: [0, 0.9] });
        S.ink(G, slit.map(([x, y]) => [x + K.sd[0] * 0.9 * s, y + K.sd[1] * 0.9 * s]), { w: 0.6 * s, color: '#fff6e0', alpha: 0.6, taper: [0.3, 1] });
        // a worm's chalk tube on the back of the whorl
        const tube = F.pts(S.curve([[-27, 2], [-23, -2], [-19, 1.5], [-21.5, 6], [-17, 8.5], [-13, 6]], false, 8));
        strokePts(G, tube, 2.5 * s, '#3c2430');
        strokePts(G, tube, 1.6 * s, '#efe6d4');
        strokePts(G, tube.map(([x, y]) => [x + K.tol[0] * 0.35 * s, y + K.tol[1] * 0.35 * s]), 0.5 * s, 'rgba(255,255,255,0.9)');
        disc(G, tube[tube.length - 1], 0.55 * s, '#3c2430');
    }

    // The purple: it runs from the mouth, pools and dries with a dark rim. Fresh from the
    // gland the dye is yellow-green; the light turns it green, violet, then purple.
    function purple(G, K, lip) {
        const r = Motion.rng('purple' + K.seed), [lx, ly] = lip;
        const wob = (pts, a) => pts.map(([x, y], i) => [x + a * S.noise2(i * 0.9, 1.3, 31), y + a * S.noise2(i * 0.9, 7.7, 32)]);
        const pool = S.curve(wob([[lx - 8, ly - 2], [lx + 4, ly - 4], [lx + 12, ly + 3], [lx + 22, ly + 5], [lx + 36, ly + 3], [lx + 48, ly + 8], [lx + 58, ly + 17], [lx + 62, ly + 28], [lx + 58, ly + 37], [lx + 48, ly + 41], [lx + 41, ly + 40], [lx + 45, ly + 48], [lx + 47, ly + 54], [lx + 44, ly + 57], [lx + 39, ly + 54], [lx + 35, ly + 44], [lx + 26, ly + 43], [lx + 16, ly + 47], [lx + 8, ly + 53], [lx, ly + 54], [lx - 8, ly + 49], [lx - 14, ly + 41], [lx - 20, ly + 35], [lx - 25, ly + 27], [lx - 22, ly + 19], [lx - 16, ly + 14], [lx - 13, ly + 7]], 1.7), true, 9);
        const mid = [lx + 18, ly + 26];
        // a dry-brushed drag where a finger was pulled through it
        for (let i = 0; i < 3; i++) S.dab(G, S.curve([[lx - 12, ly + 38 + i * 4], [lx - 30, ly + 43 + i * 4], [lx - 46, ly + 42 + i * 5]], false, 8), { w: 4.6, color: i === 1 ? '#7a2460' : '#5e1848', alpha: 0.8, bristles: 6, seed: 'drag' + i, dry: 0.6 });
        piece(G, K, pool, {
            fill: '#661a4e', line: 1.4, heavy: 0.4, ink: '#2a0a26',
            detail: (q) => {
                // thin where it ran, thick where it stood; the rim dried darkest
                for (let i = 0; i < 22; i++) {
                    const p = [lx - 22 + r() * 82, ly + r() * 54], rr = 5 + r() * 9;
                    const gr = q.createRadialGradient(p[0], p[1], 0, p[0], p[1], rr), col = r() < 0.55 ? '#93306f' : r() < 0.5 ? '#b04a80' : '#431038';
                    gr.addColorStop(0, rgba(col, 0.6));
                    gr.addColorStop(1, rgba(col, 0));
                    q.fillStyle = gr;
                    q.fillRect(p[0] - rr, p[1] - rr, rr * 2, rr * 2);
                }
                S.spray(q, pool, { color: '#2c0826', alpha: 0.9, w: 4, push: 0, dir: [0, 0] });
                S.spray(q, pool, { color: '#2c0826', alpha: 0.6, w: 9, dir: K.sd });
                // fresh at the lip: yellow-green, green, blue-violet, before it reddens
                for (const [d, rr, col, a] of [[19, 12, '#5a3a9a', 0.7], [12, 9.5, '#2f7f78', 0.8], [6, 7.5, '#8fae3e', 0.9], [1.5, 5, '#d6d86a', 0.95]]) {
                    const p = [lx + 2 + d * 0.3, ly + d * 0.75], gr = q.createRadialGradient(p[0], p[1], 0, p[0], p[1], rr);
                    gr.addColorStop(0, rgba(col, a));
                    gr.addColorStop(0.6, rgba(col, a * 0.5));
                    gr.addColorStop(1, rgba(col, 0));
                    q.fillStyle = gr;
                    q.fillRect(p[0] - rr, p[1] - rr, rr * 2, rr * 2);
                }
                // tide lines left as it dried, grit, the wet catching the lamp
                const n = pool.length;
                for (const [k, a, b] of [[0.84, 0.08, 0.4], [0.84, 0.55, 0.86], [0.66, 0.2, 0.62], [0.5, 0.6, 0.95]]) S.ink(q, pool.slice(Math.floor(n * a), Math.floor(n * b)).filter((_, i) => i % 2 === 0).map(([x, y]) => [mid[0] + (x - mid[0]) * k, mid[1] + (y - mid[1]) * k]), { w: 0.55, color: '#2c0826', alpha: 0.5 });
                for (let i = 0; i < 90; i++) disc(q, [lx - 24 + r() * 86, ly - 2 + r() * 58], 0.2 + r() * 0.4, r() < 0.5 ? 'rgba(30,6,28,0.6)' : 'rgba(214,120,176,0.5)');
                for (const [a, b] of [[[lx + 26, ly + 12], [lx + 38, ly + 13]], [[lx + 46, ly + 20], [lx + 53, ly + 26]], [[lx - 12, ly + 24], [lx - 9, ly + 33]], [[lx + 6, ly + 40], [lx + 14, ly + 39]]]) S.ink(q, [a, lerpP(a, b, 0.5).map((v, j) => v + (j ? -1.2 : 0)), b], { w: 1.3, color: '#f4c8e0', alpha: 0.8 });
                disc(q, [lx + 44.5, ly + 52], 0.9, 'rgba(244,200,224,0.85)');
                disc(q, [lx + 41, ly + 14.5], 0.6, 'rgba(244,200,224,0.85)');
            },
        });
        // spatter
        for (let i = 0; i < 14; i++) {
            const a = r() * TAU, d = 6 + r() * 20, p = [mid[0] + Math.cos(a) * (40 + d), mid[1] + Math.sin(a) * (27 + d * 0.7)], rr = 0.7 + r() * r() * 2.4;
            if (p[0] > 85 || p[1] > 75 || p[1] < ly + 2 || p[0] < lx - 46) continue;
            const dr = S.ellipse(p[0], p[1], rr * (1 + r() * 0.5), rr, 12, a);
            piece(G, K, dr, { fill: '#6a1c50', line: 0.9, heavy: 0.4, ink: '#2a0a26', shade: { color: '#2c0826', alpha: 0.8, w: rr }, light: { color: '#c05a98', alpha: 0.6, w: rr * 0.7 } });
            if (rr > 1.5) disc(G, [p[0] + K.tol[0] * rr * 0.35, p[1] + K.tol[1] * rr * 0.35], rr * 0.2, 'rgba(250,214,236,0.9)');
        }
    }

    // A thread of two plies along a path.
    function thread(G, K, path, w = 2.1, C = { base: '#cdb88c', deep: '#6e5236', light: '#f4ead0' }) {
        const st = walk(path, 0.5), line = st.map((q) => q.p);
        S.cast(G, (q) => strokePts(q, line, w, '#000'), { blur: 2, dx: K.sd[0] * 1.8, dy: K.sd[1] * 1.8, color: 'rgba(14,8,26,0.55)' });
        G.save();
        G.translate(K.sd[0] * 0.5, K.sd[1] * 0.5);
        strokePts(G, line, w + 1.5, INK);
        G.restore();
        strokePts(G, line, w + 1.5, INK);
        strokePts(G, line, w, C.base);
        strokePts(G, line.map(([x, y]) => [x + K.sd[0] * w * 0.28, y + K.sd[1] * w * 0.28]), w * 0.4, rgba(C.deep, 0.65));
        strokePts(G, line.map(([x, y]) => [x + K.tol[0] * w * 0.26, y + K.tol[1] * w * 0.26]), w * 0.3, rgba(C.light, 0.8));
        G.lineCap = 'round';
        G.strokeStyle = rgba(C.deep, 0.9);
        G.lineWidth = 0.4;
        G.beginPath();
        for (let i = 2; i < st.length - 2; i += 3) {
            const { p, t, n } = st[i];
            G.moveTo(p[0] + n[0] * w * 0.5 + t[0] * 0.6, p[1] + n[1] * w * 0.5 + t[1] * 0.6);
            G.lineTo(p[0] - n[0] * w * 0.5 - t[0] * 0.6, p[1] - n[1] * w * 0.5 - t[1] * 0.6);
        }
        G.stroke();
    }
    const frayed = (G, K, p, dir, seed, col = '#cdb88c') => {
        const r = Motion.rng('fray' + seed);
        for (let i = 0; i < 6; i++) {
            const a = Math.atan2(dir[1], dir[0]) + (r() - 0.5) * 1.3, l = 2.5 + r() * 3.5;
            S.ink(G, [p, [p[0] + Math.cos(a) * l * 0.5 + (r() - 0.5), p[1] + Math.sin(a) * l * 0.5 + (r() - 0.5)], [p[0] + Math.cos(a) * l, p[1] + Math.sin(a) * l]], { w: 1.5, color: INK, taper: [0, 1] });
            S.ink(G, [p, [p[0] + Math.cos(a) * l * 0.5, p[1] + Math.sin(a) * l * 0.5], [p[0] + Math.cos(a) * l * 0.94, p[1] + Math.sin(a) * l * 0.94]], { w: 0.7, color: col, taper: [0, 1] });
        }
    };

    // A head pendant of rod-formed glass, the Punic kind: every feature a trail or a blob
    // of coloured glass laid on hot.
    const GLY = { base: '#d8ae3a', deep: '#84520f', light: '#f8e69a', glint: '#fffbe6', ink: INK };
    const GLB = { base: '#22338a', deep: '#0c1238', light: '#7c9ae8', glint: '#eef4ff', ink: '#0a0e2a' };
    const GLW = { base: '#ece6d6', deep: '#9a94a6', light: '#ffffff', glint: '#ffffff', ink: INK };
    function glassBlob(G, K, pts, C, o = {}) {
        const b = S.bbox(pts), rr = Math.min(b.w, b.h) / 2;
        piece(G, K, pts, {
            fill: C.base, line: o.line ?? 0.9, heavy: 0.5, ink: C.ink, cast: o.cast === false ? null : { d: 0.9, blur: 1.2, color: 'rgba(20,10,30,0.5)' },
            shade: [{ color: C.deep, alpha: 0.9, w: rr * 0.9 }], light: { color: C.light, alpha: 0.75, w: rr * 0.6 },
            detail: o.detail,
        });
        if (o.glint !== false) {
            const c = [b.x + b.w / 2 + K.tol[0] * rr * 0.42, b.y + b.h / 2 + K.tol[1] * rr * 0.42];
            G.fillStyle = rgba(C.glint, 0.95);
            G.beginPath();
            G.ellipse(c[0], c[1], rr * 0.26, rr * 0.15, Math.atan2(K.sd[1], K.sd[0]) + Math.PI / 2, 0, TAU);
            G.fill();
        }
    }
    function pendant(G, K, F) {
        const r = Motion.rng('pendant' + K.seed), s = F.s, sd = K.sd, tol = K.tol;
        const E = (cx, cy, rx, ry = rx, n = 22, rot = 0) => F.pts(S.ellipse(cx, cy, rx, ry, n, rot));
        // the loop: a ring of the same yellow, pulled up from the head
        const ring = E(0, -19.5, 4.5, 4.7, 26), c = F([0, -19.5]);
        S.cast(G, (q) => strokePts(q, ring, 3.4 * s, '#000', true), { blur: 2, dx: sd[0] * 2, dy: sd[1] * 2, color: 'rgba(14,8,26,0.55)' });
        G.save();
        G.translate(sd[0] * 0.6, sd[1] * 0.6);
        strokePts(G, ring, 5.2 * s, INK, true);
        G.restore();
        strokePts(G, ring, 5.2 * s, INK, true);
        const gr = G.createLinearGradient(c[0] + tol[0] * 7 * s, c[1] + tol[1] * 7 * s, c[0] + sd[0] * 7 * s, c[1] + sd[1] * 7 * s);
        gr.addColorStop(0, GLY.glint);
        gr.addColorStop(0.28, GLY.light);
        gr.addColorStop(0.55, GLY.base);
        gr.addColorStop(1, GLY.deep);
        strokePts(G, ring, 3.4 * s, gr, true);
        const la = Math.atan2(tol[1], tol[0]) - F.rot, arc = [];
        for (let k = -4; k <= 4; k++) arc.push(F([Math.cos(la + k * 0.12) * 5.2, -19.5 + Math.sin(la + k * 0.12) * 5.4]));
        S.ink(G, arc, { w: 0.9 * s, color: '#fffbe6', alpha: 0.9 });
        // the head: wound on a rod, so its glass is streaked round
        const head = F.pts(S.curve([[-11, -12], [-6, -15.5], [0, -16.4], [6, -15.5], [11, -12], [13.6, -3], [13, 7], [10.4, 15], [5.4, 20.6], [0, 22.2], [-5.4, 20.6], [-10.4, 15], [-13, 7], [-13.6, -3]], true, 8));
        piece(G, K, head, {
            fill: GLY.base, line: 1.9, heavy: 0.8, cast: { d: 1.5, blur: 2 },
            shade: [{ color: GLY.deep, alpha: 0.9, w: 10 * s }, { color: '#4a2a14', alpha: 0.5, w: 3.5 * s }], light: { color: GLY.light, alpha: 0.8, w: 8 * s },
            detail: (q) => {
                for (let i = 0; i < 22; i++) {
                    const y = -15 + i * 1.7 + (r() - 0.5), x0 = -14 + r() * 8, x1 = x0 + 6 + r() * 14;
                    S.ink(q, F.pts(S.curve([[x0, y + 0.8], [(x0 + x1) / 2, y + 1.6], [x1, y + 0.6]], false, 5)), { w: 0.45 * s, color: r() < 0.5 ? '#8a5a14' : '#fff2b8', alpha: 0.35 });
                }
                // a weathering film, iridescent, on the cheek away from the lamp, and pits
                for (const [p, rr, col] of [[[7, 8], 7, '#c8e2dc'], [[9.5, 2], 4.5, '#d8c8ea'], [[-8, 13], 4, '#c8e2dc']]) {
                    const pp = F(p), g2 = q.createRadialGradient(pp[0], pp[1], 0, pp[0], pp[1], rr * s);
                    g2.addColorStop(0, rgba(col, 0.42));
                    g2.addColorStop(1, rgba(col, 0));
                    q.fillStyle = g2;
                    q.fillRect(pp[0] - rr * s, pp[1] - rr * s, rr * 2 * s, rr * 2 * s);
                }
                for (let i = 0; i < 16; i++) {
                    const p = F([-12 + r() * 24, -13 + r() * 33]);
                    disc(q, p, (0.25 + r() * 0.35) * s, 'rgba(70,40,10,0.6)');
                    disc(q, [p[0] + sd[0] * 0.4 * s, p[1] + sd[1] * 0.4 * s], 0.2 * s, 'rgba(255,246,200,0.6)');
                }
            },
        });
        // ears
        for (const sx of [-1, 1]) {
            glassBlob(G, K, E(sx * 14.3, 0.5, 2.5, 3.9, 16), GLY, { line: 1.1 });
            glassBlob(G, K, E(sx * 14.6, 5.6, 1.5, 1.5, 12), sx < 0 ? GLB : GLW, { line: 0.8 });
        }
        // a coil of trailed glass: a blob with the turn of the trail drawn on it
        const coil = (cx, cy, rad, C, dir = 1) => {
            glassBlob(G, K, E(cx + (r() - 0.5) * 0.5, cy + (r() - 0.5) * 0.5, rad * (0.94 + r() * 0.12), rad * (0.94 + r() * 0.12), 18), C, { line: 0.9, glint: false });
            const sp = [], a0 = r() * TAU;
            for (let k = 0; k <= 22; k++) {
                const a = a0 + dir * k * 0.42, rr = rad * 0.78 * (1 - k / 26);
                sp.push(F([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]));
            }
            S.ink(G, sp, { w: 0.55 * s, color: C === GLB ? '#8aa6f0' : '#7a4c10', alpha: 0.85, taper: [0.3, 0.6] });
            disc(G, F([cx, cy]).map((v, j) => v + tol[j] * rad * 0.5 * s), rad * 0.16 * s, rgba(C.glint, 0.95));
        };
        // the beard: two rows of coils round the jaw, blue and yellow in turn
        [[-4.6, 25.2], [0, 27], [4.6, 25.2]].forEach(([x, y], i) => coil(x, y, 2.9, i === 1 ? GLY : GLB, i ? 1 : -1));
        [[-11.8, 9.4], [-9.4, 15], [-5.2, 19.4], [0, 21.2], [5.2, 19.4], [9.4, 15], [11.8, 9.4]].forEach(([x, y], i) => coil(x, y, 3.1, i % 2 ? GLY : GLB, i < 3 ? -1 : 1));
        // the hair: a row of curls over the brow
        [-10.4, -5.2, 0, 5.2, 10.4].forEach((x, i) => coil(x, -13.2 - (2 - Math.abs(i - 2)) * 0.9, 3.2, GLB, i < 2 ? -1 : 1));
        // brows: one trail, dipped at the bridge of the nose
        const brow = F.pts(S.curve([[-11.2, -4.2], [-8.4, -8], [-4.6, -8.6], [-1.4, -6.4], [0, -5.2], [1.4, -6.4], [4.6, -8.6], [8.4, -8], [11.2, -4.2]], false, 7));
        glassBlob(G, K, band(brow, (u) => 1.9 * s * (0.6 + 0.6 * Math.sin(Math.PI * u))), GLB, { line: 0.8, glint: false });
        S.ink(G, brow.slice(4, 24).map(([x, y]) => [x + tol[0] * 0.4 * s, y + tol[1] * 0.4 * s]), { w: 0.5 * s, color: '#8aa6f0', alpha: 0.9 });
        // stratified eyes: a white disc, a blue ring, white, a blue point; no two alike
        for (const sx of [-1, 1]) {
            const ex = sx * 6.1 + (r() - 0.5) * 0.5, ey = -2 + (r() - 0.5) * 0.6, rad = 4.5 + (r() - 0.5) * 0.4;
            glassBlob(G, K, E(ex, ey, rad, rad * 0.97, 24), GLW, { line: 1, glint: false });
            const pc = F([ex + sx * 0.25, ey + 0.2]);
            G.lineWidth = 1.25 * s;
            G.strokeStyle = GLB.base;
            G.beginPath();
            G.arc(pc[0], pc[1], 2.75 * s, 0, TAU);
            G.stroke();
            G.lineWidth = 0.4 * s;
            G.strokeStyle = 'rgba(138,166,240,0.85)';
            G.beginPath();
            G.arc(pc[0] + tol[0] * 0.25 * s, pc[1] + tol[1] * 0.25 * s, 2.75 * s, Math.atan2(tol[1], tol[0]) - 0.9, Math.atan2(tol[1], tol[0]) + 0.9);
            G.stroke();
            disc(G, pc, 1.25 * s, GLB.deep);
            disc(G, [pc[0] + tol[0] * 1.7 * s, pc[1] + tol[1] * 1.7 * s], 0.75 * s, 'rgba(255,255,255,0.95)');
            disc(G, [pc[0] + sd[0] * 2.9 * s, pc[1] + sd[1] * 2.9 * s], 0.35 * s, 'rgba(255,255,255,0.7)');
        }
        // the nose: a drop of yellow drawn down; the mouth: two small lips of red-brown
        glassBlob(G, K, F.pts(S.curve([[0, -6.4], [1.5, -3], [2.5, 3.6], [1.6, 6.2], [0, 6.8], [-1.6, 6.2], [-2.5, 3.6], [-1.5, -3]], true, 6)), { ...GLY, base: '#e6c050' }, { line: 0.9, glint: false });
        S.ink(G, F.pts([[-0.6, -4], [-0.9, 0], [-0.7, 3.6]]), { w: 0.8 * s, color: '#fffbe6', alpha: 0.9 });
        const LIP = { base: '#9a3626', deep: '#4a1210', light: '#e08a6a', glint: '#ffe8dc', ink: INK };
        glassBlob(G, K, E(0, 10.3, 3.3, 1.25, 16), LIP, { line: 0.8, glint: false });
        glassBlob(G, K, E(0, 12.5, 2.5, 1.1, 14), LIP, { line: 0.8, glint: false });
        disc(G, F([-1.2, 10]), 0.35 * s, 'rgba(255,232,220,0.9)');
        // a chip out of the rim of the left ear's bead, and grit in the hollows
        disc(G, F([-15.6, 6.4]), 0.6 * s, '#0a0e2a');
        for (const p of [[-4, -4.6], [4.2, -4.4], [-2.8, 8.4], [3, 8.2], [-7, 17.6], [7.4, 17.4]]) disc(G, F(p), 0.5 * s, 'rgba(60,34,20,0.5)');
    }

    function paintMurex(G, K) {
        const F = frame(12, -9, 0.96, 0.8), Fp = frame(-57, -34, -0.2, 1);
        purple(G, K, F([31, 9]));
        // the thread: knotted through the loop, one end short, the other wandering off
        const hole = Fp([0, -19.5]), knot = Fp([0.5, -25.5]);
        thread(G, K, S.curve([hole, Fp([3, -24]), [knot[0] + 8, knot[1] - 9], [knot[0] + 22, knot[1] - 10], [knot[0] + 34, knot[1] - 2]], false, 10));
        frayed(G, K, [knot[0] + 34, knot[1] - 2], [1, 0.5], 'a');
        const long = S.curve([hole, Fp([-3.5, -24]), [knot[0] - 12, knot[1] - 4], [knot[0] - 22, knot[1] + 12], [-84, -22], [-80, 6], [-64, 22], [-74, 40], [-82, 56], [-66, 68], [-46, 62], [-34, 68]], false, 10);
        thread(G, K, long);
        frayed(G, K, [-34, 68], [1, 0.4], 'b');
        // spines behind the shell, the shell, the spines on its face, the mouth
        MX.spines.forEach((sp, i) => !sp[3] && spine(G, K, F, sp, i, K.seed));
        murexShell(G, K, F);
        MX.spines.forEach((sp, i) => sp[3] && spine(G, K, F, sp, i, K.seed));
        murexMouth(G, K, F);
        // the dye still wet on the lip, and two drops hanging from it
        G.save();
        G.beginPath();
        S.trace(G, F.pts(MX.aperture));
        G.clip();
        for (const [p, rr, col, a] of [[[27.5, 12], 5, '#7a2460', 0.8], [[25.5, 16], 3.6, '#6a2a7a', 0.6], [[28.6, 8.5], 2.4, '#4f8a5a', 0.5], [[27, 10.5], 1.8, '#b8c856', 0.8]]) blobOn(G, F(p), rr * F.s, col, a);
        G.restore();
        for (const [p, rr] of [[[39.4, 13.5], 1.5], [[37.6, 20], 1.05]]) {
            const c = F(p), dr = S.xf(S.curve([[0, -1.9], [0.75, -0.6], [1, 0.4], [0.6, 1.1], [0, 1.3], [-0.6, 1.1], [-1, 0.4], [-0.75, -0.6]], true, 5), { x: c[0], y: c[1], sx: rr });
            piece(G, K, dr, { fill: '#7a2460', line: 0.8, heavy: 0.4, ink: '#2a0a26', shade: { color: '#2c0826', alpha: 0.8, w: rr }, light: { color: '#d070a8', alpha: 0.7, w: rr * 0.7 } });
            disc(G, [c[0] + K.tol[0] * rr * 0.35, c[1] + K.tol[1] * rr * 0.35], rr * 0.24, 'rgba(255,236,248,0.95)');
        }
        pendant(G, K, Fp);
        // the knot, over the loop
        const kn = S.ellipse(knot[0], knot[1], 2.6, 2.1, 14, 0.5);
        piece(G, K, kn, { fill: '#cdb88c', line: 1.2, shade: { color: '#6e5236', alpha: 0.85, w: 2 }, light: { color: '#f4ead0', alpha: 0.8, w: 1.4 }, cast: { d: 1.2, blur: 1.5 }, detail: (q) => S.ink(q, [[knot[0] - 2, knot[1] + 1], [knot[0], knot[1] - 0.6], [knot[0] + 2, knot[1] + 0.6]], { w: 0.5, color: '#6e5236', alpha: 0.9 }) });
    }

    // ------------------------------------------------------------------ 3 · the Corinthian helmet
    // Seen three-quarters from the front, turned to the lamp: the far eye narrow, the near
    // cheek piece broad, the neck guard flaring at the back.
    const HM = (() => {
        const join = (...secs) => secs.flatMap((sc, i) => {
            const c = sc.length > 2 ? S.curve(sc, false, 8) : sc;
            return i ? c.slice(1) : c;
        });
        const rimA = [[104, 99], [103, 105.5], [86, 103], [66, 95], [52, 82], [45, 72.5]], rimB = [[45, 72.5], [41, 85], [32, 103.5], [15, 117], [-6, 120], [-22, 117.5]];
        const far = [[-27.5, 117.5], [-40, 113], [-53, 99], [-65, 72], [-74, 38], [-79.5, 2], [-79.5, -34], [-70, -70], [-48, -100], [-22, -115], [4, -118.5], [38, -110.5], [67, -91], [86, -62], [95, -28], [96, 6], [92, 36], [89, 60], [94, 80], [104, 99]];
        const out = join(rimA, rimB, [[-22, 117.5], [-27.5, 117.5]], far);
        const o1 = [[-68, 12], [-60, 3.5], [-50, -0.5], [-40, 2], [-28, 3.5], [-18, 4.5], [-4, -4.5], [16, -8], [36, -4.5], [52, 8.5]];
        const o2 = [[52, 8.5], [39, 14.5], [18, 18.5], [-1, 20], [-11, 26], [-16, 48], [-20, 80], [-22, 119]];
        const o4 = [[-27.5, 119], [-29.5, 80], [-36, 64], [-44, 50], [-47, 30], [-48, 21.5], [-56, 19.5], [-63, 16.5], [-68, 12]];
        const open = join(o1, o2, [[-22, 119], [-27.5, 119]], o4);
        const nasal = S.curve([[-40, -10], [-39.5, 4], [-40.5, 28], [-38.5, 54], [-34, 66.5], [-28, 57], [-24.5, 30], [-17.5, 4], [-16, -10]], true, 8);
        // the edges of the sheet itself (not the outline of the dome): where holes and lines run
        const rim = join(rimA, rimB, [[-22, 117.5], [-27.5, 117.5]], [[-27.5, 117.5], [-40, 113], [-53, 99], [-65, 72]]);
        const nearEye = join([[-17, 5], [-4, -4.5], [16, -8], [36, -4.5], [52, 8.5]], [[52, 8.5], [39, 14.5], [18, 18.5], [-1, 20], [-11, 26], [-20, 24]]);
        return { out, open, nasal, rim, nearEye, box: { x: -102, y: -122, w: 204, h: 244 } };
    })();
    const helmetPlan = (seed) => memo('hplan/' + seed, () => {
        const mask = (q) => {
            fillPts(q, HM.out, '#fff');
            cut(q, (c) => fillPts(c, HM.open, '#000'));
            fillPts(q, HM.nasal, '#fff');
        };
        const D = distField(HM.box, 2, mask), r = Motion.rng('helmet' + seed);
        const edgy = (p) => distLine(p, HM.open, true) < 9 || distLine(p, HM.rim) < 9 || (p[1] > 6 && distLine(p, HM.nasal, true) < 9);
        // runs of an iso-line that keep to a real edge
        const runs = (lv) => isolines(D, lv).flatMap((line) => {
            const out = [];
            let cur = [];
            for (const p of eased(line, 2)) {
                if (edgy(p)) cur.push(p);
                else {
                    if (cur.length > 6) out.push(cur);
                    cur = [];
                }
            }
            if (cur.length > 6) out.push(cur);
            return out;
        });
        const border = runs(6.4), holes = [];
        for (const line of runs(3.3)) {
            const len = plen(line), n = Math.round(len / 6.6);
            if (n < 1) continue;
            for (const q of walk(line, len / n)) if (r() > 0.06) holes.push({ p: [q.p[0] + (r() - 0.5) * 0.7, q.p[1] + (r() - 0.5) * 0.7], r: r() < 0.1 ? 1.25 + r() * 0.5 : 0.72 + r() * 0.2, drip: r() < 0.16 ? 4 + r() * 8 : 0 });
        }
        return { mask, border, holes };
    });
    // the palmette at the brow: seven petals over two volutes, as lines to incise
    const palmette = (() => {
        const F = frame(-28.5, -15, -0.04), lines = [];
        for (let k = -3; k <= 3; k++) {
            const a = -Math.PI / 2 + k * 0.37, L = 21 - Math.abs(k) * 2.6 - (k === 0 ? 0 : 0.6), b = [k * 1.5, -4.5 + Math.abs(k) * 0.5], t = [Math.cos(a), Math.sin(a)], n = [-t[1], t[0]], w = 2.1 - Math.abs(k) * 0.12;
            const leaf = [];
            for (let i = 0; i <= 10; i++) leaf.push([b[0] + t[0] * L * (i / 10) + n[0] * w * Math.sin((Math.PI * i) / 10) * (0.5 + 0.5 * (i / 10)), b[1] + t[1] * L * (i / 10) + n[1] * w * Math.sin((Math.PI * i) / 10) * (0.5 + 0.5 * (i / 10))]);
            for (let i = 10; i >= 0; i--) leaf.push([b[0] + t[0] * L * (i / 10) - n[0] * w * Math.sin((Math.PI * i) / 10) * (0.5 + 0.5 * (i / 10)), b[1] + t[1] * L * (i / 10) - n[1] * w * Math.sin((Math.PI * i) / 10) * (0.5 + 0.5 * (i / 10))]);
            lines.push(leaf);
        }
        for (const sx of [-1, 1]) {
            const sp = [];
            for (let i = 0; i <= 26; i++) {
                const a = Math.PI / 2 - sx * (i * 0.33 - 0.5), rr = 5.4 * (1 - i / 34);
                sp.push([sx * 7.2 + Math.cos(a) * rr * sx * -1 * -1, -1.5 + Math.sin(a) * rr * -1 + 3]);
            }
            lines.push([[sx * 1.2, -5], [sx * 3.5, -4.2], ...sp]);
        }
        lines.push([[-1.6, -1.5], [0, -4], [1.6, -1.5], [0, 1.4], [-1.6, -1.5]], [[-9, 5.5], [0, 6.6], [9, 5.5]]);
        return lines.map((l) => F.pts(l.map(([x, y]) => [x * 0.9, y])));
    })();
    const BRZ = { green: [62, 124, 100], teal: [50, 110, 118], sea: [96, 164, 152], dark: [30, 60, 64], bloom: [158, 204, 178], brown: [98, 74, 46], bright: [188, 150, 82], cuprite: [112, 56, 40], shade: [12, 20, 36], light: [255, 246, 214] };

    function helmetShell(K) {
        const P = helmetPlan(K.seed), res = K.res, box = HM.box, r = Motion.rng('helmetpaint' + K.seed), sd = K.sd;
        const crack = [[18, -116], [22, -104], [17, -95], [23, -86], [20, -76], [25, -68], [22, -60]], crack2 = [[23, -86], [30, -80], [33, -73]];
        const flake = S.curve([[20, -84], [27, -86], [31, -80], [28, -73], [22, -74]], true, 5);
        // relief the balloon does not give: brow ridges, the nasal's ridge, the carination,
        // the nape and the out-turned neck guard, a dent; then what was cut into it
        const up = Field(box, res).paint(1.7, (q) => {
            strokePts(q, S.curve([[-15, -3], [0, -12], [18, -15], [38, -11], [55, 3]], false, 8), 5, '#fff');
            strokePts(q, S.curve([[-41, -4.5], [-50, -7], [-61, -2.5], [-70, 8]], false, 8), 4, '#fff');
            strokePts(q, S.curve([[-28, -12], [-29.5, 20], [-31, 45], [-33.5, 63]], false, 8), 4.5, '#fff');
            strokePts(q, S.curve([[-78, -28], [-40, -41], [10, -44], [60, -36], [93, -20]], false, 8), 3.5, '#8a8a8a');
            strokePts(q, S.curve([[60, 96], [84, 101], [103, 102]], false, 8), 6, '#e0e0e0');
        }, 'set', 1.6);
        const down = Field(box, res).paint(2.4, (q) => {
            q.filter = `blur(${(4 * res).toFixed(1)}px)`;
            strokePts(q, S.curve([[50, 72], [70, 70], [90, 60]], false, 8), 9, '#b0b0b0');
            disc(q, [12, 72], 8, '#c0c0c0');
            disc(q, [-58, -60], 6, '#909090');
            q.filter = 'none';
        });
        const scored = Field(box, res).paint(1.2, (q) => {
            for (const l of P.border) strokePts(q, l, 0.9, '#fff');
            for (const l of palmette) strokePts(q, l, 0.8, '#fff');
            strokePts(q, crack, 0.9, '#fff');
            strokePts(q, crack2, 0.7, '#fff');
            fillPts(q, flake, '#b0b0b0');
            for (const h of P.holes) disc(q, h.p, h.r, '#fff');
        }, 'set', 0.12);
        // where it is rubbed back to the metal: the nasal's ridge above all, brows, edges, the crown
        const worn = Field(box, res).paint(1, (q) => {
            q.filter = `blur(${(2.2 * res).toFixed(1)}px)`;
            strokePts(q, S.curve([[-28, -10], [-29.5, 20], [-31, 45], [-33.5, 62]], false, 8), 6, '#fff');
            strokePts(q, S.curve([[-10, -6], [4, -13], [20, -15.5], [38, -11]], false, 8), 3, '#b0b0b0');
            strokePts(q, S.curve([[-44, -6], [-52, -7.5], [-60, -3]], false, 8), 2.6, '#b0b0b0');
            strokePts(q, S.curve([[-14, 46], [-18, 80], [-19, 110]], false, 8), 3, '#909090');
            strokePts(q, S.curve([[30, 104], [12, 116], [-10, 118]], false, 8), 3, '#808080');
            disc(q, [-22, -92], 13, '#707070');
            for (const [x, y, rr] of [[38, -62, 5], [44, -57, 4], [40, -52, 3], [47, -64, 2.5]]) disc(q, [x, y], rr, '#484848');
            q.filter = 'none';
        });
        const pit = (x, y) => {
            const cx = Math.floor(x / 3.1), cy = Math.floor(y / 3.1), h = S.hashI(cx, cy, 3, 71);
            if (h < 0.7) return 0;
            const px = (cx + 0.25 + 0.5 * S.hashI(cx, cy, 4, 71)) * 3.1, py = (cy + 0.25 + 0.5 * S.hashI(cx, cy, 5, 71)) * 3.1, rr = 0.25 + 0.75 * Math.pow(S.hashI(cx, cy, 6, 71), 2.2);
            return smooth(rr, rr * 0.3, Math.hypot(x - px, y - py));
        };
        const sp = S.form({
            box, res, light: K.L, seed: 'helmet' + K.seed, relief: 0.98,
            mask: (q) => fillPts(q, HM.out, '#fff'),
            height: (x, y) => up.at(x, y) - down.at(x, y) - scored.at(x, y) - 0.45 * pit(x, y) + 0.25 * S.noise2(x * 0.09, y * 0.09, 61) + 0.1 * S.noise2(x * 0.45, y * 0.45, 62),
            ramp: [[0, '#000000'], [1, '#ffffff']], soft: 1,
            tint: (x, y, tone, rgb, m) => {
                const w = worn.at(x, y), n1 = fbm(x * 0.021 + 3, y * 0.021, 41) * 0.75 + fbm(x * 0.07, y * 0.07, 42) * 0.25;
                const bareV = n1 + w * 1.05 - 0.36, bare = smooth(0.1, 0.2, bareV), ring = smooth(0.02, 0.1, bareV) * (1 - smooth(0.12, 0.24, bareV));
                const n2 = fbm(x * 0.03, y * 0.03 + 9, 43), n3 = fbm(x * 0.1, y * 0.1, 44), n4 = fbm(x * 0.42, y * 0.42, 45), p = pit(x, y), sc = scored.at(x, y);
                const kt = smooth(-0.25, 0.3, n2), kd = smooth(0.1, 0.6, n3) * 0.6, kb = clamp(smooth(0.2, 0.7, -n3 + 0.25 * n4) * 0.6 + p * 0.7 + sc * 0.5), ks = smooth(0.35, 0.7, n4) * 0.3;
                const B = BRZ, a = [0, 0, 0];
                for (let c = 0; c < 3; c++) {
                    let v = B.green[c] + (B.teal[c] - B.green[c]) * kt;
                    v += (B.sea[c] - v) * ks;
                    v += (B.dark[c] - v) * kd;
                    v += (B.bloom[c] - v) * kb;
                    const br = B.brown[c] + (B.bright[c] - B.brown[c]) * smooth(0.25, 0.9, w) * (0.7 + 0.3 * n4);
                    v += (br - v) * bare * (1 - p * 0.6);
                    v += (B.cuprite[c] - v) * ring * 0.8;
                    a[c] = v;
                }
                // lit: matt crust, a gleam only on the bare metal; deep shade goes to the night's blue
                const t = clamp(tone), f = 0.16 + 1.2 * t, ksh = smooth(0.5, 0.1, t) * 0.85, kl = smooth(0.76, 0.99, t) * (0.22 + 0.55 * bare * smooth(0.2, 0.9, w));
                for (let c = 0; c < 3; c++) {
                    let v = Math.min(255, a[c] * f);
                    v += (B.shade[c] - v) * ksh;
                    v += (B.light[c] - v) * kl;
                    rgb[c] = v;
                }
                const kn = smooth(0.3, 0.06, tone) * smooth(0.06, 0.005, m) * 0.5;
                rgb[0] += (70 - rgb[0]) * kn;
                rgb[1] += (96 - rgb[1]) * kn;
                rgb[2] += (140 - rgb[2]) * kn;
            },
        });
        onto(sp, res, (q) => {
            const cutLine = (l, w = 0.7, a = 0.8) => {
                S.ink(q, l, { w, color: '#0d1c22', alpha: a, taper: [0.3, 0.3] });
                S.ink(q, l.map(([x, y]) => [x + sd[0] * 0.75, y + sd[1] * 0.75]), { w: w * 0.6, color: '#b9e0c0', alpha: 0.42, taper: [0.5, 0.5] });
            };
            for (const l of P.border) cutLine(l, 0.75, 0.75);
            for (const l of palmette) cutLine(l, 0.7, 0.85);
            // verdigris run down from some of the holes (down for the helmet, wherever it is turned)
            for (const h of P.holes) {
                if (h.drip) {
                    const gr = q.createLinearGradient(h.p[0], h.p[1], h.p[0], h.p[1] + h.drip);
                    gr.addColorStop(0, 'rgba(170,214,188,0.6)');
                    gr.addColorStop(1, 'rgba(170,214,188,0)');
                    q.fillStyle = gr;
                    q.fillRect(h.p[0] - h.r * 0.8, h.p[1], h.r * 1.6, h.drip);
                }
                disc(q, h.p, h.r, '#0a0e18');
                q.strokeStyle = 'rgba(190,226,196,0.6)';
                q.lineWidth = 0.35;
                q.beginPath();
                q.arc(h.p[0], h.p[1], h.r + 0.2, Math.atan2(sd[1], sd[0]) - 1, Math.atan2(sd[1], sd[0]) + 1);
                q.stroke();
            }
            // the crack and the flake it shed
            fillPts(q, flake, 'rgba(70,50,34,0.7)');
            for (let i = 0; i < flake.length; i++) {
                const a = flake[i], b = flake[(i + 1) % flake.length], f = (-(b[1] - a[1]) * sd[0] + (b[0] - a[0]) * sd[1]) / (Math.hypot(b[0] - a[0], b[1] - a[1]) || 1);
                strokePts(q, [a, b], 0.6, f > 0 ? `rgba(8,14,22,${(0.9 * f).toFixed(2)})` : `rgba(200,230,200,${(-0.6 * f).toFixed(2)})`);
            }
            for (const [l, w] of [[crack, 1.1], [crack2, 0.8]]) {
                S.ink(q, l, { w, color: '#070b14', taper: [0.1, 0.9] });
                S.ink(q, l.map(([x, y]) => [x + sd[0] * 0.9, y + sd[1] * 0.9]), { w: 0.5, color: '#c4e6c8', alpha: 0.5, taper: [0.2, 1] });
            }
            // scuffs and scratches down to the metal
            for (let i = 0; i < 46; i++) {
                const x = -80 + r() * 170, y = -110 + r() * 220, a = 0.9 + (r() - 0.5) * 1.4, l = 3 + r() * 10, pale = r() < 0.45;
                S.ink(q, [[x, y], [x + Math.cos(a) * l * 0.5 + (r() - 0.5), y + Math.sin(a) * l * 0.5], [x + Math.cos(a) * l, y + Math.sin(a) * l]], { w: 0.35 + r() * 0.3, color: pale ? '#d8c088' : '#10222a', alpha: 0.3 + r() * 0.3 });
            }
            // sea encrustation: a chalky crust at the nape and in the lee of the cheek
            for (const [x0, y0, sx, sy, n] of [[78, 80, 16, 16, 90], [-58, 88, 7, 10, 26], [52, -30, 6, 6, 16], [-20, -70, 5, 7, 12]]) {
                for (let i = 0; i < n; i++) {
                    const x = x0 + (r() + r() - 1) * sx, y = y0 + (r() + r() - 1) * sy, rr = 0.3 + r() * r() * 1.5;
                    disc(q, [x + sd[0] * rr * 0.4, y + sd[1] * rr * 0.4], rr, 'rgba(14,26,34,0.45)');
                    disc(q, [x, y], rr, r() < 0.75 ? `rgba(212,212,196,${(0.5 + r() * 0.35).toFixed(2)})` : 'rgba(150,176,160,0.6)');
                }
            }
            // the thickness of the sheet, lit, on the edges that look at the lamp
            for (const poly of [HM.open, HM.nasal]) {
                for (let i = 0; i < poly.length; i++) {
                    const a = poly[i], b = poly[(i + 1) % poly.length], n = [-(b[1] - a[1]), b[0] - a[0]], l = Math.hypot(n[0], n[1]) || 1;
                    if (poly === HM.nasal ? a[1] < 9 : a[0] > -41 && a[0] < -16 && a[1] < 70) continue;
                    const f = ((n[0] * sd[0] + n[1] * sd[1]) / l) * (poly === HM.nasal ? -1 : 1);
                    if (f < 0.2) continue;
                    q.strokeStyle = `rgba(206,196,140,${(0.8 * f).toFixed(2)})`;
                    q.lineWidth = 1.9;
                    q.lineCap = 'round';
                    q.beginPath();
                    q.moveTo(a[0], a[1]);
                    q.lineTo(b[0], b[1]);
                    q.stroke();
                }
            }
        });
        // cut the openings, and give the nasal back
        const fin = sheet(box, res);
        fin.G.drawImage(sp.canvas, box.x, box.y, box.w, box.h);
        cut(fin.G, (q) => fillPts(q, HM.open, '#000'));
        fin.G.save();
        fin.G.beginPath();
        S.trace(fin.G, HM.nasal);
        fin.G.clip();
        fin.G.drawImage(sp.canvas, box.x, box.y, box.w, box.h);
        fin.G.restore();
        const shell = { canvas: fin.canvas, box };
        sprayIn(shell, res, { color: '#0c1a26', alpha: 0.7, w: 34, dir: sd });
        sprayIn(shell, res, { color: '#0a1020', alpha: 0.6, w: 9, dir: sd });
        sprayIn(shell, res, { color: '#eaf6d8', alpha: 0.34, w: 20, dir: K.tol });
        sprayIn(shell, res, { color: '#5aa6a0', alpha: 0.7, w: 1.5, push: 0.5, dir: sd });
        return shell;
    }

    function paintHelmet(G, K) {
        const r = Motion.rng('helmetin' + K.seed), sd = K.sd;
        // the hollow: the inside of the far wall, and the light the eyes let in lying on it
        piece(G, K, HM.open, {
            fill: '#0d111f', line: 0,
            detail: (q) => {
                for (let i = 0; i < 40; i++) {
                    const p = [-70 + r() * 124, -8 + r() * 126];
                    blobOn(q, p, 4 + r() * 8, r() < 0.5 ? '#1c3436' : '#141a2c', 0.5);
                }
                q.save();
                q.filter = `blur(${(3 * K.res).toFixed(1)}px)`;
                fillPts(q, HM.nearEye.map(([x, y]) => [x + sd[0] * 13 - 4, y + sd[1] * 13]), 'rgba(58,104,98,0.55)');
                q.restore();
                // rivet ends and the lining's stitches on the inside, barely seen
                for (let i = 0; i < 9; i++) disc(q, [-6 + i * 6.6, 19.5 - Math.abs(i - 4) * 0.5 + sd[1] * 3], 0.6, 'rgba(120,170,150,0.4)');
            },
        });
        stamp(G, helmetShell(K), K, { lw: 2.4, heavy: 0.85, cast: { d: 5, blur: 5, color: 'rgba(4,6,14,0.75)' } });
    }
    // a soft patch of colour (on a clipped or source-atop context)
    function blobOn(q, p, r, color, alpha) {
        const gr = q.createRadialGradient(p[0], p[1], 0, p[0], p[1], r);
        gr.addColorStop(0, rgba(color, alpha));
        gr.addColorStop(1, rgba(color, 0));
        q.fillStyle = gr;
        q.fillRect(p[0] - r, p[1] - r, r * 2, r * 2);
    }

    // ------------------------------------------------------------------ 4 · the Dressel 20
    // A brush alphabet for painted and stamped inscriptions: strokes in a box one unit high
    // (y = 0 the top, 1 the baseline). Rustic capitals: tall, narrow, feet that slant.
    const GLYPH = {
        A: [0.86, [[0.02, 1], [0.44, 0]], [[0.44, 0], [0.8, 1]], [[0.24, 0.62], [0.62, 0.6]]],
        C: [0.8, [[0.7, 0.16], [0.46, 0], [0.14, 0.24], [0.08, 0.6], [0.3, 0.96], [0.7, 0.86]]],
        E: [0.7, [[0.12, 0], [0.12, 1]], [[0.12, 0.02], [0.6, 0]], [[0.12, 0.5], [0.5, 0.47]], [[0.12, 1], [0.64, 0.96]]],
        I: [0.34, [[0.14, 0], [0.14, 1]]],
        L: [0.68, [[0.12, 0], [0.12, 1]], [[0.12, 1], [0.62, 0.95]]],
        O: [0.84, [[0.4, 0], [0.12, 0.26], [0.1, 0.72], [0.4, 1], [0.68, 0.74], [0.7, 0.28], [0.4, 0]]],
        P: [0.74, [[0.12, 0], [0.12, 1]], [[0.12, 0.03], [0.5, 0.02], [0.64, 0.22], [0.46, 0.45], [0.12, 0.49]]],
        Q: [0.88, [[0.4, 0], [0.12, 0.26], [0.1, 0.72], [0.4, 1], [0.68, 0.74], [0.7, 0.28], [0.4, 0]], [[0.46, 0.8], [0.9, 1.14]]],
        R: [0.8, [[0.12, 0], [0.12, 1]], [[0.12, 0.03], [0.5, 0.02], [0.64, 0.22], [0.46, 0.45], [0.12, 0.49]], [[0.32, 0.48], [0.76, 1.02]]],
        S: [0.72, [[0.6, 0.13], [0.4, 0], [0.14, 0.14], [0.2, 0.4], [0.5, 0.56], [0.58, 0.82], [0.36, 1], [0.08, 0.9]]],
        T: [0.76, [[0.35, 0.02], [0.35, 1]], [[0, 0.05], [0.72, 0]]],
        V: [0.8, [[0.02, 0], [0.38, 1]], [[0.38, 1], [0.72, 0]]],
        X: [0.74, [[0.02, 0], [0.66, 1]], [[0.66, 0], [0.02, 1]]],
        '·': [0.42, [[0.2, 0.5], [0.24, 0.54]]],
        ' ': [0.5],
    };
    // text as strokes: `at(u, v)` maps the line's own units (u along it, v above the baseline)
    // to the page; `draw(pts, bold)` paints one stroke
    function lettering(text, h, at, draw, o = {}) {
        const track = o.track ?? 0.14, r = Motion.rng('letters' + text + (o.seed ?? ''));
        const total = [...text].reduce((w, ch) => w + (GLYPH[ch]?.[0] ?? 0.6) + track, 0) * h;
        let u = -total * (o.align ?? 0.5);
        for (const ch of text) {
            const gl = GLYPH[ch];
            if (!gl) continue;
            const jy = (r() - 0.5) * (o.jitter ?? 0.08), sc = 1 + (r() - 0.5) * (o.jitter ?? 0.08) * 1.5;
            for (const st of gl.slice(1)) {
                const pts = (st.length > 2 ? S.curve(st, false, 5) : [st[0], lerpP(st[0], st[1], 0.5), st[1]]).map(([x, y]) => at(u + x * h * sc, (1 - y + jy) * h * sc));
                const d = [st[st.length - 1][0] - st[0][0], st[st.length - 1][1] - st[0][1]];
                draw(pts, Math.abs(d[0]) / (Math.hypot(d[0], d[1]) || 1));
            }
            u += (gl[0] + track) * h;
        }
        return total;
    }

    const AM = (() => {
        // the profile: [height, radius] from the lip down to the knob
        const prof = [[-122, 27], [-119.5, 32], [-114, 34], [-109, 31.2], [-105.5, 26.2], [-100, 25], [-90, 26.5], [-80, 31], [-70, 44], [-58, 62], [-42, 79], [-22, 91], [0, 96.5], [20, 97], [42, 92], [62, 81], [80, 65], [95, 47], [107, 28], [114, 15.5], [118, 10.5], [121, 11.5], [124.3, 8], [125.5, 1]];
        const dense = S.curve(prof.map(([y, r]) => [r, y]), false, 10), tab = [];
        for (let y = -123; y <= 127; y++) {
            let r = y < -122 ? 27 : 1;
            for (let i = 1; i < dense.length; i++) {
                const a = dense[i - 1], b = dense[i];
                if (a[1] <= y && b[1] >= y && b[1] > a[1]) {
                    r = a[0] + ((b[0] - a[0]) * (y - a[1])) / (b[1] - a[1]);
                    break;
                }
            }
            tab.push(r);
        }
        const rAt = (y) => {
            const f = Math.max(0, Math.min(tab.length - 1.001, y + 123)), i = Math.floor(f);
            return tab[i] + (tab[i + 1] - tab[i]) * (f - i);
        };
        const K0 = 0.2; // how far from above it is seen: a ring's front dips by this much of its radius
        const top = [];
        for (let k = 0; k <= 24; k++) top.push([-27 * Math.cos((k / 24) * Math.PI), -122 - 27 * K0 * Math.sin((k / 24) * Math.PI)]);
        const out = [...top, ...dense.slice(1), ...dense.slice(1, -1).reverse().map(([r, y]) => [-r, y])];
        // the ring a point of the picture lies on
        const latOf = (ax, ay) => {
            let lat = ay;
            for (let k = 0; k < 3; k++) {
                const r = rAt(lat);
                lat = ay - K0 * Math.sqrt(Math.max(0, r * r - ax * ax));
            }
            return lat;
        };
        const handle = (sx) => S.curve([[20, -103], [33, -110.5 - (sx < 0 ? 1.2 : 0)], [48, -110 - (sx < 0 ? 1.5 : 0)], [60.5, -98], [64.5, -81], [61.5, -64], [53, -49]].map(([x, y]) => [x * sx, y]), false, 10);
        return { rAt, out, latOf, K0, handle };
    })();
    const CLAY = { fabric: [201, 130, 82], slip: [228, 205, 164], core: [190, 110, 72], grey: [148, 138, 128], lime: [236, 232, 218], shade: [46, 26, 46], light: [255, 248, 228] };
    const clayLit = (a, tone, rgb, m) => {
        const t = clamp(tone), f = 0.26 + 1.02 * t, ks = smooth(0.5, 0.1, t) * 0.72, kl = smooth(0.84, 1, t) * 0.3;
        for (let c = 0; c < 3; c++) {
            let v = Math.min(255, a[c] * f);
            v += (CLAY.shade[c] - v) * ks;
            v += (CLAY.light[c] - v) * kl;
            rgb[c] = v;
        }
        const kn = smooth(0.3, 0.06, tone) * smooth(0.06, 0.005, m) * 0.45;
        rgb[0] += (84 - rgb[0]) * kn;
        rgb[1] += (72 - rgb[1]) * kn;
        rgb[2] += (132 - rgb[2]) * kn;
    };
    // grits of temper in the fabric: quartz white, grog red-brown, a dark one now and then
    const grit = (x, y, a, k = 1) => {
        const cx = Math.floor(x / 1.7), cy = Math.floor(y / 1.7), h = S.hashI(cx, cy, 1, 91);
        if (h < 1 - 0.16 * k) return;
        const px = (cx + 0.3 + 0.4 * S.hashI(cx, cy, 2, 91)) * 1.7, py = (cy + 0.3 + 0.4 * S.hashI(cx, cy, 3, 91)) * 1.7, rr = 0.2 + 0.4 * S.hashI(cx, cy, 4, 91), d = Math.hypot(x - px, y - py);
        if (d > rr) return;
        const kind = S.hashI(cx, cy, 5, 91), col = kind < 0.3 ? [244, 240, 228] : kind < 0.75 ? [150, 78, 52] : [70, 50, 48], kk = 0.75 * smooth(rr, rr * 0.4, d);
        for (let c = 0; c < 3; c++) a[c] += (col[c] - a[c]) * kk;
    };

    function amphoraBody(K, F) {
        const res = K.res, out = F.pts(AM.out), box = even(S.bbox(out, 4)), r = Motion.rng('amphora' + K.seed);
        const c = Math.cos(F.rot), sn = Math.sin(F.rot), o = F([0, 0]);
        const AX = (x, y) => (x - o[0]) * c + (y - o[1]) * sn, AY = (x, y) => -(x - o[0]) * sn + (y - o[1]) * c;
        const onBody = (s, lat) => {
            const rr = AM.rAt(lat), ph = s / rr;
            return F([rr * Math.sin(ph), lat + AM.K0 * rr * Math.cos(ph)]);
        };
        // the spall on the belly, and the lime crust: painted masks
        const spall = [[42, 46], [47, 40.5], [52, 39], [58, 42.5], [63.5, 44], [64, 51], [60.5, 55], [59, 61], [53, 62.5], [47.5, 59], [45, 53.5]].map(([x, y], i) => F([x + S.noise2(i * 1.7, 2, 5) * 1.6, y + S.noise2(i * 1.7, 9, 5) * 1.6]));
        const chip = Field(box, res).paint(1, (q) => fillPts(q, spall, '#fff'), 'set', 0.35);
        const rimChip = Field(box, res).paint(1, (q) => fillPts(q, F.pts(S.curve([[-33.5, -118], [-29, -121], [-24, -119], [-27, -113.5], [-33, -113]], true, 4)), '#fff'), 'set', 0.3);
        const lime = Field(box, res).paint(1, (q) => {
            q.filter = `blur(${(1.2 * res).toFixed(1)}px)`;
            for (const [x, y, rr, n] of [[-62, 58, 13, 22], [-40, 86, 10, 16], [24, 98, 9, 12], [-82, 6, 7, 9], [72, -8, 6, 8], [8, 112, 6, 8], [-20, 40, 5, 5]]) {
                for (let i = 0; i < n; i++) disc(q, F([x + (r() - 0.5) * rr * 2.4, y + (r() - 0.5) * rr * 1.7]), rr * (0.1 + r() * r() * 0.42), '#fff');
            }
            q.filter = 'none';
        });
        const sp = S.form({
            box, res, light: K.L, seed: 'amphora' + K.seed, relief: 0.98,
            mask: (q) => fillPts(q, out, '#fff'),
            height: (x, y) => {
                const ax = AX(x, y), ay = AY(x, y), lat = AM.latOf(ax, ay), rr = AM.rAt(lat), cz = Math.sqrt(Math.max(0, 1 - (ax * ax) / (rr * rr)));
                const ra = 0.03 + 0.36 * smooth(-0.1, 0.6, S.noise2(lat * 0.04, 1, 80) + 0.35 * S.noise2(ax * 0.025, lat * 0.02, 79));
                let h = (ra * Math.sin(lat * 1.6 + 2.6 * S.noise2(lat * 0.07, 3, 84)) + 0.07 * Math.sin(lat * 4.6 + 2 * S.noise2(lat * 0.2, 5, 85))) * (0.3 + 0.7 * cz);
                h += (2.4 * Math.exp(-Math.pow((lat + 114) / 4.4, 2)) - 1.3 * Math.exp(-Math.pow((lat + 104.5) / 3, 2)) + 0.8 * Math.exp(-Math.pow((lat + 84) / 1.8, 2)) + 1.1 * Math.exp(-Math.pow((lat - 121) / 2, 2))) * (0.4 + 0.6 * cz);
                const ch = chip.at(x, y) + rimChip.at(x, y), lm = lime.at(x, y);
                h += -1.3 * ch * (0.7 + 0.6 * S.noise2(x * 0.7, y * 0.7, 86)) + 0.75 * smooth(0.2, 0.5, lm * (0.5 + 0.9 * S.noise2(x * 0.45, y * 0.45, 90))) * (0.7 + 0.5 * S.noise2(x * 0.9, y * 0.9, 87)) + 0.05 * S.noise2(x * 1.3, y * 1.3, 88);
                return h;
            },
            ramp: [[0, '#000000'], [1, '#ffffff']], soft: 1,
            tint: (x, y, tone, rgb, m) => {
                const ax = AX(x, y), ay = AY(x, y), lat = AM.latOf(ax, ay), rr = AM.rAt(lat), sv = clamp(ax / rr, -1, 1), s = rr * Math.asin(sv), cz = Math.sqrt(1 - sv * sv);
                // the slip, brushed on round the pot and worn through where the belly stands out
                const n1 = S.noise2(s * 0.022, lat * 0.03, 81) * 0.6 + S.noise2(s * 0.06, lat * 0.22, 82) * 0.4, belly = Math.exp(-Math.pow((lat - 16) / 44, 2)) * cz * (0.55 + 0.45 * S.noise2(s * 0.04 + 5, lat * 0.04, 83));
                const slip = smooth(-0.3, 0.12, n1 + 0.46 - belly * 0.9), tl = 0.5 + 0.5 * Math.sin(lat * 1.6 + 2.6 * S.noise2(lat * 0.07, 3, 84));
                const cloud = smooth(0.1, 0.75, S.noise2(s * 0.012 + 1.5, lat * 0.012, 89) + 0.5 * Math.exp(-(Math.pow((s - 52) / 40, 2) + Math.pow((lat - 50) / 34, 2)))) * 0.55;
                const ch = chip.at(x, y) + rimChip.at(x, y), lm = smooth(0.2, 0.5, lime.at(x, y) * (0.5 + 0.9 * S.noise2(x * 0.45, y * 0.45, 90)));
                const C = CLAY, a = [0, 0, 0], str = S.noise2(s * 0.5, lat * 3.2, 92);
                for (let k = 0; k < 3; k++) {
                    let v = C.fabric[k] + (C.slip[k] - C.fabric[k]) * slip * (0.86 + 0.14 * str);
                    v *= 1 - (1 - tl) * 0.05 * smooth(-0.1, 0.6, S.noise2(lat * 0.04, 1, 80)) - 0.05 * str;
                    v += (C.grey[k] - v) * cloud;
                    v += (C.core[k] * (0.82 + 0.3 * S.noise2(x * 0.5, y * 0.5, 93)) - v) * smooth(0.3, 0.7, ch);
                    a[k] = v;
                }
                grit(x, y, a, 0.5 + 2.2 * smooth(0.3, 0.7, ch) + (1 - slip) * 0.7);
                for (let k = 0; k < 3; k++) a[k] += (C.lime[k] * (0.86 + 0.14 * S.noise2(x * 1.1, y * 1.1, 94)) - a[k]) * lm * 0.88;
                clayLit(a, tone, rgb, m);
            },
        });
        // the painted inscriptions, on a sheet of their own so that time can rub them
        const ink = sheet(box, res), q = ink.G, BLACK = '#231614';
        const brush = (w) => (pts, bold) => S.ink(q, pts, { w: w * (0.62 + 0.75 * bold), color: BLACK, taper: [0.25, 0.45] });
        lettering('LXXXXV', 6.2, (u, v) => onBody(u - 2, -80.5 - v), brush(0.95), { seed: 'a', track: 0.2 });
        lettering('L·AELI·OPTATI', 11.5, (u, v) => onBody(u - 6, -55 - v), brush(1.5), { seed: 'b', track: 0.16 });
        strokePts(q, [onBody(-22, -37.5), onBody(-4, -38.2), onBody(14, -37.8)], 0.9, BLACK);
        lettering('CCXVI', 13, (u, v) => onBody(u - 4, -22 - v), brush(1.7), { seed: 'c', track: 0.2 });
        // δ: the control, written fast and aslant beside the handle: R, the district, the
        // weight again, who weighed it, the consuls. Old Roman cursive: long slanting strokes.
        const dl = (u, v, line) => onBody(52 + u * 0.36 - v * 0.93 - line * 8.5, -44 + u * 0.93 + v * 0.36 - line * 1.5);
        const cur = (line, n, seedL, len) => {
            const rr = Motion.rng('delta' + seedL);
            let u = 0;
            for (let i = 0; i < n && u < len; i++) {
                const k = Math.floor(rr() * 6), h = 4.4 + rr() * 2, w = 1.6 + rr() * 2.4;
                const st = k === 0 ? [[0, 0], [w * 0.3, h * 0.5], [w, h * 1.1]] : k === 1 ? [[0, h], [w * 0.5, h * 0.2], [w, 0], [w * 1.2, h * 0.6]] : k === 2 ? [[0, h * 0.2], [w * 0.2, h], [w * 0.9, h * 0.3], [w * 1.1, h * 1.5]] : k === 3 ? [[0, h * 1.7], [w * 0.4, h * 0.4], [w * 0.3, -h * 0.2]] : k === 4 ? [[0, h * 0.1], [w * 0.5, h * 1.6]] : [[0, 0], [w * 0.1, h * 0.8], [w * 0.8, h]];
                S.ink(q, S.curve(st.map(([x, y]) => dl(u + x, h - y - 1, line)), false, 5), { w: 0.85 + rr() * 0.4, color: BLACK, taper: [0.2, 0.7] });
                u += w + 1 + (rr() < 0.22 ? 3 : 0);
            }
        };
        S.ink(q, S.curve([dl(0, 0, 0), dl(0.5, 5, 0), dl(0, 9.5, 0)], false, 5), { w: 1.3, color: BLACK, taper: [0.2, 0.3] });
        S.ink(q, S.curve([dl(0, 9.3, 0), dl(4.5, 9, 0), dl(5, 5.6, 0), dl(0.6, 4.8, 0), dl(4, 2), dl(9.5, -3.5, 0)], false, 6), { w: 1.2, color: BLACK, taper: [0.3, 0.8] });
        cur(0, 9, 'a', 34);
        cur(1, 12, 'b', 44);
        cur(2, 10, 'c', 38);
        // rubbed: specks gone everywhere, whole patches gone where hands and ropes went
        cut(q, (qq) => {
            for (let i = 0; i < 1500; i++) disc(qq, onBody(-70 + r() * 150, -92 + r() * 90), 0.2 + r() * r() * 1.1, '#000');
            qq.filter = `blur(${(2 * res).toFixed(1)}px)`;
            for (const [s0, l0, rr, a] of [[-34, -52, 7, 0.75], [20, -30, 6, 0.6], [62, -30, 8, 0.6], [-8, -80, 4, 0.5], [40, -56, 4.5, 0.7]]) disc(qq, onBody(s0, l0), rr, `rgba(0,0,0,${a})`);
        });
        onto(sp, res, (g) => {
            g.globalAlpha = 0.88;
            g.drawImage(ink.canvas, box.x, box.y, box.w, box.h);
            g.globalAlpha = 1;
            // the spall's edge: sharp, shaded on the lamp's side, and the crack that runs from it
            for (const poly of [spall]) {
                for (let i = 0; i < poly.length; i++) {
                    const a = poly[i], b = poly[(i + 1) % poly.length], f = (-(b[1] - a[1]) * K.sd[0] + (b[0] - a[0]) * K.sd[1]) / (Math.hypot(b[0] - a[0], b[1] - a[1]) || 1);
                    strokePts(g, [a, b], 0.75, f < 0 ? `rgba(40,20,30,${(-0.85 * f).toFixed(2)})` : `rgba(255,244,220,${(0.7 * f).toFixed(2)})`);
                }
            }
            const crack = S.curve([[44, 46], [36, 38], [33, 26], [25, 16], [23, 2], [16, -8]], false, 8).map(([x, y], i) => F([x + S.noise2(i * 0.5, 1, 6) * 1.2, y]));
            S.ink(g, crack, { w: 0.7, color: '#3a1e22', alpha: 0.85, taper: [0, 1] });
            S.ink(g, crack.map(([x, y]) => [x + K.sd[0] * 0.7, y + K.sd[1] * 0.7]), { w: 0.4, color: '#fff2d8', alpha: 0.55, taper: [0, 1] });
            // a graffito scratched after firing, low on the belly: a tally someone kept
            lettering('XIII', 9, (u, v) => onBody(u - 36, 74 - v), (pts) => {
                S.ink(g, pts, { w: 0.7, color: '#fff6e2', alpha: 0.7, taper: [0.3, 0.6] });
                S.ink(g, pts.map(([x, y]) => [x - K.sd[0] * 0.6, y - K.sd[1] * 0.6]), { w: 0.45, color: '#6a3a2c', alpha: 0.6, taper: [0.3, 0.6] });
            }, { seed: 'graf', track: 0.3, jitter: 0.2 });
            // the scar where another jar stood against it in the kiln, and a drip of slip
            g.lineWidth = 1.1;
            g.strokeStyle = 'rgba(150,96,70,0.4)';
            g.beginPath();
            const sc = [];
            for (let k = 0; k <= 16; k++) sc.push(onBody(-58 + Math.cos(k * 0.36) * 11, 16 + Math.sin(k * 0.36) * 9));
            S.trace(g, sc, false);
            g.stroke();
            S.ink(g, S.curve([onBody(29, -14), onBody(31.5, -6), onBody(30.4, 3), onBody(32.4, 10), onBody(32, 15)], false, 6), { w: 1.9, color: '#f2e2c0', alpha: 0.34, taper: [0.8, 0.1] });
            disc(g, onBody(32, 15.4), 1.3, 'rgba(242,226,192,0.4)');
            // rootlets etched the surface while it lay in the ground
            for (let i = 0; i < 7; i++) {
                let p = [-70 + r() * 130, 30 + r() * 70], a = r() * TAU;
                for (let b = 0; b < 3; b++) {
                    const line = [p];
                    for (let k = 0; k < 9; k++) {
                        a += (r() - 0.5) * 0.9;
                        line.push([line[k][0] + Math.cos(a) * 2.6, line[k][1] + Math.sin(a) * 2.6]);
                    }
                    S.ink(g, line.map((pt) => F(pt)), { w: 0.45, color: b ? '#f4ead2' : '#7a4a36', alpha: 0.28, taper: [0.2, 1] });
                    p = line[3 + b];
                    a += 0.9;
                }
            }
            // oil that ran from the mouth and soaked in: dark, with a darker edge
            g.globalCompositeOperation = 'source-atop';
            for (const [s0, w0, l1, a] of [[-13, 4.6, -66, 0.3], [-6, 3, -47, 0.26], [-21, 2.6, -80, 0.26], [8, 2.2, -88, 0.2]]) {
                // each run wanders, swells where it slowed, and ends in a bead
                g.save();
                g.filter = `blur(${(0.9 * res).toFixed(1)}px)`;
                for (let lat = -117; lat <= l1; lat += 1.6) {
                    const u = (lat + 117) / (l1 + 117), w = w0 * (0.55 + 0.45 * S.noise2(lat * 0.11, s0, 8) + 0.5 * Math.pow(u, 6)) * (1 - 0.35 * u);
                    disc(g, onBody(s0 + S.noise2(lat * 0.045, s0, 7) * 5 + u * 2, lat), Math.max(0.5, w), `rgba(74,42,22,${a})`);
                }
                g.restore();
                const edge = [];
                for (let lat = -112; lat <= l1; lat += 3) edge.push(onBody(s0 + S.noise2(lat * 0.045, s0, 7) * 5 + ((lat + 117) / (l1 + 117)) * 2 + w0 * 0.42, lat));
                S.ink(g, edge, { w: 0.5, color: '#4a2814', alpha: 0.35, taper: [0.6, 0.2] });
            }
            g.globalCompositeOperation = 'source-atop';
            // the lip's undercut, the join of neck and shoulder: drawn lines, broken
            for (const [lat, w, a] of [[-106.2, 1, 0.6], [-84.5, 0.7, 0.4], [117.6, 0.8, 0.5]]) {
                const rr = AM.rAt(lat), line = [];
                for (let u = -1.42; u <= 1.42; u += 0.08) line.push(F([rr * Math.sin(u), lat + AM.K0 * rr * Math.cos(u)]));
                S.ink(g, line.slice(0, 22), { w, color: '#4a2428', alpha: a, taper: [0.9, 0.3] });
                S.ink(g, line.slice(24), { w, color: '#4a2428', alpha: a, taper: [0.5, 0.9] });
                S.ink(g, line.map(([x, y]) => [x + K.sd[0] * 0.9, y + K.sd[1] * 0.9]).slice(6, 30), { w: w * 0.6, color: '#fff6e0', alpha: a * 0.6, taper: [0.9, 0.9] });
            }
        });
        sprayIn(sp, res, { color: '#5a2c3a', alpha: 0.6, w: 34, dir: K.sd });
        sprayIn(sp, res, { color: '#2e1630', alpha: 0.55, w: 9, dir: K.sd });
        sprayIn(sp, res, { color: '#fff6dc', alpha: 0.36, w: 22, dir: K.tol });
        sprayIn(sp, res, { color: '#c98452', alpha: 0.7, w: 1.6, push: 0.5, dir: K.sd });
        return sp;
    }
    // the mouth: the throat dark, its far wall catching a little light, the rim's flat top
    function amphoraMouth(G, K, F) {
        const E = (rr, y0, n = 40) => {
            const e = [];
            for (let k = 0; k < n; k++) e.push(F([rr * Math.cos((k / n) * TAU), y0 + rr * AM.K0 * Math.sin((k / n) * TAU)]));
            return e;
        };
        const throat = E(20.5, -121.4);
        piece(G, K, throat, {
            fill: '#241412', line: 1.3, heavy: 0.3, ink: '#2a1418',
            detail: (g) => {
                S.spray(g, throat, { color: '#0c0608', alpha: 0.9, w: 6, push: 5, dir: K.tol });
                S.spray(g, throat, { color: '#b87a50', alpha: 0.6, w: 3, push: 1.6, dir: K.sd });
                for (const k of [0.62, 0.82]) strokePts(g, E(20.5 * k, -121.4 + 1.2 * (1 - k) * 6, 30).slice(16, 29), 0.4, 'rgba(210,150,100,0.35)');
            },
        });
        strokePts(G, E(23.4, -121.9).slice(22, 39), 0.7, 'rgba(255,246,222,0.65)');
    }

    // A handle: a thick roll of clay, luted on at both ends with a wipe of the thumb.
    function amphoraHandle(K, F, sx) {
        const res = K.res, line = AM.handle(sx), pts = F.pts(band(line, (u) => 16.5 + 5 * Math.pow(Math.abs(u * 2 - 1), 4))), box = even(S.bbox(pts, 5));
        const c = Math.cos(F.rot), sn = Math.sin(F.rot), o = F([0, 0]), st = walk(line, 1);
        const at = st[Math.floor(st.length * 0.37)], ta = Math.atan2(at.t[1], at.t[0]) + (sx < 0 ? Math.PI : 0), Fs = F.sub(at.p[0] + at.n[0] * sx * 1.2, at.p[1] + at.n[1] * sx * 1.2, ta);
        // the stamp: a rectangular die pressed into the wet clay, its letters standing in the hollow
        const die = Fs.pts(S.curve([[-10.5, -3.9], [10.5, -4.1], [10.7, 3.9], [-10.4, 4.1]].flatMap((p, i, a) => [lerpP(p, a[(i + 3) % 4], 0.08), p, lerpP(p, a[(i + 1) % 4], 0.08)]), true, 3));
        const sunk = Field(box, res);
        if (sx < 0) {
            sunk.paint(1, (q) => {
                fillPts(q, die, '#fff');
                lettering('L·Q·S', 5.4, (u, v) => Fs([u, 2.7 - v]), (p) => strokePts(q, p, 1.25, '#000'), { seed: 'die', track: 0.34, jitter: 0.03 });
            }, 'set', 0.1);
        }
        const sp = S.form({
            box, res, light: K.L, seed: 'handle' + sx + K.seed, relief: 1,
            mask: (q) => fillPts(q, pts, '#fff'),
            height: (x, y) => -1.3 * sunk.at(x, y) + 0.3 * S.noise2(x * 0.16, y * 0.16, 95) + 0.05 * S.noise2(x * 1.3, y * 1.3, 96),
            ramp: [[0, '#000000'], [1, '#ffffff']], soft: 1,
            tint: (x, y, tone, rgb, m) => {
                const ax = (x - o[0]) * c + (y - o[1]) * sn, ay = -(x - o[0]) * sn + (y - o[1]) * c;
                const slip = smooth(-0.3, 0.2, S.noise2(ax * 0.05, ay * 0.05, 97) + 0.2 - 0.5 * smooth(0.5, 0.95, m)), sk = sunk.at(x, y), a = [0, 0, 0];
                for (let k = 0; k < 3; k++) a[k] = (CLAY.fabric[k] + (CLAY.slip[k] - CLAY.fabric[k]) * slip * 0.9) * (1 - 0.34 * sk) * (0.94 + 0.08 * S.noise2(ax * 0.4, ay * 0.4, 98));
                grit(x, y, a, 0.6 + (1 - slip) * 0.6);
                clayLit(a, tone, rgb, m);
            },
        });
        onto(sp, res, (q) => {
            // drawn along the roll: the marks of the hand that pulled it
            for (let i = 0; i < 9; i++) {
                const off = (i - 4) * 1.7 + (S.hashI(i, 1, 2, 7) - 0.5), a = Math.floor(8 + S.hashI(i, 2, 2, 7) * 20), b = Math.floor(st.length - 8 - S.hashI(i, 3, 2, 7) * 24);
                S.ink(q, st.slice(a, b).filter((_, k) => k % 3 === 0).map((w) => F([w.p[0] + w.n[0] * off, w.p[1] + w.n[1] * off])), { w: 0.45, color: i % 3 ? '#8a5236' : '#fff4dc', alpha: 0.3 });
            }
            if (sx < 0) {
                // the die's edge: its near wall in shade, its far wall lit
                for (let i = 0; i < die.length; i++) {
                    const a = die[i], b = die[(i + 1) % die.length], f = (-(b[1] - a[1]) * K.sd[0] + (b[0] - a[0]) * K.sd[1]) / (Math.hypot(b[0] - a[0], b[1] - a[1]) || 1);
                    strokePts(q, [a, b], 0.6, f < 0 ? `rgba(52,24,28,${(-0.85 * f).toFixed(2)})` : `rgba(255,246,224,${(0.75 * f).toFixed(2)})`);
                }
            }
        });
        sprayIn(sp, res, { color: '#5a2c3a', alpha: 0.7, w: 7, dir: K.sd });
        sprayIn(sp, res, { color: '#2e1630', alpha: 0.5, w: 2.5, dir: K.sd });
        sprayIn(sp, res, { color: '#fff6dc', alpha: 0.45, w: 5, dir: K.tol });
        sprayIn(sp, res, { color: '#c98452', alpha: 0.7, w: 1.2, push: 0.4, dir: K.sd });
        return { sp, st };
    }

    // A sherd: its face, and the thickness of the wall wherever the break looks at us.
    function sherd(G, K, F, face, thick, o = {}) {
        const r = Motion.rng('sherd' + (o.seed ?? 0)), pts = F.pts(face), tv = F.dir(thick), n = pts.length;
        const ctr = pts.reduce((a, p) => [a[0] + p[0] / n, a[1] + p[1] / n], [0, 0]);
        S.cast(G, (q) => fillPts(q, pts.map(([x, y]) => [x + tv[0], y + tv[1]]), '#000'), { blur: 4, dx: K.sd[0] * 3, dy: K.sd[1] * 3, color: 'rgba(14,8,26,0.5)' });
        // the break: a sandwich, orange skins and a grey core, full of grit
        for (let i = 0; i < n; i++) {
            const a = pts[i], b = pts[(i + 1) % n], e = [b[0] - a[0], b[1] - a[1]], out = [e[1], -e[0]], m = lerpP(a, b, 0.5);
            const sign = (m[0] - ctr[0]) * out[0] + (m[1] - ctr[1]) * out[1] > 0 ? 1 : -1;
            if ((out[0] * tv[0] + out[1] * tv[1]) * sign <= 0) continue;
            const quad = [a, b, [b[0] + tv[0], b[1] + tv[1]], [a[0] + tv[0], a[1] + tv[1]]], lit = (out[0] * K.tol[0] + out[1] * K.tol[1]) * sign / (Math.hypot(e[0], e[1]) || 1);
            piece(G, K, quad, {
                fill: mix('#b0603c', '#d8935e', clamp(0.5 + 0.5 * lit)), line: 1.3, heavy: 0.5,
                detail: (q) => {
                    q.save();
                    q.filter = `blur(${(0.5 * K.res).toFixed(1)}px)`;
                    strokePts(q, [lerpP(a, quad[3], 0.5), lerpP(b, quad[2], 0.5)], Math.hypot(tv[0], tv[1]) * 0.3, 'rgba(136,118,106,0.8)');
                    q.restore();
                    for (let k = 0; k < 16; k++) {
                        const p = lerpP(lerpP(a, b, r()), lerpP(quad[3], quad[2], r()), r());
                        disc(q, p, 0.25 + r() * 0.5, r() < 0.5 ? 'rgba(246,240,226,0.9)' : r() < 0.6 ? 'rgba(96,44,34,0.8)' : 'rgba(50,36,40,0.7)');
                    }
                    S.spray(q, quad, { color: '#6a3028', alpha: 0.45, w: 4, dir: K.sd });
                },
            });
        }
        piece(G, K, pts, {
            fill: o.inside ? '#c08258' : '#dfc69c', line: 1.2, heavy: 0, ink: '#4a2a30',
            shade: [{ color: '#7a4638', alpha: 0.7, w: 12 }, { color: '#3a1c30', alpha: 0.4, w: 4 }], light: { color: '#fff8e4', alpha: 0.6, w: 9 },
            detail: (q) => {
                // slip worn off in patches, rilling across, grit; chipped corners
                for (let i = 0; i < (o.inside ? 3 : 7); i++) blobOn(q, lerpP(ctr, pts[Math.floor(r() * n)], 0.3 + r() * 0.6), 4 + r() * 7, o.inside ? '#a0623e' : '#c98452', 0.6);
                const dir = F.dir(o.rill ?? [1, 0.1]), nr = [-dir[1], dir[0]];
                for (let k = -8; k <= 8; k++) {
                    const c0 = [ctr[0] + nr[0] * k * (o.inside ? 2.6 : 3.4), ctr[1] + nr[1] * k * (o.inside ? 2.6 : 3.4)], bow = (o.inside ? -1 : 1) * 2.4;
                    const line = [-30, -15, 0, 15, 30].map((u) => [c0[0] + dir[0] * u + nr[0] * bow * (1 - (u * u) / 900), c0[1] + dir[1] * u + nr[1] * bow * (1 - (u * u) / 900)]);
                    S.ink(q, S.curve(line, false, 5), { w: o.inside ? 0.9 : 0.5, color: '#8a5236', alpha: o.inside ? 0.45 : 0.3, taper: [0, 0] });
                    S.ink(q, S.curve(line.map(([x, y]) => [x + K.sd[0] * 0.8, y + K.sd[1] * 0.8]), false, 5), { w: 0.4, color: '#fff6e0', alpha: o.inside ? 0.4 : 0.25, taper: [0, 0] });
                }
                for (let k = 0; k < 40; k++) {
                    const p = lerpP(ctr, pts[Math.floor(r() * n)], Math.sqrt(r()));
                    disc(q, p, 0.2 + r() * 0.4, r() < 0.5 ? 'rgba(250,244,230,0.8)' : 'rgba(110,56,40,0.7)');
                }
                if (o.detail) o.detail(q, ctr);
            },
        });
        // the lamp along the sharp arris of the break
        for (let i = 0; i < n; i++) {
            const a = pts[i], b = pts[(i + 1) % n], e = [b[0] - a[0], b[1] - a[1]], out = [e[1], -e[0]], m = lerpP(a, b, 0.5), sign = (m[0] - ctr[0]) * out[0] + (m[1] - ctr[1]) * out[1] > 0 ? 1 : -1;
            if ((out[0] * tv[0] + out[1] * tv[1]) * sign > 0) strokePts(G, [lerpP(a, b, 0.08), lerpP(a, b, 0.92)], 0.5, 'rgba(255,248,228,0.55)');
        }
    }

    function paintAmphora(G, K) {
        const F = frame(8, -6, 0.25), res = K.res;
        // The pot and its handles are one thing with one contour: the handles go down first,
        // the pot over their roots, and the join is wiped with the thumb, not drawn.
        const body = amphoraBody(K, F), hs = [amphoraHandle(K, F, 1), amphoraHandle(K, F, -1)];
        const ubox = { x: -132, y: -152, w: 264, h: 304 }, U = sheet(ubox, res), put = (g, sp) => g.drawImage(sp.canvas, sp.box.x, sp.box.y, sp.box.w, sp.box.h);
        put(U.G, body);
        for (const h of hs) {
            // the roll's two ends are smeared into the pot: its paint thins out to nothing there
            const top = sheet(ubox, res), n = h.st.length;
            put(top.G, h.sp);
            cut(top.G, (q) => {
                for (const [k0, k1] of [[0, 15], [n - 1, n - 18]]) {
                    const a = F(h.st[k0].p), b = F(h.st[k1].p), gr = q.createLinearGradient(a[0], a[1], b[0], b[1]);
                    gr.addColorStop(0, 'rgba(0,0,0,1)');
                    gr.addColorStop(0.25, 'rgba(0,0,0,1)');
                    gr.addColorStop(1, 'rgba(0,0,0,0)');
                    q.fillStyle = gr;
                    q.beginPath();
                    q.arc(a[0], a[1], 19, 0, TAU);
                    q.fill();
                }
            });
            S.cast(U.G, (q) => q.drawImage(top.canvas, ubox.x, ubox.y, ubox.w, ubox.h), { blur: 5, dx: K.sd[0] * 5, dy: K.sd[1] * 5, color: 'rgba(40,18,36,0.45)' });
            U.G.drawImage(top.canvas, ubox.x, ubox.y, ubox.w, ubox.h);
            // the thumb's wipe round each root
            for (const [k, rr] of [[14, 10], [h.st.length - 17, 13]]) {
                const p = h.st[k], w = p.n, dirn = k < 30 ? -1 : 1;
                for (let i = 0; i < 5; i++) {
                    const d = (i - 2) * 2, arc = [-1, -0.5, 0, 0.5, 1].map((u) => F([p.p[0] + w[0] * u * rr * 0.9 + p.t[0] * (d + dirn * (3 - 3 * u * u)), p.p[1] + w[1] * u * rr * 0.9 + p.t[1] * (d + dirn * (3 - 3 * u * u))]));
                    U.G.save();
                    U.G.globalCompositeOperation = 'source-atop';
                    S.ink(U.G, S.curve(arc, false, 5), { w: 0.5, color: i % 2 ? '#7a4630' : '#a8663e', alpha: 0.22, taper: [0.7, 0.7] });
                    U.G.restore();
                }
            }
        }
        stamp(G, { canvas: U.canvas, box: ubox }, K, { lw: 2.5, heavy: 0.85, cast: { d: 4 } });
        amphoraMouth(G, K, F);
        // sherds beside it: a wall sherd that still carries the end of a painted numeral, a
        // handle's stub with its grey core, a sherd lying inside-up
        const jag = (pts, a, sd) => pts.map(([x, y], i) => [x + S.noise2(i * 2.1, 1, sd) * a, y + S.noise2(i * 2.1, 5, sd) * a]);
        sherd(G, K, frame(88, 118, -0.22), jag([[-30, -10], [-12, -22], [8, -19], [26, -24], [34, -6], [22, 12], [2, 17], [-20, 13]], 2.4, 3), [3.5, 7.5], {
            seed: 'a', rill: [1, 0.12],
            detail: (q, ctr) => {
                const Ft = frame(ctr[0] - 5, ctr[1] + 6, -0.3);
                lettering('XV', 12, (u, v) => Ft([u, -v]), (p, bold) => S.ink(q, p, { w: 1.5 * (0.62 + 0.75 * bold), color: '#231614', alpha: 0.82, taper: [0.25, 0.45] }), { seed: 'sh' });
                blobOn(q, [ctr[0] + 6, ctr[1] - 2], 5, '#dfc69c', 0.7);
            },
        });
        sherd(G, K, frame(-70, 134, 0.3), jag([[-17, -6], [-3, -12], [13, -8], [18, 3], [6, 11], [-12, 9]], 1.8, 8), [2.5, 6], { seed: 'b', inside: true, rill: [1, -0.25] });
        // the handle stub
        const Fh = frame(-106, 104, -0.5), stub = S.curve([[-17, 4], [-6, -2], [6, -2.5], [17, 2]], false, 8), stubPts = Fh.pts(band(stub, 15.5, 16.5));
        piece(G, K, stubPts, {
            fill: '#dcc096', line: 2, heavy: 0.7, cast: { d: 3, blur: 4 },
            shade: [{ color: '#8a4e38', alpha: 0.85, w: 9 }, { color: '#3a1c30', alpha: 0.45, w: 3.5 }], light: { color: '#fff8e4', alpha: 0.7, w: 6 },
            detail: (q) => {
                const r = Motion.rng('stub' + K.seed);
                for (let i = 0; i < 5; i++) blobOn(q, Fh([-14 + r() * 28, -6 + r() * 12]), 3 + r() * 5, '#c98452', 0.6);
                for (let i = -3; i <= 3; i++) S.ink(q, Fh.pts(stub.map(([x, y]) => [x, y + i * 2.1])), { w: 0.45, color: i % 2 ? '#8a5236' : '#fff4dc', alpha: 0.3 });
                for (let k = 0; k < 30; k++) disc(q, Fh([-16 + r() * 32, -7 + r() * 14]), 0.2 + r() * 0.4, r() < 0.5 ? 'rgba(250,244,230,0.8)' : 'rgba(110,56,40,0.7)');
            },
        });
        const endE = Fh.pts(S.ellipse(17.2, 2.2, 4.4, 8.3, 22, 0.14).map(([x, y], i) => [x + S.noise2(i * 1.3, 2, 9) * 0.6, y + S.noise2(i * 1.3, 6, 9) * 0.6]));
        piece(G, K, endE, {
            fill: '#c47a50', line: 1.5, heavy: 0.5,
            shade: { color: '#5a2c30', alpha: 0.6, w: 4 },
            detail: (q) => {
                const r = Motion.rng('stubend' + K.seed);
                fillPts(q, Fh.pts(S.ellipse(17.2, 2.2, 2.4, 5.6, 16, 0.14)), 'rgba(124,116,112,0.9)');
                for (let k = 0; k < 26; k++) disc(q, Fh([13.4 + r() * 7.6, -5 + r() * 14.4]), 0.25 + r() * 0.45, r() < 0.55 ? 'rgba(246,240,226,0.9)' : 'rgba(84,40,34,0.8)');
            },
        });
    }

    // ------------------------------------------------------------------ 5 · the mosaic of the birds
    // Every tessera is laid, one by one, the way the mosaicist did: first the figure, in
    // rows that follow its outline; then two rows of ground round it; then the frame; then
    // the ground in straight courses, each stone cut to what room is left.
    const MO = {
        box: { x: -152, y: -122, w: 304, h: 244 }, c: [-22, -8], half: 62, band: 40,
        frag: [[-140, -96], [-118, -112], [-84, -108], [-60, -117], [-22, -112], [6, -118], [22, -101], [40, -95], [50, -108], [80, -116], [104, -110], [113, -93], [134, -85], [146, -56], [137, -28], [147, 2], [141, 36], [124, 50], [133, 72], [120, 94], [94, 104], [62, 98], [34, 106], [4, 101], [-26, 106], [-52, 99], [-70, 82], [-88, 71], [-98, 51], [-118, 44], [-128, 23], [-146, 14], [-139, -12], [-148, -40], [-141, -72]],
        // lacunae: where a patch of stones has gone and the bed shows
        gaps: [[66, 78, 9, 6], [-106, -62, 7, 5], [-62, 40, 4, 3], [92, -20, 4, 5]],
    };
    const STONE = {
        white: ['#ece6d6', '#e2dbc9', '#f2eee2', '#d9d2c0', '#e8e0cc', '#cfc7b3'].map(S.hex2rgb),
        dark: ['#2f2c30', '#38343a', '#28262c', '#413a3a'].map(S.hex2rgb),
        all: ['#ece6d6', '#e0d9c7', '#f3efe3', '#d5cebd', '#c9bfa8', '#b9b3a4', '#8d8a80', '#6f7886', '#8794a2', '#2e2b2e', '#3c3432', '#57483a', '#7e6a4a', '#a08a62', '#c9a04a', '#dcc070', '#e7cf96', '#8a5a34', '#9c4a2c', '#b8432e', '#cf7a5c', '#d9a590', '#7d8048', '#5f7a50', '#96a868'].map(S.hex2rgb),
    };
    const stoneNear = (c) => {
        let best = STONE.all[0], bd = 1e9;
        for (const st of STONE.all) {
            const d = (st[0] - c[0]) ** 2 * 0.9 + (st[1] - c[1]) ** 2 * 1.2 + (st[2] - c[2]) ** 2;
            if (d < bd) {
                bd = d;
                best = st;
            }
        }
        return best;
    };

    const mosaicPlan = (seed) => memo('moplan/' + seed, () => {
        const box = MO.box, r = Motion.rng('mosaic' + seed), [cx, cy] = MO.c, cells = [];
        // what is taken: a grid of half units
        const OW = box.w * 2, OH = box.h * 2, OC = new Uint8Array(OW * OH);
        const occ = (x, y) => {
            const i = Math.floor((x - box.x) * 2), j = Math.floor((y - box.y) * 2);
            return i < 0 || j < 0 || i >= OW || j >= OH ? 1 : OC[j * OW + i];
        };
        const mark = (q) => {
            const b = S.bbox(q), i0 = Math.max(0, Math.floor((b.x - box.x) * 2)), i1 = Math.min(OW - 1, Math.ceil((b.x + b.w - box.x) * 2)), j0 = Math.max(0, Math.floor((b.y - box.y) * 2)), j1 = Math.min(OH - 1, Math.ceil((b.y + b.h - box.y) * 2));
            for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) if (inside([box.x + (i + 0.5) / 2, box.y + (j + 0.5) / 2], q)) OC[j * OW + i] = 1;
        };
        const fragBox = S.bbox(MO.frag, 6);
        const near = (p) => p[0] > fragBox.x && p[0] < fragBox.x + fragBox.w && p[1] > fragBox.y && p[1] < fragBox.y + fragBox.h;
        const tone = (c, k = 0.09) => {
            const f = 1 + (r() - 0.5) * 2 * k, w = (r() - 0.5) * 8;
            return [c[0] * f + w, c[1] * f, c[2] * f - w];
        };
        const GAP = 0.85;
        // one stone between two stations of a walked line, as much of it as is free
        const cell = (st, s0, s1, wid, col, kind) => {
            const m = Math.max(2, Math.ceil((s1 - s0) / 0.5)), at = (s) => st[Math.max(0, Math.min(st.length - 1, Math.round(s / 0.5)))];
            let best = null, cur = null;
            for (let k = 0; k <= m; k++) {
                const s = s0 + ((s1 - s0) * k) / m, q = at(s), e = wid * 0.36;
                const free = !occ(q.p[0], q.p[1]) && !occ(q.p[0] + q.n[0] * e, q.p[1] + q.n[1] * e) && !occ(q.p[0] - q.n[0] * e, q.p[1] - q.n[1] * e);
                if (free) {
                    if (!cur) cur = [s, s];
                    cur[1] = s;
                    if (!best || cur[1] - cur[0] > best[1] - best[0]) best = cur;
                } else cur = null;
            }
            if (!best || best[1] - best[0] < Math.min(1.5, (s1 - s0) * 0.45)) return;
            const a = at(best[0]), b = at(best[1]), mid = at((best[0] + best[1]) / 2);
            if (!near(mid.p)) return;
            const hw = wid / 2, corner = (q, sg, tg, g) => [q.p[0] + q.n[0] * sg * (hw - g) + q.t[0] * tg * g + (g ? (r() - 0.5) * 0.5 : 0), q.p[1] + q.n[1] * sg * (hw - g) + q.t[1] * tg * g + (g ? (r() - 0.5) * 0.5 : 0)];
            mark([corner(a, 1, 0, 0), corner(b, 1, 0, 0), corner(b, -1, 0, 0), corner(a, -1, 0, 0)]);
            const c = typeof col === 'function' ? col(mid.p, (best[0] + best[1]) / 2) : col;
            if (!c) return;
            const g = GAP / 2;
            cells.push({ q: [corner(a, 1, 1, g), corner(b, 1, -1, g), corner(b, -1, -1, g), corner(a, -1, 1, g)], c: tone(c), h: 0.78 + r() * 0.22, p: mid.p, kind });
        };
        const row = (line, wid, col, o = {}) => {
            const st = walk(line, 0.5), total = st[st.length - 1].s;
            if (total < wid * 0.5) return;
            const n = Math.max(1, Math.round(total / (o.len ?? wid * 1.08))), cuts = [0];
            for (let i = 1; i < n; i++) cuts.push(((i + (r() - 0.5) * 0.3) * total) / n);
            cuts.push(total);
            for (let i = 0; i < n; i++) cell(st, cuts[i], cuts[i + 1], wid, col, o.kind ?? 'row');
        };
        const offset = (line, d) => walk(line, 0.5).map((q) => [q.p[0] + q.n[0] * d, q.p[1] + q.n[1] * d]);

        // ---- the figure: a red-legged partridge at a sprig of cherries. First as a painting
        // (what colour is where), from which every stone takes the nearest colour of the box.
        const bx = cx + 5, by = cy, B = (x, y) => [bx + x, by + y];
        const sil = S.curve([[-38, -22.5], [-35, -30], [-27, -33.5], [-19, -31], [-14, -24], [-8, -18], [4, -18.5], [18, -15.5], [30, -9], [40, -2], [49, 8], [47, 14], [38, 12], [30, 15], [22, 21], [10, 24], [-4, 23], [-16, 18], [-25, 8], [-31, -1], [-36, -8], [-39, -14]], true, 8).map(([x, y]) => B(x, y));
        const legs = [[[-4, 22], [-7.5, 30.5], [-7, 38]], [[9, 23], [9.8, 30.5], [9, 38]]].map((l) => S.curve(l.map(([x, y]) => B(x, y)), false, 6));
        const toes = [[[-7, 38.6], [-15.5, 40]], [[-6.4, 39], [-2, 40.6]], [[9, 38.6], [1.6, 40]], [[9.6, 39], [14, 40.6]]].map((l) => l.map(([x, y]) => B(x, y)));
        const beak = [B(-38, -18.4), B(-46, -16.6)];
        const twig = S.curve([[-59, 33], [-60.5, 20], [-61, 6], [-58, -8], [-54, -20], [-51, -27]].map(([x, y]) => B(x, y)), false, 8);
        const cherries = [[-52.6, -17.2, 4.4], [-55.8, -3.6, 4.2]].map(([x, y, rr]) => S.ellipse(bx + x, by + y, rr, rr, 20));
        const leaf = (a, b, w) => {
            const d = [b[0] - a[0], b[1] - a[1]], n = [-d[1], d[0]], l = Math.hypot(d[0], d[1]), out = [];
            for (let k = 0; k <= 10; k++) out.push([a[0] + d[0] * (k / 10) + (n[0] / l) * w * Math.sin((Math.PI * k) / 10), a[1] + d[1] * (k / 10) + (n[1] / l) * w * Math.sin((Math.PI * k) / 10)]);
            for (let k = 9; k >= 1; k--) out.push([a[0] + d[0] * (k / 10) - (n[0] / l) * w * Math.sin((Math.PI * k) / 10), a[1] + d[1] * (k / 10) - (n[1] / l) * w * Math.sin((Math.PI * k) / 10)]);
            return out;
        };
        const leaves = [leaf(B(-59.5, 18), B(-46.5, 26), 3.6), leaf(B(-52, -25), B(-43.5, -34.5), 3.3), leaf(B(-60, 0), B(-49.5, 7.5), 3.2)];
        const figBox = { x: cx - MO.half, y: cy - MO.half, w: MO.half * 2, h: MO.half * 2 }, MR = 3;
        const map = document.createElement('canvas');
        map.width = figBox.w * MR;
        map.height = figBox.h * MR;
        const mq = map.getContext('2d', { willReadFrequently: true });
        mq.setTransform(MR, 0, 0, MR, -figBox.x * MR, -figBox.y * MR);
        const el = (x, y, rx, ry, rot, col) => {
            mq.fillStyle = col;
            mq.beginPath();
            mq.ellipse(bx + x, by + y, rx, ry, rot, 0, TAU);
            mq.fill();
        };
        fillPts(mq, sil, '#57483a');
        mq.save();
        mq.beginPath();
        S.trace(mq, sil);
        mq.clip();
        el(6, 15, 32, 12.5, -0.1, '#c9a04a');
        el(4, 20.5, 22, 6, 0, '#dcc070');
        el(-17, 3, 14.5, 16.5, 0.3, '#6f7886');
        el(-17.5, 4, 9, 11, 0.3, '#8794a2');
        el(8, -12.5, 30, 10, 0.12, '#7e6a4a');
        el(13, -3, 19.5, 10.5, 0.25, '#57483a');
        for (const [k, c] of [[0.76, '#a08a62'], [0.5, '#7e6a4a'], [0.24, '#c9a04a']]) el(13, -3, 19.5 * k, 10.5 * k, 0.25, c);
        fillPts(mq, [B(27, -13), B(53, 5), B(51, 19), B(29, 15)], '#9c4a2c');
        fillPts(mq, [B(38, 3), B(53, 12), B(51, 19), B(35, 14)], '#8a5a34');
        // the barred flank: cream, black, chestnut, slanting
        ['#f3efe3', '#2e2b2e', '#9c4a2c', '#f3efe3', '#2e2b2e', '#9c4a2c'].forEach((c, i) => fillPts(mq, [B(-7 + i * 5, 3.5), B(-2 + i * 5, 4.4), B(-5.4 + i * 5, 17), B(-10.4 + i * 5, 16)], c));
        // head: a grey-brown crown, the white face and throat, the black collar that breaks into streaks
        el(-27, -27.5, 11.5, 7.5, 0, '#7e6a4a');
        el(-28.5, -13, 10, 11, 0.2, '#f3efe3');
        mq.lineCap = 'round';
        strokePts(mq, S.curve([B(-39, -21.4), B(-31, -24), B(-21.5, -22.4), B(-16.4, -14), B(-19.5, -3.4), B(-28, 1.8), B(-36.5, -3)], false, 8), 3.6, '#2e2b2e');
        for (const [x, y] of [[-22, 5.5], [-15.5, 8], [-25.5, 10.5], [-11.5, 3], [-18, 13.5]]) strokePts(mq, [B(x, y), B(x + 1, y + 3.4)], 2.8, '#2e2b2e');
        el(-30, -18.2, 3.6, 3.4, 0, '#b8432e');
        mq.restore();
        for (const l of legs) strokePts(mq, l, 4, '#b8432e');
        for (const l of toes) strokePts(mq, l, 3.4, '#b8432e');
        strokePts(mq, beak, 4.4, '#b8432e');
        strokePts(mq, twig, 3.6, '#8a5a34');
        for (const [l, c] of leaves.map((l, i) => [l, i === 1 ? '#96a868' : '#5f7a50'])) fillPts(mq, l, c);
        cherries.forEach((ch, i) => fillPts(mq, ch, i ? '#9c4a2c' : '#b8432e'));
        const md = mq.getImageData(0, 0, map.width, map.height).data;
        const fig = (p) => {
            const i = Math.floor((p[0] - figBox.x) * MR), j = Math.floor((p[1] - figBox.y) * MR);
            if (i < 0 || j < 0 || i >= map.width || j >= map.height) return null;
            const k = (j * map.width + i) * 4;
            return md[k + 3] > 127 ? [md[k], md[k + 1], md[k + 2]] : null;
        };
        const figStone = (p) => stoneNear(fig(p) ?? [236, 230, 214]);
        // the eye first, a single dark stone; then the thin things, one row each
        const eye = B(-30, -18.2);
        mark(S.ellipse(eye[0], eye[1], 1.6, 1.6, 8));
        cells.push({ q: [[eye[0] - 1.2, eye[1] - 1.1], [eye[0] + 1.1, eye[1] - 1.2], [eye[0] + 1.2, eye[1] + 1.1], [eye[0] - 1.1, eye[1] + 1.2]], c: [34, 30, 34], h: 1, p: eye, kind: 'fig' });
        row(beak, 3.4, figStone, { len: 3, kind: 'fig' });
        for (const l of legs) row(l, 2.9, figStone, { len: 3, kind: 'fig' });
        for (const l of toes) row(l, 2.6, figStone, { len: 3, kind: 'fig' });
        row(twig, 2.9, figStone, { len: 3.4, kind: 'fig' });
        // the earth under its feet: two short rows of browns and olive
        const earth = [[B(-30, 43.6), B(-12, 42.8), B(8, 43.4), B(28, 43)], [B(-18, 47.4), B(0, 47), B(17, 47.3)]].map((l) => S.curve(l, false, 6));
        row(earth[0], 3.4, () => [[138, 90, 52], [125, 128, 72], [201, 160, 74], [141, 138, 128], [87, 72, 58]][Math.floor(r() * 5)], { len: 3.8, kind: 'fig' });
        row(earth[1], 3.4, () => [[201, 160, 74], [185, 179, 164], [150, 168, 104]][Math.floor(r() * 3)], { len: 3.8, kind: 'fig' });
        // shapes filled in rings from their outline inwards
        const rings = (paint, wid, col, bbx) => {
            const D = distField(bbx, 3, paint);
            for (let lv = wid / 2; lv < 40; lv += wid) {
                const lines = isolines(D, lv).filter((l) => plen(l) > wid * 0.8);
                if (!lines.length) break;
                for (const l of lines) row(eased(l, 2, l.length > 3 && l[0] === l[l.length - 1]), wid, (pt) => col(pt, lv), { kind: 'fig' });
            }
            return D;
        };
        // the outermost ring of the bird is its drawn line: dark above, brown under the belly
        rings((q) => fillPts(q, sil, '#fff'), 2.75, (pt, lv) => (lv < 2.6 ? (pt[1] > by + 14 ? [96, 70, 50] : [48, 42, 44]) : figStone(pt)), figBox);
        for (const ch of cherries) rings((q) => fillPts(q, ch, '#fff'), 2.7, figStone, figBox);
        for (const lf of leaves) rings((q) => fillPts(q, lf, '#fff'), 2.7, figStone, figBox);
        // two rows of the ground follow the whole figure round
        const union = (q) => {
            fillPts(q, sil, '#fff');
            for (const l of [...legs, ...toes, beak, twig, ...earth]) strokePts(q, l, 3.6, '#fff');
            for (const sh of [...cherries, ...leaves]) fillPts(q, sh, '#fff');
        };
        const outD = distField(figBox, 3, (q) => {
            q.fillRect(figBox.x, figBox.y, figBox.w, figBox.h);
            cut(q, union);
        });
        const white = (p) => STONE.white[Math.floor(r() * r() * STONE.white.length)];
        for (const lv of [2.5, 7.3]) for (const l of isolines(outD, lv).filter((l) => plen(l) > 12)) row(eased(l, 2, l[0] === l[l.length - 1]), 4.7, white, { kind: 'ground' });

        // ---- the frame: a fillet, a two-strand guilloche on black, a fillet
        const darkS = () => STONE.dark[Math.floor(r() * STONE.dark.length)];
        const frame1 = (fx, fy) => {
            const h0 = MO.half, T = 4.5, zone = (MO.band - 2 * T) / 2, hc = h0 + MO.band / 2, rc = zone;
            for (const hh of [h0 + T / 2, h0 + MO.band - T / 2]) {
                row([[fx - hh - T / 2, fy - hh], [fx + hh + T / 2, fy - hh]], T, darkS, { kind: 'frame' });
                row([[fx - hh - T / 2, fy + hh], [fx + hh + T / 2, fy + hh]], T, darkS, { kind: 'frame' });
                row([[fx - hh, fy - hh + T / 2], [fx - hh, fy + hh - T / 2]], T, darkS, { kind: 'frame' });
                row([[fx + hh, fy - hh + T / 2], [fx + hh, fy + hh - T / 2]], T, darkS, { kind: 'frame' });
            }
            // the braid's middle line: a square with rounded corners, walked clockwise
            const mid = [];
            for (let k = 0; k < 4; k++) {
                const a0 = -Math.PI / 2 + (k * Math.PI) / 2, ccx = fx + [1, 1, -1, -1][k] * (hc - rc), ccy = fy + [-1, 1, 1, -1][k] * (hc - rc);
                for (let i = 0; i <= 12; i++) mid.push([ccx + Math.cos(a0 + (i / 12) * (Math.PI / 2)) * rc, ccy + Math.sin(a0 + (i / 12) * (Math.PI / 2)) * rc]);
            }
            mid.unshift([fx, fy - hc]);
            mid.push([fx, fy - hc]);
            const C = walk(mid, 0.5), total = C[C.length - 1].s, N = Math.round(total / 19.6 / 4) * 4, P = total / N, A = zone - 6 - 0.75, Ts = 4;
            const at = (s) => C[((Math.round(s / 0.5) % C.length) + C.length) % C.length];
            // the eye of every loop: one pale stone
            for (let k = 0; k < N; k++) {
                const q = at((k + 0.5) * P);
                if (!near(q.p) || occ(q.p[0], q.p[1])) continue;
                const e = [[-1.6, -1.6], [1.6, -1.6], [1.6, 1.6], [-1.6, 1.6]].map(([u, v]) => [q.p[0] + q.t[0] * u + q.n[0] * v + (r() - 0.5) * 0.4, q.p[1] + q.t[1] * u + q.n[1] * v + (r() - 0.5) * 0.4]);
                mark(S.ellipse(q.p[0], q.p[1], 2.3, 2.3, 8));
                cells.push({ q: e, c: tone(STONE.white[2]), h: 0.9, p: q.p, kind: 'frame' });
            }
            const FAM = [[[142, 58, 42], [200, 120, 90], [234, 223, 198]], [[138, 90, 52], [220, 192, 112], [243, 239, 227]]];
            for (let k = 0; k < N; k++) {
                for (const i of k % 2 ? [1, 0] : [0, 1]) {
                    const line = [];
                    for (let s = (k - 0.5) * P; s <= (k + 0.5) * P + 1e-6; s += 0.5) {
                        const q = at(s), d = (i ? -1 : 1) * A * Math.sin((Math.PI * s) / P);
                        line.push([q.p[0] + q.n[0] * d, q.p[1] + q.n[1] * d]);
                    }
                    if (!line.some(near)) continue;
                    [0, -1, 1].forEach((j) => row(offset(line, j * Ts), Ts, FAM[i][j + 1], { len: 4.3, kind: 'frame' }));
                    for (const j of [-2, 2]) row(offset(line, j * Ts), Ts, darkS, { len: 4.3, kind: 'frame' });
                }
            }
            // the black the braid lies on, in rows that go round with it
            for (let d = -zone + 2.2; d <= zone - 2; d += (zone * 2 - 4.4) / 6) row(offset(mid, d), 4.4, darkS, { kind: 'frame' });
        };
        frame1(cx, cy);
        frame1(cx + (MO.half + MO.band) * 2 + 10.4, cy);
        // ---- the ground in straight courses, each stone cut to the room there is; then
        // whatever is still bare takes a small stone
        const inBand = (p) => [cx, cx + (MO.half + MO.band) * 2 + 10.4].some((fx) => {
            const d = Math.max(Math.abs(p[0] - fx), Math.abs(p[1] - cy));
            return d > MO.half && d < MO.half + MO.band;
        });
        const ground = (pt) => (fig(pt) ? figStone(pt) : inBand(pt) ? darkS() : white(pt));
        for (let y = box.y + 3.4, j = 0; y < box.y + box.h; y += 5.2, j++) row([[box.x + (j % 2) * 2.6 - 3, y + (r() - 0.5) * 0.4], [box.x + box.w, y + (r() - 0.5) * 0.4]], 5.2, (p) => (fig(p) || inBand(p) ? null : white(p)), { kind: 'ground' });
        for (let y = box.y + 2; y < box.y + box.h; y += 3.1) {
            for (let x = box.x + 2; x < box.x + box.w; x += 3.1) {
                const p = [x + (r() - 0.5) * 0.8, y + (r() - 0.5) * 0.8], e = 1.1;
                if (!near(p) || occ(p[0], p[1]) || occ(p[0] - e, p[1] - e) || occ(p[0] + e, p[1] - e) || occ(p[0] + e, p[1] + e) || occ(p[0] - e, p[1] + e)) continue;
                const q = [[-1.3, -1.3], [1.3, -1.3], [1.3, 1.3], [-1.3, 1.3]].map(([u, v]) => [p[0] + u + (r() - 0.5) * 0.5, p[1] + v + (r() - 0.5) * 0.5]);
                mark([[p[0] - 1.6, p[1] - 1.6], [p[0] + 1.6, p[1] - 1.6], [p[0] + 1.6, p[1] + 1.6], [p[0] - 1.6, p[1] + 1.6]]);
                cells.push({ q, c: tone(ground(p)), h: 0.7 + r() * 0.2, p, kind: 'fill' });
            }
        }
        // ---- what time did: only the stones inside the break are left; near the edge and in
        // the lacunae they have gone and left their sockets; one was mended with the wrong stone
        const kept = [];
        for (const c of cells) {
            if (!inside(c.p, MO.frag)) continue;
            const de = distLine(c.p, MO.frag, true), gap = MO.gaps.some(([gx, gy, ga, gb]) => ((c.p[0] - gx) / ga) ** 2 + ((c.p[1] - gy) / gb) ** 2 < 1 + (r() - 0.5) * 0.7);
            c.lost = gap || r() < 0.55 * smooth(7, 0, de) || r() < 0.004;
            kept.push(c);
        }
        const mend = kept.filter((c) => c.kind === 'ground' && !c.lost && Math.hypot(c.p[0] - (cx + 34), c.p[1] - (cy - 40)) < 7);
        mend.slice(0, 3).forEach((c, i) => (c.c = tone(i ? [207, 122, 92] : [156, 74, 44], 0.05)));
        const loose = [[-120, 60, 0.4], [-104, 79, 1.2], [-133, 86, 2.1], [-86, 97, 0.2], [-113, 101, 2.8], [-141, 106, 1.7], [-96, 113, 0.9], [-128, 40, 2.2], [31, -112, 0.6], [124, -100, 1.1], [136, 62, 2.4], [130, 104, 0.3], [-150, 30, 1.5]].map(([x, y, a], i) => ({ p: [x, y], a, c: tone(i % 4 === 1 ? STONE.dark[0] : i === 4 ? [184, 67, 46] : i === 7 ? [220, 192, 112] : STONE.white[i % 4]), w: 3.6 + r() * 1.4, h: 3.4 + r() * 1.4 }));
        return { cells: kept, loose };
    });

    function paintMosaic(G, K) {
        const P = mosaicPlan(K.seed), box = MO.box, res = K.res, r = Motion.rng('mosaicpaint' + K.seed), sd = K.sd;
        const poly = (q, pts) => {
            q.beginPath();
            S.trace(q, pts);
        };
        // the slab: every stone's place, kept or lost, and a little bed round it
        const slab = sheet(box, res);
        slab.G.fillStyle = '#fff';
        slab.G.strokeStyle = '#fff';
        slab.G.lineJoin = 'round';
        slab.G.lineWidth = 3;
        for (const c of P.cells) {
            poly(slab.G, c.q);
            slab.G.fill();
            slab.G.stroke();
        }
        // the colours, flat: the mortar, then every stone; and the heights
        const alb = sheet(box, res), aq = alb.G;
        aq.fillStyle = '#b4a68e';
        aq.fillRect(box.x, box.y, box.w, box.h);
        const H = Field(box, res).paint(1.15, (q) => {
            for (const c of P.cells) {
                if (c.lost) continue;
                const v = Math.round(c.h * 255);
                poly(q, c.q);
                q.fillStyle = `rgb(${v},${v},${v})`;
                q.fill();
            }
        }, 'set', 0.22);
        for (const c of P.cells) {
            poly(aq, c.q);
            if (c.lost) {
                // a socket: the print of the stone in the setting bed
                aq.fillStyle = 'rgba(206,176,150,0.9)';
                aq.fill();
                aq.lineWidth = 0.5;
                aq.strokeStyle = 'rgba(120,96,84,0.7)';
                aq.stroke();
            } else {
                aq.fillStyle = `rgb(${c.c.map((v) => Math.round(clamp(v, 0, 255))).join(',')})`;
                aq.fill();
            }
        }
        const AL = aq.getImageData(0, 0, alb.canvas.width, alb.canvas.height).data, AW = alb.canvas.width, AO = H.hollows(1.1);
        const top = S.form({
            box, res, light: K.L, seed: 'mosaic' + K.seed, inflate: 'none',
            mask: (q) => q.drawImage(slab.canvas, box.x, box.y, box.w, box.h),
            height: (x, y) => H.at(x, y) + 0.07 * S.noise2(x * 1.4, y * 1.4, 101) + 0.25 * S.noise2(x * 0.03, y * 0.03, 102),
            ramp: [[0, '#000000'], [1, '#ffffff']], soft: 1,
            tint: (x, y, tone, rgb) => {
                const i = H.i(x, y), k = i * 4, hv = H.a[i];
                // stone: a grain, a vein now and then; mortar: sandy, dirtier the deeper
                const grain = 1 + 0.06 * S.noise2(x * 2.1, y * 2.1, 103) + 0.05 * S.noise2(x * 7, y * 7, 104) + 0.07 * smooth(0.55, 0.8, S.noise2(x * 0.5 + y * 0.9, y * 0.35, 105));
                const dirt = clamp(AO.a[i] * 1.5) * 0.6 + (hv < 0.3 ? 0.12 + 0.2 * S.noise2(x * 1.1, y * 1.1, 106) : 0);
                // limescale bloom over one corner, a burnt patch, a rusty stain
                const bloom = smooth(0.1, 0.6, S.noise2(x * 0.02 + 4, y * 0.02, 107) + 0.9 * Math.exp(-(((x - 98) / 34) ** 2 + ((y + 70) / 30) ** 2)) - 0.45) * 0.4 * (0.6 + 0.4 * S.noise2(x * 0.6, y * 0.6, 108));
                const burn = smooth(0.25, 0.9, Math.exp(-(((x + 96) / 26) ** 2 + ((y - 18) / 22) ** 2)) + 0.3 * S.noise2(x * 0.06, y * 0.06, 109)) * 0.5;
                const t = clamp(tone), f = 0.3 + 0.98 * t, ks = smooth(0.5, 0.12, t) * 0.6, kl = smooth(0.86, 1, t) * 0.25;
                const SH = [44, 34, 52], DR = [74, 60, 50], BL = [226, 222, 208], BN = [58, 50, 50];
                for (let c = 0; c < 3; c++) {
                    let v = AL[k + c] * grain;
                    v += (DR[c] - v) * dirt;
                    v += (BL[c] - v) * bloom;
                    v += (BN[c] - v) * burn;
                    v = Math.min(255, v * f);
                    v += (SH[c] - v) * ks;
                    v += (255 - v) * kl;
                    rgb[c] = v;
                }
            },
        });
        onto(top, res, (q) => {
            // chipped corners, a scratch across, the odd stone cracked in two
            for (const c of P.cells) {
                if (c.lost) continue;
                const h = S.hashI(Math.round(c.p[0] * 7), Math.round(c.p[1] * 7), 1, 55);
                if (h < 0.1) {
                    const a = c.q[Math.floor(h * 40)], b = lerpP(a, c.p, 0.34);
                    disc(q, lerpP(a, b, 0.4), 0.55, 'rgba(92,78,66,0.65)');
                } else if (h > 0.99) {
                    const a = lerpP(c.q[0], c.q[1], 0.3 + (h - 0.99) * 40), b = lerpP(c.q[3], c.q[2], 0.7 - (h - 0.99) * 40);
                    strokePts(q, [a, lerpP(a, b, 0.5).map((v, j) => v + (j ? 0.3 : -0.3)), b], 0.3, 'rgba(60,48,44,0.7)');
                }
            }
        });
        // the section at the break: what the floor is made of, seen where the slab faces us
        const side = sheet(box, res), TH = 13;
        const strata = [[13, '#857a6c'], [9.5, '#b98570'], [9, '#a87460'], [4.4, '#d9d0bc'], [2.4, '#c5bcaa'], [2.2, '#9c9484']];
        const tmp = sheet(box, res);
        let last = null;
        for (let d = TH; d >= 0.5; d -= 0.5) {
            const col = strata.filter(([lv]) => d <= lv).pop()[1];
            if (col !== last) {
                tmp.G.globalCompositeOperation = 'copy';
                tmp.G.drawImage(slab.canvas, box.x, box.y, box.w, box.h);
                tmp.G.globalCompositeOperation = 'source-in';
                tmp.G.fillStyle = mix(col, '#2a2030', 0.14);
                tmp.G.fillRect(box.x, box.y, box.w, box.h);
                last = col;
            }
            side.G.globalAlpha = 0.88 + 0.12 * S.hashI(Math.round(d * 2), 1, 2, 3);
            side.G.drawImage(tmp.canvas, box.x, box.y + d, box.w, box.h);
        }
        side.G.globalAlpha = 1;
        const sideSp = { canvas: side.canvas, box };
        onto(sideSp, res, (q) => {
            // crushed brick in the pink nucleus, pebbles in the rudus, the stones' own sides
            for (let i = 0; i < 900; i++) {
                const x = box.x + r() * box.w, y = 60 + r() * 62, k = r();
                if (k < 0.55) disc(q, [x, y], 0.3 + r() * 0.9, r() < 0.6 ? 'rgba(152,70,48,0.8)' : 'rgba(232,214,196,0.7)');
                else {
                    q.fillStyle = r() < 0.5 ? 'rgba(70,64,64,0.75)' : 'rgba(176,170,158,0.8)';
                    q.beginPath();
                    q.ellipse(x, y, 0.8 + r() * 1.4, 0.5 + r() * 0.8, r() * 3, 0, TAU);
                    q.fill();
                }
            }
        });
        sprayIn(sideSp, res, { color: '#2a1c30', alpha: 0.55, w: 5, dir: sd });
        sprayIn(top, res, { color: '#3a2a3c', alpha: 0.4, w: 26, dir: sd });
        sprayIn(top, res, { color: '#fffaf0', alpha: 0.22, w: 22, dir: K.tol });
        const all = sheet(box, res);
        all.G.drawImage(side.canvas, box.x, box.y, box.w, box.h);
        // the top's edge shades the section under it
        S.cast(all.G, (q) => q.drawImage(top.canvas, box.x, box.y, box.w, box.h), { blur: 1.5, dx: 0, dy: 1.6, color: 'rgba(30,20,30,0.6)' });
        all.G.drawImage(top.canvas, box.x, box.y, box.w, box.h);
        stamp(G, { canvas: all.canvas, box }, K, { lw: 2.2, heavy: 0.8 });
        // stones that came away and lie beside it
        for (const l of P.loose) {
            const q = [[-l.w / 2, -l.h / 2], [l.w / 2, -l.h / 2 + 0.3], [l.w / 2 - 0.3, l.h / 2], [-l.w / 2 + 0.2, l.h / 2 - 0.3]].map((p) => rotP(p, l.a)).map(([x, y]) => [l.p[0] + x, l.p[1] + y]);
            const side2 = q.map(([x, y]) => [x + 0.6, y + 2.2]), hex = S.rgb2hex(...l.c);
            piece(G, K, side2, { fill: mix(hex, '#3a2a30', 0.45), line: 1, heavy: 0.5, cast: { d: 1.6, blur: 2 } });
            piece(G, K, q, { fill: hex, line: 0.9, heavy: 0, shade: { color: mix(hex, '#3a2a30', 0.6), alpha: 0.6, w: 2 }, light: { color: '#ffffff', alpha: 0.4, w: 1.5 }, detail: (g) => disc(g, lerpP(q[0], q[2], 0.4), 0.35, 'rgba(60,50,46,0.4)') });
        }
    }

    // ------------------------------------------------------------------ 6 · the stele of the south-west
    // Signs in the manner of the south-western script: plain strokes in a box one unit high.
    // Plausible forms of that signary, set in an order of our own: nobody can read it anyway.
    const SIGNS = [
        [[[0.1, 1], [0.5, 0], [0.9, 1]], [[0.3, 0.56], [0.7, 0.56]]],
        [[[0.5, 0.08], [0.85, 0.32], [0.85, 0.7], [0.5, 0.95], [0.15, 0.7], [0.15, 0.32], [0.5, 0.08]]],
        [[[0.5, 0], [0.5, 1]], [[0.15, 0.36], [0.5, 0], [0.85, 0.36]]],
        [[[0.5, 0], [0.5, 1]], [[0.15, 0.34], [0.85, 0.34]], [[0.15, 0.66], [0.85, 0.66]]],
        [[[0.15, 0], [0.5, 0.5], [0.85, 0]], [[0.5, 0.5], [0.5, 1]]],
        [[[0.15, 1], [0.15, 0], [0.85, 1], [0.85, 0]]],
        [[[0.5, 1], [0.5, 0.5]], [[0.5, 0.5], [0.2, 0.25], [0.5, 0], [0.8, 0.25], [0.5, 0.5]]],
        [[[0.1, 1], [0.3, 0.1], [0.5, 0.7], [0.7, 0.1], [0.9, 1]]],
        [[[0.8, 0], [0.2, 0.5], [0.8, 1]]],
        [[[0.75, 0], [0.25, 0.5], [0.75, 1]], [[0.75, 0], [0.75, 1]]],
        [[[0.5, 0], [0.5, 1]], [[0.15, 0.1], [0.2, 0.5], [0.8, 0.5], [0.85, 0.1]]],
        [[[0.15, 0.05], [0.85, 0.95]], [[0.85, 0.05], [0.15, 0.95]]],
        [[[0.5, 0.05], [0.9, 0.95], [0.1, 0.95], [0.5, 0.05]]],
        [[[0.5, 0], [0.5, 1]]],
        [[[0.25, 0], [0.25, 1]], [[0.75, 0], [0.75, 1]], [[0.25, 0.3], [0.75, 0.3]], [[0.25, 0.7], [0.75, 0.7]]],
        [[[0.2, 1], [0.2, 0], [0.8, 0], [0.8, 0.42]]],
        [[[0.15, 0.1], [0.85, 0.9], [0.85, 0.1], [0.15, 0.9], [0.15, 0.1]]],
        [[[0.2, 0], [0.2, 1]], [[0.8, 0], [0.8, 1]], [[0.2, 0.5], [0.8, 0.5]]],
        [[[0.3, 1], [0.3, 0], [0.76, 0.22], [0.3, 0.46]]],
        [[[0.5, 0.1], [0.5, 0.9]], [[0.15, 0.5], [0.85, 0.5]]],
    ];
    function paintStele(G, K) {
        const res = K.res, sd = K.sd, r = Motion.rng('stele' + K.seed), box = { x: -86, y: -131, w: 172, h: 262 };
        // the slab: split along the cleavage, its top corner broken clean off
        const face = [[-70, -117], [-48, -122], [-12, -124], [20, -121], [47, -113], [73, -79], [77, -30], [75, 30], [78, 80], [73, 116], [40, 122], [-10, 120], [-58, 123], [-75, 110], [-78, 50], [-74, -10], [-77, -70]].map(([x, y], i) => (i === 4 || i === 5 ? [x, y] : [x + (r() - 0.5) * 3, y + (r() - 0.5) * 3]));
        const dense = face.flatMap((p, i) => {
            const q = face[(i + 1) % face.length], n = i === 4 ? 1 : 5;
            return Array.from({ length: n }, (_, k) => {
                const m = lerpP(p, q, k / n);
                return k ? [m[0] + S.noise2(i * 3.1 + k, 2, 7) * 0.9, m[1] + S.noise2(i * 3.1 + k, 6, 7) * 0.9] : m;
            });
        });
        const tv = [4.5, 6.5], ctr = [0, 0], n = face.length;
        // its thickness, where an edge looks at us: the leaves of the slate, one on another
        for (let i = 0; i < n; i++) {
            const a = face[i], b = face[(i + 1) % n], e = [b[0] - a[0], b[1] - a[1]], out = [e[1], -e[0]], m = lerpP(a, b, 0.5), sign = (m[0] - ctr[0]) * out[0] + (m[1] - ctr[1]) * out[1] > 0 ? 1 : -1;
            if ((out[0] * tv[0] + out[1] * tv[1]) * sign <= 0) continue;
            const quad = [a, b, [b[0] + tv[0], b[1] + tv[1]], [a[0] + tv[0], a[1] + tv[1]]], lit = clamp(0.5 + (0.5 * (out[0] * K.tol[0] + out[1] * K.tol[1]) * sign) / (Math.hypot(e[0], e[1]) || 1));
            piece(G, K, quad, {
                fill: mix('#343a4e', '#6a7286', lit), line: 1.8, heavy: 0.7, cast: null,
                detail: (q) => {
                    for (let k = 1; k < 7; k++) {
                        const u = k / 7 + (r() - 0.5) * 0.08, p0 = lerpP(a, quad[3], u), p1 = lerpP(b, quad[2], u), c0 = r(), c1 = c0 + 0.2 + r() * 0.8;
                        strokePts(q, [lerpP(p0, p1, c0), lerpP(p0, p1, Math.min(1, c1))], 0.45, k % 2 ? 'rgba(20,24,40,0.7)' : 'rgba(170,178,196,0.5)');
                    }
                    S.spray(q, quad, { color: '#1c2036', alpha: 0.5, w: 4, dir: sd });
                },
            });
        }
        // what is cut into it: the band of text between two scored lines, round the edge and
        // turning inward at the foot; and inside it the warrior with his shield, sword and mirror
        const path = S.curve([[58, 106], [61, 60], [62, 0], [61, -60], [58, -96], [44, -108.5], [10, -111], [-30, -110.5], [-52, -105], [-62.5, -90], [-64, -30], [-64, 40], [-62, 88], [-52, 105], [-30, 108.5], [8, 108], [28, 105], [38, 94], [40, 70], [40, 34]], false, 10), st = walk(path, 0.5);
        const cuts = [st.map((q) => [q.p[0] + q.n[0] * 6.6, q.p[1] + q.n[1] * 6.6]), st.map((q) => [q.p[0] - q.n[0] * 6.6, q.p[1] - q.n[1] * 6.6])].map((l) => l.map(([x, y], i) => [x + S.noise2(i * 0.02, 1, 8) * 0.8, y + S.noise2(i * 0.02, 5, 8) * 0.8]));
        const signs = [];
        for (let sA = 7, k = 0; sA < st[st.length - 1].s - 5; k++) {
            const sg = SIGNS[Math.floor(r() * SIGNS.length)], h = 8.6 + r() * 1.8, w = h * (0.62 + r() * 0.2), q = st[Math.round((sA + w / 2) / 0.5)], tilt = (r() - 0.5) * 0.22, c = Math.cos(tilt), sn = Math.sin(tilt);
            for (const stroke of sg) signs.push(stroke.map(([x, y]) => {
                const u = (x - 0.5) * w, v = (0.5 - y) * h + (r() - 0.5) * 0.3, uu = u * c - v * sn, vv = u * sn + v * c;
                return [q.p[0] + q.t[0] * uu + q.n[0] * vv, q.p[1] + q.t[1] * uu + q.n[1] * vv];
            }));
            sA += w + 1.6 + r() * 1.6 + (r() < 0.1 ? 4 : 0);
        }
        const circle = (x, y, rr, a0 = 0, a1 = TAU) => Array.from({ length: 25 }, (_, i) => [x + Math.cos(a0 + ((a1 - a0) * i) / 24) * rr * (1 + (r() - 0.5) * 0.04), y + Math.sin(a0 + ((a1 - a0) * i) / 24) * rr]);
        const man = [
            circle(-6, -44, 4.6), [[-6, -39], [-6.6, -20], [-6, -3]], [[-25, -24], [-6.4, -31], [12, -25]],
            [[-25, -24], [-29, -27.5]], [[-25, -24], [-29.6, -24]], [[-25, -24], [-28.6, -20.4]], [[12, -25], [16, -28.6]], [[12, -25], [16.6, -25]], [[12, -25], [15.6, -21.4]],
            [[-6, -3], [-15, 25], [-19.6, 26]], [[-6, -3], [3, 25], [7.6, 26]],
            // the sword at his side: blade, guard, pommel
            [[18.4, -8], [20.4, 16], [23, 36], [23.8, 16], [22.2, -8.6]], [[15.4, -7.2], [25.4, -9.2]], [[20, -8.4], [19.4, -15]], [[16.8, -14.4], [19.4, -16.2], [22.2, -15.2]],
            // the round shield with its rings and the notch cut into them
            ...[15, 10, 5.2].map((rr, i) => (i < 2 ? [...circle(-34, 12, rr, 0.32, TAU - 0.32), [-34 + rr * 0.5, 12], [-34 + Math.cos(0.32) * rr, 12 + Math.sin(0.32) * rr]] : circle(-34, 12, rr))), circle(-34, 12, 1.2),
            // the mirror: a disc on a handle
            circle(27, 55, 7.4), circle(27, 55, 5.4), [[27, 62.4], [27.3, 76]], [[23.8, 76], [30.8, 76.6]],
            // a spear over his head, its leaf-shaped point to the right
            [[-46, -61], [-10, -63.4], [24, -65]], [[24, -65], [31, -67.6], [38.5, -65.8], [31.4, -63], [24, -65]],
            // a comb
            [[-40, -48], [-28, -49]], ...[0, 1, 2, 3, 4].map((i) => [[-39 + i * 2.6, -48], [-39.4 + i * 2.6, -41.5]]),
        ];
        const flakes = [[[36, -98], [47, -103], [58, -96], [66, -84], [64, -70], [56, -66], [50, -74], [41, -78], [33, -88]], [[-72, 60], [-60, 55], [-51, 59], [-47, 70], [-53, 80], [-63, 85], [-73, 79]], [[6, 88], [16, 83], [26, 86], [29, 93], [20, 99], [10, 97]], [[-30, -20], [-22, -24], [-16, -18], [-21, -11], [-29, -13]]].map((f, k) => S.curve(f, true, 3).map(([x, y], i) => [x + S.noise2(i * 0.9, 3 + k, 9) * 1.6, y + S.noise2(i * 0.9, 8 + k, 9) * 1.6]));
        const cutF = Field(box, res).paint(1, (q) => {
            for (const l of cuts) strokePts(q, l, 0.9, '#fff');
            for (const l of signs) strokePts(q, l, 1.15, '#fff');
            for (const l of man) strokePts(q, l, 1.35, '#fff');
            // two furrows a plough left across it
            strokePts(q, [[-80, 28], [-20, 8], [84, -18]], 1.1, '#b0b0b0');
            strokePts(q, [[-80, 40], [30, 14]], 0.8, '#909090');
            // where a flake has gone the cutting went with it
            for (const f of flakes) fillPts(q, f, '#000');
        }, 'set', 0.14);
        const flakeF = Field(box, res).paint(1, (q) => {
            for (const f of flakes) fillPts(q, f, '#fff');
        }, 'set', 0.16);
        const sp = S.form({
            box, res, light: K.L, seed: 'stele' + K.seed, inflate: 'bevel', R: 2.6, relief: 0.6, smooth: 0.002,
            mask: (q) => fillPts(q, dense, '#fff'),
            height: (x, y) => -1.05 * cutF.at(x, y) - 0.55 * flakeF.at(x, y) * (0.8 + 0.4 * fbm(x * 0.3, y * 0.3, 118)) + 0.1 * smooth(0.1, 0.6, S.noise2(x * 0.035, y * 0.5 + x * 0.11, 111)) + 0.9 * fbm(x * 0.022, y * 0.022, 112) + 0.12 * fbm(x * 0.4, y * 0.4, 113),
            ramp: [[0, '#000000'], [1, '#ffffff']], soft: 1,
            tint: (x, y, tone, rgb, m) => {
                const n1 = fbm(x * 0.025, y * 0.025, 114), n2 = fbm(x * 0.12, y * 0.12, 115), lam = S.noise2(x * 0.2 + y * 0.9, y * 0.06, 116), ct = cutF.at(x, y), fl = flakeF.at(x, y);
                const rust = smooth(0.12, 0.5, fbm(x * 0.04 + 7, y * 0.04, 117)) * 0.5, t = clamp(tone), f = 0.3 + 1.0 * t, ks = smooth(0.5, 0.1, t) * 0.7, kl = smooth(0.85, 1, t) * 0.3;
                const base = [92 + 26 * n1 + 10 * n2 + 8 * lam, 100 + 24 * n1 + 10 * n2 + 8 * lam, 118 + 22 * n1 + 9 * n2 + 7 * lam], RU = [146, 110, 80], FR = [70, 80, 104], CU = [188, 192, 198], SH = [22, 24, 44];
                for (let c = 0; c < 3; c++) {
                    let v = base[c] + (RU[c] - base[c]) * rust;
                    v += (FR[c] - v) * fl * 0.4;
                    v += (CU[c] - v) * ct * 0.75;
                    v = Math.min(255, v * f);
                    v += (SH[c] - v) * ks;
                    v += (255 - v) * kl;
                    rgb[c] = v;
                }
                const kn = smooth(0.3, 0.06, tone) * smooth(0.06, 0.005, m) * 0.4;
                rgb[2] += (140 - rgb[2]) * kn;
            },
        });
        onto(sp, res, (q) => {
            // the steps where flakes have lifted: a sharp edge in shade on the lamp's side
            for (const fk of flakes) {
                for (let i = 0; i < fk.length; i++) {
                    const a = fk[i], b = fk[(i + 1) % fk.length], f = (-(b[1] - a[1]) * sd[0] + (b[0] - a[0]) * sd[1]) / (Math.hypot(b[0] - a[0], b[1] - a[1]) || 1);
                    strokePts(q, [a, b], 0.55, f > 0 ? `rgba(14,16,34,${(0.7 * f).toFixed(2)})` : `rgba(214,222,236,${(-0.5 * f).toFixed(2)})`);
                }
            }
            // cleavage lines across the face
            for (let i = 0; i < 38; i++) {
                const x = -80 + r() * 160, y = -125 + r() * 250, l = 8 + r() * 30;
                S.ink(q, [[x, y], [x + l * 0.5, y - l * 0.1 + (r() - 0.5) * 1.5], [x + l, y - l * 0.2]], { w: 0.4, color: r() < 0.6 ? '#1c2036' : '#dfe6f2', alpha: 0.28 });
            }
            // lichen: rosettes that grow outward in rings, orange and grey-green, with their fruits
            for (const [x, y, rr, kind] of [[-52, -86, 8, 0], [-41, -73, 4.6, 1], [-58, -74, 2.2, 0], [50, 62, 9, 1], [60, 46, 4.2, 0], [41, 72, 2.4, 0], [-10, 90, 5.4, 0], [-18, 97, 2, 1], [-60, 20, 5, 1], [34, -40, 3.6, 0], [10, -92, 4, 1], [-28, 62, 3, 0], [66, -16, 3.2, 1], [0, -70, 1.8, 0], [-48, 100, 2.6, 1], [22, 40, 1.8, 1]]) {
                const col = kind ? ['#98a68a', '#5f6e5c', '#d5dcc2'] : ['#cf8f30', '#8a4f16', '#f0cc7a'], ph = r() * 9;
                const lobe = S.curve(Array.from({ length: 13 }, (_, i) => pol(rr * (0.86 + 0.16 * Math.sin(i * 2.3 + ph) + 0.1 * r()), (i / 13) * TAU, x, y * 1 + 0)), true, 5);
                piece(q, K, lobe, {
                    fill: col[0], line: 0.5, heavy: 0.3, ink: col[1], cast: null,
                    shade: { color: col[1], alpha: 0.7, w: rr * 0.5 }, light: { color: col[2], alpha: 0.6, w: rr * 0.4 },
                    detail: (g) => {
                        for (const k of [0.72, 0.46]) strokePts(g, lobe.map(([px, py]) => [x + (px - x) * k, y + (py - y) * k]), 0.4, rgba(col[1], 0.6), true);
                        blobOn(g, [x, y], rr * 0.4, '#6e7684', 0.7);
                        for (let i = 0; i < rr * 1.6; i++) {
                            const p = pol(rr * (0.25 + r() * 0.55), r() * TAU, x, y);
                            disc(g, p, 0.45, col[1]);
                            disc(g, [p[0] - sd[0] * 0.15, p[1] - sd[1] * 0.15], 0.22, col[2]);
                        }
                    },
                });
            }
        });
        sprayIn(sp, res, { color: '#1c2038', alpha: 0.7, w: 36, dir: sd });
        sprayIn(sp, res, { color: '#12142a', alpha: 0.5, w: 7, dir: sd });
        sprayIn(sp, res, { color: '#f0f4ff', alpha: 0.36, w: 22, dir: K.tol });
        sprayIn(sp, res, { color: '#7a86a8', alpha: 0.7, w: 1.5, push: 0.5, dir: sd });
        stamp(G, sp, K, { lw: 2.2, heavy: 0.5 });
    }

    return {
        carambolo: relic('carambolo', { x: -118, y: -98, w: 236, h: 196 }, paintCarambolo),
        murex: relic('murex', { x: -88, y: -78, w: 176, h: 156 }, paintMurex),
        helmet: relic('helmet', HM.box, paintHelmet),
        amphora: relic('amphora', { x: -132, y: -152, w: 264, h: 304 }, paintAmphora),
        mosaic: relic('mosaic', MO.box, paintMosaic),
        stele: relic('stele', { x: -86, y: -131, w: 172, h: 262 }, paintStele),
        stele: relic('stele', { x: -86, y: -131, w: 172, h: 262 }, paintStele),
        _debug: (g) => {
            const P = mosaicPlan('mosaic'), col = { fig: '#e05050', ground: '#50a0e0', frame: '#60c060', row: '#c0c0c0', fill: '#e0e040' };
            for (const c of P.cells) {
                fillPts(g, c.q, col[c.kind] ?? '#fff');
                if (c.lost) fillPts(g, c.q, 'rgba(0,0,0,0.6)');
            }
        },
    };
})();
