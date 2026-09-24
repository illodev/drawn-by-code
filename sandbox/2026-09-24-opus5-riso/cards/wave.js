// Card «wave» (reference 8.25–8.5 s, full frame): a curling ocean wave with the sun inside
// its barrel, an orange sky, foam, a green rock in the corner. Authored in reference pixels
// (G2.px), measured on the 8.3 s frame. Separations: sky = yellow + pink dots (orange); the
// wave = blue + navy dots (teal), yellow dots on its crest (green), deep water = navy +
// blue with pink flecks; the sun = yellow with blue dots; foam and the lip = paper
// (knockouts); crest hatching = blue strokes on paper. Per drawing the swirl lines and the
// spray shift. Needs cards/_group2-util.js.
var CARDS = CARDS || {};
CARDS.wave = (press, t) => {
    const { T, px, poly, disc, fillWith, inside, blob, blobPath, curve, taper, spline, speckle, lat, lerpT } = G2;
    const P = (ink, k) => press.plate(ink, k);
    const yellow = P('yellow'), yellowS = P('yellow', 'screen'), pink = P('pink'), pinkS = P('pink', 'screen');
    const blue = P('blue'), blueS = P('blue', 'screen'), navy = P('navy'), navyS = P('navy', 'screen');
    const d = Math.floor(t * 12 + 1e-6), jig = (d % 2) * 4;
    const grad = (g, x0, y0, x1, y1, stops) => { const gr = g.createLinearGradient(x0, y0, x1, y1); for (const [p, v] of stops) gr.addColorStop(p, T(v)); return gr; };
    const SX = 770, SY = 548, SR = 128; // (sun edges measured: left 642, top 419, horizon 662) // the barrel (the sun sits in it)
    px(press, () => {
        // the sky: yellow ink, pink dots growing towards the top (orange)
        yellow.fillStyle = T(1); yellow.fillRect(0, 0, 1080, 1080);
        lat([12.53, -0.26, 170.12, 248.74], (x, y) => lerpT([[0, 0.72], [200, 0.45], [420, 0.22], [600, 0.12]], y), pink, [0, 0, 1080, 700]); // the sky's pink dots, on the reference's lattice
        // the paper above the crest (foam and cloud), a scrap of orange sky in the corner
        const paperTop = [[520, 240], [590, 170], [660, 90], [740, 30], [770, 0], [1080, 0], [1080, 210], [1040, 150], [960, 100], [840, 75], [690, 95], [580, 170]]; // (edges read off a 1× crop of the crest)
        press.knockout((g) => { g.beginPath(); blobPath(g, paperTop); g.fill(); });
        blob(yellow, [[975, -20], [1090, -20], [1090, 50], [1040, 55], [990, 30]], 1);
        blob(pinkS, [[975, -20], [1090, -20], [1090, 50], [1040, 55], [990, 30]], 0.6);
        // the wave: its outline, teal body, deep water below
        const wave = [[0, 612], [90, 575], [200, 505], [320, 478], [395, 390], [470, 290], [530, 215], [580, 170], [690, 95], [840, 75], [960, 100], [1040, 150], [1080, 210], [1080, 1080], [0, 1080]];
        const wp = (g) => G2.path(g, wave);
        press.knockout((g) => { wp(g); g.fill(); });
        fillWith(blue, wp, (g) => grad(g, 0, 150, 0, 1000, [[0, 0.88], [0.5, 0.85], [0.7, 0.25], [1, 0.05]]));
        fillWith(navy, wp, (g) => grad(g, 0, 500, 0, 950, [[0, 0.15], [0.3, 0.85], [1, 1]]));
        fillWith(navy, wp, (g) => grad(g, 300, 0, 0, 0, [[0, 0], [1, 0.35]]));
        inside(navyS, wp, (g) => { g.fillStyle = grad(g, 0, 100, 0, 700, [[0, 0.3], [1, 0.45]]); g.fillRect(0, 0, 1080, 1080); });
        // the crest's top is lighter: no navy dots there (blue alone, then green)
        inside(navyS, wp, (g) => { g.globalCompositeOperation = 'destination-out'; g.fillStyle = Riso.radial(g, 820, 120, 80, 330, 1, 0); g.fillRect(0, 0, 1080, 700); });
        // the crest catching the light: yellow dots over the blue (green), top right
        // (measured: yellow dots on a 11.3 px lattice at 45° over x 650–1060, y 100–560)
        const crest = G2.field('wave-crest', (g) => { g.fillStyle = T(0.75); g.beginPath(); blobPath(g, [[660, 120], [800, 90], [960, 110], [1060, 170], [1070, 400], [1020, 560], [900, 560], [800, 420], [700, 330], [640, 220]]); g.fill(); }, 40);
        inside(yellow, wp, (g) => lat([11.31, 0.785, 879.06, 294.83], crest, g, [600, 60, 1080, 620]));
        inside(navy, wp, (g) => { g.globalCompositeOperation = 'destination-out'; g.fillStyle = Riso.radial(g, 900, 300, 60, 330, 0.9, 0); g.fillRect(0, 0, 1080, 1080); });
        // pink flecks in the deep water
        inside(pink, wp, (g) => speckle(g, 'deep', 0, 600, 1080, 1080, 700, 0.8, 2.4, 0.9));
        inside(pinkS, wp, (g) => { g.fillStyle = grad(g, 0, 600, 0, 1000, [[0, 0], [0.4, 0.3], [1, 0.45]]); g.fillRect(0, 0, 1080, 1080); });
        inside(pinkS, wp, (g) => { g.fillStyle = grad(g, 0, 850, 0, 1080, [[0, 0], [1, 0.25]]); g.fillRect(560, 850, 520, 230); });
        // the barrel: the sun fills it (yellow with blue dots, green) above a yellow horizon;
        // the tube floor below is teal; the curl's wall cuts it on the right
        // (the curl's inner edge, a big arc on the right, trims the sun)
        const hole = (g) => { g.arc(SX, SY, SR, 2.0, -0.9); g.arc(1250, SY, 320, -2.6, 2.75, true); g.closePath(); };
        press.knockout((g) => { g.beginPath(); hole(g); g.fill(); });
        inside(yellow, hole, (g) => { g.fillStyle = T(1); g.fillRect(0, 0, 1080, 668); });
        inside(blueS, hole, (g) => { g.fillStyle = grad(g, 640, 0, 950, 0, [[0, 0.3], [1, 0.45]]); g.fillRect(0, 0, 1080, 650); });
        inside(pink, hole, (g) => speckle(g, 'sun', SX - 160, 380, SX + 160, 660, 120, 0.8, 1.8, 0.9));
        inside(pinkS, hole, (g) => { g.fillStyle = T(0.14); g.fillRect(0, 648, 1080, 22); });
        inside(blue, hole, (g) => { g.fillStyle = T(0.85); g.fillRect(0, 668, 1080, 400); });
        inside(navyS, hole, (g) => { g.fillStyle = T(0.4); g.fillRect(0, 668, 1080, 400); });
        // the tube floor: teal (blue with navy dots) from the horizon down to the foam
        const floor = [[640, 664], [1080, 664], [1080, 790], [900, 800], [760, 780], [690, 720]];
        navy.save(); navy.globalCompositeOperation = 'destination-out'; poly(navy, floor, 1); navy.restore();
        poly(blue, floor, 0.95); poly(navyS, floor, 0.3);
        // the horizon behind the lip, right of the barrel
        // (measured at 1.5×: the sky shows through behind the curl as a yellow wedge with red
        // dots, a white band of spray above it, the curl's back in blue with navy dots)
        const behind = [[995, 640], [1080, 598], [1080, 664], [985, 664]];
        press.knockout((g) => { G2.path(g, behind); g.fill(); });
        poly(yellow, behind, 1); inside(pink, (g) => G2.path(g, behind), (g) => lat([12.53, -0.26, 170.12, 248.74], () => 0.12, g, [980, 590, 1080, 670]));
        press.knockout((g) => taper(g, [[960, 640], [1010, 615], [1080, 585]], 22, 1));
        // crest hatching: short blue strokes on the paper above the wave
        inside(blue, (g) => { g.beginPath(); blobPath(g, paperTop); }, (g) => {
            const r = Motion.rng('hatch' + (d % 2)); g.strokeStyle = T(0.85); g.lineCap = 'round';
            for (let i = 0; i < 1100; i++) {
                const u = r(), a = Math.PI + 0.35 + u * 2.1, rad = 330 + r() * 90 * (1 - Math.abs(u - 0.5) * 1.2), x = 810 + Math.cos(a) * rad * 1.05, y = 470 + Math.sin(a) * rad * 1.1;
                if (y > 470 || x < 560) continue;
                g.lineWidth = 1.4 + r() * 1.6; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (r() - 0.5) * 6, y + 10 + r() * 16); g.stroke();
            }
        });
        // the swirl: navy strokes and paper lines (with a pink edge) round the barrel
        const arc = (r, a0, a1, cx = SX, cy = SY + 20) => { const pts = []; for (let i = 0; i <= 20; i++) { const a = a0 + (a1 - a0) * i / 20; pts.push([cx + Math.cos(a) * r * 1.05, cy + Math.sin(a) * r]); } return pts; };
        for (const [r, a0, a1, w] of [[210, -3.25, -0.5, 5], [262, -3.0, -0.35, 6], [318, -2.9, -0.45, 5], [370, -2.55, -1.1, 4.5], [240, -2.2, 0.25, 4]]) taper(navy, arc(r + jig, a0, a1), w * 1.3, 0.95);
        for (const [r, a0, a1, w] of [[228, -3.1, -1.2, 4], [290, -3.25, -0.9, 4.5], [345, -3.0, -1.4, 4], [196, -2.7, -1.6, 3]]) {
            const pts = arc(r - jig * 0.5, a0, a1);
            press.knockout((g) => taper(g, pts, w, 1));
            taper(pink, pts.map(([x, y]) => [x, y - 3]), w * 0.45, 0.9);
        }
        // the white foam along the lower crest on the left (ragged underside)
        const foam = [[80, 585], [140, 548], [210, 510], [270, 500], [330, 490], [322, 510], [300, 520], [300, 552], [290, 520], [240, 518], [200, 530], [150, 560], [95, 590]];
        press.knockout((g) => { g.beginPath(); blobPath(g, foam); g.fill(); });
        curve(blue, [[130, 548], [210, 512], [300, 505]], 3, 0.7);
        press.knockout((g) => speckle(g, 'foamL' + (d % 2), 260, 510, 330, 570, 20, 1.2, 3, 1));
        // the lip: a white curl falling on the right, spray at its foot
        const lip = [[1060, 575], [1010, 600], [975, 640], [960, 690], [952, 730], [930, 765], [905, 778]];
        press.knockout((g) => taper(g, spline(lip, 24), 30, 1));
        press.knockout((g) => curve(g, [[1080, 560], [1060, 575], [1040, 600]], 14, 1));
        curve(blue, [[1045, 610], [1030, 650], [1020, 700]], 5, 0.8);
        press.knockout((g) => speckle(g, 'spray' + (d % 2), 880, 700, 990, 800, 50, 1.5, 4, 1));
        // foam streaks on the water, bottom right (white strokes, pink edges)
        const r3 = Motion.rng('streak');
        for (let i = 0; i < 22; i++) {
            const y = 800 + r3() * 90, x0 = 700 + r3() * 200 + (y - 800) * 0.8, x1 = Math.min(1085, x0 + 120 + r3() * 260), w = 4 + r3() * 7, pts = [[x0, y], [(x0 + x1) / 2, y - 3 + r3() * 6], [x1, y - 6 + jig]];
            press.knockout((g) => taper(g, spline(pts, 10), w, 1));
            if (i % 3 === 0) taper(pink, spline(pts, 10).map(([x, yy]) => [x, yy + w * 0.5]), w * 0.3, 0.8);
        }
        for (const [y, x0, x1] of [[985, 860, 1080], [1040, 920, 1080]]) press.knockout((g) => taper(g, [[x0, y], [(x0 + x1) / 2, y - 4], [x1, y - 8]], 6, 1));
        // the spray at the foot of the curl: a dense spatter of paper (1.5× crop)
        press.knockout((g) => { const r = Motion.rng('spray2'); for (let i = 0; i < 700; i++) { const x = 860 + r() * 220, y = 740 + r() * 130 * (0.4 + 0.6 * r()); g.fillRect(x, y, 1.5 + r() * 4, 1.5 + r() * 3); } });
        // pink streaks in the deep water, on the left
        for (const pts of [[[300, 690], [370, 665], [450, 640]], [[140, 830], [220, 800], [300, 785]], [[240, 865], [320, 840], [400, 820]], [[130, 880], [190, 860]], [[290, 720], [330, 710]]]) taper(pink, spline(pts, 10), 4.5, 1);
        // the green rock in the corner: yellow + blue + navy, a white edge, white pits
        const rock = [[-10, 905], [135, 899], [270, 912], [405, 960], [540, 1027], [598, 1085], [-10, 1085]];
        press.knockout((g) => { G2.path(g, rock); g.fill(); });
        poly(yellow, rock, 1); poly(blue, rock, 0.3); poly(navy, rock, 0.92); // olive black (≈ [36, 45, 15])
        inside(navyS, (g) => G2.path(g, rock), (g) => { g.fillStyle = Riso.radial(g, 200, 1080, 60, 330, 0.7, 0.2); g.fillRect(0, 880, 640, 200); });
        inside(navy, (g) => G2.path(g, rock), (g) => { g.globalCompositeOperation = 'destination-out'; g.lineWidth = 34; g.strokeStyle = T(0.8); g.beginPath(); g.moveTo(-10, 924); g.quadraticCurveTo(250, 930, 520, 1030); g.stroke(); });
        press.knockout((g) => { g.lineWidth = 6; g.lineCap = 'round'; g.beginPath(); g.moveTo(0, 906); g.bezierCurveTo(120, 896, 300, 915, 400, 958); g.bezierCurveTo(480, 992, 560, 1040, 606, 1082); g.stroke(); });
        press.knockout((g) => { const r = Motion.rng('pits'); for (let i = 0; i < 30; i++) { const x = r() * 560, y = 918 + r() * 40 + x * 0.15; g.beginPath(); g.arc(x, y, 2 + r() * 3, 0, 7); g.fill(); } });
        for (const pts of [[[20, 975], [60, 968], [85, 962]], [[300, 1020], [380, 1030], [440, 1050]], [[310, 1050], [380, 1060], [430, 1078]]]) press.knockout((g) => taper(g, spline(pts, 10), 6, 1));
    });
};
