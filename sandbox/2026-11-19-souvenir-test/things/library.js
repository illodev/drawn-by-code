// The emblem's library, in the emblem manner (dark contour + airbrush): the poets, thinkers
// and painters who were born in Andalusia, passed through it or chose it, as the things they
// left on a shelf. Global: Library. Sizes at s = 1, the anchor in the middle of each:
//   Library.books(g, { x, y, s = 1, rot = 0, seed })     336 × 420: ten volumes lying flat, a
//       little askew, one fallen open face down on top, three standing against them
//   Library.palette(g, { x, y, s = 1, rot = 0, seed })   270 × 212: a painter's palette of the
//       1620s with its colours, three brushes and a knife through the thumb hole, a rag
//   Library.score(g, { x, y, s = 1, rot = 0, seed })     246 × 178: a curling sheet of music
// `rot` turns the object, never the light: every point is turned and then painted (flat
// lettering is set by a local transform of the context). Each drawer paints once on a sheet
// of its own (casts and holes must not land on the neighbours) cached by seed, angle and
// resolution, and pastes it. Fonts the scene must declare: 'IM Fell DW Pica SC', 'Lora',
// 'Anton', 'Shrikhand'.
//
// THE BOOKS · anatomy: boards and the leather, cloth or paper over them; the spine (round on
// a sewn book, flat on a paperback) with raised bands where the cords are; the text block
// set back from the boards by the squares; headbands at head and tail; the joint. Seen from
// the front and a little above: a lying book shows its spine, its upper cover and one end.
// The ten details: (1) raised bands, lit on one side, shading the leather on the other;
// (2) gilt tooling worn to short bright strokes with gaps, in its impression; (3) grain:
// pores of calf, pebble of morocco, the weave of cloth, veins and follicles of vellum, the
// fibres and foxing of paper; (4) the leaves as fine lines, a darker one between gatherings,
// edges stained red, sprinkled, marbled, gilt or deckled; (5) headbands in two silks;
// (6) a silk register, a pressed carnation and a paper slip between leaves; (7) a shelf
// label, a red lettering piece, the hand-inked title of a vellum binding with its laced
// thongs and ties; (8) corners worn to the board, scuffed headcaps, wormholes, reading
// creases, sun-faded spines; (9) a wine glass's ring, dog-ears, a chip of spine paper gone;
// (10) every book's shadow on the one below, and the wedge of dark under a leaning one.
//
// THE PALETTE · anatomy: a thin board of walnut, kidney-shaped, bevelled, with a thumb hole
// near the notch; colours set along the far edge from the thumb outwards, mixtures in the
// middle; brushes of hog bristle bound to the stick with waxed thread; a steel knife.
// The ten details: (1) each dab a lit mound with its peak and the furrows of the brush that
// pulled it; (2) gloss on the wet paint; (3) a skin of older, darker paint under each dab;
// (4) flesh and grey mixtures smeared with a loaded brush, ridged at the edge; (5) wood
// dark with oil, its grain, paler where the thumb rubs; (6) the bevel and the board's
// thickness, seen in the hole too; (7) thread bindings wound turn by turn, bristles one by
// one, paint on the tips and smudges on the sticks; (8) the knife's ground blade with a
// wipe of paint, its bolster and pinned handle; (9) a linen rag with wiped colours, its
// weave and frayed edge; (10) scrape marks, drips, a thumbprint, the owner's burnt mark.
//
// THE SCORE · anatomy: a sheet of laid paper ruled by hand with a rastrum (five nibs: the
// five lines of a stave waver together), systems of two staves joined by a brace, clefs,
// the time signature, bar lines, notes with stems, beams and flags, rests, slurs.
// The ten details: (1) the rastrum's shared wobble and its blobs where it started;
// (2) ink that thins along a stroke; (3) a triplet turn under its bracket; (4) chords in
// the left hand, an oom-pah-pah; (5) a hairpin, a dynamic, ties; (6) a bar scratched out;
// (7) the title in capitals, the name under it; (8) a blot with its satellites and the
// smear of a cuff; (9) a corner rolled forward, another dog-eared, a fold across the
// middle; (10) foxing, a stain, the laid lines of the paper.
const Library = (() => {
    const S = Souvenir;
    const INK = S.INK, SD = S.SHADE_DIR, TOL = [-SD[0], -SD[1]], TAU = Math.PI * 2;
    const mix = S.mix, rgba = S.rgba, clamp = S.clamp, smooth = S.smooth;
    const FELL = '"IM Fell DW Pica SC", Georgia, serif', LORA = 'Lora, Georgia, serif', ANTON = 'Anton, Impact, sans-serif', SHRIK = 'Shrikhand, Georgia, serif';
    const GOLD = { deep: '#8a5a17', base: '#d9a441', light: '#f6dc8a', glint: '#fff6cf' };
    const SILVER = { deep: '#5d6488', base: '#b9bfd6', light: '#eef0f8', glint: '#ffffff' };
    const PAPER = { deep: '#6b6283', base: '#d6c8a2', light: '#f5ecd2' };

    // ------------------------------------------------------------------ tools
    const cache = new Map();
    const memo = (key, fn) => {
        if (!cache.has(key)) {
            if (cache.size >= 24) cache.delete(cache.keys().next().value);
            cache.set(key, fn());
        }
        return cache.get(key);
    };
    // pixels per unit for a sheet pasted at scale s: the output's, rounded up to half steps
    const resOf = (g, s) => Math.min(8, Math.max(1, Math.ceil(S.pxScale(g) * s * 2 - 1e-6) / 2));
    const rot2 = (p, a) => {
        const c = Math.cos(a), s = Math.sin(a);
        return [p[0] * c - p[1] * s, p[0] * s + p[1] * c];
    };
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

    // Everything is painted once on a sheet of its own and pasted: a cast or a hole made
    // straight on the caller's layer would land on its neighbours. `half`: half the size of
    // the thing unturned; paint(q, rot, seed, res) works in the thing's units about its middle.
    function sheet(g, name, half, o, paint) {
        const { x = 0, y = 0, s = 1, rot = 0, seed = name } = o;
        const res = resOf(g, s), c = Math.abs(Math.cos(rot)), sn = Math.abs(Math.sin(rot));
        const hw = Math.ceil(half[0] * c + half[1] * sn) + 8, hh = Math.ceil(half[0] * sn + half[1] * c) + 8;
        const sp = memo(`${name}/${seed}/${rot.toFixed(3)}@${res}`, () => {
            const box = { x: -hw, y: -hh, w: hw * 2, h: hh * 2 }, cv = document.createElement('canvas');
            cv.width = Math.ceil(box.w * res);
            cv.height = Math.ceil(box.h * res);
            const q = cv.getContext('2d');
            q.setTransform(res, 0, 0, res, -box.x * res, -box.y * res);
            paint(q, rot, seed, res);
            return { canvas: cv, box };
        });
        S.put(g, sp, { x, y, s });
    }

    // A flat face on the page: the point (a, b) of its own rectangle is O + a·U + b·V. What
    // is drawn on the face (tooling, lines, pieces) goes through it point by point; lettering
    // is set with `on`, which gives the context the face's own axes.
    function plane(O, U, V) {
        const P = (a, b) => [O[0] + a * U[0] + b * V[0], O[1] + a * U[1] + b * V[1]];
        P.pts = (arr) => arr.map(([a, b]) => P(a, b));
        P.O = O;
        P.U = U;
        P.V = V;
        P.on = (g, fn) => {
            g.save();
            g.transform(U[0], U[1], V[0], V[1], O[0], O[1]);
            fn(g);
            g.restore();
        };
        // the same face from another corner, turned by r and scaled by k
        P.sub = (a, b, r = 0, k = 1) => {
            const c = Math.cos(r) * k, s = Math.sin(r) * k;
            return plane(P(a, b), [U[0] * c + V[0] * s, U[1] * c + V[1] * s], [-U[0] * s + V[0] * c, -U[1] * s + V[1] * c]);
        };
        return P;
    }
    // The outline of the rectangle a0..a1 × b0..b1 of a face, cut by hand: corners eased by
    // r, the edges a touch out of true; bump(a, b, edge) pushes an edge out (a raised band).
    function rect(P, a0, b0, a1, b1, { r = 1, wob = 0.3, seed = 1, step = 5, bump = null } = {}) {
        const out = [], sd = S.seedOf(seed);
        r = Math.min(r, Math.abs(a1 - a0) / 2.2, Math.abs(b1 - b0) / 2.2);
        const corner = (cx, cy, t0) => {
            for (let k = 0; k <= 3; k++) out.push([cx + Math.cos(t0 + (k / 3) * Math.PI * 0.5) * r, cy + Math.sin(t0 + (k / 3) * Math.PI * 0.5) * r]);
        };
        const edge = (x0, y0, x1, y1, nx, ny, e) => {
            const len = Math.hypot(x1 - x0, y1 - y0), n = Math.max(1, Math.round(len / step));
            for (let k = 1; k < n; k++) {
                const u = k / n, x = x0 + (x1 - x0) * u, y = y0 + (y1 - y0) * u;
                const d = wob * S.noise2(u * len * 0.13, e * 7.3, sd) + (bump ? bump(x, y, e) : 0);
                out.push([x + nx * d, y + ny * d]);
            }
        };
        corner(a0 + r, b0 + r, Math.PI);
        edge(a0 + r, b0, a1 - r, b0, 0, -1, 0);
        corner(a1 - r, b0 + r, -Math.PI / 2);
        edge(a1, b0 + r, a1, b1 - r, 1, 0, 1);
        corner(a1 - r, b1 - r, 0);
        edge(a1 - r, b1, a0 + r, b1, 0, 1, 2);
        corner(a0 + r, b1 - r, Math.PI / 2);
        edge(a0, b1 - r, a0, b0 + r, -1, 0, 3);
        return out.map(([a, b]) => P(a, b));
    }
    // a material's colour for how lit it is (0..1)
    const shadeOf = (M) => (t) => (t < 0.6 ? mix(M.deep, M.base, clamp(t / 0.6)) : mix(M.base, M.light, clamp((t - 0.6) / 0.4)));
    // soft patches of colour over a face: the dye's drift, stains, soiling
    const blot = (q, P, L, T, seed, n, cols, a = 0.18, rad = [6, 18]) => {
        const r = Motion.rng('blot/' + seed);
        for (let i = 0; i < n; i++) {
            const p = P(r() * L, r() * T), R = rad[0] + r() * (rad[1] - rad[0]), col = cols[Math.floor(r() * cols.length)];
            const gr = q.createRadialGradient(p[0], p[1], 0, p[0], p[1], R);
            gr.addColorStop(0, rgba(col, a * (0.5 + r() * 0.5)));
            gr.addColorStop(1, rgba(col, 0));
            q.fillStyle = gr;
            q.fillRect(p[0] - R, p[1] - R, R * 2, R * 2);
        }
    };
    const specks = (q, P, L, T, n, seed, fn) => {
        const r = Motion.rng('sp/' + seed);
        for (let i = 0; i < n; i++) fn(P(r() * L, r() * T), r);
    };

    // ------------------------------------------------------------------ pen and stamps
    const capR = new Map();
    // the advances of a string at 1 px, and how tall the face's capitals are
    function measure(q, font, str) {
        q.save();
        q.font = `100px ${font}`;
        if (!capR.has(font)) capR.set(font, (q.measureText('H').actualBoundingBoxAscent || 70) / 100);
        const w = [...str].map((ch) => q.measureText(ch).width / 100);
        q.restore();
        return { w, cap: capR.get(font) };
    }
    // A pen on a face: lines, shapes and lettering in the face's own coordinates, in
    // whatever style the context has. text(): capitals `cap` units tall centred on (a, b),
    // condensed (down to minSx) and then shrunk to fit maxW; hand: a scribe's unevenness.
    function pen(q, P) {
        const h = {
            line(pts, w = 0.6) {
                q.beginPath();
                S.trace(q, P.pts(pts), false);
                q.lineWidth = w;
                q.lineCap = 'round';
                q.lineJoin = 'round';
                q.stroke();
            },
            poly(pts) {
                q.beginPath();
                S.trace(q, P.pts(pts));
                q.fill();
            },
            box(a0, b0, a1, b1, w = 0.6) {
                h.line([[a0, b0], [a1, b0], [a1, b1], [a0, b1], [a0, b0]], w);
            },
            circle(a, b, r, w = 0.6, n = 28) {
                const pts = [];
                for (let i = 0; i <= n; i++) pts.push([a + Math.cos((i / n) * TAU) * r, b + Math.sin((i / n) * TAU) * r]);
                h.line(pts, w);
            },
            dot(a, b, r) {
                h.poly(S.ellipse(a, b, r, r, 10));
            },
            text(str, { a = 0, b = 0, cap = 8, font = FELL, maxW = 1e9, track = 0.07, sx = 1, hand = 0, align = 0.5, minSx = 0.74, skew = 0 } = {}) {
                const m = measure(q, font, str), n = m.w.length;
                let size = cap / m.cap;
                const sum = m.w.reduce((s, v) => s + v, 0) + track * (n - 1);
                if (sum * size * sx > maxW) {
                    sx = maxW / (sum * size);
                    if (sx < minSx) {
                        size *= sx / minSx;
                        sx = minSx;
                    }
                }
                const W = sum * size * sx, capH = size * m.cap, r = Motion.rng('hand/' + str);
                P.on(q, (qq) => {
                    qq.translate(a - W * align, b + capH / 2);
                    qq.transform(sx, 0, -skew * sx, 1, 0, 0);
                    qq.font = `${size.toFixed(3)}px ${font}`;
                    qq.textBaseline = 'alphabetic';
                    let x = 0;
                    [...str].forEach((ch, i) => {
                        const adv = m.w[i] * size;
                        if (hand) {
                            qq.save();
                            qq.translate(x + adv / 2, (r() - 0.5) * capH * 0.1 * hand);
                            qq.rotate((r() - 0.5) * 0.13 * hand);
                            qq.scale(1 + (r() - 0.5) * 0.1 * hand, 1 + (r() - 0.5) * 0.14 * hand);
                            qq.fillText(ch, -adv / 2, 0);
                            qq.restore();
                        } else qq.fillText(ch, x, 0);
                        x += adv + track * size;
                    });
                });
                return { w: W, cap: capH, a0: a - W * align, a1: a + W * (1 - align) };
            },
        };
        return h;
    }
    // Whatever `paint(pen, q)` draws on the face P inside box [a0, b0, a1, b1] (only its
    // coverage counts), laid on g as gold or silver leaf in its impression, as a blind
    // impression, or as ink, and then worn: flecks, scratches and rubbed patches taken out.
    function stamp(g, P, box, o, paint) {
        const { mode = 'gilt', wear = 0.22, seed = 1, color = INK, alpha = 1 } = o;
        const corners = P.pts([[box[0], box[1]], [box[2], box[1]], [box[2], box[3]], [box[0], box[3]]]);
        const m = g.getTransform(), k = Math.hypot(m.a, m.b);
        let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
        for (const [x, y] of corners) {
            const X = m.a * x + m.c * y + m.e, Y = m.b * x + m.d * y + m.f;
            x0 = Math.min(x0, X);
            y0 = Math.min(y0, Y);
            x1 = Math.max(x1, X);
            y1 = Math.max(y1, Y);
        }
        x0 = Math.floor(x0) - 4;
        y0 = Math.floor(y0) - 4;
        const w = Math.ceil(x1) + 4 - x0, hgt = Math.ceil(y1) + 4 - y0;
        if (w < 2 || hgt < 2 || w * hgt > 3e7) return;
        const cv = document.createElement('canvas');
        cv.width = w;
        cv.height = hgt;
        const q = cv.getContext('2d');
        q.setTransform(m.a, m.b, m.c, m.d, m.e - x0, m.f - y0);
        q.fillStyle = q.strokeStyle = '#000';
        paint(pen(q, P), q);
        const bb = S.bbox(corners, 2), r = Motion.rng('stamp/' + seed), area = bb.w * bb.h;
        const ul = Math.hypot(P.U[0], P.U[1]) || 1, ux = P.U[0] / ul, uy = P.U[1] / ul;
        const leaf = mode === 'gilt' || mode === 'silver';
        q.lineCap = 'round';
        q.globalCompositeOperation = 'source-in';
        q.fillStyle = leaf ? (mode === 'gilt' ? GOLD : SILVER).base : color;
        q.fillRect(bb.x, bb.y, bb.w, bb.h);
        if (leaf) {
            // leaf catches the light in short strokes: bright ones, dull ones
            const G = mode === 'gilt' ? GOLD : SILVER, n = Math.min(9000, Math.round(area * 0.5));
            q.globalCompositeOperation = 'source-atop';
            for (let i = 0; i < n; i++) {
                const x = bb.x + r() * bb.w, y = bb.y + r() * bb.h, len = 0.8 + r() * 3.4, v = r();
                q.strokeStyle = v < 0.4 ? G.light : v < 0.52 ? G.glint : v < 0.86 ? G.deep : mix(G.deep, INK, 0.45);
                q.globalAlpha = 0.3 + r() * 0.55;
                q.lineWidth = 0.3 + r() * 0.8;
                q.beginPath();
                q.moveTo(x, y);
                q.lineTo(x + ux * len + (r() - 0.5) * 0.5, y + uy * len + (r() - 0.5) * 0.5);
                q.stroke();
            }
            q.globalAlpha = 1;
        }
        if (wear > 0) {
            q.globalCompositeOperation = 'destination-out';
            q.fillStyle = q.strokeStyle = '#000';
            const nf = Math.min(14000, Math.round(area * 0.32 * wear));
            for (let i = 0; i < nf; i++) {
                const rr = 0.14 + 0.9 * Math.pow(r(), 2.4);
                q.globalAlpha = 0.5 + r() * 0.5;
                q.beginPath();
                q.ellipse(bb.x + r() * bb.w, bb.y + r() * bb.h, rr, rr * (0.4 + r() * 0.6), r() * 3.14, 0, TAU);
                q.fill();
            }
            const ns = Math.round(Math.sqrt(area) * wear);
            for (let i = 0; i < ns; i++) {
                const x = bb.x + r() * bb.w, y = bb.y + r() * bb.h, t = r() * 3.14, len = 2 + r() * 9;
                q.globalAlpha = 0.65;
                q.lineWidth = 0.18 + r() * 0.3;
                q.beginPath();
                q.moveTo(x, y);
                q.lineTo(x + Math.cos(t) * len, y + Math.sin(t) * len);
                q.stroke();
            }
            const nr = Math.round((area / 700) * wear * 5);
            for (let i = 0; i < nr; i++) {
                const x = bb.x + r() * bb.w, y = bb.y + r() * bb.h, R = 2.5 + r() * 7, gr = q.createRadialGradient(x, y, 0, x, y, R);
                gr.addColorStop(0, `rgba(0,0,0,${Math.min(0.9, 0.2 + wear * 1.2)})`);
                gr.addColorStop(1, 'rgba(0,0,0,0)');
                q.globalAlpha = 1;
                q.fillStyle = gr;
                q.fillRect(x - R, y - R, R * 2, R * 2);
            }
            q.globalAlpha = 1;
        }
        g.save();
        g.setTransform(1, 0, 0, 1, 0, 0);
        g.globalAlpha *= alpha;
        g.shadowBlur = 0;
        if (leaf) {
            // sunk in its impression: the wall towards the light is dark, the far one catches it
            g.shadowColor = 'rgba(255,238,196,0.3)';
            g.shadowOffsetX = SD[0] * 0.38 * k;
            g.shadowOffsetY = SD[1] * 0.38 * k;
            g.drawImage(cv, x0, y0);
            g.shadowColor = 'rgba(22,8,16,0.8)';
            g.shadowOffsetX = TOL[0] * 0.36 * k;
            g.shadowOffsetY = TOL[1] * 0.36 * k;
        } else if (mode === 'blind') {
            g.shadowColor = rgba(o.lit ?? '#ffe6c0', o.litAlpha ?? 0.32);
            g.shadowOffsetX = SD[0] * 0.5 * k;
            g.shadowOffsetY = SD[1] * 0.5 * k;
        }
        g.drawImage(cv, x0, y0);
        g.restore();
    }
    // on a spine (c: its context): gold, a blind impression, printer's or writer's ink
    const tag = (c) => c.seed + '/' + (c.n = (c.n ?? 0) + 1);
    const gilt = (c, wear, paint, P = c.P, box = [0, 0, c.L, c.T]) => stamp(c.q, P, box, { mode: 'gilt', wear, seed: tag(c) }, paint);
    const blind = (c, paint, a = 0.62, P = c.P, box = [0, 0, c.L, c.T]) => stamp(c.q, P, box, { mode: 'blind', color: rgba(mix(c.M.deep, INK, 0.45), a), wear: 0.08, seed: tag(c) }, paint);
    const print = (c, color, wear, paint, P = c.P, box = [0, 0, c.L, c.T]) => stamp(c.q, P, box, { mode: 'ink', color, wear, seed: tag(c) }, paint);

    // ------------------------------------------------------------------ what things are made of
    const GRAIN = {
        // calf: a smooth skin with fine pores; `sprinkle`: the acid specks of a 17th-century binder
        calf: (M, sprinkle = 0) => (q, P, L, T, seed, d = 1) => {
            blot(q, P, L, T, seed, Math.ceil(((L * T) / 420) * d) + 3, [M.deep, M.light, M.deep], 0.22);
            specks(q, P, L, T, L * T * 0.22 * d, seed + 'p', (p, r) => disc(q, p, 0.14 + r() * 0.26, rgba(r() < 0.72 ? M.deep : M.light, 0.16 + r() * 0.22)));
            if (sprinkle) {
                specks(q, P, L, T, L * T * 0.1 * sprinkle * d, seed + 's', (p, r) => {
                    q.fillStyle = rgba(mix(M.deep, '#1a0c08', 0.5), 0.3 + r() * 0.4);
                    q.beginPath();
                    q.ellipse(p[0], p[1], 0.3 + r() * r() * 1.3, 0.25 + r() * 0.5, r() * 3.14, 0, TAU);
                    q.fill();
                });
            }
        },
        // morocco: goatskin, a pebble of little cells, each with a light on it
        morocco: (M) => (q, P, L, T, seed, d = 1) => {
            blot(q, P, L, T, seed, Math.ceil(((L * T) / 600) * d) + 2, [M.deep, M.light], 0.16);
            specks(q, P, L, T, L * T * 0.26 * d, seed + 'm', (p, r) => {
                const rr = 0.45 + r() * 0.55, a0 = r() * TAU;
                q.strokeStyle = rgba(M.deep, 0.28 + r() * 0.3);
                q.lineWidth = 0.28;
                q.beginPath();
                q.arc(p[0], p[1], rr, a0, a0 + 2 + r() * 2.4);
                q.stroke();
                disc(q, [p[0] + TOL[0] * rr * 0.35, p[1] + TOL[1] * rr * 0.35], 0.13 + r() * 0.13, rgba(M.light, 0.3 + r() * 0.35));
            });
        },
        // bookcloth: the weave, thread by thread, and a slub here and there
        cloth: (M, pitch = 1.1) => (q, P, L, T, seed, d = 1) => {
            const r = Motion.rng('cl/' + seed);
            blot(q, P, L, T, seed, Math.ceil(((L * T) / 700) * d) + 2, [M.deep, M.light], 0.14);
            for (let a = pitch * 0.5; a < L; a += pitch) strokePts(q, [P(a + (r() - 0.5) * 0.2, -1), P(a + (r() - 0.5) * 0.2, T + 1)], 0.26, rgba(M.deep, 0.16 + r() * 0.22));
            for (let b = pitch * 0.5; b < T; b += pitch) strokePts(q, [P(-1, b), P(L + 1, b + (r() - 0.5) * 0.3)], 0.24, rgba(M.light, 0.1 + r() * 0.2));
            for (let i = 0; i < ((L * T) / 90) * d; i++) {
                const a = r() * L, b = r() * T, l = 1 + r() * 3;
                strokePts(q, r() < 0.5 ? [P(a, b), P(a + l, b)] : [P(a, b), P(a, b + l)], 0.4, rgba(r() < 0.5 ? M.light : M.deep, 0.3));
            }
        },
        // vellum: veins under the skin, follicles in drifts, the yellowing
        vellum: (M) => (q, P, L, T, seed, d = 1) => {
            const r = Motion.rng('ve/' + seed);
            blot(q, P, L, T, seed, Math.ceil(((L * T) / 260) * d) + 4, ['#b08a4c', '#fffaf0', '#9c8456', '#c9a86a'], 0.22, [5, 16]);
            for (let i = 0; i < 5 * d; i++) {
                const pts = [];
                let x = r() * L, y = r() * T;
                for (let k = 0; k < 7; k++) {
                    pts.push(P(x, y));
                    x += 3 + r() * 5;
                    y += (r() - 0.5) * 4;
                }
                S.ink(q, S.curve(pts, false, 4), { w: 0.4, color: '#8f7a52', alpha: 0.25 });
            }
            specks(q, P, L, T, L * T * 0.12 * d, seed + 'f', (p, rr) => disc(q, p, 0.12 + rr() * 0.2, rgba('#7a6238', 0.14 + rr() * 0.2)));
        },
        // paper: fibres, and the brown spots of foxing
        paper: (M, fox = 1) => (q, P, L, T, seed, d = 1) => {
            blot(q, P, L, T, seed, Math.ceil(((L * T) / 300) * d) + 3, [M.deep, M.light, '#a8824a'], 0.14, [4, 12]);
            specks(q, P, L, T, L * T * 0.1 * d, seed + 'f', (p, r) => {
                const t = r() * 3.14, l = 0.4 + r() * 1.2;
                q.strokeStyle = rgba(r() < 0.5 ? M.deep : '#fffdf2', 0.2 + r() * 0.2);
                q.lineWidth = 0.2;
                q.beginPath();
                q.moveTo(p[0], p[1]);
                q.lineTo(p[0] + Math.cos(t) * l, p[1] + Math.sin(t) * l);
                q.stroke();
            });
            if (fox) {
                specks(q, P, L, T, L * T * 0.012 * fox * d, seed + 'x', (p, r) => {
                    const R = 0.4 + r() * r() * 1.6;
                    disc(q, p, R, rgba('#9a6a34', 0.12 + r() * 0.2));
                    disc(q, p, R * 0.4, rgba('#7a4a24', 0.3));
                });
            }
        },
    };
    const MAT = {
        calfDark: { deep: '#22110f', base: '#5c3520', light: '#b07c42' },
        calfTan: { deep: '#3a1f12', base: '#8e5c2c', light: '#d6a25c' },
        morocco: { deep: '#480e20', base: '#a3292e', light: '#e06e58' },
        vellum: { deep: '#857a92', base: '#dccfa8', light: '#f8f0d8' },
        plum: { deep: '#22102c', base: '#5c2d5a', light: '#9a5f92' },
        ochre: { deep: '#6a4212', base: '#c4932f', light: '#f0d070' },
        black: { deep: '#0b0a15', base: '#2b2937', light: '#6e728e' },
        green: { deep: '#06241f', base: '#1c5c45', light: '#52aa7c' },
        blue: { deep: '#0f183c', base: '#27468c', light: '#6790d2' },
        wrapper: { deep: '#5f5c70', base: '#bdb8a2', light: '#e6e2cf' },
        cream: { deep: '#7a708c', base: '#e2d6b4', light: '#fbf4de' },
        sea: { deep: '#55648a', base: '#b4c8cf', light: '#e4eef0' },
        salmon: { deep: '#7c5a66', base: '#dcc0a4', light: '#f6e4cc' },
        sage: { deep: '#5c6a70', base: '#c6ceac', light: '#eaf0d6' },
    };

    // ------------------------------------------------------------------ the pile's space
    // The pile is seen from the front and a little above: a unit of depth sits K units up
    // the page. x to the right, y up from the ground, z away from the viewer.
    const K = 0.34;
    const LGT = (() => {
        const v = [-0.5, -0.72, 0.48], l = Math.hypot(v[0], v[1], v[2]);
        return [v[0] / l, v[1] / l, v[2] / l];
    })();
    function world(rot, cx, cy) {
        const c = Math.cos(rot), s = Math.sin(rot);
        const pv = ([x, y, z]) => {
            const Y = -y - z * K;
            return [x * c - Y * s, x * s + Y * c];
        };
        return {
            rot, pv,
            pr: ([x, y, z]) => pv([x - cx, y - cy, z]),
            // how lit a face is whose outward normal is n: the page is turned, the light is not
            tone: ([x, y, z], amb = 0.3) => amb + (1 - amb) * Math.max(0, (x * c + y * s) * LGT[0] + (x * s - y * c) * LGT[1] - z * LGT[2]),
            facing: ([, y, z]) => -K * y + z < -1e-6,
        };
    }
    const neg = (v) => [-v[0], -v[1], -v[2]];
    // a book lying flat: its spine `L` long from the front left corner (x0), its upper cover
    // at height `top`, turned by `yaw` about the middle of its spine (positive: the left end shows)
    const flat = (x0, top, z, yaw, L) => {
        const th = (yaw * Math.PI) / 180, ua = [Math.cos(th), 0, Math.sin(th)];
        return { ua, ub: [0, -1, 0], uc: [-Math.sin(th), 0, Math.cos(th)], o: [x0 + L / 2 - (ua[0] * L) / 2, top, z - (ua[2] * L) / 2] };
    };
    // a book standing on its tail, leaning `lean` to the left about its lower left edge and
    // turned by `yaw` (positive: its right cover shows). Its spine reads upwards.
    const upright = (xb, z, lean, yaw) => {
        const al = (lean * Math.PI) / 180, ps = (yaw * Math.PI) / 180;
        const ln = ([x, y, zz]) => [x * Math.cos(al) - y * Math.sin(al), x * Math.sin(al) + y * Math.cos(al), zz];
        return { ua: ln([0, 1, 0]), ub: ln([Math.cos(ps), 0, -Math.sin(ps)]), uc: ln([Math.sin(ps), 0, Math.cos(ps)]), o: [xb, 0, z] };
    };
    function place(W, fr, spec) {
        const B = { ...spec, ...fr, W };
        B.at = (a, b, c) => W.pr([B.o[0] + B.ua[0] * a + B.ub[0] * b + B.uc[0] * c, B.o[1] + B.ua[1] * a + B.ub[1] * b + B.uc[1] * c, B.o[2] + B.ua[2] * a + B.ub[2] * b + B.uc[2] * c]);
        const pl = (a, b, c, u, v) => plane(B.at(a, b, c), W.pv(u), W.pv(v));
        B.spineP = pl(0, 0, 0, B.ua, B.ub);
        B.cover0 = pl(0, 0, 0, B.ua, B.uc);
        B.coverT = pl(0, B.T, 0, B.ua, B.uc);
        B.end0 = pl(0, 0, 0, B.uc, B.ub);
        B.endL = pl(B.L, 0, 0, B.uc, B.ub);
        return B;
    }
    function paintBook(g, B) {
        const W = B.W;
        // far to near: the cover that shows, the end that shows, the spine
        if (W.facing(neg(B.ub))) coverFace(g, B.cover0, W.tone(neg(B.ub)), B, 0);
        if (W.facing(B.ub)) coverFace(g, B.coverT, W.tone(B.ub), B, 1);
        if (W.facing(neg(B.ua))) edgeFace(g, B.end0, W.tone(neg(B.ua)), B, 0);
        if (W.facing(B.ua)) edgeFace(g, B.endL, W.tone(B.ua), B, 1);
        // the spine turns from one board to the other, and its tone with it
        const fr = B.round ?? 0.95, tones = [];
        for (let k = 0; k <= 8; k++) {
            const ps = fr * (k / 4 - 1), cs = Math.cos(ps), sn = Math.sin(ps);
            tones.push(W.tone([-B.uc[0] * cs + B.ub[0] * sn, -B.uc[1] * cs + B.ub[1] * sn, -B.uc[2] * cs + B.ub[2] * sn]));
        }
        spineFace(g, B.spineP, tones, B);
        if (B.after) B.after(g, B);
    }

    // ------------------------------------------------------------------ a book's faces
    function spineFace(g, P, tones, B) {
        const { L, T, M } = B, col = shadeOf(M);
        const bump = B.bands ? (a, b, e) => (e === 0 || e === 2 ? B.bands.reduce((s, ab) => s + 0.9 * Math.exp(-Math.pow((a - ab) / 2.4, 2)), 0) : 0) : null;
        const pts = rect(P, 0, 0, L, T, { r: B.ease ?? 1.3, wob: B.wob ?? 0.3, seed: B.seed, bump, step: 3 });
        const p0 = P(0, 0), u = P.U, v = P.V, al = (v[0] * u[0] + v[1] * u[1]) / (u[0] * u[0] + u[1] * u[1]);
        const g1 = [p0[0] + (v[0] - al * u[0]) * T, p0[1] + (v[1] - al * u[1]) * T];
        S.piece(g, pts, {
            fill: { from: p0, to: g1, stops: tones.map((t, k) => [k / (tones.length - 1), col(t)]) },
            line: B.line ?? 1.9, heavy: 0.8, ink: B.ink, cast: { blur: 5, dx: 2.5, dy: 4, color: 'rgba(16,10,34,0.62)' },
            detail: (q) => {
                const c = { q, P, L, T, M, B, pts, seed: B.seed, hi: (T * tones.indexOf(Math.max(...tones))) / (tones.length - 1) };
                if (B.grain) B.grain(q, P, L, T, B.seed, 1);
                B.spinePaint(c);
                if (!B.paperback && T > 20) {
                    // the joints, where each board meets the back, and the caps turned in at head and tail
                    const j = Math.min(2.4, T * 0.07);
                    for (const [b, d] of [[j, 1], [T - j, -1]]) {
                        strokePts(q, [P(1, b), P(L - 1, b)], 0.5, rgba(mix(M.deep, INK, 0.4), 0.5));
                        strokePts(q, [P(1, b + d * 0.7), P(L - 1, b + d * 0.7)], 0.4, rgba(M.light, 0.3));
                    }
                    for (const [a, d] of [[0, 1], [L, -1]]) {
                        strokePts(q, [P(a + d * 2.3, 1), P(a + d * 2.3, T - 1)], 0.5, rgba(mix(M.deep, INK, 0.4), 0.55));
                        strokePts(q, [P(a + d * 1.2, 1.5), P(a + d * 1.2, T - 1.5)], 0.9, rgba(M.light, 0.22));
                    }
                }
                // the brush along the back: two or three dry strokes, lighter and darker
                const rb = Motion.rng(B.seed + 'hand');
                for (let i = 0; i < 4; i++) {
                    const b = T * (0.14 + 0.72 * rb()), a0 = L * rb() * 0.4, a1 = a0 + L * (0.3 + rb() * 0.3);
                    brushed(q, [P(a0, b), P((a0 + a1) / 2, b + (rb() - 0.5) * T * 0.06), P(a1, b + (rb() - 0.5) * T * 0.05)], { w: T * (0.1 + rb() * 0.12), color: i % 2 ? M.light : M.deep, alpha: 0.1 + rb() * 0.1, bristles: 7, seed: B.seed + 'hs' + i, dry: 0.55 });
                }
                // the end away from the light is duller
                const far = P.U[0] * TOL[0] + P.U[1] * TOL[1] > 0 ? 0 : L, lg = q.createLinearGradient(...P(far, T / 2), ...P(L - far, T / 2));
                lg.addColorStop(0, rgba(mix(M.deep, '#23204e', 0.5), 0.34));
                lg.addColorStop(0.45, rgba(M.deep, 0));
                lg.addColorStop(1, rgba('#ffe6b0', 0.07));
                fillPts(q, pts, lg);
                // the airbrush: shade from below and from the right (cooler in its depth), a warm light on the lit edge
                S.spray(q, pts, { color: '#2c2a6a', alpha: 0.22, w: Math.min(12, T * 0.42) });
                S.spray(q, pts, { color: '#ffdf9c', alpha: 0.2, w: Math.min(7, T * 0.26), dir: TOL });
                S.spray(q, pts, { color: M.deep, alpha: 0.62, w: Math.min(8, T * 0.3) });
                S.spray(q, pts, { color: mix(M.deep, INK, 0.6), alpha: 0.5, w: Math.min(3, T * 0.12) });
                S.spray(q, pts, { color: M.light, alpha: 0.5, w: Math.min(4, T * 0.16), dir: TOL });
            },
        });
    }
    // A raised band across the spine at `a`: lit on the side the light is, dark on the other,
    // and its shadow on the leather beside it. two: a pair of thin cords.
    function band(c, a, { w = 4.6, two = false } = {}) {
        const { q, P, T, M } = c, lit = P.U[0] * TOL[0] + P.U[1] * TOL[1] > 0 ? 1 : -1;
        const r = Motion.rng(c.seed + 'band' + a);
        const ridge = (a0, w0) => {
            const lA = a0 + (lit * w0) / 2, sA = a0 - (lit * w0) / 2, far = sA - lit * (2.6 + w0 * 0.6);
            const sh = q.createLinearGradient(...P(sA, T / 2), ...P(far, T / 2));
            sh.addColorStop(0, rgba(mix(M.deep, INK, 0.6), 0.82));
            sh.addColorStop(0.5, rgba(M.deep, 0.34));
            sh.addColorStop(1, rgba(M.deep, 0));
            fillPts(q, P.pts([[sA, -1], [far, -1], [far, T + 1], [sA, T + 1]]), sh);
            // the leather drawn tight over the cord: a little light before it on the lit side
            const pre = q.createLinearGradient(...P(lA, T / 2), ...P(lA + lit * 2.2, T / 2));
            pre.addColorStop(0, rgba(M.deep, 0.4));
            pre.addColorStop(1, rgba(M.deep, 0));
            fillPts(q, P.pts([[lA, -1], [lA + lit * 2.2, -1], [lA + lit * 2.2, T + 1], [lA, T + 1]]), pre);
            const gr = q.createLinearGradient(...P(lA, T / 2), ...P(sA, T / 2));
            gr.addColorStop(0, rgba(M.light, 0.5));
            gr.addColorStop(0.22, rgba(mix(M.light, '#fff4d8', 0.35), 0.9));
            gr.addColorStop(0.5, rgba(M.base, 0.5));
            gr.addColorStop(0.72, rgba(M.deep, 0.5));
            gr.addColorStop(1, rgba(mix(M.deep, INK, 0.5), 0.85));
            fillPts(q, P.pts([[lA, -1], [sA, -1], [sA, T + 1], [lA, T + 1]]), gr);
            strokePts(q, [P(sA, -1), P(sA, T + 1)], 0.55, rgba(INK, 0.6));
            strokePts(q, [P(lA, -1), P(lA, T + 1)], 0.4, rgba(mix(M.deep, INK, 0.3), 0.6));
            // where the leather was rubbed on the cord's crown: short pale strokes
            for (let b = 1; b < T - 1; b += 1 + r() * 2.2) {
                const l = 0.8 + r() * 2.6, x = a0 + lit * w0 * (0.14 + r() * 0.16);
                strokePts(q, [P(x, b), P(x, Math.min(T - 1, b + l))], 0.5, rgba(mix(M.light, '#fff4d8', 0.5), 0.35 + r() * 0.5));
            }
        };
        if (two) {
            ridge(a - 2.1, 2.9);
            ridge(a + 2.1, 2.9);
        } else ridge(a, w);
    }
    // a dry-brush stroke through a few points (Souvenir.dab wants a closely sampled line)
    const brushed = (g, pts, o) => S.dab(g, pts.length > 2 ? S.curve(pts, false, 10) : Array.from({ length: 13 }, (_, i) => [pts[0][0] + ((pts[1][0] - pts[0][0]) * i) / 12, pts[0][1] + ((pts[1][1] - pts[0][1]) * i) / 12]), o);
    // the sheen along a leather spine, where it turns to the light: a dry stroke
    const gloss = (c, alpha = 0.3, a0 = 3, a1 = c.L - 3) => {
        const b = clamp(c.hi, c.T * 0.16, c.T * 0.84), n = 6, pts = [];
        for (let i = 0; i <= n; i++) pts.push(c.P(a0 + ((a1 - a0) * i) / n, b + 0.4 * Math.sin(i * 1.7)));
        brushed(c.q, pts, { w: c.T * 0.11, color: c.M.light, alpha, bristles: 5, seed: c.seed + 'gl', dry: 0.6 });
    };
    // leather rubbed pale along an edge of the spine
    const scuff = (c, b, n = 5, col = null) => {
        const r = Motion.rng(c.seed + 'scuff' + b);
        for (let i = 0; i < n; i++) {
            const a = r() * c.L, l = 4 + r() * 12;
            brushed(c.q, [c.P(a, b + (r() - 0.5)), c.P(a + l / 2, b + (r() - 0.5)), c.P(a + l, b + (r() - 0.5))], { w: 1 + r() * 1.6, color: col ?? mix(c.M.light, '#d8c0a0', 0.4), alpha: 0.3 + r() * 0.3, bristles: 4, seed: c.seed + 'sc' + i + b, dry: 0.7 });
        }
    };

    // The end of a book: the boards' edges, the leaves between them set back by the squares
    // (fine lines, a darker one where two gatherings meet), the headband at the back.
    function edgeFace(g, P, tone, B) {
        const { D, T, M } = B, E = B.pages ?? {}, tb = B.board ?? 2.6, sq = B.square ?? 2.2, CM = B.coverM ?? M, col = shadeOf(CM), sd = B.seed + '/edge';
        const r = Motion.rng(sd), cs = E.back ?? 6.5;
        const all = rect(P, -0.3, 0, D, T, { r: 0.7, wob: 0.22, seed: sd });
        S.piece(g, all, {
            fill: mix(CM.deep, INK, 0.6), line: B.line ?? 1.7, heavy: 0.7, ink: B.ink, cast: { blur: 4, dx: 2, dy: 3, color: 'rgba(16,10,34,0.5)' },
            detail: (q) => {
                const paper = shadeOf(E.paper ?? PAPER), b0 = tb + 0.3, b1 = T - tb - 0.3, c1 = D - sq;
                const block = P.pts([[cs, b0], [c1, b0], [c1, b1], [cs, b1]]);
                // the back of the book: the leather over the hollow
                fillPts(q, P.pts([[-0.3, b0], [cs, b0], [cs, b1], [-0.3, b1]]), col(tone * 0.7));
                fillPts(q, block, paper(tone));
                q.save();
                q.beginPath();
                S.trace(q, block);
                q.clip();
                const Pb = P.sub(cs, b0), bw = c1 - cs, bh = b1 - b0;
                if (E.kind === 'red') fillPts(q, block, rgba('#9a3a2c', 0.62));
                else if (E.kind === 'gilt') {
                    const gr = q.createLinearGradient(...P(cs, b0), ...P(c1, b1));
                    for (const [u, cc] of [[0, GOLD.light], [0.3, GOLD.base], [0.55, GOLD.glint], [0.75, GOLD.base], [1, GOLD.deep]]) gr.addColorStop(u, cc);
                    fillPts(q, block, gr);
                } else if (E.kind === 'sprinkle') specks(q, Pb, bw, bh, bw * bh * 0.75, sd + 'spr', (p, rr) => disc(q, p, 0.1 + rr() * rr() * 0.42, rgba(rr() < 0.8 ? '#a8322c' : '#5a1a2a', 0.4 + rr() * 0.5)));
                else if (E.kind === 'marble') {
                    // combed marbling: stripes of colour drawn into scallops by the comb, flecked with white
                    const cols = ['#a13a34', '#2f4f7f', '#c79a3a', '#f3ead0', '#3d6a4f', '#7a2a4a'];
                    fillPts(q, block, '#d9c9a4');
                    for (let k = 0; k < bw / 1.15 + 8; k++) {
                        const c0 = -5 + k * 1.15, ln = [];
                        for (let b = -1; b <= bh + 1; b += 0.7) ln.push(Pb(c0 + 1.9 * Math.abs(Math.sin(b * 0.8 + k * 0.17)) + 0.6 * Math.sin(b * 0.27 + k), b));
                        strokePts(q, ln, 0.85, rgba(cols[(k * 5 + Math.floor(k / 3)) % cols.length], 0.88));
                    }
                    specks(q, Pb, bw, bh, bw * bh * 0.2, sd + 'mb', (p, rr) => disc(q, p, 0.12 + rr() * 0.22, rgba('#fbf4dc', 0.7)));
                } else blot(q, Pb, bw, bh, sd + 'st', 4, ['#8a6234', '#fffaf0', '#6e5a48'], 0.3, [3, 9]);
                const n = Math.max(3, Math.round(bh / (E.pitch ?? 0.85))), faint = E.kind === 'marble' || E.kind === 'gilt' ? 0.5 : 1;
                for (let i = 0; i <= n; i++) {
                    const b = b0 + (bh * i) / n + (r() - 0.5) * 0.22, gath = i % 7 === 3;
                    const e0 = cs + r() * 1.2, e1 = c1 - (E.kind === 'deckle' ? r() * r() * 10 : r() * 0.7);
                    strokePts(q, [P(e0, b), P((e0 + e1) / 2, b + (r() - 0.5) * (E.wave ?? 0.3)), P(e1, b)], gath ? 0.42 : 0.27, rgba(gath ? '#35262e' : i % 2 ? '#65524a' : '#fffaf0', (gath ? 0.7 : 0.3 + r() * 0.42) * faint));
                }
                if (E.kind === 'gilt') for (let i = 0; i < bw * 0.5; i++) {
                    const cc = cs + r() * bw, b = b0 + r() * bh;
                    strokePts(q, [P(cc, b), P(cc + 2 + r() * 5, b)], 0.3, rgba(r() < 0.6 ? GOLD.glint : GOLD.deep, 0.5));
                }
                // the board on the light's side shades the leaves; the far side is in the dark of the square
                S.spray(q, block, { color: '#2a2040', alpha: 0.5, w: 2.4, dir: TOL });
                S.spray(q, block, { color: '#2a2040', alpha: 0.35, w: 3 });
                if (tone < 0.5) fillPts(q, block, rgba('#1c1838', (0.5 - tone) * 1.3));
                q.restore();
                if (E.band) {
                    // the headband: silk worked over a core in two colours, turn and turn about
                    const hw = E.bandW ?? 3.4, hb = P.pts([[cs - hw, b0 - 0.2], [cs + 0.3, b0 - 0.2], [cs + 0.3, b1 + 0.2], [cs - hw, b1 + 0.2]]);
                    fillPts(q, hb, E.band[0]);
                    for (let b = b0; b < b1 - 0.4; b += 1.5) fillPts(q, P.pts([[cs - hw, b], [cs + 0.3, b + 0.3], [cs + 0.3, Math.min(b1, b + 1.05)], [cs - hw, Math.min(b1, b + 0.75)]]), E.band[1]);
                    strokePts(q, [P(cs - hw * 0.72, b0), P(cs - hw * 0.72, b1)], hw * 0.18, 'rgba(255,255,255,0.4)');
                    strokePts(q, [P(cs - 0.2, b0), P(cs - 0.2, b1)], hw * 0.24, 'rgba(20,10,30,0.42)');
                    strokePts(q, hb, 0.4, rgba(INK, 0.85), true);
                    if (tone < 0.5) fillPts(q, hb, rgba('#1c1838', (0.5 - tone) * 1.2));
                }
                if (tb >= 1.2) {
                    for (const [ba, bb] of [[0, tb], [T - tb, T]]) {
                        const bp = rect(P, -0.3, ba, D, bb, { r: 0.4, wob: 0.12, seed: sd + ba });
                        S.piece(q, bp, { fill: col(tone * 0.94), line: 0.8, heavy: 0.4, ink: B.ink, light: { color: CM.light, alpha: 0.5, w: 1.1 }, shade: { color: CM.deep, alpha: 0.6, w: 1.5 } });
                    }
                } else {
                    // a limp cover: just its thickness
                    for (const b of [tb / 2, T - tb / 2]) strokePts(q, [P(-0.3, b), P(D, b)], Math.max(0.5, tb), col(tone * 0.9));
                }
                if (B.endPaint) B.endPaint(q, P, tone);
            },
        });
    }

    // The cover that shows: of a lying book its upper board, of a turned standing one its side.
    function coverFace(g, P, tone, B, side) {
        const { L, D } = B, M = B.coverM ?? B.M, col = shadeOf(M), sd = B.seed + '/cover' + side;
        const pts = rect(P, 0, 0, L, D, { r: B.paperback ? 0.7 : 1.8, wob: 0.3, seed: sd });
        S.piece(g, pts, {
            fill: col(tone), line: B.line ?? 1.7, heavy: 0.7, ink: B.ink, cast: { blur: 5, dx: 2.5, dy: 3.5, color: 'rgba(16,10,34,0.55)' },
            detail: (q) => {
                const c = { q, P, L, T: D, M, B, pts, seed: sd, side };
                if (B.coverGrain ?? B.grain) (B.coverGrain ?? B.grain)(q, P, L, D, sd, 0.6);
                if (B.coverPaint) B.coverPaint(c);
                S.spray(q, pts, { color: M.deep, alpha: 0.55, w: 7 });
                S.spray(q, pts, { color: M.light, alpha: 0.45, w: 4, dir: TOL });
            },
        });
    }

    // ------------------------------------------------------------------ ornaments (for a pen)
    const lens = (a, b, t, r0, r1, w) => {
        const c = Math.cos(t), s = Math.sin(t), m = (r0 + r1) / 2;
        return [[a + c * r0, b + s * r0], [a + c * m - s * w, b + s * m + c * w], [a + c * r1, b + s * r1], [a + c * m + s * w, b + s * m - c * w]];
    };
    // a binder's flower tool: petals, a centre, a dot between each two
    function fleuron(h, a, b, R, n = 4, t0 = Math.PI / 4) {
        for (let i = 0; i < n; i++) h.poly(S.curve(lens(a, b, t0 + (i * TAU) / n, R * 0.22, R, R * 0.2), true, 3));
        h.dot(a, b, R * 0.17);
        for (let i = 0; i < n; i++) {
            const t = t0 + ((i + 0.5) * TAU) / n;
            h.dot(a + Math.cos(t) * R * 0.62, b + Math.sin(t) * R * 0.62, R * 0.09);
        }
    }
    // the eight-pointed star of two squares, as a band of two lines, a rosette in its heart
    function star8(h, a, b, R, w = 0.55) {
        for (const k of [1, 0.84]) {
            for (let j = 0; j < 2; j++) {
                const pts = [];
                for (let i = 0; i <= 4; i++) {
                    const t = (j * Math.PI) / 4 + (i * Math.PI) / 2;
                    pts.push([a + Math.cos(t) * R * k, b + Math.sin(t) * R * k]);
                }
                h.line(pts, w * (k === 1 ? 1 : 0.6));
            }
        }
        h.circle(a, b, R * 0.36, w * 0.8);
        fleuron(h, a, b, R * 0.3, 8, 0);
        for (let i = 0; i < 8; i++) {
            const t = (i * Math.PI) / 4 + Math.PI / 8;
            h.dot(a + Math.cos(t) * R * 0.52, b + Math.sin(t) * R * 0.52, R * 0.045);
        }
    }
    function lyre(h, a, b, k = 1) {
        const arm = [[1.6, 8.2], [4.6, 6.4], [6.4, 2.2], [5.8, -2.6], [4, -6.6], [4.6, -9.2], [6.2, -9.6], [6.6, -8.4]];
        for (const sx of [-1, 1]) h.line(S.curve(arm.map(([x, y]) => [a + x * k * sx, b + y * k]), false, 5), 0.9 * k);
        h.poly(S.ellipse(a, b + 8.6 * k, 2.6 * k, 1.5 * k, 12));
        h.line([[a - 4.9 * k, b - 6 * k], [a + 4.9 * k, b - 6 * k]], 0.8 * k);
        for (const x of [-2.4, -0.8, 0.8, 2.4]) h.line([[a + x * k, b - 6 * k], [a + x * 0.7 * k, b + 7.6 * k]], 0.3 * k);
    }
    // a scroll for blind stamping: an S with curled ends
    const scroll = (h, a, b, k, flip = 1, w = 0.5) => h.line(S.curve([[-6, 1.2], [-7.2, -0.6], [-5.6, -2], [-3.6, -1], [0, 0], [3.6, 1], [5.6, 2], [7.2, 0.6], [6, -1.2]].map(([x, y]) => [a + x * k, b + y * k * flip]), false, 5), w);
    // a small donkey of our own, heading right, about 27 × 21 before `k`
    const DONKEY = {
        body: [[3.6, 6.6], [1.6, 9], [1.2, 13], [0.5, 15.6], [2.2, 14.6], [2.7, 10.4], [4, 12], [3.6, 17.5], [3.3, 20], [5.6, 20], [5.8, 17.5], [6.8, 13.6], [10, 14.3], [14, 13.9], [15, 14.2], [15.2, 17.5], [15, 20], [17.2, 20], [17.4, 17.5], [18, 13.2], [19.5, 11], [20.6, 8.6], [21.6, 7.7], [23, 8.9], [25.6, 9.9], [26.5, 8.6], [26, 7.1], [23.5, 4.4], [23, 3.6], [23.9, -1.6], [22.2, -0.6], [21.4, 3], [20.9, 2.6], [20, -1.2], [19.1, 0.3], [19.6, 3.7], [18.4, 4.6], [15.6, 6.2], [10, 6.6], [5.5, 6]],
        far: [[[7.4, 13.2], [7.9, 20], [9.6, 20], [9.3, 13.6]], [[12.5, 13.6], [12.8, 20], [14.3, 20], [14.3, 13.8]]],
    };

    // ------------------------------------------------------------------ the books
    // A paper label pasted on a spine: a printed frame, a shelfmark in ink, a corner come unstuck.
    function shelfLabel(c, a0, b0, w, hgt, lines) {
        const { q, P } = c, sd = c.seed + 'label', pts = rect(P, a0, b0, a0 + w, b0 + hgt, { r: 0.7, wob: 0.22, seed: sd, step: 2 });
        S.piece(q, pts, {
            fill: '#e9dfc2', line: 0.8, heavy: 0.5, cast: { blur: 1.2, dx: 0.5, dy: 0.8, color: 'rgba(10,6,20,0.6)' },
            detail: (qq) => {
                blot(qq, P.sub(a0, b0), w, hgt, sd, 6, ['#b08a50', '#fffaf0', '#8a6a3a'], 0.3, [2, 7]);
                stamp(qq, P, [a0, b0, a0 + w, b0 + hgt], { mode: 'ink', color: '#3d4f8f', wear: 0.25, seed: sd + 1 }, (h) => {
                    h.box(a0 + 1.3, b0 + 1.3, a0 + w - 1.3, b0 + hgt - 1.3, 0.5);
                    h.box(a0 + 2.1, b0 + 2.1, a0 + w - 2.1, b0 + hgt - 2.1, 0.2);
                });
                stamp(qq, P, [a0, b0, a0 + w, b0 + hgt], { mode: 'ink', color: '#2a2030', wear: 0.12, seed: sd + 2 }, (h) => {
                    h.text(lines[0], { a: a0 + w / 2, b: b0 + hgt * 0.33, cap: 3.4, font: LORA, hand: 0.6, maxW: w - 6, skew: 0.2 });
                    h.text(lines[1], { a: a0 + w / 2, b: b0 + hgt * 0.67, cap: 5, font: LORA, hand: 0.8, maxW: w - 6, skew: 0.2 });
                });
                S.spray(qq, pts, { color: '#8a6a3a', alpha: 0.55, w: 2.4 });
            },
        });
        // the corner that has lifted: its underside, and the leather it left
        const A = [a0 + w - 4, b0 + hgt], Bp = [a0 + w, b0 + hgt - 3.4];
        fillPts(q, P.pts([[a0 + w + 0.2, b0 + hgt + 0.2], A, Bp]), rgba(c.M.deep, 0.9));
        S.piece(q, P.pts([A, Bp, [a0 + w - 3.6, b0 + hgt - 3]]), { fill: '#fbf4dc', line: 0.6, heavy: 0.4, shade: { color: '#a08a5c', alpha: 0.6, w: 1.2 }, cast: { blur: 0.8, dx: 0.4, dy: 0.5, color: 'rgba(10,6,20,0.5)' } });
    }
    // the corner of a paper cover folded over: (a, b) the corner, sa and sb how far along each edge
    function dogEar(q, P, a, b, sa, sb, under = '#f6eeda', below = '#161a36') {
        const A = [a + sa, b], Bp = [a, b + sb], Cp = [a + sa, b + sb];
        fillPts(q, P.pts([[a - Math.sign(sa), b - Math.sign(sb)], [a + sa * 1.02, b - Math.sign(sb)], [a - Math.sign(sa), b + sb * 1.02]]), below);
        S.piece(q, P.pts([A, Bp, [(A[0] + Cp[0] * 2) / 3, (Bp[1] + Cp[1] * 2) / 3]]), { fill: under, line: 0.7, heavy: 0.5, shade: { color: '#9c8a6c', alpha: 0.6, w: 1.6 }, cast: { blur: 1.4, dx: 0.6, dy: 0.9, color: 'rgba(10,6,20,0.5)' } });
    }

    const SPEC = {
        // brown calf over thick boards, double cords, blind tooling; the title a later gilding
        maimonides: {
            M: MAT.calfDark, grain: GRAIN.calf(MAT.calfDark), bands: [17, 47, 141, 166], board: 3.4, pages: { kind: 'red', band: ['#2f4f7f', '#e8dcb8'] },
            spinePaint(c) {
                const { q, P, L, T, M, B } = c, bs = B.bands, comps = [[0, bs[0]], [bs[0], bs[1]], [bs[1], bs[2]], [bs[2], bs[3]], [bs[3], L]];
                blind(c, (h) => {
                    comps.forEach(([a0, a1], i) => {
                        const x0 = a0 + 3.6, x1 = a1 - 3.6;
                        if (x1 - x0 < 5) return;
                        h.box(x0, 4.5, x1, T - 4.5, 0.6);
                        h.box(x0 + 1.7, 6.2, x1 - 1.7, T - 6.2, 0.3);
                        const mx = (x0 + x1) / 2, w = (x1 - x0) / 2 - 1.7;
                        if (i !== 2) {
                            // a saltire and a lozenge with a flower in it: the binder's oldest pattern
                            h.line([[x0 + 1.7, 6.2], [x1 - 1.7, T - 6.2]], 0.4);
                            h.line([[x1 - 1.7, 6.2], [x0 + 1.7, T - 6.2]], 0.4);
                            h.line([[mx, 6.2], [mx + w, T / 2], [mx, T - 6.2], [mx - w, T / 2], [mx, 6.2]], 0.4);
                            fleuron(h, mx, T / 2, Math.min(3, w * 0.5));
                            fleuron(h, mx, 12, 1.6);
                            fleuron(h, mx, T - 12, 1.6);
                        } else {
                            // a rope of small dots round the title's panel, a flower in each corner
                            for (let a = x0 + 4.4; a < x1 - 3; a += 2.6) for (const b of [8.6, T - 8.6]) h.dot(a, b, 0.42);
                            for (const [fa, fb] of [[x0 + 6.4, 13], [x1 - 6.4, 13], [x0 + 6.4, T - 13], [x1 - 6.4, T - 13]]) fleuron(h, fa, fb, 2.1);
                        }
                    });
                });
                bs.forEach((a) => band(c, a, { two: true }));
                const mid = (bs[1] + bs[2]) / 2, w = bs[2] - bs[1] - 26;
                gilt(c, 0.26, (h) => {
                    h.text('MAIMÓNIDES', { a: mid, b: T * 0.375, cap: 11, maxW: w, track: 0.06 });
                    h.line([[mid - w * 0.42, T * 0.545], [mid - 4, T * 0.545]], 0.5);
                    h.line([[mid + 4, T * 0.545], [mid + w * 0.42, T * 0.545]], 0.5);
                    h.poly([[mid - 2.2, T * 0.545], [mid, T * 0.545 - 1.5], [mid + 2.2, T * 0.545], [mid, T * 0.545 + 1.5]]);
                    h.text('GUÍA DE PERPLEJOS', { a: mid, b: T * 0.7, cap: 6.6, maxW: w + 6, track: 0.05 });
                }, P, [bs[1] + 3, 8, bs[2] - 3, T - 8]);
                // wormholes: the beetle came in at the tail and wandered
                const r = Motion.rng(c.seed + 'worm');
                for (let i = 0; i < 9; i++) {
                    const p = P(i < 6 ? 3 + r() * 12 : bs[3] + r() * 14, 6 + r() * (T - 12)), rr = 0.35 + r() * 0.4;
                    disc(q, [p[0] + SD[0] * 0.25, p[1] + SD[1] * 0.25], rr + 0.2, rgba(M.light, 0.5));
                    disc(q, p, rr, '#120a0c');
                }
                shelfLabel(c, 21, T - 27, 22, 19, ['Est. 3', '1138']);
                gloss(c, 0.26);
                scuff(c, 1.6, 6);
                scuff(c, T - 1.4, 4, '#8a6a48');
            },
        },
        // sprinkled calf of the 1600s: five bands, gilt compartments, a red lettering piece
        gongora: {
            M: MAT.calfTan, grain: GRAIN.calf(MAT.calfTan, 1), bands: [15, 99, 122, 145, 163], board: 2.8, pages: { kind: 'sprinkle', band: ['#2f4f7f', '#efe6c8'], bandW: 6.4, back: 9.5 },
            spinePaint(c) {
                const { q, P, L, T, B } = c, bs = B.bands, comps = [[0, bs[0]], [bs[0], bs[1]], [bs[1], bs[2]], [bs[2], bs[3]], [bs[3], bs[4]], [bs[4], L]];
                gilt(c, 0.34, (h) => {
                    for (const a of bs) for (const d of [-3.5, 3.5]) h.line([[a + d, 1.5], [a + d, T - 1.5]], 0.5);
                    comps.forEach(([a0, a1], i) => {
                        const x0 = a0 + 5, x1 = a1 - 5, mx = (a0 + a1) / 2;
                        if (i === 1 || x1 - x0 < 3) return;
                        if (i === 0 || i === 5) {
                            // head and tail: a roll of slanted strokes
                            for (let b = 4; b < T - 4; b += 2.2) h.line([[mx - 1.6, b], [mx + 1.6, b + 1.4]], 0.45);
                            return;
                        }
                        h.box(x0, 5, x1, T - 5, 0.5);
                        h.box(x0 + 1.4, 6.4, x1 - 1.4, T - 6.4, 0.25);
                        fleuron(h, mx, T / 2, 4.2);
                        for (const [fa, fb] of [[x0 + 2.6, 8], [x1 - 2.6, 8], [x0 + 2.6, T - 8], [x1 - 2.6, T - 8]]) h.dot(fa, fb, 0.5);
                        fleuron(h, mx, 11.5, 1.5, 4, 0);
                        fleuron(h, mx, T - 11.5, 1.5, 4, 0);
                    });
                });
                bs.forEach((a) => band(c, a, { w: 4.2 }));
                // the lettering piece: thin red goatskin pasted in the second panel
                const a0 = bs[0] + 5.6, a1 = bs[1] - 5.6, R = MAT.morocco, lp = rect(P, a0, 5, a1, T - 5, { r: 0.6, wob: 0.25, seed: c.seed + 'lp', step: 3 });
                S.piece(q, lp, {
                    fill: mix(R.base, R.deep, 0.2), line: 0.8, heavy: 0.5, shade: { color: R.deep, alpha: 0.75, w: 4 }, light: { color: R.light, alpha: 0.45, w: 2.4 }, cast: { blur: 1, dx: 0.4, dy: 0.6, color: 'rgba(20,6,10,0.6)' },
                    detail: (qq) => {
                        GRAIN.morocco(R)(qq, P.sub(a0, 5), a1 - a0, T - 10, c.seed + 'lpg', 0.8);
                        stamp(qq, P, [a0, 5, a1, T - 5], { mode: 'gilt', wear: 0.2, seed: c.seed + 'lpt' }, (h) => {
                            h.box(a0 + 1.6, 6.6, a1 - 1.6, T - 6.6, 0.5);
                            h.box(a0 + 2.7, 7.7, a1 - 2.7, T - 7.7, 0.22);
                            const mx = (a0 + a1) / 2;
                            h.text('GÓNGORA', { a: mx, b: T * 0.385, cap: 9.6, maxW: a1 - a0 - 12, track: 0.08 });
                            h.line([[mx - 16, T * 0.55], [mx + 16, T * 0.55]], 0.4);
                            h.text('SOLEDADES', { a: mx, b: T * 0.7, cap: 7, maxW: a1 - a0 - 12, track: 0.1 });
                        });
                        // chipped at a corner: the calf shows
                        fillPts(qq, P.pts([[a1 - 4.4, T - 5], [a1, T - 5], [a1, T - 8.6], [a1 - 1.6, T - 6.6]]), MAT.calfTan.base);
                    },
                });
                gloss(c, 0.3);
                scuff(c, 1.5, 7);
                scuff(c, T - 1.3, 4, '#b08a58');
            },
        },
        // red morocco, a smooth spine with a gilt border, stars in the end panels
        arabi: {
            M: MAT.morocco, grain: GRAIN.morocco(MAT.morocco), board: 2.6, pages: { kind: 'gilt', band: ['#1c5c45', '#e7c35a'] },
            spinePaint(c) {
                const { L, T } = c;
                gilt(c, 0.24, (h) => {
                    h.box(3.2, 3.2, L - 3.2, T - 3.2, 0.75);
                    h.box(4.9, 4.9, L - 4.9, T - 4.9, 0.3);
                    for (const a of [27, L - 27]) {
                        h.line([[a - 1, 4.9], [a - 1, T - 4.9]], 0.6);
                        h.line([[a + 1, 4.9], [a + 1, T - 4.9]], 0.3);
                    }
                    for (const a of [15.5, L - 15.5]) {
                        star8(h, a, T / 2, 8.2);
                        for (const b of [8.4, T - 8.4]) h.dot(a, b, 0.6);
                    }
                    for (let a = 31; a < L - 30; a += 3) for (const b of [7.4, T - 7.4]) h.dot(a, b, 0.36);
                });
                gilt(c, 0.14, (h) => {
                    const mid = L / 2, w = L - 76;
                    h.text('IBN ARABI', { a: mid, b: T * 0.3, cap: 8.8, maxW: w, track: 0.12 });
                    h.text('EL INTÉRPRETE', { a: mid, b: T * 0.565, cap: 6, maxW: w, track: 0.09 });
                    h.text('DE LOS DESEOS', { a: mid, b: T * 0.77, cap: 6, maxW: w, track: 0.09 });
                });
                gloss(c, 0.32);
                scuff(c, 1.4, 5, '#e8a088');
                scuff(c, T - 1.2, 3, '#c97a66');
            },
        },
        // limp vellum: no boards, the title inked along the spine, the thongs laced through
        seneca: {
            M: MAT.vellum, grain: GRAIN.vellum(MAT.vellum), board: 1, square: 0.6, ease: 2.2, wob: 0.6, round: 0.7, pages: { kind: 'plain', wave: 1, back: 3, band: ['#d8c9a0', '#a08a5c'] },
            spinePaint(c) {
                const { q, P, L, T } = c, r = Motion.rng(c.seed + 'v');
                // cockled: the skin has pulled into soft waves
                for (let i = 0; i < 7; i++) {
                    const a = (i + 0.3 + r() * 0.5) * (L / 7), w = 4 + r() * 6, gr = q.createLinearGradient(...P(a - w, 0), ...P(a + w, 0));
                    gr.addColorStop(0, rgba('#8f7a52', 0));
                    gr.addColorStop(0.5, rgba(i % 2 ? '#fffbe8' : '#74627a', i % 2 ? 0.34 : 0.22));
                    gr.addColorStop(1, rgba('#8f7a52', 0));
                    fillPts(q, P.pts([[a - w, 0], [a + w, 0], [a + w + 2, T], [a - w + 2, T]]), gr);
                }
                // the sewing supports laced through the joints: three pairs of tawed thongs
                for (const a of [22, L / 2 + 3, L - 24]) {
                    strokePts(q, [P(a, 4), P(a, T - 4)], 2.2, rgba('#fffbe8', 0.16));
                    for (const b of [3.3, T - 3.3]) {
                        const pp = rect(P, a - 3.2, b - 1, a + 3.2, b + 1, { r: 0.8, wob: 0.15, seed: c.seed + a + b, step: 2 });
                        S.piece(q, pp, { fill: '#e4cfa2', line: 0.55, heavy: 0.5, ink: '#4a3524', shade: { color: '#8f7242', alpha: 0.8, w: 1.1 }, light: { color: '#fff6da', alpha: 0.7, w: 0.6 }, cast: { blur: 0.8, dx: 0.3, dy: 0.5, color: 'rgba(60,40,20,0.5)' } });
                        for (const d of [-3.5, 3.5]) disc(q, P(a + d, b), 0.5, rgba('#3a2a1c', 0.85));
                    }
                }
                print(c, '#4a2f1e', 0.2, (h) => {
                    h.text('SÉNECA', { a: L / 2, b: T * 0.34, cap: 11.5, maxW: L - 64, hand: 1, track: 0.1 });
                    h.text('CARTAS A LUCILIO', { a: L / 2, b: T * 0.72, cap: 7, maxW: L - 40, hand: 1, track: 0.07 });
                    h.line(S.curve([[L / 2 - 34, T * 0.54], [L / 2 - 14, T * 0.52], [L / 2, T * 0.55], [L / 2 + 14, T * 0.52], [L / 2 + 34, T * 0.54]], false, 5), 0.45);
                    h.text('IV', { a: 10.5, b: T * 0.5, cap: 5, hand: 1 });
                    h.line([[6.5, T * 0.5 + 4.6], [14.5, T * 0.5 + 4.2]], 0.35);
                });
                // a second pass of the pen where the ink took badly: darker pools in the strokes
                print(c, '#2a1810', 0.75, (h) => {
                    h.text('SÉNECA', { a: L / 2, b: T * 0.34, cap: 11.5, maxW: L - 64, hand: 1, track: 0.1 });
                    h.text('CARTAS A LUCILIO', { a: L / 2, b: T * 0.72, cap: 7, maxW: L - 40, hand: 1, track: 0.07 });
                });
                // handled: a grey bloom where the thumb goes, dirt along the lower edge
                blot(q, P.sub(L * 0.62, T * 0.2), 40, T * 0.6, c.seed + 'th', 5, ['#6e6474', '#8a7a62'], 0.2, [6, 12]);
                blot(q, P.sub(0, T - 7), L, 7, c.seed + 'dirt', 14, ['#6a5a48', '#8a7a62'], 0.3, [3, 8]);
            },
        },
        // Romantic publisher's cloth, plum: blind arabesques, a gilt lyre
        becquer: {
            M: MAT.plum, grain: GRAIN.cloth(MAT.plum), round: 0.6, board: 2.4, pages: { kind: 'marble', band: ['#a8322c', '#f1e8d0'] },
            spinePaint(c) {
                const { L, T } = c;
                blind(c, (h) => {
                    h.box(7.5, 3.4, L - 7.5, T - 3.4, 0.6);
                    h.box(9, 4.9, L - 9, T - 4.9, 0.28);
                    for (const [a, f] of [[19, 1], [L - 19, -1]]) {
                        scroll(h, a, T * 0.3, 1.05, f);
                        scroll(h, a, T * 0.7, 1.05, -f);
                        if (f < 0) fleuron(h, a, T / 2, 2.2, 6, 0);
                    }
                    for (const a of [62, 94]) for (const b of [8, T - 8]) fleuron(h, a, b, 1.5);
                }, 0.7);
                gilt(c, 0.22, (h) => {
                    for (const a of [2.2, 3.6, 5.6, L - 5.6, L - 3.6, L - 2.2]) h.line([[a, 1], [a, T - 1]], a === 3.6 || a === L - 3.6 ? 0.8 : 0.3);
                    lyre(h, 78, T / 2, 1.2);
                    // a swallow, come back
                    h.poly([[23.6, T / 2 - 0.2], [20.4, T / 2 - 1.1], [16.6, T / 2 - 5.2], [18.4, T / 2 - 1.1], [14.2, T / 2 - 1.9], [16.6, T / 2 - 0.1], [14.2, T / 2 + 1.9], [18.4, T / 2 + 1.2], [16.9, T / 2 + 5.2], [20.6, T / 2 + 1]]);
                });
                gilt(c, 0.12, (h) => {
                    h.text('BÉCQUER', { a: 46, b: T / 2, cap: 8.4, font: LORA, maxW: 46, track: 0.08 });
                    h.text('RIMAS', { a: 110, b: T / 2, cap: 12, font: LORA, maxW: 42, track: 0.1 });
                });
                scuff(c, 1.3, 4, '#b79ab0');
            },
        },
        // ochre cloth stamped in dark blue, the little donkey in silver
        platero: {
            M: MAT.ochre, grain: GRAIN.cloth(MAT.ochre, 1.2), round: 0.55, board: 2.3, pages: { kind: 'plain', band: ['#27468c', '#f1e8d0'] },
            spinePaint(c) {
                const { q, P, L, T } = c, NAVY = '#1c2250';
                print(c, NAVY, 0.1, (h) => {
                    h.box(3, 3, L - 3, T - 3, 0.7);
                    h.box(4.6, 4.6, L - 4.6, T - 4.6, 0.25);
                    h.line([[42, 4.6], [42, T - 4.6]], 0.4);
                    h.text('PLATERO Y YO', { a: 97, b: T * 0.37, cap: 9.4, font: LORA, maxW: 98, track: 0.08 });
                    h.text('J. R. JIMÉNEZ', { a: 97, b: T * 0.74, cap: 5.6, font: LORA, maxW: 80, track: 0.12 });
                    for (const a of [50, 144]) fleuron(h, a, T * 0.74, 1.7, 5, -Math.PI / 2);
                    // the ground he stands on, a tuft of grass, a moon
                    h.line([[8, 26.6], [38, 26.6]], 0.4);
                    for (const [a, l] of [[10, 2.4], [11.2, 3.2], [12.4, 2], [34.6, 2.6], [35.8, 1.8]]) h.line([[a, 26.6], [a + (a < 20 ? -0.6 : 0.6), 26.6 - l]], 0.3);
                    h.poly(S.curve([[34, 7], [36.6, 8], [37.4, 10.6], [35.8, 9.4], [34, 9.4]], true, 4));
                });
                // the donkey: blocked in silver, with its dark lines
                const k = 0.84, D = P.sub(11.5, 9.4, 0, k);
                for (const leg of DONKEY.far) S.piece(q, D.pts(leg), { fill: mix(SILVER.base, SILVER.deep, 0.55), line: 0.5, heavy: 0.4 });
                const body = D.pts(S.curve(DONKEY.body, true, 3));
                S.piece(q, body, {
                    fill: SILVER.base, line: 0.7, heavy: 0.6, ink: NAVY, shade: { color: SILVER.deep, alpha: 0.8, w: 2.6 }, light: { color: SILVER.glint, alpha: 0.85, w: 1.6 }, cast: { blur: 0.8, dx: 0.3, dy: 0.5, color: 'rgba(60,40,10,0.5)' },
                    detail: (qq) => {
                        // the coat: short strokes of the die, the pale muzzle and belly
                        const r = Motion.rng(c.seed + 'coat');
                        for (let i = 0; i < 60; i++) {
                            const p = D(3 + r() * 20, 5 + r() * 9);
                            strokePts(qq, [p, [p[0] + 0.5 + r() * 0.6, p[1] + 0.7 + r() * 0.6]], 0.25, rgba(r() < 0.5 ? SILVER.deep : SILVER.glint, 0.5));
                        }
                        disc(qq, D(25.4, 8.9), 1.3 * k, rgba('#ffffff', 0.7));
                        fillPts(qq, D.pts(S.ellipse(11, 13.4, 5, 1.2, 12)), rgba('#ffffff', 0.5));
                    },
                });
                stamp(q, D, [-1, -3, 28, 22], { mode: 'ink', color: NAVY, wear: 0.04, seed: c.seed + 'dl' }, (h) => {
                    h.dot(23.7, 6.3, 0.5);
                    h.line([[18.8, 4.8], [17.4, 7.6], [17, 10]], 0.35);
                    h.line([[19.8, 5], [18.6, 7.8]], 0.3);
                    h.line([[6.6, 13.6], [7.2, 9.4]], 0.3);
                    h.line([[25.3, 9.5], [26, 8.9]], 0.3);
                    h.line([[22.6, 3.2], [23.4, 0.2]], 0.25);
                    for (const x of [3.3, 15]) h.line([[x, 19.3], [x + 2.3, 19.3]], 0.6);
                    for (const x of [7.9, 12.8]) h.line([[x, 19.4], [x + 1.6, 19.4]], 0.5);
                });
                scuff(c, 1.3, 4, '#f6e6a8');
            },
            coverPaint(c) {
                const { q, P, L, T } = c;
                blind(c, (h) => {
                    h.box(5, 5, L - 5, T - 5, 0.8);
                    h.box(7.4, 7.4, L - 7.4, T - 7.4, 0.35);
                    h.line([[0, 3.4], [L, 3.4]], 0.6);
                }, 0.55);
                // the ring a wine glass left: darker where the wine pooled, broken where it dried
                const ring = P.sub(21, 37);
                stamp(q, ring, [-16, -16, 16, 16], { mode: 'ink', color: 'rgba(92,22,52,0.62)', wear: 0.3, seed: c.seed + 'wine' }, (h) => {
                    h.circle(0, 0, 12.4, 1.5);
                    h.circle(0.5, 0.3, 11.2, 0.5);
                    h.line(S.curve([[-12.3, 2], [-11, 6.4], [-8, 9.6], [-4, 11.8]], false, 4), 2.3);
                    h.dot(13.6, 9, 1.1);
                    h.dot(15.4, 11, 0.5);
                });
                stamp(q, ring, [-16, -16, 16, 16], { mode: 'ink', color: 'rgba(92,22,52,0.14)', wear: 0, seed: c.seed + 'wine2' }, (h) => h.poly(S.ellipse(0, 0, 12, 12, 30)));
            },
        },
        // a small black devotional book, read to pieces: the corners down to the board
        juan: {
            M: MAT.black, ink: '#07060e', grain: GRAIN.calf(MAT.black), bands: [9, 101], board: 2, pages: { kind: 'red', band: ['#3a3340', '#8d8474'] },
            spinePaint(c) {
                const { q, P, L, T, B } = c;
                gilt(c, 0.5, (h) => {
                    for (const a of [4.4, 5.8, 13.4, L - 13.4, L - 5.8, L - 4.4]) h.line([[a, 1.2], [a, T - 1.2]], 0.4);
                    // a star and the moon's last sliver: a dark night
                    fleuron(h, 21.5, T / 2 - 3.4, 2.6, 8, 0);
                    h.poly(S.curve([[19.6, T / 2 + 2], [22.4, T / 2 + 3.4], [24.6, T / 2 + 2], [22.6, T / 2 + 5.6], [20.2, T / 2 + 4.6]], true, 4));
                    h.dot(90.5, T / 2, 0.9);
                });
                gilt(c, 0.2, (h) => {
                    h.text('S. JUAN DE LA CRUZ', { a: 57, b: T * 0.3, cap: 4.8, maxW: 62, track: 0.08 });
                    h.text('NOCHE OSCURA', { a: 57, b: T * 0.68, cap: 7, maxW: 62, track: 0.07 });
                });
                B.bands.forEach((a) => band(c, a, { w: 3.4 }));
                // the leather gone from the four corners and from the caps: grey board, frayed
                const r = Motion.rng(c.seed + 'worn');
                for (const [a, b, sa, sb] of [[0, 0, 1, 1], [L, 0, -1, 1], [0, T, 1, -1], [L, T, -1, -1]]) {
                    const w = 10 + r() * 4, hh = 6.4 + r() * 2.6, pts = [[a, b], [a + sa * w, b], [a + sa * w * 0.72, b + sb * hh * 0.34], [a + sa * w * 0.4, b + sb * hh * 0.5], [a + sa * w * 0.22, b + sb * hh * 0.9], [a, b + sb * hh]];
                    S.piece(q, P.pts(pts), { fill: '#b4a88c', line: 0.7, heavy: 0.3, shade: { color: '#4a4350', alpha: 0.7, w: 2.4 }, light: { color: '#d8cfb8', alpha: 0.7, w: 1.4 } });
                    // the board is made of pasted sheets: its layers show
                    for (let k = 1; k < 4; k++) strokePts(q, [P(a + sa * 0.6, b + sb * hh * k * 0.22), P(a + sa * w * (0.8 - k * 0.17), b + sb * hh * k * 0.22)], 0.25, rgba('#4a4036', 0.6));
                    for (let i = 0; i < 6; i++) {
                        const u = r(), p = [a + sa * w * (1 - u) * 0.8, b + sb * hh * u * 0.8];
                        strokePts(q, [P(p[0], p[1]), P(p[0] + sa * (0.6 + r() * 1.4), p[1] + sb * (0.5 + r()))], 0.3, rgba(r() < 0.5 ? '#5a4634' : '#d8cfb8', 0.8));
                    }
                }
                scuff(c, 1.2, 7, '#6a5a48');
                scuff(c, T - 1.2, 6, '#5a4c40');
                gloss(c, 0.22, 16, L - 16);
            },
        },
    };

    // A slim paperback whose spine the sun has bleached: `orig` survives at the ends, where
    // the neighbours on the shelf shaded it, and on the covers.
    const slim = (M, orig, letter) => ({
        M, coverM: orig, paperback: true, board: 0.7, square: 0.3, round: 0.18, ease: 0.5, wob: 0.16, line: 1.5, grain: GRAIN.paper(M), coverGrain: GRAIN.paper(orig, 0.5),
        pages: { kind: 'plain', back: 1, pitch: 0.7, paper: { deep: '#6b6283', base: '#cdbd92', light: '#efe3c2' } },
        spinePaint(c) {
            const { q, P, L, T } = c, r = Motion.rng(c.seed + 'slim');
            for (const [a0, a1] of [[0, 9 + r() * 6], [L, L - 5 - r() * 5]]) {
                const gr = q.createLinearGradient(...P(a0, 0), ...P(a1, 0));
                gr.addColorStop(0, rgba(orig.base, 0.85));
                gr.addColorStop(1, rgba(orig.base, 0));
                fillPts(q, P.pts([[a0, 0], [a1, 0], [a1, T], [a0, T]]), gr);
            }
            letter(c);
            // reading creases along the spine, white where the ink cracked
            for (let i = 0; i < 4; i++) {
                const b = T * (0.18 + 0.64 * r()), a = r() * L * 0.5, l = L * (0.2 + r() * 0.4);
                strokePts(q, [P(a, b), P(a + l / 2, b + (r() - 0.5) * 0.5), P(a + l, b)], 0.3, rgba('#fffdf4', 0.5));
                strokePts(q, [P(a, b + 0.35), P(a + l / 2, b + 0.35 + (r() - 0.5) * 0.5), P(a + l, b + 0.35)], 0.25, rgba(M.deep, 0.4));
            }
            // bumped ends: the paper white through the colour
            for (let i = 0; i < 5; i++) disc(q, P(r() < 0.5 ? r() * 2 : L - r() * 2, r() * T), 0.3 + r() * 0.6, rgba('#fffdf4', 0.75));
        },
    });
    // a little anchor, a leaf and a tree: the three paperbacks' devices
    const anchor = (h, a, b, k) => {
        h.circle(a, b - 3.2 * k, 0.9 * k, 0.4 * k, 10);
        h.line([[a, b - 2.3 * k], [a, b + 3.4 * k]], 0.55 * k);
        h.line([[a - 1.8 * k, b - 1.2 * k], [a + 1.8 * k, b - 1.2 * k]], 0.45 * k);
        h.line(S.curve([[a - 3 * k, b + 1], [a - 2 * k, b + 2.8 * k], [a, b + 3.5 * k], [a + 2 * k, b + 2.8 * k], [a + 3 * k, b + 1]], false, 4), 0.5 * k);
    };
    SPEC.alberti = slim(MAT.sea, { deep: '#12305a', base: '#2f6f9f', light: '#7fb4d6' }, (c) => {
        const { L, T } = c;
        print(c, '#1c2f66', 0.1, (h) => {
            h.text('R. ALBERTI', { a: 27, b: T / 2, cap: 5.6, font: ANTON, maxW: 34, track: 0.1 });
            h.text('MARINERO EN TIERRA', { a: 87, b: T / 2, cap: 7, font: ANTON, maxW: 74, track: 0.09 });
            anchor(h, L - 9.5, T / 2, 1.1);
            for (const a of [47.5, 126.5]) h.line(S.curve([[a - 2, T / 2 + 0.6], [a - 1, T / 2 - 0.6], [a, T / 2 + 0.6], [a + 1, T / 2 - 0.6], [a + 2, T / 2 + 0.6]], false, 3), 0.35);
            h.line([[5, 1.6], [5, T - 1.6]], 0.7);
        });
    });
    SPEC.cernuda = slim(MAT.salmon, { deep: '#5a1f1c', base: '#b0503a', light: '#e59a7a' }, (c) => {
        const { L, T } = c;
        print(c, '#5a221c', 0.1, (h) => {
            h.text('L. CERNUDA', { a: 40, b: T / 2, cap: 4.8, font: LORA, maxW: 48, track: 0.12 });
            h.text('OCNOS', { a: 88, b: T / 2, cap: 7, font: LORA, maxW: 36, track: 0.22 });
            for (const a of [7.5, 111]) h.line([[a, T / 2], [a + 4.5, T / 2]], 0.4);
            h.dot(67, T / 2, 0.7);
            fleuron(h, L - 10, T / 2, 2.4, 5, -Math.PI / 2);
            h.line([[L - 20, 2], [L - 20, T - 2]], 0.3);
        });
    });
    SPEC.zambrano = slim(MAT.sage, { deep: '#1f3a2a', base: '#5f8a52', light: '#a8c88a' }, (c) => {
        const { L, T } = c;
        print(c, '#24402c', 0.1, (h) => {
            h.text('CLAROS DEL BOSQUE', { a: 39.5, b: T / 2, cap: 5.8, font: LORA, maxW: 66, track: 0.08 });
            h.text('M. ZAMBRANO', { a: 110, b: T / 2, cap: 5, font: LORA, maxW: 40, track: 0.1 });
            fleuron(h, 128.4, T / 2, 1.9, 6, 0);
            for (const a of [3.4, L - 3.4]) h.line([[a, 1.5], [a, T - 1.5]], 0.5);
        });
    });
    SPEC.zambrano.coverPaint = (c) => {
        const { q, P, L, T } = c;
        print(c, '#f1ecd6', 0.12, (h) => {
            h.box(5, 5, L - 5, T - 5, 0.7);
            h.box(7, 7, L - 7, T - 7, 0.3);
            // the publisher's device: a tree in a clearing
            for (const a of [16, L - 16]) {
                h.line([[a, 13], [a, 20]], 0.6);
                h.poly(S.ellipse(a, 22.5, 3, 4.4, 12));
                h.line([[a - 5, 12.4], [a + 5, 12.4]], 0.4);
            }
        });
        dogEar(q, P, 0, 0, 9, 13, '#e9e4cc', '#5a211c');
    };

    // ---- the three that stand
    // a 19th-century gift binding: blue cloth blocked in gold, a horseshoe arch at the head
    SPEC.irving = {
        M: MAT.blue, grain: GRAIN.cloth(MAT.blue, 1.25), round: 0.7, board: 3, pages: { kind: 'gilt', band: ['#a8322c', '#e7c35a'], bandW: 7, back: 10 },
        spinePaint(c) {
            const { P, L, T } = c, top = L - 6, Q = plane(P(top, 0), P.V, [-P.U[0], -P.U[1]]);
            blind(c, (h) => {
                h.box(66, 3, 184, T - 3, 0.6);
                for (let a = 70; a < 182; a += 4) for (const b of [5.6, T - 5.6]) h.dot(a, b, 0.4);
            }, 0.6);
            gilt(c, 0.2, (h, qq) => {
                // head: the alfiz, the arch with its voussoirs, the columns, a lamp
                const u = pen(qq, Q), cx = T / 2, cy = 18, R = 9.6, D2R = Math.PI / 180;
                u.box(3.4, 0, T - 3.4, 47, 0.75);
                u.box(5, 1.6, T - 5, 45.4, 0.3);
                const arc = (rr, t0, t1, n = 30) => {
                    const pts = [];
                    for (let i = 0; i <= n; i++) pts.push([cx + Math.cos((t0 + ((t1 - t0) * i) / n) * D2R) * rr, cy + Math.sin((t0 + ((t1 - t0) * i) / n) * D2R) * rr]);
                    return pts;
                };
                const inner = arc(R, 128, 412);
                u.line(inner, 0.8);
                u.line(arc(R + 5.4, 150, 390), 0.4);
                for (let i = 0; i < 13; i += 1) {
                    const t0 = 151 + i * 18.4, a = arc(R + 1.1, t0, t0 + 9.6, 3), b = arc(R + 4.6, t0, t0 + 9.6, 3);
                    u.poly([...a, ...b.reverse()]);
                }
                for (const p of [inner[0], inner[inner.length - 1]]) {
                    u.line([[p[0], p[1] + 2.6], [p[0], 41]], 1.1);
                    u.poly([[p[0] - 2.4, p[1] - 0.2], [p[0] + 2.4, p[1] - 0.2], [p[0] + 1.6, p[1] + 2.6], [p[0] - 1.6, p[1] + 2.6]]);
                    u.poly([[p[0] - 2.2, 41], [p[0] + 2.2, 41], [p[0] + 2.8, 43.4], [p[0] - 2.8, 43.4]]);
                }
                u.line([[cx, cy - R], [cx, cy - 3.6]], 0.3);
                u.poly(S.curve([[cx, cy - 3.6], [cx + 2.2, cy - 1], [cx + 1.5, cy + 2.4], [cx, cy + 4], [cx - 1.5, cy + 2.4], [cx - 2.2, cy - 1]], true, 4));
                u.dot(cx, cy + 5.6, 0.6);
                for (const x of [8.4, T - 8.4]) fleuron(u, x, 5.6, 2.2);
                for (const x of [cx - 4, cx, cx + 4]) fleuron(u, x, 36, 1.5, 4, 0);
                // bands of fillets and pearls
                for (const a of [6, 60, 188]) {
                    h.line([[a, 1.2], [a, T - 1.2]], 0.8);
                    h.line([[a + 3.6, 1.2], [a + 3.6, T - 1.2]], 0.8);
                    for (let b = 3; b < T - 2; b += 2.4) h.dot(a + 1.8, b, 0.5);
                }
                star8(h, 198, T / 2, 0.1);
            });
            gilt(c, 0.1, (h) => {
                h.text('CUENTOS DE LA', { a: 125, b: T * 0.3, cap: 7.4, font: LORA, maxW: 104, track: 0.1 });
                h.text('ALHAMBRA', { a: 125, b: T * 0.67, cap: 12.4, font: LORA, maxW: 104, track: 0.08 });
                h.text('W. IRVING', { a: 35, b: T / 2, cap: 7.2, font: LORA, maxW: 46, track: 0.1 });
                for (const a of [68.5, 181.5]) star8(h, a + (a < 100 ? 3 : -3), T / 2, 2.6, 0.3);
            });
            scuff(c, 1.6, 5, '#9fb2d6');
            scuff(c, T - 1.4, 5, '#7088b8');
        },
        after(g, B) {
            // its silk register, come out at the head and fallen down the back
            const p0 = B.endL(26, B.T * 0.56), dn = B.W.pv([0, -1, 0]), rt = B.W.pv([1, 0, 0]), at = (x, y) => [p0[0] + rt[0] * x + dn[0] * y, p0[1] + rt[1] * x + dn[1] * y];
            register(g, [at(0, 0), at(-1.5, 4), at(0.5, 9.5), at(2.5, 17), at(1, 27), at(3, 36), at(1.6, 43)], 4.6, { deep: '#5a0e22', base: '#b3262c', light: '#f08a7c' }, B.seed);
        },
    };
    // plain paper wrappers, 1903: the title in sepia, a modernista flower
    SPEC.machado = {
        M: MAT.wrapper, paperback: true, grain: GRAIN.paper(MAT.wrapper, 1.6), round: 0.25, board: 0.8, square: -1.4, ease: 0.6, wob: 0.3, line: 1.6,
        pages: { kind: 'deckle', back: 1.4, pitch: 0.75 },
        spinePaint(c) {
            const { q, P, L, T, M } = c, SEP = '#4a3524', top = L - 7, Q = plane(P(top, 0), P.V, [-P.U[0], -P.U[1]]), r = Motion.rng(c.seed + 'mw');
            print(c, SEP, 0.14, (h, qq) => {
                h.text('SOLEDADES', { a: 118, b: T / 2, cap: 8.4, font: LORA, maxW: 80, track: 0.14 });
                h.text('A. MACHADO', { a: 46, b: T / 2, cap: 5.6, font: LORA, maxW: 50, track: 0.12 });
                for (const a of [14, 78, 160]) {
                    h.line([[a, 2.6], [a, T - 2.6]], 0.5);
                    h.line([[a + 1.5, 4.4], [a + 1.5, T - 4.4]], 0.22);
                }
                // head: a poppy on a whiplash stem, two leaves
                const u = pen(qq, Q), cx = T / 2;
                u.line(S.curve([[cx - 3.4, 36], [cx + 2.6, 30], [cx - 2.8, 22], [cx + 1.6, 15], [cx, 9.4]], false, 6), 0.55);
                u.poly(S.curve([[cx, 9.6], [cx - 3.6, 8], [cx - 4.4, 3.6], [cx - 1.4, 5.2], [cx, 1.6], [cx + 1.4, 5.2], [cx + 4.4, 3.6], [cx + 3.6, 8]], true, 4));
                u.poly(S.curve([[cx + 1.6, 25.6], [cx + 5.8, 23.6], [cx + 6.4, 18.6], [cx + 3, 21.6]], true, 4));
                u.poly(S.curve([[cx - 1.8, 31.4], [cx - 6, 30], [cx - 6.4, 25.4], [cx - 3.2, 27.6]], true, 4));
                u.line(S.curve([[cx - 3.4, 36], [cx - 6, 38.6], [cx - 3, 40.4], [cx, 38.6], [cx + 3.2, 40.4], [cx + 6, 38.4]], false, 4), 0.4);
                // foot: the year
                const f = pen(qq, plane(P(10.5, 0), P.V, [-P.U[0], -P.U[1]]));
                f.text('1903', { a: cx, b: 3, cap: 3.6, font: LORA, maxW: T - 4.6, track: 0.06 });
            });
            // the wrapper is cracked along the joints, and a chip of it has gone at the head: the sewing shows
            for (const b of [1.5, T - 1.5]) for (let a = r() * 8; a < L; a += 6 + r() * 16) strokePts(q, [P(a, b + (r() - 0.5) * 0.6), P(a + 2 + r() * 7, b + (r() - 0.5) * 0.6)], 0.32, rgba(r() < 0.5 ? '#fffdf4' : M.deep, 0.6));
            const chip = [[L, 3.2], [L - 6.4, 2.6], [L - 9, 5], [L - 5.6, 6.4], [L - 7.4, 9.6], [L - 3, 11.6], [L, 11]];
            S.piece(q, P.pts(chip), { fill: '#a89878', line: 0.6, heavy: 0.3, shade: { color: '#5a4c40', alpha: 0.7, w: 2 } });
            for (let i = 0; i < 4; i++) strokePts(q, [P(L - 0.5, 4.4 + i * 1.9), P(L - 4.6 - (i % 2) * 2.4, 4.6 + i * 1.9)], 0.42, rgba('#efe6cc', 0.9));
            // a tide line of damp at the foot
            const tide = S.curve([[0, 0], [8, 2.4], [15, 7], [19, 12], [21, T]].map(([a, b]) => P(a, b)), false, 6);
            strokePts(q, tide, 0.5, rgba('#7a6a4c', 0.5));
            fillPts(q, [...tide, P(0, T)], rgba('#8a7a58', 0.16));
        },
    };
    // a paper cover of 1928, in red and black
    SPEC.lorca = {
        M: MAT.cream, paperback: true, grain: GRAIN.paper(MAT.cream), round: 0.2, board: 0.8, square: 0.2, ease: 0.6, wob: 0.25, line: 1.6,
        pages: { kind: 'plain', back: 1.2, pitch: 0.75 },
        spinePaint(c) {
            const { L, T } = c, RED = '#b3262c';
            print(c, RED, 0.1, (h) => {
                h.text('GARCÍA LORCA', { a: 46, b: T / 2, cap: 6.2, font: ANTON, maxW: 56, track: 0.1 });
                h.poly(S.ellipse(L - 12, T / 2, 3.6, 3.6, 18));
                for (const a of [8, 9.8]) h.line([[a, 1.6], [a, T - 1.6]], 0.6);
            });
            print(c, '#1a1826', 0.1, (h) => {
                h.text('ROMANCERO GITANO', { a: 120, b: T / 2, cap: 6.6, font: ANTON, maxW: 80, track: 0.1 });
                h.line([[82, 2], [82, T - 2]], 0.4);
                h.line([[L - 22, 2], [L - 22, T - 2]], 0.4);
                h.poly(S.curve([[L - 12.4, T / 2 - 3.5], [L - 9, T / 2], [L - 12.4, T / 2 + 3.5], [L - 10.6, T / 2]], true, 4));
            });
        },
        coverPaint(c) {
            // our own design: a red moon bitten by a black one, reeds, five stars; (x across from the spine, y down)
            const { q, P, L, T: D } = c, C = plane(P(L, 0), P.V, [-P.U[0], -P.U[1]]), RED = '#b3262c', BLK = '#1a1826', r = Motion.rng(c.seed + 'lc');
            const cc = { ...c, P: C, L: D, T: L };
            print(cc, BLK, 0.08, (h) => {
                h.box(5, 5, D - 5, L - 5, 1.1);
                h.box(7.4, 7.4, D - 7.4, L - 7.4, 0.3);
                h.text('GARCÍA LORCA', { a: D / 2, b: 19, cap: 7, font: LORA, maxW: D - 26, track: 0.16 });
            });
            print(cc, RED, 0.16, (h) => {
                h.poly(S.ellipse(D / 2 + 3, 72, 32, 32, 48));
                h.line([[16, 28.6], [D - 16, 28.6]], 0.8);
                for (const [x, y, k] of [[20, 44, 2.6], [D - 16, 112, 2], [26, 118, 1.6], [D - 22, 40, 1.5], [D / 2 - 8, 124, 1.2]]) fleuron(h, x, y, k * 1.6, 4, 0);
                h.text('GITANO', { a: D / 2, b: 162, cap: 19, font: SHRIK, maxW: D - 22, track: 0.02 });
            });
            print(cc, BLK, 0.1, (h) => {
                // the black moon over the red one
                const moon = [];
                for (let i = 0; i <= 24; i++) {
                    const t = -1.9 + (i / 24) * 3.6;
                    moon.push([D / 2 - 9 + Math.cos(t) * 25, 66 + Math.sin(t) * 25]);
                }
                for (let i = 24; i >= 0; i--) {
                    const t = -1.9 + (i / 24) * 3.6;
                    moon.push([D / 2 - 20 + Math.cos(t) * 19, 61 + Math.sin(t) * 22]);
                }
                h.poly(moon);
                // reeds on the river bank
                for (let i = 0; i < 7; i++) {
                    const x = 14 + i * 5.2 + r() * 2, top = 70 + r() * 22, lean = (r() - 0.3) * 9;
                    h.line(S.curve([[x, 128], [x + lean * 0.3, (128 + top) / 2], [x + lean, top]], false, 6), 0.9);
                    h.poly(S.curve([[x + lean, top + 1], [x + lean + 1.6, top - 5], [x + lean + 0.6, top - 11], [x + lean - 1.2, top - 5]], true, 4));
                }
                h.line([[10, 129], [D - 10, 129]], 1.2);
                h.text('ROMANCERO', { a: D / 2, b: 141.5, cap: 10.5, font: SHRIK, maxW: D - 22, track: 0.02 });
                h.text('1928', { a: D / 2, b: 179.6, cap: 4, font: LORA, track: 0.3 });
            });
            // handled: a crease across the corner, a soft fold down the middle, the corner turned
            strokePts(q, [C(D - 30, 0), C(D, 34)], 0.5, rgba('#fffdf4', 0.7));
            strokePts(q, [C(D - 29.4, 0.6), C(D - 0.4, 35)], 0.4, rgba('#6a5a48', 0.5));
            strokePts(q, [C(D * 0.55, 0), C(D * 0.52, L)], 5, rgba('#8a7a6a', 0.1));
        },
    };

    // ------------------------------------------------------------------ things between the leaves
    const add2 = (p, v, k = 1) => [p[0] + v[0] * k, p[1] + v[1] * k];
    // a band about a centre line, wf(u) wide at u along it
    const strip = (line, wf) => {
        const n = line.length, Lf = [], Rt = [];
        for (let i = 0; i < n; i++) {
            const a = line[Math.max(0, i - 1)], b = line[Math.min(n - 1, i + 1)], tl = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1, k = wf(i / (n - 1)) / 2;
            Lf.push([line[i][0] - ((b[1] - a[1]) / tl) * k, line[i][1] + ((b[0] - a[0]) / tl) * k]);
            Rt.push([line[i][0] + ((b[1] - a[1]) / tl) * k, line[i][1] - ((b[0] - a[0]) / tl) * k]);
        }
        return [Lf, Rt];
    };
    // A silk register hanging from between the leaves: it turns over once on its way down
    // (its back is duller), and its end is cut in a V and frays.
    function register(g, pts, w, M, seed) {
        const line = S.curve(pts, false, 8), n = line.length, tw = Math.floor(n * 0.55), r = Motion.rng(seed + 'reg');
        const part = (seg, wf, fill, notch) => {
            const [Lf, Rt] = strip(seg, wf), m = seg.length;
            const end = notch ? [add2(seg[m - 1], [seg[m - 1][0] - seg[m - 4][0], seg[m - 1][1] - seg[m - 4][1]], -1.2)] : [];
            const poly = [...Lf, ...end, ...Rt.reverse()];
            S.piece(g, poly, {
                fill, line: 1.1, heavy: 0.6, cast: { blur: 2.2, dx: 1.4, dy: 1.8, color: 'rgba(12,8,30,0.55)' },
                shade: { color: M.deep, alpha: 0.75, w: w * 0.55 }, light: { color: M.light, alpha: 0.6, w: w * 0.3 },
                detail: (q) => {
                    // the weave across, a sheen along
                    for (let i = 1; i < m - 1; i += 1) if (i % 2) strokePts(q, [Lf[i] ?? seg[i], Rt[m - 1 - i] ?? seg[i]], 0.2, rgba(M.deep, 0.3));
                    S.ink(q, seg.slice(2, m - 2).map((p) => [p[0] - w * 0.14, p[1]]), { w: w * 0.2, color: M.light, alpha: 0.55 });
                },
            });
            return [Lf[m - 1] ?? seg[m - 1], seg[m - 1]];
        };
        part(line.slice(0, tw + 1), (u) => w * Math.min(1, (1 - u) * 6 + 0.12), M.base, false);
        part(line.slice(tw), (u) => w * Math.min(1, u * 6 + 0.12), mix(M.base, M.deep, 0.42), true);
        const e = line[n - 1], d = [e[0] - line[n - 3][0], e[1] - line[n - 3][1]], dl = Math.hypot(d[0], d[1]) || 1;
        for (let i = 0; i < 7; i++) {
            const o = (i / 6 - 0.5) * w, p = [e[0] - (d[1] / dl) * o, e[1] + (d[0] / dl) * o];
            S.ink(g, [p, [p[0] + (d[0] / dl) * (1.5 + r() * 2.4) + (r() - 0.5), p[1] + (d[1] / dl) * (1.5 + r() * 2.4)]], { w: 0.4, color: i % 2 ? M.base : M.deep, taper: [0, 1] });
        }
    }
    // a tawed thong: a vellum binding's tie, knotted at its end
    function thong(g, pts, w, seed) {
        const line = S.curve(pts, false, 8), [Lf, Rt] = strip(line, (u) => w * (1 - 0.25 * u));
        S.piece(g, [...Lf, ...Rt.reverse()], { fill: '#e6d3ae', line: 0.9, heavy: 0.6, shade: { color: '#8f7650', alpha: 0.8, w: w * 0.6 }, light: { color: '#fff8e2', alpha: 0.7, w: w * 0.3 }, cast: { blur: 1.6, dx: 1, dy: 1.3, color: 'rgba(12,8,30,0.5)' } });
        const e = line[line.length - 1];
        S.piece(g, S.ellipse(e[0], e[1], w * 0.95, w * 0.75, 12, 0.5), { fill: '#dcc79e', line: 0.8, heavy: 0.6, shade: { color: '#8f7650', alpha: 0.8, w: w * 0.5 }, light: { color: '#fff8e2', alpha: 0.7, w: w * 0.3 } });
        S.ink(g, [add2(e, [w * 0.3, w * 0.4]), add2(e, [w * 0.2, w * 1.8]), add2(e, [-w * 0.3, w * 3])], { w: w * 0.6, color: '#d8c49c', taper: [0, 1] });
    }
    // A carnation pressed between the leaves, gone the colour of old wine: it stands out of
    // the book's head. P: the leaf it lies on (x along the head, y down into the book).
    function pressed(g, P, seed) {
        const r = Motion.rng(seed + 'pressed'), DRY = { deep: '#4a1024', base: '#8e2c3c', light: '#cf8480' };
        const stem = S.curve([P(0, 5), P(0.4, -5), P(-0.5, -13)], false, 6);
        S.ink(g, stem, { w: 2.2, color: INK, taper: [0, 0] });
        S.ink(g, stem, { w: 1.2, color: '#77783e', taper: [0, 0] });
        // two dried leaves, narrow as grass
        for (const sx of [-1, 1]) {
            const lf = S.curve([[0, -2], [sx * 4.5, -6.5], [sx * 9.5, -12 - (sx > 0 ? 2 : 0)], [sx * 4, -5.2]], true, 5).map(([x, y]) => P(x, y));
            S.piece(g, lf, { fill: '#7f8650', line: 0.8, heavy: 0.5, shade: { color: '#3f4a30', alpha: 0.8, w: 1.4 }, light: { color: '#c5c890', alpha: 0.6, w: 0.9 }, cast: { blur: 1.2, dx: 0.6, dy: 0.8, color: 'rgba(12,8,30,0.5)' } });
        }
        const c0 = [-0.5, -20.5];
        const petal = (t, len, wp, tone) => {
            const d = [Math.cos(t), Math.sin(t)], n = [-d[1], d[0]], at = (u, v) => P(c0[0] + d[0] * u + n[0] * v, c0[1] + d[1] * u + n[1] * v);
            const pts = [at(0.5, -0.9), at(len * 0.55, -wp * 0.8), at(len * 0.86, -wp), at(len, -wp * 0.62), at(len - 1.5, -wp * 0.3), at(len + 0.7, 0), at(len - 1.5, wp * 0.3), at(len, wp * 0.62), at(len * 0.86, wp), at(len * 0.55, wp * 0.8), at(0.5, 0.9)];
            S.piece(g, pts, {
                fill: mix(DRY.base, DRY.deep, tone), line: 0.8, heavy: 0.5, shade: { color: DRY.deep, alpha: 0.75, w: wp * 0.9 }, light: { color: DRY.light, alpha: 0.6, w: wp * 0.5 }, cast: { blur: 1.4, dx: 0.7, dy: 0.9, color: 'rgba(20,6,20,0.5)' },
                detail: (q) => {
                    // the veins, and the brown the edges have turned
                    for (const v of [-0.5, 0, 0.5]) S.ink(q, [at(1.5, v * 0.6), at(len * 0.6, v * wp * 1.1), at(len - 1, v * wp * 1.5)], { w: 0.3, color: DRY.deep, alpha: 0.6 });
                    S.spray(q, pts, { color: '#6a4a2a', alpha: 0.5, w: 1.6, dir: [d[0], d[1]] });
                },
            });
        };
        for (let i = 0; i < 6; i++) petal(-Math.PI * (0.12 + 0.152 * i) + (r() - 0.5) * 0.1, 12.5 + r() * 3.5, 3.3 + r(), 0.55);
        for (let i = 0; i < 5; i++) petal(-Math.PI * (0.2 + 0.15 * i) + (r() - 0.5) * 0.12, 9 + r() * 3, 2.8 + r(), 0.12);
        // the calyx: a ribbed tube with its teeth
        const cal = S.curve([[-1.5, -12], [1.2, -12], [2.9, -18.6], [2.4, -22.2], [1.1, -20.6], [-0.4, -22.6], [-1.9, -20.6], [-3.3, -22.2], [-3.6, -18.6]], true, 4).map(([x, y]) => P(x, y));
        S.piece(g, cal, { fill: '#84854a', line: 0.9, heavy: 0.6, shade: { color: '#3f4a30', alpha: 0.8, w: 2 }, light: { color: '#cfd09a', alpha: 0.6, w: 1.2 }, detail: (q) => { for (const x of [-1.4, 0, 1.3]) S.ink(q, [P(x * 0.6, -12.5), P(x, -20)], { w: 0.3, color: '#4a4f2a', alpha: 0.7 }); } });
    }

    // The book fallen open, face down, on top of the pile: an Islamic binding in dark green
    // goatskin. We see its spine along the ridge, the cover that slopes towards us with its
    // gilt star, the leaves fanned in the dark under it, and the envelope flap that wraps
    // the fore-edge: it lies forward on the book below, its point over the edge.
    function tent(g, W, o) {
        const { x0, top, z, L, Wd, T, slope, yaw, seed, edge } = o, M = MAT.green, col = shadeOf(M), paper = shadeOf(PAPER);
        const th = (yaw * Math.PI) / 180, sl = (slope * Math.PI) / 180, cs = Math.cos(sl), sn = Math.sin(sl);
        const ua = [Math.cos(th), 0, Math.sin(th)], uc = [-Math.sin(th), 0, Math.cos(th)];
        const foot = [x0 + L / 2 - (ua[0] * L) / 2, top, z - (ua[2] * L) / 2];
        const ridge = [foot[0] + uc[0] * Wd * cs, top + Wd * sn, foot[2] + uc[2] * Wd * cs];
        const back = [ridge[0] + uc[0] * Wd * cs, top, ridge[2] + uc[2] * Wd * cs];
        const up = W.pv([0, 1, 0]), dn = [-up[0], -up[1]];
        const C = plane(W.pr(ridge), W.pv(ua), W.pv([-uc[0] * cs, -sn, -uc[2] * cs]));   // the cover: a along the ridge, f down the slope
        const tone = W.tone([-uc[0] * sn, cs, -uc[2] * sn]);
        const cast = { blur: 6, dx: 3, dy: 4.5, color: 'rgba(8,8,26,0.6)' };
        const pA = W.pr(ridge), pF = W.pr(foot), pB = W.pr(back), lerp2 = (p, q, t) => [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t];
        // 1 · at the left end, under the boards: the leaves, fanned in the dark
        S.piece(g, [pA, pF, pB], {
            fill: '#191330', line: 1.7, heavy: 0.6, cast,
            detail: (q) => {
                const r = Motion.rng(seed + 'fan');
                fillPts(q, [pA, pB, lerp2(pB, pF, 0.22)], paper(0.56));
                fillPts(q, [pA, lerp2(pB, pF, 0.8), pF], paper(0.44));
                for (let i = 0; i < 30; i++) {
                    const loose = i >= 20, t = i < 10 ? 0.015 + i * 0.022 : i < 20 ? 0.8 + (i - 10) * 0.021 : 0.27 + r() * 0.5, e = lerp2(pB, pF, t);
                    const mid = lerp2(pA, e, 0.55), sag = loose ? 1.5 + r() * 3 : 0.2;
                    S.ink(q, S.curve([pA, [mid[0] - sag * 0.4, mid[1] + sag], e], false, 8), { w: loose ? 0.75 : 0.4, color: loose ? paper(0.5 + r() * 0.25) : i % 2 ? '#56464e' : '#fffaf0', alpha: loose ? 0.95 : 0.6, taper: [0.7, 0] });
                }
                S.spray(q, [pA, pF, pB], { color: '#120e26', alpha: 0.75, w: 8, dir: TOL });
            },
        });
        // 2 · the spine, over the ridge
        const rs = T * 0.44, Sp = plane(add2(pA, up, rs), W.pv(ua), dn), spts = rect(Sp, -0.8, 0, L + 0.8, rs + 1.6, { r: 2.4, wob: 0.3, seed: seed + 'ridge', step: 3 });
        S.piece(g, spts, {
            fill: { from: Sp(0, 0), to: Sp(0, rs + 1.6), stops: [[0, col(0.52)], [0.4, col(0.97)], [1, col(0.78)]] }, line: 1.8, heavy: 0.7, cast,
            detail: (q) => {
                GRAIN.morocco(M)(q, Sp, L, rs + 1.6, seed + 'rg', 1);
                gilt({ q, P: Sp, L, T: rs + 1.6, M, seed: seed + 'rs' }, 0.3, (h) => {
                    for (const a of [5, 7, L - 7, L - 5]) h.line([[a, 0.6], [a, rs + 1]], 0.5);
                    for (let a = 13; a < L - 11; a += 4.4) h.poly([[a - 1.5, rs * 0.52], [a, rs * 0.52 - 1.2], [a + 1.5, rs * 0.52], [a, rs * 0.52 + 1.2]]);
                });
                S.spray(q, spts, { color: M.deep, alpha: 0.6, w: 3 });
                S.spray(q, spts, { color: M.light, alpha: 0.5, w: 2, dir: TOL });
            },
        });
        // 3 · the cover that slopes towards us
        const pts = rect(C, 0, 0, L, Wd, { r: 2, wob: 0.3, seed: seed + 'tc', step: 4 });
        S.piece(g, pts, {
            fill: col(tone), line: 1.9, heavy: 0.8, cast,
            detail: (q) => {
                const cc = { q, P: C, L, T: Wd, M, seed: seed + 'cov', hi: Wd * 0.3 }, mid = L / 2, sy = 42.5, R = 13.6;
                GRAIN.morocco(M)(q, C, L, Wd, seed + 'tg', 0.45);
                blind(cc, (h) => {
                    h.box(2.2, 2.2, L - 2.2, Wd - 2.2, 0.7);
                    for (const [a, f] of [[mid - 33, sy], [mid + 33, sy]]) h.circle(a, f, 7.6, 0.4);
                });
                gilt(cc, 0.26, (h) => {
                    h.box(4.4, 4.4, L - 4.4, Wd - 4.4, 0.85);
                    h.box(6, 6, L - 6, Wd - 6, 0.3);
                    h.box(10.5, 10.5, L - 10.5, Wd - 10.5, 0.5);
                    // a chain of lozenges between the frames
                    for (let a = 12.5; a < L - 11; a += 5) for (const f of [8.25, Wd - 8.25]) h.poly([[a - 1.5, f], [a, f - 1.1], [a + 1.5, f], [a, f + 1.1]]);
                    for (let f = 13.5; f < Wd - 12; f += 5) for (const a of [8.25, L - 8.25]) h.poly([[a - 1.1, f], [a, f - 1.5], [a + 1.1, f], [a, f + 1.5]]);
                    // corner-pieces: a quarter of the star in each corner of the panel
                    for (const [a, f, sa, sf] of [[10.5, 10.5, 1, 1], [L - 10.5, 10.5, -1, 1], [10.5, Wd - 10.5, 1, -1], [L - 10.5, Wd - 10.5, -1, -1]]) {
                        for (const rr of [9, 7.2]) {
                            const arc = [];
                            for (let i = 0; i <= 8; i++) arc.push([a + sa * Math.cos((i / 8) * Math.PI * 0.5) * rr, f + sf * Math.sin((i / 8) * Math.PI * 0.5) * rr]);
                            h.line(arc, rr === 9 ? 0.5 : 0.25);
                        }
                        h.poly(S.curve(lens(a + sa * 0.6, f + sf * 0.6, Math.atan2(sf, sa), 1, 6, 1.3), true, 3));
                        h.dot(a + sa * 4.6, f + sf * 1.6, 0.5);
                        h.dot(a + sa * 1.6, f + sf * 4.6, 0.5);
                    }
                    star8(h, mid, sy, R, 0.7);
                    h.circle(mid, sy, R + 3, 0.35);
                    for (let i = 0; i < 16; i++) h.dot(mid + Math.cos((i / 16) * TAU) * (R + 4.7), sy + Math.sin((i / 16) * TAU) * (R + 4.7), i % 2 ? 0.34 : 0.56);
                    for (const a of [mid - 33, mid + 33]) {
                        star8(h, a, sy, 5.2, 0.4);
                        for (const d of [-9.4, 9.4]) h.poly([[a - 1.2, sy + d], [a, sy + d - 1.7], [a + 1.2, sy + d], [a, sy + d + 1.7]]);
                    }
                });
                gilt(cc, 0.1, (h) => {
                    h.text('IBN HAZM', { a: mid, b: 18.2, cap: 8.4, maxW: L - 50, track: 0.14, sx: 0.86 });
                    h.text('EL COLLAR', { a: mid, b: 65.6, cap: 6.2, maxW: L - 44, track: 0.14, sx: 0.86 });
                    h.text('DE LA PALOMA', { a: mid, b: 74.4, cap: 6.2, maxW: L - 44, track: 0.12, sx: 0.86 });
                });
                gloss(cc, 0.22, 8, L - 8);
                scuff(cc, 1.4, 4, '#9fcfae');
                scuff(cc, Wd - 1.4, 5, '#7fae90');
                S.spray(q, pts, { color: M.deep, alpha: 0.6, w: 9 });
                S.spray(q, pts, { color: mix(M.deep, INK, 0.5), alpha: 0.45, w: 3 });
                S.spray(q, pts, { color: M.light, alpha: 0.5, w: 5, dir: TOL });
            },
        });
        // 4 · the flap: the strip that covers the fore-edge, then the pointed leaf
        const Fp = plane(pF, W.pv(ua), W.pv([-uc[0], 0, -uc[2]]));
        const fold = (a, e) => (e <= edge ? Fp(a, e) : add2(Fp(a, edge), dn, (e - edge) * 0.97));
        fold.pts = (arr) => arr.map(([a, e]) => fold(a, e));
        fold.U = Fp.U;
        fold.V = Fp.V;
        const dense = (pp, step = 2) => pp.flatMap((p, i) => {
            if (i === pp.length - 1) return [p];
            const q = pp[i + 1], n = Math.max(1, Math.round(Math.hypot(q[0] - p[0], q[1] - p[1]) / step)), out = [];
            for (let k = 0; k < n; k++) out.push([p[0] + ((q[0] - p[0]) * k) / n, p[1] + ((q[1] - p[1]) * k) / n]);
            return out;
        });
        const aL = 7, aR = L - 7, mid = L / 2, es = 15, tip = es + 38;
        const shape = (k) => [[aL + k, k * 0.5], [aR - k, k * 0.5], [aR - k, es + k * 0.4], [mid + 4.4, tip - 4.4 - k * 1.2], [mid, tip - k * 1.55], [mid - 4.4, tip - 4.4 - k * 1.2], [aL + k, es + k * 0.4], [aL + k, k * 0.5]];
        const fpts = fold.pts(dense(shape(0)));
        S.piece(g, fpts, {
            fill: col(W.tone([0, 1, 0])), line: 1.7, heavy: 0.8, cast: { blur: 3, dx: 1.6, dy: 2.4, color: 'rgba(8,8,26,0.62)' },
            detail: (q) => {
                GRAIN.morocco(M)(q, Fp, L, tip, seed + 'fg', 0.8);
                // where it turns over the edge of the book below: the hanging point is in less light
                fillPts(q, [Fp(aL - 2, edge), Fp(aR + 2, edge), add2(Fp(aR + 2, edge), dn, 30), add2(Fp(aL - 2, edge), dn, 30)], rgba(mix(M.deep, INK, 0.3), 0.5));
                strokePts(q, [Fp(aL, edge), Fp(aR, edge)], 0.7, rgba(M.light, 0.55));
                // the two folds of the fore-edge strip
                for (const e of [0.9, es]) {
                    strokePts(q, [Fp(aL, e), Fp(aR, e)], 0.6, rgba(mix(M.deep, INK, 0.4), 0.7));
                    strokePts(q, [Fp(aL, e + 0.7), Fp(aR, e + 0.7)], 0.4, rgba(M.light, 0.4));
                }
                stamp(q, fold, [aL, 0, aR, tip], { mode: 'gilt', wear: 0.28, seed: seed + 'flap' }, (h) => {
                    h.line(dense(shape(2.4)), 0.65);
                    h.line(dense(shape(3.9)), 0.25);
                    star8(h, mid, es + 14.5, 7, 0.45);
                    for (const d of [-17, 17]) fleuron(h, mid + d, es + 9.5, 2.6);
                    for (let a = aL + 7; a < aR - 5; a += 4.6) h.poly([[a - 1.5, es * 0.5], [a, es * 0.5 - 1.3], [a + 1.5, es * 0.5], [a, es * 0.5 + 1.3]]);
                });
                S.spray(q, fpts, { color: M.deep, alpha: 0.6, w: 5 });
                S.spray(q, fpts, { color: M.light, alpha: 0.5, w: 3, dir: TOL });
            },
        });
    }

    // The books. World: x right, y up from the ground, z away; the page's origin is the
    // middle of the whole pile.
    function books(g, o = {}) {
        sheet(g, 'books', [172, 216], o, (q, rot, seed) => {
            const W = world(rot, 14, 208);
            // the ten that lie, from the ground up: name, left end of the spine, length, thickness, depth, yaw°, set back
            const pile = [
                ['maimonides', -138, 182, 58, 160, 4, 0], ['gongora', -121, 174, 46, 146, 20, 5], ['arabi', -134, 172, 42, 138, 3, 2], ['seneca', -118, 152, 40, 126, 12, 7],
                ['becquer', -113, 144, 34, 116, 16, 3], ['platero', -128, 154, 34, 120, 9, 6], ['juan', -84, 110, 26, 84, 5, 12],
                ['alberti', -106, 140, 13, 104, 11, 6], ['cernuda', -98, 130, 12, 100, 4, 10], ['zambrano', -102, 136, 13, 102, 7, 7],
            ];
            const bk = {};
            let top = 0;
            for (const [name, x0, L, T, D, yaw, z] of pile) {
                top += T;
                bk[name] = place(W, flat(x0, top, z, yaw, L), { ...SPEC[name], name, seed: seed + '/' + name, L, T, D });
            }
            // the three that stand: where their lower left edge is, how they lean and turn
            const stand = [['irving', 59, 0, 7, 0, 250, 36, 150], ['machado', 95.6, 4, 7, 0, 206, 15, 132], ['lorca', 115, 2, 8.6, 30, 190, 13, 108]];
            for (const [name, xb, z, lean, yaw, L, T, D] of stand) bk[name] = place(W, upright(xb, z, lean, yaw), { ...SPEC[name], name, seed: seed + '/' + name, L, T, D });
            const off = (p, dx, dy) => add2(p, W.pv([dx, -dy, 0]));
            // what is kept between the leaves
            bk.seneca.after = (g2, B) => {
                const p0 = B.end0(30, B.T * 0.48), t1 = B.end0(B.D - 1.5, 1.4), t2 = B.end0(B.D - 1.5, B.T - 1.4);
                register(g2, [[0, 0], [-4, 2], [-7.5, 9], [-7, 22], [-9.5, 36], [-8, 50], [-11, 62], [-9.5, 73]].map(([x, y]) => off(p0, x, y)), 6.2, { deep: '#0b3a2f', base: '#26865c', light: '#8fe0b4' }, B.seed);
                thong(g2, [[0, 0], [-3, 3], [-6.5, 12], [-6, 24], [-8.4, 33]].map(([x, y]) => off(t1, x, y)), 2.5, B.seed);
                thong(g2, [[0, 0], [-4, 2], [-8, 7], [-9, 16], [-7.5, 22]].map(([x, y]) => off(t2, x, y)), 2.5, B.seed);
            };
            bk.arabi.after = (g2, B) => {
                // a slip of paper marking a place: it droops where it leaves the book
                const H = plane(B.at(0, B.T * 0.44, 30), W.pv(neg(B.ua)), W.pv(B.uc)), dn = W.pv([0, -1, 0]);
                const m = (x, y) => add2(H(x, y), dn, Math.max(0, x - 7) * 0.45), pts = [];
                for (const [x, y] of [[0, 0], [5, -0.4], [10, 0.2], [16.4, 0.6], [17, 9], [16.6, 22], [11, 22.6], [5, 22.2], [0, 22]]) pts.push(m(x, y));
                S.piece(g2, pts, {
                    fill: '#efe5c8', line: 1, heavy: 0.6, shade: { color: '#8f84a0', alpha: 0.7, w: 4 }, light: { color: '#fffdf0', alpha: 0.7, w: 2.4 }, cast: { blur: 2.4, dx: 1.4, dy: 2, color: 'rgba(12,8,30,0.55)' },
                    detail: (q2) => {
                        for (const y of [5, 10, 15, 20]) strokePts(q2, [m(0, y), m(8, y), m(17, y)], 0.25, rgba('#5f7fb8', 0.5));
                        strokePts(q2, [m(4, 0), m(4, 22)], 0.3, rgba('#b8504a', 0.55));
                        // a pencilled mark, not words
                        S.ink(q2, S.curve([m(6, 7.4), m(8, 6.4), m(9.6, 8), m(11, 6.6), m(12.6, 8), m(14, 7)], false, 5), { w: 0.45, color: '#4a4658', alpha: 0.8 });
                        S.ink(q2, [m(6.4, 12.6), m(10, 12.2), m(13, 12.8)], { w: 0.4, color: '#4a4658', alpha: 0.7 });
                    },
                });
            };
            bk.lorca.after = (g2, B) => {
                pressed(g2, plane(B.at(B.L, B.T * 0.5, 54), W.pv(B.uc), W.pv(neg(B.ua))), B.seed);
                // the cover's lower corner, turned up: the night shows where it was
                const C = plane(B.coverT(B.L, 0), B.coverT.V, [-B.coverT.U[0], -B.coverT.U[1]]), D = B.D, L = B.L;
                g2.save();
                g2.globalCompositeOperation = 'destination-out';
                fillPts(g2, C.pts([[D + 4, L + 4], [D - 12.4, L + 4], [D - 12.4, L + 0.4], [D + 0.4, L - 15.4], [D + 4, L - 15.4]]), '#000');
                g2.restore();
                S.piece(g2, C.pts([[D - 12.4, L + 0.3], [D + 0.3, L - 15.4], [D - 10.6, L - 12.6]]), { fill: '#f3ead0', line: 1.5, heavy: 0.7, shade: { color: '#8f84a0', alpha: 0.7, w: 4 }, light: { color: '#fffdf2', alpha: 0.7, w: 2 }, cast: { blur: 2.4, dx: 1.4, dy: 2, color: 'rgba(30,22,50,0.5)' } });
            };
            bk.zambrano.after = (g2, B) => tent(g2, W, { x0: -92, top, z: 54, L: 124, Wd: 90, T: 22, slope: 23, yaw: 10, seed: seed + '/hazm', edge: 54 - 8 });
            for (const name of ['maimonides', 'gongora', 'arabi', 'seneca', 'becquer', 'platero', 'irving', 'machado', 'lorca', 'juan', 'alberti', 'cernuda', 'zambrano']) paintBook(q, bk[name]);
        });
    }

    // ------------------------------------------------------------------ lit sprites in the emblem manner
    const even = (b) => {
        const x = Math.floor(b.x / 2) * 2, y = Math.floor(b.y / 2) * 2;
        return { x, y, w: Math.ceil((b.x + b.w - x) / 2) * 2, h: Math.ceil((b.y + b.h - y) / 2) * 2 };
    };
    // The airbrush on a sprite: colour sprayed in from its own edges, `w` units deep, from
    // the side `dir` points to (what Souvenir.spray does for a polygon; after things/ribbon.js).
    function airIn(sp, res, { color, alpha = 0.5, w = 6, push = null, dir = SD }) {
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
    // Lays a sprite at p, turned by rot: its shadow on what is there, its silhouette in ink
    // a line's width bigger (heavier towards the shade), then itself.
    function laid(g, sp, p, rot, { lw = 1.1, heavy = 0.7, cast = null, ink = INK } = {}) {
        const b = sp.box, sil = document.createElement('canvas'), sh = rot2(SD, -rot);
        sil.width = sp.canvas.width;
        sil.height = sp.canvas.height;
        const q = sil.getContext('2d');
        q.drawImage(sp.canvas, 0, 0);
        q.globalCompositeOperation = 'source-in';
        q.fillStyle = ink;
        q.fillRect(0, 0, sil.width, sil.height);
        const at = (c, fn) => {
            c.save();
            c.translate(p[0], p[1]);
            c.rotate(rot);
            fn(c);
            c.restore();
        };
        if (cast) S.cast(g, (c) => at(c, () => c.drawImage(sil, b.x, b.y, b.w, b.h)), cast);
        at(g, () => {
            const d = lw * 0.8;
            for (const [ox, oy] of [[0, 0], [sh[0] * lw * heavy * 0.5, sh[1] * lw * heavy * 0.5], [sh[0] * lw * heavy, sh[1] * lw * heavy]]) {
                for (let k = 0; k < 12; k++) g.drawImage(sil, b.x + ox + Math.cos(k * 0.5236) * d, b.y + oy + Math.sin(k * 0.5236) * d, b.w, b.h);
            }
            g.drawImage(sp.canvas, b.x, b.y, b.w, b.h);
        });
    }
    // a sheet the size of q's own, in the same units: for a part that needs a hole cut in it
    function leaf(q, paint) {
        const cv = document.createElement('canvas'), m = q.getTransform();
        cv.width = q.canvas.width;
        cv.height = q.canvas.height;
        const c = cv.getContext('2d');
        c.setTransform(m);
        paint(c);
        return { canvas: cv, box: { x: -m.e / m.a, y: -m.f / m.d, w: cv.width / m.a, h: cv.height / m.d } };
    }

    // ------------------------------------------------------------------ the palette
    // What a painter in Seville set out about 1620, from the thumb outwards.
    const PIG = [
        { name: 'lead white', used: 1, at: [55, -60], R: 12.4, tail: 15, flat: 0.5, peak: 0.7, scoop: 1, long: 1.12, ramp: [[0, '#5f5a78'], [0.32, '#a29caa'], [0.56, '#dcd5c6'], [0.8, '#f4eddc'], [1, '#fffbf0']], gloss: 0.5 },
        { name: 'yellow ochre', used: 1, at: [27, -68], R: 9.6, tail: 11, flat: 0.55, peak: 1, long: 1, ramp: [[0, '#4a2a12'], [0.35, '#8a5a1c'], [0.6, '#c8922e'], [0.85, '#e6b955'], [1, '#f6da8c']], gloss: 0.6 },
        { name: 'vermilion', used: 1, at: [-2, -70], R: 9.8, tail: 14, flat: 0.62, peak: 1.5, long: 0.94, ramp: [[0, '#4a0c16'], [0.35, '#8f1f1e'], [0.6, '#cf3a26'], [0.85, '#ec6a3c'], [1, '#ffab7a']], gloss: 0.75 },
        { name: 'red lake', at: [-30, -67], R: 9.6, tail: 7, flat: 0.3, peak: 0.3, long: 1.2, ramp: [[0, '#1f0612'], [0.4, '#4d0c22'], [0.65, '#7e1530'], [0.88, '#a8324a'], [1, '#e08a94']], gloss: 1 },
        { name: 'burnt earth', used: 1, at: [-58, -58], R: 9.4, tail: 12, flat: 0.52, peak: 1.1, long: 1.3, ramp: [[0, '#2a0e0c'], [0.35, '#5c2414'], [0.6, '#8f4322'], [0.85, '#b86a3a'], [1, '#e0a070']], gloss: 0.6 },
        { name: 'umber', used: 1, at: [-82, -43], R: 8.6, tail: 8, flat: 0.5, peak: 0.8, long: 0.9, ramp: [[0, '#170d0c'], [0.4, '#38241a'], [0.65, '#574028'], [0.88, '#7d6444'], [1, '#b59c74']], gloss: 0.6 },
        { name: 'bone black', used: 1, at: [-99, -21], R: 8.8, tail: 10, flat: 0.46, peak: 1.2, long: 1.1, ramp: [[0, '#07060d'], [0.4, '#15131d'], [0.65, '#26242f'], [0.88, '#4a4a5e'], [1, '#a9aecb']], gloss: 0.95, glint: '#dfe6ff' },
        { name: 'azurite', at: [-105, 4], R: 5.8, tail: 5, flat: 0.5, peak: 0.6, long: 1, ramp: [[0, '#0c1a3a'], [0.4, '#1c3c70'], [0.65, '#2f65a0'], [0.88, '#5c98c4'], [1, '#b4dcea']], gloss: 0.45 },
    ];
    const MIXC = [-22, 4];   // where the mixing is done
    const MIXES = [   // the passes of a loaded brush, one over another: flesh tints, a rosier one, greys
        { pts: [[-50, -14], [-36, -8], [-22, -10], [-8, -4]], w: 15, col: [229, 180, 150] },
        { pts: [[-44, -1], [-28, 5], [-12, 3], [2, 9]], w: 14, col: [209, 146, 116] },
        { pts: [[-30, -23], [-16, -25], [-4, -19]], w: 10, col: [243, 216, 190] },
        { pts: [[-38, 11], [-24, 17], [-10, 15]], w: 12, col: [214, 128, 112] },
        { pts: [[-6, -7], [6, 1], [12, 13]], w: 11, col: [181, 116, 88] },
        { pts: [[-62, 14], [-48, 22], [-34, 23]], w: 12, col: [158, 151, 142] },
        { pts: [[-46, 31], [-30, 31], [-16, 35]], w: 10, col: [106, 102, 104] },
        { pts: [[-67, -3], [-62, 2], [-57, 7]], w: 9, col: [205, 197, 182] },
        { pts: [[-14, 23], [0, 25], [10, 31]], w: 9, col: [150, 150, 126] },
    ];
    const distSeg = (x, y, a, b) => {
        const dx = b[0] - a[0], dy = b[1] - a[1], u = clamp(((x - a[0]) * dx + (y - a[1]) * dy) / (dx * dx + dy * dy || 1));
        return Math.hypot(x - a[0] - dx * u, y - a[1] - dy * u);
    };

    // One dab of oil paint: a mound set down with the knife (the peak it left as it lifted,
    // the turn it gave the paint) and the bite the brush has been taking out of it, furrowed
    // by the bristles.
    function dabSprite(pig, seed, rot, res) {
        const R = pig.R, pull = Math.atan2(MIXC[1] - pig.at[1], MIXC[0] - pig.at[0]), sd = S.seedOf(seed + pig.name), r = Motion.rng(sd);
        const p1 = r() * 9, p2 = r() * 9, p3 = r() * 9, ea = r() * 3.14, pts = [], n = 48;
        for (let k = 0; k < n; k++) {
            const t = (k / n) * TAU, rr = R * (1 + 0.15 * Math.sin(t * 2 + p1) + 0.09 * Math.sin(t * 3 + p2) + 0.05 * Math.sin(t * 7 + p3));
            pts.push(rot2([Math.cos(t) * rr * pig.long, (Math.sin(t) * rr) / pig.long], ea));
        }
        const out = S.curve(pts, true, 3), px = Math.cos(pull), py = Math.sin(pull);
        const pk = [(r() - 0.5) * R * 0.5 - px * R * 0.25, (r() - 0.5) * R * 0.5 - py * R * 0.25], bite = [px * R * 0.72, py * R * 0.72], bw = pig.scoop ? 0.34 : pig.used ? 0.14 : 0.02;
        const c1 = [pk[0] + Math.cos(ea + 1) * R * 0.3, pk[1] + Math.sin(ea + 1) * R * 0.3], c2 = [c1[0] + Math.cos(ea + 2.2) * R * 0.24, c1[1] + Math.sin(ea + 2.2) * R * 0.24];
        const sp = S.form({
            box: even(S.bbox(out, 4)), res, light: S.lightFor(rot), ramp: pig.ramp, soft: 1, relief: pig.flat, seed: sd,
            mask: (g) => {
                g.beginPath();
                S.trace(g, out);
                g.fill();
            },
            height: (x, y, m) => {
                const d = Math.hypot(x - pk[0], y - pk[1]), db = Math.hypot(x - bite[0], y - bite[1]), across = -x * py + y * px, ang = Math.atan2(y - pk[1], x - pk[0]);
                // the lick the knife left as it lifted: a crest that curls, highest where it began
                const sg = R * R * 0.011, d1 = distSeg(x, y, pk, c1), d2 = distSeg(x, y, c1, c2);
                const peak = R * 0.2 * Math.exp(-(d * d) / (R * R * 0.16)) + pig.peak * R * 0.22 * Math.max(Math.exp(-(d1 * d1) / sg) * (1 - 0.35 * clamp(Math.hypot(x - pk[0], y - pk[1]) / (R * 0.3))), 0.6 * Math.exp(-(d2 * d2) / sg));
                const turn = 0.5 * Math.sin(ang * 2 + d * 0.85) * Math.exp(-(d * d) / (R * R * 0.5)) * m;
                return peak + turn - Math.exp(-(db * db) / (R * R * bw)) * (R * 0.32 + 0.45 * Math.sin(across * 2.5));
            },
            stroke: { amp: 0.05, freq: 0.16, tone: 6 }, mottle: { amp: pig.name === 'azurite' ? 0.12 : 0.04, freq: pig.name === 'azurite' ? 1.2 : 0.3 },
            spec: { amp: pig.gloss, power: 34, from: 0.5, to: 0.92, color: pig.glint ?? '#fffaf0', ragged: 0.2 },
        });
        const sh = rot2(SD, -rot);
        airIn(sp, res, { color: pig.ramp[0][1], alpha: 0.6, w: R * 0.5, dir: sh });
        airIn(sp, res, { color: pig.ramp[4][1], alpha: 0.4, w: R * 0.26, dir: [-sh[0], -sh[1]] });
        return sp;
    }
    // The mixtures: a thin film of paint with the brush's ragged ends and streaks, its colour
    // from whichever pass of the brush lies nearest, one wet tint dragged into the next.
    function mixSprite(seed, rot, res) {
        const sd = S.seedOf(seed + 'mix'), lines = MIXES.map((m) => S.curve(m.pts, false, 10));
        const colAt = (x, y, out) => {
            let sw = 0, cr = 0, cg = 0, cb = 0;
            MIXES.forEach((m, k) => {
                let d = 1e9;
                for (let i = 1; i < m.pts.length; i++) d = Math.min(d, distSeg(x, y, m.pts[i - 1], m.pts[i]));
                d += 3.4 * S.noise2(x * 0.13, y * 0.13, sd + k) + 1.6 * S.noise2(x * 0.5, y * 0.2, sd + k + 20);
                const w = Math.exp(-Math.pow(Math.max(0, d) / (m.w * 0.4), 2) * 1.8) + 1e-5;
                sw += w;
                cr += m.col[0] * w;
                cg += m.col[1] * w;
                cb += m.col[2] * w;
            });
            out[0] = cr / sw;
            out[1] = cg / sw;
            out[2] = cb / sw;
        };
        const col = [0, 0, 0];
        const sp = S.form({
            box: { x: -80, y: -40, w: 106, h: 88 }, res, light: S.lightFor(rot), inflate: 'bevel', R: 1.5, relief: 0.5, seed: sd, soft: 1,
            ramp: [[0, '#2a2030'], [0.5, '#9a9088'], [1, '#ffffff']],
            mask: (g) => {
                // a core, and round it the bristles' own ragged strokes
                g.strokeStyle = '#fff';
                g.lineCap = 'round';
                g.lineJoin = 'round';
                MIXES.forEach((m, i) => {
                    g.lineWidth = m.w * 0.5;
                    g.beginPath();
                    S.trace(g, lines[i], false);
                    g.stroke();
                    S.dab(g, lines[i], { w: m.w * 1.05, color: '#fff', alpha: 1, bristles: Math.round(m.w * 1.7), seed: sd + i, dry: 0.55, taper: 0.5 });
                });
            },
            marks: (g) => {
                // the bristles' streaks along each pass, lighter and darker
                MIXES.forEach((m, i) => {
                    S.dab(g, lines[i], { w: m.w * 0.9, color: '#ffffff', alpha: 0.55, bristles: 9, seed: sd + i + 100, dry: 0.5 });
                    S.dab(g, lines[i].map(([x, y]) => [x + 0.8, y + 1.2]), { w: m.w * 0.9, color: '#000000', alpha: 0.5, bristles: 9, seed: sd + i + 200, dry: 0.5 });
                });
            },
            markAmp: 0.42, spec: { amp: 0.6, power: 30, from: 0.55, to: 0.95, color: '#ffffff' },
            tint: (x, y, tone, rgb) => {
                colAt(x, y, col);
                const lum = (rgb[0] + rgb[1] + rgb[2]) / 765, k = Math.min(1.2, 0.5 + 0.86 * lum), hi = Math.max(0, lum - 0.86) * 520;
                rgb[0] = Math.min(255, col[0] * k + hi);
                rgb[1] = Math.min(255, col[1] * k + hi);
                rgb[2] = Math.min(255, col[2] * k + hi);
            },
        });
        const sh = rot2(SD, -rot);
        airIn(sp, res, { color: '#4a2420', alpha: 0.45, w: 2.2, dir: sh });
        airIn(sp, res, { color: '#fff6e6', alpha: 0.4, w: 1.2, dir: [-sh[0], -sh[1]] });
        return sp;
    }

    function palette(g, o = {}) {
        sheet(g, 'palette', [142, 112], o, (q, rot, seed, res) => {
            const F = (p) => rot2([p[0] - 1, p[1] - 13], rot), Fs = (pts) => pts.map(F), r = Motion.rng('palette/' + seed);
            const WOOD = { deep: '#190b0a', base: '#4c2b1a', light: '#94643a' };
            const OUT = S.curve([[-122, 2], [-114, -38], [-84, -68], [-36, -84], [22, -86], [72, -74], [108, -46], [122, -6], [118, 28], [104, 50], [84, 64], [62, 68], [46, 62], [37, 52], [27, 51], [16, 60], [2, 74], [-30, 83], [-72, 77], [-104, 54], [-118, 28]], true, 8);
            const HC = [66, 35], HOLE = S.ellipse(HC[0], HC[1], 17.5, 12, 30, -0.62);
            const Pw = plane(F([0, 0]), rot2([1, 0], rot), rot2([0, 1], rot)), LIN = { deep: '#57507a', base: '#cfc6b2', light: '#f8f2e2' };   // the board's own axes, for lettering and textures

            // ---- the tools through the thumb hole: [where each passes the hole, its angle, …]
            const tool = (pass, deg) => {
                const a = (deg * Math.PI) / 180, d = [Math.cos(a), Math.sin(a)], n = [-d[1], d[0]];
                return (t, w) => F([HC[0] + pass[0] + d[0] * t + n[0] * w, HC[1] + pass[1] + d[1] * t + n[1] * w]);
            };
            const prof = (at, list) => [...list.map(([t, w]) => at(t, w)), ...list.slice().reverse().map(([t, w]) => at(t, -w))];
            const brush = (c, at, o2, over) => {
                const cast = over ? { blur: 3, dx: 2.4, dy: 3.2, color: 'rgba(10,4,6,0.55)' } : null, tip = o2.len, tb = tip - 35, th = tip - 22;
                const hand = prof(at, [[-66, 0.4], [-65, 1.1], [-40, 1.5], [0, 1.9], [tb * 0.6, 2.1], [tb + 1, 1.9]]);
                S.piece(c, hand, {
                    fill: o2.wood, line: 1.2, heavy: 0.7, cast, shade: { color: mix(o2.wood, '#10060a', 0.75), alpha: 0.85, w: 2 }, light: { color: mix(o2.wood, '#fff0d0', 0.7), alpha: 0.7, w: 1.1 },
                    detail: (cc) => {
                        // fingered: smudges of the colours it has been in
                        const rr = Motion.rng(seed + o2.wood);
                        for (let i = 0; i < 9; i++) {
                            const t = -52 + rr() * (tb + 48), col = [o2.paint, '#d9d2c4', '#57402a', '#cf3a26'][Math.floor(rr() * 4)];
                            fillPts(cc, S.ellipse(...at(t, (rr() - 0.5) * 2.4), 1 + rr() * 2.2, 0.7 + rr(), 10, rr() * 3), rgba(col, 0.5 + rr() * 0.4));
                        }
                        S.ink(cc, [at(-56, -0.5), at(0, -0.9), at(tb - 4, -0.9)], { w: 0.5, color: '#fff3d6', alpha: 0.5 });
                    },
                });
                // the binding: waxed thread, turn by turn
                const bind = prof(at, [[tb, 2.2], [tb + 2, 2.6], [tb + 11, 2.7], [tb + 13, 2.4]]);
                S.piece(c, bind, {
                    fill: '#c9b182', line: 1, heavy: 0.6, cast, shade: { color: '#6a4a24', alpha: 0.85, w: 2.2 }, light: { color: '#fff1c8', alpha: 0.7, w: 1.2 },
                    detail: (cc) => {
                        for (let t = tb + 0.8; t < tb + 13; t += 1.05) {
                            strokePts(cc, [at(t, -3), at(t + 0.5, 3)], 0.34, rgba('#4a3018', 0.75));
                            strokePts(cc, [at(t + 0.5, -3), at(t + 1, 3)], 0.26, rgba('#fff4d4', 0.4));
                        }
                    },
                });
                // the bristles: hog hair, splayed with use, the colour still in them
                const head = S.curve([at(th, 2.3), at(tip - 12, 3.4), at(tip - 3, 2.9), at(tip, 0.4), at(tip - 2.6, -2.7), at(tip - 12, -3.4), at(th, -2.3)], true, 5);
                S.piece(c, head, {
                    fill: '#d8c79c', line: 1.1, heavy: 0.6, cast, shade: { color: '#7a5a34', alpha: 0.8, w: 2.6 }, light: { color: '#fff6da', alpha: 0.6, w: 1.4 },
                    detail: (cc) => {
                        const rr = Motion.rng(seed + o2.paint);
                        // loaded: the paint reaches a ragged way up the hair
                        const load = [];
                        for (let k = 0; k <= 10; k++) load.push(at(tip - 9 - rr() * 5, -4 + k * 0.8));
                        fillPts(cc, [...load, at(tip + 2, 4), at(tip + 2, -4)], o2.paint);
                        for (let k = 0; k < 15; k++) {
                            const w0 = -2.1 + (k / 14) * 4.2, w1 = w0 * 1.45 + (rr() - 0.5) * 0.5;
                            strokePts(cc, [at(th + 0.5, w0), at(tip - 8, w1), at(tip - 0.6 - rr() * 2.5, w1 * 0.86)], 0.26, rgba(k % 3 ? '#5a4024' : '#fffbe8', 0.5));
                        }
                        fillPts(cc, S.ellipse(...at(tip - 4.4, -0.9), 2.2, 1, 10, Math.atan2(at(1, 0)[1] - at(0, 0)[1], at(1, 0)[0] - at(0, 0)[0])), rgba('#fff8ea', 0.5));
                        S.spray(cc, head, { color: mix(o2.paint, '#14060a', 0.6), alpha: 0.6, w: 2 });
                    },
                });
            };
            const knife = (c, at, over) => {
                const cast = over ? { blur: 3, dx: 2.4, dy: 3.2, color: 'rgba(10,4,6,0.55)' } : null;
                // the blade: ground thin, a wipe of flesh colour left on it
                const blade = S.curve([at(27, 1.8), at(38, 3.5), at(52, 3.3), at(65, 2), at(73.5, 0.3), at(66, -1.6), at(52, -2.6), at(38, -2.8), at(27, -1.8)], true, 5);
                S.piece(c, blade, {
                    fill: '#aab3ca', line: 1.2, heavy: 0.7, cast, shade: { color: '#333a60', alpha: 0.85, w: 2.6 }, light: { color: '#f4f7ff', alpha: 0.9, w: 1.6 },
                    detail: (cc) => {
                        S.ink(cc, [at(30, -0.9), at(52, -1.2), at(70, -0.2)], { w: 1.1, color: '#ffffff', alpha: 0.85 });
                        S.ink(cc, [at(31, 1.7), at(52, 2), at(66, 1)], { w: 0.5, color: '#2a3158', alpha: 0.6 });
                        brushed(cc, [at(48, 2.4), at(58, 0.6), at(69, 0.4)], { w: 4.4, color: '#d99a7c', alpha: 0.9, bristles: 6, seed: seed + 'kn', dry: 0.5 });
                        for (let i = 0; i < 7; i++) strokePts(cc, [at(31 + i * 5, -2.4), at(32.6 + i * 5, 2.6)], 0.2, rgba('#39406a', 0.3));
                    },
                });
                // the bolster, of brass
                S.piece(c, prof(at, [[20, 3.3], [22, 3.8], [26, 3.6], [28, 2.4]]), { fill: GOLD.base, line: 1, heavy: 0.6, cast, shade: { color: GOLD.deep, alpha: 0.9, w: 2.4 }, light: { color: GOLD.glint, alpha: 0.9, w: 1.2 } });
                const hand = S.curve([at(20, 3.1), at(-10, 3.5), at(-50, 3.6), at(-70, 3.2), at(-76.5, 0), at(-70, -3.2), at(-50, -3.6), at(-10, -3.5), at(20, -3.1)], true, 5);
                S.piece(c, hand, {
                    fill: '#6b3a22', line: 1.2, heavy: 0.7, cast, shade: { color: '#24100c', alpha: 0.85, w: 3 }, light: { color: '#c98a56', alpha: 0.7, w: 1.6 },
                    detail: (cc) => {
                        for (let i = 0; i < 6; i++) S.ink(cc, [at(-74, -2.6 + i), at(-30, -2.9 + i * 1.1), at(18, -2.5 + i)], { w: 0.3, color: i % 2 ? '#2e150e' : '#b47848', alpha: 0.5 });
                        for (const t of [-52, -8]) {
                            fillPts(cc, S.ellipse(...at(t, 0), 1.3, 1.3, 10), GOLD.deep);
                            fillPts(cc, S.ellipse(...at(t - 0.3, -0.3), 0.7, 0.7, 8), GOLD.light);
                        }
                    },
                });
            };
            const ANG = [-27, -38, -52, -66];
            const TOOLS = [
                (c, over) => knife(c, tool([6, 4.5], ANG[0]), over),
                (c, over) => brush(c, tool([2.5, 1.5], ANG[1]), { wood: '#8a5a2c', paint: '#e3b092', len: 80 }, over),
                (c, over) => brush(c, tool([-2, -0.5], ANG[2]), { wood: '#3c1f18', paint: '#cf3a26', len: 92 }, over),
                (c, over) => brush(c, tool([-6.5, -2], ANG[3]), { wood: '#b08a4e', paint: '#574028', len: 97 }, over),
            ];
            // 0 · the rag, held under the board's near edge: a square of old linen crumpled into
            // facets that meet at the place where it is pinned, stiff with what was wiped on it
            const RAGO = [[-98, 22], [-122, 26], [-139, 36], [-143, 54], [-133, 66], [-127, 80], [-133, 97], [-118, 103], [-104, 101], [-86, 113], [-68, 104], [-52, 98], [-35, 105], [-29, 88], [-40, 70], [-56, 52], [-74, 36]], hub = [-97, 67];
            const ragPts = Fs(S.curve(RAGO, true, 3));
            S.piece(q, ragPts, {
                fill: LIN.base, line: 1.7, heavy: 0.8,
                detail: (cc) => {
                    const rr = Motion.rng(seed + 'rag'), n = RAGO.length, hp = F(hub);
                    // each facet slopes from one crease to the next: light at one, shade at the other
                    for (let i = 0; i < n; i++) {
                        const a = RAGO[i], b = RAGO[(i + 1) % n], fa = F(a), fb = F(b), mid = F([(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]);
                        const lit = clamp(0.5 + 0.5 * (((mid[0] - hp[0]) * TOL[0] + (mid[1] - hp[1]) * TOL[1]) / (Math.hypot(mid[0] - hp[0], mid[1] - hp[1]) || 1))), up = i % 2 === 0;
                        const gr = cc.createLinearGradient(...(up ? fa : fb), ...(up ? fb : fa));
                        gr.addColorStop(0, mix(LIN.base, LIN.light, 0.3 + 0.6 * lit));
                        gr.addColorStop(0.5, mix(LIN.base, LIN.deep, 0.14 + 0.24 * (1 - lit)));
                        gr.addColorStop(1, mix(LIN.base, LIN.deep, 0.42 + 0.4 * (1 - lit)));
                        fillPts(cc, [hp, fa, fb], gr);
                    }
                    // the weave, thread by thread, on the bias
                    const bb = S.bbox(ragPts), Pr = plane([bb.x + bb.w / 2, bb.y + bb.h / 2], rot2([1, 0], rot + 0.6), rot2([0, 1], rot + 0.6)), m = (bb.w + bb.h) * 0.75;
                    for (let a = -m; a < m; a += 1.3) {
                        strokePts(cc, [Pr(a, -m), Pr(a + (rr() - 0.5), m)], 0.24, rgba(LIN.deep, 0.28));
                        strokePts(cc, [Pr(-m, a), Pr(m, a + (rr() - 0.5))], 0.24, rgba('#fffaf0', 0.26));
                    }
                    // what was wiped on it: a stroke of the thumb through each colour, and its stain round it
                    for (const [x, y, col, sw, a] of [[-127, 46, '#cf3a26', 7, 0.5], [-117, 85, '#c8922e', 6.4, 1.2], [-94, 95, '#7e1530', 6, 0.3], [-66, 93, '#26242f', 5.4, 2.5], [-131, 68, '#e3b092', 5.6, 1.9], [-103, 82, '#dcd5c6', 5, 0.9], [-47, 92, '#2f65a0', 4.2, 1.4], [-113, 40, '#9c958c', 5.4, 2.8], [-80, 100, '#57402a', 4.6, 0.2], [-120, 62, '#8f4322', 4.6, 2.2]]) {
                        fillPts(cc, S.ellipse(...F([x, y]), sw * 0.8, sw * 0.55, 14, a + rot), rgba(col, 0.38));
                        brushed(cc, Fs([[x - Math.cos(a) * sw, y - Math.sin(a) * sw], [x + 0.6, y + 0.8], [x + Math.cos(a) * sw, y + Math.sin(a) * sw]]), { w: sw * 0.95, color: col, alpha: 0.95, bristles: 9, seed: seed + col + x, dry: 0.5 });
                    }
                    // the creases: every one a dark line with a light beside it, dying out before the hem
                    for (let i = 0; i < n; i++) {
                        const v = RAGO[i], u = 0.55 + rr() * 0.4, u0 = i % 3 === 1 ? 0.3 + rr() * 0.2 : 0, at = (k) => [hub[0] + (v[0] - hub[0]) * k, hub[1] + (v[1] - hub[1]) * k];
                        if (i % 5 === 3) continue;
                        const e = at(u), b = at(u0), mid = [(b[0] + e[0]) / 2 + (rr() - 0.5) * 7, (b[1] + e[1]) / 2 + (rr() - 0.5) * 7];
                        const ln = Fs(S.curve([b, mid, e], false, 8));
                        strokePts(cc, ln.map(([x, y]) => [x + SD[0] * 1.6, y + SD[1] * 1.6]), 3.4, rgba('#4a4468', 0.16));
                        S.ink(cc, ln, { w: 0.8 + (i % 3) * 0.35, color: '#3c3654', alpha: 0.75, taper: [u0 ? 1 : 0, 1] });
                        S.ink(cc, ln.map(([x, y]) => [x + TOL[0] * 1.1, y + TOL[1] * 1.1]), { w: 0.6, color: '#fffdf4', alpha: 0.2 + rr() * 0.3, taper: [u0 ? 1 : 0, 1] });
                    }
                    // and the small cross folds between them
                    for (let i = 0; i < 9; i++) {
                        const k = Math.floor(rr() * n), a = RAGO[k], b = RAGO[(k + 1) % n], ua = 0.4 + rr() * 0.45, ub = 0.4 + rr() * 0.45;
                        const p0 = [hub[0] + (a[0] - hub[0]) * ua, hub[1] + (a[1] - hub[1]) * ua], p1 = [hub[0] + (b[0] - hub[0]) * ub, hub[1] + (b[1] - hub[1]) * ub];
                        const ln = Fs(S.curve([p0, [(p0[0] + p1[0]) / 2 + (rr() - 0.5) * 4, (p0[1] + p1[1]) / 2 + (rr() - 0.5) * 4], p1], false, 6));
                        S.ink(cc, ln, { w: 0.7, color: '#4a4468', alpha: 0.6 });
                        S.ink(cc, ln.map(([x, y]) => [x + TOL[0], y + TOL[1]]), { w: 0.5, color: '#fffdf4', alpha: 0.5 });
                    }
                    S.spray(cc, ragPts, { color: LIN.deep, alpha: 0.7, w: 9 });
                    S.spray(cc, ragPts, { color: '#2a2444', alpha: 0.5, w: 3 });
                    S.spray(cc, ragPts, { color: LIN.light, alpha: 0.7, w: 5, dir: TOL });
                },
            });
            // threads working loose from the hem
            for (let i = 0; i < 22; i++) {
                const k = 5 + Math.floor(r() * 8), a = RAGO[k], b = RAGO[k + 1], u = r(), x = a[0] + (b[0] - a[0]) * u, y = a[1] + (b[1] - a[1]) * u, l = 3 + r() * 5.5, t = Math.atan2(y - hub[1], x - hub[0]) + (r() - 0.5) * 1.4;
                S.ink(q, Fs(S.curve([[x, y], [x + Math.cos(t) * l * 0.5 + (r() - 0.5) * 2.4, y + Math.sin(t) * l * 0.5 + (r() - 0.5) * 2.4], [x + Math.cos(t) * l, y + Math.sin(t) * l]], false, 4)), { w: 0.55, color: i % 3 ? '#d8cfbc' : '#8f88a0', taper: [0, 1] });
            }

            // 1 · the tools: the halves under the board
            TOOLS.forEach((t) => t(q, false));

            // 2 · the board's under side, a board's thickness towards the shade
            const TH = 3.4, drop = (pts) => pts.map(([x, y]) => [x + SD[0] * TH, y + SD[1] * TH]);
            const cut = (c, pts) => {
                c.save();
                c.globalCompositeOperation = 'destination-out';
                fillPts(c, pts, '#000');
                c.restore();
            };
            const put = (lf, cast) => {
                if (cast) S.cast(q, (c) => c.drawImage(lf.canvas, lf.box.x, lf.box.y, lf.box.w, lf.box.h), cast);
                q.drawImage(lf.canvas, lf.box.x, lf.box.y, lf.box.w, lf.box.h);
            };
            put(leaf(q, (c) => {
                S.piece(c, drop(Fs(OUT)), { fill: mix(WOOD.deep, WOOD.base, 0.35), line: 2, heavy: 0.6, light: { color: WOOD.light, alpha: 0.4, w: 2.4, dir: SD } });
                cut(c, drop(Fs(HOLE)));
            }), { blur: 4, dx: 2, dy: 3, color: 'rgba(10,4,6,0.6)' });

            // 3 · the board
            put(leaf(q, (c) => {
                const pts = Fs(OUT), bb = S.bbox(pts);
                S.piece(c, pts, {
                    fill: { from: [bb.x, bb.y], to: [bb.x + bb.w, bb.y + bb.h], stops: [[0, mix(WOOD.base, WOOD.light, 0.5)], [0.45, WOOD.base], [1, mix(WOOD.base, WOOD.deep, 0.55)]] }, line: 2.2, heavy: 0.9,
                    detail: (cc) => {
                        const rr = Motion.rng(seed + 'wood');
                        // walnut: the grain runs the long way, in waves; a flame figure near the middle
                        for (let j = 0; j < 58; j++) {
                            const y0 = -90 + j * 3.1 + rr() * 2, ln = [], ph = rr() * 6, dark = rr() < 0.62;
                            for (let x = -128; x <= 128; x += 8) ln.push(F([x, y0 + 3.4 * Math.sin(x * 0.018 + ph) + 1.6 * Math.sin(x * 0.05 + j) + 9 * Math.exp(-Math.pow((x + 30) / 50, 2)) * Math.sin(j * 0.33)]));
                            strokePts(cc, ln, 0.3 + rr() * 0.7, rgba(dark ? WOOD.deep : WOOD.light, dark ? 0.3 + rr() * 0.3 : 0.14 + rr() * 0.16));
                        }
                        for (let i = 0; i < 260; i++) {
                            const x = -124 + rr() * 248, y = -88 + rr() * 174, l = 1.5 + rr() * 5;
                            strokePts(cc, [F([x, y]), F([x + l, y + (rr() - 0.5) * 0.5])], 0.3, rgba(WOOD.deep, 0.5));
                        }
                        // dark with old oil: soaked deepest round the colours and where the mixing is done
                        blot(cc, Pw.sub(-125, -90), 250, 180, seed + 'oil', 30, ['#0e0606', '#1a0a08', '#6a3c20'], 0.42, [10, 34]);
                        blot(cc, Pw.sub(-112, -84), 190, 46, seed + 'oil2', 16, ['#0e0606'], 0.5, [10, 24]);
                        // pale where the thumb and the heel of the hand have rubbed it for years
                        for (const [x, y, R] of [[HC[0] - 6, HC[1] + 2, 34], [96, 20, 26], [40, 66, 20]]) {
                            const p = F([x, y]), gr = cc.createRadialGradient(p[0], p[1], 2, p[0], p[1], R);
                            gr.addColorStop(0, rgba('#c08a58', 0.5));
                            gr.addColorStop(1, rgba('#c08a58', 0));
                            cc.fillStyle = gr;
                            cc.fillRect(p[0] - R, p[1] - R, R * 2, R * 2);
                        }
                        // the knife's scrapes where old paint was lifted, and what it left in the grain
                        for (let k = 0; k < 5; k++) {
                            const x = -66 + rr() * 80, y = -34 + rr() * 80, a = -0.5 + rr() * 0.5, l = 14 + rr() * 16;
                            for (let i = 0; i < 6; i++) strokePts(cc, [F([x + i * 0.9, y + i * 1.3]), F([x + i * 0.9 + Math.cos(a) * l, y + i * 1.3 + Math.sin(a) * l])], 0.28, rgba(i % 2 ? '#d8b088' : '#12080a', 0.3));
                        }
                        for (let i = 0; i < 150; i++) {
                            const x = -112 + rr() * 150, y = -80 + rr() * 130, pg = PIG[Math.floor(rr() * PIG.length)];
                            fillPts(cc, S.ellipse(...F([x, y]), 0.4 + rr() * 1.2, 0.3 + rr() * 0.6, 8, rr() * 3), rgba(pg.ramp[2][1], 0.3 + rr() * 0.4));
                        }
                        // the bevel: the airbrush from both sides
                        S.spray(cc, pts, { color: WOOD.deep, alpha: 0.85, w: 12 });
                        S.spray(cc, pts, { color: '#0c0508', alpha: 0.6, w: 4 });
                        S.spray(cc, pts, { color: '#e0a878', alpha: 0.75, w: 3.4, dir: TOL });
                        S.spray(cc, pts, { color: WOOD.light, alpha: 0.5, w: 12, dir: TOL });
                        // the owner's mark, burnt in with a hot iron
                        stamp(cc, Pw.sub(-14, 66, 0.1), [-12, -5, 12, 5], { mode: 'ink', color: 'rgba(14,6,6,0.82)', wear: 0.3, seed: seed + 'mark' }, (h) => {
                            h.text('D·V', { a: 0, b: 0, cap: 6, font: FELL, track: 0.16 });
                            h.box(-11, -5, 11, 5, 0.5);
                        });
                    },
                });
                cut(c, Fs(HOLE));
                // the hole's rim: worn round, lit where it faces the light
                const hp = Fs(HOLE);
                strokePts(c, hp, 1.5, INK, true);
                strokePts(c, hp.map(([x, y]) => [x + SD[0] * 1.3, y + SD[1] * 1.3]).filter((p, i) => i > 3 && i < 17), 1, rgba('#e0a878', 0.8));
            }), { blur: 2.2, dx: 1.2, dy: 1.6, color: 'rgba(10,4,6,0.5)' });

            // 4 · the paint. Under each fresh dab, the skin of what dried there before
            PIG.forEach((pg, i) => {
                const rr = Motion.rng(seed + 'skin' + i), sk = [], n = 16, c0 = [pg.at[0] + (rr() - 0.5) * 5, pg.at[1] + (rr() - 0.5) * 5];
                for (let k = 0; k < n; k++) sk.push([c0[0] + Math.cos((k / n) * TAU) * pg.R * (1.25 + rr() * 0.5), c0[1] + Math.sin((k / n) * TAU) * pg.R * (1.15 + rr() * 0.45)]);
                const sp = Fs(S.curve(sk, true, 4));
                S.piece(q, sp, {
                    fill: mix(pg.ramp[1][1], '#1a0c0a', 0.35), line: 0.7, heavy: 0.4, ink: '#12080a', shade: { color: '#0c0508', alpha: 0.6, w: 3 }, light: { color: pg.ramp[2][1], alpha: 0.5, w: 2 },
                    detail: (cc) => {
                        // cracked like dry mud, and dusty
                        for (let k = 0; k < 7; k++) {
                            const a = rr() * TAU, p0 = [c0[0] + Math.cos(a) * pg.R * 0.9, c0[1] + Math.sin(a) * pg.R * 0.9];
                            S.ink(cc, Fs([p0, [p0[0] + Math.cos(a + 0.4) * 3, p0[1] + Math.sin(a + 0.4) * 3], [p0[0] + Math.cos(a) * 6.5, p0[1] + Math.sin(a) * 6.5]]), { w: 0.4, color: '#0c0508', alpha: 0.7 });
                        }
                        for (let k = 0; k < 24; k++) fillPts(cc, S.ellipse(...F([c0[0] + (rr() - 0.5) * pg.R * 3, c0[1] + (rr() - 0.5) * pg.R * 3]), 0.3 + rr() * 0.5, 0.3, 6), rgba(pg.ramp[3][1], 0.4));
                    },
                });
            });
            // thin scrapings round the mixtures, the wood showing through, and where the brush dragged each colour inwards
            MIXES.forEach((m, i) => brushed(q, Fs(m.pts.map(([x, y]) => [x + 5 - i, y + 5.5])), { w: m.w * 1.2, color: `rgb(${m.col.join(',')})`, alpha: 0.5, bristles: 12, seed: seed + 'scr' + i, dry: 0.8 }));
            PIG.forEach((pg, i) => {
                if (!pg.used) return;
                const a = Math.atan2(MIXC[1] - pg.at[1], MIXC[0] - pg.at[0]), d = [Math.cos(a), Math.sin(a)], n = [-d[1], d[0]], k = (i % 2 ? 1 : -1) * (3 + pg.tail * 0.3), far = pg.R + pg.tail * 2;
                const ln = [[pg.at[0] + d[0] * pg.R * 0.5, pg.at[1] + d[1] * pg.R * 0.5], [pg.at[0] + d[0] * far * 0.6 + n[0] * k, pg.at[1] + d[1] * far * 0.6 + n[1] * k], [pg.at[0] + d[0] * far + n[0] * k * 0.4, pg.at[1] + d[1] * far + n[1] * k * 0.4]];
                const body = S.curve(ln, false, 8), [bl, br] = strip(body, (u) => pg.R * 0.95 * (1 - u * 0.75));
                fillPts(q, Fs([...bl, ...br.reverse()]), rgba(pg.ramp[1][1], 0.55));
                brushed(q, Fs(ln), { w: pg.R * 1.15, color: pg.ramp[2][1], alpha: 0.9, bristles: 22, seed: seed + 'pull' + i, dry: 0.6, taper: 0.75 });
                brushed(q, Fs(ln.map(([x, y]) => [x - 0.8, y - 0.8])), { w: pg.R * 0.6, color: pg.ramp[3][1], alpha: 0.7, bristles: 6, seed: seed + 'pull2' + i, dry: 0.8 });
                brushed(q, Fs(ln.map(([x, y]) => [x + 1, y + 1.2])), { w: pg.R * 0.5, color: pg.ramp[1][1], alpha: 0.6, bristles: 5, seed: seed + 'pull3' + i, dry: 0.8 });
            });
            const paintCast = { blur: 1.6, dx: 1, dy: 1.4, color: 'rgba(10,4,6,0.6)' };
            laid(q, mixSprite(seed, rot, res), F([0, 0]), rot, { lw: 0.55, heavy: 0.6, cast: paintCast, ink: '#3a1c1c' });
            PIG.forEach((pg) => laid(q, dabSprite(pg, seed, rot, res), F(pg.at), rot, { lw: 1, heavy: 0.7, cast: { ...paintCast, blur: 2.2, dx: 1.6, dy: 2.2 }, ink: mix(pg.ramp[0][1], INK, 0.5) }));
            // a second, smaller scoop beside two of them
            for (const [i, dx, dy, k] of [[1, 12, 7, 0.5], [4, -4, 13, 0.46]]) {
                const pg = PIG[i];
                laid(q, dabSprite({ ...pg, name: pg.name + '2', R: pg.R * k, at: [pg.at[0] + dx, pg.at[1] + dy], peak: 1.3 }, seed, rot, res), F([pg.at[0] + dx, pg.at[1] + dy]), rot, { lw: 0.9, heavy: 0.7, cast: paintCast, ink: mix(pg.ramp[0][1], INK, 0.5) });
            }
            // a thumbprint in vermilion at the edge, drips of oil
            const tp = Pw.sub(92, -34, 0.5);
            stamp(q, tp, [-6, -8, 6, 8], { mode: 'ink', color: 'rgba(207,58,38,0.62)', wear: 0.35, seed: seed + 'thumb' }, (h) => {
                for (let k = 1; k < 6; k++) h.line(S.ellipse(0, 1.2 - k * 0.2, k * 0.95, k * 1.35, 18).concat([[k * 0.95, 1.2 - k * 0.2]]), 0.42);
            });
            for (let i = 0; i < 9; i++) {
                const p = F([-20 + r() * 110, -40 + r() * 100]), R = 0.8 + r() * 1.6;
                disc(q, p, R, rgba('#120808', 0.5));
                disc(q, [p[0] + TOL[0] * R * 0.3, p[1] + TOL[1] * R * 0.3], R * 0.3, rgba('#f0c090', 0.6));
            }

            // 6 · the tools again, from the hole upwards: over the board, shading it
            TOOLS.forEach((t, i) => {
                const a = (ANG[i] * Math.PI) / 180, d = [Math.cos(a), Math.sin(a)], n = [-d[1], d[0]], c0 = [HC[0] - d[0] * 2, HC[1] - d[1] * 2];
                q.save();
                q.beginPath();
                S.trace(q, Fs([[c0[0] + n[0] * 300, c0[1] + n[1] * 300], [c0[0] - n[0] * 300, c0[1] - n[1] * 300], [c0[0] - n[0] * 300 + d[0] * 400, c0[1] - n[1] * 300 + d[1] * 400], [c0[0] + n[0] * 300 + d[0] * 400, c0[1] + n[1] * 300 + d[1] * 400]]));
                q.clip();
                t(q, true);
                q.restore();
            });
        });
    }

    // ------------------------------------------------------------------ the score
    // Treble clef and bass clef as a pen draws them, in stave spaces (y = 0 the top line).
    const GCLEF = [[-0.75, 5.0], [-0.5, 5.6], [0.1, 5.75], [0.5, 5.2], [0.42, 4.2], [0.2, 2.6], [0, 0.8], [-0.1, -0.6], [0.15, -1.45], [0.55, -1.55], [0.78, -0.9], [0.6, 0], [0, 0.95], [-0.7, 1.9], [-1.1, 2.9], [-0.8, 3.8], [0, 4.2], [0.9, 3.9], [1.25, 3.1], [0.95, 2.35], [0.3, 2.1], [-0.3, 2.45], [-0.45, 3.05], [-0.1, 3.45], [0.3, 3.3]];
    const FCLEF = [[-0.85, 1.15], [-0.6, 0.5], [0.2, 0.15], [0.95, 0.7], [1.05, 1.7], [0.5, 2.8], [-0.3, 3.5], [-1.1, 4]];
    function score(g, o = {}) {
        sheet(g, 'score', [128, 96], o, (q, rot, seed) => {
            const tilt = rot - 0.07, W = 232, H = 166, P = plane(rot2([-W / 2, -H / 2], tilt), rot2([1, 0], tilt), rot2([0, 1], tilt));
            const r = Motion.rng('score/' + seed), PAP = { deep: '#6b6283', base: '#e2d5b0', light: '#fbf3da' }, INKC = '#2a1e26', GAP = 3.1;
            // the sheet: its edges a little wavy, a nick in the left one, the top right corner gone into a roll
            const RA = [W - 44, 0], RB = [W, 46], out = [];
            for (let a = 0; a <= RA[0]; a += 8) out.push([a, 1.6 * Math.sin((a / W) * 4.4) - 0.6]);
            out.push(RA, RB);
            for (let b = RB[1] + 8; b <= H; b += 8) out.push([W + 1.4 * Math.sin((b / H) * 5), b]);
            for (let a = W - 8; a >= 0; a -= 8) out.push([a, H + 1.8 * Math.sin((a / W) * 5.2 + 1)]);
            for (let b = H - 8; b > 0; b -= 8) out.push(...(Math.abs(b - 102) < 4 ? [[0.4, b + 3], [3.6, b + 0.6], [0.2, b - 1.6]] : [[1.2 * Math.sin((b / H) * 6), b]]));
            const pts = P.pts(out);
            S.piece(q, pts, {
                fill: { from: P(0, 0), to: P(W, H), stops: [[0, PAP.light], [0.5, mix(PAP.base, PAP.light, 0.45)], [1, PAP.base]] }, line: 2, heavy: 0.8,
                detail: (c) => {
                    GRAIN.paper(PAP, 0.45)(c, P, W, H, seed + 'pap', 1);
                    // laid paper: the wires of the mould, close together, and its chains
                    for (let a = 1; a < W; a += 2.1) strokePts(c, [P(a, 0), P(a + 0.4, H)], 0.22, rgba('#8a7650', a % 21 < 2.1 ? 0.2 : 0.08));
                    // a ring of damp, an old fold down the middle and one across
                    const st = P(44, 138), gr = c.createRadialGradient(st[0], st[1], 13, st[0], st[1], 22);
                    gr.addColorStop(0, rgba('#a8824a', 0));
                    gr.addColorStop(0.75, rgba('#a8824a', 0.14));
                    gr.addColorStop(0.9, rgba('#7a5a2c', 0.26));
                    gr.addColorStop(1, rgba('#a8824a', 0));
                    c.fillStyle = gr;
                    c.fillRect(st[0] - 24, st[1] - 24, 48, 48);
                    for (const [p0, p1] of [[[W * 0.52, 0], [W * 0.51, H]], [[0, H * 0.53], [W, H * 0.52]]]) {
                        strokePts(c, [P(...p0), P(...p1)], 2.4, rgba('#7a708c', 0.14));
                        strokePts(c, [P(p0[0] - 0.5, p0[1] - 0.5), P(p1[0] - 0.5, p1[1] - 0.5)], 0.4, rgba('#fffdf2', 0.8));
                        strokePts(c, [P(p0[0] + 0.4, p0[1] + 0.4), P(p1[0] + 0.4, p1[1] + 0.4)], 0.35, rgba('#6a5a48', 0.5));
                    }
                    // the sheet buckles: two soft valleys run across it, parallel to the roll
                    const bg = c.createLinearGradient(...P(10, H - 10), ...P(W - 30, 26));
                    for (const [u, col, a] of [[0, '#fffdf2', 0.3], [0.2, '#7a708c', 0.2], [0.42, '#fffdf2', 0.34], [0.66, '#7a708c', 0.24], [0.86, '#fffdf2', 0.3], [1, '#7a708c', 0.3]]) bg.addColorStop(u, rgba(col, a));
                    fillPts(c, pts, bg);

                    // ---- the writing
                    const write = (color, wear, twice) => stamp(c, P, [0, 0, W, H], { mode: 'ink', color, wear, seed: seed + color + wear }, (h) => {
                        const stave = (b0, k) => {
                            const wob = (a) => 0.4 * S.noise2(a * 0.03, k * 3.7, 11) + 0.12 * S.noise2(a * 0.2, k, 12);
                            const Y = (pos, a) => b0 + 4 * GAP - (pos * GAP) / 2 + wob(a);
                            const st2 = {
                                Y, b0, wob,
                                // the rastrum's five nibs waver together and each leaves a bead where it started
                                rule(a0, a1) {
                                    for (let i = 0; i < 5; i++) {
                                        const ln = [];
                                        for (let a = a0 - (i % 2) * 0.9; a <= a1 + ((i * 7) % 5) * 0.4; a += 5) ln.push([a, b0 + i * GAP + wob(a)]);
                                        h.line(ln, 0.34 + 0.07 * Math.sin(i * 2.1 + k));
                                        h.dot(ln[0][0], ln[0][1], 0.44);
                                    }
                                },
                                head(a, pos, open = false) {
                                    const y = Y(pos, a), e = S.ellipse(a, y, 1.95, 1.32, 14, -0.42);
                                    if (open) h.line([...e, e[0]], 0.6);
                                    else h.poly(e);
                                    for (let p = -2; p >= pos; p -= 2) h.line([[a - 3.2, Y(p, a)], [a + 3.2, Y(p, a)]], 0.4);
                                    for (let p = 10; p <= pos; p += 2) h.line([[a - 3.2, Y(p, a)], [a + 3.2, Y(p, a)]], 0.4);
                                },
                                // a note alone: its head, stem and (n8) flag; dot: lengthened by half
                                note(a, pos, { open = false, stem = true, flag = false, dot = false } = {}) {
                                    st2.head(a, pos, open);
                                    const up = pos < 4, x = a + (up ? 1.72 : -1.72), y = Y(pos, a), ye = y + (up ? -10.6 : 10.6);
                                    if (stem) h.line([[x, y + (up ? -0.4 : 0.4)], [x + 0.2, ye]], 0.42);
                                    if (flag) h.line(S.curve([[x + 0.2, ye], [x + 2.9, ye + (up ? 2.8 : -2.8)], [x + 2.3, ye + (up ? 6.4 : -6.4)]], false, 5), 0.65);
                                    if (dot) h.dot(a + 3.6, y - (pos % 2 ? 0 : GAP * 0.28), 0.55);
                                },
                                // quavers under one beam; three: the triplet's figure in its bracket
                                beamed(notes, three = false) {
                                    const up = notes.reduce((s, n2) => s + n2[1], 0) / notes.length < 4, d = up ? -1 : 1, sx = up ? 1.72 : -1.72;
                                    const e0 = Y(notes[0][1], notes[0][0]) + d * 10.4, e1 = Y(notes[notes.length - 1][1], notes[notes.length - 1][0]) + d * 10.4, x0 = notes[0][0] + sx, x1 = notes[notes.length - 1][0] + sx;
                                    const yb = (x) => e0 + ((e1 - e0) * (x - x0)) / (x1 - x0 || 1);
                                    for (const [a, pos] of notes) {
                                        st2.head(a, pos);
                                        h.line([[a + sx, Y(pos, a) + d * 0.4], [a + sx, yb(a + sx)]], 0.42);
                                    }
                                    h.poly([[x0 - 0.2, e0], [x1 + 0.2, e1], [x1 + 0.2, e1 - d * 1.35], [x0 - 0.2, e0 - d * 1.35]]);
                                    if (three) {
                                        const ym = (e0 + e1) / 2 + d * 3.4, xm = (x0 + x1) / 2;
                                        h.line(S.curve([[x0 - 1, e0 + d * 1.6], [xm - 2.6, ym + d * 0.4]], false, 2).concat([[xm - 2.6, ym + d * 0.4]]), 0.3);
                                        h.line([[xm + 2.6, ym + d * 0.4], [x1 + 1, e1 + d * 1.6]], 0.3);
                                        h.text('3', { a: xm, b: ym, cap: 3.4, font: LORA, skew: 0.25 });
                                    }
                                },
                                chord(a, ps, o2 = {}) {
                                    ps.forEach((p) => st2.head(a, p, o2.open));
                                    const lo = Math.min(...ps), hi = Math.max(...ps), up = (lo + hi) / 2 < 4, x = a + (up ? 1.72 : -1.72);
                                    h.line([[x, Y(up ? lo : hi, a)], [x + 0.15, Y(up ? hi : lo, a) + (up ? -9.6 : 9.6)]], 0.42);
                                },
                                rest(a) {
                                    const y = b0 + 2 * GAP + wob(a);
                                    h.line(S.curve([[a - 0.9, y - 3.6], [a + 1, y - 1.3], [a - 0.9, y + 0.5], [a + 0.9, y + 2.2], [a - 0.6, y + 2.3], [a - 1.1, y + 3.6], [a + 0.1, y + 4.6]], false, 4), 0.8);
                                },
                                sharp(a, pos) {
                                    const y = Y(pos, a);
                                    h.line([[a - 0.8, y - 2.8], [a - 0.8, y + 3]], 0.3);
                                    h.line([[a + 0.8, y - 3.2], [a + 0.8, y + 2.6]], 0.3);
                                    h.line([[a - 1.9, y - 0.3], [a + 1.9, y - 1.4]], 0.8);
                                    h.line([[a - 1.9, y + 1.6], [a + 1.9, y + 0.5]], 0.8);
                                },
                                bar(a, w = 0.45) {
                                    h.line([[a, b0 + wob(a) - 0.2], [a + 0.2, b0 + 4 * GAP + wob(a) + 0.2]], w);
                                },
                                clef(a, pts2, w = 0.62) {
                                    const ln = S.curve(pts2.map(([x, y]) => [a + x * GAP * 1.06, b0 + y * GAP + wob(a)]), false, 6);
                                    h.line(ln, w);
                                    h.line(ln.slice(Math.floor(ln.length * 0.5), Math.floor(ln.length * 0.82)), w * 1.5);
                                    h.dot(ln[0][0], ln[0][1], 0.85);
                                },
                                meter(a) {
                                    h.text('3', { a, b: b0 + GAP + wob(a), cap: GAP * 1.75, font: LORA, skew: 0.18 });
                                    h.text('4', { a, b: b0 + 3 * GAP + wob(a), cap: GAP * 1.75, font: LORA, skew: 0.18 });
                                },
                                tie(a0, a1, pos, over = true) {
                                    const y = Y(pos, a0) + (over ? -2.4 : 2.4), d = over ? -1 : 1, m = (a0 + a1) / 2;
                                    h.poly(S.curve([[a0, y], [m, y + d * 2.6], [a1, y], [m, y + d * 1.9]], true, 6));
                                },
                            };
                            return st2;
                        };
                        if (twice) {
                            // the pen freshly dipped: only the heads and the clefs take the second, blacker pass
                            for (const [b0, k] of [[44, 1], [106, 3]]) stave(b0, k).clef(27, GCLEF);
                            h.text('EL AMOR BRUJO', { a: W / 2 - 12, b: 15.5, cap: 8.6, font: FELL, hand: 0.8, track: 0.15, maxW: 150 });
                            return;
                        }
                        // a page number, the title in capitals, the name under it
                        h.text('15', { a: 12, b: 9.5, cap: 4.2, font: LORA, skew: 0.2 });
                        h.text('EL AMOR BRUJO', { a: W / 2 - 12, b: 15.5, cap: 8.6, font: FELL, hand: 0.8, track: 0.15, maxW: 150 });
                        h.line(S.curve([[W / 2 - 70, 24], [W / 2 - 30, 22.6], [W / 2 - 12, 24.4], [W / 2 + 10, 22.6], [W / 2 + 46, 24]], false, 6), 0.4);
                        h.text('M. de Falla', { a: W - 46, b: 31, cap: 5, font: LORA, skew: 0.3, hand: 0.5, align: 1, track: 0.04 });
                        h.line(S.curve([[W - 86, 36.4], [W - 66, 35.6], [W - 46, 36.6]], false, 5), 0.3);
                        const A0 = 20, A1 = 214, B0 = 46;
                        const barW = (A1 - B0) / 4;
                        [[44, 73, 1], [106, 135, 3]].forEach(([bt, bb, k], sys) => {
                            const tr = stave(bt, k), bs = stave(bb, k + 1), a1 = sys ? A1 - 6 : A1;
                            tr.rule(A0, a1);
                            bs.rule(A0, a1);
                            // the system: a line down both staves and the brace that holds them
                            h.line([[A0, bt + tr.wob(A0)], [A0 + 0.3, bb + 4 * GAP + bs.wob(A0)]], 0.5);
                            const mid = (bt + bb + 4 * GAP) / 2, hh = (bb + 4 * GAP - bt) / 2;
                            h.line(S.curve([[A0 - 2, bt], [A0 - 4.2, bt + hh * 0.2], [A0 - 3.2, mid - hh * 0.2], [A0 - 5.6, mid], [A0 - 3.2, mid + hh * 0.2], [A0 - 4.2, bb + 4 * GAP - hh * 0.2], [A0 - 2, bb + 4 * GAP]], false, 6), 0.7);
                            tr.clef(27, GCLEF);
                            bs.clef(27.4, FCLEF, 0.75);
                            for (const y of [0.55, 1.55]) h.dot(27.4 + 1.9 * GAP, bb + y * GAP, 0.55);
                            if (!sys) {
                                tr.meter(39);
                                bs.meter(39);
                            }
                            for (let i = 1; i <= 4; i++) if (B0 + barW * i <= a1 + 1) {
                                tr.bar(B0 + barW * i - (i === 4 ? 0.5 : 0));
                                bs.bar(B0 + barW * i - (i === 4 ? 0.5 : 0));
                            }
                            const x = (bar, beat) => B0 + barW * bar + 7.5 + beat * 11.6;
                            if (!sys) {
                                // our own phrase, in three: a long note leaning on its neighbour, a triplet turn, a climb
                                tr.note(x(0, 0), 7, { dot: true });
                                tr.note(x(0, 1.5), 8, { flag: true });
                                tr.note(x(0, 2), 7);
                                tr.beamed([[x(1, 0), 6], [x(1, 0.36), 7], [x(1, 0.72), 6]], true);
                                tr.note(x(1, 1.25), 5);
                                tr.note(x(1, 2.1), 4);
                                tr.note(x(2, 0), 3);
                                tr.beamed([[x(2, 1), 4], [x(2, 1.5), 5]]);
                                tr.note(x(2, 2.1), 6);
                                tr.note(x(3, 0.2), 7, { open: true, dot: true });
                                tr.tie(x(3, 0.2) + 2, a1 + 2, 7);
                                tr.tie(x(0, 0), x(0, 2), 9.4);
                                tr.tie(x(2, 0) + 1, x(2, 2.1) + 1, 9);
                                // an accent on the top of the climb, dots under the left hand's chords
                                h.line([[x(2, 2.1) - 2.2, bt - 7.4], [x(2, 2.1) + 2.4, bt - 6.2], [x(2, 2.1) - 2.2, bt - 5]], 0.4);
                                for (const [bar, beat] of [[1, 1], [1, 2], [2, 1], [2, 2]]) h.dot(x(bar, beat), bb + 4 * GAP + 3.4, 0.5);
                                // the left hand: a bass note and two chords, bar after bar
                                [[1, [5, 8]], [4, [6, 8]], [5, [7, 9]], [1, [5, 8]]].forEach(([lo, ch], i) => {
                                    bs.note(x(i, 0), lo);
                                    bs.chord(x(i, 1), ch);
                                    if (i < 3) bs.chord(x(i, 2), ch);
                                    else bs.rest(x(i, 2));
                                });
                                bs.sharp(x(2, 1) - 4.6, 7);
                                // soft, and swelling
                                h.text('p', { a: x(0, 0) - 1, b: (bt + 4 * GAP + bb) / 2 + 0.6, cap: 4.4, font: LORA, skew: 0.32 });
                                const hy = (bt + 4 * GAP + bb) / 2 + 0.4;
                                h.line([[x(1, 0.4) + 34, hy - 1.9], [x(1, 0.4), hy], [x(1, 0.4) + 34, hy + 1.9]], 0.32);
                            } else {
                                tr.note(x(0, 0), 7);
                                tr.tie(A0 + 22, x(0, 0) - 2, 7);
                                tr.beamed([[x(0, 1), 6], [x(0, 1.4), 5], [x(0, 1.8), 4], [x(0, 2.2), 5]]);
                                tr.beamed([[x(1, 0), 3], [x(1, 0.36), 4], [x(1, 0.72), 3]], true);
                                tr.sharp(x(1, 1.25) - 4.4, 2);
                                tr.note(x(1, 1.25), 2);
                                tr.note(x(1, 2.1), 3);
                                // a bar thought better of: its notes, then the pen through them
                                tr.note(x(2, 0), 5);
                                tr.beamed([[x(2, 1), 6], [x(2, 1.5), 8]]);
                                tr.note(x(2, 2.1), 7);
                                for (let i = 0; i < 11; i++) h.line([[x(2, 0) - 4 + i * 3.1, bt - 2 + (i % 2)], [x(2, 0) - 8 + i * 3.1, bt + 4 * GAP + 3 - (i % 3)]], 0.42);
                                h.line(S.curve([[x(2, 0) - 6, bt + 6], [x(2, 0.6), bt + 4.4], [x(2, 1.3), bt + 7], [x(2, 2), bt + 5], [x(2, 2.5), bt + 6.6]], false, 5), 0.5);
                                tr.note(x(3, 0), 5, { open: true });
                                // a pause over it
                                h.line(S.curve([[x(3, 0) - 4.4, bt - 3.4], [x(3, 0) - 3, bt - 6.6], [x(3, 0), bt - 7.8], [x(3, 0) + 3, bt - 6.6], [x(3, 0) + 4.4, bt - 3.4]], false, 5), 0.6);
                                h.dot(x(3, 0), bt - 4.2, 0.6);
                                tr.rest(x(3, 2));
                                [[1, [5, 8]], [5, [7, 9]], [3, [5, 7]], [1, [3, 5, 8]]].forEach(([lo, ch], i) => {
                                    bs.note(x(i, 0), lo);
                                    bs.chord(x(i, 1), ch);
                                    if (i !== 2) bs.chord(x(i, 2), ch, { open: i === 3 });
                                    else bs.rest(x(i, 2));
                                });
                                bs.sharp(x(1, 1) - 4.6, 7);
                                const hy = (bt + 4 * GAP + bb) / 2 + 0.4;
                                h.line([[x(0, 0.6), hy - 1.9], [x(0, 0.6) + 30, hy], [x(0, 0.6), hy + 1.9]], 0.32);
                                h.text('pp', { a: x(1, 0.8), b: hy + 0.2, cap: 4.4, font: LORA, skew: 0.32, track: -0.04 });
                            }
                        });
                    });
                    write('rgba(58,40,44,0.9)', 0.14, false);
                    write(INKC, 0.55, false);
                    write('#17101c', 0.3, true);

                    // the blot: where the pen was shaken; its satellites, and the cuff that went through it
                    const bc = [193, 156], blob = [];
                    S.dab(c, S.curve([P(bc[0] + 2, bc[1] + 1), P(bc[0] + 12, bc[1] + 4), P(bc[0] + 24, bc[1] + 4.6), P(bc[0] + 34, bc[1] + 8)], false, 10), { w: 6.4, color: INKC, alpha: 0.5, bristles: 9, seed: seed + 'cuff', dry: 0.8 });
                    for (let i = 0; i < 40; i++) {
                        const t = (i / 40) * TAU, spike = Math.pow(Math.max(0, Math.sin(t * 3.5 + 0.6)), 8) * 4.4 + Math.pow(Math.max(0, Math.sin(t * 2 + 2.2)), 12) * 3;
                        const rr = 5.6 + 1.2 * Math.sin(t * 2 + 1) + 0.6 * Math.sin(t * 5) + spike;
                        blob.push(P(bc[0] + Math.cos(t) * rr * 1.15, bc[1] + Math.sin(t) * rr * 0.9));
                    }
                    fillPts(c, blob, rgba('#4a3a52', 0.35));
                    const bp = S.curve(blob.map((p, i) => [p[0] + (P(bc[0], bc[1])[0] - p[0]) * 0.1, p[1] + (P(bc[0], bc[1])[1] - p[1]) * 0.1]), true, 2);
                    fillPts(c, bp, '#1a1222');
                    strokePts(c, bp, 0.5, '#0c0812', true);
                    // still wet in the middle: a sheen
                    const sh = P(bc[0] - 1.6, bc[1] - 1.4);
                    fillPts(c, S.ellipse(sh[0], sh[1], 2.4, 1.1, 12, tilt - 0.5), rgba('#8f8db0', 0.55));
                    fillPts(c, S.ellipse(sh[0] - 0.5, sh[1] - 0.2, 1, 0.45, 8, tilt - 0.5), rgba('#eef0ff', 0.8));
                    for (let i = 0; i < 14; i++) {
                        const t = r() * TAU, d = 8 + r() * r() * 16, rr = 0.25 + r() * r() * 1.3, p = P(bc[0] + Math.cos(t) * d, bc[1] + Math.sin(t) * d * 0.8);
                        fillPts(c, S.ellipse(p[0], p[1], rr * 1.2, rr, 8, t), rgba('#1a1222', 0.9));
                    }
                    // a thumb, inky, at the edge where the sheet was held
                    stamp(c, P.sub(9, 78, -0.3), [-5, -7, 5, 7], { mode: 'ink', color: 'rgba(42,30,38,0.4)', wear: 0.4, seed: seed + 'thumb' }, (h) => {
                        for (let k = 1; k < 6; k++) h.line(S.ellipse(0, 1 - k * 0.2, k * 0.85, k * 1.25, 18).concat([[k * 0.85, 1 - k * 0.2]]), 0.4);
                    });
                    // the airbrush: the far edges in shade, the near corner in the light
                    S.spray(c, pts, { color: '#8f84a0', alpha: 0.55, w: 16 });
                    S.spray(c, pts, { color: '#5f587a', alpha: 0.4, w: 5 });
                    S.spray(c, pts, { color: '#fffdf2', alpha: 0.7, w: 10, dir: TOL });
                    // a teacher's blue crayon round the turn, and fingerings in pencil
                    stamp(c, P, [0, 0, W, H], { mode: 'ink', color: 'rgba(52,84,150,0.75)', wear: 0.4, seed: seed + 'crayon' }, (h) => {
                        h.line(S.ellipse(109, 43, 14.5, 9.4, 30, -0.12).concat(S.ellipse(109, 43, 14.5, 9.4, 30, -0.12).slice(0, 5).map(([x, y]) => [x + 1.4, y - 1.2])), 1.1);
                        h.line([[124, 36], [130, 31.6]], 0.9);
                    });
                    stamp(c, P, [0, 0, W, H], { mode: 'ink', color: 'rgba(70,66,84,0.75)', wear: 0.3, seed: seed + 'pencil' }, (h) => {
                        for (const [t, a, b] of [['2', 62, 37.6], ['1', 155, 38.6], ['3', 176.5, 36], ['2', 66, 98.6], ['4', 96, 99.8]]) h.text(t, { a, b, cap: 2.8, font: LORA, skew: 0.2, hand: 0.6 });
                        h.line(S.curve([[196, 60], [202, 58], [200, 63], [206, 61.4]], false, 4), 0.35);
                    });
                },
            });
            // the lower left corner, turned over: what was under it shows
            q.save();
            q.globalCompositeOperation = 'destination-out';
            fillPts(q, P.pts([[-3, H + 4], [13.4, H + 4], [13.4, H + 0.2], [-0.2, H - 11.6], [-3, H - 11.6]]), '#000');
            q.restore();
            S.piece(q, P.pts([[13.4, H + 0.4], [-0.3, H - 11.6], [11.6, H - 10]]), { fill: '#f1e7c8', line: 1.6, heavy: 0.7, shade: { color: '#8f84a0', alpha: 0.7, w: 4 }, light: { color: '#fffdf2', alpha: 0.7, w: 2 }, cast: { blur: 2.6, dx: 1.6, dy: 2.2, color: 'rgba(30,22,50,0.5)' } });
            // the roll: the corner curled forward, showing the back of the sheet
            const mid = [(RA[0] + RB[0]) / 2, (RA[1] + RB[1]) / 2], nrm = [-0.72, 0.69];   // across the roll, towards the sheet
            const rollPts = S.curve([[RA[0] - 3, RA[1] - 1], [mid[0] - nrm[0] * 4.6 - 6, mid[1] - nrm[1] * 4.6 - 7], [mid[0] - nrm[0] * 5.4 + 8, mid[1] - nrm[1] * 5.4 + 9], [RB[0] + 1.6, RB[1] + 3.4], [RB[0] - 3, RB[1] + 3], [mid[0] + nrm[0] * 12 + 8, mid[1] + nrm[1] * 12 + 9], [mid[0] + nrm[0] * 13.5, mid[1] + nrm[1] * 13.5], [mid[0] + nrm[0] * 9 - 10, mid[1] + nrm[1] * 9 - 11]], true, 6);
            const rp = P.pts(rollPts);
            S.piece(q, rp, {
                fill: { from: P(mid[0] - nrm[0] * 5, mid[1] - nrm[1] * 5), to: P(mid[0] + nrm[0] * 13, mid[1] + nrm[1] * 13), stops: [[0, '#8d84a0'], [0.2, '#cbbf9e'], [0.42, '#fbf5e0'], [0.62, '#e3d7b6'], [0.85, '#a79c98'], [1, '#6f6684']] }, line: 1.9, heavy: 0.8,
                cast: { blur: 6, dx: 3.4, dy: 5, color: 'rgba(30,22,50,0.55)' },
                detail: (c) => {
                    GRAIN.paper(PAP, 1)(c, P.sub(RA[0] - 10, RA[1] - 6), 66, 66, seed + 'roll', 1);
                    // the ink of the other side, ghosting through; the lip of the roll
                    for (let i = 0; i < 5; i++) strokePts(c, [P(RA[0] + 2 + i * 1.9, RA[1] + 8 - i * 1.6), P(RB[0] - 12 + i * 1.9, RB[1] - 2 - i * 1.6)], 0.3, rgba('#5a4a52', 0.16));
                    S.ink(c, S.curve(P.pts([[RA[0] - 1, RA[1] + 2.4], [mid[0] + nrm[0] * 2.6, mid[1] + nrm[1] * 2.6], [RB[0] - 2.4, RB[1] + 1]]), false, 8), { w: 0.6, color: '#fffdf2', alpha: 0.9 });
                    S.spray(c, rp, { color: '#5f587a', alpha: 0.5, w: 4 });
                },
            });
            // the end of the roll: the paper's edge winds inwards
            const eye = P(RB[0] - 1.4, RB[1] + 3.3), sp = [];
            for (let i = 0; i <= 26; i++) {
                const t = 0.4 + (i / 26) * 7.4, rr = 4.2 * (1 - i / 34);
                sp.push([eye[0] + Math.cos(t + tilt) * rr * 1.25 - 3 * Math.cos(tilt + 0.76), eye[1] + Math.sin(t + tilt) * rr * 0.8 - 3 * Math.sin(tilt + 0.76)]);
            }
            S.ink(q, sp, { w: 0.9, color: INK, taper: [0.2, 0.8] });
        });
    }

    return { books, palette, score };
})();
