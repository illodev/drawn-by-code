// Card «owl» (reference 4.5–5.0 s, full frame; opens in a circle at 4.42). A close-up owl:
// the orange face with two yellow-ringed eyes, a white brow V, the white bib, the breast
// of feather dashes, the barred wing, the dark hollow of the tree, the jagged bark and a
// pale halftone panel on the right. Authored in reference pixels (G1.frame), measured on the
// 4.75 s frame. Separations: face = pink + yellow solid; dark = navy over yellow; breast =
// yellow + pink screen; wing = yellow + pink and navy screens; panel = yellow + pink screens.
var CARDS = CARDS || {};
CARDS.owl = (press, t) => {
    const { T, fill, stroke, taper, smoothPath, polyPath, clipped, specks } = G1;
    const P = (ink, k) => press.plate(ink, k);
    const pink = P('pink'), pinkS = P('pink', 'screen'), yellow = P('yellow'), yellowS = P('yellow', 'screen');
    const blue = P('blue'), blueS = P('blue', 'screen'), navy = P('navy'), navyS = P('navy', 'screen');
    const erase = (g, fn) => { g.save(); g.globalCompositeOperation = 'destination-out'; g.fillStyle = '#000'; g.strokeStyle = '#000'; fn(g); g.restore(); };

    G1.frame(press, () => {
        // --- the dark hollow behind (whole frame first; everything else overprints or knocks)
        fill(navy, [[0, 0], [1080, 0], [1080, 1080], [0, 1080]], 1);
        fill(yellow, [[0, 0], [1080, 0], [1080, 1080], [0, 1080]], 0.9);
        fill(blue, [[0, 0], [1080, 0], [1080, 1080], [0, 1080]], 0.55);
        // a faint purple haze in the hollow
        pinkS.fillStyle = Riso.radial(pinkS, 580, 560, 20, 220, 0.12, 0);
        pinkS.fillRect(440, 300, 300, 520);
        specks(pink, 'owl-hp', 450, 0, 700, 1080, 90, 1, 2.6);
        specks(blue, 'owl-hb', 450, 0, 700, 1080, 50, 1, 2.2);

        // --- the pale panel on the right: paper with yellow and pink screens
        const panel = [[768, 70], [1100, -40], [1100, 1100], [955, 1100], [880, 800], [830, 560], [806, 420], [786, 250]];
        press.knockout((g) => { smoothPath(g, panel); g.fill(); });
        fill(yellowS, panel, 0.6, true);
        fill(pinkS, panel, 0.3, true);
        // the branch above the panel: green (yellow + blue screen) with dark hatching
        const branch = [[700, -10], [1000, -10], [768, 70], [740, 90]];
        press.knockout((g) => { polyPath(g, branch); g.fill(); });
        fill(yellow, branch, 1);
        fill(blueS, branch, 0.55);
        fill(navyS, branch, 0.2);
        for (let i = 0; i < 6; i++) stroke(navy, [[770 + i * 38, -6], [760 + i * 38, 30]], 3, 1, false);
        // the panel's dark edge
        taper(navy, [[764, 72], [785, 250], [806, 420], [830, 560], [880, 800], [955, 1090]], 14, 22);
        taper(navy, [[742, 92], [860, 40], [960, -6]], 16, 12);

        // --- the bark: jagged bands between the hollow and the panel
        const jag = (x0, dx, amp, seed) => {
            const r = Motion.rng('owljag' + seed), pts = [];
            const base = [[620, -10], [650, 100], [700, 200], [722, 330], [704, 420], [728, 520], [718, 600], [700, 700], [680, 800], [650, 900], [600, 1000], [560, 1090]];
            for (const [x, y] of base) pts.push([x + x0 + (r() - 0.5) * amp, y]);
            // extra zigzag points between
            const out = [];
            for (let i = 0; i < pts.length - 1; i++) {
                out.push(pts[i]);
                const m = [(pts[i][0] + pts[i + 1][0]) / 2 + (r() - 0.3) * amp * 1.4 + dx, (pts[i][1] + pts[i + 1][1]) / 2];
                out.push(m);
            }
            out.push(pts[pts.length - 1]);
            return out;
        };
        const edge0 = jag(0, 0, 26, 'a');
        const barkZone = edge0.concat([[955, 1090], [880, 800], [830, 560], [806, 420], [786, 250], [768, 70], [740, -10]]);
        // bark base: yellow with blue dots (green), knocked out of navy
        erase(navy, (g) => { polyPath(g, barkZone); g.fill(); });
        erase(blue, (g) => { polyPath(g, barkZone); g.fill(); });
        clipped(blueS, (g) => { polyPath(g, barkZone); }, (g) => { g.fillStyle = T(0.3); g.fillRect(500, -20, 600, 1120); });
        // bands: dark line, red strip, dark line, spaced to the right
        for (const [off, ink, w, seed] of [[2, navy, 10, 'b'], [26, pink, 12, 'c'], [48, navy, 9, 'd'], [74, navy, 7, 'e']]) {
            const pts = jag(off, 0, 20, seed);
            G1.stroke(ink, pts, w, 1, false);
        }
        // the lower bark frays into strands: green (yellow + blue solid) with pink and navy
        for (let i = 0; i < 16; i++) {
            const r = Motion.rng('owlstr' + i);
            const x0 = 700 + i * 6 + r() * 10, y0 = 640 + i * 14;
            const x1 = 640 + i * 18 + r() * 20;
            const ink = i % 3 === 0 ? navy : i % 3 === 1 ? blue : pink;
            taper(ink, [[x0, y0], [x0 - 10 + (x1 - x0) * 0.4, (y0 + 1090) / 2], [x1, 1090]], 3, 10 + r() * 8);
        }

        // --- the owl body: breast (left) and wing
        const body = [[-20, 300], [330, 300], [445, 340], [470, 400], [500, 600], [505, 800], [470, 1000], [440, 1100], [-20, 1100]];
        press.knockout((g) => { polyPath(g, body); g.fill(); });
        // breast: yellow solid + pink screen
        fill(yellow, body, 1);
        fill(pinkS, body, 0.3);
        // the wing (a long leaf): pink and navy screens on the yellow
        const wing = [[330, 318], [400, 300], [445, 345], [472, 420], [500, 600], [502, 800], [470, 1000], [430, 1100], [250, 1100], [270, 1000], [290, 700], [305, 540], [318, 400]];
        fill(pinkS, wing, 0.25, true);
        fill(navyS, wing, 0.42, true);
        // wing bars: tapered navy strokes, arched
        for (let i = 0; i < 9; i++) {
            const y = 480 + i * 64 + (i > 4 ? (i - 4) * 4 : 0), w = 18 - i * 0.6;
            taper(navy, [[322 - i * 3, y + 6], [390, y - 8], [440, y - 4], [482 - (i > 6 ? (i - 6) * 10 : 0), y + 8]], w, 3);
        }
        // feather shafts at the bottom of the wing: thin pink lines
        for (let i = 0; i < 7; i++) stroke(pink, [[300 + i * 24, 900 + i * 6], [285 + i * 22, 1090]], 2.5, 1, false);
        // outlines: the wing's left edge (navy, thick), its right edge (pink)
        taper(navy, [[322, 330], [312, 450], [300, 620], [285, 800], [265, 1000], [250, 1090]], 11, 15);
        taper(pink, [[445, 350], [480, 440], [503, 600], [505, 800], [478, 980], [440, 1090]], 8, 10);
        // the breast's left edge (a second wing coming in at the bottom left)
        taper(navy, [[0, 800], [22, 900], [36, 1000], [44, 1090]], 8, 12);
        fill(navyS, [[-10, 800], [0, 800], [22, 900], [36, 1000], [44, 1100], [-10, 1100]], 0.4);
        // breast feather dashes: dark (navy on yellow) with a red sliver under each
        for (let row = 0; row < 19; row++) {
            const y = 478 + row * 32;
            const xr = 290 - Math.max(0, row - 8) * 2.5;
            for (let k = 0; k < 6; k++) {
                const r = Motion.rng('owld' + row + '_' + k);
                const x = 20 + k * 58 + (row % 2) * 28 + (r() - 0.5) * 30;
                if (r() < 0.18) continue;
                if (x > xr - 20 || (row > 9 && x < 50 + (row - 9) * 2)) continue;
                const w = 26 + r() * 30, h = 6 + r() * 6, bend = (r() - 0.3) * 8, yy = y + (r() - 0.5) * 10;
                const dash = [[x - w / 2, yy], [x, yy - h / 2 - bend], [x + w / 2, yy], [x, yy + h / 2 - bend * 0.3]];
                fill(pink, dash.map(([a, b]) => [a + 3, b + 5]), 1, true);
                fill(navy, dash, 1, true);
            }
        }

        // --- the head
        const head = [[-30, -30], [300, -30], [405, -20], [436, 50], [446, 120], [440, 200], [405, 285], [350, 318], [260, 336], [120, 344], [-30, 350]];
        press.knockout((g) => { smoothPath(g, head); g.fill(); });
        fill(pink, head, 1, true);
        fill(yellow, head, 1, true);
        // the chin ruff: pink screen and navy hatching under the beak
        const ruff = [[-30, 230], [120, 215], [230, 250], [300, 300], [260, 336], [120, 344], [-30, 350]];
        clipped(navy, (g) => smoothPath(g, ruff), (g) => {
            for (let i = 0; i < 9; i++) G1.stroke(g, [[-20 + i * 24, 236], [50 + i * 24, 300]], 2.2, 0.8, false);
        });
        fill(pinkS, ruff, 0.45, true);
        // freckles round the right eye
        specks(navy, 'owl-fr', 170, 20, 440, 290, 55, 2, 4);
        // the mouth: a dark crescent under the face
        fill(navy, [[212, 296], [270, 300], [348, 288], [325, 316], [282, 328], [238, 318]], 1, true);
        // the eyes: black ring, yellow ring (pink knocked out), black pupil, white catchlight
        for (const [cx, cy] of [[283, 116], [30, 88]]) {
            navy.fillStyle = T(1);
            navy.beginPath(); navy.arc(cx, cy, 96, 0, 7); navy.fill();
            erase(navy, (g) => { g.beginPath(); g.arc(cx, cy, 82, 0, 7); g.fill(); });
            erase(pink, (g) => { g.beginPath(); g.arc(cx, cy, 82, 0, 7); g.fill(); });
            navy.beginPath(); navy.arc(cx + 2, cy + 3, 56, 0, 7); navy.fill();
            press.knockout((g) => { g.beginPath(); g.ellipse(cx - 16, cy - 26, 11, 6, -0.5, 0, 7); g.fill(); });
        }
        // the brow V (white knockout), the beak
        press.knockout((g) => {
            polyPath(g, [[98, -10], [134, -10], [160, 96], [150, 114], [140, 110]]); g.fill();
            polyPath(g, [[200, -10], [228, -10], [160, 108], [150, 114], [148, 96]]); g.fill();
        });
        fill(navy, [[118, 148], [140, 142], [162, 150], [155, 195], [141, 228], [128, 195]], 1, true);
        stroke(yellow, [[126, 160], [128, 190]], 3, 1, false);
        // whiskers
        taper(navy, [[92, 162], [60, 250], [28, 350]], 3, 1);
        taper(navy, [[186, 214], [120, 300], [84, 392]], 4, 1.2);

        // --- the white bib (knocked out), blue specks on it
        const bib = [[-30, 342], [120, 340], [300, 346], [308, 400], [296, 430], [262, 452], [182, 478], [100, 462], [40, 440], [-30, 420]];
        press.knockout((g) => { smoothPath(g, bib); g.fill(); });
        specks(blue, 'owl-bib', 20, 360, 280, 460, 26, 2, 4);
    });
};
