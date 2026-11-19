// The patio at dawn, in the brush manner (no contour line: lit volumes, strokes, broken
// edges) and in dawn pastels: the walls, arches, floors, pots, plants and creatures of picture
// 7 (tableaux/patio.js). Global: Patio. Everything is painted once, static, in the caller's
// units, lit from the top left (Souvenir.LIGHT) by a low dawn sun: long soft shadows fall to
// the lower right and are cool (lilac-blue), the lights are warm (rose, straw).
//
// THE REAL THINGS · anatomy and ten small true details each (what is painted, and where)
//
// LIME WASH (`wall`) · a rubble or brick wall rendered and lime-washed every spring for a
//   century, so it is a stack of coats: the top one white, the older ones ochre, blue, rose.
//   1 the coats are brushed on in crossing arcs with a broad brush: their streaks show
//   2 never white: rose where the dawn falls on it, blue in shade, straw where it is thin
//   3 an older blue or ochre coat ghosting through where the top one is thin
//   4 flaking (desconchones): the top coats broken off in islands, the under-coat inside,
//     the brick or the rubble inside that, a lit broken lip and a shadow under the far edge
//   5 a crack from the corner of an opening, as cracks start; another one mended, filled
//     with fresher, whiter lime that has its own brush marks
//   6 rising damp at the foot: a darker band with a wavy brown tide line, white salt bloom
//     above it and green algae at the floor
//   7 nails: an iron head with a rust tear running down; an empty nail hole; a bent one
//   8 under every hung pot, the run of the water from its drainage hole
//   9 grime under the eaves in streaks; martin droppings under their nests
//   10 the grain of the sand in the lime: pits and specks; drips of lime run down
//
// THE HORSESHOE ARCH (`arch`) · the Cordoban arch: the intrados a circle carried below its
//   centre by half its radius, the extrados a larger circle centred higher (the voussoirs
//   are deeper at the crown), the joints radiating from a point on the axis at the impost
//   line, framed by an alfiz.
//   1 voussoirs alternate red brick and white limestone
//   2 the red ones are three bricks laid side by side, with their own mortar joints
//   3 the white ones carry the chisel's diagonal tool marks
//   4 the joints are lime mortar, recessed: a dark line under a light one
//   5 chipped arrises, a lost corner on one voussoir
//   6 the soffit (the wall's thickness) seen inside the arch, lit on the right jamb (it faces
//     the sun), in shade on the left and overhead, the voussoirs carried round it
//   7 a worn marble sill: a hollow worn in its middle by feet
//   8 the alfiz, a raised band with its lit top edge and its cast shadow
//   9 moulded imposts (cymatium) where the arch springs, casting a shadow on the jamb
//   10 lime splashed over the red voussoirs at the last whitewashing
//
// THE FLOOR (`floor`) · Cordoban pebble paving (empedrado): river pebbles set on edge in sand
//   in patterns, in perspective (the floor lies under the eye: its rows close up towards
//   the wall and its lines run to the vanishing point on the axis); washed at dawn, wet.
//   1 white, grey, ochre and black pebbles; 2 the black ones laid as a lozenge band;
//   3 a brick border; 4 the sand between them darker where it is wet; 5 the sky's rose in
//   the wet tops; 6 a puddle that mirrors the sky; 7 a missing pebble; 8 a fallen petal;
//   9 a dead leaf; 10 moss in the joints along the wall's foot.
//
// THE EAVE (`eave`) · a whitewashed brick cornice of two courses, then the noses of the
//   Arab roof tiles (cover tiles over channel tiles), the dawn sky above.
//   1 cover tiles as noses, the channel tiles' ends under them; 2 the mortar packed into
//   their ends (bocatejas), whitewashed; 3 orange and grey lichen; 4 a broken tile;
//   5 a tuft of grass and a small yellow crucifer in a joint; 6 the cornice's shadow on the
//   wall; 7 house martins' mud nests under the cornice, pellet by pellet, the entrance hole;
//   8 their droppings streaked down the wall; 9 grime streaks from the roof; 10 a swallow in
//   the sky.
//
// THE SKEIN (`madeja`) · a hank of wool hung from a nail by one end, twisted on itself so it
//   makes an eight: Seville's NO8DO without its letters.
//   1 the strands are fibres, each its own tone; 2 the twist pinches the middle; 3 the lit
//   side of each loop; 4 the loops' insides in shade; 5 fibres that fly loose; 6 the nail
//   through the top loop; 7 the shadow of the skein on the wall; 8 a tie-thread round its
//   middle; 9 the wool's crimp in the lit strands; 10 a darker dye-lot streak.
//
// THE AZULEJO DADO (`dado`) · a band of glazed tiles at the foot of the wall: a running
//   pattern of eight-pointed stars between tiles of a border, a dark skirting row.
//   1 every tile its own glaze and a gloss at its own angle (tiles are never flat); 2 the
//   motif runs across four tiles; 3 the honey and the green bleed a little at the cuerda
//   seca's dark line; 4 crazing; 5 the glaze chipped at a corner, the red body showing;
//   6 one tile replaced with one of another pattern; 7 one cracked across; 8 the grout
//   lines dirty; 9 the border row of another pattern; 10 lime splashes on the top row.
const Patio = (() => {
    const S = Souvenir;
    const TAU = Math.PI * 2;
    const L2 = (() => {
        const l = Math.hypot(S.LIGHT[0], S.LIGHT[1]);
        return [S.LIGHT[0] / l, S.LIGHT[1] / l]; // towards the light, in the picture plane
    })();
    const SD = [-L2[0], -L2[1]]; // where shadows fall
    // a thing standing `off` units out from a wall casts its shadow this far (the low sun)
    const throwOf = (off) => [SD[0] * off * 1.6, SD[1] * off * 1.6];

    const cache = new Map();
    const memo = (key, fn) => {
        if (!cache.has(key)) cache.set(key, fn());
        return cache.get(key);
    };
    const canvas = (w, h) => {
        const c = document.createElement('canvas');
        c.width = Math.max(1, Math.ceil(w));
        c.height = Math.max(1, Math.ceil(h));
        return c;
    };
    const rng = (s) => Motion.rng('patio-' + s);
    const resOf = (g, s = 1) => Math.max(0.5, Math.ceil(S.pxScale(g) * s * 2) / 2);
    const hex = S.hex2rgb;
    const mixRGB = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
    const css = (c, a = 1) => `rgba(${Math.round(c[0])},${Math.round(c[1])},${Math.round(c[2])},${a})`;
    const fbm = (x, y, s) => S.noise2(x, y, s) * 0.6 + S.noise2(x * 2.1, y * 2.1, s + 1) * 0.28 + S.noise2(x * 4.3, y * 4.3, s + 2) * 0.12;
    const path = (q, pts, close = true) => {
        q.beginPath();
        S.trace(q, pts, close);
    };
    const fillP = (q, pts, c) => {
        q.fillStyle = c;
        path(q, pts);
        q.fill();
    };
    const lineP = (q, pts, w, c) => {
        q.lineWidth = w;
        q.strokeStyle = c;
        path(q, pts, false);
        q.stroke();
    };
    const disc = (q, x, y, r, c) => {
        q.fillStyle = c;
        q.beginPath();
        q.arc(x, y, Math.max(0.05, r), 0, TAU);
        q.fill();
    };
    const oval = (q, x, y, rx, ry, a, c) => {
        q.fillStyle = c;
        q.beginPath();
        q.ellipse(x, y, Math.max(0.05, rx), Math.max(0.05, ry), a, 0, TAU);
        q.fill();
    };
    const shift = (pts, dx, dy) => pts.map(([x, y]) => [x + dx, y + dy]);
    // an irregular blob about (x, y): rx × ry with a ragged edge
    const blob = (x, y, rx, ry, seed, n = 30, rough = 0.3, rot = 0) => {
        const sd = S.seedOf(seed), out = [];
        for (let i = 0; i < n; i++) {
            const a = (i / n) * TAU;
            const k = 1 + rough * (S.noise2(Math.cos(a) * 1.3 + 3, Math.sin(a) * 1.3, sd) * 0.8 + (S.hashI(i, 0, 3, sd) - 0.5) * 0.5);
            out.push([Math.cos(a) * rx * k, Math.sin(a) * ry * k]);
        }
        return S.xf(out, { x, y, rot });
    };
    // Brush marks laid softly: what `draw` paints goes down through one blur.
    const softly = (g, blur, draw, op = 'source-over') => {
        const m = g.getTransform(), c = canvas(g.canvas.width, g.canvas.height), q = c.getContext('2d');
        q.setTransform(m);
        draw(q);
        g.save();
        g.setTransform(1, 0, 0, 1, 0, 0);
        g.globalCompositeOperation = op;
        g.filter = `blur(${Math.max(0.3, blur * Math.hypot(m.a, m.b)).toFixed(2)}px)`;
        g.drawImage(c, 0, 0);
        g.restore();
    };
    // The shadow of a sprite (any { canvas, box }) on the paint already under it.
    function castSprite(g, sp, { x = 0, y = 0, s = 1, dx = 8, dy = 9, blur = 6, color = '#3c3a6e', alpha = 0.35 } = {}) {
        const key = blur + color;
        sp.sh = sp.sh || {};
        if (!sp.sh[key]) {
            const r0 = sp.canvas.width / sp.box.w, rs = Math.min(r0, Math.max(0.25, 2.6 / Math.max(0.5, blur)));
            const pad = blur * 2.2 + 2;
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
        S.put(g, sp.sh[key], { x: x + dx, y: y + dy, s, alpha });
        g.restore();
    }
    function place(g, sp, x, y, s = 1, shadow = null) {
        if (shadow) castSprite(g, sp, { x, y, s, ...shadow });
        S.put(g, sp, { x, y, s });
    }

    // ------------------------------------------------------------------ dawn palette
    const P = {
        rose: hex('#f2ddd3'), straw: hex('#efe1bf'), lilac: hex('#d9d3e0'), blueOld: hex('#a9b9d3'), ochreOld: hex('#dcc596'),
        shade: hex('#aab0cc'), deep: hex('#7d7fa6'), warm: hex('#f6e3cf'),
        brick: hex('#b4613f'), mortar: hex('#cdbfab'),
        sky: ['#c6d0e2', '#d3d3e2', '#e2d2d6', '#ecd0c8', '#f1d6c0'],
    };
    const SHADOW = '#4b4878'; // the colour shadows are cast in

    // ------------------------------------------------------------------ the lime wall
    // A lime-washed wall on its own sheet, pasted on g.
    //   box, res     the layer's box and resolution (the sheet is the size of the layer)
    //   shape(q)     traces the wall's outline; openings as further sub-paths (filled evenodd)
    //   seed
    //   top          y of the wall's top (eave or ceiling), floor: y of its foot
    //   ok(x, y)     where flakes, cracks and nails may go (keep the arch and its frame clear)
    //   flakes, cracks [[x, y, ang, len, mended]], nails [[x, y, kind]], damp (height), dark (0..1: in shade)
    //   ghost        how much the older coats show (0..1)
    function wall(g, res, o) {
        const box = o.box, sd = S.seedOf('wall' + o.seed), r = rng('wall' + o.seed);
        const sh = S.sheet(box, res, (q) => {
            q.fillStyle = '#eee0d6';
            q.beginPath();
            o.shape(q);
            q.fill('evenodd');
        });
        const q = sh.canvas.getContext('2d');
        const W = sh.canvas.width, H = sh.canvas.height;
        const dark = o.dark ?? 0, ghost = o.ghost ?? 0.5;
        // 1 · the colour of the coats and the render's undulation under the raking light: a
        // slow field painted at a third of the size and laid on smooth
        {
            const f = 3, w = Math.ceil(W / f), h = Math.ceil(H / f), c = canvas(w, h), cq = c.getContext('2d');
            const im = cq.createImageData(w, h), px = im.data;
            const lit = mixRGB(P.rose, P.warm, 0.35), shd = mixRGB(P.shade, [214, 208, 206], 0.6);
            const U = f / res;
            // the render's surface: slow swells, trowel ridges, small lumps
            const Hf = new Float32Array(w * h);
            for (let j = 0, i = 0; j < h; j++) {
                for (let ii = 0; ii < w; ii++, i++) {
                    const x = box.x + (ii + 0.5) * U, y = box.y + (j + 0.5) * U;
                    Hf[i] = fbm(x / 140, y / 140, sd + 20) * 9 + S.noise2(x / 34, y / 52, sd + 21) * 2.6 + S.noise2(x / 9, y / 9, sd + 22) * 0.7;
                }
            }
            for (let j = 0; j < h; j++) {
                for (let i = 0; i < w; i++) {
                    const x = box.x + (i + 0.5) * U, y = box.y + (j + 0.5) * U;
                    const n1 = fbm(x / 520, y / 520, sd), n2 = fbm(x / 170, y / 170, sd + 5), n3 = S.noise2(x / 48, y / 48, sd + 9);
                    // the dawn: warm and light from the top left, cooler and lower to the right
                    const sun = S.clamp(0.62 + (-(x - (o.sunX ?? -600)) * 0.5 - (y - (o.sunY ?? -500)) * 0.6) / 3400 - dark * 0.5 + n1 * 0.12);
                    let c3 = mixRGB(shd, lit, S.smooth(0.15, 0.85, sun));
                    c3 = mixRGB(c3, P.straw, 0.4 * S.smooth(-0.05, 0.55, n1));
                    c3 = mixRGB(c3, P.lilac, 0.18 * S.smooth(0.1, 0.6, -n1));
                    // an older coat ghosting through where the top one is thin
                    const thin = S.smooth(0.22, 0.62, n2) * ghost;
                    c3 = mixRGB(c3, n1 > 0.05 ? P.ochreOld : P.blueOld, thin * 0.4);
                    // grime: under the top
                    if (o.top !== undefined) c3 = mixRGB(c3, [150, 140, 146], S.smooth(o.top + 170, o.top, y) * 0.18);
                    // the raking light on the swells: the slope towards the sun is lighter and warmer
                    const k = j * w + i, xm = Math.max(0, i - 1), xp = Math.min(w - 1, i + 1), ym = Math.max(0, j - 1), yp = Math.min(h - 1, j + 1);
                    const gx = (Hf[j * w + xp] - Hf[j * w + xm]) / ((xp - xm) * U), gy = (Hf[yp * w + i] - Hf[ym * w + i]) / ((yp - ym) * U);
                    const sl = S.clamp((gx * L2[0] + gy * L2[1]) * -1.6, -1, 1);
                    let v = 1 + 0.045 * n3 + 0.02 * n2 + sl * 0.15;
                    if (sl > 0) c3 = mixRGB(c3, [255, 236, 222], sl * 0.25);
                    else c3 = mixRGB(c3, [150, 152, 186], -sl * 0.2);
                    px[k * 4] = c3[0] * v;
                    px[k * 4 + 1] = c3[1] * v;
                    px[k * 4 + 2] = c3[2] * v;
                    px[k * 4 + 3] = 255;
                }
            }
            cq.putImageData(im, 0, 0);
            q.save();
            q.setTransform(1, 0, 0, 1, 0, 0);
            q.globalCompositeOperation = 'source-atop';
            q.imageSmoothingQuality = 'high';
            q.drawImage(c, 0, 0, w * f, h * f);
            q.restore();
        }
        q.save();
        q.beginPath();
        o.shape(q);
        q.clip('evenodd');
        // 2 · the brush: broad arcs of lime laid crossing each other, soft, then a few streaky
        // ones on top (the last coat), all through one light blur so no bristle reads as a line
        const arcPts = (x, y, len, a0, bend) => {
            const pts = [];
            for (let k = 0; k <= 12; k++) {
                const u = k / 12 - 0.5;
                pts.push([x + Math.cos(a0) * len * u - Math.sin(a0) * bend * len * 0.25 * (1 - 4 * u * u), y + Math.sin(a0) * len * u + Math.cos(a0) * bend * len * 0.25 * (1 - 4 * u * u)]);
            }
            return pts;
        };
        softly(q, 1.6, (p) => {
            const n = Math.round(((box.w * box.h) / (120 * 120)) * (o.strokes ?? 1));
            for (let i = 0; i < n; i++) {
                const x = box.x + r() * box.w, y = box.y + r() * box.h, light = r() < 0.6;
                S.dab(p, arcPts(x, y, 90 + r() * 170, (r() - 0.5) * 2.4, (r() - 0.5) * 1.4), { w: 34 + r() * 50, color: light ? (r() < 0.5 ? '#fffaf3' : '#fff0e4') : r() < 0.5 ? '#a8a9c4' : '#c8b6a4', alpha: light ? 0.09 + r() * 0.1 : 0.08 + r() * 0.08, bristles: 16, dry: 0.3, seed: sd + i, taper: 0.7 });
            }
        });
        softly(q, 0.5, (p) => {
            const n = Math.round(((box.w * box.h) / (150 * 150)) * (o.strokes ?? 1));
            for (let i = 0; i < n; i++) {
                const x = box.x + r() * box.w, y = box.y + r() * box.h;
                S.dab(p, arcPts(x, y, 50 + r() * 110, (r() - 0.5) * 2.4, (r() - 0.5) * 1.2), { w: 14 + r() * 22, color: r() < 0.7 ? '#fffbf6' : '#b4b2c8', alpha: 0.09 + r() * 0.09, bristles: 12, dry: 0.55, seed: sd + 5000 + i, taper: 0.8 });
            }
        });
        // hairline crazing of the old lime, in patches: a net of small cells
        softly(q, 0.35, (p) => {
            for (let i = 0; i < (o.craze ?? 16); i++) {
                const cx = box.x + r() * box.w, cy = (o.top ?? box.y) + r() * ((o.floor ?? box.y + box.h) - (o.top ?? box.y)), rad = 40 + r() * 80;
                p.lineWidth = 0.55;
                p.strokeStyle = 'rgba(80,70,90,0.42)';
                for (let k = 0; k < rad * 0.9; k++) {
                    const a = r() * TAU, d = Math.sqrt(r()) * rad;
                    let x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d * 0.7, b = r() * TAU;
                    p.beginPath();
                    p.moveTo(x, y);
                    for (let m = 0; m < 3; m++) {
                        b += (r() - 0.5) * 1.6;
                        p.lineTo((x += Math.cos(b) * (4 + r() * 7)), (y += Math.sin(b) * (4 + r() * 7)));
                    }
                    p.globalAlpha = S.smooth(rad, rad * 0.4, d);
                    p.stroke();
                }
                p.globalAlpha = 1;
            }
        });
        // 3 · drips of lime run down, here and there; fly specks; pits with their shadow
        for (let i = 0; i < (o.drips ?? 18); i++) {
            const x = box.x + r() * box.w, y = box.y + r() * box.h, len = 10 + r() * 34;
            S.dab(q, [[x, y], [x + (r() - 0.5) * 2, y + len * 0.5], [x + (r() - 0.5) * 3, y + len]], { w: 2 + r() * 2, color: '#fffaf2', alpha: 0.32, bristles: 3, dry: 0.3, seed: sd + 900 + i, taper: 0.9 });
            disc(q, x + (r() - 0.5) * 2, y + len + 1, 1.2 + r() * 0.8, 'rgba(255,250,242,0.5)');
            disc(q, x + (r() - 0.5) * 2 + SD[0], y + len + 1 + SD[1], 1.2, 'rgba(90,80,110,0.18)');
        }
        for (let i = 0; i < (box.w * box.h) / 4500; i++) {
            const x = box.x + r() * box.w, y = box.y + r() * box.h, rr = 0.7 + r() * r() * 2.6;
            if (r() < 0.3) {
                disc(q, x, y, 0.5 + r() * 0.5, 'rgba(60,50,60,0.55)');
                continue;
            }
            disc(q, x - L2[0] * rr * 0.4, y - L2[1] * rr * 0.4, rr, 'rgba(255,250,244,0.55)');
            disc(q, x, y, rr, 'rgba(110,100,120,0.42)');
            disc(q, x + L2[0] * rr * 0.25, y + L2[1] * rr * 0.25, rr * 0.7, 'rgba(70,60,80,0.3)');
        }
        // 4 · damp at the foot: a darker band, its brown tide line, salt bloom over it, algae
        if (o.floor !== undefined && (o.damp ?? 0) > 0) {
            const top = [], x0 = box.x - 10, x1 = box.x + box.w + 10;
            for (let x = x0; x <= x1; x += 8) top.push([x, o.floor - o.damp * (0.62 + 0.38 * fbm(x / 230, 0.5, sd + 11)) - 10 * S.noise2(x / 31, 2.5, sd + 12)]);
            const band = [...top, [x1, o.floor + 40], [x0, o.floor + 40]];
            const gr = q.createLinearGradient(0, o.floor - o.damp, 0, o.floor);
            gr.addColorStop(0, 'rgba(120,118,96,0.16)');
            gr.addColorStop(0.7, 'rgba(96,98,80,0.26)');
            gr.addColorStop(1, 'rgba(70,78,62,0.4)');
            q.fillStyle = gr;
            path(q, band);
            q.fill();
            softly(q, 2.5, (p) => {
                lineP(p, top, 3.2, 'rgba(126,92,60,0.32)');
                lineP(p, shift(top, 0, -9), 2, 'rgba(126,92,60,0.12)');
            });
            // salt: a fuzzy white bloom just above the line
            for (let i = 0; i < top.length; i += 1) {
                if (r() < 0.45) continue;
                const [x, y] = top[i];
                for (let k = 0; k < 3; k++) disc(q, x + (r() - 0.5) * 10, y - 2 - r() * 10, 0.8 + r() * 2.4, `rgba(255,253,248,${0.15 + r() * 0.3})`);
            }
            // algae at the floor
            for (let i = 0; i < (box.w / 7) | 0; i++) {
                const x = box.x + r() * box.w, y = o.floor - r() * r() * 34;
                disc(q, x, y, 0.8 + r() * 2.6, `rgba(${70 + r() * 30},${100 + r() * 30},${56 + r() * 20},${0.2 + r() * 0.3})`);
            }
        }
        // 5 · flaking: islands where the coats broke off
        const okAt = o.ok ?? (() => true);
        const flakes = [];
        for (let i = 0, tries = 0; i < (o.flakes ?? 10) * 2 && tries < 600; tries++) {
            const x = box.x + 60 + r() * (box.w - 120), y = (o.top ?? box.y) + 40 + r() * ((o.floor ?? box.y + box.h) - (o.top ?? box.y) - 80);
            const size = 8 + r() * r() * 66;
            if (!okAt(x, y, size * 1.6)) continue;
            flakes.push([x, y, size]);
            i++;
        }
        for (const [x, y, size] of flakes) flake(q, x, y, size, sd + Math.round(x * 7 + y));
        // 6 · cracks, one of them mended; and small hairlines where the render has moved
        for (const [x, y, ang, len, mended] of o.cracks ?? []) crack(q, x, y, ang, len, sd + Math.round(x + y * 3), mended);
        for (let i = 0, tries = 0; i < (o.hairlines ?? 14) && tries < 200; tries++) {
            const x = box.x + r() * box.w, y = (o.top ?? box.y) + 30 + r() * ((o.floor ?? box.y + box.h) - (o.top ?? box.y) - 60);
            if (!okAt(x, y, 30)) continue;
            crack(q, x, y, r() * TAU, 20 + r() * 50, sd + 700 + i, false);
            i++;
        }
        // 7 · nails, rust and holes
        for (const [x, y, kind] of o.nails ?? []) nail(q, x, y, kind, sd + Math.round(x * 3 + y));
        wallLife(q, { x: box.x, y: o.top ?? box.y, w: box.w, h: (o.floor ?? box.y + box.h) - (o.top ?? box.y) }, okAt, o.seed, o.life ?? Math.round((box.w * ((o.floor ?? 400) - (o.top ?? box.y))) / 26000));
        if (o.extra) o.extra(q, r);
        q.restore();
        // 8 · the grain of the lime: pits and specks of sand
        {
            const im = q.getImageData(0, 0, W, H), px = im.data;
            for (let j = 0, i = 0; j < H; j++) {
                for (let x = 0; x < W; x++, i += 4) {
                    if (!px[i + 3]) continue;
                    const h1 = S.hashI(x, j, 7, sd), h2 = S.hashI(x >> 1, j >> 1, 8, sd);
                    let v = 1 + (h1 - 0.5) * 0.05;
                    if (h2 < 0.025) v *= 0.9;
                    else if (h2 > 0.985) v *= 1.05;
                    px[i] = Math.min(255, px[i] * v);
                    px[i + 1] = Math.min(255, px[i + 1] * v);
                    px[i + 2] = Math.min(255, px[i + 2] * v);
                }
            }
            q.putImageData(im, 0, 0);
        }
        S.put(g, sh);
        return sh;
    }

    // The small life of an old wall, scattered where `ok` allows: silvery snail trails and a
    // snail, flies, a spider hanging on its thread, a wooden plug and an old screw, a square of
    // blue tried on the lime, pencil ticks where someone measured, a moth.
    function wallLife(q, box, ok, seed, n = 40) {
        const r = rng('life' + seed);
        const spot = () => {
            for (let t = 0; t < 30; t++) {
                const x = box.x + 40 + r() * (box.w - 80), y = box.y + 40 + r() * (box.h - 80);
                if (ok(x, y, 20)) return [x, y];
            }
            return null;
        };
        for (let i = 0; i < n; i++) {
            const p = spot();
            if (!p) continue;
            const [x, y] = p, k = i % 9;
            if (k === 0) {
                // a snail's trail, dried silver, wandering
                const pts = [[x, y]];
                let a = r() * TAU, px = x, py = y;
                for (let m = 0; m < 26; m++) {
                    a += (r() - 0.5) * 0.7;
                    pts.push([(px += Math.cos(a) * 6), (py += Math.sin(a) * 6)]);
                }
                lineP(q, pts, 2.2, 'rgba(220,226,240,0.45)');
                lineP(q, shift(pts, -0.6, -0.6), 0.6, 'rgba(255,255,255,0.7)');
                if (r() < 0.5) {
                    const e = pts[pts.length - 1];
                    S.piece(q, S.ellipse(e[0], e[1], 5, 4.2, 16), { fill: '#b89a6a', line: 0, shade: { color: '#3a2a20', alpha: 0.5, w: 3 }, light: { color: '#fff0d0', alpha: 0.5, w: 2 } });
                    q.lineWidth = 0.7;
                    q.strokeStyle = 'rgba(80,56,30,0.8)';
                    q.beginPath();
                    for (let m = 0; m < 20; m++) q.lineTo(e[0] + Math.cos(m * 0.6) * (4 - m * 0.18), e[1] + Math.sin(m * 0.6) * (3.4 - m * 0.15));
                    q.stroke();
                }
            } else if (k === 1 || k === 5) {
                // a fly resting, wings folded back
                disc(q, x + SD[0] * 2, y + SD[1] * 2, 2, 'rgba(60,50,80,0.3)');
                oval(q, x, y, 2.2, 1.4, 0.4, '#2a2428');
                oval(q, x - 2, y - 1, 2.6, 1, 0.9, 'rgba(210,214,230,0.6)');
                oval(q, x - 2, y + 1, 2.6, 1, -0.2, 'rgba(210,214,230,0.6)');
                disc(q, x + 2, y + 0.8, 0.9, '#6a2a24');
            } else if (k === 2) {
                // a spider hanging on its thread
                const yy = y + 20 + r() * 40;
                lineP(q, [[x, y], [x, yy]], 0.4, 'rgba(240,240,250,0.7)');
                disc(q, x + SD[0] * 3, yy + SD[1] * 3, 2.4, 'rgba(60,50,80,0.25)');
                disc(q, x, yy, 1.8, '#3a3034');
                disc(q, x, yy + 2.4, 2.4, '#4a3c3c');
                for (let m = 0; m < 4; m++) for (const sd of [-1, 1]) lineP(q, [[x, yy + 1], [x + sd * (3 + m * 0.6), yy - 2 + m * 2], [x + sd * (5 + m), yy + m * 2.4]], 0.4, '#3a3034');
            } else if (k === 3) {
                // a wooden plug in an old hole, and the screw that was in it, rusted
                disc(q, x + 0.6, y + 0.7, 4.6, 'rgba(255,248,240,0.5)');
                disc(q, x, y, 4, '#8a6a4a');
                disc(q, x - 0.8, y - 0.8, 1.6, 'rgba(230,200,160,0.6)');
                lineP(q, [[x - 2.5, y], [x + 2.5, y]], 0.8, 'rgba(60,40,30,0.7)');
                S.dab(q, [[x, y + 4], [x, y + 18 + r() * 14]], { w: 3, color: '#8a5030', alpha: 0.3, bristles: 3, seed: i });
            } else if (k === 4) {
                // a square of blue tried on the lime, years ago, and a thumb-smear of it
                const w = 18 + r() * 10, h = 14 + r() * 8;
                S.dab(q, [[x, y], [x + w, y + (r() - 0.5) * 2]], { w: h, color: '#5a78b4', alpha: 0.55, bristles: 9, dry: 0.4, seed: i, taper: 0.2 });
                oval(q, x + w + 8, y + 4, 4, 3, 0.4, 'rgba(90,120,180,0.35)');
            } else if (k === 6) {
                // pencil ticks where someone measured for a nail, and a cross
                for (let m = 0; m < 3; m++) lineP(q, [[x + m * 7, y], [x + m * 7, y + 6 + (m === 1 ? 4 : 0)]], 0.6, 'rgba(70,64,80,0.55)');
                lineP(q, [[x + 30, y - 3], [x + 36, y + 3]], 0.6, 'rgba(70,64,80,0.55)');
                lineP(q, [[x + 36, y - 3], [x + 30, y + 3]], 0.6, 'rgba(70,64,80,0.55)');
            } else if (k === 7) {
                // a moth flattened against the wall for the day
                fillP(q, [[x, y], [x - 9, y + 5], [x - 7, y + 9], [x, y + 6]], '#a89880');
                fillP(q, [[x, y], [x + 9, y + 5], [x + 7, y + 9], [x, y + 6]], '#9a8a72');
                lineP(q, [[x, y], [x, y + 7]], 1.2, '#6a5a4a');
                for (const sd of [-1, 1]) lineP(q, [[x - sd * 5, y + 4], [x - sd * 7, y + 7]], 0.5, 'rgba(70,56,40,0.6)');
            } else {
                // an old screw hole with its crumbled rim, a stain of rust under it
                nail(q, x, y, r() < 0.5 ? 'hole' : 'bent', S.seedOf(seed) + i);
            }
        }
    }

    // A flake: the top coats gone in an island, an older coat inside, the substrate inside that.
    function flake(q, x, y, size, seed) {
        const r = Motion.rng('flake' + seed);
        const P1 = blob(x, y, size * (1 + r() * 0.6), size * (0.55 + r() * 0.4), seed, 34, 0.42, (r() - 0.5) * 0.8);
        const under = r() < 0.5 ? '#d9cdb0' : r() < 0.5 ? '#bfc6d4' : '#dfcdc6';
        fillP(q, P1, under);
        q.save();
        path(q, P1);
        q.clip();
        // the older coat's own streaks
        for (let i = 0; i < 6; i++) S.dab(q, [[x - size + r() * size * 2, y - size * 0.5 + r() * size], [x - size * 0.4 + r() * size * 2, y - size * 0.3 + r() * size]], { w: 6 + r() * 8, color: r() < 0.5 ? '#ffffff' : '#9c8f84', alpha: 0.18, bristles: 6, seed: seed + i });
        // deeper: the substrate (brick or rubble and render)
        if (size > 22 && r() < 0.75) {
            const P2 = blob(x + (r() - 0.5) * size * 0.4, y + (r() - 0.5) * size * 0.2, size * 0.62, size * 0.36, seed + 1, 26, 0.5);
            const brick = r() < 0.6;
            fillP(q, P2, brick ? '#b2603f' : '#c6b297');
            q.save();
            path(q, P2);
            q.clip();
            if (brick) {
                // courses of thin brick with lime mortar
                const ch = 9 + r() * 2;
                for (let yy = y - size; yy < y + size; yy += ch) {
                    lineP(q, [[x - size * 2, yy], [x + size * 2, yy + (r() - 0.5)]], 2.2, 'rgba(214,200,180,0.85)');
                    const off = r() * 30;
                    for (let xx = x - size * 2 + off; xx < x + size * 2; xx += 26 + r() * 8) lineP(q, [[xx, yy], [xx + (r() - 0.5), yy + ch]], 1.8, 'rgba(214,200,180,0.8)');
                    for (let k = 0; k < 8; k++) disc(q, x + (r() - 0.5) * size * 2.4, yy + r() * ch, 0.6 + r() * 1.2, r() < 0.5 ? 'rgba(120,48,30,0.5)' : 'rgba(230,150,110,0.4)');
                }
            } else {
                for (let k = 0; k < size * 2; k++) disc(q, x + (r() - 0.5) * size * 1.6, y + (r() - 0.5) * size, 0.5 + r() * 1.6, r() < 0.5 ? 'rgba(110,96,80,0.45)' : 'rgba(240,230,210,0.5)');
            }
            q.restore();
            // its rim: a step of the older coat, shaded on the side towards the light
            q.save();
            path(q, P2);
            q.clip();
            q.fillStyle = 'rgba(64,50,60,0.4)';
            q.beginPath();
            q.rect(x - size * 4, y - size * 4, size * 8, size * 8);
            S.trace(q, shift(P2, SD[0] * 2.4, SD[1] * 2.4));
            q.fill('evenodd');
            q.restore();
        }
        // the shadow the broken top coat throws into the hole, along its edge towards the light
        for (const [d, a] of [[5, 0.16], [2.6, 0.3]]) {
            q.fillStyle = `rgba(70,58,92,${a})`;
            q.beginPath();
            q.rect(x - size * 4, y - size * 4, size * 8, size * 8);
            S.trace(q, shift(P1, SD[0] * d, SD[1] * d));
            q.fill('evenodd');
        }
        q.restore();
        // the lit broken lip on the far side: the coat's thickness facing the sun
        q.save();
        path(q, shift(P1, L2[0] * 1.6, L2[1] * 1.6));
        q.rect(x - size * 4, y - size * 4, size * 8, size * 8);
        q.clip('evenodd');
        lineP(q, [...P1, P1[0]], 1.5, 'rgba(255,251,244,0.75)');
        q.restore();
        // loose flakes curling at the edge, and dust fallen below
        for (let i = 0; i < 3 + size / 12; i++) {
            const p = P1[Math.floor(r() * P1.length)], s2 = 1.5 + r() * 3.2;
            const fl = blob(p[0] + (r() - 0.5) * 3, p[1] + (r() - 0.5) * 3, s2, s2 * 0.6, seed + 50 + i, 7, 0.4, r() * 3);
            fillP(q, shift(fl, SD[0] * 1.6, SD[1] * 1.6), 'rgba(70,58,92,0.3)');
            fillP(q, fl, '#fbf3ea');
        }
    }

    // A crack: a jagged line with a light lip; mended: filled with fresher lime over it.
    function crack(q, x, y, ang, len, seed, mended = false) {
        const r = Motion.rng('crack' + seed);
        const walk = (x, y, a, len) => {
            const pts = [[x, y]];
            let d = 0;
            while (d < len) {
                const st = 3 + r() * 7;
                a += (r() - 0.5) * 0.9;
                a += (ang - a) * 0.2;
                x += Math.cos(a) * st;
                y += Math.sin(a) * st;
                pts.push([x, y]);
                d += st;
            }
            return pts;
        };
        const main = walk(x, y, ang, len), branches = [];
        for (let i = 0; i < 2; i++) {
            const p = main[Math.floor(main.length * (0.3 + r() * 0.5))];
            branches.push(walk(p[0], p[1], ang + (r() < 0.5 ? 0.7 : -0.7), len * (0.2 + r() * 0.25)));
        }
        if (mended) {
            // filled with fresher lime, a little proud of the wall: a soft band with its own
            // strokes, the old crack still showing as a ghost
            softly(q, 1.2, (p) => {
                for (const pts of [main, ...branches]) S.dab(p, pts, { w: 16 + r() * 6, color: '#fffaf2', alpha: 0.5, bristles: 12, dry: 0.3, seed: seed + 3 });
            });
            for (const pts of [main, ...branches]) S.dab(q, shift(pts, SD[0] * 3, SD[1] * 3), { w: 4, color: '#8a86a8', alpha: 0.16, bristles: 5, dry: 0.5, seed: seed + 4 });
            for (const pts of [main, ...branches]) S.dab(q, pts, { w: 9, color: '#fffdf8', alpha: 0.35, bristles: 8, dry: 0.6, seed: seed + 5 });
            lineP(q, main, 0.7, 'rgba(110,100,110,0.18)');
            return;
        }
        q.lineJoin = 'round';
        for (const [pts, k] of [[main, 1], ...branches.map((b) => [b, 0.6])]) {
            lineP(q, shift(pts, -L2[0] * 0.9, -L2[1] * 0.9), 1.1 * k, 'rgba(255,250,240,0.7)');
            for (let i = 1; i < pts.length; i++) lineP(q, [pts[i - 1], pts[i]], (0.7 + r() * 1.1) * k * (1 - (i / pts.length) * 0.6), 'rgba(58,46,62,0.78)');
        }
    }

    // A nail in the wall: 'nail' (head and rust tear), 'hole', 'bent', 'hook'.
    function nail(q, x, y, kind = 'nail', seed = 1) {
        const r = Motion.rng('nail' + seed);
        const len = 26 + r() * 70;
        if (kind !== 'hole') {
            // the rust tear: a streak down the wall, widest just under the head
            S.dab(q, [[x, y + 2], [x + (r() - 0.5) * 3, y + len * 0.45], [x + (r() - 0.5) * 5, y + len]], { w: 4.2 + r() * 3, color: '#8b4a28', alpha: 0.42, bristles: 6, dry: 0.5, seed, taper: 0.85 });
            S.dab(q, [[x, y + 2], [x, y + len * 0.5]], { w: 2.2, color: '#6e3216', alpha: 0.4, bristles: 3, seed: seed + 1 });
            const gr = q.createRadialGradient(x, y, 0, x, y, 8);
            gr.addColorStop(0, 'rgba(126,62,30,0.45)');
            gr.addColorStop(1, 'rgba(126,62,30,0)');
            q.fillStyle = gr;
            q.fillRect(x - 9, y - 9, 18, 18);
        }
        if (kind === 'hole') {
            disc(q, x + 0.6, y + 0.7, 3.4, 'rgba(255,250,240,0.6)');
            disc(q, x, y, 3, '#5d4a48');
            disc(q, x - 0.6, y - 0.7, 1.6, '#2e2226');
            for (let i = 0; i < 5; i++) disc(q, x + (r() - 0.5) * 9, y + (r() - 0.5) * 9, 0.8 + r(), 'rgba(90,70,70,0.4)');
            return;
        }
        if (kind === 'bent' || kind === 'hook') {
            // the shank, bent down (a hook curls up again)
            const sh = kind === 'hook' ? [[x, y], [x + 1, y + 6], [x + 4, y + 9], [x + 7, y + 6]] : [[x, y], [x + 4, y + 3], [x + 6, y + 9]];
            lineP(q, shift(sh, SD[0] * 3, SD[1] * 3), 2.4, 'rgba(70,58,92,0.35)');
            lineP(q, sh, 2.2, '#3a2c2a');
            lineP(q, shift(sh, -0.5, -0.5), 0.7, 'rgba(210,190,180,0.7)');
        }
        disc(q, x + SD[0] * 3, y + SD[1] * 3, 3.4, 'rgba(70,58,92,0.35)');
        disc(q, x, y, 3, '#3b2c28');
        disc(q, x - 0.7, y - 0.8, 1.5, '#8f7468');
        disc(q, x - 1, y - 1.1, 0.6, '#e2d2c6');
    }

    // ------------------------------------------------------------------ the horseshoe arch
    // geometry in the wall's units, the axis at x = 0:
    //   R, cy: the intrados circle; imp: the impost line (cy + R/2 for a Cordoban arch);
    //   floor: the threshold; k: the back of the arch, the front scaled by k about the origin
    //   (the wall's thickness seen in perspective from the axis); ext: the voussoirs' depth
    //   at the springing; lift: how much higher the extrados is centred; n: voussoirs
    function archGeom(o) {
        const R = o.R, cy = o.cy, imp = o.imp ?? cy + R * 0.5, floor = o.floor, k = o.k ?? 0.93, cx = o.cx ?? 0;
        const a0 = Math.asin(S.clamp((imp - cy) / R, -1, 1)), xj = Math.sqrt(Math.max(0, R * R - (imp - cy) * (imp - cy)));
        const phi0 = Math.PI - a0, phi1 = TAU + a0, n = o.n ?? 19;
        const ext = o.ext ?? 90, lift = o.lift ?? 30, ecy = cy - lift;
        // a lobed intrados (the caliphal arch): little arcs cut into the circle
        const nl = o.lobes ?? 0;
        const lobe = (phi) => {
            if (!nl) return 0;
            const u = ((phi - phi0) / (phi1 - phi0)) * nl;
            return R * 0.085 * (1 - Math.sqrt(Math.abs(Math.sin(Math.PI * u))));
        };
        const at = (phi) => [cx + (R - lobe(phi)) * Math.cos(phi), cy + (R - lobe(phi)) * Math.sin(phi)];
        const on = (phi) => [cx + R * Math.cos(phi), cy + R * Math.sin(phi)];
        // where the joint through intrados point p meets the extrados
        const jy = o.jy ?? imp;
        const outAt = (p) => {
            const dx = p[0] - cx, dy = p[1] - jy, L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L;
            const Re = R + ext + lift * 0.4, oy = jy - ecy;
            const b = uy * oy, c = oy * oy - Re * Re, t = -b + Math.sqrt(Math.max(0, b * b - c));
            return [cx + ux * t, jy + uy * t];
        };
        const phis = [];
        for (let i = 0; i <= n; i++) phis.push(phi0 + ((phi1 - phi0) * i) / n);
        const intra = [];
        for (let i = 0; i <= 160; i++) intra.push(at(phi0 + ((phi1 - phi0) * i) / 160));
        const front = [[cx - xj, floor], ...intra, [cx + xj, floor]];
        const back = front.map(([x, y]) => [x * k, y * k]);
        const vous = [];
        for (let i = 0; i < n; i++) {
            const a = phis[i], b = phis[i + 1], inner = [], outer = [];
            for (let m = 0; m <= 8; m++) inner.push(at(a + ((b - a) * m) / 8));
            for (let m = 0; m <= 8; m++) outer.push(outAt(on(a + ((b - a) * m) / 8)));
            vous.push({ i, a, b, inner, outer, poly: [...inner, ...outer.reverse()], mid: (a + b) / 2 });
        }
        const extTop = outAt(on(1.5 * Math.PI))[1];
        const extX = outAt(on(Math.PI - a0))[0] - cx;
        return { R, cy, cx, imp, floor, k, xj, phi0, phi1, n, at, outAt, front, back, vous, extTop, extX, jy };
    }

    // One voussoir: red brick (three bricks side by side) or white limestone, painted per pixel
    // as a slab with eased, chipped arrises.
    const RED = [[0, '#3a1418'], [0.3, '#6c2a24'], [0.5, '#8e3a2e'], [0.69, '#ad4f3a'], [0.85, '#cf7a5c'], [1, '#f0b498']];
    const STONE = [[0, '#5e5a78'], [0.3, '#9690a4'], [0.5, '#c2b8b4'], [0.69, '#e4d9c8'], [0.85, '#f2e9d9'], [1, '#fdf8ee']];
    function voussoir(q, v, red, seed, jy, cx = 0) {
        const r = Motion.rng('vous' + seed), res = Math.min(3, resOf(q)), sd = S.seedOf('v' + seed);
        const a = v.poly[0], b = v.poly[8], c = v.poly[9], d = v.poly[v.poly.length - 1];
        const angA = Math.atan2(a[1] - jy, a[0] - cx), angB = Math.atan2(b[1] - jy, b[0] - cx);
        let span = angB - angA;
        if (span > Math.PI) span -= TAU;
        if (span < -Math.PI) span += TAU;
        const tOf = (x, y) => {
            let t = Math.atan2(y - jy, x - cx) - angA;
            if (t > Math.PI) t -= TAU;
            if (t < -Math.PI) t += TAU;
            return t / span;
        };
        const tones = [0.86 + r() * 0.28, 0.86 + r() * 0.28, 0.86 + r() * 0.28];
        const warm = [r(), r(), r()];
        const lerp2 = (p, qq, t) => [p[0] + (qq[0] - p[0]) * t, p[1] + (qq[1] - p[1]) * t];
        const chips = [];
        for (let k = 0; k < 3; k++) if (r() < 0.45) chips.push([...lerp2(r() < 0.5 ? a : d, r() < 0.5 ? b : c, r()), 3 + r() * 6]);
        const sp = S.form({
            box: S.bbox(v.poly, 3), res, seed: sd, light: S.LIGHT,
            mask: (g) => fillP(g, v.poly, '#fff'),
            inflate: 'bevel', R: 5, relief: 0.8,
            height: (x, y) => {
                let h = S.noise2(x * 0.08, y * 0.08, sd) * 0.6;
                for (const [cx, cy, cr] of chips) h -= 5 * S.smooth(cr, cr * 0.4, Math.hypot(x - cx, y - cy));
                if (!red) h -= 0.9 * S.smooth(0.55, 0.85, S.noise2(x * 0.5, y * 0.5, sd + 3)); // pores
                return h;
            },
            ramp: red ? RED : STONE, soft: 0.9,
            stroke: { amp: 0.05, freq: 0.06, tone: 7 }, mottle: { amp: red ? 0.07 : 0.05, freq: 0.04 },
            edge: { rough: 1.2, freq: 0.35, amp: 0.55 },
            markAmp: 0.4,
            marks: (g) => {
                if (red) {
                    for (let k = 0; k < 90; k++) {
                        const p = lerp2(lerp2(a, b, r()), lerp2(d, c, r()), r());
                        disc(g, p[0], p[1], 0.5 + r() * 1.3, r() < 0.55 ? '#303030' : '#d8d8d8');
                    }
                } else {
                    // the chisel's diagonal tool marks, in bands
                    for (let k = 0; k < 70; k++) {
                        const p = lerp2(lerp2(a, b, r()), lerp2(d, c, r()), r()), an = 0.9 + (r() - 0.5) * 0.25, l = 4 + r() * 8;
                        lineP(g, [[p[0], p[1]], [p[0] + Math.cos(an) * l, p[1] + Math.sin(an) * l]], 0.9, r() < 0.5 ? '#5a5a5a' : '#c8c8c8');
                    }
                }
            },
            tint: (x, y, tone, rgb) => {
                if (red) {
                    const t = tOf(x, y), bi = Math.max(0, Math.min(2, Math.floor(t * 3)));
                    const k = tones[bi];
                    rgb[0] *= k;
                    rgb[1] *= k * (0.95 + warm[bi] * 0.08);
                    rgb[2] *= k * (0.9 + warm[bi] * 0.12);
                }
                // a weather stain running from the top
                const n = S.noise2(x * 0.03, y * 0.012, sd + 8);
                if (n > 0.3) {
                    const k = (n - 0.3) * 0.25;
                    rgb[0] *= 1 - k;
                    rgb[1] *= 1 - k;
                    rgb[2] *= 1 - k * 0.6;
                }
            },
        });
        S.put(q, sp);
        if (red) {
            // the mortar between the three bricks, irregular and recessed
            for (const t of [1 / 3, 2 / 3]) {
                const p0 = lerp2(a, b, t + (r() - 0.5) * 0.04), p1 = lerp2(d, c, t + (r() - 0.5) * 0.04), pts = [];
                for (let k = 0; k <= 10; k++) pts.push([p0[0] + (p1[0] - p0[0]) * (k / 10) + (r() - 0.5) * 0.8, p0[1] + (p1[1] - p0[1]) * (k / 10) + (r() - 0.5) * 0.8]);
                S.dab(q, pts, { w: 2.6, color: '#d6c6b0', alpha: 0.85, bristles: 4, dry: 0.2, seed: sd + t * 9 });
                lineP(q, shift(pts, SD[0] * 1.1, SD[1] * 1.1), 0.7, 'rgba(60,20,24,0.45)');
            }
            // lime splashed at the last whitewashing
            for (let k = 0; k < 5; k++) {
                if (r() < 0.45) continue;
                const p = lerp2(lerp2(a, b, r()), lerp2(d, c, r()), r()), rr = 0.7 + r() * 2.2;
                disc(q, p[0], p[1], rr, 'rgba(250,244,236,0.85)');
                if (r() < 0.5) disc(q, p[0] + rr * 1.5, p[1] + rr * 0.8, rr * 0.4, 'rgba(250,244,236,0.8)');
            }
        } else if (r() < 0.4) {
            // a fossil shell's fragment in the limestone
            const p = lerp2(lerp2(a, b, 0.3 + r() * 0.4), lerp2(d, c, 0.3 + r() * 0.4), 0.3 + r() * 0.4);
            q.lineWidth = 0.8;
            q.strokeStyle = 'rgba(150,130,120,0.6)';
            for (let k = 0; k < 3; k++) {
                q.beginPath();
                q.arc(p[0], p[1], 2 + k * 1.3, 3.6, 5.9);
                q.stroke();
            }
        }
    }

    // The arch: voussoirs, joints, soffit, sill, imposts (and the alfiz if asked). Paints on q
    // (the wall's layer, after the wall). Returns the geometry.
    //   o: archGeom's, plus seed, alfiz: { pad, top } | null, imposts: true, sill: true,
    //      jamb: '#hex' the jamb soffit's lime, first: 0|1 which colour the first voussoir is
    function arch(q, o) {
        const A = archGeom(o), r = rng('arch' + o.seed);
        // the alfiz first: a raised frame round the arch, its spandrels lime-washed
        if (o.alfiz) {
            const pad = o.alfiz.pad ?? 28, top = A.extTop - (o.alfiz.top ?? 34), xa = A.extX + pad, bw = o.alfiz.w ?? 22, y1 = A.imp, c0 = A.cx;
            const bars = [
                [[c0 - xa - bw, top - bw], [c0 + xa + bw, top - bw], [c0 + xa + bw, top], [c0 - xa - bw, top]],
                [[c0 - xa - bw, top], [c0 - xa, top], [c0 - xa, y1], [c0 - xa - bw, y1]],
                [[c0 + xa, top], [c0 + xa + bw, top], [c0 + xa + bw, y1], [c0 + xa, y1]],
            ];
            for (const b of bars) {
                S.cast(q, (c) => fillP(c, b, '#000'), { blur: 4, dx: 5, dy: 6, color: 'rgba(60,56,100,0.32)' });
                S.piece(q, b, { fill: o.alfiz.color ?? '#e6d3c2', line: 0, shade: { color: '#6c6a92', alpha: 0.45, w: 6, push: 3 }, light: { color: '#fffaf4', alpha: 0.85, w: 4, push: 2 },
                    detail: (c) => {
                        // a groove run along the band, and the plaster's own wear
                        const [p0, p1, p2, p3] = b, horiz = Math.abs(p1[0] - p0[0]) > Math.abs(p3[1] - p0[1]);
                        const mid = horiz ? [[p0[0], (p0[1] + p3[1]) / 2], [p1[0], (p1[1] + p2[1]) / 2]] : [[(p0[0] + p1[0]) / 2, p0[1]], [(p3[0] + p2[0]) / 2, p3[1]]];
                        lineP(c, mid, 1.6, 'rgba(80,74,110,0.4)');
                        lineP(c, shift(mid, -L2[0] * -1.3, -L2[1] * -1.3), 0.8, 'rgba(255,250,242,0.7)');
                        for (let k = 0; k < 40; k++) {
                            const t = r(), u = r();
                            disc(c, p0[0] + (p1[0] - p0[0]) * t + (p3[0] - p0[0]) * u, p0[1] + (p3[1] - p0[1]) * u + (p1[1] - p0[1]) * t, 0.5 + r() * 1.4, r() < 0.5 ? 'rgba(120,100,110,0.3)' : 'rgba(255,250,240,0.5)');
                        }
                    } });
            }
        }
        if (o.clipX) {
            q.save();
            q.beginPath();
            q.rect(o.clipX[0], -3000, o.clipX[1] - o.clipX[0], 6000);
            q.clip();
        }
        if (!o.plain) A.vous.forEach((v, i) => voussoir(q, v, (i + (o.first ?? 0)) % 2 === 0, S.seedOf(o.seed) + i * 13, A.jy, A.cx));
        // the joints: recessed lime mortar, a dark line under a light one
        for (let i = 0; i <= A.n && !o.plain; i++) {
            const v = A.vous[Math.min(i, A.n - 1)], p = i < A.n ? v.inner[0] : v.inner[8], e = i < A.n ? v.poly[v.poly.length - 1] : v.poly[9];
            const pts = [];
            for (let m = 0; m <= 8; m++) pts.push([p[0] + (e[0] - p[0]) * (m / 8) + (r() - 0.5) * 0.9, p[1] + (e[1] - p[1]) * (m / 8) + (r() - 0.5) * 0.9]);
            S.dab(q, pts, { w: 3.4, color: '#d9ccb8', alpha: 0.9, bristles: 5, dry: 0.15, seed: i * 7 + 1 });
            lineP(q, shift(pts, SD[0] * 1.2, SD[1] * 1.2), 1, 'rgba(60,44,60,0.5)');
            lineP(q, shift(pts, -SD[0] * 1.1, -SD[1] * 1.1), 0.6, 'rgba(255,250,240,0.55)');
        }
        // the extrados' edge where the voussoirs meet the lime
        const outerLine = [];
        for (const v of A.vous) for (let m = v.poly.length - 1; m > 8; m--) outerLine.push(v.poly[m]);
        if (!o.plain) softly(q, 1.5, (c) => lineP(c, outerLine, 2.4, 'rgba(90,70,90,0.28)'));
        if (o.clipX) q.restore();
        if (o.surround) {
            // a band painted round the opening in ochre (or almagra), by hand: its edges waver
            const inner = A.front.slice(1, -1), band = o.surround.w ?? 26;
            const outer = inner.map(([x, y]) => {
                const dx = x - A.cx, dy = y - A.cy, L = Math.hypot(dx, dy) || 1;
                return y > A.imp ? [x + Math.sign(dx) * band, y] : [x + (dx / L) * band, y + (dy / L) * band];
            });
            const lo = [[A.cx - A.xj - band, A.floor - (o.dado ?? 0)], ...outer, [A.cx + A.xj + band, A.floor - (o.dado ?? 0)]];
            const hi = [[A.cx - A.xj, A.floor - (o.dado ?? 0)], ...inner, [A.cx + A.xj, A.floor - (o.dado ?? 0)]];
            const poly = [...lo, ...hi.reverse()].map(([x, y], i) => [x + S.noise2(i * 0.3, 1, 7) * 1.2, y + S.noise2(i * 0.3, 2, 7) * 1.2]);
            q.save();
            path(q, poly);
            q.clip();
            fillP(q, poly, o.surround.color ?? '#d9a24a');
            for (let i = 0; i < 70; i++) {
                const p = lo[Math.floor(r() * lo.length)];
                S.dab(q, [[p[0] - 20, p[1] + (r() - 0.5) * 40], [p[0] + 20, p[1] + (r() - 0.5) * 40]], { w: 10 + r() * 14, color: r() < 0.5 ? '#fff4dc' : '#9a5a24', alpha: 0.14, bristles: 8, dry: 0.5, seed: i });
            }
            // where it has worn off, the lime under it
            for (let i = 0; i < 26; i++) {
                const p = lo[Math.floor(r() * lo.length)];
                fillP(q, blob(p[0] + (r() - 0.5) * band, p[1] + (r() - 0.5) * band, 2 + r() * 7, 1.5 + r() * 4, 'sw' + i, 10, 0.5, r() * 3), 'rgba(246,236,226,0.85)');
            }
            q.restore();
        }
        // the soffit: the arch's thickness seen inside it, shaded by which way it faces
        const facing = (nx, ny) => S.clamp(0.5 + 0.5 * (nx * L2[0] + ny * L2[1]) * 1.3);
        const soffit = (poly, base, nx, ny, kind) => {
            const f = facing(nx, ny);
            fillP(q, poly, base);
            q.save();
            path(q, poly);
            q.clip();
            if (kind === 'red') for (let k = 0; k < 10; k++) {
                const t = r();
                const a = [poly[0][0] + (poly[1][0] - poly[0][0]) * t, poly[0][1] + (poly[1][1] - poly[0][1]) * t], b = [poly[3][0] + (poly[2][0] - poly[3][0]) * t, poly[3][1] + (poly[2][1] - poly[3][1]) * t];
                lineP(q, [a, b], 0.6, 'rgba(70,24,24,0.3)');
            }
            for (let k = 0; k < 24; k++) {
                const t = r(), u = r();
                const a = [poly[0][0] + (poly[1][0] - poly[0][0]) * t, poly[0][1] + (poly[1][1] - poly[0][1]) * t], b = [poly[3][0] + (poly[2][0] - poly[3][0]) * t, poly[3][1] + (poly[2][1] - poly[3][1]) * t];
                disc(q, a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, 0.6 + r() * 1.4, r() < 0.5 ? 'rgba(90,70,80,0.3)' : 'rgba(255,248,240,0.35)');
            }
            q.fillStyle = f > 0.5 ? `rgba(255,226,204,${(f - 0.5) * 0.55})` : `rgba(74,66,110,${(0.5 - f) * 0.75})`;
            q.fillRect(-4000, -4000, 8000, 8000);
            q.restore();
        };
        const kk = A.k;
        A.vous.forEach((v, i) => {
            const red = !o.plain && (i + (o.first ?? 0)) % 2 === 0;
            const a = v.inner[0], b = v.inner[8];
            const poly = [...v.inner, ...v.inner.slice().reverse().map(([x, y]) => [x * kk, y * kk])];
            const m = A.at(v.mid), nx = -(m[0] - A.cx) / A.R, ny = -(m[1] - A.cy) / A.R;
            soffit(poly, red ? '#b2563e' : o.plain ? '#ece0d8' : '#eadcc8', nx, ny, red ? 'red' : 'white');
            void a, b;
        });
        // the jambs' faces, lime-washed, and the sill
        const L0 = A.cx - A.xj, R0 = A.cx + A.xj;
        const jl = [[L0, A.imp], [L0, A.floor], [L0 * kk, A.floor * kk], [L0 * kk, A.imp * kk]];
        const jr = [[R0, A.imp], [R0, A.floor], [R0 * kk, A.floor * kk], [R0 * kk, A.imp * kk]];
        // which way a jamb faces depends on which side of the axis it stands
        if (o.jambs !== false && L0 * kk > L0) soffit(jl, o.jamb ?? '#e8dcd6', 1, 0);
        if (o.jambs !== false && R0 * kk < R0) soffit(jr, o.jamb ?? '#efe2d8', -1, 0);
        for (const j of [jl, jr]) {
            // grime where hands and shoulders brush the jambs, a few scuffs
            q.save();
            path(q, j);
            q.clip();
            for (let k = 0; k < 40; k++) {
                const t = r(), y = A.imp + (A.floor - A.imp) * (0.3 + r() * 0.6);
                disc(q, j[0][0] + (j[3][0] - j[0][0]) * t, y, 0.6 + r() * 1.8, `rgba(120,100,110,${0.1 + r() * 0.2})`);
            }
            const gr = q.createLinearGradient(0, A.floor - 60, 0, A.floor);
            gr.addColorStop(0, 'rgba(110,104,90,0)');
            gr.addColorStop(1, 'rgba(110,104,90,0.35)');
            q.fillStyle = gr;
            q.fillRect(-4000, A.floor - 60, 8000, 60);
            q.restore();
        }
        if (o.sill !== false) {
            const sill = [[L0, A.floor], [R0, A.floor], [R0 * kk, A.floor * kk], [L0 * kk, A.floor * kk]];
            fillP(q, sill, '#ddd5cd');
            q.save();
            path(q, sill);
            q.clip();
            // veins of the marble, and the hollow worn in its middle
            for (let k = 0; k < 9; k++) {
                const y = A.floor * kk + r() * (A.floor - A.floor * kk), pts = [];
                for (let x = L0; x <= R0; x += 12) pts.push([x, y + 4 * S.noise2(x / 40, k, 3) + ((x - A.cx) / A.xj) * (r() - 0.5) * 8]);
                lineP(q, pts, 0.5 + r() * 0.8, `rgba(120,120,140,${0.2 + r() * 0.25})`);
            }
            const gr = q.createRadialGradient(A.cx, A.floor * (1 + kk) / 2, 4, A.cx, A.floor * (1 + kk) / 2, A.xj * 0.6);
            gr.addColorStop(0, 'rgba(255,246,236,0.55)');
            gr.addColorStop(1, 'rgba(255,246,236,0)');
            q.fillStyle = gr;
            q.fillRect(L0 - 40, A.floor * kk, A.xj * 2 + 80, A.floor * (1 - kk));
            q.fillStyle = 'rgba(70,60,80,0.35)';
            q.fillRect(L0 - 40, A.floor - 2.2, A.xj * 2 + 80, 2.2);
            q.restore();
            lineP(q, [[L0 * kk, A.floor * kk], [R0 * kk, A.floor * kk]], 1.4, 'rgba(255,252,246,0.85)');
        }
        // the back arris: a thin light where the soffit turns into the far face
        lineP(q, A.back.slice(1, -1), 1.1, 'rgba(255,240,226,0.35)');
        // imposts: a moulded block at each springing, casting on the jamb below
        if (o.imposts !== false) {
            for (const sgn of [-1, 1]) {
                const x0 = A.cx + sgn * A.xj, w = 34, h = 15;
                const blk = sgn < 0 ? [[x0 - w, A.imp - h], [x0 + 3, A.imp - h], [x0 + 3, A.imp], [x0 - 2, A.imp + 4], [x0 - w, A.imp + 4]] : [[x0 - 3, A.imp - h], [x0 + w, A.imp - h], [x0 + w, A.imp + 4], [x0 + 2, A.imp + 4], [x0 - 3, A.imp]];
                S.cast(q, (c) => fillP(c, blk, '#000'), { blur: 5, dx: 6, dy: 9, color: 'rgba(56,52,96,0.4)' });
                S.piece(q, blk, { fill: '#ece2d4', line: 0, shade: { color: '#6a6890', alpha: 0.55, w: 5, push: 2.5 }, light: { color: '#fffaf2', alpha: 0.85, w: 3, push: 1.5 } });
                lineP(q, [[blk[0][0], A.imp - h + 5], [blk[1][0], A.imp - h + 5]], 1.1, 'rgba(90,84,120,0.45)');
                lineP(q, [[blk[0][0], A.imp - h + 9], [blk[1][0], A.imp - h + 9]], 0.9, 'rgba(255,250,240,0.6)');
            }
        }
        return A;
    }

    // ------------------------------------------------------------------ the column
    // A marble column (reused, as in Córdoba: no two shafts alike) with a caliphal capital
    // drilled like a wasp's nest and an Attic base. (x, top) the capital's top, foot: the floor.
    //   1 the shaft's veins and its polish; 2 the entasis; 3 a chip at the base's torus;
    //   4 the capital's drilled acanthus, deep holes in shadow; 5 the volutes at its corners;
    //   6 the abacus; 7 the astragal ring under the capital; 8 dirt and lime splashes low on
    //   the shaft; 9 a tide of damp at the foot; 10 the shaft a little leaning.
    const MARBLE = {
        rose: [[0, '#4e3440'], [0.3, '#86606a'], [0.5, '#b08a8e'], [0.68, '#d4b2ac'], [0.84, '#ecd6cc'], [1, '#fbf1ea']],
        blue: [[0, '#363c56'], [0.3, '#666e8a'], [0.5, '#9098ae'], [0.68, '#bcc2d0'], [0.84, '#dfe2ea'], [1, '#f7f8fb']],
        white: [[0, '#56546c'], [0.3, '#8e8ca0'], [0.5, '#bcb8c2'], [0.68, '#ddd8d8'], [0.84, '#efebe6'], [1, '#fdfbf8']],
    };
    function column(g, { x = 0, top = 0, foot = 400, r: rad = 17, seed = 'c', marble = 'rose' } = {}) {
        const res = resOf(g), r = rng('col' + seed), sd = S.seedOf('col' + seed);
        const capH = 46, baseH = 30, y0 = top + capH + 6, y1 = foot - baseH;
        const lean = (r() - 0.5) * 2;
        const hw = (y) => rad * (1 + 0.035 * Math.sin(((y - y0) / (y1 - y0)) * Math.PI)) * (1 - 0.06 * ((y - y0) / (y1 - y0)));
        const shaft = [];
        for (let k = 0; k <= 20; k++) {
            const y = y0 + ((y1 - y0) * k) / 20;
            shaft.push([x - hw(y) + lean * (k / 20), y]);
        }
        for (let k = 20; k >= 0; k--) {
            const y = y0 + ((y1 - y0) * k) / 20;
            shaft.push([x + hw(y) + lean * (k / 20), y]);
        }
        const sp = S.form({
            box: { x: x - rad * 1.4, y: y0 - 2, w: rad * 2.8, h: y1 - y0 + 4 }, res, seed: sd,
            mask: (q) => fillP(q, shaft, '#fff'), inflate: 'none',
            height: (px, py) => {
                const h = hw(py), dx = (px - x) / h;
                return h * Math.sqrt(Math.max(0, 1 - dx * dx));
            },
            ramp: MARBLE[marble], soft: 0.9, mottle: { amp: 0.07, freq: 0.03 }, stroke: { amp: 0.04, freq: 0.05 },
            spec: { amp: 0.55, power: 26, from: 0.4, to: 0.9, ragged: 0.3, color: '#fff8f2' },
            tint: (px, py, tone, rgb) => {
                // veins, wandering down the shaft
                const v = Math.abs(S.noise2(px / 9 + S.noise2(py / 60, 1, sd) * 2, py / 50, sd + 1));
                const k = S.smooth(0.06, 0.0, v) * 0.45;
                toward(rgb, rgb[0] * 0.55, rgb[1] * 0.5, rgb[2] * 0.6, k);
                const w = S.smooth(0.03, 0.0, Math.abs(S.noise2(px / 6, py / 30, sd + 2) - 0.4)) * 0.3;
                toward(rgb, 250, 246, 240, w);
                // dirt and damp near the foot
                toward(rgb, 120, 110, 100, S.smooth(y1 - 70, y1, py) * 0.25);
            },
        });
        S.put(g, sp);
        // the astragal under the capital
        const astr = [[x - rad - 2, y0 - 6], [x + rad + 2, y0 - 6], [x + rad + 2, y0 + 1], [x - rad - 2, y0 + 1]];
        S.piece(g, astr, { fill: '#e6ddd6', line: 0, shade: { color: '#5a5878', alpha: 0.5, w: 4 }, light: { color: '#ffffff', alpha: 0.7, w: 3 } });
        // the capital: a bell widening to the abacus, drilled all over
        const cap = [[x - rad - 2, top + capH], [x - rad * 1.9, top + 12], [x - rad * 2.25, top + 6], [x - rad * 2.3, top], [x + rad * 2.3, top], [x + rad * 2.25, top + 6], [x + rad * 1.9, top + 12], [x + rad + 2, top + capH]];
        S.piece(g, S.curve(cap, true, 4), {
            fill: '#ece4da', line: 0, shade: [{ color: '#4a4868', alpha: 0.5, w: 10, push: 5 }, { color: '#6a6890', alpha: 0.3, w: 26 }], light: { color: '#fffaf4', alpha: 0.7, w: 7 },
            detail: (q) => {
                // two tiers of acanthus, every leaf a ridge between drilled holes
                for (let tier = 0; tier < 2; tier++) {
                    const yy = top + capH - 8 - tier * 16, wd = rad * (1.1 + tier * 0.55);
                    for (let k = -3; k <= 3; k++) {
                        const lx = x + (k / 3) * wd, ly = yy;
                        fillP(q, [[lx - 4, ly + 6], [lx, ly - 9], [lx + 4, ly + 6]], 'rgba(255,252,246,0.75)');
                        for (let m = 0; m < 4; m++) {
                            const hx = lx + 5 + (r() - 0.5) * 2, hy = ly - 6 + m * 4;
                            disc(q, hx, hy, 1.4, 'rgba(40,36,60,0.85)');
                            disc(q, hx - 0.5, hy - 0.6, 0.6, 'rgba(20,16,30,0.9)');
                        }
                    }
                }
                // the volutes at the corners
                for (const sx of [-1, 1]) {
                    q.lineWidth = 2;
                    q.strokeStyle = 'rgba(60,56,90,0.6)';
                    q.beginPath();
                    q.arc(x + sx * rad * 1.95, top + 9, 4.5, 0, TAU * 0.8);
                    q.stroke();
                    disc(q, x + sx * rad * 1.95, top + 9, 1.4, 'rgba(40,36,60,0.8)');
                }
            },
        });
        const aba = [[x - rad * 2.4, top - 7], [x + rad * 2.4, top - 7], [x + rad * 2.4, top], [x - rad * 2.4, top]];
        S.piece(g, aba, { fill: '#e2d8ce', line: 0, shade: { color: '#4a4868', alpha: 0.55, w: 4 }, light: { color: '#ffffff', alpha: 0.75, w: 3 } });
        // the base: plinth, torus, scotia, torus
        const base = (yA, yB, wA, wB, fill) => {
            const pts = S.curve([[x - wA, yA], [x - wB, (yA + yB) / 2], [x - wA, yB], [x + wA, yB], [x + wB, (yA + yB) / 2], [x + wA, yA]], true, 4);
            S.piece(g, pts, { fill, line: 0, shade: { color: '#4a4868', alpha: 0.55, w: 6, push: 3 }, light: { color: '#fffaf4', alpha: 0.7, w: 4 } });
        };
        base(y1, y1 + 8, rad + 3, rad + 6, '#e8e0d8');
        base(y1 + 8, y1 + 14, rad + 3, rad + 1, '#cfc6c0');
        base(y1 + 14, y1 + 22, rad + 6, rad + 9, '#e8e0d8');
        const pl = [[x - rad - 11, y1 + 22], [x + rad + 11, y1 + 22], [x + rad + 11, foot], [x - rad - 11, foot]];
        S.piece(g, pl, { fill: '#ddd4cc', line: 0, shade: { color: '#4a4868', alpha: 0.5, w: 8 }, light: { color: '#ffffff', alpha: 0.5, w: 4 } });
        if (r() < 0.7) disc(g, x + rad + 5, y1 + 17, 3, '#b8aea6'); // a chip in the torus
    }

    // ------------------------------------------------------------------ the peacock
    // THE PEACOCK (Pavo cristatus, a cock in his train), standing on a bench in profile; the
    // pair confronted as on the ivory caskets of Madinat al-Zahra (pyxis of al-Mughira).
    //   1 the neck and breast cobalt, green-gold at the nape, the feathers as small scales
    //   2 the crest: bare shafts with a fan of blue-green at each tip
    //   3 the face: white stripes above and below the eye, a dark eye with its light
    //   4 the back's feathers green-bronze scales, each with a dark rim
    //   5 the folded wing: coverts barred black on buff («tortoiseshell»), the primaries chestnut
    //   6 the train: long coverts of loose bronze-green barbs, each ending in an eye
    //   7 the eye (ocellus): a violet-blue heart with a notch, a turquoise ring, a bronze ring,
    //     a gold-green ring, then a fringe of loose barbs
    //   8 shorter coverts lie over the longer, so the eyes come in staggered rows
    //   9 the legs grey-brown with scutes, a spur, toes gripping the bench's edge
    //   10 a moulted feather lying on the floor (the caller's)
    // (x, y) the feet on the bench's top; at s = 1 the bird is 330 tall to the crest's tips,
    // its body 200 long, its train hanging 170 below the feet (to the floor) and 260 behind.
    // flip: faces left. The light stays at the top left either way.
    const NECK = [[0, '#0b1236'], [0.2, '#16246a'], [0.4, '#1d3d92'], [0.58, '#2558b0'], [0.74, '#3a7ec4'], [0.88, '#72b0da'], [1, '#c8e6f2']];
    const BRONZE = [[0, '#141e10'], [0.25, '#28401e'], [0.45, '#3f6228'], [0.62, '#647e30'], [0.78, '#9a9a3e'], [0.9, '#cbbf6a'], [1, '#ece2a8']];
    const BUFF = [[0, '#3a2c22'], [0.3, '#7a6448'], [0.5, '#ab9370'], [0.68, '#cdb894'], [0.84, '#e6d6b6'], [1, '#faf0dc']];
    function peacock(g, { x = 0, y = 0, s = 1, flip = false, seed = 'p', drop = 160 } = {}) {
        const res = resOf(g, s), k = flip ? -1 : 1, r = rng('pea' + seed), sd = S.seedOf('pea' + seed);
        const F = (p) => [p[0] * k, p[1]];
        const Fp = (pts) => pts.map(F);
        const box = { x: -400, y: -380, w: 800, h: drop + 60 + 380 };
        const sp = S.sheet(box, res, (q) => {
            const light = flip ? [-S.LIGHT[0] * -1, S.LIGHT[1], S.LIGHT[2]] : S.LIGHT;
            void light;
            // ---- the train: from the rump, down over the bench's edge to the floor, pooling
            const rump = [-140, -112];
            const C = (t) => {
                // the train's middle line, t 0 … 1
                const p0 = rump, p1 = [-200, -40], p2 = [-232, drop - 20], p3 = [-300, drop + 10];
                const u = 1 - t;
                return [u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0], u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1]];
            };
            const width = (t) => 40 + 190 * Math.pow(t, 0.8);
            const feathers = [];
            for (let i = 0; i < 115; i++) {
                const len = Math.pow(r(), 0.7), u = (r() - 0.5) * 2;
                feathers.push({ t: 0.18 + len * 0.82, u, seedF: i });
            }
            // the longest first: the shorter lie on top of them
            feathers.sort((a, b) => b.t - a.t);
            // the train's mass under the feathers: dark bronze
            const mass = [];
            for (let i = 0; i <= 20; i++) mass.push((([cx, cy], w) => [cx - w * 0.5, cy])(C(i / 20), width(i / 20)));
            for (let i = 20; i >= 0; i--) mass.push((([cx, cy], w) => [cx + w * 0.5, cy])(C(i / 20), width(i / 20)));
            fillP(q, Fp(mass), '#26341c');
            // the mass is itself loose barbs, bronze and green, falling down the train
            {
                const rb = Motion.rng('mass' + seed);
                q.lineWidth = 0.7;
                for (let i = 0; i < 1400; i++) {
                    const t = 0.05 + rb() * 0.95, u = (rb() - 0.5), c0 = C(t), w0 = width(t), c1 = C(Math.min(1, t + 0.04));
                    const p0 = [c0[0] + u * w0, c0[1]], p1 = [c1[0] + u * width(Math.min(1, t + 0.04)) + (rb() - 0.5) * 4, c1[1] + 4];
                    const lit = S.clamp(0.4 + u * -0.6 * k + (rb() - 0.5) * 0.4);
                    q.strokeStyle = css(lit > 0.5 ? mixRGB(hex('#4e6a28'), hex('#b8b05a'), (lit - 0.5) * 2) : mixRGB(hex('#18240f'), hex('#4e6a28'), lit * 2), 0.8);
                    q.beginPath();
                    q.moveTo(...F(p0));
                    q.lineTo(...F(p1));
                    q.stroke();
                }
            }
            for (const f of feathers) {
                const rr = Motion.rng('feather' + seed + f.seedF);
                const end = C(f.t), w = width(f.t);
                const ex = end[0] + f.u * w * 0.45, ey = end[1] - Math.abs(f.u) * 10;
                const base = [rump[0] + f.u * 10, rump[1] + 6];
                const mid = C(f.t * 0.5);
                const shaft = S.curve([base, [mid[0] + f.u * width(f.t * 0.5) * 0.4, mid[1]], [ex, ey]], false, 8);
                const sz = (0.5 + f.t * 0.75) * (0.85 + rr() * 0.3); // eyes grow down the train
                // loose barbs along the shaft: golden-green, lit on the side towards the lamp
                q.lineWidth = 0.6;
                for (let m = 4; m < shaft.length - 1; m++) {
                    const p = shaft[m], nx = shaft[m + 1][0] - p[0], ny = shaft[m + 1][1] - p[1], nl = Math.hypot(nx, ny) || 1;
                    for (const side of [-1, 1]) {
                        const bl = (5 + rr() * 9) * sz, ba = Math.atan2(ny, nx) + side * (0.5 + rr() * 0.4);
                        const lit = S.clamp(0.45 + 0.4 * (Math.cos(ba) * L2[0] * k + Math.sin(ba) * L2[1]) + (rr() - 0.5) * 0.3);
                        const c = lit > 0.5 ? mixRGB(hex('#6a7a2e'), hex('#d6c46a'), (lit - 0.5) * 2) : mixRGB(hex('#1e2c16'), hex('#6a7a2e'), lit * 2);
                        q.strokeStyle = css(c, 0.75);
                        q.beginPath();
                        const P0 = F(p), P1 = F([p[0] + Math.cos(ba) * bl, p[1] + Math.sin(ba) * bl + bl * 0.3]);
                        q.moveTo(P0[0], P0[1]);
                        q.lineTo(P1[0], P1[1]);
                        q.stroke();
                    }
                    void nl;
                }
                q.lineWidth = 0.8;
                q.strokeStyle = 'rgba(214,200,160,0.7)';
                path(q, Fp(shaft), false);
                q.stroke();
                // the eye at the tip
                const dir = Math.atan2(ey - shaft[shaft.length - 3][1], ex - shaft[shaft.length - 3][0]);
                ocellus(q, F([ex, ey]), flip ? Math.PI - dir : dir, 15 * sz, rr);
            }
            // the shade the body throws on the train's root
            S.cast(q, (c) => oval(c, ...F([-60, -112]), 90, 46, 0, '#000'), { blur: 14, dx: 8 * k, dy: 16, color: 'rgba(10,20,10,0.5)' });
            // ---- the legs, their tops lost in the belly's feathers
            leg(q, F, -12, k, r);
            leg(q, F, 12, k, r);
            // ---- body and neck: one lit volume, cobalt
            const bodyPts = S.curve([[-150, -128], [-100, -150], [-40, -160], [10, -160], [34, -170], [44, -200], [50, -232], [60, -262], [74, -288], [88, -304], [100, -306], [104, -292], [94, -280], [86, -258], [80, -228], [82, -198], [92, -172], [101, -146], [97, -118], [80, -94], [40, -78], [-10, -74], [-60, -80], [-110, -94], [-142, -108]], true, 6);
            const bb = S.bbox(bodyPts, 6);
            const bodyF = Fp(bodyPts), bbF = S.bbox(bodyF, 6);
            const body = S.form({
                box: bbF, res, seed: sd, mask: (c) => fillP(c, bodyF, '#fff'), inflate: 'round', relief: 0.7,
                ramp: NECK, soft: 0.88, stroke: { amp: 0.06, freq: 0.12, tone: 8 },
                spec: { amp: 0.42, power: 12, from: 0.45, to: 0.95, ragged: 0.6, color: '#a6d6ee' },
                markAmp: 0.26,
                marks: (c) => {
                    // the small feathers of the neck and breast, as scales, each its own
                    for (let yy = bb.y; yy < bb.y + bb.h; yy += 3.6 + r() * 1.4) {
                        for (let xx = bb.x + r() * 4; xx < bb.x + bb.w; xx += 4.4 + r() * 2) {
                            const [X, Y] = F([xx + (r() - 0.5) * 2, yy + (r() - 0.5) * 2]), rr = 1.8 + r() * 1.4;
                            c.lineWidth = 0.6 + r() * 0.5;
                            c.strokeStyle = r() < 0.7 ? '#404040' : '#606060';
                            c.beginPath();
                            c.arc(X, Y, rr, 0.35, Math.PI - 0.35);
                            c.stroke();
                            c.strokeStyle = '#b8b8b8';
                            c.beginPath();
                            c.arc(X, Y - 0.9, rr * 0.8, 0.6, Math.PI - 0.6);
                            c.stroke();
                        }
                    }
                },
                tint: (px, py, tone, rgb) => {
                    const ux = px * k;
                    // green-gold over the nape and down the back of the neck
                    const nape = S.smooth(8, -14, ux - (py + 300) * 0.25 - 48) * S.smooth(-160, -240, py);
                    toward(rgb, rgb[0] * 0.5 + 24 * tone, rgb[1] * 1.08 + 30 * tone, rgb[2] * 0.6, nape * 0.55);
                    // the back, above the wing: bronze-green scales
                    const back = S.smooth(-138, -152, py) * S.smooth(30, 4, ux);
                    toward(rgb, 46 + 96 * tone, 64 + 90 * tone, 34 + 40 * tone, back * 0.85);
                    // the belly dark, almost black-blue
                    toward(rgb, rgb[0] * 0.5, rgb[1] * 0.5, rgb[2] * 0.6, S.smooth(-80, -62, py) * 0.6);
                },
            });
            S.put(q, body);
            // ---- the wing, folded on the side: barred coverts, chestnut primaries
            const wingPts = S.curve([[-118, -140], [-60, -150], [0, -150], [38, -134], [34, -110], [0, -96], [-60, -92], [-122, -104], [-150, -118]], true, 6);
            const wingF = Fp(wingPts);
            const wing = S.form({
                box: S.bbox(wingF, 4), res, seed: sd + 2, mask: (c) => fillP(c, wingF, '#fff'), inflate: 'round', relief: 0.35,
                ramp: BUFF, soft: 0.9, mottle: { amp: 0.05, freq: 0.05 },
                markAmp: 0.5,
                marks: (c) => {
                    // the coverts as overlapping feathers, each barred
                    for (let row = 0; row < 4; row++) {
                        for (let i = 0; i < 9; i++) {
                            const cx = -120 + i * 18 + row * 8, cy = -140 + row * 11;
                            const [X, Y] = F([cx, cy]);
                            c.lineWidth = 1.2;
                            c.strokeStyle = '#2a2a2a';
                            c.beginPath();
                            c.arc(X, Y, 9, 0.2, Math.PI - 0.2);
                            c.stroke();
                        }
                    }
                },
                tint: (px, py, tone, rgb) => {
                    const ux = px * k;
                    // black bars across the buff, wavering
                    // fine black vermiculation across the buff, broken and wavering
                    const bar = Math.sin(ux * 0.55 + py * 1.3 + S.noise2(ux * 0.08, py * 0.08, sd) * 4 + S.noise2(ux * 0.3, py * 0.3, sd + 1) * 0.8);
                    const kb = S.smooth(0.45, 0.8, bar) * S.smooth(-98, -112, py) * (0.55 + 0.45 * S.noise2(ux * 0.2, py * 0.2, sd + 2));
                    toward(rgb, 46, 34, 30, S.clamp(kb));
                    // the chestnut primaries at the wing's rear and bottom
                    const pr = S.smooth(-70, -105, ux) * S.smooth(-124, -106, py);
                    toward(rgb, 130 + 70 * tone, 62 + 46 * tone, 28 + 26 * tone, pr * 0.92);
                },
            });
            S.cast(q, (c) => c.drawImage(wing.canvas, wing.box.x, wing.box.y, wing.box.w, wing.box.h), { blur: 5, dx: 3 * k, dy: 6, color: 'rgba(8,10,30,0.5)' });
            S.put(q, wing);
            // the primaries' tips, one by one
            for (let i = 0; i < 6; i++) {
                const p0 = [-112 + i * 6, -102 + i * 1.5], p1 = [-138 - i * 1.5, -98 + i * 3];
                S.ink(q, Fp([p0, [(p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2 + 2], p1]), { w: 4.4, color: i % 2 ? '#6e3a22' : '#864628', taper: [0, 1] });
                S.ink(q, Fp([p0, p1]), { w: 0.6, color: 'rgba(240,200,150,0.5)', taper: [0, 1] });
            }
            // ---- the head: face stripes, eye, bill, and the crest
            const head = S.curve([[86, -300], [92, -314], [104, -318], [114, -312], [121, -303], [112, -297], [100, -292], [90, -292]], true, 5);
            S.piece(q, Fp(head), { fill: '#2650a4', line: 0, shade: { color: '#0a1030', alpha: 0.6, w: 6 }, light: { color: '#8ccaea', alpha: 0.45, w: 4 } });
            // the face: a white stripe over the eye and one under it, the bare skin, the eye
            S.ink(q, Fp([[116, -305], [108, -309], [99, -308], [92, -304]]), { w: 2.4, color: '#f4f2ea', taper: [0.6, 1] });
            S.ink(q, Fp([[117, -300], [109, -297], [100, -297], [94, -299]]), { w: 2.2, color: '#efede4', taper: [0.6, 1] });
            disc(q, ...F([109, -303]), 2.2, '#1a1410');
            disc(q, ...F([108.4, -303.8]), 0.7, '#ffffff');
            fillP(q, Fp([[119, -305], [131, -301], [119, -298]]), '#8a8078');
            lineP(q, Fp([[120, -301.5], [130, -301]]), 0.5, 'rgba(40,30,30,0.7)');
            disc(q, ...F([122, -302.5]), 0.6, '#3a3030');
            for (let i = 0; i < 22; i++) {
                const a = -Math.PI / 2 + (i / 21 - 0.5) * 1.0 - 0.12, l = 30 + r() * 7;
                const b0 = [98 + (i / 21) * 10, -314], tip = [b0[0] + Math.cos(a) * l, b0[1] + Math.sin(a) * l];
                lineP(q, Fp([b0, tip]), 0.55, '#33384a');
                const tF = F(tip);
                oval(q, tF[0], tF[1] - 1, 2.4, 4, (a + Math.PI / 2) * k, i % 3 ? '#245e98' : '#2e7e74');
                oval(q, tF[0] - 0.6, tF[1] - 2, 1, 1.8, a, 'rgba(190,236,246,0.55)');
            }
        });
        // its shadow on the wall behind and the bench under it
        castSprite(g, sp, { x, y, s, dx: 26 * s, dy: 30 * s, blur: 10, alpha: 0.3, color: SHADOW });
        S.put(g, sp, { x, y, s });
    }
    // One eye of the train, centred at c, its long axis along `a`, `sz` its half-length.
    function ocellus(q, c, a, sz, rr) {
        q.save();
        q.translate(c[0], c[1]);
        q.rotate(a);
        // the fringe of loose barbs round it
        q.lineWidth = 0.5;
        for (let m = 0; m < 26; m++) {
            const t = (m / 26) * TAU, l = sz * (1.25 + rr() * 0.5);
            q.strokeStyle = m % 2 ? 'rgba(150,160,70,0.6)' : 'rgba(90,110,46,0.6)';
            q.beginPath();
            q.moveTo(Math.cos(t) * sz * 0.9, Math.sin(t) * sz * 0.65);
            q.lineTo(Math.cos(t) * l, Math.sin(t) * l * 0.7);
            q.stroke();
        }
        oval(q, 0, 0, sz, sz * 0.72, 0, '#8aa63e'); // gold-green
        oval(q, -sz * 0.06, 0, sz * 0.78, sz * 0.58, 0, '#b07a34'); // bronze
        oval(q, -sz * 0.12, 0, sz * 0.6, sz * 0.46, 0, '#2aa0a0'); // turquoise
        // the heart: violet-blue, notched at the end towards the shaft
        q.fillStyle = '#1e1c6a';
        q.beginPath();
        q.ellipse(-sz * 0.16, 0, sz * 0.4, sz * 0.32, 0, 0, TAU);
        q.fill();
        oval(q, -sz * 0.5, 0, sz * 0.09, sz * 0.12, 0, '#2aa0a0');
        oval(q, -sz * 0.22, -sz * 0.1, sz * 0.18, sz * 0.1, -0.3, 'rgba(130,140,230,0.55)'); // its sheen
        oval(q, sz * 0.3, -sz * 0.18, sz * 0.22, sz * 0.12, 0.3, 'rgba(255,240,190,0.35)');
        q.restore();
    }
    function leg(q, F, dx, k, r) {
        const top = [dx - 4, -86], knee = [dx + 3, -40], foot = [dx, 0];
        S.ink(q, [F(top), F(knee), F(foot)], { w: 9, color: '#6e6258', taper: [0, 0.25] });
        S.ink(q, [F([top[0] + 1, top[1]]), F([knee[0] + 1, knee[1]]), F([foot[0] + 1, foot[1]])], { w: 1.4, color: 'rgba(220,206,190,0.6)', taper: [0.3, 0.3] });
        for (let i = 0; i < 6; i++) lineP(q, [F([dx - 3, -30 + i * 5]), F([dx + 3, -29 + i * 5])], 0.6, 'rgba(40,30,30,0.6)'); // scutes
        lineP(q, [F([dx + 2, -22]), F([dx - 6, -24])], 2.2, '#4e443e'); // the spur
        for (const [tx, ty] of [[dx + 22, 3], [dx + 16, 6], [dx + 8, 6], [dx - 14, 2]]) S.ink(q, [F(foot), F([(foot[0] + tx) / 2, -1]), F([tx, ty])], { w: 3.4, color: '#6a5e54', taper: [0, 0.6] });
        void r;
    }

    // ------------------------------------------------------------------ the moon
    // Almost full, pale in the dawn: a lit sphere with its seas, the dark limb towards the
    // sun's side gone into the sky's colour.
    function moon(g, { x = 0, y = 0, r: rad = 60, phase = 0.94, seed = 'moon' } = {}) {
        const res = resOf(g), sd = S.seedOf(seed);
        const sp = memo(`moon${rad}${phase}@${res}`, () => S.form({
            box: { x: -rad - 4, y: -rad - 4, w: rad * 2 + 8, h: rad * 2 + 8 }, res, seed: sd,
            mask: (c) => disc(c, 0, 0, rad, '#fff'), inflate: 'round', relief: 1, light: [-0.75, -0.25, 0.6],
            ramp: [[0, '#d8c8d4'], [0.4, '#e4d8dc'], [0.7, '#f4ece6'], [1, '#fffaf2']], soft: 0.9,
            tint: (px, py, tone, rgb) => {
                // the seas: grey-blue blotches, the Mare Imbrium's arc, a ray crater
                const m = S.smooth(0.05, 0.3, S.noise2(px / (rad * 0.35), py / (rad * 0.35), sd) + 0.25 * S.noise2(px / (rad * 0.12), py / (rad * 0.12), sd + 1)) * S.smooth(rad * 0.95, rad * 0.5, Math.hypot(px, py));
                toward(rgb, 176, 172, 196, m * 0.55);
                const cr = Math.hypot(px + rad * 0.2, py - rad * 0.55);
                toward(rgb, 255, 252, 248, S.smooth(rad * 0.12, 0, cr) * 0.6);
                // the unlit sliver, gone into the dawn
                const d = (px * 0.95 - py * 0.3) / rad;
                toward(rgb, 226, 206, 212, S.clamp(S.smooth(0.6, 0.95, d) * (1 - phase) * 9));
            },
            edge: { rough: 0.6, freq: 0.5, amp: 0.3 },
        }));
        S.put(g, sp, { x, y, alpha: 0.88 });
    }

    // ------------------------------------------------------------------ the bench (poyo)
    // A lime-washed bench built against a wall, its top edged with brick on edge painted
    // almagra; from x0 to x1, its top at y = top, its foot at y = foot (the floor).
    function bench(g, { x0, x1, top, foot, seed = 'b' }) {
        const r = rng('bench' + seed), depth = 16;
        const face = [[x0, top], [x1, top], [x1, foot], [x0, foot]];
        S.piece(g, face, { fill: '#ece0d8', line: 0, shade: { color: '#6c6a98', alpha: 0.35, w: 30, push: 16 }, light: { color: '#fffaf2', alpha: 0.4, w: 10 },
            detail: (q) => {
                for (let i = 0; i < (x1 - x0) / 30; i++) S.dab(q, [[x0 + r() * (x1 - x0), top + r() * (foot - top)], [x0 + r() * (x1 - x0), top + r() * (foot - top)]], { w: 12 + r() * 16, color: r() < 0.6 ? '#ffffff' : '#a8a6c0', alpha: 0.08, bristles: 8, seed: i });
                const gr = q.createLinearGradient(0, foot - 50, 0, foot);
                gr.addColorStop(0, 'rgba(110,108,90,0)');
                gr.addColorStop(1, 'rgba(110,108,90,0.32)');
                q.fillStyle = gr;
                q.fillRect(x0, foot - 50, x1 - x0, 50);
                for (let i = 0; i < (x1 - x0) / 6; i++) disc(q, x0 + r() * (x1 - x0), top + r() * (foot - top), 0.6 + r() * 1.3, r() < 0.5 ? 'rgba(100,90,110,0.3)' : 'rgba(255,250,244,0.5)');
            } });
        // its top: brick on edge, almagra, worn to the brick where it is sat on
        const topF = [[x0, top - depth], [x1, top - depth], [x1, top + 8], [x0, top + 8]];
        S.piece(g, topF, { fill: '#b2583e', line: 0, shade: { color: '#3c1418', alpha: 0.5, w: 6 }, light: { color: '#ffc4a4', alpha: 0.45, w: 4 },
            detail: (q) => {
                for (let x = x0 + r() * 10; x < x1; x += 13 + r() * 3) {
                    lineP(q, [[x, top - depth], [x + (r() - 0.5), top + 8]], 1.3, 'rgba(226,210,190,0.75)');
                    if (r() < 0.3) oval(q, x + 6, top - depth / 2, 5, 3, 0, 'rgba(160,80,60,0.45)');
                }
                for (let i = 0; i < (x1 - x0) / 12; i++) disc(q, x0 + r() * (x1 - x0), top - depth + r() * (depth + 8), 0.5 + r() * 1.2, r() < 0.5 ? 'rgba(60,20,20,0.4)' : 'rgba(250,200,170,0.4)');
            } });
        g.fillStyle = 'rgba(60,40,70,0.4)';
        g.fillRect(x0, top + 8, x1 - x0, 3);
    }

    // ------------------------------------------------------------------ the fountain
    // THE FOUNTAIN · a round marble pool with a low rim, a column in it carrying a small
    //   bowl (taza) from which a thread of water rises and falls back.
    //   1 the thread breaks into drops at its top and falls as a fan; 2 the bowl overflows in
    //   threads from its lip; 3 rings where they land; 4 the sky's rose and the wall mirrored
    //   in the pool; 5 two goldfish under the surface; 6 orange-blossom petals and a leaf
    //   afloat; 7 green algae at the waterline and on the bowl's foot; 8 the marble's grey
    //   veins and a clamp mending a crack in the rim; 9 the wet rim darker where it splashes;
    //   10 a sparrow's feather afloat.
    // (x, y) the middle of the pool at the floor; at s = 1 the pool is 480 across.
    function fountain(g, { x = 0, y = 400, s = 1, seed = 'f', jet = 300 } = {}) {
        const r = rng('fount' + seed);
        g.save();
        g.translate(x, y);
        g.scale(s, s);
        const rx = 240, ry = 46, ry0 = -82; // the rim's top ellipse centre, above the floor
        const rimTop = (sgn, k = 1) => {
            const pts = [];
            for (let i = 0; i <= 48; i++) {
                const a = (i / 48) * Math.PI;
                pts.push([Math.cos(a) * rx * k, ry0 + sgn * Math.sin(a) * ry * k]);
            }
            return pts;
        };
        // the rim's front face, marble, from its top's front arc down to the floor
        const front = [...rimTop(1).reverse(), ...rimTop(1).map(([px, py]) => [px, py + 70]).reverse().reverse()].slice(0);
        const face = [...rimTop(1).reverse(), ...rimTop(1).map(([px, py]) => [px, Math.min(0, py + 70)])];
        void front;
        S.cast(g, (c) => fillP(c, [...rimTop(1).reverse(), [rx + 60, 10], [-rx + 60, 10]], '#000'), { blur: 14, dx: 40, dy: 10, color: 'rgba(50,40,80,0.4)' });
        S.piece(g, face, {
            fill: '#e8e2dc', line: 0, shade: { color: '#5c5a80', alpha: 0.5, w: 40, push: 20 }, light: { color: '#fffaf4', alpha: 0.6, w: 16 },
            detail: (q) => {
                for (let i = 0; i < 16; i++) {
                    const pts = [];
                    let px = -rx + r() * rx * 2, py = ry0 + r() * 70;
                    for (let k = 0; k < 8; k++) pts.push([(px += 6 + r() * 14), (py += (r() - 0.5) * 9)]);
                    lineP(q, pts, 0.5 + r() * 0.9, `rgba(120,118,140,${0.25 + r() * 0.3})`);
                }
                // wet where it splashes, green where it stays wet
                for (let i = 0; i < 60; i++) disc(q, -rx + r() * rx * 2, ry0 + ry + r() * 30, 1 + r() * 3, `rgba(90,96,110,${0.12 + r() * 0.12})`);
                for (let i = 0; i < 50; i++) disc(q, -rx + r() * rx * 2, -2 - r() * 10, 0.8 + r() * 2.4, `rgba(80,110,70,${0.2 + r() * 0.2})`);
            },
        });
        // the water inside the rim: the sky's rose, the wall, ripples
        const water = rimTop(-1, 0.92).concat(rimTop(1, 0.92).reverse());
        const wg = g.createLinearGradient(0, ry0 - ry, 0, ry0 + ry);
        wg.addColorStop(0, '#b8a8be');
        wg.addColorStop(0.5, '#d8bcc0');
        wg.addColorStop(1, '#8c8aa6');
        fillP(g, water, wg);
        g.save();
        path(g, water);
        g.clip();
        // goldfish under the surface, blurred by it
        softly(g, 2.2, (q) => {
            for (const [fx, fy, fa] of [[-90, ry0 + 6, 0.3], [70, ry0 - 10, 2.8]]) {
                q.save();
                q.translate(fx, fy);
                q.rotate(fa);
                q.scale(1, 0.4);
                oval(q, 0, 0, 16, 6, 0, '#e2763a');
                fillP(q, [[-14, 0], [-26, -7], [-24, 0], [-26, 7]], '#e88a4c');
                q.restore();
            }
        });
        // reflections of the sky and the wall: soft horizontal strokes
        for (let i = 0; i < 40; i++) {
            const px = -rx + r() * rx * 2, py = ry0 - ry + r() * ry * 2;
            S.dab(g, [[px, py], [px + 30 + r() * 60, py + (r() - 0.5) * 2]], { w: 2 + r() * 4, color: r() < 0.6 ? '#f6dcd4' : '#7c7a9c', alpha: 0.25, bristles: 3, seed: i });
        }
        // rings where the drops land
        for (let i = 0; i < 9; i++) {
            const px = (r() - 0.5) * 120, py = ry0 + (r() - 0.5) * 30;
            for (let k = 1; k <= 3; k++) {
                g.lineWidth = 0.8;
                g.strokeStyle = `rgba(255,248,244,${0.45 / k})`;
                g.beginPath();
                g.ellipse(px, py, 4 * k + r() * 3, (4 * k + r() * 3) * 0.22, 0, 0, TAU);
                g.stroke();
            }
        }
        // petals and a leaf afloat
        for (let i = 0; i < 7; i++) {
            const px = -rx * 0.8 + r() * rx * 1.6, py = ry0 + (r() - 0.5) * ry * 1.4;
            oval(g, px + 1, py + 1, 4, 1.6, r(), 'rgba(80,70,90,0.3)');
            oval(g, px, py, 4, 1.6, r() * 3, '#fbf6ee');
        }
        oval(g, 150, ry0 + 14, 14, 4, 0.2, '#4c7a36');
        lineP(g, [[136, ry0 + 15], [164, ry0 + 13]], 0.6, '#8ab06a');
        g.restore();
        // the rim's top surface: a band of marble seen from above
        const band = [...rimTop(-1), ...rimTop(-1, 0.92).reverse()];
        const band2 = [...rimTop(1), ...rimTop(1, 0.92).reverse()];
        for (const b of [band, band2]) S.piece(g, b, { fill: '#f0ebe6', line: 0, shade: { color: '#6a6890', alpha: 0.3, w: 8 }, light: { color: '#ffffff', alpha: 0.6, w: 5 } });
        // a bronze clamp mending a crack in the rim
        lineP(g, [[150, ry0 + ry * 0.75], [158, ry0 + ry * 0.8 + 30]], 0.9, 'rgba(60,56,80,0.7)');
        fillP(g, [[144, ry0 + ry * 0.7 + 8], [166, ry0 + ry * 0.75 + 10], [166, ry0 + ry * 0.75 + 15], [144, ry0 + ry * 0.7 + 13]], '#6a5a34');
        // the column standing in the pool and the bowl on it
        const colTop = ry0 - 70, bowlY = colTop - 4;
        const col = [[-11, ry0 + 6], [-9, colTop + 8], [-15, colTop], [15, colTop], [9, colTop + 8], [11, ry0 + 6]];
        S.piece(g, col, { fill: '#e6e0da', line: 0, shade: { color: '#5c5a80', alpha: 0.55, w: 9 }, light: { color: '#ffffff', alpha: 0.6, w: 5 },
            detail: (q) => { for (let i = 0; i < 20; i++) disc(q, (r() - 0.5) * 20, ry0 - r() * 30, 1 + r() * 2, 'rgba(80,110,70,0.35)'); } });
        const bowl = [];
        for (let i = 0; i <= 24; i++) bowl.push([Math.cos((i / 24) * Math.PI) * 52, bowlY + Math.sin((i / 24) * Math.PI) * 22]);
        S.piece(g, bowl, { fill: '#ece6e0', line: 0, shade: { color: '#5c5a80', alpha: 0.5, w: 14, push: 7 }, light: { color: '#ffffff', alpha: 0.6, w: 6 } });
        oval(g, 0, bowlY, 52, 9, 0, '#f4f0ec');
        oval(g, 0, bowlY + 0.5, 46, 7, 0, '#c8b8c4');
        // the overflow: threads falling from the bowl's lip into the pool
        for (let i = 0; i < 9; i++) {
            const a = (i / 8) * Math.PI, px = Math.cos(a) * 50, py = bowlY + Math.sin(a) * 8;
            const pts = [[px, py], [px * 1.08, py + 20], [px * 1.12, ry0 + 4 + Math.sin(a) * 10]];
            S.ink(g, pts, { w: 1.6, color: 'rgba(236,240,250,0.55)', taper: [0.2, 0.6] });
            S.ink(g, shift(pts, -0.5, 0), { w: 0.5, color: 'rgba(255,255,255,0.8)', taper: [0.5, 0.8] });
        }
        // the thread of water rising from the bowl and falling back in a fan of drops
        const top = bowlY - jet;
        const thread = [];
        for (let i = 0; i <= 30; i++) {
            const t = i / 30;
            thread.push([Math.sin(t * 9 + 1) * 0.8 * t, bowlY - t * jet]);
        }
        S.ink(g, thread, { w: 4.2, color: 'rgba(214,222,240,0.5)', taper: [0.1, 0.9] });
        S.ink(g, thread, { w: 2, color: 'rgba(250,252,255,0.85)', taper: [0.1, 0.8] });
        S.ink(g, shift(thread, -0.9, 0), { w: 0.6, color: 'rgba(255,255,255,0.95)', taper: [0.3, 0.9] });
        for (let i = 0; i < 6; i++) {
            const py = bowlY - jet * (0.2 + r() * 0.75);
            disc(g, -0.8, py, 1.4, 'rgba(255,255,255,0.9)');
        }
        // the crown: drops breaking off and falling
        for (let i = 0; i < 46; i++) {
            const side = r() < 0.5 ? -1 : 1, t = r(), spread = 8 + t * 44;
            const px = side * spread * (0.4 + r() * 0.8), py = top + t * t * jet * 0.9 + (r() - 0.5) * 8;
            const rr = 0.8 + r() * 1.6;
            oval(g, px, py, rr * 0.8, rr * (1.2 + t), 0, 'rgba(226,232,248,0.75)');
            disc(g, px - rr * 0.3, py - rr * 0.4, rr * 0.35, 'rgba(255,255,255,0.95)');
        }
        g.restore();
    }

    // ------------------------------------------------------------------ the watering can on a cane
    // A tin wired to the end of a long cane, the patio's way of watering the high pots.
    //   1 the cane's nodes, each a ring with a scar; 2 its straw colour, green near a node;
    //   3 the split, bound end; 4 the tin: a food tin, its label gone, rusted at the seam;
    //   5 its rim rolled; 6 the wire twisted round tin and cane; 7 water dripping from it;
    //   8 a dent; 9 a leaf stuck to it; 10 its long shadow across the wall.
    // (x0, y0) the cane's foot, (x1, y1) its top, where the tin is.
    function can(g, { x0, y0, x1, y1, s = 1, seed = 'can' }) {
        const r = rng('can' + seed), L = Math.hypot(x1 - x0, y1 - y0), ux = (x1 - x0) / L, uy = (y1 - y0) / L, nx = -uy, ny = ux;
        const w = 9 * s;
        const P = (t, o = 0) => [x0 + (x1 - x0) * t + nx * o, y0 + (y1 - y0) * t + ny * o];
        // its shadow, long across the wall
        softly(g, 5, (q) => lineP(q, [[x0, y0], [x1 + 70, y1 + 80]], w * 1.2, 'rgba(60,54,100,0.35)'));
        const cane = [P(0, -w / 2), P(1, -w / 2 * 0.8), P(1, w / 2 * 0.8), P(0, w / 2)];
        S.piece(g, cane, { fill: '#cdbb84', line: 0, shade: { color: '#5a4a30', alpha: 0.55, w: w * 0.7, push: w * 0.3 }, light: { color: '#fff4cc', alpha: 0.6, w: w * 0.4 },
            detail: (q) => {
                for (let i = 0; i < 30; i++) {
                    const t = r(), o = (r() - 0.5) * w;
                    lineP(q, [P(t, o), P(t + 0.02 + r() * 0.04, o)], 0.5, r() < 0.5 ? 'rgba(120,96,60,0.5)' : 'rgba(255,248,220,0.5)');
                }
            } });
        // the nodes
        for (let t = 0.04 + r() * 0.04; t < 0.96; t += (60 + r() * 30) / L) {
            const a = P(t, -w * 0.62), b = P(t, w * 0.62);
            lineP(g, [a, b], 3.2, '#9a8650');
            lineP(g, shift([a, b], -ux * 1.5, -uy * 1.5), 1, 'rgba(255,246,210,0.7)');
            const gr = P(t + 8 / L, 0);
            disc(g, gr[0], gr[1], w * 0.25, 'rgba(110,140,70,0.35)');
        }
        // the tin, mouth up, wired on at the top
        const tx = x1 + nx * 10, ty = y1 - 6;
        const tin = [[tx - 22, ty - 30], [tx + 22, ty - 30], [tx + 22, ty + 22], [tx - 22, ty + 22]];
        const sp = S.form({
            box: { x: tx - 26, y: ty - 36, w: 52, h: 62 }, res: resOf(g), seed: S.seedOf(seed),
            mask: (c) => fillP(c, tin, '#fff'), inflate: 'none',
            height: (px, py) => 22 * Math.sqrt(Math.max(0, 1 - ((px - tx) / 22) ** 2)) - (Math.abs(py - ty + 10) < 3 ? 1 : 0) - 2 * S.smooth(8, 0, Math.hypot(px - tx - 10, py - ty - 4)),
            ramp: [[0, '#2e2c34'], [0.3, '#5e5c66'], [0.5, '#8c8a94'], [0.7, '#b8b6be'], [0.85, '#dcdade'], [1, '#fbfaf8']], soft: 0.85,
            spec: { amp: 0.8, power: 30, from: 0.3, to: 0.8, ragged: 0.4, color: '#ffffff' },
            tint: (px, py, tone, rgb) => {
                const rust = S.smooth(0.15, 0.45, S.noise2(px * 0.12, py * 0.12, 4) + S.smooth(ty + 10, ty + 22, py) * 0.5);
                toward(rgb, 140 + 60 * tone, 70 + 30 * tone, 30, rust * 0.8);
            },
        });
        S.put(g, sp);
        oval(g, tx, ty - 30, 22, 5, 0, '#5a5860');
        g.lineWidth = 1.6;
        g.strokeStyle = '#d8d6dc';
        g.beginPath();
        g.ellipse(tx, ty - 30, 22, 5, 0, Math.PI, TAU);
        g.stroke();
        for (let i = 0; i < 5; i++) lineP(g, [[tx - 23, ty - 10 + i * 3], [x1 - 4, y1 + 4 + i * 4]], 1, i % 2 ? '#6a6466' : '#a8a2a4');
        // drops falling from its seam
        for (let i = 0; i < 4; i++) {
            const dy = 30 + i * 22 + r() * 10;
            oval(g, tx + 6, ty + dy, 1.4, 2.2, 0, 'rgba(220,228,246,0.8)');
            disc(g, tx + 5.6, ty + dy - 0.6, 0.5, '#ffffff');
        }
    }

    // ------------------------------------------------------------------ the well
    // THE WELL · a well-head (brocal) of lime-washed brick with a stone rim, a wrought-iron
    //   arch over it carrying the pulley, the rope, a zinc bucket on the rim.
    //   1 the rim's stone worn into grooves by the rope; 2 the brick courses ghosting under
    //   the lime; 3 the dark of the shaft, a glint of water far down; 4 the iron arch's scrolls,
    //   rust at their ends; 5 the pulley's wheel, its axle, the rope in its groove; 6 the rope
    //   twisted, frayed at the knot; 7 the bucket's seams, its handle, a dent; 8 a pot of
    //   geraniums on the rim; 9 moss and a wet patch at the foot; 10 a snail on the lime.
    // (x, y) the middle of its foot on the floor; at s = 1 it is 300 wide, the rim 260 up.
    function well(g, { x = 0, y = 400, s = 1, seed = 'w' } = {}) {
        const r = rng('well' + seed), res = resOf(g, s);
        g.save();
        g.translate(x, y);
        g.scale(s, s);
        const W = 150, H = 260, at = 0.16;
        // its shadow on the floor
        softly(g, 12, (q) => oval(q, 90, -6, W * 1.3, 26, 0, 'rgba(50,44,80,0.45)'));
        const body = [];
        for (let k = 0; k <= 24; k++) body.push([-W + (k / 24) * W * 2, -H + at * W * Math.sqrt(Math.max(0, 1 - ((-W + (k / 24) * W * 2) / W) ** 2))]);
        for (let k = 24; k >= 0; k--) body.push([-W + (k / 24) * W * 2, at * W * Math.sqrt(Math.max(0, 1 - ((-W + (k / 24) * W * 2) / W) ** 2))]);
        const sp = S.form({
            box: { x: -W - 4, y: -H - 4, w: W * 2 + 8, h: H + W * at + 8 }, res, seed: S.seedOf(seed),
            mask: (c) => fillP(c, body, '#fff'), inflate: 'none',
            height: (px) => W * Math.sqrt(Math.max(0, 1 - (px / W) ** 2)) * 0.8,
            ramp: [[0, '#5e5a7c'], [0.3, '#9a96b0'], [0.5, '#c8c0c8'], [0.68, '#e8dcd4'], [0.84, '#f6ece4'], [1, '#fffaf4']], soft: 0.9,
            mottle: { amp: 0.06, freq: 0.04 }, stroke: { amp: 0.05, freq: 0.06 },
            markAmp: 0.3,
            marks: (c) => {
                // brick courses ghosting under the lime, curving round the drum
                for (let yy = -H + 8; yy < 0; yy += 13) {
                    const pts = [];
                    for (let k = 0; k <= 20; k++) {
                        const px = -W + (k / 20) * W * 2;
                        pts.push([px, yy + at * W * Math.sqrt(Math.max(0, 1 - (px / W) ** 2)) * 0.7]);
                    }
                    lineP(c, pts, 1.1, '#606060');
                }
                for (let i = 0; i < 160; i++) disc(c, (r() - 0.5) * W * 2, -r() * H, 0.6 + r() * 1.4, r() < 0.5 ? '#ffffff' : '#404040');
            },
            tint: (px, py, tone, rgb) => {
                toward(rgb, 110, 120, 90, S.smooth(-50, 0, py) * 0.35 * (0.6 + 0.4 * S.noise2(px * 0.05, 3, 1)));
            },
        });
        S.put(g, sp);
        // a flake off the drum, and a snail
        flake(g, -60, -120, 26, S.seedOf(seed) + 7);
        // the stone rim and the dark mouth
        const rimY = -H, rx = W + 6, ry = (W + 6) * at;
        S.piece(g, S.ellipse(0, rimY, rx, ry, 48), { fill: '#d8d0c6', line: 0, shade: { color: '#5c5a80', alpha: 0.5, w: 10 }, light: { color: '#fffaf2', alpha: 0.6, w: 6 } });
        S.piece(g, [...S.ellipse(0, rimY + 14, rx, ry, 48).slice(0, 25), ...S.ellipse(0, rimY, rx, ry, 48).slice(0, 25).reverse()], { fill: '#cfc6bc', line: 0, shade: { color: '#5c5a80', alpha: 0.45, w: 12 }, light: { color: '#fffaf2', alpha: 0.4, w: 6 } });
        oval(g, 0, rimY + 1, W - 12, (W - 12) * at, 0, '#1e1a24');
        oval(g, 6, rimY + 3, (W - 30) * 0.5, (W - 30) * at * 0.4, 0, 'rgba(130,140,170,0.25)'); // the glint far down
        for (let k = 0; k < 5; k++) lineP(g, [[-30 + k * 6, rimY - ry + 1], [-28 + k * 6, rimY - ry + 6]], 1, 'rgba(90,80,90,0.6)'); // the rope's grooves
        // the iron arch over it, the pulley hanging from its crown
        const ix = W - 10, top = -H - 560, crown = -H - 600;
        const iron = (pts, w = 5) => {
            S.ink(g, shift(pts, 4, 5), { w, color: 'rgba(40,30,60,0.3)', taper: [0, 0] });
            S.ink(g, pts, { w, color: '#2a2226', taper: [0, 0] });
            S.ink(g, shift(pts, -1, -1), { w: w * 0.3, color: 'rgba(170,150,150,0.65)', taper: [0.2, 0.2] });
        };
        iron([[-ix, rimY + 6], [-ix, top]]);
        iron([[ix, rimY + 6], [ix, top]]);
        iron(S.curve([[-ix, top], [-ix * 0.7, crown + 10], [0, crown], [ix * 0.7, crown + 10], [ix, top]], false, 10));
        // scrolls in the corners
        for (const sx of [-1, 1]) {
            const sc = [];
            for (let k = 0; k <= 30; k++) {
                const a = (k / 30) * TAU * 1.3, rr = 34 * (1 - k / 36);
                sc.push([sx * (ix - 40 + Math.cos(a) * rr * 0.9 * -1), top - 20 + Math.sin(a) * rr]);
            }
            iron(sc, 3.4);
            for (let k = 0; k < 4; k++) disc(g, sx * (ix - 40) + (r() - 0.5) * 30, top - 20 + (r() - 0.5) * 30, 1 + r() * 1.5, 'rgba(160,80,40,0.8)');
        }
        // the pulley: a wheel in its fork on a hook
        iron([[0, crown], [0, crown + 30]], 4);
        const py = crown + 62;
        S.piece(g, S.ellipse(0, py, 32, 32, 40), { fill: '#3a3236', line: 0, shade: { color: '#100c10', alpha: 0.6, w: 8 }, light: { color: '#b8a8a8', alpha: 0.5, w: 5 } });
        oval(g, 0, py, 22, 22, 0, '#5a4e50');
        for (let k = 0; k < 6; k++) lineP(g, [[0, py], [Math.cos(k * 1.047) * 21, py + Math.sin(k * 1.047) * 21]], 2.6, '#2a2226');
        disc(g, 0, py, 5, '#1a1416');
        disc(g, -1, py - 1, 2, '#a89898');
        iron([[-34, py], [-30, crown + 30], [30, crown + 30], [34, py]], 3.2);
        // the rope over the wheel: down into the well and down to the bucket
        const rope = (pts) => {
            S.ink(g, pts, { w: 4, color: '#a08a62', taper: [0, 0] });
            for (let i = 1; i < pts.length; i++) {
                const [a0, b0] = pts[i - 1], [a1, b1] = pts[i], L = Math.hypot(a1 - a0, b1 - b0);
                for (let d = 0; d < L; d += 4) {
                    const t = d / L, px = a0 + (a1 - a0) * t, py2 = b0 + (b1 - b0) * t;
                    lineP(g, [[px - 2, py2 - 1.5], [px + 2, py2 + 1.5]], 0.8, 'rgba(70,56,40,0.7)');
                }
            }
        };
        rope([[-31, py], [-30, rimY + 4]]);
        rope([[31, py], [52, rimY - 70], [96, rimY - 46]]);
        // the zinc bucket on the rim, its handle up
        const bx = 96, by = rimY - 4;
        const pail = [[bx - 30, by - 50], [bx + 30, by - 50], [bx + 24, by], [bx - 24, by]];
        const bsp = S.form({
            box: { x: bx - 34, y: by - 56, w: 68, h: 60 }, res, seed: S.seedOf(seed) + 3,
            mask: (c) => fillP(c, pail, '#fff'), inflate: 'none',
            height: (px, py2) => {
                const hw = 30 - ((py2 - (by - 50)) / 50) * 6;
                return hw * Math.sqrt(Math.max(0, 1 - ((px - bx) / hw) ** 2)) - (Math.abs(py2 - by + 34) < 2 ? 1.5 : 0) - 3 * S.smooth(7, 0, Math.hypot(px - bx + 12, py2 - by + 18));
            },
            ramp: [[0, '#34323e'], [0.3, '#62606e'], [0.5, '#8e8c98'], [0.7, '#b8b6c0'], [0.86, '#dcdae0'], [1, '#fbfaf8']], soft: 0.85,
            spec: { amp: 0.6, power: 20, from: 0.3, to: 0.85, ragged: 0.5, color: '#ffffff' },
            mottle: { amp: 0.08, freq: 0.08 },
        });
        S.put(g, bsp);
        oval(g, bx, by - 50, 30, 6, 0, '#4a4852');
        g.lineWidth = 1.4;
        g.strokeStyle = '#e0dee4';
        g.beginPath();
        g.ellipse(bx, by - 50, 30, 6, 0, Math.PI, TAU);
        g.stroke();
        lineP(g, S.curve([[bx - 29, by - 46], [bx - 20, by - 86], [bx + 20, by - 86], [bx + 29, by - 46]], false, 8), 1.6, '#3a3640');
        g.restore();
    }

    // ------------------------------------------------------------------ the chair, the shawl, the cat
    // THE RUSH CHAIR (silla de anea) · turned pine legs painted green, a woven rush seat, a
    //   ladder back; a Manila shawl left over it; a cat asleep on the seat.
    //   1 the seat woven in four triangles from the corners, the rush twisted; 2 the green paint
    //   worn to the wood on the front rail where heels rest; 3 rings turned on the posts;
    //   4 the back's curved slats; 5 the shawl's silk ground, cream, with flowers embroidered;
    //   6 its fringe: a knotted net, then long strands; 7 a fold where it hangs over the rail;
    //   8 the cat a ginger tabby, curled nose to tail, its tail over its paws; 9 its ear's
    //   inside pink, a whisker or two; 10 its stripes following the curl.
    // (x, y) the middle of the front feet on the floor; at s = 1 the seat is 160 wide at 185 up.
    function chair(g, { x = 0, y = 400, s = 1, seed = 'ch', cat = true } = {}) {
        const r = rng('chair' + seed), res = resOf(g, s);
        g.save();
        g.translate(x, y);
        g.scale(s, s);
        softly(g, 10, (q) => fillP(q, [[-90, 0], [100, 0], [190, 26], [-20, 26]], 'rgba(50,44,80,0.4)'));
        const green = '#5e7a5a', post = (x0, y0, x1, y1, w) => {
            const pts = [[x0, y0], [x1, y1]];
            S.ink(g, pts, { w: w + 1.4, color: '#2a3428', taper: [0, 0] });
            S.ink(g, pts, { w, color: green, taper: [0, 0] });
            S.ink(g, shift(pts, -w * 0.25, 0), { w: w * 0.3, color: 'rgba(220,236,200,0.55)', taper: [0.1, 0.1] });
            // turned rings
            for (let t = 0.15; t < 0.95; t += 0.22 + r() * 0.1) {
                const px = x0 + (x1 - x0) * t, py = y0 + (y1 - y0) * t;
                oval(g, px, py, w * 0.62, 2.2, 0, '#46603e');
                oval(g, px - 1, py - 0.8, w * 0.4, 0.9, 0, 'rgba(230,240,210,0.6)');
            }
            // worn to the wood
            for (let k = 0; k < 4; k++) oval(g, x0 + (x1 - x0) * r(), y0 + (y1 - y0) * r(), 2 + r() * 2, 4 + r() * 4, 0, '#b8956a');
        };
        // back legs and the ladder back
        post(-66, -186, -62, 0, 9);
        post(66, -186, 62, 0, 9);
        post(-70, -186, -74, -372, 10);
        post(70, -186, 74, -372, 10);
        for (const yy of [-350, -300, -252]) {
            const slat = S.curve([[-72, yy], [0, yy + 9], [72, yy]], false, 8);
            S.ink(g, slat, { w: 14, color: green, taper: [0, 0] });
            S.ink(g, shift(slat, 0, -5), { w: 2.5, color: 'rgba(220,236,200,0.55)', taper: [0.1, 0.1] });
            S.ink(g, shift(slat, 0, 6), { w: 2, color: 'rgba(30,40,30,0.5)', taper: [0.1, 0.1] });
        }
        // the seat: rush woven in four triangles
        const seat = [[-84, -196], [84, -196], [92, -176], [-92, -176]];
        fillP(g, seat, '#b89a58');
        g.save();
        path(g, seat);
        g.clip();
        const cx = 0, cy = -186;
        for (const [ax, ay, bx, by] of [[-84, -196, 84, -196], [84, -196, 92, -176], [92, -176, -92, -176], [-92, -176, -84, -196]]) {
            for (let t = 0; t < 1; t += 0.03) {
                const px = ax + (bx - ax) * t, py = ay + (by - ay) * t;
                lineP(g, [[px, py], [cx + (px - cx) * 0.02, cy + (py - cy) * 0.02]], 1.6, (Math.floor(t * 33) % 2) ? 'rgba(120,96,46,0.55)' : 'rgba(240,222,160,0.5)');
            }
        }
        g.restore();
        S.ink(g, [[-92, -176], [92, -176]], { w: 9, color: '#a88a4a', taper: [0, 0] });
        for (let px = -90; px < 90; px += 4) lineP(g, [[px, -180], [px + 3, -172]], 1.2, 'rgba(90,70,30,0.6)');
        // front legs and rails
        post(-88, -176, -84, 0, 10);
        post(88, -176, 84, 0, 10);
        for (const [yy, w] of [[-60, 6], [-24, 6]]) S.ink(g, [[-84, yy], [84, yy]], { w, color: green, taper: [0, 0] });
        oval(g, -20, -24, 18, 3, 0, '#b8956a'); // worn by heels
        // the shawl over the back: a cream silk square folded on the slant, its fringe hanging
        const shawl = S.curve([[-96, -366], [-30, -380], [40, -376], [96, -356], [104, -300], [86, -240], [40, -150], [10, -120], [-40, -170], [-84, -230], [-104, -300]], true, 6);
        S.cast(g, (c) => fillP(c, shawl, '#000'), { blur: 8, dx: 10, dy: 12, color: 'rgba(40,40,70,0.45)' });
        
        S.piece(g, shawl, {
            fill: '#efe2c6', line: 0, shade: [{ color: '#7a6a7a', alpha: 0.45, w: 18, push: 9 }], light: { color: '#fffaf0', alpha: 0.6, w: 10 },
            detail: (q) => {
                // embroidered flowers, close together, as the shawls of Manila
                const spots = [[-62, -322, 17, 'red'], [-14, -346, 13, 'pink'], [40, -326, 18, 'red'], [74, -290, 11, 'coral'], [-46, -276, 15, 'pink'], [6, -270, 17, 'red'], [48, -228, 12, 'magenta'], [-64, -226, 11, 'coral'], [16, -190, 11, 'red'], [-16, -230, 8, 'white'], [60, -360, 8, 'white']];
                spots.forEach(([fx, fy, fr], i) => {
                    for (let k = 0; k < 3; k++) stitchLeaf(q, fx, fy, r() * TAU, fr * 1.5, 'sl' + i + k);
                });
                spots.forEach(([fx, fy, fr, fc], i) => stitchRose(q, fx, fy, fr, fc, 'sh' + i));
                // the folds: soft shade along the drape
                for (const fold of [[[-80, -330], [-30, -250], [0, -150]], [[40, -350], [50, -270], [24, -160]]]) S.dab(q, S.curve(fold, false, 8), { w: 14, color: '#5a4a64', alpha: 0.18, bristles: 9, seed: fold[0][0] });
            },
        });
        // the fringe: a knotted net along the hem, then strands
        const hem = S.curve([[104, -300], [86, -240], [40, -150], [10, -120], [-40, -170], [-84, -230], [-104, -300]], false, 8);
        for (let i = 0; i < hem.length; i++) {
            const [hx, hy] = hem[i];
            const len = 40 + r() * 16;
            for (let k = 0; k < 3; k++) S.ink(g, [[hx + k - 1, hy], [hx + k - 1 + (r() - 0.5) * 4, hy + len * 0.5], [hx + k - 1 + (r() - 0.5) * 6, hy + len]], { w: 0.9, color: k % 2 ? '#e8d8b6' : '#d4c09a', taper: [0, 0.4] });
            if (i % 2 === 0) disc(g, hx, hy + 8, 1.6, '#c8b48c');
        }
        if (cat) {
            // the cat, asleep on the seat: curled, head on its paws, tail round to its nose
            const cy0 = -194;
            const csp = memo(`cat${seed}@${res}`, () => {
                const body = S.curve([[-30, -4], [-40, -40], [-10, -66], [40, -70], [80, -52], [96, -22], [86, 2], [40, 8], [0, 8]], true, 8);
                const head = S.curve([[-96, -14], [-100, -34], [-88, -54], [-66, -60], [-44, -50], [-36, -30], [-46, -10], [-70, -4]], true, 8);
                return S.form({
                    box: { x: -110, y: -84, w: 216, h: 100 }, res, seed: 77,
                    mask: (c) => {
                        fillP(c, body, '#fff');
                        fillP(c, head, '#fff');
                    },
                    inflate: 'round', relief: 0.75,
                    ramp: [[0, '#4a2616'], [0.3, '#8a4e24'], [0.5, '#bc7434'], [0.68, '#d89a58'], [0.84, '#eec48a'], [1, '#fff0d2']], soft: 0.9,
                    markAmp: 0.42,
                    marks: (c) => {
                        // the tabby's stripes following the curl, the M on its brow, fur strokes
                        for (let k = 0; k < 10; k++) {
                            const a = -2.6 + k * 0.28, cxx = 30, cyy = -16;
                            S.dab(c, [[cxx + Math.cos(a) * 26, cyy + Math.sin(a) * 18], [cxx + Math.cos(a) * 60, cyy + Math.sin(a) * 44]], { w: 6 + (k % 3), color: '#000000', alpha: 0.55, bristles: 6, dry: 0.4, seed: k });
                        }
                        for (let k = 0; k < 3; k++) lineP(c, [[-74 + k * 8, -56], [-70 + k * 8, -44]], 2, '#000000');
                        for (let k = 0; k < 420; k++) {
                            const px = -100 + r() * 200, py = -76 + r() * 84, an = Math.atan2(py + 16, px - 30) + Math.PI / 2;
                            lineP(c, [[px, py], [px + Math.cos(an) * 4, py + Math.sin(an) * 4]], 0.6, r() < 0.5 ? '#ffffff' : '#202020');
                        }
                    },
                    tint: (px, py, tone, rgb) => {
                        // white on the muzzle and the chest
                        const w = S.smooth(16, 6, Math.hypot(px + 90, py + 22)) + S.smooth(14, 4, Math.hypot(px + 40, py + 2));
                        toward(rgb, 240 * (0.7 + 0.3 * tone), 232 * (0.7 + 0.3 * tone), 222 * (0.72 + 0.3 * tone), Math.min(1, w) * 0.85);
                    },
                    edge: { rough: 1.8, freq: 0.7, amp: 0.9 },
                });
            });
            S.cast(g, (c) => c.drawImage(csp.canvas, csp.box.x, cy0 + csp.box.y, csp.box.w, csp.box.h), { blur: 6, dx: 7, dy: 6, color: 'rgba(40,30,40,0.45)' });
            // the tail behind, round the front of its body to its nose
            const tail = S.curve([[88, cy0 - 6], [60, cy0 + 8], [0, cy0 + 12], [-60, cy0 + 8], [-92, cy0 + 2]], false, 8);
            S.put(g, csp, { x: 0, y: cy0 });
            S.ink(g, shift(tail, 2, 3), { w: 15, color: 'rgba(60,30,20,0.4)', taper: [0, 0.6] });
            S.ink(g, tail, { w: 14, color: '#c07c3c', taper: [0, 0.6] });
            for (let k = 3; k < tail.length - 4; k += 5) {
                const p = tail[k];
                lineP(g, [[p[0] - 1, p[1] - 6], [p[0] + 1.5, p[1] + 6]], 2.6, 'rgba(110,56,24,0.6)');
            }
            S.ink(g, shift(tail, -0.5, -4), { w: 3, color: 'rgba(255,236,200,0.5)', taper: [0.2, 0.6] });
            // its front paw, white, under the chin; the ears; the shut eye; nose; whiskers
            oval(g, -80, cy0 - 6, 14, 6, 0.1, '#ece4d8');
            for (let k = 0; k < 3; k++) lineP(g, [[-90 + k * 5, cy0 - 8], [-90 + k * 5, cy0 - 3]], 0.6, 'rgba(120,100,90,0.6)');
            for (const [ex, flipE] of [[-84, 0], [-60, 1]]) {
                fillP(g, [[ex - 10, cy0 - 50], [ex - 4 + flipE * 4, cy0 - 74], [ex + 6, cy0 - 52]], flipE ? '#b06c34' : '#c47e3e');
                fillP(g, [[ex - 6, cy0 - 52], [ex - 3 + flipE * 3, cy0 - 66], [ex + 3, cy0 - 53]], '#e8aaa2');
            }
            S.ink(g, [[-84, cy0 - 36], [-78, cy0 - 33], [-71, cy0 - 36]], { w: 1.3, color: '#3a2014', taper: [0.4, 0.4] });
            S.ink(g, [[-62, cy0 - 38], [-57, cy0 - 36], [-52, cy0 - 38]], { w: 1.2, color: '#3a2014', taper: [0.4, 0.4] });
            fillP(g, [[-96, cy0 - 26], [-90, cy0 - 26], [-93, cy0 - 22]], '#c8786a');
            for (let k = 0; k < 4; k++) lineP(g, [[-92, cy0 - 21], [-118, cy0 - 26 + k * 4]], 0.4, 'rgba(255,250,240,0.85)');
        }
        g.restore();
    }

    // ------------------------------------------------------------------ the orange tree
    // THE ORANGE TREE in a glazed pot (the patio of the orange trees at the mosque, in small).
    //   1 leaves glossy, dark above, three lights; 2 oranges at their ripeness, pores, a navel;
    //   3 one still green; 4 azahar open and in bud, petals fallen; 5 the trunk grey, grafted
    //   (a swelling); 6 the pot green-glazed with drips of glaze and its lugs; 7 the soil with a
    //   fallen orange going mouldy; 8 a dead twig; 9 a spider's thread; 10 sun in patches.
    // (x, y) the middle of the pot's foot on the floor; s = 1: the crown 460 across.
    function orangeTree(g, { x = 0, y = 400, s = 1, seed = 'o' } = {}) {
        const C = typeof Citrus !== 'undefined' ? Citrus : null, r = rng('otree' + seed);
        g.save();
        g.translate(x, y);
        g.scale(s, s);
        const res = resOf(g);
        // the pot: green-glazed, wide
        const pres = resOf(g, 2.3);
        g.save();
        g.translate(0, -230);
        g.scale(2.3, 2.3);
        softly(g, 6, (q) => oval(q, 30, 102, 60, 8, 0, 'rgba(40,36,70,0.5)'));
        potBody(g, { tilt: 0.22, seed: seed + 'pot', color: 'green', chips: 0.15, res: pres });
        g.restore();
        // the trunk and its limbs
        const trunk = [[0, -230], [4, -330], [-6, -420], [0, -480]];
        if (C) {
            C.branch(g, trunk, { w0: 26, w1: 16, seed: 'otrunk', green: [0, 0] });
            for (const [ax, ay, bx, by] of [[0, -470, -150, -620], [0, -470, 150, -640], [-6, -420, 120, -520], [0, -480, 20, -720], [-4, -440, -160, -500]]) C.branch(g, [[ax, ay], [(ax + bx) / 2, (ay + by) / 2 - 20], [bx, by]], { w0: 13, w1: 5, seed: 'olimb' + bx, green: [0.5, 1] });
            // the graft's swelling
            oval(g, 2, -300, 16, 9, 0, 'rgba(120,110,100,0.35)');
            // leaves in a dome, far ones darker
            const cx = 0, cy = -620, R = 230, n = 300;
            const leaves = [];
            for (let i = 0; i < n; i++) {
                const a = r() * TAU, d = Math.sqrt(r());
                const lx = cx + Math.cos(a) * R * d, ly = cy + Math.sin(a) * R * 0.78 * d;
                const z = Math.sqrt(Math.max(0, 1 - d * d));
                leaves.push({ lx, ly, z, rot: r() * TAU, s: 0.17 + r() * 0.06, v: Math.floor(r() * 16), fx: 0.6 + r() * 0.4, fy: 0.45 + r() * 0.55, lit: S.clamp(0.5 + (-(lx - cx) * 0.6 - (ly - cy) * 0.8) / (R * 1.6) + z * 0.2 + (r() - 0.5) * 0.3) });
            }
            leaves.sort((p, q) => p.z - q.z);
            const lr = resOf(g, 0.2);
            const fruits = [];
            for (let i = 0; i < 16; i++) {
                const a = r() * TAU, d = 0.25 + Math.sqrt(r()) * 0.7;
                fruits.push({ fx: cx + Math.cos(a) * R * d, fy: cy + Math.sin(a) * R * 0.78 * d + 10, rad: 15 + r() * 4, green: i === 3, at: Math.floor(r() * n) });
            }
            leaves.forEach((l, i) => {
                const kind = l.lit > 0.68 ? 'sun' : l.lit > 0.4 ? 'mid' : 'deep';
                const sp = C.leaf(l.v, l.rot, lr, kind);
                C.shadow(g, sp, l.lx, l.ly, l.s, { rot: l.rot, fx: l.fx, fy: l.fy, dx: 3, dy: 5, alpha: 0.4, blur: 4 });
                C.put(g, sp, l.lx, l.ly, l.s, { rot: l.rot, fx: l.fx, fy: l.fy });
                for (const f of fruits) if (f.at === i) orange(g, f.fx, f.fy, f.rad, f.green, res, seed + f.at);
            });
            // blossom on a few tips
            if (C.flower) for (let i = 0; i < 9; i++) {
                const a = r() * TAU, d = 0.6 + r() * 0.35, fx = cx + Math.cos(a) * R * d, fy = cy + Math.sin(a) * R * 0.78 * d;
                const kinds = ['face', 'tilt', 'half'];
                C.put(g, C.flower(i, 0, resOf(g, 0.3), kinds[i % 3]), fx, fy, 0.3, { rot: r() * 0.6 });
            }
            // petals fallen on the soil
            for (let i = 0; i < 8; i++) oval(g, -60 + r() * 120, -226 + r() * 10, 3.4, 1.5, r() * 3, '#fbf6ee');
        }
        g.restore();
    }
    function orange(g, x, y, rad, green, res, seed) {
        const sp = memo(`orange${rad.toFixed(0)}${green}@${res}`, () => S.form({
            box: { x: -rad - 3, y: -rad - 3, w: rad * 2 + 6, h: rad * 2 + 6 }, res, seed: S.seedOf('or' + seed),
            mask: (c) => disc(c, 0, 0, rad, '#fff'), inflate: 'round', relief: 1,
            height: (px, py) => 0.25 * S.noise2(px * 0.8, py * 0.8, 3),
            ramp: green ? [[0, '#1c2c10'], [0.3, '#3a5a1c'], [0.5, '#5e8a2a'], [0.7, '#8ab03e'], [0.86, '#bcd46a'], [1, '#eef2b8']] : [[0, '#4a1e08'], [0.3, '#8e3e0e'], [0.5, '#c8641a'], [0.68, '#e88a2a'], [0.84, '#f8b450'], [1, '#fff0b8']],
            soft: 0.9, spec: { amp: 0.55, power: 18, from: 0.4, to: 0.9, ragged: 0.4, color: '#fff6dc' },
            markAmp: 0.3,
            marks: (c) => {
                const rr = rng('pores' + rad);
                for (let k = 0; k < rad * 12; k++) disc(c, (rr() - 0.5) * rad * 2, (rr() - 0.5) * rad * 2, 0.35, rr() < 0.6 ? '#000000' : '#ffffff');
            },
        }));
        S.put(g, sp, { x, y });
        disc(g, x + rad * 0.15, y + rad * 0.5, 1.2, 'rgba(80,50,20,0.6)'); // the navel's scar
    }

    // ------------------------------------------------------------------ the canary's cage
    // A domed wire cage hung from a hook: brass wires, a yellow canary on its perch, a blue
    //   seed cup, a water glass, a cuttlebone, a lettuce leaf in the bars, husks on the tray.
    // (x, y) the hook it hangs from; at s = 1 it is 120 tall under a chain of 70.
    function cage(g, { x = 0, y = 0, s = 1, seed = 'cg' } = {}) {
        const r = rng('cage' + seed);
        g.save();
        g.translate(x, y);
        g.scale(s, s);
        const top = 70, W = 52, base = top + 128;
        // its shadow on the wall
        softly(g, 6, (q) => oval(q, 46, base - 40, W, 60, 0, 'rgba(40,40,80,0.3)'));
        for (let k = 0; k < 6; k++) oval(g, 0, 8 + k * 11, 3, 5, 0, k % 2 ? '#8a7442' : '#b0965a'); // the chain
        // the back half of the wires
        const brass = (pts, w = 1.1) => {
            lineP(g, pts, w, '#7a6436');
            lineP(g, shift(pts, -0.4, -0.3), w * 0.4, 'rgba(250,230,170,0.8)');
        };
        // the bird: a canary on its perch
        const bx = -6, by = base - 54;
        brass([[-W + 4, by + 22], [W - 4, by + 22]], 2);
        S.piece(g, S.curve([[bx - 22, by + 4], [bx - 10, by - 8], [bx + 6, by - 14], [bx + 16, by - 22], [bx + 26, by - 18], [bx + 24, by - 8], [bx + 14, by + 8], [bx - 4, by + 16], [bx - 30, by + 20]], true, 5), {
            fill: '#f2d24a', line: 0, shade: { color: '#8a6a10', alpha: 0.55, w: 9 }, light: { color: '#fff8d0', alpha: 0.6, w: 6 },
            detail: (q) => { for (let k = 0; k < 5; k++) S.ink(q, [[bx - 14 + k * 3, by - 4 + k], [bx - 28 + k * 2, by + 14]], { w: 1, color: 'rgba(170,130,30,0.7)', taper: [0.2, 0.8] }); } });
        disc(g, bx + 20, by - 17, 1.6, '#1a1410');
        fillP(g, [[bx + 26, by - 18], [bx + 32, by - 16], [bx + 26, by - 14]], '#e0a888');
        lineP(g, [[bx + 2, by + 16], [bx + 3, by + 22]], 1, '#c08a78');
        // cups, cuttlebone, a lettuce leaf in the bars
        S.piece(g, [[-W + 2, base - 22], [-W + 22, base - 22], [-W + 20, base - 8], [-W + 4, base - 8]], { fill: '#3a62a8', line: 0, shade: { color: '#101a40', alpha: 0.5, w: 4 }, light: { color: '#c8daf4', alpha: 0.6, w: 3 } });
        S.piece(g, [[W - 20, base - 26], [W - 4, base - 26], [W - 5, base - 8], [W - 19, base - 8]], { fill: 'rgba(210,226,240,0.7)', line: 0, shade: { color: '#406080', alpha: 0.4, w: 4 }, light: { color: '#ffffff', alpha: 0.8, w: 2 } });
        oval(g, 30, base - 70, 5, 14, 0.2, '#f2eadc');
        S.piece(g, S.curve([[-W - 2, base - 76], [-W + 16, base - 92], [-W + 22, base - 70], [-W + 6, base - 62]], true, 4), { fill: '#8ab04a', line: 0, shade: { color: '#2a4a14', alpha: 0.5, w: 5 }, light: { color: '#e8f4c0', alpha: 0.5, w: 3 } });
        // the tray with husks, and the front wires over all
        S.piece(g, [[-W - 6, base - 6], [W + 6, base - 6], [W + 4, base + 8], [-W - 4, base + 8]], { fill: '#b89a58', line: 0, shade: { color: '#4a3818', alpha: 0.5, w: 5 }, light: { color: '#fff0c0', alpha: 0.5, w: 3 } });
        for (let k = 0; k < 14; k++) oval(g, -W + r() * W * 2, base - 7 + r() * 2, 1.4, 0.7, r(), r() < 0.5 ? '#e8d8a8' : '#8a7040');
        for (let k = 0; k <= 16; k++) {
            const u = k / 16, wx = -W + u * W * 2, dome = top + 30 - Math.sqrt(Math.max(0, 1 - ((wx) / W) ** 2)) * 30;
            brass(S.curve([[0, top], [wx * 0.6, top + 6], [wx, dome + 2], [wx, base - 6]], false, 6));
        }
        for (const yy of [base - 40, base - 90]) brass([[-W, yy], [W, yy]], 1.4);
        oval(g, 0, top - 2, 6, 4, 0, '#b0965a');
        g.restore();
    }

    // ------------------------------------------------------------------ jasmine on a wire
    // A wire run along the wall on nails, the jasmine (jazmín) twining on it: dark pinnate
    // leaves of five to seven leaflets, white star flowers on pink-flushed tubes, buds pink.
    function jasmine(g, { pts, seed = 'j', density = 1 } = {}) {
        const r = rng('jas' + seed);
        const wire = S.curve(pts, false, 10);
        lineP(g, shift(wire, 4, 5), 1, 'rgba(50,46,90,0.3)');
        lineP(g, wire, 1, '#4a4448');
        for (const p of pts) nail(g, p[0], p[1], 'nail', S.seedOf(seed) + p[0]);
        // the vine twines round it and hangs off it
        const vine = wire.map(([px, py], i) => [px + Math.sin(i * 0.7) * 4, py + Math.cos(i * 0.7) * 4]);
        stem(g, vine, 2, 2, '#4e5e34');
        for (let i = 0; i < vine.length; i += Math.max(2, Math.round(4 / density))) {
            const [px, py] = vine[i];
            const n = 2 + Math.floor(r() * 3);
            for (let k = 0; k < n; k++) {
                const a = -Math.PI / 2 + (r() - 0.5) * 3.4, len = 26 + r() * 30;
                const tip = [px + Math.cos(a) * len, py + Math.sin(a) * len + len * 0.3];
                stem(g, [[px, py], [(px + tip[0]) / 2, (py + tip[1]) / 2 + 3], tip], 1.2, 0.9, '#55663a');
                // a pinnate leaf: leaflets in pairs and one at the tip
                for (let m = 1; m <= 3; m++) {
                    const t = m / 3.4, lx = px + (tip[0] - px) * t, ly = py + (tip[1] - py) * t, la = Math.atan2(tip[1] - py, tip[0] - px);
                    for (const sd of [-1, 1]) {
                        const fa = la + sd * 1.1, fx = lx + Math.cos(fa) * 6, fy = ly + Math.sin(fa) * 6;
                        oval(g, fx + 1.5, fy + 2, 6.5, 2.6, fa, 'rgba(30,40,40,0.25)');
                        oval(g, fx, fy, 6.5, 2.6, fa, r() < 0.5 ? '#2e5a2c' : '#3e6e34');
                        oval(g, fx - 1, fy - 0.8, 3.5, 0.9, fa, 'rgba(200,230,170,0.5)');
                    }
                }
                oval(g, tip[0], tip[1], 8, 3, a, '#356630');
                // flowers at the tips of some
                if (r() < 0.55) {
                    for (let f = 0; f < 2 + Math.floor(r() * 4); f++) {
                        const fx = tip[0] + (r() - 0.5) * 22, fy = tip[1] + (r() - 0.5) * 16 - 6;
                        if (r() < 0.35) {
                            oval(g, fx, fy, 1.8, 4.2, r() - 0.5, '#e8a8b8'); // a bud
                            continue;
                        }
                        lineP(g, [[fx, fy], [fx + 2, fy + 8]], 1.4, '#e6b4c0'); // its tube
                        for (let pp = 0; pp < 5; pp++) {
                            const pa = (pp / 5) * TAU + r() * 0.3;
                            oval(g, fx + Math.cos(pa) * 3.6, fy + Math.sin(pa) * 3.6, 3.8, 2, pa, '#fbf8f2');
                            oval(g, fx + Math.cos(pa) * 3.6 + 0.6, fy + Math.sin(pa) * 3.6 + 0.8, 2.2, 1, pa, 'rgba(170,160,190,0.4)');
                        }
                        disc(g, fx, fy, 1, '#e8d080');
                    }
                }
            }
        }
    }

    // ------------------------------------------------------------------ the zaguán's lantern
    // A wrought-iron lantern on a bracket: six glass panes, a crowned cap, a scroll bracket.
    function lantern(g, { x = 0, y = 0, s = 1, seed = 'l' } = {}) {
        const r = rng('lant' + seed);
        g.save();
        g.translate(x, y);
        g.scale(s, s);
        const iron = (pts, w = 3) => {
            S.ink(g, shift(pts, 6, 7), { w, color: 'rgba(40,36,80,0.3)', taper: [0, 0] });
            S.ink(g, pts, { w, color: '#2a2226', taper: [0, 0] });
            S.ink(g, shift(pts, -0.7, -0.7), { w: w * 0.3, color: 'rgba(170,150,150,0.6)', taper: [0.2, 0.2] });
        };
        // the bracket from the wall, with its scroll
        iron([[-70, -40], [0, -40]], 4);
        const sc = [];
        for (let k = 0; k <= 26; k++) {
            const a = (k / 26) * TAU * 1.2, rr = 22 * (1 - k / 32);
            sc.push([-40 + Math.cos(a) * rr, -18 + Math.sin(a) * rr]);
        }
        iron(sc, 2.6);
        iron([[-70, -40], [-70, 10], [-44, -10]], 3);
        iron([[0, -40], [0, -24]], 2.4);
        // the lantern: a cap, six panes (three seen), a base
        const panes = [[-26, -4, -16, 70], [-16, -4, 16, 70], [16, -4, 26, 70]];
        for (const [a, y0, b, y1] of panes) {
            const pts = [[a, y0], [b, y0], [b * 0.8, y1], [a * 0.8, y1]];
            fillP(g, pts, 'rgba(210,214,226,0.55)');
            fillP(g, [[a + 2, y0 + 4], [a + (b - a) * 0.35, y0 + 4], [a * 0.8 + 4, y1 - 6]], 'rgba(255,255,255,0.35)');
            lineP(g, [...pts, pts[0]], 2, '#2a2226');
        }
        disc(g, 0, 40, 5, 'rgba(240,230,200,0.6)'); // the bulb, unlit at dawn
        fillP(g, [[-32, -4], [32, -4], [16, -26], [-16, -26]], '#2e2628');
        lineP(g, [[-30, -6], [30, -6]], 1, 'rgba(170,150,150,0.6)');
        for (let k = -2; k <= 2; k++) disc(g, k * 7, -30 + Math.abs(k) * 2, 2, '#2e2628');
        fillP(g, [[-22, 70], [22, 70], [12, 80], [-12, 80]], '#2e2628');
        disc(g, 0, 86, 3, '#2e2628');
        // a moth that stayed the night on the glass
        fillP(g, [[6, 26], [13, 22], [12, 30]], '#9a8a7a');
        fillP(g, [[6, 26], [0, 22], [2, 30]], '#8a7a6a');
        g.restore();
        void r;
    }

    // ------------------------------------------------------------------ the tinaja and the aspidistra
    // A big earthenware jar (tinaja), its belly incised with bands, an aspidistra in it: broad
    // dark leaves on long stalks, one split, one yellow; a jar of blue and white with a fern.
    function tinaja(g, { x = 0, y = 400, s = 1, seed = 't', plant = 'aspidistra', color = 'clay' } = {}) {
        const r = rng('tin' + seed), res = resOf(g, s);
        g.save();
        g.translate(x, y);
        g.scale(s, s);
        softly(g, 10, (q) => oval(q, 50, -4, 150, 20, 0, 'rgba(40,36,70,0.45)'));
        const prof = (t) => 60 + 70 * Math.sin(Math.PI * Math.pow(t, 0.8)) - 10 * t; // half-width along its height
        const Hh = 300, pts = [];
        for (let k = 0; k <= 30; k++) pts.push([prof(k / 30), -k * (Hh / 30)]);
        for (let k = 30; k >= 0; k--) pts.push([-prof(k / 30), -k * (Hh / 30)]);
        const blue = color === 'blue';
        const sp = S.form({
            box: { x: -140, y: -Hh - 6, w: 280, h: Hh + 10 }, res, seed: S.seedOf(seed),
            mask: (c) => fillP(c, pts, '#fff'), inflate: 'none',
            height: (px, py) => {
                const hw = prof(S.clamp(-py / Hh));
                return hw * Math.sqrt(Math.max(0, 1 - (px / hw) ** 2)) - (Math.abs(((-py) % 60) - 30) < 1.5 ? 1.5 : 0);
            },
            ramp: blue ? POT.white : POT.clay, soft: 0.9, mottle: { amp: 0.06, freq: 0.03 }, stroke: { amp: 0.05, freq: 0.05 },
            spec: blue ? { amp: 0.5, power: 18, from: 0.4, to: 0.9, ragged: 0.4, color: '#ffffff' } : null,
            tint: (px, py, tone, rgb) => {
                if (blue) {
                    // a blue band of leaves painted round its belly
                    const yy = -py;
                    const band = S.smooth(118, 124, yy) * S.smooth(196, 190, yy);
                    const leafy = Math.sin(px * 0.25 + Math.sin(yy * 0.12) * 2) > 0.2 ? 1 : 0;
                    toward(rgb, 40 + 70 * tone, 70 + 80 * tone, 150 + 70 * tone, band * leafy * 0.85 + (Math.abs(yy - 120) < 3 || Math.abs(yy - 196) < 3 ? 0.8 : 0));
                } else {
                    // incised bands and the salt bloom of a porous jar
                    toward(rgb, 240, 230, 210, S.smooth(0.2, 0.6, S.noise2(px * 0.03, py * 0.05, 9)) * 0.3);
                }
            },
        });
        S.put(g, sp);
        oval(g, 0, -Hh, prof(1) + 2, 12, 0, blue ? '#d8d4dc' : '#9a5a3c');
        oval(g, 0, -Hh + 1, prof(1) - 8, 8, 0, '#3a2a22');
        // the plant
        if (plant === 'aspidistra') {
            for (let i = 0; i < 14; i++) {
                const a = -Math.PI / 2 + (r() - 0.5) * 1.8, len = 170 + r() * 120, sx = (r() - 0.5) * 50;
                const stalk = [[sx, -Hh], [sx + Math.cos(a) * len * 0.3, -Hh + Math.sin(a) * len * 0.3]];
                stem(g, stalk, 3, 3, '#3a5a2a');
                const b0 = stalk[1], tip = [b0[0] + Math.cos(a + (r() - 0.5) * 0.4) * len * 0.7, b0[1] + Math.sin(a) * len * 0.7 + len * 0.15];
                const mid = [(b0[0] + tip[0]) / 2, (b0[1] + tip[1]) / 2], nx = -(tip[1] - b0[1]), ny = tip[0] - b0[0], nl = Math.hypot(nx, ny), wd = 26 + r() * 10;
                const blade = S.curve([b0, [mid[0] + (nx / nl) * wd, mid[1] + (ny / nl) * wd], tip, [mid[0] - (nx / nl) * wd * 0.8, mid[1] - (ny / nl) * wd * 0.8]], true, 8);
                const yellow = i === 5;
                S.piece(g, blade, { fill: yellow ? '#a8a446' : r() < 0.5 ? '#2e5a30' : '#3a6a36', line: 0, shade: { color: '#0c2014', alpha: 0.55, w: 12, push: 6 }, light: { color: '#b8dca0', alpha: 0.45, w: 8 },
                    detail: (q) => {
                        // the parallel veins running the blade's length, the midrib, dust, a dry tip
                        for (let m = -6; m <= 6; m++) {
                            const off = (m / 6) * wd * 0.8, pts = [];
                            for (let t = 0; t <= 10; t++) {
                                const u = t / 10, bulge = Math.sin(Math.PI * u);
                                pts.push([b0[0] + (tip[0] - b0[0]) * u + (nx / nl) * off * bulge, b0[1] + (tip[1] - b0[1]) * u + (ny / nl) * off * bulge]);
                            }
                            lineP(q, pts, 0.5, m % 2 ? 'rgba(10,30,14,0.3)' : 'rgba(200,230,180,0.22)');
                        }
                        lineP(q, [b0, mid, tip], 1.3, 'rgba(220,240,200,0.55)');
                        for (let m = 0; m < 30; m++) disc(q, b0[0] + (tip[0] - b0[0]) * r(), b0[1] + (tip[1] - b0[1]) * r() + (r() - 0.5) * wd, 0.5 + r() * 0.8, 'rgba(230,220,200,0.35)');
                        if (i % 4 === 1) {
                            const t0 = 0.86;
                            disc(q, b0[0] + (tip[0] - b0[0]) * 0.95, b0[1] + (tip[1] - b0[1]) * 0.95, wd * 0.5, 'rgba(150,110,60,0.85)');
                            lineP(q, [[b0[0] + (tip[0] - b0[0]) * t0 + (nx / nl) * wd * 0.3, b0[1] + (tip[1] - b0[1]) * t0 + (ny / nl) * wd * 0.3], [b0[0] + (tip[0] - b0[0]) * t0 - (nx / nl) * wd * 0.3, b0[1] + (tip[1] - b0[1]) * t0 - (ny / nl) * wd * 0.3]], 1.2, 'rgba(70,40,20,0.7)');
                        }
                    } });
            }
        } else {
            // a fern: arching fronds, leaflet by leaflet
            for (let i = 0; i < 16; i++) {
                const a = -Math.PI / 2 + (r() - 0.5) * 2.6, len = 150 + r() * 90;
                const fr = [];
                for (let k = 0; k <= 20; k++) {
                    const t = k / 20, aa = a + t * t * (a > -Math.PI / 2 ? 1.6 : -1.6);
                    const prev = fr.length ? fr[fr.length - 1] : [(r() - 0.5) * 30, -Hh];
                    fr.push(k ? [prev[0] + Math.cos(aa) * len / 20, prev[1] + Math.sin(aa) * len / 20] : prev);
                }
                stem(g, fr, 2, 1, '#4a6a2e');
                for (let k = 2; k < fr.length - 1; k++) {
                    const p = fr[k], q2 = fr[k + 1], ta = Math.atan2(q2[1] - p[1], q2[0] - p[0]), ll = 18 * (1 - k / 22);
                    for (const sd of [-1, 1]) {
                        const fa = ta + sd * 1.25;
                        oval(g, p[0] + Math.cos(fa) * ll * 0.5, p[1] + Math.sin(fa) * ll * 0.5, ll * 0.5, 2.6, fa, k % 3 ? '#4e8a3a' : '#6aa04a');
                    }
                }
            }
        }
        g.restore();
    }

    // ------------------------------------------------------------------ the dawn
    // The low sun over a finished layer, on its paint only: above a line it is lit (warm), below
    // it the shade of the roofs opposite (cool, lower). The line's edge is scalloped by the
    // shadow of those roofs' tile noses and softened by the sun's size.
    //   line: [[x0, y0], [x1, y1]]; soft: the edge's width; shade, sun: rgb multipliers
    function dawn(g, box, res, o = {}) {
        const c = g.canvas, W = c.width, H = c.height, m = g.getTransform();
        const [[x0, y0], [x1, y1]] = o.line ?? [[box.x, -200], [box.x + box.w, -60]];
        const soft = o.soft ?? 22, sh = o.shade ?? [0.66, 0.68, 0.84], su = o.sun ?? [1.05, 1.0, 0.93];
        const im = g.getImageData(0, 0, W, H), px = im.data, sd = S.seedOf('dawn' + (o.seed ?? ''));
        const tile = o.tile ?? 40;
        for (let j = 0, i = 0; j < H; j++) {
            const y = (j - m.f) / m.d;
            for (let k = 0; k < W; k++, i += 4) {
                if (!px[i + 3]) continue;
                const x = (k - m.e) / m.a;
                const ly = y0 + ((x - x0) / (x1 - x0)) * (y1 - y0) + 7 * Math.abs(Math.sin((x / tile) * Math.PI)) + 9 * S.noise2(x / 300, 0.5, sd);
                const t = S.smooth(ly - soft, ly + soft, y);
                // a little brighter at the edge of the light (the sky's glow in the shade near it)
                const r0 = su[0] + (sh[0] - su[0]) * t, g0 = su[1] + (sh[1] - su[1]) * t, b0 = su[2] + (sh[2] - su[2]) * t;
                px[i] = Math.min(255, px[i] * r0);
                px[i + 1] = Math.min(255, px[i + 1] * g0);
                px[i + 2] = Math.min(255, px[i + 2] * b0);
            }
        }
        g.putImageData(im, 0, 0);
    }

    // The sun come in through the street door behind the eye: a slanted patch of warm light
    // on the hall's wall, and in it the shadow of the door's wrought-iron grille (cancela):
    // bars, a band of scrolls, a crest of C-scrolls.
    function sunPatch(g, poly, { seed = 'sp' } = {}) {
        const r = rng('patch' + seed), bb = S.bbox(poly);
        // the light, feathered by the sun's size, on the paint only
        softly(g, 16, (q) => {
            q.fillStyle = 'rgba(255,212,174,0.34)';
            path(q, poly);
            q.fill();
        }, 'source-atop');
        g.save();
        path(g, poly);
        g.clip();
        g.globalCompositeOperation = 'source-atop';
        // the grille's shadow, sheared like the patch
        const sh = (x, y) => [x + (y - bb.y) * 0.32, y];
        softly(g, 2.6, (q) => {
            q.strokeStyle = 'rgba(70,58,110,0.42)';
            q.lineCap = 'round';
            const bars = 9, x0 = bb.x + 10, w = (bb.w - 60) / bars;
            q.lineWidth = 5;
            for (let i = 0; i <= bars; i++) {
                q.beginPath();
                q.moveTo(...sh(x0 + i * w, bb.y));
                q.lineTo(...sh(x0 + i * w, bb.y + bb.h));
                q.stroke();
            }
            for (const yy of [bb.y + bb.h * 0.28, bb.y + bb.h * 0.36, bb.y + bb.h * 0.78]) {
                q.beginPath();
                q.moveTo(...sh(bb.x, yy));
                q.lineTo(...sh(bb.x + bb.w, yy));
                q.stroke();
            }
            // scrolls between the two rails
            q.lineWidth = 3;
            for (let i = 0; i < bars; i++) {
                const cx = x0 + (i + 0.5) * w, cy = bb.y + bb.h * 0.32;
                for (const sd of [-1, 1]) {
                    q.beginPath();
                    for (let k = 0; k <= 18; k++) {
                        const a = (k / 18) * TAU * 0.9, rr = w * 0.42 * (1 - k / 24);
                        const p = sh(cx + sd * (w * 0.2 + Math.cos(a) * rr * sd), cy + Math.sin(a) * rr * 0.7);
                        if (k) q.lineTo(...p);
                        else q.moveTo(...p);
                    }
                    q.stroke();
                }
            }
        }, 'source-atop');
        g.restore();
        void r;
    }

    // A brass tray hung on the wall: chased rings and an eight-pointed star, a hammered rim.
    function tray(g, { x = 0, y = 0, r: rad = 70, seed = 'tr' } = {}) {
        const res = resOf(g);
        const relief = S.reliefField({ x: -rad - 2, y: -rad - 2, w: rad * 2 + 4, h: rad * 2 + 4 }, res, (q) => {
            q.strokeStyle = '#fff';
            q.lineWidth = 2.2;
            for (const k of [0.92, 0.72, 0.36]) {
                q.beginPath();
                q.arc(0, 0, rad * k, 0, TAU);
                q.stroke();
            }
            const star = [];
            for (let i = 0; i < 16; i++) star.push([Math.cos((i / 16) * TAU) * rad * (i % 2 ? 0.42 : 0.66), Math.sin((i / 16) * TAU) * rad * (i % 2 ? 0.42 : 0.66)]);
            q.lineWidth = 1.6;
            q.beginPath();
            S.trace(q, star);
            q.stroke();
            for (let i = 0; i < 24; i++) {
                const a = (i / 24) * TAU;
                q.beginPath();
                q.arc(Math.cos(a) * rad * 0.82, Math.sin(a) * rad * 0.82, rad * 0.06, 0, TAU);
                q.stroke();
            }
        }, 0.8);
        const sp = S.form({
            box: { x: -rad - 2, y: -rad - 2, w: rad * 2 + 4, h: rad * 2 + 4 }, res, seed: S.seedOf(seed),
            mask: (c) => disc(c, 0, 0, rad, '#fff'), inflate: 'none',
            height: (px, py) => {
                const d = Math.hypot(px, py) / rad;
                return (d > 0.94 ? 6 * (1 - Math.abs(d - 0.97) * 30) : -4 * (1 - d * d)) + relief(px, py) * 1.6 + 0.3 * S.noise2(px * 0.6, py * 0.6, 4);
            },
            ramp: [[0, '#3a2410'], [0.3, '#7a5418'], [0.5, '#b0842a'], [0.68, '#d4aa48'], [0.84, '#ecd080'], [1, '#fff4c8']], soft: 0.85,
            spec: { amp: 0.7, power: 16, from: 0.4, to: 0.9, ragged: 0.4, color: '#fff8dc' },
            tint: (px, py, tone, rgb) => toward(rgb, 90, 110, 80, S.smooth(0.25, 0.6, S.noise2(px * 0.05, py * 0.05, 7)) * 0.25),
        });
        castSprite(g, sp, { x, y, dx: 10, dy: 12, blur: 6, alpha: 0.4, color: SHADOW });
        S.put(g, sp, { x, y });
        nail(g, x, y - rad - 6, 'nail', 31);
        lineP(g, [[x - 6, y - rad + 2], [x, y - rad - 6], [x + 6, y - rad + 2]], 1, '#5a4a3a');
    }

    // A frieze stencilled in ochre and añil under the hall's ceiling: a running band of
    // palmettes between two ruled lines, every repeat a little off its neighbour (stencil
    // shifted by hand), worn where the lime was washed over it.
    function frieze(g, { x0, x1, y, h = 46, seed = 'fz' }) {
        const r = rng('frieze' + seed);
        lineP(g, [[x0, y], [x1, y + 2]], 3, 'rgba(200,150,70,0.75)');
        lineP(g, [[x0, y + h], [x1, y + h + 1]], 3, 'rgba(200,150,70,0.75)');
        for (let x = x0 + 10; x < x1; x += 44) {
            const ox = (r() - 0.5) * 2, oy = (r() - 0.5) * 2, cx = x + 22 + ox, cy = y + h / 2 + oy;
            // the palmette: a fan of five leaves on a scroll
            for (let m = -2; m <= 2; m++) {
                const a = -Math.PI / 2 + m * 0.42;
                oval(g, cx + Math.cos(a) * 9, cy + 4 + Math.sin(a) * 9, 7, 2.6, a, `rgba(62,92,150,${0.55 + r() * 0.2})`);
            }
            g.lineWidth = 2;
            g.strokeStyle = 'rgba(200,150,70,0.7)';
            g.beginPath();
            g.arc(cx - 11, cy + 8, 5, -0.5, 3.4);
            g.stroke();
            g.beginPath();
            g.arc(cx + 11, cy + 8, 5, -0.3, 3.6);
            g.stroke();
            disc(g, cx, cy + 10, 2.4, 'rgba(160,60,50,0.7)');
            // worn: lime washed over in patches
            if (r() < 0.35) oval(g, cx + (r() - 0.5) * 20, cy + (r() - 0.5) * 12, 8 + r() * 10, 4 + r() * 6, r(), 'rgba(236,230,232,0.55)');
        }
    }
    // A Fajalauza plate from Granada hung on the wall: a cream tin glaze, a pomegranate and
    // a bird in green and blue, a dotted rim, a chip and a hairline crack, its wire hanger.
    function plate(g, { x = 0, y = 0, r: rad = 52, seed = 'pl' } = {}) {
        const res = resOf(g), r = rng('plate' + seed);
        const sp = S.form({
            box: { x: -rad - 2, y: -rad - 2, w: rad * 2 + 4, h: rad * 2 + 4 }, res, seed: S.seedOf(seed),
            mask: (c) => disc(c, 0, 0, rad, '#fff'), inflate: 'none',
            height: (px, py) => {
                const d = Math.hypot(px, py) / rad;
                return d > 0.78 ? 4 * Math.sin(((d - 0.78) / 0.22) * Math.PI) : -2 * (1 - d);
            },
            ramp: [[0, '#6a6070'], [0.3, '#a49aa0'], [0.5, '#d4c8bc'], [0.68, '#efe4d0'], [0.84, '#f8f0e0'], [1, '#fffcf2']], soft: 0.85,
            spec: { amp: 0.6, power: 20, from: 0.4, to: 0.9, ragged: 0.3, color: '#ffffff' },
            over: (c) => {
                // the painting: a pomegranate on a twig and a bird, in the copper green and cobalt
                const G = 'rgba(46,120,92,0.85)', B = 'rgba(40,70,150,0.85)';
                c.lineWidth = 2;
                c.strokeStyle = G;
                c.beginPath();
                c.moveTo(-30, 26);
                c.quadraticCurveTo(-6, 6, 16, -14);
                c.stroke();
                for (const [lx, ly, la] of [[-18, 16, -0.4], [-4, 4, 0.9], [6, -6, -0.5]]) oval(c, lx, ly, 8, 3, la, G);
                disc(c, 18, -18, 11, B);
                fillP(c, [[14, -30], [18, -36], [22, -30]], B);
                for (let m = 0; m < 9; m++) disc(c, 14 + (r() - 0.5) * 12, -18 + (r() - 0.5) * 12, 1.4, 'rgba(240,236,226,0.85)');
                // the bird
                oval(c, -14, -22, 9, 5, -0.2, G);
                fillP(c, [[-22, -22], [-32, -28], [-30, -20]], G);
                disc(c, -6, -25, 3.4, G);
                disc(c, -5.5, -25.5, 0.9, '#2a2a2a');
                for (let m = 0; m < 24; m++) disc(c, Math.cos((m / 24) * TAU) * rad * 0.88, Math.sin((m / 24) * TAU) * rad * 0.88, 1.6, m % 2 ? B : G);
                lineP(c, [[rad * 0.3, rad * 0.5], [rad * 0.15, rad * 0.2], [rad * 0.2, 0]], 0.5, 'rgba(90,80,70,0.6)');
            },
        });
        castSprite(g, sp, { x, y, dx: 9, dy: 11, blur: 5, alpha: 0.4, color: SHADOW });
        S.put(g, sp, { x, y });
        disc(g, x + rad * 0.62, y + rad * 0.62, 4, '#b07a5a'); // a chip, the red body under the glaze
        lineP(g, [[x - 5, y - rad + 2], [x, y - rad - 8], [x + 5, y - rad + 2]], 1, '#6a6a70');
        nail(g, x, y - rad - 8, 'nail', 51);
    }

    // An old iron key on a nail, its bit and bow, a loop of string through the bow.
    function key(g, { x = 0, y = 0, s = 1 } = {}) {
        g.save();
        g.translate(x, y);
        g.scale(s, s);
        lineP(g, [[0, 0], [-6, 10], [6, 10], [0, 0]], 0.8, '#b8a070');
        const k = [[-1.6, 14], [1.6, 14], [1.6, 74], [9, 74], [9, 80], [5, 80], [5, 86], [1.6, 86], [1.6, 92], [-1.6, 92]];
        S.cast(g, (c) => {
            fillP(c, k, '#000');
            c.lineWidth = 3;
            c.beginPath();
            c.arc(0, 18, 7, 0, TAU);
            c.stroke();
        }, { blur: 3, dx: 6, dy: 7, color: 'rgba(60,50,90,0.45)' });
        S.piece(g, k, { fill: '#4a4040', line: 0, shade: { color: '#100c10', alpha: 0.6, w: 3 }, light: { color: '#b0a0a0', alpha: 0.6, w: 2 } });
        g.lineWidth = 3;
        g.strokeStyle = '#4a4040';
        g.beginPath();
        g.arc(0, 18, 7, 0, TAU);
        g.stroke();
        g.lineWidth = 0.8;
        g.strokeStyle = 'rgba(190,170,160,0.7)';
        g.beginPath();
        g.arc(0, 18, 7, 3.4, 4.6);
        g.stroke();
        for (let i = 0; i < 4; i++) disc(g, (i - 1.5) * 1.5, 40 + i * 9, 0.9, 'rgba(160,80,40,0.8)');
        g.restore();
        nail(g, x, y, 'nail', 9);
    }

    // The town beyond the last wall, in the haze: roofs of tiles, a palm, and the tower that
    // was the minaret (a square shaft, the belfry, the lantern), all of the air's colour.
    function skyline(g, { y = -360, x0 = -1550, x1 = 1550, seed = 'town' } = {}) {
        const r = rng('sky' + seed), haze = (a) => `rgba(186,168,190,${a})`;
        // roofs: ridges at different heights, the tile rows hinted
        for (let x = x0; x < x1;) {
            const w = 120 + r() * 220, h = 20 + r() * 50, top = y - h;
            fillP(g, [[x, y + 4], [x, top + 10], [x + w * 0.5, top], [x + w, top + 10], [x + w, y + 4]], haze(0.45 + r() * 0.2));
            for (let xx = x + 6; xx < x + w; xx += 9) lineP(g, [[xx, top + 6], [xx, y]], 0.8, haze(0.35));
            if (r() < 0.3) fillP(g, [[x + w * 0.7, top + 2], [x + w * 0.7, top - 18], [x + w * 0.76, top - 18], [x + w * 0.76, top + 2]], haze(0.6)); // a chimney
            x += w + r() * 20;
        }
        // the tower, far off on the left
        const tx = -720, base = y - 20;
        fillP(g, [[tx - 34, base], [tx - 34, base - 220], [tx + 34, base - 220], [tx + 34, base]], haze(0.62));
        for (let i = 0; i < 3; i++) fillP(g, [[tx - 12 + i * 12 - 4, base - 200], [tx - 12 + i * 12 - 4, base - 170], [tx - 12 + i * 12 + 4, base - 170], [tx - 12 + i * 12 + 4, base - 200]], haze(0.85));
        fillP(g, [[tx - 26, base - 220], [tx - 26, base - 300], [tx + 26, base - 300], [tx + 26, base - 220]], haze(0.55));
        for (let i = 0; i < 2; i++) fillP(g, [[tx - 14 + i * 20, base - 290], [tx - 14 + i * 20, base - 240], [tx - 6 + i * 20, base - 240], [tx - 6 + i * 20, base - 290]], haze(0.8));
        fillP(g, [[tx - 16, base - 300], [tx - 16, base - 336], [tx + 16, base - 336], [tx + 16, base - 300]], haze(0.5));
        fillP(g, [[tx - 10, base - 336], [tx, base - 368], [tx + 10, base - 336]], haze(0.5));
        lineP(g, [[tx, base - 368], [tx, base - 392]], 1.4, haze(0.6));
        // a palm over the roofs on the right
        const px = 900, py = y - 40;
        lineP(g, S.curve([[px, y], [px + 10, py - 120], [px + 4, py - 230]], false, 8), 9, haze(0.6));
        for (let i = 0; i < 14; i++) {
            const a = -Math.PI / 2 + (i / 13 - 0.5) * 3.6, l = 90 + r() * 40, tip = [px + 4 + Math.cos(a) * l, py - 230 + Math.sin(a) * l * 0.6 + l * 0.35];
            const fr = S.curve([[px + 4, py - 230], [px + 4 + Math.cos(a) * l * 0.5, py - 236 + Math.sin(a) * l * 0.4], tip], false, 8);
            lineP(g, fr, 2, haze(0.6));
            for (let k = 2; k < fr.length; k += 2) lineP(g, [fr[k], [fr[k][0] + 3, fr[k][1] + 12]], 1, haze(0.5));
        }
    }

    // ------------------------------------------------------------------ a panel of painted tiles
    // A small Sevillian tile panel set in the lime: a blue and honey border, and on the white
    // glaze a búcaro with carnations painted with a loaded brush; the joints and a crazing.
    function tilePanel(g, { x = 0, y = 0, cols = 5, rows = 3, t = 36, seed = 'tp' } = {}) {
        const r = rng('panel' + seed), W = cols * t, H = rows * t, x0 = x - W / 2, y0 = y - H / 2;
        // its shadow and a lime border round it, slightly proud
        softly(g, 4, (q) => q.fillRect(x0 + 6, y0 + 8, W, H));
        g.fillStyle = '#f1e4d8';
        g.fillRect(x0 - 8, y0 - 8, W + 16, H + 16);
        g.fillStyle = '#f3ecdc';
        g.fillRect(x0, y0, W, H);
        g.save();
        g.beginPath();
        g.rect(x0, y0, W, H);
        g.clip();
        // the border: a band of blue with a honey rope
        g.fillStyle = '#3e5c96';
        for (const [a, b, c2, d] of [[x0, y0, W, 10], [x0, y0 + H - 10, W, 10], [x0, y0, 10, H], [x0 + W - 10, y0, 10, H]]) g.fillRect(a, b, c2, d);
        g.lineWidth = 2.4;
        g.strokeStyle = '#c99a42';
        g.strokeRect(x0 + 5, y0 + 5, W - 10, H - 10);
        // the búcaro: a two-handled jar in cobalt, carnations in red and leaves in green
        const bx = x, by = y + H * 0.22;
        const jar = S.curve([[bx - 14, by + 22], [bx - 22, by + 4], [bx - 16, by - 12], [bx - 9, by - 18], [bx + 9, by - 18], [bx + 16, by - 12], [bx + 22, by + 4], [bx + 14, by + 22]], true, 5);
        fillP(g, jar, '#3a5ea4');
        lineP(g, [...jar, jar[0]], 1.2, '#24305a');
        for (const sx of [-1, 1]) {
            g.lineWidth = 2.4;
            g.strokeStyle = '#3a5ea4';
            g.beginPath();
            g.arc(bx + sx * 22, by - 8, 6, 0, TAU);
            g.stroke();
        }
        lineP(g, [[bx - 18, by], [bx + 18, by]], 2, '#c99a42');
        for (let i = 0; i < 9; i++) {
            const a = -Math.PI / 2 + (i / 8 - 0.5) * 2.2, len = 22 + r() * 12, ex = bx + Math.cos(a) * len, ey = by - 18 + Math.sin(a) * len;
            lineP(g, [[bx, by - 18], [ex, ey]], 1.2, '#4e7a3a');
            oval(g, (bx + ex) / 2 + 3, (by - 18 + ey) / 2, 5, 1.6, a + 0.6, '#5e8a3e');
            if (i % 2 === 0) {
                for (let k = 0; k < 6; k++) disc(g, ex + Math.cos(k * 1.05) * 3.2, ey + Math.sin(k * 1.05) * 3.2, 2.4, k % 2 ? '#c8383e' : '#e0605a');
                disc(g, ex, ey, 1.6, '#8a1e2e');
            }
        }
        // the joints, the glaze's gloss on each tile at its own angle, crazing
        for (let i = 1; i < cols; i++) lineP(g, [[x0 + i * t, y0], [x0 + i * t, y0 + H]], 1.2, 'rgba(150,136,120,0.9)');
        for (let j = 1; j < rows; j++) lineP(g, [[x0, y0 + j * t], [x0 + W, y0 + j * t]], 1.2, 'rgba(150,136,120,0.9)');
        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                const gx = x0 + i * t + t * (0.2 + r() * 0.5), gy = y0 + j * t + t * (0.15 + r() * 0.4);
                const gl = g.createRadialGradient(gx, gy, 0, gx, gy, t * 0.5);
                gl.addColorStop(0, `rgba(255,252,246,${0.25 + r() * 0.3})`);
                gl.addColorStop(1, 'rgba(255,252,246,0)');
                g.fillStyle = gl;
                g.fillRect(x0 + i * t, y0 + j * t, t, t);
                for (let m = 0; m < 2; m++) lineP(g, [[x0 + i * t + r() * t, y0 + j * t + r() * t], [x0 + i * t + r() * t, y0 + j * t + r() * t]], 0.35, 'rgba(90,80,70,0.3)');
            }
        }
        g.restore();
        lineP(g, [[x0 - 8, y0 + H + 8], [x0 + W + 8, y0 + H + 8]], 1.6, 'rgba(60,50,80,0.35)');
    }

    // ------------------------------------------------------------------ embroidery for the shawl
    // A rose in satin stitch seen from above: petals as fans of thread, each lit by the angle of
    // its threads; a leaf in fishbone; the colours of a Manila shawl on cream.
    function stitchRose(q, x, y, rad, col, seed) {
        const r = rng('stitch' + seed), C = FLOWER[col] ?? FLOWER.red;
        for (let ring = 0; ring < 3; ring++) {
            const n = 5 + ring, rr = rad * (1 - ring * 0.28);
            for (let p = 0; p < n; p++) {
                const a0 = (p / n) * TAU + ring * 0.4 + r() * 0.2, span = (TAU / n) * 0.9;
                // the petal's rounded outline filled first, the threads laid over it
                const am = a0 + span / 2, pr = rr * 0.55;
                oval(q, x + Math.cos(am) * rr * 0.55, y + Math.sin(am) * rr * 0.55, pr * 0.95, pr * 0.62, am, css(mixRGB(C[0], C[1], 0.6)));
                for (let k = 0; k <= 10; k++) {
                    const a = a0 + (span * k) / 10, tone = 0.5 + 0.5 * Math.cos(a * 2 + 0.8); // the floss's sheen by direction
                    const c = tone < 0.5 ? mixRGB(C[0], C[1], tone * 2) : mixRGB(C[1], C[2], (tone - 0.5) * 1.6);
                    q.lineWidth = Math.max(0.5, rad * 0.09);
                    q.strokeStyle = css(c);
                    q.beginPath();
                    q.moveTo(x + Math.cos(a) * rr * 0.25, y + Math.sin(a) * rr * 0.25);
                    q.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
                    q.stroke();
                }
                // the hairline of bare silk between petals
                q.lineWidth = 0.4;
                q.strokeStyle = 'rgba(240,226,198,0.9)';
                q.beginPath();
                q.moveTo(x + Math.cos(a0) * rr * 0.3, y + Math.sin(a0) * rr * 0.3);
                q.lineTo(x + Math.cos(a0) * rr, y + Math.sin(a0) * rr);
                q.stroke();
            }
        }
        disc(q, x, y, rad * 0.18, css(C[0]));
    }
    function stitchLeaf(q, x, y, a, len, seed) {
        const r = rng('sleaf' + seed), w = len * 0.32;
        for (let k = 0; k <= 12; k++) {
            const t = k / 12, px = x + Math.cos(a) * len * t, py = y + Math.sin(a) * len * t, hw = w * Math.sin(Math.PI * t);
            for (const sd of [-1, 1]) {
                q.lineWidth = Math.max(0.5, len * 0.05);
                q.strokeStyle = sd < 0 ? '#5e8a4a' : '#3e6a36';
                q.beginPath();
                q.moveTo(px, py);
                q.lineTo(px + Math.cos(a + sd * 1.1) * hw + Math.cos(a) * hw * 0.5, py + Math.sin(a + sd * 1.1) * hw + Math.sin(a) * hw * 0.5);
                q.stroke();
            }
        }
        void r;
    }

    // ------------------------------------------------------------------ the floor
    // Cordoban pebbles in perspective, from the wall's foot (y = floor) down to y1, across x0 … x1.
    // The eye is `eye` units above the floor at the wall's reading distance (1000): a row at
    // true distance D lies at y = floor × 1000 / D.
    function floor(g, o) {
        const fl = o.floor, x0 = o.x0, x1 = o.x1, y1 = o.y1, r = rng('floor' + o.seed), sd = S.seedOf('floor' + o.seed);
        const p = o.pebble ?? 15;
        // the sand bed, wetter (darker) nearer
        const gr = g.createLinearGradient(0, fl, 0, y1);
        gr.addColorStop(0, '#8c7d72');
        gr.addColorStop(1, '#6a5c58');
        g.fillStyle = gr;
        g.fillRect(x0, fl, x1 - x0, y1 - fl);
        const pal = [['#e9e2d8', 4], ['#cfc6bc', 3], ['#b9aa98', 3], ['#d8c4a2', 2], ['#9a948e', 2], ['#efe9e2', 2]];
        const pick = () => {
            let t = r() * 16;
            for (const [c, w] of pal) if ((t -= w) <= 0) return c;
            return pal[0][0];
        };
        // rows from the wall forward
        let D = 1000;
        const Dend = (1000 * fl) / y1;
        let row = 0;
        while (D > Dend) {
            const y = (fl * 1000) / D, sx = (p * 1000) / D, sy = (p * fl * 1000) / (D * D) * 1.15;
            const yy = y + sy * 0.5;
            // the pattern: a lozenge band of black pebbles, a brick border along the wall
            for (let X = x0 * (D / 1000) - p; X < x1 * (D / 1000) + p; X += p * (0.85 + r() * 0.3)) {
                const x = (X * 1000) / D;
                if (x < x0 - sx || x > x1 + sx) continue;
                const tX = X / (p * 9), tD = (D - Dend) / (p * 9);
                const lz = Math.abs(((tX + tD) % 2 + 2) % 2 - 1) < 0.12 || Math.abs(((tX - tD) % 2 + 2) % 2 - 1) < 0.12;
                const border = row < 2;
                let c = border ? (r() < 0.5 ? '#a8573c' : '#b8674a') : lz ? (r() < 0.7 ? '#5c5458' : '#6e6460') : pick();
                const rx = sx * (border ? 0.95 : 0.36 + r() * 0.14), ry = sy * (border ? 0.45 : 0.36 + r() * 0.14), a = border ? 0 : (r() - 0.5) * 0.6;
                const px = x + (r() - 0.5) * sx * 0.25, py = yy + (r() - 0.5) * sy * 0.3;
                if (!border && r() < 0.012) continue; // a pebble missing
                oval(g, px + rx * 0.12, py + ry * 0.3, rx, ry, a, 'rgba(40,30,34,0.5)');
                oval(g, px, py, rx, ry, a, c);
                // lit from above and the top left; the wet top takes the sky's rose
                oval(g, px - rx * 0.22, py - ry * 0.3, rx * 0.6, ry * 0.45, a, 'rgba(255,236,226,0.32)');
                if (r() < 0.5) oval(g, px - rx * 0.3, py - ry * 0.42, rx * 0.22, ry * 0.18, a, 'rgba(255,246,240,0.7)');
                oval(g, px + rx * 0.25, py + ry * 0.35, rx * 0.5, ry * 0.35, a, 'rgba(50,44,70,0.25)');
            }
            D -= p * (0.82 + r() * 0.12);
            row++;
        }
        // wet patches mirroring the sky, and a puddle
        for (let i = 0; i < (o.wet ?? 5); i++) {
            const x = x0 + r() * (x1 - x0), y = fl + (y1 - fl) * (0.15 + r() * 0.8), rx = 40 + r() * 120, ry = rx * (y / 1000) * 0.6;
            const w = g.createRadialGradient(x, y, 1, x, y, rx);
            w.addColorStop(0, 'rgba(236,206,206,0.32)');
            w.addColorStop(0.7, 'rgba(200,190,210,0.14)');
            w.addColorStop(1, 'rgba(200,190,210,0)');
            g.save();
            g.translate(x, y);
            g.scale(1, ry / rx);
            g.translate(-x, -y);
            g.fillStyle = w;
            g.fillRect(x - rx, y - rx, rx * 2, rx * 2);
            g.restore();
        }
        // moss in the joints along the wall's foot
        for (let i = 0; i < (x1 - x0) / 9; i++) disc(g, x0 + r() * (x1 - x0), fl + r() * r() * 12, 0.7 + r() * 1.6, `rgba(${80 + r() * 30},${104 + r() * 30},${58},${0.3 + r() * 0.3})`);
        // the shadow of the wall's foot and the light coming across the floor
        const gs = g.createLinearGradient(0, fl, 0, fl + 26);
        gs.addColorStop(0, 'rgba(50,44,80,0.32)');
        gs.addColorStop(1, 'rgba(50,44,80,0)');
        g.fillStyle = gs;
        g.fillRect(x0, fl, x1 - x0, 26);
    }

    // ------------------------------------------------------------------ the dawn sky
    // A gradient (rose low, a cool pale blue high), wisps of cloud lit from below, specks of birds.
    function sky(g, box, o = {}) {
        const r = rng('sky' + (o.seed ?? 1));
        const y0 = o.y0 ?? box.y, y1 = o.y1 ?? box.y + box.h;
        const gr = g.createLinearGradient(0, o.hi ?? -900, 0, o.lo ?? 0);
        P.sky.forEach((c, i) => gr.addColorStop(i / (P.sky.length - 1), c));
        g.fillStyle = gr;
        g.fillRect(box.x, y0, box.w, y1 - y0);
        // cloud wisps: long soft strokes, grey-lilac with a rose-gold underside
        softly(g, 6, (q) => {
            for (let i = 0; i < (o.clouds ?? 7); i++) {
                const x = box.x + r() * box.w, y = y0 + r() * (y1 - y0) * 0.8, len = 120 + r() * 300;
                const pts = [];
                for (let k = 0; k <= 12; k++) pts.push([x + (k / 12) * len, y + Math.sin(k * 0.5 + i) * 6 - (k / 12) * len * 0.05]);
                S.dab(q, pts, { w: 10 + r() * 16, color: '#cbbfd0', alpha: 0.35, bristles: 6, dry: 0.4, seed: i + 400 });
                S.dab(q, shift(pts, 2, 5), { w: 6 + r() * 6, color: '#f6d2b6', alpha: 0.45, bristles: 5, dry: 0.5, seed: i + 500 });
            }
        });
    }
    // A swallow far off: a dark crescent with a forked tail.
    function speck(g, x, y, s, a = 0) {
        g.save();
        g.translate(x, y);
        g.rotate(a);
        g.scale(s, s);
        g.fillStyle = '#2c2c48';
        g.beginPath();
        g.moveTo(-14, -3);
        g.quadraticCurveTo(-6, -6, -1, 0);
        g.quadraticCurveTo(6, -6, 14, -4);
        g.quadraticCurveTo(6, -2, 1, 2);
        g.lineTo(3, 7);
        g.lineTo(0, 4);
        g.lineTo(-3, 7);
        g.lineTo(-1, 2);
        g.quadraticCurveTo(-6, -2, -14, -3);
        g.fill();
        disc(g, 0, 1.6, 1.2, 'rgba(240,226,220,0.8)');
        g.restore();
    }

    // ------------------------------------------------------------------ the eave
    // The wall's top at y: a whitewashed brick cornice, the tiles' noses, sky above (painted
    // by the caller). x0 … x1. Martins' nests under it at `nests` (list of x).
    function eave(g, o) {
        const y = o.y, x0 = o.x0, x1 = o.x1, r = rng('eave' + o.seed);
        // the cornice's shadow on the wall
        const gs = g.createLinearGradient(0, y, 0, y + 56);
        gs.addColorStop(0, 'rgba(66,62,110,0.42)');
        gs.addColorStop(0.5, 'rgba(66,62,110,0.16)');
        gs.addColorStop(1, 'rgba(66,62,110,0)');
        g.fillStyle = gs;
        g.fillRect(x0, y, x1 - x0, 56);
        // two courses of brick stepping out, lime-washed: their undersides in shade
        for (const [yy, h, out] of [[y - 9, 9, 4], [y - 20, 11, 9]]) {
            const band = [[x0, yy], [x1, yy], [x1, yy + h], [x0, yy + h]];
            S.piece(g, band, { fill: '#efe2d6', line: 0, shade: { color: '#6c6a98', alpha: 0.5, w: 5, push: 3 }, light: { color: '#fffaf2', alpha: 0.6, w: 3 } });
            g.fillStyle = 'rgba(60,56,100,0.4)';
            g.fillRect(x0, yy + h - 2.2, x1 - x0, 2.2);
            for (let x = x0 + r() * 20; x < x1; x += 24 + r() * 6) lineP(g, [[x, yy + 1], [x, yy + h - 1]], 0.8, 'rgba(120,110,130,0.3)');
        }
        // the tiles, seen end on from below: channel tiles (∪) resting on the cornice, cover
        // tiles (∩) over their joints, the mouths of both packed with whitewashed mortar
        const ty = y - 20, tw = 40, th = 26;
        const crescent = (cx, cy, rx, ry, t, up) => {
            const pts = [];
            for (let k = 0; k <= 16; k++) {
                const a = (k / 16) * Math.PI;
                pts.push([cx + Math.cos(a) * rx, cy + (up ? -1 : 1) * Math.sin(a) * ry]);
            }
            for (let k = 16; k >= 0; k--) {
                const a = (k / 16) * Math.PI;
                pts.push([cx + Math.cos(a) * (rx - t), cy + (up ? -1 : 1) * Math.sin(a) * (ry - t)]);
            }
            return pts;
        };
        const tile = (pts, seedT) => {
            const rr = Motion.rng('tile' + seedT);
            S.piece(g, pts, {
                fill: S.mix('#b0603e', '#c98260', rr()), line: 0,
                shade: { color: '#4c1e26', alpha: 0.55, w: 6, push: 3 }, light: { color: '#ffd8bc', alpha: 0.55, w: 4, push: 2 },
                detail: (q) => {
                    for (let m = 0; m < 9; m++) {
                        const p = pts[Math.floor(rr() * pts.length)];
                        disc(q, p[0] + (rr() - 0.5) * 6, p[1] + (rr() - 0.5) * 6, 0.6 + rr() * 2.2, rr() < 0.55 ? 'rgba(226,168,64,0.8)' : rr() < 0.5 ? 'rgba(226,226,210,0.75)' : 'rgba(70,40,40,0.5)');
                    }
                },
            });
        };
        let i = 0;
        for (let x = x0 - tw; x < x1 + tw; x += tw, i++) {
            const cx = x + tw / 2, rr = Motion.rng('ch' + i + o.seed);
            // its mouth: mortar, whitewashed, a dark gap where it has fallen out
            const mouth = [];
            for (let k = 0; k <= 12; k++) mouth.push([cx + Math.cos((k / 12) * Math.PI) * (tw / 2 - 3), ty - 12 + Math.sin((k / 12) * Math.PI) * 9]);
            fillP(g, mouth, rr() < 0.15 ? '#3a2a30' : '#ece4dc');
            lineP(g, mouth, 1, 'rgba(80,70,100,0.4)');
            tile(crescent(cx, ty - 12, tw / 2 + 1, 13, 3.4, false), 'c' + i + o.seed);
        }
        i = 0;
        // the cover tiles' shadows on the channel tiles, all through one blur
        softly(g, 2, (q) => {
            for (let x = x0 - tw; x < x1 + tw; x += tw) fillP(q, [[x + 18, ty - 10], [x + 25, ty - 8], [x + 20, ty - 2]], 'rgba(60,40,70,0.35)');
        });
        for (let x = x0 - tw; x < x1 + tw; x += tw, i++) {
            const rr = Motion.rng('cv' + i + o.seed), w2 = 17 + rr() * 2, h2 = 15 + rr() * 3;
            if (rr() < 0.05) {
                // a broken one: its jagged stump
                fillP(g, [[x - w2, ty - 10], [x - w2 + 3, ty - 18], [x - 4, ty - 15], [x + 3, ty - 21], [x + w2, ty - 10]], '#9a4e36');
                continue;
            }
            const inner = [];
            for (let k = 0; k <= 12; k++) inner.push([x + Math.cos((k / 12) * Math.PI) * (w2 - 3.5), ty - 10 - Math.sin((k / 12) * Math.PI) * (h2 - 3.5)]);
            fillP(g, inner, rr() < 0.2 ? '#4a3438' : '#efe7de');
            oval(g, x + 2, ty - 12, w2 * 0.5, 2.5, 0, 'rgba(80,70,100,0.25)');
            tile(crescent(x, ty - 10, w2, h2, 3.6, true), 'v' + i + o.seed);
        }
        // grass and a small yellow crucifer growing in the joints
        for (const gx of o.grass ?? []) {
            for (let k = 0; k < 14; k++) {
                const a = -Math.PI / 2 + (r() - 0.5) * 1.6, l = 10 + r() * 22;
                S.ink(g, [[gx + (r() - 0.5) * 6, ty - th + 6], [gx + Math.cos(a) * l * 0.5, ty - th + 6 + Math.sin(a) * l * 0.5], [gx + Math.cos(a) * l + (r() - 0.5) * 4, ty - th + 6 + Math.sin(a) * l]], { w: 1.4, color: r() < 0.5 ? '#6f8a3e' : '#9aab58', taper: [0, 1] });
            }
            for (let k = 0; k < 4; k++) {
                const fx = gx + 4 + (r() - 0.5) * 10, fy = ty - th - 14 - r() * 12;
                S.ink(g, [[gx + 2, ty - th + 6], [fx, fy]], { w: 1, color: '#6d7c3a', taper: [0, 0] });
                for (let m = 0; m < 4; m++) disc(g, fx + Math.cos(m * 1.57 + 0.4) * 1.6, fy + Math.sin(m * 1.57 + 0.4) * 1.6, 1.3, '#e8c63a');
            }
        }
        // martins' nests under the cornice: mud pellets, the entrance at the top
        for (const nx of o.nests ?? []) nest(g, nx, y + 2, S.seedOf('nest' + nx));
    }
    function nest(g, x, y, seed) {
        const r = Motion.rng('nest' + seed), w = 22 + r() * 6, h = 18 + r() * 5;
        // droppings streaked down the wall below
        for (let k = 0; k < 6; k++) {
            const sx = x + (r() - 0.5) * w * 1.2, l = 8 + r() * r() * 46, sy = y + h - 2 + r() * 6;
            S.dab(g, [[sx, sy], [sx + (r() - 0.5) * 2, sy + l * 0.6], [sx + (r() - 0.5) * 3, sy + l]], { w: 1.2 + r() * 1.6, color: r() < 0.75 ? '#fbf8f2' : '#6a6060', alpha: 0.45, bristles: 3, dry: 0.4, seed: seed + k, taper: 0.9 });
            disc(g, sx, sy + l, 0.8 + r(), r() < 0.7 ? 'rgba(250,248,242,0.7)' : 'rgba(80,70,70,0.5)');
        }
        const cup = [];
        for (let k = 0; k <= 16; k++) {
            const a = (k / 16) * Math.PI;
            cup.push([x + Math.cos(a) * w, y + Math.sin(a) * h * (1 + 0.1 * Math.sin(a * 3))]);
        }
        S.cast(g, (c) => fillP(c, cup, '#000'), { blur: 4, dx: 6, dy: 7, color: 'rgba(60,54,96,0.45)' });
        S.piece(g, cup, {
            fill: '#9c8a72', line: 0,
            shade: { color: '#3c3040', alpha: 0.6, w: 10, push: 5 }, light: { color: '#f2dcc6', alpha: 0.5, w: 7, push: 3 },
            detail: (q) => {
                // pellet by pellet, in courses
                for (let row = 0; row < 6; row++) {
                    const ry = y + row * (h / 5.5);
                    for (let px = x - w; px < x + w; px += 4.6 + r() * 1.4) {
                        const rr = 1.8 + r() * 1.1;
                        disc(q, px + 0.6, ry + 0.7, rr, 'rgba(50,38,40,0.4)');
                        disc(q, px, ry, rr, S.mix('#a69276', '#7a6a56', r()));
                        disc(q, px - 0.5, ry - 0.6, rr * 0.5, 'rgba(240,222,200,0.45)');
                    }
                }
                for (let k = 0; k < 3; k++) lineP(q, [[x - w + r() * w * 2, y + r() * h], [x - w + r() * w * 2, y + r() * h]], 0.6, 'rgba(220,200,150,0.8)'); // straw
            },
        });
        // the entrance, up against the cornice
        oval(g, x + w * 0.2, y + 3.5, 6, 3.4, 0, '#2a2026');
    }

    // ------------------------------------------------------------------ the zaguán's ceiling
    // Beams running from the wall towards the eye, over the hall: seen from below they open
    // out towards the viewer (their lines run to the vanishing point on the axis). Painted
    // from y = top (the box's top) down to y = foot (the wall plate on the far wall).
    function ceiling(g, o) {
        const { x0, x1, top, foot } = o, r = rng('ceil' + o.seed), k = top / foot; // how much wider at the top edge
        // boards between the beams, lime-washed and in shade, lit a little from the patio below
        const gr = g.createLinearGradient(0, top, 0, foot);
        gr.addColorStop(0, '#9c98ae');
        gr.addColorStop(1, '#c4bcc4');
        g.fillStyle = gr;
        g.fillRect(x0, top, x1 - x0, foot - top);
        for (let i = 0; i < 160; i++) {
            const x = x0 + r() * (x1 - x0), yy = top + r() * (foot - top);
            S.dab(g, [[x, yy], [x + 30 + r() * 60, yy + (r() - 0.5) * 6]], { w: 6 + r() * 8, color: r() < 0.5 ? '#ffffff' : '#6a6680', alpha: 0.08, bristles: 6, seed: i });
        }
        // the beams: underside and the side that faces the axis
        const step = o.step ?? 120;
        for (let X = Math.ceil(x0 / step) * step - step / 2; X < x1; X += step) {
            const w = 26, side = 9 * Math.sign(-X) * Math.min(1, Math.abs(X) / 300);
            const at = (x, y) => [x * (y / foot), y];
            const under = [at(X - w / 2, foot), at(X + w / 2, foot), at(X + w / 2, top), at(X - w / 2, top)];
            if (Math.abs(side) > 0.5) {
                const e = X + (side > 0 ? w / 2 : -w / 2);
                const sideP = [at(e, foot), at(e + side, foot - 14), at(e + side, top - 20), at(e, top)];
                fillP(g, sideP, '#7a5a44');
                S.piece(g, sideP, { fill: '#7a5a44', line: 0, shade: { color: '#2a1810', alpha: 0.5, w: 8 }, light: { color: '#e8b890', alpha: 0.35, w: 6 } });
            }
            S.piece(g, under, {
                fill: S.mix('#5a3e30', '#6e4c38', r()), line: 0,
                shade: { color: '#1e1214', alpha: 0.55, w: 10, push: 5 }, light: { color: '#c8906a', alpha: 0.3, w: 8, push: 4 },
                detail: (q) => {
                    // the grain, running along the beam; an adze's facets; worm holes
                    for (let m = 0; m < 14; m++) {
                        const u = (m + r() * 0.6) / 14 - 0.5, pts = [];
                        for (let t = 0; t <= 10; t++) pts.push(at(X + u * w + Math.sin(t * 1.3 + m) * 1.2, foot + ((top - foot) * t) / 10));
                        lineP(q, pts, 0.7, r() < 0.5 ? 'rgba(30,18,16,0.45)' : 'rgba(200,150,110,0.3)');
                    }
                    for (let m = 0; m < 6; m++) {
                        const p = at(X + (r() - 0.5) * w, foot + (top - foot) * r());
                        disc(q, p[0], p[1], 0.7 + r() * 0.6, '#1a0e0e');
                    }
                },
            });
            // lime splashed on its edges at the last whitewashing
            for (let m = 0; m < 6; m++) {
                const p = at(X + (r() < 0.5 ? -1 : 1) * w * 0.48, foot + (top - foot) * r());
                disc(g, p[0], p[1], 0.8 + r() * 2.2, 'rgba(236,232,236,0.75)');
            }
        }
        // the wall plate the beams rest on, along the far wall's top
        const plate = [[x0, foot - 6], [x1, foot - 6], [x1, foot + 16], [x0, foot + 16]];
        S.piece(g, plate, { fill: '#634636', line: 0, shade: { color: '#1e1214', alpha: 0.5, w: 7 }, light: { color: '#d8a07a', alpha: 0.3, w: 5 } });
        for (let m = 0; m < 30; m++) lineP(g, [[x0 + r() * (x1 - x0), foot + 2 + r() * 12], [x0 + r() * (x1 - x0), foot + 2 + r() * 12]].sort((a, b) => a[0] - b[0]).map(([x, y], j, arr) => [x, arr[0][1] + (y - arr[0][1]) * 0.05]), 0.6, 'rgba(30,18,16,0.4)');
        const gs = g.createLinearGradient(0, foot + 16, 0, foot + 50);
        gs.addColorStop(0, 'rgba(50,46,90,0.4)');
        gs.addColorStop(1, 'rgba(50,46,90,0)');
        g.fillStyle = gs;
        g.fillRect(x0, foot + 16, x1 - x0, 34);
        // a swallow's open mud cup on a beam's side, and old cobwebs in the corners
        for (const nx of o.nests ?? []) {
            const ny = foot - 60;
            const cup = [];
            for (let m = 0; m <= 12; m++) cup.push([nx + Math.cos((m / 12) * Math.PI) * 18, ny + Math.sin((m / 12) * Math.PI) * 13]);
            S.piece(g, cup, { fill: '#8e7c66', line: 0, shade: { color: '#2e2428', alpha: 0.6, w: 7 }, light: { color: '#e8d0b4', alpha: 0.4, w: 5 },
                detail: (q) => {
                    for (let m = 0; m < 40; m++) disc(q, nx + (r() - 0.5) * 34, ny + r() * 13, 1.4 + r(), r() < 0.5 ? 'rgba(60,46,40,0.4)' : 'rgba(220,200,170,0.35)');
                    for (let m = 0; m < 5; m++) lineP(q, [[nx - 18 + r() * 36, ny + r() * 4], [nx - 18 + r() * 36, ny - 4 + r() * 6]], 0.7, 'rgba(226,206,150,0.9)');
                } });
        }
        for (const [cx, cy, rad] of o.webs ?? []) {
            void 0;
            g.lineWidth = 0.4;
            g.strokeStyle = 'rgba(236,232,240,0.35)';
            for (let m = 0; m < 9; m++) {
                g.beginPath();
                g.moveTo(cx, cy);
                g.lineTo(cx + Math.cos(m * 0.35) * rad * (0.6 + r() * 0.4) * Math.sign(-cx || 1), cy + Math.sin(m * 0.35) * rad * (0.6 + r() * 0.4));
                g.stroke();
            }
            for (let m = 1; m < 6; m++) {
                g.beginPath();
                for (let a2 = 0; a2 <= 3; a2 += 0.35) g.lineTo(cx + Math.cos(a2) * rad * m * 0.17 * Math.sign(-cx || 1), cy + Math.sin(a2) * rad * m * 0.17 + 2 * Math.sin(a2 * 5));
                g.stroke();
            }
        }
    }

    // ------------------------------------------------------------------ the skein (NO8DO)
    // Hung from a nail at (x, y), about 165 long at s = 1: a hank twisted once on itself, so it
    // hangs as two rings of wool, an eight, tied at the twist.
    function madeja(g, { x = 0, y = 0, s = 1, seed = 'm', color = '#a83a3c' } = {}) {
        const res = resOf(g, s);
        const sp = memo(`madeja${seed}${color}@${res}`, () => S.sheet({ x: -50, y: -14, w: 100, h: 196 }, res, (q) => {
            const r = rng('madeja' + seed), base = hex(color);
            // the two rings: centre, half-width, half-height, the band's thickness
            const rings = [[0, 36, 17, 38, 15], [1.5, 124, 24, 50, 19]];
            const strandsOf = (ring, i0) => {
                const [cx, cy, rx, ry, bw] = ring, out = [];
                for (let i = 0; i < 70; i++) {
                    const ph = r() * TAU, rate = 2.2 + r() * 0.8, pts = [], lit = [];
                    for (let k = 0; k <= 90; k++) {
                        const a = -Math.PI / 2 + (k / 90) * TAU; // from the top, round
                        // the strands spiral round the band: the hank's own twist
                        const u = Math.sin(ph + (k / 90) * TAU * rate);
                        const pinch = 1 - 0.55 * Math.pow(Math.max(0, Math.sin(a)), 8) * (i0 ? 0 : 1) - 0.5 * Math.pow(Math.max(0, -Math.sin(a)), 8) * (i0 ? 1 : 0);
                        const ex = rx * pinch + u * bw * 0.5, ey = ry + u * bw * 0.5 * 0.6;
                        const px = cx + Math.cos(a) * ex, py = cy + Math.sin(a) * ey;
                        pts.push([px + Math.sin(k * 0.9 + i) * 0.35 + S.noise2(k * 0.15, i, 3) * 1.4, py + S.noise2(k * 0.15, i, 4) * 1.2]);
                        // the band is round in section: lit where it faces the top left
                        const nx = Math.cos(a) * u, ny = Math.sin(a) * u, front = Math.sqrt(Math.max(0, 1 - u * u));
                        lit.push(S.clamp(0.42 + 0.5 * (nx * L2[0] + ny * L2[1]) + 0.35 * front * 0.8 - 0.2));
                    }
                    out.push({ pts, lit, d: r() < 0.07 ? 0.78 : 0.9 + r() * 0.2, w: 0.7 + r() * 0.7 });
                }
                return out;
            };
            const draw = (strands, under) => {
                for (const st of strands) {
                    for (let k = 1; k < st.pts.length; k++) {
                        const l = st.lit[k] * (under ? 0.75 : 1), c = mixRGB(mixRGB(base, [46, 12, 30], 0.62 * (1 - l)), [255, 196, 170], 0.36 * l * l);
                        q.lineWidth = st.w;
                        q.strokeStyle = css([c[0] * st.d, c[1] * st.d, c[2] * st.d], 0.9);
                        q.beginPath();
                        q.moveTo(st.pts[k - 1][0], st.pts[k - 1][1]);
                        q.lineTo(st.pts[k][0], st.pts[k][1]);
                        q.stroke();
                    }
                }
            };
            const low = strandsOf(rings[1], 1), high = strandsOf(rings[0], 0);
            draw(low, false);
            // the upper ring's shadow on the lower one, then the upper ring
            S.cast(q, (c) => {
                c.lineWidth = 15;
                c.strokeStyle = '#000';
                c.beginPath();
                c.ellipse(0, 36, 17, 38, 0, 0, TAU);
                c.stroke();
            }, { blur: 3, dx: 2, dy: 3, color: 'rgba(40,10,30,0.5)' });
            draw(high, false);
            // the tie round the twist, a pale thread wound three times
            const ty = 76;
            for (let k = 0; k < 4; k++) {
                lineP(q, [[-7, ty - 3 + k * 1.6], [0, ty - 2.2 + k * 1.6], [7, ty - 3 + k * 1.6]], 1.1, k % 2 ? '#efe2c0' : '#c4ae86');
            }
            lineP(q, [[5, ty + 3], [9, ty + 12], [7, ty + 18]], 0.8, '#d9c9a0');
            // flyaway fibres
            for (let k = 0; k < 110; k++) {
                const ring = rings[k % 2], a = r() * TAU, px = ring[0] + Math.cos(a) * (ring[2] + ring[4] * 0.5), py = ring[1] + Math.sin(a) * (ring[3] + ring[4] * 0.3);
                const b = a + (r() - 0.5) * 1.5, l = 2 + r() * 5;
                lineP(q, [[px, py], [px + Math.cos(b) * l, py + Math.sin(b) * l * 0.6]], 0.35, css(mixRGB(base, [255, 200, 180], 0.3), 0.6));
            }
        }));
        castSprite(g, sp, { x, y, s, dx: 14 * s, dy: 16 * s, blur: 5, alpha: 0.32, color: SHADOW });
        S.put(g, sp, { x, y, s });
        nail(g, x, y - 4 * s, 'nail', 77);
    }

    // ------------------------------------------------------------------ the azulejo dado
    // Tiles from y0 to y1 across x0 … x1 (skipping `gaps`: [[xa, xb], …], the openings).
    function dado(g, o) {
        const { x0, x1, y0, y1 } = o, t = o.tile ?? 34, r = rng('dado' + o.seed);
        const BLUE = '#3d5c94', GREEN = '#3c7660', HONEY = '#c99a42', MANG = '#4a3a42', WHITE = '#efe6d3';
        const inGap = (x) => (o.gaps ?? []).some(([a, b]) => x + t > a && x < b);
        const rows = Math.round((y1 - y0) / t);
        for (let j = 0; j < rows; j++) {
            const y = y0 + j * t, border = j === 0, skirt = j === rows - 1;
            for (let i = Math.floor(x0 / t); i * t < x1; i++) {
                const x = i * t;
                if (inGap(x)) continue;
                const k = S.hashI(i, j, 1, 5), swap = k < 0.012, crackT = k > 0.985, gone = k > 0.4 && k < 0.405;
                g.save();
                g.beginPath();
                g.rect(x + 0.8, y + 0.8, t - 1.6, t - 1.6);
                g.clip();
                if (gone) {
                    // a tile lost: the mortar bed with the trowel's combing
                    g.fillStyle = '#b9ab98';
                    g.fillRect(x, y, t, t);
                    for (let m = 0; m < 5; m++) lineP(g, [[x, y + 4 + m * 5], [x + t, y + 3 + m * 5]], 1, 'rgba(90,80,70,0.4)');
                    g.restore();
                    continue;
                }
                g.fillStyle = S.mix(WHITE, '#e2d8c0', r());
                g.fillRect(x, y, t, t);
                if (skirt) {
                    g.fillStyle = S.mix('#2b4a6e', '#384f5c', r());
                    g.fillRect(x, y, t, t);
                } else if (border) {
                    // a border of running honey loops on a white ground, blue edge
                    g.fillStyle = BLUE;
                    g.fillRect(x, y + t - 5, t, 5);
                    g.lineWidth = 3.4;
                    g.strokeStyle = HONEY;
                    g.beginPath();
                    g.arc(x + t / 2, y + t * 0.48, t * 0.3, 0, TAU);
                    g.stroke();
                    disc(g, x + t / 2, y + t * 0.48, 2.6, GREEN);
                } else if (swap) {
                    // a tile replaced with one of another pattern
                    g.fillStyle = '#d9c78c';
                    g.fillRect(x, y, t, t);
                    disc(g, x + t / 2, y + t / 2, t * 0.32, '#6d8fb4');
                } else {
                    // the star: each tile holds a quarter of an eight-pointed star at each corner
                    for (const [cx, cy] of [[x, y], [x + t, y], [x, y + t], [x + t, y + t]]) {
                        const star = [];
                        for (let m = 0; m < 16; m++) {
                            const a = (m / 16) * TAU, rr = m % 2 ? t * 0.3 : t * 0.5;
                            star.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]);
                        }
                        fillP(g, star, BLUE);
                        lineP(g, [...star, star[0]], 1.1, MANG);
                        disc(g, cx, cy, t * 0.16, HONEY);
                    }
                    // a green cross between the stars
                    const cr = [[x + t / 2, y + t * 0.2], [x + t * 0.62, y + t * 0.5], [x + t / 2, y + t * 0.8], [x + t * 0.38, y + t * 0.5]];
                    fillP(g, cr, GREEN);
                    lineP(g, [...cr, cr[0]], 1, MANG);
                }
                // the glaze: crazing, a gloss at the tile's own angle, a chipped corner
                g.lineWidth = 0.35;
                g.strokeStyle = 'rgba(80,70,60,0.3)';
                for (let m = 0; m < 3; m++) {
                    g.beginPath();
                    let px = x + r() * t, py = y + r() * t;
                    g.moveTo(px, py);
                    for (let n2 = 0; n2 < 4; n2++) g.lineTo((px += (r() - 0.5) * 10), (py += (r() - 0.5) * 10));
                    g.stroke();
                }
                const gx = x + t * (0.2 + r() * 0.5), gy = y + t * (0.15 + r() * 0.4);
                const gl = g.createRadialGradient(gx, gy, 0, gx, gy, t * 0.5);
                gl.addColorStop(0, `rgba(255,250,244,${0.3 + r() * 0.35})`);
                gl.addColorStop(1, 'rgba(255,250,244,0)');
                g.fillStyle = gl;
                g.fillRect(x, y, t, t);
                g.fillStyle = `rgba(60,50,80,${0.05 + r() * 0.12})`;
                g.fillRect(x, y, t, t);
                if (crackT) lineP(g, [[x, y + r() * t], [x + t * 0.4, y + t * 0.5], [x + t, y + r() * t]], 0.9, 'rgba(50,40,40,0.8)');
                if (r() < 0.08) {
                    const cx = x + (r() < 0.5 ? 0 : t), cy = y + (r() < 0.5 ? 0 : t);
                    disc(g, cx, cy, 2.5 + r() * 3, '#b46a4c');
                }
                g.restore();
            }
        }
        // grout lines, dirty; the top edge's shadow
        g.save();
        const segs = [];
        let sx = x0;
        for (const [a, b] of (o.gaps ?? []).slice().sort((p, q) => p[0] - q[0])) {
            segs.push([sx, Math.floor(a / t) * t]);
            sx = Math.ceil(b / t) * t;
        }
        segs.push([sx, x1]);
        for (let j = 0; j <= rows; j++) for (const [a, b] of segs) if (b > a) lineP(g, [[a, y0 + j * t], [b, y0 + j * t]], 1.5, 'rgba(150,136,120,0.9)');
        for (let i = Math.floor(x0 / t); i * t <= x1; i++) {
            if (inGap(i * t) && inGap(i * t - t)) continue;
            lineP(g, [[i * t, y0], [i * t, y0 + rows * t]], 1.5, 'rgba(150,136,120,0.9)');
        }
        g.restore();
        // lime splashed over the top row
        for (let k = 0; k < (x1 - x0) / 20; k++) {
            const x = x0 + r() * (x1 - x0);
            if (inGap(x)) continue;
            disc(g, x, y0 + r() * 10, 0.6 + r() * 1.8, 'rgba(250,246,238,0.85)');
        }
    }

    // ------------------------------------------------------------------ the pot
    // A terracotta pot painted blue, hung on the wall in an iron ring or standing.
    //   (x, y) the middle of its rim; at s = 1 the rim is 80 across and the pot 80 tall (a
    //   pot of 20 cm: 1 unit = 2.5 mm). tilt: how far it is seen from above (> 0) or below
    //   (< 0), about y / 1000 of where it hangs. color 'blue' | 'green' | 'white' | 'clay'.
    //   plant: 'geranium' | 'gitanilla' | 'cinta' | null, flower: 'red' | 'pink' | 'coral' |
    //   'white' | 'magenta'. ring: hung in an iron ring (and the water's run on the wall).
    //   off: how far it stands out from the wall (its shadow's throw).
    const POT = {
        blue: [[0, '#141c40'], [0.25, '#22305f'], [0.45, '#2f4682'], [0.62, '#3e5c9e'], [0.76, '#5878b6'], [0.9, '#8aa4d4'], [1, '#d0dcf0']],
        green: [[0, '#0f2a24'], [0.25, '#1d4438'], [0.45, '#2c6150'], [0.62, '#3d7a64'], [0.76, '#5c967c'], [0.9, '#92bea4'], [1, '#d4ead8']],
        white: [[0, '#4a4660'], [0.25, '#7a7690'], [0.45, '#a8a2b4'], [0.62, '#d0c8cc'], [0.76, '#e8e0dc'], [0.9, '#f6f0ea'], [1, '#fffcf6']],
        clay: [[0, '#3a1610'], [0.25, '#6a2c1c'], [0.45, '#94472c'], [0.62, '#b4603e'], [0.76, '#cc805a'], [0.9, '#e6aa84'], [1, '#f8d6bc']],
    };
    const CLAY = S.rampFn(POT.clay, 0.9);
    function potBody(q, o) {
        const t = o.tilt ?? 0, sg = t < 0 ? -1 : 1, at = Math.max(0.06, Math.abs(t)), sd = S.seedOf('pot' + o.seed), r = rng('potb' + o.seed);
        const RIM = 40, RB = 9, BOT = 74, RBASE = 27;
        const topY = (x) => sg * RIM * at * Math.sqrt(Math.max(0, 1 - (x * x) / (RIM * RIM)));
        const botY = (x) => BOT + sg * RBASE * at * Math.sqrt(Math.max(0, 1 - (x * x) / (RBASE * RBASE)));
        const hwAt = (yy) => (yy < RB ? RIM + 1.2 * Math.sin((Math.max(0, yy) / RB) * Math.PI) : yy < RB + 2.5 ? 37.5 : 37 - ((yy - RB) / (BOT - RB)) * 10);
        const out = [];
        for (let k = 0; k <= 24; k++) {
            const x = -RIM + (k / 24) * RIM * 2;
            out.push([x, topY(x)]);
        }
        for (const yy of [2, 4.5, 7, RB, RB + 1, RB + 2.5]) out.push([hwAt(yy), yy + (yy < RB ? 0 : 0)]);
        out.push([RBASE, BOT]);
        for (let k = 0; k <= 16; k++) {
            const x = RBASE - (k / 16) * RBASE * 2;
            out.push([x, botY(x)]);
        }
        for (const yy of [RB + 2.5, RB + 1, RB, 7, 4.5, 2]) out.push([-hwAt(yy), yy]);
        const pal = POT[o.color ?? 'blue'];
        const chips = o.chips ?? 0.5, rimChip = r() * 6;
        const sp = S.form({
            box: { x: -46, y: -RIM * at - 4, w: 92, h: BOT + RBASE * at + RIM * at + 10 }, res: o.res, seed: sd,
            mask: (g) => fillP(g, out, '#fff'),
            inflate: 'none',
            height: (x, y) => {
                const yy = y - topY(x), hw = hwAt(Math.max(0, yy));
                let h = hw * Math.sqrt(Math.max(0, 1 - (x / hw) * (x / hw)));
                if (yy < RB) h += 2.2 * Math.sin((Math.max(0, yy) / RB) * Math.PI);
                else if (yy < RB + 3) h -= 1.2;
                h += S.noise2(x * 0.15, y * 0.15, sd) * 0.4;
                return h;
            },
            ramp: pal, soft: 0.9,
            stroke: { amp: 0.06, freq: 0.08, tone: 6 }, mottle: { amp: 0.05, freq: 0.05 },
            spec: o.color === 'clay' ? null : { amp: 0.35, power: 14, from: 0.5, to: 0.95, ragged: 0.5, color: '#fff2ea' },
            markAmp: 0.35,
            marks: (g) => {
                // the brush that painted it: vertical strokes, thin over the rim's turn
                for (let k = 0; k < 40; k++) {
                    const x = -RIM + r() * RIM * 2, y0 = r() * BOT;
                    S.dab(g, [[x, y0], [x + (r() - 0.5) * 3, y0 + 10 + r() * 22]], { w: 3 + r() * 5, color: r() < 0.5 ? '#ffffff' : '#000000', alpha: 0.2, bristles: 4, dry: 0.5, seed: sd + k });
                }
            },
            tint: (x, y, tone, rgb) => {
                const yy = y - topY(x);
                // the paint chipped: lime white at the chip's lip, terracotta inside
                const nz = fbm(x / 9 + rimChip, y / 9, sd + 4) + (yy < RB + 1 ? 0.22 : 0) + (yy > BOT - 6 ? 0.18 : 0) - (1 - chips) * 0.5;
                if (nz > 0.32) {
                    const tmp = [0, 0, 0];
                    CLAY(S.clamp(tone - 0.04), tmp);
                    const k = S.smooth(0.32, 0.36, nz), inner = S.smooth(0.37, 0.42, nz);
                    toward(rgb, 244, 236, 226, k * (1 - inner) * 0.9);
                    toward(rgb, tmp[0], tmp[1], tmp[2], inner);
                }
                // a water stain darker under the rim, and earth at the foot
                const w = S.smooth(RB + 16 + 6 * S.noise2(x * 0.1, 1, sd), RB + 2, yy) * (yy > RB ? 0.22 : 0);
                rgb[0] *= 1 - w;
                rgb[1] *= 1 - w;
                rgb[2] *= 1 - w * 0.7;
                const e = S.smooth(BOT - 18, BOT, y) * 0.25;
                toward(rgb, 120, 96, 80, e);
            },
            over: (g) => {
                // lime splashed at the whitewashing
                for (let k = 0; k < 8; k++) {
                    if (r() < 0.3) continue;
                    const x = -RIM + r() * RIM * 2, y = r() * BOT * 0.9, rr = 0.6 + r() * 1.8;
                    disc(g, x, y, rr, 'rgba(250,246,240,0.9)');
                    if (r() < 0.5) disc(g, x + rr * 1.8, y + rr, rr * 0.45, 'rgba(250,246,240,0.85)');
                }
            },
        });
        // seen from above: the rim's top and the soil; from below: the unpainted base
        if (t > 0.02) {
            const rx = RIM, ry = RIM * at;
            oval(q, 0, 0, rx, ry, 0, S.rgb2hex(...(() => { const c = [0, 0, 0]; S.rampFn(pal, 0.9)(0.8, c); return c; })()));
            oval(q, 0, 0.6, rx - 5.5, Math.max(0.5, ry - 5.5 * at), 0, '#4a3628');
            const gr = q.createLinearGradient(0, -ry, 0, ry);
            gr.addColorStop(0, 'rgba(20,12,10,0.55)');
            gr.addColorStop(1, 'rgba(20,12,10,0)');
            q.fillStyle = gr;
            q.beginPath();
            q.ellipse(0, 0.6, rx - 5.5, Math.max(0.5, ry - 5.5 * at), 0, 0, TAU);
            q.fill();
            for (let k = 0; k < 30; k++) {
                const a = r() * TAU, d = Math.sqrt(r()) * 0.85;
                disc(q, Math.cos(a) * (rx - 6) * d, Math.sin(a) * (ry - 5 * at) * d, 0.6 + r() * 1.6, r() < 0.3 ? 'rgba(110,140,70,0.7)' : r() < 0.5 ? 'rgba(200,190,170,0.6)' : 'rgba(30,20,16,0.5)');
            }
        }
        S.put(q, sp);
        if (t < -0.02) {
            const ry = RBASE * at;
            const base = [];
            for (let k = 0; k <= 24; k++) base.push([Math.cos((k / 24) * TAU) * RBASE, BOT + Math.sin((k / 24) * TAU) * ry]);
            S.piece(q, base, { fill: '#a85e40', line: 0, shade: { color: '#3c1a1c', alpha: 0.5, w: 6 }, light: { color: '#f2b896', alpha: 0.3, w: 4 } });
            oval(q, 0, BOT, 4.5, Math.max(0.6, 4.5 * at), 0, '#2a1814');
            // the drip hanging from the drainage hole
            if (r() < 0.6) {
                oval(q, 1.5, BOT + ry + 2.2, 1.6, 2.2, 0, 'rgba(210,220,240,0.85)');
                disc(q, 1.1, BOT + ry + 1.6, 0.5, '#ffffff');
            }
        }
        return { out, topY, botY, RIM, BOT, RB, at, sg };
    }
    const toward = (rgb, r, g, b, k) => {
        rgb[0] += (r - rgb[0]) * k;
        rgb[1] += (g - rgb[1]) * k;
        rgb[2] += (b - rgb[2]) * k;
    };
    // The iron ring round the pot's neck: the part behind it first (back), then the front.
    function ring(q, G, front, seed) {
        const r = rng('ring' + seed), y = G.RB + 4, rx = 40.5, ry = Math.max(2.5, rx * G.at);
        const arc = [];
        for (let k = 0; k <= 32; k++) {
            const a = (k / 32) * Math.PI;
            arc.push([Math.cos(a) * rx, y + (front ? G.sg : -G.sg) * Math.sin(a) * ry]);
        }
        lineP(q, shift(arc, SD[0] * 2, SD[1] * 2), 3.4, 'rgba(30,20,40,0.35)');
        lineP(q, arc, 3.4, '#2a2228');
        lineP(q, shift(arc, -0.6, -0.9).slice(front ? 18 : 0, front ? 33 : 14), 1, 'rgba(176,160,160,0.75)');
        for (let k = 0; k < 6; k++) {
            const p = arc[Math.floor(r() * arc.length)];
            disc(q, p[0] + (r() - 0.5), p[1] + (r() - 0.5), 0.8 + r() * 1.2, r() < 0.6 ? 'rgba(160,80,40,0.8)' : 'rgba(110,50,30,0.8)');
        }
        if (front) {
            // the two ends of the ring, where they meet the bracket's stem, peeking out
            for (const sx of [-1, 1]) {
                disc(q, sx * rx, y, 2.4, '#2a2228');
                disc(q, sx * rx - 0.6, y - 0.7, 0.9, 'rgba(176,160,160,0.7)');
            }
        }
    }

    // ------------------------------------------------------------------ geranium leaves
    // A zonal geranium leaf: round, the margin crenate and ruffled, a sinus at the petiole,
    // veins from the petiole like a fan, velvety (no gloss), the dark zone in a ring.
    //   1 the zone (a horseshoe of maroon-brown); 2 the hairs: a velvet sheen at the turn;
    //   3 a yellowed old leaf going brown from its rim; 4 a young one, paler, cupped;
    //   5 a fallen one, brown and curled (on the floor); 6 a nibbled margin
    const GLEAF = [[0, '#14281a'], [0.22, '#203f22'], [0.42, '#30592c'], [0.6, '#48763a'], [0.76, '#68954c'], [0.9, '#9cbc72'], [1, '#d4e4a8']];
    const IVY = [[0, '#0e2216'], [0.22, '#183822'], [0.42, '#26552e'], [0.6, '#38723a'], [0.76, '#56924c'], [0.9, '#8ebc72'], [1, '#d6ecac']];
    const NL = 8, LSTEP = TAU / NL, lkey = (rot) => ((Math.round(rot / LSTEP) % NL) + NL) % NL;
    function gleaf(v, rot, res, kind = 'fresh') {
        const lk = lkey(rot);
        return memo(`gleaf${v}/${kind}/${lk}@${res}`, () => {
            const r = rng('gleaf' + v), sd = S.seedOf('gl' + v), R = 18, nl = 11 + Math.floor(r() * 5), ph = r() * 6;
            const rad = (a) => {
                // a = 0 points away from the petiole (up the blade), the sinus at a = π
                const da = Math.abs(((a - Math.PI) % TAU + TAU) % TAU - Math.PI); // 0 at the sinus... π opposite
                const sinus = 1 - 0.55 * Math.exp(-((da - Math.PI) * (da - Math.PI)) / 0.05);
                const cren = 1 + 0.07 * Math.pow(Math.abs(Math.sin(a * nl * 0.5 + ph)), 0.6);
                return R * sinus * cren * (1 + 0.05 * Math.sin(a * 2 + ph));
            };
            const pts = [];
            for (let k = 0; k < 120; k++) {
                const a = (k / 120) * TAU;
                pts.push([Math.sin(a) * rad(a), -Math.cos(a) * rad(a) + R * 0.15]);
            }
            const P0 = [0, R * 0.15 + R * 0.45 * 0.5]; // the petiole's point (near the sinus)
            const young = kind === 'young', old = kind === 'old';
            return S.form({
                box: { x: -R * 1.25, y: -R * 1.15, w: R * 2.5, h: R * 2.5 }, res, seed: sd, light: S.lightFor(lk * LSTEP),
                mask: (g) => fillP(g, pts, '#fff'),
                inflate: 'round', relief: young ? 0.32 : 0.16,
                height: (x, y) => {
                    const dx = x - P0[0], dy = y - P0[1], a = Math.atan2(dy, dx), d = Math.hypot(dx, dy);
                    // veins from the petiole: shallow grooves; a gentle wave at the margin
                    const vein = Math.pow(Math.abs(Math.cos(a * 4.5 + 0.3)), 24);
                    return -0.35 * vein * S.smooth(2, 8, d) + 0.45 * Math.sin(Math.atan2(y, x) * 7 + ph) * S.smooth(R * 0.7, R, d);
                },
                ramp: GLEAF, soft: 0.9,
                stroke: { amp: 0.05, freq: 0.1, tone: 6 }, mottle: { amp: 0.06, freq: 0.08 },
                spec: { amp: 0.12, power: 4, from: 0.45, to: 0.95, ragged: 0.6, color: '#e2ecd6' },
                edge: { rough: 0.9, freq: 0.5, amp: 0.5 },
                markAmp: 0.3,
                marks: (g) => {
                    // the veins as hairlines, the velvet as stipple
                    for (let k = 0; k < 9; k++) {
                        const a = -Math.PI / 2 + (k - 4) * 0.36;
                        lineP(g, [P0, [P0[0] + Math.cos(a) * R * 0.95, P0[1] + Math.sin(a) * R * 0.95]], 0.5, '#5a5a5a');
                    }
                    for (let k = 0; k < 70; k++) disc(g, (r() - 0.5) * R * 2, (r() - 0.5) * R * 2, 0.35 + r() * 0.45, r() < 0.5 ? '#ffffff' : '#000000');
                },
                tint: (x, y, tone, rgb) => {
                    const d = Math.hypot(x - P0[0] * 0.3, y - P0[1] * 0.4) / R;
                    // the zone: a ring of maroon-brown, broken towards the sinus
                    const z = S.smooth(0.34, 0.44, d) * S.smooth(0.72, 0.6, d) * (0.55 + 0.45 * S.noise2(x * 0.3, y * 0.3, sd)) * (young ? 0.3 : 0.75);
                    toward(rgb, rgb[0] * 0.8 + 18, rgb[1] * 0.55, rgb[2] * 0.5, z);
                    if (young) toward(rgb, rgb[0] * 1.05 + 20, rgb[1] * 1.08 + 18, rgb[2] * 0.8, 0.35);
                    if (old) {
                        toward(rgb, 200, 176, 80, 0.55 * S.smooth(0.2, 0.9, d + S.noise2(x * 0.2, y * 0.2, sd) * 0.3));
                        toward(rgb, 120, 70, 40, S.smooth(0.85, 1, d + S.noise2(x * 0.4, y * 0.4, sd + 1) * 0.2));
                    }
                },
            });
        });
    }
    // An ivy-leaved geranium's leaf: five pointed lobes, fleshy and glossy.
    function ileaf(v, rot, res) {
        const lk = lkey(rot);
        return memo(`ileaf${v}/${lk}@${res}`, () => {
            const r = rng('ileaf' + v), sd = S.seedOf('il' + v), R = 15, ph = r() * 0.3;
            const pts = [];
            for (let k = 0; k < 100; k++) {
                const a = (k / 100) * TAU;
                // five lobes, the middle one up, a sinus at the bottom
                const lobe = Math.pow(Math.abs(Math.cos((a - Math.PI) * 2.5 / 2 * 2 / 2 + ph)), 1.6);
                const da = Math.abs(((a - Math.PI) % TAU + TAU) % TAU - Math.PI);
                const rr = R * (0.78 + 0.26 * Math.pow(Math.abs(Math.cos(a * 2.5)), 5)) * (1 - 0.35 * Math.exp(-((da - Math.PI) * (da - Math.PI)) / 0.03));
                pts.push([Math.sin(a) * rr, -Math.cos(a) * rr + 3]);
                void lobe;
            }
            return S.form({
                box: { x: -R * 1.2, y: -R * 1.1, w: R * 2.4, h: R * 2.4 }, res, seed: sd, light: S.lightFor(lk * LSTEP),
                mask: (g) => fillP(g, pts, '#fff'),
                inflate: 'round', relief: 0.3,
                height: (x, y) => -0.5 * Math.pow(Math.abs(Math.cos(Math.atan2(y - 9, x) * 2.5)), 20) * S.smooth(1, 6, Math.hypot(x, y - 9)),
                ramp: IVY, soft: 0.88,
                stroke: { amp: 0.05, freq: 0.1, tone: 6 }, mottle: { amp: 0.05, freq: 0.08 },
                spec: { amp: 0.7, power: 22, from: 0.35, to: 0.85, ragged: 0.4, color: '#f2f8e8' },
                edge: { rough: 0.7, freq: 0.6, amp: 0.4 },
                tint: (x, y, tone, rgb) => {
                    // a thin purple-red rim on some
                    if (v % 3 === 0) {
                        const d = Math.hypot(x, y - 3) / R;
                        toward(rgb, 120, 40, 60, 0.0);
                        void d;
                    }
                },
            });
        });
    }
    const FLOWER = {
        red: [hex('#7c1a2c'), hex('#d23a3c'), hex('#fa8070')],
        pink: [hex('#9a3a5c'), hex('#e6789a'), hex('#ffc0cc')],
        coral: [hex('#a43a30'), hex('#ee7056'), hex('#ffbc9c')],
        white: [hex('#9c90b0'), hex('#ece4e4'), hex('#ffffff')],
        magenta: [hex('#6e1a4a'), hex('#c43c84'), hex('#f498c8')],
        lilac: [hex('#6a4a84'), hex('#b688c4'), hex('#ecd0f0')],
    };
    // One floret, seen at (x, y) facing `face` (0: towards the eye … 1: edge on), turned `a`.
    //   lit 0..1 where it sits on the umbel's dome; ivy: the upper petals feathered dark
    function floret(q, x, y, a, size, col, lit, face, r, ivy = false, spent = false) {
        const [dk, md, lt] = FLOWER[col];
        const sy = 1 - face * 0.6;
        q.save();
        q.translate(x, y);
        q.rotate(a);
        q.scale(1, sy);
        for (let k = 0; k < 5; k++) {
            const pa = (k / 5) * TAU + (r() - 0.5) * 0.3, upper = ivy && (k === 0 || k === 4);
            const len = size * (upper ? 1.05 : 0.95) * (0.9 + r() * 0.2), wd = size * (upper ? 0.48 : 0.62);
            const cx = Math.cos(pa) * len * 0.55, cy = Math.sin(pa) * len * 0.55;
            const l = S.clamp(lit + 0.25 * (Math.cos(pa) * L2[0] + Math.sin(pa) * L2[1]) * 0.5 + (r() - 0.5) * 0.15);
            const c = spent ? mixRGB(hex('#8a6a52'), hex('#c8a07c'), l) : l < 0.5 ? mixRGB(dk, md, l * 2) : mixRGB(md, lt, (l - 0.5) * 2 * 0.8);
            oval(q, cx, cy, len * 0.52, wd * 0.5, pa, css(c));
            oval(q, cx - Math.cos(pa) * len * 0.08, cy - Math.sin(pa) * len * 0.08, len * 0.3, wd * 0.28, pa, css(mixRGB(c, lt, 0.25), 0.55));
            // veins (feathering on an ivy's upper petals)
            q.lineWidth = Math.max(0.25, size * 0.06);
            q.strokeStyle = css(mixRGB(dk, [40, 10, 30], upper ? 0.5 : 0.1), upper ? 0.85 : 0.3);
            q.beginPath();
            for (const da of upper ? [-0.25, 0, 0.25] : [0]) {
                q.moveTo(Math.cos(pa) * size * 0.15, Math.sin(pa) * size * 0.15);
                q.lineTo(Math.cos(pa + da) * len * (upper ? 0.75 : 0.6), Math.sin(pa + da) * len * (upper ? 0.75 : 0.6));
            }
            q.stroke();
        }
        // the eye: pale, with the stamens' dots
        disc(q, 0, 0, size * 0.18, spent ? '#6a5a40' : css(mixRGB(md, [255, 250, 240], 0.55)));
        for (let k = 0; k < 4; k++) disc(q, Math.cos(k * 1.7 + 0.3) * size * 0.14, Math.sin(k * 1.7 + 0.3) * size * 0.14, size * 0.05, '#5a3a3a');
        q.restore();
    }
    // An umbel: florets on a dome, the far ones first, a few buds and spent ones among them.
    function umbel(q, x, y, rad, col, seed, o = {}) {
        const r = rng('umb' + seed), n = o.n ?? Math.round(14 + rad * 0.7);
        const fl = [];
        for (let i = 0; i < n; i++) {
            const a = r() * TAU, d = Math.sqrt(r()) * rad * 0.82;
            const fx = x + Math.cos(a) * d, fy = y + Math.sin(a) * d * 0.85 - rad * 0.08;
            const z = Math.sqrt(Math.max(0, 1 - (d / rad) ** 2));
            fl.push({ fx, fy, z, d, a, kind: r() < (o.buds ?? 0.12) ? 'bud' : r() < (o.spent ?? 0.08) ? 'spent' : 'open' });
        }
        fl.sort((p, q2) => p.z - q2.z);
        // the pedicels under them, from the umbel's hub
        q.lineWidth = 0.8;
        q.strokeStyle = 'rgba(70,96,46,0.9)';
        q.beginPath();
        for (const f of fl) {
            q.moveTo(x, y + rad * 0.6);
            q.lineTo(f.fx, f.fy);
        }
        q.stroke();
        for (const f of fl) {
            const lit = S.clamp(0.5 + 0.45 * (-(f.fx - x) * 0.6 - (f.fy - y) * 0.8) / rad + 0.15 * f.z);
            if (f.kind === 'bud') {
                // a closed bud: green, the colour showing at its tip, nodding
                const ba = Math.atan2(f.fy - y, f.fx - x) + 0.6;
                oval(q, f.fx, f.fy, 2.4 * (o.s ?? 1), 3.8 * (o.s ?? 1), ba, '#4c7a34');
                oval(q, f.fx + Math.cos(ba + 1.57) * 1.6, f.fy + Math.sin(ba + 1.57) * 1.6, 1.6 * (o.s ?? 1), 2.2 * (o.s ?? 1), ba, css(FLOWER[col][1]));
                continue;
            }
            floret(q, f.fx, f.fy, r() * TAU, (o.size ?? 6.6) * (0.85 + r() * 0.3), col, lit, (f.d / rad) * 0.7, r, o.ivy, f.kind === 'spent');
        }
    }
    // A stem drawn as a tapered tube with a lit side.
    function stem(q, pts, w0, w1, color = '#4f7432') {
        const c = hex(color);
        if (pts.length === 3) pts = S.curve(pts, false, 6);
        S.ink(q, shift(pts, SD[0] * 1.2, SD[1] * 1.2), { w: (w0 + w1) / 2 + 0.6, color: 'rgba(20,30,20,0.35)', taper: [0, 0.3] });
        S.ink(q, pts, { w: (w0 + w1) / 2, color: css(c), taper: [0, 0.4] });
        S.ink(q, shift(pts, L2[0] * (w0 * 0.22), L2[1] * (w0 * 0.22)), { w: Math.max(0.4, w1 * 0.4), color: css(mixRGB(c, [230, 240, 200], 0.45), 0.8), taper: [0.4, 0.8] });
    }

    // A zonal geranium standing in a pot whose rim is at (0, 0) of q: a mound of leaves, the
    // umbels on long stalks over it. part: 'back' (the leaves behind the rim) or 'front'.
    function geranium(q, o, part) {
        const r = rng('ger' + o.seed + part), res = o.res, col = o.flower ?? 'red', w = o.w ?? 1;
        const leaves = [];
        const n = part === 'back' ? 16 : 9;
        for (let i = 0; i < n; i++) {
            const a = (part === 'back' ? -Math.PI : 0) + r() * Math.PI, d = 0.35 + r() * 0.65;
            const x = Math.cos(a) * 64 * d * w, y = part === 'back' ? -14 - Math.abs(Math.sin(a)) * 70 * d - r() * 18 : -4 + r() * 18;
            const kind = r() < 0.08 ? 'old' : r() < 0.15 ? 'young' : 'fresh';
            leaves.push({ x: part === 'front' ? (r() - 0.5) * 100 * w : x, y, rot: (r() - 0.5) * 2.4 + (x > 0 ? 0.4 : -0.4), s: 0.8 + r() * 0.35, sy: 0.55 + r() * 0.45, v: Math.floor(r() * 9), kind });
        }
        leaves.sort((p, q2) => p.y - q2.y);
        // stems and petioles from the crown
        if (part === 'back') {
            for (let i = 0; i < 5; i++) stem(q, [[(r() - 0.5) * 16, 6], [(r() - 0.5) * 30, -20 - r() * 20], [(r() - 0.5) * 60 * w, -40 - r() * 40]], 4, 3, '#5a6e38');
            // the umbels on their long stalks, rising over the leaves; one still in bud, one spent
            const um = o.umbels ?? 3;
            for (let i = 0; i < um; i++) {
                const ux = (i - (um - 1) / 2) * 40 * w + (r() - 0.5) * 22, uy = -86 - r() * 46;
                stem(q, [[ux * 0.3, -30], [ux * 0.75 + (r() - 0.5) * 10, (uy - 30) * 0.6], [ux, uy + 14]], 2.6, 2, '#62803e');
                if (i === um - 1 && r() < 0.5) {
                    // a bud cluster nodding in its papery sheath
                    for (let k = 0; k < 7; k++) {
                        const ba = 0.9 + (r() - 0.5) * 1.8, bl = 8 + r() * 6;
                        stem(q, [[ux, uy + 10], [ux + Math.cos(ba) * bl * 0.6, uy + 10 + Math.sin(ba) * bl * 0.3], [ux + Math.cos(ba) * bl, uy + 10 + Math.sin(ba) * bl]], 1, 0.8, '#5e7a3a');
                        oval(q, ux + Math.cos(ba) * bl, uy + 13 + Math.sin(ba) * bl, 2.6, 4, ba - 1.4, '#557c36');
                        oval(q, ux + Math.cos(ba) * bl + 0.6, uy + 15 + Math.sin(ba) * bl, 1.6, 2, ba - 1.4, css(FLOWER[col][1]));
                    }
                    fillP(q, [[ux - 5, uy + 10], [ux + 5, uy + 10], [ux + 2, uy + 16], [ux - 3, uy + 15]], 'rgba(214,196,150,0.9)');
                } else {
                    umbel(q, ux, uy, 20 + r() * 7, col, o.seed + 'u' + i, { spent: i === 0 && r() < 0.4 ? 0.45 : 0.05 });
                }
            }
        }
        for (const l of leaves) {
            const sp = gleaf(l.v, l.rot, res, l.kind);
            // its petiole back to the crown
            if (part === 'back' && r() < 0.6) stem(q, [[l.x * 0.4, l.y * 0.4 - 8], [l.x * 0.8, l.y * 0.8], [l.x, l.y + 6 * l.s]], 1.8, 1.4, '#5e7a3a');
            castSprite(q, sp, { x: l.x, y: l.y, s: l.s, dx: 5, dy: 7, blur: 4, alpha: 0.4, color: '#14261a' });
            S.put(q, sp, { x: l.x, y: l.y, rot: l.rot, sx: l.s, sy: l.s * l.sy });
        }
    }
    // An ivy-leaved geranium (gitanilla): trailing stems over the rim and down, leaves
    // alternate, small umbels at the tips.
    function gitanilla(q, o, part) {
        const r = rng('git' + o.seed + part), res = o.res, col = o.flower ?? 'pink', w = o.w ?? 1;
        const n = part === 'back' ? 4 : (o.trail ?? 5);
        for (let i = 0; i < n; i++) {
            const sx = (r() - 0.5) * 60 * w, side = sx < 0 ? -1 : 1;
            const len = part === 'back' ? 60 + r() * 50 : (o.len ?? 140) * (0.5 + r() * 0.7);
            const pts = [[sx, -2]];
            let x = sx, y = -2, a = part === 'back' ? -Math.PI / 2 + side * (0.4 + r() * 0.6) : side * (0.4 + r() * 0.5), d = 0;
            while (d < len) {
                const st = 6;
                // trailing stems arch out then fall
                if (part !== 'back') a += (Math.PI / 2 - a) * 0.06 + (r() - 0.5) * 0.15;
                else a += (r() - 0.5) * 0.25;
                x += Math.cos(a) * st;
                y += Math.sin(a) * st;
                pts.push([x, y]);
                d += st;
            }
            stem(q, pts, 2.4, 1.6, '#5a7036');
            // leaves at every third point, on alternate sides, on short petioles
            for (let k = 3; k < pts.length - 1; k += 3) {
                const p = pts[k], q2 = pts[k + 1], ta = Math.atan2(q2[1] - p[1], q2[0] - p[0]), sdn = (k / 3) % 2 ? 1 : -1;
                const la = ta + sdn * (1.1 + r() * 0.5), lx = p[0] + Math.cos(la) * 9, ly = p[1] + Math.sin(la) * 9;
                stem(q, [p, [lx, ly]], 1.3, 1, '#5e7a3a');
                disc(q, p[0], p[1], 1.6, '#8a4a44'); // the node, reddish
                const rot = la + Math.PI / 2 + (r() - 0.5) * 0.6, sp = ileaf(Math.floor(r() * 7), rot, res);
                const sc = 0.75 + r() * 0.4;
                castSprite(q, sp, { x: lx, y: ly, s: sc, dx: 4, dy: 6, blur: 3.5, alpha: 0.38, color: '#14261a' });
                S.put(q, sp, { x: lx, y: ly, rot, sx: sc, sy: sc * (0.6 + r() * 0.4) });
            }
            // a small umbel at the tip, or partway along
            if (r() < 0.8) {
                const p = pts[pts.length - 1 - Math.floor(r() * 4)];
                stem(q, [p, [p[0] + (r() - 0.5) * 10, p[1] - 10 - r() * 8]], 1.2, 1, '#5e7a3a');
                umbel(q, p[0] + (r() - 0.5) * 10, p[1] - 16 - r() * 8, 13 + r() * 4, col, o.seed + part + i, { ivy: true, size: 7.2, n: 6 + Math.floor(r() * 4), buds: 0.2 });
            }
        }
    }
    // A spider plant (cinta): arching strap leaves with a cream stripe, runners with plantlets.
    function cinta(q, o, part) {
        const r = rng('cinta' + o.seed + part), n = part === 'back' ? 14 : 12;
        const strap = (x0, y0, a, len, wd, bend) => {
            const ctr = [];
            for (let k = 0; k <= 16; k++) {
                const u = k / 16, aa = a + bend * u;
                const prev = ctr.length ? ctr[ctr.length - 1] : [x0, y0];
                ctr.push(k ? [prev[0] + Math.cos(aa) * len / 16, prev[1] + Math.sin(aa) * len / 16 + u * u * len * 0.06] : [x0, y0]);
            }
            const L = [], R2 = [];
            for (let k = 0; k <= 16; k++) {
                const p = ctr[k], qq = ctr[Math.min(16, k + 1)], pp = ctr[Math.max(0, k - 1)], tx = qq[0] - pp[0], ty = qq[1] - pp[1], tl = Math.hypot(tx, ty) || 1;
                const hw = wd * 0.5 * (1 - Math.pow(k / 16, 2.2)) + 0.3;
                L.push([p[0] - (ty / tl) * hw, p[1] + (tx / tl) * hw]);
                R2.push([p[0] + (ty / tl) * hw, p[1] - (tx / tl) * hw]);
            }
            const face = S.clamp(0.5 + 0.5 * Math.sin(a + bend * 0.5) * -0.6);
            fillP(q, [...L, ...R2.reverse()], css(mixRGB(hex('#2c5a2a'), hex('#7caa4c'), face)));
            S.ink(q, ctr, { w: wd * 0.32, color: css(mixRGB(hex('#d8dcb0'), hex('#f6f2d8'), face), 0.92), taper: [0.2, 1] });
            S.ink(q, shift(ctr, L2[0] * wd * 0.3, L2[1] * wd * 0.3), { w: 0.6, color: 'rgba(240,250,220,0.5)', taper: [0.4, 1] });
            return ctr;
        };
        for (let i = 0; i < n; i++) {
            const side = r() < 0.5 ? -1 : 1, a = part === 'back' ? -Math.PI / 2 + side * (0.2 + r() * 1.1) : side * (0.1 + r() * 0.7);
            strap((r() - 0.5) * 20, -2, a, 50 + r() * 50, 6 + r() * 2, side * (0.6 + r() * 0.6) * (part === 'back' ? 1 : 0.6));
        }
        if (part === 'front') {
            // runners hanging with a plantlet at the end
            for (let i = 0; i < 3; i++) {
                const sx = (r() - 0.5) * 50, ex = sx * 1.6 + (r() - 0.5) * 30, ey = 40 + r() * 90;
                stem(q, [[sx, 0], [sx * 1.3, ey * 0.4], [ex, ey]], 1.5, 1.2, '#b8b088');
                for (let k = 0; k < 7; k++) strap(ex, ey, -Math.PI / 2 + (k - 3) * 0.45, 12 + r() * 10, 4, (k - 3) * 0.2);
            }
        }
    }

    // A pot with its plant, painted on its own sheet; its shadow thrown on the wall (or
    // floor) under it; if hung, the water's run down the wall below it.
    function pot(g, o) {
        const s = o.s ?? 1, res = resOf(g, s), x = o.x ?? 0, y = o.y ?? 0, r = rng('pot' + o.seed);
        const box = { x: -150, y: -210, w: 300, h: 460 };
        const O = { ...o, res };
        const sp = S.sheet(box, res, (q) => {
            const plant = o.plant === undefined ? 'geranium' : o.plant;
            const P2 = { geranium, gitanilla, cinta }[plant];
            if (P2) P2(q, O, 'back');
            if (o.ring) ring(q, { RB: 9, at: Math.max(0.06, Math.abs(o.tilt ?? 0)), sg: (o.tilt ?? 0) < 0 ? -1 : 1 }, false, o.seed);
            const G = potBody(q, { ...O, res });
            if (o.ring) ring(q, G, true, o.seed);
            if (P2) P2(q, O, 'front');
        });
        if (o.ring) {
            // the run of the water from its drainage hole, down the wall
            const len = 60 + r() * 140;
            S.dab(g, [[x, y + 74 * s], [x + (r() - 0.5) * 6 * s, y + (74 + len * 0.5) * s], [x + (r() - 0.5) * 10 * s, y + (74 + len) * s]], { w: (8 + r() * 6) * s, color: '#6e6c88', alpha: 0.14, bristles: 7, dry: 0.4, seed: S.seedOf(o.seed) + 1, taper: 0.7 });
            S.dab(g, [[x + 3 * s, y + 80 * s], [x + 3 * s, y + (80 + len * 0.8) * s]], { w: 1.4 * s, color: '#fffaf2', alpha: 0.4, bristles: 2, seed: S.seedOf(o.seed) + 2 });
        }
        const off = (o.off ?? 30) * s, th = throwOf(off / s);
        castSprite(g, sp, { x, y, s, dx: th[0] * s, dy: th[1] * s, blur: 6 + off * 0.12, alpha: o.shadowA ?? 0.38, color: SHADOW });
        S.put(g, sp, { x, y, s });
        return sp;
    }

    return { wallLife, frieze, plate, sunPatch, tray, key, skyline, dawn, tilePanel, stitchRose, stitchLeaf, well, chair, orangeTree, orange, cage, jasmine, lantern, tinaja, bench, fountain, can, peacock, ocellus, moon, column, pot, potBody, geranium, gitanilla, cinta, gleaf, ileaf, umbel, floret, stem, ceiling, wall, flake, crack, nail, archGeom, arch, voussoir, floor, sky, speck, eave, nest, madeja, dado, castSprite, place, softly, blob, memo, resOf, rng, P, SHADOW, L2, SD, throwOf, fbm, disc, oval, fillP, lineP, path, shift, mixRGB, css, canvas };
})();
