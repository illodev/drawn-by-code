// Card «bats» (reference 7.75–8.0 s, full frame): bats pouring out of a cave in a red cliff
// at dusk, three big bats with white sound arcs. Authored in reference pixels (G2.px),
// measured on the 7.8 s frame. Separations: the sky = pink (solid at the top with navy
// dots, into pink dots over yellow at the horizon: orange); the cliff = pink + yellow (red)
// with navy strata; the cave = yellow + navy + blue (near-black green); bats = navy + pink +
// yellow (brown-black); the sea = navy + blue. Per drawing: the swarm drifts up, wings flap.
// Needs cards/_group2-util.js.
var CARDS = CARDS || {};
CARDS.bats = (press, t) => {
    const { T, px, poly, disc, fillWith, inside, blob, blobPath, curve, taper, spline, speckle } = G2;
    const P = (ink, k) => press.plate(ink, k);
    const yellow = P('yellow'), yellowS = P('yellow', 'screen'), pink = P('pink'), pinkS = P('pink', 'screen');
    const blue = P('blue'), blueS = P('blue', 'screen'), navy = P('navy'), navyS = P('navy', 'screen');
    const d = Math.floor(t * 12 + 1e-6);
    const grad = (g, y0, y1, stops) => { const gr = g.createLinearGradient(0, y0, 0, y1); for (const [p, v] of stops) gr.addColorStop(p, T(v)); return gr; };
    px(press, () => {
        // the sky
        pink.fillStyle = grad(pink, 0, 420, [[0, 1], [0.6, 0.9], [1, 0]]); pink.fillRect(0, 0, 1080, 1080);
        pinkS.fillStyle = grad(pinkS, 250, 850, [[0, 1], [0.4, 0.8], [0.65, 0.55], [1, 0.4]]); pinkS.fillRect(0, 250, 1080, 830);
        navyS.fillStyle = grad(navyS, 0, 440, [[0, 0.7], [0.5, 0.45], [1, 0]]); navyS.fillRect(0, 0, 1080, 440);
        yellowS.fillStyle = grad(yellowS, 330, 760, [[0, 0], [0.4, 0.45], [1, 0.8]]); yellowS.fillRect(0, 330, 1080, 430);
        yellow.fillStyle = grad(yellow, 560, 780, [[0, 0], [1, 1]]); yellow.fillRect(0, 560, 1080, 520);
        press.knockout((g) => speckle(g, 'sky', 0, 0, 1080, 800, 160, 0.8, 1.8, 0.9));
        // the sea (far right, below the horizon): navy + blue, ragged top edge
        const sea = [[640, 1080], [650, 860], [700, 850], [760, 858], [820, 845], [900, 852], [960, 838], [1020, 842], [1080, 830], [1080, 1080]];
        press.knockout((g) => { G2.path(g, sea); g.fill(); });
        poly(navy, sea, 0.8); poly(blue, sea, 0.35);
        inside(pinkS, (g) => G2.path(g, sea), (g) => { g.fillStyle = T(0.2); g.fillRect(0, 0, 1080, 1080); });
        press.knockout((g) => speckle(g, 'sea', 660, 870, 1080, 1080, 40, 0.8, 1.6, 0.9));
        // the cliff: red (pink + yellow), a dark outline, navy strata on its shaded side
        const cliff = [[0, 305], [40, 290], [70, 272], [175, 270], [240, 330], [300, 380], [345, 395], [420, 440], [455, 500], [500, 560], [545, 610], [570, 660], [600, 700], [640, 790], [680, 870], [720, 960], [765, 1080], [0, 1080]];
        const cp = (g) => G2.path(g, cliff);
        press.knockout((g) => { cp(g); g.fill(); });
        for (const g of [navy]) { g.save(); g.strokeStyle = T(0.9); g.lineWidth = 5; g.lineJoin = 'round'; cp(g); g.stroke(); g.restore(); }
        fillWith(pink, cp, T(1)); fillWith(yellow, cp, T(0.95));
        inside(navyS, cp, (g) => { g.fillStyle = Riso.ramp(g, 0, 0, 700, 0, 0.4, 0.08); g.fillRect(0, 0, 1080, 1080); });
        // strata: navy streaks sloping down to the right, solid on the left, dots to the right
        const strata = (g) => {
            for (const [pts, w, v] of [
                [[[0, 330], [80, 330], [200, 360], [300, 410], [380, 440]], 70, 0.85],
                [[[0, 420], [100, 430], [230, 470], [330, 500], [420, 540]], 50, 0.8],
                [[[0, 520], [120, 540], [260, 580], [360, 610]], 40, 0.7],
                [[[0, 640], [60, 650], [130, 700]], 70, 0.85],
                [[[0, 760], [60, 800], [110, 880], [120, 1000], [140, 1080]], 110, 0.9],
                [[[380, 1000], [460, 1060], [520, 1080]], 60, 0.7],
                [[[560, 780], [610, 850], [650, 960]], 26, 0.55],
                [[[480, 620], [540, 680], [570, 720]], 22, 0.5],
            ]) taper(g, spline(pts, 20), w, v);
        };
        // the strata are navy over pink (blue-violet): the yellow is cleared under them
        inside(navy, cp, strata);
        inside(yellow, cp, (g) => { g.globalCompositeOperation = 'destination-out'; strata(g); });
        inside(blue, cp, (g) => speckle(g, 'strb', 0, 300, 500, 1080, 90, 1, 2.5, 0.8));
        inside(navyS, cp, (g) => { g.globalCompositeOperation = 'destination-out'; g.fillStyle = T(0.8); for (const [x, y, rx, ry] of [[360, 330, 60, 25], [230, 540, 120, 22], [420, 760, 80, 40], [260, 1000, 140, 40], [620, 900, 40, 70]]) { g.beginPath(); g.ellipse(x, y, rx, ry, 0.35, 0, 7); g.fill(); } });
        // pink crack lines in the rock (the pink shows where navy is cut)
        inside(navy, cp, (g) => { g.globalCompositeOperation = 'destination-out'; for (const pts of [[[120, 400], [200, 405], [260, 430], [330, 445]], [[265, 390], [250, 405]], [[0, 555], [60, 560], [140, 575]]]) curve(g, pts, 3, 1); });
        // the cave: a near-black green mouth with pink stalactites and small bats inside
        const cave = [[190, 680], [260, 650], [340, 640], [420, 655], [480, 690], [500, 780], [490, 900], [470, 1010], [430, 1060], [300, 1070], [180, 1040], [120, 960], [110, 850], [140, 740]];
        press.knockout((g) => { g.beginPath(); blobPath(g, cave); g.fill(); });
        blob(yellow, cave, 1); blob(navy, cave, 0.85); blob(blue, cave, 0.45);
        inside(navyS, (g) => blobPath(g, cave), (g) => { g.fillStyle = Riso.radial(g, 300, 850, 60, 260, 0.2, 0.6); g.fillRect(0, 0, 1080, 1080); });
        // the cave lip: a red band over the mouth
        curve(pink, [[180, 690], [260, 660], [340, 650], [420, 664], [480, 700]], 14, 1);
        curve(yellow, [[180, 690], [260, 660], [340, 650], [420, 664], [480, 700]], 14, 0.9);
        for (const [x, w, h] of [[200, 34, 80], [240, 30, 70], [290, 26, 100], [330, 34, 110], [385, 30, 80], [430, 26, 60]]) {
            const tri = [[x - w / 2, 668], [x + w / 2, 666], [x + 3, 668 + h]];
            press.knockout((g) => { G2.path(g, tri); g.fill(); });
            poly(pink, tri, 1); poly(navyS, tri, 0.5); poly(pinkS, tri, 0.0);
            poly(navy, [[x + 2, 668], [x + w / 2, 666], [x + 3, 668 + h]], 0.35);
        }
        // a bat silhouette: body, ears, two scalloped wings (flap = 0 up .. 1 down)
        const bat = (x, y, span, flap, ink = 1, ang = 0) => {
            const s = span / 2, f = flap, c = Math.cos(ang), sn = Math.sin(ang), Q = (u, v) => [x + (u * c - v * sn) * s, y + (u * sn + v * c) * s];
            const wing = (k) => [Q(0.08 * k, -0.12), Q(0.3 * k, -0.3 + f * 0.1), Q(0.62 * k, -0.42 + f * 0.3), Q(1.0 * k, -0.55 + f * 0.75), Q(0.86 * k, 0.12 + f * 0.2), Q(0.7 * k, 0.06 + f * 0.15), Q(0.56 * k, 0.24 + f * 0.1), Q(0.4 * k, 0.16 + f * 0.05), Q(0.26 * k, 0.3), Q(0.1 * k, 0.22)];
            return { wings: [wing(1), wing(-1)], body: [Q(-0.1, -0.2), Q(-0.09, -0.36), Q(-0.04, -0.24), Q(0.04, -0.24), Q(0.09, -0.36), Q(0.1, -0.2), Q(0.1, 0.12), Q(0, 0.3), Q(-0.1, 0.12)] };
        };
        const bigBat = (x, y, span, flap, eyes) => {
            const b = bat(x, y, span, flap);
            for (const w of b.wings) {
                press.knockout((g) => { G2.path(g, w); g.fill(); });
                poly(navy, w, 0.82); poly(yellow, w, 1); poly(pinkS, w, 0.6); poly(blue, w, 0.25);
                // wing bones: darker lines from the wrist
                for (let i = 3; i <= 7; i += 2) curve(navy, [w[0], w[i]], 2.5, 0.6);
            }
            press.knockout((g) => { G2.path(g, b.body); g.fill(); });
            for (const [g, v] of [[navy, 0.95], [yellow, 0.9], [pink, 0.5]]) poly(g, b.body, v);
            if (eyes) for (const k of [-1, 1]) { const ex = x + k * span * 0.028, ey = y - span * 0.07; press.knockout((g) => { g.beginPath(); g.arc(ex, ey, span * 0.012, 0, 7); g.fill(); }); disc(yellow, ex, ey, span * 0.012, 1); }
        };
        // the swarm: small bats streaming from the cave up and to the right (seeded, drifting)
        const r = Motion.rng('swarm');
        for (let i = 0; i < 110; i++) {
            const u = r(), side = (r() - 0.5);
            // along a curve from the cave mouth (470, 720) up to the top right (760, 40)
            // along a fan from the cave mouth (500, 640) spreading up to the top right
            const cx = 490 + u * 180 + side * (60 + u * 420), cy = 660 - u * 620 + side * u * 60 - Math.max(0, side) * u * 80;
            const x = cx + d * 2 * (0.5 + u), y = cy - d * 3 * (0.3 + u);
            if (y < 10 || x > 1075) continue;
            const span = 30 + r() * 22 + u * 14, flap = ((i + d) % 3) / 2;
            const b = bat(x, y, span, 0.35 + flap * 0.4, 1, (r() - 0.5) * 0.5);
            for (const w of b.wings.concat([b.body])) for (const [g, v] of [[navy, 0.92], [yellow, 0.9], [pink, 0.5]]) poly(g, w, v);
        }
        // bats inside the cave: small red-orange marks (pink + yellow, navy cleared)
        const r2 = Motion.rng('cavebats');
        for (let i = 0; i < 26; i++) {
            const x = 240 + r2() * 220, y = 770 + r2() * 150, b = bat(x, y, 22 + r2() * 10, (i + d) % 2, 1, -0.2);
            for (const w of b.wings) { press.knockout((g) => { G2.path(g, w); g.fill(); }); poly(pink, w, 1); poly(yellow, w, 0.9); }
        }
        // the three big bats
        bigBat(330, 170, 200, [0.5, 0.3, 0.1, 0.3][d % 4], false);
        bigBat(840, 385, 290, [0.1, 0.2, 0.4, 0.2][d % 4], true);
        bigBat(965, 655, 175, [0.6, 0.4, 0.2, 0.4][d % 4], true);
        // sound arcs: white strokes (knocked out) with a yellow edge, above each big bat
        const arcs = (cx, cy, rs, a0, a1, w) => {
            for (const rr of rs) {
                const pts = []; for (let i = 0; i <= 14; i++) { const a = a0 + (a1 - a0) * i / 14; pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]); }
                press.knockout((g) => taper(g, pts, w, 1));
                taper(yellow, pts.map(([x, y]) => [x, y + w * 0.6]), w * 0.5, 0.8);
            }
        };
        arcs(320, 150, [52, 78, 104, 130], -2.3, -0.95, 6);
        arcs(810, 380, [140, 180, 220, 255, 290], -1.95, -0.75, 6.5);
        arcs(960, 640, [62, 88, 114], -2.25, -0.9, 5.5);
    });
};
