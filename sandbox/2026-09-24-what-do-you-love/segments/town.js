// Town kit: the collage town of the night exterior and the paper planes. Global: Town.
// Every house is a different printed paper (sheet music, handwriting, newsprint, a map), with a
// dark navy roof, torn white edges, yellow sticky-note windows with a marker cross, chimneys
// and a black cat. Two layouts, both measured house by house on the reference (logical units,
// 1000 = the 2160 px frame): Town.EXT (right half of the exterior shot) and Town.SKY (the low
// skyline of the flight shot). Planes are folded from printed paper too (wing, darker keel,
// fold line) and fly on dashed trails.
const Town = (() => {
    const P = Paper, D = PaperDetail;
    // colours sampled on the reference (0.5 s and 6.9 s)
    const COL = {
        roof: '#131437', window: '#eec64c', cross: '#1d1a36', cat: '#111027',
        map: '#1c2a48', music: '#292956', news: '#28295c', newsDark: '#202049', hand: '#29204f',
        skyLow: '#343c7f', contour: '#3d5f82', river: '#4a7db0', route: '#b0474f',
    };

    // --- printed-paper textures (draw inside a cutout's inner(c, box)) --------------------
    // Sheet music: staves of five lines, notes with stems (the odd beamed pair), printed ink.
    // o: seed, ink, gap (between staff lines), period (between staves), alpha, line, y0
    function music(c, box, o = {}) {
        const r = Motion.rng(o.seed ?? 'music'), gap = o.gap ?? 3.4, per = o.period ?? 23, ink = o.ink ?? '#6c68ad';
        c.save();
        c.strokeStyle = ink;
        c.fillStyle = ink;
        for (let y0 = box.y + (o.y0 ?? 4) + r() * 4; y0 < box.y + box.h; y0 += per) {
            c.globalAlpha = (o.alpha ?? 0.75) * 0.7;
            c.lineWidth = o.line ?? 0.55;
            for (let k = 0; k < 5; k++) (c.beginPath(), c.moveTo(box.x, y0 + k * gap), c.lineTo(box.x + box.w, y0 + k * gap), c.stroke());
            c.globalAlpha = o.alpha ?? 0.75;
            let x = box.x + 3 + r() * 8, prev = null;
            while (x < box.x + box.w) {
                const step = Math.floor(r() * 8);
                const hy = y0 + 4 * gap - (step * gap) / 2 + gap * 0.1;
                c.save();
                c.translate(x, hy);
                c.rotate(-0.4);
                c.beginPath();
                c.ellipse(0, 0, gap * 0.62, gap * 0.44, 0, 0, Math.PI * 2);
                c.fill();
                c.restore();
                const sx = x + gap * 0.55, top = hy - gap * 3.1;
                c.lineWidth = gap * 0.2;
                c.beginPath();
                c.moveTo(sx, hy - gap * 0.1);
                c.lineTo(sx, top);
                c.stroke();
                // beam to the previous note, or a flag
                if (prev && r() < 0.3) {
                    c.lineWidth = gap * 0.45;
                    c.beginPath();
                    c.moveTo(prev[0], prev[1]);
                    c.lineTo(sx, top);
                    c.stroke();
                    prev = null;
                } else if (r() < 0.25) {
                    c.lineWidth = gap * 0.28;
                    c.beginPath();
                    c.moveTo(sx, top);
                    c.quadraticCurveTo(sx + gap * 1.1, top + gap * 0.9, sx + gap * 0.7, top + gap * 2);
                    c.stroke();
                    prev = null;
                } else prev = [sx, top];
                x += (o.spacing ?? 10.5) * (0.8 + r() * 0.5);
            }
        }
        c.restore();
    }
    // Newsprint on dark paper: columns of lighter bars, the odd headline and photo block.
    // o: seed, ink, col (column width), lineH (period), barH, alpha
    function news(c, box, o = {}) {
        const r = Motion.rng(o.seed ?? 'news'), cw = o.col ?? 24, lh = o.lineH ?? 5.1, bh = o.barH ?? 2.3;
        c.save();
        c.fillStyle = o.ink ?? '#3d407f';
        for (let x0 = box.x - r() * cw; x0 < box.x + box.w; x0 += cw) {
            let y = box.y + 2 + r() * lh;
            while (y < box.y + box.h) {
                const roll = r();
                c.globalAlpha = (o.alpha ?? 0.8) * (0.75 + r() * 0.25);
                if (roll < 0.06) {
                    // headline / photo block across the column
                    const h = lh * (1 + Math.floor(r() * 2));
                    c.fillRect(x0 + 1.5, y, cw - 3, h - 1.2);
                    y += h + lh * 0.4;
                } else {
                    // a line of text: a few words
                    let x = x0 + 1.5;
                    const end = x0 + cw - 1.5 - (r() < 0.12 ? r() * cw * 0.6 : 0);
                    while (x < end - 1) {
                        const w = Math.min(end - x, 2.5 + r() * 9);
                        c.fillRect(x, y, w, bh);
                        x += w + 1.2 + r() * 0.8;
                    }
                    y += lh;
                }
            }
        }
        c.restore();
    }
    // Handwritten letter paper: rows of cursive (PaperDetail.cursive at the town's scale)
    const hand = (c, box, o = {}) => D.cursive(c, box, o.ink ?? '#5c4f8f', { seed: o.seed ?? 'hand', lineH: o.lineH ?? 13, xh: o.xh ?? 3.6, hw: o.hw ?? 2.6, width: o.width ?? 0.95, alpha: o.alpha ?? 0.8, gap: o.gap ?? 5 });
    // Map: nested wobbly contour lines, a blue river and a red dashed route.
    // o.contours: [cx, cy, r0, dr, n] ; o.river, o.route: control points (Catmull-Rom)
    function map(c, box, o = {}) {
        c.save();
        c.lineCap = 'round';
        c.lineJoin = 'round';
        if (o.contours) {
            const [cx, cy, r0, dr, n] = o.contours, rr = Motion.rng((o.seed ?? 'map') + 'c');
            const ph = [rr() * 6, rr() * 6, rr() * 6];
            c.strokeStyle = o.contour ?? COL.contour;
            c.lineWidth = 0.75;
            for (let k = 0; k < n; k++) {
                c.globalAlpha = 0.85 - k * 0.06;
                c.beginPath();
                for (let i = 0; i <= 64; i++) {
                    const a = (i / 64) * Math.PI * 2, R = (r0 + k * dr) * (1 + 0.16 * Math.sin(a * 2 + ph[0] + k * 0.25) + 0.08 * Math.sin(a * 3 + ph[1]) + 0.05 * Math.sin(a * 5 + ph[2] + k * 0.5));
                    const x = cx + Math.cos(a) * R * 1.15, y = cy + Math.sin(a) * R;
                    i ? c.lineTo(x, y) : c.moveTo(x, y);
                }
                c.stroke();
            }
        }
        const path = (pts) => {
            const sp = D.spline(pts, 8, false);
            c.beginPath();
            sp.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
        };
        if (o.river) {
            c.globalAlpha = 0.9;
            c.strokeStyle = COL.river;
            c.lineWidth = 1.6;
            path(o.river);
            c.stroke();
        }
        if (o.route) {
            c.globalAlpha = 0.85;
            c.strokeStyle = COL.route;
            c.lineWidth = 1.2;
            c.setLineDash([3.6, 2.4]);
            path(o.route);
            c.stroke();
            c.setLineDash([]);
        }
        c.restore();
    }
    // Graph paper (squared, faint blue-grey lines) and lined notebook paper.
    function graph(c, box, o = {}) {
        const s = o.step ?? 6;
        c.save();
        c.strokeStyle = o.ink ?? '#a9b1c6';
        c.globalAlpha = o.alpha ?? 0.7;
        c.lineWidth = o.width ?? 0.45;
        for (let x = Math.floor(box.x / s) * s; x < box.x + box.w; x += s) (c.beginPath(), c.moveTo(x, box.y), c.lineTo(x, box.y + box.h), c.stroke());
        for (let y = Math.floor(box.y / s) * s; y < box.y + box.h; y += s) (c.beginPath(), c.moveTo(box.x, y), c.lineTo(box.x + box.w, y), c.stroke());
        c.restore();
    }
    function lined(c, box, o = {}) {
        const s = o.step ?? 12;
        c.save();
        c.strokeStyle = o.ink ?? '#9fb2d8';
        c.globalAlpha = o.alpha ?? 0.9;
        c.lineWidth = o.width ?? 0.9;
        for (let y = (o.y0 ?? 0) - s * Math.ceil(((o.y0 ?? 0) - box.y) / s); y < box.y + box.h; y += s) (c.beginPath(), c.moveTo(box.x, y), c.lineTo(box.x + box.w, y), c.stroke());
        c.restore();
    }
    const TEX = { music, news, hand, map, graph, lined };

    // --- houses ------------------------------------------------------------------------------
    const edge = { border: 2, borderVar: 0.5, jag: 0.8, step: 2, shadow: 0.2, paper: '#f4efe4' };
    // a window: yellow sticky note with streaky marker and a dark marker cross
    function windowPiece(c, [x, y, w, h], seed) {
        P.cutout(c, [[x, y], [x + w, y + 0.3], [x + w - 0.2, y + h], [x + 0.2, y + h - 0.2]], COL.window, seed, { border: 0, jag: 0.35, step: 1.2, shadow: 0.18, tex: { angle: -0.05, len: [8, 22], h: [1.4, 3], alpha: [0.25, 0.55], lVar: 6 } });
        P.markerStroke(c, [[x + w / 2, y + 1.8], [x + w / 2 + 0.2, y + h - 1.8]], COL.cross, 1.7, seed + 'v', 0.95);
        P.markerStroke(c, [[x + 1.8, y + h / 2], [x + w - 1.8, y + h / 2 + 0.2]], COL.cross, 1.7, seed + 'h', 0.95);
    }
    // h: { body: [x0, y0, x1, y1], roof: [apexX, apexY, leftX, rightX, baseY], tex, color,
    //      texO (texture options), windows: [[x, y, w, h]], chimney: [x, y, w, h], seed }
    function house(c, h) {
        const seed = h.seed;
        if (h.chimney) {
            const [x, y, w, hh] = h.chimney;
            P.cutout(c, [[x, y], [x + w, y], [x + w, y + hh], [x, y + hh]], h.chimneyColor ?? '#1a1c44', seed + 'ch', { ...edge, border: 1.2 });
        }
        if (h.body) {
            const [x0, y0, x1, y1] = h.body;
            P.cutout(c, [[x0, y0], [x1, y0 + 0.4], [x1 + 0.3, y1], [x0 - 0.3, y1]], h.color, seed, {
                ...edge, tex: { angle: 0, len: [30, 90], h: [4, 9], alpha: [0.2, 0.45], lVar: 3 },
                inner: (cc, box) => h.tex && TEX[h.tex](cc, box, { seed, ...h.texO }),
            });
        }
        for (const [i, w] of (h.windows ?? []).entries()) windowPiece(c, w, seed + 'w' + i);
        if (h.roof) {
            const [ax, ay, lx, rx, by] = h.roof;
            P.cutout(c, [[ax, ay], [rx, by], [(ax + rx) / 2, by + 0.6], [lx, by]], COL.roof, seed + 'roof', { ...edge, shadow: 0.25, tex: { angle: 0, len: [30, 90], h: [4, 9], alpha: [0.2, 0.4], lVar: 3 } });
        }
    }
    // the black cat sitting on a roof: body, head with ears and a curled tail, each its own
    // piece. (x, y) = where it sits (bottom centre); s = 1 is the exterior's cat (39 wide).
    function cat(c, x, y, s = 1) {
        const T = (pts) => pts.map(([a, b]) => [x + a * s, y + b * s]);
        const o = { ...edge, border: 1.6, shadow: 0.2, tex: { alpha: [0.15, 0.3] } };
        P.cutout(c, T(P.noodle(D.spline([[14, -4], [26, -6], [35, -14], [38, -26], [37, -34]], 5, false), 4.8, 4.2)), COL.cat, 'cattail', o);
        P.cutout(c, T(D.spline([[-19, -2], [-20, -16], [-14, -30], [0, -36], [14, -30], [20, -16], [19, -2], [0, 0]], 8)), COL.cat, 'catbody', o);
        P.cutout(c, T(D.spline([[-14, -48], [-13, -58], [-11, -64], [-5, -58.5], [5, -58.5], [11, -64], [13, -58], [14, -48], [9, -37], [0, -35], [-9, -37]], 6)), COL.cat, 'cathead', o);
    }
    function layout(c, L) {
        for (const h of L.houses) {
            if (h.block) P.cutout(c, [[h.block[0], h.block[1]], [h.block[2], h.block[1] + 0.5], [h.block[2], h.block[3]], [h.block[0], h.block[3]]], h.color, h.seed, { ...edge, tex: { angle: 0, len: [40, 120], h: [6, 12], alpha: [0.25, 0.5], lVar: 3 } });
            else house(c, h);
            if (h.cat) cat(c, ...h.cat);
        }
    }

    // Exterior (0–1.5 s, 20–21 s, 24–28 s): right of the purple house, measured at 0.5 s.
    const EXT = {
        box: { x: 560, y: 560, w: 460, h: 460 },
        houses: [
            { seed: 'tA', body: [584, 731, 724, 878], color: COL.hand, tex: 'hand', windows: [[614, 751.5, 22, 28], [689, 751, 22.5, 28.5]] },
            { seed: 'tD', roof: [618, 781, 560, 723, 866.5], chimney: [651, 788.5, 18, 32] },
            { seed: 'tG', body: [584, 867, 714.5, 1012], color: COL.hand, tex: 'hand', texO: { seed: 'tG2' }, windows: [[589, 879, 22, 28], [683, 879, 24, 28]] },
            { seed: 'tB', body: [721.8, 661, 818, 876], roof: [771.4, 567.3, 714.5, 825, 661], color: COL.map, tex: 'map', windows: [[759.5, 673.6, 21.5, 27.4], [759.5, 725.5, 21, 26.5]],
              texO: { route: [[722, 729], [745, 727], [761, 720.6], [779, 706], [800, 686.6], [818, 676]], river: [[722, 744], [741.7, 753], [761, 767.6], [780.6, 779], [800, 775.7], [818, 770]], contours: [806, 842, 7, 7.5, 7] } },
            { seed: 'tE', body: [928, 682.7, 1012, 860], roof: [984, 629.5, 920.5, 1047.5, 682.7], color: COL.news, tex: 'news', windows: [[948, 695.5, 22, 28]] },
            { seed: 'tC', body: [806.8, 718, 927, 878], roof: [870.5, 661, 801, 929.5, 718], color: COL.music, tex: 'music', windows: [[897.2, 732.9, 21.2, 27.7]], cat: [873.3, 662, 1] },
            { seed: 'tI', block: [716, 875, 850, 914], color: COL.skyLow },
            { seed: 'tH', body: [706.8, 906.8, 850, 1012], color: COL.newsDark, tex: 'news', texO: { ink: '#35376f' }, windows: [[722.7, 922.7, 22.8, 28.3], [772.7, 922.7, 21.8, 28.3]] },
            { seed: 'tF', body: [851, 835.5, 1012, 1012], roof: [941, 751, 846.4, 1035.6, 835.5], color: COL.map, tex: 'map',
              windows: [[875, 847.7, 22.7, 27.3], [931.8, 847.7, 22.7, 27.3], [988.6, 847.7, 22.7, 27.3], [874, 900, 22, 27], [931, 900, 21.7, 27], [872.7, 951, 21.8, 27], [988.6, 951, 22, 27]],
              texO: { route: [[851, 900], [868, 913.6], [895.5, 925], [922.7, 918], [945.5, 907], [972.7, 905.5], [1012, 905.5]], river: [[851, 936], [877, 929.5], [913.6, 941], [936, 959], [959, 970], [982, 954.5], [1012, 925]], contours: [1000, 1000, 12, 9, 4] } },
        ],
    };
    // Flight shot (6–7 s): a low skyline across the bottom, measured at 6.9 s.
    const SKY = {
        box: { x: -20, y: 700, w: 1040, h: 320 },
        houses: [
            { seed: 'sA', body: [-12, 895, 120, 1012], roof: [50, 818.5, -40, 146, 895], chimney: [75, 824, 20, 40], color: COL.news, tex: 'news', windows: [[-15, 906, 22.5, 27.5], [40, 906, 22.5, 27.5]] },
            { seed: 'sC', body: [223.5, 912.5, 397.5, 1012], color: COL.hand, tex: 'hand', windows: [[245, 930, 22.5, 28.5], [302.5, 931, 22.5, 27.5], [364, 930, 22.5, 28.5]] },
            { seed: 'sB', body: [121.5, 835, 235, 1012], roof: [175, 722.5, 110, 240, 835], color: COL.map, tex: 'map', windows: [[194, 847.5, 23.5, 27.5], [195, 899, 23.5, 27.5], [196, 951, 23, 27.5]],
              texO: { route: [[122, 861.5], [140, 861], [165, 865], [183, 885], [195, 905], [210, 930]], river: [[200, 1012], [212, 985], [222, 962], [236, 945]], contours: [236, 985, 8, 9, 6] } },
            { seed: 'sD', body: [396, 872.5, 540, 1012], roof: [471, 811, 392.5, 550, 872.5], color: COL.music, tex: 'music', windows: [[410, 886, 23, 27.5], [502.5, 886, 22.5, 27.5]], cat: [468, 822, 0.95] },
            { seed: 'sE', body: [532.5, 910, 692.5, 1012], roof: [616, 829, 522.5, 710, 910], chimney: [641.5, 840, 17.5, 30], color: COL.news, tex: 'news', texO: { seed: 'sE2' }, windows: [[662.5, 922.5, 22.5, 27.5]] },
            { seed: 'sF', body: [692.5, 845, 802.5, 1012], roof: [747.5, 735, 686, 811, 842.5], color: '#2e2459', tex: 'hand', windows: [[712.5, 855, 22.5, 27.5], [761.5, 855, 22.5, 27.5], [712.5, 906.5, 22.5, 27.5], [763.5, 906.5, 22.5, 27.5]] },
            { seed: 'sG', body: [792.5, 897.5, 1012, 1012], roof: [910, 790, 785, 1035, 896.5], color: COL.map, tex: 'map',
              windows: [[810, 910, 21.5, 27.5], [854, 910, 22, 27.5], [945, 910, 22.5, 27.5], [992.5, 910, 22, 27.5], [855, 961.5, 21.5, 27.5], [900, 961.5, 21.5, 27.5], [992.5, 961.5, 22, 27.5]],
              texO: { route: [[793, 913], [815, 916], [850, 935], [880, 962], [910, 957], [935, 950], [970, 946], [1012, 945]], river: [[793, 987], [820, 978], [850, 970], [900, 967], [940, 975], [975, 968], [1012, 958]], contours: [1000, 930, 10, 9, 4] } },
        ],
    };
    // Windows that light up during the film (the opening lights LATE[0] at 1.0 s; the lights
    // shot lights them all; the loop shows them lit). Measured at 27.0 s: [x, y, w, h].
    EXT.late = [[830, 732.4, 23, 26.5], [758, 776.5, 22, 27], [634, 878.5, 22.5, 27], [988.6, 900, 22.7, 27], [826, 922.5, 22.5, 27], [681.5, 928.5, 22.5, 27], [634, 930.5, 22.5, 27], [931.5, 951, 22, 27]];
    // draws a layout (cached; the town never moves, so it never re-tears)
    function draw(g, L, key) {
        WL.sprite('town:' + key, L.box, (c) => layout(c, L), 1.15).draw(g);
    }
    // one late window as its own cached piece, centred, scaled by (sx, sy) for a pop
    function lateWindow(g, i, sx = 1, sy = sx) {
        const [x, y, w, h] = EXT.late[i];
        const sp = WL.sprite('latewin' + i, { x: -w / 2 - 3, y: -h / 2 - 3, w: w + 6, h: h + 6 }, (c) => windowPiece(c, [-w / 2, -h / 2, w, h], 'late' + i), 3);
        g.save();
        g.translate(x + w / 2, y + h / 2);
        g.scale(sx, sy);
        sp.draw(g);
        g.restore();
    }
    // the pale disc of light round a window that has just been lit (torn tissue paper)
    function glow(g, i, r) {
        const [x, y, w, h] = EXT.late[i];
        const sp = WL.sprite('glow' + (i % 4), { x: -30, y: -30, w: 60, h: 60 }, (c) => {
            const rr = P.rng('glow' + (i % 4));
            const pts = Array.from({ length: 11 }, (_, k) => { const a = (k / 11) * Math.PI * 2; return [Math.cos(a) * (24 + rr() * 2.5), Math.sin(a) * (24 + rr() * 2.5)]; });
            P.cutout(c, D.spline(pts, 5), '#f4e6a2', 'glow' + (i % 4), { border: 1.3, borderVar: 0.6, jag: 0.6, step: 1.2, shadow: 0.12, paper: '#fbf5da', tex: { alpha: [0.15, 0.35], len: [8, 20], h: [3, 6] } });
        }, 3.2);
        g.save();
        g.translate(x + w / 2, y + h / 2);
        g.scale(r / 25, r / 25);
        sp.draw(g);
        g.restore();
    }

    // --- paper planes --------------------------------------------------------------------------
    // Canonical plane, fold line 100 long on the x axis, nose at (50, 0) pointing to +x: the
    // upper wing (nose → wing back → fold rear), the keel below it (nose → fold rear → keel
    // tip, a shade darker), the fold line on top. Proportions measured on the flight shot's
    // hero plane and on the exterior's handwriting plane (they agree within 3 %).
    const PL = { N: [50, 0], FR: [-50, 0], WB: [-68, -41], KT: [-72, 27] };
    const PAPERS = {
        note: { color: '#f6f3ea', tex: (c, box) => lined(c, box, { step: 11, y0: -5 }), mark: true, keel: [-70, 40] },
        lined: { color: '#f5f1e6', tex: (c, box) => lined(c, box, { step: 11, y0: -3 }) },
        graph: { color: '#efeadb', tex: (c, box) => graph(c, box, { step: 7.5 }) },
        hand: { color: '#f0e9d6', tex: (c, box) => D.cursive(c, box, '#6a5d4c', { seed: 'planehand', lineH: 12, xh: 3.6, hw: 2.8, width: 1.1, alpha: 0.85, gap: 6 }) },
        music: { color: '#eee8d8', tex: (c, box) => music(c, box, { seed: 'planemusic', ink: '#3a3340', gap: 3.2, period: 21, alpha: 0.85, y0: -34, spacing: 12 }) },
        news: { color: '#ebe6d8', tex: (c, box) => D.newsprint(c, box, { seed: 'planenews', ink: '#6a655c', lineH: 4.5 }) },
    };
    function planeSprite(paper) {
        const pp = PAPERS[paper] ?? PAPERS.lined;
        return WL.sprite('tplane:' + paper, { x: -82, y: -50, w: 142, h: 100 }, (c) => {
            const o = { border: 0.9, borderVar: 0.4, jag: 0.45, step: 1.4, shadow: 0.2, paper: '#fbf9f2', tex: { alpha: [0.08, 0.2], len: [10, 30], h: [3, 6] } };
            // keel: same paper in shadow
            P.cutout(c, [PL.N, PL.FR, pp.keel ?? PL.KT], P.PAPER, 'tplk' + paper, { ...o, paper: '#ece8dc', tex: false, inner: (cc, box) => {
                cc.fillStyle = D.shade(pp.color, -9);
                cc.fillRect(box.x, box.y, box.w, box.h);
                pp.tex(cc, box);
                cc.fillStyle = 'rgba(70,62,52,0.08)';
                cc.fillRect(box.x, box.y, box.w, box.h);
            } });
            P.cutout(c, [PL.N, PL.WB, PL.FR], pp.color, 'tplw' + paper, { ...o, inner: (cc, box) => {
                pp.tex(cc, box);
                // the note's pen stroke seen through the wing (the hero plane is the note)
                if (pp.mark) (P.markerStroke(cc, [[13, -5], [-25, -11.5]], '#6f8fd0', 4.4, 'plmark1', 0.85), P.markerStroke(cc, [[13, -5], [-25, -11.5]], '#3862b1', 2.6, 'plmark2', 0.95));
            } });
            P.markerStroke(c, [[PL.N[0] - 1, 0], [PL.FR[0], 0]], '#6c6762', 1.5, 'tplfold', 0.95);
        }, 1.9);
    }
    // o: { x, y, rot, s, flip, paper } (similarity: (x, y) = fold midpoint, s = fold / 100)
    //  or { N, FR, WB, paper } (affine: the plane pinned by three measured points)
    function plane(g, o) {
        const sp = planeSprite(o.paper ?? 'lined');
        g.save();
        if (o.N) {
            // affine map canonical → screen: (50,0)→N, (−50,0)→FR, (−68,−41)→WB
            const ax = (o.N[0] - o.FR[0]) / 100, ay = (o.N[1] - o.FR[1]) / 100;
            const mx = (o.N[0] + o.FR[0]) / 2, my = (o.N[1] + o.FR[1]) / 2;
            // WB = mid + (−68)·a + (−41)·b  →  b = (mid − 68a − WB) / 41
            const bx = (mx - 68 * ax - o.WB[0]) / 41, by = (my - 68 * ay - o.WB[1]) / 41;
            g.transform(ax, ay, bx, by, mx, my);
        } else {
            g.translate(o.x, o.y);
            g.rotate(o.rot ?? 0);
            g.scale(o.s ?? 1, (o.s ?? 1) * (o.flip ? -1 : 1));
        }
        sp.draw(g);
        g.restore();
    }
    // screen position of a canonical point for a plane pose (for trails: the tail)
    function planePoint(o, [px, py]) {
        if (o.N) {
            const ax = (o.N[0] - o.FR[0]) / 100, ay = (o.N[1] - o.FR[1]) / 100, mx = (o.N[0] + o.FR[0]) / 2, my = (o.N[1] + o.FR[1]) / 2;
            const bx = (mx - 68 * ax - o.WB[0]) / 41, by = (my - 68 * ay - o.WB[1]) / 41;
            return [mx + ax * px + bx * py, my + ay * px + by * py];
        }
        const s = o.s ?? 1, c = Math.cos(o.rot ?? 0), sn = Math.sin(o.rot ?? 0), qy = py * (o.flip ? -1 : 1);
        return [o.x + (px * c - qy * sn) * s, o.y + (px * sn + qy * c) * s];
    }
    // dashed trail along a path; the dash phase is anchored to the path's start, so the
    // dashes stay put in the sky while the trail grows. o: width, dash, gap, color
    function trail(g, pts, o = {}) {
        if (pts.length < 2) return;
        g.save();
        g.strokeStyle = o.color ?? 'rgba(190,194,236,0.8)';
        g.lineWidth = o.width ?? 3.3;
        g.lineCap = 'round';
        g.setLineDash([o.dash ?? 10, o.gap ?? 8]);
        g.lineDashOffset = o.offset ?? 0;
        g.beginPath();
        pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
        g.stroke();
        g.restore();
    }

    return { COL, TEX, music, news, hand, map, graph, lined, house, cat, windowPiece, layout, draw, lateWindow, glow, EXT, SKY, PL, plane, planePoint, trail };
})();
