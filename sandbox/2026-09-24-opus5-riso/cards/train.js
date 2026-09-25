// Card «train» (reference 12.875–13 s, full frame). A night train crossing a viaduct: a
// blue sky (blue flat with navy dots) crossed by a pale diagonal beam (blue and pink dots on
// paper), three magenta cars (pink flat, blue dots) with yellow and orange windows and a
// dark underframe with yellow wheels, a white headlight throwing a yellow beam; the viaduct
// a navy deck and six piers (green edges, widening as they go down) over arches that show a
// pink-dotted sky and a purple river with pale shimmer.
// Measured in reference pixels (1080 frame, the 12.917 s frame; the cut's first frame is the
// same print moved (+3, −1)) with column and row colour scans, grid crops and lattice fits.
// Uses G5 (cards/_g5-util.js).
var CARDS = CARDS || {};
CARDS.train = (press, t, lf = Math.round(t * 24)) => {
    // measured grids and scans (the tone map per 45 px block, outlines sampled off the
    // reference) live in private/train-data.js, never committed; the card falls back to its
    // described shapes without them
    const D = (typeof G5DATA !== 'undefined' && G5DATA.train) || {};
    const TONE = D.tone;
    const U = G5, T = Riso.tone;
    const Y = press.plate('yellow'), P = press.plate('pink'), B = press.plate('blue'), N = press.plate('navy');
    // screens (lattice fits, px at 1080): blue/navy 9.7 px at 12°, pink 9.7 px at 72°, the
    // river's 8.5 px at 25°
    const LB = { o: [762.67, 42.03], a: [-2.0515, 9.4432], b: [9.4904, 1.9755] };
    const LP = { o: [44.65, 49.26], a: [2.9848, 9.252], b: [-9.2453, 3.0116] };
    const LW = { o: [1035.73, 590.17], a: [-3.8235, 7.636], b: [7.7509, 3.6546] };
    const [dx, dy] = [[3, -1], [0, 0], [0, 0]][Math.min(2, lf)];
    U.px(press, () => {
        press.save(); press.each((g) => g.translate(dx, dy));
        // ------------------------------------------------------------ sky
        // the beam: a diagonal band (upper edge measured on column scans, lower edge too)
        const beam = [[-20, 340], [150, 292], [250, 244], [350, 197], [450, 156], [550, 118], [650, 72], [750, 25], [810, -20], [1100, -20], [1100, 110], [1050, 117], [950, 130], [850, 186], [750, 235], [650, 282], [550, 300], [400, 330], [-20, 340]];
        B.fillStyle = T(1); B.fillRect(0, 0, 1080, 460);
        U.screen(N, 'navy', LB, (m) => { m.fillStyle = T(0.28); m.fillRect(0, 0, 1080, 460); U.cut([m], (c) => { c.beginPath(); U.smooth(c, beam); c.fill(); }); });
        U.cut([B], (g) => U.soft(g, 6, (c) => { c.beginPath(); U.smooth(c, beam); c.fill(); }));
        U.screen(B, 'blue', LB, (m) => U.clipped(m, beam, true, (c) => { c.fillStyle = T(0.55); c.fillRect(0, 0, 1080, 460); }));
        U.screen(P, 'pink', LP, (m) => U.clipped(m, beam, true, (c) => { c.fillStyle = T(0.22); c.fillRect(0, 0, 1080, 460); }));
        const rs = Motion.rng('train-stars');
        for (let k = 0; k < 50; k++) { const x = rs() * 1080, y = rs() * 320, r = 1.2 + rs() * 2; press.knockout((g) => { g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); }); }
        // ------------------------------------------------------------ the viaduct
        const deckTop = (x) => 407 + 0.078 * x;
        // arches: [left, right, apex y, horizon y] between the piers (colour scans at y 550)
        const arches = [[42, 149, 445, 668], [178, 305, 452, 656], [339, 484, 480, 632], [510, 682, 511, 638], [728, 912, 529, 592], [964, 1110, 545, 562]];
        const piers = [[-40, 15, 42, 92], [149, 149, 178, 229], [305, 305, 339, 383], [484, 484, 510, 561], [682, 682, 728, 776], [912, 912, 964, 995]];
        // the whole structure navy (+ yellow: a dark olive navy), then the arch openings cut
        const struct = [[-20, deckTop(-20)], [1100, deckTop(1100)], [1100, 1100], [-20, 1100]];
        U.cut([B, P], (g) => { g.beginPath(); U.trace(g, struct); g.fill(); });
        for (const [g, v] of [[N, 1], [Y, 0.25], [B, 0.5]]) U.fill(g, struct, T(v));
        const opening = ([l, r, top]) => { const cx = (l + r) / 2, rx = (r - l) / 2; return (g) => { g.moveTo(l, 1100); g.lineTo(l, top + rx); g.ellipse(cx, top + rx, rx, rx, 0, Math.PI, 0); g.lineTo(r, 1100); g.closePath(); }; };
        // what shows through each arch: the pink-dotted sky, the river below its horizon
        for (const a of arches) {
            const sh = opening(a), [l, r, top, hz] = a;
            U.cut([N, Y, B], (g) => { g.beginPath(); sh(g); g.fill(); });
            // below the piers' taper (the pier's right edge widens downwards) handled by the piers
            press.save(); press.clip(sh);
            // sky in the arch: blue flat thinning, pink dots
            U.fill(B, [[l, top - 10], [r, top - 10], [r, hz], [l, hz]], T(0.8));
            // river: navy + pink + blue with pale shimmer
            const river = [[l - 5, hz + 6], [l + (r - l) * 0.3, hz - 4], [l + (r - l) * 0.65, hz + 3], [r + 5, hz - 2], [r + 5, 1100], [l - 5, 1100]];
            U.cut([B], (g) => { g.beginPath(); U.smooth(g, river); g.fill(); });
            U.fill(N, river, T(0.95), true); U.fill(B, river, T(0.3), true);
            // a pale line on the far shore
            press.knockout((g) => U.brush(g, river.slice(0, 4), 4, '#000', 'tsh' + l, { taper: 0.2 }));
            press.restore();
        }
        U.screen(P, 'pink', LP, (m) => { for (const a of arches) { m.beginPath(); opening(a)(m); m.fillStyle = T(0.45); m.fill(); } });
        // the river: navy with pale dots punched through it (paper, some pink), dots growing
        // away from the far shore and in the shimmer
        const shim = [[830, 700, 70, 80], [860, 860, 60, 100], [1040, 650, 60, 80], [1040, 830, 60, 130], [250, 850, 55, 60], [110, 790, 40, 60], [400, 880, 60, 70], [600, 760, 60, 50], [590, 900, 55, 60]];
        const holes = (m) => { for (const a of arches) { m.save(); m.beginPath(); opening(a)(m); m.clip(); const gr = m.createLinearGradient(0, a[3] + 10, 0, a[3] + 140); gr.addColorStop(0, T(0)); gr.addColorStop(1, T(0.22)); m.fillStyle = gr; m.fillRect(a[0] - 10, a[3], a[1] - a[0] + 20, 600); m.restore(); } shim.forEach(([x, y, rx, ry]) => { m.save(); m.translate(x, y); m.scale(1, ry / rx); U.glow(m, 0, 0, rx, 0.35, 0); m.restore(); }); };
        for (const [g, ink] of [[N, 'navy'], [B, 'blue']]) { g.save(); g.globalCompositeOperation = 'destination-out'; U.screen(g, ink, LW, holes, { gain: 1 }); g.restore(); }
        U.screen(P, 'pink', LW, (m) => { holes(m); m.globalCompositeOperation = 'destination-out'; shim.forEach(([x, y, rx, ry]) => { m.save(); m.translate(x, y); m.scale(1, ry / rx); U.glow(m, 0, 0, rx, 0.6, 0); m.restore(); }); }, { gain: 0.35 });
        // the piers: navy, widening downwards, a green edge on the left
        for (const [x0, l, r0, r1] of piers) {
            const pier = [[l, deckTop(l) + 20], [r0 + 6, deckTop(r0) + 20], [r0, 550], [r1, 1100], [l - 2, 1100]];
            U.cut([P, B], (g) => { g.beginPath(); U.trace(g, pier); g.fill(); });
            for (const [g, v] of [[N, 1], [Y, 0.25], [B, 0.5]]) U.fill(g, pier, T(v));
            // light edge: green (yellow + blue)
            U.cut([N], (g) => U.brush(g, [[l + 3, deckTop(l) + 60], [l + 1, 1100]], 7, '#000', 'tge' + l, { taper: 0 }));
            for (const g of [Y, B]) U.brush(g, [[l + 3, deckTop(l) + 60], [l + 1, 1100]], 7, T(0.9), 'tge' + l, { taper: 0 });
        }
        // the deck's lit top edge (green) and a thin line under it
        for (const g of [Y, B]) U.brush(g, [[-10, deckTop(-10) + 8], [1090, deckTop(1090) + 8]], 5, T(0.9), 'tdk', { taper: 0 });
        U.cut([N], (g) => U.brush(g, [[-10, deckTop(-10) + 8], [1090, deckTop(1090) + 8]], 5, '#000', 'tdk', { taper: 0 }));
        // rain streaks: faint diagonal lines over the viaduct
        U.clipped(B, struct, false, (g) => U.hatch(g, 'train-rain', [0, 420, 1080, 1080], [1, 0.35], 60, 1.4, T(0.6), { bend: 2, len: 0.35 }));
        // reflections in the river at the bottom: pale dashes
        const rr = Motion.rng('train-refl');
        for (let k = 0; k < 40; k++) { const x = rr() * 1080, y = 1000 + rr() * 80, l = 15 + rr() * 40; press.knockout((g) => U.brush(g, [[x, y], [x + l, y]], 3, '#000', 'trf' + k, { taper: 0.3 })); }
        // ------------------------------------------------------------ the train
        const cars = [[-20, 188, 330, 336, 382, 389], [195, 455, 333, 340, 392, 402], [465, 725, 336, 345, 404, 420]];
        cars.forEach(([x0, x1, t0, t1, b0, b1], i) => {
            const body = i === 2 ? [[x0, t0], [690, 344], [712, 352], [730, 392], [x1 + 5, b1], [x0, b0]] : [[x0, t0], [x1, t1], [x1, b1], [x0, b0]];
            press.knockout((g) => { g.beginPath(); U.trace(g, body); g.fill(); });
            U.fill(P, body, T(1)); U.screen(B, 'blue', LB, (m) => U.fill(m, body, T(0.4)));
            U.screen(N, 'navy', LP, (m) => U.fill(m, body, T(0.12)));
            // underframe: dark olive
            const uf = [[x0 + 5, b0], [x1 - 5, b1], [x1 - 5, b1 + 18], [x0 + 5, b0 + 18]];
            U.cut([P, B], (g) => { g.beginPath(); U.trace(g, uf); g.fill(); });
            for (const [g, v] of [[N, 0.9], [Y, 0.7], [P, 0.3]]) U.fill(g, uf, T(v));
        });
        // windows: yellow (yellow flat) and orange (pink + yellow)
        const win = (x0, y0, x1, y1, orange) => {
            const w = [[x0, y0], [x1, y0 + 1], [x1, y1], [x0, y1 - 1]];
            U.cut([B, N, P], (g) => { g.beginPath(); U.trace(g, w); g.fill(); });
            U.fill(Y, w, T(1)); if (orange) U.fill(P, w, T(1));
        };
        for (const [x0, y0, x1, y1, o] of [[-5, 340, 15, 362, 1], [28, 342, 48, 362, 0], [82, 345, 98, 365, 1], [108, 345, 122, 365, 0], [133, 345, 150, 366, 0], [222, 346, 245, 372, 0], [253, 348, 275, 372, 0], [318, 350, 340, 375, 0], [385, 350, 405, 378, 1], [493, 356, 520, 388, 0], [578, 360, 600, 393, 1]]) win(x0, y0, x1, y1, o);
        const nose = [[660, 352], [700, 356], [714, 385], [662, 385]];
        U.cut([B, N, P], (g) => { g.beginPath(); U.trace(g, nose); g.fill(); }); U.fill(Y, nose, T(0.8), false);
        // wheels: yellow rings
        for (const [x, y] of [[28, 390], [52, 392], [130, 396], [158, 398], [253, 406], [285, 408], [380, 413], [413, 415], [525, 428], [556, 430], [640, 434], [668, 436]]) { Y.save(); Y.strokeStyle = T(1); Y.lineWidth = 2.5; Y.beginPath(); Y.arc(x, y, 5, 0, 7); Y.stroke(); Y.restore(); }
        // ------------------------------------------------------------ headlight and beam
        const lb = [[742, 408], [1100, 392], [1100, 458], [742, 436]];
        U.cut([B, N, P], (g) => { g.beginPath(); U.trace(g, lb); g.fill(); });
        U.screen(Y, 'yellow', LB, (m) => { const gr = m.createLinearGradient(742, 0, 1080, 0); gr.addColorStop(0, T(1)); gr.addColorStop(1, T(0.75)); m.fillStyle = gr; m.beginPath(); U.trace(m, lb); m.fill(); });
        U.screen(B, 'blue', LB, (m) => { m.fillStyle = T(0.12); m.beginPath(); U.trace(m, lb); m.fill(); });
        press.knockout((g) => { g.beginPath(); g.arc(742, 420, 20, 0, 7); g.fill(); });
        press.restore();
        U.toneMap(press, TONE);
    });
};
