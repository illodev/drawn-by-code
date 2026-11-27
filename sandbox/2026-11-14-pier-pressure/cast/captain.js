// pier-pressure · Captain, the one-eyed gull who takes a cut of every bag of chips.
//   Cast.gull(g, x, y, s, pose)
(() => {
    const T = SkateToon, C = T.COL, { dot, star, plaster, lock, HAIR, SKIN } = Cast;
    const { add, sub, mul, mix, unit } = SkateKid;
    // --- Captain: the one-eyed gull who runs the harbour's chip racket -------------------------
    const white = '#fffdf6', greyW = '#9fb0bf', legC = '#f47c3c', bill = '#ffc928', DARK = '#2a2530';
    // The gull's face, in the standing drawing's coordinates (head centred on 13.6, −47.4).
    function face(g, w, fine, { look, lid, beak, chip }) {
        // the beak: long, hooked, a red spot under the tip; a chip in it
        const open = beak * 5;
        if (chip) {
            T.shape(g, [[27, -45.4 + open * 0.2, 1], [41.6, -49, 1], [42.4, -46.6, 1], [27.8, -43, 1]], { fill: '#ffd76a', w: fine, seed: 'gull-chip' });
            T.line(g, [[31, -45.4], [36, -46.6]], { w: fine * 0.7, seed: 'gull-chipl', color: '#d99a2b' });
        }
        T.shape(g, [[20.4, -45.4, 1], [28, -44.6 + open * 0.5], [33, -43 + open, 1], [27, -41.4 + open * 0.7], [20, -42.6, 1]], { fill: '#f0a81c', w, seed: 'gull-lower' });
        T.shape(g, [[19.6, -50.4, 1], [27, -50.4], [33.4, -48.4], [36.6, -44.4], [35.4, -41.2, 1], [33.4, -44.6], [27, -45.6], [20.4, -45.2, 1]], { fill: bill, w, seed: 'gull-upper' });
        dot(g, 32.6, -46.4, 1, C.red);
        dot(g, 24.6, -48.6, 0.5, C.ink);
        T.line(g, [[28.6, -49.4], [30, -47.4]], { w: fine * 0.8, seed: 'gull-scar' });
        // the eye: one, heavy-lidded and unimpressed
        const ex = 15.6, ey = -48.6, er = 4.3, pr = 0.95;
        T.shape(g, T.ellipse(ex, ey, er, er * 1.02, 0, 12), {
            fill: C.white, w, seed: 'gull-eye',
            inside: (gg) => {
                const yl = ey - er + lid * 2 * er;
                dot(gg, ex + look[0] * (er - pr - w), Math.max(ey + look[1] * (er - pr - w), yl + pr * 0.8), pr, C.ink);
                gg.fillStyle = '#e9e2cf';
                gg.fillRect(ex - er * 1.3, ey - er * 1.3, er * 2.6, yl - (ey - er * 1.3));
                T.line(gg, [[ex - er * 1.1, yl - 0.5], [ex + er * 1.1, yl + 0.7]], { w, seed: 'gull-lid' });
            },
        });
        T.line(g, [[ex - 4.6, ey - 6], [ex + 0.4, ey - 5.6], [ex + 5, ey - 3.4]], { w: w * 1.5, seed: 'gull-brow', taper: false });
        // the patch over the other eye, its strap round the head
        T.line(g, [[5.4, -49], [10, -53.4], [17, -55.6], [21.6, -53.6]], { w: w * 1.1, seed: 'gull-strap', color: '#2a2530', taper: false });
        T.shape(g, [[5.6, -50.4, 1], [9.6, -51.4, 1], [10.6, -46.6], [7.6, -44.4, 1], [5.2, -46.4]], { fill: '#2a2530', w: fine, seed: 'gull-patch' });
        // three feathers standing up on the crown
        for (const [fx, a] of [[11.4, -0.5], [14, -0.1], [16.4, 0.3]]) T.line(g, [[fx, -54.6], [fx + Math.sin(a) * 4.6, -54.6 - Math.cos(a) * 4.6]], { w: fine, seed: 'gull-cr' + fx });
    }

    /**
     * pose: { look: [x, y], lid, beak (0..1 open), chip (true: a chip in the beak), wing (0..1
     * lifted), hop }. Feet on (x, y), facing screen right (flip: true for left).
     */
    function gull(g, x, y, s, pose = {}) {
        const { look = [0.5, 0.1], lid = 0.42, beak = 0.12, chip = true, wing = 0, flip = false } = pose;
        const w = T.LINE / s, fine = T.LINE_FINE / s;
        const leg = legC;
        g.save();
        g.translate(x, y);
        g.scale(flip ? -s : s, s);
        // legs: thin, knobbly, with webbed feet
        for (const [lx, back] of [[-3, 1], [5.4, 0]]) {
            T.tube(g, [[lx, -15], [lx + 0.6, -8], [lx - 0.4, -1.6]], 1.5, { fill: leg, w, seed: 'gull-leg' + lx, cap: 'butt' });
            T.shape(g, T.ellipse(lx + 0.5, -8.4, 1.5, 1.3, 0, 8), { fill: leg, w: fine, seed: 'gull-knee' + lx });
            T.shape(g, [[lx - 1.6, -2.4, 1], [lx + 2.6, -2.6], [lx + 9.4, -1.4, 1], [lx + 6.4, -0.6, 1], [lx + 9, 0.6, 1], [lx + 5.4, 0.4, 1], [lx + 7, 1.8, 1], [lx - 1.4, 1.2, 1]], { fill: leg, w, seed: 'gull-foot' + lx });
            void back;
        }
        // the tail, black-tipped
        T.shape(g, [[-17, -22, 1], [-29, -27.4, 1], [-26, -24.6, 1], [-31, -23, 1], [-26.4, -21.4, 1], [-29, -18, 1], [-17, -17, 1]], { fill: '#2a2530', w, seed: 'gull-tail' });
        // the body: a pear, chest forward
        const body = [[-19, -20], [-12, -29], [0, -32.4], [10, -31], [15.4, -24], [14, -16.4], [6, -12.4], [-6, -12.6], [-15, -15]];
        T.shape(g, body, { fill: white, w, seed: 'gull-body' });
        T.line(g, [[3, -15.6], [6.4, -14.4]], { w: fine, seed: 'gull-b1' });
        T.line(g, [[6, -17.6], [9.4, -16.2]], { w: fine, seed: 'gull-b2' });
        // the neck and the head in one skin
        T.skin(g, [{ tube: [[8, -28], [10.6, -38], [12.4, -44]], d: 8.4, cap: 'butt' }, T.path(T.ellipse(13.6, -47.4, 8.6, 7.8, 0.1, 14), true)], { fill: white, w, seed: 'gull-head' });
        // the wing: folded along the side, three dark tips; lifted when he scolds
        g.save();
        g.translate(-3, -27);
        g.rotate(-wing * 0.9);
        T.shape(g, [[9, 1, 1], [4, -3.6], [-8, -3], [-16, 2.4, 1], [-25, 4.4, 1], [-18.4, 6.4, 1], [-23, 9.4, 1], [-15.6, 9.6, 1], [-18, 12.6, 1], [-8, 11.4], [3, 8.6]], { fill: greyW, w, seed: 'gull-wing' });
        T.shape(g, [[-16, 2.6, 1], [-25, 4.4, 1], [-18.4, 6.4, 1], [-23, 9.4, 1], [-15.6, 9.6, 1], [-18, 12.6, 1], [-12.6, 11.6, 1], [-12, 3.6, 1]], { fill: '#2a2530', w, seed: 'gull-tips' });
        for (const [fx, fy] of [[-6, 2.6], [-1, 4.6], [-7.4, 7], [3.4, 2.4]]) T.line(g, [[fx - 2, fy - 0.6], [fx, fy + 1.1], [fx + 2, fy - 0.4]], { w: fine, seed: 'gull-f' + fx });
        g.restore();
        face(g, w, fine, { look, lid, beak, chip });
        g.restore();
    }

    /**
     * Captain on the wing, seen from the side, his body's middle on (x, y), flying to screen
     * right (flip: true for left). pose: { flap (−1 down … 1 up), look, lid, beak, chip }.
     */
    function gullFly(g, x, y, s, pose = {}) {
        const { look = [0.6, 0.3], lid = 0.42, beak = 0.12, chip = true, flap = 0.6, flip = false } = pose;
        const w = T.LINE / s, fine = T.LINE_FINE / s;
        g.save();
        g.translate(x, y);
        g.scale(flip ? -s : s, s);
        g.rotate(-0.12);
        // a long narrow wing, root at the origin, pointing up: a straight leading edge, a
        // trailing edge cut into feathers, the tip dark
        const WING = [[5, 2, 1], [5.6, -14], [2, -32], [-7, -50, 1], [-7.6, -40, 1], [-13, -42, 1], [-11.4, -32, 1], [-16.4, -32.6, 1], [-13, -22, 1], [-17, -21, 1], [-12, -10], [-8, 3, 1]];
        const TIP = [[2.9, -29, 1], [-7, -50, 1], [-7.6, -40, 1], [-13, -42, 1], [-11.4, -32, 1], [-16.4, -32.6, 1], [-14.6, -27.6, 1]];
        const drawWing = (key) => {
            T.shape(g, WING, { fill: greyW, w, seed: key });
            T.shape(g, TIP, { fill: DARK, w, seed: key + 't' });
            for (const [fx, fy] of [[-3, -8], [-5, -16], [-1.6, -22], [-7.4, -24]]) T.line(g, [[fx - 2, fy - 0.8], [fx, fy + 1.2], [fx + 2, fy - 0.6]], { w: fine, seed: key + 'f' + fx });
        };
        // the far wing, behind the body
        g.save();
        g.translate(-1, -4);
        g.rotate(-0.75 - flap * 0.35);
        g.scale(0.92, 0.92);
        drawWing('gullf-far');
        g.restore();
        // the tail and the legs trailing behind
        T.shape(g, [[-15, -3, 1], [-27, -7.4, 1], [-24, -4, 1], [-30, -1.4, 1], [-24.4, 0.6, 1], [-28, 4.6, 1], [-15, 4, 1]], { fill: DARK, w, seed: 'gullf-tail' });
        for (const [lx, ly] of [[-8, 6], [-3, 7]]) {
            T.tube(g, [[lx, ly - 1], [lx - 6, ly + 4], [lx - 12, ly + 4.6]], 1.5, { fill: legC, w, seed: 'gullf-leg' + lx, cap: 'butt' });
            T.shape(g, [[lx - 11, ly + 3, 1], [lx - 18, ly + 2.4, 1], [lx - 15.6, ly + 4.4, 1], [lx - 19, ly + 5.6, 1], [lx - 15.4, ly + 6.4, 1], [lx - 17.6, ly + 8, 1], [lx - 11, ly + 6.6, 1]], { fill: legC, w, seed: 'gullf-foot' + lx });
        }
        // the body, then neck and head in one skin
        T.shape(g, [[-18, 1], [-11, -6.4], [3, -8.4], [13, -6], [17, 0], [12, 6.4], [0, 8.6], [-12, 7]], { fill: white, w, seed: 'gullf-body' });
        T.line(g, [[2, 5], [5.6, 6.2]], { w: fine, seed: 'gullf-b1' });
        T.line(g, [[6, 2.6], [9.6, 4]], { w: fine, seed: 'gullf-b2' });
        T.skin(g, [{ tube: [[11, -1], [18, -4.6], [23, -7]], d: 8.4, cap: 'butt' }, T.path(T.ellipse(25.6, -8.4, 8.6, 7.8, 0.1, 14), true)], { fill: white, w, seed: 'gullf-head' });
        g.save();
        g.translate(25.6 - 13.6, -8.4 + 47.4);
        face(g, w, fine, { look, lid, beak, chip });
        g.restore();
        // the near wing, raised over his back
        g.save();
        g.translate(3, -5);
        g.rotate(0.12 - flap * 0.4);
        drawWing('gullf-near');
        g.restore();
        g.restore();
    }

    Cast.gullFly = gullFly;
    Cast.gull = gull;
})();
