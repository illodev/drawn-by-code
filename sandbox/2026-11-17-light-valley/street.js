// The street on the night the light arrives: the set, cut once into the block, and the
// lights, carved and inked one by one. Authored in reference pixels (1280 × 720); every
// position is read off ref/street-lit.png (grid crops at 2–3×, the skyline from the sky's
// streak direction, the lit areas as connected components of its ochre, the cones row by
// row), and every region is carved to the tone measured there (tone.js, 16 px cells).
(() => {
    const W = Woodcut, R = Motion.rng;
    const lerp = (a, b, f) => a + (b - a) * f;
    const sstep = (a, b, x) => { const t = W.clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
    const poly = (pts) => (g) => { g.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]); g.closePath(); };
    const boxOf = (pts) => [Math.min(...pts.map((p) => p[0])), Math.min(...pts.map((p) => p[1])), Math.max(...pts.map((p) => p[0])), Math.max(...pts.map((p) => p[1]))];
    const fillPoly = (g, pts) => { g.beginPath(); poly(pts)(g); g.fill(); };
    const inPoly = (x, y, P) => { let c = false; for (let i = 0, j = P.length - 1; i < P.length; j = i++) if ((P[i][1] > y) !== (P[j][1] > y) && x < ((P[j][0] - P[i][0]) * (y - P[i][1])) / (P[j][1] - P[i][1]) + P[i][0]) c = !c; return c; };

    // --- the skyline (measured: the first y where the sky's horizontal streaks stop) ---
    const SKY = [[0, 138], [20, 150], [40, 166], [60, 176], [80, 172], [100, 150], [120, 166], [140, 176], [160, 186], [180, 200], [200, 190], [220, 200], [240, 214], [260, 222], [280, 214], [300, 203], [320, 208], [340, 202], [360, 196], [380, 192], [400, 175], [420, 167], [440, 168], [460, 163], [480, 152], [500, 152], [520, 150], [540, 138], [560, 117], [580, 116], [600, 104], [620, 98], [640, 98], [660, 106], [680, 114], [700, 126], [720, 108], [740, 102], [760, 104], [780, 105], [800, 108], [820, 110], [860, 112], [900, 108], [960, 100], [1000, 96]];
    const skyAt = (x) => {
        if (x <= SKY[0][0]) return SKY[0][1];
        for (let i = 1; i < SKY.length; i++) if (x <= SKY[i][0]) { const [a, b] = [SKY[i - 1], SKY[i]]; return lerp(a[1], b[1], (x - a[0]) / (b[0] - a[0])); }
        return SKY[SKY.length - 1][1];
    };

    // --- lights (measured ochre components; cones measured row by row) ------------------
    // lamps: hood centre, the cone's top half-width, its foot [y, left, right], its pole
    const LAMPS = [
        { id: 'L1', x: 441, y: 487, w: 5, foot: [513, 421, 463], pole: 454, d: 10 },
        { id: 'L2', x: 475, y: 472, w: 6, foot: [506, 455, 492], pole: 489, d: 13 },
        { id: 'L3', x: 526, y: 448, w: 6, foot: [497, 505, 546], pole: 546, d: 16 },
        { id: 'L4', x: 593, y: 419, w: 8, foot: [475, 567, 622], pole: 613, d: 19 },
        { id: 'L6', x: 900, y: 222, w: 21, foot: [372, 834, 948], pole: null, d: 30 },
    ];
    // windows [x, y, w, h, drawing it lights on]
    const WIN = [
        [141, 494, 16, 22, 20], [142, 470, 4, 11, 25], [175, 465, 5, 11, 17], [178, 492, 7, 9, 22], [191, 463, 8, 7, 28],
        [218, 497, 6, 8, 19], [241, 450, 7, 12, 24], [257, 489, 6, 13, 15], [291, 473, 13, 21, 21], [319, 448, 7, 8, 26],
        [319, 502, 8, 12, 18], [360, 343, 11, 27, 33], [360, 509, 7, 11, 23], [376, 469, 5, 18, 16], [376, 504, 8, 21, 27],
        [391, 467, 5, 19, 20], [393, 503, 6, 21, 14], [410, 493, 4, 14, 24], [421, 492, 4, 14, 18], [422, 520, 6, 17, 29],
        [434, 522, 6, 13, 22], [495, 518, 9, 20, 25], [516, 528, 7, 23, 17], [523, 502, 8, 9, 21], [572, 503, 9, 16, 27],
        [620, 462, 4, 9, 23], [636, 463, 8, 23, 19], [636, 517, 4, 20, 26], [689, 405, 11, 37, 22], [745, 443, 12, 34, 28],
        [780, 369, 13, 18, 25], [786, 442, 14, 46, 31], [856, 398, 13, 28, 34], [912, 413, 14, 30, 36], [945, 356, 8, 32, 33],
        [945, 399, 6, 33, 37], [979, 387, 16, 38, 35], [1066, 216, 24, 65, 38], [1162, 175, 28, 64, 40],
    ];
    // pools of light on the ground and lit walls [x, y, w, h, lamp]
    const POOLS = [[404, 549, 82, 18, 'L2'], [406, 560, 25, 7, 'L1'], [577, 556, 33, 13, 'L4'], [622, 559, 20, 5, 'L4'], [572, 503, 50, 15, 'L4'], [793, 599, 33, 13, 'L6'], [800, 625, 225, 58, 'L6'], [813, 594, 109, 26, 'L6'], [876, 672, 35, 10, 'L6'], [901, 613, 24, 5, 'L6'], [942, 470, 7, 158, 'door', 'rect'], [978, 560, 26, 34, 'door', 'rect']];
    const DOOR = { x: 1079, y: 362, w: 78, h: 230, d: 44 };
    const LITBOXES = [
        ...LAMPS.map((L) => [L.foot[1], L.y - 4, L.foot[2] - L.foot[1], L.foot[0] - L.y + 4]),
        ...WIN.map((w) => w.slice(0, 4)), ...POOLS.map((p) => p.slice(0, 4)), [DOOR.x, DOOR.y, DOOR.w, DOOR.h],
    ];

    // --- the measured tone ---------------------------------------------------------------
    // tone.js: the share carved white around (x, y). In the set, lit places are held at the
    // dark they have before their light comes on; the lights carve them up to it later.
    // K: the print's own greys (starved ink, soft edges) carry part of the measured tone, so
    // the cuts aim a little under it (calibrated: ours − reference over the frame)
    const FIT = 8, K = 0.89;
    const toneAt = (x, y, k = K) => {
        const M = globalThis.STREET_TONE, c = M.cell, fx = W.clamp(x / c - 0.5, 0, M.nx - 1.001), fy = W.clamp(y / c - 0.5, 0, M.ny - 1.001);
        const ix = Math.floor(fx), iy = Math.floor(fy), u = fx - ix, v = fy - iy, at = (i, j) => M.v[Math.min(M.ny - 1, j) * M.nx + Math.min(M.nx - 1, i)];
        return Math.max(0, k * ((at(ix, iy) * (1 - u) + at(ix + 1, iy) * u) * (1 - v) + (at(ix, iy + 1) * (1 - u) + at(ix + 1, iy + 1) * u) * v) + corrAt(x, y));
    };
    // the calibration (corr.js): per cell, what the cuts add to the measured tone so the
    // print carves what the reference carved (tools/correct.py, a render against the still)
    const corrAt = (x, y) => {
        const C = globalThis.STREET_CORR;
        if (!C) return 0;
        const i = Math.min(C.nx - 1, Math.max(0, Math.floor(x / C.cell))), j = Math.min(C.ny - 1, Math.max(0, Math.floor(y / C.cell)));
        return C.v[j * C.nx + i];
    };
    const inBox = (x, y, [bx, by, bw, bh], m = 3) => x > bx - m && x < bx + bw + m && y > by - m && y < by + bh + m;
    const litAt = (x, y) => LITBOXES.some((bx) => inBox(x, y, bx));
    const tone = (gain = 1, cap = 0.12) => (x, y) => { const t = toneAt(x, y) * gain; return litAt(x, y) ? Math.min(t, cap) : t; };

    // a region of the set: inked, then carved to its measured tone with marks running dir
    function region(b, pts, o) {
        b.ink((g) => fillPoly(g, pts));
        b.hatch({ box: boxOf(pts), clip: poly(pts), fit: FIT, tone: tone(o.gain ?? 1, o.cap), ...o });
    }
    // a lit shape: carved out whole, printed ochre, then inked back to its measured tone
    // (the black left standing in the light: rays, the grain of a wall, a hall's shadows)
    function lit(b, clip, box, o) {
        b.cut((g) => { g.beginPath(); clip(g); g.fill(); });
        if (o.ochre !== false) b.ochre((g) => { g.beginPath(); clip(g); g.fill(); });
        b.hatch({ ink: true, box, clip, fit: o.fit ?? 6, tone: o.inkTone ?? ((x, y) => W.clamp(1 - toneAt(x, y, 1) * (o.gain ?? 1))), sp: 3.2, len: [6, 22], gap: [3, 10], wMin: 0.9, wMax: 2.8, ...o });
    }

    // --- the set ---------------------------------------------------------------------------
    function sky(b) {
        const top = (g) => { g.moveTo(-10, -10); g.lineTo(1290, -10); for (let x = 1290; x >= -10; x -= 10) g.lineTo(x, skyAt(x)); g.closePath(); };
        b.hatch({ box: [0, 0, 1280, 230], clip: top, dir: 0, sp: 3.2, len: [14, 110], gap: [8, 50], wMin: 1.0, wMax: 5, seed: 'sky', fit: FIT, jitter: 0.5, tone: (x, y) => toneAt(x, y) * 1.02 });
        // the moon: carved round, two streaks of cloud left across it
        b.cut((g) => { g.beginPath(); g.ellipse(272, 100, 22.5, 21.5, 0, 0, 7); g.fill(); });
        b.ink((g) => { const r = R('moon'); W.gouge(g, 258, 113, 288, 112, 1.1, r, { asym: 1 }); });
    }

    function mountains(b) {
        // flicks run down each flank: '/' left of the peak (measured 134°), '\' right of it
        const far = [[230, 222], ...SKY.filter((p) => p[0] >= 240), [1010, 96], [1010, 560], [230, 560]];
        const farDir = (x, y) => lerp(2.32, 0.8, sstep(600, 660, x)) + 0.12 * (W.noise2('fd', x / 90, y / 90) - 0.5);
        region(b, far, { dir: farDir, sp: 4.2, len: [10, 40], gap: [6, 22], run: [1, 3], wMin: 1.2, wMax: 5, seed: 'far' });
        const left = [...SKY.filter((p) => p[0] <= 300), [330, 255], [380, 318], [430, 380], [470, 440], [470, 560], [-10, 560], [-10, 138]];
        region(b, left, { dir: (x, y) => 0.52 + 0.14 * (W.noise2('ld', x / 80, y / 80) - 0.5), sp: 3.8, len: [8, 26], gap: [6, 18], run: [1, 3], wMin: 1.1, wMax: 4, seed: 'left' });
        // the ridge lines catch the moon: a broken groove along each skyline
        b.cut((g) => {
            const r = R('ridge');
            for (let x = 0; x < 990; x += 14 + r() * 24) {
                const L = 8 + r() * 26, p = [[x, skyAt(x) + 2], [x + L, skyAt(x + L) + 2]];
                if (r() < 0.6) W.groove(g, p, 1.2 + r() * 1.4, r, { taper: 4 });
            }
        });
    }

    // a building: front wall (masonry carved to tone), roof (tiles along the slope), edges cut
    function building(b, o) {
        const r = R('bld' + o.id);
        b.ink((g) => { fillPoly(g, o.wall); if (o.roof) fillPoly(g, o.roof); });
        if (o.roof) b.hatch({ box: boxOf(o.roof), clip: poly(o.roof), dir: o.roofDir ?? 0, sp: o.tileSp ?? 3.6, len: [8, 22], gap: [4, 10], wMin: 1.1, wMax: 4, tone: tone(1.05), fit: 6, seed: 'roof' + o.id });
        b.cut((g) => { g.save(); g.beginPath(); poly(o.wall)(g); g.clip(); W.masonry(g, o.quad ?? [o.wall[0], o.wall[1], o.wall[2], o.wall[3]], { courses: o.courses ?? 8, stone: o.stone ?? [6, 16], w: o.cw ?? 1.3, tone: tone(o.gain ?? 1), seed: o.id }); g.restore(); });
        b.cut((g) => { for (const e of o.edges ?? []) W.groove(g, e, e.w ?? 1.8, r, { taper: 3 }); });
    }

    function village(b) {
        // what shows between the houses: walls and yards in short horizontal cuts
        region(b, [[100, 440], [690, 360], [690, 560], [100, 560]], { dir: 0.05, sp: 4.2, len: [6, 18], gap: [4, 12], wMin: 1.2, wMax: 4, seed: 'vback' });
        const B = [
            { id: 'v1', wall: [[108, 472], [168, 452], [168, 522], [108, 526]], roof: [[104, 474], [150, 452], [172, 446], [172, 454], [108, 476]], roofDir: -0.35, courses: 9, edges: [[[104, 473], [172, 448]], [[108, 474], [108, 524]]] },
            { id: 'v2', wall: [[168, 452], [232, 438], [232, 520], [168, 522]], roof: [[160, 456], [210, 428], [238, 422], [238, 440], [168, 458]], roofDir: -0.3, courses: 9, edges: [[[160, 455], [238, 430]]] },
            { id: 'v3', wall: [[205, 408], [224, 408], [224, 432], [205, 432]], roof: [[203, 409], [214, 398], [226, 409]], courses: 2, edges: [[[203, 409], [214, 397], [226, 409]]] },
            { id: 'ch', wall: [[256, 432], [348, 430], [348, 512], [256, 514]], roof: [[244, 436], [303, 403], [356, 430], [348, 436], [303, 414], [254, 440]], roofDir: 0, courses: 11, edges: [[[244, 436], [303, 403], [356, 430]], [[256, 438], [256, 512]]] },
            { id: 'v4', wall: [[200, 484], [292, 482], [292, 520], [200, 522]], roof: [[190, 486], [247, 460], [286, 478], [296, 486], [200, 490]], roofDir: -0.4, courses: 5, edges: [[[190, 486], [247, 460], [296, 486]]] },
            { id: 'v5', wall: [[386, 448], [440, 432], [440, 545], [386, 548]], roof: [[370, 454], [418, 426], [446, 422], [446, 434], [386, 452]], roofDir: -0.45, courses: 14, edges: [[[370, 453], [446, 425]]] },
            { id: 'v6', wall: [[440, 434], [520, 420], [520, 548], [440, 550]], roof: [[434, 438], [520, 412], [530, 416], [440, 444]], roofDir: -0.25, courses: 15, edges: [[[434, 437], [530, 413]]] },
            { id: 's1', wall: [[520, 422], [600, 400], [600, 556], [520, 556]], roof: [[512, 426], [580, 398], [606, 392], [606, 404], [520, 430]], roofDir: -0.3, courses: 17, edges: [[[512, 425], [606, 395]]] },
            { id: 's2', wall: [[600, 402], [672, 384], [672, 556], [600, 558]], roof: [[594, 406], [668, 378], [678, 382], [600, 412]], roofDir: -0.32, courses: 18, edges: [[[572, 436], [668, 380]], [[674, 384], [676, 545]]] },
        ];
        for (const o of B) building(b, o);
        // the tower: stone carved light, a belfry between two cornices, a ribbed dome, a cross
        b.ink((g) => { g.fillRect(346, 378, 39, 104); g.fillRect(331, 326, 58, 54); g.beginPath(); g.ellipse(360, 327, 25, 21, 0, Math.PI, 0); g.fill(); g.fillRect(357, 287, 5, 20); g.fillRect(352, 292, 15, 4); });
        b.cut((g) => {
            const r = R('tower');
            g.save(); g.beginPath(); g.rect(346, 380, 39, 100); g.clip();
            W.masonry(g, [[346, 381], [385, 381], [385, 480], [346, 480]], { courses: 14, stone: [7, 16], w: 1.6, tone: tone(1.1), seed: 'tower' });
            g.restore();
            g.save(); g.beginPath(); g.rect(332, 328, 56, 50); g.clip();
            W.masonry(g, [[332, 330], [388, 330], [388, 378], [332, 378]], { courses: 6, stone: [6, 14], w: 1.4, tone: tone(1.1, 0.5), seed: 'belfry' });
            g.restore();
            W.groove(g, [[329, 327], [391, 327]], 2.4, r, { taper: 2 }); W.groove(g, [[329, 379], [391, 379]], 2.4, r, { taper: 2 });
            W.groove(g, [[334, 329], [334, 377]], 1.8, r); W.groove(g, [[386, 329], [386, 377]], 1.8, r);
            W.groove(g, [[347, 381], [347, 480]], 2, r); W.groove(g, [[384, 381], [384, 480]], 1.6, r);
            // the dome: its rim, ribs converging on the top, a lit flank
            g.lineWidth = 1.8; g.beginPath(); g.ellipse(360, 327, 23, 19, 0, Math.PI * 1.04, Math.PI * 1.96); g.stroke();
            for (const a of [-0.75, -0.45, -0.15]) W.gouge(g, 360 + Math.cos(Math.PI + a * 0 + Math.PI * (0.5 + a)) * 0, 309, 360 + 22 * Math.sin(a * 1.6), 326, 1.5, r, { asym: 1 });
            for (let i = 0; i < 6; i++) W.gouge(g, 342 + i * 2.5, 322 - i * 1.2, 350 + i * 2.5, 314 - i * 0.8, 1.2, r);
            g.beginPath(); g.arc(365, 397, 3.2, 0, 7); g.fill();
            g.fillRect(363, 434, 4, 8);
            W.groove(g, [[359, 289], [359, 306]], 1.2, r);
        });
    }

    function bridgeAndRiver(b) {
        // the river: horizontal cuts carved to its measured tone (the moonlit middle most)
        const river = [[-10, 560], [130, 548], [400, 552], [480, 600], [470, 730], [-10, 730]];
        region(b, river, { dir: 0.02, sp: 3.6, len: [16, 100], gap: [8, 40], wMin: 1.1, wMax: 6, jitter: 0.6, seed: 'river' });
        // rocks: black masses, their moonlit tops carved
        const rocks = [
            [[316, 640], [330, 618], [360, 610], [396, 618], [414, 640], [404, 664], [360, 670], [320, 662]],
            [[280, 700], [300, 676], [340, 664], [374, 680], [384, 722], [282, 722]],
            [[396, 690], [430, 668], [470, 674], [486, 722], [398, 722]],
            [[92, 618], [112, 608], [134, 612], [140, 626], [102, 628]],
        ];
        for (const [i, p] of rocks.entries()) region(b, p, { dir: -0.5 + i * 0.25, sp: 4, len: [6, 18], gap: [4, 10], wMin: 1.2, wMax: 4, fit: 6, seed: 'rock' + i });
        // the left bank: a dark slope down to the water
        region(b, [[-10, 470], [60, 486], [120, 520], [150, 560], [120, 596], [40, 612], [-10, 610]], { dir: 0.55, sp: 5, len: [12, 34], gap: [8, 20], run: [1, 3], wMin: 1.4, wMax: 6, seed: 'bank' });
        // the bridge: a deck of stone, two arches over the water, a lit parapet line on top
        const deck = [[100, 520], [320, 520], [372, 532], [404, 550], [404, 584], [100, 584]];
        b.ink((g) => fillPoly(g, deck));
        b.cut((g) => W.masonry(g, [[100, 524], [404, 548], [404, 584], [100, 584]], { courses: 5, stone: [10, 24], w: 1.4, tone: tone(1), seed: 'deck' }));
        // under the arches: the river again, darker (in the bridge's shadow)
        const arch = (cx, rx) => (g) => { g.moveTo(cx - rx, 586); g.lineTo(cx - rx, 568); g.ellipse(cx, 568, rx, 27, 0, Math.PI, 0); g.lineTo(cx + rx, 586); g.closePath(); };
        for (const [cx, rx] of [[202, 32], [303, 31]]) {
            b.ink((g) => { g.beginPath(); arch(cx, rx)(g); g.fill(); });
            b.hatch({ box: [cx - rx, 540, cx + rx, 586], clip: arch(cx, rx), dir: 0, sp: 3.8, len: [10, 40], gap: [6, 20], wMin: 1.2, wMax: 5, fit: 6, tone: (x, y) => toneAt(x, y) * 1.1, seed: 'arch' + cx });
        }
        b.cut((g) => {
            const r = R('bridge');
            W.groove(g, [[98, 521], [320, 521], [372, 533], [406, 551]], 2.4, r, { taper: 6 });
            g.lineWidth = 1.8;
            for (const [cx, rx] of [[202, 32], [303, 31]]) { g.beginPath(); g.ellipse(cx, 568, rx + 2, 29, 0, Math.PI * 1.03, Math.PI * 1.97); g.stroke(); }
        });
    }

    function parapetAndStreet(b) {
        // the bank and parapet under the street: stone, rocks, the wall's top edge lit
        region(b, [[388, 556], [470, 566], [640, 590], [800, 720], [470, 726], [480, 600]], { dir: (x, y) => 1.45 + 0.1 * Math.sin(x / 40), sp: 5, len: [10, 30], gap: [6, 16], run: [1, 2], wMin: 1.4, wMax: 6, seed: 'parapet' });
        b.cut((g) => { const r = R('parapet'); W.groove(g, [[388, 556], [470, 566], [640, 590], [806, 724]], 2.4, r, { taper: 5 }); W.groove(g, [[392, 563], [470, 574], [636, 598]], 1.3, r); });
        // the street: cobbles cut across
        region(b, [[600, 560], [990, 560], [1290, 640], [1290, 730], [800, 730], [640, 592]], { dir: 0.14, sp: 3.6, len: [12, 50], gap: [6, 22], run: [1, 2], wMin: 1.1, wMax: 4.5, jitter: 0.6, seed: 'street' });
    }

    function streetHouses(b) {
        const B = [
            { id: 's3', wall: [[680, 386], [784, 328], [846, 350], [846, 562], [680, 560]], roof: [[662, 388], [784, 322], [846, 346], [846, 354], [784, 332], [680, 392]], roofDir: -0.5, courses: 26, quad: [[680, 330], [846, 330], [846, 562], [680, 562]], edges: [[[660, 389], [784, 323], [848, 347]], [[680, 390], [680, 556]]] },
            { id: 's4', wall: [[846, 360], [992, 300], [992, 590], [846, 580]], roof: [[836, 368], [988, 296], [1000, 300], [846, 374]], roofDir: -0.42, courses: 28, stone: [8, 20], quad: [[846, 300], [992, 300], [992, 590], [846, 590]], edges: [[[834, 369], [996, 297]]] },
        ];
        for (const o of B) building(b, o);
        b.ink((g) => g.fillRect(764, 318, 14, 18));
        b.cut((g) => {
            const r = R('s34');
            W.groove(g, [[764, 320], [778, 320]], 1.6, r); W.groove(g, [[766, 322], [766, 334]], 1.2, r);
            for (let i = 0; i < 4; i++) W.groove(g, [[652 + i * 2, 548 - i * 8], [684, 548 - i * 8]], 1.8, r, { taper: 2 });
        });
    }

    function bigHouse(b) {
        // the near house: the side wall in shade, lit quoins up the corner, the front wall, the
        // roof above the eave, a chimney, three steps under the door
        const side = [[976, 196], [1020, 176], [1020, 596], [976, 600]];
        const front = [[1020, 176], [1290, 84], [1290, 640], [1020, 596]];
        const roof = [[960, 205], [1020, 174], [1290, 82], [1290, -10], [1160, 40], [1010, 150], [980, 168]];
        b.ink((g) => { fillPoly(g, side); fillPoly(g, front); g.fillRect(1069, 105, 41, 42); });
        region(b, roof, { dir: -0.38, sp: 5.2, len: [14, 44], gap: [8, 20], run: [1, 2], wMin: 1.4, wMax: 6, seed: 'bigroof' });
        b.cut((g) => {
            const r = R('big');
            g.save(); g.beginPath(); poly(front)(g); g.clip();
            W.masonry(g, [[1020, 84], [1290, 84], [1290, 640], [1020, 640]], { courses: 34, stone: [14, 34], w: 2.4, tone: tone(1), seed: 'bigfront' });
            g.restore();
            g.save(); g.beginPath(); poly(side)(g); g.clip();
            W.masonry(g, [[976, 170], [1020, 170], [1020, 600], [976, 600]], { courses: 30, stone: [8, 18], w: 1.6, tone: tone(1), seed: 'bigside' });
            g.restore();
            W.groove(g, [[958, 206], [1022, 174], [1290, 82]], 2.6, r, { taper: 4 });
            W.groove(g, [[1070, 106], [1110, 106]], 1.8, r); W.groove(g, [[1072, 110], [1072, 145]], 1.4, r);
            for (let y = 115; y < 146; y += 9) W.gouge(g, 1078, y, 1104, y + 1, 1.4, r);
            for (const [y, x0, x1] of [[598, 978, 1168], [622, 984, 1180], [646, 990, 1200]]) {
                // each step: its tread lit along the front edge, its riser in stone below
                W.groove(g, [[x0, y], [x1, y + 4]], 3, r, { taper: 6 });
                W.masonry(g, [[x0, y + 3], [x1, y + 7], [x1, y + 22], [x0, y + 18]], { courses: 1, stone: [18, 46], w: 1.6, tone: () => 0.3, seed: 'riser' + y });
            }
        });
        // the door's opening: black until it is lit, its frame cut
        b.ink((g) => g.fillRect(DOOR.x, DOOR.y, DOOR.w, DOOR.h));
        b.cut((g) => { const r = R('door'); W.groove(g, [[DOOR.x - 4, DOOR.y + DOOR.h], [DOOR.x - 4, DOOR.y - 4], [DOOR.x + DOOR.w + 3, DOOR.y - 4], [DOOR.x + DOOR.w + 3, DOOR.y + DOOR.h]], 2.2, r, { taper: 3 }); });
    }

    // poles, arms, hoods, wires (the wiring the light came down)
    function catenary(a, b2, sag) { const pts = []; for (let i = 0; i <= 16; i++) { const f = i / 16; pts.push([lerp(a[0], b2[0], f), lerp(a[1], b2[1], f) + sag * 4 * f * (1 - f)]); } return pts; }
    const POLES = [[454, 452, 556, 5], [489, 424, 558, 6], [546, 394, 558, 7], [613, 350, 562, 8], [727, 258, 588, 11]];
    function poles(b) {
        b.ink((g) => {
            for (const [x, y0, y1, w] of POLES) { g.fillRect(x - w / 2, y0, w, y1 - y0); g.fillRect(x - w * 1.7, y0 + 6, w * 3.4, 3.4); }
            // the big pole by the near house, tapering, and its crossarms
            g.beginPath(); g.moveTo(940, 40); g.lineTo(960, 40); g.lineTo(957, 632); g.lineTo(942, 632); g.closePath(); g.fill();
            g.fillRect(924, 54, 56, 7); g.fillRect(928, 100, 48, 6);
        });
        b.cut((g) => {
            const r = R('poles');
            for (const [x, y0, y1, w] of POLES) { W.groove(g, [[x - w / 2 + 1.2, y0 + 2], [x - w / 2 + 1.2, y1]], Math.max(1.3, w * 0.32), r, { taper: 8 }); for (const dx of [-w * 1.5, w * 1.3]) g.fillRect(x + dx - 1.5, y0 + 1, 3, 5); }
            W.groove(g, [[944, 44], [946, 628]], 2.4, r, { taper: 10 });
            for (const [x, y] of [[929, 46], [973, 46], [933, 92], [969, 92]]) { g.beginPath(); g.ellipse(x, y + 3, 3.2, 5.5, 0, 0, 7); g.fill(); }
            // wires: two per span, sagging, cut as fine grooves
            const spans = [
                [[929, 50], [727, 262], 18], [[933, 96], [727, 300], 20], [[973, 50], [1290, -20], 14], [[969, 96], [1290, 30], 22], [[973, 50], [1290, 10], 18],
                [[722, 262], [613, 352], 10], [[724, 300], [613, 372], 12], [[611, 352], [546, 396], 7], [[611, 372], [546, 412], 8],
                [[544, 396], [489, 426], 5], [[544, 412], [489, 440], 6], [[487, 426], [454, 454], 4], [[487, 440], [454, 466], 4],
                [[1290, 100], [1150, 30], 6],
            ];
            for (const [a, c, s] of spans) W.groove(g, catenary(a, c, s), 1.7, r, { taper: 6, step: 3 });
        });
        // lamp arms and hoods: a black dome on a finial, its outline and rim cut; the street
        // lamps hang from a bar to their pole, the near one from a swan neck on the big pole
        b.ink((g) => {
            for (const L of LAMPS) {
                const hw = L.w * 1.15 + 4, hh = hw * 0.62;
                g.beginPath(); g.moveTo(L.x - hw, L.y + 2); g.quadraticCurveTo(L.x - hw * 0.7, L.y - hh * 0.2, L.x - hw * 0.35, L.y - hh * 0.75); g.quadraticCurveTo(L.x, L.y - hh * 1.05, L.x + hw * 0.35, L.y - hh * 0.75); g.quadraticCurveTo(L.x + hw * 0.7, L.y - hh * 0.2, L.x + hw, L.y + 2); g.closePath(); g.fill();
                g.fillRect(L.x - hw * 0.08 - 0.6, L.y - hh * 1.05 - hw * 0.35, hw * 0.16 + 1.2, hw * 0.35 + 1);
                if (L.pole) g.fillRect(L.x, L.y - hh - hw * 0.3, L.pole - L.x, Math.max(1.8, hw * 0.12));
            }
            g.lineWidth = 3.4; g.lineCap = 'round';
            g.beginPath(); g.moveTo(900, 196); g.bezierCurveTo(899, 184, 912, 182, 922, 188); g.lineTo(943, 189); g.stroke();
            g.lineWidth = 2.6; g.beginPath(); g.moveTo(943, 197); g.bezierCurveTo(930, 197, 924, 193, 922, 188); g.stroke();
        });
        b.cut((g) => {
            const r = R('hoods');
            for (const L of LAMPS) {
                const hw = L.w * 1.15 + 4, hh = hw * 0.62, ww = L.w > 15 ? 2 : 1.6;
                W.groove(g, [[L.x - hw + 1, L.y + 1], [L.x - hw * 0.62, L.y - hh * 0.42], [L.x - hw * 0.3, L.y - hh * 0.78], [L.x, L.y - hh * 0.96]], ww, r, { taper: 3 });
                W.groove(g, [[L.x - hw - 1, L.y + 2.5], [L.x + hw + 1, L.y + 2.5]], ww * 0.8, r, { taper: 2 });
            }
            W.groove(g, [[901, 192], [902, 185], [912, 183], [922, 186], [941, 186]], 1.2, r, { taper: 3 });
        });
        b.ochre((g) => { g.lineWidth = 2.4; g.beginPath(); g.moveTo(943, 197); g.bezierCurveTo(930, 197, 924, 193, 922, 188); g.stroke(); });
    }

    // --- the family in the doorway (black against the light) ------------------------------
    // read off a 4× crop: the man in the middle and the woman beside him look up at the
    // lamp, the child stands in front; the light behind them rims their backs and heads
    const MAN = [[1106, 430], [1108, 422], [1115, 416], [1124, 417], [1129, 423], [1131, 428], [1127, 434], [1124, 437], [1136, 449], [1138, 470], [1137, 520], [1131, 560], [1130, 590], [1120, 590], [1118, 560], [1112, 590], [1100, 590], [1099, 560], [1101, 500], [1103, 452], [1110, 438]];
    const WOMAN = [[1137, 441], [1138, 433], [1145, 427], [1151, 429], [1154, 436], [1152, 443], [1150, 448], [1156, 454], [1157, 490], [1158, 550], [1157, 590], [1132, 590], [1125, 575], [1129, 540], [1133, 500], [1134, 460], [1140, 449]];
    const CHILD = [[1078, 492], [1080, 486], [1085, 480], [1091, 482], [1094, 488], [1092, 494], [1090, 497], [1096, 502], [1098, 530], [1096, 560], [1095, 590], [1080, 590], [1078, 560], [1074, 530], [1076, 503], [1082, 497]];
    function figures(g) { for (const p of [MAN, WOMAN, CHILD]) fillPoly(g, p); }
    function rims(g, r) {
        // the rim runs up each back and over each head (the points on the light's side)
        W.groove(g, [[1100, 585], [1100, 520], [1102, 470], [1104, 452], [1109, 439], [1106, 430], [1109, 421], [1115, 416], [1123, 417]], 1.6, r, { taper: 6 });
        W.groove(g, [[1126, 585], [1128, 545], [1132, 505], [1134, 462], [1139, 450], [1137, 438], [1143, 428], [1150, 428]], 1.5, r, { taper: 6 });
        W.groove(g, [[1079, 585], [1076, 535], [1077, 505], [1081, 497], [1079, 489], [1084, 481], [1090, 481]], 1.3, r, { taper: 5 });
        // a fold or two in the coats, cut thin
        W.gouge(g, 1112, 470, 1110, 540, 1, r); W.gouge(g, 1146, 480, 1148, 560, 1, r); W.gouge(g, 1086, 520, 1085, 570, 0.9, r);
    }

    // --- the lights: what one light carves and inks at drawing k after it comes on ---------
    function lampOn(b, L, k) {
        const [fy, fl, fr] = L.foot, hw = L.w * 1.15 + 4, top = L.y + 2, p = W.clamp(k / 3), yb = lerp(top + 4, fy, p);
        // the bulb first (paper: the ochre rings it, never covers it), then the cone carved
        // down from the hood's rim over three drawings
        const bulb = (g) => { g.beginPath(); g.ellipse(L.x, L.y + 2, hw * 0.48, hw * 0.24 + 0.8, 0, 0, Math.PI); g.lineTo(L.x - hw * 0.48, L.y + 2); g.fill(); };
        b.cut(bulb);
        b.ochre((g) => { g.beginPath(); g.ellipse(L.x, L.y + 2, hw * 0.75, hw * 0.4, 0, 0, Math.PI * 2); g.fill(); g.globalCompositeOperation = 'destination-out'; bulb(g); });
        if (k < 1) return;
        const f = (yb - top) / (fy - top);
        const tw = L.w > 15 ? hw * 0.8 : hw * 0.45;
        const cone = (g) => { g.moveTo(L.x - tw, top); g.lineTo(L.x + tw, top); g.lineTo(lerp(L.x + tw, fr, f), yb); g.lineTo(lerp(L.x - tw, fl, f), yb); g.closePath(); };
        b.cut((g) => { g.beginPath(); cone(g); g.fill(); });
        b.ochre((g) => { g.beginPath(); cone(g); g.fill(); g.globalCompositeOperation = 'destination-out'; bulb(g); });
        // the black left in the light: short strokes running down and out from the bulb,
        // fewer near it; the cone's sides stay crisp (the gouge ran along a rule)
        b.hatch({
            ink: true, box: [fl - 2, top, fr + 2, yb], clip: cone, fit: 5, dir: (x, y) => Math.atan2(y - L.y, x - L.x), sp: L.w > 15 ? 3.4 : 2.4,
            len: L.w > 15 ? [5, 16] : [6, 18], gap: [5, 14], wMin: 0.9, wMax: L.w > 15 ? 2 : 1.2,
            tone: (x, y) => Math.min(0.4, W.clamp(1 - toneAt(x, y, 1) * 1.1)) * sstep(top + 4, top + 26, y), seed: 'cone' + L.id,
        });
        b.cut((g) => { const r = R('coneedge' + L.id); W.groove(g, [[L.x - tw, top], [lerp(L.x - tw, fl, f), yb]], 1.2, r, { taper: 4 }); W.groove(g, [[L.x + tw, top], [lerp(L.x + tw, fr, f), yb]], 1.2, r, { taper: 4 }); });
    }
    function windowOn(b, w, k) {
        const [x, y, ww, hh] = w;
        b.cut((g) => g.fillRect(x, y, ww * W.clamp((k + 1) / 2), hh));
        b.ochre((g) => g.fillRect(x - 1, y - 1, ww + 2, hh + 2));
        if (ww >= 7 && hh >= 14) b.ink((g) => { g.fillRect(x + ww / 2 - 0.8, y, 1.6, hh); g.fillRect(x, y + hh * 0.45, ww, 1.4); if (hh > 30) g.fillRect(x, y + hh * 0.72, ww, 1.3); });
    }
    function poolOn(b, P, k) {
        // the light on the ground: the ochre block prints under the street, and the key block
        // is carved to the measured tone there (more cobbles catch the light), growing in
        const [x, y, w, h] = P, p = W.clamp((k + 1) / 3), cx = x + w / 2, cy = y + h / 2;
        if (P[5] === 'rect') { lit(b, (g) => g.rect(x, y, w, h * p), [x, y, x + w, y + h], { dir: 1.57, sp: 2.8, len: [6, 26], gap: [3, 9], wMax: 2.4, seed: 'pool' + x }); return; }
        const shape = (g) => { const r = R('poolshape' + x); g.moveTo(cx + w / 2 * p, cy); for (let i = 1; i <= 20; i++) { const a = (i / 20) * Math.PI * 2, m = 0.8 + 0.35 * r(); g.lineTo(cx + Math.cos(a) * w / 2 * p * m, cy + Math.sin(a) * h / 2 * p * m); } g.closePath(); };
        b.ochre((g) => { g.beginPath(); shape(g); g.fill(); });
        b.hatch({ box: [x - 4, y - 4, x + w + 4, y + h + 4], clip: shape, dir: 0.14, sp: 3.4, len: [10, 46], gap: [5, 18], wMin: 1.1, wMax: 3.6, fit: 6, tone: (xx, yy) => toneAt(xx, yy, 1), seed: 'pool' + x });
    }

    function doorOn(b, k) {
        const p = W.clamp((k + 1) / 3), { x, y, w, h } = DOOR;
        b.cut((g) => g.fillRect(x, y, w * p, h));
        b.ochre((g) => g.fillRect(x - 3, y - 3, w + 6, h + 6));
        // the hall behind, inked back to its measured tone (the family is drawn on top)
        const inFam = (xx, yy) => [MAN, WOMAN, CHILD].some((P) => inPoly(xx, yy, P));
        b.hatch({ ink: true, box: [x, y, x + w * p, y + h], clip: (g) => g.rect(x, y, w * p, h), dir: 1.57, sp: 3.4, len: [8, 40], gap: [6, 20], wMin: 0.9, wMax: 2.6, fit: 6, tone: (xx, yy) => (inFam(xx, yy) ? 0 : W.clamp(1 - toneAt(xx, yy, 1))), seed: 'hall' });
        if (p < 1) return;
        b.ink(figures);
        b.cut((g) => rims(g, R('rim')));
        // the left jamb and the step catch the light
        b.cut((g) => { g.fillRect(x - 10, y - 6, 7, h + 6); g.fillRect(x - 12, y + h + 2, w + 26, 6); });
        b.ochre((g) => { g.fillRect(x - 12, y - 8, 10, h + 10); g.fillRect(x - 14, y + h, w + 30, 10); });
    }

    // --- the shot ----------------------------------------------------------------------------
    // d: the drawing (12 a second). Everything lit by drawing d is carved and inked.
    function draw(blk, d) {
        blk.begin();
        blk.base('street-set', (b) => {
            b.ink((g) => g.fillRect(-10, -10, 1300, 740));
            sky(b); mountains(b); village(b); bridgeAndRiver(b); parapetAndStreet(b); streetHouses(b); bigHouse(b); poles(b);
        });
        for (const w of WIN) if (d >= w[4]) windowOn(blk, w, d - w[4]);
        for (const P of POOLS) { const on = P[4] === 'door' ? DOOR.d + 1 : LAMPS.find((l) => l.id === P[4]).d + 2; if (d >= on) poolOn(blk, P, d - on); }
        for (const L of LAMPS) if (d >= L.d) lampOn(blk, L, d - L.d);
        if (d >= DOOR.d) doorOn(blk, d - DOOR.d);
    }

    globalThis.Street = { draw, LAMPS, WIN, POOLS, DOOR, skyAt };
})();
