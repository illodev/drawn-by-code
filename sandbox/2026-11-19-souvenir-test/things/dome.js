// The dome: the ceilings of al-Andalus seen from below, looking straight up, in the emblem
// manner (crisp pieces, a dark contour, airbrushed relief), lit from above: looking up, the
// light is where the dome opens, so every piece is lit on the side that faces the axis and
// casts its shadow away from it (and a little more from the top left, the windows on the
// sun's side). Global: Dome. Used by tableaux/dome.js; every drawer paints a whole ring of
// a stratum about the axis (the origin), in the layer's own units.
//
// How it is painted. A ring is too big and too even for pieces laid one by one with the
// kit's `piece`, and too regular for sprites: every one of its thousands of tiles, cells and
// tesserae has to differ. So each ring is painted the way a deferred renderer works: its
// colours (albedo) and its heights are laid on two sheets, by canvas fills for the large
// pieces and per pixel for the small repeated ones (each piece takes its own tone, tilt, wear
// from a hash of its own index), and then one pass lights the heights from the crown: a crisp
// arris on every edge, a soft airbrushed swell over every piece, an occlusion in every hollow
// and the cast shadow of every raised piece, marched along the light (`surface`).
// The interlace is exact: straight strapwork is an arrangement of lines (`lines`), its faces
// and its over-and-under come from counting which side of each line a point is on (the
// checkerboard parity of the arrangement: going along a strand, every crossing flips it, so
// over and under alternate along every strand and agree at every crossing).
//
// The real things, and what is true in each (what is from memory is said in the report):
//
// 1 · Cut-tile dado (alicatado), Nasrid, 14th c., as in the Hall of the Two Sisters and the
//     Comares hall of the Alhambra: shapes nibbled from glazed tiles of five colours and set
//     face down in plaster. 1 the field a lazo of eight: in every square of the lattice a
//     wheel of eight chords run on to the square's edge and mirrored into the next (stars,
//     their petals, the strapwork continuous); a wheel of sixteen (a {16/6} star, every
//     chord run on to its framed panel, a star of eight at its heart) in the middle of the
//     side walls  2 five glazes: tin white, cobalt, copper green, honey, manganese black
//     3 no two pieces of one glaze the same tone, the glaze run thin on the arris  4 each
//     piece set by hand, never level: some catch the light, some do not  5 the white
//     strapwork pieced, butting with a joint at every crossing it passes under  6 crazing
//     and pinholes  7 a chipped arris showing the buff biscuit  8 a piece gone, its print in
//     the plaster; one put back in the wrong colour  9 grime in the joints, darker low down
//     10 crowning the dado a band of stepped merlons (almenillas), a fillet and a chequer.
// 2 · Plaster (yesería) of leaves, ataurique: 1 the sebka, a net of lobed lozenges, each
//     holding a split palmette (two half-palmettes in a lyre, two small leaves at its foot)
//     2 palmettes all different: fingers, curl, a pine cone, a bud or a shell at the top,
//     a finger broken off  3 carved deep, the ground left rough  4 polychromy in traces:
//     azure grounds (red in every fourth lozenge) flaking to the plaster, gold on the relief
//     5 the knot band where the inscription would run: a chain of interlaced rings, each
//     over its neighbour at the top and under it at the bottom, a flower in each (no
//     script)  6 a crack across a panel, half of it filled in a whiter plaster  7 a cornice
//     of dentils with red between  8 a cable moulding down every corner of the room  9 a
//     swift's nest in a corner of the cornice, straw and feathers glued with spittle, its
//     droppings down the wall  10 grime lower on the wall.
// 3 · Carpentry of interlaced stars (lazo), as in the ceilings of Comares and the Mudéjar
//     armaduras: 1 the laths over and under by turns  2 a groove down every lath between two
//     white fillets  3 the panels painted red, green, blue, white; a gilt star of eight on
//     red in every octagon  4 cedar under the paint, its grain  5 a gilt pendant (racimo,
//     small muqarnas seen from below) at each corner of the octagonal opening, a moulded
//     frame round it  6 corbels (canecillos) all round the frieze, their ends rolled and
//     lobed, their soffits painted (a red band with a white zigzag, blue edges), a corbel
//     down each corner  7 the boards between them white with red darts (saetinos); the beam
//     they come out of with a running frieze of small interlace between gilt beads  8 worm
//     holes, cracks along the grain  9 a lath gone, the board and its nails showing; paint
//     gone where the water came in  10 a swift's nest between two corbels.
// 4 · Muqarnas (mocárabes), the dome of the Two Sisters: 1 cells in tiers, each tier turned
//     half a step on the one below, so the plan is rings of zigzags (48, 32 and 16 points:
//     sixteen-fold)  2 every cell a small niche: dark in its back, bright at its lip, the
//     half that faces the light lit; rows by turns a single pocket or two facets on a ridge
//     3 the lips inked heavy, the cells' walls fine  4 the sixteen windows of the drum,
//     lattices of plaster against the dawn; the gibbous moon in one, still on the night
//     side; gilt colonnettes between them; strapwork above  5 azure, red and green in the
//     backs of the cells, gilt on the lips  6 a lip chipped, the reed core showing  7 a
//     cobweb in a cell  8 a crack running up each tier, hairline cracks in some cells
//     9 soot in the back corners  10 a cell restored in whiter plaster.
// 5 · The ribbed dome before the mihrab of Córdoba, 10th c., and its gold mosaic, laid by a
//     master sent from Byzantium: 1 eight ribs, each from a support to the third one on,
//     so they cross as an eight-pointed star round an octagon, over and under by turns
//     2 the ribs' soffits lobed at the edges, a gilt bead, carved rosettes on red, blue
//     fillets, the flank away from the axis in shadow  3 between them gold mosaic,
//     tesserae one by one in rows that follow the octagon  4 scrolls in green, blue and red
//     glass on the gold, each bay's a little different, outlined by a row of dark
//     tesserae as a mosaicist sets them  5 gold tesserae set at their own tilt: some blaze,
//     some go dark  6 a few set on their backs, brown-red; a few whose skin is lost  7 grey
//     lime in every joint  8 ONE tessera missing, its socket red with the bed's underpaint
//     9 the crown a shell of sixteen flutes in gold mosaic  10 at its centre the lantern
//     open to the sky, an eight-pointed star (two squares) in a moulded frame lit by dawn.
// The air: dust in the shafts of light from the windows, a spider's thread across the way.
//
// API (every drawer paints whole, static, in the caller's units, origin on the axis):
//   Dome.dado(g, o)       the walls' cut tile, a rectangular ring           (stratum 1, near)
//   Dome.plaster(g, o)    the walls' stucco and the knot band, a square ring (stratum 1, far)
//   Dome.air(g, o)        shafts of light, dust, the spider's thread         (the air)
//   Dome.corbels(g, o)    the carpentry's frieze of corbels                  (stratum 2, near)
//   Dome.lattice(g, o)    the ceiling of interlaced stars, an octagonal ring (stratum 2, far)
//   Dome.muqarnas(g, o)   one tier of muqarnas cells (o.tier 0, 1, 2)        (stratum 3)
//   Dome.ribs(g, o)       the eight crossing ribs                            (stratum 4, near)
//   Dome.mosaic(g, o)     the gold mosaic between the ribs                   (stratum 4, far)
//   Dome.crown(g, o)      the scalloped shell and its star lantern           (the plate)
const Dome = (() => {
    const S = Souvenir;
    const TAU = Math.PI * 2;
    const { clamp, smooth, hashI, noise2, mix } = S;
    const rgb = S.hex2rgb;
    const SQ2 = Math.SQRT2;
    const hashS = (s) => S.seedOf(s);
    // a hash of up to three integers, in [0, 1)
    const h3 = (a, b, c, s) => hashI(a | 0, b | 0, c | 0, s | 0);

    // ------------------------------------------------------------------ the light
    // Looking up, the light is where the dome opens: towards the axis, and a little from the
    // top left. Returns [lx, ly, lz] (unit), the direction towards the light.
    const TL = [-0.62, -0.78];
    // HOUSE: the film's house light from the top left (things lying in front of us, the
    // stratum); LROT: the frame a painter's pattern is turned by, so a turned fragment's
    // own shading (a muqarnas cell's lit half) still answers to the top left.
    let HOUSE = 0, LROT = 0, LOOSE = 0;
    function lightAt(x, y, out, elev = 0.62) {
        if (HOUSE) {
            const c = Math.cos(elev), a = Math.atan2(TL[1], TL[0]) - LROT;
            out[0] = Math.cos(a) * c;
            out[1] = Math.sin(a) * c;
            out[2] = Math.sin(elev);
            return out;
        }
        const r = Math.hypot(x, y), w = smooth(10, 240, r);
        let lx = TL[0] * 0.5 - (r > 1e-6 ? x / r : 0) * 0.85 * w;
        let ly = TL[1] * 0.5 - (r > 1e-6 ? y / r : 0) * 0.85 * w;
        const l = Math.hypot(lx, ly) || 1, c = Math.cos(elev);
        out[0] = (lx / l) * c;
        out[1] = (ly / l) * c;
        out[2] = Math.sin(elev);
        return out;
    }

    // ------------------------------------------------------------------ the surface
    // The pixels a context paints for `box` (no rotation in its transform), and a surface
    // painted on them: colours and heights first, then one lighting pass.
    //   draw(A, Hc, Mc)  canvas fills: A the colour (with alpha), Hc the heights as greys
    //                    (white = `depth` units towards the eye), Mc: red = gloss, green =
    //                    metal (gold), blue = how much the piece is excused from the shadow
    //   pix(P)           per pixel work over the arrays (P.a rgba, P.h heights in units,
    //                    P.gl gloss, P.mt metal, P.tx/P.ty a tilt added to the normal)
    //   sharp, soft      blur radii (units) of the heights: the arris, and the airbrushed
    //                    swell (`swell` its weight)
    //   ao, aoK, aoA     the hollows: radius, gain, strength
    //   cast, castA      the cast shadow: its reach (units) and strength
    //   diff             how far the lit and shaded sides go from the local colour
    //   env(x, y)        a gain on the light at a point (the dome's glow towards the axis)
    function surface(g, box, o = {}) {
        const m = g.getTransform(), k = m.a;
        const X0 = Math.max(0, Math.floor(k * box.x + m.e)), Y0 = Math.max(0, Math.floor(k * box.y + m.f));
        const X1 = Math.min(g.canvas.width, Math.ceil(k * (box.x + box.w) + m.e)), Y1 = Math.min(g.canvas.height, Math.ceil(k * (box.y + box.h) + m.f));
        if (X1 - X0 < 2 || Y1 - Y0 < 2) return null;
        const W = X1 - X0, H = Y1 - Y0, N = W * H;
        const sheetOf = (fill) => {
            const c = document.createElement('canvas');
            c.width = W;
            c.height = H;
            const q = c.getContext('2d', { willReadFrequently: true });
            if (fill) {
                q.fillStyle = fill;
                q.fillRect(0, 0, W, H);
            }
            q.setTransform(k, 0, 0, k, m.e - X0, m.f - Y0);
            return q;
        };
        const A = sheetOf(null), Hc = sheetOf('#000'), Mc = sheetOf('#000');
        const depth = o.depth ?? 8;
        if (o.draw) o.draw(A, Hc, Mc);
        const a = A.getImageData(0, 0, W, H).data;
        const hd = Hc.getImageData(0, 0, W, H).data, md = Mc.getImageData(0, 0, W, H).data;
        const h = new Float32Array(N), gl = new Float32Array(N), mt = new Float32Array(N), ex = new Float32Array(N);
        for (let i = 0; i < N; i++) {
            h[i] = (hd[i * 4] / 255) * depth;
            gl[i] = md[i * 4] / 255;
            mt[i] = md[i * 4 + 1] / 255;
            ex[i] = md[i * 4 + 2] / 255;
        }
        const em = new Float32Array(N);
        // a fragment: only inside its outline (clip draws it, in the caller's units), and its
        // pattern read from the ring it was broken from (map: a point here → a point there)
        let mask = null;
        if (o.clip) {
            const mc = sheetOf(null);
            mc.fillStyle = '#fff';
            o.clip(mc);
            const md2 = mc.getImageData(0, 0, W, H).data;
            mask = new Uint8Array(N);
            for (let i = 0; i < N; i++) mask[i] = md2[i * 4 + 3] > 127 ? 1 : 0;
        }
        const P = { W, H, N, k, x0: (X0 + 0.5 - m.e) / k, y0: (Y0 + 0.5 - m.f) / k, a, h, gl, mt, ex, em, tx: new Float32Array(N), ty: new Float32Array(N), box, map: o.map || null, mask };
        LROT = o.lrot ?? 0;
        if (o.pix) o.pix(P);
        LROT = 0;
        // ---- light
        const blurOf = (src, ru) => {
            const r = Math.max(1, Math.round(ru * k));
            return S.boxBlur(Float32Array.from(src), W, H, r, 2);
        };
        const H1 = blurOf(h, o.sharp ?? 0.5), H2 = blurOf(h, o.soft ?? 5), H3 = blurOf(h, o.ao ?? 14);
        const swell = o.swell ?? 0.6, diff = o.diff ?? 1.15, aoK = o.aoK ?? 0.18, aoA = o.aoA ?? 0.45, castA = o.castA ?? 0.5, reach = (o.cast ?? 10) * k;
        // lit on a sheet of its own, then laid on the caller's canvas (which is never read back)
        const outC = document.createElement('canvas');
        outC.width = W;
        outC.height = H;
        const oq = outC.getContext('2d');
        const out = oq.createImageData(W, H), od = out.data;
        const L = [0, 0, 0];
        const steps = 7;
        for (let y = 0, i = 0; y < H; y++) {
            const uy = P.y0 + y / k;
            for (let x = 0; x < W; x++, i++) {
                const al = a[i * 4 + 3];
                if (!al) continue;
                if (em[i] > 0) {
                    // light itself (a window's sky): not lit, it lights
                    const o4 = i * 4;
                    od[o4] = a[o4];
                    od[o4 + 1] = a[o4 + 1];
                    od[o4 + 2] = a[o4 + 2];
                    od[o4 + 3] = al;
                    continue;
                }
                const ux = P.x0 + x / k;
                lightAt(ux, uy, L, o.elev);
                const xm = x > 0 ? i - 1 : i, xp = x < W - 1 ? i + 1 : i, ym = y > 0 ? i - W : i, yp = y < H - 1 ? i + W : i;
                const gx = ((H1[xp] - H1[xm]) + swell * (H2[xp] - H2[xm])) * k * 0.5 + P.tx[i];
                const gy = ((H1[yp] - H1[ym]) + swell * (H2[yp] - H2[ym])) * k * 0.5 + P.ty[i];
                const nz = 1 / Math.sqrt(1 + gx * gx + gy * gy);
                const lam = (-gx * L[0] - gy * L[1] + L[2]) * nz;
                const t = lam - L[2];
                const occ = clamp((H3[i] - h[i]) * aoK);
                // the cast shadow: march towards the light; whatever rises above the ray shades
                let sh = 0;
                if (castA > 0) {
                    const ll = Math.hypot(L[0], L[1]) || 1, dx = L[0] / ll, dy = L[1] / ll, tanE = L[2] / ll;
                    const h0 = H1[i];
                    for (let s = 1; s <= steps; s++) {
                        const d = (reach * s) / steps;
                        const X = Math.round(x + dx * d), Y = Math.round(y + dy * d);
                        if (X < 0 || Y < 0 || X >= W || Y >= H) break;
                        const rise = H1[Y * W + X] - h0 - (d / k) * tanE;
                        if (rise > sh) sh = rise;
                    }
                    sh = clamp(sh / 2.2) * (1 - ex[i]);
                }
                const env = o.env ? o.env(ux, uy) : 1;
                const metal = mt[i];
                let b = (1 + diff * (1 + metal * 1.3) * t - aoA * occ - castA * sh) * env;
                let r = a[i * 4], gg = a[i * 4 + 1], bb = a[i * 4 + 2];
                // shadows cooler and deeper, lights warmer
                const cool = clamp(1 - b, 0, 1), warm = clamp(b - 1, 0, 1);
                r *= b * (1 - 0.16 * cool + 0.06 * warm);
                gg *= b * (1 - 0.06 * cool + 0.02 * warm);
                bb *= b * (1 + 0.1 * cool - 0.1 * warm);
                // a sheen: glaze, glass, gold
                const gls = gl[i];
                if (gls > 0) {
                    const hx = L[0], hy = L[1], hz = L[2] + 1, hl = Math.hypot(hx, hy, hz);
                    const sp = Math.pow(Math.max(0, ((-gx * hx - gy * hy + hz) / hl) * nz), 18 + 40 * (1 - metal)) * gls * (1 - sh * 0.8);
                    r += (255 - r) * sp;
                    gg += (250 - gg) * sp;
                    bb += (228 - bb) * sp;
                }
                const o4 = i * 4;
                od[o4] = r;
                od[o4 + 1] = gg;
                od[o4 + 2] = bb;
                od[o4 + 3] = al;
            }
        }
        oq.putImageData(out, 0, 0);
        g.save();
        g.setTransform(1, 0, 0, 1, 0, 0);
        g.drawImage(outC, X0, Y0);
        g.restore();
        return P;
    }

    // ------------------------------------------------------------------ lines
    // An arrangement of straight lines in families of parallels: { a (the normal's angle),
    // period (0 for one line), offs: [...] }. at(x, y, R) fills R with the two nearest lines
    // (signed distances d1, d2, their normals and constants), the face's key (a hash of how
    // many lines of each family lie below the point) and its parity.
    function lines(fams) {
        const F = fams.map((f) => ({ nx: Math.cos(f.a), ny: Math.sin(f.a), P: f.period || 0, offs: f.offs }));
        const cnt = new Int32Array(F.reduce((s, f) => s + f.offs.length, 0));
        function parity(x, y) {
            let p = 0;
            for (const f of F) {
                const u = x * f.nx + y * f.ny;
                for (const o of f.offs) p += f.P ? Math.floor((u - o) / f.P) : u > o ? 1 : 0;
            }
            return ((p % 2) + 2) % 2;
        }
        function at(x, y, R) {
            let d1 = 1e9, d2 = 1e9, key = 17, par = 0, j = 0;
            let f1 = 0, c1 = 0, f2 = 0, c2 = 0;
            for (let fi = 0; fi < F.length; fi++) {
                const f = F[fi], u = x * f.nx + y * f.ny;
                for (const o of f.offs) {
                    const v = u - o;
                    let dd, n, c;
                    if (f.P) {
                        n = Math.floor(v / f.P);
                        const kk = Math.round(v / f.P);
                        dd = v - kk * f.P;
                        c = o + kk * f.P;
                    } else {
                        n = v > 0 ? 1 : 0;
                        dd = v;
                        c = o;
                    }
                    cnt[j++] = n;
                    par += n;
                    key = Math.imul(key ^ (n + 0x9e37), 0x85ebca6b) ^ (key >>> 13);
                    const ad = Math.abs(dd);
                    if (ad < Math.abs(d1)) {
                        d2 = d1; f2 = f1; c2 = c1;
                        d1 = dd; f1 = fi; c1 = c;
                    } else if (ad < Math.abs(d2)) {
                        d2 = dd; f2 = fi; c2 = c;
                    }
                }
            }
            R.d1 = d1; R.d2 = d2; R.f1 = f1; R.f2 = f2; R.c1 = c1; R.c2 = c2;
            R.key = key >>> 0;
            R.par = ((par % 2) + 2) % 2;
            R.cnt = cnt;
            return R;
        }
        // At the crossing of the two nearest lines: is line 1 the one on top? (The strand is
        // over where the face just ahead of the crossing on its left is even: along a strand
        // that alternates, and at a crossing the two strands always disagree.)
        function over1(R) {
            const a = F[R.f1], b = F[R.f2];
            const det = a.nx * b.ny - a.ny * b.nx;
            if (Math.abs(det) < 1e-9) return true;
            const X = (R.c1 * b.ny - R.c2 * a.ny) / det, Y = (a.nx * R.c2 - b.nx * R.c1) / det;
            const e = 0.37;
            return parity(X + e * (a.ny + a.nx), Y + e * (-a.nx + a.ny)) === 0;
        }
        return { at, over1, parity, F };
    }

    // n chords at distance c from the centre (a {n/k} star of radius c / cos(kπ/n)), run on
    const wheel = (n, c, phase = 0) => lines(Array.from({ length: n }, (_, i) => ({ a: phase + (i * TAU) / n, period: 0, offs: [c] })));

    // A field of rosettes on a square lattice of period T: in every cell a wheel of n chords at
    // c, run on to the cell's edge and mirrored into the next cell (the strands turn on the
    // edge: a star and its petals in every cell, the strapwork continuous). Over and under
    // alternate along every strand because the parity is flipped from cell to cell (a cell
    // is the mirror of its neighbour, and a mirror would otherwise repeat the last crossing).
    // A face cut by a cell's edge is one tile: its key is taken in one canonical cell.
    // at(x, y, R) as `lines`, plus R.orbit (faces of the same shape share it: same glaze),
    // R.ring (how far from the cell's centre, 0..1), R.ci, R.cj.
    const rosCache = new Map();
    function rosettes(T, n, c, phase = Math.PI / n) {
        const ck = [T, n, c, phase].join('/');
        if (rosCache.has(ck)) return rosCache.get(ck);
        const Wl = wheel(n, c, phase), R0 = {}, G = 180, h = T / 2;
        const info = new Map();
        for (let j = 0; j < G; j++) {
            for (let i = 0; i < G; i++) {
                const x = -h + ((i + 0.5) / G) * T, y = -h + ((j + 0.5) / G) * T;
                Wl.at(x, y, R0);
                const K = R0.key;
                if (!info.has(K)) info.set(K, { n: 0, d: 0, L: 0, Rt: 0, Tp: 0, B: 0, mx: 0, my: 0 });
                const q = info.get(K);
                q.n++;
                q.d += Math.hypot(x, y);
                if (i === 0) q.L = 1;
                if (i === G - 1) q.Rt = 1;
                if (j === 0) q.Tp = 1;
                if (j === G - 1) q.B = 1;
                if (!q.mx) {
                    q.mx = Wl.at(-x, y, R0).key;
                    q.my = Wl.at(x, -y, R0).key;
                }
            }
        }
        const groups = new Map();
        for (const [K, q] of info) {
            const gk = Math.round(q.n / 6) + '/' + Math.round((q.d / q.n / T) * 60);
            if (!groups.has(gk)) groups.set(gk, { d: q.d / q.n / T, keys: [] });
            groups.get(gk).keys.push(K);
        }
        const list = [...groups.values()].sort((a, b) => a.d - b.d);
        list.forEach((gr, gi) => gr.keys.forEach((K) => (info.get(K).orbit = gi)));
        function at(x, y, R) {
            const ci = Math.round(x / T), cj = Math.round(y / T);
            Wl.at(x - ci * T, y - cj * T, R);
            let K = R.key, I = ci, J = cj, q = info.get(K);
            R.orbit = q ? q.orbit : 0;
            R.ring = q ? q.d / q.n / T : 0;
            if (q && q.L) {
                K = q.mx;
                I--;
                q = info.get(K);
            }
            if (q && q.Tp) {
                K = q.my;
                J--;
            }
            R.key = (Math.imul(K, 0x9e3779b1) ^ Math.imul(I + 4096, 0x85ebca6b) ^ Math.imul(J + 8192, 0xc2b2ae35)) >>> 0;
            R.ci = ci;
            R.cj = cj;
            R.flip = (ci + cj) & 1;
            return R;
        }
        const over1 = (R) => Wl.over1(R) !== !!R.flip;
        const res = { at, over1, F: Wl.F, groups: list, T };
        rosCache.set(ck, res);
        return res;
    }

    // ------------------------------------------------------------------ small tools
    // every pixel of a surface, with its point in the caller's units
    function each(P, fn) {
        const M = P.map, K = P.mask, Q = [0, 0];
        for (let y = 0, i = 0; y < P.H; y++) {
            const uy = P.y0 + y / P.k;
            for (let x = 0; x < P.W; x++, i++) {
                if (K && !K[i]) continue;
                if (M) {
                    M(P.x0 + x / P.k, uy, Q);
                    fn(Q[0], Q[1], i);
                } else fn(P.x0 + x / P.k, uy, i);
            }
        }
    }
    // a ring painter's options for a fragment of it (see `fragment`)
    const frag = (o, opts) => (o.map ? {
        ...opts, map: o.map, clip: o.clip, lrot: o.lrot, env: o.env ?? (() => 1),
        // the painter's vector pass, drawn in the ring's units through the fragment's affine
        draw: o.xf && opts.draw ? (A, Hc, Mc) => {
            for (const q of [A, Hc, Mc]) {
                q.save();
                q.transform(...o.xf);
            }
            opts.draw(A, Hc, Mc);
            for (const q of [A, Hc, Mc]) q.restore();
        } : null,
    } : opts);
    const put = (P, i, c, al = 255) => {
        const o4 = i * 4;
        P.a[o4] = c[0];
        P.a[o4 + 1] = c[1];
        P.a[o4 + 2] = c[2];
        P.a[o4 + 3] = al;
    };
    const lerp3 = (A, B, t, o) => {
        o[0] = A[0] + (B[0] - A[0]) * t;
        o[1] = A[1] + (B[1] - A[1]) * t;
        o[2] = A[2] + (B[2] - A[2]) * t;
        return o;
    };
    const tint = (o, A, t) => lerp3(o, A, clamp(t), o);
    // A wall of a rectangular room folded out about the axis: which side (0 top, 1 right,
    // 2 bottom, 3 left), u along it (clockwise), v out from the inner edge, m how far from
    // the corner's mitre. The rooms's corners are the diagonals.
    function wallAt(x, y, hx, hy, W) {
        const dx = Math.abs(x) - hx, dy = Math.abs(y) - hy;
        if (dy >= dx) {
            W.side = y < 0 ? 0 : 2;
            W.v = dy;
            W.u = y < 0 ? x : -x;
        } else {
            W.side = x > 0 ? 1 : 3;
            W.v = dx;
            W.u = x > 0 ? y : -y;
        }
        W.m = Math.abs(dx - dy) / SQ2;
        return W;
    }
    // the wall's frame on the page: (u, v) → (x, y); v grows away from the axis
    const wallXf = (side, hx, hy) => [
        [1, 0, 0, -1, 0, -hy],
        [0, 1, 1, 0, hx, 0],
        [-1, 0, 0, 1, 0, hy],
        [0, -1, -1, 0, -hx, 0],
    ][side];
    // distance out from an octagon of inradius r with flat sides facing the axes; and which side
    function octAt(x, y, r, O) {
        let best = -1e9, side = 0;
        for (let k = 0; k < 8; k++) {
            const a = (k * Math.PI) / 4, d = x * Math.cos(a) + y * Math.sin(a);
            if (d > best) {
                best = d;
                side = k;
            }
        }
        const a = (side * Math.PI) / 4;
        O.v = best - r;
        O.side = side;
        O.t = -x * Math.sin(a) + y * Math.cos(a); // along the side
        return O;
    }
    const octPath = (g, r, n = 8, rot = 0) => {
        g.beginPath();
        const R = r / Math.cos(Math.PI / n);
        for (let k = 0; k < n; k++) {
            const a = rot + ((k + 0.5) * TAU) / n;
            g.lineTo(Math.cos(a) * R, Math.sin(a) * R);
        }
        g.closePath();
    };

    // ------------------------------------------------------------------ glazes
    const GLAZE = {
        white: { base: '#e2dac4', deep: '#aca38a', light: '#f5f1e4', edge: '#cdbf9a' },
        blue: { base: '#23428c', deep: '#0e2058', light: '#4a6db8', edge: '#90a8d8' },
        green: { base: '#1d765c', deep: '#0b4033', light: '#49a486', edge: '#9ed2b6' },
        honey: { base: '#bb7722', deep: '#743d10', light: '#dfa44a', edge: '#efd194' },
        black: { base: '#2e1c32', deep: '#140b1a', light: '#5a3a5c', edge: '#937688' },
    };
    const GL = Object.fromEntries(Object.entries(GLAZE).map(([k, v]) => [k, Object.fromEntries(Object.entries(v).map(([q, c]) => [q, rgb(c)]))]));
    const BISCUIT = rgb('#c8946c'), PLASTER = rgb('#cfc4ab'), INKC = rgb(S.INK), GRIME = rgb('#5c4e40');
    const C3 = [0, 0, 0], C4 = [0, 0, 0];

    // Which strap or face of an arrangement a point is on: { kind: 0 face, 1 strap; id; edge
    // (distance in from the piece's edge) }. hb: half the strap; jw: half the joint.
    function strapOf(L, R, hb, jw, Q) {
        const ad1 = Math.abs(R.d1), ad2 = Math.abs(R.d2);
        const top = ad2 < hb + jw && !L.over1(R) ? 2 : 1;
        const dT = top === 1 ? ad1 : ad2, dO = top === 1 ? ad2 : ad1;
        if (dT < hb) {
            Q.kind = 1;
            Q.edge = hb - dT;
            Q.d = top === 1 ? R.d1 : R.d2;
            Q.f = top === 1 ? R.f1 : R.f2;
            Q.id = (Math.imul(Math.round((top === 1 ? R.c1 : R.c2) * 8) + 77, 0x2c1b3c6d) ^ Math.imul(Q.f + 1, 977) ^ Math.imul((R.ci ?? 0) + 99, 131) ^ Math.imul((R.cj ?? 0) + 55, 1031)) >>> 0;
            Q.over = top === 1 && ad2 < hb + jw ? 1 : 0;
        } else if (dO < hb) {
            Q.kind = 1;
            Q.edge = Math.min(hb - dO, dT - hb);
            Q.d = top === 1 ? R.d2 : R.d1;
            Q.f = top === 1 ? R.f2 : R.f1;
            Q.id = (Math.imul(Math.round((top === 1 ? R.c2 : R.c1) * 8) + 77, 0x2c1b3c6d) ^ Math.imul(Q.f + 1, 977) ^ Math.imul((R.ci ?? 0) + 99, 131) ^ Math.imul((R.cj ?? 0) + 55, 1031) ^ 0x5555) >>> 0;
            Q.over = -1;
        } else {
            Q.kind = 0;
            Q.edge = ad1 - hb;
            Q.id = R.key;
            Q.over = 0;
        }
        return Q;
    }

    // One pixel of glazed cut tile: colour, height, gloss, tilt.
    //   kind  the glaze; id the piece; edge: distance in from its edge (units); jw half the joint
    function glaze(P, i, x, y, kind, id, edge, seed, o = {}) {
        const jw = o.joint ?? 0.55;
        if (edge < jw) {
            // the joint: plaster, a hair below the glaze, dirtier lower on the wall
            const dirt = 0.5 + 0.5 * noise2(x * 0.02, y * 0.02, seed + 3);
            lerp3(PLASTER, GRIME, clamp(0.2 + dirt * 0.45 + (o.grime ?? 0)), C3);
            put(P, i, C3);
            P.h[i] = 0;
            return;
        }
        const u = h3(id, seed, 1, 7), u2 = h3(id, seed, 2, 7), u3 = h3(id, seed, 3, 7);
        if (u3 < (o.lost ?? 0.003)) {
            // a piece gone: the plaster keeps its print
            const v = 0.8 + 0.2 * noise2(x * 0.4, y * 0.4, seed);
            C3[0] = 184 * v;
            C3[1] = 170 * v;
            C3[2] = 146 * v;
            put(P, i, C3);
            P.h[i] = -1.5;
            return;
        }
        if (u3 > 1 - (o.wrong ?? 0.003)) kind = { honey: 'green', green: 'honey', blue: 'black', black: 'blue', white: 'honey' }[kind];
        const G = GL[kind];
        // its own tone, the glaze that ran before it set, the specks in it
        const tone = (u - 0.5) * 0.65 + 0.3 * noise2(x * 0.055 + u * 50, y * 0.055 + u2 * 50, seed + 5) + 0.1 * noise2(x * 0.35, y * 0.35, seed + 6);
        if (tone < 0) lerp3(G.base, G.deep, clamp(-tone), C3);
        else lerp3(G.base, G.light, clamp(tone * 0.8), C3);
        lerp3(C3, G.edge, clamp(1 - edge / 1.5) * 0.5, C3); // thin on the arris
        if (o.grime) tint(C3, GRIME, o.grime * 0.35 * (0.6 + 0.4 * noise2(x * 0.03, y * 0.03, seed + 9)));
        const chip = u2 < (o.chips ?? 0.1) && edge < 1.6 + 3 * h3(id, seed, 4, 7) && noise2(x * 0.18 + u * 9, y * 0.18, (id & 1023) + 1) > 0.32;
        if (chip) {
            lerp3(BISCUIT, [140, 94, 66], 0.25 + 0.3 * noise2(x * 0.9, y * 0.9, 3), C3);
            P.h[i] = 0.7;
            P.gl[i] = 0;
        } else {
            P.h[i] = (o.lift ?? 2.2) * smooth(0, 1.3, edge);
            P.gl[i] = 0.5;
            // set by hand, never quite level
            P.tx[i] += (u - 0.5) * 0.24;
            P.ty[i] += (u2 - 0.5) * 0.24;
        }
        if (u2 > 0.7 && Math.abs(noise2(x * 0.24, y * 0.24, (id & 4095) + 7)) < 0.02) tint(C3, kind === 'white' ? [104, 92, 72] : G.edge, 0.6); // crazing
        if (hashI(Math.round(x * 2.5), Math.round(y * 2.5), 9, seed) < 0.005) tint(C3, G.deep, 0.75); // pinholes
        put(P, i, C3);
    }

    // a line of ink laid by the pixel pass: dist from the line, w half its width
    const inkAt = (P, i, dist, w, a = 1) => {
        const k = clamp(1 - (Math.abs(dist) - w) * P.k * 0.8) * a;
        if (k <= 0) return false;
        const o4 = i * 4;
        P.a[o4] += (INKC[0] - P.a[o4]) * k;
        P.a[o4 + 1] += (INKC[1] - P.a[o4 + 1]) * k;
        P.a[o4 + 2] += (INKC[2] - P.a[o4 + 2]) * k;
        if (!P.a[o4 + 3]) P.a[o4 + 3] = 255 * k;
        return true;
    };
    // the dome's glow: brighter towards the axis, where the light comes from
    const glowEnv = (r0, r1, lo = 0.72, hi = 1.12) => (x, y) => lo + (hi - lo) * (1 - smooth(r0, r1, Math.hypot(x, y)));

    // ================================================================== 1 · the dado
    // The four walls' cut tile, folded out about the axis: from the inner edge (the top of
    // the dado) outwards, a crowning band of stepped merlons, a fillet, a chequer, a fillet,
    // then the field: rosettes of eight on the top and bottom walls, a wheel of sixteen in a
    // framed panel in the middle of the side walls.
    const FIELD8 = ['black', 'white', 'honey', 'green', 'blue', 'green', 'honey', 'blue', 'black', 'white'];
    const WHEEL16 = ['white', 'black', 'honey', 'green', 'blue', 'white', 'green', 'honey', 'blue', 'black', 'green', 'honey', 'blue'];
    function dado(g, o = {}) {
        const { hx = 640, hy = 380, box, seed = 11 } = o;
        const F8 = rosettes(150, 8, 150 * 0.27), W16 = wheel(16, 175 * Math.cos((6 * Math.PI) / 16), Math.PI / 16);
        const R = {}, Q = {}, W = {};
        const PAN = 165; // the wheel panel's half side
        const STAR8C = { rt: 46, rn: 46 * Math.cos(Math.PI / 4) / Math.cos(Math.PI / 8), M: 8, ph: 1 };
        surface(g, box, frag(o, {
            depth: 8, sharp: 0.45, soft: 3, swell: 0.5, ao: 10, aoK: 0.25, aoA: 0.35, cast: 6, castA: 0.45,
            env: glowEnv(300, 1300, 0.66, 1.05),
            pix(P) {
                each(P, (x, y, i) => {
                    wallAt(x, y, hx, hy, W);
                    const v = W.v, u = W.u;
                    if (v < 0) return;
                    const grime = smooth(120, 480, v) * 0.6;
                    let kind, id, edge, jw = 0.55;
                    if (v < 30) {
                        // stepped merlons pointing up the wall, black and blue by turns, on white
                        const n = Math.round(u / 40), du = Math.abs(u - n * 40), lv = v < 9 ? 0 : v < 18 ? 1 : 2, hw = [5, 11, 17][lv];
                        if (du < hw) {
                            kind = n & 1 ? 'blue' : 'black';
                            id = n * 7 + 3 + W.side * 1000;
                            edge = Math.min(hw - du, v, 30 - v, lv > 0 && du > [0, 5, 11][lv] ? v - [0, 9, 18][lv] : 99);
                        } else {
                            kind = 'white';
                            id = n * 7 + 5 + W.side * 1000 + (u > n * 40 ? 1 : 0);
                            edge = Math.min(du - hw, lv < 2 && du < [11, 17][lv] ? [9, 18][lv] - v : 99, 30 - v, v);
                        }
                    } else if (v < 36 || (v >= 52 && v < 58)) {
                        // fillets, pieced
                        const L0 = v < 36 ? 46 : 52, ph = v < 36 ? 0 : 19, n = Math.floor((u + ph) / L0);
                        kind = v < 36 ? 'black' : 'green';
                        id = n * 13 + (v < 36 ? 1 : 2) + W.side * 1000;
                        edge = Math.min(v < 36 ? v - 30 : v - 52, v < 36 ? 36 - v : 58 - v, u + ph - n * L0, (n + 1) * L0 - u - ph);
                    } else if (v < 52) {
                        // the chequer
                        const a = Math.floor(u / 8), b = Math.floor((v - 36) / 8);
                        kind = (a + b) & 1 ? 'black' : 'white';
                        id = a * 31 + b * 7 + W.side * 1000 + 500;
                        edge = Math.min(u - a * 8, (a + 1) * 8 - u, v - 36 - b * 8, (b + 1) * 8 - (v - 36));
                        jw = 0.45;
                    } else {
                        const pv = v - 58 - PAN - 10;
                        if ((W.side === 1 || W.side === 3) && Math.abs(u) < PAN + 10 && Math.abs(pv) < PAN + 10) {
                            // the wheel's panel, framed in white
                            const fr = Math.max(Math.abs(u), Math.abs(pv));
                            if (fr > PAN) {
                                kind = 'white';
                                id = 9001 + W.side + (Math.abs(u) > Math.abs(pv) ? (u > 0 ? 10 : 20) : pv > 0 ? 30 : 40);
                                edge = Math.min(fr - PAN, PAN + 10 - fr, Math.abs(Math.abs(u) - Math.abs(pv)) / SQ2);
                            } else {
                                W16.at(u, pv, R);
                                strapOf(W16, R, 2.8, jw, Q);
                                let nn = 0;
                                for (let q = 0; q < 16; q++) nn += R.cnt[q];
                                kind = Q.kind ? 'white' : WHEEL16[nn % WHEEL16.length];
                                id = Q.id ^ (W.side * 7919);
                                edge = Math.min(Q.edge, PAN - fr);
                                if (!Q.kind && nn === 0) {
                                    // the heart of the wheel: a star of eight (a seal) in its own tile
                                    const rr = Math.hypot(u, pv), sr = zigR(STAR8C, Math.atan2(pv, u));
                                    if (rr < sr) {
                                        kind = 'blue';
                                        id ^= 0x777;
                                        edge = Math.min(edge, (sr - rr) * 0.8);
                                    } else edge = Math.min(edge, (rr - sr) * 0.8);
                                }
                            }
                        } else {
                            F8.at(u, v - 58 + 75, R);
                            strapOf(F8, R, 3.2, jw, Q);
                            kind = Q.kind ? 'white' : FIELD8[R.orbit % FIELD8.length];
                            id = Q.id ^ (W.side * 7919);
                            edge = Q.edge;
                        }
                    }
                    edge = Math.min(edge, W.m - 0.4); // the corner: a joint down the mitre
                    glaze(P, i, x, y, kind, id, edge, seed, { grime, joint: jw });
                    // the group's contour: the dado's top edge and the corner
                    if (v < 2.2) inkAt(P, i, v - 0.9, 1.1);
                });
            },
        }));
    }

    // ================================================================== 2 · the plaster
    // The upper walls in carved stucco, folded out about the axis like the dado: from the
    // opening outwards a cornice of dentils, the knot band (where the inscription would
    // run: a chain of interlaced rings, no script), a fillet, and the sebka: a net of lobed
    // lozenges, each with a split palmette of its own. A cable moulding down every corner.
    const IVORY = rgb('#ead9b4'), IVORY_D = rgb('#b9a17c'), AZURE = rgb('#2b4f9a'), AZURE_D = rgb('#18306a'), RED = rgb('#a83a2a'), GOLD = rgb('#dca238'), GOLD_L = rgb('#f8d97a'), GOLD_D = rgb('#7a4c0e');
    // A split palmette in a lozenge, in the lozenge's own frame (v down = away from the
    // axis): drawn on the colour sheet and as greys on the height sheet.
    function palmette(A, Hc, r, sc) {
        const nf = 3 + Math.floor(r() * 3), lift = 0.62 + r() * 0.08, crown = r();
        const half = (side) => {
            // a half-palmette: up and out from the stem, then curling back in at the top
            // (the two make a lyre), its fingers on the outer edge
            const sx = side, jx = (r() - 0.5) * 6, jy = (r() - 0.5) * 6, tip = [sx * (12 + r() * 6), -58 + r() * 6];
            const spine = S.curve([[sx * 2, 6], [sx * (24 + jx), -10 + jy], [sx * 40, -34], [sx * 32, -56], tip], false, 12);
            const n = spine.length, up = [], dn = [];
            for (let k = 0; k < n; k++) {
                const t = k / (n - 1), p = spine[k], q = spine[Math.min(n - 1, k + 1)], pp = spine[Math.max(0, k - 1)];
                let tx = q[0] - pp[0], ty = q[1] - pp[1];
                const tl = Math.hypot(tx, ty) || 1;
                tx /= tl;
                ty /= tl;
                // the outer side: away from the lyre's heart
                let nx = -ty, ny = tx;
                if (nx * (p[0] - 0) + ny * (p[1] + 26) < 0) {
                    nx = -nx;
                    ny = -ny;
                }
                const w = 13 * Math.pow(Math.sin(Math.PI * Math.min(1, t * 1.03)), 0.55) + 2;
                const fing = 0.6 + 0.55 * Math.pow(1 - Math.abs(Math.cos(Math.PI * nf * t)), 0.6);
                up.push([p[0] + nx * w * fing, p[1] + ny * w * fing]);
                dn.push([p[0] - nx * w * 0.55, p[1] - ny * w * 0.55]);
            }
            const poly = [...up, ...dn.reverse()];
            return { poly, spine, tip, up };
        };
        const L = half(-1), Rr = half(1);
        const fillBoth = (pts, col, grey) => {
            A.beginPath();
            S.trace(A, pts);
            A.fillStyle = col;
            A.fill();
            Hc.beginPath();
            S.trace(Hc, pts);
            Hc.fillStyle = `rgb(${grey},${grey},${grey})`;
            Hc.fill();
        };
        const lineH = (pts, w, grey) => {
            Hc.beginPath();
            S.trace(Hc, pts, false);
            Hc.lineWidth = w;
            Hc.lineCap = 'round';
            Hc.strokeStyle = `rgb(${grey},${grey},${grey})`;
            Hc.stroke();
        };
        const lineA = (pts, w, col) => {
            A.beginPath();
            S.trace(A, pts, false);
            A.lineWidth = w;
            A.lineCap = 'round';
            A.strokeStyle = col;
            A.stroke();
        };
        const base = Math.round(lift * 255), tone = 0.9 + r() * 0.12;
        const col = `rgb(${Math.round(227 * tone)},${Math.round(216 * tone)},${Math.round(191 * tone)})`;
        // the stem and its collar
        fillBoth([[-5, 64], [5, 64], [4, 4], [-4, 4]], col, base - 20);
        fillBoth(S.ellipse(0, 26, 8, 3.5, 16), col, base);
        // two small leaves at the foot, curling out
        for (const sx of [-1, 1]) {
            const pts = S.curve([[0, 52], [sx * 14, 40 + r() * 4], [sx * 30, 46], [sx * 34, 58], [sx * 22, 60], [sx * 8, 58]], true, 6);
            fillBoth(pts, col, base - 10);
            lineH([[sx * 4, 54], [sx * 24, 50], [sx * 31, 55]], 1.1, base - 60);
        }
        for (const h of [L, Rr]) {
            fillBoth(h.poly, col, base);
            lineH(h.spine, 1.6, base - 60);
            lineA(h.spine, 0.9, 'rgba(70,52,40,0.55)');
            // the fingers: a cut between each, from the edge in
            for (let f = 1; f < nf; f++) {
                const k = Math.round((f / nf) * (h.up.length - 1)), p = h.up[k], sp = h.spine[k];
                const cut = [p, [p[0] + (sp[0] - p[0]) * 0.55, p[1] + (sp[1] - p[1]) * 0.55]];
                lineH(cut, 1.3, base - 70);
                lineA(cut, 0.8, 'rgba(60,44,34,0.6)');
            }
            // the curled tip
            fillBoth(S.ellipse(h.tip[0], h.tip[1] + 3, 5, 4.6, 14), col, base + 10);
            lineH(S.ellipse(h.tip[0], h.tip[1] + 3, 2.4, 2.2, 10), 1, base - 60);
        }
        // the crown: a pine cone, a bud or a shell
        if (crown < 0.45) {
            const cone = S.ellipse(0, -34, 10, 16, 24);
            fillBoth(cone, col, base + 25);
            Hc.save();
            Hc.beginPath();
            S.trace(Hc, cone);
            Hc.clip();
            A.save();
            A.beginPath();
            S.trace(A, cone);
            A.clip();
            for (let d = -40; d <= 40; d += 6) {
                lineH([[-14, -34 + d - 14], [14, -34 + d + 14]], 1, base - 40);
                lineH([[-14, -34 + d + 14], [14, -34 + d - 14]], 1, base - 40);
                lineA([[-14, -34 + d - 14], [14, -34 + d + 14]], 0.6, 'rgba(70,52,40,0.45)');
                lineA([[-14, -34 + d + 14], [14, -34 + d - 14]], 0.6, 'rgba(70,52,40,0.45)');
            }
            Hc.restore();
            A.restore();
        } else if (crown < 0.75) {
            const bud = [[0, -58], [8, -42], [9, -26], [0, -16], [-9, -26], [-8, -42]];
            fillBoth(S.curve(bud, true, 8), col, base + 15);
            lineH([[0, -54], [0, -20]], 1.2, base - 50);
        } else {
            // a scallop shell, ribs fanning from the hinge
            const sh = [];
            for (let k = 0; k <= 14; k++) {
                const a = Math.PI * (1.08 + (k / 14) * 0.84), rr = 19 + (k % 2) * 1.6;
                sh.push([Math.cos(a) * rr, -18 + Math.sin(a) * rr]);
            }
            sh.push([0, -16]);
            fillBoth(sh, col, base + 15);
            for (let k = 1; k < 7; k++) {
                const a = Math.PI * (1.08 + (k / 7) * 0.84);
                lineH([[0, -17], [Math.cos(a) * 18, -18 + Math.sin(a) * 18]], 1.1, base - 45);
            }
        }
        // a finger broken off: the ground shows
        if (r() < 0.22) {
            const p = (r() < 0.5 ? L : Rr).up[Math.floor(r() * 10) + 4];
            fillBoth(S.ellipse(p[0], p[1], 4 + r() * 3, 3 + r() * 2, 10, r() * 3), 'rgb(176,160,134)', 30);
        }
    }
    function plaster(g, o = {}) {
        const { h = 300, box, seed = 21 } = o;
        const LA = 120, LB = 156, V0 = 72; // the sebka's lozenge (width, height), where it starts
        const Rk = {}, W = {};
        surface(g, box, frag(o, {
            depth: 9, sharp: 0.5, soft: 4, swell: 0.55, ao: 12, aoK: 0.22, aoA: 0.5, cast: 9, castA: 0.55,
            env: glowEnv(250, 1000, 0.62, 1.08),
            draw(A, Hc) {
                for (let side = 0; side < 4; side++) {
                    const M = wallXf(side, h, h);
                    for (let n = -14; n <= 14; n++) {
                        for (let m = -14; m <= 14; m++) {
                            const uc = (LA * (n + m + 1)) / 2, vc = (LB * (n - m)) / 2 + V0 + LB / 2;
                            if (vc - LB / 2 < V0 - 1 || vc > 760 || Math.abs(uc) > h + vc - LA * 0.5) continue;
                            const r = Motion.rng('palm/' + seed + '/' + side + '/' + n + '/' + m);
                            for (const q of [A, Hc]) {
                                q.save();
                                q.transform(...M);
                                q.translate(uc, vc);
                                q.scale(0.98 + r() * 0.06, 1);
                            }
                            palmette(A, Hc, r);
                            A.restore();
                            Hc.restore();
                        }
                    }
                }
            },
            pix(P) {
                const a = P.a;
                each(P, (x, y, i) => {
                    wallAt(x, y, h, h, W);
                    const v = W.v, u = W.u, o4 = i * 4;
                    if (v < 0) return;
                    const nz = noise2(x * 0.09, y * 0.09, seed), nz2 = noise2(x * 0.021, y * 0.021, seed + 1);
                    if (W.m < 7.5 && v > 0) {
                        // the corner: a cable moulding down the mitre
                        const t = (Math.abs(x) + Math.abs(y)) / SQ2, mm = W.m / 7.5;
                        const tw = Math.sin(t * 0.55 + mm * 2.4 * (x * y > 0 ? 1 : -1));
                        lerp3(IVORY, GOLD, clamp(0.2 + 0.2 * nz2), C3);
                        tint(C3, IVORY_D, 0.25 - tw * 0.12);
                        put(P, i, C3);
                        if (Math.abs(tw - 0.92) < 0.08) inkAt(P, i, 0, 0.3, 0.55);
                        P.h[i] = 5.5 * Math.sqrt(Math.max(0, 1 - mm * mm)) + 1.4 * tw;
                        P.mt[i] = 0.3;
                        inkAt(P, i, W.m - 7.5, 0.7);
                        return;
                    }
                    if (v < 12) {
                        // the cornice: a bead, and a row of dentils with red between
                        const dent = v > 4 && v < 10.5, n = Math.floor(u / 9), du = u - n * 9, on = du > 1.5 && du < 7.5;
                        lerp3(IVORY, IVORY_D, 0.2 + 0.25 * nz, C3);
                        if (dent && !on) tint(C3, RED, 0.6 + 0.2 * nz2);
                        put(P, i, C3);
                        P.h[i] = (v < 4 ? 4.5 * Math.sin((Math.PI * v) / 4) : 0) + (dent && on ? 4 : 1);
                        inkAt(P, i, v - 0.8, 0.9);
                        inkAt(P, i, v - 11.4, 0.7, 0.8);
                        return;
                    }
                    if (v < 64) {
                        // the knot band: a chain of rings, each over its neighbour at the top
                        // and under it at the bottom, gilt on azure, a flower in each ring
                        const w = v - 38, PK = 48, RX = 30, RY = 19.5, HW = 3.4;
                        const n0 = Math.round(u / PK);
                        let best = 1e9, own = null, cnt = 0, dn = 0;
                        const ds = [];
                        for (let n = n0 - 1; n <= n0 + 1; n++) {
                            const du = u - n * PK, q = Math.hypot(du / RX, w / RY), gq = Math.hypot(du / (RX * RX), w / (RY * RY)) / Math.max(q, 1e-6);
                            const d = (q - 1) / Math.max(gq, 1e-6);
                            ds.push([n, d]);
                        }
                        const near = ds.filter(([, d]) => Math.abs(d) < HW + 0.5);
                        if (near.length) {
                            if (near.length === 2) {
                                const [nA] = near[0], [nB] = near[1], lo = Math.min(nA, nB);
                                own = (w < 0 ? lo : lo + 1) === nA ? near[0] : near[1];
                            } else own = near[0];
                            const d = own[1], edge = HW - Math.abs(d);
                            if (edge > 0) {
                                const worn = noise2(x * 0.14, y * 0.14, seed + 4) > 0.35;
                                lerp3(worn ? IVORY : GOLD, worn ? IVORY_D : GOLD_L, clamp(0.4 + 0.5 * noise2(x * 0.3, y * 0.3, 5)), C3);
                                put(P, i, C3);
                                P.h[i] = 6 * smooth(0, 1.3, edge) - 1.2 * Math.exp(-(d * d) / 0.8);
                                P.mt[i] = worn ? 0 : 0.8;
                                P.gl[i] = worn ? 0 : 0.5;
                                inkAt(P, i, edge - 0.3, 0.45, 0.9);
                                return;
                            }
                        }
                        // the ground: azure, rubbed to the red bole and the plaster in places
                        const du = u - n0 * PK, fr = Math.hypot(du, w * 1.1), fa = Math.atan2(w, du);
                        const petal = fr < 8.5 * (0.55 + 0.45 * Math.abs(Math.cos(4 * fa)));
                        if (petal) {
                            lerp3(RED, IVORY, clamp(fr / 14 + 0.2 * nz), C3);
                            if (fr < 2.4) lerp3(GOLD, GOLD_L, 0.4, C3);
                            put(P, i, C3);
                            P.h[i] = 3.5 * (1 - fr / 10) + 0.8;
                        } else {
                            const rub = nz2 + 0.4 * nz;
                            lerp3(AZURE, AZURE_D, clamp(0.5 + 0.5 * nz), C3);
                            if (rub > 0.45) tint(C3, RED, (rub - 0.45) * 3);
                            if (rub > 0.7) tint(C3, IVORY_D, (rub - 0.7) * 3);
                            put(P, i, C3);
                            P.h[i] = 0.3 * nz;
                        }
                        if (Math.abs(w) > 24.5) {
                            // the frame fillets
                            lerp3(IVORY, GOLD, 0.25, C3);
                            put(P, i, C3);
                            P.h[i] = 3;
                            inkAt(P, i, Math.abs(w) - 24.5, 0.5);
                        }
                        return;
                    }
                    if (v < V0) {
                        lerp3(IVORY, IVORY_D, 0.25 + 0.2 * nz, C3);
                        put(P, i, C3);
                        P.h[i] = 3.2;
                        inkAt(P, i, v - 64.5, 0.6);
                        inkAt(P, i, v - 71.5, 0.6);
                        return;
                    }
                    // the sebka's net: lobed strands
                    const vv = v - V0 - LB / 2, p = u / LA + vv / LB, q = u / LA - vv / LB;
                    const K = 1 / Math.hypot(1 / LA, 1 / LB);
                    const dp = Math.abs(p - Math.round(p)) * K, dq = Math.abs(q - Math.round(q)) * K;
                    const along = dp < dq ? q : p, dd = Math.min(dp, dq);
                    const lob = 4.2 * Math.sqrt(Math.max(0, 1 - Math.pow(2 * ((along * 4 + 0.5) % 1) - 1, 2)));
                    const HW = 3.6;
                    if (dd < HW + lob || v - V0 < 3) {
                        const edge = (dd < HW ? HW : HW + lob) - dd;
                        lerp3(IVORY, IVORY_D, clamp(0.15 + 0.25 * nz + 0.15 * nz2), C3);
                        if (noise2(x * 0.05, y * 0.05, seed + 8) > 0.42) tint(C3, GOLD, 0.45);
                        put(P, i, C3);
                        P.h[i] = (dd < HW ? 6.2 - 1.3 * Math.exp(-(dd * dd) / 1.2) : 4.4) * smooth(-0.5, 1.2, edge);
                        if (dd > HW - 0.6 && dd < HW + 0.4 && lob < 0.6) inkAt(P, i, 0, 0.45, 0.5);
                        inkAt(P, i, edge, 0.5, 0.85);
                        return;
                    }
                    const cell = h3(Math.floor(p) * 7 + 3, Math.floor(q) * 13 + W.side, 5, seed);
                    if (a[o4 + 3] > 0) {
                        // a palmette (drawn): the polychromy that is left on it
                        C3[0] = a[o4];
                        C3[1] = a[o4 + 1];
                        C3[2] = a[o4 + 2];
                        if (P.h[i] > 5.4 && noise2(x * 0.08, y * 0.08, seed + 12) > 0.3) tint(C3, GOLD, 0.55);
                        tint(C3, IVORY_D, 0.15 + 0.2 * nz);
                        a[o4] = C3[0];
                        a[o4 + 1] = C3[1];
                        a[o4 + 2] = C3[2];
                        P.h[i] += 0.25 * nz;
                        return;
                    }
                    // the ground, drilled rough: azure in most lozenges, red in some, mostly rubbed
                    const paint = (Math.floor(p) + Math.floor(q)) % 4 === 0 ? RED : AZURE;
                    lerp3(IVORY_D, IVORY, clamp(0.4 + 0.4 * nz), C3);
                    const keep = noise2(x * 0.035, y * 0.035, seed + 13) + 0.45 * noise2(x * 0.14, y * 0.14, seed + 14) + 0.1 * (cell - 0.5);
                    if (keep > -0.42) tint(C3, paint, smooth(-0.42, -0.3, keep) * 0.88);
                    if (keep > -0.42 && keep < -0.36) tint(C3, [70, 52, 40], 0.35); // the flaking edge
                    tint(C3, GRIME, 0.25 * smooth(300, 700, v));
                    put(P, i, C3);
                    P.h[i] = 0.5 * nz + 0.4 * hashI(Math.round(x * 2), Math.round(y * 2), 3, seed);
                });
            },
        }));
        // a crack across a panel of the left wall, half of it filled in a whiter plaster
        if (!o.bare) {
            const r = Motion.rng('plcrack/' + seed), pts = [];
            let x = -h - 90, y = -150;
            for (let k = 0; k < 60; k++) {
                pts.push([x, y]);
                x -= 2.2 + r() * 1.6;
                y += 4.2 + (r() - 0.5) * 5;
            }
            const fill = pts.slice(28);
            g.save();
            g.lineCap = 'round';
            g.lineJoin = 'round';
            g.strokeStyle = 'rgba(246,240,226,0.95)';
            g.lineWidth = 5.5;
            g.beginPath();
            S.trace(g, fill, false);
            g.stroke();
            g.strokeStyle = 'rgba(160,146,124,0.6)';
            g.lineWidth = 0.6;
            g.stroke();
            g.restore();
            S.ink(g, pts.slice(0, 30).map(([px, py]) => [px + 0.7, py + 0.5]), { w: 1.3, color: 'rgba(255,246,226,0.6)' });
            S.ink(g, pts.slice(0, 30), { w: 1.4, color: '#2a1e1c', alpha: 0.9 });
        }
        // a swift's nest in the top left corner, on the cornice
        if (!o.bare) nest(g, { x: -h - 26, y: -h - 24, s: 1.45, seed: seed + 'n' });
    }
    // a swift's nest: straw and feathers glued with spittle, wedged in a corner (and a
    // streak of droppings below it). In the emblem manner, lit from the axis.
    function nest(g, o) {
        const { x, y, s = 1, seed = 1 } = o, r = Motion.rng('nest/' + seed);
        const out = HOUSE ? [S.SHADE_DIR[0], S.SHADE_DIR[1]] : [x / Math.hypot(x, y), y / Math.hypot(x, y)], inn = [-out[0], -out[1]];
        g.save();
        g.translate(x, y);
        g.scale(s, s);
        // the droppings, running down the wall away from the axis
        for (let k = 0; k < 9; k++) {
            const t = r(), w = 1.5 + r() * 3;
            S.piece(g, S.ellipse(out[0] * (24 + t * 60) + (r() - 0.5) * 18, out[1] * (24 + t * 60) + (r() - 0.5) * 18, w, w * (0.6 + r() * 0.5), 10, r() * 3), { fill: S.mix('#e8e2d2', '#8a8070', r() * 0.5), line: 0.7, shade: { color: '#5a5246', alpha: 0.5, w: 2, dir: out }, light: { dir: inn, w: 2 } });
        }
        // the mass: a cup of straw and mud
        const body = [];
        for (let k = 0; k < 14; k++) {
            const a = (k / 14) * TAU, rr = 26 + (r() - 0.5) * 9;
            body.push([Math.cos(a) * rr * 1.15, Math.sin(a) * rr * 0.85]);
        }
        const bodyP = S.curve(body, true, 6);
        S.cast(g, (q) => {
            q.beginPath();
            S.trace(q, bodyP);
            q.fillStyle = '#000';
            q.fill();
        }, { blur: 6, dx: out[0] * 7, dy: out[1] * 7, color: 'rgba(30,20,20,0.55)' });
        S.piece(g, bodyP, {
            fill: '#7a6448', line: 2.2, heavy: 0.8,
            shade: [{ color: '#2e2216', alpha: 0.75, w: 14, dir: out }],
            light: { color: '#e8c98a', alpha: 0.45, w: 10, dir: inn },
            detail(q) {
                // straws, every one laid its own way
                for (let k = 0; k < 120; k++) {
                    const a = r() * TAU, rr = r() * 28, px = Math.cos(a) * rr * 1.1, py = Math.sin(a) * rr * 0.8, ang = r() * Math.PI, l = 6 + r() * 16;
                    const lit = (Math.cos(ang) * inn[0] + Math.sin(ang) * inn[1]) * 0.5 + 0.5;
                    q.strokeStyle = S.mix('#5a4128', '#e8cf8e', clamp(0.25 + lit * 0.5 + (r() - 0.5) * 0.4));
                    q.lineWidth = 0.8 + r() * 0.9;
                    q.beginPath();
                    q.moveTo(px - Math.cos(ang) * l * 0.5, py - Math.sin(ang) * l * 0.5);
                    q.quadraticCurveTo(px + (r() - 0.5) * 4, py + (r() - 0.5) * 4, px + Math.cos(ang) * l * 0.5, py + Math.sin(ang) * l * 0.5);
                    q.stroke();
                }
                // spittle glazing the straws together
                for (let k = 0; k < 18; k++) {
                    q.fillStyle = `rgba(240,232,210,${0.18 + r() * 0.2})`;
                    q.beginPath();
                    q.ellipse((r() - 0.5) * 50, (r() - 0.5) * 36, 2 + r() * 4, 1 + r() * 2, r() * 3, 0, TAU);
                    q.fill();
                }
                // the dark of the cup
                const gr = q.createRadialGradient(inn[0] * 6, inn[1] * 6, 2, inn[0] * 6, inn[1] * 6, 16);
                gr.addColorStop(0, 'rgba(20,12,10,0.85)');
                gr.addColorStop(1, 'rgba(20,12,10,0)');
                q.fillStyle = gr;
                q.fillRect(-40, -40, 80, 80);
            },
        });
        // straws sticking out past the rim, every one its own way
        for (let k = 0; k < 46; k++) {
            const a = r() * TAU, r0 = 18 + r() * 8, l = 8 + r() * 18, b = a + (r() - 0.5) * 0.9;
            const p0 = [Math.cos(a) * r0 * 1.15, Math.sin(a) * r0 * 0.85], p1 = [p0[0] + Math.cos(b) * l, p0[1] + Math.sin(b) * l];
            const lit = (Math.cos(b) * inn[0] + Math.sin(b) * inn[1]) * 0.5 + 0.5;
            S.ink(g, [p0, [(p0[0] + p1[0]) / 2 + (r() - 0.5) * 3, (p0[1] + p1[1]) / 2 + (r() - 0.5) * 3], p1], { w: 1.4 + r() * 0.8, color: S.mix('#5a4128', '#f0d89c', clamp(0.3 + lit * 0.6)), taper: [0.2, 1] });
        }
        // two feathers stuck in it, a dark swift's feather and a pale down
        const feather = (px, py, ang, len, dark) => {
            const c = Math.cos(ang), sn = Math.sin(ang), pts = [];
            for (let k = 0; k <= 10; k++) {
                const t = k / 10, w = len * 0.16 * Math.sin(Math.PI * Math.min(1, t * 1.1)) * (1 - 0.3 * t);
                pts.push([px + c * len * t - sn * w, py + sn * len * t + c * w]);
            }
            for (let k = 10; k >= 0; k--) {
                const t = k / 10, w = len * 0.13 * Math.sin(Math.PI * Math.min(1, t * 1.1)) * (1 - 0.3 * t);
                pts.push([px + c * len * t + sn * w, py + sn * len * t - c * w]);
            }
            S.piece(g, pts, { fill: dark ? '#3a3540' : '#e6e0d4', line: 1.1, shade: { color: dark ? '#141018' : '#8a8478', alpha: 0.6, w: 5, dir: out }, light: { dir: inn, w: 4, alpha: dark ? 0.25 : 0.5 } });
            S.ink(g, [[px, py], [px + c * len * 0.95, py + sn * len * 0.95]], { w: 0.8, color: dark ? '#9a94a0' : '#a09482' });
        };
        feather(-6, 6, 0.6, 38, true);
        feather(10, -4, -2.4, 22, false);
        g.restore();
    }

    // ================================================================== the air
    // What hangs between the walls and the ceiling: three shafts of the first light from the
    // windows on the sun's side, the dust turning in them, and a spider's thread across the
    // way up with its spider. Painted thin: the camera goes through it.
    function air(g, o = {}) {
        const { box, seed = 31 } = o, r = Motion.rng('air/' + seed);
        const shafts = [[-2.28, 0.13], [-2.02, 0.07], [-1.62, 0.1], [2.62, 0.06]];
        const inShaft = (x, y) => {
            const a = Math.atan2(y, x);
            let k = 0;
            for (const [c, w] of shafts) {
                const d = Math.abs(((a - c + Math.PI * 3) % TAU) - Math.PI);
                k = Math.max(k, 1 - smooth(w * 0.4, w, d));
            }
            return k;
        };
        g.save();
        g.globalCompositeOperation = 'lighter';
        for (const [c, w] of shafts) {
            // a wedge widening away from the axis (the light comes down past the eye)
            for (let pass = 0; pass < 3; pass++) {
                const ww = w * (0.45 + pass * 0.3), R0 = 30, R1 = 900;
                const gr = g.createLinearGradient(Math.cos(c) * R0, Math.sin(c) * R0, Math.cos(c) * R1, Math.sin(c) * R1);
                gr.addColorStop(0, 'rgba(255,226,170,0)');
                gr.addColorStop(0.12, `rgba(255,222,160,${0.1 - pass * 0.025})`);
                gr.addColorStop(0.5, `rgba(255,214,150,${0.08 - pass * 0.02})`);
                gr.addColorStop(1, 'rgba(255,210,150,0)');
                g.fillStyle = gr;
                g.beginPath();
                g.moveTo(Math.cos(c - ww * 0.3) * R0, Math.sin(c - ww * 0.3) * R0);
                g.lineTo(Math.cos(c - ww) * R1, Math.sin(c - ww) * R1);
                g.lineTo(Math.cos(c + ww) * R1, Math.sin(c + ww) * R1);
                g.lineTo(Math.cos(c + ww * 0.3) * R0, Math.sin(c + ww * 0.3) * R0);
                g.closePath();
                g.fill();
            }
        }
        g.restore();
        // the dust: thick in the shafts, a few motes elsewhere; some caught sharp, some soft
        for (let k = 0; k < 4200; k++) {
            // (only what the walls' opening shows is worth a mote)
            const ra = r() * TAU, rr = 40 + Math.pow(r(), 0.8) * 420, x = Math.cos(ra) * rr, y = Math.sin(ra) * rr;
            const sh = inShaft(x, y);
            if (r() > 0.08 + sh * 0.92) continue;
            const s = 0.5 + Math.pow(r(), 3) * 2.2, lit = 0.35 + sh * 0.65;
            if (s > 1.4) {
                g.fillStyle = `rgba(255,232,180,${0.12 * lit})`;
                g.beginPath();
                g.arc(x, y, s * 2.4, 0, TAU);
                g.fill();
            }
            g.fillStyle = `rgba(255,${236 - Math.round(r() * 30)},${190 - Math.round(r() * 40)},${(0.35 + r() * 0.5) * lit})`;
            g.beginPath();
            g.ellipse(x, y, s, s * (0.5 + r() * 0.5), r() * 3, 0, TAU);
            g.fill();
        }
        // the thread, sagging across the way up, lit where the shafts cross it
        const A = [-860, -300], B = [700, 360], C = [-40, 190];
        const pts = [];
        for (let k = 0; k <= 200; k++) {
            const t = k / 200;
            pts.push([(1 - t) * (1 - t) * A[0] + 2 * (1 - t) * t * C[0] + t * t * B[0], (1 - t) * (1 - t) * A[1] + 2 * (1 - t) * t * C[1] + t * t * B[1]]);
        }
        g.lineCap = 'round';
        for (let k = 0; k < 200; k++) {
            const [x0, y0] = pts[k], [x1, y1] = pts[k + 1], sh = inShaft(x0, y0);
            g.strokeStyle = `rgba(250,244,230,${0.28 + sh * 0.6})`;
            g.lineWidth = 0.9 + sh * 0.5;
            g.beginPath();
            g.moveTo(x0, y0);
            g.lineTo(x1, y1);
            g.stroke();
        }
        // dust caught on it, and two drops of dew
        for (let k = 0; k < 40; k++) {
            const p = pts[Math.floor(r() * 200)], sh = inShaft(p[0], p[1]);
            g.fillStyle = `rgba(255,240,210,${0.4 + sh * 0.5})`;
            g.beginPath();
            g.arc(p[0] + (r() - 0.5), p[1] + (r() - 0.5), 0.6 + r() * 0.9, 0, TAU);
            g.fill();
        }
        // the spider, hanging on its line from the thread's upper end
        const sp = [-640, -160];
        g.strokeStyle = 'rgba(250,244,230,0.55)';
        g.lineWidth = 0.7;
        g.beginPath();
        g.moveTo(-640, pts[Math.round(((640 - 860) / -1560) * 200)]?.[1] ?? -250);
        g.lineTo(sp[0], sp[1] - 4);
        g.stroke();
        const legs = [];
        for (let side = -1; side <= 1; side += 2) {
            for (let k = 0; k < 4; k++) {
                const a = side * (0.5 + k * 0.42) + (side < 0 ? Math.PI : 0), kn = [sp[0] + Math.cos(a) * 7, sp[1] + Math.sin(a) * 5 - 3];
                legs.push([[sp[0], sp[1]], kn, [kn[0] + Math.cos(a + side * 0.9) * 8, kn[1] + 7]]);
            }
        }
        for (const l of legs) S.ink(g, l, { w: 1.1, taper: [0, 1], color: '#2a2024' });
        S.piece(g, S.ellipse(sp[0], sp[1] + 3, 4.2, 5.4, 16), { fill: '#5a4636', line: 1, shade: { color: '#1a1012', w: 3, alpha: 0.7, dir: [-0.8, -0.5] }, light: { w: 2, dir: [0.8, 0.5] } });
        S.piece(g, S.ellipse(sp[0], sp[1] - 2.5, 2.6, 2.4, 12), { fill: '#6a5442', line: 0.9 });
        g.fillStyle = 'rgba(255,240,210,0.8)';
        g.beginPath();
        g.arc(sp[0] + 1.2, sp[1] + 1.8, 0.8, 0, TAU);
        g.fill();
    }

    // ================================================================== 3 · the carpentry
    const CEDAR = rgb('#8c5a34'), CEDAR_D = rgb('#4e2c18'), CEDAR_L = rgb('#c08856'), PAINT = { red: rgb('#a3322a'), green: rgb('#2c6a4a'), blue: rgb('#26407e'), white: rgb('#e8dfc8'), black: rgb('#2a1c1e') };
    // cedar at a point: the grain runs along `ga` (radians)
    const cedar = (x, y, ga, seed, o) => {
        const c = Math.cos(ga), sn = Math.sin(ga), along = x * c + y * sn, across = -x * sn + y * c;
        const ring = noise2(across * 0.35 + noise2(along * 0.01, across * 0.05, seed) * 3, along * 0.012, seed + 1);
        const fine = noise2(across * 1.6, along * 0.05, seed + 2);
        lerp3(CEDAR, ring > 0 ? CEDAR_L : CEDAR_D, Math.abs(ring) * 0.7, o);
        tint(o, CEDAR_D, 0.18 + 0.18 * fine);
        return o;
    };
    // The frieze under the ceiling: corbels (canecillos) all round, their undersides carved in
    // rolls and painted, the boards between them painted with saetinos, the beam they come out
    // of with a running frieze of small interlace.
    function corbels(g, o = {}) {
        const { h = 330, box, seed = 41 } = o;
        const W = {}, R = {}, Q = {}, Fz = rosettes(38, 8, 38 * 0.27);
        const PITCH = 84, CW = 20, LEN = 150, BEAM = 214;
        surface(g, box, frag(o, {
            depth: 26, sharp: 0.5, soft: 3, swell: 0.5, ao: 16, aoK: 0.1, aoA: 0.55, cast: 30, castA: 0.62,
            env: glowEnv(250, 800, 0.62, 1.05),
            pix(P) {
                each(P, (x, y, i) => {
                    wallAt(x, y, h, h, W);
                    const v = W.v, u = W.u;
                    if (v < 0) return;
                    const nz = noise2(x * 0.08, y * 0.08, seed);
                    if (v < LEN) {
                        // a corbel? (the corner one runs down the mitre)
                        let du = 1e9, n = 0, corner = false;
                        if (W.m < CW + 2) {
                            du = W.m;
                            corner = true;
                            n = 777 + W.side;
                        } else {
                            n = Math.round(u / PITCH);
                            du = Math.abs(u - n * PITCH);
                            if (Math.abs(n * PITCH) > h + v - CW - 8) du = 1e9;
                        }
                        // its end, seen from below: three lobes
                        const tip = 6 * Math.sqrt(Math.max(0, 1 - Math.pow(((du / CW) * 1.5) % 1 * 2 - 1, 2))) * 0 + 7 * Math.abs(Math.sin((1.5 * Math.PI * du) / CW)) + 1;
                        if (du < CW && v > tip) {
                            const ga = corner ? Math.atan2(y, x) : W.side % 2 ? 0 : Math.PI / 2, id = n * 31 + W.side;
                            cedar(x, y, ga, seed + (id & 255), C3);
                            // the end rolled into three rolls, the soffit flat with a groove down it
                            const rl = v < 52 ? Math.cos((2 * Math.PI * (v - 10)) / 14) : 0;
                            let hh = 16 + 2.4 * rl - 5 * smooth(CW - 3.5, CW, du) - 3 * (1 - smooth(tip, tip + 4, v)) - (v > 56 ? 1.6 * Math.exp(-(du * du) / 3) : 0);
                            const w0 = h3(id, 3, 3, seed);
                            if (v < 52) {
                                if (rl > 0.6 && v < 24) {
                                    lerp3(C3, GOLD, 0.8 * (noise2(x * 0.2, y * 0.2, id) > -0.3 ? 1 : 0.2), C3);
                                    P.mt[i] = 0.7;
                                } else if (rl < -0.5) tint(C3, PAINT.blue, 0.7 * (w0 > 0.15 ? 1 : 0.2));
                            } else if (v > 60) {
                                // painted down the soffit: a red band with a white zigzag, worn
                                const keep = noise2(x * 0.07, y * 0.07, id + 5) > -0.5 + (w0 < 0.2 ? 0.6 : 0);
                                if (du < 11 && du > 2.4 && keep) {
                                    tint(C3, PAINT.red, 0.85);
                                    const zz = Math.abs(((v / 8 + du / 9) % 2 + 2) % 2 - 1);
                                    if (Math.abs(zz - 0.5) < 0.14) tint(C3, PAINT.white, 0.85);
                                }
                                if (du > CW - 5 && du < CW - 2.2 && keep) tint(C3, PAINT.blue, 0.8);
                            }
                            // worm holes in a few, a crack along the grain in others
                            if (w0 > 0.6 && hashI(Math.round(x * 1.4), Math.round(y * 1.4), id, seed) < 0.014) tint(C3, [30, 18, 12], 0.9);
                            if (h3(id, 2, 2, seed) < 0.35 && Math.abs(du - CW * 0.45 - 2 * noise2(v * 0.05, id, 3)) < 0.45 && v > 30) tint(C3, [36, 20, 14], 0.85);
                            put(P, i, C3);
                            P.h[i] = hh;
                            inkAt(P, i, CW - du - 0.6, 0.85);
                            if (v < tip + 1.6) inkAt(P, i, v - tip - 0.7, 0.85);
                            if (v < 52 && Math.abs(rl + 1) < 0.08) inkAt(P, i, 0, 0.3, 0.6);
                            return;
                        }
                        // the boards between: white with red saetinos (darts), sooty, in the corbels' shadow
                        const sv = (u + v * 0.7) / 11, dart = Math.abs(sv - Math.round(sv)) < 0.2;
                        lerp3(PAINT.white, [176, 160, 132], 0.3 + 0.3 * nz, C3);
                        if (dart && v > 14 && v < LEN - 12) tint(C3, PAINT.red, 0.75);
                        if (v > LEN - 12) tint(C3, PAINT.blue, 0.7);
                        tint(C3, [40, 28, 24], 0.2 + 0.2 * noise2(x * 0.03, y * 0.03, seed + 4));
                        put(P, i, C3);
                        P.h[i] = 0;
                        if (Math.abs(v - LEN + 12) < 1) inkAt(P, i, 0, 0.5, 0.7);
                        return;
                    }
                    if (v < BEAM) {
                        // the beam, with a frieze of small interlace between two gilt beads
                        const bv = v - LEN, ga = W.side % 2 ? Math.PI / 2 : 0;
                        if (bv < 8 || bv > BEAM - LEN - 8) {
                            lerp3(GOLD, GOLD_L, clamp(0.4 + 0.5 * nz), C3);
                            put(P, i, C3);
                            const t = bv < 8 ? bv / 8 : (BEAM - LEN - bv) / 8;
                            P.h[i] = 8 + 3 * Math.sin(Math.PI * t);
                            P.mt[i] = 0.9;
                            P.gl[i] = 0.4;
                            inkAt(P, i, Math.min(bv, BEAM - LEN - bv) - 0.5, 0.6);
                            inkAt(P, i, Math.abs(bv - 8) < Math.abs(bv - (BEAM - LEN - 8)) ? bv - 8 : bv - (BEAM - LEN - 8), 0.45, 0.8);
                            return;
                        }
                        Fz.at(u, bv - 30, R);
                        strapOf(Fz, R, 1.7, 0.4, Q);
                        if (Q.kind) {
                            cedar(x, y, ga + (Q.f * Math.PI) / 4, seed + 3, C3);
                            tint(C3, PAINT.white, 0.55);
                            put(P, i, C3);
                            P.h[i] = 10 * smooth(0, 0.8, Q.edge);
                            inkAt(P, i, Q.edge - 0.25, 0.3, 0.6);
                        } else {
                            const col = [PAINT.black, PAINT.red, PAINT.green, PAINT.blue, PAINT.red, PAINT.green, PAINT.blue][R.orbit % 7];
                            cedar(x, y, ga, seed + 5, C3);
                            const keep = noise2(x * 0.06, y * 0.06, seed + 6) > -0.4;
                            if (keep) tint(C3, col, 0.8);
                            put(P, i, C3);
                            P.h[i] = 7;
                        }
                        return;
                    }
                    // above the beam: the boards of the eaves, in the dark
                    const ga = W.side % 2 ? Math.PI / 2 : 0;
                    cedar(x, y, ga, seed + 7, C3);
                    tint(C3, [40, 28, 22], 0.45);
                    const bd = ((u / 26) % 1 + 1) % 1;
                    put(P, i, C3);
                    P.h[i] = 4 - (bd < 0.06 ? 2 : 0);
                });
            },
        }));
        // the swift's nest wedged between two corbels on the right
        if (!o.bare) nest(g, { x: h + 74, y: -PITCH * 1.5, s: 1.25, seed: seed + 'n' });
    }

    // The ceiling of interlaced stars, an octagonal ring about the opening: laths with a
    // groove (two fillets), the stars gilt, the other pieces painted; a moulded frame round
    // the opening and a gilt pendant at each of its corners.
    function lattice(g, o = {}) {
        const { r = 270, box, seed = 51 } = o;
        const T = 130, L = rosettes(T, 8, T * 0.27), R = {}, Q = {}, O = {};
        const FACE = ['star', 'white', 'green', 'blue', 'red', 'green', 'blue', 'red', 'white', 'green'];
        const ST8 = { rt: 27, rn: 27 * Math.cos(Math.PI / 4) / Math.cos(Math.PI / 8), M: 8, ph: 1 };
        const pend = [];
        const Rv = r / Math.cos(Math.PI / 8);
        for (let k = 0; k < 8; k++) pend.push([Math.cos(((k + 0.5) * TAU) / 8) * (Rv + 12), Math.sin(((k + 0.5) * TAU) / 8) * (Rv + 12)]);
        surface(g, box, frag(o, {
            depth: 24, sharp: 0.5, soft: 3, swell: 0.55, ao: 12, aoK: 0.14, aoA: 0.5, cast: 18, castA: 0.6,
            env: glowEnv(260, 820, 0.64, 1.08),
            pix(P) {
                each(P, (x, y, i) => {
                    octAt(x, y, r, O);
                    if (O.v < 0) return;
                    const nz = noise2(x * 0.07, y * 0.07, seed), nz2 = noise2(x * 0.017, y * 0.017, seed + 1);
                    // the pendants (racimos): small gilt muqarnas seen from below
                    for (let k = 0; k < (O.v < 46 ? 8 : 0); k++) {
                        const dx = x - pend[k][0], dy = y - pend[k][1], rr = Math.hypot(dx, dy);
                        if (rr < 21) {
                            const a = Math.atan2(dy, dx) + k, s8 = ((a / TAU) * 8 + 80) % 1, ring = rr < 8 ? 0 : rr < 15 ? 1 : 2;
                            const cell = Math.sin(Math.PI * (ring === 1 ? (s8 + 0.5) % 1 : s8));
                            lerp3(GOLD_D, GOLD_L, clamp(0.35 + 0.5 * cell - 0.15 * ring), C3);
                            put(P, i, C3);
                            P.h[i] = 22 + 6 * Math.sqrt(Math.max(0, 1 - (rr / 21) ** 2)) - 2.5 * cell;
                            P.mt[i] = 1;
                            P.gl[i] = 0.6;
                            P.ex[i] = 0.6;
                            inkAt(P, i, 21 - rr - 0.6, 0.8);
                            if (Math.abs(rr - 8) < 0.5 || Math.abs(rr - 15) < 0.5) inkAt(P, i, 0, 0.35, 0.7);
                            return;
                        }
                    }
                    if (O.v < 30) {
                        // the frame: a gilt bead, a red cove, a fillet
                        const v = O.v;
                        if (v < 9) {
                            lerp3(GOLD, GOLD_L, clamp(0.3 + 0.5 * Math.sin((Math.PI * v) / 9) + 0.2 * nz), C3);
                            P.mt[i] = 0.9;
                            P.gl[i] = 0.4;
                            P.h[i] = 12 + 4 * Math.sin((Math.PI * v) / 9);
                        } else if (v < 22) {
                            lerp3(PAINT.red, [70, 20, 18], 0.3 * nz + 0.2, C3);
                            P.h[i] = 9 - 3 * Math.sin((Math.PI * (v - 9)) / 13);
                        } else {
                            cedar(x, y, (O.side * Math.PI) / 4 + Math.PI / 2, seed, C3);
                            P.h[i] = 10;
                        }
                        put(P, i, C3);
                        inkAt(P, i, v - 0.7, 1);
                        inkAt(P, i, v - 9, 0.4, 0.7);
                        inkAt(P, i, v - 22, 0.4, 0.7);
                        inkAt(P, i, v - 29.5, 0.6);
                        // the mitres of the frame
                        const ang = Math.atan2(y, x), mm = Math.abs(((ang / TAU) * 8 + 8.5) % 1 - 0.5) * (r + v) * 0.785;
                        if (mm < 1.2) inkAt(P, i, mm, 0.35, 0.7);
                        return;
                    }
                    L.at(x, y, R);
                    strapOf(L, R, 5.2, 0.6, Q);
                    if (Q.kind) {
                        const lost = h3(Q.id, seed, 9, 1) < 0.012;
                        const ga = L.F[Q.f] ? Math.atan2(L.F[Q.f].nx, -L.F[Q.f].ny) : 0;
                        if (lost) {
                            // a lath gone: the board behind, and the nails that held it
                            cedar(x * 1.3, y * 1.3, ga + 0.4, seed + 9, C3);
                            tint(C3, [40, 24, 16], 0.45);
                            const nail = hashI(Math.round(x / 9), Math.round(y / 9), 3, seed) < 0.18 && Math.abs(Q.d) < 1.2;
                            if (nail) lerp3(C3, [60, 54, 52], 0.8, C3);
                            put(P, i, C3);
                            P.h[i] = 1;
                            return;
                        }
                        cedar(x, y, ga, seed + (Q.id & 63), C3);
                        // two white fillets down each lath, either side of the groove
                        const ad = Math.abs(Q.d);
                        if (ad > 1.2 && ad < 2.6 && noise2(x * 0.1, y * 0.1, seed + 7) > -0.45) tint(C3, PAINT.white, 0.8);
                        if (hashI(Math.round(x * 1.3), Math.round(y * 1.3), 11, seed) < 0.006) tint(C3, [24, 14, 10], 0.9); // worm holes
                        put(P, i, C3);
                        P.h[i] = 14 * smooth(0, 1, Q.edge) - 1.6 * Math.exp(-(Q.d * Q.d) / 0.5) - (Q.over < 0 ? 2 * (1 - smooth(0, 1.5, Q.edge)) : 0);
                        inkAt(P, i, Q.edge - 0.35, 0.4, 0.9);
                        return;
                    }
                    // the panels: stars gilt, the rest painted, cedar where the paint has gone
                    let kind = FACE[R.orbit % FACE.length], starEdge = 1e9;
                    const u = h3(R.key, seed, 3, 1);
                    const wet = nz2 > 0.42; // where the water came in
                    if (kind === 'star') {
                        const lx = x - R.ci * T, ly = y - R.cj * T, rr = Math.hypot(lx, ly), sr = zigR(ST8, Math.atan2(ly, lx));
                        kind = rr < sr ? 'gold' : 'red';
                        starEdge = rr - sr;
                    }
                    const bare = () => cedar(x, y, 0.3 + u, seed + (R.key & 63), C3);
                    if (kind === 'gold') {
                        const keep = noise2(x * 0.09, y * 0.09, R.key & 255) > (wet ? 0.35 : -0.55);
                        if (keep) {
                            lerp3(GOLD, GOLD_L, clamp(0.3 + 0.5 * u + 0.3 * nz), C3);
                            P.mt[i] = 1;
                            P.gl[i] = 0.5;
                        } else bare();
                    } else {
                        const keep = noise2(x * 0.06, y * 0.06, R.key & 255) > (wet ? 0.2 : -0.6);
                        if (keep) lerp3(PAINT[kind], kind === 'white' ? [200, 186, 160] : [20, 14, 20], 0.15 + 0.3 * u + 0.15 * nz, C3);
                        else bare();
                    }
                    tint(C3, [58, 40, 30], wet ? 0.25 : 0);
                    put(P, i, C3);
                    P.h[i] = 5 + 0.5 * nz + (starEdge < 0 ? 1.2 : 0);
                    P.tx[i] += (u - 0.5) * 0.08;
                    inkAt(P, i, starEdge, 0.45, 0.9);
                });
            },
        }));
    }

    // ================================================================== 4 · the muqarnas
    // A zigzag (a star of M points: tips at rt, notches at rn, turned by ph half-steps): its
    // radius on the ray at angle a.
    function zigR(Z, a) {
        const D = TAU / Z.M, ph = ((Z.ph ?? 0) * D) / 2;
        const sp = (a - ph) / (D / 2), j = Math.floor(sp);
        const a0 = ph + (j * D) / 2, a1 = a0 + D / 2, r0 = j & 1 ? Z.rn : Z.rt, r1 = j & 1 ? Z.rt : Z.rn;
        const Ax = Math.cos(a0) * r0, Ay = Math.sin(a0) * r0, Bx = Math.cos(a1) * r1, By = Math.sin(a1) * r1;
        const ux = Math.cos(a), uy = Math.sin(a);
        return (Ax * By - Ay * Bx) / (ux * (By - Ay) - uy * (Bx - Ax));
    }
    const SKY = rgb('#f3d8c4'), WIN = { HWD: 31, apex: 8, sill: 8 }, GREENP = rgb('#2f7a5a');
    // The tiers (outer first): each a zigzag; between two zigzags a row of cells.
    //   win: the drum's sixteen lattice windows, between radii [r0, r1], the moon in the one
    //   nearest the angle `moon`
    const TIERS = [
        { zig: [{ rt: 356, rn: 338, M: 48, ph: 0 }, { rt: 338, rn: 318, M: 48, ph: 1 }, { rt: 320, rn: 300, M: 48, ph: 0 }, { rt: 302, rn: 282, M: 48, ph: 1 }], win: { r0: 364, r1: 476, moon: -2.25 }, base: 30, step: 7, deep: 11 },
        { zig: [{ rt: 460, rn: 424, M: 32, ph: 1 }, { rt: 424, rn: 387, M: 32, ph: 0 }, { rt: 389, rn: 355, M: 32, ph: 1 }, { rt: 357, rn: 325, M: 32, ph: 0 }, { rt: 327, rn: 300, M: 32, ph: 1 }, { rt: 302, rn: 276, M: 32, ph: 0 }, { rt: 278, rn: 255, M: 32, ph: 1 }], base: 34, step: 7, deep: 10 },
        { zig: [{ rt: 470, rn: 417, M: 16, ph: 0 }, { rt: 417, rn: 370, M: 16, ph: 1 }, { rt: 374, rn: 334, M: 32, ph: 0 }, { rt: 336, rn: 302, M: 32, ph: 1 }, { rt: 305, rn: 278, M: 32, ph: 0 }, { rt: 280, rn: 255, M: 16, ph: 1 }, { rt: 260, rn: 233, M: 16, ph: 0 }], base: 34, step: 7, deep: 12 },
    ];
    function muqarnas(g, o = {}) {
        const { tier = 0, box, seed = 61 + tier } = o, TI = TIERS[tier], Z = TI.zig, n = Z.length;
        const RW = {}, QW = {}, WL = rosettes(44, 8, 44 * 0.27), DW = rosettes(52, 8, 52 * 0.27);
        const win = TI.win, moonJ = win ? Math.round(((win.moon / TAU) * 16 + 16) % 16) : -1;
        const rs = new Float64Array(n), LQ0 = [0, 0, 0];
        surface(g, box, frag(o, {
            depth: 60, sharp: 0.45, soft: 2.5, swell: 0.4, diff: 0.55, ao: 9, aoK: 0.05, aoA: 0.3, cast: 12, castA: 0.5,
            env: glowEnv(180, 640, 0.6, 1.1),
            draw(A) {
                if (!win) return;
                // the sky behind the windows: the dawn coming, pale gold to rose; the moon's
                // window, on the night side, still dark blue with its stars
                const gr = A.createRadialGradient(0, 0, win.r0, 0, 0, win.r1);
                gr.addColorStop(0, '#fff6e0');
                gr.addColorStop(0.55, '#ffe8c8');
                gr.addColorStop(1, '#f6d2c4');
                A.fillStyle = gr;
                A.beginPath();
                A.arc(0, 0, win.r1, 0, TAU);
                A.arc(0, 0, win.r0, 0, TAU, true);
                A.fill('evenodd');
                for (let j = 0; j < 16; j++) {
                    // the sky a little different through each window (thin cloud, the light's side)
                    const aj = (j * TAU) / 16, rm = (win.r0 + win.r1) / 2, k = 0.5 + 0.5 * Math.cos(aj + 2.3);
                    const gq = A.createRadialGradient(Math.cos(aj) * rm, Math.sin(aj) * rm, 4, Math.cos(aj) * rm, Math.sin(aj) * rm, 60);
                    gq.addColorStop(0, `rgba(255,244,214,${0.5 * k})`);
                    gq.addColorStop(1, 'rgba(255,244,214,0)');
                    A.fillStyle = gq;
                    A.fillRect(Math.cos(aj) * rm - 60, Math.sin(aj) * rm - 60, 120, 120);
                }
                const r = Motion.rng('sky/' + seed);
                {
                    const aj = (moonJ * TAU) / 16, pts = [];
                    for (let q = 0; q <= 40; q++) {
                        const s2 = -WIN.HWD - 2 + ((WIN.HWD * 2 + 4) * q) / 40, w2 = WIN.apex - 2 + WIN.HWD - Math.sqrt(Math.max(0, WIN.HWD * WIN.HWD - s2 * s2));
                        const rr = win.r0 + w2;
                        pts.push([Math.cos(aj + s2 / rr) * rr, Math.sin(aj + s2 / rr) * rr]);
                    }
                    const rs2 = win.r1 - WIN.sill + 2;
                    pts.push([Math.cos(aj + (WIN.HWD + 2) / rs2) * rs2, Math.sin(aj + (WIN.HWD + 2) / rs2) * rs2], [Math.cos(aj - (WIN.HWD + 2) / rs2) * rs2, Math.sin(aj - (WIN.HWD + 2) / rs2) * rs2]);
                    A.fillStyle = '#243066';
                    A.beginPath();
                    S.trace(A, pts);
                    A.fill();
                    for (let k = 0; k < 14; k++) {
                        const s2 = (r() - 0.5) * 40, rr = win.r0 + 20 + r() * 80;
                        A.fillStyle = `rgba(255,250,235,${0.5 + r() * 0.5})`;
                        A.beginPath();
                        A.arc(Math.cos(aj + s2 / rr) * rr, Math.sin(aj + s2 / rr) * rr, 0.5 + r() * 0.6, 0, TAU);
                        A.fill();
                    }
                }
                // the moon, gibbous, in one window
                const am = (moonJ * TAU) / 16 + 0.002, rm = (win.r0 + win.r1) / 2 + 6, mx = Math.cos(am) * rm, my = Math.sin(am) * rm, R = 23;
                const halo = A.createRadialGradient(mx, my, R, mx, my, R * 2.6);
                halo.addColorStop(0, 'rgba(230,226,240,0.55)');
                halo.addColorStop(1, 'rgba(230,226,240,0)');
                A.fillStyle = halo;
                A.fillRect(mx - R * 3, my - R * 3, R * 6, R * 6);
                A.save();
                A.beginPath();
                A.arc(mx, my, R, 0, TAU);
                A.clip();
                A.fillStyle = '#5d5c80';
                A.fillRect(mx - R, my - R, R * 2, R * 2);
                // the lit part: the disc less a sliver on the dark side (gibbous)
                A.beginPath();
                A.arc(mx, my, R, -Math.PI / 2, Math.PI / 2);
                A.ellipse(mx, my, R * 0.55, R, 0, Math.PI / 2, -Math.PI / 2, false);
                A.fillStyle = '#ecead8';
                A.fill();
                // the seas
                for (const [dx, dy, rr] of [[6, -8, 7], [10, 3, 6], [3, 9, 5], [-4, -3, 4], [13, -1, 3]]) {
                    A.fillStyle = 'rgba(150,146,150,0.55)';
                    A.beginPath();
                    A.ellipse(mx + dx, my + dy, rr, rr * 0.8, 0.4, 0, TAU);
                    A.fill();
                }
                A.fillStyle = 'rgba(255,255,250,0.8)';
                A.beginPath();
                A.arc(mx + 4, my + 14, 1.6, 0, TAU);
                A.fill();
                A.restore();
            },
            pix(P) {
                const a = P.a;
                each(P, (x, y, i) => {
                    const rho = Math.hypot(x, y), th = Math.atan2(y, x);
                    for (let k = 0; k < n; k++) rs[k] = zigR(Z[k], th);
                    if (rho < rs[n - 1]) return; // the opening
                    const nz = noise2(x * 0.08, y * 0.08, seed), nz2 = noise2(x * 0.02, y * 0.02, seed + 1);
                    if (rho >= rs[0]) {
                        // ---- outside the cells: the drum
                        const lip = rho - rs[0];
                        if (win && rho >= win.r0 && rho < win.r1) {
                            const j = Math.round(((th / TAU) * 16 + 16) % 16) % 16, aj = (j * TAU) / 16;
                            let da = th - aj;
                            da = ((da + Math.PI * 3) % TAU) - Math.PI;
                            const s = da * rho, w = rho - win.r0, HWD = WIN.HWD, apex = WIN.apex, sill = win.r1 - win.r0 - WIN.sill;
                            const inArch = Math.abs(s) < HWD && w > apex + HWD - Math.sqrt(Math.max(0, HWD * HWD - s * s)) && w < sill;
                            const eIn = Math.min(HWD - Math.abs(s), sill - w, w - (apex + HWD - Math.sqrt(Math.max(0, HWD * HWD - s * s))));
                            if (inArch) {
                                // the lattice: plaster bars, the sky through them (darker bars against the light)
                                WL.at(s, w, RW);
                                strapOf(WL, RW, 1.3, 0.2, QW);
                                if (QW.kind) {
                                    // a bar against the light: dark, its edges lit
                                    lerp3(IVORY_D, [96, 80, 92], clamp(0.5 + 0.3 * nz - 0.5 * clamp(1 - QW.edge / 0.7)), C3);
                                    put(P, i, C3);
                                    P.h[i] = 46;
                                    P.ex[i] = 1;
                                    inkAt(P, i, QW.edge - 0.2, 0.3, 0.6);
                                } else {
                                    if (o.nightSky) {
                                        // the night behind the lattice, the gibbous moon in it
                                        const ms = o.nightSky, dx = x - ms.x, dy = y - ms.y, rr = Math.hypot(dx, dy);
                                        if (rr < ms.r) {
                                            const lit = dx > -ms.r * 0.55 * Math.sqrt(Math.max(0, 1 - (dy / ms.r) ** 2));
                                            const sea = noise2(dx * 0.18, dy * 0.18, 5) + 0.5 * noise2(dx * 0.5, dy * 0.5, 6);
                                            lerp3(lit ? [238, 234, 214] : [86, 88, 128], lit ? [170, 166, 160] : [70, 70, 110], clamp(sea * 0.8 + 0.1), C3);
                                            if (lit) tint(C3, [255, 252, 240], clamp(1 - rr / ms.r) * 0.3);
                                        } else {
                                            lerp3([30, 40, 92], [70, 72, 128], clamp(1 - (rr - ms.r) / (ms.r * 2.4)) * 0.8, C3);
                                            if (hashI(Math.round(x * 1.5), Math.round(y * 1.5), 2, 7) < 0.004) lerp3(C3, [255, 250, 230], 0.9, C3);
                                        }
                                        put(P, i, C3);
                                    } else if (!a[i * 4 + 3]) put(P, i, SKY);
                                    a[i * 4 + 3] = 255;
                                    P.em[i] = 1;
                                    // the sky is light, not a surface: lift it so the lamp does not shade it
                                    P.h[i] = 40;
                                    P.ex[i] = 1;
                                    P.gl[i] = 0;
                                }
                                return;
                            }
                            // the surround (alfiz) and the piers between windows
                            lerp3(IVORY, IVORY_D, clamp(0.25 + 0.25 * nz), C3);
                            const sur = eIn > -7 && Math.abs(s) < HWD + 7 && w > apex - 7 && w < sill + 7;
                            if (!sur) {
                                // the pier: fluted, a rosette at mid height
                                // the pier: a gilt colonnette half way between two windows, twisted,
                                // and a carved rosette over it; the rest plaster in low relief
                                const half = (Math.PI / 16) * rho, dc = Math.abs(Math.abs(s) - half), mid = (win.r1 - win.r0) / 2;
                                P.h[i] = 42 + 0.6 * noise2(x * 0.25, y * 0.25, seed + 5);
                                if (dc < 4) {
                                    const tw = Math.sin(w * 0.7 + dc);
                                    lerp3(GOLD, GOLD_L, clamp(0.4 + 0.4 * tw), C3);
                                    P.h[i] = 46 + 2 * Math.sqrt(1 - (dc / 4) ** 2);
                                    P.mt[i] = 0.8;
                                } else if (Math.hypot(dc, w - mid) < 12) {
                                    const rr2 = Math.hypot(dc, w - mid), fa = Math.atan2(w - mid, dc) * 8;
                                    tint(C3, RED, 0.5 * (Math.cos(fa) > 0.3 ? 1 : 0));
                                    P.h[i] = 44 + 2 * (1 - rr2 / 12);
                                } else {
                                    const keep = noise2(x * 0.05, y * 0.05, seed + 4) + 0.4 * noise2(x * 0.17, y * 0.17, seed + 8);
                                    if (keep > -0.2) tint(C3, AZURE, smooth(-0.2, -0.1, keep) * 0.75);
                                }
                            } else {
                                P.h[i] = 45 + 1.5 * Math.sin(clamp(-eIn / 7) * Math.PI);
                                if (eIn > -3.5) tint(C3, GOLD, 0.55);
                                const dc = Math.abs(Math.abs(s) - (Math.PI / 16) * rho);
                                if (dc < 4) {
                                    lerp3(GOLD, GOLD_L, 0.5, C3);
                                    P.mt[i] = 0.8;
                                }
                            }
                            tint(C3, GRIME, 0.2 * smooth(0.2, 0.8, nz2));
                            // the light from the window spilling on the plaster round it
                            tint(C3, [255, 238, 204], 0.45 * clamp(1 + eIn / 22) * (moonJ === j ? 0.3 : 1));
                            put(P, i, C3);
                            inkAt(P, i, eIn, 0.6);
                            inkAt(P, i, eIn + 7, 0.45, 0.8);
                            if (w < 2 || w > win.r1 - win.r0 - 2) inkAt(P, i, 0, 0.6);
                            return;
                        }
                        // the drum's wall: a band of dentils, then plaster ruled with a zigzag
                        lerp3(IVORY, IVORY_D, clamp(0.3 + 0.25 * nz), C3);
                        let hh = 44;
                        if (lip < 9) {
                            const dn = Math.floor(th * rho / 7), on = ((th * rho) / 7 - dn) < 0.62;
                            hh = 44 + (on ? 2.5 : 0);
                            if (!on) tint(C3, RED, 0.6);
                        } else if (win && rho > win.r1) {
                            // above the windows: a cornice, then strapwork of eight on azure
                            const v = rho - win.r1;
                            if (v < 10) {
                                const dn = Math.floor((th * rho) / 7), on = (th * rho) / 7 - dn < 0.62;
                                hh = 44 + (on && v > 2 ? 2.5 : 0) + (v < 2 ? 1.5 : 0);
                                if (!on && v > 2) tint(C3, RED, 0.6);
                                tint(C3, GRIME, 0.25 * smooth(0, 1, nz2 + 0.3));
                                put(P, i, C3);
                                P.h[i] = hh;
                                inkAt(P, i, v - 1, 0.6);
                                inkAt(P, i, v - 9.5, 0.5);
                                return;
                            }
                            DW.at(th * (win.r1 + 80), v, RW);
                            strapOf(DW, RW, 2.2, 0.35, QW);
                            if (QW.kind) {
                                lerp3(IVORY, IVORY_D, clamp(0.2 + 0.25 * nz), C3);
                                if (noise2(x * 0.06, y * 0.06, seed + 7) > 0.3) tint(C3, GOLD, 0.5);
                                hh = 44 + 2.4 * smooth(0, 1, QW.edge);
                                tint(C3, GRIME, 0.2 * smooth(0, 1, nz2 + 0.3));
                                put(P, i, C3);
                                P.h[i] = hh;
                                inkAt(P, i, QW.edge - 0.3, 0.35, 0.85);
                                return;
                            }
                            const u3 = h3(RW.key, seed, 8, 2), paint = RW.orbit === 0 ? RED : u3 < 0.15 ? GREENP : AZURE;
                            lerp3(IVORY_D, IVORY, clamp(0.4 + 0.3 * nz), C3);
                            const keep = noise2(x * 0.04, y * 0.04, seed + 13) + 0.45 * noise2(x * 0.15, y * 0.15, seed + 14);
                            if (keep > -0.45) tint(C3, paint, smooth(-0.45, -0.33, keep) * 0.88);
                            tint(C3, GRIME, 0.25 * smooth(0, 1, nz2 + 0.3));
                            put(P, i, C3);
                            P.h[i] = 43 + 0.4 * nz;
                            return;
                        }
                        tint(C3, GRIME, 0.25 * smooth(0, 1, nz2 + 0.3));
                        put(P, i, C3);
                        P.h[i] = hh + 0.4 * nz;
                        if (lip < 1.4) inkAt(P, i, lip - 0.6, 0.8);
                        return;
                    }
                    // ---- a cell
                    let k = 0;
                    const LQ = LQ0;
                    while (k < n - 2 && rho < rs[k + 1]) k++;
                    const Zo = Z[k], D = TAU / Zo.M, ph = ((Zo.ph ?? 0) * D) / 2;
                    const sp = (((th - ph) / (D / 2)) % (2 * Zo.M) + 2 * Zo.M) % (2 * Zo.M), j = Math.floor(sp), s = sp - j;
                    const rOut = rs[k], rIn = rs[k + 1], w = clamp((rho - rIn) / Math.max(1, rOut - rIn));
                    const id = k * 1000 + j, u = h3(id, tier, 1, seed), u2 = h3(id, tier, 2, seed);
                    // A niche seen from below: dark in its back (tucked under the tier above),
                    // bright at its lip; of its two halves, the one that faces the light is lit.
                    // Rows by turns: a single pocket, or two facets meeting at a ridge.
                    const split = (k + tier) & 1;
                    lightAt(x, y, LQ);
                    const Lt = -LQ[0] * Math.sin(th) + LQ[1] * Math.cos(th);
                    const face = (s < 0.5 ? 1 : -1) * (split ? -1 : 1);
                    const across = split ? Math.abs(2 * s - 1) : Math.sin(Math.PI * s);
                    const back = Math.pow(w, 1.1);
                    let tone = 1.06 - 0.66 * back * (0.7 + 0.3 * across) + 0.3 * face * Lt * (0.35 + 0.65 * back) * (split ? Math.abs(2 * s - 1) * 0.6 + 0.4 : 1);
                    tone += 0.05 * (u - 0.5) + 0.04 * nz;
                    const base = TI.base - k * TI.step;
                    let hh = base - 2.5 * back;
                    // the plaster with its paint: azure or red in the backs, gilt on the lips
                    C4[0] = IVORY[0]; C4[1] = IVORY[1]; C4[2] = IVORY[2];
                    const restored = u2 < 0.014;
                    if (!restored) {
                        const paint = u < 0.4 ? AZURE : u < 0.55 ? RED : u < 0.62 ? GREENP : null;
                        const keep = 0.55 * noise2(x * 0.11, y * 0.11, id & 511) + 0.25 * noise2(x * 0.4, y * 0.4, 9) + 1.2 * (w - 0.42);
                        if (paint && keep > 0) tint(C4, paint, smooth(0, 0.08, keep) * 0.92);
                        if (w < 0.11 + 0.05 * ((k + tier) % 2)) tint(C4, GOLD, ((k + tier) % 2 ? 0.85 : 0.55) * (noise2(x * 0.2, y * 0.2, 4) > -0.35 ? 1 : 0.15));
                        tint(C4, GRIME, 0.22 * smooth(-0.2, 0.9, nz2));
                    } else {
                        lerp3(C4, [246, 242, 230], 0.5, C4);
                        tone = 0.35 + tone * 0.7;
                    }
                    tone += 0.05 * (hashI(Math.round(x * 2.2), Math.round(y * 2.2), 4, seed) - 0.5) + 0.04 * noise2(x * 0.6, y * 0.6, seed + 3);
                    if (w > 0.8 && Math.min(s, 1 - s) < 0.2) tone -= 0.12 * smooth(0.8, 1, w) * (1 - Math.min(s, 1 - s) / 0.2); // soot in the back corners
                    if (u2 > 0.5 && u2 < 0.62 && Math.abs(noise2(x * 0.18, y * 0.18, id & 255)) < 0.018) tone -= 0.25; // a hairline crack
                    tone = clamp(tone, 0.18, 1.12);
                    C3[0] = C4[0] * tone;
                    C3[1] = C4[1] * tone;
                    C3[2] = C4[2] * tone;
                    tint(C3, [22, 20, 52], (1 - tone) * 0.35);
                    // a lip broken: the reed core inside
                    if (!restored && u2 > 0.96 && w < 0.24 && Math.abs(s - 0.5) < 0.2 + 0.1 * noise2(x * 0.3, y * 0.3, 2)) {
                        lerp3([128, 98, 66], [72, 52, 36], 0.5 + 0.5 * noise2(x * 0.8, y * 0.8, 6), C3);
                        hh -= 1.5;
                    }
                    put(P, i, C3);
                    P.h[i] = hh;
                    P.ex[i] = 0.4;
                    // the arrises: the lip heavy, the cell walls fine
                    const dl = w * (rOut - rIn), ds = Math.min(s, 1 - s) * (D / 2) * rho;
                    if (!inkAt(P, i, dl - 0.9, 1.0)) inkAt(P, i, ds, 0.4, 0.75);
                });
            },
        }));
        // a cobweb in one cell, a crack running up the tier
        if (o.bare) return;
        const r = Motion.rng('mq/' + seed);
        const ca = -0.6 + tier * 2.1, Zc = Z[Math.min(n - 2, 1)];
        cobweb(g, Math.cos(ca) * (zigR(Zc, ca) - 6), Math.sin(ca) * (zigR(Zc, ca) - 6), 16, ca, r);
        crack(g, -2.9 + tier * 1.3, zigR(Z[n - 1], -2.9 + tier * 1.3), zigR(Z[0], -2.9 + tier * 1.3), r);
    }
    function cobweb(g, x, y, R, a, r) {
        g.save();
        g.strokeStyle = 'rgba(245,240,228,0.5)';
        g.lineWidth = 0.55;
        const spokes = [];
        for (let k = 0; k < 7; k++) {
            const b = a + Math.PI + (k / 6 - 0.5) * 2.2;
            spokes.push(b);
            g.beginPath();
            g.moveTo(x, y);
            g.lineTo(x + Math.cos(b) * R * (0.8 + r() * 0.4), y + Math.sin(b) * R * (0.8 + r() * 0.4));
            g.stroke();
        }
        for (let ring = 1; ring <= 4; ring++) {
            g.beginPath();
            spokes.forEach((b, k) => {
                const rr = (ring / 4.4) * R * (0.92 + r() * 0.16), px = x + Math.cos(b) * rr, py = y + Math.sin(b) * rr;
                if (k) g.lineTo(px, py);
                else g.moveTo(px, py);
            });
            g.stroke();
        }
        g.restore();
    }
    function crack(g, a, r0, r1, r) {
        const pts = [];
        let aa = a;
        for (let rr = r0 + 2; rr < r1; rr += 3) {
            aa += (r() - 0.5) * 0.012;
            pts.push([Math.cos(aa) * rr, Math.sin(aa) * rr]);
        }
        if (pts.length < 2) return;
        S.ink(g, pts.map(([x, y]) => [x + 0.6, y + 0.6]), { w: 1.2, color: 'rgba(255,248,230,0.5)', taper: [1, 1] });
        S.ink(g, pts, { w: 1.0, color: '#3a2a26', taper: [1, 1], alpha: 0.85 });
    }

    // ================================================================== 5 · Córdoba
    // The eight ribs: each from a support to the third one on, so they cross as an
    // eight-pointed star round an octagon; over and under by turns. Their soffits: a gilt
    // bead, red fillets, a row of carved rosettes, lobed edges.
    const STONE = rgb('#ddcfb0'), STONE_D = rgb('#a8957a');
    function ribs(g, o = {}) {
        const { c = 262, hw = 25, box, seed = 71 } = o;
        const L = wheel(8, c, Math.PI / 8), R = {}, Q = {}, R2 = {}, cand = new Int32Array(8), cd = new Float64Array(8);
        surface(g, box, frag(o, {
            depth: 30, sharp: 0.45, soft: 3, swell: 0.5, ao: 10, aoK: 0.1, aoA: 0.4, cast: 20, castA: 0.6,
            env: glowEnv(200, 600, 0.68, 1.1),
            pix(P) {
                each(P, (x, y, i) => {
                    // every rib that passes here; the one on top owns the point, and a rib
                    // under others butts against each of them with a joint
                    let nc = 0;
                    for (let q = 0; q < 8; q++) {
                        const f = L.F[q], dd = x * f.nx + y * f.ny - c;
                        if (Math.abs(dd) < hw + 0.8) {
                            cand[nc] = q;
                            cd[nc++] = dd;
                        }
                    }
                    if (!nc) return;
                    // over(a, b): is rib a on top of rib b where they cross
                    const over = (a, b) => {
                        R2.f1 = cand[a];
                        R2.c1 = c;
                        R2.f2 = cand[b];
                        R2.c2 = c;
                        return L.over1(R2);
                    };
                    let own = -1;
                    for (let a = 0; a < nc; a++) {
                        if (Math.abs(cd[a]) >= hw) continue;
                        let top = true;
                        for (let b = 0; b < nc && top; b++) if (b !== a && Math.abs(cd[b]) < hw + 0.8 && !over(a, b)) top = false;
                        if (top) {
                            own = a;
                            break;
                        }
                    }
                    if (own < 0) {
                        // under something: the highest rib that contains the point, butting
                        let best = -1, bestUnder = 99;
                        for (let a = 0; a < nc; a++) {
                            if (Math.abs(cd[a]) >= hw) continue;
                            let under = 0;
                            for (let b = 0; b < nc; b++) if (b !== a && Math.abs(cd[b]) < hw + 0.8 && !over(a, b)) under++;
                            if (under < bestUnder) {
                                bestUnder = under;
                                best = a;
                            }
                        }
                        own = best;
                    }
                    if (own < 0) return;
                    let jedge = 99, nover = 0, nunder = 0;
                    for (let b = 0; b < nc; b++) {
                        if (b === own) continue;
                        if (!over(own, b)) jedge = Math.min(jedge, Math.abs(cd[b]) - hw - 0.4), nunder++;
                        else nover++;
                    }
                    Q.f = cand[own];
                    Q.d = cd[own];
                    Q.edge = Math.min(hw - Math.abs(cd[own]), jedge);
                    Q.over = nunder ? -1 : nover ? 1 : 0;
                    if (Q.edge < 0) return;
                    const f = L.F[Q.f], t = -x * f.ny + y * f.nx, d = Q.d, ad = Math.abs(d);
                    // the lobed edge
                    const lp = ((t / 13) % 1 + 1) % 1, lobe = 3.2 * (1 - Math.sqrt(Math.max(0, 1 - (2 * lp - 1) ** 2)));
                    const edge = Math.min(Q.edge, hw - lobe - ad);
                    if (edge < 0) return;
                    const nz = noise2(x * 0.1, y * 0.1, seed), id = Q.f;
                    lerp3(STONE, STONE_D, clamp(0.2 + 0.25 * nz + 0.15 * noise2(x * 0.02, y * 0.02, seed + id)), C3);
                    let hh = 18 + 3 * Math.cos((Math.PI * d) / (2 * hw)) - 6 * (1 - smooth(0, 14, jedge));
                    if (ad < 3) {
                        lerp3(GOLD, GOLD_L, clamp(0.4 + 0.4 * nz), C3);
                        hh += 2 * (1 - ad / 3);
                        P.mt[i] = 0.9;
                        P.gl[i] = 0.4;
                    } else if (ad < 13) {
                        // rosettes in relief along the soffit, on azure
                        const tt = ((t / 34) % 1 + 1) % 1 - 0.5, rx = tt * 34, rr = Math.hypot(rx, d), fa = Math.atan2(d, rx);
                        const pet = rr < 11 * (0.6 + 0.4 * Math.abs(Math.cos(4 * fa)));
                        if (pet) {
                            lerp3(STONE, [250, 244, 226], 0.3, C3);
                            hh += 3 * (1 - rr / 10);
                            if (rr < 2.5) {
                                lerp3(GOLD, GOLD_L, 0.5, C3);
                                P.mt[i] = 0.8;
                            }
                        } else if (noise2(x * 0.06, y * 0.06, seed + 3) > -0.45) tint(C3, [128, 34, 26], 0.8);
                        if (ad > 3 && ad < 3.8) inkAt(P, i, 0, 0.35, 0.6);
                    } else if (ad < 18) {
                        if (noise2(x * 0.08, y * 0.08, seed + 5) > -0.5) tint(C3, AZURE, 0.85);
                        hh -= 1;
                        if (ad < 13.6 || ad > 17.4) inkAt(P, i, 0, 0.3, 0.6);
                    } else {
                        // the rib's flank: on the side away from the axis it shows, in shadow
                        const outer = d * (x * f.nx + y * f.ny) > 0;
                        tint(C3, outer ? [92, 72, 58] : STONE_D, outer ? 0.55 : 0.3);
                        hh -= outer ? 3 : 1;
                    }
                    tint(C3, GRIME, 0.2 * smooth(0, 1, nz + 0.4));
                    put(P, i, C3);
                    P.h[i] = hh * smooth(-0.4, 1.4, edge);
                    inkAt(P, i, edge - 0.6, 0.85);
                });
            },
        }));
    }

    // The gold mosaic: rows that follow the octagon, tesserae one by one, scrolls of green,
    // blue and red glass on the gold, a border of red and white; ONE tessera missing.
    const GOLDS = ['#4a2c08', '#7a4c10', '#ad7820', '#d69e30', '#ecbf4c', '#f9dc7c', '#fff0b0'].map(rgb);
    const GLASS = {
        green: ['#0b3a2a', '#176048', '#2a8a62', '#52ae82'].map(rgb), blue: ['#101f58', '#1c3486', '#2d51a8', '#4a74c4'].map(rgb),
        red: ['#5e1410', '#8a2218', '#ac3824', '#c85a3a'].map(rgb), white: ['#b9b09c', '#d6cdb8', '#e8e1d0', '#f4efe2'].map(rgb),
        dark: ['#1a1410', '#2e2216', '#3e2e1a', '#4c3a22'].map(rgb), teal: ['#0f3c44', '#1c6068', '#2f8a8c', '#62b4ae'].map(rgb),
    };
    const palAt = (pal, t, o) => {
        const f = clamp(t) * (pal.length - 1), i0 = Math.min(pal.length - 2, Math.floor(f));
        return lerp3(pal[i0], pal[i0 + 1], f - i0, o);
    };
    // The scrolls, drawn once as flat colours on a map (1 unit = 1 pixel): one tree of
    // scrolls in each of the eight bays, each a little different, as one hand would lay them.
    const mapCache = new Map();
    function scrollMap(R0, ext, seed) {
        const key = R0 + '/' + ext + '/' + seed;
        if (mapCache.has(key)) return mapCache.get(key);
        const c = document.createElement('canvas');
        c.width = c.height = ext * 2;
        const q = c.getContext('2d', { willReadFrequently: true });
        q.translate(ext, ext);
        q.lineCap = 'round';
        q.lineJoin = 'round';
        const COL = { green: '#00ff00', blue: '#0000ff', red: '#ff0000', white: '#ffffff', teal: '#00ffff' };
        for (let b = 0; b < 8; b++) {
            const r = Motion.rng('scroll/' + seed + '/' + b), A0 = (b * TAU) / 8;
            const P = (rr, off) => [Math.cos(A0) * rr - Math.sin(A0) * off, Math.sin(A0) * rr + Math.cos(A0) * off];
            // the stem, waving a little
            const stem = [];
            for (let rr = R0 + 12; rr < ext * 1.4; rr += 12) stem.push(P(rr, 5 * Math.sin(rr * 0.03 + b)));
            q.strokeStyle = COL.green;
            q.lineWidth = 9;
            q.beginPath();
            S.trace(q, stem, false);
            q.stroke();
            // tendrils by turns left and right, each a spiral ending in a leaf, a flower or a fruit
            let side = r() < 0.5 ? -1 : 1;
            for (let rr = R0 + 44 + r() * 10; rr < ext * 1.35; rr += 52 + r() * 16, side = -side) {
                const sp = [], turns = 1.05 + r() * 0.4, R1 = 26 + r() * 10;
                const c0 = P(rr + 18, side * (R1 + 6));
                for (let k = 0; k <= 40; k++) {
                    const t = k / 40, ang = -side * Math.PI / 2 + A0 + Math.PI + side * t * turns * TAU, rad = R1 * (1 - 0.72 * t);
                    sp.push([c0[0] + Math.cos(ang) * rad, c0[1] + Math.sin(ang) * rad]);
                }
                q.strokeStyle = COL.green;
                q.lineWidth = 6;
                q.beginPath();
                q.moveTo(...P(rr, 0));
                S.trace(q, sp, false);
                q.stroke();
                const end = sp[sp.length - 1], kind = r();
                if (kind < 0.45) {
                    // a half-palmette leaf curled in the spiral's eye
                    q.fillStyle = r() < 0.6 ? COL.blue : COL.teal;
                    q.beginPath();
                    q.ellipse(end[0], end[1], 11, 6.5, A0 + side * 0.8, 0, TAU);
                    q.fill();
                } else if (kind < 0.8) {
                    // a flower: red petals, white heart
                    for (let p = 0; p < 6; p++) {
                        const pa = (p / 6) * TAU;
                        q.fillStyle = COL.red;
                        q.beginPath();
                        q.ellipse(end[0] + Math.cos(pa) * 6.5, end[1] + Math.sin(pa) * 6.5, 5, 3.6, pa, 0, TAU);
                        q.fill();
                    }
                    q.fillStyle = COL.white;
                    q.beginPath();
                    q.arc(end[0], end[1], 3.4, 0, TAU);
                    q.fill();
                } else {
                    // a fruit: a red bud in a blue cup
                    q.fillStyle = COL.blue;
                    q.beginPath();
                    q.ellipse(end[0], end[1] + 3, 9, 6, A0, 0, TAU);
                    q.fill();
                    q.fillStyle = COL.red;
                    q.beginPath();
                    q.arc(end[0], end[1] - 2, 6, 0, TAU);
                    q.fill();
                }
                // leaves springing from the tendril
                for (let lf = 0; lf < 2; lf++) {
                    const p0 = sp[8 + lf * 9], la = Math.atan2(p0[1] - c0[1], p0[0] - c0[0]);
                    q.fillStyle = lf ? COL.teal : COL.blue;
                    q.beginPath();
                    q.ellipse(p0[0] + Math.cos(la) * 8, p0[1] + Math.sin(la) * 8, 9, 4, la, 0, TAU);
                    q.fill();
                }
            }
            // where two bays meet, under the ribs' crossings: a small rosette of eight
            const mb = A0 + TAU / 16;
            for (const rr of [R0 + 70, R0 + 190, R0 + 310]) {
                const cx = Math.cos(mb) * rr, cy = Math.sin(mb) * rr;
                for (let p = 0; p < 8; p++) {
                    const pa = (p / 8) * TAU;
                    q.fillStyle = p & 1 ? COL.red : COL.white;
                    q.beginPath();
                    q.ellipse(cx + Math.cos(pa) * 7, cy + Math.sin(pa) * 7, 5, 2.8, pa, 0, TAU);
                    q.fill();
                }
                q.fillStyle = COL.blue;
                q.beginPath();
                q.arc(cx, cy, 3.5, 0, TAU);
                q.fill();
            }
        }
        const d = q.getImageData(0, 0, ext * 2, ext * 2).data;
        const res = {
            ext,
            at(x, y) {
                const X = Math.round(x + ext), Y = Math.round(y + ext);
                if (X < 0 || Y < 0 || X >= ext * 2 || Y >= ext * 2) return null;
                const o4 = (Y * ext * 2 + X) * 4;
                if (d[o4 + 3] < 128) return null;
                const r = d[o4], gg = d[o4 + 1], b = d[o4 + 2];
                return r > 128 && gg > 128 && b > 128 ? 'white' : r > 128 ? 'red' : gg > 128 && b > 128 ? 'teal' : gg > 128 ? 'green' : 'blue';
            },
        };
        mapCache.set(key, res);
        return res;
    }
    // The tessera under a point of an octagonal-row mosaic about the axis: its side, row, index,
    // centre (x, y) and the distance in from its edge. Rows follow the octagon of inradius r0.
    function tessera(x, y, r0, pitch, wid, seed, T) {
        let best = -1e9, second = -1e9, side = 0;
        for (let k = 0; k < 8; k++) {
            const a = (k * Math.PI) / 4, d = x * Math.cos(a) + y * Math.sin(a);
            if (d > best) {
                second = best;
                best = d;
                side = k;
            } else if (d > second) second = d;
        }
        const a = (side * Math.PI) / 4, nx = Math.cos(a), ny = Math.sin(a), v = best - r0, t = -x * ny + y * nx;
        const vr = v + 1.3 * noise2(t * 0.012, v * 0.01, seed);
        const row = Math.floor(vr / pitch), off = h3(row, side, 1, seed) * wid;
        const tt = t + off;
        let j = Math.floor(tt / wid);
        const bj = (q) => q * wid + 1.4 * (h3(row, q, side, seed) - 0.5);
        if (tt < bj(j)) j--;
        else if (tt > bj(j + 1)) j++;
        const b0 = bj(j), b1 = bj(j + 1);
        T.side = side;
        T.row = row;
        T.j = j;
        T.v = v;
        T.edge = Math.min(vr - row * pitch, (row + 1) * pitch - vr, tt - b0, b1 - tt, (best - second) * 1.31);
        const vc = (row + 0.5) * pitch, tc = (b0 + b1) / 2 - off;
        T.cx = nx * (r0 + vc) - ny * tc;
        T.cy = ny * (r0 + vc) + nx * tc;
        T.id = (Math.imul(row + 999, 0x9e3779b1) ^ Math.imul(j + 77777, 0x85ebca6b) ^ Math.imul(side + 3, 0xc2b2ae35)) >>> 0;
        return T;
    }
    // one tessera's pixel: glass of a palette, its own tilt; gold blazes or goes dark by it
    function tessPix(P, i, x, y, kind, T, seed, o = {}) {
        if (T.edge < (o.joint ?? 0.42)) {
            // grey lime, darker in the crevice
            lerp3([150, 140, 122], [70, 62, 54], 0.4 + 0.3 * noise2(x * 0.2, y * 0.2, seed), C3);
            put(P, i, C3);
            P.h[i] = 0;
            return;
        }
        const u = h3(T.id, seed, 1, 3), u2 = h3(T.id, seed, 2, 3), u3 = h3(T.id, seed, 3, 3);
        let pal = kind === 'gold' ? GOLDS : GLASS[kind], metal = kind === 'gold' ? 1 : 0, tone;
        if (kind === 'gold' && u3 < 0.03) {
            pal = ['#3a1a14', '#5a2a1c', '#7a3c24', '#94502e'].map(rgb); // set on its back
            metal = 0;
            tone = u;
        } else if (kind === 'gold' && u3 < 0.05) {
            pal = ['#56603a', '#7a8448', '#a0a45c', '#c4c47c'].map(rgb); // the skin lost, the leaf gone green
            metal = 0;
            tone = u;
        } else tone = kind === 'gold' ? 0.5 + (u - 0.5) * 0.5 : 0.35 + u * 0.45;
        palAt(pal, tone + 0.12 * noise2(x * 0.5, y * 0.5, T.id & 1023), C3);
        if (o.grime) tint(C3, [40, 30, 22], o.grime);
        put(P, i, C3);
        P.h[i] = 2.4 * smooth(0, 0.9, T.edge);
        P.mt[i] = metal * 0.9;
        P.gl[i] = metal ? 0.65 : 0.45;
        const tilt = metal ? 0.42 : 0.2;
        P.tx[i] += (u - 0.5) * tilt * 2;
        P.ty[i] += (u2 - 0.5) * tilt * 2;
        // a pit, a scratch
        if (u2 > 0.82 && hashI(Math.round(x * 2), Math.round(y * 2), T.id & 255, 5) < 0.04) tint(C3, pal[0], 0.7), put(P, i, C3);
    }
    function mosaic(g, o = {}) {
        const { r = 200, box, seed = 81, missing = [-188, -176] } = o;
        const PITCH = 5.6, WID = 5.5, T = {};
        // o.ext: how far out the scrolls are drawn (a fragment's box is on the page, not on
        // the ring: it passes the ring's own reach, so one map serves all its fragments)
        const map = scrollMap(r + 14, o.ext ?? Math.ceil(Math.max(Math.abs(box.x), Math.abs(box.y), box.x + box.w, box.y + box.h)) + 10, seed);
        tessera(missing[0], missing[1], r, PITCH, WID, seed, T);
        const lostId = T.id;
        surface(g, box, frag(o, {
            depth: 6, sharp: 0.4, soft: 2, swell: 0.3, ao: 6, aoK: 0.3, aoA: 0.4, cast: 4, castA: 0.4,
            env: glowEnv(200, 560, 0.75, 1.12),
            pix(P) {
                each(P, (x, y, i) => {
                    tessera(x, y, r, PITCH, WID, seed, T);
                    if (T.v < 0) return;
                    if (T.id === lostId) {
                        // the one gone: its socket, the bed's red underpainting at the bottom
                        lerp3([138, 62, 44], [96, 44, 32], 0.5 + 0.5 * noise2(x * 0.6, y * 0.6, 3), C3);
                        put(P, i, C3);
                        P.h[i] = -1.2;
                        P.ex[i] = 0.7;
                        return;
                    }
                    let kind = 'gold';
                    if (T.row < 3) {
                        // the border: a sawtooth of red and white, gold between
                        const zz = ((T.j % 6) + 6) % 6;
                        kind = T.row === 1 ? (zz < 3 ? 'red' : 'white') : T.row === 0 ? 'dark' : zz < 3 ? 'white' : 'red';
                    } else if (T.row === 3) kind = 'dark';
                    else {
                        const m = map.at(T.cx, T.cy);
                        if (m) kind = m;
                        else {
                            // the outline row round every motif, as a mosaicist sets it
                            for (const [dx, dy] of [[PITCH, 0], [-PITCH, 0], [0, PITCH], [0, -PITCH]]) {
                                if (map.at(T.cx + dx, T.cy + dy)) {
                                    kind = 'dark';
                                    break;
                                }
                            }
                        }
                    }
                    tessPix(P, i, x, y, kind, T, seed, { grime: 0.25 * smooth(0.3, 1, noise2(x * 0.01, y * 0.01, seed + 9)) });
                    if (T.v < 1.6) inkAt(P, i, T.v - 0.8, 0.9);
                });
            },
        }));
    }

    // ================================================================== the crown
    // A scalloped shell of gold mosaic, sixteen flutes, and at its centre the lantern open to
    // the sky: an eight-pointed star (two squares), its stone frame lit by the dawn.
    function crown(g, o = {}) {
        const { box, seed = 91, tip = 172 } = o;
        const notch = tip * Math.cos(Math.PI / 4) / Math.cos(Math.PI / 8);
        const ZS = { rt: tip, rn: notch, M: 8, ph: 0 }, T = {};
        const ROSE = rgb('#f0c8b8');
        surface(g, box, frag(o, {
            depth: 20, sharp: 0.4, soft: 3, swell: 0.4, ao: 8, aoK: 0.2, aoA: 0.35, cast: 4, castA: 0.4,
            env: (x, y) => 0.72 + 0.45 * (1 - smooth(130, 420, Math.hypot(x, y))),
            pix(P) {
                each(P, (x, y, i) => {
                    const rho = Math.hypot(x, y), th = Math.atan2(y, x), rs = zigR(ZS, th);
                    if (rho < rs) return;
                    const fr = rho - rs, nz = noise2(x * 0.1, y * 0.1, seed);
                    const dawn = 1 - smooth(0, 160, fr);
                    if (fr < 22) {
                        // the lantern's frame: a stone moulding, a gilt bead
                        lerp3(STONE, STONE_D, clamp(0.2 + 0.3 * nz), C3);
                        let hh = 14 + 4 * Math.sin((Math.PI * fr) / 22);
                        if (fr > 13 && fr < 18) {
                            lerp3(GOLD, GOLD_L, 0.5 + 0.3 * nz, C3);
                            P.mt[i] = 0.9;
                            hh += 1.5;
                        }
                        tint(C3, ROSE, dawn * 0.5);
                        put(P, i, C3);
                        P.h[i] = hh;
                        inkAt(P, i, fr - 0.9, 1.1);
                        inkAt(P, i, fr - 13, 0.35, 0.7);
                        inkAt(P, i, fr - 21.5, 0.6);
                        return;
                    }
                    // the flutes
                    const sf = (((th / TAU) * 16 + 0.5) % 1 + 1) % 1, ridge = Math.min(sf, 1 - sf) * (TAU / 16) * rho;
                    const deep = smooth(rs + 22, rs + 160, rho);
                    if (ridge < 3.2) {
                        lerp3(STONE, STONE_D, clamp(0.25 + 0.3 * nz), C3);
                        tint(C3, ROSE, dawn * 0.4);
                        put(P, i, C3);
                        P.h[i] = 12;
                        inkAt(P, i, 3.2 - ridge - 0.4, 0.45);
                        return;
                    }
                    const hh = 12 - 9 * deep * Math.sin(Math.PI * sf);
                    // tesserae in rings, within the flute
                    const pitch = 6.2, rr0 = rho - 120 + 0.8 * noise2(th * 30, rho * 0.02, seed), row = Math.floor(rr0 / pitch), ang = (th - Math.floor((th * 16) / TAU + 0.5) * (TAU / 16)) * rho, wid = 6.2, off = h3(row, 3, 1, seed) * wid;
                    const tt = ang + off, j = Math.floor(tt / wid);
                    const edge = Math.min(rr0 - row * pitch, (row + 1) * pitch - rr0, tt - j * wid, (j + 1) * wid - tt, ridge - 3.2, fr - 22);
                    T.id = (Math.imul(row + 5, 0x9e3779b1) ^ Math.imul(j + 99999, 0x85ebca6b) ^ Math.imul(Math.floor((th * 16) / TAU + 0.5) + 40, 0xc2b2ae35)) >>> 0;
                    T.edge = edge;
                    const kind = fr < 34 ? 'blue' : fr < 40 ? 'white' : 'gold';
                    tessPix(P, i, x, y, kind, T, seed);
                    P.h[i] += hh;
                    // the dawn on the gold nearest the lantern
                    const o4 = i * 4;
                    C3[0] = P.a[o4];
                    C3[1] = P.a[o4 + 1];
                    C3[2] = P.a[o4 + 2];
                    tint(C3, ROSE, dawn * 0.35);
                    put(P, i, C3);
                });
            },
        }));
        // a fragment keeps the lantern's edge as its own (what is inside it was never painted)
        if (o.map) return;
        // the lantern itself: cut clean, opaque before cutting
        g.save();
        g.globalCompositeOperation = 'destination-out';
        g.fillStyle = '#000';
        g.beginPath();
        for (let k = 0; k < 16; k++) {
            const a = (k * TAU) / 16, rr = k & 1 ? notch : tip;
            g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
        }
        g.closePath();
        g.fill();
        g.restore();
    }


    // ================================================================== the stratum
    // Round 7: the dome as ONE stratum of loose things, as a restorer's workshop or a museum
    // store would hold the ceilings of al-Andalus: fragments lying on one another at all
    // angles on a heap of their own matter, lit from the top left like the rest of the film.
    // Every fragment is painted by the ring painter it was broken from (`map` takes a point of
    // the fragment to the point of the ring it came from, `clip` is its broken outline), on a
    // sheet of its own, then laid down with its contour and its cast shadow.

    // a broken outline: the polygon's sides nibbled, `brk` of them (by index) snapped across
    function broken(pts, seed, amp = 3, brk = []) {
        const r = Motion.rng('brk/' + seed), out = [];
        for (let i = 0; i < pts.length; i++) {
            const A = pts[i], B = pts[(i + 1) % pts.length], l = Math.hypot(B[0] - A[0], B[1] - A[1]), n = Math.max(2, Math.round(l / 9));
            const nx = -(B[1] - A[1]) / l, ny = (B[0] - A[0]) / l, big = brk.includes(i);
            for (let k = 0; k < n; k++) {
                const t = k / n, w = k === 0 ? 0 : big ? (r() - 0.5) * amp * 6 + Math.sin(t * Math.PI) * amp * 3 * (r() < 0.5 ? 1 : -1) : (r() - 0.5) * amp;
                out.push([A[0] + (B[0] - A[0]) * t + nx * w, A[1] + (B[1] - A[1]) * t + ny * w]);
            }
        }
        return out;
    }
    // A fragment laid on g at (x, y), turned by rot, scaled by s.
    //   outline  its broken edge, in its own units (origin at its middle)
    //   paint(q, box, o)  a ring painter, called with { map, clip, lrot, bare: true } in o
    //   from(lx, ly, Q)   the point of the ring a point of the fragment comes from
    //   side     its thickness, shown towards the shadow (units, before s); sideCol
    function fragment(g, f) {
        const { x, y, rot = 0, s = 1, outline, from, side = 0, sideCol = '#7a6a56' } = f;
        const c = Math.cos(rot), sn = Math.sin(rot);
        const toPage = ([lx, ly]) => [x + (lx * c - ly * sn) * s, y + (lx * sn + ly * c) * s];
        const pts = outline.map(toPage);
        const sd = side * s, SD = S.SHADE_DIR;
        const bb = S.bbox([...pts, ...pts.map(([px, py]) => [px + SD[0] * sd, py + SD[1] * sd])], 8);
        const res = S.pxScale(g), cv = document.createElement('canvas');
        cv.width = Math.ceil(bb.w * res);
        cv.height = Math.ceil(bb.h * res);
        const q = cv.getContext('2d');
        q.setTransform(res, 0, 0, res, -bb.x * res, -bb.y * res);
        if (sd > 0) {
            // the slab's thickness: its broken edge seen from the side, darker, a lit lip
            for (let k = 6; k >= 1; k--) {
                q.beginPath();
                S.trace(q, pts.map(([px, py]) => [px + (SD[0] * sd * k) / 6, py + (SD[1] * sd * k) / 6]));
                q.fillStyle = S.mix(sideCol, '#2a1e1a', (k / 6) * 0.45);
                q.fill();
            }
        }
        const Q = [0, 0];
        const map = (px, py, out) => {
            const dx = (px - x) / s, dy = (py - y) / s;
            from(dx * c + dy * sn, -dx * sn + dy * c, out);
        };
        const clip = (m) => {
            m.beginPath();
            S.trace(m, pts);
            m.fill();
        };
        // ring → page, the inverse of `map` (an affine: three points fix it)
        const R0 = [0, 0], R1 = [0, 0], R2 = [0, 0];
        map(0, 0, R0);
        map(1, 0, R1);
        map(0, 1, R2);
        const a = R1[0] - R0[0], b = R1[1] - R0[1], cc = R2[0] - R0[0], d = R2[1] - R0[1], det = a * d - b * cc;
        const ia = d / det, ib = -b / det, ic = -cc / det, id = a / det;
        const xf = [ia, ib, ic, id, -(ia * R0[0] + ic * R0[1]), -(ib * R0[0] + id * R0[1])];
        f.paint(q, bb, { map, clip, lrot: rot, bare: true, xf });
        if (f.after) f.after(q, toPage);
        // loose (round 8): nothing under it to cast on; the dome's light over the stratum
        if (LOOSE) domeLight(cv, bb, res);
        S.stamp(g, { canvas: cv, box: bb }, { lw: 2.3, heavy: 0.8, cast: LOOSE ? null : { blur: 14, dx: 10, dy: 14, color: 'rgba(36,22,14,0.55)' } });
    }
    const rectPts = (w, h) => [[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2]];

    // ---- the fragments, each from its ring
    // a panel of the dado: its crowning merlons, the chequer, the field of eights; one corner
    // snapped off and the mortar bed showing beyond the break
    function fDado(g, o) {
        const W = 330, H = 260;
        const bed = broken(rectPts(W + 14, H + 14), 'bed' + o.seed, 4, [1, 2]);
        fragment(g, { ...o, outline: bed, side: 9, sideCol: '#8c7c64', from: (lx, ly, Q) => ((Q[0] = lx), (Q[1] = -(290 + ly + H / 2 + 30))),
            paint: (q, box, p) => {
                // the bed: plaster, the ridges that stood between the lost tiles
                const L = rosettes(150, 8, 150 * 0.27), R = {}, Qs = {};
                surface(q, box, { ...p, env: () => 1, depth: 8, cast: 6, castA: 0.4, pix(P) {
                    each(P, (X, Y, i) => {
                        const nz = noise2(X * 0.08, Y * 0.08, 3);
                        lerp3(PLASTER, [150, 136, 112], clamp(0.35 + 0.35 * nz), C3);
                        L.at(X, -Y - 290 - 58 + 75, R);
                        strapOf(L, R, 3.2, 0.55, Qs);
                        const ridge = Math.abs(Qs.edge) < 0.9;
                        if (ridge) tint(C3, [236, 228, 210], 0.6);
                        put(P, i, C3);
                        P.h[i] = (ridge ? 1.2 : 0) + 0.5 * nz;
                    });
                } });
                // the tiles, inside the break
                const tiles = broken([[-W / 2, -H / 2], [W / 2, -H / 2], [W / 2, H * 0.05], [W * 0.1, H / 2], [-W / 2, H / 2]], 'tl' + o.seed, 1.4, [2]);
                const cc = Math.cos(o.rot), ss = Math.sin(o.rot), s = o.s ?? 1;
                const pg = tiles.map(([lx, ly]) => [o.x + (lx * cc - ly * ss) * s, o.y + (lx * ss + ly * cc) * s]);
                dado(q, { box, hx: 480, hy: 290, seed: 11, ...p, clip: (m) => { m.beginPath(); S.trace(m, pg); m.fill(); } });
            } });
    }
    // a length of the knot band with its cornice, broken at both ends
    function fKnot(g, o) {
        const L = 440;
        fragment(g, { ...o, outline: broken(rectPts(L, 74), 'kn' + o.seed, 2.5, [1, 3]), side: 10, sideCol: '#a89878',
            from: (lx, ly, Q) => ((Q[0] = lx + 30), (Q[1] = -(270 + ly + 37))), paint: (q, box, p) => plaster(q, { box, h: 270, ...p }) });
    }
    // a corbel with a stub of its beam
    function fCorbel(g, o) {
        const out = broken([[-21, 0], [21, 0], [21, 150], [74, 150], [74, 214], [-74, 214], [-74, 150], [-21, 150]], 'cb' + o.seed, 1.2, [3, 5]);
        fragment(g, { ...o, outline: out.map(([a, b]) => [a, b - 107]), side: 16, sideCol: '#5a3a24',
            from: (lx, ly, Q) => ((Q[0] = lx), (Q[1] = -(300 + ly + 107))), paint: (q, box, p) => corbels(q, { box, h: 300, ...p }) });
    }
    // a piece of the ceiling of stars: its border with a gilt pendant at the corner
    function fCeiling(g, o) {
        const out = broken([[-210, -250], [150, -270], [230, -40], [200, 260], [-180, 240], [-240, 30]], 'ce' + o.seed, 5, [1, 3, 4]);
        fragment(g, { ...o, outline: out, side: 12, sideCol: '#4e3220',
            from: (lx, ly, Q) => ((Q[0] = 470 + lx), (Q[1] = 150 + ly)), paint: (q, box, p) => lattice(q, { box, r: 270, ...p }) });
    }
    // a block of muqarnas cells: a wedge of four tiers, its back broken off
    function fMuqarnas(g, o) {
        const pts = [];
        for (let k = 0; k <= 12; k++) {
            const a = -0.4 + (k / 12) * 0.8;
            pts.push([Math.cos(a) * 452 - 360, Math.sin(a) * 452]);
        }
        for (let k = 12; k >= 0; k--) {
            const a = -0.4 + (k / 12) * 0.8;
            pts.push([Math.cos(a) * 258 - 360, Math.sin(a) * 258]);
        }
        fragment(g, { ...o, outline: broken(pts, 'mq' + o.seed, 2, [12]), side: 26, sideCol: '#b8a688',
            from: (lx, ly, Q) => ((Q[0] = 360 + lx), (Q[1] = ly)), paint: (q, box, p) => muqarnas(q, { box, tier: 1, ...p }) });
    }
    // a lattice window from the drum: its star grid, its surround, the gibbous moon behind
    function fWindow(g, o) {
        const aj = (10 * TAU) / 16, er = [Math.cos(aj), Math.sin(aj)], et = [-Math.sin(aj), Math.cos(aj)], R0 = 420;
        const pts = [];
        for (let k = 0; k <= 16; k++) {
            const a = Math.PI + (k / 16) * Math.PI;
            pts.push([Math.cos(a) * 42, -14 + Math.sin(a) * 42]);
        }
        pts.push([42, 58], [-42, 58]);
        const at = (lx, ly) => [R0 * er[0] + lx * et[0] + ly * er[0], R0 * er[1] + lx * et[1] + ly * er[1]];
        const mc = at(9, -16);
        fragment(g, { ...o, outline: broken(pts, 'wn' + o.seed, 1.5, [17]), side: 10, sideCol: '#a89878',
            from: (lx, ly, Q) => { const p = at(lx, ly); Q[0] = p[0]; Q[1] = p[1]; },
            paint: (q, box, p) => muqarnas(q, { box, tier: 0, ...p, nightSky: { x: mc[0], y: mc[1], r: 21 } }) });
    }
    // a length of one of Córdoba's ribs, between two crossings
    function fRib(g, o) {
        const a0 = Math.PI / 8, n0 = [Math.cos(a0), Math.sin(a0)], d0 = [-Math.sin(a0), Math.cos(a0)], c = 262;
        fragment(g, { ...o, outline: broken(rectPts(320, 54), 'rb' + o.seed, 2, [1, 3]), side: 18, sideCol: '#9c8a6c',
            from: (lx, ly, Q) => ((Q[0] = c * n0[0] + (445 + lx) * d0[0] + ly * n0[0]), (Q[1] = c * n0[1] + (445 + lx) * d0[1] + ly * n0[1])),
            paint: (q, box, p) => ribs(q, { box, ...p }) });
    }
    // a slab of the gold mosaic with a scroll and its border, and the one tessera missing
    function fMosaic(g, o) {
        fragment(g, { ...o, outline: broken(rectPts(270, 210), 'ms' + o.seed, 3, [0, 2]), side: 11, sideCol: '#7c6a54',
            from: (lx, ly, Q) => ((Q[0] = -270 + lx), (Q[1] = -262 + ly)), paint: (q, box, p) => mosaic(q, { box, r: 215, ...p }) });
    }
    // a lump of plaster with the swift's nest still on it
    function fNest(g, o) {
        fragment(g, { ...o, outline: broken([[-80, -40], [70, -60], [96, 30], [20, 72], [-90, 50]], 'ns' + o.seed, 5, [2]), side: 14, sideCol: '#a8987c',
            from: (lx, ly, Q) => ((Q[0] = lx + 120), (Q[1] = -(270 + ly + 150))), paint: (q, box, p) => plaster(q, { box, h: 270, ...p }),
            after: (q, P) => {
                const c = P([-6, -4]);
                nest(q, { x: c[0], y: c[1], s: 2.1 * (o.s ?? 1), seed: 'st' + o.seed });
            } });
    }
    // the spider on its line
    function spider(g, x, y, s = 1, line = 60) {
        g.save();
        g.translate(x, y);
        g.scale(s, s);
        g.strokeStyle = 'rgba(250,244,230,0.7)';
        g.lineWidth = 0.7;
        g.beginPath();
        g.moveTo(-line * 0.5, -line);
        g.lineTo(0, -4);
        g.stroke();
        for (let side = -1; side <= 1; side += 2) {
            for (let k = 0; k < 4; k++) {
                const a = side * (0.5 + k * 0.42) + (side < 0 ? Math.PI : 0), kn = [Math.cos(a) * 7, Math.sin(a) * 5 - 3];
                S.ink(g, [[0, 0], kn, [kn[0] + Math.cos(a + side * 0.9) * 8, kn[1] + 7]], { w: 1.2, taper: [0, 1], color: '#2a2024' });
            }
        }
        S.piece(g, S.ellipse(0, 3, 4.4, 5.6, 16), { fill: '#6a5040', line: 1, shade: { color: '#1a1012', w: 3, alpha: 0.7 }, light: { w: 2 } });
        S.piece(g, S.ellipse(0, -2.6, 2.8, 2.5, 12), { fill: '#7a5e4a', line: 0.9 });
        g.fillStyle = 'rgba(255,240,210,0.85)';
        g.beginPath();
        g.arc(-1.3, 1.2, 0.9, 0, TAU);
        g.fill();
        g.restore();
    }

    // ---- the body: a heap of the dome's matter in small pieces
    // Loose tesserae of gold (most) and of glass, chips of plaster with azure or red on them,
    // stucco leaves broken off a panel, cut tiles of the five glazes; each piece its own
    // size, turn and tone, lying on the others (later pieces higher), on a bed of plaster
    // dust. Thin towards the way through, whose edge is pieces, never a line.
    function heap(g, o = {}) {
        const { box, seed = 101, gap = [430, 300], clusters = [] } = o;
        const r = Motion.rng('heap/' + seed);
        const inGap = (x, y, rad) => Math.hypot(x / gap[0], y / gap[1]) < 1 + rad / 380 + 0.22 * noise2(x * 0.0045, y * 0.0045, seed) + 0.08 * noise2(x * 0.015, y * 0.015, seed + 1);
        const pieces = [];
        // the large pieces first: carved plaster chunks, stucco leaves, tiles
        for (let k = 0; k < 2400 && pieces.length < 330; k++) {
            const x = box.x + r() * box.w, y = box.y + r() * box.h, u = r();
            const kind = u < 0.42 ? 'chunk' : u < 0.72 ? 'leaf' : 'tile';
            const size = { chunk: 95, leaf: 150, tile: 46 }[kind] * (0.7 + r() * 0.6);
            if (inGap(x, y, size * 0.6)) continue;
            if (pieces.some((q) => Math.hypot(q.x - x, q.y - y) < (q.size + size) * 0.3)) continue;
            pieces.push({ x, y, kind, size, h: 0.25 + r() * 0.5, rot: r() * TAU, u: r(), v: r() });
        }
        const N = o.n ?? 6500;
        for (let k = 0; k < N * 3 && pieces.length < N; k++) {
            let x, y;
            const cl = r() < 0.18 && clusters.length ? clusters[Math.floor(r() * clusters.length)] : null;
            if (cl) {
                const a = r() * TAU, d = Math.pow(r(), 0.7) * cl[2];
                x = cl[0] + Math.cos(a) * d;
                y = cl[1] + Math.sin(a) * d;
            } else {
                x = box.x + r() * box.w;
                y = box.y + r() * box.h;
            }
            const u = r(), kind = cl ? (u < 0.85 ? 'gold' : 'glass') : u < 0.55 ? 'gold' : u < 0.63 ? 'glass' : u < 0.86 ? 'chip' : 'tile';
            const size = { gold: 10, glass: 8.5, chip: 20, tile: 22 }[kind] * (0.7 + r() * 0.6);
            if (inGap(x, y, size)) continue;
            pieces.push({ x, y, kind, size, h: r(), rot: r() * TAU, u: r(), v: r() });
        }
        pieces.sort((a, b) => a.h - b.h);
        const GLZ = ['white', 'white', 'honey', 'honey', 'green', 'blue', 'black'], GLS = ['green', 'blue', 'red', 'teal'];
        surface(g, box, {
            depth: 20, sharp: 0.5, soft: 2.5, swell: 0.6, ao: 8, aoK: 0.25, aoA: 0.5, cast: 9, castA: 0.6, env: () => 1,
            draw(A, Hc, Mc) {
                for (const p of pieces) {
                    const grey = Math.round(70 + p.h * 170);
                    const hs = `rgb(${grey},${grey},${grey})`;
                    const poly = (pts, col, gl = 0, mt = 0) => {
                        const P2 = S.xf(pts, { x: p.x, y: p.y, rot: p.rot });
                        A.beginPath();
                        S.trace(A, P2);
                        A.fillStyle = col;
                        A.fill();
                        Hc.beginPath();
                        S.trace(Hc, P2);
                        Hc.fillStyle = hs;
                        Hc.fill();
                        Mc.beginPath();
                        S.trace(Mc, P2);
                        Mc.fillStyle = `rgb(${Math.round(gl * 255)},${Math.round(mt * 255)},0)`;
                        Mc.fill();
                    };
                    const z = p.size;
                    if (p.kind === 'gold' || p.kind === 'glass') {
                        const w = z * (0.85 + p.v * 0.3), j = 0.12 * z;
                        const sq = [[-w / 2 + p.u * j, -z / 2], [w / 2, -z / 2 + p.v * j], [w / 2 - p.v * j, z / 2], [-w / 2, z / 2 - p.u * j]];
                        if (p.kind === 'gold') {
                            const col = S.rgb2hex(...palAt(GOLDS, 0.25 + p.u * 0.7, [0, 0, 0]));
                            poly(sq, p.v < 0.08 ? '#6a3020' : col, 0.6, p.v < 0.08 ? 0 : 1);
                        } else poly(sq, S.rgb2hex(...palAt(GLASS[GLS[Math.floor(p.u * 4)]], 0.3 + p.v * 0.6, [0, 0, 0])), 0.5, 0);
                    } else if (p.kind === 'chip') {
                        const n = 6 + Math.floor(p.u * 4), pts = [];
                        for (let k = 0; k < n; k++) {
                            const a = (k / n) * TAU, rr = z * (0.55 + 0.45 * hashI(k, Math.round(p.x), Math.round(p.y), seed));
                            pts.push([Math.cos(a) * rr, Math.sin(a) * rr * 0.75]);
                        }
                        poly(pts, S.rgb2hex(...lerp3(IVORY, IVORY_D, p.v * 0.5, [0, 0, 0])));
                        if (p.u < 0.6) {
                            // the painted face, broken across
                            const P2 = S.xf(pts, { x: p.x, y: p.y, rot: p.rot });
                            A.save();
                            A.beginPath();
                            S.trace(A, P2);
                            A.clip();
                            A.fillStyle = p.u < 0.25 ? S.rgb2hex(...AZURE) : p.u < 0.38 ? S.rgb2hex(...RED) : S.rgb2hex(...GOLD);
                            A.beginPath();
                            S.trace(A, S.xf([[-z, -z], [z * (p.v - 0.3), -z], [z * (0.4 - p.v), z], [-z, z]], { x: p.x, y: p.y, rot: p.rot + 0.4 }));
                            A.fill();
                            A.restore();
                        }
                    } else if (p.kind === 'chunk') {
                        const n = 7 + Math.floor(p.u * 4), pts = [];
                        for (let k = 0; k < n; k++) {
                            const a = (k / n) * TAU, rr = z * (0.6 + 0.4 * hashI(k, Math.round(p.x), Math.round(p.y), seed + 1));
                            pts.push([Math.cos(a) * rr * 0.62, Math.sin(a) * rr * 0.5]);
                        }
                        poly(pts, S.rgb2hex(...lerp3(IVORY, IVORY_D, p.v * 0.4, [0, 0, 0])));
                        const P2 = S.xf(pts, { x: p.x, y: p.y, rot: p.rot });
                        for (const q of [A, Hc]) {
                            q.save();
                            q.beginPath();
                            S.trace(q, P2);
                            q.clip();
                        }
                        // the azure ground and a palmette carved on it
                        A.fillStyle = p.u < 0.28 ? S.rgb2hex(...AZURE) : p.u < 0.45 ? S.rgb2hex(...RED) : p.u < 0.55 ? S.rgb2hex(...GREENP) : S.rgb2hex(...lerp3(IVORY, GOLD, 0.35, [0, 0, 0]));
                        A.globalAlpha = p.u < 0.55 ? 0.85 : 0.6;
                        A.fillRect(p.x - z, p.y - z, z * 2, z * 2);
                        A.globalAlpha = 1;
                        for (const q of [A, Hc]) {
                            q.translate(p.x, p.y);
                            q.rotate(p.rot + Math.PI / 2);
                            q.scale(z / 150, z / 150);
                        }
                        palmette(A, Hc, Motion.rng('hc/' + Math.round(p.x) + '/' + Math.round(p.y)));
                        A.restore();
                        Hc.restore();
                    } else if (p.kind === 'leaf') {
                        const sc = z / 120;
                        for (const q of [A, Hc]) {
                            q.save();
                            q.translate(p.x, p.y);
                            q.rotate(p.rot);
                            q.scale(sc, sc);
                        }
                        palmette(A, Hc, Motion.rng('hl/' + Math.round(p.x) + '/' + Math.round(p.y)));
                        A.restore();
                        Hc.restore();
                    } else {
                        const glz = GLAZE[GLZ[Math.floor(p.u * GLZ.length)]], pick = Math.floor(p.v * 4);
                        let pts;
                        if (pick === 0) pts = rectPts(z * 0.8, z * 0.8);
                        else if (pick === 1) pts = [[0, -z * 0.6], [z * 0.3, 0], [0, z * 0.6], [-z * 0.3, 0]];
                        else {
                            pts = [];
                            const m = pick === 2 ? 8 : 6;
                            for (let k = 0; k < m * 2; k++) {
                                const a = (k * Math.PI) / m, rr = k & 1 ? z * 0.28 : z * 0.5;
                                pts.push([Math.cos(a) * rr, Math.sin(a) * rr]);
                            }
                        }
                        poly(pts, S.mix(glz.base, p.u < 0.5 ? glz.deep : glz.light, p.v * 0.6), 0.6, 0);
                    }
                }
            },
            pix(P) {
                const a = P.a;
                each(P, (x, y, i) => {
                    const o4 = i * 4;
                    if (a[o4 + 3] > 0) {
                        // grain on every piece, specks in the glaze, a scratch on the gold
                        const n = 0.06 * noise2(x * 0.5, y * 0.5, seed) + 0.05 * (hashI(Math.round(x * 2), Math.round(y * 2), 1, seed) - 0.5);
                        a[o4] = clamp(a[o4] * (1 + n), 0, 255);
                        a[o4 + 1] = clamp(a[o4 + 1] * (1 + n), 0, 255);
                        a[o4 + 2] = clamp(a[o4 + 2] * (1 + n), 0, 255);
                        if (P.mt[i] > 0) P.tx[i] += 0.5 * noise2(x * 0.35, y * 0.35, seed + 2), (P.ty[i] += 0.5 * noise2(x * 0.35, y * 0.35, seed + 3));
                        return;
                    }
                    // the bed: plaster dust and grit, darker in the crevices
                    if (inGap(x, y, 30)) return;
                    const nz = noise2(x * 0.05, y * 0.05, seed + 4), nz2 = noise2(x * 0.3, y * 0.3, seed + 5);
                    lerp3([196, 178, 146], [70, 56, 44], clamp(0.45 - 0.35 * nz + 0.25 * nz2), C3);
                    if (hashI(Math.round(x * 1.2), Math.round(y * 1.2), 6, seed) < 0.05) tint(C3, [236, 214, 160], 0.6);
                    put(P, i, C3);
                    P.h[i] = 4 * (0.5 + 0.5 * nz);
                });
            },
        });
    }

    // ---- the three sheets
    function stratumFar(g, box) {
        HOUSE = 1;
        try {
            heap(g, { box, clusters: [[470, -330, 120], [560, -180, 80], [-300, 420, 70]] });
            fKnot(g, { x: -500, y: -360, rot: -0.34, s: 1.45, seed: 1 });
            fMosaic(g, { x: 560, y: -340, rot: 0.2, s: 1.6, seed: 2 });
            fDado(g, { x: -560, y: 360, rot: -0.18, s: 1.45, seed: 3 });
            fNest(g, { x: 620, y: 380, rot: 0.3, s: 1.45, seed: 4 });
        } finally {
            HOUSE = 0;
        }
    }
    function stratumMid(g, box) {
        HOUSE = 1;
        try {
            fMuqarnas(g, { x: -660, y: -260, rot: 2.75, s: 1.7, seed: 5 });
            fWindow(g, { x: 660, y: 70, rot: 0.14, s: 2.4, seed: 6 });
            fRib(g, { x: 40, y: 430, rot: -0.1, s: 1.8, seed: 7 });
            spider(g, 160, 352, 1.6, 80);
        } finally {
            HOUSE = 0;
        }
    }
    function stratumNear(g, box) {
        HOUSE = 1;
        try {
            fCeiling(g, { x: -860, y: 140, rot: 0.32, s: 1.7, seed: 8 });
            fCorbel(g, { x: 700, y: -210, rot: -0.85, s: 3.0, seed: 9 });
        } finally {
            HOUSE = 0;
        }
    }

    return { lightAt, surface, lines, wheel, rosettes, strapOf, glaze, dado, plaster, nest, air, corbels, lattice, muqarnas, ribs, mosaic, crown, TIERS, zigR, heap, fragment, stratumFar, stratumMid, stratumNear };
})();
