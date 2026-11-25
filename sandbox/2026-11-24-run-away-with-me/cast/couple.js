// The two of them, from their model sheets (generated and approved by the user: ref/), cut
// at the shoulders where a car's seat hides the rest. The sheets are flat colour on a clear
// ground; here they are darkened into the night and lit at their edges by the lamps above
// (warm) and the city ahead (cyan), so the drawing stays theirs and the light is the film's.
// Global: Couple.
const Couple = (() => {
    const DIR = 'sandbox/2026-11-24-run-away-with-me/';
    // which variant of each sheet (to be set to the user's pick)
    const PICK = { her: 'her-1', him: 'him-1' };
    // per sheet: the four figures' boxes [x0, x1, top, bottom] in sheet pixels (measured from
    // the alpha), the height they stand in metres
    const BOX = {
        'her-1': [[111, 468, 13, 1097], [614, 952, 12, 1098], [1098, 1364, 18, 1098], [1569, 1924, 13, 1095]],
        'her-2': [[140, 515, 12, 1088], [624, 968, 12, 1090], [1096, 1344, 16, 1089], [1534, 1904, 12, 1088]],
        'her-3': [[172, 517, 11, 1088], [615, 934, 13, 1094], [1092, 1340, 14, 1089], [1520, 1865, 14, 1090]],
        'him-1': [[148, 525, 24, 1116], [629, 986, 25, 1124], [1146, 1346, 24, 1118], [1506, 1886, 24, 1112]],
        'him-2': [[137, 514, 17, 1111], [609, 971, 18, 1123], [1126, 1330, 18, 1117], [1498, 1879, 18, 1107]],
        'him-3': [[122, 500, 16, 1108], [605, 958, 14, 1123], [1120, 1323, 19, 1113], [1525, 1903, 16, 1101]],
    };
    const HEIGHT = { her: 1.74, him: 1.83 };   // on the sheet: she in heels
    const SEATED = { her: 1.36, him: 1.42 };   // top of the head above the car's floor line (local y)
    const img = {};

    async function load() {
        for (const who of ['her', 'him']) {
            // the drawn manner: the sheet's views repainted by tools/neonize.py
            neon[who + '-back'] = await Neon.image(DIR + 'ref/neon/' + PICK[who] + '-back.png') ?? await Neon.image(DIR + 'private/neon/' + PICK[who] + '-back.png');
        }
        for (const who of ['her', 'him']) {
            const id = PICK[who];
            img[who] = (await Neon.image(DIR + 'ref/' + id + '.png')) ?? (await Neon.image(DIR + 'private/ref/' + id + '.png'));
        }
        return !!(img.her && img.him);
    }

    // one of them, from behind (view 3 of the sheet), cut `cut` metres down from the top of
    // the head, standing in the car at local (x, z); lights: { lamp, city, hue }
    function back(g, L, N, cam, pose, who, x, z, light, o = {}) {
        const src = img[who]; if (!src) return;
        const id = PICK[who], [X0, X1, TOP, bot] = BOX[id][o.view ?? 3];
        // the crop cut once out of the 2048 px sheet into its own small canvas
        const ck = who + (o.view ?? 3);
        if (!crops[ck]) { const c = document.createElement('canvas'); c.width = X1 - X0; c.height = bot - TOP; c.getContext('2d').drawImage(src, X0, TOP, c.width, c.height, 0, 0, c.width, c.height); crops[ck] = c; }
        const im = crops[ck], x0 = 0, x1 = X1 - X0, top = 0;
        const pxm = (bot - TOP) / HEIGHT[who], cut = o.cut ?? 0.62;
        const sw = x1 - x0, sh = cut * pxm;
        const headTop = Car.W(pose, [x, SEATED[who] + (o.lift ?? 0), z]);
        const p = cam.p(headTop); if (p[2] < 0.3) return;
        const s = cam.f / p[2];                       // logical px per metre at that depth
        const w = (sw / pxm) * s, h = cut * s;
        const sway = (o.sway ?? 0) * s;
        const box = [p[0] - w / 2 + sway, p[1], w, h];
        // the wind: hair streams back over a convertible at 90 km/h; the cut-out is drawn in rows
        // with a sideways ripple that grows towards the ends of the hair (her) or barely (him),
        // into its own canvas, which is then tinted and rimmed
        const k = cam.W ? (N.k ?? 1) : 1;
        const cw = Math.max(2, Math.ceil(w * k) + 24), ch = Math.max(2, Math.ceil(h * k) + 2);
        const cv = (buf[who] ??= document.createElement('canvas'));
        if (cv.width !== cw || cv.height !== ch) { cv.width = cw; cv.height = ch; }
        const G = cv.getContext('2d'); G.setTransform(1, 0, 0, 1, 0, 0); G.clearRect(0, 0, cw, ch);
        const amp = (o.wind ?? (who === 'her' ? 0.02 : 0.005)) * s * k, rows = 48, TT = o.T ?? 0;
        for (let i = 0; i < rows; i++) {
            const v = i / rows, dy = sh / rows;
            const off = amp * Math.pow(v, 1.3) * Math.sin(v * 6 - TT * 11 + (who === 'her' ? 0 : 2)) + amp * 0.35 * Math.sin(TT * 5.3 + v * 3);
            G.drawImage(im, x0, top + dy * i, sw, dy + 0.6, 12 + off, (ch * i) / rows, cw - 24, ch / rows + 0.6);
        }
        const bx = [box[0] - 12 / k, box[1], cw / k, ch / k];
        // into the night: violet over the whole figure, deeper as the lamp leaves
        N.tint(g, cv, 0, 0, cw, ch, bx, '#1a1040', 0.55 - (light.lamp ?? 0) * 0.25);
        // rims, thin and on the picture only (on the light layer they bloom into a sticker's
        // outline): the lamp from above (warm), the city ahead (cyan), on the upper half
        const warm = light.hue ? Neon.shift(Neon.PAL.sodium, light.hue) : Neon.hex('#ffb47a');
        const cyan = light.hue ? Neon.shift(Neon.PAL.cyan, light.hue) : Neon.hex(Neon.PAL.cyan);
        N.rim(g, null, cv, 0, 0, cw, ch * 0.55, [bx[0], bx[1], bx[2], bx[3] * 0.55], [
            { dx: 0, dy: -0.008 * s, col: warm, a: Math.min(0.9, 0.1 + (light.lamp ?? 0) * 0.8) },
            { dx: (who === 'her' ? 0.006 : -0.006) * s, dy: -0.006 * s, col: cyan, a: 0.45 * (light.city ?? 1) },
        ]);
    }
    const buf = {}, crops = {}, neon = {};

    // the drawn manner: the repainted cut-out (already in the reference's inks, with its ink
    // line), drawn in rows that sway with the wind, and loose strokes of light laid on the hair
    // and the shoulders, new on every drawing (d)
    function backDrawn(g, cam, pose, who, x, z, light, o = {}) {
        const im = neon[who + '-back']; if (!im) return;
        const M = 12;                                        // tools/neonize.py's margin round the figure
        const pxm = (im.height - 2 * M) / HEIGHT[who], cut = o.cut ?? 0.62, sh = cut * pxm + M, sw = im.width;
        const p = cam.p(Car.W(pose, [x, SEATED[who] + (o.lift ?? 0), z])); if (p[2] < 0.3) return;
        const s = cam.f / p[2], w = (sw / pxm) * s, h = (sh / pxm) * s, d = o.d ?? 0, TT = o.T ?? 0;
        const bx = p[0] - w / 2 + (o.sway ?? 0) * s, by = p[1] - (M / pxm) * s;
        // into its own buffer at output resolution: rows that sway with the wind (the hair only,
        // fading out before the shoulders, so the jacket keeps a clean edge), then the strokes
        // of light laid on with source-atop so they never leave the figure
        const k = Neon.last ? Neon.last.k : 1, pad = 16;
        const cw = Math.max(2, Math.ceil(w * k) + 2 * pad), ch = Math.max(2, Math.ceil(h * k) + 2);
        const cv = (dbuf[who] ??= document.createElement('canvas'));
        if (cv.width !== cw || cv.height !== ch) { cv.width = cw; cv.height = ch; }
        const G = cv.getContext('2d'); G.setTransform(1, 0, 0, 1, 0, 0); G.globalCompositeOperation = 'source-over'; G.globalAlpha = 1; G.clearRect(0, 0, cw, ch);
        const amp = (o.wind ?? (who === 'her' ? 0.016 : 0.004)) * s * k, rows = 72;
        for (let i = 0; i < rows; i++) {
            const v = i / rows, dy = sh / rows, wgt = v < 0.45 ? 1 : Math.max(0, 1 - (v - 0.45) / 0.3);
            const off = wgt * (amp * Math.pow(v + 0.1, 1.2) * Math.sin(v * 6 - TT * 11 + (who === 'her' ? 0 : 2)) + amp * 0.35 * Math.sin(TT * 5.3 + v * 3));
            G.drawImage(im, 0, dy * i, sw, dy + 0.6, pad + off, (ch * i) / rows, cw - 2 * pad, ch / rows + 0.6);
        }
        G.globalCompositeOperation = 'source-atop';
        G.setTransform(k, 0, 0, k, 0, 0);
        const Pp = Ink.PAL, seed = who === 'her' ? 4101 : 4202, W = cw / k, Hh = ch / k, pd = pad / k;
        if (who === 'her') {
            Ink.strokes(G, pd + (W - 2 * pd) * 0.15, Hh * 0.04, (W - 2 * pd) * 0.7, Hh * 0.5, { ang: Math.PI * 0.5 + 0.2, spread: 0.7, count: 14, len: Hh * 0.2, w: Math.max(1, s * 0.012), cols: [Pp.cyan, Pp.red, Pp.cyan, Pp.pink], seed, d });
        } else {
            Ink.strokes(G, pd + (W - 2 * pd) * 0.3, Hh * 0.03, (W - 2 * pd) * 0.4, Hh * 0.22, { ang: Math.PI * 0.5 + 0.3, spread: 0.8, count: 9, len: Hh * 0.1, w: Math.max(1, s * 0.011), cols: [Pp.cyan, Pp.violet, Pp.cyan], seed, d });
            Ink.hatch(G, [pd + (W - 2 * pd) * 0.12, Hh * 0.62], [pd + (W - 2 * pd) * 0.42, Hh * 0.5], { count: 4, len: Hh * 0.1, w: Math.max(1, s * 0.01), col: Pp.cyan, seed: seed + 9, d });
        }
        g.drawImage(cv, 0, 0, cw, ch, bx - pd, by, cw / k, ch / k);
    }
    const dbuf = {};

    return { load, back, backDrawn, PICK, img };
})();
