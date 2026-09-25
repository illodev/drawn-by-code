// Card «volcano» (reference 12.5–12.625 s, full frame). An erupting volcano: a navy cone
// with yellow lava rivers edged in orange and haloed in pink dots, a yellow fountain from
// the crater, a red-orange glow (yellow + pink solids) that breaks into pink dots on navy
// and then into navy dots on blue towards the edges, a navy ash cloud with a pink lightning
// bolt (white core). Measured in reference pixels (1080 frame, the 12.5 s frame) with
// colour-run scans, grid crops and lattice fits of the two screens; the second drawing is
// the same print moved (−5, −1) px, as measured. Uses G5 (cards/_g5-util.js).
var CARDS = CARDS || {};
CARDS.volcano = (press, t, lf = Math.round(t * 24)) => {
    // measured grids and scans (the tone map per 45 px block, outlines sampled off the
    // reference) live in private/volcano-data.js, never committed; the card falls back to its
    // described shapes without them
    const D = (typeof G5DATA !== 'undefined' && G5DATA.volcano) || {};
    const TONE = D.tone;
    const U = G5, T = Riso.tone, d = Math.floor(t * 12 + 1e-6);
    const Y = press.plate('yellow'), P = press.plate('pink'), B = press.plate('blue'), N = press.plate('navy');
    // the reference's screens (lattice fits, px at 1080): pink 10.8 px at 18°, navy 10.8 px at 78°
    const LP = { o: [946.27, 132.06], a: [-3.3149, 10.2786], b: [10.2808, 3.3142] };
    const LN = { o: [40.8, 48.69], a: [2.2397, 10.5645], b: [-10.5649, 2.2419] };
    const CX = 660, CY = 550;
    // the film weaves: each frame of the cut is the same print moved (measured per frame)
    const [dx, dy] = [[0, 0], [0, 0], [-5, -1]][Math.min(2, lf)];
    U.px(press, () => {
        press.save(); press.each((g) => g.translate(dx, dy));
        // ------------------------------------------------------------ the glow
        // tones as a function of u, the distance from the glow's heart in units of the orange
        // zone's half width (225 px right, 250 left; 2.3× taller), measured on colour-run
        // scans: orange to u 1, pink dots on navy from 1.6, navy dots on blue from 2.4
        const field = (m, stops) => {
            for (const [side, rx] of [[-1, 250], [1, 235]]) {
                m.save(); m.beginPath(); m.rect(side < 0 ? -40 : CX, -40, side < 0 ? CX + 40 : 1200, 1200); m.clip();
                m.translate(CX, CY); m.scale(rx, rx * 1.05);
                const gr = m.createRadialGradient(0, 0, 0, 0, 0, 3.2);
                for (const [u, v] of stops) gr.addColorStop(Math.min(1, u / 3.2), T(v));
                m.fillStyle = gr; m.fillRect(-10, -10, 20, 20); m.restore();
            }
        };
        // stops from the reference's colour by u (a fit over ~1000 probes), solved into inks
        field(Y, [[0, 1], [0.8, 1], [1.0, 0.97], [1.2, 0.84], [1.4, 0.72], [1.6, 0.55], [1.8, 0.44], [2.0, 0.3], [2.2, 0.26], [2.4, 0.09], [2.6, 0]]);
        field(P, [[0, 1], [1.05, 1], [1.15, 0]]);
        U.screen(P, 'pink', LP, (m) => field(m, [[0, 1], [1.05, 1], [1.4, 1.1], [1.6, 1.05], [1.8, 0.95], [2.0, 0.75], [2.2, 0.7], [2.4, 0.35], [2.6, 0.1], [3.2, 0.1]]));
        U.screen(N, 'navy', LN, (m) => field(m, [[0, 0], [0.9, 0], [1.0, 0.05], [1.2, 0.25], [1.4, 0.26], [1.6, 0.47], [1.8, 0.5], [2.0, 0.6], [2.2, 0.25], [2.4, 0.38], [2.6, 0.6], [3.2, 0.62]]));
        field(B, [[0, 0], [0.9, 0], [1.0, 0.1], [1.2, 0], [1.4, 0.2], [1.6, 0.15], [1.8, 0.42], [2.0, 0.48], [2.2, 0.95], [2.4, 1], [3.2, 1]]);
        // ------------------------------------------------------------ the ash cloud
        const cloud = [[130, -20], [138, 0], [152, 40], [172, 80], [195, 140], [230, 185], [280, 200], [330, 206], [382, 236], [418, 272], [430, 310], [426, 346], [446, 386], [492, 416], [552, 437], [620, 441], [680, 428], [738, 398], [788, 352], [828, 302], [855, 255], [876, 207], [902, 170], [940, 140], [982, 102], [1000, 50], [992, -20]];
        press.knockout((g) => { g.beginPath(); U.smooth(g, cloud); g.fill(); });
        // purple-navy: pink and blue overprinted, a little navy
        // (the right half of the cloud is plain navy: measured n 1, p 0 at (900, 80))
        const lr = (g, v0, v1) => { const gr = g.createLinearGradient(560, 0, 700, 0); gr.addColorStop(0, T(v0)); gr.addColorStop(1, T(v1)); return gr; };
        U.fill(P, cloud, lr(P, 0.88, 0.45), true);
        U.fill(B, cloud, lr(B, 0.95, 0.6), true);
        U.fill(N, cloud, lr(N, 0.3, 1), true);
        // lighter purple lobes (more pink, less navy) and pink specks
        U.clipped(P, cloud, true, (g) => { for (const [x, y, rx, ry, v] of [[300, 90, 150, 80, 0.55], [720, 110, 190, 100, 0.12], [620, 370, 140, 55, 0.35], [470, 300, 70, 70, 0.3], [880, 60, 90, 60, 0.3]]) { g.save(); g.translate(x, y); g.scale(1, ry / rx); U.glow(g, 0, 0, rx, v, 0); g.restore(); } });
        U.cut([N], (g) => { for (const [x, y, rx, ry, v] of [[300, 90, 150, 80, 0.3], [720, 110, 190, 100, 0.12]]) { g.save(); g.translate(x, y); g.scale(1, ry / rx); U.glow(g, 0, 0, rx, v, 0); g.restore(); } });
        // the cloud's lower lobe over the crater is dotted: pink dots through the blue and navy
        const lobe = [[430, 300], [520, 290], [640, 300], [760, 300], [800, 340], [770, 385], [720, 420], [680, 440], [630, 470], [575, 468], [520, 440], [470, 408], [438, 360]];
        U.cut([P, B, N], (g) => { g.beginPath(); U.smooth(g, lobe); g.fill(); });
        // measured: purple (pink 0.7–0.9, blue 0.4, navy 0.5) turning orange at its foot
        const vg = (g, stops) => { const gr = g.createLinearGradient(0, 300, 0, 470); for (const [s, v] of stops) gr.addColorStop(s, T(v)); g.fillStyle = gr; g.fillRect(400, 280, 420, 200); };
        U.clipped(N, lobe, true, (g) => vg(g, [[0, 0.9], [0.6, 0.55], [1, 0.25]]));
        U.cut([N], (g) => U.screen(g, 'navy', LP, (m) => U.clipped(m, lobe, true, (c) => { c.fillStyle = T(0.4); c.fillRect(400, 280, 420, 200); })));
        U.clipped(P, lobe, true, (g) => vg(g, [[0, 0.45], [1, 0.6]]));
        U.screen(P, 'pink', LP, (m) => U.clipped(m, lobe, true, (c) => { c.fillStyle = T(0.45); c.fillRect(400, 280, 420, 200); }));
        U.clipped(B, lobe, true, (g) => vg(g, [[0, 0.45], [0.7, 0.35], [1, 0.1]]));
        U.clipped(Y, lobe, true, (g) => vg(g, [[0, 0], [0.55, 0.05], [1, 0.5]]));
        // an orange plume rising from the crater into the lobe
        press.knockout((g) => U.brush(g, [[676, 470], [680, 420], [684, 370], [686, 330]], (s) => 16 * (1 - s * 0.7), '#000', 'vpl', { taper: 0.1 }));
        for (const g of [P, Y]) U.brush(g, [[676, 470], [680, 420], [684, 370], [686, 330]], (s) => 16 * (1 - s * 0.7), T(1), 'vpl', { taper: 0.1 });
        U.clipped(P, cloud, true, (g) => U.speckle(g, 'vcl', 220, 130, 0, 1000, 440, 0.8, 1.8, T(1)));
        U.clipped(B, cloud, true, (g) => U.speckle(g, 'vcl2', 120, 130, 0, 1000, 440, 0.8, 1.6, T(1)));
        // ------------------------------------------------------------ the cone
        const cone = [[-20, 872], [0, 860], [50, 830], [100, 802], [150, 782], [200, 762], [300, 736], [395, 712], [432, 695], [482, 670], [540, 646], [596, 626], [615, 628], [640, 634], [665, 634], [690, 628], [712, 628], [760, 668], [810, 710], [850, 745], [900, 790], [950, 828], [1000, 855], [1050, 875], [1100, 890], [1100, 1100], [-20, 1100]];
        press.knockout((g) => { g.beginPath(); U.trace(g, cone); g.fill(); });
        U.fill(P, cone, T(0.88));
        U.fill(B, cone, T(0.95));
        U.fill(N, cone, T(0.36));
        U.clipped(B, cone, false, (g) => U.blotch(g, 'vcb', [0, 700, 1080, 1080], 14, 40, 110, 0.15, 0.4));
        U.clipped(P, cone, false, (g) => U.speckle(g, 'vco', 200, 0, 620, 1080, 1080, 0.8, 1.8, T(1)));
        // a magenta light along the left slope
        U.brush(P, [[596, 628], [540, 647], [482, 671], [432, 696], [395, 713], [330, 724]], 6, T(1), 'vsl', { taper: 0.15 });
        U.cut([N], (g) => U.brush(g, [[596, 628], [540, 647], [482, 671], [432, 696], [395, 713], [330, 724]], 6, '#000', 'vsl', { taper: 0.15 }));
        // ------------------------------------------------------------ lava rivers
        // centrelines from colour-run scans of the yellow cores every 20 px
        const rivers = D.rivers ?? [[[598, 640], [560, 740], [505, 850], [440, 968], [330, 1012], [150, 1056]], [[440, 968], [380, 1030], [338, 1090]], [[672, 638], [655, 760], [633, 880], [665, 1010], [638, 1090]], [[665, 1010], [741, 1070], [750, 1090]], [[712, 638], [826, 750], [859, 870], [896, 990], [938, 1090]], [[869, 925], [847, 1000], [853, 1090]]];
        const trunk = (i) => (i % 2 === 0 ? 1 : 0.8);
        // halo of pink dots on the cone round each river
        U.screen(P, 'pink', LP, (m) => U.clipped(m, cone, false, (c) => rivers.forEach((pts, i) => U.soft(c, 10, (c2) => U.brush(c2, pts, 70 * trunk(i), T(0.4), 'vh' + i, { taper: 0.05 })))));
        // the halo's dots clear the blue and navy under them (pink dots on the purple)
        for (const [g, ink] of [[B, 'blue'], [N, 'navy']]) {
            g.save(); g.globalCompositeOperation = 'destination-out';
            U.screen(g, ink, LP, (m) => U.clipped(m, cone, false, (c) => rivers.forEach((pts, i) => U.soft(c, 10, (c2) => U.brush(c2, pts, 70 * trunk(i), T(0.35), 'vh' + i, { taper: 0.05 })))));
            g.restore();
        }
        rivers.forEach((pts, i) => {
            const w = trunk(i);
            // widening downhill: core 8 → 22 px, the orange band 10 px more each side
            const cw = (s) => w * (8 + 16 * s);
            press.knockout((g) => U.brush(g, pts, (s) => cw(s) + 12, '#000', 'vr' + i, { taper: 0.04 }));
            U.brush(P, pts, (s) => cw(s) + 12, T(1), 'vr' + i, { taper: 0.04 });
            U.brush(Y, pts, (s) => cw(s) + 12, T(1), 'vr' + i, { taper: 0.04 });
            U.cut([P], (g) => U.brush(g, pts, cw, '#000', 'vc' + i, { taper: 0.04 }));
        });
        // cooled clots on the lava
        const rr = Motion.rng('volc-clot');
        rivers.forEach((pts) => {
            for (let k = 2; k < pts.length - 1; k++) if (rr() < 0.55) {
                const [x, y] = pts[k];
                for (const [g, v] of [[N, 0.9], [B, 0.6]]) { g.fillStyle = T(v); g.beginPath(); g.ellipse(x + rr() * 8 - 4, y + rr() * 8 - 4, 4 + rr() * 4, 3 + rr() * 3, rr() * 3, 0, 7); g.fill(); }
            }
        });
        // ------------------------------------------------------------ crater and fountain
        // the crater: a thin dark dome of a rim over the cone
        // the crater: the fountain sits in a dip of the cone's top, a dark lip under it
        for (const [g, v] of [[N, 1], [B, 0.6]]) U.brush(g, [[612, 632], [640, 640], [668, 640], [694, 632]], 6, T(v), 'vcr', { taper: 0.3 });
        const rf = Motion.rng('volc-f' + (d % 2));
        const tongue = (a, len, w) => {
            const bx = 652 + Math.cos(a) * 14, by = 610, tx = 652 + Math.cos(a) * len, ty = 610 + Math.sin(a) * len;
            U.cut([P, N, B], (g) => U.brush(g, [[bx, by], [(bx + tx) / 2, (by + ty) / 2], [tx, ty]], (s) => w * (1 - s), '#000', 'vt' + a, { taper: 0 }));
            U.brush(Y, [[bx, by], [(bx + tx) / 2, (by + ty) / 2], [tx, ty]], (s) => w * (1 - s), T(1), 'vt' + a, { taper: 0 });
        };
        // yellow spikes fanning up from the crater (measured: the tallest to y 430, ±100 px wide at y 550)
        for (let k = 0; k < 25; k++) {
            const u = k / 24 - 0.5;
            const a = -Math.PI / 2 + u * 2.4 + (rf() - 0.5) * 0.12;
            const len = (185 - Math.abs(u) * 230) * (0.7 + rf() * 0.45);
            tongue(a, len, 13 + rf() * 7);
        }
        tongue(-Math.PI / 2 + 0.15, 190, 10);
        // the fountain's solid base
        const base = U.blob(656, 606, 44, 28, 'vfb', 0.1);
        U.cut([P, N, B], (g) => { g.beginPath(); U.smooth(g, base); g.fill(); });
        U.fill(Y, base, T(1), true);
        // ------------------------------------------------------------ lightning
        const bolt = [[488, 26], [495, 70], [500, 110], [489, 150], [494, 190], [497, 232], [506, 270], [521, 302], [540, 332]];
        const br1 = [[491, 142], [462, 168], [422, 208], [383, 233]], br2 = [[507, 268], [540, 290], [576, 303]];
        for (const [pts, w, c, s] of [[bolt, 16, 5, 'vb'], [br1, 5, 2, 'vb1'], [br2, 5, 2, 'vb2']]) {
            press.knockout((g) => U.brush(g, pts, w + 3, '#000', s, { taper: 0.15 }));
            U.brush(P, pts, w, T(1), s, { taper: 0.15 });
            U.cut([P], (g) => U.brush(g, pts.map(([x, y]) => [x + 1.5, y]), c, '#000', s + 'c', { taper: 0.2 }));
        }
        // sparks in the glow
        const rs = Motion.rng('volc-sp');
        for (let k = 0; k < 60; k++) {
            const x = 150 + rs() * 900, y = 200 + rs() * 650, a = rs() * 6.28, l = 4 + rs() * 8;
            const g = rs() < 0.5 ? Y : P;
            U.brush(g, [[x, y], [x + Math.cos(a) * l, y + Math.sin(a) * l]], 3, T(1), 'vsp' + k, { taper: 0.3 });
        }
        // the print's grit: pinholes and specks in every ink (the reference's flats mottle at 2–4 px)
        // (balanced: voids and as many specks, so the mean tone stays as measured)
        U.grit(N, [0, 0, 1080, 1080], { out: true, p: 0.1, a: 0.7, seed: 21 });
        for (const sh of [cloud, cone]) U.clipped(N, sh, sh === cloud, (g) => U.grit(g, [0, 0, 1080, 1080], { p: 0.1, a: 0.7, seed: 26 }));
        U.grit(B, [0, 0, 1080, 1080], { out: true, p: 0.08, a: 0.7, seed: 22 });
        U.grit(P, [0, 0, 1080, 1080], { out: true, p: 0.04, a: 0.6, seed: 23 });
        U.grit(P, [0, 0, 1080, 1080], { p: 0.06, a: 0.8, seed: 25 });
        press.restore();
        U.toneMap(press, TONE);
    });
};
