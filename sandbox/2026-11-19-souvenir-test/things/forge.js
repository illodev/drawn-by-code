// Picture 9 · the forge and the moon («Romance de la luna, luna»), in the brush manner under
// two lights that are painted in the picture: the forge's fire (orange, low, to one side)
// inside the cave, and the full moon (cold, from the moon itself) outside it. No contour
// line: every piece is a lit volume painted per pixel (`lit`, this file's own shader: an
// albedo, a height field, point and far lights, a sheen and a broad reflection for the
// metals), its edge broken by the last stroke. Global: Forge.
//
// LIGHTS. Every drawer takes `fire` and/or `moon`: { x, y, z, c: [r, g, b], r0 } a point in
// the caller's units (z: how far in front of the layer's plane, negative = behind it; r0:
// the distance at which it has fallen to half) or { dir: [x, y, z], c } far away; and `amb`,
// the colour of the dark ([r, g, b], 0..1). The light stays put however a thing is turned.
//
// ANATOMY · the real things, and ten small true details of each (painted where said)
//
//   COPPER PAN (`pan`) · a cazo or sartén raised and planished from one sheet, a rolled
//   lip, a flat iron or copper handle riveted on, hung by the hole in its handle.
//     1 planishing marks: dents in rings round the centre, each its own facet catching the
//       fire  2 the bottom flatter than the flared wall, a fillet between them  3 the
//       rolled bead of the lip, a gleam running round it  4 three rivets through a base
//       plate, their heads domed  5 soot baked on the bottom of a pan that went on the fire
//       6 fire scale: purple-brown and straw bands of oxide  7 verdigris in the crevices by
//       the rivets and the lip  8 inside: the tin lining, silver, worn through to copper on
//       the rim and where the spoon scraped  9 a dent from a fall on the rim  10 the handle's
//       hole worn oval by the nail; the nail, its square head, and the pan's shadow.
//
//   MOON (`moon`) · the full moon of a night in the south, the near side as it is: the
//   seas at their selenographic places (Imbrium, Serenitatis, Tranquillitatis, Crisium,
//   Fecunditatis, Nectaris, Nubium, Humorum, Procellarum, Frigoris), the young rayed
//   craters (Tycho's rays across the south, Copernicus, Kepler, Aristarchus the brightest
//   spot, Proclus), Plato and Grimaldi as dark floors; brighter highlands full of small
//   craters; the limb a little darker and warmer; a halo round it in the haze.
//
//   The others, each with its ten details written over its drawer: the cave's surfaces
//   (`cave`: lime coat over coat, pick facets under it, flakes down to an ochre coat and the
//   hill's red conglomerate with river pebbles, soot, añil dado, wandering cracks, the
//   reveal of an opening, a charcoal tally), the anvil, the hearth and its fire, the
//   bellows, Fajalauza plates, the cauldron, the bed warmer, the cook's copper (`utensil`),
//   tin rings and a necklace, the bridle (cabezada vaquera: cheek straps, browband with its
//   mosquero of thongs and red tassels, noseband, snaffle and rings, brass studs and three
//   brasses, a crescent among them), the cricket's cage (wire bars, painted tin roof worn to
//   the metal, a door, the cricket with its long antennae and a lettuce leaf), the door
//   (planks, old paint, battens' nails, strap hinges, latch, the cat's hole), the prickly
//   pear (pads on pads, areoles in a lattice with glochids and spines, red tunas, a corky
//   old pad), the agave (grey-blue leaves with hooked teeth and a black tip spine, the
//   ghost of a neighbour's teeth printed on a leaf, a dried leaf, the flower stalk), the
//   olive tree, the scops owl (ear tufts, facial disc with a broken dark rim, yellow eyes
//   with the moon in them, grey feathers each with a dark shaft and a pale tip, wavy bars,
//   the white scapular spots, the folded wing's edge), the will-o'-the-wisp, the tuberose,
//   the ploughed ground (`furrows`) and the far hills with the palace's outline (`hills`).
//
// What is from memory, not checked: the seas' and craters' coordinates (close, not exact);
// the Spanish double-horned anvil's proportions; Fajalauza's palette and motifs (blue and
// green on white, the pomegranate, birds); the bridle's details; the palace's skyline is a
// generic row of towers and walls, not the Alhambra's real profile.
const Forge = (() => {
    const S = Souvenir;
    const TAU = Math.PI * 2, DEG = Math.PI / 180;
    const { clamp, smooth, lerp, noise2, noise3, hashI } = S;

    const canvas = (w, h) => {
        const c = document.createElement('canvas');
        c.width = Math.max(1, Math.ceil(w));
        c.height = Math.max(1, Math.ceil(h));
        return c;
    };
    // pixels per unit for a sprite pasted at scale s, in half steps
    const resOf = (g, s = 1) => Math.max(0.5, Math.ceil(S.pxScale(g) * s * 2 - 1e-6) / 2);
    const fbm = (x, y, oct, seed) => {
        let a = 0.5, f = 1, t = 0;
        for (let k = 0; k < oct; k++) {
            t += a * noise2(x * f, y * f, seed + k * 17);
            f *= 2.03;
            a *= 0.5;
        }
        return t;
    };
    // Worley: distances to the nearest and second-nearest seeded point (cells of size 1) and
    // the nearest one's id, in W (no allocation per pixel).
    const W = [0, 0, 0, 0, 0];
    function worley(x, y, seed) {
        const xi = Math.floor(x), yi = Math.floor(y);
        let d1 = 9, d2 = 9;
        for (let j = -1; j <= 1; j++) {
            for (let i = -1; i <= 1; i++) {
                const cx = xi + i, cy = yi + j;
                const px = cx + 0.1 + 0.8 * hashI(cx, cy, 1, seed), py = cy + 0.1 + 0.8 * hashI(cx, cy, 2, seed);
                const dd = (px - x) * (px - x) + (py - y) * (py - y);
                if (dd < d1) {
                    d2 = d1;
                    d1 = dd;
                    W[2] = hashI(cx, cy, 3, seed);
                    W[3] = px;
                    W[4] = py;
                } else if (dd < d2) d2 = dd;
            }
        }
        W[0] = Math.sqrt(d1);
        W[1] = Math.sqrt(d2);
        return W;
    }
    // Worley in rings about the origin (planishing marks, a coiled thing): cells of about
    // `cell` units in rings of that width, no seam. (rr, th) polar; result in W like worley.
    function ringWorley(rr, th, cell, seed) {
        const u = rr / cell, i0 = Math.floor(u), x = u * Math.cos(th), y = u * Math.sin(th);
        let d1 = 9, d2 = 9;
        const t0 = (((th / TAU) % 1) + 1) % 1;
        for (let j = Math.max(0, i0 - 1); j <= i0 + 1; j++) {
            const n = Math.max(3, Math.round(TAU * (j + 0.5))), k0 = Math.floor(t0 * n);
            for (let kk = k0 - 1; kk <= k0 + 1; kk++) {
                const k = ((kk % n) + n) % n;
                const fr = j + 0.2 + 0.6 * hashI(j, k, 1, seed), fa = ((k + 0.2 + 0.6 * hashI(j, k, 2, seed)) / n) * TAU;
                const dx = fr * Math.cos(fa) - x, dy = fr * Math.sin(fa) - y, dd = dx * dx + dy * dy;
                if (dd < d1) {
                    d2 = d1;
                    d1 = dd;
                    W[2] = hashI(j, k, 3, seed);
                } else if (dd < d2) d2 = dd;
            }
        }
        W[0] = Math.sqrt(d1);
        W[1] = Math.sqrt(d2);
        return W;
    }
    const hex = (h) => S.hex2rgb(h).map((v) => v / 255);
    const mixA = (a, b, t, out = a) => {
        out[0] = a[0] + (b[0] - a[0]) * t;
        out[1] = a[1] + (b[1] - a[1]) * t;
        out[2] = a[2] + (b[2] - a[2]) * t;
        return out;
    };
    const into = (out, c, t) => {
        out[0] += (c[0] - out[0]) * t;
        out[1] += (c[1] - out[1]) * t;
        out[2] += (c[2] - out[2]) * t;
    };

    // ------------------------------------------------------------------ lights
    const FIRE = [2.05, 1.18, 0.56]; // the forge's coals and flame, as a light
    const MOON = [0.62, 0.72, 0.98]; // the full moon's light
    const DARK = [0.028, 0.032, 0.075]; // the blue-black of what neither reaches
    // a light given in the caller's units, in a thing's own frame (moved, unscaled, unturned)
    function toLocal(Lt, x, y, s = 1, rot = 0) {
        if (!Lt) return null;
        const c = Math.cos(-rot), sn = Math.sin(-rot);
        if (Lt.dir) {
            const [a, b, z] = Lt.dir;
            return { c: Lt.c, wrap: Lt.wrap, dir: [a * c - b * sn, a * sn + b * c, z] };
        }
        const dx = (Lt.x - x) / s, dy = (Lt.y - y) / s;
        return { c: Lt.c, wrap: Lt.wrap, P: [dx * c - dy * sn, dx * sn + dy * c, (Lt.z ?? 0) / s], r0: (Lt.r0 ?? 1e9) / s };
    }
    const lightsOf = (o, x, y, s, rot) => [toLocal(o.fire, x, y, s, rot), toLocal(o.moon, x, y, s, rot), ...(o.lights ?? []).map((l) => toLocal(l, x, y, s, rot))].filter(Boolean);

    // ------------------------------------------------------------------ the shader
    // One piece painted per pixel under real lights.
    //   box, res      its extent in units, pixels per unit
    //   mask(g)       fills the silhouette
    //   shape         'round' (a balloon over the outline) | 'bevel' (rises R units in from
    //                 the edge) | 'none';  relief: the height's multiplier
    //   height(x, y, d)  more height in units (d: units from the edge)
    //   albedo(x, y, d, h, out)  the paint's own colour, 0..1, into out[0..2]; out[3] the
    //                 sheen's strength here (1); out[4] how much this pixel is a metal (o.metal)
    //   lights        [{ P | dir, c, r0, wrap }] in the piece's frame;  amb [r, g, b]
    //   spec          { k, power, broad, broadPow }: a sharp sheen and a broad reflection of
    //                 each light (what makes metal read), tinted by the paint where it is metal
    //   stroke        { amp, freq, tone }: streaks that follow the form's tone
    //   marks(g)      greys on mid-grey, read back as more or less light (markAmp)
    //   edge          { rough, freq, amp }: the last stroke breaks the outline
    //   alpha(x, y, d) a multiplier of the coverage (thin, translucent parts)
    //   over(g)       drawn on top, clipped to the piece
    function lit(o) {
        const res = o.res ?? 1, box = o.box;
        const w = Math.max(2, Math.ceil(box.w * res)), h = Math.max(2, Math.ceil(box.h * res)), N = w * h;
        const c = canvas(w, h), g = c.getContext('2d', { willReadFrequently: true });
        g.setTransform(res, 0, 0, res, -box.x * res, -box.y * res);
        g.fillStyle = '#fff';
        o.mask(g);
        const img = g.getImageData(0, 0, w, h), px = img.data;
        const inside = new Uint8Array(N);
        for (let i = 0; i < N; i++) inside[i] = px[i * 4 + 3] > 127 ? 1 : 0;
        const d = S.edt(inside, w, h);
        const shape = o.shape ?? 'round', relief = o.relief ?? 1;
        let H;
        if (shape === 'round') {
            H = S.inflate(inside, w, h);
            if (relief !== 1) for (let i = 0; i < N; i++) H[i] *= relief;
        } else if (shape === 'bevel') {
            const R = (o.R ?? 8) * res;
            H = new Float32Array(N);
            for (let i = 0; i < N; i++) {
                const m = Math.min(1, d[i] / R);
                H[i] = (1 - (1 - m) * (1 - m)) * R * relief;
            }
            S.boxBlur(H, w, h, Math.max(1, Math.round(res * 0.8)), 1);
        } else H = new Float32Array(N);
        if (o.height) {
            for (let y = 0, i = 0; y < h; y++) {
                for (let x = 0; x < w; x++, i++) if (inside[i] || px[i * 4 + 3]) H[i] += o.height(box.x + (x + 0.5) / res, box.y + (y + 0.5) / res, d[i] / res) * res;
            }
        }
        if (o.smoothH) S.boxBlur(H, w, h, Math.max(1, Math.round(o.smoothH * res)), 1);
        let marks = null;
        if (o.marks) {
            const mc = canvas(w, h), mg = mc.getContext('2d', { willReadFrequently: true });
            mg.fillStyle = '#808080';
            mg.fillRect(0, 0, w, h);
            mg.setTransform(res, 0, 0, res, -box.x * res, -box.y * res);
            o.marks(mg);
            marks = mg.getImageData(0, 0, w, h).data;
        }
        const markAmp = o.markAmp ?? 0.6;
        const Ls = (o.lights ?? []).map((L) => {
            if (L.dir) {
                const l = Math.hypot(...L.dir);
                return { dir: L.dir.map((v) => v / l), c: L.c, wrap: L.wrap ?? 0.15 };
            }
            return { P: L.P, c: L.c, r0: L.r0 ?? 1e9, wrap: L.wrap ?? 0.15 };
        });
        const amb = o.amb ?? DARK, sp = o.spec ?? null;
        const sk = sp?.k ?? 0, spow = sp?.power ?? 40, bk = sp?.broad ?? 0, bpow = sp?.broadPow ?? 5;
        const st = o.stroke, sAmp = st?.amp ?? 0, sF = (st?.freq ?? 0.06) / res, sTone = st?.tone ?? 8, sSeed = S.seedOf(o.seed ?? 1);
        const eg = o.edge, eR = eg ? (eg.rough ?? 1.5) * res : 0, eF = eg?.freq ?? 0.3, eA = eg?.amp ?? 0.8;
        const out = [0, 0, 0, 1, o.metal ?? 0, 0, 0, 0];
        const metal0 = o.metal ?? 0;
        for (let y = 0, i = 0; y < h; y++) {
            for (let x = 0; x < w; x++, i++) {
                const a = px[i * 4 + 3];
                if (!a) continue;
                const xm = Math.max(0, x - 1), xp = Math.min(w - 1, x + 1), ym = Math.max(0, y - 1), yp = Math.min(h - 1, y + 1);
                const gx = (H[y * w + xp] - H[y * w + xm]) / (xp - xm || 1), gy = (H[yp * w + x] - H[ym * w + x]) / (yp - ym || 1);
                const nl = 1 / Math.sqrt(1 + gx * gx + gy * gy), nx = -gx * nl, ny = -gy * nl, nz = nl;
                const ux = box.x + (x + 0.5) / res, uy = box.y + (y + 0.5) / res, du = d[i] / res, hu = H[i] / res;
                out[0] = out[1] = out[2] = 0.7;
                out[3] = 1;
                out[4] = metal0;
                out[5] = out[6] = out[7] = 0;
                if (o.albedo) o.albedo(ux, uy, du, hu, out);
                // the hand: streaks along the form's tone lines, and the marks
                let k = 1;
                if (sAmp) k += sAmp * noise3(x * sF, y * sF, (nx * 0.6 + ny * 0.8 + nz) * sTone, sSeed);
                if (marks) k += (marks[i * 4] / 255 - 0.502) * markAmp * 2;
                let r = amb[0], gg = amb[1], b = amb[2], sr = 0, sg = 0, sb = 0;
                for (const L of Ls) {
                    let lx, ly, lz, att = 1;
                    if (L.dir) {
                        lx = L.dir[0];
                        ly = L.dir[1];
                        lz = L.dir[2];
                    } else {
                        lx = L.P[0] - ux;
                        ly = L.P[1] - uy;
                        lz = L.P[2] - hu;
                        const dl = Math.hypot(lx, ly, lz) || 1;
                        lx /= dl;
                        ly /= dl;
                        lz /= dl;
                        const q = dl / L.r0;
                        att = 1 / (1 + q * q);
                    }
                    const ndl = nx * lx + ny * ly + nz * lz;
                    const dif = Math.max(0, (ndl + L.wrap) / (1 + L.wrap)) * att;
                    r += L.c[0] * dif;
                    gg += L.c[1] * dif;
                    b += L.c[2] * dif;
                    if (sk || bk) {
                        // half vector, the eye straight in front
                        let hx = lx, hy = ly, hz = lz + 1;
                        const hl = Math.hypot(hx, hy, hz) || 1;
                        const ndh = Math.max(0, (nx * hx + ny * hy + nz * hz) / hl);
                        const s1 = (sk ? Math.pow(ndh, spow) * sk : 0) + (bk ? Math.pow(ndh, bpow) * bk : 0);
                        const sv = s1 * att * out[3];
                        sr += L.c[0] * sv;
                        sg += L.c[1] * sv;
                        sb += L.c[2] * sv;
                    }
                }
                const m = out[4];
                r = out[0] * r * k + sr * (1 - m + m * (0.25 + out[0] * 1.1));
                gg = out[1] * gg * k + sg * (1 - m + m * (0.25 + out[1] * 1.1));
                b = out[2] * b * k + sb * (1 - m + m * (0.25 + out[2] * 1.1));
                // what glows by itself (hot iron, an ember)
                r += out[5];
                gg += out[6];
                b += out[7];
                // too much light runs to white, then a soft shoulder
                const mx = Math.max(r, gg, b);
                if (mx > 1) {
                    const e = (mx - 1) * 0.45;
                    r += e;
                    gg += e;
                    b += e;
                }
                px[i * 4] = 255 * (r < 0.82 ? Math.max(0, r) : 0.82 + 0.18 * (1 - Math.exp(-(r - 0.82) / 0.18)));
                px[i * 4 + 1] = 255 * (gg < 0.82 ? Math.max(0, gg) : 0.82 + 0.18 * (1 - Math.exp(-(gg - 0.82) / 0.18)));
                px[i * 4 + 2] = 255 * (b < 0.82 ? Math.max(0, b) : 0.82 + 0.18 * (1 - Math.exp(-(b - 0.82) / 0.18)));
                let al = a;
                if (eg && d[i] < eR) {
                    const n = noise2(ux * eF, uy * eF, sSeed + 21) * 0.65 + noise2(ux * eF * 2.7, uy * eF * 2.7, sSeed + 22) * 0.35;
                    al = a * smooth(0.25, 0.75, d[i] / eR + n * eA);
                }
                if (o.alpha) al *= o.alpha(ux, uy, du);
                px[i * 4 + 3] = al;
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

    // ------------------------------------------------------------------ pasting and shadows
    function put(g, sp, x, y, s = 1, rot = 0, alpha = 1) {
        S.put(g, sp, { x, y, rot, s, alpha });
    }
    // a sprite's shadow on the paint already there: blurred once, small
    function shadow(g, sp, x, y, s = 1, { rot = 0, dx = 6, dy = 8, blur = 8, alpha = 0.55, color = '#07060c' } = {}) {
        sp.sh = sp.sh || {};
        const key = blur + color;
        if (!sp.sh[key]) {
            const r0 = sp.canvas.width / sp.box.w, rs = Math.min(r0, Math.max(0.15, 2.4 / blur)), pad = blur * 2.2;
            const c = canvas((sp.box.w + pad * 2) * rs, (sp.box.h + pad * 2) * rs), q = c.getContext('2d');
            q.filter = `blur(${(blur * rs).toFixed(2)}px)`;
            q.drawImage(sp.canvas, pad * rs, pad * rs, sp.box.w * rs, sp.box.h * rs);
            q.filter = 'none';
            q.globalCompositeOperation = 'source-in';
            q.fillStyle = color;
            q.fillRect(0, 0, c.width, c.height);
            sp.sh[key] = { canvas: c, box: { x: sp.box.x - pad, y: sp.box.y - pad, w: c.width / rs, h: c.height / rs } };
        }
        g.save();
        g.globalCompositeOperation = 'source-atop';
        S.put(g, sp.sh[key], { x: x + dx, y: y + dy, rot, s, alpha });
        g.restore();
    }
    // where a light throws the shadow of something `lift` units in front of a surface
    const throwOf = (L, x, y, lift) => {
        if (!L) return [0, 0];
        if (L.dir) return [(-L.dir[0] / Math.max(0.15, L.dir[2])) * lift, (-L.dir[1] / Math.max(0.15, L.dir[2])) * lift];
        const dz = Math.max(40, (L.z ?? 300) - lift);
        return [((x - L.x) * lift) / dz, ((y - L.y) * lift) / dz];
    };

    // ------------------------------------------------------------------ copper
    const COPPER = hex('#c7774a'), COPPER_HI = hex('#e8a070'), OXIDE = hex('#6e2f22'), STRAW = hex('#c89a4e'), PURPLE = hex('#5a2c3c');
    const SOOT = [0.05, 0.045, 0.05], VERD = hex('#4f9c86'), TIN = hex('#c9c6c0'), IRON = hex('#45403e'), RUST = hex('#7a3d22');

    // A planished copper pan hung by its handle. (x, y): the middle of the body; r its
    // radius (the handle and its hole reach 1.55 r above the middle). view: 'back' (the
    // hammered bottom towards the eye) | 'inside' (the tinned hollow). Returns the nail's point.
    function pan(g, o = {}) {
        const { x = 0, y = 0, s = 1, rot = 0, r = 100, view = 'back', seed = 'pan', sooty = 0.6, lift = 14 } = o;
        const res = resOf(g, s), sd = S.seedOf(seed), rnd = Motion.rng('pan' + seed);
        const Ls = lightsOf(o, x, y, s, rot), amb = o.amb ?? DARK;
        const R = r, rb = r * (0.62 + rnd() * 0.08), cell = 8.5 + rnd() * 3, dentK = 1.2 + rnd() * 0.6;
        const fall = o.dentAt ?? rnd() * TAU, bump = o.dent ?? rnd() < 0.6; // a dent from a fall on the rim
        const hl = R * (0.5 + rnd() * 0.12), hw = R * 0.13, hole = hw * 0.36;
        const hx0 = 0, hy0 = -R * 0.9; // where the handle leaves the body
        const hy1 = -R - hl; // its end
        // the handle: a tapering strap with a rounded end and a hole, riveted to a plate
        const strap = [];
        for (let i = 0; i <= 10; i++) {
            const u = i / 10, yy = lerp(hy0, hy1 + hw * 0.6, u), ww = lerp(hw * 1.05, hw * 0.78, u);
            strap.push([-ww, yy]);
        }
        for (let i = 0; i <= 12; i++) {
            const a = Math.PI + (i / 12) * Math.PI, rr = hw * 0.82;
            strap.push([Math.cos(a) * rr, hy1 + hw * 0.6 + Math.sin(a) * rr * 1.25]);
        }
        for (let i = 10; i >= 0; i--) {
            const u = i / 10, yy = lerp(hy0, hy1 + hw * 0.6, u), ww = lerp(hw * 1.05, hw * 0.78, u);
            strap.push([ww, yy]);
        }
        const holeC = [0, hy1 + hw * 0.55];
        const rivets = [[-hw * 0.5, -R * 0.98], [hw * 0.5, -R * 0.98], [0, -R * 1.12]];
        const handleSp = lit({
            box: S.bbox(strap, 4), res, seed: seed + 'h', lights: Ls, amb, shape: 'bevel', R: 3.2, relief: 0.9, metal: 0.8,
            mask: (q) => {
                q.beginPath();
                S.trace(q, strap);
                q.ellipse(holeC[0], holeC[1], hole * 1.1, hole * 1.45, 0, 0, TAU); // worn oval by the nail
                q.fill('evenodd');
            },
            height: (px, py) => {
                let hh = 0.4 * noise2(px * 0.4, py * 0.4, sd + 5);
                for (const [rx, ry] of rivets) {
                    const dd = Math.hypot(px - rx, py - ry);
                    hh += 2.6 * Math.sqrt(Math.max(0, 1 - (dd / 4.6) ** 2));
                }
                // the plate's edge
                if (py > -R * 1.22) hh += 1.2;
                return hh;
            },
            albedo: (px, py, dd, hh, out) => {
                const n = noise2(px * 0.08, py * 0.08, sd + 9);
                mixA(COPPER, OXIDE, 0.35 + 0.3 * n, out);
                if (py < -R * 1.22) mixA(out, IRON, 0.75, out); // an iron strap on a copper plate
                into(out, SOOT, smooth(0.2, 0.7, noise2(px * 0.05, py * 0.05, sd + 3)) * 0.35);
                for (const [rx, ry] of rivets) if (Math.hypot(px - rx, py - ry) < 6.5) into(out, VERD, 0.35 * smooth(6.5, 4.4, Math.hypot(px - rx, py - ry)));
            },
            spec: { k: 1.1, power: 34, broad: 0.35, broadPow: 4 },
            edge: { rough: 0.8, freq: 0.5, amp: 0.4 },
        });
        // the body
        const inside = view === 'inside';
        const body = lit({
            box: { x: -R - 3, y: -R - 3, w: 2 * R + 6, h: 2 * R + 6 }, res, seed, lights: Ls, amb, shape: 'none', metal: 1,
            mask: (q) => {
                q.beginPath();
                const pts = [];
                for (let i = 0; i < 96; i++) {
                    const a = (i / 96) * TAU, dent = bump ? -(o.dent ? 14 : 4) * Math.exp(-((((a - fall + 9.42) % TAU) - Math.PI) ** 2) * 60) : 0;
                    pts.push([Math.cos(a) * (R + dent), Math.sin(a) * (R + dent)]);
                }
                S.trace(q, pts);
                q.fill();
            },
            height: (px, py) => {
                const rr = Math.hypot(px, py), th = Math.atan2(py, px);
                let hh;
                if (!inside) {
                    // the bottom towards the eye, the flared wall falling away to the lip
                    const t = smooth(rb - R * 0.06, rb + R * 0.08, rr);
                    hh = lerp(R * 0.36 + R * 0.05 * (1 - (rr / rb) ** 2), R * 0.36 - (rr - rb) * 1.05, t);
                } else {
                    hh = -R * 0.42 * Math.pow(Math.max(0, 1 - (rr / (R * 0.93)) ** 2), 0.75);
                }
                // the rolled bead of the lip
                hh += 3.2 * Math.exp(-(((rr - R * 0.955) / (R * 0.03)) ** 2));
                // planishing: shallow facets in rings
                const ww = ringWorley(rr, th, cell, sd);
                if (rr < R * 0.92) hh += dentK * ww[0] * ww[0] * 1.6 * smooth(R * 0.03, R * 0.12, rr);
                return hh;
            },
            albedo: (px, py, dd, hh, out) => {
                const rr = Math.hypot(px, py), th = Math.atan2(py, px);
                const ww = ringWorley(rr, th, cell, sd), id = ww[2];
                const n1 = noise2(px * 0.03, py * 0.03, sd + 1), n2 = noise2(px * 0.11, py * 0.11, sd + 2);
                // copper, each facet oxidised its own way
                mixA(COPPER, COPPER_HI, 0.3 + 0.35 * id * (n2 * 0.5 + 0.5), out);
                into(out, OXIDE, smooth(-0.1, 0.6, n1) * 0.55);
                // fire scale in bands round the bottom: straw, then purple
                const band = Math.sin(rr * 0.09 + n1 * 3);
                if (!inside) into(out, band > 0.4 ? STRAW : PURPLE, smooth(rb * 1.15, rb * 0.6, rr) * 0.3 * Math.abs(band));
                if (!inside) into(out, SOOT, sooty * smooth(rb * 1.05, rb * 0.35, rr) * smooth(-0.35, 0.35, n1 + 0.4 * n2));
                if (inside) {
                    // the tin lining, worn to copper on the rim and where it was scraped
                    const worn = smooth(R * 0.8, R * 0.9, rr) + smooth(0.35, 0.6, noise2(px * 0.05 + 7, py * 0.05, sd + 4)) * 0.8;
                    const tin = 1 - clamp(worn);
                    out[3] = 1;
                    into(out, TIN, tin * 0.92);
                    into(out, [0.3, 0.3, 0.32], tin * smooth(0.3, 0.9, noise2(px * 0.02, py * 0.02, sd + 8)) * 0.35); // dull, greyed tin
                    // spoon scrapes: short arcs
                    const sc = Math.abs(Math.sin(th * 3 + rr * 0.3 + n2 * 2));
                    if (tin > 0.5 && sc < 0.03 && rr < R * 0.7) into(out, COPPER_HI, 0.5);
                }
                // verdigris in the lip's crevice
                into(out, VERD, smooth(R * 0.9, R * 0.98, rr) * smooth(0.2, 0.7, noise2(px * 0.09, py * 0.09, sd + 6)) * 0.6);
                // a pan left out in the wet: verdigris in blooms across it
                if (o.verd) into(out, VERD, o.verd * smooth(0.1, 0.55, noise2(px * 0.025, py * 0.025, sd + 16) + 0.3 * noise2(px * 0.1, py * 0.1, sd + 17)));
                out[3] = 1 - 0.85 * (out[0] < 0.15 ? 1 : 0);
            },
            spec: { k: 1.25, power: 46, broad: 0.4, broadPow: 5 },
            stroke: { amp: 0.06, freq: 0.05, tone: 7 },
            edge: { rough: 1.1, freq: 0.35, amp: 0.5 },
        });
        g.save();
        g.translate(x, y);
        g.rotate(rot);
        g.scale(s, s);
        // the shadows on the wall: from the fire (and the moon if it reaches)
        const L0 = Ls[0];
        const [tx, ty] = L0 ? (L0.P ? [(-L0.P[0] / Math.max(60, L0.P[2])) * lift, (-L0.P[1] / Math.max(60, L0.P[2])) * lift] : [(-L0.dir[0] / Math.max(0.2, L0.dir[2])) * lift, (-L0.dir[1] / Math.max(0.2, L0.dir[2])) * lift]) : [5, 8];
        const cl = (v) => clamp(v, -40, 40);
        shadow(g, handleSp, cl(tx) * 0.4, cl(ty) * 0.4, 1, { dx: 0, dy: 0, blur: 3, alpha: 0.6 });
        shadow(g, body, cl(tx), cl(ty), 1, { dx: 0, dy: 0, blur: 9, alpha: 0.62 });
        // the nail: driven in, its head square and lit on the fire's side
        if (o.nail !== false) nail(g, { x: holeC[0], y: holeC[1] - hole * 0.6, s: 0.9, lights: Ls, amb, seed: seed + 'n', bare: true });
        put(g, handleSp, 0, 0);
        put(g, body, 0, 0);
        // the shank of the nail over the hole's top edge
        g.restore();
        return { nail: [x + Math.sin(rot) * -(holeC[1]) * s, y + holeC[1] * s] };
    }

    // A forged nail with a square head. (x, y): the head's middle. `bare`: lights already local.
    function nail(g, o = {}) {
        const { x = 0, y = 0, s = 1, seed = 'nail', len = 0 } = o;
        const res = resOf(g, s * 2);
        const Ls = o.bare ? o.lights : lightsOf(o, x, y, s, 0);
        const hs = 5.2;
        const sq = [[-hs, -hs * 0.9], [hs * 0.95, -hs], [hs, hs * 0.92], [-hs * 0.9, hs]];
        const sp = lit({
            box: S.bbox(sq, 2), res, seed, lights: o.bare ? Ls.map((L) => (L.P ? { ...L, P: [L.P[0] - x, L.P[1] - y, L.P[2]] } : L)) : Ls, amb: o.amb ?? DARK, shape: 'round', relief: 0.5, metal: 0.7,
            mask: (q) => {
                q.beginPath();
                S.trace(q, sq);
                q.fill();
            },
            height: (px, py) => 1.2 * noise2(px * 0.6, py * 0.6, S.seedOf(seed)) + (Math.abs(px) < 1.2 || Math.abs(py) < 1.2 ? -0.6 : 0),
            albedo: (px, py, dd, hh, out) => {
                mixA(IRON, RUST, smooth(-0.3, 0.5, noise2(px * 0.4, py * 0.4, S.seedOf(seed) + 2)), out);
            },
            spec: { k: 0.6, power: 20, broad: 0.2, broadPow: 3 },
        });
        g.save();
        g.translate(x, y);
        g.scale(s, s);
        shadow(g, sp, 2, 3, 1, { dx: 0, dy: 0, blur: 2, alpha: 0.6 });
        put(g, sp, 0, 0);
        g.restore();
    }

    // ------------------------------------------------------------------ iron
    const SCALE = hex('#2c2f3a'), IRON_HI = hex('#8e8c8a'), WOOD = hex('#7a5232'), WOOD_DK = hex('#3e2618'), ASH = hex('#8e8a86');
    const smoothPts = (pts, seg = 6) => S.curve(pts, true, seg);
    const fillPts = (q, pts) => {
        q.beginPath();
        S.trace(q, pts);
        q.fill();
    };
    // hot iron: from the dull red of its ends to the yellow of its heart (k 0 … 1)
    const HOT = (k, out) => {
        const r = 0.9 * smooth(0, 0.35, k) + 0.35 * smooth(0.5, 1, k), g = 0.05 + 0.5 * smooth(0.4, 1, k) * k, b = 0.02 + 0.12 * smooth(0.85, 1, k);
        out[5] = r;
        out[6] = g * smooth(0, 0.3, k);
        out[7] = b * smooth(0, 0.3, k);
    };
    // A wrought-iron sprite: outline `pts`, its own height, the iron's look; returns the sprite.
    function ironSprite(pts, o) {
        return lit({
            box: S.bbox(pts, 4), res: o.res, seed: o.seed, lights: o.Ls, amb: o.amb, shape: o.shape ?? 'round', relief: o.relief ?? 0.5, R: o.R, metal: 0.85, smoothH: o.smoothH,
            mask: (q) => fillPts(q, pts),
            height: o.height,
            albedo: (x, y, d, hh, out) => {
                const sd = S.seedOf(o.seed);
                const n = noise2(x * 0.05, y * 0.05, sd), m = noise2(x * 0.18, y * 0.18, sd + 1);
                mixA(IRON, SCALE, smooth(-0.4, 0.4, n), out);
                into(out, RUST, smooth(0.25, 0.7, m) * (o.rust ?? 0.5));
                into(out, IRON_HI, (o.polish ? o.polish(x, y, d) : 0));
                out[3] = 0.5 + 0.5 * (o.polish ? o.polish(x, y, d) : 0);
                if (o.hot) HOT(o.hot(x, y, d), out);
                if (o.paint) o.paint(x, y, d, hh, out);
            },
            spec: { k: 0.8, power: 26, broad: 0.25, broadPow: 4 },
            stroke: { amp: 0.06, freq: 0.07, tone: 6 },
            edge: { rough: 0.9, freq: 0.4, amp: 0.4 },
            over: o.over,
        });
    }
    const place = (g, sp, x, y, s, rot, sh) => {
        g.save();
        g.translate(x, y);
        g.rotate(rot);
        g.scale(s, s);
        if (sh) shadow(g, sp, sh[0], sh[1], 1, { dx: 0, dy: 0, blur: sh[2] ?? 6, alpha: sh[3] ?? 0.6 });
        put(g, sp, 0, 0);
        g.restore();
    };

    // A horseshoe, toe up (x, y its middle), 150 wide at s = 1: a fullered web with eight
    // nail holes, a toe clip, heels; hot: 0 cold … 1 straight from the fire; worn: a used one.
    function horseshoe(g, o = {}) {
        const { x = 0, y = 0, s = 1, rot = 0, seed = 'shoe', hot = 0, worn = 0 } = o;
        const res = resOf(g, s), Ls = lightsOf(o, x, y, s, rot), sd = S.seedOf(seed);
        const outer = [], inner = [];
        const shp = (t, R0) => {
            // a horseshoe is wider at the toe and its branches run nearly straight to the heels
            const a = -Math.PI / 2 + t * Math.PI * 1.42 - Math.PI * 0.71 + Math.PI / 2;
            return [Math.cos(a - Math.PI / 2) * R0 * 0.92, Math.sin(a - Math.PI / 2) * R0 * (1.05 + 0.1 * Math.cos(a - Math.PI / 2) ** 2)];
        };
        const n = 40;
        for (let i = 0; i <= n; i++) outer.push(shp(i / n, 75));
        for (let i = n; i >= 0; i--) {
            const u = i / n, wdt = 75 - (23 - 6 * Math.abs(u - 0.5) * 2);
            inner.push(shp(u, wdt));
        }
        const pts = [...outer, ...inner];
        const holes = [];
        for (const u of [0.13, 0.22, 0.31, 0.4, 0.6, 0.69, 0.78, 0.87]) holes.push(shp(u, 63));
        const sp = ironSprite(pts.concat([pts[0]]), {
            res, seed, Ls, amb: o.amb, relief: 0.25, rust: worn ? 0.7 : 0.3,
            height: (px, py) => {
                let hh = 0;
                // the fuller: a groove round the web in which the nail heads sit
                const rr = Math.hypot(px / 0.92, py / 1.1);
                hh -= 2.2 * Math.exp(-(((rr - 63) / 4) ** 2));
                for (const [hx, hy] of holes) hh -= 4 * smooth(4.5, 2.2, Math.hypot(px - hx, py - hy));
                hh += 0.5 * noise2(px * 0.3, py * 0.3, sd);
                return hh;
            },
            polish: (px, py) => (worn ? 0.35 * smooth(0.1, 0.6, noise2(px * 0.04, py * 0.04, sd + 3)) : 0),
            hot: hot ? (px, py) => hot * (0.55 + 0.45 * smooth(-0.6, 0.6, noise2(px * 0.03, py * 0.03, sd + 4))) * smooth(-80, 20, -py) : null,
        });
        place(g, sp, x, y, s, rot, hot ? null : [4, 6, 5, 0.55]);
        // the toe clip
        return sp;
    }

    // A blacksmith's hammer (cross-peen): head along x from −46 to 46, handle down +y, 300 long.
    function hammer(g, o = {}) {
        const { x = 0, y = 0, s = 1, rot = 0, seed = 'hammer' } = o;
        const res = resOf(g, s), Ls = lightsOf(o, x, y, s, rot), sd = S.seedOf(seed);
        const handle = smoothPts([[-7, 8], [7, 8], [8.5, 120], [10, 230], [11, 290], [6, 302], [-6, 302], [-11, 290], [-10, 230], [-8.5, 120]], 5);
        const hs = lit({
            box: S.bbox(handle, 3), res, seed: seed + 'w', lights: Ls, amb: o.amb, shape: 'round', relief: 0.8,
            mask: (q) => fillPts(q, handle),
            height: (px, py) => 0.3 * noise2(px * 0.6, py * 0.04, sd),
            albedo: (px, py, d, hh, out) => {
                // ash wood, its grain long, black from hands at the grip, scorched near the head
                const gr = noise2(px * 0.5, py * 0.012, sd + 1) * 0.5 + noise2(px * 1.4, py * 0.03, sd + 2) * 0.5;
                mixA(WOOD, WOOD_DK, 0.35 + 0.35 * gr, out);
                into(out, SOOT, smooth(150, 290, py) * 0.45 + smooth(40, 8, py) * 0.6);
                out[3] = 0.3 + smooth(150, 290, py) * 0.6;
            },
            spec: { k: 0.35, power: 18 },
            edge: { rough: 0.8, freq: 0.5, amp: 0.4 },
        });
        const head = smoothPts([[-46, -8], [-30, -16], [26, -17], [38, -12], [50, -4], [50, 4], [38, 12], [26, 17], [-30, 16], [-46, 9]], 4);
        const hd = ironSprite(head, {
            res, seed, Ls, amb: o.amb, shape: 'bevel', R: 5, relief: 1, rust: 0.25,
            polish: (px) => smooth(-30, -46, px) * 0.9 + smooth(34, 50, px) * 0.6,
            height: (px, py) => 0.6 * noise2(px * 0.25, py * 0.25, sd + 3) + (Math.abs(px) < 7 ? 1.2 : 0),
        });
        g.save();
        g.translate(x, y);
        g.rotate(rot);
        g.scale(s, s);
        shadow(g, hs, 6, 8, 1, { dx: 0, dy: 0, blur: 6, alpha: 0.6 });
        shadow(g, hd, 7, 9, 1, { dx: 0, dy: 0, blur: 6, alpha: 0.6 });
        put(g, hs, 0, 0);
        put(g, hd, 0, 0);
        // the wedge in the eye
        g.fillStyle = 'rgba(20,16,18,0.7)';
        g.fillRect(-2.5, -5, 5, 10);
        g.restore();
    }

    // Smith's tongs, closed: jaws at the origin pointing −y, reins down to +y, `len` long.
    function tongs(g, o = {}) {
        const { x = 0, y = 0, s = 1, rot = 0, seed = 'tongs', len = 420, open = 0.06, hot = 0 } = o;
        const res = resOf(g, s), Ls = lightsOf(o, x, y, s, rot), sd = S.seedOf(seed);
        const sprites = [];
        for (const side of [-1, 1]) {
            const a = side * open;
            const rein = [], back = [];
            const P = (u) => {
                // a jaw 70 long, the boss at 80, then the rein spreading a little
                const yy = -10 + u * (len + 10), xx = (yy < 80 ? side * (yy < 0 ? 3 : 3 + yy * 0.02) : side * (4.6 + (yy - 80) * Math.tan(open) * 1.2));
                return [xx, yy];
            };
            const wd = (u) => (u < 0.16 ? 11 : u < 0.22 ? 15 : 8.5 - u * 2.5);
            for (let i = 0; i <= 30; i++) {
                const u = i / 30, [px, py] = P(u), w = wd(u);
                rein.push([px - w * 0.5, py]);
                back.push([px + w * 0.5, py]);
            }
            const pts = [...rein, ...back.reverse()];
            sprites.push(ironSprite(pts, {
                res, seed: seed + side, Ls, amb: o.amb, relief: 0.6, rust: 0.4,
                polish: (px, py) => smooth(len * 0.6, len * 0.95, py) * 0.6,
                hot: hot ? (px, py) => hot * smooth(60, -10, py) : null,
            }));
        }
        g.save();
        g.translate(x, y);
        g.rotate(rot);
        g.scale(s, s);
        for (const sp of sprites) shadow(g, sp, 5, 7, 1, { dx: 0, dy: 0, blur: 5, alpha: 0.6 });
        for (const sp of sprites) put(g, sp, 0, 0);
        // the rivet at the boss
        nail(g, { x: 0, y: 76, s: 0.6, lights: Ls, amb: o.amb, seed: seed + 'rv', bare: true });
        g.restore();
    }

    // The anvil (a Spanish bigornia: two horns, one round, one square) on its stump, in
    // profile, the face 245 long at y = −100, the base on y = 102, the stump to y = 330.
    //   1 the face polished by the hammer, a lighter band, its edges chipped  2 the hardy and
    //   pritchel holes  3 the horns: the round one polished to its tip  4 mill scale and
    //   rust on the body, a forge mark  5 the waist and the four feet  6 the stump: a log of
    //   holm oak, its end grain checked, bark in plates, two iron hoops  7 spikes holding
    //   the anvil to it  8 scale flakes and a dropped nail on the block  9 a hammer on the
    //   face  10 its shadow on the floor.
    function anvil(g, o = {}) {
        const { x = 0, y = 0, s = 1, seed = 'anvil' } = o;
        const res = resOf(g, s), Ls = lightsOf(o, x, y, s, 0), sd = S.seedOf(seed), amb = o.amb;
        const body = smoothPts([[-236, -82], [-200, -91], [-160, -97], [-120, -100], [0, -101], [125, -100], [175, -97], [222, -89], [206, -79], [170, -67], [128, -53], [82, -30], [60, -6], [56, 26], [70, 52], [100, 72], [119, 90], [112, 103], [-112, 103], [-119, 90], [-100, 72], [-70, 52], [-56, 26], [-60, -6], [-82, -31], [-126, -47], [-172, -61], [-212, -75]], 5);
        const top = smoothPts([[-238, -83], [-180, -95], [-120, -101], [0, -102], [126, -101], [182, -97], [224, -89], [214, -96], [132, -115], [0, -117], [-114, -117], [-185, -104]], 4);
        const bodySp = ironSprite(body, {
            res, seed, Ls, amb, shape: 'bevel', R: 16, relief: 1.1, rust: 0.6,
            height: (px, py) => {
                let hh = 1.6 * noise2(px * 0.04, py * 0.04, sd) + 0.35 * noise2(px * 0.13, py * 0.13, sd + 1);
                // the waist sits back from the horns
                hh -= 10 * smooth(-50, 10, py) * smooth(130, 60, Math.abs(px));
                return hh;
            },
            polish: (px, py) => smooth(-80, -100, py) * 0.5 + smooth(-170, -236, px) * 0.5,
            paint: (px, py, d, hh, out) => {
                // a forge mark struck on the waist: a ring and a cross
                const fx = px - 6, fy = py - 34, fr = Math.hypot(fx, fy);
                if (Math.abs(fr - 13) < 1.6 || (fr < 10 && (Math.abs(fx) < 1.2 || Math.abs(fy) < 1.2))) into(out, SCALE, 0.7);
            },
        });
        const topSp = ironSprite(top, {
            res, seed: seed + 't', Ls: Ls.map((L) => L), amb, shape: 'none',
            height: (px, py) => {
                // the face looks up: its height grows towards the eye
                let hh = (py + 117) * 2.4 + 0.3 * noise2(px * 0.2, py * 0.6, sd + 4);
                // the hardy and the pritchel holes
                if (px > 70 && px < 92 && py > -113 && py < -104) hh -= 30;
                if (Math.hypot((px - 106) / 1, (py + 108) / 0.55) < 5.5) hh -= 30;
                return hh;
            },
            polish: (px, py, d) => 0.85 - 0.5 * smooth(1, 5, d) * smooth(-0.2, 0.6, noise2(px * 0.04, 0, sd + 5)),
            paint: (px, py, d, hh, out) => {
                if ((px > 70 && px < 92 && py > -113 && py < -104) || Math.hypot(px - 106, (py + 108) / 0.55) < 5.5) mixA(out, [0.02, 0.02, 0.03], 0.9, out);
                // the edges chipped
                if (d < 2.4 && noise2(px * 0.12, 0, sd + 6) > 0.35) into(out, RUST, 0.6);
            },
        });
        // the stump
        const stump = smoothPts([[-120, 96], [-60, 92], [0, 91], [60, 92], [120, 96], [123, 200], [121, 330], [-122, 330], [-124, 200]], 4);
        const stSp = o.stump === false ? null : lit({
            box: S.bbox(stump, 4), res, seed: seed + 's', lights: Ls, amb, shape: 'round', relief: 0.5,
            mask: (q) => fillPts(q, stump),
            height: (px, py) => {
                // bark in plates with deep fissures
                const b = worley(px / 13 + 0.3 * noise2(px * 0.02, py * 0.02, sd + 8), py / 64, sd + 7);
                let hh = 4 * smooth(0.0, 0.18, b[1] - b[0]) + 1.2 * noise2(px * 0.08, py * 0.02, sd + 8) + 0.4 * noise2(px * 0.5, py * 0.15, sd + 18);
                for (const hy of [150, 292]) hh += 6 * smooth(9, 6.5, Math.abs(py - hy)) - 4 * smooth(9, 6.5, Math.abs(py - hy)) * 0; // the hoops stand proud
                return hh;
            },
            albedo: (px, py, d, hh, out) => {
                const b = worley(px / 13 + 0.3 * noise2(px * 0.02, py * 0.02, sd + 8), py / 64, sd + 7);
                mixA(hex('#4e433c'), hex('#1c1512'), smooth(0.18, 0.0, b[1] - b[0]) * 0.8, out);
                into(out, hex('#7a6a58'), smooth(0.3, 0.9, noise2(px * 0.03, py * 0.03, sd + 9)) * 0.4); // grey lichen-dry bark
                for (const hy of [150, 292]) if (Math.abs(py - hy) < 9) {
                    mixA(IRON, RUST, smooth(-0.3, 0.6, noise2(px * 0.1, py * 0.3, sd + 10)), out);
                    out[4] = 0.8;
                }
                into(out, SOOT, smooth(120, 96, py) * 0.5);
            },
            spec: { k: 0.4, power: 22, broad: 0.1 },
            stroke: { amp: 0.08, freq: 0.06, tone: 6 },
            edge: { rough: 1.5, freq: 0.3, amp: 0.6 },
        });
        g.save();
        g.translate(x, y);
        g.scale(s, s);
        // the shadow on the floor, thrown away from the fire
        const L0 = Ls[0], sx = L0 && L0.P ? -Math.sign(L0.P[0]) : 1;
        g.save();
        g.globalCompositeOperation = 'source-atop';
        const sg = g.createRadialGradient(sx * 160, 330, 10, sx * 160, 330, 260);
        sg.addColorStop(0, 'rgba(6,5,10,0.65)');
        sg.addColorStop(1, 'rgba(6,5,10,0)');
        g.fillStyle = sg;
        g.fillRect(-460, 200, 920, 260);
        g.restore();
        if (o.stump !== false) put(g, stSp, 0, 0);
        // the end grain of the block, seen between the feet and the bark: checks and rings
        shadow(g, bodySp, 0, 6, 1, { dx: 0, dy: 0, blur: 5, alpha: 0.7 });
        put(g, bodySp, 0, 0);
        put(g, topSp, 0, 0);
        // spikes driven in to hold the feet
        if (o.stump !== false) for (const fx of [-126, 126]) nail(g, { x: fx, y: 100, s: 0.7, lights: Ls, amb, seed: seed + fx, bare: true });
        g.restore();
        return { face: [x - 120 * s, y - 108 * s, x + 125 * s, y - 108 * s], hornL: [x - 236 * s, y - 84 * s], hornR: [x + 222 * s, y - 90 * s] };
    }

    // ------------------------------------------------------------------ fire
    // Sparks and flame go down additively ('lighter'): they add light to what is there.
    const softSheet = (g, blur, draw, op = 'lighter') => {
        const m = g.getTransform(), c = canvas(g.canvas.width, g.canvas.height), q = c.getContext('2d');
        q.setTransform(m);
        draw(q);
        g.save();
        g.setTransform(1, 0, 0, 1, 0, 0);
        g.globalCompositeOperation = op;
        if (blur > 0) g.filter = `blur(${(blur * Math.hypot(m.a, m.b)).toFixed(2)}px)`;
        g.drawImage(c, 0, 0);
        g.restore();
    };
    // A flame tongue from (x, y) up to height h, w wide at its foot, leaning `lean`.
    const tongue = (q, x, y, h, w, lean, seed) => {
        const r = Motion.rng('tongue' + seed), L = [], R = [];
        const n = 14, ph = r() * TAU, fr = 1.5 + r() * 1.5;
        for (let i = 0; i <= n; i++) {
            const u = i / n, sway = Math.sin(u * fr * Math.PI + ph) * w * 0.35 * u + lean * u * u * h;
            const half = w * 0.5 * Math.pow(Math.sin(Math.PI * Math.min(1, 0.15 + u * 0.95)), 0.8) * (1 - u * 0.75);
            L.push([x + sway - half, y - u * h]);
            R.push([x + sway + half, y - u * h]);
        }
        q.beginPath();
        S.trace(q, S.curve([...L, ...R.reverse()], true, 4));
    };
    // The fire on the hearth: flame tongues over the coals, centred on (x, y) (the coal
    // bed's top), `w` wide, `h` high.
    function flames(g, o = {}) {
        const { x = 0, y = 0, w = 260, h = 300, seed = 'fl', n = 16 } = o;
        const r = Motion.rng('flames' + seed);
        const list = [];
        for (let i = 0; i < n; i++) {
            const u = (r() + r() + r()) / 3, fx = x + (u - 0.5) * w, k = 1 - Math.abs(u - 0.5) * 1.6;
            list.push({ fx, fh: h * (0.3 + 0.7 * k) * (0.6 + r() * 0.5), fw: w * (0.12 + r() * 0.12), lean: (r() - 0.5) * 0.25 + (u - 0.5) * 0.2, sd: seed + i });
        }
        // a broad glow first, then the tongues: red at their tips, yellow and white at the root
        softSheet(g, h * 0.08, (q) => {
            const gr = q.createRadialGradient(x, y - h * 0.25, 5, x, y - h * 0.25, h * 0.9);
            gr.addColorStop(0, 'rgba(255,170,70,0.55)');
            gr.addColorStop(0.5, 'rgba(230,100,30,0.2)');
            gr.addColorStop(1, 'rgba(160,40,10,0)');
            q.fillStyle = gr;
            q.fillRect(x - h, y - h * 1.3, h * 2, h * 1.5);
        });
        softSheet(g, 5, (q) => {
            for (const f of list) {
                const gr = q.createLinearGradient(0, y, 0, y - f.fh);
                gr.addColorStop(0, 'rgba(255,200,90,0.5)');
                gr.addColorStop(0.35, 'rgba(250,130,40,0.42)');
                gr.addColorStop(0.75, 'rgba(200,60,20,0.22)');
                gr.addColorStop(1, 'rgba(120,20,10,0)');
                q.fillStyle = gr;
                tongue(q, f.fx, y + 6, f.fh, f.fw, f.lean, f.sd);
                q.fill();
            }
        });
        softSheet(g, 1.6, (q) => {
            for (const f of list) {
                const gr = q.createLinearGradient(0, y, 0, y - f.fh * 0.6);
                gr.addColorStop(0, 'rgba(255,250,210,0.75)');
                gr.addColorStop(0.4, 'rgba(255,214,120,0.45)');
                gr.addColorStop(1, 'rgba(255,140,40,0)');
                q.fillStyle = gr;
                tongue(q, f.fx, y + 4, f.fh * 0.6, f.fw * 0.45, f.lean, f.sd + 'c');
                q.fill();
            }
        });
    }
    // Sparks flying up from (x, y): short curved streaks (the open shutter of a painter's
    // eye), each with its glow, fewer and dimmer as they rise and cool.
    function sparks(g, o = {}) {
        const { x = 0, y = 0, n = 60, h = 600, w = 300, seed = 'sp' } = o;
        const r = Motion.rng('sparks' + seed);
        const list = [];
        for (let i = 0; i < n; i++) {
            const u = Math.pow(r(), 0.7), px = x + (r() - 0.5) * w * (0.4 + u), py = y - u * h, len = 6 + r() * 26 * (1 - u * 0.5);
            const a = -Math.PI / 2 + (r() - 0.5) * 1.2 + (px - x) * 0.002, heat = (1 - u) * (0.6 + 0.4 * r());
            list.push({ px, py, len, a, heat, bend: (r() - 0.5) * 0.8 });
        }
        const stroke = (q, s, wd, col) => {
            q.strokeStyle = col;
            q.lineWidth = wd;
            q.lineCap = 'round';
            q.beginPath();
            q.moveTo(s.px, s.py);
            q.quadraticCurveTo(s.px + Math.cos(s.a + s.bend) * s.len * 0.5, s.py + Math.sin(s.a + s.bend) * s.len * 0.5, s.px + Math.cos(s.a) * s.len, s.py + Math.sin(s.a) * s.len);
            q.stroke();
        };
        softSheet(g, 4, (q) => {
            for (const s of list) stroke(q, s, 7, `rgba(255,120,30,${0.25 * s.heat})`);
        });
        softSheet(g, 0.4, (q) => {
            for (const s of list) stroke(q, s, 1.6 + s.heat, `rgba(255,${Math.round(170 + 80 * s.heat)},${Math.round(80 + 120 * s.heat)},${0.5 + 0.5 * s.heat})`);
        });
    }
    // Smoke rising: soft warm-dark wisps, lit from below by the fire (`glow` 0 … 1).
    function smoke(g, o = {}) {
        const { x = 0, y = 0, h = 700, w = 300, seed = 'sm', n = 26, glow = 0.6, alpha = 0.35 } = o;
        const r = Motion.rng('smoke' + seed);
        softSheet(g, 14, (q) => {
            for (let i = 0; i < n; i++) {
                const u = i / n, cx = x + Math.sin(u * 5 + r() * 2) * w * 0.3 * u + (r() - 0.5) * w * 0.3, cy = y - u * h;
                const rad = w * (0.18 + u * 0.4) * (0.7 + r() * 0.6), k = glow * (1 - u);
                const gr = q.createRadialGradient(cx, cy, 0, cx, cy, rad);
                const c0 = `rgba(${Math.round(40 + 140 * k)},${Math.round(30 + 60 * k)},${Math.round(34 + 20 * k)},${alpha * (0.6 + 0.4 * r()) * (1 - u * 0.5)})`;
                gr.addColorStop(0, c0);
                gr.addColorStop(1, 'rgba(30,24,30,0)');
                q.fillStyle = gr;
                q.beginPath();
                q.ellipse(cx, cy, rad, rad * (0.5 + r() * 0.4), (r() - 0.5) * 1.5, 0, TAU);
                q.fill();
            }
        }, 'source-over');
    }

    // A thin wisp of smoke going up from (x, y): a ribbon that narrows and frays, lit from
    // below by the fire it rose from, gone by `h`.
    function wispSmoke(g, o = {}) {
        const { x = 0, y = 0, h = 420, w = 26, lean = 0.2, seed = 'ws' } = o;
        const r = Motion.rng('wispsmoke' + seed), pts = [];
        for (let i = 0; i <= 30; i++) {
            const u = i / 30;
            pts.push([x + Math.sin(u * 5.5 + r() * 0.2) * w * 1.6 * u + lean * h * u * u, y - u * h]);
        }
        softSheet(g, 3, (q) => {
            for (let i = 0; i < pts.length - 1; i++) {
                const u = i / 30, k = Math.sin(Math.PI * Math.min(1, u * 1.4)) * (1 - u);
                q.strokeStyle = `rgba(${Math.round(150 + 80 * (1 - u))},${Math.round(110 + 40 * (1 - u))},${Math.round(90 + 30 * (1 - u))},${0.5 * k})`;
                q.lineWidth = w * (0.35 + u * 1.2);
                q.lineCap = 'round';
                q.beginPath();
                q.moveTo(pts[i][0], pts[i][1]);
                q.lineTo(pts[i + 1][0], pts[i + 1][1]);
                q.stroke();
            }
        }, 'source-over');
    }

    // The hearth: a raised block of stone and brick bedded in clay, a coal bed on top with a
    // fire in it, the tuyere coming in from the left, ash and embers spilt at its foot.
    // (x, y): the middle of the coal bed's top; the block is 430 wide and stands 300 below.
    //   1 coals as lumps, their gaps the brightest (the heat is inside)  2 the coals dark at
    //   the edges of the bed, grey with ash on top  3 clinker, glassy, by the tuyere  4 the
    //   block's stones of the hill and bricks, mortar of clay  5 the ledge's iron edge-plate
    //   6 a crack in the block with the glow showing  7 ash and embers on the floor  8 the
    //   flame: white at the root, red at its tips  9 sparks  10 smoke going up into the hood.
    function hearth(g, o = {}) {
        const { x = 0, y = 0, s = 1, seed = 'hearth', fire = true } = o;
        const res = resOf(g, s), sd = S.seedOf(seed), Ls = lightsOf(o, x, y, s, 0), amb = o.amb;
        // bricks in courses, each its own: jittered, burnt darker or paler, some cracked
        const brick = (px, py) => {
            const wy = py + 3 * noise2(px * 0.01, py * 0.01, sd), row = Math.floor((wy + 24) / 25), off = row % 2 ? 31 : 0;
            const wx = px + off + 4 * noise2(px * 0.02, py * 0.02, sd + 1), col = Math.floor(wx / 62);
            const fy = (wy + 24) / 25 - row, fx = wx / 62 - col;
            const edge = Math.min(fy, 1 - fy) * 25, edgeX = Math.min(fx, 1 - fx) * 62;
            return [Math.min(edge, edgeX), hashI(row, col, 3, sd), hashI(row, col, 4, sd), row, col];
        };
        const block = smoothPts([[-215, -20], [0, -24], [215, -18], [222, 120], [228, 300], [-228, 300], [-222, 120]], 3);
        const coalBed = smoothPts([[-170, -18], [-120, -52], [-50, -70], [30, -72], [100, -58], [168, -24], [150, -8], [-150, -8]], 5);
        const blockSp = o.dish ? null : lit({
            box: S.bbox(block, 4), res, seed, lights: Ls, amb, shape: 'bevel', R: 10, relief: 1,
            mask: (q) => fillPts(q, block),
            height: (px, py) => {
                const [e, h1, h2] = brick(px, py);
                // the mortar back between the bricks, each brick's face a little worn and pitted
                return 2.6 * smooth(1, 3.5, e) + 0.8 * noise2(px * 0.15, py * 0.15, sd + 3) + 0.5 * noise2(px * 0.6, py * 0.6, sd + 13) * smooth(1, 3, e) - (h2 > 0.9 ? 2 * smooth(0.04, 0, Math.abs(noise2(px * 0.05, py * 0.2, sd + 14))) : 0) + (py < -6 ? 3 : 0);
            },
            albedo: (px, py, d, hh, out) => {
                const [e, h1, h2] = brick(px, py);
                // red brick burnt to purple and black near the fire, pale where it was fired soft
                mixA(h1 < 0.5 ? hex('#8a4632') : h1 < 0.8 ? hex('#6e3a2e') : hex('#a8745a'), hex('#3a2220'), 0.25 + 0.35 * noise2(px * 0.04, py * 0.04, sd + 4), out);
                into(out, hex('#5a5048'), smooth(2.2, 0.6, e) * 0.85); // mortar of clay and ash
                into(out, SOOT, 0.2 + smooth(80, -20, py) * 0.55 + smooth(0.2, 0.8, noise2(px * 0.01, py * 0.02, sd + 5)) * 0.3);
                // the iron plate along the ledge
                if (py < 0 && py > -24) {
                    mixA(IRON, RUST, smooth(-0.3, 0.6, noise2(px * 0.05, 0, sd + 6)), out);
                    out[4] = 0.8;
                    out[3] = 0.6;
                } else out[3] = 0.15;
                // a crack in the block with the glow inside
                const cx = 40 + 30 * noise2(py * 0.02, 0, sd + 7);
                if (fire && Math.abs(px - cx) < 2.2 && py > 10 && py < 140) {
                    out[5] = 0.9 * smooth(140, 10, py);
                    out[6] = 0.25 * smooth(140, 10, py);
                }
            },
            spec: { k: 0.3, power: 20 },
            stroke: { amp: 0.07, freq: 0.06, tone: 6 },
            edge: { rough: 1.6, freq: 0.25, amp: 0.6 },
        });
        // the coal bed: lumps, their gaps glowing; hottest by the tuyere and in the middle
        const coalSp = lit({
            box: S.bbox(coalBed, 4), res, seed: seed + 'c', lights: Ls, amb, shape: 'round', relief: 0.35,
            mask: (q) => fillPts(q, coalBed),
            height: (px, py) => {
                const ww = worley(px / 15 + 0.2 * noise2(px * 0.05, py * 0.05, sd + 8), py / 12, sd + 9);
                return 6 * Math.sqrt(Math.max(0, 1 - (ww[0] / 0.75) ** 2)) - 3 * smooth(0.12, 0.0, ww[1] - ww[0]);
            },
            albedo: (px, py, d, hh, out) => {
                const ww = worley(px / 15 + 0.2 * noise2(px * 0.05, py * 0.05, sd + 8), py / 12, sd + 9);
                const gap = smooth(0.16, 0.0, ww[1] - ww[0]), id = ww[2];
                mixA([0.08, 0.07, 0.07], [0.5, 0.48, 0.46], smooth(0.55, 0.95, id) * smooth(-40, -70, py) * 0.7, out); // ash on the top lumps
                out[3] = 0.6;
                out[4] = 0.3;
                if (fire) {
                    const heat = smooth(150, 0, Math.hypot(px + 30, (py + 30) * 2)) * (0.6 + 0.4 * noise2(px * 0.04, py * 0.04, sd + 10));
                    const k = clamp(heat * (0.35 + 0.9 * gap + 0.35 * smooth(0.7, 1, id) * (1 - ww[0])));
                    HOT(k, out);
                    out[5] *= 1.25;
                }
            },
            spec: { k: 0.5, power: 30 },
            edge: { rough: 1.6, freq: 0.4, amp: 0.7 },
        });
        g.save();
        g.translate(x, y);
        g.scale(s, s);
        if (o.dish) {
            // the itinerant smith's forge: an iron fire-pan on three short legs, its lip
            // burnt, the tuyere's pipe coming in at the side
            const dish = smoothPts([[-212, -26], [-196, 4], [-150, 34], [-60, 48], [60, 48], [150, 34], [196, 4], [212, -26], [180, -16], [0, -10], [-180, -16]], 5);
            for (const lx of [-120, 0, 120]) {
                const leg = stripOf([[lx, 30], [lx * 1.2, 70], [lx * 1.3, 96]], (u) => 16 - u * 6);
                put(g, ironSprite(leg, { res, seed: seed + 'leg' + lx, Ls, amb, relief: 0.7, rust: 0.6 }), 0, 0);
            }
            const pipe = stripOf([[-420, 30], [-300, 8], [-205, -6]], 26);
            put(g, ironSprite(pipe, { res, seed: seed + 'pipe', Ls, amb, relief: 0.8, rust: 0.7, paint: (px, py, d, hh, out) => into(out, SOOT, smooth(-300, -210, px) * 0.6) }), 0, 0);
            put(g, ironSprite(dish, { res, seed: seed + 'dish', Ls, amb, relief: 0.5, rust: 0.55, hot: fire ? (px, py) => 0.5 * smooth(-10, -26, py) * smooth(190, 60, Math.abs(px)) : null }), 0, 0);
        } else put(g, blockSp, 0, 0);
        put(g, coalSp, 0, 0);
        // the tuyere's mouth on the left of the bed
        if (fire) {
            flames(g, { x: -10, y: -40, w: 260, h: o.flame ?? 330, seed: seed + 'f' });
            sparks(g, { x: -10, y: -90, w: 260, h: o.sparkH ?? 700, n: o.sparkN ?? 70, seed: seed + 's' });
            // embers and ash spilt at the foot
            softSheet(g, 0.5, (q) => {
                const r = Motion.rng('embers' + seed);
                for (let i = 0; i < 40; i++) {
                    const fall = o.dish ? Math.pow(r(), 1.6) : 0, ex = (r() - 0.5) * (o.dish ? 300 * (1 - fall * 0.6) : 520), ey = o.dish ? 70 + fall * 260 : 290 + r() * 30, rad = (1.5 + r() * 3.5) * (1 - fall * 0.5);
                    q.fillStyle = r() < 0.4 ? `rgba(255,${120 + Math.round(r() * 80)},40,${0.5 + r() * 0.5})` : `rgba(120,110,104,${0.4 + r() * 0.4})`;
                    q.beginPath();
                    q.ellipse(ex, ey, rad * 1.4, rad, 0, 0, TAU);
                    q.fill();
                }
            }, 'source-over');
        }
        g.restore();
        return { bed: [x, y - 40 * s] };
    }

    // The bellows (a smith's double-board fuelle), seen from above and in front: a pear-shaped
    // board of wood, its leather skirt pleated over hoops, nails along the skirt's edge, the
    // iron nozzle pointing +x. (x, y): the middle of the top board; about 560 long at s = 1.
    //   1 the board's grain and its iron strap  2 the leather grain, darker in the folds,
    //   rubbed pale on the ridges  3 a nail every 22 units through a leather strip, domed
    //   heads, one missing  4 a patch stitched on the skirt  5 the nozzle, cone of iron, its
    //   lip burnt  6 the ring for the chain, the lever  7 cracks in the leather at the folds
    //   8 soot on the nozzle end  9 a wedge  10 its shadow.
    function bellows(g, o = {}) {
        const { x = 0, y = 0, s = 1, seed = 'bellows' } = o;
        const res = resOf(g, s), sd = S.seedOf(seed), Ls = lightsOf(o, x, y, s, 0), amb = o.amb;
        // the pear, seen from above at a slant (squashed)
        const pear = [];
        for (let i = 0; i < 64; i++) {
            const a = (i / 64) * TAU, c = Math.cos(a), sn = Math.sin(a);
            const back = 175, rx = c > 0 ? 330 : back, wy = back * (c > 0 ? 1 - 0.78 * Math.pow(c, 1.6) : 1);
            pear.push([c * rx - 30, sn * wy * 0.42]);
        }
        const depthAt = (px) => lerp(130, 40, clamp((px + 205) / 535));
        // the skirt's folds run along the boards: it bulges between two hoops, creased at them
        const topAt = (px) => {
            const c = clamp((px + 30) / (px > -30 ? 330 : 175), -1, 1), wy = 175 * (c > 0 ? 1 - 0.78 * Math.pow(c, 1.6) : 1);
            return Math.sqrt(Math.max(0, 1 - c * c)) * wy * 0.42 + 6;
        };
        const foldAt = (px, py) => {
            const v = (py - topAt(px)) / depthAt(px) + 0.05 * noise2(px * 0.02, py * 0.02, sd + 11), k = v * 3 + 0.1 * Math.sin(px * 0.05);
            return Math.pow(Math.sin(Math.PI * (((k % 1) + 1) % 1)), 0.7) * (0.8 + 0.2 * noise2(px * 0.03, 0, sd + 12));
        };
        // the skirt hangs below the board's near edge
        const lower = pear.filter((p) => p[1] >= 0).sort((a, b) => a[0] - b[0]);
        const skirt = [...lower.map(([px, py]) => [px, py + 6]), ...lower.slice().reverse().map(([px, py]) => [px, py + depthAt(px)])];
        const leather = (px, py, out) => {
            const gr = worley(px / 2.6, py / 2.2, sd + 1);
            mixA(hex('#6a3e22'), hex('#2e1a10'), 0.35 + 0.4 * noise2(px * 0.04, py * 0.04, sd + 2) + 0.2 * gr[0], out);
        };
        const skirtSp = lit({
            box: S.bbox(skirt, 6), res, seed: seed + 'k', lights: Ls, amb, shape: 'round', relief: 0.5,
            mask: (q) => fillPts(q, skirt),
            height: (px, py) => {
                const fold = foldAt(px, py);
                return 9 * fold + 0.5 * noise2(px * 0.5, py * 0.5, sd + 3);
            },
            albedo: (px, py, d, hh, out) => {
                leather(px, py, out);
                const fold = foldAt(px, py);
                into(out, [0.62, 0.42, 0.28], smooth(0.85, 1, fold) * 0.35); // rubbed ridges
                into(out, [0.05, 0.03, 0.03], smooth(0.2, 0.0, fold) * 0.6); // the folds
                // cracks at the folds
                if (fold < 0.12 && noise2(px * 0.3, py * 0.3, sd + 4) > 0.3) into(out, [0.02, 0.01, 0.01], 0.7);
                // a patch stitched on
                if (px > 40 && px < 110 && py > 40 && py < 92) {
                    mixA(out, hex('#8a5a32'), 0.55, out);
                    const ex = Math.min(px - 40, 110 - px, py - 40, 92 - py);
                    if (ex > 2.5 && ex < 4 && Math.floor((px + py) / 6) % 2) into(out, [0.85, 0.75, 0.55], 0.8);
                }
                out[3] = 0.35;
            },
            spec: { k: 0.35, power: 16, broad: 0.08 },
            stroke: { amp: 0.06, freq: 0.08, tone: 6 },
            edge: { rough: 1, freq: 0.4, amp: 0.5 },
        });
        const boardSp = lit({
            box: S.bbox(pear, 6), res, seed: seed + 'b', lights: Ls, amb, shape: 'bevel', R: 12, relief: 0.7,
            mask: (q) => fillPts(q, pear),
            height: (px, py) => 0.6 * noise2(px * 0.02, py * 0.4, sd + 5) + (Math.abs(px - 40) < 12 ? 2 : 0),
            albedo: (px, py, d, hh, out) => {
                const gr = noise2(px * 0.006, py * 0.25 + noise2(px * 0.01, py * 0.01, sd + 7) * 2, sd + 6);
                mixA(WOOD, WOOD_DK, 0.4 + 0.45 * gr, out);
                into(out, SOOT, smooth(150, 300, px) * 0.6);
                // an iron strap across the board
                if (Math.abs(px - 40) < 12) {
                    mixA(IRON, RUST, smooth(-0.3, 0.6, noise2(px * 0.1, py * 0.1, sd + 8)), out);
                    out[4] = 0.8;
                }
                out[3] = Math.abs(px - 40) < 12 ? 0.7 : 0.25;
            },
            spec: { k: 0.5, power: 22, broad: 0.1 },
            stroke: { amp: 0.07, freq: 0.05, tone: 6 },
            edge: { rough: 1, freq: 0.3, amp: 0.5 },
        });
        const nozzle = smoothPts([[290, -18], [420, -9], [452, -7], [455, 8], [420, 10], [290, 24]], 3);
        const nozSp = ironSprite(nozzle, { res, seed: seed + 'n', Ls, amb, relief: 0.7, rust: 0.5, paint: (px, py, d, hh, out) => into(out, SOOT, smooth(380, 450, px) * 0.8) });
        g.save();
        g.translate(x, y);
        g.scale(s, s);
        shadow(g, skirtSp, 8, 14, 1, { dx: 0, dy: 0, blur: 14, alpha: 0.6 });
        put(g, nozSp, 0, 0);
        put(g, skirtSp, 0, 0);
        put(g, boardSp, 0, 0);
        // nails along the skirt's top edge, through a strip of leather
        const r = Motion.rng('bnails' + seed);
        for (const [px, py] of lower) {
            if (Math.round(px) % 22 > 3 && px > lower[0][0] + 8) continue;
            if (r() < 0.06) continue; // one fell out
            nail(g, { x: px, y: py + 13, s: 0.55, lights: Ls, amb, seed: seed + 'nl' + Math.round(px), bare: true });
        }
        g.restore();
    }

    // ------------------------------------------------------------------ wares of the cave
    // A colour map painted with canvas strokes, read back per pixel: (x, y) → out (0 … 1, alpha in out[3]).
    function paintMap(box, res, draw) {
        const c = canvas(box.w * res, box.h * res), q = c.getContext('2d', { willReadFrequently: true });
        q.setTransform(res, 0, 0, res, -box.x * res, -box.y * res);
        draw(q);
        const w = c.width, h = c.height, d = q.getImageData(0, 0, w, h).data;
        return (x, y, out) => {
            const X = Math.max(0, Math.min(w - 1, Math.floor((x - box.x) * res))), Y = Math.max(0, Math.min(h - 1, Math.floor((y - box.y) * res))), i = (Y * w + X) * 4;
            out[0] = d[i] / 255;
            out[1] = d[i + 1] / 255;
            out[2] = d[i + 2] / 255;
            out[3] = d[i + 3] / 255;
            return out;
        };
    }
    const BLUE = '#14287a', GREEN = '#1f6e3e', GLAZE = hex('#ece6d6');
    // A brush line of the potter's: loaded at the start, dry at the end.
    const pstroke = (q, pts, w, col, seed) => S.dab(q, pts, { w, color: col, alpha: 0.85, bristles: 5, seed, dry: 0.3, taper: 0.7 });

    // A Fajalauza plate (Granada's own ware: tin glaze, cobalt blue and copper green) hung on
    // the wall by a wire. (x, y) its middle, r its radius. motif: 'granada' | 'bird' | 'flower'.
    //   1 the pomegranate (Granada's own sign) or a bird in the well, leaves round it  2 the
    //   blue line drawn fast, the green run and blurred in the firing  3 the rim's waves and
    //   dabs  4 the glaze pooled thicker and greener in the well  5 crazing  6 a chip at the
    //   rim showing the red body  7 a hairline crack mended with a staple  8 the wire over the
    //   rim to a nail  9 glints of the fire on the glaze  10 kiln grit, a pinhole or two.
    function plate(g, o = {}) {
        const { x = 0, y = 0, s = 1, r = 110, seed = 'plate', motif = 'granada' } = o;
        const res = resOf(g, s), sd = S.seedOf(seed), Ls = lightsOf(o, x, y, s, 0), rnd = Motion.rng('plate' + seed);
        const rw = r * 0.58, box = { x: -r - 3, y: -r - 3, w: 2 * r + 6, h: 2 * r + 6 };
        const chipA = rnd() * TAU, staple = rnd() < 0.5;
        const deco = paintMap(box, Math.max(1, res), (q) => {
            const R = Motion.rng('deco' + seed);
            q.lineCap = 'round';
            // the rim: a blue wave between two rings, green dabs in its troughs
            for (const rr of [r * 0.95, rw * 1.05, rw * 0.97]) {
                const pts = [];
                for (let i = 0; i <= 80; i++) pts.push([Math.cos((i / 80) * TAU) * rr, Math.sin((i / 80) * TAU) * rr]);
                pstroke(q, pts, 4, BLUE, seed + rr);
            }
            const wave = [];
            for (let i = 0; i <= 160; i++) {
                const a = (i / 160) * TAU, rr = (r * 0.95 + rw * 1.05) / 2 + Math.sin(a * 9) * (r - rw) * 0.22;
                wave.push([Math.cos(a) * rr, Math.sin(a) * rr]);
            }
            pstroke(q, wave, 5, BLUE, seed + 'w');
            for (let i = 0; i < 9; i++) {
                const a = ((i + 0.25) / 9) * TAU + 0.17, rr = (r * 0.95 + rw * 1.05) / 2 + (r - rw) * 0.1;
                q.fillStyle = S.rgba(GREEN, 0.6 + R() * 0.3);
                q.beginPath();
                q.ellipse(Math.cos(a) * rr, Math.sin(a) * rr, 7 + R() * 3, 4 + R() * 2, a + 1.2, 0, TAU);
                q.fill();
            }
            // the well
            const leaf = (lx, ly, a, len) => {
                q.fillStyle = S.rgba(GREEN, 0.75);
                q.beginPath();
                q.ellipse(lx + Math.cos(a) * len * 0.5, ly + Math.sin(a) * len * 0.5, len * 0.5, len * 0.2, a, 0, TAU);
                q.fill();
                pstroke(q, [[lx, ly], [lx + Math.cos(a) * len, ly + Math.sin(a) * len]], 1.6, BLUE, seed + lx);
                q.strokeStyle = BLUE;
                q.lineWidth = 1.3;
                q.beginPath();
                q.ellipse(lx + Math.cos(a) * len * 0.5, ly + Math.sin(a) * len * 0.5, len * 0.5, len * 0.2, a, 0, TAU);
                q.stroke();
            };
            const k = rw / 64;
            if (motif === 'granada') {
                for (const [a, l] of [[2.3, 40], [0.8, 38], [3.6, 30], [-0.4, 30], [1.6, 26]]) leaf(Math.cos(a) * 18 * k, 10 * k + Math.sin(a) * 18 * k, a, l * k);
                q.fillStyle = S.rgba(GREEN, 0.45);
                q.beginPath();
                q.arc(0, 6 * k, 25 * k, 0, TAU);
                q.fill();
                pstroke(q, S.ellipse(0, 6 * k, 25 * k, 24 * k, 40).concat([[25 * k, 6 * k]]), 3, BLUE, seed + 'g');
                // the crown and the split showing the seeds
                pstroke(q, [[-8 * k, -17 * k], [-4 * k, -27 * k], [0, -20 * k], [4 * k, -28 * k], [8 * k, -17 * k]], 2.4, BLUE, seed + 'c');
                q.fillStyle = BLUE;
                for (let i = 0; i < 16; i++) {
                    const a = R() * TAU, rr = Math.sqrt(R()) * 13 * k;
                    q.beginPath();
                    q.arc(Math.cos(a) * rr, 8 * k + Math.sin(a) * rr, 1.6 * k + R(), 0, TAU);
                    q.fill();
                }
            } else if (motif === 'bird') {
                for (const [a, l] of [[2.6, 34], [0.5, 34], [-2.2, 26]]) leaf(Math.cos(a) * 22 * k, Math.sin(a) * 22 * k, a, l * k);
                const body = [[-26, 4], [-10, -10], [12, -12], [24, -20], [30, -14], [22, -4], [10, 12], [-12, 14], [-30, 18]].map(([a, b]) => [a * k, b * k]);
                q.fillStyle = S.rgba(GREEN, 0.5);
                q.beginPath();
                S.trace(q, S.curve(body, true, 6));
                q.fill();
                pstroke(q, S.curve(body, true, 6), 2.6, BLUE, seed + 'b');
                pstroke(q, [[-8 * k, 0], [6 * k, -4 * k], [14 * k, 4 * k]], 2, BLUE, seed + 'wg');
                q.fillStyle = BLUE;
                q.beginPath();
                q.arc(22 * k, -14 * k, 2.2 * k, 0, TAU);
                q.fill();
            } else {
                for (let i = 0; i < 6; i++) leaf(0, 0, (i / 6) * TAU + 0.3, 30 * k);
                q.fillStyle = BLUE;
                q.beginPath();
                q.arc(0, 0, 8 * k, 0, TAU);
                q.fill();
            }
            // the blue run into the glaze here and there
        });
        const tmp = [0, 0, 0, 0];
        const sp = lit({
            box, res, seed, lights: Ls, amb: o.amb, shape: 'none',
            mask: (q) => {
                const pts = [];
                for (let i = 0; i < 120; i++) {
                    const a = (i / 120) * TAU;
                    let rr = r;
                    let da = Math.abs(a - chipA);
                    if (da > Math.PI) da = TAU - da;
                    if (da < 0.09) rr -= 6 * (1 - da / 0.09);
                    pts.push([Math.cos(a) * rr, Math.sin(a) * rr]);
                }
                fillPts(q, pts);
            },
            height: (px, py) => {
                const rr = Math.hypot(px, py);
                let hh = rr < rw ? -7 * (1 - (rr / rw) ** 2) : 9 * smooth(rw, rw * 1.3, rr) - 6 * smooth(r * 0.9, r, rr);
                hh += 2.6 * Math.exp(-(((rr - r * 0.965) / 2.5) ** 2));
                return hh + 0.25 * noise2(px * 0.2, py * 0.2, sd);
            },
            albedo: (px, py, d, hh, out) => {
                const rr = Math.hypot(px, py);
                mixA(GLAZE, hex('#d6dccc'), 0.3 + 0.3 * noise2(px * 0.03, py * 0.03, sd + 1), out);
                // at the rim the glaze runs thin and the red body shows brown through it
                into(out, hex('#8a5a3a'), smooth(r * 0.93, r * 0.99, rr) * 0.75);
                into(out, hex('#c6d2bc'), smooth(rw, rw * 0.3, rr) * 0.25); // the glaze pooled in the well
                deco(px, py, tmp);
                // the colours sink into the glaze: softened, a little blurred at their edge
                into(out, tmp, Math.min(1, tmp[3] * 1.15));
                // crazing: a net of fine dark lines
                const cz = worley(px / 7, py / 7, sd + 2);
                if (cz[1] - cz[0] < 0.045) into(out, [0.35, 0.32, 0.28], 0.35);
                // the chip: the red body showing
                const a = Math.atan2(py, px);
                let da = Math.abs(a - chipA);
                if (da > Math.PI) da = TAU - da;
                if (da < 0.13 && rr > r - 9) into(out, hex('#b0623e'), 0.9);
                // the mended crack and its staple
                if (staple) {
                    const cx = px - (Math.cos(chipA + 2) * r * 0.75), cy = py - (Math.sin(chipA + 2) * r * 0.75);
                    if (Math.abs(cx * Math.sin(chipA + 2) - cy * Math.cos(chipA + 2)) < 0.7 && Math.hypot(cx, cy) < r * 0.3) into(out, [0.2, 0.17, 0.15], 0.7);
                }
                // kiln grit
                if (hashI(Math.floor(px * 1.5), Math.floor(py * 1.5), 3, sd) > 0.9975) into(out, [0.25, 0.2, 0.18], 0.8);
                out[3] = 1;
            },
            spec: { k: 2.2, power: 40, broad: 0.5, broadPow: 6 },
            stroke: { amp: 0.04, freq: 0.05, tone: 2 },
            edge: { rough: 0.8, freq: 0.4, amp: 0.4 },
        });
        g.save();
        g.translate(x, y);
        g.scale(s, s);
        const L0 = Ls[0], th = L0 && L0.P ? [clamp(-L0.P[0] * 0.05, -14, 14), clamp(-L0.P[1] * 0.05, -14, 14)] : [6, 9];
        shadow(g, sp, th[0] * 1.4 + 3, th[1] * 1.4 + 6, 1, { dx: 0, dy: 0, blur: 10, alpha: 0.8 });
        put(g, sp, 0, 0);
        if (o.hung === false) return g.restore();
        // the wire over the rim, up to its nail
        g.strokeStyle = 'rgba(40,36,40,0.9)';
        g.lineWidth = 1.4;
        g.beginPath();
        g.moveTo(-r * 0.3, -r * 0.93);
        g.lineTo(0, -r - 18);
        g.lineTo(r * 0.3, -r * 0.93);
        g.stroke();
        g.strokeStyle = 'rgba(255,200,150,0.5)';
        g.lineWidth = 0.6;
        g.stroke();
        nail(g, { x: 0, y: -r - 20, s: 0.7, lights: Ls, amb: o.amb, seed: seed + 'n', bare: true });
        g.restore();
    }

    // Copper utensils hung on nails by their handles: a ladle (cucharón), a skimmer
    // (espumadera, its bowl pierced), a chocolate pot (chocolatera, a turned wooden handle
    // out to one side, a lid with the hole for the stirrer). (x, y): the nail.
    function utensil(g, o = {}) {
        const { x = 0, y = 0, s = 1, kind = 'ladle', seed = 'ut' + kind, len = 300 } = o;
        const res = resOf(g, s), sd = S.seedOf(seed), Ls = lightsOf(o, x, y, s, 0), amb = o.amb;
        g.save();
        g.translate(x, y);
        g.scale(s, s);
        const copper = (pts, height, extra) => lit({
            box: S.bbox(pts, 4), res, seed: seed + pts.length, lights: Ls, amb, shape: 'none', metal: 1,
            mask: (q) => fillPts(q, pts), height,
            albedo: (px, py, d, hh, out) => {
                mixA(COPPER, COPPER_HI, 0.3 + 0.35 * noise2(px * 0.05, py * 0.05, sd), out);
                into(out, OXIDE, smooth(-0.1, 0.6, noise2(px * 0.02, py * 0.02, sd + 1)) * 0.5);
                if (extra) extra(px, py, d, hh, out);
            },
            spec: { k: 1.2, power: 40, broad: 0.4, broadPow: 5 },
            stroke: { amp: 0.05, freq: 0.06, tone: 3 },
            edge: { rough: 0.8, freq: 0.4, amp: 0.4 },
        });
        if (kind === 'chocolatera') {
            // a tall pot narrowing to the top, the handle out to the left
            const body = smoothPts([[-34, 0], [34, 0], [44, 60], [50, 130], [40, 170], [-40, 170], [-50, 130], [-44, 60]], 6);
            const sp = copper(body, (px, py) => 26 * Math.sqrt(Math.max(0, 1 - (px / 50) ** 2)) + 1.5 * ringWorley(Math.hypot(px, py - 200), Math.atan2(py - 200, px), 9, sd)[0] ** 2 * 1.6 + 3 * Math.exp(-(((py - 4) / 3) ** 2)),
                (px, py, d, hh, out) => into(out, SOOT, smooth(120, 170, py) * 0.8));
            const lid = smoothPts([[-30, 4], [30, 4], [24, -12], [0, -20], [-24, -12]], 4);
            const lsp = copper(lid, (px, py) => 8 * Math.sqrt(Math.max(0, 1 - (px / 30) ** 2)) - 6 * smooth(4, 2, Math.hypot(px, py + 8)), (px, py, d, hh, out) => {
                if (Math.hypot(px, py + 8) < 3.6) mixA(out, [0.02, 0.02, 0.02], 0.95, out);
            });
            const handle = stripOf([[-46, 70], [-90, 60], [-150, 48]], (u) => 16 - u * 4);
            const hsp = lit({ box: S.bbox(handle, 3), res, seed: seed + 'h', lights: Ls, amb, shape: 'round', relief: 0.9, mask: (q) => fillPts(q, handle),
                albedo: (px, py, d, hh, out) => mixA(hex('#5a3418'), hex('#24140a'), 0.4 + 0.3 * noise2(px * 0.4, py * 0.05, sd + 2), out), spec: { k: 0.5, power: 24 } });
            shadow(g, sp, 8, 10, 1, { dx: 0, dy: 0, blur: 9, alpha: 0.65 });
            // the cord over the nail
            if (o.hung !== false) {
                g.strokeStyle = '#3a2a20';
                g.lineWidth = 2;
                g.beginPath();
                g.moveTo(-150, 48);
                g.lineTo(-60, -40);
                g.lineTo(30, -6);
                g.stroke();
            }
            put(g, hsp, 0, 0);
            put(g, sp, 0, 0);
            put(g, lsp, 0, 0);
            if (o.hung !== false) nail(g, { x: -60, y: -42, s: 0.8, lights: Ls, amb, seed: seed + 'n', bare: true });
            g.restore();
            return;
        }
        // ladle or skimmer: a long flat handle from the nail down to a bowl
        const bowlR = kind === 'skimmer' ? 54 : 44, bc = len + bowlR - 6;
        const handle = stripOf([[0, 6], [0, len * 0.5], [0, len]], (u) => 11 - u * 3 + (u < 0.05 ? 6 : 0));
        const hsp = copper(handle, (px, py) => 2 * Math.sqrt(Math.max(0, 1 - (px / 6) ** 2)) - 6 * smooth(5, 3, Math.hypot(px, py - 14)), (px, py, d, hh, out) => {
            if (Math.hypot(px, py - 14) < 4.5) mixA(out, [0.02, 0.02, 0.02], 0.95, out);
        });
        const bowl = S.ellipse(0, bc, bowlR, bowlR * 0.96, 48);
        const holes = [];
        if (kind === 'skimmer') for (let ring = 0; ring <= 3; ring++) for (let i = 0; i < Math.max(1, ring * 7); i++) holes.push([Math.cos((i / Math.max(1, ring * 7)) * TAU + ring) * ring * 12, bc + Math.sin((i / Math.max(1, ring * 7)) * TAU + ring) * ring * 12]);
        const bsp = lit({
            box: S.bbox(bowl, 4), res, seed: seed + 'b', lights: Ls, amb, shape: 'none', metal: 1,
            mask: (q) => {
                q.beginPath();
                S.trace(q, bowl);
                for (const [hx, hy] of holes) {
                    q.moveTo(hx + 2.6, hy);
                    q.arc(hx, hy, 2.6, 0, TAU);
                }
                q.fill('evenodd');
            },
            height: (px, py) => {
                const rr = Math.hypot(px, py - bc) / bowlR;
                return (kind === 'skimmer' ? -6 : -12) * (1 - rr * rr) + 3 * Math.exp(-(((rr - 0.95) / 0.04) ** 2)) + 1.2 * ringWorley(rr * bowlR, Math.atan2(py - bc, px), 8, sd)[0] ** 2 * 1.5;
            },
            albedo: (px, py, d, hh, out) => {
                mixA(COPPER, COPPER_HI, 0.3 + 0.35 * noise2(px * 0.05, py * 0.05, sd), out);
                if (kind === 'ladle') into(out, TIN, smooth(0.9, 0.7, Math.hypot(px, py - bc) / bowlR) * 0.7);
                into(out, OXIDE, smooth(-0.1, 0.6, noise2(px * 0.02, py * 0.02, sd + 1)) * 0.4);
            },
            spec: { k: 1.2, power: 40, broad: 0.4, broadPow: 5 },
            edge: { rough: 0.8, freq: 0.4, amp: 0.4 },
        });
        shadow(g, hsp, 5, 7, 1, { dx: 0, dy: 0, blur: 5, alpha: 0.65 });
        shadow(g, bsp, 6, 9, 1, { dx: 0, dy: 0, blur: 8, alpha: 0.65 });
        put(g, hsp, 0, 0);
        put(g, bsp, 0, 0);
        if (o.hung !== false) nail(g, { x: 0, y: 10, s: 0.75, lights: Ls, amb, seed: seed + 'n', bare: true });
        g.restore();
    }

    // A copper cauldron (caldero) hanging from its iron bail: a hammered belly, a flared rim
    // with a rolled lip, riveted ears, soot on its lower half. (x, y): the middle of the belly;
    // w its width (the bail rises w × 0.7 above the rim).
    //   1 planishing in rows round the belly  2 soot baked on below, scorched blue-purple
    //   above it  3 the rolled lip catching the fire all round  4 two ears, three rivets each
    //   5 the bail of square iron, its ends hooked through the ears  6 a patch riveted on
    //   7 a dent  8 verdigris in the seam  9 drips of something burnt down one side  10 the hook.
    function cauldron(g, o = {}) {
        const { x = 0, y = 0, s = 1, w = 300, seed = 'cauldron' } = o;
        const res = resOf(g, s), sd = S.seedOf(seed), Ls = lightsOf(o, x, y, s, 0), amb = o.amb;
        const hw = w / 2, top = -w * 0.38, bot = w * 0.42;
        const body = smoothPts([[-hw * 0.8, top - 9], [-hw * 0.76, top + 6], [-hw * 0.8, top + w * 0.1], [-hw * 0.95, top + w * 0.3], [-hw * 1.0, top + w * 0.48], [-hw * 0.9, top + w * 0.64], [-hw * 0.6, bot - 6], [0, bot + 4], [hw * 0.6, bot - 6], [hw * 0.9, top + w * 0.64], [hw * 1.0, top + w * 0.48], [hw * 0.95, top + w * 0.3], [hw * 0.8, top + w * 0.1], [hw * 0.76, top + 6], [hw * 0.8, top - 9], [0, top - 12]], 6);
        const patch = [hw * 0.42, top + w * 0.36];
        const patchPts = S.curve([[-30, -20], [8, -26], [32, -14], [28, 18], [-6, 24], [-32, 12]].map(([a, b]) => [patch[0] + a, patch[1] + b]), true, 4);
        const patchRivets = patchPts.filter((p, i) => i % 3 === 0).map(([a, b]) => [patch[0] + (a - patch[0]) * 0.85, patch[1] + (b - patch[1]) * 0.85]);
        const patchAt = (px, py) => {
            let inside = false;
            for (let i = 0, j = patchPts.length - 1; i < patchPts.length; j = i++) {
                const [xi, yi] = patchPts[i], [xj, yj] = patchPts[j];
                if (yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) inside = !inside;
            }
            return inside;
        };
        const sp = lit({
            box: S.bbox(body, 4), res, seed, lights: Ls, amb, shape: 'round', relief: 0.6, metal: 1,
            mask: (q) => fillPts(q, body),
            height: (px, py) => {
                const ww = worley(px / 11, (py - top) / 9, sd + 1);
                let hh = 1.5 * ww[0] * ww[0] * 1.6;
                hh += 3 * Math.exp(-(((py - (top - 4)) / 4) ** 2)); // the lip
                hh -= 4 * smooth(26, 8, Math.hypot(px + hw * 0.5, py - top - w * 0.36)); // a dent
                if (patchAt(px, py)) hh += 1.0;
                for (const [rx, ry] of patchRivets) hh += 1.6 * Math.sqrt(Math.max(0, 1 - (Math.hypot(px - rx, py - ry) / 2.6) ** 2));
                return hh;
            },
            albedo: (px, py, d, hh, out) => {
                const ww = worley(px / 11, (py - top) / 9, sd + 1);
                mixA(COPPER, COPPER_HI, 0.25 + 0.4 * ww[2], out);
                into(out, OXIDE, smooth(-0.2, 0.6, noise2(px * 0.02, py * 0.02, sd + 2)) * 0.5);
                const sootLine = top + w * 0.42 + 26 * noise2(px * 0.01, 0, sd + 3);
                into(out, PURPLE, smooth(sootLine - 60, sootLine, py) * 0.5);
                into(out, SOOT, smooth(sootLine - 5, sootLine + 30, py) * 0.92);
                // drips down one side
                if (px < -hw * 0.4 && Math.abs(Math.sin(px * 0.35)) < 0.15 && py > top + 20 && py < top + 20 + 90 * (0.5 + 0.5 * Math.sin(px))) into(out, SOOT, 0.6);
                if (patchAt(px, py)) mixA(out, OXIDE, 0.3, out);
                into(out, VERD, smooth(top + 18, top + 4, py) * smooth(0.3, 0.8, noise2(px * 0.08, 0, sd + 4)) * 0.6);
                out[3] = 1 - smooth(sootLine, sootLine + 30, py) * 0.85;
            },
            spec: { k: 1.2, power: 40, broad: 0.4, broadPow: 5 },
            stroke: { amp: 0.06, freq: 0.05, tone: 6 },
            edge: { rough: 1, freq: 0.35, amp: 0.5 },
        });
        // the bail: an arc of square iron from ear to ear, hooked at the top
        const bail = [];
        for (let i = 0; i <= 30; i++) {
            const a = Math.PI + (i / 30) * Math.PI;
            bail.push([Math.cos(a) * hw * 0.98, top + 4 + Math.sin(a) * w * 0.7]);
        }
        const bailPts = [...bail.map(([a, b]) => [a * 1.0 - 4.5, b - 4.5]), ...bail.slice().reverse().map(([a, b]) => [a * 0.96 + 4.5, b + 4.5])];
        const bailSp = ironSprite(bailPts, { res, seed: seed + 'b', Ls, amb, relief: 0.5, rust: 0.5 });
        const ear = smoothPts([[-14, -18], [14, -18], [18, 10], [0, 22], [-18, 10]], 4);
        const earSp = lit({
            box: S.bbox(ear, 3), res, seed: seed + 'e', lights: Ls, amb, shape: 'bevel', R: 4, metal: 1,
            mask: (q) => fillPts(q, ear),
            height: (px, py) => {
                let hh = 0;
                for (const [rx, ry] of [[-8, 8], [8, 8], [0, -8]]) hh += 2 * Math.sqrt(Math.max(0, 1 - (Math.hypot(px - rx, py - ry) / 3.6) ** 2));
                return hh - 6 * smooth(5, 3, Math.hypot(px, py + 6));
            },
            albedo: (px, py, d, hh, out) => {
                mixA(COPPER, OXIDE, 0.4, out);
                if (Math.hypot(px, py + 6) < 4) mixA(out, [0.02, 0.02, 0.02], 0.9, out);
            },
            spec: { k: 1, power: 30, broad: 0.3 },
        });
        g.save();
        g.translate(x, y);
        g.scale(s, s);
        put(g, bailSp, 0, 0);
        put(g, sp, 0, 0);
        for (const sx of [-1, 1]) put(g, earSp, sx * hw * 0.93, top + 8);
        g.restore();
        return { hook: [x, y + (top + 4 - w * 0.7) * s] };
    }

    // A copper bed warmer (calentador) hung by its handle: a round pan, its lid domed and
    // pierced in a rosette, a turned handle of wood. (x, y): the middle of the lid; r its radius.
    function warmer(g, o = {}) {
        const { x = 0, y = 0, s = 1, r = 100, seed = 'warmer', hlen = 520 } = o;
        const res = resOf(g, s), sd = S.seedOf(seed), Ls = lightsOf(o, x, y, s, 0), amb = o.amb;
        // the pierced holes: rings of round holes and slits about a star
        const holes = [];
        for (let ring = 1; ring <= 4; ring++) {
            const n = 6 * ring, rr = ring * r * 0.18;
            for (let i = 0; i < n; i++) holes.push([Math.cos((i / n) * TAU + ring * 0.3) * rr, Math.sin((i / n) * TAU + ring * 0.3) * rr, ring % 2 ? 2.2 : 1.6]);
        }
        const holeAt = (px, py) => {
            for (const [hx, hy, hr] of holes) if (Math.abs(px - hx) < hr && Math.abs(py - hy) < hr && Math.hypot(px - hx, py - hy) < hr) return true;
            return false;
        };
        const lid = lit({
            box: { x: -r - 4, y: -r - 4, w: 2 * r + 8, h: 2 * r + 8 }, res, seed, lights: Ls, amb, shape: 'none', metal: 1,
            mask: (q) => {
                q.beginPath();
                q.arc(0, 0, r, 0, TAU);
                for (const [hx, hy, hr] of holes) {
                    q.moveTo(hx + hr, hy);
                    q.arc(hx, hy, hr, 0, TAU);
                }
                q.fill('evenodd');
            },
            height: (px, py) => {
                const rr = Math.hypot(px, py), a = Math.atan2(py, px);
                let hh = 10 * Math.sqrt(Math.max(0, 1 - (rr / (r * 0.84)) ** 2));
                hh += 2.6 * Math.exp(-(((rr - r * 0.9) / 3) ** 2)) + 1.5 * Math.exp(-(((rr - r * 0.84) / 2) ** 2));
                // repoussé: a ring of petals between the holes
                hh += 1.4 * Math.max(0, Math.cos(a * 12)) * smooth(r * 0.6, r * 0.75, rr) * smooth(r * 0.84, r * 0.76, rr);
                return hh;
            },
            albedo: (px, py, d, hh, out) => {
                mixA(COPPER, COPPER_HI, 0.3 + 0.3 * noise2(px * 0.05, py * 0.05, sd), out);
                into(out, OXIDE, smooth(-0.1, 0.6, noise2(px * 0.02, py * 0.02, sd + 1)) * 0.5);
                into(out, SOOT, smooth(r * 0.2, 0, Math.hypot(px, py)) * 0.5);
            },
            spec: { k: 1.3, power: 44, broad: 0.4, broadPow: 5 },
            stroke: { amp: 0.05, freq: 0.05, tone: 6 },
            edge: { rough: 0.8, freq: 0.4, amp: 0.4 },
        });
        const handle = [];
        for (let i = 0; i <= 40; i++) {
            const u = i / 40, yy = -r - u * hlen;
            // turned: beads and coves, a socket of copper at the foot
            // a copper socket, then the wood: a long tapering shaft with beads and coves, a knob
            const bead = (c, w2) => Math.exp(-(((u - c) / w2) ** 2));
            const wd = u < 0.1 ? 15 - u * 30 : 13.5 - u * 3 + 4 * bead(0.14, 0.012) - 2.5 * bead(0.17, 0.012) + 3.5 * bead(0.2, 0.01) + 3 * bead(0.62, 0.012) + 3 * bead(0.66, 0.012) + 6 * bead(0.95, 0.03) - 3 * bead(0.9, 0.012);
            handle.push([wd, yy]);
        }
        const hpts = [...handle, ...handle.slice().reverse().map(([a, b]) => [-a, b])];
        const hsp = lit({
            box: S.bbox(hpts, 3), res, seed: seed + 'h', lights: Ls, amb, shape: 'round', relief: 0.9,
            mask: (q) => fillPts(q, hpts),
            albedo: (px, py, d, hh, out) => {
                const u = (-py - r) / hlen;
                if (u < 0.12) {
                    mixA(COPPER, OXIDE, 0.4, out);
                    out[4] = 1;
                } else {
                    mixA(hex('#6a3a1e'), hex('#2e180c'), 0.4 + 0.4 * noise2(px * 0.6, py * 0.03, sd + 3), out);
                    into(out, [0.62, 0.4, 0.22], smooth(0.7, 0.95, Math.abs(Math.sin(u * 230))) * smooth(0.12, 0.13, u) * 0.12);
                    out[4] = 0;
                }
                out[3] = 0.5;
            },
            spec: { k: 0.7, power: 26, broad: 0.2 },
            edge: { rough: 0.7, freq: 0.5, amp: 0.4 },
        });
        g.save();
        g.translate(x, y);
        g.scale(s, s);
        shadow(g, hsp, 8, 10, 1, { dx: 0, dy: 0, blur: 6, alpha: 0.6 });
        shadow(g, lid, 10, 12, 1, { dx: 0, dy: 0, blur: 10, alpha: 0.6 });
        put(g, hsp, 0, 0);
        put(g, lid, 0, 0);
        // a leather loop through the handle's end, over a nail
        g.strokeStyle = '#2a1810';
        g.lineWidth = 3;
        g.beginPath();
        g.ellipse(0, -r - hlen - 10, 7, 14, 0, 0, TAU);
        g.stroke();
        if (o.hung !== false) nail(g, { x: 0, y: -r - hlen - 22, s: 0.8, lights: Ls, amb, seed: seed + 'n', bare: true });
        g.restore();
    }

    // Rings and a necklace of tin (white metal: «collares y anillos blancos»), hung on a nail
    // at (x, y): n rings on a string, and a necklace of links in a sag below them.
    function tin(g, o = {}) {
        const { x = 0, y = 0, s = 1, seed = 'tin', n = 5 } = o;
        const res = resOf(g, s * 1.5), sd = S.seedOf(seed), Ls = lightsOf(o, x, y, s, 0), amb = o.amb, r = Motion.rng('tin' + seed);
        const TINW = hex('#dcd8d0');
        const ringMemo = new Map();
        const ringSp = (rad, th, sq, k) => {
            const key = [rad, th, sq, k].join('/');
            if (!ringMemo.has(key)) ringMemo.set(key, ringLit(rad, th, sq, k));
            return ringMemo.get(key);
        };
        const ringLit = (rad, th, sq, k) => lit({
            box: { x: -rad - th - 2, y: -rad * sq - th - 2, w: 2 * (rad + th + 2), h: 2 * (rad * sq + th + 2) }, res, seed: seed + k, lights: Ls.map((L) => L), amb, shape: 'round', relief: 1.2, metal: 1,
            mask: (q) => {
                q.beginPath();
                q.ellipse(0, 0, rad + th, (rad + th) * sq, 0, 0, TAU);
                q.ellipse(0, 0, Math.max(0.5, rad - th), Math.max(0.5, (rad - th) * sq), 0, 0, TAU);
                q.fill('evenodd');
            },
            albedo: (px, py, d, hh, out) => {
                mixA(TINW, [0.5, 0.5, 0.52], smooth(-0.2, 0.8, noise2(px * 0.2, py * 0.2, sd + k)) * 0.5, out);
                // a twisted ring: its strands catch the light in turns
                if (k % 2) into(out, [0.35, 0.34, 0.36], smooth(0.6, 1, Math.sin(Math.atan2(py, px) * 18)) * 0.6);
            },
            spec: { k: 1.6, power: 50, broad: 0.5, broadPow: 6 },
        });
        g.save();
        g.translate(x, y);
        g.scale(s, s);
        // the string
        g.strokeStyle = '#6a5a48';
        g.lineWidth = 1.4;
        g.beginPath();
        g.moveTo(0, 0);
        g.lineTo(0, 30 + n * 8);
        g.stroke();
        for (let i = 0; i < n; i++) {
            const rad = 18 + r() * 12, sq = 0.35 + r() * 0.65, sp = ringSp(rad, 2.2 + r() * 1.8, sq, i);
            const yy = 26 + i * 9 + rad * sq;
            shadow(g, sp, (r() - 0.5) * 8 + 3, yy + 5, 1, { dx: 0, dy: 0, blur: 3, alpha: 0.5 });
            put(g, sp, (r() - 0.5) * 8, yy, 1, (r() - 0.5) * 0.6);
        }
        // the necklace: links of tin in a catenary from the nail, round and back
        const span = 110, sag = 120, links = 26;
        for (let i = 0; i < links; i++) {
            const u = i / (links - 1), px = -span * 0.5 + u * span + 50, py = 6 + sag * (1 - (2 * u - 1) ** 2) * 0.9 + 20 * u;
            const sp = ringSp(5.5, 1.5, i % 2 ? 0.35 : 1, 10 + (i % 3));
            put(g, sp, px, py, 1, (i % 2) * 0.4 + (u - 0.5));
        }
        if (o.hung !== false) nail(g, { x: 0, y: 0, s: 0.8, lights: Ls, amb, seed: seed + 'n', bare: true });
        g.restore();
    }

    // A strip along a path (a strap, a stem, a limb): its polygon, w(u) wide.
    function stripOf(path, w) {
        const L = [], R = [], n = path.length;
        for (let i = 0; i < n; i++) {
            const p0 = path[Math.max(0, i - 1)], p1 = path[Math.min(n - 1, i + 1)];
            const tx = p1[0] - p0[0], ty = p1[1] - p0[1], tl = Math.hypot(tx, ty) || 1, u = i / (n - 1), hw = (typeof w === 'function' ? w(u) : w) / 2;
            L.push([path[i][0] - (ty / tl) * hw, path[i][1] + (tx / tl) * hw]);
            R.push([path[i][0] + (ty / tl) * hw, path[i][1] - (tx / tl) * hw]);
        }
        return [...L, ...R.reverse()];
    }
    const BRASS = hex('#c99a3e'), LEATHER = hex('#5a3018'), LEATHER_DK = hex('#24120a');
    // a brass stud or medallion: a domed disc, `kind` 'stud' | 'crescent' | 'sun'
    function brass(g, o) {
        const { x = 0, y = 0, r = 6, kind = 'stud', Ls, amb, seed = 'brass' } = o;
        const res = resOf(g, 2), sd = S.seedOf(seed);
        const sp = lit({
            box: { x: -r - 2, y: -r - 2, w: 2 * r + 4, h: 2 * r + 4 }, res, seed, lights: Ls.map((L) => (L.P ? { ...L, P: [L.P[0] - x, L.P[1] - y, L.P[2]] } : L)), amb, shape: kind === 'stud' ? 'round' : 'bevel', R: r * 0.2, relief: kind === 'stud' ? 0.6 : 1, metal: 1,
            mask: (q) => {
                q.beginPath();
                q.arc(0, 0, r, 0, TAU);
                q.fill();
            },
            height: (px, py) => {
                const rr = Math.hypot(px, py);
                if (kind === 'crescent') return 2.5 * (Math.hypot(px + r * 0.12, py) < r * 0.6 && Math.hypot(px - r * 0.12, py) > r * 0.48 ? 1 : 0) - 1.2 * smooth(r * 0.75, r * 0.7, rr);
                if (kind === 'sun') return 2 * Math.max(0, Math.cos(Math.atan2(py, px) * 8)) * smooth(r * 0.75, r * 0.3, rr) + 2 * smooth(r * 0.3, r * 0.2, rr) - 1 * smooth(r * 0.8, r * 0.75, rr);
                return 0.2 * noise2(px, py, sd);
            },
            albedo: (px, py, d, hh, out) => {
                mixA(BRASS, hex('#5a4a2a'), smooth(0.2, 0.8, noise2(px * 0.3, py * 0.3, sd + 1)) * 0.5, out);
                if (kind !== 'stud' && hh < 0.3) into(out, hex('#3a2c18'), 0.5); // dirt in the hollows
            },
            spec: { k: 1.5, power: 40, broad: 0.4, broadPow: 5 },
        });
        shadow(g, sp, x + 1.5, y + 2, 1, { dx: 0, dy: 0, blur: 2, alpha: 0.6 });
        put(g, sp, x, y);
    }
    // a leather strap along `path`, w wide: stitched along both edges, studs every `stud` units
    function strap(g, path, w, o) {
        const { Ls, amb, seed = 'strap', studs = 0 } = o;
        const res = resOf(g, 1), sd = S.seedOf(seed), pts = stripOf(path, w);
        // a coordinate along and across the strap for the stitching
        const acc = [0];
        for (let i = 1; i < path.length; i++) acc.push(acc[i - 1] + Math.hypot(path[i][0] - path[i - 1][0], path[i][1] - path[i - 1][1]));
        const sp = lit({
            box: S.bbox(pts, 3), res, seed, lights: Ls, amb, shape: 'bevel', R: Math.min(3, w * 0.3), relief: 0.8,
            mask: (q) => fillPts(q, pts),
            height: (px, py, d) => (Math.abs(d - w * 0.18) < 0.6 ? -0.6 : 0) + 0.3 * noise2(px * 0.4, py * 0.4, sd),
            albedo: (px, py, d, hh, out) => {
                mixA(LEATHER, LEATHER_DK, 0.3 + 0.4 * noise2(px * 0.06, py * 0.06, sd + 1), out);
                // the stitching: short pale dashes along each edge
                if (Math.abs(d - w * 0.18) < 0.7 && (Math.floor((px + py) * 0.45) % 2 === 0)) into(out, [0.78, 0.68, 0.5], 0.7);
                out[3] = 0.6;
            },
            spec: { k: 0.6, power: 24, broad: 0.1 },
            edge: { rough: 0.6, freq: 0.5, amp: 0.3 },
        });
        shadow(g, sp, 3, 4, 1, { dx: 0, dy: 0, blur: 4, alpha: 0.55 });
        put(g, sp, 0, 0);
        if (studs) {
            let next = studs * 0.5;
            for (let i = 1; i < path.length; i++) {
                while (acc[i] > next) {
                    const k = (next - acc[i - 1]) / (acc[i] - acc[i - 1] || 1);
                    brass(g, { x: path[i - 1][0] + (path[i][0] - path[i - 1][0]) * k, y: path[i - 1][1] + (path[i][1] - path[i - 1][1]) * k, r: w * 0.28, Ls, amb, seed: seed + next });
                    next += studs;
                }
            }
        }
    }

    // An Andalusian bridle (cabezada vaquera) hung on a peg by its crownpiece: two cheek
    // straps, the browband with its mosquero (a fringe of thongs and tassels against the
    // flies), the noseband, the bit with its rings, the reins in a loop; brass studs, and on
    // the brow a brass with a crescent (horse brasses). (x, y): the peg.
    function bridle(g, o = {}) {
        const { x = 0, y = 0, s = 1, seed = 'bridle' } = o;
        const Ls = lightsOf(o, x, y, s, 0), amb = o.amb, sd = S.seedOf(seed), r = Motion.rng('bridle' + seed);
        g.save();
        g.translate(x, y);
        g.scale(s, s);
        const wob = (pts, k) => pts.map(([a, b], i) => [a + k * noise2(i * 0.3, 0, sd + k), b]);
        // the reins: a long loop hanging below
        strap(g, S.curve(wob([[-46, 230], [-60, 380], [-20, 470], [40, 470], [70, 380], [52, 230]], 4), false, 10), 12, { Ls, amb, seed: seed + 'r' });
        // cheek straps from the crown over the peg down to the bit
        strap(g, S.curve([[-6, 4], [-40, 40], [-58, 130], [-52, 220]], false, 10), 15, { Ls, amb, seed: seed + 'c1', studs: 36 });
        strap(g, S.curve([[6, 4], [40, 40], [60, 130], [56, 220]], false, 10), 15, { Ls, amb, seed: seed + 'c2', studs: 36 });
        // the noseband
        strap(g, S.curve([[-56, 168], [0, 186], [58, 168]], false, 10), 13, { Ls, amb, seed: seed + 'n', studs: 22 });
        // the browband and its fringe
        const brow = S.curve([[-48, 66], [0, 80], [50, 66]], false, 12);
        softSheet(g, 0, (q) => {
            for (let i = 0; i < 26; i++) {
                const u = i / 25, [bx, by] = brow[Math.round(u * (brow.length - 1))], len = 50 + 22 * Math.sin(u * Math.PI) + r() * 8;
                const sway = (r() - 0.5) * 6;
                q.strokeStyle = i % 2 ? '#3a1e10' : '#5e3218';
                q.lineWidth = 2.6;
                q.lineCap = 'round';
                q.beginPath();
                q.moveTo(bx, by);
                q.quadraticCurveTo(bx + sway, by + len * 0.5, bx + sway * 1.6, by + len);
                q.stroke();
                q.strokeStyle = 'rgba(230,150,90,0.35)';
                q.lineWidth = 0.8;
                q.stroke();
                if (i % 5 === 2) {
                    // a tassel of red wool
                    q.fillStyle = '#7a1a18';
                    q.beginPath();
                    q.ellipse(bx + sway * 1.6, by + len + 6, 4, 8, 0, 0, TAU);
                    q.fill();
                }
            }
        }, 'source-over');
        strap(g, brow, 14, { Ls, amb, seed: seed + 'b', studs: 16 });
        brass(g, { x: 0, y: 92, r: 15, kind: 'crescent', Ls, amb, seed: seed + 'm' });
        brass(g, { x: -40, y: 156, r: 10, kind: 'sun', Ls, amb, seed: seed + 's1' });
        brass(g, { x: 40, y: 156, r: 10, kind: 'sun', Ls, amb, seed: seed + 's2' });
        // the bit: a jointed snaffle between two rings
        const ring = (cx, cy, rad) => {
            const ptsO = S.ellipse(cx, cy, rad + 2.5, rad + 2.5, 32), ptsI = S.ellipse(cx, cy, rad - 2.5, rad - 2.5, 32);
            const sp = lit({
                box: S.bbox(ptsO, 2), res: resOf(g, 1), seed: seed + 'rg' + cx, lights: Ls, amb, shape: 'round', relief: 1, metal: 0.9,
                mask: (q) => {
                    q.beginPath();
                    S.trace(q, ptsO);
                    S.trace(q, ptsI);
                    q.fill('evenodd');
                },
                albedo: (px, py, d, hh, out) => mixA(IRON, RUST, smooth(-0.2, 0.7, noise2(px * 0.2, py * 0.2, sd + 3)), out),
                spec: { k: 1, power: 30, broad: 0.3 },
            });
            put(g, sp, 0, 0);
        };
        const bar = stripOf([[-52, 226], [-20, 232], [0, 228], [20, 232], [52, 226]], 5);
        put(g, ironSprite(bar, { res: resOf(g, 1), seed: seed + 'bar', Ls, amb, relief: 0.8, rust: 0.4 }), 0, 0);
        ring(-56, 226, 13);
        ring(56, 226, 13);
        // the peg it hangs on
        const peg = smoothPts([[-10, -14], [12, -12], [14, 8], [-12, 10]], 3);
        const pegSp = lit({ box: S.bbox(peg, 3), res: resOf(g, 1), seed: seed + 'p', lights: Ls, amb, shape: 'round', relief: 1, mask: (q) => fillPts(q, peg), albedo: (px, py, d, hh, out) => mixA(WOOD, WOOD_DK, 0.5, out), spec: { k: 0.3, power: 20 } });
        if (o.hung !== false) put(g, pegSp, 0, -6);
        g.restore();
    }

    // A cricket's cage (grillera): a wooden floor, wire bars, a pitched roof of painted tin,
    // a ring to hang it by, a door with its latch; inside, the cricket and a leaf of lettuce.
    // (x, y): the ring at its top; 120 tall at s = 1.
    function cage(g, o = {}) {
        const { x = 0, y = 0, s = 1, seed = 'cage' } = o;
        const Ls = lightsOf(o, x, y, s, 0), amb = o.amb, res = resOf(g, s);
        g.save();
        g.translate(x, y);
        g.scale(s, s);
        // the string up to its nail (a short loop of it when the cage floats loose)
        g.strokeStyle = '#7a6a54';
        g.lineWidth = 1.2;
        g.beginPath();
        g.moveTo(0, 6);
        if (o.hung === false) g.bezierCurveTo(-10, -14, 14, -26, 6, -30);
        else g.lineTo(0, -60);
        g.stroke();
        const roof = [[-46, 32], [0, 8], [46, 32], [42, 38], [-42, 38]];
        const floor = [[-44, 104], [44, 104], [46, 120], [-46, 120]];
        const L0 = Ls[0], lx = L0 && L0.P ? Math.sign(L0.P[0]) : -1;
        // inside: the lettuce and the cricket
        const leaf = lit({ box: { x: -30, y: 80, w: 40, h: 26 }, res, seed: seed + 'l', lights: Ls, amb, shape: 'round', relief: 0.3,
            mask: (q) => fillPts(q, S.curve([[-28, 102], [-20, 86], [-6, 82], [8, 90], [6, 102]], true, 5)),
            height: (px, py) => 1.5 * Math.sin(px * 0.6) * Math.sin(py * 0.5),
            albedo: (px, py, d, hh, out) => mixA(hex('#8ab84a'), hex('#d8e8a0'), smooth(-0.5, 0.8, Math.sin(px * 0.9)), out) });
        put(g, leaf, 0, 0);
        const body = lit({ box: { x: 0, y: 84, w: 34, h: 20 }, res: res * 1.5, seed: seed + 'k', lights: Ls, amb, shape: 'round', relief: 0.8,
            mask: (q) => {
                q.beginPath();
                q.ellipse(16, 95, 13, 6, 0, 0, TAU);
                q.ellipse(28, 94, 5, 5, 0, 0, TAU);
                q.fill();
            },
            albedo: (px, py, d, hh, out) => mixA([0.06, 0.05, 0.05], [0.25, 0.16, 0.08], smooth(10, 4, px) * 0.6, out),
            spec: { k: 1.4, power: 40 } });
        g.strokeStyle = '#120c0a';
        g.lineWidth = 1.1;
        g.lineCap = 'round';
        g.beginPath();
        // the great hind legs, the others, two long antennae
        g.moveTo(10, 96); g.lineTo(2, 88); g.lineTo(-2, 101);
        g.moveTo(16, 98); g.lineTo(13, 104);
        g.moveTo(22, 98); g.lineTo(25, 104);
        g.moveTo(31, 92); g.quadraticCurveTo(44, 70, 40, 52);
        g.moveTo(31, 93); g.quadraticCurveTo(50, 84, 52, 62);
        g.stroke();
        put(g, body, 0, 0);
        // the floor and the roof
        const flSp = lit({ box: S.bbox(floor, 3), res, seed: seed + 'f', lights: Ls, amb, shape: 'bevel', R: 3, mask: (q) => fillPts(q, floor),
            albedo: (px, py, d, hh, out) => mixA(hex('#8a5a32'), hex('#4a2c18'), 0.4 + 0.4 * noise2(px * 0.3, py * 0.05, 3), out), spec: { k: 0.2, power: 10 } });
        put(g, flSp, 0, 0);
        // bars: each a wire with a light on the side the light comes from
        for (let i = 0; i <= 12; i++) {
            const bx = -42 + i * 7;
            g.strokeStyle = '#2a2624';
            g.lineWidth = 1.6;
            g.beginPath();
            g.moveTo(bx, 36);
            g.lineTo(bx, 104);
            g.stroke();
            g.strokeStyle = 'rgba(255,214,170,0.55)';
            g.lineWidth = 0.6;
            g.beginPath();
            g.moveTo(bx + lx * 0.5, 36);
            g.lineTo(bx + lx * 0.5, 104);
            g.stroke();
        }
        // the door, open a little, and its latch
        g.strokeStyle = '#3a3230';
        g.lineWidth = 1.4;
        g.strokeRect(-14, 66, 22, 30);
        const rfSp = lit({ box: S.bbox(roof, 3), res, seed: seed + 'r', lights: Ls, amb, shape: 'bevel', R: 2.5, metal: 0.6, mask: (q) => fillPts(q, roof),
            height: (px, py) => 0.6 * Math.sin(px * 0.8),
            albedo: (px, py, d, hh, out) => {
                mixA(hex('#a0302a'), hex('#4a7a3a'), Math.abs(px) < 8 ? 1 : 0, out);
                into(out, [0.6, 0.6, 0.6], smooth(0.3, 0.8, noise2(px * 0.2, py * 0.2, 5)) * 0.5); // the paint worn to the tin
            }, spec: { k: 1, power: 30, broad: 0.2 } });
        put(g, rfSp, 0, 0);
        g.strokeStyle = '#5a5250';
        g.lineWidth = 2;
        g.beginPath();
        g.arc(0, 2, 6, 0, TAU);
        g.stroke();
        g.restore();
    }

    // ------------------------------------------------------------------ outside, under the moon
    // A prickly pear (chumbera) growing up from (x, y): pads on pads, each with its areoles
    // (a tuft of glochids and two or three spines), red tunas on the top edges, an old pad
    // corky and grey at the foot. h its height.
    function chumbera(g, o = {}) {
        const { x = 0, y = 0, s = 1, seed = 'chumbera', h = 420 } = o;
        const Ls = lightsOf(o, x, y, s, 0), amb = o.amb, res = resOf(g, s), r = Motion.rng('chumbera' + seed), sd = S.seedOf(seed);
        const pads = [];
        const grow = (px, py, a, size, depth) => {
            if (depth > 3 || size < 40) return;
            const cx = px + Math.cos(a) * size * 0.5, cy = py + Math.sin(a) * size * 0.5;
            pads.push({ cx, cy, a, size, depth, k: pads.length });
            const n = depth === 0 ? 3 : 1 + Math.floor(r() * 2.2);
            for (let i = 0; i < n; i++) {
                const t = (i / Math.max(1, n - 1) - 0.5) * 1.4 + (r() - 0.5) * 0.5;
                const ex = cx + Math.cos(a + t) * size * 0.46, ey = cy + Math.sin(a + t) * size * 0.46;
                grow(ex, ey, a + t * 0.8 + (r() - 0.5) * 0.4, size * (0.78 + r() * 0.2), depth + 1);
            }
        };
        grow(0, 0, -Math.PI / 2, h * 0.36, 0);
        g.save();
        g.translate(x, y);
        g.scale(s, s);
        pads.sort((a, b) => a.depth - b.depth);
        for (const p of pads) {
            const L = p.size * 0.5, Wd = p.size * 0.33;
            const pts = S.ellipse(0, 0, L, Wd, 40).map(([a, b]) => [a * (1 - 0.1 * (a / L) ** 2), b * (1 + 0.15 * (a / L))]);
            const sp = lit({
                box: S.bbox(pts, 4), res, seed: seed + p.k, lights: Ls.map((Lt) => (Lt.P ? { ...Lt, P: rotP(Lt.P, p.cx, p.cy, -p.a) } : { ...Lt, dir: rotD(Lt.dir, -p.a) })), amb, shape: 'round', relief: 0.32,
                mask: (q) => fillPts(q, pts),
                height: (px, py) => {
                    // areoles in a diamond lattice: each a small boss
                    const u = px / 16, v = py / 16 + (Math.floor(px / 16) % 2) * 0.5;
                    const du = u - Math.round(u), dv = v - Math.round(v);
                    return 1.2 * smooth(0.22, 0.08, Math.hypot(du, dv)) + 0.6 * noise2(px * 0.05, py * 0.05, sd + p.k);
                },
                albedo: (px, py, d, hh, out) => {
                    mixA(hex('#5e7a5a'), hex('#9aae86'), 0.3 + 0.3 * noise2(px * 0.03, py * 0.03, sd + p.k), out);
                    if (p.depth === 0) into(out, hex('#8a8070'), 0.7); // the old pad, corky
                    const u = px / 16, v = py / 16 + (Math.floor(px / 16) % 2) * 0.5;
                    if (Math.hypot(u - Math.round(u), v - Math.round(v)) < 0.1) mixA(out, hex('#d8c890'), 0.7, out); // glochids
                    out[3] = 0.4;
                },
                spec: { k: 0.4, power: 18, broad: 0.1 },
                stroke: { amp: 0.05, freq: 0.05, tone: 5 },
                edge: { rough: 1, freq: 0.3, amp: 0.4 },
            });
            g.save();
            g.translate(p.cx, p.cy);
            g.rotate(p.a);
            shadow(g, sp, 4, 6, 1, { dx: 0, dy: 0, blur: 8, alpha: 0.5 });
            put(g, sp, 0, 0);
            // spines from the areoles at the edge
            g.strokeStyle = 'rgba(230,224,200,0.75)';
            g.lineWidth = 0.6;
            g.beginPath();
            for (let i = 0; i < 22; i++) {
                const a = (i / 22) * TAU, ex = Math.cos(a) * L * 0.93, ey = Math.sin(a) * Wd * 0.93;
                for (let k = 0; k < 2; k++) {
                    const b = a + (k - 0.5) * 0.6;
                    g.moveTo(ex, ey);
                    g.lineTo(ex + Math.cos(b) * 9, ey + Math.sin(b) * 9);
                }
            }
            g.stroke();
            // tunas on the top edge of the outer pads
            if (p.depth >= 2) {
                for (let i = 0; i < 3; i++) {
                    const a = -0.5 + i * 0.5, tx = Math.cos(a) * L * 0.92, ty = Math.sin(a) * Wd * 0.92;
                    const tsp = lit({ box: { x: -9, y: -12, w: 18, h: 24 }, res, seed: seed + 'tu' + p.k + i, lights: Ls.map((Lt) => (Lt.P ? { ...Lt, P: rotP(Lt.P, p.cx + tx, p.cy + ty, -p.a) } : { ...Lt, dir: rotD(Lt.dir, -p.a) })), amb, shape: 'round',
                        mask: (q) => {
                            q.beginPath();
                            q.ellipse(0, 0, 8, 11, 0, 0, TAU);
                            q.fill();
                        },
                        albedo: (px, py, d, hh, out) => mixA(hex('#b0243a'), hex('#e0802a'), smooth(4, -8, py) * 0.6, out),
                        spec: { k: 0.6, power: 20 } });
                    g.save();
                    g.translate(tx * 1.05, ty * 1.05);
                    g.rotate(a);
                    put(g, tsp, 6, 0);
                    g.restore();
                }
            }
            g.restore();
        }
        g.restore();
    }
    const rotP = (P, cx, cy, a) => {
        const dx = P[0] - cx, dy = P[1] - cy, c = Math.cos(a), sn = Math.sin(a);
        return [dx * c - dy * sn, dx * sn + dy * c, P[2]];
    };
    const rotD = (d, a) => {
        const c = Math.cos(a), sn = Math.sin(a);
        return [d[0] * c - d[1] * sn, d[0] * sn + d[1] * c, d[2]];
    };

    // An agave (pita) at (x, y): a rosette of thick grey-blue leaves with hooked teeth on
    // their margins and a black spine at the tip, one dried leaf, and (if `stalk`) the tall
    // flower stalk with its candelabra of branches.
    function agave(g, o = {}) {
        const { x = 0, y = 0, s = 1, seed = 'agave', n = 13, len = 260, stalk = 0 } = o;
        const Ls = lightsOf(o, x, y, s, 0), amb = o.amb, res = resOf(g, s), r = Motion.rng('agave' + seed), sd = S.seedOf(seed);
        g.save();
        g.translate(x, y);
        g.scale(s, s);
        if (stalk) {
            const path = S.curve([[0, -20], [6, -stalk * 0.4], [-4, -stalk * 0.8], [4, -stalk]], false, 10);
            put(g, lit({ box: S.bbox(stripOf(path, (u) => 14 - u * 9), 3), res, seed: seed + 'st', lights: Ls, amb, shape: 'round', relief: 0.8, mask: (q) => fillPts(q, stripOf(path, (u) => 14 - u * 9)), albedo: (px, py, d, hh, out) => mixA(hex('#8a7a5a'), hex('#4a3e2a'), 0.5 + 0.4 * noise2(px * 0.1, py * 0.02, sd), out), spec: { k: 0.2, power: 10 } }), 0, 0);
            for (let i = 0; i < 6; i++) {
                const u = 0.6 + i * 0.07, p = path[Math.round(u * (path.length - 1))], side = i % 2 ? 1 : -1, bl = 60 - i * 6;
                g.strokeStyle = '#5a4a32';
                g.lineWidth = 4;
                g.beginPath();
                g.moveTo(p[0], p[1]);
                g.quadraticCurveTo(p[0] + side * bl * 0.7, p[1] + 4, p[0] + side * bl, p[1] - 18);
                g.stroke();
                g.fillStyle = '#6a5a3a';
                for (let k = 0; k < 7; k++) {
                    g.beginPath();
                    g.ellipse(p[0] + side * bl + (r() - 0.5) * 16, p[1] - 24 + (r() - 0.5) * 12, 4, 6, 0, 0, TAU);
                    g.fill();
                }
            }
        }
        const leaves = [];
        for (let i = 0; i < n; i++) {
            const a = -Math.PI / 2 + ((i / (n - 1)) - 0.5) * 2.9 + (r() - 0.5) * 0.15, l = len * (0.6 + 0.4 * Math.cos((i / (n - 1) - 0.5) * 2.2)) * (0.85 + r() * 0.3);
            leaves.push({ a, l, front: Math.abs(i - (n - 1) / 2) < n * 0.3 && r() < 0.5, dry: i === 1 });
        }
        leaves.sort((p, q) => (p.front ? 1 : 0) - (q.front ? 1 : 0) || Math.abs(Math.cos(q.a)) - Math.abs(Math.cos(p.a)));
        for (const lf of leaves) {
            const L = lf.l, wd = L * 0.13;
            const edge = [], back = [];
            for (let i = 0; i <= 24; i++) {
                const u = i / 24, hw = wd * Math.pow(Math.sin(Math.PI * Math.min(1, 0.12 + u * 0.92)), 0.7) * (1 - u * 0.3), bend = 0.1 * L * u * u;
                edge.push([u * L, -hw + bend]);
                back.push([u * L, hw + bend]);
            }
            const pts = [...edge, ...back.reverse()];
            const sp = lit({
                box: S.bbox(pts, 8), res, seed: seed + lf.a, lights: Ls.map((Lt) => (Lt.P ? { ...Lt, P: rotP(Lt.P, 0, 0, -lf.a) } : { ...Lt, dir: rotD(Lt.dir, -lf.a) })), amb, shape: 'round', relief: 0.4,
                mask: (q) => fillPts(q, pts),
                height: (px, py) => 1.6 * Math.abs(py) * 0.08 + 0.4 * noise2(px * 0.05, py * 0.3, sd),
                albedo: (px, py, d, hh, out) => {
                    mixA(hex('#7f9a9c'), hex('#b4c4c0'), 0.3 + 0.3 * noise2(px * 0.02, py * 0.1, sd + 1), out);
                    // the print of the leaf it grew against: a paler ghost of teeth
                    if (Math.abs(Math.abs(py) - wd * 0.5) < 1.2 && Math.sin(px * 0.25) > 0.6) into(out, [0.85, 0.88, 0.84], 0.3);
                    if (lf.dry) mixA(out, hex('#8a7050'), smooth(L * 0.2, L * 0.6, px), out);
                    into(out, hex('#5a5a40'), smooth(L * 0.85, L, px) * 0.5);
                    out[3] = 0.5;
                },
                spec: { k: 0.5, power: 20, broad: 0.12 },
                stroke: { amp: 0.06, freq: 0.04, tone: 5 },
                edge: { rough: 0.8, freq: 0.4, amp: 0.4 },
            });
            g.save();
            g.rotate(lf.a);
            shadow(g, sp, 5, 6, 1, { dx: 0, dy: 0, blur: 7, alpha: 0.5 });
            put(g, sp, 0, 0);
            // the teeth along the margins and the black spine at the tip
            g.fillStyle = '#3a2a1e';
            for (const side of [-1, 1]) {
                for (let i = 3; i < 22; i += 2) {
                    const u = i / 24, hw = wd * Math.pow(Math.sin(Math.PI * Math.min(1, 0.12 + u * 0.92)), 0.7) * (1 - u * 0.3), bend = 0.1 * L * u * u;
                    g.beginPath();
                    g.moveTo(u * L - 2, side * hw + bend);
                    g.lineTo(u * L + 3, side * (hw + 4) + bend);
                    g.lineTo(u * L + 2, side * hw + bend);
                    g.fill();
                }
            }
            g.beginPath();
            g.moveTo(L - 4, -2 + 0.1 * L);
            g.lineTo(L + 16, 0.1 * L);
            g.lineTo(L - 4, 2 + 0.1 * L);
            g.fill();
            g.restore();
        }
        g.restore();
    }

    // An old olive tree (Picual, a hundred years and more) standing on (x, y), moonlit from
    // behind: a fluted trunk twisted on itself, split into limbs, a hollow, bark in strips
    // with lichen; the crown as clumps of narrow leaves, dark above and silver beneath, the
    // ones against the moon catching it; a few black olives. h: its height to the crown's top.
    //   1 the trunk's flutes spiral  2 a hollow, black, its lips rounded  3 a sucker shoot at
    //   the foot  4 lichen, pale grey-green rosettes  5 bark in long strips  6 the pruning
    //   cuts, healed into lips  7 leaves in pairs on the twigs, never flat to the eye  8 the
    //   silver undersides flipped by the wind  9 olives, black and purple  10 its shadow.
    function oliveTree(g, o = {}) {
        const { x = 0, y = 0, s = 1, h = 640, seed = 'olive', lean = 0, spread = 1, crown = true } = o;
        const Ls = lightsOf(o, x, y, s, 0), amb = o.amb, res = resOf(g, s), r = Motion.rng('olive' + seed), sd = S.seedOf(seed);
        // the wood: a short trunk, then limbs
        const tw = h * 0.16 * (0.9 + r() * 0.3), split = -h * (0.3 + r() * 0.1);
        const stems = [];
        stems.push({ path: S.curve([[0, 0], [lean * 30 + (r() - 0.5) * 20, split * 0.5], [lean * 60, split]], false, 8), w: (u) => tw * (1.5 - u * 0.65 + 0.4 * Math.exp(-u * 12)) });
        const nl = 2 + Math.floor(r() * 2);
        const tips = [];
        for (let i = 0; i < nl; i++) {
            const a = -Math.PI / 2 + ((i / (nl - 1)) - 0.5) * 1.3 * spread + lean * 0.4 + (r() - 0.5) * 0.3, L = h * (0.4 + r() * 0.15);
            const sx = lean * 60, sy = split;
            let ex = sx + Math.cos(a) * L, ey = sy + Math.sin(a) * L;
            if (o.keep && Math.hypot((ex * s + x - o.keep.cx) / (o.keep.rx + 60), (ey * s + y - o.keep.cy) / (o.keep.ry + 60)) < 1) {
                const side = x > o.keep.cx ? 1 : -1;
                ex = sx + side * Math.abs(Math.cos(a)) * L * 0.5;
                ey = sy - L * 0.95;
            }
            stems.push({ path: S.curve([[sx + (i - (nl - 1) / 2) * tw * 0.4, sy + 10], [sx + (ex - sx) * 0.4 + (r() - 0.5) * 40, sy + (ey - sy) * 0.45], [ex, ey]], false, 8), w: (u) => tw * (0.8 - u * 0.55) });
            tips.push([ex, ey, a]);
            // a side limb
            if (r() < 0.7) {
                const ang = Math.atan2(ey - sy, ex - sx);
                let b = ang + (r() < 0.5 ? -1 : 1) * (0.6 + r() * 0.4);
                const bx = sx + (ex - sx) * 0.55, by = sy + (ey - sy) * 0.55, BL = L * 0.5;
                if (o.keep && Math.hypot(((bx + Math.cos(b) * BL) * s + x - o.keep.cx) / (o.keep.rx + 60), ((by + Math.sin(b) * BL) * s + y - o.keep.cy) / (o.keep.ry + 60)) < 1) b = ang + (x > o.keep.cx ? 1 : -1) * 0.7;
                stems.push({ path: S.curve([[bx, by], [bx + Math.cos(b) * BL * 0.5, by + Math.sin(b) * BL * 0.5 - 10], [bx + Math.cos(b) * BL, by + Math.sin(b) * BL]], false, 6), w: (u) => tw * (0.36 - u * 0.24) });
                tips.push([bx + Math.cos(b) * BL, by + Math.sin(b) * BL, b]);
            }
        }
        // limbs asked for (one to carry an owl): [{ path, w0, w1 }] in the tree's frame
        for (const lb of o.limbs ?? []) {
            stems.push({ path: S.curve(lb.path, false, 8), w: (u) => lerp(lb.w0, lb.w1, u) });
            const e = lb.path[lb.path.length - 1], p = lb.path[lb.path.length - 2];
            tips.push([e[0], e[1], Math.atan2(e[1] - p[1], e[0] - p[0])]);
        }
        // roots flaring at the foot, and a sucker shoot
        for (let i = 0; i < 5; i++) {
            const a = Math.PI * (0.08 + 0.84 * (i / 4)) + (r() - 0.5) * 0.2, len = tw * (0.9 + r() * 0.6);
            stems.push({ path: S.curve([[Math.cos(a) * tw * 0.2, -tw * 0.5], [Math.cos(a) * len * 0.6, -tw * 0.2], [Math.cos(a) * len * 1.2, 4 + r() * 8]], false, 6), w: (u) => tw * (0.75 - u * 0.55) });
        }
        stems.push({ path: S.curve([[tw * 0.9, -6], [tw * 1.2, -40], [tw * 1.5, -90]], false, 6), w: (u) => 8 - u * 6, sucker: true });
        const polys = stems.map((st) => stripOf(st.path, st.w));
        const hollow = o.hollow === false ? [0, 0, 0.001, 0.001] : [lean * 20 + tw * 0.15, split * 0.45, tw * 0.28, tw * 0.5];
        const allPts = polys.flat();
        const wood = lit({
            box: S.bbox(allPts.concat([[-tw * 1.6, 10], [tw * 1.6, 10]]), 6), res, seed, lights: Ls, amb, shape: 'round', relief: 0.45,
            mask: (q) => {
                stems.forEach((st, i) => {
                    fillPts(q, polys[i]);
                    // round the ends: no limb ends square
                    const e = st.path[st.path.length - 1];
                    q.beginPath();
                    q.arc(e[0], e[1], Math.max(1, st.w(1) / 2), 0, TAU);
                    q.fill();
                });
            },
            height: (px, py) => {
                // flutes that spiral up the trunk, bark in strips across them
                const ph = px * 0.034 + py * 0.012 + 1.6 * noise2(px * 0.006, py * 0.004, sd);
                // bark in long strips: a mesh of fissures stretched along the flutes
                const bk = worley(px / 7 + py * 0.02, py / 26, sd + 9);
                let hh = 8 * Math.pow(Math.abs(Math.sin(ph * Math.PI)), 0.6) + 2.2 * smooth(0, 0.2, bk[1] - bk[0]) + 1.6 * noise2(px * 0.06, py * 0.015, sd + 1);
                const hx = (px - hollow[0]) / hollow[2], hy = (py - hollow[1]) / hollow[3], hr = Math.hypot(hx, hy);
                hh -= 30 * smooth(1.05, 0.7, hr);
                hh += 5 * Math.exp(-(((hr - 1.05) / 0.12) ** 2)); // its lips
                return hh;
            },
            albedo: (px, py, d, hh, out) => {
                const ph = px * 0.034 + py * 0.012 + 1.6 * noise2(px * 0.006, py * 0.004, sd);
                const bk = worley(px / 7 + py * 0.02, py / 26, sd + 9);
                mixA(hex('#8e8a82'), hex('#3a3632'), 0.2 + 0.35 * smooth(0.45, 0, Math.abs(Math.sin(ph * Math.PI))) + 0.35 * smooth(0.15, 0, bk[1] - bk[0]) + 0.12 * noise2(px * 0.02, py * 0.05, sd + 6), out);
                // lichen rosettes
                const lc = worley(px / 9, py / 9, sd + 3);
                if (lc[2] < 0.12 && lc[0] < 0.45) into(out, hex('#a8b49a'), 0.75);
                if (lc[2] > 0.95 && lc[0] < 0.35) into(out, hex('#c8b860'), 0.5);
                const hx = (px - hollow[0]) / hollow[2], hy = (py - hollow[1]) / hollow[3];
                if (Math.hypot(hx, hy) < 0.95) mixA(out, [0.02, 0.02, 0.03], 0.92, out);
                out[3] = 0.3;
            },
            spec: { k: 0.25, power: 14, broad: 0.08 },
            stroke: { amp: 0.08, freq: 0.06, tone: 6 },
            edge: { rough: 1.4, freq: 0.3, amp: 0.6 },
        });
        g.save();
        g.translate(x, y);
        g.scale(s, s);
        // its shadow, thrown towards the eye by a moon behind it: down the ground
        if (o.shadowLen) {
            g.save();
            g.globalCompositeOperation = 'source-atop';
            const sg = g.createLinearGradient(0, 0, 0, o.shadowLen);
            sg.addColorStop(0, 'rgba(4,6,14,0.7)');
            sg.addColorStop(1, 'rgba(4,6,14,0)');
            g.fillStyle = sg;
            g.beginPath();
            g.moveTo(-tw * 1.1, 0);
            g.lineTo(tw * 1.1, 0);
            g.lineTo(tw * 2.4 + lean * 80, o.shadowLen);
            g.lineTo(-tw * 2.4 + lean * 80, o.shadowLen);
            g.fill();
            g.restore();
        }
        put(g, wood, 0, 0);
        if (crown) {
            // the crown: clumps round the limbs' tips and along them
            let clumps = [];
            for (const [ex, ey, a] of tips) {
                const R0 = h * (0.16 + r() * 0.06);
                clumps.push([ex + Math.cos(a) * R0 * 0.3, ey + Math.sin(a) * R0 * 0.3, R0]);
                for (let k = 0; k < 3; k++) clumps.push([ex + (r() - 0.5) * R0 * 1.6, ey + (r() - 0.3) * R0 * 1.0, R0 * (0.55 + r() * 0.3)]);
            }
            // keep the way through clear: a clump that reaches into it is pushed out or dropped
            if (o.keep) {
                const { cx, cy, rx, ry } = o.keep;
                clumps = clumps.map(([px, py, R0]) => {
                    const ax = rx + R0 * s * 0.95, ay = ry + R0 * s * 0.95;
                    let dx = px * s + x - cx, dy = py * s + y - cy;
                    const d = Math.hypot(dx / ax, dy / ay);
                    if (d >= 1) return [px, py, R0];
                    if (d < 0.05) {
                        dx = 0;
                        dy = -ay;
                    } else {
                        dx /= d;
                        dy /= d;
                    }
                    return [(cx + dx - x) / s, (cy + dy - y) / s, R0];
                });
            }
            foliage(g, clumps, { Ls, seed, density: o.density ?? 1, leaf: o.leaf ?? 1, olives: o.olives ?? 0.004, glow: o.glow });
        }
        g.restore();
        return { tips };
    }
    // An olive branch cut from the tree, lying or reaching: wood along `path` (w0 at its foot,
    // w1 at its tip), grey bark in strips with lichen, a round cut at the foot, leaf clumps
    // along its last part. leaves: how many clumps (0: bare).
    function branch(g, o = {}) {
        const { path, w0 = 40, w1 = 10, seed = 'branch', leaves = 4, R = 70 } = o;
        const Ls = lightsOf(o, 0, 0, 1, 0), res = resOf(g), sd = S.seedOf(seed), r = Motion.rng('branch' + seed);
        const P = S.curve(path, false, 10), pts = stripOf(P, (u) => lerp(w0, w1, u));
        const e = P[P.length - 1];
        const sp = lit({
            box: S.bbox(pts, 6), res, seed, lights: Ls, amb: o.amb, shape: 'round', relief: 0.5,
            mask: (q) => {
                fillPts(q, pts);
                q.beginPath();
                q.arc(e[0], e[1], w1 / 2, 0, TAU);
                q.fill();
            },
            height: (px, py) => {
                const bk = worley(px / 6 + py * 0.02, py / 20 + px * 0.01, sd + 9);
                return 2.4 * smooth(0, 0.2, bk[1] - bk[0]) + 1.2 * noise2(px * 0.05, py * 0.05, sd + 1);
            },
            albedo: (px, py, d, hh, out) => {
                const bk = worley(px / 6 + py * 0.02, py / 20 + px * 0.01, sd + 9);
                mixA(hex('#8e8a82'), hex('#3a3632'), 0.25 + 0.4 * smooth(0.15, 0, bk[1] - bk[0]) + 0.15 * noise2(px * 0.02, py * 0.05, sd + 6), out);
                const lc = worley(px / 8, py / 8, sd + 3);
                if (lc[2] < 0.1 && lc[0] < 0.4) into(out, hex('#a8b49a'), 0.7);
                out[3] = 0.3;
            },
            spec: { k: 0.2, power: 14 },
            stroke: { amp: 0.07, freq: 0.06, tone: 3 },
            edge: { rough: 1.2, freq: 0.3, amp: 0.5 },
        });
        shadow(g, sp, 0, 0, 1, { dx: 8, dy: 12, blur: 12, alpha: 0.6 });
        put(g, sp, 0, 0);
        // the saw cut at its foot: pale rings
        const f = P[0];
        g.fillStyle = 'rgba(170,140,100,0.85)';
        g.beginPath();
        g.ellipse(f[0], f[1], w0 * 0.42, w0 * 0.5, 0, 0, TAU);
        g.fill();
        g.strokeStyle = 'rgba(90,64,40,0.6)';
        g.lineWidth = 0.8;
        for (const k of [0.15, 0.25, 0.35]) {
            g.beginPath();
            g.ellipse(f[0], f[1], w0 * k, w0 * k * 1.2, 0, 0, TAU);
            g.stroke();
        }
        if (leaves) {
            const clumps = [];
            for (let i = 0; i < leaves; i++) {
                const u = 0.45 + (0.55 * (i + 0.5)) / leaves, p = P[Math.min(P.length - 1, Math.round(u * (P.length - 1)))];
                clumps.push([p[0] + (r() - 0.5) * R * 0.6, p[1] + (r() - 0.5) * R * 0.6, R * (0.7 + r() * 0.5)]);
            }
            foliage(g, clumps, { Ls, seed: seed + 'f', density: o.density ?? 1, leaf: o.leaf ?? 1.1, olives: o.olives ?? 0.01, glow: o.glow, warm: o.warm, mass: o.mass });
        }
        return P;
    }

    // Leaf clumps [[cx, cy, R], …] of olive: narrow leaves in pairs, dark above, silver below.
    function foliage(g, clumps, o) {
        const { Ls, seed = 'fol', density = 1, leaf = 1 } = o;
        const r = Motion.rng('foliage' + seed);
        // which way the light is, in the plane, for each clump
        const L0 = Ls[0];
        const dirTo = (cx, cy) => {
            if (!L0) return [0, -1, 0];
            const v = L0.P ? [L0.P[0] - cx, L0.P[1] - cy, L0.P[2]] : L0.dir;
            const l = Math.hypot(v[0], v[1]) || 1;
            return [v[0] / l, v[1] / l, v[2] / Math.hypot(...v)];
        };
        // the dark mass behind first
        softSheet(g, 10, (q) => {
            for (const [cx, cy, R] of clumps) {
                q.fillStyle = `rgba(14,20,22,${0.85 * (o.mass ?? 1)})`;
                q.beginPath();
                for (let i = 0; i < 9; i++) {
                    const a = r() * TAU, d = r() * R * 0.5;
                    q.moveTo(cx + Math.cos(a) * d + R * 0.55, cy + Math.sin(a) * d);
                    q.arc(cx + Math.cos(a) * d, cy + Math.sin(a) * d, R * 0.55, 0, TAU);
                }
                q.fill();
            }
        }, 'source-over');
        const all = [];
        for (const [cx, cy, R] of clumps) {
            const [dx, dy] = dirTo(cx, cy);
            // twigs radiating, leaves in pairs along them
            const nt = Math.round(10 * density * (R / 100) + 4);
            for (let t = 0; t < nt; t++) {
                const a = r() * TAU, len = R * (0.4 + r() * 0.6), ox = cx + (r() - 0.5) * R * 0.4, oy = cy + (r() - 0.5) * R * 0.4;
                const droop = 0.35;
                all.push({ twig: true, ox, oy, a, len, droop, depth: -1 });
                for (let k = 1; k <= 7; k++) {
                    const u = k / 7.5 + (r() - 0.5) * 0.06, px = ox + Math.cos(a) * len * u, py = oy + Math.sin(a) * len * u + droop * len * u * u * 0.4;
                    for (const side of [-1, 1]) {
                        if (r() < 0.22) continue;
                        const la = a + side * (0.25 + r() * 0.95) + 0.35 * droop + (r() - 0.5) * 0.5, ll = (11 + r() * 9) * leaf * (1 - 0.3 * u);
                        const lx = px + Math.cos(la) * ll * 0.5, ly = py + Math.sin(la) * ll * 0.5;
                        const rx = (lx - cx) / R, ry = (ly - cy) / R, rim = clamp(rx * dx + ry * dy), out = Math.hypot(rx, ry);
                        const flip = r() < 0.3; // the wind shows the silver underside
                        all.push({ lx, ly, la, ll, wd: ll * (0.17 + r() * 0.05) * (0.5 + 0.5 * Math.abs(Math.cos(la * 1.3 + t))), lit: Math.pow(rim, 1.5) * smooth(0.3, 1, out), flip, depth: out, seed: r() });
                    }
                }
            }
            // a few olives
            for (let i = 0; i < R * (o.olives ?? 0.004) * 10; i++) all.push({ olive: true, lx: cx + (r() - 0.5) * R * 1.2, ly: cy + (r() - 0.2) * R, depth: 0.5 });
        }
        all.sort((p, q) => p.depth - q.depth);
        // the twigs under their leaves
        g.strokeStyle = 'rgba(30,30,34,0.85)';
        g.lineCap = 'round';
        for (const t of all) {
            if (!t.twig) continue;
            g.lineWidth = 1.6 * leaf;
            g.beginPath();
            g.moveTo(t.ox, t.oy);
            g.quadraticCurveTo(t.ox + Math.cos(t.a) * t.len * 0.5, t.oy + Math.sin(t.a) * t.len * 0.5 + t.droop * t.len * 0.05, t.ox + Math.cos(t.a) * t.len * 0.95, t.oy + Math.sin(t.a) * t.len * 0.95 + t.droop * t.len * 0.36);
            g.stroke();
        }
        const tone = (k, flip) => {
            // dark green-grey above, silver beneath; the moon on the rim
            const base = flip ? [52, 64, 66] : [22, 32, 30];
            const top = flip ? [196, 210, 216] : [120, 140, 140];
            return base.map((v, i) => Math.round(v + (top[i] - v) * k));
        };
        for (const L of all) {
            if (L.twig) continue;
            if (L.olive) {
                g.fillStyle = '#1a1020';
                g.beginPath();
                g.ellipse(L.lx, L.ly, 4.5, 6, 0.3, 0, TAU);
                g.fill();
                g.fillStyle = 'rgba(190,200,230,0.7)';
                g.beginPath();
                g.arc(L.lx - 1, L.ly - 2.5, 1.2, 0, TAU);
                g.fill();
                continue;
            }
            const k = clamp(L.lit * 1.1 + (L.flip ? 0.15 : 0) + (L.seed - 0.5) * 0.12 + (o.glow ?? 0) * 0.2);
            let c = tone(k, L.flip), cd = tone(k * 0.5, L.flip);
            if (o.warm) {
                // by the fire the lit edge is copper, not silver
                const w = o.warm * L.lit;
                c = c.map((v, i) => Math.round(v + ([235, 140, 70][i] - v) * w));
            }
            g.save();
            g.translate(L.lx, L.ly);
            g.rotate(L.la);
            // a leaf: its two halves, the lit one and the other, and the midrib
            g.fillStyle = `rgb(${cd})`;
            g.beginPath();
            g.ellipse(0, 0, L.ll * 0.5, L.wd * 0.5, 0, 0, TAU);
            g.fill();
            g.fillStyle = `rgb(${c})`;
            g.beginPath();
            g.ellipse(0, -L.wd * 0.12, L.ll * 0.47, L.wd * 0.3, 0, 0, TAU);
            g.fill();
            if (L.ll > 9) {
                g.strokeStyle = `rgba(${tone(Math.min(1, k + 0.3), true)},0.6)`;
                g.lineWidth = 0.45;
                g.beginPath();
                g.moveTo(-L.ll * 0.45, 0);
                g.lineTo(L.ll * 0.45, 0);
                g.stroke();
            }
            g.restore();
        }
    }

    // The little scops owl (autillo, «la zumaya»), perched; (x, y) its feet on the branch,
    // 120 tall at s = 1: ear tufts up, the grey bark-coloured plumage with dark shaft streaks
    // and fine wavy bars, a row of white spots on the scapulars, yellow eyes, a dark bill.
    function owl(g, o = {}) {
        const { x = 0, y = 0, s = 1, seed = 'owl' } = o;
        const Ls = lightsOf(o, x, y, s, 0), amb = o.amb, res = resOf(g, s * 1.5), sd = S.seedOf(seed);
        const body = S.curve([[0, -116], [-12, -119], [-22, -128], [-31, -140], [-28, -116], [-32, -96], [-33, -70], [-30, -42], [-22, -16], [-12, -2], [-4, 6], [4, 6], [12, -2], [22, -16], [30, -42], [33, -70], [32, -96], [28, -116], [31, -140], [22, -128], [12, -119]], true, 6);
        const plum = (px, py, out) => {
            // grey bark-coloured feathers, small and overlapping: each with a dark shaft streak
            // down its middle, a paler tip, its own tone; finer and barred on the face
            const ww = worley(px / 4.6 + 0.3 * noise2(px * 0.05, py * 0.05, sd), py / 6.2, sd + 5);
            const id = ww[2], dx = px / 4.6 - ww[3], dy = py / 6.2 - ww[4];
            mixA(hex('#8a8682'), hex('#55504c'), 0.25 + 0.5 * id, out);
            into(out, hex('#8a7458'), 0.25 * smooth(0.3, 0.9, noise2(px * 0.04, py * 0.04, sd + 1))); // a rufous cast here and there
            if (Math.abs(dx + 0.04 * Math.sin(dy * 6)) < 0.04 + 0.05 * id && dy > -0.2 - 0.3 * id && dy < 0.2 && id > 0.5) into(out, [0.07, 0.06, 0.06], 0.75);
            if (dy > 0.18) into(out, [0.86, 0.84, 0.8], 0.25 * smooth(0.18, 0.35, dy)); // the tips
            if (Math.sin(py * 2.1 + px * 0.3 + 3 * noise2(px * 0.2, py * 0.2, sd + 3)) > 0.88) into(out, [0.18, 0.16, 0.15], 0.35); // fine wavy bars
        };
        const bodySp = lit({
            box: S.bbox(body, 4), res, seed, lights: Ls, amb, shape: 'round', relief: 0.8,
            mask: (q) => fillPts(q, body),
            height: (px, py) => 1.2 * Math.abs(Math.sin(px * 0.5 + py * 0.25)) * smooth(-90, -60, py) + 0.6 * noise2(px * 0.3, py * 0.3, sd + 4),
            albedo: (px, py, d, hh, out) => {
                plum(px, py, out);
                // the facial disc, paler, rimmed dark
                const fd = Math.hypot(px / 26, (py + 96) / 22);
                if (fd < 1) into(out, hex('#b0a492'), 0.55 * smooth(1, 0.6, fd));
                if (Math.abs(fd - 1) < 0.05 && noise2(px * 0.3, py * 0.3, sd + 9) > -0.3) into(out, [0.12, 0.1, 0.09], 0.5);
                // the white scapular spots
                for (const sx of [-1, 1]) for (let k = 0; k < 4; k++) if (Math.hypot(px - sx * (28 - k * 1.5), py + 66 - k * 7) < 2.4) into(out, [0.92, 0.9, 0.84], 0.9);
                // the eyes: yellow irises, black pupils, a point of the moon in each
                for (const ex of [-11.5, 11.5]) {
                    const ed = Math.hypot(px - ex, py + 98);
                    if (ed < 7) {
                        mixA(hex('#e8b830'), hex('#a86a10'), smooth(3, 7, ed), out);
                        out[5] = 0.25 * smooth(7, 3, ed);
                        out[6] = 0.18 * smooth(7, 3, ed);
                        out[3] = 2;
                    }
                    if (ed < 3.6) mixA(out, [0.02, 0.02, 0.02], 0.95, out);
                    if (Math.hypot(px - ex + 1.6, py + 99.6) < 1.1) {
                        out[5] = out[6] = out[7] = 0.9;
                    }
                    if (ed > 7 && ed < 8.6) mixA(out, [0.08, 0.06, 0.05], 0.8, out);
                }
                // the bill
                if (Math.abs(px) < 2.6 - (py + 90) * 0.25 && py > -92 && py < -82) mixA(out, [0.12, 0.1, 0.1], 0.9, out);
            },
            spec: { k: 0.3, power: 20 },
            stroke: { amp: 0.06, freq: 0.12, tone: 3 },
            edge: { rough: 2, freq: 0.6, amp: 0.9 },
        });
        g.save();
        g.translate(x, y);
        g.scale(s, s);
        put(g, bodySp, 0, 0);
        // the toes over the branch
        g.strokeStyle = '#6a6058';
        g.lineWidth = 2.4;
        g.lineCap = 'round';
        for (const fx of [-10, 10]) for (const d of [-5, 0, 5]) {
            g.beginPath();
            g.moveTo(fx, -4);
            g.quadraticCurveTo(fx + d, 4, fx + d * 1.4, 9);
            g.stroke();
        }
        g.restore();
    }

    // A will-o'-the-wisp: a cold flame that floats, its halo and the light it lays below.
    function wisp(g, o = {}) {
        const { x = 0, y = 0, r = 26, seed = 'wisp' } = o;
        softSheet(g, r * 0.5, (q) => {
            const gr = q.createRadialGradient(x, y, 0, x, y, r * 4.5);
            gr.addColorStop(0, 'rgba(150,240,220,0.5)');
            gr.addColorStop(0.3, 'rgba(70,170,170,0.18)');
            gr.addColorStop(1, 'rgba(30,80,110,0)');
            q.fillStyle = gr;
            q.fillRect(x - r * 5, y - r * 5, r * 10, r * 10);
            // the pool of its light on the ground below
            const gp = q.createRadialGradient(x, y + r * 3, 0, x, y + r * 3, r * 3);
            gp.addColorStop(0, 'rgba(90,190,180,0.25)');
            gp.addColorStop(1, 'rgba(90,190,180,0)');
            q.fillStyle = gp;
            q.beginPath();
            q.ellipse(x, y + r * 3, r * 3, r * 0.8, 0, 0, TAU);
            q.fill();
        });
        softSheet(g, r * 0.12, (q) => {
            q.fillStyle = 'rgba(190,255,240,0.6)';
            tongue(q, x, y + r * 0.4, r * 2.2, r * 0.9, 0.08, seed);
            q.fill();
            q.fillStyle = 'rgba(240,255,250,0.9)';
            q.beginPath();
            q.ellipse(x, y, r * 0.32, r * 0.42, 0, 0, TAU);
            q.fill();
        });
    }

    // A tuberose spike (nardo) along `path` (base first): pairs of florets opening from the
    // bottom up, half-open ones, then buds flushed pink at the tip; each floret a waxy star of
    // six tepals on a long tube. Lit by the moon it is pinned to. Returns the florets' places.
    //   1 six tepals, the outer three narrower  2 the tube, long, curved  3 the throat green-
    //   yellow, deep  4 the wax: a sheen broken by the tepals' veins  5 the buds pink  6 the
    //   green bracts at each pair  7 the stem, glaucous  8 a floret going brown at its edge
    //   9 open from the base up  10 the scent (unpaintable: the moon came for it).
    // cream: the round-8 tone (white wax, faintly cream, shaded warm grey): without it the
    // shade tones are lilac and under a cold light the flower reads lavender. The moon's
    // bustle keeps the old tone (her layer is final); everything new passes cream.
    function floretSprite(open, size, fy, Ls, amb, res, k, cream = false) {
        // six oblong lobes with blunt tips, the outer three a little narrower, spreading from a
        // short throat; fy squashes it (seen at a slant); open < 1 cups it shut
        const lobes = [];
        const turn = (k % 7) * 0.31;
        for (let i = 0; i < 6; i++) {
            const a0 = (i / 6) * TAU + turn + (i % 2 ? 0.06 : 0), inner = i % 2 === 0;
            const len = size * (inner ? 1 : 0.92) * (0.5 + 0.5 * open), wd = size * (inner ? 0.52 : 0.44);
            const lj = len * (0.86 + 0.24 * hashI(i, k, 1, 41)); // no two lobes quite alike
            const pts = [];
            for (let j = 0; j <= 14; j++) {
                const u = j / 14, w2 = wd * 0.5 * Math.pow(Math.sin(Math.PI * Math.min(1, 0.06 + u * 0.96)), 0.36) * (1 - 0.12 * u);
                pts.push([size * 0.08 + u * lj, w2]);
            }
            for (let j = 14; j >= 0; j--) {
                const u = j / 14, w2 = wd * 0.5 * Math.pow(Math.sin(Math.PI * Math.min(1, 0.06 + u * 0.96)), 0.36) * (1 - 0.12 * u);
                pts.push([size * 0.08 + u * lj, -w2]);
            }
            lobes.push({ pts: S.xf(pts, { rot: a0 }).map(([a, b]) => [a, b * fy]), a0, len: lj, inner });
        }
        const all = lobes.flatMap((l) => l.pts);
        // which lobe a point is on (the inner three lie over the outer)
        const lobeAt = (px, py) => {
            const a = Math.atan2(py / fy, px);
            let best = null, bd = 9;
            for (const l of lobes) {
                let d = Math.abs(a - l.a0);
                if (d > Math.PI) d = TAU - d;
                const dd = d - (l.inner ? 0.12 : 0);
                if (dd < bd) {
                    bd = dd;
                    best = l;
                }
            }
            return [best, a];
        };
        return lit({
            box: S.bbox(all, 3), res, seed: 'floret' + k, lights: Ls, amb, shape: 'none',
            mask: (q) => {
                for (const l of lobes) if (!l.inner) fillPts(q, l.pts);
                for (const l of lobes) if (l.inner) fillPts(q, l.pts);
                q.beginPath();
                q.ellipse(0, 0, size * 0.2, size * 0.2 * fy, 0, 0, TAU);
                q.fill();
            },
            height: (px, py) => {
                const [l, a] = lobeAt(px, py), rr = Math.hypot(px, py / fy) / size;
                let d = Math.abs(a - l.a0);
                if (d > Math.PI) d = TAU - d;
                // each lobe a shallow trough along its midvein, its tip curled back; the throat deep
                const across = d / 0.5;
                return 1.1 * across * across - 0.35 * Math.exp(-((across / 0.15) ** 2)) + 7 * Math.sin(Math.min(1, rr) * 2.6) - 4 * smooth(0.95, 1.1, rr) * (1 - open * 0.5) - 8 * smooth(0.2, 0.04, rr) + (l.inner ? 1.2 : 0);
            },
            albedo: (px, py, d, hh, out) => {
                const rr = Math.hypot(px, py / fy) / size, [l, a] = lobeAt(px, py);
                let dA = a - l.a0;
                if (dA > Math.PI) dA -= TAU;
                if (dA < -Math.PI) dA += TAU;
                const across = dA / 0.5;
                // wax: white with a cream warmth, a lilac grey where it turns
                mixA(hex(cream ? '#fffaee' : '#fbf7ea'), hex(cream ? '#f4ead2' : '#efe6d2'), 0.35 + 0.35 * noise2(px * 0.15, py * 0.15, k), out);
                if (!l.inner) into(out, hex(cream ? '#f6ead6' : '#efe1d8'), 0.35); // the outer lobes rosier (creamier)
                // veins: fine lines along the lobe, the midvein a little stronger
                const vq = Math.abs(across * 3.5 - Math.round(across * 3.5));
                into(out, hex(cream ? '#d8cbb0' : '#cfc6b4'), (Math.round(across * 3.5) === 0 ? 0.32 : 0.16) * smooth(0.12, 0.02, vq) * smooth(0.2, 0.4, rr));
                // the inner lobes shade the outer ones where they lie on them
                if (!l.inner) into(out, hex(cream ? '#b9ac94' : '#a8a2b4'), 0.35 * smooth(0.5, 0.15, Math.abs(Math.abs(across) - 1)) * smooth(0.25, 0.5, rr));
                // the lobe's edge, its thickness, catches the light
                if (d < 1.1) into(out, [1, 1, 0.97], 0.35);
                // three anthers in the throat
                for (let q = 0; q < 3; q++) {
                    const aa = l.a0 * 0 + (q / 3) * TAU + k, ax = Math.cos(aa) * size * 0.1, ay = Math.sin(aa) * size * 0.1 * fy;
                    if (Math.hypot(px - ax, py - ay) < size * 0.045) into(out, hex('#d8b040'), 0.8);
                }
                into(out, hex('#e6b9b4'), (1 - open) * 0.55 + smooth(0.85, 1.05, rr) * 0.12);
                into(out, hex('#d7d39a'), smooth(0.24, 0.08, rr) * 0.75); // the throat, green-yellow
                if (rr < 0.06) mixA(out, [0.32, 0.34, 0.16], 0.85, out);
                into(out, hex(cream ? '#d3c7ae' : '#c9c4cc'), smooth(0.45, 0.2, rr) * 0.35); // the cup darkens towards the throat
                if (k % 13 === 5) into(out, hex('#b08a5a'), smooth(0.8, 1.05, rr) * 0.55); // a browning edge
                out[3] = 0.9;
            },
            spec: { k: 0.35, power: 18, broad: 0.18, broadPow: 4 },
            stroke: { amp: 0.05, freq: 0.18, tone: 5 },
            edge: { rough: 0.7, freq: 0.6, amp: 0.4 },
            smoothH: 0.6,
        });
    }
    function floret(g, o = {}) {
        const { x = 0, y = 0, size = 30, open = 1, tilt = 0.8, k = 5 } = o;
        const Ls = lightsOf(o, x, y, 1, 0), sp = floretSprite(open, size, tilt, Ls, o.amb, resOf(g, 1.5), k, o.cream);
        shadow(g, sp, x + 3, y + 4, 1, { dx: 0, dy: 0, blur: 4, alpha: 0.6 });
        put(g, sp, x, y, 1, o.rot ?? 0);
    }
    function tuberose(g, o = {}) {
        const { path, s = 1, seed = 'nardo', size = 34, n = 7 } = o;
        const Ls = lightsOf(o, 0, 0, 1, 0), amb = o.amb, res = resOf(g, s * 1.2), r = Motion.rng('nardo' + seed);
        const P = S.curve(path, false, 10);
        // the stem
        const stem = stripOf(P, (u) => 7 - u * 4);
        put(g, lit({ box: S.bbox(stem, 3), res, seed: seed + 'st', lights: Ls, amb, shape: 'round', relief: 0.8, mask: (q) => fillPts(q, stem), albedo: (px, py, d, hh, out) => mixA(hex('#5a7a4a'), hex('#9ab07a'), 0.4 + 0.3 * noise2(px * 0.05, py * 0.05, 3), out), spec: { k: 0.3, power: 20 } }), 0, 0);
        const places = [];
        for (let i = 0; i < n; i++) {
            const u = 0.18 + (i / (n - 1)) * 0.8, idx = Math.round(u * (P.length - 1)), p = P[idx], q = P[Math.min(P.length - 1, idx + 1)], p0 = P[Math.max(0, idx - 1)];
            const ta = Math.atan2(q[1] - p0[1], q[0] - p0[0]);
            const open = clamp(1.25 - u * 1.25 + (r() - 0.5) * 0.15);
            for (const side of [-1, 1]) {
                if (u > 0.8 && side > 0) continue;
                const a = ta + side * (0.9 + r() * 0.5), dist = size * (0.55 + 0.35 * open);
                const fx = p[0] + Math.cos(a) * dist, fy = p[1] + Math.sin(a) * dist;
                // the tube from the stem to the floret
                g.strokeStyle = open > 0.3 ? '#cfd0b0' : '#c9a0a0';
                g.lineWidth = size * 0.16;
                g.lineCap = 'round';
                g.beginPath();
                g.moveTo(p[0], p[1]);
                g.quadraticCurveTo(p[0] + Math.cos(a) * dist * 0.5, p[1] + Math.sin(a) * dist * 0.5 - 4, fx, fy);
                g.stroke();
                g.strokeStyle = 'rgba(255,255,240,0.35)';
                g.lineWidth = size * 0.05;
                g.stroke();
                if (open < 0.25) {
                    // a bud: a pink, pointed tube
                    const bl = size * (0.6 + open), bud = S.xf(S.ellipse(bl * 0.5, 0, bl * 0.5, size * 0.13, 16), { x: fx - Math.cos(a) * bl * 0.3, y: fy - Math.sin(a) * bl * 0.3, rot: a });
                    put(g, lit({ box: S.bbox(bud, 2), res, seed: seed + 'b' + i + side, lights: Ls, amb, shape: 'round', mask: (qq) => fillPts(qq, bud), albedo: (px, py, d, hh, out) => mixA(hex('#e0b8b0'), hex('#a86a70'), 0.4, out), spec: { k: 0.4, power: 20 } }), 0, 0);
                    continue;
                }
                const kk = Math.floor(r() * 1000), tilt = 0.5 + r() * 0.5;
                const sp = floretSprite(open, size * (0.85 + r() * 0.3), tilt, Ls.map((L) => (L.P ? { ...L, P: [L.P[0] - fx, L.P[1] - fy, L.P[2]] } : L)), amb, res, kk, o.cream);
                shadow(g, sp, fx + 2, fy + 3, 1, { dx: 0, dy: 0, blur: 4, alpha: 0.45, color: '#0a0c1a' });
                put(g, sp, fx, fy, 1, 0);
                places.push([fx, fy]);
            }
        }
        // the green bracts at the pairs
        return places;
    }

    // The moon's bustle of tuberoses («su polisón de nardos»): a crowd of florets round her
    // lower half, in tiers, buds and spikes flaring up at the two ends, long strap leaves
    // under them. R: her radius; `floor`: no floret reaches below this y (the calm band).
    function bustle(g, o = {}) {
        const { R = 300, floor = 360, seed = 'bustle' } = o;
        const Ls = lightsOf(o, 0, 0, 1, 0).map((L) => ({ ...L, wrap: 0.55 })), amb = o.amb, res = resOf(g, 1.3), r = Motion.rng('bustle' + seed);
        // the wax is lit through: white flowers keep light in their shade
        const wax = [0.3, 0.31, 0.37];
        // leaves first: long straps from under the flowers, arching out and drooping
        for (let i = 0; i < 9; i++) {
            const a = Math.PI * (0.08 + 0.84 * (i / 8)) + (r() - 0.5) * 0.15, side = Math.cos(a) >= 0 ? -1 : 1;
            const t = a + side * (1.1 + r() * 0.4), len = 130 + r() * 110, ra = R * (1.0 + r() * 0.06);
            const bx = Math.cos(a) * ra, by = Math.min(floor - 30, Math.sin(a) * ra);
            const droop = 50 + r() * 40;
            const path = [[bx, by], [bx + Math.cos(t) * len * 0.45 + Math.cos(a) * 30, by + Math.sin(t) * len * 0.45 + Math.sin(a) * 20], [bx + Math.cos(t) * len + Math.cos(a) * 50, Math.min(floor - 8, by + Math.sin(t) * len + droop)]];
            const pts = stripOf(S.curve(path, false, 8), (u) => 13 * Math.sin(Math.PI * Math.min(1, 0.15 + u)) + 1);
            put(g, lit({ box: S.bbox(pts, 3), res, seed: seed + 'lf' + i, lights: Ls, amb, shape: 'round', relief: 0.5, mask: (q) => fillPts(q, pts),
                albedo: (px, py, d, hh, out) => mixA(hex('#2e4a3a'), hex('#5e7a66'), 0.35 + 0.3 * noise2(px * 0.04, py * 0.04, i), out), spec: { k: 0.3, power: 20, broad: 0.08 }, edge: { rough: 0.6, freq: 0.5, amp: 0.4 } }), 0, 0);
        }
        // the florets: tiers from the outside in, so the inner ones lie over the moon's rim
        const items = [];
        for (const [tier, rk, n, sz] of [[0, 1.13, 15, 34], [1, 1.02, 17, 38], [2, 0.92, 15, 36]]) {
            for (let i = 0; i < n; i++) {
                const a = Math.PI * (0.07 + 0.86 * ((i + 0.5 * (tier % 2)) / (n - 0.5))) + (r() - 0.5) * 0.05;
                const size = sz * (0.82 + r() * 0.36), rad = R * rk + (r() - 0.5) * 14;
                let fx = Math.cos(a) * rad, fy = Math.sin(a) * rad;
                fy = Math.min(fy, floor - size * 0.75);
                const end = Math.min(a, Math.PI - a) / Math.PI; // 0 at the ends of the arc, 0.5 at the bottom
                const open = clamp(0.35 + end * 2.2 + (r() - 0.5) * 0.3, 0, 1);
                items.push({ fx, fy, size, open, tilt: 0.55 + r() * 0.45, rot: a + (r() - 0.5) * 0.6, k: Math.floor(r() * 997) + tier * 1000, tier });
            }
        }
        // spikes flaring up at the two ends: buds, half-open, on a curling stem
        for (const side of [-1, 1]) {
            for (let j = 0; j < 2; j++) {
                const a0 = side < 0 ? Math.PI * (0.95 + j * 0.05) : Math.PI * (0.05 - j * 0.05), ra = R * (1.05 + j * 0.1);
                const bx = Math.cos(a0) * ra, by = Math.sin(a0) * ra;
                const path = [[bx - side * 10, by + 90], [bx + side * 24, by + 20], [bx + side * 40 - side * 16 * j, by - 50 - 20 * j], [bx + side * 30, by - 100 - 30 * j]];
                tuberose(g, { path, size: 28, n: 6, seed: seed + 'sp' + side + j, fire: o.fire, moon: o.moon, amb: wax, lights: o.lights });
            }
        }
        items.sort((p, q) => p.tier - q.tier);
        for (const it of items) {
            // a glimpse of its tube and the stem behind
            g.strokeStyle = '#9aa88a';
            g.lineWidth = it.size * 0.14;
            g.lineCap = 'round';
            g.beginPath();
            g.moveTo(it.fx * 0.94, it.fy * 0.94);
            g.lineTo(it.fx, it.fy);
            g.stroke();
            const sp = floretSprite(it.open, it.size, it.tilt, Ls.map((L) => (L.P ? { ...L, P: rotP(L.P, it.fx, it.fy, -it.rot) } : { ...L, dir: rotD(L.dir, -it.rot) })), wax, res, it.k);
            g.save();
            g.translate(it.fx, it.fy);
            g.rotate(it.rot);
            shadow(g, sp, 3, 4, 1, { dx: 0, dy: 0, blur: 5, alpha: 0.5, color: '#0a0c1a' });
            put(g, sp, 0, 0);
            g.restore();
        }
    }

    // Ploughed ground under the moon: furrows running away to (vx, vy), their crests silvered,
    // clods, stones, tufts of dry grass. Painted over what is there, between y0 and the bottom.
    function furrows(g, o = {}) {
        const { box, vx = 0, vy = 150, n = 40, seed = 'furrows', warm = 0 } = o;
        const r = Motion.rng('furrows' + seed), bottom = box.y + box.h;
        g.save();
        g.lineCap = 'round';
        for (let i = 0; i < n; i++) {
            const u = (i + 0.5) / n, bx = box.x - box.w * 0.5 + u * box.w * 2;
            const pts = [];
            for (let k = 0; k <= 20; k++) {
                const t = k / 20, px = bx + (vx - bx) * t * 0.9, py = bottom + (vy - bottom) * t * 0.9;
                pts.push([px + 6 * noise2(px * 0.01, py * 0.01, i), py]);
            }
            for (const [col, wd, dy] of [['rgba(4,5,12,0.55)', 9, 3], [`rgba(${150 + warm * 60},${165 + warm * 20},${200 - warm * 60},0.22)`, 2.4, -3]]) {
                g.strokeStyle = col;
                g.beginPath();
                pts.forEach(([px, py], k) => {
                    const w = wd * (1 - (k / 20) * 0.85);
                    g.lineWidth = Math.max(0.4, w);
                    if (k === 0) g.moveTo(px, py + dy);
                    else g.lineTo(px, py + dy * (1 - k / 22));
                });
                g.stroke();
            }
        }
        // clods and stones, thicker near us
        for (let i = 0; i < 260; i++) {
            const t = Math.pow(r(), 0.6), py = vy + (bottom - vy) * t, px = vx + (r() - 0.5) * box.w * (0.3 + t);
            const rad = 2 + t * 9 * r();
            g.fillStyle = r() < 0.2 ? `rgba(120,128,150,${0.4 + r() * 0.3})` : `rgba(10,10,18,${0.4 + r() * 0.3})`;
            g.beginPath();
            g.ellipse(px, py, rad * 1.4, rad * 0.8, 0, 0, TAU);
            g.fill();
            g.fillStyle = `rgba(180,195,225,${0.25 * t})`;
            g.beginPath();
            g.ellipse(px - rad * 0.3, py - rad * 0.4, rad * 0.6, rad * 0.3, 0, 0, TAU);
            g.fill();
        }
        // dry grass in tufts
        for (let i = 0; i < 70; i++) {
            const t = Math.pow(r(), 0.5), py = vy + (bottom - vy) * t, px = vx + (r() - 0.5) * box.w * (0.3 + t), hgt = 6 + 30 * t * r();
            for (let k = 0; k < 7; k++) {
                const a = -Math.PI / 2 + (r() - 0.5) * 1.2;
                g.strokeStyle = r() < 0.5 ? 'rgba(150,140,110,0.6)' : 'rgba(60,58,50,0.7)';
                g.lineWidth = 0.6 + t;
                g.beginPath();
                g.moveTo(px, py);
                g.quadraticCurveTo(px + Math.cos(a) * hgt * 0.5, py + Math.sin(a) * hgt * 0.6, px + Math.cos(a) * hgt + (r() - 0.5) * 6, py + Math.sin(a) * hgt);
                g.stroke();
            }
        }
        g.restore();
    }

    // Far hills under the moon, and on the far one the outline of a walled hill-palace
    // (towers, walls with merlons) dark against the sky, its edges silvered: what one sees
    // across the valley from the caves. ridge(x) → y.
    function hills(g, o = {}) {
        const { x0 = -1300, x1 = 1300, y = 150, bottom = 780, seed = 'hills', palace = null } = o;
        const r = Motion.rng('hills' + seed), sd = S.seedOf(seed);
        const ridge = (x) => y + 34 * noise2(x * 0.002, 0, sd) + 10 * noise2(x * 0.01, 0, sd + 1) - 40 * Math.exp(-(((x - (palace?.x ?? 0)) / 500) ** 2));
        const pts = [];
        for (let x = x0; x <= x1; x += 10) pts.push([x, ridge(x)]);
        g.fillStyle = '#0c1226';
        g.beginPath();
        S.trace(g, [...pts, [x1, bottom], [x0, bottom]]);
        g.fill();
        // the hill's own night: woods as dots, a lighter band near the ridge
        for (let i = 0; i < 500; i++) {
            const x = x0 + r() * (x1 - x0), yy = ridge(x) + 6 + r() * 80;
            g.fillStyle = `rgba(${r() < 0.5 ? '20,30,40' : '40,52,70'},0.7)`;
            g.beginPath();
            g.arc(x, yy, 2 + r() * 4, 0, TAU);
            g.fill();
        }
        if (palace) {
            const px = palace.x, base = ridge(px) + 4, k = palace.s ?? 1;
            // towers and walls: a long low wall with merlons, square towers of different heights
            const blocks = [[-170, 26, 36], [-120, 18, 22], [-70, 22, 30], [-20, 36, 64], [30, 30, 46], [80, 18, 24], [130, 26, 40], [180, 16, 22], [230, 22, 30]];
            g.fillStyle = '#0a0e1e';
            g.fillRect(px - 200 * k, base - 16 * k, 460 * k, 30 * k);
            for (const [bx, w, h] of blocks) {
                g.fillRect(px + bx * k - (w * k) / 2, base - h * k, w * k, h * k + 10);
                for (let m = 0; m < Math.floor(w / 6); m++) g.fillRect(px + bx * k - (w * k) / 2 + m * 6 * k + 1, base - h * k - 4 * k, 3.5 * k, 4 * k);
            }
            for (let m = 0; m < 70; m++) g.fillRect(px - 200 * k + m * 6.6 * k, base - 20 * k, 3.4 * k, 4 * k);
            // the moon on their edges, and two small lights in windows
            g.strokeStyle = 'rgba(170,186,230,0.45)';
            g.lineWidth = 1;
            for (const [bx, w, h] of blocks) {
                g.beginPath();
                g.moveTo(px + bx * k - (w * k) / 2, base - h * k);
                g.lineTo(px + bx * k + (w * k) / 2, base - h * k);
                g.stroke();
            }
            g.fillStyle = 'rgba(255,190,110,0.8)';
            g.fillRect(px - 22 * k, base - 40 * k, 2.2 * k, 3.2 * k);
            g.fillRect(px + 128 * k, base - 22 * k, 2 * k, 3 * k);
        }
        // the ridge silvered by the moon behind it
        g.strokeStyle = 'rgba(160,178,224,0.35)';
        g.lineWidth = 2;
        g.beginPath();
        S.trace(g, pts, false);
        g.stroke();
        return ridge;
    }

    // The night sky: deep blue, lighter round the moon, stars of every size and colour (fewer
    // where the moon washes them out), thin cirrus lit silver near it. `calm`: a box kept quiet.
    function sky(g, o = {}) {
        const { box, mx = 0, my = 0, R = 300, seed = 'sky', calm = null } = o;
        const r = Motion.rng('sky' + seed);
        const gr = g.createRadialGradient(mx, my, R * 0.5, mx, my, Math.hypot(box.w, box.h) * 0.6);
        gr.addColorStop(0, '#36437a');
        gr.addColorStop(0.18, '#1f2a58');
        gr.addColorStop(0.5, '#121a3e');
        gr.addColorStop(1, '#0a0f28');
        g.fillStyle = gr;
        g.fillRect(box.x, box.y, box.w, box.h);
        // the air is not even: a slow drift of the blue
        softSheet(g, 60, (q) => {
            for (let i = 0; i < 40; i++) {
                const cx = box.x + r() * box.w, cy = box.y + r() * box.h, rad = 150 + r() * 400;
                q.fillStyle = r() < 0.5 ? 'rgba(40,50,100,0.18)' : 'rgba(5,8,22,0.2)';
                q.beginPath();
                q.ellipse(cx, cy, rad, rad * 0.5, r() * 3, 0, TAU);
                q.fill();
            }
        }, 'source-over');
        // cirrus: long thin streaks, silver near the moon
        softSheet(g, 6, (q) => {
            for (let i = 0; i < 9; i++) {
                const cy = box.y + r() * box.h, cx = box.x + r() * box.w, len = 300 + r() * 700, a = -0.12 + (r() - 0.5) * 0.2;
                if (calm && cx > calm.x - 200 && cx < calm.x + calm.w + 200 && cy > calm.y - 60 && cy < calm.y + calm.h + 60) continue;
                const near = smooth(R * 4, R * 1.1, Math.hypot(cx - mx, cy - my));
                // a wisp: short dabs along a drifting line, thinning at both ends
                for (let k = 0; k < 26; k++) {
                    const u = k / 25 - 0.5, px = cx + Math.cos(a) * len * u + (r() - 0.5) * 30, py = cy + Math.sin(a) * len * u + 18 * Math.sin(u * 5 + i) + (r() - 0.5) * 16;
                    const th = Math.cos(u * Math.PI);
                    q.fillStyle = `rgba(${Math.round(70 + 150 * near)},${Math.round(80 + 150 * near)},${Math.round(130 + 115 * near)},${(0.03 + 0.1 * near) * th})`;
                    q.beginPath();
                    q.ellipse(px, py, 40 + r() * 60, 6 + r() * 10 * th, a + (r() - 0.5) * 0.2, 0, TAU);
                    q.fill();
                }
            }
        }, 'source-over');
        // stars
        const n = o.n ?? 1400;
        for (let i = 0; i < n; i++) {
            const sx = box.x + r() * box.w, sy = box.y + r() * box.h, mag = Math.pow(r(), 3.2);
            const wash = smooth(R * 1.05, R * 3, Math.hypot(sx - mx, sy - my));
            if (calm && sx > calm.x && sx < calm.x + calm.w && sy > calm.y && sy < calm.y + calm.h && mag > 0.05) continue;
            const b = mag * wash;
            if (b < 0.004) continue;
            const hue = r(), col = hue < 0.15 ? [255, 214, 170] : hue < 0.3 ? [180, 200, 255] : [235, 238, 255];
            const rad = 0.5 + b * 3.2;
            if (b > 0.25) {
                const gl = g.createRadialGradient(sx, sy, 0, sx, sy, rad * 5);
                gl.addColorStop(0, `rgba(${col},${0.35 * b})`);
                gl.addColorStop(1, `rgba(${col},0)`);
                g.fillStyle = gl;
                g.fillRect(sx - rad * 5, sy - rad * 5, rad * 10, rad * 10);
            }
            g.fillStyle = `rgba(${col},${Math.min(1, 0.25 + b * 1.6)})`;
            g.beginPath();
            g.arc(sx, sy, rad, 0, TAU);
            g.fill();
        }
    }
    // The moon's halo in the haze: a glow, and a faint ring of colour (a corona).
    function halo(g, o = {}) {
        const { x = 0, y = 0, r = 300 } = o;
        const gr = g.createRadialGradient(x, y, r * 0.95, x, y, r * 2.6);
        gr.addColorStop(0, 'rgba(210,220,245,0.3)');
        gr.addColorStop(0.12, 'rgba(160,178,226,0.13)');
        gr.addColorStop(0.45, 'rgba(90,110,180,0.05)');
        gr.addColorStop(1, 'rgba(60,80,150,0)');
        g.fillStyle = gr;
        g.fillRect(x - r * 2.7, y - r * 2.7, r * 5.4, r * 5.4);
        // a faint corona: a warm ring inside a cool one, as soft as the haze makes them
        const cr = g.createRadialGradient(x, y, r * 1.2, x, y, r * 1.62);
        cr.addColorStop(0, 'rgba(230,190,150,0)');
        cr.addColorStop(0.3, 'rgba(230,196,160,0.045)');
        cr.addColorStop(0.55, 'rgba(170,200,240,0.05)');
        cr.addColorStop(1, 'rgba(150,170,230,0)');
        g.fillStyle = cr;
        g.fillRect(x - r * 1.7, y - r * 1.7, r * 3.4, r * 3.4);
    }

    // A timber (a lintel, a beam): pts its outline; adzed faces, checks along the grain, soot.
    function timber(g, pts, o = {}) {
        const Ls = lightsOf(o, 0, 0, 1, 0), sd = S.seedOf(o.seed ?? 'timber'), along = o.along ?? 0;
        const ca = Math.cos(along), sa = Math.sin(along);
        const sp = lit({
            box: S.bbox(pts, 4), res: o.res ?? resOf(g), seed: o.seed ?? 'timber', lights: Ls, amb: o.amb, shape: 'bevel', R: o.R ?? 10, relief: 1,
            mask: (q) => fillPts(q, pts),
            height: (px, py) => {
                const u = px * ca + py * sa, v = -px * sa + py * ca;
                // adze facets and checks along the grain
                const fw = worley(u / 30, v / 9, sd);
                return 1.4 * fw[0] * fw[0] * 2 - 3 * smooth(0.05, 0, Math.abs(noise2(u * 0.004, v * 0.09, sd + 1))) + 0.5 * noise2(u * 0.02, v * 0.6, sd + 2);
            },
            albedo: (px, py, d, hh, out) => {
                const u = px * ca + py * sa, v = -px * sa + py * ca;
                mixA(WOOD, WOOD_DK, 0.45 + 0.4 * noise2(u * 0.005, v * 0.3 + noise2(u * 0.01, v * 0.01, sd + 3), sd + 4), out);
                into(out, SOOT, clamp((o.soot ?? 0.5) + 0.3 * noise2(u * 0.01, v * 0.05, sd + 5)));
                out[3] = 0.25;
            },
            spec: { k: 0.2, power: 12 },
            stroke: { amp: 0.07, freq: 0.05, tone: 6 },
            edge: { rough: 1.4, freq: 0.3, amp: 0.6 },
        });
        shadow(g, sp, 0, 10, 1, { dx: 0, dy: 0, blur: 12, alpha: 0.6 });
        put(g, sp, 0, 0);
    }

    // The forge's hood: a bell of brick and lime over the hearth, black with soot, its lip
    // lit from the fire below. (x, y): the middle of its lip; w its width there.
    function hood(g, o = {}) {
        const { x = 0, y = 0, w = 600, h = 700, seed = 'hood' } = o;
        const Ls = lightsOf(o, x, y, 1, 0), sd = S.seedOf(seed);
        const pts = smoothPts([[-w / 2, 0], [-w * 0.5, -24], [-w * 0.36, -h * 0.4], [-w * 0.2, -h], [w * 0.2, -h], [w * 0.36, -h * 0.4], [w * 0.5, -24], [w / 2, 0], [0, 6]], 6);
        const sp = lit({
            box: S.bbox(pts, 6), res: o.res ?? resOf(g) * 0.6, seed, lights: Ls, amb: o.amb, shape: 'round', relief: 0.35,
            mask: (q) => fillPts(q, pts),
            height: (px, py) => {
                // courses of brick under the lime, the lip a moulding
                const brick = worley(px / 26 + (Math.floor(py / 12) % 2) * 0.5, py / 12, sd);
                return 1.2 * smooth(0.02, 0.1, brick[1] - brick[0]) + 6 * Math.exp(-(((py + 14) / 7) ** 2)) + 2 * noise2(px * 0.02, py * 0.02, sd + 1);
            },
            albedo: (px, py, d, hh, out) => {
                const n = noise2(px * 0.01, py * 0.03, sd + 2);
                mixA(LIME, LIME_OLD, 0.4, out);
                // soot: thickest up the middle where the smoke goes, streaks
                const k = clamp(0.55 + 0.4 * smooth(-30, -h * 0.5, py) + 0.25 * n + 0.2 * noise2(px * 0.06, py * 0.006, sd + 3) - 0.35 * smooth(w * 0.2, w * 0.5, Math.abs(px)));
                into(out, SOOT, k);
                if (py > -26) into(out, hex('#5a4030'), 0.4);
                out[3] = 0.2;
            },
            spec: { k: 0.15, power: 10 },
            stroke: { amp: 0.06, freq: 0.04, tone: 5 },
            edge: { rough: 2, freq: 0.15, amp: 0.7 },
        });
        g.save();
        g.translate(x, y);
        shadow(g, sp, 10, 16, 1, { dx: 0, dy: 0, blur: 22, alpha: 0.55 });
        put(g, sp, 0, 0);
        g.restore();
    }

    // A plank door, open into the cave, seen at a slant: (x, y) the middle of its hinge edge;
    // h tall at that edge, w wide on the page, `far` the scale of its far edge (perspective).
    //   1 planks of pine, each its own grain and a gap between  2 old paint, green-blue, worn
    //   to the wood at the edges and round the latch  3 rows of domed nails through the
    //   battens  4 the strap hinges  5 the latch and its thumb-lever  6 the gatera, the
    //   cat's hole at its foot  7 a horseshoe nailed on it, points up  8 a crack, a knot.
    function door(g, o = {}) {
        const { x = 0, y = 0, h = 700, w = 320, far = 1.18, seed = 'door', flip = false } = o;
        const Ls = lightsOf(o, x, y, 1, 0), sd = S.seedOf(seed), k = flip ? -1 : 1;
        // u across (0 at the hinge, 1 at the free edge), v down (−0.5 … 0.5)
        const P = (u, v) => [x + k * u * w, y + v * h * (1 + (far - 1) * u)];
        const pts = [P(0, -0.5), P(1, -0.5), P(1, 0.5), P(0, 0.5)];
        const inv = (px, py) => {
            const u = clamp((k * (px - x)) / w), v = (py - y) / (h * (1 + (far - 1) * u));
            return [u, v];
        };
        const sp = lit({
            box: S.bbox(pts, 6), res: o.res ?? resOf(g) * 0.85, seed, lights: Ls, amb: o.amb, shape: 'bevel', R: 6, relief: 1,
            mask: (q) => fillPts(q, pts),
            height: (px, py) => {
                const [u, v] = inv(px, py), pl = u * 5, gap = Math.abs(pl - Math.round(pl));
                let hh = -3 * smooth(0.04, 0, gap) + 0.6 * noise2(u * 30, v * 200, sd);
                for (const bv of [-0.36, 0.0, 0.36]) if (Math.abs(v - bv) < 0.035) hh += 3; // battens behind show as the nails' rows
                if (Math.hypot((u - 0.25) * 4, (v - 0.45) * 12) < 1) hh -= 10; // the gatera
                return hh;
            },
            albedo: (px, py, d, hh, out) => {
                const [u, v] = inv(px, py), pl = Math.floor(u * 5);
                const grain = noise2(u * 40 + pl * 7, v * 3 + noise2(u * 20, v * 10, sd + 1) * 0.6, sd + 2);
                mixA(hex('#8a6a48'), hex('#4a3420'), 0.4 + 0.4 * grain, out);
                // the old paint, worn through
                const wear = noise2(u * 9, v * 14, sd + 3) + 0.6 * smooth(0.06, 0, Math.abs(u * 5 - Math.round(u * 5))) + 0.8 * smooth(0.12, 0, Math.hypot(u - 0.88, v));
                if (wear < 0.25) mixA(out, mixA(hex('#3a6a6a'), hex('#5a8a7a'), 0.5 + 0.5 * grain, [0, 0, 0]), 0.85, out);
                if (Math.hypot((u - 0.25) * 4, (v - 0.45) * 12) < 1) mixA(out, [0.02, 0.02, 0.03], 0.95, out);
                out[3] = 0.3;
            },
            spec: { k: 0.25, power: 14 },
            stroke: { amp: 0.06, freq: 0.05, tone: 6 },
            edge: { rough: 1.2, freq: 0.3, amp: 0.5 },
        });
        put(g, sp, 0, 0);
        // the nails along the battens, the hinges, the latch
        for (const bv of [-0.36, 0.0, 0.36]) for (let i = 0; i < 9; i++) {
            const [nx, ny] = P(0.06 + i * 0.11, bv);
            nail(g, { x: nx, y: ny, s: 0.75 * (1 + (far - 1) * (0.06 + i * 0.11)), lights: Ls.map((L) => (L.P ? { ...L, P: [L.P[0], L.P[1], L.P[2]] } : L)), amb: o.amb, seed: seed + bv + i, bare: true });
        }
        for (const bv of [-0.36, 0.36]) {
            const a = P(0, bv), b = P(0.55, bv);
            put(g, ironSprite(stripOf([a, [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], b], (u) => 16 - u * 9), { res: resOf(g), seed: seed + 'hg' + bv, Ls, amb: o.amb, relief: 0.4, rust: 0.6 }), 0, 0);
        }
        const [lx, ly] = P(0.9, 0.0);
        put(g, ironSprite(smoothPts([[lx - 8, ly - 30], [lx + 8, ly - 30], [lx + 9, ly + 30], [lx - 9, ly + 30]], 3), { res: resOf(g), seed: seed + 'lt', Ls, amb: o.amb, relief: 0.5, rust: 0.5 }), 0, 0);
        const [hx, hy] = P(0.5, -0.3);
        horseshoe(g, { x: hx, y: hy, s: 0.55, fire: o.fire, moon: o.moon, amb: o.amb, worn: 1, seed: seed + 'hs' });
    }

    // ------------------------------------------------------------------ the cave
    // A surface of the cave: lime wash, coat over coat, on the hill's conglomerate (red clay
    // full of river pebbles) where it has flaked; soot; an añil-blue dado; cracks. Openings
    // are cut through it, each with its reveal (the wall's thickness, seen in perspective).
    //   box             the surface, in the caller's units (the layer's)
    //   holes           [pts, …] openings;  reveal: the reveal's width in units (0: none)
    //   wash            how much of it is whitewashed (0 … 1);  rock: lumps' height in units
    //   soot(x, y)      0 … 1, how black it is here;  dado: y where the blue band ends (or null)
    //   fire, moon, lights, amb as everywhere;  res: pixels per unit for the per-pixel pass
    //   detail(g)       drawn after, at the caller's resolution (cracks, nails, tallies)
    const LIME = hex('#ece6da'), LIME_OLD = hex('#d9cdb8'), CLAY = hex('#7a4630'), CLAY_DK = hex('#4a281c'), PEBBLE = hex('#b7a48c'), ANIL = hex('#3c5fa8'), ANIL_PALE = hex('#7d9ac8');
    function cave(g, o = {}) {
        const box = o.box, res = o.res ?? resOf(g) * 0.62, sd = S.seedOf(o.seed ?? 'cave');
        const rw = o.reveal ?? 0, rd = o.revealDepth ?? rw * 2.6, wash = o.wash ?? 0.85, rock = o.rock ?? 26;
        const Ls = lightsOf(o, 0, 0, 1, 0);
        const flakeBias = (wash - 0.5) * 1.9;
        const flakeAt = (x, y) => {
            // a cheap first look: most of a well-washed wall is far from flaking
            const a = noise2(x * 0.0045, y * 0.0045, sd + 40) * 0.7;
            if (a * 1.4 + 0.75 < flakeBias) return -1;
            return (a + fbm(x * 0.009, y * 0.009, 2, sd + 57) * 0.5) * 1.4 + 0.18 * noise2(x * 0.05, y * 0.05, sd + 41) - flakeBias;
        };
        // pebbles in the clay, of every size, not quite round
        const pebble = (x, y) => worley((x + 6 * noise2(x * 0.08, y * 0.08, sd + 16)) / 19, (y + 6 * noise2(x * 0.08 + 4, y * 0.08, sd + 17)) / 15, sd + 11);
        // a few long cracks that wander (a warped cell edge, kept only where a slow noise allows)
        const crackAt = (x, y) => {
            const mask = noise2(x * 0.005, y * 0.005, sd + 13);
            if (mask < 0.3) return 0;
            const wx = x + 60 * noise2(x * 0.004, y * 0.004, sd + 14), wy = y + 60 * noise2(x * 0.004 + 9, y * 0.004, sd + 15);
            const cw = worley(wx / 210, wy / 210, sd + 12);
            const jag = 0.012 * noise2(x * 0.15, y * 0.15, sd + 18);
            return smooth(0.022, 0.0, cw[1] - cw[0] + jag) * smooth(0.3, 0.6, mask);
        };
        const sp = lit({
            box, res, seed: o.seed ?? 'cave', lights: Ls, amb: o.amb ?? DARK, shape: 'none',
            mask: (q) => {
                q.beginPath();
                q.rect(box.x, box.y, box.w, box.h);
                for (const h of o.holes ?? []) S.trace(q, h);
                q.fill('evenodd');
            },
            height: (x, y, d) => {
                let hh = rock * fbm(x / 300, y / 300, 2, sd) + 7 * noise2(x / 80, y / 80, sd + 5) * 0.6;
                // the pick's facets, dug by hand, under the lime
                const pk = worley(x / 24 + 0.4 * noise2(x * 0.01, y * 0.01, sd + 6), y / 34, sd + 6);
                const flat = rw ? smooth(rw * 0.9, rw * 1.3, d) : 1;
                hh += 2.6 * pk[0] * pk[0] * flat;
                // the lime laid on with a broom: short streaks this way and that, coat over coat
                const bd = 0.6 + noise2(x * 0.002, y * 0.002, sd + 8) * 0.9;
                hh += flat * (0.55 * noise2((x * Math.cos(bd) + y * Math.sin(bd)) * 0.02, (y * Math.cos(bd) - x * Math.sin(bd)) * 0.11, sd + 7) + 0.5 * noise2(x * 0.6, y * 0.6, sd + 9));
                // where the coats have flaked: a step down to the clay and its pebbles
                const f = flakeAt(x, y);
                if (f > 0) {
                    hh -= 2.6 * smooth(0, 0.04, f);
                    const ww = pebble(x, y);
                    if (ww[2] < 0.3) hh += (2 + 5 * ww[2]) * Math.sqrt(Math.max(0, 1 - (ww[0] / (0.12 + 0.5 * ww[2])) ** 2)) * smooth(0.06, 0.12, f);
                }
                hh -= 2.6 * crackAt(x, y);
                // the reveal of an opening: the wall turns back into its thickness
                if (rw) hh -= rd * (1 - smooth(0, rw, d)) ** 1.4 * (1 + 0.04 * noise2(x * 0.01, y * 0.01, sd + 27));
                return hh;
            },
            albedo: (x, y, d, hh, out) => {
                const n = noise2(x * 0.02, y * 0.02, sd + 20), f = flakeAt(x, y);
                mixA(LIME, LIME_OLD, 0.3 + 0.3 * n, out);
                if (rw && o.revealRock && d < rw) {
                    // in the wall's thickness the lime gives out: the hill's own stone, worn smooth
                    const k = smooth(rw * 0.75, rw * 0.25, d + 14 * noise2(x * 0.02, y * 0.02, sd + 31));
                    into(out, mixA(hex('#6a5444'), hex('#3a2c26'), 0.5 + 0.5 * noise2(x * 0.06, y * 0.06, sd + 32), [0, 0, 0]), k * 0.85);
                }
                // a drip or a run of lime, a yellower old coat showing at the edge of a flake
                into(out, LIME_OLD, smooth(-0.08, 0, f) * 0.6);
                if (f > 0 && f < 0.05) into(out, hex('#c8a46a'), 0.6); // an old ochre coat under the white
                if (o.earth) {
                    // ploughed earth, not lime: dark brown, drier on the clods' tops
                    mixA(hex('#4a3a30'), hex('#2a221e'), 0.5 + 0.5 * noise2(x * 0.03, y * 0.03, sd + 30), out);
                    out[3] = 0.1;
                    return;
                }
                if (f > 0) {
                    const k = smooth(0.04, 0.08, f);
                    const pb = pebble(x, y);
                    const peb = pb[2] < 0.3 && pb[0] < 0.12 + 0.5 * pb[2];
                    const clay = mixA(CLAY, CLAY_DK, 0.5 + 0.5 * noise2(x * 0.05, y * 0.05, sd + 21), [0, 0, 0]);
                    if (peb) {
                        // river pebbles of the Darro: quartzite, schist, a white one, a red one
                        const kind = hashI(Math.floor(pb[3] * 9), Math.floor(pb[4] * 9), 5, sd);
                        mixA(kind < 0.3 ? PEBBLE : kind < 0.55 ? [0.36, 0.36, 0.38] : kind < 0.75 ? [0.84, 0.8, 0.72] : [0.6, 0.34, 0.26], CLAY_DK, smooth(0.2, 0.0, pb[0] / (0.12 + 0.5 * pb[2])) * 0.0 + 0.15, clay);
                    }
                    into(out, clay, k);
                }
                if (o.dado != null) {
                    const top = o.dado + 9 * noise2(x * 0.01, 0, sd + 22) + 3 * noise2(x * 0.08, 0, sd + 23);
                    if (y > top && f < 0.02) {
                        mixA(ANIL, ANIL_PALE, smooth(-0.6, 0.8, noise2(x * 0.015, y * 0.015, sd + 24)) * 0.6, out);
                        // the blue rubbed off along the top by shoulders and chairs
                        into(out, LIME_OLD, smooth(top + 22, top, y) * 0.25 * (0.5 + 0.5 * n));
                    }
                }
                if (o.soot) {
                    const sAmt = clamp(o.soot(x, y) * (0.75 + 0.35 * noise2(x * 0.008, y * 0.03, sd + 25) + 0.15 * noise2(x * 0.06, y * 0.2, sd + 26)));
                    into(out, SOOT, sAmt);
                    out[3] = 1 - sAmt * 0.6;
                }
                // lime is matt; a wet clay or a polished pebble has a little sheen
                out[3] *= 0.25 + (f > 0 ? 0.5 : 0);
            },
            spec: { k: 0.12, power: 12 },
            stroke: { amp: 0.07, freq: 0.035, tone: 1.2 },
            edge: { rough: 2.2, freq: 0.12, amp: 0.7 },
            marks: o.marks,
        });
        put(g, sp, 0, 0);
        if (o.detail) o.detail(g);
        return sp;
    }

    // ------------------------------------------------------------------ the moon
    const sph = (lon, lat) => [Math.cos(lat * DEG) * Math.sin(lon * DEG), -Math.sin(lat * DEG), Math.cos(lat * DEG) * Math.cos(lon * DEG)];
    // the seas: [lon°, lat°, radius°, darkness, hue (−1 blue … 1 brown)]
    const SEAS = [
        [-16, 33, 18.5, 1, 0.1], [-24, 41, 9, 0.9, 0.1], [-4, 26, 7, 0.7, 0.2], // Imbrium and its bays
        [-57, 18, 17, 1, -0.4], [-48, 33, 11, 0.85, -0.5], [-62, 2, 11, 0.85, -0.3], [-45, -3, 10, 0.75, -0.3], [-70, 28, 8, 0.75, -0.4], [-34, 12, 9, 0.8, -0.2], // Procellarum
        [17.5, 28, 10.5, 0.95, 0.6], [31, 8.5, 13.5, 1, -0.8], [24, 18, 5, 0.8, -0.2], // Serenitatis, Tranquillitatis
        [59, 17, 8.8, 1, 0.2], [51, -6, 9, 0.85, 0.3], [56, -18, 6, 0.7, 0.3], [35, -15, 5.6, 0.9, 0.1], // Crisium, Fecunditatis, Nectaris
        [-17, -21, 11.5, 0.9, 0.2], [-23, -10, 5, 0.75, 0.1], [-39, -24, 6.4, 0.95, 0.2], [-31, 7, 7.5, 0.7, 0], // Nubium, Cognitum, Humorum, Insularum
        [3.6, 13, 4, 0.75, 0.3], [2, 2, 2.6, 0.6, 0.2], [27, 37, 5, 0.6, 0.3], // Vaporum, Sinus Medii, Somnii-Lacus
        [-30, 56, 5.5, 0.65, 0.1], [-12, 57, 5, 0.65, 0.1], [6, 56, 5.5, 0.65, 0.1], [24, 56, 5, 0.6, 0.1], [40, 57, 4, 0.5, 0.1], // Frigoris
        [86, 13, 4, 0.7, 0], [87, 1, 4.5, 0.7, 0], [80, -38, 4, 0.5, 0], [-9.3, 51.6, 1.6, 1.1, 0], [-68.6, -5.2, 2.8, 1.1, 0], // the limb, Plato, Grimaldi
    ].map(([lon, lat, rad, k, hue]) => ({ v: sph(lon, lat), rad: rad * DEG, k, hue }));
    // rayed craters: [lon, lat, radius°, brightness, rays, ray reach (rad)]
    const RAYED = [
        [-11.4, -43.3, 1.4, 1, 1, 1.2], [-20.1, 9.6, 1.5, 0.85, 0.75, 0.55], [-38, 8.1, 0.55, 0.8, 0.6, 0.35], [-47.5, 23.7, 0.65, 1.15, 0.3, 0.2],
        [47, 16.1, 0.45, 0.8, 0.45, 0.3], [-61, -5, 0.6, 0.5, 0.2, 0.18], [33, -2, 0.4, 0.5, 0.2, 0.15], [9, 14.5, 0.6, 0.55, 0, 0], [16, 16.3, 0.4, 0.6, 0, 0],
        [-3.2, -13, 0.6, 0.35, 0, 0], [-1.9, -9.3, 2.4, 0.25, 0, 0], [26.4, -11.4, 1.6, 0.45, 0, 0], [61, -8.9, 2.2, 0.45, 0, 0], [60, -25, 2.8, 0.4, 0, 0], [-14, -58.4, 3.8, 0.3, 0, 0], [-4, 29.7, 1.4, 0.3, 0, 0], [29.9, 31.8, 1.6, 0.3, 0, 0],
        [17.4, 50.2, 1.4, 0.35, 0, 0], [-11.3, 14.5, 1, 0.35, 0, 0], [-6, -40, 1.2, 0.3, 0, 0], [40, -20, 1.2, 0.3, 0, 0],
    ].map(([lon, lat, rad, k, rays, reach]) => ({ v: sph(lon, lat), rad: rad * DEG, k, rays, reach, lon, lat }));

    // The full moon as a lit sphere, its centre at (x, y), radius r. Painted per pixel once.
    function moonSprite(r, res, o) {
        const pad = 2;
        const box = { x: -r - pad, y: -r - pad, w: 2 * (r + pad), h: 2 * (r + pad) };
        const w = Math.ceil(box.w * res), h = Math.ceil(box.h * res);
        const c = canvas(w, h), g = c.getContext('2d');
        const im = g.createImageData(w, h), px = im.data;
        const k = r * res;
        const Lm = (() => {
            const L = o.light ?? [-0.22, -0.26, 0.94], l = Math.hypot(...L);
            return L.map((v) => v / l);
        })();
        // ray directions for each rayed crater (great circles leaving it)
        const rayDirs = RAYED.map((cr, ci) => {
            const n = Math.round(10 + cr.rays * 18), list = [];
            for (let j = 0; j < n; j++) list.push({ a: hashI(j, ci, 1, 77) * TAU, w: 0.012 + hashI(j, ci, 2, 77) * 0.03, len: cr.reach * (0.35 + hashI(j, ci, 3, 77) * 0.9), k: 0.4 + hashI(j, ci, 4, 77) * 0.6 });
            return list;
        });
        // local tangent frames of the craters
        const frames = RAYED.map((cr) => {
            const v = cr.v, up = Math.abs(v[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
            let e1 = [up[1] * v[2] - up[2] * v[1], up[2] * v[0] - up[0] * v[2], up[0] * v[1] - up[1] * v[0]];
            const l1 = Math.hypot(...e1);
            e1 = e1.map((q) => q / l1);
            const e2 = [v[1] * e1[2] - v[2] * e1[1], v[2] * e1[0] - v[0] * e1[2], v[0] * e1[1] - v[1] * e1[0]];
            return { e1, e2 };
        });
        const HIGH = [0.88, 0.85, 0.78], SEA = [0.53, 0.53, 0.55], SEA_BLUE = [0.47, 0.5, 0.58], SEA_BROWN = [0.6, 0.55, 0.5];
        const col = [0, 0, 0];
        for (let j = 0, i = 0; j < h; j++) {
            for (let ii = 0; ii < w; ii++, i++) {
                const X = (box.x + (ii + 0.5) / res) / r, Y = (box.y + (j + 0.5) / res) / r;
                const rho2 = X * X + Y * Y;
                if (rho2 > 1.0 + 3 / k) continue;
                const rho = Math.sqrt(rho2), edge = clamp((1 - rho + 0.0035 * noise2(X * 40, Y * 40, 81)) * k * 0.9 + 0.5);
                if (edge <= 0) continue;
                const q = rho > 1 ? 1 / rho : 1, mx = X * q, my = Y * q, mz = Math.sqrt(Math.max(0, 1 - Math.min(1, rho2)));
                // the point is moved a little by a slow field first, so no sea is a circle
                const wx = mx + 0.075 * noise3(mx * 3.1, my * 3.1, mz * 3.1, 71) + 0.03 * noise3(mx * 9, my * 9, mz * 9, 72);
                const wy = my + 0.075 * noise3(mx * 3.1 + 5, my * 3.1, mz * 3.1, 73) + 0.03 * noise3(mx * 9 + 5, my * 9, mz * 9, 74);
                const wz = mz + 0.05 * noise3(mx * 3.1, my * 3.1 + 5, mz * 3.1, 75);
                const wlen = Math.hypot(wx, wy, wz) || 1, ax = wx / wlen, ay = wy / wlen, az = wz / wlen;
                let field = 0, hue = 0, hw = 0, floor = 0;
                for (const b of SEAS) {
                    const dd = ax * b.v[0] + ay * b.v[1] + az * b.v[2];
                    if (dd < 0.5) continue;
                    const a = Math.acos(Math.min(1, dd)), s1 = smooth(b.rad * 1.35, b.rad * 0.35, a) * Math.min(1, b.k);
                    field += s1 - field * s1;
                    hue += b.hue * s1;
                    hw += s1;
                    if (b.k > 1) floor = Math.max(floor, smooth(b.rad * 1.1, b.rad * 0.7, a));
                }
                hue = hw > 0 ? hue / hw : 0;
                // the shore: crisp in places, frayed in others
                const shore = 0.1 + 0.12 * (0.5 + 0.5 * noise3(mx * 5, my * 5, mz * 5, 76));
                let sea = smooth(0.45 - shore, 0.45 + shore, field + 0.16 * noise3(mx * 14, my * 14, mz * 14, 77) + 0.07 * noise3(mx * 40, my * 40, mz * 40, 78));
                // the seas are not even: flows of other tones, wrinkle ridges
                sea *= 0.62 + 0.3 * (0.5 + 0.5 * noise3(mx * 6 + 2, my * 6, mz * 6, 33)) + 0.14 * noise3(mx * 19, my * 19, mz * 19, 36);
                sea = Math.min(1.1, sea + floor * 0.35);
                // the cores of the great basins are darker than their margins
                sea *= 0.8 + 0.3 * smooth(0.5, 0.95, field);
                const ridge = Math.abs(noise3(mx * 16, my * 16, mz * 16, 35));
                // highlands: small craters, more of them in the south, rims light, floors darker
                let cr = 0;
                const south = 0.6 + 0.6 * smooth(-0.2, 0.7, my);
                for (const [sc, amp, sdx] of [[20, 0.05, 50], [52, 0.032, 51]]) {
                    const u = mx * sc + mz * 0.37 * sc, v = my * sc + mz * 0.21 * sc;
                    const ww = worley(u, v, sdx);
                    if (ww[2] > 0.55 * south) continue;
                    const size = 0.12 + 0.32 * (ww[2] / 0.55);
                    if (ww[0] < size * 1.3) {
                        const t = ww[0] / size, sharp = 0.08 + 0.2 * hashI(Math.floor(u), Math.floor(v), 7, sdx);
                        cr += amp * (t < 1 ? -0.45 * (1 - t) * (1 - t) + 0.9 * Math.exp(-(((t - 0.95) / sharp) ** 2)) * (0.4 + 0.6 * smooth(-0.3, 0.6, (mx - ww[3] / sc) * -3 + (my - ww[4] / sc) * -3)) : 0.2 * smooth(1.3, 1, t)) * (1 - 0.75 * sea);
                    }
                }
                // small fresh craters: bright points with a halo, everywhere, fewer in the seas
                {
                    const sc = 70, u = mx * sc + mz * 0.3 * sc, v = my * sc + mz * 0.2 * sc, ww = worley(u, v, 59);
                    if (ww[2] < 0.06) cr += 0.12 * smooth(0.22, 0.05, ww[0]) + 0.04 * smooth(0.5, 0.2, ww[0]);
                }
                // wrinkle ridges in the seas: thin, pale, wandering
                if (sea > 0.3) {
                    const rg = Math.abs(noise3(mx * 11 + 7, my * 11, mz * 11, 37));
                    cr += 0.05 * smooth(0.06, 0.0, rg) * sea;
                }
                // the young craters and their rays: feathered, broken, fading out
                let bright = 0;
                RAYED.forEach((b, ci) => {
                    const dd = mx * b.v[0] + my * b.v[1] + mz * b.v[2];
                    if (dd < 0.2) return;
                    const a = Math.acos(Math.min(1, dd));
                    if (a < b.rad * 4) {
                        const t = a / b.rad;
                        bright += b.k * (0.3 * Math.exp(-(((t - 1) / 0.28) ** 2)) + 0.2 * smooth(3.5, 1, t) - (b.rays ? 0.06 : 0.18) * smooth(0.9, 0.3, t));
                    }
                    if (!b.rays || a > b.reach * 1.3) return;
                    const F = frames[ci], tx = mx - b.v[0] * dd, ty = my - b.v[1] * dd, tz = mz - b.v[2] * dd;
                    const ang = Math.atan2(tx * F.e2[0] + ty * F.e2[1] + tz * F.e2[2], tx * F.e1[0] + ty * F.e1[1] + tz * F.e1[2]);
                    let ray = 0;
                    const nA = 0.07 * noise2(a * 9, ang * 2, 63 + ci), nW = 1 + 0.7 * noise2(a * 22, ang * 6, 61 + ci), nB = 0.4 + 0.6 * smooth(-0.3, 0.5, noise2(a * 30, ang * 8, 64 + ci));
                    const wk = nW / Math.max(0.25, a / b.reach + 0.2);
                    for (const R of rayDirs[ci]) {
                        let da = Math.abs(ang - R.a + nA);
                        if (da > Math.PI) da = TAU - da;
                        const wa = R.w * 2.2 * wk;
                        if (da < wa * 3 && a < R.len * 1.1) ray += R.k * Math.exp(-((da / wa) ** 2)) * smooth(R.len, R.len * 0.2, a);
                    }
                    ray *= nB;
                    bright += b.k * Math.min(1, ray) * 0.34 * smooth(b.rad * 1.2, b.rad * 3, a);
                });
                // paint: highland or sea, then the light on the sphere
                mixA(HIGH, SEA, Math.min(1, sea), col);
                if (sea > 0.05) into(col, hue < 0 ? SEA_BLUE : SEA_BROWN, Math.min(1, Math.abs(hue)) * Math.min(1, sea) * 0.7);
                const grain = 0.04 * noise3(mx * 60, my * 60, mz * 60, 41) + 0.03 * noise3(mx * 140, my * 140, mz * 140, 42);
                let v = 1 + cr + bright * (1 - 0.3 * sea) + grain - sea * 0.06 * ridge;
                // a full moon is lit almost from the eye: a gentle fall to the limb, which is warmer
                const ndl = Math.max(0, mx * Lm[0] + my * Lm[1] + mz * Lm[2]);
                const lam = 0.55 + 0.45 * Math.pow(ndl, 0.6);
                const limb = Math.pow(mz, 0.22);
                v *= lam * (0.78 + 0.22 * limb);
                let rr = col[0] * v * 1.08, gg = col[1] * v * 1.08, bb = col[2] * v * 1.1;
                // the limb warms and the middle cools, as the eye sees it through the haze
                const wl = (1 - limb) * 0.5;
                rr += 0.05 * wl;
                bb -= 0.06 * wl;
                const sh = (z) => (z < 0.86 ? Math.max(0, z) : 0.86 + 0.14 * (1 - Math.exp(-(z - 0.86) / 0.14)));
                px[i * 4] = 255 * sh(rr);
                px[i * 4 + 1] = 255 * sh(gg);
                px[i * 4 + 2] = 255 * sh(bb);
                px[i * 4 + 3] = 255 * edge;
            }
        }
        g.putImageData(im, 0, 0);
        // the hand in the paint: strokes that follow her forms, a slow drift of the mix
        S.brushwork(c, { amp: 0.045, len: 4, drift: 0.02, warm: 0.015, seed: 9, k: res });
        return { canvas: c, box };
    }
    const moonCache = new Map();
    function moon(g, o = {}) {
        const { x = 0, y = 0, r = 300 } = o;
        const res = resOf(g, 1);
        const key = r + '@' + res;
        if (!moonCache.has(key)) moonCache.set(key, moonSprite(r, res, o));
        const sp = moonCache.get(key);
        g.drawImage(sp.canvas, x + sp.box.x, y + sp.box.y, sp.box.w, sp.box.h);
    }

    // ------------------------------------------------------------------ round 8 · the matter, loose
    // The forge's body broken into single pieces that float (Tableau.forge.loose). Each is
    // whole, lit by the same fire (lights in the caller's units, like every drawer here).
    //
    //   COAL (`coal`) · lumps from the fire, two kinds. Forge coal: 1 black, glassy facets
    //   meeting at sharp ridges  2 a glint on the facets that face the fire  3 conchoidal
    //   breaks (shallow scoops)  4 cracks that glow where it is still alight, brightest deep in
    //   5 the glow dull red at a crack's ends, yellow at its heart  6 white-grey ash on the
    //   faces that have cooled  7 a clinker bead, glassy, stuck to one. Charcoal (carbón de
    //   encina): 8 the wood's growth rings and rays still in its end  9 checks across the grain
    //   10 a dull, velvety black, silvered where it rubbed.
    //
    //   COPPER SCRAP (`offcut`) · what the coppersmith cuts away and what he has not yet
    //   raised. 'sheet': 1 two edges sheared straight, the others torn or snipped in short
    //   cuts  2 the shear's burr, a bright line along the cut  3 a rivet hole punched, its lip
    //   pushed out  4 planishing facets on part of it  5 the scriber's line where the next cut
    //   was marked  6 fire-scale bands, straw and purple  7 a fingerprint of oxide  8 a corner
    //   bent up. 'blank': 9 a disc cut for a pan, the first ring of hammer marks, its edge
    //   filed  10 the dividers' centre-punch in the middle. 'strip': a curl of copper off the
    //   shears, twisting so it takes the light in bands.
    //
    //   HORSESHOE NAILS (`hsnails`) · 1 the head a tapered wedge, its top flat and struck
    //   2 the shank square, tapering to a bevelled point  3 the bevel on one side only (it
    //   turns the nail outward through the wall)  4 forge-black, bright where the die bit
    //   5 one bent where it was clinched and pulled  6 a burr at the point.
    //
    //   BAR (`bar`) · iron bar stock being drawn out: 1 square section with rounded arrises
    //   2 mill scale flaking off in plates  3 hammer flats along the drawn part  4 the end
    //   tapered to a point (or scrolled)  5 the heat: white-yellow at the end, through orange
    //   and cherry to dull red and then black  6 scale lifting off the hot part in flakes
    //   7 a chisel mark where the length was marked.

    // A lump of coal (kind 'coal') or charcoal ('charcoal'), (x, y) its middle, r its size;
    // heat 0 … 1: how much it is still alight.
    function coal(g, o = {}) {
        const { x = 0, y = 0, r = 40, rot = 0, seed = 'coal', heat = 0.5, kind = 'coal' } = o;
        const res = resOf(g, 1.2), sd = S.seedOf(seed), rnd = Motion.rng('coal' + seed), Ls = lightsOf(o, x, y, 1, rot);
        const n = 7 + Math.floor(rnd() * 5), pts = [], sq = 0.7 + rnd() * 0.3;
        for (let i = 0; i < n; i++) {
            const a = (i / n) * TAU + (rnd() - 0.5) * 0.45, rr = r * (0.72 + rnd() * 0.42);
            pts.push([Math.cos(a) * rr, Math.sin(a) * rr * sq]);
        }
        const P = smoothPts(pts, 2);
        const char = kind === 'charcoal', cell = r * (char ? 0.9 : 0.55);
        // each facet a plane with its own tilt (forge coal); charcoal is rounder, its end ringed
        const facet = (px, py) => {
            const w = worley(px / cell, py / cell, sd);
            const t1 = hashI(Math.round(w[3] * 7), Math.round(w[4] * 7), 1, sd) - 0.5, t2 = hashI(Math.round(w[3] * 7), Math.round(w[4] * 7), 2, sd) - 0.5;
            return [w, (px - w[3] * cell) * t1 * 0.6 + (py - w[4] * cell) * t2 * 0.6];
        };
        const ringC = [r * (rnd() - 0.5) * 0.6, r * (rnd() - 0.5) * 0.6];
        const sp = lit({
            box: S.bbox(P, 3), res, seed, lights: Ls, amb: o.amb, shape: 'round', relief: char ? 0.55 : 0.42, smoothH: char ? 0.6 : 0,
            mask: (q) => fillPts(q, P),
            height: (px, py) => {
                const [w, pl] = facet(px, py);
                let hh = char ? 0.4 * noise2(px * 0.3, py * 0.3, sd + 2) : pl;
                // the cracks, cut deep
                const cr = w[1] - w[0];
                hh -= (char ? 3 : 4) * smooth(0.09, 0.0, cr);
                if (char) {
                    const rr = Math.hypot(px - ringC[0], py - ringC[1]);
                    hh += 0.5 * Math.sin(rr * 1.6 + 2 * noise2(px * 0.1, py * 0.1, sd + 3));
                    // checks across the grain: radial splits
                    const a = Math.atan2(py - ringC[1], px - ringC[0]);
                    hh -= 2.2 * smooth(0.06, 0.0, Math.abs(Math.sin(a * 3.5 + noise2(rr * 0.05, 0, sd + 4)))) * smooth(r * 0.1, r * 0.3, rr);
                } else {
                    // conchoidal scoops
                    const c = worley(px / (r * 0.3) + 3, py / (r * 0.3), sd + 5);
                    hh += 1.4 * c[0] * c[0];
                }
                return hh;
            },
            albedo: (px, py, d, hh, out) => {
                const [w] = facet(px, py), id = w[2], cr = w[1] - w[0];
                if (char) mixA([0.05, 0.045, 0.05], [0.14, 0.13, 0.14], 0.3 * noise2(px * 0.2, py * 0.2, sd + 6) + 0.25, out);
                else mixA([0.025, 0.025, 0.032], [0.075, 0.075, 0.09], id, out);
                out[3] = char ? 0.25 : 0.6 + 0.6 * id;
                // ash on the cooled faces: grey-white in a crust, more on the side away from the heat
                const ash = smooth(0.15, 0.6, noise2(px * 0.08, py * 0.08, sd + 7) + 0.4 * (1 - heat)) * (char ? 0.7 : 0.5);
                into(out, [0.62, 0.6, 0.58], ash * 0.8);
                if (ash > 0.4) out[3] = 0.1;
                // charcoal rubbed silver at its edge
                if (char && d < 2.5) into(out, [0.38, 0.38, 0.4], 0.4 * smooth(0, 0.6, noise2(px * 0.3, py * 0.3, sd + 8)));
                // a clinker bead
                if (!char && Math.hypot(px - r * 0.3, py + r * 0.2) < r * 0.12) {
                    mixA(out, [0.22, 0.2, 0.26], 0.8, out);
                    out[3] = 2;
                }
                // alight: the cracks and the ends of the grain glow, hottest deep in
                if (heat > 0) {
                    // alight in patches, not along every crack: a crack glows only where the
                    // patch is, and a few faces smoulder through the ash
                    const live = heat * smooth(0.05, 0.55, noise2(px * 0.035, py * 0.035, sd + 9) + heat * 0.35);
                    const crackOn = smooth(0.0, 0.4, noise2(px * 0.09, py * 0.09, sd + 10));
                    const k = clamp(live * (smooth(0.07, 0.0, cr) * 1.15 * crackOn + (ash < 0.3 ? 0.22 * smooth(0.75, 1, hashI(Math.round(w[3] * 5), Math.round(w[4] * 5), 3, sd)) : 0)));
                    if (k > 0.01) HOT(k, out);
                }
            },
            spec: { k: char ? 0.2 : 0.75, power: char ? 12 : 60, broad: char ? 0 : 0.04, broadPow: 4 },
            stroke: { amp: 0.05, freq: 0.12, tone: 4 },
            edge: { rough: 0.9, freq: 0.4, amp: 0.5 },
        });
        g.save();
        g.translate(x, y);
        g.rotate(rot);
        put(g, sp, 0, 0);
        g.restore();
        // a breath of glow round a live lump
        if (heat > 0.45) {
            softSheet(g, r * 0.25, (q) => {
                const gr = q.createRadialGradient(x, y, 0, x, y, r * 1.5);
                gr.addColorStop(0, `rgba(255,110,30,${0.22 * heat})`);
                gr.addColorStop(1, 'rgba(160,40,10,0)');
                q.fillStyle = gr;
                q.fillRect(x - r * 1.6, y - r * 1.6, r * 3.2, r * 3.2);
            });
        }
    }

    // Copper scrap: kind 'sheet' | 'blank' | 'strip'. (x, y) its middle, `size` across.
    function offcut(g, o = {}) {
        const { x = 0, y = 0, size = 120, rot = 0, seed = 'offcut', kind = 'sheet' } = o;
        const res = resOf(g, 1), sd = S.seedOf(seed), rnd = Motion.rng('offcut' + seed), Ls = lightsOf(o, x, y, 1, rot), R = size / 2;
        let pts, height, extra;
        const scale = (px, py, out) => {
            // copper, each facet oxidised its own way, scale in bands, oxide where it was handled
            const n1 = noise2(px * 0.03, py * 0.03, sd + 1), n2 = noise2(px * 0.12, py * 0.12, sd + 2);
            mixA(COPPER, COPPER_HI, 0.3 + 0.3 * (n2 * 0.5 + 0.5), out);
            into(out, OXIDE, smooth(-0.1, 0.6, n1) * 0.5);
            const band = Math.sin((px * 0.7 + py * 0.4) * 0.07 + n1 * 3);
            into(out, band > 0.3 ? STRAW : PURPLE, 0.28 * smooth(0.3, 0.9, Math.abs(band)) * smooth(-0.2, 0.4, noise2(px * 0.02, py * 0.02, sd + 3)));
            if (hashI(Math.floor(px * 0.08), Math.floor(py * 0.08), 4, sd) > 0.93) into(out, VERD, 0.45 * smooth(0.2, 0.8, noise2(px * 0.3, py * 0.3, sd + 5)));
            // fine scratches from the bench: bright hairlines
            const sc = Math.abs(Math.sin(px * 0.9 * Math.cos(sd) + py * 0.9 * Math.sin(sd) + 4 * noise2(px * 0.01, py * 0.01, sd + 6)));
            if (sc < 0.025 && noise2(px * 0.05, py * 0.05, sd + 7) > 0.2) into(out, COPPER_HI, 0.6);
        };
        if (kind === 'blank') {
            pts = [];
            for (let i = 0; i < 72; i++) {
                const a = (i / 72) * TAU, rr = R * (1 + 0.012 * Math.sin(a * 23 + sd));
                pts.push([Math.cos(a) * rr, Math.sin(a) * rr]);
            }
            height = (px, py) => {
                const rr = Math.hypot(px, py), th = Math.atan2(py, px);
                const ww = ringWorley(rr, th, 7 + (sd % 3), sd);
                return 0.45 * (px * 0.6 - py * 0.8) * (0.5 + (sd % 7) / 10) + 1.6 * ww[0] * ww[0] * smooth(R * 0.55, R * 0.65, rr) * smooth(R * 0.92, R * 0.82, rr) + 1.2 * smooth(R * 0.96, R, rr) - 1.5 * smooth(2.2, 0.8, rr) + 0.25 * noise2(px * 0.2, py * 0.2, sd);
            };
            extra = (px, py, d, out) => {
                // the filed edge, bright; the dividers' circle scribed
                const rr = Math.hypot(px, py);
                if (d < 1.6) into(out, COPPER_HI, 0.7);
                if (Math.abs(rr - R * 0.6) < 0.5) into(out, [0.3, 0.16, 0.1], 0.5);
                if (rr < 1.5) mixA(out, [0.1, 0.05, 0.03], 0.8, out);
            };
        } else if (kind === 'strip') {
            // a curl: a spiral that opens, its width twisting
            const path = [], turns = 1.2 + rnd() * 0.9, a0 = rnd() * TAU;
            const sq = 0.65 + 0.2 * rnd();
            for (let i = 0; i <= 140; i++) {
                const u = i / 140, a = a0 + u * turns * TAU, rr = R * (0.25 + 0.75 * u);
                path.push([Math.cos(a) * rr, Math.sin(a) * rr * sq]);
            }
            const wd = size * (0.1 + rnd() * 0.05);
            // the twist: its seen width swells and narrows smoothly (never to nothing)
            pts = stripOf(path, (u) => wd * (0.62 + 0.38 * Math.cos(u * turns * TAU * 0.5 + 0.6)) + 2.5);
            const acc = path.map((p, i) => i / 60);
            height = (px, py, d) => 1.6 * Math.min(1, d / 3) + 0.2 * noise2(px * 0.3, py * 0.3, sd);
            extra = (px, py, d, out) => {
                // the twist: bands of light and shade along the curl
                const a = Math.atan2(py, px), rr = Math.hypot(px, py);
                const tw = Math.sin(a * 2 + rr * 0.08 + sd);
                into(out, tw > 0 ? COPPER_HI : OXIDE, 0.35 * Math.abs(tw));
                if (d < 1.2) into(out, [1, 0.8, 0.6], 0.5); // the sheared edge
                void acc;
            };
        } else {
            // a sheet offcut: sheared straight on two sides, snipped and torn on the others
            const a = rnd() * TAU, c = [];
            c.push([-R, -R * (0.5 + rnd() * 0.3)], [R * (0.6 + rnd() * 0.4), -R * (0.6 + rnd() * 0.3)]); // the straight shear
            const steps = 5 + Math.floor(rnd() * 4);
            for (let i = 1; i < steps; i++) {
                const u = i / steps; // the snipped edge: short cuts, each a facet
                c.push([R * (0.7 + 0.25 * rnd()) * Math.cos(u * 1.6 - 0.6) + R * 0.2, -R * 0.6 + u * R * 1.7 + (rnd() - 0.5) * 8]);
            }
            c.push([-R * (0.2 + rnd() * 0.4), R * (0.8 + rnd() * 0.2)], [-R * (0.9 + rnd() * 0.1), R * (0.3 + rnd() * 0.3)]);
            pts = c.map(([px, py]) => [px * Math.cos(a) - py * Math.sin(a), px * Math.sin(a) + py * Math.cos(a)]);
            const hole = [R * (rnd() - 0.5) * 0.8, R * (rnd() - 0.5) * 0.8], hr = 3 + rnd() * 3;
            const L0 = Ls[0], away = L0 && L0.P ? Math.atan2(-L0.P[1], -L0.P[0]) : rnd() * TAU;
            const bend = rnd() < 0.5, bendDir = rnd() * TAU, cell = 7 + rnd() * 4, plan = rnd() * TAU, tilt = 0.2 + rnd() * 0.25, tiltDir = away + (rnd() - 0.5) * 2.4;
            height = (px, py) => {
                // a planished part, a corner bent up, the hole's lip pushed out
                // the sheet lies tilted, so it is not a mirror held up to the fire
                let hh = tilt * (px * Math.cos(tiltDir) + py * Math.sin(tiltDir));
                const ww = worley(px / cell, py / cell, sd);
                hh += 1.4 * ww[0] * ww[0] * smooth(-0.2, 0.3, Math.cos(Math.atan2(py, px) - plan));
                if (bend) hh += 0.25 * Math.max(0, px * Math.cos(bendDir) + py * Math.sin(bendDir) - R * 0.3);
                const hd = Math.hypot(px - hole[0], py - hole[1]);
                hh += 1.5 * smooth(hr + 3, hr, hd);
                return hh;
            };
            extra = (px, py, d, out) => {
                if (d < 1.4) into(out, [1, 0.82, 0.62], 0.55); // the shear's burr
                // the scriber's line for the next cut
                const sl = px * Math.cos(plan + 1) + py * Math.sin(plan + 1) - R * 0.25;
                if (Math.abs(sl) < 0.45) into(out, [0.85, 0.7, 0.55], 0.6);
                // an oxide fingerprint: whorls
                const fx = px - R * 0.1, fy = py + R * 0.25, fr = Math.hypot(fx * 1.2, fy);
                if (fr < 9 && Math.sin(fr * 2.4 + Math.atan2(fy, fx) * 0.3) > 0.55) into(out, OXIDE, 0.35);
            };
            const base = pts;
            pts = base;
            extra.hole = [hole, hr];
        }
        const P = kind === 'sheet' ? pts : pts;
        const sp = lit({
            box: S.bbox(P, 4), res, seed, lights: Ls, amb: o.amb, shape: kind === 'strip' ? 'none' : 'bevel', R: 1.5, relief: 1, metal: 1, smoothH: kind === 'sheet' ? 0 : 0,
            mask: (q) => {
                q.beginPath();
                S.trace(q, P);
                if (extra.hole) {
                    const [[hx, hy], hr] = extra.hole;
                    q.moveTo(hx + hr, hy);
                    q.arc(hx, hy, hr, 0, TAU);
                }
                q.fill('evenodd');
            },
            height,
            albedo: (px, py, d, hh, out) => {
                scale(px, py, out);
                // offcuts lie about the bench: duller than a planished pan, oxide in a skin
                if (kind !== 'strip') into(out, OXIDE, 0.28 + 0.2 * smooth(-0.4, 0.6, noise2(px * 0.015, py * 0.015, sd + 11)));
                extra(px, py, d, out);
                out[3] = kind === 'strip' ? 1 : 0.7;
            },
            spec: { k: kind === 'strip' ? 1.1 : 0.8, power: 50, broad: kind === 'strip' ? 0.22 : 0.1, broadPow: 6 },
            stroke: { amp: 0.05, freq: 0.06, tone: 6 },
            edge: { rough: 0.5, freq: 0.5, amp: 0.3 },
        });
        g.save();
        g.translate(x, y);
        g.rotate(rot);
        put(g, sp, 0, 0);
        g.restore();
    }

    // A pinch of horseshoe nails, n of them crossed about (x, y), each `len` long.
    function hsnails(g, o = {}) {
        const { x = 0, y = 0, len = 60, n = 3, seed = 'hsn' } = o;
        const res = resOf(g, 1.6), rnd = Motion.rng('hsn' + seed);
        for (let i = 0; i < n; i++) {
            const a = rnd() * TAU, ox = (rnd() - 0.5) * len * 0.5, oy = (rnd() - 0.5) * len * 0.5, bent = i === 1 && rnd() < 0.7, L = len * (0.85 + rnd() * 0.25);
            const hw = L * 0.11, sw = L * 0.045;
            // along +y: the head from 0 to 0.16 L, the shank to L; a bent one kinks at 0.7 L
            const path = [[0, 0], [0, L * 0.16], [0, L * 0.45], [bent ? L * 0.03 : 0, L * 0.7], [bent ? L * 0.2 : 0, L * (bent ? 0.9 : 1)]];
            const pts = [[-hw, 0], [hw, 0], [sw * 1.2, L * 0.16], ...stripOf(path.slice(2), (u) => sw * 2 * (1 - u * 0.7)).slice(0, 3), [path[4][0] + 0.6, path[4][1]], ...stripOf(path.slice(2), (u) => sw * 2 * (1 - u * 0.7)).slice(3), [-sw * 1.2, L * 0.16]];
            const Ls = lightsOf(o, x + ox, y + oy, 1, a);
            const sp = ironSprite(pts, {
                res, seed: seed + i, Ls, amb: o.amb, shape: 'bevel', R: 1.6, relief: 1, rust: 0.3,
                polish: (px, py) => (py < L * 0.04 ? 0.8 : 0) + (Math.abs(px) < sw * 0.4 && py > L * 0.2 ? 0.35 : 0) + smooth(L * 0.85, L, py) * 0.4,
                height: (px, py) => (py < L * 0.16 ? 1.2 : 0) + (py > L * 0.82 ? -1.5 * smooth(L * 0.82, L, py) * (px > 0 ? 1 : 0) : 0),
            });
            g.save();
            g.translate(x + ox, y + oy);
            g.rotate(a);
            g.translate(0, -L / 2);
            put(g, sp, 0, 0);
            g.restore();
        }
    }

    // Iron bar stock being drawn out, (x, y) its middle, `len` long, `w` thick, lying along
    // `rot`; its end (+x) tapered and hot (`hot` 0 … 1), scrolled if `scroll`.
    function bar(g, o = {}) {
        const { x = 0, y = 0, len = 260, w = 16, rot = 0, seed = 'bar', hot = 0.9, scroll = false } = o;
        const res = resOf(g, 1.2), sd = S.seedOf(seed), Ls = lightsOf(o, x, y, 1, rot), h = len / 2;
        const path = [];
        for (let i = 0; i <= 30; i++) {
            const u = i / 30;
            path.push([-h + u * len * (scroll ? 0.85 : 1), 1.5 * Math.sin(u * 3 + sd)]);
        }
        if (scroll) {
            const [ex, ey] = path[path.length - 1];
            for (let i = 1; i <= 24; i++) {
                const a = -Math.PI / 2 + (i / 24) * Math.PI * 1.5, rr = len * 0.09 * (1 - i / 40);
                path.push([ex + Math.cos(a) * rr, ey + len * 0.09 + Math.sin(a) * rr]);
            }
        }
        const N = path.length;
        const pts = stripOf(path, (u) => w * (u < 0.55 ? 1 : 1 - (u - 0.55) * (scroll ? 1.1 : 1.6)) + 1.5);
        const heat = (px) => hot * smooth(-h * 0.1, h * 0.95, px);
        const sp = ironSprite(pts, {
            res, seed, Ls, amb: o.amb, shape: 'bevel', R: w * 0.25, relief: 1, rust: 0.35,
            height: (px, py) => {
                // hammer flats along the drawn part, scale plates lifting on the rest
                const fl = px > 0 ? 0.8 * Math.abs(Math.sin(px * 0.18 + noise2(px * 0.05, 0, sd) * 2)) : 0;
                const sc = worley(px / 9, py / 5, sd + 3);
                return fl + (px < h * 0.2 ? 0.6 * smooth(0, 0.15, sc[1] - sc[0]) : 0);
            },
            paint: (px, py, d, hh, out) => {
                // a chisel mark across where the length was marked
                if (Math.abs(px + h * 0.55) < 0.9) mixA(out, [0.05, 0.05, 0.06], 0.8, out);
                const k = heat(px);
                if (k > 0.02) HOT(clamp(k * (0.85 + 0.15 * noise2(px * 0.2, py * 0.3, sd + 4))), out);
                // flakes of scale lifting off the hot part: dark specks on the glow
                if (k > 0.3 && hashI(Math.floor(px * 0.6), Math.floor(py * 0.6), 5, sd) > 0.93) {
                    out[5] *= 0.3;
                    out[6] *= 0.3;
                    out[7] *= 0.3;
                }
            },
        });
        g.save();
        g.translate(x, y);
        g.rotate(rot);
        put(g, sp, 0, 0);
        if (hot > 0.3) {
            // the heat haloes the hot end
            softSheet(g, w * 0.8, (q) => {
                const gr = q.createRadialGradient(h * 0.75, 0, 0, h * 0.75, 0, len * 0.35);
                gr.addColorStop(0, `rgba(255,130,40,${0.35 * hot})`);
                gr.addColorStop(1, 'rgba(180,40,10,0)');
                q.fillStyle = gr;
                q.fillRect(h * 0.75 - len * 0.4, -len * 0.4, len * 0.8, len * 0.8);
            });
        }
        g.restore();
        void N;
    }


    return { lit, put, shadow, worley, ringWorley, fbm, cave, anvil, hammer, tongs, horseshoe, hearth, bellows, flames, sparks, smoke, wispSmoke, softSheet, plate, cauldron, warmer, tin, paintMap, utensil, bridle, cage, brass, strap, stripOf, chumbera, agave, oliveTree, branch, foliage, owl, wisp, tuberose, floret, bustle, sky, halo, furrows, hills, timber, hood, door, toLocal, lightsOf, pan, nail, moon, coal, offcut, hsnails, bar, HOT, FIRE, MOON, DARK, resOf };
})();
