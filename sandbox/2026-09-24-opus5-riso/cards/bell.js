// Card «bell» (reference 5.04–5.45 s, full frame; opens in a circle at 4.98). A temple bell
// hanging from a beam, a log striker on two ropes, a pine branch, sound arcs in yellow over a
// pink-to-orange sky, a yellow sun behind the sea, the sea in two layers of purple.
// Authored in reference pixels (G1.frame), measured on the 5.25 s frame. Separations:
// sky = pink + yellow screens ramping against each other; arcs and cloud streaks = pink
// knocked out over yellow (white in the sea); bell, beam and log = navy over pink + yellow
// (dark brown-green) with red lines where the navy is knocked out; the bell's highlight a
// navy screen ramp; sea = pink + navy screens above, navy solid + pink screen below.
var CARDS = CARDS || {};
CARDS.bell = (press, t, lf, o = {}) => {
    const { T, fill, stroke, taper, smoothPath, polyPath, clipped, specks } = G1;
    const P = (ink, k) => press.plate(ink, k);
    const pink = P('pink'), pinkS = P('pink', 'screen'), yellow = P('yellow'), yellowS = P('yellow', 'screen');
    const blue = P('blue'), blueS = P('blue', 'screen'), navy = P('navy'), navyS = P('navy', 'screen');
    const erase = (g, fn) => { g.save(); g.globalCompositeOperation = 'destination-out'; g.fillStyle = '#000'; g.strokeStyle = '#000'; g.lineCap = 'round'; fn(g); g.restore(); };
    const d = Math.floor(t * 12 + 1e-6);
    // the camera, measured on the sky's yellow screen frame by frame (10.10 px on 120 → 10.60 on
    // 131): a push of 0.48 %/frame drifting left and up; the repeat is the print 4.4 % bigger
    // and turned −2.95° (its screen: 10.81 px at 42.4° against 10.35 px at 45.4°)
    const f = lf != null ? 120 + lf : 120.5 + 2 * d;
    const cam = o.ring ? [1.0439, -0.0515, 2, -3] : [1 + 0.00482 * (f - 126), 0, -0.6 * (f - 126), -0.3 * (f - 126)];
    const swing = 0; // measured: the bell hangs still (the whole frame scales, nothing turns)
    // the sound rings: one family of circles round (650, 655), just left of where the log
    // strikes; a centre search over the yellow (sky) and white (sea) line pixels gives the same
    // centre and radii for both (188, 264, 345, 430, 512, 606 …, ≈ 90 px apart)
    const CX = 650, CY = 655;
    const SKY_R = [188, 264, 345, 430, 512, 606, 700, 795, 890], SEA_R = SKY_R;
    const arcsPath = (g, w, R = SKY_R) => { g.lineWidth = w; for (const r of R) { g.beginPath(); g.arc(CX, CY, r, 0, Math.PI * 2); g.stroke(); } };
    // the sea's edges, measured on columns every 30 px (126 frame)
    const seaTop = [[-10, 856], [0, 850], [30, 834], [60, 817], [90, 813], [120, 823], [150, 838], [180, 880], [640, 900], [690, 845], [720, 828], [750, 781], [780, 791], [810, 789], [840, 764], [870, 770], [900, 774], [930, 755], [960, 746], [990, 754], [1020, 755], [1050, 745], [1090, 740], [1090, 1090], [-10, 1090]];
    const seaLow = [[-10, 978], [0, 976], [30, 962], [60, 971], [90, 990], [120, 978], [180, 968], [300, 975], [450, 988], [480, 998], [510, 982], [540, 982], [570, 993], [630, 999], [690, 950], [720, 932], [750, 938], [780, 947], [810, 966], [840, 948], [870, 928], [900, 951], [930, 958], [960, 958], [990, 939], [1020, 943], [1050, 931], [1090, 928], [1090, 1090], [-10, 1090]];

    G1.frame(press, () => {
        press.save();
        press.each((g) => { g.translate(540 + cam[2], 540 + cam[3]); g.rotate(cam[1]); g.scale(cam[0], cam[0]); g.translate(-540, -540); });
        // --- sky: pink fading, yellow rising towards the horizon
        // (hand-set on the screens measured on the 126 frame: 10.35 px, pink at 75°, yellow at 45°)
        const LP = G1.lattice(-2.0, -3.72, 2.6801, 9.9978, -9.9952, 2.6768), LY = G1.lattice(-1.65, -0.59, 7.2681, 7.3701, -7.3727, 7.2668);
        // (at 2×: the sky is flat pink, only its yellow is a screen, with paper-white specks)
        pinkS.fillStyle = Riso.ramp(pinkS, 0, 60, 0, 800, 1, 0.8); pinkS.fillRect(-60, -60, 1200, 920);
        G1.dots(yellowS, LY, [-60, -60, 1140, 860], (x, y) => 0.22 + 0.73 * Math.max(0, Math.min(1, (y - 60) / 720)), { ink: 'yellow', seed: 42 });
        // the sun behind the sea: flat yellow, pink knocked out
        const sun = (g) => { g.beginPath(); g.ellipse(835, 800, 105, 78, 0, 0, 7); };
        erase(pinkS, (g) => { sun(g); g.fill(); });
        yellow.fillStyle = T(1); sun(yellow); yellow.fill();
        // sound arcs and cloud streaks in the sky: yellow lines (pink knocked out)
        erase(pinkS, (g) => arcsPath(g, 12));
        yellow.strokeStyle = T(1); arcsPath(yellow, 11);
        press.knockout((g) => G1.marks(g, 'bellsky', null, [-60, -60, 1140, 860], 1600, 1.5, 3.2, { v0: 0.85, v1: 0.4 }));
        const streaks = [[610, 1080, 196, 4], [780, 1080, 240, 3], [0, 190, 462, 4], [0, 150, 500, 3], [880, 1010, 548, 3], [900, 980, 572, 2]];
        for (const [x0, x1, y, n] of streaks) for (let i = 0; i < n; i++) {
            const yy = y + i * 5, a = x0 + i * 25;
            erase(pinkS, (g) => { g.fillRect(a, yy, x1 - a, 2.5); });
            yellow.fillStyle = T(1); yellow.fillRect(a, yy, x1 - a, 2.2);
        }
        // twigs over the sky (navy)
        taper(navy, [[735, 102], [790, 120], [860, 160], [905, 212]], 4, 1.5);
        taper(navy, [[820, 72], [860, 110], [900, 140]], 2.5, 1);

        // --- the sea: the upper waves (pink + navy screens on paper), the lower sea (navy)
        press.knockout((g) => { smoothPath(g, seaTop, true, 0.12); g.fill(); });
        fill(pinkS, seaTop, 0.5);
        fill(navyS, seaTop, 0.42);
        fill(navy, seaLow, 0.92);
        fill(pinkS, seaLow, 0.14);
        fill(blueS, seaLow, 0.35);
        specks(pink, 'bell-sea', 0, 930, 1080, 1080, 160, 1, 2.2);
        // the arcs in the sea are white (knocked out of every plate)
        press.knockout((g) => { g.save(); g.beginPath(); g.rect(-10, 700, 1100, 400); g.clip(); smoothPath(g, seaTop, true, 0.12); g.clip(); arcsPath(g, 8, SEA_R); g.restore(); });

        // --- the pine branch (top left): a dark bough, green fans of needles
        taper(navy, [[-10, 125], [60, 150], [120, 175], [150, 200]], 12, 7);
        taper(navy, [[40, 138], [42, 120]], 5, 3);
        taper(navy, [[70, 158], [60, 185]], 5, 3);
        for (const [x, y, r, a0, a1] of [[62, 84, 62, -0.2, 3.4], [16, 180, 78, -0.2, 3.3], [70, 214, 80, -0.1, 3.2], [158, 212, 70, 0, 3.3], [164, 262, 84, -0.1, 3.3]]) {
            for (let i = 0; i < 26; i++) {
                const a = a0 + ((a1 - a0) * i) / 25, rr = r * (0.82 + 0.18 * Math.sin(i * 2.3));
                taper(yellow, [[x, y], [x + Math.cos(a) * rr, y + Math.sin(a) * rr]], 6, 1.6);
                taper(blue, [[x, y], [x + Math.cos(a) * rr * 0.9, y + Math.sin(a) * rr * 0.9]], 5.5, 1.2);
            }
            erase(pinkS, (g) => { g.lineWidth = 3; for (let i = 0; i < 26; i++) { const a = a0 + ((a1 - a0) * i) / 25, rr = r * (0.82 + 0.18 * Math.sin(i * 2.3)); g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); g.stroke(); } });
            navy.fillStyle = T(1); navy.beginPath(); navy.arc(x, y, 4, 0, 7); navy.fill();
        }

        // --- the beam: dark band with red lines (navy knocked out)
        const dark = (pts, v = 1, smooth = false) => { press.knockout((g) => { (smooth ? smoothPath : polyPath)(g, pts); g.fill(); }); fill(yellow, pts, 1, smooth); fill(navy, pts, v, smooth); };
        // red lines on the dark: navy knocked out, pink printed (pink + yellow = red)
        const red = (fn) => { erase(navy, fn); erase(navyS, fn); pink.save(); pink.fillStyle = T(1); pink.strokeStyle = T(1); pink.lineCap = 'round'; fn(pink); pink.restore(); };
        dark([[-10, -10], [1090, -10], [1090, 66], [-10, 66]]);
        red((g) => { for (const y of [12, 32, 46, 60]) g.fillRect(-10, y, 1100, y === 60 ? 4 : 3); });

        // --- the striker: two ropes and a log
        for (const [x0, y0, x1, y1] of [[892, 64, 822, 604], [1078, 236, 1036, 604]]) {
            dark([[x0 - 8, y0], [x0 + 8, y0], [x1 + 8, y1], [x1 - 8, y1]]);
            red((g) => { for (let i = 1; i < 14; i++) { const u = i / 14, x = x0 + (x1 - x0) * u, y = y0 + (y1 - y0) * u; g.fillRect(x - 5, y, 8, 2.5); } });
        }
        dark([[672, 600], [1090, 596], [1090, 706], [672, 706]]);
        red((g) => { for (const [y, x] of [[618, 700], [636, 760], [652, 690], [668, 720], [686, 700]]) g.fillRect(x, y, 400, 2.6); });
        navy.fillStyle = T(1); navy.beginPath(); navy.ellipse(672, 653, 17, 53, 0, 0, 7); navy.fill();
        yellow.fillStyle = T(1); yellow.beginPath(); yellow.ellipse(672, 653, 17, 53, 0, 0, 7); yellow.fill();
        red((g) => { g.lineWidth = 3; g.beginPath(); g.ellipse(672, 653, 14, 49, 0, 0, 7); g.stroke(); g.beginPath(); g.ellipse(672, 653, 8, 32, 0, 0, 7); g.stroke(); });

        // --- the bell (swings round the hanger's top)
        press.save();
        press.each((g) => { g.translate(422, 60); g.rotate(swing); g.translate(-422, -60); });
        dark([[404, 50], [440, 50], [440, 175], [404, 175]]);
        // the loop: an arch (outer 362–480, top 151; the hole 385–457), read off a crop
        const ring = (g) => { g.beginPath(); g.moveTo(362, 240); g.lineTo(362, 210); g.arc(421, 210, 59, Math.PI, 0); g.lineTo(480, 240); g.lineTo(457, 240); g.lineTo(457, 210); g.arc(421, 210, 36, 0, Math.PI, true); g.lineTo(385, 240); g.closePath(); };
        press.knockout((g) => { ring(g); g.fill(); }); for (const g of [yellow, navy]) { g.fillStyle = T(1); ring(g); g.fill(); }
        // the bell: its silhouette measured on rows (dark extents): a rounded crown, straight
        // sides, the skirt flaring out to the lip at 918
        const bell = [[415, 228], [330, 238], [270, 250], [230, 266], [205, 288], [197, 320], [195, 540], [190, 660], [184, 740], [179, 820], [170, 860], [150, 890], [122, 916], [718, 918], [692, 895], [672, 860], [660, 820], [653, 740], [650, 600], [649, 320], [641, 288], [616, 264], [572, 246], [500, 234]];
        const bellPath = (g) => smoothPath(g, bell, true, 0.12);
        press.knockout((g) => { bellPath(g); g.fill(); });
        yellow.fillStyle = T(1); bellPath(yellow); yellow.fill();
        // the bronze warms towards the lit stripe: little red on the far left (olive black),
        // full red at the stripe, half on the shadowed right (read off the 126 frame)
        clipped(pink, bellPath, (g) => {
            const gr = g.createLinearGradient(190, 0, 720, 0);
            gr.addColorStop(0, T(0.12)); gr.addColorStop(0.35, T(0.35)); gr.addColorStop(0.58, T(0.9)); gr.addColorStop(0.7, T(1)); gr.addColorStop(0.8, T(0.6)); gr.addColorStop(1, T(0.45));
            g.fillStyle = gr; g.fillRect(100, 200, 700, 740);
        });
        // dark bronze (navy over red) with one lit stripe (505–565: orange, a dotted edge)
        // (the bronze is a dense navy screen, not a flat: dots show through it at full size)
        const LN = G1.lattice(0, 0, 10.0, 2.68, -2.68, 10.0);
        clipped(navy, bellPath, (g) => { G1.dots(g, LN, [100, 200, 502, 940], (x) => 0.9 - 0.25 * Math.max(0, (x - 380) / 120), { ink: 'navy', seed: 43 }); G1.dots(g, LN, [568, 200, 768, 940], (x) => 0.65 + 0.25 * Math.min(1, (x - 568) / 60), { ink: 'navy', seed: 43 }); });
        clipped(navyS, bellPath, (g) => {
            const gr = g.createLinearGradient(498, 0, 572, 0);
            gr.addColorStop(0, T(0.9)); gr.addColorStop(0.3, T(0.25)); gr.addColorStop(0.55, T(0.08)); gr.addColorStop(0.8, T(0.3)); gr.addColorStop(1, T(0.9));
            g.fillStyle = gr; g.fillRect(498, 200, 74, 740);
        });
        // red lines: bands, panel dividers, studs (navy knocked out, pink printed)
        red((g) => {
            for (const [y, h] of [[303, 4], [322, 3], [555, 4], [575, 3], [780, 5], [800, 4]]) g.fillRect(190, y, 470, h);
            for (const x of [280, 370, 470, 565]) g.fillRect(x - 2, 322, 4, 235);
            const studs = (xs, n) => { for (const x of xs) for (let i = 0; i < n; i++) { g.beginPath(); g.arc(x, 352 + i * 45, 7, 0, 7); g.fill(); } };
            studs([218, 245], 5); studs([395, 421, 447], 5); studs([598, 625], 5);
            // the emblem: a ring with a flower
            g.lineWidth = 3; g.beginPath(); g.arc(482, 690, 30, 0, 7); g.stroke();
            for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; g.beginPath(); g.ellipse(482 + Math.cos(a) * 12, 690 + Math.sin(a) * 12, 7, 3, a, 0, 7); g.fill(); }
        });
        specks(pinkS, 'bell-sp', 200, 250, 470, 900, 70, 1.5, 3);
        specks(blue, 'bell-sb', 200, 250, 600, 900, 30, 1, 2.2);
        press.restore();
        press.restore();
        // regional tone: calibrated against the reference as a grid (private/bell-data.js,
        // gitignored: read off the video, never committed); absent, the drawing's own tones stand
        G1.tones(press, (typeof G1DATA !== 'undefined' && G1DATA.bell || {})[o.ring ? 'again' : 'first']);
    });
};
