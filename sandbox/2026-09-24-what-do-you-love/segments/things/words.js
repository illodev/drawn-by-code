// Montage object «words» (see ../things.js for the contract).
// An open book seen slightly from above — red cover, page block, a newspaper page and a
// handwritten page, each half its own pieces — and four cut-out letters (a b c e) that sit
// in front of it and then fly out of it in an arc. Measured on the reference (10.083–10.417 s)
// in logical units around the book's centre (500, 610): the card draws it at s = 1.
// part: undefined = everything, 'back' = the book, 'front' = letters and sparkles (the letters
// fly in front of the flower, the book stays behind it).
(() => {
    const P = Paper, D = PaperDetail;
    const { place, cut } = Things.kit;
    const O = [500, 610];
    const L = (pts) => pts.map(([x, y]) => [x - O[0], y - O[1]]);
    const COL = {
        cover: '#c83941', block: '#e4d8b9', news: '#ece9e1', newsInk: '#a7a39d', headline: '#838079', page: '#f4ecd7', hand: '#5c513f',
        a: '#d17160', b: '#f1d64a', c: '#3b62af', e: '#5f3a80', spark: '#f8e391',
    };
    const BORDER = { border: 3.4, shadow: 0.12 };

    // --- textures --------------------------------------------------------------------------
    // Newspaper columns as the reference prints them: rows of grey word-dashes, dark headline
    // bars, and a narrow margin column of dark blocks.
    function newsColumns(c, cols, y0, y1, o = {}) {
        const r = P.rng(o.seed ?? 'news'), lh = o.lineH ?? 9.26, dh = o.dashH ?? 3.2;
        for (const [x0, x1, heads = []] of cols) {
            c.fillStyle = COL.headline;
            c.globalAlpha = 0.95;
            for (const [a, b] of heads) c.fillRect(x0, a, x1 - x0, b - a);
            for (let y = y0; y < y1; y += lh) {
                if (heads.some(([a, b]) => y + dh > a - 2 && y < b + 2)) continue;
                let x = x0;
                const end = r() < 0.12 ? x0 + (x1 - x0) * (0.4 + r() * 0.4) : x1;
                while (x < end - 2) {
                    const w = Math.min(end - x, 5 + r() * 17);
                    c.fillStyle = r() < 0.2 ? '#9a968f' : COL.newsInk;
                    c.globalAlpha = 0.9;
                    c.fillRect(x, y, w, dh);
                    x += w + 3.2;
                }
            }
        }
        c.globalAlpha = 1;
    }
    // Handwriting: words of arches (n, m), tall loops (h, l) and dips below the line (y, g).
    function cursiveRow(c, x0, x1, y, seed, o = {}) {
        const r = P.rng(seed), h = o.h ?? 7.4, w = o.w ?? 5.4;
        c.strokeStyle = o.color ?? COL.hand;
        c.lineWidth = o.width ?? 1.3;
        c.lineCap = 'round';
        c.lineJoin = 'round';
        c.globalAlpha = o.alpha ?? 0.92;
        let x = x0 + r() * 5;
        const hump = (ww, hh) => {
            for (let k = 1; k <= 8; k++) {
                const u = k / 8;
                c.lineTo(x + u * ww, y - hh * Math.pow(Math.sin(Math.PI * u), 0.55));
            }
            x += ww;
        };
        const dip = (ww, hh) => {
            for (let k = 1; k <= 8; k++) {
                const u = k / 8;
                c.lineTo(x + u * ww, y + hh * Math.sin(Math.PI * u) - h * 0.9 * u * u);
            }
            x += ww;
            c.lineTo(x + ww * 0.2, y);
            x += ww * 0.2;
        };
        while (x < x1 - 8) {
            const n = 1 + Math.floor(r() * 5);
            c.beginPath();
            c.moveTo(x, y);
            for (let k = 0; k < n && x < x1 - 4; k++) {
                const kind = r();
                if (kind < 0.74) hump(w * (0.85 + r() * 0.3), h * (0.85 + r() * 0.3));
                else if (kind < 0.9) hump(w * 0.8, h * (1.7 + r() * 0.5));
                else dip(w * 0.8, h * 1.1);
            }
            c.stroke();
            x += 7 + r() * 6;
        }
        c.globalAlpha = 1;
    }

    // --- the book ----------------------------------------------------------------------------
    function book(c) {
        const o = { ...BORDER, tex: { alpha: [0.12, 0.3] } };
        // covers: two halves meeting at the spine (the right one's edge shows at the spine)
        cut(c, L([[208, 477], [260, 476], [330, 478], [420, 482], [500, 488], [500, 620], [500, 766], [420, 758], [330, 749], [262, 743], [212, 738], [210, 660], [209, 560]]), COL.cover, 'wbcoverL', o);
        cut(c, L([[500, 488], [580, 482], [670, 478], [740, 476], [792, 477], [791, 560], [789, 660], [786, 742], [720, 748], [640, 755], [570, 762], [500, 768], [500, 620]]), COL.cover, 'wbcoverR', o);
        // page blocks (the edges of the other pages)
        cut(c, L([[221, 474.5], [300, 471], [400, 472], [500, 478], [500, 741], [420, 735], [330, 728], [222, 720], [221, 600]]), COL.block, 'wbblockL', { ...o, border: 2.8 });
        cut(c, L([[500, 478], [600, 472], [700, 470], [779, 477], [779, 600], [778, 718], [700, 725], [600, 733], [500, 741]]), COL.block, 'wbblockR', { ...o, border: 2.8 });
        // left page: newspaper
        cut(c, L([[226.4, 465.7], [300, 464], [360, 463], [430, 466], [500, 472], [500, 600], [500, 727], [430, 720], [360, 714], [290, 708], [228, 702.5], [227, 580]]), COL.news, 'wbnews', {
            ...o, border: 2.8, tex: { alpha: [0.06, 0.16] }, inner: (cc) => {
                cc.save();
                cc.translate(-O[0], -O[1]);
                // margin column: dark blocks and stubs
                newsColumns(cc, [[230.3, 241.9, [[485, 499], [568.3, 582.2], [651.6, 665.5]]]], 469.4, 730, { seed: 'wbmargin' });
                newsColumns(cc, [[250.5, 325.2, [[495.4, 509.3], [588, 601.9]]], [334.5, 408.6], [417.8, 493]], 469.4, 730, { seed: 'wbcols' });
                // the fold of the top sheet, and the gutter's shadow
                D.crease(cc, [240.7, 474.5], [361, 467.6], { width: 0.9, dark: 'rgba(90,86,80,0.55)', light: 'rgba(255,255,255,0.4)' });
                cc.strokeStyle = 'rgba(80,78,74,0.75)';
                cc.lineWidth = 1.6;
                cc.beginPath();
                cc.moveTo(498.5, 474);
                cc.lineTo(498.5, 728);
                cc.stroke();
                cc.restore();
            },
        });
        // right page: handwriting
        cut(c, L([[500, 472], [570, 465], [662, 461.8], [775.5, 460.2], [774.5, 580], [773, 702.5], [700, 709], [640, 716], [570, 724], [502, 732], [501, 600]]), COL.page, 'wbpage', {
            ...o, border: 2.8, tex: { alpha: [0.06, 0.16] }, inner: (cc) => {
                cc.save();
                cc.translate(-O[0], -O[1]);
                for (let k = 0; k < 10; k++) cursiveRow(cc, 511, 770, 500 + k * 24.3, 'wbhand' + k);
                cc.restore();
            },
        });
    }

    // --- the letters -------------------------------------------------------------------------
    // A torn ring: the piece, then its hole punched out with a white torn rim.
    const punch = PaperDetail.punch;
    const blob = (cx, cy, rx, ry, seed, j = 0.05, n = 10) => {
        const r = P.rng(seed);
        return D.spline(Array.from({ length: n }, (_, i) => {
            const a = (i / n) * Math.PI * 2, k = 1 + (r() - 0.5) * 2 * j;
            return [cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k];
        }), 8);
    };
    const LETTER = { ...BORDER, border: 3.3, tex: { alpha: [0.25, 0.55], lVar: 5 } };
    const LETTERS = {
        a: { box: { x: -48, y: -50, w: 96, h: 100 }, draw: (c) => {
            cut(c, blob(-8, 0, 29, 37.5, 'wla-bowl'), COL.a, 'wla-bowl', LETTER);
            punch(c, blob(-4, 2, 11, 17, 'wla-hole', 0.08), 'wla-hole');
            cut(c, P.noodle(D.spline([[26, -31], [27.5, 0], [27, 32]], 6, false), 25), COL.a, 'wla-stem', LETTER);
        } },
        b: { box: { x: -62, y: -125, w: 118, h: 185 }, draw: (c) => {
            cut(c, P.noodle(D.spline([[-28, -104], [-30, -30], [-31, 42]], 8, false), 22), COL.b, 'wlb-stem', { ...LETTER, tex: { alpha: [0.25, 0.5], lVar: 4, color: '#eccf40' } });
            cut(c, blob(0, 0, 44, 49.5, 'wlb-bowl'), COL.b, 'wlb-bowl', LETTER);
            punch(c, blob(4, 0, 18.5, 22.5, 'wlb-hole', 0.08), 'wlb-hole');
        } },
        c: { box: { x: -46, y: -50, w: 96, h: 100 }, draw: (c) => {
            const arc = Array.from({ length: 29 }, (_, i) => {
                const a = (-40 - (i / 28) * 280) * (Math.PI / 180);
                return [Math.cos(a) * 25.5 * (1 + 0.04 * Math.sin(i)), Math.sin(a) * 30];
            });
            cut(c, P.noodle(arc, 23.5), COL.c, 'wlc', LETTER);
        } },
        e: { box: { x: -46, y: -48, w: 92, h: 96 }, draw: (c) => {
            const e3 = ([px, py]) => [(1200 + px / 3) / 2.16 - 674, (1150 + py / 3) / 2.16 - 625.8];
            cut(c, D.spline([[725, 692], [800, 684], [880, 676], [948, 668], [962, 630], [965, 560], [950, 480], [910, 420], [850, 385], [770, 372], [690, 382], [620, 420], [575, 480], [558, 560], [565, 650], [595, 730], [650, 795], [730, 830], [820, 832], [900, 812], [962, 775], [975, 740], [955, 714], [880, 708], [800, 704], [735, 700]].map(e3), 5), COL.e, 'wle', LETTER);
            punch(c, D.spline([[700, 522], [730, 508], [770, 505], [798, 516], [770, 528], [730, 530]].map(e3), 6), 'wle-eye', 1.6);
        } },
    };
    const letter = (g, k, x, y, s, rot, sc = 1) => {
        const Lt = LETTERS[k];
        place(g, 'th-words-' + k, Lt.box, Lt.draw, x, y, s * sc, rot, 1.4);
    };
    // six drawings on twos (10.0 → 10.417): [dx, dy, rotation in degrees] from the start pose
    const START = { a: [343, 596], b: [436, 652], c: [598, 590], e: [674, 626] };
    const KEYS = {
        a: [[0, 0, 0], [0, 0, 0], [0, 0, 0], [-76, -210, -10], [-70, -232, -18], [-68, -252, -22]],
        b: [[0, 0, 2], [0, 0, 2], [0, 0, 2], [24, -271, 7], [-10, -378.5, 12], [-10, -376.5, 11]],
        c: [[0, 0, 0], [0, 0, 0], [0, 0, 0], [-32, -139, -15], [-6, -275, -8], [-3, -285, -6]],
        e: [[0, 0, 0], [0, 0, 0], [0, 0, 0], [30, -44, -5], [74, -215, 8], [68, -249, -10]],
    };
    // in the heart the miniature shows only a b c, bigger and closer over the book
    const HEART = { a: [-208.6, -218.6, -30], b: [-93, -290, 8], c: [58.6, -279, 0] };
    const SPARKS = [[234, 406, 16], [673.5, 254.5, 14]];

    Things.words = (g, x, y, s, t, part) => {
        // in the heart the miniature book sits tilted
        const heart = t >= 16;
        if (part !== 'front') place(g, 'th-words-book', { x: -305, y: -160, w: 610, h: 330 }, book, x, y, s, heart ? -0.085 : 0, 1.2);
        if (part === 'back') return;
        if (heart) {
            for (const [k, [dx, dy, rd]] of Object.entries(HEART)) letter(g, k, x + dx * s, y + dy * s, s, (rd * Math.PI) / 180, 1.38);
            return;
        }
        const step = Math.max(0, Math.min(5, Math.floor((t - 10) * 12 + 1e-6)));
        for (const k of ['a', 'b', 'c', 'e']) {
            const [dx, dy, rd] = KEYS[k][step];
            letter(g, k, x + (START[k][0] + dx - O[0]) * s, y + (START[k][1] + dy - O[1]) * s, s, (rd * Math.PI) / 180);
        }
        // little sparkles once the letters are out
        if (step >= 4) {
            for (const [sx, sy, r] of SPARKS) {
                const px = x + (sx - O[0]) * s, py = y + (sy - O[1]) * s, rr = r * s;
                P.markerStroke(g, [[px - rr, py], [px + rr, py]], COL.spark, 3 * s, 'wspk-h' + sx, 0.9);
                P.markerStroke(g, [[px, py - rr], [px, py + rr]], COL.spark, 3 * s, 'wspk-v' + sx, 0.9);
            }
        }
    };
})();
