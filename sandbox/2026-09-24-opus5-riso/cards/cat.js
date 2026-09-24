// Card «cat» (reference 8.5–8.75 s, full frame): a cat seen from behind at a rainy window at
// night, city lights, a curtain tied back on the left, a cushion on the sill. Authored in
// reference pixels (G2.px), measured on the 8.6 s frame. Separations: the glass = blue +
// navy dots; the city = navy + pink dots (violet) with yellow windows; the lamps = yellow +
// pink dots; the cat = navy + yellow + blue (black-green) with a pink + yellow rim; the
// curtain = pink + yellow (orange) with near-black and yellow folds; rain = paper streaks.
// Per drawing the rain streaks change. Needs cards/_group2-util.js.
var CARDS = CARDS || {};
CARDS.cat = (press, t) => {
    const { T, px, poly, disc, fillWith, inside, blob, blobPath, curve, taper, spline, speckle, dots } = G2;
    const P = (ink, k) => press.plate(ink, k);
    const yellow = P('yellow'), yellowS = P('yellow', 'screen'), pink = P('pink'), pinkS = P('pink', 'screen');
    const blue = P('blue'), blueS = P('blue', 'screen'), navy = P('navy'), navyS = P('navy', 'screen');
    const d = Math.floor(t * 12 + 1e-6);
    const grad = (g, x0, y0, x1, y1, stops) => { const gr = g.createLinearGradient(x0, y0, x1, y1); for (const [p, v] of stops) gr.addColorStop(p, T(v)); return gr; };
    const WX = 268; // the window's left edge
    px(press, () => {
        // the glass: blue ink with navy dots, darker lower down
        const glass = (g) => g.rect(WX, 0, 1080 - WX, 1010);
        fillWith(blue, glass, (g) => grad(g, 0, 0, 0, 1000, [[0, 0.85], [0.6, 0.8], [1, 0.6]]));
        inside(navyS, glass, (g) => { g.fillStyle = grad(g, 0, 0, 0, 1000, [[0, 0.36], [0.45, 0.5], [1, 0.6]]); g.fillRect(0, 0, 1080, 1080); });
        inside(pinkS, glass, (g) => { g.fillStyle = T(0.16); g.fillRect(0, 0, 1080, 1080); });
        // the city: violet blocks (navy + pink dots), a stepped roofline, yellow windows
        const city = [[WX, 700], [330, 700], [330, 650], [420, 650], [420, 690], [470, 690], [470, 610], [520, 590], [560, 610], [560, 640], [640, 640], [640, 1010], [WX, 1010]];
        const city2 = [[880, 1010], [880, 700], [930, 700], [960, 670], [990, 690], [1030, 690], [1030, 660], [1080, 660], [1080, 1010]];
        for (const c of [city, city2]) {
            press.knockout((g) => { G2.path(g, c); g.fill(); });
            poly(navy, c, 0.85); poly(blue, c, 0.25);
            inside(pink, (g) => G2.path(g, c), (g) => { dots(g, WX, 580, 1080, 1010, (x, y) => 0.22 + 0.1 * Math.sin(x * 0.02)); });
        }
        const r = Motion.rng('cwin');
        for (let i = 0; i < 30; i++) {
            const x = WX + 10 + r() * 800, y = 720 + r() * 260; if (x > 640 && x < 880) continue;
            if (!(x < 640 || x > 880)) continue;
            press.knockout((g) => g.fillRect(x, y, 14, 14)); poly(yellow, [[x, y], [x + 14, y], [x + 14, y + 14], [x, y + 14]], 1);
        }
        // the street lamps: glows of yellow and pink dots
        for (const [x, y, rr] of [[398, 570, 70], [1005, 500, 80]]) {
            const glow = (g) => g.arc(x, y, rr, 0, 7);
            inside(navyS, glow, (g) => { g.globalCompositeOperation = 'destination-out'; g.fillStyle = Riso.radial(g, x, y, 0, rr, 1, 0); g.fillRect(0, 0, 1080, 1080); });
            inside(blue, glow, (g) => { g.globalCompositeOperation = 'destination-out'; g.fillStyle = Riso.radial(g, x, y, 0, rr, 0.8, 0); g.fillRect(0, 0, 1080, 1080); });
            inside(yellowS, glow, (g) => { g.fillStyle = Riso.radial(g, x, y, 0, rr, 0.95, 0); g.fillRect(0, 0, 1080, 1080); });
            inside(pinkS, glow, (g) => { g.fillStyle = Riso.radial(g, x, y, 0, rr, 0.5, 0); g.fillRect(0, 0, 1080, 1080); });
        }
        // raindrops on the glass: small blue beads with a light side
        const rd = Motion.rng('drops');
        for (let i = 0; i < 55; i++) {
            const x = WX + 10 + rd() * 800, y = rd() * 990, rr = 6 + rd() * 8;
            press.knockout((g) => { g.beginPath(); g.arc(x, y, rr, 0, 7); g.fill(); });
            disc(blue, x, y, rr, 0.55); disc(blueS, x + rr * 0.2, y + rr * 0.2, rr * 0.85, 0.3);
            press.knockout((g) => { g.beginPath(); g.arc(x - rr * 0.35, y - rr * 0.35, rr * 0.3, 0, 7); g.fill(); });
        }
        // rain: thin paper streaks, wavering, new ones every drawing
        press.knockout((g) => { // (the rng is made inside: knockout runs fn once per plate)
            const rr2 = Motion.rng('rain' + (d % 3));
            g.lineCap = 'round';
            for (let i = 0; i < 40; i++) {
                const x = WX + 20 + rr2() * 800, y0 = rr2() * 900, len = 60 + rr2() * 220;
                g.lineWidth = 2.6 + rr2() * 1.4; g.lineJoin = 'round'; g.beginPath(); g.moveTo(x, y0); let xx = x;
                for (let k = 1; k <= 8; k++) { xx += (rr2() - 0.5) * 1.6; g.lineTo(xx, y0 + len * k / 8); }
                g.stroke();
            }
        });
        // the window bar: a pink rail across the glass
        const rail = [[WX, 314], [1080, 312], [1080, 352], [WX, 352]];
        press.knockout((g) => { G2.path(g, rail); g.fill(); });
        poly(pink, rail, 0.8); poly(pinkS, rail, 0.6);
        curve(navy, [[WX, 352], [1080, 352]], 3, 0.8);
        // the frame: the left jamb's dark edge
        poly(navy, [[WX - 6, 0], [WX + 4, 0], [WX + 4, 1010], [WX - 6, 1010]], 0.9);
        // the cat: a black-green silhouette (navy + yellow + blue), a red rim on its left
        const cat = [[632, 278], [668, 312], [760, 318], [840, 312], [905, 298], [892, 340], [888, 420], [900, 470], [880, 520], [860, 560], [890, 610], [930, 680], [960, 760], [990, 860], [995, 960], [960, 1012], [520, 1012], [505, 940], [520, 840], [555, 750], [600, 680], [640, 620], [648, 560], [640, 490], [630, 420], [628, 340]];
        const cp = (g) => { g.moveTo(...cat[0]); for (let i = 1; i < cat.length; i++) g.lineTo(...cat[i]); g.closePath(); };
        // the rim first (a slightly bigger cat, shifted left): pink + yellow
        const rim = (g) => { g.save(); g.translate(-11, -3); cp(g); g.restore(); };
        press.knockout((g) => { g.beginPath(); rim(g); g.fill(); });
        fillWith(pink, rim, T(1)); fillWith(yellow, rim, T(0.9));
        // the inner rim: pure yellow (pink cleared) hugging the fur
        const rim2 = (g) => { g.save(); g.translate(-5, -1); cp(g); g.restore(); };
        inside(pink, rim2, (g) => { g.globalCompositeOperation = 'destination-out'; g.fillStyle = T(0.85); g.fillRect(0, 0, 1080, 1080); });
        press.knockout((g) => { g.beginPath(); cp(g); g.fill(); });
        fillWith(navy, cp, T(0.95)); fillWith(yellow, cp, T(0.95)); fillWith(blue, cp, T(0.6));
        inside(navy, cp, (g) => { g.globalCompositeOperation = 'destination-out'; g.filter = 'blur(40px)'; g.fillStyle = T(0.3); g.beginPath(); g.ellipse(700, 800, 150, 130, 0, 0, 7); g.fill(); g.filter = 'none'; });
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
        // whiskers: thin paper lines out of the cheeks
        press.knockout((g) => {
            g.lineWidth = 4; g.lineCap = 'round';
            for (const [x0, y0, x1, y1] of [[640, 470, 490, 478], [640, 490, 510, 515], [890, 470, 1000, 478], [888, 488, 1010, 505]]) { g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo((x0 + x1) / 2, (y0 + y1) / 2 - 6, x1, y1); g.stroke(); }
        });
        // the sill: orange-brown wood with navy dots
        const sill = [[WX - 10, 1005], [1080, 1000], [1080, 1080], [WX - 10, 1080]];
        poly(pink, sill, 0.9); poly(yellow, sill, 0.9); poly(navyS, sill, 0.45);
        // the cushion: pink with navy zigzag stitching
        const cush = [[330, 1085], [332, 1010], [350, 994], [845, 992], [862, 1008], [866, 1085]];
        press.knockout((g) => { g.beginPath(); blobPath(g, cush.concat([[600, 1090]])); g.fill(); });
        blob(pink, cush.concat([[600, 1090]]), 1);
        inside(pink, (g) => blobPath(g, cush.concat([[600, 1090]])), (g) => { g.globalCompositeOperation = 'destination-out'; speckle(g, 'cush', 330, 1000, 870, 1080, 260, 0.8, 1.6, 0.8); });
        for (const y of [1030, 1062]) { const zz = []; for (let k = 0, x = 350; x <= 850; x += 18, k++) zz.push([x, y + (k % 2 ? -7 : 7)]); navy.save(); navy.strokeStyle = T(0.9); navy.lineWidth = 2.5; navy.beginPath(); zz.forEach(([x, yy], i) => (i ? navy.lineTo(x, yy) : navy.moveTo(x, yy))); navy.stroke(); navy.restore(); }
        // the curtain: orange folds (pink + yellow) with near-black folds and yellow edges,
        // navy dots over it all, a lit yellow panel, gathered at the tie-back
        const cur = [[0, 0], [262, 0], [262, 1080], [0, 1080]];
        press.knockout((g) => { G2.path(g, cur); g.fill(); });
        poly(pink, cur, 0.95); poly(yellow, cur, 0.95);
        inside(navyS, (g) => G2.path(g, cur), (g) => { g.fillStyle = T(0.15); g.fillRect(0, 0, 270, 1080); });
        // the lit panel: pink dots on the yellow
        const lit = [[150, 150], [190, 60], [220, 0], [255, 0], [255, 1000], [215, 1000], [170, 760], [140, 700], [150, 520]];
        inside(pink, (g) => G2.path(g, lit), (g) => { g.globalCompositeOperation = 'destination-out'; g.fillRect(0, 0, 270, 1080); });
        inside(navyS, (g) => G2.path(g, lit), (g) => { g.globalCompositeOperation = 'destination-out'; g.fillRect(0, 0, 270, 1080); });
        inside(pinkS, (g) => G2.path(g, lit), (g) => { g.fillStyle = T(0.45); g.fillRect(0, 0, 270, 1080); });
        // the outer edge band (dark red-brown) next to the window
        poly(navy, [[232, 0], [262, 0], [262, 1080], [232, 1080]], 0.5); poly(pinkS, [[232, 0], [262, 0], [262, 1080], [232, 1080]], 0.4);
        // folds: every fold runs from the top down to the tie-back at (90, 660), then fans out
        const tie = [95, 662];
        const fold = (xt, xb, w, inks) => {
            const pts = spline([[xt, 0], [xt + (tie[0] - xt) * 0.45, 330], [tie[0] + (xt - 130) * 0.25, 640], [tie[0] + (xb - 90) * 0.2, 700], [xb, 1080]], 30);
            for (const [g, v] of inks) taper(g, pts, w, v);
            return pts;
        };
        const dark = [[navy, 0.9], [blue, 0.5]], yel = [[yellow, 1]];
        for (const [xt, xb, w, kind] of [[14, 6, 22, 'd'], [36, 34, 6, 'y'], [66, 70, 26, 'd'], [92, 110, 5, 'y'], [122, 140, 30, 'd'], [150, 168, 6, 'y'], [180, 196, 20, 'd'], [205, 222, 5, 'y'], [0, 24, 7, 'y'], [110, 60, 8, 'd']]) {
            if (kind === 'y') { const pts = fold(xt, xb, w + 3, []); press.knockout((g) => taper(g, pts, w + 2, 1)); taper(yellow, pts, w + 2, 1); taper(navyS, pts, w, 0.15); }
            else fold(xt, xb, w, dark);
        }
        // hatching on the dark folds
        navy.save(); navy.strokeStyle = T(0.8); navy.lineWidth = 1.5;
        const rh = Motion.rng('hatchc');
        for (let i = 0; i < 60; i++) { const x = 60 + rh() * 170, y = 80 + rh() * 500; navy.beginPath(); navy.moveTo(x, y); navy.lineTo(x + 30 * (rh() - 0.3), y - 20 - rh() * 30); navy.stroke(); }
        navy.restore();
        // the tie-back: a yellow band with pink dots and a dark edge
        const band = [[0, 630], [124, 636], [126, 695], [0, 690]];
        press.knockout((g) => { G2.path(g, band); g.fill(); });
        poly(yellow, band, 1); poly(pinkS, band, 0.45);
        for (const [a, b] of [[[0, 630], [124, 636]], [[124, 636], [126, 695]], [[0, 690], [126, 695]]]) curve(navy, [a, b], 3, 0.85);
    });
};
