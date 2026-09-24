// Card «campfire» (reference ≈ 12.96–13.08 s, full frame). A campfire in a dark forest:
// purple trunks (navy + pink flat) with dotted green gaps (blue, yellow, navy screens) and
// a red glow at their feet; a clearing lit yellow round the fire fading into green dots;
// flames in three plates (red-orange outer = pink + yellow, yellow inner, a white core); navy
// logs with pink edges and white embers, navy stones; yellow sparks rising in a column.
// Authored in reference pixels (1080 frame) through G5.px. CARDS.campfire(press, t).
var CARDS = CARDS || {};
CARDS.campfire = (press, t) => {
    const R = Riso, T = R.tone, U = G5;
    const d = Math.floor(t * 12 + 1e-6);
    const P = (ink, k) => press.plate(ink, k);
    const pink = P('pink'), pinkS = P('pink', 'screen'), yel = P('yellow'), yelS = P('yellow', 'screen');
    const blue = P('blue'), blueS = P('blue', 'screen'), navy = P('navy'), navyS = P('navy', 'screen');
    const all = [pink, pinkS, yel, yelS, blue, blueS, navy, navyS];
    const eraseIn = (plates, fn) => { for (const g of plates) { g.save(); g.globalCompositeOperation = 'destination-out'; g.fillStyle = '#000'; g.strokeStyle = '#000'; g.beginPath(); fn(g); g.restore(); } };
    const ellP = (x, y, rx, ry, rot = 0) => { const p = []; for (let i = 0; i < 24; i++) { const a = i / 24 * Math.PI * 2; p.push([x + Math.cos(a) * rx * Math.cos(rot) - Math.sin(a) * ry * Math.sin(rot), y + Math.cos(a) * rx * Math.sin(rot) + Math.sin(a) * ry * Math.cos(rot)]); } return p; };

    U.px(press, () => {
        // the forest, measured as vertical bands (column means over y 0–250 and 250–500):
        // dark trunks = blue + pink flat + a little navy (purple-navy); lit gaps between them =
        // blue + less pink + yellow dots on the reference's 9.7 px screen at 48°
        const LY = { o: [535.52, 138.25], a: [6.447, 7.273], b: [-7.231, 6.482] };
        blue.fillStyle = T(1); blue.fillRect(0, 0, 1080, 800);
        pink.fillStyle = T(0.55); pink.fillRect(0, 0, 1080, 800);
        U.screen(yel, 'yellow', LY, (m) => { m.fillStyle = T(0.32); m.fillRect(0, 0, 1080, 800); });
        // dark dots between the yellow ones in the lit gaps (navy on the same screen, offset half a cell)
        const LYn = { o: [535.52 + 0.5 * (6.447 - 7.231), 138.25 + 0.5 * (7.273 + 6.482)], a: LY.a, b: LY.b };
        U.screen(navy, 'navy', LYn, (m) => { m.fillStyle = T(0.3); m.fillRect(0, 0, 1080, 800); });
        // trunks from column means (y 0–500): 'n' navy (navy solid, a little blue), 'p' purple
        // (pink + blue solids)
        const trunks = [[-10, 100, 'n'], [125, 145, 'n'], [190, 245, 'p'], [280, 325, 'n'], [395, 430, 'n'], [630, 650, 'n'], [705, 755, 'p'], [880, 950, 'n'], [1000, 1090, 'n']];
        const rt = Motion.rng('cf-tr');
        for (const [a, b, kind] of trunks) {
            const ph = rt() * 6, L = [], Rr = [], foot = 740 + rt() * 40;
            for (let y = -10; y <= foot; y += 40) { const u = (y + 10) / (foot + 10), wob = Math.sin(y / 85 + ph) * 3; L.push([a - u * u * 10 + wob, y]); Rr.push([b + u * u * 10 + wob * 0.6, y]); }
            const tr = [...L, ...Rr.reverse()];
            U.cut([yel, navy, pink, blue], (g) => { g.beginPath(); U.trace(g, tr); g.fill(); });
            if (kind === 'n') { U.fill(navy, tr, T(1)); U.fill(blue, tr, T(0.45)); }
            else { U.fill(pink, tr, T(0.97)); U.fill(blue, tr, T(1)); }
            U.clipped(kind === 'n' ? blue : navy, tr, false, (g) => U.blotch(g, 'cf-bl' + a, [a, 0, b, foot], 4, 30, 70, 0.2, 0.5));
            // a red glow at the foot of the trunks near the fire (yellow)
            U.clipped(yel, tr, false, (g) => { g.fillStyle = R.ramp(g, 0, foot - 200, 0, foot, 0, 0.5); g.fillRect(0, 0, 1080, 1080); });
        }
        // the print's grit over the forest: voids in the navy and pink (blue specks), specks
        U.grit(navy, [0, 0, 1080, 800], { out: true, p: 0.15, a: 0.6, seed: 1 });
        U.grit(pink, [0, 0, 1080, 800], { out: true, p: 0.22, a: 0.6, seed: 2 });
        U.grit(blue, [0, 0, 1080, 800], { out: true, p: 0.08, a: 0.8, seed: 3, cell: 1.8 });
        U.grit(navy, [0, 0, 1080, 800], { p: 0.15, a: 0.7, seed: 4 });
        // the clearing: yellow round the fire, green dots (blue on yellow) outward, navy dots at the rim
        const gl = [];
        for (let x = -10; x <= 1090; x += 30) gl.push([x, 735 + 25 * (x / 1080) + 6 * Math.sin(x / 60)]);
        const ground = [...gl, [1090, 1090], [-10, 1090]];
        eraseIn(all, (g) => U.trace(g, ground) || g.fill());
        U.fill(yel, ground, T(0.9));
        U.clipped(blueS, ground, false, (g) => { g.save(); g.translate(540, 880); g.scale(1, 0.42); const gr = g.createRadialGradient(0, 0, 0, 0, 0, 620); gr.addColorStop(0, T(0)); gr.addColorStop(0.2, T(0.1)); gr.addColorStop(0.4, T(0.8)); gr.addColorStop(0.6, T(1)); gr.addColorStop(1, T(1.2)); g.fillStyle = gr; g.fillRect(-1200, -2400, 2400, 4800); g.restore(); });
        U.clipped(navyS, ground, false, (g) => { g.save(); g.translate(540, 880); g.scale(1, 0.42); const gr = g.createRadialGradient(0, 0, 0, 0, 0, 620); gr.addColorStop(0, T(0)); gr.addColorStop(0.35, T(0.1)); gr.addColorStop(0.6, T(0.35)); gr.addColorStop(1, T(0.45)); g.fillStyle = gr; g.fillRect(-1200, -2400, 2400, 4800); g.restore(); });
        // the clearing darkens to the sides and bottom corners (navy grass, yellow thinning)
        for (const [x, y] of [[-40, 1100], [1120, 1100], [-60, 800], [1140, 800]]) {
            U.cut([yel], (g) => { g.save(); g.translate(x, y); g.scale(1, 0.8); U.glow(g, 0, 0, 260, 0.8, 0); g.restore(); });
            navy.save(); navy.translate(x, y); navy.scale(1, 0.8); U.glow(navy, 0, 0, 240, 0.7, 0); navy.restore();
        }
        // grass tufts at the bottom edge: navy strokes
        const rg = Motion.rng('cf-gr');
        for (let k = 0; k < 60; k++) { const x = rg() * 1080, y = 1040 + rg() * 45; U.stroke(navyS, [[x, y], [x + rg() * 10 - 5, y - 20 - rg() * 20]], 3, T(0.8)); }

        // the flames, measured row by row (colour runs every 30 px): five orange tongues, a
        // yellow heart split by an orange tongue, a white core
        const outer = [[322, 800], [324, 690], [332, 660], [343, 642], [353, 660], [368, 672], [384, 660], [401, 630], [405, 600], [401, 570], [397, 540], [410, 524], [423, 540], [432, 552], [442, 540], [453, 510], [469, 480], [488, 450], [509, 416], [513, 450], [513, 480], [514, 510], [522, 522], [532, 510], [547, 480], [562, 450], [573, 420], [579, 390], [585, 360], [591, 330], [600, 316], [609, 330], [611, 360], [620, 390], [629, 420], [633, 450], [634, 480], [635, 510], [637, 540], [628, 570], [631, 600], [636, 630], [646, 648], [657, 630], [671, 600], [680, 570], [688, 553], [693, 570], [704, 600], [712, 630], [710, 660], [721, 690], [704, 720], [707, 750], [716, 790], [718, 800]];
        eraseIn(all, (g) => U.smooth(g, outer) || g.fill());
        U.fill(pink, outer, T(1), true);
        U.fill(yel, outer, T(1), true);
        const heart = [[387, 800], [385, 750], [387, 720], [395, 690], [410, 660], [424, 630], [428, 605], [434, 590], [440, 605], [450, 630], [452, 660], [447, 690], [447, 720], [450, 760], [466, 760], [468, 720], [471, 690], [473, 660], [468, 630], [462, 600], [463, 570], [468, 540], [476, 528], [490, 570], [528, 570], [565, 540], [567, 510], [582, 480], [591, 450], [595, 438], [599, 450], [601, 480], [601, 510], [597, 540], [590, 570], [584, 600], [594, 630], [608, 660], [640, 680], [671, 692], [649, 720], [634, 750], [629, 790], [629, 800]];
        U.cut([pink], (g) => { g.beginPath(); U.smooth(g, heart); g.fill(); });
        U.cut([pink], (g) => { g.beginPath(); U.smooth(g, [[657, 660], [670, 645], [682, 662], [676, 690], [660, 688]]); g.fill(); });
        const core = [[517, 538], [528, 600], [540, 630], [532, 660], [530, 690], [529, 720], [530, 752], [503, 752], [505, 720], [511, 690], [521, 660], [524, 610]];
        eraseIn(all, (g) => U.smooth(g, core) || g.fill());
        // red glows at the foot of three trunks
        for (const [x0, x1, y0, y1] of [[228, 240, 560, 705], [840, 852, 580, 755], [77, 90, 650, 700]]) { const r = [[x0, y0], [x1, y0], [x1 + 2, y1], [x0 - 2, y1]]; eraseIn([blue, navy], (g) => U.trace(g, r) || g.fill()); U.fill(pink, r, T(1)); U.fill(yel, r, T(0.8)); }
        // logs: thick navy rods crossing in a pile, a pink lit edge on top, ends as ovals
        const log = (x0, y0, x1, y1, w, endL, endR) => {
            const L = Math.hypot(x1 - x0, y1 - y0), nx = (y1 - y0) / L, ny = -(x1 - x0) / L; // normal pointing up
            const q = [[x0 + nx * w / 2, y0 + ny * w / 2], [x1 + nx * w / 2, y1 + ny * w / 2], [x1 - nx * w / 2, y1 - ny * w / 2], [x0 - nx * w / 2, y0 - ny * w / 2]];
            eraseIn(all, (g) => U.trace(g, q) || g.fill());
            U.fill(navy, q, T(1));
            // the lit top edge and a crack line along the log
            const edge = [[x0 + nx * (w / 2 - 5), y0 + ny * (w / 2 - 5)], [x1 + nx * (w / 2 - 5), y1 + ny * (w / 2 - 5)]];
            U.erase([navy], edge, 5, false); U.stroke(pink, edge, 5, T(1));
            U.stroke(pink, [[x0 + (x1 - x0) * 0.2 - nx * 4, y0 + (y1 - y0) * 0.2 - ny * 4], [x0 + (x1 - x0) * 0.6 - nx * 2, y0 + (y1 - y0) * 0.6 - ny * 2]], 2, T(0.8));
            for (const [on, x, y] of [[endL, x0, y0], [endR, x1, y1]]) {
                if (!on) continue;
                const e = ellP(x, y, w * 0.34, w * 0.52, Math.atan2(y1 - y0, x1 - x0));
                eraseIn(all, (g) => U.trace(g, e) || g.fill());
                U.fill(navy, e, T(1));
                U.stroke(pink, e.slice(10, 22), 3, T(1));
            }
        };
        // the pile, measured on a 1.3× grid crop: one purple mass (navy + pink), log ends as
        // rounded lobes, pink cracks along the logs
        const pile = [[212, 845], [222, 815], [245, 800], [290, 797], [330, 782], [352, 772], [372, 782], [400, 790], [440, 776], [480, 768], [505, 760], [530, 772], [565, 778], [600, 792], [640, 808], [700, 820], [745, 826], [790, 838], [812, 858], [812, 885], [796, 906], [770, 918], [735, 906], [700, 905], [645, 897], [600, 893], [560, 892], [520, 896], [470, 888], [430, 880], [385, 886], [340, 904], [290, 905], [250, 885], [222, 868]];
        eraseIn(all, (g) => U.smooth(g, pile) || g.fill());
        U.fill(navy, pile, T(0.95), true);
        U.fill(pink, pile, T(0.35), true);
        U.fill(blue, pile, T(0.3), true);
        for (const pts of [[[250, 870], [320, 860], [420, 845], [520, 832]], [[330, 790], [400, 815], [470, 830]], [[440, 890], [520, 870], [600, 862]], [[505, 772], [580, 800], [650, 830], [730, 858], [800, 880]], [[600, 885], [680, 875], [740, 868]], [[260, 812], [300, 820]]]) {
            U.cut([navy, blue], (g) => U.brush(g, pts, 5, '#000', 'cfc' + pts[0][0], { taper: 0.25 }));
            U.brush(pink, pts, 5, T(1), 'cfc' + pts[0][0], { taper: 0.25 });
        }
        // the end grain on the right log end: yellow rings
        yel.strokeStyle = T(0.8); yel.lineWidth = 1.5;
        for (const r of [6, 12, 17]) { yel.beginPath(); yel.ellipse(800, 893, r * 0.7, r, -0.5, 0, 7); yel.stroke(); }
        // embers: small white knockouts on the logs, pink hot points
        const re = Motion.rng('cf-emb' + (d % 2));
        eraseIn(all, (g) => { for (let k = 0; k < 26; k++) { const x = 330 + re() * 320, y = 805 + re() * 60, r = 2 + re() * 3; g.moveTo(x + r, y); g.arc(x, y, r, 0, 7); } g.fill(); });
        U.speckle(pink, 'cf-hot', 14, 340, 800, 650, 870, 2, 3, T(1));
        // stones round the fire
        for (const [x, y, rx, ry] of [[388, 922, 36, 22], [512, 934, 38, 25], [634, 934, 42, 25], [750, 909, 35, 23]]) {
            const e = ellP(x, y, rx, ry);
            eraseIn(all, (g) => U.trace(g, e) || g.fill());
            U.fill(navy, e, T(0.95));
            U.stroke(pink, e.slice(12, 22), 2.5, T(0.8));
        }

        // sparks: short yellow-orange dashes rising in a column above the fire (rise on twos)
        const rs = Motion.rng('cf-sp');
        for (let k = 0; k < 95; k++) {
            const h = rs(), y0 = 460 - h * 450 - d * 14, y = ((y0 % 470) + 470) % 470 + 10;
            const x = 520 + (rs() - 0.5) * (80 + (470 - y) * 0.45) + Math.sin(y / 70) * 25;
            const a = -1.3 + (rs() - 0.5) * 0.9, l = 5 + rs() * 7;
            const pts = [[x, y], [x + Math.cos(a) * l, y + Math.sin(a) * l]];
            U.erase([navy, navyS, blueS], pts, 5, false);
            U.stroke(yel, pts, 3.2, T(1));
            if (rs() < 0.5) U.stroke(pink, pts, 2.2, T(0.7));
        }
        // grit over the whole print: pinholes in every ink and a few stray specks
        U.grit(pink, [0, 500, 1080, 1080], { out: true, p: 0.18, a: 0.7, seed: 11 });
        U.grit(yel, [0, 500, 1080, 1080], { out: true, p: 0.12, a: 0.6, seed: 12 });
        U.grit(navy, [0, 780, 1080, 1080], { out: true, p: 0.2, a: 0.7, seed: 13 });
        U.grit(pink, [0, 0, 1080, 1080], { p: 0.04, a: 0.8, seed: 14 });
    });
};
