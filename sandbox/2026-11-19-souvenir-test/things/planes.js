// Picture 8 · the things of «planes»: the guitar of picture 1 broken into planes, a homage to
// the Cubism that a painter from Málaga began. Global: Planes. Abstract, but every plane is
// paint: never a flat fill. Hue family: ochre, grey, umber, black and ONE blue (the night
// behind the moon); the moon a white disc.
//
// The manner, and the real things each technique imitates (ten small true details each):
//
// A PLANE (a facet of analytic Cubism): opaque oil scumbled over a ground of another tone.
//   1 the strokes all lean one way inside a plane, and change direction at its edge
//   2 the ground shows through where the brush ran dry   3 one edge is shaded with short
//   hatched strokes so the plane tilts away there, the opposite edge catches the light
//   4 the contour is a charcoal line, ruled, that overruns the corner by a few centimetres
//   5 the charcoal skips on the canvas tooth and leaves specks   6 not every edge is drawn:
//   some planes melt into the next («passage»)   7 pentimenti: an earlier contour, painted
//   out, still shows as a ghost line and a ridge of old paint   8 the plane above casts a
//   thin shadow on the one under it   9 the tone drifts warmer and cooler inside one plane
//   10 a few strokes of a neighbour's colour are dragged across the edge
//
// FAUX BOIS (a house painter's combed graining, the trade Braque learnt): an ochre base
// coat, an umber glaze, a steel comb dragged through it.
//   1 the comb's teeth leave sets of parallel lines   2 the sets do not quite meet: a seam
//   between passes   3 the comb is wiggled, so the lines wave together   4 a rocker leaves
//   heart-grain knots, lines parting round an eye   5 the eye is a few small rings
//   6 the glaze runs thin and the lines skip   7 broad drags of glaze lie under the lines
//   8 short pale ticks across the grain (medullary rays wiped out with a rag)
//   9 one pass runs in at a slant   10 the knot's lines are darker where the glaze pooled
//
// SAND IN THE PAINT: grains of sand mixed into the oil, each lit from the top left with a
//   dark side, clustered where the paint was thick, absent where it was scraped.
//
// PASTED PAPER (papier collé):
//   1 cut edges are straight with the small steps where the scissors stopped   2 torn edges
//   show the white fibrous core of the paper and whiskers of fibre   3 its thickness throws
//   a hair of shadow on the lower right   4 the paste darkens it in blotches with a tide mark
//   5 the paper cockles over the paste: soft ridges   6 pinholes from when it was pinned up
//   to be tried, each with a rust halo   7 foxing   8 the print of the back shows through,
//   mirrored, faintly   9 newsprint yellows towards the edges   10 one corner lifts and casts
//   a wider shadow
//
// THE NEWSPAPER (the corner of a page, ours: «LA BRISA», Málaga): masthead, a thick and a
//   thin rule, the dateline (25 October, number 1881: the painter's birthday and year),
//   headline, three columns with rules, justified type, an advertisement in a box, a fold,
//   the tear cutting through words. The news: the full moon over the port; a guitar heard
//   all night in the Plaza de la Merced (where he was born).
// THE WINE LABEL: cream laid paper with chain lines, a double rule border with corner
//   ornaments, two inks a hair out of register, an engraved bunch of grapes, MOSCATEL,
//   MÁLAGA, the vintage, a scuff, the glue's tide mark.
// THE SCORE: staves ruled five at a time with a rastrum (they waver together), treble
//   clefs, 3/4, the Andalusian cadence (A minor, G, F, E: the harmony of a malagueña) as
//   chords, stems, a slur, bar lines, the title, a page number, pencil fingering, a ring
//   left by a cup.
// THE WALLPAPER: distemper print in stripes with a small four-petalled flower, the second
//   colour out of register, a trimmed selvedge, faded where the sun reached, scuffed.
// THE BOTTLE and THE GLASS, as planes: the profile and the mouth seen from above at once
//   (a full ellipse on a profile), the halves seen from two heights, highlights as narrow
//   vertical planes, the wine's level, the foot as an ellipse, the stem.
// THE PIGEON'S WING (the painter's father painted pigeons): ten primaries, the outer ones
//   with a notched outer vane, secondaries, tertials, two black bars across the greater
//   coverts and the secondaries, coverts lying like tiles, the alula, the shafts, a paler
//   fringe on each tip, a darker trailing edge.
// THE NAIL (trompe-l'œil: the picture pinned up): a hand-forged rose head, four hammered
//   facets, a square shank showing where it went in at a slant, rust, its cast shadow long
//   to the lower right, a dent in the plane round it.
// THE HEAD OF THE GUITAR (a flamenco guitar with pegs): the crest, a dark veneer face, the
//   bone nut with six notches, the strings wound round the peg ends, the pegs in profile
//   (their knobs and collars) as if seen from the side at the same time.
// THE MOON: a full white disc; the maria as grey scumbles (the Sea of Rains, of Serenity, of
//   Tranquillity, of Crises, the Ocean of Storms), Tycho's bright rays low on the disc.
//
// Units are the caller's; drawers paint once, static, onto the caller's context, which may
// be turned: every light-dependent direction is computed through the current transform, so
// the light stays at the top left (Planes.shadeDir).
const Planes = (() => {
    const S = Souvenir;
    const TAU = Math.PI * 2;
    const PAL = {
        ochre: '#b8893f', ochreL: '#d4ad66', ochreP: '#e3cb93', ochreD: '#8c6226',
        umber: '#5b4733', burnt: '#4d2f1f', umberD: '#2f2119',
        grey: '#8f877a', greyL: '#bdb4a1', greyC: '#6d6e6e', greyD: '#46423e',
        black: '#1e1a19', bone: '#e7dec6', moon: '#eee8d9',
        blue: '#3b5a86', blueD: '#243a5e', blueL: '#7189ad',
        char: '#1f1b19', news: '#d8cdb1', cream: '#e6d9b8', print: '#2a2220',
    };
    const LIGHTC = '#f4e8c8', DARKC = '#1a1619';
    const tone = (c, v) => (v >= 0 ? S.mix(c, LIGHTC, Math.min(1, v)) : S.mix(c, DARKC, Math.min(1, -v)));

    // ------------------------------------------------------------------ geometry
    // where shadows fall, in the context's own units however it is turned
    function shadeDir(g) {
        const m = g.getTransform(), det = m.a * m.d - m.b * m.c || 1;
        const [sx, sy] = S.SHADE_DIR;
        const x = (m.d * sx - m.c * sy) / det, y = (-m.b * sx + m.a * sy) / det, l = Math.hypot(x, y) || 1;
        return [x / l, y / l];
    }
    const lightDir = (g) => {
        const d = shadeDir(g);
        return [-d[0], -d[1]];
    };
    const area = (pts) => {
        let a = 0;
        for (let i = 0; i < pts.length; i++) {
            const p = pts[i], q = pts[(i + 1) % pts.length];
            a += p[0] * q[1] - q[0] * p[1];
        }
        return a / 2;
    };
    const centroid = (pts) => {
        let x = 0, y = 0;
        for (const p of pts) {
            x += p[0];
            y += p[1];
        }
        return [x / pts.length, y / pts.length];
    };
    function inPoly(pts, x, y) {
        let c = false;
        for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
            const a = pts[i], b = pts[j];
            if (a[1] > y !== b[1] > y && x < ((b[0] - a[0]) * (y - a[1])) / (b[1] - a[1]) + a[0]) c = !c;
        }
        return c;
    }
    // a convex polygon cut by the line through p with normal n: [the side n points to, the other]
    function split(poly, p, n) {
        const A = [], B = [];
        for (let i = 0; i < poly.length; i++) {
            const a = poly[i], b = poly[(i + 1) % poly.length];
            const da = (a[0] - p[0]) * n[0] + (a[1] - p[1]) * n[1], db = (b[0] - p[0]) * n[0] + (b[1] - p[1]) * n[1];
            if (da >= 0) A.push(a);
            if (da <= 0) B.push(a);
            if ((da > 0 && db < 0) || (da < 0 && db > 0)) {
                const t = da / (da - db), q = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
                A.push(q);
                B.push(q);
            }
        }
        return [A, B];
    }
    const clip = (g, pts) => {
        g.beginPath();
        S.trace(g, pts);
        g.clip();
    };
    const fill = (g, pts, style) => {
        g.fillStyle = style;
        g.beginPath();
        S.trace(g, pts);
        g.fill();
    };
    const rect = (x, y, w, h) => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
    const quad = (cx, cy, w, h, rot = 0, skew = 0) => S.xf([[-w / 2 + skew, -h / 2], [w / 2 + skew, -h / 2], [w / 2 - skew, h / 2], [-w / 2 - skew, h / 2]], { x: cx, y: cy, rot });
    // a polyline walked at an even step (for lines that change along their length)
    function walk(pts, step) {
        const out = [];
        for (let i = 0; i < pts.length - 1; i++) {
            const a = pts[i], b = pts[i + 1], L = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(1, Math.ceil(L / step));
            for (let k = 0; k < n; k++) out.push([a[0] + ((b[0] - a[0]) * k) / n, a[1] + ((b[1] - a[1]) * k) / n]);
        }
        out.push(pts[pts.length - 1]);
        return out;
    }
    const pick = (list, r) => list[Math.floor(r() * list.length) % list.length];

    // ------------------------------------------------------------------ the brush
    // One stroke of a loaded brush: a lens of paint, a little fuller on one side, and (for
    // the larger ones) two bristle streaks along it.
    // One stroke of a flat brush: a band of paint with square, slightly ragged ends, fuller
    // at the start, and the ridges its bristles leave along it (one darker, one lighter).
    function mark(g, x, y, a, len, w, col, alpha, ridge = 0) {
        const c = Math.cos(a), s = Math.sin(a), L = len / 2, W = w / 2;
        g.globalAlpha = alpha;
        g.fillStyle = col;
        g.beginPath();
        // start (full, a little rounded), end (thinner, dragged off)
        g.moveTo(x - c * L - s * W, y - s * L + c * W);
        g.quadraticCurveTo(x - c * (L + W * 0.5), y - s * (L + W * 0.5), x - c * L + s * W, y - s * L - c * W);
        g.lineTo(x + c * L + s * W * 0.7, y + s * L - c * W * 0.7);
        g.lineTo(x + c * (L + W * 0.4) + s * W * 0.1, y + s * (L + W * 0.4) - c * W * 0.1);
        g.lineTo(x + c * L - s * W * 0.8, y + s * L + c * W * 0.8);
        g.closePath();
        g.fill();
        if (ridge) {
            g.lineWidth = Math.max(0.3, w * 0.07);
            for (const [o, cc] of [[-0.45, ridge[0]], [0.3, ridge[1]], [0.05, ridge[0]]]) {
                g.globalAlpha = alpha * 0.32;
                g.strokeStyle = cc;
                g.beginPath();
                g.moveTo(x - c * L * 0.95 - s * W * o, y - s * L * 0.95 + c * W * o);
                g.lineTo(x + c * L * (0.5 + 0.4 * Math.abs(o)) - s * W * o, y + s * L * (0.5 + 0.4 * Math.abs(o)) + c * W * o);
                g.stroke();
            }
        }
    }

    // The bristle tile: 512 × 512 greys of brush strokes running along x (bands of strokes
    // that start and stop, the bristles' fine ridges inside each, dry gaps), around mid-grey.
    // Laid with an 'overlay' blend it lightens and darkens whatever paint is under it.
    const tiles = new Map();
    function streakTile(v) {
        if (tiles.has(v)) return tiles.get(v);
        const N = 512, c = document.createElement('canvas');
        c.width = c.height = N;
        const q = c.getContext('2d'), im = q.createImageData(N, N), sd = 900 + v * 17;
        const val = new Float32Array(N * N);
        // strokes: bands of 6–22 rows, each cut along x into strokes of their own load
        for (let y0 = 0, b = 0; y0 < N; b++) {
            const h = 6 + Math.floor(S.hashI(b, 1, v, sd) * 16);
            let x = Math.floor(S.hashI(b, 2, v, sd) * N), k = 0;
            const end = x + N;
            while (x < end) {
                const L = 50 + Math.floor(S.hashI(b, 10 + k, v, sd) * 220), lv = (S.hashI(b, 40 + k, v, sd) - 0.5) * 2;
                for (let yy = 0; yy < h; yy++) {
                    const y = (y0 + yy) % N, edge = Math.min(yy + 1, h - yy) / 2.5; // softer at its sides
                    for (let u = 0; u < L; u++) {
                        const X = (x + u) % N, f = Math.min(1, u / 8, (L - u) / 30, edge);
                        val[y * N + X] += lv * 0.55 * f;
                    }
                }
                x += L - Math.floor(S.hashI(b, 70 + k, v, sd) * 12);
                k++;
            }
            y0 += h - 1;
        }
        // bristles: every row its own ridge, that comes and goes along the stroke
        for (let y = 0; y < N; y++) {
            const rv = (S.hashI(y, 3, v, sd) - 0.5) * 2, ph = S.hashI(y, 4, v, sd) * 50;
            for (let x = 0; x < N; x++) {
                const along = S.noise2((x / N) * 6 + ph, y * 0.37, sd); // wraps nearly
                val[y * N + x] += rv * 0.35 * (0.6 + 0.4 * along) + (S.hashI(x >> 2, y, 5, sd) - 0.5) * 0.12;
            }
        }
        for (let i = 0; i < N * N; i++) {
            const g8 = Math.max(0, Math.min(255, 128 + val[i] * 110));
            im.data[i * 4] = im.data[i * 4 + 1] = im.data[i * 4 + 2] = g8;
            im.data[i * 4 + 3] = 255;
        }
        q.putImageData(im, 0, 0);
        tiles.set(v, c);
        return c;
    }
    // Brush the paint inside a polygon: the bristle tile laid along `dir`, `size` units per
    // tile pixel along the stroke and half that across, with an overlay blend.
    function bristle(g, pts, o = {}) {
        const v = o.v ?? 0, dir = o.dir ?? -0.6, size = o.size ?? 0.8, b = S.bbox(pts, 4), c = centroid(pts);
        const pat = g.createPattern(streakTile(v), 'repeat');
        pat.setTransform(new DOMMatrix().translate(c[0] + (o.dx ?? 0), c[1] + (o.dy ?? 0)).rotate((dir * 180) / Math.PI).scale(size, size * (o.across ?? 0.45)));
        g.save();
        clip(g, pts);
        g.globalCompositeOperation = o.mode ?? 'overlay';
        g.globalAlpha = o.alpha ?? 0.35;
        g.fillStyle = pat;
        g.fillRect(b.x, b.y, b.w, b.h);
        g.restore();
    }
    // Slow drifts of the mix inside a plane: soft blots a little warmer, cooler, lighter, darker.
    function drift(g, pts, o = {}) {
        const r = Motion.rng('dr/' + (o.seed ?? 1)), b = S.bbox(pts), n = Math.min(40, 3 + Math.ceil(Math.abs(area(pts)) / 9000));
        g.save();
        clip(g, pts);
        for (let i = 0; i < n; i++) {
            const x = b.x + r() * b.w, y = b.y + r() * b.h, rad = 30 + r() * 120;
            const cc = pick(['255,236,190', '40,26,22', '120,128,140', '160,96,40'], r), a = (o.amt ?? 1) * (0.06 + r() * 0.1);
            const gr = g.createRadialGradient(x, y, 0, x, y, rad);
            gr.addColorStop(0, `rgba(${cc},${a.toFixed(3)})`);
            gr.addColorStop(1, `rgba(${cc},0)`);
            g.fillStyle = gr;
            g.fillRect(x - rad, y - rad, rad * 2, rad * 2);
        }
        g.restore();
    }

    // Scumble a polygon the way the constructive stroke builds a plane: patches of three to
    // seven parallel strokes laid side by side, each patch at its own slant round the plane's
    // `dir`, over a first coat of broad drags. Tones close together, drifting warmer and
    // cooler across the plane. Clipped to the polygon.
    //   colors [hex, …], vary: tone jitter, len/w: stroke size, density: 1 covers it about
    //   once, alpha, ridges: false for no bristle ridges, under: false for no first coat
    function scumble(g, pts, o = {}) {
        const r = Motion.rng('sc/' + (o.seed ?? 1)), sd = S.seedOf(o.seed ?? 1);
        const b = S.bbox(pts), A = Math.abs(area(pts));
        const len = o.len ?? 22, w = o.w ?? 8, dir = o.dir ?? -0.6, spread = o.spread ?? 0.35, wander = o.wander ?? 0.35;
        const cols = o.colors ?? ['#888'], vary = o.vary ?? 0.07, al = o.alpha ?? 0.8;
        g.save();
        clip(g, pts);
        if (o.under !== false) {
            // the first coat: long broad drags, thin
            const n0 = Math.min(3000, Math.ceil((A / (len * 4 * w * 2.5)) * 1.6));
            for (let i = 0; i < n0; i++) {
                const x = b.x + r() * b.w, y = b.y + r() * b.h;
                mark(g, x, y, dir + (r() - 0.5) * 0.5, len * (2.5 + r() * 3), w * (2 + r() * 2), tone(pick(cols, r), (r() - 0.5) * vary * 1.6), 0.28 + r() * 0.25);
            }
        }
        const per = 5, n = Math.min(o.max ?? 9000, Math.ceil((A / (len * w * per * 0.95)) * (o.density ?? 1)));
        for (let i = 0; i < n; i++) {
            const x = b.x + r() * b.w, y = b.y + r() * b.h;
            if (!inPoly(pts, x, y) && r() < 0.8) continue;
            const a = dir + (r() - 0.5) * spread + wander * S.noise2(x * 0.004, y * 0.004, sd), c = Math.cos(a), s = Math.sin(a);
            // the mix drifts slowly across the plane, and each patch is one load of the brush
            const drift = (o.drift ?? 0.09) * S.noise2(x * 0.005, y * 0.005, sd + 3), base = tone(pick(cols, r), drift + (r() - 0.5) * vary);
            const k = 3 + Math.floor(r() * 5), L0 = len * (0.6 + r() * 0.8), W = w * (0.7 + r() * 0.5), ridge = o.ridges === false ? 0 : [tone(base, -0.14), tone(base, 0.12)];
            for (let j = 0; j < k; j++) {
                const off = (j - (k - 1) / 2) * W * 0.85, along = (r() - 0.5) * L0 * 0.35;
                mark(g, x - s * off + c * along, y + c * off + s * along, a + (r() - 0.5) * 0.08, L0 * (0.7 + r() * 0.5), W * (0.85 + r() * 0.3), tone(base, (r() - 0.5) * vary * 0.5), al * (0.6 + r() * 0.4), ridge);
            }
        }
        g.restore();
    }

    // The inward normal of edge i of a polygon (towards its centroid).
    function edgeFrame(pts, i) {
        const a = pts[i], b = pts[(i + 1) % pts.length], L = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
        const t = [(b[0] - a[0]) / L, (b[1] - a[1]) / L];
        let n = [-t[1], t[0]];
        const c = centroid(pts), m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
        if ((c[0] - m[0]) * n[0] + (c[1] - m[1]) * n[1] < 0) n = [-n[0], -n[1]];
        return { a, b, t, n, L, m };
    }
    // An edge of a plane in shade (or in light): a soft band in from the edge, and short
    // hatched strokes, dense at the edge and thinning inwards: the plane tilts away there.
    function edgeTone(g, pts, i, o = {}) {
        const { a, t, n, L } = edgeFrame(pts, i);
        const W = o.w ?? 60, col = o.color ?? PAL.umberD, al = o.alpha ?? 0.5;
        g.save();
        clip(g, pts);
        const gr = g.createLinearGradient(a[0], a[1], a[0] + n[0] * W, a[1] + n[1] * W);
        gr.addColorStop(0, S.rgba(col, al * 0.8));
        gr.addColorStop(0.35, S.rgba(col, al * 0.38));
        gr.addColorStop(1, S.rgba(col, 0));
        g.fillStyle = gr;
        g.fillRect(-1e5, -1e5, 2e5, 2e5);
        // brushed: the band's own strokes along the edge, and a few loaded ones at the edge
        const along = Math.atan2(t[1], t[0]), dir = o.dir ?? along + (o.slant ?? 0.12);
        const band = (d0, d1) => [[a[0] - t[0] * 20 + n[0] * d0, a[1] - t[1] * 20 + n[1] * d0], [a[0] + t[0] * (L + 20) + n[0] * d0, a[1] + t[1] * (L + 20) + n[1] * d0], [a[0] + t[0] * (L + 20) + n[0] * d1, a[1] + t[1] * (L + 20) + n[1] * d1], [a[0] - t[0] * 20 + n[0] * d1, a[1] - t[1] * 20 + n[1] * d1]];
        bristle(g, band(-2, W * 0.7), { dir, v: 3, alpha: 0.5, size: 0.7, dx: L * 0.3 });
        scumble(g, band(-3, W * 0.35), { colors: [col, tone(col, 0.08)], dir, len: o.len ?? 34, w: o.sw ?? 6, density: 0.22, alpha: al * 0.55, seed: (o.seed ?? 1) + 'e/' + i, under: false, vary: 0.06, spread: 0.1, wander: 0.05 });
        g.restore();
    }

    // ------------------------------------------------------------------ charcoal
    // A charcoal line along a polyline: runs of the stick that skip on the tooth, a darker
    // core, specks beside it. Width in units.
    function charcoal(g, pts, o = {}) {
        if (pts.length < 2) return;
        const r = Motion.rng('ch/' + (o.seed ?? 1)), w = o.w ?? 3, al = o.alpha ?? 0.9, col = o.color ?? PAL.char;
        const P = walk(pts, 1.5);
        g.save();
        g.lineCap = 'butt';
        g.lineJoin = 'round';
        g.strokeStyle = col;
        for (let pass = 0; pass < 2; pass++) {
            const pw = pass ? w * 0.42 : w, pa = pass ? al * 0.85 : al * 0.8;
            let i = 0;
            while (i < P.length - 1) {
                const run = 2 + Math.floor(r() * 7);
                const j = Math.min(P.length - 1, i + run);
                if (r() > (o.gaps ?? 0.07) * (pass ? 0.5 : 1)) {
                    g.globalAlpha = pa * (0.45 + 0.55 * r());
                    g.lineWidth = pw * (0.6 + 0.6 * r());
                    const jx = (r() - 0.5) * w * 0.2, jy = (r() - 0.5) * w * 0.2;
                    g.beginPath();
                    g.moveTo(P[i][0] + jx, P[i][1] + jy);
                    for (let k = i + 1; k <= j; k++) g.lineTo(P[k][0] + jx, P[k][1] + jy);
                    g.stroke();
                }
                i = j;
            }
        }
        // specks of charcoal dust beside the line
        g.fillStyle = col;
        const sp = o.specks ?? 0.35;
        for (let k = 0; k < P.length; k++) {
            if (r() > sp) continue;
            const p = P[k], q = P[Math.min(P.length - 1, k + 1)], tx = q[0] - p[0], ty = q[1] - p[1], tl = Math.hypot(tx, ty) || 1;
            const d = (r() - 0.5) * w * 2.6, s = 0.25 + r() * 0.6;
            g.globalAlpha = al * (0.2 + r() * 0.5);
            g.fillRect(p[0] - (ty / tl) * d - s / 2, p[1] + (tx / tl) * d - s / 2, s, s);
        }
        g.restore();
    }
    // A ruled charcoal line from a to b that overruns both ends.
    function ruled(g, a, b, o = {}) {
        const r = Motion.rng('ru/' + (o.seed ?? 1)), L = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1, t = [(b[0] - a[0]) / L, (b[1] - a[1]) / L];
        const [o0, o1] = o.over ?? [6 + r() * 30, 6 + r() * 30];
        charcoal(g, [[a[0] - t[0] * o0, a[1] - t[1] * o0], [b[0] + t[0] * o1, b[1] + t[1] * o1]], o);
    }

    // ------------------------------------------------------------------ textures
    // Combed graining over whatever is in the polygon. dir: the grain's angle; pitch: units
    // between teeth; teeth: lines per pass; knots: how many heart-grain eyes.
    function comb(g, pts, o = {}) {
        const r = Motion.rng('cb/' + (o.seed ?? 1)), sd = S.seedOf(o.seed ?? 1);
        const dir = o.dir ?? 0, c = Math.cos(dir), s = Math.sin(dir), col = o.color ?? PAL.umber, al = o.alpha ?? 0.55;
        const pitch = o.pitch ?? 3.2, teeth = o.teeth ?? 9;
        // the polygon in grain space (u along, v across)
        const U = pts.map(([x, y]) => [x * c + y * s, -x * s + y * c]);
        const bu = S.bbox(U, 10);
        g.save();
        clip(g, pts);
        // the glaze, dragged in broad strokes along the grain
        if (o.glaze !== false) {
            for (let k = 0; k < Math.ceil((bu.w * bu.h) / 2400); k++) {
                const u = bu.x + r() * bu.w, v = bu.y + r() * bu.h, x = u * c - v * s, y = u * s + v * c;
                mark(g, x, y, dir + (r() - 0.5) * 0.06, 60 + r() * 140, 6 + r() * 12, tone(col, (r() - 0.3) * 0.3), 0.1 + r() * 0.12);
            }
        }
        const knots = [];
        for (let k = 0; k < (o.knots ?? 1); k++) knots.push({ u: bu.x + bu.w * (0.2 + r() * 0.6), v: bu.y + bu.h * (0.2 + r() * 0.6), a: 10 + r() * 16, L: 40 + r() * 70, B: 8 + r() * 10 });
        const passW = pitch * teeth;
        g.lineCap = 'butt';
        for (let p = 0, v0 = bu.y; v0 < bu.y + bu.h; p++, v0 += passW + (r() - 0.3) * pitch * 1.5) {
            const ph = r() * 100, amp = (o.wave ?? 2.2) * (0.5 + r()), slant = (r() - 0.5) * (o.slant ?? 0.02);
            const tw = Array.from({ length: teeth }, () => 0.45 + r() * 0.9); // the comb's teeth are not all alike
            for (let k = 0; k < teeth; k++) {
                const v = v0 + k * pitch;
                g.strokeStyle = S.rgba(tone(col, (r() - 0.5) * 0.25), 1);
                g.lineWidth = tw[k] * (o.lw ?? 1);
                let pen = false, last = 0;
                g.beginPath();
                for (let u = bu.x; u <= bu.x + bu.w; u += 5) {
                    let vv = v + amp * Math.sin(u * 0.012 + ph) + amp * 0.6 * S.noise2(u * 0.02, p * 3.1, sd) + slant * (u - bu.x);
                    for (const kn of knots) {
                        const du = (u - kn.u) / kn.L, dv = vv - kn.v, f = Math.exp(-du * du);
                        vv += kn.a * f * Math.sign(dv || 1) * Math.exp(-(dv * dv) / (kn.B * kn.B * 6));
                    }
                    const skip = S.noise2(u * 0.03, v * 0.21, sd + 9) < -0.45;
                    const x = u * c - vv * s, y = u * s + vv * c;
                    if (skip) pen = false;
                    else if (!pen) {
                        g.moveTo(x, y);
                        pen = true;
                    } else g.lineTo(x, y);
                    last = u;
                }
                g.globalAlpha = al * (0.55 + r() * 0.45);
                g.stroke();
            }
        }
        // the eyes of the knots
        for (const kn of knots) {
            for (let i = 0; i < 5; i++) {
                const rx = kn.L * (0.08 + i * 0.05), ry = kn.B * (0.25 + i * 0.22), x = kn.u * c - kn.v * s, y = kn.u * s + kn.v * c;
                g.globalAlpha = al * (0.9 - i * 0.12);
                g.strokeStyle = tone(col, -0.2);
                g.lineWidth = 0.8 + r() * 0.8;
                g.beginPath();
                g.ellipse(x, y, rx, ry, dir, 0, TAU);
                g.stroke();
            }
            const x = kn.u * c - kn.v * s, y = kn.u * s + kn.v * c;
            g.globalAlpha = al;
            g.fillStyle = tone(col, -0.35);
            g.beginPath();
            g.ellipse(x, y, kn.L * 0.05, kn.B * 0.18, dir, 0, TAU);
            g.fill();
        }
        // rays wiped out with a rag: short pale ticks across the grain
        g.strokeStyle = o.rays ?? 'rgba(250,236,200,1)';
        for (let k = 0; k < Math.ceil((bu.w * bu.h) / 900); k++) {
            const u = bu.x + r() * bu.w, v = bu.y + r() * bu.h, l = 2 + r() * 6, x = u * c - v * s, y = u * s + v * c;
            g.globalAlpha = 0.12 + r() * 0.2;
            g.lineWidth = 0.6 + r() * 0.7;
            g.beginPath();
            g.moveTo(x, y);
            g.lineTo(x - s * l, y + c * l);
            g.stroke();
        }
        g.restore();
    }

    // Sand mixed into the paint: grains lit from the top left, clustered.
    function sand(g, pts, o = {}) {
        const r = Motion.rng('sa/' + (o.seed ?? 1)), sd = S.seedOf(o.seed ?? 1), b = S.bbox(pts), A = Math.abs(area(pts));
        const n = Math.min(40000, Math.ceil(A * (o.density ?? 0.03))), base = o.color ?? PAL.ochre, [dx, dy] = shadeDir(g);
        g.save();
        clip(g, pts);
        for (let i = 0; i < n; i++) {
            const x = b.x + r() * b.w, y = b.y + r() * b.h;
            if (S.noise2(x * 0.02, y * 0.02, sd) + r() * 0.9 < 0.15) continue;
            const s = 0.55 + r() * r() * 1.6;
            g.globalAlpha = 0.5 + r() * 0.3;
            g.fillStyle = tone(base, -0.55);
            g.fillRect(x + dx * s * 0.45 - s / 2, y + dy * s * 0.45 - s / 2, s, s);
            g.fillStyle = tone(base, (r() - 0.4) * 0.5);
            g.fillRect(x - s / 2, y - s / 2, s * 0.9, s * 0.9);
            g.globalAlpha = 0.5 + r() * 0.4;
            g.fillStyle = tone(base, 0.55);
            g.fillRect(x - dx * s * 0.3 - s * 0.2, y - dy * s * 0.3 - s * 0.2, s * 0.4, s * 0.4);
        }
        g.restore();
    }

    // Faux marble, the decorator's other trade: a grey ground clouded lighter and darker,
    // veins that wander and fork, a second set of fine white ones.
    function marble(g, pts, o = {}) {
        const r = Motion.rng('ma/' + (o.seed ?? 1)), b = S.bbox(pts), sd = S.seedOf(o.seed ?? 1);
        g.save();
        clip(g, pts);
        for (let i = 0; i < 10; i++) {
            const x = b.x + r() * b.w, y = b.y + r() * b.h, rad = 30 + r() * 90, gr = g.createRadialGradient(x, y, 0, x, y, rad), c = r() < 0.5 ? '250,246,236' : '40,36,40';
            gr.addColorStop(0, `rgba(${c},${(0.1 + r() * 0.12).toFixed(2)})`);
            gr.addColorStop(1, `rgba(${c},0)`);
            g.fillStyle = gr;
            g.fillRect(x - rad, y - rad, rad * 2, rad * 2);
        }
        const vein = (x, y, a, len, w, col, depth) => {
            const pts2 = [[x, y]];
            for (let k = 0; k < len / 6; k++) {
                a += S.noise2(x * 0.02, y * 0.02, sd + depth) * 0.5;
                x += Math.cos(a) * 6;
                y += Math.sin(a) * 6;
                pts2.push([x, y]);
                if (depth < 2 && r() < 0.04) vein(x, y, a + (r() - 0.5) * 1.6, len * 0.4, w * 0.6, col, depth + 1);
            }
            S.ink(g, pts2, { w, color: col, alpha: 0.55, taper: [0.8, 1] });
        };
        for (let i = 0; i < (o.n ?? 3); i++) vein(b.x + r() * b.w, b.y + r() * b.h, o.dir ?? r() * 6, 120 + r() * 200, 1.6 + r() * 1.4, o.vein ?? '#2c2a30', 0);
        for (let i = 0; i < (o.n ?? 3); i++) vein(b.x + r() * b.w, b.y + r() * b.h, o.dir ?? r() * 6, 80 + r() * 160, 0.8, '#f4efe2', 1);
        g.restore();
    }

    // Confetti dots, as a painter of the later, synthetic manner stippled a plane.
    function dots(g, pts, o = {}) {
        const r = Motion.rng('do/' + (o.seed ?? 1)), b = S.bbox(pts), p = o.pitch ?? 11, col = o.color ?? PAL.bone;
        g.save();
        clip(g, pts);
        for (let y = b.y, row = 0; y < b.y + b.h + p; y += p * 0.87, row++) {
            for (let x = b.x + (row % 2) * p * 0.5; x < b.x + b.w + p; x += p) {
                if (r() < 0.07) continue;
                const rr = (o.r ?? 2.4) * (0.75 + r() * 0.5);
                g.globalAlpha = 0.65 + r() * 0.3;
                g.fillStyle = tone(col, (r() - 0.5) * 0.25);
                g.beginPath();
                g.ellipse(x + (r() - 0.5) * 1.6, y + (r() - 0.5) * 1.6, rr, rr * (0.8 + r() * 0.3), r() * 3, 0, TAU);
                g.fill();
            }
        }
        g.restore();
    }

    // ------------------------------------------------------------------ the plane
    // A facet: ground, scumble, a shaded edge and a lit one, texture, pentimento, and its
    // charcoal contour overrunning the corners.
    //   color, under (the ground's colour), dir (stroke angle), len, w, density
    //   shade: edge index (or null), shadeW, shadeC; light: edge index (or null)
    //   tex: 'comb' | 'sand' | 'dots' | null, texO: options for it
    //   lines: 'all' | [edge indices] | null; lw; over: [min, max] overrun
    //   pent: a ghost of an earlier contour; cast: its shadow on what is under it
    function plane(g, pts, o = {}) {
        const seed = o.seed ?? 1, r = Motion.rng('pl/' + seed), col = o.color ?? PAL.ochre;
        if (o.cast !== false) {
            const [dx, dy] = shadeDir(g), k = o.castD ?? 7;
            S.cast(g, (q) => fill(q, pts, '#000'), { blur: o.castBlur ?? 9, dx: dx * k, dy: dy * k, color: o.castC ?? 'rgba(22,14,10,0.42)' });
        }
        const dir = o.dir ?? -0.6;
        g.save();
        clip(g, pts);
        fill(g, pts, o.under ?? tone(col, -0.22));
        // pentimento: an earlier contour, painted out, under the last coat
        if (o.pent) {
            const P = S.xf(pts, { x: o.pent[0] ?? 14, y: o.pent[1] ?? -9, rot: o.pent[2] ?? 0.03 });
            for (let i = 0; i < P.length; i++) if (r() < 0.6) ruled(g, P[i], P[(i + 1) % P.length], { w: 2.2, alpha: 0.5, seed: seed + 'pe' + i });
        }
        g.restore();
        // the coat: broad drags of the local colour over the ground, which shows where the
        // brush ran dry; the mix drifting; the bristles' ridges along the strokes
        scumble(g, pts, { colors: o.colors ?? [col, col, tone(col, 0.05), tone(col, -0.05)], dir, len: (o.len ?? 26) * 2.2, w: (o.w ?? 7) * 2.6, density: o.density ?? 1.6, seed, vary: o.vary ?? 0.06, alpha: o.alpha ?? 0.9, spread: o.spread ?? 0.25, under: false, ridges: false });
        drift(g, pts, { seed, amt: o.driftA ?? 1 });
        bristle(g, pts, { dir, v: S.hashI(1, 2, 3, S.seedOf(seed)) < 0.5 ? 0 : 1, alpha: o.bristle ?? 0.42, size: o.bsize ?? 0.75 });
        bristle(g, pts, { dir: dir + 0.5, v: 2, alpha: (o.bristle ?? 0.42) * 0.35, size: 1.4, dx: 37, dy: 11 });
        // a few loaded strokes on top, in patches, and some of a neighbour's colour dragged in
        scumble(g, pts, { colors: [tone(col, 0.07), tone(col, -0.07), ...(o.drag ? [o.drag] : [])], dir, len: o.len ?? 26, w: o.w ?? 7, density: o.top ?? 0.22, seed: seed + 't', vary: 0.07, alpha: 0.75, spread: 0.3, under: false });
        if (o.tex === 'comb') comb(g, pts, { seed, ...(o.texO ?? {}) });
        else if (o.tex === 'sand') sand(g, pts, { seed, color: col, ...(o.texO ?? {}) });
        else if (o.tex === 'dots') dots(g, pts, { seed, ...(o.texO ?? {}) });
        else if (o.tex === 'marble') marble(g, pts, { seed, ...(o.texO ?? {}) });
        else if (typeof o.tex === 'function') {
            g.save();
            clip(g, pts);
            o.tex(g);
            g.restore();
        }
        if (o.pent) {
            // the old paint's ridge still catches the light, and a ghost of its line
            g.save();
            clip(g, pts);
            const P = S.xf(pts, { x: o.pent[0] ?? 14, y: o.pent[1] ?? -9, rot: o.pent[2] ?? 0.03 }), [lx, ly] = lightDir(g);
            for (let i = 0; i < P.length; i++) {
                if (r() < 0.45) continue;
                const a = P[i], b = P[(i + 1) % P.length];
                charcoal(g, [a, b], { w: 1.6, alpha: 0.16, seed: seed + 'pg' + i, gaps: 0.25 });
                charcoal(g, [[a[0] + lx * 2, a[1] + ly * 2], [b[0] + lx * 2, b[1] + ly * 2]], { w: 1.2, alpha: 0.18, color: '#f6ead0', seed: seed + 'pr' + i, specks: 0 });
            }
            g.restore();
        }
        // the tilt: one edge in shade, the opposite one in light
        const nE = pts.length;
        let sh = o.shade;
        if (sh === undefined) {
            // by default the edge that faces away from the light
            const sdv = S.SHADE_DIR;
            let best = -2;
            for (let i = 0; i < nE; i++) {
                const { n } = edgeFrame(pts, i), f = -(n[0] * sdv[0] + n[1] * sdv[1]) + (r() - 0.5) * 0.9;
                if (f > best) {
                    best = f;
                    sh = i;
                }
            }
        }
        if (sh !== null && sh !== undefined) edgeTone(g, pts, sh, { w: o.shadeW ?? 70, color: o.shadeC ?? PAL.umberD, alpha: o.shadeA ?? 0.55, seed });
        let li = o.light;
        if (li === undefined && sh !== null && sh !== undefined) {
            // the edge most opposite the shaded one
            const n0 = edgeFrame(pts, sh).n;
            let best = 2;
            for (let i = 0; i < nE; i++) {
                const { n } = edgeFrame(pts, i), d = n[0] * n0[0] + n[1] * n0[1];
                if (d < best) {
                    best = d;
                    li = i;
                }
            }
        }
        if (li !== null && li !== undefined) edgeTone(g, pts, li, { w: o.lightW ?? 34, color: o.lightC ?? tone(col, 0.55), alpha: o.lightA ?? 0.4, seed: seed + 'l', pitch: 30 });
        // its contour: charcoal, ruled, overrunning the corners; not every edge
        const lines = o.lines === undefined ? 'some' : o.lines;
        if (lines && nE > 12 && !Array.isArray(lines)) {
            // a curved plane: one charcoal contour round it, broken here and there
            charcoal(g, [...pts, pts[0], pts[1]], { w: (o.lw ?? 3.4) * 0.85, alpha: o.la ?? 0.9, seed: seed + 'cc', gaps: 0.12 });
            return;
        }
        for (let i = 0; i < nE; i++) {
            const draw = lines === 'all' || (Array.isArray(lines) && lines.includes(i)) || (lines === 'some' && r() < 0.6);
            if (!draw || !lines) continue;
            const ov = o.over ?? [4, 36];
            ruled(g, pts[i], pts[(i + 1) % nE], { w: o.lw ?? 3.4, alpha: o.la ?? 0.9, seed: seed + 'e' + i, over: [ov[0] + r() * (ov[1] - ov[0]), ov[0] + r() * (ov[1] - ov[0])] });
        }
    }

    // ------------------------------------------------------------------ pasted paper
    // A torn edge: the straight edge from a to b broken into fibre, `amp` units deep.
    function tornEdge(a, b, amp, seed) {
        const sd = S.seedOf(seed), L = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(2, Math.ceil(L / 2.2));
        const t = [(b[0] - a[0]) / L, (b[1] - a[1]) / L], nn = [-t[1], t[0]], out = [];
        for (let i = 0; i < n; i++) {
            const u = i / n, e = Math.sin(Math.PI * u); // pinned at the corners
            const d = amp * e * (S.noise2(u * L * 0.035, 1.3, sd) * 0.7 + S.noise2(u * L * 0.16, 2.7, sd) * 0.3 + (S.hashI(i, 3, 1, sd) - 0.5) * 0.25);
            out.push([a[0] + t[0] * u * L + nn[0] * d, a[1] + t[1] * u * L + nn[1] * d]);
        }
        return out;
    }
    // The outline of a sheet whose edges are cut (with the scissors' small steps) or torn.
    //   corners: [[x, y], …] clockwise; torn: indices of torn edges
    function sheetOutline(corners, torn = [], seed = 1, amp = 6) {
        const out = [], tornRuns = [];
        for (let i = 0; i < corners.length; i++) {
            const a = corners[i], b = corners[(i + 1) % corners.length];
            if (torn.includes(i)) {
                const e = tornEdge(a, b, amp, seed + '/' + i);
                tornRuns.push([out.length, out.length + e.length]);
                out.push(...e);
            } else {
                // the scissors stop and start again: a step of a fraction of a unit now and then
                const L = Math.hypot(b[0] - a[0], b[1] - a[1]), r = Motion.rng('cut/' + seed + '/' + i), t = [(b[0] - a[0]) / L, (b[1] - a[1]) / L];
                let u = 0, off = 0;
                out.push(a);
                while ((u += 40 + r() * 70) < L - 10) {
                    out.push([a[0] + t[0] * u - t[1] * off, a[1] + t[1] * u + t[0] * off]);
                    off += (r() - 0.5) * 0.9;
                    out.push([a[0] + t[0] * u - t[1] * off, a[1] + t[1] * u + t[0] * off]);
                }
            }
        }
        return { pts: out, tornRuns };
    }
    // Paper pasted on the picture. Draws in the caller's (possibly turned) units.
    //   corners, torn, stock (colour), print(g) (clipped to the sheet), seed
    //   pins: [[x, y]], paste: number of paste blotches, fox: foxing amount, back: show-through(g)
    //   lift: index of a corner that lifts
    function paper(g, o) {
        const seed = o.seed ?? 'paper', r = Motion.rng('pa/' + seed), stock = o.stock ?? PAL.news;
        const { pts, tornRuns } = sheetOutline(o.corners, o.torn ?? [], seed, o.amp ?? 6);
        const [dx, dy] = shadeDir(g), [lx, ly] = [-dx, -dy];
        // its thickness: a hair of shadow, and a wider one under a lifted corner
        S.cast(g, (q) => fill(q, pts, '#000'), { blur: 2.5, dx: dx * 2.2, dy: dy * 2.2, color: 'rgba(24,14,8,0.55)' });
        if (o.lift !== undefined) {
            const c = o.corners[o.lift];
            S.cast(g, (q) => {
                q.fillStyle = '#000';
                q.beginPath();
                q.arc(c[0], c[1], 40, 0, TAU);
                q.fill();
            }, { blur: 14, dx: dx * 9, dy: dy * 9, color: 'rgba(24,14,8,0.35)' });
        }
        g.save();
        clip(g, pts);
        const b = S.bbox(pts, 4);
        fill(g, pts, stock);
        // the stock's own unevenness, and its fibres
        for (let i = 0; i < Math.ceil((b.w * b.h) / 1800); i++) {
            const x = b.x + r() * b.w, y = b.y + r() * b.h, rad = 12 + r() * 50, warm = r() < 0.6;
            const gr = g.createRadialGradient(x, y, 0, x, y, rad);
            gr.addColorStop(0, warm ? 'rgba(150,110,52,0.09)' : 'rgba(255,250,232,0.14)');
            gr.addColorStop(1, 'rgba(150,110,52,0)');
            g.fillStyle = gr;
            g.fillRect(x - rad, y - rad, rad * 2, rad * 2);
        }
        g.lineWidth = 0.35;
        for (let i = 0; i < Math.ceil((b.w * b.h) / 90); i++) {
            const x = b.x + r() * b.w, y = b.y + r() * b.h, a = r() * TAU, l = 1.5 + r() * 4;
            g.strokeStyle = r() < 0.5 ? 'rgba(255,250,236,0.35)' : 'rgba(110,80,40,0.18)';
            g.beginPath();
            g.moveTo(x, y);
            g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l);
            g.stroke();
        }
        // the back's print, mirrored and faint
        if (o.back) {
            g.save();
            g.globalAlpha = 0.08;
            o.back(g);
            g.restore();
        }
        if (o.print) {
            g.save();
            o.print(g);
            g.restore();
        }
        // the paste: blotches with a tide mark, and the cockle over them
        for (let i = 0; i < (o.paste ?? 2); i++) {
            const c = [b.x + b.w * (0.15 + r() * 0.7), b.y + b.h * (0.15 + r() * 0.7)], R = 18 + r() * 40, sp = [];
            for (let k = 0; k < 24; k++) {
                const a = (k / 24) * TAU, rr = R * (0.7 + 0.45 * S.noise2(Math.cos(a) * 1.4, Math.sin(a) * 1.4, S.seedOf(seed) + i));
                sp.push([c[0] + Math.cos(a) * rr * 1.3, c[1] + Math.sin(a) * rr]);
            }
            const blob = S.curve(sp, true, 4);
            fill(g, blob, 'rgba(120,84,36,0.1)');
            g.strokeStyle = 'rgba(112,74,30,0.22)';
            g.lineWidth = 0.9;
            g.beginPath();
            S.trace(g, blob);
            g.stroke();
            // the cockle: soft ridges, a light side and a dark side
            for (let k = 0; k < 3; k++) {
                const a = r() * TAU, l = R * (0.6 + r() * 0.8), x0 = c[0] + (r() - 0.5) * R, y0 = c[1] + (r() - 0.5) * R;
                const p0 = [x0 - Math.cos(a) * l, y0 - Math.sin(a) * l], p1 = [x0 + Math.cos(a) * l, y0 + Math.sin(a) * l], m = [x0 + Math.sin(a) * 4, y0 - Math.cos(a) * 4];
                for (const [off, colr] of [[0, 'rgba(255,248,226,0.16)'], [2.2, 'rgba(90,62,30,0.1)']]) {
                    g.strokeStyle = colr;
                    g.lineWidth = 3;
                    g.beginPath();
                    g.moveTo(p0[0] + dx * off, p0[1] + dy * off);
                    g.quadraticCurveTo(m[0] + dx * off, m[1] + dy * off, p1[0] + dx * off, p1[1] + dy * off);
                    g.stroke();
                }
            }
        }
        // foxing in clusters
        for (let i = 0; i < (o.fox ?? 40); i++) {
            const cx = b.x + r() * b.w, cy = b.y + r() * b.h, m = 1 + Math.floor(r() * 5);
            for (let k = 0; k < m; k++) {
                g.fillStyle = `rgba(${130 + Math.floor(r() * 30)},${76 + Math.floor(r() * 20)},${30},${(0.12 + r() * 0.3).toFixed(2)})`;
                g.beginPath();
                g.arc(cx + (r() - 0.5) * 9, cy + (r() - 0.5) * 9, 0.4 + r() * 1.4, 0, TAU);
                g.fill();
            }
        }
        // yellowed towards the edges, more on the shadow side
        S.spray(g, pts, { color: '#9a7234', alpha: 0.45, w: 14, push: 0 });
        S.spray(g, pts, { color: '#6d4c26', alpha: 0.3, w: 18, push: 8, dir: [dx, dy] });
        // the torn edges show the paper's white core and its whiskers
        for (const [i0, i1] of tornRuns) {
            const run = pts.slice(i0, i1);
            g.strokeStyle = 'rgba(248,242,226,0.95)';
            g.lineWidth = (o.core ?? 3.4) * 2;
            g.lineJoin = 'round';
            g.beginPath();
            S.trace(g, run, false);
            g.stroke();
            g.strokeStyle = 'rgba(200,184,150,0.6)';
            g.lineWidth = o.core ?? 3.4;
            g.beginPath();
            S.trace(g, run.map(([x, y]) => [x + lx * 0.8, y + ly * 0.8]), false);
            g.stroke();
        }
        g.restore();
        for (const [i0, i1] of tornRuns) {
            g.strokeStyle = 'rgba(250,246,234,0.75)';
            g.lineWidth = 0.35;
            g.beginPath();
            for (let k = i0; k < i1; k += 2) {
                if (r() < 0.4) continue;
                const p = pts[k], a = r() * TAU, l = 0.8 + r() * 2.6;
                g.moveTo(p[0], p[1]);
                g.lineTo(p[0] + Math.cos(a) * l, p[1] + Math.sin(a) * l);
            }
            g.stroke();
        }
        // the cut edges: a hair of light where they face it, of shade where they do not
        for (let i = 0; i < o.corners.length; i++) {
            if ((o.torn ?? []).includes(i)) continue;
            const { a, b: bb, n } = edgeFrame(o.corners, i), facing = -(n[0] * lx + n[1] * ly);
            g.strokeStyle = facing > 0 ? `rgba(255,250,236,${(0.5 * facing).toFixed(2)})` : `rgba(40,24,14,${(-0.5 * facing).toFixed(2)})`;
            g.lineWidth = 0.8;
            g.beginPath();
            g.moveTo(a[0] + n[0] * 0.6, a[1] + n[1] * 0.6);
            g.lineTo(bb[0] + n[0] * 0.6, bb[1] + n[1] * 0.6);
            g.stroke();
        }
        // pinholes, each with a rust halo and a lifted rim
        for (const [px, py] of o.pins ?? []) {
            const hg = g.createRadialGradient(px, py, 0, px, py, 6);
            hg.addColorStop(0, 'rgba(120,62,24,0.35)');
            hg.addColorStop(1, 'rgba(120,62,24,0)');
            g.fillStyle = hg;
            g.fillRect(px - 6, py - 6, 12, 12);
            g.fillStyle = '#1a1210';
            g.beginPath();
            g.arc(px, py, 1.1, 0, TAU);
            g.fill();
            g.strokeStyle = 'rgba(255,248,230,0.7)';
            g.lineWidth = 0.6;
            g.beginPath();
            g.arc(px, py, 1.7, Math.atan2(ly, lx) - 1.2, Math.atan2(ly, lx) + 1.2);
            g.stroke();
        }
        return pts;
    }

    // Lettering set flat on a sheet (the print carries no light), letterpress: the face
    // spaced, the ink a little uneven.
    function type(g, text, x, y, o = {}) {
        g.save();
        g.font = `${o.size ?? 10}px ${o.font ?? "'Lora', Georgia, serif"}`;
        g.textBaseline = 'alphabetic';
        g.fillStyle = o.color ?? PAL.print;
        g.globalAlpha = o.alpha ?? 0.92;
        const sp = o.spacing ?? 0, chars = [...text], ws = chars.map((ch) => g.measureText(ch).width + sp), W = ws.reduce((a, b) => a + b, 0) - sp;
        let cx = o.align === 'center' ? x - W / 2 : o.align === 'right' ? x - W : x;
        if (o.width && W > 0) {
            // justified: spread the spaces
            const spaces = chars.filter((c) => c === ' ').length;
            const extra = spaces ? (o.width - W) / spaces : 0;
            chars.forEach((ch, i) => {
                g.fillText(ch, cx, y);
                cx += ws[i] + (ch === ' ' ? extra : 0);
            });
        } else {
            chars.forEach((ch, i) => {
                g.fillText(ch, cx, y);
                cx += ws[i];
            });
        }
        g.restore();
        return W;
    }
    // Ink worn off the type: specks of the stock over a printed area.
    function wear(g, box, o = {}) {
        const r = Motion.rng('we/' + (o.seed ?? 1));
        g.save();
        g.fillStyle = o.stock ?? PAL.news;
        for (let i = 0; i < Math.ceil((box.w * box.h) / (o.every ?? 30)); i++) {
            g.globalAlpha = 0.3 + r() * 0.5;
            const s = 0.3 + r() * 0.9;
            g.fillRect(box.x + r() * box.w, box.y + r() * box.h, s, s);
        }
        g.restore();
    }

    // ------------------------------------------------------------------ facets
    // A polygon cut into facets the way the grid of analytic Cubism cuts a picture: lines
    // mostly upright, level or on the two diagonals, each through the middle of the largest
    // facet left. Geometry only. → [polygon, …]
    function facets(poly, o = {}) {
        const r = Motion.rng('fa/' + (o.seed ?? 1)), angles = o.angles ?? [0, Math.PI / 2, 0.62, -0.62, 1.15, -1.15];
        let cells = [poly];
        const n = o.n ?? 30;
        for (let it = 0; it < n * 3 && cells.length < n; it++) {
            cells.sort((a, b) => Math.abs(area(b)) - Math.abs(area(a)));
            const c = cells[0], m = centroid(c), bb = S.bbox(c);
            if (Math.abs(area(c)) < (o.min ?? 4000)) break;
            // across the long way, mostly
            let a = pick(angles, r) + (r() - 0.5) * 0.12;
            if (bb.w > bb.h * 1.6) a = Math.PI / 2 + (r() - 0.5) * 0.7;
            else if (bb.h > bb.w * 1.6) a = (r() - 0.5) * 0.7;
            const p = [m[0] + (r() - 0.5) * bb.w * 0.35, m[1] + (r() - 0.5) * bb.h * 0.35], nrm = [-Math.sin(a), Math.cos(a)];
            const [A, B] = split(c, p, nrm);
            if (A.length < 3 || B.length < 3 || Math.abs(area(A)) < 800 || Math.abs(area(B)) < 800) continue;
            cells = [A, B, ...cells.slice(1)];
        }
        return cells;
    }

    // ================================================================== the things
    const FELL = "'IM Fell DW Pica SC', Georgia, serif", ANTON = "'Anton', Impact, sans-serif", LORA = "'Lora', Georgia, serif";
    // Paint inside a local frame (translate, turn, scale) and come back.
    const local = (g, o, fn) => {
        g.save();
        g.translate(o.x ?? 0, o.y ?? 0);
        g.rotate(o.rot ?? 0);
        g.scale(o.s ?? 1, o.s ?? 1);
        fn(g);
        g.restore();
    };
    // words into justified lines of a column
    function wrap(g, text, width, font) {
        g.save();
        g.font = font;
        const words = text.split(' '), lines = [];
        let cur = '';
        for (const w of words) {
            const t = cur ? cur + ' ' + w : w;
            if (g.measureText(t).width > width && cur) {
                lines.push(cur);
                cur = w;
            } else cur = t;
        }
        if (cur) lines.push(cur);
        g.restore();
        return lines;
    }
    function column(g, text, x, y, width, o = {}) {
        const size = o.size ?? 6.2, lead = o.lead ?? size * 1.3, font = `${size}px ${LORA}`;
        const lines = wrap(g, text, width, font);
        lines.forEach((ln, i) => type(g, ln, x, y + i * lead, { size, font: LORA, width: i < lines.length - 1 ? width : 0, alpha: 0.86 }));
        return y + lines.length * lead;
    }

    // ------------------------------------------------------------------ the newspaper
    // The top left corner of a page, 430 × 560 at s = 1; the anchor is that corner.
    function newspaper(g, o = {}) {
        const seed = o.seed ?? 'news', W = 430, H = 560;
        local(g, o, (q) => {
            const r = Motion.rng('np/' + seed);
            paper(q, {
                corners: [[0, 0], [W, 0], [W - 12, H], [6, H - 20]], torn: [1, 2], seed, stock: PAL.news, amp: 9, pins: [[14, 16], [W - 30, 22]], paste: 3, fox: 60, lift: 0,
                back: (b) => {
                    b.save();
                    b.scale(-1, 1);
                    for (let k = 0; k < 40; k++) b.fillRect(-W + 20 + (k % 3) * 140, 150 + Math.floor(k / 3) * 30, 120, 2.4);
                    b.restore();
                },
                print: (p) => {
                    p.fillStyle = PAL.print;
                    type(p, 'LA BRISA', 205, 74, { font: FELL, size: 72, align: 'center', spacing: 3 });
                    type(p, 'DIARIO DE LA MAÑANA', 205, 94, { font: FELL, size: 10, align: 'center', spacing: 2.4 });
                    p.globalAlpha = 0.9;
                    p.fillRect(14, 102, 404, 3.4);
                    p.fillRect(14, 108, 404, 1);
                    type(p, 'MÁLAGA · MARTES 25 DE OCTUBRE', 16, 119, { font: FELL, size: 8.4, spacing: 0.6 });
                    type(p, 'AÑO VI · NÚM. 1.881', 416, 119, { font: FELL, size: 8.4, spacing: 0.6, align: 'right' });
                    p.fillRect(14, 124, 404, 1);
                    type(p, 'LUNA LLENA', 205, 166, { font: ANTON, size: 42, align: 'center', spacing: 1.5 });
                    type(p, 'SOBRE EL PUERTO', 205, 188, { font: ANTON, size: 17, align: 'center', spacing: 2.5 });
                    p.fillRect(150, 196, 110, 0.8);
                    // three columns of news, each item under a small heading; the first
                    // column stops for the advertisement
                    const cols = [
                        [['', 'Anoche, con el levante, salió la luna llena sobre el puerto y la bahía amaneció de plata. Los pescadores de la Malagueta volvieron tarde, con poca sardina y mucho frío. En el muelle se encendieron hogueras y las barcas quedaron varadas en la arena hasta el alba. Se espera buen tiempo para el jueves.'], ['EL PUERTO', 'Entró ayer el vapor «Ciudad de Cádiz» con frutos y pasajeros, y dos faluchos de Almería cargados de uva. Salió para Marsella el bergantín «Esperanza» con pasas y vino.']],
                        [['', 'En la plaza de la Merced se oyó una guitarra hasta el amanecer. Nadie supo decir quién tocaba; los vecinos dejaron abiertos los balcones y nadie se quejó. Al alba, la música se fue calle abajo, hacia el mar, y las palomas de la plaza echaron a volar todas a la vez.'], ['TEATRO', 'Esta noche la compañía de zarzuela estrena una obra nueva. Se ruega a las señoras que no lleven sombrero de ala ancha, porque el público de las últimas filas no ve el escenario.'], ['LA VENDIMIA', 'En los montes se ha acabado de coger la uva. Los arrieros bajan con las pasas y el mosto, y en las bodegas de la ciudad ya huele a vino nuevo. El moscatel de este año será muy dulce.']],
                        [['', 'Palomas. Un profesor de la escuela de Bellas Artes ha expuesto en el Liceo unos cuadros de palomas que el público celebra mucho. Dicen que las pinta del natural, en el palomar de su casa, y que su hijo, que aún es un niño, le ayuda a pintar las patas.'], ['SE VENDE', 'Guitarra de ciprés con clavijas de madera, en buen estado, con su funda. Razón: calle de Granada, número 14.'], ['SE ALQUILA', 'Piso con balcón a la plaza, muy soleado. Darán razón en la portería.']],
                    ];
                    cols.forEach((items, k) => {
                        let y = 212;
                        const x = 16 + k * 138;
                        for (const [head, text] of items) {
                            if (head) {
                                y += 6;
                                type(p, head, x + 63, y, { font: FELL, size: 8, align: 'center', spacing: 1 });
                                y += 9;
                            }
                            y = column(p, text, x, y, 126) + 2;
                            if (k === 0 && y > 400) break;
                        }
                    });
                    for (let k = 1; k < 3; k++) p.fillRect(14 + k * 138 - 6, 204, 0.7, 340);
                    // an advertisement in its box
                    p.strokeStyle = PAL.print;
                    p.lineWidth = 1.4;
                    p.strokeRect(22, 420, 112, 60);
                    p.lineWidth = 0.5;
                    p.strokeRect(25, 423, 106, 54);
                    type(p, 'CUERDAS', 78, 446, { font: ANTON, size: 16, align: 'center', spacing: 1.2 });
                    type(p, 'PARA GUITARRA', 78, 459, { font: FELL, size: 8, align: 'center', spacing: 0.8 });
                    type(p, 'CALLE NUEVA, 7', 78, 472, { font: LORA, size: 6.5, align: 'center' });
                    wear(p, { x: 0, y: 0, w: W, h: H }, { seed, stock: PAL.news, every: 28 });
                    // the fold across it: ink rubbed off along the crease, a light and a dark side
                    p.globalAlpha = 1;
                    p.strokeStyle = 'rgba(232,224,204,0.6)';
                    p.lineWidth = 3;
                    p.beginPath();
                    p.moveTo(0, 300);
                    p.lineTo(W, 296);
                    p.stroke();
                    p.strokeStyle = 'rgba(70,52,30,0.25)';
                    p.lineWidth = 1.2;
                    p.beginPath();
                    p.moveTo(0, 302.5);
                    p.lineTo(W, 298.5);
                    p.stroke();
                },
            });
        });
    }

    // ------------------------------------------------------------------ the wine label
    // 230 × 160 at s = 1 about its middle.
    function label(g, o = {}) {
        const seed = o.seed ?? 'label', W = 230, H = 160, c = 18;
        local(g, o, (q) => {
            paper(q, {
                corners: [[-W / 2 + c, -H / 2], [W / 2 - c, -H / 2], [W / 2, -H / 2 + c], [W / 2, H / 2 - c], [W / 2 - c, H / 2], [-W / 2 + c, H / 2], [-W / 2, H / 2 - c], [-W / 2, -H / 2 + c]], torn: o.torn ?? [3], seed, stock: PAL.cream, amp: 5, paste: 2, fox: 26,
                print: (p) => {
                    // laid paper: chain lines and the fine laid lines
                    p.strokeStyle = 'rgba(120,96,60,0.12)';
                    p.lineWidth = 0.6;
                    for (let x = -W / 2 + 9; x < W / 2; x += 21) {
                        p.beginPath();
                        p.moveTo(x, -H / 2);
                        p.lineTo(x + 0.6, H / 2);
                        p.stroke();
                    }
                    p.strokeStyle = 'rgba(255,250,236,0.18)';
                    p.lineWidth = 0.4;
                    for (let y = -H / 2; y < H / 2; y += 1.6) {
                        p.beginPath();
                        p.moveTo(-W / 2, y);
                        p.lineTo(W / 2, y);
                        p.stroke();
                    }
                    // the ochre forme, a hair out of register
                    p.save();
                    p.translate(1.3, 0.9);
                    const oct = (d) => [[-W / 2 + c + d * 0.4, -H / 2 + d], [W / 2 - c - d * 0.4, -H / 2 + d], [W / 2 - d, -H / 2 + c + d * 0.4], [W / 2 - d, H / 2 - c - d * 0.4], [W / 2 - c - d * 0.4, H / 2 - d], [-W / 2 + c + d * 0.4, H / 2 - d], [-W / 2 + d, H / 2 - c - d * 0.4], [-W / 2 + d, -H / 2 + c + d * 0.4]];
                    p.strokeStyle = S.rgba(PAL.ochreD, 0.9);
                    p.lineWidth = 3.2;
                    p.beginPath();
                    S.trace(p, oct(8));
                    p.stroke();
                    type(p, 'MÁLAGA', 0, 50, { font: ANTON, size: 22, align: 'center', spacing: 5, color: PAL.ochreD });
                    p.restore();
                    // the black forme
                    p.strokeStyle = S.rgba(PAL.print, 0.9);
                    p.lineWidth = 0.8;
                    p.beginPath();
                    S.trace(p, oct(4));
                    p.stroke();
                    p.beginPath();
                    S.trace(p, oct(12.5));
                    p.stroke();
                    for (const [x, y] of [[-W / 2 + 14, -H / 2 + 14], [W / 2 - 14, -H / 2 + 14], [W / 2 - 14, H / 2 - 14], [-W / 2 + 14, H / 2 - 14]]) fill(p, [[x, y - 4], [x + 3, y], [x, y + 4], [x - 3, y]], S.rgba(PAL.print, 0.9));
                    type(p, 'MOSCATEL', 0, -24, { font: FELL, size: 34, align: 'center', spacing: 2 });
                    type(p, 'VINO DULCE · AÑEJO', 0, -8, { font: FELL, size: 9, align: 'center', spacing: 1.5 });
                    p.fillStyle = S.rgba(PAL.print, 0.9);
                    p.fillRect(-60, -2, 120, 0.7);
                    // the engraved grapes: berries hatched on their shade side, a leaf, a tendril
                    const r = Motion.rng('gr/' + seed);
                    const berries = [];
                    for (let row = 0; row < 4; row++) for (let k = 0; k <= 3 - row; k++) berries.push([(k - (3 - row) / 2) * 9 + (r() - 0.5) * 2, 8 + row * 7.6]);
                    p.save();
                    p.translate(-74, 0);
                    for (const [bx, by] of berries) {
                        p.strokeStyle = S.rgba(PAL.print, 0.85);
                        p.lineWidth = 0.6;
                        p.beginPath();
                        p.arc(bx, by, 4.4, 0, TAU);
                        p.stroke();
                        for (let h = -2; h <= 4; h += 1.4) {
                            p.beginPath();
                            p.moveTo(bx + h - 1, by + 4);
                            p.lineTo(bx + h + 2.6, by - 0.5);
                            p.stroke();
                        }
                    }
                    S.ink(p, [[0, 6], [4, -2], [10, -5]], { w: 1, color: PAL.print });
                    p.restore();
                    p.save();
                    p.translate(74, 0);
                    S.ink(p, S.curve([[-14, 30], [-6, 12], [8, 8], [14, 22], [4, 34], [-8, 36]], true, 4), { w: 0.8, color: PAL.print, taper: [0, 0] });
                    S.ink(p, [[-6, 32], [2, 20], [6, 12]], { w: 0.6, color: PAL.print });
                    S.ink(p, S.curve([[10, 8], [16, 2], [12, -2], [16, -6]], false, 5), { w: 0.6, color: PAL.print });
                    p.restore();
                    type(p, 'DE LOS MONTES', 0, 68, { font: FELL, size: 7.5, align: 'center', spacing: 1.2 });
                    wear(p, { x: -W / 2, y: -H / 2, w: W, h: H }, { seed, stock: PAL.cream, every: 22 });
                },
            });
        });
    }

    // ------------------------------------------------------------------ the score
    // Treble clef as a pen draws it, in stave spaces (y = 0 the top line); lifted from
    // things/library.js, whose own drawer is not exported.
    const GCLEF = [[-0.75, 5.0], [-0.5, 5.6], [0.1, 5.75], [0.5, 5.2], [0.42, 4.2], [0.2, 2.6], [0, 0.8], [-0.1, -0.6], [0.15, -1.45], [0.55, -1.55], [0.78, -0.9], [0.6, 0], [0, 0.95], [-0.7, 1.9], [-1.1, 2.9], [-0.8, 3.8], [0, 4.2], [0.9, 3.9], [1.25, 3.1], [0.95, 2.35], [0.3, 2.1], [-0.3, 2.45], [-0.45, 3.05], [-0.1, 3.45], [0.3, 3.3]];
    // A torn leaf of manuscript music, 320 × 420 at s = 1, anchor at its top left corner.
    function score(g, o = {}) {
        const seed = o.seed ?? 'score', W = 320, H = 420, SP = 6.2; // SP: a stave space
        local(g, o, (q) => {
            paper(q, {
                corners: [[0, 0], [W, 4], [W - 4, H], [2, H - 8]], torn: [2], seed, stock: '#e2d6b4', amp: 10, pins: [[12, 12], [W - 14, 16]], paste: 2, fox: 50,
                print: (p) => {
                    const r = Motion.rng('sco/' + seed);
                    type(p, 'MALAGUEÑA', W / 2, 30, { font: FELL, size: 17, align: 'center', spacing: 3 });
                    type(p, 'para guitarra', W / 2, 42, { font: LORA, size: 7, align: 'center' });
                    type(p, '— 3 —', W - 30, 22, { font: LORA, size: 6.5, align: 'center' });
                    const inkc = '#2b2020';
                    for (let st = 0; st < 5; st++) {
                        const top = 62 + st * 74, x0 = 16, x1 = W - 14, ph = r() * 9;
                        // the rastrum's five pens waver together
                        const wav = (x) => 0.7 * Math.sin(x * 0.021 + ph) + 0.3 * Math.sin(x * 0.07 + ph * 2);
                        p.strokeStyle = S.rgba(inkc, 0.75);
                        p.lineWidth = 0.6;
                        for (let l = 0; l < 5; l++) {
                            p.beginPath();
                            for (let x = x0; x <= x1; x += 6) {
                                const y = top + l * SP + wav(x);
                                if (x === x0) p.moveTo(x, y);
                                else p.lineTo(x, y);
                            }
                            p.stroke();
                        }
                        const yAt = (pos, x) => top + 4 * SP - (pos * SP) / 2 + wav(x); // pos 0 = bottom line (E4)
                        // the clef, and the time on the first stave
                        S.ink(p, S.curve(GCLEF.map(([a, b]) => [x0 + 9 + a * SP, top + b * SP]), false, 6), { w: 1.3, color: inkc, taper: [0.4, 0.8] });
                        let x = x0 + 26;
                        if (st === 0) {
                            type(p, '3', x + 2, top + 2 * SP - 0.5, { font: ANTON, size: 12.5, color: inkc });
                            type(p, '4', x + 2, top + 4 * SP - 0.5, { font: ANTON, size: 12.5, color: inkc });
                            x += 16;
                        }
                        // the bars: the cadence as chords (dotted halves), or broken into quavers
                        const chords = [[3, 5, 7], [2, 4, 6], [1, 3, 5], [0, 2, 4]];
                        const bw = (x1 - x) / 4;
                        for (let b = 0; b < 4; b++) {
                            const bx = x + b * bw, ch = chords[(b + st) % 4];
                            if ((st + b) % 3 !== 1) {
                                // a chord: open heads, a stem, the dot
                                const hx = bx + bw * 0.42;
                                if (ch[0] === 0 && ch[1] === 2) type(p, '♯', hx - 12, yAt(2, hx) + 3, { font: LORA, size: 9, color: inkc });
                                for (const pos of ch) {
                                    p.save();
                                    p.translate(hx, yAt(pos, hx));
                                    p.rotate(-0.35);
                                    p.strokeStyle = inkc;
                                    p.lineWidth = 1.1;
                                    p.beginPath();
                                    p.ellipse(0, 0, 3.6, 2.4, 0, 0, TAU);
                                    p.stroke();
                                    p.restore();
                                    p.fillStyle = inkc;
                                    p.beginPath();
                                    p.arc(hx + 7, yAt(pos, hx) - (pos % 2 ? 0 : SP / 2), 0.9, 0, TAU);
                                    p.fill();
                                }
                                S.ink(p, [[hx + 3.4, yAt(ch[0], hx) - 1], [hx + 3.4, yAt(ch[2], hx) - 21]], { w: 0.9, color: inkc, taper: [0, 0.3] });
                            } else {
                                // the chord broken: six quavers, beamed in threes
                                const seq = [ch[0], ch[1], ch[2], ch[1] + 2, ch[2], ch[1]];
                                for (let k = 0; k < 6; k++) {
                                    const hx = bx + 6 + k * (bw - 12) / 6, hy = yAt(seq[k], hx);
                                    p.save();
                                    p.translate(hx, hy);
                                    p.rotate(-0.35);
                                    p.fillStyle = inkc;
                                    p.beginPath();
                                    p.ellipse(0, 0, 3.3, 2.2, 0, 0, TAU);
                                    p.fill();
                                    p.restore();
                                    S.ink(p, [[hx + 3, hy - 1], [hx + 3, yAt(9, hx) - 3]], { w: 0.8, color: inkc, taper: [0, 0] });
                                }
                                for (const k0 of [0, 3]) {
                                    const xa = bx + 6 + k0 * (bw - 12) / 6 + 3, xb = bx + 6 + (k0 + 2) * (bw - 12) / 6 + 3;
                                    S.ink(p, [[xa, yAt(9, xa) - 3], [xb, yAt(9, xb) - 3]], { w: 2.2, color: inkc, taper: [0, 0] });
                                }
                                // a slur over it, and the pencilled fingering
                                S.ink(p, S.curve([[bx + 4, yAt(11, bx)], [bx + bw / 2, yAt(13, bx + bw / 2)], [bx + bw - 6, yAt(11, bx + bw)]], false, 8), { w: 0.9, color: inkc });
                                for (let k = 0; k < 3; k++) type(p, String(1 + ((k + b) % 3)), bx + 4 + k * (bw - 12) / 3, yAt(-3, bx), { font: LORA, size: 5.5, color: 'rgba(90,86,92,0.75)' });
                            }
                            S.ink(p, [[bx + bw, top + wav(bx + bw)], [bx + bw, top + 4 * SP + wav(bx + bw)]], { w: 0.8, color: inkc, taper: [0, 0] });
                        }
                    }
                    // a ring left by a cup
                    p.strokeStyle = 'rgba(122,82,40,0.3)';
                    p.lineWidth = 2.4;
                    p.beginPath();
                    p.ellipse(220, 300, 46, 44, 0.3, 0.2, 5.6);
                    p.stroke();
                    p.fillStyle = 'rgba(140,98,50,0.06)';
                    p.beginPath();
                    p.ellipse(220, 300, 45, 43, 0.3, 0, TAU);
                    p.fill();
                    wear(p, { x: 0, y: 0, w: W, h: H }, { seed, stock: '#e2d6b4', every: 40 });
                },
            });
        });
    }

    // ------------------------------------------------------------------ the wallpaper
    // A strip of printed wallpaper pasted up: w wide, h long, anchor its top middle.
    function wallpaper(g, o = {}) {
        const seed = o.seed ?? 'wall', W = o.w ?? 180, H = o.h ?? 900;
        local(g, o, (q) => {
            paper(q, {
                corners: [[-W / 2, 0], [W / 2, 0], [W / 2, H], [-W / 2, H]], torn: o.torn ?? [2], seed, stock: '#c8b892', amp: 14, paste: 4, fox: 30, pins: o.pins ?? [],
                print: (p) => {
                    const r = Motion.rng('wp/' + seed), bw = 30, ink1 = '#6c6258', ink2 = '#a77a35';
                    for (let x = -W / 2, k = 0; x < W / 2; x += bw, k++) {
                        if (k % 2 === 0) {
                            // a plain band between two rules
                            p.fillStyle = 'rgba(108,98,88,0.18)';
                            p.fillRect(x + 3, 0, bw - 6, H);
                            p.fillStyle = S.rgba(ink1, 0.7);
                            p.fillRect(x + 2, 0, 1, H);
                            p.fillRect(x + bw - 3, 0, 1, H);
                        } else {
                            // the flower band: four petals and a heart in the second colour, out of register
                            for (let y = 14 + (k % 4 === 1 ? 0 : 19), j = 0; y < H; y += 38, j++) {
                                const cx = x + bw / 2;
                                p.fillStyle = S.rgba(ink1, 0.66 + r() * 0.2);
                                for (let pt = 0; pt < 4; pt++) {
                                    const a = pt * (Math.PI / 2);
                                    p.beginPath();
                                    p.ellipse(cx + Math.cos(a) * 3.6, y + Math.sin(a) * 3.6, 3.8, 3, a, 0, TAU);
                                    p.fill();
                                }
                                p.fillStyle = S.rgba(ink1, 0.6);
                                for (const sd2 of [-1, 1]) {
                                    p.beginPath();
                                    p.ellipse(cx + sd2 * 4.5, y + 12, 3.6, 1.5, sd2 * 0.6, 0, TAU);
                                    p.fill();
                                }
                                p.fillRect(cx - 0.4, y + 6, 0.8, 9);
                                p.fillStyle = S.rgba(ink2, 0.85);
                                p.beginPath();
                                p.arc(cx + 1.6, y + 1.1, 2.2, 0, TAU);
                                p.fill();
                            }
                        }
                    }
                    // the sun faded the top, and the paste-brush scuffed it
                    const gr = p.createLinearGradient(0, 0, 0, H * 0.6);
                    gr.addColorStop(0, 'rgba(236,226,200,0.35)');
                    gr.addColorStop(1, 'rgba(236,226,200,0)');
                    p.fillStyle = gr;
                    p.fillRect(-W / 2, 0, W, H);
                    wear(p, { x: -W / 2, y: 0, w: W, h: H }, { seed, stock: '#c8b892', every: 18 });
                },
            });
        });
    }

    // ------------------------------------------------------------------ bottle and glass
    // The bottle as planes, 180 × 660 at s = 1, the anchor in the middle of its base.
    function bottle(g, o = {}) {
        const seed = o.seed ?? 'bottle';
        local(g, o, (q) => {
            const r = Motion.rng('bo/' + seed);
            const half = [[0, 0], [86, -4], [90, -330], [72, -400], [34, -446], [26, -600], [32, -612], [32, -650], [0, -652]];
            const prof = S.curve(half, false, 6), left = prof.map(([x, y]) => [-x, y]);
            // left half seen from in front, black glass; right half seen from a little higher,
            // dropped, in grey
            const L = [...left, [0, -652], [0, 0]], Rt = [...prof.map(([x, y]) => [x, y + 30])].reverse().concat([[0, 30]]);
            plane(q, L, { color: PAL.black, under: '#0f0c0c', dir: -1.45, seed: seed + 'L', shade: null, light: null, lines: 'all', over: [6, 30] });
            plane(q, Rt.reverse(), { color: PAL.greyD, dir: -1.6, seed: seed + 'R', lines: 'all', shade: null, light: null });
            // the lights on the glass: narrow upright planes
            for (const [x0, x1, y0, y1, a] of [[-62, -48, -320, -20, 0.55], [-22, -16, -590, -460, 0.5], [-74, -70, -300, -40, 0.3], [40, 52, -300, -10, 0.25]]) {
                fill(q, [[x0, y0], [x1, y0 + 6], [x1, y1], [x0, y1 + 4]], S.rgba(PAL.bone, a));
                bristle(q, [[x0, y0], [x1, y0 + 6], [x1, y1], [x0, y1 + 4]], { dir: -1.57, alpha: 0.4 });
            }
            // the mouth and the base seen from above: full ellipses on a profile
            charcoal(q, S.ellipse(0, -650, 34, 11, 40).concat([S.ellipse(0, -650, 34, 11, 40)[0]]), { w: 2.6, seed: seed + 'm' });
            charcoal(q, S.ellipse(0, -650, 20, 6, 30).concat([S.ellipse(0, -650, 20, 6, 30)[0]]), { w: 1.6, seed: seed + 'm2' });
            charcoal(q, S.ellipse(4, 2, 92, 24, 50).concat([S.ellipse(4, 2, 92, 24, 50)[0]]), { w: 2.8, seed: seed + 'b' });
            // the lip's ring
            ruled(q, [-32, -612], [32, -608], { w: 2.4, seed: seed + 'lip', over: [8, 22] });
        });
    }
    // The glass as planes, 140 × 300, anchor at the middle of its foot.
    function glass(g, o = {}) {
        const seed = o.seed ?? 'glass';
        local(g, o, (q) => {
            const bowlR = S.curve([[0, -150], [62, -152], [64, -100], [50, -50], [18, -26], [5, -18]], false, 6);
            const bowlL = bowlR.map(([x, y]) => [-x, y]);
            // the left half of the bowl: a pale transparent plane, the wine in it
            const half = [...bowlL, [0, -18], [0, -150]];
            q.save();
            fill(q, half, 'rgba(236,228,206,0.22)');
            bristle(q, half, { dir: -1.4, alpha: 0.25 });
            fill(q, S.curve([[-58, -96], [0, -96], [0, -20], [-16, -26], [-46, -52]], true, 4), S.rgba('#8a5418', 0.75));
            bristle(q, S.curve([[-58, -96], [0, -96], [0, -20], [-16, -26], [-46, -52]], true, 4), { dir: 0, alpha: 0.4 });
            q.restore();
            // the right half only drawn; the rim seen from above, and again, not agreeing
            charcoal(q, bowlR, { w: 2.4, seed: seed + 'r' });
            charcoal(q, bowlL, { w: 2.4, seed: seed + 'l' });
            const rim = S.ellipse(0, -151, 63, 21, 48);
            charcoal(q, [...rim, rim[0]], { w: 2.2, seed: seed + 'rim' });
            const rim2 = S.ellipse(10, -138, 60, 17, 48);
            charcoal(q, [...rim2, rim2[0]], { w: 1.2, alpha: 0.5, seed: seed + 'rim2' });
            // the wine's level, seen from above too
            const lev = S.ellipse(-28, -96, 30, 8, 30);
            charcoal(q, [...lev.slice(8, 26)], { w: 1.4, color: '#5a3010', seed: seed + 'lev' });
            // stem and foot
            charcoal(q, [[-4, -20], [-3, -6]], { w: 2, seed: seed + 's1' });
            ruled(q, [-4, -18], [-4, 112], { w: 2, seed: seed + 's1', over: [0, 8] });
            ruled(q, [5, -18], [5, 112], { w: 2, seed: seed + 's2', over: [2, 14] });
            const foot = S.ellipse(0, 116, 56, 13, 44);
            fill(q, foot, 'rgba(236,228,206,0.2)');
            charcoal(q, [...foot, foot[0]], { w: 2.2, seed: seed + 'f' });
            // the glints
            for (const [a, b] of [[[-50, -140], [-56, -100]], [[-42, -60], [-30, -40]], [[2, 20], [2, 90]]]) charcoal(q, [a, b], { w: 2.2, color: '#fbf3dd', alpha: 0.8, seed: seed + a[0], specks: 0 });
        });
    }

    // ------------------------------------------------------------------ the pigeon's wing
    // A rock dove's right wing spread, seen from above, 420 × 240 at s = 1: the wrist at the
    // anchor, the hand and its primaries out to the right, the arm and its secondaries to
    // the left of it.
    function wing(g, o = {}) {
        const seed = o.seed ?? 'wing';
        local(g, o, (q) => {
            const r = Motion.rng('wi/' + seed), [dx, dy] = shadeDir(q);
            const COV = '#adb0b4', SEC = '#999da3', PRI = '#6f727a', PRID = '#3f4148', BAR = '#1f1e23';
            // a feather from base b along angle a, length l, width w; outer vane narrower;
            // notch: the outer vane steps in at 60 %
            const feather = (b, a, l, w, notch = false) => {
                const c = Math.cos(a), s = Math.sin(a), out = [], inn = [];
                for (let k = 0; k <= 12; k++) {
                    const u = k / 12, tip = Math.sqrt(Math.max(0, 1 - Math.pow(Math.max(0, u - 0.72) / 0.28, 2)));
                    const wo = w * 0.36 * tip * (notch && u > 0.6 ? 0.62 : 1) * Math.min(1, 0.4 + u * 3), wi = w * 0.64 * tip * Math.min(1, 0.4 + u * 3);
                    out.push([b[0] + c * l * u + s * wo, b[1] + s * l * u - c * wo]);
                    inn.push([b[0] + c * l * u - s * wi, b[1] + s * l * u + c * wi]);
                }
                return { pts: [...out, ...inn.reverse()], shaft: [[b[0], b[1]], [b[0] + c * l * 0.97, b[1] + s * l * 0.97]], c, s, b, l, w };
            };
            const paintF = (F, col0, o2 = {}) => {
                const col = tone(col0, (r() - 0.5) * 0.08);
                S.cast(q, (k) => fill(k, F.pts, '#000'), { blur: 3.5, dx: dx * 2.6, dy: dy * 2.6, color: 'rgba(20,18,26,0.55)' });
                q.save();
                clip(q, F.pts);
                fill(q, F.pts, col);
                // a darker inner vane, a lighter free edge facing the light
                if (o2.flat) {
                    // a feather of the arm: one surface with its neighbours, darker to the tip,
                    // a hair of light along the free edge
                    const tp = [F.b[0] + F.c * F.l, F.b[1] + F.s * F.l], gr = q.createLinearGradient(F.b[0], F.b[1], tp[0], tp[1]);
                    gr.addColorStop(0, S.rgba(tone(col, 0.12), 0.6));
                    gr.addColorStop(0.6, S.rgba(col, 0));
                    gr.addColorStop(1, S.rgba(tone(col, -0.25), 0.7));
                    q.fillStyle = gr;
                    q.fillRect(F.b[0] - F.l, F.b[1] - F.l, F.l * 2, F.l * 2);
                    S.spray(q, F.pts, { color: tone(col, 0.35), alpha: 0.35, w: 3, push: 1.5, dir: [-dx, -dy] });
                } else {
                    S.spray(q, F.pts, { color: tone(col, -0.4), alpha: 0.6, w: F.w * 0.4, push: F.w * 0.25, dir: [dx, dy] });
                    S.spray(q, F.pts, { color: tone(col, 0.45), alpha: 0.5, w: F.w * 0.3, push: F.w * 0.2, dir: [-dx, -dy] });
                }
                if (o2.bar) {
                    const [u0, u1] = o2.bar, p0 = [F.b[0] + F.c * F.l * u0, F.b[1] + F.s * F.l * u0];
                    q.translate(p0[0], p0[1]);
                    q.rotate(Math.atan2(F.s, F.c));
                    q.fillStyle = BAR;
                    q.globalAlpha = 0.9;
                    q.fillRect(0, -F.w, F.l * (u1 - u0), F.w * 2);
                }
                q.restore();
                q.save();
                clip(q, F.pts);
                if (o2.tipD) {
                    const tp = [F.b[0] + F.c * F.l, F.b[1] + F.s * F.l], gr = q.createRadialGradient(tp[0], tp[1], 0, tp[0], tp[1], F.l * o2.tipD);
                    gr.addColorStop(0, S.rgba(PRID, 0.95));
                    gr.addColorStop(1, S.rgba(PRID, 0));
                    q.fillStyle = gr;
                    q.fillRect(tp[0] - F.l, tp[1] - F.l, F.l * 2, F.l * 2);
                }
                // barbs: hairlines leaning out from the shaft
                q.lineWidth = 0.4;
                for (let k = 0; k < (F.l > 70 ? F.l / 3.5 : 0); k++) {
                    const u = 0.1 + (k * 3.5) / F.l, px = F.b[0] + F.c * F.l * u, py = F.b[1] + F.s * F.l * u, side = k % 2 ? 1 : -1, bl = F.w * 0.55;
                    q.strokeStyle = r() < 0.5 ? 'rgba(255,255,255,0.12)' : 'rgba(10,10,20,0.14)';
                    q.beginPath();
                    q.moveTo(px, py);
                    q.lineTo(px + F.c * bl * 0.55 + side * -F.s * bl, py + F.s * bl * 0.55 + side * F.c * bl);
                    q.stroke();
                }
                q.restore();
                // the shaft, pale, and the vane's thin contour
                if (F.l > 70) S.ink(q, F.shaft, { w: Math.max(0.8, F.w * 0.06), color: '#e6e3dc', alpha: 0.6, taper: [0.2, 1] });
                q.strokeStyle = 'rgba(24,22,30,0.3)';
                q.lineWidth = 0.55;
                q.beginPath();
                S.trace(q, F.pts);
                q.stroke();
            };
            // The leading edge, from the shoulder (left) through the wrist (0, -10) to the
            // end of the hand; rows of feathers are laid along it, `d` units behind it.
            const LE = S.curve([[-250, -4], [-170, -14], [-90, -17], [0, -10], [62, 6], [118, 30]], false, 10);
            const at = (t, d) => {
                const f = t * (LE.length - 1), i0 = Math.min(LE.length - 2, Math.floor(f)), u = f - i0, a = LE[i0], b = LE[i0 + 1];
                const p = [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u], tl = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
                const nx = -(b[1] - a[1]) / tl, ny = (b[0] - a[0]) / tl; // behind the edge (+y)
                return { p: [p[0] + nx * d, p[1] + ny * d], a: Math.atan2(ny, nx) };
            };
            const tW = 0.61; // the wrist's place along the edge
            // primaries: P10 (outermost, under) first, P1 last
            for (let k = 9; k >= 0; k--) {
                const u = k / 9, t = tW + u * (1 - tW) * 0.92, { p } = at(t, 22);
                const a = 1.08 - u * 0.92, l = 168 + 62 * Math.sin(Math.min(1, u * 1.15) * 1.45), w = 31 - u * 5;
                paintF(feather(p, a, l, w, k >= 6), S.mix(PRI, PRID, 0.15 + u * 0.35), { tipD: 0.4 + u * 0.15 });
            }
            // secondaries: from the wrist (S1) to the elbow, the inner ones over the outer
            for (let k = 0; k < 11; k++) {
                const t = tW - 0.02 - k * 0.05, { p, a } = at(t, 58);
                paintF(feather(p, a + 0.12 + k * 0.035, 124 - k * 1.5 + (k % 3) * 3, 33), S.mix(SEC, PRI, 0.25 - k * 0.015), { bar: k > 1 ? [0.64, 0.8] : null, flat: true });
            }
            // tertials, broad, by the body
            for (let k = 0; k < 3; k++) {
                const { p, a } = at(0.04 + k * 0.035, 50);
                paintF(feather(p, a + 0.45 - k * 0.08, 120 - k * 8, 42), tone(SEC, 0.04 - k * 0.05), { bar: k < 2 ? [0.6, 0.76] : null, flat: true });
            }
            // primary coverts over the bases of the primaries
            for (let k = 7; k >= 0; k--) {
                const u = k / 7, { p } = at(tW + u * (1 - tW) * 0.85, 10);
                paintF(feather(p, 1.0 - u * 0.75, 70 - u * 8, 24), S.mix(COV, PRI, 0.3));
            }
            // greater coverts, the first black bar across their tips
            for (let k = 0; k < 12; k++) {
                const t = tW - 0.01 - k * 0.048, { p, a } = at(t, 22);
                paintF(feather(p, a + 0.1 + k * 0.03, 56 + (k % 2) * 4, 30), COV, { bar: k > 1 ? [0.66, 0.98] : null, flat: true });
            }
            // median coverts, then the lesser ones in rows to the edge, each smaller
            for (const [d, len, w, n, col] of [[8, 34, 24, 15, tone(COV, 0.04)], [-2, 24, 19, 19, tone(COV, 0.08)], [-9, 16, 14, 24, tone(COV, 0.12)]]) {
                for (let k = 0; k < n; k++) {
                    const t = 0.02 + (k / (n - 1)) * (tW + 0.02) + (k % 2) * 0.008, { p, a } = at(t, d);
                    paintF(feather(p, a + 0.15, len * (0.9 + (k % 3) * 0.07), w), col, { flat: true });
                }
            }
            // the alula at the wrist, lying forward along the edge
            for (let k = 0; k < 3; k++) {
                const { p } = at(tW + 0.01 + k * 0.012, -2 + k * 3);
                paintF(feather(p, 0.38 + k * 0.1, 52 - k * 9, 15), PRID);
            }
            // the leading edge: the wing's bone under the skin, a ruled line that overruns
            charcoal(q, S.curve([[-280, -14], [-170, -22], [-90, -25], [0, -18], [62, -2], [150, 34]], false, 6), { w: 2.8, seed: seed + 'le' });
        });
    }

    // ------------------------------------------------------------------ the nail
    // A hand-forged nail driven in at a slant, pinning the picture up; anchor where it enters.
    function nail(g, o = {}) {
        const seed = o.seed ?? 'nail';
        local(g, o, (q) => {
            const r = Motion.rng('na/' + seed), [dx, dy] = shadeDir(q), s = o.size ?? 1;
            q.scale(s, s);
            // a dent and rust round the hole
            const rg = q.createRadialGradient(0, 0, 0, 0, 0, 16);
            rg.addColorStop(0, 'rgba(110,52,20,0.5)');
            rg.addColorStop(1, 'rgba(110,52,20,0)');
            q.fillStyle = rg;
            q.fillRect(-16, -16, 32, 32);
            for (let k = 0; k < 18; k++) {
                q.fillStyle = `rgba(${120 + Math.floor(r() * 40)},${56 + Math.floor(r() * 20)},20,${(0.2 + r() * 0.3).toFixed(2)})`;
                q.beginPath();
                q.arc((r() - 0.5) * 22 + dx * 6, (r() - 0.5) * 18 + dy * 8, 0.6 + r() * 1.6, 0, TAU);
                q.fill();
            }
            // the head stands out from the wall: its shadow and the shank's, long, to the lower right
            const head = [-14, -30], shL = 42;
            S.cast(q, (k) => {
                k.fillStyle = '#000';
                k.beginPath();
                k.moveTo(-3, 0);
                k.lineTo(3, 0);
                k.lineTo(head[0] + dx * shL + 4, head[1] + dy * shL + 3);
                k.lineTo(head[0] + dx * shL - 3, head[1] + dy * shL - 3);
                k.fill();
                k.beginPath();
                k.ellipse(head[0] + dx * shL, head[1] + dy * shL, 15, 12, 0.6, 0, TAU);
                k.fill();
            }, { blur: 5, dx: 0, dy: 0, color: 'rgba(28,18,12,0.55)' });
            // the shank: square, dark iron, lit on one face
            const sh = [[-3.4, 0], [3.4, 0], [head[0] + 3.4, head[1] + 2], [head[0] - 3.4, head[1] + 2]];
            fill(q, sh, '#2c2622');
            fill(q, [[-3.4, 0], [0, 0], [head[0], head[1] + 2], [head[0] - 3.4, head[1] + 2]], '#6a5a4c');
            for (let k = 0; k < 6; k++) {
                q.fillStyle = 'rgba(140,70,30,0.6)';
                q.fillRect(head[0] * (k / 6) - 2 + r() * 3, head[1] * (k / 6) + r() * 2, 1.4, 1.2);
            }
            // the rose head: four hammered facets round a crown
            const cx = head[0], cy = head[1], R = 15, crown = [cx - 2, cy - 2], corners = [];
            for (let k = 0; k < 4; k++) {
                const a = Math.PI / 4 + (k * Math.PI) / 2 + 0.12;
                corners.push([cx + Math.cos(a) * R * (0.92 + r() * 0.12), cy + Math.sin(a) * R * 0.82 * (0.92 + r() * 0.12)]);
            }
            fill(q, corners.map(([x, y]) => [x + 1.2, y + 1.6]), '#141010');
            for (let k = 0; k < 4; k++) {
                const a = corners[k], b = corners[(k + 1) % 4], m = [(a[0] + b[0]) / 2 - cx, (a[1] + b[1]) / 2 - cy], ml = Math.hypot(m[0], m[1]);
                const lit = -(m[0] * dx + m[1] * dy) / ml, col = S.mix('#3a3230', '#c6b8a6', 0.5 + 0.45 * lit);
                fill(q, [crown, a, b], col);
                // hammer marks
                for (let j = 0; j < 3; j++) {
                    const u = 0.3 + r() * 0.5, v = 0.2 + r() * 0.6, p = [crown[0] + (a[0] - crown[0]) * u + (b[0] - a[0]) * u * v, crown[1] + (a[1] - crown[1]) * u + (b[1] - a[1]) * u * v];
                    q.fillStyle = lit > 0 ? 'rgba(255,246,226,0.35)' : 'rgba(10,6,6,0.35)';
                    q.beginPath();
                    q.ellipse(p[0], p[1], 1.6, 1, r() * 3, 0, TAU);
                    q.fill();
                }
            }
            q.strokeStyle = 'rgba(16,10,10,0.9)';
            q.lineWidth = 1;
            q.beginPath();
            S.trace(q, corners);
            q.stroke();
            // rust on the head, a gleam on the crown
            for (let k = 0; k < 10; k++) {
                q.fillStyle = `rgba(150,74,30,${(0.25 + r() * 0.35).toFixed(2)})`;
                q.beginPath();
                q.arc(cx + (r() - 0.5) * 20, cy + (r() - 0.5) * 16, 0.6 + r() * 1.4, 0, TAU);
                q.fill();
            }
            q.fillStyle = 'rgba(255,248,232,0.85)';
            q.beginPath();
            q.ellipse(crown[0] - 2.5, crown[1] - 2, 2.4, 1.2, -0.6, 0, TAU);
            q.fill();
        });
    }

    // ------------------------------------------------------------------ the guitar's head
    // A flamenco head with wooden pegs, seen from the front, with the pegs in profile as if
    // seen from the side at the same time. Anchor: the middle of the nut; the head goes up
    // (−y) 300 units at s = 1.
    function head(g, o = {}) {
        const seed = o.seed ?? 'head';
        local(g, o, (q) => {
            const r = Motion.rng('he/' + seed), [dx, dy] = shadeDir(q);
            // the plank: wider at the top, the crest an arch between two shoulders
            const plank = S.curve([[-44, 0], [-47, -120], [-52, -250], [-56, -282], [-40, -290], [-22, -300], [0, -312], [22, -300], [40, -290], [56, -282], [52, -250], [47, -120], [44, 0]], true, 4);
            plane(q, plank, { color: PAL.burnt, under: PAL.umberD, dir: -1.57, seed: seed + 'p', lines: 'all', over: [6, 26], shade: null, light: null, castD: 8 });
            q.save();
            clip(q, plank);
            comb(q, plank, { dir: Math.PI / 2, color: PAL.umberD, alpha: 0.55, pitch: 2.6, teeth: 7, knots: 0, seed: seed + 'c', glaze: false });
            S.spray(q, plank, { color: PAL.umberD, alpha: 0.7, w: 14, push: 8, dir: [dx, dy] });
            S.spray(q, plank, { color: '#c48a5a', alpha: 0.35, w: 10, push: 6, dir: [-dx, -dy] });
            q.restore();
            // the nut: bone, six notches
            plane(q, [[-46, -8], [46, -8], [46, 4], [-46, 4]], { color: PAL.bone, dir: 0, seed: seed + 'n', lines: 'all', over: [4, 14], shade: null, light: null, top: 0.1 });
            const sx = (i) => -27 + i * 10.8;
            for (let i = 0; i < 6; i++) fill(q, [[sx(i) - 1.4, -8], [sx(i) + 1.4, -8], [sx(i) + 0.8, -4], [sx(i) - 0.8, -4]], '#3a2c22');
            // the pegs: in profile out to the sides (shaft, collar, a pear-shaped knob), their
            // ends in the face with the strings wound round them
            const ys = [-86, -158, -230];
            for (let k = 0; k < 3; k++) {
                for (const side of [-1, 1]) {
                    const y = ys[k] + (side > 0 ? 8 : 0), x0 = side * 46, x1 = side * 110;
                    const shaft = [[x0, y - 5], [x1, y - 6.5], [x1, y + 6.5], [x0, y + 5]];
                    plane(q, side > 0 ? shaft : shaft.slice().reverse(), { color: PAL.ochre, dir: 0, seed: seed + 'sh' + k + side, lines: 'all', over: [0, 6], shade: null, light: null, castD: 5, top: 0.05 });
                    const kx = side * 120, knob = S.ellipse(kx + side * 26, y, 34, 18, 32);
                    plane(q, knob, { color: PAL.ochreL, dir: 0.2, seed: seed + 'kn' + k + side, lines: null, castD: 7, shadeW: 22, lightW: 14 });
                    charcoal(q, [...knob, knob[0]], { w: 2.2, seed: seed + 'knc' + k + side });
                    const col = [[x1, y - 10], [x1 + side * 12, y - 12], [x1 + side * 12, y + 12], [x1, y + 10]];
                    plane(q, side > 0 ? col : col.slice().reverse(), { color: PAL.ochreD, dir: 1.57, seed: seed + 'co' + k + side, lines: 'all', over: [0, 4], shade: null, light: null, castD: 4, top: 0.05 });
                    // the peg's end through the face, and the string's turns round it
                    const ex = side * 24, ey = y;
                    q.fillStyle = '#1a120e';
                    q.beginPath();
                    q.arc(ex + 0.8, ey + 1, 6.4, 0, TAU);
                    q.fill();
                    q.fillStyle = S.mix(PAL.ochre, '#3a2a1c', 0.3);
                    q.beginPath();
                    q.arc(ex, ey, 5.6, 0, TAU);
                    q.fill();
                    const si = side < 0 ? 2 - k : 3 + k;
                    for (let t = 0; t < 4; t++) S.ink(q, [[ex - 6, ey - 3 + t * 2], [ex + 6, ey - 2 + t * 2]], { w: 1.1, color: si < 3 ? '#b8b0a0' : '#ede4d0', taper: [0.2, 0.2] });
                    // the string from its notch in the nut to the peg
                    stringSeg(q, [sx(si), -8], [ex + side * 3, ey + 2], si, { shadow: 3 });
                }
            }
        });
    }

    // ------------------------------------------------------------------ strings and frets
    // One string as a ruled line of paint: its shadow on the plane under it (shadow: offset
    // in units, 0 for none), a grey body, a bone core, a hair of light; the basses wound.
    const GAUGE = [2.5, 2.2, 1.9, 2.1, 1.8, 1.55];
    function stringSeg(g, a, b, i, o = {}) {
        const w = (o.w ?? GAUGE[i]) * (o.k ?? 1), [dx, dy] = shadeDir(g), L = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1, t = [(b[0] - a[0]) / L, (b[1] - a[1]) / L];
        g.save();
        g.lineCap = 'butt';
        if (o.shadow) {
            g.strokeStyle = 'rgba(24,14,10,0.42)';
            g.lineWidth = w * 1.6;
            g.beginPath();
            g.moveTo(a[0] + dx * o.shadow, a[1] + dy * o.shadow);
            g.lineTo(b[0] + dx * o.shadow, b[1] + dy * o.shadow);
            g.stroke();
            if (o.only === 'shadow') {
                g.restore();
                return;
            }
        }
        const line = (off, lw, col) => {
            g.strokeStyle = col;
            g.lineWidth = lw;
            g.beginPath();
            g.moveTo(a[0] - t[1] * off, a[1] + t[0] * off);
            g.lineTo(b[0] - t[1] * off, b[1] + t[0] * off);
            g.stroke();
        };
        line(0, w, i < 3 ? '#3a3330' : 'rgba(70,60,62,0.8)');
        line(0, w * 0.62, i < 3 ? '#b2aa9a' : '#ece4d0');
        if (i < 3) {
            // the winding, as fine slanted ticks
            g.strokeStyle = 'rgba(40,34,36,0.55)';
            g.lineWidth = 0.45;
            g.beginPath();
            for (let d = 0; d < L; d += 1.6) {
                const x = a[0] + t[0] * d, y = a[1] + t[1] * d;
                g.moveTo(x - t[1] * w * 0.4 - t[0] * 0.5, y + t[0] * w * 0.4 - t[1] * 0.5);
                g.lineTo(x + t[1] * w * 0.4 + t[0] * 0.5, y - t[0] * w * 0.4 + t[1] * 0.5);
            }
            g.stroke();
        }
        const l = [-dy, dx], side = l[0] * -t[1] + l[1] * t[0] > 0 ? -1 : 1;
        line(side * w * 0.2, w * 0.2, 'rgba(255,250,236,0.9)');
        g.restore();
    }
    // The fingerboard as a ladder: a dark plane between two rails, the frets as rungs that
    // overrun it. axis: [top, bottom] points; half(u): its half-width at u (0 top … 1 bottom);
    // frets: positions u of the rungs.
    function ladder(g, o) {
        const seed = o.seed ?? 'ladder', [A, B] = o.axis, L = Math.hypot(B[0] - A[0], B[1] - A[1]), t = [(B[0] - A[0]) / L, (B[1] - A[1]) / L], n = [-t[1], t[0]];
        const P = (u, v) => [A[0] + t[0] * L * u + n[0] * v, A[1] + t[1] * L * u + n[1] * v];
        const hw = o.half ?? (() => 40);
        const board = [P(0, -hw(0)), P(0, hw(0)), P(1, hw(1)), P(1, -hw(1))];
        plane(g, board, { color: PAL.black, under: '#0d0b0b', dir: Math.atan2(t[1], t[0]), seed: seed + 'b', lines: o.rails === false ? null : [1, 3], over: [20, 70], shade: null, light: null, castD: o.castD ?? 8, bristle: 0.5 });
        const r = Motion.rng('la/' + seed), [dx, dy] = shadeDir(g);
        for (const u of o.frets) {
            const w = hw(u), ov0 = 3 + r() * (o.over ?? 14), ov1 = 3 + r() * (o.over ?? 14), h = (o.fh ?? 2.6) / 2;
            const bar = [P(u - h / L, -w - ov0), P(u - h / L, w + ov1), P(u + h / L, w + ov1), P(u + h / L, -w - ov0)];
            // its shade on the board, then the bar: bone-grey, lit on its upper edge
            fill(g, bar.map(([x, y]) => [x + dx * 2.2, y + dy * 2.2]), 'rgba(6,4,4,0.6)');
            fill(g, bar, '#a9a39a');
            fill(g, [bar[0], bar[1], P(u, w + ov1), P(u, -w - ov0)], '#e4ddcc');
            charcoal(g, [P(u - h / L, -w - ov0 - 2), P(u - h / L, w + ov1 + 2)], { w: 0.9, alpha: 0.6, seed: seed + 'f' + u, specks: 0.1 });
        }
    }

    // ------------------------------------------------------------------ bridge
    // The bridge as planes, after Guitar.BRIDGE, in the guitar's units times s; anchor the
    // sound hole's centre (as in things/guitar.js). Its strings end on the tie block.
    function bridge(g, o = {}) {
        const seed = o.seed ?? 'bridge', BR = Guitar.BRIDGE, s = o.s ?? 1;
        local(g, { x: o.x, y: o.y, s }, (q) => {
            const wing = [[-BR.half, BR.y0 + 4], [-BR.block, BR.y0], [BR.block, BR.y0], [BR.half, BR.y0 + 4], [BR.half + 2, BR.y1 - 4], [BR.block, BR.y1], [-BR.block, BR.y1], [-BR.half - 2, BR.y1 - 4]];
            plane(q, wing, { color: PAL.burnt, under: PAL.umberD, dir: 0, seed: seed + 'w', lines: 'all', over: [6, 30], shade: null, light: null, len: 14, w: 4, castD: 5 });
            q.save();
            clip(q, wing);
            comb(q, wing, { dir: 0, color: PAL.umberD, alpha: 0.6, pitch: 1.4, teeth: 6, knots: 0, seed: seed + 'c', glaze: false });
            S.spray(q, wing, { color: '#120808', alpha: 0.7, w: 8, push: 5, dir: shadeDir(q) });
            q.restore();
            // the tie block, darker, with its bone inlay; the saddle
            const tb = [[-BR.block, BR.tie0], [BR.block, BR.tie0], [BR.block, BR.tie1], [-BR.block, BR.tie1]];
            plane(q, tb, { color: PAL.umberD, dir: 0, seed: seed + 't', lines: 'all', over: [4, 18], shade: null, light: null, castD: 3, len: 10, w: 3 });
            for (const y of [BR.tie0 + 2, BR.tie1 - 3]) fill(q, [[-BR.block + 2, y - 1.2], [BR.block - 2, y - 1.2], [BR.block - 2, y + 1.2], [-BR.block + 2, y + 1.2]], '#e6dcc2');
            plane(q, [[-58, BR.seat - 7], [58, BR.seat - 7], [58, BR.seat - 2], [-58, BR.seat - 2]], { color: PAL.bone, dir: 0, seed: seed + 's', lines: 'all', over: [2, 10], shade: null, light: null, castD: 2.5, len: 8, w: 2.5 });
            for (let i = 0; i < 6; i++) {
                const x = Guitar.stringX(i, Guitar.SADDLE);
                stringSeg(q, [x, BR.seat - 5], [x, BR.tie0 + 1], i, { shadow: 1.5 });
                // the knot: three turns over the tie block
                for (let k = 0; k < 3; k++) S.ink(q, [[x - 3, BR.tie0 + 5 + k * 4.4], [x + 3, BR.tie0 + 7 + k * 4.4]], { w: GAUGE[i] * 1.1, color: i < 3 ? '#b2aa9a' : '#ece4d0', taper: [0.3, 0.3] });
            }
        });
    }

    // ------------------------------------------------------------------ rosette
    // The rosette taken apart: rings of tesserae between r0 and r1 about (cx, cy), broken
    // into arcs that have slipped (out, in, round), so its circles do not agree.
    function rosette(g, o) {
        const seed = o.seed ?? 'ros', r = Motion.rng('ro/' + seed), { r0, r1 } = o, cx = o.cx ?? 0, cy = o.cy ?? 0, slip = o.slip ?? 8;
        const [dx, dy] = shadeDir(g);
        // each ring of tiles repeats a short sequence of woods, as marquetry does
        const PATS = [[PAL.bone, PAL.black], [PAL.ochre, PAL.bone, PAL.burnt, PAL.bone], [PAL.black, PAL.ochreD, PAL.ochreD], [PAL.bone, PAL.greyD, PAL.ochre, PAL.greyD], [PAL.burnt, PAL.bone]];
        const rings = [];
        for (let rr = r0; rr < r1;) {
            const w = 2.5 + r() * 7;
            rings.push([rr, Math.min(r1, rr + w), r() < 0.45 ? 'tiles' : r() < 0.5 ? 'rope' : 'plain']);
            rr += w + 0.8;
        }
        // arcs that slipped
        let a = r() * TAU;
        const end = a + TAU;
        while (a < end) {
            const da = Math.min(end - a, 0.5 + r() * 1.3), off = (r() - 0.5) * slip * 2, rot = (r() - 0.5) * 0.04, ox = cx + (r() - 0.5) * slip * 0.6, oy = cy + (r() - 0.5) * slip * 0.6;
            // its shadow on what is under it
            g.save();
            g.fillStyle = 'rgba(12,8,8,0.45)';
            g.beginPath();
            g.arc(ox + dx * 3, oy + dy * 3, r1 + off + 1, a, a + da);
            g.arc(ox + dx * 3, oy + dy * 3, r0 + off - 1, a + da, a, true);
            g.fill();
            g.restore();
            g.fillStyle = PAL.black;
            g.beginPath();
            g.arc(ox, oy, r1 + off, a, a + da);
            g.arc(ox, oy, r0 + off, a + da, a, true);
            g.fill();
            for (const [ra, rb, kind] of rings) {
                const A0 = ra + off, B0 = rb + off, n = Math.max(2, Math.round(((B0 + A0) / 2) * da / (kind === 'rope' ? 3.2 : 5.5)));
                for (let k = 0; k < n; k++) {
                    const t0 = a + rot + (k / n) * da, t1 = a + rot + ((k + 0.86) / n) * da;
                    const ri = rings.findIndex((q) => q[0] === ra), pat = PATS[ri % PATS.length];
                    const c = kind === 'plain' ? (ri % 2 ? PAL.bone : PAL.ochreD) : pat[k % pat.length];
                    const lit = -Math.cos((t0 + t1) / 2) * dx - Math.sin((t0 + t1) / 2) * dy;
                    g.fillStyle = tone(c, (r() - 0.5) * 0.18 + lit * 0.08);
                    g.beginPath();
                    if (kind === 'rope') {
                        const m = (A0 + B0) / 2, sk = (B0 - A0) / ((A0 + B0) / 2);
                        g.moveTo(ox + Math.cos(t0) * A0, oy + Math.sin(t0) * A0);
                        g.lineTo(ox + Math.cos(t1) * A0, oy + Math.sin(t1) * A0);
                        g.lineTo(ox + Math.cos(t1 + sk) * B0, oy + Math.sin(t1 + sk) * B0);
                        g.lineTo(ox + Math.cos(t0 + sk) * B0, oy + Math.sin(t0 + sk) * B0);
                    } else {
                        g.arc(ox, oy, B0, t0, kind === 'plain' ? a + rot + da : t1);
                        g.arc(ox, oy, A0, kind === 'plain' ? a + rot + da : t1, t0, true);
                    }
                    g.fill();
                    if (kind === 'plain') break;
                }
            }
            // the slipped arc's cut ends, ruled
            for (const t of [a, a + da]) ruled(g, [ox + Math.cos(t) * (r0 + off), oy + Math.sin(t) * (r0 + off)], [ox + Math.cos(t) * (r1 + off), oy + Math.sin(t) * (r1 + off)], { w: 1.8, over: [1, 6], seed: seed + 'cut' + t });
            a += da;
        }
        // the circles drawn over it, in charcoal, not where the tiles are
        for (const [rr, ox, oy] of [[r0 - 3, cx + 4, cy - 3], [r1 + 4, cx - 5, cy + 2], [(r0 + r1) / 2, cx + 9, cy + 6]]) {
            const pts = [];
            const a0 = r() * TAU, span = TAU * (0.75 + r() * 0.35);
            for (let k = 0; k <= 80; k++) pts.push([ox + Math.cos(a0 + (k / 80) * span) * rr, oy + Math.sin(a0 + (k / 80) * span) * rr]);
            charcoal(g, pts, { w: 2.2, alpha: 0.75, seed: seed + 'ci' + rr });
        }
    }

    // ------------------------------------------------------------------ the moon
    function moon(g, o = {}) {
        const seed = o.seed ?? 'moon', R = o.r ?? 110;
        local(g, { x: o.x, y: o.y }, (q) => {
            const [dx, dy] = shadeDir(q), disc = S.ellipse(0, 0, R, R, 120);
            S.cast(q, (k) => fill(k, disc, '#000'), { blur: 14, dx: dx * 8, dy: dy * 8, color: 'rgba(10,12,24,0.5)' });
            q.save();
            clip(q, disc);
            fill(q, disc, PAL.moon);
            bristle(q, disc, { dir: -0.4, alpha: 0.18 });
            // the seas, as the full moon shows them, scumbled in a warm grey
            const seas = [[-0.36, -0.38, 0.34, 0.26], [0.1, -0.4, 0.18, 0.16], [0.28, -0.06, 0.2, 0.18], [0.62, -0.18, 0.12, 0.13], [0.42, 0.28, 0.13, 0.17], [-0.58, 0.08, 0.26, 0.42], [-0.12, 0.32, 0.18, 0.12]];
            q.save();
            q.filter = `blur(${(R * 0.035 * S.pxScale(q)).toFixed(2)}px)`;
            seas.forEach(([x, y, rx, ry], k) => {
                const rr = Motion.rng(seed + 'sea' + k), pts2 = [];
                for (let j = 0; j < 14; j++) {
                    const a = (j / 14) * TAU, f = 0.7 + rr() * 0.5;
                    pts2.push([(x + Math.cos(a) * rx * f) * R, (y + Math.sin(a) * ry * f) * R]);
                }
                fill(q, S.curve(pts2, true, 4), 'rgba(140,136,130,0.42)');
            });
            q.restore();
            // craters: a bright rim towards the light, a dark floor
            const cr = Motion.rng(seed + 'cr');
            for (let k = 0; k < 13; k++) {
                const a = cr() * TAU, d = Math.sqrt(cr()) * R * 0.85, x = Math.cos(a) * d, y = Math.sin(a) * d, rr = R * (0.01 + cr() * 0.022);
                q.fillStyle = 'rgba(120,116,112,0.3)';
                q.beginPath();
                q.arc(x, y, rr, 0, TAU);
                q.fill();
                q.strokeStyle = 'rgba(255,252,244,0.7)';
                q.lineWidth = rr * 0.4;
                q.beginPath();
                q.arc(x, y, rr, Math.atan2(dy, dx) + 1.6, Math.atan2(dy, dx) + 4.6);
                q.stroke();
            }
            bristle(q, disc, { dir: 0.5, alpha: 0.22, v: 1 });
            // Tycho and its rays
            const ty = [-0.08 * R, 0.66 * R];
            q.strokeStyle = 'rgba(255,253,244,0.5)';
            q.lineWidth = R * 0.012;
            for (let k = 0; k < 11; k++) {
                const a = k * 0.6 + 0.2, l = R * (0.25 + (k % 3) * 0.2);
                q.beginPath();
                q.moveTo(ty[0], ty[1]);
                q.lineTo(ty[0] + Math.cos(a) * l, ty[1] + Math.sin(a) * l);
                q.stroke();
            }
            q.fillStyle = '#fffaf0';
            q.beginPath();
            q.arc(ty[0], ty[1], R * 0.035, 0, TAU);
            q.fill();
            // the limb a little greyer, the side away from the light a little more
            const gr = q.createRadialGradient(-dx * R * 0.1, -dy * R * 0.1, R * 0.55, 0, 0, R * 1.02);
            gr.addColorStop(0, 'rgba(120,118,124,0)');
            gr.addColorStop(1, 'rgba(120,118,124,0.35)');
            q.fillStyle = gr;
            q.fillRect(-R, -R, R * 2, R * 2);
            q.restore();
            const c1 = S.ellipse(0, 0, R, R, 90), c2 = S.ellipse(R * 0.05, -R * 0.03, R * 1.03, R * 1.03, 90);
            charcoal(q, [...c1, c1[0], c1[1], c1[2], c1[3]], { w: 2.6, seed: seed + 'c1' });
            charcoal(q, c2.slice(10, 70), { w: 1.6, alpha: 0.5, seed: seed + 'c2' });
        });
    }

    // ------------------------------------------------------------------ the card
    // The ace of coins of picture 1 (things/charms.js), torn across and pasted.
    function card(g, o = {}) {
        if (typeof Charms === 'undefined') return;
        const s = o.s ?? 1, rot = o.rot ?? 0, x = o.x ?? 0, y = o.y ?? 0;
        // the front card's frame as Charms lays it out
        const a = rot + 0.035, c = Math.cos(rot), sn = Math.sin(rot);
        const ox = x + (3.5 * c + 9 * sn) * s, oy = y + (3.5 * sn - 9 * c) * s;
        const loc = (px, py) => [ox + (px * Math.cos(a) - py * Math.sin(a)) * s, oy + (px * Math.sin(a) + py * Math.cos(a)) * s];
        const tear = o.tear ?? 0.25, corners = [loc(-77, -117), loc(77, -117), loc(77, 117 - 230 * tear), loc(-77, 117 - 230 * tear * 0.2)];
        const { pts, tornRuns } = sheetOutline(corners, [2], o.seed ?? 'card', 7 * s);
        const [dx, dy] = shadeDir(g);
        S.cast(g, (q) => fill(q, pts, '#000'), { blur: 4, dx: dx * 3, dy: dy * 3, color: 'rgba(20,12,8,0.55)' });
        g.save();
        clip(g, pts);
        Charms.cards(g, { x, y, s, rot, seed: o.seed ?? 'baraja' });
        g.restore();
        g.save();
        clip(g, pts);
        for (const [i0, i1] of tornRuns) {
            g.strokeStyle = 'rgba(250,244,230,0.95)';
            g.lineWidth = 6 * s;
            g.beginPath();
            S.trace(g, pts.slice(i0, i1), false);
            g.stroke();
        }
        g.restore();
    }

    // ------------------------------------------------------------------ the sound hole
    // A black disc of radius R with a hole of radius h cut through it (and through anything
    // under it on this layer): the lip catches the light on its far side.
    function blackDisc(g, o) {
        const R = o.r, h = o.hole ?? 0, cx = o.x ?? 0, cy = o.y ?? 0, [dx, dy] = shadeDir(g), seed = o.seed ?? 'bd';
        const disc = S.ellipse(cx, cy, R, R, 120);
        S.cast(g, (q) => fill(q, disc, '#000'), { blur: 10, dx: dx * 5, dy: dy * 5, color: 'rgba(10,6,6,0.5)' });
        g.save();
        clip(g, disc);
        fill(g, disc, '#141011');
        bristle(g, disc, { dir: 0.3, alpha: 0.3, size: 1 });
        const gr = g.createRadialGradient(cx, cy, Math.max(h, R * 0.4), cx, cy, R);
        gr.addColorStop(0, 'rgba(60,40,30,0)');
        gr.addColorStop(1, 'rgba(60,40,30,0.4)');
        g.fillStyle = gr;
        g.fillRect(cx - R, cy - R, R * 2, R * 2);
        g.restore();
        // the lip: light on the far (lower right) inside edge, the near edge in shade
        const fa = Math.atan2(dy, dx);
        S.ink(g, Array.from({ length: 30 }, (_, k) => [cx + Math.cos(fa - 1.1 + (k / 29) * 2.2) * (R - 3), cy + Math.sin(fa - 1.1 + (k / 29) * 2.2) * (R - 3)]), { w: 3, color: '#c99a5c', alpha: 0.7 });
        charcoal(g, Array.from({ length: 91 }, (_, k) => [cx + Math.cos((k / 90) * TAU * 1.06) * (R + 1), cy + Math.sin((k / 90) * TAU * 1.06) * (R + 1)]), { w: 3, seed: seed + 'c' });
        if (h > 0) {
            g.save();
            g.globalCompositeOperation = 'destination-out';
            g.fillStyle = '#000';
            g.beginPath();
            g.arc(cx, cy, h, 0, TAU);
            g.fill();
            g.restore();
        }
    }

    // ------------------------------------------------------------------ small things for density
    // Stencilled capitals, as the painters lettered their pictures: brushed through a card
    // stencil, so the letters have bridges and a dry, speckled edge. Anchor: the baseline's
    // middle. Words in correct Spanish, short.
    function stencil(g, text, o = {}) {
        const size = o.size ?? 60, col = o.color ?? PAL.bone, seed = o.seed ?? text;
        local(g, o, (q) => {
            const res = Math.min(6, Math.max(1, Math.ceil(S.pxScale(q) * 2) / 2));
            q.save();
            q.font = `${size}px ${ANTON}`;
            const sp = size * 0.12, ws = [...text].map((ch) => q.measureText(ch).width + sp), W = ws.reduce((a, b) => a + b, 0) - sp;
            q.restore();
            const box = { x: -W / 2 - 10, y: -size * 1.05, w: W + 20, h: size * 1.3 };
            const sh = S.sheet(box, res, (k) => {
                k.font = `${size}px ${ANTON}`;
                k.fillStyle = col;
                let x = -W / 2;
                [...text].forEach((ch, i) => {
                    k.fillText(ch, x, 0);
                    // the stencil's bridges: thin ties across the letter where a counter would fall out
                    k.save();
                    k.globalCompositeOperation = 'destination-out';
                    k.fillStyle = '#000';
                    if ('ABDOPQR0689'.includes(ch)) k.fillRect(x - 2, -size * 0.5, ws[i], size * 0.06);
                    k.restore();
                    x += ws[i];
                });
                // the dry brush: specks lost at random, more towards the edges of the card
                const r = Motion.rng('st/' + seed);
                k.globalCompositeOperation = 'destination-out';
                for (let i = 0; i < (W * size) / 6; i++) {
                    const s = 0.4 + r() * 1.4;
                    k.globalAlpha = 0.4 + r() * 0.6;
                    k.fillRect(-W / 2 + r() * W, -size + r() * size * 1.1, s, s);
                }
                k.globalAlpha = 1;
                // dragged strokes of the stencil brush across it
                for (let i = 0; i < 18; i++) {
                    k.globalAlpha = 0.25 + r() * 0.3;
                    k.fillRect(-W / 2 + r() * W, -size + r() * size, 6 + r() * 30, 0.8 + r());
                }
            });
            q.globalAlpha = o.alpha ?? 0.88;
            q.drawImage(sh.canvas, box.x, box.y, box.w, box.h);
        });
    }
    // A patch of charcoal hatching: parallel strokes laid side by side from a point, clipped
    // to a polygon.
    function hatch(g, pts, o = {}) {
        const r = Motion.rng('ha/' + (o.seed ?? 1)), a = o.angle ?? 0.9, c = Math.cos(a), s = Math.sin(a), p = o.at ?? centroid(pts);
        const n = o.n ?? 10 + Math.floor(r() * 8), gap = o.gap ?? 6, len = o.len ?? 60;
        g.save();
        clip(g, pts);
        for (let i = 0; i < n; i++) {
            const off = (i - n / 2) * gap, l = len * (0.5 + r() * 0.7), sh = (r() - 0.5) * len * 0.4;
            const x = p[0] - s * off + c * sh, y = p[1] + c * off + s * sh;
            charcoal(g, [[x - (c * l) / 2, y - (s * l) / 2], [x + (c * l) / 2, y + (s * l) / 2]], { w: o.w ?? 1.5, alpha: o.alpha ?? 0.6, seed: (o.seed ?? 1) + '/' + i, specks: 0.1, color: o.color });
        }
        g.restore();
    }
    // A small torn scrap of printed paper pasted on: 'news' (type in columns), 'score'
    // (staves), 'ad' (a word in a fat face over a few lines), 'label' (the guitar maker's
    // label of picture 1, pasted outside the box). Anchor: its middle.
    const NEWS = 'El vapor de Cádiz entró ayer con frutos y pasajeros. Se vende guitarra de ciprés con su funda. La feria empieza el jueves en el paseo. En el muelle se encendieron hogueras toda la noche. Las palomas de la plaza echaron a volar al alba. Mañana habrá luna llena y buen tiempo. El moscatel de este año será muy dulce. Se alquila piso con balcón a la plaza. Los pescadores volvieron tarde y con poca sardina. Esta noche hay cante en la taberna del puerto. Se ha perdido un perro blanco con una mancha negra. El tranvía no pasará por la calle Larios hasta el lunes.'.split(' ');
    function scrap(g, o = {}) {
        const seed = o.seed ?? 'scrap', w = o.w ?? 120, h = o.h ?? 80, kind = o.kind ?? 'news';
        local(g, o, (q) => {
            const r = Motion.rng('sc/' + seed);
            const corners = [[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2]];
            paper(q, {
                corners, torn: o.torn ?? [1, 2], seed, amp: Math.min(w, h) * 0.07, stock: kind === 'label' ? '#e8d9b0' : kind === 'score' ? '#e2d6b4' : PAL.news, paste: 1, fox: 8, pins: o.pins ?? [],
                print: (p) => {
                    if (kind === 'news' || kind === 'ad') {
                        let y = -h / 2 + 10;
                        if (kind === 'ad') {
                            type(p, o.word ?? 'GUITARRAS', 0, y + 14, { font: ANTON, size: Math.min(22, w / 6), align: 'center', spacing: 1.2 });
                            y += 26;
                        }
                        const cols = Math.max(1, Math.round(w / 70)), cw = (w - 12) / cols - 6;
                        let wi = Math.floor(r() * NEWS.length);
                        while (wi > 0 && !NEWS[wi - 1].endsWith('.')) wi--; // start at a sentence
                        for (let c = 0; c < cols; c++) {
                            for (let yy = y; yy < h / 2 - 4; yy += 7.6) {
                                const words = [];
                                p.font = `5.6px ${LORA}`;
                                while (p.measureText(words.concat(NEWS[wi % NEWS.length]).join(' ')).width < cw) words.push(NEWS[wi++ % NEWS.length]);
                                if (!words.length) words.push(NEWS[wi++ % NEWS.length]);
                                type(p, words.join(' '), -w / 2 + 6 + c * (cw + 6), yy, { size: 5.6, width: cw, alpha: 0.82 });
                            }
                            if (c) p.fillRect(-w / 2 + 3 + c * (cw + 6), y - 6, 0.6, h);
                        }
                    } else if (kind === 'score') {
                        p.strokeStyle = 'rgba(43,32,32,0.75)';
                        p.lineWidth = 0.55;
                        for (let st = -h / 2 + 10; st < h / 2 - 20; st += 34) {
                            for (let l = 0; l < 5; l++) {
                                p.beginPath();
                                p.moveTo(-w / 2, st + l * 5.5);
                                p.lineTo(w / 2, st + l * 5.5 + 0.6);
                                p.stroke();
                            }
                            for (let x = -w / 2 + 12; x < w / 2 - 6; x += 9 + r() * 5) {
                                const y = st + 22 - Math.floor(r() * 8) * 2.75;
                                p.fillStyle = '#2b2020';
                                p.beginPath();
                                p.ellipse(x, y, 3, 2, -0.35, 0, TAU);
                                p.fill();
                                p.fillRect(x + 2.4, y - 18, 0.8, 18);
                            }
                        }
                    } else if (kind === 'label') {
                        p.strokeStyle = 'rgba(58,32,22,0.9)';
                        p.lineWidth = 1.2;
                        p.strokeRect(-w / 2 + 5, -h / 2 + 5, w - 10, h - 10);
                        p.lineWidth = 0.45;
                        p.strokeRect(-w / 2 + 8, -h / 2 + 8, w - 16, h - 16);
                        type(p, 'CONSTRUCTOR DE GUITARRAS', 0, -h / 2 + 24, { font: FELL, size: Math.min(9, w / 16), align: 'center', spacing: 0.6, color: '#3a2016' });
                        type(p, 'GRANADA', 0, 4, { font: FELL, size: Math.min(20, w / 6), align: 'center', spacing: 2, color: '#3a2016' });
                        type(p, 'AÑO 1926 · N.º 114', 0, 20, { font: FELL, size: 7, align: 'center', spacing: 0.5, color: '#3a2016' });
                        S.ink(p, S.curve([[-30, h / 2 - 18], [-20, h / 2 - 26], [-8, h / 2 - 16], [6, h / 2 - 24], [20, h / 2 - 18], [34, h / 2 - 22]], false, 6), { w: 1, color: '#5a3520' });
                    }
                    wear(p, { x: -w / 2, y: -h / 2, w, h }, { seed, stock: PAL.news, every: 30 });
                },
            });
        });
    }
    // The tap plate: a clear plate glued on the soundboard, its edge a hair of light, the
    // nails' scratches in it.
    function golpeador(g, pts, o = {}) {
        const r = Motion.rng('go/' + (o.seed ?? 1)), b = S.bbox(pts), [lx, ly] = lightDir(g);
        g.save();
        clip(g, pts);
        fill(g, pts, 'rgba(120,70,20,0.12)');
        const gr = g.createLinearGradient(b.x, b.y, b.x + b.w, b.y + b.h);
        gr.addColorStop(0.2, 'rgba(255,250,232,0)');
        gr.addColorStop(0.35, 'rgba(255,250,232,0.22)');
        gr.addColorStop(0.5, 'rgba(255,250,232,0)');
        g.fillStyle = gr;
        g.fillRect(b.x, b.y, b.w, b.h);
        g.lineCap = 'round';
        for (let i = 0; i < (o.n ?? 80); i++) {
            const x = b.x + r() * b.w, y = b.y + r() * b.h, l = 3 + r() * 12, a = 0.8 + r() * 1.3;
            g.strokeStyle = r() < 0.5 ? `rgba(255,250,230,${(0.14 + r() * 0.2).toFixed(2)})` : `rgba(90,52,20,${(0.12 + r() * 0.18).toFixed(2)})`;
            g.lineWidth = 0.5 + r() * 0.6;
            g.beginPath();
            g.moveTo(x, y);
            g.quadraticCurveTo(x + Math.cos(a) * l * 0.5 + 1, y + Math.sin(a) * l * 0.5, x + Math.cos(a) * l, y + Math.sin(a) * l);
            g.stroke();
        }
        g.restore();
        g.strokeStyle = 'rgba(255,250,232,0.5)';
        g.lineWidth = 1;
        g.beginPath();
        S.trace(g, pts.map(([x, y]) => [x + lx, y + ly]));
        g.stroke();
        g.strokeStyle = 'rgba(70,40,16,0.4)';
        g.beginPath();
        S.trace(g, pts);
        g.stroke();
    }

    return { marble, stencil, hatch, scrap, golpeador, newspaper, label, score, wallpaper, bottle, glass, wing, nail, head, stringSeg, ladder, bridge, rosette, moon, card, blackDisc, bristle, drift, GAUGE, facets, PAL, tone, shadeDir, lightDir, area, centroid, inPoly, split, clip, fill, rect, quad, walk, mark, scumble, edgeFrame, edgeTone, charcoal, ruled, comb, sand, dots, plane, tornEdge, sheetOutline, paper, type, wear };
})();
