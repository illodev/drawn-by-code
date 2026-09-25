// Card «cat» (reference 8.5–8.75 s, full frame): a cat seen from behind at a rainy window at
// night, city lights, a curtain tied back on the left, a cushion on the sill. Authored in
// reference pixels (G2.px), measured on the 8.6 s frame. Separations: the glass = blue +
// navy dots; the city = navy + pink dots (violet) with yellow windows; the lamps = yellow +
// pink dots; the cat = navy + yellow + blue (black-green) with a pink + yellow rim; the
// curtain = pink + yellow (orange) with near-black and yellow folds; rain = paper streaks.
// Per drawing the rain streaks change. Needs cards/_group2-util.js.
var CARDS = CARDS || {};
CARDS.cat = (press, t) => {
    const { T, px, poly, disc, fillWith, inside, blob, blobPath, curve, taper, spline, speckle, dots, lat, lerpT } = G2;
    const GLASS = [11.85, -0.2618, 422.72, 420.47]; // the glass's navy dots (FFT of a clean patch)
    const P = (ink, k) => press.plate(ink, k);
    const yellow = P('yellow'), yellowS = P('yellow', 'screen'), pink = P('pink'), pinkS = P('pink', 'screen');
    const blue = P('blue'), blueS = P('blue', 'screen'), navy = P('navy'), navyS = P('navy', 'screen');
    const d = Math.floor(t * 12 + 1e-6);
    const grad = (g, x0, y0, x1, y1, stops) => { const gr = g.createLinearGradient(x0, y0, x1, y1); for (const [p, v] of stops) gr.addColorStop(p, T(v)); return gr; };
    const WX = 268;
    const PD = typeof PRIVATE !== 'undefined' ? PRIVATE.cat : null; // scanned lists (private/, gitignored) // the window's left edge
    px(press, () => {
        // the glass: blue ink with navy dots, darker lower down
        const glass = (g) => g.rect(WX, 0, 1080 - WX, 1010);
        fillWith(blue, glass, (g) => grad(g, 0, 0, 0, 1000, [[0, 0.85], [0.6, 0.8], [1, 0.6]]));
        inside(navy, glass, (g) => lat(GLASS, (x, y) => lerpT([[0, 0.62], [300, 0.56], [360, 0.4], [600, 0.38], [1000, 0.45]], y), g, [WX, 0, 1080, 1010]));
        inside(pinkS, glass, (g) => { g.fillStyle = T(0.16); g.fillRect(0, 0, 1080, 1080); });
        // the city: violet blocks (navy + pink dots), a stepped roofline, yellow windows
        // (the skyline from column scans of the violet under the glass)
        const city = [[WX, 660], [290, 640], [320, 632], [340, 645], [365, 672], [380, 700], [410, 708], [500, 705], [512, 590], [528, 525], [572, 525], [590, 580], [620, 620], [650, 600], [650, 1010], [WX, 1010]];
        const city2 = [[880, 1010], [880, 650], [915, 690], [950, 702], [990, 710], [1020, 668], [1050, 700], [1080, 725], [1080, 1010]];
        for (const c of [city, city2]) {
            press.knockout((g) => { G2.path(g, c); g.fill(); });
            poly(navy, c, 0.85);
            inside(pink, (g) => G2.path(g, c), (g) => lat(GLASS, (x, y) => 0.5 + 0.12 * Math.sin(x * 0.02) + 0.1 * Math.sin(y * 0.03), g, [WX, 500, 1080, 1010]));
        }
        // lit windows: yellow squares where the reference has them (centres from a scan)
        for (const [x, y] of PD?.windows ?? [[990, 810], [1050, 808], [280, 812], [320, 812], [400, 816], [475, 818], [518, 818], [1027, 905], [320, 928], [348, 970]]) {
            const q = [[x - 7, y - 7], [x + 7, y - 7], [x + 7, y + 7], [x - 7, y + 7]];
            press.knockout((g) => { G2.path(g, q); g.fill(); }); poly(yellow, q, 1);
        }
        // the street lamps: glows of yellow and pink dots
        // the street lamps (3× crop): the blue cleared in a disc, yellow and pink dots on the
        // glass's lattice between the navy dots, yellow nearly solid at the heart
        for (const [x, y, rr] of [[395, 565, 58], [1000, 478, 70]]) {
            const glow = (g) => g.arc(x, y, rr, 0, 7), f = (px2, py2) => Math.max(0, 1 - Math.hypot(px2 - x, py2 - y) / rr);
            inside(blue, glow, (g) => { g.globalCompositeOperation = 'destination-out'; g.fillStyle = Riso.radial(g, x, y, 0, rr, 1, 0.1); g.fillRect(0, 0, 1080, 1080); });
            const half = [GLASS[0], GLASS[1], GLASS[2] + 5.72, GLASS[3] + 4.18];
            lat(half, (a, b) => 0.25 + 0.9 * f(a, b), yellow, [x - rr, y - rr, x + rr, y + rr]);
            lat([GLASS[0], GLASS[1], GLASS[2] + 2.9, GLASS[3] + 5.7], (a, b) => 0.45 * f(a, b), pink, [x - rr, y - rr, x + rr, y + rr]);
            inside(yellow, glow, (g) => { g.fillStyle = Riso.radial(g, x, y, 0, rr * 0.8, 1, 0); g.fillRect(0, 0, 1080, 1080); });
            inside(navy, glow, (g) => { g.globalCompositeOperation = 'destination-out'; g.fillStyle = Riso.radial(g, x, y, 0, rr, 0.6, 0); g.fillRect(0, 0, 1080, 1080); });
        }
        // raindrops (positions and sizes from a scan of the reference): blue-white beads with
        // a paper glint; the rain: thin paper streaks, wavering (their spans measured too)
        // (the scanned lists live in private/; the committed fallback is the measured
        // distribution: 110 drops of r 3–12 px over the glass, 47 streaks 30–300 px long, 10 windows
        // in the lower city)
        const DROPS = PD?.drops ?? (() => { const r = Motion.rng('drops-fb'), o = []; for (let i = 0; i < 110; i++) o.push([275 + r() * 800, r() * 990, 3 + Math.floor(r() * r() * 10)]); return o; })();
        for (const [x, y, rr] of DROPS) {
            press.knockout((g) => { g.beginPath(); g.arc(x, y, rr, 0, 7); g.fill(); });
            disc(blue, x, y, rr, 0.5); disc(blue, x + rr * 0.25, y + rr * 0.25, rr * 0.7, 0.3);
            press.knockout((g) => { g.beginPath(); g.arc(x - rr * 0.3, y - rr * 0.3, Math.max(1.2, rr * 0.35), 0, 7); g.fill(); });
        }
        const STREAKS = PD?.streaks ?? (() => { const r = Motion.rng('rain-fb'), o = []; for (let i = 0; i < 47; i++) { const y0 = r() * 900; o.push([290 + r() * 790, y0, y0 + 30 + r() * 270]); } return o; })();
        press.knockout((g) => { // (the rng is made inside: knockout runs fn once per plate)
            const rr2 = Motion.rng('rain1');
            g.lineCap = 'round'; g.lineJoin = 'round';
            for (const [x, y0, y1] of STREAKS) {
                g.lineWidth = 2.4 + rr2() * 1.2; g.beginPath(); g.moveTo(x, y0); let xx = x;
                for (let k = 1; k <= 10; k++) { xx += (rr2() - 0.5) * 2.4; g.lineTo(xx, y0 + (y1 - y0) * k / 10); }
                g.stroke();
            }
        });
        // the window bar: a pink rail across the glass
        const rail = [[WX, 314], [1080, 312], [1080, 352], [WX, 352]];
        press.knockout((g) => { G2.path(g, rail); g.fill(); });
        poly(pink, rail, 1); inside(navy, (g) => G2.path(g, rail), (g) => lat(GLASS, () => 0.35, g, [WX, 300, 1080, 360]));
        curve(navy, [[WX, 352], [1080, 352]], 3, 0.8);
        // the frame: the left jamb's dark edge
        poly(navy, [[WX - 6, 0], [WX + 4, 0], [WX + 4, 1010], [WX - 6, 1010]], 0.9);
        // the cat: a black-green silhouette (navy + yellow + blue), a red rim on its left
        const cat = [[632, 278], [668, 312], [760, 318], [840, 312], [905, 298], [892, 340], [888, 420], [900, 470], [880, 520], [860, 560], [890, 610], [930, 680], [960, 760], [980, 860], [985, 940], [975, 1000], [960, 1012], [520, 1012], [505, 940], [520, 840], [555, 750], [600, 680], [640, 620], [648, 560], [640, 490], [630, 420], [628, 340]];
        const cp = (g) => { g.moveTo(...cat[0]); for (let i = 1; i < cat.length; i++) g.lineTo(...cat[i]); g.closePath(); };
        // the rim first (a slightly bigger cat, shifted left): pink + yellow
        const rim = (g) => { g.save(); g.translate(-11, -3); cp(g); g.restore(); };
        press.knockout((g) => { g.beginPath(); rim(g); g.fill(); });
        fillWith(pink, rim, T(1)); fillWith(yellow, rim, T(0.9));
        // the inner rim: pure yellow (pink cleared) hugging the fur
        const rim2 = (g) => { g.save(); g.translate(-5, -1); cp(g); g.restore(); };
        inside(pink, rim2, (g) => { g.globalCompositeOperation = 'destination-out'; g.fillStyle = T(0.85); g.fillRect(0, 0, 1080, 1080); });
        press.knockout((g) => { g.beginPath(); cp(g); g.fill(); });
        fillWith(navy, cp, T(1)); fillWith(yellow, cp, T(1)); fillWith(pink, cp, T(0.4)); // dark brown-olive, measured ≈ [55, 46, 14]
        inside(navy, cp, (g) => { g.globalCompositeOperation = 'destination-out'; speckle(g, 'fur', 500, 280, 1000, 1010, 500, 0.8, 1.8, 0.8); });
        inside(pink, cp, (g) => speckle(g, 'furp', 500, 280, 1000, 1010, 120, 0.8, 1.8, 0.8));
        // fur tufts on the rim, the shoulder and the haunch lines
        // fur ticks: short red strokes from the rim into the body (navy and blue cleared)
        for (const [x, y] of [[636, 330], [634, 380], [638, 430], [641, 470], [646, 520], [634, 580], [612, 620], [585, 668], [560, 720], [540, 780], [525, 850]]) {
            const tk = [[x - 2, y], [x + 16, y + 12]];
            for (const g of [navy, blue]) { g.save(); g.globalCompositeOperation = 'destination-out'; taper(g, tk, 5, 1); g.restore(); }
            taper(pink, tk, 4, 1);
        }
        for (const pts of [[[610, 670], [650, 640], [700, 628], [730, 640]], [[800, 638], [840, 640], [880, 668]], [[545, 1000], [548, 900], [575, 830], [620, 795], [650, 790]]]) {
            const sp = spline(pts, 16);
            for (const g of [navy, blue]) inside(g, cp, (c) => { c.globalCompositeOperation = 'destination-out'; taper(c, sp, 12, 1); });
            inside(pink, cp, (c) => taper(c, sp, 10, 1));
        }
        // the tail, curled along the sill to the right edge (the dark band at y 980–1015)
        const tail = [[940, 975], [1000, 978], [1082, 980], [1082, 1016], [990, 1016], [940, 1012]];
        press.knockout((g) => { G2.path(g, tail); g.fill(); });
        for (const [g, v] of [[navy, 1], [yellow, 1], [pink, 0.4]]) poly(g, tail, v);
        // whiskers: thin paper lines out of the cheeks
        press.knockout((g) => {
            g.lineWidth = 4; g.lineCap = 'round';
            for (const [x0, y0, x1, y1] of [[640, 470, 490, 478], [640, 490, 510, 515], [890, 470, 1000, 478], [888, 488, 1010, 505]]) { g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo((x0 + x1) / 2, (y0 + y1) / 2 - 6, x1, y1); g.stroke(); }
        });
        // the sill: orange-brown wood with navy dots
        const sill = [[WX - 10, 1005], [1080, 1000], [1080, 1080], [WX - 10, 1080]];
        poly(pink, sill, 0.9); poly(yellow, sill, 0.9); poly(navyS, sill, 0.45);
        // the sill right of the cushion: orange wood (measured ≈ [152, 87, 20])
        const sill2 = [[850, 1016], [1080, 1014], [1080, 1080], [850, 1080]];
        press.knockout((g) => { G2.path(g, sill2); g.fill(); });
        poly(yellow, sill2, 1); poly(pink, sill2, 0.62);
        for (const y of [1030, 1046, 1064]) taper(navy, [[860, y], [970, y - 1], [1080, y]], 4, 0.8); // wood grain inside(navy, (g) => G2.path(g, sill2), (g) => lat(GLASS, () => 0.3, g, [850, 1010, 1080, 1080]));
        // the cushion: pink with navy zigzag stitching
        const cush = [[330, 1085], [332, 1028], [350, 1013], [845, 1012], [860, 1024], [864, 1085]];
        press.knockout((g) => { g.beginPath(); blobPath(g, cush.concat([[600, 1090]])); g.fill(); });
        blob(pink, cush.concat([[600, 1090]]), 1);
        inside(pink, (g) => blobPath(g, cush.concat([[600, 1090]])), (g) => { g.globalCompositeOperation = 'destination-out'; speckle(g, 'cush', 330, 1000, 870, 1080, 260, 0.8, 1.6, 0.8); });
        for (const y of [1036, 1062]) { const zz = []; for (let k = 0, x = 350; x <= 850; x += 18, k++) zz.push([x, y + (k % 2 ? -9 : 9)]); navy.save(); navy.strokeStyle = T(0.9); navy.lineWidth = 3.5; navy.beginPath(); zz.forEach(([x, yy], i) => (i ? navy.lineTo(x, yy) : navy.moveTo(x, yy))); navy.stroke(); navy.restore(); }
        // ---- the curtain (2× crops): orange (pink + yellow, ≈ [194, 82, 24]) with sparse navy
        // dots, dark olive folds and thin yellow lines (green-dotted) that gather at the tie-back
        // and fan out below it; a lit yellow panel with big pink dots (13.2 px) by the window;
        // the jamb (x 200–265): orange under navy dots (9.2 px, ≈ [140, 73, 31])
        const CUR_N = [9.17, 0.2566, 234.73, 376.76], LIT_P = [13.2, -0.2574, 172.3, 477], TIE_P = [6.58, -0.2606, 64.1, 663.1];
        const cur = [[0, 0], [266, 0], [266, 1080], [0, 1080]];
        press.knockout((g) => { G2.path(g, cur); g.fill(); });
        poly(pink, cur, 0.74); poly(yellow, cur, 1);
        lat(CUR_N, (x) => (x > 200 ? 0.4 : 0.2), navy, [0, 0, 266, 1080]);
        // the lit panel
        const lit = [[192, 170], [200, 170], [200, 870], [190, 860], [150, 700], [138, 560], [136, 420], [150, 330], [175, 240]];
        inside(pink, (g) => G2.path(g, lit), (g) => { g.globalCompositeOperation = 'destination-out'; g.fillRect(0, 0, 270, 1080); });
        inside(navy, (g) => G2.path(g, lit), (g) => { g.globalCompositeOperation = 'destination-out'; g.fillRect(0, 0, 270, 1080); });
        inside(pink, (g) => G2.path(g, lit), (g) => lat(LIT_P, () => 0.42, g, [130, 160, 205, 880]));
        // folds: [points top → bottom, width, 'd' dark | 'y' yellow line]
        // (fold centres from runs of dark olive and of yellow on rows every 100 px)
        const FOLDS = [
            [[[11, 0], [12, 100], [15, 200], [23, 300], [37, 400], [40, 550], [52, 640]], 12, 'd'],
            [[[86, 0], [78, 100], [77, 200], [78, 300], [75, 400], [76, 500], [80, 600], [88, 650]], 13, 'd'],
            [[[163, 0], [155, 100], [141, 200], [132, 300], [119, 400], [107, 500], [101, 600], [100, 650]], 17, 'd'],
            [[[190, 120], [182, 200], [163, 300], [137, 400], [125, 500], [112, 620]], 11, 'd'],
            [[[202, 0], [202, 1080]], 8, 'd'],
            [[[103, 700], [115, 800], [122, 900], [118, 1000], [115, 1080]], 15, 'd'],
            [[[118, 700], [143, 800], [170, 900], [185, 1000], [183, 1080]], 13, 'd'],
            [[[56, 720], [54, 800], [38, 900], [14, 1000], [9, 1080]], 15, 'd'],
            [[[130, 700], [141, 720], [171, 800], [191, 900], [199, 1000]], 5, 'd'],
            [[[20, 90], [29, 200], [43, 300], [53, 400], [63, 600], [75, 650]], 5, 'y'],
            [[[97, 60], [93, 200], [93, 400], [95, 600], [96, 640]], 4, 'y'],
            [[[86, 700], [98, 800], [93, 900], [77, 1000], [62, 1080]], 5, 'y'],
            [[[138, 880], [134, 1000], [127, 1080]], 5, 'y'],
            [[[10, 280], [12, 320]], 4, 'y'],
        ];
        for (const [pts, w, kind] of FOLDS) {
            const sp = spline(pts, 30);
            if (kind === 'd') { taper(navy, sp, w * 1.25, 0.95); taper(blue, sp, w, 0.3); }
            else {
                press.knockout((g) => taper(g, sp, w, 1)); taper(yellow, sp, w, 1);
                const rr = Motion.rng('fd' + pts[0][0] + pts[0][1]);
                for (let i = 2; i < sp.length - 2; i += 2) disc(blue, sp[i][0] + (rr() - 0.5) * 2, sp[i][1], 1.4, 0.8);
            }
        }
        // the tie-back: yellow with fine pink dots and a dark edge
        const band = [[0, 630], [122, 638], [124, 695], [0, 690]];
        press.knockout((g) => { G2.path(g, band); g.fill(); });
        poly(yellow, band, 1); inside(pink, (g) => G2.path(g, band), (g) => lat(TIE_P, () => 0.24, g, [0, 620, 130, 700]));
        for (const [a, b] of [[[0, 630], [122, 638]], [[122, 638], [124, 695]], [[0, 690], [124, 695]]]) curve(navy, [a, b], 3, 0.85);
    });
};
