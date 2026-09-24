// Card «volcano» (reference ≈ 12.46–12.58 s, full frame). An erupting volcano: a navy cone
// with yellow lava rivers edged in orange, a yellow fountain from the crater, a red-orange
// glow (yellow + pink solids, navy dots growing outwards) between the ash cloud and the
// cone, a navy ash cloud with a pink lightning bolt (white core), blue-dotted night round it.
// Authored in reference pixels (1080 frame) through G5.px. CARDS.volcano(press, t).
var CARDS = CARDS || {};
CARDS.volcano = (press, t) => {
    const R = Riso, T = R.tone, U = G5;
    const d = Math.floor(t * 12 + 1e-6);
    const P = (ink, k) => press.plate(ink, k);
    const pink = P('pink'), pinkS = P('pink', 'screen'), yel = P('yellow'), yelS = P('yellow', 'screen');
    const blueS = P('blue', 'screen'), navy = P('navy'), navyS = P('navy', 'screen');
    const eraseIn = (plates, pts, sm, fn) => { for (const g of plates) { g.save(); g.globalCompositeOperation = 'destination-out'; g.fillStyle = '#000'; g.beginPath(); (sm ? U.smooth : U.trace)(g, pts); g.fill(); g.restore(); } };
    U.px(press, () => {
        const CX = 655, CY = 600; // the glow's centre, just above the crater
        // night: navy flat with coarse blue dots, a few pink dots
        navy.fillStyle = T(0.8); navy.fillRect(0, 0, 1080, 1080);
        blueS.fillStyle = T(0.55); blueS.fillRect(0, 0, 1080, 1080);
        pinkS.fillStyle = T(0.06); pinkS.fillRect(0, 0, 1080, 1080);
        // the glow: an ellipse where the night is wiped and orange printed; navy dots come
        // back towards its rim
        const glowE = (g, a0, a1, r0 = 0.25) => {
            g.save(); g.translate(CX, CY); g.scale(1, 0.62);
            const gr = g.createRadialGradient(0, 0, 0, 0, 0, 720);
            gr.addColorStop(0, T(a0)); gr.addColorStop(r0, T(a0)); gr.addColorStop(0.72, T(a0 * 0.85 + a1 * 0.15)); gr.addColorStop(1, T(a1));
            g.fillStyle = gr; g.beginPath(); g.arc(0, 0, 720, 0, 7); g.fill(); g.restore();
        };
        for (const g of [navy, blueS, pinkS]) { g.save(); g.globalCompositeOperation = 'destination-out'; glowE(g, 1, 0, 0.62); g.restore(); }
        glowE(yel, 0.97, 0, 0.6);
        glowE(pink, 0.85, 0, 0.72);
        // navy dots: none at the heart, dense towards the rim
        navyS.save(); navyS.translate(CX, CY); navyS.scale(1, 0.62);
        { const gr = navyS.createRadialGradient(0, 0, 0, 0, 0, 720); gr.addColorStop(0, T(0)); gr.addColorStop(0.3, T(0.04)); gr.addColorStop(0.62, T(0.12)); gr.addColorStop(0.85, T(0.5)); gr.addColorStop(1, T(0)); navyS.fillStyle = gr; navyS.beginPath(); navyS.arc(0, 0, 720, 0, 7); navyS.fill(); }
        navyS.restore();
        // the heart of the glow a touch lighter (less pink)
        pink.save(); pink.globalCompositeOperation = 'destination-out'; U.glow(pink, 600, 560, 120, 0.3, 0); pink.restore();

        // the ash cloud: a lumpy navy mass hanging from the top, a lower lobe over the crater
        const cloud = [[150, -20], [960, -20], [945, 90], [900, 170], [880, 230], [830, 260], [800, 330], [770, 380], [720, 410], [660, 430], [590, 440], [520, 430], [460, 400], [425, 350], [420, 300], [400, 260], [330, 220], [260, 180], [200, 130], [165, 60]];
        eraseIn([pink, yel, navyS, blueS, pinkS], cloud, true);
        U.fill(navy, cloud, T(0.86), true);
        U.fill(pink, cloud, T(0.1), true);
        // lighter lobes inside the cloud: flat purple (a little more pink, a little less navy)
        for (const [x, y, rx, ry] of [[330, 110, 170, 90], [720, 120, 200, 110], [620, 360, 150, 60], [480, 300, 80, 70], [560, 200, 110, 90]]) {
            pink.save(); pink.translate(x, y); pink.scale(1, ry / rx); U.glow(pink, 0, 0, rx, 0.22, 0); pink.restore();
            navy.save(); navy.globalCompositeOperation = 'destination-out'; navy.translate(x, y); navy.scale(1, ry / rx); U.glow(navy, 0, 0, rx, 0.12, 0); navy.restore();
        }
        U.clipped(pink, cloud, true, (g) => U.speckle(g, 'volc-cl', 160, 150, 0, 960, 440, 0.8, 1.8, T(1)));
        U.clipped(blueS, cloud, true, (g) => { g.fillStyle = T(0.12); g.fillRect(0, 0, 1080, 200); });
        // the cloud's lower edge: a thin darker line
        U.stroke(navy, [[420, 300], [440, 370], [500, 420], [590, 440], [680, 428], [760, 385], [800, 330]], 3, T(1), true);
        // a smoke plume rising from the crater into the cloud (navy dots)
        

        // the cone
        const cone = [[-20, 880], [120, 790], [260, 735], [390, 690], [520, 655], [598, 628], [625, 622], [690, 628], [712, 636], [790, 700], [870, 745], [980, 800], [1100, 870], [1100, 1100], [-20, 1100]];
        eraseIn([pink, yel, navyS, blueS, pinkS], cone, false);
        U.fill(navy, cone, T(0.95));
        // a lighter purple slope on the left and pink rim light along the left ridge
        U.clipped(pink, cone, false, (g) => { g.fillStyle = R.ramp(g, 0, 720, 0, 1000, 0.3, 0.05); g.fillRect(0, 650, 520, 450); });
        U.clipped(pink, cone, false, (g) => U.speckle(g, 'volc-co', 140, 0, 640, 1080, 1080, 0.8, 1.8, T(1)));
        U.stroke(pink, [[330, 705], [420, 678], [520, 652], [598, 628]], 5, T(0.9), true);
        U.stroke(pinkS, [[80, 812], [200, 755], [330, 705]], 10, T(0.6), true);
        // the crater: a dark lip, a yellow mouth
        U.fill(navy, [[596, 630], [620, 618], [660, 614], [700, 620], [714, 634], [680, 640], [630, 640]], T(1), true);
        U.fill(yel, [[612, 628], [640, 622], [680, 622], [702, 630], [670, 634], [630, 634]], T(1), true);

        // lava rivers: pink halo dots, an orange band (pink + yellow), a yellow core
        const rivers = [
            [[602, 640], [585, 700], [560, 780], [520, 860], [470, 910], [410, 960], [330, 1005], [250, 1030], [190, 1045]],
            [[470, 910], [420, 980], [380, 1030], [350, 1090]],
            [[665, 642], [655, 720], [640, 800], [630, 880], [636, 950], [650, 1010], [660, 1090]],
            [[636, 950], [680, 1000], [720, 1040], [760, 1090]],
            [[712, 642], [760, 690], [810, 750], [845, 820], [860, 900], [866, 980], [880, 1040], [900, 1090]],
            [[860, 900], [845, 960], [830, 1020], [818, 1090]],
            [[866, 980], [910, 1020], [950, 1050], [990, 1090]],
            [[250, 1030], [230, 1060], [215, 1090]],
        ];
        rivers.forEach((pts, i) => {
            const w = i % 2 === 0 ? 1 : 0.8;
            U.stroke(pinkS, pts, 46 * w, T(0.7), true);
            U.erase([navy], pts, 22 * w);
            U.stroke(navy, pts, 22 * w, T(0.25), true);
            U.erase([pinkS], pts, 18 * w);
            U.band(pts, [[pink, 18 * w, 1], [yel, 18 * w, 1]]);
            U.erase([pink, navy], pts, 12 * w);
        });
        // cooled clots on the lava
        const rr = Motion.rng('volc-clot');
        rivers.forEach((pts) => {
            for (let k = 1; k < pts.length - 1; k++) if (rr() < 0.5) {
                const [x, y] = pts[k]; navy.fillStyle = T(0.9); navy.beginPath(); navy.ellipse(x + rr() * 6 - 3, y, 5 + rr() * 3, 4, rr() * 3, 0, 7); navy.fill();
            }
        });

        // the fountain: yellow tongues fanning up out of the crater (on twos they flicker)
        const rf = Motion.rng('volc-f' + (d % 4));
        const tongue = (a, len, w) => {
            const bx = 655 + Math.cos(a) * 20, by = 624, tx = 655 + Math.cos(a) * len, ty = 624 + Math.sin(a) * len;
            const nx = -Math.sin(a) * w, ny = Math.cos(a) * w;
            const shape = [[bx + nx, by + ny], [(bx + tx) / 2 + nx * 0.6, (by + ty) / 2 + ny * 0.6], [tx, ty], [(bx + tx) / 2 - nx * 0.6, (by + ty) / 2 - ny * 0.6], [bx - nx, by - ny]];
            eraseIn([pink, navyS, pinkS, blueS], shape, false);
            U.fill(yel, shape, T(1));
        };
        for (let k = 0; k < 29; k++) {
            const u = k / 28 - 0.5;
            const a = -Math.PI / 2 + u * 2.8 + (rf() - 0.5) * 0.1;
            const len = (215 - Math.abs(u) * 280) * (0.7 + rf() * 0.45);
            tongue(a, len, 4 + rf() * 3);
        }
        U.glow(yel, 655, 610, 40, 1, 1);
        eraseIn([pink], U.blob(655, 605, 45, 28, 'vf'), true);
        // the spire of smoke/ash above the fountain
        U.stroke(navyS, [[680, 440], [684, 390], [688, 345]], 5, T(0.6));

        // lightning in the cloud: a pink bolt with a white core, two thin branches
        const bolt = [[488, 28], [500, 90], [492, 150], [480, 200], [500, 262], [518, 300], [538, 332]];
        const br1 = [[487, 158], [440, 190], [385, 228]], br2 = [[505, 258], [548, 284], [582, 306]];
        const on = d % 3 !== 2;
        U.stroke(pinkS, bolt, 44, T(on ? 0.2 : 0.1), false);
        for (const [pts, w, c] of [[bolt, 16, 3.5], [br1, 5, 2], [br2, 5, 2]]) {
            U.erase([navy, blueS, pinkS], pts, w + 4, false);
            U.stroke(pink, pts, w, T(on ? 1 : 0.8), false);
            U.erase([pink], pts.map(([x, y]) => [x + 2, y]), c * 1.5, false);
        }

        // sparks and embers flying in the glow
        const rs = Motion.rng('volc-sp');
        for (let k = 0; k < 70; k++) {
            const x = 150 + rs() * 900, y = 200 + rs() * 650, a = rs() * 6.28, l = 3 + rs() * 7;
            const g = rs() < 0.6 ? yel : pink;
            U.stroke(g, [[x, y], [x + Math.cos(a) * l, y + Math.sin(a) * l]], 2.4, T(1));
        }
        U.speckle(pinkS, 'volc-st', 60, 0, 0, 1080, 1080, 1.5, 2.5, T(1));
    });
};
