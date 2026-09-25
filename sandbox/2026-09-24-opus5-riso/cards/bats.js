// Card «bats» (reference 7.75–8.0 s, full frame): bats pouring out of a cave in a red cliff
// at dusk, three big bats with white sound arcs. Authored in reference pixels (G2.px),
// measured on frame 186 (7.75 s): outlines from 1.3×–3× grid crops, inks from area means,
// halftone lattices from an FFT of the dots (pitch, angle and one dot centre).
// Separations: the sky = pink solid with navy dots (10 px, 15°) at the top, turning into
// pink dots (10 px, −15°) over a yellow that fades in towards the horizon (orange); the
// cliff = pink + yellow (red) under navy dots (8 px, 15°) that merge into purple bands; the
// cave = navy + yellow (olive black) with stalactites (navy dots on pink) and small orange
// bats; bats = navy + yellow, the big ones' wing membranes printed with red dots (6 px:
// pink with the navy cleared under each dot) between dark bones; the sea = navy + a yellow
// screen. The reference holds the drawing still for the whole card. Needs _group2-util.js.
var CARDS = CARDS || {};
CARDS.bats = (press, t, lf) => {
    const { T, px, poly, disc, inside, blob, blobPath, curve, taper, spline, speckle, lat, lerpT, field } = G2;
    const P = (ink, k) => press.plate(ink, k);
    const yellow = P('yellow'), yellowS = P('yellow', 'screen'), pink = P('pink'), blue = P('blue'), navy = P('navy');
    const SKY_N = [10.05, 0.2594, 633.41, 229.2], SKY_P = [10.05, -0.2569, 814.5, 724.6];
    const ROCK = [8.04, 0.2621, 162.25, 586.95], WING = [6.03, 0.2618, 753.8, 371.5];
    // the camera pushes in ≈ 0.4 % a frame about (560, 560) px (frames 186 → 191: × 1.02)
    const zs = 1 + 0.004 * (lf ?? Math.floor(t * 24));
    px(press, () => {
        press.save(); press.each((g) => { g.translate(560, 560); g.scale(zs, zs); g.translate(-560, -560); });
        // ---- the sky (profiles measured every 40 px down the right edge)
        pink.fillStyle = T(0.85); pink.fillRect(0, 0, 1080, 390); // (G ≈ 55–70 on the reference: the pink is not full)
        lat(SKY_P, (x, y) => lerpT([[380, 1.2], [420, 0.85], [480, 0.75], [600, 0.62], [760, 0.44], [860, 0.4]], y), pink, [0, 370, 1080, 1080]);
        lat(SKY_N, (x, y) => lerpT([[0, 0.62], [150, 0.55], [250, 0.38], [330, 0.16], [400, 0]], y), navy, [0, 0, 1080, 420]);
        const gy = yellow.createLinearGradient(0, 380, 0, 720);
        gy.addColorStop(0, T(0)); gy.addColorStop(0.3, T(0.3)); gy.addColorStop(0.65, T(0.62)); gy.addColorStop(1, T(1));
        yellow.fillStyle = gy; yellow.fillRect(0, 380, 1080, 700);
        press.knockout((g) => speckle(g, 'sky', 0, 0, 1080, 850, 300, 0.6, 1.5, 0.85));
        // ---- the sea (right, below the horizon): navy + a yellow screen, ragged top
        const sea = [[660, 1080], [672, 870], [700, 858], [760, 862], [820, 850], [900, 856], [960, 842], [1020, 846], [1080, 836], [1080, 1080]];
        press.knockout((g) => { G2.path(g, sea); g.fill(); });
        poly(navy, sea, 1); inside(yellowS, (g) => G2.path(g, sea), (g) => { g.fillStyle = T(0.08); g.fillRect(600, 800, 480, 280); });
        speckle(pink, 'sea', 660, 850, 1080, 1080, 300, 0.6, 1.5, 0.7); poly(pink, sea, 0.15); // (sea ≈ (58, 47, 110): navy with a little pink)
        // ---- the cliff: red, navy dots everywhere, merging into purple bands
        const cliff = [[0, 320], [50, 281], [100, 272], [150, 285], [231, 342], [300, 361], [350, 396], [400, 450], [438, 473], [461, 511], [492, 538], [512, 588], [538, 642], [573, 681], [600, 723], [623, 788], [654, 842], [681, 881], [700, 942], [738, 1011], [762, 1080], [0, 1080]];
        const cp = (g) => G2.path(g, cliff);
        press.knockout((g) => { cp(g); g.fill(); });
        inside(pink, cp, (g) => { g.fillStyle = T(0.88); g.fillRect(0, 250, 800, 830); });
        inside(yellow, cp, (g) => { g.fillStyle = T(1); g.fillRect(0, 250, 800, 830); });
        // the purple bands: navy dots over pink with the yellow gone (measured ≈ [78, 51, 82])
        // (laid out from a 20 px map of the reference's cliff: purple where blue ≥ 0.85 red)
        const BANDS = [
            [[[0, 310], [100, 318], [160, 340], [220, 360], [280, 380], [330, 400], [300, 425], [290, 445], [345, 462], [370, 492], [230, 510], [140, 508], [60, 492], [0, 490]], 0.9],
            [[[0, 530], [40, 540], [70, 560], [110, 590], [120, 610], [60, 625], [20, 632], [70, 660], [100, 700], [110, 740], [60, 770], [0, 772]], 0.9],
            [[[0, 815], [70, 830], [120, 860], [130, 950], [100, 1000], [60, 1010], [0, 1010]], 0.9],
            [[[0, 1018], [120, 1020], [180, 1034], [220, 1060], [230, 1080], [0, 1080]], 0.9],
            [[[370, 1062], [490, 1030], [520, 1010], [620, 1015], [690, 1045], [720, 1080], [360, 1080]], 0.9],
            [[[200, 522], [245, 522], [245, 545], [200, 545]], 0.7],
            [[[515, 518], [560, 518], [560, 548], [515, 548]], 0.7],
        ];
        const bandShapes = (g, k = 1) => { for (const [pts, v] of BANDS) { g.fillStyle = T(Math.min(1, (v - 0.3) / 0.55 * k)); g.beginPath(); blobPath(g, pts); g.fill(); } };
        const bands = field('bats-rock', (g) => { g.fillStyle = T(0.3); g.fillRect(0, 0, 1080, 1080); for (const [pts, v] of BANDS) { g.fillStyle = T(v); g.beginPath(); blobPath(g, pts); g.fill(); } }, 6);
        inside(yellow, cp, (g) => { g.globalCompositeOperation = 'destination-out'; g.filter = 'blur(4px)'; bandShapes(g, 0.9); g.filter = 'none'; });
        // the navy dots, and a mottle: clusters of voids and flecks (a sponge-like print)
        inside(navy, cp, (g) => lat(ROCK, bands, g, [0, 260, 780, 1080]));
        inside(navy, cp, (g) => speckle(g, 'rockn', 0, 280, 700, 1080, 900, 0.8, 2.2, 0.7));
        inside(navy, cp, (g) => { g.globalCompositeOperation = 'destination-out'; speckle(g, 'rockv', 0, 280, 700, 1080, 700, 0.8, 2.4, 0.8); });
        inside(blue, cp, (g) => speckle(g, 'rockb', 0, 280, 700, 1080, 120, 0.8, 2, 0.8));
        // the rim: a dark line with a red lit edge inside it, and the ledge lines
        navy.save(); navy.strokeStyle = T(0.95); navy.lineWidth = 4; navy.lineJoin = 'round'; navy.beginPath(); cliff.slice(0, -1).forEach(([x, y], i) => (i ? navy.lineTo(x, y) : navy.moveTo(x, y))); navy.stroke(); navy.restore();
        for (const pts of [[[127, 400], [200, 418], [254, 435], [331, 458]], [[238, 388], [262, 380], [277, 373]], [[150, 560], [260, 590], [380, 615]], [[470, 720], [540, 760], [590, 800]]]) {
            taper(navy, spline(pts, 12), 4, 0.95);
            pink.save(); pink.translate(1, -3); taper(pink, spline(pts, 12), 3, 1); pink.restore();
            navy.save(); navy.globalCompositeOperation = 'destination-out'; navy.translate(1, -3); taper(navy, spline(pts, 12), 3, 1); navy.restore();
        }
        // ---- the cave: olive black, a red lip, stalactites, small orange bats inside
        const cave = [[190, 648], [250, 640], [330, 640], [400, 645], [440, 690], [470, 790], [482, 860], [485, 940], [470, 1000], [420, 1035], [330, 1060], [250, 1060], [180, 1040], [140, 1010], [120, 950], [115, 850], [120, 760], [150, 700]];
        const caveP = (g) => blobPath(g, cave);
        press.knockout((g) => { g.beginPath(); caveP(g); g.fill(); });
        blob(yellow, cave, 1); blob(navy, cave, 1); blob(blue, cave, 0.3); blob(pink, cave, 0.15);
        inside(navy, caveP, (g) => { g.globalCompositeOperation = 'destination-out'; speckle(g, 'cavev', 110, 640, 490, 1060, 500, 0.6, 1.4, 0.7); });
        inside(pink, caveP, (g) => speckle(g, 'cavep', 110, 640, 490, 1060, 350, 0.6, 1.5, 0.8));
        inside(blue, caveP, (g) => speckle(g, 'caveb', 110, 640, 490, 1060, 80, 0.8, 1.8, 0.8));
        // the lip: an orange band with curls at the top of the mouth
        const lip = [[175, 668], [200, 650], [250, 642], [300, 646], [340, 640], [380, 648], [410, 664]];
        press.knockout((g) => taper(g, spline(lip, 20), 16, 1));
        for (const g of [pink, yellow]) taper(g, spline(lip, 20), 14, 1);
        // stalactites: navy dots on pink (purple), a pink rim, hanging from the lip
        for (const [x0, x1, y0, tx, ty] of [[180, 205, 680, 195, 745], [228, 255, 660, 245, 760], [287, 305, 660, 298, 730], [322, 348, 660, 338, 790], [380, 400, 680, 392, 770], [420, 440, 725, 432, 780]]) {
            const tri = [[x0, y0], [x1, y0], [tx + 2, ty - 6], [tx, ty], [tx - 2, ty - 6]];
            press.knockout((g) => { G2.path(g, tri); g.fill(); });
            poly(pink, tri, 1);
            inside(navy, (g) => G2.path(g, tri), (g) => lat(ROCK, () => 0.55, g, [x0 - 10, y0 - 10, x1 + 10, ty + 10]));
            navy.save(); navy.globalCompositeOperation = 'destination-out'; navy.strokeStyle = T(1); navy.lineWidth = 3; G2.path(navy, tri); navy.stroke(); navy.restore();
        }
        // the cave's bats: orange flecks like little ︶ marks
        const r2 = Motion.rng('cavebats2');
        for (let i = 0; i < 30; i++) {
            const x = 280 + r2() * 180, y = 780 + r2() * 120, w = 16 + r2() * 12;
            if (x < 330 && y < 820) continue;
            const pts = [[x - w / 2, y - 3], [x - w / 4, y + 2], [x, y - 1], [x + w / 4, y + 2], [x + w / 2, y - 3]];
            press.knockout((g) => taper(g, pts, 7, 1));
            for (const g of [pink, yellow]) taper(g, pts, 6, 1);
        }
        // ---- bats
        const olive = (fn) => { press.knockout((g) => fn(g, 1)); for (const [g, v] of [[navy, 1], [yellow, 1], [blue, 0.35]]) fn(g, v); };
        // a small bat of the swarm: two scalloped wings and a body (the shape changes with
        // the wing beat k: 0 up, 1 level, 2 down)
        const small = (x, y, w, k, ang) => {
            const c = Math.cos(ang), s = Math.sin(ang), Q = (u, v) => [x + (u * c - v * s) * w / 2, y + (u * s + v * c) * w / 2];
            const lift = [-0.55, -0.15, 0.25][k];
            const shape = [Q(0, -0.18), Q(0.35, -0.2 + lift * 0.5), Q(1, lift), Q(0.82, 0.12 + lift * 0.4), Q(0.6, 0.02 + lift * 0.3), Q(0.42, 0.18), Q(0.2, 0.08), Q(0, 0.3), Q(-0.2, 0.08), Q(-0.42, 0.18), Q(-0.6, 0.02 + lift * 0.3), Q(-0.82, 0.12 + lift * 0.4), Q(-1, lift), Q(-0.35, -0.2 + lift * 0.5)];
            olive((g, v) => poly(g, shape, v));
        };
        // the swarm: one bat per dark blob found on the reference (centre, width, height of
        // each blob, then drawn with our own bat shape; tall blobs have their wings up)
        // the scanned blob list lives in private/ (gitignored); the committed fallback is the
        // measured distribution: 35 bats over the cloud (x 490–1070, y 40–340, 30–64 px wide) and
        // 22 in the stream from the cave (x 480–690, y 360–740, 24–45 px), wing beat by shape
        const PD = typeof PRIVATE !== 'undefined' ? PRIVATE.bats : null;
        const SWARM = PD?.swarm ?? (() => { const r = Motion.rng('swarm-fallback'), out = []; for (let i = 0; i < 57; i++) { const cloud = i < 35, w = cloud ? 30 + r() * 34 : 24 + r() * 21; out.push(cloud ? [490 + r() * 580, 40 + r() * 300, w, w * (0.38 + r() * 0.2)] : [480 + r() * 210, 360 + r() * 380, w, w * (0.38 + r() * 0.2)]); } return out; })();
        const rs = Motion.rng('swarm3');
        for (const [x, y, w, h] of SWARM) {
            const k = h / w > 0.52 ? 0 : h / w > 0.4 ? 1 : 2;
            if (h > 45) { small(x - 16, y - 18, 44, 1, 0.1); small(x + 14, y + 18, 44, 2, -0.1); continue; } // two bats merged in one blob
            small(x, y, w * 0.95, k, (rs() - 0.5) * 0.3);
        }
        // and the ones along the cliff's rim, half hidden in its shadow
        for (const [x, y, w] of [[470, 560, 36], [500, 600, 40], [520, 650, 34], [560, 700, 38], [590, 745, 34], [620, 800, 30]]) small(x, y, w, 1, 0.2);
        // a big bat: body with ears and yellow eyes, wings = membrane (red dots on olive)
        // stretched between dark bones (arm and fingers), a scalloped trailing edge
        const big = (o) => {
            const { x, y, s } = o, Q = (pts) => pts.map(([u, v]) => [x + u * s, y + v * s]);
            for (const side of [-1, 1]) {
                const wp = side < 0 ? o.left : o.right, wing = Q(wp);
                olive((g, v) => { g.fillStyle = T(v); G2.path(g, wing); g.fill(); });
                // the membrane: red (pink + yellow) under a navy with round holes (0.3): red dots
                // on olive, measured ≈ [99, 51, 17]
                poly(pink, wing, 1);
                inside(navy, (g) => G2.path(g, wing), (g) => { g.globalCompositeOperation = 'destination-out'; lat(WING, () => 0.3, g, [x - 160 * s, y - 100 * s, x + 160 * s, y + 100 * s]); });
                // bones: the arm to the wrist, fingers from the wrist to the scallop points
                const sh = [x + 12 * side * s, y - 30 * s], w0 = side < 0 ? o.wristL : o.wristR, wr = [x + w0[0] * s, y + w0[1] * s];
                const bone = (a, b, w) => { for (const [g, v] of [[navy, 1], [yellow, 1]]) curve(g, [a, [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2 - 3 * s], b], w, v); };
                bone(sh, wr, 4 * s);
                for (const f of (side < 0 ? o.fingL : o.fingR)) bone(wr, [x + wp[f][0] * s, y + wp[f][1] * s], 2.2 * s);
            }
            const body = Q(o.body);
            olive((g, v) => { g.fillStyle = T(v); g.beginPath(); blobPath(g, body); g.fill(); });
            for (const [ex, ey] of o.eyes) { press.knockout((g) => { g.beginPath(); g.arc(x + ex * s, y + ey * s, 3.2 * s, 0, 7); g.fill(); }); disc(yellow, x + ex * s, y + ey * s, 3.2 * s, 1); disc(blue, x + ex * s, y + ey * s, 1.6 * s, 0.6); }
        };
        // bat 2 (measured at 3×: body 835, 395; wing tips 692, 325 and 977, 380), authored
        // for the right wing (mirrored on the left, which sits a little higher)
        const B2 = {
            left: [[-12, -30], [-55, -77], [-100, -75], [-143, -70], [-123, -28], [-108, -5], [-95, 25], [-75, 22], [-55, 33], [-35, 45], [-12, 40]], wristL: [-55, -77], fingL: [3, 4, 6, 8],
            right: [[12, -30], [40, -50], [70, -55], [110, -35], [142, -15], [125, 15], [108, 20], [95, 25], [80, 55], [62, 45], [45, 50], [25, 45], [12, 38]], wristR: [70, -55], fingR: [4, 6, 8, 10],
            body: [[-13, -38], [-12, -62], [-4, -44], [4, -44], [13, -60], [15, -36], [22, -18], [22, 18], [10, 44], [0, 56], [-10, 44], [-22, 18], [-22, -18]],
            eyes: [[-8, -28], [7, -27]],
        };
        big({ x: 835, y: 395, s: 1, ...B2 });
        // bat 1 (3× crop: body 325, 190; the right wing raised)
        big({ x: 325, y: 190, s: 1, left: [[-10, -30], [-42, -37], [-65, -40], [-93, -18], [-65, -10], [-50, 5], [-42, 10], [-28, 33], [-12, 28]], wristL: [-42, -37], fingL: [3, 5, 7],
            right: [[10, -30], [32, -50], [70, -55], [105, -60], [95, -17], [75, 10], [60, 15], [45, 17], [18, 20]], wristR: [32, -50], fingR: [3, 4, 6, 8],
            body: [[-10, -28], [-9, -42], [-3, -32], [4, -32], [10, -42], [11, -26], [14, 0], [10, 20], [0, 32], [-10, 20], [-14, 0]], eyes: [[-6, -22], [6, -21]] });
        big({ x: 962, y: 650, s: 0.6, ...B2 });
        // ---- sound arcs: white (paper) tapered arcs with a thin yellow edge
        const arcs = (cx, cy, list, w) => {
            for (const [rr, a0, a1] of list) {
                const pts = []; for (let i = 0; i <= 18; i++) { const a = a0 + (a1 - a0) * i / 18; pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]); }
                press.knockout((g) => taper(g, pts, w, 1));
                taper(yellow, pts.map(([x, y]) => [x, y + w * 0.55]), w * 0.45, 0.9);
            }
        };
        arcs(360, 250, [[233, -2.09, -1.44], [203, -2.07, -1.47], [178, -2.05, -1.5], [150, -2.04, -1.57]], 6);
        arcs(830, 440, [[328, -1.77, -0.86], [293, -1.76, -0.93], [258, -1.74, -1.0], [222, -1.73, -1.07], [180, -1.71, -1.13]], 6.5);
        arcs(955, 690, [[185, -2.0, -1.2], [160, -1.98, -1.25], [135, -1.95, -1.3], [110, -1.9, -1.35]], 5);
        press.restore();
    });
};
