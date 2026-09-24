// Card «bell» (reference 5.04–5.45 s, full frame; opens in a circle at 4.98). A temple bell
// hanging from a beam, a log striker on two ropes, a pine branch, sound arcs in yellow over a
// pink-to-orange sky, a yellow sun behind the sea, the sea in two layers of purple.
// Authored in reference pixels (G1.frame), measured on the 5.25 s frame. Separations:
// sky = pink + yellow screens ramping against each other; arcs and cloud streaks = pink
// knocked out over yellow (white in the sea); bell, beam and log = navy over pink + yellow
// (dark brown-green) with red lines where the navy is knocked out; the bell's highlight a
// navy screen ramp; sea = pink + navy screens above, navy solid + pink screen below.
var CARDS = CARDS || {};
CARDS.bell = (press, t) => {
    const { T, fill, stroke, taper, smoothPath, polyPath, clipped, specks } = G1;
    const P = (ink, k) => press.plate(ink, k);
    const pink = P('pink'), pinkS = P('pink', 'screen'), yellow = P('yellow'), yellowS = P('yellow', 'screen');
    const blue = P('blue'), blueS = P('blue', 'screen'), navy = P('navy'), navyS = P('navy', 'screen');
    const erase = (g, fn) => { g.save(); g.globalCompositeOperation = 'destination-out'; g.fillStyle = '#000'; g.strokeStyle = '#000'; g.lineCap = 'round'; fn(g); g.restore(); };
    const d = Math.floor(t * 12 + 1e-6);
    // the bell swings away after the strike (it sits still for the first three drawings)
    const swing = [0, 0, 0, -0.006, -0.014, -0.022, -0.028, -0.031][Math.min(d, 7)];
    const CX = 420, CY = 560; // centre of the sound arcs
    const arcsPath = (g, w) => { g.lineWidth = w; for (let k = 0; k < 11; k++) { g.beginPath(); g.arc(CX, CY, 285 + k * 76, 0, Math.PI * 2); g.stroke(); } };
    const seaTop = [[-10, 822], [40, 812], [90, 818], [150, 806], [200, 815], [700, 812], [735, 792], [770, 800], [805, 752], [840, 764], [880, 748], [930, 760], [980, 742], [1030, 752], [1090, 728], [1090, 1090], [-10, 1090]];
    const seaLow = [[-10, 962], [60, 955], [110, 968], [180, 948], [260, 960], [340, 938], [420, 952], [520, 930], [610, 946], [700, 924], [780, 940], [860, 918], [950, 936], [1020, 915], [1090, 930], [1090, 1090], [-10, 1090]];

    G1.frame(press, () => {
        // --- sky: pink fading, yellow rising towards the horizon
        pinkS.fillStyle = Riso.ramp(pinkS, 0, 60, 0, 800, 0.98, 0.62);
        pinkS.fillRect(0, 0, 1080, 830);
        yellowS.fillStyle = Riso.ramp(yellowS, 0, 60, 0, 780, 0.22, 0.95);
        yellowS.fillRect(0, 0, 1080, 830);
        // the sun behind the sea: flat yellow, pink knocked out
        const sun = (g) => { g.beginPath(); g.ellipse(835, 800, 105, 78, 0, 0, 7); };
        erase(pinkS, (g) => { sun(g); g.fill(); });
        yellow.fillStyle = T(1); sun(yellow); yellow.fill();
        // sound arcs and cloud streaks in the sky: yellow lines (pink knocked out)
        erase(pinkS, (g) => arcsPath(g, 8));
        yellow.strokeStyle = T(1); arcsPath(yellow, 7);
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
        press.knockout((g) => { g.save(); g.beginPath(); g.rect(-10, 700, 1100, 400); g.clip(); smoothPath(g, seaTop, true, 0.12); g.clip(); arcsPath(g, 8); g.restore(); });

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
        const ring = (g) => { g.beginPath(); g.arc(421, 212, 58, Math.PI * 0.98, Math.PI * 2.02); g.arc(421, 212, 38, Math.PI * 2.02, Math.PI * 0.98, true); g.closePath(); };
        press.knockout((g) => { ring(g); g.fill(); }); for (const g of [yellow, navy]) { g.fillStyle = T(1); ring(g); g.fill(); }
        const bell = [[206, 300], [212, 268], [248, 244], [330, 228], [420, 221], [520, 226], [600, 242], [636, 266], [645, 300], [648, 560], [652, 800], [672, 870], [712, 918], [132, 918], [172, 870], [190, 800], [196, 560]];
        const bellPath = (g) => smoothPath(g, bell, true, 0.1);
        press.knockout((g) => { bellPath(g); g.fill(); });
        yellow.fillStyle = T(1); bellPath(yellow); yellow.fill();
        clipped(pink, bellPath, (g) => { g.fillStyle = T(1); g.fillRect(470, 200, 300, 740); });
        clipped(pinkS, bellPath, (g) => { g.fillStyle = Riso.ramp(g, 430, 0, 470, 0, 0, 0.8); g.fillRect(430, 200, 40, 740); });
        // dark body with a lit stripe: navy solid on the left, a screen ramp across the light
        clipped(navy, bellPath, (g) => { g.fillStyle = T(1); g.fillRect(100, 200, 380, 740); });
        clipped(navyS, bellPath, (g) => {
            const gr = g.createLinearGradient(470, 0, 660, 0);
            gr.addColorStop(0, T(1)); gr.addColorStop(0.35, T(0.12)); gr.addColorStop(0.55, T(0.05)); gr.addColorStop(1, T(0.5));
            g.fillStyle = gr; g.fillRect(470, 200, 260, 740);
        });
        // a dark shoulder on top (the crown), the flare's shadow
        clipped(navy, bellPath, (g) => { g.fillStyle = T(1); g.beginPath(); g.ellipse(430, 240, 240, 55, 0, 0, 7); g.fill(); g.fillRect(100, 820, 400, 120); });
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
    });
};
