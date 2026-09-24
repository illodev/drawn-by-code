// Card «cello» (reference 12.375–12.5 s, full frame): a cello close up, tilted. Measured in
// reference pixels (1080 frame, the 12.417 s frame) with colour-run scans and 2.5× grid crops:
//   ground     olive black (yellow + navy solids, blue, a little pink), blotchy, with red
//              brush lines and specks
//   body       red (yellow + a nearly full pink screen) with navy dots and wood grain, a
//              yellow highlight band along the strings (the pink thins to dots), a dark rim
//              inside the red purfling
//   purple     the next instrument's bout: pink solid with navy/blue dots, a navy outline
//              and a pink rim, a shadow under it
//   fingerboard dotted yellow strips and two dark bars; f-holes as tapered brush strokes
//              with round ends; the bridge (yellow top, pink-dotted front) and its shadow;
//              four strings (bent over the bridge) ending on the tailpiece
//   overlays   a thin navy circle round the dot and the white ring from the cut
// Uses G5 (cards/_g5-util.js).
var CARDS = CARDS || {};
CARDS.cello = (press, t) => {
    const U = G5, T = Riso.tone, d = Math.floor(t * 12 + 1e-6);
    const Y = press.plate('yellow'), P = press.plate('pink'), B = press.plate('blue'), N = press.plate('navy');
    const YS = press.plate('yellow', 'screen'), PS = press.plate('pink', 'screen'), BS = press.plate('blue', 'screen'), NS = press.plate('navy', 'screen');
    const DARK = [[Y, 1], [N, 0.95], [B, 0.55], [P, 0.18]];
    U.px(press, () => {
        // ---------------------------------------------------------------- the ground
        for (const [g, v] of DARK) { g.fillStyle = T(v); g.fillRect(0, 0, 1080, 1080); }
        // blotchy: greener patches (more blue, less navy), brown ones (pink)
        U.blotch(B, 'cg-b', [0, 250, 330, 1080], 14, 60, 150, 0.1, 0.35);
        U.cut([N], (g) => U.blotch(g, 'cg-n', [0, 300, 330, 1080], 10, 60, 140, 0.1, 0.3));
        U.blotch(P, 'cg-p', [0, 300, 330, 1080], 8, 40, 110, 0.1, 0.3);
        // the purfling: the left edge of the body, a red brush line on the dark
        const edge = [[-6, 138], [20, 200], [45, 245], [75, 283], [110, 303], [150, 318], [190, 335], [222, 357], [246, 386], [266, 425], [284, 475], [300, 530], [316, 575], [326, 620], [319, 655], [302, 686], [282, 708], [260, 726], [242, 747], [233, 775], [229, 810], [231, 860], [237, 910], [245, 960], [253, 995], [263, 1040], [272, 1090]];
        const inner = edge.map(([x, y]) => [x + 13, y + (y < 330 ? -4 : 0)]);
        const body = inner.concat([[1090, 1090], [1090, -10], [-10, -10]]);
        const bodyPath = (g) => { g.beginPath(); U.smooth(g, body); };
        // ---------------------------------------------------------------- the body
        U.cut([N, B, P], (g) => { bodyPath(g); g.fill(); });
        // pink: a nearly full screen, thinning to dots in the highlight band along the strings
        U.clipped(PS, body, true, (g) => {
            g.fillStyle = T(0.95); g.fillRect(0, 0, 1080, 1080);
            g.globalCompositeOperation = 'destination-out';
            const band = [[272, -30], [298, 100], [350, 200], [412, 300], [455, 400], [468, 480], [478, 600], [470, 700], [480, 800], [515, 900], [548, 990], [578, 1100]];
            const bw = (s) => 250 - 330 * Math.min(1, s * 2.2) * (s < 0.45 ? 1 : 0.9) + (s > 0.6 ? (s - 0.6) * 180 : 0);
            U.soft(g, 16, (c) => U.brush(c, band, (s) => Math.max(70, bw(s)), T(0.62), 'cband', { taper: 0, wob: 0.08 }));
            U.soft(g, 8, (c) => U.brush(c, band.map(([x, y]) => [x + 4, y]), (s) => Math.max(34, bw(s) * 0.45), T(0.35), 'cband2', { taper: 0, wob: 0.1 }));
        });
        // navy: sparse dots over the red, a dark rim inside the purfling, grain
        U.clipped(NS, body, true, (g) => {
            g.fillStyle = T(0.13); g.fillRect(0, 0, 1080, 1080);
            U.soft(g, 12, (c) => U.brush(c, inner.slice(0, 16).map(([x, y]) => [x + 22, y + 6]), 62, T(0.55), 'crim', { taper: 0 }));
            U.soft(g, 10, (c) => U.brush(c, inner.slice(14).map(([x, y]) => [x + 20, y]), 44, T(0.6), 'crim2', { taper: 0 }));
            // under the purple bout, a shadow
            U.soft(g, 14, (c) => { c.fillStyle = T(0.75); c.beginPath(); U.smooth(c, [[870, 470], [950, 462], [1090, 470], [1090, 650], [1040, 610], [995, 548], [950, 575], [915, 505]]); c.fill(); });
        });
        U.clipped(N, body, true, (g) => U.hatch(g, 'cgrain', [0, 0, 1080, 1080], [0.44, 1], 34, 2.2, T(0.7), { bend: 8 }));
        // ---------------------------------------------------------------- the purple bout
        const purple = [[708, -20], [690, 50], [676, 110], [672, 160], [678, 215], [694, 265], [718, 310], [748, 352], [782, 392], [822, 425], [862, 446], [905, 450], [950, 452], [1000, 470], [1050, 468], [1100, 470], [1100, -20]];
        press.knockout((g) => { g.beginPath(); U.smooth(g, purple); g.fill(); });
        U.fill(P, purple, T(0.97), true);
        U.clipped(YS, purple, true, (g) => { g.fillStyle = T(0.3); g.fillRect(600, 0, 480, 520); });
        U.clipped(NS, purple, true, (g) => { g.fillStyle = U.lin ? T(0.3) : T(0.3); g.fillRect(600, 0, 480, 520); g.globalCompositeOperation = 'destination-out'; U.glow(g, 1060, 30, 220, 0.8, 0); });
        U.clipped(BS, purple, true, (g) => { g.fillStyle = T(0.18); g.fillRect(600, 0, 480, 520); });
        // its outline: a navy brush line, then a pink rim inside
        const rim = purple.slice(0, 16);
        U.brush(N, rim, 11, T(0.95), 'cpo', { taper: 0 });
        U.brush(Y, rim, 11, T(0.8), 'cpo2', { taper: 0 });
        const rimIn = rim.map(([x, y], i) => [x + 9, y - (i > 8 ? 9 : 3)]);
        U.cut([N, NS, BS, YS], (g) => U.brush(g, rimIn, 7, '#000', 'cpi', { taper: 0 }));
        // a red line inside the bout (its purfling)
        U.brush(Y, [[860, 40], [930, 110], [985, 190], [1030, 270], [1080, 345]], 5, T(0.8), 'cpp', { taper: 0.2 });
        // ---------------------------------------------------------------- fingerboard
        const fb = [[290, -10], [402, -10], [470, 178], [448, 190], [352, 213]];
        U.cut([P, PS, N, NS], (g) => { g.beginPath(); U.trace(g, fb); g.fill(); });
        U.clipped(NS, fb, false, (g) => { g.fillStyle = T(0.3); g.fillRect(250, 0, 260, 230); });
        U.clipped(PS, fb, false, (g) => { g.fillStyle = T(0.2); g.fillRect(250, 0, 260, 230); });
        const bar = (pts, w) => { for (const [g, v] of [[N, 0.95], [B, 0.4]]) U.brush(g, pts, w, T(v), 'cfb' + w, { taper: 0, wob: 0.05 }); };
        bar([[339, -10], [360, 100], [380, 206]], 14);
        bar([[382, -10], [413, 90], [454, 182]], 27);
        bar([[294, -10], [318, 100], [346, 210]], 5);
        // ---------------------------------------------------------------- f-holes
        const fhole = (pts, r0, r1, seed) => {
            for (const [g, v] of [[N, 0.95], [B, 0.5]]) {
                U.brush(g, pts, (s) => 17 - 6 * Math.sin(Math.PI * s), T(v), seed, { taper: 0, wob: 0.1 });
                g.fillStyle = T(v);
                g.beginPath(); g.arc(pts[0][0], pts[0][1], r0, 0, 7); g.fill();
                const e = pts[pts.length - 1]; g.beginPath(); g.arc(e[0], e[1], r1, 0, 7); g.fill();
            }
            U.cut([PS, NS], (g) => { g.beginPath(); g.arc(pts[0][0], pts[0][1], r0, 0, 7); g.fill(); });
        };
        // a yellow highlight beside the right f-hole
        U.cut([PS, NS, N], (g) => U.brush(g, [[562, 222], [578, 270], [600, 325], [632, 385], [672, 440], [722, 505], [768, 570], [800, 630], [815, 670]], 7, '#000', 'cfy', { taper: 0.2 }));
        fhole([[320, 290], [345, 322], [372, 362], [396, 410], [414, 465], [424, 530], [428, 600], [436, 680], [452, 750], [478, 800], [505, 838]], 22, 27, 'cfl');
        fhole([[553, 188], [566, 222], [582, 268], [604, 320], [634, 378], [672, 432], [720, 495], [765, 560], [800, 620], [818, 660], [830, 695]], 22, 27, 'cfr');
        // ---------------------------------------------------------------- bridge
        const sh = [[468, 612], [560, 578], [650, 548], [716, 526], [724, 548], [700, 570], [610, 598], [520, 628], [478, 642]];
        for (const [g, v] of [[N, 0.95], [B, 0.45]]) U.fill(g, sh, T(v), true);
        U.cut([P, PS, NS, N], (g) => { g.beginPath(); U.smooth(g, sh); g.fill(); });
        const bridge = [[446, 594], [470, 568], [505, 540], [545, 522], [590, 504], [635, 488], [672, 478], [694, 485], [700, 505], [688, 520], [650, 535], [600, 552], [548, 570], [505, 590], [478, 612], [456, 614]];
        press.knockout((g) => { g.beginPath(); U.smooth(g, bridge); g.fill(); });
        U.fill(Y, bridge, T(1), true);
        for (const [g, v] of [[N, 0.9], [B, 0.4]]) U.brush(g, bridge.concat([bridge[0]]), 4, T(v), 'cbo', { taper: 0 });
        // the front face: pink dots on the lower part
        U.clipped(PS, bridge, true, (g) => { g.fillStyle = T(0.4); g.beginPath(); U.trace(g, [[440, 600], [540, 555], [700, 500], [710, 530], [460, 630]]); g.fill(); });
        // ---------------------------------------------------------------- tailpiece
        const tail = [[600, 824], [720, 772], [790, 758], [812, 830], [834, 900], [852, 960], [870, 1030], [884, 1090], [742, 1090], [712, 1020], [678, 950], [640, 882]];
        U.cut([P, PS, NS], (g) => { g.beginPath(); U.trace(g, tail); g.fill(); });
        for (const [g, v] of [[N, 0.95], [B, 0.6], [P, 0.2]]) U.fill(g, tail, T(v));
        U.blotch(B, 'ctb', [640, 780, 880, 1080], 5, 40, 90, 0.1, 0.3);
        // the fret line and the tail gut: yellow
        press.knockout((g) => U.brush(g, [[612, 830], [700, 795], [770, 768]], 5, '#000', 'cfr1', { taper: 0.1 }));
        press.knockout((g) => U.brush(g, [[628, 842], [680, 950], [714, 1020], [744, 1090]], 8, '#000', 'cgut', { taper: 0 }));
        U.brush(Y, [[628, 842], [680, 950], [714, 1020], [744, 1090]], 8, T(1), 'cgut', { taper: 0 });
        U.brush(Y, [[612, 830], [700, 795], [770, 768]], 5, T(1), 'cfr1', { taper: 0.1 });
        // ---------------------------------------------------------------- strings
        const shv = [0, 1][d % 2];
        const above = [505, 552, 601, 648], below = [527, 570, 615, 656], ends = [[636, 834], [673, 821], [707, 808], [742, 796]];
        for (let i = 0; i < 4; i++) {
            const top = [above[i] + 0.47 * (-20 - 450) + shv, -20], atB = [above[i] + 0.47 * (500 - 450), 500 + i * -8 + 20];
            const up = [top, [(top[0] + atB[0]) / 2, (top[1] + atB[1]) / 2], atB];
            const lo = [[below[i] + 0.475 * (560 - 600), 560 - i * 8], [(below[i] + ends[i][0] + 0.475 * (560 - 600)) / 2, (560 - i * 8 + ends[i][1]) / 2], ends[i]];
            for (const seg of [up, lo]) {
                press.knockout((g) => U.brush(g, seg, 8, '#000', 'cs' + i, { taper: 0, wob: 0.05 }));
                U.brush(Y, seg, 8, T(1), 'cs' + i, { taper: 0, wob: 0.05 });
                U.brush(N, seg.map(([x, y]) => [x + 5, y - 1]), 2.2, T(0.8), 'csd' + i, { taper: 0.1, wob: 0.2 });
            }
            for (const [g, v] of [[B, 0.9], [Y, 1]]) { g.fillStyle = T(v); g.beginPath(); g.arc(ends[i][0], ends[i][1], 6, 0, 7); g.fill(); }
        }
        // ---------------------------------------------------------------- ground lines
        const red = (pts, w, seed) => { U.cut([N, B], (g) => U.brush(g, pts, w, '#000', seed)); U.brush(P, pts, w, T(0.95), seed); };
        red(edge, 9, 'cpurf');
        red([[-4, 572], [30, 630], [70, 700], [112, 775], [160, 856]], 8, 'cr1');
        red([[-4, 815], [40, 860], [104, 932]], 7, 'cr2');
        red([[-4, 955], [22, 978], [52, 1003]], 6, 'cr3');
        U.speckle(P, 'cspk', 40, 0, 250, 330, 1080, 1.5, 3, T(0.9));
        U.speckle(B, 'cspk2', 25, 0, 250, 330, 1080, 1.5, 2.5, T(0.9));
        // ---------------------------------------------------------------- overlays
        for (const [g, v] of [[N, 0.9]]) { g.save(); g.strokeStyle = T(v); g.lineWidth = 2.5; g.beginPath(); g.arc(540, 540, 402, 0, 7); g.stroke(); g.beginPath(); g.arc(540, 540, 560, 0, 7); g.stroke(); g.restore(); }
        press.knockout((g) => { g.lineWidth = 13; g.beginPath(); g.arc(540, 540, 721, 0, 7); g.stroke(); });
        B.save(); B.strokeStyle = T(0.6); B.lineWidth = 2; B.beginPath(); B.arc(540, 540, 728, 0, 7); B.stroke(); B.restore();
    });
};
