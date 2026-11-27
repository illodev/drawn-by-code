// A string of coins for the emblem: one piece of metal for every people that passed through
// Andalusia, in order, as on a flamenco dancer's coin scarf. Emblem manner (dark contour +
// airbrush) over a low relief that is lit per pixel. Global: Coins.
//
//   Coins.coin(g, { x, y, r = 32, kind, rot = 0, seed, pierced = false, cast = true })
//       one coin, centred on (x, y). `r` is the radius of a standard coin: every kind has
//       its own size (Coins.size: from 0.8 for the tremissis of Spania to 1.25 for the eight
//       reales), so a coin is about 64 × size units across at r = 32. `rot` turns the coin,
//       never the light (at rot = 0 the square dirham stands on a corner, as it hangs).
//       `pierced` punches the hole it hangs from, straight above its centre whatever `rot`;
//       `cast`: its shadow on the paint already under it. Returns { x, y, r, kind, eye }
//       (eye: the point a ring goes through: the hole, or the pendant's loop).
//   Coins.string(g, { path, kinds = Coins.KINDS, r = 32, seed, chain = true })
//       the coins hanging in order along `path` ([[x, y], …], left to right: a ribbon's
//       lower edge), each from its own jump ring on a fine chain that follows the path;
//       every other one hangs a few links lower, so they lie in two tiers and overlap a
//       little when the path is shorter than their widths (13 coins at r = 32 want about
//       840 units). Returns [{ kind, x, y, r, rot }] as placed (x, y: each coin's centre).
//   Coins.KINDS         the thirteen kinds, in historical order
//   Coins.box(kind, r)  { x, y, w, h } about the coin's centre, contour included
//   Coins.size(kind)    the kind's radius as a fraction of `r`
//
// How a coin is made: its types are drawn as greys = height into layers (a silhouette, a
// broad volume inside it, features, cut lines), each blurred as a float field and summed;
// then wear (the tops flattened), a weak corner of the strike, scratches and pits; then the
// flan (an irregular outline, a rounded edge, a cup, an uneven surface). `Souvenir.form`
// lights that height field from the top left; the tint lays the patina by height (what is
// rubbed is bright, what is low holds the dirt). The design is drawn already turned, so
// the sprite is pasted upright and the light never turns. Cached per kind/rot/resolution.
//
// ---------------------------------------------------------------------------------------
// What a struck coin on a string really has (every coin here carries these):
//   1 a flan that is not round (cast, hammered or cut with shears)  2 a strike off its centre:
//   the border runs off one side and leaves a blank lip on the other  3 a split in the edge
//   4 high points rubbed flat and bright  5 dirt and toning in the recesses, round the letters
//   6 border pellets of unequal size  7 letters cut with a punch: pellet or bar ends, uneven
//   8 a weak corner where the die did not bite  9 hairline scratches, small knocks, pits; on
//   struck silver and gold the die's own polishing lines and the flow lines towards the edge
//   10 a punched hole through whatever was there, with its lit bore  11 a jump ring with its
//   butt joint  12 a chain whose links lie flat and on edge by turns  13 a money-changer's
//   test (a chisel cut on the shekel's edge, a crescent punch on the denarius)
//
// The thirteen, and what each one is built from:
//  tartessos (c. 650 BC)  Tartessos struck no coins: a gold disc pendant in the manner of the
//      Carambolo treasure. A rolled rim, a twisted wire, plain wires; sixteen repoussé
//      hemispheres in collars; granulation in triangles between them (one triangle lost,
//      one hemisphere dented); eight rosettes of eight petals in round cups with a grain at
//      the heart; small bosses between the cups; a central rosette of eight cells round a
//      boss in a collar of grains; a suspension loop of six turns of wire soldered to the rim.
//  gadir (Phoenician Cádiz, bronze, 3rd–2nd c. BC, reverse)  two tunas swimming left, of
//      unequal size: spindle body, lunate tail on a narrow peduncle with its keel, first and
//      second dorsal, anal and pelvic fins, finlets, the long pectoral, gill cover, eye,
//      mouth; a crescent holding a pellet between the heads and an aleph between the tails;
//      Punic legends right to left, mpʿl above and ʾgdr below; a line border; a cast flan
//      with the stubs of its sprues; green-brown patina, red copper where it is rubbed.
//  gadir-melqart (the obverse)  the head of Melqart-Herakles to the left in the lion's
//      scalp: the lion's muzzle over the brow with its eye, ear and teeth, the mane in locks
//      down the nape, the paws knotted under the chin; brow, nose, lips, chin, an eye with
//      its lids, the neck's muscle; the knotted club behind the neck; a border of dots.
//  barcid (Carthaginian shekel struck in Iberia, c. 230 BC, reverse)  an African elephant
//      walking right: the great fan of the ear with its folds, a saddle back, a domed head,
//      the trunk in rings curling at its tip, a tusk, the small eye, four pillar legs with
//      toenails (the far pair lower in the relief), the tail and its tuft; a ground line; a
//      border of dots; toned silver.
//  obulco (Iberian-Roman as of Obulco, Porcuna, 2nd c. BC, reverse)  from the top: a yoke
//      with its two bows, a plough (sole and share, stilt with its handle, the curved beam
//      with its pegs, a brace), two lines of southern-Iberian signs (magistrates' names: here
//      plausible signs, not a reading), an ear of wheat with its grains in two ranks and
//      its awns, OBVLCO; a thick brown bronze flan with a bevelled, uneven edge.
//  hadrian (denarius, Rome, AD 134–138, reverse)  HISPANIA reclining to the left on the
//      ground line, her elbow on a rock, an olive branch in her right hand (leaves in pairs,
//      olives), hair in a bun, the mantle over her legs in folds, a rabbit at her feet;
//      HISPANIA round the top; a border of dots, half off the small flan; bright silver.
//  leovigild (Visigothic tremissis, Seville, c. 580)  a facing bust cut in lines and pellets:
//      an oval face, pellet eyes, a bar for the nose and one for the mouth, the diadem with
//      its jewel and pendants, hair in strands, the cloak in nested folds with a pellet
//      border and a fibula, a cross on the breast; + LEOVIGILDVS REX all round in letters
//      with pellet ends; struck twice (a ghost of the legend a step aside); a thin pale
//      flan, cupped, with two edges cut straight.
//  spania (Byzantine tremissis of the province of Spania, 6th–7th c.)  a cross potent on three
//      steps, VICTORIA AVGG round it, CONOB below, a pellet in the field; pale gold, small.
//  caliphate (Umayyad dirham of al-Andalus, Madinat al-Zahra, 10th c.)  no image: three lines
//      in the field, a floret over them and a ring under, two fine circles, the marginal
//      legend, a fine circle and a circle of pellets. The script is a rhythm of strokes
//      (baseline, uprights with wedge tops, teeth, loops, tails), never words. A wide thin
//      flan with a wave in it, an edge split, grey silver.
//  almohad (dinar, 12th c.)  the square in the circle: double lines, three lines of the same
//      texture (a rounder hand) in the square, one in each of the four segments, pellets at
//      the square's corners; a neat round flan of bright gold.
//  nasrid (square dirham of Granada, 14th–15th c.)  cut square with shears, its corners
//      eased; a line, a row of pellets and a line as a border; three lines of the texture;
//      an eight-pointed star. It hangs from a corner.
//  excelente (Catholic Monarchs, after 1497, reverse)  the eagle of Saint John, nimbed, its
//      head to the left over the crowned shield: quarterly Castile-León (castles and lions)
//      and Aragon-Sicily (pallets, a saltire), the pomegranate of Granada in the point;
//      wings of separate feathers, a tail, claws; SVB VMBRA ALARVM TVARVM PROTEGE NOS with
//      stops; a border of pellets; yellow gold.
//  columnario (eight reales, 18th c.)  two globes with their lands and meridians under a
//      royal crown, on waves, between the Pillars of Hercules, each with base, capital,
//      its own crown and a banner (PLVS, VLTRA); VTRAQUE VNUM above, the mint mark, a
//      date and florets below; a toothed border, a raised rim cut with the laurel of the
//      edge; bright silver, toned towards the rim.
const Coins = (() => {
    const S = Souvenir;
    const TAU = Math.PI * 2, SD = S.SHADE_DIR, LIT = [-SD[0], -SD[1]];
    const KINDS = ['tartessos', 'gadir', 'gadir-melqart', 'barcid', 'obulco', 'hadrian', 'leovigild', 'spania', 'caliphate', 'almohad', 'nasrid', 'excelente', 'columnario'];
    const cache = new Map();
    const memo = (key, fn) => {
        if (!cache.has(key)) cache.set(key, fn());
        return cache.get(key);
    };
    const even = (b) => {
        const x = Math.floor(b.x / 2) * 2, y = Math.floor(b.y / 2) * 2;
        return { x, y, w: Math.ceil((b.x + b.w - x) / 2) * 2, h: Math.ceil((b.y + b.h - y) / 2) * 2 };
    };
    const wrap = (a) => Math.atan2(Math.sin(a), Math.cos(a));
    const pol = (r, a, cx = 0, cy = 0) => [cx + Math.cos(a) * r, cy + Math.sin(a) * r];

    // ------------------------------------------------------------------ painting heights
    // Everything below paints greys on a die's canvas: white is the top of the relief.
    const grey = (v) => {
        const c = Math.round(S.clamp(v) * 255);
        return `rgb(${c},${c},${c})`;
    };
    const fillP = (q, pts, v) => {
        q.beginPath();
        S.trace(q, pts);
        q.fillStyle = grey(v);
        q.fill();
    };
    const line = (q, pts, w, v, closed = false) => {
        q.beginPath();
        S.trace(q, pts, closed);
        q.lineWidth = w;
        q.strokeStyle = grey(v);
        q.stroke();
    };
    const dot = (q, x, y, r, v) => {
        q.beginPath();
        q.arc(x, y, r, 0, TAU);
        q.fillStyle = grey(v);
        q.fill();
    };
    const ringS = (q, x, y, r, w, v) => {
        q.beginPath();
        q.arc(x, y, r, 0, TAU);
        q.lineWidth = w;
        q.strokeStyle = grey(v);
        q.stroke();
    };
    // a hemisphere (its true section), added to whatever is there
    const dome = (q, x, y, r, v = 1) => {
        const gr = q.createRadialGradient(x, y, 0, x, y, r);
        for (const k of [0, 0.3, 0.5, 0.7, 0.85, 0.95, 1]) gr.addColorStop(k, grey(v * Math.sqrt(1 - k * k)));
        q.save();
        q.globalCompositeOperation = 'lighter';
        q.fillStyle = gr;
        q.beginPath();
        q.arc(x, y, r, 0, TAU);
        q.fill();
        q.restore();
    };
    // a border of pellets, no two alike
    const beads = (q, cx, cy, R, n, br, rnd, v = 1) => {
        for (let i = 0; i < n; i++) {
            const p = pol(R + (rnd() - 0.5) * br * 0.3, ((i + (rnd() - 0.5) * 0.3) / n) * TAU, cx, cy);
            dome(q, p[0], p[1], br * (0.82 + rnd() * 0.36), v);
        }
    };
    // a stroke that tapers: a polygon about a centre line, w0 wide at its start, w1 at its end
    function taperP(pts, w0, w1 = w0) {
        const n = pts.length, A = [], B = [];
        for (let i = 0; i < n; i++) {
            const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)], tx = b[0] - a[0], ty = b[1] - a[1], tl = Math.hypot(tx, ty) || 1;
            const hw = (w0 + ((w1 - w0) * i) / Math.max(1, n - 1)) / 2;
            A.push([pts[i][0] - (ty / tl) * hw, pts[i][1] + (tx / tl) * hw]);
            B.push([pts[i][0] + (ty / tl) * hw, pts[i][1] - (tx / tl) * hw]);
        }
        return [...A, ...B.reverse()];
    }
    const taper = (q, pts, w0, w1, v) => {
        fillP(q, taperP(pts, w0, w1), v);
        dot(q, pts[0][0], pts[0][1], w0 / 2, v);
        dot(q, pts[pts.length - 1][0], pts[pts.length - 1][1], w1 / 2, v);
    };
    // a pointed leaf (or a petal, a grain) from (x, y) along `ang`
    const lens = (x, y, len, wd, ang, fat = 0.45) => S.xf(S.curve([[0, 0], [len * fat, -wd / 2], [len, 0], [len * fat, wd / 2]], true, 5), { x, y, rot: ang });
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

    // ------------------------------------------------------------------ lettering cut in a die
    // Monoline capitals as a die-sinker cuts them: strokes, with a pellet or a bar punched
    // at every free end. A glyph is [width, stroke, …] in a box 1 tall (y = 0 the top, 1 the
    // foot); C(…) is a curved stroke, O(…) a closed one.
    const C = (...p) => ({ c: p });
    const O = (...p) => ({ c: p, o: true });
    const BOWL = C([0, 0], [0.38, 0.02], [0.53, 0.26], [0.38, 0.5], [0, 0.52]);
    const CEE = C([0.63, 0.2], [0.42, 0.02], [0.16, 0.14], [0.02, 0.5], [0.16, 0.86], [0.42, 0.98], [0.64, 0.8]);
    const OH = O([0.35, 0], [0.6, 0.14], [0.7, 0.5], [0.6, 0.86], [0.35, 1], [0.1, 0.86], [0, 0.5], [0.1, 0.14]);
    const LATIN = {
        A: [0.74, [[0, 1], [0.37, 0], [0.74, 1]], [[0.18, 0.63], [0.56, 0.63]]],
        B: [0.58, [[0, 0], [0, 1]], C([0, 0], [0.34, 0.02], [0.5, 0.22], [0.36, 0.46], [0, 0.48]), C([0, 0.48], [0.4, 0.52], [0.57, 0.74], [0.4, 0.98], [0, 1])],
        C: [0.66, CEE],
        D: [0.66, [[0, 0], [0, 1]], C([0, 0], [0.36, 0.04], [0.62, 0.28], [0.65, 0.56], [0.5, 0.86], [0, 1])],
        E: [0.52, [[0.5, 0], [0, 0], [0, 1], [0.52, 1]], [[0, 0.48], [0.38, 0.48]]],
        G: [0.68, CEE, [[0.66, 0.8], [0.66, 0.54], [0.44, 0.54]]],
        H: [0.62, [[0, 0], [0, 1]], [[0.62, 0], [0.62, 1]], [[0, 0.5], [0.62, 0.5]]],
        I: [0.1, [[0.05, 0], [0.05, 1]]],
        L: [0.48, [[0, 0], [0, 1], [0.48, 1]]],
        M: [0.84, [[0, 1], [0.08, 0], [0.42, 0.72], [0.76, 0], [0.84, 1]]],
        N: [0.62, [[0, 1], [0, 0], [0.62, 1], [0.62, 0]]],
        O: [0.7, OH],
        P: [0.54, [[0, 0], [0, 1]], BOWL],
        Q: [0.7, OH, [[0.42, 0.78], [0.74, 1.1]]],
        R: [0.6, [[0, 0], [0, 1]], BOWL, [[0.2, 0.52], [0.6, 1]]],
        S: [0.54, C([0.5, 0.17], [0.3, 0.01], [0.08, 0.12], [0.07, 0.34], [0.27, 0.49], [0.47, 0.63], [0.49, 0.85], [0.27, 0.99], [0.03, 0.84])],
        T: [0.62, [[0, 0], [0.62, 0]], [[0.31, 0], [0.31, 1]]],
        U: [0.62, C([0, 0], [0, 0.55], [0.07, 0.86], [0.31, 1], [0.55, 0.86], [0.62, 0.55], [0.62, 0])],
        V: [0.68, [[0, 0], [0.34, 1], [0.68, 0]]],
        X: [0.6, [[0, 0], [0.6, 1]], [[0.6, 0], [0, 1]]],
        '+': [0.62, [[0.31, 0.14], [0.31, 0.86]], [[0, 0.5], [0.62, 0.5]]],
        o: [0.26, O([0.13, 0.02], [0.25, 0.14], [0.13, 0.26], [0.01, 0.14])], // the small o over a mint's initial
        1: [0.3, [[0.02, 0.24], [0.2, 0], [0.2, 1]]],
        7: [0.52, [[0, 0], [0.52, 0], [0.2, 1]]],
        6: [0.52, C([0.46, 0.06], [0.22, 0.16], [0.05, 0.5], [0.1, 0.86], [0.27, 1], [0.46, 0.86], [0.48, 0.64], [0.3, 0.5], [0.08, 0.62])],
        8: [0.5, O([0.25, 0.48], [0.07, 0.34], [0.07, 0.12], [0.25, 0], [0.43, 0.12], [0.43, 0.34]), O([0.25, 0.48], [0.04, 0.64], [0.05, 0.88], [0.25, 1], [0.45, 0.88], [0.46, 0.64])],
    };
    // Punic letters as they stand on the coins of Gadir (simple strokes; written right to left)
    const PUNIC = {
        aleph: [0.9, [[0.6, -0.05], [0.5, 1.05]], [[0.92, 0.2], [0.06, 0.46], [0.9, 0.74]]],
        gimel: [0.66, [[0.04, 0.62], [0.46, 0], [0.6, 1.02]]],
        dalet: [0.8, [[0.7, 0.04], [0.06, 0.3], [0.68, 0.58], [0.7, 0.04]], [[0.7, 0.04], [0.76, 0.8]]],
        resh: [0.8, [[0.66, 0], [0.06, 0.22], [0.64, 0.46], [0.66, 0]], [[0.66, 0], [0.78, 1.1]]],
        mem: [0.9, [[0.04, 0.12], [0.2, 0.4], [0.37, 0.1], [0.54, 0.4], [0.7, 0.06], [0.84, 1.08]]],
        pe: [0.72, C([0.14, 0.28], [0.4, 0.02], [0.66, 0.2], [0.68, 0.6], [0.56, 1.02])],
        ayin: [0.6, O([0.3, 0.18], [0.52, 0.42], [0.3, 0.66], [0.08, 0.42])],
        lamed: [0.72, C([0.3, -0.18], [0.22, 0.7], [0.42, 0.98], [0.7, 0.78])],
    };
    // signs in the manner of the southern-Iberian script (plausible shapes, not a reading)
    const IBER = {
        a: [0.5, [[0.46, 0], [0.04, 0.33], [0.46, 0.66], [0.04, 1]]],
        b: [0.1, [[0.05, 0], [0.05, 1]]],
        c: [0.56, [[0.28, 0], [0.56, 0.5], [0.28, 1], [0, 0.5], [0.28, 0]]],
        d: [0.6, [[0, 1], [0.3, 0], [0.6, 1]]],
        e: [0.6, [[0.3, 0], [0.3, 1]], [[0, 0.36], [0.3, 0], [0.6, 0.36]]],
        f: [0.6, [[0.3, 0.1], [0.3, 1]], [[0, 0.1], [0.3, 0.56], [0.6, 0.1]]],
        g: [0.54, [[0, 1], [0, 0], [0.54, 1], [0.54, 0]]],
        h: [0.5, O([0.25, 0.22], [0.48, 0.5], [0.25, 0.78], [0.02, 0.5])],
        i: [0.5, [[0.04, 0], [0.04, 1]], [[0.04, 0.3], [0.48, 0.04]], [[0.04, 0.62], [0.48, 0.36]]],
        j: [0.6, [[0, 1], [0.3, 0.04], [0.6, 1], [0, 1]]],
        k: [0.56, [[0, 0], [0.56, 1]], [[0.56, 0], [0, 1]]],
        l: [0.6, [[0, 0], [0.3, 0.5], [0.6, 0]], [[0.3, 0.5], [0.3, 1]]],
        m: [0.7, [[0, 1], [0.16, 0], [0.35, 0.62], [0.54, 0], [0.7, 1]]],
    };
    const glyphs = new Map();
    function glyphOf(tbl, id, ch) {
        const key = id + ch;
        if (!glyphs.has(key)) {
            const G = tbl[ch];
            if (!G) glyphs.set(key, null);
            else {
                const strokes = G.slice(1).map((st) => ({ pts: st.c ? S.curve(st.c, !!st.o, 7) : st, closed: !!st.o }));
                // a stroke's end is free when it does not land on another stroke
                const ends = [];
                strokes.forEach((st, i) => {
                    if (st.closed) return;
                    const n = st.pts.length;
                    if (Math.hypot(st.pts[0][0] - st.pts[n - 1][0], st.pts[0][1] - st.pts[n - 1][1]) < 0.02) return;
                    for (const [p, o] of [[st.pts[0], st.pts[1]], [st.pts[n - 1], st.pts[n - 2]]]) {
                        if (!strokes.some((ot, j) => j !== i && distLine(p, ot.pts, ot.closed) < 0.09)) ends.push([p, o]);
                    }
                });
                glyphs.set(key, { w: G[0], strokes, ends });
            }
        }
        return glyphs.get(key);
    }
    // one glyph with its foot on the origin; returns its width
    function glyph(q, G, size, lw, v, serif) {
        const m = ([x, y]) => [x * size, (y - 1) * size];
        for (const st of G.strokes) line(q, st.pts.map(m), lw, v, st.closed);
        if (serif) for (const [p, o] of G.ends) {
            const P = m(p), Q = m(o);
            if (serif === 'pellet') dot(q, P[0], P[1], lw * 0.82, v);
            else {
                const b = lw * 1.05, upright = Math.abs(P[1] - Q[1]) > Math.abs(P[0] - Q[0]) * 0.5;
                line(q, upright ? [[P[0] - b, P[1]], [P[0] + b, P[1]]] : [[P[0], P[1] - b], [P[0], P[1] + b]], lw * 0.8, v);
            }
        }
        return G.w * size;
    }
    const STOPS = { ' ': 0.42, ':': 0.3, '.': 0.3, '*': 0.7 };
    // measures a text: [[glyph | stop, width in em], …]
    const setText = (text, tbl, id) => (Array.isArray(text) ? text : [...text]).map((ch) => (STOPS[ch] !== undefined ? [ch, STOPS[ch]] : [glyphOf(tbl, id, ch), glyphOf(tbl, id, ch)?.w ?? 0.4]));
    const stop = (q, ch, size, lw, v) => {
        if (ch === ':') {
            dot(q, 0.15 * size, -0.28 * size, lw * 0.75, v);
            dot(q, 0.15 * size, -0.72 * size, lw * 0.75, v);
        } else if (ch === '.') dot(q, 0.15 * size, -0.5 * size, lw * 0.8, v);
        else if (ch === '*') {
            // a floret: four petals about a pellet
            for (let k = 0; k < 4; k++) dot(q, 0.35 * size + Math.cos(k * 1.5708 + 0.78) * size * 0.2, -0.5 * size + Math.sin(k * 1.5708 + 0.78) * size * 0.2, size * 0.13, v);
            dot(q, 0.35 * size, -0.5 * size, size * 0.08, v);
        }
    };
    // A legend round a circle. `R` is the radius the letters stand on, `mid` the angle of the
    // legend's middle; tops point outwards (flip: inwards, for a legend read at the foot).
    // `span` spreads it over that angle; `jit` is how unsteady the die-sinker's hand was.
    function legend(q, text, o) {
        const { R, mid = -Math.PI / 2, size = 5, lw = size * 0.17, v = 1, track = 0.2, serif = 'pellet', flip = false, span = null, rnd = null, jit = 0, tbl = LATIN, id = 'L', cx = 0, cy = 0 } = o;
        const set = setText(text, tbl, id), n = set.length;
        const Rm = flip ? R - size / 2 : R + size / 2;
        let tr = track;
        const sum = set.reduce((a, s) => a + s[1], 0);
        if (span) tr = Math.max(0.02, ((span * Rm) / size - sum) / Math.max(1, n - 1));
        const total = (sum + tr * (n - 1)) * size;
        let u = -total / 2;
        for (const [G, gw] of set) {
            const w = gw * size, ang = mid + ((flip ? -1 : 1) * (u + w / 2)) / Rm;
            if (G) {
                q.save();
                const j = rnd ? jit : 0, p = pol(R + (j ? (rnd() - 0.5) * 0.5 * j : 0), ang, cx, cy);
                q.translate(p[0], p[1]);
                q.rotate(ang + (flip ? -1 : 1) * (Math.PI / 2) + (j ? (rnd() - 0.5) * 0.14 * j : 0));
                const k = 1 + (j ? (rnd() - 0.5) * 0.12 * j : 0);
                q.translate((-w * k) / 2, 0);
                if (typeof G === 'string') stop(q, G, size, lw, v);
                else glyph(q, G, size * k, lw, v, serif);
                q.restore();
            }
            u += w + tr * size;
        }
    }
    // a word on a straight line, centred on x, standing on y
    function word(q, text, x, y, o) {
        const { size = 5, lw = size * 0.17, v = 1, track = 0.2, serif = 'pellet', rnd = null, jit = 0, tbl = LATIN, id = 'L' } = o;
        const set = setText(text, tbl, id);
        let u = x - ((set.reduce((a, s) => a + s[1], 0) + track * (set.length - 1)) * size) / 2;
        for (const [G, gw] of set) {
            if (G) {
                q.save();
                q.translate(u, y + (rnd ? (rnd() - 0.5) * 0.4 * jit : 0));
                q.rotate(rnd ? (rnd() - 0.5) * 0.12 * jit : 0);
                if (typeof G === 'string') stop(q, G, size, lw, v);
                else glyph(q, G, size, lw, v, serif);
                q.restore();
            }
            u += (gw + track) * size;
        }
    }

    // Script-like texture: the rhythm of an Arabic coin legend (a baseline, uprights of two
    // heights with wedge tops, teeth, small loops, tails under the line) from a seeded
    // grammar. It is never text: the sequence is random, no word can be read in it.
    // Returns strokes in (u, v): u along the line, v above it.
    function scriptRun(rnd, len, h, round) {
        const lines = [], dots = [], wedges = [];
        let u = h * 0.1;
        while (u < len - h * 0.5) {
            const n = 2 + Math.floor(rnd() * 3.6), u0 = u;
            let tall = false;
            for (let k = 0; k < n && u < len - h * 0.35; k++) {
                let t = rnd();
                const lean = round ? -h * (0.06 + rnd() * 0.1) : 0;
                // (no two tall uprights side by side, and none before a loop: with a loop
                // after them they would begin to look like a word)
                if (tall && (t < 0.24 || (t >= 0.36 && t < 0.5) || t >= 0.93)) t = 0.3 + rnd() * 0.05 + (rnd() < 0.5 ? 0.3 : 0);
                tall = t < 0.24;
                if (t < 0.24) {
                    // a tall upright with its wedge
                    const hh = h * (0.86 + rnd() * 0.16);
                    lines.push([[u, 0], [u + lean, hh]]);
                    wedges.push([[u + lean, hh + h * 0.02], [u + lean - h * 0.2, hh - h * 0.13], [u + lean, hh - h * 0.2]]);
                    u += h * (0.3 + rnd() * 0.1);
                } else if (t < 0.36) {
                    // a tooth, or three in a row
                    const m = rnd() < 0.4 ? 3 : 1;
                    for (let j = 0; j < m; j++) {
                        lines.push([[u, 0], [u + lean * 0.4, h * (0.34 + rnd() * 0.1)]]);
                        u += h * 0.24;
                    }
                    u += h * 0.06;
                } else if (t < 0.5) {
                    // a closed loop on the line
                    const w = h * (0.34 + rnd() * 0.1), e = h * (0.32 + rnd() * 0.08);
                    lines.push(round ? S.curve([[u, 0], [u + w * 0.1, e * 0.8], [u + w * 0.55, e], [u + w, e * 0.5], [u + w * 0.7, 0]], false, 4) : [[u, 0], [u + w * 0.5, e], [u + w, 0]]);
                    u += w + h * 0.12;
                } else if (t < 0.62) {
                    // a tail under the line
                    const d = h * (0.26 + rnd() * 0.12);
                    lines.push(round ? S.curve([[u + h * 0.2, 0], [u + h * 0.26, -d * 0.6], [u + h * 0.02, -d], [u - h * 0.3, -d * 0.7], [u - h * 0.36, -d * 0.1]], false, 4) : [[u + h * 0.16, 0], [u + h * 0.2, -d * 0.6], [u - h * 0.06, -d], [u - h * 0.3, -d * 0.86]]);
                    u += h * 0.36;
                } else if (t < 0.74) {
                    // an upright with a flag along the line (a kaf's roof)
                    const hh = h * (0.56 + rnd() * 0.12);
                    lines.push([[u, 0], [u + lean * 0.5, hh], [u + h * 0.46, hh + h * 0.16]]);
                    u += h * 0.58;
                } else if (t < 0.84) {
                    // a low angle (a dal)
                    lines.push([[u, h * 0.02], [u + h * 0.24, h * 0.32], [u + h * 0.3, 0]]);
                    u += h * 0.46;
                } else if (t < 0.93) {
                    // a long low box on the line
                    const w = h * (0.56 + rnd() * 0.2), e = h * (0.26 + rnd() * 0.06);
                    lines.push(round ? S.curve([[u, 0], [u + w * 0.06, e * 0.9], [u + w * 0.5, e], [u + w * 0.94, e * 0.8], [u + w, 0]], false, 4) : [[u, 0], [u, e], [u + w * 0.86, e], [u + w, 0]]);
                    u += w + h * 0.12;
                } else {
                    // a round eye standing on the line
                    const r = h * 0.17, c = [u + r, r * 1.2], pts = [];
                    for (let j = 0; j <= 10; j++) pts.push(pol(r, (j / 10) * TAU, c[0], c[1]));
                    lines.push(pts);
                    u += r * 2 + h * 0.14;
                }
                if (round && rnd() < 0.28) dots.push([u - h * 0.3, rnd() < 0.5 ? h * (0.5 + rnd() * 0.25) : -h * 0.26]);
            }
            lines.push([[u0 - h * 0.04, 0], [Math.min(len, u - h * 0.08), 0]]);
            u += h * (0.3 + rnd() * 0.25);
        }
        return { lines, dots, wedges };
    }
    const straight = (x0, y) => (u, v) => [x0 + u, y - v];
    const onArc = (R, a0) => (u, v) => pol(R + v, a0 + u / R);
    function script(q, rnd, { len, h, lw = h * 0.13, v = 1, round = false, at }) {
        const run = scriptRun(rnd, len, h, round);
        const map = (pts) => {
            // long strokes are cut small enough to follow a curved line
            const out = [];
            for (let i = 0; i < pts.length; i++) {
                if (i) {
                    const a = pts[i - 1], b = pts[i], m = Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / 1.2);
                    for (let k = 1; k < m; k++) out.push(at(a[0] + ((b[0] - a[0]) * k) / m, a[1] + ((b[1] - a[1]) * k) / m));
                }
                out.push(at(pts[i][0], pts[i][1]));
            }
            return out;
        };
        for (const pl of run.lines) line(q, map(pl), lw, v);
        for (const wd of run.wedges) fillP(q, wd.map((p) => at(p[0], p[1])), v);
        for (const d of run.dots) {
            const p = at(d[0], d[1]);
            dot(q, p[0], p[1], lw * 0.7, v);
        }
    }

    // ------------------------------------------------------------------ flans
    // A flan is never a circle: an oval of its own, a slow wobble, and for flans cut with a
    // chisel a straight edge or two.
    const round = (R0, o = {}) => (rnd) => {
        const { oval = 0.015, rough = 0.012, flats = 0, nicks = 0, n = 180 } = o;
        const ph = [0, 1, 2, 3].map(() => rnd() * TAU), a0 = rnd() * TAU, fl = [], nk = [];
        for (let k = 0; k < flats; k++) fl.push([rnd() * TAU, 0.022 + rnd() * 0.03]);
        for (let k = 0; k < nicks; k++) nk.push([rnd() * TAU, 0.014 + rnd() * 0.022, 0.025 + rnd() * 0.03]); // knocks on the edge
        const pts = [];
        for (let i = 0; i < n; i++) {
            const a = (i / n) * TAU;
            let r = R0 * (1 + oval * Math.cos(2 * (a - a0)) + rough * (0.5 * Math.sin(3 * a + ph[0]) + 0.3 * Math.sin(5 * a + ph[1]) + 0.2 * Math.sin(8 * a + ph[2]) + 0.15 * Math.sin(14 * a + ph[3])));
            for (const [fa, depth] of fl) {
                const da = wrap(a - fa);
                if (Math.abs(da) < 1.2) r = Math.min(r, (R0 * (1 - depth)) / Math.cos(da));
            }
            for (const [na, depth, wd] of nk) {
                const da = wrap(a - na) / wd;
                r -= R0 * depth * Math.exp(-da * da);
            }
            pts.push([Math.cos(a) * r, Math.sin(a) * r]);
        }
        return pts;
    };
    // cut with shears: straight sides that are not quite parallel, eased corners
    const square = (hs, o = {}) => (rnd) => {
        const { p = 9, rough = 0.008, n = 160 } = o;
        const skew = [0, 1, 2, 3].map(() => (rnd() - 0.5) * 0.07), ph = rnd() * TAU;
        const pts = [];
        for (let i = 0; i < n; i++) {
            const a = (i / n) * TAU, c = Math.cos(a), s = Math.sin(a), ac = Math.abs(c), as = Math.abs(s);
            const side = ac > as ? (c > 0 ? 0 : 2) : s > 0 ? 1 : 3;
            const r = (hs / Math.pow(Math.pow(ac, p) + Math.pow(as, p), 1 / p)) * (1 + skew[side] * (side % 2 ? c : s) + rough * Math.sin(7 * a + ph));
            pts.push([c * r, s * r]);
        }
        return pts;
    };

    // ------------------------------------------------------------------ metals
    // Two ramps from dark to light (tone 0.7 is a flat face in the house light): the field
    // as it has toned, and the metal where it is rubbed. `rec`: what gathers in the recesses.
    const METAL = {
        gold: {
            field: [[0, '#32180e'], [0.2, '#6b3a12'], [0.45, '#a36a1c'], [0.7, '#cf9c38'], [0.86, '#efcd70'], [1, '#fff1c0']],
            high: [[0, '#55300f'], [0.25, '#96611a'], [0.5, '#c9973a'], [0.7, '#ecc761'], [0.88, '#f9e49a'], [1, '#fffbe0']],
            lift: 0.05, rec: ['#6a3212', 0.62], shade: '#8a4e14', deep: '#4a2410', light: '#fff0b8', bounce: '#d9973a',
        },
        pale: {
            field: [[0, '#2a160c'], [0.2, '#5c3a16'], [0.45, '#8e6e2a'], [0.7, '#bfa04e'], [0.86, '#e8d690'], [1, '#fff8d4']],
            high: [[0, '#4e3a16'], [0.25, '#8f7430'], [0.5, '#c4aa55'], [0.7, '#ecd98c'], [0.88, '#f9eebc'], [1, '#fffdea']],
            lift: 0.07, rec: ['#6a3c14', 0.8], shade: '#84642a', deep: '#4a3214', light: '#fff6cc', bounce: '#d2b25c',
        },
        silver: {
            field: [[0, '#12142a'], [0.2, '#30355a'], [0.45, '#666d8e'], [0.7, '#a2a8c0'], [0.86, '#d6dae8'], [1, '#f6f7fc']],
            high: [[0, '#242846'], [0.25, '#545b80'], [0.5, '#98a0ba'], [0.7, '#cfd4e2'], [0.88, '#eceef5'], [1, '#fbfcff']],
            lift: 0.07, rec: ['#1a1c36', 0.78], shade: '#474c78', deep: '#1e2140', light: '#f4f6ff', bounce: '#8d93b4',
        },
        toned: {
            field: [[0, '#101226'], [0.2, '#2a2d4c'], [0.45, '#585c7a'], [0.7, '#878ba3'], [0.86, '#bfc3d3'], [1, '#eef0f6']],
            high: [[0, '#222644'], [0.25, '#51577a'], [0.5, '#939ab4'], [0.7, '#c9cedc'], [0.88, '#e8ebf3'], [1, '#fafbfe']],
            lift: 0.08, rec: ['#15152c', 0.82], shade: '#3a3d66', deep: '#181a36', light: '#eef1fc', bounce: '#7c82a4',
        },
        grey: {
            field: [[0, '#14162a'], [0.2, '#30344c'], [0.45, '#5e6278'], [0.7, '#898da0'], [0.86, '#c0c3cf'], [1, '#eff0f4']],
            high: [[0, '#2a2d44'], [0.25, '#5c6078'], [0.5, '#9a9eb0'], [0.7, '#cdd0da'], [0.88, '#e9ebf0'], [1, '#fafbfd']],
            lift: 0.08, rec: ['#1e2034', 0.7], shade: '#454960', deep: '#1c1e34', light: '#f0f2f8', bounce: '#8a8ea4',
        },
        verdigris: {
            field: [[0, '#0e120e'], [0.2, '#252e1e'], [0.45, '#445035'], [0.7, '#66734a'], [0.86, '#919e6a'], [1, '#c6d09e']],
            high: [[0, '#28120c'], [0.25, '#5a2a18'], [0.5, '#8e4c2a'], [0.7, '#b87245'], [0.88, '#dca274'], [1, '#f4d2a8']],
            lift: 0.11, rec: ['#141b16', 0.75], shade: '#2a3524', deep: '#10160f', light: '#dfe6b6', bounce: '#7d8a58',
        },
        brown: {
            field: [[0, '#140b09'], [0.2, '#2a1811'], [0.45, '#49301f'], [0.7, '#6a4830'], [0.86, '#9a7450'], [1, '#d2ae84']],
            high: [[0, '#2c180d'], [0.25, '#5e3a1c'], [0.5, '#93672f'], [0.7, '#be9148'], [0.88, '#e0bd7c'], [1, '#f6e2b0']],
            lift: 0.1, rec: ['#1a100c', 0.75], shade: '#3c2418', deep: '#180d0a', light: '#f0d6a4', bounce: '#94683e',
        },
    };
    // what each metal's patina adds: (r, g, b in `c`, lit tone factor f, facts about the pixel)
    const PATINA = {
        // silver kept in a cabinet tones from the rim inwards: violet, then a golden brown
        silver: (c, f, p) => {
            const k = S.smooth(6.5, 0.4, p.e + p.n * 2.6) * 0.5 * (1 - p.hi * 0.7), w = S.smooth(-0.4, 0.5, p.n2);
            c[0] += ((86 + 50 * w) * f - c[0]) * k;
            c[1] += ((72 + 30 * w) * f - c[1]) * k;
            c[2] += ((112 - 34 * w) * f - c[2]) * k;
            // and in slow clouds across the field
            const k2 = S.smooth(-0.25, 0.75, p.n * 0.8 + p.n2 * 0.3) * 0.24 * (1 - p.hi);
            c[0] += (104 * f - c[0]) * k2;
            c[1] += (100 * f - c[1]) * k2;
            c[2] += (134 * f - c[2]) * k2;
        },
        toned: (c, f, p) => {
            const k = S.smooth(-0.5, 0.6, p.n + p.n2 * 0.4) * 0.3 * (1 - p.hi), k2 = S.smooth(5, 0.4, p.e + p.n * 2) * 0.4 * (1 - p.hi * 0.6);
            c[0] += (120 * f - c[0]) * k;
            c[1] += (98 * f - c[1]) * k;
            c[2] += (92 * f - c[2]) * k;
            c[0] += (58 * f - c[0]) * k2;
            c[1] += (56 * f - c[1]) * k2;
            c[2] += (96 * f - c[2]) * k2;
        },
        grey: (c, f, p) => {
            const k = S.smooth(0.1, 0.7, p.n) * 0.3 * (1 - p.hi);
            c[0] += (104 * f - c[0]) * k;
            c[1] += (98 * f - c[1]) * k;
            c[2] += (100 * f - c[2]) * k;
        },
        // bronze from the sea air: malachite in the hollows, cuprite showing in patches
        verdigris: (c, f, p) => {
            const g = S.smooth(0.25, 0.7, p.n2 + p.cav * 1.5 - p.hi) * 0.6;
            c[0] += (88 * f - c[0]) * g;
            c[1] += (160 * f - c[1]) * g;
            c[2] += (128 * f - c[2]) * g;
            const k = S.smooth(0.3, 0.7, -p.n + p.n2 * 0.3) * 0.5 * (1 - p.hi);
            c[0] += (122 * f - c[0]) * k;
            c[1] += (62 * f - c[1]) * k;
            c[2] += (44 * f - c[2]) * k;
        },
        // bronze from the ground: sandy earth left in the hollows
        brown: (c, f, p) => {
            const k = S.smooth(0.06, 0.3, p.cav + p.n * 0.12 - 0.04) * S.smooth(-0.3, 0.3, p.n2 + p.n) * 0.62;
            c[0] += (188 * f - c[0]) * k;
            c[1] += (160 * f - c[1]) * k;
            c[2] += (112 * f - c[2]) * k;
        },
        // gold does not tarnish: only a red earth stays round the pellets
        gold: null,
        pale: null,
    };

    // ------------------------------------------------------------------ the thirteen dies
    // A design gets L(blur, gain, paint, signed): a layer of greys = height, blurred by
    // `blur` units and worth `gain` units at white (signed: mid-grey is level, darker cuts).
    // The coordinates are the die's: its centre at the origin, a standard flan 32 in radius.

    // 1 · tartessos
    function dTartessos(L, rnd) {
        const boss = [];
        for (let i = 0; i < 16; i++) boss.push([...pol(20.5 + (rnd() - 0.5) * 0.4, (i / 16) * TAU + (rnd() - 0.5) * 0.035), 2.4 * (0.93 + rnd() * 0.14)]);
        const cups = [];
        for (let i = 0; i < 8; i++) cups.push([...pol(12.9 + (rnd() - 0.5) * 0.25, ((i + 0.5) / 8) * TAU + (rnd() - 0.5) * 0.03), rnd() * TAU]);
        // the sheet's rolled rim; the collars; the cups
        L(0.34, 0.95, (q) => ringS(q, 0, 0, 28.8, 2.3, 1));
        L(0.15, 0.55, (q) => {
            // a twisted wire, then plain wires that part the rows
            for (let i = 0; i < 78; i++) {
                const a = (i / 78) * TAU;
                line(q, [pol(25.3, a), pol(26.9, a + 0.05)], 0.72, 1);
            }
            for (const r of [24.3, 16.9, 16, 9.2]) ringS(q, 0, 0, r, 0.5, 0.85);
            for (const [x, y, r] of boss) ringS(q, x, y, r + 0.5, 0.46, 1);
            for (const [x, y] of cups) ringS(q, x, y, 3.05, 0.5, 1);
        });
        // hemispheres beaten up from behind (one took a knock)
        L(0.1, 1.9, (q) => {
            boss.forEach(([x, y, r], i) => dome(q, x, y, r, i === 10 ? 0.86 : 1));
            for (let i = 0; i < 8; i++) {
                const p = pol(12.9, (i / 8) * TAU);
                dome(q, p[0], p[1], 1.3, 0.6);
            }
            dome(q, 0, 0, 2.3, 1);
        });
        // granulation: triangles of grains between the bosses, pairs between the cups, a collar
        L(0.08, 0.5, (q) => {
            for (let i = 0; i < 16; i++) {
                if (i === 5) continue; // one triangle came unsoldered
                const a = ((i + 0.5) / 16) * TAU;
                for (const [r, da] of [[22.9, -0.026], [22.9, 0.026], [22, 0], [18.1, 0]]) {
                    const p = pol(r, a + da);
                    dome(q, p[0], p[1], 0.47 + rnd() * 0.08);
                }
            }
            for (let i = 0; i < 8; i++) for (const r of [10.7, 15.1]) {
                const p = pol(r, (i / 8) * TAU);
                dome(q, p[0], p[1], 0.48);
            }
            for (let i = 0; i < 12; i++) {
                const p = pol(3.05, (i / 12) * TAU);
                dome(q, p[0], p[1], 0.44);
            }
            for (const [x, y] of cups) dome(q, x, y, 0.62);
            // a line of fine grains between the two wires; grains between the petals' tips;
            // the solder's beads at the foot of the loop
            for (let i = 0; i < 88; i++) {
                if (i > 30 && i < 34) continue; // rubbed away
                const p = pol(16.45, (i / 88) * TAU);
                dome(q, p[0], p[1], 0.3 + rnd() * 0.06);
            }
            for (let k = 0; k < 8; k++) {
                const p = pol(7.75, (k / 8) * TAU);
                dome(q, p[0], p[1], 0.5);
            }
            for (const x of [-4.5, 4.5]) dome(q, x, -29.2, 0.8);
        });
        // rosettes: eight cells of wire, their floors a little raised
        L(0.13, 0.5, (q) => {
            for (const [x, y, a0] of cups) for (let k = 0; k < 8; k++) {
                const a = a0 + (k / 8) * TAU, p = pol(0.8, a, x, y), pet = lens(p[0], p[1], 1.75, 1.05, a, 0.6);
                fillP(q, pet, 0.45);
                line(q, pet, 0.3, 1, true);
            }
            for (let k = 0; k < 8; k++) {
                const a = (k / 8) * TAU + 0.39, p = pol(3.7, a), pet = lens(p[0], p[1], 4.7 - (k === 3 ? 0.5 : 0), 2.9, a, 0.62);
                fillP(q, pet, 0.42);
                line(q, pet, 0.46, 1, true);
            }
        });
        // the knock one boss took, and a crease in the sheet beside it
        L(0.3, 0.6, (q) => {
            dot(q, boss[10][0] - 0.5, boss[10][1] + 0.4, 1, 0.2);
            line(q, [[boss[10][0] + 2.6, boss[10][1] + 2.4], [boss[10][0] + 4.4, boss[10][1] + 4.6]], 0.3, 0.3);
        }, true);
        // the loop: six turns of wire side by side
        L(0.5, 0.7, (q) => fillP(q, [[-3.9, -36.6], [3.9, -36.6], [3.9, -29.4], [-3.9, -29.4]], 1), false, false);
        L(0.2, 0.85, (q) => {
            for (let i = 0; i < 6; i++) line(q, [[-3.35 + i * 1.34, -36.3], [-3.3 + i * 1.34, -30.3]], 1.12, 1);
        }, false, false);
    }
    const LOOP = S.curve([[-4.6, -30], [-4.7, -36.2], [-3.6, -37.5], [3.6, -37.5], [4.7, -36.2], [4.6, -30], [3.4, -28.6], [-3.4, -28.6]], true, 4);

    // 2 · gadir, the tunas
    function tunaAt(cx, cy, s) {
        const P = (pts) => pts.map(([x, y]) => [cx + x * s, cy + y * s]);
        return {
            P,
            body: P(S.curve([[-20, 0.5], [-16.5, -2.4], [-10, -4.4], [-3, -5], [4, -4.1], [10, -2.4], [14.9, -0.85], [14.9, 0.95], [10, 2.6], [4, 4.3], [-3, 5], [-10, 4.4], [-16.5, 2.9]], true, 8)),
            core: P(S.curve([[-17, 0.2], [-11, -2.2], [-3, -2.9], [5, -2.1], [11, -0.7], [5, 1.8], [-3, 2.5], [-11, 2]], true, 6)),
            tail: P([[13.6, -0.9], [16.4, -2.2], [18.6, -3.8], [20.8, -5.7], [20, -2.9], [18.7, 0.1], [20, 3.1], [20.8, 5.9], [18.6, 4], [16.4, 2.4], [13.6, 1]]),
            fins: [
                [[-9, -4.3], [-6.4, -8.9], [-4.4, -6.6], [0.5, -4.5]], // first dorsal
                [[4.6, -3.9], [6.6, -7.3], [7.6, -5.2], [9, -2.9]], // second dorsal
                [[5.2, 4.1], [7.4, 7.5], [8.2, 5.3], [9.6, 2.9]], // anal
                [[-7.4, 4.5], [-5.6, 7.3], [-4.6, 5.9], [-3.4, 4.9]], // pelvic
            ].map(P),
            finlets: [[10.2, -2.3, -1], [11.7, -1.9, -1], [13.1, -1.5, -1], [10.6, 2.5, 1], [12, 2.1, 1], [13.3, 1.6, 1]].map(([x, y, d]) => P([[x - 0.5, y], [x + 0.55, y + d * 1.35], [x + 0.75, y]])),
        };
    }
    function dGadir(L, rnd) {
        const fish = [tunaAt(0.6, -8, 0.95), tunaAt(-0.7, 8.4, 1)];
        L(0.2, 0.55, (q) => ringS(q, 0, 0, 28.4, 0.95, 1));
        L(0.28, 0.6, (q) => {
            for (const f of fish) {
                fillP(q, f.tail, 1);
                for (const fin of f.fins) fillP(q, fin, 0.85);
                for (const fl of f.finlets) fillP(q, fl, 0.8);
            }
        });
        L(0.38, 0.85, (q) => fish.forEach((f) => fillP(q, f.body, 1)));
        L(1.25, 1.15, (q) => fish.forEach((f) => fillP(q, f.core, 1)));
        // the long pectoral, the keel on the peduncle, the eye
        L(0.22, 0.4, (q) => {
            for (const f of fish) {
                fillP(q, f.P(lens(-11.6, 0.9, 8.4, 1.5, 0.2, 0.3)), 1);
                fillP(q, f.P(S.ellipse(-14.9, 0.2, 2.2, 3.1, 14)), 0.55); // the gill cover's plate
                line(q, f.P([[12.6, 0], [15.4, 0]]), 0.7, 1);
                const e = f.P([[-16.4, -0.5]])[0];
                dome(q, e[0], e[1], 0.95, 1);
            }
        });
        L(0.13, 0.5, (q) => {
            for (const f of fish) {
                // gill cover, mouth, the socket of the eye, fin rays, the line along the flank
                line(q, f.P(S.curve([[-13.4, -3], [-12.2, -0.4], [-13, 3.1]], false, 6)), 0.5, 0.1);
                line(q, f.P([[-19.9, 0.8], [-17.4, 1.3]]), 0.42, 0.12);
                const e = f.P([[-16.4, -0.5]])[0];
                ringS(q, e[0], e[1], 1.35, 0.36, 0.14);
                for (const fin of f.fins) for (const u of [0.35, 0.65]) line(q, [[fin[0][0] + (fin[3][0] - fin[0][0]) * u, fin[0][1] + (fin[3][1] - fin[0][1]) * u], [fin[1][0] + (fin[2][0] - fin[1][0]) * u, fin[1][1] + (fin[2][1] - fin[1][1]) * u]], 0.3, 0.2);
                for (const [a, b] of [[[15.6, -1.2], [20, -4.8]], [[15.8, -0.5], [19.4, -2.7]], [[15.8, 0.6], [19.4, 2.9]], [[15.6, 1.3], [20, 5]]]) line(q, f.P([a, b]), 0.3, 0.22);
                line(q, f.P(S.curve([[-12, -0.9], [-3, -1.5], [6, -0.9], [12.6, -0.2]], false, 6)), 0.28, 0.3);
                // the corselet's scales behind the gill
                for (const [x, y] of [[-10.6, -2.4], [-9, -3], [-10, -0.2], [-8.2, -1.2], [-10.4, 2.2], [-8.6, 1.4], [-6.8, -2.6], [-6.6, 0.2]]) {
                    const c = f.P([[x, y]])[0];
                    q.beginPath();
                    q.arc(c[0], c[1], 0.75, -1.2, 1.2);
                    q.lineWidth = 0.22;
                    q.strokeStyle = grey(0.3);
                    q.stroke();
                }
            }
        }, true);
        // the legends, right to left: mpʿl above, ʾgdr below; a crescent holding a pellet
        // between the heads, an aleph between the tails
        L(0.18, 0.62, (q) => {
            word(q, ['lamed', 'ayin', 'pe', 'mem'], 0.5, -19, { size: 5, lw: 0.92, track: 0.3, tbl: PUNIC, id: 'P', rnd, jit: 1 });
            word(q, ['resh', 'dalet', 'gimel', 'aleph'], -0.5, 23.8, { size: 5, lw: 0.92, track: 0.28, tbl: PUNIC, id: 'P', rnd, jit: 1 });
            q.beginPath();
            q.arc(-23.3, 0.3, 2.7, 1.15, TAU - 1.15);
            q.lineWidth = 1.15;
            q.strokeStyle = grey(1);
            q.stroke();
            dome(q, -22.6, 0.3, 1.05);
            q.save();
            q.translate(22.7, 1.8);
            glyph(q, glyphOf(PUNIC, 'P', 'aleph'), 3.2, 0.72, 1, 'pellet');
            q.restore();
        });
    }

    // 3 · gadir, the head of Melqart in the lion's scalp
    function dMelqart(L, rnd) {
        const neck = [[-6.6, 13], [-7.4, 19], [-9, 25.4], [-2, 27], [5, 26.6], [9.6, 25], [7, 18], [5.4, 11]];
        const face = S.curve([[-9.4, -9.6], [-11.7, -6.8], [-11, -4.6], [-14.2, 0], [-16.6, 2.4], [-14.8, 3.9], [-13.2, 4.5], [-14.6, 5.9], [-12.8, 7], [-14.1, 8.5], [-12.4, 9.9], [-13.5, 12.3], [-11.4, 14.9], [-6.4, 15.1], [-2.4, 12.8], [-0.2, 6], [-0.8, -1], [-4.2, -7], [-7.6, -10]], true, 5);
        // the scalp: the lion's head over the hero's brow, its jaw down his cheek, the mane behind
        const hood = S.curve([[-9.6, -10.8], [-13.4, -11.2], [-16, -13.4], [-16.6, -16.6], [-14.6, -20.6], [-9.6, -24.4], [-3, -26.4], [4, -26], [10.6, -23], [16.2, -17.2], [19.6, -9], [20.2, 0], [18.8, 8], [16, 15.4], [12.8, 21.2], [9.2, 25.2], [6.2, 18], [3, 12.2], [0.6, 5.6], [-0.4, -1], [-3.8, -7], [-7.2, -10.4]], true, 5);
        const edge = S.curve([[-8.4, -10.9], [-4.4, -7.9], [-1.2, -1.4], [-0.2, 5.4], [2.2, 12], [4.8, 16.6]], false, 7);
        const club = [[12.4, 29], [16, 20.8], [19.8, 12.8], [24.6, 3.2]];
        const ear = lens(-2.4, -19.4, 6.6, 3.6, -0.92, 0.5);
        const paws = [S.curve([[4.4, 14.6], [-0.4, 16.4], [-5, 17.4], [-9.2, 21.4]], false, 6), S.curve([[-1, 16], [-4.6, 17.2], [-4.8, 20.8], [-3, 24.6]], false, 6)];
        // locks of the mane: each a flame from its root, the rows falling back and down
        const locks = [];
        for (let row = 0; row < 4; row++) {
            const n = 5 + row;
            for (let i = 0; i < n; i++) {
                const u = (i + 0.5 + (rnd() - 0.5) * 0.4) / n, a = -1.45 + u * 3.05, r0 = 5.6 + row * 3.1 + (rnd() - 0.5) * 0.8;
                const p = pol(r0, a, 4.6, -3.5), bend = Math.min(a + 1.4, 1.7) + (rnd() - 0.5) * 0.4, len = 4.2 + rnd() * 1.6;
                if (Math.hypot(p[0] - 0.4, p[1] + 21.8) < 4.6) continue; // the ear stands clear of them
                locks.push(S.curve([p, [p[0] + Math.cos(bend - 0.55) * len * 0.5, p[1] + Math.sin(bend - 0.55) * len * 0.5], [p[0] + Math.cos(bend) * len, p[1] + Math.sin(bend) * len]], false, 5));
            }
        }
        for (const [x, y] of [[16.4, 10.4], [13.2, 12.4], [14.6, 15.4], [11.4, 17.2], [12.2, 20.4]]) locks.push(S.curve([[x, y], [x - 0.2 + rnd() * 0.8, y + 2.2], [x - 1.4 - rnd(), y + 4.4]], false, 5));
        // short fur on the crown of the lion's head, between its brow and the mane
        const tufts = [];
        for (let j = 0; j < 4; j++) for (let i = 0; i < 5; i++) {
            const x = -8.6 + i * 2.5 + (j % 2) * 1.2 + (rnd() - 0.5) * 0.8, y = -22.6 + j * 2.9 + i * 0.5 + (rnd() - 0.5) * 0.8;
            if (Math.hypot(x - 0.4, y + 21.8) < 4.2 || y > -11.6 + (x + 8.4) * 1.25 || Math.hypot(x + 10.6, y + 17.6) < 3.4 || Math.hypot(x - 4.6, y + 3.5) > 12 + 9 || x > 2.6) continue;
            tufts.push([x, y, 0.35 + rnd() * 0.5]);
        }
        L(0.12, 0.72, (q) => beads(q, 0, 0, 28.3, 46, 0.78, rnd));
        L(0.32, 0.75, (q) => {
            taper(q, club, 2.4, 5.6, 0.95);
            fillP(q, neck, 0.72);
            fillP(q, face, 0.8);
            fillP(q, hood, 1);
            for (const pw of paws) taper(q, pw, 2.7, 2.1, 1);
        });
        // the big volumes: the skull under the scalp, the lion's head, cheek and jaw, the neck
        L(1.5, 0.85, (q) => {
            fillP(q, S.ellipse(7, -9, 9, 11, 30, 0.5), 1);
            fillP(q, S.ellipse(12.4, 8, 4.4, 9, 24, 0.35), 0.75);
            fillP(q, S.ellipse(-9.4, -17.6, 5.6, 4.4, 24, -0.5), 0.8);
        });
        L(1, 0.7, (q) => {
            fillP(q, S.ellipse(-6.4, 3.6, 3.9, 7.2, 24, 0.16), 1);
            fillP(q, S.ellipse(-8.6, -5.6, 3, 2.6, 16), 0.6);
            fillP(q, S.ellipse(-0.6, 20.4, 4.6, 5, 20), 0.8);
            taper(q, club, 1, 3, 0.7);
        });
        L(0.36, 0.55, (q) => {
            // brow, the nose's ridge and wing, lips, chin, the jaw, the neck's muscle
            taper(q, [[-11.5, -7.1], [-8.4, -8.1], [-5.2, -7.4]], 1.6, 1, 1);
            taper(q, [[-11.2, -4.2], [-13.8, 0.1], [-15.6, 2.3]], 1.1, 1.8, 0.9);
            dot(q, -14.2, 3, 0.9, 0.7);
            dot(q, -13.9, 5.7, 0.9, 0.9);
            dot(q, -13.4, 8.4, 0.9, 0.9);
            fillP(q, S.ellipse(-11.6, 12.1, 2, 1.6, 12, 0.5), 0.7);
            taper(q, [[-9.6, 14.3], [-6, 13.9], [-2.6, 11.6]], 1.2, 1, 0.45);
            taper(q, [[1.6, 13], [-1.6, 19.4], [-4, 25.4]], 2.2, 1.6, 0.7);
            // the lion: its muzzle, the ridge over its eye, its ear; the rolled edge of the skin
            fillP(q, S.ellipse(-14.2, -14.9, 2.6, 2.2, 16, -0.5), 1);
            taper(q, [[-13.4, -19.6], [-10, -20.6], [-6.6, -19.4]], 1.5, 1, 1);
            fillP(q, ear, 1);
            fillP(q, taperP(edge, 1.7, 1.3), 0.85);
            // its fangs over the hero's brow
            for (const [x, y] of [[-13.6, -11.2], [-11.4, -10.9]]) fillP(q, [[x - 0.75, y - 0.2], [x + 0.75, y], [x - 0.1, y + 2.1]], 1);
            for (const lk of locks) fillP(q, taperP(lk, 2.3, 0.4), 1);
            for (const [x, y, a] of tufts) fillP(q, lens(x, y, 2.9, 1.25, a, 0.4), 0.7);
            // the paws' toes; knots along the club
            for (const [x, y] of [[-9.6, 20.6], [-9.9, 21.9], [-8.6, 22.3], [-3.9, 24.6], [-2.8, 25.1], [-2, 24.2]]) dome(q, x, y, 0.75, 1);
            dot(q, -4.4, 17.1, 1.9, 1);
            for (const [x, y, r] of [[14.4, 24.2, 1.5], [17.4, 18.4, 1.6], [18.8, 13.6, 1.8], [22, 9.6, 2], [22.6, 5, 2.2], [25.2, 4.4, 1.7]]) dome(q, x, y, r, 0.9);
        });
        L(0.12, 0.5, (q) => {
            // the eye: a socket under the brow, lids, the ball
            fillP(q, lens(-11.6, -4.7, 5.2, 2.5, 0.07, 0.4), 0.12);
            line(q, S.curve([[-11.4, -4.9], [-9, -6.1], [-6.4, -4.4]], false, 5), 0.46, 0.92);
            line(q, S.curve([[-11, -4.2], [-9, -3.5], [-6.8, -4.1]], false, 5), 0.32, 0.78);
            dot(q, -9.5, -4.7, 0.8, 0.88);
            // nostril, the mouth's line and its corner, under the lip, under the jaw
            dot(q, -14.8, 3.4, 0.4, 0.18);
            line(q, [[-14.1, 7.1], [-11.4, 6.6]], 0.42, 0.12);
            dot(q, -11.3, 6.6, 0.34, 0.14);
            line(q, S.curve([[-12.3, 10.1], [-11.4, 10.5], [-10.7, 10.1]], false, 4), 0.34, 0.25);
            line(q, S.curve([[-10.6, 15.5], [-6.2, 15.6], [-2.2, 13.4]], false, 5), 0.46, 0.16);
            // the shade the skin's edge throws on his cheek and brow
            line(q, edge.map(([x, y]) => [x - 1.15, y + 0.3]), 0.42, 0.14);
            line(q, S.curve([[-15.8, -13.4], [-13, -11.6], [-9.4, -10.9]], false, 5), 0.4, 0.14);
            // the lion's eye, nostril and whisker dots, the hollow of its ear
            fillP(q, lens(-12, -17.3, 3.1, 1.4, -0.3, 0.45), 0.1);
            dot(q, -10.7, -17.6, 0.5, 0.9);
            dot(q, -16.2, -15.6, 0.42, 0.14);
            for (const [x, y] of [[-14.4, -13.9], [-13.1, -14.5], [-13.9, -15.6], [-12.4, -13.4]]) dot(q, x, y, 0.22, 0.2);
            fillP(q, lens(-1.6, -20.2, 4.2, 1.7, -0.92, 0.5), 0.2);
            // the parting of the short fur on the crown
            for (const [x, y, a] of tufts) line(q, [[x + 0.3, y + 0.75], [x + 0.3 + Math.cos(a) * 2.3, y + 0.75 + Math.sin(a) * 2.3]], 0.26, 0.22);
            // between the locks
            for (const lk of locks) line(q, lk.map(([x, y]) => [x + 0.85, y + 0.75]), 0.36, 0.14);
            // the knot's turns, claws; rings cut round the club; the neck's truncation
            line(q, [[-5.6, 16.4], [-3.4, 18]], 0.3, 0.2);
            line(q, [[-3.2, 16.2], [-5.4, 18.2]], 0.3, 0.2);
            for (const [x, y] of [[15.6, 21.4], [18.4, 15.6], [20.6, 11], [23.2, 6.6]]) line(q, [[x - 1.6, y - 0.9], [x + 1.6, y + 0.9]], 0.26, 0.26);
            line(q, S.curve([[-8.8, 24.8], [-2, 26.4], [5, 26], [9.2, 24.4]], false, 5), 0.4, 0.22);
        }, true);
    }

    // 4 · the Barcid elephant
    function dBarcid(L, rnd) {
        const k = 0.93, P = (pts) => pts.map(([x, y]) => [(x + 0.6) * k, (y - 1) * k]);
        const torso = P(S.curve([[-19.4, -3.6], [-18, -9.6], [-14.4, -12.2], [-9, -11.4], [-4.6, -10.6], [0, -11.8], [4.4, -13], [8, -13.2], [12.2, -15.4], [15.4, -13.4], [17, -8.6], [15.4, -2.4], [11.4, 3.4], [3, 5.6], [-7, 5.4], [-14.6, 4.2], [-19.4, 0.6]], true, 6));
        const trunk = P(S.curve([[15.4, -7.4], [18.6, -1], [19.9, 6], [18.6, 12.6], [16.2, 15.4], [13.9, 14.6], [14.2, 12.4]], false, 7));
        const legs = [
            [[[1.6, 3], [0.9, 8], [0.7, 13.6], [0.2, 17.4], [4.9, 17.4], [5, 13.6], [5.4, 8.4], [6.4, 3.6]], 0.6], // far front
            [[[-18.4, 0.4], [-20.2, 6.6], [-19.4, 12.4], [-20.2, 17.4], [-15.7, 17.4], [-15.2, 12.6], [-15.4, 7.4], [-13.4, 2.6]], 0.6], // far hind
            [[[6.2, 1], [7.2, 7.4], [7, 13.4], [6.5, 17.4], [11.9, 17.4], [11.5, 13.4], [11.8, 7.6], [12.6, 1]], 1], // near front
            [[[-13, 2], [-13.8, 7.6], [-12.2, 12.6], [-12.2, 17.4], [-6.9, 17.4], [-7.2, 12.8], [-7.4, 7.4], [-5.6, 2.8]], 1], // near hind
        ].map(([pts, v]) => [P(pts), v, [0, 0, 0, pts[3]].map((p) => P([p || [0, 0]])[0])]);
        const ear = P(S.curve([[6.4, -13.6], [2, -12.6], [-0.6, -8], [0, -2.4], [2.6, 2.4], [5.4, 3.2], [7.6, -0.6], [9.2, -6], [8.6, -11.4]], true, 6));
        const tusk = P(S.curve([[13.4, -3.4], [16.6, 0], [20.8, 1.3]], false, 6));
        const tail = P(S.curve([[-19.2, -6.2], [-21.6, -1], [-22.3, 5.6]], false, 6));
        L(0.12, 0.72, (q) => beads(q, 0, 0, 28.6, 50, 0.74, rnd));
        L(0.2, 0.62, (q) => line(q, [[-24.6, 17.3], [-8, 17.6], [10, 17.4], [24.4, 17.7]], 1.05, 1));
        L(0.38, 0.8, (q) => {
            for (const [pts, v] of legs.slice(0, 2)) fillP(q, pts, v);
            taper(q, tail, 1.4, 0.8, 0.9);
            const te = tail[tail.length - 1];
            fillP(q, lens(te[0] - 0.3, te[1] - 0.6, 3, 1.5, 1.45), 0.9);
            fillP(q, torso, 1);
            for (const [pts, v] of legs.slice(2)) fillP(q, pts, v);
            taper(q, trunk, 5.4 * k, 1.9 * k, 1);
            fillP(q, P([[11.6, -0.8], [14.8, 1.8], [11.2, 3]]), 0.9); // the lower lip
        });
        L(1.5, 1.05, (q) => {
            // the barrel, the shoulder, the haunch, the skull's dome
            fillP(q, P(S.ellipse(-4, -3.4, 12.4, 6.2, 30, 0.04)), 1);
            fillP(q, P(S.ellipse(8.6, -6.4, 5.4, 6.8, 24, 0.2)), 0.95);
            fillP(q, P(S.ellipse(-13, -3.4, 5, 6.6, 24, -0.15)), 0.9);
            fillP(q, P(S.ellipse(12.6, -10, 3.6, 3.8, 20)), 0.9);
        });
        L(0.3, 0.62, (q) => {
            // the great ear, lying on the shoulder; the tusk
            fillP(q, ear, 1);
            taper(q, tusk, 1.75 * k, 0.5 * k, 0.9);
        });
        L(0.24, 0.3, (q) => {
            // toenails, the knees, the bulge over the eye
            for (const [, v, raw] of legs) for (const dx of [0.9, 2.4, 3.9]) dome(q, raw[3][0] + dx * k, raw[3][1] - 0.7 * k, 0.74 * k, v);
            for (const [x, y] of [[9.4, 9.6], [-10.2, 9.8]]) fillP(q, P(S.ellipse(x, y, 2, 1.5, 12)), 0.7);
            fillP(q, P(S.ellipse(13.6, -11.8, 1.7, 1, 12, -0.3)), 0.8);
        });
        L(0.13, 0.5, (q) => {
            // the ear's edge and its folds
            line(q, ear.map(([x, y]) => [x + 0.45, y + 0.4]), 0.36, 0.12, true);
            for (const [a, b] of [[[5.6, -11.4], [1.6, -5.6]], [[6.6, -9.4], [2.6, -1.4]], [[7.4, -6.4], [4.8, 1.2]]]) line(q, P(S.curve([a, [(a[0] + b[0]) / 2 - 0.9, (a[1] + b[1]) / 2 - 0.3], b], false, 5)), 0.3, 0.26);
            // the trunk's rings
            for (let i = 2; i < trunk.length - 6; i += 3) {
                const p = trunk[i], n = trunk[i + 1], tx = n[0] - p[0], ty = n[1] - p[1], tl = Math.hypot(tx, ty) || 1, hw = (2.5 - 1.5 * (i / trunk.length)) * k;
                line(q, [[p[0] - (ty / tl) * hw, p[1] + (tx / tl) * hw], [p[0] + (tx / tl) * 0.4, p[1] + (ty / tl) * 0.4], [p[0] + (ty / tl) * hw, p[1] - (tx / tl) * hw]], 0.28, 0.22);
            }
            // the eye in its wrinkles, the mouth, the fold of the armpit and the flank
            const e = P([[13.5, -9.8]])[0];
            fillP(q, lens(e[0] - 1, e[1], 2.1, 1, 0.1), 0.12);
            dot(q, e[0], e[1], 0.34, 0.85);
            line(q, P([[11.4, -0.6], [14.6, 1.7]]), 0.36, 0.15);
            line(q, P(S.curve([[6.2, 1.8], [5.2, -2.4], [6.2, -6]], false, 5)), 0.3, 0.3);
            line(q, P(S.curve([[-6, 4.2], [-7.6, 0], [-7.4, -4.6]], false, 5)), 0.3, 0.3);
            // skin: creases at the knees and on the flank
            for (const [x, y] of [[9.4, 8.2], [9.5, 11], [-10.2, 7.8], [-10, 10.8]]) line(q, P([[x - 2, y], [x, y + 0.5], [x + 2, y]]), 0.24, 0.3);
            for (let i = 0; i < 9; i++) {
                const x = -15 + i * 2.4 + rnd() * 1.2, y = -8 + rnd() * 9;
                line(q, P([[x, y], [x + 0.5, y + 1.6 + rnd()]]), 0.22, 0.36);
            }
            // the tail's tuft
            const te = tail[tail.length - 1];
            for (const d of [-0.5, 0.1, 0.7]) line(q, [[te[0] + d - 0.3, te[1]], [te[0] + d * 1.6 - 0.2, te[1] + 2.4]], 0.22, 0.25);
        }, true);
    }

    // 5 · Obulco
    function dObulco(L, rnd) {
        L(0.12, 0.6, (q) => beads(q, 0, 0, 29.3, 64, 0.62, rnd));
        L(0.3, 0.75, (q) => {
            // the yoke: a beam bent over two necks, its bows and its pin
            taper(q, S.curve([[-11.6, -24.4], [-6, -26.3], [0, -25.6], [6, -26.3], [11.6, -24.4]], false, 6), 1.5, 1.5, 1);
            for (const x of [-6.2, 6.2]) line(q, [[x - 1.5, -25.6], [x - 1.2, -21.9], [x, -20.3], [x + 1.2, -21.9], [x + 1.5, -25.6]], 0.8, 0.9);
            line(q, [[0, -27.2], [0, -23.4]], 0.9, 1);
            for (const x of [-11.6, 11.6]) dot(q, x, -24.4, 1.05, 1);
            // the plough: sole and share, the stilt and its handle, the beam, a brace
            fillP(q, [[-12, -11.9], [5, -12.2], [12.6, -10.1], [5, -9.3], [-12, -9.9]], 1);
            taper(q, S.curve([[-11.2, -10.6], [-14.2, -14.4], [-16.2, -19.2]], false, 5), 1.9, 1.2, 1);
            line(q, [[-17.8, -18.4], [-14.6, -20]], 1.2, 1);
            taper(q, S.curve([[-8, -11.4], [-4, -15.4], [5, -17.2], [14, -17], [21.4, -16.2]], false, 6), 1.9, 1.2, 1);
            line(q, [[1.2, -11.6], [2, -16.6]], 1.05, 0.9);
            // the ear of wheat: its stalk
            taper(q, S.curve([[-22, 14.6], [-15, 13.6], [-8, 13.2], [8, 13]], false, 5), 1.1, 0.8, 1);
        });
        L(0.2, 0.62, (q) => {
            // pegs on the beam; grains in two ranks; awns
            for (const x of [16.4, 19.4]) dome(q, x, -16.6, 0.9);
            for (let i = 0; i < 9; i++) {
                const x = -7.6 + i * 2.5, s = 1 - i * 0.035;
                for (const d of [-1, 1]) {
                    fillP(q, lens(x, 13.1 + d * 0.5, 3.5 * s, 1.75 * s, d * 0.42 + (rnd() - 0.5) * 0.1, 0.42), 1);
                    line(q, [[x + 2.8, 13.1 + d * 1.9], [x + 6.2 + rnd() * 1.6, 13.1 + d * (3.2 + rnd() * 0.5)]], 0.3, 0.8);
                }
            }
            fillP(q, lens(15, 13, 3.6, 1.5, 0, 0.4), 1);
            line(q, [[18, 13], [22.6, 12.8]], 0.3, 0.8);
        });
        L(0.17, 0.62, (q) => {
            // two lines of signs; the town's name
            word(q, [...'ablejcgh'], 0, -1.3, { size: 5.3, lw: 0.92, track: 0.32, tbl: IBER, id: 'I', serif: 'pellet', rnd, jit: 1 });
            word(q, [...'fidkmlh'], 0.4, 6.6, { size: 5.3, lw: 0.92, track: 0.34, tbl: IBER, id: 'I', serif: 'pellet', rnd, jit: 1 });
            word(q, 'OBVLCO', 0, 24.6, { size: 5, lw: 0.95, track: 0.26, serif: 'pellet', rnd, jit: 0.8 });
        });
        L(0.12, 0.4, (q) => {
            // the crease down every grain; the share's edge
            for (let i = 0; i < 9; i++) for (const d of [-1, 1]) {
                const x = -7.6 + i * 2.5, a = d * 0.42;
                line(q, [[x + Math.cos(a) * 0.6, 13.1 + d * 0.5 + Math.sin(a) * 0.6], [x + Math.cos(a) * 2.9, 13.1 + d * 0.5 + Math.sin(a) * 2.9]], 0.26, 0.2);
            }
            line(q, [[5, -10.8], [11.6, -10.3]], 0.3, 0.2);
        }, true);
    }

    // 6 · Hadrian's Hispania
    function dHadrian(L, rnd) {
        // the figure is drawn on a ground line at y = 13.7 and set a size larger on the die's
        const fig = (q) => {
            q.translate(-0.6, 17.2);
            q.scale(1.15, 1.15);
            q.translate(0, -13.7);
        };
        const drape = S.curve([[8.5, 4.5], [-1.5, 0.4], [-4.2, 1.9], [-7.2, 6], [-9.4, 9.8], [-12.2, 11.4], [-12, 13.1], [-4, 13.2], [4, 13.2], [11, 13.2], [12.6, 9.5], [11.6, 5.5]], true, 6);
        const torso = S.curve([[6.2, 5.6], [6.5, 0], [7.1, -3], [8, -5.3], [9.9, -5.9], [13.6, -5], [14.7, -1], [14, 4], [12.6, 9]], true, 6);
        const rock = [[11.4, 13.3], [12, 9.4], [13.6, 8.6], [14, 4.4], [15.6, 2.4], [19, 1.5], [22.6, 2], [24.2, 4.6], [25.6, 5.4], [26.6, 9.8], [26.2, 13.3]];
        const head = S.curve([[9.2, -13.3], [7.9, -12.4], [7.5, -10.7], [6.5, -8.8], [7.3, -8.3], [7, -7.6], [7.5, -7.2], [7.2, -6.6], [7.7, -6.1], [7.7, -5.3], [8.9, -4.7], [11.2, -5.6], [12.7, -8.6], [12.4, -11.8], [11, -13.3]], true, 5);
        const hair = S.curve([[8.1, -12.3], [9.5, -13.8], [11.8, -13.5], [13.3, -11.2], [13.1, -8.4], [12.1, -6.5], [11.1, -7.7], [10.7, -10], [9.5, -11.4]], true, 5);
        const stem = S.curve([[-3.2, -2.2], [-4.4, -7.2], [-6.4, -11.6], [-8.8, -15.4]], false, 8);
        // the mantle: catenaries hanging from the thigh, folds running down the shin, the hem
        const folds = [
            [[10.4, 6.4], [6.4, 9.4], [1.4, 9]], [[6.6, 4.6], [3, 7.8], [-2.2, 7]], [[2.4, 2.8], [0, 6], [-4.2, 5.2]],
            [[-2.6, 2.6], [-5.2, 6.6], [-8.6, 10.2]], [[-0.6, 6.6], [-3.4, 9.6], [-7.4, 11.8]], [[11.4, 11.2], [3, 11.8], [-5, 12.4]],
            [[9.6, 9], [5, 11.2], [-0.6, 10.8]],
        ];
        L(0.12, 0.7, (q) => beads(q, 0, 0, 28.8, 58, 0.74, rnd));
        L(0.2, 0.6, (q) => line(q, [[-24.6, 17.3], [-6, 17.5], [10, 17.2], [25.4, 17.5]], 0.95, 1));
        L(0.18, 0.62, (q) => legend(q, 'HISPANIA', { R: 21.2, size: 5.7, lw: 1, track: 0.3, serif: 'bar', rnd, jit: 0.6 }));
        // a break in the die: a fine raised line from the border in through the legend's end
        L(0.07, 0.22, (q) => line(q, [pol(29.4, -0.5), pol(27, -0.47), pol(25.2, -0.53), pol(23, -0.5), pol(21.4, -0.56), pol(19.6, -0.54)], 0.3, 1));
        L(0.3, 0.8, (q) => {
            fig(q);
            fillP(q, rock, 0.55);
            fillP(q, S.curve([[14, 9.2], [14.2, 5], [15.8, 2.6], [19, 1.5], [22.6, 2.2], [24.2, 4.8], [23.6, 8.4], [19.4, 9.8]], true, 5), 0.86);
            fillP(q, S.curve([[20.2, 13.4], [20.6, 10.4], [23.2, 8.9], [26.2, 9.8], [26.8, 13.4]], true, 5), 0.78);
            fillP(q, S.curve([[11.6, 13.4], [12, 10.2], [14.6, 9.2], [17.6, 10.2], [18.6, 13.4]], true, 5), 0.72);
            for (const [x, y, r] of [[10.2, 12.6, 0.9], [19.4, 12.5, 1], [27.6, 12.7, 0.8]]) dot(q, x, y, r, 0.6);
            // the far arm, bent on the rock, and its hand
            taper(q, [[13.6, -4], [15.6, -1.6], [16.6, 0.6]], 2.5, 2.1, 0.95);
            taper(q, [[16.6, 0.6], [19.4, 0.5], [21.6, 0.9]], 2, 1.5, 0.95);
            fillP(q, S.ellipse(22.7, 1.2, 1.5, 1, 10, 0.3), 0.95);
            fillP(q, drape, 0.9);
            fillP(q, torso, 0.95);
            taper(q, [[9.7, -5], [10, -6.4]], 2.5, 2.3, 0.9);
            fillP(q, head, 0.95);
            // the near arm, held out with the branch
            taper(q, [[8.6, -3.8], [6, -1.6], [3.4, -0.2]], 2.5, 2.1, 1);
            taper(q, [[3.4, -0.2], [0, -1.8], [-2.4, -3.2]], 2, 1.5, 1);
            dot(q, -3, -3.4, 1.15, 1);
            // the rabbit: body, haunch, head, ears laid back, a foreleg, the scut
            fillP(q, S.ellipse(-17.6, 11, 3.3, 2.25, 20, -0.08), 0.85);
            fillP(q, S.ellipse(-14.5, 9.4, 1.7, 1.4, 14, 0.5), 0.85);
            taper(q, [[-15, 8.3], [-16.6, 6.6], [-18.4, 5.5]], 1, 0.55, 0.85);
            taper(q, [[-14.4, 8.1], [-15.4, 6.3], [-16.8, 4.8]], 0.95, 0.5, 0.75);
            line(q, [[-15.2, 11.6], [-14.6, 13.2]], 0.9, 0.85);
            line(q, [[-19.2, 12.4], [-17.4, 13.2]], 0.9, 0.85);
            dot(q, -21, 10.4, 0.75, 0.85);
        });
        L(1.1, 0.9, (q) => {
            fig(q);
            // thigh and shin under the cloth, the body's trunk, the rabbit's haunch, the rock
            taper(q, [[9.4, 8.6], [3, 5.4], [-2.6, 2.6]], 4.6, 3.4, 1);
            taper(q, [[-3.4, 3], [-6.6, 7.4], [-10, 11.2]], 3, 2.2, 0.95);
            fillP(q, S.ellipse(10.4, 1, 3, 5.4, 20, 0.1), 0.9);
            fillP(q, S.ellipse(-18.2, 11, 2.2, 1.4, 14), 0.6);
            fillP(q, S.ellipse(19.4, 8, 4.4, 3.4, 14), 0.75);
        });
        L(0.24, 0.5, (q) => {
            fig(q);
            // the branch: leaves in pairs, three olives
            line(q, stem, 0.62, 1);
            for (let i = 1; i < 6; i++) {
                const p = stem[Math.round((i / 6) * (stem.length - 1))], a = -1.95 + i * 0.03;
                for (const d of [-1, 1]) fillP(q, lens(p[0], p[1], 3.5 - i * 0.2, 1.15, a + d * (0.75 + rnd() * 0.2), 0.42), 1);
                if (i % 2) dome(q, p[0] + 1.3, p[1] + 0.9, 0.62);
            }
            fillP(q, lens(-8.8, -15.4, 3, 1.05, -2.1), 1);
            // hair drawn back over a band to a bun; the breast; her foot; the mantle on the rock
            fillP(q, hair, 0.85);
            fillP(q, S.ellipse(14.1, -8.3, 1.75, 1.5, 12, 0.5), 0.85);
            line(q, S.curve([[8.4, -12.5], [10.6, -11.7], [12.9, -9.6]], false, 4), 0.5, 1);
            dome(q, 8.3, -1.6, 1.4, 0.8);
            dome(q, 8.5, -8.1, 1.3, 0.5);
            fillP(q, lens(-10.2, 11.2, 3.4, 1.5, 2.95), 0.8);
            // the rock's ledges, lit from above
            for (const [a, b] of [[[15.4, 3.6], [18.6, 2.6]], [[21, 9.6], [25.4, 10.2]], [[12.8, 10.6], [16.6, 10.4]]]) line(q, [a, b], 0.9, 0.6);
        });
        L(0.11, 0.46, (q) => {
            fig(q);
            for (const f of folds) line(q, S.curve(f, false, 6), 0.34, 0.12);
            // short folds between the long ones, the hem
            for (const [a, b] of [[[8.4, 5.4], [6, 6.8]], [[4.4, 3.8], [2.6, 5.2]], [[0.4, 2.2], [-0.8, 3.6]], [[-4.6, 8.8], [-6.6, 10.6]], [[1, 12.6], [-3.6, 12.9]]]) line(q, [a, b], 0.26, 0.26);
            line(q, [[-8.6, 8.9], [-9.6, 9.5], [-9.2, 10.3], [-10.4, 10.7]], 0.28, 0.2);
            // the neckline, the mantle across the waist, folds on the chest and down the far arm
            line(q, S.curve([[8.4, -4.7], [10.4, -2.6], [13.2, -4.4]], false, 5), 0.3, 0.2);
            line(q, S.curve([[6.4, 3.6], [10, 5.2], [14, 3.6]], false, 5), 0.36, 0.14);
            for (const x of [9.6, 11.6]) line(q, S.curve([[x, -2], [x + 0.5, 0.8], [x + 0.2, 3.4]], false, 4), 0.26, 0.28);

            // her eye under its brow, the lips' parting, the jaw; strands of hair, the bun's knot
            line(q, [[7.9, -10.3], [8.9, -10.2]], 0.26, 0.14);
            line(q, [[7.3, -7.2], [8.1, -7.1]], 0.2, 0.2);
            line(q, S.curve([[8, -5.4], [9.6, -6], [10.8, -7.6]], false, 4), 0.22, 0.3);
            for (const [a, b] of [[[9, -13], [11.8, -12.4]], [[9.6, -12], [12.4, -10.6]], [[11.4, -9.4], [12.4, -7.4]], [[13.2, -9], [15.2, -7.6]]]) line(q, [a, b], 0.2, 0.26);
            // the rabbit's eye, its haunch, the parting of its ears; cracks in the rock
            dot(q, -14.2, 9.1, 0.26, 0.15);
            line(q, S.curve([[-19, 9.2], [-17.6, 10.6], [-18, 12.6]], false, 4), 0.26, 0.25);
            for (const [a, b] of [[[17.4, 3.4], [18.6, 6.2]], [[18.6, 6.2], [17.6, 8.8]], [[21.4, 3.4], [21, 6.6]], [[23.4, 10.6], [23, 13]], [[15, 10.8], [15.6, 13]]]) line(q, [a, b], 0.3, 0.18);
            for (let i = 0; i < 16; i++) dot(q, 13 + rnd() * 13, 3.5 + rnd() * 9.4, 0.14 + rnd() * 0.16, 0.24);
        }, true);
    }

    // 7 · Leovigild
    function dLeovigild(L, rnd) {
        const bustLines = (q, v) => {
            // the face: an oval of wire
            line(q, S.ellipse(0, -6.4, 5.1, 6.2, 28), 0.95, v, true);
            // the diadem's band, its jewel, the pendants; hair in strands
            line(q, S.curve([[-6.5, -7.6], [-4.2, -12], [0, -13.7], [4.2, -12], [6.5, -7.6]], false, 6), 1, v);
            for (const sx of [-1, 1]) {
                for (let k = 0; k < 3; k++) line(q, [[sx * (5.6 + k * 0.4), -9.4 + k * 1.5], [sx * (8.2 + k * 0.3), -8.4 + k * 1.9]], 0.7, v);
                line(q, [[sx * 2.1, 0.2], [sx * 2.6, 2.6]], 0.85, v);
            }
            // nose and mouth
            line(q, [[0, -8], [0, -3.6]], 0.95, v);
            line(q, [[-1, -3.3], [1, -3.3]], 0.8, v);
            line(q, [[-1.6, -1.4], [1.6, -1.4]], 0.8, v);
            // the cloak: shoulders, nested folds, the V of its opening
            line(q, S.curve([[-13.6, 14.4], [-11.6, 7.6], [-7.6, 4], [-2.8, 2.6], [0, 3.4], [2.8, 2.6], [7.6, 4], [11.6, 7.6], [13.6, 14.4]], false, 6), 1.05, v);
            line(q, S.curve([[-10, 14.6], [-8, 9], [-4.6, 6.6], [0, 5.9], [4.6, 6.6], [8, 9], [10, 14.6]], false, 6), 0.8, v);
            line(q, [[-6.2, 8.4], [0, 14.4], [6.2, 8.4]], 0.8, v);
            // the cross on the breast
            line(q, [[0, 7.4], [0, 12]], 0.8, v);
            line(q, [[-1.9, 9.2], [1.9, 9.2]], 0.8, v);
        };
        const pellets = (q, v) => {
            for (const [x, y, r] of [[-2.1, -7.5, 1], [2.1, -7.5, 1], [0, -14.6, 1.05], [-8.6, -6.2, 0.9], [8.6, -6.2, 0.9], [8.4, 4.9, 1.2]]) dome(q, x, y, r, v);
            for (const sx of [-1, 1]) for (let k = 0; k < 4; k++) dome(q, sx * (12.9 - k * 1.25), 13.2 - k * 2.3, 0.62, v);
        };
        const text = (q, v) => legend(q, '+LEOVIGILDVS REX', { R: 20.4, mid: -Math.PI / 2 + 2.9, size: 5.6, lw: 0.98, v, span: TAU * 0.955, serif: 'pellet', rnd: Motion.rng('leovigild-hand'), jit: 1.2 });
        L(0.12, 0.7, (q) => beads(q, 0, 0, 28.6, 44, 0.84, rnd));
        L(0.3, 0.26, (q) => {
            fillP(q, S.ellipse(0, -6.4, 4.7, 5.8, 24), 1);
            fillP(q, S.curve([[-13.2, 14.4], [-11.4, 7.8], [-7.4, 4.4], [0, 3.6], [7.4, 4.4], [11.4, 7.8], [13.2, 14.4]], true, 5), 0.8);
        });
        // struck twice: a ghost of the first blow, a step aside and a little turned
        L(0.17, 0.6, (q) => {
            q.save();
            q.translate(1.5, -1);
            q.rotate(0.085);
            text(q, 0.38);
            bustLines(q, 0.3);
            q.restore();
            text(q, 1);
            bustLines(q, 1);
        });
        L(0.1, 0.62, (q) => pellets(q, 1));
    }

    // 8 · Spania
    function dSpania(L, rnd) {
        L(0.12, 0.7, (q) => beads(q, 0, 0, 28.4, 42, 0.86, rnd));
        L(0.17, 0.62, (q) => {
            legend(q, 'VICTORIA AVGG', { R: 19.8, mid: -Math.PI / 2, size: 6, lw: 1.05, span: TAU * 0.69, serif: 'pellet', rnd, jit: 1.1 });
            word(q, 'CONOB', 0.3, 24.2, { size: 5.2, lw: 1, track: 0.24, serif: 'pellet', rnd, jit: 1 });
        });
        L(0.3, 0.85, (q) => {
            // the cross potent: flared arms, a bar across every end; three steps
            fillP(q, [[-1.5, -13.6], [1.5, -13.6], [0.85, -6], [1.05, 0], [1.7, 8.8], [-1.7, 8.8], [-1.05, 0], [-0.85, -6]], 1);
            fillP(q, [[-8.6, -6.6], [-1, -5.9], [1, -5.9], [8.6, -6.8], [8.6, -3.3], [1, -4.1], [-1, -4.1], [-8.6, -3.1]], 1);
            line(q, [[-3, -13.9], [3, -13.9]], 1.5, 1);
            line(q, [[-8.9, -7.9], [-8.9, -2]], 1.5, 1);
            line(q, [[8.9, -8.1], [8.9, -2.2]], 1.5, 1);
            for (const [y, hw] of [[9.6, 4.6], [12, 7.4], [14.5, 10.2]]) line(q, [[-hw, y + (rnd() - 0.5) * 0.3], [hw, y + (rnd() - 0.5) * 0.3]], 1.5, 0.95);
        });
        L(0.1, 0.6, (q) => {
            // a pellet in the field, as an officina's mark
            dome(q, 12.4, 3.4, 1.05);
        });
        L(0.14, 0.55, (q) => {
            // and a star of six rays
            for (let k = 0; k < 3; k++) {
                const a = (k / 3) * Math.PI + 0.2;
                line(q, [pol(1.9, a, -12.4, 2.8), pol(1.9, a + Math.PI, -12.4, 2.8)], 0.7, 1);
            }
        });
        L(0.12, 0.3, (q) => line(q, [[0, -12.6], [0, 8]], 0.3, 0.3), true);
    }

    // 9 · the Caliphate's dirham
    function dCaliphate(L, rnd) {
        L(0.09, 0.5, (q) => beads(q, 0, 0, 29.6, 104, 0.47, rnd));
        L(0.14, 0.42, (q) => {
            for (const r of [28.2, 18.9, 17.9]) ringS(q, 0, 0, r, 0.42, 1);
        });
        L(0.13, 0.66, (q) => {
            script(q, rnd, { len: TAU * 21.3 * 0.97, h: 5.1, lw: 0.6, at: onArc(21.3, -Math.PI / 2 + 0.2) });
            for (const [y, hw] of [[-4.2, 11.4], [2.4, 14.2], [9, 10.6]]) script(q, rnd, { len: hw * 2, h: 4.9, lw: 0.64, at: straight(-hw, y) });
            // a floret over the field and a ring under it
            for (let k = 0; k < 5; k++) dot(q, Math.cos(k * 1.2566 - 1.57) * 0.95, -13.4 + Math.sin(k * 1.2566 - 1.57) * 0.95, 0.5, 1);
            ringS(q, 0, 13.6, 0.85, 0.42, 1);
        });
    }

    // 10 · the Almohad dinar
    function dAlmohad(L, rnd) {
        const sq = (hs) => [[-hs, -hs], [hs, -hs], [hs, hs], [-hs, hs]];
        L(0.14, 0.46, (q) => {
            for (const r of [29, 27.9]) ringS(q, 0, 0, r, 0.46, 1);
            line(q, sq(19.4), 0.5, 1, true);
            line(q, sq(18.1), 0.44, 1, true);
        });
        L(0.13, 0.68, (q) => {
            for (const [y, hw] of [[-7.6, 15.8], [1.6, 16], [10.8, 15.6]]) script(q, rnd, { len: hw * 2, h: 6.3, lw: 0.78, round: true, at: straight(-hw, y) });
            for (let k = 0; k < 4; k++) {
                q.save();
                q.rotate(k * 1.5708);
                script(q, rnd, { len: 18.4, h: 4.6, lw: 0.64, round: true, at: straight(-9.2, -21.2) });
                q.restore();
            }
        });
        L(0.09, 0.5, (q) => {
            for (const [x, y] of sq(21.1)) dome(q, x, y, 0.62);
            for (const [x, y] of [[-15, -15.4], [15, -15.4], [-15, 15.6], [15, 15.6]]) dome(q, x, y, 0.5);
        });
    }

    // 11 · the Nasrid square dirham (drawn square on; it hangs from a corner: `turn`)
    function dNasrid(L, rnd) {
        const sq = (hs) => [[-hs, -hs], [hs, -hs], [hs, hs], [-hs, hs]];
        L(0.14, 0.58, (q) => {
            line(q, sq(19.3), 0.56, 1, true);
            line(q, sq(15.9), 0.5, 1, true);
        });
        L(0.09, 0.62, (q) => {
            for (let s = 0; s < 4; s++) for (let i = 0; i < 17; i++) {
                const u = -17.6 + (i + (rnd() - 0.5) * 0.25) * 2.2, p = [[u, -17.6], [17.6, u], [-u, 17.6], [-17.6, -u]][s];
                dome(q, p[0], p[1], 0.56 * (0.85 + rnd() * 0.3));
            }
        });
        L(0.13, 0.72, (q) => {
            for (const [y, hw] of [[-3.4, 14], [3.9, 14.2], [11.2, 13.8]]) script(q, rnd, { len: hw * 2, h: 5.7, lw: 0.78, round: true, at: straight(-hw, y) });
        });
        L(0.14, 0.62, (q) => {
            // the star of eight points
            const pts = [];
            for (let k = 0; k < 16; k++) pts.push(pol(k % 2 ? 1.05 : 2.15, (k / 16) * TAU - 1.5708, 0, -12.7));
            fillP(q, pts, 1);
        });
    }

    // 12 · the excelente
    function dExcelente(L, rnd) {
        const shield = [[-8, -9.4], [8, -9.4], [8, 3], [7.2, 5.6], [5, 8], [0, 10.2], [-5, 8], [-7.2, 5.6], [-8, 3]];
        // a wing: feathers from the arm down, the outer ones longest
        const wing = (sx) => {
            const fs = [];
            for (let i = 0; i < 7; i++) {
                const u = i / 6, root = [sx * (9.4 + u * 8.6), -13.6 - Math.sin(u * 2.6) * 2.4 + u * 3.4], tip = [sx * (10 + u * 10.4 + Math.sin(u * 3.1) * 1.4), 13.2 - u * u * 14.6];
                fs.push([S.curve([root, [(root[0] + tip[0]) / 2 + sx * 1.2 * u, (root[1] + tip[1]) / 2], tip], false, 6), 0.72 + 0.045 * i]);
            }
            return fs;
        };
        const arm = (sx) => S.curve([[sx * 3.4, -12.8], [sx * 8, -16], [sx * 13.6, -16.6], [sx * 18.4, -13.2], [sx * 20.4, -9]], false, 6);
        L(0.11, 0.7, (q) => beads(q, 0, 0, 29.2, 70, 0.66, rnd));
        L(0.16, 0.6, (q) => legend(q, '+SVB:VMBRA:ALARVM:TVARVM:PROTEGE:NOS', { R: 23.2, mid: Math.PI / 2, size: 4.1, lw: 0.74, span: TAU * 0.9, serif: 'bar', rnd, jit: 0.5 }));
        L(0.24, 0.6, (q) => {
            // the tail, the wings feather by feather, the arms that carry them
            for (let i = -2; i <= 2; i++) fillP(q, taperP(S.curve([[i * 0.9, 9.6], [i * 2.1, 14], [i * 2.9, 18.6 - Math.abs(i) * 0.5]], false, 5), 2, 2.9), 0.74 + (i + 2) * 0.05);
            for (const sx of [-1, 1]) {
                for (const [f, v] of wing(sx)) taper(q, f, 2.5, 2.9, v);
                taper(q, arm(sx), 3.2, 1.6, 1);
            }
            // the neck, the head turned to the left, the hooked beak
            taper(q, S.curve([[0.5, -12.4], [0.7, -15.4], [-0.2, -18]], false, 5), 2.8, 2.3, 1);
            fillP(q, S.ellipse(-0.5, -18.4, 2.1, 1.75, 16, -0.2), 1);
            fillP(q, S.curve([[-2, -19.4], [-4.3, -18.6], [-4.7, -17], [-3.6, -17.7], [-2.2, -17.2]], true, 4), 0.95);
        });
        L(0.16, 0.5, (q) => {
            // the nimbus; coverts along the arms; the claws on the shield's flanks
            ringS(q, -0.3, -18.5, 3.7, 0.6, 1);
            for (const sx of [-1, 1]) {
                const a = arm(sx);
                for (let i = 3; i < a.length - 2; i += 3) q.beginPath(), q.arc(a[i][0], a[i][1] + 1.7, 1.2, 0.2, Math.PI - 0.2), (q.lineWidth = 0.5), (q.strokeStyle = grey(1)), q.stroke();
                for (const dy of [-0.9, 0.3, 1.5]) line(q, [[sx * 9.8, 6.4 + dy], [sx * 7.6, 6.9 + dy * 0.8]], 0.6, 1);
            }
        });
        // the shield, crowned
        L(0.26, 0.58, (q) => {
            fillP(q, shield, 1);
            fillP(q, [[-7.6, -12], [7.6, -12], [7.2, -10.1], [-7.2, -10.1]], 1);
            for (let i = -2; i <= 2; i++) {
                const x = i * 3.5, big = i % 2 === 0;
                line(q, [[x, -11.8], [x, big ? -14 : -13.2]], 1, 1);
                dot(q, x, big ? -14.5 : -13.5, big ? 1.05 : 0.66, 1);
                if (big) for (const d of [-1, 1]) dot(q, x + d * 1.05, -13.6, 0.58, 1);
            }
        });
        L(0.13, 0.42, (q) => {
            // quarterly: 1 and 4 Castile and León, 2 and 3 Aragon and Sicily
            const castle = (x, y) => {
                fillP(q, [[x - 1.3, y + 1.2], [x - 1.3, y - 0.5], [x - 0.75, y - 0.5], [x - 0.75, y - 0.1], [x - 0.35, y - 0.1], [x - 0.35, y - 1.2], [x + 0.35, y - 1.2], [x + 0.35, y - 0.1], [x + 0.75, y - 0.1], [x + 0.75, y - 0.5], [x + 1.3, y - 0.5], [x + 1.3, y + 1.2]], 1);
            };
            const lion = (x, y) => {
                line(q, S.curve([[x - 0.9, y + 1.1], [x - 0.2, y + 0.2], [x + 0.5, y - 0.6]], false, 4), 0.85, 1);
                dot(q, x + 0.75, y - 0.95, 0.55, 1);
                line(q, [[x - 0.9, y + 0.4], [x - 1.3, y - 0.6], [x - 0.8, y - 1.1]], 0.34, 1);
                line(q, [[x + 0.3, y + 0.2], [x + 1.2, y + 0.3]], 0.36, 1);
            };
            for (const [x0, y0] of [[-8, -9.4], [0, -0.8]]) {
                castle(x0 + 2, y0 + 2.2);
                lion(x0 + 6, y0 + 2.2);
                lion(x0 + 2, y0 + 6.4);
                castle(x0 + 6, y0 + 6.4);
                line(q, [[x0 + 4, y0 + 0.3], [x0 + 4, y0 + 8.3]], 0.3, 0.8);
                line(q, [[x0 + 0.3, y0 + 4.3], [x0 + 7.7, y0 + 4.3]], 0.3, 0.8);
            }
            for (const [x0, y0, h] of [[0, -9.4, 8.6], [-8, -0.8, 7]]) {
                for (let k = 0; k < 3; k++) line(q, [[x0 + 0.9 + k * 1.15, y0 + 0.4], [x0 + 0.9 + k * 1.15, y0 + h - 0.6 - (x0 < 0 ? (2 - k) * 0.7 : 0)]], 0.5, 1);
                line(q, [[x0 + 4.2, y0 + 0.5], [x0 + 7.6, y0 + h - 1.6]], 0.36, 1);
                line(q, [[x0 + 7.6, y0 + 0.5], [x0 + 4.2, y0 + h - 1.6]], 0.36, 1);
                dot(q, x0 + 4.5, y0 + h / 2 - 0.5, 0.45, 1);
                dot(q, x0 + 7.3, y0 + h / 2 - 0.5, 0.45, 1);
                for (const d of [-0.4, 0.4]) line(q, [[x0 + 5.9 + d, y0 + 0.5], [x0 + 5.9 + d, y0 + 2.2]], 0.26, 1);
            }
            // the pomegranate in the point: fruit, crown, two leaves
            dome(q, 0, 7.4, 1.25);
            for (const d of [-0.5, 0, 0.5]) line(q, [[d, 6.3], [d * 1.7, 5.5]], 0.28, 1);
            for (const d of [-1, 1]) fillP(q, lens(d * 0.9, 8.3, 1.9, 0.8, d > 0 ? 0.5 : Math.PI - 0.5), 1);
        });
        L(0.11, 0.42, (q) => {
            // the shield's quartering lines and its rim; the point; the crown's band
            line(q, shield, 0.4, 0.1, true);
            line(q, [[0, -9.4], [0, 5.2]], 0.36, 0.1);
            line(q, [[-8, -0.8], [8, -0.8]], 0.36, 0.1);
            line(q, S.curve([[-3.4, 9], [-1.6, 6.2], [0, 5.2], [1.6, 6.2], [3.4, 9]], false, 5), 0.32, 0.12);
            line(q, [[-7, -11], [7, -11]], 0.3, 0.2);
            // the eagle's eye, the beak's gape; a shaft down every feather
            dot(q, -1.3, -18.8, 0.3, 0.12);
            line(q, [[-4.4, -17.6], [-2.6, -17.9]], 0.24, 0.15);
            for (const sx of [-1, 1]) for (const [f] of wing(sx)) line(q, f.slice(2, -1), 0.24, 0.24);
            for (let i = -2; i <= 2; i++) line(q, [[i * 1.2, 11], [i * 2.7, 17.6 - Math.abs(i) * 0.5]], 0.24, 0.24);
            // neck feathers
            for (const [x, y] of [[0.2, -13], [1.2, -14.4], [0, -15.6]]) q.beginPath(), q.arc(x, y, 0.8, 0.3, 2.8), (q.lineWidth = 0.24), (q.strokeStyle = grey(0.2)), q.stroke();
        }, true);
    }

    // 13 · the pillar dollar
    function dColumnario(L, rnd) {
        const PX = 13.4;
        const crown = (q, x, y, w, h, closed) => {
            // a band with its jewels, fleurons, and (closed) arches under an orb and cross
            fillP(q, [[x - w / 2, y - 1.15], [x + w / 2, y - 1.15], [x + w / 2 - 0.2, y], [x - w / 2 + 0.2, y]], 1);
            for (let i = -2; i <= 2; i++) {
                const px = x + (i * w) / 4.4, big = i % 2 === 0, top = y - 1.15 - h * (big ? 0.42 : 0.26);
                line(q, [[px, y - 1.1], [px, top]], 0.5, 1);
                dot(q, px, top, big ? 0.52 : 0.36, 1);
            }
            if (closed) {
                for (const d of [-1, 0, 1]) line(q, S.curve([[x + (d * w) / 2.2, y - 1.15 - h * 0.3], [x + (d * w) / 2.6, y - 1.15 - h * 0.74], [x, y - 1.15 - h]], false, 5), 0.5, 1);
                dot(q, x, y - 1.6 - h, 0.6, 1);
                line(q, [[x, y - 2 - h], [x, y - 3.5 - h]], 0.4, 1);
                line(q, [[x - 0.7, y - 2.9 - h], [x + 0.7, y - 2.9 - h]], 0.4, 1);
            }
        };
        const banner = (sx) => S.curve([[sx * PX - 6, -5.4], [sx * PX - 4.6, -3.4], [sx * PX - 1.8, -1.5], [sx * PX + 1.8, 0.1], [sx * PX + 4.7, 2], [sx * PX + 6.1, 4.2]], false, 7);
        // the rim, cut with the laurel of the edge; the toothed border
        L(0.22, 0.6, (q) => ringS(q, 0, 0, 30.55, 1.9, 1));
        L(0.11, 0.45, (q) => {
            for (let i = 0; i < 104; i++) {
                const a = (i / 104) * TAU;
                line(q, [pol(27.4, a), pol(28.9, a)], 0.5, 1);
            }
        });
        L(0.1, 0.4, (q) => {
            for (let i = 0; i < 60; i++) {
                const a = (i / 60) * TAU, d = i % 2 ? 0.03 : -0.03;
                fillP(q, [pol(29.85, a - d), pol(30.5, a - 0.022), pol(31.25, a + d), pol(30.6, a + 0.022)], 0.12);
            }
        }, true);
        L(0.14, 0.56, (q) => {
            legend(q, 'VTRAQUE VNUM', { R: 21.9, size: 4.2, lw: 0.74, track: 0.3, serif: 'bar', rnd, jit: 0.15 });
            legend(q, ['*', 'M', 'o', ' ', '*', '1', '7', '6', '8', '*', ' ', 'M', 'o', '*'], { R: 26.1, mid: Math.PI / 2, size: 4.2, lw: 0.74, track: 0.2, serif: 'bar', flip: true, rnd, jit: 0.15 });
        });
        // the sea: ranks of waves, no two crests alike
        L(0.14, 0.44, (q) => {
            for (const [y, x0, x1, ph] of [[7.4, -9.8, 9.8, 0], [9.5, -9.4, 9.4, 1.6], [12.2, -17.4, 17.4, 0.6], [14.5, -15.6, 15.6, 2.2], [16.8, -13.2, 13.2, 1]]) {
                for (let x = x0 + (ph % 1.6); x < x1 - 1.5; x += 3.3) {
                    const w = 2.7 + rnd() * 0.9, hgt = 0.8 + rnd() * 0.5;
                    line(q, S.curve([[x, y + 0.5], [x + w * 0.3, y - hgt * 0.6], [x + w * 0.62, y - hgt], [x + w * 0.9, y - hgt * 0.3], [x + w * 0.72, y + 0.1]], false, 5), 0.5, 1);
                }
            }
        });
        // the pillars: plinth, base, shaft, capital; behind each a banner's far turn
        L(0.26, 1.3, (q) => {
            for (const sx of [-1, 1]) {
                const x = sx * PX, b = banner(sx), e = b[b.length - 1];
                fillP(q, [[x - 1.75, 8.4], [x - 1.5, -7.4], [x + 1.5, -7.4], [x + 1.75, 8.4]], 0.56);
                fillP(q, [[x - 3, 11.3], [x - 3, 9.9], [x - 2.3, 9.7], [x - 2.3, 8.3], [x + 2.3, 8.3], [x + 2.3, 9.7], [x + 3, 9.9], [x + 3, 11.3]], 0.56);
                fillP(q, [[x - 1.6, -7.2], [x - 2.5, -8.2], [x - 2.7, -9.3], [x + 2.7, -9.3], [x + 2.5, -8.2], [x + 1.6, -7.2]], 0.56);
                // the banner across the shaft, one level plateau in front of it, its ends curling free
                line(q, S.curve([b[0], [b[0][0] - 1.1, b[0][1] - 1.5], [b[0][0] + 0.5, b[0][1] - 2.3]], false, 4), 1.1, 0.8);
                line(q, S.curve([e, [e[0] + 1.1, e[1] + 1.5], [e[0] - 0.5, e[1] + 2.3]], false, 4), 1.1, 0.8);
                fillP(q, taperP(b, 3.8, 3.8), 1);
            }
        });
        L(0.9, 0.5, (q) => {
            // the shafts' roundness, above and below the banners
            for (const sx of [-1, 1]) for (const [y0, y1] of [[-6.6, -3.6 - sx * 0.2], [2.4 + sx * 0.2, 8]]) line(q, [[sx * PX, y0], [sx * PX, y1]], 1.5, 1);
        });
        L(0.2, 0.62, (q) => {
            // the pillars' crowns
            for (const sx of [-1, 1]) crown(q, sx * PX, -9.3, 5.4, sx < 0 ? 3 : 3.6, sx > 0);
        });
        // the two worlds, the left over the right, under the great crown
        L(0.16, 0.34, (q) => {
            for (const sx of [1, -1]) {
                const gr = q.createRadialGradient(sx * 3.2, 1.2, 0, sx * 3.2, 1.2, 5.7);
                for (const k of [0, 0.4, 0.7, 0.9, 1]) gr.addColorStop(k, grey(0.55 + 0.45 * Math.sqrt(1 - k * k)));
                q.fillStyle = gr;
                q.beginPath();
                q.arc(sx * 3.2, 1.2, 5.7, 0, TAU);
                q.fill();
            }
        });
        L(0.5, 0.75, (q) => {
            for (const sx of [1, -1]) dot(q, sx * 3.2, 1.2, 5, 1);
        });
        L(0.14, 0.36, (q) => {
            // lands on the globes
            for (const [x, y, pts] of [
                [-4.6, -0.6, [[-1.4, -2], [0.6, -2.3], [1.6, -0.6], [0.5, 0.8], [1, 2.6], [-0.2, 3.6], [-1.2, 1.6], [-0.6, 0.2]]],
                [-1.4, 2.4, [[-0.6, -1.2], [0.9, -0.9], [1.1, 0.7], [-0.1, 1.5], [-0.9, 0.4]]],
                [3.4, -0.4, [[-1.6, -1.8], [0.4, -2.4], [1.9, -1], [1.3, 0.6], [2.1, 2.2], [0.6, 3.1], [-0.4, 1.2], [-1.5, 0.4]]],
                [6.4, 2.8, [[-0.7, -0.8], [0.7, -0.6], [0.6, 0.8], [-0.6, 0.9]]],
            ]) fillP(q, S.curve(pts.map(([px, py]) => [x + px, y + py]), true, 4), 1);
            crown(q, 0, -5.9, 9.4, 5.6, true);
            for (const d of [-1, 1]) for (let k = 1; k < 5; k++) dome(q, d * (4.2 - k * 0.72), -7.3 - k * 1.02, 0.36);
        });
        L(0.1, 0.4, (q) => {
            // meridians and the line; where one world lies on the other
            for (const sx of [-1, 1]) {
                const cx = sx * 3.2;
                q.save();
                q.beginPath();
                q.arc(cx, 1.2, 5.5, 0, TAU);
                q.clip();
                line(q, [[cx - 5.6, 1.2], [cx + 5.6, 1.2]], 0.22, 0.24);
                for (const rx of [2.2, 4.2]) {
                    q.beginPath();
                    q.ellipse(cx, 1.2, rx, 5.6, 0, 0, TAU);
                    q.lineWidth = 0.2;
                    q.strokeStyle = grey(0.28);
                    q.stroke();
                }
                for (const dy of [-2.6, 2.6]) line(q, S.curve([[cx - 5, 1.2 + dy * 1.05], [cx, 1.2 + dy * 0.85], [cx + 5, 1.2 + dy * 1.05]], false, 5), 0.2, 0.3);
                q.restore();
            }
            q.beginPath();
            q.arc(-3.2, 1.2, 5.85, -1, 1);
            q.lineWidth = 0.34;
            q.strokeStyle = grey(0.1);
            q.stroke();
            // flutes on the shafts, the mouldings of base and capital, the banners' edges
            for (const sx of [-1, 1]) {
                const x = sx * PX;
                for (const d of [-0.55, 0.55]) for (const [y0, y1] of [[-6.8, -3.2 - d * sx * 1.6], [3 - d * sx * 1.6, 8]]) line(q, [[x + d, y0], [x + d * 1.1, y1]], 0.2, 0.3);
                line(q, [[x - 2.4, 9.75], [x + 2.4, 9.75]], 0.24, 0.2);
                line(q, [[x - 2.5, -8.25], [x + 2.5, -8.25]], 0.24, 0.2);
                const b = taperP(banner(sx), 4.2, 4.2);
                line(q, b, 0.26, 0.14, true);
            }
        }, true);
        L(0.08, 0.4, (q) => {
            // the mottoes on the banners
            for (const [sx, txt] of [[-1, 'PLVS'], [1, 'VLTRA']]) {
                const b = banner(sx), a = b[Math.floor(b.length * 0.5) - 6], c = b[Math.floor(b.length * 0.5) + 6];
                q.save();
                q.translate(sx * PX, -0.7);
                q.rotate(Math.atan2(c[1] - a[1], c[0] - a[0]));
                word(q, txt, sx < 0 ? 0.2 : 0, 1.2, { size: 2.4, lw: 0.42, track: sx < 0 ? 0.42 : 0.2, serif: null });
                q.restore();
            }
        });
    }

    // What each kind is: its size (as a fraction of a standard coin), metal, flan, how far
    // off its centre it was struck, where the die bit weakly ([x, y, radius, how much]),
    // from what height the tops are rubbed flat (`wear`: from, to), its cup, its surface.
    const SPEC = {
        tartessos: { rub: [1.3, 2.3], size: 0.95, metal: 'gold', flan: round(30, { oval: 0.006, rough: 0.005 }), loop: LOOP, eye: [0, -33.4], off: [0, 0], wear: [1.9, 2.4], rough: 0.3, grain: 0.02, scratches: 5, pits: 6, edge: [1.2, 0.5], design: dTartessos, glints: [[-13.5, -15.4, 1], [-1.6, -1.6, 0.9], [-21.5, -19.5, 1.6]] },
        gadir: { rub: [1.5, 2.05], size: 1, metal: 'verdigris', flan: round(31, { oval: 0.03, rough: 0.022, flats: 2, nicks: 3 }), off: [1.4, -0.8], wear: [1.6, 2.05], weak: [[14, -19, 12, 0.6]], rough: 0.5, grain: 0.07, scratches: 4, pits: 90, crack: { a: 2.5, depth: 4.6 }, edge: [2.6, 1.3], design: dGadir, glints: [[-6, -10.6, 1.4], [-8, 4.4, 1.2]] },
        'gadir-melqart': { rub: [1.6, 2.5], size: 1, metal: 'verdigris', flan: round(31, { oval: 0.028, rough: 0.024, flats: 2, nicks: 3 }), off: [-1.6, 0.8], wear: [2.1, 2.6], weak: [[18, 18, 11, 0.55]], rough: 0.5, grain: 0.07, scratches: 4, pits: 80, crack: { a: 5.5, depth: 4 }, edge: [2.6, 1.3], design: dMelqart, glints: [[-7.4, 2.6, 1.3], [3, -15, 1.5]] },
        barcid: { cut: [2.3, 7], polish: 30, flow: 50, rub: [1.3, 2.3], size: 0.97, metal: 'toned', flan: round(31, { oval: 0.022, rough: 0.016, nicks: 2 }), off: [-0.8, -1.4], wear: [2, 2.5], weak: [[-19, 16, 10, 0.5]], rough: 0.3, grain: 0.025, scratches: 9, pits: 10, crack: { a: 0.7, depth: 3.6 }, edge: [1.9, 1], design: dBarcid, glints: [[4.2, -8.6, 1.6], [-13.4, -8, 1.2]] },
        obulco: { rub: [0.45, 0.8], size: 1.12, metal: 'brown', flan: round(32, { oval: 0.02, rough: 0.02, flats: 1, nicks: 4 }), off: [1, 0.8], wear: [1.2, 1.5], weak: [[-20, -17, 11, 0.55]], rough: 0.55, grain: 0.07, scratches: 5, pits: 110, crack: { a: 3.6, depth: 4.4 }, edge: [3, 1.5], design: dObulco, glints: [[-2, -17.4, 1.5], [2, 12.2, 1.2]] },
        hadrian: { punch: [-11.5, -1.5], polish: 40, flow: 60, rub: [1.0, 2.0], size: 0.88, metal: 'silver', flan: round(31, { oval: 0.035, rough: 0.014, nicks: 2 }), off: [1.2, -0.2], wear: [1.7, 2.2], weak: [[20, -14, 9, 0.45]], rough: 0.25, grain: 0.02, scratches: 8, pits: 6, crack: { a: 4.1, depth: 3.4 }, edge: [1.8, 1], design: dHadrian, glints: [[3.4, 7.4, 1.5], [10.4, 2, 1]] },
        leovigild: { contrast: 1.4, ao: 0.3, polish: 36, flow: 46, rub: [0.35, 0.65], size: 0.9, metal: 'pale', flan: round(31, { oval: 0.02, rough: 0.012, flats: 2, nicks: 1 }), off: [0.7, 0.5], wear: [0.9, 1.15], weak: [[-16, 17, 12, 0.5]], cup: 2.6, rough: 0.5, grain: 0.02, scratches: 5, pits: 4, crack: { a: 1.1, depth: 3 }, edge: [1, 0.45], design: dLeovigild, glints: [[-2.6, -8.4, 0.7], [-10, 5.6, 1]] },
        spania: { contrast: 1.4, ao: 0.3, polish: 30, flow: 40, rub: [0.4, 0.8], size: 0.8, metal: 'pale', flan: round(31, { oval: 0.03, rough: 0.016, flats: 1 }), off: [-1, 0.9], wear: [1, 1.3], weak: [[20, -14, 11, 0.5]], cup: 1.2, rough: 0.4, grain: 0.02, scratches: 4, pits: 4, crack: { a: 2.2, depth: 2.8 }, edge: [1.1, 0.5], design: dSpania, glints: [[-1, -9, 1.3], [-7.6, -5.6, 0.8]] },
        caliphate: { polish: 50, flow: 70, rub: [0.32, 0.66], size: 1.06, metal: 'grey', flan: round(32, { oval: 0.018, rough: 0.012, nicks: 3 }), off: [1.3, -0.9], wear: [0.82, 1.02], weak: [[-17, -19, 14, 0.7], [22, 12, 8, 0.5]], cup: -0.6, rough: 0.9, grain: 0.03, scratches: 10, pits: 12, crack: { a: 0.3, depth: 5.4 }, edge: [0.9, 0.4], design: dCaliphate, glints: [[-14, -16, 1.6]] },
        almohad: { polish: 44, flow: 60, rub: [0.34, 0.68], size: 0.94, metal: 'gold', flan: round(31, { oval: 0.006, rough: 0.005 }), off: [0.5, -0.4], wear: [0.85, 1.05], weak: [[20, 20, 9, 0.4]], rough: 0.3, grain: 0.015, scratches: 5, pits: 3, edge: [1.2, 0.55], design: dAlmohad, glints: [[-15, -15.6, 1.6], [-9, -9, 1]] },
        nasrid: { polish: 40, flow: 0, rub: [0.34, 0.7], size: 0.92, metal: 'grey', flan: square(21.6), turn: Math.PI / 4, off: [0.7, 0.5], wear: [0.9, 1.1], weak: [[-14, 13, 9, 0.45]], rough: 0.5, grain: 0.03, scratches: 7, pits: 8, holeIn: 5.4, edge: [1.1, 0.5], design: dNasrid, glints: [[-11, -11.6, 1.4]] },
        excelente: { polish: 40, flow: 60, rub: [0.5, 1.1], size: 1.06, metal: 'gold', flan: round(31.4, { oval: 0.012, rough: 0.008, nicks: 1 }), off: [0.5, 0.3], wear: [1.25, 1.6], weak: [[-21, 15, 9, 0.45]], rough: 0.3, grain: 0.015, scratches: 6, pits: 4, crack: { a: 5.2, depth: 2.6 }, edge: [1.2, 0.55], design: dExcelente, glints: [[-3.6, -5.6, 1.2], [-14.4, -12, 1.3]] },
        columnario: { polish: 60, flow: 0, rub: [0.4, 1.0], size: 1.25, metal: 'silver', flan: round(31.6, { oval: 0.003, rough: 0.002, nicks: 1 }), off: [0.1, 0.1], wear: [1.25, 1.6], rough: 0.14, grain: 0.012, scratches: 12, pits: 8, edge: [0.9, 0.5], design: dColumnario, glints: [[-13.8, -3.4, 1.3], [-4.6, -1.6, 1.3], [-21, -21.6, 2]] },
    };

    // ------------------------------------------------------------------ striking a coin
    // a gaussian of sigma `px` on a float field (box passes)
    const blurF = (a, w, h, px) => {
        if (px < 0.3) return a;
        if (px < 1.8) return S.boxBlur(a, w, h, 1, px < 0.75 ? 1 : px < 1.05 ? 2 : 3);
        return S.boxBlur(a, w, h, Math.round(px - 0.45), 3);
    };
    // The airbrush on a sprite: colour sprayed in from its own edges, `w` units deep, from the
    // side `dir` points to (what `Souvenir.spray` does for a polygon; after things/ribbon.js).
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

    function strike(kind, rot, res, pierced, seed) {
        return memo(`${kind}/${rot.toFixed(2)}/${res}/${pierced ? 1 : 0}/${seed}`, () => {
            const K = SPEC[kind], M = METAL[K.metal], sz = K.size;
            // small sprites are painted at twice their size and reduced: a relief of a few
            // pixels needs the samples
            const ss = res < 3 ? 2 : 1, R = res * ss;
            const rnd = Motion.rng(`coin/${kind}/${seed}`);
            const turn = rot + (K.turn || 0), ct = Math.cos(turn) * sz, st = Math.sin(turn) * sz;
            const toS = ([x, y]) => [x * ct - y * st, x * st + y * ct]; // the design's units → the sprite's
            const flan = K.flan(Motion.rng(`flan/${kind}/${seed}`));
            const poly = flan.map(toS), loop = K.loop ? K.loop.map(toS) : null;
            const box = even(S.bbox(loop ? [...poly, ...loop] : poly, 4));
            const w = Math.round(box.w * R), h = Math.round(box.h * R), N = w * h;
            const off = K.off || [0, 0];
            // the hole it hangs from: straight above its centre, wherever that falls on the die
            let hole = null;
            if (pierced && !loop) {
                let top = 1e9;
                for (const p of poly) if (Math.abs(p[0]) < 2.4 && p[1] < top) top = p[1];
                hole = [0, top + (K.holeIn || 3.7), 1.5];
            }
            // a split in the edge: a thin wedge, and a line running on from its point
            let crack = null;
            if (K.crack) {
                const { a, depth } = K.crack, i = Math.round((a / TAU) * flan.length) % flan.length, re = Math.hypot(flan[i][0], flan[i][1]);
                const jag = (r, d) => pol(r, a + d + (S.hashI(Math.round(r * 9), 3, 1, 7) - 0.5) * 0.02);
                crack = [pol(re + 2, a - 0.022), jag(re - depth * 0.45, -0.008), jag(re - depth, 0), jag(re - depth * 0.5, 0.012), pol(re + 2, a + 0.026)].map(toS);
            }
            const mask = (g) => {
                for (const p of [poly, loop]) {
                    if (!p) continue;
                    g.beginPath();
                    S.trace(g, p);
                    g.fill();
                }
                g.save();
                g.globalCompositeOperation = 'destination-out';
                g.fillStyle = '#000';
                if (crack) {
                    g.beginPath();
                    S.trace(g, crack);
                    g.fill();
                }
                if (hole) {
                    g.beginPath();
                    g.arc(hole[0], hole[1], hole[2], 0, TAU);
                    g.fill();
                }
                g.restore();
            };

            // ---- the die's relief, layer by layer
            const cv = document.createElement('canvas');
            cv.width = w;
            cv.height = h;
            const q = cv.getContext('2d', { willReadFrequently: true });
            const T = new Float32Array(N);
            const layer = (blur, gain, paint, signed = false, die = true) => {
                q.setTransform(1, 0, 0, 1, 0, 0);
                q.globalCompositeOperation = 'source-over';
                q.globalAlpha = 1;
                q.fillStyle = signed ? '#808080' : '#000';
                q.fillRect(0, 0, w, h);
                q.save();
                q.setTransform(R, 0, 0, R, -box.x * R, -box.y * R);
                q.rotate(turn);
                q.scale(sz, sz);
                if (die) q.translate(off[0], off[1]);
                q.lineCap = 'round';
                q.lineJoin = 'round';
                paint(q);
                q.restore();
                const d = q.getImageData(0, 0, w, h).data, a = new Float32Array(N);
                if (signed) for (let i = 0; i < N; i++) a[i] = (d[i * 4] - 128) / 127;
                else for (let i = 0; i < N; i++) a[i] = d[i * 4] / 255;
                blurF(a, w, h, blur * sz * R);
                const k = gain * sz;
                for (let i = 0; i < N; i++) T[i] += a[i] * k;
            };
            K.design(layer, rnd);
            if (K.polish || K.flow) {
                // what the die itself left on the field: the hairlines of its last polishing,
                // all one way, and towards the edge the lines of the metal's flow
                layer(0.06, 0.03, (g) => {
                    const r2 = Motion.rng(`die/${kind}/${seed}`), a = r2() * Math.PI, ca = Math.cos(a), sa = Math.sin(a);
                    for (let k = 0; k < (K.polish || 0); k++) {
                        const c = pol(Math.sqrt(r2()) * 26, r2() * TAU), len = 3 + r2() * 12;
                        line(g, [[c[0] - ca * len, c[1] - sa * len], [c[0] + ca * len, c[1] + sa * len]], 0.1 + r2() * 0.08, 0.4 + r2() * 0.6);
                    }
                    for (let k = 0; k < (K.flow || 0); k++) {
                        const b = (k + r2() * 0.8) / K.flow * TAU, r0 = 25.5 + r2() * 3;
                        line(g, [pol(r0, b), pol(r0 + 2.5 + r2() * 4, b + (r2() - 0.5) * 0.02)], 0.12 + r2() * 0.1, 0.5 + r2() * 0.5);
                    }
                });
            }
            // where the die bit weakly the relief fades; the tops are rubbed flat
            const weak = (K.weak || []).map(([x, y, rad, amt]) => [...toS([x + off[0], y + off[1]]), rad * sz, amt]);
            const c0 = K.wear[0] * sz, cap = K.wear[1] * sz;
            for (let y = 0, i = 0; y < h; y++) {
                for (let x = 0; x < w; x++, i++) {
                    let t = T[i];
                    if (t <= 0) continue;
                    if (weak.length) {
                        const ux = box.x + x / R, uy = box.y + y / R;
                        for (const [wx, wy, wr, wa] of weak) t *= 1 - wa * S.smooth(wr, wr * 0.3, Math.hypot(ux - wx, uy - wy));
                    }
                    if (t > c0) t = c0 + (cap - c0) * (1 - Math.exp(-(t - c0) / (cap - c0)));
                    T[i] = t;
                }
            }
            // what happened to it since: hairline scratches, small knocks, pits
            layer(0.09, 0.32, (g) => {
                const r2 = Motion.rng(`life/${kind}/${seed}`);
                for (let k = 0; k < (K.scratches || 0); k++) {
                    const c = pol(r2() * 25, r2() * TAU), len = 2 + r2() * r2() * 14, a = r2() * Math.PI, b = (r2() - 0.5) * 0.08;
                    line(g, S.curve([[c[0] - Math.cos(a) * len * 0.5, c[1] - Math.sin(a) * len * 0.5], [c[0] + Math.sin(a) * len * b, c[1] - Math.cos(a) * len * b], [c[0] + Math.cos(a) * len * 0.5, c[1] + Math.sin(a) * len * 0.5]], false, 5), 0.12 + r2() * 0.12, 0.42 - r2() * 0.16);
                }
                for (let k = 0; k < (K.pits || 0); k++) {
                    const c = pol(Math.sqrt(r2()) * 30, r2() * TAU);
                    dot(g, c[0], c[1], 0.2 + r2() * r2() * 0.75, 0.3 - r2() * 0.26);
                }
                // a money-changer's test: a chisel cut in from the edge, or a small punch
                if (K.cut) fillP(g, [pol(33, K.cut[0] - 0.012), pol(33 - K.cut[1], K.cut[0] + 0.03), pol(33, K.cut[0] + 0.05)], 0);
                if (K.punch) {
                    g.beginPath();
                    g.arc(K.punch[0], K.punch[1], 1.25, 0.5, 3.4);
                    g.lineWidth = 0.62;
                    g.strokeStyle = grey(0);
                    g.stroke();
                }
            }, true, false);

            // ---- the flan under it: the outline's rounded edge, a cup, an uneven face
            q.setTransform(1, 0, 0, 1, 0, 0);
            q.clearRect(0, 0, w, h);
            q.setTransform(R, 0, 0, R, -box.x * R, -box.y * R);
            q.fillStyle = '#fff';
            mask(q);
            const md = q.getImageData(0, 0, w, h).data, inside = new Uint8Array(N);
            for (let i = 0; i < N; i++) inside[i] = md[i * 4 + 3] > 127 ? 1 : 0;
            const dist = S.edt(inside, w, h);
            const eR = K.edge[0] * R, eH = K.edge[1], cup = (K.cup || 0) * sz, R2 = 1 / (1024 * sz * sz), rough = K.rough, grain = K.grain, ns = S.seedOf(kind + '/' + seed);
            const HH = new Float32Array(N);
            for (let y = 0, i = 0; y < h; y++) {
                for (let x = 0; x < w; x++, i++) {
                    if (!inside[i]) continue;
                    const ux = box.x + x / R, uy = box.y + y / R, e = Math.min(1, dist[i] / eR);
                    HH[i] = eH * (1 - (1 - e) * (1 - e)) + cup * (ux * ux + uy * uy) * R2 + rough * (S.noise2(ux * 0.08, uy * 0.08, ns) * 0.7 + S.noise2(ux * 0.21, uy * 0.21, ns + 1) * 0.3) + grain * (S.noise2(ux * 1.3, uy * 1.3, ns + 2) + 0.6 * S.noise2(ux * 3.1, uy * 3.1, ns + 3)) + T[i];
                }
            }
            // how far each point lies under its surroundings, at two scales: where the dirt
            // stays (broad), and the foot and the crest of every ridge (fine)
            const B = T.slice(), B2 = T.slice();
            blurF(B, w, h, 1.3 * sz * R);
            blurF(B2, w, h, 0.42 * sz * R);

            // ---- lit and coloured
            const at = (x, y) => Math.min(h - 1, Math.max(0, Math.round((y - box.y) * R))) * w + Math.min(w - 1, Math.max(0, Math.round((x - box.x) * R)));
            const fF = S.rampFn(M.field, 1), fH = S.rampFn(M.high, 1), a3 = [0, 0, 0], b3 = [0, 0, 0], recC = S.hex2rgb(M.rec[0]), pat = PATINA[K.metal], fact = { e: 0, n: 0, n2: 0, hi: 0, cav: 0 };
            const [rub0, rub1] = K.rub, ao = K.ao ?? 0.22, con = K.contrast ?? 1.25;
            const sp = S.form({
                box, res: R, mask, inflate: 'none', ramp: M.field, soft: 1, seed: kind + '/' + seed,
                height: (x, y) => HH[at(x, y)],
                mottle: { amp: 0.05, freq: 0.05 }, stroke: { amp: 0.045, freq: 0.4, tone: 5 },
                tint: (x, y, tone, rgb) => {
                    const i = at(x, y), t = T[i] / sz, cav = (B[i] - T[i]) / sz, fine = (B2[i] - T[i]) / sz;
                    const n = S.noise2(x * 0.1, y * 0.1, ns + 5), n2 = S.noise2(x * 0.42, y * 0.42, ns + 6);
                    // the engraver's accent: shade at the foot of every ridge, light along its
                    // crest; the relief a little lighter than the field; the tooth of the paint
                    tone += M.lift * S.smooth(0.04, 0.8, t) - ao * S.clamp(fine * 2.6, -0.45, 1) + (S.hashI(Math.floor(x * 7), Math.floor(y * 7), 3, ns) - 0.5) * 0.035;
                    tone = S.clamp(0.7 + (tone - 0.7) * con);
                    // rubbed metal on what stands highest, in patches
                    const hi = S.smooth(rub0, rub1, t + n * 0.22 * (rub1 - rub0));
                    fF(tone, a3);
                    fH(tone, b3);
                    rgb[0] = a3[0] + (b3[0] - a3[0]) * hi;
                    rgb[1] = a3[1] + (b3[1] - a3[1]) * hi;
                    rgb[2] = a3[2] + (b3[2] - a3[2]) * hi;
                    // what gathers in the recesses
                    const f = 0.45 + 0.75 * tone, rec = S.smooth(0.02, 0.26, cav * 0.75 + Math.max(0, fine) * 1.6 + n2 * 0.03) * M.rec[1];
                    rgb[0] += (recC[0] * f - rgb[0]) * rec;
                    rgb[1] += (recC[1] * f - rgb[1]) * rec;
                    rgb[2] += (recC[2] * f - rgb[2]) * rec;
                    if (pat) {
                        fact.e = dist[i] / R;
                        fact.n = n;
                        fact.n2 = n2;
                        fact.hi = hi;
                        fact.cav = cav;
                        pat(rgb, f, fact);
                    }
                },
            });
            // the emblem's airbrush over the relief: shade from the lower right, a light on
            // the lit lip, the ground's light thrown back into the shadow's edge
            sprayIn(sp, R, { color: M.shade, alpha: 0.5, w: 15 * sz, push: 7 * sz, dir: SD });
            sprayIn(sp, R, { color: M.deep, alpha: 0.62, w: 3, dir: SD });
            sprayIn(sp, R, { color: M.light, alpha: 0.3, w: 11 * sz, push: 5 * sz, dir: LIT });
            sprayIn(sp, R, { color: M.light, alpha: 0.55, w: 2.2, dir: LIT });
            sprayIn(sp, R, { color: M.bounce, alpha: 0.7, w: 1.1, push: 0.4, dir: SD });
            {
                // clean highlights: on the lit lip of the flan, and on the highest points
                const g = sp.canvas.getContext('2d');
                g.save();
                g.setTransform(R, 0, 0, R, -box.x * R, -box.y * R);
                g.globalCompositeOperation = 'source-atop';
                const n = poly.length, lip = [];
                for (let i = 0; i < n; i++) {
                    const p = poly[i], a = Math.atan2(p[1], p[0]), r = Math.hypot(p[0], p[1]);
                    if (Math.abs(wrap(a + 2.36)) < 0.5) lip.push(pol(r - K.edge[0] * 0.42, a));
                }
                if (lip.length > 3) {
                    S.ink(g, lip, { w: 0.62, color: M.light, alpha: 0.85 });
                    let j = poly[0];
                    for (const p of poly) if (Math.abs(wrap(Math.atan2(p[1], p[0]) + 1.64)) < Math.abs(wrap(Math.atan2(j[1], j[0]) + 1.64))) j = p;
                    const a = Math.atan2(j[1], j[0]), r = Math.hypot(j[0], j[1]) - K.edge[0] * 0.42;
                    S.ink(g, [pol(r, a - 0.05), pol(r, a), pol(r, a + 0.05)], { w: 0.55, color: M.light, alpha: 0.7 });
                }
                for (const [x, y, len] of K.glints || []) {
                    // (a short fat streak and a dash under it: a hairline would read as a scratch)
                    const c = toS([x + off[0], y + off[1]]), l = len * sz * 0.8, wd = 0.62 * sz * Math.min(1.25, len);
                    S.ink(g, [[c[0] - l * 0.5, c[1] + l * 0.4], [c[0], c[1]], [c[0] + l * 0.5, c[1] - l * 0.4]], { w: wd * 2, color: M.light, alpha: 0.3, taper: [0.7, 0.7] });
                    S.ink(g, [[c[0] - l * 0.5, c[1] + l * 0.4], [c[0], c[1]], [c[0] + l * 0.5, c[1] - l * 0.4]], { w: wd, color: M.light, alpha: 0.9, taper: [0.6, 0.6] });
                    S.ink(g, [[c[0] - l * 0.95, c[1] + l * 0.76], [c[0] - l * 0.72, c[1] + l * 0.58]], { w: wd * 0.8, color: M.light, alpha: 0.75, taper: [0.5, 0.5] });
                }
                g.restore();
            }

            // ---- the contour, heavier towards the shadow; the hole cut through all of it
            const A = document.createElement('canvas');
            A.width = w;
            A.height = h;
            const G = A.getContext('2d');
            G.setTransform(R, 0, 0, R, -box.x * R, -box.y * R);
            const lw = K.line ?? 1.35;
            G.fillStyle = G.strokeStyle = S.INK;
            G.lineJoin = 'round';
            G.lineWidth = lw * 2;
            for (const k of [0, 0.5, 1]) {
                G.save();
                G.translate(SD[0] * lw * 0.75 * k, SD[1] * lw * 0.75 * k);
                for (const p of [poly, loop]) {
                    if (!p) continue;
                    G.beginPath();
                    S.trace(G, p);
                    G.fill();
                    G.stroke();
                }
                G.restore();
            }
            G.drawImage(sp.canvas, box.x, box.y, box.w, box.h);
            if (hole) {
                G.save();
                G.globalCompositeOperation = 'destination-out';
                G.beginPath();
                G.arc(hole[0], hole[1], hole[2] - 0.42, 0, TAU);
                G.fill();
                G.restore();
                // the bore's wall that faces the light
                G.beginPath();
                G.arc(hole[0], hole[1], hole[2] - 0.2, -0.3, 1.9);
                G.lineWidth = 0.3;
                G.strokeStyle = S.rgba(M.light, 0.8);
                G.stroke();
            }
            let out = A;
            if (ss > 1) {
                out = document.createElement('canvas');
                out.width = w / ss;
                out.height = h / ss;
                const o = out.getContext('2d');
                o.imageSmoothingQuality = 'high';
                o.drawImage(A, 0, 0, out.width, out.height);
            }
            const eye = hole ? [hole[0], hole[1]] : K.eye ? toS(K.eye) : [0, box.y + 4];
            return { canvas: out, box, eye, holeR: hole ? hole[2] : 0, loop: !!loop };
        });
    }

    // ------------------------------------------------------------------ drawers
    const resOf = (g, s) => Math.min(8, Math.max(1, Math.ceil(S.pxScale(g) * s * 2 - 1e-6) / 2));
    const paste = (g, sp, x, y, s) => {
        g.save();
        g.imageSmoothingQuality = 'high';
        g.drawImage(sp.canvas, x + sp.box.x * s, y + sp.box.y * s, sp.box.w * s, sp.box.h * s);
        g.restore();
    };
    function coin(g, o = {}) {
        const { x = 0, y = 0, r = 32, kind = 'gadir', rot = 0, seed = '', pierced = false, cast = true } = o;
        if (!SPEC[kind]) return null;
        const s = r / 32, sp = strike(kind, Math.round(rot * 50) / 50, resOf(g, s), pierced, String(seed));
        if (cast) S.cast(g, (q) => paste(q, sp, x, y, s), { blur: 3.4 * s, dx: 1.9 * s, dy: 3 * s, color: 'rgba(16,10,36,0.6)' });
        paste(g, sp, x, y, s);
        return { x, y, r, kind, eye: [x + sp.eye[0] * s, y + sp.eye[1] * s] };
    }
    const size = (kind) => SPEC[kind].size;
    function box(kind, r = 32) {
        const K = SPEC[kind], s = (r / 32) * K.size, t = K.turn || 0, c = Math.cos(t) * s, sn = Math.sin(t) * s;
        const pts = [...K.flan(Motion.rng(`flan/${kind}/`)), ...(K.loop || [])].map(([x, y]) => [x * c - y * sn, x * sn + y * c]);
        return S.bbox(pts, 2.4 * (r / 32));
    }

    // ------------------------------------------------------------------ the string
    const GILT = { ink: '#1a1630', deep: '#6b3f14', base: '#c8943a', light: '#f8e3a0' };
    // a wire ring seen at a slant: an ellipse; `from`/`to` pick an arc of it
    function wire(g, cx, cy, rx, ry, tilt, w, from = 0, to = TAU) {
        const arc = (dx, dy, lw, col, a0 = from, a1 = to) => {
            g.beginPath();
            g.ellipse(cx + dx, cy + dy, rx, ry, tilt, a0, a1);
            g.lineWidth = lw;
            g.strokeStyle = col;
            g.stroke();
        };
        g.save();
        g.lineCap = 'round';
        arc(SD[0] * w * 0.3, SD[1] * w * 0.3, w + 0.9, GILT.ink);
        arc(0, 0, w, GILT.deep);
        arc(-0.12 * w, -0.14 * w, w * 0.62, GILT.base);
        // the light runs along the upper left of the wire
        const a0 = Math.max(from, Math.PI * 0.95), a1 = Math.min(to, Math.PI * 1.6);
        if (a1 > a0) arc(-0.2 * w, -0.22 * w, w * 0.3, GILT.light, a0, a1);
        g.restore();
    }
    function chainOn(g, pts, s, seed) {
        // links lying flat and standing on edge by turns, each a little out of true
        const rnd = Motion.rng('chain/' + seed), step = 3.3 * s;
        let acc = 0, next = step * 0.5, k = 0;
        for (let i = 1; i < pts.length; i++) {
            const a = pts[i - 1], b = pts[i], d = Math.hypot(b[0] - a[0], b[1] - a[1]);
            while (next <= acc + d) {
                const u = (next - acc) / d, x = a[0] + (b[0] - a[0]) * u, y = a[1] + (b[1] - a[1]) * u, ang = Math.atan2(b[1] - a[1], b[0] - a[0]) + (rnd() - 0.5) * 0.22;
                if (k % 2) wire(g, x, y, 2.35 * s, 1.5 * s, ang, 0.72 * s);
                else {
                    const c = Math.cos(ang) * 1.75 * s, sn = Math.sin(ang) * 1.75 * s;
                    g.save();
                    g.lineCap = 'round';
                    for (const [lw, col, dx, dy] of [[0.95 * s + 0.9, GILT.ink, SD[0] * 0.25 * s, SD[1] * 0.25 * s], [0.95 * s, GILT.deep, 0, 0], [0.56 * s, GILT.base, -0.1 * s, -0.12 * s], [0.24 * s, GILT.light, -0.16 * s, -0.2 * s]]) {
                        g.beginPath();
                        g.moveTo(x - c + dx, y - sn + dy);
                        g.lineTo(x + c + dx, y + sn + dy);
                        g.lineWidth = lw;
                        g.strokeStyle = col;
                        g.stroke();
                    }
                    g.restore();
                }
                next += step;
                k++;
            }
            acc += d;
        }
    }
    function string(g, o = {}) {
        const { path, r = 32, seed = 'string', chain = true } = o;
        const kinds = (o.kinds || KINDS).filter((k) => SPEC[k]);
        if (!path || path.length < 2 || !kinds.length) return [];
        const s = r / 32, rnd = Motion.rng('coin-string/' + seed);
        const seg = [];
        let len = 0;
        for (let i = 1; i < path.length; i++) {
            const d = Math.hypot(path[i][0] - path[i - 1][0], path[i][1] - path[i - 1][1]);
            seg.push([len, d]);
            len += d;
        }
        const at = (sd) => {
            let i = 0;
            while (i < seg.length - 1 && seg[i][0] + seg[i][1] < sd) i++;
            const k = S.clamp((sd - seg[i][0]) / (seg[i][1] || 1)), p = path[i], q = path[i + 1];
            return [p[0] + (q[0] - p[0]) * k, p[1] + (q[1] - p[1]) * k];
        };
        if (chain) {
            S.cast(g, (q) => chainOn(q, path, s, seed), { blur: 1.6 * s, dx: 0.9 * s, dy: 1.5 * s, color: 'rgba(16,10,36,0.55)' });
            chainOn(g, path, s, seed);
        }
        // each coin takes the room its width asks for; a short path makes them overlap
        const ws = kinds.map((k) => SPEC[k].size * 64 * s), total = ws.reduce((a, b) => a + b, 0), margin = 5 * s, f = (len - margin * 2) / total;
        let acc = margin;
        const items = kinds.map((kind, i) => {
            const sd = acc + (ws[i] * f) / 2 + (rnd() - 0.5) * 3 * s;
            acc += ws[i] * f;
            const p = at(sd), rot = (rnd() - 0.5) * 0.46, ry = (SPEC[kind].loop ? 3.9 : 2.6 + rnd() * 1.3) * s, tilt = (rnd() - 0.5) * 0.3, z = rnd() + (i % 2 ? 0.5 : 0);
            const sp = strike(kind, Math.round(rot * 50) / 50, resOf(g, s), true, String(seed));
            // every other coin hangs lower, from a few links of its own, so they lie in two tiers
            const drop = i % 2 ? (2 + Math.floor(rnd() * 2)) * 3.3 * s : 0;
            // the ring hooks under the chain; the coin hangs from the ring by the top of its hole
            const ringTop = p[1] + drop + 0.6 * s, ringBot = ringTop + ry * 2, eyeY = sp.loop ? ringBot - 1.2 * s : ringBot + (sp.holeR - 0.75) * s;
            return { kind, rot, z, sp, drop: drop ? [[p[0], p[1] + 1.2 * s], [p[0] + (rnd() - 0.5) * s, p[1] + drop + 1.2 * s]] : null, ring: [p[0], ringTop + ry, 1.9 * s, ry, tilt], x: p[0] - sp.eye[0] * s, y: eyeY - sp.eye[1] * s, r };
        });
        for (const it of items.slice().sort((a, b) => a.z - b.z)) {
            const [cx, cy, rx, ry, tilt] = it.ring, w = 0.95 * s;
            if (it.drop) {
                S.cast(g, (q) => chainOn(q, it.drop, s, seed + it.kind), { blur: 1.4 * s, dx: 0.9 * s, dy: 1.3 * s, color: 'rgba(16,10,36,0.5)' });
                chainOn(g, it.drop, s, seed + it.kind);
            }
            S.cast(g, (q) => wire(q, cx, cy, rx, ry, tilt, w), { blur: 1.2 * s, dx: 0.8 * s, dy: 1.2 * s, color: 'rgba(16,10,36,0.5)' });
            wire(g, cx, cy, rx, ry, tilt, w);
            S.cast(g, (q) => paste(q, it.sp, it.x, it.y, s), { blur: 3.4 * s, dx: 1.9 * s, dy: 3 * s, color: 'rgba(16,10,36,0.62)' });
            paste(g, it.sp, it.x, it.y, s);
            if (!it.sp.loop) {
                // the near limb of the ring comes down over the coin's lip into the hole,
                // and the cut where the ring was closed shows on it
                const a0 = Math.PI * 0.5, a1 = Math.PI * 1.22;
                S.cast(g, (q) => wire(q, cx, cy, rx, ry, tilt, w, a0, a1), { blur: 0.8 * s, dx: 0.5 * s, dy: 0.8 * s, color: 'rgba(16,10,36,0.5)' });
                wire(g, cx, cy, rx, ry, tilt, w, a0, a1);
                g.save();
                g.translate(cx, cy);
                g.rotate(tilt);
                g.beginPath();
                g.moveTo(-rx - w * 0.5, -ry * 0.1);
                g.lineTo(-rx + w * 0.5, -ry * 0.16);
                g.lineWidth = 0.28 * s;
                g.strokeStyle = GILT.ink;
                g.stroke();
                g.restore();
            }
        }
        return items.map(({ kind, rot, x, y }) => ({ kind, rot, x, y, r }));
    }

    return { coin, string, box, size, KINDS };
})();
