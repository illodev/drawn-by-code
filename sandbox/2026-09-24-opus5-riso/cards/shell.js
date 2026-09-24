// Card «shell» (reference ≈ 12.58–12.70 s, full frame). A conch shell lying on sand by the
// water's edge: yellow sand with a fine pink dot, a white foam line and swash lines (knock-
// outs) before a green sea (yellow + blue screens), the shell pale (pink and yellow dots on
// paper) with orange zigzag bands (pink + yellow flat), a red-to-magenta aperture with a
// white highlight, dark teal outlines (navy + blue) and a hatched shadow.
// Authored in reference pixels (1080 frame) through G5.px. CARDS.shell(press, t).
var CARDS = CARDS || {};
CARDS.shell = (press, t) => {
    const R = Riso, T = R.tone, U = G5;
    const d = Math.floor(t * 12 + 1e-6);
    const P = (ink, k) => press.plate(ink, k);
    const pink = P('pink'), pinkS = P('pink', 'screen'), yel = P('yellow'), yelS = P('yellow', 'screen');
    const blue = P('blue'), blueS = P('blue', 'screen'), navy = P('navy'), navyS = P('navy', 'screen');
    const all = [pink, pinkS, yel, yelS, blue, blueS, navy, navyS];
    const eraseIn = (plates, fn) => { for (const g of plates) { g.save(); g.globalCompositeOperation = 'destination-out'; g.fillStyle = '#000'; g.strokeStyle = '#000'; g.beginPath(); fn(g); g.restore(); } };
    // an open curve offset sideways (the swash lines follow the water's edge)
    const shore = [[440, -20], [560, 20], [680, 80], [790, 170], [870, 290], [910, 430], [925, 580], [945, 740], [1000, 890], [1060, 990], [1110, 1060]];
    const off = (pts, dx, dy) => pts.map(([x, y]) => [x + dx, y + dy]);
    // the wave advances a little on twos
    const wv = [0, 4, 7, 9, 10, 9][Math.min(5, d)] ?? 9;

    U.px(press, () => {
        // sand: yellow flat, a fine pink screen, denser pink (orange dots) where it is wet
        yel.fillStyle = T(0.9); yel.fillRect(0, 0, 1080, 1080);
        pinkS.fillStyle = T(0.14); pinkS.fillRect(0, 0, 1080, 1080);
        U.stroke(pinkS, off(shore, -60, 0), 110, T(0.2), true);
        // sand streaks: thin pink strokes
        const rs = Motion.rng('shell-streak');
        for (let k = 0; k < 26; k++) {
            const x = rs() * 1080, y = rs() * 1080, l = 40 + rs() * 90, a = 1.0 + rs() * 0.4;
            U.stroke(pink, [[x, y], [x + Math.cos(a) * l * 0.5 + 6, y + Math.sin(a) * l * 0.5], [x + Math.cos(a) * l, y + Math.sin(a) * l]], 2.6, T(1), true);
        }
        // the sea beyond the foam: yellow + blue screens (green), bluer to the upper right
        const sea = [...off(shore, 30 + wv, -10), [1110, -20]];
        U.clipped(yel, sea, true, (g) => g.clearRect(0, 0, 1080, 1080));
        U.clipped(pinkS, sea, true, (g) => g.clearRect(0, 0, 1080, 1080));
        U.fill(yelS, sea, R.ramp(yelS, 1080, 0, 800, 700, 0.25, 0.75), true);
        U.fill(blueS, sea, R.ramp(blueS, 1080, 0, 850, 800, 0.55, 0.32), true);
        // foam: a white band along the edge, broken into bubbles on the sea side
        eraseIn(all, (g) => { g.lineWidth = 34; g.lineCap = 'round'; g.lineJoin = 'round'; U.smooth(g, off(shore, 8 + wv, 0), false); g.stroke(); });
        eraseIn(all, (g) => { g.lineWidth = 12; g.lineCap = 'round'; U.smooth(g, off(shore, -40 + wv, 30), false); g.stroke(); });
        const rb = Motion.rng('shell-bub');
        eraseIn(all, (g) => {
            for (let k = 0; k < 90; k++) {
                const i = Math.floor(rb() * (shore.length - 1)), u = rb(), [x0, y0] = shore[i], [x1, y1] = shore[i + 1];
                const x = x0 + (x1 - x0) * u + 30 + wv + rb() * 50, y = y0 + (y1 - y0) * u - 10;
                g.moveTo(x + 4, y); g.arc(x, y, 1.5 + rb() * 4, 0, 7);
            }
            g.fill();
        });
        // blue specks in the foam
        const rbs = Motion.rng('shell-bs');
        blueS.fillStyle = T(1); blue.fillStyle = T(0.9);
        for (let k = 0; k < 70; k++) {
            const i = Math.floor(rbs() * (shore.length - 1)), u = rbs(), [x0, y0] = shore[i], [x1, y1] = shore[i + 1];
            const x = x0 + (x1 - x0) * u + wv - 10 + rbs() * 36, y = y0 + (y1 - y0) * u;
            blue.beginPath(); blue.arc(x, y, 2 + rbs() * 3, 0, 7); blue.fill();
        }
        // swash lines on the sand, following the edge
        for (const [dx, dy, w] of [[-75, 20, 5], [-130, 35, 3.5], [-185, 50, 3], [-250, 60, 2.5]]) {
            eraseIn(all, (g) => { g.lineWidth = w; g.lineCap = 'round'; U.smooth(g, off(shore, dx + wv * 0.5, dy).slice(0, 9), false); g.stroke(); });
        }

        // the wash wrapping round the shell: a white ribbon
        eraseIn(all, (g) => { g.lineWidth = 15; g.lineCap = 'round'; U.smooth(g, [[385, 242], [470, 258], [560, 285], [650, 328], [740, 382], [812, 455], [862, 545], [880, 650], [862, 760], [835, 880]], false); g.stroke(); });
        // the shell ----------------------------------------------------------------------
        const body = [[176, 155], [238, 208], [300, 240], [335, 262], [405, 290], [440, 305], [505, 330], [548, 362], [600, 368], [660, 385], [730, 420], [800, 490], [845, 570], [860, 650], [845, 740], [800, 790], [790, 850], [780, 912], [700, 900], [620, 890], [530, 875], [440, 830], [365, 750], [308, 668], [276, 590], [285, 530], [266, 470], [276, 418], [255, 360], [238, 295], [216, 240], [190, 195]];
        // hatched shadow down and left of the shell
        const shadow = off(body, -22, 22);
        U.clipped(navy, shadow, true, (g) => {
            g.strokeStyle = T(0.85); g.lineWidth = 2.6;
            for (let k = -1100; k < 1100; k += 9) { g.beginPath(); g.moveTo(k, 0); g.lineTo(k + 700, 1080); g.stroke(); }
        });
        U.fill(yel, shadow, T(0.3), true);
        // the pale shell: paper with pink and yellow dots, shaded pinker to the left
        eraseIn(all, (g) => U.smooth(g, body) || g.fill());
        U.clipped(pinkS, body, true, (g) => { g.fillStyle = R.ramp(g, 250, 400, 560, 600, 0.36, 0.1); g.fillRect(0, 0, 1080, 1080); });
        U.clipped(yelS, body, true, (g) => { g.fillStyle = T(0.2); g.fillRect(0, 0, 1080, 1080); });
        U.clipped(navyS, body, true, (g) => { g.fillStyle = R.ramp(g, 250, 500, 380, 450, 0.12, 0); g.fillRect(0, 0, 1080, 1080); });
        // orange zigzag bands (pink + yellow flat), a white band between them
        const zig = (pts, amp, w, seed) => {
            const r = Motion.rng('shz' + seed), out = [], back = [];
            for (let i = 0; i < pts.length - 1; i++) {
                const [x0, y0] = pts[i], [x1, y1] = pts[i + 1], L = Math.hypot(x1 - x0, y1 - y0), nx = -(y1 - y0) / L, ny = (x1 - x0) / L;
                const n = Math.max(2, Math.round(L / 40));
                for (let k = 0; k < n; k++) {
                    const u = k / n, x = x0 + (x1 - x0) * u, y = y0 + (y1 - y0) * u, z = (k % 2 ? 1 : -1) * amp * (0.7 + r() * 0.5);
                    out.push([x + nx * (w + z), y + ny * (w + z)]); back.push([x - nx * (w - z * 0.6), y - ny * (w - z * 0.6)]);
                }
            }
            return [...out, ...back.reverse()];
        };
        U.clipped(pink, body, true, () => {
            for (const [pts, amp, w, s] of [
                [[[205, 190], [300, 290], [390, 380], [450, 470], [505, 580], [570, 700], [650, 830], [700, 900]], 22, 16, 'a'],
                [[[240, 300], [262, 400], [300, 520], [345, 640], [420, 750], [520, 850], [580, 890]], 20, 14, 'b'],
                [[[330, 275], [420, 310], [520, 350]], 8, 7, 'c'],
                [[[640, 395], [730, 450], [800, 530], [835, 620], [840, 700]], 16, 12, 'd'],
            ]) {
                const z = zig(pts, amp, w, s);
                U.fill(pink, z, T(0.85)); U.fill(yel, z, T(1));
                // the hatch inside the bands: thin paper lines
                U.clipped(pink, z, false, (g) => { g.save(); g.globalCompositeOperation = 'destination-out'; g.lineWidth = 1.3; for (let k = -1100; k < 1100; k += 9) { g.beginPath(); g.moveTo(k, 0); g.lineTo(k + 500, 1080); g.stroke(); } g.restore(); });
            }
        });
        // the white highlight band down the body
        eraseIn([pinkS, yelS, navyS], (g) => { g.lineWidth = 16; g.lineCap = 'round'; U.smooth(g, [[430, 420], [500, 540], [570, 670], [640, 790]], false); g.stroke(); });
        // growth lines across the body whorl and the whorls of the spire (navy + blue)
        const line = (pts, w = 2) => { U.stroke(navy, pts, w, T(0.85), true); U.stroke(blue, pts, w, T(0.6), true); };
        U.clipped(navy, body, true, () => U.clipped(blue, body, true, () => {
            for (let k = 0; k < 9; k++) {
                const y = 600 + k * 34, x0 = 320 + k * 26;
                line([[x0, y + 40], [x0 + 130, y - 10], [x0 + 260, y - 60]], 1.8);
            }
            // whorl seams on the spire
            for (const [a, b, c] of [[[196, 222], [215, 205], [238, 208]], [[208, 262], [245, 245], [275, 238]], [[228, 318], [275, 295], [320, 262]], [[250, 380], [320, 345], [400, 292]], [[270, 460], [370, 400], [470, 320]], [[282, 575], [420, 480], [548, 365]]]) line([a, b, c], 2.2);
        }));
        // the outline
        line([...body, body[0]], 4.5);

        // the aperture: red (pink + yellow) on the right, magenta with navy dots on the left
        const ap = U.blob(678, 566, 250, 116, 'shap', 0.02, 48, 0.9);
        eraseIn(all, (g) => U.smooth(g, ap) || g.fill());
        U.fill(pink, ap, T(1), true);
        U.clipped(yel, ap, true, (g) => { g.fillStyle = R.ramp(g, 650, 640, 790, 560, 0, 0.9); g.fillRect(0, 0, 1080, 1080); });
        U.clipped(navyS, ap, true, (g) => { g.fillStyle = R.ramp(g, 540, 640, 680, 540, 0.45, 0); g.fillRect(0, 0, 1080, 1080); });
        // thin navy cracks inside
        U.stroke(navy, [[560, 600], [600, 585], [620, 600], [660, 590]], 1.6, T(0.8));
        U.stroke(navy, [[600, 640], [640, 630], [665, 650]], 1.6, T(0.8));
        // the white highlight sliver
        eraseIn(all, (g) => { g.save(); g.translate(700, 545); g.rotate(0.9); g.ellipse(0, 0, 140, 7, 0, 0, 7); g.fill(); g.restore(); });
        line([...ap, ap[0]], 3.5);
        // the lip below the aperture: a pale rounded end
        line([[800, 790], [835, 760]], 3);

        // seeds on the sand: pink lenses with navy rims; small navy rings (sand bubbles)
        for (const [x, y, a, l] of [[98, 742, 0.1, 22], [40, 340, 0.6, 10], [385, 1020, 1.2, 10], [657, 1052, -0.1, 22], [480, 200, 0.5, 8]]) {
            const lens = [[x - l, y], [x, y - l * 0.4], [x + l, y], [x, y + l * 0.4]].map(([px, py]) => [x + (px - x) * Math.cos(a) - (py - y) * Math.sin(a), y + (px - x) * Math.sin(a) + (py - y) * Math.cos(a)]);
            U.fill(pink, lens, T(1), true); U.stroke(navy, [...lens, lens[0]], 1.5, T(0.8), true);
        }
        navy.strokeStyle = T(0.7); navy.lineWidth = 1.5;
        for (const [x, y] of [[45, 295], [120, 365], [236, 102], [80, 855], [248, 942], [915, 1055], [330, 640]]) { navy.beginPath(); navy.arc(x, y, 5, 0, 7); navy.stroke(); }
    });
};
