// Card «wolf» (reference 6.54–6.95 s, full frame; opens in a circle at 6.48). A wolf howling
// on a snowy rock: its dark silhouette rim-lit in green, an aurora of streaks behind its
// head, a night sky of big navy dots on blue, white sound arcs from the muzzle, a pine
// forest (purple spires, dark trees with yellow snow) over a pink glow. Authored in
// reference pixels (G1.frame), measured on the 6.75 s frame. Separations: sky = blue solid +
// navy screen; aurora = yellow screen over it (green) with yellow and pink streaks; wolf =
// navy + yellow + blue (green-black); rim = yellow + blue solid; snow = paper with light
// yellow and blue screens; glow = pink screen ramp; trees = navy.
var CARDS = CARDS || {};
CARDS.wolf = (press, t) => {
    const { T, fill, stroke, taper, smoothPath, polyPath, clipped, specks } = G1;
    const P = (ink, k) => press.plate(ink, k);
    const pink = P('pink'), pinkS = P('pink', 'screen'), yellow = P('yellow'), yellowS = P('yellow', 'screen');
    const blue = P('blue'), blueS = P('blue', 'screen'), navy = P('navy'), navyS = P('navy', 'screen');
    const d = Math.floor(t * 12 + 1e-6);

    G1.frame(press, () => {
        // --- sky: blue with big navy dots, a darker diagonal swath
        // blue fades out over the forest so the pink glow reads on paper
        blue.fillStyle = Riso.ramp(blue, 0, 790, 0, 880, 0.92, 0);
        blue.fillRect(0, 0, 1080, 1080);
        navyS.fillStyle = Riso.ramp(navyS, 0, 760, 0, 920, 0.42, 0.14);
        navyS.fillRect(0, 0, 1080, 1080);
        clipped(navyS, (g) => polyPath(g, [[760, 0], [1080, 0], [1080, 520], [980, 470], [820, 240]]), (g) => { g.fillStyle = T(0.14); g.fillRect(700, 0, 400, 560); });
        specks(pink, 'wolf-sp', 300, 0, 1080, 760, 26, 1.5, 3);

        // --- the aurora (top left, bounded by a big arc): green dots with streaks
        const aurEdge = [[640, -10], [560, 0], [430, 45], [330, 120], [262, 205], [205, 300], [110, 356], [0, 400], [-10, 405]];
        const aur = (g) => { g.moveTo(-10, -10); G1.smoothPath(g, aurEdge, false); g.lineTo(-10, -10); g.closePath(); };
        blue.save(); blue.globalCompositeOperation = 'destination-out'; blue.beginPath(); aur(blue); blue.fill(); blue.restore();
        clipped(blueS, aur, (g) => { g.fillStyle = T(0.5); g.fillRect(0, 0, 700, 420); });
        clipped(yellowS, aur, (g) => { g.fillStyle = Riso.ramp(g, 0, 0, 0, 400, 0.55, 0.4); g.fillRect(0, 0, 700, 420); });
        clipped(navyS, aur, (g) => { g.fillStyle = T(0.1); g.fillRect(0, 0, 700, 420); });
        const r = Motion.rng('wolf-aur');
        for (let i = 0; i < 26; i++) {
            const x = 8 + i * 13 + r() * 14, y0 = r() < 0.5 ? -20 : r() * 150, y1 = y0 + 120 + r() * 300;
            const ink = i % 3 === 0 ? pinkS : i % 3 === 1 ? yellow : null;
            const w = 3 + r() * 4;
            if (ink) {
                pink.save(); yellow.save(); pinkS.save();
                for (const g of [ink]) { g.beginPath(); aur(g); g.clip(); }
                press.knockout((g) => { g.save(); g.beginPath(); aur(g); g.clip(); taper(g, [[x, y0], [x + 2, (y0 + y1) / 2], [x, y1]], w * 1.2, 1, 1); g.restore(); });
                if (ink === pinkS) taper(pinkS, [[x, y0], [x + 2, (y0 + y1) / 2], [x, y1]], w * 1.4, 1, 0.8);
                else taper(yellow, [[x, y0], [x + 2, (y0 + y1) / 2], [x, y1]], w, 1, 1);
                pink.restore(); yellow.restore(); pinkS.restore();
            } else {
                press.knockout((g) => { g.save(); g.beginPath(); aur(g); g.clip(); taper(g, [[x, y0], [x + 1, (y0 + y1) / 2], [x, y1]], w * 0.7, 1, 1); g.restore(); });
            }
        }

        // --- the sound arcs from the muzzle: seven short white strokes (knocked out), measured
        const arcs = [[[560, 70], [582, 104], [612, 150]], [[590, 28], [630, 76], [665, 150]], [[645, 0], [688, 58], [720, 145]], [[715, 0], [748, 56], [770, 132]], [[780, 0], [806, 52], [822, 122]], [[840, 0], [864, 48], [880, 108]], [[897, 0], [916, 42], [927, 92]]];
        press.knockout((g) => arcs.forEach((a, k) => taper(g, a, 13 - k, 5 - k * 0.3)));
        press.knockout((g) => specks(g, 'wolf-stars', 300, 0, 1080, 760, 60, 1.2, 2.6));
        // --- the forest: back spires (purple: navy screen), the pink glow, front trees
        const spires = (g, y0, h, step, seed, v) => {
            const rr = Motion.rng('wolf-sp' + seed);
            for (let x = 180; x < 1100; x += step * (0.7 + rr() * 0.6)) {
                const hh = h * (0.6 + rr() * 0.6), w = step * (0.8 + rr() * 0.4);
                fill(g, [[x - w / 2, y0 + 50], [x - w * 0.4, y0], [x - w * 0.12, y0 - hh * 0.55], [x, y0 - hh], [x + w * 0.12, y0 - hh * 0.55], [x + w * 0.4, y0], [x + w / 2, y0 + 50]], v);
            }
        };
        pinkS.fillStyle = Riso.ramp(pinkS, 0, 760, 0, 900, 0.0, 0.72);
        pinkS.fillRect(180, 760, 900, 320);
        spires(navy, 790, 90, 28, 'b', 0.72);
        spires(blue, 790, 90, 28, 'b', 0.4);
        spires(pinkS, 790, 90, 26, 'b', 0.3);
        // the front trees: dark navy, yellow snow ledges
        const trees = [[520, 960, 16], [555, 905, 22], [610, 850, 28], [645, 940, 18], [690, 790, 38], [722, 960, 18], [775, 930, 24], [840, 910, 28], [880, 960, 18], [915, 860, 26], [955, 885, 30], [1000, 800, 40], [1034, 960, 20], [1060, 860, 30]];
        for (const [x, yt, w] of trees) {
            const h = 1090 - yt;
            // a tiered outline: each tier of branches flares out, then steps in
            const L = [], Rr = [], n = 5;
            for (let k = 0; k < n; k++) {
                const ya = yt + (h * k) / n, yb = yt + (h * (k + 1)) / n, wa = w * (0.15 + (0.85 * k) / n), wb = w * (0.35 + (0.65 * (k + 1)) / n);
                L.push([x - wa, ya + (k ? 6 : 0)], [x - wb, yb]);
                Rr.push([x + wa, ya + (k ? 6 : 0)], [x + wb, yb]);
            }
            const tr = [[x, yt - 6], ...Rr, [x + w * 0.2, 1090], [x - w * 0.2, 1090], ...L.reverse()];
            press.knockout((g) => { polyPath(g, tr); g.fill(); });
            fill(navy, tr, 1);
            fill(blue, tr, 0.45);
            // snow on the ledges: little yellow crescents
            for (const u of [0.2, 0.45, 0.72]) {
                const yy = yt + h * u, ww = w * (0.25 + u * 0.35);
                fill(yellow, [[x - ww, yy + 5], [x, yy - 3], [x + ww * 0.6, yy + 4], [x, yy + 1]], 1, true);
            }
        }

        // --- the snowy rock: paper with light yellow and blue screens, blue crevices
        const snow = [[-10, 920], [150, 910], [300, 906], [430, 912], [520, 924], [600, 950], [680, 1000], [760, 1090], [-10, 1090]];
        press.knockout((g) => { smoothPath(g, snow, true, 0.12); g.fill(); });
        fill(yellowS, snow, 0.14, true);
        fill(blueS, snow, 0.24, true);
        fill(pinkS, snow, 0.06, true);
        stroke(blue, [[180, 1030], [300, 1010], [420, 1000], [520, 1010]], 5, 1);
        stroke(blue, [[350, 960], [460, 948], [560, 960]], 4, 0.9);
        stroke(blue, [[40, 1070], [160, 1060], [260, 1066]], 4, 0.9);
        for (const [x, y] of [[190, 1010], [270, 1004], [330, 1030], [380, 1010], [480, 1016], [310, 990]]) {
            for (let i = 0; i < 4; i++) taper(navy, [[x + i * 6, y + 20], [x + i * 6 + (i - 1.5) * 4, y - 6 - (i % 2) * 6]], 3, 1);
        }

        // --- the wolf: silhouette, rim light on its back, the tail on the rock
        const wolf = [[212, 320], [258, 300], [330, 250], [410, 200], [488, 157], [492, 170], [470, 205], [500, 212], [470, 250], [438, 300], [425, 330], [432, 360], [415, 400], [424, 440], [412, 520], [420, 600], [398, 660], [392, 760], [388, 880], [412, 914], [300, 918], [240, 918], [200, 918], [160, 900], [120, 910], [-10, 912], [-10, 700], [60, 640], [120, 570], [170, 500], [205, 440], [242, 400], [248, 360]];
        const hole = [[200, 708], [325, 703], [328, 800], [332, 906], [300, 906], [280, 890], [240, 850], [235, 760]];
        const wolfPath = (g) => polyPath(g, wolf);
        press.knockout((g) => { wolfPath(g); g.fill(); });
        fill(navy, wolf, 1);
        fill(yellow, wolf, 1);
        fill(blue, wolf, 0.6);
        // the gap between the legs (sky and trees behind)
        press.knockout((g) => { polyPath(g, hole); g.fill(); });
        clipped(blue, (g) => polyPath(g, hole), (g) => { g.fillStyle = T(0.92); g.fillRect(190, 690, 150, 180); });
        clipped(navyS, (g) => polyPath(g, hole), (g) => { g.fillStyle = T(0.36); g.fillRect(190, 690, 150, 180); });
        clipped(pinkS, (g) => polyPath(g, hole), (g) => { g.fillStyle = Riso.ramp(g, 0, 780, 0, 860, 0, 0.7); g.fillRect(190, 690, 150, 180); });
        clipped(navy, (g) => polyPath(g, hole), (g) => { spires(g, 790, 90, 28, 'b', 0.72); });
        // rim light: green band along the back and head, a yellow line inside it
        const rim = [[212, 320], [258, 300], [330, 250], [410, 200], [488, 157], [470, 186], [400, 222], [330, 262], [290, 290], [268, 330], [270, 370], [252, 420], [210, 470], [150, 540], [80, 620], [0, 690], [-10, 700], [60, 640], [120, 570], [170, 500], [205, 440], [242, 400], [248, 360]];
        erase(navy, rim);
        fill(blue, rim, 1);
        fill(yellow, rim, 1);
        taper(yellow, [[300, 270], [380, 225], [450, 190], [486, 168]], 3, 2);
        taper(yellow, [[268, 340], [252, 420], [200, 480], [120, 570], [40, 660]], 3, 4);
        erase(blue, [[275, 300], [300, 280], [285, 320], [280, 350]]);
        fill(yellow, [[370, 232], [382, 228], [380, 238]], 1);
        // the ear and the fur tufts
        fill(navy, [[210, 322], [252, 290], [290, 272], [262, 316]], 1);
        specks(pink, 'wolf-body', 20, 330, 420, 910, 70, 1.5, 3);
        specks(blue, 'wolf-body2', 20, 330, 420, 910, 30, 1.2, 2.2);
        // the tail lying on the rock
        const tail = [[-10, 912], [60, 916], [140, 914], [160, 925], [150, 952], [100, 962], [40, 962], [-10, 960]];
        fill(navy, tail, 1);
        fill(yellow, tail, 1);
        fill(blue, tail, 0.6);
        for (let i = 0; i < 4; i++) taper(navy, [[120 + i * 10, 924], [150 + i * 8, 905 - i * 3]], 4, 1);
    });

    function erase(g, pts) { g.save(); g.globalCompositeOperation = 'destination-out'; g.fillStyle = '#000'; polyPath(g, pts); g.fill(); g.restore(); }
};
