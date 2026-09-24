// Montage object «sea» (see ../things.js for the contract).
// A folded newspaper boat on a torn sea cut from nautical charts: a light-blue back layer and
// a dark-blue front wave whose crests break to the right with white foam curls, contour
// lines, a rose of contours and red dashed routes printed on them. The boat rocks, the waves
// roll (replacement drawings of both layers, the chart sliding under them), splash arcs fly
// out at the sides (11.25–11.33 s), two birds hang top right.
// Measured on the reference (11.083–11.417 s) in "crop pixels" of the crop 400,440 at 2160 px
// and converted to logical units around (500, 640): the card draws it at s = 1.
// part: undefined = everything, 'back' = light-blue sea, sail, mast and flag (behind the
// flower), 'front' = hull and wings, dark wave, splashes and birds (in front of it).
(() => {
    const P = Paper, D = PaperDetail;
    const { place, cut } = Things.kit;
    const O = [500, 640];
    const lgc = ([a, b]) => [(400 + a) / 2.16, (440 + b) / 2.16];
    const rel = (o) => (pts) => pts.map((p) => {
        const [x, y] = lgc(p);
        return [x - o[0], y - o[1]];
    });
    const R = rel(O);
    const BP = [513.9, 411]; // boat pivot: between the wing tips
    const B = rel(BP);
    const COL = {
        dark: '#3469a2', light: '#8ac6de', paper: '#ece9e0', ink: '#96938c', photo: '#7c7975', flag: '#c5383f', mast: '#4a4450',
        route: '#c2404b', contourD: '#6a9bd4', contourL: '#5f98c3', foam: '#f4f1ea', bird: '#3a3042', splash: '#f3ecdc',
    };
    const EDGE = { border: 3.4, shadow: 0.13 };

    // --- printed textures ----------------------------------------------------------------------
    // rows of grey word-dashes between x0 and x1
    function dashes(c, x0, x1, y0, y1, seed, o = {}) {
        const r = P.rng(seed), lh = o.lineH ?? 8.3, dh = o.dashH ?? 3;
        c.fillStyle = o.ink ?? COL.ink;
        for (let y = y0; y < y1; y += lh) {
            for (let x = x0 + r() * 3; x < x1 - 2; ) {
                const w = Math.min(x1 - x, 4 + r() * 14);
                c.globalAlpha = 0.8 + r() * 0.2;
                c.fillRect(x, y, w, dh);
                x += w + 2.6 + r() * 1.5;
            }
        }
        c.globalAlpha = 1;
    }
    // a wobbly closed contour ring (hand-drawn chart lines)
    function ring(c, cx, cy, rr, seed, sq = 1) {
        const r = P.rng(seed), n = 9;
        c.beginPath();
        const pts = D.spline(Array.from({ length: n }, (_, i) => {
            const a = (i / n) * Math.PI * 2, k = 1 + (r() - 0.5) * 0.28;
            return [cx + Math.cos(a) * rr * k, cy + Math.sin(a) * rr * k * sq];
        }), 6);
        P.tracePath(c, pts);
        c.stroke();
    }
    function line(c, pts, n = 6) {
        const sp = D.spline(pts, n, false);
        c.beginPath();
        c.moveTo(...sp[0]);
        for (const p of sp) c.lineTo(...p);
        c.stroke();
    }
    function route(c, pts) {
        c.save();
        c.strokeStyle = COL.route;
        c.lineWidth = 1.3;
        c.setLineDash([4.6, 4.2]);
        c.lineCap = 'butt';
        c.globalAlpha = 0.9;
        line(c, pts);
        c.restore();
    }
    // chart printed on the dark wave; `v` = where the sheet sits (the texture slides per drawing)
    const ROSES = [[[443, 648], [386, 712]], [[755, 652]], [[755, 652]], [[482, 742]], [[645, 610], [265, 690]], [[514, 682], [730, 648]]];
    const PROFILE_DX = [-30, 0, 0, 20, -15, 10];
    function darkChart(c, v) {
        const L = (x, y) => [x - O[0], y - O[1]];
        c.save();
        c.lineCap = 'round';
        c.lineJoin = 'round';
        c.strokeStyle = COL.contourD;
        c.globalAlpha = 0.75;
        c.lineWidth = 1.25;
        // the long profile line across the wave
        const dx = PROFILE_DX[v];
        line(c, [[30, 905], [150, 940], [250, 968], [350, 1025], [400, 1010], [475, 955], [525, 968], [565, 1040], [610, 1062], [650, 960], [690, 890], [760, 878], [830, 882], [880, 960], [935, 1040], [1000, 1045], [1080, 1040], [1150, 960], [1220, 900]].map(([a, b]) => {
            const [x, y] = lgc([a + dx, b]);
            return L(x, y);
        }));
        // roses of contours
        ROSES[v].forEach(([x, y], k) => {
            c.globalAlpha = 0.7;
            [9, 18.5, 30, 42, 56, 72].forEach((rr, i) => ring(c, ...L(x + i * 1.5, y - i * 0.8), rr, 'rose' + v + k + i, 0.82));
        });
        // faint loops by the first crest
        c.globalAlpha = 0.28;
        [10, 20, 30].forEach((rr, i) => ring(c, ...L(...lgc([470, 790])), rr * 1.3, 'crestl' + i, 0.45));
        // red routes just under the crests
        route(c, [[30, 902], [100, 890], [165, 862]].map((p) => L(...lgc(p))));
        route(c, [[420, 752], [460, 744], [495, 737]].map((p) => L(...lgc(p))));
        route(c, [[650, 790], [690, 815], [725, 830], [770, 815], [805, 790], [860, 747]].map((p) => L(...lgc(p))));
        route(c, [[1100, 790], [1135, 835], [1185, 878], [1250, 872]].map((p) => L(...lgc(p))));
        c.restore();
    }
    function lightChart(c) {
        const L = (p) => {
            const [x, y] = lgc(p);
            return [x - O[0], y - O[1]];
        };
        c.save();
        c.lineCap = 'round';
        c.strokeStyle = COL.contourL;
        c.lineWidth = 1.1;
        c.globalAlpha = 0.8;
        // contour loops on the left and right slopes
        [14, 28, 44, 62, 82, 104].forEach((rr, i) => ring(c, ...L([380 - i * 6, 740 + i * 4]), rr, 'lc' + i, 0.6));
        [20, 40, 62].forEach((rr, i) => ring(c, ...L([1210, 700]), rr, 'lr' + i, 0.8));
        // a road across the chart
        c.lineWidth = 2;
        c.globalAlpha = 0.7;
        c.strokeStyle = '#5b8db8';
        line(c, [[160, 742], [240, 760], [290, 790], [345, 818]].map(L));
        line(c, [[1170, 720], [1190, 700], [1230, 760], [1255, 810]].map(L));
        c.restore();
        route(c, [[1085, 595], [1110, 625], [1140, 655]].map(L));
    }

    // --- pieces ------------------------------------------------------------------------------------
    // The waves are replacement drawings, as in the reference: four cuts of each layer (every
    // one cut once and cached), their crests traced on the reference frame by frame.
    const LG = (pts) => pts.map(([x, y]) => [x - O[0], y - O[1]]);
    const LIGHT = [
        [[231, 600], [240, 575], [262, 548], [290, 530], [320, 520], [352, 500], [380, 490], [420, 478], [500, 470], [600, 470], [660, 468], [688, 462], [702, 456], [713, 498], [741, 532], [768, 560], [796, 588], [801, 615]],
        [[204, 612], [225, 570], [245, 532], [280, 505], [335, 490], [420, 480], [500, 478], [600, 480], [676, 496], [720, 503], [752, 514], [780, 532], [800, 552], [815, 575], [825, 600], [826, 628]],
        [[222, 600], [245, 560], [265, 530], [281, 505], [320, 495], [380, 488], [460, 485], [560, 488], [640, 492], [700, 500], [759, 514], [775, 550], [794, 590], [800, 620]],
        [[222, 612], [235, 560], [245, 518], [280, 505], [340, 502], [384, 501], [460, 495], [560, 488], [648, 482], [690, 476], [724, 472], [750, 500], [787, 549], [810, 590], [828, 625]],
    ];
    const DARK = [
        [[204, 619], [222, 609], [241, 598], [250, 601], [259, 606], [287, 606], [306, 600], [333, 588], [352, 576], [370, 559], [389, 541], [398, 536], [407, 533], [412, 527], [415, 540], [417, 556], [426, 559], [440, 567], [463, 572], [486, 571], [500, 563], [528, 550], [546, 535], [565, 528], [572, 522], [576, 518], [579, 534], [583, 550], [602, 568], [620, 580], [648, 583], [676, 575], [699, 567], [722, 555], [733, 550], [738, 558], [745, 575], [759, 600], [778, 617], [806, 624], [824, 628]],
        [[204, 630], [222, 623], [241, 616], [250, 602], [269, 586], [287, 571], [298, 566], [302, 570], [306, 582], [324, 584], [352, 589], [380, 582], [398, 571], [417, 556], [435, 539], [454, 530], [463, 519], [468, 516], [470, 535], [472, 553], [491, 559], [509, 571], [537, 572], [556, 568], [574, 561], [593, 550], [611, 535], [625, 530], [632, 520], [635, 538], [639, 555], [657, 571], [676, 585], [704, 592], [731, 592], [759, 582], [778, 575], [789, 573], [792, 588], [796, 602], [806, 616], [824, 629]],
        [[204, 632], [222, 628], [241, 622], [259, 607], [278, 591], [296, 578], [315, 563], [324, 553], [328, 552], [331, 563], [333, 574], [352, 576], [380, 582], [398, 579], [426, 569], [444, 556], [463, 540], [481, 529], [491, 519], [495, 517], [498, 534], [500, 551], [519, 563], [546, 571], [565, 574], [583, 573], [602, 565], [620, 553], [639, 537], [657, 526], [662, 524], [665, 542], [667, 561], [685, 589], [713, 599], [741, 604], [770, 605], [800, 606], [824, 619]],
        [[204, 629], [213, 616], [241, 614], [269, 613], [296, 607], [315, 590], [333, 574], [352, 557], [370, 544], [380, 542], [385, 542], [387, 552], [389, 563], [407, 568], [435, 575], [463, 572], [491, 562], [509, 545], [528, 533], [546, 528], [551, 518], [554, 534], [556, 550], [574, 563], [602, 577], [630, 578], [648, 574], [667, 565], [685, 558], [704, 544], [710, 543], [713, 549], [722, 573], [741, 596], [759, 611], [778, 617], [806, 623], [824, 626]],
    ];
    const DARK_BOTTOM = [[829, 632], [833, 652], [815, 663], [796, 666], [778, 676], [759, 684], [741, 694], [722, 702], [704, 706], [685, 713], [667, 717], [648, 725], [630, 731], [611, 735], [593, 735], [574, 737], [556, 739], [537, 742], [519, 744], [500, 741],
        [481, 738], [463, 738], [444, 733], [426, 730], [407, 729], [389, 724], [370, 718], [352, 709], [333, 703], [315, 700], [296, 694], [278, 687], [259, 678], [241, 669], [222, 663], [204, 656], [200, 640]];
    const CRESTS = [[[412, 527, 1], [576, 518, 1], [733, 550, 0.9]], [[300, 566, 0.9], [468, 516, 1], [632, 520, 1], [790, 573, 0.85]], [[328, 552, 0.9], [495, 517, 1], [662, 524, 1]], [[385, 542, 1], [551, 518, 1], [710, 543, 0.95]]];
    // step (0–5) → drawing (0–3); outside the card the first drawing
    const DRAWING = [0, 0, 0, 1, 2, 3];
    function lightSea(c, v) {
        cut(c, LG([...LIGHT[v], [800, 650], [520, 655], [230, 640]]), COL.light, 'sea-light' + v, { ...EDGE, tex: { alpha: [0.18, 0.4] }, inner: lightChart });
    }
    // a crest is a narrow rounded hump with a steep front (the traced tip, smoothed)
    function capCrests(pts, crests) {
        let out = pts;
        for (const [px, py] of crests) {
            const i = out.findIndex(([x]) => x > px - 7);
            out = [...out.slice(0, i), [px - 8, py + 4], [px - 4, py + 0.5], [px + 1, py], [px + 4, py + 3], [px + 6, py + 12], ...out.slice(i).filter(([x]) => x >= px + 7)];
        }
        return out;
    }
    function darkSea(c, v, tex) {
        cut(c, LG([...capCrests(DARK[v], CRESTS[v]), ...DARK_BOTTOM]), COL.dark, 'sea-dark' + v, { ...EDGE, border: 3.6, tex: { alpha: [0.15, 0.35] }, inner: (cc) => darkChart(cc, tex) });
        // foam curls over the crests (an arch on the back slope, over the tip)
        for (const [k, [px, py, sc]] of CRESTS[v].entries()) {
            const pts = D.spline(LG([[-34, 20], [-24, 3], [-9, -4], [4, 2], [8, 22]].map(([a, b]) => [px + a * sc, py + b * sc])), 6, false);
            P.markerStroke(c, pts, COL.foam, 5.6, 'foam' + v + k, 0.88);
            P.markerStroke(c, pts.map(([x, y]) => [x + 0.8, y + 0.6]), '#ffffff', 2, 'foamh' + v + k, 0.5);
        }
    }
    // the boat's back: the sail triangle (its print, two photos), mast and flag (behind the flower)
    function boatBack(c, withFlag) {
        const inner = (cc) => {
            cc.save();
            const [x0] = B([[480, 0]])[0], [x1] = B([[1000, 0]])[0], [, y0] = B([[0, 210]])[0], [, y1] = B([[0, 600]])[0];
            dashes(cc, x0, x1, y0, y1, 'sail');
            cc.fillStyle = COL.photo;
            cc.globalAlpha = 0.9;
            for (const [a, b] of [[[640, 360], [700, 385]], [[745, 360], [805, 385]], [[610, 470], [690, 492]]]) {
                const [p, q] = B([a, b]);
                cc.fillRect(p[0], p[1], q[0] - p[0], q[1] - p[1]);
            }
            cc.restore();
        };
        cut(c, B([[707, 207], [772, 300], [836, 400], [900, 560], [800, 572], [640, 572], [545, 560], [604, 400], [652, 300]]), COL.paper, 'boat-sail', { ...EDGE, tex: { alpha: [0.05, 0.14] }, inner });
        if (!withFlag) return;
        const [m0, m1] = B([[734, 48], [706, 214]]);
        c.strokeStyle = COL.mast;
        c.lineWidth = 2.4;
        c.lineCap = 'round';
        c.beginPath();
        c.moveTo(...m0);
        c.lineTo(...m1);
        c.stroke();
        cut(c, B([[733, 56], [800, 76], [876, 100], [806, 116], [742, 130]]), COL.flag, 'boat-flag', { border: 2.2, shadow: 0.1, tex: { alpha: [0.2, 0.4] } });
    }
    // the boat's front: hull, the two folded tips, crease and print
    function boatFront(c) {
        const hullPts = B([[420, 570], [560, 573], [710, 576], [860, 579], [995, 582.5], [995, 660], [995, 735], [860, 730], [710, 724], [560, 717.5], [380, 710], [400, 640]]);
        cut(c, hullPts, COL.paper, 'boat-hull', {
            ...EDGE, tex: { alpha: [0.05, 0.14] }, inner: (cc) => {
                const cols = [[425, 552], [568, 702], [718, 852], [868, 988]];
                cols.forEach(([a, b], k) => {
                    const [[x0, y0], [x1, y1]] = B([[a, 587], [b, 740]]);
                    dashes(cc, x0, x1, y0 + (k === 0 ? 16 : 0), y1, 'hull' + k);
                });
                const [p, q] = B([[420, 582.5], [550, 615]]);
                cc.fillStyle = COL.photo;
                cc.globalAlpha = 0.95;
                cc.fillRect(p[0], p[1], q[0] - p[0], q[1] - p[1]);
                cc.globalAlpha = 1;
                const [a, b] = B([[425, 585], [500, 700]]);
                cc.strokeStyle = 'rgba(80,76,72,0.8)';
                cc.lineWidth = 1.4;
                cc.beginPath();
                cc.moveTo(...a);
                cc.lineTo(...b);
                cc.stroke();
            },
        });
        const wing = (pts, seed) => cut(c, B(pts), COL.paper, seed, {
            ...EDGE, tex: { alpha: [0.05, 0.14] }, inner: (cc, box) => dashes(cc, box.x + 3, box.x + box.w - 3, box.y + 4, box.y + box.h, seed + 'd', { lineH: 9.5, dashH: 3.2 }),
        });
        wing([[285, 417.5], [350, 490], [420, 567.5], [425, 600], [385, 710], [367.5, 702.5], [340, 615], [310, 515]], 'boat-wingL');
        wing([[1122.5, 472.5], [1105, 540], [1085, 600], [1060, 670], [1032.5, 735], [995, 735], [995, 590], [1030, 580], [1080, 515]], 'boat-wingR');
    }

    // six drawings on twos (11.0 → 11.417): the boat rocks [dx, dy, rotation°] about its pivot
    const BOAT = [[0, 0, 0], [0, 0, 0], [0, 0, 0], [-4.6, 5.7, -3.3], [-9.3, -6, -7], [-7, -12, -3]];
    const SPLASH = [null, null, null,
        [[[167.6, 541.7], [179.4, 513.9], [203.7, 494.8], [235, 488]], [[801, 489.6], [831, 496.5], [851.4, 513.9], [866.9, 541.7]]],
        [[[151.6, 533.3], [162, 506.9], [186.3, 488.2], [217.6, 480.6]], [[818.3, 480.6], [853, 489.6], [873.8, 506.9], [884.3, 534.7]]], null];
    const BIRDS = [[[706.5, 248.1], [731.5, 268.5], [759.3, 248.1]], [[770.4, 305.6], [787, 317.6], [805.6, 303.7]]];

    Things.sea = (g, x, y, s, t, part) => {
        const card = t >= 11 && t < 11.5;
        const step = card ? Math.max(0, Math.min(5, Math.floor((t - 11) * 12 + 1e-6))) : 1;
        const at = ([a, b]) => [x + (a - O[0]) * s, y + (b - O[1]) * s];
        const [bdx, bdy, brd] = BOAT[step];
        const [bx, by] = at([BP[0] + bdx, BP[1] + bdy]);
        const boatBox = { x: -205, y: -195, w: 405, h: 340 };
        if (part !== 'front') {
            const lv = DRAWING[step];
            place(g, 'th-sea-light' + lv, { x: -305, y: -195, w: 665, h: 220 }, (c) => lightSea(c, lv), x, y, s, 0, 1.2);
            place(g, 'th-sea-back' + (card ? 'f' : ''), boatBox, (c) => boatBack(c, card), bx, by, s, (brd * Math.PI) / 180, 1.2);
        }
        if (part === 'back') return;
        place(g, 'th-sea-boat', boatBox, boatFront, bx, by, s, (brd * Math.PI) / 180, 1.2);
        const dv = DRAWING[step], tv = card ? [0, 1, 1, 3, 4, 5][step] : 1;
        place(g, 'th-sea-dark' + dv + '-' + tv, { x: -310, y: -135, w: 655, h: 250 }, (c) => darkSea(c, dv, tv), x, y, s, 0, 1.2);
        if (!card) return;
        if (SPLASH[step]) for (const [k, arc] of SPLASH[step].entries()) P.markerStroke(g, D.spline(arc, 5, false).map(at), COL.splash, 5.5 * s, 'splash' + k, 0.95);
        for (const [k, b] of BIRDS.entries()) P.markerStroke(g, b.map(at), COL.bird, 4.2 * s, 'bird' + k, 0.95);
    };
})();
