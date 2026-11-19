// Objects of devotion of the three faiths that shared Andalusia, in the emblem manner (dark
// contour + airbrush), painted as a museum would show them: things, never caricature. No
// faces, and no sacred text written out: where the real object carries an inscription, its
// place is taken by fine rhythmic strokes that have the pace of script and say nothing.
// Global: Devotion. Sizes at s = 1, the anchor in the middle of each box:
//   Devotion.cirio(g, { x, y, s, rot, seed })       90 × 420   a processional wax candle, lit
//   Devotion.incensario(g, { x, y, s, rot, seed })  170 × 330  a silver thurible on its chains
//   Devotion.rosario(g, { x, y, s, rot, seed })     220 × 280  a rosary of jet beads, laid down
//   Devotion.lampara(g, { x, y, s, rot, seed })     230 × 250  a brass Hanukkah lamp, Sefarad
//   Devotion.jamsa(g, { x, y, s, rot, seed })       140 × 200  a silver hand amulet, al-Andalus
//   Devotion.mihrab(g, { x, y, s, rot, seed })      220 × 300  a plaque with a prayer niche
// `rot` turns the object, never the light: every point goes through a frame, and the lit
// volumes (`Souvenir.form`) are baked with `Souvenir.lightFor` and cached by angle and
// resolution. Each object is painted on a sheet of its own and laid on the caller's layer
// with its shadow, so its holes are real (the layer shows through them) and its inner
// shadows fall on nothing else. Flames, their glow and the smoke are laid last, as light and
// air: they cast nothing. Paint them once on a layer: nothing here takes the time.
//
// What each thing is, and the small true details painted on it
//
// CIRIO (Holy Week in Seville: the long candle a nazareno carries, or one of a paso's
// candelería). A hand-dipped shaft of cream wax, a little bowed and wider at the foot; a well
// at the top with a rim that has given way on the draught's side; a wick; a flame; the foot
// in a turned brass socket. 1 the rim's back wall glows, the wax is translucent for a hand's
// width under the flame · 2 a pool of melted wax with the flame's reflection and bits of
// charred wick · 3 runs down the leeward side, each a rounded cord that fans out of the
// breach, swells where it paused and ends in a drop · 4 older runs under newer ones, one
// that reached two thirds of the way down, single beads that broke off · 5 the wick black,
// curled over towards the lean, a red ember at its tip · 6 the flame: a blue cup, a dark
// cone over the wick, a pale core, an orange tongue leaning with the draught, a hair of soot
// off its tip · 7 a chandler's oval seal pressed into the wax near the foot and two worn
// gilt lines under it · 8 scuffs, a nick, a hairline crack, dipping lines · 9 the socket:
// a beaded lip, an engraved cup, a gadrooned knop, a spreading foot with turned lines, dull
// in the grooves and rubbed bright on the high points · 10 wax that ran over the lip, down
// the cup, and set in a puddle on the foot; spatters beside it.
//
// INCENSARIO (a silver thurible of the Spanish baroque type). A bowl (casca) on a foot, a
// pierced lid (cuerpo de humos) that slides up three chains, a fourth chain that lifts it,
// a domed plate at the top where the chains gather, the ring it hangs by. 1 three hold
// chains, each ending in a jump ring on a lug of the bowl's rim, passing through a guide
// ring on the lid's rim (the third runs behind) · 2 the fourth chain goes through the plate
// and ends in its own smaller ring; with the lid down it hangs slack · 3 links alternately
// seen flat and on edge, none quite like its neighbour, one mended with brass wire · 4 the
// bowl in repoussé gadroons under a plain lip with a line of beading and a row of punches
// · 5 the lid: two tiers of flame-shaped piercings, a drum with arched windows (the
// lantern), a little cupola, a ball and a loop · 6 charcoal glowing through the lower
// piercings, darkness in the lantern · 7 tarnish blue-black in every recess, the high
// points rubbed bright, a dent in the bowl · 8 soot round the upper piercings · 9 a turned
// foot with a beaded ring, two assay punches on the lip · 10 smoke: one ribbon out of the
// lantern that leans, folds over and breaks into wisps among the chains.
//
// ROSARIO (jet, azabache, the black stone of Santiago's pilgrims; silver mounts). A loop of
// five decades, four Paternoster beads between them, a centre piece joining the loop to the
// pendant (one large bead, three small, one large) and the cross. 1 fifty faceted beads,
// every one turned differently on its wire, a little unequal · 2 each bead: a ring of cut
// facets round a table, one flashing white, one reflecting the ground · 3 a bead chipped
// (jet breaks like glass, in a shell), one replaced by a slightly larger one · 4 between
// beads the eyes of the wire, two tiny rings hooked into each other · 5 Paternosters of
// silver filigree: an open ball of wire scrolls with a line of granules, a cap at each
// pole · 6 slack: the string kinks where it was put down, two beads touch, a stretch lies
// straight · 7 the centre: a filigree heart of scrolls round a boss, with three rings, no
// figure · 8 the cross with trefoil ends (botonada): a raised border, an engraved line,
// a rosette at the crossing, rays in the angles · 9 its suspension loop and jump ring, the
// silver worn pale on the arms' edges and black in the lines · 10 a maker's punch on the
// back arm, pin pricks of light on every third bead.
//
// LAMPARA (a Hanukkah lamp of the medieval Spanish type, 13th–14th century: cast bronze or
// brass, made to hang on a wall). A flat back plate with a gable, pierced as an arcade of
// horseshoe arches under a rose window, a row of eight small oil pans along its foot, the
// servant light apart. 1 the hanging loop cast in one with the gable's apex · 2 the rose:
// a ring of pierced petals round a six-lobed eye · 3 seven horseshoe arches on colonnettes
// with their capitals and bases, every opening a real hole · 4 a narrow band between rose
// and arcade where the real lamps carry a verse: chiselled strokes only · 5 ring-and-dot
// punches along the borders, a chased double line following the gable · 6 eight pans in a
// row, each a scoop with a pinched spout, no two cast alike · 7 the servant light on a
// bracket at the right shoulder · 8 file marks across the plate, casting pits, a crack
// mended with a riveted strip · 9 verdigris in the corners of the openings and behind the
// pans; soot licking up the plate above every spout · 10 wicks of twisted cotton lying in
// the spouts, burnt at the tip; oil standing in the pans; one wick lit, a small flame.
//
// JAMSA (a hand amulet, silver, in the manner of Nasrid jewellery: filigree, granulation,
// cloisonné enamel). The hand of the amulet is an ornament, not anatomy: three straight
// fingers between two thumbs that curl outwards, the same on both sides. 1 a border of
// twisted wire round the whole outline, a plain wire inside it · 2 the field filled with
// scrolls of flattened wire, in facing pairs · 3 granulation: lines of grains down the
// fingers, triangles of three in the gaps, a ring of grains round the stone · 4 an
// eight-pointed star cut clean through the palm, with a wire collar · 5 a blue cabochon in
// a toothed collet: a window of light, a glow at its far side, a bubble · 6 cells of enamel
// at the fingertips and the wrist (green, blue, white, a point of red), one cell empty
// · 7 a ribbed barrel loop, a jump ring, a short chain · 8 solder shining at the joins,
// tarnish in the ground between the wires, the wires' backs rubbed bright · 9 a small dent
// in the thumb, one grain missing from a row · 10 three tiny drops hanging from the
// fingertips on rings.
//
// MIHRAB (a small ivory plaque showing a prayer niche, after the mihrab of Cordoba). A
// horseshoe arch on two columns, in its rectangular frame (alfiz). 1 voussoirs alternately
// red and white, the white ones carved with leaves · 2 spandrels of ataurique: split
// palmettes on spiralling stems · 3 two bosses in the spandrels · 4 a frame band where the
// real one carries an inscription: script-like strokes only · 5 capitals with two tiers of
// leaves, columns of veined marble, bases · 6 inside the arch only darkness and a hanging
// lamp on three chains · 7 the lamp's glass glowing, light catching the arch's inner edge
// · 8 a plinth of small blind arches · 9 the ivory's grain, age cracks, a warm stain,
// traces of gilding and paint in the hollows · 10 four pin holes at the corners.
const Devotion = (() => {
    const S = Souvenir;
    const INK = S.INK, SD = S.SHADE_DIR, TOL = [-SD[0], -SD[1]], TAU = Math.PI * 2;
    const clamp = S.clamp, smooth = S.smooth;
    const cache = new Map();
    const memo = (key, fn) => {
        if (!cache.has(key)) cache.set(key, fn());
        return cache.get(key);
    };
    const STEP = Math.PI / 24;
    const snap = (a) => Math.round(a / STEP) * STEP;
    // pixels per unit for a sprite: one and a half times the output's, in half steps
    const resOf = (g, k = 1) => Math.min(6, Math.max(2, Math.ceil(S.pxScale(g) * k * 3 - 1e-6) / 2));
    const rotP = (p, a) => {
        const c = Math.cos(a), s = Math.sin(a);
        return [p[0] * c - p[1] * s, p[0] * s + p[1] * c];
    };
    const pol = (r, a, cx = 0, cy = 0) => [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
    const dot2 = (a, b) => a[0] * b[0] + a[1] * b[1];
    const lerpP = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
    // a direction on the page, as a sprite that will be pasted turned by `rot` sees it
    const local = (v, rot) => rotP(v, -rot);
    // the half-way direction between the light and the eye: where a clean highlight sits
    const halfway = (L) => {
        const l = Math.hypot(L[0], L[1], L[2]), h = [L[0] / l, L[1] / l, L[2] / l + 1], hl = Math.hypot(h[0], h[1], h[2]);
        return [h[0] / hl, h[1] / hl, h[2] / hl];
    };

    // A frame maps a part's own coordinates to the sheet's: every point goes through it, the
    // context is never rotated (the light must not turn with the object).
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
        f.dir = (v) => rotP(v, rot);
        return f;
    }

    // the same place as `F(p)`, but upright on the page: flames and smoke rise straight up
    // whatever way the thing they come from is turned
    const upright = (F, p) => {
        const o = F(p);
        return frame(o[0] - p[0], o[1] - p[1], 0, 1);
    };

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
    const poly = (g, pts) => {
        g.beginPath();
        S.trace(g, pts);
        g.fill();
    };
    const cut = (g, fn) => {
        g.save();
        g.globalCompositeOperation = 'destination-out';
        g.fillStyle = '#000';
        g.strokeStyle = '#000';
        fn(g);
        g.restore();
    };
    const even = (b) => {
        const x = Math.floor(b.x / 2) * 2, y = Math.floor(b.y / 2) * 2;
        return { x, y, w: Math.ceil((b.x + b.w - x) / 2) * 2, h: Math.ceil((b.y + b.h - y) / 2) * 2 };
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
    // the longest unbroken stretch of a closed outline whose points pass `test`
    const arcOf = (pts, test) => {
        const n = pts.length, ok = pts.map(test), i0 = ok.indexOf(false);
        if (i0 < 0) return pts.slice();
        let best = [], cur = [];
        for (let k = 1; k <= n; k++) {
            const i = (i0 + k) % n;
            if (ok[i]) cur.push(pts[i]);
            else {
                if (cur.length > best.length) best = cur;
                cur = [];
            }
        }
        return best;
    };
    // a right-hand profile [[x, y], …] from top to bottom, mirrored into a closed outline
    const sym2 = (right) => [...right, ...right.slice().reverse().filter((p) => p[0] > 1e-6).map(([x, y]) => [-x, y])];
    const star8 = (cx, cy, R, ratio = 0.6, rot = 0) => {
        const pts = [];
        for (let i = 0; i < 16; i++) pts.push(pol(i % 2 ? R * ratio : R, rot + (i / 16) * TAU, cx, cy));
        return pts;
    };

    // A scalar field painted with the canvas (strokes, blobs, blur) and read back per pixel:
    // wires, grains and grooves are easier to draw than to write as a formula. (x, y) → 0..1.
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
    // A glaze over a finished sprite: `paint(q)` in its units, kept to its silhouette, laid
    // with a blend mode (multiply to warm or soil, screen to light from inside).
    function glaze(sp, res, mode, paint) {
        const c = document.createElement('canvas');
        c.width = sp.canvas.width;
        c.height = sp.canvas.height;
        const q = c.getContext('2d');
        q.setTransform(res, 0, 0, res, -sp.box.x * res, -sp.box.y * res);
        paint(q);
        q.setTransform(1, 0, 0, 1, 0, 0);
        q.globalCompositeOperation = 'destination-in';
        q.drawImage(sp.canvas, 0, 0);
        const g = sp.canvas.getContext('2d');
        g.save();
        g.setTransform(1, 0, 0, 1, 0, 0);
        g.globalCompositeOperation = mode;
        g.drawImage(c, 0, 0);
        g.restore();
    }
    // Lays a sprite on the sheet the emblem way, turned by the frame: its shadow on what is
    // already there, its silhouette in ink a line's width bigger (heavier towards the shade,
    // on the page), then itself.
    function stamp(q, F, sp, { lw = 2.2, heavy = 0.75, cast = null, ink = INK } = {}) {
        const b = sp.box, at = F([0, 0]);
        if (!sp.sil) {
            sp.sil = document.createElement('canvas');
            sp.sil.width = sp.canvas.width;
            sp.sil.height = sp.canvas.height;
            const c = sp.sil.getContext('2d');
            c.drawImage(sp.canvas, 0, 0);
            c.globalCompositeOperation = 'source-in';
            c.fillStyle = '#000';
            c.fillRect(0, 0, sp.sil.width, sp.sil.height);
        }
        let sil = sp.sil;
        if (ink !== '#000') {
            sil = document.createElement('canvas');
            sil.width = sp.sil.width;
            sil.height = sp.sil.height;
            const c = sil.getContext('2d');
            c.drawImage(sp.sil, 0, 0);
            c.globalCompositeOperation = 'source-in';
            c.fillStyle = ink;
            c.fillRect(0, 0, sil.width, sil.height);
        }
        const place = (c, ox, oy) => {
            c.save();
            c.translate(at[0] + ox, at[1] + oy);
            c.rotate(F.rot);
            c.scale(F.s, F.s);
            c.drawImage(sil, b.x, b.y, b.w, b.h);
            c.restore();
        };
        if (cast) S.cast(q, (c) => place(c, 0, 0), cast);
        if (lw > 0) {
            const d = lw * 0.8;
            for (const k of [0, 0.5, 1]) for (let i = 0; i < 16; i++) place(q, SD[0] * lw * heavy * k + Math.cos(i * 0.3927) * d, SD[1] * lw * heavy * k + Math.sin(i * 0.3927) * d);
        }
        S.put(q, sp, { x: at[0], y: at[1], rot: F.rot, s: F.s });
    }

    // Paints one object on a sheet of its own, in the page's orientation, and lays it on the
    // layer with its shadow. `paint(q, F)` may return `air(g)`: what is painted afterwards
    // straight on the layer and casts nothing (a flame, its glow, smoke).
    function sheet(g, o, box, paint) {
        const { x = 0, y = 0, s = 1, rot = 0 } = o;
        const F = frame(0, 0, rot, 1);
        const B = S.bbox(F.pts([[box.x, box.y], [box.x + box.w, box.y], [box.x + box.w, box.y + box.h], [box.x, box.y + box.h]]), 6);
        const m = g.getTransform();
        const c = document.createElement('canvas'), q = c.getContext('2d');
        const drop = 'rgba(14,9,30,0.55)';
        let air = null;
        if (Math.abs(m.b) < 1e-6 && Math.abs(m.c) < 1e-6 && m.a > 0 && m.d > 0) {
            const X0 = Math.floor(m.a * (x + B.x * s) + m.e), Y0 = Math.floor(m.d * (y + B.y * s) + m.f);
            c.width = Math.max(2, Math.min(8192, Math.ceil(m.a * B.w * s) + 2));
            c.height = Math.max(2, Math.min(8192, Math.ceil(m.d * B.h * s) + 2));
            q.setTransform(m.a * s, 0, 0, m.d * s, m.a * x + m.e - X0, m.d * y + m.f - Y0);
            air = paint(q, F);
            g.save();
            g.setTransform(1, 0, 0, 1, 0, 0);
            const k = m.a * s;
            S.cast(g, (h) => h.drawImage(c, X0, Y0), { blur: 7 * k, dx: 3.5 * k, dy: 5.5 * k, color: drop });
            g.drawImage(c, X0, Y0);
            g.restore();
        } else {
            const res = Math.min(8, Math.max(0.25, Math.hypot(m.a, m.b) * s));
            c.width = Math.ceil(B.w * res);
            c.height = Math.ceil(B.h * res);
            q.setTransform(res, 0, 0, res, -B.x * res, -B.y * res);
            air = paint(q, F);
            g.save();
            g.translate(x, y);
            g.scale(s, s);
            S.cast(g, (h) => h.drawImage(c, B.x, B.y, B.w, B.h), { blur: 7, dx: 3.5, dy: 5.5, color: drop });
            g.drawImage(c, B.x, B.y, B.w, B.h);
            g.restore();
        }
        if (air) {
            g.save();
            g.translate(x, y);
            g.scale(s, s);
            air(g);
            g.restore();
        }
    }

    // ------------------------------------------------------------------ metals and wax
    const SILVER = [[0, '#0e1026'], [0.2, '#23274a'], [0.42, '#4d5279'], [0.6, '#8b8cae'], [0.78, '#c2c5da'], [0.92, '#e8eaf4'], [1, '#fbfcff']];
    const BRASS = [[0, '#1c1024'], [0.15, '#38223c'], [0.36, '#5b3a20'], [0.54, '#94641d'], [0.7, '#cf9a3a'], [0.86, '#f1d27c'], [1, '#fff4cc']];
    const WAX = [[0, '#5f5068'], [0.2, '#8f7c80'], [0.42, '#c7b08c'], [0.62, '#e6d4aa'], [0.82, '#f4ead0'], [1, '#fffcf0']];
    const Ag = { base: '#b9bcd2', deep: '#2a2d52', light: '#eceef6', glint: '#fdfdff', mid: '#8f8db0' };
    const Au = { base: '#d0a040', deep: '#6a3f16', light: '#f6dc8a', glint: '#fff6cf', mid: '#a8742f' };

    // A bead: a grain of silver, a pellet of gold, a set stone. Small, so its contour is thin.
    function bead(g, p, r, C, lw = 0.7) {
        if (lw > 0) disc(g, [p[0] + SD[0] * lw * 0.7, p[1] + SD[1] * lw * 0.7], r + lw, INK);
        const gr = g.createRadialGradient(p[0] + TOL[0] * r * 0.4, p[1] + TOL[1] * r * 0.4, r * 0.08, p[0], p[1], r * 1.08);
        gr.addColorStop(0, C.light);
        gr.addColorStop(0.5, C.base);
        gr.addColorStop(1, C.deep);
        disc(g, p, r, gr);
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

    // A round wire bent into a ring, seen flat (rx = ry) or tilted: ink, metal, the dark of
    // its far side and the light along the stretch that faces the lamp.
    function ring(g, c, rx, ry, rot, w, C, lw = 0.8) {
        const pts = S.ellipse(c[0], c[1], rx, ry, 28, rot);
        g.save();
        g.translate(SD[0] * lw * 0.6, SD[1] * lw * 0.6);
        strokePts(g, pts, w + lw * 2, INK, true);
        g.restore();
        strokePts(g, pts, w + lw * 2, INK, true);
        strokePts(g, pts, w, C.base, true);
        const seg = (sgn, col, ww, alpha, sp) => {
            const out = [];
            for (let i = 0; i < pts.length; i++) {
                const a = pts[(i + pts.length - 1) % pts.length], b = pts[(i + 1) % pts.length];
                const n = [b[1] - a[1], -(b[0] - a[0])], l = Math.hypot(n[0], n[1]) || 1;
                // the wire is round: its light sits a little to the lamp's side of its crown
                if (sgn * dot2([n[0] / l, n[1] / l], TOL) > sp) out.push([pts[i][0] + TOL[0] * w * 0.16 * sgn, pts[i][1] + TOL[1] * w * 0.16 * sgn]);
                else if (out.length > 1) {
                    S.ink(g, out.splice(0), { w: ww, color: col, alpha, taper: [0.8, 0.8] });
                } else out.length = 0;
            }
            if (out.length > 1) S.ink(g, out, { w: ww, color: col, alpha, taper: [0.8, 0.8] });
        };
        seg(-1, C.deep, w * 0.7, 0.75, 0.15);
        seg(1, C.glint, w * 0.5, 0.95, 0.45);
    }

    // A chain, link by link, along a path: oval links alternately seen flat and on edge. No
    // two alike: each turns a little on its neighbours.
    function chain(g, path, o = {}) {
        const len = o.len ?? 7, w = o.w ?? 1.2, C = o.col ?? Ag, lw = o.line ?? 0.6;
        const st = walk(path, 0.25);
        if (st.length < 3) return;
        const total = st[st.length - 1].s, n = Math.max(1, Math.round(total / (len * 0.8)));
        const at = (s) => st[Math.max(0, Math.min(st.length - 1, Math.round(s / 0.25)))];
        if (o.cast) S.cast(g, (q) => strokePts(q, st.map((m) => m.p), len * 0.5, '#000'), o.cast);
        for (let pass = 0; pass < 2; pass++) {
            const rr = Motion.rng('chain' + (o.seed ?? 0));
            for (let i = 0; i < n; i++) {
                const m = at(((i + 0.5) / n) * total), a = Math.atan2(m.t[1], m.t[0]) + (rr() - 0.5) * 0.36, jit = (rr() - 0.5) * 0.14;
                const flat = (i + (o.phase ?? 0)) % 2 === 0, Ci = o.mend === i ? Au : C;
                // links on edge go first, the flat ones lie over their ends
                if (flat !== (pass === 1)) continue;
                // every link reaches a little way into its neighbours
                const hl = (total / n) * 0.64;
                if (flat) ring(g, m.p, hl, len * (0.3 + jit), a, w, Ci, lw);
                else {
                    const p0 = [m.p[0] - Math.cos(a) * hl, m.p[1] - Math.sin(a) * hl], p1 = [m.p[0] + Math.cos(a) * hl, m.p[1] + Math.sin(a) * hl];
                    g.save();
                    g.translate(SD[0] * lw * 0.6, SD[1] * lw * 0.6);
                    strokePts(g, [p0, p1], w * 1.15 + lw * 2, INK);
                    g.restore();
                    strokePts(g, [p0, p1], w * 1.15 + lw * 2, INK);
                    strokePts(g, [p0, p1], w * 1.15, Ci.mid);
                    // a round bar: shade along one flank, a light along the other
                    const nn = [-Math.sin(a), Math.cos(a)], sg = dot2(nn, TOL) >= 0 ? 1 : -1, k = Math.abs(dot2(nn, TOL));
                    const off = (p, d) => [p[0] + nn[0] * d * sg, p[1] + nn[1] * d * sg];
                    strokePts(g, [off(lerpP(p0, p1, 0.1), -w * 0.3), off(lerpP(p0, p1, 0.9), -w * 0.3)], w * 0.45, S.rgba(Ci.deep, 0.8));
                    S.ink(g, [off(lerpP(p0, p1, 0.12), w * 0.24), off(lerpP(p0, p1, 0.5), w * 0.26), off(lerpP(p0, p1, 0.88), w * 0.24)], { w: w * 0.5, color: Ci.glint, alpha: 0.5 + 0.45 * k });
                }
            }
        }
    }

    // A profile of revolution as a table: half-width at every height.
    function profile(pts) {
        const y0 = pts[0][1], y1 = pts[pts.length - 1][1], n = Math.ceil((y1 - y0) * 8) + 1, tab = new Float32Array(n), ov = new Float32Array(n);
        let j = 0;
        for (let i = 0; i < n; i++) {
            const y = y0 + i / 8;
            while (j < pts.length - 2 && pts[j + 1][1] < y) j++;
            const a = pts[j], b = pts[j + 1], u = clamp((y - a[1]) / (b[1] - a[1] || 1e-6));
            tab[i] = a[0] + (b[0] - a[0]) * u;
        }
        // how far a wider part stands out just above: the shade under a moulding
        for (let i = 0; i < n; i++) {
            let v = 0;
            for (let d = 1; d <= 56 && i - d >= 0; d++) v = Math.max(v, (tab[i - d] - tab[i]) * (1 - d / 57));
            ov[i] = v;
        }
        const ix = (y) => Math.max(0, Math.min(n - 1, Math.round((y - y0) * 8)));
        return { y0, y1, at: (y) => tab[ix(y)], under: (y) => ov[ix(y)] };
    }

    // A turned thing (a candle, a socket, a bowl, a dome): its right-hand profile [[half
    // width, y], …] from top to bottom spun about the y axis and lit per pixel, then brought
    // back to the emblem manner with the airbrush. `o`:
    //   prof, axis(y)   the profile; where the axis stands at each height (a bowed candle)
    //   top, bottom     extra outline points before and after the right-hand side
    //   add(g), cut(g)  more silhouette; holes
    //   bump(x, y, r, m) relief on the surface, in units (x from the axis, r the radius there)
    //   edge            how far the sheet's cut edges are rounded off (pierced work)
    //   air             [{ color, alpha, w, push, lit }] the airbrush, from the shade (or the lit) side
    //   over(g, env), marks(g, env), tint(x, y, tone, rgb, m, r)   as in `Souvenir.form`
    //   glaze(sp, env), after(g, env)   after the airbrush: glazes, then the drawing on top
    function lathe(key, rot, res, o) {
        const a = snap(rot);
        return memo(`${key}/${a.toFixed(3)}@${res}`, () => {
            const P = profile(o.prof), ax = o.axis ?? (() => 0);
            const L = S.lightFor(a), sh = local(SD, a), lit = [-sh[0], -sh[1]], hv = halfway(L);
            const env = { L, sh, lit, hv, P, res };
            const out = [...(o.top ?? []), ...o.prof.map(([w, y]) => [ax(y) + w, y]), ...(o.bottom ?? []), ...o.prof.slice().reverse().map(([w, y]) => [ax(y) - w, y])];
            const round = o.round ?? 1, uc = o.underCol ?? [18, 16, 44];
            const sp = S.form({
                box: even(S.bbox(out, o.pad ?? 6)), res, seed: key, light: L, ramp: o.ramp, soft: 1, inflate: 'none', R: o.rim ?? 1.2,
                mask: (g) => {
                    poly(g, out);
                    if (o.add) o.add(g);
                    if (o.cut) cut(g, o.cut);
                },
                height: (x, y, m) => {
                    const r = P.at(y), xx = x - ax(y);
                    let h = Math.sqrt(Math.max(0, r * r - xx * xx)) * round;
                    if (o.bump) h += o.bump(xx, y, r, m);
                    if (o.edge) h -= o.edge * (1 - m) * (1 - m);
                    return h;
                },
                mottle: o.mottle ?? { amp: 0.04, freq: 0.06 }, spec: o.spec, stroke: o.stroke,
                marks: o.marks ? (g) => o.marks(g, env) : null,
                tint: (x, y, tone, rgb, m) => {
                    const k = Math.min(0.62, P.under(y) * (o.under ?? 0.11));
                    if (k > 0) {
                        rgb[0] += (uc[0] - rgb[0]) * k;
                        rgb[1] += (uc[1] - rgb[1]) * k;
                        rgb[2] += (uc[2] - rgb[2]) * k;
                    }
                    if (o.tint) o.tint(x - ax(y), y, tone, rgb, m, P.at(y));
                },
                over: o.over ? (g) => o.over(g, env) : null,
            });
            for (const a2 of o.air ?? []) sprayIn(sp, res, { ...a2, dir: a2.lit ? lit : sh });
            sp.env = env;
            if (o.glaze) o.glaze(sp, env);
            if (o.after) onto(sp, res, (g) => o.after(g, env));
            sp.out = out;
            sp.env = env;
            return sp;
        });
    }
    // the airbrush for old silver and for brass, `w` units deep
    const airSilver = (w) => [{ color: '#2b2a52', alpha: 0.6, w: w * 1.6 }, { color: '#12132c', alpha: 0.85, w: w * 0.7 }, { color: '#eef1fb', alpha: 0.7, w: w * 0.5, lit: true }, { color: '#7d86a6', alpha: 0.7, w: 1.4, push: 0.5 }];
    const airBrass = (w) => [{ color: '#6b3f1c', alpha: 0.6, w: w * 1.6 }, { color: '#33203c', alpha: 0.85, w: w * 0.7 }, { color: '#ffeaa8', alpha: 0.7, w: w * 0.5, lit: true }, { color: '#b8742c', alpha: 0.75, w: 1.4, push: 0.5 }];
    // an arc that sags like a line turned on a round thing seen from a little above
    const hoop = (cx, y, r, sag = 0.07, k = 1) => {
        const pts = [];
        for (let i = 0; i <= 16; i++) {
            const u = -1 + (2 * i) / 16;
            pts.push([cx + u * r * k, y + sag * r * Math.sqrt(Math.max(0, 1 - u * u * k * k))]);
        }
        return pts;
    };

    // ------------------------------------------------------------------ flame, glow, smoke
    // A candle flame standing on the frame's origin (the wick's tip), `h` tall: a blue cup, a
    // dark cone over the wick, a pale core, a tongue that leans `lean` units at its tip.
    // Light, not a thing: no ink on it, and it is painted straight on the layer.
    function flame(g, F, o = {}) {
        const h = o.h ?? 60, w = o.w ?? 17, lean = o.lean ?? -6, r = Motion.rng('flame' + (o.seed ?? 0));
        const ax = (u) => lean * u * u + w * 0.07 * Math.sin(u * 5.2 + 0.6) * u;
        const hw = (u, k = 1) => (w / 2) * k * (u < 0.24 ? 0.56 + 0.44 * Math.sin((u / 0.24) * Math.PI / 2) : Math.pow(Math.cos(((u - 0.24) / 0.76) * Math.PI / 2), 1.2));
        const shape = (k, u0 = 0, u1 = 1, n = 30) => {
            const L = [], R = [];
            for (let i = 0; i <= n; i++) {
                const u = u0 + ((u1 - u0) * i) / n, b = hw(u, k) * (u1 < 1 ? Math.sqrt(Math.max(0, 1 - Math.pow((i / n) * 1.0, 6))) : 1);
                L.push([ax(u) - b, -u * h]);
                R.push([ax(u) + b, -u * h]);
            }
            // a round bottom
            const cap = [];
            for (let i = 1; i < 8; i++) cap.push([ax(u0) + Math.cos((i / 8) * Math.PI) * hw(u0, k), -u0 * h + Math.sin((i / 8) * Math.PI) * hw(u0, k) * 0.7]);
            return F.pts([...L, ...R.reverse(), ...cap]);
        };
        const px = S.pxScale(g), body = shape(1), base = F([0, 0]), tip = F([ax(1), -h]);
        g.save();
        // the veil: hot air that glows a little round the tongue
        g.filter = `blur(${(1.6 * px).toFixed(1)}px)`;
        fillPts(g, shape(1.34, -0.02, 1), 'rgba(255,128,44,0.4)');
        g.filter = 'none';
        const gr = g.createLinearGradient(base[0], base[1], tip[0], tip[1]);
        for (const [u, c] of [[0, '#ffe7a0'], [0.16, '#fff4c8'], [0.42, '#ffd75e'], [0.7, '#fba534'], [0.9, '#ee7426'], [1, 'rgba(226,84,30,0.8)']]) gr.addColorStop(u, c);
        fillPts(g, body, gr);
        g.beginPath();
        S.trace(g, body);
        g.clip();
        // orange gathers along the edges, red at the shade side
        S.spray(g, body, { color: '#f0801f', alpha: 0.85, w: w * 0.3, push: 0 });
        S.spray(g, body, { color: '#d9501c', alpha: 0.5, w: w * 0.2, push: w * 0.1 });
        // strokes that follow the tongue
        for (let i = 0; i < 9; i++) {
            const f = (r() - 0.5) * 1.3, u0 = 0.26 + r() * 0.3, u1 = Math.min(0.97, u0 + 0.2 + r() * 0.35), line = [];
            for (let k = 0; k <= 8; k++) {
                const u = u0 + ((u1 - u0) * k) / 8;
                line.push([ax(u) + f * hw(u), -u * h]);
            }
            S.ink(g, F.pts(line), { w: 0.5 + r() * 0.6, color: Math.abs(f) < 0.3 ? '#fffbe0' : r() < 0.5 ? '#ffe28a' : '#e2641c', alpha: 0.35 + r() * 0.3 });
        }
        // the pale core
        g.filter = `blur(${(0.7 * px).toFixed(1)}px)`;
        fillPts(g, shape(0.56, 0.05, 0.66), 'rgba(255,253,236,0.96)');
        g.filter = `blur(${(0.5 * px).toFixed(1)}px)`;
        // the dark cone of unburnt gas over the wick, and the blue cup the flame stands in
        fillPts(g, shape(0.3, 0.0, 0.2), 'rgba(96,82,150,0.5)');
        const b1 = F([0, -h * 0.2]), gb = g.createLinearGradient(base[0], base[1], b1[0], b1[1]);
        for (const [u, c] of [[0, 'rgba(30,44,150,0.92)'], [0.4, 'rgba(52,80,196,0.6)'], [1, 'rgba(90,130,240,0)']]) gb.addColorStop(u, c);
        g.filter = 'none';
        const cup = shape(1.02, -0.03, 0.22);
        fillPts(g, cup, gb);
        g.beginPath();
        S.trace(g, cup);
        g.clip();
        S.spray(g, body, { color: '#7fa6ff', alpha: 0.6, w: w * 0.1, push: 0 });
        g.restore();
        // its edge, drawn in its own red, heavier on the shade side
        const side = (sgn) => {
            const line = [];
            for (let i = 0; i <= 20; i++) {
                const u = 0.2 + (0.8 * i) / 20;
                line.push([ax(u) + sgn * hw(u), -u * h]);
            }
            return F.pts(line);
        };
        const sg = dot2(F.dir([1, 0]), SD) >= 0 ? 1 : -1;
        S.ink(g, side(sg), { w: 1.3, color: '#b23c1a', alpha: 0.85, taper: [1, 0.3] });
        S.ink(g, side(-sg), { w: 0.8, color: '#d86a22', alpha: 0.7, taper: [1, 0.3] });
        // a hair of soot off the tip
        if (o.soot ?? true) {
            const sm = S.curve([[ax(1), -h + 1], [ax(1) + lean * 0.12, -h - h * 0.1], [ax(1) + lean * 0.3 + 1.5, -h - h * 0.2], [ax(1) + lean * 0.3 - 1, -h - h * 0.3]], false, 8);
            S.ink(g, F.pts(sm), { w: 0.8, color: '#3a3454', alpha: 0.6, taper: [0.2, 1] });
        }
        return { tip: [ax(1), -h], mid: [ax(0.4), -h * 0.4] };
    }
    // the light a flame throws round itself (the lens will bloom it)
    function glow(g, c, R, a = 1) {
        g.save();
        g.globalCompositeOperation = 'screen';
        for (const [rad, col, al] of [[R, '255,170,70', 0.3], [R * 0.52, '255,206,120', 0.36], [R * 0.2, '255,240,200', 0.5]]) {
            const gr = g.createRadialGradient(c[0], c[1], 0, c[0], c[1], rad);
            gr.addColorStop(0, `rgba(${col},${al * a})`);
            gr.addColorStop(0.4, `rgba(${col},${al * a * 0.42})`);
            gr.addColorStop(1, `rgba(${col},0)`);
            g.fillStyle = gr;
            g.fillRect(c[0] - rad, c[1] - rad, rad * 2, rad * 2);
        }
        g.restore();
    }

    // ------------------------------------------------------------------ the candle
    const CY0 = -126, CY1 = 143; // the rim of the well; where the shaft stands in the socket
    const shaftHW = (y) => 10.6 + (4.4 * (y - CY0)) / (CY1 - CY0) + 0.32 * Math.sin(y * 0.057 + 1) + 0.18 * Math.sin(y * 0.19);
    const shaftCX = (y) => 1.7 * Math.sin((Math.PI * (y - CY0)) / (CY1 - CY0)) - 0.5;
    const RIM = 3.1; // the well's ellipse, seen from a little above

    // The runs of wax down the leeward side: each a list of circles { x, y, r }.
    const cirioDrips = (seed) => memo('drips/' + seed, () => {
        const r = Motion.rng('cirio/' + seed), runs = [];
        // where it leaves the rim (in half-widths from the axis), length, width, drop, thickness
        const spec = [[-0.56, 121, 2.5, 3.8, 1], [-0.88, 67, 2.1, 3.1, 0.9], [-0.22, 44, 2.2, 3.3, 0.95], [-0.7, 178, 1.7, 2.8, 0.72], [0.1, 27, 1.8, 2.7, 0.8], [-0.99, 32, 1.6, 2.5, 0.75], [0.4, 61, 1.5, 2.4, 0.66], [0.78, 19, 1.4, 2.2, 0.6], [-0.4, 14, 1.7, 2.3, 0.7]];
        for (const [fx, len, w, drop, lvl] of spec) {
            const ph = r() * TAU, ph2 = r() * TAU, wig = 0.5 + r() * 0.9, pause = 0.3 + r() * 0.36, n = Math.ceil(len / 0.5), pts = [];
            for (let i = 0; i <= n; i++) {
                const s = (i / n) * (len - drop), y = CY0 + 0.8 + s, e = len - drop - s;
                const x = shaftCX(y) + fx * shaftHW(y) * (1 - 0.1 * smooth(0, 60, s)) + wig * Math.sin(s * 0.047 + ph) * smooth(0, 16, s);
                // fans out of the breach, swells where it paused, thins, then gathers into its drop
                let rad = w * (1 + 0.85 * smooth(9, 0, s)) * (1 + 0.15 * Math.sin(s * 0.2 + ph2)) * (1 - 0.3 * (s / len));
                rad += w * 0.45 * Math.exp(-Math.pow((s - pause * len) / 4.5, 2));
                rad += (drop - rad) * smooth(drop * 2.6, 0, e);
                pts.push({ x, y, r: rad });
            }
            runs.push({ pts, lvl, drop, w });
        }
        // beads that broke off and set on their own
        for (const [fx, yy, rad] of [[-0.5, 4, 2.3], [-0.76, 66, 1.9], [0.22, -52, 1.7], [-0.3, -18, 1.5], [0.5, -80, 1.4]]) {
            const y = CY0 + 126 + yy, pts = [];
            for (let i = 0; i <= 6; i++) pts.push({ x: shaftCX(y) + fx * shaftHW(y), y: y - (6 - i) * 0.5, r: rad * (0.55 + 0.45 * (i / 6)) });
            runs.push({ pts, lvl: 0.7, drop: rad, w: rad });
        }
        return runs;
    });
    const paintDrips = (g, runs, k, style) => {
        for (const run of runs) {
            g.fillStyle = style(run);
            g.beginPath();
            for (const p of run.pts) {
                g.moveTo(p.x + p.r * k, p.y);
                g.arc(p.x, p.y, p.r * k, 0, TAU);
            }
            g.fill();
        }
    };

    function cirioShaft(rot, res, seed) {
        const runs = cirioDrips(seed), prof = [];
        for (let y = CY0; y <= CY1 + 0.01; y += 1) prof.push([shaftHW(y), y]);
        const top = [];
        for (let i = 0; i <= 14; i++) top.push([shaftCX(CY0) - Math.cos((i / 14) * Math.PI) * shaftHW(CY0), CY0 - Math.sin((i / 14) * Math.PI) * RIM]);
        const box = { x: -30, y: CY0 - 8, w: 60, h: CY1 - CY0 + 16 };
        const grey = (v) => `rgb(${Math.round(v * 255)},${Math.round(v * 255)},${Math.round(v * 255)})`;
        const relief = memo(`shaft-pre/${seed}@${res}`, () => field(box, res, (q) => {
            // every run a rounded cord: three nested passes, the taller the nearer its middle
            q.globalCompositeOperation = 'lighten';
            for (const [k, lv, bl] of [[1, 0.42, 0.5], [0.7, 0.78, 0.4], [0.4, 1, 0.35]]) {
                q.filter = `blur(${(bl * res).toFixed(1)}px)`;
                paintDrips(q, runs, k, (run) => grey(lv * run.lvl));
            }
        }));
        return lathe(`shaft/${seed}`, rot, res, {
            prof, axis: shaftCX, top: top.slice(1, -1), ramp: WAX, pad: 8, under: 0,
            add: (g) => paintDrips(g, runs, 0.96, () => '#fff'),
            bump: (xx, y) => relief(xx + shaftCX(y), y) * 2.7 + 0.1 * S.noise2(xx * 0.9, y * 0.05, 3),
            mottle: { amp: 0.03, freq: 0.03 },
            spec: { amp: 0.28, power: 22, from: 0.55, to: 0.98, color: '#fffdf2' },
            marks: (g) => {
                // the brush along the shaft
                const r = Motion.rng('waxmarks' + seed);
                for (let i = 0; i < 26; i++) {
                    const x = (r() - 0.5) * 24, y0 = CY0 + r() * 250, l = 20 + r() * 50;
                    S.dab(g, [[x + shaftCX(y0), y0], [x + shaftCX(y0 + l) + (r() - 0.5) * 1.5, y0 + l]], { w: 1.5 + r() * 3, color: r() < 0.5 ? '#9a9a9a' : '#6c6c6c', alpha: 0.4, bristles: 5, seed: 'wm' + i, dry: 0.5 });
                }
            },
            tint: (xx, y, tone, rgb, m, rr) => {
                // near the flame the light is inside the wax: warmer, brighter, no form shadow
                const d = y - CY0, c = 1 - (xx * xx) / (rr * rr + 1);
                const kg = smooth(124, 6, d) * (0.45 + 0.55 * Math.max(0, c)), kh = smooth(30, 0, d);
                const lift = 0.66 + 0.34 * tone;
                rgb[0] += (255 * lift - rgb[0]) * (kg * 0.8);
                rgb[1] += ((188 + 40 * kh) * lift - rgb[1]) * (kg * 0.8);
                rgb[2] += ((92 + 70 * kh) * lift - rgb[2]) * (kg * 0.8);
                // dipping lines: the wax went on in coats, each leaves a faint tide mark
                const v = S.noise2(xx * 2.2, y * 0.022, 17) * 0.6 + S.noise2(xx * 5, y * 0.05, 18) * 0.4, f = 1 + 0.035 * v;
                rgb[0] *= f;
                rgb[1] *= f;
                rgb[2] *= f * (1 - 0.012 * v);
            },
            glaze: (sp) => {
                // the light inside the wax, for a hand's width under the flame
                const grad = (col, a) => (q) => {
                    const gr = q.createLinearGradient(0, CY0 - 4, 0, CY0 + 128);
                    gr.addColorStop(0, S.rgba(col, a));
                    gr.addColorStop(0.3, S.rgba(col, a * 0.66));
                    gr.addColorStop(1, S.rgba(col, 0));
                    q.fillStyle = gr;
                    q.fillRect(-40, CY0 - 10, 80, 140);
                };
                glaze(sp, res, 'multiply', grad('#ffcd78', 0.9));
                glaze(sp, res, 'screen', grad('#8a4a10', 0.8));
            },
            after: (g, { sh, lit }) => {
                // every run shades the shaft beside it
                g.save();
                g.filter = `blur(${(0.9 * res).toFixed(1)}px)`;
                g.globalAlpha = 0.5;
                g.translate(sh[0] * 1.7, sh[1] * 1.7);
                paintDrips(g, runs, 1, () => '#7e5f62');
                g.restore();
                g.save();
                g.globalAlpha = 0.9;
                paintDrips(g, runs, 0.8, () => 'rgba(250,238,204,0.42)');
                g.restore();
                const r = Motion.rng('waxover' + seed);
                for (const run of runs) {
                    const P = run.pts, n = P.length, edge = (sgn, k, i0, i1) => {
                        const line = [];
                        for (let i = i0; i < i1; i += 2) {
                            const a = P[Math.max(0, i - 3)], b = P[Math.min(n - 1, i + 3)], tl = Math.hypot(b.x - a.x, b.y - a.y) || 1, nx = -(b.y - a.y) / tl, ny = (b.x - a.x) / tl;
                            const s = (nx * sh[0] + ny * sh[1] >= 0 ? 1 : -1) * sgn;
                            line.push([P[i].x + nx * s * P[i].r * k, P[i].y + ny * s * P[i].r * k]);
                        }
                        return line;
                    };
                    // its shaded flank and the underside of its drop, drawn; a light along the other flank
                    if (n > 14) {
                        S.ink(g, edge(1, 0.96, 6, n), { w: 0.9, color: '#6a505a', alpha: 0.9, taper: [1, 0] });
                        S.ink(g, edge(-1, 0.98, 8, n - 4), { w: 0.5, color: '#a88a70', alpha: 0.6, taper: [1, 0.6] });
                        const a0 = Math.floor(n * (0.12 + r() * 0.1)), a1 = Math.floor(n * (0.5 + r() * 0.2));
                        S.ink(g, edge(-1, 0.42, a0, a1), { w: 0.7, color: '#fffef4', alpha: 0.8 });
                        if (n > 80) S.ink(g, edge(-1, 0.42, a1 + 8, Math.min(n - 8, a1 + 30 + Math.floor(r() * 30))), { w: 0.6, color: '#fffef4', alpha: 0.6 });
                    }
                    const e = P[n - 1], arc = [];
                    const a0 = Math.atan2(sh[1], sh[0]);
                    for (let k = -7; k <= 7; k++) arc.push([e.x + Math.cos(a0 + k * 0.17) * e.r * 0.97, e.y + Math.sin(a0 + k * 0.17) * e.r * 0.97]);
                    S.ink(g, arc, { w: 0.95, color: '#5d4a5e', alpha: 0.85, taper: [0.9, 0.9] });
                    // the point of light on the drop, and the lamp's glow coming through its far side
                    g.fillStyle = 'rgba(255,255,250,0.95)';
                    g.beginPath();
                    g.ellipse(e.x + lit[0] * e.r * 0.42, e.y + lit[1] * e.r * 0.42, e.r * 0.3, e.r * 0.17, Math.atan2(lit[1], lit[0]) + Math.PI / 2, 0, TAU);
                    g.fill();
                    S.ink(g, arc.slice(4, 11).map(([x, y]) => [e.x + (x - e.x) * 0.62, e.y + (y - e.y) * 0.62]), { w: e.r * 0.3, color: '#ffe9b4', alpha: 0.55 });
                }
                // the wax was drawn through the hand while warm: long hairlines down the shaft
                for (let i = 0; i < 44; i++) {
                    const fx = (r() - 0.5) * 1.8, y0 = CY0 + 6 + r() * 220, l = 16 + r() * 80, line = [];
                    for (let k = 0; k <= 6; k++) {
                        const y = Math.min(CY1 - 3, y0 + (l * k) / 6);
                        line.push([shaftCX(y) + fx * shaftHW(y) * (1 + 0.012 * Math.sin(k * 2 + i)), y]);
                    }
                    S.ink(g, line, { w: 0.35 + r() * 0.3, color: r() < 0.55 ? '#b0946e' : '#fffdf2', alpha: 0.22 + r() * 0.26 });
                }
                // scuffs and scratches from being carried
                for (let i = 0; i < 46; i++) {
                    const y = CY0 + 30 + r() * 235, x = shaftCX(y) + (r() - 0.5) * 2 * shaftHW(y) * 0.9, a = Math.PI / 2 + (r() - 0.5) * 1.5, l = 1.5 + r() * 6;
                    S.ink(g, [[x, y], [x + Math.cos(a) * l, y + Math.sin(a) * l]], { w: 0.45 + r() * 0.3, color: r() < 0.6 ? '#9d8468' : '#fffdf0', alpha: 0.3 + r() * 0.3 });
                }
                // a nick with its bruise, and a hairline crack running up from the socket
                const ny = 62, nx = shaftCX(ny) + shaftHW(ny) * 0.34;
                fillPts(g, [[nx - 1.6, ny - 1], [nx + 1.2, ny - 1.6], [nx + 2, ny + 0.6], [nx - 0.4, ny + 1.9]], 'rgba(120,96,84,0.6)');
                S.ink(g, [[nx - 1.6, ny - 1], [nx + 1.2, ny - 1.6]], { w: 0.6, color: '#5d4a5e', alpha: 0.8 });
                S.ink(g, [[nx - 0.4, ny + 2.3], [nx + 2.2, ny + 1]], { w: 0.6, color: '#fffdf0', alpha: 0.8 });
                const crack = S.curve([[shaftCX(140) + 5.4, 141], [shaftCX(128) + 4.4, 128], [shaftCX(117) + 6, 117], [shaftCX(104) + 5.2, 106], [shaftCX(98) + 6.6, 99]], false, 5);
                S.ink(g, crack, { w: 0.7, color: '#6b5560', alpha: 0.7, taper: [0, 1] });
                S.ink(g, crack.map(([x, y]) => [x + sh[0] * 0.7, y + sh[1] * 0.7]), { w: 0.5, color: '#fffdf0', alpha: 0.6, taper: [0, 1] });
                // the chandler's seal pressed into the wax: an oval, a star in it, a rope of dots
                const sy = 86, sx = shaftCX(sy) - 1.5;
                for (const [dx, dy, col, al] of [[sh[0] * -0.6, sh[1] * -0.6, '#6f5a62', 0.7], [sh[0] * 0.5, sh[1] * 0.5, '#fffdf2', 0.75]]) {
                    strokePts(g, S.ellipse(sx + dx, sy + dy, 5.6, 7.6, 30), 0.7, S.rgba(col, al), true);
                    strokePts(g, S.ellipse(sx + dx, sy + dy, 4.2, 6.1, 26), 0.45, S.rgba(col, al * 0.8), true);
                    strokePts(g, star8(sx + dx, sy + dy, 2.9, 0.45, 0.2), 0.5, S.rgba(col, al), true);
                }
                for (let i = 0; i < 22; i++) disc(g, pol(4.9, (i / 22) * TAU, sx, sy).map((v, j) => (j ? sy + (v - sy) * 1.4 : v)), 0.28, 'rgba(98,78,84,0.6)');
                // two gilt lines under it, worn through where the hand holds
                for (const [yy, ww] of [[104, 1.3], [107.6, 0.5], [112.4, 1.3]]) {
                    const h = [];
                    for (let k = 0; k <= 48; k++) {
                        const u = -1 + (2 * k) / 48;
                        h.push([shaftCX(yy) + u * shaftHW(yy), yy + 1.4 * Math.sqrt(Math.max(0, 1 - u * u))]);
                    }
                    for (let k = 0; k < h.length - 1; k++) {
                        const wear = S.noise2(k * 0.33, yy * 0.7, 9) + 0.5 * S.noise2(k * 1.3, yy, 10);
                        if (wear > 0.38) continue;
                        const a = 0.95 - 0.5 * smooth(0, 0.38, wear);
                        strokePts(g, [h[k], h[k + 1]], ww, S.rgba('#c08a2a', a));
                        strokePts(g, [[h[k][0], h[k][1] - ww * 0.3], [h[k + 1][0], h[k + 1][1] - ww * 0.3]], ww * 0.3, `rgba(255,236,170,${a * 0.9})`);
                        strokePts(g, [[h[k][0], h[k][1] + ww * 0.55], [h[k + 1][0], h[k + 1][1] + ww * 0.55]], 0.3, `rgba(110,80,70,${a * 0.5})`);
                    }
                }
                // where it stands in the socket: the cup's shade
                const gs = g.createLinearGradient(0, CY1 - 14, 0, CY1);
                gs.addColorStop(0, 'rgba(70,50,70,0)');
                gs.addColorStop(1, 'rgba(70,50,70,0.75)');
                g.fillStyle = gs;
                g.fillRect(-30, CY1 - 14, 60, 16);
            },
            air: [{ color: '#a58a78', alpha: 0.6, w: 9 }, { color: '#6a5672', alpha: 0.7, w: 3.6 }, { color: '#fffdf0', alpha: 0.75, w: 3.6, lit: true }, { color: '#c9a78a', alpha: 0.6, w: 1.2, push: 0.4 }],
        });
    }

    // The socket: a cup with a beaded lip, a ring, a gadrooned knop, a spreading foot.
    const SOCKET = S.curve([[19.2, 131], [21.6, 132.4], [22, 134.6], [20.6, 136.6]], false, 3)
        .concat([[19.4, 137.2], [19.2, 144], [18.2, 152], [16.2, 158.6], [15.6, 160.4], [17.6, 161.2], [18.4, 163], [17.6, 164.8], [15, 165.6], [11.4, 167.6], [9.6, 170.4], [9.2, 172.6]])
        .concat(S.curve([[9.2, 172.8], [14, 174.6], [16.4, 179], [14, 183.6], [9.4, 185.4]], false, 5))
        .concat([[9, 188.4], [10.6, 189.6], [11, 191.2]])
        .concat(S.curve([[11, 191.4], [14, 194.4], [22, 198], [32, 201], [38, 203.6]], false, 5))
        .concat([[40.6, 204.2], [41.6, 206], [41.2, 208.2], [39, 209]]);
    function cirioSocket(rot, res, seed) {
        return lathe(`socket/${seed}`, rot, res, {
            prof: SOCKET, ramp: BRASS, under: 0.13, underCol: [40, 22, 40],
            bump: (xx, y, r) => {
                const lon = Math.asin(clamp(xx / r, -1, 1));
                let h = 0;
                // beading round the lip, gadroons on the knop, a rope on the foot's edge
                if (y < 137) h += 0.75 * Math.pow(0.5 + 0.5 * Math.cos(lon * 26), 2) * smooth(131, 132.6, y) * smooth(137, 135.4, y);
                if (y > 173 && y < 186) h += 1.25 * Math.pow(Math.abs(Math.cos(lon * 5.5 + 0.3)), 0.6) * Math.sin(((y - 173) / 13) * Math.PI);
                if (y > 204) h += 0.6 * (0.5 + 0.5 * Math.cos(lon * 44 + (y - 204) * 2.4));
                return h + 0.12 * S.noise2(xx * 0.5, y * 0.5, 8);
            },
            mottle: { amp: 0.05, freq: 0.07 },
            spec: { amp: 0.7, power: 26, from: 0.5, to: 0.95, color: '#fff3c4' },
            tint: (xx, y, tone, rgb, m, r) => {
                // tarnish: brown in slow patches, greener in the grooves
                const n = S.noise2(xx * 0.09, y * 0.09, 31) * 0.6 + S.noise2(xx * 0.3, y * 0.3, 32) * 0.4;
                const k = smooth(0.25, 0.7, n + (0.5 - tone) * 0.4) * 0.45, f = 0.4 + 0.75 * tone;
                rgb[0] += (98 * f - rgb[0]) * k;
                rgb[1] += (70 * f - rgb[1]) * k;
                rgb[2] += (56 * f - rgb[2]) * k;
            },
            after: (g, { sh, hv, P }) => {
                // turned lines: a groove's dark and the light on its far lip
                for (const [yy, a] of [[140.5, 0.8], [149, 0.6], [150.6, 0.6], [161, 0.9], [165.2, 0.9], [172.8, 0.9], [185.6, 0.9], [188.6, 0.8], [191.4, 0.9], [196, 0.55], [200.4, 0.55], [204.2, 0.95]]) {
                    const rr = P.at(yy), h = hoop(0, yy, rr, 0.05);
                    strokePts(g, h, 0.8, `rgba(48,24,34,${a})`);
                    strokePts(g, h.map(([x, y]) => [x, y + 0.8]), 0.45, `rgba(255,238,170,${a * 0.6})`);
                }
                // the cup's engraving: a row of upright leaves between the lines
                for (let i = -5; i <= 5; i++) {
                    const lon = i * 0.27, x = Math.sin(lon) * 18.6, wd = Math.cos(lon) * 2.3;
                    if (wd < 0.5) continue;
                    const leaf = [[x, 141.8], [x + wd, 145], [x, 148.4], [x - wd, 145]];
                    strokePts(g, leaf, 0.55, 'rgba(58,30,34,0.75)', true);
                    strokePts(g, [[x, 142.6], [x, 147.6]], 0.4, 'rgba(58,30,34,0.6)');
                    strokePts(g, leaf.map(([px, py]) => [px + sh[0] * 0.5, py + sh[1] * 0.5]), 0.35, 'rgba(255,240,180,0.5)', true);
                }
                // polished: a short fat streak and a dash under it on every swelling
                const glint = (y0, y1, r) => {
                    const x = (hv[0] / Math.hypot(hv[0], hv[2])) * r * 0.82;
                    S.ink(g, [[x, y0], [x - 0.3, (y0 + y1) / 2], [x, y1]], { w: Math.max(1.6, r * 0.34), color: '#ffe9a6', alpha: 0.42, taper: [0.7, 0.7] });
                    S.ink(g, [[x, y0 + (y1 - y0) * 0.12], [x, y0 + (y1 - y0) * 0.6]], { w: Math.max(0.9, r * 0.14), color: '#fffbe6', alpha: 0.95, taper: [0.5, 0.5] });
                    S.ink(g, [[x, y0 + (y1 - y0) * 0.74], [x, y0 + (y1 - y0) * 0.9]], { w: Math.max(0.8, r * 0.11), color: '#fffbe6', alpha: 0.85, taper: [0.5, 0.5] });
                    // and the night, mirrored along the far flank
                    S.ink(g, [[-x * 1.08, y0 + (y1 - y0) * 0.1], [-x * 1.1, y1 - (y1 - y0) * 0.1]], { w: Math.max(0.8, r * 0.1), color: '#7f6ea8', alpha: 0.5 });
                };
                glint(139, 158, 18.5);
                glint(175.5, 183.5, 15.6);
                glint(193.5, 202.5, 22);
                // file and lathe scratches
                const r = Motion.rng('socket' + seed);
                for (let i = 0; i < 40; i++) {
                    const y = 133 + r() * 74, rr = P.at(y), x = (r() - 0.5) * 2 * rr * 0.9, l = 1 + r() * 4;
                    strokePts(g, [[x, y], [x + l, y + (r() - 0.5) * 0.6]], 0.3, r() < 0.5 ? 'rgba(60,34,30,0.4)' : 'rgba(255,240,190,0.4)');
                }
            },
            air: airBrass(5.5),
        });
    }

    function cirio(g, o = {}) {
        const seed = o.seed ?? 'cirio';
        sheet(g, o, { x: -48, y: -212, w: 96, h: 424 }, (q, F) => {
            const res = resOf(q), cs = { blur: 3, dx: 1.6, dy: 2.4, color: 'rgba(30,14,40,0.6)' };
            stamp(q, F, cirioShaft(F.rot, res, seed), { lw: 2.3 });
            stamp(q, F, cirioSocket(F.rot, res, seed), { lw: 2.3, cast: cs });
            // wax that ran over the lip and down the cup, and set in a puddle on the foot
            const WX = { base: '#eadcb6', deep: '#9c8474', light: '#fffdf2', glint: '#ffffff' };
            // (it leaves the shaft's foot as a thin cord, thickens on the cup's shoulder, ends in a drop on the knop)
            const run = F.pts(S.curve([[-9.9, 129], [-10.8, 133], [-12.6, 137], [-11.8, 145], [-10.6, 154], [-10.9, 160], [-11.6, 165], [-10, 169.4]], false, 6));
            const off = (pts, v, d) => pts.map(([x, y]) => [x + v[0] * d, y + v[1] * d]);
            S.cast(q, (c) => strokePts(c, run, 2.4, '#000'), cs);
            strokePts(q, off(run, SD, 0.45), 2.9, '#5e4046');
            strokePts(q, run, 2.2, '#dcc9a2');
            strokePts(q, off(run, TOL, 0.35), 1.2, '#f6ecd2');
            S.ink(q, off(run.slice(4, 30), TOL, 0.5), { w: 0.6, color: '#fffef8', alpha: 0.95 });
            S.cast(q, (c) => disc(c, F([-9.9, 170.6]), 2.5, '#000'), cs);
            disc(q, F([-9.6, 171]), 3, '#5e4046');
            bead(q, F([-9.9, 170.6]), 2.5, WX, 0);
            const pud = [];
            for (let i = 0; i < 26; i++) {
                const a = (i / 26) * TAU, rr = 1 + 0.16 * Math.sin(a * 3 + 1) + 0.1 * Math.sin(a * 7 + 2) + (i === 5 || i === 6 ? 0.45 : 0);
                pud.push([-16.4 + Math.cos(a) * 8.4 * rr, 199.3 + Math.sin(a) * 2.5 * rr + Math.cos(a) * 1.3]);
            }
            const pd = F.pts(S.curve(pud, true, 3));
            S.cast(q, (c) => fillPts(c, pd, '#000'), cs);
            fillPts(q, off(pd, SD, 0.5), '#5e4046');
            fillPts(q, pd, '#dfcda6');
            q.save();
            q.beginPath();
            S.trace(q, pd);
            q.clip();
            S.spray(q, pd, { color: '#a68872', alpha: 0.85, w: 1.8 });
            S.spray(q, pd, { color: '#fffdf2', alpha: 0.9, w: 1.4, dir: TOL });
            S.ink(q, F.pts([[-21.5, 198.5], [-16, 197.7], [-11.6, 198.3]]), { w: 0.6, color: '#fffef6', alpha: 0.95 });
            q.restore();
            for (const [x, y, rr] of [[-28.4, 201.6, 1], [-4.4, 200.3, 0.8], [4.4, 137.6, 1], [12.4, 198.2, 0.6], [-31.5, 203, 0.5]]) {
                disc(q, F([x + 0.3, y + 0.35]), rr + 0.35, '#5e4046');
                bead(q, F([x, y]), rr, WX, 0);
            }
            // the well: its rim, the melted pool, the flame's reflection in it
            const cx = shaftCX(CY0), hw = shaftHW(CY0), rim = S.ellipse(cx, CY0, hw - 0.3, RIM, 40), pool = S.ellipse(cx + 0.2, CY0 + 0.3, hw - 2.3, RIM - 1, 36);
            S.piece(q, F.pts(rim), {
                fill: '#f6e4b0', line: 0.9, ink: '#7a5236', heavy: 0.2,
                detail: (d) => {
                    // the back wall glows with the light inside it; the front lip is thick and pale
                    const c = F([cx, CY0 - 1]), gr = d.createRadialGradient(c[0], c[1], 1, c[0], c[1], hw * 1.1);
                    gr.addColorStop(0, '#fff6cf');
                    gr.addColorStop(0.6, '#ffd88a');
                    gr.addColorStop(1, '#f0b060');
                    fillPts(d, F.pts(rim), gr);
                    S.spray(d, F.pts(rim), { color: '#fffdf0', alpha: 0.9, w: 1.6, push: 1.2, dir: F.dir([0, -1]) });
                },
            });
            S.piece(q, F.pts(pool), {
                fill: '#e9b85a', line: 0.7, ink: '#9a6a3a', heavy: 0,
                detail: (d) => {
                    S.spray(d, F.pts(pool), { color: '#b9772c', alpha: 0.8, w: 2.4, push: 1.4, dir: F.dir([0, 1]) });
                    // the flame, mirrored in the liquid, and the lamp's light on its skin
                    fillPts(d, F.pts(S.ellipse(cx - 0.6, CY0 + 0.9, 3.4, 0.8, 16)), 'rgba(255,252,228,0.95)');
                    fillPts(d, F.pts(S.ellipse(cx + 4, CY0 - 0.4, 1.6, 0.4, 10)), 'rgba(255,246,206,0.8)');
                    for (const [x, y] of [[-4.6, 0.4], [3, 1.3], [5.4, 0.2], [-2, -0.9]]) disc(d, F([cx + x, CY0 + y]), 0.36, 'rgba(40,24,30,0.85)');
                },
            });
            // the breach: the pool spilling over the lip into the longest run
            const spill = F.pts(S.curve([[cx - 7.6, CY0 + 0.6], [cx - 5.4, CY0 + 0.7], [cx - 3, CY0 + 1.7], [cx - 3.2, CY0 + 3.3], [cx - 5.6, CY0 + 4], [cx - 7.9, CY0 + 2.9]], true, 5));
            fillPts(q, spill, '#f0c878');
            q.save();
            q.beginPath();
            S.trace(q, spill);
            q.clip();
            S.spray(q, spill, { color: '#fff3c8', alpha: 0.85, w: 1.3, push: 0.8, dir: TOL });
            q.restore();
            S.ink(q, F.pts([[cx - 7.2, CY0 + 1.2], [cx - 5.4, CY0 + 1.4], [cx - 3.6, CY0 + 2.3]]), { w: 0.6, color: '#fffef4', alpha: 0.9 });
            // the wick: charred cotton, curled over to the draught's side, an ember at its tip
            const wick = S.curve([[cx + 0.2, CY0 + 0.6], [cx + 0.5, CY0 - 4], [cx - 0.2, CY0 - 8], [cx - 2.4, CY0 - 10.6], [cx - 4.6, CY0 - 10.2]], false, 8);
            S.ink(q, F.pts(wick), { w: 2.5, color: '#120d1a', taper: [0, 0.5] });
            S.ink(q, F.pts(wick.slice(2, 26).map(([x, y]) => [x - 0.5, y - 0.2])), { w: 0.6, color: '#6f6788', alpha: 0.9 });
            for (let i = 6; i < 30; i += 5) S.ink(q, F.pts([[wick[i][0] - 0.9, wick[i][1] + 0.5], [wick[i][0] + 0.9, wick[i][1] - 0.5]]), { w: 0.4, color: '#3c3550', alpha: 0.9 });
            const tipW = wick[wick.length - 1];
            disc(q, F(tipW), 1.15, '#d8431c');
            disc(q, F([tipW[0] - 0.2, tipW[1] - 0.2]), 0.55, '#ffc46a');
            return (a) => {
                const Fw = upright(F, [cx - 0.6, CY0 - 7]).sub(cx - 0.6, CY0 - 7);
                glow(a, Fw([-2.5, -26]), 78);
                flame(a, Fw, { h: 66, w: 17.5, lean: -6.5, seed });
            };
        });
    }

    // Smoke: a ribbon of it along a path, soft, thinning as it rises, with the few crisp
    // edges a brush leaves in it. Air, not a thing: painted straight on the layer.
    function smoke(g, F, pts, o = {}) {
        const w0 = o.w0 ?? 3, w1 = o.w1 ?? 12, a = o.alpha ?? 0.42, col = o.color ?? '#c7c9e6', px = S.pxScale(g);
        const line = S.curve(pts, false, 12), st = walk(line, 1), n = st.length, L = [], R = [];
        const r = Motion.rng('smoke' + (o.seed ?? 0));
        st.forEach((m, i) => {
            const u = i / (n - 1), w = (w0 + (w1 - w0) * Math.pow(u, 1.3)) * (1 + 0.3 * Math.sin(u * 11 + (o.ph ?? 0))) * 0.5;
            L.push([m.p[0] + m.n[0] * w, m.p[1] + m.n[1] * w]);
            R.push([m.p[0] - m.n[0] * w, m.p[1] - m.n[1] * w]);
        });
        const p0 = F(line[0]), p1 = F(line[line.length - 1]), gr = g.createLinearGradient(p0[0], p0[1], p1[0], p1[1]);
        for (const [u, k] of [[0, 0.2], [0.1, 1], [0.5, 0.8], [0.82, 0.4], [1, 0]]) gr.addColorStop(u, S.rgba(col, a * k));
        g.save();
        g.filter = `blur(${((o.blur ?? 1.6) * px).toFixed(1)}px)`;
        fillPts(g, F.pts([...L, ...R.reverse()]), gr);
        // a denser core, off to the lit side
        g.filter = `blur(${((o.blur ?? 1.6) * 0.5 * px).toFixed(1)}px)`;
        g.globalAlpha = 0.7;
        const core = st.map((m, i) => {
            const u = i / (n - 1), w = (w0 + (w1 - w0) * Math.pow(u, 1.3)) * 0.18;
            return [m.p[0] + TOL[0] * w, m.p[1] + TOL[1] * w];
        });
        g.lineCap = 'round';
        for (let i = 2; i < n - 2; i += 2) {
            const u = i / (n - 1);
            strokePts(g, F.pts([core[i], core[Math.min(n - 1, i + 2)]]), (w0 + (w1 - w0) * u) * 0.34, S.rgba('#eceefa', a * 1.1 * smooth(0, 0.12, u) * (1 - u)));
        }
        g.restore();
        // the drawn edges: broken, on the side the light comes from, and a few threads inside
        for (let k = 0; k < (o.threads ?? 5); k++) {
            const u0 = 0.05 + r() * 0.6, u1 = Math.min(0.97, u0 + 0.12 + r() * 0.3), f = k < 2 ? (k ? -0.92 : 0.92) : (r() - 0.5) * 1.3, th = [];
            for (let i = Math.floor(u0 * (n - 1)); i <= Math.floor(u1 * (n - 1)); i += 2) {
                const m = st[i], u = i / (n - 1), w = (w0 + (w1 - w0) * Math.pow(u, 1.3)) * (1 + 0.3 * Math.sin(u * 11 + (o.ph ?? 0))) * 0.5;
                th.push([m.p[0] + m.n[0] * w * f, m.p[1] + m.n[1] * w * f]);
            }
            if (th.length > 2) S.ink(g, F.pts(th), { w: 0.45 + r() * 0.4, color: k % 2 ? '#eef0fb' : '#8f91c0', alpha: (0.16 + r() * 0.2) * (a / 0.42) });
        }
    }

    // ------------------------------------------------------------------ the thurible
    const TH_LID = S.curve([[1.2, 27.4], [5.4, 29], [9.6, 32.6], [12, 37.4], [12.6, 39.6]], false, 5)
        .concat([[14.6, 40.2], [15, 41.6], [13.6, 42.4], [12.6, 42.8], [12.6, 51.4], [15.6, 52], [16.4, 53.6], [15.4, 54.6]])
        .concat(S.curve([[15.2, 55], [22.6, 57.4], [30, 63], [35.6, 71.6], [38.2, 80.6], [38.6, 84]], false, 6))
        .concat([[40.6, 84.6], [41, 88.4], [39.6, 89]]);
    const TH_BOWL = S.curve([[39.5, 89], [41.4, 90.2], [41.6, 92.6], [40.4, 94]], false, 3)
        .concat([[39.6, 94.6], [39.4, 99.4], [40.6, 100], [40.4, 101.6]])
        .concat(S.curve([[40.2, 102], [38.6, 110], [33.5, 119], [25, 127], [15, 132.4], [10.4, 134.2]], false, 6))
        .concat([[9.4, 135], [9.2, 137.4], [12.4, 138.4], [13.2, 140.2], [12.2, 142], [9.6, 142.8]])
        .concat(S.curve([[9.4, 143.2], [10.8, 148], [16, 153.4], [23.4, 157], [26.6, 158.6]], false, 5))
        .concat([[28.4, 159.2], [29.2, 161], [28.6, 163], [26.8, 163.6]]);
    const TH_PLATE = [[2.4, -137], [3.2, -135.4], [6, -133.8], [12.6, -131.6], [18.4, -128.6], [20.4, -126.2], [20, -124.6], [18.2, -123.8]];
    const GAP = 0.44; // the angle between two piercings of the dome
    // The lid's piercings, in the lid's own coordinates: drawn on the dome's surface (an angle
    // round it and a height), so they narrow towards its flanks as real ones do.
    const lidHoles = () => memo('lidholes', () => {
        const P = profile(TH_LID), at = (lon, y) => [P.at(y) * Math.sin(lon), y], holes = [];
        const drop = (c, yb, yt, wide, pw, kind) => {
            const L = [], R = [];
            for (let i = 0; i <= 14; i++) {
                const t = i / 14, y = yb + (yt - yb) * t, a = wide * Math.pow(Math.sin(Math.PI * Math.pow(t, pw)), 0.85);
                L.push(at(c - a, y));
                R.push(at(c + a, y));
            }
            holes.push({ pts: [...L, ...R.reverse().slice(1, -1)], kind, c });
        };
        // two tiers of flames, a row of punched dots, the lantern's windows
        for (let i = 0; i < 7; i++) drop((i - 3) * GAP + (i === 4 ? 0.012 : 0), 81.8, 66 + (i % 2) * 0.5, 0.15, 0.62, 'flame');
        for (let i = 0; i < 6; i++) drop((i - 2.5) * GAP, 68, 59.2, 0.105, 0.7, 'drop');
        for (let i = 0; i < 6; i++) {
            const c = (i - 2.5) * GAP, pts = [];
            for (let k = 0; k < 10; k++) pts.push(at(c + (Math.cos((k / 10) * TAU) * 1.15) / P.at(80.6), 80.6 + Math.sin((k / 10) * TAU) * 1.15));
            holes.push({ pts, kind: 'dot', c });
        }
        for (let i = 0; i < 5; i++) {
            const c = (i - 2) * 0.52, pts = [at(c - 0.17, 51), at(c - 0.17, 46.4)];
            for (let k = 1; k < 8; k++) pts.push(at(c - 0.17 * Math.cos((k / 8) * Math.PI), 46.4 - 2.3 * Math.sin((k / 8) * Math.PI)));
            pts.push(at(c + 0.17, 46.4), at(c + 0.17, 51));
            holes.push({ pts, kind: 'window', c });
        }
        return holes;
    });
    // old silver: black-blue where a rag never reaches, rubbed pale on every crest
    const tarnish = (rgb, tone, k) => {
        const f = 0.5 + 0.7 * tone;
        rgb[0] += (30 * f - rgb[0]) * k;
        rgb[1] += (30 * f - rgb[1]) * k;
        rgb[2] += (62 * f - rgb[2]) * k;
    };
    const SILVER_SPEC = { amp: 0.75, power: 30, from: 0.5, to: 0.95, color: '#ffffff' };

    function thuribleLid(rot, res, seed) {
        const holes = lidHoles();
        return lathe(`thlid/${seed}`, rot, res, {
            prof: TH_LID, ramp: SILVER, rim: 1, edge: 0.8, under: 0.1,
            cut: (g) => holes.forEach((h) => poly(g, h.pts)),
            bump: (xx, y, r) => {
                const lon = Math.asin(clamp(xx / r, -1, 1));
                let h = 0;
                if (y > 55 && y < 84.4) {
                    // a rib up the dome between every two flames, a chased leaf on each side of it
                    const v = lon / GAP + 0.5, d = (v - Math.round(v)) * GAP * r;
                    h += 1.5 * Math.exp(-(d * d) / 1.3) * smooth(84.4, 82, y);
                } else if (y >= 84.4) h += 0.55 * Math.pow(0.5 + 0.5 * Math.cos(lon * 34), 2) * smooth(84.6, 85.6, y) * smooth(88.6, 87.6, y);
                else if (y < 40) h += 0.8 * Math.pow(Math.abs(Math.cos(lon * 4)), 0.6) * smooth(27, 31, y);
                else if (y > 42.6 && y < 51.6) {
                    const v = lon / 0.52, d = (v - Math.round(v) - 0.5) * 0.52 * r;
                    h += 0.55 * Math.exp(-(d * d) / 0.5);
                }
                return h + 0.1 * S.noise2(xx * 0.6, y * 0.6, 5);
            },
            mottle: { amp: 0.05, freq: 0.08 }, spec: SILVER_SPEC,
            tint: (xx, y, tone, rgb, m, r) => {
                const lon = Math.asin(clamp(xx / r, -1, 1)), n = S.noise2(xx * 0.1, y * 0.1, 41) * 0.6 + S.noise2(xx * 0.33, y * 0.33, 42) * 0.4;
                let k = smooth(0.15, 0.7, n + (0.5 - tone) * 0.5) * 0.3;
                if (y > 55 && y < 84.4) {
                    const v = lon / GAP + 0.5, d = Math.abs(v - Math.round(v)) * GAP * r;
                    k += 0.26 * smooth(0.8, 2.6, d) - 0.4 * smooth(1.4, 0.2, d);
                }
                // the cut edges of the piercings hold the dirt
                k += 0.3 * (1 - m);
                tarnish(rgb, tone, clamp(k, 0, 0.8));
            },
            glaze: (sp) => {
                // soot: every opening has smoked the silver above it, the lantern most of all
                glaze(sp, res, 'multiply', (q) => {
                    q.filter = `blur(${(1.5 * res).toFixed(1)}px)`;
                    for (const h of holes) {
                        const b = S.bbox(h.pts), k = h.kind === 'window' ? 0.6 : h.kind === 'drop' ? 0.34 : h.kind === 'flame' ? 0.12 : 0;
                        if (!k) continue;
                        q.fillStyle = `rgba(34,24,40,${k})`;
                        q.beginPath();
                        q.ellipse(b.x + b.w / 2, b.y - b.h * 0.2, b.w * 0.5, b.h * 0.5, 0, 0, TAU);
                        q.fill();
                    }
                });
                // and the coals light the edges of the lower ones from inside
                glaze(sp, res, 'screen', (q) => {
                    q.filter = `blur(${(0.45 * res).toFixed(1)}px)`;
                    q.lineJoin = 'round';
                    for (const h of holes) {
                        if (h.kind === 'window') continue;
                        strokePts(q, h.pts, h.kind === 'flame' ? 1.5 : 1, h.kind === 'flame' ? 'rgba(255,128,40,0.55)' : 'rgba(210,80,30,0.3)', true);
                    }
                });
            },
            after: (g, { sh, hv, P }) => {
                // turned lines at every moulding
                for (const [yy, a] of [[40.2, 0.9], [42.6, 0.8], [51.8, 0.9], [54.8, 0.9], [84.6, 0.95], [86.6, 0.5]]) {
                    const h = hoop(0, yy, P.at(yy), 0.05);
                    strokePts(g, h, 0.7, `rgba(14,14,40,${a})`);
                    strokePts(g, h.map(([x, y]) => [x, y + 0.75]), 0.4, `rgba(240,244,255,${a * 0.6})`);
                }
                // chasing: a leaf engraved each side of every rib, a line round every flame
                for (let i = -3; i <= 2; i++) {
                    const c = (i + 0.5) * GAP;
                    for (const sg of [-1, 1]) {
                        const leaf = [];
                        for (let k = 0; k <= 8; k++) {
                            const t = k / 8, y = 83 - t * 12;
                            leaf.push([P.at(y) * Math.sin(c + sg * (0.035 + 0.05 * Math.sin(t * Math.PI))), y]);
                        }
                        S.ink(g, leaf, { w: 0.45, color: '#161838', alpha: 0.7, taper: [0.3, 1] });
                    }
                }
                for (const h of lidHoles()) {
                    if (h.kind === 'dot') continue;
                    // the sheet's thickness: the cut edge that faces the lamp is lit
                    const c = [0, 0];
                    for (const p of h.pts) {
                        c[0] += p[0] / h.pts.length;
                        c[1] += p[1] / h.pts.length;
                    }
                    const edge = arcOf(h.pts, (p) => (p[0] - c[0]) * sh[0] + (p[1] - c[1]) * sh[1] > 0.4).map((p) => [p[0] + (p[0] - c[0]) * 0.14, p[1] + (p[1] - c[1]) * 0.1]);
                    if (edge.length > 2) S.ink(g, edge, { w: 0.6, color: '#f6f8ff', alpha: 0.85 });
                }
                // the gleam down the dome, and one on the cupola: fat, with a dash under it
                const gx = (y) => (hv[0] / Math.hypot(hv[0], hv[2])) * P.at(y) * 0.86;
                const streak = (y0, y1, w) => {
                    const line = [];
                    for (let k = 0; k <= 6; k++) line.push([gx(y0 + ((y1 - y0) * k) / 6), y0 + ((y1 - y0) * k) / 6]);
                    S.ink(g, line, { w: w * 2.4, color: '#dfe4f6', alpha: 0.35, taper: [0.7, 0.7] });
                    S.ink(g, line, { w, color: '#ffffff', alpha: 0.95, taper: [0.5, 0.5] });
                };
                streak(58.5, 64.5, 1.3);
                streak(84.9, 88.2, 1.1);
                streak(30.5, 36.5, 1.2);
                streak(44, 50, 0.9);
                // scratches from a lifetime of polishing, round the dome
                const r = Motion.rng('thlid' + seed);
                for (let i = 0; i < 46; i++) {
                    const y = 29 + r() * 59, rr = P.at(y), x = (r() - 0.5) * 2 * rr * 0.9, l = 1 + r() * 3.6;
                    strokePts(g, [[x, y], [x + l, y + (r() - 0.5) * 0.8]], 0.3, r() < 0.5 ? 'rgba(20,20,52,0.4)' : 'rgba(250,252,255,0.5)');
                }
            },
            air: airSilver(5),
        });
    }

    const lobes = (lon) => Math.pow(Math.abs(Math.cos(lon * 6 + 0.25)), 0.55);
    function thuribleBowl(rot, res, seed) {
        return lathe(`thbowl/${seed}`, rot, res, {
            prof: TH_BOWL, ramp: SILVER, under: 0.12,
            bump: (xx, y, r) => {
                const lon = Math.asin(clamp(xx / r, -1, 1));
                let h = 0;
                // gadroons beaten out from inside; beading under the lip; a rope on the foot
                if (y > 101.6 && y < 134.4) h += 2.5 * lobes(lon) * smooth(101.6, 105, y) * smooth(134.4, 128, y);
                else if (y > 94.6 && y < 99.6) h += 0.55 * Math.pow(0.5 + 0.5 * Math.cos(lon * 38), 2) * smooth(96.6, 97.4, y) * smooth(99.4, 98.6, y);
                else if (y > 158.8) h += 0.6 * (0.5 + 0.5 * Math.cos(lon * 34 + (y - 159) * 2.2));
                else if (y > 143 && y < 158.6) h += 0.7 * Math.pow(Math.abs(Math.cos(lon * 5)), 0.6) * smooth(143, 148, y) * smooth(158.6, 156, y);
                // a dent, from the day it was dropped
                h -= 1.5 * Math.exp(-(Math.pow((xx - 15) / 4.2, 2) + Math.pow((y - 119) / 3.4, 2)));
                return h + 0.1 * S.noise2(xx * 0.6, y * 0.6, 6);
            },
            mottle: { amp: 0.05, freq: 0.08 }, spec: SILVER_SPEC,
            tint: (xx, y, tone, rgb, m, r) => {
                const lon = Math.asin(clamp(xx / r, -1, 1)), n = S.noise2(xx * 0.1, y * 0.1, 51) * 0.6 + S.noise2(xx * 0.33, y * 0.33, 52) * 0.4;
                let k = smooth(0.15, 0.7, n + (0.5 - tone) * 0.5) * 0.34;
                if (y > 101.6 && y < 134.4) {
                    const v = lobes(lon);
                    k += 0.62 * Math.pow(1 - v, 1.5) - 0.3 * Math.pow(v, 3);
                }
                tarnish(rgb, tone, clamp(k, 0, 0.8));
            },
            after: (g, { sh, hv, P }) => {
                for (const [yy, a] of [[94.4, 0.95], [100, 0.9], [101.8, 0.6], [134.8, 0.9], [138, 0.9], [142.8, 0.9], [159, 0.95]]) {
                    const h = hoop(0, yy, P.at(yy), 0.05);
                    strokePts(g, h, 0.75, `rgba(14,14,40,${a})`);
                    strokePts(g, h.map(([x, y]) => [x, y + 0.8]), 0.4, `rgba(240,244,255,${a * 0.6})`);
                }
                // the valley between two gadroons, drawn; a light on the crest that faces the lamp
                const lsg = sh[0] >= 0 ? -1 : 1; // which flank of a lobe faces the lamp
                for (let i = -3; i <= 3; i++) {
                    const cv = (Math.PI * (i + 0.5) - 0.25) / 6, cc = (Math.PI * i - 0.25) / 6, val = [], fl = [], dk = [];
                    for (let k = 0; k <= 10; k++) {
                        const y = 103 + k * 3;
                        if (Math.abs(cv) < 1.5) val.push([P.at(y) * Math.sin(cv), y]);
                        if (Math.abs(cc) < 1.4) {
                            fl.push([P.at(y) * Math.sin(cc + lsg * 0.09), y]);
                            dk.push([P.at(y) * Math.sin(cc - lsg * 0.13), y]);
                        }
                    }
                    if (val.length > 2) S.ink(g, val, { w: 0.9, color: '#0c0e2a', alpha: 0.85, taper: [0.4, 0.9] });
                    if (fl.length > 2) {
                        g.save();
                        g.filter = `blur(${(0.7 * res).toFixed(1)}px)`;
                        S.ink(g, fl.slice(0, 9), { w: 2.6, color: '#f4f6ff', alpha: 0.5 * Math.cos(cc), taper: [0.6, 0.9] });
                        S.ink(g, dk.slice(0, 9), { w: 2.2, color: '#14163a', alpha: 0.42, taper: [0.6, 0.9] });
                        g.restore();
                    }
                }
                // two assay punches on the lip, and its engraved wavy line
                for (const [x, w] of [[8, 3.2], [13, 2.4]]) {
                    fillPts(g, [[x, 95.6], [x + w, 95.6], [x + w, 98.4], [x, 98.4]], 'rgba(20,20,52,0.7)');
                    strokePts(g, [[x + w, 95.6], [x + w, 98.4], [x, 98.4]], 0.35, 'rgba(245,248,255,0.8)');
                    disc(g, [x + w / 2, 97], 0.5, 'rgba(190,196,220,0.9)');
                }
                const wave = [];
                for (let k = -38; k <= 38; k++) {
                    const lon = k * 0.04;
                    if (Math.abs(k * 0.04 - 0.27) < 0.2) continue;
                    wave.push([P.at(96) * Math.sin(lon), 95.6 + 0.5 * Math.sin(k * 1.3)]);
                }
                strokePts(g, wave.slice(0, 26), 0.4, 'rgba(18,18,48,0.7)');
                const gx = (y, f = 0.84) => (hv[0] / Math.hypot(hv[0], hv[2])) * P.at(y) * f;
                const streak = (y0, y1, w, f) => {
                    const line = [];
                    for (let k = 0; k <= 6; k++) line.push([gx(y0 + ((y1 - y0) * k) / 6, f), y0 + ((y1 - y0) * k) / 6]);
                    S.ink(g, line, { w: w * 2.4, color: '#dfe4f6', alpha: 0.35, taper: [0.7, 0.7] });
                    S.ink(g, line, { w, color: '#ffffff', alpha: 0.95, taper: [0.5, 0.5] });
                };
                streak(90.4, 93.4, 1.2);
                streak(105, 113, 1.5, 0.8);
                streak(116.5, 119, 1.2, 0.8);
                streak(147, 154, 1.1);
                streak(139, 141.6, 1);
                // the dent's far lip catches the light
                S.ink(g, [[17.5, 116.4], [19, 119], [17.8, 121.6]], { w: 0.7, color: '#f6f8ff', alpha: 0.8 });
                const r = Motion.rng('thbowl' + seed);
                for (let i = 0; i < 36; i++) {
                    const y = 90 + r() * 72, rr = P.at(y), x = (r() - 0.5) * 2 * rr * 0.9, l = 1 + r() * 3;
                    strokePts(g, [[x, y], [x + l, y + (r() - 0.5) * 0.6]], 0.28, r() < 0.6 ? 'rgba(20,20,52,0.4)' : 'rgba(250,252,255,0.4)');
                }
            },
            air: airSilver(6),
        });
    }
    function thuriblePlate(rot, res, seed) {
        return lathe(`thplate/${seed}`, rot, res, {
            prof: TH_PLATE, ramp: SILVER, under: 0.12,
            bump: (xx, y, r) => 0.7 * Math.pow(Math.abs(Math.cos(Math.asin(clamp(xx / r, -1, 1)) * 5)), 0.6) * smooth(-134, -131, y) * smooth(-125, -127.5, y),
            spec: SILVER_SPEC,
            tint: (xx, y, tone, rgb, m, r) => {
                const v = Math.pow(Math.abs(Math.cos(Math.asin(clamp(xx / r, -1, 1)) * 5)), 0.6);
                tarnish(rgb, tone, clamp(0.25 + 0.4 * (1 - v) * smooth(-134, -131, y) + 0.3 * S.noise2(xx * 0.2, y * 0.2, 61), 0, 0.75));
            },
            after: (g, { hv, P }) => {
                for (const yy of [-133.6, -126, -124.4]) strokePts(g, hoop(0, yy, P.at(yy), 0.05), 0.6, 'rgba(14,14,40,0.85)');
                const x = (hv[0] / Math.hypot(hv[0], hv[2])) * 13;
                S.ink(g, [[x, -131.4], [x * 1.2, -128.6]], { w: 1.2, color: '#ffffff', alpha: 0.95, taper: [0.5, 0.5] });
            },
            air: airSilver(3.4),
        });
    }

    function incensario(g, o = {}) {
        const seed = o.seed ?? 'incensario';
        sheet(g, o, { x: -86, y: -166, w: 172, h: 332 }, (q, F) => {
            const res = resOf(q), cs = { blur: 2.2, dx: 1.2, dy: 1.8, color: 'rgba(10,8,30,0.6)' };
            const P = profile(TH_LID), holes = lidHoles();
            const ch = (pts, o2 = {}) => chain(q, F.pts(S.curve(pts, false, 10)), { len: 6.6, w: 1.15, cast: cs, seed: seed + pts[0][0], ...o2 });
            // the chain that runs behind, and the bowl
            ch([[3.6, -123], [6, -60], [8.4, 0], [10, 58]], { phase: 1 });
            stamp(q, F, thuribleBowl(F.rot, res, seed), { lw: 2.3 });
            // the lid: what is seen through its piercings first (the dark of the inside, the
            // coals at the bottom of it), then the pierced silver over that
            const lid = thuribleLid(F.rot, res, seed);
            S.piece(q, F.pts(lid.out), {
                fill: '#140a18', line: 2.3, heavy: 0.8, cast: { blur: 3, dx: 1.6, dy: 2.6, color: 'rgba(10,8,30,0.7)' },
                detail: (d) => {
                    const c = F([0, 93]), gr = d.createRadialGradient(c[0], c[1], 2, c[0], c[1], 44);
                    for (const [u, col] of [[0, '#ffe08a'], [0.2, '#ff9a34'], [0.42, '#d4481e'], [0.66, '#6e1a1e'], [0.86, '#2a0d1a'], [1, '#140a18']]) gr.addColorStop(u, col);
                    fillPts(d, F.pts(lid.out), gr);
                    // coals: lumps with bright cracks, low in the bowl; sparks
                    const r = Motion.rng('coals' + seed);
                    for (let i = 0; i < 26; i++) {
                        const p = F([(r() - 0.5) * 66, 70 + r() * 15]);
                        disc(d, p, 0.5 + r() * 1.3, r() < 0.5 ? 'rgba(60,14,20,0.7)' : 'rgba(255,214,120,0.85)');
                    }
                    stamp(d, F, lid, { lw: 0.85, heavy: 0.5, ink: '#0c0c26' });
                },
            });
            // the lid's finial: a ball, and the loop the fourth chain is hooked into
            ring(q, F([0, 20.6]), 3.3, 3.6, F.rot, 1.3, Ag, 0.8);
            S.cast(q, (c) => disc(c, F([0, 25.6]), 3.6, '#000'), cs);
            bead(q, F([0, 25.6]), 3.5, Ag, 0.9);
            // the lugs on the bowl's rim, the guide rings on the lid's, and the three chains
            for (const sx of [-1, 1]) {
                const lug = F.pts(S.curve([[sx * 40, 89.6], [sx * 44.6, 89.2], [sx * 46.4, 92], [sx * 44.4, 94.6], [sx * 40, 94.2]], true, 4));
                S.piece(q, lug, { fill: Ag.base, line: 1.3, shade: { color: Ag.deep, alpha: 0.85, w: 2.2 }, light: { color: Ag.glint, alpha: 0.9, w: 1.4 }, cast: cs });
                disc(q, F([sx * 43.8, 91.9]), 1.05, '#0c0c26');
                ring(q, F([sx * 44.2, 85.4]), 3.5, 2.1, F.rot + sx * 0.25, 1.2, Ag, 0.75);
            }
            ch([[-17.4, -123.6], [-30, -20], [-43.6, 88.6]], { phase: 0, mend: 13 });
            ch([[17.4, -123.6], [30.4, -20], [43.8, 88.6]], { phase: 1 });
            for (const sx of [-1, 1]) ring(q, F([sx * 44, 90.6]), 2.2, 2.5, F.rot, 1, Ag, 0.7);
            // the fourth chain: slack while the lid is down
            ch([[0.4, -122.6], [-3.6, -86], [-7.6, -44], [-6.4, -8], [-1.6, 12], [0, 17.6]], { len: 5.6, w: 1, phase: 0 });
            // the plate where they gather, the ring it hangs by, and the ring that lifts the lid
            const stem = F.pts([[-2.6, -137], [-2.2, -141.4], [2.2, -141.4], [2.6, -137]]);
            S.piece(q, stem, { fill: Ag.mid, line: 1.2, shade: { color: Ag.deep, alpha: 0.8, w: 1.6 }, light: { color: Ag.glint, alpha: 0.8, w: 1 } });
            stamp(q, F, thuriblePlate(F.rot, res, seed), { lw: 1.8, cast: cs });
            S.cast(q, (c) => strokePts(c, F.pts(S.ellipse(0, -150.6, 10.4, 10.8, 30)), 3, '#000', true), cs);
            ring(q, F([9.8, -139.4]), 5.2, 6, F.rot + 0.5, 1.5, Ag, 0.8);
            ring(q, F([0, -150.6]), 10.4, 10.8, F.rot, 2.7, Ag, 1);
            disc(q, F([0, -140.2]), 1.2, '#0c0c26');
            return (a0) => {
                // smoke: out of the lantern, leaning, folding over, breaking up among the chains
                const a = a0, F0 = F;
                F = upright(F0, [0, 47]);
                smoke(a, F, [[-3, 47], [-9, 30], [-5, 8], [7, -14], [9, -40], [-4, -62], [-16, -78], [-12, -98]], { w0: 3.4, w1: 19, alpha: 0.6, seed: seed + 1, threads: 7, blur: 2 });
                smoke(a, F, [[8, 47], [17, 30], [15, 10], [26, -8], [39, -20], [46, -38], [40, -52]], { w0: 2.6, w1: 14, alpha: 0.46, seed: seed + 2, ph: 2, blur: 1.8 });
                smoke(a, F, [[-25, 61], [-36, 46], [-32, 26], [-44, 8], [-52, -14], [-46, -30]], { w0: 2, w1: 11, alpha: 0.4, seed: seed + 3, ph: 4 });
                smoke(a, F, [[-12, -90], [-24, -104], [-38, -106], [-44, -96], [-38, -88]], { w0: 5, w1: 4, alpha: 0.2, seed: seed + 4, threads: 3 });
                smoke(a, F, [[-2, -60], [10, -76], [24, -80], [30, -70]], { w0: 5, w1: 3, alpha: 0.18, seed: seed + 5, threads: 3 });
            };
        });
    }

    // ------------------------------------------------------------------ worked metal
    // A flat piece of cast or built-up metal: a silhouette with a rounded edge and its relief
    // painted as a height map (white is high: wires, grains, bosses; `zero` is the ground),
    // lit per pixel, then brought back to the emblem manner with the airbrush. `o`:
    //   box, mask(g), paint(q, res, env), zero, depth (units for full white), R (the edge)
    //   ramp, spec, tint(x, y, tone, rgb, m, f), air, glaze(sp, env), after(g, env)
    function relief(key, rot, res, o) {
        const a = snap(rot);
        return memo(`${key}/${a.toFixed(3)}@${res}`, () => {
            const L = S.lightFor(a), sh = local(SD, a), lit = [-sh[0], -sh[1]], hv = halfway(L), env = { L, sh, lit, hv, res };
            const box = even(o.box), zero = o.zero ?? 0, depth = o.depth ?? 1.5, rough = o.rough ?? 0.08;
            const f = o.paint ? field(box, res, (q) => o.paint(q, res, env), o.bg ?? '#000') : () => 0;
            env.f = f;
            const sp = S.form({
                box, res, seed: key, light: L, ramp: o.ramp, soft: 1, inflate: 'bevel', R: o.R ?? 1.2, relief: o.relief ?? 1, smooth: o.smooth ?? 0.002, profile: o.profile,
                mask: o.mask,
                height: (x, y) => (f(x, y) - zero) * depth + rough * S.noise2(x * 0.8, y * 0.8, 3),
                mottle: o.mottle ?? { amp: 0.04, freq: 0.07 }, spec: o.spec,
                tint: o.tint ? (x, y, tone, rgb, m) => o.tint(x, y, tone, rgb, m, f(x, y)) : null,
            });
            for (const a2 of o.air ?? []) sprayIn(sp, res, { ...a2, dir: a2.lit ? lit : sh });
            sp.env = env;
            if (o.glaze) o.glaze(sp, env);
            if (o.after) onto(sp, res, (g) => o.after(g, env));
            return sp;
        });
    }
    // what a height map is drawn with: a round wire, a twisted one, a grain
    const grey = (v) => {
        const c = Math.round(clamp(v) * 255);
        return `rgb(${c},${c},${c})`;
    };
    const wire = (q, pts, w, v = 1, closed = false) => {
        strokePts(q, pts, w, grey(v * 0.6), closed);
        strokePts(q, pts, w * 0.5, grey(v), closed);
    };
    function twist(q, pts, w, v = 1, closed = false) {
        strokePts(q, pts, w, grey(v * 0.5), closed);
        const st = walk(closed ? [...pts, pts[0]] : pts, w * 0.62);
        q.lineCap = 'round';
        for (const m of st) {
            // every turn of the twist: a short slanted stroke across the wire
            const dx = (m.t[0] * 0.7 + m.n[0] * 0.7) * w * 0.34, dy = (m.t[1] * 0.7 + m.n[1] * 0.7) * w * 0.34;
            strokePts(q, [[m.p[0] - dx, m.p[1] - dy], [m.p[0] + dx, m.p[1] + dy]], w * 0.42, grey(v));
        }
    }
    const grain = (q, p, r, v = 1) => {
        const gr = q.createRadialGradient(p[0], p[1], 0, p[0], p[1], r);
        gr.addColorStop(0, grey(v));
        gr.addColorStop(0.55, grey(v * 0.82));
        gr.addColorStop(1, grey(v * 0.3));
        disc(q, p, r, gr);
    };
    // a scroll of wire: from `p`, curling `turns` round its eye at distance `r0`
    const scroll = (p, a, r0, turns = 1.25, dir = 1, n = 22) => {
        const pts = [];
        for (let i = 0; i <= n; i++) {
            const t = i / n, ang = a + dir * t * turns * TAU, rr = r0 * (1 - 0.82 * t);
            pts.push([p[0] + Math.cos(ang) * rr - Math.cos(a) * r0, p[1] + Math.sin(ang) * rr - Math.sin(a) * r0]);
        }
        return pts;
    };

    // ------------------------------------------------------------------ the rosary
    const JET_INK = '#07060f';
    const jetTone = (l) => (l > 0.75 ? S.mix('#8f96c4', '#f6f7ff', (l - 0.75) / 0.25) : l > 0.35 ? S.mix('#2b2d4e', '#8f96c4', (l - 0.35) / 0.4) : l > -0.4 ? S.mix('#0c0b16', '#2b2d4e', (l + 0.4) / 0.75) : l > -0.8 ? '#0b0a14' : S.mix('#0b0a14', '#43386a', clamp((-l - 0.8) / 0.2)));
    // One bead of jet at `p` (on the sheet), its wire along the angle `a`: a ring of cut
    // facets round a table, toned by the way each faces the lamp. Jet is black on a dark
    // ground: the facet that flashes and the one that mirrors the ground carry it.
    function jetBead(g, p, r, a, sd, o = {}) {
        const h = (k) => S.hashI(k, 3, 7, sd), N = 8, a0 = a + (h(1) - 0.5) * 0.7, ri = r * (0.5 + h(2) * 0.12), la = Math.atan2(TOL[1], TOL[0]);
        const O = [], I = [];
        for (let k = 0; k < N; k++) {
            O.push(pol(r * (1 + (h(10 + k) - 0.5) * 0.07), a0 + (k / N) * TAU, p[0], p[1]));
            I.push(pol(ri, a0 + ((k + 0.5) / N) * TAU, p[0] + TOL[0] * r * 0.05, p[1] + TOL[1] * r * 0.05));
        }
        g.save();
        g.translate(SD[0] * 0.5, SD[1] * 0.5);
        fillPts(g, O, JET_INK);
        strokePts(g, O, 1.1, JET_INK, true);
        g.restore();
        strokePts(g, O, 1.1, JET_INK, true);
        let best = 0, bl = -2, worst = 0, wl = 2;
        for (let k = 0; k < N; k++) {
            const l1 = Math.cos(a0 + ((k + 0.5) / N) * TAU - la), l2 = Math.cos(a0 + (k / N) * TAU - la);
            fillPts(g, [O[k], O[(k + 1) % N], I[k]], jetTone(clamp(l1 * 1.1 + 0.08 + (h(20 + k) - 0.5) * 0.6, -1, 1)));
            fillPts(g, [I[(k + N - 1) % N], O[k], I[k]], jetTone(clamp(l2 * 0.62 + (h(30 + k) - 0.5) * 0.9, -1, 1)));
            if (l1 > bl) (bl = l1), (best = k);
            if (l1 < wl) (wl = l1), (worst = k);
        }
        // the table mirrors what is over it: the night at its lit edge, nothing, the ground at the far one
        const t0 = [p[0] + TOL[0] * ri, p[1] + TOL[1] * ri], t1 = [p[0] - TOL[0] * ri, p[1] - TOL[1] * ri], gr = g.createLinearGradient(t0[0], t0[1], t1[0], t1[1]);
        for (const [u, c] of [[0, '#565b8c'], [0.3, '#17172a'], [0.7, '#0a0912'], [1, '#2e2646']]) gr.addColorStop(u, c);
        fillPts(g, I, gr);
        strokePts(g, I, 0.3, 'rgba(120,126,170,0.55)', true);
        for (let k = 0; k < N; k++) strokePts(g, [I[k], O[k]], 0.22, 'rgba(110,116,160,0.35)');
        // the facet that flashes, the point of light on the table's edge, the far facet's bounce
        fillPts(g, [lerpP(O[best], I[best], 0.06), lerpP(O[(best + 1) % N], I[best], 0.06), lerpP(I[best], O[best], 0.04)], 'rgba(250,251,255,0.97)');
        disc(g, lerpP(I[best], I[(best + 1) % N], 0.3), r * 0.12, 'rgba(255,255,255,0.97)');
        if (sd % 3 === 0) disc(g, lerpP(O[(best + 3) % N], p, 0.3), r * 0.07, 'rgba(230,234,255,0.9)');
        fillPts(g, [O[worst], O[(worst + 1) % N], lerpP(I[worst], O[worst], 0.4)], 'rgba(92,78,140,0.6)');
        if (o.chip) {
            // a chip: jet breaks like glass, in a shell
            const k = (best + 3) % N, c = lerpP(O[k], O[(k + 1) % N], 0.5);
            fillPts(g, [O[k], O[(k + 1) % N], lerpP(I[k], c, 0.35)], '#3a3648');
            for (const u of [0.35, 0.6, 0.85]) strokePts(g, [lerpP(c, O[k], u), lerpP(c, lerpP(I[k], c, 0.35), u), lerpP(c, O[(k + 1) % N], u)], 0.25, 'rgba(160,160,190,0.7)');
        }
    }
    // A Paternoster: an open ball of silver filigree, a cap at each pole.
    function filigreeBead(g, p, r, a, sd) {
        const h = (k) => S.hashI(k, 5, 11, sd), ax = [Math.cos(a), Math.sin(a)], nx = [-ax[1], ax[0]];
        for (const sg of [-1, 1]) bead(g, [p[0] + ax[0] * sg * r * 1.02, p[1] + ax[1] * sg * r * 1.02], r * 0.34, Ag, 0.6);
        disc(g, [p[0] + SD[0] * 0.6, p[1] + SD[1] * 0.6], r + 0.8, INK);
        const gr = g.createRadialGradient(p[0] + TOL[0] * r * 0.3, p[1] + TOL[1] * r * 0.3, r * 0.1, p[0], p[1], r);
        gr.addColorStop(0, '#4a4f7c');
        gr.addColorStop(0.6, '#1f2244');
        gr.addColorStop(1, '#0c0d24');
        disc(g, p, r, gr);
        g.save();
        g.beginPath();
        g.arc(p[0], p[1], r, 0, TAU);
        g.clip();
        // scrolls in facing pairs each side of the girdle, drawn as wire: a shade under, a light on
        const curls = [];
        for (const sg of [-1, 1]) {
            for (let k = -1; k <= 1; k++) {
                const c = [p[0] + ax[0] * sg * r * 0.5 + nx[0] * k * r * 0.62, p[1] + ax[1] * sg * r * 0.5 + nx[1] * k * r * 0.62];
                curls.push(scroll(c, a + (sg > 0 ? 0 : Math.PI) + (h(k + 3 + sg) - 0.5) * 0.5, r * (0.3 - 0.05 * Math.abs(k)), 1.2, k >= 0 ? 1 : -1, 14).map(([x, y]) => [x + ax[0] * sg * r * 0.3, y + ax[1] * sg * r * 0.3]));
            }
        }
        for (const c of curls) strokePts(g, c.map(([x, y]) => [x + SD[0] * 0.35, y + SD[1] * 0.35]), 0.7, 'rgba(8,8,30,0.8)');
        for (const c of curls) {
            strokePts(g, c, 0.62, Ag.base);
            strokePts(g, c.map(([x, y]) => [x + TOL[0] * 0.12, y + TOL[1] * 0.12]), 0.26, Ag.glint);
        }
        // the girdle: a line of grains
        for (let k = -3; k <= 3; k++) {
            const c = [p[0] + nx[0] * k * r * 0.29, p[1] + nx[1] * k * r * 0.29];
            disc(g, [c[0] + SD[0] * 0.3, c[1] + SD[1] * 0.3], r * 0.15, 'rgba(8,8,30,0.85)');
            bead(g, c, r * 0.13, Ag, 0);
        }
        // it is a ball: shade round its far side, light on its near
        const ball = S.ellipse(p[0], p[1], r, r, 24);
        S.spray(g, ball, { color: '#0c0d28', alpha: 0.8, w: r * 0.7 });
        S.spray(g, ball, { color: '#f4f6ff', alpha: 0.5, w: r * 0.4, dir: TOL });
        g.restore();
        disc(g, [p[0] + TOL[0] * r * 0.5, p[1] + TOL[1] * r * 0.5], r * 0.14, 'rgba(255,255,255,0.9)');
    }
    // the wire's eyes between two beads: two tiny rings hooked into each other
    const eye = (g, p, r = 1.15) => {
        strokePts(g, S.ellipse(p[0] + SD[0] * 0.25, p[1] + SD[1] * 0.25, r, r, 10), 1.25, INK, true);
        strokePts(g, S.ellipse(p[0], p[1], r, r, 10), 0.6, Ag.base, true);
        disc(g, [p[0] + TOL[0] * r, p[1] + TOL[1] * r], 0.28, Ag.glint);
    };

    // The cross: trefoil ends, a raised border, a rosette at the crossing, rays in the angles.
    // Its own coordinates: the crossing at the origin, the long arm along +y.
    const CROSS = (() => {
        const HW = 3.7, LOBE = 3, ARMS = [[33, 0], [16.4, Math.PI / 2], [18.4, Math.PI], [16.4, -Math.PI / 2]];
        const lobes = (len) => [[0, len + 0.4], [HW + 0.3, len - 3.5], [-HW - 0.3, len - 3.5]];
        const rays = [];
        for (let k = 0; k < 4; k++) {
            const a = Math.PI / 4 + (k * Math.PI) / 2;
            for (const [da, len] of [[-0.32, 7.6], [0, 10.4], [0.32, 7.6]]) rays.push([pol(3.4, a + da - 0.2), pol(len, a + da), pol(3.4, a + da + 0.2)]);
        }
        return { HW, LOBE, ARMS, lobes, rays };
    })();
    function crossSprite(rot, res, seed) {
        const { HW, LOBE, ARMS, lobes, rays } = CROSS;
        return relief(`cross/${seed}`, rot, res, {
            box: { x: -24, y: -26, w: 48, h: 68 }, ramp: SILVER, R: 0.8, relief: 0.9, zero: 0.4, depth: 1.3, spec: SILVER_SPEC,
            mask: (g) => {
                for (const [len, a] of ARMS) {
                    poly(g, [[-HW * 0.92, 0], [HW * 0.92, 0], [HW, len - 2], [-HW, len - 2]].map((q) => rotP(q, a)));
                    for (const c of lobes(len)) {
                        const p = rotP(c, a);
                        g.beginPath();
                        g.arc(p[0], p[1], LOBE, 0, TAU);
                        g.fill();
                    }
                }
                for (const r of rays) poly(g, r);
                g.beginPath();
                g.arc(0, 0, 5.6, 0, TAU);
                g.fill();
            },
            paint: (q) => {
                q.fillStyle = grey(0.4);
                q.fillRect(-30, -30, 60, 80);
                q.filter = `blur(${(0.2 * res).toFixed(2)}px)`;
                for (const [len, a] of ARMS) {
                    const P = (x, y) => rotP([x, y], a);
                    // a sunk panel along the arm, a twisted wire down its middle
                    strokePts(q, [P(0, 6.4), P(0, len - 5)], HW * 2 - 2.6, grey(0.1));
                    twist(q, [P(0, 6.8), P(0, len - 5.6)], 1.3, 0.8);
                    // every lobe turned like a button: a groove, a boss
                    for (const c of lobes(len)) {
                        strokePts(q, S.ellipse(...P(...c), 1.75, 1.75, 16), 0.6, grey(0.12), true);
                        grain(q, P(...c), 0.95, 0.85);
                    }
                }
                for (const r of rays) strokePts(q, [lerpP(r[0], r[2], 0.5), r[1]], 0.8, grey(0.8));
                // the rosette at the crossing: a boss in a ring of eight petals, in a sunk round
                disc(q, [0, 0], 4.5, grey(0.14));
                for (let k = 0; k < 8; k++) grain(q, pol(2.9, (k / 8) * TAU + 0.2), 1.2, 0.8);
                grain(q, [0, 0], 1.8, 1);
            },
            tint: (x, y, tone, rgb, m, f) => {
                const n = S.noise2(x * 0.2, y * 0.2, 71);
                tarnish(rgb, tone, clamp(0.1 + 0.7 * smooth(0.36, 0.12, f) + 0.22 * n - 0.3 * smooth(0.6, 0.9, f), 0, 0.88));
            },
            after: (g, { sh }) => {
                // the panels' edges cut clean; a maker's punch; the wear of fingers
                for (const [len, a] of ARMS) {
                    const P = (x, y) => rotP([x, y], a), w = HW - 1.3;
                    const panel = [P(-w, 6.4), P(w, 6.4), P(w, len - 5), P(-w, len - 5)];
                    strokePts(g, panel, 0.4, 'rgba(10,10,36,0.85)', true);
                    strokePts(g, panel.map(([x, y]) => [x + sh[0] * 0.45, y + sh[1] * 0.45]), 0.25, 'rgba(245,248,255,0.55)', true);
                    for (const c of lobes(len)) strokePts(g, S.ellipse(...P(...c), 1.75, 1.75, 16), 0.3, 'rgba(10,10,36,0.7)', true);
                }
                strokePts(g, S.ellipse(0, 0, 4.5, 4.5, 24), 0.4, 'rgba(10,10,36,0.85)', true);
                fillPts(g, [[-1.2, 28.4], [1.2, 28.4], [1.2, 30.4], [-1.2, 30.4]], 'rgba(14,14,44,0.75)');
                strokePts(g, [[1.2, 28.4], [1.2, 30.4], [-1.2, 30.4]], 0.25, 'rgba(245,248,255,0.8)');
                const r = Motion.rng('cross' + seed);
                for (let i = 0; i < 30; i++) {
                    const a = r() < 0.6 ? 0 : Math.PI / 2, u = (r() - 0.3) * 36, v = (r() - 0.5) * 6, p = rotP([v, u], a), l = 0.8 + r() * 2.2;
                    strokePts(g, [p, [p[0] + l, p[1] + (r() - 0.5)]], 0.22, r() < 0.5 ? 'rgba(14,14,44,0.45)' : 'rgba(250,252,255,0.55)');
                }
            },
            air: airSilver(2.4),
        });
    }
    // The centre: a filigree heart, three rings. Its own coordinates: rings at (±6.6, -9.4) and (0, 11.6).
    const HEART = S.curve([[0, -5.4], [3.4, -9.6], [7.8, -9.4], [9.8, -5], [8.4, 0.6], [4.4, 6], [0, 9.8], [-4.4, 6], [-8.4, 0.6], [-9.8, -5], [-7.8, -9.4], [-3.4, -9.6]], true, 6);
    function heartSprite(rot, res, seed) {
        const holes = [];
        for (const sx of [-1, 1]) {
            holes.push(S.curve([[sx * 2.2, -3.6], [sx * 4.4, -6.2], [sx * 6.4, -4.4], [sx * 4.6, -1.8]], true, 4));
            holes.push(S.curve([[sx * 2.6, 2.2], [sx * 5.4, 0.6], [sx * 4.4, 3.4]], true, 4));
        }
        return relief(`heart/${seed}`, rot, res, {
            box: { x: -12, y: -12, w: 24, h: 24 }, ramp: SILVER, R: 0.9, zero: 0.2, depth: 1.5, spec: SILVER_SPEC,
            mask: (g) => {
                poly(g, HEART);
                cut(g, (q) => holes.forEach((h) => poly(q, h)));
            },
            paint: (q) => {
                q.fillStyle = grey(0.2);
                q.fillRect(-14, -14, 28, 28);
                q.filter = `blur(${(0.18 * res).toFixed(2)}px)`;
                twist(q, HEART.map(([x, y]) => [x * 0.9, y * 0.9 - 0.1]), 1.25, 0.9, true);
                for (const sx of [-1, 1]) {
                    wire(q, scroll([sx * 0.6, 6], -Math.PI / 2 + sx * 0.2, 4.6, 1.1, sx, 20).map(([x, y]) => [x + sx * 3.8, y - 4]), 0.8, 0.85);
                    wire(q, scroll([sx * 1, 6.6], Math.PI / 2 - sx * 0.3, 2.2, 1, -sx, 14).map(([x, y]) => [x + sx * 2, y - 3.6]), 0.7, 0.8);
                    for (const [x, y] of [[sx * 7.4, -6.4], [sx * 6.6, 1.6], [sx * 2.4, 6.2]]) grain(q, [x, y], 0.75, 0.95);
                }
                // the boss: a dome in a ring of grains
                for (let k = 0; k < 9; k++) grain(q, pol(2.7, (k / 9) * TAU, 0, -0.6), 0.62, 0.9);
                grain(q, [0, -0.6], 2, 1);
                grain(q, [0, 7.6], 0.9, 0.9);
            },
            tint: (x, y, tone, rgb, m, f) => tarnish(rgb, tone, clamp(0.12 + 0.7 * smooth(0.36, 0.14, f) - 0.25 * smooth(0.6, 0.95, f), 0, 0.85)),
            air: airSilver(2),
        });
    }

    // Where every bead lies. The string is laid down loosely: it sags, kinks, runs straight.
    const rosaryLayout = (seed) => memo('rosary/' + seed, () => {
        const r = Motion.rng('rosary/' + seed);
        const M = [3, 21], Mrot = 0.12, FM = frame(M[0], M[1], Mrot);
        const loop = walk(S.curve([FM([-6.6, -9.4]), [-10, 8], [-24, 20], [-46, 27], [-70, 22], [-87, 5], [-93, -20], [-104, -50], [-99, -86], [-78, -111], [-52, -121], [-24, -135], [8, -129], [36, -133], [66, -118], [83, -93], [101, -68], [99, -37], [89, -9], [66, 11], [45, 11], [24, 14], FM([6.6, -9.4])], false, 14), 0.5);
        const L = loop[loop.length - 1].s, P = 2.3, G = 1.15, p = L / (50 + 4 * P + 2 * G);
        const at = (st, s, off = 0) => {
            const m = st[Math.max(0, Math.min(st.length - 1, Math.round(s / 0.5)))];
            return { p: [m.p[0] + m.n[0] * off, m.p[1] + m.n[1] * off], a: Math.atan2(m.t[1], m.t[0]) };
        };
        const beads = [], links = [];
        // along a string: beads at their places, the wire's eyes between them
        const string = (st, seq, s0) => {
            let s = s0, prev = null;
            seq.forEach((kind, i) => {
                const big = kind === 'P', w = (big ? P : 1) * p, c = s + w / 2 + (big ? 0 : (r() - 0.5) * 0.9), b = at(st, c, (r() - 0.5) * (big ? 0.6 : 1.3));
                b.kind = kind;
                b.r = big ? p * 0.5 : p * (0.345 + (r() - 0.5) * 0.03);
                b.s = c;
                b.id = beads.length;
                beads.push(b);
                links.push([prev ? prev.s + prev.r : s0 - G * p * 0.9, c - b.r, st]);
                prev = b;
                s += w;
            });
            links.push([prev.s + prev.r, s + G * p * 0.9, st]);
            return s;
        };
        const seq = [];
        for (let d = 0; d < 5; d++) {
            for (let i = 0; i < 10; i++) seq.push('A');
            if (d < 4) seq.push('P');
        }
        string(loop, seq, G * p);
        // the pendant: one large, three small, one large, then the cross
        const pend = walk(S.curve([FM([0, 11.6]), [8, 40], [12, 52], [5, 63], [-9, 68], [-22, 74], [-33, 84], [-40, 96]], false, 14), 0.5);
        const end = string(pend, ['P', 'A', 'A', 'A', 'P'], G * p * 0.8) + G * p * 0.5, e = at(pend, end);
        // one bead was replaced by a larger one, one is chipped
        beads[17].r *= 1.14;
        beads[33].chip = true;
        beads[41].chip = true;
        return { M, Mrot, loop, pend, beads, links, p, at, cross: e };
    });

    function rosario(g, o = {}) {
        const seed = o.seed ?? 'rosario';
        sheet(g, o, { x: -112, y: -142, w: 224, h: 284 }, (q, F) => {
            const res = resOf(q), Y = rosaryLayout(seed), cs = { blur: 1.6, dx: 0.9, dy: 1.3, color: 'rgba(8,6,24,0.6)' };
            // the wire: an eye at each end of every bead, hooked into the next; a short chain each side of a large bead
            for (const [s0, s1, st] of Y.links) {
                const n = Math.max(2, Math.round((s1 - s0) / 2.1));
                for (let k = 0; k < n; k++) eye(q, F(Y.at(st, s0 + ((s1 - s0) * (k + 0.5)) / n).p), Math.min(1.25, ((s1 - s0) / n) * 0.62));
            }
            // the centre and the cross
            const FM = F.sub(Y.M[0], Y.M[1], Y.Mrot);
            for (const c of [[-6.6, -9.4], [6.6, -9.4], [0, 11.6]]) ring(q, FM(c), 1.9, 1.9, 0, 0.8, Ag, 0.6);
            stamp(q, FM, heartSprite(FM.rot, res, seed), { lw: 1.1, heavy: 0.7, cast: cs });
            const ca = Y.cross.a - Math.PI / 2 + 0.16, FC = F.sub(Y.cross.p[0], Y.cross.p[1], ca).sub(0, 26.4);
            ring(q, FC([0, -23.6]), 2.4, 2.4, 0, 0.9, Ag, 0.6);
            stamp(q, FC, crossSprite(FC.rot, res, seed), { lw: 1.4, heavy: 0.8, cast: cs });
            ring(q, FC([0, -21.2]), 1.5, 2, FC.rot, 0.8, Ag, 0.55);
            // the beads, far ones first so each lies on its neighbour's shadow
            const list = Y.beads.map((b) => ({ ...b, w: F(b.p) })).sort((b1, b2) => dot2(b1.w, SD) - dot2(b2.w, SD));
            for (const b of list) {
                S.cast(q, (c) => disc(c, b.w, b.r, '#000'), cs);
                if (b.kind === 'P') filigreeBead(q, b.w, b.r, b.a + F.rot, S.seedOf(seed + b.id));
                else jetBead(q, b.w, b.r, b.a + F.rot, S.seedOf(seed + b.id), b);
            }
        });
    }

    // ------------------------------------------------------------------ the Hanukkah lamp
    // The back plate, in its own coordinates (the anchor at the origin): a gable over a
    // pierced arcade. Everything that is an opening is listed here once, for the mask (real
    // holes), the relief round them and the drawing on top.
    const LAMP = (() => {
        const W = 86, EAVE = -18, APEX = -97, FOOT = 66, ROSE = [0, -50], PITCH = 23;
        const merlon = (sx) => [[sx * 86, EAVE], [sx * 86, EAVE - 6], [sx * 83, EAVE - 6], [sx * 83, EAVE - 12], [sx * 79.4, EAVE - 12], [sx * 79.4, EAVE - 6], [sx * 76, EAVE - 6]];
        const gable = (sx, t) => [sx * W * (1 - t) * 0.86, EAVE - 6 + (APEX - EAVE + 6) * t];
        // cast by hand in a sand mould: the outline wanders a hair
        const wob = (pts, k = 0.5) => pts.map(([x, y], i) => [x + k * S.noise2(i * 0.9, 1.5, 81), y + k * S.noise2(i * 0.9, 7.5, 82)]);
        const out = wob([[-W, FOOT], ...merlon(-1), gable(-1, 0.05), gable(-1, 0.94), [0, APEX - 2], gable(1, 0.94), gable(1, 0.05), ...merlon(1).reverse(), [W, FOOT]], 0.35);
        const knobs = [];
        for (const sx of [-1, 1]) for (const t of [0.2, 0.42, 0.64, 0.84]) knobs.push([...gable(sx, t).map((v, i) => v + (i ? -1.3 : sx * 1.6)), 3.1]);
        // openings
        const holes = [];
        const arches = [];
        for (let i = 0; i < 7; i++) {
            const cx = (i - 3) * PITCH + 0.5 * S.noise2(i * 1.7, 2, 83), jw = 6.5 + 0.3 * S.noise2(i * 2.1, 3, 84), cy = 18.6, R = 8.5, pts = [[cx - jw, 50], [cx - jw, 23.6]];
            // a horseshoe: the arc runs on past the half circle, wider than its jambs
            const a0 = Math.PI - Math.asin((23.6 - cy) / R) + 0.0;
            for (let k = 0; k <= 22; k++) {
                const a = a0 + ((3 * Math.PI - 2 * (a0 - Math.PI) - a0 + Math.PI - Math.PI) * k) / 22;
                pts.push([cx + Math.cos(a) * R, cy + Math.sin(a) * R]);
            }
            pts.push([cx + jw, 23.6], [cx + jw, 50]);
            arches.push({ cx, jw, cy, R, pts });
            holes.push(pts);
        }
        // the rose: eight petals round a lobed eye
        const petals = [];
        for (let k = 0; k < 8; k++) {
            const a = (k / 8) * TAU + 0.02, L = [], Rr = [];
            for (let i = 0; i <= 10; i++) {
                const t = i / 10, rr = 9.8 + t * 11.4, wd = 0.33 * Math.pow(Math.sin(Math.PI * Math.pow(t, 0.75)), 0.8) * (9 / rr) * 1.75;
                L.push(pol(rr, a - wd, ROSE[0], ROSE[1]));
                Rr.push(pol(rr, a + wd, ROSE[0], ROSE[1]));
            }
            const pts = [...L, ...Rr.reverse().slice(1, -1)];
            petals.push(pts);
            holes.push(pts);
        }
        const eyeHole = [];
        for (let i = 0; i < 48; i++) {
            const a = (i / 48) * TAU;
            eyeHole.push(pol(4.2 + 1.3 * Math.abs(Math.cos(a * 3)), a, ROSE[0], ROSE[1]));
        }
        holes.push(eyeHole);
        // two quatrefoils beside the rose, a small round over it, the loop's eye
        const quatre = (cx, cy, r) => {
            const pts = [];
            for (let i = 0; i < 40; i++) {
                const a = (i / 40) * TAU;
                pts.push(pol(r * (0.62 + 0.38 * Math.abs(Math.cos(a * 2))), a + Math.PI / 4, cx, cy));
            }
            return pts;
        };
        holes.push(quatre(-41, -34, 5.6), quatre(41.4, -34, 5.4), S.ellipse(0, -81, 2.6, 2.6, 16), S.ellipse(0, APEX - 9.4, 4.1, 4.4, 20));
        // ring-and-dot punches: along the gable, in the spandrels, round the rose
        const punches = [];
        for (const sx of [-1, 1]) for (let k = 0; k < 9; k++) punches.push(gable(sx, 0.09 + k * 0.096).map((v, i) => v + (i ? 7.4 : -sx * 4.6)));
        for (let i = 0; i < 8; i++) punches.push([(i - 3.5) * PITCH, 9.6 + (i % 2) * 0.6]);
        for (let k = 0; k < 12; k++) punches.push(pol(29.6, (k / 12) * TAU + 0.26, ROSE[0], ROSE[1]));
        for (const sx of [-1, 1]) punches.push([sx * 62, -28], [sx * 55, -22.6], [sx * 69, -22.6], [sx * 22, -72], [sx * 30, -24.6]);
        // pans: a row of eight on the bench; the servant apart
        const pan = (cx, cy, sd, k = 1) => {
            const j = (n) => (S.hashI(n, 9, 2, sd) - 0.5) * 1.1, sk = (S.hashI(1, 9, 3, sd) - 0.5) * 1.6;
            const base = [[-8.4, -1.5], [-6.8, -5.6], [0, -7], [6.8, -5.6], [8.4, -1.5], [6, 3.6], [2.3, 7.6], [1.5, 11.6], [0, 12.7], [-1.5, 11.6], [-2.3, 7.6], [-6, 3.6]];
            const pts = base.map(([x, y], n) => [cx + (x + j(n) * 0.6 + (y > 6 ? sk * (y - 6) * 0.12 : 0)) * k, cy + (y + j(n + 20) * 0.5) * k]);
            return { c: [cx, cy], out: S.curve(pts, true, 5), inn: S.curve(pts.map(([x, y]) => [cx + (x - cx) * 0.74, cy + (y - cy) * 0.78 + 0.5 * k]), true, 5), tip: [cx + sk * 0.8 * k, cy + 12 * k], k };
        };
        const pans = [];
        for (let i = 0; i < 8; i++) pans.push(pan((i - 3.5) * 20.7, 61, 300 + i));
        const servant = pan(0, 0, 399, 1.08);
        return { W, EAVE, APEX, FOOT, ROSE, PITCH, out, knobs, holes, arches, petals, eyeHole, punches, pans, servant, gable };
    })();
    // cast brass, long handled: brown where it is dull, green where damp has sat
    const patina = (x, y, tone, rgb, low, edge, seed = 90) => {
        const n = S.noise2(x * 0.07, y * 0.07, seed) * 0.6 + S.noise2(x * 0.24, y * 0.24, seed + 1) * 0.4, f = 0.42 + 0.75 * tone;
        const k = clamp(smooth(-0.05, 0.6, n + (0.5 - tone) * 0.4) * 0.5 + low * 0.5, 0, 0.8);
        rgb[0] += (92 * f - rgb[0]) * k;
        rgb[1] += (64 * f - rgb[1]) * k;
        rgb[2] += (58 * f - rgb[2]) * k;
        // verdigris
        const v = S.noise2(x * 0.11 + 9, y * 0.11, seed + 2) * 0.55 + S.noise2(x * 0.5, y * 0.5, seed + 3) * 0.45;
        const kv = smooth(0.42, 0.78, v * 0.6 + edge * 0.75 + low * 0.3) * 0.82, fv = 0.55 + 0.6 * tone;
        rgb[0] += (78 * fv - rgb[0]) * kv;
        rgb[1] += (158 * fv - rgb[1]) * kv;
        rgb[2] += (140 * fv - rgb[2]) * kv;
        // casting pits
        const cx = Math.floor(x / 2.1), cy = Math.floor(y / 2.1), h = S.hashI(cx, cy, 3, seed);
        if (h > 0.9) {
            const px = (cx + 0.25 + 0.5 * S.hashI(cx, cy, 4, seed)) * 2.1, py = (cy + 0.25 + 0.5 * S.hashI(cx, cy, 5, seed)) * 2.1, rr = 0.18 + 0.4 * S.hashI(cx, cy, 6, seed);
            const p = smooth(rr, rr * 0.4, Math.hypot(x - px, y - py)) * 0.6;
            rgb[0] *= 1 - p;
            rgb[1] *= 1 - p;
            rgb[2] *= 1 - p * 0.8;
        }
    };
    const BRASS_SPEC = { amp: 0.6, power: 24, from: 0.5, to: 0.95, color: '#fff3c4' };

    function lampPlate(rot, res, seed) {
        const { W, EAVE, APEX, FOOT, ROSE, out, knobs, holes, arches, petals, punches, gable } = LAMP;
        const r = Motion.rng('lamp' + seed);
        // the band where a verse would be chiselled: strokes with the pace of script, no letters
        const script = [];
        for (let x = -74; x < 74; ) {
            const w = 2 + r() * 2.6, n = 1 + Math.floor(r() * 2.4);
            if (r() < 0.8) script.push([[x, -15.6 + r() * 0.5], [x + w, -15.6 + r() * 0.5]]);
            for (let k = 0; k < n; k++) {
                const sx = x + r() * w, len = 2.2 + r() * 3.4, lean = (r() - 0.5) * 1.2;
                script.push([[sx, -15.4], [sx + lean, -15.4 + len]]);
                if (r() < 0.3) script.push([[sx + lean, -15.4 + len], [sx + lean + (r() - 0.3) * 2, -15.4 + len + 0.3]]);
            }
            x += w + (r() < 0.16 ? 3 : 1.1);
        }
        const strip = [[-86, 18], [-66, 9]]; // the crack's mend
        return relief(`lamp/${seed}`, rot, res, {
            box: { x: -92, y: APEX - 22, w: 184, h: FOOT - APEX + 28 }, ramp: BRASS, R: 1.5, relief: 0.9, zero: 0.36, depth: 1.7, spec: BRASS_SPEC, rough: 0.12,
            mask: (g) => {
                poly(g, out);
                for (const [x, y, rr] of knobs) {
                    g.beginPath();
                    g.arc(x, y, rr, 0, TAU);
                    g.fill();
                }
                // the hanging loop, cast in one with the apex
                g.beginPath();
                g.ellipse(0, APEX - 9, 9, 9.6, 0, 0, TAU);
                g.fill();
                cut(g, (q) => holes.forEach((h) => poly(q, h)));
            },
            paint: (q) => {
                q.fillStyle = grey(0.36);
                q.fillRect(-100, APEX - 30, 200, 220);
                q.filter = `blur(${(0.16 * res).toFixed(2)}px)`;
                // mouldings: a rope inside the outline, an archivolt round every arch, the rose's rings
                const inset = [[-W + 4, FOOT - 3], [-W + 4, EAVE - 1], gable(-1, 0.06).map((v, i) => v + (i ? 6.4 : 4)), [0, APEX + 8.4], gable(1, 0.06).map((v, i) => v + (i ? 6.4 : -4)), [W - 4, EAVE - 1], [W - 4, FOOT - 3]];
                twist(q, inset, 1.7, 0.78);
                wire(q, inset.map(([x, y]) => [x * 0.955, y * 0.955 + (y < EAVE ? 1.2 : 0)]).slice(1, 6), 0.8, 0.62);
                for (const a of arches) {
                    strokePts(q, a.pts, 3.6, grey(0.62));
                    strokePts(q, a.pts, 1.4, grey(0.82));
                    // the colonnette between this arch and the next: capital, shaft, base
                }
                for (let i = 0; i <= 7; i++) {
                    const x = (i - 3.5) * LAMP.PITCH;
                    strokePts(q, [[x, 26], [x, 48]], 3.4, grey(0.66));
                    strokePts(q, [[x, 27], [x, 47]], 1.3, grey(0.88));
                    fillPts(q, [[x - 3.6, 21.4], [x + 3.6, 21.4], [x + 2.4, 26], [x - 2.4, 26]], grey(0.86));
                    fillPts(q, [[x - 3, 47], [x + 3, 47], [x + 3.9, 50.6], [x - 3.9, 50.6]], grey(0.8));
                }
                wire(q, [[-W + 5, 52.6], [W - 5, 52.6]], 1.6, 0.8);
                wire(q, S.ellipse(ROSE[0], ROSE[1], 24.6, 24.6, 60), 2, 0.9, true);
                wire(q, S.ellipse(ROSE[0], ROSE[1], 26.8, 26.8, 60), 0.8, 0.6, true);
                wire(q, S.ellipse(ROSE[0], ROSE[1], 7.6, 7.6, 30), 1.3, 0.85, true);
                for (const pt of petals) strokePts(q, pt, 1.3, grey(0.72), true);
                // the verse band: two lines, the strokes sunk between them
                wire(q, [[-78, -18.6], [78, -18.6]], 0.9, 0.7);
                wire(q, [[-78, -7.6], [78, -7.6]], 0.9, 0.7);
                q.lineCap = 'butt';
                for (const st of script) strokePts(q, st, 0.72, grey(0.04));
                // punches: a ring struck round a dot
                for (const [x, y] of punches) {
                    strokePts(q, S.ellipse(x, y, 1.9, 1.9, 14), 0.62, grey(0.06), true);
                    disc(q, [x, y], 0.55, grey(0.04));
                }
                // the mend: a strip let in over the crack, two rivets
                strokePts(q, strip, 5.4, grey(0.74));
                for (const u of [0.18, 0.82]) grain(q, lerpP(strip[0], strip[1], u), 1.5, 1);
                for (const sx of [-1, 1]) for (const y of [58, 63]) grain(q, [sx * 80, y], 1.3, 0.95);
            },
            tint: (x, y, tone, rgb, m, f) => patina(x, y, tone, rgb, smooth(0.34, 0.05, f), (1 - m) * (y > -100 ? 1 : 0.3)),
            glaze: (sp) => {
                // verdigris: green has crept out of every corner where damp sits
                glaze(sp, res, 'source-over', (q) => {
                    const rv = Motion.rng('verdigris' + seed);
                    q.filter = `blur(${(0.9 * res).toFixed(1)}px)`;
                    const blot = (x, y, rad, a) => {
                        for (let k = 0; k < 6; k++) disc(q, [x + (rv() - 0.5) * rad * 1.5, y + (rv() - 0.5) * rad * 1.5], rad * (0.3 + rv() * 0.5), `rgba(${70 + Math.round(rv() * 30)},${150 + Math.round(rv() * 24)},${128 + Math.round(rv() * 26)},${(a * (0.5 + rv() * 0.5)).toFixed(3)})`);
                    };
                    for (const ar of arches) {
                        for (const sx of [-1, 1]) {
                            blot(ar.cx + sx * (ar.jw + 1), 50, 2.6, 0.5 + rv() * 0.3);
                            if (rv() < 0.6) blot(ar.cx + sx * (ar.jw + 1.4), 25, 2, 0.45);
                        }
                    }
                    for (const pt of petals) blot(pt[10][0], pt[10][1], 2.2, 0.35 + rv() * 0.3);
                    for (const sx of [-1, 1]) {
                        blot(sx * 81, 60, 5, 0.6);
                        blot(sx * 81, EAVE - 3, 3.4, 0.55);
                        blot(sx * 44, -34, 3, 0.4);
                    }
                    for (let i = 0; i < 9; i++) blot((rv() - 0.5) * 150, 53 + rv() * 8, 3, 0.4);
                    blot(-76, 15, 4, 0.5);
                    blot(0, APEX - 9, 5, 0.3);
                });
                // soot: every spout has licked the plate above it, the first night's side most
                glaze(sp, res, 'multiply', (q) => {
                    q.filter = `blur(${(2.6 * res).toFixed(1)}px)`;
                    LAMP.pans.forEach((pn, i) => {
                        const k = 0.26 + 0.08 * i + (i === 7 ? 0.2 : 0);
                        for (const [h, w, a] of [[34, 6, k], [20, 4.4, k * 0.9], [56, 3.4, k * 0.55]]) {
                            q.fillStyle = `rgba(26,16,30,${a.toFixed(3)})`;
                            q.beginPath();
                            q.ellipse(pn.tip[0] + 0.03 * h * (i - 3.5), 60 - h * 0.5, w, h * 0.55, 0, 0, TAU);
                            q.fill();
                        }
                    });
                });
            },
            after: (g, { sh }) => {
                const rr = Motion.rng('lampafter' + seed);
                // file marks: the founder dressed the plate in patches, each with its own slant
                for (let i = 0; i < 26; i++) {
                    const cx = (rr() - 0.5) * 160, cy = APEX + 22 + rr() * (FOOT - APEX - 26), a = rr() * Math.PI, n = 5 + Math.floor(rr() * 7), len = 5 + rr() * 9;
                    if (Math.abs(cx) > W * (1 - Math.max(0, (EAVE - cy) / (EAVE - APEX))) * 0.8) continue;
                    for (let k = 0; k < n; k++) {
                        const ox = -Math.sin(a) * k * 0.8, oy = Math.cos(a) * k * 0.8, l = len * (0.6 + rr() * 0.4);
                        strokePts(g, [[cx + ox, cy + oy], [cx + ox + Math.cos(a) * l, cy + oy + Math.sin(a) * l]], 0.24, rr() < 0.55 ? 'rgba(56,30,30,0.5)' : 'rgba(255,238,178,0.5)');
                    }
                }
                // the cut edges of every opening: dark where they turn from the lamp, a bright arris opposite
                for (const h of holes) {
                    const c = [0, 0];
                    for (const p of h) {
                        c[0] += p[0] / h.length;
                        c[1] += p[1] / h.length;
                    }
                    const side = (sgn) => arcOf(h, (p) => sgn * ((p[0] - c[0]) * sh[0] + (p[1] - c[1]) * sh[1]) > 0.5).map((p) => {
                        const l = Math.hypot(p[0] - c[0], p[1] - c[1]) || 1;
                        return [p[0] + ((p[0] - c[0]) / l) * 0.9, p[1] + ((p[1] - c[1]) / l) * 0.9];
                    });
                    const a = side(1), b = side(-1);
                    if (a.length > 2) strokePts(g, a, 0.45, 'rgba(255,244,196,0.85)');
                    if (b.length > 2) strokePts(g, b, 0.5, 'rgba(40,20,34,0.6)');
                }
                // the mouldings' arrises, cut clean with the graver
                for (const ar of arches) {
                    const o2 = (d) => ar.pts.map(([x, y]) => {
                        const l = Math.hypot(x - ar.cx, y - ar.cy) || 1;
                        return y > 23.4 ? [x + Math.sign(x - ar.cx) * d, y] : [x + ((x - ar.cx) / l) * d, y + ((y - ar.cy) / l) * d];
                    });
                    strokePts(g, o2(2), 0.32, 'rgba(48,24,30,0.7)');
                    strokePts(g, o2(2).map(([x, y]) => [x + sh[0] * 0.45, y + sh[1] * 0.45]), 0.24, 'rgba(255,240,184,0.5)');
                }
                for (const [rad, a] of [[23.4, 0.7], [25.9, 0.7], [27.5, 0.5], [8.5, 0.6]]) strokePts(g, S.ellipse(ROSE[0], ROSE[1], rad, rad, 60), 0.32, `rgba(48,24,30,${a})`, true);
                for (const yy of [-19.4, -17.8, -8.4, -6.8, 51.6, 53.6]) strokePts(g, [[-78, yy], [78, yy]], 0.28, 'rgba(48,24,30,0.6)');
                // chased lines: capitals, the verse band's strokes re-cut, the crack
                for (let i = 0; i <= 7; i++) {
                    const x = (i - 3.5) * LAMP.PITCH;
                    for (const yy of [22.6, 24.6, 48.4]) strokePts(g, [[x - 3, yy], [x + 3, yy]], 0.35, 'rgba(48,24,30,0.8)');
                    strokePts(g, [[x - 1.5, 27], [x - 1.5, 46.6]], 0.3, 'rgba(48,24,30,0.5)');
                }
                for (const st of script) {
                    strokePts(g, st, 0.42, 'rgba(34,16,26,0.85)');
                    strokePts(g, st.map(([x, y]) => [x + sh[0] * 0.42, y + sh[1] * 0.42]), 0.22, 'rgba(255,240,184,0.6)');
                }
                for (const [x, y] of punches) {
                    strokePts(g, S.ellipse(x, y, 1.9, 1.9, 14), 0.3, 'rgba(40,20,30,0.75)', true);
                    disc(g, [x, y], 0.42, 'rgba(34,16,26,0.9)');
                }
                const crack = S.curve([[-86, 21], [-80, 16], [-73, 14.6], [-66, 9], [-60, 8.4], [-56, 4]], false, 5);
                S.ink(g, crack, { w: 0.7, color: '#24101e', alpha: 0.9, taper: [0, 1] });
                S.ink(g, crack.map(([x, y]) => [x + sh[0] * 0.6, y + sh[1] * 0.6]), { w: 0.35, color: '#ffeeb4', alpha: 0.6, taper: [0, 1] });
                const sn = [(strip[1][1] - strip[0][1]) / 21.9, -(strip[1][0] - strip[0][0]) / 21.9];
                strokePts(g, [-1, 1].flatMap((k2) => [0, 1].map((u) => [strip[u ? (k2 > 0 ? 1 : 0) : (k2 > 0 ? 0 : 1)][0] + sn[0] * 2.7 * k2, strip[u ? (k2 > 0 ? 1 : 0) : (k2 > 0 ? 0 : 1)][1] + sn[1] * 2.7 * k2])), 0.4, 'rgba(40,20,30,0.75)', true);
            },
            air: airBrass(7),
        });
    }
    // The pans: `list` of scoops on one casting, each a rim round a hollow with a pinched spout.
    function lampPans(key, rot, res, seed, list, bar) {
        let box = S.bbox(list.flatMap((p) => p.out), 5);
        if (bar) box = S.bbox([...list.flatMap((p) => p.out), ...bar], 5);
        return relief(`${key}/${seed}`, rot, res, {
            box, ramp: BRASS, R: 1.2, relief: 0.85, zero: 0.5, depth: 3.2, spec: BRASS_SPEC, smooth: 0.001,
            mask: (g) => {
                if (bar) poly(g, bar);
                for (const p of list) poly(g, p.out);
            },
            paint: (q) => {
                q.fillStyle = grey(0.5);
                q.fillRect(box.x - 4, box.y - 4, box.w + 8, box.h + 8);
                q.filter = `blur(${(0.5 * res).toFixed(2)}px)`;
                for (const p of list) {
                    strokePts(q, p.out, 1.2, grey(0.7), true);
                    fillPts(q, p.inn, grey(0.12));
                    // the channel of the spout
                    strokePts(q, [[p.c[0], p.c[1] + 5 * p.k], [p.tip[0], p.tip[1] - 0.6]], 1.5 * p.k, grey(0.16));
                }
            },
            tint: (x, y, tone, rgb, m, f) => patina(x, y, tone, rgb, smooth(0.4, 0.14, f) * 0.5, (1 - m) * 0.5, 96),
            after: (g, { sh, lit }) => {
                list.forEach((p, i) => {
                    const h = (n) => S.hashI(n, 4, 6, S.seedOf(seed + key + i)), k = p.k;
                    // oil standing in the hollow: dark gold, the lamp's light lying on it
                    g.save();
                    g.beginPath();
                    S.trace(g, p.inn);
                    g.clip();
                    fillPts(g, p.inn, 'rgba(70,40,14,0.82)');
                    S.spray(g, p.inn, { color: '#1c0e16', alpha: 0.85, w: 3.4 * k, push: 2.4 * k, dir: lit });
                    S.spray(g, p.inn, { color: '#e2a640', alpha: 0.6, w: 2.6 * k, push: 1.4 * k, dir: sh });
                    const lv = h(1) * 2.4 - 0.6;
                    S.ink(g, arcOf(p.inn, (q2) => (q2[0] - p.c[0]) * sh[0] + (q2[1] - p.c[1]) * sh[1] > 2.6 * k && q2[1] < p.c[1] + 4.4 * k).map(([x, y]) => [x - sh[0] * (1.3 + lv * 0.2), y - sh[1] * (1.3 + lv * 0.2)]), { w: 0.55, color: '#ffe6a0', alpha: 0.8 });
                    g.restore();
                    strokePts(g, p.inn, 0.55, 'rgba(34,16,26,0.9)', true);
                    strokePts(g, p.inn.map(([x, y]) => [x + sh[0] * 0.5, y + sh[1] * 0.5]), 0.3, 'rgba(255,240,184,0.55)', true);
                    // the wick: twisted cotton lying in the spout, grey with oil, burnt at its tip
                    const wk = S.curve([[p.c[0] + (h(2) - 0.5) * 3, p.c[1] + (0.6 + h(3)) * k], [p.c[0] + (h(4) - 0.5) * 1.6, p.c[1] + 3.6 * k], [p.tip[0] * 0.6 + p.c[0] * 0.4, p.c[1] + 8 * k], [p.tip[0], p.tip[1] - 1.4 * k]], false, 6);
                    S.ink(g, wk.map(([x, y]) => [x + sh[0] * 0.45, y + sh[1] * 0.45]), { w: 1.7 * k, color: '#1c0e16', alpha: 0.85, taper: [0.3, 0.1] });
                    S.ink(g, wk, { w: 1.1 * k, color: '#b9ab86', taper: [0.3, 0.1] });
                    S.ink(g, wk.map(([x, y]) => [x - sh[0] * 0.25, y - sh[1] * 0.25]), { w: 0.4 * k, color: '#efe6c8', alpha: 0.9, taper: [0.5, 0.6] });
                    for (let n = 2; n < wk.length - 3; n += 2) strokePts(g, [[wk[n][0] - 0.45, wk[n][1] - 0.25], [wk[n][0] + 0.45, wk[n][1] + 0.25]], 0.2, 'rgba(70,54,50,0.7)');
                    S.ink(g, wk.slice(-5), { w: 1.25 * k, color: '#17101a', taper: [0.8, 0] });
                    // soot where the flame has sat, on the spout's lips
                    g.save();
                    g.filter = `blur(${(0.7 * res).toFixed(1)}px)`;
                    disc(g, [p.tip[0], p.tip[1] - 1.6 * k], 2.6 * k, `rgba(22,12,24,${(0.35 + 0.4 * h(5)).toFixed(2)})`);
                    g.restore();
                    // the rim's lit lip
                    const lip = arcOf(p.out, (q2) => (q2[0] - p.c[0]) * lit[0] + (q2[1] - p.c[1] - 2 * k) * lit[1] > 3.2 * k).map(([x, y]) => [x - lit[0] * 0.8, y - lit[1] * 0.8]);
                    if (lip.length > 2) S.ink(g, lip, { w: 0.7, color: '#fff6cc', alpha: 0.85 });
                });
                if (bar) {
                    strokePts(g, [[bar[0][0] + 2, bar[0][1] + 1.6], [bar[1][0] - 2, bar[1][1] + 1.6]], 0.4, 'rgba(48,24,30,0.7)');
                    strokePts(g, [[bar[0][0] + 2, bar[0][1] + 2.2], [bar[1][0] - 2, bar[1][1] + 2.2]], 0.3, 'rgba(255,240,184,0.5)');
                }
            },
            air: airBrass(3.2),
        });
    }

    function lampara(g, o = {}) {
        const seed = o.seed ?? 'lampara';
        sheet(g, o, { x: -116, y: -126, w: 232, h: 252 }, (q, F) => {
            const res = resOf(q), cs = { blur: 3, dx: 1.8, dy: 2.8, color: 'rgba(24,10,30,0.62)' };
            const piece = (pts, o2 = {}) => S.piece(q, F.pts(pts), { fill: Au.base, line: 1.5, cast: cs, shade: [{ color: Au.deep, alpha: 0.85, w: o2.w ?? 4 }, { color: '#33203c', alpha: 0.6, w: (o2.w ?? 4) * 0.4 }], light: { color: Au.glint, alpha: 0.8, w: (o2.w ?? 4) * 0.55 }, detail: o2.detail });
            stamp(q, F, lampPlate(F.rot, res, seed), { lw: 1.7, heavy: 0.8 });
            // the bench's cheeks, and the bracket that carries the servant light
            for (const sx of [-1, 1]) {
                piece([[sx * 83, 49], [sx * 90.5, 51], [sx * 91.5, 68], [sx * 83, 71.6]], {
                    w: 3, detail: (d) => {
                        strokePts(d, F.pts([[sx * 84.6, 52], [sx * 89.6, 53.4], [sx * 90.2, 66.6], [sx * 84.6, 69.4]]), 0.4, 'rgba(48,24,30,0.7)', true);
                        bead(d, F([sx * 87.4, 60.4]), 1.3, Au, 0.5);
                    },
                });
            }
            const arm = S.curve([[84, 8], [92, 9.4], [98.6, 5], [101, -1]], false, 8);
            piece(band(arm, 5.6, 4.2), { w: 2.4, detail: (d) => S.ink(d, F.pts(arm.map(([x, y]) => [x - 0.8, y - 1.1])), { w: 0.6, color: Au.glint, alpha: 0.85 }) });
            piece([[82.6, 2.6], [88.4, 3], [88.6, 14.4], [82.6, 14.8]], { w: 2, detail: (d) => { for (const yy of [5.4, 12]) bead(d, F([85.6, yy]), 1.1, Au, 0.45); } });
            const row = lampPans('pans', F.rot, res, seed, LAMP.pans, [[-84.6, 52.6], [84.6, 52.6], [85, 60.6], [-85, 60.6]]);
            stamp(q, F, row, { lw: 1.5, heavy: 0.85, cast: { blur: 3.4, dx: 2, dy: 3.4, color: 'rgba(20,8,26,0.7)' } });
            const FS = F.sub(100.6, -7.4, 0.05);
            stamp(q, FS, lampPans('servant', FS.rot, res, seed, [LAMP.servant]), { lw: 1.5, heavy: 0.85, cast: cs });
            // the loop it hangs by wears bright where the nail rubs
            S.ink(q, F.pts(S.ellipse(0, LAMP.APEX - 9.4, 5.6, 5.9, 20).slice(11, 19)), { w: 0.9, color: '#fff6cc', alpha: 0.9 });
            return (a) => {
                // one wick lit: the first night's light, at the right end of the row
                const lit = LAMP.pans[7], Ff = upright(F, [lit.tip[0], lit.tip[1] - 2.2]).sub(lit.tip[0], lit.tip[1] - 2.2);
                glow(a, Ff([0, -7]), 30, 0.9);
                flame(a, Ff, { h: 15.5, w: 5.4, lean: -1.2, seed, soot: true });
            };
        });
    }

    // ------------------------------------------------------------------ the hand amulet
    // The hand of the amulet, fingers down: an ornament, the same on both sides. One closed
    // outline, built for the right half and mirrored.
    const JAMSA = (() => {
        const FX = 17, FH = 7.3, TIP = [63, 75], WEB = 13.5;
        // the thumb: a band along a line that leaves the palm and curls outwards
        const spine = walk(S.curve([[27, -10], [38, -1], [44.4, 11], [46.6, 23], [50.6, 32.6], [58.4, 36.6], [64, 33.6]], false, 12), 1);
        const tw = (i) => 7.6 - 3.4 * (i / (spine.length - 1));
        const outer = [], inner = [];
        spine.forEach((m, i) => {
            outer.push([m.p[0] - m.n[0] * tw(i), m.p[1] - m.n[1] * tw(i)]);
            inner.push([m.p[0] + m.n[0] * tw(i), m.p[1] + m.n[1] * tw(i)]);
        });
        const end = spine[spine.length - 1], cap = [];
        for (let k = 1; k < 8; k++) {
            const a = Math.atan2(-end.n[1], -end.n[0]) + (k / 8) * Math.PI;
            cap.push([end.p[0] + Math.cos(a) * 4, end.p[1] + Math.sin(a) * 4]);
        }
        const half = [[0, -55], [8.6, -55], [12.4, -52.6], [13.6, -46], [20, -38.6], [27.6, -30], [31.4, -19]];
        half.push(...outer.filter((p, i) => i > 6 && i % 3 === 0), ...cap, ...inner.filter((p, i) => i % 3 === 0 && p[1] > 16 && p[0] > FX + FH + 2.4).reverse());
        half.push([FX + FH + 0.6, 15.6]);
        // a finger: down its outer edge, round the tip, up its inner edge to the web
        const finger = (cx, ty, from) => {
            const pts = [[cx + FH, from + 4]];
            for (let k = 0; k <= 10; k++) pts.push([cx + Math.cos((k / 10) * Math.PI) * FH, ty + Math.sin((k / 10) * Math.PI) * FH]);
            return pts;
        };
        half.push(...finger(FX, TIP[0], 16), [FX - FH, WEB + 3], [FX - FH - 1.2, WEB], [FH, WEB + 3]);
        half.push(...finger(0, TIP[1], WEB).slice(0, 6));
        const smoothHalf = S.curve(half, false, 3);
        const out = [...smoothHalf, ...smoothHalf.slice(1, -1).reverse().map(([x, y]) => [-x, y])];
        return { FX, FH, TIP, WEB, out, spine, STAR: [0, -9], GEM: [0, -35.4] };
    })();
    const ENAMEL = { green: ['#1f8a5c', '#0b3e33', '#7fe0aa'], blue: ['#1f56a8', '#0d2458', '#7fb4f2'], white: ['#e6e2d2', '#8f8aa0', '#ffffff'], red: ['#b22a30', '#5a0f20', '#f08a80'] };

    function jamsaSprite(rot, res, seed) {
        const { FX, FH, TIP, out, spine, STAR, GEM } = JAMSA, r = Motion.rng('jamsa' + seed);
        const star = star8(STAR[0], STAR[1], 7.4, 0.62, Math.PI / 8);
        const eyeAt = (e, a, r0, turns, dir, n = 20) => scroll([e[0] + Math.cos(a) * r0, e[1] + Math.sin(a) * r0], a, r0, turns, dir, n);
        // everything the goldsmith soldered on: scrolls, grains, the walls of the enamel cells
        const scrolls = [], grains = [], cells = [];
        const pair = (cx, y, d, r0, a = Math.PI / 2, turns = 1.2) => {
            scrolls.push(eyeAt([cx - d, y], Math.PI - a, r0, turns, 1), eyeAt([cx + d, y], a, r0, turns, -1));
        };
        const ess = (c, a, d, r0, dir) => [...eyeAt([c[0] - Math.cos(a) * d, c[1] - Math.sin(a) * d], a, r0, 1.05, dir, 14).reverse(), ...eyeAt([c[0] + Math.cos(a) * d, c[1] + Math.sin(a) * d], a + Math.PI, r0, 1.05, dir, 14)];
        const frames = [];
        // the fingers: a wire panel on each, and down it scrolls in facing pairs, an S lying across,
        // a lozenge of grains, never twice in the same order; a drop-shaped cell at the tip
        [[-FX, TIP[0], 'green', 'psgps'], [0, TIP[1], 'blue', 'spgspg'], [FX, TIP[0], 'green', 'gpsps']].forEach(([fx, ty, col, order], fi) => {
            const hw = FH - 2.7, fr = [[fx - hw, 17], [fx - hw, ty - 11.6], [fx, ty - 14.4], [fx + hw, ty - 11.6], [fx + hw, 17]];
            frames.push(fr);
            let y = 21.4;
            for (const ch of order) {
                const k = 0.9 + 0.25 * r();
                if (y > ty - 17) break;
                if (ch === 'p') {
                    pair(fx, y + 1, 2.25, 1.9 * k, r() < 0.5 ? Math.PI / 2 : -Math.PI / 2, 1.1 + 0.2 * r());
                    y += 6.6;
                } else if (ch === 's') {
                    scrolls.push(ess([fx, y + 2], (fi % 2 ? 1 : -1) * (0.9 + 0.3 * r()), 1.5, 1.7 * k, fi % 2 ? 1 : -1));
                    y += 8.4;
                } else {
                    const miss = fi === 2; // (one grain of this lozenge has come away)
                    [[0, -1.5], [1.5, 0], [0, 1.5], [-1.5, 0]].forEach(([dx, dy], n) => grains.push([fx + dx, y + 0.6 + dy, miss && n === 1 ? -0.5 : 0.7]));
                    y += 5.2;
                }
            }
            const cy = ty - 0.6, drop = [];
            for (let k = 0; k <= 16; k++) {
                const a = -Math.PI / 2 + 0.62 + (k / 16) * (TAU - 1.24);
                drop.push([fx + Math.cos(a) * 3.7, cy + Math.sin(a) * 3.7]);
            }
            drop.push([fx, cy - 7.6]);
            cells.push({ pts: S.curve(drop, true, 3), col, c: [fx, cy] });
        });
        // the thumbs: a vine along each, leaves of scroll to either side, a round cell at the tip
        for (const sx of [-1, 1]) {
            const M = (p) => [sx * p[0], p[1]];
            scrolls.push(spine.slice(8, -9).filter((m, i) => i % 3 === 0).map((m) => M(m.p)));
            for (let i = 12, k = 0; i < spine.length - 14; i += 7, k++) {
                const m = spine[i], sd = k % 2 ? 1 : -1, e = [m.p[0] + m.n[0] * sd * 3.3, m.p[1] + m.n[1] * sd * 3.3], a = Math.atan2(m.t[1], m.t[0]);
                const sc = eyeAt(e, a + Math.PI, 2.1, 1.05, sd, 16).map(M);
                scrolls.push(sc);
                grains.push([...M([m.p[0] - m.n[0] * sd * 3, m.p[1] - m.n[1] * sd * 3]), 0.62]);
            }
            const tp = spine[spine.length - 5].p;
            cells.push({ pts: S.ellipse(sx * tp[0], tp[1], 2.5, 2.5, 18), col: sx < 0 ? 'white' : 'red', c: M(tp), empty: sx > 0 });
            // the palm, each side of the star: two large scrolls back to back, small ones in the gaps
            scrolls.push(eyeAt([sx * 16.4, -19], sx > 0 ? 0.4 : Math.PI - 0.4, 5.2, 1.3, -sx, 26), eyeAt([sx * 17.2, -2], sx > 0 ? -0.5 : Math.PI + 0.5, 4.7, 1.25, sx, 24));
            scrolls.push(eyeAt([sx * 25, -10.4], sx > 0 ? Math.PI : 0, 2.5, 1.1, sx, 16), eyeAt([sx * 8.4, 7.4], Math.PI / 2, 2.3, 1.1, -sx, 16));
            scrolls.push(ess([sx * 19.4, -31.6], sx * 0.5, 2.4, 2.3, sx), ess([sx * 21.6, 8], -sx * 0.4, 2.1, 2, -sx), eyeAt([sx * 5.4, -24.4], sx > 0 ? 0 : Math.PI, 1.9, 1.05, sx, 14));
            for (const [x, y] of [[9.6, -22.6], [26.4, -22], [10, 0.4], [27.4, 1]]) for (let k = 0; k < 3; k++) grains.push([...pol(0.95, -Math.PI / 2 + (k / 3) * TAU, sx * x, y), 0.66]);
            cells.push({ pts: [[sx * 6.2, -49.8], [sx * 8.6, -47.4], [sx * 6.2, -45], [sx * 3.8, -47.4]], col: sx < 0 ? 'blue' : 'green', c: [sx * 6.2, -47.4] });
        }
        cells.push({ pts: [[0, -50.2], [2.6, -47.4], [0, -44.6], [-2.6, -47.4]], col: 'red', c: [0, -47.4] });
        for (let k = 0; k < 3; k++) grains.push([...pol(0.95, Math.PI / 2 + (k / 3) * TAU, 0, 5.6), 0.66]);
        // a line of grains over the fingers' roots, a rosette of them on each shoulder
        for (let k = -8; k <= 8; k++) if (Math.abs(k) > 1) grains.push([k * 2.9, 13.4 - 0.016 * k * k * 2.9, 0.6 + 0.12 * ((k + 8) % 2)]);
        for (const sx of [-1, 1]) {
            for (let k = 0; k < 6; k++) grains.push([...pol(1.7, (k / 6) * TAU, sx * 30.4, -13.4), 0.6]);
            grains.push([sx * 30.4, -13.4, 0.8]);
            scrolls.push(eyeAt([sx * 12.6, -26.4], sx > 0 ? -0.6 : Math.PI + 0.6, 1.8, 1.05, sx, 14), eyeAt([sx * 33, 2.6], Math.PI / 2, 1.9, 1.05, sx, 14));
            for (let k = 0; k < 3; k++) grains.push([...pol(0.95, -Math.PI / 2 + (k / 3) * TAU, sx * 17.6, -9.6), 0.62]);
        }
        for (let k = 0; k < 16; k++) grains.push([...pol(9.5, (k / 16) * TAU + 0.1, GEM[0], GEM[1]), 0.72]);
        for (let k = 0; k < 8; k++) grains.push([...pol(10.6, (k / 8) * TAU, STAR[0], STAR[1]), 0.62]);
        return relief(`jamsa/${seed}`, rot, res, {
            box: { x: -72, y: -58, w: 144, h: 144 }, ramp: SILVER, R: 1.3, relief: 0.8, zero: 0.22, depth: 2.3, spec: SILVER_SPEC, rough: 0.1,
            mask: (g) => {
                poly(g, out);
                cut(g, (q) => poly(q, star));
            },
            paint: (q) => {
                q.fillStyle = grey(0.22);
                q.fillRect(-80, -70, 160, 170);
                q.filter = `blur(${(0.1 * res).toFixed(2)}px)`;
                // a rope of twisted wire round the whole outline and across the wrist; a collar round the star
                twist(q, out, 3.6, 0.92, true);
                twist(q, [[-13.6, -42.6], [13.6, -42.6]], 1.5, 0.85);
                wire(q, [[-12.6, -52.2], [12.6, -52.2]], 0.9, 0.7);
                wire(q, star8(STAR[0], STAR[1], 8.4, 0.66, Math.PI / 8), 1.4, 0.92, true);
                twist(q, S.ellipse(STAR[0], STAR[1], 12.6, 12.6, 40), 1.2, 0.8, true);
                for (const fr of frames) wire(q, fr, 0.75, 0.74);
                // the dent, and the smith's ground: hammered a little uneven
                const gd = q.createRadialGradient(-43, 12, 0, -43, 12, 4.4);
                gd.addColorStop(0, grey(0.02));
                gd.addColorStop(1, 'rgba(56,56,56,0)');
                disc(q, [-43, 12], 4.4, gd);
                for (const sc of scrolls) wire(q, sc, 1, 0.9);
                for (const [x, y, rad] of grains) {
                    if (rad > 0) grain(q, [x, y], rad, 1);
                    else disc(q, [x, y], 0.5, grey(0.1));
                }
                // the cells' walls stand up; their floors lie low
                for (const c of cells) {
                    fillPts(q, c.pts, grey(0.12));
                    wire(q, c.pts, 0.8, 0.9, true);
                }
                // the collet: a toothed wall round the stone's seat
                disc(q, GEM, 7, grey(0.75));
                for (let k = 0; k < 20; k++) grain(q, pol(6.6, (k / 20) * TAU, GEM[0], GEM[1]), 0.85, 1);
                disc(q, GEM, 5.4, grey(0.3));
            },
            tint: (x, y, tone, rgb, m, f) => {
                const n = S.noise2(x * 0.12, y * 0.12, 111) * 0.6 + S.noise2(x * 0.4, y * 0.4, 112) * 0.4;
                tarnish(rgb, tone, clamp(0.02 + 0.4 * smooth(0.5, 0.2, f) + 0.3 * n - 0.3 * smooth(0.7, 0.95, f), 0, 0.85));
                // the backs of the wires are rubbed bright
                const kb = smooth(0.62, 0.95, f) * 0.45;
                rgb[0] += (252 - rgb[0]) * kb;
                rgb[1] += (252 - rgb[1]) * kb;
                rgb[2] += (255 - rgb[2]) * kb;
                // solder: a warmer, paler shine at the foot of the wires
                const ks = smooth(0.3, 0.5, f) * smooth(0.7, 0.5, f) * smooth(0.1, 0.5, n) * 0.35;
                rgb[0] += (236 - rgb[0]) * ks;
                rgb[1] += (226 - rgb[1]) * ks;
                rgb[2] += (206 - rgb[2]) * ks;
            },
            after: (g, { sh, lit }) => {
                // enamel in the cells: glass, so it has a depth, a gloss, and a chipped corner here and there
                for (const c of cells) {
                    const E = ENAMEL[c.col], inner = c.pts.map(([x, y]) => [c.c[0] + (x - c.c[0]) * 0.8, c.c[1] + (y - c.c[1]) * 0.8]);
                    g.save();
                    g.beginPath();
                    S.trace(g, inner);
                    g.clip();
                    if (c.empty) {
                        // this one has lost its glass: the keyed floor of the cell shows
                        fillPts(g, inner, '#15152e');
                        for (let k = -3; k <= 3; k++) strokePts(g, [[c.c[0] - 3, c.c[1] + k * 0.9 - 1], [c.c[0] + 3, c.c[1] + k * 0.9 + 1]], 0.22, 'rgba(150,156,190,0.6)');
                        fillPts(g, [[c.c[0] - 2.6, c.c[1] + 0.6], [c.c[0] - 0.4, c.c[1] + 1], [c.c[0] - 1.4, c.c[1] + 2.6]], ENAMEL.red[0]);
                    } else {
                        fillPts(g, inner, E[0]);
                        S.spray(g, inner, { color: E[1], alpha: 0.9, w: 2.2, push: 1.2, dir: lit });
                        S.spray(g, inner, { color: E[2], alpha: 0.7, w: 1.8, push: 1, dir: sh });
                        g.fillStyle = 'rgba(255,255,255,0.9)';
                        g.beginPath();
                        g.ellipse(c.c[0] + lit[0] * 1.3, c.c[1] + lit[1] * 1.3, 1.05, 0.5, Math.atan2(lit[1], lit[0]) + Math.PI / 2, 0, TAU);
                        g.fill();
                    }
                    g.restore();
                    strokePts(g, inner, 0.3, 'rgba(10,10,36,0.75)', true);
                }
                // the star's cut edge: dark where it turns away, a bright arris opposite
                const far = arcOf(star, (p) => (p[0] - STAR[0]) * sh[0] + (p[1] - STAR[1]) * sh[1] > 0).map(([x, y]) => [STAR[0] + (x - STAR[0]) * 1.07, STAR[1] + (y - STAR[1]) * 1.07]);
                strokePts(g, far, 0.4, 'rgba(250,252,255,0.9)');
                // every wire drawn: its shade on the ground beside it, a light along its back
                for (const sc of [...scrolls, ...frames]) {
                    strokePts(g, sc.map(([x, y]) => [x + sh[0] * 0.62, y + sh[1] * 0.62]), 0.34, 'rgba(8,8,34,0.6)');
                    strokePts(g, sc.map(([x, y]) => [x + lit[0] * 0.2, y + lit[1] * 0.2]), 0.22, 'rgba(255,255,255,0.8)');
                }
                // fine scratches, and black in the eye of every scroll
                const ra = Motion.rng('jamsaafter' + seed);
                for (let i = 0; i < 60; i++) {
                    const x = (ra() - 0.5) * 120, y = -54 + ra() * 134, a = ra() * Math.PI, l = 0.8 + ra() * 2.4;
                    strokePts(g, [[x, y], [x + Math.cos(a) * l, y + Math.sin(a) * l]], 0.2, ra() < 0.5 ? 'rgba(12,12,40,0.4)' : 'rgba(250,252,255,0.5)');
                }
                for (const sc of scrolls) {
                    const e = sc[sc.length - 1];
                    disc(g, [e[0] + sh[0] * 0.3, e[1] + sh[1] * 0.3], 0.34, 'rgba(8,8,30,0.7)');
                }
                // a point of light on every grain that faces the lamp
                for (const [x, y, rad] of grains) if (rad > 0.6) disc(g, [x + lit[0] * rad * 0.35, y + lit[1] * rad * 0.35], rad * 0.26, 'rgba(255,255,255,0.9)');
            },
            air: [{ color: '#2b2a52', alpha: 0.42, w: 8 }, { color: '#12132c', alpha: 0.7, w: 3 }, { color: '#f4f6ff', alpha: 0.7, w: 4, lit: true }, { color: '#7d86a6', alpha: 0.7, w: 1.3, push: 0.5 }],
        });
    }
    // A stone cut en cabochon: blue glass with the light going through it.
    function cabochon(g, p, r) {
        disc(g, [p[0] + SD[0] * 0.5, p[1] + SD[1] * 0.5], r + 0.7, '#0a0c26');
        const gr = g.createRadialGradient(p[0] + SD[0] * r * 0.36, p[1] + SD[1] * r * 0.36, r * 0.05, p[0], p[1], r * 1.05);
        gr.addColorStop(0, '#6fd0ee');
        gr.addColorStop(0.36, '#2b8ed0');
        gr.addColorStop(0.75, '#16479a');
        gr.addColorStop(1, '#0b1f5c');
        disc(g, p, r, gr);
        g.save();
        g.beginPath();
        g.arc(p[0], p[1], r, 0, TAU);
        g.clip();
        // the lamp's light comes out again at the far side, in a crescent; veins and a bubble in the glass
        const a0 = Math.atan2(SD[1], SD[0]);
        g.lineCap = 'round';
        g.strokeStyle = 'rgba(170,236,255,0.75)';
        g.lineWidth = r * 0.2;
        g.beginPath();
        g.arc(p[0], p[1], r * 0.7, a0 - 0.8, a0 + 0.8);
        g.stroke();
        S.ink(g, [[p[0] - r * 0.5, p[1] + r * 0.1], [p[0] - r * 0.1, p[1] + r * 0.36], [p[0] + r * 0.2, p[1] + r * 0.7]], { w: 0.3, color: '#0b2a6a', alpha: 0.6 });
        strokePts(g, S.ellipse(p[0] + r * 0.3, p[1] - r * 0.24, r * 0.1, r * 0.1, 8), 0.22, 'rgba(200,240,255,0.8)', true);
        g.restore();
        // the window: the lamp itself, mirrored in the dome
        const w = [p[0] + TOL[0] * r * 0.42, p[1] + TOL[1] * r * 0.42];
        g.fillStyle = 'rgba(255,255,255,0.95)';
        g.beginPath();
        g.ellipse(w[0], w[1], r * 0.26, r * 0.15, Math.atan2(TOL[1], TOL[0]) + Math.PI / 2, 0, TAU);
        g.fill();
        disc(g, [w[0] + TOL[1] * r * 0.4 + SD[0] * r * 0.1, w[1] - TOL[0] * r * 0.4 + SD[1] * r * 0.1], r * 0.07, 'rgba(236,250,255,0.85)');
    }

    function jamsa(g, o = {}) {
        const seed = o.seed ?? 'jamsa';
        sheet(g, o, { x: -72, y: -101, w: 144, h: 202 }, (q, F) => {
            const res = resOf(q), cs = { blur: 2.2, dx: 1.2, dy: 1.8, color: 'rgba(10,8,30,0.6)' };
            const { FX, TIP, GEM } = JAMSA;
            // the drops that hang from the fingertips: under the hand
            for (const [fx, ty, k] of [[-FX, TIP[0], 0], [0, TIP[1], 1], [FX, TIP[0], 2]]) {
                // a jingle on a ring: a hollow bead with a girdle and a slit
                const c = [fx + (k - 1) * 0.5, ty + 13.2 + (k === 1 ? 0.6 : 0)];
                ring(q, F([fx, ty + 8.6]), 1.7, 2.2, F.rot, 0.7, Ag, 0.55);
                bead(q, F(c), 2.5, Ag, 0.8);
                S.ink(q, F.pts([[c[0] - 2.3, c[1] - 0.1], [c[0], c[1] + 0.5], [c[0] + 2.3, c[1] - 0.1]]), { w: 0.4, color: Ag.deep, alpha: 0.9, taper: [0, 0] });
                S.ink(q, F.pts([[c[0], c[1] + 0.9], [c[0], c[1] + 2.3]]), { w: 0.5, color: '#0c0c26', taper: [0, 0] });
            }
            stamp(q, F, jamsaSprite(F.rot, res, seed), { lw: 1.9, heavy: 0.8 });
            cabochon(q, F(GEM), 5.2);
            // the loop: a ribbed barrel soldered to the wrist; a jump ring; a short chain
            const barrel = F.pts(S.curve([[-5.4, -56.4], [-5.8, -60.4], [-5.2, -64.2], [5.2, -64.2], [5.8, -60.4], [5.4, -56.4]], true, 4));
            S.piece(q, barrel, {
                fill: Ag.base, line: 1.4, cast: cs, shade: { color: Ag.deep, alpha: 0.85, w: 3.4 }, light: { color: Ag.glint, alpha: 0.9, w: 2 },
                detail: (d) => {
                    for (let k = -2; k <= 2; k++) {
                        S.ink(d, F.pts([[k * 2.1 + 0.5, -64.4], [k * 2.1 + 0.7, -60.4], [k * 2.1 + 0.5, -56.2]]), { w: 0.55, color: Ag.deep, alpha: 0.9, taper: [0, 0] });
                        S.ink(d, F.pts([[k * 2.1 - 0.3, -64], [k * 2.1 - 0.2, -60.4], [k * 2.1 - 0.3, -56.6]]), { w: 0.35, color: Ag.glint, alpha: 0.9, taper: [0.4, 0.4] });
                    }
                },
            });
            chain(q, F.pts([[0, -99.6], [0.6, -84], [0, -70.4]]), { len: 6, w: 1.1, seed: seed + 'c', cast: cs });
            ring(q, F([0, -67.4]), 2.6, 3, F.rot, 1, Ag, 0.6);
        });
    }

    // ------------------------------------------------------------------ the niche
    // An ivory plaque carved with a prayer niche: a horseshoe arch on two columns in its
    // frame (alfiz), the spandrels full of leafwork, and inside the arch only darkness and a
    // hanging lamp. In its own coordinates: 212 × 292 about the origin.
    const NICHE = (() => {
        const W = 106, H = 146, C = [0, -24], RI = 46, RO = 68, SPRING = 4;
        // the horseshoe: its arc runs on below the centre, to the capitals
        const a0 = Math.PI - Math.asin((SPRING - C[1]) / RI) + Math.PI, arc = (R, n = 60) => {
            const b = Math.asin(Math.min(0.999, (SPRING - C[1]) / R)), pts = [];
            for (let k = 0; k <= n; k++) pts.push(pol(R, Math.PI - b + ((Math.PI + 2 * b) * k) / n, C[0], C[1]));
            return pts;
        };
        const inner = arc(RI), jx = Math.abs(inner[0][0]) - 5.5;
        // the opening: the arch, then straight down between the columns to the sill
        const opening = [[-jx, 96], [-jx, SPRING + 9], ...inner, [jx, SPRING + 9], [jx, 96]];
        // voussoirs: wedges from the inner arc to the outer one, about a centre a little lower
        const V = 19, vous = [], b1 = Math.asin((SPRING - C[1]) / RI), b2 = Math.asin((SPRING - C[1]) / RO);
        for (let k = 0; k < V; k++) {
            const t0 = k / V, t1 = (k + 1) / V, ai = (t) => Math.PI - b1 + (Math.PI + 2 * b1) * t, ao = (t) => Math.PI - b2 + (Math.PI + 2 * b2) * t, pts = [];
            for (let i = 0; i <= 4; i++) pts.push(pol(RI, ai(t0 + ((t1 - t0) * i) / 4), C[0], C[1]));
            for (let i = 4; i >= 0; i--) pts.push(pol(RO, ao(t0 + ((t1 - t0) * i) / 4), C[0], C[1]));
            vous.push({ pts, red: k % 2 === 0, mid: pol((RI + RO) / 2, (ai((t0 + t1) / 2) + ao((t0 + t1) / 2)) / 2, C[0], C[1]), a: (ai((t0 + t1) / 2) + ao((t0 + t1) / 2)) / 2 });
        }
        return { W, H, C, RI, RO, SPRING, inner, jx, opening, vous, arc, a0 };
    })();
    const IVORY = [[0, '#3f3350'], [0.2, '#75606a'], [0.42, '#b39a7c'], [0.62, '#dcc9a0'], [0.82, '#f1e6c8'], [1, '#fffaea']];

    function nicheSprite(rot, res, seed) {
        const { W, H, C, RI, RO, SPRING, jx, opening, vous, arc } = NICHE, r = Motion.rng('niche' + seed);
        // the frame band's strokes: the pace of an inscription, no letters
        const script = [];
        const band = (p0, p1) => {
            const len = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]), ux = (p1[0] - p0[0]) / len, uy = (p1[1] - p0[1]) / len, vx = -uy, vy = ux;
            const P = (u, v) => [p0[0] + ux * u + vx * v, p0[1] + uy * u + vy * v];
            for (let u = 1; u < len - 6; ) {
                // a word: a base line that runs on, uprights of unequal height rising from it, a tail
                // swung under at its end, points over and under
                const w = 5 + r() * 12, line = [];
                for (let k = 0; k <= 6; k++) line.push(P(u + (w * k) / 6, 1.6 + 0.5 * Math.sin(k * 1.9 + u)));
                script.push(line);
                for (let x = r() * 2; x < w - 0.6; x += 1.5 + r() * 3) {
                    const hgt = r() < 0.4 ? 4.2 + r() * 1.6 : 1.4 + r() * 1.6, lean = (r() - 0.5) * 0.9;
                    script.push([P(u + x, 1.6), P(u + x + lean * 0.4, 1.6 - hgt * 0.6), P(u + x + lean, 1.6 - hgt)]);
                    if (r() < 0.22) script.push(S.ellipse(...P(u + x + 0.9, 0.4), 0.8, 0.9, 8));
                    if (r() < 0.3) script.push([P(u + x + 0.6, r() < 0.5 ? -2.2 : 3.6), P(u + x + 1.1, r() < 0.5 ? -2 : 3.8)]);
                }
                if (r() < 0.6) script.push([P(u + w, 1.6), P(u + w + 0.8, 3.4), P(u + w - 0.6, 4.4), P(u + w - 2.4, 3.8)]);
                u += w + 1.6 + r() * 1.6;
            }
        };
        band([-86, -121.6], [86, -121.6]);
        band([93.6, -112], [93.6, 104]);
        band([-93.6, 104], [-93.6, -112]);
        // leafwork in a spandrel: a stem that spirals, split palmettes budding off it
        const leaves = [], stems = [];
        for (const sx of [-1, 1]) {
            const M = (p) => [sx * p[0], p[1]];
            const stem = S.curve([[80, 2], [81, -36], [76, -68], [60, -90], [38, -98], [22, -92], [18, -80], [28, -76], [34, -84]], false, 10);
            const stem2 = S.curve([[60, -90], [70, -106], [80, -100], [80, -86], [71, -84]], false, 8);
            const stem3 = S.curve([[81, -36], [68, -46], [60, -36], [66, -24], [76, -28], [72, -36]], false, 8);
            const stem4 = S.curve([[76, -68], [62, -72], [54, -62], [60, -50], [70, -54], [66, -62]], false, 8);
            const stem5 = S.curve([[38, -98], [30, -106], [14, -106], [6, -98], [10, -90]], false, 8);
            const stem6 = S.curve([[80, 2], [70, -4], [66, -14], [72, -16]], false, 6);
            stems.push(...[stem, stem2, stem3, stem4, stem5, stem6].map((st) => st.map(M)));
            for (const [st, every, off] of [[stem, 7, 3], [stem2, 6, 2], [stem3, 6, 3], [stem4, 6, 2], [stem5, 6, 3], [stem6, 5, 2]]) {
                const w = walk(st, 1);
                for (let i = off, k = 0; i < w.length - 1; i += every, k++) {
                    const m = w[i], sd = k % 2 ? 1 : -1, a = Math.atan2(m.t[1], m.t[0]) + sd * (0.8 + 0.4 * r()), len = 7 + r() * 4.6, wd = 2.6 + r() * 1.4;
                    const tip = [m.p[0] + Math.cos(a) * len, m.p[1] + Math.sin(a) * len], n2 = [-Math.sin(a), Math.cos(a)], mid = lerpP(m.p, tip, 0.45);
                    // a half palmette: a curved leaf with a hollow back
                    leaves.push(S.curve([m.p, [mid[0] + n2[0] * wd * sd, mid[1] + n2[1] * wd * sd], tip, [mid[0] - n2[0] * wd * 0.25 * sd, mid[1] - n2[1] * wd * 0.25 * sd]], true, 5).map(M));
                }
            }
        }
        // only the spandrels: inside the alfiz, outside the arch
        const spandrel = (q) => {
            const ar = arc(RO + 3.8);
            q.beginPath();
            q.rect(-83, -111, 166, 115);
            S.trace(q, [[ar[0][0], 12], ...ar, [ar[ar.length - 1][0], 12]]);
            q.clip('evenodd');
        };
        const bosses = [[-73, -101], [73, -101]];
        return relief(`niche/${seed}`, rot, res, {
            box: { x: -W - 4, y: -H - 4, w: W * 2 + 8, h: H * 2 + 8 }, ramp: IVORY, R: 1.6, relief: 0.8, zero: 0.34, depth: 5.5, rough: 0.06,
            spec: { amp: 0.25, power: 14, from: 0.55, to: 1, color: '#fffdf0' }, mottle: { amp: 0.035, freq: 0.03 },
            mask: (g) => {
                // cut by hand: the corners eased, the edges not quite true
                const o2 = [];
                for (const [x, y, a] of [[W - 4, -H + 4, -Math.PI / 2], [W - 4, H - 4, 0], [-W + 4, H - 4, Math.PI / 2], [-W + 4, -H + 4, Math.PI]]) for (let k = 0; k <= 5; k++) o2.push(pol(4, a + ((k / 5) * Math.PI) / 2, x, y));
                poly(g, o2.map(([x, y], i) => [x + 0.4 * S.noise2(i * 0.7, 1, 121), y + 0.4 * S.noise2(i * 0.7, 5, 122)]));
                // pin holes at the corners, where it was fixed to a casket; a chip out of one edge
                cut(g, (q) => {
                    for (const sx of [-1, 1]) for (const sy of [-1, 1]) disc(q, [sx * (W - 6.4), sy * (H - 6.4)], 1.25, '#000');
                    poly(q, [[W + 2, 60], [W - 2.6, 62], [W - 1.2, 66], [W - 3.4, 69], [W + 2, 72]]);
                });
            },
            paint: (q) => {
                q.fillStyle = grey(0.34);
                q.fillRect(-W - 10, -H - 10, W * 2 + 20, H * 2 + 20);
                q.filter = `blur(${(0.12 * res).toFixed(2)}px)`;
                // the border: a plain fillet, then the band of strokes between two beads of pearls
                strokePts(q, [[-W + 3, -H + 3], [W - 3, -H + 3], [W - 3, H - 3], [-W + 3, H - 3]], 3, grey(0.7), true);
                fillPts(q, [[-100, -128], [100, -128], [100, 108], [-100, 108]], grey(0.2));
                for (const st of script) strokePts(q, st, 0.9, grey(0.6));
                fillPts(q, [[-86, -114], [86, -114], [86, 108], [-86, 108]], grey(0.5));
                strokePts(q, [[-86, -114], [86, -114], [86, 108], [-86, 108]], 1.6, grey(0.8), true);
                // the alfiz: the field behind the arch lies low, the leafwork stands on it
                fillPts(q, [[-83, -111], [83, -111], [83, 4], [-83, 4]], grey(0.12));
                q.save();
                spandrel(q);
                for (const st of stems) wire(q, st, 1.7, 0.7);
                for (const lf of leaves) {
                    fillPts(q, lf, grey(0.66));
                    strokePts(q, lf, 0.6, grey(0.9), true);
                }
                q.restore();
                for (const b of bosses) {
                    for (let k = 0; k < 8; k++) grain(q, pol(5, (k / 8) * TAU, b[0], b[1]), 2.2, 0.78);
                    grain(q, b, 3.6, 1);
                }
                // the arch: its voussoirs stand proud, each with a chamfer; a moulding round it
                strokePts(q, arc(RO + 2.4), 2.8, grey(0.95));
                for (const v of vous) {
                    fillPts(q, v.pts, grey(v.red ? 0.66 : 0.8));
                    strokePts(q, v.pts, 0.7, grey(0.3), true);
                }
                strokePts(q, arc(RI + 1.2), 1.8, grey(0.95));
                // capitals, columns, bases: turned and carved in the round
                for (const sx of [-1, 1]) {
                    const cx = sx * (jx + 10.6);
                    for (let x = -6; x <= 6; x += 0.5) strokePts(q, [[cx + x, 21], [cx + x, 90]], 0.7, grey(0.46 + 0.5 * Math.sqrt(1 - (x * x) / 37)));
                    fillPts(q, [[cx - 11.6, SPRING - 0.6], [cx + 11.6, SPRING - 0.6], [cx + 11.6, SPRING + 3.4], [cx - 11.6, SPRING + 3.4]], grey(0.95));
                    fillPts(q, [[cx - 10.6, SPRING + 3.4], [cx + 10.6, SPRING + 3.4], [cx + 6.4, 21], [cx - 6.4, 21]], grey(0.78));
                    for (const [yy, n, len] of [[SPRING + 5, 5, 6.4], [SPRING + 11, 4, 7]]) for (let k = 0; k < n; k++) {
                        const x = cx + ((k + 0.5) / n - 0.5) * (yy < SPRING + 8 ? 19 : 14.6);
                        fillPts(q, S.curve([[x, yy + len], [x - 2, yy + len * 0.4], [x, yy], [x + 2, yy + len * 0.4]], true, 4), grey(0.98));
                    }
                    fillPts(q, [[cx - 7.6, 90], [cx + 7.6, 90], [cx + 9.6, 93.4], [cx + 9.6, 96.4], [cx - 9.6, 96.4], [cx - 9.6, 93.4]], grey(0.86));
                }
                // the sill, and under it a plinth of small blind arches
                fillPts(q, [[-83, 96], [83, 96], [83, 100], [-83, 100]], grey(0.88));
                fillPts(q, [[-83, 100], [83, 100], [83, 128], [-83, 128]], grey(0.42));
                for (let i = 0; i < 9; i++) {
                    const cx = (i - 4) * 18.2, a2 = [[cx - 6.2, 126], [cx - 6.2, 112]];
                    for (let k = 0; k <= 10; k++) a2.push(pol(6.9, Math.PI + 0.45 + ((Math.PI - 0.9) * k) / 10, cx, 111.6));
                    a2.push([cx + 6.2, 112], [cx + 6.2, 126]);
                    fillPts(q, a2, grey(0.2));
                    strokePts(q, a2, 1.3, grey(0.72));
                    fillPts(q, S.curve([[cx, 124], [cx - 2.6, 119], [cx, 113.6], [cx + 2.6, 119]], true, 4), grey(0.55));
                }
                strokePts(q, [[-83, 128.6], [83, 128.6]], 1.6, grey(0.8));
                for (let x = -80; x <= 80; x += 3.2) grain(q, [x, 133.4], 1.05, 0.8);
            },
            tint: (x, y, tone, rgb, m, f) => {
                // ivory: a fine grain along the tusk, yellower in the hollows, where old paint and dust have stayed
                const gr = S.noise2(x * 3.1 + 0.3 * Math.sin(y * 0.05), y * 0.035, 131) * 0.6 + S.noise2(x * 7, y * 0.08, 132) * 0.4, k = 1 + 0.045 * gr;
                rgb[0] *= k;
                rgb[1] *= k;
                rgb[2] *= k * (1 - 0.02 * gr);
                const n = S.noise2(x * 0.05, y * 0.05, 133) * 0.6 + S.noise2(x * 0.2, y * 0.2, 134) * 0.4, low = smooth(0.36, 0.14, f);
                const ks = clamp(0.3 * low + 0.34 * smooth(0.1, 0.7, n), 0, 0.6), fs = 0.5 + 0.6 * tone;
                rgb[0] += (176 * fs - rgb[0]) * ks;
                rgb[1] += (128 * fs - rgb[1]) * ks;
                rgb[2] += (74 * fs - rgb[2]) * ks;
            },
            glaze: (sp) => {
                // what is left of its paint: red on every other voussoir, a blue ground behind the leaves, gilding rubbed nearly away
                glaze(sp, res, 'multiply', (q) => {
                    for (const v of vous) if (v.red) fillPts(q, v.pts, 'rgba(186,58,50,0.9)');
                    q.save();
                    spandrel(q);
                    q.fillStyle = 'rgba(104,132,176,0.62)';
                    q.fillRect(-83, -111, 166, 115);
                    // carved in relief: the frame's wall shades the ground on the lamp's side, the arch
                    // and every leaf shade it on the other
                    const sh = sp.env.sh;
                    q.filter = `blur(${(1.3 * res).toFixed(1)}px)`;
                    strokePts(q, [[-83, -111], [83, -111], [83, 6], [-83, 6]].map(([x, y]) => [x + sh[0] * 2.4, y + sh[1] * 2.4]), 7, 'rgba(52,34,60,0.6)', true);
                    strokePts(q, arc(RO + 3.8).map(([x, y]) => [x + sh[0] * 3, y + sh[1] * 3]), 7, 'rgba(52,34,60,0.6)');
                    q.filter = `blur(${(0.5 * res).toFixed(1)}px)`;
                    for (const lf of leaves) fillPts(q, lf.map(([x, y]) => [x + sh[0] * 1.5, y + sh[1] * 1.5]), 'rgba(52,34,60,0.5)');
                    for (const st of stems) strokePts(q, st.map(([x, y]) => [x + sh[0] * 1.3, y + sh[1] * 1.3]), 1.6, 'rgba(52,34,60,0.4)');
                    q.restore();
                    q.filter = `blur(${(1.4 * res).toFixed(1)}px)`;
                    // the columns and the arch stand clear of the wall
                    for (const sx of [-1, 1]) strokePts(q, [[sx * (jx + 10.6) + sh[0] * 9, 22], [sx * (jx + 10.6) + sh[0] * 9, 94]], 5, 'rgba(70,50,70,0.4)');
                    q.filter = `blur(${(1.6 * res).toFixed(1)}px)`;
                    for (let i = 0; i < 16; i++) disc(q, [(r() - 0.5) * 2 * W, (r() - 0.5) * 2 * H], 4 + r() * 10, `rgba(160,118,76,${(0.06 + r() * 0.1).toFixed(3)})`);
                });
                glaze(sp, res, 'source-over', (q) => {
                    q.filter = `blur(${(0.3 * res).toFixed(1)}px)`;
                    q.save();
                    spandrel(q);
                    for (const lf of leaves) if (r() < 0.45) fillPts(q, lf, `rgba(214,164,70,${(0.2 + r() * 0.3).toFixed(2)})`);
                    q.restore();
                    for (const b of bosses) disc(q, b, 3.4, 'rgba(214,164,70,0.5)');
                    for (const st of script) if (r() < 0.3) strokePts(q, st, 0.8, 'rgba(214,164,70,0.45)');
                });
            },
            after: (g, { sh, lit }) => {
                const edge = (pts, w, a, closed = false) => {
                    strokePts(g, pts.map(([x, y]) => [x - sh[0] * 0.4, y - sh[1] * 0.4]), w, `rgba(52,34,48,${a})`, closed);
                    strokePts(g, pts.map(([x, y]) => [x + sh[0] * 0.45, y + sh[1] * 0.45]), w * 0.6, `rgba(255,250,232,${a * 0.6})`, closed);
                };
                // the knife's lines: every joint of the arch, the veins of the leaves, the columns' flutes
                for (const v of vous) {
                    edge(v.pts, 0.42, 0.8, true);
                    if (!v.red) {
                        // the pale voussoirs are carved: a sprig along each
                        const d = [Math.cos(v.a), Math.sin(v.a)], n2 = [-d[1], d[0]], P = (u, w2) => [v.mid[0] + d[0] * u + n2[0] * w2, v.mid[1] + d[1] * u + n2[1] * w2];
                        strokePts(g, [P(-8, 0), P(8, 0)], 0.4, 'rgba(70,48,52,0.75)');
                        for (const u of [-5, -1, 3]) for (const sg of [-1, 1]) strokePts(g, [P(u, 0), P(u + 2.4, sg * 2.4), P(u + 4.6, sg * 2.2)], 0.36, 'rgba(70,48,52,0.7)');
                    } else {
                        const d = [Math.cos(v.a), Math.sin(v.a)];
                        for (let k = 0; k < 5; k++) {
                            const u = (r() - 0.5) * 16, w2 = (r() - 0.5) * 5, c = [v.mid[0] + d[0] * u - d[1] * w2, v.mid[1] + d[1] * u + d[0] * w2];
                            disc(g, c, 0.5 + r() * 0.9, 'rgba(238,224,190,0.5)'); // (the red has flaked)
                        }
                    }
                }
                g.save();
                spandrel(g);
                for (const lf of leaves) {
                    strokePts(g, lf, 0.34, 'rgba(52,34,48,0.75)', true);
                    strokePts(g, [lf[0], lerpP(lf[0], lf[Math.floor(lf.length / 2)], 0.8)], 0.3, 'rgba(52,34,48,0.6)');
                    strokePts(g, [lerpP(lf[0], lf[Math.floor(lf.length / 2)], 0.3), lerpP(lf[Math.floor(lf.length / 4)], lf[Math.floor(lf.length / 2)], 0.3)], 0.24, 'rgba(52,34,48,0.5)');
                }
                for (const st of stems) edge(st, 0.3, 0.5);
                g.restore();
                edge(arc(RO + 3.8), 0.4, 0.7);
                edge(arc(RO + 1), 0.36, 0.6);
                edge(arc(RI + 2.1), 0.36, 0.6);
                edge([[-86, -114], [86, -114], [86, 108], [-86, 108]], 0.4, 0.7, true);
                edge([[-83, -111], [83, -111], [83, 4], [-83, 4]], 0.36, 0.6, true);
                for (const st of script) strokePts(g, st.map(([x, y]) => [x - sh[0] * 0.45, y - sh[1] * 0.45]), 0.3, 'rgba(52,34,48,0.7)');
                for (const sx of [-1, 1]) {
                    const cx = sx * (jx + 10.6);
                    // veined marble, drawn on the ivory with the point
                    for (let k = 0; k < 5; k++) {
                        const x0 = cx + (r() - 0.5) * 9, y0 = 24 + r() * 50, vein = S.curve([[x0, y0], [x0 + (r() - 0.5) * 5, y0 + 6], [x0 + (r() - 0.5) * 6, y0 + 13], [x0 + (r() - 0.5) * 7, y0 + 20]], false, 5);
                        S.ink(g, vein, { w: 0.4, color: '#6a4a52', alpha: 0.55, taper: [0.6, 0.9] });
                    }
                    for (const yy of [21, 23, 88, 90, 93.4]) strokePts(g, [[cx - 7.4, yy], [cx + 7.4, yy]], 0.36, 'rgba(52,34,48,0.75)');
                    edge([[cx - 11.6, SPRING + 3.4], [cx + 11.6, SPRING + 3.4]], 0.4, 0.8);
                }
                // age cracks along the grain, a few wide enough to hold dirt
                for (let i = 0; i < 7; i++) {
                    const x0 = (r() - 0.5) * 190, y0 = -H + 6 + r() * (H * 2 - 60), len = 10 + r() * 34, cr = [];
                    for (let k = 0; k <= 8; k++) cr.push([x0 + 1.6 * S.noise2(k * 0.6, i * 3.1, 141), y0 + (len * k) / 8]);
                    S.ink(g, cr, { w: 0.35 + r() * 0.4, color: '#3a2638', alpha: 0.6, taper: [1, 1] });
                    S.ink(g, cr.map(([x, y]) => [x + 0.5, y]), { w: 0.25, color: '#fffaea', alpha: 0.5, taper: [1, 1] });
                }
                // the pin holes' bruised rims, the chip's raw edge
                for (const sx of [-1, 1]) for (const sy of [-1, 1]) strokePts(g, S.ellipse(sx * (W - 6.4), sy * (H - 6.4), 2, 2, 12), 0.5, 'rgba(110,80,60,0.5)', true);
                strokePts(g, [[W - 3.2, 61.6], [W - 1.9, 66], [W - 4.1, 69.4]], 0.5, 'rgba(255,250,232,0.8)');
            },
            air: [{ color: '#8a6a58', alpha: 0.55, w: 12 }, { color: '#4a3550', alpha: 0.6, w: 4 }, { color: '#fffaea', alpha: 0.6, w: 6, lit: true }, { color: '#b99a80', alpha: 0.6, w: 1.4, push: 0.5 }],
        });
    }

    function mihrab(g, o = {}) {
        const seed = o.seed ?? 'mihrab';
        sheet(g, o, { x: -110, y: -150, w: 220, h: 300 }, (q, F) => {
            const res = resOf(q), { C, RI, SPRING, opening, jx } = NICHE;
            const sp = nicheSprite(F.rot, res, seed);
            stamp(q, F, sp, { lw: 2.2, heavy: 0.85 });
            // inside the arch: darkness, deepest at the top, a breath of the lamp's light low on the back wall
            const op = F.pts(opening);
            S.piece(q, op, {
                fill: '#0d0b1f', line: 1.3, heavy: 0.2,
                detail: (d) => {
                    const c = F([0, 34]), gr = d.createRadialGradient(c[0], c[1], 2, c[0], c[1], 70);
                    for (const [u, col] of [[0, 'rgba(120,84,60,0.75)'], [0.3, 'rgba(70,44,56,0.6)'], [0.7, 'rgba(26,20,48,0.4)'], [1, 'rgba(13,11,31,0)']]) gr.addColorStop(u, col);
                    fillPts(d, op, gr);
                    // the niche is a shell: its back curves away, a few faint ribs gather at the crown
                    for (let k = -3; k <= 3; k++) S.ink(d, F.pts(S.curve([[k * 3, C[1] - RI + 8], [k * 9.6, C[1] - 12], [k * 12.4, 30], [k * 12, 94]], false, 8)), { w: 0.6, color: '#3a3058', alpha: 0.5, taper: [0.9, 0.2] });
                    // the arch's thickness: its soffit catches a little of the lamp on the lit side's far edge
                    S.spray(d, op, { color: '#05040f', alpha: 0.85, w: 12, push: 8, dir: TOL });
                    S.spray(d, op, { color: '#c9a070', alpha: 0.36, w: 3, push: 1.6 });
                    // the floor of the niche, seen a little from above
                    const fl = F.pts([[-jx, 96], [-jx + 9, 86], [jx - 9, 86], [jx, 96]]), fg = d.createLinearGradient(...F([0, 86]), ...F([0, 96]));
                    fg.addColorStop(0, 'rgba(60,44,60,0.9)');
                    fg.addColorStop(1, 'rgba(120,96,90,0.9)');
                    fillPts(d, fl, fg);
                    S.ink(d, F.pts([[-jx + 9, 86], [jx - 9, 86]]), { w: 0.5, color: '#a08070', alpha: 0.7, taper: [0, 0] });
                },
            });
            // the lamp: a glass bowl in a brass collar, on three chains from a hook at the crown
            const hook = [0, C[1] - RI + 2.4], L = [0, 18];
            for (const [dx, ph] of [[-7.4, 0], [7.4, 1], [0, 1]]) chain(q, F.pts([hook, [dx * 0.6, hook[1] + 20], [dx, L[1] - 9.6]]), { len: 3.6, w: 0.7, line: 0.4, phase: ph, seed: seed + dx, col: Au });
            ring(q, F([0, hook[1] + 0.8]), 1.7, 1.9, F.rot, 0.8, Au, 0.5);
            const glass = F.pts(S.curve(sym2([[7.6, -10], [9, -5], [10.4, 0.6], [8.4, 7], [4.4, 11.4], [0, 12.6]]).map(([x, y]) => [L[0] + x, L[1] + y]), true, 5));
            S.piece(q, glass, {
                fill: '#f2c064', line: 1, ink: '#3a1c1a', heavy: 0.4,
                detail: (d) => {
                    const c = F([L[0], L[1] - 1]), gr = d.createRadialGradient(c[0], c[1], 0.5, c[0], c[1], 13);
                    for (const [u, col] of [[0, '#fffbe0'], [0.3, '#ffdc86'], [0.65, '#e89a3c'], [1, '#9a4a20']]) gr.addColorStop(u, col);
                    fillPts(d, glass, gr);
                    // enamelled glass: a blue band with gold dots round its belly, oil and the wick's float inside
                    S.ink(d, F.pts(hoop(L[0], L[1] + 1.4, 10.4, 0.16)), { w: 2, color: '#2a4a9c', alpha: 0.6, taper: [0, 0] });
                    for (let k = -3; k <= 3; k++) disc(d, F([L[0] + k * 2.7, L[1] + 2.4 + 1.2 * Math.sqrt(Math.max(0, 1 - (k * k) / 12.6))]), 0.45, 'rgba(255,236,170,0.9)');
                    S.ink(d, F.pts(hoop(L[0], L[1] + 5.4, 8.6, 0.18)), { w: 0.5, color: '#7a3a16', alpha: 0.7, taper: [0, 0] });
                    S.ink(d, F.pts([[L[0] - 6.6, L[1] - 6], [L[0] - 7.6, L[1] - 1], [L[0] - 6.4, L[1] + 4]]), { w: 0.9, color: '#fffdf0', alpha: 0.85 });
                },
            });
            const collar = F.pts([[L[0] - 8.4, L[1] - 12.4], [L[0] + 8.4, L[1] - 12.4], [L[0] + 7.6, L[1] - 9.4], [L[0] - 7.6, L[1] - 9.4]]);
            S.piece(q, collar, { fill: Au.base, line: 0.9, shade: { color: Au.deep, alpha: 0.9, w: 2.4 }, light: { color: Au.glint, alpha: 0.9, w: 1.4 } });
            for (const dx of [-7.4, 0, 7.4]) bead(q, F([L[0] + dx, L[1] - 11]), 0.9, Au, 0.4);
            bead(q, F([L[0], L[1] + 14]), 1.5, Au, 0.5);
            return (a) => {
                const Fu = upright(F, [L[0], L[1] - 3]).sub(L[0], L[1] - 3);
                glow(a, Fu([0, 0]), 40, 0.8);
                flame(a, Fu, { h: 6.4, w: 2.8, lean: -0.3, seed, soot: false });
            };
        });
    }

    return { cirio, incensario, rosario, lampara, jamsa, mihrab, flame, glow, chain, bead, smoke };
})();
