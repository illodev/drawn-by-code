// pier-pressure · props: Kit's board, Pip's scooter, a harbour bollard.
//   Cast.board(g, x, y, s, rot)  Cast.scooter(g, x, y, s)  Cast.bollard(g, x, y, s)
(() => {
    const T = SkateToon, C = T.COL, { dot, star, plaster, lock, HAIR, SKIN } = Cast;
    const { add, sub, mul, mix, unit } = SkateKid;
    // --- props ----------------------------------------------------------------------------
    /** A skateboard seen from the side: wheels on (x, y), nose to +x; rot tips it. */
    function board(g, x, y, s, rotA = 0, o = {}) {
        const w = T.LINE / s, fine = T.LINE_FINE / s, deck = o.deck ?? C.magenta, wheel = o.wheel ?? HAIR;
        g.save();
        g.translate(x, y);
        g.scale(s, s);
        g.rotate(rotA);
        // trucks behind the wheels
        for (const tx of [-13.5, 13.5]) {
            T.shape(g, [[tx - 3.4, -6.6, 1], [tx + 3.4, -6.6, 1], [tx + 2, -4.4], [tx + 1.6, -2.6, 1], [tx - 1.6, -2.6, 1], [tx - 2, -4.4]], { fill: C.grey, w, seed: 'truck' + tx });
            dot(g, tx - 1.8, -6, fine * 0.4, C.ink);
            dot(g, tx + 1.8, -6, fine * 0.4, C.ink);
        }
        // the deck: plies, a kicked nose and tail, grip tape on top
        const top = [[-24.5, -11.2], [-21.5, -8.6], [-16, -7.3], [0, -7.2], [16, -7.3], [21.5, -8.8], [25.5, -11.8]];
        const bot = top.map(([px, py]) => [px * 0.985, py + 1.9]).reverse();
        T.shape(g, [[...top[0], 1], ...top.slice(1, -1), [...top[6], 1], [...bot[0], 1], ...bot.slice(1, -1), [...bot[6], 1]], { fill: deck, w, seed: 'deck' });
        T.line(g, top.map(([px, py]) => [px * 0.99, py + 0.75]), { w: w * 1.1, seed: 'grip', taper: false, color: '#2a2530' });
        T.line(g, top.map(([px, py]) => [px * 0.97, py + 1.45]).slice(1, 6), { w: fine * 0.6, seed: 'ply', taper: false, color: '#fff1a8' });
        for (const wx of [-13.5, 13.5]) {
            T.shape(g, T.ellipse(wx, -3, 3.1, 3, 0, 12), { fill: wheel, w, seed: 'wheel' + wx });
            T.shape(g, T.ellipse(wx, -3, 1.15, 1.1, 0, 8), { fill: C.white, w: fine, seed: 'hub' + wx });
            dot(g, wx, -3, fine * 0.35, C.ink);
        }
        g.restore();
    }

    /** Pip's kick scooter, wheels on (x, y), the bar to the left. */
    function scooter(g, x, y, s) {
        const w = T.LINE / s, fine = T.LINE_FINE / s;
        g.save();
        g.translate(x, y);
        g.scale(s, s);
        // rear fender and brake
        T.shape(g, [[13, -7.4, 1], [19, -9.4], [23.6, -6.2], [22.4, -4.6, 1], [18.6, -6.8], [14, -5.4, 1]], { fill: C.greyDeep, w, seed: 'sc-fender' });
        // the deck, low between the wheels
        T.shape(g, [[-9, -4.6, 1], [15, -5.6, 1], [16, -3.9], [15, -2.2, 1], [-8.4, -1.6, 1], [-10, -3]], { fill: HAIR, w, seed: 'sc-deck' });
        T.line(g, [[-6, -4.2], [12.6, -5]], { w: w * 1.1, seed: 'sc-grip', taper: false, color: '#2a2530' });
        // the fork and the stem
        T.tube(g, [[-13.6, -3.6], [-11.4, -9], [-10, -40]], 2.1, { fill: C.grey, w, seed: 'sc-stem' });
        T.shape(g, [[-12.8, -22, 1], [-8.6, -22.3, 1], [-8.4, -19.6, 1], [-12.6, -19.3, 1]], { fill: C.greyDeep, w: fine, seed: 'sc-clamp' });
        T.shape(g, [[-9, -9.8, 1], [-4, -5.4, 1], [-5.6, -3.8, 1], [-11, -8, 1]], { fill: C.grey, w, seed: 'sc-neck' });
        // handlebar with grips and tassels
        T.tube(g, [[-17.5, -39.6], [-2.6, -40.6]], 1.9, { fill: C.grey, w, seed: 'sc-bar' });
        for (const [gx, gy, sgn] of [[-18.6, -39.5, -1], [-1.4, -40.7, 1]]) {
            T.tube(g, [[gx - 2.6, gy + 0.15 * sgn], [gx + 2.6, gy - 0.15 * sgn]], 3, { fill: C.magenta, w, seed: 'sc-grip' + sgn });
            for (let k = 0; k < 3; k++) T.line(g, [[gx + sgn * 3.6, gy], [gx + sgn * (5 + k * 0.8), gy + 2.4 + k * 0.5], [gx + sgn * (4.4 + k * 1.3), gy + 5.4 + k * 0.9]], { w: fine, seed: 'sc-tas' + sgn + k, color: [C.roadLine, C.blue, C.magenta][k] });
        }
        // a bell
        T.shape(g, T.ellipse(-6.4, -43, 2.2, 1.9, 0, 10), { fill: C.roadLine, w: fine, seed: 'sc-bell' });
        dot(g, -6.4, -43.2, fine * 0.4, C.ink);
        for (const wx of [-14, 18.6]) {
            T.shape(g, T.ellipse(wx, -3.6, 3.7, 3.6, 0, 12), { fill: C.orange, w, seed: 'sc-wheel' + wx });
            T.shape(g, T.ellipse(wx, -3.6, 1.4, 1.35, 0, 8), { fill: C.white, w: fine, seed: 'sc-hub' + wx });
            dot(g, wx, -3.6, fine * 0.38, C.ink);
        }
        g.restore();
    }

    /** A harbour mooring bollard with a turn of rope, base on (x, y). */
    function bollard(g, x, y, s) {
        const w = T.LINE_BG / s, fine = T.LINE_FINE / s;
        g.save();
        g.translate(x, y);
        g.scale(s, s);
        T.shape(g, [[-13, 0, 1], [-11.5, -5.4], [11.5, -5.4], [13, 0, 1]], { fill: '#5d6b78', w, seed: 'bol-base' });
        T.shape(g, [[-7.4, -5, 1], [-6.4, -24], [6.4, -24], [7.4, -5, 1]], { fill: '#7d8e9c', w, seed: 'bol-post' });
        // rope
        for (let k = 0; k < 3; k++) {
            const yy = -9 - k * 3.4;
            T.shape(g, [[-8.6, yy + 1.4], [-8.6, yy - 1.5], [0, yy - 0.6], [8.6, yy - 1.5], [8.6, yy + 1.4], [0, yy + 2.3]], { fill: '#e8cf8a', w: fine, seed: 'bol-rope' + k });
            for (let i = -2; i <= 2; i++) T.line(g, [[i * 3 - 0.7, yy + 1.7], [i * 3 + 0.7, yy - 0.7]], { w: fine * 0.7, seed: 'bol-tw' + k + i, amp: 0.1 });
        }
        T.shape(g, [[-10, -24, 1], [-10.6, -28.4], [-6, -31.6], [6, -31.6], [10.6, -28.4], [10, -24, 1]], { fill: '#7d8e9c', w, seed: 'bol-cap' });
        T.line(g, [[-6.4, -29.4], [-2, -30.3]], { w: fine, seed: 'bol-gl', color: C.white });
        T.line(g, [[-4.2, -12], [-4.4, -7]], { w: fine, seed: 'bol-r1' });
        T.line(g, [[3.4, -22], [3.6, -19.4]], { w: fine, seed: 'bol-r2' });
        g.restore();
    }

    Object.assign(Cast, { board, scooter, bollard });
})();
