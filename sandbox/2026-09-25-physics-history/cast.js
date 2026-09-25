// The two portraits of physics-newton-faraday, drawn as riso separations (see kit.js).
// Both sit facing right, heads in near profile, so their right side (arm, hand) is the near
// one. Local units: the head's centre is (0, 0), a head is ≈ 170 tall with its hair.
// Faces are paper with a little warm screen; shading is shapes (a shadow side, the nose's
// shade, a cheek), features are navy brush lines. Hair is built from locks, each a filled
// brush stroke with a lit strand and a dark crease.
const Cast = (() => {
    const { put, line, smooth, poly, taper, ellipse, circle } = Ph;
    const SKIN = { 'yellow.s': 0.12, 'pink.s': 0.07 };
    const SKIN_SH = { 'yellow.s': 0.3, 'pink.s': 0.36, 'navy.s': 0.06 };
    const SKIN_DK = { 'yellow.s': 0.36, 'pink.s': 0.5, 'navy.s': 0.2 };
    const CHEEK = { 'pink.s': 0.3, 'yellow.s': 0.1 };
    const LINE = { 'pink.s': 0.55, 'navy.s': 0.4 };
    const INK = { navy: 1 };
    const COAT = { navy: 1, yellow: 1, 'pink.s': 0.55 };
    const COAT_LIT = { navy: 1, 'yellow.s': 0.55, 'pink.s': 0.4, 'blue.s': 0.3 };
    const COAT_DK = { navy: 1, yellow: 1, pink: 0.7 };
    const LINEN = { 'blue.s': 0.05, 'yellow.s': 0.05 };
    const LINEN_SH = { 'blue.s': 0.32, 'navy.s': 0.1 };

    // a lock of hair: a tapered filled stroke with a lit strand along it and a dark crease
    function lock(press, pts, w, base, lit, dark, o = {}) {
        line(press, pts, taper(w, o.a ?? 0.25, o.b ?? 0.35), base);
        const off = (d) => pts.map(([x, y], i) => {
            const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
            const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1;
            return [x - (dy / l) * d, y + (dx / l) * d];
        });
        line(press, off(-w * 0.18).slice(0, -1), taper(w * 0.22, 0.3, 0.3), lit);
        line(press, off(w * 0.3).slice(1), taper(w * 0.12, 0.3, 0.4), dark);
    }

    // a near-profile eye facing right: the lids meet at the front, the iris sits forward
    function eye(press, x, y, w, look, o = {}) {
        const h = w * 0.5;
        const shape = [[x - w / 2, y - h * 0.1], [x - w * 0.05, y - h * 0.55], [x + w / 2, y - h * 0.05], [x - w * 0.05, y + h * 0.4]];
        put(press, (g) => smooth(g, shape), { 'blue.s': 0.04 });
        press.save();
        press.clip((g) => smooth(g, shape));
        const px = x + w * 0.18 + look[0] * w * 0.08, py = y + look[1] * h * 0.22;
        put(press, circle(px, py, h * 0.52), o.iris ?? { navy: 1, 'pink.s': 0.35 });
        press.knockout(circle(px + h * 0.18, py - h * 0.2, h * 0.14));
        press.restore();
        // the upper lid, heavy, running past the corner; a crease above; a light lower lid
        line(press, [[x - w * 0.56, y - h * 0.05], [x - w * 0.05, y - h * 0.62], [x + w * 0.56, y - h * 0.02]], taper(w * 0.13, 0.25, 0.15), INK);
        line(press, [[x - w * 0.3, y - h * 0.95], [x + w * 0.1, y - h * 1.05], [x + w * 0.4, y - h * 0.7]], taper(w * 0.06), LINE);
        line(press, [[x - w * 0.35, y + h * 0.38], [x + w * 0.1, y + h * 0.42], [x + w * 0.45, y + h * 0.1]], taper(w * 0.06), LINE);
    }

    // seated under the table (in its shadow): the coat's skirts, the thigh reaching under the
    // table and the shin going down. legs: { thigh, shin } specs
    function seated(press, legs) {
        const fl = 452; // the floor, in local units
        put(press, (g) => smooth(g, [[-110, 280], [150, 280], [176, 380], [150, 420], [-100, 420], [-126, 360]]), COAT_DK);
        put(press, (g) => smooth(g, [[40, 330], [230, 322], [280, 340], [284, 392], [200, 404], [40, 412]]), legs.thigh);
        // shin down to the ankle, a calf's curve at the back
        put(press, (g) => smooth(g, [[232, 352], [284, 360], [282, 420], [272, fl - 26], [244, fl - 26], [232, 420], [226, 380]]), legs.shin);
        line(press, [[280, 376], [276, 420], [272, fl - 30]], taper(4), { 'navy.s': 0.6 });
        // the shoe: flat on the floor, toe forward, a buckle or laces
        put(press, (g) => smooth(g, [[236, fl - 30], [276, fl - 32], [300, fl - 20], [326, fl - 12], [328, fl], [236, fl]]), { navy: 1, yellow: 0.9, 'pink.s': 0.4 });
        line(press, [[244, fl - 6], [322, fl - 6]], 2.5, { 'yellow.s': 0.4, 'navy.s': 0.3 });
        if (legs.buckle) put(press, (g) => g.rect(270, fl - 30, 16, 11), { yellow: 1, 'pink.s': 0.25 });
    }

    // Newton (after Kneller's 1689 portrait): long wavy brown hair parted in the middle and
    // falling past the shoulders, clean-shaven, strong nose, full chin, heavy-lidded eyes,
    // dark coat, white neckcloth. o: { look: [x, y], arm: fn drawn over the body }
    function newton(press, o = {}) {
        const look = o.look ?? [1, 0.2];
        const HAIR = { 'pink.s': 0.5, yellow: 0.82, 'navy.s': 0.42 };
        const HAIR_LT = { 'pink.s': 0.28, yellow: 0.7, 'navy.s': 0.1 };
        const HAIR_DK = { 'pink.s': 0.6, yellow: 1, navy: 0.95 };
        if (!o.headOnly) seated(press, { thigh: { navy: 1, 'pink.s': 0.55, yellow: 0.85 }, shin: { 'blue.s': 0.42, 'navy.s': 0.4 }, buckle: true });
        // the back of the hair, behind the neck and shoulders
        put(press, (g) => smooth(g, [[-20, -96], [30, -90], [40, -40], [30, 40], [20, 130], [-40, 190], [-120, 186], [-128, 100], [-112, 0], [-90, -70]]), HAIR_DK);
        // coat: shoulders, chest, a lit front towards the candle on the right (o.headOnly: a
        // full-body rig draws the body itself, see figure.js)
        if (!o.headOnly) {
            put(press, (g) => smooth(g, [[-150, 158], [-112, 120], [-40, 108], [40, 104], [110, 118], [152, 172], [168, 300], [150, 380], [-120, 380], [-156, 300]]), COAT);
            put(press, (g) => smooth(g, [[30, 110], [105, 120], [148, 174], [162, 300], [150, 380], [80, 380], [52, 200]]), COAT_LIT);
            line(press, [[40, 118], [52, 200], [62, 380]], taper(5), COAT_DK);
            for (let i = 0; i < 5; i++) {
                put(press, circle(68 + i * 1.5, 146 + i * 38, 6), { yellow: 1, 'pink.s': 0.3, 'navy.s': 0.25 });
                press.knockout(circle(66 + i * 1.5, 144 + i * 38, 2));
            }
        }
        // neck
        put(press, (g) => smooth(g, [[-6, 46], [36, 50], [42, 104], [-10, 108]]), SKIN_SH);
        // neckcloth: a white band round the neck and two falling bands (the lawyer's tabs)
        put(press, (g) => smooth(g, [[-26, 92], [20, 82], [60, 94], [58, 118], [10, 114], [-28, 118]]), LINEN);
        put(press, (g) => poly(g, [[16, 108], [36, 108], [40, 176], [26, 182], [14, 172]]), LINEN);
        put(press, (g) => poly(g, [[36, 108], [54, 110], [56, 170], [42, 176]]), { 'blue.s': 0.16 });
        line(press, [[-20, 110], [20, 106], [56, 112]], taper(3), LINEN_SH);
        // face in near profile: brow ridge, a long nose with a rounded tip, firm mouth, full chin
        const face = [[-40, -72], [0, -86], [40, -80], [56, -60], [60, -40], [56, -27], [64, -10], [76, 6], [83, 15], [78, 22], [67, 24], [68, 32], [63, 38], [68, 45], [62, 53], [67, 65], [59, 80], [34, 90], [0, 86], [-30, 62], [-48, 24], [-52, -24]];
        put(press, (g) => smooth(g, face), SKIN);
        press.save();
        press.clip((g) => smooth(g, face));
        // the near side of the face, turned away from the light
        put(press, (g) => smooth(g, [[-70, -70], [-18, -60], [-4, -20], [-10, 20], [0, 56], [28, 96], [-80, 110]]), SKIN_SH, { knock: false });
        put(press, (g) => smooth(g, [[20, -34], [52, -30], [56, -14], [30, -10], [16, -20]]), { 'pink.s': 0.18, 'yellow.s': 0.12 }, { knock: false });
        put(press, (g) => smooth(g, [[52, -18], [62, -2], [70, 14], [62, 20], [52, 6]]), SKIN_SH, { knock: false });
        put(press, ellipse(36, 24, 18, 12), CHEEK, { knock: false });
        put(press, (g) => smooth(g, [[10, 70], [40, 76], [60, 72], [48, 94], [0, 96]]), SKIN_DK, { knock: false });
        press.restore();
        // features
        line(press, [[57, -26], [66, -8], [78, 8], [82, 15]], taper(4, 0.2, 0.2), LINE);
        line(press, [[66, 22], [60, 20], [58, 14]], taper(4.5), INK);
        line(press, [[50, 36], [58, 38], [64, 37]], taper(4.5, 0.4, 0.1), INK);
        line(press, [[58, 44], [64, 45]], taper(3), LINE);
        line(press, [[42, 60], [54, 58], [62, 54]], taper(3), LINE);
        line(press, [[26, 76], [44, 80], [58, 74]], taper(2.6), LINE);
        // brows: o.brow lifts them (surprise), o.shut closes the eye (a stunned squint)
        const bl = o.brow ?? 0;
        line(press, [[16, -30 - bl * 8], [34, -38 - bl * 12], [56, -34 - bl * 8]], taper(8, 0.2, 0.3), { navy: 1, 'pink.s': 0.4 });
        if (o.shut) line(press, [[28, -12], [42, -8], [56, -14]], taper(4.5), INK);
        else eye(press, 42, -14, 30, look);
        line(press, [[18, 2], [34, 8], [48, 6]], taper(2.6), { 'pink.s': 0.5, 'navy.s': 0.15 });
        // hair: a cap over the skull down to the hairline, then locks from the middle parting,
        // waves over the ear and falling to the chest
        put(press, (g) => smooth(g, [[-76, -40], [-66, -84], [-24, -106], [22, -104], [50, -88], [56, -70], [34, -74], [4, -78], [-26, -70], [-48, -46]]), HAIR);
        lock(press, [[16, -96], [-16, -94], [-48, -78], [-66, -46]], 34, HAIR, HAIR_LT, HAIR_DK, { a: 0.1 });
        lock(press, [[18, -94], [40, -88], [54, -72]], 18, HAIR, HAIR_LT, HAIR_DK, { a: 0.1, b: 0.5 });
        lock(press, [[-94, -40], [-110, 10], [-106, 70], [-120, 130], [-110, 176]], 34, HAIR, HAIR_LT, HAIR_DK);
        lock(press, [[-60, -60], [-84, -16], [-88, 40], [-78, 96], [-94, 150], [-86, 190]], 38, HAIR, HAIR_LT, HAIR_DK);
        lock(press, [[-28, -74], [-56, -40], [-60, 6], [-50, 50], [-64, 104], [-52, 160], [-62, 196]], 34, HAIR, HAIR_LT, HAIR_DK);
        lock(press, [[-18, -66], [-40, -30], [-40, 14], [-28, 58], [-40, 110], [-30, 150]], 24, HAIR, HAIR_LT, HAIR_DK, { b: 0.5 });
        // curl ends
        for (const [x, y, r] of [[-86, 190, 12], [-62, 196, 11], [-110, 176, 11], [-30, 150, 9]]) {
            line(press, Ph.sample([[x + r, y - r], [x + r * 0.2, y], [x - r * 0.8, y - r * 0.2], [x - r * 0.2, y - r * 0.9]], false, 5), taper(5), HAIR_DK);
        }
        o.arm?.(press);
    }

    // Faraday (after portraits of the 1830s–40s): thick wavy brown hair with a side parting,
    // a big wave over the brow and full over the ears, long sideburns, clean chin, high
    // forehead, straight nose, full lips; dark coat, white collar points, black stock.
    function faraday(press, o = {}) {
        const look = o.look ?? [1, 0.3];
        const HAIR = { 'pink.s': 0.55, yellow: 0.9, 'navy.s': 0.62 };
        const HAIR_LT = { 'pink.s': 0.35, yellow: 0.78, 'navy.s': 0.25 };
        const HAIR_DK = { 'pink.s': 0.5, yellow: 1, navy: 1 };
        seated(press, { thigh: { navy: 1, yellow: 0.9, 'blue.s': 0.35 }, shin: { navy: 1, yellow: 0.9, 'blue.s': 0.25 } });
        // coat and shoulders; lapels
        put(press, (g) => smooth(g, [[-150, 164], [-104, 118], [-30, 106], [50, 104], [120, 122], [164, 182], [178, 320], [160, 400], [-130, 400], [-160, 310]]), COAT);
        put(press, (g) => smooth(g, [[40, 108], [118, 126], [158, 184], [172, 320], [158, 400], [84, 400], [62, 210]]), COAT_LIT);
        put(press, (g) => poly(g, [[36, 112], [74, 122], [96, 196], [80, 250], [58, 200]]), COAT_DK);
        line(press, [[40, 116], [84, 196], [88, 300]], taper(4), { 'navy.s': 0.9, 'blue.s': 0.3 });
        // neck
        put(press, (g) => smooth(g, [[-8, 48], [32, 50], [40, 98], [-12, 102]]), SKIN_SH);
        // shirt front, the black stock wound round the neck and the collar points up to the jaw
        put(press, (g) => poly(g, [[6, 104], [42, 102], [60, 176], [30, 196]]), LINEN);
        line(press, [[30, 112], [38, 184]], taper(2.5), LINEN_SH);
        put(press, (g) => smooth(g, [[-28, 78], [20, 74], [54, 80], [58, 104], [4, 110], [-30, 106]]), { navy: 1, yellow: 0.85, 'pink.s': 0.35 });
        line(press, [[-20, 92], [22, 88], [52, 94]], taper(3), { 'blue.s': 0.5, 'navy.s': 0.2 });
        put(press, (g) => poly(g, [[28, 58], [56, 80], [44, 86], [20, 78]]), LINEN);
        put(press, (g) => poly(g, [[-6, 64], [16, 78], [4, 84], [-14, 76]]), LINEN_SH);
        // a longer face: high forehead, straight nose, full lips, a strong chin
        const face = [[-44, -60], [0, -76], [44, -72], [54, -52], [58, -38], [55, -28], [64, -12], [76, 6], [80, 13], [74, 19], [66, 20], [69, 29], [64, 35], [69, 42], [63, 50], [66, 60], [62, 76], [40, 86], [4, 84], [-26, 62], [-46, 24], [-52, -20]];
        put(press, (g) => smooth(g, face), SKIN);
        press.save();
        press.clip((g) => smooth(g, face));
        put(press, (g) => smooth(g, [[-70, -60], [-16, -52], [0, -20], [-8, 20], [4, 56], [28, 96], [-80, 110]]), SKIN_SH, { knock: false });
        put(press, (g) => smooth(g, [[18, -34], [50, -30], [54, -14], [28, -10], [14, -20]]), { 'pink.s': 0.18, 'yellow.s': 0.12 }, { knock: false });
        put(press, (g) => smooth(g, [[52, -20], [62, -4], [68, 12], [60, 18], [52, 4]]), SKIN_SH, { knock: false });
        put(press, ellipse(34, 22, 18, 13), CHEEK, { knock: false });
        press.restore();
        line(press, [[55, -28], [64, -12], [76, 6], [80, 13]], taper(4, 0.2, 0.2), LINE);
        line(press, [[64, 19], [58, 18], [56, 12]], taper(4.5), INK);
        line(press, [[50, 34], [58, 36], [65, 35]], taper(4.8, 0.4, 0.1), INK);
        put(press, (g) => smooth(g, [[56, 37], [68, 38], [66, 45], [58, 44]]), { 'pink.s': 0.45, 'yellow.s': 0.15 });
        line(press, [[46, 58], [58, 55], [64, 50]], taper(3), LINE);
        line(press, [[14, -30], [32, -36], [54, -32]], taper(7, 0.2, 0.3), { navy: 1, 'pink.s': 0.5 });
        eye(press, 40, -14, 29, look);
        line(press, [[16, 0], [32, 6], [46, 4]], taper(2.4), { 'pink.s': 0.5, 'navy.s': 0.15 });
        line(press, [[8, -54], [30, -58]], taper(2.4), { 'pink.s': 0.4 });
        // hair: side parting on the near side, a big wave rising over the brow, full over the
        // ear, short at the nape; long sideburns down to the jaw
        // the skull's cap, the full mass over the ear, and the sideburn
        put(press, (g) => smooth(g, [[-66, -40], [-58, -80], [-20, -98], [26, -98], [54, -86], [60, -68], [40, -64], [10, -68], [-20, -64], [-40, -44]]), HAIR);
        put(press, (g) => smooth(g, [[-40, -74], [-84, -62], [-104, -14], [-100, 36], [-80, 66], [-50, 62], [-36, 30], [-44, -20]]), HAIR);
        put(press, (g) => smooth(g, [[-44, 10], [-28, 14], [-20, 50], [-24, 64], [-40, 58]]), HAIR);
        lock(press, [[-24, -90], [10, -98], [40, -92], [60, -78], [62, -64]], 24, HAIR, HAIR_LT, HAIR_DK, { a: 0.1, b: 0.3 });
        lock(press, [[-44, -80], [-76, -56], [-90, -14], [-82, 26], [-90, 54]], 26, HAIR, HAIR_LT, HAIR_DK);
        lock(press, [[-40, -52], [-60, -24], [-58, 14], [-48, 40], [-58, 60]], 22, HAIR, HAIR_LT, HAIR_DK);
        lock(press, [[-70, -40], [-98, -6], [-94, 34], [-78, 62]], 18, HAIR, HAIR_LT, HAIR_DK);
        lock(press, [[-36, 16], [-28, 36], [-24, 58]], 12, HAIR, HAIR_LT, HAIR_DK, { a: 0.1, b: 0.5 });
        // strands combed back from the parting
        for (const [x0, y0, x1, y1] of [[-10, -94, -50, -70], [10, -94, -40, -58], [30, -88, -20, -60], [-30, -86, -70, -50]]) line(press, [[x0, y0], [(x0 + x1) / 2 - 4, (y0 + y1) / 2 - 6], [x1, y1]], taper(3), HAIR_DK);
        // the parting and the wave's curl over the brow
        line(press, [[-40, -90], [-24, -98], [-6, -104]], taper(3), HAIR_DK);
        line(press, Ph.sample([[62, -64], [54, -60], [50, -68], [56, -74]], false, 5), taper(4), HAIR_DK);
        for (const [x, y, r] of [[-80, 56, 11], [-50, 54, 10], [-86, 22, 10]]) {
            line(press, Ph.sample([[x + r, y - r], [x + r * 0.2, y], [x - r * 0.8, y - r * 0.2], [x - r * 0.2, y - r * 0.9]], false, 5), taper(4.5), HAIR_DK);
        }
        o.arm?.(press);
    }

    // a right hand seen from its thumb side, pinching (open 0..1 lets go): wrist at (0, 0),
    // fingers pointing +x, palm down. The thumb is behind what it holds (the caller draws
    // part 'thumb' first), the index in front ('front').
    function pinchHand(press, open, part) {
        const thumbTip = [60 - open * 6, 42 - open * 12], indexTip = [66 + open * 12, 40 - open * 10];
        if (part === 'thumb') {
            line(press, [[16, 14], [42, 28], thumbTip], taper(16, 0.1, 0.45), SKIN_SH);
            return;
        }
        // back of the hand with the knuckles' ridge, the curled fingers tucked under the palm
        put(press, (g) => smooth(g, [[-4, -14], [24, -20], [50, -14], [62, -2], [56, 16], [30, 24], [0, 18]]), SKIN);
        put(press, (g) => smooth(g, [[-4, 6], [26, 14], [52, 12], [56, 18], [30, 26], [0, 20]]), SKIN_SH, { knock: false });
        for (let i = 0; i < 3; i++) {
            const x = 34 + i * 8;
            put(press, (g) => smooth(g, [[x - 6, 12], [x + 4, 10], [x + 6, 24], [x - 2, 30], [x - 7, 22]]), i === 2 ? SKIN : SKIN_SH);
            line(press, [[x + 5, 14], [x + 4, 26]], taper(2), LINE);
        }
        // index finger in front, bent at two joints down to the tip
        line(press, [[40, -6], [60, 2], [70, 18], indexTip], taper(15, 0.05, 0.35), SKIN);
        line(press, [[52, 4], [66, 12], [70, 26], [indexTip[0] - 3, indexTip[1] + 1]], taper(2.4, 0.2, 0.3), LINE);
        line(press, [[60, 0], [64, 4]], taper(2), LINE);
        line(press, [[68, 18], [72, 20]], taper(2), LINE);
        put(press, ellipse(indexTip[0] + 2, indexTip[1] - 2, 3.5, 2.5), { 'pink.s': 0.4 });
        // knuckle creases and a vein on the back of the hand
        line(press, [[40, -14], [46, -10]], taper(2.4), LINE);
        line(press, [[28, -18], [32, -14]], taper(2), LINE);
        line(press, [[4, -8], [18, -10], [30, -6]], taper(1.8), { 'blue.s': 0.3, 'pink.s': 0.2 });
    }

    // a right fist round a bar pointing +x, seen from the near side: wrist at (0, 0), the bar
    // runs through y ∈ [-h/2, h/2]. The four fingers wrap the near face as stacked bands (the
    // index nearest the bar's front), the thumb lies along the top.
    function fist(press, h) {
        const top = -h * 0.72, bot = h * 0.78;
        // palm and heel behind the fingers
        put(press, (g) => smooth(g, [[-8, top + 6], [30, top - 6], [70, top], [84, -4], [78, bot - 6], [40, bot + 6], [-2, bot - 4], [-10, 0]]), SKIN_SH);
        // fingers: four bands, each with a rounded end curling under and a joint crease
        for (let i = 0; i < 4; i++) {
            const x = 24 + i * 14;
            put(press, (g) => smooth(g, [[x - 7, top + 8], [x + 7, top + 6], [x + 8, bot - 10], [x + 2, bot + 2], [x - 7, bot - 8]]), i % 2 ? SKIN : { 'yellow.s': 0.16, 'pink.s': 0.14 });
            line(press, [[x + 7, top + 12], [x + 8, bot - 8]], taper(2.2), LINE);
            line(press, [[x - 5, h * 0.12], [x + 5, h * 0.1]], taper(2), LINE);
        }
        // the thumb along the top of the bar, its nail at the tip
        line(press, [[0, top - 2], [34, top - 12], [74, top - 4]], taper(16, 0.1, 0.3), SKIN);
        line(press, [[14, top + 4], [44, top - 2], [70, top + 4]], taper(2.4), LINE);
        put(press, ellipse(72, top - 6, 5, 3.5), { 'pink.s': 0.3, 'yellow.s': 0.05 });
        line(press, [[40, top - 14], [44, top - 8]], taper(2), LINE);
    }

    return { SKIN, SKIN_SH, INK, COAT, COAT_LIT, LINEN, LINEN_SH, newton, faraday, pinchHand, fist, eye };
})();
