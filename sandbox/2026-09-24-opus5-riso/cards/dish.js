// Card «dish» (reference ≈ 12.71–12.83 s, full frame). A radio telescope at night: a big
// tilted dish (paper with blue and pink dots, a blue grid, a navy back) on a pink-lined
// mount, its feed sending yellow signal arcs to a spiral galaxy (pink-dotted arms, yellow
// core); a row of small navy dishes on the horizon; the sky navy above, pink dots rising
// to the horizon; the ground blue dots on navy, a pink wavy line, stars.
// Authored in reference pixels (1080 frame) through G5.px. CARDS.dish(press, t).
var CARDS = CARDS || {};
CARDS.dish = (press, t) => {
    const R = Riso, T = R.tone, U = G5;
    const d = Math.floor(t * 12 + 1e-6);
    const P = (ink, k) => press.plate(ink, k);
    const pink = P('pink'), pinkS = P('pink', 'screen'), yel = P('yellow'), yelS = P('yellow', 'screen');
    const blue = P('blue'), blueS = P('blue', 'screen'), navy = P('navy'), navyS = P('navy', 'screen');
    const all = [pink, pinkS, yel, yelS, blue, blueS, navy, navyS];
    const eraseIn = (plates, fn) => { for (const g of plates) { g.save(); g.globalCompositeOperation = 'destination-out'; g.fillStyle = '#000'; g.strokeStyle = '#000'; g.beginPath(); fn(g); g.restore(); } };
    const ell = (g, cx, cy, a, b, rot, a0 = 0, a1 = 7) => g.ellipse(cx, cy, a, b, rot, a0, a1);

    U.px(press, () => {
        // sky: flat navy at the top turning into navy dots, pink dots rising to the horizon
        // (the navy is a dense screen: its paper gaps let the pink dots glow through)
        { const gr = navyS.createLinearGradient(0, 0, 0, 860); gr.addColorStop(0, T(0.9)); gr.addColorStop(0.5, T(0.86)); gr.addColorStop(0.7, T(0.5)); gr.addColorStop(0.88, T(0.05)); gr.addColorStop(1, T(0)); navyS.fillStyle = gr; navyS.fillRect(0, 0, 1080, 900); }
        navy.fillStyle = R.ramp(navy, 0, 0, 0, 560, 0.55, 0); navy.fillRect(0, 0, 1080, 560);
        { const gr = pinkS.createLinearGradient(0, 0, 0, 860); gr.addColorStop(0, T(0.4)); gr.addColorStop(0.45, T(0.42)); gr.addColorStop(0.68, T(0.65)); gr.addColorStop(0.88, T(0.92)); gr.addColorStop(1, T(0.95)); pinkS.fillStyle = gr; pinkS.fillRect(0, 0, 1080, 900); }
        // purple haze drifting across the upper sky (flat pink, soft)
        for (const [x, y, r] of [[200, 120, 260], [700, 330, 300], [950, 60, 200]]) U.glow(pink, x, y, r, 0.3, 0);
        U.glow(blueS, 480, 80, 300, 0.2, 0);
        // stars: small knocked-out points, some pink, some yellow
        const rs = Motion.rng('dish-stars');
        eraseIn([navy, navyS, pinkS, blueS, pink], (g) => { for (let k = 0; k < 260; k++) { const x = rs() * 1080, y = rs() * 800, r = 2 + rs() * 2.6; g.moveTo(x + r, y); g.arc(x, y, r, 0, 7); } g.fill(); });
        U.speckle(pink, 'dish-ps', 80, 0, 0, 1080, 800, 1.5, 3, T(1));
        U.speckle(yel, 'dish-ys', 25, 0, 0, 1080, 800, 1.5, 2.5, T(1));

        // the ground: blue dots on navy, a white edge, a pink wavy line, dark below
        const gy = (x) => 842 + 12 * Math.sin(x / 90 + 0.6) + 6 * Math.sin(x / 37);
        const ground = [];
        for (let x = -10; x <= 1090; x += 20) ground.push([x, gy(x)]);
        const gpoly = [...ground, [1090, 1090], [-10, 1090]];
        eraseIn(all, (g) => U.trace(g, gpoly) || g.fill());
        U.fill(navyS, gpoly, T(0.62));
        U.fill(navy, gpoly, T(0.3));
        U.fill(blueS, gpoly, T(0.7));
        U.fill(pinkS, gpoly, T(0.08));
        eraseIn(all, (g) => { g.lineWidth = 4; U.trace(g, ground, false); g.stroke(); });
        const wy = (x) => 990 + 9 * Math.sin(x / 70 + 1.2);
        const wave = []; for (let x = -10; x <= 1090; x += 15) wave.push([x, wy(x)]);
        U.fill(navy, [...wave, [1090, 1090], [-10, 1090]], T(0.7));
        U.erase([navy, navyS, blueS], wave, 5);
        U.stroke(pink, wave, 4, T(1), true);

        // the small dishes on the horizon: navy silhouettes
        for (const [x, y, s, a] of [[765, 792, 1.15, -0.35], [893, 832, 0.95, -0.3], [1005, 842, 0.8, -0.28], [1085, 830, 0.7, -0.25]]) {
            navy.fillStyle = T(1);
            navy.beginPath(); ell(navy, x, y, 52 * s, 24 * s, a); navy.fill();
            navy.beginPath(); U.trace(navy, [[x - 12 * s, y + 10 * s], [x + 12 * s, y + 10 * s], [x + 16 * s, y + 90 * s], [x - 18 * s, y + 90 * s]]); navy.fill();
            U.stroke(navy, [[x + 5 * s, y - 10 * s], [x + 22 * s, y - 45 * s]], 3 * s, T(1));
            U.stroke(pinkS, [[x - 50 * s, y + 20 * s], [x + 40 * s, y - 10 * s]], 6 * s, T(0.3));
        }

        // the mount under the big dish: dark legs with pink edges, a pink cross brace
        for (const [a, b] of [[[330, 770], [195, 1000]], [[440, 800], [470, 1000]]]) {
            U.erase([navy, navyS, blueS, pinkS], [a, b], 7, false);
            U.stroke(blueS, [a, b], 7, T(0.3));
            U.stroke(pink, [[a[0] + 4, a[1]], [b[0] + 4, b[1]]], 2, T(1));
        }
        U.stroke(pink, [[240, 875], [445, 965]], 3, T(1));
        U.stroke(pink, [[265, 955], [425, 815]], 3, T(1));

        // the big dish: its navy back, then the paper bowl with dots and a blue grid
        const C = [378, 638], A = 342, B = 182, ROT = 0.4;
        navy.fillStyle = T(1);
        navy.beginPath(); ell(navy, C[0] - 18, C[1] + 34, A, B, ROT); navy.fill();
        eraseIn([pink, pinkS, yel, yelS, blueS, blue], (g) => { ell(g, C[0] - 18, C[1] + 34, A, B, ROT); g.fill(); });
        U.stroke(pink, [[120, 600], [180, 700], [260, 780], [370, 845]], 3, T(1), true);
        eraseIn(all, (g) => { ell(g, C[0], C[1], A, B, ROT); g.fill(); });
        blueS.save(); blueS.beginPath(); ell(blueS, C[0], C[1], A, B, ROT); blueS.clip();
        blueS.fillStyle = R.ramp(blueS, 100, 450, 600, 800, 0.3, 0.16); blueS.fillRect(0, 0, 1080, 1080); blueS.restore();
        pinkS.save(); pinkS.beginPath(); ell(pinkS, C[0], C[1], A, B, ROT); pinkS.clip();
        pinkS.fillStyle = R.ramp(pinkS, 100, 450, 600, 800, 0.24, 0.05); pinkS.fillRect(0, 0, 1080, 1080); pinkS.restore();
        // the grid: rings round the centre and ribs to the rim (blue lines)
        blue.save(); blue.beginPath(); ell(blue, C[0], C[1], A - 4, B - 4, ROT); blue.clip();
        blue.strokeStyle = T(1); blue.lineWidth = 3.2;
        const cx = C[0] + 30, cy = C[1] + 10;
        for (const k of [0.25, 0.48, 0.72]) { blue.beginPath(); ell(blue, cx, cy, A * k, B * k, ROT); blue.stroke(); }
        for (let i = 0; i < 16; i++) {
            const a = (i / 16) * Math.PI * 2, ex = C[0] + Math.cos(a) * A * Math.cos(ROT) - Math.sin(a) * B * Math.sin(ROT), ey = C[1] + Math.cos(a) * A * Math.sin(ROT) + Math.sin(a) * B * Math.cos(ROT);
            blue.beginPath(); blue.moveTo(cx + (ex - cx) * 0.25, cy + (ey - cy) * 0.25); blue.quadraticCurveTo((cx + ex) / 2 + 10, (cy + ey) / 2 + 10, ex, ey); blue.stroke();
        }
        blue.restore();
        // the rim: a navy line, a pink one outside
        navy.strokeStyle = T(1); navy.lineWidth = 4; navy.beginPath(); ell(navy, C[0], C[1], A, B, ROT); navy.stroke();
        pink.strokeStyle = T(1); pink.lineWidth = 2.5; pink.beginPath(); ell(pink, C[0] - 3, C[1] - 4, A + 3, B + 3, ROT, Math.PI * 0.95, Math.PI * 2.05); pink.stroke();

        // the feed struts: pale rods (knocked out, pink edge) meeting at the feed
        const F = [512, 368];
        for (const [x, y] of [[110, 442], [385, 790], [690, 752]]) {
            eraseIn(all, (g) => { g.lineWidth = 8; g.lineCap = 'round'; g.moveTo(x, y); g.lineTo(F[0], F[1]); g.stroke(); });
            U.stroke(pink, [[x + 3, y + 3], [F[0] + 3, F[1] + 3]], 2.5, T(1));
            U.stroke(blueS, [[x - 2, y - 2], [F[0] - 2, F[1] - 2]], 3, T(0.5));
        }
        U.stroke(pink, [[110, 442], [480, 358]], 2.5, T(1));
        navy.fillStyle = T(1); navy.beginPath(); navy.arc(F[0], F[1], 14, 0, 7); navy.fill();
        U.stroke(navy, [[F[0], F[1]], [F[0] + 22, F[1] - 26]], 7, T(1));

        // signal arcs: yellow crescents edged pink, pulsing outwards on twos
        const ph = (d % 3) * 6;
        for (const [a, b, c, w] of [[[512, 232], [527, 280], [528, 332], 6], [[570, 244], [610, 318], [640, 394], 8], [[626, 244], [660, 290], [680, 344], 8], [[690, 246], [705, 272], [714, 300], 6], [[542, 360], [578, 400], [604, 444], 7]]) {
            const pts = []; for (let i = 0; i <= 12; i++) { const u = i / 12, v = 1 - u; pts.push([v * v * a[0] + 2 * u * v * (2 * b[0] - (a[0] + c[0]) / 2) + u * u * c[0] + ph * 0.5, v * v * a[1] + 2 * u * v * (2 * b[1] - (a[1] + c[1]) / 2) + u * u * c[1] - ph * 0.3]); }
            eraseIn([navy, navyS, pinkS, blueS], (g) => { g.lineWidth = w + 4; g.lineCap = 'round'; U.trace(g, pts, false); g.stroke(); });
            // crescent: thick in the middle, thin at the ends
            for (let i = 0; i < 12; i++) {
                const ww = w * Math.sin(Math.PI * (i + 0.5) / 12) + 1;
                U.stroke(yel, [pts[i], pts[i + 1]], ww, T(1));
                U.stroke(pink, [pts[i], pts[i + 1]].map(([px, py]) => [px - 2.5, py + 2]), ww * 0.3, T(0.5));
            }
        }

        // the galaxy: a core of yellow and pink dots, two pink-dotted arms, a yellow S
        const G = [838, 215];
        yelS.save(); yelS.translate(G[0], G[1]); yelS.rotate(-0.35); yelS.scale(1, 0.55); U.glow(yelS, 0, 0, 130, 0.7, 0); yelS.restore();
        pinkS.save(); pinkS.translate(G[0], G[1]); pinkS.rotate(-0.35); pinkS.scale(1, 0.55); U.glow(pinkS, 0, 0, 150, 0.55, 0); pinkS.restore();
        eraseIn([navy], (g) => { g.save(); g.translate(G[0], G[1]); g.rotate(-0.35); g.scale(1, 0.55); g.arc(0, 0, 150, 0, 7); g.restore(); g.fill(); });
        eraseIn([navyS], (g) => { g.save(); g.translate(G[0], G[1]); g.rotate(-0.35); g.scale(1, 0.55); g.arc(0, 0, 120, 0, 7); g.restore(); g.fill(); });
        navyS.save(); navyS.translate(G[0], G[1]); navyS.rotate(-0.35); navyS.scale(1, 0.55); U.glow(navyS, 0, 0, 120, 0.3, 0.8); navyS.restore();
        const arm = (sgn, r0, r1, turns, w, g, v) => {
            const pts = [];
            for (let i = 0; i <= 40; i++) { const u = i / 40, a = sgn * 0 + Math.PI * (sgn > 0 ? 0 : 1) + u * turns, r = r0 + (r1 - r0) * u; pts.push([G[0] + Math.cos(a - 0.35) * r * 1.1, G[1] + Math.sin(a - 0.35) * r * 0.62]); }
            U.stroke(g, pts, w, T(v), true);
            return pts;
        };
        // clear the night under the arms so their dots glow on paper
        for (const sg of [1, -1]) { const pts = arm(sg, 20, 210, 3.4, 0.01, yelS, 0); U.erase([navy, navyS, blueS], pts, 15); }
        arm(1, 20, 210, 3.4, 11, pinkS, 0.9); arm(-1, 20, 210, 3.4, 11, pinkS, 0.9);
        arm(1, 20, 210, 3.4, 3, pink, 0.7); arm(-1, 20, 210, 3.4, 3, pink, 0.7);
        for (const sg of [1, -1]) { const pts = arm(sg, 18, 95, 2.4, 0.01, yelS, 0); U.erase([navy, navyS, pinkS], pts, 18); }
        arm(1, 18, 95, 2.4, 14, yel, 1); arm(-1, 18, 95, 2.4, 14, yel, 1);
        arm(1, 18, 95, 2.4, 16, pinkS, 0.35); arm(-1, 18, 95, 2.4, 16, pinkS, 0.35);
        U.speckle(pink, 'dish-gal', 50, 680, 120, 1060, 320, 1.2, 2.6, T(1));
    });
};
