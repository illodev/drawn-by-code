// The printed papers that lie in the corners of the emblem's collage, behind the main
// pieces: a letterpress poster, a street-name tile plaque, a lottery ticket, a postage
// stamp with its postmark, a matchbox. Global: Papers. Sizes at s = 1, the anchor in the
// middle of each:
//   Papers.poster(g, { x, y, s, rot, seed, ground })     420 × 600
//   Papers.plaque(g, { x, y, s, rot, seed, ground })     333 × 146 (the ten tiles 322 × 127)
//   Papers.ticket(g, { x, y, s, rot, seed, ground })     300 × 140
//   Papers.stamp(g, { x, y, s, rot, seed, ground })       90 × 110
//   Papers.matchbox(g, { x, y, s, rot, seed, ground })   a box 150 × 100 × 40 seen from above,
//       a little from the front and the left: its sleeve covers 163 × 106 about the anchor,
//       the open tray reaches x = +120 and the head of a match lying on its rim x = +134
// `ground` (0, the default: none) paints a soft shadow under the thing as paint of its own:
// on a transparent layer `Souvenir.cast` has nothing to fall on.
//
// Everything printed is ORIGINAL design in the manner of old Spanish jobbing print; the
// words are the film's (Spanish) and the facts are history, the layouts are ours.
// Faces: 'IM Fell DW Pica SC', 'Anton', 'Lora', 'Shrikhand', 'Titan One' (the scene loads them).
//
// How they are made. Flat print carries no light, so each thing's print is set once, in its
// own coordinates, on a sheet of its own (paper stock, then one forme per ink, each with a
// letterpress skin: mottled solids, a denser rim, ink rubbed off the folds), cached by seed
// and resolution, and pasted turned by `rot`. Everything that takes the light (folds, curls,
// torn fibre, bevels, glaze, shadows, the contour) is geometry turned point by point through
// a frame, so the light stays at the top left however the thing is turned.
//
// What each one is, and the small true things painted on it:
//
// POSTER (cartel): a sheet of thin pink-cream poster stock printed letterpress in black and
// red: a border of rules with a row of typographic flowers and corner pieces, lines of
// wood and metal type in five faces, a wood-engraved vignette, the printer's line.
//   1 it was folded in four: the first fold runs the whole width one way, the second is a
//     valley in one half and a ridge in the other   2 the ink is worn off along the folds
//   3 where the folds cross the paper has worn through   4 a tear starts at the end of a
//     fold   5 a corner tore off round its drawing pin, the fibre white in the tear
//   6 the pins left a pale disc, a rust ring and a drip under the other corners   7 one
//     corner curls and shows the unprinted back   8 foxing in clusters, a glass ring, a
//     water stain with its tide line, fly specks   9 letterpress: solids mottle, edges take
//     more ink, the red is a hair out of register   10 the back's print shows through,
//     mirrored; in the border one flower was set sideways, one fell out, one is from
//     another fount; the town hall's violet rubber stamp, without which no bill was posted
//
// PLAQUE (azulejo): ten hand-made tiles in two rows on a bed of lime mortar; white tin
// glaze, cobalt brushwork, antimony yellow.
//   1 every tile is its own size and tone and sits a little askew, so the painting jogs at
//     the joints   2 the glaze pools pale at the rounded edges and the biscuit shows warm
//   3 cobalt goes almost black where the brush overlapped and pale where it ran dry   4 it
//     bled a little into the glaze in the kiln   5 crazing   6 a corner chipped to the
//     terracotta, with the glaze's white edge round the chip   7 pinholes and kiln specks
//   8 one tile cracked across   9 a pomegranate, the city's sign, either side of «CALLE DE»
//   10 whitewash splashed over the edge when the wall was limed, a rusty nail in the mortar
//
// TICKET (décimo): thin security paper, an underprint of guilloche in two inks, a number in
// a fat Clarendon-like face, an engraved vignette, a rubber stamp over it.
//   1 guilloche: families of fine sine lines that weave bands, and a rosette of lobed rings
//   2 the vignette is engraved: hatching that follows the form and thickens in the shade
//   3 the number was overprinted later, heavier and a little crooked   4 the stamp is
//     violet aniline, starved on one side and doubled on the other   5 two edges are
//     perforated and torn, tags of paper between the holes   6 folded once to fit a wallet
//   7 a line of tiny type along the foot   8 a dog-ear   9 the thumb's grime at one corner
//   10 the serie and fracción set by hand in a smaller face
//
// STAMP (sello): line-engraved in one colour on toned paper, perforated.
//   1 teeth one by one, none quite like the next, one pulled short   2 the design sits a
//     little off centre inside the perforation   3 the vignette is all lines: a ruled sky
//     that closes towards the edge, cross-contours on the fruit   4 a pearl border
//   5 the legend in a ruled tablet   6 the value in a tablet of its own, a star in each
//     corner square   7 the postmark is oily black, heavy on one side and starved on the
//     other, cut off by the stamp's own edge   8 its date between two bars   9 the gum has
//     toned the tips of the teeth   10 a corner crease
//
// MATCHBOX (caja de cerillas): a sleeve of thin board covered in blue paper, a label pasted
// on top, a striking strip down the long side, a tray of bare board with the matches in it.
//   1 the label is printed in three flat inks, the yellow out of register   2 it is worn
//     through to the board at the corners and along the edges   3 the strip is a gritty
//     brown, scratched pale where matches were struck, with two burns   4 the tray is
//     open: its walls show their thickness   5 the sleeve's shadow falls into the tray
//   6 the matches are square sticks of poplar with dipped heads, one head chipped   7 one
//     match lies across the tray's rim   8 the blue paper overlaps at the side with a seam
//   9 a dent in the lid   10 the price in pencil on a corner of the label
const Papers = (() => {
    const S = Souvenir;
    const INK = S.INK, SD = S.SHADE_DIR, TOL = [-SD[0], -SD[1]]; // TOL: towards the light, on the page
    const TAU = Math.PI * 2;
    const LV = (() => {
        const L = S.LIGHT, l = Math.hypot(L[0], L[1], L[2]);
        return [L[0] / l, L[1] / l, L[2] / l];
    })();
    const FACE = { fell: '"IM Fell DW Pica SC", Georgia, serif', anton: 'Anton, Impact, sans-serif', lora: 'Lora, Georgia, serif', shri: 'Shrikhand, Georgia, serif', titan: '"Titan One", Impact, sans-serif' };
    const cache = new Map();
    const memo = (key, fn) => {
        if (!cache.has(key)) cache.set(key, fn());
        return cache.get(key);
    };
    const clamp = S.clamp;
    const rotP = (p, a) => {
        const c = Math.cos(a), s = Math.sin(a);
        return [p[0] * c - p[1] * s, p[0] * s + p[1] * c];
    };
    const dot2 = (a, b) => a[0] * b[0] + a[1] * b[1];
    const lerpP = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
    const dist = (a, b) => Math.hypot(b[0] - a[0], b[1] - a[1]);
    const pol = (r, a, cx = 0, cy = 0) => [cx + Math.cos(a) * r, cy + Math.sin(a) * r];

    // A frame maps a part's own coordinates to the drawer's: every point that takes the
    // light goes through it, the context is never rotated for those (see things/charms.js).
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
    // Flat print in the part's own coordinates: here, and only here, the context is turned.
    const onFrame = (g, F, fn) => {
        const o = F([0, 0]);
        g.save();
        g.translate(o[0], o[1]);
        g.rotate(F.rot);
        g.scale(F.s, F.s);
        fn(g);
        g.restore();
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
    // a dry-brush stroke along a few points: the kit's `dab` wants its path walked finely
    // (its bristles lift and land between points), so the path is resampled first
    const dense = (pts, n = 18) => {
        const c = pts.length > 2 ? S.curve(pts, false, 8) : pts, L = [0];
        for (let i = 1; i < c.length; i++) L.push(L[i - 1] + dist(c[i - 1], c[i]));
        const out = [], T = L[L.length - 1] || 1;
        for (let k = 0, i = 1; k < n; k++) {
            const d = (k / (n - 1)) * T;
            while (i < c.length - 1 && L[i] < d) i++;
            out.push(lerpP(c[i - 1], c[i], (d - L[i - 1]) / (L[i] - L[i - 1] || 1)));
        }
        return out;
    };
    const dab = (q, pts, o) => S.dab(q, dense(pts), o);
    const cutting = (q, fn) => {
        q.save();
        q.globalCompositeOperation = 'destination-out';
        q.fillStyle = q.strokeStyle = '#000';
        fn(q);
        q.restore();
    };
    // a soft patch of colour on what is already painted
    const blob = (q, p, rad, rgb, a) => {
        const gr = q.createRadialGradient(p[0], p[1], 0, p[0], p[1], rad);
        gr.addColorStop(0, `rgba(${rgb},${a})`);
        gr.addColorStop(1, `rgba(${rgb},0)`);
        q.fillStyle = gr;
        q.fillRect(p[0] - rad, p[1] - rad, rad * 2, rad * 2);
    };
    // a band of colour that fades away from the line a–b towards the side `n` points to
    const fadeBand = (q, a, b, n, w, rgb, alpha) => {
        const gr = q.createLinearGradient(a[0], a[1], a[0] + n[0] * w, a[1] + n[1] * w);
        gr.addColorStop(0, `rgba(${rgb},${alpha})`);
        gr.addColorStop(1, `rgba(${rgb},0)`);
        fillPts(q, [a, b, [b[0] + n[0] * w, b[1] + n[1] * w], [a[0] + n[0] * w, a[1] + n[1] * w]], gr);
    };

    // ------------------------------------------------------------------ sheets and textures
    // Pixels per unit for a flat print: a little over the output's (it is pasted turned),
    // within what a canvas of its size can hold.
    const resFor = (g, box, max = 7e6) => {
        const want = Math.ceil(S.pxScale(g) * 1.5 * 2 - 1e-6) / 2;
        const cap = Math.floor(Math.sqrt(max / (box.w * box.h)) * 2) / 2;
        return Math.max(1, Math.min(want, cap, 9));
    };
    function sheet(box, res) {
        const c = document.createElement('canvas');
        c.width = Math.max(2, Math.ceil(box.w * res));
        c.height = Math.max(2, Math.ceil(box.h * res));
        const q = c.getContext('2d');
        q.setTransform(res, 0, 0, res, -box.x * res, -box.y * res);
        return { c, q };
    }
    // value noise that wraps (for tiles laid as a repeating pattern), x and y in 0..1 → −1..1
    function pnoise(x, y, cells, seed) {
        const fx = x * cells, fy = y * cells, xi = Math.floor(fx), yi = Math.floor(fy);
        let u = fx - xi, v = fy - yi;
        u = u * u * (3 - 2 * u);
        v = v * v * (3 - 2 * v);
        const h = (i, j) => S.hashI(((i % cells) + cells) % cells, ((j % cells) + cells) % cells, 0, seed);
        const a = h(xi, yi) + (h(xi + 1, yi) - h(xi, yi)) * u, b = h(xi, yi + 1) + (h(xi + 1, yi + 1) - h(xi, yi + 1)) * u;
        return (a + (b - a) * v) * 2 - 1;
    }
    // 256 × 256 tiles of texture, made once:
    //   mottle  how much ink a letterpress solid failed to take (alpha): slow blotches, the
    //           paper's tooth, pick-outs          dry: a starved impression (a rubber stamp)
    //   grain   the paper's tooth: dark and light specks        grit: a coarse sanded surface
    const tiles = new Map();
    function tile(kind) {
        if (tiles.has(kind)) return tiles.get(kind);
        const N = 256, c = document.createElement('canvas');
        c.width = c.height = N;
        const q = c.getContext('2d'), im = q.createImageData(N, N), d = im.data;
        for (let i = 0; i < N * N; i++) {
            const x = i & 255, y = i >> 8, u = x / N, v = y / N;
            const blot = pnoise(u, v, 9, 11) * 0.6 + pnoise(u, v, 23, 12) * 0.4;
            const fine = S.hashI(x, y, 0, 13), fine2 = S.hashI(x >> 1, y >> 1, 1, 14);
            let a = 0, col = 0;
            if (kind === 'mottle') {
                a = 0.11 + 0.17 * blot + 0.2 * (fine - 0.5) + 0.16 * (fine2 - 0.5) + (fine > 0.988 ? 0.5 : 0) + (fine2 > 0.993 ? 0.45 : 0);
            } else if (kind === 'dry') {
                const slow = pnoise(u, v, 5, 21);
                a = 0.4 + 0.42 * slow + 0.3 * blot + 0.5 * (fine - 0.5) + 0.36 * (fine2 - 0.5);
            } else if (kind === 'grain') {
                const g2 = (fine - 0.5) * 0.7 + (fine2 - 0.5) * 0.5 + pnoise(u, v, 40, 15) * 0.2;
                col = g2 < 0 ? 46 : 255;
                a = Math.abs(g2) * (g2 < 0 ? 0.5 : 0.42);
            } else if (kind === 'grit') {
                const g2 = (fine - 0.5) * 1.1 + (fine2 - 0.5) * 0.7 + blot * 0.25;
                col = g2 < 0 ? 14 : 235;
                a = Math.pow(Math.abs(g2), 1.3) * (g2 < 0 ? 0.95 : 0.6);
            }
            d[i * 4] = d[i * 4 + 1] = d[i * 4 + 2] = col;
            d[i * 4 + 3] = clamp(a, 0, 0.94) * 255;
        }
        q.putImageData(im, 0, 0);
        tiles.set(kind, c);
        return c;
    }
    // lays a tile over `box`, one texel `u` units wide
    const lay = (q, kind, box, u, alpha = 1, op = 'source-over', off = [0, 0]) => {
        const pat = q.createPattern(tile(kind), 'repeat');
        pat.setTransform(new DOMMatrix().translate(off[0], off[1]).scale(u));
        q.save();
        q.globalCompositeOperation = op;
        q.globalAlpha = alpha;
        q.fillStyle = pat;
        q.fillRect(box.x, box.y, box.w, box.h);
        q.restore();
    };

    // One forme, one ink. Whatever `draw(q)` paints (any opaque colour; cut whites with
    // `cutting`) is printed in `color` with a letterpress skin: the solid mottles, a rim
    // `rim` units wide just inside every edge takes more ink (the squash), and `wear(q)`
    // (painting in destination-out) rubs it off again.
    function inked(box, res, draw, o = {}) {
        const { c, q } = sheet(box, res);
        q.fillStyle = q.strokeStyle = '#000';
        draw(q);
        const W = c.width, H = c.height, squash = o.squash ?? 0.5;
        let rim = null;
        if (squash > 0 || o.pool) {
            const d = (o.pool?.w ?? o.rim ?? 0.3) * res, e = document.createElement('canvas');
            e.width = W;
            e.height = H;
            const eq = e.getContext('2d');
            eq.drawImage(c, 0, 0);
            eq.globalCompositeOperation = 'destination-in';
            for (let k = 0; k < 6; k++) eq.drawImage(c, Math.cos((k * TAU) / 6) * d, Math.sin((k * TAU) / 6) * d);
            rim = document.createElement('canvas');
            rim.width = W;
            rim.height = H;
            const rq = rim.getContext('2d');
            rq.drawImage(c, 0, 0);
            rq.globalCompositeOperation = 'destination-out';
            rq.drawImage(e, 0, 0);
        }
        const kind = o.tile ?? 'mottle', m = o.mottle ?? 1;
        if (m > 0) {
            lay(q, kind, box, 0.29, m, 'destination-out');
            lay(q, kind, box, 0.47, m * 0.6, 'destination-out', [13, 7]);
        }
        if (rim && squash > 0) {
            q.save();
            q.setTransform(1, 0, 0, 1, 0, 0);
            q.globalAlpha = squash;
            q.drawImage(rim, 0, 0);
            q.restore();
        }
        if (o.wear) {
            q.save();
            q.globalCompositeOperation = 'destination-out';
            q.fillStyle = q.strokeStyle = '#000';
            o.wear(q);
            q.restore();
        }
        q.save();
        q.globalCompositeOperation = 'source-in';
        q.fillStyle = o.color ?? '#27212a';
        q.fillRect(box.x, box.y, box.w, box.h);
        q.restore();
        // a brush's paint instead of a press's ink: strokes inside it (`over`), pigment pooled
        // at its edges (`pool`), a little of it bled into the ground (`bleed`)
        if (o.over) {
            q.save();
            q.globalCompositeOperation = 'source-atop';
            o.over(q);
            q.restore();
        }
        if (o.pool) {
            const rq = rim.getContext('2d');
            rq.globalCompositeOperation = 'source-in';
            rq.fillStyle = o.pool.color;
            rq.fillRect(0, 0, W, H);
            q.save();
            q.setTransform(1, 0, 0, 1, 0, 0);
            q.globalCompositeOperation = 'source-atop';
            q.globalAlpha = o.pool.alpha ?? 0.5;
            q.drawImage(rim, 0, 0);
            q.restore();
        }
        if (o.bleed) {
            const b = document.createElement('canvas');
            b.width = W;
            b.height = H;
            b.getContext('2d').drawImage(c, 0, 0);
            q.save();
            q.setTransform(1, 0, 0, 1, 0, 0);
            q.globalCompositeOperation = 'destination-over';
            q.filter = `blur(${(o.bleed.blur * res).toFixed(2)}px)`;
            q.globalAlpha = o.bleed.alpha ?? 0.4;
            q.drawImage(b, 0, 0);
            q.restore();
        }
        return c;
    }
    // prints a forme on the stock: the ink is a film over the paper, never opaque
    const print = (q, box, forme, alpha = 1, dx = 0, dy = 0) => {
        q.save();
        q.globalCompositeOperation = 'multiply';
        q.globalAlpha = alpha;
        q.imageSmoothingQuality = 'high';
        q.drawImage(forme, box.x + dx, box.y + dy, box.w, box.h);
        q.restore();
    };

    // Ink rubbed off along a line (a fold, an edge): painted in destination-out.
    function rub(k, a, b, seed, amt = 1) {
        const r = Motion.rng('rub/' + seed), L = dist(a, b), n = Math.round(L / 1.7);
        const t = [(b[0] - a[0]) / L, (b[1] - a[1]) / L];
        k.save();
        for (let i = 0; i < n; i++) {
            const u = (i + r()) / n, p = lerpP(a, b, u), heavy = 0.35 + 0.65 * Math.pow(0.5 + 0.5 * Motion.noise1('rubn/' + seed, u * 9), 2);
            const across = (0.3 + r() * r() * 2.4) * amt * heavy, along = 0.6 + r() * 2.6, off = (r() - 0.5) * 1.3;
            k.globalAlpha = Math.min(1, (0.3 + r() * 0.7) * heavy * 1.3);
            k.beginPath();
            k.ellipse(p[0] - t[1] * off, p[1] + t[0] * off, along, across, Math.atan2(t[1], t[0]) + (r() - 0.5) * 0.5, 0, TAU);
            k.fill();
        }
        k.restore();
    }

    // ------------------------------------------------------------------ type and ornaments
    const capOf = (q, fam) => memo('cap/' + fam, () => {
        q.save();
        q.font = `100px ${fam}`;
        const m = q.measureText('H').actualBoundingBoxAscent / 100;
        q.restore();
        return m || 0.7;
    });
    // One line of type. o: font (a family), cap (the height of its capitals) or size, x, y (the
    // baseline), align (0.5), track (ems after every glyph), fit (the most width it may take:
    // the size gives way), sx / sy (the face stretched), slant, dx / dy (moved: a shade),
    // stroke (a line round every glyph, in units), hollow (the line only), cut (knocks the
    // glyphs out of what is there). Returns { size, width, cap, x0, x1 }.
    function type(q, text, o) {
        const fam = o.font, track = o.track ?? 0, sx = o.sx ?? 1, sy = o.sy ?? 1;
        q.save();
        let size = o.size ?? o.cap / capOf(q, fam) / sy;
        const widthAt = (sz) => {
            q.font = `${sz.toFixed(3)}px ${fam}`;
            q.letterSpacing = `${(track * sz).toFixed(3)}px`;
            return (q.measureText(text).width - track * sz) * sx;
        };
        let w = widthAt(size);
        if (o.fit && w > o.fit) {
            size *= o.fit / w;
            w = widthAt(size);
        }
        const x0 = (o.x ?? 0) - w * (o.align ?? 0.5);
        q.textBaseline = 'alphabetic';
        q.textAlign = 'left';
        q.translate(x0 + (o.dx ?? 0), o.y + (o.dy ?? 0));
        if (o.rot) q.rotate(o.rot);
        q.transform(sx, 0, -(o.slant ?? 0) * sy, sy, 0, 0);
        if (o.cut) q.globalCompositeOperation = 'destination-out';
        if (o.color) q.fillStyle = q.strokeStyle = o.color;
        if (o.alpha !== undefined) q.globalAlpha *= o.alpha;
        if (o.stroke) {
            q.lineWidth = o.stroke / Math.sqrt(sx * sy);
            q.lineJoin = 'round';
            q.strokeText(text, 0, 0);
        }
        if (!o.hollow) q.fillText(text, 0, 0);
        q.restore();
        return { size, width: w, cap: capOf(q, fam) * size * sy, x0, x1: x0 + w };
    }
    // text round a circle: centred on angle `mid` (−π/2 is the top), reading clockwise on the
    // outside of the baseline (`inside`: anticlockwise, feet towards the middle's far side)
    function arcType(q, text, cx, cy, R, mid, o) {
        q.save();
        q.font = `${o.size}px ${o.font}`;
        q.textBaseline = 'alphabetic';
        q.textAlign = 'center';
        if (o.color) q.fillStyle = q.strokeStyle = o.color;
        if (o.cut) q.globalCompositeOperation = 'destination-out';
        const chars = [...text], tr = (o.track ?? 0) * o.size, ws = chars.map((ch) => q.measureText(ch).width + tr);
        const total = ws.reduce((a, b) => a + b, 0) - tr, dir = o.inside ? -1 : 1;
        let sd = -total / 2;
        chars.forEach((ch, i) => {
            const a = mid + (dir * (sd + (ws[i] - tr) / 2)) / R;
            q.save();
            q.translate(cx + Math.cos(a) * R + (o.dx ?? 0), cy + Math.sin(a) * R + (o.dy ?? 0));
            q.rotate(a + (dir * Math.PI) / 2);
            if (o.stroke) {
                q.lineWidth = o.stroke;
                q.lineJoin = 'round';
                q.strokeText(ch, 0, 0);
            }
            if (!o.hollow) q.fillText(ch, 0, 0);
            q.restore();
            sd += ws[i];
        });
        q.restore();
    }
    const starPts = (x, y, R, n = 8, ratio = 0.5, rot = -Math.PI / 2) => {
        const pts = [];
        for (let i = 0; i < n * 2; i++) pts.push(pol(i % 2 ? R * ratio : R, rot + (i * Math.PI) / n, x, y));
        return pts;
    };
    const star = (q, x, y, R, n = 8, ratio = 0.5, rot = -Math.PI / 2) => {
        q.beginPath();
        S.trace(q, starPts(x, y, R, n, ratio, rot));
        q.fill();
    };
    const lozenge = (q, x, y, rx, ry) => {
        q.beginPath();
        S.trace(q, [[x - rx, y], [x, y - ry], [x + rx, y], [x, y + ry]]);
        q.fill();
    };
    // Typographic flowers, each in a square of half-side 1 (a border is set from single sorts).
    function flowerA(q) {
        // a rosette: four petals and four seeds
        for (let k = 0; k < 4; k++) {
            q.save();
            q.rotate((k * Math.PI) / 2);
            q.beginPath();
            q.moveTo(0, -0.17);
            q.bezierCurveTo(0.48, -0.4, 0.38, -0.96, 0, -1);
            q.bezierCurveTo(-0.38, -0.96, -0.48, -0.4, 0, -0.17);
            q.fill();
            q.beginPath();
            q.arc(0.74, -0.74, 0.14, 0, TAU);
            q.fill();
            q.restore();
        }
        cutting(q, (k) => {
            k.lineWidth = 0.075;
            k.lineCap = 'round';
            for (let i = 0; i < 4; i++) {
                const a = (i * Math.PI) / 2;
                k.beginPath();
                k.moveTo(Math.sin(a) * 0.36, -Math.cos(a) * 0.36);
                k.lineTo(Math.sin(a) * 0.8, -Math.cos(a) * 0.8);
                k.stroke();
            }
            k.beginPath();
            k.arc(0, 0, 0.26, 0, TAU);
            k.fill();
        });
        q.beginPath();
        q.arc(0, 0, 0.14, 0, TAU);
        q.fill();
    }
    function flowerB(q) {
        // a bud between two leaves
        q.beginPath();
        q.moveTo(0, -1);
        q.bezierCurveTo(0.4, -0.62, 0.32, -0.1, 0, 0.04);
        q.bezierCurveTo(-0.32, -0.1, -0.4, -0.62, 0, -1);
        q.fill();
        for (const m of [-1, 1]) {
            q.beginPath();
            q.moveTo(m * 0.06, 0.94);
            q.bezierCurveTo(m * 0.16, 0.34, m * 0.5, -0.08, m * 0.97, -0.46);
            q.bezierCurveTo(m * 0.86, 0.2, m * 0.52, 0.74, m * 0.06, 0.94);
            q.fill();
        }
        lozenge(q, 0, 0.5, 0.13, 0.2);
        cutting(q, (k) => {
            k.lineWidth = 0.07;
            k.lineCap = 'round';
            k.beginPath();
            k.moveTo(0, -0.72);
            k.lineTo(0, -0.2);
            k.stroke();
            for (const m of [-1, 1]) {
                k.beginPath();
                k.moveTo(m * 0.2, 0.62);
                k.quadraticCurveTo(m * 0.42, 0.2, m * 0.74, -0.12);
                k.stroke();
            }
        });
    }
    // a corner piece: a block with an eight-pointed star cut in it
    function cornerPiece(q, R) {
        q.fillRect(-R, -R, R * 2, R * 2);
        cutting(q, (k) => {
            k.lineWidth = R * 0.09;
            k.strokeRect(-R * 0.8, -R * 0.8, R * 1.6, R * 1.6);
            star(k, 0, 0, R * 0.66, 8, 0.46);
        });
        star(q, 0, 0, R * 0.3, 4, 0.4);
    }
    // a swelled rule: two long wedges that thicken towards a lozenge in the middle
    function swelled(q, x0, x1, y, t) {
        const xm = (x0 + x1) / 2, gp = t * 2.6;
        for (const [a, b] of [[x0, xm - gp], [x1, xm + gp]]) {
            q.beginPath();
            q.moveTo(a, y);
            q.lineTo(b, y - t / 2);
            q.lineTo(b, y + t / 2);
            q.closePath();
            q.fill();
        }
        lozenge(q, xm, y, t * 1.5, t * 1.05);
    }

    // ------------------------------------------------------------------ paper
    // The stock: its colour, the years in it (warm blotches, paler places), the fibres of
    // the pulp, foxing in clusters, its tooth. Flat: no light in it.
    function stock(q, box, o) {
        const r = Motion.rng('stock/' + o.seed), area = box.w * box.h, md = Math.min(box.w, box.h);
        const at = () => [box.x + r() * box.w, box.y + r() * box.h];
        q.fillStyle = o.base;
        q.fillRect(box.x, box.y, box.w, box.h);
        const nb = Math.round((area / 7000) * (o.blot ?? 1)) + 5;
        for (let i = 0; i < nb; i++) {
            const warm = r() < 0.62;
            blob(q, at(), (0.1 + r() * 0.24) * md + 5, warm ? o.warm ?? '178,128,84' : o.pale ?? '255,249,234', warm ? 0.14 + r() * 0.12 : 0.2 + r() * 0.16);
        }
        q.lineCap = 'round';
        const nf = Math.round((area / 210) * (o.fibre ?? 1));
        for (let i = 0; i < nf; i++) {
            const [cx, cy] = at(), a = r() * TAU, l = 1 + r() * 3.4, bend = (r() - 0.5) * 1.5, ca = Math.cos(a), sa = Math.sin(a);
            q.strokeStyle = r() < 0.55 ? `rgba(104,70,50,${(0.08 + r() * 0.16).toFixed(3)})` : `rgba(255,251,240,${(0.16 + r() * 0.3).toFixed(3)})`;
            q.lineWidth = 0.14 + r() * 0.2;
            q.beginPath();
            q.moveTo(cx - (ca * l) / 2, cy - (sa * l) / 2);
            q.quadraticCurveTo(cx - sa * bend, cy + ca * bend, cx + (ca * l) / 2, cy + (sa * l) / 2);
            q.stroke();
        }
        // foxing: rust-brown spots with a darker heart, gathered in a few places
        const spot = (p, rad, k) => {
            blob(q, p, rad * 2.8, '166,106,56', 0.2 * k);
            q.fillStyle = `rgba(132,78,40,${(0.34 * k).toFixed(3)})`;
            q.beginPath();
            q.ellipse(p[0], p[1], rad * (0.7 + r() * 0.5), rad * (0.6 + r() * 0.4), r() * 3, 0, TAU);
            q.fill();
            if (rad > 0.9) disc(q, [p[0] + (r() - 0.5) * rad * 0.5, p[1] + (r() - 0.5) * rad * 0.5], rad * 0.34, `rgba(96,52,30,${(0.5 * k).toFixed(3)})`);
        };
        const nc = o.fox ?? 4;
        for (let i = 0; i < nc; i++) {
            const c = at(), spread = (0.06 + r() * 0.1) * md + 6, n = 5 + Math.floor(r() * 14);
            for (let j = 0; j < n; j++) {
                const a = r() * TAU, d = spread * Math.pow(r(), 0.7);
                spot([c[0] + Math.cos(a) * d, c[1] + Math.sin(a) * d * 0.8], 0.3 + Math.pow(r(), 2.2) * 2.1, 0.6 + r() * 0.6);
            }
        }
        for (let i = 0; i < nc * 5; i++) spot(at(), 0.25 + r() * 0.55, 0.5 + r() * 0.5);
        // fly specks: a few black points, in a line where it walked
        const nfly = o.fly ?? 0;
        for (let i = 0; i < nfly; i++) {
            const c = at(), a = r() * TAU, n = 2 + Math.floor(r() * 4);
            for (let j = 0; j < n; j++) disc(q, [c[0] + Math.cos(a) * j * (1.6 + r()) + (r() - 0.5), c[1] + Math.sin(a) * j * (1.6 + r()) + (r() - 0.5)], 0.22 + r() * 0.3, `rgba(40,26,26,${(0.5 + r() * 0.4).toFixed(2)})`);
        }
        lay(q, 'grain', box, 0.21, o.grain ?? 0.6);
        lay(q, 'grain', box, 0.55, (o.grain ?? 0.6) * 0.5, 'source-over', [31, 17]);
    }
    // the tide line a wet glass left
    function ringStain(q, cx, cy, R, seed) {
        const r = Motion.rng('ring/' + seed);
        q.save();
        q.lineCap = 'round';
        disc(q, [cx, cy], R, 'rgba(150,100,60,0.05)');
        for (let i = 0; i < 46; i++) {
            const a0 = r() * TAU, len = 0.15 + r() * 0.5, rr = R + (r() - 0.5) * 1.4, edge = r() < 0.4;
            q.strokeStyle = `rgba(128,80,44,${(edge ? 0.2 + r() * 0.16 : 0.05 + r() * 0.07).toFixed(3)})`;
            q.lineWidth = edge ? 0.35 + r() * 0.4 : 1.4 + r() * 2;
            q.beginPath();
            q.arc(cx + (r() - 0.5) * 0.8, cy + (r() - 0.5) * 0.8, edge ? rr + 0.9 : rr - 0.6, a0, a0 + len);
            q.stroke();
        }
        q.restore();
    }

    // a water stain: where the sheet got wet the size washed out pale, and what it carried
    // dried in a brown tide line at the edge of the wet
    function tideStain(q, pts, seed) {
        const r = Motion.rng('tide/' + seed), line = S.curve(pts, true, 10), b = S.bbox(line);
        q.save();
        q.beginPath();
        S.trace(q, line);
        q.clip();
        q.fillStyle = 'rgba(255,250,238,0.2)';
        q.fillRect(b.x, b.y, b.w, b.h);
        // the line itself, from inside: a soft band, then a crisp edge that comes and goes
        q.lineJoin = 'round';
        for (const [w, a] of [[9, 0.05], [5, 0.07], [2.2, 0.1]]) strokePts(q, line, w, `rgba(140,92,52,${a})`, true);
        q.restore();
        let i0 = 0;
        while (i0 < line.length - 2) {
            const i1 = Math.min(line.length, i0 + 4 + Math.floor(r() * 22));
            if (r() < 0.8) strokePts(q, line.slice(i0, i1), 0.3 + r() * 0.5, `rgba(124,78,44,${(0.14 + r() * 0.22).toFixed(3)})`);
            i0 = i1 - 1;
        }
    }

    // The outline of a sheet, clockwise from its top-left corner, as hands and years left
    // it: sides that wander, eased corners, and what `o` asks for:
    //   corners[i] (TL, TR, BR, BL): { r } eased · { torn: [a, b] } torn off, `a` back along
    //       the side that arrives and `b` on along the one that leaves · { curl: [a, b] }
    //   sides[i] (top, right, bottom, left): [{ at, tear: length, gap, ang } | { at, nick }]
    //   perf[i]: { pitch, r, tag, short: [teeth pulled short] } a perforated side, tooth by tooth
    // Returns { pts, torn: [{ path, kind: 'corner' | 'tear' }], curl: { p1, p2, c } }, in sheet units.
    function outline(w, h, seed, o = {}) {
        const r = Motion.rng('outline/' + seed), hs = Motion.hashStr('outline/' + seed) & 0xffff, hw = w / 2, hh = h / 2;
        const C = [[-hw, -hh], [hw, -hh], [hw, hh], [-hw, hh]], D = [[1, 0], [0, 1], [-1, 0], [0, -1]];
        const corners = o.corners ?? [{}, {}, {}, {}], jit = o.jitter ?? 0.4;
        const pts = [], torn = [];
        let curl = null;
        for (let i = 0; i < 4; i++) {
            const c0 = corners[i], c1 = corners[(i + 1) % 4], d = D[i], n = [-d[1], d[0]], len = i % 2 ? h : w;
            const cutOut = c0.torn ? c0.torn[1] : c0.curl ? c0.curl[1] : c0.r ?? 1.2;
            const cutIn = c1.torn ? c1.torn[0] : c1.curl ? c1.curl[0] : c1.r ?? 1.2;
            const wob = (sA) => jit * (S.noise2(sA * 0.04, i * 7.3, hs) + 0.5 * S.noise2(sA * 0.19, i * 7.3 + 2, hs));
            const P = (sA, off = 0) => [C[i][0] + d[0] * sA + n[0] * (off + wob(sA)), C[i][1] + d[1] * sA + n[1] * (off + wob(sA))];
            let sA = cutOut;
            const emitTo = (to) => {
                for (; sA < to - 0.5; sA += 4 + r() * 3.5) pts.push(P(sA));
                pts.push(P(to));
                sA = to;
            };
            const pf = o.perf?.[i];
            if (pf) {
                // a hole in every cell and half a tooth at either end of it; the tips of the
                // teeth are where the paper tore, so no two end alike
                const n = Math.max(2, Math.round(len / pf.pitch)), pitch = len / n, rr = pf.r, tag = pf.tag ?? 0.5;
                const tip = [];
                for (let k = 0; k <= n; k++) tip.push(-tag * (r() - 0.3) + (pf.short?.includes(k) ? rr * 0.9 : 0));
                for (let k = 0; k < n; k++) {
                    const s0 = k * pitch, c = s0 + pitch / 2, s1 = s0 + pitch;
                    if (s1 < cutOut) continue;
                    if (c + rr > len - cutIn) {
                        if (s0 + 0.2 < len - cutIn) pts.push(P(s0 + 0.2, tip[k]));
                        pts.push(P(len - cutIn, tip[k] * 0.5));
                        break;
                    }
                    if (s0 + 0.2 > cutOut) pts.push(P(s0 + 0.2, tip[k]));
                    pts.push(P(c - rr - 0.15, tip[k] * 0.5 + (r() - 0.5) * 0.2));
                    for (let j = 1; j < 6; j++) {
                        const a = (j / 6) * Math.PI;
                        pts.push(P(c - Math.cos(a) * rr, Math.sin(a) * rr * (0.9 + r() * 0.2)));
                    }
                    pts.push(P(c + rr + 0.15, tip[k + 1] * 0.5 + (r() - 0.5) * 0.2));
                    if (s1 - 0.2 < len - cutIn) pts.push(P(s1 - 0.2, tip[k + 1]));
                }
                sA = len - cutIn;
            }
            for (const f of pf ? [] : (o.sides?.[i] ?? []).slice().sort((a, b) => a.at - b.at)) {
                if (f.tear) {
                    // a tear: the two lips of one ragged line, a hair apart at the edge
                    const gap = f.gap ?? 2.4, v = rotP(n, f.ang ?? 0), pv = [-v[1], v[0]], N = Math.max(8, Math.round(f.tear / 1.3));
                    emitTo(f.at - gap / 2);
                    const c = (u) => {
                        const wig = (Motion.noise1('tear/' + seed + i, u * 6) * 0.65 + Motion.noise1('tear2/' + seed + i, u * 19) * 0.35) * Math.min(1, u * 5) * (f.amp ?? 2.2);
                        const o0 = P(f.at);
                        return [o0[0] + v[0] * f.tear * u + pv[0] * wig, o0[1] + v[1] * f.tear * u + pv[1] * wig];
                    };
                    const a = [], b = [];
                    for (let k = 0; k <= N; k++) {
                        const u = k / N, p = c(u), g2 = (gap / 2) * (1 - u) * (1 - u * 0.4);
                        a.push([p[0] - d[0] * g2 + (r() - 0.5) * 0.3, p[1] - d[1] * g2 + (r() - 0.5) * 0.3]);
                        b.push([p[0] + d[0] * g2 + (r() - 0.5) * 0.3, p[1] + d[1] * g2 + (r() - 0.5) * 0.3]);
                    }
                    b.reverse();
                    pts.push(...a, ...b.slice(1));
                    torn.push({ path: a, kind: 'tear' }, { path: b, kind: 'tear' });
                    sA = f.at + gap / 2;
                } else if (f.nick) {
                    emitTo(f.at - f.nick * 0.7);
                    pts.push(P(f.at - f.nick * 0.1, f.nick), P(f.at + f.nick * 0.25, f.nick * 0.5));
                    sA = f.at + f.nick * 0.6;
                }
            }
            if (!pf) emitTo(len - cutIn);
            const cn = C[(i + 1) % 4], dn = D[(i + 1) % 4];
            if (c1.torn) {
                // torn off: a ragged line that bellies into the sheet
                const A = pts[pts.length - 1], B = [cn[0] + dn[0] * c1.torn[1], cn[1] + dn[1] * c1.torn[1]];
                const mid = lerpP(A, B, 0.5), ctrl = [mid[0] + (mid[0] - cn[0]) * 0.35, mid[1] + (mid[1] - cn[1]) * 0.35];
                const L = dist(A, B), tn = [(B[0] - A[0]) / L, (B[1] - A[1]) / L], nn = [-tn[1], tn[0]], N = Math.round(L / 1.1), path = [A];
                for (let k = 1; k < N; k++) {
                    const u = k / N, e = Math.pow(Math.sin(Math.PI * u), 0.4);
                    const bx = (1 - u) * (1 - u) * A[0] + 2 * u * (1 - u) * ctrl[0] + u * u * B[0], by = (1 - u) * (1 - u) * A[1] + 2 * u * (1 - u) * ctrl[1] + u * u * B[1];
                    const dsp = (Motion.noise1('torn/' + seed + i, u * 5) * 0.55 + Motion.noise1('torn2/' + seed + i, u * 14) * 0.3 + Motion.noise1('torn3/' + seed + i, u * 37) * 0.15) * (c1.amp ?? 3.4) * e;
                    path.push([bx + nn[0] * dsp, by + nn[1] * dsp]);
                }
                path.push(B);
                pts.push(...path.slice(1, -1));
                torn.push({ path, kind: 'corner' });
            } else if (c1.curl) {
                curl = { p1: pts[pts.length - 1], p2: [cn[0] + dn[0] * c1.curl[1], cn[1] + dn[1] * c1.curl[1]], c: cn };
            } else {
                const rr = c1.r ?? 1.2;
                pts.push([cn[0] + (dn[0] - d[0]) * rr * 0.3, cn[1] + (dn[1] - d[1]) * rr * 0.3]);
            }
        }
        return { pts, torn, curl };
    }

    // The fibre of a tear: the sheet's white heart shows in a ragged band where its printed
    // face was pulled away. Painted inside the sheet (clipped), over the print.
    function fibre(q, F, path, seed, o = {}) {
        const r = Motion.rng('fibre/' + seed), n = path.length, inner = [], wd = o.w ?? 2.6;
        for (let i = 0; i < n; i++) {
            const a = path[Math.max(0, i - 1)], b = path[Math.min(n - 1, i + 1)], l = dist(a, b) || 1, nx = -(b[1] - a[1]) / l, ny = (b[0] - a[0]) / l;
            const e = Math.min(1, i / 3, (n - 1 - i) / 3), dd = (0.5 + wd * (0.5 + 0.5 * Motion.noise1('fib/' + seed, i * 0.37)) + r() * 0.8) * (0.3 + 0.7 * e);
            inner.push([path[i][0] + nx * dd, path[i][1] + ny * dd]);
        }
        const band = F.pts([...path, ...inner.slice().reverse()]);
        fillPts(q, band, o.color ?? '#fbf5e9');
        // the lip of the printed face: a hair of shade on the side away from the light
        strokePts(q, F.pts(inner), 0.5, 'rgba(120,84,70,0.4)');
        q.save();
        q.translate(TOL[0] * 0.5, TOL[1] * 0.5);
        strokePts(q, F.pts(inner), 0.4, 'rgba(255,252,244,0.55)');
        q.restore();
        // loose fibres lying in the band
        q.lineCap = 'round';
        for (let i = 1; i < n - 1; i += 2) {
            if (r() < 0.45) continue;
            const p = F(lerpP(path[i], inner[i], r() * 0.9)), a = r() * TAU, l = 0.8 + r() * 1.8;
            strokePts(q, [p, [p[0] + Math.cos(a) * l, p[1] + Math.sin(a) * l]], 0.22 + r() * 0.2, r() < 0.5 ? 'rgba(150,120,100,0.5)' : 'rgba(255,255,250,0.8)');
        }
    }
    // …and the threads that stand out past the edge (after the piece, over its contour)
    function whiskers(g, F, path, seed, o = {}) {
        const r = Motion.rng('whisk/' + seed), n = path.length;
        for (let i = 2; i < n - 2; i++) {
            if (r() > (o.p ?? 0.22)) continue;
            const a = path[i - 1], b = path[i + 1], l = dist(a, b) || 1, tx = (b[0] - a[0]) / l, ty = (b[1] - a[1]) / l;
            const len = 1.2 + r() * (o.len ?? 2.6), sw = (r() - 0.5) * 2.4;
            const p0 = [path[i][0] - ty * 0.6, path[i][1] + tx * 0.6], p1 = [path[i][0] + ty * len * 0.5 + tx * sw * 0.4, path[i][1] - tx * len * 0.5 + ty * sw * 0.4], p2 = [path[i][0] + ty * len + tx * sw, path[i][1] - tx * len + ty * sw];
            S.ink(g, F.pts(S.curve([p0, p1, p2], false, 4)), { w: 0.4 + r() * 0.3, color: o.color ?? '#f1e8d8', alpha: 0.9, taper: [0, 1] });
        }
    }

    // A fold in a sheet that was opened again. `kind` 'ridge' (its crest towards us) or
    // 'valley'. The slope that faces the light is lit and the other is in shade, whichever
    // way the sheet is turned; the crease is a dark hair with a light one beside it.
    function fold(q, F, a, b, kind, seed, o = {}) {
        const L = dist(a, b), n = Math.max(4, Math.round(L / 14)), loc = [];
        const t = [(b[0] - a[0]) / L, (b[1] - a[1]) / L];
        for (let i = 0; i <= n; i++) {
            const u = i / n, wv = Motion.noise1('fold/' + seed, u * 5) * (o.wander ?? 0.55);
            loc.push([a[0] + (b[0] - a[0]) * u - t[1] * wv, a[1] + (b[1] - a[1]) * u + t[0] * wv]);
        }
        const pts = F.pts(S.curve(loc, false, 5)), A = F(a), B = F(b);
        const tp = [(B[0] - A[0]) / (L * F.s), (B[1] - A[1]) / (L * F.s)], nrm = [-tp[1], tp[0]];
        const side = (dot2(nrm, TOL) >= 0 ? 1 : -1) * (kind === 'ridge' ? 1 : -1); // the lit slope's side
        const k = 0.35 + 0.65 * Math.abs(dot2(nrm, TOL)), band = (o.band ?? 30) * F.s, amt = o.amt ?? 1;
        fadeBand(q, A, B, [nrm[0] * side, nrm[1] * side], band, o.light ?? '255,250,236', 0.26 * k * amt);
        fadeBand(q, A, B, [-nrm[0] * side, -nrm[1] * side], band * 1.2, o.shade ?? '84,56,72', 0.24 * k * amt);
        const sh = (dd) => pts.map(([x, y]) => [x + nrm[0] * dd, y + nrm[1] * dd]);
        // broken, as creases are: a few stretches of different weight
        const r = Motion.rng('foldseg/' + seed), m = pts.length;
        let i0 = 0;
        while (i0 < m - 2) {
            const i1 = Math.min(m, i0 + 6 + Math.floor(r() * 16)), wgt = 0.5 + r() * 0.7;
            S.ink(q, sh(-side * 0.45 * F.s).slice(i0, i1), { w: (o.w ?? 0.9) * wgt * F.s, color: o.dark ?? '#3c2a38', alpha: 0.6 * amt, taper: [0.5, 0.5] });
            S.ink(q, sh(side * 0.55 * F.s).slice(i0, i1), { w: (o.w ?? 0.9) * 1.25 * wgt * F.s, color: o.crest ?? '#fffaf0', alpha: 0.8 * amt, taper: [0.5, 0.5] });
            i0 = i1 - 1 + (r() < 0.25 ? 2 : 0);
        }
    }

    // A corner that curls up and over towards us, showing the back of the sheet. The sheet's
    // outline was cut along p1–p2 (the roll's silhouette); the flap is the corner mirrored in
    // that line and foreshortened, shaded as the outside of a cylinder under the house light.
    function curlFlap(g, F, cu, o = {}) {
        const { p1, p2, c } = cu, L = dist(p1, p2), t = [(p2[0] - p1[0]) / L, (p2[1] - p1[1]) / L];
        let nn = [-t[1], t[0]], dc = (c[0] - p1[0]) * nn[0] + (c[1] - p1[1]) * nn[1];
        if (dc < 0) {
            nn = [-nn[0], -nn[1]];
            dc = -dc;
        }
        const foot = [c[0] - nn[0] * dc, c[1] - nn[1] * dc], k = o.over ?? 0.7, tip = [foot[0] - nn[0] * dc * k, foot[1] - nn[1] * dc * k];
        const bow = o.bow ?? 1.6;
        const e1 = S.curve([p1, [(p1[0] + tip[0]) / 2 - t[0] * bow, (p1[1] + tip[1]) / 2 - t[1] * bow], tip], false, 6), e2 = S.curve([tip, [(p2[0] + tip[0]) / 2 + t[0] * bow, (p2[1] + tip[1]) / 2 + t[1] * bow], p2], false, 6);
        const flap = F.pts([...e1, ...e2.slice(1)]);
        const dP = F.dir(nn), dl = dot2(dP, [LV[0], LV[1]]);
        const ramp = S.rampFn(o.ramp ?? [[0.12, '#5d4654'], [0.36, '#a48478'], [0.52, '#c9ad98'], [0.68, '#e0cab2'], [0.84, '#eddcc4'], [1, '#f6e8d2']], 1), rgb = [0, 0, 0];
        const stops = [];
        for (let i = 0; i <= 8; i++) {
            const u = i / 8, th = Math.PI / 2 + u * (o.turn ?? 1.1), b = Math.sin(th) * dl - Math.cos(th) * LV[2];
            ramp(clamp(0.5 + 0.62 * b), rgb);
            stops.push([u, S.rgb2hex(rgb[0], rgb[1], rgb[2])]);
        }
        S.piece(g, flap, {
            fill: { from: F(foot), to: F(tip), stops }, line: o.line ?? 1.5, heavy: 0.8, cast: { blur: 6 * F.s, dx: SD[0] * 5.5 * F.s, dy: SD[1] * 6.5 * F.s, color: 'rgba(30,16,40,0.6)' },
            detail: (q) => {
                // the back of the sheet: its tooth, the blotches of its years
                const fb = S.bbox(flap), rr = Motion.rng('flap/' + (o.seed ?? 0));
                lay(q, 'grain', fb, 0.21, 0.75);
                for (let i = 0; i < 6; i++) blob(q, [fb.x + rr() * fb.w, fb.y + rr() * fb.h], (0.12 + rr() * 0.2) * Math.max(fb.w, fb.h), rr() < 0.6 ? '170,124,84' : '255,248,232', 0.16 + rr() * 0.12);
                for (let i = 0; i < 14; i++) disc(q, [fb.x + rr() * fb.w, fb.y + rr() * fb.h], (0.2 + rr() * 0.5) * F.s, `rgba(132,82,44,${(0.2 + rr() * 0.3).toFixed(2)})`);
                if (o.back) o.back(q, { foot, tip, t, nn });
                // the roll itself: the turn is in its own shade, then a band of light where
                // the sheet comes round to face the lamp, then the flat of the flap
                const P1 = F(p1), P2 = F(p2), inw = F.dir([-nn[0], -nn[1]]), depth = dc * k * F.s;
                fadeBand(q, P1, P2, inw, depth * 0.34, '64,40,58', dl > 0.2 ? 0.2 : 0.5);
                const hi = (u0, u1, rgb2, a) => {
                    const a0 = [P1[0] + inw[0] * depth * u0, P1[1] + inw[1] * depth * u0], b0 = [P2[0] + inw[0] * depth * u0, P2[1] + inw[1] * depth * u0], mid = (u1 - u0) * depth * 0.5;
                    fadeBand(q, [a0[0] + inw[0] * mid, a0[1] + inw[1] * mid], [b0[0] + inw[0] * mid, b0[1] + inw[1] * mid], inw, mid, rgb2, a);
                    fadeBand(q, [a0[0] + inw[0] * mid, a0[1] + inw[1] * mid], [b0[0] + inw[0] * mid, b0[1] + inw[1] * mid], [-inw[0], -inw[1]], mid, rgb2, a);
                };
                hi(0.18, 0.56, '255,250,236', 0.34);
                S.spray(q, flap, { color: '#fffaf0', alpha: 0.45, w: 2.4 * F.s, dir: TOL });
                S.spray(q, flap, { color: '#6a4c58', alpha: 0.45, w: 4 * F.s });
            },
        });
        return { flap, tip, foot, nn };
    }
    // …and what the sheet itself shows as it rises into the roll: `R` units before the cut
    function curlRise(q, F, cu, R) {
        const { p1, p2, c } = cu, L = dist(p1, p2), t = [(p2[0] - p1[0]) / L, (p2[1] - p1[1]) / L];
        let nn = [-t[1], t[0]];
        if ((c[0] - p1[0]) * nn[0] + (c[1] - p1[1]) * nn[1] < 0) nn = [-nn[0], -nn[1]];
        const dP = F.dir(nn), dl = dot2(dP, [LV[0], LV[1]]), P1 = F(p1), P2 = F(p2), inw = [-dP[0], -dP[1]];
        // its face tilts away from the corner: lit if the light is on the sheet's side
        if (dl < 0) fadeBand(q, P1, P2, inw, R * F.s, '255,250,236', 0.5 * -dl + 0.1);
        else fadeBand(q, P1, P2, inw, R * F.s, '70,44,60', 0.5 * dl + 0.1);
    }

    // The hole a drawing pin left: a paler disc where its head kept the light off, a ring of
    // rust at its rim, a drip of rust below (down the sheet as it hung), the hole.
    function pinhole(q, F, p, seed, o = {}) {
        const r = Motion.rng('pin/' + seed), c = F(p), k = F.s, down = F.dir([0, 1]);
        blob(q, c, 8.5 * k, '170,96,44', 0.34);
        blob(q, [c[0] + down[0] * 3 * k, c[1] + down[1] * 3 * k], 5 * k, '150,80,36', 0.3);
        // the drip
        const len = (12 + r() * 12) * k, e = [c[0] + down[0] * len, c[1] + down[1] * len];
        const gr = q.createLinearGradient(c[0], c[1], e[0], e[1]);
        gr.addColorStop(0, 'rgba(150,78,34,0.5)');
        gr.addColorStop(1, 'rgba(150,78,34,0)');
        const sd = [-down[1], down[0]];
        fillPts(q, [[c[0] - sd[0] * 1.1 * k, c[1] - sd[1] * 1.1 * k], [c[0] + sd[0] * 1.1 * k, c[1] + sd[1] * 1.1 * k], [e[0] + sd[0] * 0.3 * k, e[1] + sd[1] * 0.3 * k]], gr);
        disc(q, c, 3.5 * k, 'rgba(255,246,228,0.5)');
        q.lineCap = 'round';
        for (let i = 0; i < 9; i++) {
            const a0 = r() * TAU;
            q.strokeStyle = `rgba(${118 + Math.floor(r() * 40)},${58 + Math.floor(r() * 24)},30,${(0.4 + r() * 0.45).toFixed(2)})`;
            q.lineWidth = (0.5 + r() * 0.7) * k;
            q.beginPath();
            q.arc(c[0], c[1], (3.4 + (r() - 0.5) * 0.5) * k, a0, a0 + 0.5 + r() * 1.3);
            q.stroke();
        }
        // the hole: dark, its far lip catching the light
        disc(q, c, 1.05 * k, '#1d1420');
        strokePts(q, [pol(1.25 * k, 0.2, c[0], c[1]), pol(1.25 * k, 0.8, c[0], c[1]), pol(1.25 * k, 1.4, c[0], c[1])], 0.45 * k, 'rgba(255,250,236,0.85)');
        if (o.torn) {
            // the paper gave a little round the pin: two short rays
            for (let i = 0; i < 2; i++) {
                const a = r() * TAU;
                S.ink(q, [pol(1 * k, a, c[0], c[1]), pol((2.6 + r() * 1.6) * k, a + 0.2, c[0], c[1])], { w: 0.5 * k, color: '#2a1c26', alpha: 0.8, taper: [0, 1] });
            }
        }
    }

    // What every sheet gets from the house light, inside its outline: its edges aged and
    // rubbed, the shade side sunk, the lit side lifted, and the cockle of paper that does
    // not lie flat (soft swells, lit on the light's side).
    function sheetLight(q, out, seed, o = {}) {
        const k = o.k ?? 1, b = S.bbox(out), r = Motion.rng('cockle/' + seed);
        const n = o.cockle ?? 5, md = Math.min(b.w, b.h);
        for (let i = 0; i < n; i++) {
            const c = [b.x + r() * b.w, b.y + r() * b.h], rad = (0.16 + r() * 0.2) * md + 8 * k, off = rad * 0.34;
            blob(q, [c[0] + TOL[0] * off, c[1] + TOL[1] * off], rad, '255,251,238', (o.swell ?? 0.13) * (0.6 + r() * 0.6));
            blob(q, [c[0] + SD[0] * off, c[1] + SD[1] * off], rad, '70,46,66', (o.swell ?? 0.13) * (0.6 + r() * 0.6));
        }
        S.spray(q, out, { color: o.age ?? '#96703f', alpha: o.ageA ?? 0.5, w: 9 * k, push: 0 });
        S.spray(q, out, { color: o.dirt ?? '#6a4a34', alpha: (o.ageA ?? 0.5) * 0.6, w: 2.4 * k, push: 0 });
        S.spray(q, out, { color: o.shade ?? '#5a3f52', alpha: o.shadeA ?? 0.4, w: 20 * k, push: 13 * k });
        S.spray(q, out, { color: o.lit ?? '#fff9ea', alpha: o.litA ?? 0.45, w: 13 * k, push: 8 * k, dir: TOL });
    }
    // a soft shadow under a thing, painted as paint (see `ground` at the top)
    function groundShadow(g, pts, a, k = 1) {
        if (!a) return;
        const m = g.getTransform(), sc = Math.hypot(m.a, m.b), BIG = 20000;
        g.save();
        g.setTransform(m.a, m.b, m.c, m.d, m.e - BIG, m.f);
        g.shadowColor = `rgba(10,9,28,${a})`;
        g.shadowBlur = 11 * k * sc;
        g.shadowOffsetX = BIG + SD[0] * 8 * k * sc;
        g.shadowOffsetY = SD[1] * 8 * k * sc;
        g.fillStyle = '#000';
        g.beginPath();
        S.trace(g, pts);
        g.fill();
        g.restore();
    }
    const paste = (q, F, canvas, box) => onFrame(q, F, (p) => {
        p.imageSmoothingEnabled = true;
        p.imageSmoothingQuality = 'high';
        p.drawImage(canvas, box.x, box.y, box.w, box.h);
    });

    // ================================================================== 1 · the poster
    const POSTER = { x: -210, y: -300, w: 420, h: 600 };
    const PFOLD = { v: 3, h: -6 };

    // The vignette: a wood engraving of our own, the red fortress on its hill under a
    // crescent moon. Black is what the block prints; whites are cut out of it.
    function alhambra(q, cx, cy, seed) {
        const r = Motion.rng('alhambra/' + seed);
        q.save();
        q.translate(cx, cy);
        q.lineJoin = 'miter';
        // the block's frame: a rule, a hair of white, the picture
        q.lineWidth = 1.5;
        q.strokeRect(-138, -48, 276, 96);
        q.beginPath();
        q.rect(-134.6, -44.6, 269.2, 89.2);
        q.clip();
        // the sky: lines ruled closer and heavier towards the top
        q.lineCap = 'butt';
        for (let i = 0, y = -44; y < 16; i++, y += 2.5) {
            const u = (y + 44) / 60;
            q.lineWidth = 1.75 - 1.4 * u;
            q.beginPath();
            for (let x = -136; x <= 136; x += 4) {
                const yy = y + 0.3 * Math.sin(x * 0.09 + i * 1.7) + 0.2 * Math.sin(x * 0.31 + i);
                if (x === -136) q.moveTo(x, yy);
                else q.lineTo(x, yy);
            }
            q.stroke();
        }
        // the graver lifted here and there: short breaks in the lines, a drift of cloud
        cutting(q, (k) => {
            k.lineCap = 'round';
            for (let i = 0; i < 44; i++) {
                const x = -130 + r() * 260, y = -42 + r() * 54, l = 3 + r() * 12;
                k.lineWidth = 0.5 + r() * 0.7;
                k.beginPath();
                k.moveTo(x, y);
                k.lineTo(x + l, y + (r() - 0.5) * 0.6);
                k.stroke();
            }
            for (const [x, y, w] of [[36, -30, 44], [58, -25, 30], [-20, -36, 26], [96, -14, 30]]) {
                k.beginPath();
                k.ellipse(x, y, w / 2, 1.5, 0, 0, TAU);
                k.fill();
                k.beginPath();
                k.ellipse(x + w * 0.2, y + 2.6, w * 0.3, 1, 0, 0, TAU);
                k.fill();
            }
        });
        // the moon: a crescent, the dark of its disc ruled finer than the sky
        const mx = -92, my = -24, mr = 10.5;
        cutting(q, (k) => {
            k.beginPath();
            k.arc(mx, my, mr + 1.3, 0, TAU);
            k.fill();
        });
        q.save();
        q.beginPath();
        q.arc(mx, my, mr, 0, TAU);
        q.clip();
        q.beginPath();
        q.arc(mx + 5.4, my - 2.2, mr * 0.98, 0, TAU);
        q.clip();
        q.lineWidth = 0.55;
        for (let y = my - mr; y < my + mr; y += 1.25) {
            q.beginPath();
            q.moveTo(mx - mr, y);
            q.lineTo(mx + mr, y);
            q.stroke();
        }
        q.restore();
        q.lineWidth = 0.6;
        q.beginPath();
        q.arc(mx, my, mr, 0, TAU);
        q.stroke();
        // stars: small crosses cut in the sky
        cutting(q, (k) => {
            k.lineCap = 'round';
            for (const [x, y, s2] of [[-122, -36, 1], [-60, -38, 1.3], [-36, -22, 0.8], [8, -38, 1.1], [30, -17, 0.7], [72, -37, 1.2], [108, -31, 0.9], [124, -40, 0.7], [-108, -6, 0.7], [84, -19, 0.8], [-6, -24, 0.6]]) {
                k.lineWidth = 0.55 * s2;
                k.beginPath();
                k.moveTo(x - 2.4 * s2, y);
                k.lineTo(x + 2.4 * s2, y);
                k.moveTo(x, y - 2.4 * s2);
                k.lineTo(x, y + 2.4 * s2);
                k.stroke();
                k.beginPath();
                k.arc(x, y, 0.8 * s2, 0, TAU);
                k.fill();
            }
        });
        // the sierra behind: snow left white, its shaded flanks hatched
        const ridge = [[-136, 4], [-118, -1], [-100, 3], [-84, -6], [-68, -1], [-50, -11], [-34, -4], [-22, -8], [-6, -15], [10, -7], [24, -10], [40, -3], [58, -9], [76, -2], [92, -7], [112, -1], [136, 3]];
        cutting(q, (k) => {
            k.beginPath();
            S.trace(k, [...ridge, [136, 30], [-136, 30]]);
            k.fill();
        });
        q.lineWidth = 0.8;
        q.lineJoin = 'round';
        q.beginPath();
        S.trace(q, ridge, false);
        q.stroke();
        q.lineWidth = 0.42;
        q.lineCap = 'round';
        for (let i = 1; i < ridge.length - 1; i++) {
            const [px, py] = ridge[i], [nx, ny] = ridge[i + 1];
            if (ny < py) continue; // only the slopes that fall away to the right
            for (let j = 0; j < 6; j++) {
                const u = (j + 0.6) / 6.5, x = px + (nx - px) * u, y = py + (ny - py) * u + 0.6, l = 3.5 + (1 - u) * 7 + r() * 2;
                q.beginPath();
                q.moveTo(x, y);
                q.lineTo(x - l * 0.42, y + l);
                q.stroke();
            }
        }
        // the hill and the fortress, in solid black
        const hill = S.curve([[-136, 30], [-112, 25], [-88, 27], [-60, 23], [-30, 26], [0, 24], [30, 27], [60, 24], [92, 27], [116, 24], [136, 28]], false, 6);
        q.beginPath();
        S.trace(q, [...hill, [136, 46], [-136, 46]]);
        q.fill();
        const merlons = (x0, x1, top, mh, pitch) => {
            const n = Math.max(2, Math.round((x1 - x0 + pitch * 0.45) / pitch)), mw = (x1 - x0) / (n * 1.8 - 0.8);
            for (let i = 0; i < n; i++) q.fillRect(x0 + i * mw * 1.8, top - mh, mw, mh + 0.2);
        };
        const tower = (x0, x1, top, mh = 2.6, pitch = 4.4) => {
            q.fillRect(x0, top, x1 - x0, 30 - top);
            q.fillRect(x0 - 0.7, top, x1 - x0 + 1.4, 1.5);
            merlons(x0 - 0.7, x1 + 0.7, top, mh, pitch);
        };
        const wall = (x0, x1, top) => {
            q.fillRect(x0, top, x1 - x0, 30 - top);
            merlons(x0, x1, top, 1.7, 3.3);
        };
        wall(-126, -96, 13);
        wall(-78, -52, 9);
        wall(-44, -14, 11);
        wall(22, 72, 12);
        wall(86, 128, 15);
        tower(-100, -78, -9); // the watch tower, with its bell gable
        q.fillRect(-92, -19.5, 6, 8);
        q.beginPath();
        q.arc(-89, -19.5, 3, Math.PI, 0);
        q.fill();
        q.fillRect(-89.3, -26, 0.6, 4);
        q.fillRect(-90.5, -24.8, 3, 0.6);
        tower(-56, -44, 1, 2.2, 3.8);
        tower(-14, 22, -13, 3, 4.8); // the great tower
        tower(40, 52, 2, 2.2, 3.8);
        tower(70, 86, -2, 2.6, 4.4);
        tower(112, 122, 7, 2, 3.6);
        // roofs of the palace between the towers: hipped, tiled
        for (const [x0, x1, y, hgt] of [[24, 39, 8, 4.5], [53, 69, 9, 4]]) {
            q.beginPath();
            S.trace(q, [[x0, y], [x0 + 3.5, y - hgt], [x1 - 3.5, y - hgt], [x1, y]]);
            q.fill();
        }
        q.beginPath(); // a little lantern roof
        S.trace(q, [[39, 2], [46, -6], [53, 2]]);
        q.fill();
        // cypresses and the wood below the walls
        const cypress = (x, yb, hgt, w) => {
            q.beginPath();
            q.moveTo(x, yb - hgt);
            q.bezierCurveTo(x + w, yb - hgt * 0.62, x + w * 1.05, yb - hgt * 0.12, x, yb);
            q.bezierCurveTo(x - w * 1.05, yb - hgt * 0.12, x - w, yb - hgt * 0.62, x, yb - hgt);
            q.fill();
        };
        for (const [x, yb, hgt, w] of [[-118, 27, 26, 3.4], [-110, 27, 17, 2.8], [-66, 25, 22, 3.2], [28, 27, 24, 3.3], [34, 27, 15, 2.6], [96, 27, 27, 3.5], [104, 27, 19, 2.9], [62, 26, 14, 2.4]]) cypress(x, yb, hgt, w);
        for (let i = 0; i < 46; i++) {
            const u = (i + r() * 0.6) / 46, p = hill[Math.min(hill.length - 1, Math.floor(u * hill.length))];
            q.beginPath();
            q.arc(p[0] + (r() - 0.5) * 3, p[1] + 0.5 - r() * 2.4, 2.2 + r() * 2.6, 0, TAU);
            q.fill();
        }
        // whites cut into the black: the lit edge of every tower, windows, courses of
        // stone, leaves in the wood, the path at the foot
        cutting(q, (k) => {
            k.lineCap = 'butt';
            const lit = (x, y0, y1, w = 0.7) => {
                k.lineWidth = w;
                k.beginPath();
                k.moveTo(x, y0);
                k.lineTo(x, y1);
                k.stroke();
            };
            lit(-98.6, -7, 20);
            lit(-54.7, 3, 20, 0.6);
            lit(-12.4, -11, 20, 0.9);
            lit(41.2, 4, 21, 0.6);
            lit(71.3, 0, 21, 0.7);
            lit(113, 9, 22, 0.5);
            // courses of stone: short broken lines, more of them towards the light
            k.lineWidth = 0.34;
            for (const [x0, x1, y0] of [[-100, -78, -6], [-14, 22, -9], [70, 86, 1], [-56, -44, 4], [40, 52, 5]]) {
                for (let y = y0; y < 22; y += 2.6) {
                    k.beginPath();
                    for (let x = x0 + 2.4 + r() * 2; x < x0 + (x1 - x0) * (0.5 + r() * 0.3); x += 3.5 + r() * 3) {
                        k.moveTo(x, y);
                        k.lineTo(x + 1.4 + r() * 2.2, y);
                    }
                    k.stroke();
                }
            }
            // windows: twin arches high in the great tower, slits elsewhere
            for (const wx of [0.4, 7.6]) {
                k.beginPath();
                k.moveTo(wx, 2);
                k.lineTo(wx, -1.6);
                k.arc(wx + 1.3, -1.6, 1.3, Math.PI, 0);
                k.lineTo(wx + 2.6, 2);
                k.fill();
            }
            k.fillRect(-1, 3, 12.4, 0.5);
            for (const [x, y, w, hgt] of [[-90, 2, 1.3, 3.6], [-51, 8, 1, 2.6], [77.5, 6, 1.2, 3.2], [45.5, 9, 1, 2.4], [-88, -17.5, 2, 3.2], [116.5, 12, 0.9, 2.2]]) k.fillRect(x, y, w, hgt);
            // the walls' cornice
            k.lineWidth = 0.3;
            for (const [x0, x1, y] of [[-126, -96, 15], [-78, -52, 11], [-44, -14, 13], [22, 72, 14], [86, 128, 17]]) {
                k.beginPath();
                k.moveTo(x0 + 0.5, y);
                k.lineTo(x1 - 0.5, y);
                k.stroke();
            }
            // roof tiles
            k.lineWidth = 0.28;
            for (const [x0, x1, y, hgt] of [[24, 39, 8, 4.5], [53, 69, 9, 4]]) {
                for (let x = x0 + 4; x < x1 - 3; x += 1.5) {
                    k.beginPath();
                    k.moveTo(x, y - hgt + 0.6);
                    k.lineTo(x + (x - (x0 + x1) / 2) * 0.12, y - 0.4);
                    k.stroke();
                }
            }
            // cypress: light caught down the left side
            k.lineWidth = 0.42;
            k.lineCap = 'round';
            for (const [x, yb, hgt] of [[-118, 27, 26], [-66, 25, 22], [28, 27, 24], [96, 27, 27], [104, 27, 19], [-110, 27, 17]]) {
                for (let j = 0; j < 5; j++) {
                    const y = yb - hgt * (0.2 + j * 0.14);
                    k.beginPath();
                    k.moveTo(x - 1.5, y);
                    k.lineTo(x - 0.5, y - 2.4);
                    k.stroke();
                }
            }
            // leaves: little hooked cuts, in rows that follow the slope
            k.lineWidth = 0.4;
            for (let i = 0; i < 230; i++) {
                const x = -134 + r() * 268, y = 24 + r() * 16, a = -2.4 + r() * 0.9, rr = 0.9 + r() * 1.3;
                k.beginPath();
                k.arc(x, y, rr, a, a + 1.5 + r());
                k.stroke();
            }
            // the path that climbs to the gate, and the ground at the foot
            k.lineWidth = 1.1;
            k.beginPath();
            k.moveTo(-136, 41);
            k.bezierCurveTo(-90, 36, -70, 43, -30, 37);
            k.bezierCurveTo(-10, 34, -2, 31, 4, 26);
            k.stroke();
            k.lineWidth = 0.4;
            for (let i = 0; i < 26; i++) {
                const x = -132 + r() * 264, y = 42.4 + r() * 2.2;
                k.beginPath();
                k.moveTo(x, y);
                k.lineTo(x + 5 + r() * 12, y + (r() - 0.5) * 0.4);
                k.stroke();
            }
        });
        q.restore();
    }

    function posterPrint(res, seed) {
        return memo(`poster/${seed}@${res}`, () => {
            const box = POSTER, { c, q } = sheet(box, res), r = Motion.rng('posterprint/' + seed);
            stock(q, box, { base: '#ebd2c1', seed: 'poster' + seed, fox: 9, fly: 3 });
            ringStain(q, 104, 222, 29, seed);
            tideStain(q, [[-214, 150], [-186, 132], [-150, 146], [-124, 176], [-84, 186], [-62, 214], [-76, 250], [-110, 262], [-128, 290], [-170, 306], [-214, 300]], 'poster' + seed);
            tideStain(q, [[150, -304], [156, -276], [180, -262], [196, -238], [214, -232], [216, -304]], 'poster2' + seed);
            // what is printed on the back shows through, mirrored and faint
            q.save();
            q.scale(-1, 1);
            q.filter = `blur(${(0.45 * res).toFixed(2)}px)`;
            q.globalAlpha = 0.06;
            q.fillStyle = '#4a2f3e';
            type(q, 'PROGRAMA', { font: FACE.anton, cap: 40, y: -206, track: 0.06 });
            for (let i = 0; i < 27; i++) {
                const yy = -180 + i * 15.4, w = i % 9 === 8 ? 120 : 300;
                for (let x = -w / 2; x < w / 2 - 6;) {
                    const l = 8 + r() * 30;
                    q.fillRect(x, yy, Math.min(l, w / 2 - x), 5);
                    x += l + 4.5;
                }
            }
            q.restore();
            q.filter = 'none';

            const wear = (k) => {
                rub(k, [PFOLD.v, -300], [PFOLD.v, 300], 'pv' + seed, 1);
                rub(k, [-210, PFOLD.h], [210, PFOLD.h], 'ph' + seed, 1.2);
                // where it rubbed against whatever it was kept with
                for (let i = 0; i < 12; i++) {
                    const x = -190 + r() * 380, y = -280 + r() * 560, a = r() * 3, l = 20 + r() * 60;
                    dab(k, [[x, y], [x + (Math.cos(a) * l) / 2, y + (Math.sin(a) * l) / 2 + (r() - 0.5) * 6], [x + Math.cos(a) * l, y + Math.sin(a) * l]], { w: 3 + r() * 9, color: '#000', alpha: 0.2 + r() * 0.3, bristles: 9, seed: 'scuff' + seed + i, dry: 0.7 });
                }
            };
            // the flowers of the border, sort by sort, clockwise
            const band = [];
            const row = (x0, y0, x1, y1, n, turn) => {
                for (let i = 0; i < n; i++) band.push([x0 + ((x1 - x0) * (i + 0.5)) / n, y0 + ((y1 - y0) * (i + 0.5)) / n, turn]);
            };
            const bx = 179.25, by = 269.25, cg = 11.4;
            row(-bx + cg, -by, bx - cg, -by, 28, 0);
            row(bx, -by + cg, bx, by - cg, 43, Math.PI / 2);
            row(bx - cg, by, -bx + cg, by, 28, Math.PI);
            row(-bx, by - cg, -bx, -by + cg, 43, -Math.PI / 2);
            const slips = new Set([17, 63, 121]), wrong = 88, missing = 40;
            // the great line: a condensed grotesque drawn out tall, as wood type was cut
            const TITLE = { font: FACE.anton, cap: 86, sy: 1.56, y: -46, fit: 318 };

            const red = inked(box, res, (k) => {
                band.forEach(([x, y, turn], i) => {
                    if (i === missing) return; // a sort that fell out of the forme
                    k.save();
                    k.translate(x, y);
                    k.rotate(turn + (slips.has(i) ? Math.PI / 2 : 0) + (r() - 0.5) * 0.05);
                    k.scale(4.9, 4.9);
                    if (i === wrong) star(k, 0, 0, 0.95, 6, 0.5); // from another fount
                    else if (i % 2) flowerB(k);
                    else flowerA(k);
                    k.restore();
                });
                type(k, 'CANTE JONDO', { ...TITLE });
                swelled(k, -118, 118, 119, 2.2);
                swelled(k, -118, 118, 155.5, 2.2);
                star(k, -128, -230, 6.4, 8, 0.48);
                star(k, 128, -230, 6.4, 8, 0.48);
                lozenge(k, 0, 186, 2.6, 2.6);
                for (const sx of [-1, 1]) {
                    star(k, sx * 14, 228, 2.6, 8, 0.5);
                    lozenge(k, sx * 132, -24.5 - 3.4, 2, 3);
                }
            }, { color: '#b4372e', wear, mottle: 1.1 });

            const black = inked(box, res, (k) => {
                // the border: a heavy rule and a hair rule outside the flowers, a hair rule inside
                k.lineWidth = 3;
                k.strokeRect(-195.5, -285.5, 391, 571);
                k.lineWidth = 0.7;
                k.strokeRect(-190.4, -280.4, 380.8, 560.8);
                k.lineWidth = 0.8;
                k.strokeRect(-168.2, -258.2, 336.4, 516.4);
                for (const [sx, sy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
                    k.save();
                    k.translate(sx * bx, sy * by);
                    cornerPiece(k, 8.7);
                    k.restore();
                }
                type(k, 'GRANADA', { font: FACE.fell, cap: 35, y: -213, track: 0.13, fit: 226 });
                swelled(k, -150, 150, -200.5, 2.8);
                type(k, 'FIESTAS DEL CORPUS CHRISTI', { font: FACE.anton, cap: 21, y: -170, track: 0.07, fit: 316 });
                type(k, 'GRAN CONCURSO DE', { font: FACE.titan, cap: 18.5, y: -141.5, track: 0.05, fit: 300 });
                // the great line's shade: the same letters in black, down and to the right, cut
                // back so a hair of paper stands between them and the red
                type(k, 'CANTE JONDO', { ...TITLE, dx: 4.6, dy: 4.4 });
                type(k, 'CANTE JONDO', { ...TITLE, cut: true, stroke: 2.4 });
                type(k, '(CANTO PRIMITIVO ANDALUZ)', { font: FACE.lora, cap: 10.4, y: -24.5, track: 0.13, fit: 250 });
                alhambra(k, 0, 34, seed);
                type(k, 'Plaza de los Aljibes de la Alhambra', { font: FACE.lora, size: 19.6, y: 108, slant: 0.19, fit: 318 });
                type(k, '13 y 14 de Junio de 1922', { font: FACE.shri, size: 26, y: 145.5, fit: 306 });
                type(k, 'Premios en metálico', { font: FACE.fell, size: 22.5, y: 177.5, track: 0.05 });
                type(k, 'Seguiriyas, Soleares, Saetas, Martinetes', { font: FACE.lora, size: 16.4, y: 205, fit: 318 });
                // a tailpiece and the printer's line
                swelled(k, -64, -22, 228, 1.5);
                swelled(k, 22, 64, 228, 1.5);
                lozenge(k, 0, 228, 3, 3);
                type(k, 'Tip. El Limonero · Granada', { font: FACE.lora, size: 6.6, y: 250.5, track: 0.1 });
            }, { color: '#28222c', wear });
            // the town hall's rubber stamp, without which no bill could be posted
            const TX = -118, TY = 233;
            const town = inked(box, res, (k) => {
                k.save();
                k.translate(TX, TY);
                k.rotate(-0.16);
                for (const [rad, lw] of [[19.5, 1.1], [17.6, 0.4], [10.6, 0.5]]) {
                    k.lineWidth = lw;
                    k.beginPath();
                    k.arc(0, 0, rad, 0, TAU);
                    k.stroke();
                }
                arcType(k, 'NEGOCIADO DE FESTEJOS', 0, 0, 12, -Math.PI / 2, { font: FACE.anton, size: 4.7, track: 0.1 });
                arcType(k, 'GRANADA', 0, 0, 16.3, Math.PI / 2, { font: FACE.anton, size: 4.7, track: 0.2, inside: true });
                type(k, 'VISADO', { font: FACE.anton, cap: 4.4, x: 0, y: 0, track: 0.12 });
                type(k, '1922', { font: FACE.anton, cap: 3.6, x: 0, y: 5.6, track: 0.12 });
                k.restore();
            }, {
                color: '#4b3f96', tile: 'dry', mottle: 0.7, squash: 0.5, rim: 0.2,
                wear: (k) => {
                    const gr = k.createLinearGradient(TX + 16, TY - 12, TX - 18, TY + 14);
                    gr.addColorStop(0, 'rgba(0,0,0,0)');
                    gr.addColorStop(1, 'rgba(0,0,0,0.7)');
                    k.fillStyle = gr;
                    k.fillRect(box.x, box.y, box.w, box.h);
                },
            });
            print(q, box, red, 0.96, 0.55, 0.4); // a hair out of register
            print(q, box, black, 0.97);
            print(q, box, town, 0.8);
            return c;
        });
    }

    function poster(g, o = {}) {
        const { x = 0, y = 0, s = 1, rot = 0, seed = 'cartel', ground = 0 } = o;
        g.save();
        g.translate(x, y);
        g.scale(s, s);
        const F = frame(0, 0, rot), box = POSTER;
        const sp = posterPrint(resFor(g, box), seed);
        const O = memo('poster-out/' + seed, () => outline(420, 600, 'poster' + seed, {
            corners: [{ r: 2.6 }, { torn: [50, 41], amp: 3.6 }, { r: 1.8 }, { curl: [60, 47] }],
            sides: [[{ at: 142, tear: 7, gap: 1.1, ang: 0.3, amp: 0.8 }], [{ at: 300 + PFOLD.h, tear: 46, gap: 1.5, ang: 0.1 }, { at: 470, tear: 5, gap: 1, ang: -0.4, amp: 0.7 }], [{ at: 210 - PFOLD.v, tear: 11, gap: 1.2, ang: 0.06, amp: 0.9 }], [{ at: 388, tear: 6, gap: 1, ang: 0.5, amp: 0.7 }]],
        }));
        const out = F.pts(O.pts);
        groundShadow(g, out, ground, 1.2);
        S.piece(g, out, {
            fill: '#ebd2c1', line: 1.9, heavy: 0.9, cast: { blur: 12, dx: 5, dy: 7, color: 'rgba(16,10,34,0.55)' },
            detail: (q) => {
                paste(q, F, sp, box);
                // folded in four: the first fold runs the whole width (a valley), the second is
                // a valley above it and a ridge below
                fold(q, F, [-210, PFOLD.h], [210, PFOLD.h], 'valley', 'ph' + seed, { band: 46 });
                fold(q, F, [PFOLD.v, -300], [PFOLD.v, PFOLD.h], 'valley', 'pv0' + seed, { band: 40 });
                fold(q, F, [PFOLD.v, PFOLD.h], [PFOLD.v, 300], 'ridge', 'pv1' + seed, { band: 40 });
                // where they cross the paper has worn through
                const X = F([PFOLD.v, PFOLD.h]);
                blob(q, X, 6, '255,250,238', 0.7);
                fillPts(q, F.pts([[PFOLD.v - 1.6, PFOLD.h - 0.2], [PFOLD.v + 0.2, PFOLD.h - 1.3], [PFOLD.v + 1.7, PFOLD.h + 0.3], [PFOLD.v - 0.1, PFOLD.h + 1.2]]), '#241a2c');
                sheetLight(q, out, 'poster' + seed, { cockle: 7 });
                O.torn.forEach((tn, i) => fibre(q, F, tn.path, 'poster' + seed + i, { w: tn.kind === 'corner' ? 4.2 : tn.path.length < 14 ? 0.5 : i % 2 ? 2.2 : 0.8 }));
                pinhole(q, F, [-201.6, -291.4], 'p0' + seed);
                pinhole(q, F, [201.2, 290.8], 'p2' + seed, { torn: true });
                curlRise(q, F, O.curl, 13);
            },
        });
        curlFlap(g, F, O.curl, {
            seed: 'poster' + seed, bow: 2.6,
            back: (q, { foot, tip }) => {
                // the hole of its own drawing pin, seen from behind, and the rust that came through
                const hole = F(lerpP(foot, tip, 0.6));
                blob(q, hole, 7, '170,96,44', 0.34);
                for (let i = 0; i < 5; i++) strokePts(q, [pol(2.6, i * 1.3, hole[0], hole[1]), pol(3.2, i * 1.3 + 0.7, hole[0], hole[1])], 0.6, 'rgba(126,64,32,0.5)');
                disc(q, hole, 1.05, '#1d1420');
                // the border's heavy rule shows through from the face
                const a = F(lerpP(foot, tip, 0.2)), dT = F.dir([1, -1].map((v) => v * Math.SQRT1_2));
                strokePts(q, [[a[0] - dT[0] * 30, a[1] - dT[1] * 30], [a[0] + dT[0] * 30, a[1] + dT[1] * 30]], 1.6, 'rgba(84,60,70,0.1)');
            },
        });
        for (const tn of O.torn) if (tn.kind === 'corner') whiskers(g, F, tn.path, 'poster' + seed, { p: 0.2 });
        g.restore();
    }

    // ================================================================== 2 · the tile plaque
    const TILE = 62.4, JOINT = 2.4, PW = 5 * TILE + 4 * JOINT, PH = 2 * TILE + JOINT; // 321.6 × 127.2
    const PANEL = { x: -PW / 2, y: -PH / 2, w: PW, h: PH };
    const COBALT = '#1f3c9a', YELLOW = '#dcab38';

    // Lettering painted by hand: glyph by glyph, none quite upright or on the line.
    function hand(q, text, o) {
        const r = Motion.rng('hand/' + o.seed + text);
        q.save();
        q.font = `${o.size}px ${o.font}`;
        q.textBaseline = 'alphabetic';
        q.textAlign = 'center';
        const chars = [...text], tr = (o.track ?? 0) * o.size, ws = chars.map((ch) => q.measureText(ch).width + tr), total = ws.reduce((a, b) => a + b, 0) - tr;
        let x = (o.x ?? 0) - total / 2;
        chars.forEach((ch, i) => {
            q.save();
            q.translate(x + (ws[i] - tr) / 2, o.y + (r() - 0.5) * o.size * 0.035);
            q.rotate((r() - 0.5) * 0.045);
            const sc = 1 + (r() - 0.5) * 0.05;
            q.scale(sc, sc * (1 + (r() - 0.5) * 0.03));
            if (o.stroke) {
                q.lineWidth = o.stroke;
                q.lineJoin = 'round';
                q.strokeText(ch, 0, 0);
            }
            q.fillText(ch, 0, 0);
            q.restore();
            x += ws[i];
        });
        q.restore();
        return { x0: (o.x ?? 0) - total / 2, x1: (o.x ?? 0) + total / 2, width: total };
    }
    // a line drawn with a liner brush: it wavers, swells and thins
    function liner(q, a, b, w, seed) {
        const L = dist(a, b), n = Math.max(3, Math.round(L / 6)), t = [(b[0] - a[0]) / L, (b[1] - a[1]) / L], pts = [];
        for (let i = 0; i <= n; i++) {
            const u = i / n, wv = Motion.noise1('liner/' + seed, u * L * 0.06) * 0.35;
            pts.push([a[0] + (b[0] - a[0]) * u - t[1] * wv, a[1] + (b[1] - a[1]) * u + t[0] * wv]);
        }
        // in a few loads of the brush, each starting fat and running thin
        const r = Motion.rng('linerw/' + seed);
        let i0 = 0;
        while (i0 < n) {
            const i1 = Math.min(n, i0 + 5 + Math.floor(r() * 9));
            S.ink(q, S.curve(pts.slice(i0, i1 + 1), false, 4), { w: w * (0.85 + r() * 0.35), color: '#000', taper: [0.25, 0.55] });
            i0 = i1 - 1;
            if (i1 >= n) break;
        }
    }
    // the city's sign, as the tile painter draws it: a round fruit with its crown, split
    function tilePomegranate(q, x, y, s, which) {
        q.save();
        q.translate(x, y);
        q.scale(s, s);
        if (which === 'yellow') {
            q.beginPath();
            q.ellipse(0, 0.6, 5.2, 5, 0, 0, TAU);
            q.fill();
            for (const m of [-1, 1]) {
                q.beginPath();
                q.ellipse(m * 6.6, 6, 3.4, 1.4, m * 0.5, 0, TAU);
                q.fill();
            }
        } else {
            q.lineWidth = 1.05;
            q.lineJoin = q.lineCap = 'round';
            q.beginPath();
            q.ellipse(0, 0.6, 5.4, 5.2, 0, 0.35 - Math.PI / 2, TAU - 0.35 - Math.PI / 2);
            q.stroke();
            // the crown: three points
            q.beginPath();
            S.trace(q, [[-2, -4.2], [-2.8, -8.2], [-0.9, -6.2], [0, -8.8], [0.9, -6.2], [2.8, -8.2], [2, -4.2]], false);
            q.stroke();
            // the split and its seeds
            q.lineWidth = 0.7;
            q.beginPath();
            q.moveTo(-0.4, -2.6);
            q.quadraticCurveTo(-2.6, 0.6, -0.4, 4);
            q.quadraticCurveTo(2.2, 0.6, -0.4, -2.6);
            q.stroke();
            for (const [dx, dy] of [[-0.5, -0.8], [-0.3, 0.9], [-0.6, 2.4]]) {
                q.beginPath();
                q.arc(dx, dy, 0.5, 0, TAU);
                q.fill();
            }
            // two leaves on the stalk
            q.lineWidth = 0.8;
            for (const m of [-1, 1]) {
                q.beginPath();
                q.ellipse(m * 6.6, 6, 3.6, 1.5, m * 0.5, 0, TAU);
                q.stroke();
                q.beginPath();
                q.moveTo(m * 3.6, 4.4);
                q.lineTo(m * 9, 7.6);
                q.stroke();
            }
            q.beginPath();
            q.moveTo(0, 5.8);
            q.lineTo(0, 9);
            q.stroke();
        }
        q.restore();
    }

    function plaquePaint(res, seed) {
        return memo(`plaque/${seed}@${res}`, () => {
            const box = PANEL, { c, q } = sheet(box, res), r = Motion.rng('plaquepaint/' + seed);
            const hx = PW / 2, hy = PH / 2;
            // the tin glaze: a white that is never one white, laid on with a wide brush
            q.fillStyle = '#e9ece2';
            q.fillRect(box.x, box.y, box.w, box.h);
            for (let i = 0; i < 46; i++) {
                const cool = r() < 0.5;
                blob(q, [box.x + r() * box.w, box.y + r() * box.h], 14 + r() * 40, cool ? '196,208,224' : '250,246,228', cool ? 0.2 + r() * 0.16 : 0.3 + r() * 0.3);
            }
            for (let i = 0; i < 26; i++) {
                const y = box.y + r() * box.h, x = box.x + r() * box.w, l = 40 + r() * 120;
                dab(q, [[x, y], [x + l / 2, y + (r() - 0.5) * 3], [x + l, y + (r() - 0.5) * 4]], { w: 5 + r() * 9, color: r() < 0.5 ? '#f8f8f0' : '#cfd6de', alpha: 0.12 + r() * 0.12, bristles: 8, seed: 'glz' + seed + i, dry: 0.5 });
            }
            lay(q, 'grain', box, 0.3, 0.3);

            // the border: where things are along it. Each straight run between two corner
            // squares carries a wave with a leaf in every bay.
            const bi = 12.5, cs = 6.7; // the band's middle line (in from the edge) and half a corner square
            const runs = [[[-hx + bi + cs, -hy + bi], [hx - bi - cs, -hy + bi]], [[hx - bi, -hy + bi + cs], [hx - bi, hy - bi - cs]], [[hx - bi - cs, hy - bi], [-hx + bi + cs, hy - bi]], [[-hx + bi, hy - bi - cs], [-hx + bi, -hy + bi + cs]]];
            const motif = (fn) => runs.forEach(([a, b]) => {
                const L = dist(a, b), n = Math.max(2, Math.round(L / 13.2)), hp = L / n, t = [(b[0] - a[0]) / L, (b[1] - a[1]) / L], nn = [-t[1], t[0]];
                const at = (s, off) => [a[0] + t[0] * s + nn[0] * off, a[1] + t[1] * s + nn[1] * off];
                fn({ L, n, hp, at, ang: Math.atan2(t[1], t[0]) });
            });
            const corners = [[-hx + bi, -hy + bi], [hx - bi, -hy + bi], [hx - bi, hy - bi], [-hx + bi, hy - bi]];
            const POM = 112, FLO = 123; // the pomegranates beside «CALLE DE», the florets beside the name

            const yellow = inked(box, res, (k) => {
                motif(({ n, hp, at, ang }) => {
                    for (let j = 0; j < n; j++) {
                        const sg = j % 2 ? 1 : -1, p = at((j + 0.5) * hp + (r() - 0.5) * 0.8, -sg * 2.2);
                        k.save();
                        k.translate(p[0], p[1]);
                        k.rotate(ang - sg * 0.5 + (r() - 0.5) * 0.2);
                        k.beginPath();
                        k.moveTo(-4.4, 0);
                        k.bezierCurveTo(-2.4, -2.2, 2.4, -2, 4.8, 0.2);
                        k.bezierCurveTo(2.2, 1.9, -2.4, 2, -4.4, 0);
                        k.fill();
                        k.restore();
                    }
                });
                for (const [x, y] of corners) {
                    k.beginPath();
                    k.arc(x + (r() - 0.5) * 0.6, y + (r() - 0.5) * 0.6, 5.1, 0, TAU);
                    k.fill();
                }
                for (const m of [-1, 1]) {
                    tilePomegranate(k, m * POM, -19.4, 1.02, 'yellow');
                    k.beginPath();
                    k.arc(m * FLO, 22.5, 2.3, 0, TAU);
                    k.fill();
                }
            }, {
                color: YELLOW, tile: 'dry', mottle: 0.3, squash: 0, pool: { w: 0.5, color: '#9a6614', alpha: 0.5 }, bleed: { blur: 0.4, alpha: 0.5 },
                over: (k) => {
                    for (let i = 0; i < 700; i++) {
                        const x = box.x + r() * box.w, y = box.y + r() * box.h, a = r() * TAU, l = 2 + r() * 5;
                        dab(k, [[x, y], [x + Math.cos(a) * l, y + Math.sin(a) * l]], { w: 1 + r() * 1.6, color: r() < 0.55 ? '#b27a1c' : '#f6e08c', alpha: 0.3 + r() * 0.3, bristles: 4, seed: 'yl' + seed + i, dry: 0.4 });
                    }
                },
            });

            const cobalt = inked(box, res, (k) => {
                // two bands ruled on the wheel of the hand: each side its own stroke, crossing
                // the next at the corner
                const band = (inset, w, sd) => {
                    const x = hx - inset, y = hy - inset, ov = 0.9;
                    liner(k, [-x - ov, -y], [x + ov, -y], w, sd + 't');
                    liner(k, [x, -y - ov], [x, y + ov], w, sd + 'r');
                    liner(k, [x + ov, y], [-x - ov, y], w, sd + 'b');
                    liner(k, [-x, y + ov], [-x, -y - ov], w, sd + 'l');
                };
                band(4.4, 2.3, 'o' + seed);
                band(20.8, 1.05, 'i' + seed);
                band(7.1, 0.55, 'h' + seed);
                // the wave, a hook in every bay, a dot on every crest
                motif(({ L, n, hp, at, ang }) => {
                    const pts = [];
                    for (let s2 = 0; s2 <= L + 0.01; s2 += 0.8) pts.push(at(s2, -2.9 * Math.sin((s2 / hp) * Math.PI) + Motion.noise1('wave/' + seed, s2 * 0.2 + ang) * 0.3));
                    S.ink(k, pts, { w: 1.4, color: '#000', taper: [0.4, 0.4] });
                    for (let j = 0; j < n; j++) {
                        const sg = j % 2 ? 1 : -1, s0 = (j + 0.5) * hp;
                        // the hook that outlines the leaf
                        const hook = [at(s0 - 5.2, -sg * 0.4), at(s0 - 2.4, -sg * 4.7), at(s0 + 3, -sg * 4.5), at(s0 + 5.4, -sg * 2.3)];
                        S.ink(k, S.curve(hook, false, 5), { w: 0.9, color: '#000', taper: [0.1, 0.9] });
                        const d = at(s0 + (r() - 0.5) * 0.6, sg * 4.6);
                        k.beginPath();
                        k.arc(d[0], d[1], 0.85 + r() * 0.3, 0, TAU);
                        k.fill();
                    }
                });
                // corner squares: a flower of eight petals
                for (const [x, y] of corners) {
                    k.lineWidth = 0.9;
                    k.lineJoin = 'round';
                    k.strokeRect(x - 6.5 + (r() - 0.5) * 0.4, y - 6.5 + (r() - 0.5) * 0.4, 13, 13);
                    for (let i = 0; i < 8; i++) {
                        const a = (i / 8) * TAU + 0.1;
                        k.save();
                        k.translate(x + Math.cos(a) * 3.5, y + Math.sin(a) * 3.5);
                        k.rotate(a);
                        k.lineWidth = 0.55;
                        k.beginPath();
                        k.ellipse(0, 0, 2.1, 0.95, 0, 0, TAU);
                        k.stroke();
                        k.restore();
                    }
                    k.beginPath();
                    k.arc(x, y, 1.3, 0, TAU);
                    k.fill();
                }
                // the name
                // the name: a line to each row of tiles, so the long joint cuts no letter
                hand(k, 'CALLE DE', { font: FACE.fell, size: 27.6, y: -12.2, track: 0.2, stroke: 1.05, seed });
                hand(k, 'ELVIRA', { font: FACE.fell, size: 41, y: 36.4, track: 0.17, stroke: 1.3, seed });
                for (const m of [-1, 1]) {
                    tilePomegranate(k, m * POM, -19.4, 1.02, 'cobalt');
                    // a floret either side of the name
                    for (let i = 0; i < 4; i++) {
                        const a = (i / 4) * TAU + Math.PI / 4;
                        k.save();
                        k.translate(m * FLO + Math.cos(a) * 4.3, 22.5 + Math.sin(a) * 4.3);
                        k.rotate(a);
                        k.beginPath();
                        k.ellipse(0, 0, 2.6, 1.35, 0, 0, TAU);
                        k.fill();
                        k.restore();
                    }
                    k.beginPath();
                    k.arc(m * FLO, 34.5, 1, 0, TAU);
                    k.arc(m * FLO, 10.5, 1, 0, TAU);
                    k.fill();
                }
            }, {
                color: COBALT, tile: 'dry', mottle: 0.34, squash: 0, pool: { w: 0.55, color: '#0b1750', alpha: 0.62 }, bleed: { blur: 0.55, alpha: 0.55 },
                over: (k) => {
                    // every stroke of a letter starts pale, where the loaded brush touched down
                    // and spread, and ends dark, where it lifted and the cobalt pooled
                    for (const [y0, y1] of [[-30.5, -11.6], [9, 37]]) {
                        const gr = k.createLinearGradient(0, y0, 0, y1);
                        gr.addColorStop(0, 'rgba(120,150,232,0.5)');
                        gr.addColorStop(0.35, 'rgba(120,150,232,0)');
                        gr.addColorStop(0.62, 'rgba(8,18,74,0)');
                        gr.addColorStop(1, 'rgba(8,18,74,0.66)');
                        k.fillStyle = gr;
                        k.fillRect(-104, y0 - 2, 208, y1 - y0 + 4);
                    }
                    // the brush's loads: darker where strokes overlap, paler where it dragged
                    for (let i = 0; i < 1900; i++) {
                        const x = box.x + r() * box.w, y = box.y + r() * box.h, a = Math.PI / 2 + (r() - 0.5) * 1.1, l = 4 + r() * 11, dark = r() < 0.55;
                        dab(k, [[x, y], [x + (Math.cos(a) * l) / 2 + (r() - 0.5), y + (Math.sin(a) * l) / 2], [x + Math.cos(a) * l, y + Math.sin(a) * l]], { w: 1.4 + r() * 3, color: dark ? '#0a1650' : '#7f9eea', alpha: dark ? 0.4 + r() * 0.35 : 0.3 + r() * 0.3, bristles: 5, seed: 'cb' + seed + i, dry: 0.5 });
                    }
                    // the bristles' own tracks down every stroke
                    k.lineCap = 'round';
                    for (let i = 0; i < 2600; i++) {
                        const x = -106 + r() * 212, y = r() < 0.42 ? -32 + r() * 22 : 7 + r() * 31, l = 2 + r() * 8, dark = r() < 0.5;
                        k.strokeStyle = dark ? `rgba(6,14,64,${(0.2 + r() * 0.3).toFixed(2)})` : `rgba(150,176,244,${(0.2 + r() * 0.3).toFixed(2)})`;
                        k.lineWidth = 0.16 + r() * 0.22;
                        k.beginPath();
                        k.moveTo(x, y);
                        k.lineTo(x + (r() - 0.5) * 0.8, y + l);
                        k.stroke();
                    }
                    // where one stroke crossed another the pigment lies double: dark knots
                    for (let i = 0; i < 260; i++) blob(k, [-104 + r() * 208, r() < 0.5 ? -30 + r() * 19 : 9 + r() * 28], 1 + r() * 2.2, '6,14,64', 0.35 + r() * 0.35);
                },
            });
            print(q, box, yellow, 0.95);
            print(q, box, cobalt, 0.96);
            // specks that fell on the glaze in the kiln
            for (let i = 0; i < 60; i++) {
                const p = [box.x + r() * box.w, box.y + r() * box.h], blue = r() < 0.6;
                blob(q, p, 0.8 + r() * 1.2, blue ? '31,60,154' : '120,84,40', 0.25 + r() * 0.3);
                disc(q, p, 0.16 + r() * 0.3, blue ? 'rgba(20,40,120,0.75)' : 'rgba(96,60,30,0.7)');
            }
            return c;
        });
    }

    // One tile: its biscuit, then its glazed face with the painting, set a little askew.
    function azulejo(g, F, sp, col, row, seed, o = {}) {
        const key = `${seed}/${col}/${row}`, r = Motion.rng('tile/' + key);
        const cx = PANEL.x + TILE / 2 + col * (TILE + JOINT), cy = PANEL.y + TILE / 2 + row * (TILE + JOINT);
        const Ft = F.sub(cx + (r() - 0.5) * 0.9, cy + (r() - 0.5) * 0.9, (r() - 0.5) * 0.016);
        const w = TILE + (r() - 0.5) * 0.9, h = TILE + (r() - 0.5) * 0.9;
        const base = [0, 1, 2, 3].map(() => ({ r: 1.3 + r() * 1.3 })), bisc = base.slice(), glaze = base.slice();
        if (o.chip) glaze[o.chip.c] = { torn: o.chip.size, amp: 1.15 };
        if (o.gone) {
            bisc[o.gone.c] = { torn: o.gone.size, amp: 1.4 };
            glaze[o.gone.c] = { torn: o.gone.size.map((v) => v + 3.2), amp: 1.2 };
        }
        const sides = [0, 1, 2, 3].map(() => (r() < 0.34 ? [{ at: 9 + r() * (TILE - 18), nick: 0.7 + r() * 1.5 }] : []));
        const OB = memo('bisc/' + key, () => outline(w, h, 'bisc/' + key, { corners: bisc, jitter: 0.22 }));
        const OG = memo('glaze/' + key, () => outline(w - 0.7, h - 0.7, 'glaze/' + key, { corners: glaze, jitter: 0.26, sides }));
        const bpts = Ft.pts(OB.pts), gpts = Ft.pts(OG.pts);
        // the biscuit: red clay, seen wherever the glaze has gone
        S.piece(g, bpts, {
            fill: '#b9623e', line: 0.9, heavy: 0.6, shade: { color: '#6a2a22', alpha: 0.75, w: 4.5 }, light: { color: '#eaa878', alpha: 0.6, w: 3 },
            detail: (q) => {
                lay(q, 'grit', S.bbox(bpts), 0.3, 0.42);
                for (const tn of OB.torn) strokePts(q, Ft.pts(tn.path), 1.3, 'rgba(238,176,130,0.7)');
            },
        });
        S.piece(g, gpts, {
            fill: '#eaede4', line: 0.75, heavy: 0.5, cast: { blur: 1.1, dx: SD[0] * 1.2, dy: SD[1] * 1.4, color: 'rgba(46,14,18,0.7)' },
            detail: (q) => {
                onFrame(q, Ft, (p) => {
                    p.imageSmoothingQuality = 'high';
                    p.drawImage(sp, PANEL.x - cx, PANEL.y - cy, PANEL.w, PANEL.h);
                });
                // its own white: every tile came out of the kiln a little different
                const tv = r();
                fillPts(q, gpts, tv < 0.5 ? `rgba(226,206,160,${(0.05 + tv * 0.22).toFixed(3)})` : `rgba(170,190,220,${(0.03 + (tv - 0.5) * 0.24).toFixed(3)})`);
                // crazing
                const nc = Math.floor(Math.pow(r(), 1.6) * 16) + (o.crazed ? 12 : 1);
                for (let i = 0; i < nc; i++) {
                    let p = [(r() - 0.5) * w, (r() - 0.5) * h], a = r() * TAU;
                    const line = [p], steps = 5 + Math.floor(r() * 12);
                    for (let j = 0; j < steps; j++) {
                        a += (r() - 0.5) * 1.1;
                        p = [p[0] + Math.cos(a) * (2 + r() * 3.4), p[1] + Math.sin(a) * (2 + r() * 3.4)];
                        line.push(p);
                        if (r() < 0.16) {
                            const b = a + (r() < 0.5 ? 1 : -1) * (0.9 + r() * 0.7), l = 3 + r() * 6;
                            strokePts(q, Ft.pts([p, [p[0] + Math.cos(b) * l, p[1] + Math.sin(b) * l]]), 0.24, 'rgba(92,80,72,0.4)');
                        }
                    }
                    strokePts(q, Ft.pts(line), 0.26 + r() * 0.1, `rgba(92,80,72,${(0.3 + r() * 0.25).toFixed(2)})`);
                }
                if (o.crack) {
                    // cracked across: the two halves no longer lie in one plane
                    const line = Ft.pts(S.curve(o.crack, false, 5)), A = line[0], B = line[line.length - 1], L = dist(A, B), nrm = [-(B[1] - A[1]) / L, (B[0] - A[0]) / L], sg = dot2(nrm, SD) >= 0 ? 1 : -1;
                    q.save();
                    q.beginPath();
                    S.trace(q, [...line, [B[0] + nrm[0] * sg * 60, B[1] + nrm[1] * sg * 60], [A[0] + nrm[0] * sg * 60, A[1] + nrm[1] * sg * 60]]);
                    q.clip();
                    q.fillStyle = 'rgba(60,70,110,0.13)';
                    q.fillRect(A[0] - 90, A[1] - 90, 180, 180);
                    q.restore();
                    S.ink(q, line, { w: 0.7, color: '#2a2233', alpha: 0.9, taper: [0.2, 0.6] });
                    S.ink(q, line.map(([x, y]) => [x + TOL[0] * 0.55, y + TOL[1] * 0.55]), { w: 0.45, color: '#ffffff', alpha: 0.85, taper: [0.2, 0.6] });
                }
                // the glaze: thin and warm at the rounded edge, a shade down the far sides,
                // a light on the near ones
                S.spray(q, gpts, { color: '#c0a070', alpha: 0.55, w: 1.5, push: 0 });
                S.spray(q, gpts, { color: '#66708f', alpha: 0.5, w: 5.5, push: 3.4 });
                S.spray(q, gpts, { color: '#ffffff', alpha: 0.9, w: 2.6, push: 1.6, dir: TOL });
                // its gloss: a soft band of the sky across it, and the window's glint
                const c0 = Ft([(r() - 0.5) * 30, (r() - 0.5) * 30]), bw = 6 + r() * 7;
                const gr = q.createLinearGradient(c0[0] - TOL[0] * bw, c0[1] - TOL[1] * bw, c0[0] + TOL[0] * bw, c0[1] + TOL[1] * bw);
                gr.addColorStop(0, 'rgba(255,255,255,0)');
                gr.addColorStop(0.5, `rgba(255,255,255,${(0.16 + r() * 0.2).toFixed(2)})`);
                gr.addColorStop(1, 'rgba(255,255,255,0)');
                fillPts(q, gpts, gr);
                // the rounded edges that face the lamp carry its light as a clean line, broken
                // where the edge is not true; a short fat gleam and a dash where two of them meet
                const hw2 = w / 2 - 2.1, hh2 = h / 2 - 2.1;
                for (const [ax, ay, bx2, by2, nx, ny] of [[-hw2, -hh2, hw2, -hh2, 0, -1], [hw2, -hh2, hw2, hh2, 1, 0], [hw2, hh2, -hw2, hh2, 0, 1], [-hw2, hh2, -hw2, -hh2, -1, 0]]) {
                    const facing = dot2(Ft.dir([nx, ny]), TOL);
                    if (facing < 0.3) continue;
                    let u = 0.04 + r() * 0.1;
                    while (u < 0.9) {
                        const u1 = Math.min(0.96, u + 0.12 + r() * 0.3);
                        S.ink(q, Ft.pts([[ax + (bx2 - ax) * u, ay + (by2 - ay) * u], [ax + (bx2 - ax) * u1, ay + (by2 - ay) * u1]]), { w: 0.5 + 0.8 * facing, color: '#ffffff', alpha: 0.95, taper: [0.5, 0.5] });
                        u = u1 + 0.05 + r() * 0.16;
                    }
                }
                if (r() < 0.8) {
                    const lc = [Math.sign(Ft.dir([1, 0])[0] * TOL[0] + Ft.dir([1, 0])[1] * TOL[1]) || 1, Math.sign(Ft.dir([0, 1])[0] * TOL[0] + Ft.dir([0, 1])[1] * TOL[1]) || 1];
                    const m = [lc[0] * (hw2 - 4.5 - r() * 3), lc[1] * (hh2 - 4.5 - r() * 3)], tx = -lc[1] * 0.7, ty = lc[0] * 0.7;
                    S.ink(q, Ft.pts([[m[0] - tx * 2.6, m[1] - ty * 2.6], m, [m[0] + tx * 2.6, m[1] + ty * 2.6]]), { w: 2.3, color: '#ffffff', alpha: 0.92, taper: [0.35, 0.35] });
                    S.ink(q, Ft.pts([[m[0] + tx * 4.2, m[1] + ty * 4.2], [m[0] + tx * 6, m[1] + ty * 6]]), { w: 1.5, color: '#ffffff', alpha: 0.85, taper: [0.3, 0.3] });
                }
                // pinholes where a bubble burst in the glaze
                for (let i = 2 + Math.floor(r() * 7); i > 0; i--) {
                    const p = Ft([(r() - 0.5) * (w - 6), (r() - 0.5) * (h - 6)]), rr = 0.22 + r() * 0.3;
                    disc(q, p, rr, 'rgba(62,62,86,0.75)');
                    disc(q, [p[0] + SD[0] * rr * 1.2, p[1] + SD[1] * rr * 1.2], rr * 0.6, 'rgba(255,255,255,0.8)');
                }
                // where the glaze broke off: its white edge stands a hair above the clay
                for (const tn of OG.torn) {
                    strokePts(q, Ft.pts(tn.path), 1.6, 'rgba(255,255,250,0.9)');
                    strokePts(q, Ft.pts(tn.path), 0.5, 'rgba(150,160,190,0.7)');
                }
                // grime in the joint's corner
                S.spray(q, gpts, { color: '#55463c', alpha: 0.3, w: 1, push: 0 });
            },
        });
    }

    function plaque(g, o = {}) {
        const { x = 0, y = 0, s = 1, rot = 0, seed = 'elvira', ground = 0 } = o;
        g.save();
        g.translate(x, y);
        g.scale(s, s);
        const F = frame(0, 0, rot), sp = plaquePaint(resFor(g, PANEL), seed), r = Motion.rng('plaque/' + seed);
        const down = F.dir([0, 1]);
        // the bed of lime mortar the tiles are set in
        const BO = memo('bed/' + seed, () => outline(333, 146, 'bed' + seed, {
            jitter: 1.5, corners: [{ r: 5 }, { r: 3.5 }, { torn: [15, 11], amp: 2.4 }, { r: 4.2 }],
            sides: [[{ at: 70, nick: 2.4 }, { at: 236, nick: 3 }], [{ at: 84, nick: 2.2 }], [{ at: 96, nick: 2.8 }, { at: 250, nick: 2 }], [{ at: 44, nick: 2.6 }]],
        }));
        const bed = F.pts(BO.pts), bb = S.bbox(bed);
        groundShadow(g, bed, ground, 1);
        S.piece(g, bed, {
            fill: '#cdc0a6', line: 2.1, heavy: 0.9, cast: { blur: 9, dx: 4, dy: 6, color: 'rgba(16,10,34,0.55)' },
            detail: (q) => {
                // sandy, pitted, dragged by the trowel
                lay(q, 'grit', bb, 0.36, 0.5);
                lay(q, 'grit', bb, 0.9, 0.3, 'source-over', [9, 5]);
                for (let i = 0; i < 22; i++) {
                    const u = r(), top = r() < 0.5, x0 = -160 + u * 280, yy = (top ? -1 : 1) * (67 + r() * 4), l = 14 + r() * 40;
                    dab(q, F.pts([[x0, yy], [x0 + l / 2, yy + (r() - 0.5) * 1.6], [x0 + l, yy + (r() - 0.5) * 2]]), { w: 1.6 + r() * 3, color: r() < 0.5 ? '#f3ead4' : '#8f8068', alpha: 0.3 + r() * 0.3, bristles: 5, seed: 'trowel' + seed + i, dry: 0.5 });
                }
                for (let i = 0; i < 90; i++) {
                    // grains of sand and the pits they left
                    const edge = r() < 0.5, p = F(edge ? [(r() - 0.5) * 326, (r() < 0.5 ? -1 : 1) * (64 + r() * 8)] : [(r() < 0.5 ? -1 : 1) * (161 + r() * 5), (r() - 0.5) * 140]), rr = 0.3 + r() * 0.9;
                    if (r() < 0.6) {
                        disc(q, p, rr, 'rgba(70,56,52,0.6)');
                        disc(q, [p[0] + SD[0] * rr * 0.9, p[1] + SD[1] * rr * 0.9], rr * 0.7, 'rgba(255,248,230,0.6)');
                    } else {
                        disc(q, [p[0] + SD[0] * 0.5, p[1] + SD[1] * 0.5], rr, 'rgba(60,48,48,0.5)');
                        disc(q, p, rr, r() < 0.5 ? '#e9dfc8' : '#a59479');
                    }
                }
                S.spray(q, bed, { color: '#5e4d4c', alpha: 0.6, w: 8, push: 5 });
                S.spray(q, bed, { color: '#fff7e2', alpha: 0.65, w: 5, push: 3, dir: TOL });
                for (const tn of BO.torn) strokePts(q, F.pts(tn.path), 2.2, 'rgba(244,236,216,0.75)');
                // the recess the tiles sit in
                fillPts(q, F.pts([[PANEL.x - 1.2, PANEL.y - 1.2], [PANEL.x + PW + 1.2, PANEL.y - 1.2], [PANEL.x + PW + 1.2, PANEL.y + PH + 1.2], [PANEL.x - 1.2, PANEL.y + PH + 1.2]]), 'rgba(52,40,44,0.5)');
            },
        });
        // the tiles: the last of the lower row took the knock that broke the bed's corner,
        // one has lost a corner altogether, one is cracked across
        const fate = {
            '4/1': { chip: { c: 2, size: [12, 9.5] } }, '0/0': { gone: { c: 0, size: [7, 5.5] } },
            '2/0': { crack: [[-TILE / 2, -6], [-12, 2], [8, -3], [TILE / 2, 9]] }, '1/1': { chip: { c: 3, size: [5.5, 4.5] }, crazed: true }, '3/0': { crazed: true },
        };
        for (let row = 0; row < 2; row++) for (let col = 0; col < 5; col++) azulejo(g, F, sp, col, row, seed, fate[`${col}/${row}`] ?? {});
        // rain has run down it for years: faint streaks from the joints
        g.save();
        g.beginPath();
        S.trace(g, F.pts([[PANEL.x, PANEL.y], [PANEL.x + PW, PANEL.y], [PANEL.x + PW, PANEL.y + PH], [PANEL.x, PANEL.y + PH]]));
        g.clip();
        for (let i = 0; i < 9; i++) {
            const a = [PANEL.x + r() * PW, PANEL.y + (r() < 0.6 ? 0 : TILE + JOINT / 2)], wd = 1.5 + r() * 4, len = 20 + r() * 44;
            const A = F(a), B = F([a[0] + wd, a[1]]);
            fadeBand(g, A, B, down, len, r() < 0.7 ? '84,76,66' : '120,84,48', 0.1 + r() * 0.1);
        }
        g.restore();
        // a nail left in the mortar, and what its rust has done to the tile below
        const nail = [-121, -67.8], N = F(nail);
        blob(g, N, 6, '150,82,38', 0.4);
        {
            const e = [N[0] + down[0] * 24, N[1] + down[1] * 24], sd = [-down[1], down[0]], gr = g.createLinearGradient(N[0], N[1], e[0], e[1]);
            gr.addColorStop(0, 'rgba(150,80,36,0.5)');
            gr.addColorStop(1, 'rgba(150,80,36,0)');
            fillPts(g, [[N[0] - sd[0] * 1.3, N[1] - sd[1] * 1.3], [N[0] + sd[0] * 1.3, N[1] + sd[1] * 1.3], [e[0] + sd[0] * 0.5, e[1] + sd[1] * 0.5], [e[0] - sd[0] * 0.3, e[1] - sd[1] * 0.3]], gr);
        }
        S.piece(g, S.ellipse(N[0], N[1], 2.1, 1.9, 14), { fill: '#6a3b2a', line: 0.8, cast: { blur: 1.2, dx: 0.9, dy: 1.2, color: 'rgba(30,14,20,0.7)' }, shade: { color: '#2c1418', alpha: 0.9, w: 1.4 }, light: { color: '#d08a58', alpha: 0.8, w: 1 } });
        disc(g, [N[0] + TOL[0] * 0.7, N[1] + TOL[1] * 0.7], 0.42, 'rgba(255,226,190,0.9)');
        // whitewash: the wall was limed more than once, and the brush was not careful
        for (const [wx, wy, ws, drips] of [[-70, -66.5, 1, [9, 4]], [36, -67.5, 1.3, [19, 7, 11]], [104, -66, 0.8, [6]]]) {
            const rr = Motion.rng('lime/' + seed + wx), top = [], bot = [], wd = 9 * ws;
            // a slap of the brush along the top of the bed, running down in tears of its own
            for (let i = 0; i <= 8; i++) top.push([wx - wd + (2 * wd * i) / 8, wy - (1.2 + rr() * 1.6) * ws * Math.sin((Math.PI * (i + 0.3)) / 8.6)]);
            const xs = drips.map((d, i) => wx - wd * 0.7 + ((i + 0.5 + (rr() - 0.5) * 0.5) / drips.length) * wd * 1.4);
            bot.push([wx + wd, wy + 1.2]);
            for (let i = drips.length - 1; i >= 0; i--) {
                const dw = 0.75 + rr() * 0.5, d = drips[i];
                bot.push([xs[i] + dw + 1.4, wy + 2.2], [xs[i] + dw, wy + 3.6], [xs[i] + dw * 0.8, wy + d * 0.6], [xs[i] + dw * 1.25, wy + d - 0.8], [xs[i], wy + d + 0.5], [xs[i] - dw * 1.25, wy + d - 0.8], [xs[i] - dw * 0.8, wy + d * 0.6], [xs[i] - dw, wy + 3.6], [xs[i] - dw - 1.4, wy + 2.2]);
            }
            bot.push([wx - wd, wy + 1.2]);
            S.piece(g, F.pts(S.curve([...top, ...bot], true, 4)), { fill: '#f0eee3', line: 0, cast: { blur: 0.9, dx: SD[0] * 0.8, dy: SD[1] * 0.9, color: 'rgba(40,30,44,0.6)' }, shade: { color: '#a6a292', alpha: 0.8, w: 1.5 }, light: { color: '#ffffff', alpha: 0.9, w: 1 } });
            for (let i = 0; i < 9; i++) disc(g, F([wx + (rr() - 0.5) * 34 * ws, wy + 3 + rr() * 16 * ws]), 0.25 + rr() * 0.6, 'rgba(241,239,228,0.9)');
        }
        g.restore();
    }

    // ================================================================== 3 · the lottery ticket
    const TICKET = { x: -150, y: -70, w: 300, h: 140 };
    const TFOLD = 23;

    // Guilloche, the engine-turned ground of money and tickets. A band: `n` sine lines out
    // of step along a straight run weave a rope. A rosette: `n` lobed rings out of step.
    function guillocheBand(q, a, b, amp, period, n, lw, env = null) {
        const L = dist(a, b), t = [(b[0] - a[0]) / L, (b[1] - a[1]) / L], nn = [-t[1], t[0]];
        q.lineWidth = lw;
        q.lineJoin = 'round';
        for (let k = 0; k < n; k++) {
            const ph = (k / n) * TAU;
            q.beginPath();
            for (let s2 = 0; s2 <= L + 0.01; s2 += 0.35) {
                const off = amp * Math.sin((s2 / period) * TAU + ph) * (env ? env(s2 / L) : 1);
                const x = a[0] + t[0] * s2 + nn[0] * off, y = a[1] + t[1] * s2 + nn[1] * off;
                if (s2 === 0) q.moveTo(x, y);
                else q.lineTo(x, y);
            }
            q.stroke();
        }
    }
    function rosette(q, cx, cy, R, amp, lobes, n, lw, o = {}) {
        const steps = o.steps ?? Math.max(240, lobes * 22);
        q.lineWidth = lw;
        q.lineJoin = 'round';
        for (let k = 0; k < n; k++) {
            const ph = (k / n) * TAU * (o.twist ?? 1);
            q.beginPath();
            for (let i = 0; i <= steps; i++) {
                const a = (i / steps) * TAU, rr = R + amp * Math.sin(lobes * a + ph) + (o.amp2 ?? 0) * Math.sin((o.lobes2 ?? 3) * a - ph);
                const x = cx + Math.cos(a) * rr, y = cy + Math.sin(a) * rr;
                if (i === 0) q.moveTo(x, y);
                else q.lineTo(x, y);
            }
            q.stroke();
        }
    }
    // a watered field: ruled lines that all wave, each a little out of step with the last
    function watered(q, box, pitch, amp, period, lw, seed = 0) {
        q.lineWidth = lw;
        for (let i = 0, y = box.y; y < box.y + box.h; i++, y += pitch) {
            const ph = 2.3 * Math.sin(i * 0.33 + seed) + 1.2 * Math.sin(i * 0.071 + seed * 2);
            q.beginPath();
            for (let x = box.x; x <= box.x + box.w + 0.01; x += 0.45) {
                const yy = y + amp * Math.sin((x / period) * TAU + ph);
                if (x === box.x) q.moveTo(x, yy);
                else q.lineTo(x, yy);
            }
            q.stroke();
        }
    }
    // The engraver's sphere: hairlines that follow the form and swell in the shade, as
    // crescents about a point on the lit side. The caller clips to the body.
    function hatchBall(q, cx, cy, R, o = {}) {
        const n = o.n ?? 9, lx = o.lx ?? -0.55, ly = o.ly ?? -0.6, off = 0.6 * Math.hypot(lx, ly), ox = cx + lx * R * 0.6, oy = cy + ly * R * 0.6;
        // from where the form turns out of the light (`from`, in radii) to its far edge
        const lo = o.from ?? 0.74, hi = 1 + off;
        for (let i = 0; i < n; i++) {
            const u = (i + 0.5) / n;
            q.lineWidth = (o.w0 ?? 0.2) + ((o.w1 ?? 0.7) - (o.w0 ?? 0.2)) * u * u;
            q.beginPath();
            q.arc(ox, oy, R * (lo + u * (hi - lo)), 0, TAU);
            q.stroke();
        }
    }
    const sym = (right) => [...right, ...right.slice().reverse().filter((p) => Math.abs(p[0]) > 1e-6).map(([x, y]) => [-x, y])];

    // The vignette: a pomegranate in line engraving, rays behind it.
    function engravedPomegranate(q, cx, cy, s) {
        q.save();
        q.translate(cx, cy);
        q.scale(s, s);
        q.lineJoin = q.lineCap = 'round';
        // rays: long and short by turns, each a hair that swells outwards
        for (let i = 0; i < 72; i++) {
            const a = (i / 72) * TAU + 0.02, r0 = 14.2, r1 = i % 2 ? 20.6 : 24.2, ca = Math.cos(a), sa = Math.sin(a), wd = i % 2 ? 0.16 : 0.3;
            q.beginPath();
            q.moveTo(ca * r0, sa * r0);
            q.lineTo(ca * r1 - sa * wd, sa * r1 + ca * wd);
            q.lineTo(ca * r1 + sa * wd, sa * r1 - ca * wd);
            q.closePath();
            q.fill();
        }
        const body = S.curve([[0.8, -11.2], [6.8, -10], [11.4, -4.6], [12.2, 2.6], [9, 9.4], [1.8, 12.4], [-6.2, 10.8], [-11.2, 5], [-12, -2.4], [-8.6, -8.8], [-2.8, -11.4]], true, 8);
        const crown = [[-3.4, -10.4], [-4.6, -14.6], [-6, -18.4], [-3.2, -16], [-1.8, -19.8], [0.1, -16.2], [2, -20], [3.1, -16.2], [5.8, -18.6], [4.6, -14.6], [3.6, -10.4]];
        const leaf = S.curve([[-9.6, 9.4], [-14.6, 8.6], [-19.6, 11.6], [-22.4, 15.6], [-17, 15.6], [-12.4, 13.2]], true, 6);
        // a halo of bare paper round the fruit, as engravers leave
        cutting(q, (k) => {
            k.lineWidth = 2.6;
            for (const sh of [body, crown, leaf]) {
                k.beginPath();
                S.trace(k, sh);
                k.fill();
                k.stroke();
            }
        });
        const line = (pts, w, closed = true) => {
            q.lineWidth = w;
            q.beginPath();
            S.trace(q, pts, closed);
            q.stroke();
        };
        // the leaf: a midrib, its far half hatched
        line(leaf, 0.55);
        line([[-10.4, 10.6], [-16, 12], [-21.6, 15.2]], 0.35, false);
        q.save();
        q.beginPath();
        S.trace(q, leaf);
        q.clip();
        q.lineWidth = 0.24;
        for (let i = 0; i < 10; i++) {
            q.beginPath();
            q.moveTo(-10.6 - i * 1.25, 11 + i * 0.36);
            q.lineTo(-12.4 - i * 1.25, 16.4 + i * 0.36);
            q.stroke();
        }
        q.restore();
        // the crown: a flared tube, its teeth lined
        line(crown, 0.6);
        q.lineWidth = 0.26;
        for (const [x0, x1] of [[-2.6, -4.4], [-1.2, -1.8], [0.6, 1.6], [2.4, 4.2], [-0.4, 0.1], [1.6, 2.8]]) {
            q.beginPath();
            q.moveTo(x0, -11);
            q.lineTo(x1, -16.4);
            q.stroke();
        }
        // the fruit: outline, crescents of hatching, a second hatch across them in the deep shade
        line(body, 0.85);
        q.save();
        q.beginPath();
        S.trace(q, body);
        q.clip();
        hatchBall(q, 0, 0.6, 12.2, { n: 12, w0: 0.18, w1: 0.82, from: 0.8 });
        q.lineWidth = 0.28;
        for (let i = 0; i < 9; i++) {
            q.beginPath();
            q.arc(-13 + i * 0.4, 16 - i * 0.2, 20 + i * 1.35, -1.25, 0.1);
            q.stroke();
        }
        q.restore();
        // split open: the skin's torn lips and the seeds packed behind them
        const split = S.curve([[-7.6, -0.6], [-5.6, -3.6], [-3.4, -3], [-1.6, -6], [0.6, -4.2], [3, -4.6], [2.6, -1.4], [4.6, 1], [2.2, 2.6], [1.4, 5.6], [-1.6, 4.2], [-4, 6], [-5.2, 3.2], [-7.4, 2.6]], true, 4);
        cutting(q, (k) => {
            k.beginPath();
            S.trace(k, split);
            k.fill();
        });
        line(split, 0.6);
        q.save();
        q.beginPath();
        S.trace(q, split);
        q.clip();
        q.lineWidth = 0.28;
        for (let row = 0; row < 7; row++) {
            for (let col = 0; col < 7; col++) {
                const jx = S.hashI(row, col, 1, 9) - 0.5, jy = S.hashI(row, col, 2, 9) - 0.5;
                const x = -8 + col * 2.05 + (row % 2) * 1.02 + jx * 0.5, y = -6.4 + row * 1.86 + jy * 0.4;
                q.beginPath();
                q.ellipse(x, y, 0.98, 0.8, 0.4 + jx, 0, TAU);
                q.stroke();
                q.beginPath();
                q.arc(x + 0.32, y + 0.3, 0.28, 0, TAU);
                q.fill();
            }
        }
        // the membrane that parts the seeds
        q.lineWidth = 0.5;
        q.beginPath();
        q.moveTo(-1.8, -5.6);
        q.quadraticCurveTo(-0.6, 0, -2.6, 5.4);
        q.stroke();
        q.restore();
        q.restore();
    }

    function ticketPrint(res, seed) {
        return memo(`ticket/${seed}@${res}`, () => {
            const box = TICKET, { c, q } = sheet(box, res), r = Motion.rng('ticketprint/' + seed);
            stock(q, box, { base: '#e7e0c5', seed: 'ticket' + seed, fox: 3, blot: 1.3, warm: '168,140,86', fly: 1 });
            // the thumb's grime at the corner it was held by
            blob(q, [128, 50], 34, '110,92,70', 0.2);
            blob(q, [136, 58], 16, '96,80,62', 0.22);
            const wear = (k) => {
                rub(k, [TFOLD, -70], [TFOLD, 70], 'tf' + seed, 0.9);
                for (let i = 0; i < 7; i++) {
                    const x = -140 + r() * 280, y = -62 + r() * 124, a = r() * 3, l = 14 + r() * 40;
                    dab(k, [[x, y], [x + (Math.cos(a) * l) / 2, y + (Math.sin(a) * l) / 2 + (r() - 0.5) * 4], [x + Math.cos(a) * l, y + Math.sin(a) * l]], { w: 2 + r() * 6, color: '#000', alpha: 0.2 + r() * 0.3, bristles: 8, seed: 'tscuff' + seed + i, dry: 0.7 });
                }
            };
            const PX = 39; // the middle of the panel right of the stub
            // 1 · the underprint, rose: a watered field, a sun where the number will fall
            const rose = inked(box, res, (k) => {
                k.save();
                k.beginPath();
                k.rect(-58.6, -54.4, 192.6, 108.8);
                k.clip();
                watered(k, { x: -59, y: -55, w: 194, h: 110 }, 2.15, 1.05, 8.6, 0.3, 1);
                cutting(k, (k2) => {
                    k2.beginPath();
                    k2.arc(PX, -1, 31, 0, TAU);
                    k2.fill();
                });
                for (let i = 0; i < 120; i++) {
                    const a = (i / 120) * TAU, r1 = i % 2 ? 24.5 : 30;
                    k.lineWidth = i % 2 ? 0.22 : 0.32;
                    k.beginPath();
                    k.moveTo(PX + Math.cos(a) * 10.5, -1 + Math.sin(a) * 10.5);
                    k.lineTo(PX + Math.cos(a) * r1, -1 + Math.sin(a) * r1);
                    k.stroke();
                }
                rosette(k, PX, -1, 7.4, 2.2, 9, 7, 0.24);
                k.restore();
            }, { color: '#c98468', wear, mottle: 0.7, squash: 0 });
            // 2 · the guilloche and the vignette, green
            const green = inked(box, res, (k) => {
                // the border: two rails, a rope between them, a rosette on every corner
                k.lineWidth = 0.5;
                k.strokeRect(-145.4, -65.4, 290.8, 130.8);
                k.lineWidth = 0.36;
                k.strokeRect(-134.6, -54.6, 269.2, 109.2);
                const bx = 140, by = 60;
                for (const [a, b] of [[[-bx, -by], [bx, -by]], [[bx, -by], [bx, by]], [[bx, by], [-bx, by]], [[-bx, by], [-bx, -by]]]) guillocheBand(k, a, b, 4, 8.75, 5, 0.25);
                for (const [sx, sy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
                    cutting(k, (k2) => {
                        k2.beginPath();
                        k2.arc(sx * bx, sy * by, 6.2, 0, TAU);
                        k2.fill();
                    });
                    rosette(k, sx * bx, sy * by, 3.5, 1.7, 7, 6, 0.24);
                    k.lineWidth = 0.4;
                    k.beginPath();
                    k.arc(sx * bx, sy * by, 5.6, 0, TAU);
                    k.stroke();
                }
                // the medallion on the stub
                const mx = -100, my = -3;
                rosette(k, mx, my, 31.4, 3.3, 15, 9, 0.24, { amp2: 0.8, lobes2: 5 });
                rosette(k, mx, my, 26.8, 0.75, 44, 2, 0.28);
                k.lineWidth = 0.7;
                k.beginPath();
                k.arc(mx, my, 25.4, 0, TAU);
                k.stroke();
                k.lineWidth = 0.3;
                k.beginPath();
                k.arc(mx, my, 35.6, 0, TAU);
                k.stroke();
                engravedPomegranate(k, mx, my, 1);
                // between stub and ticket: a column of lozenges between hairs
                k.fillRect(-64.6, -54.6, 0.4, 109.2);
                k.fillRect(-59.4, -54.6, 0.4, 109.2);
                for (let y = -51; y < 53; y += 4.6) lozenge(k, -61.8, y, 1.05, 1.7);
                // a fine rope between the share and its price, and a rule under the title
                guillocheBand(k, [-13, 24.6], [47, 24.6], 2.2, 5.4, 4, 0.24, (u) => Math.sin(Math.PI * u) ** 0.5);
            }, { color: '#2e6a51', wear, mottle: 0.6, squash: 0.3, rim: 0.1 });
            // 3 · the text, black
            const black = inked(box, res, (k) => {
                type(k, 'SORTEO DE NAVIDAD', { font: FACE.anton, cap: 11.6, x: PX, y: -37.2, track: 0.22, fit: 186 });
                k.fillRect(-52, -33.4, 182, 0.55);
                k.fillRect(-52, -32, 182, 0.25);
                type(k, '22 DE DICIEMBRE DE 1922', { font: FACE.fell, size: 8.8, x: PX, y: -23.6, track: 0.16 });
                type(k, 'DÉCIMO', { font: FACE.anton, cap: 8.8, x: -54, align: 0, y: 28.4, track: 0.16 });
                type(k, 'DIEZ PESETAS', { font: FACE.fell, size: 10.6, x: 132.5, align: 1, y: 28.4, track: 0.08 });
                type(k, 'Este décimo caduca a los tres meses del sorteo · El portador interesa en la décima parte del billete', { font: FACE.lora, size: 4.3, x: PX, y: 39.6, fit: 186 });
                type(k, 'Serie 3.ª — Fracción 7.ª — Folio 219', { font: FACE.lora, size: 4.7, x: PX, y: 47.6, track: 0.1, slant: 0.18 });
                type(k, 'SERIE 3.ª', { font: FACE.fell, size: 8, x: -100, y: -45.4, track: 0.14 });
                type(k, 'FRACCIÓN 7.ª', { font: FACE.fell, size: 8, x: -100, y: 47.8, track: 0.1 });
            }, { color: '#27232c', wear });
            // 4 · the number, struck afterwards by the numbering machine: heavier, a little crooked
            const number = inked(box, res, (k) => {
                type(k, 'Nº 07 319', { font: FACE.lora, cap: 28.5, x: PX, y: 10.4, stroke: 2.1, track: 0.03, rot: -0.013, fit: 180 });
            }, { color: '#211c25', wear, mottle: 0.9, squash: 0.7, rim: 0.42 });
            // 5 · the seller's rubber stamp, violet aniline: starved on one side
            const SX = 92, SY = 17;
            const rubber = inked(box, res, (k) => {
                k.save();
                k.translate(SX, SY);
                k.rotate(-0.24);
                for (const [rad, lw] of [[33, 1.5], [30.3, 0.5], [19.6, 0.7]]) {
                    k.lineWidth = lw;
                    k.beginPath();
                    k.arc(0, 0, rad, 0, TAU);
                    k.stroke();
                }
                arcType(k, 'ADMINISTRACIÓN DE LOTERÍAS', 0, 0, 21.8, -Math.PI / 2, { font: FACE.anton, size: 6.9, track: 0.07 });
                arcType(k, 'GRANADA', 0, 0, 28.4, Math.PI / 2, { font: FACE.anton, size: 6.9, track: 0.2, inside: true });
                for (const a of [0.62, Math.PI - 0.62]) star(k, Math.cos(a) * 25, Math.sin(a) * 25, 2.3, 5, 0.45);
                type(k, 'N.º 7', { font: FACE.anton, cap: 11.5, x: 0, y: 5.8, track: 0.04 });
                k.fillRect(-15.5, -9.6, 31, 0.6);
                k.fillRect(-15.5, 9.2, 31, 0.6);
                k.restore();
            }, {
                color: '#55349a', tile: 'dry', mottle: 0.62, squash: 0.6, rim: 0.24,
                wear: (k) => {
                    // the pad was pressed harder on the left: the right of the mark is starved
                    const gr = k.createLinearGradient(SX - 20, SY - 14, SX + 34, SY + 22);
                    gr.addColorStop(0, 'rgba(0,0,0,0)');
                    gr.addColorStop(0.5, 'rgba(0,0,0,0.08)');
                    gr.addColorStop(1, 'rgba(0,0,0,0.6)');
                    k.fillStyle = gr;
                    k.fillRect(box.x, box.y, box.w, box.h);
                    k.fillStyle = '#000';
                    rub(k, [TFOLD, -70], [TFOLD, 70], 'tf' + seed, 0.6);
                },
            });
            print(q, box, rose, 0.8);
            print(q, box, green, 0.92, 0.2, -0.25);
            print(q, box, black, 0.96);
            print(q, box, number, 0.97, 0.4, 0.3);
            print(q, box, rubber, 0.3, 1, 0.6); // it slipped as it lifted: a ghost beside the mark
            print(q, box, rubber, 0.86);
            // a pencil tick by the number, as the seller checked the list
            q.lineCap = q.lineJoin = 'round';
            strokePts(q, [[-50, 2], [-47.6, 6.4], [-42, -4.6]], 0.55, 'rgba(74,72,84,0.7)');
            strokePts(q, [[-50.2, 2.4], [-47.8, 6.6], [-42.4, -4.2]], 0.3, 'rgba(74,72,84,0.45)');
            return c;
        });
    }

    function ticket(g, o = {}) {
        const { x = 0, y = 0, s = 1, rot = 0, seed = 'decimo', ground = 0 } = o;
        g.save();
        g.translate(x, y);
        g.scale(s, s);
        const F = frame(0, 0, rot), box = TICKET, sp = ticketPrint(resFor(g, box), seed);
        // torn from its sheet along two perforated sides, cut by the guillotine on the others
        const O = memo('ticket-out/' + seed, () => outline(300, 140, 'ticket' + seed, {
            jitter: 0.3, corners: [{ r: 0.8 }, { curl: [15, 12] }, { r: 2.2 }, { r: 0.8 }],
            perf: [{ pitch: 4.3, r: 1.2, tag: 0.75, short: [9, 41] }, null, null, { pitch: 4.3, r: 1.2, tag: 0.75, short: [5] }],
            sides: [[], [{ at: 96, tear: 5, gap: 0.9, ang: 0.3, amp: 0.6 }], [{ at: 190, tear: 4, gap: 0.9, ang: -0.3, amp: 0.5 }, { at: 150 - TFOLD, tear: 6, gap: 1, ang: 0.05, amp: 0.6 }], []],
        }));
        const out = F.pts(O.pts);
        groundShadow(g, out, ground, 0.8);
        S.piece(g, out, {
            fill: '#e7e0c5', line: 1.2, heavy: 0.8, cast: { blur: 8, dx: 3.5, dy: 5, color: 'rgba(16,10,34,0.55)' },
            detail: (q) => {
                paste(q, F, sp, box);
                fold(q, F, [TFOLD, -70], [TFOLD, 70], 'ridge', 'tf' + seed, { band: 34, wander: 0.4, w: 0.8 });
                // a softer crease across one corner, where it sat in a wallet
                fold(q, F, [-150, 28], [-96, 70], 'valley', 'tc' + seed, { band: 12, w: 0.6, amt: 0.7 });
                sheetLight(q, out, 'ticket' + seed, { k: 0.6, cockle: 4, swell: 0.1, ageA: 0.42, shadeA: 0.34 });
                curlRise(q, F, O.curl, 4);
            },
        });
        // the dog-ear: folded flat, its back bare
        curlFlap(g, F, O.curl, {
            over: 0.93, turn: 1.45, bow: 0.5, line: 1.1, seed: 'ticket' + seed,
            ramp: [[0.12, '#5c4a56'], [0.36, '#a2927c'], [0.52, '#c4b898'], [0.68, '#d9d0b2'], [0.84, '#e6dec4'], [1, '#efe8d0']],
            back: (q, { foot, tip }) => {
                const m = F(lerpP(foot, tip, 0.5)), bb = { x: m[0] - 14, y: m[1] - 14, w: 28, h: 28 };
                lay(q, 'grain', bb, 0.21, 0.6);
                blob(q, m, 7, '168,140,86', 0.2);
            },
        });
        g.restore();
    }

    // ================================================================== 4 · the postage stamp
    const STAMP = { x: -45, y: -55, w: 90, h: 110 };
    const ruled = (q, x, y, w, h, pitch, lw) => {
        q.lineWidth = lw;
        q.lineCap = 'butt';
        q.beginPath();
        for (let yy = y + pitch / 2; yy < y + h; yy += pitch) {
            q.moveTo(x, yy);
            q.lineTo(x + w, yy);
        }
        q.stroke();
    };
    // the stamp's window: straight sides under a round arch
    const windowPath = (q, hw = 28.4, top = -26.2, bot = 25.6, spring = -9) => {
        q.beginPath();
        q.moveTo(-hw, bot);
        q.lineTo(-hw, spring);
        q.bezierCurveTo(-hw, top + 4, -hw * 0.6, top, 0, top);
        q.bezierCurveTo(hw * 0.6, top, hw, top + 4, hw, spring);
        q.lineTo(hw, bot);
        q.closePath();
    };

    // The vignette: a branch of the lemon tree, in line engraving. Everything is line: a
    // ruled sky that closes towards the edges, cross-contours on the fruit, hatched leaves.
    function engravedLemons(q, seed) {
        const r = Motion.rng('lemons/' + seed);
        q.lineJoin = q.lineCap = 'round';
        // the sky
        q.lineCap = 'butt';
        for (let y = -26; y < 26; y += 1.04) {
            const v = Math.abs(y + 2) / 26;
            q.lineWidth = 0.25 + 0.3 * v * v;
            q.beginPath();
            q.moveTo(-29, y);
            q.lineTo(29, y);
            q.stroke();
            // heavier again in the corners: each line swells at both ends
            for (const m of [-1, 1]) {
                q.lineWidth = 0.42 + 0.3 * v;
                q.beginPath();
                q.moveTo(m * 29, y);
                q.lineTo(m * (17 - 6 * v + Math.sin(y * 1.7) * 1.2), y);
                q.stroke();
            }
        }
        q.lineCap = 'round';
        const lemon = (cx, cy, rot, s2) => S.xf(S.curve(sym([[0, -9.6], [2.6, -9.2], [6.2, -5.4], [7.3, 0.4], [5.8, 6], [2.4, 9.6], [1, 11.8], [0, 12.6]]), true, 7), { x: cx, y: cy, rot, sx: s2 });
        const leafPts = (bx, by, ang, len, wd) => S.xf(S.curve([[0, 0], [len * 0.28, -wd * 0.52], [len * 0.7, -wd * 0.36], [len, 0], [len * 0.68, wd * 0.42], [len * 0.28, wd * 0.5]], true, 6), { x: bx, y: by, rot: ang });
        const twig = S.curve([[-30, -15.5], [-20, -17.4], [-9, -14.6], [2, -13.6], [12, -15.4], [21, -18.6], [30, -19.4]], false, 8);
        const stalks = [S.curve([[-8, -14.4], [-9.4, -10.6], [-9.2, -6.4]], false, 5), S.curve([[7, -14.6], [9.4, -11], [10.6, -7.6]], false, 5)];
        const fruit = [lemon(-9.6, 4.4, 0.16, 0.98), lemon(11.4, 3.4, -0.2, 0.9)];
        const leaves = [[-22, -17.2, -1.05, 11, 5], [-12.4, -15.2, -2.05, 10.5, 4.6], [0.6, -13.8, -1.3, 12, 5.2], [14, -16, -0.42, 12.5, 5], [-24.4, -16.6, 2.2, 13, 5.4], [20.4, -18.2, 1.05, 12.6, 5.2], [3.4, -13.4, 0.5, 9, 4]].map((l) => ({ pts: leafPts(...l), l }));
        const petal = (cx, cy, a) => S.xf(S.ellipse(2.5, 0, 2.5, 1.25, 12), { x: cx, y: cy, rot: a });
        const bloom = [-1.2, -21.2], petals = [0, 1, 2, 3, 4].map((i) => petal(bloom[0], bloom[1], (i / 5) * TAU - 0.5));
        // a halo of bare paper round everything, as engravers leave it
        cutting(q, (k) => {
            k.lineWidth = 1.7;
            k.lineJoin = 'round';
            for (const sh of [...fruit, ...leaves.map((l) => l.pts), ...petals]) {
                k.beginPath();
                S.trace(k, sh);
                k.fill();
                k.stroke();
            }
            k.lineWidth = 3;
            for (const ln of [twig, ...stalks]) {
                k.beginPath();
                S.trace(k, ln, false);
                k.stroke();
            }
        });
        // twig and stalks: solid wood with a light cut along it
        q.lineWidth = 1.3;
        q.beginPath();
        S.trace(q, twig, false);
        q.stroke();
        q.lineWidth = 0.75;
        for (const st of stalks) {
            q.beginPath();
            S.trace(q, st, false);
            q.stroke();
        }
        cutting(q, (k) => {
            k.lineWidth = 0.3;
            k.setLineDash([3, 1.6]);
            k.beginPath();
            S.trace(k, twig.map(([x, y]) => [x, y - 0.25]), false);
            k.stroke();
        });
        // leaves: outline, midrib, the half away from the light hatched
        for (const { pts, l } of leaves) {
            const [bx, by, ang, len, wd] = l;
            q.lineWidth = 0.5;
            q.beginPath();
            S.trace(q, pts);
            q.stroke();
            const P = (u, v) => [bx + Math.cos(ang) * u * len - Math.sin(ang) * v * wd, by + Math.sin(ang) * u * len + Math.cos(ang) * v * wd];
            q.lineWidth = 0.34;
            q.beginPath();
            S.trace(q, [P(0.02, 0), P(0.5, 0.03), P(0.98, 0)], false);
            q.stroke();
            // the shaded half is the one whose outward side points down and to the right
            const side = -Math.sin(ang) * 0.62 + Math.cos(ang) * 0.78 >= 0 ? 1 : -1;
            q.save();
            q.beginPath();
            S.trace(q, pts);
            q.clip();
            q.lineWidth = 0.24;
            for (let i = 0; i < 11; i++) {
                const u = 0.06 + i * 0.085;
                q.beginPath();
                S.trace(q, [P(u, 0), P(u + 0.14, side * 0.62)], false);
                q.stroke();
            }
            q.lineWidth = 0.18;
            for (let i = 0; i < 5; i++) {
                const u = 0.14 + i * 0.17;
                q.beginPath();
                S.trace(q, [P(u, 0), P(u + 0.12, -side * 0.5)], false);
                q.stroke();
            }
            q.restore();
        }
        // lemons: outline, crescents that swell into the shade, pores on the lit cheek
        fruit.forEach((pts, i) => {
            const c = i ? [11.4, 4] : [-9.6, 5];
            q.lineWidth = 0.68;
            q.beginPath();
            S.trace(q, pts);
            q.stroke();
            q.save();
            q.beginPath();
            S.trace(q, pts);
            q.clip();
            hatchBall(q, c[0], c[1], 9.4, { n: 12, w0: 0.14, w1: 0.62, from: 0.86 });
            q.lineWidth = 0.24;
            for (let j = 0; j < 8; j++) {
                q.beginPath();
                q.arc(c[0] - 9 + j * 0.4, c[1] + 13, 13 + j * 1.15, -1.2, -0.1);
                q.stroke();
            }
            for (let j = 0; j < 26; j++) {
                const a = r() * TAU, d = r() * 5;
                q.beginPath();
                q.arc(c[0] - 2 + Math.cos(a) * d, c[1] - 2.4 + Math.sin(a) * d * 1.2, 0.13 + r() * 0.1, 0, TAU);
                q.fill();
            }
            q.restore();
            // the nipple and the collar under the calyx
            q.lineWidth = 0.3;
            const tipA = i ? -0.2 : 0.16, tx = c[0] - 0.6 - Math.sin(tipA) * 11, ty = c[1] - 0.6 + Math.cos(tipA) * 11;
            q.beginPath();
            q.arc(tx, ty - 1.6, 1.5, 0.5, 2.6);
            q.stroke();
        });
        // the blossom: five petals, a ring of stamens
        for (const p of petals) {
            q.lineWidth = 0.42;
            q.beginPath();
            S.trace(q, p);
            q.stroke();
        }
        for (let i = 0; i < 5; i++) {
            const a = (i / 5) * TAU - 0.5;
            q.lineWidth = 0.2;
            q.beginPath();
            q.moveTo(bloom[0] + Math.cos(a) * 1.4, bloom[1] + Math.sin(a) * 1.4);
            q.lineTo(bloom[0] + Math.cos(a) * 3.8, bloom[1] + Math.sin(a) * 3.8);
            q.stroke();
        }
        for (let i = 0; i < 7; i++) {
            const a = (i / 7) * TAU;
            q.beginPath();
            q.arc(bloom[0] + Math.cos(a) * 0.9, bloom[1] + Math.sin(a) * 0.9, 0.24, 0, TAU);
            q.fill();
        }
        // a bud
        q.lineWidth = 0.4;
        q.beginPath();
        q.ellipse(24.4, -22.4, 1.7, 1.1, -0.7, 0, TAU);
        q.stroke();
    }

    function stampPrint(res, seed) {
        return memo(`stamp/${seed}@${res}`, () => {
            const box = STAMP, { c, q } = sheet(box, res);
            stock(q, box, { base: '#efe6cc', seed: 'stamp' + seed, fox: 2, fibre: 1.5, blot: 3 });
            const wear = (k) => {
                for (let i = 0; i < 4; i++) {
                    const rr = Motion.rng('stwear/' + seed + i), x = -36 + rr() * 72, y = -46 + rr() * 92, a = rr() * 3, l = 8 + rr() * 22;
                    dab(k, [[x, y], [x + Math.cos(a) * l, y + Math.sin(a) * l]], { w: 2 + rr() * 4, color: '#000', alpha: 0.25 + rr() * 0.3, bristles: 7, seed: 'stw' + seed + i, dry: 0.7 });
                }
                rub(k, [20, -55], [45, -28], 'stc' + seed, 0.7);
            };
            const design = inked(box, res, (k) => {
                k.save();
                k.translate(0.9, -0.7); // the sheet was perforated a little off the design
                k.lineJoin = 'miter';
                k.lineWidth = 1.15;
                k.strokeRect(-37, -47, 74, 94);
                k.lineWidth = 0.32;
                k.strokeRect(-35.1, -45.1, 70.2, 90.2);
                // a border of pearls
                const pearls = (x0, y0, x1, y1) => {
                    const L = Math.hypot(x1 - x0, y1 - y0), n = Math.round(L / 2.18);
                    for (let i = 0; i <= n; i++) {
                        k.beginPath();
                        k.arc(x0 + ((x1 - x0) * i) / n, y0 + ((y1 - y0) * i) / n, 0.62, 0, TAU);
                        k.fill();
                    }
                };
                pearls(-33.2, -43.2, 33.2, -43.2);
                pearls(33.2, -43.2, 33.2, 43.2);
                pearls(33.2, 43.2, -33.2, 43.2);
                pearls(-33.2, 43.2, -33.2, -43.2);
                k.lineWidth = 0.5;
                k.strokeRect(-31.3, -41.3, 62.6, 82.6);
                // the tablets and the spandrels: a ruled tint
                ruled(k, -31.3, -41.3, 62.6, 82.6, 0.74, 0.3);
                // cross-ruled in the spandrels and down the sides, so the window stands out
                k.save();
                k.beginPath();
                k.rect(-31.3, -28.6, 62.6, 56.8);
                k.clip();
                k.lineWidth = 0.26;
                k.beginPath();
                for (let xx = -31; xx < 31.3; xx += 0.8) {
                    k.moveTo(xx, -28.6);
                    k.lineTo(xx, 28.2);
                }
                k.stroke();
                k.restore();
                k.fillRect(-31.3, -28.9, 62.6, 0.6);
                k.fillRect(-31.3, 28.2, 62.6, 0.6);
                // the legend
                const LEG = { font: FACE.anton, cap: 8.6, y: -30.9, track: 0.17, fit: 55 };
                type(k, 'CORREOS', { ...LEG, cut: true, stroke: 1.9 });
                type(k, 'CORREOS', LEG);
                // the value: a star in each corner square, the figure between
                for (const m of [-1, 1]) {
                    cutting(k, (k2) => k2.fillRect(m * 26 - 5.3, 28.8, 10.6, 12.5));
                    k.lineWidth = 0.4;
                    k.strokeRect(m * 26 - 4.6, 29.6, 9.2, 10.9);
                    star(k, m * 26, 35.1, 3.5, 5, 0.42);
                }
                const VAL = { font: FACE.lora, size: 10.8, y: 38.8, stroke: 0.5, track: 0.03 };
                type(k, '25 Cts', { ...VAL, cut: true, stroke: 2.3 });
                type(k, '25 Cts', VAL);
                // the window and what is in it
                cutting(k, (k2) => {
                    windowPath(k2);
                    k2.fill();
                });
                k.save();
                windowPath(k);
                k.clip();
                engravedLemons(k, seed);
                k.restore();
                k.lineWidth = 0.75;
                windowPath(k);
                k.stroke();
                k.lineWidth = 0.3;
                windowPath(k, 29.8, -27.6, 27, -9);
                k.stroke();
                k.restore();
            }, { color: '#a3324a', mottle: 0.7, squash: 0.35, rim: 0.12, wear });
            // the postmark: struck in oily black, heavier where the hammer fell first
            const MX = 14.5, MY = 22.5, MR = -0.3;
            const mark = inked(box, res, (k) => {
                k.save();
                k.translate(MX, MY);
                k.rotate(MR);
                for (const [rad, lw] of [[31.6, 1.3], [19.2, 0.75]]) {
                    k.lineWidth = lw;
                    k.beginPath();
                    k.arc(0, 0, rad, 0, TAU);
                    k.stroke();
                }
                arcType(k, 'GRANADA', 0, 0, 21, -Math.PI / 2, { font: FACE.anton, size: 9.8, track: 0.22 });
                for (const [a, rad] of [[Math.PI / 2 - 0.5, 2.2], [Math.PI / 2, 2.9], [Math.PI / 2 + 0.5, 2.2]]) star(k, Math.cos(a) * 25.4, Math.sin(a) * 25.4, rad, 5, 0.45, a - Math.PI);
                // the date between two bars
                k.fillRect(-18.4, -5.4, 36.8, 0.65);
                k.fillRect(-18.4, 4.9, 36.8, 0.65);
                type(k, '14 JUN 22', { font: FACE.anton, cap: 6.4, x: 0, y: 3.3, track: 0.1 });
                type(k, '10 M', { font: FACE.anton, cap: 3.6, x: 0, y: 10.8, track: 0.14 });
                k.restore();
            }, {
                color: '#27232b', tile: 'dry', mottle: 0.6, squash: 0.5, rim: 0.2,
                wear: (k) => {
                    const gr = k.createLinearGradient(MX - 22, MY - 22, MX + 26, MY + 24);
                    gr.addColorStop(0, 'rgba(0,0,0,0)');
                    gr.addColorStop(0.5, 'rgba(0,0,0,0.08)');
                    gr.addColorStop(1, 'rgba(0,0,0,0.7)');
                    k.fillStyle = gr;
                    k.fillRect(box.x, box.y, box.w, box.h);
                },
            });
            print(q, box, design, 0.95);
            print(q, box, mark, 0.26, -0.7, -0.5); // the hammer bounced: a ghost of the ring
            print(q, box, mark, 0.84);
            return c;
        });
    }

    function stamp(g, o = {}) {
        const { x = 0, y = 0, s = 1, rot = 0, seed = 'sello', ground = 0 } = o;
        g.save();
        g.translate(x, y);
        g.scale(s, s);
        const F = frame(0, 0, rot), box = STAMP, sp = stampPrint(resFor(g, box), seed);
        const pf = (short) => ({ pitch: 5.5, r: 1.42, tag: 0.55, short });
        const O = memo('stamp-out/' + seed, () => outline(90, 110, 'stamp' + seed, { jitter: 0.12, corners: [{ r: 0.5 }, { r: 0.5 }, { r: 0.5 }, { r: 0.5 }], perf: [pf([6]), pf([]), pf([11]), pf([3])] }));
        const out = F.pts(O.pts);
        groundShadow(g, out, ground, 0.5);
        S.piece(g, out, {
            fill: '#efe6cc', line: 1, heavy: 0.7, cast: { blur: 5, dx: 2.4, dy: 3.4, color: 'rgba(16,10,34,0.55)' },
            detail: (q) => {
                paste(q, F, sp, box);
                // a crease across one corner
                fold(q, F, [19, -55], [45, -27], 'ridge', 'stc' + seed, { band: 9, w: 0.55, wander: 0.25 });
                sheetLight(q, out, 'stamp' + seed, { k: 0.34, cockle: 3, swell: 0.1, ageA: 0.5, age: '#a07a44', shadeA: 0.34, litA: 0.4 });
            },
        });
        g.restore();
    }

    // ================================================================== 5 · the matchbox
    // The box in its own measures: X along its length (150), Y across it and away from us
    // (100), Z up (40). We look down on it from the front and a little from the left, so the
    // lid, the long side that faces us and the inside of the open tray show.
    const MB = { L: 150, W: 100, H: 40, out: 38, wt: 1.6, gap: 1.5 };
    const mbP = (X, Y, Z) => [X - 0.13 * Y - 68.5, -0.86 * Y - 0.5 * Z + 53];
    // how much of the house light a face of the box takes, from the way it faces (0..1)
    const mbTone = (n, rot) => {
        const v = [n[0], -(n[1] * 0.86 + n[2] * 0.5), -n[1] * 0.5 + n[2] * 0.86], p = rotP([v[0], v[1]], rot);
        return 0.5 + 0.5 * (p[0] * LV[0] + p[1] * LV[1] + v[2] * LV[2]);
    };
    const shadeOf = (C, t) => (t < 0.6 ? S.mix(C.base, C.deep, ((0.6 - t) / 0.6) * 0.85) : S.mix(C.base, C.light, ((t - 0.6) / 0.4) * 0.7));
    // a veil over a printed face: the light it takes, or the shade it is in
    const veil = (q, pts, t) => fillPts(q, pts, t < 0.62 ? `rgba(20,16,44,${((0.62 - t) * 1.05).toFixed(3)})` : `rgba(255,250,236,${((t - 0.62) * 0.4).toFixed(3)})`);
    const LABEL = { x: -75, y: -50, w: 150, h: 100 }, SIDE = { x: 0, y: 0, w: 150, h: 40 };
    const BOARD = { base: '#b9a47e', deep: '#4c3836', light: '#f0e0b8' };
    const BLUE = { base: '#2f4078', deep: '#10142e', light: '#7f93cc' };

    // The label: chromo printing in three flat inks on cream stock.
    function matchLabel(res, seed) {
        return memo(`label/${seed}@${res}`, () => {
            const box = LABEL, { c, q } = sheet(box, res), r = Motion.rng('label/' + seed);
            stock(q, box, { base: '#ecdcb0', seed: 'label' + seed, fox: 2, blot: 2 });
            const wear = (k) => {
                for (const [a, b] of [[[-72, -46], [72, -46]], [[72, -46], [72, 46]], [[72, 46], [-72, 46]], [[-72, 46], [-72, -46]]]) rub(k, a, b, 'lab' + seed + a, 1.5);
                for (let i = 0; i < 9; i++) {
                    const x = -66 + r() * 132, y = -42 + r() * 84, a = r() * 3, l = 12 + r() * 40;
                    dab(k, [[x, y], [x + (Math.cos(a) * l) / 2, y + (Math.sin(a) * l) / 2 + (r() - 0.5) * 4], [x + Math.cos(a) * l, y + Math.sin(a) * l]], { w: 2 + r() * 6, color: '#000', alpha: 0.25 + r() * 0.35, bristles: 8, seed: 'labscuff' + seed + i, dry: 0.7 });
                }
            };
            const MX = 0, MY = 4.5, MR = 20.5; // the medallion
            const banner = (k) => {
                k.beginPath();
                S.trace(k, [[-45, 20], [45, 20], [41, 26.4], [45, 32.8], [-45, 32.8], [-41, 26.4]]);
            };
            const cutBanner = (k) => cutting(k, (k2) => {
                banner(k2);
                k2.fill();
            });
            const ARC = { cx: 0, cy: 45, R: 66.5, font: FACE.titan, size: 17.8, track: 0.055 };
            // an olive sprig either side: where its leaves and fruit are
            const sprig = (m) => {
                const stem = S.curve([[m * 27, 19], [m * 36, 9], [m * 44, -3], [m * 49, -16]], false, 8), leaves = [], olives = [];
                [[0.14, 1, 0.9], [0.3, -1, 0.95], [0.46, 1, 1], [0.62, -1, 0.95], [0.78, 1, 0.85], [0.97, 0, 0.8]].forEach(([u, sd, sc]) => {
                    const i = Math.round(u * (stem.length - 1)), p = stem[i], p2 = stem[Math.min(stem.length - 1, i + 1)], p0 = stem[Math.max(0, i - 1)];
                    const a = Math.atan2(p2[1] - p0[1], p2[0] - p0[0]) + sd * m * 0.75;
                    leaves.push(S.xf(S.curve([[0, 0], [3, -1.7], [7, -1.4], [10.4, 0], [7, 1.3], [3, 1.6]], true, 5), { x: p[0], y: p[1], rot: a, sx: sc }));
                });
                for (const u of [0.22, 0.54]) {
                    const p = stem[Math.round(u * (stem.length - 1))];
                    olives.push([p[0] + m * 3.2, p[1] + 3]);
                }
                return { stem, leaves, olives };
            };
            const sprigs = [sprig(-1), sprig(1)];
            const starOuter = starPts(MX, MY, 14.6, 8, 0.54), band = () => [-66, -41, 132, 82];

            const yellow = inked(box, res, (k) => {
                k.lineWidth = 4.8;
                k.strokeRect(...band());
                k.beginPath();
                k.arc(MX, MY, MR, 0, TAU);
                k.fill();
                for (const sp of sprigs) for (const lf of sp.leaves) {
                    k.beginPath();
                    S.trace(k, lf);
                    k.fill();
                }
                for (const [sx, sy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
                    k.beginPath();
                    k.moveTo(sx * 61.4, sy * 36.4);
                    k.arc(sx * 61.4, sy * 36.4, 9.4, 0, TAU);
                    k.fill();
                }
                // (only what falls outside the field is kept of those discs: solid corners to
                // the band; then the field's own pieces are laid again inside it)
                cutting(k, (k2) => {
                    k2.fillRect(-61.4, -36.4, 122.8, 72.8);
                });
                k.beginPath();
                k.arc(MX, MY, MR, 0, TAU);
                k.fill();
                for (const sp of sprigs) for (const lf of sp.leaves) {
                    k.beginPath();
                    S.trace(k, lf);
                    k.fill();
                }
                cutBanner(k);
            }, { color: '#e2ae36', mottle: 0.9, wear, squash: 0.3 });

            const red = inked(box, res, (k) => {
                // beads on the band
                const [bx0, by0, bw, bh] = band();
                for (let x = bx0 + 6; x < bx0 + bw - 3; x += 8.25) for (const yy of [by0, by0 + bh]) lozenge(k, x, yy, 2.5, 1.5);
                for (let y = by0 + 6.5; y < by0 + bh - 3; y += 8.6) for (const xx of [bx0, bx0 + bw]) lozenge(k, xx, y, 1.5, 2.5);
                // the star: the half of every point that is turned from the light
                for (let i = 0; i < 16; i++) {
                    if (i % 2 === 0) continue;
                    k.beginPath();
                    S.trace(k, [[MX, MY], starOuter[i], starOuter[(i + 1) % 16]]);
                    k.fill();
                }
                // rays between the star and the ring
                for (let i = 0; i < 32; i++) {
                    const a = (i / 32) * TAU + TAU / 64, r0 = 12.4, r1 = 18;
                    k.beginPath();
                    S.trace(k, [pol(r0, a - 0.035, MX, MY), pol(r1, a - 0.012, MX, MY), pol(r1, a + 0.012, MX, MY), pol(r0, a + 0.035, MX, MY)]);
                    k.fill();
                }
                cutting(k, (k2) => {
                    k2.beginPath();
                    S.trace(k2, starOuter);
                    k2.fill();
                });
                for (let i = 0; i < 16; i++) {
                    if (i % 2 === 0) continue;
                    k.beginPath();
                    S.trace(k, [[MX, MY], starOuter[i], starOuter[(i + 1) % 16]]);
                    k.fill();
                }
                arcType(k, 'CERILLAS', ARC.cx, ARC.cy, ARC.R, -Math.PI / 2, ARC);
                for (const sp of sprigs) for (const o2 of sp.olives) {
                    k.beginPath();
                    k.ellipse(o2[0], o2[1], 1.9, 2.4, 0.3, 0, TAU);
                    k.fill();
                }
                for (const [sx, sy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
                    k.beginPath();
                    k.arc(sx * 57.6, sy * 32.6, 1.5, 0, TAU);
                    k.fill();
                }
                cutBanner(k);
                for (const m of [-1, 1]) lozenge(k, m * 36.4, 26.4, 1.6, 2.2);
            }, { color: '#bf382e', mottle: 0.9, wear });

            const blue = inked(box, res, (k) => {
                k.lineJoin = 'round';
                k.lineWidth = 0.9;
                k.strokeRect(-69.6, -44.6, 139.2, 89.2);
                k.lineWidth = 0.6;
                k.strokeRect(-62.2, -37.2, 124.4, 74.4);
                // quarter fans in the field's corners
                k.save();
                k.beginPath();
                k.rect(-62.2, -37.2, 124.4, 74.4);
                k.clip();
                for (const [sx, sy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
                    for (const rad of [4.6, 7, 9.4]) {
                        k.lineWidth = 0.42;
                        k.beginPath();
                        k.arc(sx * 62.2, sy * 37.2, rad, 0, TAU);
                        k.stroke();
                    }
                }
                k.restore();
                // the medallion: a ring of beads, the star's edges, a hub
                k.lineWidth = 1.3;
                k.beginPath();
                k.arc(MX, MY, MR, 0, TAU);
                k.stroke();
                k.lineWidth = 0.4;
                k.beginPath();
                k.arc(MX, MY, MR - 2.2, 0, TAU);
                k.stroke();
                for (let i = 0; i < 40; i++) {
                    const p = pol(MR - 1.1, (i / 40) * TAU, MX, MY);
                    k.beginPath();
                    k.arc(p[0], p[1], 0.42, 0, TAU);
                    k.fill();
                }
                k.lineWidth = 0.6;
                k.beginPath();
                S.trace(k, starOuter);
                k.stroke();
                k.lineWidth = 0.35;
                for (let i = 0; i < 16; i += 2) {
                    k.beginPath();
                    k.moveTo(MX, MY);
                    k.lineTo(starOuter[i][0], starOuter[i][1]);
                    k.stroke();
                }
                k.beginPath();
                k.arc(MX, MY, 1.9, 0, TAU);
                k.fill();
                // the name: its shade in blue, the face knocked out for the red
                arcType(k, 'CERILLAS', ARC.cx, ARC.cy, ARC.R, -Math.PI / 2, { ...ARC, dx: 1.1, dy: 1.05 });
                arcType(k, 'CERILLAS', ARC.cx, ARC.cy, ARC.R, -Math.PI / 2, { ...ARC, cut: true, stroke: 0.7 });
                // sprigs
                for (const sp of sprigs) {
                    k.lineWidth = 0.7;
                    k.beginPath();
                    S.trace(k, sp.stem, false);
                    k.stroke();
                    for (const lf of sp.leaves) {
                        k.lineWidth = 0.42;
                        k.beginPath();
                        S.trace(k, lf);
                        k.stroke();
                        k.lineWidth = 0.28;
                        k.beginPath();
                        k.moveTo(lf[0][0], lf[0][1]);
                        k.lineTo(lf[Math.floor(lf.length / 2)][0], lf[Math.floor(lf.length / 2)][1]);
                        k.stroke();
                    }
                    for (const o2 of sp.olives) {
                        k.lineWidth = 0.42;
                        k.beginPath();
                        k.ellipse(o2[0], o2[1], 1.9, 2.4, 0.3, 0, TAU);
                        k.stroke();
                    }
                }
                // the banner and what it says
                cutBanner(k);
                k.lineWidth = 0.6;
                banner(k);
                k.stroke();
                type(k, '50 fósforos', { font: FACE.shri, size: 11.4, x: 0, y: 30.2, track: 0.02 });
                type(k, 'FÁBRICA DE CERILLAS · GRANADA', { font: FACE.lora, size: 2.9, x: 0, y: 36.2, track: 0.16 });
            }, { color: '#222a54', mottle: 0.8, wear });
            print(q, box, yellow, 0.95, 0.75, -0.55); // out of register
            print(q, box, red, 0.95);
            print(q, box, blue, 0.97, -0.15, 0.2);
            // the price, in the shopkeeper's pencil
            q.save();
            q.translate(44, -31.5);
            q.rotate(-0.12);
            q.lineCap = q.lineJoin = 'round';
            for (const [ln, w] of [[[[0, 1.6], [1.8, 0], [1.8, 7.4]], 0.5], [[[8.2, 0.2], [4.8, 0.3], [4.4, 3.4], [6.4, 3], [8, 4.4], [7.6, 6.6], [5.8, 7.6], [4.2, 6.8]], 0.5], [[[10.4, 4.6], [9.6, 5.6], [10, 7.4], [11.2, 7.2]], 0.4], [[[12.4, 3.2], [12.6, 7], [13.6, 7.4]], 0.4], [[[11.6, 4.6], [13.6, 4.4]], 0.4], [[[-1, 9.4], [15, 8.6]], 0.35]]) {
                strokePts(q, S.curve(ln, false, 4), w, 'rgba(70,70,84,0.72)');
            }
            q.restore();
            return c;
        });
    }

    // The long side: blue paper round thin board, the striking strip painted on it.
    function matchSide(res, seed) {
        return memo(`mbside/${seed}@${res}`, () => {
            const box = SIDE, { c, q } = sheet(box, res), r = Motion.rng('mbside/' + seed);
            stock(q, box, { base: BLUE.base, seed: 'mbside' + seed, fox: 0, warm: '14,20,56', pale: '120,140,206', blot: 3, fibre: 0.7, grain: 0.5 });
            // the strip: red phosphorus and ground glass in glue, rolled on with a ragged edge
            const edge = (x0, x1, y, sg) => {
                const pts = [];
                for (let x = x0; x <= x1; x += 2) pts.push([x, y + sg * (0.5 * Motion.noise1('strip/' + seed + y, x * 0.2) + 0.25 * Motion.noise1('strip2/' + seed + y, x * 0.9))]);
                return pts;
            };
            const strip = [...edge(7, 143, 6.6, 1), ...edge(7, 143, 33.4, -1).reverse()];
            q.save();
            q.beginPath();
            S.trace(q, strip);
            q.clip();
            q.fillStyle = '#5c3530';
            q.fillRect(0, 0, 150, 40);
            for (let i = 0; i < 16; i++) blob(q, [r() * 150, 6 + r() * 28], 6 + r() * 14, r() < 0.5 ? '128,44,38' : '40,24,26', 0.3 + r() * 0.2);
            lay(q, 'grit', box, 0.24, 0.95);
            lay(q, 'grit', box, 0.55, 0.5, 'source-over', [3, 11]);
            for (let i = 0; i < 420; i++) disc(q, [7 + r() * 136, 7 + r() * 26], 0.1 + r() * 0.22, r() < 0.6 ? `rgba(236,214,196,${(0.3 + r() * 0.5).toFixed(2)})` : 'rgba(20,10,12,0.6)');
            // where matches were struck: pale drags, each starting with a dark bite
            for (let i = 0; i < 30; i++) {
                const x = 12 + r() * 110, y = 9 + r() * 22, a = (r() - 0.5) * 0.9 + (r() < 0.2 ? Math.PI : 0), l = 12 + r() * 38, wd = 0.9 + r() * 2.4;
                const path = [[x, y], [x + (Math.cos(a) * l) / 2, y + (Math.sin(a) * l) / 2 + (r() - 0.5) * 1.6], [x + Math.cos(a) * l, y + Math.sin(a) * l]];
                dab(q, path, { w: wd, color: r() < 0.7 ? '#f0dccb' : '#c79a86', alpha: 0.55 + r() * 0.4, bristles: 5, seed: 'strike' + seed + i, dry: 0.5 });
                S.ink(q, [path[0], lerpP(path[0], path[1], 0.5)], { w: wd * 0.5, color: '#1a0e10', alpha: 0.6, taper: [0, 1] });
            }
            // two burns where a head flared against it
            for (const [bx, by] of [[38 + r() * 20, 14 + r() * 10], [98 + r() * 24, 18 + r() * 10]]) {
                blob(q, [bx, by], 6.5, '98,52,30', 0.5);
                blob(q, [bx, by], 3.2, '16,10,12', 0.85);
                for (let j = 0; j < 9; j++) disc(q, [bx + (r() - 0.5) * 7, by + (r() - 0.5) * 5], 0.2 + r() * 0.4, 'rgba(14,8,10,0.7)');
            }
            q.restore();
            strokePts(q, strip, 0.4, 'rgba(18,14,36,0.6)', true);
            // the paper's seam near one end, a hair proud
            q.fillStyle = 'rgba(150,168,224,0.55)';
            q.fillRect(146.2, 0, 0.45, 40);
            q.fillStyle = 'rgba(8,10,34,0.55)';
            q.fillRect(146.7, 0, 0.5, 40);
            // rubbed along its edges to the pale of the paper, and to the board at the corners
            for (let i = 0; i < 26; i++) {
                const top = r() < 0.6, x = r() * 150, l = 4 + r() * 22, y = top ? 0.4 + r() * 1.4 : 39.6 - r() * 1.2;
                dab(q, [[x, y], [x + l / 2, y + (r() - 0.5) * 0.6], [x + l, y]], { w: 0.8 + r() * 1.6, color: r() < 0.6 ? '#9eb0e0' : '#c8b88e', alpha: 0.4 + r() * 0.4, bristles: 4, seed: 'siderub' + seed + i, dry: 0.5 });
            }
            for (const [cx, cy] of [[0, 0], [150, 0], [0, 40], [150, 40]]) {
                const pts = [];
                for (let i = 0; i < 9; i++) {
                    const a = (i / 9) * TAU, rad = 2.6 + r() * 3.4;
                    pts.push([cx + Math.cos(a) * rad * 1.5, cy + Math.sin(a) * rad]);
                }
                const wornPts = S.curve(pts, true, 4);
                strokePts(q, wornPts, 1.1, 'rgba(206,216,240,0.8)', true);
                fillPts(q, wornPts, '#b6a27c');
            }
            return c;
        });
    }

    // One match: a square stick of poplar and its dipped head, from tail to head in box
    // measures, painted through `B` (box → page). `lift`: how far its shadow is thrown.
    function match(g, B, tail, head, o = {}) {
        const th = 2.3, dx = head[0] - tail[0], dy = head[1] - tail[1], dz = head[2] - tail[2], L = Math.hypot(dx, dy, dz), u = [dx / L, dy / L, dz / L];
        // the stick's top face and the face towards us
        const along = (s2) => [tail[0] + u[0] * s2, tail[1] + u[1] * s2, tail[2] + u[2] * s2];
        const quad = (oy0, oz0, oy1, oz1) => {
            const a = along(0), b = along(L - 2.6);
            return [B(a[0], a[1] + oy0, a[2] + oz0), B(b[0], b[1] + oy0, b[2] + oz0), B(b[0], b[1] + oy1, b[2] + oz1), B(a[0], a[1] + oy1, a[2] + oz1)];
        };
        const top = quad(th / 2, th, -th / 2, th), front = quad(-th / 2, th, -th / 2, 0), whole = [top[0], top[1], front[2], front[3]];
        const cast = o.lift ? { blur: 1.2 + o.lift * 0.2, dx: SD[0] * (1 + o.lift), dy: SD[1] * (1 + o.lift), color: 'rgba(22,12,30,0.62)' } : null;
        const tT = o.tones[0], tF = o.tones[1];
        S.piece(g, whole, {
            fill: shadeOf({ base: '#dcc48c', deep: '#5e4634', light: '#fff0c4' }, tF), line: 0.7, heavy: 0.5, cast,
            detail: (q) => {
                fillPts(q, top, shadeOf({ base: '#e6d09a', deep: '#6a5038', light: '#fff4d0' }, tT));
                // the grain of the wood, and the saw's fuzz
                const A = top[0], Bp = top[1], C = top[3];
                for (let i = 0; i < 3; i++) {
                    const v = (i + 0.5) / 3;
                    strokePts(q, [lerpP(A, C, v), lerpP(Bp, top[2], v)], 0.22, 'rgba(120,90,50,0.45)');
                }
                strokePts(q, [front[3], front[2]], 0.3, 'rgba(60,40,30,0.5)');
            },
        });
        // the head: a drop of red paste, fatter than the stick
        const hc = along(L - 2.2), c = B(hc[0], hc[1], hc[2] + th / 2), e0 = B(hc[0] - 3.3 * u[0], hc[1] - 3.3 * u[1], hc[2] + th / 2 - 3.3 * u[2]), ax = [c[0] - e0[0], c[1] - e0[1]], al = Math.hypot(ax[0], ax[1]) || 1;
        const a0 = Math.atan2(ax[1], ax[0]), hl = Math.max(2.4, al), hwd = 1.95, headPts = [];
        for (let i = 0; i < 18; i++) {
            const a = (i / 18) * TAU, bulge = 1 + 0.16 * Math.cos(a);
            headPts.push([c[0] + Math.cos(a0) * Math.cos(a) * hl * bulge - Math.sin(a0) * Math.sin(a) * hwd, c[1] + Math.sin(a0) * Math.cos(a) * hl * bulge + Math.cos(a0) * Math.sin(a) * hwd]);
        }
        S.piece(g, headPts, {
            fill: o.burnt ? '#2c2226' : '#b8322c', line: 0.7, heavy: 0.5, cast: cast && { ...cast, blur: cast.blur + 0.4 },
            shade: { color: o.burnt ? '#0c0a10' : '#5a1020', alpha: 0.9, w: 1.6 }, light: { color: o.burnt ? '#7a6a6a' : '#f08a70', alpha: 0.85, w: 1.1 },
            detail: (q) => {
                if (o.chipped) fillPts(q, [[c[0] + ax[0] * 0.5 / al, c[1] + ax[1] * 0.5 / al], [c[0] + (ax[0] * 3) / al - (ax[1] * 2.4) / al, c[1] + (ax[1] * 3) / al + (ax[0] * 2.4) / al], [c[0] + (ax[0] * 3) / al, c[1] + (ax[1] * 3) / al]], '#e8d4a0');
            },
        });
        disc(g, [c[0] + TOL[0] * 0.7, c[1] + TOL[1] * 0.7], 0.42, 'rgba(255,226,214,0.9)');
    }

    function matchbox(g, o = {}) {
        const { x = 0, y = 0, s = 1, rot = 0, seed = 'lucero', ground = 0 } = o;
        g.save();
        g.translate(x, y);
        g.scale(s, s);
        const F = frame(0, 0, rot), B = (X, Y, Z) => F(mbP(X, Y, Z)), Q = (...p) => p.map((v) => B(v[0], v[1], v[2]));
        const label = matchLabel(resFor(g, LABEL), seed), side = matchSide(resFor(g, SIDE), seed), r = Motion.rng('matchbox/' + seed);
        const { L, W, H, wt, gap } = MB, T1 = MB.out + L, y0 = gap, y1 = W - gap, zb = gap, zt = H - gap;
        const tT = mbTone([0, 0, 1], rot), tF = mbTone([0, -1, 0], rot), tL = mbTone([-1, 0, 0], rot);
        // a flat print laid on a face of the box: (u, v) on the print → O + u U + v V on the page
        const lay2 = (q, canvas, box, O, U, V) => onFrame(q, F, (p) => {
            p.transform(U[0], U[1], V[0], V[1], O[0], O[1]);
            p.imageSmoothingQuality = 'high';
            p.drawImage(canvas, box.x, box.y, box.w, box.h);
        });
        const sleeveTop = Q([0, 0, H], [L, 0, H], [L, W, H], [0, W, H]), sleeveFront = Q([0, 0, 0], [L, 0, 0], [L, 0, H], [0, 0, H]), mouth = Q([0, 0, 0], [0, W, 0], [0, W, H], [0, 0, H]);
        const trayHull = Q([L - 1, y0, zb], [T1, y0, zb], [T1, y0, zt], [T1, y1, zt], [L - 1, y1, zt]);
        const all = (q) => {
            for (const p of [sleeveTop, sleeveFront, mouth, trayHull]) {
                q.beginPath();
                S.trace(q, p);
                q.fill();
            }
        };
        // its shadow on whatever lies under it
        if (ground) {
            for (const p of [Q([0, 0, 0], [L, 0, 0], [L, 0, H], [L, W, H], [0, W, H], [0, W, 0]), trayHull]) groundShadow(g, p, ground * 0.8, 0.9);
        }
        S.cast(g, (q) => {
            q.fillStyle = '#000';
            all(q);
        }, { blur: 9, dx: 5, dy: 7, color: 'rgba(16,10,34,0.55)' });

        // 1 · the tray, from its floor up
        const floor = Q([L - 8, y0 + wt, zb + wt], [T1 - wt, y0 + wt, zb + wt], [T1 - wt, y1 - wt, zb + wt], [L - 8, y1 - wt, zb + wt]);
        const farIn = Q([L - 8, y1 - wt, zb + wt], [T1 - wt, y1 - wt, zb + wt], [T1 - wt, y1 - wt, zt], [L - 8, y1 - wt, zt]);
        const endIn = Q([T1 - wt, y0 + wt, zb + wt], [T1 - wt, y1 - wt, zb + wt], [T1 - wt, y1 - wt, zt], [T1 - wt, y0 + wt, zt]);
        const grainOn = (q, pts, k = 0.45) => lay(q, 'grain', S.bbox(pts), 0.24, k);
        S.piece(g, floor, {
            fill: shadeOf(BOARD, tT - 0.24), line: 0,
            detail: (q) => {
                grainOn(q, floor, 0.7);
                // bare greyboard: fibres along its length, a stain or two
                for (let i = 0; i < 26; i++) {
                    const Y = y0 + 4 + r() * (W - 12), X = L - 6 + r() * 30, l = 4 + r() * 12;
                    strokePts(q, [B(X, Y, zb + wt), B(X + l, Y + (r() - 0.5) * 2, zb + wt)], 0.25, r() < 0.5 ? 'rgba(90,70,50,0.35)' : 'rgba(255,244,214,0.35)');
                }
                blob(q, B(L + 12, 40, zb + wt), 9, '120,90,60', 0.25);
                lay(q, 'grit', S.bbox(floor), 0.3, 0.2);
                // splinters off the sticks, each with its own hair of shadow
                for (let i = 0; i < 14; i++) {
                    const X = L + 4 + r() * 30, Y = y0 + 6 + r() * (W - 14), a = (r() - 0.5) * 1.2, l = 1.6 + r() * 3.4, p0 = B(X, Y, zb + wt), p1 = B(X + Math.cos(a) * l, Y + Math.sin(a) * l, zb + wt);
                    strokePts(q, [[p0[0] + SD[0] * 0.4, p0[1] + SD[1] * 0.4], [p1[0] + SD[0] * 0.4, p1[1] + SD[1] * 0.4]], 0.4, 'rgba(50,34,30,0.5)');
                    strokePts(q, [p0, p1], 0.34, 'rgba(244,228,180,0.9)');
                }
                // the paper strip that holds the tray's corners, lapped onto the floor
                const lap = [B(T1 - wt - 5.6, y0 + wt, zb + wt), B(T1 - wt, y0 + wt, zb + wt), B(T1 - wt, y1 - wt, zb + wt), B(T1 - wt - 5.6, y1 - wt, zb + wt)];
                fillPts(q, lap, 'rgba(226,214,186,0.34)');
                strokePts(q, [lap[0], lap[3]], 0.35, 'rgba(70,52,44,0.5)');
                // red dust shed by the heads
                for (let i = 0; i < 40; i++) disc(q, B(T1 - 6 - r() * r() * 26, y0 + 6 + r() * (W - 14), zb + wt), 0.15 + r() * 0.3, `rgba(170,50,40,${(0.3 + r() * 0.4).toFixed(2)})`);
            },
        });
        S.piece(g, farIn, {
            fill: shadeOf(BOARD, tF - 0.1), line: 0.7, heavy: 0.3,
            detail: (q) => {
                grainOn(q, farIn);
                // the board is two plies: a hair of a line along the wall, and the strip's lap at its end
                strokePts(q, [B(L - 8, y1 - wt, zb + wt + 6), B(T1 - wt, y1 - wt, zb + wt + 6.6)], 0.3, 'rgba(30,20,24,0.4)');
                fillPts(q, Q([T1 - wt - 5.6, y1 - wt, zb + wt], [T1 - wt, y1 - wt, zb + wt], [T1 - wt, y1 - wt, zt], [T1 - wt - 5.6, y1 - wt, zt]), 'rgba(226,214,186,0.2)');
                for (let i = 0; i < 16; i++) disc(q, B(L + r() * 34, y1 - wt, zb + wt + 2 + r() * (zt - zb - wt - 4)), 0.15 + r() * 0.3, `rgba(170,50,40,${(0.25 + r() * 0.35).toFixed(2)})`);
            },
        });
        S.piece(g, endIn, { fill: shadeOf(BOARD, tL), line: 0.6, heavy: 0.3, detail: (q) => grainOn(q, endIn) });
        // what the lid and the tray's own walls throw into it
        const opening = Q([L, y0 + wt, zb + wt], [T1 - wt, y0 + wt, zb + wt], [T1 - wt, y0 + wt, zt], [T1 - wt, y1 - wt, zt], [L - 8, y1 - wt, zt], [L - 8, y0 + wt, zb + wt]);
        const rimFar = Q([L - 1, y1 - wt, zt], [T1, y1 - wt, zt], [T1, y1, zt], [L - 1, y1, zt]), rimNear = Q([L - 1, y0, zt], [T1, y0, zt], [T1, y0 + wt, zt], [L - 1, y0 + wt, zt]), rimEnd = Q([T1 - wt, y0, zt], [T1, y0, zt], [T1, y1, zt], [T1 - wt, y1, zt]);
        g.save();
        g.beginPath();
        S.trace(g, opening);
        g.clip();
        S.cast(g, (q) => {
            q.fillStyle = '#000';
            for (const p of [sleeveTop, rimFar, rimNear, rimEnd]) {
                q.beginPath();
                S.trace(q, p);
                q.fill();
            }
        }, { blur: 4, dx: SD[0] * 13, dy: SD[1] * 13, color: 'rgba(22,10,32,0.8)' });
        // …and the dark where the tray runs in under the lid
        fadeBand(g, B(L, y0, zb + wt), B(L, y1, zb + wt), F.dir([1, 0]), 9, '18,10,28', 0.75);
        // the matches that lie in it, heads to the open end
        const tones = [tT, tF];
        const lying = [[30, 3, 0], [41, -2.4, 0], [77, 2, 0], [90, -1.4, 1]];
        lying.forEach(([Y, skew, chipped], i) => {
            const hx = T1 - wt - 1.6 - r() * 3.4;
            match(g, B, [hx - 132, Y - skew * 3, zb + wt], [hx, Y, zb + wt], { tones, lift: 0.6, chipped: !!chipped && i === 3 });
        });
        g.restore();

        // 2 · the tray's outer wall and the rims of its board
        const TRAY = { base: '#a89674', deep: '#3c2e30', light: '#e2d2aa' };
        const nearOut = Q([L - 1, y0, zb], [T1, y0, zb], [T1, y0, zt], [L - 1, y0, zt]);
        S.piece(g, nearOut, {
            fill: shadeOf(TRAY, tF - 0.08), line: 1.2, heavy: 0.8, shade: { color: '#2c2028', alpha: 0.7, w: 7 }, light: { color: '#fff0cc', alpha: 0.4, w: 2.4 },
            detail: (q) => {
                grainOn(q, nearOut, 0.7);
                // the thumb's wear where it is pushed, and the board's lamination at the corner
                blob(q, B(T1 - 12, y0, H / 2), 7, '236,220,180', 0.22);
                strokePts(q, [B(T1 - 1.2, y0, zb), B(T1 - 1.2, y0, zt)], 0.4, 'rgba(60,44,40,0.6)');
                for (let i = 0; i < 9; i++) {
                    const X = L + r() * 34, Z = zb + 3 + r() * (zt - zb - 6);
                    strokePts(q, [B(X, y0, Z), B(X + 3 + r() * 8, y0, Z + (r() - 0.5))], 0.25, 'rgba(70,52,44,0.4)');
                }
            },
        });
        const edgeFill = shadeOf({ base: '#d8c8a0', deep: '#5c4a40', light: '#fff4d6' }, tT);
        for (const rim of [rimFar, rimEnd, rimNear]) S.piece(g, rim, { fill: edgeFill, line: 0.6, heavy: 0.3 });
        // one match lies across the rim, its head out in the air
        match(g, B, [118, 56, zb + wt + 16], [T1 + 15.6, 44, zt + 6.2], { tones, lift: 3.2 });

        // 3 · the sleeve
        // its other mouth, on the left: dark, with the board's pale edge round it
        S.piece(g, mouth, {
            fill: '#17131f', line: 1, heavy: 0.5,
            detail: (q) => {
                const inner = Q([0, 1.2, 1.2], [0, W - 1.2, 1.2], [0, W - 1.2, H - 1.2], [0, 1.2, H - 1.2]);
                strokePts(q, mouth, 1.3, shadeOf({ base: '#c8b890', deep: '#5c4a40', light: '#fff4d6' }, tL), true);
                fillPts(q, inner, '#15111d');
                // the tray's end, far inside
                fadeBand(q, inner[0], inner[1], [inner[3][0] - inner[0][0], inner[3][1] - inner[0][1]].map((v) => v / (dist(inner[0], inner[3]) || 1)), 5, '150,130,100', 0.3);
            },
        });
        // the long side that faces us, with its striking strip
        S.piece(g, sleeveFront, {
            fill: shadeOf(BLUE, tF), line: 1.3, heavy: 0.9,
            detail: (q) => {
                lay2(q, side, SIDE, mbP(0, 0, H), [1, 0], [0, 0.5]);
                veil(q, sleeveFront, tF);
                S.spray(q, sleeveFront, { color: '#0e1030', alpha: 0.55, w: 7, push: 4.5 });
                S.spray(q, sleeveFront, { color: '#aebcf0', alpha: 0.4, w: 3.5, push: 2, dir: TOL });
            },
        });
        // the lid: blue paper, the label pasted on it
        S.piece(g, sleeveTop, {
            fill: shadeOf(BLUE, tT - 0.1), line: 1.3, heavy: 0.9,
            detail: (q) => {
                grainOn(q, sleeveTop, 0.6);
                for (let i = 0; i < 14; i++) blob(q, B(r() * L, r() * W, H), 5 + r() * 12, r() < 0.5 ? '130,150,214' : '14,18,52', 0.22);
                S.spray(q, sleeveTop, { color: '#0e1030', alpha: 0.5, w: 6, push: 3.5 });
                S.spray(q, sleeveTop, { color: '#b8c6f4', alpha: 0.5, w: 3.5, push: 2, dir: TOL });
            },
        });
        const lab = (u, v) => B(u + 75, 50 - v, H);
        const LO = memo('label-out/' + seed, () => outline(143.4, 93.4, 'label' + seed, { jitter: 0.3, corners: [{ r: 1 }, { torn: [8, 6], amp: 1 }, { r: 1.2 }, { torn: [5, 7], amp: 0.9 }], sides: [[{ at: 60, nick: 0.9 }], [], [{ at: 40, nick: 1.1 }], []] }));
        const labPts = LO.pts.map(([u, v]) => lab(u + 0.4, v - 0.2));
        S.piece(g, labPts, {
            fill: '#ecdcb0', line: 0.6, heavy: 0.3, cast: { blur: 0.8, dx: SD[0] * 0.5, dy: SD[1] * 0.6, color: 'rgba(10,10,40,0.5)' },
            detail: (q) => {
                lay2(q, label, LABEL, mbP(75, 50, H), [1, 0], [0.13, 0.86]);
                veil(q, labPts, tT);
                // torn back at two corners: the paper's white edge
                for (const tn of LO.torn) strokePts(q, tn.path.map(([u, v]) => lab(u + 0.4, v - 0.2)), 1.5, 'rgba(255,250,236,0.9)');
                // a dent in the lid: its far wall lit, its near wall in shade
                const d = lab(30, -12);
                blob(q, [d[0] + TOL[0] * 3, d[1] + TOL[1] * 3], 9, '40,26,50', 0.2);
                blob(q, [d[0] + SD[0] * 3, d[1] + SD[1] * 3], 9, '255,250,236', 0.26);
                S.spray(q, labPts, { color: '#7a5a3c', alpha: 0.4, w: 5, push: 0 });
                S.spray(q, labPts, { color: '#3c2a44', alpha: 0.32, w: 14, push: 9 });
                S.spray(q, labPts, { color: '#fffaea', alpha: 0.4, w: 9, push: 6, dir: TOL });
            },
        });
        // 4 · wear: every edge of the sleeve is rubbed to the board, its corners most
        const rubEdge = (a, b, sd, n, wd) => {
            const rr = Motion.rng('mbedge/' + seed + sd);
            for (let i = 0; i < n; i++) {
                const u0 = rr(), u1 = Math.min(1, u0 + 0.03 + rr() * 0.14);
                S.ink(g, [lerpP(a, b, u0), lerpP(a, b, (u0 + u1) / 2), lerpP(a, b, u1)], { w: wd * (0.4 + rr() * 1.2), color: rr() < 0.55 ? '#c3b28a' : '#8fa0d4', alpha: 0.4 + rr() * 0.4, taper: [0.8, 0.8] });
            }
        };
        // (inside the sleeve's own outline: wear takes paper away, it adds nothing)
        g.save();
        g.beginPath();
        S.trace(g, sleeveTop);
        S.trace(g, sleeveFront);
        g.clip();
        rubEdge(B(0, 0, H), B(L, 0, H), 'tf', 11, 1.5);
        rubEdge(B(0, W, H), B(L, W, H), 'tb', 6, 1.2);
        rubEdge(B(L, 0, H), B(L, W, H), 'tr', 6, 1.1);
        rubEdge(B(0, 0, H), B(0, W, H), 'tl', 6, 1.2);
        rubEdge(B(0, 0, 0), B(L, 0, 0), 'bf', 7, 1.2);
        rubEdge(B(L, 0, 0), B(L, 0, H), 'fr', 3, 1.1);
        for (const [X, Y, Z, k] of [[0, 0, H, 1.5], [L, 0, H, 1.3], [L, W, H, 1], [0, W, H, 1.2], [0, 0, 0, 1.2], [L, 0, 0, 1.2]]) {
            const c = B(X, Y, Z), rr = Motion.rng('mbcorner/' + seed + X + Y + Z), pts = [];
            for (let i = 0; i < 11; i++) pts.push(pol((1.2 + rr() * 3.4) * k, (i / 11) * TAU, c[0], c[1]));
            const wp = S.curve(pts, true, 3);
            strokePts(g, wp, 0.8, 'rgba(206,216,244,0.8)', true);
            fillPts(g, wp, shadeOf(BOARD, 0.62));
            // the board's layers, opened like a book where the corner was knocked
            for (let i = 0; i < 3; i++) strokePts(g, [pol(k * (0.6 + i * 0.7), 0.9 + rr(), c[0], c[1]), pol(k * (0.9 + i * 0.7), 2.6 + rr(), c[0], c[1])], 0.3, 'rgba(84,62,50,0.6)');
        }
        g.restore();
        g.restore();
    }

    return { poster, plaque, ticket, stamp, matchbox };
})();
