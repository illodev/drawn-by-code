// pier-pressure · Captain, the one-eyed gull who takes a cut of every bag of chips.
//   Cast.gull(g, x, y, s, pose)
(() => {
    const T = SkateToon, C = T.COL, { dot, star, plaster, lock, HAIR, SKIN } = Cast;
    const { add, sub, mul, mix, unit } = SkateKid;
    // --- Captain: the one-eyed gull who runs the harbour's chip racket -------------------------
    /**
     * pose: { look: [x, y], lid, beak (0..1 open), chip (true: a chip in the beak), wing (0..1
     * lifted), hop }. Feet on (x, y), facing screen right (flip: true for left).
     */
    function gull(g, x, y, s, pose = {}) {
        const { look = [0.5, 0.1], lid = 0.42, beak = 0.12, chip = true, wing = 0, flip = false } = pose;
        const w = T.LINE / s, fine = T.LINE_FINE / s;
        const white = '#fffdf6', greyW = '#9fb0bf', leg = '#f47c3c', bill = '#ffc928';
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
        g.restore();
    }

    Cast.gull = gull;
})();
