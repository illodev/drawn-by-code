// Card «frogs» (reference 7.5–7.75 s, full frame): two frogs singing on a lily pad under a
// huge yellow moon, cattails and reeds, sound arcs. Authored in reference pixels (G2.px),
// measured on frame 180 (7.5 s) with 2× grid crops and colour-run scans.
// Separations (measured): sky = navy solid at the top, then navy dots (11.6 px lattice at
// 15°) over a pink solid that fades in from y 150 to 290; the moon = yellow with pink-dot
// maria (10.3 px at −15°); the frogs = yellow + blue solid (green) with fine yellow flecks
// (voids in the blue), navy dots shading the back, a lit yellow rim, a lighter foot (blue
// dots, 7.7 px); sacs = yellow + pink dots (7.7 px); reeds = navy + yellow (olive black);
// water = navy + a yellow screen. The reference holds everything still (frames 180–185
// differ only in green streaks falling across the moon from frame 183). Needs cards/_group2-util.js.
var CARDS = CARDS || {};
CARDS.frogs = (press, t, lf) => {
    const { T, px, poly, disc, ell, ringS, inside, blob, curve, taper, spline, speckle, lat, lerpT, field } = G2;
    const P = (ink, k) => press.plate(ink, k);
    const yellow = P('yellow'), yellowS = P('yellow', 'screen'), pink = P('pink');
    const blue = P('blue'), navy = P('navy'), navyS = P('navy', 'screen');
    const d = Math.floor(t * 12 + 1e-6), f = lf ?? 2 * d;
    const MX = 638, MY = 551, MRX = 434, MRY = 434; // the moon (edges at x 205 / 1072, top y 117, bottom 985 at x 650)
    const moon = (g) => g.ellipse(MX, MY, MRX, MRY, 0, 0, 7);
    // lattices measured on the reference [pitch, angle, a dot centre]
    const SKY = [11.57, 0.2635, 128.76, 746.37], MOON = [10.31, -0.2548, 316.2, 553.1];
    const FINE_P = [7.73, -0.2597, 558.9, 1000.8], FINE_B = [7.70, 0.2649, 394.6, 1031.06];
    px(press, () => {
        // ---- the sky
        navy.fillStyle = T(1); navy.fillRect(0, 0, 1080, 205);
        // the top is deeper than navy alone: a little blue over it
        const gb = blue.createLinearGradient(0, 0, 0, 320); gb.addColorStop(0, T(0.4)); gb.addColorStop(0.6, T(0.3)); gb.addColorStop(1, T(0));
        blue.fillStyle = gb; blue.fillRect(0, 0, 1080, 320);
        const navyT = (x, y) => lerpT([[200, 1.5], [230, 0.85], [290, 0.7], [360, 0.55], [440, 0.45], [600, 0.36], [1080, 0.34]], y);
        lat(SKY, navyT, navy, [0, 160, 1080, 1080]);
        const gp = pink.createLinearGradient(0, 180, 0, 330);
        gp.addColorStop(0, T(0.25)); gp.addColorStop(0.35, T(0.4)); gp.addColorStop(1, T(1));
        pink.fillStyle = T(0.25); pink.fillRect(0, 0, 1080, 180); pink.fillStyle = gp; pink.fillRect(0, 180, 1080, 900);
        // flecks in the navy: pink bits (navy cleared under them), a few blue and white ones
        navy.save(); navy.globalCompositeOperation = 'destination-out'; speckle(navy, 'sky', 0, 0, 1080, 330, 500, 0.7, 1.9, 0.85); navy.restore();
        speckle(pink, 'sky', 0, 0, 1080, 330, 500, 0.7, 1.9, 0.9);
        speckle(blue, 'skyb', 0, 0, 1080, 400, 90, 1, 2.4, 0.8);
        press.knockout((g) => speckle(g, 'skyw', 0, 0, 1080, 1030, 260, 0.5, 1.3, 0.8));
        // the pink rings round the moon (radii measured with runs: 487, 543, 617, 685)
        for (const [r, w] of [[487, 7], [543, 5], [553, 2], [617, 3.5], [685, 3], [700, 2], [752, 3]]) {
            navy.save(); navy.globalCompositeOperation = 'destination-out'; ringS(navy, MX, 556, r, w + 1.5, 1, Math.PI * 0.95, Math.PI * 2.05); navy.restore();
            ringS(pink, MX, 556, r, w, 1, Math.PI * 0.95, Math.PI * 2.05);
        }
        // ---- the moon: flat yellow, pink-dot maria with soft edges
        press.knockout((g) => { g.beginPath(); moon(g); g.fill(); });
        yellow.fillStyle = T(1); yellow.beginPath(); moon(yellow); yellow.fill();
        // a paper gap between the moon and the sky on the left
        press.knockout((g) => { g.lineWidth = 4; g.beginPath(); g.ellipse(MX, MY, MRX + 1, MRY + 1, 0, 1.9, 3.7); g.stroke(); });
        // a dark rim along the top of the moon (navy on the yellow: olive)
        inside(navy, moon, (g) => { g.lineWidth = 5; g.strokeStyle = T(0.9); g.beginPath(); g.ellipse(MX, MY, MRX, MRY, 0, 3.75, 6.1); g.stroke(); });
        const maria = field('frogs-maria', (g) => {
            for (const [pts, v] of [
                [[[250, 360], [275, 280], [330, 210], [420, 150], [520, 122], [640, 122], [700, 170], [690, 250], [640, 305], [560, 322], [470, 300], [390, 330], [310, 370]], 0.34],
                [[[206, 420], [270, 385], [350, 410], [420, 470], [410, 560], [385, 650], [440, 750], [470, 830], [380, 860], [290, 820], [230, 730], [205, 600]], 0.34],
                [[[905, 380], [985, 366], [1045, 392], [1056, 470], [1042, 570], [980, 594], [920, 562], [898, 470]], 0.32],
                [[[800, 590], [852, 584], [860, 652], [803, 656]], 0.24],
                [[[720, 630], [760, 625], [765, 660], [725, 665]], 0.08],
            ]) { g.fillStyle = T(v); g.beginPath(); G2.blobPath(g, pts); g.fill(); }
        }, 10);
        inside(pink, moon, (g) => lat(MOON, maria, g, [200, 110, 1080, 1000]));
        press.knockout((g) => speckle(g, 'moonw', 250, 150, 1050, 900, 70, 0.8, 1.8, 0.9));
        // green streaks falling across the moon, measured frame by frame (183–185: tapered,
        // sagging, ≈ 200 px long, sliding down-left ≈ (−8, +15) px a frame)
        const streak = (x0, y0, x1, y1) => { const pts = spline([[x0, y0], [(x0 + x1) / 2 + 6, (y0 + y1) / 2 - 8], [x1, y1]], 16); press.knockout((g) => taper(g, pts, 7, 1)); for (const [g, v] of [[yellow, 1], [blue, 1], [navy, 0.55]]) taper(g, pts, 6, v); };
        const STREAKS = { 3: [[675, 140, 845, 250]], 4: [[665, 155, 840, 260], [610, 240, 770, 335]], 5: [[660, 170, 830, 280], [600, 255, 750, 335]] };
        for (const s4 of STREAKS[Math.min(5, f)] ?? []) streak(...s4);
        // the sound arcs: red (pink on the yellow), two fans that cross into a net
        // (two families of four tapered arcs, traced point by point on a 1.6× grid crop)
        for (const pts of [
            [[640, 699], [746, 750], [809, 806], [852, 880], [865, 912]], [[627, 749], [727, 800], [790, 862], [815, 950]],
            [[612, 801], [696, 850], [746, 900], [762, 969]], [[596, 856], [665, 894], [696, 937], [709, 981]],
            [[674, 906], [740, 837], [840, 797]], [[696, 945], [765, 862], [846, 830]],
            [[727, 962], [790, 894], [852, 862]], [[759, 969], [815, 925], [865, 897]],
        ]) taper(pink, spline(pts, 20), 7.5, 1);
        // ---- the reeds: olive-black blades and cattails (navy + yellow), a red fringe
        const ink3 = (fn) => { press.knockout((g) => fn(g, 1)); for (const [g, v] of [[navy, 0.92], [yellow, 0.95], [blue, 0.35]]) fn(g, v); pink.save(); pink.translate(-3, 0); fn(pink, 0.35); pink.restore(); };
        const reed = (pts, w) => ink3((g, v) => taper(g, spline(pts, 20), w, v));
        const stalk = (pts, w) => ink3((g, v) => curve(g, pts, w, v));
        const cattail = (x, y0, y1, w) => ink3((g, v) => blob(g, [[x, y0], [x + w * 0.45, y0 + (y1 - y0) * 0.3], [x + w * 0.5, y0 + (y1 - y0) * 0.7], [x, y1], [x - w * 0.5, y0 + (y1 - y0) * 0.7], [x - w * 0.45, y0 + (y1 - y0) * 0.3]], v));
        // positions from colour-run scans of the olive-black on rows every 50 px
        stalk([[66, 236], [62, 400], [58, 550], [54, 700], [50, 850], [46, 1080]], 9); cattail(68, 104, 240, 38); stalk([[68, 58], [68, 108]], 3);
        stalk([[187, 400], [184, 500], [179, 650], [173, 800], [169, 950], [165, 1080]], 7); cattail(189, 258, 405, 36); stalk([[190, 208], [189, 262]], 3);
        reed([[128, 1080], [131, 900], [140, 750], [152, 600], [162, 500], [174, 398]], 13);
        reed([[222, 1010], [236, 800], [242, 650], [249, 538]], 10);
        reed([[258, 930], [289, 800], [320, 700], [336, 652]], 9);
        reed([[-6, 720], [5, 600], [21, 478]], 7);
        reed([[24, 1090], [20, 950], [22, 870]], 18);
        stalk([[998, 110], [1018, 200], [1036, 300], [1054, 450], [1062, 650], [1068, 800], [1066, 1080]], 8);
        cattail(1078, 372, 510, 34);
        // ---- the water: navy with pink flecks (a yellow screen on the far left), clean of the
        // sky's pink; glints = yellow bars with a paper core and a red lower fringe
        pink.save(); pink.globalCompositeOperation = 'destination-out'; pink.fillStyle = T(1); pink.fillRect(0, 1029, 1080, 60); pink.restore();
        poly(navy, [[0, 1029], [1080, 1029], [1080, 1080], [0, 1080]], 1);
        speckle(pink, 'water', 0, 1029, 1080, 1080, 700, 0.6, 1.6, 0.8);
        yellowS.fillStyle = T(0.3); yellowS.fillRect(0, 1029, 170, 51);
        for (const [x0, x1, y, w] of [[645, 830, 1047, 9], [480, 640, 1063, 6], [680, 722, 1072, 6], [870, 940, 1046, 6], [960, 1062, 1048, 7]]) {
            const bar = [[x0, y], [(x0 + x1) / 2, y - 1], [x1, y]], low = bar.map(([x, yy]) => [x, yy + w * 0.45]);
            press.knockout((g) => taper(g, bar, w + 2, 1));
            taper(yellow, bar, w + 1, 1); taper(pink, low, w * 0.45, 0.9);
            press.knockout((g) => taper(g, bar.map(([x, yy]) => [x, yy - 1]), w * 0.35, 1));
        }
        // ---- a frog, authored on the big one (its eye at 495, 835); the small one is the
        // same drawing mirrored at 0.57 (eye at 934, 884)
        const frog = (o) => {
            const { ex, ey, s, fx } = o, Q = (p) => p.map(([x, y]) => [ex + (x - 495) * s * fx, y >= 1100 ? 1090 : ey + (y - 835) * s]), X = (x) => ex + (x - 495) * s * fx, Y = (y) => ey + (y - 835) * s;
            const body = Q([[165, 1100], [162, 1000], [168, 958], [184, 934], [212, 910], [252, 886], [302, 866], [360, 852], [410, 846], [455, 847], [530, 852], [576, 867], [606, 886], [617, 906], [610, 919], [585, 928], [550, 936], [520, 950], [505, 970], [498, 1000], [500, 1040], [505, 1100]]);
            const bodyP = (g) => G2.blobPath(g, body);
            press.knockout((g) => { g.beginPath(); bodyP(g); g.fill(); });
            blob(yellow, body, 1); blob(blue, body, 1);
            // the lit rim along the back: the blue shifted down-right (a yellow crescent)
            inside(blue, bodyP, (g) => { g.globalCompositeOperation = 'destination-in'; g.fillStyle = T(1); g.beginPath(); G2.blobPath(g, body.map(([u, v]) => [u + 6 * s * fx, v + 9 * s])); g.fill(); });
            // the lighter foot: blue as dots (7.7 px lattice)
            const foot = Q([[336, 1040], [372, 1025], [420, 1020], [462, 1028], [478, 1045], [484, 1100], [336, 1100]]);
            inside(blue, (g) => G2.path(g, foot), (g) => { g.globalCompositeOperation = 'destination-out'; g.fillStyle = T(1); g.fillRect(0, 0, 1080, 1080); });
            inside(blue, (g) => { G2.path(g, foot); }, (g) => lat(FINE_B, () => 0.62, g, [X(330) - 60, Y(980), X(482) + 60, 1080]));
            // the back in shade: navy dots thinning down from the top edge
            inside(navy, bodyP, (g) => lat([7.7, 0.785, ex, ey], (x, y) => Math.max(0, 0.4 - (y - Y(850)) / (50 * s) * 0.4), g, [X(165) - 400, Y(840), X(620) + 400, Y(910)]));
            // fine yellow flecks all over the green (voids in the blue plate)
            inside(blue, bodyP, (g) => { g.globalCompositeOperation = 'destination-out'; speckle(g, 'frf' + ex, Math.min(X(165), X(620)), Y(845), Math.max(X(165), X(620)), 1080, Math.round(800 * s * s), 0.5, 0.9, 0.95); });
            // spots
            for (const [u, v, r] of [[370, 877, 9], [302, 892, 9], [225, 937, 9], [380, 945, 12], [215, 1022, 12]]) for (const [g, k] of [[navy, 0.95], [pink, 0.45]]) disc(g, X(u), Y(v), r * s, k);
            // the hind leg and the toes: dark tapered lines (navy + pink)
            const dark = (pts, w) => { for (const [g, v] of [[navy, 0.95], [pink, 0.5]]) taper(g, spline(Q(pts), 14), w * s, v); };
            dark([[168, 962], [260, 990], [352, 1018]], 6);
            dark([[168, 1076], [260, 1046], [348, 1020]], 6);
            dark([[340, 1024], [350, 1045], [362, 1064]], 4);
            dark([[372, 1012], [398, 1030], [422, 1052]], 4);
            dark([[436, 1000], [460, 1012], [478, 1030]], 4);
            // a purple wedge of water between the toes
            const wedge = Q([[392, 1064], [426, 1048], [434, 1070]]);
            press.knockout((g) => { G2.path(g, wedge); g.fill(); });
            poly(navy, wedge, 0.7); poly(pink, wedge, 0.9);
            // the mouth: a dark line with a red tick
            for (const [g, v] of [[navy, 0.95], [pink, 0.5]]) taper(g, spline(Q([[448, 916], [490, 913], [528, 913], [570, 911], [612, 912]]), 16), 7 * s, v);
            disc(pink, X(490), Y(910), 3 * s, 1);
            // the tympanum: a dark ring, a green ring, a yellow centre
            ringS(navy, X(412), Y(902), 22 * s, 5 * s, 0.95); ringS(pink, X(412), Y(902), 22 * s, 5 * s, 0.5);
            press.knockout((g) => { g.beginPath(); g.arc(X(412), Y(902), 12 * s, 0, 7); g.fill(); });
            disc(yellow, X(412), Y(902), 12 * s, 1);
            // the eye: dark outline, a red ring inside it (fat at the lower right), yellow
            // ball, a dark pupil and a white highlight
            const ER = 42 * s;
            press.knockout((g) => { g.beginPath(); g.arc(X(495), Y(835), ER, 0, 7); g.fill(); });
            disc(yellow, X(495), Y(835), ER, 1);
            ringS(pink, X(495) + 2 * s * fx, Y(835) + 2 * s, ER - 6 * s, 7 * s, 1);
            for (const [g, v] of [[navy, 0.95], [pink, 0.6]]) ringS(g, X(495), Y(835), ER - 2 * s, 4 * s, v);
            for (const [g, v] of [[navy, 1], [pink, 0.6], [yellow, 0.6]]) ell(g, X(495), Y(839), 22 * s, 12.5 * s, 0, v);
            press.knockout((g) => { g.beginPath(); g.ellipse(X(479), Y(819), 7 * s, 6 * s, 0, 0, 7); g.fill(); });
            // the sac: yellow, pink dots denser to the lower right, a dark rim on the left,
            // a red rim on the right, a white highlight arc
            const [sx, sy, sr] = [X(555), Y(1005), (60 + o.pump) * s];
            press.knockout((g) => { g.beginPath(); g.arc(sx, sy, sr, 0, 7); g.fill(); });
            disc(yellow, sx, sy, sr, 1);
            inside(pink, (g) => g.arc(sx, sy, sr, 0, 7), (g) => lat(FINE_P, (x, y) => 0.16 + 0.22 * Math.min(1, Math.hypot(x - sx + 20 * s * fx, y - sy + 25 * s) / (sr * 1.3)), g, [sx - sr, sy - sr, sx + sr, sy + sr]));
            ringS(pink, sx, sy, sr - 2 * s, 5 * s, 1, fx > 0 ? -1.2 : 1.9, fx > 0 ? 1.4 : 4.3);
            for (const [g, v] of [[navy, 0.9], [pink, 0.4]]) ringS(g, sx, sy, sr - 1.5 * s, 3.5 * s, v, fx > 0 ? 1.9 : -1.2, fx > 0 ? 4.1 : 1.1);
            press.knockout((g) => { g.lineWidth = 5 * s; g.lineCap = 'round'; g.beginPath(); fx > 0 ? g.arc(sx, sy, sr * 0.8, -1.4, -0.55) : g.arc(sx, sy, sr * 0.8, -2.6, -1.75); g.stroke(); });
        };
        const pump = 0;
        frog({ ex: 495, ey: 835, s: 1, fx: 1, pump });
        // the small frog's lily pad (green, a dark rim) under it, then the frog
        const pad2 = [[815, 1080], [830, 1056], [900, 1044], [1000, 1042], [1080, 1046], [1080, 1080]];
        press.knockout((g) => { G2.path(g, pad2); g.fill(); });
        for (const [g, v] of [[yellow, 1], [blue, 0.9], [navyS, 0.35]]) poly(g, pad2, v);
        // the small frog (facing left), measured on its own 3× crop
        {
            const body = [[862, 918], [880, 902], [910, 893], [935, 888], [975, 886], [1020, 896], [1060, 908], [1090, 915], [1090, 1046], [946, 1046], [943, 1000], [940, 966], [905, 948], [874, 933]];
            const bodyP = (g) => G2.blobPath(g, body);
            press.knockout((g) => { g.beginPath(); bodyP(g); g.fill(); });
            blob(yellow, body, 1); blob(blue, body, 1);
            inside(blue, bodyP, (g) => { g.globalCompositeOperation = 'destination-in'; g.fillStyle = T(1); g.beginPath(); G2.blobPath(g, body.map(([u, v]) => [u - 2, v + 6])); g.fill(); });
            inside(navy, bodyP, (g) => lat([7.7, 0.785, 934, 884], (x, y) => Math.max(0, 0.35 - (y - 890) / 30 * 0.35), g, [850, 880, 1080, 930]));
            const thigh = [[962, 994], [1000, 986], [1082, 974], [1082, 1042], [975, 1042], [958, 1020]];
            inside(blue, (g) => G2.path(g, thigh), (g) => { g.globalCompositeOperation = 'destination-out'; g.fillStyle = T(1); g.fillRect(0, 0, 1080, 1080); });
            inside(blue, (g) => G2.path(g, thigh), (g) => lat(FINE_B, () => 0.62, g, [950, 970, 1080, 1050]));
            inside(blue, bodyP, (g) => { g.globalCompositeOperation = 'destination-out'; speckle(g, 'frs', 860, 886, 1080, 1046, 350, 0.5, 1.0, 0.95); });
            const dark = (pts, w) => { for (const [g, v] of [[navy, 0.95], [pink, 0.5]]) taper(g, spline(pts, 14), w, v); };
            dark([[972, 1000], [1030, 988], [1082, 978]], 4);
            dark([[988, 1022], [1030, 1030], [1072, 1037]], 4);
            dark([[866, 925], [900, 930], [930, 932], [962, 934]], 5);
            const wedge = [[990, 1023], [1026, 1017], [1012, 1031]];
            press.knockout((g) => { G2.path(g, wedge); g.fill(); });
            poly(navy, wedge, 0.35); poly(pink, wedge, 1);
            for (const [g, v] of [[navy, 0.95], [pink, 0.45]]) disc(g, 1000, 946, 7, v);
            ringS(navy, 983, 925, 11, 4, 0.95); ringS(pink, 983, 925, 11, 4, 0.5);
            press.knockout((g) => { g.beginPath(); g.arc(983, 925, 6.5, 0, 7); g.fill(); });
            disc(yellow, 983, 925, 6.5, 1);
            press.knockout((g) => { g.beginPath(); g.arc(935, 882, 23, 0, 7); g.fill(); });
            disc(yellow, 935, 882, 23, 1);
            ringS(pink, 936, 883, 19.5, 4, 1);
            for (const [g, v] of [[navy, 0.95], [pink, 0.6]]) ringS(g, 935, 882, 22, 2.5, v);
            for (const [g, v] of [[navy, 1], [pink, 0.6], [yellow, 0.6]]) ell(g, 933, 884, 12, 7, 0, v);
            press.knockout((g) => { g.beginPath(); g.arc(944, 872, 4, 0, 7); g.fill(); });
            const [sx, sy, sr] = [897, 990, 36 - pump * 0.3];
            press.knockout((g) => { g.beginPath(); g.arc(sx, sy, sr, 0, 7); g.fill(); });
            disc(yellow, sx, sy, sr, 1);
            inside(pink, (g) => g.arc(sx, sy, sr, 0, 7), (g) => lat([7.75, -0.2544, 899.56, 976.2], (x, y) => 0.18 + 0.2 * Math.min(1, Math.hypot(x - sx + 12, y - sy + 14) / (sr * 1.3)), g, [sx - sr, sy - sr, sx + sr, sy + sr]));
            ringS(pink, sx, sy, sr - 2, 4, 1, -1.0, 1.6);
            for (const [g, v] of [[navy, 0.8], [pink, 0.4]]) ringS(g, sx, sy, sr - 1.5, 3, v, 1.8, 3.6);
        }
    });
};
