// Montage «what I love»: 13 cards (10–16 s) and the heart that gathers them (16–18 s).
// The objects live in things/*.js (one file each); this file choreographs the cards.
(() => {
    const P = Paper, E = Ease, C = WL.COL;
    // ------------------------------------------------------------------ the cards
    // [start, end, word, background, thing, thing x/y/scale, text colour, order]
    // order: 'over' = the flower is drawn over the object, 'under' = the object covers it
    const CARDS = [
        [10.0, 10.5, 'words', '#edc444', 'words', [500, 560, 1.3], null, 'over'],
        [10.5, 11.0, 'music', '#81ceb2', 'music', [460, 600, 1.35], null, 'over'],
        [11.0, 11.5, 'the sea', '#eaa4c8', 'sea', [500, 640, 1.55], null, 'under'],
        [11.5, 12.0, 'trees', '#94c5e5', 'tree', [502.3, 782.4, 1], null, 'over'],
        [12.0, 12.5, 'dogs', '#efda8b', 'dog', [661, 593, 0.602], null, 'over'],
        [12.5, 13.0, 'bread', '#85abdc', 'bread', [463, 601.9, 1], null, 'under'],
        [13.0, 13.5, 'rain', '#d7b585', 'rain', [509.3, 509.3, 1], null, 'over'],
        [13.5, 14.0, 'math', '#b89edb', 'math', [570, 520, 1.35], null, 'over'],
        [14.0, 15.0, 'the stars', '#171a45', 'stars', [490, 510, 1.58], '#f4e9c5', 'over'],
        [15.0, 15.25, 'octopus', '#318289', 'octopus', [620, 640, 1.35], '#f4e9c5', 'over'],
        [15.25, 15.5, 'tea', '#673c71', 'tea', [480, 660, 1.45], '#f4e9c5', 'under'],
        [15.5, 15.75, 'flowers', '#e798c7', 'flowers', [480, 660, 1.45], null, 'over'],
        [15.75, 16.0, 'cats', '#3f66b4', 'cat', [560, 760, 1.35], '#f4e9c5', 'over'],
    ];
    // The flower's performance on each card, one row per drawing (the reference animates on
    // twos: a new drawing every 1/12 s). Measured with `reference.mjs track` (ray reach, box)
    // and a face finder (eyes + mouth centroid): [face x, face y, ray reach, vertical stretch,
    // expression, face tilt?]. The pattern is a bounce: a big entry, squash, recover, stretch
    // up, settle.
    const FACE = {
        hg: ['happy', 'grin'], hs: ['happy', 'smile'], ho: ['happy', 'o'], cs: ['closed', 'smile'], co: ['closed', 'o'],
        oo: ['open', 'o'], os: ['open', 'smile'], qs: ['squint', 'smile'], sn: ['closed', 'grin'],
    };
    const STEPS = {
        words: [[499, 462, 181, 1.26, 'hg'], [498, 547, 150, 0.72, 'hs'], [497, 559, 145, 0.8, 'cs'], [492, 496, 165, 1.05, 'oo'], [502, 513, 160, 1.1, 'oo'], [502, 526, 158, 1.0, 'hg']],
        music: [[516, 321, 154, 1.35, 'hg'], [501, 403, 140, 0.82, 'hs'], [490, 394, 141, 0.83, 'os'], [493, 299, 140, 1.32, 'ho'], [492, 325, 142, 1.08, 'hg'], [493, 388, 140, 0.84, 'hs']],
        sea: [[525, 351, 142, 1.45, 'hg'], [525, 413, 130, 0.91, 'hs'], [535, 418, 125, 1.08, 'os'], [524, 384, 142, 1.19, 'hg'], [526, 396, 131, 1.13, 'hs'], [525, 403, 123, 1.2, 'hs']],
        tree: [[509, 260, 151, 1.27, 'hg'], [510, 251, 141, 0.73, 'hs'], [509, 256, 128, 0.92, 'cs'], [508, 238, 143, 1.14, 'oo'], [510, 242, 137, 0.97, 'hg'], [508, 248, 132, 1.0, 'hs']],
        dog: [[380, 225, 141, 1.24, 'hg'], [390, 258, 136, 0.74, 'oo'], [399, 259, 122, 0.93, 'os'], [396, 195, 128, 1.35, 'sn', -1.0], [387, 210, 127, 1.1, 'sn', -0.8], [392, 248, 130, 0.83, 'hs']],
        bread: [[435, 378, 147, 1.22, 'oo'], [425, 410, 135, 0.85, 'os'], [449, 415, 136, 0.86, 'os'], [439, 379, 131, 1.36, 'cs'], [438, 367, 132, 1.34, 'cs'], [438, 365, 132, 1.13, 'hg']],
        rain: [[513, 610, 137, 1.24, 'oo'], [506, 614, 123, 0.9, 'os'], [506, 614, 119, 0.83, 'qs'], [512, 601, 125, 1.2, 'hg'], [511, 611, 126, 0.94, 'hs'], [511, 606, 128, 0.93, 'hg']],
        math: [[185, 388, 180, 0.86, 'hg'], [200, 400, 165, 0.65, 'os'], [204, 400, 169, 0.6, 'qs'], [299, 688, 150, 1.0, 'oo', 0.9], [696, 624, 150, 1.0, 'qs', -0.6], [783, 369, 150, 1.0, 'hg']],
        stars: [[783, 215, 170, 0.9, 'hg'], [773, 209, 168, 0.88, 'hg'], [749, 199, 166, 0.9, 'hs'], [723, 188, 173, 0.84, 'hg'], [689, 176, 162, 0.9, 'hs'], [635, 168, 165, 0.88, 'hg'],
            [575, 170, 166, 0.87, 'hg'], [529, 178, 161, 0.92, 'hs'], [490, 193, 165, 0.9, 'hg'], [463, 204, 169, 0.94, 'hs'], [442, 215, 162, 0.92, 'hg'], [436, 218, 161, 0.92, 'hg']],
        octopus: [[286, 421, 194, 0.88, 'oo'], [282, 400, 195, 1.14, 'hs'], [281, 408, 190, 1.11, 'hs']],
        tea: [[497, 568, 187, 0.98, 'cs'], [499, 544, 191, 1.24, 'hs'], [499, 547, 181, 1.2, 'hs']],
        flowers: [[501, 433, 185, 0.89, 'co'], [499, 410, 190, 1.17, 'hs'], [500, 409, 191, 1.05, 'hs']],
        cat: [[556, 425, 178, 0.8, 'cs'], [556, 427, 176, 0.78, 'cs'], [556, 425, 178, 0.8, 'cs']],
    };
    // The entry burst: radial dashes on the first drawing of a card only.
    // [colour, centre x, centre y, inner radius, outer radius, count, width, arc from, arc to]
    const BURST = {
        words: ['#c8373a', 500, 480, 415, 500, 18, 8],
        music: ['#2b2530', 516, 321, 205, 242, 10, 5],
        sea: ['#3a62b0', 520, 470, 390, 450, 13, 6],
        tree: ['#efd35c', 509, 260, 195, 232, 8, 5],
        dog: ['#8a3a35', 600, 560, 415, 470, 14, 6],
        bread: ['#f7f3ea', 435, 378, 190, 232, 6, 5, -Math.PI + 0.1, -0.1],
        rain: ['#3d63b3', 500, 460, 425, 490, 14, 6],
        math: ['#2b2530', 185, 388, 188, 228, 9, 5],
        stars: ['#f0dc8a', 783, 215, 196, 226, 8, 4],
    };
    function burst(g, key) {
        const [col, cx, cy, r0, r1, n, w, a0 = -Math.PI, a1 = Math.PI] = BURST[key];
        const r = Motion.rng('burst' + key), full = a1 - a0 > 6;
        for (let i = 0; i < n; i++) {
            const a = a0 + ((i + (full ? 0.5 : 0)) / (full ? n : n - 1)) * (a1 - a0) + (r() - 0.5) * 0.18;
            const ra = r0 + (r() - 0.5) * 24, rb = r1 + (r() - 0.5) * 24;
            P.markerStroke(g, [[cx + Math.cos(a) * ra, cy + Math.sin(a) * ra], [cx + Math.cos(a) * rb, cy + Math.sin(a) * rb]], col, w, 'burst' + key + i, 0.95);
        }
    }
    // centre of the entry pop when the object's anchor is not its middle
    const POP = { tree: [502, 600] };
    // calibrated by tracking our own render the same way: our horizontal reach ≈ 0.92 R
    const REACH = 0.92;
    Shots['Montage'] = (g, t, env) => {
        const card = CARDS.find((c) => t >= c[0] && t < c[1]) ?? CARDS[CARDS.length - 1];
        const [t0, t1, word, bg, thing, [tx, ty, ts], ink, order] = card;
        const lt = t - t0, step = Math.min(STEPS[thing].length - 1, Math.floor(lt * 12 + 1e-6));
        const [fx, fy, reach, sy, expr, faceTilt = 0] = STEPS[thing][step];
        const [eyes, mouth] = FACE[expr];
        WL.flat(g, env, 'card-' + thing, bg);
        if (step === 0 && BURST[thing]) burst(g, thing);
        const flower = () => WL.flower(g, fx, fy, reach / REACH, {
            t, rot: (Motion.rng('rot' + thing + step)() - 0.5) * 0.6, sy, eyes, mouth, faceTilt, face: 1.55, rayW: 1.25, spread: 0.4,
        });
        // the object pops in: 7 % bigger on the card's first drawing (measured on dog and bread)
        const object = () => {
            g.save();
            if (step === 0) {
                const [px, py] = POP[thing] ?? [tx, ty];
                g.translate(px, py);
                g.scale(1.07, 1.07);
                g.translate(-px, -py);
            }
            Things[thing](g, tx, ty, ts, t);
            g.restore();
        };
        if (order === 'over') object();
        flower();
        if (order === 'under') object();
        // the word writes itself fast (a wipe): ~1.5 letters on the first drawing, whole by 0.16 s
        const p = t1 - t0 > 0.3 ? E.clamp(0.32 + lt * 4.2) : 1;
        WL.write(g, word, 500, 882, 92, ink ?? '#2b2530', { p, align: 'center', stroke: 0.012 });
    };

    // ------------------------------------------------------------------ the heart
    // Everything the flower loves gathers round a big paper heart (16–18 s). Traced on the
    // reference: a pink heart with a red copy behind it, offset down-right, that reads as the
    // paper's thickness; white highlight dashes on the first drawings; the miniatures pop in
    // one per drawing or two, in the reference's order; a blue '?' and a small red heart last.
    const sharp = (pts) => PaperDetail.spline(pts, 8);
    const HEART = sharp([[497, 292], [512, 262], [545, 225], [600, 190], [670, 170], [745, 166], [812, 182], [862, 225], [890, 290], [892, 360], [872, 435],
        [830, 510], [765, 585], [690, 660], [612, 738], [548, 800], [516, 832], [505, 850], [494, 832], [462, 795], [405, 728], [330, 655], [240, 578], [165, 498],
        [122, 420], [110, 340], [124, 258], [168, 196], [238, 158], [318, 146], [393, 160], [448, 194], [480, 232], [489, 262]]);
    const DASHES = [[[285, 207], [362, 204]], [[186, 290], [172, 362]], [[460, 258], [490, 305]], [[545, 250], [598, 215]], [[716, 210], [784, 250]], [[832, 368], [816, 444]],
        [[215, 490], [283, 560]], [[700, 565], [640, 630]], [[402, 667], [455, 720]], [[540, 725], [512, 770]], [[494, 786], [498, 802]]];
    // miniatures round the heart: [thing, x, y, scale, drawing it pops in on (1/12 s steps)]
    const AROUND = [
        ['words', 680, 150, 0.35, 0], ['music', 330, 150, 0.4, 2], ['sea', 810, 200, 0.3, 3], ['tree', 185, 256, 0.31, 5], ['dog', 880, 300, 0.15, 6],
        ['bread', 115.8, 312, 0.28, 8], ['math', 140, 440, 0.3, 10], ['stars', 770, 545, 0.18, 11], ['octopus', 220, 545, 0.3, 14], ['tea', 670, 640, 0.3, 15],
        ['flowers', 330, 640, 0.3, 17], ['cat', 570, 740, 0.3, 18], ['rain', 430.6, 757, 0.25, 20],
    ];
    // the flower's expression per drawing: surprised by the '?' at the end
    const heartFace = (d) => (d < 2 ? FACE.os : d === 21 || d === 22 ? FACE.oo : FACE.hs);
    // curly braces (math) on the heart's right edge: strips of graph paper
    function brace(c, pts, color, seed) {
        const strip = P.noodle(PaperDetail.spline(pts, 8, false), 23, 23);
        Things.kit.cut(c, strip, color, seed, {
            border: 2.4, inner: (cc, box) => {
                cc.strokeStyle = 'rgba(255,255,255,0.55)';
                cc.lineWidth = 1.2;
                for (let x = box.x; x < box.x + box.w; x += 8) (cc.beginPath(), cc.moveTo(x, box.y), cc.lineTo(x, box.y + box.h), cc.stroke());
                for (let y = box.y; y < box.y + box.h; y += 8) (cc.beginPath(), cc.moveTo(box.x, y), cc.lineTo(box.x + box.w, y), cc.stroke());
            },
        });
    }
    // the '?': a blue notebook-paper hook and dot over a salmon copy (its shadow)
    const Q_HOOK = [[438, 152], [446, 128], [470, 112], [500, 110], [522, 124], [528, 150], [517, 180], [496, 203], [482, 226], [478, 252]];
    function question(c, dx, dy, color, seed, lines) {
        const hook = P.noodle(PaperDetail.spline(Q_HOOK.map(([x, y]) => [x + dx, y + dy]), 8, false), 42, 36);
        const dot = P.ellipse(476 + dx, 306 + dy, 22, 22);
        const o = {
            border: 2.8, inner: lines ? (cc, box) => {
                cc.strokeStyle = 'rgba(255,255,255,0.6)';
                cc.lineWidth = 2;
                for (let y = box.y + 6; y < box.y + box.h; y += 20) (cc.beginPath(), cc.moveTo(box.x, y), cc.lineTo(box.x + box.w, y + 2), cc.stroke());
            } : null,
        };
        Things.kit.cut(c, hook, color, seed + 'h', o);
        Things.kit.cut(c, dot, color, seed + 'd', o);
    }
    Shots['Heart'] = (g, t, env) => {
        const d = Math.floor((t - 16) * 12 + 1e-6);
        // cream paper covered in handwriting
        WL.sprite('heart-bg3', { x: 0, y: 0, w: 1000, h: 1000 }, (c) => {
            c.fillStyle = '#efe6d2';
            c.fillRect(0, 0, 1000, 1000);
            PaperDetail.cursive(c, { x: 0, y: 0, w: 1000, h: 1000 }, '#c9ae8e', { seed: 'heartbg', lineH: 29.6, xh: 11.5, hw: 7, width: 1.5, alpha: 0.85, gap: 12 });
        }, 1.1).draw(g);
        WL.sprite('heart3', { x: 60, y: 90, w: 900, h: 830 }, (c) => {
            P.cutout(c, HEART.map(([x, y]) => [x + 26 + (x - 500) * 0.02, y + 20 + (y - 500) * 0.02]), '#cc4249', 'heartred2', { border: 2.2, shadow: 0.08, jag: 2.2, tex: { alpha: [0.35, 0.7] } });
            P.cutout(c, HEART, '#e688b0', 'heartpink2', { border: 3, shadow: 0.12, jag: 1.2, tex: { alpha: [0.35, 0.7], lVar: 5, angle: -0.04, len: [50, 140], h: [10, 22], density: 1.1 } });
        }, 1.2).draw(g);
        // highlight dashes while the heart lands
        if (d <= 2) DASHES.forEach((ab, i) => P.markerStroke(g, ab, '#f8e4ea', 5, 'hdash' + i, 0.92));
        // the flower: three drawings on a loop (0.25 s), growing a little as the heart fills up
        const cyc = d % 3, [ex, ey] = [[3, 2], [-2, 1], [-8, -5]][cyc];
        const reach = 185 + (t - 16) * 8, [eyes, mouth] = heartFace(d);
        WL.flower(g, 503 + ex, 505 + ey, reach / REACH, { t: 16 + cyc / 12, rot: [0, 0.1, -0.08][cyc], eyes, mouth, face: 1.15, rayW: 1.4, spread: 0.5 });
        for (const [thing, x, y, s, at] of AROUND) if (d >= at) Things[thing](g, x, y, s * (d === at ? 1.08 : 1), t);
        if (d >= 9) {
            WL.sprite('heart-braces', { x: 760, y: 340, w: 200, h: 210 }, (c) => {
                brace(c, [[838, 366], [812, 382], [806, 420], [800, 440], [786, 448], [800, 456], [806, 480], [812, 508], [838, 522]], '#e2887f', 'brace1');
                brace(c, [[880, 368], [902, 382], [908, 420], [912, 436], [931, 442], [912, 448], [908, 470], [902, 500], [880, 516]], '#5fbba8', 'brace2');
            }, 1.4).draw(g);
        }
        if (d >= 21) {
            WL.sprite('heart-q', { x: 380, y: 50, w: 220, h: 310 }, (c) => {
                question(c, 14, 14, C.flower, 'qshadow', false);
                question(c, 0, 0, '#3f64b3', 'qblue', true);
            }, 1.4).draw(g);
            WL.sprite('heart-small', { x: 400, y: 755, w: 190, h: 175 }, (c) => {
                const pts = HEART.map(([x, y]) => [492 + (x - 500) * 0.19, 840 + (y - 500) * 0.2]);
                Things.kit.cut(c, pts, '#c0333a', 'smallheart', { border: 2.6, inner: (cc, box) => WL.scribbleFill(cc, box, '#7e1d24', 'smallheartt', { lineH: 13, width: 1, scale: 0.6, alpha: 0.5 }) });
            }, 1.4).draw(g);
            // confetti dashes thrown out as they land
            for (const [ab, col] of [[[[545, 85], [537, 106]], C.flower], [[[586, 270], [610, 283]], C.flower], [[[578, 884], [570, 890]], C.flower], [[[462, 924], [456, 936]], C.flower], [[[548, 246], [584, 224]], '#f6d9e0']]) P.markerStroke(g, ab, col, 6, 'qpop' + ab[0][0], 0.9);
        }
    };
})();
