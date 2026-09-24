// Card «owl» (reference 4.5–5.0 s: a circle on frame 108, a bigger one on 109, full frame
// from 110; re-inked pink → blue at 14.5 with a white ring). A close-up owl: the orange face
// with two yellow-ringed eyes, a white brow V, the white bib with blue specks, the yellow
// breast of feather dashes, the barred wing, the dark mottled hollow of the tree, jagged
// bark strips, grass blades and a pink-and-yellow halftone panel. Authored in reference
// pixels (G1.frame), every number read off the 112 frame (colour-run scans, 1.6× grid
// crops); screens are hand-set on the lattices measured on the film (pitch, angle, phase).
// The film pushes in ≈ 2 % over the shot (scale 0.99 → 1.01 about the centre); the repeat
// is the same print 6 % bigger and turned 3° (its panel screen measures 18.3 px at 78°
// against 17.25 px at 75°). Film scratches (thin teal lines) change every drawing.
var CARDS = CARDS || {};
CARDS.owl = (press, t, lf, o = {}) => {
    const { T, fill, taper, smoothPath, polyPath, clipped, lattice, dots, marks } = G1;
    const P = (ink, k) => press.plate(ink, k);
    const pink = P('pink'), yellow = P('yellow'), blue = P('blue'), navy = P('navy'), pinkS = P('pink', 'screen');
    const erase = (g, fn) => { g.save(); g.globalCompositeOperation = 'destination-out'; g.fillStyle = '#000'; g.strokeStyle = '#000'; fn(g); g.restore(); };
    const d = Math.floor(t * 12 + 1e-6), again = !!o.ring;
    // the screens (measured: origin, lattice vectors, reference px)
    const L = {
        panelPink: lattice(-2.6, 0.65, 4.4587, 16.6699, -16.6717, 4.4515),
        panelYellow: lattice(-7.16, 0.6, 12.1261, 12.2912, -12.2948, 12.0938),
        breastPink: lattice(-1.28, 1.24, 2.6894, 10.0165, -10.0054, 2.6797),
        wingPink: lattice(2.51, -2.94, 2.6813, 9.9856, -10.0296, 2.6891),
        wingNavy: lattice(2.44, 3.52, 9.9989, 2.6589, -2.6609, 10.0021),
        ruffNavy: lattice(-0.15, -4.47, 9.2164, 5.1285, -5.0478, 9.2972),
        branchBlue: lattice(-8.52, 7.74, 8.3698, 21.75, -21.4865, 8.6496),
        grassBlue: lattice(6.03, 3.85, 13.2826, 3.4404, -3.5773, 13.3225),
        barkPink: lattice(1.5, 2.0, 10.8, 2.9, -2.9, 10.8),
    };
    // curves measured along rows every 8 px (colour-run scans of the 112 frame): the
    // hollow's edge [x, y], the dark band, the red strips and the panel's dark edge [y, x0, x1]
    const HOLLOW = [[618, -14], [618, 0], [618, 8], [618, 16], [618, 24], [622, 32], [625, 40], [631, 48], [635, 56], [643, 64], [648, 72], [653, 80], [655, 88], [657, 96], [659, 104], [659, 112], [658, 120], [655, 128], [655, 136], [661, 144], [659, 152], [660, 160], [661, 168], [667, 176], [668, 184], [674, 192], [675, 200], [674, 208], [674, 216], [676, 224], [678, 232], [680, 240], [681, 248], [685, 256], [683, 264], [680, 272], [677, 280], [674, 288], [671, 296], [677, 304], [676, 312], [690, 320], [700, 328], [717, 336], [714, 344], [712, 352], [708, 360], [708, 368], [706, 376], [704, 384], [702, 392], [694, 400], [694, 408], [693, 416], [695, 424], [695, 432], [699, 440], [699, 448], [704, 456], [706, 464], [708, 472], [714, 480], [717, 488], [715, 496], [712, 504], [711, 512], [710, 520], [707, 528], [706, 536], [704, 544], [702, 552], [701, 560], [699, 568], [693, 576], [688, 584], [687, 592], [695, 600], [702, 608], [710, 616], [710, 624], [706, 632], [703, 640], [701, 648], [700, 656], [698, 664], [696, 672], [693, 680], [678, 688], [676, 696], [676, 704], [678, 712], [679, 720], [679, 728], [680, 736], [683, 744], [687, 752], [689, 760], [694, 768], [692, 776], [679, 784], [672, 792], [670, 800], [667, 808], [665, 816], [662, 824], [655, 832], [653, 840], [649, 848], [649, 856], [651, 864], [654, 872], [653, 880], [653, 888], [654, 896], [652, 904], [650, 912], [648, 920], [651, 928], [650, 936], [645, 944], [645, 952], [634, 960], [623, 968], [614, 976], [611, 984], [608, 992], [600, 1000], [591, 1008], [586, 1016], [577, 1024], [569, 1032], [565, 1040], [560, 1048], [560, 1056], [560, 1064], [560, 1072], [552, 1094]];
    const BAND = [[-14, 624, 664], [0, 624, 664], [8, 624, 664], [16, 628, 670], [24, 631, 675], [32, 634, 676], [40, 640, 677], [48, 643, 684], [56, 646, 688], [64, 649, 693], [72, 654, 696], [80, 659, 698], [88, 662, 700], [96, 665, 701], [104, 667, 702], [112, 667, 702], [120, 668, 703], [128, 667, 703], [136, 670, 704], [144, 670, 704], [152, 673, 706], [160, 672, 708], [168, 678, 711], [176, 680, 713], [184, 684, 714], [192, 687, 714], [200, 687, 715], [208, 686, 716], [216, 690, 717], [224, 691, 718], [232, 692, 718], [240, 692, 718], [248, 691, 718], [256, 692, 717], [264, 690, 714], [272, 688, 712], [280, 686, 710], [288, 683, 708], [296, 680, 706], [304, 683, 708], [312, 683, 712], [320, 695, 718], [328, 705, 722], [336, 733, 754], [344, 736, 754], [352, 735, 752], [360, 732, 751], [368, 732, 751], [376, 728, 750], [384, 726, 746], [392, 720, 742], [400, 717, 738], [408, 714, 736], [416, 714, 733], [424, 713, 734], [432, 715, 738], [440, 720, 742], [448, 723, 744], [456, 723, 750], [464, 729, 751], [472, 729, 755], [480, 735, 758], [488, 738, 760], [496, 739, 761], [504, 737, 760], [512, 736, 756], [520, 730, 750], [528, 728, 747], [536, 726, 745], [544, 724, 743], [552, 721, 741], [560, 719, 739], [568, 713, 735], [576, 710, 730], [584, 705, 727], [592, 705, 726], [600, 709, 727], [608, 714, 737], [616, 720, 747], [624, 732, 757], [632, 729, 756], [640, 729, 753], [648, 725, 751], [656, 723, 749], [664, 720, 746], [672, 719, 745], [680, 708, 742], [688, 701, 735], [696, 696, 722], [704, 693, 719], [712, 695, 716], [720, 694, 716], [728, 697, 718], [736, 698, 719], [744, 700, 721], [752, 700, 724], [760, 707, 725], [768, 708, 728], [776, 715, 730], [784, 717, 732], [792, 715, 731], [800, 706, 723], [808, 700, 715], [816, 699, 711], [824, 693, 707], [832, 690, 703], [840, 683, 698], [848, 675, 695], [856, 673, 692], [864, 671, 690], [872, 668, 688], [880, 669, 689], [888, 667, 690], [896, 671, 691], [904, 671, 692], [912, 672, 694], [920, 669, 696], [928, 667, 695], [936, 669, 693], [944, 667, 691], [952, 670, 691], [960, 669, 689], [968, 666, 686], [976, 659, 680], [984, 651, 672], [992, 649, 664], [1000, 639, 657], [1008, 631, 650], [1016, 623, 640], [1024, 613, 631], [1032, 603, 621], [1040, 593, 613], [1048, 590, 607], [1056, 583, 600], [1064, 576, 594], [1072, 571, 588], [1094, 563, 580]];
    const REDS = [[[24, 674, 681], [32, 676, 684], [40, 679, 687], [48, 683, 691], [56, 687, 695], [64, 692, 703]], [[80, 698, 708], [88, 699, 708], [96, 700, 710], [104, 701, 711], [112, 701, 711], [120, 702, 712], [128, 702, 712], [136, 703, 712], [144, 704, 712], [152, 705, 713], [160, 708, 715], [168, 711, 718], [176, 713, 720], [184, 714, 722], [192, 715, 724], [200, 716, 726], [208, 716, 726], [216, 717, 729], [224, 718, 729], [232, 718, 730], [240, 718, 731], [248, 718, 733], [256, 717, 734]], [[256, 716, 735], [264, 711, 733], [280, 709, 732], [296, 705, 736], [312, 711, 746], [320, 717, 758], [336, 734, 759], [348, 744, 753]], [[512, 756, 762], [520, 750, 760], [528, 747, 756]], [[560, 739, 748], [568, 735, 746], [576, 731, 742], [584, 727, 737], [592, 727, 742], [600, 728, 750]], [[624, 758, 764], [632, 757, 763], [640, 754, 759], [648, 752, 760], [656, 749, 755], [664, 746, 753], [672, 745, 751], [680, 742, 749], [688, 736, 747], [696, 722, 743], [704, 718, 734], [712, 716, 726], [720, 716, 726], [728, 718, 727], [736, 720, 729], [744, 722, 730], [752, 724, 731], [760, 726, 733], [768, 728, 734]], [[864, 689, 696], [872, 688, 699], [880, 689, 702], [888, 690, 705], [896, 691, 707], [904, 692, 708], [912, 694, 709], [920, 696, 707], [928, 695, 705], [936, 694, 703], [944, 692, 700], [952, 691, 698], [960, 689, 694], [968, 687, 691]]];
    const EDGE = [[-14, 738, 760], [0, 738, 760], [8, 738, 760], [16, 738, 760], [24, 738, 760], [32, 738, 760], [40, 738, 760], [48, 738, 760], [56, 738, 760], [64, 738, 760], [72, 738, 760], [80, 738, 760], [88, 743, 761], [96, 743, 761], [104, 745, 759], [112, 747, 760], [120, 749, 761], [128, 750, 762], [136, 750, 764], [144, 754, 763], [152, 754, 766], [160, 756, 764], [168, 753, 765], [176, 757, 767], [184, 757, 770], [192, 757, 771], [200, 757, 774], [208, 758, 776], [216, 758, 779], [224, 755, 781], [232, 761, 782], [240, 761, 785], [248, 763, 785], [256, 761, 787], [264, 765, 788], [272, 766, 788], [280, 767, 789], [288, 766, 790], [296, 763, 787], [304, 770, 789], [312, 772, 787], [320, 775, 786], [328, 778, 786], [336, 778, 787], [344, 778, 788], [352, 778, 787], [360, 779, 790], [368, 779, 789], [376, 779, 791], [384, 780, 790], [392, 781, 792], [400, 783, 792], [408, 787, 793], [416, 785, 795], [424, 788, 796], [432, 786, 797], [440, 791, 799], [448, 792, 799], [456, 794, 801], [464, 792, 804], [472, 798, 805], [480, 798, 807], [488, 799, 808], [496, 800, 810], [504, 804, 812], [512, 805, 814], [520, 804, 816], [528, 807, 818], [536, 807, 819], [544, 809, 822], [552, 807, 821], [560, 810, 824], [568, 807, 822], [576, 811, 822], [584, 810, 823], [592, 809, 825], [600, 805, 827], [608, 804, 828], [616, 804, 830], [624, 803, 832], [632, 803, 835], [640, 803, 837], [648, 809, 841], [656, 815, 842], [664, 820, 847], [672, 826, 848], [680, 832, 853], [688, 830, 855], [696, 836, 859], [704, 836, 862], [712, 836, 867], [720, 838, 869], [728, 841, 872], [736, 843, 875], [744, 846, 877], [752, 848, 880], [760, 851, 882], [768, 854, 885], [776, 856, 886], [784, 859, 889], [792, 860, 891], [800, 863, 893], [808, 866, 895], [816, 870, 898], [824, 873, 901], [832, 876, 903], [840, 877, 905], [848, 880, 908], [856, 883, 910], [864, 885, 912], [872, 890, 913], [880, 892, 914], [888, 888, 915], [896, 887, 916], [904, 887, 916], [912, 898, 918], [920, 910, 918], [928, 914, 920], [936, 915, 920], [944, 916, 922], [952, 917, 924], [960, 919, 925], [968, 920, 928], [976, 922, 930], [984, 924, 934], [992, 928, 934], [1000, 931, 938], [1008, 933, 940], [1016, 936, 944], [1024, 938, 945], [1032, 939, 948], [1040, 943, 949], [1048, 946, 953], [1056, 946, 955], [1064, 947, 957], [1072, 950, 959], [1094, 956, 965]];
    const band = (rows, k) => rows.map((r) => [r[k], r[0]]);
    const strip = (rows) => band(rows, 1).concat(band(rows, 2).reverse());
    // a jagged polyline: points with small teeth between them (the bark is cut, not traced)
    const jag = (pts, amp, seed) => {
        const r = Motion.rng('owj' + seed), out = [];
        for (let i = 0; i < pts.length - 1; i++) {
            out.push(pts[i]);
            const [x0, y0] = pts[i], [x1, y1] = pts[i + 1];
            out.push([(x0 + x1) / 2 + (r() - 0.5) * amp, (y0 + y1) / 2 + (r() - 0.5) * amp * 0.4]);
        }
        out.push(pts[pts.length - 1]);
        return out;
    };

    G1.frame(press, () => {
        press.save();
        // the camera (measured on the panel's screen pitch and a shift search, frame by frame):
        // a push of 0.135 %/frame drifting 0.5 px/frame down-right, every frame (lf); the
        // repeat 6.24 % bigger, turned 3°, shifted per drawing
        let s = 1, rot = 0, dx = 0, dy = 0;
        if (again) { s = 1.0624; rot = 0.0524; [dx, dy] = (lf ?? d * 2) < 2 ? [-3.0, -8.5] : [-6.5, -1.0]; }
        else { const fm = (lf != null ? 108 + lf : 108.5 + 2 * d) - 112; s = 1 + 0.00135 * fm; dx = dy = 0.5 * fm; }
        press.each((g) => { g.translate(540 + dx, 540 + dy); g.rotate(rot); g.scale(s, s); g.translate(-540, -540); });
        const X0 = -60, X1 = 1140, Y0 = -80, Y1 = 1160; // bleed past the frame (the repeat is turned)

        // --- the hollow: olive black (navy over yellow), a purple haze, a confetti of specks
        // (measured mean ≈ [41, 48, 28]: navy over a slightly thin yellow, a trace of pink;
        // bluer in the middle, redder low down)
        fill(yellow, [[X0, Y0], [X1, Y0], [X1, Y1], [X0, Y1]], 1);
        fill(navy, [[X0, Y0], [X1, Y0], [X1, Y1], [X0, Y1]], 1);
        fill(pink, [[X0, Y0], [X1, Y0], [X1, Y1], [X0, Y1]], 0.22);
        blue.fillStyle = Riso.radial(blue, 570, 480, 20, 260, 0.3, 0);
        blue.fillRect(400, 150, 330, 700);
        // the confetti: fine specks (1–2.5 px: the texture the eye reads, but even at the
        // scale of a 9 px blur), each a hole in the navy with pink or blue in it
        const hollowBox = [430, -20, 720, 1100];
        for (const [ink, n, s0, s1, seed] of [['pink', 5200, 1, 2.6, 'hp'], ['blue', 3000, 1, 2.4, 'hb'], ['yellowOnly', 900, 1, 2, 'hy']]) {
            navy.save(); navy.globalCompositeOperation = 'destination-out'; marks(navy, seed, null, hollowBox, n, s0, s1, { v0: 0.5, v1: 0.2, stretch: 1.4 }); navy.restore();
            if (ink !== 'yellowOnly') marks(P(ink), seed, null, hollowBox, n, s0, s1, { v0: 0.9, v1: 0.55, stretch: 1.4 });
        }

        // --- the panel: paper with coarse yellow and pink dots (17.25 px screens)
        const panel = band(EDGE, 2).concat([[X1, Y1], [X1, Y0], [990, Y0], [960, -10], [756, 80]]).map(([x, y]) => [x, y]);
        panel.unshift([756, 80]);
        press.knockout((g) => { polyPath(g, panel); g.fill(); });
        clipped(yellow, (g) => polyPath(g, panel), (g) => dots(g, L.panelYellow, [700, -80, 1160, 1160], (x, y) => 0.42 + 0.00018 * y, { ink: 'yellow', seed: 11 }));
        clipped(pink, (g) => polyPath(g, panel), (g) => dots(g, L.panelPink, [700, -80, 1160, 1160], (x, y) => 0.32 - 0.00014 * y, { ink: 'pink', seed: 12 }));
        // --- the branch in the top right corner: green (coarse blue dots on yellow), a navy edge
        const branch = [[736, Y0], [1000, Y0], [970, -10], [952, 0], [756, 80], [740, 80]];
        press.knockout((g) => { polyPath(g, branch); g.fill(); });
        fill(yellow, branch, 0.85);
        clipped(blue, (g) => polyPath(g, branch), (g) => dots(g, L.branchBlue, [700, -80, 1000, 100], 0.8, { ink: 'blue', seed: 13 }));
        clipped(navy, (g) => polyPath(g, branch), (g) => dots(g, L.branchBlue, [700, -80, 1000, 100], 0.15, { ink: 'navy', seed: 14 }));
        taper(navy, [[752, 84], [850, 42], [952, 0], [990, -16]], 13, 15);
        taper(blue, [[752, 88], [850, 46], [952, 4], [990, -12]], 12, 14);

        // --- the bark between the hollow and the panel: a yellow ground with pink dots
        const bark = HOLLOW.concat(band(EDGE, 2).reverse());
        press.knockout((g) => { polyPath(g, bark); g.fill(); });
        fill(yellow, bark, 1);
        clipped(pink, (g) => polyPath(g, bark), (g) => dots(g, L.barkPink, [520, -20, 980, 620], 0.2, { ink: 'pink', seed: 15 }));
        // a chain of green dots along the hollow's edge and along the panel's edge
        const chain = (pts, dx, step, rad, seed) => {
            const r = Motion.rng('owc' + seed);
            for (let i = 0; i < pts.length - 1; i++) {
                const [x0, y0] = pts[i], [x1, y1] = pts[i + 1], len = Math.hypot(x1 - x0, y1 - y0), n = Math.max(1, Math.round(len / step));
                for (let k = 0; k < n; k++) {
                    const u = k / n, x = x0 + (x1 - x0) * u + dx + (r() - 0.5) * 4, y = y0 + (y1 - y0) * u + (r() - 0.5) * 3, rr = rad * (0.7 + 0.5 * r());
                    blue.fillStyle = T(0.95); blue.beginPath(); blue.arc(x, y, rr, 0, 7); blue.fill();
                    if (r() < 0.35) { navy.fillStyle = T(0.6); navy.beginPath(); navy.arc(x, y, rr * 0.8, 0, 7); navy.fill(); }
                }
            }
        };
        chain(HOLLOW.filter(([, y]) => y > 20 && y < 1060), 9, 15, 5, 'h');
        chain(EDGE.filter(([y]) => y > 60 && y < 640).map(([y, a]) => [a - 12, y]), 0, 15, 4.5, 'e');
        // the dark band and the red strips (jagged)
        const bandPoly = strip(BAND);
        fill(navy, bandPoly, 0.92);
        fill(blue, bandPoly, 0.35);
        REDS.forEach((rows) => fill(pink, strip(rows), 1));

        // --- the lower bark: green dots on the yellow (13.7 px screen); grass blades fan up
        // from the bottom to a point under the panel's edge (≈ 795, 580)
        const lower = HOLLOW.filter(([, y]) => y >= 520).concat(band(EDGE, 1).filter(([, y]) => y >= 520).reverse());
        clipped(blue, (g) => polyPath(g, lower), (g) => dots(g, L.grassBlue, [520, 500, 980, 1100], 0.36, { ink: 'blue', seed: 16 }));
        {
            const r = Motion.rng('owgrass');
            for (let i = 0; i < 30; i++) {
                const u = i / 29, xb = 700 + u * 250 + (r() - 0.5) * 12, xt = 780 + u * 40 + (r() - 0.5) * 20, yt = 580 + r() * 120 + Math.abs(u - 0.4) * 160;
                const pts = [[xb, 1096], [xb + (xt - xb) * 0.5 + (r() - 0.5) * 10, (1096 + yt) / 2], [xt, yt]];
                const kind = r(), w = 4 + r() * 8;
                if (kind < 0.34) { taper(blue, pts, w, 1.2, 1); taper(yellow, pts, w, 1.2, 1); }
                else if (kind < 0.5) { taper(navy, pts, w * 0.7, 1, 0.9); taper(blue, pts, w * 0.7, 1, 0.8); }
                else if (kind < 0.72) taper(pink, pts, w * 0.5, 1, 1);
                else press.knockout((g) => taper(g, pts, w * 0.35, 0.8));
            }
        }
        // the panel's dark edge: navy with blue, swelling where it meets the grass
        fill(navy, strip(EDGE), 0.95);
        fill(blue, strip(EDGE), 0.6);

        // --- the breast: yellow with a pink screen, rows of feather dashes
        const breast = [[X0, 330], [330, 330], [322, 450], [308, 540], [300, 660], [291, 780], [279, 900], [258, 990], [230, 1092], [X0, 1092]];
        press.knockout((g) => { polyPath(g, breast); g.fill(); });
        fill(yellow, breast, 1);
        clipped(pink, (g) => polyPath(g, breast), (g) => dots(g, L.breastPink, [-20, 330, 340, 1100], 0.16, { ink: 'pink', seed: 17 }));
        // feather dashes: [cx, cy, w, h] bounding boxes measured on the 112 frame (dark ones,
        // and the red slivers that ride above or below them), each drawn as a bent lens
        const DASH = [[22, 474, 44, 10], [95, 478, 44, 9], [190, 477, 27, 10], [245, 477, 26, 8], [64, 508, 24, 9], [190, 507, 41, 14], [248, 506, 37, 10], [116, 513, 29, 10], [290, 512, 20, 9], [10, 544, 21, 7], [106, 548, 15, 5], [174, 548, 36, 9], [241, 542, 38, 7], [52, 580, 37, 9], [110, 576, 21, 7], [130, 580, 18, 9], [161, 581, 24, 10], [236, 582, 16, 5], [274, 582, 32, 9], [50, 612, 18, 5], [93, 613, 16, 6], [164, 614, 21, 9], [230, 613, 29, 10], [281, 612, 26, 6], [62, 635, 27, 12], [128, 640, 44, 11], [181, 641, 20, 8], [222, 637, 15, 10], [284, 638, 33, 13], [174, 671, 25, 6], [235, 668, 20, 7], [232, 704, 41, 13], [49, 708, 24, 7], [116, 706, 27, 6], [188, 706, 41, 11], [45, 734, 24, 8], [252, 734, 37, 8], [98, 736, 37, 7], [134, 735, 16, 6], [202, 736, 36, 10], [57, 759, 32, 10], [104, 762, 31, 10], [150, 762, 32, 11], [210, 762, 22, 9], [255, 760, 24, 7], [86, 792, 28, 7], [178, 794, 25, 13], [44, 795, 33, 12], [134, 797, 19, 8], [218, 796, 13, 5], [94, 824, 35, 8], [222, 823, 19, 6], [160, 826, 31, 9], [174, 852, 26, 14], [60, 858, 21, 11], [126, 858, 16, 6], [229, 856, 28, 9], [54, 882, 36, 7], [110, 880, 35, 5], [181, 882, 44, 7], [244, 884, 33, 9], [158, 920, 30, 10], [210, 920, 30, 7], [118, 954, 29, 10], [170, 952, 40, 8], [95, 985, 32, 10], [134, 985, 23, 8], [182, 983, 17, 6], [203, 984, 18, 9], [121, 1042, 40, 8], [162, 1046, 26, 6], [164, 1078, 32, 5]];
        const REDDASH = [[44, 472, 17, 7], [188, 470, 13, 4], [124, 508, 27, 6], [186, 510, 24, 5], [258, 512, 16, 5], [293, 516, 14, 5], [43, 550, 16, 8], [52, 576, 16, 3], [107, 584, 16, 6], [160, 576, 18, 9], [220, 575, 13, 4], [278, 578, 31, 5], [127, 586, 20, 9], [236, 608, 36, 11], [282, 614, 27, 5], [166, 618, 19, 11], [60, 640, 20, 5], [188, 633, 31, 10], [283, 641, 26, 6], [226, 645, 26, 10], [114, 672, 16, 5], [241, 664, 28, 13], [54, 678, 13, 3], [196, 704, 31, 9], [46, 712, 21, 8], [232, 708, 27, 5], [101, 732, 34, 7], [51, 763, 18, 2], [178, 786, 25, 6], [49, 802, 14, 3], [62, 818, 37, 9], [224, 828, 23, 5], [58, 878, 17, 3], [242, 888, 15, 5], [96, 920, 26, 7], [155, 916, 12, 3], [228, 918, 13, 4], [123, 948, 26, 7], [190, 988, 32, 7], [48, 1014, 17, 9], [164, 1020, 23, 5], [120, 1038, 12, 2], [160, 1050, 20, 5], [164, 1076, 22, 5]];
        const lens = (g, [cx, cy, w, h], k, v) => {
            const r = Motion.rng('owl' + cx + '_' + cy), bend = (r() - 0.4) * h * 0.5, hw = w / 2 + 1, hh = h / 2 + 1;
            fill(g, [[cx - hw, cy + bend * 0.3], [cx - hw * 0.4, cy - hh - bend * 0.3], [cx + hw * 0.4, cy - hh - bend * 0.3], [cx + hw, cy + bend * 0.3], [cx + hw * 0.4, cy + hh - bend], [cx - hw * 0.4, cy + hh - bend]], v, true);
        };
        for (const b of REDDASH) lens(pink, b, 0, 1);
        for (const b of DASH) { lens(navy, b, 0, 0.72); lens(blue, b, 0, 0.85); }
        // the other wing coming in at the bottom left: a navy edge and a dotted brown
        const other = [[X0, 770], [0, 772], [5, 900], [12, 960], [26, 1010], [44, 1060], [56, 1092], [X0, 1092]];
        clipped(navy, (g) => polyPath(g, other), (g) => dots(g, L.wingNavy, [-60, 760, 60, 1100], 0.35, { ink: 'navy', seed: 18 }));
        clipped(pink, (g) => polyPath(g, other), (g) => dots(g, L.wingPink, [-60, 760, 60, 1100], 0.45, { ink: 'pink', seed: 23 }));
        taper(navy, [[-2, 772], [5, 900], [12, 960], [26, 1010], [44, 1060], [58, 1096]], 9, 13);

        // --- the wing: yellow, pink and navy screens (brown), dark bars, a red outer edge
        const WL = [[322, 446], [314, 480], [308, 510], [308, 540], [305, 570], [313, 600], [302, 630], [300, 660], [298, 690], [295, 720], [294, 750], [291, 780], [289, 810], [287, 840], [283, 870], [279, 900], [272, 930], [264, 960], [258, 990], [248, 1020], [240, 1050], [228, 1092]];
        const WR = [[369, 300], [401, 330], [422, 360], [434, 390], [470, 420], [477, 450], [481, 480], [488, 510], [493, 540], [497, 570], [500, 600], [505, 630], [506, 660], [507, 690], [506, 720], [505, 750], [504, 780], [503, 810], [503, 840], [499, 870], [491, 900], [480, 930], [470, 960], [455, 990], [441, 1020], [415, 1050], [392, 1092]];
        const wing = [[296, 342], [345, 322]].concat(WR, WL.slice().reverse(), [[318, 420], [300, 400]]);
        press.knockout((g) => { polyPath(g, wing); g.fill(); });
        fill(yellow, wing, 1);
        clipped(pink, (g) => polyPath(g, wing), (g) => dots(g, L.wingPink, [220, 290, 520, 1100], 0.6, { ink: 'pink', seed: 19 }));
        clipped(navy, (g) => polyPath(g, wing), (g) => dots(g, L.wingNavy, [220, 290, 520, 1100], (x, y) => (y < 400 ? 0.3 : 0.55), { ink: 'navy', seed: 20 }));
        // bars (centre line [x, y] left → right, width at the left end), measured on columns
        const BARS = [[[312, 486], [345, 488], [395, 474], [465, 482], 20], [[312, 564], [345, 559], [395, 547], [468, 558], 15], [[308, 617], [345, 611], [395, 601], [466, 603], 22],
            [[303, 686], [345, 680], [395, 670], [462, 680], 15], [[300, 750], [345, 747], [395, 740], [465, 754], 26], [[297, 816], [345, 808], [395, 805], [462, 805], 20],
            [[292, 876], [345, 867], [395, 870], [432, 876], 21], [[284, 941], [345, 933], [395, 942], [412, 944], 17], [[266, 1016], [345, 1012], [382, 1014], 13], [[250, 1062], [345, 1059], [378, 1069], 12]];
        for (const b of BARS) {
            const w = b.pop();
            clipped(navy, (g) => polyPath(g, wing), (g) => taper(g, b, w * 1.15, 3, 1));
            clipped(blue, (g) => polyPath(g, wing), (g) => taper(g, b, w * 1.15, 3, 0.5));
        }
        // feather shafts at the bottom: thin red lines fanning down
        for (let i = 0; i < 7; i++) taper(pink, [[352 - i * 6, 880 + i * 14], [330 - i * 12, 980 + i * 8], [300 - i * 16, 1096]], 1.5, 3.5, 1);
        // the edges: navy on the left, red on the right (inside the outline)
        taper(navy, WL.map(([x, y]) => [x + 5, y]), 9, 14);
        // the red edge: clean pink over yellow (no navy dots in it), ≈ 12 px at the shoulder,
        // 17 px at the middle (measured on rows)
        const WRin = WR.slice(1).map(([x, y]) => [x - 8, y]);
        erase(navy, (g) => clipped(g, (c) => polyPath(c, wing), (c) => taper(c, WRin, 12, 16, 1)));
        clipped(pink, (g) => polyPath(g, wing), (g) => taper(g, WRin, 12, 16, 1));
        clipped(yellow, (g) => polyPath(g, wing), (g) => taper(g, WRin, 12, 16, 1));

        // --- the head
        const face = [[X0, Y0], [446, Y0], [443, 0], [443, 30], [441, 60], [442, 90], [445, 120], [442, 150], [438, 180], [424, 210], [404, 240], [387, 270], [369, 300], [345, 322], [300, 345], [200, 372], [100, 368], [X0, 360]];
        press.knockout((g) => { smoothPath(g, face); g.fill(); });
        fill(pink, face, 1, true);
        fill(yellow, face, 1, true);
        // the face's texture: short streaks where the pink is missing (yellow), a few where
        // the yellow is (magenta), all leaning up to the right
        erase(pink, (g) => marks(g, 'fs', (c) => smoothPath(c, face), [-20, -20, 450, 350], 1100, 2, 6, { stretch: 2.8, ang: -0.55, spread: 0.7, v0: 0.8, v1: 0.35 }));
        erase(yellow, (g) => marks(g, 'fm', (c) => smoothPath(c, face), [-20, -20, 450, 350], 120, 3, 9, { stretch: 2.6, ang: -0.55, spread: 0.7, v0: 0.8, v1: 0.4 }));
        // the ruff under the beak: a yellow ground with pink dots and dark green dots (no
        // solid pink), hatched with dotted dark green strokes (≈ 18°, 19 px apart; read off a
        // 2.2× crop)
        const ruff = [[X0, 272], [40, 262], [80, 248], [110, 234], [132, 227], [150, 240], [175, 268], [200, 300], [230, 322], [262, 332], [300, 340], [304, 352], [200, 374], [100, 370], [X0, 362]];
        erase(pink, (g) => { smoothPath(g, ruff); g.fill(); });
        const ruffPink = lattice(-0.4, 2.32, 2.6417, 10.0867, -10.0084, 2.7199);
        clipped(pink, (g) => smoothPath(g, ruff), (g) => dots(g, ruffPink, [-60, 200, 320, 380], 0.42, { ink: 'pink', seed: 24 }));
        clipped(navy, (g) => smoothPath(g, ruff), (g) => dots(g, L.ruffNavy, [-60, 200, 320, 380], 0.12, { ink: 'navy', seed: 21 }));
        clipped(blue, (g) => smoothPath(g, ruff), (g) => dots(g, L.ruffNavy, [-60, 200, 320, 380], 0.15, { ink: 'navy', seed: 21 }));
        for (const [[x0, y0], [x1, y1]] of [[[105, 236], [164, 252]], [[77, 255], [168, 280]], [[62, 268], [182, 302]], [[40, 280], [191, 323]], [[20, 296], [196, 342]], [[60, 318], [170, 348]], [[0, 330], [80, 352]]]) {
            const len = Math.hypot(x1 - x0, y1 - y0), n = Math.floor(len / 9);
            for (let k = 0; k < n; k++) {
                const a = k / n, b = (k + 0.7) / n;
                const seg = [[x0 + (x1 - x0) * a, y0 + (y1 - y0) * a], [x0 + (x1 - x0) * b, y0 + (y1 - y0) * b]];
                clipped(navy, (g) => smoothPath(g, ruff), (g) => taper(g, seg, 5.5, 4.5, 0.75));
                clipped(blue, (g) => smoothPath(g, ruff), (g) => taper(g, seg, 5.5, 4.5, 0.8));
            }
        }
        // freckles
        marks(navy, 'owfr', (c) => { c.rect(160, 130, 290, 180); }, [160, 130, 450, 310], 46, 3, 7, { v0: 0.95 });
        // the eyes: a navy ring, the yellow iris (the pink knocked out), a navy pupil, a
        // white catchlight with a blue crescent under it
        for (const [cx, cy, px, py] of [[285, 113, 286, 116], [13, 81, 13, 84]]) {
            navy.fillStyle = T(1);
            navy.beginPath(); navy.arc(cx, cy, 91, 0, 7); navy.fill();
            erase(navy, (g) => { g.beginPath(); g.arc(cx, cy, 80, 0, 7); g.fill(); });
            erase(pink, (g) => { g.beginPath(); g.arc(cx, cy, 80, 0, 7); g.fill(); });
            navy.beginPath(); navy.arc(px, py, 53, 0, 7); navy.fill();
            blue.fillStyle = T(0.9); blue.beginPath(); blue.ellipse(px - 16, py - 24, 14, 8, -0.45, 0, 7); blue.fill();
            press.knockout((g) => { g.beginPath(); g.ellipse(px - 18, py - 27, 12, 6, -0.45, 0, 7); g.fill(); });
        }
        // the brow V (knocked out) and the beak (navy, a yellow sliver)
        press.knockout((g) => {
            // measured column by column (white extents on the 112 frame)
            polyPath(g, [[105, -20], [124, -20], [127, 0], [130, 25], [135, 57], [140, 89], [150, 110], [160, 89], [170, 71], [180, 52], [190, 35], [200, 16], [208, 0], [212, -20], [228, -20], [221, 0], [210, 17], [200, 38], [190, 62], [180, 90], [170, 119], [160, 139], [150, 143], [140, 142], [130, 141], [121, 126], [116, 90], [112, 50], [109, 20], [107, 0]]); g.fill();
        });
        const beak = [[119, 152], [133, 142], [152, 146], [159, 158], [151, 192], [139, 226], [132, 229], [124, 196], [117, 168]];
        erase(pink, (g) => { smoothPath(g, beak); g.fill(); });
        fill(navy, beak, 1, true);
        fill(blue, beak, 0.4, true);
        erase(navy, (g) => taper(g, [[128, 158], [129, 176], [131, 194]], 4.5, 3));
        // the mouth: a dark crescent
        fill(navy, [[214, 299], [250, 306], [292, 306], [322, 299], [348, 290], [334, 306], [304, 321], [270, 326], [238, 316]], 1, true);

        // --- the bib: white, a yellow rim along the top, pink dots along the bottom, blue specks
        // measured: top and bottom per column, right side per row (white extents)
        const bib = [[X0, 343], [0, 343], [20, 342], [40, 348], [60, 354], [80, 360], [100, 363], [120, 366], [140, 368], [160, 370], [180, 370], [200, 370], [220, 368], [240, 366], [260, 361], [280, 355], [302, 348], [303, 360], [298, 380], [293, 390], [288, 400], [278, 412], [273, 428], [262, 432], [240, 432], [220, 437], [200, 449], [180, 468], [160, 482], [140, 481], [120, 478], [100, 461], [80, 455], [60, 457], [40, 452], [20, 432], [0, 417], [X0, 416]];
        press.knockout((g) => { smoothPath(g, bib); g.fill(); });
        taper(yellow, [[X0, 340], [40, 345], [100, 360], [170, 367], [240, 363], [302, 345]], 6, 6);
        clipped(pink, (g) => smoothPath(g, bib), (g) => dots(g, L.breastPink, [-20, 380, 320, 490], (x, y) => {
            const edge = y - (443 + (x < 150 ? x * 0.25 : 38 - (x - 150) * 0.28));
            return edge > -10 ? 0.24 : 0;
        }, { ink: 'pink', seed: 22 }));
        marks(blue, 'owbib', (c) => smoothPath(c, bib), [10, 355, 290, 470], 26, 3, 7, { v0: 0.95 });
        press.restore();

        // --- film scratches: thin teal lines, new ones every drawing (measured per drawing)
        const SCR = again ? [[[150, 120], [95, 250], [40, 370]]] : [[], [], [[80, 150], [45, 250], [10, 345], [115, 170], [72, 240], [30, 310]], [[90, 160], [58, 255], [25, 350], [185, 215], [135, 300], [85, 390]], [[120, 215], [85, 290], [50, 370], [210, 230], [165, 315], [120, 400]], [[250, 250], [205, 325], [155, 400]]][Math.min(d, 6)] ?? [];
        for (let k = 0; k + 2 < SCR.length; k += 3) {
            const pts = SCR.slice(k, k + 3);
            taper(blue, pts, 2, 5, 0.95);
            taper(navy, pts, 1.5, 3.5, 0.9);
        }
    });
};
