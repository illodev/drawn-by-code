// Montage object «math» (see ../things.js for the contract).
// Measured piece by piece on the reference (13.5–14.0 s, and the heart at 17.9 s). Authored in
// WORLD logical units of the card (outlines traced on the 2160-px frames); the anchor is the
// centre of the golden rectangle, so CARDS draws it at [490, 518, 1] and the heart reuses it
// in miniature. Layers, bottom to top: graph paper (fine grid + pencil golden rectangles) →
// the salmon spiral, revealed in steps while the flower rides its tip → the cut-out digits.
(() => {
    const P = Paper, D = PaperDetail;
    const { place, cut } = Things.kit;
    const AX = 490, AY = 518;
    const loc = (pts) => pts.map(([x, y]) => [x - AX, y - AY]);
    const COL = { paper: '#e1efdc', edge: '#faf6ec', grid: '#86b394', pencil: '#838d83', one: '#45ae9b', two: '#e3a536', eight: '#335cad', three: '#c53b43', spiral: '#ce705b', spiralEdge: '#d4826f', drop: '#ab5139' };

    // ------------------------------------------------------------------ marker path
    // (PaperDetail.markerPath: a marker line as a chain of strokes, revealable by arc length)
    const markerPath = PaperDetail.markerPath;
    Things.markerPath = markerPath;

    // ------------------------------------------------------------------ the graph paper
    // Colour layer of the sheet (the white torn border is added by cut): a rectangle rotated
    // ≈ −0.035 rad, measured from the torn edges; the tear itself wobbles along each side.
    function sheetOutline() {
        const r = P.rng('mathsheet');
        const C = [[193.5, 323.5], [771, 308], [777, 711.5], [208.5, 733.5]];
        const out = [];
        for (let e = 0; e < 4; e++) {
            const [a, b] = [C[e], C[(e + 1) % 4]];
            const L = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.round(L / 14);
            const nx = (b[1] - a[1]) / L, ny = -(b[0] - a[0]) / L; // outward normal (clockwise)
            const amp = e % 2 ? 0.9 : 1.6; // top/bottom torn rougher than the sides
            for (let k = 0; k < n; k++) {
                const f = k / n, wob = (r() - 0.5) * 2 * amp + Math.sin(f * 9 + e) * amp * 0.6;
                out.push([a[0] + (b[0] - a[0]) * f + nx * wob, a[1] + (b[1] - a[1]) * f + ny * wob]);
            }
        }
        return loc(out);
    }
    // pencil golden rectangles, in the sheet's frame (u, v around the anchor, rotated −0.035)
    const ROT = -0.035;
    const GOLD = [
        [[-244, -150], [242, -150]], [[242, -150], [242, 150]], [[242, 150], [-244, 150]], [[-244, 150], [-244, -150]],
        [[-58, -150], [-58, 150]], [[-244, -36], [-58, -36]], [[-131, -150], [-131, -36]], [[-131, -76], [-58, -76]], [[-97, -76], [-97, -36]],
    ];
    function drawPaper(c, heart) {
        cut(c, sheetOutline(), COL.paper, 'mathsheet2', {
            border: 3.4, borderVar: 0.7, jag: 1.2, shadow: 0.13, paper: COL.edge,
            tex: { alpha: [0.05, 0.12], len: [30, 90], lVar: 2 },
            inner: (cc) => {
                // fine grid: 20.46 units, rotated −0.038, each line its own slight shade (the
                // heart's miniature is a chunkier redraw: bigger cells, heavier lines)
                const r = P.rng('mathgrid'), gs = heart ? 33 : 20.46, ga = heart ? 0.55 : 0.36;
                cc.save();
                cc.rotate(-0.038);
                cc.strokeStyle = COL.grid;
                cc.lineWidth = heart ? 2.4 : 0.95;
                for (let k = -16; k <= 16; k++) {
                    const u = k * gs - 0.5;
                    cc.globalAlpha = ga + r() * 0.16;
                    cc.beginPath();
                    cc.moveTo(u, -240);
                    cc.lineTo(u + (r() - 0.5) * 1.2, 240);
                    cc.stroke();
                }
                for (let k = -12; k <= 12; k++) {
                    const v = k * gs - 0.3;
                    cc.globalAlpha = ga + r() * 0.16;
                    cc.beginPath();
                    cc.moveTo(-320, v);
                    cc.lineTo(320, v + (r() - 0.5) * 1.2);
                    cc.stroke();
                }
                cc.restore();
                if (heart) return;
                // the golden rectangles, ruled by hand in pencil: a little wobble, the odd
                // overshoot at a corner
                cc.save();
                cc.rotate(ROT);
                cc.strokeStyle = COL.pencil;
                cc.lineCap = 'round';
                const rp = P.rng('mathpencil');
                for (const [a, b] of GOLD) {
                    const L = Math.hypot(b[0] - a[0], b[1] - a[1]), tx = (b[0] - a[0]) / L, ty = (b[1] - a[1]) / L;
                    const o0 = -1 + rp() * 4, o1 = -1 + rp() * 4, ph = rp() * 6;
                    cc.globalAlpha = 0.9;
                    cc.lineWidth = 2 + rp() * 0.4;
                    cc.beginPath();
                    for (let s = -o0; s <= L + o1; s += 6) {
                        const wob = Math.sin(s * 0.02 + ph) * 0.8;
                        const x = a[0] + tx * s - ty * wob, y = a[1] + ty * s + tx * wob;
                        s <= -o0 ? cc.moveTo(x, y) : cc.lineTo(x, y);
                    }
                    cc.stroke();
                }
                cc.restore();
                cc.globalAlpha = 1;
            },
        });
    }

    // ------------------------------------------------------------------ the digits
    // Outlines traced on the reference (13.75 s), world units. The «1» is two pieces: the
    // stem with its flag, and the foot glued over it.
    const ONE = [[215.9, 264.5], [219.2, 266.7], [224.2, 276.4], [231.1, 284.9], [236.1, 293.5], [244.1, 328.7], [245.5, 338.9], [251.6, 363], [252, 372], [241, 378], [230, 378], [229.3, 371.3], [219.5, 331.5], [218.3, 318.5], [213.6, 295.8], [211.4, 294.5], [204.2, 305], [200.5, 307.3], [197.2, 307.9], [192.6, 307.3], [189.4, 305.1], [186.5, 300.5], [185.3, 295.8], [186.6, 290.7], [191.5, 283.8], [204.1, 272.6]];
    const ONE_FOOT = [[210.2, 376.7], [213.9, 375.1], [227.8, 372.8], [258.3, 367.4], [269, 364.6], [274.1, 365.2], [278.8, 368.5], [281.7, 376.4], [279.4, 382.4], [274.1, 386], [219.5, 397.6], [213, 398.6], [209.5, 397.5], [206.3, 394.6], [204.2, 388.4], [205.7, 382.1]];
    const TWO = [[336.1, 221.6], [343.1, 221.5], [350.5, 223.6], [362.4, 234.4], [369.3, 247.7], [369.2, 261.6], [366.3, 272.8], [361.7, 281.5], [350.6, 294.4], [343.2, 300.9], [339.1, 307], [326.9, 317.3], [323.8, 321.7], [325.1, 323], [329.6, 323.8], [340.3, 324.1], [361.6, 327.4], [366.1, 330.7], [367.6, 333.1], [368, 337], [364.2, 343.5], [356.9, 346.5], [319, 342.1], [312, 341.4], [309, 339.7], [302.6, 319], [302.1, 314.4], [303.2, 312.4], [324.4, 294.2], [346.1, 270.7], [349.5, 264.4], [350.9, 256], [350.6, 250.9], [347.7, 246.9], [342.6, 243.7], [336.6, 242.1], [330.1, 243], [324.2, 247.2], [317, 257.3], [315, 262.2], [309.3, 263.4], [301.2, 259.2], [298.2, 250], [300, 245.1], [310.9, 230.6], [324.4, 222.8]];
    const EIGHT = [[717.1, 241], [723.1, 240.9], [738.9, 245], [753.4, 258.6], [757.3, 279.2], [751.4, 295.4], [745.5, 301.4], [744.8, 303.7], [747.7, 307], [756.5, 311.6], [761.6, 319.9], [767.6, 326.4], [768.5, 328.7], [768.8, 350.5], [760.8, 366.5], [757.4, 369.6], [742.6, 377.3], [733.8, 377.8], [723.1, 379.1], [702.8, 371.3], [693.5, 362.9], [690.6, 358.8], [685.1, 338.9], [685.4, 335.2], [692.4, 318.1], [698.6, 313], [701.1, 308.8], [699.9, 307], [693.4, 302.3], [684.4, 286.6], [683.5, 267.1], [692.8, 252.2], [705.6, 244.4]];
    const EIGHT_HOLES = [
        [[714.8, 266.9], [724.5, 267], [728.2, 268.7], [730, 270.8], [731.4, 276.9], [730.8, 280.1], [723, 287.9], [720.4, 288.8], [714.8, 287.2], [709.4, 284.4], [706.5, 280.6], [706, 276.9], [707.2, 271.7], [709.3, 269.5]],
        [[725.6, 321.8], [728.2, 321.9], [739.8, 328.4], [743.9, 334.3], [745.5, 341.7], [745.5, 344.4], [741.7, 350.6], [731, 355.7], [724.1, 356.3], [718.5, 353.5], [713.5, 348.1], [711.3, 341.2], [711.2, 337.5], [713, 331.5], [717.6, 327.2]],
    ];
    const THREE = [[757.9, 622.5], [766.7, 622.2], [779.6, 624.6], [798.4, 636.1], [807.2, 650.9], [806.5, 668.1], [804.9, 672.7], [799.5, 679.5], [792.8, 685.4], [785.6, 689.8], [784.1, 692.1], [784.9, 694.3], [792.1, 701.9], [799.6, 719.9], [798.5, 741.7], [790.6, 753.7], [785.2, 759.8], [774.5, 765.5], [766.2, 768.6], [760.6, 769.4], [744.4, 767.7], [714.8, 754.8], [709.1, 749.5], [707.4, 743.1], [710, 735.8], [717.1, 731.3], [728.2, 733], [740.7, 740.6], [752.8, 745.4], [759.7, 745.1], [765.7, 742.3], [770.4, 738.4], [773.6, 733.3], [775, 725.9], [773.3, 718.5], [769.4, 713.8], [759.9, 705.5], [757.4, 700.5], [760.7, 678], [779.9, 663.9], [781.9, 660.2], [781.4, 656.9], [776.4, 652.3], [769.9, 649.5], [754.6, 650.2], [742.1, 654.1], [738.4, 654.3], [730.6, 650.7], [727, 644.9], [726.9, 639.8], [728.3, 634.7], [734.5, 628], [738.9, 625.6]];
    const digitTex = () => ({ angle: -0.3, angleVar: 0.2, len: [18, 50], h: [2.5, 6], lVar: 9, alpha: [0.25, 0.55] });
    const dcut = (c, pts, col, seed, o = {}) => cut(c, loc(pts), col, seed, { border: 2.9, borderVar: 0.4, jag: 0.5, shadow: 0.16, paper: COL.edge, tex: digitTex(), ...o });
    function drawDigits(c, heart) {
        // the heart's «1» is drawn bigger (×1.35 round its middle)
        const big = (pts) => (heart ? pts.map(([x, y]) => [233 + (x - 233) * 1.35 + 3, 331 + (y - 331) * 1.35 + 4]) : pts);
        dcut(c, big(ONE), COL.one, 'mathone');
        dcut(c, big(ONE_FOOT), COL.one, 'mathonefoot');
        if (!heart) dcut(c, TWO, COL.two, 'mathtwo');
        dcut(c, THREE, COL.three, 'maththree');
    }
    // the «8» has two counters: each is torn out of the blue and keeps a white rim
    function drawEight(c) {
        dcut(c, EIGHT, COL.eight, 'matheight');
        EIGHT_HOLES.forEach((h, i) => {
            const res = P.resample(loc(h), 2);
            const rim = P.torn(res, 'eighthole' + i, 0.3, 0.3, 0.6);
            c.fillStyle = COL.edge;
            P.tracePath(c, rim);
            c.fill();
            c.save();
            c.globalCompositeOperation = 'destination-out';
            P.tracePath(c, P.torn(res, 'eightcut' + i, -2.6, 0.5, 0.9));
            c.fill();
            c.restore();
        });
    }

    // ------------------------------------------------------------------ the spiral
    // Centre line measured by ray-casting the reference from the pole (393, 431): polar
    // (degrees, radius) in drawing order, from the inner hook outwards, then the last rise
    // along the right side of the big square, which ends under the flower.
    const POLE = [393, 431];
    const POLAR = [[159, 44], [150, 44.5], [140, 46.3], [130, 48], [120, 50.5], [110, 52.8], [100, 53.5], [90, 53], [80, 52.5], [70, 50.8], [60, 49.8], [50, 47.5], [40, 44.5], [30, 42.3], [20, 39.3], [10, 36.5], [0, 35.3], [-10, 34.3], [-20, 34], [-30, 34.3], [-40, 34.8], [-50, 36.8], [-60, 38.8], [-70, 41.3], [-80, 44.5], [-90, 48.8], [-100, 53], [-110, 59.5], [-120, 66], [-130, 74], [-140, 82.8], [-150, 92.8], [-160, 107], [-170, 122.5], [-180, 134.5], [-190, 146.8], [-200, 157], [-210, 166.8], [-220, 177.8], [-230, 191.8], [-240, 203.8], [-250, 214.8], [-260, 225.5], [-270, 234.8], [-280, 241.5], [-290, 250.5], [-300, 257.5], [-310, 265.8], [-320, 278.5], [-330, 291], [-340, 301.3], [-345, 307.8], [-350, 315]];
    const SPIRAL_END = [[711, 462], [716, 435], [721, 405], [726, 375], [729, 356]];
    const SPIRAL = (() => {
        const pts = POLAR.map(([a, r]) => [POLE[0] + Math.cos((a * Math.PI) / 180) * r, POLE[1] + Math.sin((a * Math.PI) / 180) * r]);
        return loc(D.spline([...pts, ...SPIRAL_END], 4, false));
    })();
    // arc length of the spiral up to its point nearest a world position
    const lengthTo = (() => {
        const S = [0];
        for (let i = 1; i < SPIRAL.length; i++) S.push(S[i - 1] + Math.hypot(SPIRAL[i][0] - SPIRAL[i - 1][0], SPIRAL[i][1] - SPIRAL[i - 1][1]));
        return (wx, wy, from = 0) => {
            let best = 0, bd = 1e9;
            for (let i = 0; i < SPIRAL.length; i++) {
                if (S[i] < from) continue;
                const d = Math.hypot(SPIRAL[i][0] - (wx - AX), SPIRAL[i][1] - (wy - AY));
                if (d < bd) (bd = d, best = S[i]);
            }
            return best;
        };
    })();
    // reveal per drawing (on twos): the drawn end, under the flower in the reference
    const STEPS = (() => {
        const a = lengthTo(272, 410, 300), b = lengthTo(300, 630, a), c2 = lengthTo(645, 577, b);
        return [a, a, a, b, c2, Infinity];
    })();
    // paint drops flung off the line while the flower speeds along it (13.75 and 13.83 s)
    const DROPS = { 3: [[275.3, 427.2, 3.3], [233.3, 460.2, 4.6], [231.5, 525.3, 6.2]], 4: [[294.9, 576.1, 3], [348.7, 661.6, 5], [449.7, 686.4, 6.5]] };
    const spiralOpts = (upto, heart) => ({ w: heart ? 24 : 16.5, core: 0.64, color: COL.spiral, edge: COL.spiralEdge, seg: [36, 58], seed: 'mathspiral', upto });
    const drawSpiral = (c, upto, heart) => markerPath(c, SPIRAL, spiralOpts(upto, heart));
    // where the drawn end of the spiral is at time t (world units, card placement): the lead
    // can hang the flower on it
    Things.mathSpiralTip = (t) => {
        const k = Math.max(0, Math.min(5, Math.floor((t - 13.5) * 12 + 1e-6)));
        const L = STEPS[k];
        let s = 0;
        for (let i = 1; i < SPIRAL.length; i++) {
            s += Math.hypot(SPIRAL[i][0] - SPIRAL[i - 1][0], SPIRAL[i][1] - SPIRAL[i - 1][1]);
            if (s >= L) return [SPIRAL[i][0] + AX, SPIRAL[i][1] + AY];
        }
        const e = SPIRAL[SPIRAL.length - 1];
        return [e[0] + AX, e[1] + AY];
    };

    // ------------------------------------------------------------------ the object
    const BOX = { x: -325, y: -310, w: 655, h: 575 };
    Things.math = (g, x, y, s, t) => {
        // the heart (16–18 s) shows the finished sheet a little tilted, with only the 1 and 3
        const heart = t >= 16;
        const rot = heart ? -0.085 : 0, res = heart ? 0.5 : 1.15;
        place(g, heart ? 'th-math-paper-h' : 'th-math-paper', BOX, (c) => drawPaper(c, heart), x, y, s, rot, res);
        const k = heart ? 5 : Math.max(0, Math.min(5, Math.floor((t - 13.5) * 12 + 1e-6)));
        place(g, 'th-math-spiral' + k + (heart ? 'h' : ''), BOX, (c) => drawSpiral(c, STEPS[k], heart), x, y, s, rot, res);
        if (!heart && DROPS[k]) {
            g.save();
            g.translate(x, y);
            g.scale(s, s);
            g.fillStyle = COL.drop;
            for (const [dx, dy, rr] of DROPS[k]) {
                g.beginPath();
                g.ellipse(dx - AX, dy - AY, rr, rr * 0.92, 0.4, 0, Math.PI * 2);
                g.fill();
            }
            g.restore();
        }
        place(g, heart ? 'th-math-digits-h' : 'th-math-digits', BOX, (c) => drawDigits(c, heart), x, y, s, rot, res);
        if (!heart) place(g, 'th-math-eight', { x: 180, y: -290, w: 112, h: 168 }, drawEight, x, y, s, rot, res);
    };
})();
