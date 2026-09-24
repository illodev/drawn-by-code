// Montage object «stars» (see ../things.js for the contract).
// Measured piece by piece on the reference (14.0–15.0 s; the heart at 17.9 s). Authored in
// WORLD logical units of the card, traced on the 2160-px frames; the anchor is the centre of
// the space disc, so CARDS draws it at [515, 505, 1]. In the heart (t ≥ 16) only the ringed
// planet appears, centred on (x, y).
// Layers, bottom to top: the torn navy disc (with the galaxy, the music planet and the
// newsprint moon glued on it) → the ringed planet (back half of the ring → planet → front
// half) → the comet flying left to right → stars and crosses popping in on threes.
(() => {
    const P = Paper, D = PaperDetail;
    const { place, cut } = Things.kit;
    const AX = 515, AY = 505;
    const loc = (pts, ox = AX, oy = AY) => pts.map(([x, y]) => [x - ox, y - oy]);
    const COL = {
        disc: '#2a2f71', edge: '#f7f3e8', planet: '#e1b567', ring: '#e39479', pink: '#e7898a', staff: '#9b3f47', note: '#83353d',
        moon: '#cfd5e8', moonInk: '#a0a6bf', photo: '#878ea5', topo: '#8c6a3a', dash: '#d24f3e', river: '#6d8ea8', star: '#f0db89',
        cross: '#e2dcc2', white: '#fbfaf4', galPink: '#d27b8a', galYellow: '#ecdc97', galDot: '#f7e59e', head: '#f2cf5d', tail: '#f4e5a5', tailMid: '#df9175', tick: '#f1e19c',
    };
    const frameOf = (t) => Math.round(t * 24 + 1e-6);

    // ------------------------------------------------------------------ the space disc
    // Outer radius of the torn white edge every 4°, ray-cast from the centre on three frames
    // (stars and the flower removed); the navy paper sits 4.6 inside it.
    const RB = [437, 435, 437, 432.5, 435, 437, 435.5, 436.3, 439, 438.5, 440.5, 441, 440, 439, 442.3, 436, 439.5, 429, 428, 428.5, 427.5, 424, 420.3, 420.7, 421, 421, 423.5, 422.3, 426.8, 428, 421.5, 424, 426.5, 424, 421.3, 428, 425.5, 421, 420.5, 420, 419, 424, 427, 422.5, 421.3, 427, 426, 425, 426.5, 428.5, 430, 428.3, 421.2, 431, 434, 422.5, 414.5, 411.5, 412, 418, 423, 420, 421, 428.3, 431.5, 432, 430.5, 431, 427, 431, 435.3, 435, 431, 433.3, 431, 427.5, 431, 427, 428.3, 430, 431.8, 440, 437.4, 439.3, 441.2, 441.5, 443.5, 438, 436.4, 432.3];
    const DISC = D.spline(RB.map((r, i) => {
        const a = (i * 4 * Math.PI) / 180;
        return [Math.cos(a) * (r - 4.6), Math.sin(a) * (r - 4.6)];
    }), 3);

    // the spiral galaxy: two marker arms, traced (world units)
    const GAL_PINK = [[733.3, 747.8], [736.7, 732.2], [754.4, 725.6], [785.6, 730], [803.3, 743.3], [807.8, 761.1], [801.1, 778.9], [781.1, 790], [750, 798.9], [718.9, 797.8], [685.6, 787.8], [658.9, 770], [647.8, 747.8], [652.2, 721.1], [667.8, 701.1], [703.3, 681.1], [736.7, 673.3], [790, 676.2]];
    const GAL_YELLOW = [[763.3, 754.4], [754.4, 767.8], [727.8, 768.9], [703.3, 756.7], [693.3, 738.9], [703.3, 718.9], [730, 703.3], [767.8, 700], [807.8, 707.8], [836.7, 725.6], [850, 750], [845.6, 774.4], [827.8, 796.7], [798.9, 812.2], [763.3, 822.2], [712.2, 824.4]];
    function drawGalaxy(c) {
        const arm = (pts, color, seed) => Things.markerPath(c, D.spline(loc(pts), 5, false), { w: 9.4, core: 0.6, color, edge: color, edgeAlpha: 0.6, seg: [15, 28], seed, streak: color });
        arm(GAL_PINK, COL.galPink, 'galpink');
        arm(GAL_YELLOW, COL.galYellow, 'galyellow');
        const r = P.rng('galdot');
        c.fillStyle = COL.galDot;
        c.beginPath();
        D.spline(Array.from({ length: 9 }, (_, i) => {
            const a = (i / 9) * Math.PI * 2, rr = 11 + (r() - 0.5) * 1.6;
            return [750 - AX + Math.cos(a) * rr, 750 - AY + Math.sin(a) * rr];
        }), 4).forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
        c.fill();
    }
    // a hand-cut circle: a slightly uneven round
    const roundish = (cx, cy, R, seed, n = 22, wob = 0.012) => {
        const r = P.rng(seed);
        return D.spline(Array.from({ length: n }, (_, i) => {
            const a = (i / n) * Math.PI * 2, rr = R * (1 + (r() - 0.5) * 2 * wob);
            return [cx + Math.cos(a) * rr, cy + Math.sin(a) * rr];
        }), 4);
    };
    // the small pink planet with a music score on it
    function drawMusicPlanet(c) {
        const cx = 203 - AX, cy = 291 - AY;
        cut(c, roundish(cx, cy, 52.5, 'musicplanet'), COL.pink, 'musicplanet', {
            border: 3.4, borderVar: 0.6, jag: 1.3, shadow: 0.2, paper: COL.edge, tex: { angle: -0.3, alpha: [0.12, 0.28], lVar: 4 },
            inner: (cc) => {
                cc.strokeStyle = COL.staff;
                cc.lineWidth = 0.9;
                cc.globalAlpha = 0.85;
                for (const y of [276.7, 285, 292.8, 301.7, 310, 336.7, 345]) {
                    cc.beginPath();
                    for (let x = 145; x <= 262; x += 6) cc.lineTo(x - AX, y - AY + Math.sin(x * 0.05) * 0.4);
                    cc.stroke();
                }
                cc.globalAlpha = 1;
                cc.fillStyle = COL.note;
                cc.strokeStyle = COL.note;
                cc.lineWidth = 1.4;
                for (const [hx, hy, sx, sy] of [[155.8, 293.3, 160.6, 266.7], [183.7, 289.2, 188.4, 262.5], [218, 293.3, 222.8, 266.7], [249.2, 297.5, 254.2, 270.8], [190.3, 340, 195, 314], [223, 341, 227.8, 331]]) {
                    cc.beginPath();
                    cc.ellipse(hx - AX, hy - AY, 5.4, 3.7, -0.35, 0, Math.PI * 2);
                    cc.fill();
                    cc.beginPath();
                    cc.moveTo(sx - AX, hy - AY - 1);
                    cc.lineTo(sx - AX, sy - AY);
                    cc.stroke();
                }
            },
        });
    }
    // the moon: a round of pale newsprint (two and a half columns of «words», a photo)
    function drawMoon(c) {
        const cx = 776 - AX, cy = 299.5 - AY;
        cut(c, roundish(cx, cy, 70, 'moon', 26, 0.01), COL.moon, 'moon', {
            border: 4.2, borderVar: 0.6, jag: 1.4, shadow: 0.2, paper: COL.edge, tex: { alpha: [0.06, 0.14], lVar: 2 },
            inner: (cc) => {
                const r = P.rng('moonnews');
                cc.fillStyle = COL.moonInk;
                for (const [x0, x1] of [[714, 764], [773, 823], [833, 885]]) {
                    for (let y = 229.5; y < 372; y += 10) {
                        if (x0 === 714 && y > 334 && y < 355) continue; // the photo
                        let x = x0 + (r() < 0.15 ? 4 : 0);
                        const end = x1 - (r() < 0.2 ? r() * 20 : 0);
                        while (x < end - 3) {
                            const w = Math.min(end - x, 5 + r() * 15);
                            cc.globalAlpha = 0.85 + r() * 0.15;
                            cc.fillRect(x - AX, y - AY, w, 3.6);
                            x += w + 2.4 + r() * 1.2;
                        }
                    }
                }
                cc.globalAlpha = 1;
                cc.fillStyle = COL.photo;
                cc.fillRect(721.7 - AX, 338.3 - AY, 43.3, 15.6);
            },
        });
    }
    function drawDisc(c) {
        cut(c, DISC, COL.disc, 'spacedisc', {
            border: 3.8, borderVar: 0.6, jag: 1.5, step: 2.4, shadow: 0.3, paper: COL.edge,
            tex: { angle: -0.33, angleVar: 0.14, len: [30, 110], h: [2, 5], lVar: 4.5, sVar: 6, alpha: [0.25, 0.55], density: 1.6 },
        });
        drawGalaxy(c);
        drawMusicPlanet(c);
        drawMoon(c);
    }

    // ------------------------------------------------------------------ the ringed planet
    // Local units centred on the planet (442, 567). The ring is two paper strips: the back
    // half (upper arc, its middle hidden by the planet) and the front half (lower arc) glued
    // over the planet; their ends overlap at both sides like a real paper band.
    const SX = 442, SY = 567;
    const RING_BACK = [[136.4, 631.2], [143, 619.4], [146.9, 608.7], [156, 600.8], [167.2, 587.3], [185.9, 572.5], [203.7, 562.2], [232, 547], [260.6, 530.2], [282.4, 515.8], [310, 501], [350, 485], [400, 469], [450, 456], [500, 447], [546.8, 441.6], [580.6, 436.1], [622.2, 433.6], [644.9, 432.7], [679.2, 436.6], [699.1, 440.8], [710.6, 443.2], [728.5, 455.3], [740, 469.7], [726, 478.2], [712, 477], [695, 481], [676.4, 480.2], [655.1, 478.2], [637.5, 479], [610, 479.5], [578.8, 481.5], [540, 487], [490, 497], [440, 510], [390, 526], [340, 545], [300, 561], [277.3, 571.9], [262, 579.7], [255.1, 584.8], [223.5, 600.4], [207.9, 612.1], [188.4, 630.6], [175, 642], [160, 647], [138.9, 647.6], [136.6, 645.4]];
    const RING_FRONT = [[703.3, 482.9], [743.5, 484.9], [745.3, 487.3], [746.7, 494.4], [746.4, 502.1], [733.2, 526.4], [715, 543.6], [710.2, 549.7], [687.5, 565.6], [671.8, 576.2], [655.7, 584.9], [599.1, 615.8], [582.9, 622.2], [559.7, 630.5], [533.3, 638.4], [519, 645.1], [504.6, 649.2], [485.6, 658.5], [459.3, 665.1], [431, 671.9], [400.5, 680.5], [378.7, 685.5], [353.7, 688.4], [331.9, 692.3], [312, 694.1], [296.8, 697.8], [280.1, 698.1], [258.8, 700.5], [231.5, 701.3], [210.2, 695.2], [193.1, 694.2], [170.4, 689.9], [166.7, 687.9], [147.6, 672.1], [141.3, 661.6], [160, 650], [176, 638], [183.4, 641.7], [189.4, 645.8], [225.9, 652.7], [238.9, 651.9], [265.7, 654.5], [309.3, 646.7], [331, 644.5], [364.8, 637.2], [390.7, 636.1], [421.8, 629.1], [454.2, 618], [480.6, 609.1], [508.3, 600.3], [550.9, 585.4], [570.7, 574.7], [593.9, 563.6], [609.7, 558], [631.5, 547.6], [658.3, 532.6], [674.1, 518.1], [698.9, 495.8], [702, 484.7]];
    const sl = (pts) => loc(pts, SX, SY);
    const ringTex = { angle: -0.26, angleVar: 0.1, len: [20, 70], h: [1.5, 3.5], lVar: 7, sVar: 2, alpha: [0.3, 0.6], density: 1.8 };
    // topographic map: nested uneven loops round two summits, a few open contour lines
    function topo(c) {
        c.save();
        c.strokeStyle = COL.topo;
        c.lineWidth = 0.9;
        c.lineJoin = 'round';
        const loops = (cx, cy, n, r0, dr, asp, seed) => {
            const r = P.rng(seed), ph = [r() * 6, r() * 6, r() * 6];
            for (let i = 0; i < n; i++) {
                const R = r0 + dr * i, amp = 0.05 + i * 0.025, ph7 = r() * 6, a7 = 0.02 + r() * 0.025;
                c.globalAlpha = 0.45 + r() * 0.15;
                c.beginPath();
                for (let k = 0; k <= 30; k++) {
                    const a = (k / 30) * Math.PI * 2;
                    // shared low harmonics make the loops nest like a map; the 7th wobbles
                    // each line on its own, as a hand would
                    const f = 1 + amp * Math.sin(3 * a + ph[0]) + amp * 0.6 * Math.sin(5 * a + ph[1]) + amp * 0.4 * Math.sin(2 * a + ph[2]) + a7 * Math.sin(7 * a + ph7);
                    const x = cx + i * 1.6 + Math.cos(a) * R * f, y = cy + Math.sin(a) * R * f * (asp + (1 - asp) * Math.min(1, i / 3));
                    k ? c.lineTo(x, y) : c.moveTo(x, y);
                }
                c.stroke();
            }
        };
        loops(323 - SX, 530 - SY, 5, 10, 7.5, 0.66, 'topoA');
        loops(566 - SX, 662 - SY, 5, 14, 13, 0.7, 'topoB');
        // open contour lines across the lowlands
        c.globalAlpha = 0.45;
        for (const line of [
            [[286, 488], [318, 480], [350, 490], [368, 515], [372, 545], [362, 568]],
            [[300, 470], [336, 466], [372, 488], [388, 520], [390, 548]],
            [[287, 565], [320, 575], [352, 580], [380, 574]],
            [[490, 598], [510, 580], [535, 572], [570, 573], [596, 582]],
        ]) {
            c.beginPath();
            D.spline(sl(line), 6, false).forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
            c.stroke();
        }
        c.restore();
    }
    // The heart's miniature is a close-up redraw of the same map: a few big contour lines
    // sweeping down to the lower left, a heavy dashed parallel and a thick blue river
    // (planet-local units, traced at 17.9 s and scaled back up by 1 / 0.272).
    function heartSurface(cc) {
        const line = (pts, n = 6) => {
            cc.beginPath();
            D.spline(pts, n, false).forEach(([x, y], i) => (i ? cc.lineTo(x, y) : cc.moveTo(x, y)));
            cc.stroke();
        };
        cc.save();
        cc.lineCap = 'round';
        cc.lineJoin = 'round';
        cc.strokeStyle = COL.topo;
        cc.globalAlpha = 0.7;
        cc.lineWidth = 2.3;
        for (const pts of [
            [[-89, -131], [-99, -90], [-118, -61], [-155, -31]],
            [[-38, -137], [-42, -90], [-69, -53], [-114, -20], [-155, 4]],
            [[23, -155], [17, -110], [5, -73], [-24, -33], [-61, 4], [-98, 29], [-155, 45]],
            [[66, -143], [52, -90], [33, -57], [9, -20], [-20, 8], [-57, 33], [-110, 53]],
            [[107, -117], [103, -61], [82, -20], [54, 12], [39, 41]],
        ]) line(pts);
        cc.globalAlpha = 1;
        cc.strokeStyle = COL.dash;
        cc.lineWidth = 5.5;
        cc.setLineDash([13, 9]);
        line([[-160, -95], [-130, -88], [-16, -61], [50, -67], [135, -94], [165, -104]]);
        cc.setLineDash([]);
        cc.strokeStyle = COL.river;
        cc.lineWidth = 7;
        line([[-165, 105], [-136, 78], [-85, 37], [-32, -8], [0, -20], [160, -31]], 4);
        cc.restore();
    }
    function drawSaturn(c, heart) {
        cut(c, D.spline(sl(RING_BACK), 3), COL.ring, 'ringback', { border: 2.9, borderVar: 0.6, jag: 1.3, shadow: 0.22, paper: COL.edge, tex: ringTex });
        cut(c, roundish(0, 0, 156.5, 'saturn', 28, 0.008), COL.planet, 'saturn', {
            border: 4.4, borderVar: 0.6, jag: 1.5, shadow: 0.22, paper: COL.edge, tex: { angle: -0.3, alpha: [0.1, 0.25], lVar: 3.5 },
            inner: (cc) => {
                if (heart === true) return heartSurface(cc);
                topo(cc);
                // the red dashed border and the blue river
                cc.save();
                cc.lineCap = 'round';
                cc.strokeStyle = COL.dash;
                cc.lineWidth = 1.5;
                cc.setLineDash([5, 3.4]);
                cc.beginPath();
                D.spline(sl([[330, 454], [363.3, 445], [380, 450], [400, 470], [420, 496.7], [443.3, 510.7], [466.7, 500], [486.7, 480], [510, 457.3], [530, 455.5], [556, 455.7]]), 8, false).forEach(([x, y], i) => (i ? cc.lineTo(x, y) : cc.moveTo(x, y)));
                cc.stroke();
                cc.setLineDash([]);
                cc.strokeStyle = COL.river;
                cc.lineWidth = 1.7;
                cc.lineJoin = 'round';
                cc.beginPath();
                sl([[290, 630], [296.7, 621.7], [320, 593.3], [330, 590.7], [341.7, 596.7], [363.3, 631.7], [382, 664], [398, 648], [408.3, 626.7], [426.7, 580], [440, 551.7], [493.3, 542.7], [500, 542.7], [510, 553.3], [525, 588.3], [538, 622], [545, 637.3], [551.7, 646.7], [585, 646.7]]).forEach(([x, y], i) => (i ? cc.lineTo(x, y) : cc.moveTo(x, y)));
                cc.stroke();
                cc.restore();
            },
        });
        cut(c, D.spline(sl(RING_FRONT), 3), COL.ring, 'ringfront', { border: 2.9, borderVar: 0.6, jag: 1.3, shadow: 0.22, paper: COL.edge, tex: ringTex });
    }
    const SATURN_BOX = { x: -318, y: -166, w: 632, h: 332 };

    // ------------------------------------------------------------------ the comet
    // Local units: head at (0, 0), tail along −x; drawn tilted −0.12 (tail lower-left).
    function drawComet(c) {
        const strip = (path, w0, w1, col, seed) => cut(c, P.noodle(D.spline(path, 6, false), w0, w1), col, seed, { border: 2.6, borderVar: 0.5, jag: 1.1, shadow: 0.2, paper: COL.edge, tex: { angle: 0, angleVar: 0.05, len: [30, 80], h: [2, 5], lVar: 4, alpha: [0.25, 0.5] } });
        strip([[-8, -20], [-52, -15], [-110, -11.5], [-188, -2], [-266, 2]], 19, 9, COL.tail, 'cometup');
        strip([[-30, -8], [-95, 1.5], [-150, 8], [-212, 15]], 7, 10, COL.tailMid, 'cometmid');
        strip([[-8, 9], [-40, 9.5], [-104, 17.5], [-170, 28]], 23, 10, COL.tail, 'cometlow');
        cut(c, roundish(0, 0, 33.5, 'comethead', 11, 0.03), COL.head, 'comethead', { border: 3, borderVar: 0.5, jag: 1.2, shadow: 0.2, paper: COL.edge, tex: { angle: 0, angleVar: 0.1, len: [20, 50], h: [3, 7], lVar: 7, alpha: [0.3, 0.6] } });
    }
    // head position per frame (measured; it eases in, speeds past the top and slows under
    // the flower), and its path (a gentle arc)
    const COMET_X = { 336: 172, 337: 172, 338: 178, 339: 185, 340: 195, 341: 195, 342: 229, 343: 229, 344: 276, 345: 304, 346: 339, 347: 339, 348: 413, 349: 413, 350: 468, 351: 468, 352: 515, 353: 515, 354: 550, 355: 550, 356: 585, 357: 585, 358: 600, 359: 600 };
    const cometAt = (f) => {
        const x = COMET_X[Math.max(336, Math.min(359, f))], d = x - 172;
        return [x, 205 - 0.2373 * d + 0.0001752 * d * d];
    };

    // ------------------------------------------------------------------ stars and crosses
    // [x, y, settled size, frame it pops in (null = there from the start)]. A star pops in
    // for two frames 1.5× bigger with four yellow ticks round it, then settles; a cross
    // pops in white and big, then settles cream. Pops fall on threes (339, 342, 345…).
    const STARS = [
        [315, 142, 30, null], [602, 327, 36, null], [853, 457, 46, null], [157, 550, 43, null],
        [79, 85, 34, 336], [920, 89, 29, 336], [65, 917, 25, 336], [926, 926, 32, 336],
        [222, 37, 18, 339], [962, 305, 19, 339], [249, 809, 34, 339],
        [787, 37, 23, 342], [33, 389, 20, 342],
        [845, 620, 27, 345], [967, 648, 25, 345], [37, 667, 18, 345],
        [278, 967, 20, 348], [722, 969, 18, 348], [430, 229, 22, 348],
        [138, 231, 14, 351], [889, 796, 16, 351], [681, 106, 31, 352],
        [861, 185, 17, 354], [118, 367, 23, 354], [110, 796, 17, 354],
        [499, 28, 17, 357], [593, 972, 15, 357],
    ];
    const CROSSES = [
        [116, 700, 26, null], [349, 701, 30, null], [232, 552, 30, 336],
        [768, 601, 44, 340], [883, 250, 30, 340], [138, 389, 36, 345], [833, 759, 38, 348], [389, 833, 36, 351], [861, 407, 44, 354], [306, 120, 34, 358, 1],
    ];
    // one hand-cut star per index: five soft points, none quite the same
    function starSprite(i) {
        return WL.sprite('th-star' + i, { x: -26, y: -26, w: 52, h: 52 }, (c) => {
            const r = P.rng('star' + i), rot = r() * Math.PI * 2, pts = [];
            for (let k = 0; k < 10; k++) {
                const a = rot + (k * Math.PI) / 5 + (r() - 0.5) * 0.12, rr = (k % 2 ? 11.4 : 21) * (1 + (r() - 0.5) * 0.14);
                pts.push([Math.cos(a) * rr, Math.sin(a) * rr]);
            }
            cut(c, D.spline(pts, 5), COL.star, 'star' + i, { border: 1.9, borderVar: 0.4, jag: 0.6, shadow: 0.1, paper: COL.edge, tex: { angle: -0.6, angleVar: 0.2, len: [8, 20], h: [2, 4], lVar: 5, alpha: [0.25, 0.5] } });
        }, 2.4);
    }
    function drawStar(g, i, x, y, size, ticks) {
        g.save();
        g.translate(x, y);
        g.scale(size / 40, size / 40);
        starSprite(i).draw(g);
        g.restore();
        if (!ticks) return;
        const r = P.rng('startick' + i), a0 = r() * Math.PI;
        g.save();
        g.strokeStyle = COL.tick;
        g.lineCap = 'round';
        g.lineWidth = size * 0.12;
        for (let k = 0; k < 4; k++) {
            const a = a0 + (k * Math.PI) / 2 + (r() - 0.5) * 0.3, r0 = size * (0.92 + r() * 0.12), r1 = size * (1.38 + r() * 0.14);
            g.beginPath();
            g.moveTo(x + Math.cos(a) * r0, y + Math.sin(a) * r0);
            g.lineTo(x + Math.cos(a) * r1, y + Math.sin(a) * r1);
            g.stroke();
        }
        g.restore();
    }
    function drawCross(g, i, x, y, size, pop) {
        const r = P.rng('cross' + i), h = size / 2;
        const col = pop ? COL.white : COL.cross, w = size * (pop ? 0.12 : 0.125);
        const tilt = (r() - 0.5) * 0.08, dx = (r() - 0.5) * size * 0.08, dy = (r() - 0.5) * size * 0.08;
        P.markerStroke(g, [[x - h, y + dy], [x + h, y + dy + tilt * size]], col, w, 'crossh' + i, 0.95);
        P.markerStroke(g, [[x + dx, y - h], [x + dx - tilt * size, y + h]], col, w, 'crossv' + i, 0.95);
    }

    // ------------------------------------------------------------------ the object
    Things.stars = (g, x, y, s, t) => {
        if (t >= 16) {
            // the heart: the ringed planet alone, a little more tilted
            place(g, 'th-saturn-h', SATURN_BOX, (c) => drawSaturn(c, true), x, y, s, -0.09, 0.5);
            return;
        }
        const f = frameOf(t);
        place(g, 'th-space', { x: -452, y: -452, w: 904, h: 904 }, drawDisc, x, y, s, 0, 1.15);
        place(g, 'th-saturn', SATURN_BOX, drawSaturn, x + (SX - AX) * s, y + (SY - AY) * s, s, 0, 1.15);
        const [cx, cy] = cometAt(f);
        place(g, 'th-comet', { x: -275, y: -42, w: 315, h: 84 }, drawComet, x + (cx - AX) * s, y + (cy - AY) * s, s, -0.12, 1.15);
        g.save();
        g.translate(x, y);
        g.scale(s, s);
        g.translate(-AX, -AY);
        STARS.forEach(([sx, sy, size, at, len = 2], i) => {
            if (at !== null && f < at) return;
            const pop = at !== null && f < at + len;
            drawStar(g, i, sx, sy, pop ? size * 1.5 : size, pop);
        });
        CROSSES.forEach(([cx2, cy2, size, at, len = 2], i) => {
            if (at !== null && f < at) return;
            const pop = at !== null && f < at + len;
            drawCross(g, i, cx2, cy2, pop ? size * 1.45 : size, pop);
        });
        g.restore();
    };
})();
