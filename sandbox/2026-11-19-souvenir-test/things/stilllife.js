// Picture 4's things: the tenebrist still life of Seville and Granada, in the brush manner
// at its most exact (no contour line: every piece a lit volume painted per pixel, its edge
// broken by the last stroke, its surface saying what it is made of). One hard light from the
// top left (`Souvenir.LIGHT`), black around. Global: Still.
//
// ANATOMY · the real things, and their small true details (all painted below)
//
//   THE WATER SELLER'S JUG (`jug`) · a big cántaro of unglazed Sevillian clay, thrown in
//   two halves: a heavy foot, an egg-shaped belly, two cordons on the shoulder, a short neck
//   with an everted, rolled lip, two strap handles from shoulder to neck.
//     1 throwing rings, closer on the shoulder  2 the clay sweats: the lower belly darker
//     and wet, with a tide line  3 drops beading on the belly and running down in tracks,
//     one hanging from the foot  4 a comb-incised wave between the cordons  5 lime pops and
//     iron specks  6 a chip out of the lip showing the paler body  7 thumb dents and smears
//     where the handles were luted on  8 an esparto cord tied twice round the neck, its
//     ends hanging  9 a hairline crack from the lip  10 the wet ring it leaves on the stone
//
//   THE GLASS WITH A FIG (`glass`) · a blown goblet (foot, knopped stem, bowl), water two
//   thirds up, a fig at the bottom to sweeten it (the water seller's gift).
//     1 nothing of it is drawn but its lights: edges, rim, a window on the lit flank
//     2 what is behind it, seen bent through the water (the ledge, the dark)  3 the fig
//     magnified by the water's lens  4 the meniscus as a bright ring  5 bubbles on the
//     inside wall and on the fig  6 condensation beads outside, below the water line
//     7 the stem's bright core, the knop's glints  8 the foot's ring and its far edge
//     9 the caustic: a bright spot inside its shadow on the stone  10 a seed (bubble) in
//     the glass itself, and a faint greenish tint where it is thick
//
//   THE FIG · a purple-black pear with a short neck, faint ribs from stalk to eye, a
//   powdery bloom, pale lenticels, the eye (ostiole) as a dark ring, a short split showing
//   the red flesh, the stalk's green.
//
//   BÚCAROS (`bucaro`) · small drinking jars of white unglazed clay, burnished: a ring
//   foot, a round belly, a narrow neck, a flared mouth; stamped rosettes and inset white
//   pebbles round the shoulder, incised lines, the burnishing strokes catching the light,
//   a handle on one, a firing blush (grey cloud) on the other.
//
//   PEWTER (`plate`) · a plate of soft grey tin alloy: a broad rim with a cast bead at the
//   edge, the booge stepping down to the well. Dull: it mirrors the room blurred (dark),
//   the lamp's window soft, the lit stone it stands on as a warm band. Knife scratches in
//   the well, a dent on the rim, the touch mark (a crowned rose) on the rim, dark
//   oxidation spots, the bead worn bright.
//
//   STONE (`ledge`, `wall`) · Seville's piedra ostionera and Granada's grey limestone:
//     1 pores and vugs, dark with a lit lower lip  2 fossil shell slivers  3 the front face
//     dressed with a toothed chisel: sets of fine diagonal tracks  4 the top worn smooth,
//     scratched, polished where things are set down  5 chips along the arris, each with a
//     lit and a shaded facet  6 a crack running across  7 the joint between two slabs with
//     its mortar  8 stains: a water ring, oil, soot  9 a mason's mark cut in a face
//     10 ashlar walls: courses, joints, each block a little out of plane, white salt bloom
//     where damp rises, a nail with its rust run, a cobweb in a corner.
//
// API (s = 1 sizes; (x, y) is where the thing stands on its ledge, its foot's centre;
// `ey` is how far below the axis that point is, in the sheet's units (default y): it sets
// how much of a top or a mouth is seen. Sprites are cached by thing, ey, res and seed.)
//   ledge(g, { x0, x1, y, face, d, seed, ... }) → the ledge (top, front, end faces), for
//       `castOn` and `contact`. y is its front top arris.
//   wall(g, box, { open, seed, lamp, d }) → the wall with an opening cut through (`open` a
//       closed polygon about the axis, its reveal `d` deep)
//   jug(g, o)        about 430 × 600     glass(g, o)   about 150 × 245
//   bucaro(g, o)     about 110 × 130     plate(g, o)   r 120 standing, or { flat: true }
//   castOn(g, sp, x, y, s, { clip, kx, ky, alpha, blur }) · contact(g, x, y, rx, ry, a)
const Still = (() => {
    const S = Souvenir;
    const TAU = Math.PI * 2;
    const cache = new Map();
    const memo = (key, fn) => {
        if (!cache.has(key)) cache.set(key, fn());
        return cache.get(key);
    };
    // pixels per unit for a sprite pasted at scale s on g, in half steps
    const resOf = (g, s = 1, k = 1) => Math.min(6, Math.max(0.5, Math.ceil(S.pxScale(g) * s * k * 2 - 1e-6) / 2));
    const canvas = (w, h) => {
        const c = document.createElement('canvas');
        c.width = Math.max(1, Math.ceil(w));
        c.height = Math.max(1, Math.ceil(h));
        return c;
    };
    const clamp = S.clamp, smooth = S.smooth, mix = S.mix, rgba = S.rgba;
    const norm3 = (v) => {
        const l = Math.hypot(v[0], v[1], v[2]) || 1;
        return [v[0] / l, v[1] / l, v[2] / l];
    };
    // the picture's lamp: the house light (top left), more raking, so more of every form
    // is in shade and the dark takes the rest (tenebrism)
    const LT = [-0.72, -0.62, 0.3], LN = norm3(LT);
    const SD = S.SHADE_DIR, TL = [-0.67, -0.74]; // the shadow's way and the lamp's, on the page
    const disc = (g, x, y, r, style) => {
        if (style) g.fillStyle = style;
        g.beginPath();
        g.arc(x, y, Math.max(0.05, r), 0, TAU);
        g.fill();
    };
    const oval = (g, x, y, rx, ry, a, style) => {
        if (style) g.fillStyle = style;
        g.beginPath();
        g.ellipse(x, y, Math.max(0.05, rx), Math.max(0.05, ry), a, 0, TAU);
        g.fill();
    };
    const poly = (g, pts, style) => {
        if (style) g.fillStyle = style;
        g.beginPath();
        S.trace(g, pts);
        g.fill();
    };
    const line = (g, pts, w, style, closed = false) => {
        g.lineWidth = w;
        g.strokeStyle = style;
        g.lineCap = 'round';
        g.lineJoin = 'round';
        g.beginPath();
        S.trace(g, pts, closed);
        g.stroke();
    };
    const toward = (rgb, r, g, b, k) => {
        rgb[0] += (r - rgb[0]) * k;
        rgb[1] += (g - rgb[1]) * k;
        rgb[2] += (b - rgb[2]) * k;
    };
    const scaleRGB = (rgb, kr, kg, kb, k) => {
        rgb[0] *= 1 + (kr - 1) * k;
        rgb[1] *= 1 + (kg - 1) * k;
        rgb[2] *= 1 + (kb - 1) * k;
    };
    // marks laid softly: what `draw` paints goes down through one blur of `blur` units
    const softly = (g, blur, draw, mode = null) => {
        const m = g.getTransform(), c = canvas(g.canvas.width, g.canvas.height), q = c.getContext('2d');
        q.setTransform(m);
        draw(q);
        g.save();
        g.setTransform(1, 0, 0, 1, 0, 0);
        if (mode) g.globalCompositeOperation = mode;
        g.filter = `blur(${Math.max(0.01, blur * Math.hypot(m.a, m.b)).toFixed(2)}px)`;
        g.drawImage(c, 0, 0);
        g.restore();
    };

    // ------------------------------------------------------------------ ramps (dark → light)
    const RAMP = {
        clay: [[0, '#0a0605'], [0.14, '#1c110b'], [0.28, '#3a2516'], [0.42, '#5e4029'], [0.56, '#87623f'], [0.7, '#ad885c'], [0.84, '#cdab7f'], [0.94, '#e4cda6'], [1, '#f4e6c9']],
        white: [[0, '#0d0907'], [0.16, '#261c16'], [0.3, '#4a3b30'], [0.44, '#7a6756'], [0.58, '#a6927c'], [0.72, '#c9b69c'], [0.85, '#e2d3bb'], [0.94, '#f0e6d4'], [1, '#faf5ea']],
        fig: [[0, '#060306'], [0.18, '#120810'], [0.34, '#221020'], [0.5, '#371a32'], [0.64, '#4e2a47'], [0.78, '#6a4862'], [0.9, '#8f7a8c'], [1, '#c4bcc6']],
        stone: [[0, '#050403'], [0.1, '#0e0b08'], [0.22, '#211a13'], [0.36, '#3f3427'], [0.5, '#665744'], [0.64, '#8f7c63'], [0.78, '#b6a080'], [0.9, '#d2bd9a'], [1, '#e9d8b8']],
    };

    // ------------------------------------------------------------------ the pixel painter
    // A piece painted pixel by pixel: `mask(g)` fills its silhouette (the red channel may
    // carry a face index), `color(x, y, rgb, red)` sets each pixel's colour in units and may
    // return an alpha factor. Then `over(g)` paints on it, clipped to it.
    function pixels(o) {
        const { box, res } = o;
        const w = Math.max(2, Math.ceil(box.w * res)), h = Math.max(2, Math.ceil(box.h * res));
        const c = canvas(w, h), g = c.getContext('2d', { willReadFrequently: true });
        g.setTransform(res, 0, 0, res, -box.x * res, -box.y * res);
        g.fillStyle = '#fff';
        o.mask(g);
        const img = g.getImageData(0, 0, w, h), d = img.data, rgb = [0, 0, 0];
        for (let y = 0, i = 0; y < h; y++) {
            for (let x = 0; x < w; x++, i += 4) {
                if (!d[i + 3]) continue;
                const ux = box.x + (x + 0.5) / res, uy = box.y + (y + 0.5) / res;
                const a = o.color(ux, uy, rgb, d[i]);
                d[i] = rgb[0];
                d[i + 1] = rgb[1];
                d[i + 2] = rgb[2];
                if (a !== undefined) d[i + 3] *= clamp(a);
            }
        }
        g.putImageData(img, 0, 0);
        if (o.over) {
            g.globalCompositeOperation = 'source-atop';
            o.over(g);
            g.globalCompositeOperation = 'source-over';
        }
        return { canvas: c, box, res };
    }
    // details painted onto a finished sprite, clipped to it
    const onto = (sp, fn) => {
        const g = sp.canvas.getContext('2d'), res = sp.canvas.width / sp.box.w;
        g.save();
        g.setTransform(res, 0, 0, res, -sp.box.x * res, -sp.box.y * res);
        g.globalCompositeOperation = 'source-atop';
        fn(g, res);
        g.restore();
    };
    const put = (g, sp, x, y, s = 1, o = {}) => S.put(g, sp, { x, y, s, ...o });

    // ------------------------------------------------------------------ shadows
    // A sprite's silhouette, blurred and kept (blur in units).
    function shadowOf(sp, blur = 5) {
        sp.sh = sp.sh || {};
        if (!sp.sh[blur]) {
            const r0 = sp.canvas.width / sp.box.w, rs = Math.min(r0, Math.max(0.25, 3 / Math.max(0.5, blur)));
            const pad = blur * 2.2 + 2;
            const c = canvas((sp.box.w + pad * 2) * rs, (sp.box.h + pad * 2) * rs), q = c.getContext('2d');
            q.filter = `blur(${(blur * rs).toFixed(2)}px)`;
            q.drawImage(sp.canvas, pad * rs, pad * rs, sp.box.w * rs, sp.box.h * rs);
            q.filter = 'none';
            q.globalCompositeOperation = 'source-in';
            q.fillStyle = '#000';
            q.fillRect(0, 0, c.width, c.height);
            sp.sh[blur] = { canvas: c, box: { x: sp.box.x - pad, y: sp.box.y - pad, w: c.width / rs, h: c.height / rs } };
        }
        return sp.sh[blur];
    }
    // The shadow a standing thing throws on the ledge under it: its silhouette laid down
    // along the light (to the right, and back into the ledge, which is up on the page), sharp
    // near the foot and soft far from it; only on paint already there, inside `clip`.
    //   (x, y): where its foot stands;  kx: how far right per unit of height;  ky: how far
    //   back (the ledge top is foreshortened, so little)
    function castOn(g, sp, x, y, s = 1, o = {}) {
        const kx = o.kx ?? 0.82, ky = o.ky ?? Math.max(0.035, (0.5 * Math.abs(y)) / 1000);
        for (const [blur, a] of [[o.blur ?? 7, 0.55], [1.2, 0.5]]) {
            const sh = shadowOf(sp, blur);
            g.save();
            if (o.clip) {
                g.beginPath();
                S.trace(g, o.clip);
                g.clip();
            }
            g.globalCompositeOperation = 'source-atop';
            g.globalAlpha = (o.alpha ?? 0.78) * a;
            g.transform(s, 0, -s * kx, s * ky, x, y);
            g.drawImage(sh.canvas, sh.box.x, sh.box.y, sh.box.w, sh.box.h);
            g.restore();
        }
        // the sharp one is only sharp near the foot: soften its far end with the soft one again
    }
    // the shadow on the wall behind: the silhouette moved down and right, soft
    function castWall(g, sp, x, y, s = 1, o = {}) {
        const sh = shadowOf(sp, o.blur ?? 14);
        g.save();
        if (o.clip) {
            g.beginPath();
            S.trace(g, o.clip);
            g.clip();
        }
        g.globalCompositeOperation = 'source-atop';
        g.globalAlpha = o.alpha ?? 0.6;
        g.translate(x + (o.dx ?? 40) * s, y + (o.dy ?? 30) * s);
        g.scale(s, s);
        g.drawImage(sh.canvas, sh.box.x, sh.box.y, sh.box.w, sh.box.h);
        g.restore();
    }
    // the dark where a thing touches what it stands on
    function contact(g, x, y, rx, ry, a = 0.8) {
        g.save();
        g.globalCompositeOperation = 'source-atop';
        g.translate(x, y);
        g.scale(1, ry / rx);
        const gr = g.createRadialGradient(0, 0, 0, 0, 0, rx);
        gr.addColorStop(0, `rgba(4,2,1,${a})`);
        gr.addColorStop(0.6, `rgba(4,2,1,${a * 0.6})`);
        gr.addColorStop(1, 'rgba(4,2,1,0)');
        g.fillStyle = gr;
        g.fillRect(-rx, -rx, rx * 2, rx * 2);
        g.restore();
    }

    // ------------------------------------------------------------------ water
    // A drop on a surface: a lens, dark towards the lamp and bright on its far side, with a
    // point of light and a small shadow. `dark` is the colour of the surface under it.
    function drop(g, x, y, r, o = {}) {
        const ry = r * (o.sq ?? 1.12), dk = o.dark ?? [40, 22, 12], lt = o.lit ?? [250, 236, 210];
        const c = (k, a) => `rgba(${dk.map((v, i) => Math.round(v + (lt[i] - v) * k)).join(',')},${a})`;
        // its little shadow, down and right
        oval(g, x + SD[0] * r * 0.45, y + SD[1] * r * 0.5, r * 0.95, ry * 0.95, 0, `rgba(${dk.map((v) => Math.round(v * 0.35)).join(',')},0.35)`);
        // the body: the surface seen through it, darker towards the lamp, the light it gathers
        // pooled on its far side
        const gr = g.createRadialGradient(x + SD[0] * r * 0.38, y + SD[1] * r * 0.42, r * 0.05, x - SD[0] * r * 0.2, y - SD[1] * r * 0.2, r * 1.05);
        gr.addColorStop(0, c(0.75, 0.9));
        gr.addColorStop(0.4, c(0.3, 0.75));
        gr.addColorStop(1, c(0, 0.85));
        oval(g, x, y, r, ry, 0, gr);
        // the rim towards the lamp, darkest
        g.lineWidth = Math.max(0.12, r * 0.16);
        g.strokeStyle = `rgba(${dk.map((v) => Math.round(v * 0.45)).join(',')},0.65)`;
        g.beginPath();
        g.ellipse(x, y, r * 0.94, ry * 0.94, 0, Math.PI * 0.95, Math.PI * 1.8);
        g.stroke();
        // the lamp in it: a point, and on big drops a second, smaller glint below
        disc(g, x + TL[0] * r * 0.4, y + TL[1] * r * 0.42, Math.max(0.16, r * 0.22), 'rgba(255,253,244,0.97)');
        if (r > 1.6) disc(g, x + SD[0] * r * 0.45, y + SD[1] * r * 0.5, r * 0.1, c(1, 0.7));
    }
    // A drop that has run down: its wet track (darker, a thin sheen on the lit edge), beads
    // left on the way, the drop at its foot.  pts: from top to bottom
    function run(g, pts, w, o = {}) {
        const c = S.curve(pts, false, 8), r = Motion.rng('run' + Math.round(pts[0][0] * 7 + pts[0][1] * 3));
        // the wet track: darker, soft-edged, narrowing up to where the drop started
        softly(g, w * 0.7, (q) => S.ink(q, c, { w: w * 1.8, color: o.wet ?? '#8a6a58', alpha: o.wa ?? 0.85, taper: [1, 0.15] }), 'multiply');
        // its sheen, broken, on the lit edge
        let i = 0;
        while (i < c.length - 2) {
            const n = 2 + Math.floor(r() * 5), seg = c.slice(i, Math.min(c.length, i + n));
            if (seg.length > 1 && r() < 0.5) S.ink(g, seg.map(([x, y]) => [x - w * 0.4, y]), { w: Math.max(0.3, w * 0.2), color: o.sheen ?? '#fff1d8', alpha: 0.2 + r() * 0.25, taper: [0.6, 0.6] });
            i += n + Math.floor(r() * 3);
        }
        const end = c[c.length - 1];
        drop(g, end[0], end[1] + w * 0.5, w * 0.9, { ...o, sq: 1.3 });
        if (o.beads) for (const u of o.beads) {
            const p = c[Math.floor(u * (c.length - 1))];
            drop(g, p[0], p[1], w * 0.5, o);
        }
    }

    // ------------------------------------------------------------------ cord
    // An esparto or hemp cord: two strands twisted, each turn a lit and a shaded bead.
    function cord(g, pts, w = 3, o = {}) {
        const c = S.curve(pts, false, 10), col = o.color ?? [168, 132, 82];
        const D = [0];
        for (let i = 1; i < c.length; i++) D.push(D[i - 1] + Math.hypot(c[i][0] - c[i - 1][0], c[i][1] - c[i - 1][1]));
        line(g, c, w + 0.6, `rgba(${col.map((v) => Math.round(v * 0.25)).join(',')},0.9)`);
        line(g, c, w, `rgb(${col.map((v) => Math.round(v * 0.6)).join(',')})`);
        const step = w * 0.9, r = Motion.rng('cord' + (o.seed ?? 0));
        let next = 0;
        for (let i = 1; i < c.length; i++) {
            while (D[i] > next) {
                const k = (next - D[i - 1]) / (D[i] - D[i - 1] || 1), x = c[i - 1][0] + (c[i][0] - c[i - 1][0]) * k, y = c[i - 1][1] + (c[i][1] - c[i - 1][1]) * k;
                const tx = (c[i][0] - c[i - 1][0]) / (D[i] - D[i - 1] || 1), ty = (c[i][1] - c[i - 1][1]) / (D[i] - D[i - 1] || 1), nx = -ty, ny = tx;
                // one strand's turn: a slanted bead across the cord
                const a = [x - nx * w * 0.48 - tx * w * 0.3, y - ny * w * 0.48 - ty * w * 0.3], b = [x + nx * w * 0.48 + tx * w * 0.3, y + ny * w * 0.48 + ty * w * 0.3];
                const lit = clamp(0.5 - 0.5 * (nx * TL[0] + ny * TL[1]));
                line(g, [a, b], w * 0.46, `rgba(${col.map((v) => Math.round(Math.min(255, v * (0.9 + 0.5 * lit)))).join(',')},0.9)`);
                line(g, [[a[0] + tx * w * 0.2 - nx * 0.2, a[1] + ty * w * 0.2], [b[0] + tx * w * 0.2, b[1] + ty * w * 0.2]], w * 0.12, `rgba(${col.map((v) => Math.round(v * 0.3)).join(',')},0.6)`);
                if (r() < 0.25) line(g, [[x + nx * w * 0.5, y + ny * w * 0.5], [x + nx * w * (0.9 + r()), y + ny * w * (0.9 + r()) + 1]], 0.3, `rgba(${col.join(',')},0.6)`);
                next += step;
            }
        }
    }

    // ------------------------------------------------------------------ stone
    // A stone surface made of flat faces, painted per pixel: faces: [{ pts, n: [nx, ny, nz]
    // or (x, y) => n, k }]; bump(x, y, face) → height in units (pores, tooling); lamp(x, y)
    // how much of the light reaches there; alb(x, y, face) → [r, g, b] factors.
    function stone(o) {
        const faces = o.faces, R = S.rampFn(o.ramp ?? RAMP.stone, o.soft ?? 0.95), bump = o.bump ?? (() => 0), amb = o.amb ?? 0.035;
        const sd = S.seedOf(o.seed ?? 1), { box, res } = o;
        const w = Math.max(2, Math.ceil(box.w * res)), h = Math.max(2, Math.ceil(box.h * res));
        const c = canvas(w, h), g = c.getContext('2d', { willReadFrequently: true });
        g.setTransform(res, 0, 0, res, -box.x * res, -box.y * res);
        faces.forEach((f, i) => poly(g, f.pts, `rgb(${(i + 1) * 4},0,0)`));
        if (o.cut) {
            g.save();
            g.globalCompositeOperation = 'destination-out';
            o.cut(g);
            g.restore();
        }
        const img = g.getImageData(0, 0, w, h), d = img.data, rgb = [0, 0, 0];
        // one height sample per pixel; the slope from the neighbours
        const H = new Float32Array(w * h), F = new Int16Array(w * h).fill(-1);
        for (let y = 0, i = 0; y < h; y++) {
            for (let x = 0; x < w; x++, i++) {
                if (!d[i * 4 + 3]) continue;
                const fi = Math.max(0, Math.min(faces.length - 1, Math.round(d[i * 4] / 4) - 1));
                F[i] = fi;
                H[i] = bump(box.x + (x + 0.5) / res, box.y + (y + 0.5) / res, faces[fi]);
            }
        }
        const bk = o.bk ?? 1;
        for (let y = 0, i = 0; y < h; y++) {
            for (let x = 0; x < w; x++, i++) {
                if (F[i] < 0) continue;
                const f = faces[F[i]], ux = box.x + (x + 0.5) / res, uy = box.y + (y + 0.5) / res;
                const n0 = typeof f.n === 'function' ? f.n(ux, uy) : f.n;
                const xl = x > 0 && F[i - 1] === F[i] ? i - 1 : i, xr = x < w - 1 && F[i + 1] === F[i] ? i + 1 : i;
                const yu = y > 0 && F[i - w] === F[i] ? i - w : i, yd = y < h - 1 && F[i + w] === F[i] ? i + w : i;
                const gx = ((H[xr] - H[xl]) * res) / Math.max(1, xr - xl), gy = ((H[yd] - H[yu]) * res) / Math.max(1, (yd - yu) / w);
                const h0 = H[i];
                const n = norm3([n0[0] - gx * bk, n0[1] - gy * bk * (1 - Math.abs(n0[1])), n0[2] + gy * bk * n0[1] * 0.6]);
                const lam = n[0] * LN[0] + n[1] * LN[1] + n[2] * LN[2];
                const lit = Math.max(0, lam) * (o.lamp ? o.lamp(ux, uy, f) : 1) * (f.k ?? 1);
                let tone = amb + lit * (o.gain ?? 1.05) + Math.max(0, -lam) * (o.bounce ?? 0.04);
                tone += (o.mottle ?? 0.05) * (S.noise2(ux * 0.011, uy * 0.011, sd) * 0.6 + (o.fast ? 0 : S.noise2(ux * 0.05, uy * 0.05, sd + 1) * 0.4)) * (0.4 + lit);
                tone += h0 * (o.cavity ?? 0.03) * (0.3 + lit);
                R(clamp(tone), rgb);
                if (o.alb) {
                    const a = o.alb(ux, uy, f, tone);
                    rgb[0] *= a[0];
                    rgb[1] *= a[1];
                    rgb[2] *= a[2];
                }
                if (o.tint) o.tint(ux, uy, tone, rgb, f, lit);
                d[i * 4] = rgb[0];
                d[i * 4 + 1] = rgb[1];
                d[i * 4 + 2] = rgb[2];
            }
        }
        g.putImageData(img, 0, 0);
        if (o.over) {
            g.globalCompositeOperation = 'source-atop';
            o.over(g);
            g.globalCompositeOperation = 'source-over';
        }
        return { canvas: c, box, res };
    }
    // pores, vugs and grain of a calcarenite, in units of height
    const grain = (x, y, sd, k = 1, fast = false) => {
        let h = 0.35 * S.noise2(x * 0.09, y * 0.09, sd) + 0.22 * S.noise2(x * 0.31, y * 0.31, sd + 1) + (fast ? 0.12 * (S.hashI(Math.floor(x), Math.floor(y), 9, sd) - 0.5) : 0.12 * S.noise2(x * 0.9, y * 0.9, sd + 2));
        // pores: cells of 7 units, a few hollow
        const cx = Math.floor(x / 7), cy = Math.floor(y / 7), hp = S.hashI(cx, cy, 5, sd);
        if (hp < 0.07 * k) {
            const px = (cx + 0.2 + S.hashI(cx, cy, 6, sd) * 0.6) * 7, py = (cy + 0.2 + S.hashI(cx, cy, 7, sd) * 0.6) * 7, pr = 0.5 + Math.pow(hp / (0.07 * k), 2) * 2.6;
            const d = Math.hypot(x - px, (y - py) * 1.2);
            if (d < pr) h -= 1.6 * (1 - (d / pr) * (d / pr));
        }
        return h;
    };
    // toothed-chisel tracks: sets of parallel fine grooves, each set at its own slant
    const tooling = (x, y, sd, size = 46) => {
        // a mason's dressing: the face worked in bands, each band struck with a toothed
        // chisel at its own slant, the tracks straight and parallel, a band's blows ending
        // raggedly where the next begins
        const band = Math.floor((x + 6 * S.noise2(y * 0.03, 0, sd + 7)) / size), hb = S.hashI(band, 0, 3, sd);
        const a = -1.05 + (hb - 0.5) * 0.35, ca = Math.cos(a), sa = Math.sin(a);
        const u = x * ca + y * sa, v = -x * sa + y * ca;
        const t = Math.abs(((u / 2.6) % 1 + 1) % 1 - 0.5) * 2;
        const blow = Math.floor(v / 14 + hb * 5), on = S.hashI(blow, band, 4, sd) < 0.75 ? 1 : 0.3;
        return -0.42 * (1 - t) * (1 - t) * on * (0.7 + 0.3 * S.noise2(u * 0.2, v * 0.05, sd + 4));
    };

    // A ledge: a slab of stone running from x0 to x1, its front top arris at y, `face` tall,
    // `d` deep (its top, or its underside, is seen foreshortened as the camera on the axis
    // sees it from 1000 away; so is the end face nearer the axis).
    //   chips: how many bites out of the arrises;  joint: x of a joint between two slabs
    //   lamp(x, y): the light across it;  mark: draw a mason's mark;  ring: [x, rx] a wet ring
    // Returns { top, front, under, end, y, k } in the caller's units: clip polygons for shadows.
    function ledgeGeom(o) {
        const D = 1000, d = o.d ?? 130, k = D / (D + d), y = o.y, yb = y + (o.face ?? 70);
        const x0 = o.x0, x1 = o.x1, G = { y, yb, k, x0, x1 };
        G.front = [[x0, y], [x1, y], [x1, yb], [x0, yb]];
        G.top = y > 0 ? [[x0 * k, y * k], [x1 * k, y * k], [x1, y], [x0, y]] : null;
        G.under = yb < 0 ? [[x0, yb], [x1, yb], [x1 * k, yb * k], [x0 * k, yb * k]] : null;
        // the end face that the camera sees: the one nearer the axis
        if (x1 < -10) G.end = { pts: [[x1, y], [x1 * k, y * k], [x1 * k, yb * k], [x1, yb]], n: [1, 0, 0] };
        else if (x0 > 10) G.end = { pts: [[x0 * k, y * k], [x0, y], [x0, yb], [x0 * k, yb * k]], n: [-1, 0, 0] };
        return G;
    }
    function ledge(g, o) {
        const G = ledgeGeom(o), sd = S.seedOf('ledge' + (o.seed ?? 0)), r = Motion.rng('ledge' + (o.seed ?? 0));
        const res = resOf(g, 1, o.q ?? 1);
        const pts = [...G.front, ...(G.top ?? []), ...(G.under ?? []), ...(G.end ? G.end.pts : [])];
        const box = S.bbox(pts, 6);
        // the arrises are not straight: worn, a unit of wander
        const wob = (p, i) => [p[0], p[1] + 0.9 * S.noise2(p[0] * 0.03, i, sd)];
        const densify = (a, b, n) => Array.from({ length: n + 1 }, (_, i) => [a[0] + ((b[0] - a[0]) * i) / n, a[1] + ((b[1] - a[1]) * i) / n]);
        const n = Math.max(4, Math.ceil(Math.abs(G.x1 - G.x0) / 12));
        const frontTop = densify([G.x0, G.y], [G.x1, G.y], n).map(wob), frontBot = densify([G.x1, G.yb], [G.x0, G.yb], n).map((p, i) => wob(p, i + 40));
        const faces = [];
        if (G.top) faces.push({ pts: [[G.x0 * G.k, G.y * G.k], [G.x1 * G.k, G.y * G.k], ...frontTop.slice().reverse()], n: [0, -1, 0], kind: 'top', k: 1 });
        if (G.under) faces.push({ pts: [...frontBot.slice().reverse(), [G.x1 * G.k, G.yb * G.k], [G.x0 * G.k, G.yb * G.k]].reverse(), n: [0, 1, 0], kind: 'under', k: 1 });
        faces.push({ pts: [...frontTop, ...frontBot], n: [0, 0.06, 1], kind: 'front', k: 1 });
        if (G.end) faces.push({ pts: G.end.pts, n: G.end.n, kind: 'end', k: 1 });
        // chips along the arrises
        const chips = [];
        for (let i = 0; i < (o.chips ?? 5); i++) {
            const onTop = r() < 0.65, x = G.x0 + (0.04 + r() * 0.92) * (G.x1 - G.x0);
            chips.push({ x, y: onTop ? G.y : G.yb, r: 3 + r() * r() * 11, a: r() * TAU, top: onTop });
        }
        if (G.end) chips.push({ x: G.x1 < 0 ? G.x1 : G.x0, y: G.y, r: 9 + r() * 6, a: 0, top: true, corner: true });
        const lamp0 = o.lamp ?? (() => 1);
        // on the top, the light dies towards the back of the ledge, into the dark
        const lamp = (x, y, f) => lamp0(x, y) * (f && f.kind === 'top' ? 0.55 + 0.45 * smooth(G.y * G.k, G.y, y) : 1);
        const sp = stone({
            box, res, faces, seed: 'ledge' + o.seed, ramp: o.ramp ?? RAMP.stone, lamp, gain: o.gain ?? 1.1,
            bump: (x, y, f) => {
                let h = grain(x, y, sd);
                if (f.kind === 'front') h += tooling(x, y, sd);
                if (f.kind === 'top') h *= 0.5; // worn smooth
                for (const c of chips) {
                    const dx = x - c.x, dy = (y - c.y) * (f.kind === 'top' ? 2.2 : 1), dd = Math.hypot(dx, dy);
                    if (dd < c.r) h -= 3 * (1 - dd / c.r) * (0.7 + 0.3 * Math.cos(Math.atan2(dy, dx) * 3 + c.a));
                }
                return h;
            },
            bk: 0.9, cavity: 0.06,
            alb: (x, y, f) => {
                // the stone is not one colour: beds of warmer and greyer, darker where damp
                const w = S.noise2(x * 0.004, y * 0.02, sd + 9), q = S.noise2(x * 0.02, y * 0.02, sd + 10);
                return [1 + 0.07 * w, 1 + 0.02 * w, 1 - 0.08 * w + 0.03 * q];
            },
            tint: (x, y, tone, rgb, f) => {
                if (o.ring && f.kind === 'top') {
                    // the wet ring a jug left: a darker ellipse, darkest at its edge
                    const [rx0, rr] = o.ring, ry = Math.max(4, Math.abs(G.y - G.y * G.k) * 0.55);
                    const q = Math.hypot((x - rx0) / rr, (y - (G.y * (1 + G.k)) / 2) / ry);
                    const kk = smooth(1.08, 0.9, q) * (0.45 + 0.35 * smooth(0.7, 0.98, q));
                    scaleRGB(rgb, 0.62, 0.58, 0.6, kk);
                }
                if (f.kind === 'under') scaleRGB(rgb, 0.85, 0.85, 1.05, 1);
                if (f.kind === 'top') {
                    // grime and wear: darker towards the back, polished pale where things are
                    // set down and taken up, a few dark stains
                    const wear = smooth(0.2, 0.7, S.noise2(x * 0.012, y * 0.05, sd + 20)) * 0.12;
                    toward(rgb, rgb[0] * 1.1 + 10, rgb[1] * 1.1 + 8, rgb[2] * 1.08 + 6, wear);
                    const stain = smooth(0.45, 0.75, S.noise2(x * 0.02, y * 0.06, sd + 21)) * 0.3;
                    scaleRGB(rgb, 0.75, 0.7, 0.68, stain);
                }
            },
            over: (q) => {
                // fossil shell slivers and vugs (piedra ostionera)
                const rr = Motion.rng('shells' + o.seed), area = Math.abs(G.x1 - G.x0) * (G.yb - G.y);
                for (let i = 0; i < area / 260; i++) {
                    const x = G.x0 + rr() * (G.x1 - G.x0), y = G.y + 2 + rr() * (G.yb - G.y - 4), a = rr() * TAU, l = 2 + rr() * rr() * 9, bend = (rr() - 0.5) * 1.4;
                    const lit = lamp(x, y);
                    const arc = [];
                    for (let k = 0; k <= 6; k++) {
                        const u = k / 6 - 0.5;
                        arc.push([x + Math.cos(a) * u * l - Math.sin(a) * bend * l * (0.25 - u * u), y + Math.sin(a) * u * l + Math.cos(a) * bend * l * (0.25 - u * u)]);
                    }
                    if (rr() < 0.6) {
                        S.ink(q, arc.map(([px, py]) => [px + 0.5, py + 0.6]), { w: 0.7 + rr() * 0.6, color: '#1a120b', alpha: 0.5 * lit, taper: [0.6, 0.6] });
                        S.ink(q, arc, { w: 0.6 + rr() * 0.7, color: rr() < 0.5 ? '#efe2c4' : '#d8c6a4', alpha: (0.35 + rr() * 0.4) * lit, taper: [0.6, 0.6] });
                    } else {
                        // a vug: a dark hole with a lit lower lip
                        const pr = 0.6 + rr() * rr() * 2.6;
                        oval(q, x, y, pr * 1.2, pr, a, `rgba(12,8,5,${0.7 * Math.max(0.3, lit)})`);
                        q.strokeStyle = `rgba(232,214,180,${0.5 * lit})`;
                        q.lineWidth = 0.45;
                        q.beginPath();
                        q.ellipse(x, y, pr * 1.2, pr, 0, 0.2, Math.PI - 0.2);
                        q.stroke();
                    }
                }
                // chips: a broken facet lit at its top left, dark at its bottom right
                for (const c of chips) {
                    const lit = lamp(c.x, c.y), pts = [];
                    for (let k = 0; k < 9; k++) {
                        const a = (k / 9) * TAU, rad = c.r * (0.65 + 0.35 * S.hashI(k, Math.round(c.x), 3, sd));
                        pts.push([c.x + Math.cos(a) * rad, c.y + Math.sin(a) * rad * (c.top ? 0.55 : 0.8)]);
                    }
                    poly(q, pts, `rgba(20,14,9,${0.55 * Math.max(0.4, lit)})`);
                    poly(q, pts.map(([px, py]) => [px * 0.75 + c.x * 0.25 - 0.8, py * 0.75 + c.y * 0.25 - 0.8]), `rgba(222,204,170,${0.5 * lit})`);
                    poly(q, pts.slice(1, 5).concat([[c.x, c.y]]).map(([px, py]) => [px * 0.8 + c.x * 0.2, py * 0.8 + c.y * 0.2]), `rgba(10,7,4,${0.4 * Math.max(0.5, lit)})`);
                }
                // scratches on the worn top, and a crack across the front
                if (G.top) {
                    for (let i = 0; i < Math.abs(G.x1 - G.x0) / 22; i++) {
                        const x = G.x0 + rr() * (G.x1 - G.x0), y = G.y * G.k + rr() * (G.y - G.y * G.k), l = 3 + rr() * 14, a = (rr() - 0.5) * 0.5;
                        S.ink(q, [[x, y], [x + Math.cos(a) * l, y + Math.sin(a) * l * 0.3]], { w: 0.4, color: rr() < 0.5 ? '#f2e4c6' : '#2a1f14', alpha: 0.3 * lamp(x, y) });
                    }
                }
                {
                    const x = G.x0 + (0.2 + rr() * 0.6) * (G.x1 - G.x0), pts = [[x, G.y]];
                    for (let k = 1; k <= 6; k++) pts.push([x + (rr() - 0.5) * 8 + k * (rr() - 0.4) * 2, G.y + ((G.yb - G.y) * k) / 6]);
                    S.ink(q, pts.map(([px, py]) => [px + 0.6, py]), { w: 0.7, color: '#e0cca6', alpha: 0.3 * lamp(x, G.y), taper: [0.2, 1] });
                    S.ink(q, pts, { w: 0.9, color: '#120c07', alpha: 0.7, taper: [0.2, 1] });
                }
                if (o.joint != null) {
                    // the joint with the next slab: mortar, a lump of it squeezed out
                    const x = o.joint;
                    poly(q, [[x - 2.4, G.y - 0.5], [x + 2.4, G.y - 0.5], [x + 2.1, G.yb], [x - 2.6, G.yb]], 'rgba(150,136,112,0.85)');
                    S.ink(q, [[x - 2.4, G.y], [x - 2.6, G.yb]], { w: 0.9, color: '#140e08', alpha: 0.8 });
                    S.ink(q, [[x + 2.4, G.y], [x + 2.1, G.yb]], { w: 0.6, color: '#e6d6b6', alpha: 0.4 * lamp(x, G.y) });
                    for (let k = 0; k < 18; k++) disc(q, x + (rr() - 0.5) * 4, G.y + rr() * (G.yb - G.y), 0.4 + rr() * 0.4, rr() < 0.5 ? 'rgba(60,50,40,0.6)' : 'rgba(210,198,176,0.5)');
                }
                if (o.mark) {
                    // a mason's mark, cut in the face: an arrow with a crossbar
                    const [mx, my] = o.mark, cut = (pts) => {
                        S.ink(q, pts.map(([px, py]) => [px + 0.7, py + 0.7]), { w: 1.4, color: '#e2cfa8', alpha: 0.4 * lamp(mx, my) });
                        S.ink(q, pts, { w: 1.3, color: '#160f08', alpha: 0.8 });
                    };
                    cut([[mx, my + 11], [mx, my - 11]]);
                    cut([[mx - 6, my - 4], [mx, my - 11], [mx + 6, my - 4]]);
                    cut([[mx - 5, my + 5], [mx + 5, my + 5]]);
                }
                if (o.over) o.over(q, G);
            },
        });
        put(g, sp, 0, 0, 1);
        return G;
    }

    // An ashlar wall with an opening cut through it: `open` a closed polygon about the axis
    // (its front edge); the reveal runs back `d` and is seen as a band inside the edge, lit
    // where it faces the lamp (the right jamb, the sill), dark where it turns away.
    //   o.lamp(x, y) the light across the wall (most of it is dark: the beam falls on the
    //   things and the ledges, not on the wall behind them)
    function ashlar(seed, box, o = {}) {
        const r = Motion.rng('ashlar' + seed), rows = [];
        let y = box.y - r() * 70;
        while (y < box.y + box.h) {
            const h = (o.course ?? 104) * (0.86 + r() * 0.3), xs = [];
            let x = box.x - r() * 220;
            while (x < box.x + box.w + 10) {
                xs.push(x);
                x += (o.block ?? 230) * (0.7 + r() * 0.65);
            }
            xs.push(x);
            rows.push({ y0: y, y1: y + h, xs, tilt: xs.map(() => [(r() - 0.5) * 0.09, (r() - 0.5) * 0.07, 0.8 + r() * 0.35, r()]) });
            y += h;
        }
        const sdw = S.seedOf('ashlarw' + seed);
        return (px0, py0) => {
            // joints laid by hand: a few units of wander
            // (sines, not noise: this runs for every pixel of a wall)
            const x = px0 + 3.2 * Math.sin(py0 * 0.031 + sdw % 7) + 1.8 * Math.sin(py0 * 0.083 + px0 * 0.004), y = py0 + 2.4 * Math.sin(px0 * 0.027 + sdw % 5) + 1.2 * Math.sin(px0 * 0.091 + py0 * 0.003);
            let lo = 0, hi = rows.length - 1;
            while (lo < hi) {
                const m = (lo + hi + 1) >> 1;
                if (rows[m].y0 <= y) lo = m;
                else hi = m - 1;
            }
            const row = rows[lo];
            let i = 0;
            while (i < row.xs.length - 2 && row.xs[i + 1] <= x) i++;
            const x0 = row.xs[i], x1 = row.xs[i + 1];
            const dj = Math.min(x - x0, x1 - x, y - row.y0, row.y1 - y);
            return { dj, cx: (x0 + x1) / 2, cy: (row.y0 + row.y1) / 2, t: row.tilt[i], id: lo * 97 + i };
        };
    }
    function wall(g, box, o = {}) {
        const sd = S.seedOf('wall' + (o.seed ?? 0)), D = 1000, d = o.d ?? 160, k = D / (D + d);
        const res = resOf(g, 1, o.q ?? 1);
        const blocks = ashlar(o.seed ?? 0, box, o);
        const faces = [];
        const outer = [[box.x, box.y], [box.x + box.w, box.y], [box.x + box.w, box.y + box.h], [box.x, box.y + box.h]];
        const open = o.open;
        // the wall face: everything but the opening (drawn as one face, the hole by evenodd)
        faces.push({ pts: outer, n: [0, 0, 1], kind: 'face', hole: open });
        // the reveal: one face per edge of the opening, facing the axis
        if (open) {
            for (let i = 0; i < open.length; i++) {
                const p = open[i], q = open[(i + 1) % open.length];
                const ex = q[0] - p[0], ey = q[1] - p[1], el = Math.hypot(ex, ey) || 1;
                // outward normal (away from the axis) of this edge, for a polygon in either order
                let nx = ey / el, ny = -ex / el;
                const mx = (p[0] + q[0]) / 2, my = (p[1] + q[1]) / 2;
                if (nx * mx + ny * my < 0) {
                    nx = -nx;
                    ny = -ny;
                }
                faces.push({ pts: [p, q, [q[0] * k, q[1] * k], [p[0] * k, p[1] * k]], n: [-nx, -ny, 0.02], kind: 'reveal' });
            }
        }
        const lamp = o.lamp ?? (() => 0.3);
        const sp = stone({
            box, res, faces, seed: 'wall' + o.seed, ramp: o.ramp ?? RAMP.stone, lamp, amb: o.amb ?? 0.05, gain: 1, mottle: 0.07, bk: 1.2, cavity: 0.05, fast: true,
            bump: (x, y, f) => {
                let h = grain(x, y, sd, 1.4, true);
                if (f.kind === 'face') {
                    const b = blocks(x, y);
                    h += (b.t[0] * (x - b.cx) + b.t[1] * (y - b.cy)) * 0.4;
                    h -= 2.2 * smooth(4.5, 0.5, b.dj) * (0.75 + 0.25 * Math.sin(x * 0.13 + y * 0.07)) + 1.0 * smooth(12, 3, b.dj); // joint, and the arris worn round
                } else h += tooling(x * 1.3, y, sd + 50, 30);
                return h;
            },
            alb: (x, y, f, tone) => {
                if (f.kind !== 'face') return [1, 1, 1];
                const b = blocks(x, y), j = smooth(4, 1, b.dj);
                // each block its own stone, the mortar paler and greyer
                const v = b.t[2];
                return [v * (1 - 0.1 * j) + 0.25 * j, v * (1 - 0.1 * j) + 0.25 * j, v * (1 + 0.04 * (b.t[3] - 0.5)) + 0.28 * j];
            },
            tint: (x, y, tone, rgb, f) => {
                if (o.salt && f.kind === 'face') {
                    // salt bloom where damp rises from below: a white crust in a tide line
                    const s = o.salt, q = (y - s.y) / s.h + 0.3 * S.noise2(x * 0.006, 0, sd + 4) + 0.08 * S.noise2(x * 0.03, y * 0.03, sd + 5);
                    const tide = smooth(-0.25, 0, q) * smooth(0.45, 0.05, q), crust = tide * (0.5 + 0.5 * smooth(-0.2, 0.5, S.noise2(x * 0.04, y * 0.06, sd + 6))) * s.a;
                    toward(rgb, rgb[0] * 1.6 + 26, rgb[1] * 1.6 + 25, rgb[2] * 1.6 + 24, crust * 0.5);
                    if (q > 0.05) scaleRGB(rgb, 0.8, 0.82, 0.9, smooth(0.05, 0.6, q) * 0.5);
                }
            },
            // the opening itself is cut (behind the reveal: nothing)
            cut: open ? (q) => poly(q, open.map(([x, y]) => [x * k, y * k]), '#000') : null,
            over: (q) => {
                const rr = Motion.rng('wallover' + o.seed);
                // pores and shell bits on the faces that catch any light
                for (let i = 0; i < (box.w * box.h) / 900; i++) {
                    const x = box.x + rr() * box.w, y = box.y + rr() * box.h, lit = lamp(x, y);
                    if (lit < 0.08) continue;
                    if (rr() < 0.5) disc(q, x, y, 0.5 + rr() * 1.4, `rgba(6,4,3,${0.5})`);
                    else S.ink(q, [[x, y], [x + (rr() - 0.5) * 8, y + (rr() - 0.5) * 4]], { w: 0.6, color: '#c8b48e', alpha: 0.4 * lit });
                }
                if (o.over) o.over(q, { k, blocks });
            },
        });
        // the evenodd hole of the face: the stone painter filled the face whole, so cut the
        // front opening out and lay the reveal back in from its own faces
        put(g, sp, 0, 0, 1);
        return { k, blocks };
    }

    // ------------------------------------------------------------------ bodies of revolution
    // prof: [[r, y], …] from the foot (y = 0) up to the lip (y < 0). Returns the radius at
    // any height (the outer envelope), and the outline.
    function profileOf(pts, seg = 8) {
        const c = S.curve(pts, false, seg), y0 = Math.max(...c.map((p) => p[1])), y1 = Math.min(...c.map((p) => p[1]));
        const n = Math.ceil((y0 - y1) * 2) + 1, tab = new Float32Array(n);
        for (let i = 1; i < c.length; i++) {
            const [ra, ya] = c[i - 1], [rb, yb] = c[i];
            const lo = Math.min(ya, yb), hi = Math.max(ya, yb);
            for (let j = Math.ceil((y0 - hi) * 2); j <= Math.floor((y0 - lo) * 2); j++) {
                const y = y0 - j / 2, t = hi - lo < 1e-6 ? 0.5 : (y - ya) / (yb - ya);
                tab[j] = Math.max(tab[j], ra + (rb - ra) * clamp(t));
            }
        }
        const at = (y) => {
            const f = (y0 - y) * 2;
            if (f < 0 || f > n - 1) return 0;
            const i = Math.floor(f), t = f - i;
            return tab[i] * (1 - t) + tab[Math.min(n - 1, i + 1)] * t;
        };
        return { c, at, y0, y1, slope: (y) => (at(y + 0.5) - at(y - 0.5)) };
    }
    // The outline of a body of revolution seen from the axis: its profile, the foot's front
    // edge bulging down and the lip's bulging up by how far the thing is from eye level.
    function latheOutline(P, ey, rFoot, rLip) {
        const t0 = Math.abs(ey / 1000), t1 = Math.abs((ey + P.y1) / 1000), out = [];
        const right = P.c.filter((p) => p[0] >= 0);
        for (const p of right) out.push([p[0], p[1]]);
        for (let i = 1; i < 24; i++) {
            const x = rLip * Math.cos((i / 24) * Math.PI);
            out.push([x, P.y1 - t1 * Math.sqrt(Math.max(0, rLip * rLip - x * x))]);
        }
        for (const p of right.slice().reverse()) out.push([-p[0], p[1]]);
        for (let i = 1; i < 24; i++) {
            const x = -rFoot * Math.cos((i / 24) * Math.PI);
            out.push([x, P.y0 + t0 * Math.sqrt(Math.max(0, rFoot * rFoot - x * x))]);
        }
        return out;
    }
    // where on a body of revolution (seen tilted by its height off the eye) the pixel (x, y)
    // falls: the height Y of the ring it is on, the radius there, and the surface normal
    function onLathe(P, ey) {
        return (x, y, out) => {
            let Y = Math.max(P.y1, Math.min(P.y0, y));
            for (let k = 0; k < 4; k++) {
                const r = P.at(Math.max(P.y1, Math.min(P.y0, Y)));
                Y = y - ((ey + Y) / 1000) * Math.sqrt(Math.max(0, r * r - x * x));
            }
            Y = Math.max(P.y1, Math.min(P.y0, Y));
            const r = Math.max(0.01, P.at(Y)), z = Math.sqrt(Math.max(0, r * r - x * x)), sl = P.slope(Y);
            // normal: (x/r, -dr/dY, z/r), tipped a little by the tilt
            const t = (ey + Y) / 1000;
            const n = norm3([x / r, sl + t * (z / r) * 0.9, z / r]);
            out.Y = Y;
            out.r = r;
            out.z = z;
            out.n = n;
            return out;
        };
    }

    // ------------------------------------------------------------------ the water seller's jug
    const JUG = (() => {
        const prof = [[90, 0], [97, -4], [99, -10], [93, -16], [104, -30], [140, -70], [178, -130], [200, -200], [205, -255], [198, -320], [180, -380], [150, -432], [116, -470], [86, -500], [70, -522], [64, -542], [66, -556], [76, -570], [86, -580], [88, -588], [82, -595], [74, -597]];
        const P = profileOf(prof, 6);
        const handle = (sx) => S.curve([[sx * 150, -420], [sx * 196, -432], [sx * 228, -462], [sx * 236, -500], [sx * 222, -536], [sx * 186, -556], [sx * 128, -558], [sx * 76, -548]], false, 8);
        return { P, H: [handle(1), handle(-1)] };
    })();
    // distance from p to a polyline, and how far along it
    function nearest(pts, x, y) {
        let best = 1e9, bu = 0;
        for (let i = 1; i < pts.length; i++) {
            const [ax, ay] = pts[i - 1], [bx, by] = pts[i], ex = bx - ax, ey = by - ay, l2 = ex * ex + ey * ey || 1;
            const t = clamp(((x - ax) * ex + (y - ay) * ey) / l2), dx = ax + ex * t - x, dy = ay + ey * t - y, dd = dx * dx + dy * dy;
            if (dd < best) {
                best = dd;
                bu = (i - 1 + t) / (pts.length - 1);
            }
        }
        return [Math.sqrt(best), bu];
    }
    function jugSprite(ey, res, seed) {
        return memo(`jug/${Math.round(ey / 20)}@${res}/${seed}`, () => {
            const P = JUG.P, sd = S.seedOf('jug' + seed), r = Motion.rng('jug' + seed);
            const on = onLathe(P, ey), q0 = {};
            const outline = latheOutline(P, ey, 99, 88);
            const box = S.bbox([...outline, [-250, -560], [250, -560]], 16);
            const HW = 10.5, hw = (u) => HW * (1 + 0.45 * smooth(0.2, 0, u) + 0.35 * smooth(0.8, 1, u));
            // the wet belly: where the clay sweats, a tide line round it
            const wetness = (x, Y) => smooth(-150, -40, Y + 26 * S.noise2(x * 0.012, Y * 0.01, sd + 3) + 0.0 * x);
            // runs of water down the belly: [x at top, y top, length]
            const runs = [];
            for (let i = 0; i < 15; i++) {
                const yt = -300 + r() * 220, x = -P.at(yt) * 0.75 + r() * P.at(yt) * 1.4;
                runs.push([x, yt, 40 + r() * 130, 2.2 + r() * 2.2, r()]);
            }
            const ramp = S.rampFn(RAMP.clay, 0.92);
            const sp = S.form({
                box, res, seed: 'jug' + seed, inflate: 'none', light: LT,
                mask: (g) => {
                    poly(g, outline);
                    for (const h of JUG.H) for (let i = 1; i < h.length; i++) line(g, [h[i - 1], h[i]], hw(i / (h.length - 1)) * 2, '#fff');
                },
                height: (x, y) => {
                    on(x, y, q0);
                    const Y = q0.Y;
                    let h = q0.z;
                    const inBody = smooth(-6, -26, Y) * smooth(-560, -530, Y);
                    // throwing rings, closer and stronger on the shoulder
                    const f = Y < -380 ? 0.36 : 0.2, amp = Y < -380 ? 0.9 : 0.5;
                    h += amp * inBody * Math.sin(Y * f + 1.8 * S.noise2(Y * 0.02, x * 0.004, sd)) * (0.6 + 0.4 * S.noise2(Y * 0.05, 1, sd + 1));
                    // two cordons on the shoulder
                    h += 3.4 * Math.exp(-Math.pow((Y + 350) / 3.4, 2)) + 2.8 * Math.exp(-Math.pow((Y + 386) / 3.0, 2));
                    // the lip rolled over
                    h += 3 * Math.exp(-Math.pow((Y + 584) / 6, 2));
                    // pores, pits
                    h += 0.07 * S.noise2(x * 0.5, y * 0.5, sd + 4) + 0.12 * S.noise2(x * 0.17, y * 0.17, sd + 14) + 0.7 * S.noise2(x * 0.05, y * 0.05, sd + 5);
                    const cx = Math.floor(x / 7), cy = Math.floor(y / 7), hp = S.hashI(cx, cy, 2, sd);
                    if (hp < 0.022) {
                        const pr = 0.8 + hp * 60, dx = x - (cx + 0.5) * 7, dy = y - (cy + 0.5) * 7, dd = Math.hypot(dx, dy * 0.8);
                        if (dd < pr) h -= 0.9 * (1 - (dd / pr) ** 2);
                    }
                    // a thumb's dent near the foot
                    h -= 2.2 * Math.exp(-(Math.pow((x + 60) / 14, 2) + Math.pow((Y + 40) / 9, 2)));
                    // the handles: tubes, flattened straps with two ridges
                    for (const H of JUG.H) {
                        if (Math.abs(x) < 70 || y > -400 || y < -580) continue;
                        const [dd, uu] = nearest(H, x, y), W = hw(uu);
                        if (dd < W + 1) {
                            // a pulled strap: flat across, two soft ridges, rounded edges
                            const u = dd / W, th = W * 0.42 * Math.pow(Math.max(0, 1 - u * u), 0.35) + 0.5 * Math.cos(u * 5.5) * smooth(1, 0.6, u) + q0.z * 0.9 + 0.3 * S.noise2(x * 0.3, y * 0.3, sd + 6);
                            if (th > h) h = th;
                        }
                    }
                    return h;
                },
                ramp: RAMP.clay, soft: 0.92,
                stroke: { amp: 0.05, freq: 0.05, tone: 7 },
                mottle: { amp: 0.035, freq: 0.018 },
                marks: (g) => {
                    // the potter's last wet passes: broad strokes round the form, and the
                    // scraped rib marks running round the lower belly
                    for (let i = 0; i < 60; i++) {
                        const yy = -540 + r() * 520, rr = P.at(yy) * 0.95, x0 = (r() * 2 - 1) * rr, len = 30 + r() * 90, pts = [];
                        for (let k = 0; k <= 8; k++) {
                            const x = clamp(x0 + (k / 8) * len, -rr, rr);
                            pts.push([x, yy + ((ey + yy) / 1000) * Math.sqrt(Math.max(0, rr * rr - x * x))]);
                        }
                        S.dab(g, pts, { w: 3 + r() * 7, color: r() < 0.5 ? '#ffffff' : '#000000', alpha: 0.12 + r() * 0.2, bristles: 6, seed: 'jm' + seed + i, dry: 0.6 });
                    }
                },
                markAmp: 0.3,
                tint: (x, y, tone, rgb, m) => {
                    on(x, y, q0);
                    const Y = q0.Y;
                    // sweat: the lower belly darker and redder, the tide line darkest
                    const wv = wetness(x, Y), edge = wv * (1 - wv) * 4;
                    scaleRGB(rgb, 0.66, 0.56, 0.52, wv * 0.8 + edge * 0.15);
                    // fired clay drifts: a warmer flash, a greyer cloud
                    const w = S.noise2(x * 0.012, y * 0.012, sd + 8);
                    rgb[0] += w * 14;
                    rgb[2] -= w * 10;
                    const ash = smooth(0.2, 0.7, S.noise2(x * 0.008 + 3, y * 0.01, sd + 9)) * 0.22;
                    toward(rgb, (rgb[0] + rgb[1] + rgb[2]) / 3, (rgb[0] + rgb[1] + rgb[2]) / 3, (rgb[0] + rgb[1] + rgb[2]) / 3 + 4, ash);
                    // light thrown up from the lit ledge into the foot of the shadow side
                    const b = smooth(0.34, 0.08, tone) * smooth(-150, -10, Y) * smooth(-0.1, 0.5, q0.n[0]) * 0.45;
                    toward(rgb, 120, 84, 48, b);
                    // and the rim of the shadow side gives up to the dark
                    const rim = smooth(0.25, 0.05, q0.n[2]) * smooth(0.4, 0.15, tone);
                    scaleRGB(rgb, 0.6, 0.6, 0.6, rim * 0.6);
                },
                over: (g) => {
                    const sh = SD, tl = TL;
                    // lime pops and iron specks
                    for (let i = 0; i < 900; i++) {
                        const yy = -590 + r() * 590, rr = P.at(yy), x = (r() * 2 - 1) * rr * 0.97;
                        if (!rr) continue;
                        const pale = r() < 0.55;
                        disc(g, x, yy + ((ey + yy) / 1000) * Math.sqrt(Math.max(0, rr * rr - x * x)), pale ? 0.3 + r() * r() * 1.1 : 0.25 + r() * 0.5, pale ? `rgba(255,236,200,${0.25 + r() * 0.4})` : `rgba(60,26,14,${0.25 + r() * 0.4})`);
                    }
                    for (let i = 0; i < 12; i++) {
                        const yy = -500 + r() * 420, rr = P.at(yy), x = (r() * 2 - 1) * rr * 0.75, cy = yy + ((ey + yy) / 1000) * Math.sqrt(Math.max(0, rr * rr - x * x)), pr = 1.2 + r() * 1.4;
                        disc(g, x, cy, pr, 'rgba(70,36,20,0.5)');
                        g.strokeStyle = 'rgba(255,236,200,0.6)';
                        g.lineWidth = 0.5;
                        g.beginPath();
                        g.arc(x, cy, pr, 0.4, 2.4);
                        g.stroke();
                        disc(g, x + sh[0] * pr * 0.2, cy + sh[1] * pr * 0.2, pr * 0.45, 'rgba(250,236,214,0.85)');
                    }
                    // the comb-incised wave between the cordons
                    const ring = (Y, x) => Y + ((ey + Y) / 1000) * Math.sqrt(Math.max(0, P.at(Y) ** 2 - x * x));
                    for (const off of [-2.2, 0, 2.2]) {
                        const pts = [];
                        const rr = P.at(-368) * 0.93;
                        for (let x = -rr; x <= rr; x += 2) pts.push([x, ring(-368 + off + 5 * Math.sin(x * 0.07 + 0.6), x)]);
                        S.ink(g, pts.map(([px, py]) => [px - 0.5, py - 0.7]), { w: 0.7, color: '#f0d0a0', alpha: 0.35, taper: [0.2, 0.2] });
                        S.ink(g, pts, { w: 0.9, color: '#2a1408', alpha: 0.55, taper: [0.2, 0.2] });
                    }
                    // luting: thumb smears at the handles' roots
                    for (const sx of [-1, 1]) {
                        for (let i = 0; i < 9; i++) {
                            const c = [sx * (146 - r() * 12), -416 + r() * 14], c2 = [sx * (80 + r() * 10), -546 + r() * 10];
                            for (const p of [c, c2]) S.ink(g, [p, [p[0] - sx * (2 + r() * 6), p[1] + 3 + r() * 6]], { w: 1.4 + r() * 1.4, color: r() < 0.5 ? '#f2cf98' : '#2c160a', alpha: 0.25 });
                        }
                        // a thumb's press at the lower root
                        oval(g, sx * 147, -412, 7, 5, 0, 'rgba(30,14,6,0.35)');
                        oval(g, sx * 147 - 1.5, -413.5, 5, 3, 0, 'rgba(240,206,150,0.25)');
                    }
                    // the chip out of the lip, showing the paler body
                    {
                        const c = [-38, -592 - Math.abs((ey - 592) / 1000) * 70];
                        poly(g, [[c[0] - 12, c[1] + 1], [c[0] - 6, c[1] - 3], [c[0] + 8, c[1] - 2.5], [c[0] + 13, c[1] + 2], [c[0] + 4, c[1] + 6.5], [c[0] - 6, c[1] + 5.5]], 'rgba(238,206,156,0.92)');
                        S.ink(g, [[c[0] - 12, c[1] + 1], [c[0] - 6, c[1] + 5.5], [c[0] + 4, c[1] + 6.5], [c[0] + 13, c[1] + 2]], { w: 0.9, color: '#3a1e0e', alpha: 0.8 });
                        for (let i = 0; i < 14; i++) disc(g, c[0] - 9 + r() * 20, c[1] - 1 + r() * 6, 0.3 + r() * 0.4, r() < 0.5 ? 'rgba(150,96,56,0.6)' : 'rgba(255,248,230,0.8)');
                    }
                    // a hairline crack down from under the lip
                    {
                        const pts = [[30, -566]];
                        for (let k = 1; k < 9; k++) pts.push([30 + k * 3 + (S.hashI(k, 2, 3, sd) - 0.5) * 6, -566 + k * 10]);
                        S.ink(g, pts.map(([px, py]) => [px - 0.6, py - 0.4]), { w: 0.6, color: '#f0cc98', alpha: 0.35, taper: [0, 1] });
                        S.ink(g, pts, { w: 0.85, color: '#1e0e06', alpha: 0.8, taper: [0, 1] });
                    }
                    // scratches and knocks from the road
                    for (let i = 0; i < 40; i++) {
                        const yy = -520 + r() * 500, rr = P.at(yy), x = (r() * 2 - 1) * rr * 0.85, a = (r() - 0.5) * 1.2, l = 3 + r() * 12, cy = ring(yy, x);
                        S.ink(g, [[x, cy], [x + Math.cos(a) * l, cy + Math.sin(a) * l]], { w: 0.45 + r() * 0.3, color: r() < 0.6 ? '#f2d2a2' : '#26120a', alpha: 0.2 + r() * 0.2 });
                    }
                    // dust settled in the rings of the shoulder
                    for (let i = 0; i < 160; i++) {
                        const yy = -500 + r() * 120, rr = P.at(yy), x = (r() * 2 - 1) * rr * 0.9;
                        disc(g, x, ring(yy, x), 0.3 + r() * 0.4, `rgba(220,196,160,${0.12 + r() * 0.2})`);
                    }
                    // the hand-dirt on the handles' crowns
                    for (const H of JUG.H) {
                        S.ink(g, H.slice(3, 7).map(([px, py]) => [px, py]), { w: 9, color: '#2a160a', alpha: 0.25 });
                        S.ink(g, H.slice(2, 8).map(([px, py]) => [px - 3, py - 2]), { w: 1.6, color: '#f6dcac', alpha: 0.4 });
                    }
                    // the runs of water, and beads of sweat on the wet belly
                    for (const [x, yt, len, w, v] of runs) {
                        const pts = [];
                        for (let k = 0; k <= 6; k++) {
                            const yy = yt + (k / 6) * len, xx = x + 2.5 * S.noise2(yy * 0.05, x, sd + 11) + (k / 6) * x * 0.06;
                            pts.push([xx, ring(yy, xx)]);
                        }
                        if (P.at(yt + len) > Math.abs(x) + 6) run(g, pts, w, { dark: [96, 64, 40], lit: [252, 236, 206], wet: '#b89a84', wa: 0.7, beads: v < 0.5 ? [0.4] : v < 0.8 ? [0.3, 0.65] : [] });
                    }
                    for (let i = 0; i < 90; i++) {
                        const yy = -170 + r() * 150, rr = P.at(yy), x = (r() * 2 - 1) * rr * 0.85;
                        drop(g, x, ring(yy, x), 0.5 + r() * r() * 2, { dark: [62, 38, 22], lit: [240, 212, 170] });
                    }
                },
            });
            // the cord tied twice round the neck, its knot and its ends
            onto(sp, (g) => {
                g.globalCompositeOperation = 'source-over';
                const yc = -524, rr = P.at(yc) + 1.5, t = (ey + yc) / 1000;
                for (const dy of [0, 7]) {
                    const pts = [];
                    for (let k = 0; k <= 20; k++) {
                        const x = -rr + (k / 20) * rr * 2;
                        pts.push([x, yc + dy + t * Math.sqrt(Math.max(0, rr * rr - x * x)) + (k % 7 === 3 ? 0.6 : 0)]);
                    }
                    cord(g, pts, 3.4, { seed: 'jc' + dy, color: [176, 140, 86] });
                }
                const kx = -26, ky = yc + 4 + t * Math.sqrt(rr * rr - kx * kx);
                oval(g, kx, ky, 6.5, 5, 0.3, '#4a3418');
                cord(g, [[kx - 5, ky - 2], [kx, ky - 4], [kx + 5, ky], [kx + 1, ky + 4], [kx - 4, ky + 2]], 3.2, { seed: 'jknot', color: [176, 140, 86] });
                cord(g, [[kx - 2, ky + 3], [kx - 8, ky + 22], [kx - 6, ky + 44], [kx - 12, ky + 62]], 3, { seed: 'jend1', color: [170, 134, 80] });
                cord(g, [[kx + 3, ky + 3], [kx + 6, ky + 20], [kx + 2, ky + 36]], 3, { seed: 'jend2', color: [170, 134, 80] });
                // frayed ends
                for (const [ex, ey2] of [[kx - 12, ky + 62], [kx + 2, ky + 36]]) {
                    for (let i = 0; i < 6; i++) line(g, [[ex, ey2], [ex + (i - 2.5) * 0.9, ey2 + 4 + (i % 3)]], 0.45, 'rgba(206,170,110,0.8)');
                }
            });
            sp.outline = outline;
            return sp;
        });
    }
    function jug(g, o = {}) {
        const { x = 0, y = 0, s = 1, seed = 'a' } = o, ey = o.ey ?? y;
        const sp = jugSprite(ey / s, resOf(g, s), seed);
        put(g, sp, x, y, s);
        return sp;
    }

    // ------------------------------------------------------------------ búcaros
    const BUC = {
        a: [[34, 0], [37, -4], [33, -9], [44, -20], [54, -38], [56, -56], [50, -74], [36, -88], [22, -96], [17, -104], [17, -116], [20, -124], [27, -131], [29, -135], [25, -137]],
        b: [[30, 0], [33, -4], [29, -8], [40, -16], [50, -32], [52, -50], [44, -66], [30, -74], [21, -78], [20, -86], [23, -92], [28, -95], [26, -97]],
    };
    function bucaroSprite(kind, ey, res, seed) {
        return memo(`bucaro/${kind}/${Math.round(ey / 20)}@${res}/${seed}`, () => {
            const P = profileOf(BUC[kind], 6), sd = S.seedOf('buc' + seed + kind), r = Motion.rng('buc' + seed + kind);
            const on = onLathe(P, ey), q0 = {};
            const rTop = BUC[kind][BUC[kind].length - 2][0];
            const outline = latheOutline(P, ey, BUC[kind][1][0], rTop);
            const hasHandle = kind === 'b';
            const handle = S.curve([[46, -44], [66, -50], [74, -64], [66, -80], [48, -84], [26, -84]], false, 8);
            const box = S.bbox([...outline, [80, -90]], 10);
            const tilt = (Y) => (ey + Y) / 1000;
            const ring = (Y, x) => Y + tilt(Y) * Math.sqrt(Math.max(0, P.at(Y) ** 2 - x * x));
            const yTop = P.y1, mouth = tilt(yTop) > 0.02;
            const sp = S.form({
                box, res, seed: 'buc' + seed + kind, inflate: 'none', light: LT,
                mask: (g) => {
                    poly(g, outline);
                    if (hasHandle) line(g, handle, 9, '#fff');
                },
                height: (x, y) => {
                    on(x, y, q0);
                    let h = q0.z + 0.25 * Math.sin(q0.Y * 0.5 + S.noise2(q0.Y * 0.03, 0, sd)) + 0.15 * S.noise2(x * 0.5, y * 0.5, sd);
                    // stamped bosses round the shoulder
                    const ya = kind === 'a' ? -66 : -50;
                    if (Math.abs(q0.Y - ya) < 6) {
                        const ang = Math.asin(clamp(x / q0.r)), a8 = ((ang / 0.42) % 1 + 1) % 1;
                        h += 1.4 * Math.exp(-Math.pow((q0.Y - ya) / 3, 2)) * smooth(0.25, 0.5, Math.abs(a8 - 0.5) < 0.25 ? 0.5 : 0.3);
                    }
                    if (hasHandle && x > 30 && y < -38 && y > -92) {
                        const [dd] = nearest(handle, x, y);
                        if (dd < 5) h = Math.max(h, 3.6 * Math.sqrt(1 - (dd / 5) ** 2) + q0.z * 0.8);
                    }
                    return h;
                },
                ramp: RAMP.white, soft: 0.9,
                stroke: { amp: 0.04, freq: 0.12, tone: 7 },
                mottle: { amp: 0.035, freq: 0.05 },
                spec: { amp: 0.35, power: 16, from: 0.4, to: 0.9, ragged: 0.6, color: '#fffaf0' },
                tint: (x, y, tone, rgb) => {
                    on(x, y, q0);
                    // a firing blush, a pinkish clay showing through the slip
                    const blush = smooth(0.1, 0.7, S.noise2(x * 0.03, y * 0.03, sd + 3)) * (kind === 'b' ? 0.35 : 0.15);
                    toward(rgb, rgb[0] * 0.75, rgb[1] * 0.72, rgb[2] * 0.76, blush);
                    toward(rgb, rgb[0] * 1.02, rgb[1] * 0.9, rgb[2] * 0.84, 0.25 * smooth(-0.2, 0.6, S.noise2(x * 0.02 + 5, y * 0.02, sd + 4)));
                    const b = smooth(0.32, 0.08, tone) * smooth(-30, -4, q0.Y) * 0.45;
                    toward(rgb, 120, 92, 64, b);
                },
                over: (g) => {
                    // burnishing strokes: a pebble rubbed up the leather-hard clay, catching light
                    for (let i = 0; i < 46; i++) {
                        const yy = -(r() * Math.abs(yTop) * 0.8), rr = P.at(yy), x = (r() * 2 - 1) * rr * 0.85, len = 6 + r() * 16;
                        S.ink(g, [[x, ring(yy, x)], [x + (r() - 0.5) * 2, ring(yy - len, x)]], { w: 0.8 + r() * 1.4, color: r() < 0.6 ? '#fffaf0' : '#7a6656', alpha: 0.18 + r() * 0.18 });
                    }
                    // the band: incised lines, stamped rosettes and inset white pebbles
                    const ya = kind === 'a' ? -66 : -50;
                    for (const off of [-8, 8]) {
                        const pts = [], rr = P.at(ya + off) * 0.96;
                        for (let x = -rr; x <= rr; x += 1.5) pts.push([x, ring(ya + off, x)]);
                        S.ink(g, pts.map(([px, py]) => [px - 0.4, py - 0.4]), { w: 0.5, color: '#fff8ea', alpha: 0.5, taper: [0.3, 0.3] });
                        S.ink(g, pts, { w: 0.7, color: '#3c2c20', alpha: 0.55, taper: [0.3, 0.3] });
                    }
                    const rr = P.at(ya);
                    for (let a = -1.3; a <= 1.31; a += 0.42) {
                        const x = Math.sin(a) * rr, cy = ring(ya, x), fx = Math.cos(a);
                        if (Math.round(a / 0.42) % 2) {
                            // a white pebble set in the clay, with its own glint
                            oval(g, x + 0.6, cy + 0.6, 2.6 * fx, 2.2, 0, 'rgba(40,28,20,0.55)');
                            oval(g, x, cy, 2.4 * fx, 2, 0, '#e9e6de');
                            disc(g, x - 0.7 * fx, cy - 0.7, 0.7, 'rgba(255,255,255,0.95)');
                        } else {
                            for (let k = 0; k < 6; k++) {
                                const b = (k / 6) * TAU;
                                oval(g, x + Math.cos(b) * 2.6 * fx, cy + Math.sin(b) * 2.6, 1.1 * fx, 1.1, 0, 'rgba(60,44,32,0.55)');
                            }
                            disc(g, x, cy, 0.9, 'rgba(60,44,32,0.6)');
                        }
                    }
                    // grime in the foot, a chip on the lip
                    for (let i = 0; i < 60; i++) disc(g, (r() * 2 - 1) * 34, -r() * 10, 0.3 + r() * 0.5, `rgba(70,50,36,${0.15 + r() * 0.3})`);
                    oval(g, rTop * 0.4, yTop + 1, 3.2, 1.6, 0, 'rgba(176,140,110,0.85)');
                    if (mouth) {
                        // seen from above: the dark mouth, its far inner wall lit
                        const mr = rTop - 3.5, my = yTop + 0.5, me = tilt(yTop) * mr;
                        oval(g, 0, my, mr, me, 0, '#120c09');
                        g.save();
                        g.beginPath();
                        g.ellipse(0, my, mr, me, 0, 0, TAU);
                        g.clip();
                        oval(g, mr * 0.25, my - me * 0.65, mr * 0.8, me * 0.55, 0, 'rgba(150,128,104,0.6)');
                        g.restore();
                        S.ink(g, Array.from({ length: 17 }, (_, i) => [Math.cos(Math.PI * (i / 16)) * mr, my + Math.sin(Math.PI * (i / 16)) * me]), { w: 0.8, color: '#fff6e6', alpha: 0.8, taper: [0.5, 0.5] });
                    }
                },
            });
            sp.outline = outline;
            return sp;
        });
    }
    function bucaro(g, o = {}) {
        const { x = 0, y = 0, s = 1, seed = 'a', kind = 'a' } = o, ey = o.ey ?? y;
        const sp = bucaroSprite(kind, ey / s, resOf(g, s), seed);
        put(g, sp, x, y, s);
        return sp;
    }

    // ------------------------------------------------------------------ pewter
    // What a dull metal shows at a normal n: the room mirrored and blurred (dark), the lamp's
    // window soft and warm, the lit stone under it as a band, and its own grey by diffusion.
    function metalAt(n, base, o, rgb) {
        // the reflected view ray (the eye is straight in front)
        const rx = 2 * n[2] * n[0], ry = 2 * n[2] * n[1], rz = 2 * n[2] * n[2] - 1;
        const rough = o.rough ?? 0.4;
        // the lamp: a window up to the left, its glow
        const dl = rx * LN[0] + ry * LN[1] + rz * LN[2];
        const win = smooth(0.82 - rough * 0.25, 0.97, dl), glow = smooth(0.3, 0.95, dl);
        // the ledge it stands on: the ray going down and forward
        const ledge = smooth(0.15, 0.45, ry) * smooth(-0.6, 0.2, rz) * (o.ledge ?? 0.6);
        const diff = Math.max(0, n[0] * LN[0] + n[1] * LN[1] + n[2] * LN[2]);
        const L = o.lampCol ?? [255, 238, 204], E = o.ledgeCol ?? [150, 118, 80], room = o.room ?? [14, 11, 9];
        for (let i = 0; i < 3; i++) {
            const refl = room[i] + (E[i] - room[i]) * ledge + (L[i] - room[i]) * (glow * 0.35 + win * 0.9);
            rgb[i] = (refl * (o.mirror ?? 0.7) + base[i] * (0.12 + diff * 0.9) * (1 - (o.mirror ?? 0.7))) * (i === 0 ? 1 : 1);
        }
        return dl;
    }
    // A pewter plate, standing on its edge leaning back against a wall (default) or lying
    // flat ({ flat: true }), seen from the axis. r: its radius. (x, y) its foot (standing) or
    // its centre (flat).
    function plateSprite(R, flat, ey, res, seed) {
        return memo(`plate/${R}/${flat}/${Math.round(ey / 20)}@${res}/${seed}`, () => {
            const sd = S.seedOf('plate' + seed), r = Motion.rng('plate' + seed);
            const tilt = flat ? Math.max(0.12, Math.abs(ey) / 1000 + 0.06) : 0.93; // how round it looks
            const cy = flat ? 0 : -R * tilt;
            const box = { x: -R - 10, y: cy - R * tilt - 10, w: R * 2 + 20, h: R * tilt * 2 + 24 };
            const base = [150, 152, 150];
            // radial profile of the plate: height as a function of the radius (units)
            const RIM = 0.72, BOOGE = 0.6;
            const hOf = (q) => (q > 0.985 ? 3.2 : q > RIM ? 2.4 + (q - RIM) * 2 : q > BOOGE ? 2.4 * smooth(BOOGE, RIM, q) - 0.4 : -0.4 - 0.3 * (1 - q / BOOGE));
            // marks in the well and on the rim
            const scratch = [];
            for (let i = 0; i < 160; i++) {
                const a = r() * TAU, d = Math.sqrt(r()) * R * (r() < 0.8 ? 0.6 : 0.95), l = 4 + r() * 26, b = r() * TAU;
                scratch.push([Math.cos(a) * d, Math.sin(a) * d, Math.cos(b), Math.sin(b), l, r()]);
            }
            const sp = pixels({
                box, res,
                mask: (g) => oval(g, 0, cy, R, R * tilt, 0, '#fff'),
                color: (x, y, rgb) => {
                    const u = x / R, v = (y - cy) / (R * tilt), q = Math.hypot(u, v);
                    // the slope of the surface at this radius, along the radius
                    const e = 0.004, dh = (hOf(q + e) - hOf(q - e)) / (2 * e * R);
                    const ux = q > 1e-4 ? u / q : 0, uy = q > 1e-4 ? v / q : 0;
                    // a dent on the rim, low pits
                    let px = -dh * ux, py = -dh * uy;
                    const dd = Math.hypot(u - 0.55, v + 0.62);
                    if (dd < 0.1) {
                        px += (u - 0.55) * 3 * (1 - dd / 0.1);
                        py += (v + 0.62) * 3 * (1 - dd / 0.1);
                    }
                    px += 0.05 * S.noise2(x * 0.08, y * 0.08, sd);
                    py += 0.05 * S.noise2(x * 0.08, y * 0.08, sd + 1);
                    // the plate's own facing: standing, leaning back (faces the eye, a little up);
                    // flat, faces up (and a little to the eye)
                    let n;
                    if (flat) n = norm3([px, -1 + 0.0 * py, tilt + py * 0.8]);
                    else n = norm3([px, py - 0.25, 1]);
                    metalAt(n, base, { rough: 0.55, mirror: 0.55, ledge: flat ? 0.2 : 0.7, room: [16, 14, 13], lampCol: [236, 230, 216], ledgeCol: [140, 120, 92] }, rgb);
                    // dull grey drift, oxidation clouds
                    const w = S.noise2(x * 0.03, y * 0.03, sd + 3);
                    const ox = smooth(0.35, 0.75, S.noise2(x * 0.06, y * 0.06, sd + 4)) * 0.35;
                    for (let i = 0; i < 3; i++) rgb[i] = rgb[i] * (1 + 0.06 * w) * (1 - ox) + 30 * ox;
                    // the edge bead worn bright, the booge's step dark
                    if (q > 0.97) toward(rgb, 210, 210, 204, 0.35 * smooth(0.97, 0.99, q) * (0.5 + 0.5 * Math.max(0, -ux * 0.7 - uy * 0.7)));
                    if (Math.abs(q - BOOGE - 0.02) < 0.02) scaleRGB(rgb, 0.8, 0.8, 0.8, 0.5);
                },
                over: (g) => {
                    // knife scratches in the well, fine and many; a few on the rim
                    for (const [sx, sy, cx2, sy2, l, v] of scratch) {
                        const p0 = [sx, cy + sy * tilt], p1 = [sx + cx2 * l, cy + (sy + sy2 * l) * tilt];
                        S.ink(g, [p0, p1], { w: 0.35 + v * 0.3, color: v < 0.55 ? '#e4e6e4' : '#2a2a28', alpha: 0.18 + v * 0.22 });
                    }
                    // the touch mark on the rim: a crowned rose in a beaded oval
                    const m = [-R * 0.86 * 0.7, cy - R * 0.86 * 0.7 * tilt];
                    oval(g, m[0], m[1], 7, 9 * tilt, 0, 'rgba(40,40,38,0.4)');
                    for (let k = 0; k < 5; k++) {
                        const a = (k / 5) * TAU - Math.PI / 2;
                        oval(g, m[0] + Math.cos(a) * 2.2, m[1] + 1.5 * tilt + Math.sin(a) * 2.2 * tilt, 1.4, 1.4 * tilt, 0, 'rgba(36,36,34,0.6)');
                    }
                    line(g, [[m[0] - 3, m[1] - 3.5 * tilt], [m[0] - 1.5, m[1] - 5.5 * tilt], [m[0], m[1] - 4 * tilt], [m[0] + 1.5, m[1] - 5.5 * tilt], [m[0] + 3, m[1] - 3.5 * tilt]], 0.6, 'rgba(36,36,34,0.6)');
                    oval(g, m[0] + 0.6, m[1] - 0.6, 7, 9 * tilt, 0, 'rgba(255,255,255,0)');
                    // dark spots of tin pest
                    for (let i = 0; i < 26; i++) {
                        const a = r() * TAU, d = Math.sqrt(r()) * R * 0.95;
                        oval(g, Math.cos(a) * d, cy + Math.sin(a) * d * tilt, 0.6 + r() * 2, (0.6 + r() * 2) * tilt, 0, `rgba(20,20,18,${0.2 + r() * 0.3})`);
                    }
                },
            });
            sp.cy = cy;
            sp.tilt = tilt;
            return sp;
        });
    }
    function plate(g, o = {}) {
        const { x = 0, y = 0, s = 1, seed = 'a', r = 120, flat = false } = o, ey = o.ey ?? y;
        const sp = plateSprite(r, flat, ey / s, resOf(g, s), seed);
        put(g, sp, x, y, s);
        return sp;
    }

    // ------------------------------------------------------------------ the fig
    function figSprite(res, seed, rot = 0) {
        return memo(`fig@${res}/${seed}/${rot.toFixed(2)}`, () => {
            const r = Motion.rng('fig' + seed), sd = S.seedOf('fig' + seed);
            // a pear: the eye at +x, the neck and stalk at −x (hanging as it lies)
            const pts = [];
            for (let i = 0; i < 80; i++) {
                const a = (i / 80) * TAU, c = Math.cos(a), sn = Math.sin(a);
                const neck = smooth(0.2, -1, c);
                const rr = 26 * (1 - 0.42 * neck) * (1 + 0.04 * Math.sin(a * 3 + 1)) * (c > 0 ? 1 + 0.05 * c : 1);
                pts.push([c * (c > 0 ? 24 : 30 + 8 * neck) , sn * rr]);
            }
            const L = S.lightFor(rot, LT);
            const box = S.bbox([...pts, [-50, 0]], 8);
            const sp = S.form({
                box, res, seed: 'fig' + seed, light: L,
                mask: (g) => {
                    poly(g, pts);
                    // the stalk
                    line(g, [[-36, 0], [-44, -2], [-50, -1]], 5, '#fff');
                },
                // faint ribs running from the stalk to the eye (along x), a slow lumpiness
                height: (x, y) => 0.35 * Math.cos(y * 0.42 + 0.6 * S.noise2(x * 0.04, 0, sd)) * smooth(-34, -10, x) * smooth(26, 10, x) + 0.5 * S.noise2(x * 0.08, y * 0.08, sd),
                ramp: RAMP.fig, soft: 0.9,
                stroke: { amp: 0.05, freq: 0.15, tone: 6 },
                mottle: { amp: 0.06, freq: 0.06 },
                spec: { amp: 0.25, power: 10, from: 0.5, to: 0.95, ragged: 0.6, color: '#e6dcef' },
                tint: (x, y, tone, rgb) => {
                    // green at the neck, the powdery bloom on the body
                    const nk = smooth(-14, -40, x);
                    toward(rgb, rgb[0] * 0.8 + 14, rgb[1] * 1.1 + 22, rgb[2] * 0.6, nk * 0.7);
                    const bl = smooth(0.4, 0.8, tone) * (0.2 + 0.2 * S.noise2(x * 0.1, y * 0.1, sd + 2));
                    toward(rgb, 120, 112, 132, bl * 0.4);
                    scaleRGB(rgb, 0.8, 0.78, 0.82, 1);
                },
                over: (g) => {
                    // lenticels
                    for (let i = 0; i < 90; i++) disc(g, -30 + r() * 54, (r() - 0.5) * 46, 0.3 + r() * 0.35, `rgba(230,220,200,${0.25 + r() * 0.35})`);
                    // the eye
                    disc(g, 23, 1, 3.2, 'rgba(40,16,30,0.9)');
                    disc(g, 23, 1, 1.6, '#7a3a40');
                    // a split showing the red flesh
                    const sp2 = [[8, -14], [12, -11], [15, -6], [13, -4], [10, -8]];
                    poly(g, sp2, '#9a2a34');
                    S.ink(g, [[9, -12], [12, -8], [13, -5]], { w: 0.8, color: '#e8a0a0', alpha: 0.8 });
                    S.ink(g, sp2, { w: 0.6, color: '#2a0a14', alpha: 0.8 });
                },
            });
            return sp;
        });
    }

    // ------------------------------------------------------------------ the glass of water
    // A goblet on the stone at (x, y), the fig at the bottom of its water. Drawn straight on g
    // (it shows what is behind it, bent): paint it after the ledge and the wall behind it.
    const GL = (() => {
        // outer profile of the goblet (r, y): foot, stem with a knop, bowl
        const prof = [[64, 0], [62, -4], [50, -7], [20, -10], [11, -16], [9, -30], [13, -38], [14, -44], [9, -50], [8, -64], [14, -74], [36, -84], [56, -104], [68, -134], [72, -170], [73, -206], [74, -240]];
        return { P: profileOf(prof, 6), water: -186, bottom: -80 };
    })();
    function glass(g, o = {}) {
        const { x = 0, y = 0, s = 1, seed = 'a' } = o, ey = (o.ey ?? y) / s;
        const P = GL.P, r = Motion.rng('glass' + seed), px = S.pxScale(g);
        const tilt = (Y) => (ey + Y) / 1000;
        const ring = (Y, rr, a0 = 0, a1 = TAU, n = 40) => Array.from({ length: n + 1 }, (_, i) => {
            const a = a0 + ((a1 - a0) * i) / n;
            return [Math.cos(a) * rr, Y + Math.sin(a) * rr * tilt(Y)];
        });
        const outline = latheOutline(P, ey, 64, 74);
        const bowl = [...P.c.filter((p) => p[1] <= -74).map(([rr, yy]) => [rr, yy]), ...ring(-240, 74, Math.PI, TAU, 30).slice(1, -1), ...P.c.filter((p) => p[1] <= -74).reverse().map(([rr, yy]) => [-rr, yy])];
        const wr = P.at(GL.water) - 2.5;
        const water = [...P.c.filter((p) => p[1] <= -78 && p[1] >= GL.water).map(([rr, yy]) => [rr - 2.4, yy]), ...ring(GL.water, wr, Math.PI, TAU, 30), ...P.c.filter((p) => p[1] <= -78 && p[1] >= GL.water).reverse().map(([rr, yy]) => [-(rr - 2.4), yy])];
        g.save();
        g.translate(x, y);
        g.scale(s, s);
        // 1 · what is behind, bent: through the water the stone and the dark are magnified
        // sideways (a cylinder of water is a lens); through the foot, the stone lifted
        const snap = (() => {
            const c = canvas(g.canvas.width, g.canvas.height);
            c.getContext('2d').drawImage(g.canvas, 0, 0);
            return c;
        })();
        const m = g.getTransform();
        const bend = (clipPts, sx, sy, dy, alpha = 1) => {
            g.save();
            g.beginPath();
            S.trace(g, clipPts);
            g.clip();
            g.globalAlpha = alpha;
            const c = m.transformPoint(new DOMPoint(0, dy));
            g.setTransform(sx, 0, 0, sy, c.x * (1 - sx), c.y * (1 - sy));
            g.drawImage(snap, 0, 0);
            g.restore();
        };
        bend(water, 1.32, 1.04, -130);
        bend(ring(-4, 60), 1.1, 0.7, -2, 0.9);
        // the water's own body: a faint green-grey, thicker (darker) at its flanks
        g.save();
        g.beginPath();
        S.trace(g, water);
        g.clip();
        poly(g, water, 'rgba(120,138,120,0.10)');
        S.spray(g, water, { color: '#0a0c0a', alpha: 0.55, w: 10, push: 4, dir: [1, 0] });
        S.spray(g, water, { color: '#0a0c0a', alpha: 0.45, w: 8, push: 3, dir: [-1, 0] });
        // the fig at the bottom, magnified, lying a little tipped; bubbles on it
        const fig = figSprite(resOf(g, 1.3), seed, 0.25);
        S.put(g, fig, { x: 6, y: -104, rot: 0.25, sx: 1.25, sy: 0.98 });
        g.globalCompositeOperation = 'source-atop';
        poly(g, water, 'rgba(90,112,100,0.12)');
        g.globalCompositeOperation = 'source-over';
        for (let i = 0; i < 26; i++) {
            const a = r() * TAU, bx = 6 + Math.cos(a) * (24 + r() * 10) * 1.25, by = -104 + Math.sin(a) * (16 + r() * 8);
            const br = 0.6 + r() * r() * 1.8;
            g.strokeStyle = 'rgba(220,236,230,0.7)';
            g.lineWidth = 0.35;
            g.beginPath();
            g.arc(bx, by, br, 0, TAU);
            g.stroke();
            disc(g, bx - br * 0.35, by - br * 0.35, br * 0.3, 'rgba(255,255,255,0.9)');
        }
        // bubbles on the inside wall
        for (let i = 0; i < 40; i++) {
            const yy = GL.water + 8 + r() * (GL.bottom - GL.water - 14), side = r() < 0.5 ? -1 : 1, rr = P.at(yy) - 4 - r() * 6, bx = side * rr * (0.75 + r() * 0.25), br = 0.5 + r() * r() * 1.6;
            g.strokeStyle = 'rgba(214,230,224,0.55)';
            g.lineWidth = 0.3;
            g.beginPath();
            g.arc(bx, yy, br, 0, TAU);
            g.stroke();
            disc(g, bx - br * 0.3, yy - br * 0.3, br * 0.3, 'rgba(255,255,255,0.8)');
        }
        g.restore();
        // 2 · the surface of the water seen from just above: a thin ellipse, the far edge
        // bright (it mirrors the lamp), the meniscus climbing the glass
        const sw = ring(GL.water, wr, 0, TAU, 50);
        poly(g, sw, 'rgba(110,126,118,0.16)');
        S.ink(g, ring(GL.water, wr, Math.PI + 0.1, TAU - 0.1, 30), { w: 1.3, color: '#e8f2ec', alpha: 0.75, taper: [0.6, 0.6] });
        S.ink(g, ring(GL.water + 1.2, wr, 0.15, Math.PI - 0.15, 30), { w: 0.9, color: '#d8e8e0', alpha: 0.5, taper: [0.6, 0.6] });
        S.ink(g, ring(GL.water - 0.6, wr + 1, Math.PI * 1.1, Math.PI * 1.35, 10), { w: 2, color: '#ffffff', alpha: 0.9 });
        // 3 · the glass: its walls as light on the dark, thick and greenish at the edges
        g.save();
        g.beginPath();
        S.trace(g, outline);
        g.clip();
        poly(g, outline, 'rgba(190,206,214,0.04)');
        const flank = (side, u0, u1, y0, y1, style, blur = 0) => {
            const pts = [];
            for (let yy = y0; yy >= y1; yy -= 2) pts.push([side * P.at(yy) * u0, yy]);
            for (let yy = y1; yy <= y0; yy += 2) pts.push([side * P.at(yy) * u1, yy]);
            if (blur) softly(g, blur, (q) => poly(q, pts, style));
            else poly(g, pts, style);
        };
        // the lamp's window on the lit flank: a tall soft streak broken by its bar, the glow
        // round it, and its small bent echo on the far flank
        const streak = (u, y0, y1, w, a, blur) => {
            const pts = [];
            for (let yy = y0; yy >= y1; yy -= 3) pts.push([-P.at(yy) * u, yy]);
            softly(g, blur, (q) => S.ink(q, pts, { w, color: '#f4faf6', alpha: a, taper: [0.9, 0.9] }));
        };
        streak(0.74, -96, -234, 16, 0.16, 5);
        streak(0.76, -116, -164, 5.5, 0.85, 0.7);
        streak(0.765, -172, -224, 5, 0.78, 0.7);
        streak(0.6, -122, -218, 1.6, 0.35, 0.4);
        streak(-0.7, -146, -180, 2.6, 0.38, 0.6);
        streak(-0.86, -100, -230, 1.2, 0.25, 0.3);
        // the walls' thickness: a bright line just inside each edge, a dark one at the edge
        for (const side of [-1, 1]) {
            const pts = [];
            for (let yy = -80; yy >= -238; yy -= 2) pts.push([side * (P.at(yy) - 2.2), yy]);
            S.ink(g, pts, { w: side < 0 ? 1.1 : 0.8, color: '#eef6f2', alpha: side < 0 ? 0.6 : 0.4, taper: [0.5, 0.4] });
            const pe = [];
            for (let yy = -78; yy >= -240; yy -= 2) pe.push([side * (P.at(yy) - 0.4), yy]);
            S.ink(g, pe, { w: 1, color: side < 0 ? '#9fb4ac' : '#5c6e68', alpha: 0.5 });
        }
        // the stem: a bright core and dark edges; the knop's glints
        for (const [u, w, c, a] of [[-0.9, 0.7, '#283830', 0.5], [0.9, 0.7, '#283830', 0.5], [-0.25, 1.4, '#fafffc', 0.55], [0.45, 0.6, '#cfe0d8', 0.3]]) {
            const pts = [];
            for (let yy = -14; yy >= -76; yy -= 2) pts.push([u * P.at(yy), yy]);
            S.ink(g, pts, { w: c === '#fafffc' ? w : w, color: c, alpha: a, taper: [0.3, 0.3] });
        }
        oval(g, -5, -40, 3, 2, 0, 'rgba(255,255,255,0.9)');
        oval(g, 6, -42, 2, 1.2, 0, 'rgba(220,236,228,0.6)');
        // the solid glass at the bowl's foot, and a seed (bubble) in it
        oval(g, 0, -80, 14, 5, 0, 'rgba(40,56,48,0.35)');
        oval(g, -3, -82, 8, 2, 0, 'rgba(240,250,244,0.6)');
        g.strokeStyle = 'rgba(230,242,236,0.7)';
        g.lineWidth = 0.4;
        g.beginPath();
        g.ellipse(4, -70, 1.4, 1, 0, 0, TAU);
        g.stroke();
        // the foot: its rim, the far edge, the ground ring
        S.ink(g, ring(-3, 62, 0.1, Math.PI - 0.1, 30), { w: 1.4, color: '#f2faf6', alpha: 0.75, taper: [0.5, 0.5] });
        S.ink(g, ring(-4, 60, Math.PI + 0.15, TAU - 0.15, 30), { w: 0.8, color: '#c8dad2', alpha: 0.45, taper: [0.5, 0.5] });
        S.ink(g, ring(-6, 30, 0, TAU, 30), { w: 0.6, color: '#d8e8e0', alpha: 0.35 });
        oval(g, -40, -2, 9, 1.6, 0, 'rgba(255,255,255,0.85)');
        // condensation beads outside, below the water line
        for (let i = 0; i < 70; i++) {
            const yy = GL.water + 6 + r() * (GL.bottom - GL.water - 6), rr = P.at(yy), bx = (r() * 2 - 1) * rr * 0.9, br = 0.4 + r() * r() * 1.5;
            disc(g, bx + 0.3, yy + 0.4, br, 'rgba(10,14,12,0.4)');
            disc(g, bx, yy, br, 'rgba(170,190,180,0.35)');
            disc(g, bx - br * 0.35, yy - br * 0.4, Math.max(0.15, br * 0.3), 'rgba(255,255,255,0.9)');
        }
        g.restore();
        // 4 · the rim: a thin bright ellipse, the near lip brighter, glints to the lamp
        S.ink(g, ring(-240, 74, Math.PI, TAU, 40), { w: 0.9, color: '#dfece6', alpha: 0.6, taper: [0.3, 0.3] });
        S.ink(g, ring(-240, 74, 0, Math.PI, 40), { w: 1.3, color: '#f4fbf8', alpha: 0.85, taper: [0.3, 0.3] });
        S.ink(g, ring(-238.6, 72.6, 0, Math.PI, 40), { w: 0.6, color: '#3a4a44', alpha: 0.4, taper: [0.3, 0.3] });
        S.ink(g, ring(-240, 74, Math.PI * 1.08, Math.PI * 1.3, 8), { w: 2.2, color: '#ffffff', alpha: 0.95 });
        disc(g, -66, -238 + tilt(-240) * 30, 1.6, '#ffffff');
        // the outer edge: barely a line, darker on the far side
        S.ink(g, P.c.filter((p) => p[1] < -76).map(([rr, yy]) => [rr + 0.3, yy]), { w: 0.8, color: '#0c100e', alpha: 0.6 });
        g.restore();
        return { outline, water };
    }
    // its shadow on the stone, with the caustic the water gathers inside it
    function glassShadow(g, x, y, s = 1, o = {}) {
        const kx = o.kx ?? 0.82, ky = o.ky ?? Math.max(0.035, (0.5 * Math.abs(y)) / 1000);
        g.save();
        if (o.clip) {
            g.beginPath();
            S.trace(g, o.clip);
            g.clip();
        }
        g.globalCompositeOperation = 'source-atop';
        g.transform(s, 0, -s * kx, s * ky, x, y);
        // the stem and foot: a dark shadow; the bowl: paler (glass lets light through)
        softly(g, 3, (q) => {
            poly(q, GL.P.c.filter((p) => p[1] > -76).flatMap(([rr, yy]) => [[rr, yy]]).concat(GL.P.c.filter((p) => p[1] > -76).reverse().map(([rr, yy]) => [-rr, yy])), 'rgba(6,4,2,0.55)');
            const bowl = GL.P.c.filter((p) => p[1] <= -76);
            poly(q, [...bowl, ...bowl.slice().reverse().map(([rr, yy]) => [-rr, yy])], 'rgba(6,4,2,0.38)');
            // the bowl's walls throw darker edges
            S.ink(q, bowl.map(([rr, yy]) => [rr - 3, yy]), { w: 6, color: '#060402', alpha: 0.4 });
            S.ink(q, bowl.map(([rr, yy]) => [-rr + 3, yy]), { w: 6, color: '#060402', alpha: 0.4 });
        });
        // the caustic: the water focuses the lamp into a bright crescent inside the shadow
        g.globalCompositeOperation = 'source-atop';
        softly(g, 5, (q) => oval(q, 4, -140, 40, 34, 0, 'rgba(255,236,190,0.55)'));
        softly(g, 1.6, (q) => {
            const pts = [];
            for (let i = 0; i <= 16; i++) {
                const a = -0.3 + (i / 16) * 2.2;
                pts.push([4 + Math.cos(a) * 30, -140 + Math.sin(a) * 30]);
            }
            S.ink(q, pts, { w: 5, color: '#fff6dc', alpha: 0.85 });
            oval(q, 12, -126, 9, 6, 0.4, 'rgba(255,250,232,0.9)');
        });
        g.restore();
    }


    // ------------------------------------------------------------------ brass: the mortar
    // An almirez: a bronze mortar with a flared lip, a waist, six cast fins down its body,
    // two lugs; its pestle leans in it. Brass mirrors the dark room, the lamp's window and
    // the lit stone; it is worn bright where hands hold it and brown-green in its hollows.
    const MORTAR = profileOf([[80, 0], [83, -3], [82, -8], [72, -12], [67, -28], [64, -56], [65, -86], [70, -112], [79, -132], [88, -144], [92, -150], [90, -155], [84, -157]], 6);
    const BRASS = { base: [138, 98, 40], tint: [1, 0.8, 0.5], lampCol: [255, 236, 190], ledgeCol: [170, 130, 82] };
    function brassAt(n, rgb, o = {}) {
        const dl = metalAt(n, BRASS.base, { rough: o.rough ?? 0.3, mirror: o.mirror ?? 0.78, ledge: o.ledge ?? 0.75, room: [10, 8, 6], lampCol: BRASS.lampCol, ledgeCol: BRASS.ledgeCol }, rgb);
        rgb[0] *= BRASS.tint[0];
        rgb[1] *= BRASS.tint[1];
        rgb[2] *= BRASS.tint[2];
        // the sheen of the lamp itself stays white-gold
        const hot = smooth(0.9, 0.99, dl);
        toward(rgb, 255, 244, 214, hot * 0.8);
        return dl;
    }
    function mortarSprite(ey, res, seed) {
        return memo(`mortar/${Math.round(ey / 20)}@${res}/${seed}`, () => {
            const P = MORTAR, on = onLathe(P, ey), q0 = {}, sd = S.seedOf('mortar' + seed), r = Motion.rng('mortar' + seed);
            const outline = latheOutline(P, ey, 83, 92);
            const lug = (sx) => S.curve([[sx * 64, -70], [sx * 82, -74], [sx * 90, -88], [sx * 82, -102], [sx * 66, -104]], false, 6);
            const box = S.bbox([...outline, [-96, -100], [96, -100]], 8);
            const FINS = [-1.05, -0.5, 0.05, 0.6, 1.15];
            const sp = pixels({
                box, res,
                mask: (g) => {
                    poly(g, outline);
                    for (const sx of [-1, 1]) {
                        line(g, lug(sx), 13, '#fff');
                        poly(g, lug(sx), '#fff');
                    }
                },
                color: (x, y, rgb) => {
                    on(x, y, q0);
                    let n = q0.n;
                    const Y = q0.Y, inBody = smooth(-10, -18, Y) * smooth(-128, -116, Y);
                    let lugH = 0;
                    if (Math.abs(x) > 60 && Y < -64 && Y > -110 && Math.abs(x) > P.at(Y) - 1) {
                        const [dd] = nearest(lug(Math.sign(x)), x, y);
                        if (dd < 7 || Math.abs(x) < 86) {
                            // a lug: a small half ring, lit as a tube
                            const v = clamp(Math.min(dd, 7) / 7) * 0.8, nn = norm3([Math.sign(x) * v * 0.8, (y + 87) / 30, Math.sqrt(1 - v * v)]);
                            n = nn;
                            lugH = 1;
                        }
                    }
                    if (inBody > 0 && !lugH) {
                        // the fins: ridges round the body; tip the normal across them
                        const th = Math.asin(clamp(x / q0.r));
                        let df = 0, on2 = 0;
                        for (const f of FINS) {
                            const d = (th - f) / 0.07, e = Math.exp(-d * d);
                            df += (-2 * d / 0.07) * e * 0.09;
                            on2 = Math.max(on2, e);
                        }
                        const t = [Math.cos(th), 0, -Math.sin(th)];
                        n = norm3([n[0] - t[0] * df * inBody, n[1], n[2] - t[2] * df * inBody]);
                        q0.fin = on2 * inBody;
                    } else q0.fin = 0;
                    // a bead ring under the lip and above the foot
                    for (const yb of [-134, -14]) {
                        const d = (Y - yb) / 2.4;
                        if (Math.abs(d) < 1.5) n = norm3([n[0], n[1] + d * 0.8 * Math.exp(-d * d) * (1 + 0.5 * Math.sin(x * 1.6)), n[2]]);
                    }
                    // hammered and worn: a slow wander of the normal
                    n = norm3([n[0] + 0.04 * S.noise2(x * 0.12, y * 0.12, sd), n[1] + 0.04 * S.noise2(x * 0.12, y * 0.12, sd + 1), n[2]]);
                    brassAt(n, rgb, { rough: 0.32 });
                    // patina: brown-green in the hollows beside the fins and under the lip
                    const hollow = (q0.fin > 0.05 && q0.fin < 0.5 ? 0.4 : 0) + smooth(-118, -128, Y) * smooth(-140, -132, Y) * 0.6 + smooth(-20, -12, Y) * 0.4;
                    const pat = clamp(hollow * (0.5 + 0.5 * S.noise2(x * 0.08, y * 0.08, sd + 2)) + 0.25 * smooth(0.3, 0.8, S.noise2(x * 0.04, y * 0.05, sd + 3)));
                    toward(rgb, 46, 44, 26, pat * 0.6);
                    // worn bright on the lip and the fin edges where hands take it
                    toward(rgb, 255, 226, 150, (smooth(-146, -152, Y) * 0.25 + q0.fin * 0.15) * smooth(0.2, 0.7, rgb[0] / 255));
                },
                over: (g) => {
                    // the mouth: a thin dark ellipse, its far inner wall catching the lamp
                    const yT = P.y1 + 1.5, rT = 86, t = Math.abs((ey + yT) / 1000);
                    oval(g, 0, yT, rT, Math.max(1.6, t * rT), 0, '#100a05');
                    S.ink(g, Array.from({ length: 21 }, (_, i) => [Math.cos(Math.PI + (Math.PI * i) / 20) * rT * 0.96, yT + Math.sin(Math.PI + (Math.PI * i) / 20) * Math.max(1.6, t * rT) * 0.7]), { w: 1.4, color: '#c8964a', alpha: 0.6, taper: [0.6, 0.6] });
                    // verdigris specks, pits, a dent, scratches
                    for (let i = 0; i < 160; i++) {
                        const yy = -150 + r() * 146, rr = P.at(yy), x = (r() * 2 - 1) * rr * 0.9;
                        disc(g, x, yy, 0.3 + r() * r() * 1.2, r() < 0.4 ? `rgba(92,140,110,${0.3 + r() * 0.3})` : `rgba(20,12,4,${0.3 + r() * 0.3})`);
                    }
                    for (let i = 0; i < 30; i++) {
                        const yy = -140 + r() * 120, rr = P.at(yy), x = (r() * 2 - 1) * rr * 0.8, a = (r() - 0.5) * 0.8, l = 3 + r() * 10;
                        S.ink(g, [[x, yy], [x + Math.cos(a) * l, yy + Math.sin(a) * l]], { w: 0.4, color: r() < 0.5 ? '#ffe6a8' : '#2a1a08', alpha: 0.35 });
                    }
                    oval(g, 30, -60, 6, 4, 0.3, 'rgba(20,12,4,0.35)');
                    oval(g, 28.5, -61.5, 3.5, 2, 0.3, 'rgba(255,230,160,0.35)');
                },
            });
            sp.outline = outline;
            return sp;
        });
    }
    function mortar(g, o = {}) {
        const { x = 0, y = 0, s = 1, seed = 'a' } = o, ey = o.ey ?? y;
        const sp = mortarSprite(ey / s, resOf(g, s), seed);
        put(g, sp, x, y, s);
        return sp;
    }
    // A rod (a pestle, a candle's wick holder…) from p0 to p1, its radius along it rad(u),
    // painted per pixel in the page's frame so the lamp stays where it is.
    function rod(g, p0, p1, rad, shade, o = {}) {
        const ax = p1[0] - p0[0], ay = p1[1] - p0[1], L = Math.hypot(ax, ay), dx = ax / L, dy = ay / L, px = -dy, py = dx;
        const rmax = Math.max(...Array.from({ length: 21 }, (_, i) => rad(i / 20)));
        const res = resOf(g, 1, o.q ?? 1);
        const pts = [];
        for (let i = 0; i <= 40; i++) {
            const u = i / 40, rr = rad(u);
            pts.push([p0[0] + ax * u + px * rr, p0[1] + ay * u + py * rr]);
        }
        for (let i = 40; i >= 0; i--) {
            const u = i / 40, rr = rad(u);
            pts.push([p0[0] + ax * u - px * rr, p0[1] + ay * u - py * rr]);
        }
        // round ends
        const box = S.bbox([...pts, [p0[0] - rmax, p0[1] - rmax], [p1[0] + rmax, p1[1] + rmax], [p0[0] + rmax, p0[1] + rmax], [p1[0] - rmax, p1[1] - rmax]], 4);
        const sp = pixels({
            box, res,
            mask: (q) => {
                poly(q, pts);
                disc(q, p1[0], p1[1], rad(1), '#fff');
            },
            color: (x, y, rgb) => {
                const u = ((x - p0[0]) * dx + (y - p0[1]) * dy) / L, v = (x - p0[0]) * px + (y - p0[1]) * py;
                let rr = rad(clamp(u)), n;
                if (u > 1) {
                    // the rounded end: a hemisphere
                    const w = (u - 1) * L, q = Math.min(0.999, Math.hypot(w, v) / rr), z = Math.sqrt(1 - q * q);
                    n = norm3([(dx * w + px * v) / rr, (dy * w + py * v) / rr, z]);
                } else {
                    const q = clamp(v / rr, -0.999, 0.999), z = Math.sqrt(1 - q * q), sl = (rad(clamp(u + 0.01)) - rad(clamp(u - 0.01))) / (0.02 * L);
                    n = norm3([px * q - dx * sl * z, py * q - dy * sl * z, z]);
                }
                shade(n, u, v / rr, rgb, x, y);
            },
        });
        put(g, sp, 0, 0, 1);
        return sp;
    }
    function pestle(g, p0, p1, o = {}) {
        const sd = S.seedOf('pestle' + (o.seed ?? 0));
        rod(g, p0, p1, (u) => 9 + 2 * smooth(0.5, 0.05, u) + 6 * Math.sin(Math.PI * 0.5 * smooth(0.72, 1, u)), (n, u, v, rgb, x, y) => {
            brassAt(n, rgb, { rough: 0.28 });
            toward(rgb, 50, 40, 20, 0.3 * smooth(0.2, 0.8, S.noise2(x * 0.06, y * 0.06, sd)));
            // the grip worn bright
            toward(rgb, 255, 228, 160, 0.2 * smooth(0.5, 0.7, u) * smooth(0.95, 0.8, u) * smooth(0.1, 0.6, rgb[0] / 255));
        });
    }

    // ------------------------------------------------------------------ garlic
    // A head of white garlic: cloves swelling under a papery skin streaked with mauve, the
    // basal plate with its dry roots, the neck cut short with its papery wisps; and a clove
    // come loose. Seen from the side, lying as it was set down.
    const GARLIC = [[0, '#0c0a08'], [0.18, '#26201a'], [0.34, '#4e4438'], [0.5, '#7e7262'], [0.64, '#a89a86'], [0.78, '#cbbfa8'], [0.9, '#e2d9c6'], [1, '#f4efe2']];
    function garlicSprite(res, seed, rot = 0) {
        return memo(`garlic@${res}/${seed}/${rot.toFixed(2)}`, () => {
            const r = Motion.rng('garlic' + seed), sd = S.seedOf('garlic' + seed), L = S.lightFor(rot, LT);
            const W = 44 + r() * 6, H = 50 + r() * 6;
            // the cloves seen from the side: crescents fanned round the stem, the outer ones
            // leaning out, all meeting at the base plate (y = 0) and under the neck (y = −H)
            const cloves = [];
            const NC = 7;
            for (let i = 0; i < NC; i++) {
                const u = (i / (NC - 1)) * 2 - 1, lean = u * 0.55 + (r() - 0.5) * 0.08;
                cloves.push({ cx: u * W * 0.62, cy: -H * 0.46, rx: W * (0.3 + 0.08 * (1 - Math.abs(u))) * (0.92 + r() * 0.16), ry: H * 0.5, a: lean, front: 1 - Math.abs(u) });
            }
            const pts = [];
            const box = { x: -W * 1.3, y: -H * 1.45, w: W * 2.6, h: H * 1.75 };
            const sp = S.form({
                box, res, seed: 'garlic' + seed, light: L, relief: 0.9,
                mask: (g) => {
                    for (const c of cloves) oval(g, c.cx, c.cy, c.rx, c.ry, c.a, '#fff');
                    // the body that holds them, the neck drawn up to a point
                    oval(g, 0, -H * 0.45, W * 0.92, H * 0.48, 0, '#fff');
                    poly(g, [[-W * 0.28, -H * 0.8], [-W * 0.08, -H * 1.18], [-W * 0.02, -H * 1.36], [W * 0.05, -H * 1.36], [W * 0.1, -H * 1.18], [W * 0.3, -H * 0.8]], '#fff');
                },
                // each clove a gentle swelling: the grooves between them read as soft creases
                height: (x, y) => {
                    let best = 0;
                    for (const c of cloves) {
                        const ca = Math.cos(-c.a), sa = Math.sin(-c.a), dx = x - c.cx, dy = y - c.cy;
                        const u = (dx * ca - dy * sa) / c.rx, v = (dx * sa + dy * ca) / c.ry, q = 1 - u * u - v * v;
                        if (q > 0) best = Math.max(best, Math.sqrt(q) * (3.5 + 2.5 * c.front));
                    }
                    return best + 0.25 * S.noise2(x * 0.3, y * 0.3, sd);
                },
                ramp: GARLIC, soft: 0.9,
                stroke: { amp: 0.05, freq: 0.2, tone: 5 },
                mottle: { amp: 0.04, freq: 0.06 },
                spec: { amp: 0.16, power: 10, from: 0.5, to: 0.95, ragged: 0.7, color: '#fffaf2' },
                tint: (x, y, tone, rgb) => {
                    // the papery skin browns at the base, the neck dries to straw
                    toward(rgb, rgb[0] * 0.78, rgb[1] * 0.7, rgb[2] * 0.58, smooth(-H * 0.18, 0, y) * 0.55);
                    toward(rgb, rgb[0] * 0.95 + 8, rgb[1] * 0.88 + 4, rgb[2] * 0.7, smooth(-H * 0.85, -H * 1.2, y) * 0.6);
                    toward(rgb, 130, 104, 70, smooth(0.3, 0.08, tone) * 0.35);
                },
                over: (g) => {
                    // fine veins in the skin, along each clove; a few faint mauve streaks
                    for (const c of cloves) {
                        for (let k = 0; k < 5; k++) {
                            const u = (k / 4) * 1.4 - 0.7, ln = [];
                            for (let i = 0; i <= 10; i++) {
                                const v = (i / 10) * 1.8 - 0.9, x0 = u * c.rx * Math.sqrt(Math.max(0, 1 - v * v)), y0 = v * c.ry;
                                ln.push([c.cx + x0 * Math.cos(c.a) - y0 * Math.sin(c.a), c.cy + x0 * Math.sin(c.a) + y0 * Math.cos(c.a)]);
                            }
                            const mauve = r() < 0.18;
                            S.ink(g, ln, { w: mauve ? 1.4 : 0.4, color: mauve ? '#8a5a6a' : '#5e5246', alpha: mauve ? 0.14 : 0.16, taper: [1, 1] });
                        }
                    }
                    // a flap of skin lifting on one clove, its torn edge catching the light
                    const f = cloves[NC - 2];
                    S.ink(g, [[f.cx - 4, f.cy - 14], [f.cx + 4, f.cy - 9], [f.cx + 7, f.cy - 1], [f.cx + 6, f.cy + 7]].map(([x, y]) => [x + 0.8, y + 0.8]), { w: 0.9, color: '#3a3026', alpha: 0.35, taper: [1, 1] });
                    S.ink(g, [[f.cx - 4, f.cy - 14], [f.cx + 4, f.cy - 9], [f.cx + 7, f.cy - 1], [f.cx + 6, f.cy + 7]], { w: 0.6, color: '#fff8ea', alpha: 0.6, taper: [1, 1] });
                    // the base plate, a dark rim
                    S.ink(g, [[-W * 0.3, -1.5], [0, 1], [W * 0.3, -1.5]], { w: 2.4, color: '#4a3a2a', alpha: 0.7 });
                },
            });
            // the roots: a short tuft under the base plate, outside the skin
            const g2 = sp.canvas.getContext('2d');
            g2.setTransform(res, 0, 0, res, -box.x * res, -box.y * res);
            for (let i = 0; i < 46; i++) {
                const x0 = (r() - 0.5) * W * 0.5, a = Math.PI / 2 + (r() - 0.5) * 1.6, l = 3 + r() * 7;
                S.ink(g2, [[x0, -1], [x0 + Math.cos(a) * l * 0.5 + (r() - 0.5) * 1.5, -1 + Math.sin(a) * l * 0.5], [x0 + Math.cos(a) * l, -1 + Math.sin(a) * l]], { w: 0.5, color: r() < 0.5 ? '#b8a48a' : '#5a4836', alpha: 0.75, taper: [0, 0.8] });
            }
            sp.H = H;
            sp.W = W;
            return sp;
        });
    }
    function garlic(g, o = {}) {
        const { x = 0, y = 0, s = 1, seed = 'a', rot = 0 } = o;
        const sp = garlicSprite(resOf(g, s), seed, rot);
        put(g, sp, x, y, s, { rot });
        return sp;
    }
    function cloveSprite(res, seed, rot = 0) {
        return memo(`clove@${res}/${seed}/${rot.toFixed(2)}`, () => {
            const r = Motion.rng('clove' + seed);
            const pts = [];
            for (let i = 0; i <= 30; i++) {
                const u = i / 30;
                pts.push([-16 + u * 32, -Math.sin(Math.PI * u) * (11 + r() * 0.5) - 1.5 * Math.sin(Math.PI * u * 2)]);
            }
            for (let i = 30; i >= 0; i--) {
                const u = i / 30;
                pts.push([-16 + u * 32, Math.sin(Math.PI * u) * 3]);
            }
            const sp = S.form({
                box: S.bbox(pts, 6), res, seed: 'clove' + seed, light: S.lightFor(rot, LT), relief: 0.8,
                mask: (g) => poly(g, pts), ramp: GARLIC, soft: 0.9, stroke: { amp: 0.05, freq: 0.3, tone: 5 },
                spec: { amp: 0.35, power: 12, from: 0.5, to: 0.95, color: '#fffaf2' },
                over: (g) => {
                    for (let k = 0; k < 6; k++) S.ink(g, [[-14, -1 - k], [0, -3 - k * 1.6], [14, -1 - k]], { w: 0.5, color: k % 2 ? '#8a5a6a' : '#6a5e52', alpha: 0.15 });
                    oval(g, -15, 0, 2.5, 2, 0, '#6a5a48');
                },
            });
            return sp;
        });
    }

    // ------------------------------------------------------------------ red onion
    // A red onion: a flattened globe with a dry neck; the outer skin papery and coppery,
    // flaked off in a patch where the glossy magenta layer shows; fine veins from pole to
    // pole; the root disc with its whiskers. And one cut in half: rings of white and magenta.
    const ONION = [[0, '#0a0305'], [0.18, '#1c060d'], [0.33, '#320b18'], [0.48, '#4a1226'], [0.62, '#632036'], [0.75, '#7e3a4c'], [0.87, '#a0646c'], [0.95, '#c49a94'], [1, '#e6d0c4']];
    function onionSprite(res, seed, rot = 0) {
        return memo(`onion@${res}/${seed}/${rot.toFixed(2)}`, () => {
            const r = Motion.rng('onion' + seed), sd = S.seedOf('onion' + seed), L = S.lightFor(rot, LT);
            const RX = 56 + r() * 6, RY = 50 + r() * 4;
            const pts = [];
            for (let i = 0; i < 90; i++) {
                const a = (i / 90) * TAU, c = Math.cos(a), sn = Math.sin(a);
                // the neck at the top (sn = −1) drawn out to a point
                const neck = Math.pow(smooth(-0.6, -1, sn), 3);
                pts.push([c * RX * (1 - 0.8 * neck), sn * RY * (1 + 0.18 * neck) + (sn > 0 ? sn * 2 : 0)]);
            }
            const box = S.bbox([...pts, [0, -RY - 26]], 10);
            const flake = { x: -RX * 0.25 + r() * 10, y: RY * 0.05, rx: 22 + r() * 8, ry: 16 + r() * 6 };
            const inFlake = (x, y) => Math.hypot((x - flake.x) / flake.rx, (y - flake.y) / flake.ry) + 0.45 * S.noise2(x * 0.06, y * 0.06, sd + 5) + 0.15 * S.noise2(x * 0.3, y * 0.3, sd + 7);
            const sp = S.form({
                box, res, seed: 'onion' + seed, light: L,
                mask: (g) => {
                    poly(g, pts);
                    line(g, [[0, -RY], [2, -RY - 12], [6, -RY - 24]], 6, '#fff');
                },
                height: (x, y) => {
                    // veins from pole to pole
                    const w = Math.sqrt(Math.max(1, RX * RX * (1 - (y / RY) ** 2))), a = Math.asin(clamp(x / w));
                    return 0.35 * Math.cos(a * 34 + 1.4 * S.noise2(y * 0.03, 0, sd)) + 0.4 * S.noise2(x * 0.1, y * 0.1, sd + 1);
                },
                ramp: ONION, soft: 0.9,
                stroke: { amp: 0.05, freq: 0.08, tone: 6 },
                mottle: { amp: 0.05, freq: 0.04 },
                spec: { amp: 0.55, power: 18, from: 0.45, to: 0.9, ragged: 0.4, color: '#fff0ec' },
                tint: (x, y, tone, rgb) => {
                    // the papery outer skin: coppery and duller, except where it flaked off
                    const f = inFlake(x, y), paper = (0.35 + 0.65 * smooth(0.8, 1.2, f)) * (0.72 + 0.2 * S.noise2(x * 0.05, y * 0.03, sd + 2));
                    toward(rgb, rgb[0] * 0.8 + 30, rgb[1] * 0.75 + 18, rgb[2] * 0.5 + 8, paper);
                    // the neck dries to straw
                    toward(rgb, 170, 130, 96, smooth(-RY * 0.8, -RY * 1.05, y) * 0.7);
                },
                over: (g) => {
                    // the torn edge of the skin round the flake, lifted and pale
                    const edge = [];
                    for (let i = 0; i <= 30; i++) {
                        const a = (i / 30) * TAU;
                        const rr = 1 + 0.12 * S.noise2(Math.cos(a) * 2, Math.sin(a) * 2, sd + 6);
                        edge.push([flake.x + Math.cos(a) * flake.rx * rr, flake.y + Math.sin(a) * flake.ry * rr]);
                    }
                    S.ink(g, edge.slice(2, 13).map(([x, y]) => [x + 0.8, y + 0.9]), { w: 1.2, color: '#2a0a14', alpha: 0.3, taper: [1, 1] });
                    S.ink(g, edge.slice(2, 13), { w: 0.7, color: '#e8c0a0', alpha: 0.5, taper: [1, 1] });
                    // dry veins in the skin
                    for (let k = 0; k < 30; k++) {
                        const a = -1.3 + (k / 29) * 2.6 + (r() - 0.5) * 0.05, ln = [];
                        for (let i = 0; i <= 16; i++) {
                            const y = -RY * 0.95 + (i / 16) * RY * 1.9, w = RX * Math.sqrt(Math.max(0, 1 - (y / RY) ** 2));
                            ln.push([Math.sin(a) * w, y]);
                        }
                        S.ink(g, ln, { w: 0.5, color: r() < 0.5 ? '#3a0c1c' : '#e8b8a0', alpha: 0.18 + r() * 0.15, taper: [1, 1] });
                    }
                    // the root disc and its whiskers
                    oval(g, 0, RY - 1, 9, 3, 0, '#6a4a3a');
                    for (let i = 0; i < 40; i++) {
                        const x0 = (r() - 0.5) * 14, a = Math.PI / 2 + (r() - 0.5) * 2.4, l = 3 + r() * 8;
                        S.ink(g, [[x0, RY], [x0 + Math.cos(a) * l, RY + Math.sin(a) * l]], { w: 0.45, color: r() < 0.5 ? '#c4a890' : '#4a3020', alpha: 0.75, taper: [0, 0.8] });
                    }
                    // the dry neck's tip, split
                    S.ink(g, [[4, -RY - 14], [7, -RY - 25], [9, -RY - 30]], { w: 1, color: '#d8c0a0', alpha: 0.8, taper: [0, 1] });
                    S.ink(g, [[2, -RY - 14], [1, -RY - 24], [-2, -RY - 28]], { w: 0.8, color: '#8a6a50', alpha: 0.8, taper: [0, 1] });
                },
            });
            sp.RX = RX;
            sp.RY = RY;
            return sp;
        });
    }
    function onion(g, o = {}) {
        const { x = 0, y = 0, s = 1, seed = 'a', rot = 0 } = o;
        const sp = onionSprite(resOf(g, s), seed, rot);
        put(g, sp, x, y, s, { rot });
        return sp;
    }
    // half an onion, the cut face to the eye: rings of white flesh with magenta skins
    function onionHalf(g, o = {}) {
        const { x = 0, y = 0, s = 1, seed = 'h' } = o, res = resOf(g, s);
        const sp = memo(`onionhalf@${res}/${seed}`, () => {
            const sd = S.seedOf('oh' + seed), RX = 52, RY = 46;
            const pts = [];
            for (let i = 0; i < 80; i++) {
                const a = (i / 80) * TAU;
                pts.push([Math.cos(a) * RX * (1 + 0.03 * Math.sin(a * 3 + 1)), Math.sin(a) * RY - (Math.sin(a) < -0.9 ? 6 * (-Math.sin(a) - 0.9) * 10 : 0)]);
            }
            return pixels({
                box: S.bbox(pts, 6), res,
                mask: (q) => poly(q, pts),
                color: (x, y, rgb) => {
                    // rings about a point a little above the root
                    const cx = 0, cy = 6, q = Math.hypot(x / RX, (y - cy) / (RY + 2)), ring = q * 9 + 0.3 * S.noise2(x * 0.05, y * 0.05, sd);
                    const f = ring - Math.floor(ring), skin = smooth(0.82, 0.96, f), outer = smooth(0.9, 0.99, q);
                    // the cut face is flat and wet: lit evenly, glistening a little
                    const lit = 0.72 + 0.1 * S.noise2(x * 0.15, y * 0.15, sd + 1) - 0.25 * q * q;
                    const flesh = [236 * lit, 222 * lit, 228 * lit], mag = [150 * lit, 40 * lit, 90 * lit];
                    for (let i = 0; i < 3; i++) rgb[i] = flesh[i] + (mag[i] - flesh[i]) * Math.max(skin, outer);
                    // the flesh flushed pink near each skin
                    toward(rgb, 220 * lit, 150 * lit, 180 * lit, smooth(0.5, 0.82, f) * 0.35);
                    // a wet sheen towards the lamp
                    toward(rgb, 255, 250, 246, smooth(0.6, 0.95, 0.5 - x / RX * 0.4 - y / RY * 0.3 + 0.2 * S.noise2(x * 0.2, y * 0.2, sd + 2)) * 0.35);
                },
                over: (q) => {
                    // the skin's edge, a dark rim, the heart
                    q.strokeStyle = 'rgba(60,8,28,0.8)';
                    q.lineWidth = 2;
                    q.beginPath();
                    S.trace(q, pts);
                    q.stroke();
                    oval(q, 0, 8, 6, 9, 0, 'rgba(210,220,190,0.8)');
                },
            });
        });
        put(g, sp, x, y, s, { rot: o.rot ?? 0 });
        return sp;
    }

    // ------------------------------------------------------------------ eggs in a glazed dish
    // A shallow Triana dish: red clay, honey lead glaze inside running over the rim in drips,
    // its glaze crazed; three eggs nested in it, brown and white, speckled, one with a down
    // feather stuck to it.
    const DISH = profileOf([[56, 0], [60, -3], [58, -7], [80, -16], [118, -34], [146, -50], [156, -57], [158, -61], [152, -63]], 6);
    const EGG_BROWN = [[0, '#140a06'], [0.2, '#2e1a0e'], [0.38, '#5a3620'], [0.54, '#87593a'], [0.68, '#ad7d58'], [0.82, '#c99e7a'], [0.93, '#e0c0a0'], [1, '#f0dcc4']];
    function eggSprite(res, seed, rot, kind) {
        return memo(`egg@${res}/${seed}/${rot.toFixed(2)}/${kind}`, () => {
            const r = Motion.rng('egg' + seed), sd = S.seedOf('egg' + seed), L = S.lightFor(rot, LT);
            const a = 33 + r() * 3, b = 25 + r() * 2;
            const pts = [];
            for (let i = 0; i < 70; i++) {
                const t = (i / 70) * TAU, c = Math.cos(t);
                pts.push([c * a, Math.sin(t) * b * (1 - 0.13 * c)]);
            }
            return S.form({
                box: S.bbox(pts, 6), res, seed: 'egg' + seed, light: L,
                mask: (g) => poly(g, pts),
                height: (x, y) => 0.12 * S.noise2(x * 0.6, y * 0.6, sd),
                ramp: kind === 'white' ? RAMP.white : EGG_BROWN, soft: 0.95,
                mottle: { amp: 0.04, freq: 0.05 }, stroke: { amp: 0.03, freq: 0.1, tone: 5 },
                spec: { amp: 0.18, power: 8, from: 0.55, to: 0.98, ragged: 0.7, color: '#fff8f0' },
                tint: (x, y, tone, rgb) => {
                    // the light thrown back by the glaze into the shadow side
                    toward(rgb, 150, 110, 50, smooth(0.32, 0.1, tone) * 0.35);
                },
                over: (g) => {
                    for (let i = 0; i < (kind === 'white' ? 30 : 110); i++) {
                        const t = r() * TAU, d = Math.sqrt(r()) * 0.92;
                        disc(g, Math.cos(t) * a * d, Math.sin(t) * b * d, 0.25 + r() * r() * 1.1, kind === 'white' ? `rgba(160,140,120,${0.2 + r() * 0.2})` : `rgba(70,36,18,${0.25 + r() * 0.4})`);
                    }
                    if (seed === 'feather') {
                        // a down feather stuck on
                        const fx = 6, fy = -8;
                        S.ink(g, [[fx, fy], [fx + 10, fy - 6]], { w: 0.5, color: '#f4efe6', alpha: 0.9 });
                        for (let i = 0; i < 18; i++) {
                            const u = i / 18, bx = fx + u * 10, by = fy - u * 6, ang = -0.5 + (i % 2 ? 1 : -1) * (1 + r() * 0.6);
                            S.ink(g, [[bx, by], [bx + Math.cos(ang) * (3 + r() * 3), by + Math.sin(ang) * (3 + r() * 3)]], { w: 0.35, color: '#fbf8f2', alpha: 0.7, taper: [0, 0.8] });
                        }
                    }
                },
            });
        });
    }
    function eggDish(g, o = {}) {
        const { x = 0, y = 0, s = 1, seed = 'a' } = o, ey = (o.ey ?? y) / s, res = resOf(g, s);
        const sp = memo(`dish/${Math.round(ey / 20)}@${res}/${seed}`, () => {
            const P = DISH, on = onLathe(P, ey), q0 = {}, sd = S.seedOf('dish' + seed), r = Motion.rng('dish' + seed);
            const t = Math.abs((ey + P.y1) / 1000), R = 154, yR = P.y1 + 1;
            const outline = latheOutline(P, ey, 60, 158);
            const box = S.bbox(outline, 8);
            const HONEY = S.rampFn([[0, '#0c0702'], [0.2, '#2a1704'], [0.4, '#4e300a'], [0.58, '#714a12'], [0.74, '#916822'], [0.88, '#b48c3e'], [1, '#dcc07a']], 0.95);
            const CLAY = S.rampFn(RAMP.clay, 0.95);
            const glazeLine = (x) => -40 + 10 * S.noise2(x * 0.05, 0, sd) + (S.hashI(Math.floor(x / 9), 0, 1, sd) < 0.3 ? 14 * smooth(0, 4.5, (x % 9 + 9) % 9) * smooth(9, 4.5, (x % 9 + 9) % 9) : 0);
            return pixels({
                box, res,
                mask: (q) => poly(q, outline),
                color: (x, y, rgb) => {
                    // inside the rim's ellipse: the glazed hollow seen from above
                    const u = x / R, v = (y - yR) / (R * t);
                    if (u * u + v * v < 1 && v < 1) {
                        const qq = Math.hypot(u, v);
                        const n = norm3([-u * 0.8 * qq, -1, -v * 0.8 * qq + 0.3]);
                        const lam = Math.max(0, n[0] * LN[0] + n[1] * LN[1] + n[2] * LN[2]);
                        HONEY(clamp(0.15 + lam * 0.95 - 0.2 * smooth(0.7, 1, qq) * (v > 0 ? 1 : 0.4)), rgb);
                        // the glaze mirrors the lamp's window, soft
                        const hx = u + 0.25, hy = v + 0.35;
                        toward(rgb, 255, 244, 214, smooth(0.25, 0.05, Math.hypot(hx * 1.4, hy)) * 0.7);
                        return 1;
                    }
                    on(x, y, q0);
                    const lam = Math.max(0, q0.n[0] * LN[0] + q0.n[1] * LN[1] + q0.n[2] * LN[2]);
                    const tone = 0.12 + lam * 0.9;
                    // the outside: glaze run down from the rim in drips, bare red clay below
                    const glazed = q0.Y < glazeLine(x);
                    if (glazed) {
                        HONEY(clamp(tone), rgb);
                        toward(rgb, 255, 240, 200, smooth(0.8, 0.98, lam) * 0.5);
                    } else {
                        CLAY(clamp(tone * 0.9), rgb);
                        scaleRGB(rgb, 1.08, 0.86, 0.78, 1);
                    }
                },
                over: (q) => {
                    // crazing in the glaze: a fine net of dark hairlines
                    for (let i = 0; i < 140; i++) {
                        const a = r() * TAU, d = Math.sqrt(r()) * 0.95, x0 = Math.cos(a) * d * R, y0 = yR + Math.sin(a) * d * R * t;
                        const pts = [[x0, y0]];
                        for (let k = 0; k < 3; k++) pts.push([pts[k][0] + (r() - 0.5) * 16, pts[k][1] + (r() - 0.5) * 16 * t]);
                        S.ink(q, pts, { w: 0.35, color: '#2a1404', alpha: 0.35, taper: [0.3, 0.3] });
                    }
                    // the rim: bare where the glaze ran thin, a chip
                    S.ink(q, Array.from({ length: 41 }, (_, i) => [Math.cos(Math.PI * (i / 40)) * R, yR + Math.sin(Math.PI * (i / 40)) * R * t]), { w: 2.4, color: '#b06a3a', alpha: 0.55, taper: [0.3, 0.3] });
                    S.ink(q, Array.from({ length: 41 }, (_, i) => [Math.cos(Math.PI * 1.1 + Math.PI * 0.4 * (i / 40)) * R, yR + Math.sin(Math.PI * 1.1 + Math.PI * 0.4 * (i / 40)) * R * t]), { w: 1.2, color: '#fff2c8', alpha: 0.7, taper: [0.5, 0.5] });
                    oval(q, R * 0.55, yR + R * t * 0.83, 6, 2.6, 0.2, '#c88a5a');
                },
            });
        });
        put(g, sp, x, y, s);
        // the eggs, nested in the hollow
        const t = Math.abs((ey + DISH.y1) / 1000), yR = DISH.y1 + 1;
        const eggs = [[-44, yR + 6, 0.35, 'brown', 'e1'], [40, yR + 2, -0.5, 'white', 'e2'], [-2, yR + 22, 0.12, 'brown', 'feather']];
        g.save();
        g.translate(x, y);
        g.scale(s, s);
        for (const [ex, eyy, rot, kind, sd] of eggs) {
            const esp = eggSprite(resOf(g, 1), sd, rot, kind);
            // each egg shades the glaze under it
            S.put(g, shadowOf(esp, 5), { x: ex + 8, y: eyy + 7 + 22 * t, rot, alpha: 0.65 });
            S.put(g, esp, { x: ex, y: eyy, rot });
        }
        g.restore();
        return sp;
    }

    // ------------------------------------------------------------------ the knife
    // A kitchen knife lying on the stone, its handle jutting over the edge towards the eye:
    // the blade dark iron with a bright whetted edge and rust spots, a brass bolster, a
    // walnut handle with three rivets. from: the blade's tip; to: the handle's end.
    function knife(g, from, to, o = {}) {
        const r = Motion.rng('knife' + (o.seed ?? 0)), sd = S.seedOf('knife' + (o.seed ?? 0));
        const ax = to[0] - from[0], ay = to[1] - from[1], L = Math.hypot(ax, ay), dx = ax / L, dy = ay / L, px = -dy, py = dx;
        const P = (u, v) => [from[0] + dx * u * L + px * v, from[1] + dy * u * L + py * v];
        const W = o.w ?? 1; // its width as seen (foreshortened where it lies flat)
        const BL = 0.6; // where the blade meets the bolster
        const blade = [];
        for (let i = 0; i <= 20; i++) {
            const u = (i / 20) * BL;
            blade.push(P(u, -(5 + 13 * Math.pow(Math.min(1, u / BL * 1.2), 0.5)) * W * (u < 0.02 ? 0.3 : 1)));
        }
        for (let i = 20; i >= 0; i--) {
            const u = (i / 20) * BL;
            blade.push(P(u, 3.5 * W * Math.min(1, u / 0.1)));
        }
        const res = resOf(g);
        const box = S.bbox([...blade, P(1, 12), P(1, -12), P(BL, 16), P(BL, -22)], 6);
        const handle = [P(BL + 0.04, -9 * W), P(1, -11 * W), P(1.01, -6 * W), P(1.01, 5 * W), P(1, 9 * W), P(BL + 0.04, 7 * W)];
        const bolster = [P(BL - 0.005, -12 * W), P(BL + 0.045, -10 * W), P(BL + 0.045, 8 * W), P(BL - 0.005, 6 * W)];
        const sp = pixels({
            box, res,
            mask: (q) => {
                poly(q, blade, 'rgb(4,0,0)');
                poly(q, bolster, 'rgb(8,0,0)');
                poly(q, S.curve(handle, true, 4), 'rgb(12,0,0)');
            },
            color: (x, y, rgb, red) => {
                const u = ((x - from[0]) * dx + (y - from[1]) * dy) / L, v = (x - from[0]) * px + (y - from[1]) * py;
                const part = Math.round(red / 4);
                if (part === 1) {
                    // iron: a flat face, a bevel along the edge (v > 0 side is the edge)
                    const edge = 3.5 * W, bev = smooth(edge - 7 * W, edge - 1 * W, v);
                    const n = norm3([px * bev * 0.6, py * bev * 0.6 - 0.6, 1]);
                    metalAt(n, [70, 72, 74], { rough: 0.5, mirror: 0.6, ledge: 0.9, room: [12, 12, 12], lampCol: [230, 230, 222], ledgeCol: [120, 104, 84] }, rgb);
                    toward(rgb, 200, 204, 204, bev * 0.45);
                    // rust spots and pitting
                    const rust = smooth(0.35, 0.7, S.noise2(x * 0.1, y * 0.1, sd) + 0.2 * S.noise2(x * 0.5, y * 0.5, sd + 1));
                    toward(rgb, 110, 50, 20, rust * 0.6);
                } else if (part === 2) {
                    const n = norm3([0, -0.5 + (v / 12) * 0.3, 1]);
                    brassAt(n, rgb, { rough: 0.4 });
                } else {
                    // walnut, its grain along the handle, rounded across
                    const q = clamp(v / (10 * W), -1, 1), lam = Math.max(0, -q * 0.6 * LN[1] + 0.8 * LN[2] + 0.2) * 1.1;
                    const grainV = Math.sin(v * 1.3 + 4 * S.noise2(u * 6, v * 0.1, sd + 2)) * 0.5 + 0.5;
                    const tone = 0.1 + lam * 0.7 + 0.08 * grainV;
                    rgb[0] = 30 + 120 * tone;
                    rgb[1] = 16 + 70 * tone;
                    rgb[2] = 8 + 38 * tone;
                    toward(rgb, 230, 200, 160, smooth(-0.2, -0.8, q) * 0.25);
                }
            },
            over: (q) => {
                // the rivets
                for (const u of [BL + 0.1, BL + 0.22, BL + 0.34]) {
                    const c = P(u, -1 * W);
                    disc(q, c[0] + 0.6, c[1] + 0.8, 3.2, 'rgba(10,6,2,0.6)');
                    disc(q, c[0], c[1], 2.8, '#b88a3a');
                    disc(q, c[0] - 0.9, c[1] - 0.9, 1.2, '#fff0c0');
                }
                // the edge's line of light, nicked in two places
                const e = [];
                for (let i = 0; i <= 20; i++) e.push(P((i / 20) * BL * 0.98 + 0.01, 3 * W * Math.min(1, ((i / 20) * BL) / 0.1)));
                S.ink(q, e, { w: 0.8, color: '#f4f6f2', alpha: 0.75, taper: [0.8, 0.4] });
                for (const u of [0.22, 0.4]) disc(q, ...P(u, 3 * W), 1.2, 'rgba(30,26,22,0.9)');
                // scratches on the blade from the whetstone, slanting
                for (let i = 0; i < 40; i++) {
                    const u = r() * BL * 0.95, v = -r() * 14 * W, a = 0.3;
                    const p0 = P(u, v), p1 = P(u + 0.02, v + 2 * W);
                    S.ink(q, [p0, p1], { w: 0.3, color: r() < 0.5 ? '#d8dcdc' : '#1a1a1a', alpha: 0.3 });
                }
            },
        });
        put(g, sp, 0, 0, 1);
        return { sp, P };
    }

    // ------------------------------------------------------------------ linen
    // A linen cloth laid on the ledge, its end hanging over the front: folds that open out as
    // they fall, the creases of its folding in a chest, a hem with its stitches, a band of
    // drawn-thread work, the weave itself at close range, a wine stain.
    //   x0, x1: its width on the ledge; y: the ledge's arris; drop: how far it hangs; topY:
    //   where it starts back on the ledge
    function linen(g, o) {
        const { x0, x1, y, drop: dropL = 160, topY = y - 30, seed = 'l' } = o, res = resOf(g, 1, o.q ?? 1);
        const sd = S.seedOf('linen' + seed), r = Motion.rng('linen' + seed);
        const W = x1 - x0;
        // folds: a sum of waves whose amplitude grows as the cloth falls
        const folds = Array.from({ length: 9 }, () => [0.5 + r() * 3.2, r() * TAU, 0.15 + r() * 0.6]);
        const fold = (x, dy) => {
            let h = 0;
            const k = smooth(0, dropL * 0.6, dy);
            for (const [f, ph, a] of folds) h += a * Math.sin(((x - x0) / W) * f * TAU * 1.1 + ph + dy * 0.006 * f + 0.8 * S.noise2(x * 0.01, dy * 0.01, sd + f)) * (1.5 + 6 * k);
            return h;
        };
        // the hem is not straight: it follows the folds
        const hemY = (x) => y + dropL + fold(x, dropL) * 0.45 + 5 * S.noise2(x * 0.02, 0, sd);
        const pts = [[x0 + 14, topY + 6], [x0 + W * 0.3, topY - 2], [x0 + W * 0.62, topY + 4], [x1 - 30, topY - 1], [x1 - 4, topY + 9], [x1 + 6, (topY + y) / 2 + 3], [x1 + 2, y]];
        for (let i = 0; i <= 40; i++) {
            const x = x1 + 2 - ((x1 - x0 + 4) * i) / 40;
            pts.push([x, hemY(x)]);
        }
        pts.push([x0 - 2, y]);
        const RAMPL = S.rampFn([[0, '#0e0c0a'], [0.18, '#26221d'], [0.34, '#4e4840'], [0.5, '#7c7466'], [0.64, '#a69c8a'], [0.78, '#c8bea9'], [0.9, '#e0d8c6'], [1, '#f2ecde']], 0.95);
        const crease = [];
        for (let i = 0; i < 3; i++) crease.push(x0 + W * (0.22 + i * 0.27 + (r() - 0.5) * 0.05));
        const sp = pixels({
            box: S.bbox(pts, 10), res,
            mask: (q) => poly(q, pts),
            color: (x, yy, rgb) => {
                let n;
                if (yy < y) {
                    // lying on the ledge: faces up, a little rumpled
                    n = norm3([0.08 * S.noise2(x * 0.03, yy * 0.08, sd), -1, 0.15 + 0.1 * S.noise2(x * 0.05, yy * 0.1, sd + 1)]);
                } else {
                    // over the arris it turns down; then the folds
                    const dy = yy - y, e = 0.8;
                    const gx = (fold(x + e, dy) - fold(x - e, dy)) / (2 * e);
                    const turn = smooth(14, 0, dy);
                    n = norm3([-gx * 0.55, -turn * 0.9, 1]);
                }
                let lam = n[0] * LN[0] + n[1] * LN[1] + n[2] * LN[2];
                // the weave: warp and weft at close range, slubs in the thread
                const wv = Math.sin(x * 2.4) * Math.sin(yy * 2.4 + 1.5) * 0.5 + 0.5;
                const slub = S.noise2(x * 0.08, yy * 1.2, sd + 3) * 0.04 + S.noise2(x * 1.3, yy * 0.07, sd + 4) * 0.03;
                let tone = 0.08 + Math.max(0, lam) * (yy < y ? 0.82 : 0.95) + 0.04 * (wv - 0.5) + slub;
                // the creases of its folding: a sharp ridge with a shadow on one side
                for (const c of crease) {
                    const d = x - c - (yy - y) * 0.05;
                    tone += 0.12 * Math.exp(-((d + 1.2) ** 2) / 0.8) - 0.1 * Math.exp(-((d - 1.5) ** 2) / 2.5);
                }
                const hc = yy - (y + 34);
                tone += 0.1 * Math.exp(-((hc + 1) ** 2) / 0.8) - 0.08 * Math.exp(-((hc - 1.5) ** 2) / 2.5);
                RAMPL(clamp(tone), rgb);
                // a pale wine stain
                const st = Math.hypot((x - (x0 + W * 0.7)) / 22, (yy - (y + dropL * 0.45)) / 16) + 0.15 * S.noise2(x * 0.1, yy * 0.1, sd + 5);
                if (st < 1.05) toward(rgb, rgb[0] * 0.86, rgb[1] * 0.72, rgb[2] * 0.76, (st > 0.85 ? 0.8 : 0.4));
            },
            over: (q) => {
                // the hem: turned up, its stitches
                const hem = [], hem2 = [];
                for (let i = 0; i <= 60; i++) {
                    const x = x0 + (W * i) / 60;
                    hem.push([x, hemY(x) - 2]);
                    hem2.push([x, hemY(x) - 12]);
                }
                S.ink(q, hem2.map(([a, b]) => [a, b + 1]), { w: 1.2, color: '#1e1a14', alpha: 0.4 });
                S.ink(q, hem2, { w: 0.7, color: '#faf6ec', alpha: 0.5 });
                for (let i = 2; i < 60; i += 2) {
                    const p = hem2[i];
                    S.ink(q, [[p[0] - 1.2, p[1] + 2], [p[0] + 0.8, p[1] + 4.2]], { w: 0.5, color: '#3a342a', alpha: 0.5 });
                }
                // drawn-thread work: a band of little ladders where threads were pulled
                for (let i = 0; i <= 120; i++) {
                    const x = x0 + 4 + ((W - 8) * i) / 120, yb = y + 24 + fold(x, 24) * 0.0;
                    q.fillStyle = 'rgba(8,6,4,0.55)';
                    q.fillRect(x - 0.5, yb, 1.1, 5);
                    if (i % 3 === 0) {
                        q.fillStyle = 'rgba(250,246,236,0.5)';
                        q.fillRect(x - 0.3, yb + 1.5, 0.6, 2);
                    }
                }
                S.ink(q, [[x0, y + 23], [x1, y + 23]], { w: 0.6, color: '#f6f0e2', alpha: 0.45 });
                S.ink(q, [[x0, y + 30], [x1, y + 30]], { w: 0.6, color: '#2a241c', alpha: 0.35 });
                // a loose thread
                S.ink(q, [[x0 + W * 0.33, hemY(x0 + W * 0.33)], [x0 + W * 0.335, hemY(x0 + W * 0.33) + 8], [x0 + W * 0.32, hemY(x0 + W * 0.33) + 15]], { w: 0.5, color: '#d8d0c0', alpha: 0.8 });
                // a mend: a darn, small cross-hatching
                const mx = x0 + W * 0.18, my = y + dropL * 0.6;
                for (let i = 0; i < 8; i++) {
                    S.ink(q, [[mx - 6, my - 6 + i * 1.6], [mx + 6, my - 6 + i * 1.6]], { w: 0.45, color: '#ece6d6', alpha: 0.55 });
                    S.ink(q, [[mx - 6 + i * 1.6, my - 6], [mx - 6 + i * 1.6, my + 6]], { w: 0.4, color: '#4a4236', alpha: 0.3 });
                }
            },
        });
        put(g, sp, 0, 0, 1);
        return { hemY, pts };
    }


    // ------------------------------------------------------------------ the quince
    // A quince hanging by its stalk: a lumpy golden pear, five bosses round the calyx, a
    // grey felt of down left near the stalk and in the hollows, russet freckles and a bruise,
    // the dry calyx a crown of brown sepals in its pit, a dried leaf still on the stalk.
    const QUINCE = [[0, '#0e0802'], [0.16, '#261a05'], [0.3, '#4e3509'], [0.44, '#7c560e'], [0.58, '#a47818'], [0.71, '#c09428'], [0.83, '#d4ae46'], [0.93, '#e4c878'], [1, '#f2e2b0']];
    function quinceSprite(res, seed, rot = 0) {
        return memo(`quince@${res}/${seed}/${rot.toFixed(2)}`, () => {
            const r = Motion.rng('quince' + seed), sd = S.seedOf('quince' + seed);
            // hanging: the stalk at the top (y = 0), the calyx at the bottom. A pear's profile:
            // a short neck under the stalk, sloping shoulders, the body widest low down, the
            // bottom rounded and bossed round the calyx
            const pear = (t) => (t < 0.6 ? 0.3 + 0.7 * Math.pow(Math.sin((Math.PI / 2) * (t / 0.6)), 1.4) : Math.sqrt(Math.max(0, 1 - Math.pow((t - 0.6) / 0.4, 2))));
            const right = [], left = [];
            for (let i = 0; i <= 50; i++) {
                const t = i / 50, y = 10 + t * 128, lump = 1 + 0.05 * S.noise2(t * 5, 1, sd) + (t > 0.75 ? 0.04 * Math.sin(t * 40) : 0);
                right.push([58 * pear(t) * lump * (1 + 0.03 * S.noise2(t * 7, 3, sd)), y]);
                left.push([-58 * pear(t) * lump * (1 + 0.03 * S.noise2(t * 7, 5, sd)), y]);
            }
            // the neck's top, rounded into the stalk's cavity
            const pts = [[0, 4], ...right, ...left.reverse()];
            const box = S.bbox([...pts, [0, -6]], 12);
            const down = (x, y) => clamp(smooth(80, 20, y) * 0.9 + 0.5 * S.noise2(x * 0.05, y * 0.05, sd + 2) - 0.1);
            return S.form({
                box, res, seed: 'quince' + seed, light: S.lightFor(rot, LT), relief: 0.95,
                mask: (g) => poly(g, pts),
                height: (x, y) => {
                    // bosses and slow lumps; the calyx pit and the stalk's cavity
                    let h = 2.2 * S.noise2(x * 0.03, y * 0.03, sd) + 0.5 * S.noise2(x * 0.12, y * 0.12, sd + 1);
                    h -= 9 * Math.exp(-(Math.pow(x / 10, 2) + Math.pow((y - 136) / 7, 2)));
                    h -= 5 * Math.exp(-(Math.pow(x / 7, 2) + Math.pow((y - 4) / 8, 2)));
                    return h;
                },
                ramp: QUINCE, soft: 0.92,
                stroke: { amp: 0.05, freq: 0.06, tone: 7 },
                mottle: { amp: 0.04, freq: 0.03 },
                spec: { amp: 0.25, power: 9, from: 0.5, to: 0.95, ragged: 0.7, color: '#fff8dc' },
                tint: (x, y, tone, rgb) => {
                    // green at the shoulders, the down a grey felt that dulls the gold
                    toward(rgb, rgb[0] * 0.78, rgb[1] * 0.92, rgb[2] * 0.5, smooth(50, 10, y) * 0.55);
                    const d = down(x, y);
                    toward(rgb, (rgb[0] + rgb[1] + rgb[2]) / 3 + 30, (rgb[0] + rgb[1] + rgb[2]) / 3 + 26, (rgb[0] + rgb[1] + rgb[2]) / 3 + 12, d * 0.75);
                    // a soft brown bruise low on the shadow side
                    const b = Math.hypot((x - 26) / 22, (y - 104) / 18) + 0.2 * S.noise2(x * 0.1, y * 0.1, sd + 3);
                    toward(rgb, rgb[0] * 0.55, rgb[1] * 0.42, rgb[2] * 0.3, smooth(1, 0.6, b) * 0.6);
                    // bounce from below, warm
                    toward(rgb, 110, 80, 30, smooth(0.3, 0.08, tone) * 0.4);
                },
                over: (g) => {
                    // russet freckles
                    for (let i = 0; i < 140; i++) {
                        const a = r() * TAU, d = Math.sqrt(r()) * 52;
                        disc(g, Math.cos(a) * d, 72 + Math.sin(a) * d * 1.05, 0.3 + r() * r() * 1.4, `rgba(96,58,16,${0.25 + r() * 0.4})`);
                    }
                    // the felt of down: fine short hairs in patches
                    for (let i = 0; i < 700; i++) {
                        const x = (r() - 0.5) * 120, y = r() * 140;
                        if (down(x, y) < 0.35 + r() * 0.3) continue;
                        const a = r() * TAU;
                        S.ink(g, [[x, y], [x + Math.cos(a) * 2.2, y + Math.sin(a) * 2.2]], { w: 0.35, color: '#e6e0cc', alpha: 0.35, taper: [0.3, 0.8] });
                    }
                    // the calyx: dry brown sepals in their pit, a few hairs of the stamens
                    for (let k = 0; k < 5; k++) {
                        const a = (k / 5) * TAU + 0.3, tip = [Math.cos(a) * 11, 136 + Math.sin(a) * 6];
                        poly(g, [[Math.cos(a - 0.5) * 4, 136 + Math.sin(a - 0.5) * 2.5], tip, [Math.cos(a + 0.5) * 4, 136 + Math.sin(a + 0.5) * 2.5]], '#5a3a18');
                        S.ink(g, [[0, 136], tip], { w: 0.6, color: '#c8a070', alpha: 0.6 });
                    }
                    disc(g, 0, 136, 3, '#2a1806');
                    for (let i = 0; i < 12; i++) S.ink(g, [[0, 136], [(r() - 0.5) * 7, 136 + (r() - 0.5) * 5]], { w: 0.35, color: '#8a6a40', alpha: 0.8 });
                },
            });
        });
    }
    // A thing hung on a string from above: the string comes down from `top` to the stalk at
    // (x, y), knotted round it. Returns nothing; paints the string over what is there.
    function hangString(g, top, at, o = {}) {
        const mid = [(top[0] + at[0]) / 2 + (o.sway ?? 3), (top[1] + at[1]) / 2];
        cord(g, [top, mid, [at[0], at[1] - 18], at], o.w ?? 3.4, { seed: o.seed ?? 'hs', color: o.color ?? [196, 166, 118] });
        // the knot and its tails
        oval(g, at[0], at[1] - 4, 5, 4, 0.3, 'rgb(60,46,30)');
        cord(g, [[at[0] - 4, at[1] - 6], [at[0] + 3, at[1] - 1], [at[0] + 5, at[1] - 8]], 2.2, { seed: 'k' + (o.seed ?? ''), color: o.color ?? [150, 122, 84] });
        cord(g, [[at[0] + 3, at[1] - 2], [at[0] + 9, at[1] + 8], [at[0] + 8, at[1] + 18]], 2, { seed: 't' + (o.seed ?? ''), color: o.color ?? [150, 122, 84] });
    }
    function quince(g, o = {}) {
        const { x = 0, y = 0, s = 1, seed = 'a' } = o, res = resOf(g, s);
        const sp = quinceSprite(res, seed);
        // the stalk, woody, and a dried leaf still on it
        g.save();
        g.translate(x, y);
        g.scale(s, s);
        line(g, [[0, 16], [-1, 4], [1, -8]], 6, '#3a2a14');
        line(g, [[-1.5, 12], [-2, 0]], 1.4, 'rgba(200,170,120,0.6)');
        const leaf = memo(`qleaf@${res}/${seed}`, () => {
            const pts = [];
            for (let i = 0; i <= 30; i++) {
                const u = i / 30;
                pts.push([u * 70, -Math.sin(Math.PI * Math.pow(u, 0.8)) * 20 * (1 - 0.2 * u)]);
            }
            for (let i = 30; i >= 0; i--) {
                const u = i / 30;
                pts.push([u * 70, Math.sin(Math.PI * Math.pow(u, 0.8)) * 15 * (1 - 0.2 * u) + Math.sin(u * 9) * 2]);
            }
            return S.form({
                box: S.bbox(pts, 6), res, seed: 'ql' + seed, light: S.lightFor(-2.6, LT), relief: 0.4,
                mask: (q) => poly(q, pts),
                height: (x2, y2) => -0.06 * Math.abs(y2) * 6 + 2 * Math.sin(x2 * 0.25) * smooth(0, 10, Math.abs(y2)),
                ramp: [[0, '#120a04'], [0.25, '#3a2a10'], [0.45, '#6a5020'], [0.62, '#8e7034'], [0.78, '#ae9050'], [0.9, '#cbb07a'], [1, '#e6d4aa']], soft: 0.9,
                stroke: { amp: 0.08, freq: 0.2, tone: 4 },
                edge: { rough: 1.6, freq: 0.3, amp: 0.8 },
                over: (q) => {
                    S.ink(q, [[0, 0], [35, 1], [70, -2]], { w: 1.2, color: '#d8c090', alpha: 0.7, taper: [0.2, 1] });
                    for (let k = 1; k < 7; k++) {
                        const x2 = k * 9;
                        S.ink(q, [[x2, 0.5], [x2 + 8, -12 + k * 0.6]], { w: 0.5, color: '#3a2a10', alpha: 0.5 });
                        S.ink(q, [[x2, 0.5], [x2 + 8, 10 - k * 0.5]], { w: 0.5, color: '#3a2a10', alpha: 0.5 });
                    }
                },
            });
        });
        S.put(g, leaf, { x: -2, y: 2, rot: -2.6 });
        S.put(g, sp, { x: 0, y: 6 });
        g.restore();
        return sp;
    }

    // ------------------------------------------------------------------ the cabbage
    // A cabbage hanging by its stalk: a tight blue-green head veined with pale ribs that
    // spring from the stalk, its outer leaves loosened and curling out at their edges (their
    // paler undersides showing), the waxy bloom, a hole eaten by a caterpillar, water caught
    // in a leaf's fold.
    const CABBAGE = [[0, '#020a08'], [0.16, '#071a14'], [0.3, '#112e22'], [0.44, '#1f4632'], [0.57, '#356246'], [0.7, '#548060'], [0.82, '#80a084'], [0.92, '#b4c8b0'], [1, '#dde8d8']];
    function cabbageHead(res, seed) {
        return memo(`cabhead@${res}/${seed}`, () => {
            const r = Motion.rng('cab' + seed), sd = S.seedOf('cab' + seed), R = 92;
            const pts = [];
            for (let i = 0; i < 90; i++) {
                const a = (i / 90) * TAU;
                pts.push([Math.cos(a) * R * (1 + 0.04 * S.noise2(Math.cos(a), Math.sin(a), sd)), 100 + Math.sin(a) * R * 0.94]);
            }
            // the ribs: from the stalk (top) down and round the head
            const ribAt = (x, y) => {
                const dx = x, dy = y - 6, a = Math.atan2(dx, dy);
                return Math.abs(Math.sin(a * 6.5 + 0.8 * S.noise2(x * 0.01, y * 0.01, sd)));
            };
            return S.form({
                box: S.bbox(pts, 8), res, seed: 'cab' + seed, light: LT, relief: 0.95,
                mask: (g) => poly(g, pts),
                height: (x, y) => {
                    const rib = ribAt(x, y);
                    // leaves overlap in layers: a step where each leaf's edge lies
                    const lat = (y - 100) / R + 0.18 * S.noise2(x * 0.02, y * 0.02, sd + 1);
                    const step = 2.2 * (lat * 3.2 - Math.floor(lat * 3.2));
                    return 2.4 * Math.pow(1 - rib, 6) + step * smooth(-0.6, 0.1, lat) + 0.4 * S.noise2(x * 0.15, y * 0.15, sd + 2);
                },
                ramp: CABBAGE, soft: 0.9,
                stroke: { amp: 0.06, freq: 0.07, tone: 6 },
                mottle: { amp: 0.05, freq: 0.03 },
                spec: { amp: 0.2, power: 8, from: 0.5, to: 0.95, ragged: 0.8, color: '#e8f0f0' },
                tint: (x, y, tone, rgb) => {
                    // the bloom: a waxy blue-grey on the lit side
                    toward(rgb, rgb[0] * 0.9 + 16, rgb[1] * 0.95 + 18, rgb[2] * 1.1 + 26, smooth(0.45, 0.8, tone) * 0.35);
                    // the ribs, pale
                    const rib = ribAt(x, y);
                    toward(rgb, 206, 220, 180, Math.pow(1 - rib, 10) * 0.6 * smooth(0.2, 0.5, tone));
                },
                over: (g) => {
                    // fine veins branching off the ribs
                    for (let i = 0; i < 70; i++) {
                        const a = (r() - 0.5) * 2.6, rr = 20 + r() * 70, x0 = Math.sin(a) * rr, y0 = 6 + Math.cos(a) * rr, b = a + (r() < 0.5 ? 0.7 : -0.7), l = 6 + r() * 14;
                        S.ink(g, [[x0, y0], [x0 + Math.sin(b) * l, y0 + Math.cos(b) * l]], { w: 0.5, color: '#cfe0bc', alpha: 0.25, taper: [0.3, 1] });
                    }
                    // a caterpillar's hole with a brown lip
                    oval(g, -30, 150, 6, 4, 0.4, '#04100a');
                    g.strokeStyle = 'rgba(150,120,60,0.8)';
                    g.lineWidth = 0.8;
                    g.beginPath();
                    g.ellipse(-30, 150, 6, 4, 0.4, 0, TAU);
                    g.stroke();
                    // water caught in a leaf's fold
                    for (const [x0, y0, rr] of [[34, 158, 3.2], [40, 162, 1.6], [-50, 118, 2]]) drop(g, x0, y0, rr, { dark: [30, 60, 40], lit: [220, 240, 220] });
                },
            });
        });
    }
    function cabbageLeaf(res, seed, rot, len, wid) {
        return memo(`cableaf@${res}/${seed}/${rot.toFixed(2)}`, () => {
            const r = Motion.rng('cl' + seed), sd = S.seedOf('cl' + seed);
            // a broad leaf: base at (0, 0), along +x, its margin frilled and curled back
            const pts = [];
            for (let i = 0; i <= 40; i++) {
                const u = i / 40;
                pts.push([u * len, -wid * Math.pow(Math.sin(Math.PI * Math.min(1, u * 0.95 + 0.05)), 0.7) * (1 + 0.1 * Math.sin(u * 23 + sd) + 0.05 * Math.sin(u * 61 + sd * 2))]);
            }
            for (let i = 40; i >= 0; i--) {
                const u = i / 40;
                pts.push([u * len, wid * 0.8 * Math.pow(Math.sin(Math.PI * Math.min(1, u * 0.95 + 0.05)), 0.7) * (1 + 0.11 * Math.sin(u * 19 + 2 + sd) + 0.05 * Math.sin(u * 53 + sd))]);
            }
            return S.form({
                box: S.bbox(pts, 8), res, seed: 'cl' + seed, light: S.lightFor(rot, LT), relief: 0.6,
                mask: (g) => poly(g, pts),
                height: (x, y) => 1.4 * Math.sin(Math.atan2(y, x - len * 0.1) * 9) * smooth(0.1, 0.5, x / len) + 0.5 * S.noise2(x * 0.1, y * 0.1, sd) - 3 * smooth(4, 0, Math.abs(y)),
                ramp: CABBAGE, soft: 0.9,
                stroke: { amp: 0.07, freq: 0.1, tone: 5 },
                edge: { rough: 1.5, freq: 0.25, amp: 0.8 },
                tint: (x, y, tone, rgb, m) => {
                    toward(rgb, rgb[0] * 0.9 + 16, rgb[1] * 0.95 + 18, rgb[2] * 1.1 + 24, smooth(0.45, 0.8, tone) * 0.3);
                    // the margin curls back: its pale underside shows along the edge
                    toward(rgb, 190, 210, 170, smooth(0.12, 0.02, m) * 0.6 * smooth(0.3, 0.6, x / len));
                },
                over: (g) => {
                    S.ink(g, S.curve([[0, 0], [len * 0.35, -3], [len * 0.7, -2], [len * 0.95, -6]], false, 6), { w: 6, color: '#b8ccaa', alpha: 0.5, taper: [0.1, 1] });
                    S.ink(g, S.curve([[0, 3], [len * 0.4, 1], [len * 0.9, -3]], false, 6), { w: 1.5, color: '#163020', alpha: 0.35, taper: [0.1, 1] });
                    const rv = Motion.rng('cv' + seed);
                    for (let k = 1; k < 8; k++) {
                        const x0 = (k / 8) * len * 0.9;
                        for (const side of [-1, 1]) {
                            const e = [x0 + 22 + rv() * 8, side * wid * (0.55 + rv() * 0.15)], m = [x0 + 6, side * wid * 0.3];
                            S.ink(g, S.curve([[x0, side * 2], m, e], false, 6), { w: 1.1, color: '#b8ccaa', alpha: 0.28, taper: [0.2, 1] });
                            S.ink(g, S.curve([m, [m[0] + 10, m[1] + side * 6], [m[0] + 14, m[1] + side * 14]], false, 4), { w: 0.6, color: '#b8ccaa', alpha: 0.2, taper: [0.2, 1] });
                        }
                    }
                },
            });
        });
    }
    function cabbage(g, o = {}) {
        const { x = 0, y = 0, s = 1, seed = 'a' } = o, res = resOf(g, s);
        g.save();
        g.translate(x, y);
        g.scale(s, s);
        // the stalk, cut, with the string round it
        rod(g, [0, -2], [0, 22], () => 9, (n, u, v, rgb) => {
            const lam = Math.max(0, n[0] * LN[0] + n[1] * LN[1] + n[2] * LN[2]);
            rgb[0] = 30 + 150 * lam;
            rgb[1] = 44 + 170 * lam;
            rgb[2] = 30 + 120 * lam;
        });
        oval(g, 0, -2, 9, 3, 0, '#d6dcb8');
        const head = cabbageHead(res, seed);
        // loose outer leaves behind, curling out
        for (const [a, len, wid, sd] of [[2.3, 150, 70, 'l1'], [0.9, 140, 64, 'l2']]) {
            const lf = cabbageLeaf(res, seed + sd, a, len, wid);
            S.put(g, lf, { x: 0, y: 30, rot: a });
        }
        S.put(g, head, { x: 0, y: 0 });
        // and two in front, wrapping the head, their own shadows on it
        for (const [a, len, wid, sd, ox, oy] of [[1.75, 130, 56, 'l3', -6, 34], [1.2, 118, 52, 'l4', 10, 40]]) {
            const lf = cabbageLeaf(res, seed + sd, a, len, wid);
            g.save();
            g.globalCompositeOperation = 'source-atop';
            S.put(g, shadowOf(lf, 6), { x: ox + 8, y: oy + 10, rot: a, alpha: 0.55 });
            g.restore();
            S.put(g, lf, { x: ox, y: oy, rot: a });
        }
        g.restore();
        return head;
    }

    // ------------------------------------------------------------------ the melon
    // A piel de sapo melon on the sill, a slice cut from it and laid in front on its side:
    // the slice's flat face is a pale half moon (the hidden moon of this picture), green-white
    // flesh with the seed bed along its straight edge, the rind a dark green arc speckled with
    // the yellow-green «toad skin». Juice glistening, a seed stuck on the stone.
    const MELON_RIND = [[0, '#030a05'], [0.18, '#0a1a0c'], [0.34, '#183218'], [0.5, '#2a4c24'], [0.64, '#40683a'], [0.78, '#5e8656'], [0.9, '#8cae7c'], [1, '#c8dcb0']];
    function melonBody(res, seed) {
        return memo(`melon@${res}/${seed}`, () => {
            const r = Motion.rng('melon' + seed), sd = S.seedOf('melon' + seed);
            // lying on its side: an oval, a wedge cut out of its front top (the gap)
            const RX = 150, RY = 96;
            const pts = [];
            for (let i = 0; i < 100; i++) {
                const a = (i / 100) * TAU;
                pts.push([Math.cos(a) * RX * (1 + 0.02 * S.noise2(Math.cos(a) * 3, 0, sd)), -RY + Math.sin(a) * RY]);
            }
            const toad = (x, y) => smooth(0.25, 0.55, S.noise2(x * 0.06, y * 0.09, sd) + 0.4 * S.noise2(x * 0.2, y * 0.25, sd + 1));
            const sp = S.form({
                box: S.bbox(pts, 8), res, seed: 'melon' + seed, light: LT, relief: 0.9,
                mask: (g) => poly(g, pts),
                height: (x, y) => 0.8 * Math.sin(Math.atan2(y + RY, x * 0.66) * 14) * 0.3 + 0.4 * S.noise2(x * 0.08, y * 0.08, sd + 2) + 0.3 * toad(x, y),
                ramp: MELON_RIND, soft: 0.9,
                stroke: { amp: 0.05, freq: 0.06, tone: 6 },
                spec: { amp: 0.3, power: 10, from: 0.5, to: 0.95, ragged: 0.6, color: '#f0f8e0' },
                tint: (x, y, tone, rgb) => {
                    // the toad skin: yellow-green blotches and freckles on the dark green
                    const t = toad(x, y);
                    toward(rgb, rgb[0] * 1.5 + 30, rgb[1] * 1.35 + 30, rgb[2] * 0.9 + 6, t * 0.45);
                    // where it lay on the ground, a pale yellow patch
                    toward(rgb, rgb[0] * 1.6 + 60, rgb[1] * 1.4 + 50, rgb[2] * 0.8 + 10, smooth(-30, -6, y) * smooth(80, 20, Math.abs(x)) * 0.5);
                },
                over: (g) => {
                    for (let i = 0; i < 260; i++) {
                        const a = r() * TAU, d = Math.sqrt(r()) * 0.95;
                        disc(g, Math.cos(a) * RX * d, -RY + Math.sin(a) * RY * d, 0.4 + r() * r() * 1.8, r() < 0.6 ? `rgba(190,206,120,${0.3 + r() * 0.3})` : `rgba(6,20,8,${0.3 + r() * 0.3})`);
                    }
                    // the stalk end: a dry button
                    oval(g, -RX + 8, -RY + 4, 7, 9, 0, '#5a4a20');
                    disc(g, -RX + 6, -RY + 2, 2.4, '#2a2008');
                },
            });
            sp.RX = RX;
            sp.RY = RY;
            return sp;
        });
    }
    // the cut: where the slice came out, the flesh and the seed bed inside the melon
    function melonCut(g, cx, cy, rx, ry, res, seed) {
        const r = Motion.rng('mcut' + seed), sd = S.seedOf('mcut' + seed);
        const pts = [[cx - rx, cy], [cx - rx * 0.6, cy - ry * 0.9], [cx, cy - ry], [cx + rx * 0.6, cy - ry * 0.9], [cx + rx, cy], [cx, cy + ry * 0.25]];
        const sp = pixels({
            box: S.bbox(pts, 4), res,
            mask: (q) => poly(q, S.curve(pts, true, 6)),
            color: (x, y, rgb) => {
                const u = (x - cx) / rx, v = (y - cy) / ry;
                // two cut faces meeting in a V, the left one in the light, the right one shaded
                const left = u < 0, tone = left ? 0.85 : 0.5;
                const seedBed = smooth(0.35, 0.05, Math.abs(u)) * smooth(-0.2, 0.1, v);
                rgb[0] = (226 - 60 * seedBed) * tone;
                rgb[1] = (232 - 40 * seedBed) * tone;
                rgb[2] = (190 - 60 * seedBed) * tone;
                toward(rgb, 140 * tone, 176 * tone, 110 * tone, smooth(0.75, 1, Math.abs(u) + 0.2 * v) * 0.7);
                const f = 0.05 * S.noise2(x * 0.4, y * 0.15, sd);
                rgb[0] *= 1 + f;
                rgb[1] *= 1 + f;
            },
            over: (q) => {
                for (let i = 0; i < 18; i++) oval(q, cx + (r() - 0.5) * rx * 0.5, cy - r() * ry * 0.3, 3, 1.4, r() * 3, 'rgba(236,224,180,0.9)');
            },
        });
        put(g, sp, 0, 0, 1);
    }
    function melonSlice(res, seed) {
        return memo(`mslice@${res}/${seed}`, () => {
            const r = Motion.rng('mslice' + seed), sd = S.seedOf('mslice' + seed), R = 74;
            // a half disc: the straight edge up (where the seeds were), the rind round below
            const pts = [];
            for (let i = 0; i <= 50; i++) {
                const a = (i / 50) * Math.PI;
                pts.push([Math.cos(a) * R, Math.sin(a) * R * 0.86]);
            }
            const sp = pixels({
                box: S.bbox([...pts, [R, -4], [-R, -4]], 6), res,
                mask: (q) => poly(q, pts),
                color: (x, y, rgb) => {
                    const q = Math.hypot(x / R, y / (R * 0.86)), rind = smooth(0.88, 0.93, q), skin = smooth(0.95, 0.98, q);
                    // the flat face: evenly lit, pale, greener towards the rind, a little cream
                    // in the heart; the flesh's fibres radiate from the seed edge
                    const fib = 0.03 * Math.sin(Math.atan2(y, x) * 60 + 3 * S.noise2(x * 0.05, y * 0.05, sd)) * smooth(0.1, 0.4, q);
                    const lit = 0.9 - 0.12 * (x / R) + fib + 0.04 * S.noise2(x * 0.2, y * 0.2, sd + 1);
                    rgb[0] = 232 * lit;
                    rgb[1] = 236 * lit;
                    rgb[2] = 196 * lit;
                    toward(rgb, 176 * lit, 206 * lit, 140 * lit, smooth(0.55, 0.88, q) * 0.7);
                    toward(rgb, 248, 236, 196, smooth(0.3, 0.05, q) * 0.25);
                    toward(rgb, 30, 62, 30, rind * 0.85);
                    toward(rgb, 160, 180, 90, skin * 0.4 * (S.noise2(x * 0.3, y * 0.3, sd + 2) > 0 ? 1 : 0));
                },
                over: (q) => {
                    // the seed edge: fibres and a few seeds left
                    S.ink(q, [[-R * 0.98, 0.5], [R * 0.98, 0.5]], { w: 2.2, color: '#c8b070', alpha: 0.6, taper: [0.3, 0.3] });
                    for (let i = 0; i < 9; i++) oval(q, -R * 0.6 + r() * R * 1.2, 3 + r() * 2.5, 3.6, 1.6, (r() - 0.5) * 0.6, '#efe2b8');
                    for (let i = 0; i < 30; i++) {
                        const x0 = -R * 0.8 + r() * R * 1.6;
                        S.ink(q, [[x0, 1], [x0 + (r() - 0.5) * 6, 5 + r() * 8]], { w: 0.5, color: '#b89a50', alpha: 0.5 });
                    }
                    // juice glistening
                    for (let i = 0; i < 40; i++) {
                        const a = r() * Math.PI, d = 0.2 + r() * 0.65;
                        disc(q, Math.cos(a) * R * d, Math.sin(a) * R * 0.86 * d, 0.4 + r() * 0.8, `rgba(255,255,244,${0.3 + r() * 0.5})`);
                    }
                },
            });
            sp.R = R;
            return sp;
        });
    }

    // ------------------------------------------------------------------ the cardoon
    // A cardoon as the Carthusians kept it: a bunch of long ribbed stalks, pale grey-green and
    // silvery, cut square at the base (their U-shaped sections showing), spines on the edges,
    // the leaf blades deeply lobed and drooping at the tips. pts: the bunch's spine, from the
    // cut end to the leafy end.
    function cardoon(g, base, tip, o = {}) {
        const r = Motion.rng('cardoon' + (o.seed ?? 0)), sd = S.seedOf('cardoon' + (o.seed ?? 0));
        const ax = tip[0] - base[0], ay = tip[1] - base[1], L = Math.hypot(ax, ay), dx = ax / L, dy = ay / L, px = -dy, py = dx;
        const stalks = [];
        for (let i = 0; i < 5; i++) stalks.push({ off: (i - 2) * 15 + (r() - 0.5) * 6, w: 11 + r() * 5, len: 0.78 + r() * 0.25, bend: (r() - 0.5) * 0.08, sd: i });
        stalks.sort((a, b) => b.off - a.off);
        for (const st of stalks) {
            const p0 = [base[0] + px * st.off, base[1] + py * st.off], p1 = [base[0] + px * st.off + ax * st.len + px * st.bend * L, base[1] + py * st.off + ay * st.len + py * st.bend * L];
            rod(g, p0, p1, (u) => st.w * (1 - 0.35 * u), (n, u, v, rgb, x, y) => {
                // ribs along the stalk: the normal rippled across it
                const rib = Math.sin(v * 11 + st.sd) * 0.25;
                const nn = norm3([n[0] + px * rib, n[1] + py * rib, n[2]]);
                const lam = Math.max(0, nn[0] * LN[0] + nn[1] * LN[1] + nn[2] * LN[2]);
                const t = 0.08 + lam * 0.95 + 0.04 * S.noise2(x * 0.05, y * 0.05, sd + st.sd);
                rgb[0] = 14 + 186 * t;
                rgb[1] = 20 + 196 * t;
                rgb[2] = 16 + 166 * t;
                // silvery: a grey bloom on the lit ribs
                toward(rgb, 226, 230, 220, smooth(0.6, 0.95, t) * 0.35);
                // the cut end, browned a little
                toward(rgb, 160, 140, 90, smooth(0.04, 0, u) * 0.6);
            }, { q: 1 });
            // spines along its edge
            for (let k = 0; k < 10; k++) {
                const u = 0.1 + r() * 0.8, side = r() < 0.5 ? -1 : 1, w = st.w * (1 - 0.35 * u);
                const q = [p0[0] + (p1[0] - p0[0]) * u + px * side * w, p0[1] + (p1[1] - p0[1]) * u + py * side * w];
                S.ink(g, [q, [q[0] + px * side * 5 + dx * 3, q[1] + py * side * 5 + dy * 3]], { w: 0.6, color: '#d8c890', alpha: 0.8, taper: [0, 1] });
            }
            // the section at the cut end: a pale U with dark fibre dots
            oval(g, p0[0], p0[1], st.w * 0.95, st.w * 0.6, Math.atan2(dy, dx) + Math.PI / 2, '#c8cca0');
            for (let k = 0; k < 7; k++) disc(g, p0[0] + px * (k - 3) * st.w * 0.25, p0[1] + py * (k - 3) * st.w * 0.25, 0.8, 'rgba(70,80,50,0.7)');
            // the leaf at its end: lobed, drooping, silver below
            const lf = memo(`cardleaf@${resOf(g)}/${st.sd}/${o.seed}`, () => {
                // pinnate: pairs of lobes down a broad white midrib, each lobe toothed with a
                // spine, the whole leaf drooping and twisting so its pale underside shows
                const pts = [], L2 = 150 + st.sd * 12;
                const half = (u, side) => {
                    const lobe = Math.pow(Math.abs(Math.sin(u * Math.PI * 4.5 + (side > 0 ? 0.5 : 0))), 0.55);
                    return (6 + 30 * lobe * Math.sin(Math.PI * Math.min(1, u * 1.05))) * (1 - 0.3 * u) + (Math.floor(u * 36) % 3 === 0 ? 2.5 : 0);
                };
                for (let i = 0; i <= 90; i++) {
                    const u = i / 90;
                    pts.push([u * L2, -half(u, -1)]);
                }
                for (let i = 90; i >= 0; i--) {
                    const u = i / 90;
                    pts.push([u * L2, half(u, 1)]);
                }
                const rot = Math.atan2(dy, dx) + 0.4 * (st.sd - 2) * 0.3;
                return S.form({
                    box: S.bbox(pts, 6), res: resOf(g), seed: 'cl' + st.sd, light: S.lightFor(rot, LT), relief: 0.45,
                    mask: (q) => poly(q, pts),
                    height: (x2, y2) => 2 * Math.sin(x2 * 0.12) * smooth(0, 14, Math.abs(y2)) - 2.5 * smooth(4, 0, Math.abs(y2)) + 0.4 * S.noise2(x2 * 0.2, y2 * 0.2, st.sd),
                    ramp: [[0, '#060a07'], [0.2, '#141e16'], [0.38, '#2e3c30'], [0.54, '#4e5c50'], [0.68, '#738072'], [0.82, '#9ea898'], [0.93, '#c4cabe'], [1, '#e2e6dc']], soft: 0.9,
                    stroke: { amp: 0.07, freq: 0.15, tone: 5 }, edge: { rough: 1.5, freq: 0.3, amp: 0.8 },
                    tint: (x2, y2, tone, rgb) => {
                        // the far half turned over: its downy white underside
                        if (y2 > 4 && Math.sin(x2 * 0.05 + st.sd) > 0.2) toward(rgb, 200, 206, 196, 0.45);
                    },
                    over: (q) => {
                        S.ink(q, [[0, 0], [L2 * 0.5, 0], [L2 * 0.98, 0]], { w: 4, color: '#e6ecdc', alpha: 0.75, taper: [0.1, 1] });
                        for (let k = 0; k < 9; k++) {
                            const x2 = 8 + k * L2 * 0.105;
                            S.ink(q, [[x2, -1], [x2 + 12, -26 * (1 - k / 12)]], { w: 1, color: '#dfe6d2', alpha: 0.5, taper: [0.2, 1] });
                            S.ink(q, [[x2 + 5, 1], [x2 + 16, 24 * (1 - k / 12)]], { w: 1, color: '#dfe6d2', alpha: 0.5, taper: [0.2, 1] });
                            S.ink(q, [[x2 + 13, -26 * (1 - k / 12)], [x2 + 17, -30 * (1 - k / 12)]], { w: 0.6, color: '#d8c890', alpha: 0.8, taper: [0, 1] });
                        }
                    },
                });
            });
            const rot = Math.atan2(dy, dx) + 0.4 * (st.sd - 2) * 0.3;
            S.put(g, lf, { x: p1[0] - dx * 4, y: p1[1] - dy * 4, rot });
        }
    }

    // ------------------------------------------------------------------ the rose
    // A rose laid down: petals in tiers (the outer ones open and curled back, a little
    // bruised at the edge; the inner ones a tight spiral), a short stem with a thorn and two
    // leaves, a petal fallen beside it, a drop on one petal.
    const ROSE = [[0, '#14030a'], [0.18, '#3c0a1c'], [0.34, '#6e1a32'], [0.5, '#a23a50'], [0.64, '#c4626e'], [0.77, '#de9092'], [0.89, '#f0bcb8'], [1, '#fbe2dc']];
    function petalSprite(res, key, rot, len, wid, cup) {
        return memo(`petal@${res}/${key}/${rot.toFixed(2)}`, () => {
            const sd = S.seedOf('petal' + key);
            const pts = [];
            for (let i = 0; i <= 40; i++) {
                const a = (i / 40) * Math.PI;
                // a broad petal: narrow claw at the base (x = 0), a wide rounded end, a notch
                const u = (1 - Math.cos(a)) / 2, wv = wid * Math.pow(Math.sin(Math.PI * Math.min(1, u * 0.9 + 0.1)), 0.6);
                pts.push([u * len, -wv]);
            }
            for (let i = 40; i >= 0; i--) {
                const a = (i / 40) * Math.PI, u = (1 - Math.cos(a)) / 2, wv = wid * Math.pow(Math.sin(Math.PI * Math.min(1, u * 0.9 + 0.1)), 0.6);
                pts.push([u * len - (u > 0.97 ? 2 : 0), wv * 0.95]);
            }
            return S.form({
                box: S.bbox(pts, 5), res, seed: 'petal' + key, light: S.lightFor(rot, LT), relief: 0.5,
                mask: (q) => poly(q, pts),
                // cupped: the edges raised, the tip rolled back
                height: (x, y) => cup * Math.pow(Math.abs(y) / wid, 2) * 8 - 6 * smooth(0.75, 1, x / len) + 0.4 * S.noise2(x * 0.2, y * 0.2, sd),
                ramp: ROSE, soft: 0.92,
                stroke: { amp: 0.06, freq: 0.15, tone: 5 },
                edge: { rough: 1.2, freq: 0.3, amp: 0.7 },
                tint: (x, y, tone, rgb, m) => {
                    // deeper at the heart, paler towards the rim; a browning edge on some
                    toward(rgb, rgb[0] * 0.75, rgb[1] * 0.55, rgb[2] * 0.65, smooth(0.4, 0, x / len) * 0.4);
                    if (key.includes('o')) toward(rgb, 120, 70, 50, smooth(0.08, 0, m) * smooth(0.6, 0.95, x / len) * 0.6);
                },
                over: (q) => {
                    for (let k = 0; k < 9; k++) S.ink(q, [[2, (k - 4) * 1], [len * 0.6, (k - 4) * wid * 0.18], [len * 0.92, (k - 4) * wid * 0.2]], { w: 0.5, color: '#fbe4e0', alpha: 0.15, taper: [0.5, 0.5] });
                },
            });
        });
    }
    function rose(g, o = {}) {
        const { x = 0, y = 0, s = 1, seed = 'a' } = o, res = resOf(g, s * 1.2), r = Motion.rng('rose' + seed);
        g.save();
        g.translate(x, y);
        g.scale(s, s);
        // the stem and leaves (behind the head, lying to the right)
        rod(g, [10, 8], [120, 22], () => 3.2, (n, u, v, rgb) => {
            const lam = Math.max(0, n[0] * LN[0] + n[1] * LN[1] + n[2] * LN[2]);
            rgb[0] = 16 + 80 * lam;
            rgb[1] = 30 + 120 * lam;
            rgb[2] = 14 + 50 * lam;
        });
        S.ink(g, [[70, 12], [74, 6], [78, 3]], { w: 2.4, color: '#5a2a1a', alpha: 0.9, taper: [0, 1] });
        for (const [lx, ly, rot, sd] of [[60, 12, -0.7, 'rl1'], [95, 20, 0.5, 'rl2']]) {
            const lf = memo(`roseleaf@${res}/${sd}`, () => {
                const pts = [];
                for (let i = 0; i <= 30; i++) {
                    const u = i / 30;
                    pts.push([u * 46, -15 * Math.sin(Math.PI * Math.pow(u, 0.8)) + (i % 3 === 0 ? -0.8 : 0)]);
                }
                for (let i = 30; i >= 0; i--) {
                    const u = i / 30;
                    pts.push([u * 46, 15 * Math.sin(Math.PI * Math.pow(u, 0.8)) + (i % 3 === 0 ? 0.8 : 0)]);
                }
                return S.form({
                    box: S.bbox(pts, 5), res, seed: sd, light: S.lightFor(rot, LT), relief: 0.4,
                    mask: (q) => poly(q, pts), height: (x2, y2) => -2 * smooth(2.5, 0, Math.abs(y2)) + 0.8 * Math.sin(x2 * 0.5) * smooth(0, 6, Math.abs(y2)),
                    ramp: [[0, '#040a04'], [0.2, '#0e2210'], [0.4, '#1e3e1c'], [0.58, '#34602c'], [0.74, '#4f7e3e'], [0.88, '#7aa264'], [1, '#bcd2a0']], soft: 0.9,
                    spec: { amp: 0.4, power: 16, from: 0.5, to: 0.95, color: '#eef6e0' }, stroke: { amp: 0.06, freq: 0.2, tone: 4 },
                    over: (q) => {
                        S.ink(q, [[0, 0], [44, 0]], { w: 0.8, color: '#a8c088', alpha: 0.7, taper: [0, 1] });
                        for (let k = 1; k < 6; k++) {
                            S.ink(q, [[k * 7, 0], [k * 7 + 6, -10]], { w: 0.4, color: '#a8c088', alpha: 0.5 });
                            S.ink(q, [[k * 7, 0], [k * 7 + 6, 10]], { w: 0.4, color: '#a8c088', alpha: 0.5 });
                        }
                    },
                });
            });
            S.put(g, lf, { x: lx, y: ly, rot });
        }
        // the head: outer petals open, middle ones cupped, a tight centre
        const tiers = [[7, 40, 30, 0.6, 'o', 0], [6, 31, 25, 1, 'm', 0.4], [5, 22, 18, 1.6, 'i', 0.9]];
        for (const [n, len, wid, cup, k, a0] of tiers) {
            for (let i = 0; i < n; i++) {
                const a = a0 + (i / n) * TAU + (r() - 0.5) * 0.3, ll = len * (0.88 + r() * 0.24);
                const sp = petalSprite(res, `${seed}${k}${i}`, a, ll, wid * (0.9 + r() * 0.2), cup);
                g.save();
                g.globalCompositeOperation = 'source-atop';
                S.put(g, shadowOf(sp, 3), { x: 3, y: 4, rot: a, sy: 0.75, alpha: 0.5 });
                g.restore();
                S.put(g, sp, { x: 0, y: 0, rot: a, sx: 1, sy: 0.75 });
            }
        }
        // the heart: a spiral of tight petal edges
        for (let k = 0; k < 14; k++) {
            const a = k * 0.9, rr = 3 + k * 0.7;
            S.ink(g, [[Math.cos(a) * rr, Math.sin(a) * rr * 0.75], [Math.cos(a + 1.4) * rr, Math.sin(a + 1.4) * rr * 0.75], [Math.cos(a + 2.6) * rr * 0.9, Math.sin(a + 2.6) * rr * 0.7]], { w: 1.2, color: k % 2 ? '#5a0e22' : '#f4c0bc', alpha: 0.7 });
        }
        drop(g, -18, -8, 2.6, { dark: [120, 30, 50], lit: [255, 220, 220] });
        g.restore();
        // a fallen petal on the plate
        const fp = petalSprite(res, seed + 'fallen', 2.6, 30, 20, 1.2);
        S.put(g, fp, { x: x - 60 * s, y: y + 14 * s, rot: 2.6, s: s, sy: s * 0.6 });
    }

    // ------------------------------------------------------------------ the cup of water
    // A two-eared cup of white tin-glazed earthenware, filled with water: the glaze glossy
    // and a little blue where it pools, crazed, a chip on the rim showing the buff body; the
    // water's surface a bright thin ellipse.
    const CUP = profileOf([[30, 0], [33, -3], [31, -7], [40, -13], [50, -30], [54, -54], [55, -76], [57, -84], [55, -87], [52, -88]], 6);
    function cupSprite(ey, res, seed) {
        return memo(`cup/${Math.round(ey / 10)}@${res}/${seed}`, () => {
            const P = CUP, on = onLathe(P, ey), q0 = {}, sd = S.seedOf('cup' + seed), r = Motion.rng('cup' + seed);
            const outline = latheOutline(P, ey, 33, 57);
            const ear = (sx) => S.curve([[sx * 52, -66], [sx * 68, -70], [sx * 74, -60], [sx * 66, -44], [sx * 50, -40]], false, 6);
            const box = S.bbox([...outline, [-80, -70], [80, -70]], 8);
            const t = (ey + P.y1) / 1000, yT = P.y1 + 1, rT = 55;
            const sp = S.form({
                box, res, seed: 'cup' + seed, inflate: 'none', light: LT,
                mask: (q) => {
                    poly(q, outline);
                    for (const sx of [-1, 1]) line(q, ear(sx), 8, '#fff');
                },
                height: (x, y) => {
                    on(x, y, q0);
                    let h = q0.z + 0.15 * S.noise2(x * 0.3, y * 0.3, sd);
                    if (Math.abs(x) > 48) {
                        const [dd] = nearest(ear(Math.sign(x)), x, y);
                        if (dd < 4.5) h = Math.max(h, 3.4 * Math.sqrt(1 - (dd / 4.5) ** 2) + q0.z * 0.8);
                    }
                    return h;
                },
                ramp: [[0, '#0c0d10'], [0.16, '#23252c'], [0.3, '#474a54'], [0.44, '#767a84'], [0.58, '#a4a8ae'], [0.72, '#c8cacc'], [0.85, '#e2e2de'], [0.94, '#f0eeea'], [1, '#fbfaf6']], soft: 0.92,
                stroke: { amp: 0.03, freq: 0.1, tone: 6 },
                spec: { amp: 0.85, power: 40, from: 0.35, to: 0.8, ragged: 0.3, color: '#ffffff' },
                tint: (x, y, tone, rgb) => {
                    on(x, y, q0);
                    // the glaze pools blue-grey at the foot; warm light thrown up from the pewter
                    toward(rgb, rgb[0] * 0.85, rgb[1] * 0.9, rgb[2] * 1.05, smooth(-14, -4, q0.Y) * 0.6);
                    toward(rgb, 150, 140, 120, smooth(0.3, 0.08, tone) * 0.4);
                },
                over: (q) => {
                    // crazing
                    for (let i = 0; i < 60; i++) {
                        const yy = -84 + r() * 76, rr = P.at(yy), x0 = (r() * 2 - 1) * rr * 0.9, pts = [[x0, yy]];
                        for (let k = 0; k < 3; k++) pts.push([pts[k][0] + (r() - 0.5) * 9, pts[k][1] + (r() - 0.5) * 9]);
                        S.ink(q, pts, { w: 0.3, color: '#5a5a58', alpha: 0.25 });
                    }
                    // the water: seen from just above, a thin ellipse in the mouth
                    const wr = rT - 4, we = Math.max(1.2, Math.abs(t) * wr);
                    oval(q, 0, yT + 1.5, wr, we, 0, '#1a1e22');
                    S.ink(q, Array.from({ length: 21 }, (_, i) => [Math.cos(Math.PI + (Math.PI * i) / 20) * wr, yT + 1.5 + Math.sin(Math.PI + (Math.PI * i) / 20) * we]), { w: 1, color: '#e8f0f2', alpha: 0.8, taper: [0.4, 0.4] });
                    oval(q, -wr * 0.4, yT + 1.5, wr * 0.25, we * 0.4, 0, 'rgba(255,255,255,0.75)');
                    // a chip in the rim: the buff body
                    oval(q, rT * 0.5, yT + Math.abs(t) * rT * 0.8, 4, 2, 0.2, '#c8a87a');
                },
            });
            sp.outline = outline;
            return sp;
        });
    }
    function cup(g, o = {}) {
        const { x = 0, y = 0, s = 1, seed = 'a' } = o, ey = o.ey ?? y;
        const sp = cupSprite(ey / s, resOf(g, s), seed);
        put(g, sp, x, y, s);
        return sp;
    }

    // ------------------------------------------------------------------ the candle, snuffed
    // A brass candlestick (a domed foot, a baluster, a drip pan) with a tallow-white candle
    // gone out a moment ago: its top a cup of soft wax, the wick bent and black with a red
    // ember at its tip, a thread of smoke rising and coiling; wax runs down its side, one over
    // the pan's edge. Valdés Leal's «in the blink of an eye».
    const CSTICK = profileOf([[56, 0], [58, -4], [54, -9], [44, -16], [30, -26], [16, -36], [12, -46], [16, -56], [12, -66], [9, -80], [10, -100], [14, -112], [10, -124], [10, -132], [38, -138], [42, -142], [36, -145], [17, -147], [17, -162], [14, -163]], 6);
    function candlestick(g, o = {}) {
        const { x = 0, y = 0, s = 1, seed = 'a', wax = 230 } = o, ey = (o.ey ?? y) / s, res = resOf(g, s);
        const r = Motion.rng('cs' + seed), sd = S.seedOf('cs' + seed);
        const sp = memo(`cstick/${Math.round(ey / 20)}@${res}/${seed}`, () => {
            const P = CSTICK, on = onLathe(P, ey), q0 = {};
            const outline = latheOutline(P, ey, 58, 17);
            return pixels({
                box: S.bbox(outline, 6), res,
                mask: (q) => poly(q, outline),
                color: (x2, y2, rgb) => {
                    on(x2, y2, q0);
                    const n = norm3([q0.n[0] + 0.03 * S.noise2(x2 * 0.2, y2 * 0.2, sd), q0.n[1], q0.n[2]]);
                    brassAt(n, rgb, { rough: 0.35 });
                    // tarnish, darker in the turnings; candle grease on the pan
                    toward(rgb, 40, 30, 14, 0.25 * smooth(0.1, 0.6, S.noise2(x2 * 0.05, y2 * 0.05, sd + 1)));
                },
            });
        });
        put(g, sp, x, y, s);
        g.save();
        g.translate(x, y);
        g.scale(s, s);
        // the candle: a waxy cylinder, glowing a little through itself near the top
        const y0 = -160, y1 = y0 - wax, R = 15;
        const top = y1;
        const csp = memo(`candle/${Math.round(ey / 20)}@${res}/${seed}/${wax}`, () => {
            const P = profileOf([[R, 0], [R, -wax * 0.5], [R - 0.5, -wax + 4], [R - 2, -wax]], 4);
            const on = onLathe(P, ey + y0), q0 = {};
            const outline = latheOutline(P, ey + y0, R, R - 2);
            const WAX = S.rampFn([[0, '#0e0c08'], [0.16, '#2c2618'], [0.32, '#5a5038'], [0.48, '#8c8062'], [0.62, '#b8ac8a'], [0.76, '#d8ceb0'], [0.88, '#ece4cc'], [1, '#faf6ea']], 0.95);
            return pixels({
                box: S.bbox(outline, 4), res,
                mask: (q) => poly(q, outline),
                color: (x2, y2, rgb) => {
                    on(x2, y2, q0);
                    const lam = Math.max(0, q0.n[0] * LN[0] + q0.n[1] * LN[1] + q0.n[2] * LN[2]);
                    // wax: soft light, the shadow side never black (light scatters through it)
                    WAX(clamp(0.22 + lam * 0.8 + 0.03 * S.noise2(x2 * 0.1, y2 * 0.02, sd + 2)), rgb);
                    toward(rgb, 236, 214, 160, smooth(-wax + 40, -wax, q0.Y) * 0.25);
                },
                over: (q) => {
                    // runs of wax down the side, each ending in a bead
                    for (let k = 0; k < 4; k++) {
                        const x0 = -R * 0.7 + k * R * 0.45 + (r() - 0.5) * 3, l = 30 + r() * (wax * 0.6);
                        const pts = [[x0, -wax + 2], [x0 + (r() - 0.5) * 2, -wax + l * 0.5], [x0 + (r() - 0.5) * 2, -wax + l]];
                        S.ink(q, pts.map(([a, b]) => [a + 1.2, b]), { w: 4.6, color: '#3a3224', alpha: 0.35, taper: [0.4, 0] });
                        S.ink(q, pts, { w: 4, color: '#f2ead4', alpha: 0.85, taper: [0.4, 0] });
                        S.ink(q, pts.map(([a, b]) => [a - 1, b]), { w: 1, color: '#ffffff', alpha: 0.6, taper: [0.6, 0.3] });
                        oval(q, pts[2][0], pts[2][1] + 1, 2.6, 3.2, 0, '#e8dec2');
                        disc(q, pts[2][0] - 0.8, pts[2][1], 0.8, '#ffffff');
                    }
                },
            });
        });
        S.put(g, csp, { x: 0, y: y0 });
        // the top: a cup of soft wax with a raised rim, the wick bent, the ember
        oval(g, 0, top + 1, R - 1.5, 3.2, 0, '#c8bc98');
        oval(g, 0, top + 1.6, R - 4, 2.2, 0, '#8a7e5e');
        S.ink(g, [[-R + 2, top + 0.5], [0, top - 0.8], [R - 2, top + 0.5]], { w: 1, color: '#fffaf0', alpha: 0.8 });
        S.ink(g, [[0, top + 1], [0.5, top - 6], [3, top - 11], [6, top - 12]], { w: 1.6, color: '#140c08' });
        softly(g, 2.2, (q) => disc(q, 6.5, top - 12.2, 3.6, 'rgba(255,90,20,0.55)'));
        disc(g, 6.4, top - 12.2, 1.3, '#ff7a2a');
        disc(g, 6.2, top - 12.4, 0.6, '#ffe0a0');
        // a run over the pan's edge, hanging
        const hx = 30, hy = -138;
        S.ink(g, [[hx - 6, hy - 6], [hx, hy - 2], [hx + 2, hy + 6], [hx + 2, hy + 14]], { w: 4, color: '#e8e0c8', alpha: 0.95, taper: [0.2, 0] });
        oval(g, hx + 2, hy + 15, 2.4, 3, 0, '#ece4cc');
        disc(g, hx + 1.2, hy + 14, 0.7, '#ffffff');
        g.restore();
        return { wick: [x + 6.5 * s, y + (top - 12.2) * s] };
    }
    // The smoke of a candle just put out: a thread that rises straight from the ember, then
    // wavers, coils and opens into a veil that thins out. Painted on the layer (it is light
    // on the dark).
    function smoke(g, from, o = {}) {
        const r = Motion.rng('smoke' + (o.seed ?? 0)), sd = S.seedOf('smoke' + (o.seed ?? 0));
        const H = o.h ?? 420, drift = o.drift ?? -120;
        // the path: straight, then a sinuous rise drifting sideways
        const path = [];
        for (let i = 0; i <= 80; i++) {
            const u = i / 80, k = smooth(0.12, 0.6, u);
            path.push([from[0] + drift * u * u + k * (14 * Math.sin(u * 13 + 1) + 22 * u * Math.sin(u * 7 + 2)), from[1] - H * u]);
        }
        softly(g, 1.2, (q) => {
            for (let s2 = 0; s2 < 3; s2++) {
                // two or three strands that part and twist round each other
                const ph = s2 * 2.1, pts = path.map(([x, y], i) => {
                    const u = i / 80;
                    return [x + Math.sin(u * 20 + ph) * 6 * smooth(0.2, 0.7, u) * (1 + u * 2), y];
                });
                for (let i = 1; i < pts.length; i++) {
                    const u = i / 80, w = 1.4 + 13 * Math.pow(u, 1.5) * (s2 === 0 ? 1 : 0.6);
                    const a = (o.alpha ?? 0.6) * smooth(0, 0.04, u) * (1 - smooth(0.5, 1, u)) * (s2 === 0 ? 1 : 0.55);
                    S.ink(q, [pts[i - 1], pts[i]], { w, color: '#c8ccd6', alpha: a, taper: [0, 0] });
                }
            }
        });
        // where it opens out: a soft veil
        softly(g, 14, (q) => {
            for (let i = 0; i < 9; i++) {
                const p = path[50 + i * 3];
                oval(q, p[0] + (r() - 0.5) * 30, p[1], 22 + i * 4, 12 + i * 2, r(), `rgba(150,156,170,${0.06})`);
            }
        });
        // a lit edge on the side of the lamp, and fine threads within
        for (let k = 0; k < 6; k++) {
            const i0 = 6 + Math.floor(r() * 30), i1 = Math.min(80, i0 + 10 + Math.floor(r() * 30));
            const pts = path.slice(i0, i1).map(([x, y], j) => [x - 2 - r() * 2 + Math.sin((i0 + j) * 0.4 + k) * 3, y]);
            if (pts.length > 2) S.ink(g, pts, { w: 0.5, color: '#e6e8f0', alpha: 0.35 * (o.alpha ?? 0.6), taper: [0.8, 0.8] });
        }
    }
    // The strip of paper with its motto, leaning on the candlestick's foot, its end curled
    // over the ledge's edge: old laid paper, foxed, the words cut small in a roman.
    function motto(g, pts, o = {}) {
        const r = Motion.rng('motto' + (o.seed ?? 0)), W = o.w ?? 18, c = S.curve(pts, false, 10);
        const L = [], R = [];
        for (let i = 0; i < c.length; i++) {
            const p = c[Math.max(0, i - 1)], q = c[Math.min(c.length - 1, i + 1)], tx = q[0] - p[0], ty = q[1] - p[1], tl = Math.hypot(tx, ty) || 1;
            L.push([c[i][0] - (ty / tl) * W * 0.5, c[i][1] + (tx / tl) * W * 0.5]);
            R.push([c[i][0] + (ty / tl) * W * 0.5, c[i][1] - (tx / tl) * W * 0.5]);
        }
        const strip = [...L, ...R.reverse()];
        // its shadow, then the paper
        g.save();
        g.globalCompositeOperation = 'source-atop';
        softly(g, 3, (q) => poly(q, strip.map(([x, y]) => [x + 6, y + 5]), 'rgba(4,2,1,0.6)'));
        g.restore();
        poly(g, strip, '#d8c8a0');
        g.save();
        g.beginPath();
        S.trace(g, strip);
        g.clip();
        // laid lines, foxing, the edge lit
        for (let i = 0; i < c.length; i += 2) S.ink(g, [L[i], [R[R.length - 1 - i][0], R[R.length - 1 - i][1]]], { w: 0.3, color: '#a89870', alpha: 0.25 });
        for (let i = 0; i < 26; i++) {
            const p = c[Math.floor(r() * c.length)];
            disc(g, p[0] + (r() - 0.5) * W, p[1] + (r() - 0.5) * W * 0.6, 0.5 + r() * 1.6, `rgba(150,100,50,${0.2 + r() * 0.3})`);
        }
        S.spray(g, strip, { color: '#3a2a14', alpha: 0.5, w: 6, push: 3 });
        // the letters
        S.textOn(g, o.text ?? 'IN ICTV OCVLI', c, { font: `${o.size ?? 13}px 'IM Fell DW Pica SC', serif`, color: '#2a1c10', spacing: 1.2, align: o.align ?? 0.5 });
        g.restore();
        S.ink(g, L, { w: 0.6, color: '#fff4dc', alpha: 0.6 });
    }

    // ------------------------------------------------------------------ the fly
    // A housefly, painted without a line: a grey-striped thorax, a chequered abdomen, red eyes,
    // two clear wings with dark veins folded over its back, bristles, six legs with their
    // shadows. About 12 units long at s = 1, heading along `rot`.
    function fly(g, o = {}) {
        const { x = 0, y = 0, s = 1, rot = 0 } = o;
        g.save();
        g.translate(x, y);
        g.rotate(rot);
        g.scale(s, s);
        const r = Motion.rng('fly' + x);
        // shadow
        g.save();
        g.globalCompositeOperation = 'source-atop';
        softly(g, 1.2, (q) => {
            oval(q, 1.6, 2.2, 3, 6.5, 0, 'rgba(0,0,0,0.5)');
        });
        g.restore();
        // legs
        for (const mx of [-1, 1]) {
            for (const [y0, dx, dy] of [[-2, 4.5, -3], [-0.5, 5.2, 0.5], [1, 4.6, 3.6]]) S.ink(g, [[mx * 1.4, y0], [mx * (1.4 + dx * 0.6), y0 + dy * 0.3 - 0.8], [mx * (1.4 + dx), y0 + dy]], { w: 0.45, color: '#120e10', taper: [0, 0.4] });
        }
        // abdomen, thorax, head
        oval(g, 0, 3, 2.6, 3.6, 0, '#1a1618');
        for (const yy of [1.6, 3.2, 4.8]) S.ink(g, [[-2.2, yy], [0, yy + 0.4], [2.2, yy]], { w: 0.5, color: '#8a8478', alpha: 0.6, taper: [0.4, 0.4] });
        oval(g, -0.8, 2.4, 0.9, 1.4, 0, 'rgba(200,196,186,0.35)');
        oval(g, 0, -1.2, 2.5, 2.3, 0, '#24201f');
        for (const xx of [-1, 0, 1]) S.ink(g, [[xx, -3], [xx * 1.1, 0.4]], { w: 0.4, color: '#a8a296', alpha: 0.5 });
        oval(g, 0, -4, 2, 1.4, 0, '#1a1416');
        for (const mx of [-1, 1]) {
            oval(g, mx * 1.2, -4.1, 1.05, 1.3, 0, '#7a1c16');
            disc(g, mx * 1.2 - 0.3, -4.5, 0.35, 'rgba(255,220,200,0.8)');
        }
        // bristles
        for (let i = 0; i < 14; i++) {
            const a = r() * TAU, rr = 2 + r();
            S.ink(g, [[Math.cos(a) * rr * 0.8, -1 + Math.sin(a) * rr * 0.8], [Math.cos(a) * rr * 1.3, -1 + Math.sin(a) * rr * 1.3]], { w: 0.25, color: '#0a0808', alpha: 0.8 });
        }
        // wings, clear, veined, catching the lamp
        for (const mx of [-1, 1]) {
            const wing = S.curve([[mx * 0.6, -1], [mx * 3.4, 0.4], [mx * 4.8, 4.6], [mx * 3.6, 7.6], [mx * 1.4, 6.6], [mx * 0.6, 2.6]], true, 5);
            poly(g, wing, 'rgba(206,214,226,0.32)');
            S.ink(g, [[mx * 0.8, -0.6], [mx * 2.4, 2.8], [mx * 3.4, 7]], { w: 0.3, color: '#1a1416', alpha: 0.7 });
            S.ink(g, [[mx * 1.6, 1.6], [mx * 4.2, 5]], { w: 0.25, color: '#1a1416', alpha: 0.6 });
            S.ink(g, [[mx * 1.4, 0.4], [mx * 2.8, 4]], { w: 0.5, color: '#ffffff', alpha: mx < 0 ? 0.6 : 0.25 });
        }
        g.restore();
    }


    // A braid of garlic (ristra) hung from a nail: the dry stalks plaited into a rope, the
    // heads on either side, each turned its own way, overlapping down its length.
    function ristra(g, top, len, o = {}) {
        const r = Motion.rng('ristra' + (o.seed ?? 0)), n = o.n ?? 9, s = o.s ?? 0.8, res = resOf(g, s);
        // the nail
        disc(g, top[0] + 2, top[1] + 2, 4, 'rgba(0,0,0,0.6)');
        disc(g, top[0], top[1], 3.6, '#3a2a20');
        disc(g, top[0] - 1, top[1] - 1, 1.4, '#a07a5a');
        const spine = [];
        for (let i = 0; i <= 10; i++) spine.push([top[0] + Math.sin(i * 0.6) * 4, top[1] + (len * i) / 10]);
        // heads behind the braid first, then the braid, then the heads in front
        const heads = [];
        for (let i = 0; i < n; i++) {
            const u = 0.12 + (i / n) * 0.86, side = i % 2 ? 1 : -1, p = spine[Math.min(10, Math.round(u * 10))];
            heads.push({ x: p[0] + side * (26 + r() * 10) * s, y: top[1] + u * len, rot: side * (0.9 + r() * 0.5) + Math.PI, front: r() < 0.55, sd: 'r' + i });
        }
        for (const h of heads) if (!h.front) {
            const sp = garlicSprite(res, (o.seed ?? 'r') + h.sd, h.rot);
            S.put(g, sp, { x: h.x, y: h.y, rot: h.rot, s });
        }
        cord(g, spine, 9 * s, { seed: 'rb' + (o.seed ?? 0), color: [176, 150, 100] });
        for (const h of heads) if (h.front) {
            const sp = garlicSprite(res, (o.seed ?? 'r') + h.sd, h.rot);
            g.save();
            g.globalCompositeOperation = 'source-atop';
            S.put(g, shadowOf(sp, 5), { x: h.x + 6, y: h.y + 8, rot: h.rot, s, alpha: 0.6 });
            g.restore();
            S.put(g, sp, { x: h.x, y: h.y, rot: h.rot, s });
        }
    }
    // a fig lying on the stone, with its shadow (rot: which way its eye points)
    function fig(g, o = {}) {
        const { x = 0, y = 0, s = 1, seed = 'f', rot = 0 } = o, sp = figSprite(resOf(g, s), seed, rot);
        g.save();
        g.globalCompositeOperation = 'source-atop';
        S.put(g, shadowOf(sp, 4), { x: x + 10 * s, y: y + 5 * s, rot, sx: s, sy: s * 0.5, alpha: 0.75 });
        g.restore();
        S.put(g, sp, { x, y, rot, s });
        return sp;
    }


    // What a used ledge carries: crumbs, peppercorns and cumin from the mortar, seeds, scraps
    // of skin, each with its small shadow. kinds: { crumb, pepper, cumin, seed, skin } counts.
    function scatter(g, x0, x1, y0, y1, kinds, seed = 'sc') {
        const r = Motion.rng('scatter' + seed);
        const at = () => [x0 + r() * (x1 - x0), y0 + r() * (y1 - y0)];
        for (let i = 0; i < (kinds.crumb ?? 0); i++) {
            const [x, y] = at(), rr = 1 + r() * r() * 4, pts = [];
            for (let k = 0; k < 7; k++) pts.push([x + Math.cos((k / 7) * TAU) * rr * (0.6 + r() * 0.6), y + Math.sin((k / 7) * TAU) * rr * 0.6 * (0.6 + r() * 0.6)]);
            poly(g, pts.map(([a, b]) => [a + rr * 0.6, b + rr * 0.4]), 'rgba(6,4,2,0.5)');
            poly(g, pts, r() < 0.5 ? '#c8a26a' : '#e2c48e');
            disc(g, x - rr * 0.3, y - rr * 0.25, rr * 0.3, 'rgba(255,240,206,0.7)');
        }
        for (let i = 0; i < (kinds.pepper ?? 0); i++) {
            const [x, y] = at(), rr = 2 + r() * 0.8;
            oval(g, x + 1.4, y + 1, rr * 1.1, rr * 0.6, 0, 'rgba(4,2,1,0.6)');
            disc(g, x, y, rr, '#1e1610');
            for (let k = 0; k < 3; k++) S.ink(g, [[x - rr * 0.7, y - rr * 0.2 + k * rr * 0.4], [x + rr * 0.6, y - rr * 0.4 + k * rr * 0.4]], { w: 0.4, color: '#4a3a2c', alpha: 0.7 });
            disc(g, x - rr * 0.35, y - rr * 0.4, rr * 0.28, 'rgba(230,214,190,0.75)');
        }
        for (let i = 0; i < (kinds.cumin ?? 0); i++) {
            const [x, y] = at(), a = r() * TAU;
            oval(g, x + 0.8, y + 0.6, 2.6, 0.9, a, 'rgba(4,2,1,0.5)');
            oval(g, x, y, 2.6, 0.9, a, '#8a7044');
            S.ink(g, [[x - Math.cos(a) * 2.2, y - Math.sin(a) * 2.2], [x + Math.cos(a) * 2.2, y + Math.sin(a) * 2.2]], { w: 0.35, color: '#d8c08a', alpha: 0.7 });
        }
        for (let i = 0; i < (kinds.seed ?? 0); i++) {
            const [x, y] = at(), a = r() * TAU;
            oval(g, x + 1, y + 0.8, 3.4, 1.6, a, 'rgba(4,2,1,0.45)');
            oval(g, x, y, 3.4, 1.6, a, '#e6d8a8');
            oval(g, x - 0.6, y - 0.5, 1.6, 0.6, a, 'rgba(255,252,236,0.8)');
        }
        for (let i = 0; i < (kinds.skin ?? 0); i++) {
            const [x, y] = at(), a = r() * TAU, l = 8 + r() * 14;
            const pts = [[x, y], [x + Math.cos(a) * l, y + Math.sin(a) * l * 0.4 - 2], [x + Math.cos(a + 0.4) * l * 1.2, y + Math.sin(a + 0.4) * l * 0.45 + 1], [x + Math.cos(a) * l * 0.3, y + 2.5]];
            poly(g, pts.map(([p, q]) => [p + 2, q + 1.5]), 'rgba(4,2,1,0.4)');
            poly(g, pts, kinds.skinColor ?? 'rgba(198,150,110,0.85)');
            S.ink(g, pts.slice(0, 3), { w: 0.5, color: '#fff2dc', alpha: 0.6 });
        }
    }
    // Water spilled on the stone: the stone darker where it is wet, its edge darkest, and the
    // lamp's window lying in it as a bright streak.
    function puddle(g, x, y, rx, ry, seed = 'pu') {
        const r = Motion.rng('puddle' + seed), pts = [];
        for (let k = 0; k < 28; k++) {
            const a = (k / 28) * TAU, rr = 1 + 0.25 * Math.sin(a * 3 + r() * 6) + 0.12 * Math.sin(a * 7 + r() * 6);
            pts.push([x + Math.cos(a) * rx * rr, y + Math.sin(a) * ry * rr]);
        }
        g.save();
        g.globalCompositeOperation = 'source-atop';
        poly(g, pts, 'rgba(30,22,14,0.42)');
        g.lineWidth = 1.4;
        g.strokeStyle = 'rgba(16,10,6,0.5)';
        g.beginPath();
        S.trace(g, pts);
        g.stroke();
        softly(g, 1.5, (q) => oval(q, x - rx * 0.25, y - ry * 0.1, rx * 0.4, ry * 0.18, -0.05, 'rgba(255,246,222,0.6)'));
        g.restore();
        for (let k = 0; k < 5; k++) drop(g, x + rx * (1.1 + r() * 0.6) * (r() < 0.5 ? -1 : 1), y + (r() - 0.5) * ry, 1.2 + r() * 1.8, { dark: [70, 58, 44], lit: [250, 240, 220], sq: 0.6 });
    }

    return { scatter, puddle, ristra, fig, quince, quinceSprite, hangString, cabbage, cabbageHead, cabbageLeaf, melonBody, melonCut, melonSlice, cardoon, rose, petalSprite, cup, cupSprite, candlestick, smoke, motto, fly, mortar, mortarSprite, pestle, rod, brassAt, garlic, garlicSprite, cloveSprite, onion, onionSprite, onionHalf, eggDish, eggSprite, knife, linen, RAMP, LT, LN, SD, TL, resOf, memo, pixels, onto, put, softly, shadowOf, castOn, castWall, contact, drop, run, cord, stone, grain, tooling, ledgeGeom, ledge, ashlar, wall, profileOf, latheOutline, onLathe, nearest, metalAt, jug, jugSprite, bucaro, bucaroSprite, plate, plateSprite, figSprite, glass, glassShadow, disc, oval, poly, line, toward, scaleRGB };
})();
